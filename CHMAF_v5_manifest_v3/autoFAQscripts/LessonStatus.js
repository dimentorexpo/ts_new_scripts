/**
 * ==========================================
 * GLASS LESSON STATUS MODULE
 * Премиальный интерфейс проверки статусов уроков
 * Стиль: Glassmorphism + Neumorphism accents
 * Префикс: gls- (glass-lesson-status)
 * ==========================================
 */

(() => {
    'use strict';

    // ─── CONFIG & STATE ─────────────────────────────────────────
    const CONFIG = {
        prefix: 'gls',
        storageKey: 'clearlessoninfo',
        apiUrl: 'https://timetable.skyeng.ru/api/teachers/search',
        timezone: 'Europe/Moscow',
        maxTableHeight: 420,
        animDuration: 300
    };

    const state = {
        isVisible: false,
        isLoading: false,
        windowRef: null
    };

    // ─── UNIQUE CSS STYLES ──────────────────────────────────────
    const glassStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        /* === CORE WINDOW === */
        #${CONFIG.prefix}-window {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            position: fixed !important;
            z-index: 999999 !important;
            width: 1120px;
            border-radius: 24px;
            background: linear-gradient(135deg, rgba(20, 20, 35, 0.85) 0%, rgba(30, 30, 50, 0.9) 100%);
            backdrop-filter: blur(20px) saturate(180%);
            -webkit-backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow:
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                0 0 100px rgba(100, 100, 255, 0.08) inset;
            overflow: hidden;
            transition: opacity ${CONFIG.animDuration}ms ease, transform ${CONFIG.animDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor:grab;
        }

        #${CONFIG.prefix}-window.${CONFIG.prefix}--hidden {
            opacity: 0;
            pointer-events: none;
            transform: scale(0.96) translateY(10px);
        }

        /* === HEADER / TOOLBAR === */
        .${CONFIG.prefix}__header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px 16px;
            background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%);
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .${CONFIG.prefix}__title {
            color: rgba(255, 255, 255, 0.95);
            font-size: 15px;
            font-weight: 600;
            letter-spacing: 0.3px;
            display: flex;
            align-items: center;
            gap: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .${CONFIG.prefix}__title-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
            border: 1px solid rgba(255,255,255,0.15);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            backdrop-filter: blur(10px);
        }

        .${CONFIG.prefix}__toolbar {
            display: flex;
            gap: 8px;
        }

        /* === GLASS BUTTONS === */
        .${CONFIG.prefix}__btn {
            position: relative;
            padding: 8px 16px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            color: rgba(255,255,255,0.9);
            font-family: inherit;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
            overflow: hidden;
            outline: none;
            user-select: none;
        }

        .${CONFIG.prefix}__btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
            opacity: 0;
            transition: opacity 0.2s;
        }

        .${CONFIG.prefix}__btn:hover {
            transform: translateY(-1px);
            border-color: rgba(255,255,255,0.2);
            box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset;
        }

        .${CONFIG.prefix}__btn:hover::before {
            opacity: 1;
        }

        .${CONFIG.prefix}__btn:active {
            transform: translateY(0);
            transition-duration: 0.05s;
        }

        .${CONFIG.prefix}__btn--primary {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(168, 85, 247, 0.35));
            border-color: rgba(129, 140, 248, 0.3);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.2);
        }

        .${CONFIG.prefix}__btn--primary:hover {
            box-shadow: 0 8px 28px rgba(99, 102, 241, 0.35);
            border-color: rgba(165, 180, 252, 0.5);
        }

        .${CONFIG.prefix}__btn--danger {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(220, 38, 38, 0.2));
            border-color: rgba(248, 113, 113, 0.25);
            padding: 8px 12px;
            font-size: 15px;
        }

        .${CONFIG.prefix}__btn--danger:hover {
            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
        }

        .${CONFIG.prefix}__btn--icon {
            padding: 8px;
            width: 36px;
            height: 36px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
        }

        /* === CONTROLS BAR === */
        .${CONFIG.prefix}__controls {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 16px 24px;
            background: rgba(0,0,0,0.15);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            flex-wrap: wrap;
        }

        .${CONFIG.prefix}__field-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .${CONFIG.prefix}__label {
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        .${CONFIG.prefix}__input {
            background: rgba(0,0,0,0.25);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            padding: 8px 12px;
            color: rgba(255,255,255,0.9);
            font-family: inherit;
            font-size: 13px;
            outline: none;
            transition: all 0.2s;
            backdrop-filter: blur(10px);
        }

        .${CONFIG.prefix}__input:hover {
            border-color: rgba(255,255,255,0.15);
        }

        .${CONFIG.prefix}__input:focus {
            border-color: rgba(129, 140, 248, 0.5);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15), 0 0 20px rgba(99, 102, 241, 0.1);
            background: rgba(0,0,0,0.35);
        }

        .${CONFIG.prefix}__input::placeholder {
            color: rgba(255,255,255,0.25);
        }

        .${CONFIG.prefix}__input--date {
            width: 130px;
            color-scheme: dark;
        }

        .${CONFIG.prefix}__input--id {
            width: 110px;
            text-align: center;
            font-variant-numeric: tabular-nums;
        }

        .${CONFIG.prefix}__spacer {
            flex: 1;
            min-width: 20px;
        }

        /* === CONTENT AREA === */
        .${CONFIG.prefix}__content {
            padding: 0 24px 24px;
            max-height: ${CONFIG.maxTableHeight}px;
            overflow-y: auto;
            overflow-x: hidden;
        }

        .${CONFIG.prefix}__content::-webkit-scrollbar {
            width: 6px;
        }

        .${CONFIG.prefix}__content::-webkit-scrollbar-track {
            background: transparent;
        }

        .${CONFIG.prefix}__content::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        }

        .${CONFIG.prefix}__content::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.2);
        }

        /* === TABLE === */
        .${CONFIG.prefix}__table-wrap {
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.08);
            background: rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
        }

        .${CONFIG.prefix}__table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 13px;
            color: rgba(255,255,255,0.85);
        }

        .${CONFIG.prefix}__table thead th {
            background: linear-gradient(180deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            padding: 14px 12px;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: rgba(255,255,255,0.7);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            position: sticky;
            top: 0;
            z-index: 2;
            white-space: nowrap;
            backdrop-filter: blur(10px);
        }

        .${CONFIG.prefix}__table tbody tr {
            transition: background 0.15s;
        }

        .${CONFIG.prefix}__table tbody tr:hover {
            background: rgba(255,255,255,0.04);
        }

        .${CONFIG.prefix}__table tbody tr:not(:last-child) td {
            border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .${CONFIG.prefix}__table td {
            padding: 12px;
            text-align: center;
            font-size: 12px;
        }

        .${CONFIG.prefix}__cell--id {
            font-weight: 600;
            color: rgba(165, 180, 252, 0.95);
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 6px;
        }

        .${CONFIG.prefix}__cell--id:hover {
            background: rgba(99, 102, 241, 0.15);
            color: #a5b4fc;
            text-shadow: 0 0 12px rgba(165, 180, 252, 0.4);
        }

        .${CONFIG.prefix}__status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.1);
        }

        .${CONFIG.prefix}__status--success {
            background: rgba(34, 197, 94, 0.15);
            color: #4ade80;
            border-color: rgba(74, 222, 128, 0.2);
            box-shadow: 0 0 16px rgba(34, 197, 94, 0.1);
        }

        .${CONFIG.prefix}__status--error {
            background: rgba(239, 68, 68, 0.15);
            color: #f87171;
            border-color: rgba(248, 113, 113, 0.2);
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.1);
        }

        .${CONFIG.prefix}__status--removed {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            border-color: rgba(252, 165, 165, 0.25);
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.15);
        }

        .${CONFIG.prefix}__status--unknown {
            background: rgba(156, 163, 175, 0.15);
            color: #9ca3af;
            border-color: rgba(156, 163, 175, 0.2);
        }

        .${CONFIG.prefix}__cell--comment {
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: rgba(255,255,255,0.6);
            font-size: 11px;
        }

        .${CONFIG.prefix}__cell--type {
            font-size: 10px;
            color: rgba(255,255,255,0.5);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* === LOADING & EMPTY STATES === */
        .${CONFIG.prefix}__loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            gap: 16px;
            color: rgba(255,255,255,0.5);
        }

        .${CONFIG.prefix}__spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.08);
            border-top-color: rgba(129, 140, 248, 0.8);
            border-radius: 50%;
            animation: ${CONFIG.prefix}-spin 0.8s linear infinite;
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
        }

        @keyframes ${CONFIG.prefix}-spin {
            to { transform: rotate(360deg); }
        }

        .${CONFIG.prefix}__empty {
            text-align: center;
            padding: 50px 20px;
            color: rgba(255,255,255,0.4);
        }

        .${CONFIG.prefix}__empty-icon {
            font-size: 48px;
            margin-bottom: 12px;
            opacity: 0.3;
        }

        /* === GRAB CURSOR === */
        .${CONFIG.prefix}__drag-handle {
            cursor: grab;
            cursor: -webkit-grab;
            user-select: none;
        }

        .${CONFIG.prefix}__drag-handle:active {
            cursor: grabbing;
            cursor: -webkit-grabbing;
        }

        /* === TOOLTIP === */
        .${CONFIG.prefix}__tooltip {
            position: absolute;
            background: rgba(15, 15, 25, 0.95);
            color: rgba(255,255,255,0.9);
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            pointer-events: none;
            z-index: 1000000;
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            opacity: 0;
            transition: opacity 0.2s;
            white-space: nowrap;
        }
    `;

    // ─── HTML TEMPLATE ──────────────────────────────────────────
    const windowTemplate = `
        <div class="${CONFIG.prefix}__header">
            <div class="${CONFIG.prefix}__title">
                <div class="${CONFIG.prefix}__title-icon">📊</div>
                <span>Статус уроков</span>
            </div>
            <div class="${CONFIG.prefix}__toolbar">
                <button class="${CONFIG.prefix}__btn ${CONFIG.prefix}__btn--icon" id="${CONFIG.prefix}-clear" title="Очистить поля">🧹</button>
                <button class="${CONFIG.prefix}__btn ${CONFIG.prefix}__btn--icon buttonHide" id="${CONFIG.prefix}-hide" title="Скрыть окно">✕</button>
            </div>
        </div>

        <div class="${CONFIG.prefix}__controls">
            <div class="${CONFIG.prefix}__field-group">
                <span class="${CONFIG.prefix}__label">С</span>
                <input type="date" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--date" id="${CONFIG.prefix}-date-from">
            </div>
            <div class="${CONFIG.prefix}__field-group">
                <span class="${CONFIG.prefix}__label">По</span>
                <input type="date" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--date" id="${CONFIG.prefix}-date-to">
            </div>

            <div class="${CONFIG.prefix}__field-group" style="margin-left: 12px;">
                <span class="${CONFIG.prefix}__label">👽 Учитель</span>
                <input type="text" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--id" id="${CONFIG.prefix}-teacher-id" placeholder="ID" title="ID учителя для поиска">
            </div>
            <div class="${CONFIG.prefix}__field-group">
                <span class="${CONFIG.prefix}__label">🎒 Ученик</span>
                <input type="text" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--id" id="${CONFIG.prefix}-student-id" placeholder="ID" title="Фильтр по ID ученика">
            </div>

            <div class="${CONFIG.prefix}__spacer"></div>

            <button class="${CONFIG.prefix}__btn ${CONFIG.prefix}__btn--primary" id="${CONFIG.prefix}-search">
                <span>🔍 Получить инфо</span>
            </button>
        </div>

        <div class="${CONFIG.prefix}__content" id="${CONFIG.prefix}-content">
            <div class="${CONFIG.prefix}__empty" id="${CONFIG.prefix}-placeholder">
                <div class="${CONFIG.prefix}__empty-icon">📋</div>
                <div>Введите ID учителя и нажмите «Получить инфо»</div>
            </div>
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

    const formatApiDate = (date, hour) => {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year} ${hour}`;
    };

    const getStatusBadge = (status, isRemoved) => {
        if (isRemoved) {
            return `<span class="${CONFIG.prefix}__status ${CONFIG.prefix}__status--removed">🗑 Удалён</span>`;
        }
        if (status === 'success') {
            return `<span class="${CONFIG.prefix}__status ${CONFIG.prefix}__status--success">✓ Проведён</span>`;
        }
        if (status) {
            return `<span class="${CONFIG.prefix}__status ${CONFIG.prefix}__status--error">✕ ${status}</span>`;
        }
        return `<span class="${CONFIG.prefix}__status ${CONFIG.prefix}__status--unknown">? Неизвестно</span>`;
    };

    const getStatusColor = (status, isRemoved) => {
        if (isRemoved || (status && status !== 'success')) return 'tomato';
        if (status === 'success') return '#50e850';
        return 'orange';
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
            content.innerHTML = `
                <div class="${CONFIG.prefix}__empty">
                    <div class="${CONFIG.prefix}__empty-icon">🔍</div>
                    <div>Уроков не найдено</div>
                </div>
            `;
            return;
        }

        const headers = [
            { key: 'studentId', label: '🆔 Ученик', class: `${CONFIG.prefix}__cell--id` },
            { key: 'startAt', label: '📆 Дата урока', class: '' },
            { key: 'status', label: '⚡ Статус', class: '' },
            { key: 'createdAt', label: '📅 Отмечен', class: '' },
            { key: 'createdBy', label: '❓ Кем', class: '' },
            { key: 'type', label: '💦 Тип', class: `${CONFIG.prefix}__cell--type` },
            { key: 'comment', label: '💬 Комментарий', class: `${CONFIG.prefix}__cell--comment` },
            { key: 'removedBy', label: '❌ Удалил', class: `${CONFIG.prefix}__cell--id` },
            { key: 'removedAt', label: '📅 Удалён', class: '' }
        ];

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
                    <td>${status?.createdByUserId || ''}</td>
                    <td class="${CONFIG.prefix}__cell--type">${cls.type || ''}</td>
                    <td class="${CONFIG.prefix}__cell--comment" title="${status?.comment || ''}">
                        ${status?.comment || ''}
                    </td>
                    <td class="${CONFIG.prefix}__cell--id" data-id="${isRemoved ? cls.studentId : ''}">
                        ${isRemoved ? cls.studentId : ''}
                    </td>
                    <td>${isRemoved ? formatDateTime(cls.removedAt) : ''}</td>
                </tr>
            `;
        }).join('');

        const thead = headers.map(h =>
            `<th>${h.label}</th>`
        ).join('');

        content.innerHTML = `
            <div class="${CONFIG.prefix}__table-wrap">
                <table class="${CONFIG.prefix}__table">
                    <thead><tr>${thead}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;

        // Attach interactions
        // Attach interactions
        $$(`[name="idToCRM"]`, content).forEach(cell => {
            const id = cell.dataset.id;
            if (!id) return;

            cell.addEventListener('click', () => {
                window.open(`https://crm2.skyeng.ru/persons/${id}`, '_blank'); // убран пробел
            });

            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (typeof copyToClipboard === 'function') {
                    copyToClipboard(id).catch(err => {
                        console.log('Не удалось скопировать ID:', err);
                        // Можно добавить визуальный фидбек, если нужно
                    });
                } else {
                    // Fallback на execCommand напрямую, если copyToClipboard недоступна
                    try {
                        const ta = document.createElement('textarea');
                        ta.value = id;
                        ta.style.position = 'fixed';
                        ta.style.left = '-9999px';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                    } catch (err) {
                        console.log('Fallback копирование не сработал:', err);
                    }
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
                <div style="font-size: 12px; opacity: 0.6;">Если информация не появится, нажмите повторно</div>
            </div>
        `;
        state.isLoading = true;
    };

    const fetchLessons = async () => {
        const teacherId = $(`#${CONFIG.prefix}-teacher-id`).value.trim();
        const studentId = $(`#${CONFIG.prefix}-student-id`).value;

        if (!teacherId) {
            createAndShowButton('Введите ID учителя', 'error');
            return;
        }

        showLoading();

        const startEl = $(`#${CONFIG.prefix}-date-from`);
        const endEl = $(`#${CONFIG.prefix}-date-to`);

        const startDate = new Date(startEl.value);
        startDate.setDate(startDate.getDate() - 1);

        const endDate = new Date(endEl.value);

        const from = formatApiDate(startDate, '21') + ':00:00';
        const to = formatApiDate(endDate, '20') + ':59:59';

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `from=${from}&to=${to}&offset=0&filters[teacherIds][]=${teacherId}&callback=getJSONP`,
            credentials: 'include'
        };

        try {
            const response = await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    { action: 'getFetchRequest', fetchURL: CONFIG.apiUrl, requestOptions },
                    (res) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                            return;
                        }
                        if (!res?.success) {
                            reject(new Error(res?.error || 'Unknown error'));
                            return;
                        }
                        resolve(res);
                    }
                );
            });

            const data = JSON.parse(response.fetchansver);
            const classes = data?.[0]?.result?.[0]?.classes;

            if (!classes?.length) {
                createAndShowButton('Уроков нет', 'error');
                $(`#${CONFIG.prefix}-content`).innerHTML = `
                    <div class="${CONFIG.prefix}__empty">
                        <div class="${CONFIG.prefix}__empty-icon">📭</div>
                        <div>Уроков за выбранный период не найдено</div>
                    </div>
                `;
                return;
            }

            renderTable(classes, studentId);

        } catch (err) {
            console.error('[LessonStatus]', err);
            alert('Не удалось проверить авторизацию: ' + err.message);
            $(`#${CONFIG.prefix}-content`).innerHTML = `
                <div class="${CONFIG.prefix}__empty">
                    <div class="${CONFIG.prefix}__empty-icon">⚠️</div>
                    <div>Ошибка загрузки: ${err.message}</div>
                </div>
            `;
        } finally {
            state.isLoading = false;
        }
    };

    // ─── DATE MANAGEMENT ────────────────────────────────────────

    const resetDates = () => {
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = String(now.getMonth() + 1).padStart(2, '0');
        const curDay = String(now.getDate()).padStart(2, '0');

        const prevDate = new Date(now);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevYear = prevDate.getFullYear();
        const prevMonth = String(prevDate.getMonth() + 1).padStart(2, '0');

        $(`#${CONFIG.prefix}-date-from`).value = `${prevYear}-${prevMonth}-${curDay}`;
        $(`#${CONFIG.prefix}-date-to`).value = `${curYear}-${curMonth}-${curDay}`;
    };

    const clearAll = () => {
        if (!confirm('Вы уверены, что хотите очистить все поля?')) return;

        resetDates();
        $(`#${CONFIG.prefix}-teacher-id`).value = '';
        $(`#${CONFIG.prefix}-student-id`).value = '';
        $(`#${CONFIG.prefix}-content`).innerHTML = `
            <div class="${CONFIG.prefix}__empty">
                <div class="${CONFIG.prefix}__empty-icon">📋</div>
                <div>Введите ID учителя и нажмите «Получить инфо»</div>
            </div>
        `;
    };

    // ─── WINDOW MANAGEMENT ──────────────────────────────────────

    const toggleWindow = () => {
        const win = state.windowRef;
        const isVisible = win.style.display !== 'none';

        if (isVisible) {
            win.style.display = 'none';
            win.classList.add(`${CONFIG.prefix}--hidden`);

            const clearFlag = localStorage.getItem(CONFIG.storageKey);
            if (clearFlag === '0') {
                $(`#${CONFIG.prefix}-content`).innerHTML = `
                    <div class="${CONFIG.prefix}__empty">
                        <div class="${CONFIG.prefix}__empty-icon">📋</div>
                        <div>Введите ID учителя и нажмите «Получить инфо»</div>
                    </div>
                `;
            }
        } else {
            win.style.display = '';
            win.classList.remove(`${CONFIG.prefix}--hidden`);
            $(`#${CONFIG.prefix}-teacher-id`).focus();
        }

        // Hide menu if exists
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
            // Fallback creation
            state.windowRef = document.createElement('div');
            state.windowRef.id = winId;
            state.windowRef.innerHTML = html;
            document.body.appendChild(state.windowRef);
        }

        // Apply glass class to window container
        if (state.windowRef) {
            state.windowRef.classList.add(`${CONFIG.prefix}-window`);
            state.windowRef.style.cssText += `
                position: fixed;
                z-index: 999999;
                border-radius: 24px;
                overflow: hidden;
            `;
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

        // Enter key on inputs
        [$('teacher-id'), $('student-id')].forEach(el => {
            if (!el) return;
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') fetchLessons();
            });
        });

        // 🔥 AUTO-SEARCH ON PASTE (Ctrl+V / ПКМ → Вставить)
        const triggerAfterPaste = (inputEl) => {
            inputEl.addEventListener('paste', (e) => {
                // Даём браузеру 0 мс на вставку значения в input
                requestAnimationFrame(() => {
                    // Ещё один кадр на всякий случай для старых браузеров
                    requestAnimationFrame(() => {
                        // Если teacher заполнен — сразу гоним поиск
                        const teacherVal = $(`#${CONFIG.prefix}-teacher-id`).value.trim();
                        if (teacherVal) {
                            fetchLessons();
                        } else {
                            // Если учитель ещё не введён, просто фокусируемся на него
                            $(`#${CONFIG.prefix}-teacher-id`).focus();
                        }
                    });
                });
            });
        };

        [$(`#${CONFIG.prefix}-teacher-id`), $(`#${CONFIG.prefix}-student-id`)].forEach(el => {
            if (el) triggerAfterPaste(el);
        });

        // Initial state
        resetDates();
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

    // Auto-init if window already exists in DOM
    if (document.getElementById('AF_LessonStatus')) {
        initWindow();
    }

})();