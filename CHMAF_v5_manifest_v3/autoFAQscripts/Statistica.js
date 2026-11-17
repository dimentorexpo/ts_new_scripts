// ============================================================================
// ⚙️ КОНФИГУРАЦИЯ
// ============================================================================
const CONFIGSTAT = {
    API: {
        BASE_URL: 'https://skyeng.autofaq.ai/api',
        OPERATOR_ACTIVITY: '/reason8/reports/operatorActivityTable',
        OPERATORS_STATS: '/operators/statistic/currentState',
        CONVERSATIONS_HISTORY: '/conversations/history',
        CONVERSATIONS: '/conversations',
        QUEUES_ARCHIVE: '/conversations/queues/archive'
    },
    SERVICE_ID: '361c681b-340a-4e47-9342-c7309e27e7b5',
    TARGET_GROUP_ID: 'c7bbb211-a217-4ed3-8112-98728dc382d8',
    PRIORITY_KBS: [120181, 121381],
    SLA_THRESHOLD_MINUTES: 25,
    ART_THRESHOLD_SECONDS: 120,
    AFRT_THRESHOLD_SECONDS: 60,
    PAGE_LIMIT: 100,
    // Сколько чатов загружаем одновременно. Раньше — строго по одному.
    CONCURRENCY: 6
};

// ============================================================================
// 🛠 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

const getDateRangeStata = (dateFromStr, dateToStr) => {
    const start = new Date(`${dateFromStr}T00:00:00.000+03:00`);
    const end = new Date(`${dateToStr}T23:59:59.999+03:00`);
    return [start.toISOString(), end.toISOString()];
};

const apiFetch = async (endpoint, body = null, method = 'GET') => {
    const url = `${CONFIGSTAT.API.BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: { 'content-type': 'application/json' },
        credentials: 'include'
    };
    if (body) options.body = typeof body === 'string' ? body : JSON.stringify(body);

    // afApiFetch (content.js) берёт csrf из cookie и повторяет запрос при 403.
    // Раньше здесь был голый fetch с aftoken, который мог быть ещё пустым.
    let r;
    if (typeof afApiFetch === 'function') {
        r = await afApiFetch(url, options);
    } else {
        options.headers['x-csrf-token'] = aftoken;
        r = await fetch(url, options);
    }
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
};

/** Обрабатывает items с ограничением числа одновременных запросов, порядок результатов сохраняется. */
async function mapWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let next = 0;
    async function runner() {
        while (next < items.length) {
            const index = next++;
            results[index] = await worker(items[index], index);
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, runner));
    return results;
}

/** Экранирование для вставки в HTML-атрибуты и разметку. */
const escapeStatHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Добавляет <style> один раз (раньше каждый запуск статистики добавлял новый тег в <head>). */
function ensureStatStyle(id, css) {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
}

/** Отдел: часть полного имени до первого «-» («ТП-Иванов Иван» → «ТП»). */
const getSectionOf = (fullName) => String(fullName ?? '').split('-')[0].trim();

// Номер текущего запуска: повторное нажатие кнопки отменяет предыдущий расчёт,
// иначе два расчёта одновременно писали в одну таблицу и обнуляли данные друг друга.
let statRunId = 0;

// Скелетон-дашборд вместо «⏳ Загрузка...»: контур будущей статистики
// (шапка, карточки метрик, строки таблицы) с shimmer-анимацией.
const showLoader = (id = 'outputstatafield', text = 'Загружаем статистику…') => {
    const el = document.getElementById(id);
    if (!el) return;

    const caption = escapeStatHtml(text);
    const card = '<div class="chmaf-skeleton" style="height:64px;border-radius:var(--radius-md)"></div>';
    const line = (w) => `<div class="chmaf-skeleton chmaf-skeleton-line" style="width:${w}%"></div>`;

    el.innerHTML = `
        <div style="padding:var(--space-lg)">
            <div class="chmaf-skeleton-row" style="margin-bottom:var(--space-lg)">
                <div class="chmaf-skeleton chmaf-skeleton-dot"></div>
                <div style="flex:1;min-width:0">${line(40)}</div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-md);margin-bottom:var(--space-xl)">
                ${card}${card}${card}${card}
            </div>
            ${line(95)}${line(88)}${line(92)}${line(70)}
            <div style="margin-top:var(--space-lg);font-size:var(--font-size-sm);color:var(--text-muted);text-align:center">${caption}</div>
        </div>`;
};

const showError = (msg, id = 'outputstatafield') => {
    const el = document.getElementById(id);
    // Экранируем внутри: тексты ошибок могут содержать данные API
    if (el) el.innerHTML = `<div style="padding:15px;color:#fca5a5">❌ ${escapeStatHtml(msg)}</div>`;
    console.error('❌', msg);
};

const adjustDate = (id, delta) => {
    const el = document.getElementById(id);
    if (!el?.value) return;
    const d = new Date(el.value);
    d.setDate(d.getDate() + delta);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    el.value = `${year}-${month}-${day}`;
};

// ============================================================================
// 🌐 ФУНКЦИИ ЗАПРОСОВ
// ============================================================================


async function fetchStaticDataStat() {
    return apiFetch(CONFIGSTAT.API.OPERATORS_STATS);
}


// ============================================================================
// 📊 getStats()
// ============================================================================

async function getStats() {
    const runId = ++statRunId;
    try {
        showLoader();
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) { progressBar.style.width = '0%'; progressBar.textContent = ''; }

        const myFullName = document.querySelector('.user_menu-dropdown-user_name')?.textContent.trim() || '';
        const opSection = getSectionOf(myFullName);
        if (!opSection) throw new Error('Не определён отдел');

        const dF = document.getElementById("dateFromStat"), dT = document.getElementById("dateToStat");
        if (!dF?.value || !dT?.value) throw new Error('Выберите даты');

        const [dateFrom, dateTo] = getDateRangeStata(dF.value, dT.value);
        console.log('📅 Запрос:', { opSection, dateFrom, dateTo });

        const [activityData, staticData] = await Promise.all([
            apiFetch(`${CONFIGSTAT.API.OPERATOR_ACTIVITY}?dateFrom=${dateFrom}&dateTo=${dateTo}`),
            fetchStaticDataStat()
        ]);
        if (runId !== statRunId) return; // запущен новый расчёт

        const rows = activityData.rows ?? activityData.data?.rows ?? activityData.result?.rows ?? [];
        if (!rows.length) { showError('📭 Нет данных за период'); return; }

        // Точное сравнение отдела. Раньше было includes(): отдел «ТП» захватывал
        // и «ТПPrem-…», «ТП2Л-…» — в таблицу попадали чужие операторы.
        const filteredOperators = rows.filter(r => getSectionOf(r.operator) === opSection).sort((a, b) => (b.conversationClosed || 0) - (a.conversationClosed || 0));
        if (!filteredOperators.length) { showError(`⚠️ Не найдено операторов "${opSection}"`); return; }

        window.activeopersId = filteredOperators.map(o => o.operatorId || o.id);

        const availableOperators = (staticData.onOperator || [])
            .filter(k => k.operator?.fullName)
            .filter(k => {
                if (getSectionOf(k.operator.fullName) !== opSection) return false;
                if (k.operator.kbs?.length) return CONFIGSTAT.PRIORITY_KBS.some(x => k.operator.kbs.includes(x));
                return true;
            })
            .map(k => ({ id: k.operator.id, fullName: k.operator.fullName }));

        const chatCountPromises = availableOperators.map(op => {
            const body = { serviceId: CONFIGSTAT.SERVICE_ID, mode: "Json", participatingOperatorsIds: [op.id], tsFrom: dateFrom, tsTo: dateTo, orderBy: "ts", orderDirection: "Asc", page: 1, limit: 1 };
            return doOperationsWithHistory(body).then(res => res.total ?? 0).catch(err => { console.warn(`⚠️ chatCount ${op.fullName}:`, err.message); return 0; });
        });

        const chatCounts = await Promise.all(chatCountPromises);
        if (runId !== statRunId) return;
        const chatCountMap = new Map(availableOperators.map((op, i) => [op.fullName, chatCounts[i]]));

        // Раньше сюда передавался отдел («ТП»), а сравнивался он с полным именем —
        // ⭐ и подсветка «это я» не срабатывали никогда.
        const rowRefs = renderStatsTable(filteredOperators, chatCountMap, myFullName);
        await getopersSLA(dateFrom, dateTo, window.activeopersId, progressBar, { rowRefs, runId });

    } catch (e) {
        if (runId !== statRunId) return;
        console.error('💥 getStats:', e);
        showError(e.message || 'Ошибка загрузки');
    }
}

// ============================================================================
// 🎨 РЕНДЕР ТАБЛИЦЫ
// ============================================================================

function renderStatsTable(operators, chatCountMap, currentOperator) {
    const table = Object.assign(document.createElement('table'), {
        id: 'tableStats',
        style: `
            table-layout: auto;
            width: 100%;
            text-align: center;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 13px;
            background: #1a2536;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(66, 104, 201, 0.2);
            animation: tableEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `
    });

    const columns = ["Оператор", "Закрыто", "Пощупано", "SLA", "AvgCSAT", "%АЗ", "AHT"];
    const colIcons = { 'Оператор': 'user', 'Закрыто': 'check', 'Пощупано': 'inbox', 'SLA': 'queue', 'AvgCSAT': 'star', '%АЗ': 'bot', 'AHT': 'timer' };
    const thInner = (t) => `<span style="display:inline-flex;align-items:center;gap:6px;">${(KCL_ICONS[colIcons[t]] || '').replace('class="kcl-ic"', 'class="kcl-ic" style="width:14px;height:14px"')}${t}</span>`;

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = `
        background: #162133;
        box-shadow: inset 0 -1px 0 #344258;
    `;

    columns.forEach((text, colIdx) => {
        const th = document.createElement('th');
        th.style.cssText = `
            padding: 14px 12px;
            border: none;
            font-weight: 700;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            font-size: 11px;
            text-shadow: none;
            position: relative;
        `;

        if (text === 'AHT') {
            th.innerHTML = `<span style="cursor:pointer;border-bottom:1px dashed #94a3b8;padding-bottom:2px;display:inline-flex;align-items:center;gap:6px;" class="aht-sort-btn" data-sort="asc" title="Сортировать по AHT">${(KCL_ICONS.timer || '').replace('class="kcl-ic"', 'class="kcl-ic" style="width:14px;height:14px"')}AHT ▲</span>`;
            th.style.cursor = 'pointer';
        } else {
            th.innerHTML = thInner(text);
        }

        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const fragment = document.createDocumentFragment();

    // Ссылки на ячейки каждого оператора. Раньше ячейки искались через
    // getElementsByName по порядку в документе: после сортировки по AHT во время
    // загрузки цифры записывались в строки других операторов.
    const rowRefs = [];

    operators.forEach((op, index) => {
        const rowRef = { name: op.operator, cells: {} };
        rowRefs.push(rowRef);

        const tr = Object.assign(document.createElement('tr'), {
            style: `
                border-bottom: 1px solid rgba(66, 104, 201, 0.1);
                transition: all 0.3s ease;
                animation: rowFadeIn 0.4s ease forwards;
                animation-delay: ${index * 0.05}s;
                opacity: 0;
            `
        });

        tr.onmouseenter = function () {
            this.style.background = 'rgba(0, 0, 0, 0.22)';
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 4px 20px rgba(66, 104, 201, 0.3)';
        };
        tr.onmouseleave = function () {
            this.style.background = '';
            this.style.transform = '';
            this.style.boxShadow = '';
        };

        const isCurrent = Boolean(currentOperator) && String(op.operator ?? '').trim() === currentOperator;
        const nameStyle = `
            text-align: left;
            padding: 12px 16px;
            font-weight: ${isCurrent ? '800' : '600'};
            color: ${isCurrent ? '#86efac' : '#e2e8f0'};
            text-shadow: ${isCurrent ? '0 0 10px rgba(134, 239, 172, 0.6), 1px 2px 5px rgba(0,0,0,0.55)' : 'none'};
            position: relative;
        `;

        const tdName = Object.assign(document.createElement('td'), { textContent: op.operator, style: nameStyle });

        if (isCurrent) {
            const badge = document.createElement('span');
            badge.textContent = '⭐';
            badge.style.cssText = `
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                font-size: 16px;
                animation: starPulse 2s ease-in-out infinite;
            `;
            tdName.style.paddingLeft = '28px';
            tdName.appendChild(badge);
        }

        tr.appendChild(tdName);

        ['chtclosed', 'chtcnt', 'sladata', 'csatdata', 'aclosedchatsdata', 'ahtdata'].forEach((attr, i) => {
            const td = document.createElement('td');
            td.style.cssText = `
                padding: 12px 10px;
                border: none;
                color: #cbd5e1;
                font-weight: 600;
            `;

            if (attr === 'chtcnt') {
                td.textContent = chatCountMap.get(op.operator) ?? 0;
                td.className = 'chtcnt';
                td.style.color = '#a9c0ff';
                td.style.textShadow = '0 0 8px rgba(66, 104, 201, 0.5)';
            } else {
                td.innerHTML = '<span style="font-size: 10px; opacity: 0.7; animation: loadingPulse 1.5s ease-in-out infinite;">⏳</span>';
                td.setAttribute('name', attr);
            }
            rowRef.cells[attr] = td;
            tr.appendChild(td);
        });

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
    table.appendChild(tbody);

    // Добавляем CSS анимации (один раз)
    ensureStatStyle('chmaf-stat-table-anim', `
        @keyframes tableEntrance {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes rowFadeIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes starPulse {
            0%, 100% { transform: translateY(-50%) scale(1); filter: brightness(1); }
            50% { transform: translateY(-50%) scale(1.2); filter: brightness(1.5); }
        }
        @keyframes loadingPulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
        }
    `);

    const output = document.getElementById('outputstatafield');
    if (output) {
        output.innerHTML = '';
        output.appendChild(table);
    }
    renderSummaryStats(operators, chatCountMap);
    return rowRefs;
}

function renderSummaryStats(operators, chatCountMap) {
    const output = document.getElementById('outputstatafield');
    if (!output) return;

    const totalTouched = operators.reduce((s, o) => s + (chatCountMap.get(o.operator) ?? 0), 0);

    const summary = Object.assign(document.createElement('div'), {
        style: `
            margin: 30px 0 0 0;
            padding: 25px;
            background: #1a2536;
            border-radius: 16px;
            border: 1px solid rgba(66, 104, 201, 0.3);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(66, 104, 201, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            animation: summaryEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards;
        `
    });

    const stats = [
        { label: 'Закрыто чатов:', value: '<span id="allChatsClsd" class="stat-loading">⏳</span>', icon: 'check', accent: '#4ade80', color: '#a9c0ff', compact: true },
        { label: 'Пощупано чатов:', value: totalTouched, icon: 'inbox', accent: '#6b8cff', color: '#a9c0ff', compact: true },
        { label: 'Средний %АЗ:', value: '<span id="avgAutoClosedGroup" class="stat-loading">⏳</span>', icon: 'bot', accent: '#38bdf8', color: '#a9c0ff', compact: true },
        { label: 'Средний CSAT:', value: '<span id="avgCsatonGroup" class="stat-loading">⏳</span>', icon: 'star', accent: '#fbbf24', color: '#a9c0ff', compact: true },
        { label: 'Средний AHT:', value: '<span id="avgAHTGroup" class="stat-loading">⏳</span>', icon: 'timer', accent: '#a78bfa', color: '#a9c0ff', compact: true },
        { label: 'Разбивка по оценкам:', value: '<span id="CSATDetails" class="stat-loading">⏳</span>', icon: 'list', accent: '#fbbf24', color: '#a9c0ff', compact: false },
        { label: 'SLA закрытия:', value: '<span id="SLAonGroup" class="stat-loading">⏳</span>', icon: 'queue', accent: '#6b8cff', color: '#a9c0ff', compact: true },
        { label: 'AFRT:', value: '<span id="AFRTGroup" class="stat-loading">⏳</span>', icon: 'zap', accent: '#fb923c', color: '#a9c0ff', compact: true },
    ];

    // Компактные карточки (2 колонки)
    const compactGrid = document.createElement('div');
    compactGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 15px;
        align-items: start;
    `;
    // Стили раскрывающейся детализации SLA / AFRT
    if (!document.getElementById('stat-more-styles')) {
        const st = document.createElement('style');
        st.id = 'stat-more-styles';
        st.textContent = `
            .stat-more { margin-top: 6px; font-size: 13px; font-weight: 500; color: #cbd5e1; text-shadow: none; }
            .stat-more > summary { cursor: pointer; list-style: none; font-size: 12px; font-weight: 600; color: #7799e2; user-select: none; }
            .stat-more > summary::-webkit-details-marker { display: none; }
            .stat-more > summary::after { content: ' ▾'; }
            .stat-more[open] > summary::after { content: ' ▴'; }
            .stat-more > summary:hover { color: #a9c0ff; }
            .stat-more-body { margin-top: 6px; padding-left: 10px; border-left: 2px solid #344258; line-height: 1.6; }
        `;
        document.head.appendChild(st);
    }

    stats.filter(s => s.compact).forEach((stat, index) => {
        const statCard = document.createElement('div');
        statCard.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 18px;
            background: rgba(0, 0, 0, 0.22);
            border-radius: 12px;
            border: 1px solid #344258;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            animation: statCardSlide 0.5s ease forwards;
            animation-delay: ${index * 0.1}s;
            opacity: 0;
            position: relative;
            overflow: hidden;
        `;

        statCard.onmouseenter = function () {
            this.style.transform = 'translateY(-1px)';
            this.style.boxShadow = '0 6px 18px rgba(3, 9, 22, 0.45)';
            this.style.borderColor = '#7799e2';
        };

        statCard.onmouseleave = function () {
            this.style.transform = '';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
            this.style.borderColor = '#344258';
        };

        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
            font-size: 36px;
            min-width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(66, 104, 201, 0.12);
            border-radius: 12px;
            border: 1px solid rgba(119, 153, 226, 0.35);
            box-shadow: none;

        `;
        iconBox.innerHTML = KCL_ICONS[stat.icon] || '';
        iconBox.style.color = stat.accent || '#a9c0ff';
        iconBox.style.background = `color-mix(in srgb, ${stat.accent || '#6b8cff'} 14%, transparent)`;
        iconBox.style.borderColor = `color-mix(in srgb, ${stat.accent || '#6b8cff'} 40%, transparent)`;
        const iconSvg = iconBox.querySelector('svg'); if (iconSvg) iconSvg.setAttribute('style', 'width:30px;height:30px');

        const contentBox = document.createElement('div');
        contentBox.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        `;

        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = `
            font-size: 13px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        labelDiv.textContent = stat.label.replace(/[📦✋🤖🌟📋🕒🚀]/g, '').trim();

        const valueDiv = document.createElement('div');
        valueDiv.style.cssText = `
            font-size: 22px;
            font-weight: 800;
            color: ${stat.color};
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            line-height: 1.2;
        `;
        valueDiv.innerHTML = typeof stat.value === 'number' ? stat.value : stat.value;

        contentBox.appendChild(labelDiv);
        contentBox.appendChild(valueDiv);

        statCard.appendChild(iconBox);
        statCard.appendChild(contentBox);

        compactGrid.appendChild(statCard);
    });

    summary.appendChild(compactGrid);

    // Полноразмерные карточки (1 колонка)
    stats.filter(s => !s.compact).forEach((stat, index) => {
        const statCard = document.createElement('div');
        statCard.style.cssText = `
            display: flex;
            align-items: flex-start;
            gap: 15px;
            padding: 18px;
            margin-bottom: 15px;
            background: rgba(0, 0, 0, 0.22);
            border-radius: 12px;
            border: 1px solid #344258;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            animation: statCardSlide 0.5s ease forwards;
            animation-delay: ${(index + 4) * 0.1}s;
            opacity: 0;
            position: relative;
            overflow: hidden;
        `;

        statCard.onmouseenter = function () {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = `0 6px 25px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(119, 153, 226, 0.35)`;
            this.style.borderColor = '#7799e2';
        };

        statCard.onmouseleave = function () {
            this.style.transform = '';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
            this.style.borderColor = '#344258';
        };

        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
            font-size: 32px;
            min-width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(66, 104, 201, 0.12);
            border-radius: 12px;
            border: 1px solid rgba(119, 153, 226, 0.35);
            box-shadow: none;

        `;
        iconBox.innerHTML = KCL_ICONS[stat.icon] || '';
        iconBox.style.color = stat.accent || '#a9c0ff';
        iconBox.style.background = `color-mix(in srgb, ${stat.accent || '#6b8cff'} 14%, transparent)`;
        iconBox.style.borderColor = `color-mix(in srgb, ${stat.accent || '#6b8cff'} 40%, transparent)`;
        const iconSvg = iconBox.querySelector('svg'); if (iconSvg) iconSvg.setAttribute('style', 'width:30px;height:30px');

        const contentBox = document.createElement('div');
        contentBox.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        `;

        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = `
            font-size: 14px;
            font-weight: 600;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        `;
        labelDiv.textContent = stat.label.replace(/[📦✋🤖🌟📋🕒🚀]/g, '').trim();

        const valueDiv = document.createElement('div');
        valueDiv.style.cssText = `
            font-size: 18px;
            font-weight: 800;
            color: ${stat.color};
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            line-height: 1.4;
        `;
        valueDiv.innerHTML = typeof stat.value === 'number' ? stat.value : stat.value;

        contentBox.appendChild(labelDiv);
        contentBox.appendChild(valueDiv);

        statCard.appendChild(iconBox);
        statCard.appendChild(contentBox);

        summary.appendChild(statCard);
    });

    // Добавляем CSS анимации (один раз)
    ensureStatStyle('chmaf-stat-summary-anim', `
        @keyframes summaryEntrance {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes statCardSlide {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .stat-loading {
            animation: loadingPulse 1.5s ease-in-out infinite;
        }
    `);

    output.appendChild(summary);
}

// ============================================================================
// 🎯 getopersSLA
// ============================================================================

async function getopersSLA(dateFrom, dateTo, operatorIds, progressBar, { rowRefs = null, runId } = {}) {
    if (!operatorIds?.length) return;

    const SLA_TARGET_PERCENT = 81;
    const AFRT_TARGET_PERCENT = 86;

    let totalChatsClosed = [], arraycsatcount = [], arraycsatsumma = [], arrayaclosedchatscount = [], operatorOverdueChats = [];
    let alloperSLAclsed = 0, alloperChatsclsed = 0, alloperaboveAFRT = 0;
    let alloperCSATsumma = 0, alloperCSATcount = 0;

    // Переменная для подсчета общего количества всех автозакрытий по отделу
    let totalGroupAutoClosed = 0;

    // Переменные для подсчета среднего AHT по отделу
    let totalGroupHandleTimeSeconds = 0;
    let totalGroupClosedChatsForAHT = 0;

    let massivchikUntarget = new Set(), massivchikTarget = new Set(), massivchikQueue = new Set();

    const legacyCells = {
        chtclosed: document.getElementsByName('chtclosed'),
        sladata: document.getElementsByName('sladata'),
        csatdata: document.getElementsByName('csatdata'),
        aclosedchatsdata: document.getElementsByName('aclosedchatsdata'),
        ahtdata: document.getElementsByName('ahtdata')
    };
    const cellsFor = (i) => rowRefs?.[i]?.cells || {
        chtclosed: legacyCells.chtclosed[i],
        sladata: legacyCells.sladata[i],
        csatdata: legacyCells.csatdata[i],
        aclosedchatsdata: legacyCells.aclosedchatsdata[i],
        ahtdata: legacyCells.ahtdata[i]
    };
    // Имя берём из данных, а не из N-й строки таблицы (после сортировки там другой оператор)
    const nameFor = (i) => rowRefs?.[i]?.name || String(operatorIds[i]);
    const isStale = () => runId !== undefined && runId !== statRunId;

    let failedChats = 0;
    let failedPages = 0;

    resetRateCounts();
    window.filteredarray = [];

    window.operatorAutoClosedDetails = {};
    window.operatorAHTDetails = {};
    window.afrtUntargetDetails = new Map();


    const step = 100 / operatorIds.length;
    let currentWidth = 0;

    /** Мини-прогресс в ячейке «Закрыто»: разметка создаётся один раз, дальше меняются ширина и текст. */
    function createCellProgress(cell) {
        if (!cell) return () => { };
        cell.innerHTML = `
            <div style="width: 60px; margin: 0 auto; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden; position: relative; height: 16px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);">
                <div data-bar style="width: 0%; height: 100%; background-color: #86efac; transition: width 0.1s ease;"></div>
                <div data-pct style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; text-align: center; font-size: 10px; color: white; line-height: 16px; font-weight: 700; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">0%</div>
            </div>`;
        const box = cell.firstElementChild;
        const bar = cell.querySelector('[data-bar]');
        const label = cell.querySelector('[data-pct]');
        return (done, total) => {
            const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
            bar.style.width = `${pct}%`;
            label.textContent = `${pct}%`;
            box.title = `Проверено: ${done} / ${total}`;
        };
    }

    for (let i = 0; i < operatorIds.length; i++) {
        if (isStale()) return;

        const cells = cellsFor(i);
        const opName = nameFor(i);

        let operclschatcount = 0, csatcount = 0, csatsumma = 0, overduecount = 0, aclschtscount = 0;
        let page = 1, maxpage = 0;
        let localAFRTUntarget = 0, localAFRTTarget = 0;

        let totalChatsForOper = 0;
        let processedChatsForOper = 0;

        let totalHandleTimeSeconds = 0;
        let closedChatsCountForAHT = 0;

        window.operatorAutoClosedDetails[i] = { inactivity: [], pause: [], totalClosed: 0 };

        // Хранилище деталей AHT для этого оператора
        let ahtChatDetails = [];

        if (!operatorIds[i]) {
            console.warn('⚠️ getopersSLA: у оператора нет ID —', opName);
            ['chtclosed', 'sladata', 'csatdata', 'aclosedchatsdata', 'ahtdata'].forEach(k => { if (cells[k]) cells[k].textContent = '-'; });
            continue;
        }

        const updateProgress = createCellProgress(cells.chtclosed);

        do {
            const bodyStr = JSON.stringify({
                serviceId: CONFIGSTAT.SERVICE_ID, mode: "Json", participatingOperatorsIds: [operatorIds[i]],
                tsFrom: dateFrom, tsTo: dateTo, orderBy: "ts", orderDirection: "Asc", page, limit: 100
            });

            let response;
            try {
                response = await doOperationsWithHistory(bodyStr);
            } catch (error) {
                console.error(`❌ ${opName}: ошибка страницы ${page}:`, error);
                failedPages++;
                break;
            }
            if (isStale()) return;
            if (!response?.items?.length) break;

            if (page === 1) totalChatsForOper = response.total || 0;

            // Чаты страницы загружаем параллельно (по CONFIGSTAT.CONCURRENCY),
            // а считаем — строго по порядку, как раньше.
            // Ошибка одного чата больше не обрывает подсчёт по оператору целиком.
            const conversations = await mapWithConcurrency(response.items, CONFIGSTAT.CONCURRENCY, async (item) => {
                try {
                    return await doOperationsWithConversations(item.conversationId);
                } catch (error) {
                    failedChats++;
                    console.warn(`⚠️ ${opName}: чат ${item.conversationId} не загрузился:`, error.message);
                    return null;
                } finally {
                    processedChatsForOper++;
                    updateProgress(processedChatsForOper, totalChatsForOper);
                }
            });
            if (isStale()) return;

            response.items.forEach((item, itemIndex) => {
                const fres = conversations[itemIndex];
                if (!fres) return;

                const messages = fres.messages || [];
                const lastMsg = messages[messages.length - 1];

                if (lastMsg?.tpe === "Question") {
                    const firstMessageTime = lastMsg.ts;
                    let groupFoundIndex = -1;

                    for (let z = messages.length - 1; z >= 0; z--) {
                        if (messages[z].payload?.prevGroup === undefined && messages[z].payload?.group === CONFIGSTAT.TARGET_GROUP_ID) {
                            groupFoundIndex = z; break;
                        }
                    }

                    if (groupFoundIndex !== -1) {
                        for (let b = groupFoundIndex; b >= 0; b--) {
                            const m = messages[b];
                            if (["AnswerOperatorWithBot", "AnswerOperator"].includes(m.tpe)) {
                                const diff = (new Date(m.ts) - new Date(firstMessageTime)) / 1000;
                                if (diff > CONFIGSTAT.AFRT_THRESHOLD_SECONDS) {
                                    massivchikUntarget.add(fres.id);
                                    localAFRTUntarget++;
                                    if (!window.afrtUntargetDetails.has(fres.id)) {
                                        window.afrtUntargetDetails.set(fres.id, {
                                            chatId: fres.id,
                                            diffSeconds: Math.round(diff),
                                            operator: opName
                                        });
                                    }
                                } else {
                                    massivchikTarget.add(fres.id);
                                    localAFRTTarget++;
                                }
                                break;
                            }
                        }
                    }
                }

                // 🎯 СТРОГАЯ ПРОВЕРКА ПО ОПЕРАТОРУ (для %АЗ, CSAT, SLA)
                if (fres.operatorId === operatorIds[i]) {
                    operclschatcount++;
                    totalChatsClosed[i] = operclschatcount;
                    window.operatorAutoClosedDetails[i].totalClosed = operclschatcount;

                    // Вычисляем автозакрытия ТОЛЬКО для чатов этого оператора
                    const autoClosedMsg = messages.find(msg => msg.eventTpe === 'CloseConversation' && msg.payload?.src && ["inactivity_timer", "pause"].includes(msg.payload.src));

                    if (autoClosedMsg) {
                        aclschtscount++;
                        arrayaclosedchatscount[i] = aclschtscount;

                        const srcReason = autoClosedMsg.payload.src;
                        if (srcReason === 'inactivity_timer') {
                            window.operatorAutoClosedDetails[i].inactivity.push(item.conversationId);
                        } else if (srcReason === 'pause') {
                            window.operatorAutoClosedDetails[i].pause.push(item.conversationId);
                        }
                    }

                    window.filteredarray.push({
                        id: "operator" + (i + 1),
                        chatHashId: item.conversationId,
                        Duration: item.stats?.conversationDuration ? (item.stats.conversationDuration / 60000).toFixed(1) : "0.0",
                        Rate: item.stats?.rate?.rate ?? null
                    });

                    if (item.stats?.rate?.rate) {
                        csatcount++; csatsumma += item.stats.rate.rate;
                        arraycsatcount[i] = csatcount; arraycsatsumma[i] = csatsumma;
                    }

                    if ((item.stats?.conversationDuration / 60000) > CONFIGSTAT.SLA_THRESHOLD_MINUTES) {
                        overduecount++; operatorOverdueChats[i] = overduecount;
                    }
                }

                // 🕒 РАСЧЁТ AHT — по аналогии с %АЗ
                // Время от последнего назначения оператора до закрытия (или выхода из группы)
                const closeEventAHT = messages.find(msg => msg.eventTpe === 'CloseConversation');
                const isClosedNotPauseAHT = closeEventAHT && (!closeEventAHT.payload?.src || closeEventAHT.payload.src !== 'pause');

                // Все назначения этого оператора (без фильтра по group — AssignToOperator может не содержать group)
                const assignEventsAHT = messages.filter(msg =>
                    msg.eventTpe === 'AssignToOperator' && msg.payload?.oid === operatorIds[i]
                );

                // Был ли чат когда-либо в нашей целевой группе
                const wasInOurGroup = fres.groupId === CONFIGSTAT.TARGET_GROUP_ID ||
                    messages.some(msg =>
                        msg.eventTpe === 'ChangeGroup' && msg.payload?.group === CONFIGSTAT.TARGET_GROUP_ID
                    );

                // Момент, когда чат покинул нашу группу (ChangeGroup → другая группа)
                const groupLeaveEvents = messages.filter(msg =>
                    msg.eventTpe === 'ChangeGroup' &&
                    msg.payload?.group && msg.payload.group !== CONFIGSTAT.TARGET_GROUP_ID
                );
                const groupTransferTime = groupLeaveEvents.length > 0
                    ? new Date(groupLeaveEvents[0].ts)
                    : null;

                if (assignEventsAHT.length > 0 && isClosedNotPauseAHT && wasInOurGroup) {
                    const lastAssignAHT = assignEventsAHT[assignEventsAHT.length - 1];
                    const startTimeAHT = new Date(lastAssignAHT.ts);
                    // Конец = минимум из (время закрытия, время выхода из группы)
                    const endTimeAHT = groupTransferTime && groupTransferTime > startTimeAHT
                        ? groupTransferTime
                        : new Date(closeEventAHT.ts);
                    const durationSecondsAHT = (endTimeAHT - startTimeAHT) / 1000;

                    if (durationSecondsAHT > 0) {
                        totalHandleTimeSeconds += durationSecondsAHT;
                        closedChatsCountForAHT++;
                        ahtChatDetails.push({
                            chatId: item.conversationId,
                            ahtSeconds: Math.round(durationSecondsAHT),
                            closedAt: closeEventAHT.ts,
                            assignedAt: lastAssignAHT.ts
                        });
                    }
                }
            });

            page++;
            maxpage = Math.ceil((response.total || 0) / 100);
        } while (page <= maxpage);

        // ОБНОВЛЕНИЕ ЯЧЕЕК ТАБЛИЦЫ
        if (cells.sladata) cells.sladata.textContent = operclschatcount > 0 ? (100 - ((operatorOverdueChats[i] || 0) / operclschatcount * 100)).toFixed(1) + '%' : '100%';
        if (cells.chtclosed) cells.chtclosed.textContent = operclschatcount > 0 ? operclschatcount : '0';
        if (cells.csatdata) cells.csatdata.textContent = (arraycsatcount[i] && arraycsatsumma[i]) ? (arraycsatsumma[i] / arraycsatcount[i]).toFixed(2) : '-';

        if (cells.aclosedchatsdata) {
            if (arrayaclosedchatscount[i] && operclschatcount > 0) {
                const pct = (arrayaclosedchatscount[i] / operclschatcount * 100).toFixed(1) + '%';

                cells.aclosedchatsdata.innerHTML = `
                    <span class="acls-popup-btn" data-opidx="${i}" data-opname="${escapeStatHtml(opName)}"
                          style="color:#86efac; cursor:pointer; border-bottom:1px dashed #86efac;"
                          title="Посмотреть детали автозакрытия">
                        ${pct}
                    </span>`;
            } else {
                cells.aclosedchatsdata.textContent = '-';
            }
        }

        // Обновление AHT
        if (cells.ahtdata) {
            if (closedChatsCountForAHT > 0) {
                const ahtValue = Math.round(totalHandleTimeSeconds / closedChatsCountForAHT);
                ahtChatDetails.sort((a, b) => a.ahtSeconds - b.ahtSeconds);
                window.operatorAHTDetails[i] = { chats: ahtChatDetails, avgAHT: ahtValue, totalClosed: closedChatsCountForAHT };
                cells.ahtdata.innerHTML = `
                    <span class="aht-popup-btn" data-opidx="${i}" data-opname="${escapeStatHtml(opName)}"
                          style="color:#fcd34d; cursor:pointer; border-bottom:1px dashed #fcd34d; font-weight:700;"
                          title="Посмотреть чаты с AHT оператора">
                        ${ahtValue}s
                    </span>`;
            } else {
                cells.ahtdata.textContent = '-';
            }
        }

        if (arraycsatcount[i] && arraycsatsumma[i]) { alloperCSATsumma += arraycsatsumma[i]; alloperCSATcount += arraycsatcount[i]; }
        if (operatorOverdueChats[i]) { alloperSLAclsed += operatorOverdueChats[i]; }
        // Фикс логики, чтобы правильно считались все закрытые чаты для отдела (а не только тех, у кого были просрочки)
        if (totalChatsClosed[i]) { alloperChatsclsed += totalChatsClosed[i]; }
        if (localAFRTUntarget || localAFRTTarget) alloperaboveAFRT += (localAFRTUntarget + localAFRTTarget);

        // Считаем общее кол-во АЗ по всем операторам
        totalGroupAutoClosed += aclschtscount;

        // Суммируем AHT по всем операторам
        totalGroupHandleTimeSeconds += totalHandleTimeSeconds;
        totalGroupClosedChatsForAHT += closedChatsCountForAHT;

        currentWidth += step;
        if (progressBar) {
            progressBar.style.width = `${currentWidth.toFixed(1)}%`;
            progressBar.textContent = `${currentWidth.toFixed(1)}%`;
        }
    }

    if (isStale()) return;

    // Подсчет оценок
    window.filteredarray.forEach(item => {
        if (item.Rate !== null) rateCounts[item.Rate] = (rateCounts[item.Rate] || 0) + 1;
    });

    const uniquedArrayAllLength = massivchikUntarget.size + massivchikTarget.size;
    const calcChatsClsContainer = alloperChatsclsed > 0 ? ((((alloperChatsclsed - alloperSLAclsed) * 100) / SLA_TARGET_PERCENT) - alloperChatsclsed).toFixed(1) : '0.0';
    const calcAFRTContainer = uniquedArrayAllLength > 0 ? (((massivchikTarget.size * 100) / AFRT_TARGET_PERCENT) - uniquedArrayAllLength).toFixed(1) : '0.0';

    // Значение пришло — снимаем «мигание загрузки» (раньше цифры мигали бесконечно)
    const set = (id, val) => { const el = document.getElementById(id); if (el) { el.textContent = val; el.classList.remove('stat-loading'); } };
    const setHTML = (id, html) => { const el = document.getElementById(id); if (el) { el.innerHTML = html; el.classList.remove('stat-loading'); } };

    set('avgCsatonGroup', alloperCSATcount > 0 ? (alloperCSATsumma / alloperCSATcount).toFixed(2) : 'N/A');
    setHTML('CSATDetails', renderCSATBreakdown(window.filteredarray));

    set('allChatsClsd', alloperChatsclsed);

    // Добавляем вычисление Среднего %АЗ по всему отделу
    const avgAclsPct = alloperChatsclsed > 0 ? ((totalGroupAutoClosed / alloperChatsclsed) * 100).toFixed(1) + '%' : '0.0%';
    setHTML('avgAutoClosedGroup', `<span style="color:#86efac; font-weight:bold;">${avgAclsPct}</span> <span style="font-size:12px;color:#aaa;">(АЗ: ${totalGroupAutoClosed} / Закрыто: ${alloperChatsclsed})</span>`);

    // Добавляем вычисление Среднего AHT по всему отделу
    const avgAHTValue = totalGroupClosedChatsForAHT > 0 ? Math.round(totalGroupHandleTimeSeconds / totalGroupClosedChatsForAHT) : 0;
    setHTML('avgAHTGroup', avgAHTValue > 0
        ? `<span style="color:#fcd34d; font-weight:bold; font-size:16px;">${avgAHTValue}s</span> <span style="font-size:11px; color:#aaa;">(${totalGroupClosedChatsForAHT} чатов)</span>`
        : '<span style="color:#64748b;">N/A</span>');

    const slaPercent = alloperChatsclsed > 0 ? ((alloperChatsclsed - alloperSLAclsed) / alloperChatsclsed * 100).toFixed(1) + '%' : '100%';
    const slaCalcColor = Number(calcChatsClsContainer) < 0 ? 'coral' : 'rgb(83, 219, 75)';
    const slaOk = parseFloat(slaPercent) >= SLA_TARGET_PERCENT;
    setHTML('SLAonGroup', `
        <span style="color:${slaOk ? '#86efac' : 'coral'}">${slaPercent}</span>
        <span style="font-size:12px;color:#aaa;font-weight:500">(${alloperChatsclsed} чатов, таргет ${SLA_TARGET_PERCENT}%)</span>
        <details class="stat-more">
            <summary>Подробнее</summary>
            <div class="stat-more-body">
                🚫 Вне таргета: <b>${alloperSLAclsed}</b><br>
                ✅ В таргете: <b>${alloperChatsclsed - alloperSLAclsed}</b><br>
                🎯 Можем позволить просрочить:
                <span style="color:${slaCalcColor}; font-weight:700">${calcChatsClsContainer}</span> чатов
            </div>
        </details>
    `);

    const afrtPercent = uniquedArrayAllLength > 0 ? ((massivchikTarget.size / uniquedArrayAllLength) * 100).toFixed(1) + '%' : '100%';
    const afrtCalcColor = Number(calcAFRTContainer) < 0 ? 'coral' : 'rgb(83, 219, 75)';
    const afrtExtra = Number(calcAFRTContainer) < 0 ? `<span> (чтобы выйти в таргет, вовремя дать ответ в: <strong style="color:coral">${Math.abs(calcAFRTContainer * 6.2).toFixed(1)}</strong> чатах)</span>` : '';
    const afrtOk = parseFloat(afrtPercent) >= AFRT_TARGET_PERCENT;
    setHTML('AFRTGroup', `
        <span style="color:${afrtOk ? '#86efac' : 'coral'}">${afrtPercent}</span>
        <span style="font-size:12px;color:#aaa;font-weight:500">(${uniquedArrayAllLength} чатов, таргет ${AFRT_TARGET_PERCENT}%)</span>
        <details class="stat-more">
            <summary>Подробнее</summary>
            <div class="stat-more-body">
                <span class="afrt-untarget-popup-btn" style="color:#fca5a5; cursor:pointer; border-bottom:1px dashed #fca5a5; font-weight:700;" title="Нажмите, чтобы посмотреть список чатов вне таргета">🚫 Вне таргета: ${massivchikUntarget.size} 📋</span><br>
                ✅ В таргете: <b>${massivchikTarget.size}</b><br>
                🎯 Можем позволить просрочить:
                <span style="color:${afrtCalcColor}; font-weight:700">${calcAFRTContainer}</span> чатов${afrtExtra}
            </div>
        </details>
    `);
    // Раньше незагрузившийся чат молча выпадал из подсчёта — цифры занижались без предупреждения
    if (failedChats || failedPages) {
        const output = document.getElementById('outputstatafield');
        const warning = document.createElement('div');
        warning.style.cssText = 'margin:12px 0 0;padding:10px 14px;border-radius:8px;background:rgba(252,211,77,0.15);border:1px solid #fcd34d;color:#fcd34d;font-weight:600;';
        warning.textContent = `⚠️ Не загрузились: чатов — ${failedChats}, страниц списка — ${failedPages}. ` +
            'Цифры могут быть занижены. Нажми «Статистика» ещё раз.';
        output?.prepend(warning);
    }
}

// ============================================================================
// 🪟 РЕНДЕР МОДАЛКИ С DRAG & DROP
// ============================================================================

function renderAclsModal(idx, opName) {
    // 1. Проверяем, есть ли данные
    const data = window.operatorAutoClosedDetails ? window.operatorAutoClosedDetails[idx] : null;
    if (!data) {
        createAndShowButton(`⚠️ Данные для оператора ${opName} не найдены — нажмите кнопку «Статистика» ещё раз`, 'warning');
        console.error("❌ Нет данных %A3 по индексу:", idx, window.operatorAutoClosedDetails);
        return;
    }

    // 2. Жестко удаляем старое окно и очищаем события, если они зависли
    const oldContainer = document.getElementById('acls-modal-container');
    if (oldContainer) oldContainer.remove();

    if (window._aclsModalCleanup) {
        document.removeEventListener('mousemove', window._aclsMouseMove);
        document.removeEventListener('mouseup', window._aclsMouseUp);
        window._aclsModalCleanup = null;
    }

    const createListHtml = (list) => {
        if (!list || list.length === 0) return '<div style="color:gray; font-size:12px; text-align:center; padding-top:10px;">Нет чатов</div>';
        return list.map(hash => `
            <div class="modal-lookchat" data-hash="${hash}" title="Нажмите, чтобы открыть чат в истории"
                 style="margin-bottom:6px; background:rgba(255,255,255,0.05); padding:6px 10px; border-radius:4px; cursor:pointer; color:#a9c0ff; font-family:monospace; font-size:13px; text-align:center; border: 1px solid transparent; transition: all 0.2s;"
                 onmouseover="if(!this.classList.contains('active-chat')){this.style.background='rgba(134,239,172,0.1)'; this.style.borderColor='#86efac'; this.style.color='#fff'}"
                 onmouseout="if(!this.classList.contains('active-chat')){this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='transparent'; this.style.color='#a9c0ff'}">
                <span style="pointer-events: none;">${hash}</span>
            </div>
        `).join('');
    };

    const overlay = document.createElement('div');
    overlay.id = 'acls-modal-container';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        zIndex: '9999999', pointerEvents: 'none' // zIndex повышен
    });

    // 3. Высчитываем стартовые позиции с защитой от улетания за экран
    let startLeft = Math.max(0, (window.innerWidth - 650) / 2);
    let startTop = Math.max(0, (window.innerHeight - 500) / 2);

    if (window.lastModalPos && typeof window.lastModalPos.left === 'number' && typeof window.lastModalPos.top === 'number' && !isNaN(window.lastModalPos.left)) {
        startLeft = Math.max(0, Math.min(window.lastModalPos.left, window.innerWidth - 650));
        startTop = Math.max(0, Math.min(window.lastModalPos.top, window.innerHeight - 200));
    }

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: 'absolute', pointerEvents: 'auto',
        backgroundColor: '#111827', border: '1px solid #344258', borderRadius: '14px',
        width: '650px', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 26px 70px rgba(3, 9, 22, 0.6)', color: '#e2e8f0',
        left: startLeft + 'px',
        top: startTop + 'px'
    });

    modal.innerHTML = `
        <div class="acls-modal-header chmaf-drag-handle" style="padding:15px 20px; border-bottom:1px solid #344258; display:flex; justify-content:space-between; align-items:flex-start; background: rgb(55 52 71); cursor:grab; border-top-left-radius:8px; border-top-right-radius:8px; user-select:none;">
            <div>
                <h3 style="margin:0; font-size:16px; font-weight:600; color:#e2e8f0;">Детали %A3: <span style="color:#86efac">${escapeStatHtml(opName)}</span></h3>
                <div style="font-size:13px; color:#aaa; margin-top:6px;">
                    Всего закрыто: <b style="color:#e2e8f0">${data.totalClosed || 0}</b> |
                    Чатов АЗ: <b style="color:#fdba74">${data.inactivity ? data.inactivity.length : 0}</b> |
                    Чатов отложек с АЗ: <b style="color:#86efac">${data.pause ? data.pause.length : 0}</b>
                </div>
            </div>
            <button id="close-acls-modal" class="af-win-btn buttonHide" style="cursor:pointer; background:transparent; border:none; color:#e2e8f0; font-size:16px;">✖</button>
        </div>
        <div style="display:flex; flex:1; overflow:hidden; padding:15px; gap:15px; background:#0f1726; border-bottom-left-radius:8px; border-bottom-right-radius:8px;">
            <!-- Колонка 1: inactivity_timer -->
            <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #344258; padding:10px; background:rgba(0,0,0,0.3);">
                    ⏳ Обычные АЗ: <span style="color:#86efac">${data.inactivity ? data.inactivity.length : 0}</span>
                </div>
                <div style="overflow-y:auto; flex:1; padding:10px;">
                    ${createListHtml(data.inactivity)}
                </div>
            </div>
            <!-- Колонка 2: pause -->
            <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #344258; padding:10px; background:rgba(0,0,0,0.3);">
                    ⏸️ Отложки с АЗ: <span style="color:#86efac">${data.pause ? data.pause.length : 0}</span>
                </div>
                <div style="overflow-y:auto; flex:1; padding:10px;">
                    ${createListHtml(data.pause)}
                </div>
            </div>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 4. Глобальные обработчики Drag & Drop
    const header = modal.querySelector('.acls-modal-header');
    let isDragging = false;
    let startX, startY;

    window._aclsMouseMove = (e) => {
        if (!isDragging) return;
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;
        const maxX = window.innerWidth - modal.offsetWidth;
        const maxY = window.innerHeight - modal.offsetHeight;
        modal.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        modal.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    };

    window._aclsMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
            const leftPos = parseInt(modal.style.left, 10);
            const topPos = parseInt(modal.style.top, 10);
            if (!isNaN(leftPos) && !isNaN(topPos)) {
                window.lastModalPos = { left: leftPos, top: topPos };
            }
        }
    };

    header.addEventListener('mousedown', (e) => {
        if (e.target.id === 'close-acls-modal') return;
        isDragging = true;
        header.style.cursor = 'grabbing';
        startX = e.clientX - modal.offsetLeft;
        startY = e.clientY - modal.offsetTop;
    });

    document.addEventListener('mousemove', window._aclsMouseMove);
    document.addEventListener('mouseup', window._aclsMouseUp);

    // 5. Правильная функция очистки
    window._aclsModalCleanup = () => {
        document.removeEventListener('mousemove', window._aclsMouseMove);
        document.removeEventListener('mouseup', window._aclsMouseUp);
        if (overlay.parentNode) overlay.remove();
        window._aclsModalCleanup = null;
    };
}

// ============================================================================
// 📊 МОДАЛКА AHT — в едином стиле с %АЗ (полный хеш чата + подсветка)
// ============================================================================

function renderAHTModal(idx, opName) {
    const data = window.operatorAHTDetails ? window.operatorAHTDetails[idx] : null;
    if (!data || !data.chats || data.chats.length === 0) {
        if (typeof createAndShowButton === 'function') {
            createAndShowButton(`⚠️ Нет данных AHT для оператора ${opName}`, 'warning');
        }
        return;
    }

    const oldContainer = document.getElementById('aht-modal-container');
    if (oldContainer) oldContainer.remove();
    if (window._ahtModalCleanup) {
        document.removeEventListener('mousemove', window._ahtMouseMove);
        document.removeEventListener('mouseup', window._ahtMouseUp);
        window._ahtModalCleanup = null;
    }

    let sortAsc = true;

    const formatTime = (sec) => {
        if (sec < 60) return sec + 'с';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m + 'м ' + s + 'с';
    };

    const getAHTColor = (sec) => {
        if (sec <= 60) return '#86efac';
        if (sec <= 120) return '#fcd34d';
        if (sec <= 300) return '#fdba74';
        return '#fca5a5';
    };

    const renderChatList = (chats) => {
        if (!chats || chats.length === 0) {
            return '<div style="color:gray; font-size:12px; text-align:center; padding-top:10px;">Нет чатов</div>';
        }
        return chats.map((c, index) => {
            const color = getAHTColor(c.ahtSeconds);
            return `
                <div class="modal-lookchat" data-hash="${c.chatId}" title="Нажмите, чтобы открыть чат в истории"
                     style="margin-bottom:6px; background:rgba(255,255,255,0.05); padding:6px 12px; border-radius:4px; cursor:pointer; color:#a9c0ff; font-family:monospace; font-size:13px; border:1px solid transparent; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center;"
                     onmouseover="if(!this.classList.contains('active-chat')){this.style.background='rgba(134,239,172,0.1)'; this.style.borderColor='#86efac'; this.style.color='#fff'}"
                     onmouseout="if(!this.classList.contains('active-chat')){this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='transparent'; this.style.color='#a9c0ff'}">
                    <span style="pointer-events:none; color:#aaa; font-size:11px; min-width:28px;">${index + 1}.</span>
                    <span style="pointer-events:none; flex:1; text-align:center;">${c.chatId}</span>
                    <span style="pointer-events:none; color:${color}; font-weight:700; min-width:75px; text-align:right;">${formatTime(c.ahtSeconds)}</span>
                </div>`;
        }).join('');
    };

    const overlay = document.createElement('div');
    overlay.id = 'aht-modal-container';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        zIndex: '9999999', pointerEvents: 'none'
    });

    let startLeft = Math.max(0, (window.innerWidth - 650) / 2);
    let startTop = Math.max(0, (window.innerHeight - 500) / 2);

    if (window.lastModalPos && typeof window.lastModalPos.left === 'number' && !isNaN(window.lastModalPos.left)) {
        startLeft = Math.max(0, Math.min(window.lastModalPos.left, window.innerWidth - 650));
        startTop = Math.max(0, Math.min(window.lastModalPos.top, window.innerHeight - 200));
    }

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: 'absolute', pointerEvents: 'auto',
        backgroundColor: '#111827', border: '1px solid #344258', borderRadius: '14px',
        width: '650px', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 26px 70px rgba(3, 9, 22, 0.6)', color: '#e2e8f0',
        left: startLeft + 'px', top: startTop + 'px'
    });

    const sortedChatsAsc = [...data.chats].sort((a, b) => a.ahtSeconds - b.ahtSeconds);

    modal.innerHTML = `
        <div class="aht-modal-header chmaf-drag-handle" style="padding:15px 20px; border-bottom:1px solid #344258; display:flex; justify-content:space-between; align-items:flex-start; background:rgb(55 52 71); cursor:grab; border-top-left-radius:8px; border-top-right-radius:8px; user-select:none;">
            <div>
                <h3 style="margin:0; font-size:16px; font-weight:600; color:#e2e8f0;">Детали AHT: <span style="color:#86efac">${escapeStatHtml(opName)}</span></h3>
                <div style="font-size:13px; color:#aaa; margin-top:6px;">
                    Средний AHT: <b style="color:#fdba74">${formatTime(data.avgAHT)}</b> |
                    Чатов в расчёте: <b style="color:#86efac">${data.totalClosed}</b>
                </div>
            </div>
            <button id="close-aht-modal" class="af-win-btn buttonHide" style="cursor:pointer; background:transparent; border:none; color:#e2e8f0; font-size:16px;">✖</button>
        </div>
        <div style="display:flex; flex:1; overflow:hidden; padding:15px; background:#0f1726; border-bottom-left-radius:8px; border-bottom-right-radius:8px;">
            <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; border-bottom:1px solid #344258; padding:10px 14px; background:rgba(0,0,0,0.3);">
                    <span>⏱ Список чатов (<span id="aht-sort-label" style="color:#86efac;">↑ по возрастанию</span>)</span>
                    <button id="aht-sort-toggle" style="background:rgba(134,239,172,0.15); border:1px solid #86efac; color:#86efac; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600;">↕ Сменить порядок</button>
                </div>
                <div id="aht-chats-list" style="overflow-y:auto; flex:1; padding:10px; max-height:55vh;">
                    ${renderChatList(sortedChatsAsc)}
                </div>
            </div>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const sortToggle = modal.querySelector('#aht-sort-toggle');
    const chatsListEl = modal.querySelector('#aht-chats-list');
    const sortLabel = modal.querySelector('#aht-sort-label');

    sortToggle.addEventListener('click', () => {
        sortAsc = !sortAsc;
        const sorted = sortAsc
            ? [...data.chats].sort((a, b) => a.ahtSeconds - b.ahtSeconds)
            : [...data.chats].sort((a, b) => b.ahtSeconds - a.ahtSeconds);
        chatsListEl.innerHTML = renderChatList(sorted);
        sortLabel.textContent = sortAsc ? '↑ по возрастанию' : '↓ по убыванию';
    });

    const header = modal.querySelector('.aht-modal-header');
    let isDragging = false, startX, startY;

    window._ahtMouseMove = (e) => {
        if (!isDragging) return;
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;
        const maxX = window.innerWidth - modal.offsetWidth;
        const maxY = window.innerHeight - modal.offsetHeight;
        modal.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        modal.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    };

    window._ahtMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
            const leftPos = parseInt(modal.style.left, 10);
            const topPos = parseInt(modal.style.top, 10);
            if (!isNaN(leftPos) && !isNaN(topPos)) {
                window.lastModalPos = { left: leftPos, top: topPos };
            }
        }
    };

    header.addEventListener('mousedown', (e) => {
        if (e.target.id === 'close-aht-modal') return;
        isDragging = true;
        header.style.cursor = 'grabbing';
        startX = e.clientX - modal.offsetLeft;
        startY = e.clientY - modal.offsetTop;
    });

    document.addEventListener('mousemove', window._ahtMouseMove);
    document.addEventListener('mouseup', window._ahtMouseUp);

    window._ahtModalCleanup = () => {
        document.removeEventListener('mousemove', window._ahtMouseMove);
        document.removeEventListener('mouseup', window._ahtMouseUp);
        if (overlay.parentNode) overlay.remove();
        window._ahtModalCleanup = null;
    };
}

// ============================================================================
// 🚀 МОДАЛКА AFRT — в едином стиле с %АЗ (полный хеш чата + подсветка)
// ============================================================================

function renderAFRTModal() {
    const list = window.afrtUntargetDetails ? Array.from(window.afrtUntargetDetails.values()) : [];
    if (!list.length) {
        if (typeof createAndShowButton === 'function') {
            createAndShowButton('⚠️ Нет чатов вне таргета по AFRT', 'warning');
        }
        return;
    }

    const oldContainer = document.getElementById('afrt-modal-container');
    if (oldContainer) oldContainer.remove();
    if (window._afrtModalCleanup) {
        document.removeEventListener('mousemove', window._afrtMouseMove);
        document.removeEventListener('mouseup', window._afrtMouseUp);
        window._afrtModalCleanup = null;
    }

    let sortAsc = false;

    const formatTime = (sec) => {
        if (sec < 60) return sec + 'с';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m + 'м ' + s + 'с';
    };

    const renderChatList = (chats) => {
        return chats.map((c, index) => `
            <div class="modal-lookchat" data-hash="${c.chatId}" title="Нажмите, чтобы открыть чат в истории"
                 style="margin-bottom:6px; background:rgba(255,255,255,0.05); padding:6px 12px; border-radius:4px; cursor:pointer; color:#a9c0ff; font-family:monospace; font-size:13px; border:1px solid transparent; transition:all 0.2s; display:flex; justify-content:space-between; align-items:center; gap:10px;"
                 onmouseover="if(!this.classList.contains('active-chat')){this.style.background='rgba(134,239,172,0.1)'; this.style.borderColor='#86efac'; this.style.color='#fff'}"
                 onmouseout="if(!this.classList.contains('active-chat')){this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='transparent'; this.style.color='#a9c0ff'}">
                <span style="pointer-events:none; color:#aaa; font-size:11px; min-width:24px;">${index + 1}.</span>
                <span style="pointer-events:none; flex:1; text-align:center;">${c.chatId}</span>
                <span style="pointer-events:none; color:#e2e8f0; font-family:sans-serif; font-size:11px; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeStatHtml(c.operator)}">${escapeStatHtml(c.operator)}</span>
                <span style="pointer-events:none; color:#fca5a5; font-weight:700; min-width:70px; text-align:right;">${formatTime(c.diffSeconds)}</span>
            </div>
        `).join('');
    };

    const overlay = document.createElement('div');
    overlay.id = 'afrt-modal-container';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        zIndex: '9999999', pointerEvents: 'none'
    });

    let startLeft = Math.max(0, (window.innerWidth - 650) / 2);
    let startTop = Math.max(0, (window.innerHeight - 500) / 2);

    if (window.lastModalPos && typeof window.lastModalPos.left === 'number' && !isNaN(window.lastModalPos.left)) {
        startLeft = Math.max(0, Math.min(window.lastModalPos.left, window.innerWidth - 650));
        startTop = Math.max(0, Math.min(window.lastModalPos.top, window.innerHeight - 200));
    }

    const modal = document.createElement('div');
    Object.assign(modal.style, {
        position: 'absolute', pointerEvents: 'auto',
        backgroundColor: '#111827', border: '1px solid #344258', borderRadius: '14px',
        width: '650px', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 26px 70px rgba(3, 9, 22, 0.6)', color: '#e2e8f0',
        left: startLeft + 'px', top: startTop + 'px'
    });

    const sortedChats = [...list].sort((a, b) => b.diffSeconds - a.diffSeconds);

    modal.innerHTML = `
        <div class="afrt-modal-header chmaf-drag-handle" style="padding:15px 20px; border-bottom:1px solid #344258; display:flex; justify-content:space-between; align-items:flex-start; background:rgb(55 52 71); cursor:grab; border-top-left-radius:8px; border-top-right-radius:8px; user-select:none;">
            <div>
                <h3 style="margin:0; font-size:16px; font-weight:600; color:#e2e8f0;">Детали AFRT вне таргета (> 60с): <span style="color:#86efac">${list.length} чатов</span></h3>
                <div style="font-size:13px; color:#aaa; margin-top:6px;">
                    Клик по хешу открывает чат в истории и подсвечивает выбранную строку
                </div>
            </div>
            <button id="close-afrt-modal" class="af-win-btn buttonHide" style="cursor:pointer; background:transparent; border:none; color:#e2e8f0; font-size:16px;">✖</button>
        </div>
        <div style="display:flex; flex:1; overflow:hidden; padding:15px; background:#0f1726; border-bottom-left-radius:8px; border-bottom-right-radius:8px;">
            <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(255,255,255,0.1); overflow:hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-weight:bold; border-bottom:1px solid #344258; padding:10px 14px; background:rgba(0,0,0,0.3); gap:8px;">
                    <span>🚫 Список чатов (<span id="afrt-sort-label" style="color:#86efac;">↓ по убыванию</span>)</span>
                    <div style="display:flex; gap:8px;">
                        <button id="afrt-copy-ids" style="background:rgba(134,239,172,0.15); border:1px solid #86efac; color:#86efac; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600;">📋 Скопировать ID</button>
                        <button id="afrt-sort-toggle" style="background:rgba(134,239,172,0.15); border:1px solid #86efac; color:#86efac; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600;">↕ Сменить порядок</button>
                    </div>
                </div>
                <div id="afrt-chats-list" style="overflow-y:auto; flex:1; padding:10px; max-height:55vh;">
                    ${renderChatList(sortedChats)}
                </div>
            </div>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const sortToggle = modal.querySelector('#afrt-sort-toggle');
    const copyBtn = modal.querySelector('#afrt-copy-ids');
    const chatsListEl = modal.querySelector('#afrt-chats-list');
    const sortLabel = modal.querySelector('#afrt-sort-label');

    sortToggle.addEventListener('click', () => {
        sortAsc = !sortAsc;
        const sorted = sortAsc
            ? [...list].sort((a, b) => a.diffSeconds - b.diffSeconds)
            : [...list].sort((a, b) => b.diffSeconds - a.diffSeconds);
        chatsListEl.innerHTML = renderChatList(sorted);
        sortLabel.textContent = sortAsc ? '↑ по возрастанию' : '↓ по убыванию';
    });

    copyBtn.addEventListener('click', () => {
        const ids = list.map(c => c.chatId).join('\n');
        navigator.clipboard.writeText(ids).then(() => {
            copyBtn.textContent = '✅ Скопировано!';
            setTimeout(() => { copyBtn.textContent = '📋 Скопировать ID'; }, 2000);
        });
    });

    const header = modal.querySelector('.afrt-modal-header');
    let isDragging = false, startX, startY;

    window._afrtMouseMove = (e) => {
        if (!isDragging) return;
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;
        const maxX = window.innerWidth - modal.offsetWidth;
        const maxY = window.innerHeight - modal.offsetHeight;
        modal.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        modal.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    };

    window._afrtMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
            const leftPos = parseInt(modal.style.left, 10);
            const topPos = parseInt(modal.style.top, 10);
            if (!isNaN(leftPos) && !isNaN(topPos)) {
                window.lastModalPos = { left: leftPos, top: topPos };
            }
        }
    };

    header.addEventListener('mousedown', (e) => {
        if (e.target.id === 'close-afrt-modal') return;
        isDragging = true;
        header.style.cursor = 'grabbing';
        startX = e.clientX - modal.offsetLeft;
        startY = e.clientY - modal.offsetTop;
    });

    document.addEventListener('mousemove', window._afrtMouseMove);
    document.addEventListener('mouseup', window._afrtMouseUp);

    window._afrtModalCleanup = () => {
        document.removeEventListener('mousemove', window._afrtMouseMove);
        document.removeEventListener('mouseup', window._afrtMouseUp);
        if (overlay.parentNode) overlay.remove();
        window._afrtModalCleanup = null;
    };
}

// ============================================================================
// 🎨 ОБЩИЕ КОМПОНЕНТЫ ДИЗАЙНА: SVG-иконки и стили карточек для вкладок статистики
// ============================================================================
const kclIc = (d) => `<svg class="kcl-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const KCL_ICONS = {
    stats: kclIc('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'),
    star: kclIc('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    user: kclIc('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    users: kclIc('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    chat: kclIc('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
    queue: kclIc('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    gauge: kclIc('<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>'),
    list: kclIc('<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>'),
    headset: kclIc('<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'),
    wrench: kclIc('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
    bot: kclIc('<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8.01" y2="16"/><line x1="16" y1="16" x2="16.01" y2="16"/>'),
    inbox: kclIc('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'),
    check: kclIc('<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),
    forward: kclIc('<circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/>'),
    eye: kclIc('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
    trash: kclIc('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>'),
    edit: kclIc('<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
    ext: kclIc('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'),
    search: kclIc('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
    warn: kclIc('<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
    alert: kclIc('<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'),
    tag: kclIc('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
    plus: kclIc('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
    refresh: kclIc('<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>'),
    timer: kclIc('<circle cx="12" cy="14" r="8"/><polyline points="12 10 12 14 14.5 15.5"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="12" y1="2" x2="12" y2="6"/>'),
    zap: kclIc('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
    smile: kclIc('<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'),
    meh: kclIc('<circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'),
    frown: kclIc('<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>')
};

const KCL_CSS = `
.kcl { --ok:#4ade80; --busy:#fbbf24; --alert:#f87171; --blue:#6b8cff; --zero:#64748b; --bg:#1a2536; --tx:#f1f5f9; --mut:#94a3b8; padding:12px; font-family:inherit; }
.kcl-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:14px; }
.kcl-card { --c:var(--blue); background:var(--bg); border:1px solid color-mix(in srgb,var(--c) 35%,transparent); border-radius:12px; padding:14px; min-height:132px; display:flex; flex-direction:column; box-shadow:0 6px 18px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05); animation:kclIn .45s ease backwards; }
.kcl-blue { --c:var(--blue); } .kcl-green { --c:var(--ok); }
.kcl-lvl-ok { --c:var(--ok); } .kcl-lvl-busy { --c:var(--busy); } .kcl-lvl-alert { --c:var(--alert); border-color:var(--alert); box-shadow:0 0 0 1px var(--alert), 0 0 20px color-mix(in srgb,var(--alert) 45%,transparent); }
.kcl-head { display:flex; align-items:center; gap:7px; color:var(--c); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; white-space:nowrap; }
.kcl-ic { width:18px; height:18px; flex:none; }
.kcl-num { font-size:34px; line-height:1.1; font-weight:800; color:var(--tx); margin-top:10px; font-variant-numeric:tabular-nums; }
.kcl-lvl-ok .kcl-num, .kcl-lvl-busy .kcl-num, .kcl-lvl-alert .kcl-num { color:var(--c); }
.kcl-num-sm { font-size:24px; margin-top:14px; }
.kcl-sub { font-size:12px; color:var(--mut); margin-top:4px; }
.kcl-split { display:flex; flex-wrap:wrap; gap:4px 8px; margin-top:auto; padding-top:10px; }
.kcl-chip { display:inline-flex; align-items:center; gap:5px; font-size:11px; font-weight:600; color:var(--mut); }
.kcl-chip i { display:inline-block; width:7px; height:15px; border-radius:5px; flex:none; background:linear-gradient(180deg,color-mix(in srgb,var(--pc,var(--zero)) 55%,#fff),var(--pc,var(--zero)) 50%,color-mix(in srgb,var(--pc,var(--zero)) 60%,#000)); box-shadow:0 0 6px color-mix(in srgb,var(--pc,var(--zero)) 55%,transparent); }
.kcl-chip.ok i { --pc:var(--ok); } .kcl-chip.busy i { --pc:var(--busy); } .kcl-chip.pause i { --pc:var(--alert); }
/* Пилюля оператора: цвет — статус (онлайн / занят / перерыв), всегда залита */
.kcl-pill { --pc:var(--zero); --fill:14%; position:relative; flex:none; width:10px; height:34px; border-radius:6px; overflow:hidden;
  background:linear-gradient(90deg,rgba(255,255,255,.10),rgba(255,255,255,.02) 45%,rgba(0,0,0,.28));
  border:1px solid color-mix(in srgb,var(--pc) 60%,transparent);
  box-shadow:0 0 10px color-mix(in srgb,var(--pc) 40%,transparent), inset 0 0 5px rgba(0,0,0,.55); }
.kcl-pill i { position:absolute; left:0; right:0; bottom:0; height:var(--fill); border-radius:0;
  background:linear-gradient(180deg,color-mix(in srgb,var(--pc) 55%,#fff) 0%,var(--pc) 45%,color-mix(in srgb,var(--pc) 55%,#000) 100%);
  box-shadow:0 0 9px var(--pc); }
.kcl-pill::after { content:''; position:absolute; top:3px; left:2px; width:2px; height:55%; border-radius:2px; background:linear-gradient(180deg,rgba(255,255,255,.6),rgba(255,255,255,0)); }
.kcl-pill.ok { --pc:var(--ok); animation:kclPillGlow 2.8s ease-in-out infinite; } .kcl-pill.busy { --pc:var(--busy); } .kcl-pill.pause { --pc:var(--alert); }
@keyframes kclPillGlow { 0%,100% { box-shadow:0 0 8px color-mix(in srgb,var(--pc) 35%,transparent), inset 0 0 5px rgba(0,0,0,.55); } 50% { box-shadow:0 0 15px color-mix(in srgb,var(--pc) 65%,transparent), inset 0 0 5px rgba(0,0,0,.55); } }
.kcl-bar, .kcl-mini { height:5px; background:rgba(255,255,255,.08); border-radius:3px; overflow:hidden; margin-top:auto; }
.kcl-bar > div { height:100%; background:var(--c); border-radius:3px; transition:width .5s ease; }
.kcl-bar { margin-top:auto; }
.kcl-pulse { width:8px; height:8px; border-radius:50%; background:var(--c); margin-left:auto; animation:kclPulse 1.4s ease-in-out infinite; }
.kcl-panel { background:var(--bg); border:1px solid rgba(107,140,255,.2); border-radius:12px; padding:14px; box-shadow:0 6px 18px rgba(0,0,0,.45); }
.kcl-panel-title { display:flex; align-items:center; gap:8px; color:#e2e8f0; font-size:14px; font-weight:700; margin-bottom:12px; }
.kcl-panel-title .kcl-ic { color:var(--blue); }
.kcl-ops { display:grid; grid-template-columns:repeat(auto-fill,minmax(250px,1fr)); gap:10px; }
.kcl-op { display:flex; align-items:center; gap:10px; background:rgba(0,0,0,.22); border:1px solid rgba(107,140,255,.16); border-radius:10px; padding:10px; animation:kclIn .35s ease backwards; transition:border-color .2s, transform .2s; }
.kcl-op:hover { border-color:rgba(107,140,255,.5); transform:translateY(-1px); }
.kcl-op-main { flex:1; min-width:0; }
.kcl-op-name { color:#e2e8f0; font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kcl-op-st { color:var(--mut); font-size:11px; margin:2px 0 6px; }
.kcl-mini { margin-top:0; height:3px; } .kcl-mini > div { height:100%; border-radius:2px; background:var(--zero); }
.kcl-mini .ok { background:var(--ok); } .kcl-mini .busy { background:var(--busy); } .kcl-mini .alert { background:var(--alert); }
.kcl-badge { --c:var(--zero); min-width:56px; text-align:center; padding:6px 10px; border-radius:10px; border:1px solid color-mix(in srgb,var(--c) 45%,transparent); background:color-mix(in srgb,var(--c) 14%,transparent); }
.kcl-badge.ok { --c:var(--ok); } .kcl-badge.busy { --c:var(--busy); } .kcl-badge.alert { --c:var(--alert); }
.kcl-badge b { display:block; font-size:18px; line-height:1; color:var(--c); font-variant-numeric:tabular-nums; }
.kcl-badge small { display:block; font-size:10px; color:var(--mut); margin-top:3px; text-transform:uppercase; }
@keyframes kclIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
@keyframes kclPulse { 0%,100% { opacity:1; box-shadow:0 0 0 0 color-mix(in srgb,var(--c) 60%,transparent); } 50% { opacity:.7; box-shadow:0 0 0 6px transparent; } }
@media (max-width:700px) { .kcl-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }

.kcl-grid.c3 { grid-template-columns:repeat(3,minmax(0,1fr)); }
.kcl-panel { margin-bottom:12px; }
.kcl-panel.warn { border-color:rgba(251,191,36,.35); } .kcl-panel.warn .kcl-panel-title .kcl-ic { color:var(--busy); }
.kcl-panel.alert { border-color:rgba(248,113,113,.4); } .kcl-panel.alert .kcl-panel-title .kcl-ic { color:var(--alert); }
.kcl-panel.ok { border-color:rgba(74,222,128,.35); } .kcl-panel.ok .kcl-panel-title .kcl-ic { color:var(--ok); }
.kcl-rates { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:10px; }
.kcl-rate { --c:var(--zero); text-align:center; padding:12px 8px; border-radius:10px; background:rgba(0,0,0,.22); border:1px solid color-mix(in srgb,var(--c) 40%,transparent); }
.kcl-rate .kcl-ic { width:26px; height:26px; color:var(--c); }
.kcl-rate b { display:block; font-size:22px; color:var(--c); margin:4px 0 2px; font-variant-numeric:tabular-nums; }
.kcl-rate small { display:block; font-size:10px; color:var(--mut); text-transform:uppercase; letter-spacing:.3px; }
.kcl-rate .kcl-mini { margin:8px 0 4px; } .kcl-rate .kcl-mini > div { background:var(--c); }
.kcl-rate { cursor:pointer; transition:transform .15s, border-color .15s; } .kcl-rate:hover, .kcl-rate.on { transform:translateY(-1px); border-color:var(--c); }
.kcl-rate em { font-style:normal; font-size:11px; color:var(--mut); }
.kcl-note { font-size:12px; color:var(--mut); margin:10px 0 0; }
.kcl-tools { display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-bottom:12px; }
.kcl-input { flex:1 1 180px; min-width:0; height:34px; padding:0 10px; color:#e2e8f0; background:#0d1625; border:1px solid #3a4961; border-radius:9px; font:inherit; font-size:13px; outline:none; }
.kcl-input:focus { border-color:#829fff; box-shadow:0 0 0 3px rgba(110,152,247,.16); }
.kcl-seg { display:inline-flex; padding:3px; background:#0d1625; border:1px solid #344258; border-radius:10px; gap:2px; }
.kcl-seg button { height:28px; padding:0 12px; color:var(--mut); background:transparent; border:0; border-radius:7px; font:inherit; font-size:12px; font-weight:600; cursor:pointer; }
.kcl-seg button.on { color:#fff; background:#4268c9; }
.kcl-btn { display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 12px; color:#dce5f5; background:#1b283c; border:1px solid #3c4d68; border-radius:9px; font:inherit; font-size:13px; font-weight:600; cursor:pointer; }
.kcl-btn:hover { background:#293b56; border-color:#7799e2; } .kcl-btn .kcl-ic { width:15px; height:15px; }
.kcl-list { display:flex; flex-direction:column; gap:6px; }
.kcl-row { display:flex; align-items:center; gap:10px; padding:9px 12px; background:rgba(0,0,0,.22); border:1px solid rgba(107,140,255,.16); border-left:3px solid var(--busy); border-radius:10px; }
.kcl-row:hover { border-color:rgba(107,140,255,.5); }
.kcl-row.mine { border-left-color:var(--ok); }
.kcl-row-main { flex:1; min-width:0; }
.kcl-link { color:#a9c0ff; font-family:'JetBrains Mono','SF Mono',monospace; font-size:12px; font-weight:600; text-decoration:none; }
.kcl-link:hover { color:#d4e0ff; text-decoration:underline; }
.kcl-snip { margin-top:2px; color:var(--mut); font-size:11px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.kcl-tag { font-size:10px; font-weight:700; text-transform:uppercase; padding:2px 6px; border-radius:6px; color:var(--ok); background:rgba(74,222,128,.12); margin-left:6px; }
.kcl-tag.dim { color:var(--mut); background:rgba(148,163,184,.12); }
.kcl-acts { display:flex; gap:4px; flex:none; }
.kcl-act { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; padding:0; color:var(--mut); background:transparent; border:1px solid transparent; border-radius:8px; cursor:pointer; text-decoration:none; }
.kcl-act:hover { color:#fff; background:#23334b; border-color:#3c4d68; } .kcl-act .kcl-ic { width:16px; height:16px; }
.kcl-fav.on { color:var(--busy); } .kcl-fav.on .kcl-ic { fill:currentColor; }
.kcl-empty { padding:24px 12px; text-align:center; color:var(--mut); font-size:13px; }
.kcl-warnbar { margin:0 0 10px; padding:9px 12px; border-radius:9px; background:rgba(251,191,36,.12); border:1px solid rgba(251,191,36,.4); color:var(--busy); font-size:12px; font-weight:600; }
.kcl-raw { background:rgba(0,0,0,.2); border-radius:8px; padding:10px; color:#cbd5e1; font-size:12px; line-height:1.7; }
.kcl-raw a { color:#a9c0ff; font-family:'JetBrains Mono',monospace; }
.kcl-ids { display:flex; flex-wrap:wrap; gap:6px 14px; }
.kcl-sec { margin-bottom:10px; padding:10px; border-radius:8px; background:rgba(0,0,0,.2); border-left:3px solid var(--c,var(--zero)); }
.kcl-sec h4 { margin:0 0 6px; font-size:12px; color:var(--c,var(--mut)); }
.kcl-tag.bad { color:var(--alert); background:rgba(248,113,113,.12); }
.kcl-tag.warn { color:var(--busy); background:rgba(251,191,36,.12); }
.kcl-row.k-sla { border-left-color:var(--alert); } .kcl-row.k-auto { border-left-color:var(--ok); }
.kcl-row.k-low { border-left-color:var(--busy); } .kcl-row.k-topic { border-left-color:var(--blue); }
.kcl-list.scroll { max-height:340px; overflow-y:auto; padding-right:4px; scrollbar-width:thin; }
.kcl-row .kcl-tag:first-of-type { margin-left:8px; }
.kcl-cols { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.kcl-colhead { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:6px 10px; border-radius:8px; font-size:12px; font-weight:700; color:var(--c); background:color-mix(in srgb,var(--c) 12%,transparent); border:1px solid color-mix(in srgb,var(--c) 30%,transparent); }
.kcl-row.compact { padding:6px 8px; gap:6px; }
.kcl-row.compact .kcl-link { display:block; font-size:11px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.kcl-row.compact .kcl-act { width:26px; height:26px; } .kcl-row.compact .kcl-act .kcl-ic { width:14px; height:14px; }
.kcl-row.compact .kcl-acts { gap:0; }
#AF_StataAF .af-tab .kcl-ic { width:15px; height:15px; }
@media (max-width:700px) { .kcl-cols { grid-template-columns:1fr; } .kcl-rates { grid-template-columns:repeat(2,minmax(0,1fr)); } .kcl-grid.c3 { grid-template-columns:repeat(2,minmax(0,1fr)); } }

`;
ensureStatStyle('kcl-css', KCL_CSS); // стили нужны сразу: иконки есть уже в панели вкладок

// ============================================================================
// ⭐ Общие хелперы разметки: оценки и списки чатов
// ============================================================================
const KCL_RATES = [
    { r: 5, icon: 'smile', label: 'Отлично', color: '#4ade80' },
    { r: 4, icon: 'smile', label: 'Хорошо', color: '#38bdf8' },
    { r: 3, icon: 'meh', label: 'Нейтрально', color: '#fbbf24' },
    { r: 2, icon: 'frown', label: 'Плохо', color: '#fb923c' },
    { r: 1, icon: 'frown', label: 'Ужасно', color: '#f87171' }
];
const KCL_ID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const kclLogsUrl = (id) => `https://skyeng.autofaq.ai/logs/${encodeURIComponent(id)}`;

function kclRatesHtml(counts, total) {
    return `<div class="kcl-rates">${KCL_RATES.map(x => {
        const n = counts[x.r] || 0;
        const pct = total > 0 ? (n * 100 / total) : 0;
        return `<div class="kcl-rate" data-kcl-rate="${x.r}" style="--c:${x.color}" title="Показать диалоги с оценкой ${x.r}">
            ${KCL_ICONS[x.icon]}
            <b>${n}</b>
            <small>${x.r} · ${x.label}</small>
            <div class="kcl-mini"><div style="width:${pct}%"></div></div>
            <em>${pct.toFixed(1).replace(/\.0$/, '')}%</em>
        </div>`;
    }).join('')}</div>`;
}

function kclIdLinks(htmlStr) {
    const ids = [...new Set(String(htmlStr || '').match(KCL_ID_RE) || [])];
    return `<div class="kcl-ids">${ids.map(id => `<a class="kcl-link" href="${kclLogsUrl(id)}" target="_blank">${escapeStatHtml(id)}</a>`).join('')}</div>`;
}



// ============================================================================
// 🪟 win_StatisticaAF (СУПЕР-ДИЗАЙН ДАШБОРДА)
// ============================================================================

var win_StatisticaAF = `
<style>
/* ============================================================================
   Статистика AutoFAQ — «corporate graphite», как Queue / ChatHistory / Userinfo.
   Все правила внутри #AF_StataAF: на другие окна стили не протекают.
   ============================================================================ */
#AF_StataAF {
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
}

#AF_StataAF #af-dashboard-wrapper,
#AF_StataAF #af-dashboard-wrapper * { box-sizing: border-box; }

#AF_StataAF #af-dashboard-wrapper {
    width: min(760px, calc(100vw - 16px));
    color: #e2e8f0;
    font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.5;
    letter-spacing: .01em;
    -webkit-font-smoothing: antialiased;
    background:
        radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
        #111827;
    border: 1px solid #344258;
    border-radius: 18px;
    box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
    overflow: hidden;
}

/* --- Шапка: ❌ слева, заголовок, 🧹 справа --- */
#AF_StataAF #stataaf_header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 18px;
    padding: 18px 0 12px;
    border-bottom: 1px solid rgba(66, 104, 201, .15);
    cursor: grab;
    user-select: none;
}

#AF_StataAF #stataaf_header:active { cursor: grabbing; }

#AF_StataAF #stataaf_header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 40%;
    height: 1px;
    background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
}

#AF_StataAF .af-title {
    flex: 1;
    min-width: 0;
    color: #fefefe;
    font-size: 15px;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
}

/* --- Кнопки --- */
#AF_StataAF .af-win-btn,
#AF_StataAF .af-nav-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: none;
    height: 34px;
    min-width: 34px;
    padding: 0 12px;
    color: #dce5f5;
    background: #1b283c;
    border: 1px solid #3c4d68;
    border-radius: 9px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
}

#AF_StataAF .af-win-btn { width: 34px; padding: 0; font-size: 15px; }

#AF_StataAF .af-win-btn:hover,
#AF_StataAF .af-nav-btn:hover {
    color: #fff;
    background: #293b56;
    border-color: #7799e2;
    transform: translateY(-1px);
}

#AF_StataAF .af-win-btn:active,
#AF_StataAF .af-nav-btn:active { transform: translateY(0) scale(.98); }

#AF_StataAF .af-win-btn:focus-visible,
#AF_StataAF .af-nav-btn:focus-visible,
#AF_StataAF .af-tab:focus-visible {
    outline: 2px solid #9ab5ff;
    outline-offset: 2px;
}

#AF_StataAF .af-win-btn.buttonHide {
    color: #ffb0be;
    background: rgba(255, 116, 140, .08);
    border-color: rgba(255, 116, 140, .3);
}

#AF_StataAF .af-win-btn.buttonHide:hover {
    background: rgba(255, 116, 140, .16);
    border-color: rgba(255, 116, 140, .55);
}

/* --- Период --- */
#AF_StataAF .af-dates-panel {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding: 14px 18px 0;
}

#AF_StataAF .af-date-group {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
}

#AF_StataAF .af-date-input {
    width: 150px;
    height: 34px;
    padding: 0 12px;
    color: #edf2fb;
    color-scheme: dark;
    background: #0d1625;
    border: 1px solid #3a4961;
    border-radius: 9px;
    outline: none;
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: none;
    transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
}

#AF_StataAF .af-date-input:focus {
    background: #142034;
    border-color: #829fff;
    box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
}

#AF_StataAF .af-nav-btns {
    display: flex;
    gap: 8px;
    margin-left: auto;
    order: 3;
}

/* --- Разделы: сегментированный переключатель --- */
#AF_StataAF .af-tabs {
    display: flex;
    gap: 4px;
    margin: 14px 18px 0;
    padding: 4px;
    background: #0d1625;
    border: 1px solid #344258;
    border-radius: 12px;
    flex-wrap: wrap;
}

#AF_StataAF .af-tab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1 1 0;
    min-width: 0;
    height: 34px;
    padding: 0 10px;
    color: #94a3b8;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 8px;
    box-shadow: none;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    text-shadow: none;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color .16s ease, color .16s ease;
}

#AF_StataAF .af-tab:hover {
    color: #fff;
    background: rgba(66, 104, 201, .16);
}

/* Глобальный .active-stat-tab из style.css (зелёная полоса) здесь заменён */
#AF_StataAF .af-tab.active-stat-tab {
    color: #fff;
    background: #4268c9;
    border: 1px solid #7293ed;
    box-shadow: 0 4px 12px rgba(58, 96, 205, .3);
    text-shadow: none;
    font-weight: 600;
}

#AF_StataAF .af-tab-icon { font-size: 14px; }

/* --- Время обновления и прогресс --- */
#AF_StataAF .af-status-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
}

#AF_StataAF .af-clock {
    flex: none;
    width: 104px;
    height: 30px;
    padding: 0 10px;
    color: #a9c0ff;
    background: #0d1625;
    border: 1px solid #344258;
    border-radius: 999px;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    -webkit-text-fill-color: #a9c0ff;
    opacity: 1;
}

#AF_StataAF .af-progress-bg {
    position: relative;
    flex: 1;
    height: 18px;
    background: #0d1625;
    border: 1px solid #344258;
    border-radius: 999px;
    overflow: hidden;
}

#AF_StataAF #progress-bar {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #4268c9;
    border-radius: inherit;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    transition: width .3s ease;
}

/* --- Рабочая область --- */
#AF_StataAF .af-content-area {
    min-height: 300px;
    max-height: 65vh;
    padding: 4px 18px 18px;
    overflow-y: auto;
    overscroll-behavior: contain;
    color: #e2e8f0;
    scrollbar-width: thin;
    scrollbar-color: rgba(66, 104, 201, .4) transparent;
}

#AF_StataAF .af-content-area::-webkit-scrollbar { width: 4px; }
#AF_StataAF .af-content-area::-webkit-scrollbar-track { background: transparent; }
#AF_StataAF .af-content-area::-webkit-scrollbar-thumb { background: rgba(66, 104, 201, .3); border-radius: 8px; }
#AF_StataAF .af-content-area::-webkit-scrollbar-thumb:hover { background: rgba(66, 104, 201, .6); }

/* --- Старые стили статистики из style.css (серо-зелёные) здесь перекрыты --- */
#AF_StataAF #stataaf_header,
#AF_StataAF .af-dates-panel,
#AF_StataAF .af-status-bar,
#AF_StataAF .af-content-area {
    background: none;
    border-top: 0;
    box-shadow: none;
}

#AF_StataAF .af-dates-panel { border-bottom: 0; justify-content: flex-start; }
#AF_StataAF .af-status-bar { border-bottom: 0; z-index: auto; }
#AF_StataAF .af-nav-btns { padding: 0; background: none; border: 0; }
#AF_StataAF .af-tab { flex-direction: row; position: static; }
#AF_StataAF .af-tab.active-stat-tab { margin-bottom: 0; padding-bottom: 0; z-index: auto; }
#AF_StataAF .af-clock,
#AF_StataAF .af-progress-bg { box-shadow: none; }
#AF_StataAF #progress-bar { text-shadow: 0 1px 2px rgba(0, 0, 0, .5); }

/* --- Таблица операторов --- */
#AF_StataAF #tableStats {
    background: #1a2536 !important;
    border: 1px solid #344258 !important;
    border-radius: 12px;
    box-shadow: none !important;
    margin-bottom: 14px;
}

#AF_StataAF #tableStats thead tr { background: #162133 !important; }

#AF_StataAF #tableStats th {
    color: #94a3b8 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: .06em;
    border-bottom: 1px solid #344258 !important;
}

#AF_StataAF #tableStats td {
    color: #e2e8f0 !important;
    border-bottom: 1px solid rgba(52, 66, 88, .6) !important;
}

#AF_StataAF #tableStats tbody tr { background: #1a2536 !important; }
#AF_StataAF #tableStats tbody tr:nth-child(even) { background: #18222f !important; }
#AF_StataAF #tableStats tbody tr:hover { background: #23334b !important; }
#AF_StataAF #tableStats tbody tr:last-child td { border-bottom: 0 !important; }

/* Своя строка — синяя полоса слева, имя акцентом */
#AF_StataAF #tableStats tbody tr:has(td > span:only-child) td:first-child,
#AF_StataAF #tableStats tbody td:first-child:has(> span) {
    color: #a9c0ff !important;
    box-shadow: inset 3px 0 0 #7799e2;
    text-shadow: none !important;
    padding-left: 30px !important;   /* место под ⭐ */
}

/* Загрузка */
#AF_StataAF #msgloader { padding: 40px 20px; text-align: center; }

#AF_StataAF #loader-text {
    margin-bottom: 12px;
    color: #a9c0ff;
    font-size: 14px;
    font-weight: 600;
}

#AF_StataAF .af-loader-track {
    width: 50%;
    height: 6px;
    margin: 0 auto;
    background: #0d1625;
    border: 1px solid #344258;
    border-radius: 999px;
    overflow: hidden;
}

#AF_StataAF #loader-progress {
    width: 0%;
    height: 100%;
    background: #4268c9;
    transition: width .2s ease;
}

@media (prefers-reduced-motion: reduce) {
    #AF_StataAF * { animation: none !important; transition: none !important; }
}
</style>

<div id="af-dashboard-wrapper">
    <!-- Шапка -->
    <div id="stataaf_header" class="chmaf-drag-handle">
        <button class="af-win-btn buttonHide" id="hidestatisticaaf" title="Скрыть окно" aria-label="Закрыть окно">❌</button>
        <div class="af-title">📊 Статистика AutoFAQ</div>
        <button class="af-win-btn" id="clearstatawindow" title="Очистить данные" aria-label="Очистить данные">🧹</button>
    </div>

    <!-- Период -->
    <div class="af-dates-panel" id="periodOfStata">
        <div class="af-date-group">
            <span>С</span>
            <input type="date" class="af-date-input" id="dateFromStat">
        </div>
        <div class="af-date-group">
            <span>По</span>
            <input type="date" class="af-date-input" id="dateToStat">
        </div>
        <div class="af-nav-btns">
            <button class="af-nav-btn" id="dayminusminus" title="Сдвинуть период на день назад">◀ День</button>
            <button class="af-nav-btn" id="dayplusplus" title="Сдвинуть период на день вперёд">День ▶</button>
        </div>
    </div>

    <!-- Разделы -->
    <div class="af-tabs">
        <button class="af-tab" id="retreivestata">${KCL_ICONS.stats} Статистика</button>
        <button class="af-tab" id="buttonMyChats">${KCL_ICONS.user} Мои чаты</button>
        <button class="af-tab" id="buttonLine2">${KCL_ICONS.forward} 2ЛТП</button>
        <button class="af-tab" id="buttonFav">${KCL_ICONS.star} Избранное</button>
        <button class="af-tab" id="buttonKCpower">${KCL_ICONS.headset} Нагрузка КЦ</button>
        <button class="af-tab" id="buttonTPpower">${KCL_ICONS.wrench} Нагрузка ТП</button>
    </div>

    <!-- Время обновления и прогресс -->
    <div class="af-status-bar">
        <input type="text" id="timeoutput" class="af-clock" disabled placeholder="--:--:--" title="Время последнего обновления">
        <div class="af-progress-bg" title="Прогресс загрузки">
            <div id="progress-bar"></div>
        </div>
    </div>

    <!-- Рабочая область -->
    <div class="af-content-area">
        <div id="msgloader" style="display:none;">
            <div id="loader-text">⏳ Анализ данных...</div>
            <div class="af-loader-track">
                <div id="loader-progress"></div>
            </div>
        </div>

        <div id="outputstatafield"></div>
        <div id="loadkctp" style="display:none; line-height: 1.6;"></div>
        <div id="mystatfield" style="display:none;"></div>
        <div id="line2field" style="display:none;"></div>
        <div id="favfield" style="display:none;"></div>
    </div>
</div>
`;

if (typeof createWindow === 'function') {
    createWindow('AF_StataAF', 'winTopStataAF', 'winLeftStataAF', win_StatisticaAF);
    if (typeof hideWindowOnDoubleClick === 'function') hideWindowOnDoubleClick('AF_StataAF');
    if (typeof hideWindowOnClick === 'function') hideWindowOnClick('AF_StataAF', 'hidestatisticaaf');
}

let activeopersId, summclsd;

// ============================================================================
// 📋 Разбивка по оценкам — карточка-распределение
// ============================================================================

const CSAT_SCALE = [
    { r: 5, emoji: '😊', name: 'Отлично', color: '#86efac' },
    { r: 4, emoji: '🙂', name: 'Хорошо', color: '#7dd3fc' },
    { r: 3, emoji: '😐', name: 'Нейтрально', color: '#fcd34d' },
    { r: 2, emoji: '😞', name: 'Плохо', color: '#fdba74' },
    { r: 1, emoji: '😡', name: 'Ужасно', color: '#fca5a5' }
];
// Цель по среднему CSAT для подсказки «сколько пятёрок не хватает». null — не показывать.
const CSAT_TARGET_AVG = 4.85;

const csatEsc = (v) => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function renderCSATBreakdown(items) {
    const rated = (items || []).filter(it => it.Rate !== null && it.Rate !== undefined);
    const byRate = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    rated.forEach(it => { if (byRate[it.Rate]) byRate[it.Rate].push(it.chatHashId); });

    const total = rated.length;
    if (!total) return '<span style="color:#64748b;">Оценок за период нет</span>';

    const sum = CSAT_SCALE.reduce((s, x) => s + x.r * byRate[x.r].length, 0);
    const avg = sum / total;
    const pct = (n) => (n * 100 / total);
    const fmtPct = (n) => pct(n).toFixed(1).replace(/\.0$/, '') + '%';
    const good = byRate[5].length + byRate[4].length;
    const bad = byRate[2].length + byRate[1].length;
    const avgColor = avg >= 4.85 ? '#86efac' : avg >= 4.5 ? '#7dd3fc' : avg >= 4 ? '#fcd34d' : '#fca5a5';

    // Сколько пятёрок подряд нужно, чтобы выйти на цель: (sum + 5x) / (total + x) >= T
    let targetHint = '';
    if (CSAT_TARGET_AVG && CSAT_TARGET_AVG < 5) {
        if (avg >= CSAT_TARGET_AVG) {
            targetHint = `<span style="color:#86efac;">🎯 Цель ${CSAT_TARGET_AVG.toFixed(2)} выполнена</span>`;
        } else {
            const need = Math.ceil((CSAT_TARGET_AVG * total - sum) / (5 - CSAT_TARGET_AVG));
            targetHint = `🎯 До ${CSAT_TARGET_AVG.toFixed(2)} не хватает <b style="color:#fcd34d;">${need}</b> пятёрок подряд`;
        }
    }

    const stacked = CSAT_SCALE.filter(x => byRate[x.r].length).map(x =>
        `<div title="${x.r} ${x.emoji} — ${byRate[x.r].length} (${fmtPct(byRate[x.r].length)})"
              style="width:${pct(byRate[x.r].length)}%;background:${x.color};min-width:3px;"></div>`).join('');

    const max = Math.max(...CSAT_SCALE.map(x => byRate[x.r].length));
    const rows = CSAT_SCALE.map(x => {
        const n = byRate[x.r].length;
        const chats = byRate[x.r].map(h => `<span class="modal-lookchat" data-hash="${csatEsc(h)}" title="Открыть чат в истории"
              style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;border-radius:6px;border:1px solid transparent;background:rgba(255,255,255,0.05);color:#a9c0ff;font:11px/1.5 monospace;cursor:pointer;">${csatEsc(h)}</span>`).join('');
        const head = `
            <span style="width:62px;display:flex;align-items:center;gap:6px;font-weight:700;color:${x.color};">${x.r} <span style="font-size:16px;">${x.emoji}</span></span>
            <span style="flex:1;height:10px;background:rgba(255,255,255,0.06);border-radius:5px;overflow:hidden;">
                <span style="display:block;height:100%;width:${max ? n * 100 / max : 0}%;background:${x.color};border-radius:5px;opacity:${n ? 0.9 : 0};transition:width .6s ease;"></span>
            </span>
            <span style="width:44px;text-align:right;font-weight:700;color:#e2e8f0;font-variant-numeric:tabular-nums;">${n}</span>
            <span style="width:52px;text-align:right;color:#94a3b8;font-size:12px;font-variant-numeric:tabular-nums;">${fmtPct(n)}</span>
            <span style="width:14px;color:#64748b;font-size:10px;">${n ? '▾' : ''}</span>`;
        const rowStyle = 'display:flex;align-items:center;gap:10px;padding:5px 8px;border-radius:8px;';
        return n
            ? `<details class="csat-row"><summary title="${x.name}: показать чаты" style="${rowStyle}cursor:pointer;list-style:none;">${head}</summary>
                   <div style="margin:4px 8px 8px 72px;max-height:140px;overflow:auto;">${chats}</div></details>`
            : `<div style="${rowStyle}opacity:0.45;">${head}</div>`;
    }).join('');

    const chip = (label, value, color, hint) => `
        <div title="${hint}" style="padding:8px 10px;border-radius:10px;background:rgba(0,0,0,0.25);border:1px solid #344258;">
            <div style="font-size:10px;color:#94a3b8;letter-spacing:0.4px;font-weight:600;">${label}</div>
            <div style="font-size:18px;font-weight:800;color:${color};font-variant-numeric:tabular-nums;">${value}</div>
        </div>`;

    return `
    <style>
        .csat-row summary::-webkit-details-marker { display:none; }
        .csat-row summary:hover { background: rgba(255,255,255,0.05); }
        .csat-row[open] summary { background: rgba(124,196,255,0.08); }
    </style>
    <div style="margin-top:8px;padding:14px;border-radius:12px;background:rgba(0,0,0,0.2);border:1px solid #344258;max-width:560px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:8px;margin-bottom:12px;">
            ${chip('Среднее', avg.toFixed(2), avgColor, 'Средняя оценка за период')}
            ${chip('Оценок', total, '#e2e8f0', 'Сколько чатов получили оценку')}
            ${chip('Хорошие 4–5', fmtPct(good), '#86efac', `${good} из ${total}`)}
            ${chip('Плохие 1–2', fmtPct(bad), bad ? '#fca5a5' : '#64748b', `${bad} из ${total}`)}
        </div>
        <div style="display:flex;height:14px;border-radius:7px;overflow:hidden;gap:2px;margin-bottom:10px;">${stacked}</div>
        <div style="display:flex;flex-direction:column;gap:2px;">${rows}</div>
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);font-size:12px;color:#94a3b8;">
            <span>${targetHint}</span>
            <span>Нажми на строку — список чатов</span>
        </div>
    </div>`;
}

let rateCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
function resetRateCounts() { rateCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; }

// ============================================================================
// 🎬 ИНИЦИАЛИЗАЦИЯ
// ============================================================================

function getbuttonGetStatButtonPress() {
    const win = document.getElementById('AF_StataAF');
    if (!win) return;
    if (win.style.display === 'none') {
        win.style.display = '';
        if (document.getElementById('idmymenu')) document.getElementById('idmymenu').style.display = 'none';
        if (document.getElementById('MainMenuBtn')) document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn');
        if (document.querySelector('.user_menu-dropdown-user_name')?.textContent.split('-')[0] === "Prem" && document.getElementById('buttonTPpower')) {
            document.getElementById('buttonTPpower').style.display = "none";
        }
    } else {
        win.style.display = 'none';
    }

    // Исправлено: получаем текущую дату с учетом локального часового пояса
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const today = now.toISOString().split('T')[0];

    const f = document.getElementById("dateFromStat"), t = document.getElementById("dateToStat");
    if (f && !f.value) f.value = today; if (t && !t.value) t.value = today;
}

// ============================================================================
// 📊 checkload
// ============================================================================

async function checkload(department, flag) {
    const time = document.getElementById("timeoutput"); if (time) time.value = new Date().toLocaleTimeString('ru-RU');KCL_TABS.forEach(id => document.getElementById(id)?.classList.remove('active-stat-tab'));

    if (flag === 'КЦ') document.getElementById('buttonKCpower')?.classList.add('active-stat-tab');
    if (flag === 'ТП') document.getElementById('buttonTPpower')?.classList.add('active-stat-tab');

    const out = document.getElementById('outputstatafield'), load = document.getElementById('loadkctp'), loader = document.getElementById('msgloader');
    if (out) out.style.display = 'none';
    ['mystatfield', 'line2field', 'favfield'].forEach(id => document.getElementById(id)?.style.setProperty('display', 'none'));
    if (load) { load.innerHTML = ''; load.style.display = ''; }
    if (loader) {
        loader.style.display = '';
        document.getElementById('loader-text').textContent = '⏳ Анализ загрузки...';
        document.getElementById('loader-progress').style.width = '100%';
    }

    try {
        const stat = await fetchStaticDataStat();
        const sec = document.querySelector('.user_menu-dropdown-user_name')?.textContent.split('-')[0];
        const deptPat = (sec === 'Prem' || sec === 'ТПPrem') ? 'Prem' : department;

        const ops = (stat.onOperator || [])
            .filter(o => o.operator?.fullName?.match(deptPat) && o.operator.status !== 'Offline')
            .map(o => ({ name: o.operator.fullName, status: { Online: '🟢', Busy: '🟡', Pause: '🔴' }[o.operator.status] || '⚪', chats: o.aCnt || 0 }))
            // Сначала онлайн, затем занят, в конце перерыв; внутри статуса — у кого меньше чатов, затем по имени
            .sort((a, b) => ({ '🟢': 0, '🟡': 1, '🔴': 2 }[a.status] ?? 3) - ({ '🟢': 0, '🟡': 1, '🔴': 2 }[b.status] ?? 3)
                || a.chats - b.chats || a.name.localeCompare(b.name, 'ru'));

        const onLine = ops.filter(o => o.status === '🟢').length, busy = ops.filter(o => o.status === '🟡').length, pause = ops.filter(o => o.status === '🔴').length;
        const totalChats = ops.reduce((s, o) => s + o.chats, 0), ratio = onLine ? totalChats / onLine : 0;
        const loadTxt = ratio <= 2.2 ? 'Низкая 🟢' : ratio <= 3.2 ? 'Средняя 🟡' : ratio <= 4.4 ? 'Высокая 🟠' : 'Критическая 🔴';
        const loadColor = ratio <= 2.2 ? '#86efac' : ratio <= 3.2 ? '#fcd34d' : ratio <= 4.4 ? '#fdba74' : '#fca5a5';

        // Очередь (чаты без оператора) по группам отдела — как в AFOperatorStatus
        const QUEUE_GROUPS = {
            'КЦ': ['b6f7f34d-2f08-fc19-3661-29ac00842898'],
            'ТП': ['c7bbb211-a217-4ed3-8112-98728dc382d8', '8266dbb1-db44-4910-8b5f-a140deeec5c0']
        };
        const queueIds = (sec === 'Prem' || sec === 'ТПPrem') ? ['c1262bdf-444a-41e1-974e-03d754dcff25'] : (QUEUE_GROUPS[flag] || []);
        const queueCnt = (stat.unAssigned || []).filter(i => queueIds.includes(i.groupId)).reduce((sum, i) => sum + Number(i.count || 0), 0);
        const queueColor = queueCnt === 0 ? '#86efac' : queueCnt <= 5 ? '#fcd34d' : '#fca5a5';

        if (load) {
            const ICONS = KCL_ICONS;
            ensureStatStyle('kcl-css', KCL_CSS);
            const stCls = { '🟢': 'ok', '🟡': 'busy', '🔴': 'pause' };
            const stTxt = { '🟢': 'Онлайн', '🟡': 'Занят', '🔴': 'Перерыв' };
            const loadLbl = loadTxt.split(' ')[0];
            const queueLvl = queueCnt === 0 ? 'ok' : queueCnt <= 5 ? 'busy' : 'alert';
            const loadLvl = ratio <= 2.2 ? 'ok' : ratio <= 4.4 ? 'busy' : 'alert';

            load.innerHTML = `
            <div class="kcl">
                <div class="kcl-grid">
                    <div class="kcl-card kcl-blue">
                        <div class="kcl-head">${ICONS.users}<span>На линии</span></div>
                        <div class="kcl-num">${ops.length}</div>
                        <div class="kcl-split">
                            <span class="kcl-chip ok"><i></i>${onLine} онлайн</span>
                            <span class="kcl-chip busy"><i></i>${busy} занят</span>
                            <span class="kcl-chip pause"><i></i>${pause} перерыв</span>
                        </div>
                    </div>
                    <div class="kcl-card kcl-green">
                        <div class="kcl-head">${ICONS.chat}<span>В работе</span></div>
                        <div class="kcl-num">${totalChats}</div>
                        <div class="kcl-sub">чатов у операторов</div>
                    </div>
                    <div class="kcl-card kcl-lvl-${queueLvl}">
                        <div class="kcl-head">${ICONS.queue}<span>В очереди</span>${queueCnt > 0 ? '<b class="kcl-pulse"></b>' : ''}</div>
                        <div class="kcl-num">${queueCnt}</div>
                        <div class="kcl-sub">${queueCnt === 0 ? 'очередь пуста' : 'ждут оператора'}</div>
                    </div>
                    <div class="kcl-card kcl-lvl-${loadLvl}">
                        <div class="kcl-head">${ICONS.gauge}<span>Нагрузка</span></div>
                        <div class="kcl-num kcl-num-sm">${loadLbl}</div>
                        <div class="kcl-sub">~ ${ratio.toFixed(1)} чат / оператор</div>
                        <div class="kcl-bar"><div style="width:${Math.min((ratio / 5) * 100, 100)}%"></div></div>
                    </div>
                </div>

                <div class="kcl-panel">
                    <div class="kcl-panel-title">${ICONS.list}<span>Детализация по операторам</span></div>
                    <div class="kcl-ops">
                        ${ops.map((o, idx) => {
                const cls = stCls[o.status] || 'unk';
                const lvl = o.chats === 0 ? 'zero' : o.chats <= 2 ? 'ok' : o.chats <= 4 ? 'busy' : 'alert';
                return `
                        <div class="kcl-op" style="animation-delay:${idx * 0.03}s">
                            <span class="kcl-pill ${cls}" style="--fill:100%" title="${stTxt[o.status] || 'Неизвестно'} · ${o.chats} чатов"><i></i></span>
                            <div class="kcl-op-main">
                                <div class="kcl-op-name" title="${escapeStatHtml(o.name)}">${escapeStatHtml(o.name)}</div>
                                <div class="kcl-op-st">${stTxt[o.status] || 'Неизвестно'}</div>
                            </div>
                            <div class="kcl-badge ${lvl}"><b>${o.chats}</b><small>чатов</small></div>
                        </div>`;
            }).join('')}
                    </div>
                </div>
            </div>
            `;
        }
    } catch (e) {
        if (load) load.innerHTML = `<span style="color:red; padding-left:50px">Ошибка: ${escapeStatHtml(e.message)}</span>`;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

// ============================================================================
// 👤 МОИ ЧАТЫ · 2ЛТП · ИЗБРАННОЕ (перенесено из Addstat.js, один модуль статистики)
// ============================================================================
const STAT_FAV_KEY = 'af_stat_favorites'; // тот же ключ, что был в Addstat.js: избранное сохраняется
let statFavs = {};
try { statFavs = JSON.parse(localStorage.getItem(STAT_FAV_KEY) || '{}') || {}; } catch (e) { statFavs = {}; }
const statFavSave = () => {
    try { localStorage.setItem(STAT_FAV_KEY, JSON.stringify(statFavs)); } catch (e) { console.warn('[Statistica] избранное не сохранилось:', e); }
};

const KCL_PANES = ['outputstatafield', 'loadkctp', 'mystatfield', 'line2field', 'favfield'];
const KCL_TABS = ['retreivestata', 'buttonMyChats', 'buttonLine2', 'buttonFav', 'buttonKCpower', 'buttonTPpower'];

function kclActivate(tabId, paneId) {
    KCL_TABS.forEach(id => document.getElementById(id)?.classList.toggle('active-stat-tab', id === tabId));
    KCL_PANES.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = id === paneId ? '' : 'none'; });
    const t = document.getElementById('timeoutput');
    if (t) t.value = new Date().toLocaleTimeString('ru-RU');
    ensureStatStyle('kcl-css', KCL_CSS);
}

// ---------- Скан архива за период: мои чаты, передачи на 2ЛТП, мои оценки ----------
const KCL_L2_MARKERS = ['техподдержка 2-я линия', 'техподдержка 2 линия', '2-я линия crm2'];
let kclScanState = { key: '', data: null, promise: null };

function kclAnalyzeChat(item, conv, res) {
    const myId = res.myId;
    let touched = false, closedByMe = false, isLine2 = false, snippet = '';

    const participants = conv.participatingOperatorsIds || item.participatingOperatorsIds || [];
    if (myId && participants.map(String).includes(myId)) touched = true;

    for (const m of (conv.messages || [])) {
        if (myId) {
            if (String(m.sender) === myId || (m.payload && (String(m.payload.sender) === myId || String(m.payload.oid) === myId))) touched = true;
            // Последнее событие закрытия решает, кто закрыл чат
            if (m.eventTpe === 'CloseConversation' || String(m.payload?.status).includes('Closed')) {
                closedByMe = String(m.payload?.sender) === myId || String(m.payload?.oid) === myId;
            }
        }
        let raw = m.txt || m.text || '';
        if (m.tpe === 'Event' && m.payload) {
            raw += ' ' + (m.payload.awakeText || '') + ' ' + (m.payload.comment || '');
            if (m.payload.status) raw += ' ' + m.payload.status;
        }
        if (!raw && m.payload) raw = JSON.stringify(m.payload);
        const clean = String(raw).replace(/<[^>]*>?/gm, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        const norm = clean.toLowerCase();
        if (KCL_L2_MARKERS.some(k => norm.includes(k))) {
            isLine2 = true;
            if (!snippet) snippet = clean.slice(0, 160);
        }
    }

    const currentOp = conv.operatorId || conv.assigneeId || item.operatorId;
    if (!closedByMe && myId && String(currentOp) === myId && touched) closedByMe = true;

    // Чаты, закрытые мной или числящиеся за мной: по ним считаем CSAT, SLA, автозакрытия, тематики
    const owned = !!myId && String(conv.operatorId) === myId;
    const mineClosed = closedByMe || owned;
    if (mineClosed) {
        res.mineTotal++;
        const auto = (conv.messages || []).find(msg => msg.eventTpe === 'CloseConversation' && ['inactivity_timer', 'pause'].includes(msg.payload?.src));
        if (auto) res.auto.push({ id: item.conversationId, src: auto.payload.src });
        const dur = (item.stats?.conversationDuration || 0) / 60000;
        if (dur > CONFIGSTAT.SLA_THRESHOLD_MINUTES) res.slaBad.push({ id: item.conversationId, min: dur, ts: item.ts });
        if (conv.payload?.topicId?.value === '') res.noTopic.push(item.conversationId);
    }

    if (touched) res.touched++;
    if (closedByMe) res.closed++;

    if (isLine2) {
        res.line2.push({ id: item.conversationId, mine: touched, snippet, ts: item.ts || item.tsCreate || null });
        if (touched) res.line2Mine++;
    }

    const rawRate = item.stats?.rate || conv.stats?.rate;
    const rate = Number(typeof rawRate === 'object' && rawRate !== null ? rawRate.rate : rawRate) || 0;
    if (rate > 0 && mineClosed && res.rates[rate] !== undefined) {
        res.byRate[rate].push({ id: item.conversationId, ts: item.ts });
        res.rates[rate]++;
        res.csatSum += rate;
        res.csatCnt++;
    }
}

async function kclScan(force = false) {
    const f = document.getElementById('dateFromStat')?.value;
    const t = document.getElementById('dateToStat')?.value;
    if (!f || !t) throw new Error('Выберите даты');
    const myId = typeof operatorId !== 'undefined' ? String(operatorId || '') : '';
    const key = `${f}|${t}|${myId}`;
    if (!force && kclScanState.key === key) {
        if (kclScanState.data) return kclScanState.data;
        if (kclScanState.promise) return kclScanState.promise;
    }

    const [from, to] = getDateRangeStata(f, t);
    const loader = document.getElementById('msgloader');
    const loaderText = document.getElementById('loader-text');
    const loaderBar = document.getElementById('loader-progress');
    if (loader) loader.style.display = '';

    const job = (async () => {
        const res = { key, myId, from: f, to: t, touched: 0, closed: 0, line2Mine: 0, rates: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, csatSum: 0, csatCnt: 0, line2: [], failed: 0, total: 0, mineTotal: 0, auto: [], slaBad: [], noTopic: [], byRate: { 1: [], 2: [], 3: [], 4: [], 5: [] } };
        let page = 1, done = 0;
        while (true) {
            const data = await apiFetch(CONFIGSTAT.API.QUEUES_ARCHIVE, {
                serviceId: CONFIGSTAT.SERVICE_ID, mode: 'Json', tsFrom: from, tsTo: to,
                orderBy: 'ts', orderDirection: 'Asc', page, limit: CONFIGSTAT.PAGE_LIMIT
            }, 'POST');
            const items = data?.items || [];
            if (!items.length) break;
            if (page === 1) res.total = data.total || items.length;

            const convs = await mapWithConcurrency(items, 12, async (item) => {
                try { return await doOperationsWithConversations(item.conversationId); }
                catch (err) { res.failed++; return null; }
                finally {
                    done++;
                    const pct = res.total ? Math.min(100, Math.round(done * 100 / res.total)) : 0;
                    if (loaderText) loaderText.textContent = `Анализ чатов: ${done} из ${res.total} (${pct}%)`;
                    if (loaderBar) loaderBar.style.width = pct + '%';
                }
            });
            items.forEach((item, i) => kclAnalyzeChat(item, convs[i] || {}, res));

            if (page * CONFIGSTAT.PAGE_LIMIT >= (data.total || 0)) break;
            page++;
        }
        res.line2.reverse(); // свежие сверху
        return res;
    })();

    kclScanState = { key, data: null, promise: job };
    try {
        const res = await job;
        kclScanState = { key, data: res, promise: null };
        return res;
    } catch (e) {
        kclScanState = { key: '', data: null, promise: null };
        throw e;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

const kclErr = (e) => `<div class="kcl"><div class="kcl-warnbar">Ошибка: ${escapeStatHtml(e.message || e)}</div></div>`;
const kclPeriod = (res) => res.from === res.to ? res.from : `${res.from} — ${res.to}`;
const kclRefreshBtn = (what) => `<button class="kcl-btn" data-kcl-refresh="${what}" title="Пересчитать за период">${KCL_ICONS.refresh}Обновить</button>`;
const kclWarnings = (res) => (!res.myId ? '<div class="kcl-warnbar">Не удалось определить ваш ID оператора: личные цифры будут нулевыми. Обновите страницу AutoFAQ.</div>' : '')
    + (res.failed ? `<div class="kcl-warnbar">Не загрузились ${res.failed} чатов, цифры могут быть занижены. Нажмите «Обновить».</div>` : '');

// Диалоги по оценкам: переключатель 5…1 и список чатов выбранной оценки
let kclRateSel = 0;
const KCL_RATE_TAG = { 5: 'good', 4: 'good', 3: 'warn', 2: 'warn', 1: 'bad' };

function kclRateSelected(res) {
    return kclRateSel && res.byRate[kclRateSel]?.length ? kclRateSel : ([1, 2, 3, 4, 5].find(n => res.byRate[n].length) || 5);
}

function kclRateListHtml(res, n) {
    const items = res.byRate[n] || [];
    if (!items.length) return `<div class="kcl-empty">Чатов с оценкой ${n} за этот период нет.</div>`;
    return kclChipList(items.map(x => ({ id: x.id, tags: [[`${n} ★`, KCL_RATE_TAG[n]], ...(kclFmtTs(x.ts) ? [[`${kclFmtTs(x.ts)} МСК`, 'dim']] : [])] })), 'low');
}

function kclRateSection(res) {
    const sel = kclRateSelected(res);
    return `<div class="kcl-seg" id="kcl-rate-seg">${[5, 4, 3, 2, 1].map(n => `<button data-kcl-rate="${n}" class="${n === sel ? 'on' : ''}">${n} ★ · ${res.byRate[n].length}</button>`).join('')}</div>
        <div id="kcl-rate-list" style="margin-top:10px">${kclRateListHtml(res, sel)}</div>`;
}

// Автозакрытые чаты: слева по таймеру неактивности, справа по отложке
function kclAutoColumns(res) {
    const col = (src, title, color) => {
        const items = res.auto.filter(x => x.src === src).map(x => ({ id: x.id }));
        return `<div><div class="kcl-colhead" style="--c:${color}"><span>${title}</span><b>${items.length}</b></div>${items.length ? kclChipList(items, 'auto', true) : '<div class="kcl-empty">Нет чатов</div>'}</div>`;
    };
    return `<div class="kcl-cols">${col('inactivity_timer', 'По таймеру', '#94a3b8')}${col('pause', 'По отложке', '#fbbf24')}</div>`;
}

// Детализация «Мои чаты»: SLA, автозакрытия, тематики и списки (перенесено из вкладки CSAT + АЗ)
function kclChipList(items, kind, compact = false) {
    const rows = items.map(x => `<div class="kcl-row k-${kind}${compact ? ' compact' : ''}">
        <div class="kcl-row-main">
            <a class="kcl-link" href="${kclLogsUrl(x.id)}" target="_blank" title="${escapeStatHtml(x.id)}">${escapeStatHtml(x.id)}</a>${(x.tags || []).map(([t, c]) => `<span class="kcl-tag ${c || 'dim'}">${escapeStatHtml(t)}</span>`).join('')}
        </div>
        <div class="kcl-acts">${kclHistBtn(x.id)}${kclExtBtn(x.id)}${kclFavBtn(x.id)}</div>
    </div>`).join('');
    return `<div class="kcl-list ${items.length > 6 ? 'scroll' : ''}">${rows}</div>`;
}

function kclMyDetails(res) {
    const slaPct = res.mineTotal ? 100 - (res.slaBad.length * 100 / res.mineTotal) : 100;
    const slaLvl = slaPct >= 95 ? 'kcl-lvl-ok' : slaPct >= 85 ? 'kcl-lvl-busy' : 'kcl-lvl-alert';
    const panel = (cls, icon, title, body) => `<div class="kcl-panel ${cls}"><div class="kcl-panel-title">${KCL_ICONS[icon]}<span>${title}</span></div>${body}</div>`;
    const csatChats = Object.values(res.byRate).some(a => a.length);
    return `<div class="kcl-grid c3" style="margin-top:12px">
            <div class="kcl-card ${slaLvl}">
                <div class="kcl-head">${KCL_ICONS.queue}<span>SLA закрытия</span></div>
                <div class="kcl-num">${slaPct.toFixed(1).replace(/\.0$/, '')}%</div>
                <div class="kcl-sub">просрочено ${res.slaBad.length} из ${res.mineTotal}</div>
            </div>
            <div class="kcl-card kcl-green">
                <div class="kcl-head">${KCL_ICONS.bot}<span>Автозакрытия</span></div>
                <div class="kcl-num">${res.auto.length}</div>
                <div class="kcl-sub">потеряшки</div>
            </div>
            <div class="kcl-card ${res.noTopic.length ? 'kcl-lvl-busy' : 'kcl-lvl-ok'}">
                <div class="kcl-head">${KCL_ICONS.tag}<span>Без тематики</span></div>
                <div class="kcl-num">${res.noTopic.length}</div>
                <div class="kcl-sub">чатов без темы</div>
            </div>
        </div>
        ${panel('', 'stats', 'Оценки моих закрытых чатов', kclRatesHtml(res.rates, res.csatCnt))}
        ${csatChats ? panel('', 'chat', 'Диалоги по оценкам', kclRateSection(res)) : ''}
        ${res.noTopic.length ? panel('warn', 'tag', 'Чаты без тематики', kclChipList(res.noTopic.map(id => ({ id })), 'topic')) : ''}
        ${res.slaBad.length ? panel('alert', 'alert', `Чаты с превышением SLA (&gt; ${CONFIGSTAT.SLA_THRESHOLD_MINUTES} минут)`, kclChipList(res.slaBad.map(x => ({ id: x.id, tags: [[`${x.min.toFixed(1)} мин`, 'bad'], ...(kclFmtTs(x.ts) ? [[`${kclFmtTs(x.ts)} МСК`, 'dim']] : [])] })), 'sla')) : ''}
        ${res.auto.length ? panel('ok', 'bot', 'Автозакрытые чаты (потеряшки)', kclAutoColumns(res)) : ''}`;
}

// ---------- Вкладка «Мои чаты» ----------
async function kclOpenMy(force = false) {
    kclActivate('buttonMyChats', 'mystatfield');
    const pane = document.getElementById('mystatfield');
    if (!pane) return;
    pane.innerHTML = '';
    try {
        const res = await kclScan(force);
        const avg = res.csatCnt ? res.csatSum / res.csatCnt : null;
        const avgLvl = avg === null ? '' : avg >= 4.5 ? 'kcl-lvl-ok' : avg >= 4 ? 'kcl-lvl-busy' : 'kcl-lvl-alert';
        pane.innerHTML = `<div class="kcl">
            ${kclWarnings(res)}
            <div class="kcl-tools"><span class="kcl-note" style="margin:0;flex:1">Мои чаты за ${escapeStatHtml(kclPeriod(res))} · всего в пуле: ${res.total}</span>${kclRefreshBtn('my')}</div>
            <div class="kcl-grid">
                <div class="kcl-card kcl-blue">
                    <div class="kcl-head">${KCL_ICONS.inbox}<span>В работе</span></div>
                    <div class="kcl-num">${res.touched}</div><div class="kcl-sub">взято мной</div>
                </div>
                <div class="kcl-card kcl-green">
                    <div class="kcl-head">${KCL_ICONS.check}<span>Закрыто</span></div>
                    <div class="kcl-num">${res.closed}</div><div class="kcl-sub">закрыто лично мной</div>
                </div>
                <div class="kcl-card kcl-lvl-busy">
                    <div class="kcl-head">${KCL_ICONS.forward}<span>На 2ЛТП</span></div>
                    <div class="kcl-num">${res.line2Mine}</div><div class="kcl-sub">передано мной</div>
                </div>
                <div class="kcl-card ${avgLvl}">
                    <div class="kcl-head">${KCL_ICONS.star}<span>Мой CSAT</span></div>
                    <div class="kcl-num">${avg === null ? '—' : avg.toFixed(2)}</div><div class="kcl-sub">оценок: ${res.csatCnt}</div>
                </div>
            </div>
            ${kclMyDetails(res)}
        </div>`;
    } catch (e) {
        console.error('❌ Мои чаты:', e);
        pane.innerHTML = kclErr(e);
    }
}

// ---------- Вкладка «2ЛТП»: передачи и поиск ----------
let kclL2Scope = 'mine';

const kclFavBtn = (id) => `<button class="kcl-act kcl-fav ${statFavs[id] ? 'on' : ''}" data-kcl-fav="${escapeStatHtml(id)}" title="${statFavs[id] ? 'Убрать из избранного' : 'В избранное'}">${KCL_ICONS.star}</button>`;
const kclHistBtn = (id) => `<button class="kcl-act" data-kcl-hist="${escapeStatHtml(id)}" title="История чата">${KCL_ICONS.eye}</button>`;
const kclExtBtn = (id) => `<a class="kcl-act" href="${kclLogsUrl(id)}" target="_blank" title="Открыть в AutoFAQ">${KCL_ICONS.ext}</a>`;

function kclParseTs(ts) {
    const clean = typeof ts === 'string' ? ts.split(/\[UTC\]|\[GMT\]/)[0].trim() : ts;
    let d = new Date(typeof clean === 'string' ? clean.replace(' ', 'T') + 'Z' : clean);
    if (isNaN(d.getTime())) d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
}

function kclFmtTs(ts) {
    const d = ts ? kclParseTs(ts) : null;
    return d ? new Intl.DateTimeFormat('ru-RU', { timeZone: 'Europe/Moscow', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d) : '';
}

async function kclOpenLine2(force = false) {
    kclActivate('buttonLine2', 'line2field');
    const pane = document.getElementById('line2field');
    if (!pane) return;
    pane.innerHTML = '';
    try {
        const res = await kclScan(force);
        pane.innerHTML = `<div class="kcl">
            ${kclWarnings(res)}
            <div class="kcl-tools">
                <div class="kcl-seg">
                    <button data-kcl-scope="mine" class="${kclL2Scope === 'mine' ? 'on' : ''}">Мои</button>
                    <button data-kcl-scope="all" class="${kclL2Scope === 'all' ? 'on' : ''}">Все</button>
                </div>
                <input class="kcl-input" id="kcl-l2-q" placeholder="Поиск по ID или тексту передачи" autocomplete="off">
                ${kclRefreshBtn('line2')}
            </div>
            <div class="kcl-note" id="kcl-l2-count" style="margin:0 0 8px"></div>
            <div class="kcl-list" id="kcl-l2-list"></div>
        </div>`;
        kclFillLine2();
    } catch (e) {
        console.error('❌ 2ЛТП:', e);
        pane.innerHTML = kclErr(e);
    }
}

function kclFillLine2() {
    const list = document.getElementById('kcl-l2-list');
    const res = kclScanState.data;
    if (!list || !res) return;
    const q = (document.getElementById('kcl-l2-q')?.value || '').trim().toLowerCase();
    const rows = res.line2.filter(x => (kclL2Scope === 'all' || x.mine) && (!q || x.id.toLowerCase().includes(q) || (x.snippet || '').toLowerCase().includes(q) || (statFavs[x.id]?.comment || '').toLowerCase().includes(q)));
    const count = document.getElementById('kcl-l2-count');
    if (count) count.textContent = `Найдено передач на 2ЛТП: ${rows.length} (${kclL2Scope === 'mine' ? 'только мои' : 'все операторы'}) · ${kclPeriod(res)}`;
    list.innerHTML = rows.length ? rows.map(x => `<div class="kcl-row ${x.mine ? 'mine' : ''}">
        <div class="kcl-row-main">
            <a class="kcl-link" href="${kclLogsUrl(x.id)}" target="_blank">${escapeStatHtml(x.id)}</a>
            ${x.mine ? '<span class="kcl-tag">мой</span>' : ''}${kclFmtTs(x.ts) ? `<span class="kcl-tag dim">${kclFmtTs(x.ts)}</span>` : ''}
            ${x.snippet ? `<div class="kcl-snip" title="${escapeStatHtml(x.snippet)}">${escapeStatHtml(x.snippet)}</div>` : ''}
        </div>
        <div class="kcl-acts">${kclHistBtn(x.id)}${kclExtBtn(x.id)}${kclFavBtn(x.id)}</div>
    </div>`).join('') : '<div class="kcl-empty">Передач на 2ЛТП за этот период не найдено.</div>';
}

// ---------- Вкладка «Избранное» ----------
function kclOpenFav() {
    kclActivate('buttonFav', 'favfield');
    const pane = document.getElementById('favfield');
    if (!pane) return;
    pane.innerHTML = `<div class="kcl">
        <div class="kcl-tools">
            <input class="kcl-input" id="kcl-fav-q" placeholder="Поиск по ID или заметке" autocomplete="off">
        </div>
        <div class="kcl-tools">
            <input class="kcl-input" id="kcl-fav-id" placeholder="Добавить чат по ID" autocomplete="off">
            <button class="kcl-btn" data-kcl-favadd="1">${KCL_ICONS.plus}Добавить</button>
        </div>
        <div class="kcl-note" id="kcl-fav-count" style="margin:0 0 8px"></div>
        <div class="kcl-list" id="kcl-fav-list"></div>
    </div>`;
    kclFillFav();
}

function kclFillFav() {
    const list = document.getElementById('kcl-fav-list');
    if (!list) return;
    const q = (document.getElementById('kcl-fav-q')?.value || '').trim().toLowerCase();
    const ids = Object.keys(statFavs).filter(id => !q || id.toLowerCase().includes(q) || String(statFavs[id]?.comment || '').toLowerCase().includes(q));
    const count = document.getElementById('kcl-fav-count');
    if (count) count.textContent = `В избранном: ${ids.length} из ${Object.keys(statFavs).length}`;
    list.innerHTML = ids.length ? ids.map(id => `<div class="kcl-row mine">
        <div class="kcl-row-main">
            <a class="kcl-link" href="${kclLogsUrl(id)}" target="_blank">${escapeStatHtml(id)}</a>
            ${statFavs[id]?.date ? `<span class="kcl-tag dim">${escapeStatHtml(statFavs[id].date)}</span>` : ''}
            <div class="kcl-snip" title="${escapeStatHtml(statFavs[id]?.comment)}">${escapeStatHtml(statFavs[id]?.comment)}</div>
        </div>
        <div class="kcl-acts">${kclHistBtn(id)}${kclExtBtn(id)}
            <button class="kcl-act" data-kcl-edit="${escapeStatHtml(id)}" title="Изменить заметку">${KCL_ICONS.edit}</button>
            <button class="kcl-act" data-kcl-del="${escapeStatHtml(id)}" title="Удалить из избранного">${KCL_ICONS.trash}</button>
        </div>
    </div>`).join('') : '<div class="kcl-empty">Избранных чатов нет. Добавьте их звёздочкой во вкладке «2ЛТП» или по ID выше.</div>';
}

const kclAskNote = async (value, okText) => {
    if (window.chmafDialog?.prompt) {
        return chmafDialog.prompt({ title: 'Заметка к чату', label: 'Введите заметку:', value, okText });
    }
    return value;
};

function kclSyncFav(id) {
    document.querySelectorAll('[data-kcl-fav]').forEach(b => {
        if (b.dataset.kclFav === id) { b.classList.toggle('on', !!statFavs[id]); b.title = statFavs[id] ? 'Убрать из избранного' : 'В избранное'; }
    });
    if (document.getElementById('favfield')?.style.display !== 'none') kclFillFav();
}

async function kclToggleFav(id) {
    if (statFavs[id]) {
        delete statFavs[id];
    } else {
        const note = await kclAskNote('На контроле (2ЛТП)', 'Добавить');
        if (note === null || note === undefined) return;
        statFavs[id] = { comment: note || 'Без комментария', date: new Date().toLocaleDateString('ru-RU') };
    }
    statFavSave();
    kclSyncFav(id);
}

function kclOpenHistory(id) {
    const chatHisWin = document.getElementById('AF_ChatHis');
    if (chatHisWin && getComputedStyle(chatHisWin).display === 'none') document.getElementById('opennewcat')?.click();
    const hashInput = document.getElementById('hashchathis');
    if (hashInput) hashInput.value = id;
    document.getElementById('btn_search_history')?.click();
}

// ---------- Обработчики модуля ----------
document.addEventListener('click', async (e) => {
    const win = e.target.closest('#AF_StataAF');
    if (!win) return;

    const tab = e.target.closest('#buttonMyChats, #buttonLine2, #buttonFav');
    if (tab) {
        if (tab.id === 'buttonMyChats') kclOpenMy();
        else if (tab.id === 'buttonLine2') kclOpenLine2();
        else kclOpenFav();
        return;
    }

    const favBtn = e.target.closest('[data-kcl-fav]');
    if (favBtn) { e.preventDefault(); kclToggleFav(favBtn.dataset.kclFav); return; }

    const histBtn = e.target.closest('[data-kcl-hist]');
    if (histBtn) { e.preventDefault(); kclOpenHistory(histBtn.dataset.kclHist); return; }

    const delBtn = e.target.closest('[data-kcl-del]');
    if (delBtn) {
        delete statFavs[delBtn.dataset.kclDel];
        statFavSave();
        kclSyncFav(delBtn.dataset.kclDel);
        return;
    }

    const editBtn = e.target.closest('[data-kcl-edit]');
    if (editBtn) {
        const id = editBtn.dataset.kclEdit;
        const note = await kclAskNote(statFavs[id]?.comment || '', 'Сохранить');
        if (note === null || note === undefined || !statFavs[id]) return;
        statFavs[id].comment = note || 'Без комментария';
        statFavSave();
        kclFillFav();
        return;
    }

    if (e.target.closest('[data-kcl-favadd]')) {
        const input = document.getElementById('kcl-fav-id');
        const id = (input?.value || '').trim();
        if (id.length < 6 || statFavs[id]) { if (input) input.focus(); return; }
        const note = await kclAskNote('На контроле', 'Добавить');
        if (note === null || note === undefined) return;
        statFavs[id] = { comment: note || 'Без комментария', date: new Date().toLocaleDateString('ru-RU') };
        statFavSave();
        if (input) input.value = '';
        kclFillFav();
        return;
    }

    const rateBtn = e.target.closest('[data-kcl-rate]');
    if (rateBtn && kclScanState.data) {
        kclRateSel = Number(rateBtn.dataset.kclRate);
        win.querySelectorAll('[data-kcl-rate]').forEach(b => b.classList.toggle('on', Number(b.dataset.kclRate) === kclRateSel));
        const list = document.getElementById('kcl-rate-list');
        if (list) list.innerHTML = kclRateListHtml(kclScanState.data, kclRateSel);
        document.getElementById('kcl-rate-seg')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        return;
    }

    const scopeBtn = e.target.closest('[data-kcl-scope]');
    if (scopeBtn) {
        kclL2Scope = scopeBtn.dataset.kclScope;
        win.querySelectorAll('[data-kcl-scope]').forEach(b => b.classList.toggle('on', b === scopeBtn));
        kclFillLine2();
        return;
    }

    const refresh = e.target.closest('[data-kcl-refresh]');
    if (refresh) {
        if (refresh.dataset.kclRefresh === 'my') kclOpenMy(true); else kclOpenLine2(true);
    }
});

document.addEventListener('input', (e) => {
    if (e.target.id === 'kcl-l2-q') kclFillLine2();
    else if (e.target.id === 'kcl-fav-q') kclFillFav();
});


// ============================================================================
// 🎯 ГЛОБАЛЬНЫЙ ДЕЛЕГАТОР СОБЫТИЙ
// ============================================================================
document.addEventListener('click', (e) => {

    // 1. Открытие модалки по автозакрытым чатам (%A3)
    const popupBtn = e.target.closest('.acls-popup-btn');
    if (popupBtn) {
        const idx = popupBtn.getAttribute('data-opidx');
        const opName = popupBtn.getAttribute('data-opname');
        renderAclsModal(idx, opName);
        return;
    }

    // 1.5. Открытие модалки по AHT оператора
    const ahtBtn = e.target.closest('.aht-popup-btn');
    if (ahtBtn) {
        const idx = ahtBtn.getAttribute('data-opidx');
        const opName = ahtBtn.getAttribute('data-opname');
        renderAHTModal(idx, opName);
        return;
    }

    // 1.6. Сортировка AHT в таблице
    const ahtSortBtn = e.target.closest('.aht-sort-btn');
    if (ahtSortBtn) {
        const currentSort = ahtSortBtn.getAttribute('data-sort');
        const newSort = currentSort === 'asc' ? 'desc' : 'asc';
        ahtSortBtn.setAttribute('data-sort', newSort);
        ahtSortBtn.innerHTML = `${(KCL_ICONS.timer || '').replace('class="kcl-ic"', 'class="kcl-ic" style="width:14px;height:14px"')}${newSort === 'asc' ? 'AHT ▲' : 'AHT ▼'}`;

        const table = document.getElementById('tableStats');
        if (!table) return;

        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        rows.sort((a, b) => {
            const ahtA = a.querySelector('[name="ahtdata"]')?.textContent || '-';
            const ahtB = b.querySelector('[name="ahtdata"]')?.textContent || '-';
            const valA = ahtA === '-' ? -1 : parseInt(ahtA);
            const valB = ahtB === '-' ? -1 : parseInt(ahtB);
            return newSort === 'asc' ? valA - valB : valB - valA;
        });

        rows.forEach(row => tbody.appendChild(row));
        return;
    }

    // Открытие модалки по AFRT вне таргета
    if (e.target.closest('.afrt-untarget-popup-btn')) {
        renderAFRTModal();
        return;
    }

    // Закрытие модалки AFRT
    if (e.target.closest('#close-afrt-modal')) {
        if (window._afrtModalCleanup) window._afrtModalCleanup();
        return;
    }

    // 2. Обработчик клика по хешу чата в модалках (%АЗ, AHT, AFRT) и иконке 👁‍🗨
    const lookChatBtn = e.target.closest('.modal-lookchat');
    if (lookChatBtn) {
        // Единая подсветка выбранного чата для всех трех модалок (%АЗ, AHT, AFRT)
        const modalContainer = lookChatBtn.closest('#acls-modal-container, #aht-modal-container, #afrt-modal-container');
        if (modalContainer) {
            modalContainer.querySelectorAll('.modal-lookchat').forEach(el => {
                el.classList.remove('active-chat');
                el.style.background = 'rgba(255,255,255,0.05)';
                el.style.borderColor = 'transparent';
                el.style.color = '#a9c0ff';
            });

            lookChatBtn.classList.add('active-chat');
            lookChatBtn.style.background = 'rgba(134,239,172,0.3)';
            lookChatBtn.style.borderColor = '#86efac';
            lookChatBtn.style.color = '#fff';
        }

        const val = lookChatBtn.getAttribute('data-hash');
        const chatHistoryElement = document.getElementById('AF_ChatHis');
        const chatHistoryButton = document.getElementById('opennewcat');

        // Надежная проверка через getComputedStyle (как в Grabber.js), чтобы окно открывалось всегда
        if (chatHistoryElement && getComputedStyle(chatHistoryElement).display === 'none') {
            chatHistoryButton?.click();
        }

        const input = document.getElementById('hashchathis');
        const searchBtn = document.getElementById('btn_search_history') ?? window.btn_search_history;

        if (val && input) {
            input.value = val;
            searchBtn?.click();
        }
        return;
    }

    // 3. Закрытие модалки по кнопке крестика
    if (e.target.closest('#close-acls-modal')) {
        if (window._aclsModalCleanup) window._aclsModalCleanup();
        return;
    }

    // 3.1. Закрытие модалки AHT
    if (e.target.closest('#close-aht-modal')) {
        if (window._ahtModalCleanup) window._ahtModalCleanup();
        return;
    }

    // --- Обработка стандартных кнопок меню ---
    const btn = e.target.closest('[id]');
    if (!btn) return;

    const targetId = btn.id;

    switch (targetId) {

        case 'dayplusplus':
            adjustDate('dateFromStat', 1);
            adjustDate('dateToStat', 1);
            break;

        case 'dayminusminus':
            adjustDate('dateFromStat', -1);
            adjustDate('dateToStat', -1);
            break;

        case 'clearstatawindow':
            ['outputstatafield', 'loadkctp', 'mystatfield', 'line2field', 'favfield'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });
            const time = document.getElementById('timeoutput');
            const bar = document.getElementById('progress-bar');
            if (time) time.value = '';
            if (bar) { bar.style.width = '0%'; bar.textContent = ''; }
            break;

        case 'retreivestata':
            ['loadkctp', 'mystatfield', 'line2field', 'favfield'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            });

            const out = document.getElementById('outputstatafield');
            if (out) out.style.display = "";

            KCL_TABS
                .forEach(id => document.getElementById(id)?.classList.remove('active-stat-tab'));

            document.getElementById('retreivestata')?.classList.add('active-stat-tab');

            showLoader();

            const progBar = document.getElementById('progress-bar');
            if (progBar) { progBar.style.width = '0%'; progBar.textContent = ''; }

            const tOut = document.getElementById("timeoutput");
            if (tOut) tOut.value = new Date().toLocaleTimeString('ru-RU');

            getStats();
            break;

        case 'buttonKCpower':
            checkload(/КЦ/, 'КЦ');
            break;

        case 'buttonTPpower':
            checkload(/ТП/, 'ТП');
            break;
    }
});


// Экспорт
// ⚡ window.CONFIGSTAT — обязателен: top-level const НЕ создаёт свойство window,
// а content.js (doOperationsWithConversations) и др. читают конфиг через window.
window.CONFIGSTAT = CONFIGSTAT;
window.getStats = getStats; window.checkload = checkload; window.resetRateCounts = resetRateCounts; window.getDateRangeStata = getDateRangeStata; window.getbuttonGetStatButtonPress = getbuttonGetStatButtonPress;