localStorage.removeItem('girlyanda');
localStorage.removeItem('snowcursor');
localStorage.removeItem('AF_elka');
localStorage.removeItem('AF_hat');
localStorage.removeItem('AF_bag');

// ═══════════════════════════════════════════════════════════════
// КОНФИГУРАЦИЯ МЕНЮ МОДУЛЕЙ
// ═══════════════════════════════════════════════════════════════
const MODULE_MENU_CONFIG = [
    { id: 'JiraOpenForm',           text: '🔎 Jira Search',   fn: () => window.getJiraOpenFormPress?.(),         tp: true },
    { id: 'crmopersstatuses',       text: '🧮 Статусы CRM2',  fn: () => window.getcrmopersstatusesButtonPress?.(), tp: true },
    { id: 'butMarks',               text: '🎭 Оценки',        fn: () => window.getbutMarksButtonPress?.(),       tp: false },
    { id: 'smartroomform',          text: '🦐 Smartroom',     fn: () => window.getsmartroomformButtonPress?.(),  tp: true },
    { id: 'butLessonInfo',          text: '🎓 Lesson Info',   fn: () => window.getbutLessonInfoButtonPress?.(),  tp: false },
    { id: 'butFrozeChat',           text: '❄ Auto Respond',   fn: () => window.getbutFrozeChatButtonPress?.(),   tp: false },
    { id: 'buttonGetStat',          text: '📊 Статистика',    fn: () => window.getbuttonGetStatButtonPress?.(),  tp: false },
    { id: 'buttonTimetable',        text: '⏱️ Timetable',     fn: () => window.getbutTimetableButtonPress?.(),   tp: false },
    { id: 'buttonCheckCRMComments', text: '🛄 CRM Task',      fn: () => window.getbutCRMCommentsButtonPress?.(), tp: true },
    { id: 'butMattermost',          text: '🔍 Mattermost',    fn: () => {
        if (typeof window.getMattermostSearchPress === 'function') {
            window.getMattermostSearchPress();
        } else {
            createAndShowButton('⚠️ Модуль Mattermost не загружен. Перезагрузите расширение.', 'warning');
        }
    }, tp: false },
	    { id: 'buttonGetQueue',         text: '🚧 Очередь',       fn: () => window.getQueuePress?.(), tp: false }
];

// ═══════════════════════════════════════════════════════════════
// УТИЛИТЫ ДЛЯ DOM И ПЕРЕТАСКИВАНИЯ
// ═══════════════════════════════════════════════════════════════

function checkelementtype(a) {
    let elem = a.target;
    if (!elem) return false;
    const interactive = elem.closest('input, textarea, select, button, a, [onclick], [contenteditable="true"]');
    if (interactive) return false;
    if (elem.closest('[class*="btn"], [class*="Button"], [class*="clickable"]')) return false;
    let current = elem;
    while (current && current !== a.currentTarget) {
        if (current.onclick || current.onmousedown) return false;
        current = current.parentElement;
    }
    return true;
}

function enableDrag(element, options = {}) {
    const {
        handle = null,
        storageKey = null,
        savePosition = true,
        snapToEdges = true,
        snapGrid = 0,
        snapThreshold = 18,
        onDragStart = null,
        onDragEnd = null
    } = options;

    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    const handleSelector = handle || '.chmaf-drag-handle';

    const isInteractive = (el) => {
        if (!el) return false;
        return !!el.closest('input, select, textarea, [contenteditable="true"], button, a');
    };
    const isDragHandle = (target) => {
        if (!handleSelector) return element.contains(target);
        if (typeof handleSelector === 'string') {
            return target.closest(handleSelector) !== null || target.matches(handleSelector);
        }
        return handleSelector.contains(target) || target === handleSelector;
    };

    if (storageKey && savePosition) {
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const pos = JSON.parse(raw);
                element.style.left = pos.x + 'px';
                element.style.top = pos.y + 'px';
                element.style.right = 'auto';
            }
        } catch (e) { /* ignore */ }
    }

    function applySnap(x, y, isFinal) {
        let nx = x, ny = y;
        if (snapToEdges) {
            const vw = window.innerWidth, vh = window.innerHeight;
            const rect = element.getBoundingClientRect();
            const w = rect.width, h = rect.height;
            if (Math.abs(nx) < snapThreshold) nx = 0;
            else if (Math.abs(nx + w - vw) < snapThreshold) nx = vw - w;
            if (Math.abs(ny) < snapThreshold) ny = 0;
            else if (Math.abs(ny + h - vh) < snapThreshold) ny = vh - h;
            if (Math.abs(ny + h / 2 - vh / 2) < snapThreshold / 2) ny = vh / 2 - h / 2;
        }
        if (snapGrid > 0 && isFinal) {
            nx = Math.round(nx / snapGrid) * snapGrid;
            ny = Math.round(ny / snapGrid) * snapGrid;
        }
        return { x: nx, y: ny };
    }

    const onMouseDown = (e) => {
        if (e.button !== 0) return;
        if (!isDragHandle(e.target)) return;
        if (isInteractive(e.target)) return;
        isDragging = true;
        const rect = element.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        element.style.transition = 'none';
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        onDragStart?.();
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        let x = e.clientX - offsetX;
        let y = e.clientY - offsetY;
        const snapped = applySnap(x, y, false);
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
        const final = applySnap(rect.left, rect.top, true);
        element.style.left = final.x + 'px';
        element.style.top = final.y + 'px';
        if (storageKey && savePosition) {
            try { localStorage.setItem(storageKey, JSON.stringify(final)); } catch (e) {}
        }
        onDragEnd?.(final);
    };

    element.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
        element.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
}

function createWindow(id, topKey, leftKey, content) {
    const windowElement = document.createElement('div');
    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    if (id === 'TestUsers') {
        windowElement.classList.add('onlyfortp', 'testuserwindow');
    } else if (id === 'AF_addChatMenu') {
        windowElement.classList.add('wintInitializeChat');
    } else {
        windowElement.classList.add('extwindows');
    }

    windowElement.style.position = 'fixed';
    windowElement.style.top = storedTop + 'px';
    windowElement.style.left = storedLeft + 'px';
    windowElement.style.display = 'none';

    if (['AF_Timetable', 'AF_Grabber', 'AF_GrList', 'AF_SpecCommWindow'].includes(id)) {
        windowElement.style.zIndex = '1100000';
    }

    windowElement.id = id;
    windowElement.innerHTML = content;
    document.body.append(windowElement);

    requestAnimationFrame(() => {
        const w = windowElement.offsetWidth;
        const h = windowElement.offsetHeight;
        if (!w || !h) return;
        const top = parseFloat(windowElement.style.top) || 0;
        const left = parseFloat(windowElement.style.left) || 0;
        const maxTop = Math.max(0, window.innerHeight - h);
        const maxLeft = Math.max(0, window.innerWidth - w);
        const fixedTop = Math.min(Math.max(top, 0), maxTop);
        const fixedLeft = Math.min(Math.max(left, 0), maxLeft);
        if (fixedTop !== top || fixedLeft !== left) {
            windowElement.style.top = fixedTop + 'px';
            windowElement.style.left = fixedLeft + 'px';
        }
    });

    enableDrag(windowElement, {
        handle: '.chmaf-drag-handle',
        storageKey: `drag_pos_${id}`,
        savePosition: true,
        snapToEdges: true,
        snapGrid: 8,
        onDragEnd: (pos) => {
            localStorage.setItem(topKey, String(pos.y));
            localStorage.setItem(leftKey, String(pos.x));
        }
    });

    setTimeout(() => {
        const inputs = windowElement.querySelectorAll('input:not([type="button"]):not([type="submit"]), textarea');
        inputs.forEach(input => {
            let lastClickTime = 0;
            input.addEventListener('mousedown', function (e) {
                e.stopPropagation();
                const now = Date.now();
                const isDoubleClick = (now - lastClickTime) < 400;
                lastClickTime = now;
                if (isDoubleClick) return;
                const hasSelection = this.selectionStart !== this.selectionEnd;
                if (hasSelection && e.detail === 1) {
                    const pos = getCaretPositionFromPoint(this, e.clientX, e.clientY);
                    this.setSelectionRange(pos, pos);
                }
            });
        });
    }, 100);

    return windowElement;
}

function getCaretPositionFromPoint(element, x, y) {
    if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos && pos.offsetNode === element) return pos.offset;
    }
    if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(x, y);
        if (range && range.startContainer === element) return range.startOffset;
    }
    return element.selectionStart;
}

async function getStorageData(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => resolve(result));
    });
}

// ═══════════════════════════════════════════════════════════════
// FAB-СИСТЕМА (стили + создание кнопок)
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
            z-index: 1000000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
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
        @keyframes fab-slide-in {
            from { opacity: 0; transform: translateX(100px) scale(0.8); }
            to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .fab-premium {
            animation: fab-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }
        .fab-premium:nth-child(1) { animation-delay: 0.05s; }
        .fab-premium:nth-child(2) { animation-delay: 0.1s; }
        .fab-premium:nth-child(3) { animation-delay: 0.15s; }
        .fab-premium:nth-child(4) { animation-delay: 0.2s; }
        .fab-premium:nth-child(5) { animation-delay: 0.25s; }
        .fab-premium:nth-child(6) { animation-delay: 0.3s; }
        .fab-premium:nth-child(7) { animation-delay: 0.35s; }
        .fab-premium:nth-child(8) { animation-delay: 0.4s; }
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
    btn.onclick = onClick;
    return btn;
}

// ═══════════════════════════════════════════════════════════════
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ИНИЦИАЛИЗАЦИИ
// ═══════════════════════════════════════════════════════════════

let checkchatsIntervalId = null;
let timerHideButtonsIntervalId = null;

async function waitForOperator(maxMs = 60_000) {
    const start = Date.now();
    let ok = await whoAmI();
    while (!ok && Date.now() - start < maxMs) {
        await new Promise(r => setTimeout(r, 1000));
        ok = await whoAmI();
    }
    if (!ok) console.error('[ChMAF] Не удалось идентифицировать оператора за', maxMs, 'мс');
    return ok;
}

async function migrateScriptAddresses() {
    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']);
    const known = [data.KC_addr, data.TP_addr, data.KC_addrRzrv, data.TP_addrRzrv].filter(Boolean);
    if (!known.includes(scriptAdr)) {
        scriptAdr = (localStorage.getItem('tpflag') === 'ТП' ? data.TP_addr : data.KC_addr) || DEFAULT_SCRIPT_ADR;
        localStorage.setItem('scriptAdr', scriptAdr);
        console.warn('[ChMAF] Адрес шаблонов устарел — сброшен на актуальный:', scriptAdr);
    }
    return data;
}

function buildSidePanel() {
    document.getElementById('rightPanel')?.remove();
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
    if (!menubar) {
        menubar = document.createElement('div');
        menubar.id = 'idmymenu';
        panel.appendChild(menubar);
    }
    menubar.className = 'm-menu-panel menubarstyle';
    menubar.style.display = 'none';

    menubar.innerHTML = MODULE_MENU_CONFIG
        .filter(item => !item.tp || isTP)
        .map(item => `<div id="${item.id}" class="m-menu-btn">${item.text}</div>`)
        .join('');

    menubar.onclick = (e) => {
        const btn = e.target.closest('.m-menu-btn');
        if (!btn) return;
        MODULE_MENU_CONFIG.find(c => c.id === btn.id)?.fn?.();
        menubar.style.display = 'none';
        document.getElementById('MainMenuBtn')?.classList.remove('active');
    };
}

function setupDepartment(data) {
    const isKC = scriptAdr !== data.TP_addr && scriptAdr !== data.TP_addrRzrv;
    if (isKC && localStorage.getItem('hideTaskWindow') === '1') {
        localStorage.setItem('hideTaskWindow', '0');
    }
    isKC ? prepKC() : prepTp();
}

function startBackgroundTasks() {
    if (!window.__chmafCtrlKeysBound) {
        window.__chmafCtrlKeysBound = true;
        window.addEventListener('keydown', (e) => { if (e.key === 'Control') bool = 1; });
        window.addEventListener('keyup', (e) => { if (e.key === 'Control') bool = 0; });
    }
    if (checkchatsIntervalId) clearInterval(checkchatsIntervalId);
    checkchatsIntervalId = setInterval(checkchats, 1000);
}

// ═══════════════════════════════════════════════════════════════
// ГЛАВНЫЙ ОРКЕСТРАТОР
// ═══════════════════════════════════════════════════════════════

async function move_again_AF() {
    if (!(await waitForOperator())) return;

    const data = await migrateScriptAddresses();
    getText();

    const isTP = (opsection || '').toString().trim().startsWith('ТП');
    const panel = buildSidePanel();

    addFabButton(panel, 'scriptBut', '🧩', 'Шаблоны', 'cyan', () => {
        const el = document.getElementById('AF_helper');
        if (!el) return createAndShowButton('Панель шаблонов ещё не построена — обновите страницу', 'warning');
        const isHidden = el.style.display === 'none';
        el.style.display = isHidden ? 'flex' : 'none';
        document.getElementById('scriptBut')?.classList.toggle('active', isHidden);
    });

    addFabButton(panel, 'themes', '📚', 'Темы', 'violet', getThemesButtonPress);

    addFabButton(panel, 'MainMenuBtn', '👺', 'Меню', 'rose', () => {
        const el = document.getElementById('idmymenu');
        if (!el) return;
        const isHidden = el.style.display === 'none';
        el.style.display = isHidden ? '' : 'none';
        document.getElementById('MainMenuBtn').classList.toggle('active', isHidden);
    });

    buildModuleMenu(panel, isTP);

    addFabButton(panel, 'opennewcat', '☢', 'История чатов', 'emerald', getopennewcatButtonPress);

    setupDepartment(data);
    startBackgroundTasks();
}

// ── Точка входа (ОДИН РАЗ) ──
if (window.location.pathname !== '/login') {
    setTimeout(move_again_AF, 3000);
} else {
    let lastPath = window.location.pathname;
    setInterval(() => {
        if (lastPath === '/login' && window.location.pathname !== '/login') {
            lastPath = window.location.pathname;
            setTimeout(move_again_AF, 3000);
        }
    }, 1000);
}

// ═══════════════════════════════════════════════════════════════
// ОТДЕЛ-СПЕЦИФИЧНЫЕ ФУНКЦИИ
// ═══════════════════════════════════════════════════════════════

function prepTp() {
    const p = document.getElementById('rightPanel');
    const create = (id, icon, title, theme, fn) => {
        const btn = createFAB({ id, icon, title, theme, onClick: fn });
        btn.classList.add('onlyfortp');
        p.appendChild(btn);
    };
    create('datsyCalendar', '📅', 'Datsy', 'amber', getdatsyCalendarButtonPress);
    create('butServ', '⚜', 'Сервисы', 'violet', function () {
        const s = document.getElementById('AF_Service');
        const v = s.style.display !== 'none';
        s.style.display = v ? 'none' : '';
        this.classList.toggle('active', !v);
    });
    create('knowledgeCenter', '💡', 'БЗ', 'orange', getknowledgeCenterButtonPress);
    create('taskBut', '🛠', 'Задачи', 'emerald', gettaskButButtonPress);
    if (!timerHideButtonsIntervalId) {
        timerHideButtonsIntervalId = setInterval(timerHideButtons, 500);
    }
}

function prepKC() {
    const l = document.querySelector('.user_menu-language_switcher');
    if (l) l.style.display = localStorage.getItem('disablelpmwindow') === '1' ? 'none' : '';
    document.querySelectorAll('.onlyfortp').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.onlyforkc').forEach(e => e.style.display = '');
}

// ═══════════════════════════════════════════════════════════════
// API И УТИЛИТЫ
// ═══════════════════════════════════════════════════════════════

async function fetchGasJson(url) {
    try {
        const r = await fetch(url);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return await r.json();
    } catch (e) {
        const ans = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url }, (resp) => {
                if (chrome.runtime.lastError || !resp || !resp.success) resolve(null);
                else resolve(resp.fetchansver);
            });
        });
        if (!ans) throw e;
        return JSON.parse(ans);
    }
}

async function getText() {
    try {
        const json = await fetchGasJson(scriptAdr);
        if (!json || !Array.isArray(json.result)) throw new Error('В ответе GAS нет массива result — проверь адрес деплоя: ' + scriptAdr);
        table = json.result;
        console.log(`[ChMAF] Шаблоны загружены: ${table.length} строк`);
        refreshTemplates();
    } catch (e) {
        console.error('[ChMAF] Не удалось загрузить шаблоны:', e);
    }
}

(function () {
    window.showCustomAlert = (msg, type = 'message') => {
        if (typeof showNotification === 'function') {
            showNotification(msg, type);
        } else if (typeof window.NotificationSystem?.showNotification === 'function') {
            window.NotificationSystem.showNotification(msg, type);
        } else {
            const t = document.createElement('div');
            t.style.cssText = 'position:fixed;top:20px;right:20px;background:rgba(20,20,35,0.95);color:#f1f5f9;padding:12px 18px;border-radius:12px;z-index:9999999;backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);box-shadow:0 8px 32px rgba(0,0,0,0.45);font-size:13px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;opacity:0;transform:translateY(10px);transition:all 0.3s cubic-bezier(0.16,1,0.3,1);';
            t.innerHTML = msg;
            document.body.appendChild(t);
            requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
            setTimeout(() => {
                t.style.opacity = '0';
                t.style.transform = 'translateY(10px)';
                setTimeout(() => t.remove(), 300);
            }, 4000);
        }
    };
})();

window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || d.source !== 'chmaf-mms' || d.action !== 'fetch') return;
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: d.fetchURL, requestOptions: d.requestOptions }, (resp) => {
        let ok = false, body = null, error = 'bg недоступен';
        if (chrome.runtime.lastError) error = chrome.runtime.lastError.message;
        else if (resp && resp.success) { ok = true; body = resp.fetchansver; }
        else if (resp && resp.error) error = resp.error;
        try {
            window.postMessage({ source: 'chmaf-mms', action: 'fetchResult', id: d.id, ok, body, error }, '*');
        } catch (e) { /* страница ушла */ }
    });
});

function notify(msg) { showCustomAlert(msg); }

function hideWindowOnDoubleClick(id) {
    if (localStorage.getItem('dblhidewindow') == '0') {
        const el = document.getElementById(id);
        el.ondblclick = (a) => {
            if (a.target.closest('.chmaf-drag-handle')) el.style.display = 'none';
        };
    }
}

function hideWindowOnClick(wId, bId) {
    const w = document.getElementById(wId);
    const b = document.getElementById(bId);
    if (b) b.onclick = () => w.style.display = 'none';
}

function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        try {
            const t = document.createElement('textarea');
            t.value = text;
            t.style.position = 'fixed';
            t.style.left = '-9999px';
            document.body.appendChild(t);
            t.select();
            const success = document.execCommand('copy');
            document.body.removeChild(t);
            if (success) {
                resolve();
            } else {
                reject(new Error('execCommand failed'));
            }
        } catch (err) {
            reject(err);
        }
    });
}

function extractLoginLink(text) {
    const regex = /https:\/\/id\.skyeng\.ru\/auth\/login-link\/\S+/g;
    const matches = text.match(regex);
    if (matches && matches.length) {
        return matches[matches.length - 1].replace(/["']+$/, '');
    }
    return null;
}

function getLoginLink(userid) {
    return new Promise((resolve, reject) => {
        if (!userid) {
            return reject(new Error("Пустой userId"));
        }
        const fetchURL = 'https://id.skyeng.ru/admin/auth/login-links';
        const body =
            `login_link_form%5Bid%5D=${encodeURIComponent(userid)}` +
            `&login_link_form%5Btarget%5D=https%3A%2F%2Fvimbox.skyeng.ru` +
            `&login_link_form%5Blifetime%5D=3600` +
            `&login_link_form%5Bcreate%5D=`;
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            credentials: 'include'
        };
        chrome.runtime.sendMessage(
            { action: 'getFetchRequest', fetchURL, requestOptions },
            (response) => {
                if (!response || response.success !== true) {
                    console.log('Ошибка при получении логинера: ', response?.error);
                    return reject(new Error(response?.error || "Неизвестная ошибка"));
                }
                const link = extractLoginLink(response.fetchAnswer || response.fetchansver);
                if (!link) {
                    console.log('Ссылка логинера не найдена');
                    return reject(new Error('Ссылка логинера не найдена'));
                }
                copyToClipboard(link)
                    .then(() => resolve(true))
                    .catch(err => {
                        console.log('Не удалось скопировать текст: ', err);
                        reject(err);
                    });
            }
        );
    });
}

function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    let sanitized = html;
    const dangerousTags = /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|select|meta|link|base|applet|style)\b[^>]*>/gi;
    sanitized = sanitized.replace(dangerousTags, '');
    const eventHandlers = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|\S+)/gi;
    sanitized = sanitized.replace(eventHandlers, '');
    const jsUri = /href\s*=\s*(?:"\s*javascript:[^"]*"|'\s*javascript:[^']*'|javascript:[^'"\s>]*)/gi;
    sanitized = sanitized.replace(jsUri, 'href="#"');
    const dataUri = /src\s*=\s*(?:"\s*data:[^"]*"|'\s*data:[^']*')/gi;
    sanitized = sanitized.replace(dataUri, 'src=""');
    return sanitized;
}

function showToast(m, type) { showCustomAlert(m, type); }