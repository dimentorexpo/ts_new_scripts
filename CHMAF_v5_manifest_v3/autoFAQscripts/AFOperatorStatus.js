/**
 * Refactored AFOperatorStatus with Cyber-Dark UI (Sleek Dark Mode) & Emergency Alerts
 * Filename: refactor.js
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
        queueBy: 'kb',
        queueIds: ['121527'],
        groupIdFilter: '68932fae-b9f9-6b37-2a52-911b2b6b4f6d'
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
        /* === CYBER-DARK MAIN CONTAINER === */
        .op-st-main-container {
            width: 200px; margin: 10px auto; padding: 12px;
            background: #0b0c10;
            border: 1px solid #1f2029;
            border-radius: 12px; color: #c5c6c7;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            box-shadow: 0 8px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
            position: relative; overflow: hidden;
        }
        /* Top glowing accent line */
        .op-st-main-container::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
            background: linear-gradient(90deg, transparent, #4ade80, transparent);
            opacity: 0.6;
        }

        /* === QUEUE BOX === */
        .op-st-queue-box {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 8px; padding: 8px; text-align: center; font-weight: 600;
            font-size: 13px; margin-bottom: 12px; letter-spacing: 0.5px;
            color: #ff6b6b; box-shadow: inset 0 0 12px rgba(239,68,68,0.05);
            text-shadow: 0 0 8px rgba(255,107,107,0.4);
        }

        /* === OPERATOR ROWS === */
        .op-st-row {
            display: flex; align-items: center; gap: 10px; padding: 6px 8px;
            margin: 4px 0; border-radius: 6px; cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); font-size: 12px;
            background: transparent; border: 1px solid transparent; border-left: 2px solid transparent;
        }
        .op-st-row:hover {
            background: #14151c; border-color: #2a2b36;
            transform: translateX(4px); box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            color: #fff;
        }

        /* Выделение для ТП ОС (Cyber-Cyan) */
        .op-st-row.tp-os-row {
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.1) 0%, transparent 100%);
            border-left: 2px solid #06b6d4;
        }
        .op-st-row.tp-os-row:hover {
            background: linear-gradient(90deg, rgba(6, 182, 212, 0.2) 0%, transparent 100%);
            border-left-color: #22d3ee;
        }

        /* Улучшенные четкие бейджи */
        .op-st-badge {
            min-width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
            border-radius: 4px; font-weight: 800; font-size: 13px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.5); letter-spacing: 0.5px;
        }

        /* === TOGGLE BUTTON & STATS === */
        .op-st-toggle {
            text-align: center; font-size: 10px; padding: 8px; cursor: pointer;
            color: #6c757d; border-top: 1px dashed #1f2029; margin-top: 10px;
            text-transform: uppercase; letter-spacing: 1px; font-weight: 600;
            transition: color 0.2s, text-shadow 0.2s;
        }
        .op-st-toggle:hover { color: #4ade80; text-shadow: 0 0 8px rgba(74, 222, 128, 0.4); }
        .op-st-stats-grid { display: grid; grid-template-columns: 1fr; gap: 6px; margin-top: 10px; font-size: 11px; }
        .op-st-stat-item {
            padding: 6px 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;
            font-weight: 500; letter-spacing: 0.5px; background: #121319;
        }
        .op-st-stat-item b { font-size: 13px; font-weight: 700; }

        /* === CYBER-DARK ALERT MODAL === */
        .op-st-alert-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(5, 5, 8, 0.85); backdrop-filter: blur(10px); z-index: 10000000;
            display: flex; align-items: center; justify-content: center; animation: opFadeIn 0.3s ease;
        }
        .op-st-alert-modal {
            background: #0d0d12; border: 1px solid #ff2a2a; border-radius: 16px;
            padding: 40px; width: 440px; text-align: center;
            box-shadow: 0 0 40px rgba(255, 42, 42, 0.15), inset 0 0 20px rgba(255, 42, 42, 0.05);
            animation: opPulse 2s infinite, opFadeIn 0.4s ease-out; color: #e2e8f0;
            position: relative; overflow: hidden;
        }
        .op-st-alert-modal::before {
            content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
            background: linear-gradient(90deg, transparent, #ff2a2a, transparent);
        }
        .op-st-alert-btn {
            margin-top: 30px; padding: 12px 30px; background: transparent; border: 1px solid #ff2a2a;
            border-radius: 6px; color: #ff2a2a; font-weight: 700; cursor: pointer;
            transition: all 0.2s; box-shadow: 0 0 10px rgba(255, 42, 42, 0.1);
            text-transform: uppercase; letter-spacing: 1.5px; font-size: 13px;
        }
        .op-st-alert-btn:hover {
            background: #ff2a2a; color: #fff; box-shadow: 0 0 20px rgba(255, 42, 42, 0.4);
            transform: translateY(-2px);
        }
        @keyframes opPulse {
            0% { box-shadow: 0 0 40px rgba(255, 42, 42, 0.15), inset 0 0 20px rgba(255, 42, 42, 0.05); }
            50% { box-shadow: 0 0 50px rgba(255, 42, 42, 0.25), inset 0 0 30px rgba(255, 42, 42, 0.1); }
            100% { box-shadow: 0 0 40px rgba(255, 42, 42, 0.15), inset 0 0 20px rgba(255, 42, 42, 0.05); }
        }
        @keyframes opFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
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
            <div style="font-size: 50px; margin-bottom: 15px; filter: drop-shadow(0 0 15px rgba(255,42,42,0.6));">⚠️</div>
            <h2 style="color: #ff2a2a; margin: 0 0 15px 0; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Системная тревога</h2>
            <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                В основной очереди ТП критическая нагрузка: <br>
                <b style="font-size: 28px; color: #ff2a2a; text-shadow: 0 0 10px rgba(255,42,42,0.4); display: block; margin: 10px 0;">${count} чатов</b>
                Требуется немедленное подключение! 🚀
            </p>
            <button class="op-st-alert-btn" id="op-st-alert-close">Принято, выхожу</button>
        </div>`;
    document.body.appendChild(overlay);

    try {
        const alertAudio = new Audio('https://grumstv.github.io/Sounds/alert.mp3');
        alertAudio.volume = 0.6;
        alertAudio.play().catch(e => console.log('Audio play blocked or failed'));
    } catch (e) { }

    document.getElementById('op-st-alert-close').onclick = () => {
        lastAlertTime = Date.now();
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        setTimeout(() => overlay.remove(), 300);
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

const renderOperatorRows = (opstats) => {
    // Cyber-Dark Status Theme Map: Идеальная четкость с белым текстом и неоновым свечением
    const statusMap = {
        Online: { bg: 'rgba(16, 185, 129, 0.15)', glow: '#10b981', b: '#059669' },
        Busy: { bg: 'rgba(245, 158, 11, 0.15)', glow: '#f59e0b', b: '#d97706' },
        Pause: { bg: 'rgba(239, 68, 68, 0.15)', glow: '#ef4444', b: '#dc2626' }
    };

    return opstats.sort((a, b) => a.operator.status.localeCompare(b.operator.status))
        .map(item => {
            const op = item.operator;
            const theme = statusMap[op.status] || { bg: 'rgba(100,100,100,0.15)', glow: '#aaa', b: '#555' };

            // Логика выделения ТП ОС
            const isTpOs = op.fullName?.toUpperCase().includes('ТП ОС');

            // Цвет имени: если ТП ОС, то неоновый голубой, иначе стандартный светлый/серый
            let opColor = op.status === 'Online' ? '#e2e8f0' : '#94a3b8';
            if (isTpOs) {
                opColor = op.status === 'Online' ? '#22d3ee' : '#0891b2';
            }

            return `<div class="op-st-row ${isTpOs ? 'tp-os-row' : ''}" name="operrow" value="${op.id}">
                        <span class="op-st-badge" style="background: ${theme.bg}; color: #12b52f; border: 1px solid ${theme.b}; text-shadow: 0 0 6px ${theme.glow};">
                            ${item.aCnt || 0}
                        </span>
                        <span style="opacity: ${op.status === 'Online' ? 1 : 0.7}; color: ${opColor}; font-weight: ${isTpOs ? '500' : 'normal'};">
                            ${op.fullName}
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
                ? `🚧 ОЧЕРЕДЬ <br> ТП:  <span style="color: ${tpQueue > 10 ? '#ff2a2a' : '#fca5a5'}; font-size: 14px;">${tpQueue}${tpQueue > 10 ? ' ⚠️' : ''}</span> | ТП ОС: ${tpOsQueue}`
                : `Очередь: ${currentQueue}`}
            </div>
            <div class="op-st-list">${renderOperatorRows(opstats)}</div>
            <div class="op-st-toggle" id="op-st-toggle-btn">
                ${hidesummary ? '🔽 Сводка' : '🔼 Скрыть'}
            </div>
            <div id="op-st-stats-panel" class="op-st-stats-grid" style="display: ${hidesummary ? 'none' : 'grid'}">
                <div class="op-st-stat-item" style="border-left: 2px solid #10b981;">
                    <span style="color: #94a3b8">Онлайн</span> <b style="color: #10b981; text-shadow: 0 0 8px rgba(16,185,129,0.3)">${stats.online}</b>
                </div>
                <div class="op-st-stat-item" style="border-left: 2px solid #f59e0b;">
                    <span style="color: #94a3b8">Заняты</span> <b style="color: #f59e0b; text-shadow: 0 0 8px rgba(245,158,11,0.3)">${stats.busy}</b>
                </div>
                <div class="op-st-stat-item" style="border-left: 2px solid #ef4444;">
                    <span style="color: #94a3b8">Перерыв</span> <b style="color: #ef4444; text-shadow: 0 0 8px rgba(239,68,68,0.3)">${stats.pause}</b>
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