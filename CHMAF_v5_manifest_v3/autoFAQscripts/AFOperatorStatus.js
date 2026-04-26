/**
 * Refactored AFOperatorStatus with Glassmorphism & Emergency Alerts
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
        .op-st-main-container {
            width: 195px; margin: 10px auto; padding: 10px;
            background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 14px; color: #eee;
            font-family: 'Segoe UI', system-ui, sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .op-st-queue-box {
            background: rgba(121, 37, 37, 0.7); border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px; padding: 6px; text-align: center; font-weight: bold;
            font-size: 14px; margin-bottom: 10px; text-shadow: 0 1px 2px rgba(0,0,0,0.6);
            color: bisque;
        }
        .op-st-row {
            display: flex; align-items: center; gap: 10px; padding: 5px 8px;
            margin: 3px 0; border-radius: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-size: 12px;
        }
        .op-st-row:hover { background: rgba(255,255,255,0.12); transform: translateX(4px); }
        .op-st-badge {
            min-width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
            border-radius: 50%; font-weight: 800; font-size: 11px; border: 1px solid rgba(0,0,0,0.2);
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .op-st-toggle {
            text-align: center; font-size: 11px; padding: 6px; cursor: pointer;
            color: #bbb; border-top: 1px solid rgba(255,255,255,0.08); margin-top: 8px;
            font-size: 14px;
            transition: color 0.2s;
        }
        .op-st-toggle:hover { color: #fff; }
        .op-st-stats-grid { display: grid; grid-template-columns: 1fr; gap: 4px; margin-top: 8px; font-size: 11px; }
        .op-st-stat-item { padding: 4px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }

        .op-st-alert-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); z-index: 10000000;
            display: flex; align-items: center; justify-content: center; animation: opFadeIn 0.4s ease;
        }
        .op-st-alert-modal {
            background: rgba(30, 32, 45, 0.95); border: 2px solid #ff3b3b; border-radius: 24px;
            padding: 35px; width: 420px; text-align: center; box-shadow: 0 0 50px rgba(255, 59, 59, 0.4);
            animation: opShake 0.6s ease-in-out; color: #fff;
        }
        .op-st-alert-btn {
            margin-top: 25px; padding: 14px 35px; background: #ff3b3b; border: none;
            border-radius: 12px; color: white; font-weight: 800; cursor: pointer;
            transition: all 0.2s; box-shadow: 0 4px 15px rgba(255, 59, 59, 0.3);
            text-transform: uppercase; letter-spacing: 1px;
        }
        .op-st-alert-btn:hover { transform: scale(1.05); background: #ff5252; box-shadow: 0 6px 20px rgba(255, 59, 59, 0.4); }
        @keyframes opShake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-12px); }
            30% { transform: translateX(12px); }
            45% { transform: translateX(-8px); }
            60% { transform: translateX(8px); }
        }
        @keyframes opFadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);
};

const showEmergencyQueueAlert = (count) => {
    notify("📢ВНИМАНИЕ, НЕРАСПРЕД!")
    const now = Date.now();
    if (now - lastAlertTime < 5 * 60 * 1000) return;

    // Удаляем старые алерты если они есть
    document.querySelectorAll('.op-st-alert-overlay').forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'op-st-alert-overlay';
    overlay.innerHTML = `
        <div class="op-st-alert-modal">
            <div style="font-size: 60px; margin-bottom: 20px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));">📢</div>
            <h2 style="color: #ff3b3b; margin: 0 0 15px 0; font-size: 24px; font-weight: 900;">НУЖНА ПОМОЩЬ!</h2>
            <p style="color: #e0e0e0; font-size: 17px; line-height: 1.5;">
                В основной очереди ТП <b style="font-size: 24px; color: #ff3b3b;">${count}</b> чатов!<br>
                Ребята не справляются, пора на подмогу 🚀
            </p>
            <button class="op-st-alert-btn" id="op-st-alert-close">Понял, выхожу!</button>
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
            } catch (e) { /* Cross-origin or other error */ }

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
    const statusMap = { Online: { bg: '#388e3c', c: '#fff' }, Busy: { bg: '#fbc02d', c: '#000' }, Pause: { bg: '#d32f2f', c: '#fff' } };
    return opstats.sort((a, b) => a.operator.status.localeCompare(b.operator.status))
        .map(item => {
            const op = item.operator;
            const theme = statusMap[op.status] || { bg: '#555', c: '#fff' };
            const isTpOs = op.fullName?.toUpperCase().includes('ТП ОС');
            return `<div class="op-st-row ${isTpOs ? 'tp-os-row' : ''}" name="operrow" value="${op.id}">
                        <span class="op-st-badge" style="background: ${theme.bg}; color: ${theme.c};">${item.aCnt || 0}</span>
                        <span style="opacity: ${op.status === 'Online' ? 1 : 0.7}">${op.fullName}</span>
                    </div>`;
        }).join('');
};

async function operstatusleftbar() {
    try {
        const key = await waitForOpSectionNew();
        // Если не нашли через iframe, пробуем найти по конфигу (вдруг переменная уже есть или DOM изменился)
        if (!key || !OP_GROUP_CONFIG[key]) {
            // Если мы вообще не в нужной секции, очищаем контейнер
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

        // ПРОВЕРКА АЛЕРТА: Если мы в ТП ОС и в основном ТП есть нераспред
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

        // HTML с текстом "Нераспред"
        statusContainer.innerHTML = `
            <div class="op-st-queue-box">
                ${(key === 'ТП' || key === 'ТП ОС')
                ? `🚧Нераспред <br> ТП:  ${tpQueue}${tpQueue > 10 ? ' ⚠️' : ''} | ТП ОС: ${tpOsQueue}`
                : `Очередь: ${currentQueue}`}
            </div>
            <div class="op-st-list">${renderOperatorRows(opstats)}</div>
            <div class="op-st-toggle" id="op-st-toggle-btn">
                ${hidesummary ? '🔽 Показать сводку' : '🔼 Скрыть сводку'}
            </div>
            <div id="op-st-stats-panel" class="op-st-stats-grid" style="display: ${hidesummary ? 'none' : 'grid'}">
                <div class="op-st-stat-item" style="background: rgba(56, 142, 60, 0.25)"><span>Онлайн</span> <b>${stats.online}</b></div>
                <div class="op-st-stat-item" style="background: rgba(251, 192, 45, 0.25); color: #fbc02d"><span>Заняты</span> <b>${stats.busy}</b></div>
                <div class="op-st-stat-item" style="background: rgba(211, 47, 47, 0.25)"><span>Перерыв</span> <b>${stats.pause}</b></div>
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
