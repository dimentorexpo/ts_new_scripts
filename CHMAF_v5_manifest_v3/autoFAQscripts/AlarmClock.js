/**
 * AlarmClock — Автостатус «Занят» + Напоминания (v3.0)
 * Visual Style: Corporate Graphite Dark (как Queue.js)
 * Unique prefix: alc-
 * Dependencies: createWindow, hideWindowOnDoubleClick, showCustomAlert, afApiFetch (external)
 *
 * Хранилище:
 *   chronostamp / chronostamp1 + alc_ls_h1..2, alc_ls_m1..2  — будильники «Занят» (совместимо с v2)
 *   alc_reminders — JSON-массив напоминаний [{ id, text, at, created }]
 * Напоминания действуют в рамках текущего дня.
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════
    //  CONFIG
    // ═══════════════════════════════════════════════════════════════════

    const ALARMS_CONFIG = [
        { id: 1, hourId: 'alc_h1', minId: 'alc_m1', btnId: 'alc_set1', dispId: 'alc_wait1', key: 'chronostamp', lsHourKey: 'alc_ls_h1', lsMinKey: 'alc_ls_m1' },
        { id: 2, hourId: 'alc_h2', minId: 'alc_m2', btnId: 'alc_set2', dispId: 'alc_wait2', key: 'chronostamp1', lsHourKey: 'alc_ls_h2', lsMinKey: 'alc_ls_m2' }
    ];

    const REM_KEY = 'alc_reminders';
    const MISSED_GRACE_MS = 5 * 60 * 1000;      // будильник «Занят»: сработать, если опоздали ≤5 мин
    const REM_MISSED_GRACE_MS = 60 * 60 * 1000; // напоминание: показать, если опоздали ≤1 ч

    const timeouts = {};       // будильники
    const remTimeouts = {};    // напоминания
    let updateInterval = null;
    let isInitialized = false;
    let remMode = 'in';        // 'in' — через N минут, 'at' — к времени
    let editingId = null;      // id напоминания в режиме редактирования

    // ═══════════════════════════════════════════════════════════════════
    //  STYLES
    // ═══════════════════════════════════════════════════════════════════

    const injectStyles = () => {
        if (document.getElementById('alc-styles')) return;
        const style = document.createElement('style');
        style.id = 'alc-styles';
        style.innerHTML = `
            #AF_AlarmClock .alc-panel {
                box-sizing: border-box;
                width: min(470px, calc(100vw - 24px));
                max-width: 100%;
                padding: 18px !important;
                color: #edf2fb;
                background:
                    radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
                    #111827 !important;
                border: 1px solid #344258 !important;
                border-radius: 18px;
                box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06) !important;
                font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
                z-index: var(--z-window-raised, 1000100);
                position: relative;
            }
            #AF_AlarmClock .alc-panel, #AF_AlarmClock .alc-panel * { box-sizing: border-box; }

            /* Шапка */
            #AF_AlarmClock .alc-header {
                display: flex; align-items: center; gap: 10px;
                margin-bottom: 14px; padding-bottom: 14px;
                border-bottom: 1px solid #344258;
                cursor: move;
            }
            #AF_AlarmClock .alc-stats {
                display: flex; align-items: center; gap: 8px;
                padding: 7px 12px;
                color: #a6b4cb; background: #182335;
                border: 1px solid #364660; border-radius: 10px;
                font-size: 11px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase;
            }
            #AF_AlarmClock .alc-stats b {
                color: #a9c0ff; font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 13px;
            }

            /* Кнопки */
            #AF_AlarmClock .alc-btn {
                min-height: 36px; padding: 8px 14px;
                color: #dce5f5; background: #1b283c;
                border: 1px solid #3c4d68; border-radius: 9px;
                cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit;
                display: inline-flex; align-items: center; justify-content: center; gap: 6px;
                transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
            }
            #AF_AlarmClock .alc-btn:hover:not(:disabled) {
                color: #fff; background: #293b56; border-color: #7799e2; transform: translateY(-1px);
            }
            #AF_AlarmClock #hideMeAlarm {
                background: rgba(255, 116, 140, .08) !important;
                border-color: rgba(255, 116, 140, .3) !important;
                color: #ffb0be !important; padding: 8px 12px !important;
            }
            #AF_AlarmClock .alc-btn-primary {
                color: #eef3ff; background: #4268c9; border-color: #7293ed;
                box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
            }
            #AF_AlarmClock .alc-btn-primary:hover:not(:disabled) {
                background: #547ce1; border-color: #a2b9fa;
            }
            #AF_AlarmClock #alc_list_btn { margin-left: auto; }
            #AF_AlarmClock .alc-btn.set {
                color: #bff3d8; background: #183a32; border-color: #3f8a6d;
            }
            #AF_AlarmClock .alc-btn-sm { min-height: 28px; padding: 4px 9px; font-size: 12px; border-radius: 8px; }
            #AF_AlarmClock .alc-btn-danger:hover:not(:disabled) {
                background: rgba(255, 116, 140, .15); border-color: rgba(255, 116, 140, .6); color: #ffd0d9;
            }

            /* Секции */
            #AF_AlarmClock .alc-section {
                background: #151f30; border: 1px solid #2e3b52; border-radius: 12px;
                padding: 12px; margin-bottom: 12px;
            }
            #AF_AlarmClock .alc-section:last-child { margin-bottom: 0; }
            #AF_AlarmClock .alc-section-title {
                font-size: 11px; font-weight: 700; color: #8e9bb8;
                text-transform: uppercase; letter-spacing: .06em; margin-bottom: 10px;
            }

            /* Будильники «Занят» */
            #AF_AlarmClock .alc-alarm-row {
                display: flex; align-items: center; gap: 8px;
                padding: 8px 10px; margin-bottom: 7px;
                background: #1a2536; border: 1px solid #344258;
                border-left: 3px solid #617fbd; border-radius: 10px;
            }
            #AF_AlarmClock .alc-alarm-row:last-child { margin-bottom: 0; }
            #AF_AlarmClock .alc-alarm-row.active { border-left-color: #4fd1a0; }
            #AF_AlarmClock .alc-alarm-label { font-size: 12px; font-weight: 700; color: #b6c9f5; min-width: 24px; }

            /* Поля */
            #AF_AlarmClock .alc-input {
                height: 34px; color: #edf2fb; background: #0d1625;
                border: 1px solid #3a4961; border-radius: 9px;
                padding: 0 10px; outline: none; font-size: 13px; font-family: inherit;
                transition: background .2s, border-color .2s;
            }
            #AF_AlarmClock .alc-input:hover { background: #142034; border-color: #657caa; }
            #AF_AlarmClock .alc-input:focus {
                background: #142034; border-color: #829fff; box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
            }
            #AF_AlarmClock .alc-input.num {
                width: 46px; padding: 0 4px; text-align: center;
                font-family: 'JetBrains Mono', monospace; font-weight: 700;
            }
            #AF_AlarmClock .alc-input.valid { border-color: #3f8a6d; }
            #AF_AlarmClock .alc-input.error { border-color: #ff748c; animation: alc-shake .4s both; }
            #AF_AlarmClock textarea.alc-input {
                width: 100%; height: 58px; padding: 8px 10px; resize: vertical; line-height: 1.35;
            }
            #AF_AlarmClock .alc-sep { color: #5a6a86; font-weight: 700; }

            #AF_AlarmClock .alc-countdown {
                margin-left: auto; min-width: 74px; text-align: right;
                color: #6b7a96; font-family: 'JetBrains Mono', monospace; font-size: 12px; font-weight: 700;
                cursor: help; user-select: none;
            }
            #AF_AlarmClock .alc-countdown.active { color: #7ee2b8; }

            /* Форма напоминания */
            #AF_AlarmClock .alc-row { display: flex; align-items: center; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
            #AF_AlarmClock .alc-seg {
                display: inline-flex; background: #0d1625; border: 1px solid #3a4961;
                border-radius: 9px; padding: 3px; gap: 3px;
            }
            #AF_AlarmClock .alc-seg button {
                border: 1px solid transparent; background: transparent; color: #8e9bb8;
                font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px;
                cursor: pointer; font-family: inherit;
            }
            #AF_AlarmClock .alc-seg button.is-active { background: #2b4372; border-color: #7093e6; color: #fff; }
            #AF_AlarmClock .alc-chip {
                font-size: 11px; padding: 4px 8px; border-radius: 7px; cursor: pointer;
                background: #182335; border: 1px solid #364660; color: #a9c0ff; font-weight: 700;
            }
            #AF_AlarmClock .alc-chip:hover { background: #23334b; border-color: #6685be; }
            #AF_AlarmClock .alc-muted { color: #8e9bb8; font-size: 12px; }
            #AF_AlarmClock .alc-hidden { display: none !important; }

            /* Оверлей со списком напоминаний */
            #AF_AlarmClock .alc-overlay {
                position: absolute; inset: 0; z-index: 5;
                display: flex; align-items: flex-start; justify-content: center;
                padding: 14px; background: rgba(8, 12, 22, .78); border-radius: inherit;
            }
            #AF_AlarmClock .alc-overlay-box {
                width: 100%; max-height: 100%; display: flex; flex-direction: column; gap: 10px;
                padding: 14px; background: #111827; border: 1px solid #3c4d68;
                border-radius: 14px; box-shadow: 0 18px 50px rgba(0, 0, 0, .5);
            }
            #AF_AlarmClock .alc-overlay-head { display: flex; align-items: center; gap: 8px; }
            #AF_AlarmClock .alc-overlay-title { font-size: 13px; font-weight: 700; color: #fff; }
            #AF_AlarmClock .alc-list {
                overflow-y: auto; max-height: 380px; padding-right: 4px;
                scrollbar-width: thin; scrollbar-color: #536a8e transparent;
            }
            #AF_AlarmClock .alc-list::-webkit-scrollbar { width: 6px; }
            #AF_AlarmClock .alc-list::-webkit-scrollbar-thumb { background: #536a8e; border-radius: 4px; }
            #AF_AlarmClock .alc-item {
                display: flex; align-items: flex-start; gap: 10px;
                margin-bottom: 7px; padding: 9px 10px;
                background: #1a2536; border: 1px solid #344258;
                border-left: 3px solid #617fbd; border-radius: 10px;
            }
            #AF_AlarmClock .alc-item:hover { background: #23334b; border-color: #6685be; border-left-color: #92afff; }
            #AF_AlarmClock .alc-item.soon { border-left-color: #f0c674; }
            #AF_AlarmClock .alc-item-time { flex: 0 0 auto; display: flex; flex-direction: column; gap: 2px; min-width: 62px; }
            #AF_AlarmClock .alc-item-time b { color: #b6c9f5; font-family: 'JetBrains Mono', monospace; font-size: 13px; }
            #AF_AlarmClock .alc-item-time span { color: #7ee2b8; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
            #AF_AlarmClock .alc-item-text {
                flex: 1; min-width: 0; font-size: 13px; color: #f0f4fb; line-height: 1.35;
                white-space: pre-wrap; word-break: break-word;
            }
            #AF_AlarmClock .alc-item-actions { display: flex; gap: 4px; flex: 0 0 auto; }
            #AF_AlarmClock .alc-empty { text-align: center; padding: 22px 0; color: #6b7a96; font-size: 13px; }
            #AF_AlarmClock .alc-edit-box { border: 1px solid #4268c9; }

            /* Всплывающее окно сработавшего напоминания */
            .alc-toast-wrap {
                position: fixed; right: 20px; bottom: 20px; z-index: var(--z-popover, 2147483000);
                display: flex; flex-direction: column; gap: 10px; max-width: 360px;
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            }
            .alc-toast {
                background: #111827; color: #edf2fb; border: 1px solid #7293ed;
                border-left: 4px solid #f0c674; border-radius: 12px; padding: 12px 14px;
                box-shadow: 0 18px 50px rgba(0, 0, 0, .55); animation: alc-in .3s ease;
            }
            .alc-toast-head { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #f0c674; margin-bottom: 6px; }
            .alc-toast-text { font-size: 14px; line-height: 1.4; white-space: pre-wrap; word-break: break-word; }
            .alc-toast-actions { display: flex; gap: 6px; margin-top: 10px; justify-content: flex-end; }
            .alc-toast-actions button {
                min-height: 28px; padding: 4px 10px; font-size: 12px; font-weight: 600; cursor: pointer;
                color: #dce5f5; background: #1b283c; border: 1px solid #3c4d68; border-radius: 8px; font-family: inherit;
            }
            .alc-toast-actions button:hover { background: #293b56; border-color: #7799e2; color: #fff; }
            .alc-toast-actions button.primary { background: #4268c9; border-color: #7293ed; color: #fff; }

            @keyframes alc-shake {
                20%, 80% { transform: translateX(-2px); }
                40%, 60% { transform: translateX(3px); }
            }
            @keyframes alc-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        `;
        document.head.appendChild(style);
    };

    // ═══════════════════════════════════════════════════════════════════
    //  UTILS
    // ═══════════════════════════════════════════════════════════════════

    const $ = (id) => document.getElementById(id);
    const format = (v) => String(Number(v)).padStart(2, '0');
    const safeParseInt = (val) => { const n = parseInt(val, 10); return isNaN(n) ? null : n; };
    const esc = (s) => String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const hhmm = (ts) => { const d = new Date(Number(ts)); return `${format(d.getHours())}:${format(d.getMinutes())}`; };
    const endOfToday = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d.getTime(); };

    const fmtLeft = (ms) => {
        if (!ms || ms <= 0) return '00:00:00';
        const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
        return `${format(h)}:${format(m)}:${format(s)}`;
    };
    const fmtLeftShort = (ms) => {
        if (ms <= 0) return 'сейчас';
        const m = Math.ceil(ms / 60000);
        if (m < 60) return `через ${m} мин`;
        return `через ${Math.floor(m / 60)} ч ${m % 60} мин`;
    };

    const safeShowAlert = (msg, type = 0) => {
        if (typeof showCustomAlert === 'function') {
            try { showCustomAlert(msg, type); } catch (e) { console.warn('Alert error:', e); }
        } else console.log('[AlarmClock]', msg);
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

    const flash = (el) => {
        if (!el) return;
        el.classList.add('error');
        setTimeout(() => el.classList.remove('error'), 450);
    };

    // ═══════════════════════════════════════════════════════════════════
    //  АВТОСТАТУС «ЗАНЯТ»
    // ═══════════════════════════════════════════════════════════════════

    const setOperatorBusy = () => {
        afApiFetch('https://skyeng.autofaq.ai/api/reason8/operator/status', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ command: 'DO_SET_OPERATOR_STATUS', status: 'Busy', source: 'Operator' })
        }).catch(err => console.warn('Status update failed:', err));
        safeShowAlert('⏰ Время ставить занят! Будильник сработал!', 1);
    };

    const clearAlarmStorage = (cfg) => {
        localStorage.removeItem(cfg.key);
        localStorage.removeItem(cfg.lsHourKey);
        localStorage.removeItem(cfg.lsMinKey);
    };

    const clearAlarmTimer = (cfg) => {
        if (timeouts[cfg.id]) { clearTimeout(timeouts[cfg.id]); delete timeouts[cfg.id]; }
    };

    // Поля/кнопка будильника по данным хранилища
    const restoreInputs = (cfg) => {
        const hourEl = $(cfg.hourId), minEl = $(cfg.minId), btnEl = $(cfg.btnId);
        const isSet = !!localStorage.getItem(cfg.key);
        const savedH = localStorage.getItem(cfg.lsHourKey);
        const savedM = localStorage.getItem(cfg.lsMinKey);
        if (hourEl) { hourEl.value = isSet && savedH !== null ? format(savedH) : ''; hourEl.classList.toggle('valid', isSet); }
        if (minEl) { minEl.value = isSet && savedM !== null ? format(savedM) : ''; minEl.classList.toggle('valid', isSet); }
        if (btnEl) { btnEl.textContent = isSet ? 'Изменить' : 'Установить'; btnEl.classList.toggle('set', isSet); }
    };

    const triggerAlarm = (cfg) => {
        // Сверяемся с хранилищем: будильник могли удалить/переставить в другой вкладке,
        // а первая сработавшая вкладка удаляет ключ — остальные не дублируют.
        const stamp = Number(localStorage.getItem(cfg.key));
        if (!stamp || stamp - Date.now() > 1000) {
            clearAlarmTimer(cfg);
            if (stamp) timeouts[cfg.id] = setTimeout(() => triggerAlarm(cfg), stamp - Date.now());
            return;
        }
        setOperatorBusy();
        clearAlarmStorage(cfg);
        clearAlarmTimer(cfg);
        restoreInputs(cfg);
        refreshGlobalReminderIcon();
    };

    const setAlarm = (cfg) => {
        const hourEl = $(cfg.hourId), minEl = $(cfg.minId);
        const h = safeParseInt(hourEl?.value), m = safeParseInt(minEl?.value);
        const badH = h === null || h < 0 || h > 23, badM = m === null || m < 0 || m > 59;
        if (badH || badM) {
            safeShowAlert(h === null || m === null ? 'Введите время!' : (badH ? 'Часы: 0-23' : 'Минуты: 0-59'));
            if (badH) flash(hourEl);
            if (badM) flash(minEl);
            return;
        }
        const now = new Date();
        const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
        if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
        const stamp = target.getTime();

        localStorage.setItem(cfg.key, stamp);
        localStorage.setItem(cfg.lsHourKey, h);
        localStorage.setItem(cfg.lsMinKey, m);

        clearAlarmTimer(cfg);
        timeouts[cfg.id] = setTimeout(() => triggerAlarm(cfg), stamp - Date.now());
        restoreInputs(cfg);
        safeShowAlert(`✅ Будильник №${cfg.id} установлен на ${format(h)}:${format(m)}`);
        refreshGlobalReminderIcon();
    };

    const removeAlarm = (cfg) => {
        if (!localStorage.getItem(cfg.key)) return;
        clearAlarmTimer(cfg);
        clearAlarmStorage(cfg);
        restoreInputs(cfg);
        safeShowAlert(`🗑️ Будильник №${cfg.id} удалён`);
        refreshGlobalReminderIcon();
    };

    const restoreAlarmState = (cfg) => {
        const stamp = Number(localStorage.getItem(cfg.key));
        if (stamp) {
            const left = stamp - Date.now();
            if (left > 0) timeouts[cfg.id] = setTimeout(() => triggerAlarm(cfg), left);
            else if (left > -MISSED_GRACE_MS) { triggerAlarm(cfg); return; }
            else clearAlarmStorage(cfg);
        }
        restoreInputs(cfg);
    };

    const setupAlarmInputs = (cfg) => {
        const hourEl = $(cfg.hourId), minEl = $(cfg.minId);
        const bind = (el, max, next) => {
            if (!el) return;
            el.addEventListener('input', () => {
                let v = el.value.replace(/[^0-9]/g, '').slice(0, 2);
                if (parseInt(v, 10) > max) v = String(max);
                el.value = v;
                el.classList.remove('error');
            });
            el.addEventListener('blur', () => {
                const v = safeParseInt(el.value);
                if (v !== null) el.value = format(v);
            });
            el.addEventListener('keydown', (e) => {
                if (e.key !== 'Enter') return;
                if (next) next.focus(); else setAlarm(cfg);
            });
        };
        bind(hourEl, 23, minEl);
        bind(minEl, 59, null);
    };

    // ═══════════════════════════════════════════════════════════════════
    //  НАПОМИНАНИЯ
    // ═══════════════════════════════════════════════════════════════════

    const loadReminders = () => {
        const arr = readJsonLocal(REM_KEY, []);
        return Array.isArray(arr) ? arr.filter(r => r && r.id && r.at) : [];
    };
    const saveReminders = (list) => {
        list.sort((a, b) => a.at - b.at);
        if (list.length) localStorage.setItem(REM_KEY, JSON.stringify(list));
        else localStorage.removeItem(REM_KEY);
    };

    const clearRemTimer = (id) => {
        if (remTimeouts[id]) { clearTimeout(remTimeouts[id]); delete remTimeouts[id]; }
    };

    // Пересоздать таймеры по хранилищу (после изменений/в другой вкладке)
    const scheduleAllReminders = () => {
        Object.keys(remTimeouts).forEach(clearRemTimer);
        const now = Date.now();
        const list = loadReminders();
        let changed = false;
        const keep = [];
        list.forEach(r => {
            const left = r.at - now;
            if (left > 0) {
                remTimeouts[r.id] = setTimeout(() => fireReminder(r.id), Math.min(left, 2147483000));
                keep.push(r);
            } else if (left > -REM_MISSED_GRACE_MS) {
                keep.push(r);
                setTimeout(() => fireReminder(r.id), 0);
            } else {
                changed = true; // протухшее (например, со вчера) — выкидываем
            }
        });
        if (changed) saveReminders(keep);
    };

    const fireReminder = (id) => {
        clearRemTimer(id);
        const list = loadReminders();
        const r = list.find(x => x.id === id);
        if (!r) return; // уже удалено или показано в другой вкладке
        if (r.at - Date.now() > 1000) { // перенесли в другой вкладке
            remTimeouts[id] = setTimeout(() => fireReminder(id), r.at - Date.now());
            return;
        }
        saveReminders(list.filter(x => x.id !== id));
        showReminderToast(r);
        refreshGlobalReminderIcon();
        renderReminderList();
    };

    const playBeep = () => {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            const ctx = new Ctx();
            [0, 0.25].forEach(t => {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.frequency.value = 880; o.type = 'sine';
                g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
                g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + t + 0.02);
                g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.2);
                o.connect(g).connect(ctx.destination);
                o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.22);
            });
            setTimeout(() => ctx.close().catch(() => {}), 800);
        } catch (_) { /* без звука */ }
    };

    const showReminderToast = (r) => {
        playBeep();
        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🔔 Напоминание', { body: r.text, requireInteraction: true });
            }
        } catch (_) { /* ignore */ }

        let wrap = document.querySelector('.alc-toast-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.className = 'alc-toast-wrap';
            document.body.appendChild(wrap);
        }
        const t = document.createElement('div');
        t.className = 'alc-toast';
        t.innerHTML = `
            <div class="alc-toast-head">🔔 Напоминание · ${hhmm(r.at)}</div>
            <div class="alc-toast-text">${esc(r.text)}</div>
            <div class="alc-toast-actions">
                <button data-snooze="5">+5 мин</button>
                <button data-snooze="15">+15 мин</button>
                <button class="primary" data-ok>Готово</button>
            </div>`;
        t.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            if (btn.dataset.snooze) {
                const mins = Number(btn.dataset.snooze);
                addReminder(r.text, Date.now() + mins * 60000, true);
                safeShowAlert(`⏳ Отложено на ${mins} мин`);
            }
            t.remove();
            if (!wrap.children.length) wrap.remove();
        });
        wrap.appendChild(t);
    };

    const addReminder = (text, at, allowTomorrow = false) => {
        const list = loadReminders();
        const r = { id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), text, at, created: Date.now() };
        list.push(r);
        saveReminders(list);
        scheduleAllReminders();
        refreshGlobalReminderIcon();
        renderReminderList();
        return r;
    };

    const updateReminder = (id, text, at) => {
        const list = loadReminders();
        const r = list.find(x => x.id === id);
        if (!r) { safeShowAlert('Напоминание уже сработало или удалено'); return false; }
        r.text = text; r.at = at;
        saveReminders(list);
        scheduleAllReminders();
        renderReminderList();
        return true;
    };

    const deleteReminder = (id) => {
        clearRemTimer(id);
        saveReminders(loadReminders().filter(x => x.id !== id));
        refreshGlobalReminderIcon();
        renderReminderList();
    };

    // Считать время из формы (prefix: 'alc_r' — основная форма, 'alc_e' — редактирование)
    const readTarget = (prefix, mode) => {
        const now = Date.now();
        if (mode === 'in') {
            const el = $(prefix + '_mins');
            const mins = safeParseInt(el?.value);
            if (mins === null || mins < 1) { flash(el); return { error: 'Укажите, через сколько минут напомнить' }; }
            const at = now + mins * 60000;
            if (at > endOfToday()) { flash(el); return { error: 'Напоминание должно сработать сегодня (до 23:59)' }; }
            return { at };
        }
        const hEl = $(prefix + '_h'), mEl = $(prefix + '_m');
        const h = safeParseInt(hEl?.value), m = safeParseInt(mEl?.value);
        if (h === null || h < 0 || h > 23) { flash(hEl); return { error: 'Часы: 0-23' }; }
        if (m === null || m < 0 || m > 59) { flash(mEl); return { error: 'Минуты: 0-59' }; }
        const d = new Date(); d.setHours(h, m, 0, 0);
        if (d.getTime() <= now) { flash(hEl); flash(mEl); return { error: 'Это время сегодня уже прошло' }; }
        return { at: d.getTime() };
    };

    const submitNewReminder = () => {
        const txtEl = $('alc_r_text');
        const text = (txtEl?.value || '').trim();
        if (!text) { flash(txtEl); safeShowAlert('Напишите, о чём напомнить'); return; }
        const res = readTarget('alc_r', remMode);
        if (res.error) { safeShowAlert(res.error); return; }
        addReminder(text, res.at);
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            try { Notification.requestPermission(); } catch (_) { /* ignore */ }
        }
        txtEl.value = '';
        ['alc_r_mins', 'alc_r_h', 'alc_r_m'].forEach(id => { const el = $(id); if (el) el.value = ''; });
        safeShowAlert(`✅ Напомню в ${hhmm(res.at)}`);
    };

    // ─── Список напоминаний (оверлей) ───────────────────────────────

    const openList = () => { editingId = null; $('alc_overlay')?.classList.remove('alc-hidden'); renderReminderList(); };
    const closeList = () => { editingId = null; $('alc_overlay')?.classList.add('alc-hidden'); };

    const timeFieldsHtml = (prefix, mode, at) => {
        const d = at ? new Date(at) : null;
        const leftMin = at ? Math.max(1, Math.round((at - Date.now()) / 60000)) : '';
        return `
            <div class="alc-seg" data-seg="${prefix}">
                <button type="button" data-mode="in" class="${mode === 'in' ? 'is-active' : ''}">Через</button>
                <button type="button" data-mode="at" class="${mode === 'at' ? 'is-active' : ''}">Ко времени</button>
            </div>
            <span class="${mode === 'in' ? '' : 'alc-hidden'}" data-pane="${prefix}-in" style="display:inline-flex;align-items:center;gap:6px">
                <input id="${prefix}_mins" class="alc-input num" type="text" maxlength="3" placeholder="5" value="${mode === 'in' ? leftMin : ''}" autocomplete="off">
                <span class="alc-muted">мин</span>
            </span>
            <span class="${mode === 'at' ? '' : 'alc-hidden'}" data-pane="${prefix}-at" style="display:inline-flex;align-items:center;gap:4px">
                <input id="${prefix}_h" class="alc-input num" type="text" maxlength="2" placeholder="чч" value="${d ? format(d.getHours()) : ''}" autocomplete="off">
                <span class="alc-sep">:</span>
                <input id="${prefix}_m" class="alc-input num" type="text" maxlength="2" placeholder="мм" value="${d ? format(d.getMinutes()) : ''}" autocomplete="off">
            </span>`;
    };

    const renderReminderList = () => {
        const listEl = $('alc_rem_list');
        const countEl = $('alc_rem_count');
        const list = loadReminders();
        if (countEl) countEl.textContent = list.length;
        if (!listEl || $('alc_overlay')?.classList.contains('alc-hidden')) return;
        if (editingId && document.activeElement && listEl.contains(document.activeElement)) return; // не сбиваем ввод

        if (!list.length) {
            listEl.innerHTML = '<div class="alc-empty">Напоминаний пока нет</div>';
            return;
        }
        const now = Date.now();
        listEl.innerHTML = list.map(r => {
            if (r.id === editingId) {
                return `
                <div class="alc-item alc-edit-box" data-id="${r.id}" style="flex-direction:column;align-items:stretch">
                    <textarea id="alc_e_text" class="alc-input" maxlength="500">${esc(r.text)}</textarea>
                    <div class="alc-row" style="margin-top:0">
                        ${timeFieldsHtml('alc_e', 'at', r.at)}
                        <span style="margin-left:auto;display:inline-flex;gap:6px">
                            <button class="alc-btn alc-btn-sm" data-act="cancel">Отмена</button>
                            <button class="alc-btn alc-btn-sm alc-btn-primary" data-act="save">💾 Сохранить</button>
                        </span>
                    </div>
                </div>`;
            }
            const left = r.at - now;
            return `
                <div class="alc-item${left < 5 * 60000 ? ' soon' : ''}" data-id="${r.id}">
                    <div class="alc-item-time"><b>${hhmm(r.at)}</b><span data-left="${r.at}">${fmtLeftShort(left)}</span></div>
                    <div class="alc-item-text">${esc(r.text)}</div>
                    <div class="alc-item-actions">
                        <button class="alc-btn alc-btn-sm" data-act="edit" title="Редактировать">✏️</button>
                        <button class="alc-btn alc-btn-sm alc-btn-danger" data-act="del" title="Удалить">🗑️</button>
                    </div>
                </div>`;
        }).join('');
    };

    const onListClick = (e) => {
        // Переключатель «Через / Ко времени» в форме редактирования
        const segBtn = e.target.closest('.alc-seg button');
        if (segBtn) { switchSeg(segBtn); return; }

        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const id = btn.closest('.alc-item')?.dataset.id;
        const act = btn.dataset.act;
        if (act === 'del') {
            deleteReminder(id);
            safeShowAlert('🗑️ Напоминание удалено');
        } else if (act === 'edit') {
            editingId = id; renderReminderList();
            $('alc_e_text')?.focus();
        } else if (act === 'cancel') {
            editingId = null; renderReminderList();
        } else if (act === 'save') {
            const txtEl = $('alc_e_text');
            const text = (txtEl?.value || '').trim();
            if (!text) { flash(txtEl); safeShowAlert('Текст напоминания пустой'); return; }
            const seg = btn.closest('.alc-item').querySelector('.alc-seg button.is-active');
            const res = readTarget('alc_e', seg?.dataset.mode || 'at');
            if (res.error) { safeShowAlert(res.error); return; }
            editingId = null;
            if (updateReminder(id, text, res.at)) safeShowAlert(`✅ Сохранено, напомню в ${hhmm(res.at)}`);
        }
    };

    const switchSeg = (btn) => {
        const seg = btn.closest('.alc-seg');
        const prefix = seg.dataset.seg;
        const mode = btn.dataset.mode;
        seg.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b === btn));
        const root = seg.parentElement;
        root.querySelector(`[data-pane="${prefix}-in"]`)?.classList.toggle('alc-hidden', mode !== 'in');
        root.querySelector(`[data-pane="${prefix}-at"]`)?.classList.toggle('alc-hidden', mode !== 'at');
        if (prefix === 'alc_r') remMode = mode;
        (mode === 'in' ? $(prefix + '_mins') : $(prefix + '_h'))?.focus();
    };

    // Ограничение ввода в числовые поля формы напоминаний
    const onNumInput = (e) => {
        const el = e.target;
        if (!el.classList?.contains('num') || !/^alc_[re]_/.test(el.id)) return;
        const max = el.id.endsWith('_h') ? 23 : el.id.endsWith('_m') ? 59 : 999;
        let v = el.value.replace(/[^0-9]/g, '').slice(0, el.maxLength || 3);
        if (v && parseInt(v, 10) > max) v = String(max);
        el.value = v;
    };

    // ═══════════════════════════════════════════════════════════════════
    //  ОБЩЕЕ
    // ═══════════════════════════════════════════════════════════════════

    const refreshGlobalReminderIcon = () => {
        const active = ALARMS_CONFIG.some(cfg => localStorage.getItem(cfg.key)) || loadReminders().length > 0;
        const icon = $('reminderstatus');
        if (icon) {
            icon.textContent = active ? '🔔' : '🔕';
            icon.style.opacity = active ? '1' : '0.5';
        }
        const c = $('alc_rem_count');
        if (c) c.textContent = loadReminders().length;
    };

    const updateUI = () => {
        const now = new Date();
        const clockEl = $('alc_current');
        if (clockEl) clockEl.textContent = `${format(now.getHours())}:${format(now.getMinutes())}:${format(now.getSeconds())}`;

        ALARMS_CONFIG.forEach(cfg => {
            const disp = $(cfg.dispId);
            if (!disp) return;
            const stamp = Number(localStorage.getItem(cfg.key));
            const left = stamp ? stamp - Date.now() : 0;
            disp.textContent = fmtLeft(left);
            disp.classList.toggle('active', left > 0);
            disp.closest('.alc-alarm-row')?.classList.toggle('active', left > 0);
        });

        document.querySelectorAll('#AF_AlarmClock [data-left]').forEach(el => {
            el.textContent = fmtLeftShort(Number(el.dataset.left) - Date.now());
        });
    };

    // ═══════════════════════════════════════════════════════════════════
    //  HTML
    // ═══════════════════════════════════════════════════════════════════

    const win_Alarm = `
        <div class="alc-panel">
            <div class="alc-header chmaf-drag-handle" id="alc_drag">
                <button id="hideMeAlarm" class="alc-btn buttonHide" title="Скрыть">❌</button>
                <div class="alc-stats">⏰ <b id="alc_current">00:00:00</b></div>
                <button id="alc_list_btn" class="alc-btn alc-btn-primary" title="Все напоминания: просмотр, редактирование, удаление">
                    📋 Напоминания (<span id="alc_rem_count">0</span>)
                </button>
            </div>

            <div class="alc-section">
                <div class="alc-section-title">📝 Новое напоминание</div>
                <textarea id="alc_r_text" class="alc-input" maxlength="500" placeholder="О чём напомнить? Например: написать ученику Ивану про перенос урока"></textarea>
                <div class="alc-row">
                    ${timeFieldsHtml('alc_r', 'in', null)}
                </div>
                <div class="alc-row" id="alc_r_quick">
                    <span class="alc-muted">Быстро:</span>
                    <span class="alc-chip" data-q="5">5 мин</span>
                    <span class="alc-chip" data-q="10">10 мин</span>
                    <span class="alc-chip" data-q="15">15 мин</span>
                    <span class="alc-chip" data-q="30">30 мин</span>
                    <span class="alc-chip" data-q="60">1 час</span>
                    <button id="alc_r_add" class="alc-btn alc-btn-primary" style="margin-left:auto">➕ Напомнить</button>
                </div>
            </div>

            <div class="alc-section">
                <div class="alc-section-title">💤 Автостатус «Занят»</div>
                ${ALARMS_CONFIG.map(cfg => `
                    <div class="alc-alarm-row">
                        <span class="alc-alarm-label">№${cfg.id}</span>
                        <input id="${cfg.hourId}" class="alc-input num" type="text" placeholder="чч" maxlength="2" autocomplete="off">
                        <span class="alc-sep">:</span>
                        <input id="${cfg.minId}" class="alc-input num" type="text" placeholder="мм" maxlength="2" autocomplete="off">
                        <button id="${cfg.btnId}" class="alc-btn alc-btn-sm">Установить</button>
                        <span id="${cfg.dispId}" class="alc-countdown" title="Двойной клик — удалить будильник">00:00:00</span>
                    </div>
                `).join('')}
            </div>

            <div id="alc_overlay" class="alc-overlay alc-hidden">
                <div class="alc-overlay-box">
                    <div class="alc-overlay-head">
                        <span class="alc-overlay-title">📋 Напоминания на сегодня</span>
                        <button id="alc_list_close" class="alc-btn alc-btn-sm" style="margin-left:auto">✕ Закрыть</button>
                    </div>
                    <div id="alc_rem_list" class="alc-list"></div>
                </div>
            </div>
        </div>
    `;

    // ═══════════════════════════════════════════════════════════════════
    //  INIT
    // ═══════════════════════════════════════════════════════════════════

    const init = () => {
        if (isInitialized) return;
        isInitialized = true;

        injectStyles();
        safeCreateWindow('AF_AlarmClock', 'winTopAlarmclock', 'winLeftAlarmclock', win_Alarm);
        safeHideWindow('AF_AlarmClock');

        const setup = () => {
            const panel = $('AF_AlarmClock');
            if (!panel) { setTimeout(setup, 100); return; }

            // Будильники «Занят»
            ALARMS_CONFIG.forEach(cfg => {
                const btn = $(cfg.btnId), disp = $(cfg.dispId);
                if (btn) btn.onclick = () => setAlarm(cfg);
                if (disp) disp.ondblclick = () => removeAlarm(cfg);
                setupAlarmInputs(cfg);
                restoreAlarmState(cfg);
            });

            // Форма напоминания
            $('alc_r_add').onclick = submitNewReminder;
            $('alc_r_text').addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submitNewReminder(); }
            });
            panel.querySelector('.alc-seg[data-seg="alc_r"]').addEventListener('click', (e) => {
                const b = e.target.closest('button'); if (b) switchSeg(b);
            });
            $('alc_r_quick').addEventListener('click', (e) => {
                const chip = e.target.closest('.alc-chip');
                if (!chip) return;
                const segBtn = panel.querySelector('.alc-seg[data-seg="alc_r"] button[data-mode="in"]');
                if (segBtn) switchSeg(segBtn);
                $('alc_r_mins').value = chip.dataset.q;
                submitNewReminder();
            });
            ['alc_r_mins', 'alc_r_h', 'alc_r_m'].forEach(id => {
                $(id)?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitNewReminder(); });
            });
            panel.addEventListener('input', onNumInput);

            // Список
            $('alc_list_btn').onclick = openList;
            $('alc_list_close').onclick = closeList;
            $('alc_rem_list').addEventListener('click', onListClick);
            $('alc_overlay').addEventListener('click', (e) => { if (e.target.id === 'alc_overlay') closeList(); });

            // Скрыть окно
            $('hideMeAlarm').onclick = () => { panel.style.display = 'none'; };

            // Колокольчик в AF_helper
            const menuBtn = $('reminderstatus');
            if (menuBtn) {
                menuBtn.onclick = () => { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };
            }

            // Синхронизация вкладок
            window.addEventListener('storage', (e) => {
                if (e.key === REM_KEY) {
                    scheduleAllReminders();
                    renderReminderList();
                    refreshGlobalReminderIcon();
                    return;
                }
                const cfg = ALARMS_CONFIG.find(c => c.key === e.key);
                if (!cfg) return;
                clearAlarmTimer(cfg);
                const stamp = Number(e.newValue);
                if (stamp && stamp > Date.now()) timeouts[cfg.id] = setTimeout(() => triggerAlarm(cfg), stamp - Date.now());
                restoreInputs(cfg);
                refreshGlobalReminderIcon();
            });

            scheduleAllReminders();

            if (updateInterval) clearInterval(updateInterval);
            updateInterval = setInterval(updateUI, 1000);
            updateUI();
            refreshGlobalReminderIcon();
        };
        setup();
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
