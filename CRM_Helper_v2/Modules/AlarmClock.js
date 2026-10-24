/**
 * AlarmClock.js — модуль «Напоминания»: список напоминаний на время ЧЧ:ММ,
 * у каждого — опция повтора «каждый день».
 *
 * Хранение: ключ crm_reminders_v2 — JSON-массив
 *   [{ id, text, time: "ЧЧ:ММ", next: <мс с 1970>, daily: true|false }]
 * next — момент следующего срабатывания (абсолютное время).
 *
 * Миграция из старого формата (два слота remindertextCRM{n} / chronostamp{n})
 * выполняется один раз при загрузке: старые напоминания переезжают в новый
 * список, прежние ключи удаляются.
 */
(function () {
    'use strict';

    const LS_KEY = 'crm_reminders_v2';
    const timers = new Map();       // id → setTimeout
    const cards = new Map();        // id → корневой элемент карточки

    const pad2 = (n) => String(n).padStart(2, '0');

    /* ---------- Хранилище ---------- */

    let reminders = loadReminders();
    const save = () => localStorage.setItem(LS_KEY, JSON.stringify(reminders));

    function loadReminders() {
        // Миграция старых двух слотов.
        const legacy = [];
        for (const idx of ['', '1']) {
            const next = Number(localStorage.getItem('chronostamp' + idx));
            if (next > 1e12) {
                legacy.push({
                    id: `r${Date.now()}${idx ? '2' : '1'}`,
                    text: localStorage.getItem('remindertextCRM' + idx) || '',
                    time: null, // восстановим из next
                    next,
                    daily: false
                });
            }
            ['chronostamp', 'remindertextCRM', 'setchasCRM', 'setminutaCRM'].forEach((k) => localStorage.removeItem(k + idx));
            localStorage.removeItem(idx === '' ? 'chronostamp2' : 'chronostamp22'); // наследные служебные ключи
        }

        let list = [];
        try {
            const parsed = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
            if (Array.isArray(parsed)) {
                list = parsed.filter((r) => r && typeof r.id === 'string');
            }
        } catch (_) { /* битый JSON — начинаем с пустого списка */ }

        if (legacy.length && !list.length) {
            list = legacy;
            setTimeout(() => localStorage.setItem(LS_KEY, JSON.stringify(list)), 0);
        }

        // Восстанавливаем поле time из абсолютного момента (для карточек старой миграции).
        const now = Date.now();
        for (const r of list) {
            if (!r.time && r.next > 1e12) {
                const d = new Date(r.next);
                r.time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
            }
            if (typeof r.daily !== 'boolean') r.daily = false;
            if (!r.text) r.text = '';
            // Просроченное ежедневное напоминание (вкладка была закрыта) — просто переносим вперёд.
            if (r.daily && r.next && r.next <= now) r.next = nextOccurrenceFrom(r.time, now);
        }
        return list;
    }

    /** Ближайший момент «сегодня в ЧЧ:ММ», а если уже прошёл — завтра. */
    function nextOccurrenceFrom(time, fromNow = Date.now()) {
        const [h, m] = String(time).split(':').map(Number);
        const target = new Date(fromNow);
        target.setHours(h || 0, m || 0, 0, 0);
        if (target.getTime() <= fromNow) target.setDate(target.getDate() + 1);
        return target.getTime();
    }

    /* ---------- Меню и окно ---------- */

    createWindowCRM('winAlarmclock', 'winTopAlarmclock', 'winLeftAlarmclock', `
        ${crmWinHeader({
            icon: '⏰',
            title: 'Напоминания',
            tools: '<span class="ac-clock" id="clock_jsCRM" title="Текущее время"></span>',
            closeId: 'hideAlarmclock'
        })}
        <div id="AlarmclockCRM" class="ac-list"></div>
        <div style="padding: 10px 14px 14px">
            <button type="button" class="crm-btn crm-btn-block" id="ac_add">${crmIcon('plus', 15)} Добавить напоминание</button>
        </div>`, { className: 'ac-window' });

    const win = document.getElementById('winAlarmclock');
    win.style.width = '360px';
    hideWindowOnDoubleClick('winAlarmclock');
    hideWindowOnClick('winAlarmclock', 'hideAlarmclock');

    document.getElementById('btnAlarmclock').onclick = () => crmToggleWindow('winAlarmclock');

    const listEl = document.getElementById('AlarmclockCRM');

    function refreshMenuIcon() {
        crmSetMenuIcon('btnAlarmclock', reminders.length ? '🔔' : '🔕');
    }

    /* ---------- Планировщик ---------- */

    function schedule(r) {
        clearTimeout(timers.get(r.id));
        timers.delete(r.id);
        if (!r.next || r.next <= Date.now()) return;
        timers.set(r.id, setTimeout(() => fire(r.id), r.next - Date.now()));
    }

    function scheduleAll() {
        reminders.forEach(schedule);
    }

    /** Срабатывание. Проверяем, что напоминание ещё актуально: его могла изменить другая вкладка. */
    function fire(id) {
        timers.delete(id);
        const r = reminders.find((x) => x.id === id);
        if (!r || !r.next || r.next > Date.now() + 1500) return;

        const text = r.text || 'Время напоминания наступило';
        const pill = cards.get(id)?.querySelector('.ac-count');

        if (r.daily) {
            r.next = nextOccurrenceFrom(r.time, Date.now() + 60000); // строго следующий день
            schedule(r);
            save();
            if (pill) pill.dataset.tone = 'info';
        } else {
            reminders = reminders.filter((x) => x.id !== id);
            save();
            cards.get(id)?.remove();
            cards.delete(id);
            if (!reminders.length) render(); // вернуть заглушку «Напоминаний нет»
        }
        refreshMenuIcon();

        crmToast(text, 'warning', { title: '⏰ Напоминание', sticky: true });
        if (typeof crmPlaySound === 'function') crmPlaySound();
    }

    /* ---------- Карточки ---------- */

    function cardHtml(r) {
        return `
            <div class="ac-card" data-id="${crmEsc(r.id)}">
                <div class="ac-card-head">
                    <input class="crm-input ac-text" placeholder="О чём напомнить" autocomplete="off" maxlength="300" value="${crmEsc(r.text)}">
                    <button type="button" class="crm-icon-btn is-boxed ac-del" title="Удалить напоминание" aria-label="Удалить напоминание">${crmIcon('trash')}</button>
                </div>
                <div class="crm-row" style="margin-top:8px">
                    <input class="crm-input is-center ac-time" type="time" step="60" style="width:104px" title="Время срабатывания" value="${r.time || ''}">
                    <label class="crm-switch" title="Повторять каждый день в это время">
                        <input type="checkbox" class="ac-daily"${r.daily ? ' checked' : ''}><span class="crm-switch-track"></span><span>Каждый день</span>
                    </label>
                    <span class="crm-grow"></span>
                    <span class="crm-pill ac-count" title="Осталось до срабатывания. Двойной клик — удалить">—</span>
                </div>
            </div>`;
    }

    function bindCard(root, r) {
        const textEl = root.querySelector('.ac-text');
        const timeEl = root.querySelector('.ac-time');
        const dailyEl = root.querySelector('.ac-daily');

        const applyTime = () => {
            const value = timeEl.value;
            if (!/^\d{2}:\d{2}$/.test(value)) {
                timeEl.classList.add('is-invalid');
                return;
            }
            timeEl.classList.remove('is-invalid');
            r.time = value;
            r.next = nextOccurrenceFrom(value);
            schedule(r);
            save();
            refreshMenuIcon();
            const when = new Date(r.next);
            const isTomorrow = when.getDate() !== new Date().getDate();
            crmToast(`Сработает ${isTomorrow ? 'завтра' : 'сегодня'} в ${r.time}${r.daily ? ', повтор каждый день' : ''}`, 'success', { title: 'Напоминание поставлено', duration: 2500 });
        };

        textEl.addEventListener('input', () => { r.text = textEl.value; save(); });
        textEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyTime(); });
        timeEl.addEventListener('change', applyTime);
        dailyEl.addEventListener('change', () => {
            r.daily = dailyEl.checked;
            if (r.daily && (!r.next || r.next <= Date.now())) {
                if (!r.time) { crmToast('Сначала укажите время', 'warning'); dailyEl.checked = false; return; }
                r.next = nextOccurrenceFrom(r.time);
                schedule(r);
            }
            save();
            renderCountdown(r);
        });
        root.querySelector('.ac-del').onclick = () => removeReminder(r.id);
    }

    function render() {
        listEl.textContent = '';
        cards.clear();
        if (!reminders.length) {
            listEl.innerHTML = '<div class="crm-empty">Напоминаний нет. Добавьте первое — сработает, пока открыта вкладка CRM.</div>';
            return;
        }
        for (const r of reminders) {
            const root = document.createElement('div');
            root.innerHTML = cardHtml(r);
            const card = root.firstElementChild;
            listEl.appendChild(card);
            cards.set(r.id, card);
            bindCard(card, r);
            renderCountdown(r);
        }
    }

    function removeReminder(id) {
        clearTimeout(timers.get(id));
        timers.delete(id);
        reminders = reminders.filter((x) => x.id !== id);
        save();
        cards.get(id)?.remove();
        cards.delete(id);
        if (!reminders.length) render();
        refreshMenuIcon();
        crmToast('Напоминание удалено', 'info', { duration: 2000 });
    }

    function renderCountdown(r) {
        const el = cards.get(r.id)?.querySelector('.ac-count');
        if (!el) return;
        if (!r.next || r.next <= Date.now()) {
            el.textContent = '—';
            el.dataset.tone = '';
            return;
        }
        let left = Math.max(0, Math.round((r.next - Date.now()) / 1000));
        const d = Math.floor(left / 86400);
        left %= 86400;
        const h = Math.floor(left / 3600);
        left %= 3600;
        el.textContent = (d ? `${d} д ` : '') + `${pad2(h)}:${pad2(Math.floor(left / 60))}:${pad2(left % 60)}`;
        el.dataset.tone = 'info';
    }

    document.getElementById('ac_add').onclick = () => {
        const r = { id: `r${Date.now()}${Math.floor(Math.random() * 100)}`, text: '', time: '', next: 0, daily: false };
        reminders.push(r);
        save();
        render();
        refreshMenuIcon();
        cards.get(r.id)?.querySelector('.ac-text').focus();
    };

    // Счётчик двойного клика по «осталось» — удалить (как раньше).
    listEl.addEventListener('dblclick', (e) => {
        const pill = e.target.closest('.ac-count');
        if (pill) removeReminder(pill.closest('.ac-card').dataset.id);
    });

    // Напоминания поставили или сняли в другой вкладке CRM — синхронизируемся.
    window.addEventListener('storage', (e) => {
        if (e.key !== LS_KEY) return;
        reminders = loadReminders();
        timers.forEach((t) => clearTimeout(t));
        timers.clear();
        scheduleAll();
        render();
        refreshMenuIcon();
    });

    scheduleAll();
    render();
    refreshMenuIcon();

    // Часы и обратный отсчёт обновляем только когда окно открыто.
    const tick = () => {
        if (win.style.display === 'none') return;
        const now = new Date();
        document.getElementById('clock_jsCRM').textContent =
            `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
        reminders.forEach(renderCountdown);
    };
    win.addEventListener('crm:shown', tick);
    setInterval(tick, 1000);
})();
