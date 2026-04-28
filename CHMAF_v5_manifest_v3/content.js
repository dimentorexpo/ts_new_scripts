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

let selectedinpth = 'calendarmyinputsdark';
let otherinpth = 'othercalendardark';
let selecttheme = 'darkopts';
let menutheme = 'menubarstyledark';
let rightPanelBtn = 'rightPanelBtndark';

var win_mainmenu = // описание кнопок меню
    `<div>
        <div id="JiraOpenForm" class="onlyfortp">🔎Jira Search</div>
        <div id="crmopersstatuses" class="onlyfortp ">🧮Статусы CRM2</div>
        <div id="butMarks">🎭 Оценки</div>
        <div id="smartroomform" class="onlyfortp">🦐Smartroom</div>
        <div id="butLessonInfo" >🎓 Lesson Info</div>
		<div id="butFrozeChat" >❄ Auto Respond</div>
        <div id="buttonGetStat" >📊 Статистика</div>
		<div id="buttonGetQueue" >🚧 Очередь</div>
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


/*
   * Creates a new draggable window element and appends it to the body.
   * @param {string} id - The ID for the new window element.
   * @param {string} topKey - The localStorage key for storing the 'top' position.
   * @param {string} leftKey - The localStorage key for storing the 'left' position.
   * @param {string} content - The HTML content to be inserted into the window.
   * @returns {HTMLElement} The created window element.
*/
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
    if (id === 'AF_Timetable' || id === 'AF_Grabber' || id === 'AF_GrList' || id === 'AF_SpecCommWindow') {
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
                // Получаем реальные размеры окна с учетом масштаба (scale)
                let rect = windowElement.getBoundingClientRect();
                let actualWidth = rect.width;
                let actualHeight = rect.height;

                // Ограничения по ширине экрана
                if (newLeft < 0) {
                    newLeft = 0;
                } else if (newLeft + actualWidth > window.innerWidth) {
                    newLeft = window.innerWidth - actualWidth;
                }

                // Ограничения по высоте экрана
                if (newTop < 0) {
                    newTop = 0;
                } else if (newTop + actualHeight > window.innerHeight) {
                    newTop = window.innerHeight - actualHeight;
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

function timerHideButtons() { // функция прячет кнопку одну
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

function checkelementtype(a) {
    let elem = document.elementFromPoint(a.clientX, a.clientY);
    if (!elem) return false;

    // ПРОВЕРКА 1: Разрешаем перетаскивание, если есть спец. класс (даже если это INPUT)
    if (elem.classList.contains('teststudteachinp')) {
        return true;
    }

    // ПРОВЕРКА 2: Список исключений (где драг запрещен)
    const forbiddenNodes = ['BUTTON', 'LABEL', 'INPUT', 'TEXTAREA', 'SELECT', 'P', 'TABLE', 'TH', 'TR', 'CANVAS'];
    const forbiddenClasses = ['checkbox-audio-switch', 'checkbox-refresh-switch', 'srvhhelpnomove', 'rowOfChatGrabbed'];
    const forbiddenIds = ['CSATFilterField', 'AgregatedDataThemes', 'AgregatedDataOut', 'ToolsPanel', 'ProblemsSolution'];

    if (forbiddenNodes.includes(elem.nodeName)) return false;
    if (forbiddenIds.includes(elem.id)) return false;

    // Проверка классов через перебор
    if (forbiddenClasses.some(cls => elem.classList.contains(cls))) return false;

    return true;
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

// ===============================
// 0. ДЕБОУНС ДЛЯ ОБРАБОТКИ
// ===============================
let processTimer = null;

function scheduleProcessAll() {
    clearTimeout(processTimer);
    processTimer = setTimeout(processAll, 150);
}

// ===============================
// 1. СТАРТ: OBSERVER + ПЕРВИЧНЫЙ ЗАПУСК
// ===============================
initObservers();
scheduleProcessAll();

function initObservers() {
    // наблюдаем за основным документом
    const mainObserver = new MutationObserver(scheduleProcessAll);
    mainObserver.observe(document.body, { childList: true, subtree: true });

    // пробуем повеситься на iframe, когда он появится
    waitForIframeDoc(doc => {
        const iframeObserver = new MutationObserver(scheduleProcessAll);
        iframeObserver.observe(doc.body, { childList: true, subtree: true });
        scheduleProcessAll();
    });
}

// ===============================
// 2. ПОИСК iframe НОВОГО ФРОНТА
// ===============================
function getIframeDoc() {
    let iframe =
        document.querySelector('iframe.NEW_FRONTEND__frame') ||
        document.querySelector('iframe[class^="NEW_FRONTEND"]') ||
        document.querySelector('[class^="NEW_FRONTEND"] iframe');

    if (!iframe) return null;

    try {
        return iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) || null;
    } catch (e) {
        return null;
    }
}

function waitForIframeDoc(callback) {
    const tryGet = () => {
        const doc = getIframeDoc();
        if (doc && doc.body) {
            callback(doc);
        } else {
            setTimeout(tryGet, 200);
        }
    };
    tryGet();
}

// ===============================
// 3. ГЛАВНАЯ ФУНКЦИЯ: ОБРАБОТАТЬ ВСЁ
// ===============================
function processAll() {
    // 1) лог + архив (старый UI)
    handleRootDocument(document, true);

    // 2) живое окно (новый UI в iframe)
    const iframeDoc = getIframeDoc();
    if (iframeDoc) {
        handleRootDocument(iframeDoc, false);
    }
}

// ===============================
// 4. ОБРАБОТКА ОДНОГО КОНТЕКСТА (document или iframeDoc)
// ===============================
function handleRootDocument(root, isOldUi) {
    let links = [];

    if (isOldUi) {
        // лог + архив
        links = root.querySelectorAll('.chat-messages a[href]');
    } else {
        // живое окно: точный контейнер сообщения
        links = root.querySelectorAll('div[class*="ChatMessages_RegularMessageContent"] a[href]');
    }

    if (!links.length) return;

    links.forEach(link => {
        if (link.dataset.processed === '1') return;

        const href = (link.href || '')
        if (!href) return;

        const parent = link.closest('div, p, span') || link.parentElement;

        // ---------- ВИДЕО ----------
        if (href.match(/\.(mp4|mov|mkv|webm)$/)) {
            parent.insertAdjacentHTML(
                'afterend',
                `<div data-type="video-label" style="
                    color: #d4092a;
                    font-weight: 700;
                    background: darkgrey;
                    border-radius: 20px;
                    text-align: center;
                    font-size: 17px;
                    text-shadow: 1px 2px 0 #0e0d0d4d;
                    margin-top: 6px;
                ">Видео📺</div>`
            );

            const video = root.createElement('video');
            video.src = href;
            video.controls = true;
            video.style.maxWidth = '300px';
            video.style.display = 'block';
            video.style.marginTop = '6px';
            video.dataset.type = 'video-player';

            parent.nextElementSibling.insertAdjacentElement('afterend', video);

            link.dataset.processed = '1';
            return;
        }

        // ---------- АУДИО ----------
        if (href.match(/\.(mp3|wav|ogg|oga)$/)) {
            parent.insertAdjacentHTML(
                'afterend',
                `<div data-type="audio-label" style="
                    color: #d4092a;
                    font-weight: 700;
                    background: darkgrey;
                    border-radius: 20px;
                    text-align: center;
                    font-size: 17px;
                    text-shadow: 1px 2px 0 #0e0d0d4d;
                    margin-top: 6px;
                ">🎧 Аудио</div>`
            );

            const audio = root.createElement('audio');
            audio.src = href;
            audio.controls = true;
            audio.style.maxWidth = '300px';
            audio.style.display = 'block';
            audio.style.marginTop = '6px';
            audio.dataset.type = 'audio-player';

            parent.nextElementSibling.insertAdjacentElement('afterend', audio);

            link.dataset.processed = '1';
            return;
        }

        // ---------- КАРТИНКИ ----------
        if (href.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
            const img = root.createElement('img');
            img.src = href;
            img.style.width = '120px';
            img.style.cursor = 'zoom-in';
            img.dataset.full = href;

            img.addEventListener('click', openImageViewer);

            link.replaceWith(img);

            link.dataset.processed = '1';
            return;
        }
    });
}

// ===============================
// 5. ПРОСМОТРЩИК ИЗОБРАЖЕНИЙ
// ===============================
function openImageViewer(e) {
    const src = e.target.dataset.full;
    if (!src) return;

    const overlay = document.createElement('div');
    overlay.dataset.type = 'img-viewer';
    overlay.style = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999999;
        cursor: zoom-out;
    `;

    const img = document.createElement('img');
    img.src = src;
    img.style = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 10px;
        box-shadow: 0 0 25px rgba(0,0,0,0.6);
    `;

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => overlay.remove());
}

function addOption(oListbox, text, value) {  //функция добавления опции в список
    var oOption = document.createElement("option");
    oOption.appendChild(document.createTextNode(text));
    oOption.setAttribute("value", value);
    oListbox.appendChild(oOption);
}

function pageClick(event) {
    // Получаем ID нажатой кнопки (например, "0_page_button") и вытаскиваем номер ("0")
    const clickedBtn = event.currentTarget;
    const pageId = clickedBtn.id;
    const pageNum = pageId.split('_')[0];

    // 1. Сбрасываем стили у всех кнопок вкладок (в блоке pages)
    const pagesContainer = document.getElementById('pages');
    if (pagesContainer) {
        const buttons = pagesContainer.querySelectorAll('button');
        buttons.forEach(btn => {
            // Возвращаем стандартный "стеклянный" стиль
            btn.style.backgroundColor = 'rgba(36, 62, 229, 0.5)';
            btn.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
        });
    }

    // 2. Скрываем все страницы с шаблонами
    let i = 0;
    while (document.getElementById(i + "page")) {
        document.getElementById(i + "page").style.display = 'none';
        i++;
    }

    // 3. Выделяем активную (нажатую) кнопку
    // Делаем ей зеленоватый фон и оранжевую полоску сверху, как было в старом дизайне, но с прозрачностью
    clickedBtn.style.backgroundColor = 'rgba(34, 139, 34, 0.5)';
    clickedBtn.style.borderTop = '3px solid orange';

    // 4. Показываем нужную страницу
    const targetPage = document.getElementById(pageNum + "page");
    if (targetPage) {
        targetPage.style.display = 'block';
    }
}


function initializeMyLogic() {
    const afHelper = document.getElementById('AF_helper');
    if (!afHelper) {
        console.error('AF_helper все еще не найден!');
        return;
    }
    console.log('AF_helper успешно найден, визуальная часть загружена.');
    // Мы удалили жесткий поиск через childNodes, так как теперь обращаемся к элементам напрямую по их ID
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
        }
    }, interval);
}

// Запускаем ожидание AF_helper
if (location.host == 'skyeng.autofaq.ai') {
    waitForElement('#AF_helper', initializeMyLogic);
}

// Полностью убираем переменную bimba и функцию инициализации с жесткими индексами.
// Если логики там больше не было, initializeMyLogic можно оставить пустой или удалить,
// так как мы привязываемся по ID напрямую.

// Флаг для контроля дублирования интервала
let isAfIntervalRunning = false;

function refreshTemplates() {
    if (location.host !== 'skyeng.autofaq.ai') return;

    // ДОБАВЛЕНА ЗАЩИТА: Если таблица еще не загрузилась или пуста, не пытаемся её рендерить
    if (typeof table === 'undefined' || !table || !table.length) {
        console.warn('Ожидание загрузки данных шаблонов...');
        return;
    }

    if (!isAfIntervalRunning) {
        setInterval(function () {
            const phone = SearchinAFnewUI("phone");
            const email = SearchinAFnewUI("email");

            const phoneInput = document.getElementById('phone_tr');
            const emailInput = document.getElementById('email_tr');

            if (phoneInput) {
                phoneInput.placeholder = (phone === "-" || phone === "") ? "Телефон" : phone;
            }
            if (emailInput) {
                emailInput.placeholder = (email === "-" || email === "") ? "Почта" : email;
            }
        }, 1000);
        isAfIntervalRunning = true;
    }

    // 1. Очистка старых данных перед рендером новых
    const pagesContainer = document.getElementById('pages');
    if (pagesContainer) pagesContainer.innerHTML = '';

    document.querySelectorAll('[id$="page"]').forEach(el => el.remove());

    const addTmpElement = document.getElementById('addTmp');
    if (addTmpElement) addTmpElement.innerHTML = '';

    let countOfStr = 0;
    let countOfPages = 0;
    let pageType = "";
    let addTmpFlag = 0;

    let currentPage = null;
    let currentRow = null;
    const contentArea = document.getElementById('7str');

    // 3. Парсинг таблицы (теперь table гарантированно существует благодаря защите сверху)
    for (let i = 0; i < table.length; i++) {
        // ... (весь остальной код внутри for остается таким же, каким был в предыдущем ответе)
        const c = table[i];

        switch (c[0]) {
            case '':
                addTmpFlag = 0;
                countOfStr++;

                currentRow = document.createElement('div');
                currentRow.className = 'flex-row'; // Применяем Flexbox из Glassmorphism
                currentRow.id = `${countOfPages}page_${countOfStr}str`;
                if (currentPage) currentPage.appendChild(currentRow);
                break;

            case 'Additional templates':
                addTmpFlag = 1;
                // Добавляем класс, чтобы доп. шаблоны тоже красиво выстраивались
                if (addTmpElement) addTmpElement.className = 'flex-row glass-panel';
                break;

            case 'Страница':
                // Кнопка переключения страницы
                const newPageBut = document.createElement('button');
                newPageBut.textContent = c[1];
                newPageBut.className = 'glass-btn mainButton'; // Стиль Glassmorphism
                newPageBut.id = `${countOfPages}_page_button`;
                newPageBut.background = ""
                newPageBut.addEventListener('click', pageClick);
                pagesContainer.appendChild(newPageBut);

                pageType = c[2];

                // Контейнер самой страницы
                currentPage = document.createElement('div');
                currentPage.id = `${countOfPages}page`;
                contentArea.appendChild(currentPage);

                countOfPages++;
                countOfStr = 1;

                // Если это серверные — рисуем инпуты
                if (pageType === "Серверные") {
                    // -- Блок ссылки --
                    currentRow = document.createElement('div');
                    currentRow.className = 'flex-row';
                    currentRow.id = `${countOfPages}page_${countOfStr}str`;

                    const newInputAlink = document.createElement('input');
                    newInputAlink.id = 'avariyalink';
                    newInputAlink.placeholder = 'Ссылка на трэд или Jira северных';
                    newInputAlink.autocomplete = 'off';
                    newInputAlink.className = `glass-input`;
                    newInputAlink.style.flexGrow = '1'; // Тянется на всю ширину

                    const newbtnclrlink = document.createElement('button');
                    newbtnclrlink.textContent = "🧹";
                    newbtnclrlink.title = "Очистить";
                    newbtnclrlink.className = 'glass-btn mainButton';
                    newbtnclrlink.onclick = () => document.getElementById('avariyalink').value = "";

                    currentRow.appendChild(newInputAlink);
                    currentRow.appendChild(newbtnclrlink);
                    currentPage.appendChild(currentRow);

                    // -- Блок выбора темы --
                    const themeRow = document.createElement('div');
                    themeRow.className = 'flex-row';

                    const newSelectAThemes = document.createElement('select');
                    newSelectAThemes.id = 'avariyatema';
                    newSelectAThemes.className = `glass-input`;
                    newSelectAThemes.style.flexGrow = '1';

                    const newthemeoption = document.createElement('option');
                    newthemeoption.text = "Выбери тематику для серверных";
                    newthemeoption.selected = true;
                    newthemeoption.disabled = true;
                    newthemeoption.value = "thenenotselect";
                    newthemeoption.style = "background-color:orange; color:white;";
                    newSelectAThemes.add(newthemeoption);

                    const newbtnclrtheme = document.createElement('button');
                    newbtnclrtheme.textContent = "🧹";
                    newbtnclrtheme.title = "Сбросить тему";
                    newbtnclrtheme.className = 'glass-btn mainButton';
                    newbtnclrtheme.onclick = () => newSelectAThemes.selectedIndex = 0;

                    themeRow.appendChild(newSelectAThemes);
                    themeRow.appendChild(newbtnclrtheme);
                    currentPage.appendChild(themeRow);

                    // Логика подтягивания тем (Async/Await вместо старых цепочек)
                    let avThemeInterval = setInterval(async () => {
                        if (newSelectAThemes && newSelectAThemes.children.length === 1) {
                            try {
                                const response = await fetch('https://script.google.com/macros/s/AKfycbxNjuQ7EbZZkLEfC1_aSoK4ncsF0W0XSkjYttCj2nQ23BBzMEmDq-vqJL3MvwJk9Pnm_g/exec');
                                const data = await response.json();
                                data.result.forEach(item => {
                                    addOption(newSelectAThemes, item[3], item[4]);
                                });
                                clearInterval(avThemeInterval); // Отключаем интервал после успеха
                            } catch (e) {
                                console.error('Ошибка загрузки серверных тем:', e);
                            }
                        }
                    }, 4000);

                    countOfStr++;
                }

                // Добавляем обычную строку под кнопки
                currentRow = document.createElement('div');
                currentRow.className = 'flex-row';
                currentRow.id = `${countOfPages}page_${countOfStr}str`;
                currentPage.appendChild(currentRow);
                break;

            default:
                // Добавление самих кнопок с шаблонами
                const newBut = document.createElement('button');
                newBut.textContent = c[0];
                newBut.className = 'glass-btn mainButton';

                if (pageType === 'Шаблоны') {
                    if (newBut.textContent === 'Урок NS') newBut.id = "NS";
                    if (newBut.textContent === 'ус+брауз (У)') newBut.textContent = "ус+брауз";
                    if (newBut.textContent === 'ус+брауз (П)') continue; // Пропускаем эту кнопку

                    newBut.addEventListener('click', (event) => buttonsFromDoc(event.target.textContent));

                    if (addTmpFlag === 0) {
                        if (currentRow) currentRow.appendChild(newBut);
                    } else {
                        if (addTmpElement) addTmpElement.appendChild(newBut);
                    }
                } else if (pageType === 'Серверные') {
                    newBut.addEventListener('click', servFromDoc);
                    if (currentRow) currentRow.appendChild(newBut);
                }
                break;
        }
    }

    // Обработка двойного клика для отображения скрытого блока "addTmp"
    if (addTmpElement && addTmpElement.childElementCount > 0) {
        const pageZero = document.getElementById('0page');
        if (pageZero) {
            pageZero.addEventListener('dblclick', function (event) {
                if (checkelementtype(event)) {
                    addTmpElement.style.display = (addTmpElement.style.display === 'none') ? 'flex' : 'none';
                }
            });
        }
    }

    // Имитация клика по первой вкладке, чтобы открыть её по умолчанию
    const firstPageBtn = document.getElementById('0_page_button');
    if (firstPageBtn) firstPageBtn.click();
}

// Переписал на современный Fetch (намного стабильнее и чище, чем XMLHttpRequest)
async function getText() {
    try {
        const response = await fetch(scriptAdr);
        if (response.ok) {
            const data = await response.json();

            // ВАЖНО: Убрали window.table. Оставляем просто присваивание к вашей переменной table
            table = data.result;

            refreshTemplates();
        } else {
            console.error('Ошибка при загрузке шаблонов:', response.status);
        }
    } catch (e) {
        console.error('Сетевая ошибка getText:', e);
    }
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

    // 1. Конфигурация кнопок: ID, Текст, Функция, Только для ТП?
    const menuConfig = [
        { id: "JiraOpenForm", text: "🔎 Jira Search", fn: window.getJiraOpenFormPress, tp: true },
        { id: "crmopersstatuses", text: "🧮 Статусы CRM2", fn: window.getcrmopersstatusesButtonPress, tp: true },
        { id: "butMarks", text: "🎭 Оценки", fn: window.getbutMarksButtonPress, tp: false },
        { id: "smartroomform", text: "🦐 Smartroom", fn: window.getsmartroomformButtonPress, tp: true },
        { id: "butLessonInfo", text: "🎓 Lesson Info", fn: window.getbutLessonInfoButtonPress, tp: false },
        { id: "butFrozeChat", text: "❄ Auto Respond", fn: window.getbutFrozeChatButtonPress, tp: false },
        { id: "buttonGetStat", text: "📊 Статистика", fn: window.getbuttonGetStatButtonPress, tp: false },
        { id: "buttonGetQueue", text: "🚧 Очередь", fn: window.getQueuePress, tp: false }
    ];

    // 2. Создание контейнера
    let menubar = document.getElementById('idmymenu');
    if (!menubar) {
        menubar = document.createElement('div');
        menubar.id = 'idmymenu';
        document.getElementById('rightPanel').appendChild(menubar);
    }

    // Применяем классы
    menubar.className = `m-menu-panel menubarstyle`;
    menubar.style.display = 'none';

    // 3. Генерация кнопок
    const currentSection = (typeof opsection !== 'undefined' ? opsection : "").toString().trim();
    const isTP = currentSection === "ТП" || currentSection === "ТП ОС" || currentSection.startsWith("ТП");

    menubar.innerHTML = menuConfig
        .filter(item => !item.tp || (item.tp && isTP)) // Фильтруем кнопки для ТП
        .map(item => `<div id="${item.id}" class="m-menu-btn">${item.text}</div>`)
        .join('');

    // 4. Навешивание событий (через делегирование для экономии памяти)
    menubar.onclick = (e) => {
        const btn = e.target.closest('.m-menu-btn');
        if (!btn) return;

        const config = menuConfig.find(c => c.id === btn.id);
        if (config && typeof config.fn === 'function') {
            config.fn();
            // По желанию: скрывать меню после клика
            menubar.style.display = 'none';
        }
    };


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
maskBackHide.innerHTML = "❌Скрыть"
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

function getLoginLink(userid) {
    return new Promise((resolve, reject) => {

        if (!userid) {
            return reject(new Error("Пустой userId"));
        }

        const fetchURL = 'https://id.skyeng.ru/admin/auth/login-links';

        const body =
            `login_link_form%5Bid%5D=${encodeURIComponent(userid)}` +
            `&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru` +
            `&login_link_form%5Blifetime%5D=3600` +
            `&login_link_form%5Bcreate%5D=`;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            credentials: 'include'
        };

        chrome.runtime.sendMessage(
            { action: 'getFetchRequest', fetchURL, requestOptions },
            (response) => {

                if (!response || response.success !== true) {
                    console.log('Ошибка при получении логиннера: ', response?.error);
                    return reject(new Error(response?.error || "Неизвестная ошибка"));
                }

                const link = extractLoginLink(response.fetchAnswer || response.fetchansver);
                if (!link) {
                    console.log('Ссылка логинера не найдена');
                    return reject(new Error('Ссылка логинера не найдена'));
                }

                navigator.clipboard.writeText(link)
                    .then(() => resolve(true))
                    .catch(err => {
                        console.log('Не удалось скопировать текст: ', err);
                        reject(err);
                    });
            }
        );
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

// --- ОБНОВЛЕННЫЕ ФУНКЦИИ ДЛЯ СОВМЕСТИМОСТИ С ТЕМАМИ ---

function convertToSeconds(TimeToClose, TimeToAnswer, i) {
    const cardElements = getAllChatsList().chatsList;
    if (!cardElements || !cardElements[i]) return 0;

    if (!TimeToClose && !TimeToAnswer) {
        // Устанавливаем переменную, которую подхватит наша тема
        cardElements[i].style.setProperty('--chat-card-bg', localStorage.getItem('answchatcolor'));
        return 0;
    } else if (!TimeToClose && TimeToAnswer) {
        cardElements[i].style.setProperty('--chat-card-bg', localStorage.getItem('responschatcolor'));
        return 0;
    }

    const [h, m, s] = TimeToClose.split(':').map(Number);
    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds < 120) {
        cardElements[i].style.setProperty('--chat-card-bg', localStorage.getItem('defaclschatcolor'));
    }
    return totalSeconds;
}

function checkchats() {
    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    const cards = doc.querySelectorAll('[class*="DialogsCard_Card"]');
    const timers = doc.querySelectorAll('[class*="DialogsCard_Timers"]');

    // 1. Сброс цвета у ВСЕХ карточек
    cards.forEach(card => card.style.removeProperty('--chat-card-bg'));

    // 2. Проходим по таймерам и ищем родительскую карточку
    timers.forEach(timer => {
        const card = timer.closest('[class*="DialogsCard_Card"]');
        if (!card) return;

        const timeClose = timer.children[2]?.textContent?.trim();
        const timeAnswer = timer.children[1]?.textContent?.trim();

        if (!timeClose && !timeAnswer) {
            // Новый чат (нет таймеров вообще)
            card.style.setProperty('--chat-card-bg', localStorage.getItem('answchatcolor'));
        } else if (!timeClose && timeAnswer) {
            // Есть время на ответ, но нет времени до закрытия
            card.style.setProperty('--chat-card-bg', localStorage.getItem('responschatcolor'));
        } else if (timeClose) {
            // Парсим время закрытия
            const [h, m, s] = timeClose.split(':').map(Number);
            const totalSeconds = (h * 3600) + (m * 60) + (s || 0);

            if (totalSeconds < 120) {
                card.style.setProperty('--chat-card-bg', localStorage.getItem('defaclschatcolor'));
            }
        }
    });
}

// === ФИКС ЗАКРАСКИ КАРТОЧЕК ===
// Инжектим стили ПРЯМО В IFRAME, где живут чаты
function injectChatCardStyle() {
    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc || !doc.head) return;

    let style = doc.getElementById('chmaf-card-fix');
    if (!style) {
        style = doc.createElement('style');
        style.id = 'chmaf-card-fix';
        doc.head.appendChild(style);
    }
    // ВАЖНО: !important обязателен, чтобы пробить заводские стили
    style.textContent = `
        [class*="DialogsCard_Card"] {
            background-color: var(--chat-card-bg, transparent) !important;
            transition: background-color 0.3s ease;
        }
    `;
}

// Запускаем сразу и повторяем (iframe может пересоздаваться)
injectChatCardStyle();
setInterval(injectChatCardStyle, 2000);

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

// Интервальный скрипт удаления promo-image на Skyeng
setInterval(() => {
    // Проверяем, что мы на нужной странице
    if (location.href.startsWith("https://student.skyeng.ru/home")) {

        // Ищем элемент promo-image
        const promo = document.querySelector(".tag.promo-image");

        // Если найден — удаляем
        if (promo) {
            promo.remove();
            // Можно добавить лог, если нужно
            // console.log("promo-image удалён");
        }
    }
}, 500)