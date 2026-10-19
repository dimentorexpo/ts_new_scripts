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
let csatRunId = 0;

const showLoader = (id = 'outputstatafield', text = '⏳ Загрузка...') => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="padding:15px;text-align:center">${text}</div>`;
};

const showError = (msg, id = 'outputstatafield') => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="padding:15px;color:#fca5a5">❌ ${msg}</div>`;
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
        showError(escapeStatHtml(e.message || 'Ошибка загрузки'));
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

    const columns = ["👨‍💻Оператор", "💪Закрыто", "⚡Пощупано", "🕒SLA", "⚠AvgCSAT", "🤖%A3", "⏱AHT"];

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

        if (text === '⏱AHT') {
            th.innerHTML = `<span style="cursor:pointer;border-bottom:1px dashed #94a3b8;padding-bottom:2px;" class="aht-sort-btn" data-sort="asc" title="Сортировать по AHT">⏱AHT ▲</span>`;
            th.style.cursor = 'pointer';
        } else {
            th.textContent = text;
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
        { label: '📦 Закрыто чатов:', value: '<span id="allChatsClsd" class="stat-loading">⏳</span>', icon: '📦', color: '#a9c0ff', compact: true },
        { label: '✋ Пощупано чатов:', value: totalTouched, icon: '✋', color: '#a9c0ff', compact: true },
        { label: '🤖 Средний %АЗ:', value: '<span id="avgAutoClosedGroup" class="stat-loading">⏳</span>', icon: '🤖', color: '#a9c0ff', compact: true },
        { label: '🌟 Средний CSAT:', value: '<span id="avgCsatonGroup" class="stat-loading">⏳</span>', icon: '🌟', color: '#a9c0ff', compact: true },
        { label: '⏱ Средний AHT:', value: '<span id="avgAHTGroup" class="stat-loading">⏳</span>', icon: '⏱', color: '#a9c0ff', compact: true },
        { label: '📋 Разбивка по оценкам:', value: '<span id="CSATDetails" class="stat-loading">⏳</span>', icon: '📋', color: '#a9c0ff', compact: false },
        { label: '🕒 SLA закрытия:', value: '<span id="SLAonGroup" class="stat-loading">⏳</span>', icon: '🕒', color: '#a9c0ff', compact: false },
        { label: '🚀 AFRT:', value: '<span id="AFRTGroup" class="stat-loading">⏳</span>', icon: '🚀', color: '#a9c0ff', compact: false },
    ];

    // Компактные карточки (2 колонки)
    const compactGrid = document.createElement('div');
    compactGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 15px;
    `;

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
        iconBox.textContent = stat.icon;

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
        iconBox.textContent = stat.icon;

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
    setHTML('SLAonGroup', `
        ${slaPercent} Всего влияли на SLA Completed: ${alloperChatsclsed} из них:
        <div style="margin-top:5px;padding-left:15px;border-left:2px solid #555">
            • 🚫Вне таргета: ${alloperSLAclsed}<br>
            • ✅В таргете: ${alloperChatsclsed - alloperSLAclsed}<br>
            🎯Для таргета ${SLA_TARGET_PERCENT}% можем позволить просрочить:
            <span style="color:${slaCalcColor}; font-weight:700">${calcChatsClsContainer}</span> чатов
        </div>
    `);

    const afrtPercent = uniquedArrayAllLength > 0 ? ((massivchikTarget.size / uniquedArrayAllLength) * 100).toFixed(1) + '%' : '100%';
    const afrtCalcColor = Number(calcAFRTContainer) < 0 ? 'coral' : 'rgb(83, 219, 75)';
    const afrtExtra = Number(calcAFRTContainer) < 0 ? `<span> (чтобы выйти в таргет, вовремя дать ответ в: <strong style="color:coral">${Math.abs(calcAFRTContainer * 6.2).toFixed(1)}</strong> чатах)</span>` : '';
    setHTML('AFRTGroup', `
        ${afrtPercent} Всего влияли на AFRT: ${uniquedArrayAllLength} из них:
        <div style="margin-top:5px;padding-left:15px;border-left:2px solid #555">
            • <span class="afrt-untarget-popup-btn" style="color:#fca5a5; cursor:pointer; border-bottom:1px dashed #fca5a5; font-weight:700;" title="Нажмите, чтобы посмотреть список чатов вне таргета">🚫Вне таргета: ${massivchikUntarget.size} 📋</span><br>
            • ✅В таргете: ${massivchikTarget.size}<br>
            🎯Для таргета ${AFRT_TARGET_PERCENT}% можем позволить просрочить:
            <span style="color:${afrtCalcColor}; font-weight:700">${calcAFRTContainer}</span> чатов${afrtExtra}
        </div>
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
                <span style="pointer-events:none; color:#e2e8f0; font-family:sans-serif; font-size:11px; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${c.operator}">${c.operator}</span>
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
    overflow-x: auto;
}

#AF_StataAF .af-tab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: 1 1 0;
    min-width: max-content;
    height: 34px;
    padding: 0 12px;
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
        <button class="af-tab" id="retreivestata">
            <span class="af-tab-icon">📊</span>
            Статистика
        </button>
        <button class="af-tab" id="buttonCheckStats">
            <span class="af-tab-icon">⭐</span>
            CSAT + АЗ чаты
        </button>
        <button class="af-tab" id="buttonKCpower">
            <span class="af-tab-icon">🎧</span>
            Нагрузка КЦ
        </button>
        <button class="af-tab" id="buttonTPpower">
            <span class="af-tab-icon">🛠</span>
            Нагрузка ТП
        </button>
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
        <div id="csatandthemes" style="display:none; line-height: 1.6;"></div>
        <div id="loadkctp" style="display:none; line-height: 1.6;"></div>
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
// 🔍 checkCSAT
// ============================================================================

async function checkCSAT() {
    const runId = ++csatRunId;
    const isStale = () => runId !== csatRunId;
    const timeOut = document.getElementById("timeoutput");
    if (timeOut) timeOut.value = new Date().toLocaleTimeString('ru-RU');['retreivestata', 'buttonCheckStats', 'buttonKCpower', 'buttonTPpower'].forEach(id => document.getElementById(id)?.classList.remove('active-stat-tab'));
    const checkBtn = document.getElementById('buttonCheckStats');
    if (checkBtn) { checkBtn.classList.add('active-stat-tab'); checkBtn.innerHTML = '<span class="af-tab-icon">⏳</span> Загрузка...'; }

    document.getElementById('outputstatafield').style.display = 'none';
    document.getElementById('loadkctp').style.display = 'none';

    const csatDiv = document.getElementById('csatandthemes');
    if (csatDiv) { csatDiv.style.display = ''; csatDiv.innerHTML = ''; }

    const loader = document.getElementById('msgloader');
    const loaderText = document.getElementById('loader-text');
    const loaderProgress = document.getElementById('loader-progress');

    if (loader) loader.style.display = '';

    // Те же границы суток по МСК, что и в «Статистике». Раньше даты считались
    // через локальный часовой пояс компьютера, а конец дня обрезался на .059 вместо .999
    const [leftDateFromGrab, rightDateToGrab] = getDateRangeStata(
        document.getElementById("dateFromStat").value,
        document.getElementById("dateToStat").value
    );

    let str = document.createElement('p');
    str.style.paddingLeft = '50px';

    try {
        let page = 1;
        let stringChatsWithoutTopic = "", flagvbad = "", flagbad = "", flagmid = "", abovecloseslaarr = "";
        let csatScore = 0, csatCount = 0, slacount = 0;
        let clschatarr = [], aclosedchats = [], flagok = [];
        let count = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalChatsToProcess = 0;
        let processedChats = 0;

        let failedChats = 0;

        while (true) {
            const test = await apiFetch(CONFIGSTAT.API.QUEUES_ARCHIVE, {
                serviceId: CONFIGSTAT.SERVICE_ID, mode: "Json", tsFrom: leftDateFromGrab, tsTo: rightDateToGrab, orderBy: "ts", orderDirection: "Asc", page, limit: 100
            }, 'POST');
            if (isStale()) return;

            if (page === 1) totalChatsToProcess = test.total || 0;

            const pageItems = test.items || [];

            // Параллельная загрузка чатов страницы (раньше — строго по одному)
            const pageChats = await mapWithConcurrency(pageItems, CONFIGSTAT.CONCURRENCY, async (item) => {
                try {
                    return await doOperationsWithConversations(item.conversationId);
                } catch (error) {
                    failedChats++;
                    console.warn(`⚠️ CSAT: чат ${item.conversationId} не загрузился:`, error.message);
                    return null;
                } finally {
                    processedChats++;
                    if (loaderText && loaderProgress && !isStale()) {
                        const pct = totalChatsToProcess ? Math.min(100, Math.round((processedChats / totalChatsToProcess) * 100)) : 0;
                        loaderText.textContent = `⏳ Проверяем чаты: ${processedChats} из ${totalChatsToProcess} (${pct}%)`;
                        loaderProgress.style.width = `${pct}%`;
                    }
                }
            });
            if (isStale()) return;

            for (let itemIndex = 0; itemIndex < pageItems.length; itemIndex++) {
                const item = pageItems[itemIndex];
                const chat = pageChats[itemIndex];
                if (!chat) continue;

                if (typeof operatorId !== 'undefined' && chat.operatorId !== operatorId) continue;

                clschatarr.push(item.conversationId);

                // Проверяем автозакрытия в массиве messages
                const messages = chat.messages || [];

                const autoClosedMsg = messages.find(msg => msg.eventTpe === 'CloseConversation' && msg.payload?.src && ["inactivity_timer", "pause"].includes(msg.payload.src));
                if (autoClosedMsg) {
                    const srcReason = autoClosedMsg.payload.src;
                    const srcLabel = srcReason === 'pause' ? '⏸️' : '⏳';
                    const srcText = srcReason === 'pause' ? 'отложка' : 'таймер';
                    console.log(`✅ Найдено автозакрытие: ${item.conversationId}, тип: ${srcReason}`);
                    aclosedchats.push(`<span style="color:#a9c0ff; font-weight:700">${srcLabel}</span> <span name="aclsconv">${item.conversationId}</span> <span style="color:#64748b; font-size:10px;">(${srcText})</span> <span class="lookaclschat modal-lookchat" data-hash="${item.conversationId}" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>`);
                }

                let tagStr = chat.payload?.tags?.value || '';
                let formattedTag = 'Нет тега!';
                if (tagStr === '[\n  "queue"\n]') formattedTag = 'Тег: Очередь КЦ';
                else if (tagStr === '[\n  "request_forwarded_to_2l_tp"\n]') formattedTag = 'Тег: 2ЛТП';
                else if (tagStr) formattedTag = tagStr.replace(/[\[\]"\n]/g, '').replace(/,\s*/g, ', ').trim() || 'Нет тега!';

                if ((item.stats?.conversationDuration || 0) / 60000 > CONFIGSTAT.SLA_THRESHOLD_MINUTES) {
                    slacount++;
                    let tsClean = typeof item.ts === 'string' ? item.ts.split(/\[UTC\]|\[GMT\]/)[0] : item.ts;
                    let tmestmp = new Date(tsClean);
                    if (isNaN(tmestmp.getTime())) tmestmp = new Date();

                    const tshrs = String((tmestmp.getUTCHours() + 3) % 24).padStart(2, '0');
                    const tsmin = String(tmestmp.getUTCMinutes()).padStart(2, '0');
                    const duration = (item.stats.conversationDuration / 60000).toFixed(1);

                    abovecloseslaarr += `<span style="color: red; font-weight:700">&#5129;</span> <a href="https://skyeng.autofaq.ai/logs/${item.conversationId}" style="color:LightGoldenrod;" class="slaclchatids">${item.conversationId}</a> Время: ${duration}м <span class="lookchat modal-lookchat" data-hash="${item.conversationId}" style="margin-left: 10px; cursor: pointer">👁‍🗨</span> Создан: ${tshrs}:${tsmin} МСК ${formattedTag}<br>`;
                }

                if (item.stats?.rate?.rate) {
                    const rate = item.stats.rate.rate;
                    csatScore += rate; csatCount++;
                    flagok.push(rate);
                    if (rate === 1) flagvbad += `• ${item.conversationId}<br>`;
                    if (rate === 2) flagbad += `• ${item.conversationId}<br>`;
                    if (rate === 3) flagmid += `• ${item.conversationId}<br>`;
                }

                if (chat.payload?.topicId?.value === "") {
                    stringChatsWithoutTopic += `<a href="https://skyeng.autofaq.ai/logs/${item.conversationId}" target="_blank">${item.conversationId}</a><br>`;
                }
            }

            if (test.total / 100 >= page) {
                page++;
            } else {
                flagok.forEach(i => count[i] = (count[i] || 0) + 1);

                const avg = csatCount > 0 ? (csatScore / csatCount).toFixed(2) : 'N/A';
                const slaPct = clschatarr.length > 0 ? (100 - (slacount / clschatarr.length) * 100).toFixed(1) : 100;

                if (loader) loader.style.display = "none";

                const c5 = count[5] || 0, c4 = count[4] || 0, c3 = count[3] || 0, c2 = count[2] || 0, c1 = count[1] || 0;
                const totalRatings = c5 + c4 + c3 + c2 + c1;

                str.innerHTML = `
                    <div style="padding: 12px;">
                        <!-- Главные метрики -->
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                            <!-- CSAT Score -->
                            <div style="background: #1a2536; border-radius: 12px; padding: 15px; border: 1px solid rgba(66, 104, 201, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(66, 104, 201, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease;">
                                <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: none; border-radius: 50%;"></div>
                                <div style="position: relative; z-index: 1;">
                                    <div style="font-size: 32px; margin-bottom: 6px;">⭐</div>
                                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Средний CSAT</div>
                                    <div style="font-size: 28px; font-weight: 800; color: #f8fafc;">${avg}</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Всего оценок: ${csatCount}</div>
                                </div>
                            </div>

                            <!-- SLA Закрытия -->
                            <div style="background: #1a2536; border-radius: 12px; padding: 15px; border: 1px solid rgba(66, 104, 201, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(66, 104, 201, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease 0.1s backwards;">
                                <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: none; border-radius: 50%;"></div>
                                <div style="position: relative; z-index: 1;">
                                    <div style="font-size: 32px; margin-bottom: 6px;">🕒</div>
                                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">SLA Закрытия</div>
                                    <div style="font-size: 28px; font-weight: 800; color: #f8fafc;">${slaPct}%</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Просрочено: ${slacount} из ${clschatarr.length}</div>
                                </div>
                            </div>

                            <!-- Автозакрытия -->
                            <div style="background: #1a2536; border-radius: 12px; padding: 15px; border: 1px solid rgba(134, 239, 172, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(134, 239, 172, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease 0.2s backwards;">
                                <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: none; border-radius: 50%;"></div>
                                <div style="position: relative; z-index: 1;">
                                    <div style="font-size: 32px; margin-bottom: 6px;">🤖</div>
                                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Автозакрытия</div>
                                    <div style="font-size: 28px; font-weight: 800; color: #f8fafc;">${aclosedchats.length}</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Потеряшки</div>
                                </div>
                            </div>
                        </div>

                        <!-- Разбивка оценок -->
                        <div style="background: #1a2536; border-radius: 12px; padding: 16px; border: 1px solid rgba(66, 104, 201, 0.2); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1); margin-bottom: 16px; animation: cardEntrance 0.5s ease 0.3s backwards;">
                            <div style="font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 20px;">📊</span>
                                <span>Детализация оценок CSAT</span>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 12px;">
                                ${[
                        { rate: 5, count: c5, emoji: '😊', color: '#86efac', label: 'Отлично' },
                        { rate: 4, count: c4, emoji: '🙂', color: '#7dd3fc', label: 'Хорошо' },
                        { rate: 3, count: c3, emoji: '😐', color: '#fcd34d', label: 'Средне' },
                        { rate: 2, count: c2, emoji: '😞', color: '#fdba74', label: 'Плохо' },
                        { rate: 1, count: c1, emoji: '😡', color: '#fca5a5', label: 'Ужасно' }
                    ].map(item => {
                        const percentage = totalRatings > 0 ? ((item.count / totalRatings) * 100).toFixed(1) : 0;
                        return `
                                        <div style="background: rgba(0, 0, 0, 0.22); border-radius: 10px; padding: 12px; border: 1px solid ${item.color}40; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); text-align: center; transition: all 0.3s ease; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px ${item.color}60';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.3)';">
                                            <div style="font-size: 32px; margin-bottom: 6px;">${item.emoji}</div>
                                            <div style="font-size: 22px; font-weight: 800; color: ${item.color}; text-shadow: 0 0 12px ${item.color}80; margin-bottom: 4px;">${item.count}</div>
                                            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;">${item.label}</div>
                                            <div style="background: rgba(0,0,0,0.3); height: 4px; border-radius: 2px; overflow: hidden; margin-top: 6px;">
                                                <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, ${item.color}, ${item.color}cc); box-shadow: none; transition: width 0.5s ease;"></div>
                                            </div>
                                            <div style="font-size: 9px; color: #64748b; margin-top: 4px;">${percentage}%</div>
                                        </div>
                                    `;
                    }).join('')}
                            </div>

                            <!-- Списки плохих оценок -->
                            ${flagmid || flagbad || flagvbad ? `
                                <div style="background: rgba(0,0,0,0.2); border-radius: 10px; padding: 12px; border: 1px solid rgba(255,255,255,0.05);">
                                    <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 10px;">⚠️ Чаты с низкими оценками:</div>
                                    ${flagmid ? `<div style="margin-bottom: 10px; padding: 10px; background: rgba(252, 211, 77, 0.1); border-left: 3px solid #fcd34d; border-radius: 6px;"><div style="color: #fcd34d; font-weight: 600; margin-bottom: 6px; font-size: 12px;">😐 Оценки 3:</div><div style="color: #cbd5e1; font-size: 11px; line-height: 1.5;">${flagmid}</div></div>` : ''}
                                    ${flagbad ? `<div style="margin-bottom: 10px; padding: 10px; background: rgba(253, 186, 116, 0.1); border-left: 3px solid #fdba74; border-radius: 6px;"><div style="color: #fdba74; font-weight: 600; margin-bottom: 6px; font-size: 12px;">😞 Оценки 2:</div><div style="color: #cbd5e1; font-size: 11px; line-height: 1.5;">${flagbad}</div></div>` : ''}
                                    ${flagvbad ? `<div style="padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #fca5a5; border-radius: 6px;"><div style="color: #fca5a5; font-weight: 600; margin-bottom: 6px; font-size: 12px;">😡 Оценки 1:</div><div style="color: #cbd5e1; font-size: 11px; line-height: 1.5;">${flagvbad}</div></div>` : ''}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Чаты без тематики -->
                        ${stringChatsWithoutTopic ? `
                            <div style="background: #1a2536; border-radius: 12px; padding: 16px; border: 1px solid rgba(252, 211, 77, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6); margin-bottom: 16px; animation: cardEntrance 0.5s ease 0.4s backwards;">
                                <div style="font-size: 14px; font-weight: 700; color: #fcd34d; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 20px;">⚠️</span>
                                    <span>Чаты без тематики</span>
                                </div>
                                <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; color: #cbd5e1; font-size: 11px; line-height: 1.6;">
                                    ${stringChatsWithoutTopic}
                                </div>
                            </div>
                        ` : ''}

                        <!-- SLA Просрочки -->
                        ${abovecloseslaarr ? `
                            <div style="background: #1a2536; border-radius: 12px; padding: 16px; border: 1px solid rgba(239, 68, 68, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6); margin-bottom: 16px; animation: cardEntrance 0.5s ease 0.5s backwards;">
                                <div style="font-size: 14px; font-weight: 700; color: #fca5a5; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 20px;">🚨</span>
                                    <span>Чаты с превышением SLA (> 25 минут)</span>
                                </div>
                                <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; color: #cbd5e1; font-size: 11px; line-height: 1.6;">
                                    ${abovecloseslaarr}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Автозакрытые чаты -->
                        ${aclosedchats.length > 0 ? `
                            <div style="background: #1a2536; border-radius: 12px; padding: 16px; border: 1px solid rgba(134, 239, 172, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6); animation: cardEntrance 0.5s ease 0.6s backwards;">
                                <div style="font-size: 14px; font-weight: 700; color: #86efac; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                    <span style="font-size: 20px;">🤖</span>
                                    <span>Автозакрытые чаты (потеряшки)</span>
                                </div>
                                <div style="background: rgba(0,0,0,0.2); border-radius: 8px; padding: 10px; color: #cbd5e1; font-size: 11px; line-height: 1.6;">
                                    ${aclosedchats.join('<br>')}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <style>
                        @keyframes cardEntrance {
                            from { opacity: 0; transform: translateY(20px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    </style>
                `;
                if (failedChats) {
                    const warning = document.createElement('div');
                    warning.style.cssText = 'margin:0 12px 8px;padding:10px 14px;border-radius:8px;background:rgba(252,211,77,0.15);border:1px solid #fcd34d;color:#fcd34d;font-weight:600;';
                    warning.textContent = `⚠️ Не загрузились ${failedChats} чатов — цифры могут быть занижены. Нажми кнопку ещё раз.`;
                    str.prepend(warning);
                }
                break;
            }
        }
    } catch (e) {
        if (isStale()) return;
        console.error('❌ checkCSAT:', e);
        str.innerHTML = `<span style="color:red">Ошибка: ${escapeStatHtml(e.message)}</span>`;
        if (loader) loader.style.display = 'none';
    } finally {
        // Устаревший запуск (нажали кнопку ещё раз) ничего не дописывает в окно
        if (!isStale()) {
            if (checkBtn) checkBtn.innerHTML = '<span class="af-tab-icon">⭐</span> CSAT + АЗ чаты';
            if (csatDiv) csatDiv.appendChild(str);
        }
    }
}

// ============================================================================
// 📊 checkload
// ============================================================================

async function checkload(department, flag) {
    const time = document.getElementById("timeoutput"); if (time) time.value = new Date().toLocaleTimeString('ru-RU');['retreivestata', 'buttonCheckStats', 'buttonKCpower', 'buttonTPpower'].forEach(id => document.getElementById(id)?.classList.remove('active-stat-tab'));

    if (flag === 'КЦ') document.getElementById('buttonKCpower')?.classList.add('active-stat-tab');
    if (flag === 'ТП') document.getElementById('buttonTPpower')?.classList.add('active-stat-tab');

    const out = document.getElementById('outputstatafield'), csat = document.getElementById('csatandthemes'), load = document.getElementById('loadkctp'), loader = document.getElementById('msgloader');
    if (out) out.style.display = 'none'; if (csat) csat.style.display = 'none';
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
            .map(o => ({ name: o.operator.fullName, status: { Online: '🟢', Busy: '🟡', Pause: '🔴' }[o.operator.status] || '⚪', chats: o.aCnt || 0 }));

        const onLine = ops.filter(o => o.status === '🟢').length, busy = ops.filter(o => o.status === '🟡').length, pause = ops.filter(o => o.status === '🔴').length;
        const totalChats = ops.reduce((s, o) => s + o.chats, 0), ratio = onLine ? totalChats / onLine : 0;
        const loadTxt = ratio <= 2.2 ? 'Низкая 🟢' : ratio <= 3.2 ? 'Средняя 🟡' : ratio <= 4.4 ? 'Высокая 🟠' : 'Критическая 🔴';
        const loadColor = ratio <= 2.2 ? '#86efac' : ratio <= 3.2 ? '#fcd34d' : ratio <= 4.4 ? '#fdba74' : '#fca5a5';

        if (load) {
            load.innerHTML = `
            <div style="padding: 12px;">
                <!-- Главные метрики нагрузки -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                    <!-- Операторы на линии -->
                    <div style="background: #1a2536; border-radius: 12px; padding: 15px; border: 1px solid rgba(66, 104, 201, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(66, 104, 201, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease;">
                        <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: none; border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 32px; margin-bottom: 6px;">👨‍💻</div>
                            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Операторов на линии</div>
                            <div style="font-size: 28px; font-weight: 800; color: #f8fafc;">${ops.length}</div>
                            <div style="display: flex; gap: 10px; margin-top: 10px; justify-content: center;">
                                <div style="text-align: center;">
                                    <div style="font-size: 16px;">🟢</div>
                                    <div style="font-size: 14px; font-weight: 700; color: #86efac;">${onLine}</div>
                                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase;">Online</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 16px;">🟡</div>
                                    <div style="font-size: 14px; font-weight: 700; color: #fcd34d;">${busy}</div>
                                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase;">Busy</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 16px;">🔴</div>
                                    <div style="font-size: 14px; font-weight: 700; color: #fca5a5;">${pause}</div>
                                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase;">Pause</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Всего чатов -->
                    <div style="background: #1a2536; border-radius: 12px; padding: 15px; border: 1px solid rgba(134, 239, 172, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(134, 239, 172, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease 0.1s backwards;">
                        <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: none; border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 32px; margin-bottom: 6px;">💬</div>
                            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Чатов в работе</div>
                            <div style="font-size: 28px; font-weight: 800; color: #f8fafc;">${totalChats}</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Распределено по операторам</div>
                        </div>
                    </div>

                    <!-- Уровень нагрузки -->
                    <div style="background: #1a2536; border-radius: 12px; padding: 15px; border: 1px solid ${loadColor}50; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px ${loadColor}30; position: relative; overflow: hidden; animation: cardEntrance 0.5s ease 0.2s backwards;">
                        <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: none; border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 32px; margin-bottom: 6px;">⚖️</div>
                            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Уровень нагрузки</div>
                            <div style="font-size: 20px; font-weight: 800; color: ${loadColor}; text-shadow: 0 0 15px ${loadColor}80; margin-bottom: 4px;">${loadTxt}</div>
                            <div style="font-size: 13px; color: #cbd5e1; font-weight: 600;">~ ${ratio.toFixed(1)} чат / оператор</div>
                            <div style="background: rgba(0,0,0,0.3); height: 6px; border-radius: 3px; overflow: hidden; margin-top: 10px;">
                                <div style="width: ${Math.min((ratio / 5) * 100, 100)}%; height: 100%; background: linear-gradient(90deg, ${loadColor}, ${loadColor}cc); box-shadow: none; transition: width 0.5s ease;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Детализация по операторам -->
                <div style="background: #1a2536; border-radius: 12px; padding: 16px; border: 1px solid rgba(66, 104, 201, 0.2); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1); animation: cardEntrance 0.5s ease 0.3s backwards;">
                    <div style="font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">📋</span>
                        <span>Детализация по операторам</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px;">
                        ${ops.map((o, idx) => {
                const chatColor = o.chats === 0 ? '#64748b' : o.chats <= 2 ? '#86efac' : o.chats <= 4 ? '#fcd34d' : '#fca5a5';
                return `
                                <div style="background: rgba(0, 0, 0, 0.22); border-radius: 10px; padding: 10px; border: 1px solid rgba(66, 104, 201, 0.2); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); transition: all 0.3s ease; animation: operatorCardSlide 0.4s ease ${idx * 0.03}s backwards;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(66, 104, 201, 0.4)'; this.style.borderColor='rgba(66, 104, 201, 0.5)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.3)'; this.style.borderColor='rgba(66, 104, 201, 0.2)';">
                                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                                <span style="font-size: 16px;">${o.status}</span>
                                                <span style="color: #e2e8f0; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${o.name}">${o.name}</span>
                                            </div>
                                            <div style="font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.3px;">
                                                ${o.status === '🟢' ? 'Доступен' : o.status === '🟡' ? 'Занят' : o.status === '🔴' ? 'На паузе' : 'Неизвестно'}
                                            </div>
                                        </div>
                                        <div style="background: linear-gradient(135deg, ${chatColor}30, ${chatColor}10); border: 1px solid ${chatColor}40; border-radius: 10px; padding: 8px 12px; text-align: center; min-width: 60px; box-shadow: 0 0 15px ${chatColor}30;">
                                            <div style="font-size: 18px; font-weight: 800; color: ${chatColor}; text-shadow: 0 0 8px ${chatColor}80; line-height: 1;">${o.chats}</div>
                                            <div style="font-size: 8px; color: #94a3b8; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.3px;">чатов</div>
                                        </div>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            </div>

            <style>
                @keyframes cardEntrance {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes operatorCardSlide {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            </style>
            `;
        }
    } catch (e) {
        if (load) load.innerHTML = `<span style="color:red; padding-left:50px">Ошибка: ${e.message}</span>`;
    } finally {
        if (loader) loader.style.display = 'none';
    }
}

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
        ahtSortBtn.textContent = newSort === 'asc' ? '⏱AHT ▲' : '⏱AHT ▼';

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
            ['csatandthemes', 'outputstatafield', 'loadkctp'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = '';
            });
            const time = document.getElementById('timeoutput');
            const bar = document.getElementById('progress-bar');
            if (time) time.value = '';
            if (bar) { bar.style.width = '0%'; bar.textContent = ''; }
            break;

        case 'retreivestata':
            ['csatandthemes', 'loadkctp'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            });

            const out = document.getElementById('outputstatafield');
            if (out) out.style.display = "";

            ['retreivestata', 'buttonCheckStats', 'buttonKCpower', 'buttonTPpower']
                .forEach(id => document.getElementById(id)?.classList.remove('active-stat-tab'));

            document.getElementById('retreivestata')?.classList.add('active-stat-tab');

            showLoader();

            const progBar = document.getElementById('progress-bar');
            if (progBar) { progBar.style.width = '0%'; progBar.textContent = ''; }

            const tOut = document.getElementById("timeoutput");
            if (tOut) tOut.value = new Date().toLocaleTimeString('ru-RU');

            getStats();
            break;

        case 'buttonCheckStats':
            checkCSAT();
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
window.getStats = getStats; window.checkCSAT = checkCSAT; window.checkload = checkload; window.resetRateCounts = resetRateCounts; window.getDateRangeStata = getDateRangeStata; window.getbuttonGetStatButtonPress = getbuttonGetStatButtonPress;