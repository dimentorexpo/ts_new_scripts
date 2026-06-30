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
    <span id="testuchenik" style="height: 277px;">Тест У</span>
    <span id="testprepod" style="height: 277px;">Тест П</span>
`;

//Объявление кнопки в верхней панели CRM
let upmenubtn = document.createElement('span')
upmenubtn.innerText = "Меню"
upmenubtn.id = 'MenubarCRM'
upmenubtn.style = "cursor:pointer;font-weight:500; text-shadow: 1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000; border: 1px solid black; padding: 8px; background: #5083ff; border-radius:18px"
//конец обьявления кнопки

function createWindowCRM(id, topKey, leftKey, content) { // Функция для создания окна и настройки стилей
    const windowElement = document.createElement('div');
    document.body.append(windowElement);

    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    windowElement.classList.add('showedwindows');
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

                windowElement.style.left = `${elemLeft + deltaX}px`;
                windowElement.style.top = `${elemTop + deltaY}px`;

                localStorage.setItem(topKey, String(elemTop + deltaY));
                localStorage.setItem(leftKey, String(elemLeft + deltaX));
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
            body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${polzovatel}&login_link_form%5Btarget%5D=https%3A%2F%2Fvimbox.skyeng.ru%2Fhome&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=`,
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
    if (document.getElementsByTagName('crm-row').length != 0 || document.getElementsByTagName('crm-row') != null || document.getElementsByTagName('crm-row').length != undefined) {
        for (let i = 0; i < document.getElementsByTagName('crm-row').length; i++) {
            if (document.getElementsByTagName('crm-row')[i].children.length != 0 && document.getElementsByTagName('crm-row')[i].children[0].innerText == 'Комментарий') {
                let divimg = document.getElementsByTagName('crm-row')[i]
                for (let j = 0; j < divimg.querySelectorAll('a').length; j++) {
                    if (divimg.querySelectorAll('a')[j].host == 'vimbox-resource-chat-prod.imgix.net' || divimg.querySelectorAll('a')[j].host == 'vimbox-resource-storage-prod-ru-1.storage.yandexcloud.net' || divimg.querySelectorAll('a')[j].host == 'math-prod.storage.yandexcloud.net' || divimg.querySelectorAll('a')[j].host == 'i.imgur.com' || divimg.querySelectorAll('a')[j].host == 'joxi.ru' || divimg.querySelectorAll('a')[j].host == 'skr.sh' && divimg.querySelectorAll('a')[j].hasAttribute('data-lightbox') == false) {
                        let img = document.createElement('img')
                        img.style.width = '100px'
                        let alink = document.createElement('a')
                        alink.setAttribute('data-lightbox', 'imgs');
                        alink.append(img)
                        img.src = divimg.querySelectorAll('a')[j].href
                        img.alt = 'Изображение'
                        alink.href = img.src;
                        divimg.querySelectorAll('a')[j].replaceWith(alink)
                    }
                }


            }
        }
    }
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

screenshotsCRM()
setInterval(screenshotsCRM, 5000)

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

// === ОБЪЕДИНЁННЫЙ БЛОК: UserBlocker + CallStatus ===
(function() {
    'use strict';

    // --- Защита от повторной инициализации ---
    if (window.__skyCRMHelperInitialized) return;
    window.__skyCRMHelperInitialized = true;

    const isPersonPage = () => /^https:\/\/crm2\.skyeng\.ru\/persons\/\d+/.test(location.href);

    // ============================================================
    // USER BLOCKER (статус пользователя)
    // ============================================================
    let ubCheckInterval = null;
    let ubIsLoading = false;

    function ubParseStatus(html) {
        const tableMatch = html.match(/<th[^>]*>\s*Статус\s*<\/th>\s*<td>([^<]+)<\/td>/i);
        const divMatch   = html.match(/статус:\s*<strong>([^<]+)<\/strong>/i);
        const looseMatch = html.match(/статус[:\s]*<strong>([^<]+)<\/strong>/i);
        const m = tableMatch || divMatch || looseMatch;
        return m ? m[1].trim() : null;
    }

    function ubStopChecker() {
        if (ubCheckInterval) { clearInterval(ubCheckInterval); ubCheckInterval = null; }
    }

    function ubRenderBadge(status, sid) {
        const field = document.querySelector('[data-qa="person-id-field"]');
        if (!field) return;

        const container = field.closest('.data-container') || field.parentElement;
        let badge = document.getElementById('isUserBlocked');

        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'isUserBlocked';
            badge.style.cssText = 'color:#fff; padding:2px 6px; margin-top:4px; margin-bottom:4px; border-radius:3px; font-weight:700; display:block; width:fit-content; font-size:12px;';
            const badges = container.querySelector('.badges');
            badges ? container.insertBefore(badge, badges) : container.appendChild(badge);
        }

        badge.textContent = status || 'неизвестно';
        badge.dataset.pid = sid;

        if (status === 'активный') badge.style.backgroundColor = '#28a745';
        else if (status === 'временно отключен') badge.style.backgroundColor = '#d32b49';
        else badge.style.backgroundColor = '#6c757d';
    }

    function ubTick() {
        if (!isPersonPage()) { ubStopChecker(); return; }

        const field = document.querySelector('[data-qa="person-id-field"]');
        if (!field) return;

        const sid = field.textContent.trim().replace(/\D/g, '');
        if (!sid) return;

        const badge = document.getElementById('isUserBlocked');
        if (badge && badge.dataset.pid === sid) { ubStopChecker(); return; }
        if (ubIsLoading) return;

        ubRenderBadge('Загрузка…', sid);
        ubIsLoading = true;

        const fetchURL = `https://id.skyeng.ru/admin/users/${encodeURIComponent(sid)}`;
        const requestOptions = {
            method: 'GET',
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "ru,en;q=0.9",
                "cache-control": "max-age=0",
                "priority": "u=0, i",
                "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"YaBrowser\";v=\"26.3\", \"Yowser\";v=\"2.5\", \"YaBrowserCorp\";v=\"144\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "none",
                "sec-fetch-user": "?1",
                "sec-gpc": "1",
                "upgrade-insecure-requests": "1"
            },
            credentials: 'include'
        };

        chrome.runtime.sendMessage(
            { action: 'getFetchRequest', fetchURL, requestOptions },
            (response) => {
                ubIsLoading = false;
                if (!response || response.success !== true) {
                    console.error('[UserBlock] Ошибка:', response?.error);
                    ubRenderBadge('ошибка', sid);
                    ubStopChecker();
                    return;
                }
                const html = response.fetchAnswer || response.fetchansver || '';
                const status = ubParseStatus(html);
                if (status) {
                    ubRenderBadge(status, sid);
                    console.log(`[UserBlock] ${sid} → ${status}`);
                } else {
                    ubRenderBadge('статус не найден', sid);
                    console.warn('[UserBlock] Статус не спарсился для', sid);
                }
                ubStopChecker();
            }
        );
    }

    function ubStartCheck() {
        if (ubCheckInterval) return;
        if (!isPersonPage()) return;
        const old = document.getElementById('isUserBlocked');
        if (old) old.remove();
        ubIsLoading = false;
        ubTick();
        ubCheckInterval = setInterval(ubTick, 1000);
    }

    // ============================================================
    // CALL STATUS (isForbiddenToCall)
    // ============================================================
    let csCheckInterval = null;
    let csIsLoading = false;

    function csParsePersonId() {
        const m = location.pathname.match(/\/persons\/(\d+)/);
        return m ? m[1] : null;
    }

    function csInsertElement() {
        const menu = document.getElementById('MenubarCRM');
        if (!menu) return null;
        let el = document.getElementById('callStatusIndicator');
        if (el) return el;
        el = document.createElement('span');
        el.id = 'callStatusIndicator';
        el.style.cssText = `
            margin-left: 12px; padding: 6px 12px; border-radius: 12px;
            font-size: 14px; font-weight: 500; display: inline-flex;
            align-items: center; gap: 6px; font-family: system-ui, sans-serif;
            vertical-align: middle; cursor: default;
        `;
        menu.insertAdjacentElement('afterend', el);
        return el;
    }

    function csRender(status, text) {
        const el = csInsertElement();
        if (!el) return;

        if (status === 'loading') {
            el.style.cssText += 'background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;';
            el.innerHTML = '⏳ Загрузка статуса…';
        } else if (status === 'forbidden') {
            el.style.cssText += 'background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;';
            el.innerHTML = `<span style="width:16px;height:16px;border:2px solid #dc2626;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;background:#dc2626;flex-shrink:0;color:#fff;font-size:11px;font-weight:bold;">✓</span>Не звонить ученику`;
        } else if (status === 'allowed') {
            el.style.cssText += 'background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0;';
            el.innerHTML = `<span style="width:16px;height:16px;border:2px solid #16a34a;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;background:#16a34a;flex-shrink:0;font-size:10px;">🟢</span>Можно звонить ученику`;
        } else if (status === 'error') {
            el.style.cssText += 'background: #fef3c7; color: #d97706; border: 1px solid #fde68a;';
            el.innerHTML = '⚠️ ' + (text || 'Ошибка загрузки');
        } else {
            el.style.cssText += 'background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;';
            el.textContent = text || 'Статус неизвестен';
        }
    }

    function csLoad() {
        if (!isPersonPage()) return;
        if (csIsLoading) return;

        const personId = csParsePersonId();
        if (!personId) return;

        const existing = document.getElementById('callStatusIndicator');
        if (existing && existing.dataset.personId === personId) return;

        csIsLoading = true;
        csRender('loading');

        const fetchURL = `https://backend.skyeng.ru/api/persons/${personId}`;
        const requestOptions = {
            method: 'GET',
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "ru",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"YaBrowser\";v=\"26.3\", \"Yowser\";v=\"2.5\", \"YaBrowserCorp\";v=\"144\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "sec-gpc": "1"
            },
            credentials: 'include'
        };

        chrome.runtime.sendMessage(
            { action: 'getFetchRequest', fetchURL, requestOptions },
            (response) => {
                csIsLoading = false;
                if (!response || response.success !== true) {
                    console.error('[CallStatus] Ошибка:', response?.error);
                    csRender('error', response?.error || 'Ошибка сервера');
                    return;
                }
                let data;
                try {
                    const raw = response.fetchAnswer || response.fetchansver || response.data;
                    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
                } catch (e) {
                    console.error('[CallStatus] Parse error:', e);
                    csRender('error', 'Неверный ответ');
                    return;
                }
                const forbidden = data?.data?.isForbiddenToCall;
                const userTypeCRM = data?.data?.type;
                const el = document.getElementById('callStatusIndicator');

                if (userTypeCRM === "teacher") {
                    // Удаляем бейдж и останавливаем проверку
                    if (el) el.remove();
                    csStopCheck();
                    return;
                }

                if (el) el.dataset.personId = personId;

                if (forbidden === true) csRender('forbidden');
                else if (forbidden === false) csRender('allowed');
                else csRender('unknown', 'Статус не определён');
                
            }
        );
    }

    function csStartCheck() {
        if (csCheckInterval) return;
        if (!isPersonPage()) return;
        csLoad();
        csCheckInterval = setInterval(csLoad, 2000);
    }

    function csStopCheck() {
        if (csCheckInterval) { clearInterval(csCheckInterval); csCheckInterval = null; }
    }

    // ============================================================
    // ОБЩАЯ НАВИГАЦИЯ (единый перехват history)
    // ============================================================
    function onNavigate() {
        setTimeout(() => {
            if (!isPersonPage()) {
                ubStopChecker();
                csStopCheck();
                const el = document.getElementById('callStatusIndicator');
                if (el) el.remove();
                return;
            }

            // UserBlocker
            const field = document.querySelector('[data-qa="person-id-field"]');
            const sid = field ? field.textContent.trim().replace(/\D/g, '') : null;
            const ubBadge = document.getElementById('isUserBlocked');
            if (!ubBadge || (sid && ubBadge.dataset.pid !== sid)) {
                ubStopChecker();
                ubStartCheck();
            }

            // CallStatus
            const personId = csParsePersonId();
            const csEl = document.getElementById('callStatusIndicator');
            if (!csEl || (personId && csEl.dataset.personId !== personId)) {
                csStopCheck();
                csStartCheck();
            }
        }, 500);
    }

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
        originalPushState.apply(this, args);
        onNavigate();
    };
    history.replaceState = function(...args) {
        originalReplaceState.apply(this, args);
        onNavigate();
    };
    window.addEventListener('popstate', onNavigate);

    // Запуск при старте
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ubStartCheck();
            csStartCheck();
        });
    } else {
        ubStartCheck();
        csStartCheck();
    }
})();
// === КОНЕЦ ОБЪЕДИНЁННОГО БЛОКА ===