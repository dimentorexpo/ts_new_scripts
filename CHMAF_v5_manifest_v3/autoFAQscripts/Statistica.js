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

async function doOperationsWithHistory(body = "") {
    return apiFetch(CONFIGSTAT.API.CONVERSATIONS_HISTORY, body, 'POST');
}
async function fetchStaticDataStat() {
    return apiFetch(CONFIGSTAT.API.OPERATORS_STATS);
}
async function doOperationsWithConversations(id) {
    return fetch(`${CONFIGSTAT.API.BASE_URL}${CONFIGSTAT.API.CONVERSATIONS}/${id}`, {
        headers: { 'x-csrf-token': aftoken },
        credentials: 'include'
    });
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
    // Уменьшен шрифт и padding для компактности
    const table = Object.assign(document.createElement('table'), { id: 'tableStats', style: 'table-layout:auto;width:750px;text-align:center;border-collapse:collapse;font-size:13px' });
    const columns = ["👨‍💻Оператор", "💪Закрыто", "⚡Пощупано", "🕒SLA", "⚠AvgCSAT", "🤖%A3"];

    const thead = document.createElement('thead'), headerRow = document.createElement('tr');
    headerRow.style.backgroundColor = 'hsl(210, 53%, 48%)';

    columns.forEach(text => {
        const th = Object.assign(document.createElement('th'), { textContent: text, style: 'padding:5px 8px;border:1px solid #dee2e6;font-weight:600' });
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    const fragment = document.createDocumentFragment();

    operators.forEach((op) => {
        const tr = Object.assign(document.createElement('tr'), { style: 'borderBottom:1px solid #eee' });
        tr.style.border = '1px solid bisque';

        const isCurrent = op.operator === currentOperator;
        const nameStyle = `text-align:left;padding:4px 8px${isCurrent ? ';color:#53db4b;font-weight:700;text-shadow:1px 2px 5px rgba(0,0,0,0.55)' : ''}`;

        const tdName = Object.assign(document.createElement('td'), { textContent: op.operator, style: nameStyle });
        tr.appendChild(tdName);['chtclosed', 'chtcnt', 'sladata', 'csatdata', 'aclosedchatsdata'].forEach((attr, i) => {
            const td = document.createElement('td');
            td.style.padding = '4px 8px'; // Компактный padding
            td.style.border = '1px solid bisque';
            if (attr === 'chtcnt') {
                td.textContent = chatCountMap.get(op.operator) ?? 0;
                td.className = 'chtcnt';
            } else {
                td.innerHTML = '<span style="font-size: 10px; opacity: 0.7;">⏳</span>';
                td.setAttribute('name', attr);
            }
            tr.appendChild(td);
        });

        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
    table.appendChild(tbody);

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

    // Считаем только пощупанные сразу, закрытые теперь будут "⏳", пока не посчитаются реальные
    const totalTouched = operators.reduce((s, o) => s + (chatCountMap.get(o.operator) ?? 0), 0);

    const summary = Object.assign(document.createElement('div'), { style: 'margin:15px 0 0 50px;font-size:14px;line-height:1.8' });

    const stats = [
        { label: '📦 Закрыто чатов:', value: '<span id="allChatsClsd">⏳</span>' },
        { label: '✋ Пощупано чатов:', value: totalTouched },
        { label: '🌟 Средний CSAT:', value: '<span id="avgCsatonGroup">⏳</span>' },
        { label: '📋 Разбивка по оценкам:', value: '<span id="CSATDetails">⏳</span>' },
        { label: '🕒 SLA закрытия:', value: '<span id="SLAonGroup">⏳</span>' },
        { label: '🚀 AFRT:', value: '<span id="AFRTGroup">⏳</span>' },
    ];

    stats.forEach(stat => {
        const div = document.createElement('div');
        div.innerHTML = `${stat.label} <strong>${stat.value}</strong>`;
        summary.appendChild(div);
    });

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

    let massivchikUntarget = new Set(), massivchikTarget = new Set(), massivchikQueue = new Set();

    const closedchatsDataCells = document.getElementsByName('chtclosed');
    const slaDataCells = document.getElementsByName('sladata');
    const csatDataCells = document.getElementsByName('csatdata');
    const aclosedchatsDataCells = document.getElementsByName('aclosedchatsdata');

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
                        const autoClosedMsg = messages.find(msg => msg.eventTpe === 'CloseConversation' && ["inactivity_timer", "pause"].includes(msg.payload?.src));
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

        if (arraycsatcount[i] && arraycsatsumma[i]) { alloperCSATsumma += arraycsatsumma[i]; alloperCSATcount += arraycsatcount[i]; }
        if (operatorOverdueChats[i]) { alloperSLAclsed += operatorOverdueChats[i]; alloperChatsclsed += totalChatsClosed[i]; }
        if (localAFRTUntarget || localAFRTTarget) alloperaboveAFRT += (localAFRTUntarget + localAFRTTarget);

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
    const data = window.operatorAutoClosedDetails[idx];
    if (!data) return;

    // Удаляем старое окно, если оно зависло
    if (document.getElementById('acls-modal-container')) {
        document.getElementById('acls-modal-container').remove();
    }

    const createListHtml = (list) => {
        if (!list.length) return '<div style="color:gray; font-size:12px; text-align:center; padding-top:10px;">Нет чатов</div>';
        return list.map(hash => `
            <div class="modal-lookchat" data-hash="${hash}" title="Нажмите, чтобы открыть чат в истории"
                 style="margin-bottom:6px; background:rgba(255,255,255,0.05); padding:6px 10px; border-radius:4px; cursor:pointer; color:#dfd1f5; font-family:monospace; font-size:13px; text-align:center; border: 1px solid transparent; transition: all 0.2s;"
                 onmouseover="this.style.background='rgba(83,219,75,0.1)'; this.style.borderColor='#53db4b'; this.style.color='#fff'"
                 onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='transparent'; this.style.color='#dfd1f5'">
                <!-- pointer-events: none гарантирует, что клик попадёт именно по родительскому DIV -->
                <span style="pointer-events: none;">${hash}</span>
            </div>
        `).join('');
    };

    const overlay = document.createElement('div');
    overlay.id = 'acls-modal-container';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        zIndex: '9999', pointerEvents: 'none'
    });

    // 🎯 Восстанавливаем позицию или ставим по центру
    let startLeft = Math.max(0, (window.innerWidth - 650) / 2);
    let startTop = Math.max(0, (window.innerHeight - 500) / 2);

    if (window.lastModalPos) {
        startLeft = Math.min(window.lastModalPos.left, window.innerWidth - 650);
        startLeft = Math.max(0, startLeft);
        startTop = Math.min(window.lastModalPos.top, window.innerHeight - 200);
        startTop = Math.max(0, startTop);
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
        <div class="acls-modal-header" style="padding:15px 20px; border-bottom:1px solid #5f7875; display:flex; justify-content:space-between; align-items:flex-start; background: rgb(55 52 71); cursor:grab; border-top-left-radius:8px; border-top-right-radius:8px; user-select:none;">
            <div>
                <h3 style="margin:0; font-size:16px; font-weight:600; color:bisque;">Детали %A3: <span style="color:#53db4b">${opName}</span></h3>
                <div style="font-size:13px; color:#aaa; margin-top:6px;">
                    Всего закрыто: <b style="color:bisque">${data.totalClosed}</b> |
                    Чатов АЗ: <b style="color:#e38118">${data.inactivity.length}</b> |
                    Чатов отложек с АЗ: <b style="color:#53db4b">${data.pause.length}</b>
                </div>
            </div>
            <button id="close-acls-modal" style="background:none; border:none; color:bisque; cursor:pointer; font-size:26px; line-height:1; transition:color 0.2s; padding:0; margin:-5px 0 0 0;">&times;</button>
        </div>
        <div style="display:flex; flex:1; overflow:hidden; padding:15px; gap:15px; background:#464451">
            <!-- Колонка 1: inactivity_timer -->
            <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #5f7875; padding:10px; background:rgba(0,0,0,0.3);">
                    ⏳ Обычные АЗ: <span style="color:#53db4b">${data.inactivity.length}</span>
                </div>
                <div style="overflow-y:auto; flex:1; padding:10px;">
                    ${createListHtml(data.inactivity)}
                </div>
            </div>
            <!-- Колонка 2: pause -->
            <div style="flex:1; display:flex; flex-direction:column; background:rgba(0,0,0,0.2); border-radius:6px; border:1px solid rgba(255,255,255,0.1);">
                <div style="text-align:center; font-weight:bold; margin-bottom:10px; border-bottom:1px solid #5f7875; padding:10px; background:rgba(0,0,0,0.3);">
                    ⏸️ Отложки с АЗ: <span style="color:#53db4b">${data.pause.length}</span>
                </div>
                <div style="overflow-y:auto; flex:1; padding:10px;">
                    ${createListHtml(data.pause)}
                </div>
            </div>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // 🎯 ЛОГИКА DRAG & DROP
    const header = modal.querySelector('.acls-modal-header');
    let isDragging = false;
    let startX, startY;

    const onMouseDown = (e) => {
        if (e.target.id === 'close-acls-modal') return;
        isDragging = true;
        header.style.cursor = 'grabbing';

        startX = e.clientX - modal.offsetLeft;
        startY = e.clientY - modal.offsetTop;
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;

        let newX = e.clientX - startX;
        let newY = e.clientY - startY;

        const maxX = window.innerWidth - modal.offsetWidth;
        const maxY = window.innerHeight - modal.offsetHeight;

        modal.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
        modal.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    };

    const onMouseUp = () => {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';

            window.lastModalPos = {
                left: parseInt(modal.style.left, 10),
                top: parseInt(modal.style.top, 10)
            };
        }
    };

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Очистка событий
    window._aclsModalCleanup = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        overlay.remove();
    };
}

// ============================================================================
// 🪟 win_StatisticaAF (СУПЕР-ДИЗАЙН ДАШБОРДА)
// ============================================================================

var win_StatisticaAF = `
<div id="af-dashboard-wrapper">
    <!-- Шапка -->
    <div id="stataaf_header">
        <div class="af-title">🚀 AutoFAQ Dashboard</div>
        <div class="af-window-controls">
            <button class="af-win-btn" id="clearstatawindow" title="Очистить данные">🧹</button>
            <button class="af-win-btn buttonHide" id="hidestatisticaaf" title="Скрыть окно">✖</button>
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
            Статистика SLA
        </button>
        <button class="af-tab" id="buttonCheckStats">
            <span class="af-tab-icon">⭐</span>
            CSAT + Тематики
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

    const today = new Date().toISOString().split('T')[0];
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
    if (checkBtn) { checkBtn.classList.add('active-stat-tab'); checkBtn.textContent = 'Загрузка...'; }

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

                const chat = await doOperationsWithConversations(item.conversationId).then(r => r.json());

                if (typeof operatorId !== 'undefined' && chat.operatorId !== operatorId) continue;

                clschatarr.push(item.conversationId);

                const autoClosedMsg = chat.messages?.find(msg => msg.eventTpe === 'CloseConversation' && msg.payload?.src === "inactivity_timer");
                if (autoClosedMsg) {
                    aclosedchats.push(`<span style="color:#dfd1f5; font-weight:700">&#5129;</span> <span name="aclsconv">${item.conversationId}</span> <span class="lookaclschat modal-lookchat" data-hash="${item.conversationId}" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>`);
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

                const mainStats = `Оценка: <strong>${avg}</strong><br>
                    Чаты без тематики: <br>${stringChatsWithoutTopic || '✅ нет чатов без тематики'}<br>
                    Количество оценок: ${csatCount}<br>`;

                const ratesBreakdown = `
                    Оценка 1 🤬: ${count[1]} <br> ${flagvbad}
                    Оценка 2 🤢: ${count[2]} <br> ${flagbad}
                    Оценка 3 😐: ${count[3]} <br> ${flagmid}
                    Оценка 4 🥴: ${count[4]} <br>
                    Оценка 5 😊: ${count[5]} <br>`;

                const slaStats = `Чаты СЛА закрытия > 25m: <br>${abovecloseslaarr}<br>
                    Просроченных: ${slacount} (SLA Закрытия: ${slaPct}%)<br>
                    Автозакрытые (потеряшки): <br>${aclosedchats.join('<br>') || '✅ нет'}`;

                str.innerHTML = mainStats + ratesBreakdown + slaStats;
                break;
            }
        }
    } catch (e) {
        console.error('❌ checkCSAT:', e);
        str.innerHTML = `<span style="color:red">Ошибка: ${e.message}</span>`;
        if (loader) loader.style.display = 'none';
    } finally {
        if (checkBtn) checkBtn.textContent = 'Проверить CSAT + тематики';
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

        if (load) load.innerHTML = `<p style="padding-left:50px">${ops.map(o => `${o.status} ${o.name} | Чатов: ${o.chats}`).join('<br>')}<br><br>
            <strong>На линии:</strong> ${ops.length} (🟢${onLine} 🟡${busy} 🔴${pause})<br>
            <strong>Чатов:</strong> ${totalChats} | <strong>Нагрузка:</strong> ${loadTxt} (${ratio.toFixed(1)} чат/оп)</p>`;
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
    if (e.target.classList.contains('acls-popup-btn')) {
        const idx = e.target.getAttribute('data-opidx');
        const opName = e.target.getAttribute('data-opname');
        renderAclsModal(idx, opName);
        return;
    }

    // 2. Обработчик клика по иконке 👁‍🗨 (открывает панель истории чата)
    if (e.target.classList.contains('modal-lookchat')) {
        const val = e.target.getAttribute('data-hash');

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
    if (e.target.id === 'close-acls-modal') {
        if (window._aclsModalCleanup) window._aclsModalCleanup();
        return;
    }

    // --- Обработка стандартных кнопок меню ---
    const targetId = e.target.id || e.target.closest('[id]')?.id;
    if (!targetId) return;

    switch (targetId) {
        case 'dayplusplus':
            adjustDate('dateFromStat', 1);
            adjustDate('dateToStat', 1);
            break;

        case 'dayminusminus':
            adjustDate('dateFromStat', -1);
            adjustDate('dateToStat', -1);
            break;

        case 'clearstatawindow': ['csatandthemes', 'outputstatafield', 'loadkctp'].forEach(id => {
            const el = document.getElementById(id); if (el) el.innerHTML = '';
        });
            const time = document.getElementById('timeoutput'), bar = document.getElementById('progress-bar');
            if (time) time.value = '';
            if (bar) { bar.style.width = '0%'; bar.textContent = ''; }
            break;

        case 'retreivestata':
            ['csatandthemes', 'loadkctp'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = "none"; });
            const out = document.getElementById('outputstatafield'); if (out) out.style.display = "";['retreivestata', 'buttonCheckStats', 'buttonKCpower', 'buttonTPpower'].forEach(id => document.getElementById(id)?.classList.remove('active-stat-tab'));
            document.getElementById('retreivestata')?.classList.add('active-stat-tab');

            showLoader();
            const progBar = document.getElementById('progress-bar'); if (progBar) { progBar.style.width = '0%'; progBar.textContent = ''; }
            const tOut = document.getElementById("timeoutput"); if (tOut) tOut.value = new Date().toLocaleTimeString('ru-RU');
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