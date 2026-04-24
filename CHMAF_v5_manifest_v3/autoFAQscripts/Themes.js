let tableth = [];
let KCThemesFlag = 0;

const win_Themes = `
<div class="af-theme-widget" id="themes_widget_container">
    <div class="af-header">
        <button class="af-btn" id="hideMeThemes">Hide</button>
        <div class="af-header-btns">
            <button class="af-btn" id="ClearSmartroomData" title="Очистить теги">🧹</button>
            <button class="af-btn" id="backtomenu" style="display:none">🔙 Назад</button>
            <button class="af-btn" id="themesinstr">❓</button>
            <button class="af-btn primary" id="getnewthdata">🔄 Обновить</button>
        </div>
    </div>

    <div style="display: flex; gap: 10px;">
        <div style="flex: 1;">
            <input class="af-input" id="search4Theme" placeholder="Поиск подтемы...">
        </div>
        <div style="flex: 1; display: flex; gap: 5px;">
            <input class="af-input" id="linktojiracoment" placeholder="Ссылка на Jira">
            <button class="af-btn primary" id="linktojirasend" style="height: 38px;">🚀</button>
        </div>
    </div>

    <div id="foundSubthemes" class="af-grid" style="margin-top: 10px;"></div>

<div class="af-main-layout">
    <div class="af-column">
        <div class="af-section-title af-title-themes">Темы</div>
        <div id="themes_body" class="af-grid-themes"></div>
    </div>

    <div class="af-column">
        <div class="af-section-title af-title-tags">Теги</div>
        <div id="tags_body" class="af-grid-tags"></div> <div id="multitag_body" class="thonlyfortp">
            <button class="af-btn primary" id="multitag" style="width: 100%; margin-top: 10px; padding: 8px; font-size: 12px;">Отправить мультитэг</button>
        </div>
    </div>
    </div>
</div>`;

const wintThemes = createWindow('AF_Themes', 'winTopThemes', 'winLeftThemes', win_Themes);
hideWindowOnDoubleClick('AF_Themes');

async function startThemes() {
    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv', 'TP_addrth', 'KC_addrth']);

    let scriptAdrTH = localStorage.getItem('scriptAdrTH');
    let scriptAdrChek = localStorage.getItem('scriptAdr');

    if (scriptAdrChek === data.TP_addr || scriptAdrChek === data.TP_addrRzrv) {
        scriptAdrTH = data.TP_addrth;
    } else if (scriptAdrChek === data.KC_addr || scriptAdrChek === data.KC_addrRzrv) {
        scriptAdrTH = data.KC_addrth;
        KCThemesFlag = 1;
    } else if (!scriptAdrTH) {
        scriptAdrTH = data.TP_addrth;
    }

    localStorage.setItem('scriptAdrTH', scriptAdrTH);
    getTextThemes(scriptAdrTH);
}

startThemes();

// --- Глобальная функция для вызова из других скриптов (например, content.js) ---
window.getThemesButtonPress = function () {
    const afThemes = document.getElementById('AF_Themes');
    const themesBtn = document.getElementById('themes');

    if (!afThemes) return; // Защита от ошибок, если элемент еще не создан

    if (afThemes.style.display === '' || afThemes.style.display !== 'none') {
        afThemes.style.display = 'none';
        if (themesBtn) themesBtn.classList.remove('activeScriptBtn');
    } else {
        afThemes.style.display = ''; // Показываем окно
        if (themesBtn) themesBtn.classList.add('activeScriptBtn');
    }
};

// Для обратной совместимости, если где-то функция вызывается напрямую без window.
function getThemesButtonPress() {
    window.getThemesButtonPress();
}

// --- Ивенты UI ---
document.getElementById('AF_Themes').addEventListener('dblclick', e => {
    if (checkelementtype(e)) document.getElementById('hideMeThemes').click();
});

document.getElementById('hideMeThemes').addEventListener('click', () => {
    const afThemes = document.getElementById('AF_Themes');
    const backBtn = document.getElementById('backtomenu');

    if (afThemes.style.display !== 'none') {
        afThemes.style.display = 'none';
        document.getElementById('themes').classList.remove('activeScriptBtn');
    }
    if (backBtn.style.display !== 'none') backBtn.click();
});

document.getElementById('themesinstr').addEventListener('click', () => {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9...');
});

function pagethClick(event) {
    const pagethId = event.target.dataset.pageId;
    document.getElementById('backtomenu').style.display = '';

    // Скрываем все страницы и кнопки, показываем нужную
    document.querySelectorAll('.theme-page, .theme-main-btn').forEach(el => el.style.display = 'none');
    document.getElementById(`page_${pagethId}`).style.display = 'grid';
}

document.getElementById('backtomenu').addEventListener('click', e => {
    document.querySelectorAll('.theme-page').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.theme-main-btn').forEach(el => el.style.display = '');
    e.target.style.display = 'none';
});

// --- API & Рендер ---
async function getTextThemes(appThemes) {
    try {
        const response = await fetch(appThemes);
        if (!response.ok) throw new Error('Network response was not ok');
        const rth = await response.json();
        tableth = rth.result;
        console.log('Updated themes successfully');
        refreshThemesBtns();
    } catch (e) {
        console.error('Failed to fetch themes:', e);
    }
}

function refreshThemesBtns() {
    const areaThbtns = document.getElementById('themes_body');
    const areaTagbtns = document.getElementById('tags_body');

    areaThbtns.innerHTML = '';
    areaTagbtns.innerHTML = '';

    let currentThemePageId = -1;
    let currentThemePage = null;
    let addTagFlag = false;

    tableth.forEach(row => {
        const [type, label, title, fontSize] = row;

        if (type === '') {
            addTagFlag = false;
            return; // Пропускаем пустые строки разрыва
        }

        if (type === 'Тэги') {
            addTagFlag = true;
            return;
        }

        if (type === 'Темы') {
            currentThemePageId++;
            addTagFlag = false;

            // Главная кнопка темы
            const mainBtn = document.createElement('button');
            mainBtn.className = 'af-item-btn theme-main-btn';
            mainBtn.textContent = label;
            mainBtn.dataset.pageId = currentThemePageId;
            if (title) mainBtn.title = title;
            if (fontSize) mainBtn.style.fontSize = `${fontSize}px`;
            mainBtn.addEventListener('click', pagethClick);
            areaThbtns.appendChild(mainBtn);

            // Контейнер подтем (скрытый по умолчанию)
            currentThemePage = document.createElement('div');
            currentThemePage.id = `page_${currentThemePageId}`;
            currentThemePage.className = 'af-grid-themes theme-page'; // используем класс сетки тем
            currentThemePage.style.display = 'none';
            currentThemePage.style.gridColumn = "1 / span 2"; // ВАЖНО: растягиваем подтемы на 2 колонки
            areaThbtns.appendChild(currentThemePage);


            return;
        }

        // Рендер кнопок внутри тем или тегов
        const subBtn = document.createElement('button');
        subBtn.textContent = type;
        subBtn.value = label;
        subBtn.className = 'af-item-btn searchSubthemes';
        subBtn.dataset.theme = currentThemePageId;
        if (title) subBtn.title = title;
        if (fontSize) subBtn.style.fontSize = `${fontSize}px`;

        if (!addTagFlag && currentThemePage) {
            subBtn.addEventListener('click', e => setTheme(e.target.value));
            currentThemePage.appendChild(subBtn);
        } else {
            // Это ТЕГ
            subBtn.name = "tagssbtn";

            subBtn.addEventListener('click', e => {
                const val = e.target.value;
                if (val === 'refusal_of_help') RefBtnTag(val);
                else if (val === 'smartroom') SmartBtnTag(val);
                else newTaggg(val);
            });

            if (KCThemesFlag === 0) {
                const wrapper = document.createElement('div');
                wrapper.className = 'af-tag-row';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'tagcheck';
                checkbox.className = 'af-checkbox';

                wrapper.appendChild(checkbox);
                wrapper.appendChild(subBtn);
                areaTagbtns.appendChild(wrapper);
            } else {
                areaTagbtns.appendChild(subBtn);
            }
        }
    });

    if (KCThemesFlag === 1) {
        document.querySelectorAll('.thonlyfortp').forEach(el => el.style.display = 'none');
    }
}

// --- Мультитэг & Jira ---
document.getElementById('ClearSmartroomData').addEventListener('click', () => {
    document.querySelectorAll('input[name="tagcheck"]').forEach(cb => cb.checked = false);
});

document.getElementById('multitag').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('input[name="tagcheck"]');
    const buttons = document.querySelectorAll('button[name="tagssbtn"]');
    const tagsvaluesarr = [];
    const chatId = getChatId();

    if (!chatId) return;

    checkboxes.forEach((cb, index) => {
        if (cb.checked) {
            tagsvaluesarr.push(buttons[index].value);
            if (buttons[index].value === 'smartroom' && document.getElementById('AF_Smartroomform').style.display === 'none') {
                document.getElementById('smartroomform').click();
            }
        }
    });

    if (tagsvaluesarr.length > 0) {
        try {
            await fetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken // Убедитесь, что aftoken объявлен глобально
                },
                body: JSON.stringify({
                    conversationId: chatId,
                    elements: [{ name: "tags", value: tagsvaluesarr }]
                }),
                credentials: "include"
            });
            // Очищаем после успешной отправки
            checkboxes.forEach(cb => cb.checked = false);
        } catch (err) {
            console.error('Payload error:', err);
        }
    } else {
        createAndShowButton('Не выбраны теги. Выберите 1 или несколько.', 'error');
    }
});

document.getElementById('linktojirasend').addEventListener('click', async () => {
    const input = document.getElementById('linktojiracoment');
    const getval = input.value.trim();
    const chatId = getChatId();

    if (getval && chatId) {
        if (window.location.href.includes('tickets/assigned')) {
            sendComment(getval);
        }

        try {
            await fetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                body: JSON.stringify({
                    conversationId: chatId, // Заменил ${splitter[5]} на корректный ID из переменной
                    elements: [{ name: "taskUrl", value: getval }]
                }),
                mode: "cors",
                credentials: "include"
            });
            input.value = "";
        } catch (err) {
            console.error('Jira link send error:', err);
        }
    }
});

// --- Поиск ---
document.getElementById("search4Theme").addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    const foundField = document.getElementById('foundSubthemes');
    foundField.innerHTML = "";

    if (!query) return;

    const buttons = [...document.querySelectorAll(".searchSubthemes")].filter(btn => btn.name !== "tagssbtn");

    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(query)) {
            const themePageId = btn.dataset.theme;
            // Ищем главную кнопку темы, чтобы взять её название
            const parentThemeBtn = document.querySelector(`.theme-main-btn[data-page-id="${themePageId}"]`);
            const themeName = parentThemeBtn ? parentThemeBtn.textContent : "Тема";

            // Создаем красивую карточку результата
            const card = document.createElement('div');
            card.className = 'af-found-card';

            const badge = document.createElement('div');
            badge.className = 'af-found-badge';
            badge.textContent = themeName;
            badge.title = themeName;

            const cloneBtn = btn.cloneNode(true);
            cloneBtn.addEventListener('click', () => setTheme(cloneBtn.value)); // Привязываем ивент клону

            card.appendChild(badge);
            card.appendChild(cloneBtn);
            foundField.appendChild(card);
        }
    });
});

// Находим кнопку и вешаем событие (убедись, что этот код идет ПОСЛЕ создания окна createWindow)
const refreshBtn = document.getElementById('getnewthdata');

if (refreshBtn) {
    refreshBtn.onclick = function () {
        console.log('Запуск обновления тематик...');

        // 1. Скрываем кнопку "Назад"
        const backBtn = document.getElementById('backtomenu');
        if (backBtn) backBtn.style.display = 'none';

        // 2. Очищаем поле поиска и результаты поиска
        const searchInput = document.getElementById('search4Theme');
        const foundField = document.getElementById('foundSubthemes');
        if (searchInput) searchInput.value = "";
        if (foundField) foundField.innerHTML = "";

        // 3. Возвращаем темы в начальное состояние (показываем главные кнопки, скрываем страницы подтем)
        document.querySelectorAll('.theme-page').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.theme-main-btn').forEach(el => el.style.display = '');

        // 4. Вызываем основную функцию загрузки данных
        // Мы используем startThemes(), так как она заново проверяет адреса и дергает getTextThemes
        startThemes();

        // Визуальный фидбек (опционально)
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => this.style.transform = 'rotate(0deg)', 500);
    };
}