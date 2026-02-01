let dataChts;
let timerCountdownToRefresh = null;
let timerToRefreshInt = null;

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
                            <input class="${exttheme}" id="SecondsToRefresh" style="margin-left: 27%; width: 60px; text-align:center;" inputmode="numeric"pattern="\d*" title="Введите значение в секундах через которое должен автоматически обновляться список" placeholder="10">
							<select class="${exttheme}" id="AFStatusType" style="margin-top:10px; height: 27px; margin-bottom: 8px;">
								<option value="AssignedToOperator">🛠️В работе у оператора</option>
								<option value="OnOperator">⌛В очереди</option>
								<option value="ClosedByOperator">✅Закрытые</option>
								<option value="ClosedByOperatorWithBot">🤖Закрытые с ботом</option>
                                <option value="ClosedTemporary">⏸️На паузе</option>
							</select>
						</div>

						<div style="display:flex; justify-content:space-evenly; padding-bottom:5px">
							<button class="mainButton" title="Найти чаты с очередью" id="checkQueue" style="position:relative;">🔎 Check Queue</button>
						</div>
				</span>
						<div id="queueData" style="max-height: 600px; overflow-y: auto;">
						</div>
        </span>
</div>`;

const wintQueue = createWindow('AF_Queue', 'winTopQueue', 'winLeftQueue', win_Queue);
hideWindowOnDoubleClick('AF_Queue');

// =========================
//   Работа с localStorage
// =========================

function getRefreshSeconds() {
    const saved = localStorage.getItem("RefreshTimerSeconds");
    return saved ? Number(saved) : 10; // дефолт = 10 секунд
}

function setRefreshSeconds(sec) {
    localStorage.setItem("RefreshTimerSeconds", String(sec));
}

// =========================
//   UI элементы
// =========================

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

// =========================
//   Закрытие окна
// =========================

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

// =========================
//   Таймеры обновления
// =========================

function startQueueTimers() {
    const refreshSeconds = getRefreshSeconds();
    let timerTime = refreshSeconds;

    clearInterval(timerCountdownToRefresh);
    clearInterval(timerToRefreshInt);

    // Показать сразу
    UI.restartTimer.textContent = timerTime;

    timerCountdownToRefresh = setInterval(() => {
        timerTime--;

        // Если дошли до 0 — сразу сбрасываем, НЕ показывая 0
        if (timerTime <= 0) {
            timerTime = refreshSeconds;
        }

        UI.restartTimer.textContent = timerTime;
    }, 1000);

    timerToRefreshInt = setInterval(() => {
        getAllChatsByStatus();
    }, refreshSeconds * 1000);
}



// =========================
//   Открытие окна очереди
// =========================

function getQueuePress() {
    if (!UI.queue) return;

    const isVisible = UI.queue.style.display === '';

    if (isVisible) {
        UI.queue.style.display = 'none';
        if (UI.menu) UI.menu.style.display = 'none';
        if (UI.mainBtn) UI.mainBtn.classList.remove('activeScriptBtn');

        clearInterval(timerCountdownToRefresh);
        clearInterval(timerToRefreshInt);
        return;
    }

    UI.queue.style.display = '';
    if (UI.menu) UI.menu.style.display = 'none';
    if (UI.mainBtn) UI.mainBtn.classList.remove('activeScriptBtn');
    UI.waiting.innerHTML = "";

    getAllChatsByStatus();
    startQueueTimers();
}

// =========================
//   Таймеры диалога
// =========================

function updateTimer(startTime, element) {
    const diff = Date.now() - new Date(startTime).getTime();

    const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    element.textContent = `${hours}:${minutes}:${seconds}`;

    if (hours === "00" && minutes === "00" && Number(seconds) <= 60) {
        element.style.color = "#f9ff00";
        element.style.fontWeight = "700";
    } else {
        element.style.color = "";
        element.style.fontWeight = "";
    }
}

function startTimerForDialog(startTime, element) {
    updateTimer(startTime, element);
    setInterval(() => updateTimer(startTime, element), 1000);
}

// =========================
//   Загрузка всех страниц
// =========================

async function fetchAllPages(url, initialBodyContent) {
    let allData = [];
    let page = 1;
    let totalFetched = 0;
    let totalAvailable;

    do {
        const bodyContent = { ...initialBodyContent, page, limit: 100 };

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

        const data = await response.json();
        allData = allData.concat(data.items);
        totalFetched += data.items.length;

        if (page === 1) totalAvailable = data.total;

        page++;
    } while (totalFetched < totalAvailable);

    return allData;
}

// =========================
//   Забрать чат
// =========================

function takeOnMe(chatID) {
    const assignChat = (assignToOperatorId) => {
        fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
            headers: { "content-type": "application/json", "x-csrf-token": aftoken },
            credentials: "include",
            body: JSON.stringify({
                command: "DO_ASSIGN_CONVERSATION",
                conversationId: chatID,
                assignToOperatorId
            }),
            method: "POST"
        });
    };

    assignChat("null");
    setTimeout(() => assignChat(operatorId), 2000);
}

// =========================
//   Получение чатов
// =========================

let getOptions = document.getElementById('AFStatusType');

async function getAllChatsByStatus() {
    let bimba = UI.data;
    let queueCnt = UI.waiting;

    bimba.innerHTML = "";
    queueCnt.innerHTML = "";

    let statusToFetch = getOptions.value;

    const now = new Date();
    const MSK_OFFSET = 3 * 60 * 60 * 1000;
    const msk = new Date(now.getTime() + MSK_OFFSET);

    const y = msk.getUTCFullYear();
    const m = msk.getUTCMonth();
    const d = msk.getUTCDate();

    const tsFrom = new Date(Date.UTC(y, m, d - 2, 21, 0, 0, 0)).toISOString();
    const tsTo = new Date(Date.UTC(y, m, d, 20, 59, 59, 59)).toISOString();

    let setgroupList = (opsection == "ТП" || opsection == "ТП ОС")
        ? "c7bbb211-a217-4ed3-8112-98728dc382d8"
        : "b6f7f34d-2f08-fc19-3661-29ac00842898";

    const initialBodyContent = {
        serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
        mode: "Json",
        groupList: [setgroupList],
        tsFrom,
        tsTo,
        usedStatuses: [statusToFetch],
        orderBy: "ts",
        orderDirection: "Desc"
    };

    await fetchAllPages("https://skyeng.autofaq.ai/api/conversations/history", initialBodyContent)
        .then(allData => {
            dataChts = allData;
            queueCnt.textContent = `${dataChts.length}`;
        })
        .catch(error => console.log('Ошибка получения данных: ', error));

    dataChts.forEach((el, index) => {
        const ts = new Date(el.ts.replace(/\[GMT\]$/, ''));

        const queueItemDiv = document.createElement('div');
        queueItemDiv.className = 'queue-item';
        queueItemDiv.setAttribute('name', 'prosmChat');

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
                case "student": return "👨‍🎓";
                case "parent": return "😵‍💫";
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

        startTimerForDialog(el.ts.replace(/\[GMT\]$/, ''), timerSpan);
    });

    let allConvs = document.getElementsByName('prosmChat');
    for (let i = 0; i < allConvs.length; i++) {
        allConvs[i].addEventListener('click', function () {
            if (document.getElementById('AF_ChatHis').style.display == 'none') {
                document.getElementById('opennewcat').click();
            }
            document.getElementById('hashchathis').value = dataChts[i].conversationId;
            btn_search_history.click();
        });
    }

    let allAssignBtns = document.getElementsByName('assignToMe');
    for (let z = 0; z < allAssignBtns.length; z++) {
        allAssignBtns[z].addEventListener('click', function (event) {
            event.stopPropagation();
            takeOnMe(dataChts[z].conversationId);
        });
    }
}

// =========================
//   Обработчики UI
// =========================

document.getElementById('checkQueue').addEventListener('click', getAllChatsByStatus);

const secInput = document.getElementById('SecondsToRefresh');
secInput.value = getRefreshSeconds();

secInput.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    const val = Number(this.value);
    if (!val || val < 1) return;

    setRefreshSeconds(val);
    startQueueTimers();
});

getOptions.addEventListener('change', getAllChatsByStatus);
