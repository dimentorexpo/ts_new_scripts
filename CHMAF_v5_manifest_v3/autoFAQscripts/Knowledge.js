/**
 * Knowledge Center — «corporate graphite», как AF_helper / Userinfo
 * Совместим с существующими createWindow(...) и кнопкой #knowledgeCenter.
 */
(function () {
    'use strict';

    if (document.getElementById('AF_Knowledge')) return;

    const DATA_URL =
        'https://script.google.com/macros/s/AKfycbySlhuMPHSKHiI6Rhoyg797id3lbPg_zdeG_iBoEvYxwqlxkD4QizWm8OJDEucma7tGyg/exec';

    const MAX_VISIBLE_ITEMS = 200;

    const state = {
        data: [],
        loaded: false,
        loading: false,
        selectedId: null,
        searchTimer: null,
        positionTimer: null,
        requestController: null
    };

    const styles = `
        /* Оформление «corporate graphite» — как AF_helper / Userinfo / ChatHistory */
        #AF_Knowledge {
            background: transparent !important;
            border: 0 !important;
            box-shadow: none !important;
        }

        .knw-panel,
        .knw-panel *,
        .knw-solution,
        .knw-solution * {
            box-sizing: border-box;
        }

        .knw-panel,
        .knw-solution {
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI",
                Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 13.5px;
            -webkit-font-smoothing: antialiased;
        }

        .knw-panel {
            width: min(540px, calc(100vw - 24px));
            padding: 0 !important;
            overflow: hidden !important;
            background:
                radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
                #111827 !important;
            border: 1px solid #344258;
            border-radius: 18px;
            box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
        }

        /* --- Шапка: ❌ слева, заголовок, индикатор загрузки справа --- */
        .knw-header {
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

        .knw-header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 40%;
            height: 1px;
            background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
        }

        .knw-header:active { cursor: grabbing; }

        .knw-title {
            flex: 1;
            min-width: 0;
            color: #fefefe;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: .01em;
            text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
        }

        .knw-header-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Индикатор: серый — не загружено, синий — загрузка, зелёный — готово, красный — ошибка */
        .knw-status {
            width: 9px;
            height: 9px;
            flex: 0 0 9px;
            border-radius: 50%;
            background: #7d8ca6;
        }

        .knw-status[data-state="ready"] { background: #86efac; box-shadow: 0 0 6px rgba(134, 239, 172, .6); }
        .knw-status[data-state="loading"] { background: #7799e2; animation: knw-pulse 1.2s ease-in-out infinite; }
        .knw-status[data-state="error"] { background: #fca5a5; box-shadow: 0 0 6px rgba(252, 165, 165, .6); }

        .knw-icon-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 34px;
            width: 34px;
            height: 34px;
            padding: 0;
            color: #dce5f5;
            background: #1b283c;
            border: 1px solid #3c4d68;
            border-radius: 9px;
            font: inherit;
            font-size: 15px;
            line-height: 1;
            cursor: pointer;
            transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
        }

        .knw-icon-button:hover {
            color: #fff;
            background: #293b56;
            border-color: #7799e2;
            transform: translateY(-1px);
        }

        .knw-icon-button.knw-close {
            color: #ffb0be;
            background: rgba(255, 116, 140, .08);
            border-color: rgba(255, 116, 140, .3);
        }

        .knw-icon-button.knw-close:hover {
            background: rgba(255, 116, 140, .16);
            border-color: rgba(255, 116, 140, .55);
        }

        /* --- Поиск и фильтры --- */
        .knw-body { padding: 14px 18px 18px; }

        .knw-search-wrap {
            position: relative;
            margin-bottom: 8px;
        }

        .knw-search-icon {
            position: absolute;
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
            font-size: 14px;
            line-height: 1;
            pointer-events: none;
        }

        .knw-input,
        .knw-select {
            min-width: 0;
            height: 36px;
            color: #edf2fb;
            color-scheme: dark;
            background: #0d1625;
            border: 1px solid #3a4961;
            border-radius: 10px;
            outline: none;
            font: inherit;
            font-size: 13.5px;
            font-weight: 500;
            transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
        }

        .knw-input {
            display: block;
            width: 100%;
            padding: 0 12px 0 36px;
        }

        .knw-input::placeholder { color: #7d8ca6; font-weight: 400; }

        .knw-input:focus,
        .knw-select:focus {
            background: #142034;
            border-color: #829fff;
            box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
        }

        .knw-filters {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .knw-select {
            width: 100%;
            padding: 0 10px;
            cursor: pointer;
        }

        .knw-select:disabled { opacity: .5; cursor: not-allowed; }

        .knw-select option { color: #edf2fb; background: #111827; }

        /* Заголовок списка — как секции в Userinfo */
        .knw-list-heading {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 14px 0 8px;
            color: #fefefe;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
        }

        .knw-list-heading::after {
            content: '';
            order: 1;
            flex: 1;
            height: 1px;
            background: linear-gradient(90deg, rgba(66, 104, 201, .4), transparent);
        }

        .knw-count {
            order: 2;
            padding: 1px 8px;
            color: #a9c0ff;
            background: rgba(66, 104, 201, .14);
            border: 1px solid rgba(119, 153, 226, .35);
            border-radius: 999px;
            font-size: 11px;
            letter-spacing: 0;
            text-transform: none;
            font-variant-numeric: tabular-nums;
        }

        .knw-count:empty { display: none; }

        /* --- Список материалов --- */
        .knw-scroll-area {
            min-height: 110px;
            max-height: min(390px, 48vh);
            overflow: auto;
            overscroll-behavior: contain;
            padding: 1px 4px 1px 1px;
            scrollbar-width: thin;
            scrollbar-color: rgba(66, 104, 201, .4) transparent;
        }

        .knw-scroll-area::-webkit-scrollbar,
        .knw-solution::-webkit-scrollbar { width: 4px; }

        .knw-scroll-area::-webkit-scrollbar-thumb,
        .knw-solution::-webkit-scrollbar-thumb {
            border-radius: 8px;
            background: rgba(66, 104, 201, .3);
        }

        .knw-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
            margin: 0 0 6px;
            padding: 10px 12px;
            color: #f1f5f9;
            background: #1a2536;
            border: 1px solid #344258;
            border-left: 3px solid #617fbd;
            border-radius: 10px;
            text-align: left;
            font: inherit;
            cursor: pointer;
            transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
        }

        .knw-item:hover {
            background: #23334b;
            border-color: #6685be;
            border-left-color: #92afff;
            transform: translateX(2px);
        }

        .knw-item.active {
            background: rgba(66, 104, 201, .2);
            border-color: #7293ed;
            border-left-color: #a9c0ff;
        }

        .knw-item-main { min-width: 0; }

        .knw-item-title {
            display: block;
            overflow-wrap: anywhere;
            font-size: 13.5px;
            font-weight: 600;
            line-height: 1.45;
        }

        .knw-item-meta {
            display: block;
            margin-top: 3px;
            color: #94a3b8;
            font-size: 12px;
            line-height: 1.35;
        }

        .knw-item-arrow {
            flex: 0 0 auto;
            color: #7d8ca6;
            font-size: 16px;
            transition: color .16s ease, transform .16s ease;
        }

        .knw-item:hover .knw-item-arrow,
        .knw-item.active .knw-item-arrow { color: #a9c0ff; transform: translateX(2px); }

        .knw-empty {
            display: grid;
            place-items: center;
            min-height: 110px;
            padding: 20px;
            color: #94a3b8;
            border: 1px dashed rgba(66, 104, 201, .3);
            border-radius: 12px;
            text-align: center;
            font-size: 13.5px;
            line-height: 1.6;
        }

        .knw-retry {
            margin-top: 10px;
            height: 34px;
            padding: 0 14px;
            color: #fff;
            background: #4268c9;
            border: 1px solid #7293ed;
            border-radius: 9px;
            font: inherit;
            font-weight: 600;
            cursor: pointer;
        }

        .knw-retry:hover { background: #547ce1; }

        /* --- Окно материала --- */
        .knw-solution {
            position: fixed;
            z-index: 2147483000;
            width: min(480px, calc(100vw - 24px));
            max-height: calc(100vh - 24px);
            max-height: calc(100dvh - 24px);
            overflow: auto;
            padding: 0 18px 18px;
            background: #111827;   /* однотонный: шапка «прилипает» при прокрутке и не должна выделяться */
            border: 1px solid #344258;
            border-radius: 18px;
            box-shadow: 0 26px 70px rgba(3, 9, 22, .6), inset 0 1px rgba(255, 255, 255, .06);
            scrollbar-width: thin;
            scrollbar-color: rgba(66, 104, 201, .4) transparent;
        }

        .knw-solution[hidden] { display: none !important; }

        .knw-solution-head {
            position: sticky;
            top: 0;
            z-index: 1;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 18px 0 12px;
            background: #111827;
            border-bottom: 1px solid rgba(66, 104, 201, .15);
        }

        .knw-solution-head::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 40%;
            height: 1px;
            background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
        }

        .knw-solution-label {
            margin-bottom: 4px;
            color: #94a3b8;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: .08em;
            text-transform: uppercase;
        }

        .knw-solution-title {
            margin: 0;
            color: #fefefe;
            font-size: 16px;
            font-weight: 700;
            line-height: 1.35;
            overflow-wrap: anywhere;
        }

        .knw-article {
            padding-top: 6px;
            color: #dce5f5;
            font-size: 14px;
            line-height: 1.7;
            overflow-wrap: anywhere;
        }

        .knw-article h1,
        .knw-article h2,
        .knw-article h3,
        .knw-article h4 {
            margin: 18px 0 8px;
            color: #fefefe;
            line-height: 1.35;
        }

        .knw-article p { margin: 10px 0; }
        .knw-article ul,
        .knw-article ol { padding-left: 22px; }

        .knw-article a { color: #a9c0ff; text-underline-offset: 3px; }
        .knw-article a:hover { color: #d1e0ff; }

        .knw-article img {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 12px 0;
            border: 1px solid #344258;
            border-radius: 10px;
        }

        .knw-article pre,
        .knw-article code {
            font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Consolas, monospace;
            font-size: .92em;
        }

        .knw-article code {
            padding: 1px 5px;
            background: #0d1625;
            border-radius: 5px;
        }

        .knw-article pre {
            overflow: auto;
            padding: 12px;
            background: #0d1625;
            border: 1px solid #344258;
            border-radius: 10px;
        }

        .knw-article pre code { padding: 0; background: none; }

        .knw-article blockquote {
            margin: 12px 0;
            padding: 6px 12px;
            color: #cbd5e1;
            background: rgba(66, 104, 201, .1);
            border-left: 3px solid #92afff;
            border-radius: 0 8px 8px 0;
        }

        .knw-article table {
            display: block;
            max-width: 100%;
            overflow-x: auto;
            border-collapse: collapse;
        }

        .knw-article th,
        .knw-article td {
            padding: 7px 9px;
            border: 1px solid #344258;
            text-align: left;
        }

        .knw-article th { color: #94a3b8; background: #162133; }

        .knw-panel :focus-visible,
        .knw-solution :focus-visible {
            outline: 2px solid #9ab5ff;
            outline-offset: 2px;
        }

        @keyframes knw-pulse { 50% { opacity: .4; } }

        @media (max-width: 420px) {
            .knw-header { margin: 0 14px; }
            .knw-body { padding: 12px 14px 14px; }
            .knw-solution { padding: 0 14px 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
            .knw-panel *,
            .knw-solution * {
                animation: none !important;
                transition: none !important;
            }
        }
    `;

    if (!document.getElementById('knw-styles')) {
        const style = document.createElement('style');
        style.id = 'knw-styles';
        style.textContent = styles;
        document.head.appendChild(style);
    }

    const windowMarkup = `
        <div class="knw-panel">
            <div class="knw-header chmaf-drag-handle" id="knw_drag_handle">
                <button
                    id="hideMeKnowledge"
                    class="knw-icon-button knw-close"
                    type="button"
                    aria-label="Закрыть базу знаний"
                    title="Скрыть окно"
                >❌</button>

                <div class="knw-title">📚 База знаний</div>

                <div class="knw-header-actions">
                    <span
                        id="knw-status"
                        class="knw-status"
                        data-state="idle"
                        role="status"
                        aria-label="Данные не загружены"
                        title="Данные не загружены"
                    ></span>
                </div>
            </div>

            <div class="knw-body">
                <div class="knw-search-wrap">
                    <span class="knw-search-icon" aria-hidden="true">🔎</span>
                    <input
                        id="knw-search"
                        class="knw-input"
                        type="search"
                        autocomplete="off"
                        aria-label="Поиск по базе знаний"
                        placeholder="Поиск по базе знаний…"
                    >
                </div>

                <div class="knw-filters">
                    <select id="knw-type" class="knw-select" aria-label="Тип урока">
                        <option value="">Все типы уроков</option>
                    </select>
                    <select
                        id="knw-cat"
                        class="knw-select"
                        aria-label="Категория"
                        disabled
                    >
                        <option value="">Все категории</option>
                    </select>
                </div>

                <div class="knw-list-heading">
                    <span>Материалы</span>
                    <span id="knw-count" class="knw-count"></span>
                </div>

                <div id="knw-list" class="knw-scroll-area">
                    <div class="knw-empty">Откройте базу знаний для загрузки материалов.</div>
                </div>
            </div>
        </div>
    `;

    createWindow(
        'AF_Knowledge',
        'winTopKnwoledge',
        'winLeftKnwoledge',
        windowMarkup
    );

    const dom = {
        win: document.getElementById('AF_Knowledge'),
        panel: document.querySelector('#AF_Knowledge .knw-panel'),
        search: document.getElementById('knw-search'),
        type: document.getElementById('knw-type'),
        category: document.getElementById('knw-cat'),
        list: document.getElementById('knw-list'),
        count: document.getElementById('knw-count'),
        status: document.getElementById('knw-status'),
        closeWindow: document.getElementById('hideMeKnowledge')
    };

    if (!dom.win || !dom.panel || !dom.list) return;

    // Окно ответа вынесено в body: родительское окно не обрезает его
    // своим overflow и не меняет систему координат.
    const solution = document.createElement('section');
    solution.id = 'knw-solution';
    solution.className = 'knw-solution';
    solution.hidden = true;
    solution.setAttribute('aria-label', 'Содержание материала');
    solution.innerHTML = `
        <div class="knw-solution-head">
            <button
                class="knw-icon-button knw-close"
                id="knw-close-solution"
                type="button"
                aria-label="Закрыть материал"
                title="Закрыть материал"
            >❌</button>
            <div style="min-width: 0;">
                <div class="knw-solution-label">📄 Материал базы знаний</div>
                <h2 class="knw-solution-title" id="knw-solution-title"></h2>
            </div>
        </div>
        <div class="knw-article" id="knw-article"></div>
    `;
    document.body.appendChild(solution);

    const solutionTitle = solution.querySelector('#knw-solution-title');
    const article = solution.querySelector('#knw-article');

    function setStatus(value, label) {
        dom.status.dataset.state = value;
        dom.status.setAttribute('aria-label', label);
        dom.status.title = label;
    }

    function showMessage(message, withRetry = false) {
        dom.list.replaceChildren();

        const box = document.createElement('div');
        box.className = 'knw-empty';

        const content = document.createElement('div');
        content.textContent = message;
        box.appendChild(content);

        if (withRetry) {
            const retry = document.createElement('button');
            retry.type = 'button';
            retry.className = 'knw-retry';
            retry.dataset.action = 'retry';
            retry.textContent = 'Повторить загрузку';
            box.appendChild(retry);
        }

        dom.list.appendChild(box);
        dom.count.textContent = '';
    }

    function fillSelect(select, values, placeholder) {
        select.replaceChildren(new Option(placeholder, ''));

        [...new Set(values)]
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'ru'))
            .forEach(value => select.add(new Option(value, value)));
    }

    function updateCategories() {
        const type = dom.type.value;
        const previous = dom.category.value;

        const categories = state.data
            .filter(item => !type || item.type === type)
            .map(item => item.category);

        fillSelect(dom.category, categories, 'Все категории');
        dom.category.disabled = categories.length === 0;

        if ([...dom.category.options].some(option => option.value === previous)) {
            dom.category.value = previous;
        }
    }

    function isWindowVisible() {
        return getComputedStyle(dom.win).display !== 'none';
    }

    function positionSolution() {
        if (solution.hidden) return;

        // Окно базы скрыли сторонним кодом (двойной клик, кнопка меню) —
        // материал не должен остаться висеть на странице сам по себе.
        if (!isWindowVisible()) {
            closeSolution();
            return;
        }

        const rect = dom.panel.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const gap = 12;
        const minimumSideWidth = 350;
        const preferredWidth = 480;

        const rightSpace = viewportWidth - rect.right - gap - 12;
        const leftSpace = rect.left - gap - 12;

        let left;
        let width;

        if (rightSpace >= minimumSideWidth) {
            width = Math.min(preferredWidth, rightSpace);
            left = rect.right + gap;
        } else if (leftSpace >= minimumSideWidth) {
            width = Math.min(preferredWidth, leftSpace);
            left = rect.left - gap - width;
        } else {
            // На узком экране ответ показывается поверх окна,
            // но всегда остаётся внутри видимой области.
            width = Math.min(preferredWidth, viewportWidth - 24);
            left = Math.max(12, (viewportWidth - width) / 2);
        }

        const maxTop = Math.max(12, viewportHeight - 120);
        const top = Math.max(12, Math.min(rect.top, maxTop));

        solution.style.width = `${width}px`;
        solution.style.left = `${left}px`;
        solution.style.top = `${top}px`;
    }

    function closeSolution() {
        solution.hidden = true;
        clearInterval(state.positionTimer);
        state.positionTimer = null;

        dom.list.querySelectorAll('.knw-item.active').forEach(button => {
            button.classList.remove('active');
        });

        state.selectedId = null;
    }

    /**
     * Ответ из таблицы может содержать HTML-разметку.
     * Разрешаем только безопасный набор тегов и атрибутов.
     */
    function sanitizeArticle(html) {
        const source = new DOMParser().parseFromString(
            String(html ?? ''),
            'text/html'
        );

        const allowedTags = new Set([
            'P', 'DIV', 'SPAN', 'BR', 'HR',
            'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
            'STRONG', 'B', 'EM', 'I', 'U', 'S',
            'UL', 'OL', 'LI', 'BLOCKQUOTE',
            'PRE', 'CODE', 'SUP', 'SUB',
            'TABLE', 'THEAD', 'TBODY', 'TFOOT',
            'TR', 'TH', 'TD',
            'A', 'IMG', 'DETAILS', 'SUMMARY'
        ]);

        const discardedTags = new Set([
            'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED',
            'FORM', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA',
            'SVG', 'MATH', 'LINK', 'META', 'BASE', 'TEMPLATE'
        ]);

        function safeUrl(raw, image = false) {
            try {
                const url = new URL(raw, document.baseURI);
                const allowed = image
                    ? ['http:', 'https:']
                    : ['http:', 'https:', 'mailto:', 'tel:'];

                return allowed.includes(url.protocol) ? url.href : null;
            } catch {
                return null;
            }
        }

        function copyNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                return document.createTextNode(node.textContent);
            }

            if (node.nodeType !== Node.ELEMENT_NODE) return null;
            if (discardedTags.has(node.tagName)) return null;

            const fragment = document.createDocumentFragment();
            const element = allowedTags.has(node.tagName)
                ? document.createElement(node.tagName.toLowerCase())
                : fragment;

            if (node.tagName === 'A') {
                const href = safeUrl(node.getAttribute('href'));
                if (href) {
                    element.setAttribute('href', href);
                    element.setAttribute('target', '_blank');
                    element.setAttribute('rel', 'noopener noreferrer');
                }
            }

            if (node.tagName === 'IMG') {
                const src = safeUrl(node.getAttribute('src'), true);
                if (!src) return null;

                element.setAttribute('src', src);
                element.setAttribute('alt', node.getAttribute('alt') || '');
                element.setAttribute('loading', 'lazy');
            }

            if (node.tagName === 'TH' || node.tagName === 'TD') {
                for (const attr of ['colspan', 'rowspan']) {
                    const value = Number(node.getAttribute(attr));
                    if (Number.isInteger(value) && value >= 1 && value <= 20) {
                        element.setAttribute(attr, String(value));
                    }
                }
            }

            for (const child of node.childNodes) {
                const cleanChild = copyNode(child);
                if (cleanChild) element.appendChild(cleanChild);
            }

            return element;
        }

        const result = document.createDocumentFragment();

        for (const child of source.body.childNodes) {
            const cleanChild = copyNode(child);
            if (cleanChild) result.appendChild(cleanChild);
        }

        return result;
    }

    function openSolution(item, button) {
        closeSolution();

        state.selectedId = item.id;
        button.classList.add('active');
        solutionTitle.textContent = item.title;

        article.replaceChildren(sanitizeArticle(item.content));

        if (!article.textContent.trim() && !article.querySelector('img')) {
            article.textContent = 'Содержание для этого материала пока не добавлено.';
        }

        solution.hidden = false;
        solution.scrollTop = 0;
        positionSolution();

        // Положение обновляется и при перетаскивании окна сторонним кодом.
        state.positionTimer = window.setInterval(positionSolution, 150);
    }

    function renderItems() {
        closeSolution();

        if (state.loading) {
            showMessage('Загружаем материалы…');
            return;
        }

        if (!state.loaded) return;

        const query = dom.search.value.trim().toLocaleLowerCase('ru');
        const type = dom.type.value;
        const category = dom.category.value;

        if (!query && !type && !category) {
            showMessage('Выберите тип урока или начните поиск.');
            return;
        }

        const filtered = state.data.filter(item => {
            if (type && item.type !== type) return false;
            if (category && item.category !== category) return false;

            if (!query) return true;

            return [item.title, item.type, item.category]
                .some(value => value.toLocaleLowerCase('ru').includes(query));
        });

        if (!filtered.length) {
            showMessage('Ничего не найдено. Попробуйте другой запрос или фильтр.');
            return;
        }

        const fragment = document.createDocumentFragment();

        for (const item of filtered.slice(0, MAX_VISIBLE_ITEMS)) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'knw-item';
            button.dataset.id = String(item.id);

            const main = document.createElement('span');
            main.className = 'knw-item-main';

            const title = document.createElement('span');
            title.className = 'knw-item-title';
            title.textContent = item.title;

            const meta = document.createElement('span');
            meta.className = 'knw-item-meta';
            meta.textContent = [item.type, item.category]
                .filter(Boolean)
                .join('  /  ');

            const arrow = document.createElement('span');
            arrow.className = 'knw-item-arrow';
            arrow.setAttribute('aria-hidden', 'true');
            arrow.textContent = '↗';

            main.append(title, meta);
            button.append(main, arrow);
            fragment.appendChild(button);
        }

        dom.list.replaceChildren(fragment);

        dom.count.textContent = filtered.length > MAX_VISIBLE_ITEMS
            ? `${MAX_VISIBLE_ITEMS} из ${filtered.length}`
            : String(filtered.length);
    }

    async function loadData() {
        if (state.loading || state.loaded) return;

        state.loading = true;
        setStatus('loading', 'Загрузка данных');
        renderItems();

        const controller = new AbortController();
        state.requestController = controller;
        const timeout = window.setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(DATA_URL, {
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const json = await response.json();

            if (!Array.isArray(json.result)) {
                throw new Error('Некорректный формат ответа');
            }

            state.data = json.result
                .filter(Array.isArray)
                .map((row, id) => ({
                    id,
                    type: String(row[0] ?? '').trim(),
                    category: String(row[1] ?? '').trim(),
                    title: String(row[2] ?? '').trim(),
                    content: String(row[3] ?? '')
                }))
                .filter(item => item.title);

            state.loaded = true;

            fillSelect(
                dom.type,
                state.data.map(item => item.type),
                'Все типы уроков'
            );

            updateCategories();
            setStatus('ready', 'Данные загружены');

            state.loading = false;

            if (state.data.length) {
                renderItems();
            } else {
                showMessage('В базе знаний пока нет материалов.');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('Knowledge Center: превышено время ожидания.');
            } else {
                console.error('Knowledge Center: ошибка загрузки.', error);
            }

            state.loading = false;
            setStatus('error', 'Ошибка загрузки данных');
            showMessage('Не удалось загрузить материалы.', true);
        } finally {
            clearTimeout(timeout);
            state.requestController = null;
        }
    }

    function closeWindow() {
        closeSolution();
        dom.win.style.display = 'none';
        document.getElementById('knowledgeCenter')?.classList.remove('active');
    }

    dom.closeWindow.addEventListener('click', closeWindow);

    solution
        .querySelector('#knw-close-solution')
        .addEventListener('click', closeSolution);

    dom.type.addEventListener('change', () => {
        dom.category.value = '';
        updateCategories();
        renderItems();
    });

    dom.category.addEventListener('change', renderItems);

    dom.search.addEventListener('input', () => {
        clearTimeout(state.searchTimer);
        state.searchTimer = window.setTimeout(renderItems, 120);
    });

    dom.list.addEventListener('click', event => {
        const retry = event.target.closest('[data-action="retry"]');

        if (retry) {
            loadData();
            return;
        }

        const button = event.target.closest('.knw-item');
        if (!button || !dom.list.contains(button)) return;

        const item = state.data.find(
            entry => entry.id === Number(button.dataset.id)
        );

        if (item) openSolution(item, button);
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || !isWindowVisible()) return;

        // Esc в поле ввода чата или другом окне не должен закрывать базу знаний.
        const active = document.activeElement;
        const insideKnowledge = active &&
            (dom.win.contains(active) || solution.contains(active));
        const isEditable = active &&
            (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName));
        if (isEditable && !insideKnowledge) return;

        if (!solution.hidden) {
            closeSolution();
        } else {
            closeWindow();
        }
    });

    window.addEventListener('resize', positionSolution);
    window.addEventListener('scroll', positionSolution, true);

    // Публичное имя сохранено для существующей кнопки сайта.
    window.getknowledgeCenterButtonPress = () => {
        if (isWindowVisible()) {
            closeWindow();
            return;
        }

        dom.win.style.display = '';
        document.getElementById('knowledgeCenter')?.classList.add('active');

        if (!state.loaded) loadData();
    };

    // Если createWindow открыл окно сразу, данные тоже будут загружены.
    if (isWindowVisible()) loadData();
})();