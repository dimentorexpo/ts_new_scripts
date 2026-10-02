'use strict';

// ================================================================
// ChMAF — общие утилиты, окна, FAB и загрузка шаблонов
// Порядок загрузки: utils.js → остальные модули → content.js
// ================================================================

// -------------------- ОБЩЕЕ СОСТОЯНИЕ --------------------

let bool = 0;
let table = [];
let opsection = '';

function getOpSection() {
    return String(opsection || '').trim();
}

function isTpOperator() {
    return getOpSection().startsWith('ТП');
}

const DEFAULT_SCRIPT_ADR =
    'https://script.google.com/macros/s/' +
    'AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec';

function readLocalStorage(key, fallback = null) {
    try {
        return localStorage.getItem(key) ?? fallback;
    } catch {
        return fallback;
    }
}

function writeLocalStorage(key, value) {
    try {
        localStorage.setItem(key, String(value));
        return true;
    } catch (error) {
        console.warn(`[ChMAF] Не удалось сохранить ${key}:`, error);
        return false;
    }
}

let scriptAdr =
    readLocalStorage('scriptAdr') ||
    DEFAULT_SCRIPT_ADR;

if (!readLocalStorage('scriptAdr')) {
    writeLocalStorage('scriptAdr', DEFAULT_SCRIPT_ADR);
}

/** @type {ReturnType<typeof setInterval>|null} */
let checkchatsIntervalId = null;

/** @type {ReturnType<typeof setInterval>|null} */
let timerHideButtonsIntervalId = null;

for (const key of [
    'girlyanda',
    'snowcursor',
    'AF_elka',
    'AF_hat',
    'AF_bag'
]) {
    try {
        localStorage.removeItem(key);
    } catch {
        // Очистка устаревших настроек не должна ломать запуск.
    }
}


// -------------------- РЕЕСТР ОЧИСТКИ --------------------

const cleanupRegistry = {
    _fns: [],
    _intervals: new Set(),
    _timeouts: new Set(),
    _globalAbort: null,
    _tornDown: false,

    init() {
        if (this._globalAbort) return;

        this._globalAbort = new AbortController();
        this._tornDown = false;

        window.addEventListener(
            'beforeunload',
            () => this.teardown(),
            { once: true }
        );
    },

    register(fn) {
        if (typeof fn === 'function') {
            this._fns.push(fn);
        }

        return fn;
    },

    registerInterval(id) {
        this._intervals.add(id);
        return id;
    },

    clearInterval(id) {
        globalThis.clearInterval(id);
        this._intervals.delete(id);
    },

    registerTimeout(id) {
        this._timeouts.add(id);
        return id;
    },

    clearTimeout(id) {
        globalThis.clearTimeout(id);
        this._timeouts.delete(id);
    },

    get signal() {
        return this._globalAbort?.signal;
    },

    teardown() {
        if (this._tornDown) return;
        this._tornDown = true;

        this._globalAbort?.abort();

        for (const id of this._intervals) {
            globalThis.clearInterval(id);
        }

        this._intervals.clear();

        for (const id of this._timeouts) {
            globalThis.clearTimeout(id);
        }

        this._timeouts.clear();

        for (const fn of this._fns.splice(0)) {
            try {
                fn();
            } catch (error) {
                console.warn('[ChMAF] Ошибка очистки:', error);
            }
        }

        this._globalAbort = null;
    }
};

cleanupRegistry.init();
window.cleanupRegistry = cleanupRegistry;


// -------------------- ДИАГНОСТИКА --------------------

window.addEventListener(
    'error',
    event => {
        console.error(
            '[ChMAF Global Error]',
            event.error || event.message
        );
    },
    { signal: cleanupRegistry.signal }
);

window.addEventListener(
    'unhandledrejection',
    event => {
        console.error(
            '[ChMAF Unhandled Promise]',
            event.reason
        );
    },
    { signal: cleanupRegistry.signal }
);


// -------------------- КОНФИГУРАЦИЯ МЕНЮ --------------------

const MODULE_MENU_CONFIG = Object.freeze([
    Object.freeze({
        id: 'JiraOpenForm',
        text: '🔎 Jira Search',
        fn: () => window.getJiraOpenFormPress?.(),
        tp: true
    }),
    Object.freeze({
        id: 'crmopersstatuses',
        text: '🧮 Статусы CRM2',
        fn: () => window.getcrmopersstatusesButtonPress?.(),
        tp: true
    }),
    Object.freeze({
        id: 'butMarks',
        text: '🎭 Оценки',
        fn: () => window.getbutMarksButtonPress?.(),
        tp: false
    }),
    Object.freeze({
        id: 'smartroomform',
        text: '🦐 Smartroom',
        fn: () => window.getsmartroomformButtonPress?.(),
        tp: true
    }),
    Object.freeze({
        id: 'butLessonInfo',
        text: '🎓 Lesson Info',
        fn: () => window.getbutLessonInfoButtonPress?.(),
        tp: false
    }),
    Object.freeze({
        id: 'butFrozeChat',
        text: '❄ Auto Respond',
        fn: () => window.getbutFrozeChatButtonPress?.(),
        tp: false
    }),
    Object.freeze({
        id: 'buttonGetStat',
        text: '📊 Статистика',
        fn: () => window.getbuttonGetStatButtonPress?.(),
        tp: false
    }),
    Object.freeze({
        id: 'buttonTimetable',
        text: '⏱️ Timetable',
        fn: () => window.getbutTimetableButtonPress?.(),
        tp: false
    }),
    Object.freeze({
        id: 'buttonCheckCRMComments',
        text: '🛄 CRM Task',
        fn: () => window.getbutCRMCommentsButtonPress?.(),
        tp: true
    }),
    Object.freeze({
        id: 'butMattermost',
        text: '🔍 Mattermost',
        fn: () => {
            if (typeof window.getMattermostSearchPress === 'function') {
                window.getMattermostSearchPress();
            } else {
                window.createAndShowButton?.(
                    'Модуль Mattermost не загружен.',
                    'warning'
                );
            }
        },
        tp: false
    }),
    Object.freeze({
        id: 'buttonCRMSPecial',
        text: '☄️ CRM Спец.ком',
        fn: () => {
            if (typeof window.getbutCRMSPecialButtonPress === 'function') {
                window.getbutCRMSPecialButtonPress();
            } else {
                // Иначе «кнопка молча ничего не делает»: расширение
                // не перезагружено или модуль не внедрён на эту страницу.
                window.createAndShowButton?.(
                    'Модуль CRM Спец.ком не загружен. Обновите расширение (chrome://extensions ⟳) и нажмите Ctrl+Shift+R.',
                    'warning'
                );
            }
        },
        tp: false
    }),
    Object.freeze({
        id: 'buttonGetQueue',
        text: '🚧 Очередь',
        fn: () => window.getQueuePress?.(),
        tp: false
    })
]);

const MODULE_MENU_MAP = new Map(
    MODULE_MENU_CONFIG.map(item => [item.id, item])
);


// ================================================================
// DOM-УТИЛИТЫ И ОКНА
// ================================================================

function checkelementtype(event) {
    const element = event?.target;

    if (!(element instanceof Element)) {
        return false;
    }

    if (
        element.closest(
            'input, textarea, select, button, a, ' +
            '[onclick], [contenteditable="true"], ' +
            '[class*="btn"], [class*="Button"], ' +
            '[class*="clickable"]'
        )
    ) {
        return false;
    }

    let current = element;
    const boundary = event.currentTarget;

    while (current && current !== boundary) {
        if (current.onclick || current.onmousedown) {
            return false;
        }

        current = current.parentElement;
    }

    return true;
}

function readStoredCoordinate(key, fallback) {
    const raw = readLocalStorage(key);

    if (raw == null) return fallback;

    const value = String(raw).trim();

    if (!/^-?\d+(?:\.\d+)?(?:px)?$/i.test(value)) {
        return fallback;
    }

    const number = Number.parseFloat(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}

function clampWindowPosition(element) {
    if (
        !element ||
        getComputedStyle(element).display === 'none'
    ) {
        return null;
    }

    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) {
        return null;
    }

    const maxX = Math.max(0, window.innerWidth - rect.width);
    const maxY = Math.max(0, window.innerHeight - rect.height);

    const x = Math.min(Math.max(rect.left, 0), maxX);
    const y = Math.min(Math.max(rect.top, 0), maxY);

    if (
        Math.abs(x - rect.left) >= 1 ||
        Math.abs(y - rect.top) >= 1
    ) {
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.right = 'auto';
    }

    return { x, y };
}

function enableDrag(element, options = {}) {
    const {
        handle = '.chmaf-drag-handle',
        storageKey = null,
        savePosition = true,
        snapToEdges = true,
        snapGrid = 0,
        snapThreshold = 18,
        onDragStart = null,
        onDragEnd = null
    } = options;

    if (!(element instanceof Element)) {
        return () => { };
    }

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let cachedWidth = 0;
    let cachedHeight = 0;

    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;

    function isInteractive(target) {
        return Boolean(
            target?.closest?.(
                'input, select, textarea, ' +
                '[contenteditable="true"], button, a'
            )
        );
    }

    function isDragHandle(target) {
        if (!(target instanceof Element)) {
            return false;
        }

        if (!handle) {
            return element.contains(target);
        }

        if (typeof handle === 'string') {
            const matched = target.closest(handle);
            return Boolean(matched && element.contains(matched));
        }

        return target === handle || handle.contains(target);
    }

    if (storageKey && savePosition) {
        try {
            const raw = readLocalStorage(storageKey);

            if (raw) {
                const position = JSON.parse(raw);

                if (
                    Number.isFinite(position?.x) &&
                    Number.isFinite(position?.y)
                ) {
                    element.style.left = `${position.x}px`;
                    element.style.top = `${position.y}px`;
                    element.style.right = 'auto';
                }
            }
        } catch (error) {
            console.warn(
                '[ChMAF] Не удалось восстановить позицию:',
                error
            );
        }
    }

    function clampPosition(x, y, width, height) {
        return {
            x: Math.min(
                Math.max(x, 0),
                Math.max(0, window.innerWidth - width)
            ),
            y: Math.min(
                Math.max(y, 0),
                Math.max(0, window.innerHeight - height)
            )
        };
    }

    function applySnap(x, y, isFinal, width, height) {
        let next = clampPosition(x, y, width, height);

        if (snapToEdges) {
            const rightEdge = window.innerWidth - width;
            const bottomEdge = window.innerHeight - height;

            if (Math.abs(next.x) < snapThreshold) {
                next.x = 0;
            } else if (
                Math.abs(next.x - rightEdge) < snapThreshold
            ) {
                next.x = Math.max(0, rightEdge);
            }

            if (Math.abs(next.y) < snapThreshold) {
                next.y = 0;
            } else if (
                Math.abs(next.y - bottomEdge) < snapThreshold
            ) {
                next.y = Math.max(0, bottomEdge);
            }
        }

        if (snapGrid > 0 && isFinal) {
            next.x = Math.round(next.x / snapGrid) * snapGrid;
            next.y = Math.round(next.y / snapGrid) * snapGrid;
        }

        return clampPosition(
            next.x,
            next.y,
            width,
            height
        );
    }

    function restoreBodyStyles() {
        document.body.style.userSelect = previousUserSelect;
        document.body.style.cursor = previousCursor;
    }

    function onMouseDown(event) {
        if (
            event.button !== 0 ||
            !isDragHandle(event.target) ||
            isInteractive(event.target)
        ) {
            return;
        }

        const rect = element.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        isDragging = true;
        cachedWidth = rect.width;
        cachedHeight = rect.height;

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        element.style.transition = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';

        try {
            onDragStart?.();
        } catch (error) {
            console.error('[ChMAF] Ошибка onDragStart:', error);
        }

        event.preventDefault();
    }

    function onMouseMove(event) {
        if (!isDragging) return;

        const position = applySnap(
            event.clientX - offsetX,
            event.clientY - offsetY,
            false,
            cachedWidth,
            cachedHeight
        );

        element.style.left = `${position.x}px`;
        element.style.top = `${position.y}px`;
        element.style.right = 'auto';
    }

    function onMouseUp() {
        if (!isDragging) return;

        isDragging = false;
        element.style.transition = '';
        restoreBodyStyles();

        const rect = element.getBoundingClientRect();

        const position = applySnap(
            rect.left,
            rect.top,
            true,
            rect.width,
            rect.height
        );

        element.style.left = `${position.x}px`;
        element.style.top = `${position.y}px`;
        element.style.right = 'auto';

        if (storageKey && savePosition) {
            writeLocalStorage(
                storageKey,
                JSON.stringify(position)
            );
        }

        try {
            onDragEnd?.(position);
        } catch (error) {
            console.error('[ChMAF] Ошибка onDragEnd:', error);
        }
    }

    const signal = cleanupRegistry.signal;

    element.addEventListener(
        'mousedown',
        onMouseDown,
        { signal }
    );

    document.addEventListener(
        'mousemove',
        onMouseMove,
        { signal, passive: true }
    );

    document.addEventListener(
        'mouseup',
        onMouseUp,
        { signal }
    );

    const cleanup = () => {
        if (isDragging) {
            isDragging = false;
            restoreBodyStyles();
        }

        element.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    cleanupRegistry.register(cleanup);

    return cleanup;
}

function createWindow(id, topKey, leftKey, content) {
    const existing = document.getElementById(id);

    if (existing) return existing;

    const windowElement = document.createElement('div');

    const storedTop = readStoredCoordinate(topKey, 120);
    const storedLeft = readStoredCoordinate(leftKey, 295);

    if (id === 'TestUsers') {
        windowElement.classList.add(
            'onlyfortp',
            'testuserwindow'
        );
    } else if (id === 'AF_addChatMenu') {
        windowElement.classList.add('wintInitializeChat');
    } else {
        windowElement.classList.add('extwindows');
    }

    windowElement.id = id;
    windowElement.style.position = 'fixed';
    windowElement.style.top = `${storedTop}px`;
    windowElement.style.left = `${storedLeft}px`;
    windowElement.style.display = 'none';

    if (
        [
            'AF_Timetable',
            'AF_Grabber',
            'AF_GrList',
            'AF_SpecCommWindow'
        ].includes(id)
    ) {
        windowElement.style.zIndex = '1100000';
    }

    // Разметка content создаётся доверенными модулями
    // расширения. API-данные нельзя передавать сюда
    // без экранирования.
    const template = document.createElement('template');
    template.innerHTML = String(content ?? '');

    template.content
        .querySelectorAll('script, iframe, object, embed')
        .forEach(node => node.remove());

    windowElement.appendChild(template.content);
    document.body.appendChild(windowElement);

    const dragCleanup = enableDrag(windowElement, {
        handle: '.chmaf-drag-handle',

        // Используем только topKey/leftKey.
        savePosition: false,
        snapToEdges: true,
        snapGrid: 8,

        onDragEnd(position) {
            writeLocalStorage(topKey, position.y);
            writeLocalStorage(leftKey, position.x);
        }
    });

    let lastClickTime = 0;

    function onInputMouseDown(event) {
        // Игнорируем любые нажатия, кроме левой кнопки мыши (0 = Main/Left click).
        // Правая кнопка мыши (2) не должна трогать выделение или глушить событие.
        if (event.button !== 0) {
            return;
        }

        const input = event.target;

        if (
            !(
                input instanceof HTMLInputElement ||
                input instanceof HTMLTextAreaElement
            )
        ) {
            return;
        }

        if (
            input.type === 'button' ||
            input.type === 'submit'
        ) {
            return;
        }

        const now = Date.now();

        // Защита от дабл-клика / тройного клика для выделения слов и строк
        if (now - lastClickTime < 400 || event.detail > 1) {
            return;
        }

        lastClickTime = now;

        if (input.selectionStart !== input.selectionEnd) {
            const position = getCaretPositionFromPoint(
                input,
                event.clientX,
                event.clientY
            );

            input.setSelectionRange(position, position);
        }

        event.stopPropagation();
    }

    windowElement.addEventListener(
        'mousedown',
        onInputMouseDown,
        { signal: cleanupRegistry.signal }
    );

    const observer = new MutationObserver(() => {
        if (windowElement.style.display === 'none') {
            return;
        }

        requestAnimationFrame(() => {
            const position = clampWindowPosition(windowElement);

            if (position) {
                writeLocalStorage(topKey, position.y);
                writeLocalStorage(leftKey, position.x);
            }
        });
    });

    observer.observe(windowElement, {
        attributes: true,
        attributeFilter: ['style']
    });

    const onResize = () => {
        requestAnimationFrame(() => {
            clampWindowPosition(windowElement);
        });
    };

    window.addEventListener(
        'resize',
        onResize,
        { signal: cleanupRegistry.signal }
    );

    cleanupRegistry.register(() => {
        observer.disconnect();
        dragCleanup();
        windowElement.remove();
    });

    return windowElement;
}

function getCaretPositionFromPoint(element, x, y) {
    if (document.caretPositionFromPoint) {
        const position = document.caretPositionFromPoint(x, y);

        if (
            position &&
            (
                position.offsetNode === element ||
                element.contains(position.offsetNode)
            )
        ) {
            return position.offset;
        }
    }

    if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(x, y);

        if (
            range &&
            (
                range.startContainer === element ||
                element.contains(range.startContainer)
            )
        ) {
            return range.startOffset;
        }
    }

    return element.selectionStart ?? 0;
}

function getStorageData(keys) {
    return new Promise((resolve, reject) => {
        try {
            if (!globalThis.chrome?.storage?.local) {
                reject(
                    new Error('chrome.storage.local недоступен')
                );
                return;
            }

            chrome.storage.local.get(keys, result => {
                const error = chrome.runtime?.lastError;

                if (error) {
                    reject(new Error(error.message));
                    return;
                }

                resolve(result ?? {});
            });
        } catch (error) {
            reject(error);
        }
    });
}


// ================================================================
// FAB И МЕНЮ
// ================================================================

function injectFABStyles() {
    if (document.getElementById('fab-premium-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'fab-premium-styles';

    style.textContent = `
#rightPanel {
    position: fixed;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
}

#rightPanel > * {
    pointer-events: auto;
}

.fab-premium {
    --fab-size: 45px;
    --fab-color: 190;
    --fab-sat: 90%;
    --fab-light: 60%;

    position: relative;
    width: var(--fab-size);
    height: var(--fab-size);
    border-radius: 50%;
    border: none;
    cursor: pointer;

    background:
        linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.1) 0%,
            rgba(255, 255, 255, 0.02) 100%
        ),
        rgba(18, 18, 28, 0.85);

    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);

    box-shadow:
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 1px rgba(255, 255, 255, 0.15);

    font-size: 19px;
    color: hsl(
        var(--fab-color),
        var(--fab-sat),
        var(--fab-light)
    );

    display: flex;
    align-items: center;
    justify-content: center;

    transition:
        all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    overflow: hidden;
    outline: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    margin: 0;
    padding: 0;
}

.fab-premium::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;

    background:
        radial-gradient(
            circle at 50% 20%,
            rgba(255, 255, 255, 0.2) 0%,
            transparent 60%
        );

    pointer-events: none;
    opacity: 0.6;
}

.fab-premium::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;

    background:
        radial-gradient(
            circle,
            hsla(
                var(--fab-color),
                var(--fab-sat),
                var(--fab-light),
                0.3
            ) 0%,
            transparent 70%
        );

    transform: scale(0);
    opacity: 0;
    pointer-events: none;
}

.fab-premium:hover {
    transform: scale(1.1) translateY(-2px);

    box-shadow:
        0 12px 48px rgba(0, 0, 0, 0.5),
        0 0 24px hsla(
            var(--fab-color),
            var(--fab-sat),
            var(--fab-light),
            0.3
        ),
        0 0 0 1px hsla(
            var(--fab-color),
            var(--fab-sat),
            var(--fab-light),
            0.5
        ),
        inset 0 1px 1px rgba(255, 255, 255, 0.2);

    color: #fff;

    text-shadow:
        0 0 12px hsla(
            var(--fab-color),
            var(--fab-sat),
            var(--fab-light),
            0.8
        );
}

.fab-premium:active {
    transform: scale(0.95);
    box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.4),
        inset 0 2px 8px rgba(0, 0, 0, 0.6);
    transition: all 0.1s ease;
}

.fab-premium:active::after {
    animation: fab-ripple 0.6s ease-out;
}

@keyframes fab-ripple {
    0% {
        transform: scale(0);
        opacity: 1;
    }

    100% {
        transform: scale(2.5);
        opacity: 0;
    }
}

.fab-premium.active {
    background:
        linear-gradient(
            145deg,
            hsla(
                var(--fab-color),
                var(--fab-sat),
                50%,
                0.2
            ) 0%,
            hsla(
                var(--fab-color),
                var(--fab-sat),
                30%,
                0.1
            ) 100%
        ),
        rgba(18, 18, 28, 0.95);

    box-shadow:
        0 8px 32px hsla(
            var(--fab-color),
            var(--fab-sat),
            var(--fab-light),
            0.3
        ),
        0 0 0 2px hsla(
            var(--fab-color),
            var(--fab-sat),
            var(--fab-light),
            0.6
        ),
        inset 0 0 20px hsla(
            var(--fab-color),
            var(--fab-sat),
            var(--fab-light),
            0.1
        );
}

.fab-premium .fab-tooltip {
    position: absolute;
    right: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%) translateX(10px);

    background: rgba(18, 18, 28, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    color: #fff;
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);

    opacity: 0;
    pointer-events: none;

    transition:
        all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    z-index: 10;
}

.fab-premium .fab-tooltip::after {
    content: '';
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border: 6px solid transparent;
    border-left-color: rgba(18, 18, 28, 0.95);
}

.fab-premium:hover .fab-tooltip {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
}

.fab-premium[data-theme="cyan"] {
    --fab-color: 190;
    --fab-sat: 90%;
    --fab-light: 60%;
}

.fab-premium[data-theme="amber"] {
    --fab-color: 35;
    --fab-sat: 95%;
    --fab-light: 58%;
}

.fab-premium[data-theme="emerald"] {
    --fab-color: 150;
    --fab-sat: 80%;
    --fab-light: 55%;
}

.fab-premium[data-theme="rose"] {
    --fab-color: 340;
    --fab-sat: 90%;
    --fab-light: 65%;
}

.fab-premium[data-theme="violet"] {
    --fab-color: 265;
    --fab-sat: 90%;
    --fab-light: 68%;
}

.fab-premium[data-theme="orange"] {
    --fab-color: 25;
    --fab-sat: 95%;
    --fab-light: 60%;
}

.fab-premium.onlyfortp {
    display: none;
}

@keyframes fab-slide-in {
    from {
        opacity: 0;
        transform: translateX(100px) scale(0.8);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

.fab-premium {
    animation:
        fab-slide-in
        0.4s
        cubic-bezier(0.34, 1.56, 0.64, 1)
        backwards;
}

.fab-premium:nth-child(1) { animation-delay: 0.05s; }
.fab-premium:nth-child(2) { animation-delay: 0.1s; }
.fab-premium:nth-child(3) { animation-delay: 0.15s; }
.fab-premium:nth-child(4) { animation-delay: 0.2s; }
.fab-premium:nth-child(5) { animation-delay: 0.25s; }
.fab-premium:nth-child(6) { animation-delay: 0.3s; }
.fab-premium:nth-child(7) { animation-delay: 0.35s; }
.fab-premium:nth-child(8) { animation-delay: 0.4s; }

/*
 * Меню находится непосредственно в document.body.
 * Поэтому fixed-координаты задаются относительно экрана,
 * а не относительно трансформированной панели FAB.
 */
#idmymenu.m-menu-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: auto;
    bottom: auto;
    transform: none !important;

    z-index: 2147483647;

    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 3px;

    width: min(248px, calc(100vw - 24px));
    min-width: 0;
    height: auto !important;
    max-height: calc(100dvh - 24px);

    padding: 8px;
    margin: 0;

    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;

    background: rgba(20, 22, 34, 0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);

    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;

    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.42);
}

/* Не показываем меню, когда JS выставил display:none. */
#idmymenu.m-menu-panel[style*="display: none"] {
    display: none !important;
}

#idmymenu::before,
#idmymenu::after {
    display: none !important;
}

#idmymenu .m-menu-btn {
    box-sizing: border-box;
    display: flex !important;
    align-items: center;
    justify-content: flex-start;
    gap: 11px;

    width: 100%;
    min-width: 0;
    min-height: 42px;
    margin: 0;
    padding: 9px 12px;

    color: #e9ecf5;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9px;
    box-shadow: none;

    font: 500 13px/1.35 system-ui, sans-serif;
    text-align: left;
    white-space: nowrap;

    cursor: pointer;
    transform: none;
    transition:
        background 0.18s ease,
        border-color 0.18s ease,
        color 0.18s ease;
}

#idmymenu .m-menu-btn:hover,
#idmymenu .m-menu-btn:focus-visible {
    color: #fff;
    background: rgba(255, 255, 255, 0.09);
    border-color: rgba(255, 255, 255, 0.08);
    transform: none;
    outline: none;
}

#idmymenu .m-menu-btn:active {
    background: rgba(255, 255, 255, 0.15);
}

#idmymenu .chmaf-menu-icon {
    flex: 0 0 22px;
    width: 22px;
    font-size: 17px;
    line-height: 1;
    text-align: center;
}

#idmymenu .chmaf-menu-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}
    `;

    document.head.appendChild(style);
}

function createFAB(config) {
    const {
        id,
        icon,
        title,
        theme = 'cyan',
        onClick
    } = config;

    const button = document.createElement('button');

    button.type = 'button';
    button.id = id;
    button.className = 'fab-premium';
    button.dataset.theme = theme;
    button.setAttribute('aria-label', title);

    const iconElement = document.createElement('span');
    iconElement.textContent = icon;

    const tooltip = document.createElement('span');
    tooltip.className = 'fab-tooltip';
    tooltip.textContent = title;

    button.append(iconElement, tooltip);

    if (typeof onClick === 'function') {
        button.addEventListener(
            'click',
            onClick,
            { signal: cleanupRegistry.signal }
        );
    }

    return button;
}

function buildSidePanel() {
    document.getElementById('rightPanel')?.remove();

    injectFABStyles();

    const panel = document.createElement('div');
    panel.id = 'rightPanel';

    document.body.appendChild(panel);

    return panel;
}

function addFabButton(
    panel,
    id,
    icon,
    title,
    theme,
    onClick
) {
    const button = createFAB({
        id,
        icon,
        title,
        theme,
        onClick
    });

    panel.appendChild(button);

    return button;
}

/**
 * Ставит меню слева от кнопки 👺 и выравнивает
 * центры меню и кнопки по вертикали.
 */
function positionModuleMenu(menu) {
    const trigger = document.getElementById('MainMenuBtn');
    const panel = document.getElementById('rightPanel');

    if (!menu || !trigger) return;

    const buttonRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    const margin = 12;
    const gap = 14;

    const left = Math.max(
        margin,
        buttonRect.left - menuRect.width - gap
    );

    // Выравниваем по верхнему краю первой кнопки панели
    let desiredTop = buttonRect.top;

    if (panel) {
        const firstButton = panel.querySelector('.fab-premium');

        if (firstButton) {
            desiredTop = firstButton.getBoundingClientRect().top;
        }
    }

    const top = Math.min(
        Math.max(margin, desiredTop),
        Math.max(
            margin,
            window.innerHeight - menuRect.height - margin
        )
    );

    menu.style.setProperty(
        'left',
        `${Math.round(left)}px`,
        'important'
    );

    menu.style.setProperty(
        'top',
        `${Math.round(top)}px`,
        'important'
    );
}

function closeModuleMenu() {
    const menu = document.getElementById('chmaf-module-menu');

    if (menu) {
        menu.style.setProperty(
            'display',
            'none',
            'important'
        );
    }

    document
        .getElementById('MainMenuBtn')
        ?.classList.remove('active');
}
window.closeModuleMenu = closeModuleMenu;

function buildModuleMenu(panel, isTP) {
    injectModuleMenuStyles();

    document.getElementById('chmaf-module-menu')?.remove();

    const menubar = document.createElement('div');

    // Новый ID: старые стили #idmymenu больше не действуют.
    menubar.id = 'chmaf-module-menu';

    // Не добавляем старые классы m-menu-panel и menubarstyle:
    // на них тоже могут действовать стили сайта.
    menubar.style.setProperty(
        'display',
        'none',
        'important'
    );

    for (const item of MODULE_MENU_CONFIG) {
        if (item.tp && !isTP) continue;

        const button = document.createElement('button');
        button.type = 'button';
        button.id = item.id;
        button.className = 'm-menu-btn';

        const match = item.text.match(/^(\S+)\s+(.+)$/u);

        const iconElement = document.createElement('span');
        iconElement.className = 'chmaf-menu-icon';
        iconElement.textContent = match?.[1] ?? '';

        const labelElement = document.createElement('span');
        labelElement.className = 'chmaf-menu-label';
        labelElement.textContent = match?.[2] ?? item.text;

        button.append(iconElement, labelElement);
        menubar.appendChild(button);
    }

    document.body.appendChild(menubar);

    menubar.addEventListener(
        'click',
        event => {
            const button = event.target instanceof Element
                ? event.target.closest('.m-menu-btn')
                : null;

            if (!button || !menubar.contains(button)) return;

            const config = MODULE_MENU_MAP.get(button.id);

            try {
                const result = config?.fn();

                if (result && typeof result.catch === 'function') {
                    result.catch(error => {
                        console.error(
                            `[ChMAF] Ошибка модуля ${button.id}:`,
                            error
                        );

                        window.showCustomAlert?.(
                            `Ошибка модуля: ${button.id}`,
                            'error'
                        );
                    });
                }
            } catch (error) {
                console.error(
                    `[ChMAF] Ошибка модуля ${button.id}:`,
                    error
                );

                window.showCustomAlert?.(
                    `Ошибка модуля: ${button.id}`,
                    'error'
                );
            }

            closeModuleMenu();
        },
        { signal: cleanupRegistry.signal }
    );

    return menubar;
}


function injectModuleMenuStyles() {
    if (document.getElementById('chmaf-module-menu-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'chmaf-module-menu-styles';

    style.textContent = `
#chmaf-module-menu {
    position: fixed !important;
    right: auto !important;
    bottom: auto !important;
    transform: none !important;
    z-index: 2147483647 !important;

    box-sizing: border-box;
    width: min(248px, calc(100vw - 24px));
    max-height: calc(100dvh - 24px);
    padding: 8px;
    margin: 0;
    overflow-x: hidden;
    overflow-y: auto;

    flex-direction: column;
    gap: 3px;

    background: rgba(20, 22, 34, 0.97);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.42);
}

#chmaf-module-menu .m-menu-btn {
    box-sizing: border-box;
    display: flex !important;
    align-items: center;
    justify-content: flex-start;
    gap: 11px;

    width: 100%;
    min-height: 42px;
    margin: 0;
    padding: 9px 12px;

    color: #e9ecf5;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9px;
    box-shadow: none;

    font: 500 13px/1.35 system-ui, sans-serif;
    text-align: left;
    cursor: pointer;
    transform: none;
}

#chmaf-module-menu .m-menu-btn:hover,
#chmaf-module-menu .m-menu-btn:focus-visible {
    color: #fff;
    background: rgba(255, 255, 255, 0.09);
    outline: none;
}

#chmaf-module-menu .chmaf-menu-icon {
    flex: 0 0 22px;
    width: 22px;
    font-size: 17px;
    line-height: 1;
    text-align: center;
}

#chmaf-module-menu .chmaf-menu-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
    `;

    document.head.appendChild(style);
}

// Если размер окна изменился при открытом меню,
// пересчитываем его расположение.
window.addEventListener(
    'resize',
    () => {
        const menu = document.getElementById('chmaf-module-menu');

        if (
            menu &&
            getComputedStyle(menu).display !== 'none'
        ) {
            positionModuleMenu(menu);
        }
    },
    { signal: cleanupRegistry.signal }
);

cleanupRegistry.register(() => {
    document.getElementById('chmaf-module-menu')?.remove();
});


// ================================================================
// ОПЕРАТОР И АДРЕСА ШАБЛОНОВ
// ================================================================

function delayMs(ms) {
    return new Promise(resolve => {
        const timeout = setTimeout(() => {
            cleanupRegistry._timeouts.delete(timeout);
            resolve();
        }, ms);

        cleanupRegistry.registerTimeout(timeout);
    });
}

async function waitForOperator(maxMs = 60_000) {
    const startedAt = Date.now();
    let delay = 500;

    while (
        !cleanupRegistry.signal?.aborted &&
        Date.now() - startedAt < maxMs
    ) {
        try {
            if (
                typeof window.whoAmI === 'function' &&
                await window.whoAmI()
            ) {
                return true;
            }
        } catch (error) {
            console.warn('[ChMAF] Ошибка whoAmI:', error);
        }

        await delayMs(delay);
        delay = Math.min(delay * 2, 5000);
    }

    console.warn('[ChMAF] Оператор не идентифицирован');
    return false;
}

async function migrateScriptAddresses() {
    const keys = [
        'KC_addr',
        'TP_addr',
        'KC_addrRzrv',
        'TP_addrRzrv'
    ];

    let data = {};

    try {
        data = await getStorageData(keys);
    } catch (error) {
        console.error(
            '[ChMAF] chrome.storage.local недоступен:',
            error
        );
    }

    if (!data || typeof data !== 'object') {
        data = {};
    }

    const defaults = {
        KC_addr:
            'https://script.google.com/macros/s/' +
            'AKfycbzV8BHtyD3XUcPjZmb9pwwY-2cwAKx8hTRZKVENpKhdCJYe-hF0rpyDVdUIXBUin326Lw/exec',

        TP_addr:
            'https://script.google.com/macros/s/' +
            'AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec',

        KC_addrRzrv:
            'https://script.google.com/macros/s/' +
            'AKfycbzn2Lv0uuqXG5-mSWHu2W_fAmeeVJ9WVtT1hNNMAj9z9p5I0WLZnydzTcE8z1H5nuaTiQ/exec',

        TP_addrRzrv:
            'https://script.google.com/macros/s/' +
            'AKfycbyL2uTpWRlajHmtRXpjUq2yiPw6f_t-tHoBglkG-ojoA7ksnqMXr0_BXzhZFk31qV7jmQ/exec'
    };

    const missing = {};

    for (const key of keys) {
        if (!data[key]) {
            data[key] = defaults[key];
            missing[key] = defaults[key];
        }
    }

    if (
        Object.keys(missing).length &&
        globalThis.chrome?.storage?.local
    ) {
        try {
            chrome.storage.local.set(missing);
        } catch (error) {
            console.warn(
                '[ChMAF] Не удалось записать адреса:',
                error
            );
        }
    }

    const knownAddresses = new Set(
        keys.map(key => data[key]).filter(Boolean)
    );

    if (!knownAddresses.has(scriptAdr)) {
        const isTP = getOpSection()
            ? isTpOperator()
            : readLocalStorage('tpflag') === 'ТП';

        scriptAdr =
            (
                isTP
                    ? data.TP_addr
                    : data.KC_addr
            ) ||
            DEFAULT_SCRIPT_ADR;

        writeLocalStorage('scriptAdr', scriptAdr);

        console.warn(
            '[ChMAF] Адрес шаблонов обновлён:',
            scriptAdr
        );
    }

    return data;
}

function setupDepartment(data) {
    const section = getOpSection();

    const tpAddress = data?.TP_addr || '';
    const tpReserveAddress = data?.TP_addrRzrv || '';

    const isKC = section
        ? !isTpOperator()
        : tpAddress
            ? (
                scriptAdr !== tpAddress &&
                scriptAdr !== tpReserveAddress
            )
            : readLocalStorage('tpflag') !== 'ТП';

    if (
        isKC &&
        readLocalStorage('hideTaskWindow') === '1'
    ) {
        writeLocalStorage('hideTaskWindow', '0');
    }

    try {
        if (isKC) {
            prepKC();
        } else {
            prepTp();
        }
    } catch (error) {
        console.error(
            '[ChMAF] Ошибка настройки отдела:',
            error
        );
    }
}

function startBackgroundTasks() {
    if (!window.__chmafCtrlKeysBound) {
        window.__chmafCtrlKeysBound = true;

        const onKeyDown = event => {
            if (event.key === 'Control') {
                bool = 1;
            }
        };

        const onKeyUp = event => {
            if (event.key === 'Control') {
                bool = 0;
            }
        };

        const onBlur = () => {
            bool = 0;
        };

        window.addEventListener(
            'keydown',
            onKeyDown,
            { signal: cleanupRegistry.signal }
        );

        window.addEventListener(
            'keyup',
            onKeyUp,
            { signal: cleanupRegistry.signal }
        );

        window.addEventListener(
            'blur',
            onBlur,
            { signal: cleanupRegistry.signal }
        );

        cleanupRegistry.register(() => {
            window.__chmafCtrlKeysBound = false;
        });
    }

    if (checkchatsIntervalId !== null) {
        cleanupRegistry.clearInterval(checkchatsIntervalId);
    }

    checkchatsIntervalId = cleanupRegistry.registerInterval(
        setInterval(() => {
            try {
                window.checkchats?.();
            } catch (error) {
                console.error(
                    '[ChMAF] Ошибка checkchats:',
                    error
                );
            }
        }, 1000)
    );
}


// ================================================================
// ОРКЕСТРАТОР И SPA-НАВИГАЦИЯ
// ================================================================

let lastPath = location.pathname;
let lastInitializedPath = '';

let moveAgainScheduled = false;
let moveAgainRunning = false;

let retryOperatorTimeoutId = null;
let lastDepartmentData = {};

function scheduleOperatorRetry() {
    if (retryOperatorTimeoutId !== null) {
        return;
    }

    retryOperatorTimeoutId = cleanupRegistry.registerTimeout(
        setTimeout(async () => {
            const timeoutId = retryOperatorTimeoutId;

            retryOperatorTimeoutId = null;
            cleanupRegistry._timeouts.delete(timeoutId);

            if (location.pathname === '/login') {
                return;
            }

            try {
                const ready = await waitForOperator(30_000);

                if (
                    !ready ||
                    location.pathname === '/login'
                ) {
                    return;
                }

                const data = await migrateScriptAddresses();
                lastDepartmentData = data;

                const panel = document.getElementById(
                    'rightPanel'
                );

                if (!panel) return;

                buildModuleMenu(panel, isTpOperator());
                setupDepartment(data);

                console.log(
                    '[ChMAF] Оператор идентифицирован после повторной попытки'
                );
            } catch (error) {
                console.error(
                    '[ChMAF] Ошибка повторной идентификации:',
                    error
                );
            }
        }, 15_000)
    );
}

async function move_again_AF() {
    const panel = document.getElementById('rightPanel');

    if (location.pathname === '/login') {
        closeModuleMenu();

        if (panel) {
            panel.style.display = 'none';
        }

        return;
    }

    if (panel && panel.children.length) {
        panel.style.display = '';

        if (getOpSection() && lastDepartmentData) {
            buildModuleMenu(panel, isTpOperator());
            setupDepartment(lastDepartmentData);
        }

        return;
    }

    if (moveAgainRunning) {
        return;
    }

    moveAgainRunning = true;

    try {
        console.log(
            '[ChMAF] Инициализация:',
            location.pathname
        );

        const operatorPromise = waitForOperator();

        const dataPromise = migrateScriptAddresses()
            .catch(error => {
                console.error(
                    '[ChMAF] Ошибка миграции адресов:',
                    error
                );

                return {};
            });

        // Не блокируем построение панели, но не загружаем
        // шаблоны по старому адресу.
        void dataPromise
            .then(() => getText())
            .catch(error => {
                console.error(
                    '[ChMAF] Ошибка загрузки шаблонов:',
                    error
                );
            });

        const newPanel = buildSidePanel();

        window.__chmafPanel = newPanel;
        lastInitializedPath = location.pathname;

        addFabButton(
            newPanel,
            'scriptBut',
            '🧩',
            'Шаблоны',
            'cyan',
            () => {
                const element = document.getElementById(
                    'AF_helper'
                );

                if (!element) {
                    window.createAndShowButton?.(
                        'Панель шаблонов ещё не построена.',
                        'warning'
                    );

                    return;
                }

                const hidden =
                    getComputedStyle(element).display === 'none';

                element.style.display = hidden
                    ? 'flex'
                    : 'none';

                document
                    .getElementById('scriptBut')
                    ?.classList.toggle('active', hidden);
            }
        );

        addFabButton(
            newPanel,
            'themes',
            '📚',
            'Темы',
            'violet',
            () => window.getThemesButtonPress?.()
        );

        addFabButton(
            newPanel,
            'MainMenuBtn',
            '👺',
            'Меню',
            'rose',
            () => {
                let menu = document.getElementById('chmaf-module-menu');

                if (!menu) {
                    menu = buildModuleMenu(newPanel, isTpOperator());
                }

                const isClosed =
                    getComputedStyle(menu).display === 'none';

                if (isClosed) {
                    // Сначала показываем: иначе невозможно измерить высоту.
                    menu.style.setProperty(
                        'display',
                        'flex',
                        'important'
                    );

                    positionModuleMenu(menu);
                } else {
                    closeModuleMenu();
                }

                document
                    .getElementById('MainMenuBtn')
                    ?.classList.toggle('active', isClosed);
            }
        );

        buildModuleMenu(newPanel, isTpOperator());

        addFabButton(
            newPanel,
            'opennewcat',
            '☢',
            'История чатов',
            'emerald',
            () => window.getopennewcatButtonPress?.()
        );

        startBackgroundTasks();

        const [operatorReady, data] = await Promise.all([
            operatorPromise,
            dataPromise
        ]);

        lastDepartmentData = data;

        if (location.pathname === '/login') {
            closeModuleMenu();
            newPanel.style.display = 'none';
            return;
        }

        buildModuleMenu(newPanel, isTpOperator());

        if (operatorReady) {
            setupDepartment(data);
        } else {
            scheduleOperatorRetry();
        }

        console.log('[ChMAF] Инициализация завершена');
    } catch (error) {
        console.error(
            '[ChMAF] Критическая ошибка инициализации:',
            error
        );

        window.showCustomAlert?.(
            'Ошибка инициализации. Перезагрузите страницу.',
            'error'
        );
    } finally {
        moveAgainRunning = false;
    }
}

function scheduleMoveAgain(delay = 1500) {
    if (moveAgainScheduled) {
        return;
    }

    moveAgainScheduled = true;

    const timeoutId = setTimeout(() => {
        cleanupRegistry._timeouts.delete(timeoutId);
        moveAgainScheduled = false;

        void move_again_AF();
    }, delay);

    cleanupRegistry.registerTimeout(timeoutId);
}

function checkPathChange() {
    const currentPath = location.pathname;

    if (currentPath === lastPath) {
        return;
    }

    lastPath = currentPath;

    console.log(
        '[ChMAF] Путь изменился:',
        currentPath
    );

    scheduleMoveAgain(
        currentPath === '/login' ? 0 : 1500
    );
}

if (lastPath !== '/login') {
    scheduleMoveAgain(3000);
}

{
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        const result = originalPushState.apply(this, args);
        checkPathChange();
        return result;
    };

    history.replaceState = function (...args) {
        const result = originalReplaceState.apply(this, args);
        checkPathChange();
        return result;
    };

    window.addEventListener(
        'popstate',
        checkPathChange,
        { signal: cleanupRegistry.signal }
    );

    window.addEventListener(
        'hashchange',
        checkPathChange,
        { signal: cleanupRegistry.signal }
    );

    cleanupRegistry.register(() => {
        if (history.pushState !== originalPushState) {
            history.pushState = originalPushState;
        }

        if (history.replaceState !== originalReplaceState) {
            history.replaceState = originalReplaceState;
        }
    });
}

cleanupRegistry.registerInterval(
    setInterval(checkPathChange, 700)
);


// ================================================================
// НАСТРОЙКА ОТДЕЛА
// ================================================================

function prepTp() {
    const panel = document.getElementById('rightPanel');

    if (!panel) return;

    document
        .querySelectorAll('.onlyfortp:not(.fab-premium)')
        .forEach(element => {
            if (
                element.id === 'TestUsers' ||
                element.closest('#TestUsers') ||
                element.classList.contains('extwindows') ||
                element.classList.contains('testuserwindow')
            ) {
                return;
            }

            element.style.removeProperty('display');
        });

    function create(id, icon, title, theme, handler) {
        const existing = panel.querySelector(
            `#${CSS.escape(id)}`
        );

        if (existing) {
            existing.style.setProperty(
                'display',
                'flex',
                'important'
            );

            return;
        }

        if (typeof handler !== 'function') {
            console.warn(
                `[ChMAF] Модуль кнопки ${id} недоступен`
            );

            return;
        }

        const button = createFAB({
            id,
            icon,
            title,
            theme,
            onClick: handler
        });

        button.classList.add('onlyfortp');

        button.style.setProperty(
            'display',
            'flex',
            'important'
        );

        panel.appendChild(button);
    }

    create(
        'datsyCalendar',
        '📅',
        'Datsy',
        'amber',
        () => window.getdatsyCalendarButtonPress?.()
    );

    create(
        'butServ',
        '⚜',
        'Сервисы',
        'violet',
        function () {
            const serviceWindow = document.getElementById(
                'AF_Service'
            );

            if (!serviceWindow) {
                return;
            }

            const visible =
                getComputedStyle(serviceWindow).display !==
                'none';

            serviceWindow.style.display = visible
                ? 'none'
                : '';

            this.classList.toggle('active', !visible);
        }
    );

    create(
        'knowledgeCenter',
        '💡',
        'БЗ',
        'orange',
        () => window.getknowledgeCenterButtonPress?.()
    );

    create(
        'taskBut',
        '🛠',
        'Задачи',
        'emerald',
        () => window.gettaskButButtonPress?.()
    );

    if (
        timerHideButtonsIntervalId === null &&
        typeof window.timerHideButtons === 'function'
    ) {
        timerHideButtonsIntervalId =
            cleanupRegistry.registerInterval(
                setInterval(() => {
                    try {
                        window.timerHideButtons?.();
                    } catch (error) {
                        console.error(
                            '[ChMAF] timerHideButtons:',
                            error
                        );
                    }
                }, 500)
            );
    }
}

function prepKC() {
    const languageSwitcher = document.querySelector(
        '.user_menu-language_switcher'
    );

    if (languageSwitcher) {
        languageSwitcher.style.display =
            readLocalStorage('disablelpmwindow') === '1'
                ? 'none'
                : '';
    }

    document
        .querySelectorAll('.onlyfortp')
        .forEach(element => {
            element.style.setProperty(
                'display',
                'none',
                'important'
            );
        });

    document
        .querySelectorAll('.onlyforkc')
        .forEach(element => {
            element.style.removeProperty('display');
        });

    if (timerHideButtonsIntervalId !== null) {
        cleanupRegistry.clearInterval(
            timerHideButtonsIntervalId
        );

        timerHideButtonsIntervalId = null;
    }
}

window.prepTp = prepTp;
window.prepKC = prepKC;


// ================================================================
// ЗАПРОСЫ И ШАБЛОНЫ
// ================================================================

async function fetchGasJson(url, timeoutMs = 15_000) {
    let parsedUrl;

    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error('Некорректный адрес шаблонов');
    }

    if (parsedUrl.protocol !== 'https:') {
        throw new Error(
            'Адрес шаблонов должен использовать HTTPS'
        );
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(
        () => controller.abort(),
        timeoutMs
    );

    const globalSignal = cleanupRegistry.signal;
    const abortWithGlobal = () => controller.abort();

    globalSignal?.addEventListener(
        'abort',
        abortWithGlobal,
        { once: true }
    );

    let directError = null;

    try {
        try {
            const response = await fetch(
                parsedUrl.href,
                { signal: controller.signal }
            );

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();

            if (text.trim().startsWith('<')) {
                throw new Error(
                    'Сервер вернул HTML вместо JSON'
                );
            }

            try {
                return JSON.parse(text);
            } catch {
                throw new Error(
                    'Сервер вернул некорректный JSON'
                );
            }
        } catch (error) {
            directError = error;

            if (controller.signal.aborted) {
                throw new Error(
                    'Таймаут загрузки шаблонов'
                );
            }

            console.warn(
                '[ChMAF] Прямой запрос не удался; пробуем background:',
                error
            );
        }

        if (!globalThis.chrome?.runtime?.sendMessage) {
            throw (
                directError ||
                new Error('API расширения недоступно')
            );
        }

        const answer = await new Promise((resolve, reject) => {
            let settled = false;

            const finish = (error, value) => {
                if (settled) {
                    return;
                }

                settled = true;
                clearTimeout(fallbackTimeout);

                if (error) {
                    reject(error);
                } else {
                    resolve(value);
                }
            };

            const fallbackTimeout = setTimeout(
                () => finish(
                    new Error(
                        'Таймаут background-запроса'
                    )
                ),
                timeoutMs
            );

            try {
                chrome.runtime.sendMessage(
                    {
                        action: 'getFetchRequest',
                        fetchURL: parsedUrl.href
                    },
                    response => {
                        const error = chrome.runtime.lastError;

                        if (error) {
                            finish(new Error(error.message));
                            return;
                        }

                        if (!response?.success) {
                            finish(
                                new Error(
                                    response?.error ||
                                    'Background-запрос завершился с ошибкой'
                                )
                            );

                            return;
                        }

                        finish(
                            null,
                            response.fetchAnswer ??
                            response.fetchansver
                        );
                    }
                );
            } catch (error) {
                finish(error);
            }
        });

        if (
            typeof answer === 'object' &&
            answer !== null
        ) {
            return answer;
        }

        const text = String(answer ?? '');

        if (text.trim().startsWith('<')) {
            throw new Error(
                'Background вернул HTML вместо JSON'
            );
        }

        try {
            return JSON.parse(text);
        } catch {
            throw new Error(
                'Background вернул некорректный JSON'
            );
        }
    } finally {
        clearTimeout(timeoutId);

        globalSignal?.removeEventListener(
            'abort',
            abortWithGlobal
        );
    }
}

let getTextPromise = null;

function getText() {
    if (getTextPromise) {
        return getTextPromise;
    }

    getTextPromise = loadTextWithRetries()
        .finally(() => {
            getTextPromise = null;
        });

    return getTextPromise;
}

async function loadTextWithRetries() {
    const maxRetries = 5;
    let lastError = null;

    for (
        let attempt = 1;
        attempt <= maxRetries;
        attempt++
    ) {
        if (cleanupRegistry.signal?.aborted) {
            return;
        }

        try {
            if (attempt > 1) {
                window.showCustomAlert?.(
                    `Повторная загрузка шаблонов: ${attempt}/${maxRetries}`,
                    'info'
                );
            }

            const currentAddress = scriptAdr;
            const json = await fetchGasJson(currentAddress);

            if (!Array.isArray(json?.result)) {
                throw new Error(
                    'В ответе отсутствует массив result'
                );
            }

            table = json.result;

            console.log(
                `[ChMAF] Шаблоны загружены: ${table.length} строк`
            );

            if (attempt > 1) {
                window.showCustomAlert?.(
                    'Шаблоны успешно загружены.',
                    'success'
                );
            }

            try {
                window.refreshTemplates?.();
            } catch (error) {
                console.error(
                    '[ChMAF] Ошибка обновления интерфейса шаблонов:',
                    error
                );
            }

            return table;
        } catch (error) {
            lastError = error;

            console.warn(
                `[ChMAF] Загрузка шаблонов: попытка ${attempt}/${maxRetries}`,
                error
            );

            if (attempt < maxRetries) {
                const delay = 2 ** attempt * 1000;

                window.showCustomAlert?.(
                    `Не удалось загрузить шаблоны. Повтор через ${delay / 1000} сек.`,
                    'warning'
                );

                await delayMs(delay);
            }
        }
    }

    console.error(
        '[ChMAF] Шаблоны не загружены:',
        lastError
    );

    window.showCustomAlert?.(
        'Не удалось загрузить шаблоны после пяти попыток. Проверьте соединение.',
        'error'
    );

    return null;
}

window.getText = getText;


// ================================================================
// УВЕДОМЛЕНИЯ
// ================================================================

(() => {
    const MAX_TOASTS = 5;
    const activeToasts = [];

    window.showCustomAlert = (
        message,
        type = 'info',
        opts = {}
    ) => {
        let normalizedType = type;
        const text = String(message ?? '');

        if (type === 'message') {
            if (/error|ошибка|fail/i.test(text)) {
                normalizedType = 'error';
            } else if (/warning|внимание/i.test(text)) {
                normalizedType = 'warning';
            } else if (
                /success|успешно|скопирован|создан/i.test(text)
            ) {
                normalizedType = 'success';
            } else {
                normalizedType = 'info';
            }
        }

        if (
            ![
                'success',
                'error',
                'warning',
                'info'
            ].includes(normalizedType)
        ) {
            normalizedType = 'info';
        }

        let container = document.getElementById(
            'chmaf-toast-container'
        );

        if (!container) {
            container = document.createElement('div');
            container.id = 'chmaf-toast-container';
            document.body.appendChild(container);
        }

        while (activeToasts.length >= MAX_TOASTS) {
            const oldest = activeToasts.shift();
            oldest?.remove();
        }

        const requestedDuration = Number(opts.duration);

        const duration =
            Number.isFinite(requestedDuration) &&
                requestedDuration > 0
                ? requestedDuration
                : normalizedType === 'error'
                    ? 6000
                    : 4000;

        const defaultTitle = {
            success: 'Успешно',
            error: 'Ошибка',
            warning: 'Внимание',
            info: 'Информация'
        };

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');

        toast.className =
            `chmaf-toast ${normalizedType}`;

        toast.setAttribute(
            'role',
            normalizedType === 'error'
                ? 'alert'
                : 'status'
        );

        const iconElement = document.createElement('div');
        iconElement.className = 'chmaf-toast-icon';
        iconElement.textContent = icons[normalizedType];

        const contentElement = document.createElement('div');
        contentElement.className = 'chmaf-toast-content';

        const titleElement = document.createElement('div');
        titleElement.className = 'chmaf-toast-title';
        titleElement.textContent = String(
            opts.title ||
            defaultTitle[normalizedType]
        );

        const messageElement = document.createElement('div');
        messageElement.className = 'chmaf-toast-msg';
        messageElement.textContent = text;
        messageElement.style.whiteSpace = 'pre-line';

        contentElement.append(
            titleElement,
            messageElement
        );

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'chmaf-toast-close';
        closeButton.textContent = '×';

        closeButton.setAttribute(
            'aria-label',
            'Закрыть уведомление'
        );

        const progressElement = document.createElement('div');
        progressElement.className = 'chmaf-toast-progress';

        progressElement.style.transition =
            `transform ${duration}ms linear`;

        progressElement.style.transform = 'scaleX(1)';

        toast.append(
            iconElement,
            contentElement,
            closeButton,
            progressElement
        );

        container.appendChild(toast);
        activeToasts.push(toast);

        requestAnimationFrame(() => {
            if (toast.isConnected) {
                progressElement.style.transform = 'scaleX(0)';
            }
        });

        let closed = false;
        let timer = null;
        let remaining = duration;
        let startedAt = Date.now();

        function removeFromList() {
            const index = activeToasts.indexOf(toast);

            if (index !== -1) {
                activeToasts.splice(index, 1);
            }
        }

        function closeToast() {
            if (closed) {
                return;
            }

            closed = true;
            clearTimeout(timer);
            toast.classList.add('closing');

            setTimeout(() => {
                toast.remove();
                removeFromList();
            }, 300);
        }

        closeButton.addEventListener('click', event => {
            event.stopPropagation();
            closeToast();
        });

        toast.addEventListener('click', closeToast);

        timer = setTimeout(closeToast, duration);

        toast.addEventListener('mouseenter', () => {
            if (closed) {
                return;
            }

            clearTimeout(timer);

            remaining -= Date.now() - startedAt;
            remaining = Math.max(remaining, 500);

            progressElement.style.transition = 'none';
        });

        toast.addEventListener('mouseleave', () => {
            if (closed) {
                return;
            }

            startedAt = Date.now();

            progressElement.style.transition =
                `transform ${remaining}ms linear`;

            progressElement.style.transform = 'scaleX(0)';

            timer = setTimeout(closeToast, remaining);
        });

        return toast;
    };
})();

function notify(
    message,
    type = 'info',
    opts = {}
) {
    return window.showCustomAlert?.(
        message,
        type,
        opts
    );
}

window.notify = notify;

function showToast(
    message,
    type = 'info'
) {
    return window.showCustomAlert?.(
        message,
        type
    );
}

window.showToast = showToast;


// -------------------- КОНТЕКСТ РАСШИРЕНИЯ --------------------

(() => {
    if (window.__chmafCtxHandler) {
        return;
    }

    window.__chmafCtxHandler = true;

    const hint =
        'Расширение обновилось и временно недоступно. ' +
        'Сделайте Ctrl+Shift+R. Если не поможет — перезапустите браузер.';

    let lastHintAt = 0;

    function handleContextError(raw) {
        const message = raw instanceof Error
            ? raw.message
            : String(raw ?? '');

        if (
            !/Extension context invalidated/i.test(message)
        ) {
            return false;
        }

        const now = Date.now();

        if (now - lastHintAt > 60_000) {
            lastHintAt = now;

            try {
                window.showCustomAlert?.(hint, 'error');
            } catch {
                // Подсказка не должна вызывать новую ошибку.
            }
        }

        return true;
    }

    window.addEventListener(
        'unhandledrejection',
        event => {
            if (handleContextError(event.reason)) {
                event.preventDefault();
            }
        },
        { signal: cleanupRegistry.signal }
    );

    window.addEventListener(
        'error',
        event => {
            handleContextError(
                event.error ||
                event.message
            );
        },
        { signal: cleanupRegistry.signal }
    );
})();


// ================================================================
// МЕЛКИЕ УТИЛИТЫ СОВМЕСТИМОСТИ
// ================================================================

function hideWindowOnDoubleClick(id) {
    if (readLocalStorage('dblhidewindow') !== '0') {
        return;
    }

    const element = document.getElementById(id);

    if (!element) return;

    element.addEventListener(
        'dblclick',
        event => {
            if (
                event.target
                    ?.closest
                    ?.('.chmaf-drag-handle') &&
                checkelementtype(event)
            ) {
                element.style.display = 'none';
            }
        },
        { signal: cleanupRegistry.signal }
    );
}

function hideWindowOnClick(windowId, buttonId) {
    const windowElement = document.getElementById(
        windowId
    );

    const button = document.getElementById(buttonId);

    if (!windowElement || !button) {
        return;
    }

    button.addEventListener(
        'click',
        () => {
            windowElement.style.display = 'none';
        },
        { signal: cleanupRegistry.signal }
    );
}

async function copyToClipboard(text) {
    const value = String(text ?? '');

    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);
            return;
        } catch {
            // Пробуем резервный способ.
        }
    }

    const textarea = document.createElement('textarea');

    textarea.value = value;
    textarea.style.cssText =
        'position:fixed;left:-9999px;opacity:0;';

    document.body.appendChild(textarea);
    textarea.select();

    try {
        if (!document.execCommand('copy')) {
            throw new Error(
                'Не удалось скопировать текст'
            );
        }
    } finally {
        textarea.remove();
    }
}

function extractLoginLink(text) {
    if (typeof text !== 'string') {
        return null;
    }

    const matches = text.match(
        /https:\/\/id\.skyeng\.ru\/auth\/login-link\/[A-Za-z0-9_/-]+/g
    );

    return (
        matches
            ?.at(-1)
            ?.replace(/["']+$/, '') ||
        null
    );
}

function getLoginLink(
    userid,
    timeoutMs = 20_000
) {
    const id = String(userid ?? '').trim();

    if (!/^\d+$/.test(id)) {
        return Promise.reject(
            new Error('Некорректный userId')
        );
    }

    return new Promise((resolve, reject) => {
        let settled = false;
        let timedOut = false;

        const finish = (error, value) => {
            if (settled) {
                return;
            }

            settled = true;
            clearTimeout(timeoutId);

            if (error) {
                reject(error);
            } else {
                resolve(value);
            }
        };

        const timeoutId = setTimeout(() => {
            timedOut = true;

            finish(
                new Error(
                    'Таймаут получения ссылки'
                )
            );
        }, timeoutMs);

        const body = new URLSearchParams({
            'login_link_form[id]': id,
            'login_link_form[target]':
                'https://vimbox.skyeng.ru',
            'login_link_form[lifetime]': '3600',
            'login_link_form[create]': ''
        }).toString();

        try {
            if (!globalThis.chrome?.runtime?.sendMessage) {
                finish(
                    new Error(
                        'API расширения недоступно'
                    )
                );

                return;
            }

            chrome.runtime.sendMessage(
                {
                    action: 'getFetchRequest',

                    fetchURL:
                        'https://id.skyeng.ru/admin/auth/login-links',

                    requestOptions: {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/x-www-form-urlencoded'
                        },

                        body,
                        credentials: 'include'
                    }
                },
                async response => {
                    if (settled || timedOut) {
                        return;
                    }

                    const runtimeError =
                        chrome.runtime.lastError;

                    if (runtimeError) {
                        finish(
                            new Error(
                                runtimeError.message
                            )
                        );

                        return;
                    }

                    if (!response?.success) {
                        finish(
                            new Error(
                                response?.error ||
                                'Ошибка получения ссылки'
                            )
                        );

                        return;
                    }

                    const link = extractLoginLink(
                        response.fetchAnswer ??
                        response.fetchansver
                    );

                    if (!link) {
                        finish(
                            new Error(
                                'Ссылка логинера не найдена'
                            )
                        );

                        return;
                    }

                    try {
                        await copyToClipboard(link);

                        if (!timedOut) {
                            finish(null, true);
                        }
                    } catch (error) {
                        finish(error);
                    }
                }
            );
        } catch (error) {
            finish(error);
        }
    });
}


// -------------------- ОГРАНИЧЕННАЯ ОБРАБОТКА HTML --------------------

function sanitizeHTML(html) {
    if (typeof html !== 'string') {
        return '';
    }

    const parsed = new DOMParser().parseFromString(
        html,
        'text/html'
    );

    const allowedTags = new Set([
        'P',
        'BR',
        'B',
        'I',
        'U',
        'EM',
        'STRONG',
        'A',
        'UL',
        'OL',
        'LI',
        'SPAN',
        'DIV',
        'H1',
        'H2',
        'H3',
        'H4',
        'H5',
        'H6',
        'BLOCKQUOTE',
        'CODE',
        'PRE',
        'TABLE',
        'THEAD',
        'TBODY',
        'TR',
        'TD',
        'TH'
    ]);

    const allowedAttributes = new Set([
        'href',
        'title',
        'class',
        'target',
        'rel'
    ]);

    function safeLink(href) {
        try {
            const url = new URL(href, location.href);

            return [
                'https:',
                'http:',
                'mailto:',
                'tel:'
            ].includes(url.protocol);
        } catch {
            return false;
        }
    }

    function walk(node) {
        for (const child of [...node.childNodes]) {
            if (child.nodeType === Node.COMMENT_NODE) {
                child.remove();
                continue;
            }

            if (child.nodeType !== Node.ELEMENT_NODE) {
                continue;
            }

            if (!allowedTags.has(child.tagName)) {
                if (
                    [
                        'SCRIPT',
                        'STYLE',
                        'IFRAME',
                        'OBJECT',
                        'EMBED',
                        'SVG',
                        'MATH'
                    ].includes(child.tagName)
                ) {
                    child.remove();
                } else {
                    child.replaceWith(
                        document.createTextNode(
                            child.textContent || ''
                        )
                    );
                }

                continue;
            }

            for (const attribute of [...child.attributes]) {
                if (
                    !allowedAttributes.has(attribute.name)
                ) {
                    child.removeAttribute(
                        attribute.name
                    );
                }
            }

            child.removeAttribute('id');

            if (child.tagName === 'A') {
                const href = child.getAttribute('href');

                if (!href || !safeLink(href)) {
                    child.removeAttribute('href');
                }

                child.setAttribute(
                    'rel',
                    'noopener noreferrer'
                );

                if (
                    child.getAttribute('target') !==
                    '_blank'
                ) {
                    child.removeAttribute('target');
                }
            } else {
                child.removeAttribute('href');
                child.removeAttribute('target');
                child.removeAttribute('rel');
            }

            walk(child);
        }
    }

    walk(parsed.body);

    return parsed.body.innerHTML;
}