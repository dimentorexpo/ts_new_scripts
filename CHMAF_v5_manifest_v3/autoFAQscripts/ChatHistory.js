var win_Chathis =  // описание элементов окна Истории чатов
    `<div style="display: flex; width: 410px;">
        <span style="width: 410px">
			<span style="cursor: default;">
				<div style="margin: 5px; width: 410px;" id="chathisheader">
					<button class="mainButton buttonHide" title="Скрытие меню" id="hideMeChHis">hide</button>
					<button class="mainButton smallbtn" title="Очистка всех полей" id="clearallinfo">🧹</button>
					<select style="height:28px; width:260px; text-align:center" id="operatorstp" class="${exttheme}">
							<option selected="" disabled="">Операторы на линии</option>
					</select>
					<button class="mainButton smallbtn" title="Обновляет список активных операторов, их статус, и количества чатов" id="RefrehOperators">♻</button>
					<button class="mainButton smallbtn" title="Показывает инеформацию по пользователю из чата, его айди, почту, телефон, характеристики устройства и тп" id="getdatafrchat">ℹ</button>
				</div>
				<div style="margin: 5px; width: 410px; display:flex; justify-content:space-evenly;" id="chathismenu">
					<button class="mainButton" title="Возвращает на экран просмотра списка чатов" id="back_to_chat_his" style="width:50px; font-size:22px; padding:0;">🔙</button>
					 <input id="chatuserhis" class="${exttheme}" placeholder="ID пользователя" autocomplete="off" type="text" style="text-align: center; width: 130px; margin-top: 5px">
					 <input id="hashchathis" class="${exttheme}" placeholder="Хеш чата" title="" autocomplete="off" type="text" style="text-align: center; width: 130px; margin-top: 5px">
					<button class="mainButton" title="Находит историю чатов или открывает по хешу чата диалог" id="btn_search_history" style="width:50px;font-size:22px;padding:0;">🔎</button>
				</div>
				<div style="margin-top: 5px; width: 410px;display:flex; justify-content:center;margin-bottom:5px;" id="databoxchathis">
					<button class="mainButton" title="Инструкция по этой форме" id="chhisinstr" style="margin-right: 5px;">❓</button>
					<button class="mainButton" id="refreshchat" style="width:30px; font-size:16px;" title="Обновляет содержимое окна с чатом, если он активный, чтобы увидеть новые записи">🔄</button>
					<span style="color:bisque; float:center; margin-top:5px; margin-left:10px;">От </span>
					<input class="${exttheme}" type="date" style="margin-left:5px;  width:115px; text-align:center; " name="StartDataChHis" id="dateFromChHis">
					<span style="color:bisque; margin-top:5px; margin-left:10px; float:right; height:28px;">До </span>
					<input class="${exttheme}" type="date" style="float:right; margin-left:5px; margin-right:10px; width:115px; text-align:center; " name="EndDataChHis" id="dateToChHis">
					<button class="mainButton" style="width:30px;" id="chagetheme" title="Переключается светлую тему ☀ и темную🌛 вывода чата с пользователем">🌛</button>
				</div>
			</span>

				<div style="width: 410px;display:none" id="somechatinfo">
					<span id="usidchat" style="color:bisque; margin-left:10px; margin-top:5px; user-select:none; cursor:pointer" title="При клике копирует сам айдишник">User ID: </span> <span id="placeusid" style="color:bisque; margin-left:5px; margin-top:5px;"></span>
					<button class="mainButton" id="takechat" style="margin-left: 155px; margin-top:5px;" title="Забирает чат и назначает на вас,но некоторые чаты или у других коллег забраться не получится">Забрать</button>
					<br>
					<span id="chid" style="color:bisque; margin-left:10px; margin-top:5px; user-select:none; cursor:pointer" title="При клике копирует ссылку на лог чата">Chat ID: </span> <span id="placechatid" style="color:bisque; margin-left:5px; margin-top:5px;"></span>
					<button class="mainButton" id="reassign" title="По нажатию на кнопку переведет чат на сотрудника. Порядок такой: выбираете из списка операторы на линии того, кому желаете перевести, после чего открываете чат по хешу в поле хеш чата вводите его и нажимаете найти, и затем уже после этого жмете на кнопку и скрипт отработает" style="width:45px; margin-left:5px; font-size:16px; margin-top:2px;user-select:none;">🔀</button>
				</div>

			<div id="infofield" style="color:bisque; margin-left:10px;margin-top:5px width:410px; height:75vh; overflow-x:hidden;">
			</div>

			<div id="bottommenuchhis" style="width: 410px; position:absolute; display:none;">
				<textarea id="msgftochatornotes" style="margin-left: 10px; margin-top: 5px; width: 210px; height: 29px; background: lightgrey;position: absolute; bottom: 2px;"></textarea>
				<button class="mainButton" id="sendmsgtochatornotes" title="В зависимости от опции отправляет текст в чат или заметки" style="margin-left: 5px; margin-top:5px; position:absolute; top 10px; left:220px;">Send</button>
				<input class="radio-ext"  type="radio" name="chatornotes" style="float:right; margin-top:10px;margin-right:5px;" value="Notes" checked="" resolved=""><label style="color:bisque; font-size: 16px;float:right; margin-right:5px;margin-top:10px;">Заметки</label>
				<input class="radio-ext"  type="radio" name="chatornotes" style="float:right;margin-top:10px; margin-right:5px;" value="Chat" resolved=""><label style="color:bisque; font-size: 16px; float:right; margin-top:10px; margin-right:5px;">Чат</label>
			</div>

			<div id="userchatdata" style="display:none; position: fixed; top: 0px; right: 420px; background: rgb(70, 68, 81); color: bisque; width: 365px; height: 400px; max-height: 600px; max-width: 500px; overflow: auto; border: 1px solid; padding: 10px; word-break: break-all;"">

						<div id="datainfoheader">
							<button class="mainButton" id="hideuserdatainfo" style="width:50px; background: #228B22;">hide</button>
							<button class="mainButton" id="gotocrmhis" style="width:50px;">CRM</button>
						</div>

					<div id="datafield" style="margin-top:5px;text-align:center; font-size:16px;">
					</div>

			</div>
	</span>
</div>`;

if (localStorage.getItem('winTopChatHis') == null) { //начальное положение окна истории чатов
    localStorage.setItem('winTopChatHis', '0');
    localStorage.setItem('winLeftChatHis', '80.6');
}

//заносим переменную для переключения окна
if (localStorage.getItem('theme') == null) {
    localStorage.setItem('theme', 'dark');
}

let wintChatHis = document.createElement('div'); // создание окна работы с историей чата
document.body.append(wintChatHis);
wintChatHis.style = 'min-height: 25px; min-width: 65px; height:100vh; background: rgb(70, 68, 81); top: 0px; right:0px; font-size: 14px; z-index: 1000000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black; overflow:hidden';
wintChatHis.style.display = 'none';
wintChatHis.setAttribute('id', 'AF_ChatHis');
wintChatHis.innerHTML = win_Chathis;

function fillchatbox() { //функция наполнения элемента, где выводится история чатов
    const groupIdToSection = {
        'c7bbb211-a217-4ed3-8112-98728dc382d8': 'ТП',
        '8266dbb1-db44-4910-8b5f-a140deeec5c0': 'ТП ОС',
        'b6f7f34d-2f08-fc19-3661-29ac00842898': 'КЦ'
    };

    if (convdata && convdata.groupId && groupIdToSection[convdata.groupId]) {
        document.getElementById('infofield').setAttribute('opsetction', groupIdToSection[convdata.groupId]);
    }

    const now = new Date();
    document.getElementById('infofield').setAttribute('openhistorytime', now.toISOString());

    document.getElementById('infofield').innerHTML = '';

    let timearr = [];
    let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    let timearr2 = [];
    let options2 = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    let temppics = [];
    let testarray = [];
    let brarray = [];
    let restul;

    // след 2 строки - скрипт заполняет значения уже при открытии самого чата по его хешу или при клике на чат из списка в истории
    if (Object.entries(convdata.channelUser.payload) == '' && convdata.channelUser.channelTpe == 'Telegram')
        document.getElementById('placeusid').innerText = "Telegram";
    else if (Object.entries(convdata.channelUser.payload) != '' && convdata.channelUser.channelTpe != 'Telegram' && convdata.channelUser.channelTpe != 'Widget' && convdata.channelUser.channelTpe != 'WhatsApp')
        document.getElementById('placeusid').innerText = convdata.channelUser.id;
    else if (Object.entries(convdata.channelUser.payload) == '' && convdata.channelUser.channelTpe != 'Telegram' && convdata.channelUser.channelTpe != 'WhatsApp' && convdata.channelUser.channelTpe == 'Widget')
        document.getElementById('placeusid').innerText = "Widget";
    else if (Object.entries(convdata.channelUser.payload) == '' && convdata.channelUser.channelTpe != 'Telegram' && convdata.channelUser.channelTpe == 'WhatsApp')
        document.getElementById('placeusid').innerText = "WhatsApp";
    else if (Object.entries(convdata.channelUser.payload) != '' && convdata.channelUser.channelTpe != 'Telegram' && convdata.channelUser.channelTpe == 'Widget' && convdata.channelUser.payload.id != undefined)
        document.getElementById('placeusid').innerText = convdata.channelUser.payload.id;
    else document.getElementById('placeusid').innerText = "Widget";

    document.getElementById('placechatid').innerText = convdata.id;
    document.getElementById('somechatinfo').style.display = '';
    document.getElementById('bottommenuchhis').style.display = '';
    function extractDate(ts) {
        return new Date(ts).toLocaleDateString('ru-RU', options);
    }

    function extractTime(ts) {
        return new Date(ts).toLocaleTimeString('ru-RU', options2);
    }

    function getImagesFromText(txt) {
        const patterns = [/https:\/\/vimbox-resource.*jpg/gm, /https:\/\/vimbox-resource.*jpeg/gm, /https:\/\/vimbox-resource.*png/gm];
        return patterns.flatMap(pattern => txt.match(pattern) || []);
    }

    function appendToInfoField(html) {
        document.getElementById('infofield').innerHTML += html;
    }

    function getOperatorNameById(operatorId, defaultName) {
        const operator = operatorsarray.find(op => op.operator && op.operator.id === operatorId);
        return (operator && operator.operator.fullName) || defaultName;
    }

    for (let i = convdata.messages.length - 1; i >= 0; i--) {
        const message = convdata.messages[i];
        const date = extractDate(message.ts);
        const time = extractTime(message.ts);

        switch (message.tpe) {
            case "Question":
                if (message.click === undefined) {
                    const testarray = message.txt.match(/<p>(.*?)<\/p>/gm);
                    let images = getImagesFromText(message.txt);
                    const name = convdata.channelUser.fullName || "Widget";

                    if (testarray) {
                        const temppics = testarray.flatMap(text => getImagesFromText(text));

                        let content = '';
                        if (temppics.length > 0) {
                            let result = message.txt;
                            temppics.forEach((pic, idx) => {
                                result = result.replace(testarray[idx], `<a href="${pic}" data-lightbox="pictures"><img src="${pic}" class="img-chat-history" alt="Изображение"></img></a>`);
                            });
                            content = result;
                        } else {
                            content = message.txt;
                        }

                        appendToInfoField(`
                        <br>
                        <div class="question-event">
                            <span class="question-event-name">${name}</span>
                            <span class="question-event-date">${date}</span>
                            <div class="question-event-text"><br>${content}</div>
                        </div>
                    `);
                    } else {
                        const content = images.length === 1
                            ? message.txt.replace(message.txt, `<img src="${images[0]}" class="img-chat-history"></img>`)
                            : message.txt;

                        appendToInfoField(`
                        <br>
                        <div class="question-event">
                            <span class="question-event-name">${name}</span>
                            <span class="question-event-date">${date}</span>
                            <div class="question-event-text"><br>${content}</div>
                        </div>
                    `);
                    }
                } else {
                    appendToInfoField(`
                    <br>
                    <div class="question-event">
                        <span class="question-event-name">${convdata.channelUser.fullName}</span>
                        <span class="question-event-date">${date}</span>
                        <div class="question-event-text"><br>${message.click.clickLabel}</div>
                    </div>
                `);
                }
                break;

            case "Event":
                let eventmsg;
                function handleAssignToOperatorEvent(message) {
                    if (message.payload.status === 'OnOperator' && message.payload.oid) {
                        const operName = getOperatorNameById(message.payload.oid, "Оператор");
                        return `Диалог назначен на ${operName}`;
                    } else if (message.payload.status === 'AssignedToOperator' && message.payload.oid) {
                        const operName = getOperatorNameById(message.payload.oid, "Оператор");
                        return `${operName} взял(а) диалог в работу`;
                    }
                    return '';
                }

                const eventMapping = {
                    'NewConversation': 'Начат новый диалог',
                    'RunScenario': 'Сценарий запущен',
                    'FirstTimeInQueue': 'Диалог отправлен в очередь',
                    'RunIntegration': `Запущена интеграция ${message.payload.name}`,
                    'FinishIntegration': 'Интеграция успешно отработала',
                    'CreatedByOperator': `${getOperatorNameById(message.payload.oid, "Оператор")} открыл(а) новый диалог`,
                    'AssignToOperator': handleAssignToOperatorEvent(message),
                    'CloseConversation': (function () {
                        if (message.payload.status !== 'ClosedByBot' && message.payload.sender === 'userAnswerTimer') {
                            return 'Диалог автоматически закрыт по отсутствию активности пользователя';
                        } else if (Object.values(message.payload) !== '' && message.payload.status !== 'ClosedByBot' && message.payload.sender !== 'userAnswerTimer') {
                            return `${getOperatorNameById(message.payload.sender, "Оператор")} закрыл чат!`;
                        } else if (Object.values(message.payload) === '') {
                            return message.eventTpe;
                        }
                        return '';
                    })()
                };

                const eventMsg = eventMapping[message.eventTpe] || '';
                if (eventMsg) {
                    appendToInfoField(`<div class="event-name">${eventMsg}<span class="event-other-date">${extractTime(message.ts)}</span></div>`);
                }

                break;

            case "AnswerOperatorWithBot":
            case "AnswerSystem":
            case "AnswerBot":
            case "AnswerChatterbox":
                appendToInfoField(`
                <br>
                <div class="answer-bot-container">
                    <span class="answer-bot-name">AutoFAQ bot</span>
                    <span class="answer-bot-date">${date}</span>
                    <div class="question-event-text"><br>${message.txt}</div>
                </div>
            `);
                break;

            case "AnswerOperator":
                const operatorName = getOperatorNameById(message.operatorId, "Оператор");
                appendToInfoField(`
                <br>
                <div class="answer-oper-container">
                    <span class="answer-oper-name">${operatorName}</span>
                    <span class="question-event-date">${date}</span>
                    <div class="question-event-text"><br>${message.txt}</div>
                </div>
            `);
                break;

            case "OperatorComment":
                const commentName = message.operatorId !== 'autoFAQ' ? getOperatorNameById(message.operatorId, "Оператор") : message.operatorId;
                appendToInfoField(`
                <br>
                <div class="oper-comment-container">
                    <span class="oper-comment-name">${commentName}</span>
                    <span class="question-event-date">${date}</span>
                    <div class="question-event-text"><br>${message.txt}</div>
                </div>
            `);
                break;
        }
    }
}

function getFormattedDateComponent(dateComponent) { // функция добавляет 0 к месяцу, дню, минуте, часу если значение меньше 10 иначе просто размещает значение
    return dateComponent < 10 ? '0' + dateComponent : dateComponent;
}

async function findchatsoper() { // ищет активные чаты на выбранном операторе
    let objSel = document.getElementById("operatorstp");
    let getdateset = new Date();
    let hrs = getdateset.getUTCHours() < 10 ? "0" + (getdateset.getUTCHours()) : getdateset.getUTCHours() >= 24 ? '0' + ((getdateset.getUTCHours() - 24)) : getdateset.getUTCHours();
    let difhrs = hrs - 1 < 10 ? '0' + (hrs - 1) : hrs - 1;
    let mins = getFormattedDateComponent(getdateset.getMinutes());
    let secs = getFormattedDateComponent(getdateset.getUTCSeconds());
    flagsearch = 'searchbyoperator'

    if (foundarr != '')
        foundarr = '';

    if (document.getElementById('placeusid').innerText != '')
        document.getElementById('placeusid').innerText = ''

    if (document.getElementById('placechatid').innerText != '')
        document.getElementById('placechatid').innerText = ''

    if (document.getElementById('somechatinfo').style.display == '')
        document.getElementById('somechatinfo').style.display = 'none';

    if (document.getElementById('bottommenuchhis').style.display == '')
        document.getElementById('bottommenuchhis').style.display = 'none';

    document.getElementById('infofield').innerHTML = 'Загрузка'

    if (objSel.length > 1) {
        for (let i = 1; i < objSel.length; i++) {
            if (objSel[i].selected == true) {
                await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                    "headers": {
                        "content-type": "application/json",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-csrf-token": aftoken
                    },
                    "body": `{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"${objSel[i].value}\"],\"tsFrom\":\"${document.getElementById('dateFromChHis').value}T${difhrs}:${mins}:${secs}.000Z\",\"tsTo\":\"${document.getElementById('dateToChHis').value}T${hrs}:${mins}:${secs}.000Z\",\"usedStatuses\":[\"OnOperator\",\"AssignedToOperator\",\"Active\"],\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":1,\"limit\":10}`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                }).then(r => r.json()).then(r => operchatsdata = r)

                if (operchatsdata.total == 0)
                    alert(`У выбранного пользователя ${objSel[i].innerText} нет активных чатов`)

                for (let i = 0; i < operchatsdata.items.length; i++) {
                    let tmestmp = new Date((operchatsdata.items[i].ts.split('[GMT]'))[0])
                    let tshrs;
                    let tsmin
                    let day;
                    let month;

                    if (tmestmp.getMonth() < 9)
                        month = "0" + (tmestmp.getMonth() + 1)
                    else
                        month = (tmestmp.getMonth() + 1)
                    if (tmestmp.getDate() < 10)
                        day = "0" + tmestmp.getDate()
                    else
                        day = tmestmp.getDate()
                    let year = tmestmp.getFullYear();
                    if ((tmestmp.getUTCHours() + 3) < 10)
                        tshrs = "0" + (tmestmp.getUTCHours() + 3);
                    else if ((tmestmp.getUTCHours() + 3) >= 24)
                        tshrs = '0' + ((tmestmp.getUTCHours() + 3 - 24))
                    else tshrs = (tmestmp.getUTCHours() + 3);

                    if (tmestmp.getMinutes() < 10)
                        tsmin = "0" + tmestmp.getMinutes();
                    else tsmin = tmestmp.getMinutes();

                    if (operchatsdata.items[i].channelUser.channelTpe != 'Telegram' && operchatsdata.items[i].channelUser.channelTpe != 'Widget' && operchatsdata.items[i].channelUser.channelTpe != 'WhatsApp' && operchatsdata.items[i].channelUser.payload.userFullName == undefined)
                        foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700">' + operchatsdata.items[i].channelUser.payload.userType + '</span>' + ' ' + operchatsdata.items[i].channelUser.fullName + '</span>' + '<br>'
                    else if (operchatsdata.items[i].channelUser.channelTpe != 'Telegram' && operchatsdata.items[i].channelUser.channelTpe != 'Widget' && operchatsdata.items[i].channelUser.channelTpe != 'WhatsApp' && operchatsdata.items[i].channelUser.payload.userFullName != undefined)
                        foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700">' + operchatsdata.items[i].channelUser.payload.userType + '</span>' + ' ' + operchatsdata.items[i].channelUser.payload.userFullName + '</span>' + '<br>'
                    else if (operchatsdata.items[i].channelUser.channelTpe == 'Telegram' && operchatsdata.items[i].channelUser.payload == undefined)
                        foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700">' + operchatsdata.items[i].channelUser.channelTpe + '</span>' + ' ' + operchatsdata.items[i].channelUser.fullName + '</span>' + '<br>'
                    else if (operchatsdata.items[i].channelUser.channelTpe == 'Widget' && operchatsdata.items[i].channelUser.payload == undefined)
                        foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700">' + operchatsdata.items[i].channelUser.channelTpe + '</span>' + ' ' + operchatsdata.items[i].channelUser.fullName + '</span>' + '<br>'
                    else if (operchatsdata.items[i].channelUser.channelTpe == 'WhatsApp' && operchatsdata.items[i].channelUser.payload == undefined)
                        foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700">' + operchatsdata.items[i].channelUser.channelTpe + '</span>' + ' ' + operchatsdata.items[i].channelUser.fullName + '</span>' + '<br>'
                    else if (operchatsdata.items[i].channelUser.channelTpe == 'WhatsApp' && operchatsdata.items[i].channelUser.payload != undefined) // проверить вывод чата с  WA при таких критериях!
                        foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700">' + operchatsdata.items[i].channelUser.channelTpe + '</span>' + ' ' + operchatsdata.items[i].channelUser.fullName + '</span>' + '<br>'
                }

                document.getElementById('infofield').innerHTML = foundarr;
                checkAndChangeStyle()

                for (let i = 0; i < document.getElementsByClassName('chatlist').length; i++) {
                    document.getElementsByClassName('chatlist')[i].title = operchatsdata.items[i].conversationId
                    document.getElementsByClassName('chatlist')[i].onclick = async () => {
                        await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementsByClassName('chatlist')[i].title, {
                            headers: {
                                "x-csrf-token": aftoken, // Добавление токена
                                "content-type": "application/json" // Рекомендуется указать тип контента
                            }
                        })
                            .then(r => r.json())
                            .then(r => convdata = r)
                            .catch(error => console.error("Ошибка выполнения запроса:", error));
                        if (convdata.status != null && convdata.status == 'AssignedToOperator')
                            isChatOnOperator = true
                        else isChatOnOperator = false;

                        fillchatbox();
                        checkAndChangeStyle();
                    } // конец функции клика по списку в найденном чате
                }
            }
        }
    }
}

document.getElementById('operatorstp').addEventListener('change', findchatsoper);

function resetChatHistoryUI() {
    document.getElementById('infofield').innerText = '';
    document.getElementById('placeusid').innerText = '';
    document.getElementById('placechatid').innerText = '';
    document.getElementById('somechatinfo').style.display = 'none';
    document.getElementById('bottommenuchhis').style.display = 'none';
    document.getElementById('chatuserhis').value = '';
    document.getElementById('hashchathis').value = '';
    document.getElementById('infofield').removeAttribute('opsetction');
    document.getElementById('infofield').removeAttribute('openhistorytime');
}

document.getElementById('hideMeChHis').onclick = () => {
    if (document.getElementById('AF_ChatHis').style.display == '') {
        document.getElementById('AF_ChatHis').style.display = 'none';
        document.getElementById('opennewcat').classList.remove('activeScriptBtn');
        document.getElementById('rightPanel').style.right = "22px";
        resetChatHistoryUI();
    }
};

document.getElementById('clearallinfo').onclick = () => {
    resetChatHistoryUI();
};


document.getElementById('chatuserhis').addEventListener('input', function () {
    onlyNumbers(this);
})

document.getElementById('chid').onclick = () => { // копирует в буфер айди чата
    copyToClipboard('https://skyeng.autofaq.ai/logs/' + document.getElementById('placechatid').innerText)
}

document.getElementById('usidchat').onclick = () => { //копирует в буфер айди пользователя
    copyToClipboard(document.getElementById('placeusid').innerText)
}

document.getElementById('hideuserdatainfo').onclick = () => { // форма hide
    if (document.getElementById('userchatdata').style.display == '')
        document.getElementById('userchatdata').style.display = 'none'
}

document.getElementById('gotocrmhis').onclick = () => { //открывает СРМ пользователя паари в меню с историей чатов
    let fdata = document.getElementById('datafield').innerHTML
    fdata = fdata.match(/ID:.?\d+/)[0].split(' ')[1]
    window.open(`https://crm2.skyeng.ru/persons/${fdata}`)
}

function changeviewtheme() { //функция переключения темы в истории чатов на светлую(классическуб в стиле АФ) и темную в зависимости от значения переменной полученной в локалсторедж

    if (localStorage.getItem('theme') == 'light') {
        document.getElementById('chagetheme').innerHTML = '☀'
        document.getElementById('infofield').style.background = "#f5f5f5";

    } else if (localStorage.getItem('theme') == 'dark') {
        document.getElementById('chagetheme').innerHTML = '🌛'
        document.getElementById('infofield').style.background = "#464451";
    }
}

function toggleClassForElements(className, theme) {
    const elements = document.getElementsByClassName(className);
    for (let element of elements) {
        if (theme === 'light') {
            element.classList.add('light');
        } else if (theme === 'dark' && element.classList.contains('light')) {
            element.classList.remove('light');
        }
    }
}

function checkAndChangeStyle() {
    const theme = localStorage.getItem('theme');
    const classNames = ['chatlist', 'answer-bot-date', 'event-name', 'question-event-text', 'question-event-name', 'event-container', 'oper-comment-name', 'oper-comment-container', 'question-event-date', 'answer-oper-name', 'answer-bot-name', 'oper-comment-operator'];

    classNames.forEach(className => toggleClassForElements(className, theme));
}


document.getElementById('chagetheme').onclick = () => { //функция переключения  по кнопке темы в истории чатов на светлую(классическуб в стиле АФ) и темную
    if (localStorage.getItem('theme') == 'light') {
        localStorage.setItem('theme', 'dark')
        document.getElementById('chagetheme').innerHTML = '🌛'
        document.getElementById('infofield').style.background = "#464451";
        checkAndChangeStyle();
    } else if (localStorage.getItem('theme') == 'dark') {
        localStorage.setItem('theme', 'light')
        document.getElementById('chagetheme').innerHTML = '☀'
        document.getElementById('infofield').style.background = "#f5f5f5";
        checkAndChangeStyle();
    }
};

function getopennewcatButtonPress() { // открывает меню для работы с историей чата по типу кота Омельченко

    if (document.getElementById('AF_ChatHis').style.display == '') {
        document.getElementById('AF_ChatHis').style.display = 'none';
        document.getElementById('rightPanel').style.right = "22px";
        document.getElementById('opennewcat').classList.remove('activeScriptBtn');
    } else {
        document.getElementById('AF_ChatHis').style.display = '';
        document.getElementById('rightPanel').style.right = "422px";
        document.getElementById('opennewcat').classList.add('activeScriptBtn');
    }
    let data;
    changeviewtheme()

    flagsearch = ''

    let getdateset = new Date();
    let getyearLS = getdateset.getFullYear();
    let getcurmonthLS = getdateset.getMonth() + 1;

    // Set the number of days in the current month
    let numDaysInCurrentMonth;
    if (getcurmonthLS == 2) {
        numDaysInCurrentMonth = 28;
    } else if (getcurmonthLS == 4 || getcurmonthLS == 6 || getcurmonthLS == 9 || getcurmonthLS == 11) {
        numDaysInCurrentMonth = 30;
    } else {
        numDaysInCurrentMonth = 31;
    }

    let fromMonthLS = getcurmonthLS - 1;
    let toMonthLS = getcurmonthLS;
    let getyearFromLS = getyearLS;

    // Set the number of days in the fromMonthLS and toMonthLS months
    let numDaysInFromMonth, numDaysInToMonth;
    if (fromMonthLS == 2) {
        numDaysInFromMonth = 28;
    } else if (fromMonthLS == 4 || fromMonthLS == 6 || fromMonthLS == 9 || fromMonthLS == 11) {
        numDaysInFromMonth = 30;
    } else if (fromMonthLS == 0) {
        numDaysInFromMonth = 31;
        fromMonthLS = "12";
        getyearFromLS = getyearLS - 1;
    } else {
        numDaysInFromMonth = 31;
    }

    if (toMonthLS == 2) {
        numDaysInToMonth = 28;
    } else if (toMonthLS == 4 || toMonthLS == 6 || toMonthLS == 9 || toMonthLS == 11) {
        numDaysInToMonth = 30;
    } else {
        numDaysInToMonth = 31;
    }

    // Set today's day to the last day of the month if it is greater than the number of days in the month
    let todayLSFrom = getFormattedDateComponent(Math.min(getdateset.getDate(), numDaysInFromMonth));
    let todayLSTo = getFormattedDateComponent(Math.min(getdateset.getDate(), numDaysInToMonth));

    document.getElementById('dateFromChHis').value = getyearFromLS + "-" + getFormattedDateComponent(fromMonthLS) + "-" + todayLSFrom;
    document.getElementById('dateToChHis').value = getyearLS + "-" + getFormattedDateComponent(toMonthLS) + "-" + todayLSTo;

    let radiobtnsarray = document.getElementsByName('chatornotes')
    let radiobtnsarray1 = document.getElementsByName('chatornotes1')
    let activetechopers = [];
    document.getElementById('RefrehOperators').onclick = currstate;
    let objSel = document.getElementById("operatorstp");

    function addOption(oListbox, text, value)  //функция добавления опции в список
    {
        var oOption = document.createElement("option");
        oOption.appendChild(document.createTextNode(text));
        oOption.setAttribute("value", value);

        oListbox.appendChild(oOption);
    }

    async function currstate() {
        let opsflag = getopsection();

        activetechopers = []
        objSel.length = 1
        objSel[0].selected = true;

        let result = await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", {
            headers: { "x-csrf-token": aftoken },
            "credentials": "include"
        }).then(r => r.json());

        result.onOperator.forEach(operatorInfo => {
            if (operatorInfo.operator && operatorInfo.operator.status !== "Offline" && operatorInfo.operator.fullName.includes(opsflag)) {
                activetechopers.push(operatorInfo);
            }
        });

        if (activetechopers.length) {
            let statusMap = { Online: '🟢', Busy: '🟡', Pause: '🔴' };
            activetechopers.forEach(({ operator, aCnt = 0 }) => {
                addOption(objSel, `${statusMap[operator.status]} ${operator.fullName} (${aCnt})`, operator.id);
            });
        }
    }

    function getopsection() {
        let departmentPrefix = document.getElementsByClassName('user_menu-dropdown-user_name')[0].innerText.split('-')[0];
        let opsflag = ['ТП', 'ТП ОС', 'КЦ', 'КМ', 'ТС', 'ТПPrem'].includes(departmentPrefix) ? departmentPrefix : 'Unknown';
        console.log(`Подразделение для Chat history: ${opsflag}`);
        return opsflag;
    }

    document.getElementById('getdatafrchat').onclick = () => {
        if (typeof (convdata) !== 'undefined') {
            document.getElementById('userchatdata').style.display = document.getElementById('userchatdata').style.display == 'none' ? '' : 'none';
            let userData = convdata.channelUser.payload;
            let techScreeningData = userData.techScreeningData || userData["Тех.инфа об устройствах"] || "";
            let userFullName = userData.userFullName || convdata.channelUser.fullName;
            let userType = userData.userType || "";
            let userEmail = userData.email || "";
            let userPhone = userData.phone || "";

            document.getElementById('datafield').innerHTML = `
                <span style="color:#00BFFF; font-weight:700;">${userFullName}</span><br>
                <span style="color: #00FA9A;">(${userType})</span> ID: ${userData.id}<br>
                <span style="user-select: none;">📧:</span> ${userEmail}<br>
                <span style="user-select: none;">📞:</span> ${userPhone}<br>
                Tech Screening Data:<br>${techScreeningData}
            `;
        } else {
            alert("Не выбран активный чат");
        }
    }

    currstate();

    document.getElementById('btn_search_history').onclick = async () => {
        document.getElementById('infofield').removeAttribute('opsetction');
        document.getElementById('infofield').removeAttribute('openhistorytime');
        let userId = document.getElementById('chatuserhis').value.trim();
        let chatHash = document.getElementById('hashchathis').value.trim();
        let dateFrom = document.getElementById('dateFromChHis').value;
        let dateTo = document.getElementById('dateToChHis').value;

        if (foundarr != '')
            foundarr = ''

        if (document.getElementById('placeusid').innerText != '')
            document.getElementById('placeusid').innerText = ''

        if (document.getElementById('placechatid').innerText != '')
            document.getElementById('placechatid').innerText = ''

        if (document.getElementById('somechatinfo').style.display == '')
            document.getElementById('somechatinfo').style.display = 'none';

        if (document.getElementById('bottommenuchhis').style.display == '')
            document.getElementById('bottommenuchhis').style.display = 'none';

        document.getElementById('infofield').innerHTML = 'Загрузка'

        if (userId && !chatHash) {
            flagsearch = 'searchbyuser';
            document.getElementById('chatuserhis').value = '';

            let response = await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                "headers": { "content-type": "application/json", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin", "x-csrf-token": aftoken },
                "body": JSON.stringify({
                    "serviceId": "361c681b-340a-4e47-9342-c7309e27e7b5",
                    "mode": "Json",
                    "channelUserFullTextLike": userId,
                    "tsFrom": `${dateFrom}T00:00:00.000Z`,
                    "tsTo": `${dateTo}T23:59:59.059Z`,
                    "orderBy": "ts",
                    "orderDirection": "Desc",
                    "page": 1,
                    "limit": 10
                }),
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(r => r.json()).then(r => data = r);
            if (data.total == 0) {
                alert("В выбранном диапазоне чатов от пользователя не найдено. Попробуйте, пожалуйста, выбрать другой, либо пользователь не обращался вовсе.")
                return;
            }
            processChatList(response);
        } else if (!userId && chatHash) {
            flagsearch = 'searchbyhash';
            updateChatInfo(chatHash);
        } else {
            alert("Введено и ID пользователя и хеш чата, или оба поля пустые. Пожалуйста, выберите что-то одно и повторите попытку.");
        }
    }

    function processChatList(data) {
        foundarr = '';
        data.items.forEach(item => {
            let timestamp = new Date(item.ts.split('[GMT]')[0]);
            let formattedDate = timestamp.toLocaleDateString('ru-RU');
            let formattedTime = timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            let rating = item.stats.rate?.rate || '⭕';
            let statusIcon = item.stats.usedStatuses === "AssignedToOperator" ? "🛠" : '';
            let userName = item.channelUser.payload?.userFullName || item.channelUser.fullName;
            let userType = item.channelUser.payload?.userType || "";

            foundarr += `
                <span class="chatlist" style="cursor:pointer;" title="${item.conversationId}">
                    ${formattedDate} ${formattedTime}
                    <span style="color:#00BFFF; font-weight:700;">${userType}</span> ${userName}
                    <span style="color: MediumSeaGreen; font-weight:700;"> Оценка: </span> ${rating} ${statusIcon}
                </span><br>
            `;
        });

        document.getElementById('infofield').innerHTML = foundarr;
        checkAndChangeStyle();

        Array.from(document.getElementsByClassName('chatlist')).forEach(element => {
            element.onclick = () => updateChatInfo(element.title);
            element.addEventListener('contextmenu', event => {
                event.preventDefault();
                copyToClipboard(element.title);
            });
        });
    }

    document.getElementById('back_to_chat_his').onclick = () => {
        document.getElementById('infofield').removeAttribute('opsetction');
        document.getElementById('infofield').removeAttribute('openhistorytime');
        document.getElementById('infofield').innerHTML = foundarr || '';
        document.getElementById('placeusid').innerText = '';
        document.getElementById('placechatid').innerText = '';
        document.getElementById('somechatinfo').style.display = 'none';
        document.getElementById('bottommenuchhis').style.display = 'none';

        if (foundarr) {
            checkAndChangeStyle();
            Array.from(document.getElementsByClassName('chatlist')).forEach((element, i) => {
                let chatId = '';
                if (flagsearch === 'searchbyuser' && data && data.items) {
                    chatId = data.items[i].conversationId;
                } else if (flagsearch === 'searchbyoperator' && operchatsdata && operchatsdata.items) {
                    chatId = operchatsdata.items[i].conversationId;
                } else if (flagsearch === 'searchbyhash') {
                    chatId = (typeof operchatsdata !== 'undefined' && typeof data === 'undefined') ? operchatsdata.items[i].conversationId :
                        (typeof data !== 'undefined' && typeof operchatsdata === 'undefined') ? data.items[i].conversationId :
                            (typeof data !== 'undefined' && typeof operchatsdata !== 'undefined') ? data.items[i].conversationId : '';
                }

                if (chatId) {
                    element.title = chatId;
                    element.onclick = () => updateChatInfo(chatId);
                    // Добавляем обработчик для контекстного меню отдельно
                    element.oncontextmenu = (event) => {
                        event.preventDefault();
                        copyToClipboard(chatId);
                    };
                }
            });
        }
    };

    document.getElementById('chhisinstr').onclick = () => {
        window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-chathistory%F0%9F%92%ACChatHistory');
    }

    document.getElementById('refreshchat').onclick = async () => {
        document.getElementById('infofield').removeAttribute('opsetction');
        document.getElementById('infofield').removeAttribute('openhistorytime');
        const chatId = document.getElementById('placechatid').innerText;
        if (chatId) {
            document.getElementById('infofield').innerHTML = '';
            await updateChatInfo(chatId);
        }
    }

    async function updateChatInfo(chatId) {
        const response = await fetch("https://skyeng.autofaq.ai/api/conversations/" + chatId, { headers: { "x-csrf-token": aftoken } });
        convdata = await response.json();

        isChatOnOperator = convdata.status != null && convdata.status == 'AssignedToOperator';

        fillchatbox();
        checkAndChangeStyle();
    }

    document.getElementById('takechat').onclick = function () {
        const openHistoryTime = document.getElementById('infofield').getAttribute('openhistorytime');
        const openHistoryDate = new Date(openHistoryTime);
        const now = new Date();

        if ((now - openHistoryDate) / 1000 > 60) {
            alert("История чата открыта слишком долго. Пожалуйста, обновите чат.");
            return;
        }

        let opsflag = getopsection();
        let opschat = document.getElementById('infofield').getAttribute('opsetction');

        // if (opschat !== opsflag) {
        //     alert('Чат в другой группе, забрать чат нельзя');
        //     return;
        // }

        if (confirm("Вы действительно желаете забрать чат?")) {
            let chat_id = document.getElementById('placechatid').innerText;
            let operator_id = operatorId;

            const assignChat = (assignToOperatorId) => {
                fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
                    headers: { "content-type": "application/json", "x-csrf-token": aftoken },
                    credentials: "include",
                    body: JSON.stringify({
                        command: "DO_ASSIGN_CONVERSATION",
                        conversationId: chat_id,
                        assignToOperatorId: assignToOperatorId
                    }),
                    method: "POST"
                });
            };

            assignChat("null");
            setTimeout(() => assignChat(operator_id), 2000);
        }
    };// конец обработчика нажатия кнопки "Забрать"

    async function startnewchatfast(polzid) { //открывает быстро чат с пользователем
        if (operatorId == "") {
            await whoAmI()
        }

        if (polzid) {
            await fetch(`https://skyeng.autofaq.ai/api/conversation/start?channelId=eca64021-d5e9-4c25-b6e9-03c24s638d4d&userId=${polzid}&operatorId=${operatorId}&groupId=c7bbb211-a217-4ed3-8112-98728dc382d8`, {
                headers: {
                    "x-csrf-token": aftoken
                },
                referrer: "https://skyeng.autofaq.ai/tickets/assigned/",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: null,
                method: "POST",
                mode: "cors",
                credentials: "include"
            })
                .then(response => response.json())
                .then(data => {
                    chatId = data.conversationId
                })
        } else alert('Не введен id пользователя');
    }

    document.getElementById('reassign').onclick = () => { //кнопка перевода чата на выбранного из верхнего списка операторы на линии и открытом чате, который желаем переветси

        let arops = document.getElementById('operatorstp')
        let hashid = document.getElementById('placechatid').innerText;
        if (arops.children[0].selected != true && hashid != '') {
            for (let i = 1; i < arops.children.length; i++) {
                if (arops.children[i].selected == true)
                    fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
                        "headers": {
                            "content-type": "application/json",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-csrf-token": aftoken
                        },
                        "body": `{\"command\":\"DO_ASSIGN_CONVERSATION\",\"conversationId\":\"${hashid}\",\"assignToOperatorId\":\"${arops.children[i].value}\"}`,
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    })
            }
        } else alert("Условия передачи чата не выполнены: не выбран оператор, не открыт чат, который требуется переводить")
    }



    document.getElementById('sendmsgtochatornotes').onclick = async () => { // обработчик кнопки Отправить в зависимости от радиокнопки в заметки или в чат

        let radiobtnsarray = document.getElementsByName('chatornotes')

        for (let i = 0; i < radiobtnsarray.length; i++) {
            if (radiobtnsarray[i].value == 'Notes' && radiobtnsarray[i].checked == true) {

                let chathashfromdiv = document.getElementById('placechatid').innerText
                let sesid;

                await fetch("https://skyeng.autofaq.ai/api/conversations/" + chathashfromdiv, { headers: { "x-csrf-token": aftoken } })
                    .then(r => r.json()).then(r => rdata = r)
                sesid = rdata.sessionId;

                let notemsg = '<p>' + document.getElementById('msgftochatornotes').value + '</p>';

                fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-csrf-token": aftoken
                    },
                    "body": "------WebKitFormBoundaryH2CK1t5M3Dc3ziNW\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + sesid + "\",\"conversationId\":\"" + chathashfromdiv + "\",\"text\":\"" + notemsg + "\",\"isComment\":true}\r\n------WebKitFormBoundaryH2CK1t5M3Dc3ziNW--\r\n",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                });

                document.getElementById('msgftochatornotes').value = ''

                setTimeout(
                    async function () {
                        if (document.getElementById('placechatid').innerText != '') {
                            document.getElementById('infofield').innerHTML = '';

                            const response = await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText, {
                                headers: { "x-csrf-token": aftoken }
                            });
                            const convdata = await response.json();

                            fillchatbox();
                            checkAndChangeStyle();
                        }
                    }, 1000);

            } else if (radiobtnsarray[i].value == 'Chat' && radiobtnsarray[i].checked == true) {

                let chathashfromdiv = document.getElementById('placechatid').innerText
                let sesid;

                await fetch("https://skyeng.autofaq.ai/api/conversations/" + chathashfromdiv, { headers: { "x-csrf-token": aftoken } })
                    .then(r => r.json()).then(r => rdata = r)
                sesid = rdata.sessionId;

                let notemsg = '<p>' + document.getElementById('msgftochatornotes').value + '</p>';

                fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryFeIiMdHaxAteNUHd",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-csrf-token": aftoken
                    },
                    "body": "------WebKitFormBoundaryFeIiMdHaxAteNUHd\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + sesid + "\",\"conversationId\":\"" + chathashfromdiv + "\",\"text\":\"" + notemsg + "\"}\r\n------WebKitFormBoundaryFeIiMdHaxAteNUHd--\r\n",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                });

                document.getElementById('msgftochatornotes').value = ''

                setTimeout(
                    async function () {
                        if (document.getElementById('placechatid').innerText != '') {
                            document.getElementById('infofield').innerHTML = '';

                            try {
                                // Выполняем fetch-запрос с корректной обработкой ответа
                                const response = await fetch(
                                    "https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText,
                                    {
                                        headers: { "x-csrf-token": aftoken }
                                    }
                                );

                                // Проверяем, успешен ли ответ
                                if (!response.ok) {
                                    throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
                                }

                                // Парсим JSON-данные
                                const convdata = await response.json();

                                // Проверяем статус и устанавливаем isChatOnOperator
                                isChatOnOperator = convdata.status === 'AssignedToOperator';

                                // Вызываем функции обработки
                                fillchatbox();
                                checkAndChangeStyle();
                            } catch (error) {
                                console.error("Ошибка выполнения fetch-запроса:", error);
                            }
                        }
                    },
                    1000
                );
            }
        }
    }

    document.getElementById('sendmsgtochatornotes1').onclick = async () => { // обработчик кнопки Отправить в зависимости от радиокнопки в заметки или в чат

        let radiobtnsarray1 = document.getElementsByName('chatornotes1')

        for (let i = 0; i < radiobtnsarray1.length; i++) {
            if (radiobtnsarray1[i].value == 'Notes' && radiobtnsarray1[i].checked == true) {


                let chathashfromdiv = document.getElementById('placechatid').innerText;
                let sesid;

                try {
                    // Выполняем запрос через fetch
                    const response = await fetch(
                        "https://skyeng.autofaq.ai/api/conversations/" + chathashfromdiv,
                        {
                            headers: { "x-csrf-token": aftoken } // Указываем заголовки
                        }
                    );

                    // Проверяем, успешен ли ответ
                    if (!response.ok) {
                        throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
                    }

                    // Парсим JSON-данные
                    const rdata = await response.json();

                    // Извлекаем sessionId
                    sesid = rdata.sessionId;

                    // Формируем сообщение
                    let notemsg = '<p>' + document.getElementById('msgftochatornotes1').value + '</p>';

                    // Дальнейшие действия (например, логирование или передача данных)
                    console.log("Session ID:", sesid);
                    console.log("Message:", notemsg);
                } catch (error) {
                    console.error("Ошибка выполнения запроса:", error);
                }

                fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-csrf-token": aftoken
                    },
                    "body": "------WebKitFormBoundaryH2CK1t5M3Dc3ziNW\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + sesid + "\",\"conversationId\":\"" + chathashfromdiv + "\",\"text\":\"" + notemsg + "\",\"isComment\":true}\r\n------WebKitFormBoundaryH2CK1t5M3Dc3ziNW--\r\n",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                });

                document.getElementById('msgftochatornotes1').value = ''

                setTimeout(
                    async function () {
                        if (document.getElementById('placechatid').innerText != '') {
                            // Очищаем поле infofield
                            document.getElementById('infofield').innerHTML = '';

                            try {
                                // Выполняем fetch-запрос
                                const response = await fetch(
                                    "https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText,
                                    {
                                        headers: { "x-csrf-token": aftoken } // Заголовки запроса
                                    }
                                );

                                // Проверяем успешность ответа
                                if (!response.ok) {
                                    throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
                                }

                                // Парсим JSON-ответ
                                const convdata = await response.json();

                                // Вызываем функции обработки
                                fillchatbox();
                                checkAndChangeStyle();

                            } catch (error) {
                                console.error("Ошибка выполнения fetch-запроса:", error);
                            }
                        }
                    },
                    1000
                );

            } else if (radiobtnsarray1[i].value == 'Chat' && radiobtnsarray1[i].checked == true) {

                let chathashfromdiv = document.getElementById('placechatid').innerText
                let sesid;

                await fetch("https://skyeng.autofaq.ai/api/conversations/" + chathashfromdiv, { headers: { "x-csrf-token": aftoken } })
                    .then(r => r.json()).then(r => rdata = r)
                sesid = rdata.sessionId;

                let notemsg = '<p>' + document.getElementById('msgftochatornotes1').value + '</p>';

                fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                    "headers": {
                        "accept": "*/*",
                        "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryFeIiMdHaxAteNUHd",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-csrf-token": aftoken
                    },
                    "body": "------WebKitFormBoundaryFeIiMdHaxAteNUHd\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + sesid + "\",\"conversationId\":\"" + chathashfromdiv + "\",\"text\":\"" + notemsg + "\"}\r\n------WebKitFormBoundaryFeIiMdHaxAteNUHd--\r\n",
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                });

                document.getElementById('msgftochatornotes1').value = ''

                setTimeout(
                    async function () {
                        if (document.getElementById('placechatid').innerText != '') {
                            // Очистка поля infofield
                            document.getElementById('infofield').innerHTML = '';

                            try {
                                // Выполняем fetch-запрос с добавлением x-csrf-token в заголовки
                                const response = await fetch(
                                    "https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText,
                                    {
                                        headers: { "x-csrf-token": aftoken }
                                    }
                                );

                                // Проверяем успешность ответа
                                const convdata = await response.json();

                                // Логика обработки ответа
                                if (convdata.status != null && convdata.status == 'AssignedToOperator') {
                                    isChatOnOperator = true;
                                } else {
                                    isChatOnOperator = false;
                                }

                                // Дополнительная обработка
                                fillchatbox();
                                checkAndChangeStyle();
                            } catch (error) {
                                console.error("Ошибка выполнения fetch-запроса:", error);
                            }
                        }
                    },
                    1000
                );
            }
        }
    }
}
