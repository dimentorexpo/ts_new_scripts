// ==========================================
// AF OperStatus — Ultra Premium Glassmorphism
// Zero-flicker Diff Render Engine
// ==========================================

const AFOS_PREFIX = 'afos-';

const AFOS_CONFIG = {
    windowId: 'AF_OperStat',
    headerId: 'OpSt_header',
    boxId: 'opers_box',
    tableId: 'operstatustable',
    hideBtnId: 'hideMeOpSt',
    clearBtnId: 'clearopersinfo',
    wsUrl: 'wss://telephony.skyeng.ru/phone-stats/?EIO=4&transport=websocket',
    wsGroup: '40/group-413,',
    wsPing: '3',
    wsClose: '2',
    checkInterval: 500
};

const AFOS_STATUS_MAP = {
    Ready: {
        regex: /(:")(\D+)(",)(?="lastStatus":"Ready")/gm,
        icon: '🟢',
        label: 'Ready',
        accent: '#69f0ae',
        glow: 'rgba(105,240,174,0.35)',
        badgeBg: 'linear-gradient(135deg, #69f0ae, #00c853)'
    },
    InServiceOut: {
        regex: /(:")(\D+)(",)(?="lastStatus":"InServiceOut")/gm,
        icon: '📞',
        label: 'In Service',
        accent: '#ffd740',
        glow: 'rgba(255,215,64,0.35)',
        badgeBg: 'linear-gradient(135deg, #ffd740, #ffab00)'
    },
    AfterServiceOut: {
        regex: /(:")(\D+)(",)(?="lastStatus":"AfterServiceOut")/gm,
        icon: '📵',
        label: 'After Service',
        accent: '#ffab40',
        glow: 'rgba(255,171,64,0.35)',
        badgeBg: 'linear-gradient(135deg, #ffab40, #ff6d00)'
    },
    Timeout: {
        regex: /(:")(\D+)(",)(?="lastStatus":"Timeout")/gm,
        icon: '⏳',
        label: 'Timeout',
        accent: '#ff5252',
        glow: 'rgba(255,82,82,0.35)',
        badgeBg: 'linear-gradient(135deg, #ff5252, #d50000)'
    },
    DND: {
        regex: /(:")(\D+)(",)(?="lastStatus":"DND")/gm,
        icon: '🍔',
        label: 'DND',
        accent: '#ff4081',
        glow: 'rgba(255,64,129,0.35)',
        badgeBg: 'linear-gradient(135deg, #ff4081, #c51162)'
    }
};

// ==========================================
// State & DOM Cache
// ==========================================

const afosState = {
    blocks: new Map(),
    items: new Map(),
    totalEl: null,
    lastMessage: null
};

// ==========================================
// HTML Template
// ==========================================

const win_OperStatus = `
<div class="${AFOS_PREFIX}wrapper">
    <div class="${AFOS_PREFIX}inner">
        <div class="${AFOS_PREFIX}ambient-glow"></div>
        <div class="${AFOS_PREFIX}noise"></div>
        <div class="${AFOS_PREFIX}drag-handle" id="${AFOS_CONFIG.headerId}">
            <div class="${AFOS_PREFIX}title">
                <span class="${AFOS_PREFIX}title-dot"></span>
                <span>Операторы CRM</span>
            </div>
            <div class="${AFOS_PREFIX}header-actions">
                <button class="${AFOS_PREFIX}btn ${AFOS_PREFIX}btn-clear" title="Очистить список" id="${AFOS_CONFIG.clearBtnId}">
                    <span class="${AFOS_PREFIX}btn-icon">🧹</span>
                </button>
                <button class="${AFOS_PREFIX}btn ${AFOS_PREFIX}btn-hide buttonHide" title="Скрыть окно" id="${AFOS_CONFIG.hideBtnId}">
                    <span class="${AFOS_PREFIX}btn-icon">✕</span>
                </button>
            </div>
        </div>
        <div class="${AFOS_PREFIX}content" id="${AFOS_CONFIG.boxId}">
            <div class="${AFOS_PREFIX}table" id="${AFOS_CONFIG.tableId}"></div>
        </div>
    </div>
</div>

<style>
/* ============================================
   AF OperStatus — Ultra Premium Glassmorphism
   ============================================ */

.${AFOS_PREFIX}wrapper {
    display: flex;
    width: 420px;
    font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    color: #fff;
}

.${AFOS_PREFIX}inner {
    width: 100%;
    margin: 6px;
    position: relative;
    background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.06) 100%);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 24px;
    box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255,255,255,0.05),
        inset 0 1px 1px rgba(255,255,255,0.2);
    overflow: hidden;
}

.${AFOS_PREFIX}ambient-glow {
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background:
        radial-gradient(circle at 50% 50%, rgba(120,180,255,0.08), transparent 60%),
        radial-gradient(circle at 80% 20%, rgba(0,230,118,0.05), transparent 50%);
    animation: ${AFOS_PREFIX}ambientMove 20s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
}

@keyframes ${AFOS_PREFIX}ambientMove {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(5%, 5%) rotate(120deg); }
    66% { transform: translate(-5%, 3%) rotate(240deg); }
}

.${AFOS_PREFIX}noise {
    position: absolute; inset: 0;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
}

.${AFOS_PREFIX}drag-handle, .${AFOS_PREFIX}content { position: relative; z-index: 2; }

.${AFOS_PREFIX}drag-handle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    cursor: grab;
    user-select: none;
}

.${AFOS_PREFIX}drag-handle:active { cursor: grabbing; }

.${AFOS_PREFIX}title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.95);
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.${AFOS_PREFIX}title-dot {
    width: 8px; height: 8px;
    background: #69f0ae;
    border-radius: 50%;
    box-shadow: 0 0 8px #69f0ae, 0 0 16px rgba(105,240,174,0.4);
    animation: ${AFOS_PREFIX}pulse 2s ease-in-out infinite;
}

@keyframes ${AFOS_PREFIX}pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.85); }
}

.${AFOS_PREFIX}header-actions { display: flex; gap: 8px; }

.${AFOS_PREFIX}btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px; height: 32px;
    padding: 0;
    font-size: 13px;
    color: rgba(255,255,255,0.85);
    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04));
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.08);
    backdrop-filter: blur(8px);
}

.${AFOS_PREFIX}btn:hover {
    background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1));
    border-color: rgba(255,255,255,0.3);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15);
}

.${AFOS_PREFIX}btn:active { transform: translateY(0) scale(0.95); }

.${AFOS_PREFIX}btn-clear:hover {
    color: #ffd180;
    border-color: rgba(255,171,64,0.4);
    box-shadow: 0 0 12px rgba(255,171,64,0.2);
}

.${AFOS_PREFIX}btn-hide:hover {
    color: #ff8a80;
    border-color: rgba(255,82,82,0.4);
    box-shadow: 0 0 12px rgba(255,82,82,0.2);
}

.${AFOS_PREFIX}content { padding: 16px; }

.${AFOS_PREFIX}table {
    max-height: 700px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 6px;
}

.${AFOS_PREFIX}table::-webkit-scrollbar { width: 5px; }
.${AFOS_PREFIX}table::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 3px; }
.${AFOS_PREFIX}table::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
.${AFOS_PREFIX}table::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* Status Block */
.${AFOS_PREFIX}status-block {
    margin-bottom: 16px;
    position: relative;
    background: linear-gradient(145deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 100%);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    animation: ${AFOS_PREFIX}fadeInUp 0.5s ease backwards;
}

.${AFOS_PREFIX}status-block::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--afos-accent, rgba(255,255,255,0.3)), transparent);
    opacity: 0.6;
}

.${AFOS_PREFIX}status-block:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 12px 40px rgba(0,0,0,0.3), 0 0 20px var(--afos-glow, transparent), inset 0 1px 0 rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.15);
}

.${AFOS_PREFIX}status-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    font-weight: 800;
    font-size: 12px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: var(--afos-accent, #fff);
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: linear-gradient(90deg, rgba(255,255,255,0.03), transparent);
    text-shadow: 0 0 10px var(--afos-glow, transparent);
}

.${AFOS_PREFIX}status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 900;
    color: #fff;
    background: var(--afos-badge-bg, rgba(255,255,255,0.15));
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.25);
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.${AFOS_PREFIX}status-badge.${AFOS_PREFIX}badge-pop {
    animation: ${AFOS_PREFIX}badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes ${AFOS_PREFIX}badgePop {
    0% { transform: scale(1); }
    40% { transform: scale(1.35); }
    100% { transform: scale(1); }
}

.${AFOS_PREFIX}status-list { padding: 10px 18px; }

.${AFOS_PREFIX}status-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
    font-size: 14px;
    color: rgba(255,255,255,0.8);
    border-bottom: 1px solid rgba(255,255,255,0.03);
    transition: all 0.25s ease;
    opacity: 1;
    transform: translateX(0);
}

.${AFOS_PREFIX}status-item:last-child { border-bottom: none; }

.${AFOS_PREFIX}status-item:hover {
    color: #fff;
    transform: translateX(4px);
}

.${AFOS_PREFIX}status-item.${AFOS_PREFIX}item-enter {
    animation: ${AFOS_PREFIX}itemEnter 0.35s ease forwards;
}

.${AFOS_PREFIX}status-item.${AFOS_PREFIX}item-exit {
    animation: ${AFOS_PREFIX}itemExit 0.25s ease forwards;
    pointer-events: none;
}

@keyframes ${AFOS_PREFIX}itemEnter {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes ${AFOS_PREFIX}itemExit {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(12px); }
}

.${AFOS_PREFIX}status-icon {
    font-size: 15px;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    flex-shrink: 0;
}

/* Total Block */
.${AFOS_PREFIX}total-block {
    margin-top: 6px;
    position: relative;
    background: linear-gradient(135deg, rgba(0,181,255,0.25) 0%, rgba(14,145,150,0.35) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 20px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 800;
    font-size: 13px;
    letter-spacing: 0.5px;
    color: #fff;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15), 0 0 30px rgba(0,181,255,0.1);
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
    animation: ${AFOS_PREFIX}fadeInUp 0.6s 0.2s ease backwards;
}

.${AFOS_PREFIX}total-block::before {
    content: '';
    position: absolute; inset: 0;
    border-radius: 20px;
    padding: 1.5px;
    background: linear-gradient(135deg, rgba(255,255,255,0.4), transparent 40%, transparent 60%, rgba(255,255,255,0.2));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0.5;
}

.${AFOS_PREFIX}total-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    padding: 5px 14px;
    font-size: 15px;
    font-weight: 900;
    color: #002a4d;
    background: linear-gradient(135deg, #4fc3f7, #00b5ff, #0091ea);
    background-size: 200% 200%;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4), 0 0 20px rgba(0,181,255,0.3);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.${AFOS_PREFIX}total-badge.${AFOS_PREFIX}badge-pop {
    animation: ${AFOS_PREFIX}badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Animations */
@keyframes ${AFOS_PREFIX}fadeInUp {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.${AFOS_PREFIX}status-block:nth-child(1) { animation-delay: 0.04s; }
.${AFOS_PREFIX}status-block:nth-child(2) { animation-delay: 0.08s; }
.${AFOS_PREFIX}status-block:nth-child(3) { animation-delay: 0.12s; }
.${AFOS_PREFIX}status-block:nth-child(4) { animation-delay: 0.16s; }
.${AFOS_PREFIX}status-block:nth-child(5) { animation-delay: 0.20s; }
</style>
`;

// ==========================================
// Window Init
// ==========================================

const wintOperStatus = createWindow('AF_OperStat', 'winTopOpStat', 'winLeftOpStat', win_OperStatus);
hideWindowOnDoubleClick('AF_OperStat');

// ==========================================
// Diff Render Engine (Zero Flicker)
// ==========================================

function afosExtractNames(message, regex) {
    if (!message || !regex) return [];
    const matches = message.match(regex);
    if (!matches) return [];
    return matches.map(m => m.replace(/[:" ,]/g, ''));
}

function afosCreateBlock(label, accent, glow, badgeBg) {
    const block = document.createElement('div');
    block.className = `${AFOS_PREFIX}status-block`;
    block.style.setProperty('--afos-accent', accent);
    block.style.setProperty('--afos-glow', glow);
    block.style.setProperty('--afos-badge-bg', badgeBg);
    block.dataset.label = label;
    block.innerHTML = `
        <div class="${AFOS_PREFIX}status-header">
            <span>${label}</span>
            <span class="${AFOS_PREFIX}status-badge">0</span>
        </div>
        <div class="${AFOS_PREFIX}status-list"></div>
    `;
    return block;
}

function afosCreateItem(name, icon) {
    const el = document.createElement('div');
    el.className = `${AFOS_PREFIX}status-item ${AFOS_PREFIX}item-enter`;
    el.dataset.name = name;
    el.innerHTML = `<span class="${AFOS_PREFIX}status-icon">${icon}</span><span>${name}</span>`;
    requestAnimationFrame(() => el.classList.remove(`${AFOS_PREFIX}item-enter`));
    return el;
}

function afosPopBadge(badge) {
    badge.classList.remove(`${AFOS_PREFIX}badge-pop`);
    void badge.offsetWidth;
    badge.classList.add(`${AFOS_PREFIX}badge-pop`);
}

function afosRenderDiff(message) {
    const container = document.getElementById(AFOS_CONFIG.tableId);
    if (!container) return;

    const newData = new Map();
    let totalCount = 0;

    for (const cfg of Object.values(AFOS_STATUS_MAP)) {
        const names = afosExtractNames(message, cfg.regex);
        totalCount += names.length;
        newData.set(cfg.label, {
            names,
            icon: cfg.icon,
            accent: cfg.accent,
            glow: cfg.glow,
            badgeBg: cfg.badgeBg
        });
    }

    // Remove obsolete blocks with animation
    for (const [label, block] of afosState.blocks) {
        if (!newData.has(label)) {
            block.style.transition = 'all 0.25s ease';
            block.style.opacity = '0';
            block.style.transform = 'scale(0.95)';
            setTimeout(() => block.remove(), 260);
            afosState.blocks.delete(label);
            for (const key of afosState.items.keys()) {
                if (key.startsWith(label + ':')) afosState.items.delete(key);
            }
        }
    }

    // Update / create blocks
    for (const [label, data] of newData) {
        let block = afosState.blocks.get(label);
        if (!block) {
            block = afosCreateBlock(label, data.accent, data.glow, data.badgeBg);
            container.appendChild(block);
            afosState.blocks.set(label, block);
        }

        const listEl = block.querySelector(`.${AFOS_PREFIX}status-list`);
        const badgeEl = block.querySelector(`.${AFOS_PREFIX}status-badge`);

        const currentNames = new Set();
        listEl.querySelectorAll(`.${AFOS_PREFIX}status-item`).forEach(el => currentNames.add(el.dataset.name));
        const newNames = new Set(data.names);

        // Remove old
        listEl.querySelectorAll(`.${AFOS_PREFIX}status-item`).forEach(el => {
            if (!newNames.has(el.dataset.name)) {
                el.classList.add(`${AFOS_PREFIX}item-exit`);
                setTimeout(() => el.remove(), 250);
                afosState.items.delete(`${label}:${el.dataset.name}`);
            }
        });

        // Add new
        data.names.forEach(name => {
            if (!currentNames.has(name)) {
                const item = afosCreateItem(name, data.icon);
                listEl.appendChild(item);
                afosState.items.set(`${label}:${name}`, item);
            }
        });

        // Update badge
        const oldCount = parseInt(badgeEl.textContent, 10) || 0;
        if (oldCount !== data.names.length) {
            badgeEl.textContent = data.names.length;
            afosPopBadge(badgeEl);
        }
    }

    // Total block
    if (!afosState.totalEl) {
        afosState.totalEl = document.createElement('div');
        afosState.totalEl.className = `${AFOS_PREFIX}total-block`;
        afosState.totalEl.innerHTML = `
            <span>Всего операторов в системе</span>
            <span class="${AFOS_PREFIX}total-badge">0</span>
        `;
        container.appendChild(afosState.totalEl);
    }

    const totalBadge = afosState.totalEl.querySelector(`.${AFOS_PREFIX}total-badge`);
    const oldTotal = parseInt(totalBadge.textContent, 10) || 0;
    if (oldTotal !== totalCount) {
        totalBadge.textContent = totalCount;
        afosPopBadge(totalBadge);
    }

    afosState.lastMessage = message;
}

function afosClearTable() {
    const container = document.getElementById(AFOS_CONFIG.tableId);
    if (!container) return;

    const blocks = container.querySelectorAll(`.${AFOS_PREFIX}status-block, .${AFOS_PREFIX}total-block`);
    blocks.forEach((b, i) => {
        b.style.transition = 'all 0.25s ease';
        b.style.opacity = '0';
        b.style.transform = 'translateY(-8px)';
        setTimeout(() => b.remove(), 260 + i * 30);
    });

    afosState.blocks.clear();
    afosState.items.clear();
    afosState.totalEl = null;
    afosState.lastMessage = null;
}

// ==========================================
// WebSocket
// ==========================================

let afosSocket = null;
let afosCheckInterval = null;

function afosInitSocket() {
    if (afosSocket?.readyState === WebSocket.OPEN) return;

    try {
        afosSocket = new WebSocket(AFOS_CONFIG.wsUrl);

        afosCheckInterval = setInterval(() => {
            if (afosSocket.readyState === WebSocket.OPEN) {
                clearInterval(afosCheckInterval);
                afosCheckInterval = null;

                afosSocket.send(AFOS_CONFIG.wsGroup);

                afosSocket.onmessage = (event) => {
                    afosSocket.send(AFOS_CONFIG.wsPing);
                    afosRenderDiff(event.data);
                };

                afosSocket.onerror = (err) => console.warn('[AF OperStatus] WS error:', err);
                afosSocket.onclose = () => { afosSocket = null; };
            }
        }, AFOS_CONFIG.checkInterval);
    } catch (err) {
        console.error('[AF OperStatus] WS failed:', err);
    }
}

function afosCloseSocket() {
    if (afosCheckInterval) { clearInterval(afosCheckInterval); afosCheckInterval = null; }
    if (afosSocket) {
        try { afosSocket.send(AFOS_CONFIG.wsClose); afosSocket.close(); } catch (e) { }
        afosSocket = null;
    }
}

function afosToggleWindow() {
    const win = document.getElementById(AFOS_CONFIG.windowId);
    const menu = document.getElementById('idmymenu');
    const btn = document.getElementById('MainMenuBtn');
    if (!win) return;

    const isHidden = win.style.display === 'none';
    win.style.display = isHidden ? '' : 'none';
    if (menu) menu.style.display = 'none';
    if (btn) btn.classList.remove('activeScriptBtn');

    if (isHidden) afosInitSocket();
    else { afosCloseSocket(); afosClearTable(); }
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