var win_TestUsers = // описание окна тестовых пользователей
    `<div style="display: flex;">
        <span style="cursor: -webkit-grab; margin:7px;">
            <input id="iduserinfo" placeholder="ID У/П" title="Введите ID У/П для получения информации" class="teststudteachinp darkinputs" autocomplete="off" type="text">
            <button id="openuserinfo" title="Открыть User Info указанного id" class="mainButton teststudteach">🔍</button>
            <br>
            <button id="sidcode" title="При клике ЛКМ генерирует ссылку логинер для входа в учетку с заранее сохраненным ID тестового ученика в настройках и копирует ее в буфер обмена. При клике ПКМ копирует в буфер обмена ID ученика, может пригодиться в админке создания тестовых уроков." class="mainButton teststudteach" style="margin-left:2px">👨‍🎓</button>
            <button id="tidcode" title="При клике ЛКМ генерирует ссылку логинер для входа в учетку с заранее сохраненным ID тестового преподавателя в настройках и копирует ее в буфер обмена. При клике ПКМ копирует в буфер обмена ID преподавателя, может пригодиться в админке создания тестовых уроков." class="mainButton teststudteach">👽</button>
            <button id="TestRooms" class="mainButton teststudteach" title="Открыть окно создания тестовых уроков">🎲</button>
            <button id="link2lessbtn" class="mainButton teststudteach" title="Открыть окно получения ссылки на урок">📟</button>
            <div id="addInfoUser" style="color: white; text-align: center; cursor: -webkit-grab;"></div>
        </span>
    </div>
    `;

const TestUsersdiv = createWindow('TestUsers', 'winTopTestUsers', 'winLeftTestUsers', win_TestUsers);
const addInfoUser = document.getElementById('addInfoUser');
const btnsid = document.getElementById('sidcode');
const btntid = document.getElementById('tidcode');
const idUserInfoInput = document.getElementById('iduserinfo');
const openUserInfoButton = document.getElementById('openuserinfo');

document.getElementById('TestRooms').onclick = getTestRoomsButtonPress;
document.getElementById('link2lessbtn').onclick = getlink2lessButtonPress;

// Универсальная функция обработки действий кнопок
function handleButtonClick(buttonId, storageKey) {
    const userId = localStorage.getItem(storageKey);
    if (!userId) return;
    const button = document.getElementById(buttonId);
    button.classList.add('active');

    getLoginLink(userId).then(() => {
        button.classList.remove('active'); // Убираем класс active
        button.classList.add('successbtn'); // Добавляем successbtn
        setTimeout(() => button.classList.remove('successbtn'), 1000);
    }).catch((error) => {
        console.log('Ошибка: ', error);
        button.classList.remove('active'); // Убираем класс active
        button.classList.add('errorbtn'); // Добавляем errorbtn
        setTimeout(() => button.classList.remove('errorbtn'), 1000);
    });
}

// Копирование ID в буфер обмена с отображением уведомления
function handleContextMenu(event, storageKey, buttonId) {
    event.preventDefault();
    const userId = localStorage.getItem(storageKey);
    const button = document.getElementById(buttonId);
    if (userId) {
        copyToClipboard(userId);
        createAndShowButton('💾 ID cкопировано');
        button.classList.add('successbtn'); // Добавляем successbtn
        setTimeout(() => button.classList.remove('successbtn'), 1000);
    } else {
        alert("Введите ID тестового ученика в настройках ⚙");
    }
}

// Привязка событий к кнопкам
btnsid.addEventListener("click", () => handleButtonClick('sidcode', 'test_stud'));
btnsid.addEventListener("contextmenu", (event) => handleContextMenu(event, 'test_stud', 'sidcode'));

btntid.addEventListener("click", () => handleButtonClick('tidcode', 'test_teach'));
btntid.addEventListener("contextmenu", (event) => handleContextMenu(event, 'test_teach', 'tidcode'));

// Обработка вставки, перетаскивания и фильтрации чисел в поле ввода
function handleInput(event) {
    idUserInfoInput.value = '';
    const pastedValue = (event.clipboardData || event.dataTransfer).getData('text').trim();
    setTimeout(() => {
        if (/^\d+$/.test(pastedValue)) {
            idUserInfoInput.value = pastedValue;
            openUserInfoButton.click();
        }
    }, 0);
}

idUserInfoInput.addEventListener('paste', handleInput);
idUserInfoInput.addEventListener('drop', handleInput);
idUserInfoInput.addEventListener('input', () => onlyNumber(idUserInfoInput));

// Открытие окна User Info
openUserInfoButton.onclick = () => {
    const idforinfo = idUserInfoInput.value.trim();
    if (idforinfo) {
        const serviceElement = document.getElementById('AF_Service');
        if (serviceElement.style.display === 'none') {
            serviceElement.style.display = '';
            document.getElementById('butServ').classList.add('activeScriptBtn');
        }
        document.getElementById('idstudent').value = idforinfo;
        document.getElementById('getidstudent').click();
        idUserInfoInput.value = '';
    }
};

// Установка стиля для TestUsersdiv
const TestUsersdivstyle = (window.location.host === "skyeng.autofaq.ai" && window.location.pathname !== "/login") && localStorage.getItem('disablelpmwindow') !== '1' ? '' : 'none';
setDisplayStyle(TestUsersdiv, TestUsersdivstyle);
