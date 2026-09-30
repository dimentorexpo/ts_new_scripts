let tableth = [];
let KCThemesFlag = 0;

// ===== ULTRA PREMIUM COMPACT DESIGN =====
const themesCSS = document.createElement('style');
themesCSS.id = 'af-themes-premium-css';
themesCSS.textContent = `
#AF_Themes {
    /* Палитра "corporate graphite" — визуальная копия окна очереди (Queue.js, #AF_Queue) */
    --primary: #4268c9;
    --primary-hover: #547ce1;
    --primary-glow: rgba(66, 104, 201, 0.35);
    --bg-glass: #111827;
    --border-glass: #344258;
    --text-primary: #edf2fb;
    --text-secondary: #a6b4cb;
    --text-muted: #7d8ca6;
    --spacing: 8px;
    --radius-sm: 9px;
    --radius-md: 9px;

    background:
        radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
        #111827 !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;

    border: 1px solid var(--border-glass) !important;
    border-top: 1px solid var(--border-glass) !important;
    border-radius: 18px !important;
    box-shadow:
        0 26px 70px rgba(3, 9, 22, .52),
        inset 0 1px rgba(255, 255, 255, .06) !important;

    color: var(--text-primary) !important;
    font-family: 'SF Pro Display', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    -webkit-font-smoothing: antialiased !important;
    font-feature-settings: 'cv11', 'ss01';
    width: 720px !important;
    overflow: hidden !important;
  }

  #AF_Themes * { box-sizing: border-box; }

  /* === ULTRA COMPACT HEADER === */
  #AF_Themes .af-theme-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border-bottom: 1px solid #344258;
    cursor: grab;
    background: transparent;
  }

  #AF_Themes .af-theme-header:active { cursor: grabbing; }

  /* Минималистичные кнопки хедера */
  #AF_Themes .af-btn {
    height: 24px;
    padding: 0 8px;
    background: #1b283c;
    border: 1px solid #3c4d68;
    border-radius: var(--radius-sm);
    color: #dce5f5;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    display: inline-flex;
    align-items: center;
    gap: 3px;
    letter-spacing: 0.01em;
  }

  #AF_Themes .af-btn:hover {
    background: #293b56;
    border-color: #7799e2;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: none;
  }

  #AF_Themes .af-btn.primary {
    background: #4268c9;
    border-color: #7293ed;
    color: #eef3ff;
    box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
  }

  #AF_Themes .af-btn.primary:hover {
    background: #547ce1;
    border-color: #a2b9fa;
    box-shadow: 0 6px 19px rgba(58, 96, 205, .3);
    color: #fff;
  }

  #AF_Themes .buttonHide {
    background: rgba(255, 116, 140, .08);
    border-color: rgba(255, 116, 140, .3);
    color: #ffb0be;
    order: -1;
  }

  #AF_Themes .buttonHide:hover {
    background: rgba(255, 116, 140, .2);
    border-color: rgba(255, 116, 140, .5);
    color: #fff;
    box-shadow: none;
  }

  /* === ULTRA COMPACT SEARCH ROW === */
  #AF_Themes .af-search-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 6px;
    padding: 8px;
    padding-bottom: 6px;
    background: transparent;
  }

  #AF_Themes .af-input {
    background: #0d1625;
    border: 1px solid #3a4961;
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    color: var(--text-primary);
    font-size: 11px;
    outline: none;
    transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
    font-weight: 500;
  }

  #AF_Themes .af-input::placeholder {
    color: var(--text-muted);
    opacity: 0.9;
  }

  #AF_Themes .af-input:focus {
    border-color: #829fff;
    background: #142034;
    box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
  }

  .af-jira-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .af-jira-container .af-input {
    padding-right: 32px;
  }

  .af-jira-btn {
    position: absolute;
    right: 4px;
    background: none;
    border: none;
    padding: 3px;
    cursor: pointer;
    font-size: 14px;
    transition: transform 0.15s;
    line-height: 1;
    color: var(--text-muted);
  }

  .af-jira-btn:hover {
    transform: scale(1.2);
    color: var(--primary-hover);
    filter: drop-shadow(0 0 8px var(--primary-glow));
  }

  /* === ULTRA COMPACT MAIN LAYOUT === */
  #AF_Themes .af-main-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    max-height: 60vh;
    overflow-y: auto;
  }

  /* Премиальный скроллбар */
  #AF_Themes .af-main-layout::-webkit-scrollbar { width: 4px; }
  #AF_Themes .af-main-layout::-webkit-scrollbar-track { background: transparent; }
  #AF_Themes .af-main-layout::-webkit-scrollbar-thumb,
  #AF_Themes .af-main-layout::-webkit-scrollbar-thumb:hover {
    background: #536a8e;
    border-radius: 10px;
  }

  /* Минималистичные заголовки секций */
  #AF_Themes .af-section-title {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 6px;
    padding-left: 2px;
    opacity: 0.7;
  }
  }

  /* === ULTRA COMPACT THEME BUTTONS === */
  #AF_Themes .theme-main-btn {
    width: 100%;
    background: #1b283c;
    border: 1px solid #3c4d68;
    border-radius: var(--radius-sm);
    padding: 3px 6px;
    color: #dce5f5;
    font-size: 10px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    margin-bottom: 2px;
    text-align: left;
    line-height: 1.2;
  }

  #AF_Themes .theme-main-btn:hover {
    background: #293b56;
    border-color: #7799e2;
    transform: translateX(2px);
    box-shadow: none;
    color: #fff;
  }

  /* === ULTRA COMPACT SUBTHEMES === */
  #AF_Themes .theme-page {
    grid-column: 1 / span 2;
    display: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 4px;
    padding: 4px 0 8px 0;
    animation: afFadeIn 0.2s ease;
  }

  #AF_Themes .theme-page[style*="display: flex"],
  #AF_Themes .theme-page[style*="display: block"] {
    display: grid !important;
  }

  #AF_Themes .searchSubthemes {
    background: #1b283c;
    border: 1px solid #3c4d68;
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    color: #dce5f5;
    font-size: 13px;
    line-height: 1.4;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    display: flex;
    align-items: center;
    text-align: left;
    font-weight: 500;
  }

  #AF_Themes .searchSubthemes:hover {
    background: #4268c9;
    border-color: #7293ed;
    color: #eef3ff;
    box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
    transform: translateY(-1px);
  }

  /* Приглушаем теги когда открыты подтемы */
  .theme-page[style*="display: grid"] ~ .af-column:last-child {
    opacity: 0.3;
    pointer-events: none;
    filter: blur(1px);
  }

  /* === ULTRA COMPACT SEARCH RESULTS === */
  #AF_Themes #foundSubthemes {
    display: none;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    padding: 0 8px 8px;
    max-height: 240px;
    overflow-y: auto;
  }

  #AF_Themes #foundSubthemes::-webkit-scrollbar { width: 4px; }
  #AF_Themes #foundSubthemes::-webkit-scrollbar-thumb {
    background: #536a8e;
    border-radius: 10px;
  }

  #AF_Themes .af-found-card {
    background: #1a2536;
    border: 1px solid #344258;
    border-left: 3px solid #617fbd;
    border-radius: 9px;
    padding: 5px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background-color .16s ease, border-color .16s ease;
  }

  #AF_Themes .af-found-card:hover {
    background: #23334b;
    border-color: #6685be;
    border-left-color: #92afff;
    transform: none;
    box-shadow: none;
  }

  #AF_Themes .af-found-badge {
    color: #a9c0ff;
    font-size: 8px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    opacity: 1;
  }

  #AF_Themes .af-found-card button {
    background: #1b283c;
    border: 1px solid #3c4d68;
    border-radius: 9px;
    color: #dce5f5;
    font-size: 10px;
    text-align: left;
    padding: 5px 7px;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease;
    line-height: 1.3;
    font-weight: 500;
  }

  #AF_Themes .af-found-card button:hover {
    background: #4268c9;
    color: #eef3ff;
    border-color: #7293ed;
    box-shadow: none;
  }

  /* === ULTRA COMPACT TAGS === */
  #AF_Themes .af-grid-tags {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  #AF_Themes .af-tag-row {
    display: flex;
    align-items: center;
    background: #1a2536;
    border: 1px solid #344258;
    border-left: 3px solid #617fbd;
    border-radius: 9px;
    padding: 2px;
    transition: background-color .16s ease, border-color .16s ease;
    word-wrap: break-word;
  }

  #AF_Themes .af-tag-row:hover {
    background: #23334b;
    border-color: #6685be;
    border-left-color: #92afff;
    box-shadow: none;
  }

  #AF_Themes .af-checkbox {
    margin: 0 6px;
    cursor: pointer;
    width: 13px;
    height: 13px;
    accent-color: #4268c9;
    flex-shrink: 0;
  }

  #AF_Themes .af-tag-row .af-item-btn {
    border: none;
    background: transparent;
    text-align: left;
    padding: 6px 7px;
    font-size: 11px;
    color: var(--text-primary);
    cursor: pointer;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
    line-height: 1.3;
  }

  #AF_Themes #multitag {
    width: 100%;
    margin-top: 6px;
    padding: 6px;
    font-size: 11px;
  }

  /* === PREMIUM ANIMATIONS === */
  @keyframes afFadeIn {
    from { opacity: 0; transform: translateY(3px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
if (!document.getElementById('af-themes-premium-css')) {
    document.head.appendChild(themesCSS);
}

// ===== WINDOW HTML =====
const win_Themes = `
<div class="af-theme-widget" id="themes_widget_container">
    <div class="af-theme-header chmaf-drag-handle">
        <button class="af-btn" id="ClearSmartroomData" title="Очистить теги">🧹</button>
        <button class="af-btn" id="backtomenu" style="display:none">← Назад</button>
        <button class="af-btn" id="themesinstr" title="Инструкция">?</button>
        <button class="af-btn primary" id="getnewthdata">🔄 Обновить</button>
        <button class="buttonHide af-btn" id="hideMeThemes">✕</button>
    </div>

    <div class="af-search-row">
        <div class="af-search-col">
            <input class="af-input" id="search4Theme" placeholder="Поиск подтемы...">
        </div>
        <div class="af-jira-container">
            <input class="af-input" id="linktojiracoment" placeholder="Ссылка на Jira">
            <button class="af-jira-btn" id="linktojirasend" title="Отправить">🚀</button>
        </div>
    </div>

    <div id="foundSubthemes"></div>

    <div class="af-main-layout">
        <div class="af-column">
            <div class="af-section-title">Темы</div>
            <div id="themes_body" class="af-grid-themes"></div>
        </div>

        <div class="af-column">
            <div class="af-section-title">Теги</div>
            <div id="tags_body" class="af-grid-tags"></div>
            <div id="multitag_body" class="thonlyfortp">
                <button class="af-btn primary" id="multitag">Отправить мультитэг</button>
            </div>
        </div>
    </div>
</div>`;

const wintThemes = createWindow('AF_Themes', 'winTopThemes', 'winLeftThemes', win_Themes);
hideWindowOnDoubleClick('AF_Themes');

// ===== DRAG HANDLED BY utils.js enableDrag =====
// Кастомный drag удалён — используется universal enableDrag из createWindow

// ===== LOGIC (unchanged) =====
async function startThemes() {
    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv', 'TP_addrth', 'KC_addrth']);

    // Адрес тем всегда выводим из ТЕКУЩЕГО chrome.storage по активному отделу —
    // сохранённый в localStorage scriptAdrTH мог остаться от старого деплоя
    const scriptAdrChek = localStorage.getItem('scriptAdr');
    let scriptAdrTH;

    if (scriptAdrChek === data.KC_addr || scriptAdrChek === data.KC_addrRzrv) {
        scriptAdrTH = data.KC_addrth;
        KCThemesFlag = 1;
    } else {
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
        if (themesBtn) themesBtn.classList.remove('active');
    } else {
        afThemes.style.display = '';
        if (themesBtn) themesBtn.classList.add('active');
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
        document.getElementById('themes').classList.remove('active');
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
        const rth = await fetchGasJson(appThemes);
        if (!rth || !Array.isArray(rth.result)) throw new Error('В ответе GAS нет массива result — проверь адрес деплоя: ' + appThemes);
        tableth = rth.result;
        console.log(`[ChMAF] Темы загружены: ${tableth.length} строк`);
        refreshThemesBtns();
        return true;
    } catch (e) {
        console.error('[ChMAF] Failed to fetch themes:', e);
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

            cloneBtn.addEventListener('click', () => {
                setTheme(cloneBtn.value);

                // Визуальный отклик
                const originalText = cloneBtn.textContent;
                const originalBg = cloneBtn.style.background;

                cloneBtn.textContent = "✓ Отправлено";
                cloneBtn.style.background = "rgba(74, 222, 128, 0.2)";

                setTimeout(() => {
                    cloneBtn.textContent = originalText;
                    cloneBtn.style.background = originalBg;
                }, 700);
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
        btn.innerHTML = "⏳";
        btn.style.opacity = "0.6";

        const backBtn = document.getElementById('backtomenu');
        if (backBtn) backBtn.style.display = 'none';
        document.querySelectorAll('.theme-page').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.theme-main-btn').forEach(el => el.style.display = '');

        const isSuccess = await startThemes();

        btn.innerHTML = isSuccess ? "✓" : "✕";
        btn.style.color = isSuccess ? "#4ade80" : "#f87171";

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.opacity = "1";
            btn.style.color = "";
        }, 2000);
    };
}