var win_Stat =  // описание элементов окна Статистики
    `<div style="display: flex; width: 550px;">
        <span style="width: 550px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 550;" id="statdata">
                                <button class="mainButton buttonHide" id="hideMeStat">hide</button>
                        </div>
                        <div style="margin: 5px; width: 550px" id="statbox">
								 <span style="color:bisque; float:center; margin-top:5px; margin-left:10px;">Начальная дата <input type="date" style="margin-left:20px;  width:125px;" name="StartData" id="dateFrom" class="${exttheme}"></span>
								 <span style="color:bisque; margin-top:2px; float:right; margin-right:10px; height:28px;">Конечная дата <input type="date" style="float:right; margin-left:20px; margin-right:10px; width:125px;" name="EndData" id="dateTo" class="${exttheme}"></span>
                        </div>
						<div>
							<input id="commenttosearch" class="${exttheme}" placeholder="Слово или фраза для поиска среди закрытых чатов по заметкам" title="введите слово или фразу для поиска по заметкам в закрытом чате" autocomplete="off" type="text" style="text-align: center; width: 540px; margin-left:5px">
								<select id="thematics" class="${exttheme}" style="margin-left:150px; margin-top:10px;">
									<option class="${selecttheme}" value="skmob">Skyeng👨‍🎓Mob</option>
									<option value="1804">-Авторизация</option>
									<option value="1805">-Домашка</option>
									<option value="1806">-Оплата</option>
									<option value="1807">-Профиль</option>
									<option value="1808">-Тренажер слов</option>
									<option value="1809">-Уроки</option>
									<option value="1810">-Чат</option>
									<option class="${selecttheme}" value="tmob">Teachers👽Mob</option>
                                    <option value="1833">-Авторизация</option>
									<option value="1836">-Виджет расписания</option>
									<option value="1839">-Чат</option>
									<option value="1835">-Виджет финансов</option>
									<option value="1838">-Профиль</option>
									<option value="1840">-Сторис</option>
									<option value="1837">-Стр расписания</option>
									<option value="1834">-Стр финансов</option>
									<option class="${selecttheme}" value="sksmpar">Skysmart👪родит</option>
                                    <option value="1884">-Другое</option>
									<option value="1883">-Материалы</option>
									<option value="1880">-Предметы и баланс</option>
									<option value="1881">-Профиль родителя</option>
									<option value="1879">-Расписание</option>
									<option value="1882">-Чат</option>
									<option class="${selecttheme}" value="solanka">Different</option>
                                    <option value="2034">-Прочее</option>
									<option value="2030">-Slack-вход</option>
									<option value="2020">-Логи ур У</option>
									<option value="2019">-Логи ур П</option>
									<option value="2018">-БД ур оператор</option>
									<option value="2017">-БД ур система</option>
									<option class="${selecttheme}" value="payf">Проблемы с оплатой</option>
                                    <option value="1077">-Вина школы</option>
									<option value="1658">-Консультация</option>
									<option value="1661">-Карта У</option>
									<option value="1662">-Сбой</option>
									<option value="1660">-Подписки</option>
									<option class="${selecttheme}" value="hwtr">Проблемы с ДЗ</option>
                                    <option value="1744">-Контент</option>
									<option value="1745">-Оценка</option>
									<option value="1746">-Словарь</option>
									<option value="1747">-Упражнение</option>
									<option class="${selecttheme}" value="svyaz">Проблемы связь</option>
                                    <option value="1581">-ОС/брауз ниж мин</option>
									<option value="1589">-Конс раб св</option>
									<option value="1582">-Корп с/ус</option>
									<option value="1583">-ОС/браузер</option>
                                    <option value="1586">-ПК</option>
									<option value="1584">-Гарнитура</option>
									<option value="1585">-Камера</option>
									<option value="1580">-Блок ПО</option>
									<option value="1594">-Не подерж брауз</option>
									<option value="1595">-Не под кам гарн пк</option>
                                    <option value="1593">-Сбой платф</option>
									<option value="1592">-Сб задерж кам</option>
									<option value="1587">-Инет ниж мин</option>
									<option value="1590">-Сб плат блк прер</option>
									<option value="1588">-Хар ниж мин</option>
									<option value="1591">-Сб задерж зв</option>
									<option class="${selecttheme}" value="lkp">Проблемы ЛКП</option>
                                    <option value="1721">-Группа</option>
									<option value="1714">-Чат</option>
									<option value="1719">-Финансы</option>
									<option value="1717">-Упражнения</option>
                                    <option value="1712">-Карта роста</option>
									<option value="1716">-Настройки</option>
									<option value="1718">-Перерыв</option>
									<option value="1715">-Профиль</option>
									<option value="1720">-Раб на пров</option>
									<option value="1713">-Расписание</option>
									<option class="${selecttheme}" value="lku">Проблемы ЛКУ</option>
                                    <option value="1708">-Чат</option>
									<option value="1710">-Профиль</option>
									<option value="1706">-Видж прогр</option>
									<option value="1707">-Ис зан/портф</option>
                                    <option value="1709">-Семья</option>
									<option value="1711">-Настройки</option>
									<option value="1705">-Навыки</option>
									<option value="1704">-Грамматика</option>
									<option class="${selecttheme}" value="problvh">Проблемы вход</option>
                                    <option value="1632">-Не привяз почт/тел</option>
									<option value="1635">-Данные</option>
									<option value="1634">-Сброс пароля</option>
									<option value="1631">-Консультация</option>
                                    <option value="1633">-Сбой</option>
									<option class="${selecttheme}" value="problpodk">Проблемы подкл</option>
                                    <option value="1624">-Истек подпис</option>
									<option value="1627">-Консультациия</option>
									<option value="1629">-Нет кн входа</option>
									<option value="1628">-У не в ГУ</option>
                                    <option value="1625">-Ур в др вр</option>
									<option value="1626">-У отпуск</option>
                                    <option value="1630">-Неакт кн вх</option>
									<option class="${selecttheme}" value="lesfunc">Функционал урок</option>
                                    <option value="1772">-STT</option>
									<option value="1773">-TTT</option>
									<option value="1767">-Вложения</option>
									<option value="1771">-Демонстрация экр</option>
                                    <option value="1768">-Доска</option>
									<option value="2037">-Заметки</option>
                                    <option value="1775">-Отпр ДЗ на ур</option>
                                    <option value="1770">-Перекл материалов</option>
									<option value="1776">-Ауд/вид плеер</option>
                                    <option value="1769">-Словарь на ур</option>
                                    <option value="1774">-Упражн на ур</option>
									<option class="${selecttheme}" value="feedbk">Отзывы и пожел</option>
                                    <option value="1970">-Vim-контент</option>
									<option value="1971">-Vim-оценка</option>
									<option value="1972">-Vim-словарь</option>
									<option value="1973">-Vim-упражнения</option>
                                    <option value="1966">-ЛК-ОС род</option>
									<option value="1965">-ЛК-пер,отм ур</option>
                                    <option value="1967">-ЛК-профиль</option>
                                    <option value="1968">-ЛК-семья</option>
									<option value="1969">-ЛК чат</option>
                                    <option value="1974">-App Skyeng</option>
                                    <option value="1975">-App Teachers</option>
                                    <option value="1979">-App Skypro</option>
                                    <option value="1976">-App класс</option>
									<option value="1977">-App решения</option>
                                    <option value="1978">-App Skysmart род</option>
                                    <option value="1980">-Прочее</option>
                                    </select>
                               <button class="mainButton" style=" title="ищет чаты по тематике" id="gofindit">Find</button>
                               <button class="mainButton" style=" title="меняет тематику в хеше чата указанном выше в поле ввода и выбранной тематикой из выпадающего списка" id="changetheme">Change</button>
						</div>
						</span>
						<div style="display:flex; justify-content:space-evenly; margin-top:5px;">
							 <button class="mainButton" title="Получает статистику, считает среднюю оценку всех чатов за период, и отображает чаты без тематики" id="getstatfromperiod">Получить статистику</button>
							 <button class="mainButton" title="Получает чаты с ксат <4 и выводит их в поле для просмотра и аппеляции" id="getlowcsat">Чаты с КСАТ<4</button>
							 <button class="mainButton" title="Запускает поиск по комментарию в заметке, поиск точный и чувствительный к регистру и языку заметки" id="parsechat">Найти по комменту</button>
							 <button class="mainButton" title="очищает значения поля" id="clearall">Очистить</button>
							 <button class="mainButton" title="загружает полученные результаты как для Чаты с ксат <4 так и для чатов с комментариями в виде HTML файла" id="getfile">🔰</button>
							 <br>
					    </div>
						<div id="chatcoutnsinfo">
							 <span id="sumchatcounttouched" style="margin-left: 5px; color:bisque;"></span>
							 <br>
							 <span id="sumchatcountclosed" style="margin-left: 5px; color:bisque;"></span>
							 <p id="chatsinfoout" style="width:550px; color:bisque; margin-left:5px"></p>
							 <p id="lowCSATcount" style="width:550px; max-height:400px; color:bisque; margin-left:5px; overflow:auto"></p>
							 <p id="themesdata" style="width:550px; max-height:400px; color:bisque; margin-left:5px; overflow:auto"></p>
							 <p id="chatcommentsdata" style="width:550px;color:bisque; max-height:400px; margin-left:5px; overflow:auto"></p>
						</div>
        </span>
</div>`;

const wintStat = createWindow('AF_Stat', 'winTopStat', 'winLeftStat', win_Stat);
hideWindowOnDoubleClick('AF_Stat');
hideWindowOnClick('AF_Stat', 'hideMeStat');

//Функция очищения выведенной информации после поиска
document.getElementById('clearall').onclick = function () {
    document.querySelector('#sumchatcounttouched').innerText = ""
    document.querySelector('#sumchatcountclosed').innerText = ""
    document.querySelector('#chatsinfoout').innerText = ""
    document.querySelector('#lowCSATcount').innerText = ""
    document.querySelector('#lowCSATcount').style.display = "none"
    document.querySelector('#chatcommentsdata').innerText = ""
    document.querySelector('#chatcommentsdata').style.display = "none"
    document.querySelector('#commenttosearch').value = ""
    document.querySelector('#themesdata').innerText = ""
}

function getStatsButtonPress() { // открытие Статистики
    let getcurdate = new Date();
    let year = getcurdate.getFullYear();
    let month = String(getcurdate.getMonth() + 1).padStart(2, "0");
    let day = String(getcurdate.getDate()).padStart(2, "0");

    let lastDayOfPrevMonth = new Date(year, getcurdate.getMonth(), 0).getDate();
    let fromDate = new Date(year, getcurdate.getMonth(), day - 1);
    let toDate = new Date(year, getcurdate.getMonth(), day);

    if (day === "01") {
        // set date range to previous month
        fromDate = new Date(year, getcurdate.getMonth() - 1, lastDayOfPrevMonth);
        toDate = new Date(year, getcurdate.getMonth(), 1);
    }

    document.getElementById("dateFrom").value = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`;
    document.getElementById("dateTo").value = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;

    document.querySelector('#chatcommentsdata').style.display = "none"
    document.querySelector('#lowCSATcount').style.display = "none"
    if (document.getElementById('AF_Stat').style.display == '')
        document.getElementById('AF_Stat').style.display = 'none'
    else
        document.getElementById('AF_Stat').style.display = ''
}

// Тут будет функция запуска получения информации о статистики

document.getElementById('getstatfromperiod').onclick = async function () { // Тут будет функция запуска получения информации о статистики
    let datefrom = document.getElementById('dateFrom').value + "T21:00:00.000Z";
    let dateto = document.getElementById('dateTo').value + "T20:59:59.059Z";
    let strnew = document.getElementById('chatsinfoout');
    let allchatcounttouched = document.getElementById('sumchatcounttouched')
    document.getElementById('getstatfromperiod').textContent = "Загрузка"
    allchatcounttouched.textContent = "Загрузка"
    let allchatcountclosed = document.getElementById('sumchatcountclosed')
    allchatcountclosed.textContent = "Загрузка"
    strnew.textContent = "Загрузка"
    await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
        "headers": {
            "content-type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": "https://skyeng.autofaq.ai/logs",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"" + operatorId + "\"],\"tsFrom\":\"" + datefrom + "\",\"tsTo\":\"" + dateto + "\",\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":1,\"limit\":1}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(r => r.json()).then(data => sumchatcounttouched = data)
    allchatcounttouched.innerText = "Количество пощупаных чатов: " + sumchatcounttouched.total;


    await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
        "headers": {
            "content-type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": "https://skyeng.autofaq.ai/logs",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"" + operatorId + "\"],\"tsFrom\":\"" + datefrom + "\",\"tsTo\":\"" + dateto + "\",\"usedStatuses\":[\"ClosedByOperator\"],\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":1,\"limit\":1}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(r1 => r1.json()).then(data1 => sumchatcountclosed = data1)
    allchatcountclosed.innerText = "Количество закрытых чатов: " + sumchatcountclosed.total;

    // блок с расчетом КСАТ и чатов без тематики
    try {
        pagenew = 1
        let stringChatsWithoutTopic2 = ""
        csatScoreNew = 0
        csatCountNew = 0
        while (true) {
            test = ''
            await fetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                "headers": {
                    "content-type": "application/json",
                },
                "body": "{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"tsFrom\":\"" + datefrom + "\",\"tsTo\":\"" + dateto + "\",\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":" + pagenew + ",\"limit\":100}",
                "method": "POST",
            }).then(r => r.json()).then(r => test = r)
            for (let i = 0; i < test.items.length; i++) {
                let flagCsat = 0
                let flagTopic = 0
                await fetch('https://skyeng.autofaq.ai/api/conversations/' + test.items[i].conversationId)
                    .then(r => r.json())
                    .then(r => {
                        if (r.operatorId == operatorId) {
                            flagCsat = 1
                            if (r.payload != undefined)
                                if (r.payload.topicId != undefined)
                                    if (r.payload.topicId.value == "")
                                        flagTopic = 1
                        }
                    })
                if (flagCsat == 1)
                    if (test.items[i].stats.rate != undefined)
                        if (test.items[i].stats.rate.rate != undefined) {
                            csatScoreNew += test.items[i].stats.rate.rate
                            csatCountNew++
                        }
                if (flagTopic == 1)
                    stringChatsWithoutTopic2 += '<span style="color: #00FA9A">&#5129;</span>' + " " + '<a href="https://skyeng.autofaq.ai/logs/' + test.items[i].conversationId + '" onclick="" style="color:#1E90FF;">' + test.items[i].conversationId + '</a></br>'
            }

            if (stringChatsWithoutTopic2 == "")
                stringChatsWithoutTopic2 = ' нет таких' + '<br>'

            strnew.innerHTML = 'Оценка: ' + Math.round(csatScoreNew / csatCountNew * 100) / 100 + '<br>' + 'Чаты без тематики: <br>' + stringChatsWithoutTopic2

            if ((test.total / 100) > pagenew) {
                pagenew++;
            } else {
                document.getElementById('getstatfromperiod').textContent = "Получить статистику"
                break
            }
        }
    } catch {
        strnew.textContent = 'Что-то пошло не так. Сделайте скрин консоли и отправьте в канал chm-dev, пожалуйста'
    }
}

//Функция получения чатов с низким КСАТ
let stringChatsWithLowCsat;

document.getElementById('getlowcsat').onclick = async function () { // получить хеши чатов с оценками ниже 4
    let datefrom1 = document.getElementById('dateFrom').value + "T21:00:00.000Z";
    let dateto1 = document.getElementById('dateTo').value + "T20:59:59.059Z";
    let strcsatnew = document.getElementById('lowCSATcount');
    strcsatnew.textContent = "Загрузка"
    document.getElementById('getlowcsat').textContent = "Загрузка";

    // блок с расчетом КСАТ и чатов без тематики
    try {
        pagenewlowcsat = 1
        stringChatsWithLowCsat = "";
        while (true) {
            test = ''
            await fetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                "headers": {
                    "content-type": "application/json",
                },
                "body": "{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"tsFrom\":\"" + datefrom1 + "\",\"tsTo\":\"" + dateto1 + "\",\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":" + pagenewlowcsat + ",\"limit\":100}",
                "method": "POST",
            }).then(r => r.json()).then(r => test = r)
            for (let i = 0; i < test.items.length; i++) {
                let flagCsat1 = 0
                csatScoreNewLow = 0
                await fetch('https://skyeng.autofaq.ai/api/conversations/' + test.items[i].conversationId)
                    .then(r => r.json())
                    .then(r => {
                        if (r.operatorId == operatorId) {
                            flagCsat1 = 1
                        }
                    })
                if (flagCsat1 == 1)
                    if (test.items[i].stats.rate != undefined)
                        if (test.items[i].stats.rate.rate != undefined && test.items[i].stats.rate.rate < 4) {
                            csatScoreNewLow = 1;
                        }

                if (csatScoreNewLow == 1)
                    stringChatsWithLowCsat += '<span style="color: #00FA9A">&#5129;</span>' + " " + '<a href="https://skyeng.autofaq.ai/logs/' + test.items[i].conversationId + '" onclick="" style="color:#1E90FF;" class = "csatchatids">' + test.items[i].conversationId + '</a>' + '<span class = "lowcsatschats" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>' + '</br>'

            }

            if (stringChatsWithLowCsat == "")
                stringChatsWithLowCsat = ' нет таких' + '<br>'

            document.querySelector('#lowCSATcount').style.display = ""
            strcsatnew.innerHTML = 'Чаты с плохими оценками: (открывать в режиме инкогнито!) ' + '<br>' + stringChatsWithLowCsat

            let csatcontainer = document.querySelectorAll('.lowcsatschats');
            let csatchattids = document.querySelectorAll('.csatchatids');
            for (let j = 0; j < csatcontainer.length; j++) {
                csatcontainer[j].onclick = function () {

                    if (document.querySelector('#hide_or_display').textContent != "свернуть") {
                        hide_or_display.click()
                        document.getElementById('chat_id').value = csatchattids[j].innerText;
                        search.click()
                    } else if (document.querySelector('#hide_or_display').textContent == "свернуть") {
                        document.getElementById('chat_id').value = csatchattids[j].innerText;
                        search.click()
                    }
                }
            }



            if ((test.total / 100) > pagenewlowcsat) {
                pagenewlowcsat++;
            } else {
                document.getElementById('getlowcsat').textContent = "Чаты с КСАТ<4"
                break
            }
        }
    } finally {
        document.getElementById('getlowcsat').textContent = "Чаты с КСАТ<4"
        console.log('Что-то пошло не так.')
    }
}

document.getElementById('getfile').onclick = function () { // функция загрузки файла в виде HTML  lowcsat или всех чатов по комменту
    if (stringChatsWithComment != null || stringChatsWithComment != undefined) {
        var blob = new Blob([stringChatsWithComment], { type: "text/plain" });
        var link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "FoundComments.html");
        link.click();
    } else if (stringChatsWithLowCsat != null || stringChatsWithLowCsat != undefined) {
        var blob = new Blob([stringChatsWithLowCsat], { type: "text/plain" });
        var link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "LowCSAT.html");
        link.click();
    }
}

//Функция парсинга чатов по заданному коменту
let stringChatsWithComment;

document.getElementById('parsechat').onclick = async function () { //Функция парсинга чатов по заданному коменту
    stringChatsWithComment = "";
    let datefrom2 = document.getElementById('dateFrom').value + "T21:00:00.000Z";
    let dateto2 = document.getElementById('dateTo').value + "T20:59:59.059Z";
    document.getElementById('parsechat').textContent = "Идёт поиск"
    try {
        pagecmt = 1
        while (true) {
            test = ''
            await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                "headers": {
                    "content-type": "application/json",
                },
                "body": "{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"" + operatorId + "\"],\"tsFrom\":\"" + datefrom2 + "\",\"tsTo\":\"" + dateto2 + "\",\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":" + pagecmt + ",\"limit\":100}",
                "method": "POST",
            }).then(r => r.json()).then(r => test = r)
            for (let i = 0; i < test.items.length; i++) {
                let flagComment = 0
                await fetch('https://skyeng.autofaq.ai/api/conversations/' + test.items[i].conversationId)
                    .then(response => response.json()).then(data => {
                        for (let j = 0; j < data.messages.length; j++) {
                            if (data.messages[j].tpe == "OperatorComment" && data.messages[j].txt == document.getElementById('commenttosearch').value)
                                flagComment = 1
                        }
                        if (flagComment == 1)
                            stringChatsWithComment += '<span style="color: #00FA9A">&#5129;</span>' + " " + '<a href="https://skyeng.autofaq.ai/logs/' + data.id + '" onclick="" style="color:#1E90FF;" class="chatids">' + data.id + '</a>' + '<span class = "chatswithcomments" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>' + '</br>'

                    })
            }
            if (stringChatsWithComment == "")
                stringChatsWithComment = ' нет таких' + '<br>'

            document.querySelector('#chatcommentsdata').style.display = ""
            document.getElementById('chatcommentsdata').innerHTML = 'Чаты с найденными комментариями' + '<br>' + stringChatsWithComment;

            let chatscontainer = document.querySelectorAll('.chatswithcomments');
            let chatids = document.querySelectorAll('.chatids');
            for (let j = 0; j < chatscontainer.length; j++) {
                chatscontainer[j].onclick = function () {

                    if (document.getElementById('AF_ChatHis').style.display == 'none') {
                        document.getElementById('opennewcat').click();

                        document.getElementById('hashchathis').value = chatids[j].innerText;
                        btn_search_history.click()

                    } else {
                        document.getElementById('hashchathis').value = chatids[j].innerText;
                        btn_search_history.click()
                    }
                }
            }

            if ((test.total / 100) > pagecmt) {
                pagecmt++;
            } else {
                document.getElementById('parsechat').textContent = "Найти по комменту"
                break
            }

        }
    } catch {
        console.log('Что-то пошло не так.')
    }
}

let searchCommentsByEnter = document.querySelector('#commenttosearch'); //по Enter запускает поиск по комментариям
searchCommentsByEnter.addEventListener('keydown', event => {
    if (event.key === "Enter") {
        document.querySelector('#parsechat').click()
    }
})

document.getElementById('gofindit').onclick = async function () { //функция поиска чатов по выставленной тематике с отображениеи и тегов
    let curval = document.getElementById('thematics').value;
    let strcsatnew = document.getElementById('themesdata');
    strcsatnew.textContent = "Загрузка"
    document.getElementById('gofindit').textContent = "Загрузка";
    let datefrom3 = document.getElementById('dateFrom').value + "T21:00:00.000Z";
    let dateto3 = document.getElementById('dateTo').value + "T20:59:59.059Z";
    let count = 0;
    let stringChatsWithComment = ""
    let sctc = 0;
    let page;
    let tagflag;
    let timestmp;
    let tsh;
    let tsm;
    try {
        test = ''
        page = 1;
        while (true) {
            await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                "headers": {
                    "content-type": "application/json",
                },
                "body": "{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"" + operatorId + "\"],\"tsFrom\":\"" + datefrom3 + "\",\"tsTo\":\"" + dateto3 + "\",\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":" + page + ",\"limit\":100}",
                "method": "POST",
            }).then(r => r.json()).then(r => test = r)
            sctc = test.total;
            for (let i = 0; i < test.items.length; i++) {
                let flagComment = 0
                await fetch('https://skyeng.autofaq.ai/api/conversations/' + test.items[i].conversationId)
                    .then(response => response.json()).then(data => {
                        if (data.payload.topicId.value == curval) {
                            if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "request_forwarded_to_outgoing_tp_crm2")
                                tagflag = "Исход ТП1Л CRM2"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "recommendations_given ")
                                tagflag = "Рекомендации даны"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "refusal_of_help")
                                tagflag = "Отказ от помощи"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "request_solved")
                                tagflag = "Задача решена"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "request_solved")
                                tagflag = "Задача решена"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "request_forwarded_to_2l_tp")
                                tagflag = "->ТП2Л"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "request_forwarded_to_channel_qa")
                                tagflag = "Передача в QA"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "request_forwarded_to_development")
                                tagflag = "Задача в разработку"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "request_forwarded_to_sc")
                                tagflag = "Задача передана в SC"
                            else if (data.payload.tags.value.match(/\w+/) != null && data.payload.tags.value.match(/\w+/) != undefined && data.payload.tags.value.match(/\w+/)[0] == "request_forwarded_to_tc")
                                tagflag = "Задача передана в TC"
                            else tagflag = "Нет темы/ др тема/2+"

                            timestmp = new Date(data.messages[0].ts);
                            if ((timestmp.getUTCHours() + 3) < 10)
                                tsh = "0" + (timestmp.getUTCHours() + 3);
                            else tsh = (timestmp.getUTCHours() + 3);

                            if (timestmp.getMinutes() < 10)
                                tsm = "0" + timestmp.getMinutes();
                            else tsm = timestmp.getMinutes();

                            stringChatsWithComment += '<span style="color: #00FA9A">&#5129;</span>' + " " + '<a href="https://skyeng.autofaq.ai/logs/' + data.id + '" onclick="" style="color:#FFA07A;" class = "csatchatids">' + data.id + '</a>' + " " + tagflag + '<span class = "seechat" style="margin-left: 10px; cursor: pointer">👁‍🗨</span>' + " " + tsh + ":" + tsm + '</br>';
                            count++;
                        }
                    })
            }


            if ((test.total / 100) > page) {
                page++;
            } else break;
        }

    } catch (e) {
        console.log('Ошибка ' + e.name + ":" + e.message + "\n" + e.stack);
    }

    document.querySelector('#themesdata').style.display = ""
    strcsatnew.innerHTML = 'Чаты с тематикой: ' + '<br>' + stringChatsWithComment + '<br>' + 'Количество обращений по этой теме: ' + count;
    document.getElementById('gofindit').textContent = "Find";

    let csatcontainer = document.querySelectorAll('.seechat');
    let csatchattids = document.querySelectorAll('.csatchatids');
    for (let j = 0; j < csatcontainer.length; j++) {
        csatcontainer[j].onclick = function () {

            if (document.getElementById('AF_ChatHis').style.display == 'none') {
                document.getElementById('opennewcat').click();
                document.getElementById('hashchathis').value = csatchattids[j].innerText;
                btn_search_history.click()
            } else {
                document.getElementById('hashchathis').value = csatchattids[j].innerText;
                btn_search_history.click()
            }
        }
    }
}

document.getElementById('changetheme').onclick = function () { //функция изменения тематики чата
    let curval = document.getElementById('thematics').value;
    let chatId = document.getElementById('commenttosearch').value;
    if (chatId != "" && chatId != null && chatId != undefined)
        fetch("https://skyeng.autofaq.ai/api/conversation/" + chatId + "/payload", {
            "headers": {
                "content-type": "application/json",
            },
            "body": "{\"conversationId\":\"" + chatId + "\",\"elements\":[{\"name\":\"topicId\",\"value\":\"" + curval + "\"}]}",
            "method": "POST",
            "credentials": "include"
        });
    else createAndShowButton('Введите хэш чата в длинное поле по центру', 'error');
}