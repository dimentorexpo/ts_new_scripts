localStorage.removeItem('girlyanda');
localStorage.removeItem('snowcursor');
localStorage.removeItem('AF_elka');
localStorage.removeItem('AF_hat');
localStorage.removeItem('AF_bag');

function checkelementtype(a) {
    let elem = a.target;
    if (!elem) return false;

    // Проверка по тегам - если это интерактивный элемент, возвращаем false (не разрешаем перетаскивание)
    const interactive = elem.closest('input, textarea, select, button, a, [onclick], [contenteditable="true"]');
    if (interactive) return false;

    // Проверка по классам
    if (elem.closest('[class*="btn"], [class*="Button"], [class*="clickable"]')) return false;

    // Глубокая проверка на наличие обработчиков
    let current = elem;
    while (current && current !== a.currentTarget) {
        if (current.onclick || current.onmousedown) return false;
        current = current.parentElement;
    }

    return true; // Разрешаем перетаскивание
}

/**
 * Создает перетаскиваемое окно с гарантированной защитой инпутов.
 * Теперь используется принцип WHITELIST: перетаскивание работает ТОЛЬКО если 
 * кликнули по элементу с классом 'chmaf-drag-handle'.
 */
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

    windowElement.style.position = 'fixed';
    windowElement.style.top = storedTop + 'px';
    windowElement.style.left = storedLeft + 'px';
    windowElement.style.display = 'none';

    if (['AF_Timetable', 'AF_Grabber', 'AF_GrList', 'AF_SpecCommWindow'].includes(id)) {
        windowElement.style.zIndex = '1100000';
    }

    windowElement.id = id;
    windowElement.innerHTML = content;

    // Автокоррекция позиции
    requestAnimationFrame(() => {
        const rect = windowElement.getBoundingClientRect();
        if (rect.top < 0 || rect.left < 0 || rect.top > window.innerHeight - 50) {
            windowElement.style.top = '120px';
            windowElement.style.left = '295px';
        }
    });

    // === ОСНОВНАЯ ЛОГИКА ПЕРЕТАСКИВАНИЯ — простая, без transform, rAF и willChange ===
    windowElement.onmousedown = function (event) {
        // WHITELIST: тащим только за drag-handle
        const dragHandle = event.target.closest('.chmaf-drag-handle');
        if (!dragHandle) return;

        // Защита интерактивных элементов внутри окна — НЕ ТАЩИМ, если клик был на них
        if (event.target.closest('button, a, input, select, textarea, [contenteditable="true"]')) return;
        if (event.button !== 0) return;

        event.preventDefault();

        let startX = event.clientX;
        let startY = event.clientY;
        let elemLeft = windowElement.offsetLeft;
        let elemTop = windowElement.offsetTop;

        function onMouseMove(event) {
            let deltaX = event.clientX - startX;
            let deltaY = event.clientY - startY;

            let newLeft = elemLeft + deltaX;
            let newTop = elemTop + deltaY;

            // Ограничения по границам экрана
            if (newLeft < 0) {
                newLeft = 0;
            } else if (newLeft + windowElement.offsetWidth > window.innerWidth) {
                newLeft = window.innerWidth - windowElement.offsetWidth;
            }

            if (newTop < 0) {
                newTop = 0;
            } else if (newTop + windowElement.offsetHeight > window.innerHeight) {
                newTop = window.innerHeight - windowElement.offsetHeight;
            }

            windowElement.style.left = newLeft + 'px';
            windowElement.style.top = newTop + 'px';
        }

        function onMouseUp() {
            localStorage.setItem(topKey, String(windowElement.offsetTop));
            localStorage.setItem(leftKey, String(windowElement.offsetLeft));

            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('mouseleave', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mouseleave', onMouseUp);
    };

    // Фикс выделения: сбрасываем выделение при одиночном клике
    setTimeout(() => {
        const inputs = windowElement.querySelectorAll('input:not([type="button"]):not([type="submit"]), textarea');
        inputs.forEach(input => {
            let clickCount = 0;
            let clickTimer = null;
            let lastClickX = 0;
            let lastClickY = 0;

            input.addEventListener('mousedown', function(e) {
                e.stopPropagation(); // Блокируем перетаскивание окна

                lastClickX = e.clientX;
                lastClickY = e.clientY;
                clickCount++;
                clearTimeout(clickTimer);
                clickTimer = setTimeout(() => { clickCount = 0; }, 400);
            });

            input.addEventListener('click', function(e) {
                // Если это одиночный клик (не двойной/тройной) — сбрасываем выделение
                if (clickCount === 1) {
                    setTimeout(() => {
                        // Проверяем, есть ли выделение
                        if (this.selectionStart !== this.selectionEnd) {
                            // Используем нативный API браузера для точного определения позиции
                            let pos = null;

                            if (document.caretPositionFromPoint) {
                                const caretPos = document.caretPositionFromPoint(lastClickX, lastClickY);
                                if (caretPos && caretPos.offsetNode) {
                                    pos = caretPos.offset;
                                }
                            } else if (document.caretRangeFromPoint) {
                                const range = document.caretRangeFromPoint(lastClickX, lastClickY);
                                if (range) {
                                    pos = range.startOffset;
                                }
                            }

                            // Если нативный API не сработал, используем фокус
                            if (pos === null) {
                                this.focus();
                                return; // Пусть браузер сам разберётся
                            }

                            this.setSelectionRange(pos, pos);
                        }
                    }, 0);
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
    return element.selectionStart;
}

async function getStorageData(keys) {
    return new Promise((resolve) => {
        chrome.storage.local.get(keys, (result) => resolve(result));
    });
}

// ═══════════════════════════════════════════════════════════════
// PREMIUM FAB BUTTON SYSTEM — Инжект стилей + создание кнопок
// ═══════════════════════════════════════════════════════════════

function injectFABStyles() {
    if (document.getElementById('fab-premium-styles')) return;

    const style = document.createElement('style');
    style.id = 'fab-premium-styles';
    style.textContent = `
        /* FAB Container */
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

        /* Premium FAB Button */
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
                linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%),
                rgba(18, 18, 28, 0.85);
            backdrop-filter: blur(20px) saturate(150%);
            -webkit-backdrop-filter: blur(20px) saturate(150%);

            box-shadow:
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 0 0 1px rgba(255, 255, 255, 0.1),
                inset 0 1px 1px rgba(255, 255, 255, 0.15);

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

        /* Верхний блик */
        .fab-premium::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: radial-gradient(circle at 50% 20%, rgba(255,255,255,0.2) 0%, transparent 60%);
            pointer-events: none;
            opacity: 0.6;
        }

        /* Ripple эффект */
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

        /* Hover состояние */
        .fab-premium:hover {
            transform: scale(1.1) translateY(-2px);
            box-shadow:
                0 12px 48px rgba(0, 0, 0, 0.5),
                0 0 24px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.3),
                0 0 0 1px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.5),
                inset 0 1px 1px rgba(255, 255, 255, 0.2);
            color: #fff;
            text-shadow: 0 0 12px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.8);
        }

        /* Active состояние */
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
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(2.5); opacity: 0; }
        }

        /* Активная кнопка */
        .fab-premium.active {
            background:
                linear-gradient(145deg, hsla(var(--fab-color), var(--fab-sat), 50%, 0.2) 0%, hsla(var(--fab-color), var(--fab-sat), 30%, 0.1) 100%),
                rgba(18, 18, 28, 0.95);
            box-shadow:
                0 8px 32px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.3),
                0 0 0 2px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.6),
                inset 0 0 20px hsla(var(--fab-color), var(--fab-sat), var(--fab-light), 0.1);
        }

        /* Tooltip */
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

        /* Цветовые темы */
        .fab-premium[data-theme="cyan"] { --fab-color: 190; --fab-sat: 90%; --fab-light: 60%; }
        .fab-premium[data-theme="amber"] { --fab-color: 35; --fab-sat: 95%; --fab-light: 58%; }
        .fab-premium[data-theme="emerald"] { --fab-color: 150; --fab-sat: 80%; --fab-light: 55%; }
        .fab-premium[data-theme="rose"] { --fab-color: 340; --fab-sat: 90%; --fab-light: 65%; }
        .fab-premium[data-theme="violet"] { --fab-color: 265; --fab-sat: 90%; --fab-light: 68%; }
        .fab-premium[data-theme="orange"] { --fab-color: 25; --fab-sat: 95%; --fab-light: 60%; }

        /* Адаптив */
        @media (max-width: 768px) {
            .fab-premium {
                --fab-size: 38px;
                font-size: 16px;
            }
            #rightPanel {
                right: 12px;
                gap: 10px;
            }
        }

        /* Анимация появления */
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

    btn.innerHTML = `
        ${icon}
        <span class="fab-tooltip">${title}</span>
    `;

    btn.onclick = onClick;

    return btn;
}

async function move_again_AF() {
    getText();
    let whoAmISuccess = await whoAmI();
    while (!whoAmISuccess) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        whoAmISuccess = await whoAmI();
    }
    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']);

    // Инжектим стили
    injectFABStyles();

    // Создаем панель
    let sidePanel = document.createElement('div');
    sidePanel.id = "rightPanel";
    document.body.append(sidePanel);

    const createSideBtn = (id, icon, title, theme, onClick) => {
        const btn = createFAB({ id, icon, title, theme, onClick });
        sidePanel.appendChild(btn);
        return btn;
    };

    createSideBtn('scriptBut', '🧩', 'Шаблоны', 'cyan', () => {
        const el = document.getElementById('AF_helper');
        const isHidden = el.style.display === 'none';
        el.style.display = isHidden ? 'flex' : 'none';
        document.getElementById('scriptBut').classList.toggle('active', isHidden);
    });

    createSideBtn('themes', '📚', 'Темы', 'violet', getThemesButtonPress);

    createSideBtn('MainMenuBtn', '👺', 'Меню', 'rose', () => {
        const el = document.getElementById('idmymenu');
        const isHidden = el.style.display === 'none';
        el.style.display = isHidden ? '' : 'none';
        document.getElementById('MainMenuBtn').classList.toggle('active', isHidden);
    });

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

    let menubar = document.getElementById('idmymenu');
    if (!menubar) {
        menubar = document.createElement('div');
        menubar.id = 'idmymenu';
        sidePanel.appendChild(menubar);
    }
    menubar.className = `m-menu-panel menubarstyle`;
    menubar.style.display = 'none';

    const currentSection = (typeof opsection !== 'undefined' ? opsection : "").toString().trim();
    const isTP = currentSection.startsWith("ТП");

    menubar.innerHTML = menuConfig
        .filter(item => !item.tp || isTP)
        .map(item => `<div id="${item.id}" class="m-menu-btn">${item.text}</div>`)
        .join('');

    menubar.onclick = (e) => {
        const btn = e.target.closest('.m-menu-btn');
        if (btn) {
            const config = menuConfig.find(c => c.id === btn.id);
            if (config?.fn) config.fn();
            menubar.style.display = 'none';
            document.getElementById('MainMenuBtn').classList.remove('active');
        }
    };

    createSideBtn('opennewcat', '☢', 'История чатов', 'emerald', getopennewcatButtonPress);

    if (scriptAdr != data.TP_addr && scriptAdr != data.TP_addrRzrv && localStorage.getItem('hideTaskWindow') == 1) {
        localStorage.setItem('hideTaskWindow', '0');
    }
    if (scriptAdr != data.TP_addr && scriptAdr != data.TP_addrRzrv) prepKC();
    else prepTp();

    window.onkeydown = (e) => { if (e.key == 'Control') bool = 1; };
    window.onkeyup = (e) => { if (e.key == 'Control') bool = 0; };
    setInterval(checkchats, 1000);
}

if (window.location.pathname !== "/login") setTimeout(move_again_AF, 3000);
else {
    let lastP = window.location.pathname;
    setInterval(() => {
        if (lastP === "/login" && window.location.pathname !== "/login") {
            lastP = window.location.pathname;
            setTimeout(move_again_AF, 3000);
        }
    }, 1000);
}

function closeTerms() {
    if (document.URL.includes('new-teachers.skyeng.ru')) {
        const btns = document.getElementsByClassName('terms-popup-accept-button');
        for (let b of btns) b.click();
    }
}

async function getText() {
    try {
        const r = await fetch(scriptAdr);
        if (r.ok) { table = (await r.json()).result; refreshTemplates(); }
    } catch (e) {}
}

(function () {
    window.showCustomAlert = (msg) => {
        const t = document.createElement('div');
        t.style = 'position:fixed; top:20px; right:20px; background:#1e293b; color:#fff; padding:15px; border-radius:10px; z-index:9999999; box-shadow: 0 10px 30px rgba(0,0,0,0.5);';
        t.innerHTML = msg;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
    };
})();

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

function prepTp() {
    const p = document.getElementById('rightPanel');
    const create = (id, icon, title, theme, fn) => {
        const btn = createFAB({ id, icon, title, theme, onClick: fn });
        btn.classList.add('onlyfortp');
        p.appendChild(btn);
    };
    create('datsyCalendar', '📅', 'Datsy', 'amber', getdatsyCalendarButtonPress);
    create('butServ', '⚜', 'Сервисы', 'violet', function() {
        const s = document.getElementById('AF_Service');
        const v = s.style.display !== 'none';
        s.style.display = v ? 'none' : '';
        this.classList.toggle('active', !v);
    });
    create('knowledgeCenter', '💡', 'БЗ', 'orange', getknowledgeCenterButtonPress);
    create('taskBut', '🛠', 'Задачи', 'emerald', gettaskButButtonPress);
    setInterval(timerHideButtons, 500);
}

function prepKC() {
    const l = document.querySelector('.user_menu-language_switcher');
    if (l) l.style.display = localStorage.getItem('disablelngpmwindow') === '1' ? 'none' : '';
    document.querySelectorAll('.onlyfortp').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.onlyforkc').forEach(e => e.style.display = '');
}

function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        try {
            const t = document.createElement('textarea');
            t.value = text; t.style.position = 'fixed'; t.style.left = '-9999px';
            document.body.appendChild(t); t.select();
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
    // Используем глобальный поиск для нахождения всех URL
    const regex = /https:\/\/id\.skyeng\.ru\/auth\/login-link\/\S+/g;
    let matches = text.match(regex);
    // Проверяем наличие совпадений
    if (matches && matches.length) {
        // Получаем последний URL и удаляем кавычки в конце, если они есть
        let lastMatch = matches[matches.length - 1];
        return lastMatch.replace(/["']+$/, ''); // Удаляем кавычки в конце строки
    }
    return null; // Возвращаем null, если совпадений нет
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

function sanitizeHTML(h) { return h; }
function showToast(m) { showCustomAlert(m); }
setInterval(closeTerms, 500);
