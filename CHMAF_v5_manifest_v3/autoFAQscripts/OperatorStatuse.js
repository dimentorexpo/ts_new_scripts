var win_OperStatus =  // описание элементов окна статуса операторов, работающих в CRM2
    `<div style="display: flex; width: 400px;">
    <span style="width: 400px">
            <span style="cursor: -webkit-grab;">
                    <div style="margin: 5px; width: 400px;" id="OpSt_header">
                            <button class="mainButton buttonHide" title="скрывает меню" id="hideMeOpSt">hide</button>
                            <button class="mainButton smallbtn" id="clearopersinfo" style="float: right; margin-right: 10px;">🧹</button>
                    </div>
        </span>
                    <div style="margin: 5px; width: 400px" id="opers_box">
                            <p id="operstatustable" style="max-height:700px; margin-left:5px; font-size:16px; color:bisque; overflow-y:auto;"></p>
                    </div>
    </span>
</div>`;

const wintOperStatus = createWindow('AF_OperStat', 'winTopOpStat', 'winLeftOpStat', win_OperStatus);
hideWindowOnDoubleClick('AF_OperStat');

document.getElementById('clearopersinfo').onclick = () => {
    document.getElementById('operstatustable').innerHTML = "";
};

// ====== Оптимизированная логика ======

const STATUS_CONFIG = {
    Ready: {
        regex: /(:")(\D+)(",)(?="lastStatus":"Ready")/gm,
        icon: '🟢 ',
        label: 'Ready'
    },
    InServiceOut: {
        regex: /(:")(\D+)(",)(?="lastStatus":"InServiceOut")/gm,
        icon: '🟡 📞',
        label: 'InService'
    },
    AfterServiceOut: {
        regex: /(:")(\D+)(",)(?="lastStatus":"AfterServiceOut")/gm,
        icon: '🟠 📵',
        label: 'Afterservice'
    },
    Timeout: {
        regex: /(:")(\D+)(",)(?="lastStatus":"Timeout")/gm,
        icon: '⭕ ⏳',
        label: 'Timeout'
    },
    DND: {
        regex: /(:")(\D+)(",)(?="lastStatus":"DND")/gm,
        icon: '🔴 🍔',
        label: 'DND'
    }
};

function extractNames(message, regex) {
    const matches = message.match(regex);
    if (!matches) return [];
    return matches.map(m =>
        m.replaceAll(':', '').replace(",", '').replaceAll('"', '')
    );
}

function buildStatusBlock(label, count, items, icon) {
    const header = `
        <div style="
            background:#768d87;
            width:96%;
            padding:0.3% 0 2px;
            color:#37ff85;
            font-weight:700;
            box-shadow:0px 3px 1px rgb(0 0 0 / 35%);
            text-shadow:1px 2px 5px rgb(0 0 0 / 55%);
            border:1px solid black;
            padding-left:5px;
            border-radius:10px;
            text-align:center;">
            ${label}
            <span style="
                background:orange;
                color:#00365d;
                padding:0 20px;
                float:right;
                height:26px;
                border-radius:10px;">
                ${count}
            </span>
        </div>
    `;
    const list = items.map(name => `${icon}${name}<br>`).join('');
    return header + list;
}

function renderOperatorStatuses(message) {
    const container = document.getElementById('operstatustable');
    container.innerHTML = '';

    let total = 0;
    let html = '';

    for (const cfg of Object.values(STATUS_CONFIG)) {
        const names = extractNames(message, cfg.regex);
        total += names.length;
        html += buildStatusBlock(cfg.label, names.length, names, cfg.icon);
    }

    html += `
        <div style="
            background:#0e9196;
            width:96%;
            padding:0.3% 0 2px;
            color:#dcdcdc;
            font-weight:700;
            box-shadow:0px 3px 1px rgb(0 0 0 / 35%);
            text-shadow:1px 2px 5px rgb(0 0 0 / 55%);
            border:1px solid black;
            padding-left:5px;
            border-radius:10px;
            text-align:center;">
            Всего операторов в системе:
            <span style="
                background:#00b5ff;
                color:#00365d;
                padding:0 20px;
                float:right;
                height:26px;
                border-radius:10px;">
                ${total}
            </span>
        </div>
    `;

    container.innerHTML = html;
}

function getcrmopersstatusesButtonPress() {

    const win = document.getElementById('AF_OperStat');
    const menu = document.getElementById('idmymenu');
    const btn = document.getElementById('MainMenuBtn');

    win.style.display = win.style.display === 'none' ? '' : 'none';
    menu.style.display = 'none';
    btn.classList.remove('activeScriptBtn');

    const socket = new WebSocket("wss://telephony.skyeng.ru/phone-stats/?EIO=4&transport=websocket");

    const check = setInterval(() => {
        if (socket.readyState === 1) {
            clearInterval(check);
            socket.send('40/group-413,');

            socket.onmessage = (event) => {
                socket.send('3');
                renderOperatorStatuses(event.data);
            };
        }
    }, 500);

    document.getElementById('hideMeOpSt').onclick = () => {
        win.style.display = 'none';
        socket.send('2');
        document.getElementById('operstatustable').innerHTML = '';
    };
}
