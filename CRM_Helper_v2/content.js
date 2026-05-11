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

var tableres;
let soundsconteinerCRM;
let soundintervalsetCRM = null
let appverresult;

const win_Menu = // описание кнопок меню
    `
    <div id="jirafinder" class="menubtnsCRM">🔎Jira search</div>
    <div id="SrvDskCRMbtn" class="menubtnsCRM">🛠 Service Desk</div>
    <div id="smartroomformCRM" class="menubtnsCRM">🦐Smartroom</div>
    <div id="butLessonInfoCRM" class="menubtnsCRM">🎓 Lesson Info</div>
    <div id="butAutoschedule" class="menubtnsCRM">👽 Автоподбор</div>
    <div id="butdiagtoolsCRM" class="menubtnsCRM">🛠 Diagnostic tools</div>
    <div id="btnOperStatus" class="menubtnsCRM">🕵️‍♀️ OperStatus</div>
    <div id="btnCreateTestRoom" class="menubtnsCRM">🎲 Create Test Room</div>
    <div id="btnAlarmclock" class="menubtnsCRM">🔕Reminder</div>
    <div id="btnSettingsApp" class="menubtnsCRM">⚙ Settings</div>
    <span id="testuchenik" class="crm-side-btn crm-side-btn-left" style="height: 277px;">Тест У</span>
    <span id="testprepod" class="crm-side-btn crm-side-btn-right" style="height: 277px;">Тест П</span>
`;

//Объявление кнопки в верхней панели CRM
let upmenubtn = document.createElement('span')
upmenubtn.innerText = "Меню"
upmenubtn.id = 'MenubarCRM'
upmenubtn.className = 'crm-menu-trigger'
upmenubtn.style = "cursor:pointer;font-weight:500; text-shadow: 1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000; border: 1px solid black; padding: 8px; background: #5083ff; border-radius:18px"
//конец обьявления кнопки

function createWindowCRM(id, topKey, leftKey, content) { // Функция для создания окна и настройки стилей
    const windowElement = document.createElement('div');
    document.body.append(windowElement);

    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    windowElement.classList.add('showedwindows', 'crm-scope');
    windowElement.style = `top: ${storedTop}px; left: ${storedLeft}px;`;
    windowElement.style.display = 'none';
    windowElement.setAttribute('id', id);
    windowElement.innerHTML = content;

    windowElement.onmousedown = function (event) {
        if (checkelementtype(event)) {
            let startX = event.clientX;
            let startY = event.clientY;
            let elemLeft = windowElement.offsetLeft;
            let elemTop = windowElement.offsetTop;

            function onMouseMove(event) {
                if (!(event.buttons & 1)) {
                    onMouseUp();
                    return;
                }
                let deltaX = event.clientX - startX;
                let deltaY = event.clientY - startY;

                // Boundary check
                let newLeft = elemLeft + deltaX;
                let newTop = elemTop + deltaY;
                let maxLeft = window.innerWidth - windowElement.offsetWidth;
                let maxTop = window.innerHeight - windowElement.offsetHeight;
                newLeft = Math.max(0, Math.min(newLeft, maxLeft));
                newTop = Math.max(0, Math.min(newTop, maxTop));

                windowElement.style.left = `${newLeft}px`;
                windowElement.style.top = `${newTop}px`;

                localStorage.setItem(topKey, String(newTop));
                localStorage.setItem(leftKey, String(newLeft));
            }

            document.addEventListener('mousemove', onMouseMove);

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mouseup', onMouseUp);
        }
    };

    return windowElement;
}

function setDisplayStyle(element, value) { // функция изменения отображения
    element.style.display = value;
}

function hideWindowOnDoubleClick(id) { // Функция для скрытия окна по двойному клику
    const windowElement = document.getElementById(id);
    windowElement.ondblclick = function (a) {
        if (checkelementtype(a)) {
            setDisplayStyle(windowElement, 'none');
        }
    };
}

function hideWindowOnClick(windowId, buttonId) { // Функция для скрытия окна по клику на кнопку
    const windowElement = document.getElementById(windowId);
    const buttonElement = document.getElementById(buttonId);

    buttonElement.onclick = function () {
        setDisplayStyle(windowElement, 'none');
    };
}

function addOptionCRM(oListboxCRM, text, value) {  //функция добавления опции в список
    let oOptionCRM = document.createElement("option");
    oOptionCRM.appendChild(document.createTextNode(text));
    oOptionCRM.setAttribute("value", value);
    oListboxCRM.appendChild(oOptionCRM);
}

function checkelementtype(a) { // проверка на какой элемент нажали
    let elem = document.elementFromPoint(a.clientX, a.clientY)

    if (elem.nodeName != 'BUTTON' && elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA' && elem.nodeName != 'SELECT' && elem.className != "checkbox-audio-switch-CRM") {
        return true;
    }
    return false;
}

function maxLengthCheck(object) { // функция ограничения кол-ва символов в полях
    if (object.value.length > object.maxLength)
        object.value = object.value.slice(0, object.maxLength)
}

function checkMinMaxValue(input) {     // функция првоерки находится ли значение вводиміе значения в допустимом диапазоне
    const minValue = parseInt(input.min, 10);
    const maxValue = parseInt(input.max, 10);
    let currentValue = parseInt(input.value, 10);

    if (currentValue < minValue) {
        input.value = minValue;
    } else if (currentValue > maxValue) {
        input.value = maxValue;
    }
}

function onlyNumbers(object) { // функция для разрешения ввода только цифр
    object.value = object.value.replace(/[^0-9]/g, '');
}

function onlyNumbersAndComma(object) { // функция для разрешения ввода только цифр и запятой
    object.value = object.value.replace(/[^0-9,]/g, '');
}

function logginerfortestsCRM(polzovatel) {
    return new Promise((resolve, reject) => {
        const fetchURL = 'https://id.skyeng.ru/admin/auth/login-links';
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${polzovatel}&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=`,
            mode: 'cors',
            credentials: 'include',
        };
        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (loginresponse) {
            if (loginresponse.success) {
                const link = extractLoginLink(loginresponse.fetchansver);
                if (link) {
                    navigator.clipboard.writeText(link).then(() => {
                        console.log('Логинер создан для пользователя: ' + polzovatel);
                        resolve(true);
                    }).catch(err => {
                        console.error('Не удалось скопировать текст: ', err);
                        reject(err);
                    });
                } else {
                    console.log('Ссылка логинера не найдена в ответе');
                    reject(new Error('Ссылка логинера не найдена'));
                }
            } else {
                alert('Не удалось получить логиннер: ' + loginresponse.error);
                reject(new Error(loginresponse.error));
            }
        });
    });
}

const copyToClipboard = str => { // функция копирования в буфер обмена
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

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

// ==================== Custom Image Viewer (replaces lightbox) ====================
function createImageViewer() {
    if (document.getElementById('crm-image-viewer')) return;
    var viewer = document.createElement('div');
    viewer.id = 'crm-image-viewer';
    viewer.className = 'crm-scope';
    viewer.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(10,10,18,0.95);display:none;align-items:center;justify-content:center;backdrop-filter:blur(16px);cursor:zoom-out;opacity:0;transition:opacity 0.25s ease;';
    viewer.innerHTML = `
        <img id="crm-viewer-img" style="max-width:90vw;max-height:90vh;border-radius:12px;box-shadow:0 24px 80px rgba(0,0,0,0.8);transform:scale(0.9);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);border:1px solid rgba(255,255,255,0.1);">
        <button id="crm-viewer-close" style="position:absolute;top:24px;right:24px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:#fff;width:44px;height:44px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);transition:all 0.2s;">✕</button>
        <span id="crm-viewer-caption" style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);color:var(--crm-text-secondary);font-size:13px;background:rgba(0,0,0,0.5);padding:6px 16px;border-radius:20px;backdrop-filter:blur(8px);"></span>
    `;
    document.body.append(viewer);

    function close() {
        viewer.style.opacity = '0';
        setTimeout(function() { viewer.style.display = 'none'; }, 250);
    }
    viewer.addEventListener('click', function(e) {
        if (e.target === viewer || e.target.id === 'crm-viewer-close') close();
    });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); });
}

function openImageViewer(src, caption) {
    createImageViewer();
    var viewer = document.getElementById('crm-image-viewer');
    var img = document.getElementById('crm-viewer-img');
    var cap = document.getElementById('crm-viewer-caption');
    img.src = src;
    if (cap) cap.textContent = caption || '';
    viewer.style.display = 'flex';
    requestAnimationFrame(function() {
        viewer.style.opacity = '1';
        img.style.transform = 'scale(1)';
    });
}

function initialize() { //функция инициализации кнопки меню в верхней области CRM
    try {
        if (location.origin == 'https://crm2.skyeng.ru')
            if (document.getElementsByClassName('mat-toolbar-row')[0] != undefined && document.getElementById('MenubarCRM') == null) {
                document.getElementsByClassName('mat-toolbar-row')[0].children[1].children[0].append(upmenubtn)

                document.getElementById('MenubarCRM').onclick = function () {
                    if (document.getElementById('idmymenucrm').style.display == 'none') {
                        document.getElementById('idmymenucrm').style.display = ''
                        let xvarmenu = parseInt(document.getElementById('MenubarCRM').getBoundingClientRect().x - 21)
                        menubarcrm.style.left = xvarmenu + 'px';
                        let hghtelem = document.getElementById("idmymenucrm").offsetHeight - 12
                        document.getElementById("testuchenik").style = "height:" + hghtelem + "px";
                        document.getElementById("testprepod").style = "height:" + hghtelem + "px";
                    } else {
                        document.getElementById('idmymenucrm').style.display = 'none'

                    }
                }

                clearInterval(init)
            }
    }
    catch (e) { console.error(e, e.stack); }
}

let init = setInterval(initialize, 3000) //заносим в переменную чтобы ее потом в функции можно было удалить интервал

let menubarcrm = document.createElement('div')
menubarcrm.style = `background: white; position:absolute; left: 950px; top: 50px; border: 0px solid #000000; display:none; min-height: 60px; min-width:170px; box-shadow: -1px 4px 16px 7px rgba(34, 60, 80, 0.09); z-index:999;`
menubarcrm.id = 'idmymenucrm'
menubarcrm.className = 'crm-scope'
menubarcrm.innerHTML = win_Menu;

document.body.append(menubarcrm)

if (document.querySelector('crm-container') != null) {
    document.querySelector('crm-container').addEventListener('click', function (event) {
        let e = document.getElementById('idmymenucrm');
        if (!e.contains(event.target)) e.style.display = 'none';
    });
}

document.getElementById('testuchenik').onclick = function () {
    document.getElementById('testuchenik').classList.add('active');

    logginerfortestsCRM(localStorage.getItem('test_studCRM')).then(() => {
        // Успешное завершение асинхронной операции
        document.getElementById('testuchenik').classList.remove('active');
        document.getElementById('testuchenik').classList.add('successbtn');
        setTimeout(function () { document.getElementById('testuchenik').classList.remove('successbtn') }, 1000);
    })
        .catch(() => {
            // Ошибка в асинхронной операции
            document.getElementById('testuchenik').classList.remove('active');
            document.getElementById('testuchenik').classList.add('errorbtn');
            setTimeout(function () { document.getElementById('testuchenik').classList.remove('errorbtn') }, 1000);
        });
};

document.getElementById('testprepod').onclick = function () {
    document.getElementById('testprepod').classList.add('active');

    logginerfortestsCRM(localStorage.getItem('test_teachCRM')).then(() => {
        // Успешное завершение асинхронной операции
        document.getElementById('testprepod').classList.remove('active');
        document.getElementById('testprepod').classList.add('successbtn');
        setTimeout(function () { document.getElementById('testprepod').classList.remove('successbtn') }, 1000);
    })
        .catch(() => {
            // Ошибка в асинхронной операции
            document.getElementById('testprepod').classList.remove('active');
            document.getElementById('testprepod').classList.add('errorbtn');
            setTimeout(function () { document.getElementById('testprepod').classList.remove('errorbtn') }, 1000);
        });
};


function screenshotsCRM() { //просмотр и трансформация скриншотов в активном чате
    var rows = document.getElementsByTagName('crm-row');
    if (!rows || !rows.length) return;
    for (var i = 0; i < rows.length; i++) {
        if (rows[i].children.length > 0 && rows[i].children[0].innerText == 'Комментарий') {
            var divimg = rows[i];
            var links = divimg.querySelectorAll('a');
            for (var j = 0; j < links.length; j++) {
                var link = links[j];
                var allowedHosts = ['vimbox-resource-chat-prod.imgix.net', 'vimbox-resource-storage-prod-ru-1.storage.yandexcloud.net', 'math-prod.storage.yandexcloud.net', 'i.imgur.com', 'joxi.ru', 'skr.sh'];
                if (allowedHosts.indexOf(link.host) === -1 || link.hasAttribute('data-crm-img')) continue;
                var img = document.createElement('img');
                img.style.width = '100px';
                img.src = link.href;
                img.alt = 'Изображение';
                var alink = document.createElement('a');
                alink.setAttribute('data-crm-img', 'true');
                alink.style.cursor = 'zoom-in';
                alink.appendChild(img);
                alink.href = link.href;
                alink.addEventListener('click', function(e) {
                    e.preventDefault();
                    openImageViewer(this.href, '');
                });
                link.replaceWith(alink);
            }
        }
    }
}

// MutationObserver instead of setInterval for performance
var screenshotsObserver = new MutationObserver(function(mutations) {
    var shouldProcess = false;
    for (var m = 0; m < mutations.length; m++) {
        if (mutations[m].type === 'childList') {
            for (var n = 0; n < mutations[m].addedNodes.length; n++) {
                var node = mutations[m].addedNodes[n];
                if (node.nodeType === 1 && (node.tagName === 'CRM-ROW' || (node.querySelector && node.querySelector('crm-row')))) {
                    shouldProcess = true;
                    break;
                }
            }
        }
        if (shouldProcess) break;
    }
    if (shouldProcess) screenshotsCRM();
});

if (document.body) {
    screenshotsObserver.observe(document.body, { childList: true, subtree: true });
    screenshotsCRM();
} else {
    window.addEventListener('DOMContentLoaded', function() {
        screenshotsObserver.observe(document.body, { childList: true, subtree: true });
        screenshotsCRM();
    });
}

let takeTaskBtn;
function checkforsoundplay() {
    takeTaskBtn = document.getElementsByClassName('mdc-button');
    if (localStorage.getItem('audioCRM') == 1 && window.location.href.indexOf('https://crm2.skyeng.ru/customer-support/start') !== -1) {
        if (takeTaskBtn.length > 0) {

            const btn = Array.from(takeTaskBtn).find(b => b.innerText.trim() === 'Взять новую задачу');
            if (document.getElementsByClassName('mat-mdc-button-disabled').length == 0 && btn && !btn.classList.contains('mat-mdc-button-disabled')) {
                if (localStorage.getItem('repeatsound') == 0) {
                    // soundintervalsetCRM = '';
                    if (!soundintervalsetCRM) {
                        audioCRM.play();
                        soundintervalsetCRM = true
                    }
                } else {
                    if (!soundintervalsetCRM) {
                        audioCRM.oncanplaythrough = (event) => {
                            let playedPromise = audioCRM.play();
                            if (playedPromise) {
                                playedPromise.catch((e) => {
                                    console.log(e)
                                    if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
                                        console.log(e.name);
                                    }
                                }).then(() => {
                                    console.log("playing sound repeatedly !!!");
                                });
                            }
                        }
                        soundintervalsetCRM = setInterval(() => { audioCRM.play() }, localStorage.getItem('splinterCRM') * 1000)
                    }
                }

            } else {
                if (soundintervalsetCRM != null || soundintervalsetCRM != true) {
                    clearInterval(soundintervalsetCRM)
                    soundintervalsetCRM = null
                }
                if (soundintervalsetCRM == true) { soundintervalsetCRM = null }
            }
        }
    } else {
        if (soundintervalsetCRM != null || soundintervalsetCRM != true) {
            clearInterval(soundintervalsetCRM)
            soundintervalsetCRM = null
        }

        if (soundintervalsetCRM == true) {
            soundintervalsetCRM = null
        }
    }
}

setInterval(checkforsoundplay, 1000);

function createAndShowButton(text) {
    let btnSuccess = document.createElement("button");
    btnSuccess.id = "successButton";
    btnSuccess.className = "sucsbtn";
    btnSuccess.textContent = text;

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
