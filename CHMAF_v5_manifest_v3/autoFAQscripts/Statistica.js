var win_StatisticaAF =  // описание формы чтобы не давала чату закрыться
    `<div style="display: flex; width: 750px;">
        <span style="width: 750px; min-height: 70px; max-height:700px; overflow-y:auto; overflow-x:hidden;">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 750px; display:flex; justify-content:space-evenly;" id="stataaf_header">
                                <button class="mainButton buttonHide" title="скрывает меню" id="hidestatisticaaf">hide</button>
								<button class="mainButton smallbtn" id="clearstatawindow">🧹</button>
								<input class="${otherinpth}" type="text" id="timeoutput" style="width:100px; text-align:center; font-weight: 700;" disabled></input>
								<div style="width:450px;background: #5f7875;height: 21px; border-radius:20px;"><div id="progress-bar" style="border-radius:20px; width: 0%; height: 20px; background-color: #e38118; border: 1px solid black; text-align:center; font-weight:700; color:white;"></div></div>
			    </span>
                        </div>
						<div style="margin: 5px; width: 750px" id="periodOfStata">
								 <span style="color:bisque; float:center; margin-top:5px; margin-left:10px;">Начальная дата <input class="${exttheme}" type="date" style="margin-left:20px;  width:125px;" name="stData" id="dateFromStat"></span>
								 <button class="mainButton" style="margin-left:15%" id="dayminusminus">◀</button>
								 <button class="mainButton" id="dayplusplus">▶</button>
								 <span style="color:bisque; margin-top:2px; float:right; margin-right:10px; height:28px;">Конечная дата <input class="${exttheme}" type="date" style="float:right; margin-left:20px; margin-right:10px; width:125px;" name="finData" id="dateToStat" <="" span="">
                        </span>
						</div>
						<div style="width: 750px; display:flex; justify-content: space-evenly; margin-bottom:5px;">
							<button class="mainButton" id="retreivestata">Получить статистику</button>
							<button class="mainButton" id="buttonCheckStats">Проверить CSAT + тематики</button>
							<button class="mainButton" id="buttonKCpower")">Нагрузка КЦ</button>
							<button class="mainButton" id="buttonTPpower")">Нагрузка ТП</button>
						</div>

						<div id="outputstatafield" style="color:bisque;">
						</div>

						<span id="msgloader" style="color:bisque; display:none">⏳ Загрузка...</span>

						<div id="csatandthemes" style="width:750px; color:bisque; display:none">
						</div>

						<div id="loadkctp" style="width:750px; color:bisque; display:none">
						</div>
        </span>
</div>`;

const wintStataAF = createWindow('AF_StataAF', 'winTopStataAF', 'winLeftStataAF', win_StatisticaAF);
hideWindowOnDoubleClick('AF_StataAF');
hideWindowOnClick('AF_StataAF', 'hidestatisticaaf');

let activeopersId;
let summclsd
let rateCounts = {} // создали обьект для подсчета количества 1,2,3,4,5 оценок

function resetRateCounts() {
    rateCounts = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };
    console.log("Rate counts reset.");
}

function getbuttonGetStatButtonPress() {
    if (document.getElementById('AF_StataAF').style.display == 'none') {
        document.getElementById('AF_StataAF').style.display = ''
        document.getElementById('idmymenu').style.display = 'none'
        if (document.getElementById('MainMenuBtn')) {
            document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
        }

        if (document.querySelector('.user_menu-dropdown-user_name').textContent.split('-')[0] == "Prem")
            document.getElementById('buttonTPpower').style.display = "none"
    } else {
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('AF_StataAF').style.display = 'none'
        if (document.getElementById('MainMenuBtn')) {
            document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
        }
    }

    // Добавляем автоподстановку даты в поля
    let getcurdate = new Date();
    let year = getcurdate.getFullYear();
    let month = String(getcurdate.getMonth() + 1).padStart(2, "0");
    let day = String(getcurdate.getDate()).padStart(2, "0");

    let lastDayOfPrevMonth = new Date(year, getcurdate.getMonth(), 0).getDate();
    let toDate = new Date(year, getcurdate.getMonth(), day);

    if (day === "01") {
        // set date range to previous month
        dateFromStat = new Date(year, getcurdate.getMonth() - 1, lastDayOfPrevMonth);
        dateToStat = new Date(year, getcurdate.getMonth(), 1);
    }

    document.getElementById("dateFromStat").value = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
    document.getElementById("dateToStat").value = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
    //



    document.getElementById('retreivestata').onclick = function () {
        if (document.getElementById('csatandthemes').style.display == "" || document.getElementById('loadkctp').style.display == "") {
            document.getElementById('csatandthemes').style.display = "none"
            document.getElementById('loadkctp').style.display = 'none'
            document.getElementById('outputstatafield').style.display = ""
        }
        document.getElementById('retreivestata').classList.add('active-stat-tab')
        document.getElementById('buttonCheckStats').classList.remove('active-stat-tab')
        document.getElementById('buttonKCpower').classList.remove('active-stat-tab')
        document.getElementById('buttonTPpower').classList.remove('active-stat-tab')

        document.getElementById('outputstatafield').innerHTML = '⏳ Загрузка...'
        document.getElementById('progress-bar').innerHTML = ''
        document.getElementById('progress-bar').style.width = '0'


        let dateReq = new Date();
        let hoursReq = dateReq.getHours();
        let minutesReq = dateReq.getMinutes();
        let secondsReq = dateReq.getSeconds();

        // Add a leading zero to hours, minutes, and seconds if they are less than 10
        hoursReq = hoursReq < 10 ? "0" + hoursReq : hoursReq;
        minutesReq = minutesReq < 10 ? "0" + minutesReq : minutesReq;
        secondsReq = secondsReq < 10 ? "0" + secondsReq : secondsReq;

        // Concatenate the hours, minutes, and seconds into a single string
        let timeReq = `${hoursReq} : ${minutesReq} : ${secondsReq}`;

        document.getElementById("timeoutput").value = timeReq;

        getStats()
    }
}

document.getElementById('clearstatawindow').onclick = function () { // кнопка очистки окошек
    document.getElementById('csatandthemes').innerHTML = '';
    document.getElementById('outputstatafield').innerHTML = '';
    document.getElementById('loadkctp').innerHTML = '';
    document.getElementById('timeoutput').value = ''
    document.getElementById('progress-bar').innerHTML = ''
    document.getElementById('progress-bar').style.width = '0'
}

async function getStats() { // функция получения статистики за день (сколько чатов закрыто, пощупано, время работы)
    activeopersId = []
    let table = document.createElement('table')
    table.style = 'table-layout: auto; width:750px;'
    table.style.textAlign = 'center'
    table.id = 'tableStats'
    let columnNames = ["👨‍💻Оператор", "💪Закрыто", "⚡Пощупано", "🕒SLA закрытия", "⚠AvgCSAT"]
    let trHead = document.createElement('tr')
    for (let i = 0; i < columnNames.length; i++) {
        var th = document.createElement('th')
        trHead.append(th)
        th.textContent = columnNames[i]
    }

    const opSection = document.querySelector('.user_menu-dropdown-user_name').textContent.split('-')[0];
    const padStart = (string, targetLength, padString) => {
        return String(string).padStart(targetLength, padString);
    }

    const getFormattedDate = (date) => {
        date.setDate(date.getDate() - 1); // Уменьшаем день на один
        const year = date.getFullYear();
        const month = padStart(date.getMonth() + 1, 2, '0');
        const day = padStart(date.getDate(), 2, '0');
        return `${year}-${month}-${day}T21:00:00.000Z`;
    }

    const dateFromStatInput = document.getElementById("dateFromStat");
    const selectedDate = new Date(dateFromStatInput.value);
    const leftDateFromGrab = getFormattedDate(selectedDate);

    const dateToStatInput = document.getElementById("dateToStat");
    const selectedEndDate = new Date(dateToStatInput.value);
    const rightDateToGrab = `${selectedEndDate.getFullYear()}-${padStart(selectedEndDate.getMonth() + 1, 2, '0')}-${padStart(selectedEndDate.getDate(), 2, '0')}T20:59:59.059z`;

    const response = await fetch(`https://skyeng.autofaq.ai/api/reason8/reports/operatorActivityTable?dateFrom=${leftDateFromGrab}&dateTo=${rightDateToGrab}`, {
        method: "GET", // Указываем метод запроса
        headers: {
            "x-csrf-token": aftoken // Добавляем заголовок с токеном
        },
        credentials: "include" // Включаем cookies для запроса
    });

    // Преобразуем ответ в JSON
    const data = await response.json();

    // Проверяем наличие свойства rows
    if (!data.rows || !Array.isArray(data.rows)) {
        throw new Error("Неверная структура ответа: 'rows' отсутствует или не является массивом.");
    }

    // Фильтруем данные
    const arrayvars = data.rows.filter(row => row.operator && row.operator.indexOf(opSection) !== -1);

    console.log("Результат фильтрации:", arrayvars);

    arrayvars.sort((a, b) => b.conversationClosed - a.conversationClosed);
    activeopersId = arrayvars.map(el => el.operatorId)

    var operatorId = []
    var operatorNames = []
    fetchStaticData()
        .then(result => {
            // Предполагаем, что result уже является JSON-объектом
            result.onOperator.forEach(k => {
                if (k.operator != null) {
                    if (
                        (k.operator.kbs.indexOf(120181) != -1 || k.operator.kbs.indexOf(121381) != -1) &&
                        k.operator.fullName.split('-')[0] == opSection
                    ) {
                        operatorId.push(k.operator.id);
                        operatorNames.push(k.operator.fullName);
                    } else if (k.operator.fullName.split('-')[0] == opSection) {
                        operatorId.push(k.operator.id);
                        operatorNames.push(k.operator.fullName);
                    }
                }
            });
        })
        .catch(error => {
            console.error("Ошибка при обработке данных:", error);
        });

    // getyesterdayandtoday()

    var operatorChatCount = []
    for (var l = 0; l < operatorId.length; l++) {
        let tBodyStatistica = "{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"" + operatorId[l] + "\"],\"tsFrom\":\"" + leftDateFromGrab + "\",\"tsTo\":\"" + rightDateToGrab + "\",\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":1,\"limit\":1}"
        doOperationsWithHistory(tBodyStatistica)
            .then(a => a.json()).then(b => operatorChatCount[l] = b.total)
    }

    let tbody = document.createElement('tbody')
    for (let i = 0; i < arrayvars.length; i++) {
        var tr = document.createElement('tr')
        for (let j = 0; j < 6; j++) {
            var td = document.createElement('td')
            switch (j) {
                case 0:
                    td.textContent = arrayvars[i].operator;
                    if (document.getElementsByClassName('user_menu-dropdown-user_name')[0].textContent == arrayvars[i].operator) {
                        td.style = 'text-align: left; padding-left: 5px; color: rgb(83 219 75); font-weight: 700; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);'
                    } else
                        td.style = 'text-align: left; padding-left: 5px'
                    break;
                case 2: // последить за выводом пощупанных чатов
                    for (let j = 0; j < operatorNames.length; j++)
                        if (arrayvars[i].operator == operatorNames[j]) {
                            td.textContent = operatorChatCount[j]
                            td.classList.add("chtcnt");
                            break
                        }
                    break;
                case 1:
                    td.textContent = arrayvars[i].conversationClosed;
                    td.classList.add("chtclosed");
                    break;
                case 3:
                    td.textContent = "⏳ Loading";
                    td.setAttribute('name', 'sladata');
                    break;
                case 4:
                    td.textContent = "⏳ Loading";
                    td.setAttribute('name', 'csatdata');
                    break;
            }
            tr.append(td)
        }
        tbody.append(tr)
    }


    for (let i = 0; i < tbody.childElementCount; i++) {
        for (let j = 0; j < operatorNames.length; j++)
            if (tbody.children[0].children[0] == operatorNames.length) {
                let tr = document.createElement('tr')
                tr.textContent = operatorChatCount[j]
                tbody.children[0].insertBefore(tbody.children[0].children[2])
            }
    }

    table.append(trHead)
    table.append(tbody)

    document.getElementById('outputstatafield').innerHTML = ''
    document.getElementById('outputstatafield').append(table)

    let dcc = document.getElementsByClassName('chtcnt')
    let summcnt = 0;
    for (i = 0; i < dcc.length; i++) {
        summcnt += Number(dcc[i].textContent)
    }

    let dc = document.getElementsByClassName('chtclosed')
    summclsd = 0;
    for (i = 0; i < dc.length; i++) {
        summclsd += Number(dc[i].textContent)
    }

    let sumchatclosed = document.createElement('div') // сумма закрытых чатов за сутки
    sumchatclosed.innerHTML = 'Общая сумма закрытых чатов за сутки по отделу: ' + '<span id ="allChatsClsd">⏳ Loading</span>'
    sumchatclosed.style.marginLeft = '50px'
    document.getElementById('outputstatafield').append(sumchatclosed)

    let sumchatcount = document.createElement('div') // сумма пощупанных чатов за сутки
    sumchatcount.textContent = 'Общая сумма пощупаных чатов за сутки по отделу: ' + summcnt;
    sumchatcount.style.marginLeft = '50px'
    document.getElementById('outputstatafield').append(sumchatcount)

    let averageCSATonGroup = document.createElement('div')
    averageCSATonGroup.innerHTML = 'Средний CSAT по отделу: ' + '<span id ="avgCsatonGroup">⏳ Loading</span>';
    averageCSATonGroup.style.marginLeft = '50px'
    document.getElementById('outputstatafield').append(averageCSATonGroup)

    let CSATdetalization = document.createElement('div')
    CSATdetalization.innerHTML = "Разбивка по оценкам: " + '<span id ="CSATDetails">⏳ Loading</span>';
    CSATdetalization.style.marginLeft = '50px'
    document.getElementById('outputstatafield').append(CSATdetalization)

    let averageSLAclsGroup = document.createElement('div')
    averageSLAclsGroup.innerHTML = 'SLA закрытия по отделу: ' + '<span id ="SLAonGroup">⏳ Loading</span>';
    averageSLAclsGroup.style.marginLeft = '50px'
    document.getElementById('outputstatafield').append(averageSLAclsGroup)

    let averageAFRTGroup = document.createElement('div')
    averageAFRTGroup.innerHTML = 'AFRT по отделу: ' + '<span id ="AFRTGroup">⏳ Loading</span>';
    averageAFRTGroup.style.marginLeft = '50px'
    document.getElementById('outputstatafield').append(averageAFRTGroup)

    getopersSLA();

}

async function checkCSAT() { // функция проверки CSAT и чатов без тематики
    let str = document.createElement('p')
    str.style.paddingLeft = '50px'

    let dateReq = new Date();
    let hoursReq = dateReq.getHours();
    let minutesReq = dateReq.getMinutes();
    let secondsReq = dateReq.getSeconds();

    // Add a leading zero to hours, minutes, and seconds if they are less than 10
    hoursReq = hoursReq < 10 ? "0" + hoursReq : hoursReq;
    minutesReq = minutesReq < 10 ? "0" + minutesReq : minutesReq;
    secondsReq = secondsReq < 10 ? "0" + secondsReq : secondsReq;

    // Concatenate the hours, minutes, and seconds into a single string
    let timeReq = `${hoursReq} : ${minutesReq} : ${secondsReq}`;

    document.getElementById("timeoutput").value = timeReq;

    document.getElementById('retreivestata').classList.remove('active-stat-tab')
    document.getElementById('buttonCheckStats').classList.add('active-stat-tab')
    document.getElementById('buttonKCpower').classList.remove('active-stat-tab')
    document.getElementById('buttonTPpower').classList.remove('active-stat-tab')

    document.getElementById('buttonCheckStats').textContent = 'Загрузка'
    document.getElementById('outputstatafield').style.display = 'none'
    document.getElementById('loadkctp').style.display = 'none'
    document.getElementById('csatandthemes').style.display = ''
    document.getElementById('csatandthemes').innerHTML = ''
    document.getElementById('msgloader').style.display = ''
    document.getElementById('csatandthemes').append(str)

    // getyesterdayandtoday()


    const padStart = (string, targetLength, padString) => {
        return String(string).padStart(targetLength, padString);
    }

    const getFormattedDate = (date) => {
        date.setDate(date.getDate() - 1); // Уменьшаем день на один
        const year = date.getFullYear();
        const month = padStart(date.getMonth() + 1, 2, '0');
        const day = padStart(date.getDate(), 2, '0');
        return `${year}-${month}-${day}T21:00:00.000z`;
    }

    const dateFromStatInput = document.getElementById("dateFromStat");
    const selectedDate = new Date(dateFromStatInput.value);
    const leftDateFromGrab = getFormattedDate(selectedDate);

    const dateToStatInput = document.getElementById("dateToStat");
    const selectedEndDate = new Date(dateToStatInput.value);
    const rightDateToGrab = `${selectedEndDate.getFullYear()}-${padStart(selectedEndDate.getMonth() + 1, 2, '0')}-${padStart(selectedEndDate.getDate(), 2, '0')}T20:59:59.059z`;

    try {
        page = 1
        let stringChatsWithoutTopic = ""
        csatScore = 0
        csatCount = 0
        let flagok = [];
        let tagsarr = []; //обьявляем пустой массив для хранения тегов чатов
        let count = {};
        let flagvbad = [];
        let flagbad = [];
        let flagmid = [];
        let clschatarr = [];
        let abovecloseslaarr = []
        let aboveart = [];
        let slacount = 0;
        let artcount = 0;
        let aclosedchats = [];
        while (true) {
            test = ''

            let servicetopic;
            servicetopic = '361c681b-340a-4e47-9342-c7309e27e7b5'
            await fetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                "headers": {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                "body": "{\"serviceId\":\"" + servicetopic + "\",\"mode\":\"Json\",\"tsFrom\":\"" + leftDateFromGrab + "\",\"tsTo\":\"" + rightDateToGrab + "\",\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":" + page + ",\"limit\":100}",
                "method": "POST",
            }).then(r => r.json()).then(r => test = r)
            for (let i = 0; i < test.items.length; i++) {
                let flagCsat = 0
                let flagTopic = 0
                doOperationsWithConversations(test.items[i].conversationId)
                    .then(r => r.json())
                    .then(r => {
                        if (r.operatorId == operatorId) {
                            clschatarr.push(test.items[i].conversationId)
                            if (r.messages[r.messages.length - 1].eventTpe == 'CloseConversation')
                                aclosedchats.push('<span style="color: #dfd1f5; font-weight:700">&#5129;</span>' + " " + '<span name="aclsconv">' + test.items[i].conversationId + '</span>' + ' ' +
                                    '<span class = "lookaclschat" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>')
                            if (r.payload == undefined || r.payload.tags == undefined || r.payload.tags.value == '')
                                tagsarr.push('Нет тега!')
                            else if (r.payload.tags.value == '[\n  \"queue\"\n]')
                                tagsarr.push('Тег: Очередь КЦ') //добавляет что тег очередь КЦ выставлен
                            else if (r.payload.tags.value == '[\n  \"request_forwarded_to_2l_tp\"\n]')
                                tagsarr.push('Тег: 2ЛТП') //добавляет что тег очередь КЦ выставлен
                            else tagsarr.push(r.payload.tags.value) //формирует массив тегов чатов
                            flagCsat = 1
                            if (r.payload != undefined)
                                if (r.payload.topicId != undefined)
                                    if (r.payload.topicId.value == "")
                                        flagTopic = 1

                        }
                    })

                for (let k = 0; k < clschatarr.length; k++) {
                    if (test.items[i].conversationId == clschatarr[k]) {
                        if ((test.items[i].stats.conversationDuration / 1000 / 60).toFixed(1) > 25) {

                            let tmestmp = new Date((test.items[i].ts.split('[GMT]'))[0]);
                            let tshrs;
                            let tsmin
                            if ((tmestmp.getUTCHours() + 3) < 10)
                                tshrs = "0" + (tmestmp.getUTCHours() + 3);
                            else tshrs = (tmestmp.getUTCHours() + 3);

                            if (tmestmp.getMinutes() < 10)
                                tsmin = "0" + tmestmp.getMinutes();
                            else tsmin = tmestmp.getMinutes();

                            slacount++;
                            abovecloseslaarr += ('<span style="color: red; font-weight:700">&#5129;</span>' + " " +
                                '<a href="https://skyeng.autofaq.ai/logs/' + clschatarr[k] + '" onclick="" style="color:LightGoldenrod;" class = "slaclchatids">' +
                                clschatarr[k] + '</a>' + ' Время чата: ' + (test.items[i].stats.conversationDuration / 1000 / 60).toFixed(1) +
                                '<span class = "lookchat" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>' + ' Создан чат в: ' + tshrs + ":" + tsmin + ' МСК ' + tagsarr[k] + '<br>')
                        }

                        if (test.items[i].stats.averageOperatorAnswerTime !== undefined && ((test.items[i].stats.averageOperatorAnswerTime / 1000 / 60).toFixed(2)) > 2) {
                            artcount++;
                            aboveart += ('<span style="color: red; font-weight:700">&#5129;</span>' + " " +
                                '<a href="https://skyeng.autofaq.ai/logs/' + clschatarr[k] + '" onclick="" style="color:LightGoldenrod;" class = "artchatids">' +
                                clschatarr[k] + '</a>' + ' Ср.время ответа: ' + (test.items[i].stats.averageOperatorAnswerTime / 1000 / 60).toFixed(2) +
                                '<span class = "lookchatart" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>' + '<br>')
                        }
                    }
                }

                if (flagCsat == 1)
                    if (test.items[i].stats.rate != undefined)
                        if (test.items[i].stats.rate.rate != undefined) {
                            csatScore += test.items[i].stats.rate.rate
                            csatCount++
                            flagok.push(test.items[i].stats.rate.rate)
                            if (test.items[i].stats.rate.rate == 1)
                                flagvbad += '• ' + test.items[i].stats.conversationId + '<br>'
                            if (test.items[i].stats.rate.rate == 2)
                                flagbad += '• ' + test.items[i].stats.conversationId + '<br>'
                            if (test.items[i].stats.rate.rate == 3)
                                flagmid += '• ' + test.items[i].stats.conversationId + '<br>'
                        }
                if (flagTopic == 1)
                    stringChatsWithoutTopic += '<a href="https://skyeng.autofaq.ai/logs/' + test.items[i].conversationId + '" onclick="">https://skyeng.autofaq.ai/logs/' + test.items[i].conversationId + '</a></br>'
            }

            if (test.total / 100 >= page) {
                page++
            } else {
                if (stringChatsWithoutTopic == "")
                    stringChatsWithoutTopic = ' нет чатов без тематики'
                flagok.forEach(function (i) { count[i] = (count[i] || 0) + 1; });
                if (count[1] == undefined)
                    count[1] = 0;
                if (count[2] == undefined)
                    count[2] = 0;
                if (count[3] == undefined)
                    count[3] = 0;
                if (count[4] == undefined)
                    count[4] = 0;
                if (count[5] == undefined)
                    count[5] = 0;

                let firstpart = 'Оценка: ' + Math.round(csatScore / csatCount * 100) / 100 + '<br>' + 'Чаты без тематики (по клику откроет безопасно в новой вкладке без необходимости перелогина): <br>' + "Количество оценок: " + csatCount + ' из них: ' + '<br>'
                let secondpart = stringChatsWithoutTopic + '<br>' + "Чаты СЛА закрытия > 25 m: " + '<br>' + abovecloseslaarr + '<br>' + 'Количество просроченных чатов: ' + slacount + " SLA Закрытия: " + (100 - ((slacount / clschatarr.length) * 100)).toFixed(1) + '%' + '<br>' + "Чаты с просроченным АRT >2m: " + '<br>' + aboveart + '<br>' + 'Количество просроченных чатов: ' + artcount + " ART: " + (100 - ((artcount / clschatarr.length) * 100)).toFixed(1) + '%' + '<br>' + 'Чаты, которые были автозакрыты, проверить потерявшиеся и необработанные чаты: ' + '<br>' + aclosedchats.join('<br>');

                document.getElementById('msgloader').style.display = "none"

                if (flagvbad == "" && flagbad == "" && flagmid == "")
                    str.innerHTML = firstpart + 'Оценка 1 🤬: ' + count[1] + '<br>' + 'Оценка 2 🤢: ' + count[2] + '<br>' + 'Оценка 3 😐: ' + count[3] + '<br>' + 'Оценка 4 🥴: ' + count[4] + '<br>' + 'Оценка 5 😊: ' + count[5] + '<br>' + secondpart
                else if (flagvbad == "" && flagbad == "" && flagmid != "")
                    str.innerHTML = firstpart + 'Оценка 1 🤬: ' + count[1] + '<br>' + 'Оценка 2 🤢: ' + count[2] + '<br>' + 'Оценка 3 😐: ' + count[3] + '<br>' + flagmid + '<br>' + 'Оценка 4 🥴: ' + count[4] + '<br>' + 'Оценка 5 😊: ' + count[5] + '<br>' + secondpart
                else if (flagvbad == "" && flagbad != "" && flagmid == "")
                    str.innerHTML = firstpart + 'Оценка 1 🤬: ' + count[1] + '<br>' + 'Оценка 2 🤢: ' + count[2] + '<br>' + flagbad + '<br>' + 'Оценка 3 😐: ' + count[3] + '<br>' + 'Оценка 4 🥴: ' + count[4] + '<br>' + 'Оценка 5 😊: ' + count[5] + '<br>' + secondpart
                else if (flagvbad != "" && flagbad == "" && flagmid == "")
                    str.innerHTML = firstpart + 'Оценка 1 🤬: ' + count[1] + '<br>' + flagvbad + '<br>' + 'Оценка 2 🤢: ' + count[2] + '<br>' + 'Оценка 3 😐: ' + count[3] + '<br>' + 'Оценка 4 🥴: ' + count[4] + '<br>' + 'Оценка 5 😊: ' + count[5] + '<br>' + secondpart
                else if (flagvbad != "" && flagbad == "" && flagmid != "")
                    str.innerHTML = firstpart + 'Оценка 1 🤬: ' + count[1] + '<br>' + flagvbad + '<br>' + 'Оценка 2 🤢: ' + count[2] + '<br>' + 'Оценка 3 😐: ' + count[3] + '<br>' + flagmid + '<br>' + 'Оценка 4 🥴: ' + count[4] + '<br>' + 'Оценка 5 😊: ' + count[5] + '<br>' + secondpart
                else if (flagvbad != "" && flagbad != "" && flagmid == "")
                    str.innerHTML = firstpart + 'Оценка 1 🤬: ' + count[1] + '<br>' + flagvbad + '<br>' + 'Оценка 2 🤢: ' + count[2] + '<br>' + flagbad + '<br>' + 'Оценка 3 😐: ' + count[3] + '<br>' + 'Оценка 4 🥴: ' + count[4] + '<br>' + 'Оценка 5 😊: ' + count[5] + '<br>' + secondpart
                else if (flagvbad == "" && flagbad != "" && flagmid != "")
                    str.innerHTML = firstpart + 'Оценка 1 🤬: ' + count[1] + '<br>' + 'Оценка 2 🤢: ' + count[2] + '<br>' + flagbad + '<br>' + 'Оценка 3 😐: ' + count[3] + '<br>' + flagmid + '<br>' + 'Оценка 4 🥴: ' + count[4] + '<br>' + 'Оценка 5 😊: ' + count[5] + '<br>' + secondpart
                else if (flagvbad != "" && flagbad != "" && flagmid != "")
                    str.innerHTML = firstpart + 'Оценка 1 🤬: ' + count[1] + '<br>' + flagvbad + '<br>' + 'Оценка 2 🤢: ' + count[2] + '<br>' + flagbad + '<br>' + 'Оценка 3 😐: ' + count[3] + '<br>' + flagmid + '<br>' + 'Оценка 4 🥴: ' + count[4] + '<br>' + 'Оценка 5 😊: ' + count[5] + '<br>' + secondpart
                break
            }
        }
    } catch (e) {
        console.log(e, e.stack);
    }

    const slaclchatcontainer = document.querySelectorAll('.lookchat');
    const slaclchattids = document.querySelectorAll('.slaclchatids');
    const artchatcontainer = document.querySelectorAll('.lookchatart');
    const artchattids = document.querySelectorAll('.artchatids');
    const aclsclookcontainer = document.querySelectorAll('.lookaclschat')
    const aclsdchatids = document.getElementsByName('aclsconv')
    const chatHistoryElement = document.getElementById('AF_ChatHis');
    const chatHistoryButton = document.getElementById('butChatHistory');
    const chatHistorySearchInput = document.getElementById('hashchathis');
    const chatHistorySearchButton = document.getElementById('btn_search_history');

    slaclchatcontainer.forEach((container, index) => {
        container.addEventListener('click', () => {
            if (chatHistoryElement.style.display === 'none') {
                chatHistoryButton.click();
            }
            chatHistorySearchInput.value = slaclchattids[index].textContent;
            chatHistorySearchButton.click();
        });
    });

    artchatcontainer.forEach((container, index) => {
        container.addEventListener('click', () => {
            if (chatHistoryElement.style.display === 'none') {
                chatHistoryButton.click();
            }
            chatHistorySearchInput.value = artchattids[index].textContent;
            chatHistorySearchButton.click();
        });
    });

    aclsclookcontainer.forEach((container, index) => {
        container.addEventListener('click', () => {
            if (chatHistoryElement.style.display === 'none') {
                chatHistoryButton.click();
            }
            chatHistorySearchInput.value = aclsdchatids[index].textContent;
            chatHistorySearchButton.click();
        });
    });

    document.getElementById('buttonCheckStats').textContent = 'Проверить CSAT + тематики'
}

async function checkload(department, flag) { // функция проверки нагрузки на отделы ТП и КЦ по отдельности в зависимости от аргументов
    let dateReq = new Date();
    let hoursReq = dateReq.getHours();
    let minutesReq = dateReq.getMinutes();
    let secondsReq = dateReq.getSeconds();

    // Add a leading zero to hours, minutes, and seconds if they are less than 10
    hoursReq = hoursReq < 10 ? "0" + hoursReq : hoursReq;
    minutesReq = minutesReq < 10 ? "0" + minutesReq : minutesReq;
    secondsReq = secondsReq < 10 ? "0" + secondsReq : secondsReq;

    // Concatenate the hours, minutes, and seconds into a single string
    let timeReq = `${hoursReq} : ${minutesReq} : ${secondsReq}`;

    document.getElementById("timeoutput").value = timeReq;

    document.getElementById('retreivestata').classList.remove('active-stat-tab')
    document.getElementById('buttonCheckStats').classList.remove('active-stat-tab')
    if (flag == 'КЦ') {
        document.getElementById('buttonKCpower').classList.add('active-stat-tab')
        document.getElementById('buttonTPpower').classList.remove('active-stat-tab')
    } else if (flag == 'ТП') {
        document.getElementById('buttonTPpower').classList.add('active-stat-tab')
        document.getElementById('buttonKCpower').classList.remove('active-stat-tab')
    }

    document.getElementById('outputstatafield').style.display = 'none'
    document.getElementById('csatandthemes').style.display = 'none'
    document.getElementById("msgloader").style.dispay = '';
    document.getElementById("loadkctp").innerHTML = '';
    let cntc = 0;
    let busycnt = 0;
    let pausecnt = 0;
    let allcntc = 0;
    let found = [];
    let str = document.createElement('p')
    str.style.paddingLeft = '50px'

    let opsection = document.querySelector('.user_menu-dropdown-user_name').textContent.split('-')[0];
    if (opsection == 'ТПPrem' || opsection == 'Prem')
        department = "Prem"

    fetchStaticData().then(r => r.json()).then(result => {
        setTimeout(function () {
            for (let i = 0; i < result.onOperator.length; i++) {
                if (result.onOperator[i].operator != null && result.onOperator[i].operator.status != "Offline" && result.onOperator[i].operator.fullName.match(department)) {
                    cntc++;
                    if (result.onOperator[i].operator.status == "Busy")
                        busycnt++;
                    else if (result.onOperator[i].operator.status == "Pause")
                        pausecnt++;
                    if (result.onOperator[i].aCnt == null)
                        result.onOperator[i].aCnt = 0;
                    allcntc += result.onOperator[i].aCnt;
                    if (result.onOperator[i].operator.status == "Online")
                        result.onOperator[i].operator.status = "🟢 Онлайн"
                    else if (result.onOperator[i].operator.status == "Busy")
                        result.onOperator[i].operator.status = "🟡 Занят"
                    else if (result.onOperator[i].operator.status == "Pause")
                        result.onOperator[i].operator.status = "🔴 Перерыв"
                    found += result.onOperator[i].operator.status + " | " + result.onOperator[i].operator.fullName + " | Чатов: " + result.onOperator[i].aCnt + '<br>';
                }
            }
            if ((cntc - pausecnt - busycnt) != 0 && allcntc / (cntc - pausecnt - busycnt) <= 2.2)
                found += '<br>' + "Сотрудников на линии: " + cntc + " из них: " + "🟡занят: " + busycnt + " 🔴перерыв: " + pausecnt + " 🟢онлайн: " + (cntc - busycnt - pausecnt) + '<br>' + "Всего чатов в работе: " + allcntc + '<br>' + " Низкая нагрузка";
            else if ((cntc - pausecnt - busycnt) != 0 && allcntc / (cntc - pausecnt - busycnt) > 2.2 && allcntc / (cntc - pausecnt - busycnt) <= 3.2)
                found += '<br>' + "Сотрудников на линии: " + cntc + " из них: " + "🟡занят: " + busycnt + " 🔴перерыв: " + pausecnt + " 🟢онлайн: " + (cntc - busycnt - pausecnt) + '<br>' + "Всего чатов в работе: " + allcntc + '<br>' + " Средняя нагрузка";
            else if ((cntc - pausecnt - busycnt) != 0 && allcntc / (cntc - pausecnt - busycnt) > 3.2 && allcntc / (cntc - pausecnt - busycnt) <= 4.4)
                found += '<br>' + "Сотрудников на линии: " + cntc + " из них: " + "🟡занят: " + busycnt + " 🔴перерыв: " + pausecnt + " 🟢онлайн: " + (cntc - busycnt - pausecnt) + '<br>' + "Всего чатов в работе: " + allcntc + '<br>' + " Высокая нагрузка";
            else if ((cntc - pausecnt - busycnt) != 0 && allcntc / (cntc - pausecnt - busycnt) >= 4.5)
                found += '<br>' + "Сотрудников на линии: " + cntc + " из них: " + "🟡занят: " + busycnt + " 🔴перерыв: " + pausecnt + " 🟢онлайн: " + (cntc - busycnt - pausecnt) + '<br>' + "Всего чатов в работе: " + allcntc + '<br>' + " Критическая нагрузка";
        }, 1000)

        setTimeout(function () {
            document.getElementById("loadkctp").append(str)
            document.getElementById("loadkctp").style.display = '';
            document.getElementById("msgloader").style.dispay = 'none';
            str.innerHTML = '<br>' + found;
        }, 1000)

    })
}

let arrayofSLA;
let filteredarray;
let alloperSLAclsed = 0;
let alloperChatsclsed = 0;
let alloperaboveART = 0;
let alloperaboveAFRT = 0;
let flagFoundQueue = 0;
let flagFoundOperGroup = 0;
let flagIsOnTPOper = 0;
let operFuckUpName = 0;
let flagFoundOperAnswer = 0;
let indexOfChangeGroup = -1;
let indexOfFirstTimeInQueue = -1;
let foundQueue;
let foundOperAnswer;
let foundQueueTime;
let foundOperAnswerTime;
let differenceInSeconds;
async function getopersSLA() {
    let progressBar = document.getElementById("progress-bar");
    let currentWidth = 0;
    let page;
    let maxpage = 0;
    let operclschatcount;
    let totalChatsClosed = [];
    let arrayafrtcount = [];
    let arrayafrtcountwithqueue = [];
    let arraycsatcount = [];
    let arraycsatsumma = [];
    let operatorOverdueChats = [];
    let csatcount;
    let csatsumma;
    let overduecount;
    let alloperCSATsumma = 0;
    let alloperCSATcount = 0;
    let massivchikUntarget = new Set(); // Массив уникальный для чатов АФРТ вне таргета
    let massivchikTarget = new Set(); // Массив уникальный для чатов АФРТ в таргете
    let massivchikQueue = new Set(); // Массив уникальный для чатов в очередях
    let uniqueIdsArrayUntarget = []
    let uniqueIdsArrayTarget = []
    let uniquedArrayAllLength
    let uniqueArrayQueue = []

    alloperSLAclsed = 0;
    alloperChatsclsed = 0;
    alloperaboveART = 0;
    alloperaboveAFRT = 0;
    let slarows = document.getElementsByName('sladata');
    let csatrows = document.getElementsByName('csatdata');

    const padStart = (string, targetLength, padString) => {
        return String(string).padStart(targetLength, padString);
    }

    const getFormattedDate = (date) => {
        date.setDate(date.getDate() - 1); // Уменьшаем день на один
        const year = date.getFullYear();
        const month = padStart(date.getMonth() + 1, 2, '0');
        const day = padStart(date.getDate(), 2, '0');
        return `${year}-${month}-${day}T21:00:00.000z`;
    }

    const dateFromStatInput = document.getElementById("dateFromStat");
    const selectedDate = new Date(dateFromStatInput.value);
    const leftDateFromGrab = getFormattedDate(selectedDate);

    const dateToStatInput = document.getElementById("dateToStat");
    const selectedEndDate = new Date(dateToStatInput.value);
    const rightDateToGrab = `${selectedEndDate.getFullYear()}-${padStart(selectedEndDate.getMonth() + 1, 2, '0')}-${padStart(selectedEndDate.getDate(), 2, '0')}T20:59:59.059z`;

    // getyesterdayandtoday();
    let operdata;
    filteredarray = [];
    arrayofSLA = [];
    let arraysOfAnswAndQues = [];

    if (activeopersId) {
        let step = 100 / activeopersId.length;
        for (let i = 0; i < activeopersId.length; i++) {
            operclschatcount = 0;
            csatcount = 0;
            csatsumma = 0;
            overduecount = 0;
            page = 1;

            do {
                const tBodyStatisticaOther = `{
                    "serviceId": "361c681b-340a-4e47-9342-c7309e27e7b5",
                    "mode": "Json",
                    "participatingOperatorsIds": ["${activeopersId[i]}"],
                    "tsFrom": "${leftDateFromGrab}",
                    "tsTo": "${rightDateToGrab}",
                    "orderBy": "ts",
                    "orderDirection": "Asc",
                    "page": ${page},
                    "limit": 100
                }`;

                try {
                    // Выполняем запрос для получения данных истории
                    const response = await doOperationsWithHistory(tBodyStatisticaOther);

                    // Проверяем корректность ответа
                    if (!response || !response.items || !Array.isArray(response.items)) {
                        throw new Error("Invalid response structure: 'items' is undefined or not an array.");
                    }

                    const operdata = response; // Ответ от doOperationsWithHistory

                    for (let j = 0; j < operdata.items.length; j++) {
                        flagFoundQueue = 0;
                        flagFoundOperGroup = 0;
                        flagIsOnTPOper = 0;
                        operFuckUpName = '';
                        flagFoundOperAnswer = 0;
                        indexOfChangeGroup = -1;
                        indexOfFirstTimeInQueue = -1;
                        differenceInSeconds = 0;

                        // Выполняем запрос для конкретного диалога
                        const fres = await doOperationsWithConversations(operdata.items[j].conversationId);

                        let conversationData = {
                            ConversationId: fres.id,
                            AnswersCounter: 0, // Инициализируем значением 0
                            QuestionsCounter: 0, // Инициализируем для будущего наполнения
                            operId: fres.operatorId
                        };

                        const frAnswers = fres.answers.length;
                        const frQuestions = fres.questions.length;
                        let answC = 0;
                        let quesC = 0;

                        if (frAnswers > 0) {
                            for (let i = 0; i < frAnswers; i++) {
                                if (fres.answers[i].isProcessed === undefined) {
                                    conversationData.AnswersCounter++;
                                    answC++;
                                }
                            }
                        }
                        if (frQuestions > 0) {
                            for (let j = 0; j < frQuestions; j++) {
                                if (!["Good", "Could be better", "So-so", "Bad", "Terrible"].includes(fres.questions[j])) {
                                    conversationData.QuestionsCounter++;
                                    quesC++;
                                }
                            }
                        } else {
                            conversationData.QuestionsCounter = 0;
                        }
                        console.log(fres.operatorId, "-", fres.id, "-", answC, "-", quesC);

                        // ЦИКЛ НАЧАЛО
                        if (fres.messages[fres.messages.length - 1]?.tpe === "Question") {
                            let groupFoundIndex = -1; // Индекс сообщения с нужной группой
                            let flagChatIsInQueue = -1; // Индекс сообщения с "Ищем для вас..."
                            const firstMessageTime = fres.messages[fres.messages.length - 1].ts;

                            // Сначала ищем сообщение с нужной группой
                            for (let z = fres.messages.length - 1; z >= 0; z--) {
                                const message = fres.messages[z];
                                if (message.payload && !message.payload.prevGroup && message.payload.group === "c7bbb211-a217-4ed3-8112-98728dc382d8") {
                                    groupFoundIndex = z;
                                    break; // Находим первое с конца сообщение с нужной группой и запоминаем его индекс
                                }
                            }

                            // Если сообщение с нужной группой найдено, ищем следующее по условию
                            if (groupFoundIndex !== -1) {
                                for (let b = groupFoundIndex; b >= 0; b--) {
                                    const message = fres.messages[b];

                                    if (message.tpe && typeof message.txt === 'string' && message.txt.includes("специалисты заняты")) {
                                        flagChatIsInQueue = b;
                                        if (flagChatIsInQueue !== -1) {
                                            for (let v = flagChatIsInQueue; v >= 0; v--) {
                                                const message = fres.messages[v];
                                                if (["AnswerOperatorWithBot", "AnswerOperator"].includes(message.tpe)) {
                                                    const remember = message.ts;
                                                    const differInSecs = (new Date(remember) - new Date(firstMessageTime)) / 1000;
                                                    if (differInSecs > 60) {
                                                        massivchikQueue.add(fres.id);
                                                        break; // Прерываем цикл после нахождения и выполнения условий
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    if (["AnswerOperatorWithBot", "AnswerOperator"].includes(message.tpe)) {
                                        const remember = message.ts;
                                        const differInSecs = (new Date(remember) - new Date(firstMessageTime)) / 1000;
                                        if (differInSecs > 60) {
                                            massivchikUntarget.add(fres.id);
                                        } else {
                                            massivchikTarget.add(fres.id);
                                        }
                                        break; // Прерываем цикл после нахождения и выполнения условий
                                    }
                                }
                            }
                        }

                        // ЦИКЛ КОНЕЦ
                        if (fres.operatorId === activeopersId[i]) {
                            operclschatcount++;
                            totalChatsClosed[i] = operclschatcount;
                            filteredarray.push({
                                id: "operator" + [i + 1],
                                chatHashId: operdata.items[j].conversationId,
                                Duration: operdata.items[j].stats.conversationDuration
                                    ? (operdata.items[j].stats.conversationDuration / 1000 / 60).toFixed(1)
                                    : "0.0",
                                Rate: operdata.items[j].stats.rate.rate
                                    ? operdata.items[j].stats.rate.rate
                                    : null,
                                Channel: operdata.items[j].channel.name
                            });

                            if (operdata.items[j].stats.rate.rate && operdata.items[j].channel.name !== "Telegram techsup acquisition") {
                                csatcount++;
                                csatsumma += operdata.items[j].stats.rate.rate;
                                arraycsatcount[i] = csatcount;
                                arraycsatsumma[i] = csatsumma;
                            }

                            if (operdata.items[j].stats.conversationDuration && (operdata.items[j].stats.conversationDuration / 1000 / 60).toFixed(1) > 25) {
                                overduecount++;
                                operatorOverdueChats[i] = overduecount;
                            }
                        }
                    }
                    page++;
                    maxpage = Math.ceil(operdata.total / 100);
                } catch (error) {
                    console.error("Ошибка выполнения запроса:", error);
                    break; // Прерываем выполнение цикла в случае ошибки
                }
            } while (page <= maxpage); while (page - 1 < maxpage);

            uniqueIdsArrayUntarget = Array.from(massivchikUntarget);
            console.log("Массив нетаргета по АФРТ", uniqueIdsArrayUntarget);
            uniqueIdsArrayTarget = Array.from(massivchikTarget);
            //console.log(uniqueIdsArrayTarget);
            uniquedArrayAllLength = +(uniqueIdsArrayUntarget.length + uniqueIdsArrayTarget.length)
            console.log(uniquedArrayAllLength);
            uniqueArrayQueue = Array.from(massivchikQueue)
            console.log("Массив очереди", uniqueArrayQueue)

            currentWidth += step;
            progressBar.style.width = Number(currentWidth.toFixed(1)) + "%";
            progressBar.textContent = Number(currentWidth.toFixed(1)) + "%";

            if (arraycsatcount[i] && arraycsatsumma[i]) {
                csatrows[i].textContent = (arraycsatsumma[i] / arraycsatcount[i]).toFixed(2);
                alloperCSATsumma += arraycsatsumma[i]
                alloperCSATcount += arraycsatcount[i]
            } else {
                csatrows[i].textContent = "No marks!"
            }

            if (operatorOverdueChats[i]) {
                alloperSLAclsed += operatorOverdueChats[i]
                alloperChatsclsed += totalChatsClosed[i]
                slarows[i].textContent = (100 - (operatorOverdueChats[i] / totalChatsClosed[i]) * 100).toFixed(1) + '%'
            } else {
                slarows[i].textContent = "100%"
            }

            if (arrayafrtcount[i]) {
                alloperaboveAFRT = (+arrayafrtcount.length + arrayafrtcountwithqueue.length)
            }
        }

        resetRateCounts()
        filteredarray.forEach(item => {
            if (item.Rate !== null && item.Channel != "Telegram techsup acquisition") {
                rateCounts[item.Rate]++;
            }
        });

        console.log(rateCounts) //check output
        let calcChatsClsContainer = ((((alloperChatsclsed - alloperSLAclsed) * 100) / 81) - alloperChatsclsed).toFixed(1);
        let calcAFRTContainer = (((uniqueIdsArrayTarget.length * 100) / 86) - uniquedArrayAllLength).toFixed(1);

        document.getElementById('avgCsatonGroup').textContent = (alloperCSATsumma / alloperCSATcount).toFixed(2);
        document.getElementById('CSATDetails').innerText = `
        Оценка 5 😊: ${rateCounts['5']} (${rateCounts['5'] * 5})
        Оценка 4 🥴: ${rateCounts['4']} (${rateCounts['4'] * 4})
        Оценка 3 😐: ${rateCounts['3']} (${rateCounts['3'] * 3})
        Оценка 2 🤢: ${rateCounts['2']} (${rateCounts['2'] * 2})
        Оценка 1 🤬: ${rateCounts['1']} (${rateCounts['1'] * 1})
    `;

        document.getElementById('allChatsClsd').textContent = alloperChatsclsed;

        document.getElementById('SLAonGroup').innerHTML = ((alloperChatsclsed - alloperSLAclsed) / alloperChatsclsed * 100).toFixed(1) + '%' +
            " Всего влияли на SLA Completed: " + alloperChatsclsed + " из них: " +
            `<div>` +
            "•🚫Вне таргета: " + alloperSLAclsed +
            "• ✅В таргете: " + (alloperChatsclsed - alloperSLAclsed) +
            " 🎯Для таргета 81% можем позволить просрочить:" +
            (Number(calcChatsClsContainer) < 0 ? `<span style="color:coral; font-weight:700">` + calcChatsClsContainer + `</span>` : `<span style="color:rgb(83, 219, 75); font-weight:700">` + calcChatsClsContainer + `</span>`) +
            " чатов" +
            `</div>`;

        document.getElementById('AFRTGroup').innerHTML = ((uniqueIdsArrayTarget.length / uniquedArrayAllLength) * 100).toFixed(1) + '%' +
            " Всего влияли на AFRT: " + uniquedArrayAllLength + " из них: " +
            `<div>` +
            "•🚫Вне таргета: " + uniqueIdsArrayUntarget.length +
            "• ✅В таргете: " + uniqueIdsArrayTarget.length +
            " 🎯Для таргета 86% можем позволить просрочить:" +
            (Number(calcAFRTContainer) < 0 ? (`<span style="color:coral; font-weight:700">` + calcAFRTContainer + `</span>`) + (`<span>` + " (чтобы выйти  в таргет, необходимо вовремя дать ответ в: " + Math.abs((calcAFRTContainer * 6.2)).toFixed(1) + `</span>` + `</span>`) : `<span style="color:rgb(83, 219, 75); font-weight:700">` + calcAFRTContainer + `</span>`) +
            " чатов" +
            `</div>`;

        console.log('Chats above AFRT: ' + uniqueIdsArrayUntarget.length)
        console.log('All chats closed: ' + alloperChatsclsed)
    }
}

document.getElementById("buttonCheckStats").addEventListener("click", checkCSAT);
document.getElementById("buttonKCpower").addEventListener("click", function () {
    checkload(/КЦ/, 'КЦ');
});
document.getElementById("buttonTPpower").addEventListener("click", function () {
    checkload(/ТП/, 'ТП');
});

document.getElementById('dayplusplus').onclick = function () {
    const adjustDate = (dateId) => {
        let date = new Date(document.getElementById(dateId).value);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    document.getElementById('dateFromStat').value = adjustDate('dateFromStat');
    document.getElementById('dateToStat').value = adjustDate('dateToStat');
}


document.getElementById('dayminusminus').onclick = function () {
    const adjustDate = (dateId) => {
        let date = new Date(document.getElementById(dateId).value);
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    };

    document.getElementById('dateFromStat').value = adjustDate('dateFromStat');
    document.getElementById('dateToStat').value = adjustDate('dateToStat');
}
