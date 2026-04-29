/* =========================================================
   TSM Main Menu — NEON GLASS ULTRA Refactored
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

const wintAddMenu = createTSMWindow('AFMS_addMenu', 'winTopAddMenu', 'winLeftAddMenu', win_addMenu);
wintAddMenu.className = 'tsm-window tsm-window-main';

document.querySelector('body').addEventListener('dblclick', (event) => {
    const tags = ["INPUT", "TEXTAREA", "BUTTON", "H1", "H2", "H3", "UL", "LI", "VIM-WORD", "P", "SPAN", "TD", "TR", "TBODY", "THEAD"];
    if (!tags.includes(event.target.tagName)) {
        wintAddMenu.style.display = "block";
        wintAddMenu.style.left = (event.clientX - 120) + "px";
        wintAddMenu.style.top = event.clientY + "px";

        token = Object.fromEntries(document.cookie.split(/; */).map(c => {
            const [key, ...v] = c.split('=');
            return [key, decodeURIComponent(v.join('='))];
        }));
        console.log(token);
    }
});

document.querySelector('body').addEventListener('click', (event) => {
    if (!wintAddMenu.contains(event.target)) {
        wintAddMenu.style.display = "none";
    }
});

document.getElementById('hidemainmenu').onclick = function () {
    wintAddMenu.style.display = 'none';
};

document.onkeydown = function (event) {
    if ((event.altKey && event.code == 'Numpad0') || (event.altKey && event.code == 'Digit0')) {
        if (wintAddMenu.style.display == 'none') {
            wintAddMenu.style.display = '';
            token = Object.fromEntries(document.cookie.split(/; */).map(c => {
                const [key, ...v] = c.split('=');
                return [key, decodeURIComponent(v.join('='))];
            }));
            console.log(token);
        } else {
            wintAddMenu.style.display = 'none';
        }
    }
};

document.getElementById('openstudentsmenu').onclick = function () {
    document.getElementById('mainmenu').style.display = 'none';
};
document.getElementById('openexercisesmenu').onclick = function () {
    document.getElementById('mainmenu').style.display = 'none';
    document.getElementById('exercisesmenu').style.display = '';
};
document.getElementById('backmainmenufromexercises').onclick = function () {
    document.getElementById('mainmenu').style.display = '';
    document.getElementById('exercisesmenu').style.display = 'none';
};

document.getElementById('openchataddmenu').onclick = OpenAddChatMenu;
document.getElementById('exercisekysmart').onclick = OpenExercisesSmartroom;
document.getElementById('exercisesttc').onclick = OpenExercisesTTC;
document.getElementById('exercisesComplect').onclick = OpenExercisesComplect;
document.getElementById('openlesinfomenu').onclick = OpenLessonmInfoMenu;

function checkelementt(a) {
    let elem = document.elementFromPoint(a.clientX, a.clientY);
    if (elem.nodeName != 'BUTTON' && elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA' && elem.nodeName != 'SELECT') {
        return true;
    }
    return false;
}

async function getUserId() {
    try {
        const response = await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {
            credentials: "include",
            method: "POST"
        });
        if (response.ok) {
            const data = await response.json();
            return data?.user?.id || '';
        } else {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
    }
}

function addOption(oListbox, text, value) {
    var oOption = document.createElement("option");
    oOption.appendChild(document.createTextNode(text));
    oOption.setAttribute("value", value);
    oListbox.appendChild(oOption);
}

const copyToClipboardTSM = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function fetchaddchat(userid1, userid2, method) {
    fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
        "headers": {
            "content-type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://vimbox.skyeng.ru/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `\{"userId1":${userid1},"userId2":${userid2}\}`,
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });
}
