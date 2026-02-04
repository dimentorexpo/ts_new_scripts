let testint;
let chatneraspcountleft = 0;
let prevOperatorState = new Map();

let peoplestatus = document.createElement('div');
peoplestatus.id = 'idforpeopstatus';
peoplestatus.style = 'width: 200px; color: bisque; font-size: 13px;';

const GROUP_CONFIG = {
    'ТП': {
        operatorMatch: /ТП\D/,
        queueBy: 'groupId',
        queueIds: ['c7bbb211-a217-4ed3-8112-98728dc382d8']
    },
    'ТП ОС': {
        operatorMatch: /ТП ОС\D/,
        queueBy: 'groupId',
        queueIds: ['8266dbb1-db44-4910-8b5f-a140deeec5c0']
    },
    'КЦ': {
        operatorMatch: /КЦ\D/,
        queueBy: 'groupId',
        queueIds: ['b6f7f34d-2f08-fc19-3661-29ac00842898']
    },
    'Prem': {
        operatorMatch: /Prem\D/,
        queueBy: 'kb',
        queueIds: ['121527'],
        groupIdFilter: '68932fae-b9f9-6b37-2a52-911b2b6b4f6d'
    },
    'Teachers Care': {
        operatorMatch: /Teachers Care\D/,
        sumAllUnassigned: true
    }
};

function getQueueForGroup(result, groupKey) {
    const cfg = GROUP_CONFIG[groupKey];
    if (!cfg) return 0;
    return getUnassignedCount(result, cfg);
}


function initializeStartOperStatus() {
    const sider = document.getElementsByClassName('ant-layout-sider-children');
    if (sider.length) return StartOperStatus();

    const observer = new MutationObserver(() => {
        const sider = document.getElementsByClassName('ant-layout-sider-children');
        if (sider.length) {
            StartOperStatus();
            observer.disconnect();
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
}

function StartOperStatus() {
    if (localStorage.getItem('hidesummaryflag') == null) {
        localStorage.setItem('hidesummaryflag', '1');
    }

    document.getElementsByClassName('ant-layout-sider-children')[0].append(peoplestatus);
    testint = setInterval(() => operstatusleftbar(false), 6000);
    operstatusleftbar(true);
}

function getUnassignedCount(result, cfg) {
    if (!result.unAssigned) return 0;

    if (cfg.sumAllUnassigned) {
        return result.unAssigned.reduce((s, i) => s + Number(i.count || 0), 0);
    }

    if (cfg.queueBy === 'groupId') {
        return result.unAssigned
            .filter(i => cfg.queueIds.includes(i.groupId))
            .reduce((s, i) => s + Number(i.count || 0), 0);
    }

    if (cfg.queueBy === 'kb') {
        return result.unAssigned
            .filter(i => cfg.queueIds.includes(i.kb))
            .reduce((s, i) => s + Number(i.count || 0), 0);
    }

    return 0;
}

function filterOperators(result, cfg) {
    const opstats = [];

    for (const item of result.onOperator || []) {
        const operator = item.operator;
        if (!operator) continue;

        if (!cfg.operatorMatch.test(operator.fullName || '')) continue;
        if (cfg.groupIdFilter && item.groupId !== cfg.groupIdFilter) continue;
        if (item.status === 'Offline') continue;

        opstats.push(item);
    }

    return opstats;
}

function buildOperatorList(opstats) {
    let html = '';
    let online = 0, busy = 0, pause = 0;

    opstats.sort((a, b) => a.operator.status.localeCompare(b.operator.status));

    for (const item of opstats) {
        const op = item.operator;
        const status = op.status;
        const count = item.aCnt || 0;
        const fullName = (op.fullName || '').toUpperCase();
        const isTpOs = fullName.includes('ТП ОС'); // тестим

        let color = '', bg = '', text = '';

        if (status === "Online") { online++; bg = "green"; text = "white"; }
        else if (status === "Busy") { busy++; bg = "gold"; text = "black"; color = "opacity:.8;color:Gold"; }
        else if (status === "Pause") { pause++; bg = "FireBrick"; text = "white"; color = "opacity:.8;color:Salmon"; }
        else continue;

        html += `
        <div class="leftbaropers ${isTpOs ? 'tp-os-row' : ''}"
             name="operrow"
             data-id="${op.id}"
             data-status="${status}"
             data-count="${count}"
             style="${color}"
             value="${op.id}">
            <span class="oper-count"
                  style="color:${text};background:${bg};
                         width:25px;height:25px;display:inline-flex;
                         align-items:center;justify-content:center;
                         border-radius:50%;border:1px solid black;">
                ${count}
            </span>
            ${op.fullName}
        </div>`;
    }

    return { html, online, busy, pause };
}

function buildSummaryHTML(key, currentQueue, tpQueue, tpOsQueue, html, online, busy, pause) {
    const hidesummary = localStorage.getItem('hidesummaryflag') || '1';
    const toggleText = hidesummary === '1' ? '🔽 Открыть' : '🔼 Скрыть';
    const statsDisplay = hidesummary === '1' ? 'none' : '';

    let queueBlock = '';

    // 🔥 Специальное отображение ТП блоков
    if (key === 'ТП' || key === 'ТП ОС') {

        const tpWarn = tpQueue > 10 ? ' ⚠️' : '';
        const tpOsWarn = tpOsQueue > 10 ? ' ⚠️' : '';

        queueBlock = `
        <div style="background:#792525;font-weight:700;text-align:center;border:1px solid #464343;border-radius:6px; font-size:16px">
            🚧 Очередь ТП: ${tpQueue}${tpWarn}
            <br>
            🚧 Очередь ТП ОС: ${tpOsQueue}${tpOsWarn}
        </div>`;
    }

    // 📦 Все остальные группы
    else {
        queueBlock = `
        <div style="background:#792525;font-weight:700;text-align:center;border:1px solid #464343; border-radius: 6px; font-size:16px">
            🚧Очередь: ${currentQueue}
        </div>`;
    }

    return `
        ${queueBlock}
        ${html}
        <div id="clicktounhidestatuses" style="cursor:pointer;text-align:center;">${toggleText}</div>
        <div id="opersstats" style="display:${statsDisplay};">
            <div style="background:#257947;text-align:center;">🛠 Онлайн: ${online}</div>
            <div style="background:#a3bb1d;color:black;text-align:center;">⏳ Занят: ${busy}</div>
            <div style="background:#cf4615;text-align:center;">🍔 Перерыв: ${pause}</div>
            <div style="background:#492579;text-align:center;">⚡ Всего: ${online + busy + pause}</div>
        </div>`;
}


function animateOperatorChanges() {
    document.querySelectorAll('.leftbaropers').forEach(row => {
        const id = row.dataset.id;
        const count = Number(row.dataset.count);
        const status = row.dataset.status;
        const span = row.querySelector('.oper-count');

        const prev = prevOperatorState.get(id);
        if (prev) {
            if (prev.count !== count) {
                span.classList.add(count > prev.count ? 'count-anim-up' : 'count-anim-down');
                setTimeout(() => span.classList.remove('count-anim-up', 'count-anim-down'), 400);
            }
            if (prev.status !== status) {
                row.classList.add('status-change');
                setTimeout(() => row.classList.remove('status-change'), 500);
            }
        }

        prevOperatorState.set(id, { count, status });
    });
}

function attachHandlers() {
    document.getElementById('clicktounhidestatuses')?.addEventListener('click', () => {
        const stats = document.getElementById('opersstats');
        const hidden = stats.style.display === 'none';
        stats.style.display = hidden ? '' : 'none';
        localStorage.setItem('hidesummaryflag', hidden ? '0' : '1');
    });
}

async function waitForOpSectionNew(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
            const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
            const el = iframe?.contentDocument?.querySelector('span[id^="mantine-"][id$="-target"]');
            if (el) return resolve(el.textContent.split('-')[0]);
            if (Date.now() - start > timeout) return reject();
            requestAnimationFrame(check);
        };
        check();
    });
}

async function operstatusleftbar(isManual = false) {
    try {
        const key = await waitForOpSectionNew();
        const cfg = GROUP_CONFIG[key];

        if (!cfg) {
            peoplestatus.innerHTML = '';
            return;
        }

        const response = await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", {
            headers: { "x-csrf-token": aftoken },
            credentials: "include"
        });

        const result = await response.json();

        // 🔹 Очередь текущей группы
        const currentQueue = getQueueForGroup(result, key);

        // 🔹 Спец-логика только для ТП блоков
        let tpQueue = null;
        let tpOsQueue = null;

        if (key === 'ТП' || key === 'ТП ОС') {
            tpQueue = getQueueForGroup(result, 'ТП');
            tpOsQueue = getQueueForGroup(result, 'ТП ОС');
        }

        // 🔹 Операторы
        let opstats = [];
        // ⚠️ ВАЖНО:
        // ТП и ТП ОС отображаются вместе в списке операторов
        // различие только в очередях и summary-блоке
        if (key === 'ТП ОС') {
            // Берём операторов обеих групп
            const tpOps = filterOperators(result, GROUP_CONFIG['ТП']);
            const tpOsOps = filterOperators(result, GROUP_CONFIG['ТП ОС']);

            // Объединяем без дублей по id
            const map = new Map();
            [...tpOps, ...tpOsOps].forEach(op => map.set(op.operator.id, op));
            opstats = Array.from(map.values());

        } else {
            opstats = filterOperators(result, cfg);
        }
        const { html, online, busy, pause } = buildOperatorList(opstats);

        // 🔹 Рендер
        peoplestatus.innerHTML = buildSummaryHTML(
            key,
            currentQueue,
            tpQueue,
            tpOsQueue,
            html,
            online,
            busy,
            pause
        );

        animateOperatorChanges();
        attachOperatorClickHandlers();
        attachHandlers();

    } catch (e) {
        console.error('OperStatus error', e);
    }
}

function attachOperatorClickHandlers() {
    const arofpers = document.getElementsByName('operrow');

    for (let i = 0; i < arofpers.length; i++) {
        arofpers[i].onclick = function () {
            if (document.getElementById('AF_ChatHis').style.display == 'none')
                document.getElementById('opennewcat').click();

            setTimeout(function () {
                let massiv = document.getElementById('operatorstp');
                for (let k = 1; k < massiv.length; k++) {
                    if (arofpers[i].getAttribute('value') == massiv.children[k].value) {
                        massiv.children[k].selected = true;
                        findchatsoper();
                    }
                }
            }, 1000);
        };
    }
}

initializeStartOperStatus();
