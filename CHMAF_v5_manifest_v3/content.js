//Импортировал с content.js
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

let aftoken = '';
let pldata;
let afopername; // переменная фамилии, имени оператора при переборе общего списка операторов
let foundarr;
let flagsearch;
let operchatsdata;
let isChatOnOperator = false;
let audio // переменнай для проигрывания звука при поступлении нового чата
let soundintervalset; //интервал между проигрыванием звука
let flagusertype;
let chatneraspcount; // переменная для получения колчества нераспределенных чатов в очереди
let chattpquecount; // переменная для получения колчества нераспределенных чатов в очереди тематики ТП v1
idk = 0
let tmrs = []
let timeStart = new Date()
let template_flag = 0
let template_flag2 = 0
let word_text = ""
let template_text = ""
let flagggg = 0;
let getidusrteachreq;
let getidusrstud;
let getidusrsteach;
let getservidst;
let templatesAF = [];
let bool = 0;
let table;
let opsection = 'ТП'; // глобальная переменная отдела оператора
let operatorFullTitle = ''; //глобальная переменная полного имени оператора
let operatorId = ""; //глобальная переменная после получения ID operator , который использует расширение и авторизован в свой профиль
let operatorsarray = []; //массив операторов , который потом пригодится для других функций
let flagLangBut = 0;
let modulesarray = [];
let chatsArray = [];
let scriptAdr = localStorage.getItem('scriptAdr');

let countertest = 0;

async function findOperator(operatorFullTitle) {
    try {
        // Выполняем асинхронную функцию и получаем данные
        const searchOperId = await fetchStaticData();

        // Проверяем, существует ли массив onOperator
        if (!Array.isArray(searchOperId.onOperator)) {
            throw new Error("onOperator не является массивом или отсутствует.");
        }

        // Используем find для поиска совпадения
        operatorsarray = searchOperId.onOperator
        const user = searchOperId.onOperator.find(user => user.operator?.fullName === operatorFullTitle);

        // Проверяем, найден ли пользователь
        if (user) {
            console.log("Найденный пользователь:", user);
            operatorId = user.operator?.id;
            console.log(operatorId)
            return user; // Возвращаем найденный объект
        } else {
            console.log("Пользователь с именем", operatorFullTitle, "не найден.");
            return null; // Если не найдено, возвращаем null
        }
    } catch (error) {
        console.error("Ошибка выполнения функции:", error);
    }
}

let whoAmICompleted = false; // Маркер выполнения

async function whoAmI() {
    if (whoAmICompleted) {
        return true; // Если уже успешно выполнялось, просто возвращаем true
    }

    if (location.host.includes('autofaq') == true) {
        countertest++;
        console.log(countertest);

        const tokenis = document.cookie.match(/csrf_token=([^;]*)/);
        if (tokenis && tokenis.length > 1) {
            aftoken = tokenis[1];

            let archiveInd;
            if ((location.pathname.includes('/archive') || location.pathname.includes('/logs')) &&
                document.getElementsByClassName('user_menu-dropdown-user_name').length > 0) {

                archiveInd = document.getElementsByClassName('user_menu-dropdown-user_name')[0].textContent.split('-');
                operatorFullTitle = document.getElementsByClassName('user_menu-dropdown-user_name')[0].textContent;
                opsection = archiveInd[0];
                console.log(opsection);
                console.log(operatorFullTitle);
                findOperator(operatorFullTitle);
                whoAmICompleted = true; // Фиксируем успешное выполнение
                return true;
            } else if (!location.pathname.includes('/archive') && !location.pathname.includes('/logs')) {
                const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
                if (iframe && iframe.contentDocument) {
                    let sectionKey = iframe.contentDocument.querySelector('span[id^="mantine-"][id$="-target"]');
                    if (sectionKey) {
                        operatorFullTitle = sectionKey.textContent;
                        let keys = sectionKey.textContent.split('-');
                        afopername = keys[1];
                        if (keys[0] !== "ТП" && keys[0] !== "ТП ОС") {
                            opsection = keys[0];
                            console.log(opsection);
                        }
                        console.log("OPSECTION", opsection, "AFOPERNAME", afopername);
                        console.log(operatorFullTitle);
                        findOperator(operatorFullTitle);

                        whoAmICompleted = true; // Фиксируем успешное выполнение
                        return true;
                    } else {
                        console.error("Элемент 'span[id^=\"mantine-\"][id$=\"-target\"]' не найден");
                    }
                } else {
                    console.error("Iframe '[class^=\"NEW_FRONTEND\"]' не найден или contentDocument недоступен");
                }
            }
        }
        return false;
    }

}


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

let exttheme = localStorage.getItem('extentiontheme') === 'dark' ? 'darkinputs' : 'lightinputs';
let selectedinpth = exttheme === 'lightinputs' ? 'calendarmyinputslight' : 'calendarmyinputsdark';
let otherinpth = exttheme === 'lightinputs' ? 'othercalendarlight' : 'othercalendardark';
let selecttheme = exttheme === 'lightinputs' ? 'lightopts' : 'darkopts';
let menutheme = exttheme === 'lightinputs' ? 'menubarstylelight' : 'menubarstyledark';
let rightPanelBtn = exttheme === 'lightinputs' ? 'rightPanelBtnlight' : 'rightPanelBtndark';
let menubtns = exttheme === 'lightinputs' ? 'menubtnsstylelight' : 'menubtnsstyledark';

function checkcalendaricon() { //функция проверки иконки календаря в зависимости от темы расширения
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




function changeStatus(status, token = aftoken) { // функция изменения статуса оператора
    const API_ENDPOINT = 'https://skyeng.autofaq.ai/api/reason8/operator/status';
    const fetchOptions = {
        headers: {
            'content-type': 'application/json',
            'x-csrf-token': token
        },
        referrer: 'https://skyeng.autofaq.ai/tickets/archive',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: '',
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
    };
    console.log(fetchOptions.headers['x-csrf-token']);
    fetchOptions.body = `{ "command": "DO_SET_OPERATOR_STATUS", "status": "${status}", "source": "Operator" }`;
    fetch(API_ENDPOINT, fetchOptions)
        .then((res) => {
            console.log(`Status changed to ${status}`);
        })
        .catch((err) => {
            console.log(err);
        });
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

function noDoubts(object) { // функция для разрешения ввода только английских и русских букв без запрещенных символов, пока нигде не используеться
    object.value = object.value.replace(/["'\\]/gi, '');
}

function getGblToken() { // получение токена глобал
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["token_global"], function (result) {
            resolve(result.token_global);
        });
    });
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
            "x-csrf-token": aftoken
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
                "x-csrf-token": aftoken
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

function pageClick(event) { // обновлённый обработчик событий
    const b = document.getElementById('AF_helper').childNodes[0].childNodes[1].childNodes[1];
    const pageId = event.currentTarget.id;
    const pageNum = pageId.split('_')[0];

    for (let i = 0; i < b.childElementCount; i++) {
        try {
            b.children[1].children[i].style = 'background-color:#768d87; border-top:0px;';
            document.getElementById(i + "page").style.display = 'none';
        } catch (e) {

        }
    }
    event.currentTarget.style = 'background-color: green; border-top:4px solid orange';
    document.getElementById(pageNum + "page").style.display = '';
}

let bimba;
function initializeMyLogic() {
    const afHelper = document.getElementById('AF_helper');
    if (!afHelper) {
        console.error('AF_helper все еще не найден!');
        // Возможно, здесь нужна дополнительная обработка ошибки
        return;
    }

    console.log('AF_helper найден, инициализация логики content.js...');

    if (afHelper && afHelper.childNodes[0] && afHelper.childNodes[0].childNodes[1]) {
        bimba = afHelper.childNodes[0].childNodes[1].childNodes[1];
        console.log(bimba)
    } else {
        console.error('Элемент AF_helper отсутствует или структура DOM отличается.');
    }

    // ---> Вставьте сюда ВЕСЬ ОСТАЛЬНОЙ КОД из content.js <---
    // Например:
    // let b;
    // if (afHelper && afHelper.childNodes[0] && ...) {
    //    b = ...
    // } else { ... }
    // ... и так далее ...
}

function waitForElement(selector, callback, timeout = 10000, interval = 100) {
    const startTime = Date.now();
    const intervalId = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Элемент ${selector} найден.`);
            clearInterval(intervalId);
            callback();
        } else if (Date.now() - startTime > timeout) {
            clearInterval(intervalId);
            console.error(`Элемент ${selector} не найден в течение ${timeout / 1000} секунд.`);
            // Можно вызвать callback с ошибкой или сделать что-то еще
        } else {
            // console.log(`Ожидание ${selector}...`); // Раскомментируйте для отладки
        }
    }, interval);
}

// Запускаем ожидание AF_helper
if (location.host == 'skyeng.autofaq.ai') {
    waitForElement('#AF_helper', initializeMyLogic);
}

function refreshTemplates() { // функция обновляет шаблоны которые загружены были с гугл таблицы и сформированы их в table
    if (location.host == 'skyeng.autofaq.ai') {
        setInterval(function () {
            phone = SearchinAFnewUI("phone");
            email = SearchinAFnewUI("email");

            if (document.getElementById('phone_tr')) {
                if (phone === "-" || phone === "") {
                    document.getElementById('phone_tr').placeholder = "Телефон";
                } else {
                    document.getElementById('phone_tr').placeholder = phone;
                }
            }

            if (document.getElementById('email_tr')) {
                if (email === "-" || email === "") {
                    document.getElementById('email_tr').placeholder = "Почта";
                } else {
                    document.getElementById('email_tr').placeholder = email;
                }
            }
        }, 1000);

        templatesAF = []
        let pagesElement = document.getElementById('pages');
        while (pagesElement && pagesElement.children[0] !== undefined) {
            pagesElement.children[0].remove();
        }
        for (let i = 0; document.getElementById(i + 'page') !== null; i++) {
            document.getElementById(i + 'page').remove();
        }
        let addTmpElement = document.getElementById('addTmp');
        if (addTmpElement && addTmpElement.children[0]) {
            while (addTmpElement.children[0].children[0] !== undefined) {
                addTmpElement.children[0].children[0].remove();
            }
        }
        countOfStr = 0
        countOfPages = 0
        pageName = ""
        addTmpFlag = 0

        // b = document.getElementById('AF_helper').childNodes[0].childNodes[1].childNodes[1]
        for (i = 0; i < table.length; i++) {
            c = table[i]
            switch (c[0]) {
                case '':
                    addTmpFlag = 0
                    countOfStr++
                    var newStr = document.createElement('div')
                    newStr.style.margin = "5px"
                    newStr.id = countOfPages + "page_" + countOfStr + "str"
                    bimba.lastElementChild.appendChild(newStr)
                    break

                case 'Additional templates':
                    addTmpFlag = 1
                    break
                case 'Страница':
                    var newPageBut = document.createElement('button');
                    newPageBut.textContent = c[1];
                    pageType = c[2];
                    newPageBut.style.marginRight = '4px';
                    newPageBut.classList.add('mainButton')

                    // Используйте addEventListener для назначения обработчика события
                    newPageBut.addEventListener('click', pageClick);

                    newPageBut.id = countOfPages + '_page_button';
                    bimba.childNodes[3].appendChild(newPageBut);

                    var newPage = document.createElement('div');
                    newPage.id = countOfPages + 'page';
                    bimba.appendChild(newPage);

                    countOfPages++;
                    countOfStr = 1;

                    if (pageType == "Серверные") { // дорисоква инпута для ссылки на серверные
                        var newDiv = document.createElement('div')
                        newDiv.id = countOfPages + "page_" + countOfStr + "str"
                        newDiv.style.margin = "5px"

                        var newInputAlink = document.createElement('input')
                        newInputAlink.id = 'avariyalink'
                        newInputAlink.placeholder = 'Ссылка на трэд или Jira северных'
                        newInputAlink.autocomplete = 'off'
                        newInputAlink.type = 'text'
                        newInputAlink.classList.add(exttheme)
                        newInputAlink.style = 'text-align: center; width: 300px; margin-left: 7px'

                        newDiv.appendChild(newInputAlink)

                        var newbtnclrlink = document.createElement('button')
                        newbtnclrlink.textContent = "🧹"
                        newbtnclrlink.title = "Очищает поле задачи серверных"
                        newbtnclrlink.classList.add('mainButton')
                        newbtnclrlink.onclick = function () { document.getElementById('avariyalink').value = "" }

                        newDiv.appendChild(newbtnclrlink)

                        var newSelectAThemes = document.createElement('select')
                        newSelectAThemes.id = 'avariyatema'
                        newSelectAThemes.classList.add(exttheme)
                        newSelectAThemes.style = 'text-align: center; width: 300px; height: 26px; margin-left: 7px; margin-top: 5px'
                        newSelectAThemes.type = 'text'

                        var newthemeoption = document.createElement('option')
                        newthemeoption.text = "Выбери тематику для серверных"
                        newthemeoption.selected = true
                        newthemeoption.disabled = true
                        newthemeoption.value = "thenenotselect"
                        newthemeoption.style = "background-color:orange; color:white;"
                        newSelectAThemes.add(newthemeoption)

                        ///

                        async function getAvariaThemes() {
                            let objSelAvariaThema = document.getElementById("avariyatema");
                            let avariatemacontainer;
                            let themesfromdoc;
                            if (objSelAvariaThema && objSelAvariaThema.children.length == 1) {
                                clearInterval(getTms)
                                themesfromdoc = 'https://script.google.com/macros/s/AKfycbxNjuQ7EbZZkLEfC1_aSoK4ncsF0W0XSkjYttCj2nQ23BBzMEmDq-vqJL3MvwJk9Pnm_g/exec'
                                await fetch(themesfromdoc).then(r => r.json()).then(r => avariatemadata = r)
                                avariatemacontainer = avariatemadata.result;

                                for (let i = 0; i < avariatemacontainer.length; i++) {
                                    addOption(objSelAvariaThema, `${avariatemacontainer[i][3]}`, `${avariatemacontainer[i][4]}`) // переиндексацию нужно будет сделать
                                }

                            } else {
                                console.log('Test false')
                            }
                        }

                        let getTms = setInterval(getAvariaThemes, 4000)

                        ///

                        newDiv.appendChild(newSelectAThemes)

                        var newbtnclrtheme = document.createElement('button')
                        newbtnclrtheme.textContent = "🧹"
                        newbtnclrtheme.title = "Очищает поле тематики серверных"
                        newbtnclrtheme.classList.add('mainButton')
                        newbtnclrtheme.onclick = function () { document.getElementById('avariyatema').children[0].selected = true }

                        newDiv.appendChild(newbtnclrtheme)

                        bimba.lastElementChild.appendChild(newDiv)
                        countOfStr++
                    }

                    var newStr = document.createElement('div')
                    newStr.style.margin = "5px"
                    newStr.id = countOfPages + "page_" + countOfStr + "str"
                    bimba.lastElementChild.appendChild(newStr)
                    break
                default:
                    switch (pageType) {
                        case 'Шаблоны':
                            var newBut = document.createElement('button');
                            newBut.textContent = c[0];
                            newBut.style.marginRight = '4px';
                            newBut.classList.add('mainButton')

                            // Проверки для установки ID или изменения текста
                            if (newBut.textContent == 'Урок NS') {
                                newBut.id = "NS";
                            }
                            if (newBut.textContent == 'ус+брауз (У)')
                                newBut.textContent = "ус+брауз"
                            if (newBut.textContent == 'ус+брауз (П)')
                                continue
                            newBut.addEventListener('click', function (event) {
                                buttonsFromDoc(event.target.textContent);
                            });

                            if (addTmpFlag == 0) {
                                bimba.lastElementChild.lastElementChild.appendChild(newBut);
                            } else {
                                newBut.style.marginTop = '4px';
                                document.getElementById('addTmp').children[0].appendChild(newBut);
                            }
                            break;
                        case 'Серверные': // обработка нажатия на кнопку на странице серверные
                            var newBut = document.createElement('button')
                            newBut.textContent = c[0]
                            newBut.style.marginRight = '4px'
                            newBut.classList.add('mainButton')
                            newBut.addEventListener('click', servFromDoc);
                            bimba.lastElementChild.lastElementChild.appendChild(newBut)
                            break

                        default:
                            break
                    }
                    break
            }
        }
        const addTmp = document.getElementById('addTmp');

        if (addTmp.firstElementChild && addTmp.firstElementChild.childElementCount > 0) {
            document.getElementById('0page').addEventListener('dblclick', function (event) {
                if (checkelementtype(event)) {
                    // Переключаем видимость элемента addTmp
                    addTmp.style.display = addTmp.style.display === 'none' ? '' : 'none';
                }
            });
        }

        document.getElementById('0_page_button').click()
    }
}

function getText() { // функция обновления текста с шаблонов из документа
    const app = scriptAdr;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', app);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                const r = JSON.parse(xhr.responseText);
                const result = r["result"];
                table = result;
            } catch (e) {
                console.log(e);
            } finally {
                refreshTemplates();
            }
        }
    };
    xhr.send();
}

async function move_again_AF() { //с АФ шняга там стили шмили скрипта отображение отправку сообщений
    getText();
    let whoAmISuccess = await whoAmI();
    console.log(whoAmISuccess)
    while (!whoAmISuccess) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Ожидание секунду перед повторным вызовом
        whoAmISuccess = await whoAmI();
    }
    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']); // Получаем данные из хранилища
    // Присваиваем данные константам
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

    if (scriptAdr != TP_addr && scriptAdr != TP_addrRzrv && localStorage.getItem('hideTaskWindow') == 1) {
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

async function doOperationsWithHistory(body = "") {  // общая функция для отправки запросов на историю запросов
    const url = "https://skyeng.autofaq.ai/api/conversations/history";
    const headers = {
        "content-type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-csrf-token": aftoken // Убедитесь, что aftoken определён
    };

    try {
        // Проверка тела запроса
        if (typeof body !== "string" && typeof body !== "object") {
            throw new Error("Аргумент body должен быть строкой или объектом.");
        }
        const requestBody = typeof body === "object" ? JSON.stringify(body) : body;

        // Выполнение запроса
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: requestBody,
            mode: "cors",
            credentials: "include"
        });

        // Проверка успешности ответа
        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
        }

        // Обработка результата
        const result = await response.json();
        console.log("Response:", result?.status, result?.items?.length || 0);
        return result;
    } catch (error) {
        console.error("Ошибка выполнения запроса:", error, "URL:", url, "Body:", body);
        throw error; // Пробрасываем ошибку
    }
}

async function doOperationsWithConversations(chathash) { // общая функция для получения информации по конкретному диалогу по его хешу
    const url = "https://skyeng.autofaq.ai/api/conversations/" + chathash; // URL с аргументом adr
    const headers = {
        "content-type": "application/json",
        "x-csrf-token": aftoken // Динамически подставляем токен
    };

    try {
        const response = await fetch(url, {
            method: "GET", // Статичный метод GET
            headers: headers,
            credentials: "include", // Включение cookies
            mode: "cors" // Режим CORS
        });

        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json(); // Преобразуем ответ в JSON
        return data; // Возвращаем данные
    } catch (error) {
        console.error("Ошибка выполнения запроса:", error);
        throw error; // Пробрасываем ошибку для обработки
    }
}

async function fetchStaticData() { // общая функция проверки статусов операторов
    const url = "https://skyeng.autofaq.ai/api/operators/statistic/currentState"; // Статичный URL
    const headers = {
        "x-csrf-token": aftoken, // Статичный токен
    };
    const options = {
        method: "GET", // Статичный метод
        headers: headers,
        credentials: "include", // Статичная настройка для включения cookies
        mode: "cors", // Статичный режим
    };

    try {
        const response = await fetch(url, options);

        // Проверяем успешность ответа
        if (!response.ok) {
            throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
        }

        // Преобразуем ответ в JSON
        const result = await response.json();
        // console.log("Полученные данные:", result);
        return result;
    } catch (error) {
        console.error("Ошибка выполнения запроса:", error);
        throw error; // Пробрасываем ошибку для обработки
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

// Проверяем текущий путь сразу при загрузке
if (window.location.pathname !== "/login") {
    setTimeout(move_again_AF, 3000);
} else {
    // Если изначально на /login, запускаем интервал для отслеживания перехода
    let previousPath = window.location.pathname;

    const checkURLChange = setInterval(() => {
        const currentPath = window.location.pathname;

        // Срабатываем при переходе с /login на любой другой путь
        if (previousPath === "/login" && currentPath !== "/login") {
            clearInterval(checkURLChange);
            setTimeout(move_again_AF, 3000);
        }

        previousPath = currentPath;
    }, 1000);
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

function checkchats() { //функция проверки  чатов и перекрашивает, если время осталось меньше двух минут,  или по другим критериям
    const allChats = getAllChatsList();
    if (allChats) {
        const timers = allChats.chatsTimerList;
        const chats = allChats.chatsList;
        /*         const getAllInformators = Array.from(allChats.chatsList).flatMap(chat => chat.querySelectorAll('div[class*="DialogsCard_PayloadStatus"]'));

                for (let i = 0; i < getAllInformators.length; i++) {
                    if (getAllInformators[i][0].childNodes[0].childNodes[0].getAttribute('d').split(' ')[0].slice(0, 2) == "M7") {
                        getAllInformators[i][0].childNodes[0].style = "background-color: green;width: 40px;height: 40px;border-radius: 20px;"
                    } else {
                        getAllInformators[i][0].childNodes[0].style = "border: 5px dashed #ffffff;background-color: red;width: 40px;height: 40px;font-size: 40px;border-radius: 20px;"
                    }
                } */

        const getAllInformators = Array.from(allChats.chatsList).flatMap(chat => chat.querySelectorAll('div[class*="DialogsCard_PayloadStatus"]'));

        for (let i = 0; i < getAllInformators.length; i++) {
            const svg = getAllInformators[i][0]?.childNodes?.[0];
            const path = svg?.childNodes?.[0];

            const d = path?.getAttribute?.('d');
            const start = d?.split(' ')[0]?.slice(0, 2);

            if (start === "M7") {
                svg.style = "background-color: green;width: 30px;height: 30px;border-radius: 20px;";
            } else if (start) {
                svg.style = "border: 5px dashed #ffffff;background-color: red;width: 30px;height: 30px;font-size: 40px;border-radius: 20px;";
            } else {
                console.warn(`❗️Пустой или недоступный d у элемента #${i}`);
            }
        }


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

function toggleButtonState(buttonId, className) { // Функция для переключения состояния кнопки
    const button = document.getElementById(buttonId);
    button.classList.toggle(className);
}

function createAndShowButton(text, result = 'message') { //функция создания кнопки с текстовым с ообщением и прогресс баром до исчезновения
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

function showNotification(message) { // функция отображения уведомления средствами самого браузера
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

function showCustomAlert(message, notif = 0) { //функция создания уведомления взамен алерта, который стопает выполнение скриптов, а тут продолжается.
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

function highlightSearchText(item, searchText) { //Функция подсветки текста
    const replacePattern = new RegExp(searchText, 'i');
    const replaceValue = `<span style="color:MediumSpringGreen; font-weight:700; text-shadow:1px 2px 5px rgb(0 0 0 / 55%);">${searchText.toUpperCase()}</span>`;
    return replaceItem(item).replace(replacePattern, replaceValue);
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