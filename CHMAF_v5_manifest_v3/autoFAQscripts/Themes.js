var tableth;
var btnthstyls = 'margin-left:5px; width:160px; height: 44px;';
var btnTagsTPtyles = 'margin-left:5px; width:135px; height: 25px;';
var btnTagsKCtyles = 'margin-left:5px; width:160px; height: 25px;';
var chbxTagstyles = 'margin: 2px; width: 20px;';
var KCThemesFlag = 0;

var win_Themes =  // описание элементов окна Тематик
    `<div style="display: flex; width: 350px; padding-bottom:15px;">
        <span style="width: 350px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 350;" id="themes_header">
                                <button class="mainButton buttonHide" title="скрывает меню" id="hideMeThemes">hide</button>
								<button class="mainButton smallbtn" id="ClearSmartroomData" title="Очищает выбранные тэги">🧹</button>
								<button class="mainButton smallbtn" id="backtomenu" style="display:none">🔙</button>
								<button class="mainButton smallbtn" id="themesinstr" style="float:right;" title="Инструкция по этой форме">❓</button>
                                <button class="mainButton smallbtn" id="getnewthdata" title="Обновляет тематики из документа с шаблонами без необходимости обновлять страницу для актуализации" style="float: right; margin-right: 5px">🔄</button>
                        </div>

						<div>
							<input class="${exttheme}" id="linktojiracoment" placeholder="Ссылка на Jira" title="Введите сюда ссылку на Jira, чтобы по нажатию на ракету добавить ее и в заметки в чат и в поле АФ ссылка на Jira" style="margin-left: 20px; width: 78%; text-align: center; margin-bottom:5px;">
							<button class="mainButton smallbtn" id="linktojirasend" title="Отправить введеную ссылку в комментарий чата и в поле Ссылка на Jira в АФ">🚀</button>
						</div>

						<div id="themes_body" style="margin-left:10px;display:flex; flex-wrap:wrap;">
							<label style="color:bisque; width:330px; margin-bottom: 5px; text-align: center;border: 1px solid #3e4f55;background: chocolate;border-radius: 10px;font-weight: 700; font-size: 17px; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); letter-spacing: .5rem;">Темы</label>
							<br>
						</div>

						<div id="tags_body" style="margin-left:10px;display:flex; flex-wrap:wrap;">
							<label style="color: #87ff5e; width:330px; margin-bottom: 5px;text-align: center;border: 1px solid black;border-radius: 10px;margin-top: 5px;background: darkgray;font-weight: 700; font-size: 17px; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); letter-spacing: .5rem;">Теги</label>
						</div>
                        <div id="multitag_body" class="thonlyfortp" style="margin-left:10px;display:flex; flex-wrap:wrap;">
                            <br>
                            <button class="mainButton" id="multitag" style="width: 330px; margin-top:5px;">Мультитег</button>
                        </div>
                </span>
        </span>
</div>`;

const wintThemes = createWindow('AF_Themes', 'winTopThemes', 'winLeftThemes', win_Themes);
hideWindowOnDoubleClick('AF_Themes');

async function startThemes() {

    // модуль проверки адреса загрузки тематик
    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv', 'TP_addrth', 'KC_addrth']); // Получаем данные из хранилища

    // Присваиваем данные константам
    const KC_addr = data.KC_addr;
    const TP_addr = data.TP_addr;
    const KC_addrRzrv = data.KC_addrRzrv;
    const TP_addrRzrv = data.TP_addrRzrv;
    const KC_addrth = data.KC_addrth;
    const TP_addrth = data.TP_addrth;
    let scriptAdrTH = localStorage.getItem('scriptAdrTH');
    let scriptAdrChek = localStorage.getItem('scriptAdr');

    if (scriptAdrChek === TP_addr || scriptAdrChek === TP_addrRzrv) {
        scriptAdrTH = TP_addrth;
    } else if (scriptAdrChek === KC_addr || scriptAdrChek === KC_addrRzrv) {
        scriptAdrTH = KC_addrth;
        KCThemesFlag = 1;
    } else if (!scriptAdrTH) {
        scriptAdrTH = TP_addrth;
    }

    localStorage.setItem('scriptAdrTH', scriptAdrTH);
    getTextThemes(scriptAdrTH)
    // конец модуля
}

startThemes()

document.getElementById('AF_Themes').ondblclick = function (a) { // скрытие окна Тематик и тегов по двойному клику
    if (checkelementtype(a)) { document.getElementById('hideMeThemes').click(); }
}

document.getElementById('hideMeThemes').onclick = function () { // скрытие окна Тематик
    if (document.getElementById('AF_Themes').style.display == '') {
        document.getElementById('AF_Themes').style.display = 'none'
        document.getElementById('themes').classList.remove('activeScriptBtn')
    }

    if (document.getElementById('backtomenu').style.display == '')
        document.getElementById('backtomenu').click()
}

document.getElementById('themesinstr').onclick = function () { // открытие интсрукции по тематикам
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-themes%D0%9A%D0%BD%D0%BE%D0%BF%D0%BA%D0%B0%D0%A2%D0%B5%D0%BC%D1%8B')
}

function getThemesButtonPress() { // открытие окна темы
    if (document.getElementById('AF_Themes').style.display == '') {
        document.getElementById('AF_Themes').style.display = 'none'
        document.getElementById('themes').classList.remove('activeScriptBtn')
    } else {
        document.getElementById('AF_Themes').style.display = ''
        document.getElementById('themes').classList.add('activeScriptBtn')
    }
}

function pagethClick(event) { // обновленный обработчик событий
    const areaThbtns = document.getElementById('themes_body');
    const pagethId = event.target.id.split('_')[0]; // получение ID нажатой кнопки
    document.getElementById('backtomenu').style.display = '';

    for (let i = 0; i < areaThbtns.childElementCount; i++) {
        try {
            document.getElementById(i + 'pageth').style.display = 'none';
            document.getElementById(i + '_pageth_button').style.display = 'none';
        } catch (e) {
            // обработка возможных исключений
        }
    }
    document.getElementById(pagethId + 'pageth').style.display = 'flex';
}

function getTextThemes(appThemes) { // функция обновления текста для тематик из документа
    const xhrThemes = new XMLHttpRequest();
    xhrThemes.open('GET', appThemes);
    xhrThemes.onreadystatechange = function () {
        if (xhrThemes.readyState === 4 && xhrThemes.status === 200) {
            try {
                const rth = JSON.parse(xhrThemes.responseText);
                const resultth = rth["result"];
                tableth = resultth;
                console.log('Updated themes');
            } catch (e) {
                console.log(e);
            } finally {
                refreshThemesBtns();
            }
        }
    };
    xhrThemes.send();
}

function refreshThemesBtns() { // функция обновляет тематики которые загружены были с гугл таблицы и сформированы их в tableth

    while (document.getElementById('themes_body').children[2] != undefined) // удаляем кнопки страниц тематик
        document.getElementById('themes_body').children[2].remove()
    while (document.getElementById('tags_body').children[1] != undefined) // удаляем кнопки тегов
        document.getElementById('tags_body').children[1].remove()
    for (i = 0; document.getElementById(i + 'themesbtn') != undefined; i++) // удаляем страницы тематик
        document.getElementById(i + 'themesbtn').remove()
    countOfthStr = 0
    countOfthPages = 0
    addTagFlag = 0
    addFontFlag = 0
    areaThbtns = document.getElementById('themes_body')
    areaTagbtns = document.getElementById('tags_body')
    if (KCThemesFlag == 1) { document.getElementById('tags_body').children[0].style.marginBottom = '5px' }
    for (i = 0; i < tableth.length; i++) {
        c = tableth[i]
        switch (c[0]) {
            case '': // если в таблице пустая строка создаем разрыв
                addTagFlag = 0
                countOfthStr++
                var newstrth = document.createElement('div')
                newstrth.style.margin = '5px'
                newstrth.id = countOfthPages + 'pageth_' + countOfthStr + 'strth'
                areaThbtns.lastElementChild.appendChild(newstrth)
                break

            case 'Тэги': // Если тип "Тэг" помечаем флагом
                addTagFlag = 1
                break
            case 'Темы': // Если тип "Тема" создаем кнопку и новый div
                var newpagethBut = document.createElement('button');
                newpagethBut.textContent = c[1];
                newpagethBut.classList.add('mainButton')
                newpagethBut.style = btnthstyls;
                if (c[2] !== '') { newpagethBut.title = c[2]; }
                if (c[3] !== '') { newpagethBut.style.fontSize = c[3] + 'px'; }
                newpagethBut.addEventListener('click', pagethClick);
                newpagethBut.id = countOfthPages + '_pageth_button';
                areaThbtns.appendChild(newpagethBut);

                var newpageth = document.createElement('div')
                newpageth.id = countOfthPages + 'pageth'
                newpageth.style = 'flex-wrap:wrap;display:none;'
                areaThbtns.appendChild(newpageth)

                countOfthPages++

                countOfthStr = 1

                addTagFlag = 0

                var newstrth = document.createElement('div')
                newstrth.id = countOfthPages + 'pageth_' + countOfthStr + 'strth'
                newstrth.style = 'flex-wrap:wrap;display:flex;'
                areaThbtns.lastElementChild.appendChild(newstrth)
                break
            default:
                var newBut = document.createElement('button')
                newBut.textContent = c[0]
                newBut.value = c[1]
                newBut.classList.add('mainButton')
                if (c[2] != '') { newBut.title = c[2] } // если есть title добавляем его
                if (c[3] != '') { addFontFlag = 1 } else { addFontFlag = 0 } // проверяем указан ли размер шрифта
                if (addTagFlag == 0) {
                    newBut.style = btnthstyls
                    if (addFontFlag == 1) { newBut.style.fontSize = c[3] + 'px' } // если указан размер шрифта назначеем его
                    newBut.addEventListener('click', function (event) {
                        setTheme(event.target.value);
                    });
                    areaThbtns.lastElementChild.lastElementChild.appendChild(newBut)
                } else {
                    if (KCThemesFlag == 1) {
                        newBut.style = btnTagsKCtyles
                    } else {
                        newBut.style = btnTagsTPtyles
                    }
                    if (addFontFlag == 1) { newBut.style.fontSize = c[3] + 'px' } // если указан размер шрифта назначеем его
                    newBut.name = "tagssbtn"
                    if (newBut.value == 'refusal_of_help') {
                        newBut.addEventListener('click', function (event) {
                            RefBtnTag(event.target.value);
                        });
                    } else if (newBut.value == 'smartroom') {
                        newBut.addEventListener('click', function (event) {
                            SmartBtnTag(event.target.value);
                        });
                    } else {
                        newBut.addEventListener('click', function (event) {
                            newTaggg(event.target.value);
                        });
                    }
                    areaTagbtns.appendChild(newBut)

                    if (KCThemesFlag == 0) {
                        var newChekB = document.createElement('input')
                        newChekB.type = "checkbox"
                        newChekB.name = "tagcheck"
                        newChekB.style = chbxTagstyles
                        areaTagbtns.appendChild(newChekB)
                    }
                }
        }
    }
}

document.getElementById('backtomenu').onclick = function () { // возврат к выбору кнопок тематик
    for (i = 0; i < areaThbtns.childElementCount; i++) {
        try {
            document.getElementById(i + 'pageth').style.display = 'none'
            document.getElementById(i + '_pageth_button').style.display = ''
        } catch (e) { }
    }
    document.getElementById('backtomenu').style.display = 'none'
}

function RefBtnTag(BtnValue) { // при теге отказ открывает окно отказа
    newTaggg(BtnValue)
}

function SmartBtnTag(BtnValue) { // при теге smartroom открывает окно smartroom
    if (document.getElementById('AF_Smartroomform').style.display == 'none') {
        document.getElementById('smartroomform').click();
    }
    newTaggg(BtnValue)
}

document.getElementById('getnewthdata').onclick = function () {  // по клику на кнопку сработает функция обновления тематик из документа
    document.getElementById('backtomenu').style.display = 'none'
    startThemes()
}

document.getElementById('ClearSmartroomData').onclick = function () { // очистка чекбоксов мультитэг
    let allcheckboxtags = document.getElementsByName('tagcheck')
    for (let i = 0; i < allcheckboxtags.length; i++) {
        if (allcheckboxtags[i].checked) {
            allcheckboxtags[i].checked = false;
        }
    }
}

document.getElementById('multitag').onclick = function () { // откправка нескольких тэгов (мультитэг)
    let allcheckboxtags = document.getElementsByName('tagcheck')
    let alltagsbtns = document.getElementsByName('tagssbtn')
    let tagsvaluesarr = [];
    let chatId = getChatId();

    if (chatId) {
        for (let i = 0; i < allcheckboxtags.length; i++) {
            if (allcheckboxtags[i].checked) {
                tagsvaluesarr.push('\"' + alltagsbtns[i].value + '\"')
                if (alltagsbtns[i].value == 'smartroom' && document.getElementById('AF_Smartroomform').style.display == 'none') {
                    document.getElementById('smartroomform').click()
                }
            }
        }
        if (tagsvaluesarr.length > 0) {
            tagsvaluesarr = tagsvaluesarr.join(',')

            fetch("https://skyeng.autofaq.ai/api/conversation/" + chatId + "/payload", {
                "headers": {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                "body": "{\"conversationId\":\"" + chatId + "\",\"elements\":[{\"name\":\"tags\",\"value\":[" + tagsvaluesarr + "]}]}",
                "method": "POST",
                "credentials": "include"
            });

            for (let i = 0; i < allcheckboxtags.length; i++) {
                if (allcheckboxtags[i].checked) {
                    allcheckboxtags[i].checked = false;
                }
            }
        } else createAndShowButton('Не выбраны чекбоксы, выберите, пожалуйста, 1 или несколько и повторите попытку', 'error')
    }
}

document.getElementById('linktojirasend').onclick = function () { // добавленгие ссылки на Jira
    let getval = document.getElementById('linktojiracoment').value;
    let chatId = getChatId();


    if (getval && chatId) {
        if (window.location.href.includes('tickets/assigned')) {
            sendComment(getval)
        }
        fetch("https://skyeng.autofaq.ai/api/conversation/" + chatId + "/payload", {
            "headers": {
                "content-type": "application/json",
                "x-csrf-token": aftoken
            },
            "body": "{\"conversationId\":\"${splitter[5]}\",\"elements\":[{\"name\":\"taskUrl\",\"value\":\"" + getval + "\"}]}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        })
        document.getElementById('linktojiracoment').value = "";
    }
}

if (KCThemesFlag == 1) {
    let needtohide = document.getElementsByClassName('thonlyfortp')
    for (i = 0; i < needtohide.length; i++) {
        needtohide[i].style.display = 'none'
    }
}