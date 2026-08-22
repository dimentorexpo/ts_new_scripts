/* =========================================================
   TSM Main Menu
   ========================================================= */

const win_addMenu = `
<div class="tsm-menu-container">
    <span style="cursor: -webkit-grab;">
        <div>
            <button class="tsm-btn tsm-btn-hide" id="hidemainmenu">С к р ы т ь</button>
        </div>
        <div id="mainmenu" class="tsm-menu" style="display:block;">
            <button id="openchataddmenu" class="tsm-menu-item">
                <span class="tsm-menu-icon">💬</span>
                <span class="tsm-menu-text">Меню чата</span>
            </button>
            <button id="openlesinfomenu" class="tsm-menu-item">
                <span class="tsm-menu-icon">ℹ</span>
                <span class="tsm-menu-text">Инфо комнаты</span>
            </button>
            <button id="openstudentsmenu" class="tsm-menu-item">
                <span class="tsm-menu-icon">👨‍🎓</span>
                <span class="tsm-menu-text">Ученики (в ЛКП)</span>
            </button>
            <button id="openexercisesmenu" class="tsm-menu-item">
                <span class="tsm-menu-icon">🎯</span>
                <span class="tsm-menu-text">Упражнения</span>
            </button>
            <button id="VocabularyMenu" class="tsm-menu-item" title="Открывает меню для работы со словарем">
                <span class="tsm-menu-icon">📚</span>
                <span class="tsm-menu-text">Словарь</span>
            </button>
        </div>
        <div id="exercisesmenu" class="tsm-menu" style="display:none;">
            <button id="exercisekysmart" class="tsm-menu-item">
                <span class="tsm-menu-icon">🎓</span>
                <span class="tsm-menu-text">Smartroom</span>
            </button>
            <button id="exercisesttc" class="tsm-menu-item">
                <span class="tsm-menu-icon">👽</span>
                <span class="tsm-menu-text">TTC</span>
            </button>
            <button id="exercisesComplect" class="tsm-menu-item">
                <span class="tsm-menu-icon">🛍</span>
                <span class="tsm-menu-text">Комплектации</span>
            </button>
            <button id="backmainmenufromexercises" class="tsm-menu-item">
                <span class="tsm-menu-icon">🔙</span>
                <span class="tsm-menu-text">Back</span>
            </button>
        </div>
    </span>
</div>`;

const wintAddMenu = createTSMWindow("AFMS_addMenu", "winTopAddMenu", "winLeftAddMenu", win_addMenu);
wintAddMenu.className = "tsm-window tsm-window-main";

const MENU_EXCLUDED_TAGS = ["INPUT", "TEXTAREA", "BUTTON", "H1", "H2", "H3", "UL", "LI", "VIM-WORD", "P", "SPAN", "TD", "TR", "TBODY", "THEAD"];

document.querySelector("body").addEventListener("dblclick", (event) => {
    if (!MENU_EXCLUDED_TAGS.includes(event.target.tagName)) {
        wintAddMenu.style.display = "block";
        wintAddMenu.style.left = event.clientX - 120 + "px";
        wintAddMenu.style.top = event.clientY + "px";
        token = parsePageCookies();
    }
});

document.querySelector("body").addEventListener("click", (event) => {
    if (!wintAddMenu.contains(event.target)) {
        wintAddMenu.style.display = "none";
    }
});

document.getElementById("hidemainmenu").onclick = function () {
    wintAddMenu.style.display = "none";
};

document.addEventListener("keydown", function (event) {
    if ((event.altKey && event.code === "Numpad0") || (event.altKey && event.code === "Digit0")) {
        if (wintAddMenu.style.display === "none") {
            wintAddMenu.style.display = "";
            token = parsePageCookies();
        } else {
            wintAddMenu.style.display = "none";
        }
    }
});

function switchMenu(fromId, toId) {
    document.getElementById(fromId).style.display = "none";
    document.getElementById(toId).style.display = "";
}

document.getElementById("openexercisesmenu").onclick = () => switchMenu("mainmenu", "exercisesmenu");
document.getElementById("backmainmenufromexercises").onclick = () => switchMenu("exercisesmenu", "mainmenu");

document.getElementById("openchataddmenu").onclick = OpenAddChatMenu;
document.getElementById("exercisekysmart").onclick = OpenExercisesSmartroom;
document.getElementById("exercisesttc").onclick = OpenExercisesTTC;
document.getElementById("exercisesComplect").onclick = OpenExercisesComplect;
document.getElementById("openlesinfomenu").onclick = OpenLessonmInfoMenu;

async function getUserId() {
    try {
        const response = await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {
            credentials: "include",
            method: "POST"
        });
        if (!response.ok) throw new Error(`Failed to fetch data. Status: ${response.status}`);
        return (await response.json())?.user?.id || "";
    } catch (error) {
        console.error(error);
        return "";
    }
}

function addOption(oListbox, text, value) {
    const oOption = document.createElement("option");
    oOption.appendChild(document.createTextNode(text));
    oOption.setAttribute("value", value);
    oListbox.appendChild(oOption);
}
