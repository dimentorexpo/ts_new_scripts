var win_addMenu = `
<div class="menu-container">
    <span style="cursor: -webkit-grab;">

        <div>
            <button class="hide-btn" id="hidemainmenu">С к р ы т ь</button>
        </div>

        <div id="mainmenu" class="menu-ext" style="display:block;">
            <button id="openchataddmenu" class="menu-item">
                <span class="icon">💬</span>
                <span class="text">Меню чата</span>
            </button>

            <button id="openlesinfomenu" class="menu-item">
                <span class="icon">ℹ</span>
                <span class="text">Инфо комнаты</span>
            </button>

            <button id="openstudentsmenu" class="menu-item">
                <span class="icon">👨‍🎓</span>
                <span class="text">Ученики (в ЛКП)</span>
            </button>

            <button id="openexercisesmenu" class="menu-item">
                <span class="icon">🎯</span>
                <span class="text">Упражнения</span>
            </button>

            <button id="VocabularyMenu" class="menu-item" title="Открывает меню для работы со словарем">
                <span class="icon">📚</span>
                <span class="text">Словарь</span>
            </button>
        </div>

        <div id="exercisesmenu" class="menu-ext" style="display:none;">
            <button id="exercisekysmart" class="menu-item">
                <span class="icon">🎓</span>
                <span class="text">Smartroom</span>
            </button>

            <button id="exercisesttc" class="menu-item">
                <span class="icon">👽</span>
                <span class="text">TTC</span>
            </button>

            <button id="exercisesComplect" class="menu-item">
                <span class="icon">🛍</span>
                <span class="text">Комплектации</span>
            </button>

            <button id="backmainmenufromexercises" class="menu-item">
                <span class="icon">🔙</span>
                <span class="text">Back</span>
            </button>
        </div>

    </span>
</div>
`;


const wintAddMenu = createTSMWindow('AFMS_addMenu', 'winTopAddMenu', 'winLeftAddMenu', win_addMenu);
wintAddMenu.className = 'wintInitialize';

document.querySelector('body').addEventListener('dblclick', (event) => {
    let tags = ["INPUT", "TEXTAREA", "BUTTON", "H1", "H2", "H3", "UL", "LI", "VIM-WORD", "P", "SPAN"];
    if (!tags.includes(event.target.tagName)) {
        wintAddMenu.style.display = "block";
        wintAddMenu.style.left = (event.clientX - 120) + "px";
        wintAddMenu.style.top = event.clientY + "px";

        token = Object.fromEntries(document.cookie.split(/; */).map(c => {
            const [key, ...v] = c.split('=');
            return [key, decodeURIComponent(v.join('='))];
        }));
        console.log(token)
    }
});

document.querySelector('body').addEventListener('click', (event) => {
    if (!wintAddMenu.contains(event.target)) {
        wintAddMenu.style.display = "none";
    }
});

document.getElementById('hidemainmenu').onclick = function () {
    wintAddMenu.style.display = 'none';
}

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
}

document.getElementById('openstudentsmenu').onclick = function () {
    document.getElementById('mainmenu').style.display = 'none'
}
document.getElementById('openexercisesmenu').onclick = function () {
    document.getElementById('mainmenu').style.display = 'none'
    document.getElementById('exercisesmenu').style.display = ''
}

document.getElementById('backmainmenufromexercises').onclick = function () {
    document.getElementById('mainmenu').style.display = ''
    document.getElementById('exercisesmenu').style.display = 'none'
}

document.getElementById('openchataddmenu').onclick = OpenAddChatMenu;
document.getElementById('exercisekysmart').onclick = OpenExercisesSmartroom;
document.getElementById('exercisesttc').onclick = OpenExercisesTTC;
document.getElementById('exercisesComplect').onclick = OpenExercisesComplect;
document.getElementById('openlesinfomenu').onclick = OpenLessonmInfoMenu;

function checkelementt(a) { // проверка на какой элемент нажали
    let elem = document.elementFromPoint(a.clientX, a.clientY)

    if (elem.nodeName != 'BUTTON' && elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA' && elem.nodeName != 'SELECT') {
        return true;
    }
    return false;
}

async function getUserId() { // получаем Id пользователя
    try {
        const response = await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {
            credentials: "include",
            method: "POST"
        });

        if (response.ok) {
            const data = await response.json();
            const userId = data?.user?.id || '';
            return userId;
        } else {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
        //        return '';
    }
}

function addOption(oListbox, text, value) {  //функция добавления опции в список
    var oOption = document.createElement("option");
    oOption.appendChild(document.createTextNode(text));
    oOption.setAttribute("value", value);
    oListbox.appendChild(oOption);
}

const copyToClipboardTSM = str => { // функция копирования в буфер обмена
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function fetchaddchat(userid1, userid2, method) { //вспомогательная функция просто добавления чата мекжду пользователям
    fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
        "headers": {
            "content-type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://vimbox.skyeng.ru/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `{\"userId1\":${userid1},\"userId2\":${userid2}}`,
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });
}