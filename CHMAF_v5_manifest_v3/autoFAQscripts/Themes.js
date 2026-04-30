let tableth = [];
let KCThemesFlag = 0;

// ===== PREMIUM GLASSMORPHISM STYLES =====
const themesCSS = document.createElement('style');
themesCSS.id = 'af-themes-premium-css';
themesCSS.textContent = `
  #AF_Themes {
    background: rgba(15, 23, 42, 0.88) !important;
    backdrop-filter: blur(24px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 20px !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6),
                0 0 0 1px rgba(255, 255, 255, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
    color: #e2e8f0 !important;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    overflow: hidden !important;
    min-width: 460px !important;
    will-change: transform;
    transform: translate3d(0,0,0);
  }

  #AF_Themes * { box-sizing: border-box; }

  /* Header */
  #AF_Themes .af-theme-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    cursor: grab;
    user-select: none;
  }
  #AF_Themes .af-theme-header:active { cursor: grabbing; }

  #AF_Themes .af-header-btns {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  /* Buttons */
  #AF_Themes .af-btn {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #cbd5e1;
    border-radius: 10px;
    padding: 8px 14px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    backdrop-filter: blur(4px);
    outline: none;
  }
  #AF_Themes .af-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(99, 102, 241, 0.4);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  #AF_Themes .af-btn.primary {
    background: linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.9));
    border-color: rgba(99,102,241,0.5);
    color: white;
    font-weight: 600;
  }
  #AF_Themes .af-btn.primary:hover {
    background: linear-gradient(135deg, rgba(99,102,241,1), rgba(79,70,229,1));
    box-shadow: 0 4px 20px rgba(99,102,241,0.3);
    transform: translateY(-1px);
  }

  #AF_Themes .buttonHide {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #fca5a5;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }
  #AF_Themes .buttonHide:hover {
    background: rgba(239, 68, 68, 0.28);
    transform: scale(1.05);
  }

  /* Inputs */
  #AF_Themes .af-input {
    width: 100%;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px 14px;
    color: #f1f5f9;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s;
    outline: none;
  }
  #AF_Themes .af-input::placeholder { color: #64748b; }
  #AF_Themes .af-input:focus {
    border-color: rgba(99, 102, 241, 0.6);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1), inset 0 1px 2px rgba(0,0,0,0.1);
    background: rgba(15, 23, 42, 0.8);
  }

  /* Search row */
  #AF_Themes .af-search-row {
    display: flex;
    gap: 10px;
    padding: 16px 20px 0;
  }
  #AF_Themes .af-search-col { flex: 1; }
  #AF_Themes .af-search-col-flex {
    flex: 1;
    display: flex;
    gap: 8px;
  }

  /* Found subthemes area */
  #AF_Themes #foundSubthemes {
    padding: 0 20px;
    margin-top: 10px;
    max-height: 200px;
    overflow-y: auto;
  }

  /* Main layout */
  #AF_Themes .af-main-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px 20px 20px;
    max-height: 65vh;
    overflow-y: auto;
  }
  #AF_Themes .af-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  #AF_Themes .af-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
    padding: 0 4px;
    margin-bottom: 2px;
  }

  /* Grids */
  #AF_Themes .af-grid-themes,
  #AF_Themes .af-grid-tags {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Theme main buttons */
  #AF_Themes .theme-main-btn {
    width: 100%;
    text-align: left;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 12px 16px;
    color: #e2e8f0;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    font-family: inherit;
  }
  #AF_Themes .theme-main-btn::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(to bottom, #6366f1, #8b5cf6);
    opacity: 0;
    transition: opacity 0.2s;
  }
  #AF_Themes .theme-main-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  #AF_Themes .theme-main-btn:hover::before { opacity: 1; }

  /* Subtheme buttons */
  #AF_Themes .searchSubthemes {
    width: 100%;
    text-align: left;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 10px 14px;
    color: #cbd5e1;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }
  #AF_Themes .searchSubthemes:hover {
    background: rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.3);
    color: #fff;
    transform: translateX(2px);
  }

  /* Tag buttons */
  #AF_Themes button[name="tagssbtn"] {
    flex: 1;
    text-align: left;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 10px;
    padding: 10px 14px;
    color: #6ee7b7;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-family: inherit;
  }
  #AF_Themes button[name="tagssbtn"]:hover {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.4);
    transform: translateX(3px);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
  }

  /* Tag row */
  #AF_Themes .af-tag-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px;
    border-radius: 10px;
    transition: background 0.15s;
  }
  #AF_Themes .af-tag-row:hover { background: rgba(255, 255, 255, 0.03); }

  /* BIG CHECKBOXES */
  #AF_Themes input[type="checkbox"].af-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 26px;
    height: 26px;
    min-width: 26px;
    background: rgba(15, 23, 42, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    cursor: pointer;
    position: relative;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    margin: 0;
    outline: none;
  }
  #AF_Themes input[type="checkbox"].af-checkbox:hover {
    border-color: rgba(99, 102, 241, 0.5);
    box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
  }
  #AF_Themes input[type="checkbox"].af-checkbox:checked {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-color: transparent;
    transform: scale(1.1);
    box-shadow: 0 0 16px rgba(99, 102, 241, 0.4);
  }
  #AF_Themes input[type="checkbox"].af-checkbox:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 16px;
    font-weight: 700;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }

  /* Found cards */
  #AF_Themes .af-found-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    transition: all 0.2s;
    animation: afSlideIn 0.3s ease;
    margin-bottom: 8px;
  }
  #AF_Themes .af-found-card:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  @keyframes afSlideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  #AF_Themes .af-found-badge {
    display: inline-block;
    background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2));
    border: 1px solid rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: fit-content;
  }

  /* Theme pages */
  #AF_Themes .theme-page {
    display: none;
    flex-direction: column;
    gap: 6px;
    grid-column: 1 / span 2;
  }

  /* Scrollbar */
  #AF_Themes ::-webkit-scrollbar { width: 6px; }
  #AF_Themes ::-webkit-scrollbar-track { background: transparent; }
  #AF_Themes ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  #AF_Themes ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }

  /* Multitag */
  #AF_Themes #multitag_body { margin-top: 4px; }

  /* Window entrance animation */
  @keyframes afWindowIn {
    from { opacity: 0; transform: scale(0.96) translate3d(0,0,0); }
    to { opacity: 1; transform: scale(1) translate3d(0,0,0); }
  }
  #AF_Themes { animation: afWindowIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
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
        <div class="af-search-col-flex">
            <input class="af-input" id="linktojiracoment" placeholder="Ссылка на Jira">
            <button class="af-btn primary" id="linktojirasend" style="height: 38px; flex-shrink: 0;">🚀</button>
        </div>
    </div>

    <div id="foundSubthemes" class="af-grid" style="margin-top: 10px;"></div>

    <div class="af-main-layout">
        <div class="af-column">
            <div class="af-section-title">Темы</div>
            <div id="themes_body" class="af-grid-themes"></div>
        </div>

        <div class="af-column">
            <div class="af-section-title">Теги</div>
            <div id="tags_body" class="af-grid-tags"></div>
            <div id="multitag_body" class="thonlyfortp">
                <button class="af-btn primary" id="multitag" style="width: 100%; margin-top: 10px; padding: 8px; font-size: 12px;">Отправить мультитэг</button>
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
    foundField.innerHTML = "";

    if (!query) return;

    const buttons = [...document.querySelectorAll(".searchSubthemes")].filter(btn => btn.name !== "tagssbtn");

    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(query)) {
            const themePageId = btn.dataset.theme;
            const parentThemeBtn = document.querySelector(`.theme-main-btn[data-page-id="${themePageId}"]`);
            const themeName = parentThemeBtn ? parentThemeBtn.textContent : "Тема";

            const card = document.createElement('div');
            card.className = 'af-found-card';

            const badge = document.createElement('div');
            badge.className = 'af-found-badge';
            badge.textContent = themeName;
            badge.title = themeName;

            const cloneBtn = btn.cloneNode(true);
            cloneBtn.addEventListener('click', () => setTheme(cloneBtn.value));

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