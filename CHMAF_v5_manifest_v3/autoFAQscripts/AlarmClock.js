/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS ALARM — Premium Edition v2.0                      ║
 * ║         Glassmorphism · Neumorphism · Micro-interactions · Zero Bugs         ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * Unique prefix: alc-
 * Dependencies: createWindow, hideWindowOnDoubleClick, showCustomAlert (external)
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    //  CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════

    const ALARMS_CONFIG = [
        {
            id: 1,
            hourId: 'alc_h1',
            minId: 'alc_m1',
            btnId: 'alc_set1',
            dispId: 'alc_wait1',
            key: 'chronostamp',
            lsHourKey: 'alc_ls_h1',
            lsMinKey: 'alc_ls_m1'
        },
        {
            id: 2,
            hourId: 'alc_h2',
            minId: 'alc_m2',
            btnId: 'alc_set2',
            dispId: 'alc_wait2',
            key: 'chronostamp1',
            lsHourKey: 'alc_ls_h2',
            lsMinKey: 'alc_ls_m2'
        }
    ];

    const timeouts = {};
    let updateInterval = null;
    let isInitialized = false;

    // ═══════════════════════════════════════════════════════════════════════════
    //  STYLE SYSTEM — Premium Glassmorphism
    // ═══════════════════════════════════════════════════════════════════════════

    const injectStyles = () => {
        if (document.getElementById('alc-styles')) return;

        const style = document.createElement('style');
        style.id = 'alc-styles';
        style.innerHTML = `
            /* ─── Base Panel ─── */
            .alc-panel {
                background: linear-gradient(135deg,
                    rgba(25, 28, 40, 0.85) 0%,
                    rgba(35, 38, 55, 0.9) 50%,
                    rgba(25, 28, 40, 0.85) 100%) !important;
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 24px;
                color: #e8eaf6;
                font-family: 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
                box-shadow:
                    0 25px 50px -12px rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                    0 1px 0 rgba(255, 255, 255, 0.1) inset;
                padding: 24px !important;
                width: 440px;
                z-index: 1000002;
                position: relative;
                overflow: hidden;
            }

            .alc-panel::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(79, 172, 254, 0.5) 50%,
                    transparent 100%);
            }

            /* ─── Header ─── */
            .alc-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                cursor: grab;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                position: relative;
            }

            .alc-header:active { cursor: grabbing; }

            .alc-title {
                font-weight: 700;
                font-size: 18px;
                letter-spacing: -0.5px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .alc-title-icon {
                font-size: 22px;
                filter: drop-shadow(0 0 8px rgba(79, 172, 254, 0.4));
                -webkit-text-fill-color: initial;
            }

            .alc-current-time {
                font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
                font-size: 20px;
                font-weight: 600;
                background: rgba(0, 0, 0, 0.3);
                padding: 8px 16px;
                border-radius: 12px;
                color: #4facfe;
                border: 1px solid rgba(79, 172, 254, 0.15);
                box-shadow:
                    0 0 20px rgba(79, 172, 254, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
                letter-spacing: 1px;
                min-width: 100px;
                text-align: center;
            }

            .alc-hide-btn {
                background: rgba(255, 255, 255, 0.05) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                color: #8892b0 !important;
                width: auto !important;
                padding: 6px 14px !important;
                border-radius: 10px !important;
                font-size: 12px !important;
                font-weight: 500;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                cursor: pointer;
            }

            .alc-hide-btn:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                color: #fff !important;
                transform: translateY(-1px);
            }

            /* ─── Grid ─── */
            .alc-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
            }

            /* ─── Alarm Cards ─── */
            .alc-card {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 20px;
                padding: 20px;
                text-align: center;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
                overflow: hidden;
            }

            .alc-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, rgba(79, 172, 254, 0.3), transparent);
                opacity: 0;
                transition: opacity 0.3s;
            }

            .alc-card:hover {
                background: rgba(255, 255, 255, 0.04);
                border-color: rgba(79, 172, 254, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }

            .alc-card:hover::before { opacity: 1; }

            .alc-card.active {
                background: rgba(79, 172, 254, 0.05);
                border-color: rgba(79, 172, 254, 0.25);
                box-shadow:
                    0 0 30px rgba(79, 172, 254, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }

            .alc-card.active::before {
                opacity: 1;
                background: linear-gradient(90deg, transparent, rgba(0, 242, 254, 0.5), transparent);
            }

            .alc-label {
                font-size: 12px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin-bottom: 14px;
                display: block;
                font-weight: 600;
            }

            /* ─── Input Group ─── */
            .alc-input-group {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin-bottom: 14px;
            }

            .alc-input {
                width: 64px;
                height: 52px;
                background: rgba(0, 0, 0, 0.35);
                border: 2px solid rgba(255, 255, 255, 0.08);
                border-radius: 14px;
                color: #fff;
                padding: 4px;
                text-align: center;
                font-size: 22px;
                font-weight: 600;
                font-family: 'SF Mono', monospace;
                outline: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                -moz-appearance: textfield;
            }

            .alc-input::-webkit-outer-spin-button,
            .alc-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            .alc-input::placeholder {
                color: rgba(255, 255, 255, 0.15);
                font-weight: 400;
            }

            .alc-input:focus {
                border-color: #4facfe;
                background: rgba(0, 0, 0, 0.45);
                box-shadow:
                    0 0 0 4px rgba(79, 172, 254, 0.1),
                    0 0 20px rgba(79, 172, 254, 0.15);
            }

            .alc-input.valid {
                border-color: rgba(0, 242, 150, 0.4);
                background: rgba(0, 242, 150, 0.05);
            }

            .alc-input.error {
                border-color: rgba(255, 80, 80, 0.5);
                animation: alc-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
            }

            .alc-separator {
                font-size: 24px;
                color: rgba(255, 255, 255, 0.2);
                font-weight: 300;
                user-select: none;
            }

            /* ─── Buttons ─── */
            .alc-btn {
                background: linear-gradient(135deg, rgba(79, 172, 254, 0.15) 0%, rgba(0, 242, 254, 0.1) 100%);
                border: 1px solid rgba(79, 172, 254, 0.25);
                color: #e0f2fe;
                width: 100%;
                padding: 12px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 13px;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                position: relative;
                overflow: hidden;
            }

            .alc-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.5s;
            }

            .alc-btn:hover {
                background: linear-gradient(135deg, rgba(79, 172, 254, 0.25) 0%, rgba(0, 242, 254, 0.2) 100%);
                border-color: rgba(79, 172, 254, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(79, 172, 254, 0.2);
            }

            .alc-btn:hover::before { left: 100%; }

            .alc-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 10px rgba(79, 172, 254, 0.1);
            }

            .alc-btn.set {
                background: linear-gradient(135deg, rgba(0, 242, 150, 0.15) 0%, rgba(0, 200, 120, 0.1) 100%);
                border-color: rgba(0, 242, 150, 0.3);
                color: #a7f3d0;
            }

            .alc-btn.set:hover {
                background: linear-gradient(135deg, rgba(0, 242, 150, 0.25) 0%, rgba(0, 200, 120, 0.2) 100%);
                border-color: rgba(0, 242, 150, 0.5);
                box-shadow: 0 8px 25px rgba(0, 242, 150, 0.15);
            }

            /* ─── Display / Countdown ─── */
            .alc-display {
                margin-top: 14px;
                font-family: 'SF Mono', 'Fira Code', monospace;
                font-size: 18px;
                color: #94a3b8;
                cursor: help;
                padding: 10px 8px;
                border-radius: 10px;
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid rgba(255, 255, 255, 0.04);
                transition: all 0.3s;
                letter-spacing: 0;
                font-weight: 600;
                user-select: none;
                display: flex;
                align-items: baseline;
                justify-content: center;
                gap: 3px;
                flex-wrap: nowrap;
                white-space: nowrap;
                overflow: hidden;
            }

            .alc-display:hover {
                background: rgba(0, 0, 0, 0.35);
                border-color: rgba(255, 255, 255, 0.08);
            }

            .alc-display.active {
                color: #00f2fe;
                background: rgba(0, 242, 254, 0.08);
                border-color: rgba(0, 242, 254, 0.15);
                animation: alc-pulse 2s ease-in-out infinite;
            }

            .alc-display .alc-unit {
                font-size: 9px;
                color: #64748b;
                margin-left: 1px;
                text-transform: lowercase;
                font-weight: 500;
            }

            .alc-display .alc-sep {
                color: rgba(255, 255, 255, 0.15);
                margin: 0 1px;
                font-weight: 300;
            }

            /* ─── Animations ─── */
            @keyframes alc-pulse {
                0%, 100% {
                    opacity: 1;
                    box-shadow: 0 0 0 0 rgba(0, 242, 254, 0.2);
                }
                50% {
                    opacity: 0.85;
                    box-shadow: 0 0 20px 4px rgba(0, 242, 254, 0.1);
                }
            }

            @keyframes alc-shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
                40%, 60% { transform: translate3d(3px, 0, 0); }
            }

            @keyframes alc-slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .alc-panel {
                animation: alc-slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }

            /* ─── Tooltip hint ─── */
            .alc-hint {
                font-size: 10px;
                color: #475569;
                margin-top: 6px;
                opacity: 0;
                transition: opacity 0.3s;
            }

            .alc-card:hover .alc-hint { opacity: 1; }
        `;
        document.head.appendChild(style);
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    const format = (v) => String(Number(v)).padStart(2, '0');

    const safeParseInt = (val) => {
        const n = parseInt(val, 10);
        return isNaN(n) ? null : n;
    };

    const getRemaining = (targetTime) => {
        if (!targetTime) return null;
        const diff = Math.max(0, targetTime - Date.now());
        if (diff === 0) return null;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return { h, m, s, diff };
    };

    const formatRemaining = (remaining) => {
        if (!remaining) return '00 : 00 : 00';
        return `${format(remaining.h)} : ${format(remaining.m)} : ${format(remaining.s)}`;
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  SAFE EXTERNAL DEPENDENCIES
    // ═══════════════════════════════════════════════════════════════════════════

    const safeShowAlert = (msg, type = 0) => {
        if (typeof showCustomAlert === 'function') {
            try { showCustomAlert(msg, type); } catch (e) { console.warn('Alert error:', e); }
        } else {
            console.log('[AlarmClock]', msg);
        }
    };

    const safeCreateWindow = (...args) => {
        if (typeof createWindow === 'function') {
            try { return createWindow(...args); } catch (e) { console.warn('createWindow error:', e); }
        }
        return null;
    };

    const safeHideWindow = (...args) => {
        if (typeof hideWindowOnDoubleClick === 'function') {
            try { hideWindowOnDoubleClick(...args); } catch (e) { console.warn('hideWindow error:', e); }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    const setOperatorBusy = () => {
        const token = typeof aftoken !== 'undefined' ? aftoken : '';
        fetch("https://skyeng.autofaq.ai/api/reason8/operator/status", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-csrf-token": token
            },
            body: JSON.stringify({
                command: "DO_SET_OPERATOR_STATUS",
                status: "Busy",
                source: "Operator"
            }),
            credentials: "include"
        }).catch(err => console.warn('Status update failed:', err));

        safeShowAlert("⏰ Время ставить занят! Будильник сработал!", 1);
    };

    const triggerAlarm = (cfg) => {
        setOperatorBusy();

        // Cleanup
        localStorage.removeItem(cfg.key);
        localStorage.removeItem(cfg.lsHourKey);
        localStorage.removeItem(cfg.lsMinKey);

        const hourEl = document.getElementById(cfg.hourId);
        const minEl = document.getElementById(cfg.minId);
        const btnEl = document.getElementById(cfg.btnId);
        const cardEl = document.getElementById(cfg.dispId)?.closest('.alc-card');

        if (hourEl) { hourEl.value = ''; hourEl.classList.remove('valid'); }
        if (minEl) { minEl.value = ''; minEl.classList.remove('valid'); }
        if (btnEl) {
            btnEl.textContent = 'Установить';
            btnEl.classList.remove('set');
        }
        if (cardEl) cardEl.classList.remove('active');

        if (timeouts[cfg.id]) {
            clearTimeout(timeouts[cfg.id]);
            delete timeouts[cfg.id];
        }

        refreshGlobalReminderIcon();
    };

    const validateInputs = (h, m) => {
        const hour = safeParseInt(h);
        const minute = safeParseInt(m);

        if (hour === null || minute === null) return { valid: false, error: 'Введите время!' };
        if (hour < 0 || hour > 23) return { valid: false, error: 'Часы: 0-23' };
        if (minute < 0 || minute > 59) return { valid: false, error: 'Минуты: 0-59' };

        return { valid: true, hour, minute };
    };

    const setAlarm = (cfg) => {
        const hourEl = document.getElementById(cfg.hourId);
        const minEl = document.getElementById(cfg.minId);
        const btnEl = document.getElementById(cfg.btnId);

        const validation = validateInputs(hourEl?.value, minEl?.value);

        if (!validation.valid) {
            safeShowAlert(validation.error);
            if (hourEl && !validation.hour && validation.hour !== 0) hourEl.classList.add('error');
            if (minEl && !validation.minute && validation.minute !== 0) minEl.classList.add('error');
            setTimeout(() => {
                hourEl?.classList.remove('error');
                minEl?.classList.remove('error');
            }, 500);
            return;
        }

        const { hour: h, minute: m } = validation;

        // Calculate target time
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);

        if (target.getTime() <= now.getTime()) {
            target.setDate(target.getDate() + 1);
        }

        const stamp = target.getTime();

        // Save to localStorage
        localStorage.setItem(cfg.key, stamp);
        localStorage.setItem(cfg.lsHourKey, h);
        localStorage.setItem(cfg.lsMinKey, m);

        // Clear existing timeout
        if (timeouts[cfg.id]) {
            clearTimeout(timeouts[cfg.id]);
        }

        // Set new timeout
        const timeLeft = stamp - Date.now();
        timeouts[cfg.id] = setTimeout(() => triggerAlarm(cfg), timeLeft);

        // Update UI
        if (btnEl) {
            btnEl.textContent = 'Изменить';
            btnEl.classList.add('set');
        }
        if (hourEl) hourEl.classList.add('valid');
        if (minEl) minEl.classList.add('valid');

        const cardEl = document.getElementById(cfg.dispId)?.closest('.alc-card');
        if (cardEl) cardEl.classList.add('active');

        safeShowAlert(`✅ Будильник №${cfg.id} установлен на ${format(h)}:${format(m)}`);
        refreshGlobalReminderIcon();
    };

    const removeAlarm = (cfg) => {
        if (timeouts[cfg.id]) {
            clearTimeout(timeouts[cfg.id]);
            delete timeouts[cfg.id];
        }

        localStorage.removeItem(cfg.key);
        localStorage.removeItem(cfg.lsHourKey);
        localStorage.removeItem(cfg.lsMinKey);

        const hourEl = document.getElementById(cfg.hourId);
        const minEl = document.getElementById(cfg.minId);
        const btnEl = document.getElementById(cfg.btnId);
        const cardEl = document.getElementById(cfg.dispId)?.closest('.alc-card');

        if (hourEl) { hourEl.value = ''; hourEl.classList.remove('valid'); }
        if (minEl) { minEl.value = ''; minEl.classList.remove('valid'); }
        if (btnEl) {
            btnEl.textContent = 'Установить';
            btnEl.classList.remove('set');
        }
        if (cardEl) cardEl.classList.remove('active');

        safeShowAlert(`🗑️ Будильник №${cfg.id} удалён`);
        refreshGlobalReminderIcon();
    };

    const refreshGlobalReminderIcon = () => {
        const active = ALARMS_CONFIG.some(cfg => localStorage.getItem(cfg.key));
        const icon = document.getElementById('reminderstatus');
        if (icon) {
            icon.textContent = active ? "🔔" : "🔕";
            icon.style.opacity = active ? '1' : '0.5';
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  UI UPDATE LOOP
    // ═══════════════════════════════════════════════════════════════════════════

    const updateUI = () => {
        const now = new Date();
        const clockEl = document.getElementById('alc_current');

        if (clockEl) {
            clockEl.textContent = `${format(now.getHours())}:${format(now.getMinutes())}:${format(now.getSeconds())}`;
        }

        ALARMS_CONFIG.forEach(cfg => {
            const stamp = localStorage.getItem(cfg.key);
            const disp = document.getElementById(cfg.dispId);
            const cardEl = disp?.closest('.alc-card');

            if (disp) {
                const remaining = getRemaining(stamp);
                if (remaining) {
                    disp.innerHTML = `<span>${format(remaining.h)}</span><span class="alc-unit">ч</span><span class="alc-sep">:</span><span>${format(remaining.m)}</span><span class="alc-unit">м</span><span class="alc-sep">:</span><span>${format(remaining.s)}</span><span class="alc-unit">с</span>`;
                } else {
                    disp.innerHTML = `<span>00</span><span class="alc-unit">ч</span><span class="alc-sep">:</span><span>00</span><span class="alc-unit">м</span><span class="alc-sep">:</span><span>00</span><span class="alc-unit">с</span>`;
                }

                disp.classList.toggle('active', !!remaining);
                if (cardEl) cardEl.classList.toggle('active', !!remaining);
            }
        });
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  INPUT HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════

    const setupInputHandlers = (cfg) => {
        const hourEl = document.getElementById(cfg.hourId);
        const minEl = document.getElementById(cfg.minId);

        const handleInput = (el, max) => {
            el.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                if (val.length > 2) val = val.slice(0, 2);
                if (parseInt(val) > max) val = String(max);
                e.target.value = val;
                el.classList.remove('error');
            });

            el.addEventListener('blur', () => {
                const val = safeParseInt(el.value);
                if (val !== null) {
                    el.value = format(val);
                    if (val <= max) el.classList.add('valid');
                }
            });

            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const next = el === hourEl ? minEl : document.getElementById(cfg.btnId);
                    next?.focus();
                    if (el === minEl) setAlarm(cfg);
                }
            });
        };

        if (hourEl) handleInput(hourEl, 23);
        if (minEl) handleInput(minEl, 59);
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  RESTORE STATE
    // ═══════════════════════════════════════════════════════════════════════════

    const restoreAlarmState = (cfg) => {
        const hourEl = document.getElementById(cfg.hourId);
        const minEl = document.getElementById(cfg.minId);
        const btnEl = document.getElementById(cfg.btnId);

        const savedH = localStorage.getItem(cfg.lsHourKey);
        const savedM = localStorage.getItem(cfg.lsMinKey);

        if (savedH !== null && hourEl) {
            hourEl.value = format(savedH);
            hourEl.classList.add('valid');
        }
        if (savedM !== null && minEl) {
            minEl.value = format(savedM);
            minEl.classList.add('valid');
        }

        const stamp = localStorage.getItem(cfg.key);
        if (stamp) {
            const timeLeft = stamp - Date.now();

            if (timeLeft > 0) {
                timeouts[cfg.id] = setTimeout(() => triggerAlarm(cfg), timeLeft);
                if (btnEl) {
                    btnEl.textContent = 'Изменить';
                    btnEl.classList.add('set');
                }
                const cardEl = document.getElementById(cfg.dispId)?.closest('.alc-card');
                if (cardEl) cardEl.classList.add('active');
            } else {
                // Alarm expired while away
                localStorage.removeItem(cfg.key);
                localStorage.removeItem(cfg.lsHourKey);
                localStorage.removeItem(cfg.lsMinKey);
                if (hourEl) { hourEl.value = ''; hourEl.classList.remove('valid'); }
                if (minEl) { minEl.value = ''; minEl.classList.remove('valid'); }
                if (btnEl) {
                    btnEl.textContent = 'Установить';
                    btnEl.classList.remove('set');
                }
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  HTML TEMPLATE
    // ═══════════════════════════════════════════════════════════════════════════

    const win_Alarm = `
        <div class="alc-panel">
            <div class="alc-header" id="alc_drag">
                <span class="alc-title">
                    <span class="alc-title-icon">⏰</span>
                    Автостатус "занят"
                </span>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div id="alc_current" class="alc-current-time">00:00:00</div>
                    <button id="hideMeAlarm" class="alc-btn alc-hide-btn">✕</button>
                </div>
            </div>
            <div class="alc-grid">
                ${ALARMS_CONFIG.map(cfg => `
                    <div class="alc-card" id="alc_card_${cfg.id}">
                        <span class="alc-label">Будильник №${cfg.id}</span>
                        <div class="alc-input-group">
                            <input id="${cfg.hourId}" class="alc-input" type="text" placeholder="00" maxlength="2" autocomplete="off">
                            <span class="alc-separator">:</span>
                            <input id="${cfg.minId}" class="alc-input" type="text" placeholder="00" maxlength="2" autocomplete="off">
                        </div>
                        <button id="${cfg.btnId}" class="alc-btn">Установить</button>
                        <div id="${cfg.dispId}" class="alc-display" title="Двойной клик для удаления">
                            <span>00</span><span class="alc-unit">ч</span><span class="alc-sep">:</span><span>00</span><span class="alc-unit">м</span><span class="alc-sep">:</span><span>00</span><span class="alc-unit">с</span>
                        </div>
                        <div class="alc-hint">Двойной клик по таймеру — удалить</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // ═══════════════════════════════════════════════════════════════════════════
    //  INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    const init = () => {
        // Prevent double initialization
        if (isInitialized) {
            console.warn('[AlarmClock] Already initialized, skipping...');
            return;
        }
        isInitialized = true;

        // Inject styles
        injectStyles();

        // Create window (with fallback)
        safeCreateWindow('AF_AlarmClock', 'winTopAlarmclock', 'winLeftAlarmclock', win_Alarm);
        safeHideWindow('AF_AlarmClock');

        // Wait for DOM to be ready
        const setup = () => {
            const panel = document.getElementById('AF_AlarmClock');
            if (!panel) {
                setTimeout(setup, 100);
                return;
            }

            // Setup each alarm
            ALARMS_CONFIG.forEach(cfg => {
                const btn = document.getElementById(cfg.btnId);
                const disp = document.getElementById(cfg.dispId);

                if (btn) btn.onclick = () => setAlarm(cfg);
                if (disp) disp.ondblclick = () => removeAlarm(cfg);

                setupInputHandlers(cfg);
                restoreAlarmState(cfg);
            });

            // Hide button
            const hideBtn = document.getElementById('hideMeAlarm');
            if (hideBtn) {
                hideBtn.onclick = () => {
                    const win = document.getElementById('AF_AlarmClock');
                    if (win) win.style.display = 'none';
                };
            }

            // Menu button toggle
            const menuBtn = document.getElementById('reminderstatus');
            if (menuBtn) {
                const originalClick = menuBtn.onclick;
                menuBtn.onclick = (e) => {
                    const win = document.getElementById('AF_AlarmClock');
                    if (win) {
                        win.style.display = win.style.display === 'none' ? 'block' : 'none';
                    }
                    if (originalClick) originalClick.call(menuBtn, e);
                };
            }

            // Start update loop
            if (updateInterval) clearInterval(updateInterval);
            updateInterval = setInterval(updateUI, 1000);
            updateUI();

            refreshGlobalReminderIcon();
            console.log('[AlarmClock] Premium Edition v2.0 initialized ✨');
        };

        setup();
    };

    // Auto-init or wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();