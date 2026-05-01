localStorage.removeItem('girlyanda');
localStorage.removeItem('snowcursor');
localStorage.removeItem('AF_elka');
localStorage.removeItem('AF_hat');
localStorage.removeItem('AF_bag');

function createWindow(id, topKey, leftKey, content) {
    const windowElement = document.createElement('div');
    document.body.append(windowElement);

    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    if (id === 'TestUsers') {
        windowElement.classList.add('onlyfortp', 'testuserwindow');
    } else if (id === 'AF_addChatMenu') {
        windowElement.classList.add('wintInitializeChat');
    } else {
        windowElement.classList.add('extwindows');
    }

    windowElement.style = `top: ${storedTop}px; left: ${storedLeft}px; display: none;`;
    if (id === 'AF_Timetable' || id === 'AF_Grabber' || id === 'AF_GrList' || id === 'AF_SpecCommWindow') {
        windowElement.style.zIndex = '1100000';
    }
    windowElement.setAttribute('id', id);
    windowElement.innerHTML = content;

    // ===== ФИКС: защита input/textarea от начала drag =====
    windowElement.addEventListener('mousedown', function (e) {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
            const el = e.target;
            if (el.selectionStart !== el.selectionEnd && !e.shiftKey) {
                e.preventDefault();
                requestAnimationFrame(() => {
                    const pos = getCaretPositionFromPoint(el, e.clientX, e.clientY);
                    el.focus();
                    el.setSelectionRange(pos, pos);
                });
            }
            e.stopPropagation();
        }
    });

    // ===== ОБРАБОТЧИК DRAG (оптимизированный) =====
    // Внутри функции createWindow
    windowElement.onmousedown = function (event) {
        if (checkelementtype(event)) {
            // Не даем выделять текст во время перетаскивания
            if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
                event.preventDefault();
            }

            let startX = event.clientX;
            let startY = event.clientY;

            // Начальные координаты из стилей или localStorage
            let initialLeft = parseInt(windowElement.style.left) || 0;
            let initialTop = parseInt(windowElement.style.top) || 0;

            let currentX = initialLeft;
            let currentY = initialTop;

            // Сохраняем текущий scale из transform, чтобы не потерять масштабирование
            const currentTransform = windowElement.style.transform || '';
            const scaleMatch = currentTransform.match(/scale\([^\)]+\)/);
            const savedScale = scaleMatch ? scaleMatch[0] : '';

            let rafId = null;

            function updatePosition() {
                const translate = `translate3d(${currentX - initialLeft}px, ${currentY - initialTop}px, 0)`;
                windowElement.style.transform = savedScale ? `${translate} ${savedScale}` : translate;
                rafId = requestAnimationFrame(updatePosition);
            }

            function onMouseMove(e) {
                currentX = initialLeft + (e.clientX - startX);
                currentY = initialTop + (e.clientY - startY);

                if (!rafId) {
                    rafId = requestAnimationFrame(updatePosition);
                }
            }

            function onMouseUp() {
                cancelAnimationFrame(rafId);
                rafId = null;

                // Только в самом конце применяем финальные координаты к top/left
                windowElement.style.left = currentX + 'px';
                windowElement.style.top = currentY + 'px';
                windowElement.style.transform = savedScale; // Восстанавливаем scale вместо сброса; // Сбрасываем трансформ

                // Сохраняем результат
                localStorage.setItem(leftKey, currentX);
                localStorage.setItem(topKey, currentY);

                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    };

    return windowElement;
}

function getCaretPositionFromPoint(element, x, y) {
    // Современный способ (Chrome, Firefox, Safari)
    if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos && pos.offsetNode === element) {
            return pos.offset;
        }
    }

    // Fallback для старых браузеров (WebKit/Blink)
    if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(x, y);
        if (range && range.startContainer === element.firstChild) {
            return range.startOffset;
        }
    }

    // Эвристика: если не удалось определить точную позицию,
    // используем selectionStart (начало выделения) как fallback
    return element.selectionStart;
}

// Функция для получения данных из хранилища
async function getStorageData(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
}

async function move_again_AF() { //с АФ шняга там стили шмили скрипта отображение отправку сообщений
    getText();
    let whoAmISuccess = await whoAmI();
    console.log(whoAmISuccess)
    while (!whoAmISuccess) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Ожидание секунду перед повторным вызовом
        whoAmISuccess = await whoAmI();
    }
    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']); // Получаем данные из хранилища
    // Присваиваем данные константам
    const KC_addr = data.KC_addr;
    const TP_addr = data.TP_addr;
    const KC_addrRzrv = data.KC_addrRzrv;
    const TP_addrRzrv = data.TP_addrRzrv;

    let sidePanel = document.createElement('div') // добавляем невидимую боковую панель, на которой будем размещать кнопки
    sidePanel.id = "rightPanel"
    sidePanel.style = 'position: fixed; top: 200px; right: 22px; z-index: 1000000; width: 40px; font-size: 22px; cursor: pointer; transition: all 0.5s ease;'
    document.body.append(sidePanel)

    let ScriptBut = document.createElement('button');
    ScriptBut.id = 'scriptBut';
    ScriptBut.innerHTML = "🧩";
    ScriptBut.classList.add('gpanneon-glass-btn')
    ScriptBut.onclick = function () {
        if (document.getElementById('AF_helper').style.display != 'flex') {
            document.getElementById('AF_helper').style.display = 'flex'
            this.classList.add('activeScriptBtn')
        } else {
            document.getElementById('AF_helper').style.display = 'none'
            this.classList.remove('activeScriptBtn')
        }

    }
    document.getElementById('rightPanel').appendChild(ScriptBut) // добавляем на панель кнопку для открытия окна с шаблонами

    let butThemes = document.createElement('button')
    butThemes.id = "themes"
    butThemes.innerHTML = "📚"
    butThemes.title = "[Темы] - кнопка открывающая окно с темами и тегами"
    butThemes.classList.add('gpanneon-glass-btn')
    document.getElementById('rightPanel').appendChild(butThemes)
    document.getElementById('themes').onclick = getThemesButtonPress;

    let MainMenuBtn = document.createElement('button')
    MainMenuBtn.textContent = "👺"
    MainMenuBtn.id = 'MainMenuBtn'
    MainMenuBtn.title = '[Меню] - По клику открывает список инструментов необходимых для работы'
    MainMenuBtn.classList.add('gpanneon-glass-btn')
    MainMenuBtn.onclick = function () {
        if (document.getElementById('idmymenu').style.display == 'none') {
            document.getElementById('idmymenu').style.display = ''
            this.classList.add('activeScriptBtn')
        } else {
            document.getElementById('idmymenu').style.display = 'none'
            this.classList.remove('activeScriptBtn')
        }
    }
    document.getElementById('rightPanel').appendChild(MainMenuBtn) // добавляем на панель кнопку Меню, которая содержит в себе при клики пункты подменю

    // 1. Конфигурация кнопок: ID, Текст, Функция, Только для ТП?
    const menuConfig = [
        { id: "JiraOpenForm", text: "🔎 Jira Search", fn: window.getJiraOpenFormPress, tp: true },
        { id: "crmopersstatuses", text: "🧮 Статусы CRM2", fn: window.getcrmopersstatusesButtonPress, tp: true },
        { id: "butMarks", text: "🎭 Оценки", fn: window.getbutMarksButtonPress, tp: false },
        { id: "smartroomform", text: "🦐 Smartroom", fn: window.getsmartroomformButtonPress, tp: true },
        { id: "butLessonInfo", text: "🎓 Lesson Info", fn: window.getbutLessonInfoButtonPress, tp: false },
        { id: "butFrozeChat", text: "❄ Auto Respond", fn: window.getbutFrozeChatButtonPress, tp: false },
        { id: "buttonGetStat", text: "📊 Статистика", fn: window.getbuttonGetStatButtonPress, tp: false },
        { id: "buttonGetQueue", text: "🚧 Очередь", fn: window.getQueuePress, tp: false }
    ];

    // 2. Создание контейнера
    let menubar = document.getElementById('idmymenu');
    if (!menubar) {
        menubar = document.createElement('div');
        menubar.id = 'idmymenu';
        document.getElementById('rightPanel').appendChild(menubar);
    }

    // Применяем классы
    menubar.className = `m-menu-panel menubarstyle`;
    menubar.style.display = 'none';

    // 3. Генерация кнопок
    const currentSection = (typeof opsection !== 'undefined' ? opsection : "").toString().trim();
    const isTP = currentSection === "ТП" || currentSection === "ТП ОС" || currentSection.startsWith("ТП");

    menubar.innerHTML = menuConfig
        .filter(item => !item.tp || (item.tp && isTP)) // Фильтруем кнопки для ТП
        .map(item => `<div id="${item.id}" class="m-menu-btn">${item.text}</div>`)
        .join('');

    // 4. Навешивание событий (через делегирование для экономии памяти)
    menubar.onclick = (e) => {
        const btn = e.target.closest('.m-menu-btn');
        if (!btn) return;

        const config = menuConfig.find(c => c.id === btn.id);
        if (config && typeof config.fn === 'function') {
            config.fn();
            // По желанию: скрывать меню после клика
            menubar.style.display = 'none';
        }
    };


    let openchhis = document.createElement('button')
    openchhis.innerHTML = '☢'
    openchhis.id = 'opennewcat'
    openchhis.title = 'Открывает виджет просмотра истории чатов'
    openchhis.classList.add('gpanneon-glass-btn')
    document.getElementById('rightPanel').appendChild(openchhis) // добавляем на панель кнопку открытия формы просмотра истории чата
    document.getElementById('opennewcat').onclick = getopennewcatButtonPress;

    if (scriptAdr != TP_addr && scriptAdr != TP_addrRzrv && localStorage.getItem('hideTaskWindow') == 1) {
        localStorage.setItem('hideTaskWindow', '0')
    }

    if (scriptAdr != TP_addr && scriptAdr != TP_addrRzrv) {
        prepKC()
    } else {
        prepTp()
    }

    if (scriptAdr == TP_addrRzrv || scriptAdr == KC_addrRzrv) {
        document.getElementById('pages').style.background = 'red'
        document.getElementById('pages').title = 'Включены резервные шаблоны, если в АФ нет сбоя в работе Баз знаний - переключи на обычные шаблоны'
        languageAF.addEventListener('click', function () {
            if (document.getElementById('pages').style.background != 'red') {
                document.getElementById('pages').style.background = 'red'
            }
        })
    }

    window.onkeydown = function (e) {
        if (e.key == 'Control') {
            bool = 1;
        }
    }
    window.onkeyup = function (e) {
        if (e.key == 'Control') {
            bool = 0;
        }
    }
    setInterval(checkchats, 1000);
}

// Проверяем текущий путь сразу при загрузке
if (window.location.pathname !== "/login") {
    setTimeout(move_again_AF, 3000);
} else {
    // Если изначально на /login, запускаем интервал для отслеживания перехода
    let previousPath = window.location.pathname;

    const checkURLChange = setInterval(() => {
        const currentPath = window.location.pathname;

        // Срабатываем при переходе с /login на любой другой путь
        if (previousPath === "/login" && currentPath !== "/login") {
            clearInterval(checkURLChange);
            setTimeout(move_again_AF, 3000);
        }

        previousPath = currentPath;
    }, 1000);
}

function closeTerms() { // функция автоподтверждения условий пользования при входе в ЛКП
    if (document.URL == 'https://new-teachers.skyeng.ru/') {
        for (let i = 0; i < document.getElementsByClassName('terms-popup-accept-button').length; i++) {
            document.getElementsByClassName('terms-popup-accept-button')[i].click()
        }
    }
}

// Переписал на современный Fetch (намного стабильнее и чище, чем XMLHttpRequest)
async function getText() {
    try {
        const response = await fetch(scriptAdr);
        if (response.ok) {
            const data = await response.json();

            // ВАЖНО: Убрали window.table. Оставляем просто присваивание к вашей переменной table
            table = data.result;

            refreshTemplates();
        } else {
            console.error('Ошибка при загрузке шаблонов:', response.status);
        }
    } catch (e) {
        console.error('Сетевая ошибка getText:', e);
    }
}



function showNotification(message) { // отображает уведомление за счет API браузера
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") {
        new Notification(message);
        return true;
    }

    if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }

    return false;
}

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS ALERT SYSTEM — Premium Toasts                     ║
 * ║              Glassmorphism · Auto-dismiss · Progress bar · Queue             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    //  CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════

    const CONFIG = {
        maxVisible: 4,           // Максимум одновременно видимых
        defaultDuration: 5000,   // Стандартное время показа (мс)
        longDuration: 8000,      // Для важных уведомлений
        position: 'top-right',   // top-left | top-right | bottom-left | bottom-right
        gap: 12                  // Отступ между тостами
    };

    let toastQueue = [];
    let activeToasts = [];
    let toastIdCounter = 0;

    // ═══════════════════════════════════════════════════════════════════════════
    //  STYLE SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════

    const injectStyles = () => {
        if (document.getElementById('chronos-alert-styles')) return;

        const style = document.createElement('style');
        style.id = 'chronos-alert-styles';
        style.innerHTML = `
            /* ─── Container ─── */
            .chronos-toast-container {
                position: fixed;
                z-index: 2147483647;
                display: flex;
                flex-direction: column;
                gap: ${CONFIG.gap}px;
                pointer-events: none;
                padding: 20px;
            }

            .chronos-toast-container.top-right {
                top: 0;
                right: 0;
                align-items: flex-end;
            }

            .chronos-toast-container.top-left {
                top: 0;
                left: 0;
                align-items: flex-start;
            }

            .chronos-toast-container.bottom-right {
                bottom: 0;
                right: 0;
                align-items: flex-end;
                flex-direction: column-reverse;
            }

            .chronos-toast-container.bottom-left {
                bottom: 0;
                left: 0;
                align-items: flex-start;
                flex-direction: column-reverse;
            }

            /* ─── Toast Base ─── */
            .chronos-toast {
                pointer-events: all;
                min-width: 320px;
                max-width: 420px;
                background: linear-gradient(135deg,
                    rgba(30, 33, 48, 0.95) 0%,
                    rgba(40, 43, 60, 0.98) 100%);
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                padding: 0;
                box-shadow:
                    0 20px 60px rgba(0, 0, 0, 0.4),
                    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
                    0 1px 0 rgba(255, 255, 255, 0.08) inset;
                font-family: 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
                color: #e2e8f0;
                overflow: hidden;
                position: relative;
                transform: translateX(120%);
                opacity: 0;
                animation: chronos-toast-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            .chronos-toast:hover {
                transform: translateX(0) scale(1.02) !important;
                box-shadow:
                    0 25px 70px rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
            }

            .chronos-toast.removing {
                animation: chronos-toast-out 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }

            /* ─── Accent Bar ─── */
            .chronos-toast::before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                bottom: 0;
                width: 4px;
                background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
                border-radius: 16px 0 0 16px;
            }

            .chronos-toast.success::before {
                background: linear-gradient(180deg, #00f2a0 0%, #00c853 100%);
            }

            .chronos-toast.warning::before {
                background: linear-gradient(180deg, #ffd600 0%, #ff9100 100%);
            }

            .chronos-toast.error::before {
                background: linear-gradient(180deg, #ff5252 0%, #d50000 100%);
            }

            .chronos-toast.info::before {
                background: linear-gradient(180deg, #7c4dff 0%, #448aff 100%);
            }

            /* ─── Content Layout ─── */
            .chronos-toast-content {
                display: flex;
                align-items: flex-start;
                gap: 14px;
                padding: 18px 20px 18px 24px;
            }

            .chronos-toast-icon {
                font-size: 22px;
                line-height: 1;
                flex-shrink: 0;
                margin-top: 2px;
                filter: drop-shadow(0 0 8px currentColor);
            }

            .chronos-toast-body {
                flex: 1;
                min-width: 0;
            }

            .chronos-toast-title {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 4px;
                letter-spacing: 0.3px;
            }

            .chronos-toast-message {
                font-size: 13px;
                line-height: 1.5;
                color: #94a3b8;
                word-wrap: break-word;
            }

            .chronos-toast-close {
                background: none;
                border: none;
                color: #64748b;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                transition: all 0.2s;
                flex-shrink: 0;
                margin-top: -2px;
                margin-right: -4px;
            }

            .chronos-toast-close:hover {
                background: rgba(255, 255, 255, 0.08);
                color: #e2e8f0;
            }

            /* ─── Progress Bar ─── */
            .chronos-toast-progress {
                position: absolute;
                bottom: 0;
                left: 4px;
                right: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.03);
                overflow: hidden;
            }

            .chronos-toast-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #4facfe, #00f2fe);
                border-radius: 0 0 16px 0;
                transform-origin: left;
                animation: chronos-progress linear forwards;
            }

            .chronos-toast.success .chronos-toast-progress-bar {
                background: linear-gradient(90deg, #00f2a0, #00c853);
            }

            .chronos-toast.warning .chronos-toast-progress-bar {
                background: linear-gradient(90deg, #ffd600, #ff9100);
            }

            .chronos-toast.error .chronos-toast-progress-bar {
                background: linear-gradient(90deg, #ff5252, #d50000);
            }

            .chronos-toast.info .chronos-toast-progress-bar {
                background: linear-gradient(90deg, #7c4dff, #448aff);
            }

            /* ─── Action Button ─── */
            .chronos-toast-actions {
                display: flex;
                gap: 8px;
                margin-top: 12px;
            }

            .chronos-toast-btn {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #cbd5e1;
                padding: 6px 14px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
                font-family: inherit;
            }

            .chronos-toast-btn:hover {
                background: rgba(255, 255, 255, 0.12);
                border-color: rgba(255, 255, 255, 0.2);
                transform: translateY(-1px);
            }

            .chronos-toast-btn.primary {
                background: linear-gradient(135deg, rgba(79, 172, 254, 0.2), rgba(0, 242, 254, 0.15));
                border-color: rgba(79, 172, 254, 0.3);
                color: #e0f2fe;
            }

            .chronos-toast-btn.primary:hover {
                background: linear-gradient(135deg, rgba(79, 172, 254, 0.3), rgba(0, 242, 254, 0.25));
            }

            /* ─── Animations ─── */
            @keyframes chronos-toast-in {
                from {
                    transform: translateX(120%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes chronos-toast-out {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(120%);
                    opacity: 0;
                }
            }

            @keyframes chronos-progress {
                from { transform: scaleX(1); }
                to { transform: scaleX(0); }
            }

            @keyframes chronos-pulse-glow {
                0%, 100% { box-shadow: 0 0 20px rgba(79, 172, 254, 0.1); }
                50% { box-shadow: 0 0 40px rgba(79, 172, 254, 0.2); }
            }

            .chronos-toast.urgent {
                animation:
                    chronos-toast-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards,
                    chronos-pulse-glow 2s ease-in-out infinite;
            }

            /* ─── Mobile ─── */
            @media (max-width: 480px) {
                .chronos-toast-container {
                    left: 10px !important;
                    right: 10px !important;
                    padding: 10px;
                }
                .chronos-toast {
                    min-width: auto;
                    max-width: 100%;
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(style);
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  ICONS MAP
    // ═══════════════════════════════════════════════════════════════════════════

    const ICONS = {
        success: '✓',
        warning: '⚠',
        error: '✕',
        info: 'ℹ',
        alarm: '⏰',
        message: '💬',
        busy: '🔴',
        default: '●'
    };

    const TITLES = {
        success: 'Успешно',
        warning: 'Внимание',
        error: 'Ошибка',
        info: 'Информация',
        alarm: 'Будильник',
        message: 'Сообщение',
        busy: 'Статус',
        default: 'Уведомление'
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  CORE FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════

    const getContainer = () => {
        let container = document.getElementById('chronos-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'chronos-toast-container';
            container.className = `chronos-toast-container ${CONFIG.position}`;
            document.body.appendChild(container);
        }
        return container;
    };

    const removeToast = (toastId) => {
        const index = activeToasts.findIndex(t => t.id === toastId);
        if (index === -1) return;

        const toast = activeToasts[index];
        const el = toast.element;

        // Clear timers
        if (toast.timer) clearTimeout(toast.timer);
        if (toast.progressTimer) clearTimeout(toast.progressTimer);

        // Animate out
        el.classList.add('removing');

        setTimeout(() => {
            if (el.parentNode) el.remove();
            activeToasts.splice(index, 1);
            processQueue();
        }, 400);
    };

    const processQueue = () => {
        if (toastQueue.length === 0) return;
        if (activeToasts.length >= CONFIG.maxVisible) return;

        const next = toastQueue.shift();
        createToastElement(next);
    };

    const createToastElement = (options) => {
        const id = ++toastIdCounter;
        const container = getContainer();

        const type = options.type || 'default';
        const icon = options.icon || ICONS[type] || ICONS.default;
        const title = options.title || TITLES[type] || TITLES.default;
        const duration = options.duration || (type === 'error' || type === 'alarm' ? CONFIG.longDuration : CONFIG.defaultDuration);
        const isUrgent = options.urgent || type === 'error' || type === 'alarm';

        // Create element
        const toast = document.createElement('div');
        toast.className = `chronos-toast ${type}${isUrgent ? ' urgent' : ''}`;
        toast.id = `chronos-toast-${id}`;

        // Build content
        let actionsHtml = '';
        if (options.actions && options.actions.length > 0) {
            const buttons = options.actions.map((action, i) =>
                `<button class="chronos-toast-btn ${action.primary ? 'primary' : ''}" data-action="${i}">${action.label}</button>`
            ).join('');
            actionsHtml = `<div class="chronos-toast-actions">${buttons}</div>`;
        }

        toast.innerHTML = `
            <div class="chronos-toast-content">
                <span class="chronos-toast-icon">${icon}</span>
                <div class="chronos-toast-body">
                    <div class="chronos-toast-title">${title}</div>
                    <div class="chronos-toast-message">${options.message}</div>
                    ${actionsHtml}
                </div>
                <button class="chronos-toast-close" title="Закрыть">×</button>
            </div>
            <div class="chronos-toast-progress">
                <div class="chronos-toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
            </div>
        `;

        // Close button
        const closeBtn = toast.querySelector('.chronos-toast-close');
        closeBtn.onclick = () => removeToast(id);

        // Action buttons
        if (options.actions) {
            toast.querySelectorAll('.chronos-toast-btn').forEach((btn, idx) => {
                btn.onclick = () => {
                    const action = options.actions[idx];
                    if (action.callback) action.callback();
                    if (action.close !== false) removeToast(id);
                };
            });
        }

        // Pause on hover
        let remainingTime = duration;
        let startTime = Date.now();
        let timer = null;

        const startTimer = () => {
            startTime = Date.now();
            timer = setTimeout(() => removeToast(id), remainingTime);
        };

        toast.addEventListener('mouseenter', () => {
            if (timer) {
                clearTimeout(timer);
                remainingTime -= Date.now() - startTime;
            }
            const progressBar = toast.querySelector('.chronos-toast-progress-bar');
            if (progressBar) progressBar.style.animationPlayState = 'paused';
        });

        toast.addEventListener('mouseleave', () => {
            startTimer();
            const progressBar = toast.querySelector('.chronos-toast-progress-bar');
            if (progressBar) progressBar.style.animationPlayState = 'running';
        });

        // Add to DOM and tracking
        container.appendChild(toast);
        startTimer();

        const toastObj = { id, element: toast, timer };
        activeToasts.push(toastObj);

        return toastObj;
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    window.showCustomAlert = (message, type = 'default', options = {}) => {
        // Backward compatibility: if second arg is number (old behavior)
        if (typeof type === 'number') {
            type = type === 1 ? 'alarm' : 'default';
        }

        injectStyles();

        const toastOptions = {
            message,
            type,
            ...options
        };

        if (activeToasts.length >= CONFIG.maxVisible) {
            toastQueue.push(toastOptions);
        } else {
            createToastElement(toastOptions);
        }
    };

    // Convenience methods
    window.showSuccess = (message, options) => showCustomAlert(message, 'success', options);
    window.showError = (message, options) => showCustomAlert(message, 'error', options);
    window.showWarning = (message, options) => showCustomAlert(message, 'warning', options);
    window.showInfo = (message, options) => showCustomAlert(message, 'info', options);
    window.showAlarm = (message, options) => showCustomAlert(message, 'alarm', { urgent: true, ...options });

    console.log('[Chronos Alert] Premium Toast System loaded ✨');

})();

function notify(message, { useBrowser = true } = {}) { // Функция отправки уведомления в зависимости включен запрет в настройках или нет
    const browserAllowed = localStorage.getItem('brnotificatios') === '0';

    if (useBrowser && browserAllowed) {
        const shown = showNotification(message);
        if (shown) return;
    }

    showCustomAlert(message);
}

// Функции скрытия окна
function hideWindowOnDoubleClick(id) { // Функция для скрытия окна по двойному клику
    if (localStorage.getItem('dblhidewindow') == '0') {
        const windowElement = document.getElementById(id);
        windowElement.ondblclick = function (a) {
            if (checkelementtype(a)) {
                setDisplayStyle(windowElement, 'none');
            }
        };
    }
}

function hideWindowOnClick(windowId, buttonId) { // Функция для скрытия окна по клику на кнопку
    const windowElement = document.getElementById(windowId);
    const buttonElement = document.getElementById(buttonId);

    buttonElement.onclick = function () {
        setDisplayStyle(windowElement, 'none');
    };
}

function prepTp() {
    // Кэшируем часто используемые элементы
    const rightPanel = document.getElementById('rightPanel');
    const AF_Service = document.getElementById('AF_Service');

    // Фабрика для создания кнопок
    const createButton = ({ id, innerHTML, title, classes, onClick }) => {
        const button = document.createElement('button');
        button.id = id;
        button.innerHTML = innerHTML;
        button.title = title || '';
        button.className = ['onlyfortp', 'gpanneon-glass-btn'].concat(classes || []).join(' ');
        button.onclick = onClick;
        return button;
    };

    // Создаем кнопки через фабрику
    const buttons = [
        createButton({
            id: 'datsyCalendar',
            innerHTML: '📅',
            title: 'Открывает календарь Datsy',
            onClick: getdatsyCalendarButtonPress
        }),
        createButton({
            id: 'butServ',
            innerHTML: '⚜',
            onClick: function () {
                const isVisible = AF_Service.style.display !== 'none';
                AF_Service.style.display = isVisible ? 'none' : '';
                this.classList.toggle('activeScriptBtn', !isVisible);
            }
        }),
        createButton({
            id: 'knowledgeCenter',
            innerHTML: '💡',
            title: 'Открывает базу знаний решений неполадок',
            onClick: getknowledgeCenterButtonPress
        }),
        createButton({
            id: 'taskBut',
            innerHTML: '🛠',
            onClick: gettaskButButtonPress
        })
    ];

    // Добавляем все кнопки за один раз
    rightPanel.append(...buttons);

    // Отложенная инициализация
    setTimeout(() => rightPanel.appendChild(maskBack), 5000);

    // Таймеры
    flagLangBut = 1;
    setInterval(timerHideButtons, 500);

    // Обработка страницы логов
    if (location.pathname.split('/')[1] === "logs") {
        const emptyElement = document.querySelector('.ant-empty-description');
        if (emptyElement?.textContent === "Нет данных") {
            const parent = document.querySelector('.ant-table-title > div');
            if (!parent) return;

            const btnOpenInChatHis = createButton({
                innerHTML: '☢️',
                onClick: () => {
                    const chatHis = document.getElementById('AF_ChatHis');
                    if (chatHis.style.display === 'none') {
                        document.getElementById('opennewcat')?.click();
                    }
                    document.getElementById('hashchathis').value = location.pathname.split('/')[2];
                    btn_search_history.click();
                }
            });

            btnOpenInChatHis.style.cssText = 'width:30px; height:30px; margin-left:5px; font-size:16px; cursor:pointer';

            // Безопасная вставка кнопки
            if (parent.children.length >= 3) {
                parent.insertBefore(btnOpenInChatHis, parent.children[3]);
            }
        }
    }
}

function prepKC() { //функция подготовки расширения КЦ
    const languageSwitcher = document.querySelector('.user_menu-language_switcher');

    setDisplayStyle(languageSwitcher, localStorage.getItem('disablelngpmwindow') === '1' ? 'none' : '');

    let needtohide = Array.from(document.getElementsByClassName('onlyfortp'));
    needtohide.forEach(e => setDisplayStyle(e, 'none'));

    let needtoopen = Array.from(document.getElementsByClassName('onlyforkc'));
    needtoopen.forEach(e => setDisplayStyle(e, ''));

    flagLangBut = 1
}

// Функция копирования в буфер обмена
// Вспомогательная функция для надёжного копирования в content script

// Вспомогательная функция для надёжного копирования в content script
function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);

            const success = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (success) {
                resolve();
            } else {
                reject(new Error('execCommand("copy") failed'));
            }
        } catch (err) {
            reject(err);
        }
    });
}

function getLoginLink(userid) {
    return new Promise((resolve, reject) => {
        if (!userid) {
            return reject(new Error("Пустой userId"));
        }

        const fetchURL = 'https://id.skyeng.ru/admin/auth/login-links';

        const body =
            `login_link_form%5Bid%5D=${encodeURIComponent(userid)}` +
            `&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru` +
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

                // ЗАМЕНА: вместо navigator.clipboard используем надёжный execCommand
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

// Вспомогательная функция для надёжного копирования в content script
setInterval(closeTerms, 500);