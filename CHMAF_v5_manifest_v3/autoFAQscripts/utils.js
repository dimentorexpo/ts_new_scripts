'use strict';

// ═══════════════════════════════════════════════════════════════
// ⚡ SHARED STATE — единственное место объявления!
// content.js ИСПОЛЬЗУЕТ эти переменные, но НЕ объявляет повторно.
// Порядок загрузки в manifest: utils.js → ... → content.js
// ═══════════════════════════════════════════════════════════════
let bool = 0;
let table = [];
let opsection = '';
// ⚡ Нормализованный доступ к отделу — ЕДИНЫЙ источник истины для isTP.
// opsection может прийти с whitespace — всегда читаем через getOpSection().
function getOpSection() { return (opsection || '').toString().trim(); }
function isTpOperator() { return getOpSection().startsWith('ТП'); }
// ⚡ было: DEFAULT_SCRIPT_ADR в content.js (позже utils.js)
// стало: правильный дефолт здесь, до первого использования
const DEFAULT_SCRIPT_ADR = 'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec';
let scriptAdr = localStorage.getItem('scriptAdr') || DEFAULT_SCRIPT_ADR;
if (!localStorage.getItem('scriptAdr')) {
    try { localStorage.setItem('scriptAdr', DEFAULT_SCRIPT_ADR); } catch { }
}

/** @type {number|null} */
let checkchatsIntervalId = null;
/** @type {number|null} */
let timerHideButtonsIntervalId = null;

// ⚡ Очистка legacy-мусора батчем
['girlyanda', 'snowcursor', 'AF_elka', 'AF_hat', 'AF_bag'].forEach(k => {
    try { localStorage.removeItem(k); } catch { }
});

// ⚡ Immutable config
const MODULE_MENU_CONFIG = Object.freeze([
    Object.freeze({ id: 'JiraOpenForm', text: '🔎 Jira Search', fn: () => window.getJiraOpenFormPress?.(), tp: true }),
    Object.freeze({ id: 'crmopersstatuses', text: '🧮 Статусы CRM2', fn: () => window.getcrmopersstatusesButtonPress?.(), tp: true }),
    Object.freeze({ id: 'butMarks', text: '🎭 Оценки', fn: () => window.getbutMarksButtonPress?.(), tp: false }),
    Object.freeze({ id: 'smartroomform', text: '🦐 Smartroom', fn: () => window.getsmartroomformButtonPress?.(), tp: true }),
    Object.freeze({ id: 'butLessonInfo', text: '🎓 Lesson Info', fn: () => window.getbutLessonInfoButtonPress?.(), tp: false }),
    Object.freeze({ id: 'butFrozeChat', text: '❄ Auto Respond', fn: () => window.getbutFrozeChatButtonPress?.(), tp: false }),
    Object.freeze({ id: 'buttonGetStat', text: '📊 Статистика', fn: () => window.getbuttonGetStatButtonPress?.(), tp: false }),
    Object.freeze({ id: 'buttonTimetable', text: '⏱️ Timetable', fn: () => window.getbutTimetableButtonPress?.(), tp: false }),
    Object.freeze({ id: 'buttonCheckCRMComments', text: '🛄 CRM Task', fn: () => window.getbutCRMCommentsButtonPress?.(), tp: true }),
    Object.freeze({
        id: 'butMattermost', text: '🔍 Mattermost', fn: () => {
            typeof window.getMattermostSearchPress === 'function'
                ? window.getMattermostSearchPress()
                : window.createAndShowButton?.('⚠️ Модуль Mattermost не загружен. Перезагрузите расширение.', 'warning');
        }, tp: false
    }),
    Object.freeze({ id: 'buttonGetQueue', text: '🚧 Очередь', fn: () => window.getQueuePress?.(), tp: false }),
]);
const MODULE_MENU_MAP = new Map(MODULE_MENU_CONFIG.map(item => [item.id, item]));

// ═══════════════════════════════════════════════════════════════
// ⚡ CLEANUP REGISTRY — единая точка teardown
// ═══════════════════════════════════════════════════════════════
const cleanupRegistry = {
    /** @type {Array<() => void>} */
    _fns: [],
    /** @type {Set<number>} */
    _intervals: new Set(),
    /** @type {Set<number>} */
    _timeouts: new Set(),
    /** @type {AbortController|null} */
    _globalAbort: null,
    init() {
        if (this._globalAbort) return;
        this._globalAbort = new AbortController();
        window.addEventListener('beforeunload', () => this.teardown(), { once: true });
    },
    register(fn) { this._fns.push(fn); },
    registerInterval(id) { this._intervals.add(id); return id; },
    registerTimeout(id) { this._timeouts.add(id); return id; },
    clearTimeout(id) { globalThis.clearTimeout(id); this._timeouts.delete(id); },
    get signal() { return this._globalAbort?.signal; },
    teardown() {
        for (const fn of this._fns) { try { fn(); } catch { } }
        this._fns.length = 0;
        for (const id of this._intervals) clearInterval(id);
        this._intervals.clear();
        for (const id of this._timeouts) clearTimeout(id);
        this._timeouts.clear();
        this._globalAbort?.abort();
        this._globalAbort = null;
    }
};
cleanupRegistry.init();

// ═══════════════════════════════════════════════════════════════
// УТИЛИТЫ DOM
// ═══════════════════════════════════════════════════════════════
function checkelementtype(e) {
    const elem = e.target;
    if (!elem || !(elem instanceof Element)) return false;
    if (elem.closest('input, textarea, select, button, a, [onclick], [contenteditable="true"], [class*="btn"], [class*="Button"], [class*="clickable"]')) return false;
    let current = elem;
    const boundary = e.currentTarget;
    while (current && current !== boundary) {
        if (current.onclick || current.onmousedown) return false;
        current = current.parentElement;
    }
    return true;
}

function enableDrag(element, options = {}) {
    const {
        handle = null, storageKey = null, savePosition = true,
        snapToEdges = true, snapGrid = 0, snapThreshold = 18,
        onDragStart = null, onDragEnd = null
    } = options;

    let isDragging = false, offsetX = 0, offsetY = 0;
    let cachedWidth = 0, cachedHeight = 0;
    const handleSelector = handle || '.chmaf-drag-handle';

    const isInteractive = (el) => el && !!el.closest('input, select, textarea, [contenteditable="true"], button, a');
    const isDragHandle = (target) => {
        if (!handleSelector) return element.contains(target);
        if (typeof handleSelector === 'string') return target.closest(handleSelector) !== null || target.matches(handleSelector);
        return handleSelector.contains(target) || target === handleSelector;
    };

    if (storageKey && savePosition) {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const pos = JSON.parse(raw);
                if (typeof pos.x === 'number' && typeof pos.y === 'number') {
                    element.style.left = pos.x + 'px';
                    element.style.top = pos.y + 'px';
                    element.style.right = 'auto';
                }
            }
        } catch { }
    }

    function applySnap(x, y, isFinal, w, h) {
        let nx = x, ny = y;
        if (snapToEdges) {
            const vw = window.innerWidth, vh = window.innerHeight;
            if (Math.abs(nx) < snapThreshold) nx = 0;
            else if (Math.abs(nx + w - vw) < snapThreshold) nx = vw - w;
            if (Math.abs(ny) < snapThreshold) ny = 0;
            else if (Math.abs(ny + h - vh) < snapThreshold) ny = vh - h;
            if (Math.abs(ny + h / 2 - vh / 2) < snapThreshold / 2) ny = (vh - h) / 2;
        }
        if (snapGrid > 0 && isFinal) {
            nx = Math.round(nx / snapGrid) * snapGrid;
            ny = Math.round(ny / snapGrid) * snapGrid;
        }
        return { x: nx, y: ny };
    }

    const onMouseDown = (e) => {
        if (e.button !== 0 || !isDragHandle(e.target) || isInteractive(e.target)) return;
        isDragging = true;
        const rect = element.getBoundingClientRect();
        cachedWidth = rect.width; cachedHeight = rect.height;
        offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
        element.style.transition = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        onDragStart?.();
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        const snapped = applySnap(e.clientX - offsetX, e.clientY - offsetY, false, cachedWidth, cachedHeight);
        element.style.left = snapped.x + 'px';
        element.style.top = snapped.y + 'px';
        element.style.right = 'auto';
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        element.style.transition = '';
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        const rect = element.getBoundingClientRect();
        const final = applySnap(rect.left, rect.top, true, rect.width, rect.height);
        element.style.left = final.x + 'px';
        element.style.top = final.y + 'px';
        if (storageKey && savePosition) {
            try { localStorage.setItem(storageKey, JSON.stringify(final)); } catch { }
        }
        onDragEnd?.(final);
    };

    const signal = cleanupRegistry.signal;
    element.addEventListener('mousedown', onMouseDown, { signal });
    document.addEventListener('mousemove', onMouseMove, { signal, passive: true });
    document.addEventListener('mouseup', onMouseUp, { signal });

    const cleanup = () => {
        element.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    cleanupRegistry.register(cleanup);
    return cleanup;
}

function createWindow(id, topKey, leftKey, content) {
    const windowElement = document.createElement('div');
    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    if (id === 'TestUsers') windowElement.classList.add('onlyfortp', 'testuserwindow');
    else if (id === 'AF_addChatMenu') windowElement.classList.add('wintInitializeChat');
    else windowElement.classList.add('extwindows');

    windowElement.style.cssText = `position:fixed;top:${storedTop}px;left:${storedLeft}px;display:none;`;
    if (['AF_Timetable', 'AF_Grabber', 'AF_GrList', 'AF_SpecCommWindow'].includes(id)) {
        windowElement.style.zIndex = '1100000';
    }
    windowElement.id = id;

    // ⚡ БЕЗОПАСНАЯ ВСТАВКА через <template>
    const tmpl = document.createElement('template');
    tmpl.innerHTML = content;
    tmpl.content.querySelectorAll('script, iframe, object, embed').forEach(n => n.remove());
    windowElement.appendChild(tmpl.content);
    document.body.append(windowElement);

    requestAnimationFrame(() => {
        const w = windowElement.offsetWidth, h = windowElement.offsetHeight;
        if (!w || !h) return;
        const top = parseFloat(windowElement.style.top) || 0;
        const left = parseFloat(windowElement.style.left) || 0;
        const fixedTop = Math.min(Math.max(top, 0), Math.max(0, window.innerHeight - h));
        const fixedLeft = Math.min(Math.max(left, 0), Math.max(0, window.innerWidth - w));
        if (fixedTop !== top || fixedLeft !== left) {
            windowElement.style.top = fixedTop + 'px';
            windowElement.style.left = fixedLeft + 'px';
        }
    });

    const dragCleanup = enableDrag(windowElement, {
        handle: '.chmaf-drag-handle',
        storageKey: `drag_pos_${id}`,
        savePosition: true,
        snapToEdges: true,
        snapGrid: 8,
        onDragEnd: (pos) => {
            try {
                localStorage.setItem(topKey, String(pos.y));
                localStorage.setItem(leftKey, String(pos.x));
            } catch { }
        }
    });

    let lastClickTime = 0;
    const onInputMouseDown = (e) => {
        const input = e.target;
        if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement)) return;
        if (input.type === 'button' || input.type === 'submit') return;
        e.stopPropagation();
        const now = Date.now();
        if (now - lastClickTime < 400) return;
        lastClickTime = now;
        if (input.selectionStart !== input.selectionEnd && e.detail === 1) {
            const pos = getCaretPositionFromPoint(input, e.clientX, e.clientY);
            input.setSelectionRange(pos, pos);
        }
    };
    windowElement.addEventListener('mousedown', onInputMouseDown, { signal: cleanupRegistry.signal });
    cleanupRegistry.register(() => { dragCleanup(); windowElement.remove(); });
    return windowElement;
}

function getCaretPositionFromPoint(element, x, y) {
    if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos && (pos.offsetNode === element || element.contains(pos.offsetNode))) return pos.offset;
    }
    if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(x, y);
        if (range && (range.startContainer === element || element.contains(range.startContainer))) return range.startOffset;
    }
    return element.selectionStart ?? 0;
}

function getStorageData(keys) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
                resolve(result ?? {});
            });
        } catch (e) { reject(e); }
    });
}

// ═══════════════════════════════════════════════════════════════
// FAB
// ═══════════════════════════════════════════════════════════════
function injectFABStyles() {
    if (document.getElementById('fab-premium-styles')) return;
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
#rightPanel > * { pointer-events: auto; }
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
    background: linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%), rgba(18, 18, 28, 0.85);
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15);
    font-size: 19px;
    color: hsl(var(--fab-color), var(--fab-sat), var(--fab-light));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
    background: radial-gradient(circle at 50% 20%, rgba(255,255,255,0.2) 0%, transparent 60%);
    pointer-events: none;
    opacity: 0.6;
}
.fab-premium::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle, hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.3) 0%, transparent 70%);
    transform: scale(0);
    opacity: 0;
    pointer-events: none;
}
.fab-premium:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 0 24px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.3), 0 0 0 1px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2);
    color: #fff;
    text-shadow: 0 0 12px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.8);
}
.fab-premium:active {
    transform: scale(0.95);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), inset 0 2px 8px rgba(0, 0, 0, 0.6);
    transition: all 0.1s ease;
}
.fab-premium:active::after {
    animation: fab-ripple 0.6s ease-out;
}
@keyframes fab-ripple {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
}
.fab-premium.active {
    background: linear-gradient(145deg, hsla(var(--fab-color), var(--fab-sat), 50%, 0.2) 0%, hsla(var(--fab-color), var(--fab-sat), 30%, 0.1) 100%), rgba(18, 18, 28, 0.95);
    box-shadow: 0 8px 32px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.3), 0 0 0 2px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.6), inset 0 0 20px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.1);
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
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
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
.fab-premium[data-theme="cyan"] { --fab-color: 190; --fab-sat: 90%; --fab-light: 60%; }
.fab-premium[data-theme="amber"] { --fab-color: 35; --fab-sat: 95%; --fab-light: 58%; }
.fab-premium[data-theme="emerald"] { --fab-color: 150; --fab-sat: 80%; --fab-light: 55%; }
.fab-premium[data-theme="rose"] { --fab-color: 340; --fab-sat: 90%; --fab-light: 65%; }
.fab-premium[data-theme="violet"] { --fab-color: 265; --fab-sat: 90%; --fab-light: 68%; }
.fab-premium[data-theme="orange"] { --fab-color: 25; --fab-sat: 95%; --fab-light: 60%; }
.fab-premium.onlyfortp { display: none; }
@keyframes fab-slide-in {
    from { opacity: 0; transform: translateX(100px) scale(0.8); }
    to { opacity: 1; transform: translateX(0) scale(1); }
}
.fab-premium { animation: fab-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards; }
.fab-premium:nth-child(1) { animation-delay: 0.05s; }
.fab-premium:nth-child(2) { animation-delay: 0.1s; }
.fab-premium:nth-child(3) { animation-delay: 0.15s; }
.fab-premium:nth-child(4) { animation-delay: 0.2s; }
.fab-premium:nth-child(5) { animation-delay: 0.25s; }
.fab-premium:nth-child(6) { animation-delay: 0.3s; }
.fab-premium:nth-child(7) { animation-delay: 0.35s; }
.fab-premium:nth-child(8) { animation-delay: 0.4s; }
.m-menu-panel {
    position: fixed;
    top: 50%;
    right: 80px;
    transform: translateY(-50%);
    background: rgba(18, 18, 28, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    padding: 12px;
    z-index: 2147483646;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.1);
    max-height: 80vh;
    overflow-y: auto;
}
.m-menu-btn {
    padding: 10px 16px;
    color: #fff;
    cursor: pointer;
    border-radius: 8px;
    margin: 2px 0;
    transition: all 0.2s ease;
    font-size: 14px;
    white-space: nowrap;
}
.m-menu-btn:hover {
    background: rgba(255,255,255,0.1);
    transform: translateX(-4px);
}
.menubarstyle { min-width: 200px; }
/* ⚡ ФИКС растянутого меню:
   1) height: max-content — панель строго по контенту (не тянется);
   2) transform: none — базовый translateY(-50%) конфликтовал с
      позиционированием style.css (top:0 !important);
   3) декоративные ::before/::after (glow высотой 200%) создают
      скроллируемый overflow при overflow-y:auto → гигантская пустая
      зона и скроллбар. Отключаем их — menu без пустоты. */
#idmymenu {
    height: max-content !important;
    transform: none !important;
    overflow: hidden auto;
    overscroll-behavior: contain;
}
#idmymenu::before,
#idmymenu::after {
    display: none !important;
}
    `;
    document.head.appendChild(style);
}

function createFAB(config) {
    const { id, icon, title, theme = 'cyan', onClick } = config;
    const btn = document.createElement('button');
    btn.id = id;
    btn.className = 'fab-premium';
    btn.setAttribute('data-theme', theme);
    btn.setAttribute('aria-label', title);
    btn.innerHTML = `${icon}<span class="fab-tooltip">${title}</span>`;
    btn.addEventListener('click', onClick, { signal: cleanupRegistry.signal });
    return btn;
}

// ═══════════════════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ
// ═══════════════════════════════════════════════════════════════
async function waitForOperator(maxMs = 60_000) {
    const start = Date.now();
    let delay = 500;
    // ⚡ whoAmI может кидать исключение (iframe, DOM-гонки) — гасим per-attempt,
    // иначе rejected operatorPromise валил Promise.all в move_again_AF,
    // и весь init (включая построение меню) улетал в catch.
    const tryIdentify = async () => {
        try { return !!(await window.whoAmI?.()); }
        catch (e) { console.warn('[ChMAF] whoAmI attempt error:', e); return false; }
    };
    let ok = await tryIdentify();
    while (!ok && Date.now() - start < maxMs) {
        await new Promise(r => setTimeout(r, delay));
        delay = Math.min(delay * 2, 5000);
        ok = await tryIdentify();
    }
    if (!ok) console.error('[ChMAF] Не удалось идентифицировать оператора за', maxMs, 'мс');
    return ok;
}

async function migrateScriptAddresses() {
    // ⚡ было: при ошибке storage data мог остаться null → TypeError вниз по стеку
    // стало: любой исход превращается в валидный объект
    let data = null;
    try {
        data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']);
    } catch (e) {
        console.error('[ChMAF] chrome.storage.local недоступен:', e);
    }
    if (!data || typeof data !== 'object') data = {};

    // ⚡ было: DEFAULT_SCRIPT_ADR = '' — пустой фолбэк
    // стало: если storage пуст (сброс профиля / reinstall без onInstalled) — сеем дефолты сами
    if (!data.KC_addr && !data.TP_addr) {
        data = {
            KC_addr: 'https://script.google.com/macros/s/AKfycbzV8BHtyD3XUcPjZmb9pwwY-2cwAKx8hTRZKVENpKhdCJYe-hF0rpyDVdUIXBUin326Lw/exec',
            TP_addr: 'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec',
            KC_addrRzrv: 'https://script.google.com/macros/s/AKfycbzn2Lv0uuqXG5-mSWHu2W_fAmeeVJ9WVtT1hNNMAj9z9p5I0WLZnydzTcE8z1H5nuaTiQ/exec',
            TP_addrRzrv: 'https://script.google.com/macros/s/AKfycbyL2uTpWRlajHmtRXpjUq2yiPw6f_t-tHoBglkG-ojoA7ksnqMXr0_BXzhZFk31qV7jmQ/exec'
        };
        try { chrome.storage.local.set(data); } catch (e) { }
        console.warn('[ChMAF] chrome.storage был пуст — адреса восстановлены из дефолтов');
    }

    const known = [data.KC_addr, data.TP_addr, data.KC_addrRzrv, data.TP_addrRzrv].filter(Boolean);
    if (!known.includes(scriptAdr)) {
        scriptAdr = (localStorage.getItem('tpflag') === 'ТП' ? data.TP_addr : data.KC_addr) || DEFAULT_SCRIPT_ADR;
        try { localStorage.setItem('scriptAdr', scriptAdr); } catch (e) { }
        console.warn('[ChMAF] Адрес шаблонов устарел — сброшен на актуальный:', scriptAdr);
    }
    return data; // ⚡ контракт: всегда non-null Object
}

function buildSidePanel() {
    const existing = document.getElementById('rightPanel');
    if (existing) existing.remove();
    injectFABStyles();
    const panel = document.createElement('div');
    panel.id = 'rightPanel';
    document.body.append(panel);
    return panel;
}

function addFabButton(panel, id, icon, title, theme, onClick) {
    const btn = createFAB({ id, icon, title, theme, onClick });
    panel.appendChild(btn);
    return btn;
}

function buildModuleMenu(panel, isTP) {
    let menubar = document.getElementById('idmymenu');
    if (menubar) menubar.remove();
    menubar = document.createElement('div');
    menubar.id = 'idmymenu';
    menubar.className = 'm-menu-panel menubarstyle';
    menubar.style.display = 'none';
    panel.appendChild(menubar);

    menubar.innerHTML = MODULE_MENU_CONFIG
        .filter(item => !item.tp || isTP)
        .map(item => `<div id="${item.id}" class="m-menu-btn">${item.text}</div>`)
        .join('');

    menubar.addEventListener('click', (e) => {
        const btn = e.target.closest('.m-menu-btn');
        if (!btn) return;
        const config = MODULE_MENU_MAP.get(btn.id);
        if (config) {
            try { config.fn(); }
            catch (err) {
                console.error(`[ChMAF] Ошибка модуля ${btn.id}:`, err);
                window.showCustomAlert?.(`⚠️ Ошибка модуля: ${btn.id}`, 'error');
            }
        }
        menubar.style.display = 'none';
        document.getElementById('MainMenuBtn')?.classList.remove('active');
    }, { signal: cleanupRegistry.signal });
}

function setupDepartment(data) {
    // ⚡ Единый источник истины — opsection (кто РЕАЛЬНО залогинен).
    // Определение по scriptAdr/tpflag — только фолбэк, пока отдел неизвестен:
    // расхождение этих источников приводило к тому, что ТП-оператору
    // вызывался prepKC() и все .onlyfortp скрывались с !important до F5.
    const section = getOpSection();
    const tpAddr = data?.TP_addr ?? '';
    const tpAddrRzrv = data?.TP_addrRzrv ?? '';
    const isKC = section
        ? !isTpOperator()
        : (tpAddr
            ? (scriptAdr !== tpAddr && scriptAdr !== tpAddrRzrv)
            : localStorage.getItem('tpflag') !== 'ТП'); // фолбэк по сохранённому флагу отдела

    if (isKC && localStorage.getItem('hideTaskWindow') === '1') {
        try { localStorage.setItem('hideTaskWindow', '0'); } catch (e) { }
    }
    // ⚡ изолируем отдел-специфичные функции: падение prepTp не должно убивать оркестратор
    try {
        isKC ? prepKC() : prepTp();
    } catch (e) {
        console.error('[ChMAF] Ошибка prepTp/prepKC:', e);
    }
}

function startBackgroundTasks() {
    if (!window.__chmafCtrlKeysBound) {
        window.__chmafCtrlKeysBound = true;
        const signal = cleanupRegistry.signal;
        window.addEventListener('keydown', (e) => { if (e.key === 'Control') bool = 1; }, { signal });
        window.addEventListener('keyup', (e) => { if (e.key === 'Control') bool = 0; }, { signal });
    }
    if (checkchatsIntervalId !== null) clearInterval(checkchatsIntervalId);
    checkchatsIntervalId = cleanupRegistry.registerInterval(
        setInterval(() => window.checkchats?.(), 1000)
    );
}

// ═══════════════════════════════════════════════════════════════
// ГЛАВНЫЙ ОРКЕСТРАТОР
// ═══════════════════════════════════════════════════════════════
async function move_again_AF() {
    console.log('[ChMAF] 🚀 move_again_AF started, path:', location.pathname);
    if (location.pathname === '/login') {
        console.log('[ChMAF] ⏸ На /login, выходим');
        return;
    }

    // ⚡ Идемпотентность: панель строится ОДИН РАЗ за загрузку страницы.
    // Смена пути (SPA-навигация) не требует пересоздания FAB — иначе
    // каждый переход между /tickets/* вызывает повторную анимацию отрисовки.
    if (document.getElementById('rightPanel')?.children.length) {
        console.log('[ChMAF] ⏭ Панель уже построена — переход без переинициализации:', location.pathname);
        return;
    }

    try {
        // ⚡ ГЛАВНЫЙ ФИКС: запускаем идентификацию параллельно, НЕ блокируя создание FAB
        const operatorPromise = waitForOperator();
        const dataPromise = migrateScriptAddresses().catch((e) => {
            console.error('[ChMAF] migrateScriptAddresses failed:', e);
            return {};
        });

        // fire-and-forget загрузка шаблонов
        getText();

        // ⚡ Базовый FAB создаётся СРАЗУ (не ждём whoAmI)
        const panel = buildSidePanel();
        window.__chmafPanel = panel; // ⚡ доступ из retry-блока для перестроения меню
        lastInitializedPath = location.pathname; // ⚡ фиксируем успешную инициализацию пути
        console.log('[ChMAF] ✅ базовый panel создан');

        addFabButton(panel, 'scriptBut', '🧩', 'Шаблоны', 'cyan', () => {
            const el = document.getElementById('AF_helper');
            if (!el) return createAndShowButton('Панель шаблонов ещё не построена — обновите страницу', 'warning');
            const isHidden = el.style.display === 'none';
            el.style.display = isHidden ? 'flex' : 'none';
            document.getElementById('scriptBut')?.classList.toggle('active', isHidden);
        });

        addFabButton(panel, 'themes', '📚', 'Темы', 'violet', getThemesButtonPress);

        addFabButton(panel, 'MainMenuBtn', '👺', 'Меню', 'rose', () => {
            let el = document.getElementById('idmymenu');
            if (!el) {
                // ⚡ Ленивое построение: если меню почему-то нет (идентификация
                // не завершилась/упала) — строим по текущему известному отделу.
                buildModuleMenu(panel, isTpOperator());
                el = document.getElementById('idmymenu');
                if (!el) return;
            }
            const isHidden = el.style.display === 'none';
            el.style.display = isHidden ? '' : 'none';
            document.getElementById('MainMenuBtn')?.classList.toggle('active', isHidden);
        });

        // ⚡ Меню строим СРАЗУ, не дожидаясь идентификации оператора:
        // если префикса отдела нет/не распознан (waitForOperator ждёт до 60 сек),
        // всё это время клик по 👺 молчал — idmymenu ещё не существовал.
        // После идентификации меню перестраивается с корректным isTP ниже
        // (buildModuleMenu сам удаляет предыдущее меню).
        buildModuleMenu(panel, isTpOperator());

        addFabButton(panel, 'opennewcat', '☢', 'История чатов', 'emerald', getopennewcatButtonPress);

        // ⚡ Ждём результат идентификации и адресов
        const [operatorReady, data] = await Promise.all([operatorPromise, dataPromise]);
        console.log('[ChMAF] whoAmI:', operatorReady, '| opsection:', getOpSection(), '| isTP:', isTpOperator());

        // Модульное меню зависитает от отдела
        const isTP = isTpOperator();
        buildModuleMenu(panel, isTP);

        // ⚡ Отдел-специфичные кнопки добавляются ПОСЛЕ успешной идентификации
        if (operatorReady) {
            setupDepartment(data);
            console.log('[ChMAF] ✅ отдел-кнопки добавлены');
        } else {
            console.warn('[ChMAF] ⚠️ Оператор не идентифицирован — retry через 15 сек');
            // Retry: через 15 секунд пробуем ещё раз добавить отдел-кнопки
            setTimeout(async () => {
                const retry = await waitForOperator(30_000);
                if (!retry) {
                    console.error('[ChMAF] ❌ Оператор так и не идентифицирован за retry-таймаут');
                    return;
                }
                const retryData = await migrateScriptAddresses();
                // ⚡ ФИКС пропадающих пунктов меню: меню могло быть построено
                // ДО определения отдела (isTP=false по умолчанию) — перестраиваем
                // с корректным isTP. buildModuleMenu сам удаляет старое меню.
                const isTP = isTpOperator();
                const rp = window.__chmafPanel || document.getElementById('rightPanel');
                if (rp) buildModuleMenu(rp, isTP);
                setupDepartment(retryData);
                console.log('[ChMAF] ✅ отдел-кнопки и меню добавлены после retry, isTP:', isTP);
            }, 15_000);
        }

        startBackgroundTasks();
        console.log('[ChMAF] ✅ init complete, FAB count:', panel.children.length);
    } catch (err) {
        console.error('[ChMAF] ❌ Критическая ошибка инициализации:', err);
        showCustomAlert('⚠️ Ошибка инициализации. Перезагрузите страницу.', 'error');
    }
}

// ⚡ ТОЧКА ВХОДА — устойчива к любому способу навигации:
// 1) полный reload → сработает startInit ниже;
// 2) pushState/replaceState ПОСЛЕ загрузки → ловит патч History API;
// 3) pushState ДО установки патча (роутер сайта кэширует ссылку на
//    history.pushState при инициализации бандла, а мы инжектимся в
//    document_idle — позже) → ловит watchdog по опросу location.pathname.
let lastPath = window.location.pathname;
let lastInitializedPath = '';
let moveAgainScheduled = false;

function scheduleMoveAgain(delay = 1500) {
    if (moveAgainScheduled) return;
    moveAgainScheduled = true;
    cleanupRegistry.registerTimeout(setTimeout(() => {
        moveAgainScheduled = false;
        move_again_AF();
    }, delay));
}

function checkPathChange() {
    const currentPath = window.location.pathname;
    if (currentPath === lastPath) return;
    lastPath = currentPath;
    console.log('[ChMAF] 🔄 Path changed:', currentPath);
    if (currentPath !== '/login') scheduleMoveAgain(1500);
}

// 1) Стартовая инициализация: если мы уже не на /login
if (lastPath !== '/login') {
    scheduleMoveAgain(3000);
}

// 2) Патч History API — ставим ВСЕГДА (быстрая реакция на SPA-навигацию)
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

    // popstate — для навигации кнопками "назад/вперёд"
    window.addEventListener('popstate', checkPathChange, { signal: cleanupRegistry.signal });

    // hashchange — для якорных ссылок
    window.addEventListener('hashchange', checkPathChange, { signal: cleanupRegistry.signal });

    cleanupRegistry.register(() => {
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
    });
}

// 3) ⚡ Watchdog-страховка: дешёвый опрос pathname (строковое сравнение раз в 700 мс).
// Ловит ЛЮБУЮ смену URL, включая pushState, сделанный роутером сайта по
// закэшированной до нашего патча ссылке на history.pushState.
// Именно этот случай не ловился раньше: после логина сайт менял layout без
// полной перезагрузки, патч не срабатывал — и FAB-кнопки не появлялись до F5.
cleanupRegistry.registerInterval(setInterval(checkPathChange, 700));


// ═══════════════════════════════════════════════════════════════
// ОТДЕЛ-СПЕЦИФИЧНЫЕ
// ═══════════════════════════════════════════════════════════════
function prepTp() {
    const p = document.getElementById('rightPanel');
    if (!p) return;
    // ⚡ Снимаем скрытие с onlyfortp-элементов ВНЕ панели (AF_helper, настройки):
    // prepKC()/Settings могли скрыть их inline с !important, а prepTp раньше
    // показывал только свои FAB-кнопки → элементы оставались невидимыми до F5.
    // FAB-кнопки не трогаем (их создаём ниже с flex !important), окна
    // (#TestUsers и т.п.) — тоже: у них display:none это штатное состояние.
    document.querySelectorAll('.onlyfortp:not(.fab-premium)').forEach(el => {
        if (el.id === 'TestUsers' || el.closest('#TestUsers') ||
            el.classList.contains('extwindows') || el.classList.contains('testuserwindow')) return;
        el.style.removeProperty('display'); // снимает и inline !important
    });
    if (p.querySelector('.onlyfortp')) return; // ⚡ уже добавлены — не дублируем
    const create = (id, icon, title, theme, fn) => {
        if (typeof fn !== 'function') {
            console.warn(`[ChMAF] Модуль кнопки "${id}" не загружен — пропуск`);
            return;
        }
        const btn = createFAB({ id, icon, title, theme, onClick: fn });
        btn.classList.add('onlyfortp');
        // ⚡ inline !important — пробивает любое CSS-правило .onlyfortp { display: none }
        btn.style.setProperty('display', 'flex', 'important');
        p.appendChild(btn);
    };
    create('datsyCalendar', '📅', 'Datsy', 'amber', getdatsyCalendarButtonPress);
    create('butServ', '⚜', 'Сервисы', 'violet', function () {
        const s = document.getElementById('AF_Service');
        if (!s) return;
        const v = s.style.display !== 'none';
        s.style.display = v ? 'none' : '';
        this.classList.toggle('active', !v);
    });
    create('knowledgeCenter', '💡', 'БЗ', 'orange', getknowledgeCenterButtonPress);
    create('taskBut', '🛠', 'Задачи', 'emerald', gettaskButButtonPress);
    if (timerHideButtonsIntervalId === null) {
        timerHideButtonsIntervalId = setInterval(timerHideButtons, 500);
        cleanupRegistry.registerInterval(timerHideButtonsIntervalId);
    }
}

function prepKC() {
    const l = document.querySelector('.user_menu-language_switcher');
    if (l) l.style.display = localStorage.getItem('disablelpmwindow') === '1' ? 'none' : '';
    document.querySelectorAll('.onlyfortp').forEach(e => e.style.setProperty('display', 'none', 'important'));
    document.querySelectorAll('.onlyforkc').forEach(e => e.style.removeProperty('display'));
}
// Экспортируем в window для cross-script доступа
window.prepTp = prepTp;
window.prepKC = prepKC;

// ═══════════════════════════════════════════════════════════════
// API
// ═══════════════════════════════════════════════════════════════
async function fetchGasJson(url, timeoutMs = 15_000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    cleanupRegistry.signal?.addEventListener('abort', () => controller.abort(), { once: true });
    try {
        const r = await fetch(url, { signal: controller.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.json();
    } catch (e) {
        if (e.name === 'AbortError') throw new Error(`[ChMAF] Fetch timeout: ${url}`);
        const ans = await new Promise((resolve) => {
            const t = setTimeout(() => resolve(null), timeoutMs);
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url }, (resp) => {
                clearTimeout(t);
                if (chrome.runtime.lastError || !resp?.success) resolve(null);
                else resolve(resp.fetchansver);
            });
        });
        if (!ans) throw e;
        return JSON.parse(ans);
    } finally {
        clearTimeout(timeoutId);
    }
}

async function getText() {
    try {
        const json = await fetchGasJson(scriptAdr);
        if (!json || !Array.isArray(json.result)) throw new Error('Нет массива result: ' + scriptAdr);
        table = json.result;
        console.log(`[ChMAF] Шаблоны загружены: ${table.length} строк`);
        window.refreshTemplates?.();
    } catch (e) {
        console.error('[ChMAF] Не удалось загрузить шаблоны:', e);
    }
}
window.getText = getText;

// ═══════════════════════════════════════════════════════════════
// УВЕДОМЛЕНИЯ
// ═══════════════════════════════════════════════════════════════
(function () {
    if (window.showCustomAlert) return;
    const MAX_TOASTS = 5;
    const activeToasts = [];
    window.showCustomAlert = (msg, type = 'message') => {
        if (typeof window.showNotification === 'function') return window.showNotification(msg, type);
        if (typeof window.NotificationSystem?.showNotification === 'function') return window.NotificationSystem.showNotification(msg, type);

        if (activeToasts.length >= MAX_TOASTS) activeToasts.shift()?.remove();
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(20,20,35,0.95);color:#f1f5f9;padding:12px 18px;border-radius:12px;z-index:9999999;backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);box-shadow:0 8px 32px rgba(0,0,0,0.45);font-size:13px;opacity:0;transform:translateY(10px);transition:all 0.3s cubic-bezier(0.16,1,0.3,1);';
        t.textContent = msg;
        document.body.appendChild(t);
        activeToasts.push(t);
        requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
        const removeTimer = setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateY(10px)';
            setTimeout(() => {
                t.remove();
                const idx = activeToasts.indexOf(t);
                if (idx !== -1) activeToasts.splice(idx, 1);
            }, 300);
        }, 4000);
        cleanupRegistry.registerTimeout(removeTimer);
    };
})();
// ═══════════════════════════════════════════════════════════════
// ⚡ "Extension context invalidated" — дружелюбная подсказка юзеру
// Возникает, когда расширение обновилось/перезагрузилось, а страница
// всё ещё работает со старым контент-скриптом (chrome.* API мёртв).
// Ловим ошибку в трёх каналах: необработанные promise-rejection,
// необработанные синхронные ошибки и вывод через console.error.
// ═══════════════════════════════════════════════════════════════
(function () {
    if (window.__chmafCtxHandler) return;
    window.__chmafCtxHandler = true;

    const HINT = '⚠️ Расширение обновилось и временно недоступно. ' +
        'Сделайте Ctrl+Shift+R (жёсткая перезагрузка страницы), ' +
        'а если не поможет — перезапустите браузер, чтобы подтянулась актуальная версия расширения.';
    let lastHintAt = 0;

    function handleContextError(raw) {
        const msg = raw instanceof Error ? raw.message : String(raw ?? '');
        if (!/Extension context invalidated/i.test(msg)) return false;
        const now = Date.now();
        if (now - lastHintAt > 60_000) { // не спамим тостами
            lastHintAt = now;
            try { window.showCustomAlert?.(HINT, 'error'); } catch { }
        }
        console.warn('[ChMAF] Extension context invalidated — страница работает со старым контент-скриптом. Помогут Ctrl+Shift+R или перезапуск браузера.');
        return true;
    }

    window.addEventListener('unhandledrejection', (e) => {
        if (handleContextError(e.reason)) e.preventDefault();
    });

    window.addEventListener('error', (e) => {
        handleContextError(e.error || e.message);
    });

    // Большинство вызовов chrome.* в расширении обёрнуты try/catch и
    // логируют ошибку через console.error — перехватываем и этот путь.
    const origConsoleError = console.error;
    console.error = function (...args) {
        try { handleContextError(args[0]); } catch { }
        origConsoleError.apply(console, args);
    };
})();


window.addEventListener('message', (e) => {
    if (e.origin !== window.location.origin) return;
    const d = e.data;
    if (!d || d.source !== 'chmaf-mms' || d.action !== 'fetch') return;
    chrome.runtime.sendMessage(
        { action: 'getFetchRequest', fetchURL: d.fetchURL, requestOptions: d.requestOptions },
        (resp) => {
            let ok = false, body = null, error = 'bg недоступен';
            if (chrome.runtime.lastError) error = chrome.runtime.lastError.message;
            else if (resp?.success) { ok = true; body = resp.fetchansver; }
            else if (resp?.error) error = resp.error;
            try {
                window.postMessage({ source: 'chmaf-mms', action: 'fetchResult', id: d.id, ok, body, error }, window.location.origin);
            } catch { }
        }
    );
}, { signal: cleanupRegistry.signal });

function notify(msg) { window.showCustomAlert?.(msg); }
window.notify = notify;

function hideWindowOnDoubleClick(id) {
    if (localStorage.getItem('dblhidewindow') !== '0') return;
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('dblclick', (a) => {
        if (a.target.closest('.chmaf-drag-handle')) el.style.display = 'none';
    }, { signal: cleanupRegistry.signal });
}

function hideWindowOnClick(wId, bId) {
    const w = document.getElementById(wId);
    const b = document.getElementById(bId);
    if (b && w) b.addEventListener('click', () => { w.style.display = 'none'; }, { signal: cleanupRegistry.signal });
}

async function copyToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        try { return await navigator.clipboard.writeText(text); } catch { }
    }
    const t = document.createElement('textarea');
    t.value = text;
    t.style.cssText = 'position:fixed;left:-9999px;opacity:0;';
    document.body.appendChild(t);
    t.select();
    try { document.execCommand('copy'); } finally { t.remove(); }
}

function extractLoginLink(text) {
    if (typeof text !== 'string') return null;
    // ⚡ экранированы точки
    const regex = /https:\/\/id\.skyeng\.ru\/auth\/login-link\/[A-Za-z0-9_\-/]+/g;
    const matches = text.match(regex);
    return matches?.[matches.length - 1]?.replace(/["']+$/, '') || null;
}

// ⚡ С ТАЙМАУТОМ (раньше Promise висел вечно)
function getLoginLink(userid, timeoutMs = 20_000) {
    return new Promise((resolve, reject) => {
        if (!userid) return reject(new Error('Пустой userId'));
        const timer = setTimeout(() => reject(new Error('Timeout getLoginLink')), timeoutMs);
        const body = new URLSearchParams({
            'login_link_form[id]': userid,
            'login_link_form[target]': 'https://vimbox.skyeng.ru',
            'login_link_form[lifetime]': '3600',
            'login_link_form[create]': ''
        }).toString();
        try {
            chrome.runtime.sendMessage({
                action: 'getFetchRequest',
                fetchURL: 'https://id.skyeng.ru/admin/auth/login-links',
                requestOptions: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body, credentials: 'include'
                }
            }, async (response) => {
                clearTimeout(timer);
                if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
                if (!response?.success) return reject(new Error(response?.error || 'Неизвестная ошибка'));
                const link = extractLoginLink(response.fetchAnswer || response.fetchansver);
                if (!link) return reject(new Error('Ссылка логинера не найдена'));
                try { await copyToClipboard(link); resolve(true); }
                catch (err) { reject(err); }
            });
        } catch (e) { clearTimeout(timer); reject(e); }
    });
}

function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const ALLOWED_TAGS = new Set(['P', 'BR', 'B', 'I', 'U', 'EM', 'STRONG', 'A', 'UL', 'OL', 'LI', 'SPAN', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'CODE', 'PRE', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH']);
    const ALLOWED_ATTRS = new Set(['href', 'title', 'class', 'id', 'target', 'rel']);
    function walk(node) {
        for (const child of [...node.childNodes]) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                if (!ALLOWED_TAGS.has(child.tagName)) {
                    child.replaceWith(document.createTextNode(child.textContent || ''));
                    continue;
                }
                for (const attr of [...child.attributes]) {
                    if (!ALLOWED_ATTRS.has(attr.name)) child.removeAttribute(attr.name);
                }
                if (child.tagName === 'A') {
                    child.setAttribute('rel', 'noopener noreferrer');
                    const href = child.getAttribute('href') || '';
                    if (href.startsWith('javascript:') || href.startsWith('data:')) child.setAttribute('href', '#');
                }
                walk(child);
            } else if (child.nodeType === Node.COMMENT_NODE) child.remove();
        }
    }
    walk(doc.body);
    return doc.body.innerHTML;
}

function showToast(m, type) { window.showCustomAlert?.(m, type); }
window.showToast = showToast;