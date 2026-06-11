/**
 * ==========================================
 * CRYSTAL GLASS LESSON STATUS MODULE
 * Премиальный интерфейс проверки статусов уроков
 * Стиль: Crystal Glassmorphism Dark UI
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
        isLoading: false,
        windowRef: null
    };

    // ─── UNIQUE CSS STYLES ──────────────────────────────────────
    const glassStyles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        :root {
            --gls-bg: rgba(8, 8, 22, 0.88);
            --gls-bg-card: rgba(16, 18, 38, 0.7);
            --gls-border: rgba(255, 255, 255, 0.06);
            --gls-border-glow: rgba(124, 58, 237, 0.3);
            --gls-accent: #8b5cf6;
            --gls-accent-soft: rgba(139, 92, 246, 0.12);
            --gls-accent-glow: rgba(139, 92, 246, 0.35);
            --gls-cyan: #22d3ee;
            --gls-cyan-soft: rgba(34, 211, 238, 0.1);
            --gls-text: #f1f5f9;
            --gls-text-secondary: #94a3b8;
            --gls-text-muted: #64748b;
            --gls-success: #34d399;
            --gls-error: #f87171;
            --gls-radius: 16px;
        }

        /* === CORE WINDOW === */
        #${CONFIG.prefix}-window {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            position: fixed !important;
            z-index: 999999 !important;
            width: 1120px;
            border-radius: var(--gls-radius);
            background: var(--gls-bg);
            backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
            -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
            border: 1px solid var(--gls-border);
            box-shadow:
                0 25px 60px -12px rgba(0, 0, 0, 0.6),
                0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                0 0 80px rgba(124, 58, 237, 0.06) inset;
            overflow: hidden;
            transition: opacity ${CONFIG.animDuration}ms ease, transform ${CONFIG.animDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: default;
        }
        #${CONFIG.prefix}-window::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), rgba(34, 211, 238, 0.4), transparent);
            z-index: 10;
        }
        #${CONFIG.prefix}-window::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(ellipse at 30% 20%, rgba(139, 92, 246, 0.04) 0%, transparent 50%),
                        radial-gradient(ellipse at 70% 80%, rgba(34, 211, 238, 0.03) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
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
            padding: 18px 24px 14px;
            background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
            border-bottom: 1px solid var(--gls-border);
            cursor: grab;
            user-select: none;
            position: relative;
            z-index: 5;
        }
        .${CONFIG.prefix}__header:active { cursor: grabbing; }

        .${CONFIG.prefix}__title {
            color: var(--gls-text);
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.2px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .${CONFIG.prefix}__title-icon {
            width: 34px;
            height: 34px;
            background: linear-gradient(135deg, var(--gls-accent-soft), rgba(34, 211, 238, 0.08));
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            box-shadow: 0 0 16px rgba(139, 92, 246, 0.1);
        }

        .${CONFIG.prefix}__toolbar {
            display: flex;
            gap: 6px;
        }

        /* === GLASS BUTTONS === */
        .${CONFIG.prefix}__btn {
            position: relative;
            padding: 8px 16px;
            border-radius: 10px;
            border: 1px solid var(--gls-border);
            background: rgba(255, 255, 255, 0.04);
            color: var(--gls-text-secondary);
            font-family: inherit;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            overflow: hidden;
            outline: none;
            user-select: none;
        }

        .${CONFIG.prefix}__btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.08), transparent);
            opacity: 0;
            transition: opacity 0.2s;
        }

        .${CONFIG.prefix}__btn:hover {
            color: var(--gls-text);
            border-color: rgba(255,255,255,0.12);
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }

        .${CONFIG.prefix}__btn:hover::before { opacity: 1; }

        .${CONFIG.prefix}__btn:active {
            transform: scale(0.97);
            transition-duration: 0.05s;
        }

        .${CONFIG.prefix}__btn--primary {
            background: linear-gradient(135deg, var(--gls-accent), #6d28d9);
            border-color: rgba(139, 92, 246, 0.5);
            color: #fff;
            box-shadow: 0 2px 12px rgba(139, 92, 246, 0.3);
            letter-spacing: 0.3px;
        }
        .${CONFIG.prefix}__btn--primary:hover {
            background: linear-gradient(135deg, #9b6ef8, #7c3aed);
            box-shadow: 0 4px 24px rgba(139, 92, 246, 0.4);
            transform: translateY(-1px);
            color: #fff;
        }

        .${CONFIG.prefix}__btn--danger {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.2);
            color: var(--gls-error);
            padding: 8px 12px;
            font-size: 15px;
        }
        .${CONFIG.prefix}__btn--danger:hover {
            background: rgba(239, 68, 68, 0.18);
            box-shadow: 0 4px 16px rgba(239, 68, 68, 0.15);
        }

        .${CONFIG.prefix}__btn--icon {
            padding: 8px;
            width: 34px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
        }

        /* === CONTROLS BAR === */
        .${CONFIG.prefix}__controls {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 24px;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid var(--gls-border);
            flex-wrap: wrap;
            position: relative;
            z-index: 5;
        }

        .${CONFIG.prefix}__field-group {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .${CONFIG.prefix}__label {
            color: var(--gls-text-muted);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            white-space: nowrap;
        }

        .${CONFIG.prefix}__input {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 8px;
            padding: 8px 12px;
            color: var(--gls-text);
            font-family: inherit;
            font-size: 13px;
            outline: none;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .${CONFIG.prefix}__input:hover { border-color: rgba(255,255,255,0.1); }

        .${CONFIG.prefix}__input:focus {
            border-color: var(--gls-accent);
            box-shadow: 0 0 0 3px var(--gls-accent-soft), 0 0 16px rgba(139, 92, 246, 0.08);
            background: rgba(0, 0, 0, 0.4);
        }

        .${CONFIG.prefix}__input::placeholder { color: var(--gls-text-muted); }

        .${CONFIG.prefix}__input--date {
            width: 130px;
            color-scheme: dark;
        }

        .${CONFIG.prefix}__input--id {
            width: 110px;
            text-align: center;
            font-variant-numeric: tabular-nums;
            font-weight: 600;
        }

        .${CONFIG.prefix}__spacer { flex: 1; min-width: 20px; }

        /* === CONTENT AREA === */
        .${CONFIG.prefix}__content {
            padding: 0 24px 24px;
            max-height: ${CONFIG.maxTableHeight}px;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
            z-index: 5;
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.25) transparent;
        }

        .${CONFIG.prefix}__content::-webkit-scrollbar { width: 5px; }
        .${CONFIG.prefix}__content::-webkit-scrollbar-track { background: transparent; }
        .${CONFIG.prefix}__content::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.25);
            border-radius: 3px;
        }
        .${CONFIG.prefix}__content::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.4);
        }

        /* === TABLE === */
        .${CONFIG.prefix}__table-wrap {
            border-radius: var(--gls-radius);
            overflow: hidden;
            border: 1px solid var(--gls-border);
            background: var(--gls-bg-card);
        }

        .${CONFIG.prefix}__table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 13px;
            color: rgba(255,255,255,0.85);
        }

        .${CONFIG.prefix}__table thead th {
            background: linear-gradient(180deg, rgba(139, 92, 246, 0.08), rgba(0, 0, 0, 0.15));
            padding: 12px 12px;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: var(--gls-text-secondary);
            border-bottom: 1px solid var(--gls-border);
            position: sticky;
            top: 0;
            z-index: 2;
            white-space: nowrap;
        }

        .${CONFIG.prefix}__table tbody tr {
            transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .${CONFIG.prefix}__table tbody tr:hover {
            background: rgba(139, 92, 246, 0.04);
        }

        .${CONFIG.prefix}__table tbody tr:not(:last-child) td {
            border-bottom: 1px solid rgba(255, 255, 255, 0.03);
        }

        .${CONFIG.prefix}__table td {
            padding: 10px 12px;
            text-align: center;
            font-size: 12px;
        }

        .${CONFIG.prefix}__cell--id {
            font-weight: 700;
            color: var(--gls-accent);
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 6px;
            font-family: 'SF Mono', 'Fira Code', monospace;
            font-size: 11px;
        }

        .${CONFIG.prefix}__cell--id:hover {
            background: var(--gls-accent-soft);
            color: #c4b5fd;
            text-shadow: 0 0 10px var(--gls-accent-glow);
        }

        .${CONFIG.prefix}__status {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            border: 1px solid;
        }

        .${CONFIG.prefix}__status--success {
            background: rgba(34, 197, 94, 0.1);
            color: var(--gls-success);
            border-color: rgba(34, 197, 94, 0.2);
            box-shadow: 0 0 12px rgba(34, 197, 94, 0.08);
        }

        .${CONFIG.prefix}__status--error {
            background: rgba(239, 68, 68, 0.1);
            color: var(--gls-error);
            border-color: rgba(239, 68, 68, 0.2);
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.08);
        }

        .${CONFIG.prefix}__status--removed {
            background: rgba(239, 68, 68, 0.12);
            color: #fca5a5;
            border-color: rgba(252, 165, 165, 0.2);
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.1);
        }

        .${CONFIG.prefix}__status--unknown {
            background: rgba(100, 116, 139, 0.1);
            color: var(--gls-text-muted);
            border-color: rgba(100, 116, 139, 0.15);
        }

        .${CONFIG.prefix}__cell--comment {
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--gls-text-muted);
            font-size: 11px;
        }

        .${CONFIG.prefix}__cell--type {
            font-size: 10px;
            color: var(--gls-text-muted);
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
            gap: 14px;
            color: var(--gls-text-muted);
        }

        .${CONFIG.prefix}__spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(139, 92, 246, 0.15);
            border-top-color: var(--gls-accent);
            border-radius: 50%;
            animation: ${CONFIG.prefix}-spin 0.7s linear infinite;
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
        }

        @keyframes ${CONFIG.prefix}-spin { to { transform: rotate(360deg); } }

        .${CONFIG.prefix}__empty {
            text-align: center;
            padding: 50px 20px;
            color: var(--gls-text-muted);
        }

        .${CONFIG.prefix}__empty-icon {
            font-size: 44px;
            margin-bottom: 10px;
            opacity: 0.3;
        }
    `;

    // ─── HTML TEMPLATE ──────────────────────────────────────────
    const windowTemplate = `
        <div class="${CONFIG.prefix}__header" id="${CONFIG.prefix}-drag-handle">
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
                <span class="${CONFIG.prefix}__label">Учитель</span>
                <input type="text" class="${CONFIG.prefix}__input ${CONFIG.prefix}__input--id" id="${CONFIG.prefix}-teacher-id" placeholder="ID" title="ID учителя для поиска">
            </div>
            <div class="${CONFIG.prefix}__field-group">
                <span class="${CONFIG.prefix}__label">Ученик</span>
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

        $$(`[name="idToCRM"]`, content).forEach(cell => {
            const id = cell.dataset.id;
            if (!id) return;

            cell.addEventListener('click', () => {
                window.open(`https://crm2.skyeng.ru/persons/${id}`, '_blank');
            });

            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (typeof copyToClipboard === 'function') {
                    copyToClipboard(id).catch(err => {
                        console.log('Не удалось скопировать ID:', err);
                    });
                } else {
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
                <div style="font-size: 12px; opacity: 0.5;">Если информация не появится, нажмите повторно</div>
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
                z-index: 999999;
                border-radius: 16px;
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

        // Enter key on inputs
        [$(`#${CONFIG.prefix}-teacher-id`), $(`#${CONFIG.prefix}-student-id`)].forEach(el => {
            if (!el) return;
            el.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') fetchLessons();
            });
        });

        // Auto-search on paste
        const triggerAfterPaste = (inputEl) => {
            inputEl.addEventListener('paste', () => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const teacherVal = $(`#${CONFIG.prefix}-teacher-id`).value.trim();
                        if (teacherVal) {
                            fetchLessons();
                        } else {
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
