﻿//Импортировал с content.js
const message = {
    question: 'get-extension-id'
}
chrome.runtime.sendMessage(message, (result) => {
    if (localStorage.getItem('ext_id') == null)
        localStorage.setItem('ext_id', result)
    else localStorage.setItem('ext_id', result)
})
//

// Функция для получения данных из хранилища
async function getStorageData(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
}

let pldata;
let afopername; // переменная фамилии, имени оператора при переборе общего списка операторов
let foundarr;
let flagsearch;
let operchatsdata;
let isChatOnOperator = false;
var audio // переменнай для проигрывания звука при поступлении нового чата
var soundintervalset; //интервал между проигрыванием звука
let flagusertype;
let chatneraspcount; // переменная для получения колчества нераспределенных чатов в очереди
let chattpquecount; // переменная для получения колчества нераспределенных чатов в очереди тематики ТП v1
idk = 0
var tmrs = []
var timeStart = new Date()
let template_flag = 0
let template_flag2 = 0
let word_text = ""
let template_text = ""
let flagggg = 0;
let getidusrteachreq;
let getidusrstud;
let getidusrsteach;
let getservidst;
var templatesAF = [];
var bool = 0;
var table;
var opsection = ''; // глобальная переменная отдела оператора
var operatorId = ""; //глобальная переменная после получения ID operator , который использует расширение и авторизован в свой профиль
var operatorsarray = []; //массив операторов , который потом пригодится для других функций
var flagLangBut = 0;
var modulesarray = [];
var chatsArray = [];
var scriptAdr = localStorage.getItem('scriptAdr');

// Словарь для перевода предметов и направлений
const subjectTranslations = {
    // homeschooling и lc_exam
    "algebra": "Алгебра",
    "basemath": "Математика",
    "biology": "Биология",
    "chemistry": "Химия",
    "computer": "Информатика",
    "english": "Английский",
    "geography": "География",
    "geometry": "Геометрия",
    "history": "История",
    "literature": "Литература",
    "math": "Математика",
    "physics": "Физика",
    "russian": "Русский язык",
    "social": "Обществознание"
};

// Словарь для перевода форматов обучения
const formatTranslations = {
    "webinar": "ВЕБИНАР",
    "f2g": "F2G",
    "coach": "Практика с коучем",
    "f2f": "F2F",
    "life": "Разговорные Клубы",
    "talks": "Talks"
};

localStorage.setItem('tpflag', localStorage.getItem('tpflag') || 'ТП');

localStorage.setItem('extentiontheme', localStorage.getItem('extentiontheme') || 'light');

var exttheme = localStorage.getItem('extentiontheme') === 'dark' ? 'darkinputs' : 'lightinputs';
var selectedinpth = exttheme === 'lightinputs' ? 'calendarmyinputslight' : 'calendarmyinputsdark';
var otherinpth = exttheme === 'lightinputs' ? 'othercalendarlight' : 'othercalendardark';
var selecttheme = exttheme === 'lightinputs' ? 'lightopts' : 'darkopts';
var menutheme = exttheme === 'lightinputs' ? 'menubarstylelight' : 'menubarstyledark';
var rightPanelBtn = exttheme === 'lightinputs' ? 'rightPanelBtnlight' : 'rightPanelBtndark';
var menubtns = exttheme === 'lightinputs' ? 'menubtnsstylelight' : 'menubtnsstyledark';

function checkcalendaricon() {
    if (exttheme === 'darkinputs' && localStorage.getItem('changesymtemicons') == '0') {
        applyCalendarIconInversion();
    }
    else {
        removeCalendarIconInversion()
    }
}
// Функция для добавления инвертирования значка календаря
function applyCalendarIconInversion() {
    const css = [
        // Инвертирование для календаря (input[type='date'])
        "input[type='date']::-webkit-calendar-picker-indicator {",
        "    filter: invert(1) !important;",
        "}",
        // Инвертирование для чекбоксов (input[type='checkbox'])
        "input[type='checkbox'] {",
        "    filter: invert(1) !important;",
        "}",
        // Инвертирование для радиокнопок (input[type='radio'])
        "input[type='radio'] {",
        "    filter: invert(1) !important;",
        "}",
        // Инвертирование для ползунков (input[type='range'])
        "input[type='range']::-webkit-slider-thumb,",
        "input[type='range']::-moz-range-thumb {",
        "    filter: invert(1) !important;",
        "}"
    ].join("\n");

    // Создаем стиль и добавляем его в head
    const styleElement = document.createElement("style");
    styleElement.textContent = css;
    styleElement.id = 'calendarIconInversion'; // Уникальный ID для поиска и удаления
    document.head.appendChild(styleElement);
}

// Функция для удаления инвертирования значка календаря
function removeCalendarIconInversion() {
    const styleElement = document.getElementById('calendarIconInversion');
    if (styleElement) {
        styleElement.remove();
    }
}

// Применяем инвертирование значка календаря, если темная тема активна
checkcalendaricon();

var win_mainmenu = // описание кнопок меню
    `<div>
        <div id="servDsk" class="onlyfortp ${menubtns}">🛠ServiceDesk</div>
        <div id="JiraOpenForm" class="onlyfortp ${menubtns}">🔎Jira Search</div>
        <div id="crmopersstatuses" class="onlyfortp ${menubtns}">🧮Статусы CRM2</div>
        <div id="butMarks" class="${menubtns}">🎭 Оценки</div>
        <div id="smartroomform" class="onlyfortp ${menubtns}">🦐Smartroom</div>
        <div id="butLessonInfo" class="${menubtns}">🎓 Lesson Info</div>
		<div id="butFrozeChat" class="${menubtns}">❄ Auto Respond</div>
        <div id="radioPlayer" class="${menubtns}">📻 Radio</div>
        <div id="buttonGetStat" class="${menubtns}">📊 Статистика</div>
		<div id="buttonGetQueue" class="${menubtns}">🚧 Очередь</div>
    </div>`;

flag = 0
str = localStorage.getItem('sound_str');
if (str !== null && str !== "")
    audio = new Audio(str);
else
    audio = new Audio("https://dimentorexpo.github.io/Sounds/msg.mp3");

Object.keys(localStorage).forEach(function (key) { // чистка localstorage от мусора , когда АФ на каждый лог добавляет запись вида SMART_TABLE... или при работе с архивом
    if (/^(SMART_TABLE.)/.test(key)) {
        localStorage.removeItem(key);
    }

    if (/^(messageContent.)/.test(key)) {
        localStorage.removeItem(key);
    }
});

localStorage.setItem('SMART_TABLE_SORTED_INFO(/tickets/archive)', '{\"columnKey\":\"ts\",\"order\":\"descend\"}')

function setDisplayStyle(element, value) { // функция изменения отображения
    element.style.display = value;
}

function createWindow(id, topKey, leftKey, content) { // Функция для создания окна и настройки стилей
    const windowElement = document.createElement('div');
    document.body.append(windowElement);

    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    if (id === 'TestUsers') {
        windowElement.classList.add('onlyfortp', 'testuserwindow');
    } else if (id === 'AF_addChatMenu') {
        windowElement.classList.add('wintInitializeChat');
    } else {
        windowElement.classList.add('extwindows');
    }

    windowElement.style = `top: ${storedTop}px; left: ${storedLeft}px; display: none;`;
    if (id === 'AF_Timetable' || id === 'AF_Grabber' || id === 'AF_GrList' || id === 'AF_BankCheck' || id === 'AF_SpecCommWindow') {
        windowElement.style.zIndex = '1100000'; // Установка z-index для специфических окон
    }
    windowElement.setAttribute('id', id);
    windowElement.innerHTML = content;

    windowElement.onmousedown = function (event) {
        if (checkelementtype(event)) {
            let startX = event.clientX;
            let startY = event.clientY;
            let elemLeft = windowElement.offsetLeft;
            let elemTop = windowElement.offsetTop;

            function onMouseMove(event) {
                let deltaX = event.clientX - startX;
                let deltaY = event.clientY - startY;

                // Вычисляем новые координаты с учетом границ экрана
                let newLeft = elemLeft + deltaX;
                let newTop = elemTop + deltaY;

                // Ограничения по ширине экрана
                if (newLeft < 0) {
                    newLeft = 0;
                } else if (newLeft + windowElement.offsetWidth > window.innerWidth) {
                    newLeft = window.innerWidth - windowElement.offsetWidth;
                }

                // Ограничения по высоте экрана
                if (newTop < 0) {
                    newTop = 0;
                } else if (newTop + windowElement.offsetHeight > window.innerHeight) {
                    newTop = window.innerHeight - windowElement.offsetHeight;
                }

                windowElement.style.left = `${newLeft}px`;
                windowElement.style.top = `${newTop}px`;

                localStorage.setItem(topKey, String(newTop));
                localStorage.setItem(leftKey, String(newLeft));
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mouseleave', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('mouseleave', onMouseUp);
        }
    };


    return windowElement;
}

function hideWindowOnDoubleClick(id) { // Функция для скрытия окна по двойному клику
    if (localStorage.getItem('dblhidewindow') == '0') {
        const windowElement = document.getElementById(id);
        windowElement.ondblclick = function (a) {
            if (checkelementtype(a)) {
                setDisplayStyle(windowElement, 'none');
            }
        };
    }
}

function hideWindowOnClick(windowId, buttonId) { // Функция для скрытия окна по клику на кнопку
    const windowElement = document.getElementById(windowId);
    const buttonElement = document.getElementById(buttonId);

    buttonElement.onclick = function () {
        setDisplayStyle(windowElement, 'none');
    };
}

// Блок горячих клавиш
const API_ENDPOINT = 'https://skyeng.autofaq.ai/api/reason8/operator/status';
const fetchOptions = {
    headers: {
        'content-type': 'application/json',
    },
    referrer: 'https://skyeng.autofaq.ai/tickets/archive',
    referrerPolicy: 'strict-origin-when-cross-origin',
    body: '',
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
};

function changeStatus(status) { // функция изменения статуса оператора
    fetchOptions.body = `{ "command": "DO_SET_OPERATOR_STATUS", "status": "${status}", "source": "Operator" }`;
    fetch(API_ENDPOINT, fetchOptions)
        .then((res) => {
            console.log(`Status changed to ${status}`);
        })
        .catch((err) => {
            console.log(err);
        });
}

if (window.location.host === "skyeng.autofaq.ai" && window.location.pathname !== "/login") {
    document.onkeydown = (event) => {
        if (event.altKey && event.code === 'KeyO') { // горячие клавиши для смены статуса в Оффлайн
            changeStatus('Offline');
        } else if (event.altKey && event.code === 'KeyI') { // горячие клавиши для смены статуса в Занят
            changeStatus('Busy');
        } else if (event.altKey && event.code === 'KeyT') { // горячие клавиши тестового чата
            const currentStatus = localStorage.getItem('trigertestchat');
            const newStatus = currentStatus === '0' ? '1' : '0';
            localStorage.setItem('trigertestchat', newStatus);
        }
    };
}

// Конец блока горячих клавиш

function onlyNumber(object) { // функция для разрешения ввода только цифр и знака -
    object.value = object.value.replace(/[^0-9-]/g, '');
}

function onlyNumbers(object) { // функция для разрешения ввода только цифр
    object.value = object.value.replace(/[^0-9]/g, '');
}

function onlyNumbersAndComma(object) { // функция для разрешения ввода только цифр и запятой
    object.value = object.value.replace(/[^0-9,]/g, '');
}

function noDoubts(object) { // функция для разрешения ввода только английских и русских букв без запрещенных символов
    object.value = object.value.replace(/["'\\]/gi, '');
}

function getGblToken() { // получение токена глобал
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["token_global"], function (result) {
            resolve(result.token_global);
        });
    });
}

async function whoAmI() {
    const tokenis = document.cookie.match(/jwt=(.*)/);
    if (tokenis && tokenis.length > 1) {
        const token = tokenis[1];

        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        operatorId = JSON.parse(jsonPayload).user.id;

        const response = await fetch('https://skyeng.autofaq.ai/api/operators/statistic/currentState', {
            credentials: 'include'
        });
        const data = await response.json();
        operatorsarray = data.onOperator;

        const operator = operatorsarray.find(s => s.operator !== null && operatorId && s.operator.id === operatorId);
        if (operator) {
            afopername = operator.operator.fullName;
            opsection = operator.operator.fullName.split('-')[0];
            return true;
        }
    }
    console.log('JWT token not found or operator not found');
    return false;

    let test;
    test = getGblToken()
    console.log(test)
}

function timerHideButtons() {
    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');

    if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc) {
            const modalMasks = iframeDoc.getElementsByClassName('mantine-Modal-root')[0];
            const modalContent = iframeDoc.getElementsByClassName('mantine-Modal-header')[0];
            const modalClose = iframeDoc.getElementsByClassName('mantine-Modal-close')[0];
            const Hidebtn = iframeDoc.getElementById('maskBackHide');

            if (modalMasks && modalContent && modalClose && !Hidebtn) {
                modalContent.insertBefore(maskBackHide, modalClose);
            }
        }
    }
}

function prepTp() {
    // Кэшируем часто используемые элементы
    const rightPanel = document.getElementById('rightPanel');
    const AF_Service = document.getElementById('AF_Service');

    // Фабрика для создания кнопок
    const createButton = ({ id, innerHTML, title, classes, onClick }) => {
        const button = document.createElement('button');
        button.id = id;
        button.innerHTML = innerHTML;
        button.title = title || '';
        button.className = ['onlyfortp', rightPanelBtn, 'mainButton'].concat(classes || []).join(' ');
        button.onclick = onClick;
        return button;
    };

    // Создаем кнопки через фабрику
    const buttons = [
        createButton({
            id: 'datsyCalendar',
            innerHTML: '📅',
            title: 'Открывает календарь Datsy',
            onClick: getdatsyCalendarButtonPress
        }),
        createButton({
            id: 'butServ',
            innerHTML: '⚜',
            onClick: function () {
                const isVisible = AF_Service.style.display !== 'none';
                AF_Service.style.display = isVisible ? 'none' : '';
                this.classList.toggle('activeScriptBtn', !isVisible);
            }
        }),
        createButton({
            id: 'knowledgeCenter',
            innerHTML: '💡',
            title: 'Открывает базу знаний решений неполадок',
            onClick: getknowledgeCenterButtonPress
        }),
        createButton({
            id: 'taskBut',
            innerHTML: '🛠',
            onClick: gettaskButButtonPress
        })
    ];

    // Добавляем все кнопки за один раз
    rightPanel.append(...buttons);

    // Отложенная инициализация
    setTimeout(() => rightPanel.appendChild(maskBack), 5000);

    // Таймеры
    flagLangBut = 1;
    setInterval(timerHideButtons, 500);

    // Обработка страницы логов
    if (location.pathname.split('/')[1] === "logs") {
        const emptyElement = document.querySelector('.ant-empty-description');
        if (emptyElement?.textContent === "Нет данных") {
            const parent = document.querySelector('.ant-table-title > div');
            if (!parent) return;

            const btnOpenInChatHis = createButton({
                innerHTML: '☢️',
                onClick: () => {
                    const chatHis = document.getElementById('AF_ChatHis');
                    if (chatHis.style.display === 'none') {
                        document.getElementById('opennewcat')?.click();
                    }
                    document.getElementById('hashchathis').value = location.pathname.split('/')[2];
                    btn_search_history.click();
                }
            });

            btnOpenInChatHis.style.cssText = 'width:30px; height:30px; margin-left:5px; font-size:16px; cursor:pointer';

            // Безопасная вставка кнопки
            if (parent.children.length >= 3) {
                parent.insertBefore(btnOpenInChatHis, parent.children[3]);
            }
        }
    }
}

function prepKC() { //функция подготовки расширения КЦ
    const languageSwitcher = document.querySelector('.user_menu-language_switcher');

    setDisplayStyle(languageSwitcher, localStorage.getItem('disablelngpmwindow') === '1' ? 'none' : '');

    let needtohide = Array.from(document.getElementsByClassName('onlyfortp'));
    needtohide.forEach(e => setDisplayStyle(e, 'none'));

    let needtoopen = Array.from(document.getElementsByClassName('onlyforkc'));
    needtoopen.forEach(e => setDisplayStyle(e, ''));

    flagLangBut = 1
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.log('Failed to copy text: ', err);
    });
}

function maxLengthCheck(object) { // функция ограничения кол-ва символов в полях
    if (object.value.length > object.maxLength)
        object.value = object.value.slice(0, object.maxLength)
}

function checkMinMaxValue(input) {     // функция првоерки находится ли значение вводимые значения в допустимом диапазоне
    const minValue = parseInt(input.min, 10);
    const maxValue = parseInt(input.max, 10);
    let currentValue = parseInt(input.value, 10);

    if (currentValue < minValue) {
        input.value = minValue;
    } else if (currentValue > maxValue) {
        input.value = maxValue;
    }
}

function checkelementtype(a) { // проверка на какой элемент нажали для выполнения перетягивания Drag'n'Drop, убрал && elem.nodeName != 'INPUT'
    let elem = document.elementFromPoint(a.clientX, a.clientY)

    if (elem.className == 'teststudteachinp' || elem.className == "teststudteachinp darkinputs") { // делает возможным перетягивать элемент с этим классом, по аналогии можно для других элементов сделать
        return true;
    }

    if (elem.nodeName != 'BUTTON' && elem.nodeName != 'LABEL' && elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA' && elem.nodeName != 'SELECT' & elem.nodeName != 'P' && elem.className != 'checkbox-audio-switch' && elem.className != 'checkbox-refresh-switch' && elem.className != 'srvhhelpnomove' && elem.className != 'rowOfChatGrabbed' && elem.id !== 'CSATFilterField' && elem.id !== 'AgregatedDataThemes' && elem.nodeName !== 'TABLE' && elem.nodeName !== 'TH' && elem.nodeName !== 'TR' && elem.id !== 'AgregatedDataOut' && elem.nodeName !== 'CANVAS' && elem.id !== "ToolsPanel" && elem.id !== "ProblemsSolution") {
        return true;
    }
    return false;
}

async function sendComment(txt, activeConvId) { // Функция отправки комментария
    var values = await getInfo(0);
    var adr = values[0];
    var adr1 = activeConvId ? activeConvId : values[1];
    var uid = values[2];
    var txt2 = txt.split('\n').join('\\n');
    txt2 = txt2.split("\"").join("\\\""); // Обратите внимание: переопределение переменной без 'var' для избежания повторного объявления
    resetFlags();
    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
        "headers": {
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
        },
        "body": `------WebKitFormBoundaryH2CK1t5M3Dc3ziNW\r\nContent-Disposition: form-data; name="payload"\r\n\r\n{\"sessionId\":\"${uid}\",\"conversationId\":\"${adr1}\",\"text\":\"${txt2}\",\"isComment\":true}\r\n------WebKitFormBoundaryH2CK1t5M3Dc3ziNW--\r\n`,
        "method": "POST",
        "credentials": "include"
    });
}

function resetFlags() { //функция обнуления флагов
    template_flag = 0
    template_flag2 = 0
}

function newTaggg(tagName) { //функция добавления тега в чат, но надо потом искать где используется
    let chatId = getChatId();

    if (chatId) {
        fetch("https://skyeng.autofaq.ai/api/conversation/" + chatId + "/payload", {
            "headers": {
                "content-type": "application/json",
            },
            "body": "{\"conversationId\":\"" + chatId + "\",\"elements\":[{\"name\":\"tags\",\"value\":[\"" + tagName + "\"]}]}",
            "method": "POST",
            "credentials": "include"
        });
    }
}

function screenshots() {  //просмотр и трансформация скриншотов в активном чате
    if (opsection == "ТП") {
        // Select the expert-chat-display-inner element
        const expertChatDisplayInner = document.getElementsByClassName('expert-chat-display-inner')[0];

        // If expert-chat-display-inner exists, use it to get the children elements
        let children;
        if (expertChatDisplayInner) {
            children = expertChatDisplayInner.children;
        }
        // If expert-chat-display-inner does not exist, select the chat-messages element and use it to get the children elements
        else {
            const chatMessages = document.getElementsByClassName('chat-messages')[0];
            if (!chatMessages) {
                return;
            }
            children = chatMessages.children;
        }

        // Iterate over the children elements
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.textContent.includes('vimbox-resource') || child.textContent.includes('math-prod') || child.textContent.includes('communications.skyeng.ru')) {
                // Get all the links in the child element
                const links = child.querySelectorAll('a');

                // Iterate over the links
                for (let j = 0; j < links.length; j++) {
                    const link = links[j];
                    if (!link.hasAttribute('data-lightbox')) {
                        // Create the img and a elements
                        const img = document.createElement('img');
                        img.style.width = '100px';
                        const alink = document.createElement('a');
                        alink.setAttribute('data-lightbox', 'imgs');
                        alink.append(img);
                        img.src = link.href;
                        img.alt = 'ПКМ-Сохранить ссылку как';
                        alink.href = img.src;
                        link.replaceWith(alink);
                    }
                }
            }
        }
    }
}

function addOption(oListbox, text, value) {  //функция добавления опции в список
    var oOption = document.createElement("option");
    oOption.appendChild(document.createTextNode(text));
    oOption.setAttribute("value", value);
    oListbox.appendChild(oOption);
}

async function move_again_AF() { //с АФ шняга там стили шмили скрипта отображение отправку сообщений
    getText();
    let whoAmISuccess = await whoAmI();
    while (!whoAmISuccess) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Ожидание секунду перед повторным вызовом
        whoAmISuccess = await whoAmI();
    }
    const data = await getStorageData(['TS_addr', 'KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']); // Получаем данные из хранилища

    // Присваиваем данные константам
    const TS_addr = data.TS_addr;
    const KC_addr = data.KC_addr;
    const TP_addr = data.TP_addr;
    const KC_addrRzrv = data.KC_addrRzrv;
    const TP_addrRzrv = data.TP_addrRzrv;

    let sidePanel = document.createElement('div') // добавляем невидимую боковую панель, на которой будем размещать кнопки
    sidePanel.id = "rightPanel"
    sidePanel.style = 'position: fixed; top: 110px; right: 22px; z-index: 1000000; width: 40px; font-size: 22px; cursor: pointer; transition: all 0.5s ease;'
    document.body.append(sidePanel)

    let ScriptBut = document.createElement('button');
    ScriptBut.id = 'scriptBut';
    ScriptBut.innerHTML = "🧩";
    ScriptBut.classList.add(rightPanelBtn, 'mainButton')
    ScriptBut.onclick = function () {
        if (document.getElementById('AF_helper').style.display != 'flex') {
            document.getElementById('AF_helper').style.display = 'flex'
            this.classList.add('activeScriptBtn')
        } else {
            document.getElementById('AF_helper').style.display = 'none'
            this.classList.remove('activeScriptBtn')
        }

    }
    document.getElementById('rightPanel').appendChild(ScriptBut) // добавляем на панель кнопку для открытия окна с шаблонами

    let butThemes = document.createElement('button')
    butThemes.id = "themes"
    butThemes.innerHTML = "📚"
    butThemes.title = "[Темы] - кнопка открывающая окно с темами и тегами"
    butThemes.classList.add(rightPanelBtn, 'mainButton')
    document.getElementById('rightPanel').appendChild(butThemes)
    document.getElementById('themes').onclick = getThemesButtonPress;

    let MainMenuBtn = document.createElement('button')
    MainMenuBtn.textContent = "👺"
    MainMenuBtn.id = 'MainMenuBtn'
    MainMenuBtn.title = '[Меню] - По клику открывает список инструментов необходимых для работы'
    MainMenuBtn.classList.add(rightPanelBtn, 'mainButton')
    MainMenuBtn.onclick = function () {
        if (document.getElementById('idmymenu').style.display == 'none') {
            document.getElementById('idmymenu').style.display = ''
            this.classList.add('activeScriptBtn')
        } else {
            document.getElementById('idmymenu').style.display = 'none'
            this.classList.remove('activeScriptBtn')
        }
    }
    document.getElementById('rightPanel').appendChild(MainMenuBtn) // добавляем на панель кнопку Меню, которая содержит в себе при клики пункты подменю

    let menubar = document.createElement('div')
    menubar.style = 'display:none;';
    menubar.classList.add('menubarstyle', menutheme);
    menubar.id = 'idmymenu';
    menubar.innerHTML = win_mainmenu;
    document.getElementById('rightPanel').appendChild(menubar)
    document.getElementById('servDsk').onclick = getservDskPress;
    document.getElementById('JiraOpenForm').onclick = getJiraOpenFormPress;
    document.getElementById('crmopersstatuses').onclick = getcrmopersstatusesButtonPress;
    document.getElementById('butMarks').onclick = getbutMarksButtonPress;
    document.getElementById('smartroomform').onclick = getsmartroomformButtonPress;
    document.getElementById('butLessonInfo').onclick = getbutLessonInfoButtonPress;
    document.getElementById('radioPlayer').onclick = getradioPlayerButtonPress;
    document.getElementById('buttonGetStat').onclick = getbuttonGetStatButtonPress;
    document.getElementById('butFrozeChat').onclick = getbutFrozeChatButtonPress;
    document.getElementById('buttonGetQueue').onclick = getQueuePress;

    let openchhis = document.createElement('button')
    openchhis.innerHTML = '☢'
    openchhis.id = 'opennewcat'
    openchhis.title = 'Открывает виджет просмотра истории чатов'
    openchhis.classList.add(rightPanelBtn, 'mainButton')
    document.getElementById('rightPanel').appendChild(openchhis) // добавляем на панель кнопку открытия формы просмотра истории чата
    document.getElementById('opennewcat').onclick = getopennewcatButtonPress;

    if ((scriptAdr == TP_addr || scriptAdr == TP_addrRzrv) && opsection != 'ТП' && opsection != 'ТП ОС') {
        localStorage.setItem('scriptAdr', KC_addr)
        localStorage.setItem('hideTaskWindow', '0')
        location.reload()
    } else if (scriptAdr != TP_addr && scriptAdr != TP_addrRzrv && localStorage.getItem('hideTaskWindow') == 1) {
        localStorage.setItem('hideTaskWindow', '0')
    }

    if (scriptAdr != TP_addr && scriptAdr != TP_addrRzrv) {
        prepKC()
    } else {
        prepTp()
    }

    if (scriptAdr == TP_addrRzrv || scriptAdr == KC_addrRzrv) {
        document.getElementById('pages').style.background = 'red'
        document.getElementById('pages').title = 'Включены резервные шаблоны, если в АФ нет сбоя в работе Баз знаний - переключи на обычные шаблоны'
        languageAF.addEventListener('click', function () {
            if (document.getElementById('pages').style.background != 'red') {
                document.getElementById('pages').style.background = 'red'
            }
        })
    }

    window.onkeydown = function (e) {
        if (e.key == 'Control') {
            bool = 1;
        }
    }
    window.onkeyup = function (e) {
        if (e.key == 'Control') {
            bool = 0;
        }
    }
    setInterval(checkchats, 1000);
}

function closeTerms() { // функция автоподтверждения условий пользования при входе в ЛКП
    if (document.URL == 'https://new-teachers.skyeng.ru/') {
        for (let i = 0; i < document.getElementsByClassName('terms-popup-accept-button').length; i++) {
            document.getElementsByClassName('terms-popup-accept-button')[i].click()
        }
    }
}

//Подключаем скрипт App Script с гугл таблиц, где содержаться шщаблоны, которыми пользуемся
if (localStorage.getItem('scriptAdr') == null) {
    localStorage.setItem('scriptAdr', 'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec');
}

let maskBack = document.createElement('button') // кнопка вернуть
maskBack.id = "maskBack"
maskBack.innerHTML = "↩️"
maskBack.title = "Вернуть скрытое окно"
maskBack.style = 'display: none;'
maskBack.classList.add(rightPanelBtn, 'mainButton')

maskBack.onclick = function () { // функция кнопки вернуть
    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
    if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const name = document.getElementById('maskBack').getAttribute('name');
        const email = document.getElementById('maskBack').getAttribute('email');
        const phone = document.getElementById('maskBack').getAttribute('phone');
        const NameInChat = getActiveConvUserName();
        const EmailInChat = SearchinAFnewUI("email");
        const PhoneInChat = SearchinAFnewUI("phone");
        const modalMask = iframeDoc.getElementsByClassName('mantine-Modal-root')[0];
        const chatHeaderActionsInner = iframeDoc.querySelectorAll('#__next [class^="ConversationActions_Actions"]')[0];
        const chatNotesButton = iframeDoc.getElementsByClassName('mantine-RichTextEditor-control')[0];

        if (NameInChat === name && EmailInChat === email && PhoneInChat === phone) {
            modalMask.style.display = '';
            chatHeaderActionsInner.style.display = ''; // кнопки сверху
            chatNotesButton.style.display = ''; // кнопка заметок
            maskBack.style.display = 'none';
        } else {
            maskBack.innerHTML = "❌";
            maskBack.title = "Открыт не тот чат"
            setTimeout(function () {
                maskBack.innerHTML = "↩️";
                maskBack.title = "Вернуть скрытое окно"
            }, 3000);
        }
    }
};

let maskBackHide = document.createElement('span') // кнопка скрыть
maskBackHide.id = "maskBackHide"
maskBackHide.innerHTML = "Скрыть"
maskBackHide.style = 'margin-left: auto;margin-right: 10px;'
maskBackHide.style.display = "";

maskBackHide.onclick = function () { // функция кнопки скрыть
    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
    if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const modalMasks = iframeDoc.getElementsByClassName('mantine-Modal-root')[0]; // открытое окно c затемнением
        const chatHeaderActionsInner = iframeDoc.querySelectorAll('#__next [class^="ConversationActions_Actions"]')[0]; // кнопки действий в чате
        const chatNotesButton = iframeDoc.getElementsByClassName('mantine-RichTextEditor-control')[0]; // кнопка заметок
        const NameInChat = getActiveConvUserName();
        const EmailInChat = SearchinAFnewUI("email");
        const PhoneInChat = SearchinAFnewUI("phone");

        if (modalMasks) {
            modalMasks.style.display = 'none';
            chatHeaderActionsInner.style.display = 'none'; // кнопки сверху
            chatNotesButton.style.display = 'none'; // кнопка заметок
            maskBack.style.display = '';

            maskBack.setAttribute('name', NameInChat);
            maskBack.setAttribute('email', EmailInChat);
            maskBack.setAttribute('phone', PhoneInChat);
        }
    }
};

setInterval(screenshots, 5000)
setInterval(closeTerms, 500);

if (window.location.host === "skyeng.autofaq.ai" && window.location.pathname !== "/login") {
    setTimeout(move_again_AF, 3500) //вызов функции первичной загрузки страницы с фомированием меню и наполнением его
}

function SearchinAFnewUI(whatsearch) { //функция поиска нового юзер интерфейса в AF
    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
    if (iframe) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const elemwheresearc = iframeDocument.querySelector('#__next ul[class*="Variables_List"]');
        const Alternativewheresearc = iframeDocument.querySelectorAll('#__next div[class*="List_ListWrapper"]');

        if (elemwheresearc) {
            const children = elemwheresearc.children;
            const ElemCount = children.length;

            for (let i = 0; i < ElemCount; i++) {
                const [key, value] = children[i].textContent.split(':');

                if (key.trim() === whatsearch || key.trim() === whatsearch.toUpperCase()) {
                    return value.trim();
                }
            }
        }

        if (whatsearch === 'id' && Alternativewheresearc) {
            for (let i = 0; i < Alternativewheresearc.length; i++) {
                if (Alternativewheresearc[i].textContent.split(':')[0].trim() === whatsearch || Alternativewheresearc[i].textContent.split(':')[0].trim() === whatsearch.toUpperCase()) {
                    const children = Alternativewheresearc[i].children;
                    const ElemCount = children.length;

                    for (let j = 0; j < ElemCount; j++) {
                        const [key, value] = children[j].textContent.split(':');

                        if (key.trim() === whatsearch || key.trim() === whatsearch.toUpperCase()) {
                            return value.trim();
                        }
                    }
                }
            }
        }

        return '';
    }
}

function getChatId() { //функция получения активного ID чата, делалась, когда еще в адресную строку не выводился хеш чата
    const hrefnow = window.location.href;
    const pathname = document.location.pathname.split('/');
    let chatId = '';

    if (hrefnow.includes('skyeng.autofaq.ai/logs')) {
        chatId = pathname[2];
    } else if (hrefnow.includes('tickets/assigned')) {
        const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
        if (iframe) {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            const ConvArray = iframeDocument.querySelectorAll('#__next [class^="DialogsCard_Card"]');

            for (let i = 0; i < ConvArray.length; i++) {
                if (ConvArray[i].getAttribute('aria-selected') === 'true') {
                    chatId = ConvArray[i].getAttribute('data-conv-id');
                    break;
                }
            }
        }
    } else if (hrefnow.includes('tickets/archive')) {
        const fieldsArray = document.querySelectorAll('.ant-spin-container');
        for (let i = 0; i < fieldsArray.length; i++) {
            if (fieldsArray[i].textContent.split(':')[0] === "ID") {
                chatId = fieldsArray[i].children[0].textContent.split(':')[1].trim();
                break;
            }
        }
    }

    return chatId;
}

function getActiveConvUserName() { //функция получение имени пользователя в активном чате
    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
    if (iframe) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const Usernamefield = iframeDocument.querySelectorAll('[class^="User_Preview"]')[0];
        let ConvUsername = null;

        // массив для исключения
        const predefinedNames = ["тьютор", "тютор", "тутор", "бадди", "tutor", "buddy"];

        if (Usernamefield) {
            const namesParts = Usernamefield.textContent.split(/[\s_]+/);
            const firstPartInLowerCase = namesParts[0].toLowerCase();

            if (predefinedNames.includes(firstPartInLowerCase) && !namesParts[1]) {
                return '';
            }

            if (predefinedNames.includes(firstPartInLowerCase) && namesParts[1]) {
                return namesParts[1];
            }

            if (firstPartInLowerCase) {
                return namesParts[0];
            }
        }

        return '';
    }
}

function getLoginLink(userid) { // функция получения ссылки логинера
    return new Promise((resolve, reject) => {
        const fetchURL = 'https://id.skyeng.ru/admin/auth/login-links';
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${userid}&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=`,
            mode: 'cors',
            credentials: 'include',
        };
        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, (response) => {
            if (!response.success) {
                console.log('Ошибка при получении логиннера: ', response.error);
                return reject(new Error(response.error));
            }
            const link = extractLoginLink(response.fetchansver);
            if (!link) {
                console.log('Ссылка логинера не найдена');
                return reject(new Error('Ссылка логинера не найдена'));
            }
            navigator.clipboard.writeText(link)
                .then(() => resolve(true))
                .catch((err) => {
                    console.log('Не удалось скопировать текст: ', err);
                    reject(err);
                });
        });
    });
}

function extractLoginLink(text) {
    // Используем глобальный поиск для нахождения всех URL
    const regex = /https:\/\/id\.skyeng\.ru\/auth\/login-link\/\S+/g;
    let matches = text.match(regex);
    // Проверяем наличие совпадений
    if (matches && matches.length) {
        // Получаем последний URL и удаляем кавычки в конце, если они есть
        let lastMatch = matches[matches.length - 1];
        return lastMatch.replace(/["']+$/, ''); // Удаляем кавычки в конце строки
    }
    return null; // Возвращаем null, если совпадений нет
}

// окрашивание чатов при остатке времени <2 min

function getAllChatsList() { //получить список всех чатов
    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
    if (iframe) {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const chatsTimerList = iframeDocument.querySelectorAll('[class^="DialogsCard_Timers"]');
        const chatsList = iframeDocument.querySelectorAll('[class^="DialogsCard_Card"]');
        return { chatsTimerList, chatsList };
    }
}

function convertToSeconds(TimeToClose, TimeToAnswer, i) { //функция конвертирования в секунды
    if (!TimeToClose && !TimeToAnswer) {
        const cardElements = getAllChatsList().chatsList;
        if (cardElements[i]) {
            cardElements[i].style.background = localStorage.getItem('answchatcolor');
        }
        return 0;
    } else if (!TimeToClose && TimeToAnswer) {
        const cardElements = getAllChatsList().chatsList;
        if (cardElements[i]) {
            cardElements[i].style.background = localStorage.getItem('responschatcolor');
        }
        return 0;
    }

    const [h, m, s] = TimeToClose.split(':').map(Number);
    const totalSeconds = h * 3600 + m * 60 + s;

    const cardElements = getAllChatsList().chatsList;
    if (cardElements[i]) {
        if (totalSeconds < 120) {
            cardElements[i].style.background = localStorage.getItem('defaclschatcolor');
        }
    }

    return totalSeconds;
}

function checkchats() {
    const allChats = getAllChatsList();
    if (allChats) {
        const timers = allChats.chatsTimerList;
        const chats = allChats.chatsList;

        // Set default background for all chats
        for (let j = 0; j < chats.length; j++) {
            chats[j].style.background = "white"; // replace "" with your default color
        }

        for (let i = 0; i < timers.length; i++) {
            const TimeToClose = timers[i].children[2]; //в children [2] индекс поставили для таймера АЗ, чтобы его закрашивало, если меньше 2 минут; ранее был 1
            const TimeToAnswer = timers[i].children[1];
            if (TimeToClose) {
                try {
                    convertToSeconds(TimeToClose.textContent, TimeToAnswer.textContent, i);
                } catch (error) {
                    console.log(`Error with timer ${i}: ${error.message}`);
                }
            }
        }
    }
}

// ловим вызов newTaggg из iframe
window.addEventListener('callNewTaggg', (event) => {
    const tagName = event.detail.tagName;
    newTaggg(tagName);
});

// ловим вызов sendComent из iframe
window.addEventListener('CallNewComment', (event) => {
    const ComemntText = event.detail.comment;
    sendComment(ComemntText);
});


function toggleButtonState(buttonId, className) { // Функция для переключения состояния кнопки
    const button = document.getElementById(buttonId);
    button.classList.toggle(className);
}

function createAndShowButton(text, result = 'message') {
    let type = result == 'message' ? 'sucsbtnok' : 'sucsbtnnotok';
    let btnSuccess = document.createElement("button");
    btnSuccess.id = "successButton";
    btnSuccess.className = `sucsbtnAF ${type}`;
    btnSuccess.innerHTML = text;

    let countdownBar = document.createElement("div");
    countdownBar.id = "countdownBar";
    countdownBar.className = "countdown-bar";
    btnSuccess.appendChild(countdownBar);

    document.body.appendChild(btnSuccess);

    // Установка display в block для отображения кнопки
    btnSuccess.style.display = 'block';

    // Добавляем логику для скрытия кнопки после некоторого времени, если это необходимо
    setTimeout(() => {
        btnSuccess.remove(); // или btnSuccess.style.display = 'none'; если вы хотите скрыть, а не удалять
    }, 3500); // Время до скрытия/удаления кнопки в миллисекундах
}

// Функция для получения токена из chrome.storage
function getToken() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["token_global"], function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result.token_global);
            }
        });
    });
}

// Функция для установки токена в chrome.storage
function setToken(token) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ token_global: token }, function () {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}

// Интервал для получения токена с сайта CRM
let checkCRMLS = setInterval(async function () {
    if (location.host == 'crm2.skyeng.ru') {
        let token = localStorage.getItem('token_global');
        if (token) {
            await setToken(token);
            console.log("Успешно получен токен");

            // Останавливаем интервал после выполнения условия
            clearInterval(checkCRMLS);
            console.log("Интервал остановлен");
        }
    }
}, 3000);

// Интервал для установки токена на другом сайте
let checkRespondToken = setInterval(async function () {
    if (location.host == 'skyeng.autofaq.ai') {
        let token = await getToken();
        if (token) {
            flagTokenGlobal = token;
            localStorage.setItem('token_global', flagTokenGlobal);
            console.log("Токен успешно установлен на другом сайте");

            // Останавливаем интервал после выполнения условия
            clearInterval(checkRespondToken);
            console.log("Интервал остановлен");
        }
    }
}, 4000);

function showCustomAlert(message, notif = 0) {
    if (localStorage.getItem('brnotificatios') == '0' && notif == 1) {
        showNotification(message);
    }

    // Создаем элемент контейнера уведомления
    const alertContainer = document.createElement('div');
    alertContainer.classList.add('extwindows', 'alert-container');

    // Добавляем текст уведомления
    const alertMessage = document.createElement('span');
    alertMessage.innerText = message;
    alertMessage.classList.add('alert-message');
    alertContainer.appendChild(alertMessage);

    // Добавляем кнопку закрытия
    const closeButton = document.createElement('button');
    closeButton.innerText = 'OK';
    closeButton.classList.add('mainButton');
    closeButton.onclick = function () {
        document.body.removeChild(alertContainer);
    };
    alertContainer.appendChild(closeButton);

    // Добавляем уведомление на страницу
    document.body.appendChild(alertContainer);
}

function showNotification(message) {
    if (!("Notification" in window)) {
        console.log("Этот браузер не поддерживает уведомления.");
    }
    else if (Notification.permission === "granted") {
        new Notification(message);
    }
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function (permission) {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }
}

// Функция для замены предмета
function formatServiceType(serviceTypeKey) {
    let parts = serviceTypeKey.split('_');
    let subjectKey;
    let lessontype = "group"; // По умолчанию тип "group"

    // Определяем предмет для lc_exam
    if (parts[0] === "lc" && parts[1] === "exam") {
        subjectKey = parts[3]; // Предмет идет после "ege"
    }
    // Для английских курсов (adult_courses)
    else if (parts[0] === "english" && parts[1] === "adult" && (parts[2] === "courses" || parts[2] === "minicourses")) {
        subjectKey = "english"; // Предмет "english" для курсов
        lessontype = "f2f"; // Тип "f2f" для adult courses
    }
    // Стандартный случай
    else {
        subjectKey = parts[2];
    }

    // Определяем предмет и формат
    let subject = subjectTranslations[subjectKey] || subjectKey;
    let format = formatTranslations[parts[3]] || formatTranslations[parts[4]] || formatTranslations[parts[parts.length - 1]];

    // Добавляем стиль только к формату, если он существует
    if (format) {
        format = `<span style="font-weight: bold; color: #00b8ff; text-transform: uppercase">${format}</span>`;
    }
    // Если Talks или РК не пишем предмет
    if (parts.includes("life") || parts.includes("talks") || parts.includes("coach")) {
        return {
            formattedText: format ? `${format}`.trim() : "",
            lessontype: lessontype
        };
    }

    // Возвращаем объединенную строку: предмет + формат (если он есть), и тип занятия
    return {
        formattedText: format ? `${subject} ${format}`.trim() : subject,
        lessontype: lessontype
    };
}

function addValidationlist(e) {
    const inputElement = e.target; // Элемент, вызвавший событие
    const listId = inputElement.getAttribute('list'); // Получаем id связанного datalist
    const dataList = document.getElementById(listId); // Находим связанный datalist

    if (dataList) {
        const options = Array.from(dataList.options).map(opt => opt.value); // Собираем значения из datalist
        const value = inputElement.value; // Получаем текущее значение инпута

        if (options.includes(value)) { // Проверяем, есть ли значение в списке
            inputElement.setCustomValidity(''); // Сбрасываем сообщение об ошибке
            inputElement.setAttribute('data-valid', 'true'); // Устанавливаем атрибут валидности
        } else {
            inputElement.setCustomValidity('Пожалуйста, выберите одно из доступных значений.'); // Устанавливаем сообщение об ошибке
            inputElement.removeAttribute('data-valid'); // Удаляем атрибут валидности
        }
    }
}

function highlightSearchText(item, searchText) {
    const replacePattern = new RegExp(searchText, 'i');
    const replaceValue = `<span style="color:MediumSpringGreen; font-weight:700; text-shadow:1px 2px 5px rgb(0 0 0 / 55%);">${searchText.toUpperCase()}</span>`;
    return replaceItem(item).replace(replacePattern, replaceValue);
}