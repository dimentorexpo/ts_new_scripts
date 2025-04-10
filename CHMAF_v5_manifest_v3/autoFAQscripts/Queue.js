let dataChts;
let timerCountdownToRefresh;
let timerToRefreshInt;
var win_Queue =  // описание элементов окна Чаты в очереди
    `<div style="display: flex; width: 600px;">
        <span style="width: 600px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 600px;">
                                <button class="mainButton buttonHide" id="hideMeQueue">hide</button>
								<span style="color:orange; font-weight:800">Всего чатов:</span>
								<span id="waitingCount" style="color:coral; font-weight:800"></span>
                                <span style="color:#00e9a0; font-weight:800">Список обновится через:</span>
                                <span id="timeRestartCount" style="color:coral; font-weight:800"></span>
                        </div>
						<div>
							<select class="${exttheme}" id="AFStatusType" style="margin-left:220px; margin-top:10px;">
								<option value="AssignedToOperator">В работе у оператора</option>
								<option value="OnOperator">В очереди</option>
								<option value="ClosedByOperator">Закрытые</option>
								<option value="ClosedByOperatorWithBot">Закрытые с ботом</option>
							</select>
						</div>
						<div>
							<textarea class="${exttheme}" id="inputTextForUser" style="margin-left: 16.5%;; width: 400px; height: 56px;" placeholder="Введите текст сообщения для пользователя"></textarea>
						</div>

						<div style="display:flex; justify-content:space-evenly; padding-bottom:5px">
							<button class="mainButton" title="Найти чаты с очередью" id="checkQueue" style="position:relative;">🔎 Check Queue</button>
							<button class="mainButton" title="взять чат с минимальным временем обращения, чтобы успеть ответить и выполнить AFRT" id="getChatFromQueue">📝 Write them ALL</button>
						</div>
				</span>
						<div id="queueData" style="max-height: 600px; overflow-y: auto;">
						</div>
        </span>
</div>`;

const wintQueue = createWindow('AF_Queue', 'winTopQueue', 'winLeftQueue', win_Queue);
hideWindowOnDoubleClick('AF_Queue');

document.getElementById('hideMeQueue').addEventListener('click', function () { // скрытие окна Список группы
    let bimba = document.getElementById('queueData');
    let queueCnt = document.getElementById('waitingCount')
    bimba.innerHTML = "";
    queueCnt.innerHTML = ""
    if (document.getElementById('AF_Queue').style.display == '') {
        document.getElementById('AF_Queue').style.display = 'none';
        document.getElementById('cardInfoData').innerText = "";
        document.getElementById('carddigits').value = "";
    }
    clearInterval(timerCountdownToRefresh)
    clearInterval(timerToRefreshInt)
    console.log("All intervals for Queue were removed successfully")
})

function getQueuePress() {
    if (document.getElementById('AF_Queue').style.display == '') {
        document.getElementById('AF_Queue').style.display = 'none'
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    } else {
        document.getElementById('AF_Queue').style.display = ''
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
        document.getElementById('idmymenu').style.display = 'none'
        waitingCount.innerHTML = ""
        getAllChatsByStatus()
        let timerOutput = document.getElementById('timeRestartCount');
        let timerTime = 9;

        // Обновляем таймер каждую секунду
        timerCountdownToRefresh = setInterval(() => {
            timerOutput.textContent = timerTime--;
            if (timerTime === -1) timerTime = 9;
        }, 1000);

        // Выполняем проверку каждые 10 секунд
        timerToRefreshInt = setInterval(() => {
            getAllChatsByStatus();
        }, 10000);
    }
}

function updateTimer(startTime, element) {
    let start = new Date(startTime);
    let now = new Date();
    let diff = now - start;

    let hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    let minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);
    let seconds = Math.floor(diff / (1000));

    // Добавляем ведущие нули
    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    element.textContent = `${hours}:${minutes}:${seconds}`;

    if (hours == "00" && minutes == "00" && seconds <= 60) {
        element.style = "color:#f9ff00; font-weight:700"
    } else {
        element.style.color = ""
    }
}

// Функция для инициализации таймера
function startTimerForDialog(startTime, element) {
    updateTimer(startTime, element); // Обновляем таймер сразу
    setInterval(function () {
        updateTimer(startTime, element); // Затем обновляем каждую секунду
    }, 1000);
}

async function fetchAllPages(url, initialBodyContent) {
    let allData = []; // Массив для хранения всех данных
    let page = 1; // Начинаем с первой страницы
    let totalFetched = 0; // Количество загруженных записей
    let totalAvailable; // Общее количество доступных записей

    do {
        // Устанавливаем страницу в теле запроса
        const bodyContent = { ...initialBodyContent, page, limit: 100 };

        // Отправляем запрос
        const response = await fetch(url, {
            headers: {
                "content-type": "application/json",
                "x-csrf-token": aftoken
            },
            referrer: "https://skyeng.autofaq.ai/logs",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: JSON.stringify(bodyContent),
            method: "POST",
            mode: "cors",
            credentials: "include"
        });

        // Получаем данные и добавляем их к общему массиву
        const data = await response.json();
        allData = allData.concat(data.items);
        totalFetched += data.items.length;

        // После первого запроса узнаем общее количество доступных записей
        if (page === 1) {
            totalAvailable = data.total;
        }

        // Увеличиваем номер страницы для следующего запроса
        page++;
    } while (totalFetched < totalAvailable); // Повторяем, пока не получим все доступные данные

    return allData; // Возвращаем накопленные данные
}

function takeOnMe(chatID) {

    let chat_id = chatID;
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

};// конец обработчика нажатия кнопки "Забрать"

let getOptions = document.getElementById('AFStatusType')
async function getAllChatsByStatus() {
    let bimba = document.getElementById('queueData');
    let queueCnt = document.getElementById('waitingCount')
    bimba.innerHTML = "";
    queueCnt.innerHTML = ""
    let statusToFetch;
    for (let i = 0; i < getOptions.children.length; i++) {
        if (getOptions.children[i].selected == true) {
            statusToFetch = getOptions.children[i].value
        }
    }

    // Получаем текущую дату и время в UTC
    // Текущая дата в UTC
    const now = new Date(); // Текущее время в UTC
    const mskOffset = 3 * 60 * 60 * 1000; // Смещение Москвы в миллисекундах (UTC+3)

    // Текущее время по Москве
    const mskTime = new Date(now.getTime() + mskOffset);

    // Установка tsFrom и tsTo с учетом времени в Москве
    let tsFrom, tsTo;
    if (mskTime.getUTCHours() < 21) {
        // Если в Москве еще не наступило 21:00 UTC, отсчитываем от вчерашнего дня
        tsFrom = new Date(Date.UTC(mskTime.getUTCFullYear(), mskTime.getUTCMonth(), mskTime.getUTCDate() - 1, 21, 0, 0, 0)).toISOString();
        tsTo = new Date(Date.UTC(mskTime.getUTCFullYear(), mskTime.getUTCMonth(), mskTime.getUTCDate(), 20, 59, 59, 59)).toISOString();
    } else {
        // Если в Москве уже прошло 21:00 UTC, отсчитываем от текущего дня
        tsFrom = new Date(Date.UTC(mskTime.getUTCFullYear(), mskTime.getUTCMonth(), mskTime.getUTCDate() - 1, 21, 0, 0, 0)).toISOString();
        tsTo = new Date(Date.UTC(mskTime.getUTCFullYear(), mskTime.getUTCMonth(), mskTime.getUTCDate(), 20, 59, 59, 59)).toISOString();
    }

    console.log(tsFrom);
    console.log(tsTo);

    let setgroupList = '';
    if (opsection == "ТП" || opsection == "ТП ОС") {
        setgroupList = "c7bbb211-a217-4ed3-8112-98728dc382d8"
    } else {
        setgroupList = "b6f7f34d-2f08-fc19-3661-29ac00842898"
    }

    // Пример использования функции
    const initialBodyContent = {
        serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
        mode: "Json",
        groupList: [setgroupList], // ТП
        // groupList: ["b6f7f34d-2f08-fc19-3661-29ac00842898"], // КЦ
        tsFrom: tsFrom,
        tsTo: tsTo,
        usedStatuses: [statusToFetch],
        orderBy: "ts",
        orderDirection: "Desc",
        limit: 100 // Можно убрать, так как он уже установлен в функции fetchAllPages
    };

    doOperationsWithHistory(initialBodyContent)
        .then(allData => {
            console.log(allData.length); // Выводит общее количество загруженных записей
            // Теперь можно обработать allData как угодно
            dataChts = allData
            queueCnt.textContent = `${dataChts.total}`;

            // Преобразование и отображение данных
            dataChts.items.forEach((el, index) => {
                let tsConverter = el.ts.replace(/\[GMT\]$/, '');
                let dateToMSK = new Date(tsConverter);

                // Создание элементов DOM для каждого элемента очереди
                let queueItemDiv = document.createElement('div');
                queueItemDiv.className = 'queue-item';
                queueItemDiv.setAttribute('name', 'prosmChat')

                let timeSpan = document.createElement('span');
                timeSpan.style = 'color:#0be90b; font-weight:700; text-shadow: 1px 2px 5px rgba(0, 0, 0, 0.55);';
                timeSpan.textContent = dateToMSK.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

                let usrName = document.createElement('span');
                usrName.style.color = "bisque";
                usrName.textContent = el.channelUser.fullName ? el.channelUser.fullName : "Noname"
                // usrName.setAttribute('name', 'prosmChat')

                let usrType = document.createElement('span')
                if (el.channelUser.payload && el.channelUser.payload.userType) {
                    if (el.channelUser.payload.userType == "teacher") {
                        usrType.textContent = "👽"; // Эмодзи для преподавателя
                    } else if (el.channelUser.payload.userType == "student" || el.channelUser.payload.userType == "parent") {
                        usrType.textContent = "👨‍🎓"; // Эмодзи для студента или родителя
                    } else {
                        usrType.textContent = "❓"; // Эмодзи для неизвестного типа пользователя
                    }
                } else {
                    usrType.textContent = "❓"; // Эмодзи для отсутствующего типа пользователя
                }

                let timerSpan = document.createElement('span');
                timerSpan.id = 'timer-' + index;
                timerSpan.className = 'timer';

                let checkFirstAnswer = document.createElement('span');
                checkFirstAnswer.setAttribute('name', 'flagOfFirstAnswer')
                if (el.stats.participatingOperators.includes("autoFAQ")) {
                    // Если autoFAQ есть в списке, устанавливаем соответствующий текст
                    checkFirstAnswer.textContent = el.stats.firstOperatorAnswerTime ? "✅" : "❌";
                } else if (el.stats.participatingOperators.length > 0) {
                    // Если есть другие операторы, но нет autoFAQ
                    checkFirstAnswer.textContent = "⤴️";
                } else {
                    // Если операторов нет вообще
                    checkFirstAnswer.textContent = "🚫";
                }

                let countryInfo = document.createElement('span')
                countryInfo.style = "color:bisque"
                if (el.channelUser.payload && el.channelUser.payload.country) {
                    countryInfo.textContent = el.channelUser.payload.country
                } else {
                    countryInfo.textContent = "➖"
                }


                let getThisChat = document.createElement('button');
                getThisChat.className = 'mainButton';
                getThisChat.name = 'assignToMe';
                getThisChat.title = "Забрать этот чат";
                getThisChat.textContent = '🫳';

                // Добавление созданных элементов в queueItemDiv
                queueItemDiv.appendChild(timeSpan);
                queueItemDiv.appendChild(usrType);
                queueItemDiv.appendChild(usrName);
                queueItemDiv.appendChild(timerSpan);
                queueItemDiv.appendChild(checkFirstAnswer);
                queueItemDiv.appendChild(countryInfo);
                queueItemDiv.appendChild(getThisChat);

                // Добавление queueItemDiv в bimba
                bimba.appendChild(queueItemDiv);

                // Инициализация таймера
                startTimerForDialog(tsConverter, timerSpan);
            });
        })
        .catch(error => {
            console.log('Произошла ошибка при получении данных: ', error);
        });



    // Обработка событий для кнопок
    let allConvs = document.getElementsByName('prosmChat');
    for (let i = 0; i < allConvs.length; i++) {
        allConvs[i].addEventListener('click', function () {
            if (document.getElementById('AF_ChatHis').style.display == 'none') {
                document.getElementById('opennewcat').click();
                document.getElementById('hashchathis').value = dataChts[i].conversationId;
                btn_search_history.click();
            } else {
                document.getElementById('hashchathis').value = dataChts[i].conversationId;
                btn_search_history.click();
            }
        });
    }

    let allAssignBtns = document.getElementsByName('assignToMe')
    for (let z = 0; z < allAssignBtns.length; z++) {
        allAssignBtns[z].addEventListener('click', function (event) {
            event.stopPropagation();
            takeOnMe(dataChts[z].conversationId)
            console.log(dataChts[z].conversationId)
        })
    }

};

async function writeThemAll() {
    if (dataChts.length > 0) {
        console.log(dataChts)
        let allFlags = document.getElementsByName('flagOfFirstAnswer')

        for (let i = 0; i < allFlags.length; i++) {
            if (allFlags[i].textContent == "❌") {
                let getTextAreaValue = document.getElementById('inputTextForUser').value
                if (getTextAreaValue == "") {
                    createAndShowButton('Введите текст сообщения для пользователя в поле ниже!', 'error')
                } else {
                    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        "headers": {
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "x-csrf-token": aftoken
                        },
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "body": `------WebKitFormBoundaryH2CK1t5M3Dc3ziNW\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"${dataChts[i].stats.conversationSessionId}\",\"conversationId\":\"${dataChts[i].conversationId}\",\"text\":\"${getTextAreaValue}\",\"isComment\":false}\r\n------WebKitFormBoundaryH2CK1t5M3Dc3ziNW--\r\n`,
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
                    allFlags[i].textContent = "✅"
                }
            } else {
                console.log(dataChts[i].conversationId, "Чат исходящий или первый ответ уже есть, сбивать таймер AFRT для этого чата нет необходимости!")
            }
        }

    } else {
        console.log("No parsed data please parse chats first")
    }
}

document.getElementById('checkQueue').addEventListener('click', getAllChatsByStatus)
document.getElementById('getChatFromQueue').addEventListener('click', writeThemAll)

getOptions.addEventListener('change', getAllChatsByStatus)

