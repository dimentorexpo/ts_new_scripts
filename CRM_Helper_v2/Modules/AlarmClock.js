/**
 * AlarmClock.js — модуль «Напоминания»: два независимых напоминания на время ЧЧ:ММ.
 *
 * Хранение (ключи прежние, чтобы не потерять уже поставленные напоминания):
 *   remindertextCRM{n}  — текст;
 *   setchasCRM{n} / setminutaCRM{n} — время, для отображения;
 *   chronostamp{n}      — момент срабатывания (мс с 1970 г.).
 * Раньше в chronostamp лежала относительная задержка — такие значения
 * переводятся в абсолютное время при загрузке.
 */
(function () {
    'use strict';

    const SLOTS = ['', '1'];          // суффиксы ключей: напоминание 1 и 2
    const timers = { '': null, '1': null };

    const slotHtml = (n, idx) => `
        <div class="ac-card" data-slot="${idx}">
            <div class="ac-card-head">
                <span class="crm-section-title">Напоминание ${n}</span>
                <span class="crm-pill ac-count" id="clock_reminCRM${idx}" title="Осталось до срабатывания. Двойной клик — удалить">—</span>
            </div>
            <input class="crm-input" id="remindertextCRM${idx}" placeholder="О чём напомнить" autocomplete="off" maxlength="300">
            <div class="crm-row" style="margin-top:8px">
                <input class="crm-input is-center" id="ac_time${idx}" type="time" step="60" style="width:110px" title="Время срабатывания">
                <button type="button" class="crm-btn crm-btn-primary crm-grow" id="setreminderCRM${idx}">Поставить</button>
                <button type="button" class="crm-icon-btn is-boxed" id="ac_remove${idx}" title="Удалить напоминание" aria-label="Удалить напоминание">${crmIcon('trash')}</button>
            </div>
        </div>`;

    const html = `
        ${crmWinHeader({
            icon: '⏰',
            title: 'Напоминания',
            tools: '<span class="ac-clock" id="clock_jsCRM" title="Текущее время"></span>',
            closeId: 'hideAlarmclock'
        })}
        <div id="AlarmclockCRM">${slotHtml(1, '')}${slotHtml(2, '1')}</div>`;

    createWindowCRM('winAlarmclock', 'winTopAlarmclock', 'winLeftAlarmclock', html, { className: 'ac-window' });
    document.getElementById('winAlarmclock').style.width = '340px';
    hideWindowOnDoubleClick('winAlarmclock');
    hideWindowOnClick('winAlarmclock', 'hideAlarmclock');

    document.getElementById('btnAlarmclock').onclick = () => crmToggleWindow('winAlarmclock');

    const pad2 = (n) => String(n).padStart(2, '0');

    /** Ближайший момент HH:MM (сегодня, а если уже прошло — завтра). */
    function nextOccurrence(hours, minutes) {
        const target = new Date();
        target.setHours(hours, minutes, 0, 0);
        if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
        return target.getTime();
    }

    /** Момент срабатывания из хранилища (с переводом старого формата). */
    function readTarget(idx) {
        const raw = Number(localStorage.getItem('chronostamp' + idx));
        if (!raw) return 0;
        if (raw > 1e12) return raw;

        // Старый формат: относительная задержка. Берём сохранённое время на сегодня.
        const h = parseInt(localStorage.getItem('setchasCRM' + idx), 10);
        const m = parseInt(localStorage.getItem('setminutaCRM' + idx), 10);
        if (Number.isNaN(h) || Number.isNaN(m)) return 0;
        const today = new Date();
        today.setHours(h, m, 0, 0);
        localStorage.setItem('chronostamp' + idx, String(today.getTime()));
        return today.getTime();
    }

    function clearSlotStorage(idx) {
        ['chronostamp', 'remindertextCRM', 'setchasCRM', 'setminutaCRM'].forEach((k) => localStorage.removeItem(k + idx));
        localStorage.removeItem(idx === '' ? 'chronostamp2' : 'chronostamp22'); // наследные служебные ключи
    }

    function refreshMenuIcon() {
        const active = SLOTS.some((idx) => readTarget(idx) > 0);
        crmSetMenuIcon('btnAlarmclock', active ? '🔔' : '🔕');
    }

    function fillSlotFields(idx) {
        const target = readTarget(idx);
        document.getElementById('remindertextCRM' + idx).value = localStorage.getItem('remindertextCRM' + idx) || '';
        document.getElementById('ac_time' + idx).value = target
            ? `${pad2(new Date(target).getHours())}:${pad2(new Date(target).getMinutes())}`
            : '';
    }

    /** Срабатывание. Проверяем, что напоминание ещё актуально: его могла снять другая вкладка. */
    function fire(idx, expectedTarget) {
        timers[idx] = null;
        if (readTarget(idx) !== expectedTarget) return;

        const text = localStorage.getItem('remindertextCRM' + idx) || 'Время напоминания наступило';
        clearSlotStorage(idx);
        fillSlotFields(idx);
        refreshMenuIcon();

        crmToast(text, 'warning', { title: `⏰ Напоминание ${idx === '' ? 1 : 2}`, sticky: true });
        if (typeof crmPlaySound === 'function') crmPlaySound();
    }

    /** Планирует таймер по сохранённому моменту. Просроченное (пока вкладка была закрыта) срабатывает сразу. */
    function schedule(idx) {
        clearTimeout(timers[idx]);
        timers[idx] = null;
        const target = readTarget(idx);
        if (!target) return;
        // setTimeout ограничен ~24,8 суток — нам достаточно, напоминание не дальше суток.
        timers[idx] = setTimeout(() => fire(idx, target), Math.max(0, target - Date.now()));
    }

    function setupReminder(idx) {
        const timeValue = document.getElementById('ac_time' + idx).value;
        const text = document.getElementById('remindertextCRM' + idx).value.trim();
        const timeInput = document.getElementById('ac_time' + idx);

        if (!/^\d{2}:\d{2}$/.test(timeValue)) {
            timeInput.classList.add('is-invalid');
            crmToast('Укажите время срабатывания', 'warning');
            return;
        }
        timeInput.classList.remove('is-invalid');

        const [h, m] = timeValue.split(':').map(Number);
        const target = nextOccurrence(h, m);

        localStorage.setItem('remindertextCRM' + idx, text);
        localStorage.setItem('setchasCRM' + idx, String(h));
        localStorage.setItem('setminutaCRM' + idx, String(m));
        localStorage.setItem('chronostamp' + idx, String(target));

        schedule(idx);
        refreshMenuIcon();

        const when = new Date(target);
        const isTomorrow = when.getDate() !== new Date().getDate();
        crmToast(`Сработает ${isTomorrow ? 'завтра' : 'сегодня'} в ${pad2(h)}:${pad2(m)}`, 'success', { title: 'Напоминание поставлено' });
    }

    function removeAlarm(idx) {
        if (!readTarget(idx)) return;
        clearTimeout(timers[idx]);
        timers[idx] = null;
        clearSlotStorage(idx);
        fillSlotFields(idx);
        refreshMenuIcon();
        crmToast('Напоминание удалено', 'info', { duration: 2000 });
    }

    function renderCountdown(idx) {
        const el = document.getElementById('clock_reminCRM' + idx);
        const target = readTarget(idx);
        if (!target) {
            el.textContent = '—';
            el.dataset.tone = '';
            return;
        }
        let left = Math.max(0, Math.round((target - Date.now()) / 1000));
        const h = Math.floor(left / 3600);
        left %= 3600;
        el.textContent = `${pad2(h)}:${pad2(Math.floor(left / 60))}:${pad2(left % 60)}`;
        el.dataset.tone = 'info';
    }

    SLOTS.forEach((idx) => {
        document.getElementById('setreminderCRM' + idx).onclick = () => setupReminder(idx);
        document.getElementById('ac_remove' + idx).onclick = () => removeAlarm(idx);
        document.getElementById('clock_reminCRM' + idx).ondblclick = () => removeAlarm(idx);
        document.getElementById('remindertextCRM' + idx).addEventListener('keydown', (e) => {
            if (e.key === 'Enter') setupReminder(idx);
        });
        fillSlotFields(idx);
        schedule(idx);
    });

    // Напоминание поставили или сняли в другой вкладке CRM — синхронизируемся.
    window.addEventListener('storage', (e) => {
        const idx = SLOTS.find((s) => e.key === 'chronostamp' + s);
        if (idx === undefined) return;
        schedule(idx);
        fillSlotFields(idx);
        refreshMenuIcon();
    });

    refreshMenuIcon();

    // Часы и обратный отсчёт обновляем только когда окно открыто.
    const win = document.getElementById('winAlarmclock');
    const tick = () => {
        if (win.style.display === 'none') return;
        const now = new Date();
        document.getElementById('clock_jsCRM').textContent =
            `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
        SLOTS.forEach(renderCountdown);
    };
    win.addEventListener('crm:shown', tick);
    setInterval(tick, 1000);
})();
