/**
 * NEON GLASS ULTRA — Premium Cyber-Dark UI
 * Refactored AFOperatorStatus with advanced glassmorphism, neon glows, and premium aesthetics
 * Filename: refactor-neon-glass.js
 */

let opStatusInterval;
let lastAlertTime = 0;
const statusContainer = document.createElement('div');
statusContainer.id = 'idforpeopstatus';
statusContainer.className = 'op-st-main-container';

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
        queueBy: 'groupId',      // ← меняем на groupId
        queueIds: ['68932fae-b9f9-6b37-2a52-911b2b6b4f6d'],  // ← сюда groupId
        // groupIdFilter больше не нужен
    },
    'Teachers Care': {
        operatorMatch: /Teachers Care\D/,
        sumAllUnassigned: true
    }
};


const injectOpStatusStyles = () => {
    if (document.getElementById('op-status-styles')) return;
    const style = document.createElement('style');
    style.id = 'op-status-styles';
    style.innerHTML = `
        /* === NEON GLASS ULTRA — MAIN CONTAINER === */
        .op-st-main-container {
            width: 200px;
            margin: 12px auto;
            padding: 16px;
            background:
                linear-gradient(135deg, rgba(10, 10, 25, 0.85) 0%, rgba(5, 5, 15, 0.9) 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23181830' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            color: #e2e8f0;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            box-shadow:
                0 0 0 1px rgba(0, 0, 0, 0.5),
                0 20px 50px rgba(0, 0, 0, 0.7),
                0 0 30px rgba(139, 92, 246, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(20px) saturate(1.2);
            -webkit-backdrop-filter: blur(20px) saturate(1.2);
        }

        /* Animated gradient border top */
        .op-st-main-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: -50%;
            right: -50%;
            height: 2px;
            background: linear-gradient(90deg,
                transparent 0%,
                #8b5cf6 20%,
                #ec4899 40%,
                #06b6d4 60%,
                #8b5cf6 80%,
                transparent 100%);
            background-size: 200% 100%;
            animation: neonBorderFlow 3s linear infinite;
            opacity: 0.8;
        }

        /* Subtle inner glow */
        .op-st-main-container::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }

        @keyframes neonBorderFlow {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
        }

        /* === ULTRA GLASS QUEUE BOX === */
        .op-st-queue-box {
            position: relative;
            background:
                linear-gradient(135deg,
                    rgba(239, 68, 68, 0.08) 0%,
                    rgba(236, 72, 153, 0.04) 50%,
                    rgba(239, 68, 68, 0.02) 100%);
            border: 1px solid rgba(239, 68, 68, 0.15);
            border-radius: 16px;
            padding: 14px 10px;
            text-align: center;
            font-weight: 700;
            font-size: 12px;
            margin-bottom: 16px;
            letter-spacing: 1px;
            color: #fca5a5;
            box-shadow:
                inset 0 0 20px rgba(239, 68, 68, 0.05),
                0 4px 15px rgba(0, 0, 0, 0.3);
            text-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
            overflow: hidden;
            z-index: 1;
        }

        .op-st-queue-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg,
                rgba(255, 255, 255, 0.05) 0%,
                transparent 50%,
                rgba(255, 255, 255, 0.02) 100%);
            border-radius: 16px;
            pointer-events: none;
        }

        /* === NEON GLASS OPERATOR ROWS === */
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
    vertical-align:middle;
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

        /* === ULTRA BADGES === */
/* === PREMIUM BADGES === */
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

    /* Многослойный премиум-эффект */
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

/* Внутренний блик стекла */
.op-st-badge::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(180deg,
        rgba(255,255,255,0.15) 0%,
        rgba(255,255,255,0) 100%);
    border-radius: 8px 8px 0 0;
    pointer-events: none;
}

/* Нижнее свечение */
.op-st-badge::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 15%;
    right: 15%;
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

        /* === TOGGLE BUTTON — NEON GLASS === */
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

        /* === STATS GRID — GLASS PANELS === */
        .op-st-stats-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            margin-top: 12px;
            font-size: 11px;
            z-index: 1;
            position: relative;
        }

        .op-st-stat-item {
            padding: 10px 14px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            letter-spacing: 0.5px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow:
                0 2px 10px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.03);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .op-st-stat-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 3px;
            border-radius: 12px 0 0 12px;
        }

        .op-st-stat-item:hover {
            background: rgba(255, 255, 255, 0.06);
            transform: translateX(4px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .op-st-stat-item b {
            font-size: 14px;
            font-weight: 800;
        }

        /* === NEON GLASS ALERT MODAL === */
        .op-st-alert-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
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
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(90deg,
                transparent,
                #ff2a2a,
                #ff6b6b,
                #ff2a2a,
                transparent);
            background-size: 200% 100%;
            animation: neonBorderFlow 2s linear infinite;
        }

        .op-st-alert-modal::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 50% 0%, rgba(255, 42, 42, 0.1) 0%, transparent 50%);
            pointer-events: none;
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
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s ease;
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

        .op-st-alert-btn:hover::before {
            left: 100%;
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

        /* === SCROLLBAR STYLING === */
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
    `;
    document.head.appendChild(style);
};

const showEmergencyQueueAlert = (count) => {
    const now = Date.now();
    if (now - lastAlertTime < 5 * 60 * 1000) return;

    document.querySelectorAll('.op-st-alert-overlay').forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'op-st-alert-overlay';
    overlay.innerHTML = `
        <div class="op-st-alert-modal">
            <div style="font-size: 56px; margin-bottom: 20px; filter: drop-shadow(0 0 20px rgba(255,42,42,0.8)); animation: opPulseIcon 2s infinite;">⚠️</div>
            <h2 style="color: #ff2a2a; margin: 0 0 18px 0; font-size: 26px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 20px rgba(255,42,42,0.4);">Системная тревога</h2>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.7;">
                В основной очереди ТП критическая нагрузка: <br>
                <b style="font-size: 36px; color: #ff2a2a; text-shadow: 0 0 20px rgba(255,42,42,0.5); display: block; margin: 15px 0; font-weight: 900;">${count} чатов</b>
                <span style="color: #cbd5e1;">Требуется немедленное подключение! 🚀</span>
            </p>
            <button class="op-st-alert-btn" id="op-st-alert-close">Принято, выхожу</button>
        </div>`;
    document.body.appendChild(overlay);

    // Add icon pulse animation
    const iconStyle = document.createElement('style');
    iconStyle.innerHTML = `
        @keyframes opPulseIcon {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(255,42,42,0.8)); }
            50% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(255,42,42,1)); }
        }
    `;
    document.head.appendChild(iconStyle);

    try {
        const alertAudio = new Audio('https://grumstv.github.io/Sounds/alert.mp3');
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
    // ТП ОС оставляем как есть
    if (fullName.startsWith('ТП ОС-')) return fullName;
    // Убираем префиксы: ТП-, Prem-, КЦ-, Teachers Care-
    return fullName.replace(/^(ТП|Prem|КЦ|Teachers Care)-/, '');
};

const renderOperatorRows = (opstats) => {
    const merged = new Map();
    opstats.forEach(item => {
        const id = item.operator.id;
        if (merged.has(id)) {
            const existing = merged.get(id);
            existing.aCnt = (existing.aCnt || 0) + (item.aCnt || 0);
            existing.cCnt = (existing.cCnt || 0) + (item.cCnt || 0);  // ← добавили
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
            const currentCount = (item.aCnt || 0) + (item.cCnt || 0);  // ← сумма обоих

            const existingBadge = document.querySelector(`.op-st-row[value="${op.id}"] .op-st-badge`);
            let pulseClass = '';
            if (existingBadge) {
                const prevCount = parseInt(existingBadge.dataset.count || '0');
                if (currentCount > prevCount) pulseClass = 'pulse-up';
                else if (currentCount < prevCount) pulseClass = 'pulse-down';
            }

            let opColor = op.status === 'Online' ? '#e2e8f0' : '#94a3b8';
            if (isTpOs) {
                opColor = op.status === 'Online' ? '#22d3ee' : '#0891b2';
            }

            const displayName = cleanOperatorName(op.fullName);

            return `<div class="op-st-row ${isTpOs ? 'tp-os-row' : ''}" name="operrow" value="${op.id}">
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

        const stats = {
            online: opstats.filter(o => o.operator.status === 'Online').length,
            busy: opstats.filter(o => o.operator.status === 'Busy').length,
            pause: opstats.filter(o => o.operator.status === 'Pause').length
        };

        const hidesummary = localStorage.getItem('hidesummaryflag') === '1';

        statusContainer.innerHTML = `
            <div class="op-st-queue-box">
                ${(key === 'ТП' || key === 'ТП ОС')
                ? `🚧 ОЧЕРЕДЬ <br> ТП:  <span style="color: ${tpQueue > 10 ? '#ff2a2a' : '#fca5a5'}; font-size: 16px; font-weight: 900; text-shadow: 0 0 10px ${tpQueue > 10 ? 'rgba(255,42,42,0.5)' : 'rgba(252,165,165,0.3)'}">${tpQueue}${tpQueue > 10 ? ' ⚠️' : ''}</span> | ТП ОС: ${tpOsQueue}`
                : `Очередь: ${currentQueue}`}
            </div>
            <div class="op-st-list">${renderOperatorRows(opstats)}</div>
            <div class="op-st-toggle" id="op-st-toggle-btn">
                ${hidesummary ? '🔽 Сводка' : '🔼 Скрыть'}
            </div>
            <div id="op-st-stats-panel" class="op-st-stats-grid" style="display: ${hidesummary ? 'none' : 'grid'}">
                <div class="op-st-stat-item" style="border-left: 3px solid #10b981;">
                    <span style="color: #94a3b8">Онлайн</span>
                    <b style="color: #10b981; text-shadow: 0 0 10px rgba(16,185,129,0.4)">${stats.online}</b>
                </div>
                <div class="op-st-stat-item" style="border-left: 3px solid #f59e0b;">
                    <span style="color: #94a3b8">Заняты</span>
                    <b style="color: #f59e0b; text-shadow: 0 0 10px rgba(245,158,11,0.4)">${stats.busy}</b>
                </div>
                <div class="op-st-stat-item" style="border-left: 3px solid #ef4444;">
                    <span style="color: #94a3b8">Перерыв</span>
                    <b style="color: #ef4444; text-shadow: 0 0 10px rgba(239,68,68,0.4)">${stats.pause}</b>
                </div>
            </div>
        `;

        attachOpHandlers();
    } catch (e) { console.error('OpStatus Error:', e); }
}

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
                    select.value = this.getAttribute('value');
                    select.dispatchEvent(new Event('change'));
                    if (typeof findchatsoper === 'function') findchatsoper();
                }
            }, 800);
        };
    });
}

function initializeStartOperStatus() {
    injectOpStatusStyles();
    const findSider = () => {
        const sider = document.querySelector('.ant-layout-sider-children');
        if (sider) {
            if (!sider.contains(statusContainer)) sider.append(statusContainer);
            operstatusleftbar();
            if (opStatusInterval) clearInterval(opStatusInterval);
            opStatusInterval = setInterval(operstatusleftbar, 8000);
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
}

initializeStartOperStatus();