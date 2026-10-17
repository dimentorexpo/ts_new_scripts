'use strict';

(() => {
    if (window.__chmafCalendarInitialized) return;

    if (typeof createWindow !== 'function') {
        console.error('[Calendar] createWindow недоступен');
        return;
    }

    const DATSY_URL = 'https://datsy.ru/';
    const BOOKING_CUTOFF_MS = 5 * 60 * 1000;

    const HIDDEN_TIMES = new Set([
        '00:00', '00:20', '00:40',
        '01:00', '01:20', '01:40',
        '02:00', '02:20', '02:40',
        '03:00', '03:20', '03:40',
        '04:00', '04:20', '04:40',
        '05:00', '05:20', '05:40',
        '06:00', '06:20', '06:40',
        '07:00', '07:20', '07:40',
        '23:00', '23:20', '23:40'
    ]);

    const state = {
        events: [],
        myEvents: [],
        operatorNames: new Set(),

        selectedKey: null,
        selectedElement: null,

        requestVersion: 0,
        refreshInterval: null,
        bookingInterval: null,

        dirty: false,
        mutationRunning: false,
        authRunning: false,

        // true — вход подтверждён;
        // false — Datsy ответил «Не авторизован»;
        // null — проверить не удалось.
        authenticated: null,

        lastErrorNoticeAt: 0
    };

    // ============================================================
    // СТИЛИ
    // ============================================================

    if (!document.getElementById('chmaf-calendar-styles')) {
        const style = document.createElement('style');
        style.id = 'chmaf-calendar-styles';

        style.textContent = `
            /* Оформление «corporate graphite» — как AF_helper / Userinfo / ChatHistory */
            #AF_Calendar {
                color: #e2e8f0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI",
                    Roboto, "Helvetica Neue", Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
                background: transparent !important;
                border: 0 !important;
                box-shadow: none !important;
            }

            #AF_Calendar *,
            #AF_Calendar *::before,
            #AF_Calendar *::after {
                box-sizing: border-box;
            }

            #AF_Calendar .af-calendar-layout {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                max-width: calc(100vw - 16px);
                max-height: calc(100dvh - 16px);
            }

            /* Панели */
            #AF_Calendar .af-calendar-main,
            #AF_Calendar .af-calendar-side {
                background:
                    radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
                    #111827;
                border: 1px solid #344258;
                border-radius: 18px;
                box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
            }

            #AF_Calendar .af-calendar-main {
                width: min(540px, calc(100vw - 24px));
                flex: 0 0 auto;
                overflow: hidden;
            }

            #AF_Calendar .af-calendar-scroll,
            #AF_Calendar .af-calendar-side {
                max-height: min(800px, calc(100dvh - 24px));
                overflow: auto;
                overscroll-behavior: contain;
                padding: 18px;
                scrollbar-width: thin;
                scrollbar-color: rgba(66, 104, 201, .4) transparent;
            }

            #AF_Calendar .af-calendar-scroll::-webkit-scrollbar,
            #AF_Calendar .af-calendar-side::-webkit-scrollbar { width: 4px; }
            #AF_Calendar .af-calendar-scroll::-webkit-scrollbar-thumb,
            #AF_Calendar .af-calendar-side::-webkit-scrollbar-thumb { background: rgba(66, 104, 201, .3); border-radius: 8px; }

            #AF_Calendar .af-calendar-side { flex: 0 0 360px; width: 360px; }
            #AF_Calendar .af-calendar-editor { flex-basis: 350px; width: 350px; }

            /* Шапки: ❌ слева, заголовок, линия-акцент снизу */
            #AF_Calendar .af-calendar-toolbar,
            #AF_Calendar .af-calendar-nav,
            #AF_Calendar .af-calendar-side-header {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }

            #AF_Calendar .af-calendar-toolbar { flex-wrap: nowrap; gap: 6px; }
            #AF_Calendar .af-calendar-toolbar .af-calendar-title { white-space: nowrap; margin-right: 2px; }

            /* У шапки календаря тот же id, что у старой шапки статистики в style.css —
               её серый фон и отступы здесь сбрасываем */
            #AF_Calendar #stataaf_header {
                justify-content: flex-start;
                margin: 0;
                padding: 0 0 12px;
                background: none;
                box-shadow: none;
            }

            #AF_Calendar .af-calendar-toolbar,
            #AF_Calendar .af-calendar-side-header {
                position: relative;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(66, 104, 201, .15);
            }

            #AF_Calendar .af-calendar-toolbar::after,
            #AF_Calendar .af-calendar-side-header::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 40%;
                height: 1px;
                background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
            }

            /* Окно можно тянуть за любое пустое место панели: кнопки, поля и слоты
               перетаскивание не запускают (это проверяет enableDrag в utils.js) */
            #AF_Calendar .chmaf-drag-handle { cursor: grab; user-select: none; }
            #AF_Calendar .chmaf-drag-handle:active { cursor: grabbing; }
            #AF_Calendar .chmaf-drag-handle :is(button, label) { cursor: pointer; }
            #AF_Calendar .chmaf-drag-handle input { cursor: text; }
            #AF_Calendar .chmaf-drag-handle input[type="checkbox"],
            #AF_Calendar .chmaf-drag-handle input[type="date"] { cursor: pointer; }

            #AF_Calendar .af-calendar-nav {
                justify-content: center;
                flex-wrap: nowrap;
                padding: 12px 0;
            }

            #AF_Calendar .af-calendar-spacer { flex: 1; }

            #AF_Calendar .af-calendar-title {
                color: #fefefe;
                font-size: 15px;
                font-weight: 700;
                text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
            }

            #AF_Calendar .af-calendar-side-header .af-calendar-title { flex: 1; }

            /* Кнопки */
            #AF_Calendar .af-calendar-btn,
            #AF_Calendar .af-calendar-slot,
            #AF_Calendar .af-calendar-badge {
                appearance: none;
                color: #dce5f5;
                background: #1b283c;
                border: 1px solid #3c4d68;
                border-radius: 9px;
                font: inherit;
                font-size: 13px;
                font-weight: 600;
                line-height: 1.2;
                text-shadow: 0 1px 2px rgba(0, 0, 0, .45);
                cursor: pointer;
                transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
            }

            #AF_Calendar .af-calendar-btn {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                min-width: 34px;
                min-height: 34px;
                padding: 0 12px;
                white-space: nowrap;
            }

            #AF_Calendar .af-calendar-btn--icon { width: 34px; padding: 0; font-size: 15px; }

            #AF_Calendar .af-calendar-btn:hover:not(:disabled),
            #AF_Calendar .af-calendar-badge:hover:not(:disabled) {
                color: #fff;
                background: #293b56;
                border-color: #7799e2;
                transform: translateY(-1px);
            }

            #AF_Calendar .af-calendar-btn:active:not(:disabled) { transform: translateY(0) scale(.98); }

            #AF_Calendar .af-calendar-btn:disabled,
            #AF_Calendar .af-calendar-slot:disabled {
                opacity: .5;
                cursor: not-allowed;
            }

            #AF_Calendar .af-calendar-btn--primary,
            #AF_Calendar .af-calendar-btn.is-active {
                color: #fff;
                background: #4268c9;
                border-color: #7293ed;
                box-shadow: 0 5px 15px rgba(58, 96, 205, .25);
            }

            #AF_Calendar .af-calendar-btn--primary:hover:not(:disabled),
            #AF_Calendar .af-calendar-btn.is-active:hover:not(:disabled) {
                background: #547ce1;
                border-color: #a2b9fa;
            }

            #AF_Calendar #availableActiveSlots { color: #86efac; font-size: 10px; }

            #AF_Calendar .af-calendar-btn--danger {
                color: #ffb0be;
                background: rgba(255, 116, 140, .08);
                border-color: rgba(255, 116, 140, .3);
            }

            #AF_Calendar .af-calendar-btn--danger:hover:not(:disabled) {
                color: #ffc6d0;
                background: rgba(255, 116, 140, .16);
                border-color: rgba(255, 116, 140, .55);
            }

            /* Поля */
            #AF_Calendar .af-calendar-input {
                min-width: 0;
                min-height: 34px;
                padding: 0 10px;
                color: #edf2fb;
                color-scheme: dark;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 9px;
                outline: none;
                font: inherit;
                font-size: 13px;
                font-weight: 600;
                transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
            }

            #AF_Calendar .af-calendar-input::placeholder { color: #7d8ca6; font-weight: 500; }

            #AF_Calendar .af-calendar-input:focus {
                background: #142034;
                border-color: #829fff;
                box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
            }

            #AF_Calendar .af-calendar-date {
                width: 150px;
                font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace;
            }

            #AF_Calendar .af-calendar-clock {
                width: 70px;
                color: #a9c0ff;
                text-align: center;
                font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace;
            }

            #AF_Calendar .af-calendar-muted { color: #94a3b8; font-size: 12px; }

            #AF_Calendar .af-calendar-timezone {
                padding: 4px 10px;
                color: #a9c0ff;
                background: rgba(66, 104, 201, .14);
                border: 1px solid rgba(119, 153, 226, .35);
                border-radius: 999px;
                font: 600 11px 'JetBrains Mono', ui-monospace, Consolas, monospace;
            }

            /* «Автообновление» — маленький переключатель, как в Настройках */
            #AF_Calendar .af-calendar-auto {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: #94a3b8;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
                user-select: none;
            }

            #AF_Calendar .af-calendar-auto input {
                -webkit-appearance: none;
                appearance: none;
                position: relative;
                flex: none;
                width: 30px;
                height: 18px;
                margin: 0;
                background: #0d1625;
                border: 1px solid #3c4d68;
                border-radius: 999px;
                cursor: pointer;
                transition: background-color .16s ease, border-color .16s ease;
            }

            #AF_Calendar .af-calendar-auto input::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 12px;
                height: 12px;
                background: #7d8ca6;
                border-radius: 50%;
                transition: transform .18s ease, background-color .16s ease;
            }

            #AF_Calendar .af-calendar-auto input:checked { background: #4268c9; border-color: #7293ed; }
            #AF_Calendar .af-calendar-auto input:checked::after { background: #fff; transform: translateX(12px); }
            #AF_Calendar .af-calendar-auto:has(input:checked) { color: #a9c0ff; }

            /* Сетка слотов */
            #AF_Calendar .af-calendar-slots {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 6px;
            }

            #AF_Calendar .af-calendar-slot {
                position: relative;
                min-height: 34px;
                font: 700 14px 'JetBrains Mono', ui-monospace, Consolas, monospace;
            }

            #AF_Calendar .af-calendar-slot:hover:not(:disabled) {
                color: #fff;
                border-color: #7799e2;
                transform: translateY(-1px);
            }

            /* Свободно — обычная тёмная плитка со светло-зелёным временем,
               занято — розоватое время, прошло — приглушено. Без заливок и полос. */
            #AF_Calendar .af-slot-free {
                color: #b9e8c8;
                background: #1b283c;
                border-color: #344a5a;
            }

            #AF_Calendar .af-slot-full {
                color: #f3b4bf;
                background: #1f2235;
                border-color: #4a3a4f;
            }

            #AF_Calendar .af-slot-past {
                color: #5f6e86;
                background: #141d2c;
                border-color: #2a3649;
            }

            /*
             * Закрытие бронирования не отключает всю плитку:
             * существующие события по-прежнему можно открыть.
             */
            #AF_Calendar .af-calendar-slot.is-booking-closed.af-slot-free {
                color: #7d8ca6;
                background: #162133;
                border-color: #2f3c51;
            }

            /* Слот с моим событием — синяя метка */
            #AF_Calendar .af-calendar-slot.is-mine {
                outline: 2px solid #7799e2;
                outline-offset: -4px;
            }

            #AF_Calendar .af-calendar-slot.is-mine::after {
                content: '●';
                position: absolute;
                right: 7px;
                top: 2px;
                color: #a9c0ff;
                font-size: 9px;
            }

            #AF_Calendar .af-calendar-slot.is-selected {
                box-shadow: 0 0 0 2px #829fff;
            }

            #AF_Calendar .af-calendar-badge {
                padding: 8px 14px;
                color: #fff;
                background: rgba(66, 104, 201, .2);
                border-color: #7293ed;
                font: 700 13px 'JetBrains Mono', ui-monospace, Consolas, monospace;
            }

            /* Строки событий (редактор слота и «Мои слоты») */
            #AF_Calendar .af-calendar-slot-row,
            #AF_Calendar .af-calendar-my-row {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
                margin-top: 8px;
                padding: 8px 10px;
                background: #1a2536;
                border: 1px solid #344258;
                border-left: 3px solid #3c4d68;
                border-radius: 10px;
            }

            #AF_Calendar .af-calendar-my-row { border-left-color: #617fbd; }

            #AF_Calendar .af-calendar-slot-num {
                flex: 0 0 23px;
                color: #7d8ca6;
                font: 700 11px 'JetBrains Mono', ui-monospace, Consolas, monospace;
            }

            #AF_Calendar .af-calendar-slot-row .af-calendar-input {
                flex: 1;
                width: 0;
                text-overflow: ellipsis;
            }

            #AF_Calendar .af-calendar-slot-row .af-calendar-btn,
            #AF_Calendar .af-calendar-my-row .af-calendar-btn { width: 34px; padding: 0; }

            #AF_Calendar .af-calendar-slot-row.is-occupied { border-left-color: #617fbd; }

            #AF_Calendar .af-calendar-slot-row.is-mine {
                background: rgba(66, 104, 201, .14);
                border-left-color: #a9c0ff;
            }

            #AF_Calendar .af-calendar-my-time {
                flex: 0 0 52px;
                color: #a9c0ff;
                font: 700 13px 'JetBrains Mono', ui-monospace, Consolas, monospace;
            }

            #AF_Calendar .af-calendar-my-id {
                flex: 0 0 86px;
                width: 86px;
                text-align: center;
                font-family: 'JetBrains Mono', ui-monospace, Consolas, monospace;
            }

            #AF_Calendar .af-calendar-status {
                padding: 3px 8px;
                color: #cbd5e1;
                background: rgba(148, 163, 184, .12);
                border: 1px solid rgba(148, 163, 184, .3);
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
                white-space: nowrap;
                min-width: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                flex: 1 1 auto;
            }

            #AF_Calendar .af-calendar-my-row .af-calendar-btn { flex: none; margin-left: auto; }

            #AF_Calendar .af-calendar-empty {
                grid-column: 1 / -1;
                padding: 22px 12px;
                color: #94a3b8;
                border: 1px dashed rgba(66, 104, 201, .3);
                border-radius: 12px;
                text-align: center;
                font-size: 13px;
            }

            #AF_Calendar .af-calendar-error {
                color: #fca5a5;
                border-color: rgba(220, 20, 60, .4);
            }

            #AF_Calendar :is(button, input):focus-visible {
                outline: 2px solid #9ab5ff;
                outline-offset: 2px;
            }

            @media (max-width: 1050px) {
                #AF_Calendar .af-calendar-layout { overflow-x: auto; }
            }

            @media (max-width: 630px) {
                #AF_Calendar .af-calendar-slots { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            }

            @media (prefers-reduced-motion: reduce) {
                #AF_Calendar *,
                #AF_Calendar *::before,
                #AF_Calendar *::after {
                    animation: none !important;
                    transition: none !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // ============================================================
    // РАЗМЕТКА
    // ============================================================

    const markup = `
        <div class="af-calendar-layout">
            <section
                id="slotList"
                class="af-calendar-side af-calendar-editor chmaf-drag-handle"
                style="display:none"
            >
                <div class="af-calendar-side-header chmaf-drag-handle">
                    <button
                        id="hideSlot"
                        type="button"
                        class="af-calendar-btn af-calendar-btn--danger af-calendar-btn--icon"
                        title="Закрыть редактор"
                    >❌</button>

                    <span class="af-calendar-title">
                        ✏️ Редактирование слота
                    </span>
                </div>

                <div style="text-align:center;margin:12px 0">
                    <button
                        id="chosenSlot"
                        type="button"
                        class="af-calendar-badge"
                        title="Скопировать дату и время"
                    ></button>
                </div>

                <div id="slotData"></div>
            </section>

            <section
                id="AF_Calendar_Container"
                class="af-calendar-main chmaf-drag-handle"
            >
                <div class="af-calendar-scroll">
                    <div
                        id="stataaf_header"
                        class="af-calendar-toolbar chmaf-drag-handle"
                    >
                        <button
                            id="hidecalendar"
                            type="button"
                            class="af-calendar-btn af-calendar-btn--danger af-calendar-btn--icon"
                            title="Скрыть окно"
                        >❌</button>

                        <span class="af-calendar-title">📅 Календарь</span>

                        <button
                            id="clearcalendar"
                            type="button"
                            class="af-calendar-btn af-calendar-btn--icon"
                            title="Очистить"
                        >🧹</button>

                        <button
                            id="refreshcalendar"
                            type="button"
                            class="af-calendar-btn af-calendar-btn--icon"
                            title="Обновить"
                        >♻️</button>

                        <button
                            id="opendatsy"
                            type="button"
                            class="af-calendar-btn"
                        >Datsy ↗</button>

                        <label class="af-calendar-auto" title="Автообновление календаря">
                            <input
                                id="autorefreshswitcher"
                                type="checkbox"
                            >
                            Авто
                        </label>

                        <span class="af-calendar-spacer"></span>

                        <button
                            id="showOperActiveSlots"
                            type="button"
                            class="af-calendar-btn af-calendar-btn--primary"
                        >
                            Мои слоты
                            <span
                                id="availableActiveSlots"
                                style="display:none"
                            >●</span>
                        </button>
                    </div>

                    <div class="af-calendar-nav">
                        <button
                            id="prevDay"
                            type="button"
                            class="af-calendar-btn af-calendar-btn--icon"
                            title="Предыдущий день"
                        >◀</button>

                        <input
                            id="eventDate"
                            type="date"
                            class="af-calendar-input af-calendar-date"
                            aria-label="Дата календаря"
                        >

                        <button
                            id="nextDay"
                            type="button"
                            class="af-calendar-btn af-calendar-btn--icon"
                            title="Следующий день"
                        >▶</button>

                        <button
                            id="nowDay"
                            type="button"
                            class="af-calendar-btn"
                        >Сегодня</button>

                        <input
                            id="datenowtime"
                            type="text"
                            class="af-calendar-input af-calendar-clock"
                            readonly
                            title="Время последнего обновления (МСК)"
                            aria-label="Время обновления по Москве"
                        >

                        <span class="af-calendar-timezone" title="Время слотов — московское, UTC+3">
                            МСК
                        </span>
                    </div>

                    <div
                        id="outputcalendarfield"
                        class="af-calendar-slots"
                    ></div>
                </div>
            </section>

            <section
                id="operatorActiveSlots"
                class="af-calendar-side chmaf-drag-handle"
                style="display:none"
            ></section>
        </div>
    `;

    // Клик по полосе прокрутки панели — это прокрутка, а не перетаскивание окна
    function guardScrollbarDrag(event) {
        const el = event.currentTarget;
        const scrollbarWidth = el.offsetWidth - el.clientWidth;
        if (scrollbarWidth > 0 && event.offsetX >= el.clientWidth) {
            event.stopPropagation();
        }
    }

    const calendarWindow = createWindow(
        'AF_Calendar',
        'winTopCalendar',
        'winLeftCalendar',
        markup
    );

    if (!calendarWindow) {
        console.error('[Calendar] Не удалось создать окно');
        return;
    }

    calendarWindow
        .querySelectorAll('.af-calendar-scroll, .af-calendar-side')
        .forEach(panel => panel.addEventListener('mousedown', guardScrollbarDrag, true));

    const $ = id =>
        calendarWindow.querySelector(`#${id}`);

    const ui = {
        slotList: $('slotList'),
        hideSlot: $('hideSlot'),
        chosenSlot: $('chosenSlot'),
        slotData: $('slotData'),

        date: $('eventDate'),
        updatedAt: $('datenowtime'),
        output: $('outputcalendarfield'),

        myPanel: $('operatorActiveSlots'),
        myBadge: $('availableActiveSlots'),
        myButton: $('showOperActiveSlots'),

        autoRefresh: $('autorefreshswitcher'),
        refresh: $('refreshcalendar'),

        previous: $('prevDay'),
        next: $('nextDay'),
        today: $('nowDay'),

        close: $('hidecalendar'),
        clear: $('clearcalendar'),
        openDatsy: $('opendatsy')
    };

    if (Object.values(ui).some(value => !value)) {
        console.error('[Calendar] Не найдены элементы окна');
        return;
    }

    // ============================================================
    // ОБЩИЕ ФУНКЦИИ
    // ============================================================

    function notify(message, type = 'message') {
        if (typeof createAndShowButton === 'function') {
            createAndShowButton(message, type);
        } else {
            window.showCustomAlert?.(message, type);
        }
    }

    function notifyError(error) {
        console.error('[Calendar]', error);

        const now = Date.now();

        if (now - state.lastErrorNoticeAt < 60_000) {
            return;
        }

        state.lastErrorNoticeAt = now;

        notify(
            `Ошибка Datsy: ${error.message}`,
            'error'
        );
    }

    function dateIsValid(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
            return false;
        }

        const date = new Date(`${value}T00:00:00Z`);

        return (
            !Number.isNaN(date.getTime()) &&
            date.toISOString().slice(0, 10) === value
        );
    }

    function timeIsValid(value) {
        return /^([01]\d|2[0-3]):[0-5]\d$/.test(
            value || ''
        );
    }

    function moscowNow() {
        const parts = new Intl.DateTimeFormat(
            'en-GB',
            {
                timeZone: 'Europe/Moscow',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hourCycle: 'h23'
            }
        ).formatToParts(new Date());

        const data = Object.fromEntries(
            parts.map(part => [
                part.type,
                part.value
            ])
        );

        return {
            date:
                `${data.year}-${data.month}-${data.day}`,

            time:
                `${data.hour}:${data.minute}`
        };
    }

    function shiftDate(value, offset) {
        if (!dateIsValid(value)) {
            return moscowNow().date;
        }

        const date = new Date(`${value}T00:00:00Z`);

        date.setUTCDate(
            date.getUTCDate() + offset
        );

        return date.toISOString().slice(0, 10);
    }

    function formattedDate(value) {
        if (!dateIsValid(value)) return value;

        const [year, month, day] = value.split('-');

        return `${day}-${month}-${year}`;
    }

    /**
     * Дата и время слота приходят в московском времени.
     *
     * Например, 2026-09-29 17:40 МСК — это
     * 2026-09-29 14:40 UTC.
     */
    function slotStartTimestamp(date, time) {
        if (!dateIsValid(date) || !timeIsValid(time)) {
            return NaN;
        }

        const timestamp = Date.parse(
            `${date}T${time}:00+03:00`
        );

        return Number.isFinite(timestamp)
            ? timestamp
            : NaN;
    }

    /**
     * true, если новый слот уже нельзя занимать:
     * до начала осталось ровно 5 минут или меньше.
     */
    function bookingIsClosed(date, time) {
        const startsAt = slotStartTimestamp(
            date,
            time
        );

        if (!Number.isFinite(startsAt)) {
            return true;
        }

        return (
            startsAt - Date.now() <=
            BOOKING_CUTOFF_MS
        );
    }

    function isVisible() {
        return (
            calendarWindow.isConnected &&
            getComputedStyle(calendarWindow).display !==
            'none'
        );
    }

    function showMessage(
        container,
        message,
        error = false
    ) {
        container.replaceChildren();

        const element = document.createElement('div');

        element.className =
            'af-calendar-empty' +
            (error ? ' af-calendar-error' : '');

        element.textContent = message;

        container.appendChild(element);
    }

    function responseJson(response) {
        const raw =
            response?.fetchAnswer ??
            response?.fetchansver;

        if (raw == null) {
            throw new Error('Пустой ответ Datsy');
        }

        if (typeof raw === 'object') {
            return raw;
        }

        try {
            return JSON.parse(raw);
        } catch {
            throw new Error('Некорректный JSON Datsy');
        }
    }

    function sendMessage(message, timeoutMs = 10000) {
        return new Promise((resolve, reject) => {
            if (!globalThis.chrome?.runtime?.sendMessage) {
                reject(
                    new Error('API расширения недоступно')
                );
                return;
            }

            let completed = false;

            const timeoutId = setTimeout(() => {
                if (completed) return;

                completed = true;

                reject(
                    new Error('Нет ответа от расширения')
                );
            }, timeoutMs);

            try {
                chrome.runtime.sendMessage(
                    message,
                    response => {
                        if (completed) return;

                        completed = true;
                        clearTimeout(timeoutId);

                        const error = chrome.runtime.lastError;

                        if (error) {
                            reject(new Error(error.message));
                        } else if (!response?.success) {
                            reject(
                                new Error(
                                    response?.error ||
                                    'Запрос завершился с ошибкой'
                                )
                            );
                        } else {
                            resolve(response);
                        }
                    }
                );
            } catch (error) {
                if (completed) return;

                completed = true;
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    function request(path, options = { method: 'GET' }) {
        return sendMessage(
            {
                action: 'getFetchRequest',
                fetchURL: `https://datsy.ru${path}`,
                requestOptions: {
                    credentials: 'include',
                    ...options
                }
            },
            path === '/api/auth/check.php'
                ? 8000
                : 23000
        );
    }

    function openDatsyLoginTab() {
        return sendMessage(
            { action: 'openDatsyLoginTab' },
            8000
        );
    }

    function postForm(path, values) {
        return request(
            path,
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type':
                        'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(values).toString()
            }
        );
    }

    async function copyText(value) {
        if (typeof copyToClipboard === 'function') {
            await copyToClipboard(value);
            return;
        }

        if (!navigator.clipboard?.writeText) {
            throw new Error('Буфер обмена недоступен');
        }

        await navigator.clipboard.writeText(value);
    }

    function detectOperator() {
        state.operatorNames.clear();

        const raw = document
            .querySelector('.user_menu-dropdown-user_name')
            ?.textContent
            ?.trim() || '';

        const name = raw.includes('-')
            ? raw.split('-').slice(1).join('-').trim()
            : raw;

        if (!name) return;

        const normalized =
            name.replace(/\s+/g, ' ').trim();

        const reverse =
            normalized.split(' ').reverse().join(' ');

        state.operatorNames.add(
            normalized.toLocaleLowerCase('ru-RU')
        );

        state.operatorNames.add(
            reverse.toLocaleLowerCase('ru-RU')
        );
    }

    function isMyEvent(event) {
        const name = String(event?.createdBy || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleLowerCase('ru-RU');

        return Boolean(
            name &&
            state.operatorNames.has(name)
        );
    }

    function selectedSlot() {
        if (!state.selectedKey) return null;

        const [date, time] =
            state.selectedKey.split('|');

        return { date, time };
    }

    function closeEditor() {
        state.selectedKey = null;
        state.selectedElement = null;
        state.dirty = false;

        ui.slotList.style.display = 'none';
        ui.slotData.replaceChildren();

        ui.output
            .querySelectorAll('.is-selected')
            .forEach(element => {
                element.classList.remove('is-selected');
            });
    }

    /**
     * Обновляет доступность создания без перерисовки
     * календаря и без потери текста в input.
     */
    function updateBookingAvailability() {
        if (!isVisible()) return;

        for (
            const slotButton of ui.output.querySelectorAll(
                'button[name="slotRow"]'
            )
        ) {
            const closed = bookingIsClosed(
                slotButton.dataset.date,
                slotButton.dataset.time
            );

            slotButton.classList.toggle(
                'is-booking-closed',
                closed
            );

            slotButton.title = closed
                ? 'Новые события: создание закрыто за 5 минут до начала. Существующие события можно открыть.'
                : '';
        }

        const slot = selectedSlot();

        if (!slot) return;

        const closed = bookingIsClosed(
            slot.date,
            slot.time
        );

        for (
            const row of ui.slotData.querySelectorAll(
                '.af-calendar-slot-row'
            )
        ) {
            const input = row.querySelector(
                'input[name="slotInfo"]'
            );

            const save = row.querySelector(
                'button[name="saveToCalend"]'
            );

            const remove = row.querySelector(
                'button[name="deleteFromCalend"]'
            );

            if (!input || !save) continue;

            const existingEvent =
                Boolean(input.dataset.eventId);

            // Редактирование существующего события
            // не блокируем по времени.
            save.disabled =
                state.mutationRunning ||
                (!existingEvent && closed);

            save.title =
                !existingEvent && closed
                    ? 'Нельзя занять слот: до начала осталось 5 минут или меньше'
                    : 'Сохранить';

            if (remove) {
                remove.disabled =
                    state.mutationRunning ||
                    !existingEvent;
            }
        }
    }

    function stopAutoRefresh() {
        if (state.refreshInterval != null) {
            clearInterval(state.refreshInterval);
            state.refreshInterval = null;
        }
    }

    function startAutoRefresh() {
        stopAutoRefresh();

        if (!isVisible() || !ui.autoRefresh.checked) {
            return;
        }

        state.refreshInterval = setInterval(() => {
            if (
                !isVisible() ||
                state.dirty ||
                state.mutationRunning ||
                state.authRunning
            ) {
                return;
            }

            // Таймер не проверяет авторизацию
            // и не открывает вкладки.
            void loadSlots({ silent: true });
        }, 30000);
    }

    function stopBookingTimer() {
        if (state.bookingInterval != null) {
            clearInterval(state.bookingInterval);
            state.bookingInterval = null;
        }
    }

    function startBookingTimer() {
        stopBookingTimer();

        if (!isVisible()) return;

        updateBookingAvailability();

        // Обновляем кнопки без запроса к Datsy.
        state.bookingInterval = setInterval(
            updateBookingAvailability,
            10000
        );
    }

    function hideCalendar() {
        calendarWindow.style.display = 'none';

        document
            .getElementById('datsyCalendar')
            ?.classList.remove('active');

        state.requestVersion++;

        stopAutoRefresh();
        stopBookingTimer();
        closeEditor();
    }

    // ============================================================
    // АВТОРИЗАЦИЯ
    // ============================================================

    async function checkAuth() {
        try {
            const response = await request(
                '/api/auth/check.php'
            );

            const data = responseJson(response);

            const status = String(
                data?.['value-status'] ?? ''
            )
                .trim()
                .toLocaleLowerCase('ru-RU');

            console.log(
                '[Calendar] Статус Datsy:',
                status || '(пустой)'
            );

            if (status === 'не авторизован') {
                state.authenticated = false;
                return false;
            }

            if (!status) {
                throw new Error(
                    'Ответ проверки не содержит value-status'
                );
            }

            state.authenticated = true;
            return true;
        } catch (error) {
            state.authenticated = null;
            notifyError(error);
            return false;
        }
    }

    async function refreshWithAuth() {
        if (state.authRunning) return;

        if (state.dirty) {
            notify(
                'Сначала сохраните изменения в слоте.',
                'warning'
            );
            return;
        }

        state.authRunning = true;

        const version = state.requestVersion;

        try {
            const authorized = await checkAuth();

            if (
                !isVisible() ||
                version !== state.requestVersion
            ) {
                return;
            }

            if (authorized) {
                await loadSlots();
                return;
            }

            if (state.authenticated === false) {
                showMessage(
                    ui.output,
                    'Для загрузки календаря войдите на datsy.ru.',
                    true
                );

                notify(
                    'Вы не авторизованы на Datsy. Открываю сайт для входа.',
                    'warning'
                );
            } else {
                showMessage(
                    ui.output,
                    'Не удалось проверить доступ к Datsy.',
                    true
                );

                notify(
                    'Проверка Datsy завершилась ошибкой. Открываю сайт для проверки входа.',
                    'warning'
                );
            }

            // Только ручное открытие календаря или
            // ручное нажатие «Обновить».
            try {
                await openDatsyLoginTab();
            } catch (error) {
                console.error(
                    '[Calendar] Не удалось открыть вкладку:',
                    error
                );

                notify(
                    `Не удалось открыть Datsy: ${error.message}`,
                    'error'
                );
            }
        } finally {
            state.authRunning = false;
        }
    }

    // ============================================================
    // ЗАГРУЗКА И ОТРИСОВКА
    // ============================================================

    function readCalendar(data, date) {
        if (
            !data?.DataTimeSlot ||
            typeof data.DataTimeSlot !== 'object'
        ) {
            throw new Error('В ответе нет DataTimeSlot');
        }

        const events = [];
        const myEvents = [];
        const slots = [];

        const entries = Object.entries(
            data.DataTimeSlot
        )
            .filter(
                ([time]) =>
                    timeIsValid(time) &&
                    !HIDDEN_TIMES.has(time)
            )
            .sort(
                ([a], [b]) => a.localeCompare(b)
            );

        for (const [time, slotData] of entries) {
            if (
                !slotData ||
                typeof slotData !== 'object'
            ) {
                continue;
            }

            const countSlots = Math.max(
                0,
                Math.min(
                    100,
                    Number.parseInt(
                        slotData.CountSlot,
                        10
                    ) || 0
                )
            );

            const rawList = slotData.EventList;

            const list = Array.isArray(rawList)
                ? rawList
                : rawList &&
                    typeof rawList === 'object'
                    ? Object.values(rawList)
                    : [];

            let hasMyEvent = false;

            for (const item of list) {
                if (!item || typeof item !== 'object') {
                    continue;
                }

                const event = {
                    eventId: item.id == null
                        ? null
                        : String(item.id),

                    eventText: String(item.text ?? ''),

                    slotTime: timeIsValid(item.slot)
                        ? item.slot
                        : time,

                    slotDate: dateIsValid(
                        item.new_date_slot
                    )
                        ? item.new_date_slot
                        : date,

                    createdBy: String(
                        item.created_by_name ?? ''
                    )
                };

                events.push(event);

                if (isMyEvent(event)) {
                    hasMyEvent = true;
                    myEvents.push(event);
                }
            }

            slots.push({
                time,
                countSlots,

                countEvents: Math.max(
                    list.length,
                    Number.parseInt(
                        slotData.CountEvent,
                        10
                    ) || 0
                ),

                hasMyEvent
            });
        }

        return { events, myEvents, slots };
    }

    function renderSlots(slots, date) {
        ui.output.replaceChildren();

        if (!slots.length) {
            closeEditor();

            showMessage(
                ui.output,
                'На выбранную дату слотов нет.'
            );

            return;
        }

        const now = moscowNow();

        const fragment =
            document.createDocumentFragment();

        for (const slot of slots) {
            const isPast =
                date < now.date ||
                (
                    date === now.date &&
                    slot.time <= now.time
                );

            const free =
                slot.countSlots > 0 &&
                slot.countEvents < slot.countSlots;

            const button =
                document.createElement('button');

            button.type = 'button';
            button.name = 'slotRow';

            button.className =
                'af-calendar-slot ' +
                (
                    isPast
                        ? 'af-slot-past'
                        : free
                            ? 'af-slot-free'
                            : 'af-slot-full'
                );

            button.textContent = slot.time;
            button.dataset.time = slot.time;
            button.dataset.date = date;

            button.dataset.length =
                String(slot.countSlots);

            button.dataset.rawtext =
                `${slot.time} ${date}`;

            if (slot.hasMyEvent) {
                button.classList.add('is-mine');
            }

            fragment.appendChild(button);
        }

        ui.output.appendChild(fragment);

        const selected = selectedSlot();

        if (selected?.date === date) {
            const matching = [
                ...ui.output.querySelectorAll(
                    '[name="slotRow"]'
                )
            ].find(
                button =>
                    button.dataset.time ===
                    selected.time
            );

            if (matching) {
                openSlot(matching);
            } else {
                closeEditor();
            }
        } else {
            closeEditor();
        }

        updateBookingAvailability();
    }

    async function loadSlots({
        silent = false,
        discardChanges = false
    } = {}) {
        if (!isVisible() || state.mutationRunning) {
            return;
        }

        if (state.dirty && !discardChanges) {
            if (!silent) {
                notify(
                    'Сначала сохраните изменения в слоте.',
                    'warning'
                );
            }

            return;
        }

        const date = ui.date.value;

        if (!dateIsValid(date)) {
            notify(
                'Выберите корректную дату.',
                'warning'
            );
            return;
        }

        const version = ++state.requestVersion;

        if (!silent) {
            showMessage(
                ui.output,
                'Загрузка слотов…'
            );
        }

        try {
            const response = await request(
                `/api/main-events/?date=${encodeURIComponent(date)
                }`
            );

            if (
                version !== state.requestVersion ||
                !isVisible() ||
                ui.date.value !== date ||
                (state.dirty && !discardChanges)
            ) {
                return;
            }

            const parsed = readCalendar(
                responseJson(response),
                date
            );

            state.events = parsed.events;
            state.myEvents = parsed.myEvents;

            renderSlots(parsed.slots, date);
            renderMySlots();

            ui.updatedAt.value = moscowNow().time;
        } catch (error) {
            if (
                version !== state.requestVersion ||
                !isVisible()
            ) {
                return;
            }

            notifyError(error);

            if (!silent) {
                showMessage(
                    ui.output,
                    'Не удалось загрузить слоты.',
                    true
                );
            }
        }
    }

    function openSlot(button) {
        if (
            state.dirty &&
            state.selectedElement !== button
        ) {
            if (
                !confirm(
                    'Отменить несохранённые изменения?'
                )
            ) {
                return;
            }
        }

        state.dirty = false;

        ui.output
            .querySelectorAll('.is-selected')
            .forEach(element => {
                element.classList.remove('is-selected');
            });

        button.classList.add('is-selected');

        state.selectedElement = button;

        const time = button.dataset.time;
        const date = button.dataset.date;

        state.selectedKey = `${date}|${time}`;

        ui.slotList.style.display = 'block';

        ui.chosenSlot.textContent =
            `${time} · ${formattedDate(date)}`;

        ui.chosenSlot.dataset.copyValue =
            `${formattedDate(date)} ${time}`;

        ui.slotData.replaceChildren();

        const events = state.events.filter(
            event =>
                event.slotTime === time &&
                event.slotDate === date
        );

        const count =
            Number.parseInt(
                button.dataset.length,
                10
            ) || 0;

        const rowCount = Math.max(
            count,
            events.length
        );

        if (!rowCount) {
            showMessage(
                ui.slotData,
                'Для этого времени нет мест.'
            );
            return;
        }

        const fragment =
            document.createDocumentFragment();

        for (let index = 0; index < rowCount; index++) {
            const event = events[index] || null;

            const row =
                document.createElement('div');

            row.className =
                'af-calendar-slot-row';

            if (event) {
                row.classList.add('is-occupied');

                if (isMyEvent(event)) {
                    row.classList.add('is-mine');
                }
            }

            const number =
                document.createElement('span');

            number.className =
                'af-calendar-slot-num';

            number.textContent =
                String(index + 1);

            const input =
                document.createElement('input');

            input.type = 'text';
            input.name = 'slotInfo';
            input.className = 'af-calendar-input';
            input.placeholder = 'Пустой слот…';
            input.value = event?.eventText || '';

            input.dataset.eventId =
                event?.eventId || '';

            input.title = event?.eventText || '';

            const save =
                document.createElement('button');

            save.type = 'button';
            save.name = 'saveToCalend';
            save.className = 'af-calendar-btn';
            save.title = 'Сохранить';
            save.textContent = '✓';

            const remove =
                document.createElement('button');

            remove.type = 'button';
            remove.name = 'deleteFromCalend';

            remove.className =
                'af-calendar-btn af-calendar-btn--danger';

            remove.title = 'Удалить';
            remove.textContent = '×';
            remove.disabled = !event?.eventId;

            row.append(
                number,
                input,
                save,
                remove
            );

            fragment.appendChild(row);
        }

        ui.slotData.appendChild(fragment);

        updateBookingAvailability();
    }

    function renderMySlots() {
        ui.myPanel.replaceChildren();

        const header =
            document.createElement('div');

        header.className =
            'af-calendar-side-header';

        const title =
            document.createElement('span');

        title.className =
            'af-calendar-title';

        title.textContent = 'Мои слоты';

        const count =
            document.createElement('span');

        count.className =
            'af-calendar-muted';

        count.textContent =
            String(state.myEvents.length);

        header.append(title, count);
        ui.myPanel.appendChild(header);

        ui.myBadge.style.display =
            state.myEvents.length ? '' : 'none';

        if (!state.myEvents.length) {
            showMessage(
                ui.myPanel,
                'За выбранный день занятых вами слотов нет.'
            );
            return;
        }

        for (const event of state.myEvents) {
            const row =
                document.createElement('div');

            row.className =
                'af-calendar-my-row';

            const time =
                document.createElement('span');

            time.className =
                'af-calendar-my-time';

            time.textContent = event.slotTime;

            const id =
                document.createElement('input');

            id.className =
                'af-calendar-input af-calendar-my-id';

            id.name = 'slotToDelete';
            id.readOnly = true;

            id.value =
                event.eventText.match(
                    /\d{4,9}/
                )?.[0] || '';

            id.title = event.eventText;
            id.dataset.id = event.eventId || '';

            const status =
                document.createElement('span');

            status.className =
                'af-calendar-status';

            status.textContent =
                /бронь/i.test(event.eventText)
                    ? 'Бронь'
                    : 'Слот';

            const remove =
                document.createElement('button');

            remove.type = 'button';
            remove.name = 'deleMySlot';

            remove.className =
                'af-calendar-btn af-calendar-btn--danger';

            remove.textContent = '×';
            remove.title = 'Удалить мой слот';

            remove.dataset.eventId =
                event.eventId || '';

            remove.disabled = !event.eventId;

            row.append(
                time,
                id,
                status,
                remove
            );

            ui.myPanel.appendChild(row);
        }
    }

    // ============================================================
    // ИЗМЕНЕНИЕ ДАННЫХ
    // ============================================================

    async function mutate(action) {
        if (state.mutationRunning) return false;

        state.mutationRunning = true;
        state.requestVersion++;

        updateBookingAvailability();

        const mySlotButtons = [
            ...ui.myPanel.querySelectorAll(
                'button[name="deleMySlot"]'
            )
        ];

        mySlotButtons.forEach(button => {
            button.disabled = true;
        });

        try {
            await action();

            state.dirty = false;

            notify(
                'Изменения сохранены.',
                'message'
            );

            return true;
        } catch (error) {
            if (error?.code === 'BOOKING_CLOSED') {
                notify(error.message, 'warning');
            } else {
                console.error(
                    '[Calendar] Не удалось изменить слот:',
                    error
                );

                notify(
                    `Не удалось изменить слот: ${error.message}`,
                    'error'
                );
            }

            return false;
        } finally {
            state.mutationRunning = false;

            mySlotButtons.forEach(button => {
                if (button.isConnected) {
                    button.disabled = false;
                }
            });

            updateBookingAvailability();
        }
    }

    async function saveSlot(input) {
        const slot = selectedSlot();

        if (!slot || state.mutationRunning) return;

        const text = input.value.trim();
        const eventId = input.dataset.eventId;

        if (!text) {
            notify('Введите текст слота.', 'warning');
            input.focus();
            return;
        }

        if (eventId && !/^\d+$/.test(eventId)) {
            notify(
                'Некорректный ID события.',
                'error'
            );
            return;
        }

        // Первая проверка сразу при нажатии.
        if (
            !eventId &&
            bookingIsClosed(slot.date, slot.time)
        ) {
            updateBookingAvailability();

            notify(
                'Нельзя занять слот: до начала осталось 5 минут или меньше.',
                'warning'
            );

            return;
        }

        const success = await mutate(() => {
            if (eventId) {
                // Существующее событие редактировать
                // разрешено независимо от времени.
                return postForm(
                    '/api/slot-event/save.php',
                    {
                        'event-text': text,
                        'save-slot': eventId
                    }
                );
            }

            // Повторная проверка непосредственно перед
            // вызовом API создания события.
            if (bookingIsClosed(slot.date, slot.time)) {
                const error = new Error(
                    'Нельзя занять слот: до начала осталось 5 минут или меньше.'
                );

                error.code = 'BOOKING_CLOSED';
                throw error;
            }

            return postForm(
                '/api/slot-event/add.php',
                {
                    addinput: text,
                    slotname: slot.time,
                    date: slot.date
                }
            );
        });

        if (success) {
            await loadSlots({
                discardChanges: true
            });
        }
    }

    async function deleteSlot(eventId) {
        if (!/^\d+$/.test(String(eventId || ''))) {
            notify(
                'Некорректный ID события.',
                'error'
            );
            return;
        }

        if (state.mutationRunning) return;

        if (!confirm('Удалить этот слот?')) return;

        const rawReason = prompt(
            'Укажите причину удаления:'
        );

        if (rawReason === null) return;

        const reason = rawReason.trim();

        if (!reason) {
            notify(
                'Укажите причину удаления.',
                'warning'
            );
            return;
        }

        const success = await mutate(
            () => postForm(
                '/api/slot-event/delete.php',
                {
                    deleteslot: eventId,
                    reason
                }
            )
        );

        if (success) {
            await loadSlots({
                discardChanges: true
            });
        }
    }

    // ============================================================
    // ОТКРЫТИЕ И СОБЫТИЯ
    // ============================================================

    async function getdatsyCalendarButtonPress() {
        if (isVisible()) {
            hideCalendar();
            return;
        }

        detectOperator();

        ui.date.value = moscowNow().date;

        try {
            ui.autoRefresh.checked =
                localStorage.getItem(
                    'refreshCalend'
                ) !== '0';
        } catch {
            ui.autoRefresh.checked = true;
        }

        calendarWindow.style.display = 'block';

        document
            .getElementById('datsyCalendar')
            ?.classList.add('active');

        showMessage(
            ui.output,
            'Проверка доступа к Datsy…'
        );

        startBookingTimer();

        try {
            await refreshWithAuth();
        } catch (error) {
            notifyError(error);
        } finally {
            startAutoRefresh();
        }
    }

    window.getdatsyCalendarButtonPress =
        getdatsyCalendarButtonPress;

    ui.output.addEventListener('click', event => {
        const button = event.target.closest(
            '[name="slotRow"]'
        );

        if (button && ui.output.contains(button)) {
            openSlot(button);
        }
    });

    ui.slotData.addEventListener('input', event => {
        if (
            event.target.matches(
                'input[name="slotInfo"]'
            )
        ) {
            state.dirty = true;
        }
    });

    ui.slotData.addEventListener('dblclick', event => {
        const input = event.target.closest(
            'input[name="slotInfo"]'
        );

        if (!input) return;

        const match = input.value.match(
            /https?:\/\/[^\s<>"']+/i
        );

        if (!match) return;

        try {
            const url = new URL(match[0]);

            if (
                url.protocol === 'https:' ||
                url.protocol === 'http:'
            ) {
                window.open(
                    url.href,
                    '_blank',
                    'noopener,noreferrer'
                );
            }
        } catch {
            // Некорректную ссылку не открываем.
        }
    });

    ui.slotData.addEventListener('click', event => {
        const button = event.target.closest('button');

        const row = button?.closest(
            '.af-calendar-slot-row'
        );

        const input = row?.querySelector(
            'input[name="slotInfo"]'
        );

        if (!button || !input) return;

        if (button.name === 'saveToCalend') {
            void saveSlot(input);
        } else if (
            button.name === 'deleteFromCalend'
        ) {
            void deleteSlot(
                input.dataset.eventId
            );
        }
    });

    ui.myPanel.addEventListener('click', event => {
        const button = event.target.closest(
            'button[name="deleMySlot"]'
        );

        if (button) {
            void deleteSlot(
                button.dataset.eventId
            );
        }
    });

    ui.chosenSlot.addEventListener(
        'click',
        async () => {
            const value =
                ui.chosenSlot.dataset.copyValue;

            if (!value) return;

            try {
                await copyText(value);

                notify(
                    'Дата и время скопированы.',
                    'message'
                );
            } catch (error) {
                notify(
                    `Не удалось скопировать: ${error.message}`,
                    'error'
                );
            }
        }
    );

    ui.hideSlot.addEventListener('click', () => {
        if (
            state.dirty &&
            !confirm(
                'Отменить несохранённые изменения?'
            )
        ) {
            return;
        }

        closeEditor();
    });

    function changeDate(amount) {
        if (
            state.dirty &&
            !confirm(
                'Отменить несохранённые изменения?'
            )
        ) {
            return;
        }

        ui.date.value = shiftDate(
            ui.date.value,
            amount
        );

        closeEditor();
        state.requestVersion++;

        void loadSlots();
    }

    ui.date.addEventListener('change', () => {
        if (
            state.dirty &&
            !confirm(
                'Отменить несохранённые изменения?'
            )
        ) {
            const selected = selectedSlot();

            if (selected) {
                ui.date.value = selected.date;
            }

            return;
        }

        closeEditor();
        state.requestVersion++;

        void loadSlots();
    });

    ui.previous.addEventListener(
        'click',
        () => changeDate(-1)
    );

    ui.next.addEventListener(
        'click',
        () => changeDate(1)
    );

    ui.today.addEventListener('click', () => {
        if (
            state.dirty &&
            !confirm(
                'Отменить несохранённые изменения?'
            )
        ) {
            return;
        }

        ui.date.value = moscowNow().date;

        closeEditor();
        state.requestVersion++;

        void loadSlots();
    });

    ui.autoRefresh.addEventListener(
        'change',
        () => {
            try {
                localStorage.setItem(
                    'refreshCalend',
                    ui.autoRefresh.checked
                        ? '1'
                        : '0'
                );
            } catch (error) {
                console.warn(
                    '[Calendar] Не сохранена настройка:',
                    error
                );
            }

            startAutoRefresh();
        }
    );

    ui.close.addEventListener(
        'click',
        hideCalendar
    );

    ui.clear.addEventListener('click', () => {
        if (
            state.dirty &&
            !confirm(
                'Очистить несохранённые изменения?'
            )
        ) {
            return;
        }

        state.requestVersion++;
        closeEditor();

        state.events = [];
        state.myEvents = [];

        ui.output.replaceChildren();
        ui.myPanel.replaceChildren();

        ui.myBadge.style.display = 'none';
        ui.updatedAt.value = '';
    });

    ui.refresh.addEventListener('click', () => {
        void refreshWithAuth().catch(
            notifyError
        );
    });

    ui.openDatsy.addEventListener('click', () => {
        window.open(
            DATSY_URL,
            '_blank',
            'noopener,noreferrer'
        );
    });

    ui.myButton.addEventListener('click', () => {
        const visible =
            getComputedStyle(ui.myPanel).display !==
            'none';

        ui.myPanel.style.display =
            visible ? 'none' : 'block';

        ui.myButton.classList.toggle(
            'is-active',
            !visible
        );

        if (!visible) {
            renderMySlots();
        }
    });

    let wasVisible = isVisible();

    const observer = new MutationObserver(() => {
        const visible = isVisible();

        if (visible === wasVisible) return;

        wasVisible = visible;

        if (visible) {
            startBookingTimer();
            startAutoRefresh();
        } else {
            state.requestVersion++;

            stopAutoRefresh();
            stopBookingTimer();

            document
                .getElementById('datsyCalendar')
                ?.classList.remove('active');
        }
    });

    observer.observe(
        calendarWindow,
        {
            attributes: true,
            attributeFilter: ['style', 'class']
        }
    );

    window.addEventListener(
        'beforeunload',
        () => {
            stopAutoRefresh();
            stopBookingTimer();
            observer.disconnect();
        },
        { once: true }
    );

    window.__chmafCalendarInitialized = true;

    console.log('[Calendar] Модуль инициализирован');
})();