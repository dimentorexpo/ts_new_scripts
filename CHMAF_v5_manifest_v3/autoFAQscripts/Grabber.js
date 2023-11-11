let chosentheme;
let pureArray = [];
let filteredArrayTags = [];
let cleanedarray = [];
let themesarray = []
let avgCsatCountVar;
let countsArray = [];
let countsArrayInterval = [];
let isDescending;
let testarray = [];
// let convDurationArr=[];
var win_Grabber =  // описание элементов окна Grabber
    `<div style="display: flex; width: 800px;">
        <span style="width: 800px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 800px; display:flex; justify-content:space-evenly;" id="grabdata">
                                <button class="mainButton" id="hideMeGrabber" class="buttonHide">hide</button>
                                <button class="mainButton" id="GatherStatByThemes" disabled>🧮</button>
								<div style="width:450px;background: #5f7875;height: 21px;"><div id="progressBarGrabber" style="width: 0%; height: 20px; background-color: #e38118; border: 1px solid black; text-align:center; font-weight:700; color:white;"></div></div>
                        </div>

						<div id="AgregatedDataThemes" style="display:none; width:400px; min-height:100px; max-height:800px; background: rgb(70, 68, 81); position:absolute; top:-1px; left:-400px; overflow-y:auto">
							<div id="ToolsPanel" style="padding:5px;">
								<button class="mainButton" id="HideToolsPanel"class="buttonHide">hide</button>
								<button class="mainButton" id="SwitchToGraph">🔀📊</button>
								<button class="mainButton" id="SwitchToTable">🔀🧮</button>
								<button class="mainButton" id="SwitchToIntervalGraph">🔀📊〰</button>
								<button class="mainButton" id="SwitchToIntervalTable">🔀🧮〰</button>
								<button class="mainButton" id="SaveIntervalCSV" disabled>〰💾CSV</button>
							</div>
							<div id="AgregatedDataOut" style="color: bisque; padding: 5px; text-align: center;"></div>
						</div>

                        <div style="margin: 5px; width: 800px" id="grabbox">
								 <span style="color:bisque; float:center; margin-top:5px; margin-left:10px;">Начальная дата <input type="date" style="color:black; margin-left:20px;  width:125px;" name="FirstData" id="dateFromGrab"></span>
								 <button class="mainButton" style="margin-left:15%" id="dayminus">◀</button>
								 <button class="mainButton" id="dayplus">▶</button>
								 <span style="color:bisque; margin-top:2px; float:right; margin-right:10px; height:28px;">Конечная дата <input type="date" style="color:black; float:right; margin-left:20px; margin-right:10px; width:125px;" name="LastData" id="dateToGrab"</span>
                        </div>

						<div style="display:flex; justify-content: space-evenly; margin-bottom: 5px;">
							<div id="opscontainer" class="filtersList" style="color: bisque; background: #ff7f507d; font-size: 16px; padding: 5px; width: 33%; border-radius: 20px; text-align: center; cursor: pointer; border: 1px solid black;">🔱Фильтр по операторам🦸‍♂️</div>
							<div id="markscontainer" class="filtersList"  style="color: bisque; background: #ff7f507d; font-size: 16px; padding: 5px; width: 33%; border-radius: 20px; text-align: center; cursor: pointer; border: 1px solid black;">🔱Фильтр по оценкам🔢</div>
							<div id="tagscontainer" class="filtersList"  style="color: bisque; background: #ff7f507d; font-size: 16px; padding: 5px; width: 33%; border-radius: 20px; text-align: center; cursor: pointer; border: 1px solid black;">🔱Фильтр по тегам🏷</div>
						</div>

							<div id="activeoperatorsgroup" style="max-height:200px; overflow-y:auto; display: none; grid-template-columns: repeat(3, 1fr); margin-left:5px; border:1px solid lightslategrey;">
							</div>
								<label id="hideselecall" style="display: none; color:#93f5a6; margin-left:5px; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); font-weight: 700;"><input type="checkbox" id="checkthemall"> Select All</label>


							<div id="listofthemarks" style="display: none; color:bisque; border:1px solid lightslategrey; margin-left:5px;">
							  <label><input type="checkbox" name="marks" value="5"> 5</label>
							  <label><input type="checkbox" name="marks" value="4"> 4</label>
							  <label><input type="checkbox" name="marks" value="3"> 3</label>
							  <label><input type="checkbox" name="marks" value="2"> 2</label>
							  <label><input type="checkbox" name="marks" value="1"> 1</label>
							  <label><input type="checkbox" name="marks" value="undefined"> No marks</label>
							  <label id="hideselecallmarks" style="display: none; color:#93f5a6; margin-left:5px; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); font-weight: 700;"><input type="checkbox" id="checkthemallmarks"> Select All</label>
							</div>


							<div id="listofthetags" style="display: none; color:bisque; margin-left:5px;">
								<div style="display: grid; grid-template-columns: repeat(3, 1fr); border:1px solid lightslategrey;">
								  <label><input type="checkbox" name="tagsforfilter" value="server_issues"> Серверные</label>
								  <label><input type="checkbox" name="tagsforfilter" value="untargeted"> Нецелевой</label>
								  <label><input type="checkbox" name="tagsforfilter" value="request_forwarded_to_tc"> Передача в TC</label>
								  <label><input type="checkbox" name="tagsforfilter" value="request_forwarded_to_channel_qa"> Передача в QA</label>
								  <label><input type="checkbox" name="tagsforfilter" value="request_forwarded_to_development"> Передача в разработку</label>
								  <label><input type="checkbox" name="tagsforfilter" value="refusal_of_help"> Отказ от помощи</label>
								  <label><input type="checkbox" name="tagsforfilter" value="request_forwarded_to_outgoing_tp_crm2"> Передача на ТП Исход</label>
								  <label><input type="checkbox" name="tagsforfilter" value="queue"> Очередь</label>
								  <label><input type="checkbox" name="tagsforfilter" value="oo"> Ошибка КЦ</label>
								  <label><input type="checkbox" name="tagsforfilter" value="#configuration"> Комплектации</label>
							  </div>
							  <div style="display: flex;">
								  <button class="mainButton" id="hideselecalltags" style="flex-grow:1">🚀Apply</button>
								  <button class="mainButton" id="SaveToCSVFilteredByTags" style="flex-grow:1">💾CSV</button>
							  </div>
							</div>

						<div style="padding-bottom: 5px;">
								<select id="ThemesToSearch" style="margin-left:150px; margin-top:10px;">
									<option style="background-color:#69b930; text-align: center;  color: white; font-weight: 700;" value="parseallthemes">ALL</option>
									<option style="background-color:coral; text-align: center;  color: white; font-weight: 700;" value="parsenothemes">Without themes</option>
									<option style="background-color:DarkKhaki;" value="skmob">Skyeng👨‍🎓Mob</option>
									<option value="1804">📱‍👨‍🎓Авторизация</option>
									<option value="1805">📱‍👨‍🎓Домашка</option>
									<option value="1806">📱‍👨‍🎓Оплата</option>
									<option value="1807">📱‍👨‍🎓Профиль</option>
									<option value="1808">📱‍👨‍🎓Тренажер слов</option>
									<option value="1809">📱‍👨‍🎓Уроки</option>
									<option value="1810">📱‍👨‍🎓Чат</option>
									<option style="background-color:DarkKhaki;" value="tmob">Teachers👽Mob</option>
                                    <option value="1833">📱👽Авторизация</option>
									<option value="1836">📱👽Виджет расписания</option>
									<option value="1839">📱👽Чат</option>
									<option value="1835">📱👽Виджет финансов</option>
									<option value="1838">📱👽Профиль</option>
									<option value="1840">📱👽3Сторис</option>
									<option value="1837">📱👽Страница расписания</option>
									<option value="1834">📱👽Страница финансов</option>
									<option style="background-color:DarkKhaki;" value="sksmpartapp">Skysmart👪родит</option>
                                    <option value="1884">📱👪Другое</option>
									<option value="1883">📱👪Материалы</option>
									<option value="1880">📱👪Предметы и баланс</option>
									<option value="1881">📱👪Профиль родителя</option>
									<option value="1879">📱👪Расписание</option>
									<option value="1882">📱👪Чат</option>
									<option style="background-color:DarkKhaki;" value="skyproapp">Приложение Skypro</option>
                                    <option value="1904">Skypro App - Виджет входа на урок</option>
									<option style="background-color:DarkKhaki;" value="solanka">Different</option>
                                    <option value="2034">🚫Прочее</option>
									<option value="2030">ⓂSlack-проблемы со входом</option>
									<option value="69">☎Проблемы с телефонией</option>
									<option style="background-color:DarkKhaki;" value="payf">Проблемы с оплатой</option>
                                    <option value="1077">💳Вина школы</option>
									<option value="1658">💳Консультация</option>
									<option value="1661">💳Карта У</option>
									<option value="1662">💳Сбой оплаты</option>
									<option value="1660">💳Подписки</option>
									<option style="background-color:DarkKhaki;" value="hwtr">Проблемы с ДЗ</option>
                                    <option value="1744">💼Контент</option>
									<option value="1745">💼Оценка</option>
									<option value="1746">💼Словарь</option>
									<option value="1747">💼Упражнение</option>
									<option style="background-color:DarkKhaki;" value="svyaz">Проблемы связь</option>
                                    <option value="1581">💻ОС/брауз ниж мин</option>
									<option value="1589">💻Консультация работы связи</option>
									<option value="1582">💻Корп сеть/ус-во</option>
									<option value="1583">💻ОС/браузер</option>
                                    <option value="1586">💻ПК</option>
									<option value="1584">💻Гарнитура</option>
									<option value="1585">💻Камера</option>
									<option value="1580">💻Блокировалось ПО</option>
									<option value="1594">💻Не подерж браузер</option>
									<option value="1595">💻Не подерж камера гарнитура пк</option>
                                    <option value="1593">💻Сбой платф</option>
									<option value="1592">💻Сб задерж кам</option>
									<option value="1587">💻Инет ниж мин</option>
									<option value="1590">💻Сб плат блок прерыв связь</option>
									<option value="1588">💻Хар ниж мин</option>
									<option value="1591">💻Сб задерж звука</option>
									<option style="background-color:DarkKhaki;" value="lkp">Проблемы ЛКП</option>
                                    <option value="1721">👽ЛКП - Группа</option>
									<option value="1714">👽ЛКП - Чат</option>
									<option value="1719">👽ЛКП - Финансы</option>
									<option value="1717">👽ЛКП - Упражнения</option>
                                    <option value="1712">👽ЛКП - Карта роста</option>
									<option value="1716">👽ЛКП - Настройки</option>
									<option value="1718">👽ЛКП - Перерыв</option>
									<option value="1715">👽ЛКП - Профиль</option>
									<option value="1720">👽ЛКП - Работы на проверку</option>
									<option value="1713">👽ЛКП - Расписание</option>
									<option style="background-color:DarkKhaki;" value="lku">Проблемы ЛКУ</option>
                                    <option value="1708">👨‍🎓ЛКУ - Чат</option>
									<option value="1710">👨‍🎓ЛКУ - Профиль</option>
									<option value="1706">👨‍🎓ЛКУ - Виджет прогресса</option>
									<option value="1707">👨‍🎓ЛКУ - История занятий/портфолио</option>
                                    <option value="1709">👨‍🎓ЛКУ - Семья</option>
									<option value="1711">👨‍🎓ЛКУ - Настройки</option>
									<option value="1705">👨‍🎓ЛКУ - Навыки</option>
									<option value="1704">👨‍🎓ЛКУ - Грамматика</option>
									<option style="background-color:DarkKhaki;" value="problvh">Проблемы вход</option>
                                    <option value="1632">🔐Не привяз почт/тел</option>
									<option value="1635">🔐Данные для входа</option>
									<option value="1634">🔐Сброс пароля</option>
									<option value="1631">🔐Консультация авторизации</option>
                                    <option value="1633">🔐Сбой авторизации</option>
									<option style="background-color:DarkKhaki;" value="problpodk">Проблемы подкл</option>
                                    <option value="1624">🔌Истекла подписка</option>
									<option value="1627">🔌Консультациия</option>
									<option value="1629">🔌Нет кнопки входа</option>
									<option value="1628">🔌У не в ГУ</option>
                                    <option value="1625">🔌Ур в др вр</option>
									<option value="1626">🔌У отпуск</option>
                                    <option value="1630">🔌Неактивна кнопка входа</option>
									<option style="background-color:DarkKhaki;" value="lesfunc">Функционал урок</option>
                                    <option value="1772">👨‍🎓STT</option>
									<option value="1773">👽TTT</option>
									<option value="1767">📎Вложения</option>
									<option value="1771">🖥Демонстрация экр</option>
                                    <option value="1768">⌨Доска</option>
									<option value="2037">📝Заметки</option>
                                    <option value="1775">💨Отправка ДЗ на уроке</option>
                                    <option value="1770">🔀Перекл материалов</option>
									<option value="1776">🎵/📽Ауд/вид плеер</option>
                                    <option value="1769">📙Словарь на уроке</option>
                                    <option value="1774">🎯Упражнения на уроке</option>
									<option style="background-color:DarkKhaki;" value="feedbk">Отзывы и пожел</option>
                                    <option value="1970">💭Vim-контент</option>
									<option value="1971">💭Vim-оценка</option>
									<option value="1972">💭Vim-словарь</option>
									<option value="1973">💭Vim-упражнения</option>
                                    <option value="1966">💭ЛК-ОС род</option>
									<option value="1965">💭ЛК-перенос отмена ур</option>
                                    <option value="1967">💭ЛК-профиль</option>
                                    <option value="1968">💭ЛК-семья</option>
									<option value="1969">💭ЛК чат</option>
                                    <option value="1974">💭App Skyeng</option>
                                    <option value="1975">💭App Teachers</option>
                                    <option value="1979">💭App Skypro</option>
                                    <option value="1976">💭App класс</option>
									<option value="1977">💭App решения</option>
                                    <option value="1978">💭App Skysmart род</option>
                                    <option value="1980">💭Прочее</option>
									<option style="background-color:DarkKhaki;" value="difCCthemes">Разные тематики с КЦ</option>
									<option value="479">💰КЦ-Проблемы с оплатой</option>
									<option value="63">💻КЦ-Нет видео или звука</option>
									<option value="68">📍КЦ-Другие тех проблемы</option>
									<option value="66">💼КЦ-ДЗ и вирт класс</option>
									<option value="109">💼КЦ-Сброс</option>
									<option value="73">🏝КЦ-Отпуск У</option>
									<option value="107">📱КЦ-Проч обр по Skyeng App</option>
									<option value="1249">💋КЦ-Talks</option>
                                    </select>
                               <button class="mainButton" style=" title="ищет чаты по тематике" id="stargrab">Find</button>
							   	<button class="mainButton" id="webtoCSV">💾 Download CSV</button>
						</div>
						</span>

						<div id="grabbedchats" style="margin-left: 15px;">
							 <p id="themesgrabbeddata" style="width:800px; max-height:400px; color:bisque; margin-left:5px; overflow:auto"></p>
							 <p id="foundcount"></p>
							 <p id="avgCsatCount"></p>
							 <p id="avgSLAClosedData"></p>
							 <div id="CSATFilterField" style="display:none; position: absolute; top: 300px; left: 820px; background: #464451; color:bisque; width: 95px;">
							 <span id="hidefilter" style="cursor:pointer; border: 1px solid; padding: 2px; color:black; font-weight:700; background: tan;">🌀CSAT filter</span> <br>
							  <label><input type="checkbox" name="marksFilter" value="5"> 5</label> <br>
							  <label><input type="checkbox" name="marksFilter" value="4"> 4</label> <br>
							  <label><input type="checkbox" name="marksFilter" value="3"> 3</label> <br>
							  <label><input type="checkbox" name="marksFilter" value="2"> 2</label> <br>
							  <label><input type="checkbox" name="marksFilter" value="1"> 1</label> <br>
							  <label><input type="checkbox" name="marksFilter" value="-"> No marks</label> <br>
							  <button class="mainButton" id="downloadfilteredtocsv" style="margin-left: 25%; margin-bottom: 10px;">💾CSV</button>
							 </div>
						</div>
        </span>
</div>`;

if (localStorage.getItem('winTopGrabber') == null) { // началоное положение окна статистики (если не задано ранее)
    localStorage.setItem('winTopGrabber', '120');
    localStorage.setItem('winLeftGrabber', '295');
}

let wintGrabber = document.createElement('div'); // создание окна работы со Grabber
document.body.append(wintGrabber);
wintGrabber.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopGrabber') + 'px; left: ' + localStorage.getItem('winLeftGrabber') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintGrabber.style.display = 'none';
wintGrabber.setAttribute('id', 'AF_Grabber');
wintGrabber.innerHTML = win_Grabber;

wintGrabber.onmousedown = function (event) {
    if (checkelementtype(event)) {
        let startX = event.clientX;
        let startY = event.clientY;
        let elemLeft = wintGrabber.offsetLeft;
        let elemTop = wintGrabber.offsetTop;

        function onMouseMove(event) {
            if (!(event.buttons & 1)) {
                onMouseUp();
                return;
            }
            let deltaX = event.clientX - startX;
            let deltaY = event.clientY - startY;

            wintGrabber.style.left = (elemLeft + deltaX) + "px";
            wintGrabber.style.top = (elemTop + deltaY) + "px";

            localStorage.setItem('winTopGrabber', String(elemTop + deltaY));
            localStorage.setItem('winLeftGrabber', String(elemLeft + deltaX));
        }

        document.addEventListener('mousemove', onMouseMove);

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mouseup', onMouseUp);
    }
};
// прекращение изменения позиции окна работы с Grabber

// document.getElementById('AF_Grabber').ondblclick = function (a) { // скрытие окна работы со Grabber
// if (checkelementtype(a)) { document.getElementById('AF_Grabber').style.display = 'none'; }
// }

document.getElementById('hideMeGrabber').onclick = function () { // скрытие окна работы со Grabber
    if (document.getElementById('AF_Grabber').style.display == '')
        document.getElementById('AF_Grabber').style.display = 'none'
}

document.getElementById('HideToolsPanel').onclick = function () {
    if (document.getElementById('AgregatedDataThemes').style.display == '') {
        document.getElementById('AgregatedDataThemes').style.display = 'none'
        document.getElementById('themesgrabbeddata').style.display = ''
    }
}

document.getElementById('GatherStatByThemes').onclick = function () {
    if (document.getElementById('AgregatedDataThemes').style.display == 'none') {
        document.getElementById('AgregatedDataThemes').style.display = ''
    } else document.getElementById('AgregatedDataThemes').style.display = 'none'
}

//Функция очищения выведенной информации после поиска
document.getElementById('clearall').onclick = function () {

}

async function getlistofopers() {
    await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState").then(r => r.json()).then(r => dataInfo = r)

    let tpopers = dataInfo.onOperator
        .map(el => el.groupId === "c7bbb211-a217-4ed3-8112-98728dc382d8" ? ({ id: el.operator.id, name: el.operator.fullName }) : el.groupId === "8266dbb1-db44-4910-8b5f-a140deeec5c0" ? ({ id: el.operator.id, name: el.operator.fullName }) : null)
        .filter(el => el !== null)
        .filter(el => /ТП[^0-9]/.test(el.name));

    activeoperatorsgroup.innerHTML = ''
    for (let i = 0; i < tpopers.length; i++) {
        if (tpopers[i].name != 'ТП/ОКК-Березкин Александр' && tpopers[i].name != 'ТП-Борисов Евгений(СRM2)' && tpopers[i].name != 'ТП-Нагиев Эльдар' && tpopers[i].name != 'ТП-Стажер обучения' && tpopers[i].name != 'ТП-Пащенко Андрей') {
            activeoperatorsgroup.innerHTML += `<span><label><input type="checkbox" name="chekforsearch"><span style="color:bisque;"  name="listofops" value='${tpopers[i].id}'>${tpopers[i].name}</span></label></span>`
        }
    }

    let listofchkbx = document.getElementsByName('chekforsearch')
    for (let i = 0; i < listofchkbx.length; i++) {
        if (!listofchkbx[i].checked) {
            listofchkbx[i].checked = true;
        }
    }
    document.getElementById('checkthemall').checked = true


    let listofchkbxmarks = document.getElementsByName('marks')
    for (let i = 0; i < listofchkbxmarks.length; i++) {
        if (!listofchkbxmarks[i].checked) {
            listofchkbxmarks[i].checked = true;
        }
    }
    document.getElementById('checkthemallmarks').checked = true

}

function calcAvgCsat() {
    let csatvalcontainer = document.getElementsByName('CSATvalue');
    let arrayoffoundmarks = [];

    for (let i = 0; i < csatvalcontainer.length; i++) {
        const cellValue = csatvalcontainer[i].textContent;
        const selectedValues = getSelectedCheckboxValues();

        if (selectedValues.length === 0) {
            // Если ни один чекбокс не выбран, добавляем все значения в массив
            if (cellValue !== '-') {
                arrayoffoundmarks.push(Number(cellValue));
            }
        } else {
            // Если выбраны чекбоксы, проверяем значения ячейки на соответствие выбранным значениям
            if (selectedValues.includes(cellValue) && cellValue !== '-') {
                arrayoffoundmarks.push(Number(cellValue));
            }
        }
    }

    let sumcsat = 0;
    let countcsat = 0;

    arrayoffoundmarks.forEach((element) => {
        if (typeof element === "number") {
            sumcsat += element;
            countcsat++;
        }
    });

    avgCsatCountVar = sumcsat / countcsat;

    document.getElementById('avgCsatCount').innerHTML = '<span style="background: #2960ae; padding: 5px; color: floralwhite; font-weight: 700; border-radius: 10px;">' + "Средний CSAT по выгрузке: " + avgCsatCountVar.toFixed(2) + '</span>'
}

function calcAvgSLACompleted() {
    let SLACompContainer = document.getElementsByName('SLACompletedValue')
    let arrayOfOuttimedSLA = [];

    for (let i = 0; i < SLACompContainer.length; i++) {
        const cellValue = SLACompContainer[i].textContent;

        if (SLACompContainer[i].textContent == "0") {
            arrayOfOuttimedSLA++
        }
    }
    document.getElementById('avgSLAClosedData').innerHTML = '<span style="background: #bb680f; padding: 5px; color: floralwhite; font-weight: 700; border-radius: 10px;">' + "SLA закрытия: " + (((pureArray.length - arrayOfOuttimedSLA) / pureArray.length) * 100).toFixed(1) + '%' + '</span>'
}

function saveFilteredTableCSV() {
    let nwtable = document.getElementById("TableGrabbed");
    let csvData = [];

    for (let i = 0; i < nwtable.rows.length; i++) {
        if (nwtable.rows[i].style.display !== 'none') {
            let rowData = [];
            for (let j = 0; j < nwtable.rows[i].cells.length; j++) {
                // Преобразование текстового содержимого ячейки в строку CSV
                rowData.push('"' + nwtable.rows[i].cells[j].textContent.replace(/"/g, '""') + '"');
            }
            csvData.push(rowData.join(","));
        }
    }

    let csvString = csvData.join("\n");
    let csvContent = "\uFEFF" + csvString; // Добавление BOM для поддержки кириллицы

    let downloadLink = document.createElement("a");
    downloadLink.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    downloadLink.download = "filtered_table.csv";

    downloadLink.click();
}

function getopenGrabberButtonPress() {
    let parseThemesAndVals = document.getElementById('ThemesToSearch')
    for (let i = 0; i < parseThemesAndVals.length; i++) {
        themesarray.push({ value: parseThemesAndVals[i].value, ThemeName: parseThemesAndVals[i].textContent });
    }

    if (document.getElementById('AF_Grabber').style.display == '')
        document.getElementById('AF_Grabber').style.display = 'none'
    else document.getElementById('AF_Grabber').style.display = ''

    let getcurdate = new Date();
    let year = getcurdate.getFullYear();
    let month = String(getcurdate.getMonth() + 1).padStart(2, "0");
    let day = String(getcurdate.getDate()).padStart(2, "0");

    let lastDayOfPrevMonth = new Date(year, getcurdate.getMonth(), 0).getDate();
    let fromDate = new Date(year, getcurdate.getMonth(), day - 1);
    let toDate = new Date(year, getcurdate.getMonth(), day);

    if (day === "01") {
        // set date range to previous month
        dateFromGrab = new Date(year, getcurdate.getMonth() - 1, lastDayOfPrevMonth);
        dateToGrab = new Date(year, getcurdate.getMonth(), 1);
    }

    document.getElementById("dateFromGrab").value = `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}`;
    document.getElementById("dateToGrab").value = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;

    getlistofopers()

}

document.getElementById('checkthemall').onclick = function () {
    let listofchkbx = document.getElementsByName('chekforsearch')
    for (let i = 0; i < listofchkbx.length; i++) {
        if (listofchkbx[i].checked == true) {
            listofchkbx[i].checked = false;
            document.getElementById('checkthemall').checked = false
        } else {
            listofchkbx[i].checked = true;
            document.getElementById('checkthemall').checked = true
        }
    }
}

document.getElementById('checkthemallmarks').onclick = function () {
    let listofchkbxmarks = document.getElementsByName('marks')
    for (let i = 0; i < listofchkbxmarks.length; i++) {
        if (listofchkbxmarks[i].checked == true) {
            listofchkbxmarks[i].checked = false;
            document.getElementById('checkthemallmarks').checked = false
        } else {
            listofchkbxmarks[i].checked = true;
            document.getElementById('checkthemallmarks').checked = true
        }
    }
}

// Функция для получения выбранных значений чекбоксов оценок
function getSelectedCheckboxValues() {
    const checkboxes = document.querySelectorAll('input[name="marksFilter"]:checked');
    const selectedValues = [];

    checkboxes.forEach(function (checkbox) {
        selectedValues.push(checkbox.value);
    });

    return selectedValues;
}

// Функция для получения выбранных значений чекбоксов тегов
function getSelectedCheckboxTagsValues() {
    const checkboxes = document.querySelectorAll('input[name="tagsforfilter"]:checked');
    const selectedValues = [];

    checkboxes.forEach(function (checkbox) {
        selectedValues.push(checkbox.value);
    });

    return selectedValues;
}

function buildTable() {
    document.getElementById('AgregatedDataThemes').style.width = "400px"
    document.getElementById('themesgrabbeddata').style.display = ''
    const tableContainer = document.getElementById('AgregatedDataOut');
    tableContainer.innerHTML = ''; // Очищаем содержимое контейнера перед построением таблицы

    // Создаем таблицу
    const table = document.createElement('table');

    // Создаем заголовок таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['№п.п', 'Тематика', 'Количество'];

    headers.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style = "text-align: center; font-weight: 700; background: dimgrey; border: 1px solid black; padding: 5px; position: sticky; top: 0px;"
        if (index === 2) {
            th.style = "text-align: center; font-weight: 700; background: dimgrey; border: 1px solid black; padding: 5px; position: sticky; top: 0px; cursor:pointer"
            th.title = "При клике сортирует список либо по возрастанию либо по убыванию, повторый клик также изменяет направление сортировки!"
            th.addEventListener('click', sortTableByCount);
        }
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Создаем тело таблицы
    const tbody = document.createElement('tbody');

    countsArray.forEach((item, index) => {
        const row = document.createElement('tr');
        const numberCell = document.createElement('td');
        const themeCell = document.createElement('td');
        const countCell = document.createElement('td');

        numberCell.textContent = (index + 1).toString();
        themeCell.textContent = item.ThemeValue;
        countCell.textContent = item.Count.toString();

        row.appendChild(numberCell);
        row.appendChild(themeCell);
        row.appendChild(countCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Добавляем таблицу в контейнер
    tableContainer.appendChild(table);
}

function drawGraph() {
    document.getElementById('AgregatedDataThemes').style.width = "1200px"
    document.getElementById('themesgrabbeddata').style.display = 'none'
    const themeValues = countsArray.map(item => item.ThemeValue);
    const counts = countsArray.map(item => item.Count);

    // Создаем контейнер для графика
    const graphContainer = document.getElementById('AgregatedDataOut');
    graphContainer.innerHTML = ''; // Очищаем содержимое контейнера перед отрисовкой графика
    const canvas = document.createElement('canvas');
    graphContainer.appendChild(canvas);

    // Отрисовываем график
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: themeValues,
            datasets: [
                {
                    label: 'Количество',
                    data: counts,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'bisque' // Цвет текста по оси Y
                    }
                },
                x: {
                    ticks: {
                        color: 'bisque' // Цвет текста по оси X
                    }
                }
            }
        }
    });
}

function buildIntervalTable() {

    const intervals = [
        '07:00 - 07:30',
        '07:30 - 08:00',
        '08:00 - 08:30',
        '08:30 - 09:00',
        '09:00 - 09:30',
        '09:30 - 10:00',
        '10:00 - 10:30',
        '10:30 - 11:00',
        '11:00 - 11:30',
        '11:30 - 12:00',
        '12:00 - 12:30',
        '12:30 - 13:00',
        '13:00 - 13:30',
        '13:30 - 14:00',
        '14:00 - 14:30',
        '14:30 - 15:00',
        '15:00 - 15:30',
        '15:30 - 16:00',
        '16:00 - 16:30',
        '16:30 - 17:00',
        '17:00 - 17:30',
        '17:30 - 18:00',
        '18:00 - 18:30',
        '18:30 - 19:00',
        '19:00 - 19:30',
        '19:30 - 20:00',
        '20:00 - 20:30',
        '20:30 - 21:00',
        '21:00 - 21:30',
        '21:30 - 22:00',
        '22:00 - 22:30',
        '22:30 - 23:00',
        '23:00 - 23:30',
        '23:30 - 00:00'
    ];

    const result = payloadarray.reduce((acc, obj) => {
        const themeValue = obj.ThemeValue;
        const timeStamp = obj.timeStamp;
        const timeKey = moment(timeStamp, 'DD.MM.YYYY, HH:mm').format('HH:mm');
        const interval = intervals.find((interval) => {
            const [start, end] = interval.split(' - ');
            return moment(timeKey, 'HH:mm').isBetween(moment(start, 'HH:mm'), moment(end, 'HH:mm'), null, '[]');
        });

        if (interval) {
            acc.counts[interval] = acc.counts[interval] || {};
            acc.counts[interval][themeValue] = (acc.counts[interval][themeValue] || 0) + 1;
        }

        acc.uniqueValues.add(themeValue);
        return acc;
    }, { uniqueValues: new Set(), counts: {} });

    const uniqueValuesArray = Array.from(result.uniqueValues);
    countsArrayInterval = Object.entries(result.counts).flatMap(([interval, counts]) => {
        return Object.entries(counts).map(([themeValue, count]) => ({
            TimeStamp: interval,
            ThemeValue: themeValue,
            Count: count,
        }));
    });

    countsArrayInterval.sort((a, b) => {
        const timeA = a.TimeStamp.split(" - ")[0];
        const timeB = b.TimeStamp.split(" - ")[0];
        return moment(timeA, "HH:mm").diff(moment(timeB, "HH:mm"));
    });

    document.getElementById('AgregatedDataThemes').style.width = "400px"
    document.getElementById('themesgrabbeddata').style.display = ''
    const tableContainer = document.getElementById('AgregatedDataOut');
    tableContainer.innerHTML = ''; // Очищаем содержимое контейнера перед построением таблицы

    // Создаем таблицу
    const table = document.createElement('table');

    // Создаем заголовок таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['№п.п', 'Тематика', 'Интервал', 'Количество'];

    headers.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style = "text-align: center; font-weight: 700; background: dimgrey; border: 1px solid black; padding: 5px; position: sticky; top: 0px;"
        if (headerText === 'Интервал') {
            th.style.cursor = 'pointer';
            th.title = "При клике сортирует список либо по возрастанию либо по убыванию, повторный клик также изменяет направление сортировки!";
            th.addEventListener('click', sortTableByInterval);
        }
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Создаем тело таблицы
    const tbody = document.createElement('tbody');

    countsArrayInterval.forEach((item, index) => {
        const row = document.createElement('tr');
        const numberCell = document.createElement('td');
        const themeCell = document.createElement('td');
        const intervalCell = document.createElement('td');
        const countCell = document.createElement('td');

        numberCell.textContent = (index + 1).toString();
        themeCell.textContent = item.ThemeValue;
        intervalCell.textContent = item.TimeStamp;
        countCell.textContent = item.Count.toString();

        row.appendChild(numberCell);
        row.appendChild(themeCell);
        row.appendChild(intervalCell);
        row.appendChild(countCell);
        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Добавляем таблицу в контейнер
    tableContainer.appendChild(table);
    document.getElementById('SaveIntervalCSV').removeAttribute('disabled')

}

function sortTableByCount() {
    countsArray.sort((a, b) => {
        if (isDescending) {
            return b.Count - a.Count;
        } else {
            return a.Count - b.Count;
        }
    });

    isDescending = !isDescending; // Инвертируем флаг сортировки

    buildTable(); // Перестраиваем таблицу с новым порядком
}

function sortTableByInterval() {
    countsArrayInterval.sort((a, b) => {
        const timeA = a.TimeStamp.split(" - ")[0];
        const timeB = b.TimeStamp.split(" - ")[0];
        return moment(timeA, "HH:mm").diff(moment(timeB, "HH:mm"));
    });

    buildIntervalTable();
}

function drawIntervalGraph() {
    const intervals = [
        '07:00 - 07:30',
        '07:30 - 08:00',
        '08:00 - 08:30',
        '08:30 - 09:00',
        '09:00 - 09:30',
        '09:30 - 10:00',
        '10:00 - 10:30',
        '10:30 - 11:00',
        '11:00 - 11:30',
        '11:30 - 12:00',
        '12:00 - 12:30',
        '12:30 - 13:00',
        '13:00 - 13:30',
        '13:30 - 14:00',
        '14:00 - 14:30',
        '14:30 - 15:00',
        '15:00 - 15:30',
        '15:30 - 16:00',
        '16:00 - 16:30',
        '16:30 - 17:00',
        '17:00 - 17:30',
        '17:30 - 18:00',
        '18:00 - 18:30',
        '18:30 - 19:00',
        '19:00 - 19:30',
        '19:30 - 20:00',
        '20:00 - 20:30',
        '20:30 - 21:00',
        '21:00 - 21:30',
        '21:30 - 22:00',
        '22:00 - 22:30',
        '22:30 - 23:00',
        '23:00 - 23:30',
        '23:30 - 00:00'
    ];

    const result = payloadarray.reduce((acc, obj) => {
        const themeValue = obj.ThemeValue;
        const timeStamp = obj.timeStamp;
        const timeKey = moment(timeStamp, 'DD.MM.YYYY, HH:mm').format('HH:mm');
        const interval = intervals.find((interval) => {
            const [start, end] = interval.split(' - ');
            return moment(timeKey, 'HH:mm').isBetween(moment(start, 'HH:mm'), moment(end, 'HH:mm'), null, '[]');
        });

        if (interval) {
            acc.counts[interval] = acc.counts[interval] || {};
            acc.counts[interval][themeValue] = (acc.counts[interval][themeValue] || 0) + 1;
        }

        acc.uniqueValues.add(themeValue);
        return acc;
    }, { uniqueValues: new Set(), counts: {} });

    const uniqueValuesArray = Array.from(result.uniqueValues);
    countsArrayInterval = Object.entries(result.counts).flatMap(([interval, counts]) => {
        return Object.entries(counts).map(([themeValue, count]) => ({
            TimeStamp: interval,
            ThemeValue: themeValue,
            Count: count,
        }));
    });

    countsArrayInterval.sort((a, b) => {
        const timeA = a.TimeStamp.split(" - ")[0];
        const timeB = b.TimeStamp.split(" - ")[0];
        return moment(timeA, "HH:mm").diff(moment(timeB, "HH:mm"));
    });

    document.getElementById('AgregatedDataThemes').style.width = "1200px";
    document.getElementById('themesgrabbeddata').style.display = 'none';

    const themeValues = uniqueValuesArray;
    const datasets = themeValues.map((theme, index) => {
        const counts = intervals.map(interval => {
            const countObj = countsArrayInterval.find(item => item.TimeStamp.startsWith(interval) && item.ThemeValue === theme);
            return countObj ? countObj.Count : 0;
        });

        const color = `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;

        return {
            label: theme,
            data: counts,
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            pointRadius: 4, // Hide data points for a smooth line
        };
    });

    const graphContainer = document.getElementById('AgregatedDataOut');
    graphContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    graphContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'line', // Set the chart type to 'line'
        data: {
            labels: intervals,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'bisque',
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                x: {
                    ticks: {
                        color: 'bisque',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'LightSalmon',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            }
        }
    });

    document.getElementById('SaveIntervalCSV').removeAttribute('disabled')
}

function saveToCSVInterval() {
    let csvContent = "\uFEFF"; // Добавление BOM символа для корректной кодировки UTF-8

    // Добавление заголовков столбцов
    csvContent += "TimeStamp,ThemeValue,Count\n";

    // Добавление данных
    countsArrayInterval.forEach(item => {
        const { TimeStamp, ThemeValue, Count } = item;
        const row = `${TimeStamp},${ThemeValue},${Count}\n`;
        csvContent += row;
    });

    // Создание элемента ссылки для скачивания CSV-файла
    const downloadLink = document.createElement("a");
    downloadLink.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    downloadLink.setAttribute("download", "data.csv");
    document.body.appendChild(downloadLink);

    // Нажатие на ссылку для скачивания файла
    downloadLink.click();

    // Удаление ссылки из DOM
    document.body.removeChild(downloadLink);
}

let chekopersarr = [];
let newarray = [];
let arrofthemes = [];
let payloadarray = [];
let chatswithmarksarray = [];
let checkmarksarr = [];
let operstagsarray = [];
document.getElementById('stargrab').onclick = async function () {


    if (document.getElementById('CSATFilterField').style.display == "") {
        document.getElementById('CSATFilterField').style.display = "none"
    }

    document.getElementById('GatherStatByThemes').setAttribute('disabled', '')

    document.getElementById('foundcount').innerHTML = ''
    document.getElementById('avgCsatCount').innerHTML = ''
    document.getElementById('avgSLAClosedData').innerHTML = ''
    operstagsarray = [];
    arrofthemes = [];
    const timeOptions = {
        timeZone: 'Europe/Moscow',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
        // second: 'numeric'
    };

    // document.getElementById('themesgrabbeddata').innerHTML = '';
    document.getElementById('themesgrabbeddata').innerHTML = '⏳ Загрузка...'

    //time and date block
    const padStart = (string, targetLength, padString) => {
        return String(string).padStart(targetLength, padString);
    }

    const getFormattedDate = (date) => {
        const year = date.getFullYear();
        const month = padStart(date.getMonth() + 1, 2, '0');
        const day = padStart(date.getDate(), 2, '0');
        return `${year}-${month}-${day}T21:00:00.000z`;
    }

    const dateFromGrabInput = document.getElementById("dateFromGrab");
    const selectedDate = new Date(dateFromGrabInput.value);
    const leftDateFromGrab = getFormattedDate(selectedDate);

    const dateToGrabInput = document.getElementById("dateToGrab");
    const selectedEndDate = new Date(dateToGrabInput.value);
    const rightDateToGrab = `${selectedEndDate.getFullYear()}-${padStart(selectedEndDate.getMonth() + 1, 2, '0')}-${padStart(selectedEndDate.getDate(), 2, '0')}T20:59:59.059z`;

    const now = new Date();

    // end of time and date


    chosentheme = '';
    let selTheme = document.getElementById('ThemesToSearch').options
    for (let i = 0; i < selTheme.length; i++) {
        if (selTheme[i].selected == true) {
            chosentheme = selTheme[i].value
        }
    }

    let spisochek = document.getElementsByName('listofops')
    let namespisochek = [];
    let cheklist = document.getElementsByName('chekforsearch')
    let markscheklist = document.getElementsByName('marks')
    let opgrdata;
    let tmponlyoperhashes = [];

    checkmarksarr = [];
    for (let i = 0; i < markscheklist.length - 1; i++) {
        if (markscheklist[i].checked == true) {
            checkmarksarr.push(Number(markscheklist[i].getAttribute('value')))
        }
    }

    chekopersarr = [];
    for (let i = 0; i < cheklist.length; i++) {
        if (cheklist[i].checked == true) {
            chekopersarr.push(spisochek[i].getAttribute('value'))
            namespisochek.push(spisochek[i].textContent)
        }
    }

    payloadarray = [];
    chatswithmarksarray = [];

    document.getElementById('progressBarGrabber').innerHTML = ''
    document.getElementById('progressBarGrabber').style.width = '0'

    let progressBar = document.getElementById("progressBarGrabber");
    let currentWidth = 0;
    let step = 100 / chekopersarr.length;

    for (let i = 0; i < chekopersarr.length; i++) {
        tmponlyoperhashes = [];
        page = 1;
        do {
            await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                headers: {
                    "content-type": "application/json",
                },
                body: `{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"participatingOperatorsIds\":[\"${chekopersarr[i]}\"],\"tsFrom\":\"${leftDateFromGrab}\",\"tsTo\":\"${rightDateToGrab}\",\"orderBy\":\"ts\",\"orderDirection\":\"Asc\",\"page\":${page},\"limit\":100}`,
                method: "POST",
                mode: "cors",
                credentials: "include"
            })
                .then(r => r.json()).
                then(r => opgrdata = r)

            // newarray = [];
            // newarray = [...opgrdata.items].map(el => el.conversationId)

            const items = opgrdata.items;
            for (let k = 0; k < items.length; k++) {
                const el = items[k];
                if (markscheklist[5].checked == false) {
                    if (
                        el.stats.rate.rate !== undefined &&
                        checkmarksarr.includes(el.stats.rate.rate)
                    ) {
                        const obj = {
                            ConvId: el.conversationId,
                            Rate: el.stats.rate.rate
                        };
                        chatswithmarksarray.push(obj);
                    }
                } else {
                    if (
                        checkmarksarr.includes(el.stats.rate.rate) || el.stats.rate.rate == undefined
                    ) {
                        const obj = {
                            ConvId: el.conversationId,
                            Rate: el.stats.rate.rate
                        };
                        chatswithmarksarray.push(obj);
                    }
                }

                if (items[k].operatorId == chekopersarr[i]) {
                    tmponlyoperhashes.push({ HashId: el.conversationId, Duration: el.stats.conversationDuration })
                }
            }

            for (let j = 0; j < tmponlyoperhashes.length; j++) {
                const conversationId = tmponlyoperhashes[j].HashId;
                const matchedItem = chatswithmarksarray.find(item => item.ConvId === conversationId);

                if (matchedItem) {
                    const csat = matchedItem.Rate;
                    if (chosentheme !== "parseallthemes" && chosentheme !== "parsenothemes") {
                        await fetch("https://skyeng.autofaq.ai/api/conversations/" + conversationId)
                            .then(r => r.json())
                            .then(r => {
                                if (r.payload.topicId && r.payload.topicId.value === chosentheme && tmponlyoperhashes[j].Duration != undefined) {

                                    //(r.channelUser.payload["nextClass-status"] && r.channelUser.payload["nextClass-status"] =="идёт урок") ? console.log(r.id, r.channelUser.payload["nextClass-status"]) : ""
                                    //(r.payload && r.payload.taskUrl && r.payload.taskUrl.value == "https://jira.skyeng.tech/browse/VIM-22298") ? console.log(r.id,r.payload.taskUrl.value) : ""
                                    (r.channelUser.payload && r.channelUser.payload.userType == "teacher") ? console.log("П", r.id, r.channelUser.payload.id, r.channelUser.payload.teacherSTKList) : ""

                                    payloadarray.push({
                                        ChatId: conversationId,
                                        OperatorName: namespisochek[i],
                                        timeStamp: new Date(+r.tsCreate + tmponlyoperhashes[j].Duration).toLocaleString('ru-RU', timeOptions),
                                        CSAT: csat,
                                        ThemeValue: themesarray.find(theme => theme.value === r.payload.topicId.value)?.ThemeName || '',
                                        SLACompleted: (tmponlyoperhashes[j].Duration / 1000 / 60) > 25 ? "0" : "1"
                                    });

                                    operstagsarray.push({ ChatId: conversationId, Tags: r.payload.tags.value })

                                } else if (r.payload.topicId && r.payload.topicId.value === chosentheme && tmponlyoperhashes[j].Duration == undefined) {

                                    //(r.channelUser.payload["nextClass-status"] && r.channelUser.payload["nextClass-status"] =="идёт урок") ? console.log(r.id, r.channelUser.payload["nextClass-status"]) : ""
                                    // (r.payload && r.payload.taskUrl && r.payload.taskUrl.value == "https://jira.skyeng.tech/browse/VIM-22298") ? console.log(r.id,r.payload.taskUrl.value) : ""
                                    (r.channelUser.payload && r.channelUser.payload.userType == "teacher") ? console.log("П", r.id, r.channelUser.payload.id, r.channelUser.payload.teacherSTKList) : ""

                                    payloadarray.push({
                                        ChatId: conversationId,
                                        OperatorName: namespisochek[i],
                                        timeStamp: "Active chat, ⏳",
                                        CSAT: csat,
                                        ThemeValue: themesarray.find(theme => theme.value === r.payload.topicId.value)?.ThemeName || '',
                                        SLACompleted: "undefined"
                                    });

                                    operstagsarray.push({ ChatId: conversationId, Tags: r.payload.tags.value })
                                }

                                //test
                                // if (r.messages.length > 0) {
                                // for (let z = 0; z < r.messages.length; z++) {
                                // if (r.messages[z].txt && typeof r.messages[z].txt === 'string' && r.messages[z].txt.match(keyMatch)) {
                                // console.log("Вход найден: ", conversationId);
                                // }
                                // }
                                // }
                                // end test
                            });
                    } else if (chosentheme !== "parseallthemes" && chosentheme == "parsenothemes") {
                        await fetch("https://skyeng.autofaq.ai/api/conversations/" + conversationId)
                            .then(r => r.json())
                            .then(r => {

                                //(r.channelUser.payload["nextClass-status"] && r.channelUser.payload["nextClass-status"] =="идёт урок") ? console.log(r.id, r.channelUser.payload["nextClass-status"]) : ""
                                //(r.payload && r.payload.taskUrl && r.payload.taskUrl.value == "https://jira.skyeng.tech/browse/VIM-22298") ? console.log(r.id,r.payload.taskUrl.value) : ""
                                (r.channelUser.payload && r.channelUser.payload.userType == "teacher") ? console.log("П", r.id, r.channelUser.payload.id, r.channelUser.payload.teacherSTKList) : ""



                                operstagsarray.push({ ChatId: conversationId, Tags: r.payload.tags.value })
                                if (r.payload.topicId && r.payload.topicId.value == '' && tmponlyoperhashes[j].Duration == undefined) {
                                    payloadarray.push({
                                        ChatId: conversationId,
                                        OperatorName: namespisochek[i],
                                        timeStamp: "Active chat, ⏳",
                                        CSAT: csat,
                                        ThemeValue: '⁉No theme',
                                        SLACompleted: (tmponlyoperhashes[j].Duration / 1000 / 60) > 25 ? "0" : "1"
                                    });
                                } else if (r.payload.topicId.value == '' && tmponlyoperhashes[j].Duration != undefined) {
                                    payloadarray.push({
                                        ChatId: conversationId,
                                        OperatorName: namespisochek[i],
                                        timeStamp: new Date(+r.tsCreate + tmponlyoperhashes[j].Duration).toLocaleString('ru-RU', timeOptions),
                                        CSAT: csat,
                                        ThemeValue: '⁉No theme',
                                        SLACompleted: "undefined"
                                    });

                                }

                                //test
                                /* 									if (r.messages.length > 0) {
                                                                      for (let z = 0; z < r.messages.length; z++) {
                                                                        if (r.messages[z].txt && typeof r.messages[z].txt === 'string' && r.messages[z].txt.match(keyMatch)) {
                                                                          console.log("Вход найден: ", conversationId);
                                                                        }
                                                                      }
                                                                    } */
                                // end test
                            });


                    } else {
                        await fetch("https://skyeng.autofaq.ai/api/conversations/" + conversationId)
                            .then(r => r.json())
                            .then(r => {

                                //(r.channelUser.payload["nextClass-status"] && r.channelUser.payload["nextClass-status"] =="идёт урок") ? console.log(r.id, r.channelUser.payload["nextClass-status"]) : ""
                                //(r.payload && r.payload.taskUrl && r.payload.taskUrl.value == "https://jira.skyeng.tech/browse/VIM-22298") ? console.log(r.id,r.payload.taskUrl.value) : ""
                                (r.channelUser.payload && r.channelUser.payload.userType == "teacher") ? console.log("П", r.id, r.channelUser.payload.id, r.channelUser.payload.teacherSTKList) : ""

                                if (r.payload && r.payload.tags) {
                                    operstagsarray.push({ ChatId: conversationId, Tags: r.payload.tags.value })
                                } else {
                                    operstagsarray.push({ ChatId: conversationId, Tags: '' })
                                }


                                if (r.payload && r.payload.topicId && r.payload.topicId.value != '' && tmponlyoperhashes[j].Duration != undefined) {
                                    payloadarray.push({
                                        ChatId: conversationId,
                                        OperatorName: namespisochek[i],
                                        timeStamp: new Date(+r.tsCreate + tmponlyoperhashes[j].Duration).toLocaleString('ru-RU', timeOptions),
                                        CSAT: csat,
                                        ThemeValue: themesarray.find(theme => theme.value === r.payload.topicId.value)?.ThemeName || '',
                                        SLACompleted: (tmponlyoperhashes[j].Duration / 1000 / 60) > 25 ? "0" : "1"
                                    });

                                } else if (r.payload && r.payload.topicId && r.payload.topicId.value != '' && tmponlyoperhashes[j].Duration == undefined) {
                                    payloadarray.push({
                                        ChatId: conversationId,
                                        OperatorName: namespisochek[i],
                                        timeStamp: "Active chat, ⏳",
                                        CSAT: csat,
                                        ThemeValue: themesarray.find(theme => theme.value === r.payload.topicId.value)?.ThemeName || '',
                                        SLACompleted: "undefined"
                                    });

                                } else if (r.payload && r.payload.topicId && r.payload.topicId.value == '' && tmponlyoperhashes[j].Duration == undefined) {
                                    payloadarray.push({
                                        ChatId: conversationId,
                                        OperatorName: namespisochek[i],
                                        timeStamp: "Active chat, ⏳",
                                        CSAT: csat,
                                        ThemeValue: '⁉No theme',
                                        SLACompleted: "undefined"
                                    });
                                } else if (r.payload && r.payload.topicId && r.payload.topicId.value == '' && tmponlyoperhashes[j].Duration != undefined) {

                                    payloadarray.push({
                                        ChatId: conversationId,
                                        OperatorName: namespisochek[i],
                                        timeStamp: new Date(+r.tsCreate + tmponlyoperhashes[j].Duration).toLocaleString('ru-RU', timeOptions),
                                        CSAT: csat,
                                        ThemeValue: '⁉No theme',
                                        SLACompleted: (tmponlyoperhashes[j].Duration / 1000 / 60) > 25 ? "0" : "1"
                                    });

                                }

                                //test
                                // if (r.messages.length > 0) {
                                // for (let z = 0; z < r.messages.length; z++) {
                                // if (r.messages[z].txt && typeof r.messages[z].txt === 'string' && r.messages[z].txt.match(keyMatch)) {
                                // console.log("Вход найден: ", conversationId);
                                // }
                                // }
                                // }
                                // end test

                            });
                    }
                }
            }


            page++;
            maxpage = opgrdata.total / 100;
        } while (page - 1 < maxpage);

        currentWidth += step;
        progressBar.style.width = Number(currentWidth.toFixed(1)) + "%";
        progressBar.textContent = Number(currentWidth.toFixed(1)) + "%";

    }

    // const cleanedarray = operstagsarray.map(element => element.trim().slice(2, -2).trim().replace(/"/g, '').replace(/\n /,''));

    cleanedarray = operstagsarray.map(element => {
        if (typeof element.Tags === 'string') {
            return {
                ChatId: element.ChatId,
                Tags: element.Tags.trim().slice(2, -2).trim().replace(/"/g, '').replace(/\n /, '')
            };
        }
        return element;
    });
    const themesgrabbeddata = document.getElementById('themesgrabbeddata');
    themesgrabbeddata.innerHTML = '';

    // Create the table element
    const table = document.createElement('table');
    table.className = 'srvhhelpnomove';
    table.id = "TableGrabbed"

    // Create the table header row
    const headerRow = document.createElement('tr');
    const columnNames = ['№', 'Date', 'Operator', 'ChatId', '🏁 CSAT', 'Тема', 'SLACompleted'];

    // Add column names to the header row
    columnNames.forEach(columnName => {
        const th = document.createElement('th');
        th.textContent = columnName;
        th.setAttribute('name', 'btnNameFilter')
        if (columnName == "🏁 CSAT") {
            th.style = 'text-align:center; font-weight:700; background:dimgrey; border:1px solid black; padding:5px; position: sticky; top: 0; cursor:pointer;'
        } else {
            th.style = 'text-align:center; font-weight:700; background:dimgrey; border:1px solid black; padding:5px; position: sticky; top: 0;'
        }

        headerRow.appendChild(th);
    });

    // Append the header row to the table
    table.appendChild(headerRow);

    // Assuming payloadarray is an array of objects with a property called ChatId

    // Get unique elements based on ChatId
    const uniqueArray = payloadarray.reduce((unique, item) => {
        // Check if the ChatId already exists in the unique array
        const existingItem = unique.find((element) => element.ChatId === item.ChatId);

        // If ChatId does not exist, add the item to the unique array
        if (!existingItem) {
            unique.push(item);
        }

        return unique;
    }, []);

    // Assign the unique array to pureArray
    pureArray = uniqueArray;

    filteredArrayTags = cleanedarray.reduce((unique, item) => {
        const existingItem = unique.find((element) => element.ChatId === item.ChatId);

        // If ChatId does not exist, add the item to the unique array
        if (!existingItem) {
            unique.push(item);
        }

        return unique;
    }, [])

    // Iterate through the data array and create table rows
    pureArray.forEach((element, index) => {
        const row = document.createElement('tr');
        row.classList = "rowOfChatGrabbed"
        row.style = "border: 1px solid black;"

        // Add the index column
        const indexCell = document.createElement('td');
        indexCell.textContent = index + 1;
        indexCell.style = "border: 1px solid black; font-size: 12px;"
        row.appendChild(indexCell);

        // Add the date column
        const dateCell = document.createElement('td');
        dateCell.textContent = element.timeStamp;
        dateCell.style = "border: 1px solid black; font-size: 12px;"
        row.appendChild(dateCell);

        // Add the operator column
        const operatorCell = document.createElement('td');
        operatorCell.textContent = element.OperatorName;
        operatorCell.style = 'text-align:center; border: 1px solid black; font-size: 12px;'
        row.appendChild(operatorCell);

        // Add the chatId column
        const chatIdCell = document.createElement('td');
        chatIdCell.textContent = element.ChatId;
        chatIdCell.style = "border: 1px solid black; font-size: 11px;"
        row.appendChild(chatIdCell);

        // Find the matched item in chatswithmarksarray
        const matchedItem = chatswithmarksarray.find(item => item.ConvId === element.ChatId);

        // Add the CSAT column
        const csatCell = document.createElement('td');
        csatCell.textContent = matchedItem ? (matchedItem.Rate !== undefined ? matchedItem.Rate : '-') : '-';
        csatCell.style = 'text-align:center;'
        csatCell.setAttribute('name', 'CSATvalue')
        row.appendChild(csatCell);

        // Add the Theme column
        const themeCell = document.createElement('td');
        themeCell.textContent = element.ThemeValue
        themeCell.style = 'text-align:center; border: 1px solid black; font-size: 12px;'
        row.appendChild(themeCell);

        // Add SLA Completed column
        const SLAcompl = document.createElement('td');
        SLAcompl.textContent = element.SLACompleted
        SLAcompl.style = 'text-align:center; border: 1px solid black; font-size: 12px;'
        SLAcompl.setAttribute('name', 'SLACompletedValue')
        row.appendChild(SLAcompl);

        // Append the row to the table
        table.appendChild(row);
    });

    // Append the table to the themesgrabbeddata element
    themesgrabbeddata.appendChild(table);

    //

    const result = payloadarray.reduce((acc, obj) => {
        const themeValue = obj.ThemeValue;
        acc.uniqueValues.add(themeValue);
        acc.counts[themeValue] = (acc.counts[themeValue] || 0) + 1;
        return acc;
    }, { uniqueValues: new Set(), counts: {} });

    const uniqueValuesArray = Array.from(result.uniqueValues);
    countsArray = Object.entries(result.counts).map(([themeValue, count]) => ({ ThemeValue: themeValue, Count: count }));

    isDescending = true; // Флаг для определения порядка сортировки

    const switchToTableButton = document.getElementById('SwitchToTable');
    switchToTableButton.addEventListener('click', buildTable);

    const switchToGraphButton = document.getElementById('SwitchToGraph');
    switchToGraphButton.addEventListener('click', drawGraph);

    const switchToIntervalTableButton = document.getElementById('SwitchToIntervalTable');
    switchToIntervalTableButton.addEventListener('click', buildIntervalTable);

    const switchToIntervalGraphButton = document.getElementById('SwitchToIntervalGraph');
    switchToIntervalGraphButton.addEventListener('click', drawIntervalGraph);

    const SaveIntervalCSVButton = document.getElementById('SaveIntervalCSV');
    SaveIntervalCSVButton.addEventListener('click', saveToCSVInterval);

    ///
    function filterTableRowsByTags() {
        // Получаем выбранные чекбоксы
        const selectedValues = getSelectedCheckboxTagsValues();

        if (selectedValues.length > 0) {
            const rows = document.querySelectorAll('.rowOfChatGrabbed');
            rows.forEach(function (row) {
                const cellValue = row.children[3].textContent;
                let isMatched = false; // Флаг для отслеживания совпадения

                selectedValues.forEach(function (selectedValue) {
                    const filteredArray = cleanedarray.filter(item => {
                        const tags = item.Tags.split(',').map(tag => tag.trim());
                        return tags.includes(selectedValue);
                    });

                    filteredArray.forEach(function (item) {
                        if (item.ChatId === cellValue) {
                            isMatched = true;
                            return; // Прерываем цикл, если найдено совпадение
                        }
                    });
                });

                if (isMatched) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });

            calcAvgCsat();
            calcAvgSLACompleted()
        } else {
            const rows = document.querySelectorAll('.rowOfChatGrabbed');
            rows.forEach(function (row) {
                row.style.display = '';
            });
            calcAvgCsat();
            calcAvgSLACompleted()
        }
    }


    document.getElementById('hideselecalltags').onclick = filterTableRowsByTags

    document.getElementById('SaveToCSVFilteredByTags').onclick = function () {
        let checkboxes = document.querySelectorAll('input[type="checkbox"][name="tagsforfilter"]');
        let allUnchecked = Array.from(checkboxes).every(checkbox => !checkbox.checked);

        if (allUnchecked) {
            function isJsonString(str) {
                try {
                    if (typeof str !== 'string') throw new Error('Not a string');
                    let parsed = JSON.parse(str);

                    // Не допускаем другие типы кроме массивов
                    if (!Array.isArray(parsed)) throw new Error('Not an array');
                } catch (e) {
                    console.error('Invalid JSON for:', str, 'Error:', e.message);
                    return false;
                }
                return true;
            }

            function isValidItem(item) {
                return item.hasOwnProperty('ChatId') && item.hasOwnProperty('Tags');
            }

            function downloadCSV(array) {
                let csvContent = ''; // Убрали начальную строку
                let header = "ChatId,Tag1,Tag2,Tag3,Tag4,Tag5,Tag6";
                csvContent += header + "\r\n";

                array.forEach((item, index) => {
                    if (!isValidItem(item)) {
                        console.warn(`Element at index ${index} is invalid. Skipping...`, item);
                        return;
                    }

                    let tags = [];
                    if (item.Tags === "") {
                        tags = [];
                    } else if (isJsonString(item.Tags)) {
                        tags = JSON.parse(item.Tags);
                    } else {
                        console.warn(`Element at index ${index} has invalid Tags. Using empty array.`, item);
                    }

                    let row = [item.ChatId, ...tags];
                    csvContent += row.join(",") + "\r\n";
                    console.log(`Processed element at index ${index}:`, row.join(","));
                });

                // Создание Blob из строки CSV и загрузка файла
                let blob = new Blob([csvContent], { type: 'text/csv' });
                let link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "export.csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

           downloadCSV(operstagsarray);
        } else {
            saveFilteredTableCSV()
        }
    }



    ///

    let btnFilters = document.getElementsByName('btnNameFilter')
    for (let i = 0; i < btnFilters.length; i++) {
        btnFilters[i].onclick = function () {
            if (btnFilters[i].textContent == '🏁 CSAT' && document.getElementById('CSATFilterField').style.display == 'none') {
                document.getElementById('CSATFilterField').style.display = ''

                // Получаем все строки таблицы с атрибутом name="rowOfChatGrabbed"
                const rows = document.querySelectorAll('.rowOfChatGrabbed');

                function filterTableRows() {
                    const selectedValues = getSelectedCheckboxValues();

                    // Перебираем все строки таблицы
                    rows.forEach(function (row) {
                        const cellValue = row.querySelector('[name="CSATvalue"]').textContent;

                        // Если ни один чекбокс не выбран, отображаем все строки
                        if (selectedValues.length === 0) {
                            row.style.display = '';
                        }
                        // Если значение ячейки соответствует выбранным чекбоксам - отображаем строку
                        else if (selectedValues.includes(cellValue)) {
                            row.style.display = '';
                        }
                        // Иначе скрываем строку
                        else {
                            row.style.display = 'none';
                        }
                    });
                    calcAvgCsat()
                    calcAvgSLACompleted()
                }

                // Обрабатываем событие изменения для каждого чекбокса
                const checkboxes = document.querySelectorAll('input[name="marksFilter"]');
                checkboxes.forEach(function (checkbox) {
                    checkbox.addEventListener('change', filterTableRows);
                });

                document.getElementById('hidefilter').onclick = function () {
                    document.getElementById('CSATFilterField').style.display = 'none'
                }

                document.getElementById('downloadfilteredtocsv').onclick = saveFilteredTableCSV


            } else if (btnFilters[i].textContent == '🏁 CSAT' && document.getElementById('CSATFilterField').style.display == '') {
                document.getElementById('CSATFilterField').style.display = 'none'
            }
        }
    }

    //

    document.getElementById('foundcount').innerHTML = '<span style="background: #166945; padding: 5px; color: floralwhite; font-weight: 700; border-radius: 10px;">' + "Всего найдено: " + pureArray.length + " обращений" + '</span>'

    calcAvgCsat()
    calcAvgSLACompleted()

    let hashes = document.querySelectorAll('.rowOfChatGrabbed');
    for (let j = 0; j < hashes.length; j++) {
        hashes[j].onclick = function () {

            if (document.getElementById('AF_ChatHis').style.display == 'none') {
                document.getElementById('opennewcat').click();
                document.getElementById('hashchathis').value = hashes[j].children[3].textContent
                    ;
                btn_search_history.click()
            } else {
                document.getElementById('hashchathis').value = hashes[j].children[3].textContent
                btn_search_history.click()
            }
        }
    }
    document.getElementById('GatherStatByThemes').removeAttribute('disabled')
}

document.getElementById('opscontainer').onclick = function () {
    if (document.getElementById('activeoperatorsgroup').style.display == "none") {
        document.getElementById('activeoperatorsgroup').style.display = "grid"
        document.getElementById('hideselecall').style.display = ""
        this.classList.add('glowing-border-animation')
    } else {
        document.getElementById('activeoperatorsgroup').style.display = "none"
        document.getElementById('hideselecall').style.display = "none"
        this.classList.remove('glowing-border-animation')
    }
}

document.getElementById('markscontainer').onclick = function () {
    if (document.getElementById('listofthemarks').style.display == "none") {
        document.getElementById('listofthemarks').style.display = ""
        document.getElementById('hideselecallmarks').style.display = ""
        this.classList.add('glowing-border-animation')
    } else {
        document.getElementById('listofthemarks').style.display = "none"
        document.getElementById('hideselecallmarks').style.display = "none"
        this.classList.remove('glowing-border-animation')
    }
}

document.getElementById('tagscontainer').onclick = function () {
    if (document.getElementById('listofthetags').style.display == "none") {
        document.getElementById('listofthetags').style.display = ""
        document.getElementById('hideselecalltags').style.display = ""
        this.classList.add('glowing-border-animation')
    } else {
        document.getElementById('listofthetags').style.display = "none"
        document.getElementById('hideselecalltags').style.display = "none"
        this.classList.remove('glowing-border-animation')
    }
}

function downloadCSV(data, filename) {
    const csvContent = "\uFEFF" + convertArrayToCSV(data);
    const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function convertArrayToCSV(data) {
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = String(row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
}

document.getElementById('webtoCSV').onclick = function () {
    const filename = "data.csv";

    downloadCSV(pureArray, filename);
}

document.getElementById('dayplus').onclick = function () { // обработчик нажатия на кнопку следующего дня
    let dateInputIshod = document.getElementById('dateFromGrab').value;
    let dateInputKonez = document.getElementById('dateToGrab').value;
    let datestart = new Date(dateInputIshod);
    let dateend = new Date(dateInputKonez);
    datestart.setDate(datestart.getDate() + 1);
    dateend.setDate(dateend.getDate() + 1);
    let newDateStart = datestart.toISOString().split('T')[0];
    let newDateEnd = dateend.toISOString().split('T')[0];
    document.getElementById('dateFromGrab').value = newDateStart;
    document.getElementById('dateToGrab').value = newDateEnd;
}

document.getElementById('dayminus').onclick = function () { // обработчик нажатия на кнопку предыдущего дня
    let dateInputIshod = document.getElementById('dateFromGrab').value;
    let dateInputKonez = document.getElementById('dateToGrab').value;
    let datestart = new Date(dateInputIshod);
    let dateend = new Date(dateInputKonez);
    datestart.setDate(datestart.getDate() - 1);
    dateend.setDate(dateend.getDate() - 1);
    let newDateStart = datestart.toISOString().split('T')[0];
    let newDateEnd = dateend.toISOString().split('T')[0];
    document.getElementById('dateFromGrab').value = newDateStart;
    document.getElementById('dateToGrab').value = newDateEnd;
}