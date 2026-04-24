/**
 * Refactored AlarmClock — Glassmorphism Edition
 * Unique prefix: alc-
 */

(function () {
    // Конфигурация будильников
    const ALARMS_CONFIG = [
        { id: 1, hourId: 'alc_h1', minId: 'alc_m1', btnId: 'alc_set1', dispId: 'alc_wait1', key: 'chronostamp' },
        { id: 2, hourId: 'alc_h2', minId: 'alc_m2', btnId: 'alc_set2', dispId: 'alc_wait2', key: 'chronostamp1' }
    ];

    const timeouts = {};

    // Стили
    const injectStyles = () => {
        if (document.getElementById('alc-styles')) return;
        const style = document.createElement('style');
        style.id = 'alc-styles';
        style.innerHTML = `
            .alc-panel {
                background: rgba(30, 32, 45, 0.7) !important;
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 16px;
                color: #e0e0e0;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                padding: 12px !important;
                width: 320px;
                z-index: 1000002;
            }
            .alc-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                cursor: grab;
            }
            .alc-current-time {
                font-family: monospace;
                font-size: 16px;
                background: rgba(255, 255, 255, 0.05);
                padding: 4px 10px;
                border-radius: 8px;
                color: #4facfe;
            }
            .alc-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            .alc-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 10px;
                text-align: center;
            }
            .alc-label {
                font-size: 11px;
                color: #aaa;
                text-transform: uppercase;
                margin-bottom: 8px;
                display: block;
            }
            .alc-input-group {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                margin-bottom: 8px;
            }
            .alc-input {
                width: 40px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                color: #fff;
                padding: 4px;
                text-align: center;
                font-size: 14px;
                outline: none;
            }
            .alc-input:focus { border-color: #4facfe; }
            .alc-btn {
                background: rgba(79, 172, 254, 0.2);
                border: 1px solid rgba(79, 172, 254, 0.3);
                color: #fff;
                width: 100%;
                padding: 5px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 12px;
            }
            .alc-btn:hover { background: rgba(79, 172, 254, 0.4); transform: translateY(-1px); }
            .alc-display {
                margin-top: 8px;
                font-family: monospace;
                font-size: 12px;
                color: #00f2fe;
                cursor: help;
                padding: 4px;
                border-radius: 4px;
                background: rgba(0, 0, 0, 0.2);
            }
            .alc-display.active {
                animation: alc-pulse 2s infinite;
                color: #00ff88;
            }
            @keyframes alc-pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    };

    // Вспомогательные функции
    const format = (v) => String(v).padStart(2, '0');

    const getRemaining = (targetTime) => {
        if (!targetTime) return "00 : 00 : 00";
        const diff = Math.max(0, targetTime - Date.now());
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${format(h)} : ${format(m)} : ${format(s)}`;
    };

    const updateUI = () => {
        const now = new Date();
        const clockEl = document.getElementById('alc_current');
        if (clockEl) clockEl.textContent =
            `${format(now.getHours())}:${format(now.getMinutes())}:${format(now.getSeconds())}`;

        ALARMS_CONFIG.forEach(cfg => {
            const stamp = localStorage.getItem(cfg.key);
            const disp = document.getElementById(cfg.dispId);
            if (disp) {
                disp.textContent = getRemaining(stamp);
                disp.classList.toggle('active', !!stamp);
            }
        });
    };

    const setOperatorBusy = () => {
        fetch("https://skyeng.autofaq.ai/api/reason8/operator/status", {
            method: "POST",
            headers: {
                "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ?
                    aftoken : ''
            },
            body: JSON.stringify({ command: "DO_SET_OPERATOR_STATUS", status: "Busy", source: "Operator" }),
            credentials: "include"
        });
        showCustomAlert("Время ставить занят! 🔔", 1);
    };

    const triggerAlarm = (cfg) => {
        setOperatorBusy();
        localStorage.removeItem(cfg.key);
        localStorage.removeItem(cfg.hourId);
        localStorage.removeItem(cfg.minId);
        document.getElementById(cfg.hourId).value = "";
        document.getElementById(cfg.minId).value = "";
        refreshGlobalReminderIcon();
    };

    const setAlarm = (cfg) => {
        const h = parseInt(document.getElementById(cfg.hourId).value);
        const m = parseInt(document.getElementById(cfg.minId).value);

        if (isNaN(h) || isNaN(m)) return showCustomAlert("Введите время!");

        const target = new Date();
        target.setHours(h, m, 0, 0);
        if (target <= new Date()) target.setDate(target.getDate() + 1);

        const stamp = target.getTime();
        localStorage.setItem(cfg.key, stamp);
        localStorage.setItem(cfg.hourId, h);
        localStorage.setItem(cfg.minId, m);

        if (timeouts[cfg.id]) clearTimeout(timeouts[cfg.id]);
        timeouts[cfg.id] = setTimeout(() => triggerAlarm(cfg), stamp - Date.now());

        showCustomAlert(`Будильник №${cfg.id} установлен на ${format(h)}:${format(m)}`);
        refreshGlobalReminderIcon();
    };

    const removeAlarm = (cfg) => {
        clearTimeout(timeouts[cfg.id]);
        localStorage.removeItem(cfg.key);
        localStorage.removeItem(cfg.hourId);
        localStorage.removeItem(cfg.minId);
        document.getElementById(cfg.hourId).value = "";
        document.getElementById(cfg.minId).value = "";
        showCustomAlert(`Будильник №${cfg.id} удален`);
        refreshGlobalReminderIcon();
    };

    const refreshGlobalReminderIcon = () => {
        const active = ALARMS_CONFIG.some(cfg => localStorage.getItem(cfg.key));
        const icon = document.getElementById('reminderstatus');
        if (icon) icon.textContent = active ? "🔔" : "🔕";
    };

    // HTML контент
    const win_Alarm = `
        <div class="alc-panel">
            <div class="alc-header" id="alc_drag">
                <span style="font-weight: 600;">⏰ Будильники</span>
                <div id="alc_current" class="alc-current-time">00:00:00</div>
                <button id="hideMeAlarm" class="alc-btn" style="width: auto; padding: 2px 8px;">hide</button>
            </div>
            <div class="alc-grid">
                ${ALARMS_CONFIG.map(cfg => `
                    <div class="alc-card">
                        <span class="alc-label">Будильник №${cfg.id}</span>
                        <div class="alc-input-group">
                            <input id="${cfg.hourId}" class="alc-input" type="number" placeholder="HH" min="0"
       max="23">
                            <span style="opacity: 0.5;">:</span>
                            <input id="${cfg.minId}" class="alc-input" type="number" placeholder="MM" min="0"
       max="59">
                        </div>
                        <button id="${cfg.btnId}" class="alc-btn">Установить</button>
                        <div id="${cfg.dispId}" class="alc-display" title="Двойной клик для удаления">00 : 00 :
       00</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // Инициализация
    injectStyles();
    createWindow('AF_AlarmClock', 'winTopAlarmclock', 'winLeftAlarmclock', win_Alarm);
    hideWindowOnDoubleClick('AF_AlarmClock');

    // Навешивание событий
    ALARMS_CONFIG.forEach(cfg => {
        document.getElementById(cfg.btnId).onclick = () => setAlarm(cfg);
        document.getElementById(cfg.dispId).ondblclick = () => removeAlarm(cfg);

        // Восстановление
        const savedH = localStorage.getItem(cfg.hourId);
        const savedM = localStorage.getItem(cfg.minId);
        if (savedH !== null) document.getElementById(cfg.hourId).value = format(savedH);
        if (savedM !== null) document.getElementById(cfg.minId).value = format(savedM);

        const stamp = localStorage.getItem(cfg.key);
        if (stamp) {
            const timeLeft = stamp - Date.now();
            if (timeLeft > 0) {
                timeouts[cfg.id] = setTimeout(() => triggerAlarm(cfg), timeLeft);
            } else {
                localStorage.removeItem(cfg.key);
            }
        }
    });

    document.getElementById('hideMeAlarm').onclick = () => {
        document.getElementById('AF_AlarmClock').style.display = 'none';
    };

    // Глобальная кнопка в меню
    const menuBtn = document.getElementById('reminderstatus');
    if (menuBtn) {
        menuBtn.onclick = () => {
            const win = document.getElementById('AF_AlarmClock');
            win.style.display = win.style.display === 'none' ? 'block' : 'none';
        };
    }

    // Единый цикл обновлений
    setInterval(updateUI, 1000);
    refreshGlobalReminderIcon();

})();
