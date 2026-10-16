// ==========================================
// AF OperStatus — «Статусы операторов» в реальном времени
// (Ready / InService / AfterService / Timeout / DND) через WebSocket телефонии.
// Оформление как в Queue / ChatHistory / Userinfo («corporate graphite»).
//
// Протокол Engine.IO v4 / Socket.IO:
//   сервер шлёт «0{…}» (handshake) → подписываемся на «40/group-413,»;
//   «2» (ping) → отвечаем «3» (pong);
//   данные приходят пакетами «42/group-413,[...]».
// ==========================================

const AFOS_PREFIX = 'afos-';

const AFOS_CONFIG = {
    windowId: 'AF_OperStat',
    headerId: 'OpSt_header',
    tableId: 'operstatustable',
    connId: 'opstat_conn',
    hideBtnId: 'hideMeOpSt',
    clearBtnId: 'clearopersinfo',
    wsUrl: 'wss://telephony.skyeng.ru/phone-stats/?EIO=4&transport=websocket',
    namespace: '/group-413',
    reconnectMs: 3000
};

// lastStatus в данных → карточка в окне
const AFOS_STATUS_META = [
    { key: 'Ready', title: 'Свободны', hint: 'Ready', tone: 'ok', empty: 'нет свободных' },
    { key: 'InServiceOut', title: 'В звонке', hint: 'InService', tone: 'info', empty: 'никто не разговаривает' },
    { key: 'AfterServiceOut', title: 'После звонка', hint: 'AfterService', tone: 'violet', empty: 'пусто' },
    { key: 'Timeout', title: 'Таймаут', hint: 'Timeout', tone: 'warn', empty: 'пусто' },
    { key: 'DND', title: 'Не беспокоить', hint: 'DND', tone: 'bad', empty: 'пусто' }
];

// ==========================================
// HTML + стили
// ==========================================

const win_OperStatus = `
<div class="${AFOS_PREFIX}panel">
    <div class="${AFOS_PREFIX}header chmaf-drag-handle" id="${AFOS_CONFIG.headerId}">
        <button class="${AFOS_PREFIX}btn ${AFOS_PREFIX}btn--close buttonHide" id="${AFOS_CONFIG.hideBtnId}"
                type="button" title="Скрыть окно" aria-label="Закрыть окно">❌</button>
        <div class="${AFOS_PREFIX}title">🎧 Статусы операторов</div>
        <span class="${AFOS_PREFIX}pill" id="${AFOS_CONFIG.connId}">Отключено</span>
        <button class="${AFOS_PREFIX}btn" id="${AFOS_CONFIG.clearBtnId}"
                type="button" title="Очистить список" aria-label="Очистить список">🧹</button>
    </div>
    <div class="${AFOS_PREFIX}body">
        <div id="${AFOS_CONFIG.tableId}" aria-live="polite">
            <div class="${AFOS_PREFIX}empty">Откройте окно — подключусь к телефонии</div>
        </div>
    </div>
</div>

<style>
/* Внешнюю рамку createWindow убираем — видна только панель */
#${AFOS_CONFIG.windowId} {
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
}

.${AFOS_PREFIX}panel,
.${AFOS_PREFIX}panel * { box-sizing: border-box; }

.${AFOS_PREFIX}panel {
    width: min(440px, calc(100vw - 16px));
    color: #f1f5f9;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    letter-spacing: .01em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
    -webkit-font-smoothing: antialiased;
    background:
        radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
        #111827;
    border: 1px solid #344258;
    border-radius: 18px;
    box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
    overflow: hidden;
}

/* Шапка: ❌ слева, заголовок, статус соединения, 🧹 */
.${AFOS_PREFIX}header {
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

.${AFOS_PREFIX}header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 40%;
    height: 1px;
    background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
}

.${AFOS_PREFIX}header:active { cursor: grabbing; }

.${AFOS_PREFIX}title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: #fefefe;
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.${AFOS_PREFIX}btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 34px;
    height: 34px;
    padding: 0;
    color: #dce5f5;
    background: #1b283c;
    border: 1px solid #3c4d68;
    border-radius: 9px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
}

.${AFOS_PREFIX}btn:hover {
    color: #fff;
    background: #293b56;
    border-color: #7799e2;
    transform: translateY(-1px);
}

.${AFOS_PREFIX}btn:active { transform: translateY(0) scale(.98); }

.${AFOS_PREFIX}btn--close {
    color: #ffb0be;
    background: rgba(255, 116, 140, .08);
    border-color: rgba(255, 116, 140, .3);
}

.${AFOS_PREFIX}btn--close:hover {
    color: #ffb0be;
    background: rgba(255, 116, 140, .16);
    border-color: rgba(255, 116, 140, .55);
}

.${AFOS_PREFIX}btn:focus-visible {
    outline: 2px solid #9ab5ff;
    outline-offset: 2px;
}

/* Цвета статусов — общие для пилюль, точек и полос карточек */
.${AFOS_PREFIX}panel [data-tone]        { --tone: #94a3b8; --tone-bg: rgba(148, 163, 184, .12); --tone-line: rgba(148, 163, 184, .3); }
.${AFOS_PREFIX}panel [data-tone="ok"]     { --tone: #86efac; --tone-bg: rgba(69, 199, 52, .15);  --tone-line: rgba(69, 199, 52, .4); }
.${AFOS_PREFIX}panel [data-tone="info"]   { --tone: #7dd3fc; --tone-bg: rgba(30, 144, 255, .15); --tone-line: rgba(30, 144, 255, .35); }
.${AFOS_PREFIX}panel [data-tone="violet"] { --tone: #c4b5fd; --tone-bg: rgba(139, 92, 246, .15); --tone-line: rgba(139, 92, 246, .4); }
.${AFOS_PREFIX}panel [data-tone="warn"]   { --tone: #fdba74; --tone-bg: rgba(255, 140, 0, .15);  --tone-line: rgba(255, 140, 0, .4); }
.${AFOS_PREFIX}panel [data-tone="bad"]    { --tone: #fca5a5; --tone-bg: rgba(220, 20, 60, .15);  --tone-line: rgba(220, 20, 60, .35); }

/* Пилюля: статус соединения и счётчики */
.${AFOS_PREFIX}pill {
    --tone: #94a3b8; --tone-bg: rgba(148, 163, 184, .12); --tone-line: rgba(148, 163, 184, .3);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    min-width: 26px;
    height: 24px;
    padding: 0 9px;
    color: var(--tone);
    background: var(--tone-bg);
    border: 1px solid var(--tone-line);
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
}

/* Тело */
.${AFOS_PREFIX}body {
    max-height: min(560px, 70vh);
    padding: 14px 18px 18px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(66, 104, 201, .4) transparent;
}

.${AFOS_PREFIX}body::-webkit-scrollbar { width: 4px; }
.${AFOS_PREFIX}body::-webkit-scrollbar-thumb { background: rgba(66, 104, 201, .3); border-radius: 8px; }

#${AFOS_CONFIG.tableId} {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* «Операторов в системе» */
.${AFOS_PREFIX}total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    background: rgba(66, 104, 201, .12);
    border: 1px solid rgba(66, 104, 201, .3);
    border-left: 3px solid #92afff;
    border-radius: 10px;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
}

.${AFOS_PREFIX}total b {
    color: #fff;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0;
    line-height: 1;
    font-variant-numeric: tabular-nums;
}

/* Карточка статуса */
.${AFOS_PREFIX}card {
    padding: 10px 12px 12px;
    background: #1a2536;
    border: 1px solid #344258;
    border-left: 3px solid var(--tone);
    border-radius: 10px;
    transition: background-color .16s ease;
}

.${AFOS_PREFIX}card:hover { background: #1e2b40; }

.${AFOS_PREFIX}card-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    color: #f1f5f9;
    font-size: 14px;
    font-weight: 700;
}

.${AFOS_PREFIX}card-head .${AFOS_PREFIX}pill { margin-left: auto; }

.${AFOS_PREFIX}dot {
    flex: none;
    width: 9px;
    height: 9px;
    background: var(--tone);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--tone-line);
}

.${AFOS_PREFIX}hint-key {
    color: #7d8ca6;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
}

.${AFOS_PREFIX}list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.${AFOS_PREFIX}chip {
    padding: 3px 9px;
    color: #e2e8f0;
    background: rgba(0, 0, 0, .25);
    border: 1px solid rgba(66, 104, 201, .2);
    border-radius: 7px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
}

.${AFOS_PREFIX}chip.is-new {
    animation: ${AFOS_PREFIX}chipIn .35s ease;
}

@keyframes ${AFOS_PREFIX}chipIn {
    from { background: var(--tone-bg); border-color: var(--tone-line); }
}

.${AFOS_PREFIX}empty-hint {
    color: #7d8ca6;
    font-size: 13px;
}

/* Пустое / ошибочное состояние окна */
.${AFOS_PREFIX}empty {
    padding: 28px 16px;
    color: #94a3b8;
    font-size: 13px;
    text-align: center;
    background: rgba(255, 255, 255, .02);
    border: 1px dashed rgba(66, 104, 201, .25);
    border-radius: 12px;
}

.${AFOS_PREFIX}empty.is-error {
    color: #fca5a5;
    border-color: rgba(220, 20, 60, .35);
}

.${AFOS_PREFIX}spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    margin-right: 8px;
    vertical-align: -2px;
    border: 2px solid rgba(66, 104, 201, .25);
    border-top-color: #7799e2;
    border-radius: 50%;
    animation: ${AFOS_PREFIX}spin .7s linear infinite;
}

@keyframes ${AFOS_PREFIX}spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
    .${AFOS_PREFIX}panel * { animation: none !important; transition: none !important; }
}
</style>
`;

// ==========================================
// Window Init
// ==========================================

createWindow('AF_OperStat', 'winTopOpStat', 'winLeftOpStat', win_OperStatus);
hideWindowOnDoubleClick('AF_OperStat');

const afosState = {
    cards: new Map(),   // key → { el, countEl, listEl, names, signature }
    totalEl: null
};

const afosTable = document.getElementById(AFOS_CONFIG.tableId);
const afosConn = document.getElementById(AFOS_CONFIG.connId);

function afosEsc(text) {
    const span = document.createElement('span');
    span.textContent = String(text ?? '');
    return span.innerHTML;
}

function afosSetConn(text, tone) {
    if (!afosConn) return;
    afosConn.textContent = text;
    if (tone) afosConn.dataset.tone = tone;
    else delete afosConn.dataset.tone;
}

function afosShowMessage(text, { loading = false, error = false } = {}) {
    afosState.cards.clear();
    afosState.totalEl = null;
    afosTable.innerHTML =
        `<div class="${AFOS_PREFIX}empty${error ? ' is-error' : ''}">` +
        (loading ? `<span class="${AFOS_PREFIX}spinner"></span>` : '') +
        `${afosEsc(text)}</div>`;
}

// ==========================================
// Разбор пакета
// ==========================================

/** Достаёт из пакета пары {name, status}. Сначала JSON, при неудаче — регулярка. */
function afosParseOperators(message) {
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
                        const entry = Object.entries(node)
                            .find(([k, v]) => k !== 'lastStatus' && typeof v === 'string' && v.trim());
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

// ==========================================
// Отрисовка без мерцания: карточки создаются один раз,
// список карточки перерисовывается, только если состав изменился
// ==========================================

function afosBuildSkeleton() {
    afosTable.innerHTML = '';

    const total = document.createElement('div');
    total.className = `${AFOS_PREFIX}total`;
    total.innerHTML = `<span>Операторов в системе</span><b>0</b>`;
    afosTable.append(total);
    afosState.totalEl = total.querySelector('b');

    for (const meta of AFOS_STATUS_META) {
        const card = document.createElement('div');
        card.className = `${AFOS_PREFIX}card`;
        card.dataset.tone = meta.tone;
        card.innerHTML = `
            <div class="${AFOS_PREFIX}card-head" title="Статус в телефонии: ${meta.hint}">
                <span class="${AFOS_PREFIX}dot"></span>
                <span>${meta.title}</span>
                <span class="${AFOS_PREFIX}hint-key">${meta.hint}</span>
                <span class="${AFOS_PREFIX}pill" data-tone="${meta.tone}">0</span>
            </div>
            <div class="${AFOS_PREFIX}list"></div>`;
        afosTable.append(card);

        afosState.cards.set(meta.key, {
            el: card,
            countEl: card.querySelector(`.${AFOS_PREFIX}pill`),
            listEl: card.querySelector(`.${AFOS_PREFIX}list`),
            names: new Set(),
            signature: null
        });
    }
}

function afosRender(operators) {
    if (!afosState.totalEl) afosBuildSkeleton();

    const byStatus = new Map(AFOS_STATUS_META.map((s) => [s.key, new Set()]));
    operators.forEach(({ name, status }) => {
        if (byStatus.has(status)) byStatus.get(status).add(name);
    });

    let total = 0;

    for (const meta of AFOS_STATUS_META) {
        const card = afosState.cards.get(meta.key);
        const names = [...byStatus.get(meta.key)].sort((a, b) => a.localeCompare(b, 'ru'));
        const signature = names.join('\n');
        total += names.length;

        if (signature === card.signature) continue;

        const prev = card.names;
        card.countEl.textContent = names.length;
        card.listEl.innerHTML = names.length
            ? names.map((n) =>
                `<span class="${AFOS_PREFIX}chip${card.signature !== null && !prev.has(n) ? ' is-new' : ''}">${afosEsc(n)}</span>`
            ).join('')
            : `<span class="${AFOS_PREFIX}empty-hint">${meta.empty}</span>`;

        card.names = new Set(names);
        card.signature = signature;
    }

    afosState.totalEl.textContent = total;
}

function afosClearTable() {
    afosShowMessage('Список очищен, жду следующего обновления…');
}

// ==========================================
// WebSocket
// ==========================================

let afosSocket = null;
let afosReconnectTimer = null;
let afosWanted = false; // окно открыто — соединение должно жить

function afosIsWindowVisible() {
    const win = document.getElementById(AFOS_CONFIG.windowId);
    return !!win && getComputedStyle(win).display !== 'none';
}

function afosInitSocket() {
    afosWanted = true;
    clearTimeout(afosReconnectTimer);

    // Не плодим второй сокет, пока первый подключается
    if (afosSocket && (afosSocket.readyState === WebSocket.OPEN ||
        afosSocket.readyState === WebSocket.CONNECTING)) return;

    afosSetConn('Подключение…', 'info');
    if (!afosState.totalEl) afosShowMessage('Подключаюсь к телефонии…', { loading: true });

    let socket;
    try {
        socket = new WebSocket(AFOS_CONFIG.wsUrl);
    } catch (err) {
        console.error('[AF OperStatus] WS failed:', err);
        afosSetConn('Ошибка', 'bad');
        afosShowMessage('Не удалось подключиться к телефонии.', { error: true });
        return;
    }

    afosSocket = socket;

    socket.onmessage = (event) => {
        if (afosSocket !== socket) return;
        const message = String(event.data);

        if (message === '2') { socket.send('3'); return; }                              // ping → pong
        if (message.startsWith('0')) { socket.send('40' + AFOS_CONFIG.namespace + ','); return; } // handshake → подписка
        if (message.startsWith('40')) { afosSetConn('Онлайн', 'ok'); return; }
        if (!message.startsWith('42')) return;                                         // служебные пакеты не рисуем

        // Окно скрыли двойным кликом — сокет больше не нужен
        if (!afosIsWindowVisible()) {
            afosCloseSocket();
            return;
        }

        afosSetConn('Онлайн', 'ok');
        afosRender(afosParseOperators(message));
    };

    socket.onerror = (err) => console.warn('[AF OperStatus] WS error:', err);

    socket.onclose = () => {
        if (afosSocket !== socket) return;
        afosSocket = null;

        // Сервер оборвал соединение, а окно открыто — переподключаемся
        if (afosWanted && afosIsWindowVisible()) {
            afosSetConn('Переподключение…', 'warn');
            afosReconnectTimer = setTimeout(afosInitSocket, AFOS_CONFIG.reconnectMs);
            return;
        }

        afosSetConn('Отключено', '');
    };
}

function afosCloseSocket() {
    afosWanted = false;
    clearTimeout(afosReconnectTimer);

    if (afosSocket) {
        const socket = afosSocket;
        afosSocket = null;
        socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null;
        try {
            if (socket.readyState === WebSocket.OPEN) socket.send('41' + AFOS_CONFIG.namespace + ',');
            socket.close();
        } catch (e) { /* уже закрыт */ }
    }

    afosSetConn('Отключено', '');
}

function afosToggleWindow() {
    const win = document.getElementById(AFOS_CONFIG.windowId);
    const menu = document.getElementById('idmymenu');
    const btn = document.getElementById('MainMenuBtn');
    if (!win) return;

    const isHidden = getComputedStyle(win).display === 'none';
    win.style.display = isHidden ? '' : 'none';
    if (menu) menu.style.display = 'none';
    if (btn) btn.classList.remove('activeScriptBtn');

    if (isHidden) {
        afosInitSocket();
    } else {
        afosCloseSocket();
        afosShowMessage('Откройте окно — подключусь к телефонии');
    }
}

// ==========================================
// Events
// ==========================================

document.getElementById(AFOS_CONFIG.clearBtnId)?.addEventListener('click', afosClearTable);
document.getElementById(AFOS_CONFIG.hideBtnId)?.addEventListener('click', afosToggleWindow);

// ==========================================
// Public API
// ==========================================

function getcrmopersstatusesButtonPress() {
    afosToggleWindow();
}