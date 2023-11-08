var win_Chathis =  // описание элементов окна Истории чатов
    `<div style="display: flex; width: 410px;">
        <span style="width: 410px">
			<span style="cursor: default;">
				<div style="margin: 5px; width: 410px;" id="chathisheader">
					<button class="mainButton" title="Скрытие меню" id="hideMeChHis" style="width:50px; background: #228B22;">hide</button>
					<button class="mainButton" title="Очистка всех полей" id="clearallinfo" style="width:25px;">🧹</button>
					<select style="height:28px; width:260px; text-align:center" id="operatorstp" onchange="findchatsoper()">
							<option selected="" disabled="">Операторы на линии</option>
					</select>
					<button class="mainButton" title="Обновляет список активных операторов, их статус, и количества чатов" id="RefrehOperators" style="width:25px;">♻</button>
					<button class="mainButton" title="Показывает инеформацию по пользователю из чата, его айди, почту, телефон, характеристики устройства и тп" id="getdatafrchat" style="width:25px;">ℹ</button>
				</div>
				<div style="margin: 5px; width: 410px; display:flex; justify-content:space-evenly;" id="chathismenu">
					<button class="mainButton" title="Возвращает на экран просмотра списка чатов" id="back_to_chat_his" style="width:50px; font-size:22px; padding:0;">🔙</button>
					 <input id="chatuserhis" placeholder="ID пользователя" autocomplete="off" type="text" style="text-align: center; width: 130px; color: black; margin-top: 5px">
					 <input id="hashchathis" placeholder="Хеш чата" title="" autocomplete="off" type="text" style="text-align: center; width: 130px; color: black; margin-top: 5px">
					<button class="mainButton" title="Находит историю чатов или открывает по хешу чата диалог" id="btn_search_history" style="width:50px;font-size:22px;padding:0;">🔎</button>
				</div>
				<div style="margin-top: 5px; width: 410px;display:flex; justify-content:center;margin-bottom:5px;" id="databoxchathis">
					<button class="mainButton" title="Инструкция по этой форме" id="chhisinstr" style="margin-right: 5px;">❓</button>
					<button class="mainButton" id="refreshchat" style="width:30px; font-size:16px;" title="Обновляет содержимое окна с чатом, если он активный, чтобы увидеть новые записи">🔄</button>
					<span style="color:bisque; float:center; margin-top:5px; margin-left:10px;">От </span>
					<input type="date" style="color:black; margin-left:5px;  width:115px; text-align:center; " name="StartDataChHis" id="dateFromChHis">
					<span style="color:bisque; margin-top:5px; margin-left:10px; float:right; height:28px;">До </span>
					<input type="date" style="color:black; float:right; margin-left:5px; margin-right:10px; width:115px; text-align:center; " name="EndDataChHis" id="dateToChHis">
					<button class="mainButton" style="width:30px;" id="chagetheme" title="Переключается светлую тему ☀ и темную🌛 вывода чата с пользователем">🌛</button>
				</div>
			</span>

				<div style="width: 410px;display:none" id="somechatinfo">
					<span id="usidchat" style="color:bisque; margin-left:10px; margin-top:5px; user-select:none; cursor:pointer" title="При клике копирует сам айдишник">User ID: </span> <span id="placeusid" style="color:bisque; margin-left:5px; margin-top:5px;"></span>
					<button class="mainButton" id="startchat" style="margin-left:10px;" title="Начать новый чат с пользователем">💬</button>
					<button class="mainButton" id="opencmtbar" style="margin-left:5px;" title="Открыть инструмент добавления комментария к чату (для тех у кого внизу в самом модуле не отображается это поле)">🚧</button>
					<button class="mainButton" id="takechat" style="margin-left: 117px; margin-top:5px;" title="Забирает чат и назначает на вас,но некоторые чаты или у других коллег забраться не получится">Забрать</button>
					<br>
					<span id="chid" style="color:bisque; margin-left:10px; margin-top:5px; user-select:none; cursor:pointer" title="При клике копирует ссылку с добавлением HDI">Chat ID: </span> <span id="placechatid" style="color:bisque; margin-left:5px; margin-top:5px;"></span>
					<button class="mainButton" id="reassign" title="По нажатию на кнопку переведет чат на сотрудника. Порядок такой: выбираете из списка операторы на линии того, кому желаете перевести, после чего открываете чат по хешу в поле хеш чата вводите его и нажимаете найти, и затем уже после этого жмете на кнопку и скрипт отработает" style="width:45px; margin-left:5px; font-size:16px; margin-top:2px;user-select:none;">🔀</button>
				</div>

			<div id="comentsbar" style="width: 410px; height:55px; position:fixed; top:50vh; right:40vh; background: rgb(70, 68, 81); display:none">
						<textarea id="msgftochatornotes1" style="margin-left: 10px; margin-top: 5px; width: 210px; height: 29px; background: lightgrey;position: absolute; bottom: 12px;"></textarea>
						<button class="mainButton" id="sendmsgtochatornotes1" title="В зависимости от опции отправляет текст в чат или заметки" style="margin-left: 5px; margin-top:5px; position:absolute; top 10px; left:220px;">Send</button>
						<input class="radio" type="radio" name="chatornotes1" style="float:right; margin-top:10px;margin-right:5px;" value="Notes" checked="" resolved=""><label style="color:bisque; font-size: 16px;float:right; margin-right:5px;margin-top:10px;">Заметки</label>
						<input class="radio" type="radio" name="chatornotes1" style="float:right;margin-top:10px; margin-right:5px;" value="Chat" resolved=""><label style="color:bisque; font-size: 16px; float:right; margin-top:10px; margin-right:5px;">Чат</label>
						<button class="mainButton" id="hidecmtfield" title="скрывает эту менюшку небольшую" style="position:fixed;right:40vh; top:53vh; height:24px; width:25px; padding:0;">&gt;</button>
			</div>

			<div id="infofield" style="color:bisque; margin-left:10px;margin-top:5px width:410px; height:75vh; overflow-x:hidden;">
			</div>

			<div id="bottommenuchhis" style="width: 410px; position:absolute; display:none;">
				<textarea id="msgftochatornotes" style="margin-left: 10px; margin-top: 5px; width: 210px; height: 29px; background: lightgrey;position: absolute; bottom: 2px;"></textarea>
				<button class="mainButton" id="sendmsgtochatornotes" title="В зависимости от опции отправляет текст в чат или заметки" style="margin-left: 5px; margin-top:5px; position:absolute; top 10px; left:220px;">Send</button>
				<input class="radio" type="radio" name="chatornotes" style="float:right; margin-top:10px;margin-right:5px;" value="Notes" checked="" resolved=""><label style="color:bisque; font-size: 16px;float:right; margin-right:5px;margin-top:10px;">Заметки</label>
				<input class="radio" type="radio" name="chatornotes" style="float:right;margin-top:10px; margin-right:5px;" value="Chat" resolved=""><label style="color:bisque; font-size: 16px; float:right; margin-top:10px; margin-right:5px;">Чат</label>
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
wintChatHis.style = 'min-height: 25px; min-width: 65px; height:100vh; background: rgb(70, 68, 81); top: 0px; right:0px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black; overflow:hidden';
wintChatHis.style.display = 'none';
wintChatHis.setAttribute('id', 'AF_ChatHis');
wintChatHis.innerHTML = win_Chathis;

function fillchatbox() { //функция наполнения элемента, где выводится история чатов

    document.getElementById('infofield').innerHTML = ''

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
					'CloseConversation': (function() {
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
				
            // Further mappings and conditions for "Event"
            // ... (similar style as the above example)

            // appendToInfoField(`
                // <div class="event-container">
                    // ${eventmsg}
                    // <span class="event-date">${time}</span>
                // </div>
            // `);
            break;

        case "AnswerOperatorWithBot":
		case "AnswerSystem":
        case "AnswerBot":
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

	
    /*for (let i = 0; i < convdata.messages.length; i++) {
        timearr.push(new Date(convdata.messages[i].ts).toLocaleDateString('ru-RU', options))
        timearr2.push(new Date(convdata.messages[i].ts).toLocaleTimeString('ru-RU', options2))
        switch (convdata.messages[i].tpe) {
            case "Question":
                if (convdata.messages[i].click == undefined) {

                    testarray = convdata.messages[i].txt.match(/<p>(.*?)<\/p>/gm);

                    if (testarray == null) {
                        brarray = [];
                        if (convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm) != null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm) == null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm) == null)
                            brarray.push(convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm))
                        else if (convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm) == null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm) != null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm) == null)
                            brarray.push(convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm))
                        else if (convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm) == null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm) == null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm) != null)
                            brarray.push(convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm))
                        else if (convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm) == null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm) != null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm) != null)
                            brarray.push(convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm), convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm))
                        else if (convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm) != null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm) == null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm) != null)
                            brarray.push(convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm), convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm))
                        else if (convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm) != null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm) != null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm) == null)
                            brarray.push(convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm), convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm))
                        else if (convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm) != null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm) != null && convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm) != null)
                            brarray.push(convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpeg/gm), convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*jpg/gm), convdata.messages[i].txt.match(/https:\/\/vimbox-resource.*png/gm))
                        else brarray = null;
                    }

                    convdata.channelUser.fullName == undefined ? convdata.channelUser.fullName = "Widget" : convdata.channelUser.fullName = convdata.channelUser.fullName

                    if (testarray != null) {
                        temppics = [];

                        for (let i = 0; i < testarray.length; i++) {
                            if (testarray[i].match(/https:\/\/vimbox-resource.*jpg/gm) != null)
                                temppics.push(testarray[i].match(/https:\/\/vimbox-resource.*jpg/gm)[0])
                            else if (testarray[i].match(/https:\/\/vimbox-resource.*png/gm) != null)
                                temppics.push(testarray[i].match(/https:\/\/vimbox-resource.*png/gm)[0])
                            else if (testarray[i].match(/https:\/\/vimbox-resource.*jpeg/gm) != null)
                                temppics.push(testarray[i].match(/https:\/\/vimbox-resource.*jpeg/gm)[0])
                        }

                        if (temppics.length == 1) {
                            document.getElementById('infofield').innerHTML += '<br>' + '<div class="question-event">' + '<span class="question-event-name">' + convdata.channelUser.fullName + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + convdata.messages[i].txt.replace(convdata.messages[i].txt.match(/<p>(.*?)<\/p>/gm)[0], `<a href="${temppics[0]}" data-lightbox="pictures"><img src="${temppics[0]}" class="img-chat-history" alt="Изображение"></img></a>`) + '</a>' + '</div>' + '</div>'

                        } else if (temppics.length > 1) {

                            restul = convdata.messages[i].txt;
                            for (let j = 0; j < temppics.length; j++) {
                                restul = restul.replace(convdata.messages[i].txt.match(/<p>(.*?)<\/p>/gm)[j], `<a href="${temppics[j]}" data-lightbox="pictures"><img src="${temppics[j]}" class="img-chat-history" alt="Изображение"></img></a>`)

                            }

                            document.getElementById('infofield').innerHTML += '<br>' + '<div class="question-event">' + '<span class="question-event-name">' + convdata.channelUser.fullName + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + restul + '</div>' + '</div>'
                        } else if (temppics.length == 0) {
                            document.getElementById('infofield').innerHTML += '<br>' + '<div class="question-event">' + '<span class="question-event-name">' + convdata.channelUser.fullName + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + convdata.messages[i].txt + '</div>' + '</div>'
                        }
                    } else if (brarray != null) {

                        if (brarray.length == 1)
                            document.getElementById('infofield').innerHTML += '<br>' + '<div class="question-event">' + '<span class="question-event-name">' + convdata.channelUser.fullName + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + convdata.messages[i].txt.replace(convdata.messages[i].txt, `<img src="${brarray[0]}" class="img-chat-history"></img>`) + '</div>' + '</div>'

                    } else {
                        document.getElementById('infofield').innerHTML += '<br>' + '<div class="question-event">' + '<span class="question-event-name">' + convdata.channelUser.fullName + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + convdata.messages[i].txt + '</div>' + '</div>'
                    }

                } else {
                    document.getElementById('infofield').innerHTML += '<br>' + '<div class="question-event">' + '<span class="question-event-name">' + convdata.channelUser.fullName + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + convdata.messages[i].click.clickLabel + '</div>' + '</div>'
                }
                break;

            case "Event":
                let eventmsg;

                if (convdata.messages[i].eventTpe == 'NewConversation')
                    eventmsg = 'Начат новый диалог'
                else if (convdata.messages[i].eventTpe == 'RunScenario')
                    eventmsg = 'Сценарий запущен'
                else if (convdata.messages[i].eventTpe == 'FirstTimeInQueue')
                    eventmsg = 'Диалог отправлен в очередь'
                else if (convdata.messages[i].eventTpe == 'RunIntegration')
                    eventmsg = 'Запущена интеграция ' + convdata.messages[i].payload.name
                else if (convdata.messages[i].eventTpe == 'FinishIntegration')
                    eventmsg = 'Интеграция успешно отработала'

                if (convdata.messages[i].eventTpe != 'AssignToOperator' && convdata.messages[i].eventTpe != 'ReturnToQueue' && convdata.messages[i].eventTpe != 'CloseConversation' && convdata.messages[i].eventTpe != 'CreatedByOperator') {
                    document.getElementById('infofield').innerHTML += '<div class="event-container">' + eventmsg + '<span class="event-date">' + timearr2[i] + '</span>' + '</div>'
                } else if (convdata.messages[i].eventTpe == 'AssignToOperator' && convdata.messages[i].payload.status == 'OnOperator' && convdata.messages[i].payload.oid != undefined) {
                    let operid = convdata.messages[i].payload.oid;
                    let opername;
                    opername = operatorsarray.filter(i => (i.operator != null && i.operator != undefined && i.operator.id == operid))
                    if (opername != '') {
                        document.getElementById('infofield').innerHTML += '<div class="event-container">' + 'Диалог назначен на ' + opername[0].operator.fullName + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    } else document.getElementById('infofield').innerHTML += '<div class="event-container">' + 'Диалог назначен на оператора' + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                } else if (convdata.messages[i].eventTpe == 'AssignToOperator' && convdata.messages[i].payload.status == 'AssignedToOperator' && convdata.messages[i].payload.oid != undefined) {
                    let operid = convdata.messages[i].payload.oid;
                    let opername;
                    opername = operatorsarray.filter(i => (i.operator != null && i.operator.id == operid))
                    if (opername != '') {
                        document.getElementById('infofield').innerHTML += '<div class="event-container">' + opername[0].operator.fullName + ' взял(а) диалог в работу' + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    } else {
                        document.getElementById('infofield').innerHTML += '<div class="event-container">' + 'Оператор взял(а) диалог в работу' + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    }
                } else if (convdata.messages[i].eventTpe == 'ReturnToQueue' && convdata.messages[i].payload.sender != undefined && convdata.messages[i].payload.sender != 'timer') {
                    let operid = convdata.messages[i].payload.sender;
                    let opername;
                    opername = operatorsarray.filter(i => (i.operator != null && i.operator.id == operid))
                    if (opername != '') {
                        document.getElementById('infofield').innerHTML += '<div class="event-name">' + opername[0].operator.fullName + ' вернул(а) диалог в очередь с тематикой ' + '<br>' + convdata.messages[i].payload.afsName + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    } else {
                        document.getElementById('infofield').innerHTML += '<div class="event-name">' + 'Оператор вернул(а) диалог в очередь с тематикой ' + '<br>' + convdata.messages[i].payload.afsName + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    }
                } else if (convdata.messages[i].eventTpe == 'ReturnToQueue' && convdata.messages[i].payload.sender == undefined) {
                    let operid = convdata.messages[i].payload.prevOid;
                    let opername;
                    opername = operatorsarray.filter(i => (i.operator != null && i.operator.id == operid))
                    if (opername != '') {
                        document.getElementById('infofield').innerHTML += '<div class="event-name">' + 'Диалог вернулся в общую очередь от ' + opername[0].operator.fullName + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    } else {
                        document.getElementById('infofield').innerHTML += '<div class="event-name">' + 'Диалог вернулся в общую очередь от оператора' + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    }
                } else if (convdata.messages[i].eventTpe == 'ReturnToQueue' && convdata.messages[i].payload.sender != undefined && convdata.messages[i].payload.sender == 'timer') {
                    document.getElementById('infofield').innerHTML += '<div class="event-name">' + 'Диалог автоматически возвращен в очередь по отсутствию активности оператора' + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                } else if (convdata.messages[i].eventTpe == 'CloseConversation' && convdata.messages[i].payload.status != 'ClosedByBot' && convdata.messages[i].payload.sender == 'userAnswerTimer') {
                    document.getElementById('infofield').innerHTML += '<div class="event-name">' + 'Диалог автоматически закрыт по отсутствию активности пользователя' + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                } else if (convdata.messages[i].eventTpe == 'CloseConversation' && Object.values(convdata.messages[i].payload) != '' && convdata.messages[i].payload.status != 'ClosedByBot' && convdata.messages[i].payload.sender != 'userAnswerTimer') {
                    let operidcls = convdata.messages[i].payload.sender;
                    let opernamecls;
                    opernamecls = operatorsarray.filter(i => (i.operator != null && i.operator.id == operidcls))
                    if (opernamecls != '') {
                        document.getElementById('infofield').innerHTML += '<div class="event-name">' + opernamecls[0].operator.fullName + ' закрыл чат с тематикой:  ' + '<br>' + convdata.messages[i].payload.afsName + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    } else {
                        document.getElementById('infofield').innerHTML += '<div class="event-name">' + 'Оператор закрыл чат с тематикой:  ' + '<br>' + convdata.messages[i].payload.afsName + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    }
                } else if (convdata.messages[i].eventTpe == 'CloseConversation' && Object.values(convdata.messages[i].payload) == '') {
                    document.getElementById('infofield').innerHTML += '<div class="event-name">' + convdata.messages[i].eventTpe + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                } else if (convdata.messages[i].eventTpe == 'CreatedByOperator') {
                    let operid = convdata.messages[i].payload.oid;
                    let opername;
                    opername = operatorsarray.filter(i => (i.operator != null && i.operator.id == operid))
                    if (opername != '') {
                        document.getElementById('infofield').innerHTML += '<div class="event-name">' + opername[0].operator.fullName + ' открыл(а) новый диалог' + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    } else {
                        document.getElementById('infofield').innerHTML += '<div class="event-name">' + 'Оператор открыл(а) новый диалог' + '<span class="event-other-date">' + timearr2[i] + '</span>' + '</div>'
                    }
                }
                break;

            case "AnswerOperatorWithBot":
                document.getElementById('infofield').innerHTML += '<br>' + '<div class="answer-bot-container">' + '<span class="answer-bot-name">' + 'AutoFAQ bot' + '</span>' + '<span class="answer-bot-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + convdata.messages[i].txt + '</div>' + '</div>'
                break;

            case "AnswerBot":
                document.getElementById('infofield').innerHTML += '<br>' + '<div class="answer-bot-container">' + '<span class="answer-bot-name">' + 'AutoFAQ bot' + '</span>' + '<span class="answer-bot-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + convdata.messages[i].txt + '</div>' + '</div>'
                break;

            case "AnswerOperator":
                let operidansw = convdata.messages[i].operatorId
                let opernameansw;
                opernameansw = operatorsarray.filter(i => (i.operator != null && i.operator.id == operidansw))
                document.getElementById('infofield').innerHTML += '<br>' + '<div class="answer-oper-container">' + '<span class="answer-oper-name">' + opernameansw[0].operator.fullName + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div  class="question-event-text">' + '<br>' + convdata.messages[i].txt + '</div>' + '</div>'
                break;

            case "OperatorComment":
                if (convdata.messages[i].operatorId != 'autoFAQ') {
                    let operidanswcom = convdata.messages[i].operatorId
                    let opernameanswcom;
                    opernameanswcom = operatorsarray.filter(i => (i.operator != null && i.operator.id == operidanswcom))
                    if (opernameanswcom != '') {
                        document.getElementById('infofield').innerHTML += '<br>' + '<div class="oper-comment-container">' + '<span class="oper-comment-name">' + opernameanswcom[0].operator.fullName + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div class="question-event-text">' + '<br>' + convdata.messages[i].txt + '</div>' + '</div>'
                    } else {
                        document.getElementById('infofield').innerHTML += '<br>' + '<div class="oper-comment-container">' + '<span class="oper-comment-name">' + 'Оператор' + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div class="question-event-text">' + '<br>' + convdata.messages[i].txt + '</div>' + '</div>'
                    }
                } else {
                    document.getElementById('infofield').innerHTML += '<br>' + '<div class="oper-comment-container">' + '<span class="oper-comment-operator">' + convdata.messages[i].operatorId + '</span>' + '<span class="question-event-date">' + timearr[i] + '</span>' + '<div class="question-event-text">' + '<br>' + convdata.messages[i].txt + '</div>' + '</div>'
                }
                break;
        }
    }*/
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

    if (document.getElementById('comentsbar').style.display == '')
        document.getElementById('comentsbar').style.display = 'none';


    document.getElementById('infofield').innerHTML = 'Загрузка'

    if (objSel.length > 1) {
        for (let i = 1; i < objSel.length; i++) {
            if (objSel[i].selected == true) {
                await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                    "headers": {
                        "content-type": "application/json",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin"
                    },
                    "body": `{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"${objSel[i].value}\"],\"tsFrom\":\"${document.getElementById('dateFromChHis').value}T${difhrs}:${mins}:${secs}.000Z\",\"tsTo\":\"${document.getElementById('dateToChHis').value}T${hrs}:${mins}:${secs}.000Z\",\"usedStatuses\":[\"OnOperator\",\"AssignedToOperator\",\"Active\"],\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":1,\"limit\":10}`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                }).then(r => r.json()).then(r => operchatsdata = r)
                console.log(operchatsdata)

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
                checkandchangestyle()

                for (let i = 0; i < document.getElementsByClassName('chatlist').length; i++) {
                    document.getElementsByClassName('chatlist')[i].title = operchatsdata.items[i].conversationId

                    document.getElementsByClassName('chatlist')[i].onclick = async () => {

                        await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementsByClassName('chatlist')[i].title).then(r => r.json()).then(r => convdata = r)
                        console.log(convdata)

                        if (convdata.status != null && convdata.status == 'AssignedToOperator')
                            isChatOnOperator = true
                        else isChatOnOperator = false;

                        fillchatbox();
                        checkandchangestyle();
                    } // конец функции клика по списку в найденном чате
                }
            }
        }
    }
}

document.getElementById('hideMeChHis').onclick = () => { //форма hide
	if (document.getElementById('AF_ChatHis').style.display == '') {
		document.getElementById('AF_ChatHis').style.display = 'none'
        document.getElementById('opennewcat').classList.remove('activeScriptBtn');
		document.getElementById('rightPanel').style.right = "22px";
		document.getElementById('infofield').innerText = ''
		document.getElementById('placeusid').innerText = ''
		document.getElementById('placechatid').innerText = ''
		document.getElementById('somechatinfo').style.display = 'none';
		document.getElementById('bottommenuchhis').style.display = 'none';
		document.getElementById('comentsbar').style.display = 'none';
		document.getElementById('chatuserhis').value = ''
		document.getElementById('hashchathis').value = ''
	}
}
	
document.getElementById('clearallinfo').onclick = () => { //кнопка очистки
	document.getElementById('infofield').innerText = ''
	document.getElementById('placeusid').innerText = ''
	document.getElementById('placechatid').innerText = ''
	document.getElementById('somechatinfo').style.display = 'none';
	document.getElementById('bottommenuchhis').style.display = 'none';
	document.getElementById('comentsbar').style.display = 'none';
	document.getElementById('chatuserhis').value = ''
	document.getElementById('hashchathis').value = ''
}
	
document.getElementById('chatuserhis').addEventListener('input', function(){
	onlyNumbers(this);
})
	
	document.getElementById('chid').onclick = () => { // копирует в буфер айди чата
        copyToClipboard('https://hdi.skyeng.ru/autofaq/conversation/-11/' + document.getElementById('placechatid').innerText)
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

function checkandchangestyle() { //функция проверки и переклоючения стиля при открытии  самого окна с историей чата

    if (localStorage.getItem('theme') == 'light') {

        for (let i = 0; i < document.getElementsByClassName('chatlist').length; i++) {
            document.getElementsByClassName('chatlist')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('answer-bot-date').length; i++) {
            document.getElementsByClassName('answer-bot-date')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('event-name').length; i++) {
            document.getElementsByClassName('event-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('question-event-text').length; i++) {
            document.getElementsByClassName('question-event-text')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('question-event-name').length; i++) {
            document.getElementsByClassName('question-event-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('event-container').length; i++) {
            document.getElementsByClassName('event-container')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('oper-comment-name').length; i++) {
            document.getElementsByClassName('oper-comment-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('oper-comment-container').length; i++) {
            document.getElementsByClassName('oper-comment-container')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('question-event-date').length; i++) {
            document.getElementsByClassName('question-event-date')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('answer-oper-name').length; i++) {
            document.getElementsByClassName('answer-oper-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('answer-bot-name').length; i++) {
            document.getElementsByClassName('answer-bot-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('oper-comment-operator').length; i++) {
            document.getElementsByClassName('oper-comment-operator')[i].classList.toggle('light')
        }

    } else if (localStorage.getItem('theme') == 'dark') {

        for (let i = 0; i < document.getElementsByClassName('chatlist').length; i++) {
            if (document.getElementsByClassName('chatlist')[i].classList.contains('light'))
                document.getElementsByClassName('chatlist')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('answer-bot-date').length; i++) {
            if (document.getElementsByClassName('answer-bot-date')[i].classList.contains('light'))
                document.getElementsByClassName('answer-bot-date')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('event-name').length; i++) {
            if (document.getElementsByClassName('event-name')[i].classList.contains('light'))
                document.getElementsByClassName('event-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('question-event-text').length; i++) {
            if (document.getElementsByClassName('question-event-text')[i].classList.contains('light'))
                document.getElementsByClassName('question-event-text')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('question-event-name').length; i++) {
            if (document.getElementsByClassName('question-event-name')[i].classList.contains('light'))
                document.getElementsByClassName('question-event-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('event-container').length; i++) {
            if (document.getElementsByClassName('event-container')[i].classList.contains('light'))
                document.getElementsByClassName('event-container')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('oper-comment-name').length; i++) {
            if (document.getElementsByClassName('oper-comment-name')[i].classList.contains('light'))
                document.getElementsByClassName('oper-comment-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('oper-comment-container').length; i++) {
            if (document.getElementsByClassName('oper-comment-container')[i].classList.contains('light'))
                document.getElementsByClassName('oper-comment-container')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('question-event-date').length; i++) {
            if (document.getElementsByClassName('question-event-date')[i].classList.contains('light'))
                document.getElementsByClassName('question-event-date')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('answer-oper-name').length; i++) {
            if (document.getElementsByClassName('answer-oper-name')[i].classList.contains('light'))
                document.getElementsByClassName('answer-oper-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('answer-bot-name').length; i++) {
            if (document.getElementsByClassName('answer-bot-name')[i].classList.contains('light'))
                document.getElementsByClassName('answer-bot-name')[i].classList.toggle('light')
        }

        for (let i = 0; i < document.getElementsByClassName('oper-comment-operator').length; i++) {
            if (document.getElementsByClassName('oper-comment-operator')[i].classList.contains('light'))
                document.getElementsByClassName('oper-comment-operator')[i].classList.toggle('light')
        }
    }
}

document.getElementById('chagetheme').onclick = () => { //функция переключения  по кнопке темы в истории чатов на светлую(классическуб в стиле АФ) и темную
    if (localStorage.getItem('theme') == 'light') {
        localStorage.setItem('theme', 'dark')
        document.getElementById('chagetheme').innerHTML = '🌛'
        document.getElementById('infofield').style.background = "#464451";
        checkandchangestyle();
    } else if (localStorage.getItem('theme') == 'dark') {
        localStorage.setItem('theme', 'light')
        document.getElementById('chagetheme').innerHTML = '☀'
        document.getElementById('infofield').style.background = "#f5f5f5";
        checkandchangestyle();
    }
};

function getopennewcatButtonPress() { // открывает меню для работы с историей чата по типу кота Омельченко

        if (document.getElementById('AF_ChatHis').style.display == '') {
            document.getElementById('AF_ChatHis').style.display = 'none';
		    document.getElementById('rightPanel').style.right = "22px";
            document.getElementById('opennewcat').classList.remove('activeScriptBtn');
        }else {
            document.getElementById('AF_ChatHis').style.display = '';
			document.getElementById('rightPanel').style.right = "422px";
            document.getElementById('opennewcat').classList.add('activeScriptBtn');
		}

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

        async function currstate() { // функция получает массив операторов ТП, которые не в офлайне
		let opsflag;
		let operdepchist = document.getElementsByClassName('user_menu-dropdown-user_name')[0].innerText.split('-')[0];

		switch (operdepchist) {
		  case 'ТП':
			opsflag = 'ТП';
			break;
		  case 'КЦ':
			opsflag = 'КЦ';
			break;
		  case 'КМ':
			opsflag = 'КМ';
			break;
		  case 'ТС':
			opsflag = 'ТС';
			break;
		  case 'ТПPrem':
			opsflag = 'ТПPrem';
			break;
		  default:
			opsflag = 'Unknown';
			break;
		}

		console.log(`Подразделение для Chat history: ${opsflag}`);

			
            activetechopers = []
            objSel.length = 1
            objSel[0].selected = true;
            await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", {
                "credentials": "include"
            }).then(r => r.json()).then(result => {

                for (let i = 0; i < result.onOperator.length; i++) {
                    if (opsflag == 'ТП' && result.onOperator[i].operator != null && result.onOperator[i].operator.status != "Offline" && result.onOperator[i].operator.fullName.match(/ТП\D/)) {
                        activetechopers.push(result.onOperator[i])
                    } else if (opsflag == 'КЦ' && result.onOperator[i].operator != null && result.onOperator[i].operator.status != "Offline" && result.onOperator[i].operator.fullName.match(/КЦ\D/)) {
                        activetechopers.push(result.onOperator[i])
                    } else if (opsflag == 'КМ' && result.onOperator[i].operator != null && result.onOperator[i].operator.status != "Offline" && result.onOperator[i].operator.fullName.match(/КМ\D/)) {
                        activetechopers.push(result.onOperator[i])
                    } else if (opsflag == 'ТС' && result.onOperator[i].operator != null && result.onOperator[i].operator.status != "Offline" && result.onOperator[i].operator.fullName.match(/ТС\D/)) {
                        activetechopers.push(result.onOperator[i])
                    } else if (opsflag == 'ТПPrem' && result.onOperator[i].operator != null && result.onOperator[i].operator.status != "Offline" && result.onOperator[i].operator.fullName.match(/ТПPrem\D/)) {
                        activetechopers.push(result.onOperator[i])
                    } // end of if state
                } // end of for
            })

            // if (activetechopers.length != 0) {
                // for (let i = 0; i < activetechopers.length; i++) {
                    // if (activetechopers[i].aCnt == null)
                        // activetechopers[i].aCnt = 0;

                    // if (activetechopers[i].operator.status == "Online") {
                        // addOption(objSel, `🟢 ${activetechopers[i].operator.fullName} (${activetechopers[i].aCnt})`, `${activetechopers[i].operator.id}`)
                    // } else if (activetechopers[i].operator.status == "Busy") {
                        // addOption(objSel, `🟡 ${activetechopers[i].operator.fullName} (${activetechopers[i].aCnt})`, `${activetechopers[i].operator.id}`)
                    // } else if (activetechopers[i].operator.status == "Pause") {
                        // addOption(objSel, `🔴 ${activetechopers[i].operator.fullName} (${activetechopers[i].aCnt})`, `${activetechopers[i].operator.id}`)
                    // }
                // }
            // }
			
			if (activetechopers.length) {
			  let statusMap = {
				Online: '🟢',
				Busy: '🟡',
				Pause: '🔴'
			  };
			  activetechopers.forEach(activetechoper => {
				let { operator, aCnt = 0 } = activetechoper;
				if (operator) {
				  addOption(objSel, `${statusMap[operator.status]} ${operator.fullName} (${aCnt})`, operator.id);
				}
			  });
			}
        }

        document.getElementById('getdatafrchat').onclick = () => { //открывает окно с информацией об обратившемся пользователе


            if (typeof (convdata) !== 'undefined') {

                if (document.getElementById('userchatdata').style.display == 'none')
                    document.getElementById('userchatdata').style.display = ''
                else document.getElementById('userchatdata').style.display = 'none'

                if (convdata.channelUser.payload.techScreeningData == undefined)
                    convdata.channelUser.payload.techScreeningData = convdata.channelUser.payload["Тех.инфа об устройствах"]

                if (convdata.channelUser.payload.userFullName != undefined)
                    document.getElementById('datafield').innerHTML = '<span style="color:#00BFFF; font-weight:700;">' + convdata.channelUser.payload.userFullName + '</span>' + '<br>' + '<span style="color: #00FA9A;">' + '(' + convdata.channelUser.payload.userType + ')' + '</span>' + ' ID: ' + convdata.channelUser.payload.id + '<br>' + '<span style="user-select: none;">' + '📧: ' + '</span>' + convdata.channelUser.payload.email + '<br>' + '<span style="user-select: none;">' + '📞:' + '</span>' + convdata.channelUser.payload.phone + '<br>' + "Tech Screening Data: " + '<br>' + convdata.channelUser.payload.techScreeningData;
                else
                    document.getElementById('datafield').innerHTML = '<span style="color:#00BFFF; font-weight:700;">' + convdata.channelUser.fullName + '</span>' + '<br>' + '<span style="color: #00FA9A;">' + '(' + convdata.channelUser.payload.userType + ')' + '</span>' + ' ID: ' + convdata.channelUser.payload.id + '<br>' + '<span style="user-select: none;">' + '📧: ' + '</span>' + convdata.channelUser.payload.email + '<br>' + '<span style="user-select: none;">' + '📞:' + '</span>' + convdata.channelUser.payload.phone + '<br>' + "Tech Screening Data: " + '<br>' + convdata.channelUser.payload.techScreeningData;
            } else alert("Не выбран активный чат")
        }

        currstate();
        console.log(activetechopers);


        for (let i = 0; i < radiobtnsarray.length; i++) {
            if (radiobtnsarray[i].value == 'Notes' && radiobtnsarray[i].checked == true) {
                document.getElementById('msgftochatornotes').style.background = 'LightGrey';
            } else if (radiobtnsarray[i].value == 'Chat' && radiobtnsarray[i].checked == true) {
                document.getElementById('msgftochatornotes').style.background = 'white';
            }

            radiobtnsarray[i].onclick = () => {
                if (radiobtnsarray[i].value == 'Notes' && radiobtnsarray[i].checked == true) {
                    document.getElementById('msgftochatornotes').style.background = 'LightGrey';
                } else if (radiobtnsarray[i].value == 'Chat' && radiobtnsarray[i].checked == true) {
                    document.getElementById('msgftochatornotes').style.background = 'white';
                }
            }
        }

        document.getElementById('btn_search_history').onclick = async () => { //функця обработки нажатия "Найти"

            if (document.getElementById('chatuserhis').value != '' && document.getElementById('hashchathis').value == '') { // если айди пользователя введен, а хеш чата не введен
                flagsearch = 'searchbyuser'
                let lusid = document.getElementById('chatuserhis').value.trim();
                let from = document.getElementById('dateFromChHis').value
                let to = document.getElementById('dateToChHis').value
                document.getElementById('chatuserhis').value = ''

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

                if (document.getElementById('comentsbar').style.display == '')
                    document.getElementById('comentsbar').style.display = 'none';

                document.getElementById('infofield').innerHTML = 'Загрузка'

                await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                    "headers": {
                        "content-type": "application/json",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin"
                    },
                    "body": `{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"channelUserFullTextLike\":\"${lusid}\",\"tsFrom\":\"${from}T00:00:00.000Z\",\"tsTo\":\"${to}T23:59:59.059Z\",\"orderBy\":\"ts\",\"orderDirection\":\"Desc\",\"page\":1,\"limit\":10}`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                }).then(r => r.json()).then(r => data = r)
                console.log(data)

                if (data.total == 0)
                    alert("В выбранном диапазоне чатов от пользователя не найдено. Попробуйте, пожалуйста, выбрать другой, либо пользователь не обращался вовсе.")

                for (let i = 0; i < data.items.length; i++) {

				let tmestmp = new Date((data.items[i].ts.split('[GMT]'))[0]);
				let tshrs;
				let tsmin;
				let day;
				let month;
				let actstatus = '';
				let marksarr;

				month = (tmestmp.getMonth() < 9) ? "0" + (tmestmp.getMonth() + 1) : (tmestmp.getMonth() + 1);
				day = (tmestmp.getDate() < 10) ? "0" + tmestmp.getDate() : tmestmp.getDate();
				let year = tmestmp.getFullYear();
				tshrs = (tmestmp.getUTCHours() + 3 < 10) ? "0" + (tmestmp.getUTCHours() + 3) : ((tmestmp.getUTCHours() + 3 >= 24) ? '0' + ((tmestmp.getUTCHours() + 3 - 24)) : (tmestmp.getUTCHours() + 3));
				tsmin = (tmestmp.getMinutes() < 10) ? "0" + tmestmp.getMinutes() : tmestmp.getMinutes();


                    if (data.items[i].stats.rate == undefined || data.items[i].stats.rate.rate == undefined)
                        marksarr = '⭕'
                    else
                        marksarr = data.items[i].stats.rate.rate

                    if (data.items[i].stats.usedStatuses == "AssignedToOperator")
                        actstatus = "🛠"
                    else actstatus = '';

                    //сюда также допилить классы и  менять их в зависимости от темы

                    if (data.items[i].channelUser.payload != undefined && data.items[i].channelUser.payload.userFullName == undefined) {
                        foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700;">' + data.items[i].channelUser.payload.userType + '</span>' + ' ' + data.items[i].channelUser.fullName + '<span style="color: MediumSeaGreen; font-weight:700;">' + ' Оценка: ' + '</span>' + marksarr + actstatus + '</span>' + '<br>'
                    } else if (data.items[i].channelUser.payload != undefined && data.items[i].channelUser.payload.userFullName != undefined) {
                        foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700;">' + data.items[i].channelUser.payload.userType + '</span>' + ' ' + data.items[i].channelUser.payload.userFullName + '<span style="color: MediumSeaGreen; font-weight:700;">' + ' Оценка: ' + '</span>' + marksarr + actstatus + '</span>' + '<br>'
					} else if (data.items[i].channelUser.payload == undefined) {
						foundarr += '<span class="chatlist" style="cursor:pointer;">' + day + '.' + month + '.' + year + ' ' + tshrs + ':' + tsmin + ' ' + '<span style ="color:#00BFFF; font-weight:700;">' + data.items[i].channel.name + '</span>' + ' ' + data.items[i].channelUser.channelTpe + '<span style="color: MediumSeaGreen; font-weight:700;">' + ' Оценка: ' + '</span>' + marksarr + actstatus + '</span>' + '<br>'
					}


                }

                document.getElementById('infofield').innerHTML = foundarr;
                checkandchangestyle()

                for (let i = 0; i < document.getElementsByClassName('chatlist').length; i++) {
                    document.getElementsByClassName('chatlist')[i].title = data.items[i].conversationId

                    document.getElementsByClassName('chatlist')[i].onclick = async () => {

                        await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementsByClassName('chatlist')[i].title).then(r => r.json()).then(r => convdata = r)
                        console.log(convdata)

                        if (convdata.status != null && convdata.status == 'AssignedToOperator')
                            isChatOnOperator = true
                        else isChatOnOperator = false;

                        fillchatbox();
                        checkandchangestyle();
                    } // конец функции клика по списку в найденном чате
                }

            } else if (document.getElementById('chatuserhis').value == '' && document.getElementById('hashchathis').value != '') { //если пользователь не введен, но введн хеш чата
                flagsearch = 'searchbyhash'
                await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('hashchathis').value.trim()).then(r => r.json()).then(r => convdata = r)
                console.log(convdata)

                if (convdata.status != null && convdata.status == 'AssignedToOperator')
                    isChatOnOperator = true
                else isChatOnOperator = false;

                fillchatbox();
                checkandchangestyle();

            } else alert("Введено и ID пользователя и хеш чата, или оба поля пустые. Пожалуйста, выберите что-то одно и повторите попытку.")
        } // конец функции клика найти

        document.getElementById('back_to_chat_his').onclick = () => { // функция обработки нажатия кнопки "Вернуться"
            document.getElementById('infofield').innerHTML = '';
            document.getElementById('placeusid').innerText = '';
            document.getElementById('placechatid').innerText = '';
            document.getElementById('somechatinfo').style.display = 'none';
            document.getElementById('bottommenuchhis').style.display = 'none';
            document.getElementById('comentsbar').style.display = 'none';

            if (foundarr != '' && foundarr != null && foundarr != undefined) {
                document.getElementById('infofield').innerHTML = foundarr;
                checkandchangestyle();

                for (let i = 0; i < document.getElementsByClassName('chatlist').length; i++) {
                    if (flagsearch == 'searchbyuser')
                        document.getElementsByClassName('chatlist')[i].title = data.items[i].conversationId
                    else if (flagsearch == 'searchbyoperator')
                        document.getElementsByClassName('chatlist')[i].title = operchatsdata.items[i].conversationId
                    else if (flagsearch == 'searchbyhash') {
                        if (typeof (operchatsdata) !== 'undefined' && typeof (data) === 'undefined')
                            document.getElementsByClassName('chatlist')[i].title = operchatsdata.items[i].conversationId
                        else if (typeof (data) !== 'undefined' && typeof (operchatsdata) === 'undefined')
                            document.getElementsByClassName('chatlist')[i].title = data.items[i].conversationId
                        else if (typeof (data) !== 'undefined' && typeof (operchatsdata) !== 'undefined')
                            document.getElementsByClassName('chatlist')[i].title = data.items[i].conversationId
                    }

                    document.getElementsByClassName('chatlist')[i].onclick = async () => {

                        await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementsByClassName('chatlist')[i].title).then(r => r.json()).then(r => convdata = r)
                        console.log(convdata)

                        if (convdata.status != null && convdata.status == 'AssignedToOperator')
                            isChatOnOperator = true
                        else isChatOnOperator = false;

                        fillchatbox();
                        checkandchangestyle();
                    } // конец функции клика по списку в найденном чате
                }
            }
        } // конец обработки функции нажатия "Вернуться"

        document.getElementById('chhisinstr').onclick = function () {
            window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-chathistory%F0%9F%92%ACChatHistory')
        }

        document.getElementById('refreshchat').onclick = async () => { // функция обработки нажатия кнопки "обновить"
            if (document.getElementById('placechatid').innerText != '') {
                document.getElementById('infofield').innerHTML = '';

                await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText).then(r => r.json()).then(r => convdata = r)
                console.log(convdata)

                if (convdata.status != null && convdata.status == 'AssignedToOperator')
                    isChatOnOperator = true
                else isChatOnOperator = false;

                fillchatbox();
                checkandchangestyle();
            }
        } // конец обработчика кнопки "Обновить"

        document.getElementById('takechat').onclick = function () { //обработчик функции взятия чата
            var result = confirm("Вы действительно желаете забрать чат?");
            if (result) {
                let chat_id = document.getElementById('placechatid').innerText;
                let operator_id = operatorId;

                fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
                    "headers": {
                        "content-type": "application/json"
                    },
                    "credentials": "include",
                    "body": `{\"command\":\"DO_ASSIGN_CONVERSATION\",\"conversationId\":\"${chat_id}\",\"assignToOperatorId\":\"${operator_id}\"}`,
                    "method": "POST"
                });
            }
        } // конец обработчика нажатия кнопки "Забрать"
		
		
async function startnewchatfast(polzid) { //открывает быстро чат с пользователем
    if (operatorId == "") {
        await whoAmI()
    }

    if (polzid) {
        await fetch(`https://skyeng.autofaq.ai/api/conversation/start?channelId=eca64021-d5e9-4c25-b6e9-03c24s638d4d&userId=${polzid}&operatorId=${operatorId}&groupId=c7bbb211-a217-4ed3-8112-98728dc382d8`, {
            headers: {
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
                console.log(data, chatId)
            })
    } else alert('Не введен id пользователя');
}

        document.getElementById('startchat').onclick = () => { //обработчик функции начала чата с пользователем
            let answer = confirm("Вы действительно желаете начать чат с пользователем?");
            if (answer) {
                if (isChatOnOperator == false) {
                    let polzid = document.getElementById('placeusid').innerText.trim();
                    document.getElementById('startchat').style.background = 'green';
                    startnewchatfast(polzid)
                    setTimeout(() => {
                        document.getElementById('startchat').style.background = '';
                    }, 3000)
                } else alert('Чат не открыт, так как есть активный чат на операторе!')
            }
        } // конец обработчика нажатия кнопки Начать чат с пользователем

        document.getElementById('opencmtbar').onclick = function () { //обработчик функции начала чата с пользователем
            if (document.getElementById('comentsbar').style.display == '')
                document.getElementById('comentsbar').style.display = 'none';
            else
                document.getElementById('comentsbar').style.display = '';

            for (let i = 0; i < radiobtnsarray1.length; i++) {
                if (radiobtnsarray1[i].value == 'Notes' && radiobtnsarray1[i].checked == true) {
                    document.getElementById('msgftochatornotes1').style.background = 'LightGrey';
                } else if (radiobtnsarray1[i].value == 'Chat' && radiobtnsarray1[i].checked == true) {
                    document.getElementById('msgftochatornotes1').style.background = 'white';
                }

                radiobtnsarray1[i].onclick = () => {
                    if (radiobtnsarray1[i].value == 'Notes' && radiobtnsarray1[i].checked == true) {
                        document.getElementById('msgftochatornotes1').style.background = 'LightGrey';
                    } else if (radiobtnsarray1[i].value == 'Chat' && radiobtnsarray1[i].checked == true) {
                        document.getElementById('msgftochatornotes1').style.background = 'white';
                    }
                }
            }

            document.getElementById('hidecmtfield').onclick = function () {
                document.getElementById('comentsbar').style.display = 'none';
            }
        } // конец обработчика нажатия кнопки Начать чат с пользователем

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
                                "sec-fetch-site": "same-origin"
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

                    await fetch("https://skyeng.autofaq.ai/api/conversations/" + chathashfromdiv)
                        .then(r => r.json()).then(r => rdata = r)
                    sesid = rdata.sessionId;

                    let notemsg = '<p>' + document.getElementById('msgftochatornotes').value + '</p>';

                    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
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

                                await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText).then(r => r.json()).then(r => convdata = r)
                                console.log(convdata)

                                fillchatbox();
                                checkandchangestyle();
                            }
                        }, 1000);

                } else if (radiobtnsarray[i].value == 'Chat' && radiobtnsarray[i].checked == true) {

                    let chathashfromdiv = document.getElementById('placechatid').innerText
                    let sesid;

                    await fetch("https://skyeng.autofaq.ai/api/conversations/" + chathashfromdiv)
                        .then(r => r.json()).then(r => rdata = r)
                    sesid = rdata.sessionId;

                    let notemsg = '<p>' + document.getElementById('msgftochatornotes').value + '</p>';

                    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryFeIiMdHaxAteNUHd",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
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

                                await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText).then(r => r.json()).then(r => convdata = r)
                                console.log(convdata)

                                if (convdata.status != null && convdata.status == 'AssignedToOperator')
                                    isChatOnOperator = true
                                else isChatOnOperator = false;

                                fillchatbox();
                                checkandchangestyle();
                            }
                        }, 1000);
                }
            }
        }

        document.getElementById('sendmsgtochatornotes1').onclick = async () => { // обработчик кнопки Отправить в зависимости от радиокнопки в заметки или в чат

            let radiobtnsarray1 = document.getElementsByName('chatornotes1')

            for (let i = 0; i < radiobtnsarray1.length; i++) {
                if (radiobtnsarray1[i].value == 'Notes' && radiobtnsarray1[i].checked == true) {

                    let chathashfromdiv = document.getElementById('placechatid').innerText
                    let sesid;

                    await fetch("https://skyeng.autofaq.ai/api/conversations/" + chathashfromdiv)
                        .then(r => r.json()).then(r => rdata = r)
                    sesid = rdata.sessionId;

                    let notemsg = '<p>' + document.getElementById('msgftochatornotes1').value + '</p>';

                    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
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
                                document.getElementById('infofield').innerHTML = '';

                                await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText).then(r => r.json()).then(r => convdata = r)
                                console.log(convdata)

                                fillchatbox();
                                checkandchangestyle();
                            }
                        }, 1000);

                } else if (radiobtnsarray1[i].value == 'Chat' && radiobtnsarray1[i].checked == true) {

                    let chathashfromdiv = document.getElementById('placechatid').innerText
                    let sesid;

                    await fetch("https://skyeng.autofaq.ai/api/conversations/" + chathashfromdiv)
                        .then(r => r.json()).then(r => rdata = r)
                    sesid = rdata.sessionId;

                    let notemsg = '<p>' + document.getElementById('msgftochatornotes1').value + '</p>';

                    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryFeIiMdHaxAteNUHd",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
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
                                document.getElementById('infofield').innerHTML = '';

                                await fetch("https://skyeng.autofaq.ai/api/conversations/" + document.getElementById('placechatid').innerText).then(r => r.json()).then(r => convdata = r)
                                console.log(convdata)

                                if (convdata.status != null && convdata.status == 'AssignedToOperator')
                                    isChatOnOperator = true
                                else isChatOnOperator = false;

                                fillchatbox();
                                checkandchangestyle();
                            }
                        }, 1000);
                }
            }
        }
    }
	