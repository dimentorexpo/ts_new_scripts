/**
 * Knowledge Center — Graphite / Electric Blue
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
        .knw-panel,
        .knw-panel *,
        .knw-solution,
        .knw-solution * {
            box-sizing: border-box;
        }

        .knw-panel {
            width: min(540px, calc(100vw - 24px));
            padding: 0 !important;
            overflow: hidden !important;
            color: #eaf0fa;
            font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont,
                "Segoe UI", sans-serif;
            background:
                radial-gradient(circle at 8% 0%, rgba(92, 135, 255, .12), transparent 42%),
                linear-gradient(155deg, #1a202e 0%, #10151f 65%, #0d121b 100%) !important;
            border: 1px solid rgba(178, 197, 231, .18);
            border-radius: 20px;
            box-shadow:
                0 28px 75px rgba(0, 0, 0, .55),
                0 1px 0 rgba(255, 255, 255, .07) inset;
        }

        .knw-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            min-height: 78px;
            padding: 16px 18px;
            border-bottom: 1px solid rgba(178, 197, 231, .11);
            cursor: grab;
            user-select: none;
        }

        .knw-header:active { cursor: grabbing; }

        .knw-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }

        .knw-mark {
            display: grid;
            place-items: center;
            flex: 0 0 40px;
            width: 40px;
            height: 40px;
            border: 1px solid rgba(125, 163, 255, .45);
            border-radius: 12px;
            color: #b7cdff;
            background: linear-gradient(145deg, #263c67, #19253d);
            box-shadow: 0 6px 18px rgba(54, 105, 236, .18);
            font-size: 23px;
            line-height: 1;
        }

        .knw-eyebrow {
            margin-bottom: 3px;
            color: #8fa2c1;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .15em;
            text-transform: uppercase;
        }

        .knw-title {
            color: #f5f8ff;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: -.025em;
        }

        .knw-header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .knw-status {
            width: 7px;
            height: 7px;
            flex: 0 0 7px;
            border-radius: 50%;
            background: #74829a;
            box-shadow: 0 0 0 4px rgba(116, 130, 154, .12);
        }

        .knw-status[data-state="ready"] {
            background: #72d6e9;
            box-shadow: 0 0 0 4px rgba(114, 214, 233, .12);
        }

        .knw-status[data-state="loading"] {
            background: #85aaff;
            box-shadow: 0 0 0 4px rgba(133, 170, 255, .13);
            animation: knw-pulse 1.2s ease-in-out infinite;
        }

        .knw-status[data-state="error"] {
            background: #ff8295;
            box-shadow: 0 0 0 4px rgba(255, 130, 149, .12);
        }

        .knw-icon-button {
            display: grid;
            place-items: center;
            flex: 0 0 32px;
            width: 32px;
            height: 32px;
            padding: 0;
            border: 1px solid rgba(178, 197, 231, .15);
            border-radius: 9px;
            color: #b9c7dd;
            background: rgba(255, 255, 255, .035);
            font: inherit;
            font-size: 19px;
            line-height: 1;
            cursor: pointer;
            transition: background .18s, color .18s, border-color .18s;
        }

        .knw-icon-button:hover {
            color: #fff;
            background: rgba(118, 158, 255, .13);
            border-color: rgba(118, 158, 255, .4);
        }

        .knw-body { padding: 17px 18px 18px; }

        .knw-search-wrap {
            position: relative;
            margin-bottom: 11px;
        }

        .knw-search-icon {
            position: absolute;
            top: 50%;
            left: 14px;
            transform: translateY(-50%);
            color: #8799b6;
            font-size: 18px;
            line-height: 1;
            pointer-events: none;
        }

        .knw-input,
        .knw-select {
            min-width: 0;
            border: 1px solid rgba(178, 197, 231, .15);
            border-radius: 11px;
            outline: none;
            color: #edf3ff;
            background: rgba(6, 11, 20, .46);
            font: inherit;
            font-size: 12px;
            transition: border-color .18s, box-shadow .18s, background .18s;
        }

        .knw-input {
            display: block;
            width: 100%;
            height: 43px;
            padding: 0 14px 0 41px;
        }

        .knw-input::placeholder { color: #8291a9; }

        .knw-input:focus,
        .knw-select:focus {
            border-color: #789fff;
            background: rgba(8, 15, 28, .8);
            box-shadow: 0 0 0 3px rgba(102, 147, 255, .15);
        }

        .knw-filters {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .knw-select {
            width: 100%;
            height: 39px;
            padding: 0 11px;
            color-scheme: dark;
            cursor: pointer;
        }

        .knw-select:disabled {
            opacity: .48;
            cursor: not-allowed;
        }

        .knw-select option {
            color: #edf3ff;
            background: #17202e;
        }

        .knw-list-heading {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin: 18px 1px 9px;
            color: #8fa2c1;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .12em;
            text-transform: uppercase;
        }

        .knw-count {
            color: #a9c3ff;
            font-variant-numeric: tabular-nums;
        }

        .knw-scroll-area {
            min-height: 110px;
            max-height: min(390px, 48vh);
            overflow: auto;
            padding: 1px 4px 1px 1px;
            scrollbar-width: thin;
            scrollbar-color: #405474 transparent;
        }

        .knw-scroll-area::-webkit-scrollbar,
        .knw-solution::-webkit-scrollbar { width: 6px; }

        .knw-scroll-area::-webkit-scrollbar-thumb,
        .knw-solution::-webkit-scrollbar-thumb {
            border-radius: 8px;
            background: #405474;
        }

        .knw-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            width: 100%;
            margin: 0 0 7px;
            padding: 12px 13px;
            border: 1px solid rgba(178, 197, 231, .1);
            border-radius: 11px;
            color: #e4ebf7;
            background: rgba(255, 255, 255, .035);
            text-align: left;
            font: inherit;
            cursor: pointer;
            transition:
                border-color .18s,
                background .18s,
                transform .18s,
                box-shadow .18s;
        }

        .knw-item:hover {
            transform: translateY(-1px);
            border-color: rgba(126, 166, 255, .45);
            background: rgba(105, 148, 255, .09);
        }

        .knw-item.active {
            border-color: rgba(126, 166, 255, .65);
            background: linear-gradient(
                110deg,
                rgba(83, 130, 245, .2),
                rgba(83, 130, 245, .07)
            );
            box-shadow: inset 3px 0 0 #82aaff;
        }

        .knw-item-main { min-width: 0; }

        .knw-item-title {
            display: block;
            overflow-wrap: anywhere;
            font-size: 12px;
            font-weight: 600;
            line-height: 1.45;
        }

        .knw-item-meta {
            display: block;
            margin-top: 4px;
            color: #91a3be;
            font-size: 10px;
            line-height: 1.35;
        }

        .knw-item-arrow {
            flex: 0 0 auto;
            color: #89aafb;
            font-size: 18px;
        }

        .knw-empty {
            display: grid;
            place-items: center;
            min-height: 110px;
            padding: 20px;
            border: 1px dashed rgba(178, 197, 231, .16);
            border-radius: 11px;
            color: #a0afc6;
            text-align: center;
            font-size: 12px;
            line-height: 1.6;
        }

        .knw-retry {
            margin-top: 10px;
            padding: 8px 12px;
            border: 1px solid rgba(126, 166, 255, .45);
            border-radius: 8px;
            color: #c5d6ff;
            background: rgba(105, 148, 255, .1);
            font: inherit;
            cursor: pointer;
        }

        .knw-retry:hover { background: rgba(105, 148, 255, .19); }

        .knw-solution {
            position: fixed;
            z-index: 2147483000;
            width: min(480px, calc(100vw - 24px));
            max-height: calc(100vh - 24px);
            max-height: calc(100dvh - 24px);
            overflow: auto;
            padding: 20px;
            border: 1px solid rgba(151, 180, 239, .26);
            border-top: 2px solid #83aaff;
            border-radius: 18px;
            color: #e8eef8;
            background:
                radial-gradient(circle at 100% 0%, rgba(103, 151, 255, .13), transparent 45%),
                #151c29;
            box-shadow: 0 28px 80px rgba(0, 0, 0, .65);
            scrollbar-width: thin;
            scrollbar-color: #405474 transparent;
        }

        .knw-solution[hidden] { display: none !important; }

        .knw-solution-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding-bottom: 16px;
            border-bottom: 1px solid rgba(178, 197, 231, .14);
        }

        .knw-solution-label {
            margin-bottom: 7px;
            color: #98b5ff;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .14em;
            text-transform: uppercase;
        }

        .knw-solution-title {
            margin: 0;
            color: #f6f8ff;
            font-size: 17px;
            line-height: 1.35;
            overflow-wrap: anywhere;
        }

        .knw-article {
            padding-top: 7px;
            color: #d6dfec;
            font-size: 13px;
            line-height: 1.7;
            overflow-wrap: anywhere;
        }

        .knw-article h1,
        .knw-article h2,
        .knw-article h3,
        .knw-article h4 {
            margin: 20px 0 8px;
            color: #f1f5ff;
            line-height: 1.35;
        }

        .knw-article p { margin: 12px 0; }
        .knw-article ul,
        .knw-article ol { padding-left: 22px; }

        .knw-article a {
            color: #a9c5ff;
            text-underline-offset: 3px;
        }

        .knw-article a:hover { color: #d1e0ff; }

        .knw-article img {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 14px 0;
            border-radius: 9px;
        }

        .knw-article pre,
        .knw-article code {
            font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
            font-size: .92em;
        }

        .knw-article pre {
            overflow: auto;
            padding: 13px;
            border: 1px solid rgba(178, 197, 231, .12);
            border-radius: 9px;
            background: #0d1420;
        }

        .knw-article blockquote {
            margin: 14px 0;
            padding: 3px 14px;
            border-left: 2px solid #83aaff;
            color: #b9c9e4;
            background: rgba(105, 148, 255, .06);
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
            border: 1px solid rgba(178, 197, 231, .2);
            text-align: left;
        }

        .knw-panel :focus-visible,
        .knw-solution :focus-visible {
            outline: 2px solid #9dbbff;
            outline-offset: 2px;
        }

        @keyframes knw-pulse {
            50% { opacity: .45; }
        }

        @media (max-width: 420px) {
            .knw-header { padding: 13px 14px; }
            .knw-body { padding: 14px; }
            .knw-solution { padding: 16px; }
        }

        @media (prefers-reduced-motion: reduce) {
            .knw-panel *,
            .knw-solution * {
                animation: none !important;
                transition: none !important;
            }
        }
		
		/* Более комфортный размер текста */
.knw-title {
    font-size: 17px;
}

.knw-eyebrow,
.knw-list-heading,
.knw-solution-label {
    font-size: 11px;
}

.knw-input,
.knw-select {
    font-size: 14px;
}

.knw-item-title {
    font-size: 14px;
    line-height: 1.5;
}

.knw-item-meta {
    font-size: 12px;
}

.knw-empty {
    font-size: 14px;
}

.knw-solution-title {
    font-size: 19px;
}

.knw-article {
    font-size: 15px;
    line-height: 1.75;
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
                <div class="knw-brand">
                    <div class="knw-mark" aria-hidden="true">◇</div>
                    <div>
                        <div class="knw-eyebrow">Knowledge Center</div>
                        <div class="knw-title">База знаний</div>
                    </div>
                </div>

                <div class="knw-header-actions">
                    <span
                        id="knw-status"
                        class="knw-status"
                        data-state="idle"
                        role="status"
                        aria-label="Данные не загружены"
                        title="Данные не загружены"
                    ></span>
                    <button
                        id="hideMeKnowledge"
                        class="knw-icon-button"
                        type="button"
                        aria-label="Закрыть базу знаний"
                        title="Закрыть"
                    >×</button>
                </div>
            </div>

            <div class="knw-body">
                <div class="knw-search-wrap">
                    <span class="knw-search-icon" aria-hidden="true">⌕</span>
                    <input
                        id="knw-search"
                        class="knw-input"
                        type="search"
                        autocomplete="off"
                        aria-label="Поиск по базе знаний"
                        placeholder="Поиск по базе знаний"
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
            <div>
                <div class="knw-solution-label">Материал базы знаний</div>
                <h2 class="knw-solution-title" id="knw-solution-title"></h2>
            </div>
            <button
                class="knw-icon-button"
                id="knw-close-solution"
                type="button"
                aria-label="Закрыть материал"
                title="Закрыть материал"
            >×</button>
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
        if (solution.hidden || !isWindowVisible()) return;

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