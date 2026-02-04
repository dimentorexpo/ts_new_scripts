let data = null;
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
					<span style="color:bisque; margin-top:5px; margin-left:10px;">От </span>
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

    let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    let options2 = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

    // след 2 строки - скрипт заполняет значения уже при открытии самого чата по его хешу или при клике на чат из списка в истории
    const user = convdata.channelUser;
    const payload = user.payload || {};
    const isEmptyPayload = Object.keys(payload).length === 0;
    const type = user.channelTpe;

    let result;

    // Telegram
    if (type === 'Telegram') {
        result = "Telegram";
    }
    // WhatsApp
    else if (type === 'WhatsApp') {
        result = "WhatsApp";
    }
    // Widget без payload
    else if (type === 'Widget' && isEmptyPayload) {
        result = "Widget";
    }
    // Widget с payload.id
    else if (type === 'Widget' && payload.id) {
        result = payload.id;
    }
    // Другие каналы с payload
    else if (!isEmptyPayload) {
        result = user.id;
    }
    // fallback
    else {
        result = "Widget";
    }

    document.getElementById('placeusid').innerText = result;


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

    function highlightUserFullSafe(htmlString) {
        // Создаем временный контейнер
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;

        // Рекурсивно ищем текстовые узлы и заменяем в них "User:"
        function replaceInNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                // Заменяем только если это начало строки или после пробела, чтобы не сломать URL
                node.textContent = node.textContent.replace(/User:\s*/g, 'User: ');
                // Примечание: Если нужно добавить класс, это сложнее,
                // но для простой замены текста этого достаточно.
                // Если нужно именно <strong>, то лучше использовать DOMParser, но это рискованно для вставки.
                // Пока оставим простую замену текста, чтобы не ломать верстку.
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Не трогаем теги img, video, audio
                if (node.tagName !== 'IMG' && node.tagName !== 'VIDEO' && node.tagName !== 'AUDIO') {
                    Array.from(node.childNodes).forEach(replaceInNode);
                }
            }
        }

        replaceInNode(tempDiv);
        return tempDiv.innerHTML;
    }




    ///////////////////////////

    function cleanHtmlAroundUrls(text) {
        return text
            .replace(/&lt;\/?p&gt;/g, '')   // убираем &lt;p&gt; и &lt;/p&gt;
            .replace(/<\/?p>/g, '');       // убираем <p> и </p>
    }

    function openImageViewerChatHistory(src) {
        const overlay = document.createElement('div');
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
        overlay.onclick = () => overlay.remove();
    }


    function renderMedia(url) {
        const lower = url.toLowerCase();

        if (lower.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
            return `
                <img src="${url}"
                     class="img-chat-history chat-history-image"
                     data-full="${url}"
                     style="max-width:200px;cursor:zoom-in;border-radius:6px;margin:6px 0;">
            `;
        }

        if (lower.match(/\.(mp4|mov|mkv|webm)$/)) {
            return `
                <video src="${url}"
                       controls
                       style="max-width:300px;margin:6px 0;border-radius:6px;">
                </video>
            `;
        }

        if (lower.match(/\.(mp3|wav|ogg|oga)$/)) {
            return `
                <audio src="${url}"
                       controls
                       style="width:300px;margin:6px 0;">
                </audio>
            `;
        }

        return `<a href="${url}" target="_blank">${url}</a>`;
    }


    function decodeHtmlEntities(str) {
        const txt = document.createElement("textarea");
        txt.innerHTML = str;
        return txt.value;
    }

    function renderMessageText(rawHtml) {
        if (!rawHtml) return '';

        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHtml, 'text/html');

        // Обрабатываем картинки
        doc.querySelectorAll('img').forEach(img => {
            // Если у картинки нет класса, добавляем его
            if (!img.classList.contains('img-chat-history')) {
                img.classList.add('img-chat-history');
            }
            img.style.maxWidth = '200px';
            img.style.borderRadius = '6px';
            img.style.cursor = 'zoom-in';
            img.style.margin = '6px 0';
            // Сохраняем полный URL в data-атрибут, если его нет
            if (!img.dataset.full && img.src) {
                img.dataset.full = img.src;
            }
        });

        // Обрабатываем видео и аудио, если они есть (на случай если пришли как есть)
        doc.querySelectorAll('video, audio').forEach(media => {
            media.style.maxWidth = '300px';
            media.style.margin = '6px 0';
            media.style.borderRadius = '6px';
        });

        // Превращаем текстовые узлы с Assistant/User в div.msg
        const lines = doc.body.innerHTML
            .replace(/<br\s*\/?>/gi, '\n')
            .split('\n');

        const container = document.createElement('div');

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            // Если строка уже содержит HTML теги (например <video> или <img>), просто вставляем как есть
            if (line.startsWith('<') && line.includes('>')) {
                const div = document.createElement('div');
                div.innerHTML = line; // Вставляем как есть
                container.appendChild(div);
                return;
            }

            // Иначе обрабатываем как обычный текст
            const div = document.createElement('div');
            div.classList.add('msg');

            if (line.startsWith('Assistant:')) {
                div.classList.add('assistant');
                div.textContent = line.replace('Assistant: ', "🤖: ");
            }
            else if (line.startsWith('User:')) {
                div.classList.add('user');
                div.textContent = "User: "; // Или просто line, если нужно
            }
            else {
                div.innerHTML = line;
            }

            container.appendChild(div);
        });

        return container.innerHTML;
    }






    for (let i = convdata.messages.length - 1; i >= 0; i--) {
        const message = convdata.messages[i];
        const date = extractDate(message.ts);

        switch (message.tpe) {
            case "Question":
                if (message.click === undefined) {
                    const testarray = message.txt.match(/<p>(.*?)<\/p>/gm);
                    const name = convdata.channelUser.fullName || "Widget";

                    // 1. Сначала проверяем, не является ли сообщение просто ссылкой на медиа (даже если она в <p>)
                    // Ищем ссылки vimbox-resource внутри всего текста сообщения
                    const mediaMatch = message.txt.match(/(https:\/\/vimbox-resource[^\s<>"']+\.(mp4|mov|mkv|webm|mp3|wav|ogg|oga|png|jpg|jpeg|gif|webp))/gi);

                    let content = "";
                    let isPureMedia = false;

                    // Если нашли ровно одну ссылку и это медиа-файл
                    if (mediaMatch && mediaMatch.length === 1) {
                        const url = mediaMatch[0];
                        const lower = url.toLowerCase();

                        if (lower.match(/\.(mp4|mov|mkv|webm)$/)) {
                            content = `<video src="${url}" controls style="max-width:300px;margin:6px 0;border-radius:6px;"></video>`;
                            isPureMedia = true;
                        } else if (lower.match(/\.(mp3|wav|ogg|oga)$/)) {
                            content = `<audio src="${url}" controls style="width:300px;margin:6px 0;"></audio>`;
                            isPureMedia = true;
                        } else if (lower.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
                            content = `<img src="${url}" class="img-chat-history chat-history-image" data-full="${url}" style="max-width:200px;cursor:zoom-in;border-radius:6px;margin:6px 0;">`;
                            isPureMedia = true;
                        }
                    }

                    // 2. Если это не чистое медиа, обрабатываем как текст/HTML
                    if (!isPureMedia) {
                        if (testarray) {
                            // Если есть <p>, чистим их и парсим как HTML
                            const cleaned = cleanHtmlAroundUrls(message.txt);
                            content = renderMessageText(cleaned);
                        } else {
                            // Если нет <p>, ищем картинки отдельно
                            const images = getImagesFromText(message.txt);
                            if (images.length === 1) {
                                content = renderMedia(images[0]);
                            } else {
                                const cleaned = cleanHtmlAroundUrls(message.txt);
                                content = renderMessageText(cleaned);
                            }
                        }
                    }

                    // 3. Дополнительная обработка ссылок внутри текста (на случай если renderMessageText пропустил)
                    // Но делаем это аккуратно, чтобы не сломать уже вставленные видео/аудио
                    content = content.replace(/(https:\/\/vimbox-resource[^\s<>"']+\.(png|jpg|jpeg|gif|webp))/gi, (url) => {
                        // Не заменяем, если это уже внутри тега img или video/audio
                        if (content.includes(`src="${url}"`) || content.includes(`src='${url}'`)) return url;

                        return `<img src="${url}" class="img-chat-history chat-history-image" data-full="${url}" style="max-width:200px;cursor:zoom-in;border-radius:6px;margin:6px 0;">`;
                    });

                    // 4. Хайлайт имени пользователя (безопасная замена)
                    // Используем функцию, которая не ломает HTML структуру
                    content = highlightUserFullSafe(content);

                    appendToInfoField(`
                        <br>
                        <div class="question-event">
                            <span class="question-event-name">${name}</span>
                            <span class="question-event-date">${date}</span>
                            <div class="question-event-text"><br>${content}</div>
                        </div>
                    `);

                    // 5. Вешаем обработчики клика (только на картинки)
                    setTimeout(() => {
                        document.querySelectorAll('.chat-history-image').forEach(img => {
                            if (!img.dataset.bound) {
                                img.dataset.bound = "1";
                                img.addEventListener('click', () => {
                                    openImageViewerChatHistory(img.dataset.full || img.src);
                                });
                            }
                        });
                    }, 50);

                } else {
                    // Обработка click-сообщений (кнопки)
                    appendToInfoField(`
                        <br>
                        <div class="question-event">
                            <span class="question-event-name">${convdata.channelUser.fullName}</span>
                            <span class="question-event-date">${date}</span>
                            <div class="question-event-text"><br>${message.click.clickLabel}</div>
                        </div>
                    `);
                    setTimeout(() => {
                        document.querySelectorAll('.chat-history-image').forEach(img => {
                            if (!img.dataset.bound) {
                                img.dataset.bound = "1";
                                img.addEventListener('click', () => {
                                    openImageViewerChatHistory(img.dataset.full);
                                });
                            }
                        });
                    }, 50);
                }
                break;


            case "Event":
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

                const msgpayload = message.payload || {};
                const isEmptyPayload = Object.keys(msgpayload).length === 0;

                const eventMapping = {
                    NewConversation: 'Начат новый диалог',
                    RunScenario: 'Сценарий запущен',
                    FirstTimeInQueue: 'Диалог отправлен в очередь',
                    RunIntegration: `Запущена интеграция ${msgpayload.name}`,
                    FinishIntegration: 'Интеграция успешно отработала',
                    CreatedByOperator: `${getOperatorNameById(msgpayload.oid, "Оператор")} открыл(а) новый диалог`,
                    AssignToOperator: handleAssignToOperatorEvent(message),

                    CloseConversation: (() => {
                        // 1. Автозакрытие по таймеру
                        if (msgpayload.status !== 'ClosedByBot' && msgpayload.sender === 'userAnswerTimer') {
                            return 'Диалог автоматически закрыт по отсутствию активности пользователя';
                        }

                        // 2. Закрыт оператором
                        if (!isEmptyPayload && msgpayload.status !== 'ClosedByBot' && msgpayload.src !== 'delivery' && msgpayload.sender !== 'userAnswerTimer') {
                            return `${getOperatorNameById(msgpayload.sender, "Оператор")} закрыл чат!`;
                        }

                        // 3. Закрыт рассылкой
                        if (!isEmptyPayload && msgpayload.src === 'delivery') {
                            return 'Диалог был закрыт рассылкой';
                        }

                        // 4. Пустой payload — возвращаем тип события
                        if (isEmptyPayload) {
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

function autoRenderMediaLinks(html) {
    const urlRegex = /(https:\/\/vimbox-resource[^\s<>"']+\.(png|jpg|jpeg|gif|webp))/gi;

    return html.replace(urlRegex, (url) => {
        return `
            <img src="${url}"
                 class="img-chat-history chat-history-image"
                 data-full="${url}"
                 style="max-width:200px;cursor:zoom-in;border-radius:6px;margin:6px 0;">
        `;
    });
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
                    "body": `{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"${objSel[i].value}\"],\"tsFrom\":\"${document.getElementById('dateFromChHis').value}T${difhrs}:${mins}:${secs}.000Z\",\"tsTo\":\"${document.getElementById('dateToChHis').value}T${hrs}:${mins}:${secs}.000Z\",\"usedStatuses\":[\"OnOperator\",\"AssignedToOperator\",\"Active\"],\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":1,\"limit\":20}`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                }).then(r => r.json()).then(r => operchatsdata = r)

                if (operchatsdata.total == 0)
                    alert(`У выбранного пользователя ${objSel[i].innerText} нет активных чатов`)

                function formatDate(ts) {
                    const d = new Date(ts.split('[GMT]')[0]);
                    const pad = n => String(n).padStart(2, '0');

                    let hours = d.getUTCHours() + 3;
                    if (hours >= 24) hours -= 24;

                    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(hours)}:${pad(d.getMinutes())}`;
                }

                function resolveUserName(user) {
                    const { channelTpe, payload, fullName } = user;

                    // Нет payload → используем канал + имя
                    if (!payload) {
                        return `${channelTpe} ${fullName}`;
                    }

                    const uType = payload.userType || '';
                    const uFull = payload.userFullName || '';

                    // Есть userFullName → это приоритет
                    if (uFull) {
                        return uType ? `${uType} ${uFull}` : uFull;
                    }

                    // Есть userType, но нет userFullName → используем fullName
                    if (uType) {
                        return `${uType} ${fullName}`;
                    }

                    // payload есть, но ничего полезного в нём нет → fallback
                    return `${channelTpe} ${fullName}`;
                }


                foundarr = "";

                for (const item of operchatsdata.items) {
                    const date = formatDate(item.ts);
                    const channel = item.channel.name
                    const user = item.channelUser;
                    const name = resolveUserName(user);
                    console.log(channel)

                    foundarr += `
                        <span class="chatlist" style="cursor:pointer;">
                            ${date} <span style="color:#00BFFF; font-weight:700">${name.split(' ')[0]}</span> ${name.split(' ').slice(1).join(' ')}
                        </span><br>
                    `;
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

        if (document.getElementById('placeusid').innerText != '')
            document.getElementById('placeusid').innerText = ''

        if (document.getElementById('placechatid').innerText != '')
            document.getElementById('placechatid').innerText = ''

        if (document.getElementById('somechatinfo').style.display == '')
            document.getElementById('somechatinfo').style.display = 'none';

        if (document.getElementById('bottommenuchhis').style.display == '')
            document.getElementById('bottommenuchhis').style.display = 'none';

        document.getElementById('infofield').innerText = 'Загрузка'

        if (userId && !chatHash) {
            flagsearch = 'searchbyuser';

            try {
                const response = await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                    method: "POST",
                    credentials: "include",
                    mode: "cors",
                    headers: {
                        "content-type": "application/json",
                        "x-csrf-token": aftoken
                    },
                    body: JSON.stringify({
                        serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
                        mode: "Json",
                        channelUserFullTextLike: userId,
                        tsFrom: `${dateFrom}T00:00:00.000Z`,
                        tsTo: `${dateTo}T23:59:59.059Z`,
                        orderBy: "ts",
                        orderDirection: "Desc",
                        page: 1,
                        limit: 20
                    })
                });

                const data = await response.json();

                if (data.total === 0) {
                    alert("В выбранном диапазоне чатов от пользователя не найдено. Попробуйте другой диапазон или убедитесь, что пользователь обращался.");
                    document.getElementById('infofield').innerHTML = "Не найдено  чатов от пользователя"
                    return;
                }

                processChatList(data);

            } catch (err) {
                console.error("Ошибка загрузки истории чатов:", err);
                alert("Произошла ошибка при загрузке истории чатов.");
            }

        } else if (!userId && chatHash) {

            flagsearch = 'searchbyhash';
            updateChatInfo(chatHash);

        } else {
            document.getElementById('infofield').innerHTML = "Уберите ID или хеш чата"
            alert("Введено и ID пользователя, и хеш чата, или оба поля пустые. Пожалуйста, выберите что-то одно.");
        }

    }

    async function processChatList(responseData) {
        data = responseData;
        foundarr = '';
        data.items.forEach(item => {
            let timestamp = new Date(item.ts.split('[GMT]')[0]);
            let formattedDate = timestamp.toLocaleDateString('ru-RU');
            let formattedTime = timestamp.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            let rating = item.stats.rate?.rate || '⭕';
            let deliveryBot = item.status == "ClosedByBot" ? "🤖" : ""
            let statusIcon = item.stats.usedStatuses == "AssignedToOperator" ? "🛠" : "";
            let userName = item.channelUser.payload?.userFullName || item.channelUser.fullName;
            let userType = item.channelUser.payload?.userType || "";

            // Если бот — показываем 🤖 вместо рейтинга
            const ratingOrBot = deliveryBot || statusIcon || rating;
            foundarr += `
            <span class="chatlist" style="cursor:pointer;" title="${item.conversationId}">
            ${formattedDate} ${formattedTime}
            <span style="color:#00BFFF; font-weight:700;">${userType}</span> ${userName}
            <span style="color: MediumSeaGreen; font-weight:700;"> Оценка: </span> ${ratingOrBot} </span><br> `;

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

            const elements = Array.from(document.getElementsByClassName('chatlist'));

            elements.forEach((element, i) => {
                let chatId = null;

                switch (flagsearch) {
                    case 'searchbyuser':
                        chatId = data?.items?.[i]?.conversationId;
                        break;

                    case 'searchbyoperator':
                        chatId = operchatsdata?.items?.[i]?.conversationId;
                        break;

                    case 'searchbyhash':
                        chatId =
                            operchatsdata?.items?.[i]?.conversationId ??
                            data?.items?.[i]?.conversationId ??
                            null;
                        break;
                }

                if (!chatId) return;

                element.title = chatId;

                element.onclick = () => updateChatInfo(chatId);

                element.oncontextmenu = (event) => { //при нажатии ПКМ на строке с чатом, будет скопирован в буфер обмена хеш этого чата
                    event.preventDefault();
                    copyToClipboard(chatId);
                };
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
        try {
            const response = await fetch(
                `https://skyeng.autofaq.ai/api/conversations/${chatId}`,
                { headers: { "x-csrf-token": aftoken } }
            );

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
            }

            convdata = await response.json();

            isChatOnOperator = convdata.status === 'AssignedToOperator';

            fillchatbox();
            checkAndChangeStyle();

        } catch (err) {
            console.error("Ошибка обновления информации о чате:", err);
        }
    }


    document.getElementById('takechat').onclick = async function () {
        const infoField = document.getElementById('infofield');
        const openHistoryTime = infoField.getAttribute('openhistorytime');

        // Проверка корректности времени
        if (!openHistoryTime) {
            alert("Не удалось определить время открытия истории чата");
            return;
        }

        const openHistoryDate = new Date(openHistoryTime);
        const now = new Date();

        if (isNaN(openHistoryDate.getTime())) {
            alert("Некорректное время истории чата");
            return;
        }

        if ((now - openHistoryDate) / 1000 > 60) {
            alert("История чата открыта слишком долго. Пожалуйста, обновите чат.");
            return;
        }

        const chatId = document.getElementById('placechatid').innerText.trim();
        if (!chatId) {
            alert("Чат не выбран");
            return;
        }

        const operatorIdLocal = operatorId;

        if (!operatorIdLocal) {
            alert("Не удалось определить ID оператора");
            return;
        }

        if (!confirm("Вы действительно желаете забрать чат?")) {
            return;
        }

        // Универсальная функция assign
        const assignChat = async (assignToOperatorId) => {
            try {
                await fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "content-type": "application/json",
                        "x-csrf-token": aftoken
                    },
                    body: JSON.stringify({
                        command: "DO_ASSIGN_CONVERSATION",
                        conversationId: chatId,
                        assignToOperatorId: assignToOperatorId // null или оператор
                    })
                });
            } catch (err) {
                console.error("Ошибка assign:", err);
            }
        };

        // Сначала снимаем assign
        await assignChat('null');

        // Через 2 секунды назначаем на себя
        setTimeout(() => assignChat(operatorIdLocal), 2000);
    };

    document.getElementById('reassign').onclick = () => {
        const operators = document.getElementById('operatorstp');
        const chatId = document.getElementById('placechatid').innerText.trim();

        // Проверки
        if (!chatId) {
            alert("Не открыт чат, который требуется переводить");
            return;
        }

        const selected = operators.querySelector('option:checked');

        if (!selected || selected.value === "") {
            alert("Не выбран оператор для передачи чата");
            return;
        }

        // Формируем тело запроса
        const body = JSON.stringify({
            command: "DO_ASSIGN_CONVERSATION",
            conversationId: chatId,
            assignToOperatorId: selected.value
        });

        // Отправляем запрос
        fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-csrf-token": aftoken
            },
            body,
            credentials: "include",
            mode: "cors"
        })
            .then(() => {
                console.log(`Чат ${chatId} передан оператору ${selected.value}`);
            })
            .catch(err => {
                console.error("Ошибка передачи чата:", err);
                alert("Ошибка при передаче чата");
            });
    };

    document.getElementById('sendmsgtochatornotes').onclick = async () => {
        const mode = document.querySelector('input[name="chatornotes"]:checked')?.value;
        const chatId = document.getElementById('placechatid').innerText.trim();
        const msgField = document.getElementById('msgftochatornotes');

        if (!mode || !chatId) {
            alert("Не выбран режим или не открыт чат");
            return;
        }

        // Получаем sessionId
        const conv = await fetch(`https://skyeng.autofaq.ai/api/conversations/${chatId}`, {
            headers: { "x-csrf-token": aftoken }
        }).then(r => r.json());

        const sessionId = conv.sessionId;
        const text = `<p>${msgField.value}</p>`;
        msgField.value = "";

        // Формируем payload
        const payload = {
            sessionId,
            conversationId: chatId,
            text
        };

        if (mode === "Notes") {
            payload.isComment = true;
        }

        // Отправляем сообщение
        await sendMultipartJSON("https://skyeng.autofaq.ai/api/reason8/answers", payload);

        // Обновляем чат
        setTimeout(updateChatUI, 1000);
    };


    // Универсальная функция отправки multipart/form-data с JSON payload
    async function sendMultipartJSON(url, json) {
        const boundary = "----WebKitFormBoundary" + Math.random().toString(16).slice(2);

        const body =
            `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="payload"\r\n\r\n` +
            `${JSON.stringify(json)}\r\n` +
            `--${boundary}--\r\n`;

        return fetch(url, {
            method: "POST",
            credentials: "include",
            mode: "cors",
            headers: {
                "content-type": `multipart/form-data; boundary=${boundary}`,
                "x-csrf-token": aftoken
            },
            body
        });
    }



    // Обновление UI чата
    async function updateChatUI() {
        const chatId = document.getElementById('placechatid').innerText.trim();
        if (!chatId) return;

        document.getElementById('infofield').innerHTML = "";

        try {
            const response = await fetch(`https://skyeng.autofaq.ai/api/conversations/${chatId}`, {
                headers: { "x-csrf-token": aftoken }
            });

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
            }

            const convdata = await response.json();
            isChatOnOperator = convdata.status === 'AssignedToOperator';

            fillchatbox();
            checkAndChangeStyle();

        } catch (err) {
            console.error("Ошибка обновления чата:", err);
        }
    }
}

