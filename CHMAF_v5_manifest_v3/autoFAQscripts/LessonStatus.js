/**
 * ==========================================
 * CRYSTAL GLASS LESSON STATUS MODULE
 * Премиальный интерфейс проверки статусов уроков
 * Стиль: «corporate graphite», как Queue / ChatHistory / Userinfo
 * Префикс: gls- (glass-lesson-status)
 * ==========================================
 */

(() => {
    'use strict';

    // ─── CONFIG & STATE ─────────────────────────────────────────
    const CONFIG = {
        prefix: 'gls',
        storageKey: 'clearlessoninfo',
        dragStorageKey: 'gls_window_pos',
        apiUrl: 'https://timetable.skyeng.ru/api/teachers/search',
        timezone: 'Europe/Moscow',
        maxTableHeight: 420,
        animDuration: 300
    };

    const state = {
        isVisible: false,
        lastClasses: null,   // кэш последней загрузки для живого фильтра
        windowRef: null
    };

    /** Единый премиальный вид для всех пустых/ошибочных состояний */
    const emptyStateHtml = (icon, title, sub = '', tone = 'accent') => {
        const chipBg = tone === 'rose' ? 'rgba(220, 20, 60, .12)' : 'rgba(66, 104, 201, .12)';
        const chipBorder = tone === 'rose' ? 'rgba(220, 20, 60, .35)' : 'rgba(66, 104, 201, .3)';
        return `
            <div class="${CONFIG.prefix}__empty">
                <div class="${CONFIG.prefix}__empty-icon" style="background:${chipBg}; border-color:${chipBorder};">${icon}</div>
                <div class="${CONFIG.prefix}__empty-title">${title}</div>
                ${sub ? `<div class="${CONFIG.prefix}__empty-sub">${sub}</div>` : ''}
            </div>`;
    };

    // ─── UNIQUE CSS STYLES ──────────────────────────────────────
    const glassStyles = `
        /* Оформление как в Queue / ChatHistory / Userinfo («corporate graphite»).
           Переменные объявлены на окне, а не на :root страницы. */
        .${CONFIG.prefix}-window {
            --gls-bg: #111827;
            --gls-card: #1a2536;
            --gls-card-hover: #23334b;
            --gls-line: #344258;
            --gls-btn: #1b283c;
            --gls-btn-line: #3c4d68;
            --gls-btn-hover: #293b56;
            --gls-btn-hover-line: #7799e2;
            --gls-field: #0d1625;
            --gls-field-line: #3a4961;
            --gls-primary: #4268c9;
            --gls-primary-hover: #547ce1;
            --gls-primary-line: #7293ed;
            --gls-accent: #a9c0ff;
            --gls-accent-soft: rgba(66, 104, 201, .15);
            --gls-text: #f1f5f9;
            --gls-text-secondary: #94a3b8;
            --gls-text-muted: #7d8ca6;
            --gls-success: #86efac;
            --gls-error: #fca5a5;

            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            letter-spacing: .01em;
            -webkit-font-smoothing: antialiased;
            color: var(--gls-text);
            text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
            position: fixed !important;
            z-index: var(--z-window, 1000000) !important;
            width: 1120px;
            max-width: calc(100vw - 16px);
            background:
                radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
                var(--gls-bg) !important;
            border: 1px solid var(--gls-line) !important;
            border-radius: 18px !important;
            box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06) !important;
            overflow: hidden;
            transition: opacity ${CONFIG.animDuration}ms ease, transform ${CONFIG.animDuration}ms ease;
            cursor: default;
        }

        .${CONFIG.prefix}-window *,
        .${CONFIG.prefix}-window *::before,
        .${CONFIG.prefix}-window *::after {
            box-sizing: border-box;
        }

        .${CONFIG.prefix}-window.${CONFIG.prefix}--hidden {
            opacity: 0;
            pointer-events: none;
            transform: translateY(8px);
        }

        /* === ШАПКА: ❌ слева, заголовок, кнопки справа === */
        .${CONFIG.prefix}__header {
            position: relative;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 18px;
            padding: 18px 0 12px;
            border-bottom: 1px solid rgba(66, 104, 201, .15);
            cursor: grab;
            user-select: none;
        }

        .${CONFIG.prefix}__header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 40%;
            height: 1px;
            background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
        }

        .${CONFIG.prefix}__header:active { cursor: grabbing; }

        .${CONFIG.prefix}__title {
            flex: 1;
            min-width: 0;
            color: #fefefe;
            font-size: 15px;
            font-weight: 700;
            white-space: nowrap;
        }

        .${CONFIG.prefix}__toolbar {
            display: flex;
            gap: 8px;
        }

        /* === КНОПКИ === */
        .${CONFIG.prefix}__btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            flex: none;
            height: 34px;
            padding: 0 14px;
            color: #dce5f5;
            background: var(--gls-btn);
            border: 1px solid var(--gls-btn-line);
            border-radius: 9px;
            font-family: inherit;
            font-size: 14px;
            font-weight: 600;
            white-space: nowrap;
            cursor: pointer;
            outline: none;
            user-select: none;
            transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
        }

        .${CONFIG.prefix}__btn:hover {
            color: #fff;
            background: var(--gls-btn-hover);
            border-color: var(--gls-btn-hover-line);
            transform: translateY(-1px);
        }

        .${CONFIG.prefix}__btn:active { transform: translateY(0) scale(.98); }

        .${CONFIG.prefix}__btn:focus-visible,
        .${CONFIG.prefix}__date-nav:focus-visible {
            outline: 2px solid #9ab5ff;
            outline-offset: 2px;
        }

        .${CONFIG.prefix}__btn--primary {
            color: #eef3ff;
            background: var(--gls-primary);
            border-color: var(--gls-primary-line);
            box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
        }

        .${CONFIG.prefix}__btn--primary:hover {
            color: #fff;
            background: var(--gls-primary-hover);
            border-color: #a2b9fa;
        }

        .${CONFIG.prefix}__btn--icon {
            width: 34px;
            padding: 0;
            font-size: 16px;
        }

        .${CONFIG.prefix}__btn--close {
            color: #ffb0be;
            background: rgba(255, 116, 140, .08);
            border-color: rgba(255, 116, 140, .3);
        }

        .${CONFIG.prefix}__btn--close:hover {
            color: #ffb0be;
            background: rgba(255, 116, 140, .16);
            border-color: rgba(255, 116, 140, .55);
        }

        /* === ДАТЫ === */
        .${CONFIG.prefix}__date-nav {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: none;
            width: 34px;
            height: 34px;
            color: var(--gls-accent);
            background: var(--gls-btn);
            border: 1px solid var(--gls-btn-line);
            border-radius: 9px;
            font-size: 13px;
            cursor: pointer;
            outline: none;
            transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
        }

        .${CONFIG.prefix}__date-nav:hover {
            color: #fff;
            background: var(--gls-btn-hover);
            border-color: var(--gls-btn-hover-line);
        }

        .${CONFIG.prefix}__date-nav:active { transform: scale(.94); }

        /* === ПАНЕЛЬ ФИЛЬТРОВ === */
        .${CONFIG.prefix}__controls {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
            padding: 14px 18px;
        }

        .${CONFIG.prefix}__field-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .${CONFIG.prefix}__label {
            color: var(--gls-text-secondary);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .${CONFIG.prefix}__input {
            height: 34px;
            padding: 0 12px;
            color: #edf2fb;
            background: var(--gls-field);
            border: 1px solid var(--gls-field-line);
            border-radius: 9px;
            outline: none;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
        }

        .${CONFIG.prefix}__input:focus {
            background: #142034;
            border-color: #829fff;
            box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
        }

        .${CONFIG.prefix}__input::placeholder {
            color: var(--gls-text-muted);
            font-weight: 500;
        }

        .${CONFIG.prefix}__input--date {
            width: 146px;
            color-scheme: dark;
        }

        .${CONFIG.prefix}__input--id {
            width: 120px;
            text-align: center;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            font-variant-numeric: tabular-nums;
        }

        .${CONFIG.prefix}__spacer { flex: 1; min-width: 12px; }

        /* === СОДЕРЖИМОЕ === */
        .${CONFIG.prefix}__content {
            max-height: ${CONFIG.maxTableHeight}px;
            padding: 0 18px 18px;
            overflow-x: hidden;
            overflow-y: auto;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            scrollbar-color: rgba(66, 104, 201, .4) transparent;
        }

        .${CONFIG.prefix}__content::-webkit-scrollbar { width: 4px; }
        .${CONFIG.prefix}__content::-webkit-scrollbar-track { background: transparent; }
        .${CONFIG.prefix}__content::-webkit-scrollbar-thumb {
            background: rgba(66, 104, 201, .3);
            border-radius: 8px;
        }
        .${CONFIG.prefix}__content::-webkit-scrollbar-thumb:hover { background: rgba(66, 104, 201, .6); }

        /* === ТАБЛИЦА === */
        .${CONFIG.prefix}__table-wrap {
            overflow: hidden;
            background: var(--gls-card);
            border: 1px solid var(--gls-line);
            border-radius: 12px;
        }

        .${CONFIG.prefix}__table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            color: #e2e8f0;
            font-size: 13px;
        }

        .${CONFIG.prefix}__table thead th {
            position: sticky;
            top: 0;
            z-index: 2;
            padding: 10px 12px;
            color: var(--gls-text-secondary);
            background: #162133;
            border-bottom: 1px solid var(--gls-line);
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .06em;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .${CONFIG.prefix}__table tbody tr { transition: background-color .16s ease; }
        .${CONFIG.prefix}__table tbody tr:nth-child(even) { background: rgba(0, 0, 0, .12); }
        .${CONFIG.prefix}__table tbody tr:hover { background: var(--gls-card-hover); }

        .${CONFIG.prefix}__table tbody tr:not(:last-child) td {
            border-bottom: 1px solid rgba(52, 66, 88, .6);
        }

        .${CONFIG.prefix}__table td {
            padding: 9px 12px;
            font-size: 13px;
            text-align: center;
        }

        .${CONFIG.prefix}__cell--id {
            color: var(--gls-accent);
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: background-color .16s ease, color .16s ease;
        }

        .${CONFIG.prefix}__cell--id:hover {
            color: #fff;
            background: var(--gls-accent-soft);
        }

        /* Статусы — как статусы услуг в Userinfo */
        .${CONFIG.prefix}__status {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border: 1px solid;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: .05em;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .${CONFIG.prefix}__status--success {
            color: var(--gls-success);
            background: rgba(69, 199, 52, .15);
            border-color: rgba(69, 199, 52, .4);
        }

        .${CONFIG.prefix}__status--error {
            color: var(--gls-error);
            background: rgba(220, 20, 60, .15);
            border-color: rgba(220, 20, 60, .35);
        }

        .${CONFIG.prefix}__status--removed {
            color: #d8b4fe;
            background: rgba(138, 28, 129, .25);
            border-color: rgba(138, 28, 129, .5);
        }

        .${CONFIG.prefix}__status--unknown {
            color: #cbd5e1;
            background: rgba(148, 163, 184, .12);
            border-color: rgba(148, 163, 184, .3);
        }

        .${CONFIG.prefix}__cell--comment {
            max-width: 200px;
            overflow: hidden;
            color: var(--gls-text-secondary);
            font-size: 12px;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .${CONFIG.prefix}__cell--type {
            color: #7dd3fc;
            font-size: 12px;
            font-weight: 600;
        }

        /* === ЗАГРУЗКА И ПУСТЫЕ СОСТОЯНИЯ === */
        .${CONFIG.prefix}__loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            padding: 56px 20px;
            color: var(--gls-text-secondary);
        }

        .${CONFIG.prefix}__spinner {
            width: 34px;
            height: 34px;
            border: 3px solid rgba(66, 104, 201, .2);
            border-top-color: #7799e2;
            border-radius: 50%;
            animation: ${CONFIG.prefix}-spin .7s linear infinite;
        }

        @keyframes ${CONFIG.prefix}-spin { to { transform: rotate(360deg); } }

        .${CONFIG.prefix}__empty {
            padding: 40px 24px;
            color: var(--gls-text-secondary);
            text-align: center;
            background: rgba(255, 255, 255, .02);
            border: 1px dashed rgba(66, 104, 201, .25);
            border-radius: 12px;
        }

        .${CONFIG.prefix}__empty-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            margin: 0 auto 14px;
            background: rgba(66, 104, 201, .12);
            border: 1px solid rgba(66, 104, 201, .3);
            border-radius: 16px;
            font-size: 26px;
        }

        .${CONFIG.prefix}__empty-title {
            margin-bottom: 6px;
            color: var(--gls-text);
            font-size: 15px;
            font-weight: 700;
        }

        .${CONFIG.prefix}__empty-sub {
            color: var(--gls-text-secondary);
            font-size: 13px;
        }
    `;

    // ─── HTML TEMPLATE ──────────────────────────────────────────
    const windowTemplate = `
        <div class="${CONFIG.prefix}__header" id="${CONFIG.prefix}-drag-handle">
            <button class="${CONFIG.prefix}__btn ${CONFIG.prefix}__btn--icon ${CONFIG.prefix}__btn--close buttonHide" id="${CONFIG.prefix}-hide" title="Скрыть окно">❌</button>
            <div class="${CONFIG.prefix}__title">📊 Статус уроков</div>
            <div class="${CONFIG.prefix}__toolbar">
                <button class="${CONFIG.prefix}__btn ${CONFIG.prefix}__btn--icon" id="${CONFIG.prefix}-clear" title="Очистить поля">🧹</button>
            </div>
        </div>

        <div class="${CONFIG.prefix}__controls">
            <button class="${CONFIG.prefix}__date-nav" id="${CONFIG.prefix}-prev-day" title="День назад">◀</button>

            <div class="${CONFIG.prefix}__field-group">
                <span class="${CONFIG.prefix}__label">С</span>
                <input type="date" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--date" id="${CONFIG.prefix}-date-from">
            </div>
            <div class="${CONFIG.prefix}__field-group">
                <span class="${CONFIG.prefix}__label">По</span>
                <input type="date" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--date" id="${CONFIG.prefix}-date-to">
            </div>

            <button class="${CONFIG.prefix}__date-nav" id="${CONFIG.prefix}-next-day" title="День вперед">▶</button>

            <div class="${CONFIG.prefix}__field-group" style="margin-left: 8px;">
                <span class="${CONFIG.prefix}__label">Учитель</span>
                <input type="text" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--id" id="${CONFIG.prefix}-teacher-id" placeholder="ID" title="ID учителя для поиска">
            </div>
            <div class="${CONFIG.prefix}__field-group">
                <span class="${CONFIG.prefix}__label">Ученик</span>
                <input type="text" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--id" id="${CONFIG.prefix}-student-id" placeholder="ID" title="Фильтр по ID ученика">
            </div>

            <div class="${CONFIG.prefix}__spacer"></div>

            <button class="${CONFIG.prefix}__btn ${CONFIG.prefix}__btn--primary" id="${CONFIG.prefix}-search">
                <span>🚀 Получить инфо</span>
            </button>
        </div>

        <div class="${CONFIG.prefix}__content" id="${CONFIG.prefix}-content">
            ${emptyStateHtml('📋', 'Введите ID учителя', 'и нажмите «Получить инфо» — статусы уроков появятся здесь')}
        </div>
    `;

    // ─── UTILITY FUNCTIONS ──────────────────────────────────────

    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    const formatDateTime = (dateStr, slice = false) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const options = {
            timeZone: CONFIG.timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        };
        const formatted = date.toLocaleString('ru-RU', options);
        return slice ? formatted.slice(0, 17) : formatted;
    };

    /**
     * Строгий парсинг дат: 00:00:00 - 23:59:59 по Москве -> UTC
     */
    const getApiDateStr = (inputDateStr, isEndOfDay) => {
        const [y, m, d] = inputDateStr.split('-').map(Number);
        let hours = isEndOfDay ? 23 : 0;
        let minutes = isEndOfDay ? 59 : 0;
        let seconds = isEndOfDay ? 59 : 0;

        // Создаем объект даты в UTC, предполагая что введенные числа — это Москва
        let mskDate = new Date(Date.UTC(y, m - 1, d, hours, minutes, seconds));

        // Переводим в "чистый" UTC (вычитая 3 часа)
        mskDate.setUTCHours(mskDate.getUTCHours() - 3);

        const day = String(mskDate.getUTCDate()).padStart(2, '0');
        const month = String(mskDate.getUTCMonth() + 1).padStart(2, '0');
        const year = mskDate.getUTCFullYear();
        const h = String(mskDate.getUTCHours()).padStart(2, '0');
        const min = String(mskDate.getUTCMinutes()).padStart(2, '0');
        const sec = String(mskDate.getUTCSeconds()).padStart(2, '0');

        return `${day}-${month}-${year} ${h}:${min}:${sec}`;
    };

    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);

    const getStatusBadge = (status, isRemoved) => {
        if (isRemoved) {
            return `<span class="${CONFIG.prefix}__status ${CONFIG.prefix}__status--removed">🗑 Удалён</span>`;
        }
        if (status === 'success') {
            return `<span class="${CONFIG.prefix}__status ${CONFIG.prefix}__status--success">✓ Проведён</span>`;
        }
        if (status) {
            return `<span class="${CONFIG.prefix}__status ${CONFIG.prefix}__status--error">✕ ${esc(status)}</span>`;
        }
        return `<span class="${CONFIG.prefix}__status ${CONFIG.prefix}__status--unknown">? Неизвестно</span>`;
    };

    // ─── TABLE RENDERER ─────────────────────────────────────────

    const renderTable = (classes, studentFilter) => {
        const content = $(`#${CONFIG.prefix}-content`);
        const filterId = studentFilter?.trim();

        const filtered = classes.filter(cls => {
            if (!cls.studentId) return false;
            if (!filterId) return true;
            return String(cls.studentId) === filterId;
        });

        if (!filtered.length) {
            content.innerHTML = emptyStateHtml(
                '🔍', 'Ничего не найдено',
                studentFilter
                    ? `Нет уроков у ученика ID ${studentFilter}. Очисти поле — вернётся полный список`
                    : 'Попробуй другой период'
            );
            return;
        }

        // Оптимизация: убраны неиспользуемые свойства из объекта
        const headers = ['🆔 Ученик', '📆 Дата урока', '⚡ Статус', '📅 Отмечен', '❓ Кем', '💦 Тип', '💬 Комментарий', '📅 Удалён'];

        const rows = filtered.map(cls => {
            const status = cls.classStatus;
            const isRemoved = typeof cls.removedAt !== 'undefined';

            return `
                <tr>
                    <td class="${CONFIG.prefix}__cell--id" data-id="${cls.studentId}" name="idToCRM">
                        ${cls.studentId}
                    </td>
                    <td>${formatDateTime(cls.startAt, true)}</td>
                    <td>${getStatusBadge(status?.status, isRemoved)}</td>
                    <td>${status ? formatDateTime(status.createdAt) : ''}</td>
                    <td>${esc(status?.createdByUserId || '')}</td>
                    <td class="${CONFIG.prefix}__cell--type">${esc(cls.type || '')}</td>
                    <td class="${CONFIG.prefix}__cell--comment" title="${esc(status?.comment || '')}">${esc(status?.comment || '')}</td>
                    <td>${isRemoved ? formatDateTime(cls.removedAt) : ''}</td>
                </tr>
            `;
        }).join('');

        const thead = headers.map(h => `<th>${h}</th>`).join('');

        content.innerHTML = `
            <div class="${CONFIG.prefix}__table-wrap">
                <table class="${CONFIG.prefix}__table">
                    <thead><tr>${thead}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

        // Делегирование событий для ID
        $$(`[name="idToCRM"]`, content).forEach(cell => {
            const id = cell.dataset.id;
            if (!id) return;

            cell.addEventListener('click', () => window.open(`https://crm2.skyeng.ru/persons/${id}`, '_blank'));

            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                // copyToClipboard из utils.js уже реализует надёжный execCommand-фолбэк
                if (typeof copyToClipboard === 'function') {
                    copyToClipboard(id).catch((err) => console.log('Clipboard failed:', err));
                }
            });
        });
    };

    // ─── API & LOGIC ────────────────────────────────────────────

    const showLoading = () => {
        const content = $(`#${CONFIG.prefix}-content`);
        content.innerHTML = `
            <div class="${CONFIG.prefix}__loader">
                <div class="${CONFIG.prefix}__spinner"></div>
                <div>Загрузка данных...</div>
                <div style="font-size: 12px; opacity: 0.7;">Если информация не появится, нажмите повторно</div>
            </div>
        `;
    };

    const fetchLessons = async () => {
        const teacherId = $(`#${CONFIG.prefix}-teacher-id`).value.trim();
        const studentId = $(`#${CONFIG.prefix}-student-id`).value.trim();

        if (!/^\d+$/.test(teacherId)) {
            createAndShowButton('Введите числовой ID учителя', 'warning');
            return;
        }

        const fromVal = $(`#${CONFIG.prefix}-date-from`).value;
        const toVal = $(`#${CONFIG.prefix}-date-to`).value;
        if (!fromVal || !toVal || fromVal > toVal) {
            createAndShowButton('Проверь даты: «с» не может быть позже «по»', 'warning');
            return;
        }

        // Новый поиск — старый кэш больше не актуален. Раньше после поиска по другому
        // преподавателю фильтр по ученику показывал уроки ПРЕДЫДУЩЕГО преподавателя.
        state.lastClasses = null;
        const requestId = state.requestId = (state.requestId || 0) + 1;

        showLoading();

        const apiFrom = getApiDateStr(fromVal, false);
        const apiTo = getApiDateStr(toVal, true);

        const body = new URLSearchParams();
        body.append('from', apiFrom);
        body.append('to', apiTo);
        body.append('offset', '0');
        body.append('filters[teacherIds][]', teacherId);
        body.append('callback', 'getJSONP');

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
            credentials: 'include'
        };

        try {
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    { action: 'getFetchRequest', fetchURL: CONFIG.apiUrl, requestOptions },
                    (res) => {
                        if (chrome.runtime.lastError) {
                            return reject(new Error(chrome.runtime.lastError.message));
                        }
                        if (!res?.success) {
                            return reject(new Error(res?.error || 'Unknown error'));
                        }
                        resolve(res);
                    }
                );
            });

            // Пока шёл запрос, запустили новый (Enter + вставка, смена ID) — этот ответ устарел
            if (requestId !== state.requestId) return;

            const data = JSON.parse(response.fetchansver);
            const classes = data?.[0]?.result?.[0]?.classes;

            if (!classes?.length) {
                $(`#${CONFIG.prefix}-content`).innerHTML = emptyStateHtml(
                    '📭', 'Уроков за выбранный период не найдено',
                    'Попробуй расширить диапазон дат'
                );
                return;
            }

            state.lastClasses = classes; // кэш для живого фильтра по ученику
            renderTable(classes, studentId);

        } catch (err) {
            if (requestId !== state.requestId) return;
            console.error('[LessonStatus]', err);
            $(`#${CONFIG.prefix}-content`).innerHTML = emptyStateHtml(
                '⚠️', 'Ошибка загрузки', esc(err.message), 'rose'
            );
        } finally {
        }
    };

    // ─── DATE MANAGEMENT ────────────────────────────────────────

    const shiftDates = (days) => {
        const fromInput = $(`#${CONFIG.prefix}-date-from`);
        const toInput = $(`#${CONFIG.prefix}-date-to`);

        let dFrom = new Date(fromInput.value + 'T00:00:00');
        let dTo = new Date(toInput.value + 'T00:00:00');

        dFrom.setDate(dFrom.getDate() + days);
        dTo.setDate(dTo.getDate() + days);

        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        fromInput.value = fmt(dFrom);
        toInput.value = fmt(dTo);
    };

    const resetDates = () => {
        const now = new Date();
        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        // ИСПРАВЛЕНО: Обе даты теперь равны текущему дню
        $(`#${CONFIG.prefix}-date-from`).value = fmt(now);
        $(`#${CONFIG.prefix}-date-to`).value = fmt(now);
    };

    const clearAll = async () => {
        if (
            !(await chmafDialog.confirm({
                title: 'Очистка полей',
                message: 'Вы уверены, что хотите очистить все поля?',
                okText: 'Очистить',
                danger: true
            }))
        ) return;

        resetDates();
        state.lastClasses = null;
        $(`#${CONFIG.prefix}-teacher-id`).value = '';
        $(`#${CONFIG.prefix}-student-id`).value = '';
        $(`#${CONFIG.prefix}-content`).innerHTML = emptyStateHtml(
            '📋', 'Введите ID учителя',
            'и нажмите «Получить инфо» — статусы уроков появятся здесь'
        );
    };

    // ─── WINDOW MANAGEMENT ──────────────────────────────────────

    const toggleWindow = () => {
        const win = state.windowRef;
        const isVisible = getComputedStyle(win).display !== 'none';

        if (isVisible) {
            win.style.display = 'none';
            win.classList.add(`${CONFIG.prefix}--hidden`);

            const clearFlag = localStorage.getItem(CONFIG.storageKey);
            if (clearFlag === '0') {
                $(`#${CONFIG.prefix}-content`).innerHTML = emptyStateHtml(
                    '📋', 'Введите ID учителя',
                    'и нажмите «Получить инфо» — статусы уроков появятся здесь'
                );
            }
        } else {
            win.style.display = '';
            win.classList.remove(`${CONFIG.prefix}--hidden`);
            $(`#${CONFIG.prefix}-teacher-id`).focus();
        }

        const menu = document.getElementById('idmymenu');
        const btn = document.getElementById('MainMenuBtn');
        if (menu) menu.style.display = 'none';
        if (btn) btn.classList.remove('activeScriptBtn');
    };

    const initWindow = () => {
        // Inject styles
        if (!$(`#${CONFIG.prefix}-styles`)) {
            const styleEl = document.createElement('style');
            styleEl.id = `${CONFIG.prefix}-styles`;
            styleEl.textContent = glassStyles;
            document.head.appendChild(styleEl);
        }

        // Create window HTML
        const winId = 'AF_LessonStatus';
        const html = `<div id="${CONFIG.prefix}-root">${windowTemplate}</div>`;

        // Use existing createWindow or fallback
        if (typeof createWindow === 'function') {
            state.windowRef = createWindow(winId, 'winTopLessonStatus', 'winLeftLessonStatus', html);
        } else {
            state.windowRef = document.createElement('div');
            state.windowRef.id = winId;
            state.windowRef.innerHTML = html;
            document.body.appendChild(state.windowRef);
        }

        // Apply glass class
        if (state.windowRef) {
            state.windowRef.classList.add(`${CONFIG.prefix}-window`);
            state.windowRef.style.cssText += `
                position: fixed;
                z-index: var(--z-window, 1000000);
                border-radius: 18px;
                overflow: hidden;
            `;
        }

        // Init drag & drop via universal enableDrag
        if (typeof enableDrag === 'function') {
            enableDrag(state.windowRef, {
                handle: `#${CONFIG.prefix}-drag-handle`,
                storageKey: CONFIG.dragStorageKey,
                savePosition: true
            });
        }

        // Double-click hide
        state.windowRef.ondblclick = (e) => {
            if (typeof checkelementtype === 'function' && !checkelementtype(e)) return;
            if (localStorage.getItem('dblhidewindow') === '0') {
                $(`#${CONFIG.prefix}-hide`).click();
            }
        };

        // Bind events
        $(`#${CONFIG.prefix}-hide`).addEventListener('click', toggleWindow);
        $(`#${CONFIG.prefix}-clear`).addEventListener('click', clearAll);
        $(`#${CONFIG.prefix}-search`).addEventListener('click', fetchLessons);

        // Date navigation
        $(`#${CONFIG.prefix}-prev-day`).addEventListener('click', () => shiftDates(-1));
        $(`#${CONFIG.prefix}-next-day`).addEventListener('click', () => shiftDates(1));

        // ─── Учитель ID: Enter / вставка → запрос к API ───
        const teacherEl = $(`#${CONFIG.prefix}-teacher-id`);
        const studentEl = $(`#${CONFIG.prefix}-student-id`);

        teacherEl?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') fetchLessons();
        });

        teacherEl?.addEventListener('paste', () => {
            requestAnimationFrame(() => {
                if (teacherEl.value.trim()) fetchLessons();
            });
        });

        // ─── Ученик ID: ЖИВОЙ клиентский фильтр без повторного запроса.
        // Очистка поля возвращает полную таблицу загруженных уроков.
        const applyStudentFilter = (val) => {
            if (state.lastClasses) renderTable(state.lastClasses, val);
        };

        studentEl?.addEventListener('input', (e) => applyStudentFilter(e.target.value));

        studentEl?.addEventListener('paste', () => {
            requestAnimationFrame(() => applyStudentFilter(studentEl.value));
        });

        // Initial state
        resetDates();

        // Окно создаётся по первому нажатию и сразу переключается toggleWindow.
        // Если createWindow вернул видимое окно, первый клик его тут же прятал —
        // приходилось жать дважды. Явно начинаем со скрытого состояния.
        state.windowRef.style.display = 'none';
    };

    // ─── PUBLIC API ─────────────────────────────────────────────

    window.getbutLessonInfoButtonPress = () => {
        if (!state.windowRef) initWindow();

        const clearFlag = localStorage.getItem(CONFIG.storageKey);
        const content = $(`#${CONFIG.prefix}-content`);
        const hasData = content && !content.querySelector(`.${CONFIG.prefix}__empty`) && content.innerText.trim().length > 0;

        if (clearFlag === '0' || (clearFlag === '1' && !hasData)) {
            resetDates();
        }

        toggleWindow();
    };

})();