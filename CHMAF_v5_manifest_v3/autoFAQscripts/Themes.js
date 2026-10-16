let tableth = [];
let KCThemesFlag = 0;

// ===== ОФОРМЛЕНИЕ КАК В QUEUE / CHATHISTORY =====
const themesCSS = document.createElement('style');
themesCSS.id = 'af-themes-premium-css';
themesCSS.textContent = `
#AF_Themes {
    /* Оформление как в Queue / ChatHistory / Userinfo («corporate graphite») */
    --primary: #4268c9;
    --primary-hover: #547ce1;
    --primary-line: #7293ed;
    --bg: #111827;
    --card: #1a2536;
    --card-hover: #23334b;
    --line: #344258;
    --btn: #1b283c;
    --btn-line: #3c4d68;
    --btn-hover: #293b56;
    --btn-hover-line: #7799e2;
    --field: #0d1625;
    --field-line: #3a4961;
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --text-muted: #7d8ca6;
    --accent-text: #a9c0ff;

    /* Внешнюю рамку createWindow убираем (как в Marks/SmartRoom):
       иначе за панелью выглядывает второй прямоугольник другой ширины */
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
    width: auto !important;
    min-width: 0 !important;
    overflow: visible !important;

    color: var(--text-primary) !important;
    font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
    font-size: 14px;
    line-height: 1.5;
    letter-spacing: .01em;
    text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
    -webkit-font-smoothing: antialiased !important;
}

/* Сама панель — единственная видимая рамка окна */
#AF_Themes .af-theme-widget {
    width: 760px !important;
    max-width: calc(100vw - 16px) !important;
    margin: 0 !important;
    background:
        radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
        var(--bg) !important;
    border: 1px solid var(--line) !important;
    border-radius: 18px !important;
    box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06) !important;
    overflow: hidden !important;
}

#AF_Themes * { box-sizing: border-box; }

#AF_Themes button,
#AF_Themes input { font-family: inherit; }

/* === Шапка: ❌ слева, заголовок, кнопки справа === */
#AF_Themes .af-theme-header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 18px;
    padding: 18px 0 12px;
    border-bottom: 1px solid rgba(66, 104, 201, .15);
    cursor: grab;
    user-select: none;
}

#AF_Themes .af-theme-header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 40%;
    height: 1px;
    background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
}

#AF_Themes .af-theme-header:active { cursor: grabbing; }

#AF_Themes .af-theme-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: #fefefe;
    font-size: 15px;
    font-weight: 700;
    white-space: nowrap;
    text-overflow: ellipsis;
}

#AF_Themes .af-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex: none;
    height: 34px;
    padding: 0 14px;
    color: #dce5f5;
    background: var(--btn);
    border: 1px solid var(--btn-line);
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
}

#AF_Themes .af-btn--icon {
    width: 34px;
    padding: 0;
    font-size: 16px;
}

#AF_Themes .af-btn:hover:not(:disabled) {
    color: #fff;
    background: var(--btn-hover);
    border-color: var(--btn-hover-line);
    transform: translateY(-1px);
}

#AF_Themes .af-btn:active:not(:disabled) { transform: translateY(0) scale(.98); }
#AF_Themes .af-btn:disabled { cursor: wait; }

#AF_Themes .af-btn.primary {
    color: #eef3ff;
    background: var(--primary);
    border-color: var(--primary-line);
    box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
}

#AF_Themes .af-btn.primary:hover:not(:disabled) {
    background: var(--primary-hover);
    border-color: #a2b9fa;
}

#AF_Themes .buttonHide {
    color: #ffb0be;
    background: rgba(255, 116, 140, .08);
    border-color: rgba(255, 116, 140, .3);
}

#AF_Themes .buttonHide:hover:not(:disabled) {
    color: #ffb0be;
    background: rgba(255, 116, 140, .16);
    border-color: rgba(255, 116, 140, .55);
}

/* === Поиск и Jira === */
#AF_Themes .af-search-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 8px;
    padding: 14px 18px 4px;
}

#AF_Themes .af-input {
    width: 100%;
    height: 34px;
    padding: 0 12px;
    color: #edf2fb;
    background: var(--field);
    border: 1px solid var(--field-line);
    border-radius: 9px;
    outline: none;
    font-size: 14px;
    font-weight: 500;
    transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
}

#AF_Themes .af-input::placeholder { color: var(--text-muted); }

#AF_Themes .af-input:focus {
    background: #142034;
    border-color: #829fff;
    box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
}

#AF_Themes .af-jira-container {
    position: relative;
    display: flex;
    align-items: center;
}

#AF_Themes .af-jira-container .af-input { padding-right: 38px; }

#AF_Themes .af-jira-btn {
    position: absolute;
    right: 4px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: rgba(66, 104, 201, .08);
    border: 1px solid rgba(66, 104, 201, .25);
    border-radius: 6px;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    transition: all .3s cubic-bezier(.34, 1.56, .64, 1);
}

#AF_Themes .af-jira-btn:hover {
    background: rgba(66, 104, 201, .2);
    border-color: rgba(66, 104, 201, .6);
    box-shadow: 0 0 12px rgba(66, 104, 201, .3);
    transform: scale(1.1) rotate(-8deg);
}

/* === Основная часть === */
#AF_Themes .af-main-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    max-height: 60vh;
    padding: 10px 18px 18px;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(66, 104, 201, .4) transparent;
}

#AF_Themes .af-main-layout::-webkit-scrollbar,
#AF_Themes #foundSubthemes::-webkit-scrollbar { width: 4px; }
#AF_Themes .af-main-layout::-webkit-scrollbar-track { background: transparent; }
#AF_Themes .af-main-layout::-webkit-scrollbar-thumb,
#AF_Themes #foundSubthemes::-webkit-scrollbar-thumb {
    background: rgba(66, 104, 201, .3);
    border-radius: 8px;
}

/* Заголовок секции — как в Userinfo: капслок + градиентная линия */
#AF_Themes .af-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0 8px;
    color: #fefefe;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
}

#AF_Themes .af-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(66, 104, 201, .4), transparent);
}

/* === Темы === */
#AF_Themes #themes_body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    align-content: start;
}

#AF_Themes .theme-main-btn {
    width: 100%;
    min-height: 38px;
    margin: 0;
    padding: 7px 10px;
    color: #dce5f5;
    background: var(--card);
    border: 1px solid var(--line);
    border-left: 3px solid #617fbd;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1.3;
    text-align: left;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
}

#AF_Themes .theme-main-btn:hover {
    color: #fff;
    background: var(--card-hover);
    border-color: #6685be;
    border-left-color: #92afff;
    transform: translateX(2px);
}

/* Подтемы */
#AF_Themes .theme-page {
    grid-column: 1 / span 2;
    display: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    padding: 2px 0 8px;
    animation: afFadeIn .2s ease;
}

#AF_Themes .theme-page.is-open { display: grid; }

#AF_Themes .searchSubthemes {
    display: flex;
    align-items: center;
    min-height: 36px;
    padding: 7px 10px;
    color: #dce5f5;
    background: var(--btn);
    border: 1px solid var(--btn-line);
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
    text-align: left;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
}

#AF_Themes .searchSubthemes:hover {
    color: #eef3ff;
    background: var(--primary);
    border-color: var(--primary-line);
    box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
    transform: translateY(-1px);
}

/* === Результаты поиска === */
#AF_Themes #foundSubthemes {
    display: none;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    max-height: 260px;
    padding: 10px 18px 4px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(66, 104, 201, .4) transparent;
}

#AF_Themes .af-found-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 8px;
    background: var(--card);
    border: 1px solid var(--line);
    border-left: 3px solid #617fbd;
    border-radius: 10px;
    transition: background-color .16s ease, border-color .16s ease;
}

#AF_Themes .af-found-card:hover {
    background: var(--card-hover);
    border-color: #6685be;
    border-left-color: #92afff;
}

#AF_Themes .af-found-badge {
    color: var(--accent-text);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
}

#AF_Themes .af-found-card button {
    padding: 6px 9px;
    color: #dce5f5;
    background: var(--btn);
    border: 1px solid var(--btn-line);
    border-radius: 9px;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.35;
    text-align: left;
    cursor: pointer;
    transition: background-color .16s ease, border-color .16s ease;
}

#AF_Themes .af-found-card button:hover {
    color: #eef3ff;
    background: var(--primary);
    border-color: var(--primary-line);
}

/* === Теги === */
#AF_Themes .af-grid-tags {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
}

#AF_Themes .af-tag-row {
    display: flex;
    align-items: center;
    min-height: 38px;
    padding: 2px;
    background: rgba(0, 0, 0, .25);
    border: 1px solid rgba(66, 104, 201, .15);
    border-radius: 9px;
    word-wrap: break-word;
    transition: background-color .16s ease, border-color .16s ease;
}

#AF_Themes .af-tag-row:hover {
    background: rgba(0, 0, 0, .35);
    border-color: rgba(66, 104, 201, .4);
}

/* Выбранный тег — подсветка берётся ТОЛЬКО из реального состояния чекбокса
   (:has поддерживается в Chromium 105+). Отдельный класс-флаг не используем:
   при программном cb.checked = false событие change не стреляет и класс «залипал». */
#AF_Themes .af-tag-row:has(input[name="tagcheck"]:checked) {
    background: var(--primary);
    border-color: var(--primary-line);
}

#AF_Themes .af-tag-row:has(input[name="tagcheck"]:checked) .af-item-btn { color: #eef3ff; }
#AF_Themes .af-tag-row:has(input[name="tagcheck"]:checked) .af-checkbox { accent-color: #a2b9fa; }

#AF_Themes .af-checkbox {
    flex-shrink: 0;
    width: 15px;
    height: 15px;
    margin: 0 4px 0 8px;
    accent-color: var(--primary);
    cursor: pointer;
}

#AF_Themes .af-tag-row .af-item-btn {
    flex: 1;
    overflow: hidden;
    padding: 6px 8px;
    color: #f1f5f9;
    background: transparent;
    border: none;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.3;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
}

#AF_Themes #multitag {
    width: 100%;
    margin-top: 8px;
}

#AF_Themes button:focus-visible {
    outline: 2px solid #9ab5ff;
    outline-offset: 2px;
}

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
        <button class="buttonHide af-btn af-btn--icon" id="hideMeThemes" title="Скрыть">❌</button>
        <div class="af-theme-title">🏷️ Темы и теги</div>
        <button class="af-btn" id="backtomenu" style="display:none">← Назад</button>
        <button class="af-btn af-btn--icon" id="ClearSmartroomData" title="Очистить теги">🧹</button>
        <button class="af-btn af-btn--icon" id="themesinstr" title="Инструкция">📖</button>
        <button class="af-btn af-btn--icon primary" id="getnewthdata" title="Обновить темы и теги">♻️</button>
    </div>

    <div class="af-search-row">
        <div class="af-search-col">
            <input class="af-input" id="search4Theme" placeholder="🔎 Поиск подтемы…">
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
    KCThemesFlag = 0; // сбрасываем, иначе после смены отдела флаг КЦ «залипает»

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

    if (afThemes.style.display !== 'none') {
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
    const pagethId = event.currentTarget.dataset.pageId;
    document.getElementById('backtomenu').style.display = '';

    document.querySelectorAll('.theme-main-btn').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.theme-page').forEach(el => el.classList.remove('is-open'));
    document.getElementById(`page_${pagethId}`)?.classList.add('is-open');
}

document.getElementById('backtomenu').addEventListener('click', e => {
    document.querySelectorAll('.theme-page').forEach(el => el.classList.remove('is-open'));
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
            subBtn.addEventListener('click', e => setTheme(e.currentTarget.value));
            currentThemePage.appendChild(subBtn);
        } else {
            subBtn.name = "tagssbtn";

            subBtn.addEventListener('click', e => {
                const val = e.currentTarget.value;
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
                checkbox.value = label;

                wrapper.appendChild(checkbox);
                wrapper.appendChild(subBtn);
                areaTagbtns.appendChild(wrapper);
            } else {
                areaTagbtns.appendChild(subBtn);
            }
        }
    });

    document.querySelectorAll('.thonlyfortp').forEach(el => {
        el.style.display = KCThemesFlag === 1 ? 'none' : '';
    });
}

// Снять выбор со всех тегов (подсветка строк снимется сама через :has)
function clearTagSelection() {
    document.querySelectorAll('input[name="tagcheck"]').forEach(cb => cb.checked = false);
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
    clearTagSelection();
    resetSearch();
});

document.getElementById('multitag').addEventListener('click', async e => {
    const btn = e.currentTarget;
    const chatId = getChatId();
    if (!chatId || btn.disabled) return;

    const tagsvaluesarr = [...document.querySelectorAll('input[name="tagcheck"]:checked')].map(cb => cb.value);

    if (tagsvaluesarr.length === 0) {
        createAndShowButton('Не выбраны теги. Выберите 1 или несколько.', 'error');
        return;
    }

    if (tagsvaluesarr.includes('smartroom')) {
        const smartForm = document.getElementById('AF_Smartroomform');
        if (smartForm && smartForm.style.display === 'none') {
            document.getElementById('smartroomform')?.click();
        }
    }

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Отправка...';

    try {
        const res = await fetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        clearTagSelection();
        btn.textContent = `✓ Отправлено (${tagsvaluesarr.length})`;
    } catch (err) {
        console.error('Payload error:', err);
        createAndShowButton('Не удалось отправить теги, выбор сохранён — попробуйте ещё раз.', 'error');
        btn.textContent = originalText;
    } finally {
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 1200);
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
            const res = await fetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
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
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
        document.querySelectorAll('.theme-page').forEach(el => el.classList.remove('is-open'));
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