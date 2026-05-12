// ==========================================
// AF OperStatus — Cyber-Dark UI (Sleek Dark)
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
        accent: '#00e676',
        glow: 'rgba(0, 230, 118, 0.4)',
        badgeBg: 'linear-gradient(135deg, #69f0ae, #00c853)' // Оставлено для совместимости, но переопределено в CSS
    },
    InServiceOut: {
        regex: /(:")(\D+)(",)(?="lastStatus":"InServiceOut")/gm,
        icon: '📞',
        label: 'In Service',
        accent: '#00e5ff',
        glow: 'rgba(0, 229, 255, 0.4)',
        badgeBg: 'linear-gradient(135deg, #ffd740, #ffab00)'
    },
    AfterServiceOut: {
        regex: /(:")(\D+)(",)(?="lastStatus":"AfterServiceOut")/gm,
        icon: '📵',
        label: 'After Service',
        accent: '#ff9100',
        glow: 'rgba(255, 145, 0, 0.4)',
        badgeBg: 'linear-gradient(135deg, #ffab40, #ff6d00)'
    },
    Timeout: {
        regex: /(:")(\D+)(",)(?="lastStatus":"Timeout")/gm,
        icon: '⏳',
        label: 'Timeout',
        accent: '#ff1744',
        glow: 'rgba(255, 23, 68, 0.4)',
        badgeBg: 'linear-gradient(135deg, #ff5252, #d50000)'
    },
    DND: {
        regex: /(:")(\D+)(",)(?="lastStatus":"DND")/gm,
        icon: '🍔',
        label: 'DND',
        accent: '#d500f9',
        glow: 'rgba(213, 0, 249, 0.4)',
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
// HTML Template (Cyber-Dark Styles)
// ==========================================

const win_OperStatus = `
<div class="${AFOS_PREFIX}wrapper">
    <div class="${AFOS_PREFIX}inner">
        <div class="${AFOS_PREFIX}ambient-glow"></div>
        <div class="${AFOS_PREFIX}noise"></div>
        <div class="${AFOS_PREFIX}drag-handle chmaf-drag-handle" id="${AFOS_CONFIG.headerId}">
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
   AF OperStatus — NEON GLASS ULTRA
   ============================================ */

.${AFOS_PREFIX}wrapper {
    display: flex;
    width: 420px;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    color: #e2e8f0;
}

.${AFOS_PREFIX}inner {
    width: 100%;
    margin: 6px;
    position: relative;
    background:
        linear-gradient(135deg, rgba(26, 26, 44, 0.94) 0%, rgba(18, 18, 34, 0.96) 100%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23242850' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow:
        0 0 0 1px rgba(0, 0, 0, 0.5),
        0 20px 50px rgba(0, 0, 0, 0.7),
        0 0 30px rgba(139, 92, 246, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    overflow: hidden;
    animation: ${AFOS_PREFIX}fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1);
}

/* Animated neon top border */
.${AFOS_PREFIX}inner::before {
    content: '';
    position: absolute;
    top: 0; left: -50%; right: -50%;
    height: 2px;
    background: linear-gradient(90deg,
        transparent 0%,
        #8b5cf6 20%,
        #ec4899 40%,
        #06b6d4 60%,
        #8b5cf6 80%,
        transparent 100%);
    background-size: 200% 100%;
    animation: ${AFOS_PREFIX}neonBorderFlow 3s linear infinite;
    opacity: 0.7;
    z-index: 5;
    pointer-events: none;
}

/* Inner radial glow */
.${AFOS_PREFIX}inner::after {
    content: '';
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: 1;
}

@keyframes ${AFOS_PREFIX}neonBorderFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

.${AFOS_PREFIX}ambient-glow {
    position: absolute;
    top: -50%; left: -50%;
    width: 200%; height: 200%;
    background:
        radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.03), transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.03), transparent 50%);
    animation: ${AFOS_PREFIX}ambientMove 25s linear infinite;
    pointer-events: none;
    z-index: 0;
}

@keyframes ${AFOS_PREFIX}ambientMove {
    0% { transform: translate(0, 0) rotate(0deg); }
    50% { transform: translate(2%, 2%) rotate(180deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
}

.${AFOS_PREFIX}noise {
    position: absolute; inset: 0;
    opacity: 0.012;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
}

.${AFOS_PREFIX}drag-handle, .${AFOS_PREFIX}content { position: relative; z-index: 2; }

.${AFOS_PREFIX}drag-handle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    cursor: grab;
    user-select: none;
    position: relative;
    z-index: 3;
}

.${AFOS_PREFIX}drag-handle:active { cursor: grabbing; }

.${AFOS_PREFIX}title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #fff;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
}

.${AFOS_PREFIX}title-dot {
    width: 7px; height: 7px;
    background: #22d3ee;
    border-radius: 50%;
    box-shadow: 0 0 8px #22d3ee, 0 0 16px rgba(34, 211, 238, 0.5);
    animation: ${AFOS_PREFIX}pulseNeon 2.5s ease-in-out infinite;
}

@keyframes ${AFOS_PREFIX}pulseNeon {
    0%, 100% { opacity: 1; box-shadow: 0 0 8px #22d3ee, 0 0 16px rgba(34,211,238,0.5); }
    50% { opacity: 0.5; box-shadow: 0 0 4px #22d3ee, 0 0 8px rgba(34,211,238,0.2); }
}

.${AFOS_PREFIX}header-actions { display: flex; gap: 6px; }

.${AFOS_PREFIX}btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px; height: 28px;
    padding: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
}

.${AFOS_PREFIX}btn::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 45%;
    background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%);
    border-radius: 8px 8px 0 0;
    pointer-events: none;
}

.${AFOS_PREFIX}btn:hover {
    background: rgba(255, 255, 255, 0.06);
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.${AFOS_PREFIX}btn-clear:hover {
    border-color: rgba(34, 211, 238, 0.4);
    color: #22d3ee;
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.15), inset 0 0 8px rgba(34, 211, 238, 0.05);
}

.${AFOS_PREFIX}btn-hide:hover {
    border-color: rgba(248, 113, 113, 0.4);
    color: #f87171;
    box-shadow: 0 0 12px rgba(248, 113, 113, 0.15), inset 0 0 8px rgba(248, 113, 113, 0.05);
}

.${AFOS_PREFIX}content { padding: 14px; }

.${AFOS_PREFIX}table {
    max-height: 700px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;
}

.${AFOS_PREFIX}table::-webkit-scrollbar { width: 4px; }
.${AFOS_PREFIX}table::-webkit-scrollbar-track { background: transparent; }
.${AFOS_PREFIX}table::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 4px; }
.${AFOS_PREFIX}table::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }

/* Status Block — Neon Glass Card */
.${AFOS_PREFIX}status-block {
    margin-bottom: 12px;
    position: relative;
    background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-left: 3px solid var(--afos-accent);
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: ${AFOS_PREFIX}fadeInUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
    overflow: hidden;
}

.${AFOS_PREFIX}status-block::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 40%;
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%);
    border-radius: 12px 12px 0 0;
    pointer-events: none;
}

.${AFOS_PREFIX}status-block:hover {
    transform: translateX(3px) translateY(-1px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 20px var(--afos-glow, transparent);
    background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
    border-color: rgba(255, 255, 255, 0.08);
}

.${AFOS_PREFIX}status-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    font-weight: 700;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: var(--afos-accent, #fff);
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    background: rgba(0, 0, 0, 0.15);
    position: relative;
    z-index: 1;
}

/* Premium Neon Glass Badge */
.${AFOS_PREFIX}status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 3px 8px;
    font-size: 12px;
    font-weight: 900;
    font-family: 'Consolas', monospace;
    color: var(--afos-accent);
    background:
        linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%),
        rgba(0, 0, 0, 0.35);
    border: 1px solid var(--afos-accent);
    border-radius: 8px;
    box-shadow:
        0 2px 6px rgba(0,0,0,0.4),
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 0 10px var(--afos-glow);
    text-shadow: 0 0 8px var(--afos-accent);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
}

.${AFOS_PREFIX}status-badge::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 15%; right: 15%;
    height: 4px;
    background: var(--afos-accent);
    border-radius: 50%;
    filter: blur(4px);
    opacity: 0.4;
}

.${AFOS_PREFIX}status-badge.${AFOS_PREFIX}badge-pop {
    animation: ${AFOS_PREFIX}badgeCyberPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes ${AFOS_PREFIX}badgeCyberPop {
    0% { transform: scale(1); box-shadow: 0 0 10px var(--afos-glow); }
    40% { transform: scale(1.2); box-shadow: 0 0 25px var(--afos-accent), inset 0 0 10px var(--afos-accent); }
    100% { transform: scale(1); box-shadow: 0 0 10px var(--afos-glow); }
}

.${AFOS_PREFIX}status-list { padding: 6px 14px; position: relative; z-index: 1; }

.${AFOS_PREFIX}status-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 5px 0;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    border-bottom: 1px dotted rgba(255, 255, 255, 0.04);
    transition: all 0.25s ease;
    opacity: 1;
    transform: translateX(0);
}

.${AFOS_PREFIX}status-item:last-child { border-bottom: none; }

.${AFOS_PREFIX}status-item:hover {
    color: #fff;
    transform: translateX(5px);
    text-shadow: 0 0 8px var(--afos-glow);
}

.${AFOS_PREFIX}status-item.${AFOS_PREFIX}item-enter {
    animation: ${AFOS_PREFIX}itemEnter 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.${AFOS_PREFIX}status-item.${AFOS_PREFIX}item-exit {
    animation: ${AFOS_PREFIX}itemExit 0.2s ease-in forwards;
    pointer-events: none;
}

@keyframes ${AFOS_PREFIX}itemEnter {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes ${AFOS_PREFIX}itemExit {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(10px); }
}

.${AFOS_PREFIX}status-icon {
    font-size: 13px;
    filter: drop-shadow(0 0 4px rgba(255,255,255,0.2));
    flex-shrink: 0;
}

/* Total Block — Cyan Neon Glass Core */
.${AFOS_PREFIX}total-block {
    margin-top: 10px;
    position: relative;
    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    border: 1px solid rgba(34, 211, 238, 0.15);
    border-left: 3px solid #22d3ee;
    border-radius: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #e2e8f0;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(34, 211, 238, 0.06), inset 0 1px 0 rgba(255,255,255,0.03);
    animation: ${AFOS_PREFIX}fadeInUp 0.5s 0.2s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
    overflow: hidden;
}

.${AFOS_PREFIX}total-block::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 40%;
    background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
    border-radius: 12px 12px 0 0;
    pointer-events: none;
}

.${AFOS_PREFIX}total-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    padding: 3px 10px;
    font-size: 13px;
    font-weight: 900;
    font-family: 'Consolas', monospace;
    color: #22d3ee;
    background:
        linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%),
        rgba(0, 0, 0, 0.35);
    border: 1px solid #22d3ee;
    border-radius: 8px;
    box-shadow:
        0 2px 6px rgba(0,0,0,0.4),
        inset 0 1px 0 rgba(255,255,255,0.08),
        0 0 12px rgba(34, 211, 238, 0.25);
    text-shadow: 0 0 8px #22d3ee;
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
}

.${AFOS_PREFIX}total-badge::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 15%; right: 15%;
    height: 4px;
    background: #22d3ee;
    border-radius: 50%;
    filter: blur(4px);
    opacity: 0.4;
}

.${AFOS_PREFIX}total-badge.${AFOS_PREFIX}badge-pop {
    animation: ${AFOS_PREFIX}badgeTotalPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes ${AFOS_PREFIX}badgeTotalPop {
    0% { transform: scale(1); box-shadow: 0 0 12px rgba(34, 211, 238, 0.25); }
    40% { transform: scale(1.25); box-shadow: 0 0 30px #22d3ee, inset 0 0 15px #22d3ee; }
    100% { transform: scale(1); box-shadow: 0 0 12px rgba(34, 211, 238, 0.25); }
}

/* Base Animations */
@keyframes ${AFOS_PREFIX}fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.${AFOS_PREFIX}status-block:nth-child(1) { animation-delay: 0.03s; }
.${AFOS_PREFIX}status-block:nth-child(2) { animation-delay: 0.06s; }
.${AFOS_PREFIX}status-block:nth-child(3) { animation-delay: 0.09s; }
.${AFOS_PREFIX}status-block:nth-child(4) { animation-delay: 0.12s; }
.${AFOS_PREFIX}status-block:nth-child(5) { animation-delay: 0.15s; }
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
                setTimeout(() => el.remove(), 200);
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
            <span>Всего операторов</span>
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