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

const UI = {
    get queue() { return document.getElementById('AF_Queue'); },
    get data() { return document.getElementById('queueData'); },
    get waiting() { return document.getElementById('waitingCount'); },
    get cardInfo() { return document.getElementById('cardInfoData'); },
    get cardDigits() { return document.getElementById('carddigits'); },
    get menu() { return document.getElementById('idmymenu'); },
    get mainBtn() { return document.getElementById('MainMenuBtn'); },
    get restartTimer() { return document.getElementById('timeRestartCount'); }
};


document.addEventListener('click', (e) => {
    if (e.target.id !== 'hideMeQueue') return;

    UI.data.innerHTML = "";
    UI.waiting.innerHTML = "";
    if (UI.cardInfo) UI.cardInfo.innerText = "";
    if (UI.cardDigits) UI.cardDigits.value = "";

    if (UI.queue) UI.queue.style.display = 'none';

    clearInterval(timerCountdownToRefresh);
    clearInterval(timerToRefreshInt);

    console.log("All intervals for Queue were removed successfully");
});



function getQueuePress() {
    if (!UI.queue) return; // защита

    const isVisible = UI.queue.style.display === '';

    if (isVisible) {
        UI.queue.style.display = 'none';
        if (UI.menu) UI.menu.style.display = 'none';
        if (UI.mainBtn) UI.mainBtn.classList.remove('activeScriptBtn');
        return;
    }

    UI.queue.style.display = '';
    if (UI.menu) UI.menu.style.display = 'none';
    if (UI.mainBtn) UI.mainBtn.classList.remove('activeScriptBtn');
    UI.waiting.innerHTML = "";

    getAllChatsByStatus();

    let timerTime = 9;

    timerCountdownToRefresh = setInterval(() => {
        UI.restartTimer.textContent = timerTime--;
        if (timerTime < 0) timerTime = 9;
    }, 1000);

    timerToRefreshInt = setInterval(() => {
        getAllChatsByStatus();
    }, 10000);
}

function updateTimer(startTime, element) {
    const diff = Date.now() - new Date(startTime).getTime();

    const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    element.textContent = `${hours}:${minutes}:${seconds}`;

    // Подсветка, если прошло меньше минуты
    if (hours === "00" && minutes === "00" && Number(seconds) <= 60) {
        element.style.color = "#f9ff00";
        element.style.fontWeight = "700";
    } else {
        element.style.color = "";
        element.style.fontWeight = "";
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

    // Текущее UTC-время
    const now = new Date();

    // Смещение Москвы (UTC+3)
    const MSK_OFFSET = 3 * 60 * 60 * 1000;

    // Текущее время по Москве
    const msk = new Date(now.getTime() + MSK_OFFSET);

    // Дата по Москве (локальная)
    const y = msk.getUTCFullYear();
    const m = msk.getUTCMonth();
    const d = msk.getUTCDate();

    // Диапазон: с 21:00 позавчера до 20:59:59.059 вчера (по UTC)
    const tsFrom = new Date(Date.UTC(y, m, d - 2, 21, 0, 0, 0)).toISOString();
    const tsTo = new Date(Date.UTC(y, m, d, 20, 59, 59, 59)).toISOString();

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

    await fetchAllPages("https://skyeng.autofaq.ai/api/conversations/history", initialBodyContent, { headers: { "x-csrf-token": aftoken } })
        .then(allData => {
            console.log(allData.length); // Выводит общее количество загруженных записей
            // Теперь можно обработать allData как угодно
            dataChts = allData
            queueCnt.textContent = `${dataChts.length}`;
        })
        .catch(error => {
            console.log('Произошла ошибка при получении данных: ', error);
        });

    // Преобразование и отображение данных
    dataChts.forEach((el, index) => {
        const ts = new Date(el.ts.replace(/\[GMT\]$/, ''));

        const queueItemDiv = document.createElement('div');
        queueItemDiv.className = 'queue-item';
        queueItemDiv.setAttribute('name', 'prosmChat');

        // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
        const span = (text, style = "", attrs = {}) => {
            const s = document.createElement('span');
            if (style) s.style = style;
            s.textContent = text;
            Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
            return s;
        };

        const getUserTypeEmoji = (type) => {
            switch (type) {
                case "teacher": return "👽";
                case "student":
                case "parent": return "👨‍🎓";
                default: return "❓";
            }
        };

        const getFirstAnswerFlag = (stats) => {
            if (stats.participatingOperators.includes("autoFAQ"))
                return stats.firstOperatorAnswerTime ? "✅" : "❌";

            if (stats.participatingOperators.length > 0)
                return "⤴️";

            return "🚫";
        };

        // --- СОЗДАНИЕ ЭЛЕМЕНТОВ ---
        const timeSpan = span(
            ts.toLocaleTimeString('ru-RU', {
                timeZone: 'Europe/Moscow',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }),
            'color:#0be90b; font-weight:700; text-shadow:1px 2px 5px rgba(0,0,0,0.55);'
        );

        const usrType = span(getUserTypeEmoji(el.channelUser.payload?.userType));
        const usrName = span(el.channelUser.fullName || "Noname", "color:bisque");
        const timerSpan = span("", "", { id: `timer-${index}`, class: "timer" });
        const firstAnswer = span(getFirstAnswerFlag(el.stats), "", { name: "flagOfFirstAnswer" });
        const country = span(el.channelUser.payload?.country || "➖", "color:bisque");

        const getThisChat = document.createElement('button');
        getThisChat.className = 'mainButton';
        getThisChat.name = 'assignToMe';
        getThisChat.title = "Забрать этот чат";
        getThisChat.textContent = '🫳';

        // --- СБОРКА ---
        queueItemDiv.append(
            timeSpan,
            usrType,
            usrName,
            timerSpan,
            firstAnswer,
            country,
            getThisChat
        );

        bimba.appendChild(queueItemDiv);

        // --- ТАЙМЕР ---
        startTimerForDialog(el.ts.replace(/\[GMT\]$/, ''), timerSpan);
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

document.getElementById('checkQueue').addEventListener('click', getAllChatsByStatus)

getOptions.addEventListener('change', getAllChatsByStatus)

