let tableth = [];
let KCThemesFlag = 0;

// ===== LUXURY PREMIUM GLASSMORPHISM =====
const themesCSS = document.createElement('style');
themesCSS.id = 'af-themes-premium-css';
themesCSS.textContent = `
#AF_Themes {
    --primary: #6366f1;
    --primary-hover: #818cf8;
    --bg-glass: rgba(15, 23, 42, 0.92);
    --border-glass: rgba(255, 255, 255, 0.1);
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
    --spacing: 12px;

    background: linear-gradient(135deg, rgba(22, 22, 38, 0.92) 0%, rgba(14, 14, 28, 0.95) 100%) !important;
    backdrop-filter: blur(28px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(180%) !important;

    border: 1px solid var(--border-glass) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
    border-radius: 18px !important;
    box-shadow:
        0 0 0 1px rgba(0,0,0,0.5),
        0 20px 50px rgba(0, 0, 0, 0.7),
        0 0 30px rgba(99, 102, 241, 0.05),
        inset 0 1px 0 rgba(255,255,255,0.06) !important;

    color: var(--text-primary) !important;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    -webkit-font-smoothing: antialiased !important;
    width: 720px !important;
    overflow: hidden !important;
    transform: translate3d(0,0,0);
  }

  #AF_Themes * { box-sizing: border-box; }

  /* === HEADER === */
  #AF_Themes .af-theme-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--spacing);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    cursor: grab;
  }

  #AF_Themes .af-theme-header:active { cursor: grabbing; }

  /* Унифицированные кнопки хедера */
  #AF_Themes .af-btn {
    height: 32px;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  #AF_Themes .af-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    color: var(--text-primary);
    transform: translateY(-1px);
  }

  #AF_Themes .af-btn.primary {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
    color: var(--primary-hover);
  }

  #AF_Themes .af-btn.primary:hover {
    background: rgba(99, 102, 241, 0.25);
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
  }

  #AF_Themes .buttonHide {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.25);
    color: #fca5a5;
    margin-left: auto;
  }

  #AF_Themes .buttonHide:hover {
    background: rgba(239, 68, 68, 0.25);
    color: #fff;
  }

  /* === SEARCH ROW === */
  #AF_Themes .af-search-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 8px;
    padding: var(--spacing);
    padding-bottom: 8px;
  }

  #AF_Themes .af-input {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    transition: all 0.2s;
  }

  #AF_Themes .af-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }

  #AF_Themes .af-input:focus {
    border-color: var(--primary);
    background: rgba(0, 0, 0, 0.35);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  .af-jira-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .af-jira-container .af-input {
    padding-right: 36px;
  }

  .af-jira-btn {
    position: absolute;
    right: 6px;
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: transform 0.2s;
    line-height: 1;
    color: var(--text-secondary);
  }

  .af-jira-btn:hover {
    transform: scale(1.15);
    color: var(--primary-hover);
  }

  /* === MAIN LAYOUT === */
  #AF_Themes .af-main-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing);
    padding: var(--spacing);
    max-height: 65vh;
    overflow-y: auto;
  }

  /* Скроллбар */
  #AF_Themes .af-main-layout::-webkit-scrollbar { width: 6px; }
  #AF_Themes .af-main-layout::-webkit-scrollbar-track { background: transparent; }
  #AF_Themes .af-main-layout::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  #AF_Themes .af-main-layout::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Заголовки секций */
  #AF_Themes .af-section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-bottom: 8px;
    padding-left: 2px;
  }

  /* === КНОПКИ ТЕМ === */
  #AF_Themes .theme-main-btn {
    width: 100%;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 10px 12px;
    color: var(--text-primary);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 6px;
    text-align: left;
  }

  #AF_Themes .theme-main-btn:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateX(3px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }

  /* === ПОДТЕМЫ === */
  #AF_Themes .theme-page {
    grid-column: 1 / span 2;
    display: none;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px 0 16px 0;
    animation: afFadeIn 0.25s ease;
  }

  #AF_Themes .theme-page[style*="display: flex"],
  #AF_Themes .theme-page[style*="display: block"] {
    display: grid !important;
  }

  #AF_Themes .searchSubthemes {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 10px 12px;
    color: var(--text-primary);
    font-size: 12px;
    line-height: 1.3;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    text-align: left;
  }

  #AF_Themes .searchSubthemes:hover {
    background: var(--primary);
    border-color: var(--primary-hover);
    color: #fff;
    box-shadow: 0 6px 16px rgba(99, 102, 241, 0.25);
    transform: translateY(-2px);
  }

  /* Приглушаем теги когда открыты подтемы */
  .theme-page[style*="display: grid"] ~ .af-column:last-child {
    opacity: 0.25;
    pointer-events: none;
  }

  /* === РЕЗУЛЬТАТЫ ПОИСКА === */
  #AF_Themes #foundSubthemes {
    display: none;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 var(--spacing) var(--spacing);
    max-height: 280px;
    overflow-y: auto;
  }

  #AF_Themes #foundSubthemes::-webkit-scrollbar { width: 6px; }
  #AF_Themes #foundSubthemes::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  #AF_Themes .af-found-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: all 0.2s;
  }

  #AF_Themes .af-found-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-1px);
  }

  #AF_Themes .af-found-badge {
    color: var(--primary-hover);
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.8;
  }

  #AF_Themes .af-found-card button {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 12px;
    text-align: left;
    padding: 8px 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  #AF_Themes .af-found-card button:hover {
    background: var(--primary);
    color: #fff;
    border-color: var(--primary-hover);
  }

  /* === ТЕГИ === */
  #AF_Themes .af-grid-tags {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  #AF_Themes .af-tag-row {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    padding: 2px;
    transition: all 0.2s;
	word-wrap:break-word;
  }

  #AF_Themes .af-tag-row:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }

  #AF_Themes .af-checkbox {
    margin: 0 6px;
    cursor: pointer;
    width: 14px;
    height: 14px;
    accent-color: var(--primary);
    flex-shrink: 0;
  }

  #AF_Themes .af-tag-row .af-item-btn {
    border: none;
    background: transparent;
    text-align: left;
    padding: 6px 8px;
    font-size: 12px;
    color: var(--text-primary);
    cursor: pointer;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #AF_Themes #multitag {
    width: 100%;
    margin-top: 8px;
    padding: 8px;
    font-size: 12px;
  }

  /* === АНИМАЦИИ === */
  @keyframes afFadeIn {
    from { opacity: 0; transform: translateY(4px); }
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