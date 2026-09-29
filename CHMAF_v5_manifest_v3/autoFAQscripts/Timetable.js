// ============================================================
// ChMAF — Timetable UI
// ============================================================

var win_TimetableUI = `
<style>
#AF_TimetableUI .tt-container {
    --tt-bg: #111827;
    --tt-surface: #1a2537;
    --tt-surface-hover: #23334b;
    --tt-input: #0d1625;
    --tt-border: #35445e;
    --tt-text: #f0f4fc;
    --tt-muted: #a0afc6;
    --tt-subtle: #8191aa;
    --tt-accent: #839eff;
    --tt-accent-soft: rgba(131, 158, 255, .15);

    box-sizing: border-box;
    position: relative;
    width: min(920px, calc(100vw - 24px));
    max-width: 100%;
    overflow: hidden;
    color: var(--tt-text);
    background:
        radial-gradient(
            circle at 90% 0%,
            rgba(123, 111, 229, .13),
            transparent 38%
        ),
        var(--tt-bg);
    border: 1px solid var(--tt-border);
    border-radius: 17px;
    box-shadow:
        0 24px 70px rgba(3, 8, 20, .52),
        inset 0 1px rgba(255, 255, 255, .06);
    font: 13px/1.45 Inter, -apple-system, BlinkMacSystemFont,
        "Segoe UI", sans-serif;
}

#AF_TimetableUI .tt-container *,
#AF_TimetableUI .tt-container *::before,
#AF_TimetableUI .tt-container *::after {
    box-sizing: border-box;
}

#AF_TimetableUI .tt-container button,
#AF_TimetableUI .tt-container input {
    font: inherit;
}

#AF_TimetableUI .tt-container button:focus-visible,
#AF_TimetableUI .tt-container input:focus-visible {
    outline: 2px solid var(--tt-accent);
    outline-offset: 2px;
}

#AF_TimetableUI .tt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 59px;
    padding: 12px 18px;
    border-bottom: 1px solid var(--tt-border);
    cursor: move;
}

#AF_TimetableUI .tt-title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
    font-size: 15px;
    font-weight: 750;
}

#AF_TimetableUI .tt-title::before {
    content: "";
    flex: 0 0 8px;
    width: 8px;
    height: 8px;
    background: #947ff2;
    border-radius: 50%;
    box-shadow: 0 0 12px rgba(148, 127, 242, .5);
}

#AF_TimetableUI #inputTeachInfo {
    color: #b8c8ff;
    font-size: 12px;
    font-weight: 600;
    overflow-wrap: anywhere;
}

#AF_TimetableUI .tt-btn,
#AF_TimetableUI .tt-arrow {
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    width: 35px;
    height: 35px;
    padding: 0;
    color: #d4def0;
    background: var(--tt-surface);
    border: 1px solid var(--tt-border);
    border-radius: 9px;
    cursor: pointer;
    transition: background-color .16s, border-color .16s;
}

#AF_TimetableUI .tt-btn:hover,
#AF_TimetableUI .tt-arrow:hover {
    background: var(--tt-surface-hover);
    border-color: var(--tt-accent);
}

#AF_TimetableUI #hideshowtimetable:hover {
    color: #ffb1bf;
    border-color: #dd7488;
}

#AF_TimetableUI .tt-input-group {
    display: flex;
    flex-direction: column;
    gap: 11px;
    padding: 15px 18px;
}

#AF_TimetableUI .tt-week-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 0;
    padding: 7px;
    background: rgba(255, 255, 255, .025);
    border: 1px solid var(--tt-border);
    border-radius: 11px;
}

#AF_TimetableUI .tt-dates-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    min-width: 0;
}

#AF_TimetableUI .tt-date-field {
    display: inline-block;
    min-width: 110px;
    padding: 7px 9px;
    color: var(--tt-text);
    background: var(--tt-input);
    border: 1px solid var(--tt-border);
    border-radius: 8px;
    text-align: center;
    font: 600 12px/1.4 "SFMono-Regular", Consolas, monospace;
}

#AF_TimetableUI .tt-date-sep {
    color: var(--tt-accent);
}

#AF_TimetableUI .tt-input-row {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
}

#AF_TimetableUI .tt-input {
    flex: 1 1 auto;
    width: 100%;
    min-width: 0;
    height: 39px;
    padding: 0 11px;
    color: var(--tt-text);
    background: var(--tt-input);
    border: 1px solid var(--tt-border);
    border-radius: 9px;
    outline: none;
}

#AF_TimetableUI .tt-input::placeholder {
    color: var(--tt-subtle);
}

#AF_TimetableUI .tt-input:focus {
    border-color: var(--tt-accent);
    box-shadow: 0 0 0 3px var(--tt-accent-soft);
}

#AF_TimetableUI #tt-teacher-id {
    flex: 0 0 170px;
}

#AF_TimetableUI #tt-viz-search {
    flex: 1 1 200px;
}

#AF_TimetableUI .tt-btn-primary {
    flex: 0 0 auto;
    min-height: 39px;
    padding: 0 15px;
    color: #fff;
    background: #5b77db;
    border: 1px solid #829af3;
    border-radius: 9px;
    cursor: pointer;
    font-weight: 700 !important;
    box-shadow: 0 5px 16px rgba(65, 90, 197, .22);
    transition: background-color .16s, transform .16s;
}

#AF_TimetableUI .tt-btn-primary:hover:not(:disabled) {
    background: #708beb;
    transform: translateY(-1px);
}

#AF_TimetableUI .tt-btn-primary:disabled {
    opacity: .6;
    cursor: wait;
}

#AF_TimetableUI .tt-result-box {
    max-height: min(510px, 58vh);
    overflow-y: auto;
    padding: 0 18px 18px;
    scrollbar-width: thin;
    scrollbar-color: #52668a transparent;
}

#AF_TimetableUI .tt-list {
    min-width: 0;
}

#AF_TimetableUI .tt-state {
    padding: 24px 14px;
    color: var(--tt-muted);
    text-align: center;
}

#AF_TimetableUI .tt-state--error {
    color: #ffb1bf;
    background: rgba(225, 101, 124, .09);
    border: 1px solid rgba(225, 101, 124, .25);
    border-radius: 10px;
}

#AF_TimetableUI .tt-viz-tabs {
    display: flex;
    gap: 5px;
    margin-bottom: 14px;
    padding: 5px;
    overflow-x: auto;
    background: #172236;
    border: 1px solid var(--tt-border);
    border-radius: 10px;
}

#AF_TimetableUI .tt-viz-tab {
    flex: 0 0 auto;
    padding: 8px 12px;
    color: var(--tt-muted);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 7px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 650;
}

#AF_TimetableUI .tt-viz-tab:hover,
#AF_TimetableUI .tt-viz-tab.active {
    color: #eff3ff;
    background: rgba(131, 158, 255, .14);
    border-color: rgba(131, 158, 255, .3);
}

#AF_TimetableUI .tt-viz-section {
    display: none;
}

#AF_TimetableUI .tt-viz-section.active {
    display: block;
}

#AF_TimetableUI .tt-viz-day-group {
    margin-bottom: 16px;
}

#AF_TimetableUI .tt-viz-day-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0 8px;
    padding: 7px 10px;
    color: var(--tt-muted);
    background: #172235;
    border: 1px solid var(--tt-border);
    border-radius: 8px;
    font-size: 11px;
    font-weight: 750;
    letter-spacing: .045em;
    text-transform: uppercase;
}

#AF_TimetableUI .tt-viz-day-header.today {
    color: #d8ceff;
    background: rgba(145, 118, 229, .14);
    border-color: rgba(145, 118, 229, .42);
}

#AF_TimetableUI .tt-viz-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
    gap: 8px;
}

#AF_TimetableUI .tt-viz-card,
#AF_TimetableUI .tt-viz-slot {
    min-width: 0;
    padding: 10px 12px;
    color: var(--tt-text);
    background: var(--tt-surface);
    border: 1px solid var(--tt-border);
    border-radius: 10px;
}

#AF_TimetableUI .tt-viz-card {
    border-left: 3px solid #697992;
}

#AF_TimetableUI .tt-viz-card:hover,
#AF_TimetableUI .tt-viz-slot:hover {
    background: var(--tt-surface-hover);
}

#AF_TimetableUI .tt-viz-card-time,
#AF_TimetableUI .tt-viz-slot-time {
    margin-bottom: 5px;
    color: var(--tt-muted);
    font-size: 11px;
    font-weight: 650;
}

#AF_TimetableUI .tt-viz-card-student {
    margin-bottom: 7px;
    overflow-wrap: anywhere;
    font-size: 13px;
    font-weight: 750;
}

#AF_TimetableUI .tt-viz-card-meta,
#AF_TimetableUI .tt-viz-slot-types {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

#AF_TimetableUI .tt-viz-badge,
#AF_TimetableUI .tt-viz-slot-type {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    padding: 3px 6px;
    color: #c6d6f7;
    background: #283c5e;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 650;
    overflow-wrap: anywhere;
}

#AF_TimetableUI .tt-viz-badge-status {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 8px;
    padding: 5px 7px;
    text-align: center;
    text-transform: uppercase;
}

#AF_TimetableUI .tt-viz-badge-type {
    color: #96e0e7;
    background: rgba(73, 183, 195, .15);
}

#AF_TimetableUI .tt-viz-badge-mode {
    color: #cfbdff;
    background: rgba(155, 121, 230, .18);
}

#AF_TimetableUI .tt-viz-badge-stk {
    color: #9bdcc7;
    background: rgba(94, 178, 150, .16);
}

#AF_TimetableUI .tt-viz-badge-svc {
    color: #f0aed4;
    background: rgba(211, 111, 166, .15);
}

#AF_TimetableUI .tt-viz-badge-substitute {
    color: #dac4ff;
    background: rgba(155, 121, 230, .2);
}

#AF_TimetableUI .tt-viz-status-success {
    border-left-color: #65c9a6;
}

#AF_TimetableUI .tt-viz-status-success .tt-viz-badge-status {
    color: #9be4cb;
    background: rgba(94, 178, 150, .14);
}

#AF_TimetableUI .tt-viz-status-moved,
#AF_TimetableUI .tt-viz-status-no_status {
    border-left-color: #a58ee7;
}

#AF_TimetableUI .tt-viz-status-moved .tt-viz-badge-status,
#AF_TimetableUI .tt-viz-status-no_status .tt-viz-badge-status {
    color: #d4c3ff;
    background: rgba(155, 121, 230, .16);
}

#AF_TimetableUI .tt-viz-status-removed,
#AF_TimetableUI .tt-viz-status-canceled,
#AF_TimetableUI .tt-viz-status-failed_teacher,
#AF_TimetableUI .tt-viz-status-failed_student,
#AF_TimetableUI .tt-viz-status-running {
    border-left-color: #ed8292;
}

#AF_TimetableUI .tt-viz-status-removed .tt-viz-badge-status,
#AF_TimetableUI .tt-viz-status-canceled .tt-viz-badge-status,
#AF_TimetableUI .tt-viz-status-failed_teacher .tt-viz-badge-status,
#AF_TimetableUI .tt-viz-status-failed_student .tt-viz-badge-status,
#AF_TimetableUI .tt-viz-status-running .tt-viz-badge-status {
    color: #ffc0c8;
    background: rgba(225, 101, 124, .15);
}

#AF_TimetableUI .tt-viz-status-vacation {
    border-left-color: #7facf5;
}

#AF_TimetableUI .tt-viz-status-substitute {
    border-left-color: #b09af5;
}

#AF_TimetableUI .tt-viz-status-vacation .tt-viz-badge-status {
    color: #b7d2ff;
    background: rgba(102, 149, 235, .16);
}

#AF_TimetableUI .tt-viz-status-substitute .tt-viz-badge-status {
    color: #dac4ff;
    background: rgba(155, 121, 230, .17);
}

#AF_TimetableUI .tt-viz-comment {
    margin-top: 7px;
    padding-top: 6px;
    color: var(--tt-muted);
    border-top: 1px solid var(--tt-border);
    font-size: 11px;
    overflow-wrap: anywhere;
}

#AF_TimetableUI .tt-viz-comment.moved-date {
    color: #c6b5f7;
}

#AF_TimetableUI .tt-viz-empty {
    padding: 24px;
    color: var(--tt-muted);
    background: var(--tt-surface);
    border: 1px dashed var(--tt-border);
    border-radius: 10px;
    text-align: center;
}

#AF_TimetableUI .tt-viz-slot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 7px;
}

#AF_TimetableUI .tt-viz-slot-type.blocked {
    color: #ffb1bf;
    background: rgba(225, 101, 124, .15);
}

#AF_TimetableUI .tt-viz-detail {
    margin: 4px 0;
    color: var(--tt-subtle);
    font-size: 11px;
    overflow-wrap: anywhere;
}

#AF_TimetableUI .tt-viz-id {
    color: #91d5ed;
    font-size: 11px;
    font-weight: 650;
}

@media (max-width: 740px) {
    #AF_TimetableUI .tt-input-row {
        flex-wrap: wrap;
    }

    #AF_TimetableUI #tt-teacher-id {
        flex: 1 1 150px;
    }

    #AF_TimetableUI #tt-viz-search {
        flex: 1 1 210px;
    }

    #AF_TimetableUI #tt-load-btn {
        flex: 1 1 100%;
    }
}

@media (max-width: 430px) {
    #AF_TimetableUI .tt-header,
    #AF_TimetableUI .tt-input-group {
        padding-inline: 12px;
    }

    #AF_TimetableUI .tt-result-box {
        padding-inline: 12px;
    }

    #AF_TimetableUI .tt-date-field {
        min-width: 0;
        padding-inline: 5px;
        font-size: 11px;
    }

    #AF_TimetableUI .tt-week-nav {
        gap: 5px;
    }
}

@media (prefers-reduced-motion: reduce) {
    #AF_TimetableUI .tt-container *,
    #AF_TimetableUI .tt-container *::before,
    #AF_TimetableUI .tt-container *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
    }
}
</style>

<div class="tt-container">
    <div class="tt-header chmaf-drag-handle" id="timetable_header">
        <span class="tt-title">
            Расписание
            <span id="inputTeachInfo"></span>
        </span>

        <button class="tt-btn"
                id="hideshowtimetable"
                type="button"
                title="Скрыть"
                aria-label="Скрыть расписание">×</button>
    </div>

    <div class="tt-input-group">
        <div class="tt-week-nav">
            <button class="tt-arrow"
                    id="tt-prev-week"
                    type="button"
                    title="Предыдущая неделя"
                    aria-label="Предыдущая неделя">‹</button>

            <div class="tt-dates-row">
                <span id="tt-date-from" class="tt-date-field">загрузка...</span>
                <span class="tt-date-sep">→</span>
                <span id="tt-date-to" class="tt-date-field">загрузка...</span>
            </div>

            <button class="tt-arrow"
                    id="tt-next-week"
                    type="button"
                    title="Следующая неделя"
                    aria-label="Следующая неделя">›</button>
        </div>

        <div class="tt-input-row">
            <input id="tt-teacher-id"
                   class="tt-input"
                   placeholder="ID преподавателя"
                   autocomplete="off"
                   inputmode="numeric"
                   type="text">

            <input id="tt-viz-search"
                   class="tt-input tt-viz-search"
                   placeholder="Поиск по студенту, группе или статусу"
                   autocomplete="off"
                   type="text">

            <button class="tt-btn-primary"
                    id="tt-load-btn"
                    type="button"
                    title="Загрузить расписание">Загрузить</button>
        </div>
    </div>

    <div class="tt-result-box">
        <div id="tt-result-table" class="tt-list"></div>
    </div>
</div>`;

createWindow(
    'AF_TimetableUI',
    'winTopTimetable',
    'winLeftTimetable',
    win_TimetableUI
);

hideWindowOnClick('AF_TimetableUI', 'hideshowtimetable');

// ============================================================
// Состояние и утилиты
// ============================================================

let ttCurrentWeekOffset = 0;
let ttRequestId = 0;
let ttHasRequested = false;
let ttClassFilter = null;

const ttRoot = document.getElementById('AF_TimetableUI');
const ttEl = id => ttRoot?.querySelector(`#${id}`);

function ttEscape(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function ttArray(value) {
    return Array.isArray(value) ? value : [];
}

function ttState(text, isError = false) {
    const result = ttEl('tt-result-table');
    if (!result) return;

    const message = document.createElement('div');
    message.className = isError
        ? 'tt-state tt-state--error'
        : 'tt-state';
    message.textContent = text;

    result.replaceChildren(message);
}

function ttValidTeacherId(value) {
    const trimmed = String(value ?? '').trim();
    if (!/^[1-9]\d*$/.test(trimmed)) return null;

    const id = Number(trimmed);
    return Number.isSafeInteger(id) ? id : null;
}

// ============================================================
// Границы недели в календаре Москвы
// ============================================================

function getWeekDates(offset = 0) {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Moscow',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());

    const numberPart = type => Number(
        parts.find(part => part.type === type)?.value
    );

    const today = new Date(Date.UTC(
        numberPart('year'),
        numberPart('month') - 1,
        numberPart('day')
    ));

    const daysSinceMonday = (today.getUTCDay() + 6) % 7;

    const monday = new Date(today);
    monday.setUTCDate(
        today.getUTCDate() - daysSinceMonday + offset * 7
    );

    const sunday = new Date(monday);
    sunday.setUTCDate(monday.getUTCDate() + 6);

    const pad = number => String(number).padStart(2, '0');

    const visual = date =>
        `${pad(date.getUTCDate())}-${pad(date.getUTCMonth() + 1)}-${date.getUTCFullYear()}`;

    const api = date =>
        date.toISOString().slice(0, 19) + '+00:00';

    // Понедельник 00:00:00 МСК.
    const from = new Date(
        monday.getTime() - 3 * 60 * 60 * 1000
    );

    // Воскресенье 23:59:59 МСК.
    const to = new Date(
        sunday.getTime() +
        (20 * 60 * 60 + 59 * 60 + 59) * 1000
    );

    return {
        visualFrom: visual(monday),
        visualTo: visual(sunday),
        apiFrom: api(from),
        apiTo: api(to)
    };
}

function updateWeekDisplay() {
    const dates = getWeekDates(ttCurrentWeekOffset);

    const from = ttEl('tt-date-from');
    const to = ttEl('tt-date-to');

    if (from) from.textContent = dates.visualFrom;
    if (to) to.textContent = dates.visualTo;
}

// ============================================================
// Запрос расписания
// ============================================================

function loadTimetable() {
    const teacherId = ttValidTeacherId(
        ttEl('tt-teacher-id')?.value
    );

    if (teacherId === null) {
        if (typeof createAndShowButton === 'function') {
            createAndShowButton(
                'Введите корректный числовой ID преподавателя',
                'warning'
            );
        } else {
            ttState(
                'Введите корректный числовой ID преподавателя',
                true
            );
        }
        return;
    }

    const dates = getWeekDates(ttCurrentWeekOffset);
    const requestId = ++ttRequestId;

    ttHasRequested = true;
    ttState('Загрузка расписания…');

    const button = ttEl('tt-load-btn');
    if (button) button.disabled = true;

    try {
        chrome.runtime.sendMessage({
            action: 'getFetchRequest',
            fetchURL:
                'https://timetable.skyeng.ru/api/v3/teacher/search',
            requestOptions: {
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'content-type':
                        'application/json; charset=UTF-8'
                },
                referrer: 'https://timetable.skyeng.ru/',
                body: JSON.stringify({
                    timetableFrom: dates.apiFrom,
                    timetableTo: dates.apiTo,
                    serviceTypeKey: null,
                    timeRanges: [],
                    expressions: [],
                    teacherIds: [teacherId],
                    isComplexSearch: false,
                    intensity: null,
                    customFilters: {
                        includeTeachersWhoClosedSpecificSlots: false
                    },
                    page: 1,
                    pageSize: 15,
                    orderByProperty: 'by_rating_small_package'
                }),
                method: 'POST',
                credentials: 'include'
            }
        }, response => {
            // Ответ старой недели или старого преподавателя не отображаем.
            if (requestId !== ttRequestId) return;

            if (button) button.disabled = false;

            const runtimeError = chrome.runtime.lastError;
            if (runtimeError) {
                ttState(
                    `Ошибка связи: ${runtimeError.message}`,
                    true
                );
                return;
            }

            if (!response?.success) {
                ttState(
                    `Ошибка: ${response?.error || 'неизвестная ошибка'}`,
                    true
                );
                return;
            }

            let data;

            try {
                data = typeof response.fetchansver === 'string'
                    ? JSON.parse(response.fetchansver)
                    : response.fetchansver;

                renderTimetable(data, teacherId);
            } catch (error) {
                console.error(
                    '[Timetable] Ошибка обработки ответа:',
                    error
                );

                ttState(
                    'Не удалось обработать ответ расписания',
                    true
                );
            }
        });
    } catch (error) {
        if (requestId !== ttRequestId) return;

        if (button) button.disabled = false;

        console.error('[Timetable] Ошибка запроса:', error);
        ttState(`Ошибка запроса: ${error.message}`, true);
    }
}

function changeWeek(direction) {
    ttCurrentWeekOffset += direction;
    updateWeekDisplay();

    // Даже если преподаватель не указан, старый ответ другой недели
    // больше не должен перерисовать окно.
    ++ttRequestId;

    if (
        ttHasRequested &&
        ttValidTeacherId(ttEl('tt-teacher-id')?.value) !== null
    ) {
        loadTimetable();
    } else if (ttHasRequested) {
        ttState(
            'Неделя изменена. Укажите ID преподавателя и нажмите «Загрузить».'
        );
    }
}

ttEl('tt-prev-week')?.addEventListener(
    'click',
    () => changeWeek(-1)
);

ttEl('tt-next-week')?.addEventListener(
    'click',
    () => changeWeek(1)
);

ttEl('tt-load-btn')?.addEventListener(
    'click',
    loadTimetable
);

ttEl('tt-teacher-id')?.addEventListener(
    'keydown',
    event => {
        if (event.key === 'Enter') loadTimetable();
    }
);

ttEl('tt-viz-search')?.addEventListener(
    'input',
    event => {
        ttClassFilter?.(event.target.value);
    }
);

// ============================================================
// Отображение расписания
// ============================================================

function renderTimetable(rawData, teacherId) {
    let data = rawData;

    if (Array.isArray(data)) {
        data = data[0]?.result?.[0] || data[0];
    } else if (data?.result) {
        data = data.result[0];
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('Неожиданный формат ответа API');
    }

    const container = ttEl('tt-result-table');
    if (!container) return;

    const previousTab =
        container.querySelector('.tt-viz-tab.active')
            ?.dataset.tab || 'classes';

    const MSK_OFFSET = 3 * 60 * 60 * 1000;
    const pad = number => String(number).padStart(2, '0');

    const toMSK = value => {
        if (!value) return null;

        const original = new Date(value);
        if (Number.isNaN(original.getTime())) return null;

        return new Date(original.getTime() + MSK_OFFSET);
    };

    const fmtDate = value => {
        const date = toMSK(value);
        if (!date) return '—';

        return `${pad(date.getUTCDate())}-${pad(date.getUTCMonth() + 1)}-${date.getUTCFullYear()}`;
    };

    const fmtTime = value => {
        const date = toMSK(value);
        if (!date) return '—';

        return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())} МСК`;
    };

    const dayName = value => {
        const date = toMSK(value);
        return date
            ? new Intl.DateTimeFormat('ru-RU', {
                weekday: 'long',
                timeZone: 'UTC'
            }).format(date)
            : '';
    };

    const dateKey = value => {
        const date = toMSK(value);
        return date
            ? date.toISOString().slice(0, 10)
            : 'unknown';
    };

    // Специальный T-формат регулярных слотов API.
    const parseT = value => {
        const raw = String(value ?? '');
        const match = raw.match(/T(\d+):(\d+):/);

        if (!match) {
            return {
                dayIndex: -1,
                timeStr: raw || '—'
            };
        }

        const hours = Number(match[1]);
        const day = Math.floor(hours / 24);
        const hour = hours % 24;
        const mskHour = (hour + 3) % 24;
        const mskDay =
            ((day + Math.floor((hour + 3) / 24)) % 7 + 7) % 7;

        const shortDays = [
            'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'
        ];

        return {
            dayIndex: mskDay,
            timeStr:
                `${shortDays[mskDay]} ` +
                `${pad(mskHour)}:${match[2]} МСК`
        };
    };

    const getStatusInfo = cls => {
        const now = Date.now();

        const start = cls.startAt
            ? new Date(cls.startAt).getTime()
            : NaN;

        const end = cls.endAt
            ? new Date(cls.endAt).getTime()
            : NaN;

        const isRunning =
            Number.isFinite(start) &&
            Number.isFinite(end) &&
            now >= start &&
            now <= end;

        const isPast =
            Number.isFinite(end) &&
            now > end;

        if (isRunning) {
            return {
                color: 'running',
                label: 'Идёт урок'
            };
        }

        if (cls.isVacation) {
            return {
                color: 'vacation',
                label: 'Отпуск'
            };
        }

        const status = cls.classStatus?.status;

        const statuses = {
            success: ['success', 'Прошёл'],
            moved: ['moved', 'Перенесён'],
            canceled_by_student: [
                'canceled',
                'Отменён студентом'
            ],
            cancelled: [
                'canceled',
                'Отменён студентом'
            ],
            failed_by_teacher: [
                'failed_teacher',
                'Пропущен учителем'
            ],
            failed_by_student: [
                'failed_student',
                'Пропущен учеником'
            ],
            canceled_not_paid: [
                'canceled',
                'Отменён: нулевой баланс'
            ]
        };

        if (statuses[status]) {
            return {
                color: statuses[status][0],
                label: statuses[status][1]
            };
        }

        if (cls.removedAt && !cls.classStatus) {
            return {
                color: 'removed',
                label: 'Отменён'
            };
        }

        if (
            cls.isSubstituteTeacher ||
            ttArray(cls.classProperties).some(
                property =>
                    property?.propertyId ===
                    'is_substitute_teacher'
            )
        ) {
            return {
                color: 'substitute',
                label: 'Замена'
            };
        }

        if (isPast && !status && cls.createdByUserId) {
            return {
                color: 'no_status',
                label: 'Нет статуса'
            };
        }

        return {
            color: 'default',
            label: 'Запланировано'
        };
    };

    const fmtSTK = value => {
        const map = {
            english_adult_not_native_speaker_premium:
                'English Adult Premium',
            english_adult_not_native_speaker:
                'English Adult',
            english_adult_native_speaker:
                'English Native',
            english_kids: 'English Kids',
            math: 'Math',
            programming: 'Programming'
        };

        const key = String(value ?? '');

        return map[key] ||
            key.replace(/_/g, ' ')
                .replace(/\b\w/g, letter =>
                    letter.toUpperCase()
                );
    };

    const fmtMode = value => {
        if (value === 'one-to-one') return '1:1';
        if (value === 'group') return 'Группа';
        return String(value || '—');
    };

    const classes = [
        ...ttArray(data.classes),
        ...ttArray(data.futureSingleClasses)
    ];

    const singleSlots = ttArray(data.singleSlots);
    const regularSlots = ttArray(data.regularSlots);
    const regularClasses = ttArray(data.classesRegular);

    const tabConfig = [
        ['classes', `Занятия (${classes.length})`],
        [
            'slots',
            `Слоты (${singleSlots.length + regularSlots.length})`
        ],
        [
            'regular',
            `Регулярное (${regularClasses.length})`
        ]
    ];

    let html = `
        <div class="tt-viz-container">
            <div class="tt-viz-tabs">
                ${tabConfig.map(([key, label]) => `
                    <button class="tt-viz-tab"
                            type="button"
                            data-tab="${key}">
                        ${label}
                    </button>
                `).join('')}
            </div>

            <div class="tt-viz-section" id="tt-viz-classes">
                ${classes.length
                    ? '<div id="tt-viz-classes-grid"></div>'
                    : '<div class="tt-viz-empty">Нет данных о занятиях</div>'
                }
            </div>

            <div class="tt-viz-section" id="tt-viz-slots">
    `;

    if (!singleSlots.length && !regularSlots.length) {
        html += `
            <div class="tt-viz-empty">
                Нет данных о слотах
            </div>
        `;
    } else {
        if (singleSlots.length) {
            const groups = new Map();

            for (const slot of singleSlots) {
                const key = dateKey(slot.startAt);

                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(slot);
            }

            html += `
                <div class="tt-viz-day-header">
                    Разовые слоты
                </div>
            `;

            for (const key of [...groups.keys()].sort()) {
                const slots = groups.get(key).sort(
                    (a, b) =>
                        new Date(a.startAt) -
                        new Date(b.startAt)
                );

                html += `
                    <div class="tt-viz-day-group">
                        <div class="tt-viz-detail">
                            ${fmtDate(slots[0].startAt)}
                        </div>
                        <div class="tt-viz-slot-grid">
                `;

                for (const slot of slots) {
                    html += `
                        <div class="tt-viz-slot">
                            <div class="tt-viz-slot-time">
                                ${fmtTime(slot.startAt)}
                                –
                                ${fmtTime(slot.endAt)}
                            </div>
                            <div class="tt-viz-slot-types">
                                ${ttArray(slot.types).map(type => `
                                    <span class="tt-viz-slot-type${
                                        String(type).includes('no_new')
                                            ? ' blocked'
                                            : ''
                                    }">
                                        ${ttEscape(type)}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                html += '</div></div>';
            }
        }

        if (regularSlots.length) {
            const groups = new Map();

            for (const slot of regularSlots) {
                const parsed = parseT(slot.startAt);

                if (parsed.dayIndex < 0) continue;

                if (!groups.has(parsed.dayIndex)) {
                    groups.set(parsed.dayIndex, []);
                }

                groups.get(parsed.dayIndex).push(slot);
            }

            const days = [
                'Понедельник',
                'Вторник',
                'Среда',
                'Четверг',
                'Пятница',
                'Суббота',
                'Воскресенье'
            ];

            html += `
                <div class="tt-viz-day-header">
                    Регулярные слоты
                </div>
            `;

            for (let day = 0; day < 7; day++) {
                if (!groups.has(day)) continue;

                html += `
                    <div class="tt-viz-day-group">
                        <div class="tt-viz-detail">
                            ${days[day]}
                        </div>
                        <div class="tt-viz-slot-grid">
                `;

                for (const slot of groups.get(day)) {
                    const start = parseT(slot.startAt);
                    const end = parseT(slot.endAt);

                    html += `
                        <div class="tt-viz-slot">
                            <div class="tt-viz-slot-time">
                                ${ttEscape(start.timeStr)}
                                –
                                ${ttEscape(end.timeStr)}
                            </div>
                            <div class="tt-viz-slot-types">
                                ${ttArray(slot.types).map(type => `
                                    <span class="tt-viz-slot-type${
                                        String(type).includes('no_new')
                                            ? ' blocked'
                                            : ''
                                    }">
                                        ${ttEscape(type)}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                html += '</div></div>';
            }
        }
    }

    html += `
            </div>
            <div class="tt-viz-section" id="tt-viz-regular">
    `;

    if (!regularClasses.length) {
        html += `
            <div class="tt-viz-empty">
                Нет регулярных занятий
            </div>
        `;
    } else {
        const groups = new Map();

        for (const item of regularClasses) {
            const parsed = parseT(item.startAt);

            if (parsed.dayIndex < 0) continue;

            if (!groups.has(parsed.dayIndex)) {
                groups.set(parsed.dayIndex, []);
            }

            groups.get(parsed.dayIndex).push(item);
        }

        const days = [
            'Понедельник',
            'Вторник',
            'Среда',
            'Четверг',
            'Пятница',
            'Суббота',
            'Воскресенье'
        ];

        for (let day = 0; day < 7; day++) {
            if (!groups.has(day)) continue;

            html += `
                <div class="tt-viz-day-group">
                    <div class="tt-viz-day-header">
                        ${days[day]}
                    </div>
                    <div class="tt-viz-grid">
            `;

            for (const item of groups.get(day)) {
                const start = parseT(item.startAt);
                const end = parseT(item.endAt);

                const student = item.groupId
                    ? ttEscape(item.group?.name || 'Группа')
                    : 'Student';

                const id = item.groupId
                    ? `<span class="tt-viz-id">
                           (Group ID: ${ttEscape(item.groupId)})
                       </span>`
                    : item.studentId
                        ? `<span class="tt-viz-id">
                               (ID: ${ttEscape(item.studentId)})
                           </span>`
                        : '';

                html += `
                    <div class="tt-viz-card tt-viz-status-default">
                        <div class="tt-viz-card-student">
                            ${student} ${id}
                        </div>

                        <div class="tt-viz-card-meta">
                            ${!item.groupId && item.educationServiceId
                                ? `<span class="tt-viz-badge tt-viz-badge-svc">
                                       ID услуги:
                                       ${ttEscape(item.educationServiceId)}
                                   </span>`
                                : ''
                            }
                        </div>

                        <div class="tt-viz-card-time">
                            ${ttEscape(start.timeStr)}
                            –
                            ${ttEscape(end.timeStr)}
                        </div>

                        <div class="tt-viz-detail">
                            С ${fmtDate(item.firstExemplarOn)}
                        </div>
                    </div>
                `;
            }

            html += '</div></div>';
        }
    }

    html += '</div></div>';

    container.innerHTML = html;

    const teacherName = [
        data.user?.name,
        data.user?.surname
    ].filter(Boolean).join(' ');

    const heading = ttEl('inputTeachInfo');

    if (heading) {
        heading.textContent =
            `${teacherName ? teacherName + ' · ' : ''}` +
            `ID: ${teacherId}`;
    }

    function activateTab(key) {
        for (const tab of container.querySelectorAll(
            '.tt-viz-tab'
        )) {
            tab.classList.toggle(
                'active',
                tab.dataset.tab === key
            );
        }

        for (const section of container.querySelectorAll(
            '.tt-viz-section'
        )) {
            section.classList.toggle(
                'active',
                section.id === `tt-viz-${key}`
            );
        }
    }

    container.querySelectorAll('.tt-viz-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            activateTab(tab.dataset.tab);
        });
    });

    activateTab(
        tabConfig.some(([key]) => key === previousTab)
            ? previousTab
            : 'classes'
    );

    ttClassFilter = null;

    if (classes.length) {
        renderClassesGrid(
            classes,
            container,
            {
                fmtDate,
                fmtTime,
                dayName,
                dateKey,
                getStatusInfo,
                fmtSTK,
                fmtMode
            }
        );
    }
}

function renderClassesGrid(classes, container, helpers) {
    const grid = container.querySelector(
        '#tt-viz-classes-grid'
    );

    if (!grid) return;

    const {
        fmtDate,
        fmtTime,
        dayName,
        dateKey,
        getStatusInfo,
        fmtSTK,
        fmtMode
    } = helpers;

    const render = (filter = '') => {
        const normalizedFilter =
            String(filter).trim().toLowerCase();

        const filtered = classes.filter(item => {
            const student = item.group?.name ||
                [
                    item.student?.user?.name,
                    item.student?.user?.surname
                ].filter(Boolean).join(' ') ||
                `Student ${item.studentId || ''}`;

            const searchable = [
                student,
                getStatusInfo(item).label,
                item.id,
                item.type,
                item.serviceTypeKey,
                item.educationServiceId,
                item.groupId,
                item.studentId
            ].join(' ').toLowerCase();

            return searchable.includes(normalizedFilter);
        });

        if (!filtered.length) {
            grid.innerHTML = `
                <div class="tt-viz-empty">
                    Ничего не найдено
                </div>
            `;
            return;
        }

        const groups = new Map();

        for (const item of filtered) {
            const key = dateKey(item.startAt);

            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(item);
        }

        const todayKey = new Date(
            Date.now() + 3 * 60 * 60 * 1000
        ).toISOString().slice(0, 10);

        let html = '';

        for (const key of [...groups.keys()].sort()) {
            const items = groups.get(key).sort(
                (a, b) =>
                    new Date(a.startAt) -
                    new Date(b.startAt)
            );

            const first = items[0];
            const isToday = key === todayKey;

            html += `
                <div class="tt-viz-day-group">
                    <div class="tt-viz-day-header${
                        isToday ? ' today' : ''
                    }">
                        ${fmtDate(first.startAt)}
                        —
                        ${ttEscape(dayName(first.startAt))}
                        ${isToday ? ' · СЕГОДНЯ' : ''}
                    </div>

                    <div class="tt-viz-grid">
            `;

            for (const item of items) {
                const status = getStatusInfo(item);

                const studentName =
                    item.group?.name ||
                    [
                        item.student?.user?.name,
                        item.student?.user?.surname
                    ].filter(Boolean).join(' ') ||
                    'Student';

                const studentId =
                    item.groupId ||
                    item.studentId ||
                    item.student?.user?.id ||
                    '';

                const idHtml = studentId
                    ? `<span class="tt-viz-id">
                           (${item.groupId ? 'Group ID' : 'ID'}:
                           ${ttEscape(studentId)})
                       </span>`
                    : '';

                const typeLabel =
                    item.type === 'regular'
                        ? 'Регулярное'
                        : item.type === 'single'
                            ? 'Разовое'
                            : item.type || '—';

                const isSubstitute =
                    item.isSubstituteTeacher ||
                    ttArray(item.classProperties).some(
                        property =>
                            property?.propertyId ===
                            'is_substitute_teacher'
                    );

                const stk = fmtSTK(item.serviceTypeKey);
                const mode = fmtMode(item.mode);

                const statusDate =
                    item.classStatus?.createdAt
                        ? `<div class="tt-viz-comment moved-date">
                               ${item.classStatus.status === 'moved'
                                   ? 'Перенесено'
                                   : 'Статус изменён'
                               }:
                               ${fmtDate(item.classStatus.createdAt)}
                               ${fmtTime(item.classStatus.createdAt)}
                           </div>`
                        : '';

                html += `
                    <div class="tt-viz-card tt-viz-status-${status.color}">
                        <span class="tt-viz-badge tt-viz-badge-status">
                            ${status.label}
                        </span>

                        <div class="tt-viz-card-time">
                            ${fmtTime(item.startAt)}
                            –
                            ${fmtTime(item.endAt)}
                        </div>

                        <div class="tt-viz-card-student">
                            ${ttEscape(studentName)}
                            ${idHtml}
                        </div>

                        <div class="tt-viz-card-meta">
                            <span class="tt-viz-badge tt-viz-badge-type">
                                ${ttEscape(typeLabel)}
                            </span>

                            <span class="tt-viz-badge tt-viz-badge-mode">
                                ${ttEscape(mode)}
                            </span>

                            ${stk
                                ? `<span class="tt-viz-badge tt-viz-badge-stk">
                                       ${ttEscape(stk)}
                                   </span>`
                                : ''
                            }

                            ${item.educationServiceId && !item.groupId
                                ? `<span class="tt-viz-badge tt-viz-badge-svc">
                                       ID услуги:
                                       ${ttEscape(item.educationServiceId)}
                                   </span>`
                                : ''
                            }

                            ${item.createdByUserId
                                ? `<span class="tt-viz-badge">
                                       Создатель:
                                       ${ttEscape(item.createdByUserId)}
                                   </span>`
                                : ''
                            }

                            ${isSubstitute
                                ? `<span class="tt-viz-badge tt-viz-badge-substitute">
                                       Замена
                                   </span>`
                                : ''
                            }
                        </div>

                        ${item.classStatus?.comment
                            ? `<div class="tt-viz-comment">
                                   ${ttEscape(item.classStatus.comment)}
                               </div>`
                            : ''
                        }

                        ${statusDate}

                        ${item.removedAt &&
                          item.classStatus?.status !== 'moved'
                            ? `<div class="tt-viz-comment">
                                   Удалено:
                                   ${fmtDate(item.removedAt)}
                                   ${fmtTime(item.removedAt)}
                               </div>`
                            : ''
                        }
                    </div>
                `;
            }

            html += '</div></div>';
        }

        grid.innerHTML = html;

        // Прокручиваем только внутренний список, не страницу AutoFAQ.
        if (!normalizedFilter && container.querySelector(
            '#tt-viz-classes.tt-viz-section.active'
        )) {
            const todayHeader = grid.querySelector(
                '.tt-viz-day-header.today'
            );

            const scrollBox = container.closest(
                '.tt-result-box'
            );

            if (todayHeader && scrollBox) {
                const offset =
                    todayHeader.getBoundingClientRect().top -
                    scrollBox.getBoundingClientRect().top +
                    scrollBox.scrollTop -
                    12;

                scrollBox.scrollTop = Math.max(0, offset);
            }
        }
    };

    ttClassFilter = render;

    // Сохраняем введённый фильтр и после повторной загрузки данных.
    render(ttEl('tt-viz-search')?.value || '');
}

updateWeekDisplay();

function getbutTimetableButtonPress() {
    const win = document.getElementById('AF_TimetableUI');
    if (!win) return;

    if (
        win.style.display === 'none' ||
        win.style.display === ''
    ) {
        win.style.display = 'block';
        requestAnimationFrame(updateWeekDisplay);
    } else {
        win.style.display = 'none';
    }
}