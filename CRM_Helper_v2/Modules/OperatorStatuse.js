/**
 * OperatorStatuse.js — «Статусы операторов» в реальном времени
 * (Ready / InService / Afterservice / Timeout / DND) через WebSocket телефонии.
 *
 * Протокол Engine.IO v4 / Socket.IO:
 *   сервер шлёт «2» (ping) → отвечаем «3» (pong);
 *   данные приходят пакетами «42/group-413,[...]».
 */
(function () {
    'use strict';

    const SOCKET_URL = 'wss://telephony.skyeng.ru/phone-stats/?EIO=4&transport=websocket';
    const NAMESPACE = '/group-413';

    // lastStatus в данных → карточка в окне.
    const STATUS_META = [
        { key: 'Ready', title: 'Свободны', hint: 'Ready', tone: 'ok', empty: 'нет свободных' },
        { key: 'InServiceOut', title: 'На линии', hint: 'InService', tone: 'info', empty: 'никто не разговаривает' },
        { key: 'AfterServiceOut', title: 'Постобработка', hint: 'Afterservice', tone: 'violet', empty: 'пусто' },
        { key: 'Timeout', title: 'Таймаут', hint: 'Timeout', tone: 'warn', empty: 'пусто' },
        { key: 'DND', title: 'Не беспокоить', hint: 'DND', tone: 'bad', empty: 'пусто' }
    ];

    const html = `
        ${crmWinHeader({
            icon: '🎧',
            title: 'Статусы операторов',
            tools: '<span class="crm-pill" id="opstat_conn">Отключено</span>' +
                   crmToolButton('clearopersinfo', crmIcon('clear', 15), 'Очистить список'),
            closeId: 'hideMeOpSt'
        })}
        <div class="crm-body" style="max-height:520px; overflow-y:auto">
            <div id="operstatustable"><div class="crm-empty">Подключаюсь к телефонии…</div></div>
        </div>`;

    createWindowCRM('CRM_OperStat', 'winTopOpStat', 'winLeftOpStat', html);
    const win = document.getElementById('CRM_OperStat');
    win.style.width = '440px';
    hideWindowOnDoubleClick('CRM_OperStat');
    hideWindowOnClick('CRM_OperStat', 'hideMeOpSt');

    const table = document.getElementById('operstatustable');
    const connPill = document.getElementById('opstat_conn');
    let socket = null;

    function setConn(text, tone) {
        connPill.textContent = text;
        connPill.dataset.tone = tone || '';
    }

    /** Достаёт из пакета пары {name, status}. Сначала JSON, при неудаче — регулярка. */
    function parseOperators(message) {
        const result = [];
        const start = message.search(/[[{]/);
        if (start !== -1) {
            try {
                const payload = JSON.parse(message.slice(start));
                const visit = (node) => {
                    if (!node || typeof node !== 'object') return;
                    if (Array.isArray(node)) { node.forEach(visit); return; }
                    if (typeof node.lastStatus === 'string') {
                        let name = node.operatorName || node.operator || node.name || node.fullName ||
                            node.userName || node.username || node.login || node.fio;
                        if (typeof name !== 'string' || !name.trim()) {
                            const entry = Object.entries(node).find(([k, v]) => k !== 'lastStatus' && typeof v === 'string' && v.trim());
                            name = entry ? entry[1] : '';
                        }
                        if (name) result.push({ name: name.trim(), status: node.lastStatus });
                    }
                    Object.values(node).forEach(visit);
                };
                visit(payload);
                return result;
            } catch (_) { /* не JSON — ниже регулярка */ }
        }

        const re = /:\s*"([^"]+)"\s*,\s*"lastStatus"\s*:\s*"([^"]+)"/g;
        let m;
        while ((m = re.exec(message)) !== null) result.push({ name: m[1].trim(), status: m[2] });
        return result;
    }

    function render(operators) {
        const byStatus = new Map(STATUS_META.map((s) => [s.key, new Set()]));
        operators.forEach(({ name, status }) => {
            if (byStatus.has(status)) byStatus.get(status).add(name);
        });
        const total = [...byStatus.values()].reduce((sum, set) => sum + set.size, 0);

        table.innerHTML =
            `<div class="os-total"><span>Операторов в системе</span><b>${total}</b></div>` +
            STATUS_META.map((meta) => {
                const names = [...byStatus.get(meta.key)].sort((a, b) => a.localeCompare(b, 'ru'));
                const chips = names.length
                    ? names.map((n) => `<span class="os-chip">${crmEsc(n)}</span>`).join('')
                    : `<span class="crm-hint">${meta.empty}</span>`;
                return `<div class="os-card" data-tone="${meta.tone}">
                            <div class="os-card-head" title="${meta.hint}"><span class="crm-dot"></span>${meta.title}<span class="crm-pill" data-tone="${meta.tone}">${names.length}</span></div>
                            <div class="os-list">${chips}</div>
                        </div>`;
            }).join('');
    }

    function closeSocket() {
        if (!socket) return;
        const s = socket;
        socket = null;
        s.onopen = s.onmessage = s.onclose = s.onerror = null;
        try {
            if (s.readyState === WebSocket.OPEN) s.send('41' + NAMESPACE + ',');
            s.close();
        } catch (_) { /* уже закрыт */ }
        setConn('Отключено', '');
    }

    function openSocket() {
        closeSocket();
        setConn('Подключение…', 'info');
        table.innerHTML = '<div class="crm-loading"><span class="crm-spinner"></span>Подключаюсь к телефонии…</div>';

        const s = new WebSocket(SOCKET_URL);
        socket = s;

        s.onmessage = (event) => {
            if (socket !== s) return;
            const message = String(event.data);

            if (message === '2') { s.send('3'); return; }          // ping → pong
            if (message.startsWith('0')) { s.send('40' + NAMESPACE + ','); return; } // handshake → подписка
            if (message.startsWith('40')) { setConn('Онлайн', 'ok'); return; }
            if (!message.startsWith('42')) return;                  // служебные пакеты не рисуем

            if (win.style.display === 'none') { closeSocket(); return; }
            render(parseOperators(message));
        };

        s.onclose = () => {
            if (socket !== s) return;
            socket = null;
            setConn('Отключено', 'bad');
            if (!table.querySelector('.os-card')) {
                table.innerHTML = '<div class="crm-empty is-error">Соединение закрыто. Проверьте вход в телефонию и откройте окно заново.</div>';
            }
        };
    }

    // Любое скрытие окна (кнопка, двойной клик, меню) закрывает сокет.
    win.addEventListener('crm:hidden', closeSocket);
    win.addEventListener('crm:shown', openSocket);

    document.getElementById('clearopersinfo').onclick = () => {
        table.innerHTML = '<div class="crm-empty">Список очищен, жду следующего обновления…</div>';
    };

    document.getElementById('btnOperStatus').onclick = () => crmToggleWindow(win);
})();
