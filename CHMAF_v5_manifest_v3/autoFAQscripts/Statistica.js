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
    start.setUTCHours(0, 0, 0, 0); end.setUTCHours(23, 59, 59, 999);
    return [start.toISOString(), end.toISOString()];
};

const apiFetch = async (endpoint, body = null, method = 'GET') => {
    const url = `${CONFIGSTAT.API.BASE_URL}${endpoint}`;
    const options = { method, headers: { 'content-type': 'application/json', 'x-csrf-token': aftoken }, credentials: 'include' };
    if (body) options.body = typeof body === 'string' ? body : JSON.stringify(body);
    const r = await fetch(url, options);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
};

const showLoader = (id = 'outputstatafield') => { const el = document.getElementById(id); if (el) el.innerHTML = '<div style="padding:15px;text-align:center">⏳ Загрузка...</div>'; };
const showError = (msg, id = 'outputstatafield') => { const el = document.getElementById(id); if (el) el.innerHTML = `<div style="padding:15px;color:#ff6b6b">❌ ${msg}</div>`; console.error('❌', msg); };

// ============================================================================
// 🌐 ФУНКЦИИ ЗАПРОСОВ
// ============================================================================

async function doOperationsWithHistory(body = "") { return apiFetch(CONFIGSTAT.API.CONVERSATIONS_HISTORY, body, 'POST'); }
async function fetchStaticDataStat() { return apiFetch(CONFIGSTAT.API.OPERATORS_STATS); }
async function doOperationsWithConversations(id) { return fetch(`${CONFIGSTAT.API.BASE_URL}${CONFIGSTAT.API.CONVERSATIONS}/${id}`, { headers: { 'x-csrf-token': aftoken }, credentials: 'include' }); }

// ============================================================================
// 📊 getStats() — ИСПРАВЛЕННАЯ + ВСЕ РАСЧЁТЫ
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

    } catch (e) { console.error('💥 getStats:', e); showError(e.message || 'Ошибка загрузки'); }
}

// ============================================================================
// 🎨 РЕНДЕР ТАБЛИЦЫ
// ============================================================================

function renderStatsTable(operators, chatCountMap, currentOperator) {
    const table = Object.assign(document.createElement('table'), { id: 'tableStats', style: 'table-layout:auto;width:750px;text-align:center;border-collapse:collapse;font-size:14px' });
    const columns = ["👨‍💻Оператор", "💪Закрыто", "⚡Пощупано", "🕒SLA", "⚠AvgCSAT"];
    const thead = document.createElement('thead'), headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = 'hsl(210, 53%, 48%)';
    columns.forEach(text => {
        const th = Object.assign(document.createElement('th'), { textContent: text, style: 'padding:10px;border:1px solid #dee2e6;font-weight:600' });
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow); table.appendChild(thead);

    const tbody = document.createElement('tbody'), fragment = document.createDocumentFragment();
    operators.forEach((op, index) => {
        const tr = Object.assign(document.createElement('tr'), { style: 'borderBottom:1px solid #eee' });
        const tdName = Object.assign(document.createElement('td'), { textContent: op.operator, style: `text-align:left;padding:8px 12px${op.operator === currentOperator ? ';color:#53db4b;font-weight:700;text-shadow:1px 2px 5px rgba(0,0,0,0.55)' : ''}` });
        tr.appendChild(tdName);
        const tdClosed = Object.assign(document.createElement('td'), { textContent: op.conversationClosed ?? 0, className: 'chtclosed', style: 'padding:8px' }); tr.appendChild(tdClosed);
        const tdTouched = Object.assign(document.createElement('td'), { textContent: chatCountMap.get(op.operator) ?? 0, className: 'chtcnt', style: 'padding:8px' }); tr.appendChild(tdTouched);

        // ✅ ИСПРАВЛЕНИЕ: используем setAttribute вместо name:
        const tdSLA = document.createElement('td');
        tdSLA.textContent = '⏳';
        tdSLA.setAttribute('name', 'sladata'); // ✅ Правильно!
        tdSLA.style.padding = '8px';
        tr.appendChild(tdSLA);

        const tdCSAT = document.createElement('td');
        tdCSAT.textContent = '⏳';
        tdCSAT.setAttribute('name', 'csatdata'); // ✅ Правильно!
        tdCSAT.style.padding = '8px';
        tr.appendChild(tdCSAT);

        fragment.appendChild(tr);
    });
    tbody.appendChild(fragment); table.appendChild(tbody);

    const output = document.getElementById('outputstatafield');
    if (output) { output.innerHTML = ''; output.appendChild(table); }
    renderSummaryStats(operators, chatCountMap);
}

function renderSummaryStats(operators, chatCountMap) {
    const output = document.getElementById('outputstatafield'); if (!output) return;
    const totalClosed = operators.reduce((s, o) => s + (o.conversationClosed ?? 0), 0);
    const totalTouched = operators.reduce((s, o) => s + (chatCountMap.get(o.operator) ?? 0), 0);
    window.summclsd = totalClosed;

    const summary = Object.assign(document.createElement('div'), { style: 'margin:15px 0 0 50px;font-size:14px;line-height:1.8' });
    const stats = [
        { label: 'Закрыто чатов:', value: totalClosed, id: 'allChatsClsd' },
        { label: 'Пощупано чатов:', value: totalTouched },
        { label: 'Средний CSAT:', value: '<span id="avgCsatonGroup">⏳</span>' },
        { label: 'Разбивка по оценкам:', value: '<span id="CSATDetails">⏳</span>' }, // ✅ ВОССТАНОВЛЕНО
        { label: 'SLA закрытия:', value: '<span id="SLAonGroup">⏳</span>' },
        { label: 'AFRT:', value: '<span id="AFRTGroup">⏳</span>' },
    ];
    stats.forEach(stat => {
        const div = document.createElement('div');
        div.innerHTML = `${stat.label} <strong>${stat.value}</strong>`;
        if (stat.id && typeof stat.value === 'number') setTimeout(() => { const el = document.getElementById(stat.id); if (el) el.textContent = stat.value; }, 0);
        summary.appendChild(div);
    });
    output.appendChild(summary);
    const el = document.getElementById('allChatsClsd'); if (el) el.textContent = totalClosed;
}

// ============================================================================
// 🎯 getopersSLA — ПОЛНОЕ ВОССТАНОВЛЕНИЕ ВСЕХ РАСЧЁТОВ
// ============================================================================

async function getopersSLA(dateFrom, dateTo, operatorIds, progressBar) {
    if (!operatorIds?.length) { console.warn('⚠️ getopersSLA: пусто'); return; }

    console.log('🔍 getopersSLA запущена для операторов:', operatorIds);
    console.log('📅 Период:', dateFrom, '→', dateTo);

    // Ваши переменные
    let page, maxpage = 0, operclschatcount;
    let totalChatsClosed = [], arraycsatcount = [], arraycsatsumma = [];
    let operatorOverdueChats = [];
    let csatcount, csatsumma, overduecount;
    let alloperCSATsumma = 0, alloperCSATcount = 0;

    // Sets для AFRT
    let massivchikUntarget = new Set();
    let massivchikTarget = new Set();
    let massivchikQueue = new Set();

    // Глобальные агрегаторы
    alloperSLAclsed = 0; alloperChatsclsed = 0; alloperaboveAFRT = 0;

    await new Promise(resolve => setTimeout(resolve, 100));

    // ✅ ВАЖНО: получаем элементы ПЕРЕД циклом
    const slaDataCells = document.getElementsByName('sladata');
    const csatDataCells = document.getElementsByName('csatdata');
    console.log('📊 Найдено ячеек SLA:', slaDataCells.length, 'CSAT:', csatDataCells.length);

    // Сброс rateCounts
    resetRateCounts();
    if (!window.filteredarray) window.filteredarray = [];
    window.filteredarray = []; // Очищаем перед новым запуском

    if (operatorIds) {
        const step = 100 / operatorIds.length;
        let currentWidth = 0;

        for (let i = 0; i < operatorIds.length; i++) {
            console.log(`👤 Обработка оператора ${i + 1}/${operatorIds.length}:`, operatorIds[i]);

            operclschatcount = 0; csatcount = 0; csatsumma = 0; overduecount = 0;
            page = 1; maxpage = 0;

            let localAFRTUntarget = 0, localAFRTTarget = 0;

            do {
                const tBodyStatisticaOther = JSON.stringify({
                    serviceId: CONFIGSTAT.SERVICE_ID, mode: "Json",
                    participatingOperatorsIds: [operatorIds[i]],
                    tsFrom: dateFrom, tsTo: dateTo,
                    orderBy: "ts", orderDirection: "Asc", page, limit: 100
                });

                try {
                    const response = await doOperationsWithHistory(tBodyStatisticaOther);
                    console.log(`📦 Страница ${page}: получено ${response.items?.length || 0} чатов из ${response.total || 0}`);

                    if (!response?.items?.length) break;

                    for (const item of response.items) {
                        // Сброс флагов
                        let flagFoundQueue = 0, flagFoundOperGroup = 0, flagChatIsInQueue = -1;
                        let groupFoundIndex = -1;

                        const fres = await fetch(
                            `${CONFIGSTAT.API.BASE_URL}${CONFIGSTAT.API.CONVERSATIONS}/${item.conversationId}`,
                            { headers: { "x-csrf-token": aftoken }, credentials: "include" }
                        ).then(r => r.json());

                        // 🎯 ЛОГИКА AFRT
                        if (fres.messages?.[fres.messages.length - 1]?.tpe === "Question") {
                            const firstMessageTime = fres.messages[fres.messages.length - 1].ts;

                            // Поиск группы
                            for (let z = fres.messages.length - 1; z >= 0; z--) {
                                const m = fres.messages[z];
                                if (m.payload?.prevGroup === undefined && m.payload?.group === "c7bbb211-a217-4ed3-8112-98728dc382d8") {
                                    groupFoundIndex = z; break;
                                }
                            }

                            if (groupFoundIndex !== -1) {
                                for (let b = groupFoundIndex; b >= 0; b--) {
                                    const m = fres.messages[b];

                                    if (m.tpe && typeof m.txt === 'string' && m.txt.includes("специалисты заняты")) {
                                        flagChatIsInQueue = b;
                                        if (flagChatIsInQueue !== -1) {
                                            for (let v = flagChatIsInQueue; v >= 0; v--) {
                                                const mv = fres.messages[v];
                                                if (["AnswerOperatorWithBot", "AnswerOperator"].includes(mv.tpe)) {
                                                    const diff = (new Date(mv.ts) - new Date(firstMessageTime)) / 1000;
                                                    if (diff > 60) { massivchikQueue.add(fres.id); }
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    if (["AnswerOperatorWithBot", "AnswerOperator"].includes(m.tpe)) {
                                        const diff = (new Date(m.ts) - new Date(firstMessageTime)) / 1000;
                                        if (diff > 60) {
                                            massivchikUntarget.add(fres.id);
                                            localAFRTUntarget++;
                                        } else {
                                            massivchikTarget.add(fres.id);
                                            localAFRTTarget++;
                                        }
                                        break;
                                    }
                                }
                            }
                        }

                        // 📊 Сбор статистики
                        if (fres.operatorId === operatorIds[i]) {
                            operclschatcount++;
                            totalChatsClosed[i] = operclschatcount;

                            // Заполнение filteredarray
                            window.filteredarray.push({
                                id: "operator" + (i + 1),
                                chatHashId: item.conversationId,
                                Duration: item.stats?.conversationDuration ? (item.stats.conversationDuration / 60000).toFixed(1) : "0.0",
                                Rate: item.stats?.rate?.rate ?? null,
                                Channel: item.channel?.name ?? ""
                            });

                            // CSAT
                            if (item.stats?.rate?.rate && item.channel?.name !== "Telegram techsup acquisition") {
                                csatcount++;
                                csatsumma += item.stats.rate.rate;
                                arraycsatcount[i] = csatcount;
                                arraycsatsumma[i] = csatsumma;
                            }

                            // SLA (просрочка > 25 мин)
                            const durationMin = item.stats?.conversationDuration ? (item.stats.conversationDuration / 60000) : 0;
                            if (durationMin > CONFIGSTAT.SLA_THRESHOLD_MINUTES) {
                                overduecount++;
                                operatorOverdueChats[i] = overduecount;
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

            console.log(`✅ Оператор ${i + 1}: закрыто=${operclschatcount}, CSAT=${csatcount}, SLA просрочено=${overduecount}`);

            // 🎯 ОБНОВЛЕНИЕ ЯЧЕЕК ТАБЛИЦЫ — ИСПРАВЛЕНО
            if (slaDataCells[i]) {
                const slaPercent = operclschatcount > 0
                    ? (100 - (operatorOverdueChats[i] || 0) / operclschatcount * 100).toFixed(1) + '%'
                    : '100%';
                slaDataCells[i].textContent = slaPercent;
                console.log(`📊 SLA ячейка ${i} обновлена:`, slaPercent);
            } else {
                console.warn(`⚠️ SLA ячейка ${i} не найдена!`);
            }

            if (csatDataCells[i]) {
                const csatAvg = (arraycsatcount[i] && arraycsatsumma[i])
                    ? (arraycsatsumma[i] / arraycsatcount[i]).toFixed(2)
                    : 'No marks!';
                csatDataCells[i].textContent = csatAvg;
                console.log(`📊 CSAT ячейка ${i} обновлена:`, csatAvg);
            } else {
                console.warn(`⚠️ CSAT ячейка ${i} не найдена!`);
            }

            // Агрегация
            if (arraycsatcount[i] && arraycsatsumma[i]) {
                alloperCSATsumma += arraycsatsumma[i];
                alloperCSATcount += arraycsatcount[i];
            }

            if (operatorOverdueChats[i]) {
                alloperSLAclsed += operatorOverdueChats[i];
                alloperChatsclsed += totalChatsClosed[i];
            }

            if (localAFRTUntarget || localAFRTTarget) {
                alloperaboveAFRT += (localAFRTUntarget + localAFRTTarget);
            }

            // Прогресс-бар
            currentWidth += step;
            if (progressBar) {
                progressBar.style.width = `${currentWidth.toFixed(1)}%`;
                progressBar.textContent = `${currentWidth.toFixed(1)}%`;
            }
        }

        // 🎯 ПОДСЧЁТ rateCounts
        window.filteredarray.forEach(item => {
            if (item.Rate !== null && item.Channel !== "Telegram techsup acquisition") {
                rateCounts[item.Rate] = (rateCounts[item.Rate] || 0) + 1;
            }
        });
        console.log('📊 rateCounts:', rateCounts);

        // 🎯 ФИНАЛЬНЫЕ РАСЧЁТЫ
        const uniqueIdsArrayUntarget = Array.from(massivchikUntarget);
        const uniqueIdsArrayTarget = Array.from(massivchikTarget);
        const uniquedArrayAllLength = uniqueIdsArrayUntarget.length + uniqueIdsArrayTarget.length;

        // Формулы
        const calcChatsClsContainer = alloperChatsclsed > 0
            ? ((((alloperChatsclsed - alloperSLAclsed) * 100) / 81) - alloperChatsclsed).toFixed(1)
            : '0.0';
        const calcAFRTContainer = uniquedArrayAllLength > 0
            ? (((uniqueIdsArrayTarget.length * 100) / 86) - uniquedArrayAllLength).toFixed(1)
            : '0.0';

        // 🎨 ОБНОВЛЕНИЕ DOM
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        const setHTML = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

        // Средний CSAT
        if (alloperCSATcount > 0) {
            set('avgCsatonGroup', (alloperCSATsumma / alloperCSATcount).toFixed(2));
        } else {
            set('avgCsatonGroup', 'N/A');
        }

        // Разбивка по оценкам
        setHTML('CSATDetails', `
            <br>
            Оценка 5 😊: ${rateCounts['5'] || 0} (${(rateCounts['5'] || 0) * 5})<br>
            Оценка 4 🥴: ${rateCounts['4'] || 0} (${(rateCounts['4'] || 0) * 4})<br>
            Оценка 3 😐: ${rateCounts['3'] || 0} (${(rateCounts['3'] || 0) * 3})<br>
            Оценка 2 🤢: ${rateCounts['2'] || 0} (${(rateCounts['2'] || 0) * 2})<br>
            Оценка 1 🤬: ${rateCounts['1'] || 0} (${(rateCounts['1'] || 0) * 1})
        `);

        // Всего закрыто
        set('allChatsClsd', alloperChatsclsed);

        // SLA
        const slaPercent = alloperChatsclsed > 0
            ? ((alloperChatsclsed - alloperSLAclsed) / alloperChatsclsed * 100).toFixed(1) + '%'
            : '100%';
        const slaCalcColor = Number(calcChatsClsContainer) < 0 ? 'coral' : 'rgb(83, 219, 75)';
        setHTML('SLAonGroup', `
            ${slaPercent} Всего влияли на SLA Completed: ${alloperChatsclsed} из них:
            <div style="margin-top:5px;padding-left:15px;border-left:2px solid #555">
                •🚫Вне таргета: ${alloperSLAclsed}<br>
                • ✅В таргете: ${alloperChatsclsed - alloperSLAclsed}<br>
                🎯Для таргета 81% можем позволить просрочить:
                <span style="color:${slaCalcColor}; font-weight:700">${calcChatsClsContainer}</span> чатов
            </div>
        `);

        // AFRT
        const afrtPercent = uniquedArrayAllLength > 0
            ? ((uniqueIdsArrayTarget.length / uniquedArrayAllLength) * 100).toFixed(1) + '%'
            : '100%';
        const afrtCalcColor = Number(calcAFRTContainer) < 0 ? 'coral' : 'rgb(83, 219, 75)';
        const afrtExtra = Number(calcAFRTContainer) < 0
            ? `<span> (чтобы выйти в таргет, необходимо вовремя дать ответ в: <strong style="color:coral">${Math.abs(calcAFRTContainer * 6.2).toFixed(1)}</strong> чатах)</span>`
            : '';
        setHTML('AFRTGroup', `
            ${afrtPercent} Всего влияли на AFRT: ${uniquedArrayAllLength} из них:
            <div style="margin-top:5px;padding-left:15px;border-left:2px solid #555">
                •🚫Вне таргета: ${uniqueIdsArrayUntarget.length}<br>
                • ✅В таргете: ${uniqueIdsArrayTarget.length}<br>
                🎯Для таргета 86% можем позволить просрочить:
                <span style="color:${afrtCalcColor}; font-weight:700">${calcAFRTContainer}</span> чатов${afrtExtra}
            </div>
        `);

        console.group('📊 Итоги getopersSLA');
        console.log(`✅ Закрыто: ${alloperChatsclsed}`);
        console.log(`⭐ CSAT: ${alloperCSATcount ? (alloperCSATsumma / alloperCSATcount).toFixed(2) : 'N/A'}`);
        console.log(`⏱ SLA: ${slaPercent} (просрочено: ${alloperSLAclsed})`);
        console.log(`🔴 AFRT: ${uniqueIdsArrayUntarget.length} вне таргета | ${uniqueIdsArrayTarget.length} в таргете`);
        console.groupEnd();
    }
}

// ✅ Функция показа деталей по плохим оценкам (вызывается по клику)
window.showBadChatsDetails = function () {
    const data = window._badChatsData; if (!data) return;
    const icons = { 1: '🤬', 2: '🤢', 3: '😐' };
    let html = '<div style="background:#222;padding:10px;border-radius:5px;margin-top:5px">';
    [1, 2, 3].forEach(rate => {
        if (data[rate]?.length) {
            html += `<div><strong>Оценка ${rate} ${icons[rate]}:</strong><br>`;
            data[rate].slice(0, 10).forEach(id => {
                html += `<a href="https://skyeng.autofaq.ai/logs/${id}" target="_blank" style="color:#53db4b;margin-right:10px">${id}</a>`;
            });
            if (data[rate].length > 10) html += `...ещё ${data[rate].length - 10}`;
            html += '</div>';
        }
    });
    html += '</div>';
    const output = document.getElementById('outputstatafield');
    if (output) {
        const existing = output.querySelector('.bad-chats-details');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = 'bad-chats-details';
        div.innerHTML = html;
        output.appendChild(div);
    }
};

function updateAggregateStats(agg, slaOverdue, totalClosed, artAbove, afrtAbove) {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    if (agg.csatCount > 0) set('avgCsatonGroup', (agg.csatSum / agg.csatCount).toFixed(2));
    if (totalClosed > 0) {
        set('SLAonGroup', `${(100 - (slaOverdue / totalClosed) * 100).toFixed(1)}%`);
        set('ARTGroup', `${(100 - (artAbove / totalClosed) * 100).toFixed(1)}%`);
        set('AFRTGroup', `${(100 - (afrtAbove / totalClosed) * 100).toFixed(1)}%`);
    }
    // Лог для отладки
    console.group('📊 Итоги');
    console.log(`✅ Закрыто: ${totalClosed}`);
    console.log(`⭐ CSAT: ${agg.csatCount ? (agg.csatSum / agg.csatCount).toFixed(2) : 'N/A'}`);
    console.log(`⏱ SLA: ${(100 - slaOverdue / totalClosed * 100).toFixed(1)}% (просрочено: ${slaOverdue})`);
    console.log(`🔴 AFRT >${CONFIGSTAT.AFRT_THRESHOLD_SECONDS}s: ${afrtAbove} (${(afrtAbove / totalClosed * 100).toFixed(1)}%)`);
    console.groupEnd();
}

// ============================================================================
// 🧮 РАСЧЁТЫ — ВОССТАНОВЛЕНЫ ПОЛНОСТЬЮ
// ============================================================================

function calculateAverageResponseTime(messages) {
    if (!Array.isArray(messages) || !messages.length) return 0;
    let total = 0, count = 0, last = null;
    for (const m of messages) {
        const t = new Date(m.ts).getTime();
        if (m.tpe === 'AnswerClient' || m.senderType === 'client') last = t;
        else if ((m.tpe === 'AnswerOperator' || m.tpe === 'AnswerOperatorWithBot') && last) { total += (t - last) / 1000; count++; last = null; }
    }
    return count ? total / count : 0;
}

function calculateAFRT(chat) {
    const msgs = chat?.messages || []; if (!msgs.length) return { exceeded: false, diff: 0, operatorName: '' };
    let queueTime = null, answerTime = null, operatorName = '', foundGroup = false, idxGroup = -1, idxQueue = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
        const m = msgs[i];
        if (!foundGroup && m.eventTpe === "ChangeGroup" && m.payload?.prevGroup === undefined && m.payload?.group === "c7bbb211-a217-4ed3-8112-98728dc382d8") { foundGroup = true; idxGroup = i; }
        if (foundGroup) {
            if (!queueTime && m.eventTpe === "FirstTimeInQueue") { queueTime = m.ts; idxQueue = i; }
            if (!answerTime && (m.tpe === "AnswerOperator" || m.tpe === "AnswerOperatorWithBot")) answerTime = m.ts;
        }
        if (m.eventTpe === "AssignToOperator" && m.payload?.oid) operatorName = m.payload.oid;
    }
    if (queueTime && answerTime && idxGroup > idxQueue) {
        const diff = (new Date(answerTime) - new Date(queueTime)) / 1000;
        return { exceeded: diff > CONFIGSTAT.AFRT_THRESHOLD_SECONDS, diff: diff.toFixed(1), operatorName };
    }
    return { exceeded: false, diff: 0, operatorName: '' };
}

// ============================================================================
// 🪟 win_StatisticaAF — СОХРАНЁН БЕЗ ИЗМЕНЕНИЙ
// ============================================================================

var win_StatisticaAF = `<div style="display: flex; width: 750px;">
    <span style="width: 750px; min-height: 70px; max-height:700px; overflow-y:auto; overflow-x:hidden;">
        <span style="cursor: -webkit-grab;">
            <div style="margin: 5px; width: 750px; display:flex; justify-content:space-evenly;" id="stataaf_header">
                <button class="mainButton buttonHide" title="скрывает меню" id="hidestatisticaaf">hide</button>
                <button class="mainButton smallbtn" id="clearstatawindow">🧹</button>
                <input class="${otherinpth}" type="text" id="timeoutput" style="width:100px; text-align:center; font-weight: 700;" disabled></input>
                <div style="width:450px;background: #5f7875;height: 21px; border-radius:20px;"><div id="progress-bar" style="border-radius:20px; width: 0%; height: 20px; background-color: #e38118; border: 1px solid black; text-align:center; font-weight:700; color:white;"></div></div>
            </div>
            <div style="margin: 5px; width: 750px" id="periodOfStata">
                <span style="color:bisque; margin-top:5px; margin-left:10px;">Начальная дата <input class="${exttheme}" type="date" style="margin-left:20px; width:125px;" name="stData" id="dateFromStat"></span>
                <button class="mainButton" style="margin-left:15%" id="dayminusminus">◀</button>
                <button class="mainButton" id="dayplusplus">▶</button>
                <span style="color:bisque; margin-top:2px; float:right; margin-right:10px; height:28px;">Конечная дата <input class="${exttheme}" type="date" style="float:right; margin-left:20px; margin-right:10px; width:125px;" name="finData" id="dateToStat" <="" span="">
            </span>
            </div>
            <div style="width: 750px; display:flex; justify-content: space-evenly; margin-bottom:5px;">
                <button class="mainButton" id="retreivestata">Получить статистику</button>
                <button class="mainButton" id="buttonCheckStats">Проверить CSAT + тематики</button>
                <button class="mainButton" id="buttonKCpower")">Нагрузка КЦ</button>
                <button class="mainButton" id="buttonTPpower")">Нагрузка ТП</button>
            </div>
            <div id="outputstatafield" style="color:bisque;"></div>
            <span id="msgloader" style="color:bisque; display:none">⏳ Загрузка...</span>
            <div id="csatandthemes" style="width:750px; color:bisque; display:none"></div>
            <div id="loadkctp" style="width:750px; color:bisque; display:none"></div>
        </span>
</div>`;

if (typeof createWindow === 'function') {
    const w = createWindow('AF_StataAF', 'winTopStataAF', 'winLeftStataAF', win_StatisticaAF);
    if (typeof hideWindowOnDoubleClick === 'function') hideWindowOnDoubleClick('AF_StataAF');
    if (typeof hideWindowOnClick === 'function') hideWindowOnClick('AF_StataAF', 'hidestatisticaaf');
}

// ============================================================================
// 🌍 ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================================

let activeopersId, summclsd;
let rateCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
let arrayofSLA, filteredarray;
let alloperSLAclsed = 0, alloperChatsclsed = 0, alloperaboveART = 0, alloperaboveAFRT = 0;
let flagFoundQueue = 0, flagFoundOperGroup = 0, flagIsOnTPOper = 0, operFuckUpName = 0, flagFoundOperAnswer = 0;
let indexOfChangeGroup = -1, indexOfFirstTimeInQueue = -1, foundQueue, foundOperAnswer, foundQueueTime, foundOperAnswerTime, differenceInSeconds;

function resetRateCounts() { rateCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }; console.log("Rate counts reset."); }

// ============================================================================
// 🎬 ИНИЦИАЛИЗАЦИЯ
// ============================================================================

function getbuttonGetStatButtonPress() {
    const win = document.getElementById('AF_StataAF'); if (!win) return;
    if (win.style.display === 'none') {
        win.style.display = '';
        const menu = document.getElementById('idmymenu'); if (menu) menu.style.display = 'none';
        const btn = document.getElementById('MainMenuBtn'); if (btn) btn.classList.remove('activeScriptBtn');
        if (document.querySelector('.user_menu-dropdown-user_name')?.textContent.split('-')[0] === "Prem") {
            const tp = document.getElementById('buttonTPpower'); if (tp) tp.style.display = "none";
        }
    } else {
        const menu = document.getElementById('idmymenu'); if (menu) menu.style.display = 'none';
        win.style.display = 'none';
        const btn = document.getElementById('MainMenuBtn'); if (btn) btn.classList.remove('activeScriptBtn');
    }
    const now = new Date(), today = now.toISOString().split('T')[0];
    const f = document.getElementById("dateFromStat"), t = document.getElementById("dateToStat");
    if (f && !f.value) f.value = today; if (t && !t.value) t.value = today;

    const retrieve = document.getElementById('retreivestata');
    if (retrieve) retrieve.onclick = function () {
        ['csatandthemes', 'loadkctp'].forEach(id => { const el = document.getElementById(id); if (el && el.style.display === "") el.style.display = "none"; });
        const out = document.getElementById('outputstatafield'); if (out) out.style.display = "";
        ['retreivestata', 'buttonCheckStats', 'buttonKCpower', 'buttonTPpower'].forEach(id => { const b = document.getElementById(id); if (b) b.classList.remove('active-stat-tab'); });
        if (retrieve) retrieve.classList.add('active-stat-tab');
        showLoader(); const bar = document.getElementById('progress-bar'); if (bar) { bar.innerHTML = ''; bar.style.width = '0'; }
        const time = document.getElementById("timeoutput"); if (time) time.value = new Date().toLocaleTimeString('ru-RU');
        getStats();
    };
}

const clearBtn = document.getElementById('clearstatawindow');
if (clearBtn) clearBtn.onclick = function () {
    ['csatandthemes', 'outputstatafield', 'loadkctp'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ''; });
    const time = document.getElementById('timeoutput'), bar = document.getElementById('progress-bar');
    if (time) time.value = ''; if (bar) { bar.innerHTML = ''; bar.style.width = '0'; }
};

const adjustDate = (id, delta) => { const el = document.getElementById(id); if (!el?.value) return; const d = new Date(el.value); d.setDate(d.getDate() + delta); el.value = d.toISOString().split('T')[0]; };
const plus = document.getElementById('dayplusplus'), minus = document.getElementById('dayminusminus');
if (plus) plus.onclick = () => { adjustDate('dateFromStat', 1); adjustDate('dateToStat', 1); };
if (minus) minus.onclick = () => { adjustDate('dateFromStat', -1); adjustDate('dateToStat', -1); };

// ============================================================================
//# 🔍 checkCSAT — ПОЛНОЕ ВОССТАНОВЛЕНИЕ ДЕТАЛЕЙ
// ============================================================================

async function checkCSAT() {
    let str = document.createElement('p');
    str.style.paddingLeft = '50px';

    // Время запроса
    let dateReq = new Date();
    let hoursReq = String(dateReq.getHours()).padStart(2, '0');
    let minutesReq = String(dateReq.getMinutes()).padStart(2, '0');
    let secondsReq = String(dateReq.getSeconds()).padStart(2, '0');
    document.getElementById("timeoutput").value = `${hoursReq} : ${minutesReq} : ${secondsReq}`;

    // Переключение табов
    ['retreivestata', 'buttonCheckStats', 'buttonKCpower', 'buttonTPpower'].forEach(id => {
        const b = document.getElementById(id); if (b) b.classList.remove('active-stat-tab');
    });
    const checkBtn = document.getElementById('buttonCheckStats');
    if (checkBtn) { checkBtn.classList.add('active-stat-tab'); checkBtn.textContent = 'Загрузка'; }

    document.getElementById('outputstatafield').style.display = 'none';
    document.getElementById('loadkctp').style.display = 'none';
    const csatDiv = document.getElementById('csatandthemes');
    if (csatDiv) { csatDiv.style.display = ''; csatDiv.innerHTML = ''; csatDiv.appendChild(str); }
    const loader = document.getElementById('msgloader');
    if (loader) loader.style.display = '';

    // Даты
    const padStart = (s, len, pad) => String(s).padStart(len, pad);
    const getFormattedDate = (date) => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        return `${d.getFullYear()}-${padStart(d.getMonth() + 1, 2, '0')}-${padStart(d.getDate(), 2, '0')}T21:00:00.000z`;
    };

    const dateFromStatInput = document.getElementById("dateFromStat");
    const selectedDate = new Date(dateFromStatInput.value);
    const leftDateFromGrab = getFormattedDate(selectedDate);

    const dateToStatInput = document.getElementById("dateToStat");
    const selectedEndDate = new Date(dateToStatInput.value);
    const rightDateToGrab = `${selectedEndDate.getFullYear()}-${padStart(selectedEndDate.getMonth() + 1, 2, '0')}-${padStart(selectedEndDate.getDate(), 2, '0')}T20:59:59.059z`;

    try {
        let page = 1;
        let stringChatsWithoutTopic = "";
        let csatScore = 0, csatCount = 0;
        let flagok = [];
        let tagsarr = [];
        let count = {};
        let flagvbad = "", flagbad = "", flagmid = "";
        let clschatarr = [];
        let abovecloseslaarr = "";
        let slacount = 0;
        let aclosedchats = [];

        while (true) {
            const servicetopic = '361c681b-340a-4e47-9342-c7309e27e7b5';
            const test = await fetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                headers: { "content-type": "application/json", "x-csrf-token": aftoken },
                body: JSON.stringify({
                    serviceId: servicetopic, mode: "Json",
                    tsFrom: leftDateFromGrab, tsTo: rightDateToGrab,
                    orderBy: "ts", orderDirection: "Asc", page, limit: 100
                }),
                method: "POST", credentials: "include"
            }).then(r => r.json());

            for (let i = 0; i < test.items.length; i++) {
                let flagCsat = 0, flagTopic = 0;

                const chat = await doOperationsWithConversations(test.items[i].conversationId).then(r => r.json());
                console.log('Messages:', chat.messages);
                console.log('Last message:', chat.messages?.[chat.messages.length - 1]);

                if (typeof operatorId !== 'undefined' && chat.operatorId !== operatorId) {
                    continue;
                }

                clschatarr.push(test.items[i].conversationId);

                const autoClosedMsg = chat.messages?.find(msg =>
                    msg.eventTpe === 'CloseConversation' &&
                    msg.payload?.src === "inactivity_timer"
                );

                if (autoClosedMsg) {
                    aclosedchats.push(
                        '<span style="color: #dfd1f5; font-weight:700">&#5129;</span> ' +
                        '<span name="aclsconv">' + test.items[i].conversationId + '</span> ' +
                        '<span class="lookaclschat" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>'
                    );
                }

                // Теги
                if (chat.payload == undefined || chat.payload.tags == undefined || chat.payload.tags.value == '') {
                    tagsarr.push('Нет тега!');
                } else if (chat.payload.tags.value === '[\n  "queue"\n]') {
                    tagsarr.push('Тег: Очередь КЦ');
                } else if (chat.payload.tags.value === '[\n  "request_forwarded_to_2l_tp"\n]') {
                    tagsarr.push('Тег: 2ЛТП');
                } else {
                    let tagStr = chat.payload.tags.value;
                    tagStr = tagStr.replace(/[\[\]"\n]/g, '').replace(/,\s*/g, ', ');
                    tagsarr.push(tagStr.trim() || 'Нет тега!');
                }

                flagCsat = 1;
                if (chat.payload?.topicId?.value === "") flagTopic = 1;

                // ✅ ИСПРАВЛЕНО: парсинг даты с [UTC] или [GMT]
                for (let k = 0; k < clschatarr.length; k++) {
                    if (test.items[i].conversationId === clschatarr[k]) {
                        if ((test.items[i].stats?.conversationDuration || 0) / 1000 / 60 > 25) {
                            slacount++;

                            // ✅ ПРАВИЛЬНЫЙ ПАРСИНГ: [UTC] или [GMT]
                            let tsRaw = test.items[i].ts;
                            let tsClean = tsRaw;
                            if (typeof tsRaw === 'string') {
                                if (tsRaw.includes('[UTC]')) {
                                    tsClean = tsRaw.split('[UTC]')[0];
                                } else if (tsRaw.includes('[GMT]')) {
                                    tsClean = tsRaw.split('[GMT]')[0];
                                }
                            }
                            let tmestmp = new Date(tsClean);

                            // Fallback если дата невалидная
                            if (isNaN(tmestmp.getTime())) {
                                tmestmp = new Date();
                            }

                            // Время МСК (UTC+3) — как в оригинале
                            let tshrs, tsmin;
                            let mskHours = (tmestmp.getUTCHours() + 3) % 24;

                            if (mskHours < 10)
                                tshrs = "0" + mskHours;
                            else
                                tshrs = mskHours;

                            if (tmestmp.getUTCMinutes() < 10)
                                tsmin = "0" + tmestmp.getUTCMinutes();
                            else
                                tsmin = tmestmp.getUTCMinutes();

                            abovecloseslaarr += (
                                '<span style="color: red; font-weight:700">&#5129;</span> ' +
                                '<a href="https://skyeng.autofaq.ai/logs/' + clschatarr[k] + '" style="color:LightGoldenrod;" class="slaclchatids">' +
                                clschatarr[k] + '</a> Время чата: ' +
                                (test.items[i].stats.conversationDuration / 1000 / 60).toFixed(1) +
                                '<span class="lookchat" style="margin-left: 10px; cursor: pointer">👁‍🗨</span> ' +
                                'Создан чат в: ' + tshrs + ":" + tsmin + ' МСК ' + (tagsarr[k] || '') + '<br>'
                            );
                        }
                    }
                }

                // CSAT
                if (flagCsat === 1 && test.items[i].stats?.rate?.rate !== undefined) {
                    csatScore += test.items[i].stats.rate.rate;
                    csatCount++;
                    flagok.push(test.items[i].stats.rate.rate);
                    if (test.items[i].stats.rate.rate === 1) flagvbad += '• ' + test.items[i].stats.conversationId + '<br>';
                    if (test.items[i].stats.rate.rate === 2) flagbad += '• ' + test.items[i].stats.conversationId + '<br>';
                    if (test.items[i].stats.rate.rate === 3) flagmid += '• ' + test.items[i].stats.conversationId + '<br>';
                }

                if (flagTopic === 1) {
                    stringChatsWithoutTopic += '<a href="https://skyeng.autofaq.ai/logs/' + test.items[i].conversationId + '" target="_blank">' + test.items[i].conversationId + '</a><br>';
                }
            }

            if (test.total / 100 >= page) {
                page++;
            } else {
                if (stringChatsWithoutTopic === "") stringChatsWithoutTopic = ' нет чатов без тематики';

                flagok.forEach(function (i) { count[i] = (count[i] || 0) + 1; });
                [1, 2, 3, 4, 5].forEach(n => { if (count[n] === undefined) count[n] = 0; });

                const avg = csatCount > 0 ? Math.round(csatScore / csatCount * 100) / 100 : 'N/A';
                const totalForPct = clschatarr.length > 0 ? clschatarr.length : 1;
                const slaPct = (100 - (slacount / totalForPct) * 100).toFixed(1);

                let firstpart = 'Оценка: ' + avg + '<br>' +
                    'Чаты без тематики (по клику откроет безопасно в новой вкладке без необходимости перелогина): <br>' +
                    "Количество оценок: " + csatCount + ' из них: ' + '<br>';

                let secondpart = stringChatsWithoutTopic + '<br>' +
                    "Чаты СЛА закрытия > 25 m: " + '<br>' + abovecloseslaarr + '<br>' +
                    'Количество просроченных чатов: ' + slacount + " SLA Закрытия: " + slaPct + '%' + '<br>' +
                    'Чаты, которые были автозакрыты, проверить потерявшиеся и необработанные чаты: ' + '<br>' +
                    (aclosedchats.join('<br>') || '—');

                if (loader) loader.style.display = "none";

                if (flagvbad === "" && flagbad === "" && flagmid === "") {
                    str.innerHTML = firstpart +
                        'Оценка 1 🤬: ' + count[1] + '<br>' +
                        'Оценка 2 🤢: ' + count[2] + '<br>' +
                        'Оценка 3 😐: ' + count[3] + '<br>' +
                        'Оценка 4 🥴: ' + count[4] + '<br>' +
                        'Оценка 5 😊: ' + count[5] + '<br>' + secondpart;
                } else {
                    str.innerHTML = firstpart +
                        'Оценка 1 🤬: ' + count[1] + '<br>' + (flagvbad || '') +
                        'Оценка 2 🤢: ' + count[2] + '<br>' + (flagbad || '') +
                        'Оценка 3 😐: ' + count[3] + '<br>' + (flagmid || '') +
                        'Оценка 4 🥴: ' + count[4] + '<br>' +
                        'Оценка 5 😊: ' + count[5] + '<br>' + secondpart;
                }
                break;
            }
        }
    } catch (e) {
        console.error('❌ checkCSAT:', e, e.stack);
        str.innerHTML = `<span style="color:red">Ошибка: ${e.message}</span>`;
        if (loader) loader.style.display = 'none';
    } finally {
        if (checkBtn) checkBtn.textContent = 'Проверить CSAT + тематики';
    }

    // ✅ ВАШ КОД + минимальные проверки на null
    const slaclchatcontainer = document.querySelectorAll('.lookchat');
    const slaclchattids = document.querySelectorAll('.slaclchatids');
    const aclsclookcontainer = document.querySelectorAll('.lookaclschat');
    const aclsdchatids = document.getElementsByName('aclsconv');
    const chatHistoryElement = document.getElementById('AF_ChatHis');
    const chatHistoryButton = document.getElementById('opennewcat');
    const chatHistorySearchInput = document.getElementById('hashchathis');
    const chatHistorySearchButton = document.getElementById('btn_search_history');

    slaclchatcontainer.forEach((container, index) => {
        container.addEventListener('click', () => {
            // ✅ ПРОВЕРКИ: если элемент есть — кликаем
            if (chatHistoryElement && chatHistoryElement.style.display === 'none' && chatHistoryButton) {
                chatHistoryButton.click();
            }
            if (chatHistorySearchInput && slaclchattids[index]) {
                chatHistorySearchInput.value = slaclchattids[index].textContent;
            }
            if (chatHistorySearchButton) {
                chatHistorySearchButton.click();
            }
        });
    });

    aclsclookcontainer.forEach((container, index) => {
        container.addEventListener('click', () => {
            if (chatHistoryElement && chatHistoryElement.style.display === 'none' && chatHistoryButton) {
                chatHistoryButton.click();
            }
            if (chatHistorySearchInput && aclsdchatids[index]) {
                chatHistorySearchInput.value = aclsdchatids[index].textContent;
            }
            if (chatHistorySearchButton) {
                chatHistorySearchButton.click();
            }
        });
    });
}

// ============================================================================
// 📊 checkload — оптимизированная
// ============================================================================

async function checkload(department, flag) {
    const time = document.getElementById("timeoutput"); if (time) time.value = new Date().toLocaleTimeString('ru-RU');
    ['retreivestata', 'buttonCheckStats', 'buttonKCpower', 'buttonTPpower'].forEach(id => { const b = document.getElementById(id); if (b) b.classList.remove('active-stat-tab'); });
    if (flag === 'КЦ' && document.getElementById('buttonKCpower')) document.getElementById('buttonKCpower').classList.add('active-stat-tab');
    if (flag === 'ТП' && document.getElementById('buttonTPpower')) document.getElementById('buttonTPpower').classList.add('active-stat-tab');

    const out = document.getElementById('outputstatafield'), csat = document.getElementById('csatandthemes'), load = document.getElementById('loadkctp'), loader = document.getElementById('msgloader');
    if (out) out.style.display = 'none'; if (csat) csat.style.display = 'none';
    if (load) { load.innerHTML = '⏳'; load.style.display = ''; } if (loader) loader.style.display = '';

    try {
        const stat = await fetchStaticDataStat();
        const sec = document.querySelector('.user_menu-dropdown-user_name')?.textContent.split('-')[0];
        const deptPat = (sec === 'Prem' || sec === 'ТПPrem') ? 'Prem' : department;
        const ops = (stat.onOperator || []).filter(o => o.operator?.fullName?.match(deptPat) && o.operator.status !== 'Offline').map(o => ({ name: o.operator.fullName, status: { Online: '🟢', Busy: '🟡', Pause: '🔴' }[o.operator.status] || '⚪', chats: o.aCnt || 0 }));
        const onLine = ops.filter(o => o.status === '🟢').length, busy = ops.filter(o => o.status === '🟡').length, pause = ops.filter(o => o.status === '🔴').length;
        const totalChats = ops.reduce((s, o) => s + o.chats, 0), ratio = onLine ? totalChats / onLine : 0;
        const loadTxt = ratio <= 2.2 ? 'Низкая' : ratio <= 3.2 ? 'Средняя' : ratio <= 4.4 ? 'Высокая' : 'Критическая';
        if (load) load.innerHTML = `<p style="padding-left:50px">${ops.map(o => `${o.status} ${o.name} | Чатов: ${o.chats}`).join('<br>')}<br><br><strong>На линии:</strong> ${ops.length} (🟢${onLine} 🟡${busy} 🔴${pause})<br><strong>Чатов:</strong> ${totalChats} | <strong>Нагрузка:</strong> ${loadTxt} (${ratio.toFixed(1)} чат/оп)</p>`;
    } catch (e) { console.error('checkload:', e); if (load) load.innerHTML = `<span style="color:red">Ошибка: ${e.message}</span>`; }
    finally { if (loader) loader.style.display = 'none'; }
}

document.getElementById("buttonCheckStats").addEventListener("click", checkCSAT);
document.getElementById("buttonKCpower").addEventListener("click", function () {
    checkload(/КЦ/, 'КЦ');
});
document.getElementById("buttonTPpower").addEventListener("click", function () {
    checkload(/ТП/, 'ТП');
});

// ============================================================================
// 🎯 ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof getbuttonGetStatButtonPress === 'function') getbuttonGetStatButtonPress();
    const cb = document.getElementById("buttonCheckStats"), kc = document.getElementById("buttonKCpower"), tp = document.getElementById("buttonTPpower");
    if (kc) kc.addEventListener("click", () => checkload(/КЦ/, 'КЦ'));
    if (tp) tp.addEventListener("click", () => checkload(/ТП/, 'ТП'));
});

// Экспорт
window.getStats = getStats; window.checkCSAT = checkCSAT; window.checkload = checkload; window.resetRateCounts = resetRateCounts; window.getDateRangeStata = getDateRangeStata;