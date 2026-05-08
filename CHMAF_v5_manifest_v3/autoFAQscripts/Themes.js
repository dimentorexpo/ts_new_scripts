let tableth = [];
let KCThemesFlag = 0;

// ===== PREMIUM GLASSMORPHISM STYLES (compact) =====
const themesCSS = document.createElement('style');
themesCSS.id = 'af-themes-premium-css';
themesCSS.textContent = `
#AF_Themes {
    --primary: #6366f1;
    --primary-hover: #818cf8;
    --bg-glass: rgba(15, 23, 42, 0.9);
    --border-glass: rgba(255, 255, 255, 0.1);

    background: var(--bg-glass) !important;
    backdrop-filter: blur(25px) saturate(170%) !important;
    -webkit-backdrop-filter: blur(25px) saturate(170%) !important;

    border: 1px solid var(--border-glass) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.18) !important;
    border-radius: 20px !important;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.04) !important;

    color: #f1f5f9 !important;
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
    -webkit-font-smoothing: antialiased !important;

    /* Увеличиваем ширину, чтобы 2 колонки плиток не сжимались */
    min-width: 550px !important;
    overflow: hidden !important;
    transform: translate3d(0,0,0);
  }

  #AF_Themes * { box-sizing: border-box; }

  /* Основной макет: делаем его гибким */
  #AF_Themes .af-main-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px;
    max-height: 70vh;
    overflow-y: auto;
  }

  /* СЕКРЕТ ЧЕТКОСТИ: Заголовки */
  #AF_Themes .af-section-title {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #64748b;
    margin-bottom: 10px;
    padding-left: 4px;
  }

  /* Кнопки основных тем */
  #AF_Themes .theme-main-btn {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 12px 14px;
    color: #e2e8f0;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 4px;
  }
  #AF_Themes .theme-main-btn:hover {
    background: rgba(99, 102, 241, 0.08);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateX(4px);
  }

  /* --- ПОДТЕМЫ (ПЛИТКИ 2 В РЯД) --- */
  #AF_Themes .theme-page {
    /* Растягиваем на всю ширину макета (2 колонки) */
    grid-column: 1 / span 2;
    display: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    padding: 8px 0 20px 0;
    animation: afFadeIn 0.3s ease;
  }

  /* Принудительный Grid когда JS ставит display: flex или block */
  #AF_Themes .theme-page[style*="display: flex"],
  #AF_Themes .theme-page[style*="display: block"] {
    display: grid !important;
  }

  #AF_Themes .searchSubthemes {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 12px 16px;
    color: #cbd5e1;
    font-size: 13px; /* Читабельный размер */
    line-height: 1.4;
    cursor: pointer;
    transition: all 0.2s;
    height: 100%;
    display: flex;
    align-items: center;
    text-align: left;
  }

  #AF_Themes .searchSubthemes:hover {
    background: var(--primary);
    border-color: var(--primary-hover);
    color: #fff;
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
    transform: translateY(-2px);
  }

  /* Теги - колонка справа (скрывается когда открыты подтемы для чистоты) */
  .theme-page[style*="display: grid"] ~ .af-column:last-child {
    opacity: 0.3; /* Приглушаем теги, когда фокус на подтемах */
    pointer-events: none;
  }

  /* Стили для Инпутов */
  #AF_Themes .af-input {
    background: rgba(0, 0, 0, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px;
    padding: 10px 15px;
    color: #fff;
    font-size: 14px;
    transition: 0.2s;
  }
  #AF_Themes .af-input:focus {
    border-color: var(--primary) !important;
    background: rgba(0, 0, 0, 0.4) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2) !important;
  }

  /* Анимации */
  @keyframes afFadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Скроллбар */
  #AF_Themes ::-webkit-scrollbar { width: 6px; }
  #AF_Themes ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  /* Исправленный контейнер результатов поиска */
#AF_Themes #foundSubthemes {
    display: none; /* Скрыт по умолчанию */
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 10px 16px;
    max-height: 300px;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    margin-bottom: 10px;
  }

  /* Карточка результата (прозрачная, без белого фона) */
  #AF_Themes .af-found-card {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 10px !important;
    padding: 8px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 5px !important;
    transition: transform 0.2s, background 0.2s !important;
    margin-bottom: 0 !important; /* Убираем отступ, так как есть gap в гриде */
  }

  #AF_Themes .af-found-card:hover {
    background: rgba(255, 255, 255, 0.06) !important;
    transform: translateY(-2px);
  }

  /* Бейдж родительской темы (теперь читабельный и полный) */
  #AF_Themes .af-found-badge {
    background: transparent !important;
    border: none !important;
    color: #818cf8 !important; /* Акцентный цвет */
    font-size: 10px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.5px !important;
    padding: 0 2px !important;
    white-space: normal !important; /* Полное название без обрезки */
    line-height: 1.2 !important;
  }

  /* Кнопка ВНУТРИ карточки поиска (лечим "белый" цвет) */
  #AF_Themes .af-found-card button {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #e2e8f0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 8px !important;
    font-size: 12px !important;
    text-align: left !important;
    box-shadow: none !important;
  }

  #AF_Themes .af-found-card button:hover {
    background: #6366f1 !important;
    color: #fff !important;
    border-color: #818cf8 !important;
  }

  /* Компактная Jira и Поиск */
#AF_Themes .af-search-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 8px;
    padding: 12px 16px 8px;
  }

  /* Контейнер для Jira (инпут + кнопка внутри) */
  .af-jira-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .af-jira-container .af-input {
    padding-right: 35px !important; /* Место для ракеты внутри инпута */
  }

  .af-jira-btn {
    position: absolute;
    right: 5px;
    background: none !important;
    border: none !important;
    padding: 5px !important;
    cursor: pointer;
    font-size: 16px;
    transition: transform 0.2s;
    line-height: 1;
  }

  .af-jira-btn:hover { transform: scale(1.2); }

  /* Результаты живого поиска в 2 колонки */
  #AF_Themes #foundSubthemes {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 16px;
    max-height: 280px;
    overflow-y: auto;
  }

  /* Те самые карточки поиска (лечим белые кнопки) */
  #AF_Themes .af-found-card {
    background: rgba(255, 255, 255, 0.04) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 10px !important;
    padding: 8px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 4px;
    transition: 0.2s;
  }

  #AF_Themes .af-found-card:hover {
    background: rgba(255, 255, 255, 0.08) !important;
    border-color: #6366f1 !important;
  }

  #AF_Themes .af-found-badge {
    color: #818cf8 !important;
    font-size: 10px !important;
    font-weight: 700 !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Кнопки внутри результатов поиска */
  #AF_Themes .af-found-card button {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 6px !important;
    color: #e2e8f0 !important;
    font-size: 12px !important;
    text-align: left !important;
    padding: 6px 8px !important;
    width: 100% !important;
    cursor: pointer;
  }

  #AF_Themes .af-found-card button:hover {
    background: #6366f1 !important;
    color: #fff !important;
  }

  /* Основная сетка подтем (2 колонки) */
  #AF_Themes .theme-page {
    display: none;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 8px;
  }

  #AF_Themes .theme-page[style*="display: flex"],
  #AF_Themes .theme-page[style*="display: block"] {
    display: grid !important;
  }
`;
if (!document.getElementById('af-themes-premium-css')) {
    document.head.appendChild(themesCSS);
}

// ===== WINDOW HTML =====
const win_Themes = `
<div class="af-theme-widget" id="themes_widget_container">
    <div class="af-theme-header">
        <button class="buttonHide" id="hideMeThemes">Hide</button>
        <div class="af-header-btns">
            <button class="af-btn" id="ClearSmartroomData" title="Очистить теги">🧹</button>
            <button class="af-btn" id="backtomenu" style="display:none">🔙 Назад</button>
            <button class="af-btn" id="themesinstr">❓</button>
            <button class="af-btn primary" id="getnewthdata">🔄 Обновить</button>
        </div>
    </div>

<div class="af-search-row">
        <div class="af-search-col">
            <input class="af-input" id="search4Theme" placeholder="Поиск подтемы...">
        </div>
        <div class="af-jira-container">
            <input class="af-input" id="linktojiracoment" placeholder="Ссылка на Jira">
            <button class="af-jira-btn" id="linktojirasend" title="Отправить ссылку">🚀</button>
        </div>
    </div>

    <div id="foundSubthemes" class="af-grid" style="margin-top: 8px;"></div>

    <div class="af-main-layout">
        <div class="af-column">
            <div class="af-section-title">Темы</div>
            <div id="themes_body" class="af-grid-themes"></div>
        </div>

        <div class="af-column">
            <div class="af-section-title">Теги</div>
            <div id="tags_body" class="af-grid-tags"></div>
            <div id="multitag_body" class="thonlyfortp">
                <button class="af-btn primary" id="multitag" style="width: 100%; margin-top: 6px; padding: 7px; font-size: 11px;">Отправить мультитэг</button>
            </div>
        </div>
    </div>
</div>`;

const wintThemes = createWindow('AF_Themes', 'winTopThemes', 'winLeftThemes', win_Themes);
hideWindowOnDoubleClick('AF_Themes');

// ===== PREMIUM SMOOTH DRAG (GPU accelerated) =====
(function setupPremiumDrag() {
    const win = document.getElementById('AF_Themes');
    if (!win) return;

    const topKey = 'winTopThemes';
    const leftKey = 'winLeftThemes';

    let currentX = parseInt(localStorage.getItem(leftKey) || '295');
    let currentY = parseInt(localStorage.getItem(topKey) || '120');

    win.style.left = '0px';
    win.style.top = '0px';
    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

    let isDragging = false;
    let startX, startY, initialX, initialY;
    let rafId = null;

    function updatePosition() {
        if (!isDragging && rafId) { rafId = null; return; }
        win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        localStorage.setItem(leftKey, String(currentX));
        localStorage.setItem(topKey, String(currentY));
        rafId = null;
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = initialX + dx;
        let newY = initialY + dy;

        const rect = win.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        currentX = newX;
        currentY = newY;

        if (!rafId) {
            rafId = requestAnimationFrame(updatePosition);
        }
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mouseleave', onMouseUp);
        if (rafId) cancelAnimationFrame(rafId);
        updatePosition();
    }

    const header = win.querySelector('.af-theme-header') || win;

    header.addEventListener('mousedown', function (e) {
        if (e.target.closest('button, input, select, textarea, .af-btn, .buttonHide')) return;
        if (typeof checkelementtype === 'function' && !checkelementtype(e)) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = currentX;
        initialY = currentY;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mouseleave', onMouseUp);
    });

    win.onmousedown = null;
})();

// ===== LOGIC (unchanged) =====
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
    return await getTextThemes(scriptAdrTH);
}

startThemes();

window.getThemesButtonPress = function () {
    const afThemes = document.getElementById('AF_Themes');
    const themesBtn = document.getElementById('themes');

    if (!afThemes) return;

    if (afThemes.style.display === '' || afThemes.style.display !== 'none') {
        afThemes.style.display = 'none';
        if (themesBtn) themesBtn.classList.remove('activeScriptBtn');
    } else {
        afThemes.style.display = '';
        if (themesBtn) themesBtn.classList.add('activeScriptBtn');
    }
};

function getThemesButtonPress() {
    window.getThemesButtonPress();
}

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

    // Сбрасываем поиск при закрытии
    resetSearch();

    if (backBtn.style.display !== 'none') backBtn.click();
});

document.getElementById('themesinstr').addEventListener('click', () => {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9...');
});

function pagethClick(event) {
    const pagethId = event.target.dataset.pageId;
    document.getElementById('backtomenu').style.display = '';

    document.querySelectorAll('.theme-page, .theme-main-btn').forEach(el => el.style.display = 'none');
    const page = document.getElementById(`page_${pagethId}`);
    if (page) page.style.display = 'flex';
}

document.getElementById('backtomenu').addEventListener('click', e => {
    document.querySelectorAll('.theme-page').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.theme-main-btn').forEach(el => el.style.display = '');
    e.target.style.display = 'none';
});

async function getTextThemes(appThemes) {
    try {
        const response = await fetch(appThemes);
        if (!response.ok) throw new Error('Ошибка сети');
        const rth = await response.json();

        if (rth && rth.result) {
            tableth = rth.result;
            console.log('Updated themes successfully');
            refreshThemesBtns();
            return true;
        } else {
            throw new Error('Некорректный формат данных');
        }
    } catch (e) {
        console.error('Failed to fetch themes:', e);
        return false;
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
            return;
        }

        if (type === 'Тэги') {
            addTagFlag = true;
            return;
        }

        if (type === 'Темы') {
            currentThemePageId++;
            addTagFlag = false;

            const mainBtn = document.createElement('button');
            mainBtn.className = 'af-item-btn theme-main-btn';
            mainBtn.textContent = label;
            mainBtn.dataset.pageId = currentThemePageId;
            if (title) mainBtn.title = title;
            if (fontSize) mainBtn.style.fontSize = `${fontSize}px`;
            mainBtn.addEventListener('click', pagethClick);
            areaThbtns.appendChild(mainBtn);

            currentThemePage = document.createElement('div');
            currentThemePage.id = `page_${currentThemePageId}`;
            currentThemePage.className = 'af-grid-themes theme-page';
            currentThemePage.style.display = 'none';
            areaThbtns.appendChild(currentThemePage);

            return;
        }

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

// Функция для полного сброса поиска
function resetSearch() {
    const searchInput = document.getElementById('search4Theme');
    const foundField = document.getElementById('foundSubthemes');
    const themesColumnBody = document.getElementById('themes_body');

    if (searchInput) searchInput.value = ""; // Очищаем текст в инпуте
    if (foundField) {
        foundField.innerHTML = ""; // Удаляем результаты поиска
        foundField.style.display = 'none'; // Скрываем контейнер результатов
    }
    if (themesColumnBody) {
        themesColumnBody.style.display = ''; // Возвращаем стандартный список тем
    }
}

document.getElementById('ClearSmartroomData').addEventListener('click', () => {
    // Очищаем чекбоксы тегов (твой старый код)
    document.querySelectorAll('input[name="tagcheck"]').forEach(cb => cb.checked = false);

    // Добавляем очистку поиска
    resetSearch();
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
                    "x-csrf-token": aftoken
                },
                body: JSON.stringify({
                    conversationId: chatId,
                    elements: [{ name: "tags", value: tagsvaluesarr }]
                }),
                credentials: "include"
            });
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
                    conversationId: chatId,
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

document.getElementById("search4Theme").addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();
    const foundField = document.getElementById('foundSubthemes');
    const mainLayout = document.querySelector('.af-main-layout');
    const themesColumnBody = document.getElementById('themes_body'); // Берем только колонку тем

    if (!query) {
        foundField.innerHTML = "";
        foundField.style.display = 'none';
        themesColumnBody.style.display = ''; // Возвращаем обычные темы
        return;
    }

    // Скрываем основные темы, но оставляем Теги (mainLayout не трогаем)
    themesColumnBody.style.display = 'none';
    foundField.style.display = 'grid';
    foundField.innerHTML = "";

    const buttons = [...document.querySelectorAll(".searchSubthemes")].filter(btn => btn.name !== "tagssbtn");

    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(query)) {
            const themePageId = btn.dataset.theme;
            const parentThemeBtn = document.querySelector(`.theme-main-btn[data-page-id="${themePageId}"]`);
            const themeName = parentThemeBtn ? parentThemeBtn.textContent.trim() : "Тема";

            const card = document.createElement('div');
            card.className = 'af-found-card';

            const badge = document.createElement('div');
            badge.className = 'af-found-badge';
            badge.textContent = themeName;

            const cloneBtn = btn.cloneNode(true);

            // НОВАЯ ЛОГИКА КЛИКА:
            cloneBtn.addEventListener('click', () => {
                setTheme(cloneBtn.value);

                // Визуальный отклик, что нажато
                const originalText = cloneBtn.textContent;
                cloneBtn.textContent = "✅ Отправлено";
                cloneBtn.style.backgroundColor = "rgba(34, 197, 94, 0.2)"; // Слегка зеленый

                setTimeout(() => {
                    cloneBtn.textContent = originalText;
                    cloneBtn.style.backgroundColor = "";
                }, 800);

                // ТЕПЕРЬ МЫ НЕ ОЧИЩАЕМ ПОИСК И НЕ ЗАКРЫВАЕМ ЕГО
                // Поле остается, результаты на месте.
            });

            card.appendChild(badge);
            card.appendChild(cloneBtn);
            foundField.appendChild(card);
        }
    });
});

const refreshBtn = document.getElementById('getnewthdata');
if (refreshBtn) {
    refreshBtn.onclick = async function () {
        const btn = this;
        const originalHTML = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = "⌛ Загрузка...";
        btn.style.opacity = "0.7";

        const backBtn = document.getElementById('backtomenu');
        if (backBtn) backBtn.style.display = 'none';
        document.querySelectorAll('.theme-page').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.theme-main-btn').forEach(el => el.style.display = '');

        const isSuccess = await startThemes();

        if (isSuccess) {
            btn.innerHTML = "✅ Успешно";
            btn.style.color = "#a6e3a1";
        } else {
            btn.innerHTML = "❌ Ошибка";
            btn.style.color = "#f38ba8";
        }

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.color = "";
        }, 3000);
    };
}