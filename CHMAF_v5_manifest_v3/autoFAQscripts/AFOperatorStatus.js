let testint;
let chatneraspcountleft;
let peoplestatus = document.createElement('div');
peoplestatus.id = 'idforpeopstatus';
peoplestatus.style = 'width: 200px; color: bisque;';

const GROUP_CONFIG = {
    'ТП': {
        operatorMatch: /ТП\D/,
        queueBy: 'groupId',
        queueIds: ['c7bbb211-a217-4ed3-8112-98728dc382d8']
    },
    'ТП ОС': {
        operatorMatch: /ТП-ОС\D/,
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

function initializeStartOperStatus() {
    const siderElements = document.getElementsByClassName('ant-layout-sider-children');
    if (siderElements.length > 0) {
        StartOperStatus();
        return;
    }

    const observer = new MutationObserver(() => {
        const siderElements = document.getElementsByClassName('ant-layout-sider-children');
        if (siderElements.length > 0) {
            StartOperStatus();
            observer.disconnect();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
}

function StartOperStatus() {
    if (localStorage.getItem('hidesummaryflag') == null) {
        localStorage.setItem('hidesummaryflag', '1'); // 1 список скрыт , 0 список открыт
    }

    document.getElementsByClassName('ant-layout-sider-children')[0].append(peoplestatus);
    chatneraspcountleft = 0;
    testint = setInterval(operstatusleftbar, 6000);
}

function getUnassignedCount(result, cfg) {
    if (!result.unAssigned || !result.unAssigned.length) return 0;

    if (cfg.sumAllUnassigned) {
        return result.unAssigned.reduce((sum, item) => sum + Number(item.count || 0), 0);
    }

    if (cfg.queueBy === 'groupId') {
        return result.unAssigned
            .filter(item => cfg.queueIds.includes(item.groupId))
            .reduce((sum, item) => sum + Number(item.count || 0), 0);
    }

    if (cfg.queueBy === 'kb') {
        return result.unAssigned
            .filter(item => cfg.queueIds.includes(item.kb))
            .reduce((sum, item) => sum + Number(item.count || 0), 0);
    }

    return 0;
}

function filterOperators(result, cfg, flagtpkc) {
    const opstats = [];
    let chattpquecountleft = 0;
    let chatneraspcount = 0;

    const isTPGroup = (flagtpkc === 'ТП' || flagtpkc === 'ТП ОС');

    for (const item of result.onOperator || []) {
        const operator = item.operator;
        if (!operator) continue;

        const isOffline = item.status === 'Offline';
        const matchName = cfg.operatorMatch.test(operator.fullName || '');

        if (!matchName) continue;

        if (cfg.groupIdFilter && item.groupId !== cfg.groupIdFilter) continue;

        if (!isOffline) {
            opstats.push(item);
        }

        const unassignedCount = getUnassignedCount(result, cfg);

        if (isTPGroup) {
            chattpquecountleft = unassignedCount;
        } else {
            chatneraspcount = unassignedCount;
        }
    }

    return { opstats, chattpquecountleft, chatneraspcount };
}

function attachSummaryHandlers() {
    const toggle = document.getElementById('clicktounhidestatuses');
    const statsBlock = document.getElementById('opersstats');
    const refreshBtn = document.getElementById('manualRefreshBtn');

    if (toggle && statsBlock) {
        toggle.onclick = () => {
            const isHidden = statsBlock.style.display === 'none';
            statsBlock.style.display = isHidden ? '' : 'none';
            toggle.textContent = isHidden ? '🔼 Скрыть' : '🔽 Открыть';
            localStorage.setItem('hidesummaryflag', isHidden ? '0' : '1');
        };
    }

    if (refreshBtn) {
        refreshBtn.onclick = forceReinitializeStatus;
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

function cleanupPeopleHead() {
    const appContent = document.getElementsByClassName('app-content')[1];
    if (!appContent) return;

    const children = Array.from(appContent.children);
    for (const child of children) {
        if (child.id === 'people_head') {
            child.remove();
        }
    }
}


function buildOperatorList(opstats) {
    let moderresult = '';
    let operonlinecnt = 0;
    let busycnt = 0;
    let pausecnt = 0;
    const addedFullNames = new Set();

    if (!opstats.length) {
        return { moderresult: '', operonlinecnt, busycnt, pausecnt };
    }

    opstats.sort((a, b) => {
        if (a.operator.status < b.operator.status) return -1;
        if (a.operator.status > b.operator.status) return 1;
        return 0;
    });

    for (const item of opstats) {
        item.aCnt = item.aCnt || 0;
        const operator = item.operator;
        const status = operator.status;

        let divStyle = "";
        let spanBackground = "";
        let spanText = "";

        switch (status) {
            case "Online":
                operonlinecnt++;
                spanBackground = "green";
                spanText = "white";
                break;
            case "Busy":
                busycnt++;
                divStyle = "opacity:0.8; color:Gold";
                spanBackground = "gold";
                spanText = "black";
                break;
            case "Pause":
                pausecnt++;
                divStyle = "opacity:0.8; color:Salmon";
                spanBackground = "FireBrick";
                spanText = "white";
                break;
            default:
                continue;
        }

        if (!addedFullNames.has(operator.fullName)) {
            moderresult +=
                `<div class="leftbaropers" style="${divStyle}" name="operrow" value="${operator.id}">` +
                `<span style="color: ${spanText}; font-size: 13px; background: ${spanBackground}; width: 25px; height: 25px; padding-top:2px; text-align: center; border-radius: 50%; border: 1px solid black;">` +
                `${item.aCnt}` +
                `</span>` +
                `${operator.fullName}` +
                `</div>`;
            addedFullNames.add(operator.fullName);
        }
    }

    return { moderresult, operonlinecnt, busycnt, pausecnt };
}

function buildSummaryHTML({
    isTPGroup,
    hidesummary,
    chattpquecountleft,
    chatneraspcountleft,
    moderresult,
    operonlinecnt,
    busycnt,
    pausecnt
}) {
    const nerasp = isTPGroup ? chattpquecountleft : chatneraspcountleft;
    const toggleText = hidesummary === '1' ? '🔽 Открыть' : '🔼 Скрыть';
    const statsDisplay = hidesummary === '1' ? 'none' : '';

    return (
        `<div style="background:#792525; font-weight:700; text-align:center; letter-spacing:.2rem; text-shadow:1px 2px 5px rgb(0 0 0 / 55%); border:1px solid #464343; margin-bottom:5px;">` +
        `<span id="manualRefreshBtn" style="cursor:pointer;" title="Принудительно обновить статусы операторов">🚧</span> Нераспред: ${nerasp}</div>` +
        moderresult + '<br>' +
        `<div id="clicktounhidestatuses" style="color:bisque; opacity:0.8; cursor:pointer; text-align:center;">${toggleText}</div>` +
        `<div id="opersstats" style="display:${statsDisplay};">` +
        `<div style="background:#257947; font-weight:700; text-align:center; border:1px solid black;">🛠 Онлайн: ${operonlinecnt}</div>` +
        `<div style="background:#a3bb1d; color:black; font-weight:700; text-align:center; border:1px solid black;">⏳ Занят: ${busycnt}</div>` +
        `<div style="background:#cf4615; font-weight:700; text-align:center; border:1px solid black;">🍔 Перерыв: ${pausecnt}</div>` +
        `<div style="background:#492579; font-weight:700; text-align:center; border:1px solid black;">⚡ Всего: ${operonlinecnt + busycnt + pausecnt}</div>` +
        `</div>`
    );
}


function forceReinitializeStatus() {
    console.log('[OperStatus] Ручной рефреш запущен');

    // если интервал умер или задвоился — чистим и создаём заново
    if (testint) {
        clearInterval(testint);
    }

    // мгновенное обновление
    operstatusleftbar(true);

    // заново запускаем автообновление
    testint = setInterval(() => operstatusleftbar(false), 6000);
}

function waitForOpSectionNew(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const check = () => {
            const iframe = document.querySelector('[class^="NEW_FRONTEND"]');

            if (iframe && iframe.contentDocument) {
                const sectionKey = iframe.contentDocument.querySelector(
                    'span[id^="mantine-"][id$="-target"]'
                );

                if (sectionKey) {
                    const key = sectionKey.textContent.split('-')[0];
                    resolve(key);
                    return;
                }
            }

            if (Date.now() - start >= timeout) {
                reject(new Error("Не удалось получить ключ секции"));
                return;
            }

            requestAnimationFrame(check);
        };

        check();
    });
}



async function operstatusleftbar(isManual = false) {
    try {
        const key = await waitForOpSectionNew();
        flagtpkc = key;
        console.log("OPSECTION:", key);
        // const flagtpkc = opsection;
        const cfg = GROUP_CONFIG[flagtpkc];

        if (!cfg) {
            peoplestatus.innerHTML = '';
            return;
        }

        if (isManual) {
            console.log('[OperStatus] Ручное обновление для группы:', flagtpkc);
        }

        let opstats = [];
        let chattpquecountleft = 0;
        chatneraspcountleft = 0;

        const response = await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", {
            headers: { "x-csrf-token": aftoken },
            credentials: "include"
        });

        const result = await response.json();

        const { opstats: ops, chattpquecountleft: tpq, chatneraspcount } =
            filterOperators(result, cfg, flagtpkc);

        opstats = ops;
        chattpquecountleft = tpq;
        chatneraspcountleft = chatneraspcount;

        peoplestatus.innerHTML = '';

        const { moderresult, operonlinecnt, busycnt, pausecnt } = buildOperatorList(opstats);

        const isTPGroup = (flagtpkc === 'ТП' || flagtpkc === 'ТП ОС');
        const hidesummary = localStorage.getItem('hidesummaryflag') || '1';

        peoplestatus.innerHTML = buildSummaryHTML({
            isTPGroup,
            hidesummary,
            chattpquecountleft,
            chatneraspcountleft,
            moderresult,
            operonlinecnt,
            busycnt,
            pausecnt
        });

        attachSummaryHandlers(); // 👈 новая функция навешивания событий
        attachOperatorClickHandlers();

        cleanupPeopleHead();

    } catch (e) {
        console.error('[OperStatus] Ошибка при обновлении:', e);
    }
}


initializeStartOperStatus();
