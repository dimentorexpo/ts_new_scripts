/* =========================================================
   TSM Main Menu
   ========================================================= */

const win_addMenu = `
<div class="tsm-menu-container">
    <div class="tsm-menu-head">
        <div class="tsm-menu-brand">
            <span class="tsm-menu-logo">TSM</span>
            <span class="tsm-menu-hotkey" title="Открыть/закрыть меню">Alt + 0</span>
        </div>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" id="hidemainmenu" title="Скрыть меню" aria-label="Скрыть меню">✕</button>
    </div>
    <div id="mainmenu" class="tsm-menu">
        <button type="button" id="openchataddmenu" class="tsm-menu-item">
            <span class="tsm-menu-icon">💬</span>
            <span class="tsm-menu-text">Меню чата</span>
        </button>
        <button type="button" id="openlesinfomenu" class="tsm-menu-item">
            <span class="tsm-menu-icon">ℹ️</span>
            <span class="tsm-menu-text">Инфо комнаты</span>
        </button>
        <button type="button" id="openstudentsmenu" class="tsm-menu-item">
            <span class="tsm-menu-icon">👨‍🎓</span>
            <span class="tsm-menu-text">Ученики (в ЛКП)</span>
        </button>
        <button type="button" id="openexercisesmenu" class="tsm-menu-item tsm-menu-item-sub">
            <span class="tsm-menu-icon">🎯</span>
            <span class="tsm-menu-text">Упражнения</span>
        </button>
        <button type="button" id="VocabularyMenu" class="tsm-menu-item" title="Работа со словарём ученика">
            <span class="tsm-menu-icon">📚</span>
            <span class="tsm-menu-text">Словарь</span>
        </button>
    </div>
    <div id="exercisesmenu" class="tsm-menu" style="display:none;">
        <button type="button" id="backmainmenufromexercises" class="tsm-menu-back">← Упражнения</button>
        <button type="button" id="exercisekysmart" class="tsm-menu-item">
            <span class="tsm-menu-icon">🎓</span>
            <span class="tsm-menu-text">Smartroom</span>
        </button>
        <button type="button" id="exercisesttc" class="tsm-menu-item">
            <span class="tsm-menu-icon">👽</span>
            <span class="tsm-menu-text">TTC</span>
        </button>
        <button type="button" id="exercisesComplect" class="tsm-menu-item">
            <span class="tsm-menu-icon">🛍</span>
            <span class="tsm-menu-text">Комплектации</span>
        </button>
        <button type="button" id="exercisesRevisionFix" class="tsm-menu-item" title="Обновить ревизию слайдов сразу у списка учеников">
            <span class="tsm-menu-icon">🛠</span>
            <span class="tsm-menu-text">Масс-фикс ревизий</span>
        </button>
    </div>
</div>`;

const wintAddMenu = createTSMWindow("AFMS_addMenu", "winTopAddMenu", "winLeftAddMenu", win_addMenu);
wintAddMenu.className = "tsm-window tsm-window-main";

const MENU_EXCLUDED_TAGS = new Set([
    "INPUT", "TEXTAREA", "SELECT", "BUTTON", "A", "LABEL", "OPTION",
    "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI",
    "P", "SPAN", "TD", "TR", "TH", "TBODY", "THEAD", "TABLE",
    "B", "STRONG", "I", "EM", "CODE", "PRE", "MARK", "SMALL", "SVG", "IMG",
    "PATH", "U", "S", "STRIKE", "SUB", "SUP", "TIME", "ABBR", "BLOCKQUOTE",
    "Q", "CITE", "VIM-WORD"
]);

function showMainMenuSection(sectionId) {
    document.getElementById("mainmenu").style.display = sectionId === "mainmenu" ? "" : "none";
    document.getElementById("exercisesmenu").style.display = sectionId === "exercisesmenu" ? "" : "none";
}

function openMainMenu(x, y) {
    showMainMenuSection("mainmenu");
    wintAddMenu.style.display = "block";
    if (x != null && y != null) {
        /* Меню открывается у курсора, но не вылезает за край экрана */
        const width = wintAddMenu.offsetWidth || 260;
        const height = wintAddMenu.offsetHeight || 340;
        wintAddMenu.style.left = `${tsmClamp(x - width / 2, 8, window.innerWidth - width - 8)}px`;
        wintAddMenu.style.top = `${tsmClamp(y + 8, 8, window.innerHeight - height - 8)}px`;
    }
    token = parsePageCookies();
}

function closeMainMenu() {
    wintAddMenu.style.display = "none";
}

document.body.addEventListener("dblclick", (event) => {
    if (MENU_EXCLUDED_TAGS.has(event.target.tagName)) return;
    if (event.target.closest(".tsm-window, .tsm-dialog-overlay, [contenteditable], button, a, input, textarea, select, label")) return;
    if (event.target.closest("b, strong, i, em, code, pre, mark, small, p, span, td, th, li, h1, h2, h3, h4, h5, h6, vim-word, svg, img")) return;
    if (window.getSelection()?.toString().trim()) return;
    openMainMenu(event.clientX, event.clientY);
});

document.body.addEventListener("click", (event) => {
    if (wintAddMenu.style.display !== "none" && !wintAddMenu.contains(event.target)) closeMainMenu();
});

document.addEventListener("keydown", (event) => {
    if (event.altKey && (event.code === "Numpad0" || event.code === "Digit0")) {
        event.preventDefault();
        if (wintAddMenu.style.display === "none") openMainMenu();
        else closeMainMenu();
    }
});

document.getElementById("hidemainmenu").onclick = closeMainMenu;
document.getElementById("openexercisesmenu").onclick = () => showMainMenuSection("exercisesmenu");
document.getElementById("backmainmenufromexercises").onclick = () => showMainMenuSection("mainmenu");

/* Обработчики из других модулей привязываем лениво: main.js грузится первым,
   и функции модулей объявляются позже */
document.getElementById("openchataddmenu").onclick = () => OpenAddChatMenu();
document.getElementById("openlesinfomenu").onclick = () => (typeof OpenLessonInfoMenu === "function" ? OpenLessonInfoMenu() : OpenLessonmInfoMenu());
document.getElementById("openstudentsmenu").onclick = () => OpenStudentsMenu();
document.getElementById("VocabularyMenu").onclick = () => OpenVocabularyMenu();
document.getElementById("exercisekysmart").onclick = () => OpenExercisesSmartroom();
document.getElementById("exercisesttc").onclick = () => OpenExercisesTTC();
document.getElementById("exercisesComplect").onclick = () => OpenExercisesComplect();
document.getElementById("exercisesRevisionFix").onclick = () => OpenRevisionFix();

/* ID текущего пользователя (кэшируется на время жизни страницы) */
let tsmUserIdPromise = null;
function getUserId() {
    if (!tsmUserIdPromise) {
        tsmUserIdPromise = (async () => {
            try {
                const response = await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {
                    credentials: "include",
                    method: "POST"
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return String((await response.json())?.user?.id || "");
            } catch (error) {
                console.error("[TSM] Не удалось получить ID пользователя:", error);
                tsmUserIdPromise = null;
                return "";
            }
        })();
    }
    return tsmUserIdPromise;
}

function addOption(oListbox, text, value) {
    const oOption = document.createElement("option");
    oOption.textContent = text;
    oOption.value = value;
    oListbox.appendChild(oOption);
}
