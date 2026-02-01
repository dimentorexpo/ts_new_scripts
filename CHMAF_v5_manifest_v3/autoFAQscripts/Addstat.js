// ---------- Разметка окна статистики ----------

var win_Stat = `
<div style="display: flex; width: 550px;">
    <div style="width: 550px;">
        <div style="cursor: grab;">

            <!-- Верхняя панель -->
            <div id="statdata" style="margin: 5px; width: 550px;">
                <button class="mainButton buttonHide" id="hideMeStat">hide</button>
            </div>

            <!-- Даты -->
            <div id="statbox" style="margin: 5px; width: 550px;">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    color: bisque;
                    margin: 5px 10px;
                ">
                    <span>
                        Начальная дата
                        <input type="date"
                            id="dateFrom"
                            name="StartData"
                            class="${exttheme}"
                            style="margin-left: 20px; width: 125px;">
                    </span>

                    <span>
                        Конечная дата
                        <input type="date"
                            id="dateTo"
                            name="EndData"
                            class="${exttheme}"
                            style="margin-left: 20px; width: 125px;">
                    </span>
                </div>
            </div>

            <!-- Поиск по заметкам -->
            <div>
                <input id="commenttosearch" class="${exttheme}" autocomplete="off"
                       placeholder="Слово или фраза для поиска среди закрытых чатов по заметкам"
                       title="Введите слово или фразу для поиска по заметкам в закрытом чате"
                       type="text"
                       style="text-align: center; width: 540px; margin-left: 5px;">

                <!-- Тематики -->
                <select id="thematics" class="${exttheme}" style="margin-left: 150px; margin-top: 10px;">
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

                    <option class="${selecttheme}" value="1966">-ЛК-ОС род</option>
                    <option value="1965">-ЛК-пер,отм ур</option>
                    <option value="1967">-ЛК-профиль</option>
                    <option value="1968">-ЛК-семья</option>
                    <option value="1969">-ЛК чат</option>

                    <option class="${selecttheme}" value="1974">-App Skyeng</option>
                    <option value="1975">-App Teachers</option>
                    <option value="1979">-App Skypro</option>
                    <option value="1976">-App класс</option>
                    <option value="1977">-App решения</option>
                    <option value="1978">-App Skysmart род</option>
                    <option value="1980">-Прочее</option>
                </select>

                <button class="mainButton" id="gofindit" title="Ищет чаты по тематике">Find</button>
                <button class="mainButton" id="changetheme" title="Меняет тематику в хеше чата">Change</button>
            </div>

            <!-- Кнопки статистики -->
            <div style="display:flex; justify-content:space-evenly; margin-top:5px;">
                <button class="mainButton" id="getstatfromperiod" title="Получает статистику">Получить статистику</button>
                <button class="mainButton" id="getlowcsat" title="Чаты с КСАТ < 4">Чаты с КСАТ < 4</button>
                <button class="mainButton" id="parsechat" title="Поиск по комментарию">Найти по комменту</button>
                <button class="mainButton" id="clearall" title="Очистить поля">Очистить</button>
                <button class="mainButton" id="getfile" title="Скачать результаты">🔰</button>
            </div>

            <!-- Вывод данных -->
            <div id="chatcoutnsinfo">
                <span id="sumchatcounttouched" style="margin-left: 5px; color: bisque;"></span><br>
                <span id="sumchatcountclosed" style="margin-left: 5px; color: bisque;"></span>

                <p id="chatsinfoout" style="width:550px; color:bisque; margin-left:5px;"></p>
                <p id="lowCSATcount" style="width:550px; max-height:400px; color:bisque; margin-left:5px; overflow:auto;"></p>
                <p id="themesdata" style="width:550px; max-height:400px; color:bisque; margin-left:5px; overflow:auto;"></p>
                <p id="chatcommentsdata" style="width:550px; max-height:400px; color:bisque; margin-left:5px; overflow:auto;"></p>
            </div>

        </div>
    </div>
</div>
`;

// ---------- Создание окна и базовые хендлеры ----------

const wintStat = createWindow('AF_Stat', 'winTopStat', 'winLeftStat', win_Stat);
hideWindowOnDoubleClick('AF_Stat');
hideWindowOnClick('AF_Stat', 'hideMeStat');

// ---------- Хелперы ----------

function fmtDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// MSK → UTC (Москва = UTC+3)
function toUTC(dateStr, h, m, s, ms) {
    const d = new Date(dateStr + "T00:00:00");
    d.setHours(h - 3, m, s, ms);
    return d.toISOString();
}

// ---------- Очистка ----------

document.getElementById('clearall').onclick = function () {
    document.querySelector('#sumchatcounttouched').innerText = "";
    document.querySelector('#sumchatcountclosed').innerText = "";
    document.querySelector('#chatsinfoout').innerText = "";
    document.querySelector('#lowCSATcount').innerText = "";
    document.querySelector('#lowCSATcount').style.display = "none";
    document.querySelector('#chatcommentsdata').innerText = "";
    document.querySelector('#chatcommentsdata').style.display = "none";
    document.querySelector('#commenttosearch').value = "";
    document.querySelector('#themesdata').innerText = "";
};

// ---------- Открытие окна статистики и установка дат ----------

function getStatsButtonPress() {
    const now = new Date();

    const toDate = new Date(now);          // конечная дата
    const fromDate = new Date(now);        // начальная дата

    document.getElementById("dateFrom").value = fmtDate(fromDate);
    document.getElementById("dateTo").value = fmtDate(toDate);

    document.querySelector('#chatcommentsdata').style.display = "none";
    document.querySelector('#lowCSATcount').style.display = "none";

    const stat = document.getElementById('AF_Stat');
    stat.style.display = stat.style.display === '' ? 'none' : '';
}

// ---------- Получение статистики за период ----------

document.getElementById('getstatfromperiod').onclick = async function () {

    const datefrom = toUTC(
        document.getElementById('dateFrom').value,
        0, 0, 0, 0
    );

    const dateto = toUTC(
        document.getElementById('dateTo').value,
        23, 59, 59, 59
    );

    const strnew = document.getElementById('chatsinfoout');
    const btn = document.getElementById('getstatfromperiod');

    const touchedEl = document.getElementById('sumchatcounttouched');
    const closedEl = document.getElementById('sumchatcountclosed');

    btn.textContent = "Загрузка";
    touchedEl.textContent = "Загрузка";
    closedEl.textContent = "Загрузка";
    strnew.textContent = "Загрузка";

    // 1. Пощупанные чаты
    try {
        const bodyTouched = {
            serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
            mode: "Json",
            participatingOperatorsIds: [operatorId],
            tsFrom: datefrom,
            tsTo: dateto,
            orderBy: "ts",
            orderDirection: "Asc",
            page: 1,
            limit: 1
        };

        const touched = await doOperationsWithHistory(JSON.stringify(bodyTouched));
        touchedEl.textContent = "Количество пощупанных чатов: " + (touched?.total ?? 0);

    } catch (e) {
        touchedEl.textContent = "Ошибка загрузки";
        console.error(e);
    }

    // 2. Закрытые чаты
    try {
        const bodyClosed = {
            serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
            mode: "Json",
            participatingOperatorsIds: [operatorId],
            usedStatuses: ["ClosedByOperator"],
            tsFrom: datefrom,
            tsTo: dateto,
            orderBy: "ts",
            orderDirection: "Asc",
            page: 1,
            limit: 1
        };

        const closed = await doOperationsWithHistory(JSON.stringify(bodyClosed));
        closedEl.textContent = "Количество закрытых чатов: " + (closed?.total ?? 0);

    } catch (e) {
        closedEl.textContent = "Ошибка загрузки";
        console.error(e);
    }

    // 3. КСАТ и чаты, переданные на 2ЛТП
    try {
        let page = 1;
        let csatScore = 0;
        let csatCount = 0;
        const rateStats = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        };
        let chatsWith2line = "";

        while (true) {

            const bodyArchive = {
                serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
                mode: "Json",
                tsFrom: datefrom,
                tsTo: dateto,
                orderBy: "ts",
                orderDirection: "Asc",
                page: page,
                limit: 100
            };

            const response = await fetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                body: JSON.stringify(bodyArchive)
            });

            const test = await response.json();

            if (!test?.items?.length) break;

            for (const item of test.items) {

                let flagCsat = 0;
                let flag2LTP = 0;

                const conv = await doOperationsWithConversations(item.conversationId);

                if (conv.operatorId === operatorId) {
                    flagCsat = 1;

                    if (Array.isArray(conv.messages)) {
                        for (const msg of conv.messages) {
                            if (typeof msg.txt === "string" &&
                                msg.txt.includes("Техподдержка 2-я линия")) {
                                flag2LTP = 1;
                                break;
                            }
                        }
                    }
                }

                if (flagCsat === 1) {
                    const rate = item.stats?.rate?.rate;
                    if (typeof rate === "number") {
                        csatScore += rate;
                        csatCount++;
                        if (rateStats.hasOwnProperty(rate)) {
                            rateStats[rate]++; // ← вот это и есть подсчёт по каждой оценке
                        }
                    }
                }

                if (flag2LTP === 1) {
                    chatsWith2line +=
                        `<span style="color:#00FA9A">&#5129;</span> ` +
                        `<a href="https://skyeng.autofaq.ai/logs/${item.conversationId}" style="color:#1E90FF;" name="itemsChatsId">${item.conversationId}</a>` +
                        `<span name="CheckThroughChatHistory" style="margin-left:10px; cursor:pointer">👁️</span>` + `<br>`;
                }
            }

            if (page < Math.ceil(test.total / 100)) {
                page++;
            } else break;
        }

        if (!chatsWith2line) chatsWith2line = "нет таких<br>";

        const avgCsat = csatCount ? (Math.round((csatScore / csatCount) * 100) / 100) : 0;

        strnew.innerHTML =
            `<div style="margin-bottom:10px;">
            <b>Средняя оценка:</b> ${avgCsat}
        </div>

        <div style="margin-bottom:10px;">
            <b>Распределение оценок:</b><br>
            1 ⭐ — ${rateStats[1]}<br>
            2 ⭐ — ${rateStats[2]}<br>
            3 ⭐ — ${rateStats[3]}<br>
            4 ⭐ — ${rateStats[4]}<br>
            5 ⭐ — ${rateStats[5]}
        </div>

        <div>
            <b>Чаты переданные на 2ЛТП:</b><br>
            ${chatsWith2line}
        </div>`;

        const chatscontainer = document.querySelectorAll('span[name="CheckThroughChatHistory"]');
        const chatids = document.querySelectorAll('a[name="itemsChatsId"]');

        chatscontainer.forEach((el, idx) => {
            el.onclick = function () {
                const id = chatids[idx].innerText;

                if (document.getElementById('AF_ChatHis').style.display == 'none') {
                    document.getElementById('opennewcat').click();
                }
                document.getElementById('hashchathis').value = id;
                btn_search_history.click();
            };
        });


    } catch (e) {
        console.error(e);
        strnew.textContent = "Что-то пошло не так. Сделайте скрин консоли и отправьте в канал chm-dev, пожалуйста";
    }

    btn.textContent = "Получить статистику";
};

// ---------- Низкий КСАТ ----------

let stringChatsWithLowCsat = "";

document.getElementById('getlowcsat').onclick = async function () {

    const datefrom = toUTC(
        document.getElementById('dateFrom').value,
        0, 0, 0, 0
    );

    const dateto = toUTC(
        document.getElementById('dateTo').value,
        23, 59, 59, 59
    );

    const strcsatnew = document.getElementById('lowCSATcount');
    const btn = document.getElementById('getlowcsat');

    strcsatnew.textContent = "Загрузка";
    btn.textContent = "Загрузка";

    try {
        let page = 1;
        stringChatsWithLowCsat = "";

        while (true) {
            const bodyArchive = {
                serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
                mode: "Json",
                tsFrom: datefrom,
                tsTo: dateto,
                orderBy: "ts",
                orderDirection: "Asc",
                page: page,
                limit: 100
            };

            const response = await fetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                body: JSON.stringify(bodyArchive)
            });

            const test = await response.json();

            if (!test?.items?.length) break;

            for (const item of test.items) {
                const conv = await doOperationsWithConversations(item.conversationId);

                if (conv.operatorId !== operatorId) continue;

                const rate = item.stats?.rate?.rate;
                if (typeof rate === "number" && rate < 4) {
                    stringChatsWithLowCsat +=
                        `<span style="color:#00FA9A">&#5129;</span> ` +
                        `<a href="https://skyeng.autofaq.ai/logs/${item.conversationId}" style="color:#1E90FF;" class="csatchatids">${item.conversationId}</a>` +
                        `<span class="lowcsatschats" style="margin-left:10px; cursor:pointer">👁‍🗨</span><br>`;
                }
            }

            if (page < Math.ceil(test.total / 100)) {
                page++;
            } else break;
        }

        if (!stringChatsWithLowCsat) stringChatsWithLowCsat = " нет таких<br>";

        document.querySelector('#lowCSATcount').style.display = "";
        strcsatnew.innerHTML =
            'Чаты с плохими оценками: (открывать в режиме инкогнито!)<br>' +
            stringChatsWithLowCsat;

        const csatcontainer = document.querySelectorAll('.lowcsatschats');
        const csatchattids = document.querySelectorAll('.csatchatids');

        csatcontainer.forEach((el, idx) => {
            el.onclick = function () {
                const id = csatchattids[idx].innerText;

                if (document.querySelector('#hide_or_display').textContent != "свернуть") {
                    hide_or_display.click();
                }
                document.getElementById('chat_id').value = id;
                search.click();
            };
        });

    } catch (e) {
        console.error(e);
    } finally {
        btn.textContent = "Чаты с КСАТ<4";
    }
};

// ---------- Выгрузка файла ----------

document.getElementById('getfile').onclick = function () {
    if (stringChatsWithComment) {
        const blob = new Blob([stringChatsWithComment], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "FoundComments.html";
        link.click();
    } else if (stringChatsWithLowCsat) {
        const blob = new Blob([stringChatsWithLowCsat], { type: "text/plain" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "LowCSAT.html";
        link.click();
    }
};

// ---------- Поиск по комментарию ----------

let stringChatsWithComment = "";

document.getElementById('parsechat').onclick = async function () {

    stringChatsWithComment = "";

    const datefrom = toUTC(
        document.getElementById('dateFrom').value,
        0, 0, 0, 0
    );

    const dateto = toUTC(
        document.getElementById('dateTo').value,
        23, 59, 59, 59
    );

    const btn = document.getElementById('parsechat');
    const out = document.getElementById('chatcommentsdata');
    const searchText = document.getElementById('commenttosearch').value;

    btn.textContent = "Идёт поиск";

    try {
        let page = 1;

        while (true) {
            const bodyToFunc = {
                serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
                mode: "Json",
                participatingOperatorsIds: [operatorId],
                tsFrom: datefrom,
                tsTo: dateto,
                orderBy: "ts",
                orderDirection: "Asc",
                page: page,
                limit: 100
            };

            const test = await doOperationsWithHistory(JSON.stringify(bodyToFunc));

            if (!test?.items?.length) break;

            for (const item of test.items) {
                const conv = await doOperationsWithConversations(item.conversationId);

                let flagComment = 0;

                if (Array.isArray(conv.messages)) {
                    for (const msg of conv.messages) {
                        if (msg.tpe === "OperatorComment" &&
                            msg.txt === searchText) {
                            flagComment = 1;
                            break;
                        }
                    }
                }

                if (flagComment === 1) {
                    stringChatsWithComment +=
                        `<span style="color:#00FA9A">&#5129;</span> ` +
                        `<a href="https://skyeng.autofaq.ai/logs/${conv.id}" style="color:#1E90FF;" class="chatids">${conv.id}</a>` +
                        `<span class="chatswithcomments" style="margin-left:10px; cursor:pointer">👁️</span><br>`;
                }
            }

            if (page < Math.ceil(test.total / 100)) {
                page++;
            } else break;
        }

        if (!stringChatsWithComment) stringChatsWithComment = " нет таких<br>";

        document.querySelector('#chatcommentsdata').style.display = "";
        out.innerHTML = 'Чаты с найденными комментариями<br>' + stringChatsWithComment;

        const chatscontainer = document.querySelectorAll('.chatswithcomments');
        const chatids = document.querySelectorAll('.chatids');

        chatscontainer.forEach((el, idx) => {
            el.onclick = function () {
                const id = chatids[idx].innerText;

                if (document.getElementById('AF_ChatHis').style.display == 'none') {
                    document.getElementById('opennewcat').click();
                }
                document.getElementById('hashchathis').value = id;
                btn_search_history.click();
            };
        });

    } catch (e) {
        console.error(e);
    } finally {
        btn.textContent = "Найти по комменту";
    }
};

// Если нужно — по Enter запускать поиск по комменту
let searchCommentsByEnter = document.querySelector('#commenttosearch');
if (searchCommentsByEnter) {
    searchCommentsByEnter.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            document.getElementById('parsechat').click();
        }
    });
}
