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

    const storedTop = parseInt(localStorage.getItem(topKey)) || 120;
    const storedLeft = parseInt(localStorage.getItem(leftKey)) || 295;

    if (id === 'TestUsers') windowElement.classList.add('onlyfortp', 'testuserwindow');
    else if (id === 'AF_addChatMenu') windowElement.classList.add('wintInitializeChat');
    else windowElement.classList.add('extwindows');

    windowElement.id = id;
    windowElement.style.position = 'fixed';
    windowElement.style.top = storedTop + 'px';
    windowElement.style.left = storedLeft + 'px';
    windowElement.style.display = 'none';

    if (['AF_Timetable', 'AF_Grabber', 'AF_GrList', 'AF_SpecCommWindow'].includes(id)) {
        windowElement.style.zIndex = '1100000';
    }
    
    windowElement.innerHTML = content;

    // Автокоррекция позиции
    requestAnimationFrame(() => {
        const rect = windowElement.getBoundingClientRect();
        if (rect.top < 0 || rect.left < 0 || rect.top > window.innerHeight - 50) {
            windowElement.style.top = '120px';
            windowElement.style.left = '295px';
        }
    });

    // ОСНОВНАЯ ЛОГИКА ПЕРЕТАСКИВАНИЯ
    windowElement.addEventListener('mousedown', function (event) {
        // ПРОВЕРКА ПО WHITELIST: Только элементы с классом chmaf-drag-handle могут инициировать drag.
        // Это на 100% исключает случайное срабатывание на инпутах, textarea и кнопках.
        const dragHandle = event.target.closest('.chmaf-drag-handle');
        if (!dragHandle) return;

        // Если кликнули в кнопку ВНУТРИ хедера (например, крестик) - не тащим
        if (event.target.closest('button, a, input, select, textarea')) return;

        if (event.button !== 0) return;

        // Блокируем нативный drag и выделение текста ПОД окном
        event.preventDefault();

        const startX = event.clientX;
        const startY = event.clientY;
        const initialLeft = windowElement.offsetLeft;
        const initialTop = windowElement.offsetTop;

        let lastLeft = initialLeft;
        let lastTop = initialTop;
        let rafId = null;

        // Эффекты при перетаскивании - применяем сразу
        windowElement.style.cursor = 'grabbing';
        windowElement.style.opacity = '0.9';
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';

        function onMouseMove(e) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            lastLeft = initialLeft + dx;
            lastTop = initialTop + dy;

            // Используем requestAnimationFrame для плавности
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                windowElement.style.left = lastLeft + 'px';
                windowElement.style.top = lastTop + 'px';
            });
        }

        function onMouseUp() {
            if (rafId) cancelAnimationFrame(rafId);

            // Возвращаем стили
            windowElement.style.cursor = '';
            windowElement.style.opacity = '';
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            // Сохраняем финальную позицию
            localStorage.setItem(leftKey, lastLeft);
            localStorage.setItem(topKey, lastTop);

            document.removeEventListener('mousemove', onMouseMove, true);
            document.removeEventListener('mouseup', onMouseUp, true);
        }

        document.addEventListener('mousemove', onMouseMove, true);
        document.addEventListener('mouseup', onMouseUp, true);
    });

    // ФИКС: Восстанавливаем нормальное поведение выделения текста в input/textarea
    setTimeout(() => {
        const inputs = windowElement.querySelectorAll('input:not([type="button"]):not([type="submit"]), textarea');
        inputs.forEach(input => {
            let clickCount = 0;
            let clickTimer = null;
            let lastClickX = 0;

            input.addEventListener('mousedown', function(e) {
                // Сохраняем координату X клика
                lastClickX = e.clientX;

                // Считаем клики для определения двойного клика
                clickCount++;

                if (clickTimer) clearTimeout(clickTimer);

                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 300);
            });

            // Используем событие click для снятия выделения ТОЛЬКО при одиночном клике
            input.addEventListener('click', function(e) {
                // Если это был двойной клик (clickCount >= 2), не трогаем выделение
                if (clickCount >= 2) {
                    return;
                }

                // Только для одиночного клика: если есть выделение, снимаем его
                if (this.selectionStart !== this.selectionEnd) {
                    // Вычисляем позицию клика в тексте
                    const rect = this.getBoundingClientRect();
                    const clickX = lastClickX - rect.left - parseInt(getComputedStyle(this).paddingLeft);

                    // Для input используем приблизительный расчёт
                    if (this.tagName === 'INPUT') {
                        // Создаём временный span для измерения ширины текста
                        const span = document.createElement('span');
                        span.style.font = getComputedStyle(this).font;
                        span.style.visibility = 'hidden';
                        span.style.position = 'absolute';
                        document.body.appendChild(span);

                        let bestPos = 0;
                        let minDiff = Infinity;

                        // Ищем позицию, ближайшую к клику
                        for (let i = 0; i <= this.value.length; i++) {
                            span.textContent = this.value.substring(0, i);
                            const width = span.offsetWidth;
                            const diff = Math.abs(width - clickX);

                            if (diff < minDiff) {
                                minDiff = diff;
                                bestPos = i;
                            }
                        }

                        document.body.removeChild(span);
                        this.setSelectionRange(bestPos, bestPos);
                    } else {
                        // Для textarea просто ставим в начало (сложнее вычислить точную позицию)
                        const pos = this.selectionStart;
                        this.setSelectionRange(pos, pos);
                    }
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

async function move_again_AF() { 
    getText();
    let whoAmISuccess = await whoAmI();
    while (!whoAmISuccess) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        whoAmISuccess = await whoAmI();
    }
    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']);
    
    let sidePanel = document.createElement('div');
    sidePanel.id = "rightPanel";
    sidePanel.style = 'position: fixed; top: 200px; right: 22px; z-index: 1000000; width: 40px; font-size: 22px; cursor: pointer; transition: all 0.5s ease;';
    document.body.append(sidePanel);

    const createSideBtn = (id, html, title, onClick) => {
        const b = document.createElement('button');
        b.id = id; b.innerHTML = html; b.title = title;
        b.className = 'gpanneon-glass-btn'; b.onclick = onClick;
        sidePanel.appendChild(b);
        return b;
    };

    createSideBtn('scriptBut', '🧩', 'Шаблоны', () => {
        const el = document.getElementById('AF_helper');
        const isHidden = el.style.display === 'none';
        el.style.display = isHidden ? 'flex' : 'none';
        document.getElementById('scriptBut').classList.toggle('activeScriptBtn', isHidden);
    });

    createSideBtn('themes', '📚', 'Темы', getThemesButtonPress);

    createSideBtn('MainMenuBtn', '👺', 'Меню', () => {
        const el = document.getElementById('idmymenu');
        const isHidden = el.style.display === 'none';
        el.style.display = isHidden ? '' : 'none';
        document.getElementById('MainMenuBtn').classList.toggle('activeScriptBtn', isHidden);
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
        }
    };

    createSideBtn('opennewcat', '☢', 'История чатов', getopennewcatButtonPress);

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
    const create = (id, h, t, fn) => {
        const b = document.createElement('button');
        b.id = id; b.innerHTML = h; b.title = t;
        b.className = 'onlyfortp gpanneon-glass-btn'; b.onclick = fn;
        p.appendChild(b);
    };
    create('datsyCalendar', '📅', 'Datsy', getdatsyCalendarButtonPress);
    create('butServ', '⚜', 'Сервисы', function() { 
        const s = document.getElementById('AF_Service');
        const v = s.style.display !== 'none';
        s.style.display = v ? 'none' : '';
        this.classList.toggle('activeScriptBtn', !v);
    });
    create('knowledgeCenter', '💡', 'БЗ', getknowledgeCenterButtonPress);
    create('taskBut', '🛠', 'Задачи', gettaskButButtonPress);
    setInterval(timerHideButtons, 500);
}

function prepKC() {
    const l = document.querySelector('.user_menu-language_switcher');
    if (l) l.style.display = localStorage.getItem('disablelngpmwindow') === '1' ? 'none' : '';
    document.querySelectorAll('.onlyfortp').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.onlyforkc').forEach(e => e.style.display = '');
}

function copyToClipboard(text) {
    const t = document.createElement('textarea');
    t.value = text; t.style.position = 'fixed'; t.style.left = '-9999px';
    document.body.appendChild(t); t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
}

function sanitizeHTML(h) { return h; }
function showToast(m) { showCustomAlert(m); }
setInterval(closeTerms, 500);
