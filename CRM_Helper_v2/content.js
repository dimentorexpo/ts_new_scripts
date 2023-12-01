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

let tableres;
var soundsconteinerCRM;
var soundintervalsetCRM = null
var appverresult;

var win_Menu = // описание кнопок меню
    `
    <div id="jirafinder" class="menubtnsCRM">🔎Jira search</div>
    <div id="SrvDskCRMbtn" class="menubtnsCRM">🛠 Service Desk</div>
    <div id="smartroomformCRM" class="menubtnsCRM">🦐Smartroom</div>
    <div id="butLessonInfoCRM" class="menubtnsCRM">🎓 Lesson Info</div>
    <div id="butdiagtoolsCRM" class="menubtnsCRM">🛠 Diagnostic tools</div>
    <div id="btnOperStatus" class="menubtnsCRM">🕵️‍♀️ OperStatus</div>
    <div id="btnCreateTestRoom" class="menubtnsCRM">🎲 Create Test Room</div>
    <div id="btnAlarmclock" class="menubtnsCRM">🔕Reminder</div>
    <div id="btnSettingsApp" class="menubtnsCRM">⚙ Settings</div>
    <span id="testuchenik" style="height: 277px;">Тест У</span>
    <span id="testprepod" style="height: 277px;">Тест П</span>
`;

//Объявление кнопки в верхней панели CRM
var upmenubtn = document.createElement('span')
upmenubtn.innerText = "Меню"
upmenubtn.id = 'MenubarCRM'
upmenubtn.style = "cursor:pointer;font-weight:500; text-shadow: 1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000; border: 1px solid black; padding: 8px; background: #5083ff; border-radius:18px"
//конец обьявления кнопки

function addOptionCRM(oListboxCRM, text, value) {  //функция добавления опции в список
    var oOptionCRM = document.createElement("option");
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

function maxLengthCheck(object) // функция ограничения кол-ва символов в полях
{
    if (object.value.length > object.maxLength)
        object.value = object.value.slice(0, object.maxLength)
}

function onlyNumbers(object) { // функция для разрешения ввода только цифр
    object.value = object.value.replace(/[^0-9]/g, '');
}

function onlyNumbersAndComma(object) { // функция для разрешения ввода только цифр и запятой
    object.value = object.value.replace(/[^0-9,]/g, '');
}

async function getText() { // обьявление функции получающей текст из гугл таблицы страницы Версии приложений
    const appdata = await getStorageData(['scriptAdrAppVers']); // Получаем данные из хранилища
    xhr = new XMLHttpRequest();
    xhr.open('GET', appdata);
    xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;

        if (xhr.status == 200) {
            try {
                var r = JSON.parse(xhr.responseText),
                    appverresult = r["result"];

                tableres = appverresult;
                console.log('Версии приложений получены')

            } catch (e) { console.log(e) }
        }
    }
    xhr.send()
}

function logginerfortestsCRM(polzovatel) {
    chrome.runtime.sendMessage({ action: 'getLoginer', userid: polzovatel }, function (response) {
        if (response.success) {
            // Теперь, когда мы обратно в контексте страницы, копируем в буфер обмена
            navigator.clipboard.writeText(response.loginLink).then(() => {
                // Уведомляем пользователя об успешном копировании
                console.log('Логинер создан для пользователя: ' + polzovatel);
            }).catch(err => {
                // Обрабатываем ошибки, связанные с буфером обмена
                console.error('Не удалось скопировать текст: ', err);
            });
        } else {
            // Обрабатываем ошибки, связанные с получением логиннера
            alert('Не удалось получить логиннер: ' + response.error);
        }
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

var init = setInterval(initialize, 3000) //заносим в переменную чтобы ее потом в функции можно было удалить интервал

getText() //вызов функции получающей текст из гугл таблицы страницы Версии приложений

let menubarcrm = document.createElement('div')
menubarcrm.style = `background: white; position:absolute; left: 950px; top: 50px; border: 0px solid #000000; display:none; min-height: 60px; min-width:170px; box-shadow: -1px 4px 16px 7px rgba(34, 60, 80, 0.09); z-index:999;`
menubarcrm.id = 'idmymenucrm'
menubarcrm.innerHTML = win_Menu;

document.body.append(menubarcrm)

if (document.querySelector('crm-container') != null) {
    document.querySelector('crm-container').addEventListener('click', function (event) {
        var e = document.getElementById('idmymenucrm');
        if (!e.contains(event.target)) e.style.display = 'none';
    });
}

document.getElementById('testuchenik').onclick = function () {
    document.getElementById('testuchenik').classList.add('active')
    logginerfortestsCRM(localStorage.getItem('test_studCRM'))
    setTimeout(function () { document.getElementById('testuchenik').classList.remove('active') }, 1000)
}

document.getElementById('testprepod').onclick = function () {
    document.getElementById('testprepod').classList.add('active')
    logginerfortestsCRM(localStorage.getItem('test_teachCRM'))
    setTimeout(function () { document.getElementById('testprepod').classList.remove('active') }, 1000)
}



function screenshotsCRM() { //просмотр и трансформация скриншотов в активном чате
    if (document.getElementsByTagName('crm-row').length != 0 || document.getElementsByTagName('crm-row') != null || document.getElementsByTagName('crm-row').length != undefined) {
        for (let i = 0; i < document.getElementsByTagName('crm-row').length; i++) {
            if (document.getElementsByTagName('crm-row')[i].children.length != 0 && document.getElementsByTagName('crm-row')[i].children[0].innerText == 'Комментарий') {
                var divimg = document.getElementsByTagName('crm-row')[i]
                for (let j = 0; j < divimg.querySelectorAll('a').length; j++) {
                    if (divimg.querySelectorAll('a')[j].host == 'vimbox-resource-chat-prod.imgix.net' || divimg.querySelectorAll('a')[j].host == 'vimbox-resource-storage-prod-ru-1.storage.yandexcloud.net' || divimg.querySelectorAll('a')[j].host == 'math-prod.storage.yandexcloud.net' || divimg.querySelectorAll('a')[j].host == 'i.imgur.com' || divimg.querySelectorAll('a')[j].host == 'joxi.ru' || divimg.querySelectorAll('a')[j].host == 'skr.sh' && divimg.querySelectorAll('a')[j].hasAttribute('data-lightbox') == false) {
                        var img = document.createElement('img')
                        img.style.width = '100px'
                        var alink = document.createElement('a')
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
    takeTaskBtn = document.getElementsByClassName('mat-button-wrapper');
    if (localStorage.getItem('audioCRM') == 1 && window.location.href.indexOf('https://crm2.skyeng.ru/customer-support/start') !== -1) {
        if (takeTaskBtn.length > 0) {
            if (document.getElementsByClassName('mat-button-disabled').length == 0 && takeTaskBtn[13] && takeTaskBtn[13].innerText == 'Взять новую задачу') {
                if (localStorage.getItem('repeatsound') == 0) {
                    // soundintervalsetCRM = '';
                    if (!soundintervalsetCRM) {
                        audioCRM.play();
                        soundintervalsetCRM = true
                    }
                } else {
                    if (!soundintervalsetCRM) {
                        audioCRM.oncanplaythrough = (event) => {
                            var playedPromise = audioCRM.play();
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