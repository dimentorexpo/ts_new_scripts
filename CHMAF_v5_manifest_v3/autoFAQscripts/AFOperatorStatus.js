/**
 * NEON GLASS ULTRA — Premium Cyber-Dark UI v2.1
 * Zero gradient-line noise, premium queue cards with dedicated neon signatures
 * Filename: refactor-neon-glass-v21.js
 */

// === STATE & CACHE ==========================================================
const statusContainer = document.createElement('div');
statusContainer.id = 'idforpeopstatus';
statusContainer.className = 'op-st-main-container';

let opStatusInterval;
let lastAlertTime = 0;
let siderCache = null;
const badgeCache = new Map();
const alertAudio = new Audio('https://grumstv.github.io/Sounds/alert.mp3');

const OP_GROUP_CONFIG = {
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
        queueBy: 'groupId',
        queueIds: ['68932fae-b9f9-6b37-2a52-911b2b6b4f6d']
    },
    'Teachers Care': {
        operatorMatch: /Teachers Care\D/,
        sumAllUnassigned: true
    }
};

// === CORE LOGIC =============================================================
async function operstatusleftbar() {
    try {
        const key = await waitForOpSectionNew();
        if (!key || !OP_GROUP_CONFIG[key]) {
            if (key !== null) statusContainer.innerHTML = '';
            return;
        }

        const cfg = OP_GROUP_CONFIG[key];
        const response = await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", {
            headers: { "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' },
            credentials: "include"
        });
        const result = await response.json();

        const tpQueue = getUnassignedCount(result, OP_GROUP_CONFIG['ТП']);
        const tpOsQueue = getUnassignedCount(result, OP_GROUP_CONFIG['ТП ОС']);
        const currentQueue = getUnassignedCount(result, cfg);

        if (key === 'ТП ОС' && tpQueue > 0) {
            showEmergencyQueueAlert(tpQueue);
        }

        let opstats = [];
        if (key === 'ТП ОС') {
            const map = new Map();
            filterOperatorsLocal(result, OP_GROUP_CONFIG['ТП']).forEach(o => map.set(o.operator.id, o));
            filterOperatorsLocal(result, OP_GROUP_CONFIG['ТП ОС']).forEach(o => map.set(o.operator.id, o));
            opstats = Array.from(map.values());
        } else {
            opstats = filterOperatorsLocal(result, cfg);
        }

        const activeIds = new Set(opstats.map(o => o.operator.id));
        for (const id of badgeCache.keys()) {
            if (!activeIds.has(id)) badgeCache.delete(id);
        }

        const stats = {
            online: opstats.filter(o => o.operator.status === 'Online').length,
            busy: opstats.filter(o => o.operator.status === 'Busy').length,
            pause: opstats.filter(o => o.operator.status === 'Pause').length
        };

        const hidesummary = localStorage.getItem('hidesummaryflag') === '1';
        const isAlert = (key === 'ТП' || key === 'ТП ОС') && tpQueue > 10;

        statusContainer.innerHTML = `
            <div class="op-st-queue-box ${isAlert ? 'alert-mode' : ''}">
                <div class="queue-header">
                    <div class="queue-dot"></div>
                    <span class="queue-title">Очередь</span>
                </div>
                ${(key === 'ТП' || key === 'ТП ОС')
                ? `<div class="queue-stats">
                       <div class="queue-stat-item ${tpQueue > 10 ? 'alert-state' : 'normal-state'}">
                           <span class="queue-label">ТП</span>
                           <span class="queue-value">${tpQueue}</span>
                       </div>
                       <div class="queue-divider"></div>
                       <div class="queue-stat-item info-state">
                           <span class="queue-label">ТП ОС</span>
                           <span class="queue-value">${tpOsQueue}</span>
                       </div>
                   </div>`
                : `<div class="queue-stats">
                       <div class="queue-stat-item premium-state">
                           <span class="queue-label">${key}</span>
                           <span class="queue-value">${currentQueue}</span>
                       </div>
                   </div>`}
            </div>
            <div class="op-st-list">${renderOperatorRows(opstats)}</div>
            <div class="op-st-toggle" id="op-st-toggle-btn">
                ${hidesummary ? '🔽 Сводка' : '🔼 Скрыть'}
            </div>
            <div id="op-st-stats-panel" class="op-st-hud-trench" style="display: ${hidesummary ? 'none' : 'flex'}">
                <div class="hud-module m-online">
                    <div class="hud-mod-glow"></div>
                    <div class="hud-mod-header">ОНЛАЙН</div>
                    <div class="hud-mod-value">${stats.online}</div>
                </div>
                <div class="hud-module m-busy">
                    <div class="hud-mod-glow"></div>
                    <div class="hud-mod-header">ЗАНЯТ</div>
                    <div class="hud-mod-value">${stats.busy}</div>
                </div>
                <div class="hud-module m-pause">
                    <div class="hud-mod-glow"></div>
                    <div class="hud-mod-header">ПЕРЕРЫВ</div>
                    <div class="hud-mod-value">${stats.pause}</div>
                </div>
            </div>
        `;

        attachOpHandlers();
    } catch (e) { console.error('OpStatus Error:', e); }
}

// === HELPERS ================================================================
async function waitForOpSectionNew(timeout = 3000) {
    return new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
            try {
                const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
                const el = iframe?.contentDocument?.querySelector('span[id^="mantine-"][id$="-target"]');
                if (el) {
                    const sectionName = el.textContent.split('-')[0].trim();
                    return resolve(sectionName);
                }
            } catch (e) { }
            if (Date.now() - start > timeout) return resolve(null);
            requestAnimationFrame(check);
        };
        check();
    });
}

function getUnassignedCount(result, cfg) {
    if (!result || !result.unAssigned) return 0;
    if (cfg.sumAllUnassigned) return result.unAssigned.reduce((s, i) => s + Number(i.count || 0), 0);
    const key = cfg.queueBy === 'groupId' ? 'groupId' : 'kb';
    return result.unAssigned
        .filter(i => cfg.queueIds.includes(i[key]))
        .reduce((s, i) => s + Number(i.count || 0), 0);
}

function filterOperatorsLocal(result, cfg) {
    return (result.onOperator || []).filter(item => {
        const op = item.operator;
        if (!op || op.status === 'Offline') return false;
        if (!cfg.operatorMatch.test(op.fullName || '')) return false;
        if (cfg.groupIdFilter && item.groupId !== cfg.groupIdFilter) return false;
        return true;
    });
}

const cleanOperatorName = (fullName) => {
    if (!fullName) return '';
    if (fullName.startsWith('ТП ОС-')) return fullName;
    return fullName.replace(/^(ТП|Prem|КЦ|Teachers Care)-/, '');
};

const renderOperatorRows = (opstats) => {
    const merged = new Map();
    opstats.forEach(item => {
        const id = item.operator.id;
        if (merged.has(id)) {
            const existing = merged.get(id);
            existing.aCnt = (existing.aCnt || 0) + (item.aCnt || 0);
            existing.cCnt = (existing.cCnt || 0) + (item.cCnt || 0);
        } else {
            merged.set(id, { ...item });
        }
    });
    const uniqueOps = Array.from(merged.values());

    const statusMap = {
        Online: {
            bg: 'rgba(16, 185, 129, 0.12)',
            glow: '#10b981',
            b: 'rgba(16, 185, 129, 0.4)',
            textGlow: '0 0 8px rgba(16, 185, 129, 0.5)'
        },
        Busy: {
            bg: 'rgba(245, 158, 11, 0.12)',
            glow: '#f59e0b',
            b: 'rgba(245, 158, 11, 0.4)',
            textGlow: '0 0 8px rgba(245, 158, 11, 0.5)'
        },
        Pause: {
            bg: 'rgba(239, 68, 68, 0.12)',
            glow: '#ef4444',
            b: 'rgba(239, 68, 68, 0.4)',
            textGlow: '0 0 8px rgba(239, 68, 68, 0.5)'
        }
    };

    return uniqueOps.sort((a, b) => a.operator.status.localeCompare(b.operator.status))
        .map(item => {
            const op = item.operator;
            const theme = statusMap[op.status] || {
                bg: 'rgba(100,100,100,0.1)',
                glow: '#aaa',
                b: 'rgba(100,100,100,0.3)',
                textGlow: 'none'
            };

            const isTpOs = op.fullName?.toUpperCase().includes('ТП ОС');
            const currentCount = (item.aCnt || 0) + (item.cCnt || 0);

            const prevCount = badgeCache.get(op.id) || 0;
            let pulseClass = '';
            if (prevCount !== 0) {
                if (currentCount > prevCount) pulseClass = 'pulse-up';
                else if (currentCount < prevCount) pulseClass = 'pulse-down';
            }
            badgeCache.set(op.id, currentCount);

            let opColor = op.status === 'Online' ? '#e2e8f0' : '#94a3b8';
            if (isTpOs) opColor = op.status === 'Online' ? '#22d3ee' : '#0891b2';

            const displayName = cleanOperatorName(op.fullName);

            return `<div class="op-st-row ${isTpOs ? 'tp-os-row' : ''}" name="operrow" data-id="${op.id}">
                        <span class="op-st-badge ${pulseClass}" data-count="${currentCount}"
                            style="--badge-bg: ${theme.bg}; --badge-color: ${theme.glow}; --badge-border: ${theme.b}; --badge-glow: ${theme.textGlow};">
                            ${currentCount}
                        </span>
                        <span style="opacity: ${op.status === 'Online' ? 1 : 0.7}; color: ${opColor}; font-weight: ${isTpOs ? '600' : '500'}; letter-spacing: 0.3px;">
                            ${displayName}
                        </span>
                    </div>`;
        }).join('');
};

function attachOpHandlers() {
    const toggleBtn = document.getElementById('op-st-toggle-btn');
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const isHiding = localStorage.getItem('hidesummaryflag') === '1';
            localStorage.setItem('hidesummaryflag', isHiding ? '0' : '1');
            operstatusleftbar();
        };
    }

    document.querySelectorAll('[name="operrow"]').forEach(el => {
        el.onclick = function () {
            const chatHis = document.getElementById('AF_ChatHis');
            if (chatHis && chatHis.style.display === 'none') document.getElementById('opennewcat')?.click();
            setTimeout(() => {
                const select = document.getElementById('operatorstp');
                if (select) {
                    select.value = this.getAttribute('data-id');
                    select.dispatchEvent(new Event('change'));
                    if (typeof findchatsoper === 'function') findchatsoper();
                }
            }, 800);
        };
    });
}

// === ALERT ==================================================================
const showEmergencyQueueAlert = (count) => {
    const now = Date.now();
    if (now - lastAlertTime < 5 * 60 * 1000) return;

    document.querySelectorAll('.op-st-alert-overlay').forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'op-st-alert-overlay';
    overlay.innerHTML = `
        <div class="op-st-alert-modal">
            <div class="op-st-alert-icon">⚠️</div>
            <h2 class="op-st-alert-title">Системная тревога</h2>
            <p class="op-st-alert-text">
                В основной очереди ТП критическая нагрузка: <br>
                <b class="op-st-alert-count">${count} чатов</b>
                <span class="op-st-alert-sub">Требуется немедленное подключение! 🚀</span>
            </p>
            <button class="op-st-alert-btn" id="op-st-alert-close">Принято, выхожу</button>
        </div>`;
    document.body.appendChild(overlay);

    try {
        alertAudio.currentTime = 0;
        alertAudio.volume = 0.6;
        alertAudio.play().catch(e => console.log('Audio play blocked or failed'));
    } catch (e) { }

    document.getElementById('op-st-alert-close').onclick = () => {
        lastAlertTime = Date.now();
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s ease';
        setTimeout(() => overlay.remove(), 400);
    };
};

// === STYLES =================================================================
const injectOpStatusStyles = () => {
    if (document.getElementById('op-status-styles')) return;
    const style = document.createElement('style');
    style.id = 'op-status-styles';
    style.innerHTML = `
        /* === VARIABLES === */
        :root {
            --neon-purple: #8b5cf6;
            --neon-pink: #ec4899;
            --neon-cyan: #06b6d4;
            --neon-red: #ef4444;
            --glass-bg: rgba(10, 10, 25, 0.92);
            --glass-border: rgba(255, 255, 255, 0.06);
        }

        /* === MAIN CONTAINER === */
        .op-st-main-container {
            width: 200px;
            margin: 12px auto;
            background:
                linear-gradient(135deg, var(--glass-bg) 0%, rgba(5, 5, 15, 0.96) 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23181830' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            color: #e2e8f0;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            box-shadow:
                0 0 0 1px rgba(0, 0, 0, 0.5),
                0 20px 50px rgba(0, 0, 0, 0.7),
                0 0 80px -20px rgba(139, 92, 246, 0.12);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(20px) saturate(1.2);
            -webkit-backdrop-filter: blur(20px) saturate(1.2);
            z-index: 1;
        }

        /* CRT noise overlay */
        .op-st-main-container::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 20px;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
            opacity: 0.35;
            pointer-events: none;
            z-index: 0;
        }

        /* === QUEUE BOX === */
        .op-st-queue-box {
            position: relative;
            background: linear-gradient(145deg, rgba(22, 22, 38, 0.55) 0%, rgba(12, 12, 22, 0.75) 100%);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            margin-bottom: 5px;
            box-shadow:
                0 8px 32px rgba(0, 0, 0, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.04);
            overflow: hidden;
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.4s ease;
        }

        .queue-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding-bottom: 2px;
        }

        .queue-dot {
            width: 5px;
            height: 5px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }

        .queue-title {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 2.5px;
            color: #64748b;
            text-transform: uppercase;
        }

        /* === QUEUE STATS PANEL === */
        .queue-stats {
            display: flex;
            justify-content: space-evenly;
            align-items: stretch;
            background: rgba(0, 0, 0, 0.28);
            border-radius: 14px;
            padding: 8px 6px;
            border: 1px solid rgba(255, 255, 255, 0.03);
            box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.35);
            gap: 4px;
        }

        .queue-divider {
            width: 1px;
            align-self: center;
            height: 32px;
            background: linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent);
            flex-shrink: 0;
            margin: 0 2px;
        }

        /* === QUEUE STAT ITEM (base) === */
        .queue-stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            flex: 1;
            padding: 10px 4px;
            border-radius: 10px;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            border: 1px solid transparent;
            cursor: default;
        }

        /* Bottom glow */
        .queue-stat-item::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 55%;
            height: 16px;
            filter: blur(10px);
            opacity: 0.25;
            transition: opacity 0.3s ease, transform 0.3s ease;
            z-index: 0;
            border-radius: 50%;
        }

        .queue-stat-item:hover::after {
            opacity: 0.55;
            transform: translateX(-50%) scaleX(1.2);
        }

        .queue-stat-item:hover {
            transform: translateY(-2px);
        }

        .queue-label {
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            z-index: 1;
            position: relative;
        }

        .queue-value {
            font-size: 24px;
            font-weight: 900;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            letter-spacing: -1px;
            line-height: 1;
            transition: all 0.3s ease;
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum";
            z-index: 1;
            position: relative;
        }

        /* --- NORMAL STATE (ТП) --- */
        .queue-stat-item.normal-state {
            background: linear-gradient(180deg, rgba(248, 113, 113, 0.07) 0%, rgba(248, 113, 113, 0.01) 100%);
            border-color: rgba(248, 113, 113, 0.15);
            box-shadow: 0 4px 14px rgba(248, 113, 113, 0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .queue-stat-item.normal-state::after { background: #f87171; }
        .queue-stat-item.normal-state .queue-label { color: rgba(248, 113, 113, 0.75); }
        .queue-stat-item.normal-state .queue-value {
            color: #fca5a5;
            text-shadow: 0 0 18px rgba(248, 113, 113, 0.5), 0 0 40px rgba(248, 113, 113, 0.2);
        }
        .queue-stat-item.normal-state:hover {
            box-shadow: 0 6px 20px rgba(248, 113, 113, 0.14), inset 0 1px 0 rgba(255,255,255,0.04);
            border-color: rgba(248, 113, 113, 0.3);
        }

        /* --- INFO STATE (ТП ОС) --- */
        .queue-stat-item.info-state {
            background: linear-gradient(180deg, rgba(34, 211, 238, 0.07) 0%, rgba(34, 211, 238, 0.01) 100%);
            border-color: rgba(34, 211, 238, 0.15);
            box-shadow: 0 4px 14px rgba(34, 211, 238, 0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .queue-stat-item.info-state::after { background: #22d3ee; }
        .queue-stat-item.info-state .queue-label { color: rgba(34, 211, 238, 0.75); }
        .queue-stat-item.info-state .queue-value {
            color: #67e8f9;
            text-shadow: 0 0 18px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.2);
        }
        .queue-stat-item.info-state:hover {
            box-shadow: 0 6px 20px rgba(34, 211, 238, 0.14), inset 0 1px 0 rgba(255,255,255,0.04);
            border-color: rgba(34, 211, 238, 0.3);
        }

        /* --- PREMIUM STATE (Other Depts) --- */
        .queue-stat-item.premium-state {
            background: linear-gradient(180deg, rgba(167, 139, 250, 0.07) 0%, rgba(167, 139, 250, 0.01) 100%);
            border-color: rgba(167, 139, 250, 0.15);
            box-shadow: 0 4px 14px rgba(167, 139, 250, 0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .queue-stat-item.premium-state::after { background: #a78bfa; }
        .queue-stat-item.premium-state .queue-label { color: rgba(167, 139, 250, 0.75); }
        .queue-stat-item.premium-state .queue-value {
            color: #c4b5fd;
            text-shadow: 0 0 18px rgba(167, 139, 250, 0.5), 0 0 40px rgba(167, 139, 250, 0.2);
        }
        .queue-stat-item.premium-state:hover {
            box-shadow: 0 6px 20px rgba(167, 139, 250, 0.14), inset 0 1px 0 rgba(255,255,255,0.04);
            border-color: rgba(167, 139, 250, 0.3);
        }

        /* --- ALERT STATE (Critical ТП) --- */
        .queue-stat-item.alert-state {
            background: linear-gradient(180deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.03) 100%);
            border-color: rgba(239, 68, 68, 0.3);
            box-shadow: 0 4px 18px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.04);
            animation: alertPulse 2.2s ease-in-out infinite;
        }
        .queue-stat-item.alert-state::after { background: #ef4444; }
        .queue-stat-item.alert-state .queue-label { color: rgba(255, 107, 107, 0.9); }
        .queue-stat-item.alert-state .queue-value {
            color: #ff9e9e;
            text-shadow: 0 0 24px rgba(255, 107, 107, 0.6), 0 0 50px rgba(255, 107, 107, 0.25);
        }

        @keyframes alertPulse {
            0%, 100% { box-shadow: 0 4px 18px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.04); }
            50% { box-shadow: 0 6px 28px rgba(239, 68, 68, 0.28), inset 0 1px 0 rgba(255,255,255,0.04); }
        }

        /* === ALERT MODE (queue box wrapper) === */
        .op-st-queue-box.alert-mode {
            border-color: rgba(239, 68, 68, 0.15);
            background: linear-gradient(145deg, rgba(239, 68, 68, 0.06) 0%, rgba(12, 12, 22, 0.8) 60%);
            box-shadow:
                0 8px 32px rgba(0, 0, 0, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.04),
                0 0 30px rgba(239, 68, 68, 0.08);
        }

        .op-st-queue-box.alert-mode .queue-dot {
            background: #ef4444;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.6);
            animation: pulseAlertDot 1.2s ease-in-out infinite;
        }

        @keyframes pulseAlertDot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.35; transform: scale(0.75); }
        }

        /* === OPERATOR ROWS === */
        .op-st-row {
            position: relative;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 10px;
            margin: 3px 0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 11.5px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-left: 3px solid transparent;
            z-index: 1;
            overflow: hidden;
            vertical-align: middle;
        }

        .op-st-row::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 10px;
            background: radial-gradient(350px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.07), transparent 40%);
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
            z-index: 0;
        }

        .op-st-row:hover::after {
            opacity: 1;
        }

        .op-st-row:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
            transform: translateX(5px) scale(1.01);
            box-shadow:
                0 6px 20px rgba(0, 0, 0, 0.4),
                0 0 15px rgba(139, 92, 246, 0.08);
            color: #fff;
        }

        .op-st-row.tp-os-row {
            background: linear-gradient(90deg,
                rgba(6, 182, 212, 0.08) 0%,
                rgba(6, 182, 212, 0.02) 100%);
            border-left: 3px solid #06b6d4;
            box-shadow:
                inset 0 0 10px rgba(6, 182, 212, 0.04),
                0 0 10px rgba(6, 182, 212, 0.04);
        }

        .op-st-row.tp-os-row:hover {
            background: linear-gradient(90deg,
                rgba(6, 182, 212, 0.15) 0%,
                rgba(6, 182, 212, 0.05) 100%);
            border-left-color: #22d3ee;
            box-shadow:
                inset 0 0 15px rgba(6, 182, 212, 0.08),
                0 0 20px rgba(6, 182, 212, 0.12);
        }

        /* === BADGES === */
        .op-st-badge {
            min-width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-weight: 900;
            font-size: 12px;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
            transition: all 0.4s ease;
            background:
                linear-gradient(135deg,
                    rgba(255,255,255,0.08) 0%,
                    rgba(255,255,255,0) 50%),
                var(--badge-bg, rgba(100,100,100,0.12));
            border: 1px solid var(--badge-border, rgba(100,100,100,0.3));
            color: var(--badge-color, #aaa);
            text-shadow: var(--badge-glow, none);
            box-shadow:
                0 2px 8px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.12),
                0 0 0 1px rgba(0,0,0,0.3);
        }

        .op-st-badge::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 40%;
            background: linear-gradient(180deg,
                rgba(255,255,255,0.15) 0%,
                rgba(255,255,255,0) 100%);
            border-radius: 8px 8px 0 0;
            pointer-events: none;
        }

        .op-st-badge::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 15%; right: 15%;
            height: 4px;
            background: var(--badge-color, #aaa);
            border-radius: 50%;
            filter: blur(4px);
            opacity: 0.4;
            transition: opacity 0.3s ease;
        }

        .op-st-badge:hover::after {
            opacity: 0.7;
        }

        .op-st-badge.pulse-up {
            animation: badgePulseSoft 0.6s ease;
        }

        .op-st-badge.pulse-down {
            animation: badgePulseSoftDown 0.6s ease;
        }

        @keyframes badgePulseSoft {
            0% { transform: scale(1); }
            30% { transform: scale(1.12); filter: brightness(1.25); }
            60% { transform: scale(0.96); }
            100% { transform: scale(1); filter: brightness(1); }
        }

        @keyframes badgePulseSoftDown {
            0% { transform: scale(1); }
            30% { transform: scale(0.88); filter: brightness(0.75); }
            60% { transform: scale(1.04); }
            100% { transform: scale(1); filter: brightness(1); }
        }

        /* === TOGGLE === */
        .op-st-toggle {
            text-align: center;
            font-size: 10px;
            padding: 12px;
            cursor: pointer;
            color: #64748b;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            margin-top: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 700;
            transition: all 0.3s ease;
            position: relative;
            border-radius: 0 0 16px 16px;
            z-index: 1;
        }

        .op-st-toggle:hover {
            color: #a78bfa;
            text-shadow: 0 0 15px rgba(167, 139, 250, 0.5);
            background: rgba(167, 139, 250, 0.03);
        }

        /* === HUD TRENCH === */
        .op-st-hud-trench {
            display: flex;
            gap: 6px;
            margin-top: 12px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 12px;
            padding: 6px;
            box-shadow:
                inset 0 4px 15px rgba(0, 0, 0, 0.8),
                0 1px 0 rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(0, 0, 0, 0.8);
            position: relative;
            z-index: 1;
        }

        .hud-module {
            flex: 1;
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 8px 0 6px 0;
            background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%);
            border-radius: 8px;
            border-top: 2px solid var(--mod-color);
            overflow: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: default;
        }

        .hud-module::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 10px;
            background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
            pointer-events: none;
        }

        .hud-module:hover {
            transform: translateY(-2px);
            background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }

        .hud-mod-header {
            font-size: 8px;
            font-weight: 800;
            color: rgba(255, 255, 255, 0.6);
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 5px;
            z-index: 2;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }

        .hud-diamond {
            width: 4px;
            height: 4px;
            background: var(--mod-color);
            transform: rotate(45deg);
            box-shadow: 0 0 8px var(--mod-color), 0 0 2px #fff;
            animation: diamondPulse 2s infinite alternate;
        }

        .hud-mod-value {
            font-size: 20px;
            font-weight: 900;
            font-family: 'Courier New', monospace;
            color: #ffffff;
            margin-top: 4px;
            z-index: 2;
            text-shadow:
                0 0 15px var(--mod-color),
                0 2px 4px rgba(0,0,0,0.8);
            transition: all 0.3s ease;
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum";
        }

        .hud-module:hover .hud-mod-value {
            text-shadow:
                0 0 25px var(--mod-color),
                0 0 5px #fff;
            transform: scale(1.05);
        }

        .hud-mod-glow {
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80%;
            height: 20px;
            background: var(--mod-color);
            filter: blur(12px);
            opacity: 0.15;
            z-index: 1;
            transition: opacity 0.3s ease;
        }

        .hud-module:hover .hud-mod-glow {
            opacity: 0.35;
            animation: pulseGlow 1.5s infinite alternate;
        }

        .m-online { --mod-color: #10b981; }
        .m-busy   { --mod-color: #f59e0b; }
        .m-pause  { --mod-color: #ef4444; }

        @keyframes diamondPulse {
            0% { filter: brightness(1); transform: rotate(45deg) scale(1); }
            100% { filter: brightness(1.5); transform: rotate(45deg) scale(1.2); box-shadow: 0 0 12px var(--mod-color), 0 0 4px #fff; }
        }

        @keyframes pulseGlow {
            0% { opacity: 0.2; transform: translateX(-50%) scaleY(1); }
            100% { opacity: 0.4; transform: translateX(-50%) scaleY(1.5); }
        }

        /* === ALERT MODAL === */
        .op-st-alert-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(5, 5, 15, 0.9);
            backdrop-filter: blur(20px) saturate(1.5);
            -webkit-backdrop-filter: blur(20px) saturate(1.5);
            z-index: 10000000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: opFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .op-st-alert-modal {
            background:
                linear-gradient(135deg,
                    rgba(15, 15, 30, 0.95) 0%,
                    rgba(10, 10, 20, 0.98) 100%);
            border: 1px solid rgba(255, 42, 42, 0.3);
            border-radius: 24px;
            padding: 50px 40px;
            width: 480px;
            text-align: center;
            box-shadow:
                0 0 60px rgba(255, 42, 42, 0.15),
                0 20px 60px rgba(0, 0, 0, 0.6),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            animation:
                opPulseUltra 2.5s infinite,
                opFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            color: #e2e8f0;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }

        .op-st-alert-modal::before {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 2px;
            background: linear-gradient(90deg,
                transparent,
                #ff2a2a,
                #ff6b6b,
                #ff2a2a,
                transparent);
        }

        .op-st-alert-modal::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle at 50% 0%, rgba(255, 42, 42, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }

        .op-st-alert-icon {
            font-size: 56px;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 20px rgba(255,42,42,0.8));
            animation: opPulseIcon 2s infinite;
        }

        .op-st-alert-title {
            color: #ff2a2a;
            margin: 0 0 18px 0;
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(255,42,42,0.4);
        }

        .op-st-alert-text {
            color: #94a3b8;
            font-size: 16px;
            line-height: 1.7;
        }

        .op-st-alert-count {
            font-size: 36px;
            color: #ff2a2a;
            text-shadow: 0 0 20px rgba(255,42,42,0.5);
            display: block;
            margin: 15px 0;
            font-weight: 900;
        }

        .op-st-alert-sub {
            color: #cbd5e1;
        }

        .op-st-alert-btn {
            margin-top: 35px;
            padding: 14px 40px;
            background: transparent;
            border: 1px solid rgba(255, 42, 42, 0.5);
            border-radius: 12px;
            color: #ff6b6b;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow:
                0 0 15px rgba(255, 42, 42, 0.1),
                inset 0 0 15px rgba(255, 42, 42, 0.05);
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 13px;
            position: relative;
            overflow: hidden;
        }

        .op-st-alert-btn::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            transform: skewX(-20deg);
            animation: shimmer 2.5s infinite;
        }

        .op-st-alert-btn:hover {
            background: rgba(255, 42, 42, 0.15);
            color: #fff;
            border-color: #ff2a2a;
            box-shadow:
                0 0 30px rgba(255, 42, 42, 0.3),
                inset 0 0 20px rgba(255, 42, 42, 0.1);
            transform: translateY(-3px);
        }

        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 200%; }
        }

        @keyframes opPulseIcon {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(255,42,42,0.8)); }
            50% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(255,42,42,1)); }
        }

        @keyframes opPulseUltra {
            0% {
                box-shadow:
                    0 0 60px rgba(255, 42, 42, 0.15),
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    inset 0 0 20px rgba(255, 42, 42, 0.05);
            }
            50% {
                box-shadow:
                    0 0 80px rgba(255, 42, 42, 0.25),
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    inset 0 0 30px rgba(255, 42, 42, 0.1);
            }
            100% {
                box-shadow:
                    0 0 60px rgba(255, 42, 42, 0.15),
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    inset 0 0 20px rgba(255, 42, 42, 0.05);
            }
        }

        @keyframes opFadeIn {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* === SCROLLBAR === */
        .op-st-main-container::-webkit-scrollbar {
            width: 4px;
        }
        .op-st-main-container::-webkit-scrollbar-track {
            background: transparent;
        }
        .op-st-main-container::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 4px;
        }
        .op-st-main-container::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.5);
        }

        /* === ACCESSIBILITY === */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);
};

// === INIT ===================================================================
function initializeStartOperStatus() {
    injectOpStatusStyles();

    statusContainer.addEventListener('mousemove', (e) => {
        const row = e.target.closest('.op-st-row');
        if (!row) return;
        const rect = row.getBoundingClientRect();
        row.style.setProperty('--x', (e.clientX - rect.left) + 'px');
        row.style.setProperty('--y', (e.clientY - rect.top) + 'px');
    });

    const findSider = () => {
        if (siderCache && siderCache.isConnected) {
            if (!siderCache.contains(statusContainer)) siderCache.append(statusContainer);
            return true;
        }
        const sider = document.querySelector('.ant-layout-sider-children');
        if (sider) {
            siderCache = sider;
            if (!sider.contains(statusContainer)) sider.append(statusContainer);
            return true;
        }
        return false;
    };

    if (!findSider()) {
        const observer = new MutationObserver(() => {
            if (findSider()) observer.disconnect();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    operstatusleftbar();
    if (opStatusInterval) clearInterval(opStatusInterval);
    opStatusInterval = setInterval(operstatusleftbar, 8000);
}

initializeStartOperStatus();