// Присваиваем данные константам
let TP_addres;
let TP_addresRzrv;
chrome.storage.local.get({ TP_addr: '' }, function (result) {
    TP_addres = result.TP_addr;
});

chrome.storage.local.get({ TP_addrRzrv: '' }, function (result) {
    TP_addresRzrv = result.TP_addrRzrv;
});
const editorExtensionId = localStorage.getItem('ext_id');
var nameContainer = '';

const UI_PREFIX = 'usinf';

// 1. Конфиг (CRM теперь просто часть массива кнопок для чистоты)
const usersConfig = [
    {
        rowId: 'currUserRow',
        rowVisible: true,
        buttons: [
            { id: 'CurrUser', title: 'Открыть в CRM', content: '👨‍🎓', label: 'CRM' },
            { id: 'CurUsLoginer', title: 'Логинер', content: '🔑', label: 'Логинер' },
            { id: 'CurUstroublesh', title: 'ТШ', content: '🕵️‍♀️', label: 'Troubleshooter' },
            { id: 'CurUsChatHis', title: 'История чатов', content: '☢️', label: 'История' },
            { id: 'CurUsChatHisWA', title: 'WA', isImage: true, src: `chrome-extension://${editorExtensionId}/Images/WA.png`, alt: 'WA', label: 'WhatsApp' },
            { id: 'CurUsUserInf', title: 'UserInf', content: '⚜️', label: 'Инфо' },
            { id: 'CurUsAdminka', title: 'Админка', content: '✏️', label: 'Админка' }
        ]
    },
    {
        rowId: 'nextUsersp',
        rowVisible: false,
        buttons: [
            { id: 'NextUser', title: 'CRM', content: '👽', label: 'CRM' },
            { id: 'NextUsLoginer', title: 'Логинер', content: '🔑', label: 'Логинер' },
            { id: 'NextUstroublesh', title: 'ТШ', content: '🕵️‍♀️', label: 'Troubleshooter' },
            { id: 'NextUsChatHis', title: 'История', content: '☢️', label: 'История' },
            { id: 'NextUsUserInf', title: 'Инфо', content: '⚜️', label: 'Инфо' },
            { id: 'NextUsAdminka', title: 'Админка', content: '✏️', label: 'Админка' }
        ]
    }
];

// 2. Стили (единые для всех)
const glassmorphismCSS = `
/* Основная панель */
.${UI_PREFIX}-glass-panel {
border-radius: 20px !important;
    padding: 24px 16px 16px 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    width: fit-content !important;
    /* Цвета теперь придут из JS динамически */
}

.${UI_PREFIX}-row {
    display: flex !important;
    align-items: center !important;
    height: 40px !important;
}

/* Кнопка - теперь это всегда ровный круг, который не меняет ширину */
.${UI_PREFIX}-btn-glass {
    cursor: pointer !important;
    height: 42px !important;
    width: 42px !important;
    min-width: 42px !important;
    border-radius: 50% !important;

     /* border без !important — иначе он всегда чёрный */
    border: 1px solid rgba(0, 0, 0, 0.08);

    /* УБРАЛИ !important отсюда, чтобы JS мог менять цвет */
    background: #ffffff;

    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin-left: -12px !important;
    position: relative !important;
    z-index: 1 !important;

    /* ДОБАВИЛИ background в transition для плавного перетекания цвета */
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, z-index 0s linear 0.2s !important;
    will-change: transform, background;
}

/* НОВАЯ ФИЧА: Физическое "нажатие" кнопки при клике (микро-уменьшение) */
.${UI_PREFIX}-btn-glass:active {
    transform: translateY(0px) scale(0.92) !important;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
    transition: transform 0.05s ease, box-shadow 0.05s ease !important;
}

.${UI_PREFIX}-btn-glass:first-child {
    margin-left: 0 !important;
}

.${UI_PREFIX}-icon-box {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 18px !important;
}

/* ПАРЯЩАЯ ПОДСКАЗКА (TOOLTIP) - магия происходит здесь */
.${UI_PREFIX}-label-text {
    position: absolute !important;
    bottom: calc(100% + 10px) !important; /* Парит над кнопкой */
    left: 50% !important;
    /* Изначально скрыта и смещена вниз */
    transform: translateX(-50%) translateY(8px) scale(0.9) !important;
    opacity: 0 !important;
    pointer-events: none !important; /* Важно: чтобы мышка не цеплялась за сам текст */

    /* Стеклянный дизайн подсказки */
    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    border-radius: 8px !important;
    padding: 6px 12px !important;

    /* Текст */
    white-space: nowrap !important;
    font-family: 'Segoe UI', system-ui, sans-serif !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #333 !important;

    /* Эффект пружины (Spring Animation) для вау-эффекта */
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    will-change: transform, opacity;
}

/* СОСТОЯНИЕ ПРИ НАВЕДЕНИИ */
.${UI_PREFIX}-btn-glass:hover {
    z-index: 100 !important; /* Выходит на передний план */
    transform: translateY(-4px) !important; /* Кнопка слегка приподнимается */
    box-shadow: 0 8px 16px rgba(0,0,0,0.12) !important;
    /* z-index меняется мгновенно */
    transition: transform 0.2s ease, box-shadow 0.2s ease, z-index 0s linear 0s !important;
}

/* Анимация подсказки при наведении */
.${UI_PREFIX}-btn-glass:hover .${UI_PREFIX}-label-text {
    opacity: 1 !important;
    transform: translateX(-50%) translateY(0) scale(1) !important; /* Выпрыгивает наверх */
}

.${UI_PREFIX}-btn-img {
    width: 22px !important;
    height: 22px !important;
}
`;

// 3. Функции сборки (без лишнего мусора)
function buildBtn(cfg) {
    const content = cfg.isImage
        ? `<img src="${cfg.src}" alt="${cfg.alt}" class="${UI_PREFIX}-btn-img">`
        : `<span>${cfg.content}</span>`;

    return `
    <button class="${UI_PREFIX}-btn-glass" id="${cfg.id}" title="${cfg.title}">
        <div class="${UI_PREFIX}-icon-box">${content}</div>
        <span class="${UI_PREFIX}-label-text">${cfg.label}</span>
    </button>`;
}

function buildRow(cfg) {
    const display = cfg.rowVisible ? 'flex' : 'none';
    return `
    <div id="${cfg.rowId}" class="${UI_PREFIX}-row" style="display: ${display}">
        ${cfg.buttons.map(buildBtn).join('')}
    </div>`;
}

// 4. Финальный результат
var win_UsersInfo = `
<style>${glassmorphismCSS}</style>
<div class="${UI_PREFIX}-glass-panel">
    ${usersConfig.map(buildRow).join('')}
</div>
`;
/* ============================================
   ОРИГИНАЛЬНЫЕ INLINE-СТИЛИ (сохранены)
   ============================================ */
const StylesElemValues = "cursor: pointer; width: 30px; height: 30px; font-size: 15px; margin-left: -8px; font-family: sans-serif,-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Helvetica Neue,Helvetica,Arial,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,NotoEmoji,Twemoji; border-radius: 15px;";

// Блок для работы с шаблонами из гугл таблиц

function requestsRed(taketaskElement) {

    if (taketaskElement) {
        const text = taketaskElement.textContent.trim();
        const color = text === 'Нет входящих запросов' ? 'white' : '#F34723';
        taketaskElement.style.background = color;
    }
}

function newTags(tagName) { //функция добавления нескольких тегов в чат, которые тянутся из дока в комплекте так сказать
    let chatId = getChatId();

    if (chatId) {
        if (tagName.split(',').length < 2)
            fetch("https://skyeng.autofaq.ai/api/conversation/" + chatId + "/payload", {
                "headers": {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                "body": "{\"conversationId\":\"" + chatId + "\",\"elements\":[{\"name\":\"tags\",\"value\":[\"" + tagName + "\"]}]}",
                "method": "POST",
                "credentials": "include"
            });
        else if (tagName.split(',').length == 2)
            fetch("https://skyeng.autofaq.ai/api/conversation/" + chatId + "/payload", {
                "headers": {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                "body": "{\"conversationId\":\"" + chatId + "\",\"elements\":[{\"name\":\"tags\",\"value\":[\"" + tagName.split(',')[0] + "\" ,\"" + tagName.split(',')[1] + "\"]}]}",
                "method": "POST",
                "credentials": "include"
            });
    }
}

function Lessonisnow(iframeDoc) { // добавляем красную надпись о том что сейчас идет урок
    const Convlist = iframeDoc.querySelectorAll('#__next [class^="DialogsCard_Card"]');
    let activeConvElem = null;

    if (Convlist.length > 0) {
        const lessonStatus = SearchinAFnewUI("nextClass-statusHTML");

        if (lessonStatus.includes("идет") || lessonStatus.includes("идёт")) {
            for (let i = 0; i < Convlist.length; i++) {
                if (Convlist[i].getAttribute('aria-selected') === 'true') {
                    activeConvElem = Convlist[i];
                    break;
                }
            }

            if (activeConvElem && activeConvElem.getElementsByClassName('LessonIndicator').length === 0) {
                let LessonIndicator = document.createElement('span');
                LessonIndicator.style.cssText = "background: rgb(187, 5, 5); padding: 5px; color: #fff; font-weight: 400; border: 1px solid black;";
                LessonIndicator.className = 'LessonIndicator';
                LessonIndicator.textContent = lessonStatus;

                activeConvElem.children[0].children[0].append(LessonIndicator)
            }
        }
    }
}

function autoStatusSwitch() { // функция автосмены статуса при авторизации в АФ в своотетствии с базовыми настройками в модуле Settings

    try {
        if (location.href == "https://skyeng.autofaq.ai/tickets/common") {
            let checkOperatorName = document.querySelector('.user_menu-dropdown-user_name').textContent.includes("Обратная связь");
            if (checkOperatorName && checkOperatorName == true) {
                console.log("Это ТП ОС, тут не нужен автостатус никакой!")
                clearInterval(statusCheckInt)
            } else {
                let aStatusVar = localStorage.getItem('afterLoginFunction');
                if (aStatusVar == null) {
                    localStorage.setItem('afterLoginFunction', 'Online')
                    console.log("variable was not found and setted by default value Online ")
                    changeStatus(aStatusVar)
                    clearInterval(statusCheckInt)
                    console.log('Interval timer stopped', 'status was changed to ' + aStatusVar)
                } else {
                    changeStatus(aStatusVar)
                    clearInterval(statusCheckInt)
                    console.log('Interval timer stopped', 'status was changed to ' + aStatusVar)

                }
            }
        }
    } catch (error) {
        console.log("Произошла ошибка:", error.message);
    }
}

const statusCheckInt = setInterval(autoStatusSwitch, 500)

function startTimer() {
    let tagsshowflag = localStorage.getItem('showquicktags');
    const trigertestchat = localStorage.getItem('trigertestchat');
    const hrefisnow = window.location.href;
    const iframeElement = document.querySelector('[class^="NEW_FRONTEND__frame"]');
    let taketaskElement = null;

    if (iframeElement) {
        const iframeDoc = document.querySelector('[class^="NEW_FRONTEND__frame"]').contentDocument || document.querySelector('[class^="NEW_FRONTEND__frame"]').contentWindow.document;
        const Usernamefield = iframeDoc.querySelectorAll('[class^="User_Preview"]')[0];
        const Searchlist = iframeDoc.querySelectorAll('[class^="Operator_DialogsActions"]');

        if (Searchlist) {
            for (let i = 0; i < Searchlist.length; i++) {
                const SearchElement = Searchlist[i].children[1].classList;
                if (Array.from(SearchElement).some((className) => className.includes('Operator_TakeRequestButton'))) {
                    taketaskElement = Searchlist[i].children[1];
                    break;
                }
            }
        }

        if (hrefisnow.includes('skyeng.autofaq.ai/tickets/assigned')) {
            Lessonisnow(iframeDoc);
            requestsRed(taketaskElement);

            if (scriptAdr == TP_addres || scriptAdr == TP_addresRzrv) { // отделение блока только для ТП
                if (hrefisnow.includes('skyeng.autofaq.ai/tickets/assigned') && document.getElementById('TestUsers')) { // добавление в окно тестовых пользователей информации о том с кем общаемся.
                    const iframeDoc = document.querySelector('[class^="NEW_FRONTEND__frame"]').contentDocument || document.querySelector('[class^="NEW_FRONTEND__frame]').contentWindow.document;
                    const Convlist = iframeDoc.querySelectorAll('#__next [class^="DialogsCard_Card"]');

                    if (Convlist.length > 0) {
                        user = SearchinAFnewUI("userType");
                        if (user == "teacher") {
                            vertical = SearchinAFnewUI("teacherVertical");
                        } else {
                            vertical = SearchinAFnewUI("supportVertical");
                        }
                        if (user == '' || vertical == '') {
                            addInfoUser.innerHTML = ''
                        } else {
                            addInfoUser.innerHTML = vertical + " + " + user
                        }
                    } else {
                        addInfoUser.innerHTML = ''
                    }
                }

                if (hrefisnow.includes('skyeng.autofaq.ai/tickets/assigned') && Usernamefield) {
                    if (tagsshowflag === "1") {
                        showTaggs(iframeDoc);
                    } else if (iframeDoc.getElementById('quickTagsdiv')) {
                        iframeDoc.getElementById('quickTagsdiv').remove();
                    }

                }

                if (iframeDoc.getElementById('testchatbtn')) {
                    if (iframeDoc.getElementById('testchatbtn').style.display != 'none' && trigertestchat == "0") {
                        iframeDoc.getElementById('testchatbtn').style.display = 'none'
                    }
                    if (iframeDoc.getElementById('testchatbtn').style.display == 'none' && trigertestchat == "1") {
                        iframeDoc.getElementById('testchatbtn').style.display = ''
                    }
                }

                if (hrefisnow.includes('skyeng.autofaq.ai/tickets/assigned') && Usernamefield && iframeDoc.getElementsByClassName('UsersInfo').length == 0) { // добавляем кнопки и инфу в боковую панель
                    let userTypeName = iframeDoc.createElement('span');
                    userTypeName.id = "userTypeId";
                    userTypeName.style = "margin-left:5px;";
                    Usernamefield.children[0].append(userTypeName);

                    let UsersInfofield = iframeDoc.createElement('div'); // добавляем окно информации о поьзователях
                    UsersInfofield.classList = 'UsersInfo';
                    UsersInfofield.style = "display: block;"
                    UsersInfofield.innerHTML = win_UsersInfo;

                    Usernamefield.append(UsersInfofield)

                    nameContainer = getChatId()
                    let usertypeis = SearchinAFnewUI("userType");

                    let copyCrmFromName = iframeDoc.createElement('span')
                    copyCrmFromName.textContent = ' 💾';
                    copyCrmFromName.style = "cursor:pointer; margin-left:5px;";
                    copyCrmFromName.id = 'diskettocopy';

                    Usernamefield.children[0].append(copyCrmFromName)
                    copyCrmFromName.onclick = function () {
                        const getidafuser = SearchinAFnewUI("id");
                        copyToClipboard("https://crm2.skyeng.ru/persons/" + getidafuser);
                        createAndShowButton('💾 Cкопировано', 'message');
                    }
                    let testchatbtn = iframeDoc.createElement('span')
                    testchatbtn.textContent = ' test';
                    testchatbtn.style = "cursor: pointer;margin-left: 5px;color: crimson;font-size: medium;margin-left: auto;margin-right: auto; display: none;";
                    testchatbtn.id = 'testchatbtn';

                    Usernamefield.children[0].append(testchatbtn)
                    testchatbtn.onclick = function () {
                        sendComment('Тестовый чат');
                        setTimeout(() => { newTaggg('double') }, 500);
                        setTimeout(() => { setTheme('1710') }, 1000);
                    }

                    if (usertypeis === "teacher") {
                        iframeDoc.getElementById('userTypeId').textContent = " (П)";
                        iframeDoc.getElementById('userTypeId').style.color = "#1E90FF";

                    } else if (usertypeis === "student") {
                        iframeDoc.getElementById('userTypeId').textContent = " (У)";
                        iframeDoc.getElementById('userTypeId').style.color = "#DC143C";

                    } else if (usertypeis === "parent") {
                        iframeDoc.getElementById('userTypeId').textContent = " (РУ)";
                        iframeDoc.getElementById('userTypeId').style.color = "#DC143C";
                    }


                    if (usertypeis === "teacher") {
                        iframeDoc.getElementById('userTypeId').textContent = " (П)";
                        iframeDoc.getElementById('userTypeId').style.color = "#1E90FF";

                        // Меняем иконку и текст для ТЕКУЩЕГО (учитель - инопланетянин)
                        const currIcon = iframeDoc.querySelector('#CurrUser .usinf-icon-box span');
                        const currLabel = iframeDoc.querySelector('#CurrUser .usinf-label-text');
                        if (currIcon) currIcon.textContent = "👽";
                        if (currLabel) currLabel.textContent = "CRM П"; // Текст для учителя

                        let nextuseris = SearchinAFnewUI("nextClass-studentId");
                        if (nextuseris != '') {
                            // Меняем иконку и текст для СЛЕДУЮЩЕГО (ученик)
                            const nextIcon = iframeDoc.querySelector('#NextUser .usinf-icon-box span');
                            const nextLabel = iframeDoc.querySelector('#NextUser .usinf-label-text');
                            if (nextIcon) nextIcon.textContent = "👨‍🎓";
                            if (nextLabel) nextLabel.textContent = "CRM У"; // Текст для ученика
                            iframeDoc.getElementById('nextUsersp').style.display = 'flex';
                        }
                    } else if (usertypeis === "student" || usertypeis === "parent") {
                        iframeDoc.getElementById('userTypeId').textContent = " (У)";
                        iframeDoc.getElementById('userTypeId').style.color = "#DC143C";

                        // Текущий (ученик)
                        const currIcon = iframeDoc.querySelector('#CurrUser .usinf-icon-box span');
                        const currLabel = iframeDoc.querySelector('#CurrUser .usinf-label-text');
                        if (currIcon) currIcon.textContent = "👨‍🎓";
                        if (currLabel) currLabel.textContent = "CRM У";

                        let nextuseris = SearchinAFnewUI("nextClass-teacherId");
                        if (nextuseris != '') {
                            // Следующий (учитель)
                            const nextIcon = iframeDoc.querySelector('#NextUser .usinf-icon-box span');
                            const nextLabel = iframeDoc.querySelector('#NextUser .usinf-label-text');
                            if (nextIcon) nextIcon.textContent = "👽";
                            if (nextLabel) nextLabel.textContent = "CRM П";
                            iframeDoc.getElementById('nextUsersp').style.display = 'flex';
                        }
                    } else {
                        const currIcon = iframeDoc.querySelector('#CurrUser .usinf-icon-box span');
                        if (currIcon) currIcon.textContent = "❓";
                    }
                    buttonsfunctionsinfo(iframeDoc, usertypeis);
                } else if (hrefisnow.includes('skyeng.autofaq.ai/tickets/assigned') && Usernamefield && iframeDoc.getElementsByClassName('UsersInfo').length == 1) { // убираем кнопки для обновления.
                    if (getChatId() != nameContainer) {
                        iframeDoc.getElementsByClassName('UsersInfo')[0].remove()
                        iframeDoc.getElementById('userTypeId').remove()
                        iframeDoc.getElementById('diskettocopy').remove()
                    }
                }
            }
        }
    }



    if (localStorage.getItem('audio') === '1' && hrefisnow.includes('skyeng.autofaq.ai')) {
        if (taketaskElement) {
            if (taketaskElement.textContent !== 'Нет входящих запросов') {
                ConvAudio('on');
            } else {
                ConvAudio('off');
            }
        }
    }


}

function buttonsfunctionsinfo(iframeDoc, usertypeis) {
    async function handleLoginLinkClick(idNode, buttonStyle) { // Функция для обновления стиля кнопки и обработки результата
        buttonStyle.background = "coral";
        try {
            await getLoginLink(idNode);
            buttonStyle.background = "rgb(29, 235, 10)";
        } catch (error) {
            console.log('Ошибка: ', error);
            buttonStyle.background = "rgb(201, 17, 17)";
        } finally {
            setTimeout(() => { buttonStyle.background = ""; }, 1000);
        }
    }

    iframeDoc.getElementById('CurrUser').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        const idNode = SearchinAFnewUI("id");
        if (idNode) {
            window.open('https://crm2.skyeng.ru/persons/' + idNode)
        }
    }

    iframeDoc.getElementById('CurUsLoginer').onclick = async function () {
        const idNode = SearchinAFnewUI("id");
        if (idNode) {
            await handleLoginLinkClick(idNode, this.style);

            // --- ЗЕЛЁНАЯ вспышка при успехе ---
            this.style.setProperty('background', 'rgba(46, 213, 115, 0.9)', 'important');
            setTimeout(() => {
                this.style.removeProperty('background');
            }, 1000);
            // ----------------------------------

            createAndShowButton('💾 Ссылка-логинер скопирована', 'message');
        } else {
            // Красная вспышка при ошибке
            this.style.setProperty('background', 'rgba(255, 71, 87, 0.9)', 'important');
            setTimeout(() => {
                this.style.removeProperty('background');
            }, 1000);
        }
    };

    iframeDoc.getElementById('CurUstroublesh').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        const idNode = SearchinAFnewUI("id");
        if (idNode) {
            let curtime = new Date();
            let mesjac;
            let denj;

            if (curtime.getDate() < 10) {
                denj = "0" + curtime.getDate();
            } else {
                denj = curtime.getDate();
            }
            if (curtime.getMonth() + 1 < 10) {
                mesjac = "0" + (curtime.getMonth() + 1);
            } else {
                mesjac = curtime.getMonth() + 1;
            }

            window.open('https://video-trouble-shooter.skyeng.ru/?userId=' + idNode + '&from=' + curtime.getFullYear() + '-' + mesjac + '-'
                + (denj - 1 == 0 ? denj : (denj - 1 < 10 ? "0" + (denj - 1) : denj)) + 'T00:00:00&to=' + curtime.getFullYear() + '-' + mesjac + '-' + denj + 'T23:59:00&order=desc')
        }
    }

    iframeDoc.getElementById('CurUsAdminka').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        const idNode = SearchinAFnewUI("id");
        if (idNode) {
            window.open(`https://id.skyeng.ru/admin/users/${idNode}/update-contacts`)
        }
    }

    iframeDoc.getElementById('CurUsChatHis').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        const idNode = SearchinAFnewUI("id");

        document.getElementById('opennewcat').click();

        if (idNode) {
            document.getElementById('chatuserhis').value = idNode
            btn_search_history.click()
        }

    }

    iframeDoc.getElementById('CurUsChatHisWA').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        const idNode = SearchinAFnewUI("phone").split('+')[1];

        document.getElementById('opennewcat').click();

        if (idNode) {
            document.getElementById('chatuserhis').value = idNode
            btn_search_history.click()
        }

    }

    iframeDoc.getElementById('CurUsUserInf').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        const idNode = SearchinAFnewUI("id");

        if (idNode) {
            const AF_Service = document.getElementById('AF_Service');
            if (AF_Service.style.display === 'none') {
                AF_Service.style.display = '';
            }
            document.getElementById('idstudent').value = idNode;
            getidstudent.click();
        }
    }

    iframeDoc.getElementById('NextUser').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        let requestargument = findrequestargument(usertypeis);

        const idNode = SearchinAFnewUI(requestargument);
        if (idNode) {
            window.open('https://crm2.skyeng.ru/persons/' + idNode)
        }
    }

    iframeDoc.getElementById('NextUsLoginer').onclick = async function () {
        let requestargument = findrequestargument(usertypeis);
        const idNode = SearchinAFnewUI(requestargument);

        if (idNode) {
            await handleLoginLinkClick(idNode, this.style);

            // --- ЗЕЛЁНАЯ вспышка при успехе ---
            this.style.setProperty('background', 'rgba(46, 213, 115, 0.9)', 'important');
            setTimeout(() => {
                this.style.removeProperty('background');
            }, 1000);
            // ----------------------------------

            createAndShowButton('💾 Ссылка-логинер скопирована', 'message');
        } else {
            // --- КРАСНАЯ вспышка при ошибке ---
            this.style.setProperty('background', 'rgba(255, 71, 87, 0.9)', 'important');
            setTimeout(() => {
                this.style.removeProperty('background');
            }, 1000);
            // ----------------------------------
        }
    };

    iframeDoc.getElementById('NextUstroublesh').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        let requestargument = findrequestargument(usertypeis);
        const idNode = SearchinAFnewUI(requestargument);

        if (idNode) {
            let curtime = new Date();
            let mesjac;
            let denj;

            if (curtime.getDate() < 10) {
                denj = "0" + curtime.getDate();
            } else {
                denj = curtime.getDate();
            }
            if (curtime.getMonth() + 1 < 10) {
                mesjac = "0" + (curtime.getMonth() + 1);
            } else {
                mesjac = curtime.getMonth() + 1;
            }

            window.open('https://video-trouble-shooter.skyeng.ru/?userId=' + idNode + '&from=' + curtime.getFullYear() + '-' + mesjac + '-'
                + (denj - 1 == 0 ? denj : (denj - 1 < 10 ? "0" + (denj - 1) : denj)) + 'T00:00:00&to=' + curtime.getFullYear() + '-' + mesjac + '-' + denj + 'T23:59:00&order=desc')
        }

    }

    iframeDoc.getElementById('NextUsAdminka').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        let requestargument = findrequestargument(usertypeis);
        const idNode = SearchinAFnewUI(requestargument);

        if (idNode) {
            let curtime = new Date();
            let mesjac;
            let denj;

            if (curtime.getDate() < 10) {
                denj = "0" + curtime.getDate();
            } else {
                denj = curtime.getDate();
            }
            if (curtime.getMonth() + 1 < 10) {
                mesjac = "0" + (curtime.getMonth() + 1);
            } else {
                mesjac = curtime.getMonth() + 1;
            }

            window.open(`https://id.skyeng.ru/admin/users/${idNode}/update-contacts`)
        }

    }

    iframeDoc.getElementById('NextUsChatHis').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        let requestargument = findrequestargument(usertypeis);
        const idNode = SearchinAFnewUI(requestargument);
        document.getElementById('opennewcat').click();

        if (idNode) {
            document.getElementById('chatuserhis').value = idNode
            btn_search_history.click()
        }

    }

    iframeDoc.getElementById('NextUsUserInf').onclick = function () {
        this.style.background = "lightgreen";
        setTimeout(() => {
            this.style.background = "";
        }, 1000);
        let requestargument = findrequestargument(usertypeis);

        const idNode = SearchinAFnewUI(requestargument);

        if (idNode) {
            const AF_Service = document.getElementById('AF_Service');
            if (AF_Service.style.display === 'none') {
                AF_Service.style.display = '';
            }
            document.getElementById('idstudent').value = idNode;
            getidstudent.click();
        }
    }
}

function findrequestargument(usertypeis) {
    let requestargument = null;
    if (usertypeis == "teacher") {
        requestargument = "nextClass-studentId";
    } else {
        requestargument = "nextClass-teacherId";
    }
    return requestargument
}

function ConvAudio(triger) {
    if (!soundintervalset && triger === 'on') {
        audio.play().catch(() => { }); // ← глушим ошибку
        soundintervalset = setInterval(() => {
            audio.play().catch(() => { }); // ← и тут тоже
        }, localStorage.getItem('splinter') * 1000);
    } else if (soundintervalset && triger === 'off') {
        clearInterval(soundintervalset);
        soundintervalset = null;
    }
}


function showTaggs(iframeDoc) {
    const FieldtoTags = iframeDoc.querySelectorAll('[class^="conversation-payload-form"]')[0]

    if (!iframeDoc.getElementById('quickTagsdiv')) {
        let quickTagsdiv = iframeDoc.createElement('div');
        quickTagsdiv.id = 'quickTagsdiv';
        FieldtoTags.children[0].children[0].children[0].append(quickTagsdiv);

        let btn1 = iframeDoc.createElement('span');
        btn1.id = 'continue_chat_button';
        quickTagsdiv.append(btn1)
        btn1.innerHTML = '<a style="float: left; margin-right: 5px; margin-top: 10px; color: black; cursor: pointer;">Дубль</a>';
        btn1.setAttribute('data-tagname', 'double')

        let btn2 = iframeDoc.createElement('span');
        btn2.id = 'refuse'
        quickTagsdiv.append(btn2)
        btn2.innerHTML = '<a style="float: left; margin-right: 5px; margin-top: 10px; color: black; cursor: pointer;">Отказ</a>';
        btn2.setAttribute('data-tagname', 'refusal_of_help')

        let btn3 = iframeDoc.createElement('span');
        btn3.id = 'TPcallsend'
        quickTagsdiv.append(btn3)
        btn3.innerHTML = '<a style="float: left; margin-right: 5px; margin-top: 10px; color: black; cursor: pointer;">Исход</a>';
        btn3.setAttribute('data-tagname', 'request_forwarded_to_outgoing_tp_crm2')

        let btn4 = iframeDoc.createElement('span');
        btn4.id = 'recgiv'
        quickTagsdiv.append(btn4)
        btn4.innerHTML = '<a style="float: left; margin-right: 5px; margin-top: 10px; color: black; cursor: pointer;">Даны реком</a>';
        btn4.setAttribute('data-tagname', 'recommendations_given ')

        let btn5 = iframeDoc.createElement('span');
        btn5.id = 'solvd'
        quickTagsdiv.append(btn5)
        btn5.innerHTML = '<a style="float: left; margin-right: 5px; margin-top: 10px; color: black; cursor: pointer;">Решен</a>';
        btn5.setAttribute('data-tagname', 'request_solved')

        let btn6 = iframeDoc.createElement('span');
        btn6.id = 'servis'
        quickTagsdiv.append(btn6)
        btn6.innerHTML = '<a style="float: left; margin-right: 5px; margin-top: 10px; color: black; cursor: pointer;">Серверные</a>';
        btn6.setAttribute('data-tagname', 'server_issues')

        let btn7 = iframeDoc.createElement('span');
        btn7.id = 'untargeted'
        quickTagsdiv.append(btn7)
        btn7.innerHTML = '<a style="float: left; margin-right: 5px; margin-top: 10px; color: black; cursor: pointer;">Нецелевой</a>';
        btn7.setAttribute('data-tagname', 'untargeted')

        let btn8 = iframeDoc.createElement('span');
        btn8.id = 'ochered'
        quickTagsdiv.append(btn8)
        btn8.innerHTML = '<a style="float: left; margin-right: 5px; margin-top: 10px; color: black; cursor: pointer;">Очередь</a>';
        btn8.setAttribute('data-tagname', 'queue')

        let btn9 = iframeDoc.createElement('span');
        btn9.id = 'svyazsU'
        quickTagsdiv.append(btn9)
        btn9.innerHTML = '<a style="float: left;margin-right: 5px;margin-top: 10px;color: ##1e90ff;cursor: pointer;font-weight: 700;">П->связь У</a>';
        btn9.setAttribute('comment-text', 'Обратился П, связаться с У')

        let btn10 = iframeDoc.createElement('span');
        btn10.id = 'svyazsP'
        quickTagsdiv.append(btn10)
        btn10.innerHTML = '<a style="float: left;margin-right: 5px;margin-top: 10px;color: #c92e52;cursor: pointer;font-weight: 700;">У->связь П</a>';
        btn10.setAttribute('comment-text', 'Обратился У, связаться с П')

        let btn11 = iframeDoc.createElement('span');
        btn11.id = 'PNO'
        quickTagsdiv.append(btn11)
        btn11.innerHTML = '<a style="float: left;margin-right: 5px;margin-top: 10px;color: ##1e90ff;cursor: pointer;font-weight: 700;">П НО</a>';
        btn11.setAttribute('comment-text', 'Крит Н.О. П')

        let btn12 = iframeDoc.createElement('span');
        btn12.id = 'UNO'
        quickTagsdiv.append(btn12)
        btn12.innerHTML = '<a style="float: left;margin-right: 5px;margin-top: 10px;color: #c92e52;cursor: pointer;font-weight: 700;">У НО</a>';
        btn12.setAttribute('comment-text', 'Крит Н.О. У')

        // Делаем вызов newTaggg из iframe
        function callNewTaggg(tagName) {
            const customEvent = new CustomEvent('callNewTaggg', { detail: { tagName } });
            window.dispatchEvent(customEvent);
        }

        // Делаем вызов sendComent из iframe
        function CallNewComment(comment) {
            const customEvent = new CustomEvent('CallNewComment', { detail: { comment } });
            window.dispatchEvent(customEvent);
        }

        //Обработчик клика на кнопки
        const buttons = quickTagsdiv.querySelectorAll('span');
        buttons.forEach((btn) => {
            btn.addEventListener('click', function () {
                const tagName = this.getAttribute('data-tagname');
                const comment = this.getAttribute('comment-text')
                if (tagName) {
                    callNewTaggg(tagName);
                }
                if (comment) {
                    CallNewComment(comment);
                }
            });
        });
    }
}

function bagPageButtons(butId) {  //с шаблонами тоже фукнкция связана
    txt = document.getElementById(butId).parentElement.childNodes[0].textContent
    for (l = 0; l < table.length; l++)
        if (table[l][0] == txt) {
            resetFlags()
            document.getElementById('inp').value = table[l][Number(butId[4]) + 1]
            break
        }
}

function maskPhoneNumber(number) { // замена части символов телефона
    // Получаем начальную и конечную часть номера
    const start = number.startsWith('+') ? number.substring(0, 5) : number.substring(0, 4);
    const end = number.slice(-2);

    // Вычисляем, сколько символов нужно заменить на звездочки
    const starsCount = number.length - start.length - end.length;
    const stars = '*'.repeat(starsCount);

    return start + stars + end;
}

function maskEmail(email) { // замена части символов email
    // Разделяем email на часть до @ и доменную часть
    const [localPart, domainPart] = email.split('@');

    let maskedLocalPart;

    // Применяем правила маскировки для локальной части email
    if (localPart.length > 5) {
        maskedLocalPart = localPart.substring(0, 3) + '*'.repeat(localPart.length - 5) + localPart.slice(-2);
    } else if (localPart.length === 5 || localPart.length === 4) {
        maskedLocalPart = localPart.substring(0, 2) + '*'.repeat(localPart.length - 3) + localPart.slice(-1);
    } else if (localPart.length <= 3) {
        maskedLocalPart = localPart.substring(0, 1) + '*'.repeat(localPart.length - 1);
    }

    return maskedLocalPart + '@' + domainPart;
}

function transfPageButtons(textFromTable) { //подстановка телефона и почты юзера при использовании шаблона

    if (textFromTable.includes('(phone)')) {
        let phone = '';
        textFromTable = textFromTable.split('(phone)');

        const phoneInput = document.getElementById('phone_tr');
        phone = phoneInput.value || phoneInput.placeholder;

        const phonePattern = /^(\+?[0-9]{7,20})$/;
        if (!phonePattern.test(phone) || phone === 'Телефон') {
            document.getElementById('inp').value = 'Введите номер телефона';
            return;
        }

        phone = maskPhoneNumber(phone);
        textFromTable = textFromTable.join(phone);
    }

    if (textFromTable.includes('(email)')) {
        let email = '';
        textFromTable = textFromTable.split('(email)');

        const emailInput = document.getElementById('email_tr');
        email = emailInput.value || emailInput.placeholder;

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email) || email === 'Почта') {
            document.getElementById('inp').value = "Введите почту";
            return;
        }

        email = maskEmail(email);
        textFromTable = textFromTable.join(email);
    }

    if (textFromTable.includes('(name)')) {
        let name = '';
        textFromTable = textFromTable.split('(name)');

        const tempname = getActiveConvUserName();
        const cyrillicPattern = /^[\u0400-\u04FF]+$/;
        const languageAF = document.getElementById('languageAF').innerHTML;

        if (tempname !== "Неизвестный") {
            if ((languageAF === "Русский" && cyrillicPattern.test(tempname)) || (languageAF === "Английский" && !cyrillicPattern.test(tempname))) {
                name = tempname;
            }
        }

        textFromTable = textFromTable.join(name);
    }

    return textFromTable;
}

async function buttonsFromDoc(butName) { // функция отправки шаблона в зависимости от нажатой кнопки и также взаимодействут с другими функциями
    if (butName == "ус+брауз")
        if (!user || user == 'student')
            butName = "ус+брауз (У)"
        else
            butName = "ус+брауз (П)"

    if (butName == 'Привет') {

        const tempname = getActiveConvUserName();
        const cyrillicPattern = /^[\u0400-\u04FF]+$/;
        const languageAF = document.getElementById('languageAF').innerHTML;

        if (languageAF == "Русский") {
            if (cyrillicPattern.test(tempname) && tempname != "Неизвестный" && tempname != '' && document.getElementById('msg1').innerHTML == "Доработать") {
                txt = "Здравствуйте, " + tempname + "!" + '\r\n' + "Работаю над вашим вопросом — скоро вернусь с результатом."
            } else {
                txt = "Здравствуйте!" + '\r\n' + "Работаю над вашим вопросом — скоро вернусь с результатом."
            }
        } else {
            if (!cyrillicPattern.test(tempname) && tempname != "Неизвестный" && tempname != '' && document.getElementById('msg1').innerHTML == "Доработать") {
                txt = "Hello, " + tempname + "!" + '\r\n' + "I'm working on your question - I'll be back with the results soon."
            } else {
                txt = "Hello!" + '\r\n' + "I'm working on your question - I'll be back with the results soon. "
            }
        }
        if (txt != '') {
            sendAnswerTemplate2(txt)
        }

        return
    }

    if (((butName == '🤬Негатив ОС') || (butName == '🖼Нет изобр в ДЗ ЛК') || (butName == '💨Сброс ответов ДЗ ЛК') || (butName == '🔇Звук ответов ЛК') || (butName == '🖥Размер видео') || butName == ('🖼📱Нет изобр ДЗ в МП')) && document.getElementById('AF_Smartroomform').style.display == 'none')
        document.getElementById('smartroomform').click();

    msgFromTable(butName)

    // start of counter of pressed key script то есть при нажатии на кнопку с шаблоном передает в гугл таблицу ин6формацию какая кнопка была нажата и там уже др скрипты считают сколько  раз и сортируют
}

async function addJiraURL(URLvalue) {
    const hashRoom = document.URL.split('/')[5];

    try {
        const response = await fetch(`https://skyeng.autofaq.ai/api/conversation/${hashRoom}/payload`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "x-csrf-token": aftoken
            },
            body: JSON.stringify({
                conversationId: hashRoom,
                elements: [
                    {
                        name: "taskUrl",
                        value: URLvalue
                    }
                ]
            }),
            credentials: "include"
        });

        if (!response.ok) {
            console.error('Ошибка при отправке Jira URL:', response.statusText);
        } else {
            console.log('Jira URL успешно добавлен');
        }
    } catch (error) {
        console.error('Ошибка сети при отправке Jira URL:', error);
    }
}

async function servFromDoc(event) {
    const buttonText = event.target.textContent;
    msgFromTable(buttonText); // вызов функции отправки сообщения

    const linkInput = document.getElementById('avariyalink');
    if (linkInput && linkInput.value.trim() !== '') {
        const linkToStatSend = linkInput.value.trim();
        sendComment(linkToStatSend);
        await addJiraURL(linkToStatSend);
    }

    const temaSelect = document.getElementById('avariyatema');
    if (temaSelect && temaSelect.selectedIndex > 0) {
        const selectedValue = temaSelect.value;
        const encodedTheme = encodeURIComponent(selectedValue);
        setTheme(encodedTheme);
    }
}


async function getInfo(flag1 = 1) { //функция получения инфо о чате и сервис айди
    let activeConvId = getChatId();

    var adr1 = activeConvId
    var adr = "https://skyeng.autofaq.ai/tickets/assigned/" + activeConvId
    var sessionId = ""
    for (let i = 0; i < chatsArray.length; i++) {
        if (chatsArray[i].id == adr1) {
            sessionId = chatsArray[i].sessionId
            return [adr, adr1, sessionId]
        }
    }
    if (adr1 == undefined)
        adr1 = ""
    if (document.getElementById('msg1').innerHTML != "Доработать" || flag1 == 0) {
        doOperationsWithConversations(adr1)
            .then(result => {
                sessionId = result.sessionId;
                chatsArray.push(result);
                localStorage.setItem('serviceIdGlob', result.serviceId);
            })
            .catch(error => {
                console.error("Ошибка при получении данных:", error);
            });
    }

    return [adr, adr1, sessionId]
}

function tagToChat(btnName) { // функция отправляет тематику в чат, список тематик хранится в спец доке где шаблоны
    for (var l = 0; l < table.length; l++) {
        if (btnName == table[l][0]) {
            setTheme(table[l][1])
            return
        }
    }
}

function setTheme(valueId) {
    let chatId = getChatId();

    if (chatId) {
        fetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
            headers: {
                'content-type': 'application/json',
                'x-csrf-token': aftoken
            },
            body: `{"conversationId":"${chatId}","elements":[{"name":"topicId","value":"${valueId}"}]}`,
            method: 'POST',
            credentials: 'include',
        });
    }
}

function msgFromTable(btnName) { //шаблоны, тематики. теги с таблицы получает и выставляет
    for (var l = 0; l < table.length; l++) {
        if (btnName == table[l][0]) {
            tempindex = [l];
            if (table[l][8] == undefined || table[l][8] == null || table[l][8] == " " || table[l][8] == "") {
                console.log("Не значения тематики")
            } else {
                setTheme(table[l][8])
            }

            setTimeout(() => {
                if (table[tempindex][9] == undefined || table[tempindex][9] == null || table[tempindex][9] == " " || table[tempindex][9] == "") {
                    console.log("Нет значения тегов")
                } else {
                    newTags(table[tempindex][9])
                }
            }, 1000)

            if (document.getElementById('languageAF').innerHTML == "Русский") {
                if (table[l][1] == "Быстрый шаблон") {
                    sendAnswerTemplate2(table[l][2])
                }
                if (table[l][1] == "Текст") {
                    sendAnswer(transfPageButtons(table[l][2]))
                }
                if (table[l][1] == "Шаблон") {
                    sendAnswerTemplate(table[l][2], table[l][3])
                }
                if (table[l][1].indexOf("Рандом") != -1) {
                    var counttmpl = table[l][1][7]
                    var newL = Math.floor(Math.random() * (counttmpl))
                    let splittedarr = table[l][2 + newL].split('$')
                    if (splittedarr[0] == "Текст")
                        sendAnswer(transfPageButtons(splittedarr[1]))
                    else if (splittedarr[0] == "Шаблон") {
                        sendAnswerTemplate(splittedarr[1], splittedarr[1])
                    } else {
                        document.getElementById('inp').value = "Шаблон  указан не верно, повторите попытку еще раз!"
                    }

                }

                break
            } else if (table[l][1].indexOf("Рандом") != -1) {
                var counttmpleng = table[l][1][9];
                var counttmplfor = parseInt(table[l][1][7]);
                var checkcounttmpleng = parseInt(table[l][1][7]) + parseInt(table[l][1][9]);
                if (counttmpleng > 0) {
                    var newLeng = Math.floor(Math.random() * (counttmpleng))
                    if (checkcounttmpleng <= 6) {
                        let splittedarreng = table[l][2 + counttmplfor + newLeng].split('$')
                        if (splittedarreng[0] == "Текст") {
                            sendAnswer(splittedarreng[1])
                        } else if (splittedarreng[0] == "Шаблон") {
                            sendAnswerTemplate(splittedarreng[1], splittedarreng[1])
                        } else {
                            document.getElementById('inp').value = "Шаблон  указан не верно, повторите попытку еще раз!"
                        }
                    } else {
                        document.getElementById('inp').value = "Шаблон  указан не верно, повторите попытку еще раз!"
                    }
                } else {
                    document.getElementById('inp').value = "Нет английского варианта шаблонов"
                }
            } else if (table[l][4] == "") {
                document.getElementById('inp').value = "Нет английского варианта шаблона"
            } else {
                if (table[l][5] == "Быстрый шаблон") {
                    sendAnswerTemplate2(table[l][6])
                }
                if (table[l][5] == "Текст") {
                    sendAnswer(transfPageButtons(table[l][6]))
                }
                if (table[l][5] == "Шаблон") {
                    sendAnswerTemplate(table[l][6], table[l][7])
                }
                break
            }
        }
    }
}

async function loadTemplates(template, word) { //загрузка шаблонов с дока
    if (localStorage.getItem('tpflag') == 'ТП') {
        return await fetch("https://skyeng.autofaq.ai/api/reason8/autofaq/top/batch", {
            "headers": {
                "content-type": "application/json",
                "x-csrf-token": aftoken
            },
            "body": "{\"query\":\"" + word + "\",\"answersLimit\":10,\"autoFaqServiceIds\":[121286, 119638, 121385, 119843, 118980, 121692, 121386, 119636, 119649, 121381, 119841, 120181, 119646, 121384, 121387, 119844, 119025]}",
            "method": "POST",
        })
            .then(response => response.json())
            .then(result => {
                var documentId = ""
                var serviceId = ""
                var queryId = ""
                var AFsessionId = ""
                var tmpText = ""
                var title = ""
                var accuracy = ""
                for (let i = 0; i < result.length; i++) {
                    if (result[i].title == template) {
                        var b = result[i]
                        documentId = b.documentId
                        serviceId = b.serviceId
                        queryId = b.queryId
                        AFsessionId = b.sessionId
                        tmpText = b.text
                        tmpText = tmpText.split("<br>").join('\n')
                        tmpText = tmpText.split("<br>↵").join('\n')
                        tmpText = tmpText.split("&nbsp;").join(' ')
                        tmpText = tmpText.split("<br />").join('\n')
                        // Проверяем, начинается ли текст с <p class="TextEditor_Paragraph__68XKv">, и если да, то заменяем на ''
                        if (tmpText.startsWith('<p class="TextEditor_Paragraph__68XKv">')) {
                            tmpText = tmpText.replace('<p class="TextEditor_Paragraph__68XKv">', '');
                        }
                        tmpText = tmpText.split('<p class="TextEditor_Paragraph__68XKv">').join('\n');
                        tmpText = tmpText.split('</p>').join('')
                        tmpText = tmpText.split('<a').join('TMPaTMP').split('</a').join('TMPENDaTMEPEND')
                        tmpText = tmpText.replace(/<\/?[^>]+>/g, '')
                        tmpText = tmpText.split('TMPaTMP').join('<a').split('TMPENDaTMEPEND').join('</a')
                        title = b.title
                        title = title.split("\"").join("\\\"")
                        accuracy = b.accuracy

                        templatesAF.push([template, documentId, serviceId, queryId, AFsessionId, tmpText, title, accuracy])
                        return ([template, documentId, serviceId, queryId, AFsessionId, tmpText, title, accuracy])
                    }
                }
            })
    } else if (localStorage.getItem('tpflag') == 'ТПPrem') {
        return await fetch("https://skyeng.autofaq.ai/api/reason8/autofaq/top/batch", {
            "headers": {
                "content-type": "application/json",
                "x-csrf-token": aftoken
            },
            "body": "{\"query\":\"" + word + "\",\"answersLimit\":10,\"autoFaqServiceIds\":[121533, 121775, 121527, 121531, 121831]}",
            "method": "POST",
        })
            .then(response => response.json())
            .then(result => {
                var documentId = ""
                var serviceId = ""
                var queryId = ""
                var AFsessionId = ""
                var tmpText = ""
                var title = ""
                var accuracy = ""
                for (let i = 0; i < result.length; i++) {
                    if (result[i].title == template) {
                        var b = result[i]
                        documentId = b.documentId
                        serviceId = b.serviceId
                        queryId = b.queryId
                        AFsessionId = b.sessionId
                        tmpText = b.text
                        tmpText = tmpText.split("<br>").join('\n')
                        tmpText = tmpText.split("<br>↵").join('\n')
                        tmpText = tmpText.split("&nbsp;").join(' ')
                        tmpText = tmpText.split("<br />").join('\n')
                        // Проверяем, начинается ли текст с <p class="TextEditor_Paragraph__68XKv">, и если да, то заменяем на ''
                        if (tmpText.startsWith('<p class="TextEditor_Paragraph__68XKv">')) {
                            tmpText = tmpText.replace('<p class="TextEditor_Paragraph__68XKv">', '');
                        }
                        tmpText = tmpText.split('<p class="TextEditor_Paragraph__68XKv">').join('\n');
                        tmpText = tmpText.split('</p>').join('')
                        tmpText = tmpText.split('<a').join('TMPaTMP').split('</a').join('TMPENDaTMEPEND')
                        tmpText = tmpText.replace(/<\/?[^>]+>/g, '')
                        tmpText = tmpText.split('TMPaTMP').join('<a').split('TMPENDaTMEPEND').join('</a')
                        title = b.title
                        title = title.split("\"").join("\\\"")
                        accuracy = b.accuracy

                        templatesAF.push([template, documentId, serviceId, queryId, AFsessionId, tmpText, title, accuracy])
                        return ([template, documentId, serviceId, queryId, AFsessionId, tmpText, title, accuracy])
                    }
                }
            })
    }

}

async function sendAnswerTemplate2(word, flag = 0) { //функция отправки шаблона 2
    var tmpTxt = ""
    var adr = `https://skyeng.autofaq.ai/tickets/assigned/`
    if (word.length < 50)
        try {
            a = await fetch("https://skyeng.autofaq.ai/api/reason8/autofaq/top/batch", {
                "headers": {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                "referrer": adr,
                "referrerPolicy": "no-referrer-when-downgrade",
                "body": "{\"query\":\"" + word + "\",\"answersLimit\":25,\"autoFaqServiceIds\":[121384]}",
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(a => b = a.json()).then(result => result.forEach(k => {
                if (k.title == word)
                    tmpTxt = k.text
            }))
            tmpTxt = tmpTxt.split("<br>↵").join('\n')
            tmpTxt = tmpTxt.split("&nbsp;").join(' ')
            tmpTxt = tmpTxt.split("<br />").join('\n')
            tmpTxt = tmpTxt.split('<a').join('TMPaTMP').split('</a').join('TMPENDaTMEPEND')
            tmpTxt = tmpTxt.replace(/<\/?[^>]+>/g, '')
            tmpTxt = tmpTxt.split('TMPaTMP').join('<a').split('TMPENDaTMEPEND').join('</a')
        } catch (e) { }
    if (tmpTxt == "")
        tmpTxt = word
    if (document.getElementById('msg1').innerHTML == "Доработать" && flag == 0) {
        document.getElementById('inp').value = tmpTxt
        template_flag = 1
        template_flag2 = 1
    } else {
        tmpTxt = tmpTxt.split("\"").join("\\\"")
        tmpTxt2 = tmpTxt.split('\n')
        tmpTxt3 = ""
        tmpTxt2.forEach(el => tmpTxt3 += "<p>" + el + "</p>\\n")
        tmpTxt = tmpTxt3
        tmpTxt = tmpTxt.split('<p></p>').join("<p><br></p>")
        tmpTxt = tmpTxt.substr(0, tmpTxt.length - 2)
        var values = await getInfo(0)
        var adr = values[0]; var adr1 = values[1]; var uid = values[2]
        fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            "headers": {
                "accept": "*/*",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundarymasjvc4O46a190zh",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrf-token": aftoken
            },
            "referrer": adr,
            "referrerPolicy": "no-referrer-when-downgrade",
            "body": "------WebKitFormBoundarymasjvc4O46a190zh\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + uid + "\",\"conversationId\":\"" + adr1 + "\",\"text\":\"" + tmpTxt + "\",\"suggestedAnswerDocId\":0}\r\n------WebKitFormBoundarymasjvc4O46a190zh--\r\n",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        resetFlags()
        flagggg = 0
    }
}

async function sendAnswerTemplate(template, word, flag = 0, newText = "", flag2 = 0) { // функция отправки шаблона
    var curTemplate
    if (flag == 1) {
        template = template_text
        word = word_text
    }
    for (let i = 0; i < templatesAF.length; i++) {
        if (template == templatesAF[i][0]) {
            curTemplate = templatesAF[i]
            break
        }
    }
    if (curTemplate == undefined)
        curTemplate = await loadTemplates(template, word)

    var documentId = curTemplate[1]
    var serviceId = curTemplate[2]
    var queryId = curTemplate[3]
    var AFsessionId = curTemplate[4]
    var tmpText = transfPageButtons(curTemplate[5])
    var title = curTemplate[6]
    var accuracy = curTemplate[7]
    var values = await getInfo(0)
    var adr = values[0]; var adr1 = values[1]; var uid = values[2]
    if (document.getElementById('msg1').innerHTML === "Доработать" && flag2 === 0) {
        document.getElementById('inp').value = tmpText.replace(/\\n/g, '\n');
        template_text = template;
        word_text = word;
        template_flag = 1;
    } else if (tmpText === "") {
        console.log('Шаблон не найден');
    } else {
        if (flag === 1) {
            tmpText = newText;
        }

        // Экранирование всех нужных символов
        tmpText = tmpText.replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n');

        // Преобразование текста в HTML формат
        const txt2 = tmpText.split('\\n');
        let txt3 = "";
        txt2.forEach(el => txt3 += "<p>" + el + "</p>\\n");
        tmpText = txt3;
        tmpText = tmpText.replace(/<p><\/p>/g, "<p><br></p>");
        tmpText = tmpText.substr(0, tmpText.length - 2);

        resetFlags();

        fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            headers: {
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryZ3ivsA3aU80QEBST",
                "x-csrf-token": aftoken
            },
            body: `------WebKitFormBoundaryZ3ivsA3aU80QEBST\r\nContent-Disposition: form-data; name="payload"\r\n\r\n{"sessionId":"${uid}","conversationId":"${adr1}","text":"${tmpText}","ext":null,"files":[],"suggestedAnswerDocId":${documentId},"autoFaqServiceId":${serviceId},"autoFaqSessionId":"${AFsessionId}","autoFaqQueryId":"${queryId}","autoFaqTitle":"${title}","autoFaqQuery":"${word}","autoFaqAccuracy":${accuracy}}\r\n------WebKitFormBoundaryZ3ivsA3aU80QEBST--\r\n`,
            method: "POST",
            credentials: "include"
        });
    }

}

async function sendAnswer(txt, flag = 1) { //функция отправки ответа
    var values = await getInfo(flag)
    var adr = values[0]; var adr1 = values[1]; var uid = values[2]
    var txt2 = txt.split('\n')
    var txt3 = ""
    txt2.forEach(el => txt3 += "<p>" + el + "</p>\\n")
    txt3 = txt3.split("\"").join("\\\"")
    txt3 = txt3.split('<p></p>').join("<p><br></p>")
    txt3 = txt3.substr(0, txt3.length - 2)
    if (document.getElementById('msg1').innerHTML == "Доработать" && flag) {
        resetFlags()
        document.getElementById('inp').value = txt
    }
    else {
        fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            "headers": {
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryFeIiMdHaxAteNUHd",
                "x-csrf-token": aftoken
            },
            "body": "------WebKitFormBoundaryFeIiMdHaxAteNUHd\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + uid + "\",\"conversationId\":\"" + adr1 + "\",\"text\":\"" + txt3 + "\"}\r\n------WebKitFormBoundaryFeIiMdHaxAteNUHd--\r\n",
            "method": "POST",
            "credentials": "include"
        });
        resetFlags()
    }
}
// конец блока для работы с шаблонами из гугл таблиц и в целом отправки ответа с обновлением таймера автозакрытия чата

let activeTimers = {};
let updateInterval; // Сохраняем ссылку на интервал обновления

function formatTime(value) {
    return value.toString().padStart(2, '0');
}

function formatISOStringWithoutMillis(date) {
    return date.toISOString().split('.')[0] + '.000Z'; // Форматируем и убираем миллисекунды
}

function updateTimerDisplay(chatHash, timeString) {
    const iframeDoc = document.querySelector('[class^="NEW_FRONTEND__frame"]').contentDocument || document.querySelector('[class^="NEW_FRONTEND__frame"]').contentWindow.document;
    const convElement = iframeDoc.querySelector(`[data-conv-id="${chatHash}"]`);
    if (convElement) {
        let techSupTimeBar = convElement.querySelector('.techSupTimeBar-class');
        if (!techSupTimeBar) {
            techSupTimeBar = document.createElement('div');
            techSupTimeBar.classList.add('techSupTimeBar-class');
            techSupTimeBar.style = "background-color:#31b731; font-weight:700; text-align:center; border-radius:20px; margin-top: 3px;";
            convElement.append(techSupTimeBar);
        }
        techSupTimeBar.textContent = timeString;
    } else {
        //console.error(`Element with data-conv-id="${chatHash}" not found.`);
        if (activeTimers[chatHash]) {
            clearInterval(activeTimers[chatHash]);
            delete activeTimers[chatHash];
        }
    }
}

function startTimerForTimestamp(timestamp, chatHash) {
    const targetTime = new Date(timestamp);
    activeTimers[chatHash] = setInterval(() => {
        const now = new Date();
        const diff = now - targetTime;

        if (diff < 0) {
            clearInterval(activeTimers[chatHash]);
            delete activeTimers[chatHash];
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        const timeString = `⛑️ ${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
        updateTimerDisplay(chatHash, timeString);
    }, 1000);
}

setInterval(startTimer, 500)

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




