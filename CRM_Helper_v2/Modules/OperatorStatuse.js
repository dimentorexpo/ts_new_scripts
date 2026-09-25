/**
 * OperatorStatuse.js — модуль «OperStatus»:
 * показывает в реальном времени статусы операторов группы
 * (Ready / InService / Afterservice / Timeout / DND) через WebSocket telephony.
 */

const _os_close = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const _os_broom = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l3-3h12l3 3"/><path d="M5 6v12a2 2 0 002 2h10a2 2 0 002-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
const _os_users = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';

var win_OperStatus = `<!-- описание элементов окна статусов операторов -->
<style>
.os-wrap { width: 420px; font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; color: #e2e8f0; }
.os-head { display: flex; align-items: center; gap: 6px; margin: 6px; padding: 8px 10px;
    background: linear-gradient(135deg, rgba(201,168,76,.14), rgba(139,111,46,.05));
    border: 1px solid rgba(255,255,255,.08); border-radius: 12px; cursor: grab; user-select: none; }
.os-head:active { cursor: grabbing; }
.os-title { display: flex; align-items: center; gap: 6px; margin-left: 4px;
    font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #fff; }
.os-title .os-live { width: 7px; height: 7px; border-radius: 50%; background: #22d3ee;
    box-shadow: 0 0 8px #22d3ee, 0 0 16px rgba(34,211,238,.5); animation: os-pulse 2.5s ease-in-out infinite; }
@keyframes os-pulse { 0%,100% { opacity: 1; } 50% { opacity: .45; } }
.os-actions { display: flex; gap: 4px; margin-left: auto; }
#operstatustable { box-sizing: border-box; width: 408px; max-height: 420px; margin: 0 6px 6px 6px;
    padding: 4px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(201,168,76,.4) transparent; }
#operstatustable::-webkit-scrollbar { width: 6px; }
#operstatustable::-webkit-scrollbar-thumb { background: rgba(201,168,76,.4); border-radius: 6px; }

.os-total { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px; padding: 9px 12px; border-radius: 12px;
    background: linear-gradient(135deg, rgba(34,211,238,.16), rgba(14,145,150,.22));
    border: 1px solid rgba(34,211,238,.45); box-shadow: 0 6px 18px rgba(0,0,0,.35);
    font-size: 12px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #cffafe; }
.os-total b { min-width: 30px; padding: 2px 10px; border-radius: 999px; text-align: center;
    background: rgba(0,0,0,.4); border: 1px solid rgba(34,211,238,.6); color: #67e8f9;
    font-family: 'Consolas', monospace; font-size: 13px; text-shadow: 0 0 8px rgba(34,211,238,.8); }

.os-card { margin-bottom: 8px; border-radius: 12px; overflow: hidden;
    background: linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,.015));
    border: 1px solid rgba(255,255,255,.07); box-shadow: 0 4px 14px rgba(0,0,0,.3);
    animation: os-in .35s cubic-bezier(.2,.8,.2,1) backwards; }
.os-card:nth-child(2) { animation-delay: .03s; }
.os-card:nth-child(3) { animation-delay: .06s; }
.os-card:nth-child(4) { animation-delay: .09s; }
.os-card:nth-child(5) { animation-delay: .12s; }
.os-card:nth-child(6) { animation-delay: .15s; }
@keyframes os-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.os-card-head { display: flex; align-items: center; gap: 8px; padding: 7px 10px;
    background: linear-gradient(90deg, color-mix(in srgb, var(--os-accent) 22%, transparent), transparent);
    border-bottom: 1px solid rgba(255,255,255,.06); }
.os-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--os-accent);
    box-shadow: 0 0 8px var(--os-accent); flex-shrink: 0; }
.os-label { font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; color: var(--os-accent); }
.os-badge { margin-left: auto; min-width: 24px; padding: 1px 8px; border-radius: 999px; text-align: center;
    background: rgba(0,0,0,.4); border: 1px solid var(--os-accent); color: var(--os-accent);
    font-family: 'Consolas', monospace; font-size: 12px; font-weight: 700; }

.os-list { display: flex; flex-wrap: wrap; gap: 5px; padding: 8px 10px; }
.os-chip { display: inline-flex; align-items: center; gap: 5px; max-width: 100%; padding: 3px 9px;
    border-radius: 999px; font-size: 12px; line-height: 1.3; color: #e8eef7; word-break: break-word;
    background: rgba(0,0,0,.32); border: 1px solid rgba(255,255,255,.09);
    transition: transform .15s ease, border-color .15s ease; }
.os-chip:hover { transform: translateY(-1px); border-color: var(--os-accent); }
.os-chip::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--os-accent); flex-shrink: 0; }
.os-empty { padding: 0 2px; font-size: 12px; color: rgba(255,255,255,.3); font-style: italic; }
</style>
<div class="os-wrap">
    <div class="os-head" id="OpSt_header">
        <button class="buttonHide" title="скрывает меню" id="hideMeOpSt">${_os_close} hide</button>
        <span class="os-title"><span class="os-live"></span> Операторы</span>
        <span class="os-actions">
            <span style="display:flex; align-items:center; color:#c9a84c;">${_os_users}</span>
            <button class="btnCRM btnCRMsmall" id="clearopersinfo" title="Очистить список" style="display:flex; align-items:center; gap:4px;">${_os_broom}</button>
        </span>
    </div>
    <div id="opers_box">
        <div id="operstatustable"></div>
    </div>
</div>`;

const wintOperStatus = createWindowCRM('CRM_OperStat', 'winTopOpStat', 'winLeftOpStat', win_OperStatus);
hideWindowOnDoubleClick('CRM_OperStat');

document.getElementById('clearopersinfo').onclick = function () { // кнопка очистки поля
    document.getElementById('operstatustable').innerHTML = "";
}

/* ============================================================
 *  РАБОТА С WEBSOCKET
 * ============================================================ */

// Текущее соединение и интервал проверки готовности сокета.
let operStatSocket = null;
let operStatCheckInterval = null;

function closeOperStatSocket() {
    if (operStatCheckInterval) {
        clearInterval(operStatCheckInterval);
        operStatCheckInterval = null;
    }
    if (operStatSocket) {
        try {
            if (operStatSocket.readyState === WebSocket.OPEN) {
                operStatSocket.send('2');
            }
            operStatSocket.close();
        } catch (e) {
            /* игнорируем ошибку при закрытии */
        }
        operStatSocket = null;
    }
}

/**
 * Извлекает из пакета WebSocket имена операторов с указанным lastStatus.
 *
 * Стратегия:
 *  1) Пытаемся разобрать полезную нагрузку как JSON (формат Socket.IO:
 *     "42/group-413,[...]" — после кадра идёт JSON-массив объектов).
 *  2) Если JSON разобрать не удалось — откатываемся к регулярке, улучшенной
 *     относительно старой версии: значение берётся из кавычек целиком
 *     (имена с цифрами и символами больше не теряются).
 *
 * @param {string} message     - сырое сообщение сервера.
 * @param {string} statusLabel - значение lastStatus ("Ready", "DND", ...).
 * @returns {{names: string[], count: number}}
 */
function extractOperatorsByStatus(message, statusLabel) {
    const names = [];
    const seen = new Set();

    const pushName = (raw) => {
        const name = String(raw || '').replace(/^["']+|["']+$/g, '').trim();
        if (!name || seen.has(name)) return;
        seen.add(name);
        names.push(name);
    };

    // --- 1) JSON-путь: разбираем полезную нагрузку Socket.IO ---
    const jsonNames = extractViaJson(message, statusLabel);
    if (jsonNames) {
        jsonNames.forEach(pushName);
        return { names, count: names.length };
    }

    // --- 2) Regex-фолбэк: "Имя Фамилия","lastStatus":"Ready" ---
    const escaped = statusLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`:\\s*"([^"]+)"\\s*,\\s*(?="lastStatus"\\s*:\\s*"${escaped}")`, 'g');
    let match;
    while ((match = regex.exec(message)) !== null) {
        pushName(match[1]);
    }

    return { names, count: names.length };
}

/**
 * Попытка разобрать сообщение Socket.IO как JSON и собрать имена операторов,
 * у которых поле lastStatus совпадает с нужным статусом.
 * @returns {string[]|null} null — если JSON-путь не подошёл.
 */
function extractViaJson(message, statusLabel) {
    if (typeof message !== 'string') return null;

    // Отбрасываем служебный кадр Engine.IO/Socket.IO ("42/ns," и т.п.)
    // и вырезаем первый встретившийся JSON-массив/объект.
    const start = message.search(/[[{]/);
    if (start === -1) return null;

    let payload;
    try {
        payload = JSON.parse(message.slice(start));
    } catch (e) {
        return null;
    }

    const found = [];

    const visit = (node) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
            node.forEach(visit);
            return;
        }
        if (node.lastStatus === statusLabel) {
            // Имя оператора ищем в типовых полях, иначе — первое строковое
            // значение, отличное от lastStatus (формат данных может меняться).
            const candidate =
                node.operatorName || node.operator || node.name ||
                node.fullName || node.userName || node.username ||
                node.login || node.fio || null;
            if (typeof candidate === 'string' && candidate.trim()) {
                found.push(candidate);
            } else {
                for (const [key, value] of Object.entries(node)) {
                    if (key !== 'lastStatus' && typeof value === 'string' && value.trim()) {
                        found.push(value);
                        break;
                    }
                }
            }
        }
        Object.values(node).forEach(visit);
    };

    try {
        visit(payload);
    } catch (e) {
        return null;
    }

    return found;
}

/** Метаданные статусов: цвет, подпись, иконка-эмодзи. */
const OPER_STATUS_META = [
    { key: 'ready',        title: 'Ready',        accent: '#22c55e', empty: 'нет свободных' },
    { key: 'inservice',    title: 'InService',    accent: '#eab308', empty: 'никто не на линии' },
    { key: 'afterservice', title: 'Afterservice', accent: '#f97316', empty: 'пусто' },
    { key: 'timeout',      title: 'Timeout',      accent: '#ef4444', empty: 'пусто' },
    { key: 'dnd',          title: 'DND',          accent: '#a855f7', empty: 'пусто' }
];

/**
 * Собирает итоговый HTML: сверху «Всего», ниже — карточка на каждый статус
 * с чипсами операторов (имена сортируются по алфавиту для стабильного вида).
 * @param {Object} data - { ready, inservice, afterservice, timeout, dnd }.
 */
function renderOperatorStats(data) {
    const total = Object.values(data).reduce((sum, s) => sum + (s.count || 0), 0);

    const esc = (s) => String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const totalHtml =
        '<div class="os-total">' +
            '<span>Операторов в системе</span>' +
            `<b>${total}</b>` +
        '</div>';

    const cardsHtml = OPER_STATUS_META.map((meta) => {
        const stat = data[meta.key] || { names: [], count: 0 };
        const names = [...stat.names].sort((a, b) => a.localeCompare(b, 'ru'));

        const chipsHtml = names.length
            ? names.map((n) => `<span class="os-chip" title="${esc(n)}">${esc(n)}</span>`).join('')
            : `<span class="os-empty">${meta.empty}</span>`;

        return '<div class="os-card" style="--os-accent:' + meta.accent + ';">' +
                   '<div class="os-card-head">' +
                       '<span class="os-dot"></span>' +
                       `<span class="os-label">${meta.title}</span>` +
                       `<span class="os-badge">${names.length}</span>` +
                   '</div>' +
                   `<div class="os-list">${chipsHtml}</div>` +
               '</div>';
    }).join('');

    return totalHtml + cardsHtml;
}

document.getElementById('btnOperStatus').onclick = function () {
    const win = document.getElementById('CRM_OperStat');

    // Если окно уже открыто — закрываем его и сокет
    if (win.style.display !== 'none') {
        win.style.display = 'none';
        closeOperStatSocket();
        return;
    }

    // Открываем окно
    win.style.display = '';

    // Закрываем предыдущее соединение, если было
    closeOperStatSocket();

    const socket = new WebSocket("wss://telephony.skyeng.ru/phone-stats/?EIO=4&transport=websocket");
    operStatSocket = socket;

    let socketCheckAttempts = 0;
    operStatCheckInterval = setInterval(function () {
        socketCheckAttempts++;
        if (socket.readyState === WebSocket.OPEN) {
            clearInterval(operStatCheckInterval);
            operStatCheckInterval = null;
            socket.send('40/group-413,'); // подписываемся на группу операторов

            socket.onmessage = function (event) {
                const message = event.data;

                // Если окно закрыто или сокет не в состоянии OPEN — игнорируем
                if (socket.readyState !== WebSocket.OPEN) return;
                socket.send('3'); // heartbeat-ответ серверу

                // Разбираем все категории статусов одним помощником.
                const stats = {
                    ready:       extractOperatorsByStatus(message, 'Ready'),
                    inservice:   extractOperatorsByStatus(message, 'InServiceOut'),
                    afterservice:extractOperatorsByStatus(message, 'AfterServiceOut'),
                    timeout:     extractOperatorsByStatus(message, 'Timeout'),
                    dnd:         extractOperatorsByStatus(message, 'DND')
                };

                const table = document.getElementById('operstatustable');
                if (table) table.innerHTML = renderOperatorStats(stats);
            };
        } else if (socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING || socketCheckAttempts > 15) {
            clearInterval(operStatCheckInterval);
            operStatCheckInterval = null;
        }
    }, 1000);
};

document.getElementById('hideMeOpSt').onclick = function () { // скрытие окна
    const win = document.getElementById('CRM_OperStat');
    if (win) win.style.display = 'none';
    closeOperStatSocket();
    const table = document.getElementById('operstatustable');
    if (table) table.innerHTML = '';
};
