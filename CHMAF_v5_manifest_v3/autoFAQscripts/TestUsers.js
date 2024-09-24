var win_TestUsers = // описание окна тестовых пользователей
    `<div style="display: flex;">
        <span style="cursor: -webkit-grab; margin:7px;">
            <button id="sidcode" title="При клике ЛКМ генерирует ссылку логинер для входа в учетку с заранее сохраненным ID тестового ученика в настройках и копирует ее в буфер обмена. При клике ПКМ копирует в буфер обмена ID ученика, может пригодиться в админке создания тестовых уроков." class="mainButton teststudteach" style="margin-left:2px">👨‍🎓</button>
            <button id="tidcode" title="При клике ЛКМ генерирует ссылку логинер для входа в учетку с заранее сохраненным ID тестового преподавателя в настройках и копирует ее в буфер обмена. При клике ПКМ копирует в буфер обмена ID преподавателя, может пригодиться в админке создания тестовых уроков." class="mainButton teststudteach">👽</button>
            <button id="TestRooms" class="mainButton teststudteach" title="Открыть окно создания тестовых уроков">🎲</button>
            <button id="link2lessbtn" class="mainButton teststudteach" title="Открыть окно получения ссылки на урок">📟</button>
            <div id="voicetext" style="color: bisque; width: 110px; text-align: center;"></div>
            <div id="addInfoUser" style="color: white; text-align: center; cursor: -webkit-grab;"></div>
        </span>
    </div>
    `;

const TestUsersdiv = createWindow('TestUsers', 'winTopTestUsers', 'winLeftTestUsers', win_TestUsers);
let addInfoUser = document.getElementById('addInfoUser');
let btnsid = document.getElementById('sidcode');
let btntid = document.getElementById('tidcode');

document.getElementById('TestRooms').onclick = getTestRoomsButtonPress;
document.getElementById('link2lessbtn').onclick = getlink2lessButtonPress;

function handleButtonClick(buttonId, storageKey) { // Функция для обработки нажатий на кнопки
    const userId = localStorage.getItem(storageKey);
    if (!userId) {
        return;
    }

    toggleButtonState(buttonId, 'active');

    getLoginLink(userId).then(() => {
        toggleButtonState(buttonId, 'active');
        toggleButtonState(buttonId, 'successbtn');
        setTimeout(() => toggleButtonState(buttonId, 'successbtn'), 1000);
    }).catch((error) => {
        console.log('Ошибка: ', error);
        toggleButtonState(buttonId, 'active');
        toggleButtonState(buttonId, 'errorbtn');
        setTimeout(() => toggleButtonState(buttonId, 'errorbtn'), 1000);
    });
}


// Привязка событий к кнопкам
btnsid.addEventListener("click", () => handleButtonClick('sidcode', 'test_stud'));
btnsid.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const userId = localStorage.getItem('test_stud');
    if (userId) {
        copyToClipboard(userId);
        toggleButtonState('sidcode', 'successbtn');
        setTimeout(() => toggleButtonState('sidcode', 'successbtn'), 1000);
    } else {
        alert("Введите ID тестового ученика в настройках ⚙");
    }
});

btntid.addEventListener("click", () => handleButtonClick('tidcode', 'test_teach'));
btntid.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const userId = localStorage.getItem('test_teach');
    if (userId) {
        copyToClipboard(userId);
        toggleButtonState('tidcode', 'successbtn');
        setTimeout(() => toggleButtonState('tidcode', 'successbtn'), 1000);
    } else {
        alert("Введите ID тестового преподавателя в настройках ⚙");
    }
});

// Установка стиля для TestUsersdiv
let TestUsersdivstyle = (window.location.host === "skyeng.autofaq.ai" && window.location.pathname !== "/login") && localStorage.getItem('disablelpmwindow') !== '1' ? '' : 'none';
setDisplayStyle(TestUsersdiv, TestUsersdivstyle);