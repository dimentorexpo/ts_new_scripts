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
    PRIORITY_KBS: [120181, 121381],
    SLA_THRESHOLD_MINUTES: 25,
    ART_THRESHOLD_SECONDS: 120,
    AFRT_THRESHOLD_SECONDS: 60,
    PAGE_LIMIT: 100
};

// ============================================================================
// 🛠 ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

const getDateRangeStata = (dateFromStr, dateToStr) => {
    const start = new Date(dateFromStr), end = new Date(dateToStr);
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);
    return [start.toISOString(), end.toISOString()];
};

const apiFetch = async (endpoint, body = null, method = 'GET') => {
    const url = `${CONFIGSTAT.API.BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: { 'content-type': 'application/json', 'x-csrf-token': aftoken },
        credentials: 'include'
    };
    if (body) options.body = typeof body === 'string' ? body : JSON.stringify(body);
    const r = await fetch(url, options);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
};

const showLoader = (id = 'outputstatafield', text = '⏳ Загрузка...') => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="padding:15px;text-align:center">${text}</div>`;
};

const showError = (msg, id = 'outputstatafield') => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div style="padding:15px;color:#ff6b6b">❌ ${msg}</div>`;
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
    try {
        showLoader();
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) { progressBar.style.width = '0%'; progressBar.textContent = ''; }

        const opSection = document.querySelector('.user_menu-dropdown-user_name')?.textContent.split('-')[0].trim();
        if (!opSection) throw new Error('Не определён отдел');

        const dF = document.getElementById("dateFromStat"), dT = document.getElementById("dateToStat");
        if (!dF?.value || !dT?.value) throw new Error('Выберите даты');

        const [dateFrom, dateTo] = getDateRangeStata(dF.value, dT.value);
        console.log('📅 Запрос:', { opSection, dateFrom, dateTo });

        const [activityData, staticData] = await Promise.all([
            apiFetch(`${CONFIGSTAT.API.OPERATOR_ACTIVITY}?dateFrom=${dateFrom}&dateTo=${dateTo}`),
            fetchStaticDataStat()
        ]);

        const rows = activityData.rows ?? activityData.data?.rows ?? activityData.result?.rows ?? [];
        if (!rows.length) { showError('📭 Нет данных за период'); return; }

        const filteredOperators = rows.filter(r => r.operator?.includes(opSection)).sort((a, b) => (b.conversationClosed || 0) - (a.conversationClosed || 0));
        if (!filteredOperators.length) { showError(`⚠️ Не найдено операторов "${opSection}"`); return; }

        window.activeopersId = filteredOperators.map(o => o.operatorId || o.id);

        const availableOperators = (staticData.onOperator || [])
            .filter(k => k.operator?.fullName)
            .filter(k => {
                const sec = k.operator.fullName.split('-')[0].trim();
                if (sec !== opSection) return false;
                if (k.operator.kbs?.length) return CONFIGSTAT.PRIORITY_KBS.some(x => k.operator.kbs.includes(x));
                return true;
            })
            .map(k => ({ id: k.operator.id, fullName: k.operator.fullName }));

        const chatCountPromises = availableOperators.map(op => {
            const body = { serviceId: CONFIGSTAT.SERVICE_ID, mode: "Json", participatingOperatorsIds: [op.id], tsFrom: dateFrom, tsTo: dateTo, orderBy: "ts", orderDirection: "Asc", page: 1, limit: 1 };
            return doOperationsWithHistory(body).then(res => res.total ?? 0).catch(err => { console.warn(`⚠️ chatCount ${op.fullName}:`, err.message); return 0; });
        });

        const chatCounts = await Promise.all(chatCountPromises);
        const chatCountMap = new Map(availableOperators.map((op, i) => [op.fullName, chatCounts[i]]));

        renderStatsTable(filteredOperators, chatCountMap, opSection);
        await getopersSLA(dateFrom, dateTo, window.activeopersId, progressBar);

    } catch (e) {
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
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.2);
            animation: tableEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        `
    });

    const columns = ["👨‍💻Оператор", "💪Закрыто", "⚡Пощупано", "🕒SLA", "⚠AvgCSAT", "🤖%A3", "⏱AHT"];

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.style.cssText = `
        background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
        box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
    `;

    columns.forEach(text => {
        const th = Object.assign(document.createElement('th'), {
            textContent: text,
            style: `
                padding: 14px 12px;
                border: none;
                font-weight: 700;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-size: 12px;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.3);
                position: relative;
            `
        });
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const fragment = document.createDocumentFragment();

    operators.forEach((op, index) => {
        const tr = Object.assign(document.createElement('tr'), {
            style: `
                border-bottom: 1px solid rgba(56, 189, 248, 0.1);
                transition: all 0.3s ease;
                animation: rowFadeIn 0.4s ease forwards;
                animation-delay: ${index * 0.05}s;
                opacity: 0;
            `
        });

        tr.onmouseenter = function() {
            this.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)';
            this.style.transform = 'scale(1.02)';
            this.style.boxShadow = '0 4px 20px rgba(56, 189, 248, 0.3)';
        };
        tr.onmouseleave = function() {
            this.style.background = '';
            this.style.transform = '';
            this.style.boxShadow = '';
        };

        const isCurrent = op.operator === currentOperator;
        const nameStyle = `
            text-align: left;
            padding: 12px 16px;
            font-weight: ${isCurrent ? '800' : '600'};
            color: ${isCurrent ? '#53db4b' : '#e2e8f0'};
            text-shadow: ${isCurrent ? '0 0 10px rgba(83, 219, 75, 0.6), 1px 2px 5px rgba(0,0,0,0.55)' : 'none'};
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
                td.style.color = '#38bdf8';
                td.style.textShadow = '0 0 8px rgba(56, 189, 248, 0.5)';
            } else {
                td.innerHTML = '<span style="font-size: 10px; opacity: 0.7; animation: loadingPulse 1.5s ease-in-out infinite;">⏳</span>';
                td.setAttribute('name', attr);
            }
            tr.appendChild(td);
        });

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
    table.appendChild(tbody);

    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);

    const output = document.getElementById('outputstatafield');
    if (output) {
        output.innerHTML = '';
        output.appendChild(table);
    }
    renderSummaryStats(operators, chatCountMap);
}

function renderSummaryStats(operators, chatCountMap) {
    const output = document.getElementById('outputstatafield');
    if (!output) return;

    const totalTouched = operators.reduce((s, o) => s + (chatCountMap.get(o.operator) ?? 0), 0);

    const summary = Object.assign(document.createElement('div'), {
        style: `
            margin: 30px 0 0 0;
            padding: 25px;
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%);
            border-radius: 16px;
            border: 1px solid rgba(56, 189, 248, 0.3);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1);
            animation: summaryEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards;
        `
    });

    const stats = [
        { label: '📦 Закрыто чатов:', value: '<span id="allChatsClsd" class="stat-loading">⏳</span>', icon: '📦', color: '#38bdf8', compact: true },
        { label: '✋ Пощупано чатов:', value: totalTouched, icon: '✋', color: '#a855f7', compact: true },
        { label: '🤖 Средний %АЗ:', value: '<span id="avgAutoClosedGroup" class="stat-loading">⏳</span>', icon: '🤖', color: '#10b981', compact: true },
        { label: '🌟 Средний CSAT:', value: '<span id="avgCsatonGroup" class="stat-loading">⏳</span>', icon: '🌟', color: '#f59e0b', compact: true },
        { label: '⏱ Средний AHT:', value: '<span id="avgAHTGroup" class="stat-loading">⏳</span>', icon: '⏱', color: '#06b6d4', compact: true },
        { label: '📋 Разбивка по оценкам:', value: '<span id="CSATDetails" class="stat-loading">⏳</span>', icon: '📋', color: '#ec4899', compact: false },
        { label: '🕒 SLA закрытия:', value: '<span id="SLAonGroup" class="stat-loading">⏳</span>', icon: '🕒', color: '#8b5cf6', compact: false },
        { label: '🚀 AFRT:', value: '<span id="AFRTGroup" class="stat-loading">⏳</span>', icon: '🚀', color: '#14b8a6', compact: false },
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
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%);
            border-radius: 12px;
            border: 1px solid rgba(${stat.color === '#38bdf8' ? '56, 189, 248' : stat.color === '#a855f7' ? '168, 85, 247' : stat.color === '#10b981' ? '16, 185, 129' : stat.color === '#06b6d4' ? '6, 182, 212' : '245, 158, 11'}, 0.2);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            animation: statCardSlide 0.5s ease forwards;
            animation-delay: ${index * 0.1}s;
            opacity: 0;
            position: relative;
            overflow: hidden;
        `;

        statCard.onmouseenter = function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.boxShadow = `0 8px 30px rgba(0, 0, 0, 0.5), 0 0 25px ${stat.color}50`;
            this.style.borderColor = stat.color + '80';
        };

        statCard.onmouseleave = function() {
            this.style.transform = '';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        };

        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
            font-size: 36px;
            min-width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, ${stat.color}30, ${stat.color}10);
            border-radius: 12px;
            border: 1px solid ${stat.color}40;
            box-shadow: 0 0 20px ${stat.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.1);
            filter: drop-shadow(0 0 10px ${stat.color});
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
            text-shadow: 0 0 10px ${stat.color}80;
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
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%);
            border-radius: 12px;
            border: 1px solid rgba(${stat.color === '#ec4899' ? '236, 72, 153' : stat.color === '#8b5cf6' ? '139, 92, 246' : '20, 184, 166'}, 0.2);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
            transition: all 0.3s ease;
            animation: statCardSlide 0.5s ease forwards;
            animation-delay: ${(index + 4) * 0.1}s;
            opacity: 0;
            position: relative;
            overflow: hidden;
        `;

        statCard.onmouseenter = function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = `0 6px 25px rgba(0, 0, 0, 0.5), 0 0 20px ${stat.color}40`;
            this.style.borderColor = stat.color + '80';
        };

        statCard.onmouseleave = function() {
            this.style.transform = '';
            this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        };

        const iconBox = document.createElement('div');
        iconBox.style.cssText = `
            font-size: 32px;
            min-width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, ${stat.color}30, ${stat.color}10);
            border-radius: 12px;
            border: 1px solid ${stat.color}40;
            box-shadow: 0 0 20px ${stat.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.1);
            filter: drop-shadow(0 0 10px ${stat.color});
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
            text-shadow: 0 0 10px ${stat.color}80;
            line-height: 1.4;
        `;
        valueDiv.innerHTML = typeof stat.value === 'number' ? stat.value : stat.value;

        contentBox.appendChild(labelDiv);
        contentBox.appendChild(valueDiv);

        statCard.appendChild(iconBox);
        statCard.appendChild(contentBox);

        summary.appendChild(statCard);
    });

    // Добавляем CSS анимации
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);

    output.appendChild(summary);
}

// ============================================================================
// 🎯 getopersSLA
// ============================================================================

async function getopersSLA(dateFrom, dateTo, operatorIds, progressBar) {
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

    const closedchatsDataCells = document.getElementsByName('chtclosed');
    const slaDataCells = document.getElementsByName('sladata');
    const csatDataCells = document.getElementsByName('csatdata');
    const aclosedchatsDataCells = document.getElementsByName('aclosedchatsdata');
    const ahtDataCells = document.getElementsByName('ahtdata');

    resetRateCounts();
    window.filteredarray = [];

    window.operatorAutoClosedDetails = {};

    const step = 100 / operatorIds.length;
    let currentWidth = 0;

    for (let i = 0; i < operatorIds.length; i++) {
        let operclschatcount = 0, csatcount = 0, csatsumma = 0, overduecount = 0, aclschtscount = 0;
        let page = 1, maxpage = 0;
        let localAFRTUntarget = 0, localAFRTTarget = 0;

        let totalChatsForOper = 0;
        let processedChatsForOper = 0;

        let totalHandleTimeSeconds = 0;
        let closedChatsCountForAHT = 0;

        window.operatorAutoClosedDetails[i] = { inactivity: [], pause: [], totalClosed: 0 };

        do {
            const bodyStr = JSON.stringify({
                serviceId: CONFIGSTAT.SERVICE_ID, mode: "Json", participatingOperatorsIds: [operatorIds[i]],
                tsFrom: dateFrom, tsTo: dateTo, orderBy: "ts", orderDirection: "Asc", page, limit: 100
            });

            try {
                const response = await doOperationsWithHistory(bodyStr);
                if (!response?.items?.length) break;

                if (page === 1) totalChatsForOper = response.total || 0;

                for (const item of response.items) {
                    processedChatsForOper++;

                    let pct = totalChatsForOper > 0 ? Math.round((processedChatsForOper / totalChatsForOper) * 100) : 0;
                    if (pct > 100) pct = 100;

                    if (closedchatsDataCells[i]) {
                        closedchatsDataCells[i].innerHTML = `
                            <div title="Проверено: ${processedChatsForOper} / ${totalChatsForOper}" style="width: 60px; margin: 0 auto; background: rgba(0,0,0,0.3); border-radius: 4px; overflow: hidden; position: relative; height: 16px; box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);">
                                <div style="width: ${pct}%; height: 100%; background-color: #53db4b; transition: width 0.1s ease;"></div>
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; text-align: center; font-size: 10px; color: white; line-height: 16px; font-weight: 700; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">${pct}%</div>
                            </div>
                        `;
                    }

                    const fres = await fetch(`${CONFIGSTAT.API.BASE_URL}${CONFIGSTAT.API.CONVERSATIONS}/${item.conversationId}`, {
                        headers: { "x-csrf-token": aftoken }, credentials: "include"
                    }).then(r => r.json());

                    const messages = fres.messages || [];
                    const lastMsg = messages[messages.length - 1];

                    if (lastMsg?.tpe === "Question") {
                        const firstMessageTime = lastMsg.ts;
                        let groupFoundIndex = -1;

                        for (let z = messages.length - 1; z >= 0; z--) {
                            if (messages[z].payload?.prevGroup === undefined && messages[z].payload?.group === "c7bbb211-a217-4ed3-8112-98728dc382d8") {
                                groupFoundIndex = z; break;
                            }
                        }

                        if (groupFoundIndex !== -1) {
                            for (let b = groupFoundIndex; b >= 0; b--) {
                                const m = messages[b];
                                if (["AnswerOperatorWithBot", "AnswerOperator"].includes(m.tpe)) {
                                    const diff = (new Date(m.ts) - new Date(firstMessageTime)) / 1000;
                                    if (diff > 60) { massivchikUntarget.add(fres.id); localAFRTUntarget++; }
                                    else { massivchikTarget.add(fres.id); localAFRTTarget++; }
                                    break;
                                }
                            }
                        }
                    }

                    // 🎯 СТРОГАЯ ПРОВЕРКА ПО ОПЕРАТОРУ
                    if (fres.operatorId === operatorIds[i]) {
                        operclschatcount++;
                        totalChatsClosed[i] = operclschatcount;
                        window.operatorAutoClosedDetails[i].totalClosed = operclschatcount; // Сохраняем всего закрыто

                        // Вычисляем автозакрытия ТОЛЬКО для чатов этого оператора
                        const messages = fres.messages || [];
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

                        // 🕒 РАСЧЕТ AHT - только для чатов, закрытых этим оператором
                        const closeEvent = messages.find(msg => msg.eventTpe === 'CloseConversation');
                        const isClosedByThisOperator = closeEvent &&
                            (closeEvent.payload?.oid === operatorIds[i] ||
                             (closeEvent.payload?.status === 'ClosedByOperator' && closeEvent.payload?.sender === operatorIds[i]));

                        // Проверяем, что чат закрыт НЕ на паузу
                        const isClosedNotPause = closeEvent && (!closeEvent.payload?.src || closeEvent.payload.src !== "pause");

                        if (isClosedByThisOperator && isClosedNotPause) {
                            // Ищем последнее событие AssignToOperator для этого оператора
                            const assignEvents = messages.filter(msg =>
                                msg.eventTpe === 'AssignToOperator' &&
                                msg.payload?.oid === operatorIds[i]
                            );

                            if (assignEvents.length > 0) {
                                // Берем последнее назначение на этого оператора
                                const lastAssign = assignEvents[assignEvents.length - 1];
                                const startTime = new Date(lastAssign.ts);
                                const endTime = new Date(closeEvent.ts);

                                const durationSeconds = (endTime - startTime) / 1000;
                                if (durationSeconds > 0) {
                                    totalHandleTimeSeconds += durationSeconds;
                                    closedChatsCountForAHT++;
                                }
                            }
                        }

                        window.filteredarray.push({
                            id: "operator" + (i + 1),
                            chatHashId: item.conversationId,
                            Duration: item.stats?.conversationDuration ? (item.stats.conversationDuration / 60000).toFixed(1) : "0.0",
                            Rate: item.stats?.rate?.rate ?? null,
                            Channel: item.channel?.name ?? ""
                        });

                        if (item.stats?.rate?.rate) {
                            csatcount++; csatsumma += item.stats.rate.rate;
                            arraycsatcount[i] = csatcount; arraycsatsumma[i] = csatsumma;
                        }

                        if ((item.stats?.conversationDuration / 60000) > CONFIGSTAT.SLA_THRESHOLD_MINUTES) {
                            overduecount++; operatorOverdueChats[i] = overduecount;
                        }
                    }
                }
                page++;
                maxpage = Math.ceil(response.total / 100);
            } catch (error) {
                console.error(`❌ Ошибка страницы ${page}:`, error);
                break;
            }
        } while (page <= maxpage);

        // ОБНОВЛЕНИЕ ЯЧЕЕК ТАБЛИЦЫ
        if (slaDataCells[i]) slaDataCells[i].textContent = operclschatcount > 0 ? (100 - ((operatorOverdueChats[i] || 0) / operclschatcount * 100)).toFixed(1) + '%' : '100%';
        if (closedchatsDataCells[i]) closedchatsDataCells[i].textContent = operclschatcount > 0 ? operclschatcount : '0';
        if (csatDataCells[i]) csatDataCells[i].textContent = (arraycsatcount[i] && arraycsatsumma[i]) ? (arraycsatsumma[i] / arraycsatcount[i]).toFixed(2) : '-';

        if (aclosedchatsDataCells[i]) {
            if (arrayaclosedchatscount[i] && operclschatcount > 0) {
                const pct = (arrayaclosedchatscount[i] / operclschatcount * 100).toFixed(1) + '%';
                const opName = document.getElementById('tableStats')?.rows[i + 1]?.cells[0]?.textContent || `Оператор`;

                aclosedchatsDataCells[i].innerHTML = `
                    <span class="acls-popup-btn" data-opidx="${i}" data-opname="${opName}"
                          style="color:#53db4b; cursor:pointer; border-bottom:1px dashed #53db4b;"
                          title="Посмотреть детали автозакрытия">
                        ${pct}
                    </span>`;
            } else {
                aclosedchatsDataCells[i].textContent = '-';
            }
        }

        // Обновление AHT
        if (ahtDataCells[i]) {
            if (closedChatsCountForAHT > 0) {
                const ahtValue = Math.round(totalHandleTimeSeconds / closedChatsCountForAHT);
                ahtDataCells[i].textContent = ahtValue + 's';
                ahtDataCells[i].style.color = '#f59e0b';
                ahtDataCells[i].style.fontWeight = '700';
            } else {
                ahtDataCells[i].textContent = '-';
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

    // Подсчет оценок
    window.filteredarray.forEach(item => {
        if (item.Rate !== null && item.Channel !== "Telegram techsup acquisition") rateCounts[item.Rate] = (rateCounts[item.Rate] || 0) + 1;
    });

    const uniquedArrayAllLength = massivchikUntarget.size + massivchikTarget.size;
    const calcChatsClsContainer = alloperChatsclsed > 0 ? ((((alloperChatsclsed - alloperSLAclsed) * 100) / SLA_TARGET_PERCENT) - alloperChatsclsed).toFixed(1) : '0.0';
    const calcAFRTContainer = uniquedArrayAllLength > 0 ? (((massivchikTarget.size * 100) / AFRT_TARGET_PERCENT) - uniquedArrayAllLength).toFixed(1) : '0.0';

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

    set('avgCsatonGroup', alloperCSATcount > 0 ? (alloperCSATsumma / alloperCSATcount).toFixed(2) : 'N/A');
    const c5 = rateCounts['5'] || 0;
    const c4 = rateCounts['4'] || 0;
    const c3 = rateCounts['3'] || 0;
    const c2 = rateCounts['2'] || 0;
    const c1 = rateCounts['1'] || 0;

    setHTML('CSATDetails', `
        <div style="margin-top: 8px; margin-bottom: 12px; border-radius: 6px; overflow: hidden; display: block; width: max-content; border: 1px solid #5f7875; box-shadow: 0 4px 8px rgba(0,0,0,0.4);">
            <table style="text-align: center; border-collapse: collapse; background: rgba(0,0,0,0.2); font-weight: normal; line-height: 1.4; margin: 0; white-space: nowrap;">
                <tr style="background: rgba(0,0,0,0.4); font-size: 13px; color: bisque;">
                    <td style="padding: 6px 14px; border-right: 1px solid rgba(255,255,255,0.1);">5 😊</td>
                    <td style="padding: 6px 14px; border-right: 1px solid rgba(255,255,255,0.1);">4 🥴</td>
                    <td style="padding: 6px 14px; border-right: 1px solid rgba(255,255,255,0.1);">3 😐</td>
                    <td style="padding: 6px 14px; border-right: 1px solid rgba(255,255,255,0.1);">2 🤢</td>
                    <td style="padding: 6px 14px;">1 🤬</td>
                </tr>
                <tr style="font-size: 15px; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">
                    <td style="padding: 6px 14px; border-right: 1px solid rgba(255,255,255,0.1); color: #53db4b; font-weight: bold;">${c5} <span style="font-size:11px;color:#aaa;font-weight:normal">(${c5 * 5})</span></td>
                    <td style="padding: 6px 14px; border-right: 1px solid rgba(255,255,255,0.1); color: #b8db4b; font-weight: bold;">${c4} <span style="font-size:11px;color:#aaa;font-weight:normal">(${c4 * 4})</span></td>
                    <td style="padding: 6px 14px; border-right: 1px solid rgba(255,255,255,0.1); color: #dbd24b; font-weight: bold;">${c3} <span style="font-size:11px;color:#aaa;font-weight:normal">(${c3 * 3})</span></td>
                    <td style="padding: 6px 14px; border-right: 1px solid rgba(255,255,255,0.1); color: #db8c4b; font-weight: bold;">${c2} <span style="font-size:11px;color:#aaa;font-weight:normal">(${c2 * 2})</span></td>
                    <td style="padding: 6px 14px; color: #ff6b6b; font-weight: bold;">${c1} <span style="font-size:11px;color:#aaa;font-weight:normal">(${c1 * 1})</span></td>
                </tr>
            </table>
        </div>
    `);

    set('allChatsClsd', alloperChatsclsed);

    // Добавляем вычисление Среднего %АЗ по всему отделу
    const avgAclsPct = alloperChatsclsed > 0 ? ((totalGroupAutoClosed / alloperChatsclsed) * 100).toFixed(1) + '%' : '0.0%';
    setHTML('avgAutoClosedGroup', `<span style="color:#53db4b; font-weight:bold;">${avgAclsPct}</span> <span style="font-size:12px;color:#aaa;">(АЗ: ${totalGroupAutoClosed} / Закрыто: ${alloperChatsclsed})</span>`);

    // Добавляем вычисление Среднего AHT по всему отделу
    const avgAHTValue = totalGroupClosedChatsForAHT > 0 ? Math.round(totalGroupHandleTimeSeconds / totalGroupClosedChatsForAHT) : 0;
    set('avgAHTGroup', avgAHTValue > 0 ? avgAHTValue + 's' : 'N/A');

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
            • 🚫Вне таргета: ${massivchikUntarget.size}<br>
            • ✅В таргете: ${massivchikTarget.size}<br>
            🎯Для таргета ${AFRT_TARGET_PERCENT}% можем позволить просрочить:
            <span style="color:${afrtCalcColor}; font-weight:700">${calcAFRTContainer}</span> чатов${afrtExtra}
        </div>
    `);
}

// ============================================================================
// 🪟 РЕНДЕР МОДАЛКИ С DRAG & DROP
// ============================================================================

function renderAclsModal(idx, opName) {
    // 1. Проверяем, есть ли данные
    const data = window.operatorAutoClosedDetails ? window.operatorAutoClosedDetails[idx] : null;
    if (!data) {
        alert(`⚠️ Данные для оператора ${opName} не найдены. Попробуйте нажать кнопку "Статистика" еще раз.`);
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
                 style="margin-bottom:6px; background:rgba(255,255,255,0.05); padding:6px 10px; border-radius:4px; cursor:pointer; color:#dfd1f5; font-family:monospace; font-size:13px; text-align:center; border: 1px solid transparent; transition: all 0.2s;"
                 onmouseover="if(!this.classList.contains('active-chat')){this.style.background='rgba(83,219,75,0.1)'; this.style.borderColor='#53db4b'; this.style.color='#fff'}"
                 onmouseout="if(!this.classList.contains('active-chat')){this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='transparent'; this.style.color='#dfd1f5'}">
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
        backgroundColor: '#2e3b3a', border: '1px solid #5f7875', borderRadius: '8px',
        width: '650px', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)', color: 'bisque',
        left: startLeft + 'px',
        top: startTop + 'px'
    });

    modal.innerHTML = `
        <div class="acls-modal-header chmaf-drag-handle" style="padding:15px 20px; border-bottom:1px solid #5f7875; display:flex; justify-content:space-between; align-items:flex-start; background: rgb(55 52 71); cursor:grab; border-top-left-radius:8px; border-top-right-radius:8px; user-select:none;">
            <div>
                <h3 style="margin:0; font-size:16px; font-weight:600; color:bisque;">Детали %A3: <span style="color:#53db4b">${opName}</span></h3>
                <div style="font-size:13px; color:#aaa; margin-top:6px;">
                    Всего закрыто: <b style="color:bisque">${data.totalClosed || 0}</b> |
                    Чатов АЗ: <b style="color:#e38118">${data.inactivity ? data.inactivity.length : 0}</b> |
                    Чатов отложек с АЗ: <b style="color:#53db4b">${data.pause ? data.pause.length : 0}</b>
                </div>
            </div>
            <button id="close-acls-modal" class="af-win-btn buttonHide" style="cursor:pointer; background:transparent; border:none; color:bisque; font-size:16px;">✖</button>
        </div>
        <div style="display:flex; flex:1; overflow:hidden; padding:15px; gap:15px; background:#464451; border-bottom-left-radius:8px; border-bottom-right-radius:8px;">
            <!-- Колонка 1: inactivity_timer -->
            <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #5f7875; padding:10px; background:rgba(0,0,0,0.3);">
                    ⏳ Обычные АЗ: <span style="color:#53db4b">${data.inactivity ? data.inactivity.length : 0}</span>
                </div>
                <div style="overflow-y:auto; flex:1; padding:10px;">
                    ${createListHtml(data.inactivity)}
                </div>
            </div>
            <!-- Колонка 2: pause -->
            <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #5f7875; padding:10px; background:rgba(0,0,0,0.3);">
                    ⏸️ Отложки с АЗ: <span style="color:#53db4b">${data.pause ? data.pause.length : 0}</span>
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
// 🪟 win_StatisticaAF (СУПЕР-ДИЗАЙН ДАШБОРДА)
// ============================================================================

var win_StatisticaAF = `
<style>
/* ============================================================================
   🎨 ПРЕМИАЛЬНЫЙ LUXURY ДИЗАЙН ДАШБОРДА
   ============================================================================ */

#af-dashboard-wrapper {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    border: 2px solid transparent;
    border-image: linear-gradient(135deg, #38bdf8, #a855f7, #f43f5e) 1;
    border-radius: 16px;
    box-shadow:
        0 25px 80px rgba(0, 0, 0, 0.9),
        0 0 60px rgba(56, 189, 248, 0.3),
        0 0 40px rgba(168, 85, 247, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
    position: relative;
    animation: dashboardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

#af-dashboard-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 3px;
    background: linear-gradient(90deg, transparent, #38bdf8, #a855f7, #f43f5e, transparent);
    animation: borderShimmer 4s linear infinite;
}

@keyframes dashboardEntrance {
    from { opacity: 0; transform: scale(0.95) translateY(-20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes borderShimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}

/* Шапка */
#stataaf_header {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
    padding: 18px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid rgba(56, 189, 248, 0.3);
    cursor: move;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
}

#stataaf_header::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.1), transparent);
    transition: left 0.6s;
}

#stataaf_header:hover::before {
    left: 100%;
}

.af-title {
    font-size: 22px;
    font-weight: 800;
    background: linear-gradient(135deg, #38bdf8, #a855f7, #f43f5e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 30px rgba(56, 189, 248, 0.5);
    letter-spacing: 0.5px;
    animation: titlePulse 3s ease-in-out infinite;
}

@keyframes titlePulse {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.3); }
}

.af-window-controls {
    display: flex;
    gap: 10px;
}

.af-win-btn {
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0.05) 100%);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #38bdf8;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
}

.af-win-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(56, 189, 248, 0.4);
    transition: width 0.4s, height 0.4s, top 0.4s, left 0.4s;
}

.af-win-btn:hover {
    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
    color: #0f172a;
    box-shadow: 0 0 25px rgba(56, 189, 248, 0.6), 0 0 40px rgba(56, 189, 248, 0.3);
    transform: translateY(-2px) scale(1.05);
}

.af-win-btn:hover::before {
    width: 300px;
    height: 300px;
    top: -150px;
    left: -150px;
}

.buttonHide {
    border-color: rgba(244, 63, 94, 0.4);
    color: #f43f5e;
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.15) 0%, rgba(244, 63, 94, 0.05) 100%);
}

.buttonHide:hover {
    background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
    color: #fff;
    box-shadow: 0 0 25px rgba(244, 63, 94, 0.6);
}

/* Панель дат */
.af-dates-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
    border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    gap: 20px;
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.4);
}

.af-date-group {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #cbd5e1;
    font-weight: 600;
    font-size: 14px;
}

.af-date-input {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #e2e8f0;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.af-date-input:focus {
    outline: none;
    border-color: #a855f7;
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
}

.af-nav-btns {
    display: flex;
    gap: 10px;
}

.af-nav-btn {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%);
    border: 1px solid rgba(168, 85, 247, 0.4);
    color: #a855f7;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.2);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.af-nav-btn:hover {
    background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
    color: #fff;
    box-shadow: 0 0 25px rgba(168, 85, 247, 0.6);
    transform: translateY(-2px);
}

/* Вкладки */
.af-tabs {
    display: flex;
    gap: 6px;
    padding: 10px 16px;
    background: rgba(15, 23, 42, 0.6);
    border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    overflow-x: auto;
}

.af-tab {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
    border: 1px solid rgba(56, 189, 248, 0.3);
    color: #cbd5e1;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;
}

.af-tab::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, #38bdf8, #a855f7);
    transition: width 0.3s ease;
}

.af-tab:hover {
    background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
    border-color: #38bdf8;
    color: #38bdf8;
    box-shadow: 0 6px 20px rgba(56, 189, 248, 0.3);
    transform: translateY(-2px);
}

.af-tab:hover::before {
    width: 100%;
}

.af-tab.active-stat-tab {
    background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
    border-color: #38bdf8;
    color: #0f172a;
    box-shadow: 0 0 30px rgba(56, 189, 248, 0.6), 0 0 50px rgba(56, 189, 248, 0.3);
    transform: translateY(-2px);
}

.af-tab-icon {
    font-size: 14px;
    filter: drop-shadow(0 0 5px currentColor);
}

/* Статус-бар */
.af-status-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 14px 24px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%);
    border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
}

.af-clock {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    border: 1px solid rgba(56, 189, 248, 0.4);
    color: #38bdf8;
    padding: 8px 16px;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 15px;
    font-weight: 700;
    text-align: center;
    min-width: 120px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(56, 189, 248, 0.1);
    text-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}

.af-progress-bg {
    flex: 1;
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    height: 24px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(56, 189, 248, 0.3);
    box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.6), 0 0 15px rgba(56, 189, 248, 0.1);
    position: relative;
}

#progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #38bdf8, #a855f7, #f43f5e);
    background-size: 200% 100%;
    animation: progressFlow 2s ease infinite;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
    box-shadow: 0 0 25px rgba(56, 189, 248, 0.6);
    transition: width 0.3s ease;
}

@keyframes progressFlow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

/* Контент */
.af-content-area {
    padding: 16px;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
    min-height: 300px;
    max-height: 65vh;
    overflow-y: auto;
    color: bisque;
    box-shadow: inset 0 4px 15px rgba(0, 0, 0, 0.5);
}

.af-content-area::-webkit-scrollbar {
    width: 10px;
}

.af-content-area::-webkit-scrollbar-track {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 5px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.6);
}

.af-content-area::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #38bdf8 0%, #a855f7 100%);
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
}

.af-content-area::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #0ea5e9 0%, #9333ea 100%);
    box-shadow: 0 0 15px rgba(56, 189, 248, 0.8);
}
</style>

<div id="af-dashboard-wrapper">
    <!-- Шапка -->
    <div id="stataaf_header" class="chmaf-drag-handle">
        <div class="af-title">🚀 AutoFAQ Dashboard</div>
        <div class="af-window-controls">
            <button class="af-win-btn" id="clearstatawindow" title="Очистить данные">🧹</button>
            <button class="af-win-btn buttonHide" id="hidestatisticaaf" title="Скрыть окно">❌</button>
        </div>
    </div>

    <!-- Фильтры дат -->
    <div class="af-dates-panel" id="periodOfStata">
        <div class="af-date-group">
            <span>От:</span>
            <input type="date" class="af-date-input" id="dateFromStat">
        </div>
        <div class="af-nav-btns">
            <button class="af-nav-btn" id="dayminusminus">◀ -1 День</button>
            <button class="af-nav-btn" id="dayplusplus">+1 День ▶</button>
        </div>
        <div class="af-date-group">
            <span>До:</span>
            <input type="date" class="af-date-input" id="dateToStat">
        </div>
    </div>

    <!-- Вкладки-кнопки -->
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

    <!-- Инфо-панель (Часы и Прогресс) -->
    <div class="af-status-bar">
        <input type="text" id="timeoutput" class="af-clock" disabled placeholder="--:--:--">
        <div class="af-progress-bg">
            <div id="progress-bar"></div>
        </div>
    </div>

    <!-- Рабочая область -->
    <div class="af-content-area">
        <!-- Анимация загрузки -->
        <div id="msgloader" style="display:none; padding: 40px 20px; text-align: center;">
            <div style="color:#53db4b; margin-bottom: 12px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;" id="loader-text">⏳ Анализ данных...</div>
            <div style="width: 50%; margin: 0 auto; background: #15151a; height: 6px; border-radius: 3px; overflow: hidden; border: 1px solid #32323f; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);">
                <div id="loader-progress" style="width: 0%; height: 100%; background: linear-gradient(90deg, #53db4b, #28a745); transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);"></div>
            </div>
        </div>

        <!-- Контейнеры для вывода JS -->
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
let rateCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
function resetRateCounts() { rateCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; }

// ============================================================================
// 🎬 ИНИЦИАЛИЗАЦИЯ
// ============================================================================

function getbuttonGetStatButtonPress() {
    const win = document.getElementById('AF_StataAF'); if (!win) return;
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

    const padStart = (s, len, pad) => String(s).padStart(len, pad);
    const getFormattedDate = (date) => {
        const d = new Date(date); d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${padStart(d.getMonth() + 1, 2, '0')}-${padStart(d.getDate(), 2, '0')}T21:00:00.000z`;
    };

    const selectedDate = new Date(document.getElementById("dateFromStat").value);
    const selectedEndDate = new Date(document.getElementById("dateToStat").value);
    const leftDateFromGrab = getFormattedDate(selectedDate);
    const rightDateToGrab = `${selectedEndDate.getFullYear()}-${padStart(selectedEndDate.getMonth() + 1, 2, '0')}-${padStart(selectedEndDate.getDate(), 2, '0')}T20:59:59.059z`;

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

        while (true) {
            const test = await apiFetch(CONFIGSTAT.API.QUEUES_ARCHIVE, {
                serviceId: CONFIGSTAT.SERVICE_ID, mode: "Json", tsFrom: leftDateFromGrab, tsTo: rightDateToGrab, orderBy: "ts", orderDirection: "Asc", page, limit: 100
            }, 'POST');

            if (page === 1) totalChatsToProcess = test.total || 0;

            for (const item of test.items) {
                processedChats++;

                if (loaderText && loaderProgress) {
                    const pct = totalChatsToProcess ? Math.round((processedChats / totalChatsToProcess) * 100) : 0;
                    loaderText.textContent = `⏳ Проверяем чаты: ${processedChats} из ${totalChatsToProcess} (${pct}%)`;
                    loaderProgress.style.width = `${pct}%`;
                }

                const chat = await doOperationsWithConversations(item.conversationId);

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
                    aclosedchats.push(`<span style="color:#dfd1f5; font-weight:700">${srcLabel}</span> <span name="aclsconv">${item.conversationId}</span> <span style="color:#64748b; font-size:10px;">(${srcText})</span> <span class="lookaclschat modal-lookchat" data-hash="${item.conversationId}" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>`);
                }

                let tagStr = chat.payload?.tags?.value || '';
                let formattedTag = 'Нет тега!';
                if (tagStr === '[\n  "queue"\n]') formattedTag = 'Тег: Очередь КЦ';
                else if (tagStr === '[\n  "request_forwarded_to_2l_tp"\n]') formattedTag = 'Тег: 2ЛТП';
                else if (tagStr) formattedTag = tagStr.replace(/[\[\]"\n]/g, '').replace(/,\s*/g, ', ').trim() || 'Нет тега!';

                if ((item.stats?.conversationDuration || 0) / 60000 > 25) {
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
                            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%); border-radius: 12px; padding: 15px; border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease;">
                                <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                                <div style="position: relative; z-index: 1;">
                                    <div style="font-size: 32px; margin-bottom: 6px; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.5));">⭐</div>
                                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Средний CSAT</div>
                                    <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);">${avg}</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Всего оценок: ${csatCount}</div>
                                </div>
                            </div>

                            <!-- SLA Закрытия -->
                            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%); border-radius: 12px; padding: 15px; border: 1px solid rgba(168, 85, 247, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease 0.1s backwards;">
                                <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                                <div style="position: relative; z-index: 1;">
                                    <div style="font-size: 32px; margin-bottom: 6px; filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.5));">🕒</div>
                                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">SLA Закрытия</div>
                                    <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(168, 85, 247, 0.5);">${slaPct}%</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Просрочено: ${slacount} из ${clschatarr.length}</div>
                                </div>
                            </div>

                            <!-- Автозакрытия -->
                            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%); border-radius: 12px; padding: 15px; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease 0.2s backwards;">
                                <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                                <div style="position: relative; z-index: 1;">
                                    <div style="font-size: 32px; margin-bottom: 6px; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));">🤖</div>
                                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Автозакрытия</div>
                                    <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #10b981, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);">${aclosedchats.length}</div>
                                    <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Потеряшки</div>
                                </div>
                            </div>
                        </div>

                        <!-- Разбивка оценок -->
                        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius: 12px; padding: 16px; border: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1); margin-bottom: 16px; animation: cardEntrance 0.5s ease 0.3s backwards;">
                            <div style="font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 20px;">📊</span>
                                <span>Детализация оценок CSAT</span>
                            </div>

                            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 12px;">
                                ${[
                                    { rate: 5, count: c5, emoji: '😊', color: '#10b981', label: 'Отлично' },
                                    { rate: 4, count: c4, emoji: '🙂', color: '#84cc16', label: 'Хорошо' },
                                    { rate: 3, count: c3, emoji: '😐', color: '#f59e0b', label: 'Средне' },
                                    { rate: 2, count: c2, emoji: '😞', color: '#f97316', label: 'Плохо' },
                                    { rate: 1, count: c1, emoji: '😡', color: '#ef4444', label: 'Ужасно' }
                                ].map(item => {
                                    const percentage = totalRatings > 0 ? ((item.count / totalRatings) * 100).toFixed(1) : 0;
                                    return `
                                        <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%); border-radius: 10px; padding: 12px; border: 1px solid ${item.color}40; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); text-align: center; transition: all 0.3s ease; position: relative; overflow: hidden;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px ${item.color}60';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.3)';">
                                            <div style="font-size: 32px; margin-bottom: 6px; filter: drop-shadow(0 0 8px ${item.color});">${item.emoji}</div>
                                            <div style="font-size: 22px; font-weight: 800; color: ${item.color}; text-shadow: 0 0 12px ${item.color}80; margin-bottom: 4px;">${item.count}</div>
                                            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;">${item.label}</div>
                                            <div style="background: rgba(0,0,0,0.3); height: 4px; border-radius: 2px; overflow: hidden; margin-top: 6px;">
                                                <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, ${item.color}, ${item.color}cc); box-shadow: 0 0 8px ${item.color}; transition: width 0.5s ease;"></div>
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
                                    ${flagmid ? `<div style="margin-bottom: 10px; padding: 10px; background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; border-radius: 6px;"><div style="color: #f59e0b; font-weight: 600; margin-bottom: 6px; font-size: 12px;">😐 Оценки 3:</div><div style="color: #cbd5e1; font-size: 11px; line-height: 1.5;">${flagmid}</div></div>` : ''}
                                    ${flagbad ? `<div style="margin-bottom: 10px; padding: 10px; background: rgba(249, 115, 22, 0.1); border-left: 3px solid #f97316; border-radius: 6px;"><div style="color: #f97316; font-weight: 600; margin-bottom: 6px; font-size: 12px;">😞 Оценки 2:</div><div style="color: #cbd5e1; font-size: 11px; line-height: 1.5;">${flagbad}</div></div>` : ''}
                                    ${flagvbad ? `<div style="padding: 10px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 6px;"><div style="color: #ef4444; font-weight: 600; margin-bottom: 6px; font-size: 12px;">😡 Оценки 1:</div><div style="color: #cbd5e1; font-size: 11px; line-height: 1.5;">${flagvbad}</div></div>` : ''}
                                </div>
                            ` : ''}
                        </div>

                        <!-- Чаты без тематики -->
                        ${stringChatsWithoutTopic ? `
                            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius: 12px; padding: 16px; border: 1px solid rgba(245, 158, 11, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6); margin-bottom: 16px; animation: cardEntrance 0.5s ease 0.4s backwards;">
                                <div style="font-size: 14px; font-weight: 700; color: #f59e0b; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
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
                            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius: 12px; padding: 16px; border: 1px solid rgba(239, 68, 68, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6); margin-bottom: 16px; animation: cardEntrance 0.5s ease 0.5s backwards;">
                                <div style="font-size: 14px; font-weight: 700; color: #ef4444; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
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
                            <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius: 12px; padding: 16px; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6); animation: cardEntrance 0.5s ease 0.6s backwards;">
                                <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
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
                break;
            }
        }
    } catch (e) {
        console.error('❌ checkCSAT:', e);
        str.innerHTML = `<span style="color:red">Ошибка: ${e.message}</span>`;
        if (loader) loader.style.display = 'none';
    } finally {
        if (checkBtn) checkBtn.innerHTML = '<span class="af-tab-icon">⭐</span> CSAT + АЗ чаты';
        if (csatDiv) csatDiv.appendChild(str);
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
        const loadColor = ratio <= 2.2 ? '#53db4b' : ratio <= 3.2 ? '#dbd24b' : ratio <= 4.4 ? '#db8c4b' : '#ff6b6b';

        if (load) {
            load.innerHTML = `
            <div style="padding: 12px;">
                <!-- Главные метрики нагрузки -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
                    <!-- Операторы на линии -->
                    <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%); border-radius: 12px; padding: 15px; border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease;">
                        <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 32px; margin-bottom: 6px; filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.5));">👨‍💻</div>
                            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Операторов на линии</div>
                            <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #38bdf8, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(56, 189, 248, 0.5);">${ops.length}</div>
                            <div style="display: flex; gap: 10px; margin-top: 10px; justify-content: center;">
                                <div style="text-align: center;">
                                    <div style="font-size: 16px;">🟢</div>
                                    <div style="font-size: 14px; font-weight: 700; color: #10b981;">${onLine}</div>
                                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase;">Online</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 16px;">🟡</div>
                                    <div style="font-size: 14px; font-weight: 700; color: #f59e0b;">${busy}</div>
                                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase;">Busy</div>
                                </div>
                                <div style="text-align: center;">
                                    <div style="font-size: 16px;">🔴</div>
                                    <div style="font-size: 14px; font-weight: 700; color: #ef4444;">${pause}</div>
                                    <div style="font-size: 8px; color: #64748b; text-transform: uppercase;">Pause</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Всего чатов -->
                    <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%); border-radius: 12px; padding: 15px; border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.15); position: relative; overflow: hidden; animation: cardEntrance 0.5s ease 0.1s backwards;">
                        <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%); border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 32px; margin-bottom: 6px; filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));">💬</div>
                            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Чатов в работе</div>
                            <div style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #10b981, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 20px rgba(16, 185, 129, 0.5);">${totalChats}</div>
                            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Распределено по операторам</div>
                        </div>
                    </div>

                    <!-- Уровень нагрузки -->
                    <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%); border-radius: 12px; padding: 15px; border: 1px solid ${loadColor}50; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 20px ${loadColor}30; position: relative; overflow: hidden; animation: cardEntrance 0.5s ease 0.2s backwards;">
                        <div style="position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: radial-gradient(circle, ${loadColor}20 0%, transparent 70%); border-radius: 50%;"></div>
                        <div style="position: relative; z-index: 1;">
                            <div style="font-size: 32px; margin-bottom: 6px; filter: drop-shadow(0 0 8px ${loadColor});">⚖️</div>
                            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; font-weight: 600;">Уровень нагрузки</div>
                            <div style="font-size: 20px; font-weight: 800; color: ${loadColor}; text-shadow: 0 0 15px ${loadColor}80; margin-bottom: 4px;">${loadTxt}</div>
                            <div style="font-size: 13px; color: #cbd5e1; font-weight: 600;">~ ${ratio.toFixed(1)} чат / оператор</div>
                            <div style="background: rgba(0,0,0,0.3); height: 6px; border-radius: 3px; overflow: hidden; margin-top: 10px;">
                                <div style="width: ${Math.min((ratio / 5) * 100, 100)}%; height: 100%; background: linear-gradient(90deg, ${loadColor}, ${loadColor}cc); box-shadow: 0 0 12px ${loadColor}; transition: width 0.5s ease;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Детализация по операторам -->
                <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius: 12px; padding: 16px; border: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1); animation: cardEntrance 0.5s ease 0.3s backwards;">
                    <div style="font-size: 14px; font-weight: 700; color: #e2e8f0; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 20px;">📋</span>
                        <span>Детализация по операторам</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px;">
                        ${ops.map((o, idx) => {
                            const chatColor = o.chats === 0 ? '#64748b' : o.chats <= 2 ? '#10b981' : o.chats <= 4 ? '#f59e0b' : '#ef4444';
                            return `
                                <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.4) 100%); border-radius: 10px; padding: 10px; border: 1px solid rgba(56, 189, 248, 0.2); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); transition: all 0.3s ease; animation: operatorCardSlide 0.4s ease ${idx * 0.03}s backwards;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(56, 189, 248, 0.4)'; this.style.borderColor='rgba(56, 189, 248, 0.5)';" onmouseout="this.style.transform=''; this.style.boxShadow='0 4px 12px rgba(0, 0, 0, 0.3)'; this.style.borderColor='rgba(56, 189, 248, 0.2)';">
                                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                                        <div style="flex: 1; min-width: 0;">
                                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                                <span style="font-size: 16px; filter: drop-shadow(0 0 4px currentColor);">${o.status}</span>
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

    // 2. Обработчик клика по иконке 👁‍🗨 (открывает панель истории чата)
    const lookChatBtn = e.target.closest('.modal-lookchat');
    if (lookChatBtn) {

        // Логика эксклюзивной подсветки внутри модалки (%АЗ)
        if (lookChatBtn.closest('#acls-modal-container')) {
            document.querySelectorAll('#acls-modal-container .modal-lookchat').forEach(el => {
                el.classList.remove('active-chat');
                el.style.background = 'rgba(255,255,255,0.05)';
                el.style.borderColor = 'transparent';
                el.style.color = '#dfd1f5';
            });

            lookChatBtn.classList.add('active-chat');
            lookChatBtn.style.background = 'rgba(83,219,75,0.3)';
            lookChatBtn.style.borderColor = '#53db4b';
            lookChatBtn.style.color = '#fff';
        }

        const val = lookChatBtn.getAttribute('data-hash');

        const chatHistoryElement = document.getElementById('AF_ChatHis');
        const chatHistoryButton = document.getElementById('opennewcat');

        if (chatHistoryElement && chatHistoryElement.style.display === 'none' && chatHistoryButton) {
            chatHistoryButton.click();
        }

        if (val && document.getElementById('hashchathis')) {
            document.getElementById('hashchathis').value = val;
            document.getElementById('btn_search_history')?.click();
        }
        return;
    }

    // 3. Закрытие модалки по кнопке крестика
    if (e.target.closest('#close-acls-modal')) {
        if (window._aclsModalCleanup) window._aclsModalCleanup();
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
window.getStats = getStats; window.checkCSAT = checkCSAT; window.checkload = checkload; window.resetRateCounts = resetRateCounts; window.getDateRangeStata = getDateRangeStata; window.getbuttonGetStatButtonPress = getbuttonGetStatButtonPress;