let dataChts;
var win_Queue =  // описание элементов окна Чаты в очереди
    `<div style="display: flex; width: 600px;">
        <span style="width: 600px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 600px;">
                                <button class="mainButton buttonHide" id="hideMeQueue">hide</button>
								<span style="color:orange; font-weight:800">Всего в ожидании:</span>
								<span id="waitingCount" style="color:coral; font-weight:800"></span>
                        </div>
						<div>
							<select id="AFStatusType" style="margin-left:220px; margin-top:10px;">
								<option value="AssignedToOperator">В работе у оператора</option>
								<option value="OnOperator">В очереди</option>
								<option value="ClosedByOperator">Закрытые</option>
								<option value="ClosedByOperatorWithBot">Закрытые с ботом</option>
							</select>
						</div>
						<div>
							<textarea id="inputTextForUser" style="margin-left: 16.5%;; width: 400px; height: 56px;" placeholder="Введите текст сообщения для пользователя"></textarea>
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
    const now = new Date();
    // Установка tsFrom на начало предыдущего дня в 21:00 UTC
    const tsFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1, 21, 0, 0, 0)).toISOString();
    // Установка tsTo на конец текущего дня в 20:59:59.059 UTC
    const tsTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 20, 59, 59, 59)).toISOString();

    // Пример использования функции
    const initialBodyContent = {
        serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
        mode: "Json",
        groupList: ["c7bbb211-a217-4ed3-8112-98728dc382d8"],
        tsFrom: tsFrom,
        tsTo: tsTo,
        usedStatuses: [statusToFetch],
        orderBy: "ts",
        orderDirection: "Desc",
        limit: 100 // Можно убрать, так как он уже установлен в функции fetchAllPages
    };

    await fetchAllPages("https://skyeng.autofaq.ai/api/conversations/history", initialBodyContent)
        .then(allData => {
            console.log(allData.length); // Выводит общее количество загруженных записей
            // Теперь можно обработать allData как угодно
            dataChts = allData
            queueCnt.textContent = `${dataChts.length}`;
        })
        .catch(error => {
            console.error('Произошла ошибка при получении данных: ', error);
        });

    // Преобразование и отображение данных
    dataChts.forEach((el, index) => {
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

        let writeToChat = document.createElement('button');
        writeToChat.className = 'mainButton';
        writeToChat.textContent = ' 📝';
        writeToChat.name = "allWriteToChatBtns"

        let getThisChat = document.createElement('button');
        getThisChat.className = 'mainButton';
        getThisChat.textContent = ' 🫳';

        // Добавление созданных элементов в queueItemDiv
        queueItemDiv.appendChild(timeSpan);
        queueItemDiv.appendChild(usrType);
        queueItemDiv.appendChild(usrName);
        queueItemDiv.appendChild(timerSpan);
        queueItemDiv.appendChild(checkFirstAnswer);
        queueItemDiv.appendChild(countryInfo);
        queueItemDiv.appendChild(writeToChat);
        queueItemDiv.appendChild(getThisChat);

        // Добавление queueItemDiv в bimba
        bimba.appendChild(queueItemDiv);

        // Инициализация таймера
        startTimerForDialog(tsConverter, timerSpan);
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

    let allBtnsWriteToChat = document.getElementsByName('allWriteToChatBtns')
    let allFlags = document.getElementsByName('flagOfFirstAnswer')
    for (let i = 0; i < allBtnsWriteToChat.length; i++) {
        allBtnsWriteToChat[i].addEventListener('click', function (event) {
            event.stopPropagation()
            if (allFlags[i].textContent == "❌") {
                let getTextAreaValue = document.getElementById('inputTextForUser').value
                if (getTextAreaValue == "") {
                    alert('Введите текст сообщения для пользователя в поле ниже!')
                } else {
                    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        "headers": {
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
                        },
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "body": `------WebKitFormBoundaryH2CK1t5M3Dc3ziNW\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"${dataChts[i].stats.conversationSessionId}\",\"conversationId\":\"${dataChts[i].conversationId}\",\"text\":\"${getTextAreaValue}\",\"isComment\":true}\r\n------WebKitFormBoundaryH2CK1t5M3Dc3ziNW--\r\n`,
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
                    allFlags[i].textContent = "✅"
                }
            } else {
                alert("Чат исходящий или первый ответ уже есть, сбивать таймер AFRT для этого чата нет необходимости!")
            }
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
                    alert('Введите текст сообщения для пользователя в поле ниже!')
                } else {
                    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        "headers": {
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
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
                console.log(dataChts[i].conversationId,"Чат исходящий или первый ответ уже есть, сбивать таймер AFRT для этого чата нет необходимости!")
            }
        }

    } else {
        console.log("No parsed data please parse chats first")
    }
}

document.getElementById('checkQueue').addEventListener('click', getAllChatsByStatus)
document.getElementById('getChatFromQueue').addEventListener('click', writeThemAll)

getOptions.addEventListener('change', getAllChatsByStatus)