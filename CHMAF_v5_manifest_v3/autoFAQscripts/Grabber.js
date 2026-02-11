let chosentheme;
let pureArray = [];
let filteredArrayTags = [];
let cleanedarray = [];
let themesarray = []
let avgCsatCountVar;
let countsArray = [];
let countsCountryArray = [];
let countsArrayInterval = [];
let testarray = [];
let chekopersarr = [];
let newarray = [];
let arrofthemes = [];
let payloadarray = [];
let chatswithmarksarray = [];
let checkmarksarr = [];
let operstagsarray = [];
let otherfilters = "off"
let keyMatch = "Высокий"
let currentTableData = [];
let isDescending = false;
let lastTableParams = null;

const timeOptions = {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
    // second: 'numeric'
};

const categoryMap = [
    { key: "Категория: Техподдержка 2-я линия crm2", label: "2ЛТП" },
    { key: "Категория: Техподдержка исход crm2", label: "ТП исход" },
    { key: "Категория: Teachers Care crm2", label: "Teachers Care" },
    { key: "Категория: Исходящие звонки (crm2)", label: "Исходящие звонки (crm2)" },
    { key: "Категория: Кризис менеджеры", label: "Кризис менеджеры" }
];

const themes = [
    // --- SYSTEM ---
    { value: "parseallthemes", label: "ALL", style: "background-color:#69b930; color:white; font-weight:700; text-align:center" },
    { value: "parsenothemes", label: "Without themes", style: "background-color:coral; color:white; font-weight:700; text-align:center" },

    // --- Skyeng Mob ---
    { group: "skmob", label: "Skyeng👨‍🎓Mob" },
    { value: "1804", label: "📱‍👨‍🎓Авторизация" },
    { value: "1805", label: "📱‍👨‍🎓Домашка" },
    { value: "1806", label: "📱‍👨‍🎓Оплата" },
    { value: "1807", label: "📱‍👨‍🎓Профиль" },
    { value: "1808", label: "📱‍👨‍🎓Тренажер слов" },
    { value: "1809", label: "📱‍👨‍🎓Уроки" },
    { value: "1810", label: "📱‍👨‍🎓Чат" },

    // --- Teachers Mob ---
    { group: "tmob", label: "Teachers👽Mob" },
    { value: "1833", label: "📱👽Авторизация" },
    { value: "1836", label: "📱👽Виджет расписания" },
    { value: "1839", label: "📱👽Чат" },
    { value: "1835", label: "📱👽Виджет финансов" },
    { value: "1838", label: "📱👽Профиль" },
    { value: "1840", label: "📱👽3Сторис" },
    { value: "1837", label: "📱👽Страница расписания" },
    { value: "1834", label: "📱👽Страница финансов" },

    // --- Skysmart Parents App ---
    { group: "sksmpartapp", label: "Skysmart👪родит" },
    { value: "1884", label: "📱👪Другое" },
    { value: "1883", label: "📱👪Материалы" },
    { value: "1880", label: "📱👪Предметы и баланс" },
    { value: "1881", label: "📱👪Профиль родителя" },
    { value: "1879", label: "📱👪Расписание" },
    { value: "1882", label: "📱👪Чат" },

    // --- Skypro App ---
    { group: "skyproapp", label: "Приложение Skypro" },
    { value: "1904", label: "Skypro App - Виджет входа на урок" },

    // --- Different ---
    { group: "solanka", label: "Different" },
    { value: "2034", label: "🚫Прочее" },
    { value: "2030", label: "ⓂSlack-проблемы со входом" },
    { value: "69", label: "☎Проблемы с телефонией" },

    // --- Payment ---
    { group: "payf", label: "Проблемы с оплатой" },
    { value: "1077", label: "💳Вина школы" },
    { value: "1658", label: "💳Консультация" },
    { value: "1661", label: "💳Карта У" },
    { value: "1662", label: "💳Сбой оплаты" },
    { value: "1660", label: "💳Подписки" },

    // --- Homework ---
    { group: "hwtr", label: "Проблемы с ДЗ" },
    { value: "1744", label: "💼Контент" },
    { value: "1745", label: "💼Оценка" },
    { value: "1746", label: "💼Словарь" },
    { value: "1747", label: "💼Упражнение" },

    // --- Connection ---
    { group: "svyaz", label: "Проблемы связь" },
    { value: "1581", label: "💻ОС/брауз ниж мин" },
    { value: "1589", label: "💻Консультация работы связи" },
    { value: "1582", label: "💻Корп сеть/ус-во" },
    { value: "1583", label: "💻ОС/браузер" },
    { value: "1586", label: "💻ПК" },
    { value: "1584", label: "💻Гарнитура" },
    { value: "1585", label: "💻Камера" },
    { value: "1580", label: "💻Блокировалось ПО" },
    { value: "1594", label: "💻Не подерж браузер" },
    { value: "1595", label: "💻Не подерж камера гарнитура пк" },
    { value: "1593", label: "💻Сбой платф" },
    { value: "1592", label: "💻Сб задерж кам" },
    { value: "1587", label: "💻Инет ниж мин" },
    { value: "1590", label: "💻Сб плат блок прерыв связь" },
    { value: "1588", label: "💻Хар ниж мин" },
    { value: "1591", label: "💻Сб задерж звука" },

    // --- LKP ---
    { group: "lkp", label: "Проблемы ЛКП" },
    { value: "1721", label: "👽ЛКП - Группа" },
    { value: "1714", label: "👽ЛКП - Чат" },
    { value: "1719", label: "👽ЛКП - Финансы" },
    { value: "1717", label: "👽ЛКП - Упражнения" },
    { value: "1712", label: "👽ЛКП - Карта роста" },
    { value: "1716", label: "👽ЛКП - Настройки" },
    { value: "1718", label: "👽ЛКП - Перерыв" },
    { value: "1715", label: "👽ЛКП - Профиль" },
    { value: "1720", label: "👽ЛКП - Работы на проверку" },
    { value: "1713", label: "👽ЛКП - Расписание" },

    // --- LKU ---
    { group: "lku", label: "Проблемы ЛКУ" },
    { value: "1708", label: "👨‍🎓ЛКУ - Чат" },
    { value: "1710", label: "👨‍🎓ЛКУ - Профиль" },
    { value: "1706", label: "👨‍🎓ЛКУ - Виджет прогресса" },
    { value: "1707", label: "👨‍🎓ЛКУ - История занятий/портфолио" },
    { value: "1709", label: "👨‍🎓ЛКУ - Семья" },
    { value: "1711", label: "👨‍🎓ЛКУ - Настройки" },
    { value: "1705", label: "👨‍🎓ЛКУ - Навыки" },
    { value: "1704", label: "👨‍🎓ЛКУ - Грамматика" },

    // --- Login Problems ---
    { group: "problvh", label: "Проблемы вход" },
    { value: "1632", label: "🔐Не привяз почт/тел" },
    { value: "1635", label: "🔐Данные для входа" },
    { value: "1634", label: "🔐Сброс пароля" },
    { value: "1631", label: "🔐Консультация авторизации" },
    { value: "1633", label: "🔐Сбой авторизации" },

    // --- Subscription / Access ---
    { group: "problpodk", label: "Проблемы подкл" },
    { value: "1624", label: "🔌Истекла подписка" },
    { value: "1627", label: "🔌Консультациия" },
    { value: "1629", label: "🔌Нет кнопки входа" },
    { value: "1628", label: "🔌У не в ГУ" },
    { value: "1625", label: "🔌Ур в др вр" },
    { value: "1626", label: "🔌У отпуск" },
    { value: "1630", label: "🔌Неактивна кнопка входа" },

    // --- Lesson Functionality ---
    { group: "lesfunc", label: "Функционал урок" },
    { value: "1772", label: "👨‍🎓STT" },
    { value: "1773", label: "👽TTT" },
    { value: "1767", label: "📎Вложения" },
    { value: "1771", label: "🖥Демонстрация экр" },
    { value: "1768", label: "⌨Доска" },
    { value: "2037", label: "📝Заметки" },
    { value: "1775", label: "💨Отправка ДЗ на уроке" },
    { value: "1770", label: "🔀Перекл материалов" },
    { value: "1776", label: "🎵/📽Ауд/вид плеер" },
    { value: "1769", label: "📙Словарь на уроке" },
    { value: "1774", label: "🎯Упражнения на уроке" },

    // --- Feedback ---
    { group: "feedbk", label: "Отзывы и пожел" },
    { value: "1970", label: "💭Vim-контент" },
    { value: "1971", label: "💭Vim-оценка" },
    { value: "1972", label: "💭Vim-словарь" },
    { value: "1973", label: "💭Vim-упражнения" },
    { value: "1966", label: "💭ЛК-ОС род" },
    { value: "1965", label: "💭ЛК-перенос отмена ур" },
    { value: "1967", label: "💭ЛК-профиль" },
    { value: "1968", label: "💭ЛК-семья" },
    { value: "1969", label: "💭ЛК чат" },
    { value: "1974", label: "💭App Skyeng" },
    { value: "1975", label: "💭App Teachers" },
    { value: "1979", label: "💭App Skypro" },
    { value: "1976", label: "💭App класс" },
    { value: "1977", label: "💭App решения" },
    { value: "1978", label: "💭App Skysmart род" },
    { value: "1980", label: "💭Прочее" },

    // --- CC Themes ---
    { group: "difCCthemes", label: "Разные тематики с КЦ" },
    { value: "479", label: "💰КЦ-Проблемы с оплатой" },
    { value: "63", label: "💻КЦ-Нет видео или звука" },
    { value: "68", label: "📍КЦ-Другие тех проблемы" },
    { value: "66", label: "💼КЦ-ДЗ и вирт класс" },
    { value: "109", label: "💼КЦ-Сброс" },
    { value: "73", label: "🏝КЦ-Отпуск У" },
    { value: "107", label: "📱КЦ-Проч обр по Skyeng App" },
    { value: "1249", label: "💋КЦ-Talks" },
    { value: "2426", label: "Запланирована связь с пользователем" }
];

// let convDurationArr=[];
var win_Grabber =  // описание элементов окна Grabber
    `<div style="display: flex; width: 960px;">
        <span style="width: 960px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 960px; display:flex; justify-content:space-evenly;" id="grabdata">
                                <button class="mainButton buttonHide" id="hideMeGrabber">hide</button>
                                <button class="mainButton" id="GatherStatByThemes" disabled>🧮</button>
								<div style="width:450px;background: #5f7875;height: 21px;"><div id="progressBarGrabber" style="width: 0%; height: 20px; background-color: #e38118; border: 1px solid black; text-align:center; font-weight:700; color:white;"></div></div>
                        </div>

						<div id="AgregatedDataThemes" style="display:none; width:400px; min-height:100px; max-height:800px; background: rgb(70, 68, 81); position:absolute; top:-1px; left:-400px; overflow-y:auto">
							<div style="margin:5px;">
								<button class="mainButton buttonHide" id="HideToolsPanel">hide</button>
							</div>

							<div id="ToolsPanel" style="padding:5px;">
								<div style="color:bisque">Графическое и табличное представление подтематик</div>
								<button class="mainButton" id="SwitchToGraph">🔀📊</button>
								<button class="mainButton" id="SwitchToTable">🔀🧮</button>
								<button class="mainButton" id="SwitchToIntervalGraph">🔀📊〰</button>
								<button class="mainButton" id="SwitchToIntervalTable">🔀🧮〰</button>
								<button class="mainButton" id="SaveIntervalCSV" disabled>〰💾CSV</button>
							<div style="color:bisque">Графическое и табличное представление по странам пользователей</div>
								<button class="mainButton" id="SwitchToGraphCountry">🔀📊</button>
								<button class="mainButton" id="SwitchToTableCountry">🔀🧮</button>
								<button class="mainButton" title="Сохраняет в CSV обобщенные значения по странам" id="SaveСountryTableCSV">〰💾🧮CSV</button>
								<br>
								<button class="mainButton" id="SwitchToIntervalGraphCountry" >〰📊Country</button>
								<button class="mainButton" id="SwitchToIntervalTableCountry" >〰🧮Country</button>
								<button class="mainButton" title="Сохраняет в CSVзначения по странам за разные периоды времени"  id="SaveIntervalСountryCSV" disabled>〰💾CSV</button>
							</div>
							<div id="AgregatedDataOut" style="color: bisque; padding: 5px; text-align: center;"></div>
						</div>

                        <div style="margin: 5px; width: 960px" id="grabbox">
								 <span style="color:bisque; margin-top:5px; margin-left:10px;">Начальная дата <input class="${exttheme}" type="date" style="margin-left:20px;  width:125px;" name="FirstData" id="dateFromGrab"></span>
								 <button class="mainButton" style="margin-left:15%" id="dayminus">◀</button>
								 <button class="mainButton" id="dayplus">▶</button>
								 <span style="color:bisque; margin-top:2px; float:right; margin-right:10px; height:28px;">Конечная дата <input class="${exttheme}" type="date" style="float:right; margin-left:20px; margin-right:10px; width:125px;" name="LastData" id="dateToGrab"</span>
                        </div>

						<div style="display:flex; justify-content: space-evenly; margin-bottom: 5px;">
							<div id="opscontainer" class="filtersList" style="color: bisque; background: #ff7f507d; font-size: 16px; padding: 5px; width: 33%; border-radius: 20px; text-align: center; cursor: pointer; border: 1px solid black;">🔱Фильтр по операторам🦸‍♂️</div>
							<div id="markscontainer" class="filtersList"  style="color: bisque; background: #ff7f507d; font-size: 16px; padding: 5px; width: 33%; border-radius: 20px; text-align: center; cursor: pointer; border: 1px solid black;">🔱Фильтр по оценкам🔢</div>
							<div id="tagscontainer" class="filtersList"  style="color: bisque; background: #ff7f507d; font-size: 16px; padding: 5px; width: 33%; border-radius: 20px; text-align: center; cursor: pointer; border: 1px solid black;">🔱Фильтр по тегам🏷</div>
                            <div id="othercontainer" class="filtersList"  style="color: bisque; background: #ff7f507d; font-size: 16px; padding: 5px; width: 33%; border-radius: 20px; text-align: center; cursor: pointer; border: 1px solid black;">🔱Другие фильтры</div>
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


                            <div id="listofotheroptions"
                                style="display:none; color:bisque; margin:0 auto; padding:15px;
                                        background:#3f3d47; border:1px solid #6a6a6a; border-radius:12px;
                                        width:500px;">

                                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px;">

                                    <!-- Левая колонка — Приоритет -->
                                    <div>
                                        <div style="font-weight:700; margin-bottom:5px; color:#93f5a6; text-align:center;">
                                            Приоритет
                                        </div>

                                        <label style="display:block; margin-left:10px;">
                                            <input type="checkbox" checked name="priorityfilter" value="Any"> Any
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input type="checkbox" name="priorityfilter" value="Низкий"> Низкий
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input type="checkbox" name="priorityfilter" value="Высокий"> Высокий
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input type="checkbox" name="priorityfilter" value="Критический"> Критический
                                        </label>
                                    </div>

                                    <!-- Центральная колонка — Отдел -->
                                    <div>
                                        <div style="font-weight:700; margin-bottom:5px; color:#93f5a6; text-align:center;">
                                            Отдел
                                        </div>

                                        <label style="display:block; margin-left:10px;">
                                            <input type="checkbox" checked name="deptfilter" value="Any"> Any
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input title="Техподдержка 1Л CRM (исход)"  type="checkbox" name="deptfilter" value="Техподдержка исход crm2"> ТП Исход
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input title="Техподдержка 2Л CRM"  type="checkbox" name="deptfilter" value="Техподдержка 2-я линия crm2"> ТП2Л
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input title="Teachers Care" type="checkbox" name="deptfilter" value="Teachers Care crm2""> TC
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input title="Кризис менеджмент" type="checkbox" name="deptfilter" value="Кризис менеджеры"> КМ
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input title="Исходящие звонки crm2" type="checkbox" name="deptfilter" value="Исходящие звонки (crm2)"> КЦ Исход
                                        </label>
                                    </div>

                                    <!-- Правая колонка — Отдел -->
                                    <div>
                                        <div style="font-weight:700; margin-bottom:5px; color:#93f5a6; text-align:center;">
                                            Тип пользователя
                                        </div>

                                        <label style="display:block; margin-left:10px;">
                                            <input type="checkbox" checked name="usrtypefilter" value="Any"> Any
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input type="checkbox" name="usrtypefilter" value="student"> Ученик
                                        </label>
                                        <label style="display:block; margin-left:10px;">
                                            <input type="checkbox" name="usrtypefilter" value="teacher"> Преподаватель
                                        </label>
                                    </div>
                                </div>

                                <hr style="border-color:#6a6a6a; margin:15px 0;">

                                <!-- Поля ввода -->
                                <div style="display:flex; flex-direction:column; gap:10px;">
                                    <input placeholder="Поиск по комментарию"
                                        style="padding:6px; border-radius:6px; border:1px solid #6a6a6a;
                                                background:#2f2d35; color:bisque;">
                                    <input placeholder="Поиск по сообщению"
                                        style="padding:6px; border-radius:6px; border:1px solid #6a6a6a;
                                                background:#2f2d35; color:bisque;">
                                </div>
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
							  </div>

							  <div style="display: flex;">
								  <button class="mainButton" id="hideselecalltags" style="flex-grow:1">🚀Apply</button>
								  <button class="mainButton" id="SaveToCSVFilteredByTags" style="flex-grow:1">💾CSV</button>
							  </div>
							</div>

						<div style="padding-bottom: 5px;">
                        <select id="ThemesToSearch" class="${exttheme}" style="margin-left:150px; margin-top:10px;"></select>

                               <button class="mainButton" style=" title="ищет чаты по тематике" id="stargrab">Find</button>
							   	<button class="mainButton" id="webtoCSV">💾 Download CSV</button>
						</div>
						</span>

						<div id="grabbedchats" style="margin-left: 15px;">
							 <p id="themesgrabbeddata" style="width:960px; max-height:400px; color:bisque; margin-left:5px; overflow:auto"></p>
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

const wintGrabber = createWindow('AF_Grabber', 'winTopGrabber', 'winLeftGrabber', win_Grabber);
hideWindowOnDoubleClick('AF_Grabber');
hideWindowOnClick('AF_Grabber', 'hideMeGrabber');

function setupAnyLogic(groupName) {
    const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.value === "Any" && cb.checked) {
                // Если выбрали Any → снимаем остальные
                checkboxes.forEach(other => {
                    if (other.value !== "Any") other.checked = false;
                });
            } else if (cb.value !== "Any" && cb.checked) {
                // Если выбрали любой другой → снимаем Any
                checkboxes.forEach(other => {
                    if (other.value === "Any") other.checked = false;
                });
            }
        });
    });
}

setupAnyLogic("priorityfilter");
setupAnyLogic("deptfilter");
setupAnyLogic("usrtypefilter");

//Блок функций для "другие фильтры"

const commentInputEl = document.querySelector('#listofotheroptions input[placeholder="Поиск по комментарию"]');
const messageInputEl = document.querySelector('#listofotheroptions input[placeholder="Поиск по сообщению"]');

commentInputEl.addEventListener("input", () => {
    if (commentInputEl.value.trim() !== "") {
        messageInputEl.value = "";
    }
});

messageInputEl.addEventListener("input", () => {
    if (messageInputEl.value.trim() !== "") {
        commentInputEl.value = "";
    }
});


function getCheckedValues(groupName) {
    return Array.from(document.querySelectorAll(`input[name="${groupName}"]:checked`))
        .map(cb => cb.value);
}

function collectOtherFilters() {

    const priority = getCheckedValues("priorityfilter");
    const dept = getCheckedValues("deptfilter");
    const usertype = getCheckedValues("usrtypefilter");

    const commentInput = commentInputEl.value.trim();
    const messageInput = messageInputEl.value.trim();

    return {
        priority,
        dept,
        usertype,
        commentInput,
        messageInput
    };
}
///Конец блока функций

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

async function getlistofopers() {
    await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", { "headers": { "x-csrf-token": aftoken } }).then(r => r.json()).then(r => dataInfo = r)

    let tpopers = dataInfo.onOperator
        .map(el => el.groupId === "c7bbb211-a217-4ed3-8112-98728dc382d8" ? ({ id: el.operator.id, name: el.operator.fullName }) : el.groupId === "8266dbb1-db44-4910-8b5f-a140deeec5c0" ? ({ id: el.operator.id, name: el.operator.fullName }) : null)
        .filter(el => el !== null)
        .filter(el => /ТП[^0-9]/.test(el.name));

    activeoperatorsgroup.innerHTML = ''
    for (let i = 0; i < tpopers.length; i++) {
        if (tpopers[i].name != 'ТП/ОКК-Березкин Александр' && tpopers[i].name != 'ТП-Борисов Евгений(СRM2)') {
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

        // Надёжная проверка видимости
        const isVisible = window.getComputedStyle(nwtable.rows[i]).display !== "none";
        if (!isVisible) continue;

        let rowData = [];

        for (let j = 0; j < nwtable.rows[i].cells.length; j++) {
            let cellText = nwtable.rows[i].cells[j].textContent
                .trim()
                .replace(/"/g, '""'); // экранирование кавычек

            rowData.push(`"${cellText}"`);
        }

        csvData.push(rowData.join(","));
    }

    let csvString = csvData.join("\n");
    let csvContent = "\uFEFF" + csvString; // BOM для кириллицы

    let downloadLink = document.createElement("a");
    downloadLink.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    downloadLink.download = "filtered_table.csv";
    downloadLink.click();
}

function getopenGrabberButtonPress() {
    const select = document.getElementById("ThemesToSearch");
    select.innerHTML = "";

    themes.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t.value || t.group;
        opt.textContent = t.label;

        if (t.style) opt.style = t.style;
        if (t.group) opt.className = selecttheme;

        select.appendChild(opt);
    });

    let parseThemesAndVals = document.getElementById('ThemesToSearch')
    for (let i = 0; i < parseThemesAndVals.length; i++) {
        themesarray.push({ value: parseThemesAndVals[i].value, ThemeName: parseThemesAndVals[i].textContent });
    }

    if (document.getElementById('AF_Grabber').style.display == '')
        document.getElementById('AF_Grabber').style.display = 'none'
    else document.getElementById('AF_Grabber').style.display = ''

    let getcurdate = new Date();
    let year = getcurdate.getFullYear();
    let day = String(getcurdate.getDate()).padStart(2, "0");

    let lastDayOfPrevMonth = new Date(year, getcurdate.getMonth(), 0).getDate();
    let toDate = new Date(year, getcurdate.getMonth(), day);

    if (day === "01") {
        // set date range to previous month
        dateFromGrab = new Date(year, getcurdate.getMonth() - 1, lastDayOfPrevMonth);
        dateToGrab = new Date(year, getcurdate.getMonth(), 1);
    }

    document.getElementById("dateFromGrab").value = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
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
///////////// Вспомогательные функции для работы с агрегированными таблицами и позже в планах сюда графики добавить
function buildUniversalTable({
    mode,          // "simple" или "interval"
    groupField,    // "ThemeValue" или "Country"
    columnTitle,   // "Тематика" или "Страна"
    saveButtonId,   // id кнопки CSV или null
    useExistingData = false   // <--- добавлено
}) {
    document.getElementById('AgregatedDataThemes').style.width = "400px";
    document.getElementById('themesgrabbeddata').style.display = '';

    const tableContainer = document.getElementById('AgregatedDataOut');
    tableContainer.innerHTML = '';

    let data;

    if (useExistingData) {
        data = currentTableData; // <--- используем отсортированные данные
    } else {
        if (mode === "interval") {
            data = buildIntervalData(groupField);
        } else {
            data = buildSimpleData(groupField);
        }
        currentTableData = data; // сохраняем
    }

    const table = buildHTMLTable(data, columnTitle, mode, groupField);
    tableContainer.appendChild(table);

    if (saveButtonId) {
        document.getElementById(saveButtonId).removeAttribute('disabled');
    }

    lastTableParams = { mode, groupField, columnTitle, saveButtonId };

}

function buildIntervalData(groupField) {

    const intervals = [
        '07:00 - 07:30', '07:30 - 08:00', '08:00 - 08:30', '08:30 - 09:00',
        '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00',
        '11:00 - 11:30', '11:30 - 12:00', '12:00 - 12:30', '12:30 - 13:00',
        '13:00 - 13:30', '13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00',
        '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00',
        '17:00 - 17:30', '17:30 - 18:00', '18:00 - 18:30', '18:30 - 19:00',
        '19:00 - 19:30', '19:30 - 20:00', '20:00 - 20:30', '20:30 - 21:00',
        '21:00 - 21:30', '21:30 - 22:00', '22:00 - 22:30', '22:30 - 23:00',
        '23:00 - 23:30', '23:30 - 00:00'
    ];

    const result = payloadarray.reduce((acc, obj) => {
        const value = obj[groupField];
        const timeKey = moment(obj.timeStamp, 'DD.MM.YYYY, HH:mm').format('HH:mm');

        const interval = intervals.find(interval => {
            const [start, end] = interval.split(' - ');
            return moment(timeKey, 'HH:mm')
                .isBetween(moment(start, 'HH:mm'), moment(end, 'HH:mm'), null, '[]');
        });

        if (interval) {
            acc.counts[interval] = acc.counts[interval] || {};
            acc.counts[interval][value] = (acc.counts[interval][value] || 0) + 1;
        }

        return acc;
    }, { counts: {} });

    const data = Object.entries(result.counts).flatMap(([interval, counts]) =>
        Object.entries(counts).map(([value, count]) => ({
            [groupField]: value,   // <-- ключ теперь правильный
            TimeStamp: interval,
            Count: count
        }))
    );

    data.sort((a, b) => {
        const tA = a.TimeStamp.split(" - ")[0];
        const tB = b.TimeStamp.split(" - ")[0];
        return moment(tA, "HH:mm").diff(moment(tB, "HH:mm"));
    });

    return data;
}


function buildSimpleData(groupField) {

    const counts = payloadarray.reduce((acc, obj) => {
        const value = obj[groupField];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});

    return Object.entries(counts).map(([value, count]) => ({
        [groupField]: value,   // <-- ключ теперь правильный
        Count: count
    }));
}


function buildHTMLTable(data, columnTitle, mode, groupField) {

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    const headers = mode === "interval"
        ? ['№п.п', columnTitle, 'Интервал', 'Количество']
        : ['№п.п', columnTitle, 'Количество'];

    headers.forEach((text, index) => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style = "text-align:center;font-weight:700;background:dimgrey;border:1px solid black;padding:5px;position:sticky;top:0;";

        // Если это колонка "Количество" — вешаем сортировку
        if (text === "Количество") {
            th.style.cursor = "pointer";
            th.title = "Клик — сортировка по возрастанию/убыванию";
            th.addEventListener('click', sortUniversalTableByCount);
        }

        headerRow.appendChild(th);
    });


    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    data.forEach((item, index) => {
        const row = document.createElement('tr');

        if (mode === "interval") {
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item[groupField]}</td>
                <td>${item.TimeStamp}</td>
                <td>${item.Count}</td>
            `;
        } else {
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item[groupField]}</td>
                <td>${item.Count}</td>
            `;
        }

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function rebuildLastTable() {
    if (!lastTableParams) return;

    buildUniversalTable({
        ...lastTableParams,
        useExistingData: true   // <--- ключевой момент
    });
}

function sortUniversalTableByCount() {
    currentTableData.sort((a, b) => {
        return isDescending
            ? b.Count - a.Count
            : a.Count - b.Count;
    });

    isDescending = !isDescending;

    rebuildLastTable();
}

//new Graph функция
function drawUniversalGraph({
    mode,          // "simple" или "interval"
    groupField,    // ThemeValue или Country
    chartType,     // bar или line
    title          // Тематика или Страна
}) {
    document.getElementById('AgregatedDataThemes').style.width = "1200px";
    document.getElementById('themesgrabbeddata').style.display = 'none';

    const graphContainer = document.getElementById('AgregatedDataOut');
    graphContainer.innerHTML = '';

    const canvas = document.createElement('canvas');
    graphContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let labels = [];
    let datasets = [];

    if (mode === "simple") {

        let source;

        // Если таблица была построена — используем её данные
        if (currentTableData.length > 0) {
            source = currentTableData;
        } else {
            // Если таблицы не было — используем оригинальные массивы
            source = groupField === "ThemeValue" ? countsArray : countsCountryArray;
        }


        labels = source.map(item => item[groupField]);
        const counts = source.map(item => item.Count);

        datasets = [{
            label: "Количество",
            data: counts,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }];
    }


    if (mode === "interval") {
        // INTERVAL MODE (line chart)
        const intervals = [
            '07:00 - 07:30', '07:30 - 08:00', '08:00 - 08:30', '08:30 - 09:00',
            '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00',
            '11:00 - 11:30', '11:30 - 12:00', '12:00 - 12:30', '12:30 - 13:00',
            '13:00 - 13:30', '13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00',
            '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00',
            '17:00 - 17:30', '17:30 - 18:00', '18:00 - 18:30', '18:30 - 19:00',
            '19:00 - 19:30', '19:30 - 20:00', '20:00 - 20:30', '20:30 - 21:00',
            '21:00 - 21:30', '21:30 - 22:00', '22:00 - 22:30', '22:30 - 23:00',
            '23:00 - 23:30', '23:30 - 00:00'
        ];

        labels = intervals;

        // Группировка
        const result = payloadarray.reduce((acc, obj) => {
            const value = obj[groupField];
            const timeKey = moment(obj.timeStamp, 'DD.MM.YYYY, HH:mm').format('HH:mm');

            const interval = intervals.find(interval => {
                const [start, end] = interval.split(' - ');
                return moment(timeKey, 'HH:mm')
                    .isBetween(moment(start, 'HH:mm'), moment(end, 'HH:mm'), null, '[]');
            });

            if (interval) {
                acc.counts[interval] = acc.counts[interval] || {};
                acc.counts[interval][value] = (acc.counts[interval][value] || 0) + 1;
            }

            acc.unique.add(value);
            return acc;
        }, { counts: {}, unique: new Set() });

        const uniqueValues = Array.from(result.unique);

        datasets = uniqueValues.map(value => {
            const data = intervals.map(interval => {
                const obj = result.counts[interval];
                return obj && obj[value] ? obj[value] : 0;
            });

            const color = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;

            return {
                label: value,
                data,
                backgroundColor: color,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 3
            };
        });
    }

    // Рисуем график
    new Chart(ctx, {
        type: chartType,
        data: { labels, datasets },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'bisque' }
                },
                x: {
                    ticks: { color: 'bisque' }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'LightSalmon',
                        font: { weight: 'bold' }
                    }
                }
            }
        }
    });
}


/////////////

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

function SaveIntervalСountryCSV() {
    let csvContent = "\uFEFF"; // Добавление BOM символа для корректной кодировки UTF-8
    // Добавление заголовков столбцов
    csvContent += "TimeStamp,Country,Count\n";
    // Добавление данных
    countsArrayInterval.forEach(item => {
        const { TimeStamp, Country, Count } = item;
        const row = `${TimeStamp},${Country},${Count}\n`;
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

function SaveСountryCSV(filename) {
    const csvRows = [];
    // Получаем заголовки таблицы
    const headers = Array.from(document.querySelectorAll('#AgregatedDataOut thead th')).map(header => header.innerText);
    csvRows.push(headers.join(','));
    // Получаем строки таблицы
    const rows = document.querySelectorAll('#AgregatedDataOut tbody tr');
    for (const row of rows) {
        const values = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText);
        csvRows.push(values.join(','));
    }
    // Создаем CSV строку
    const csvString = csvRows.join('\n');
    // Создаем Blob объект
    const blob = new Blob([csvString], { type: 'text/csv' });
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    // Эмулируем нажатие на ссылку для скачивания файла
    document.body.appendChild(link);
    link.click();
    // document.body.removeChild(link);

    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href); // Освободить память
    }, 0);
}

function searchTeachersAndRates(main) {
    if (main.channelUser && main.channelUser.payload && main.channelUser.payload.userType == "teacher" && (main.channelUser.payload.teacherSTKList?.includes('homeschooling') || main.channelUser.payload.teacherSTKList?.includes('large_classes'))) {

        // if (main.messages.length > 0) {
        //     for (let z = 0; z < main.messages.length; z++) {
        //         if (main.messages[z].txt && typeof main.messages[z].txt === 'string' && main.messages[z].tpe == "Rate") {
        //             console.log(main.id, main.channelUser.payload.id, main.messages[z].txt);
        //         }
        //     }
        // }
    }
}

async function getChat(id) {
    const r = await fetch(`https://skyeng.autofaq.ai/api/conversations/${id}`, {
        headers: { "x-csrf-token": aftoken }
    });
    return r.json();
}

function pushPayload({ r, duration, operatorName, csat, themeName }) {
    const isActive = duration === undefined;

    payloadarray.push({
        ChatId: r.id,
        OperatorName: operatorName,
        timeStamp: isActive
            ? "Active chat, ⏳"
            : new Date(+r.tsCreate + duration).toLocaleString('ru-RU', timeOptions),
        CSAT: csat,
        ThemeValue: themeName || (r.payload.topicId?.value ? '' : '⁉No theme'),
        SLACompleted: isActive ? "undefined" : ((duration / 1000 / 60) > 25 ? "0" : "1"),
        Country: r.channelUser?.payload?.country || "-"
    });
}

function pushTags(r) {
    operstagsarray.push({
        ChatId: r.id,
        Tags: r.payload?.tags?.value || ''
    });
}

function themeMatches(r, chosen) {
    if (chosen === "parseallthemes") return true;
    if (chosen === "parsenothemes") return r.payload.topicId?.value === '';
    return r.payload.topicId?.value === chosen;
}

document.getElementById('stargrab').onclick = async function () {

    const filters = collectOtherFilters();
    if (!filters) return; // конфликт — прекращаем
    console.log(filters);

    if (document.getElementById('CSATFilterField').style.display == "") {
        document.getElementById('CSATFilterField').style.display = "none"
    }

    const criticalChats = new Map();   // хранит только уникальные r.id

    document.getElementById('GatherStatByThemes').setAttribute('disabled', '')

    document.getElementById('foundcount').innerHTML = ''
    document.getElementById('avgCsatCount').innerHTML = ''
    document.getElementById('avgSLAClosedData').innerHTML = ''
    operstagsarray = [];
    arrofthemes = [];


    // document.getElementById('themesgrabbeddata').innerHTML = '';
    document.getElementById('themesgrabbeddata').innerHTML = '⏳ Загрузка...'

    // time and date block
    const padStart = (string, targetLength, padString) =>
        String(string).padStart(targetLength, padString);

    const formatDate = (date, time) => {
        const y = date.getFullYear();
        const m = padStart(date.getMonth() + 1, 2, '0');
        const d = padStart(date.getDate(), 2, '0');
        return `${y}-${m}-${d}T${time}`;
    };

    // dateFromGrab → минус 1 день
    const selectedDate = new Date(document.getElementById("dateFromGrab").value);
    selectedDate.setDate(selectedDate.getDate() - 1);
    const leftDateFromGrab = formatDate(selectedDate, "21:00:00.000z");

    // dateToGrab → без смещения
    const selectedEndDate = new Date(document.getElementById("dateToGrab").value);
    const rightDateToGrab = formatDate(selectedEndDate, "20:59:59.059z");


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
            const body = {
                serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
                mode: "Json",
                participatingOperatorsIds: [chekopersarr[i]],
                tsFrom: leftDateFromGrab,
                tsTo: rightDateToGrab,
                orderBy: "ts",
                orderDirection: "Asc",
                page,
                limit: 100
            };

            opgrdata = await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                method: "POST",
                headers: { "content-type": "application/json", "x-csrf-token": aftoken },
                body: JSON.stringify(body),
                credentials: "include"
            }).then(r => r.json());

            if (!opgrdata || !opgrdata.items) break;

            for (const el of opgrdata.items) {

                // CSAT фильтр
                const rate = el.stats.rate.rate;
                const csatAllowed = markscheklist[5].checked
                    ? (rate === undefined || checkmarksarr.includes(rate))
                    : (rate !== undefined && checkmarksarr.includes(rate));

                if (csatAllowed) {
                    chatswithmarksarray.push({
                        ConvId: el.conversationId,
                        Rate: rate
                    });
                }

                // Хэши оператора
                if (el.operatorId === chekopersarr[i]) {
                    tmponlyoperhashes.push({
                        HashId: el.conversationId,
                        Duration: el.stats.conversationDuration
                    });
                }
            }

            // Обработка каждого чата
            for (const chat of tmponlyoperhashes) {
                const matched = chatswithmarksarray.find(x => x.ConvId === chat.HashId);
                if (!matched) continue;

                const r = await getChat(chat.HashId);
                searchTeachersAndRates(main = r);

                if (!themeMatches(r, chosentheme)) continue;

                pushTags(r);

                const themeName = themesarray.find(t => t.value === r.payload.topicId?.value)?.ThemeName;
                pushPayload({
                    r,
                    duration: chat.Duration,
                    operatorName: namespisochek[i],
                    csat: matched.Rate,
                    themeName
                });

                // тест поиска
                for (const msg of r.messages) {
                    if (msg.tpe !== "OperatorComment") continue;
                    if (!msg.txt.includes("Критичность: Высокий")) continue;

                    // ищем категорию
                    const found = categoryMap.find(c => msg.txt.includes(c.key));
                    const label = found ? found.label : "Кризис менеджмент";

                    // формируем объект
                    const entry = {
                        id: r.id,
                        label,
                        text: label === "ТП исход" ? msg.txt : ""   // текст только для ТП исход
                    };

                    // записываем в Map (перезапись не страшна — данные одинаковые)
                    criticalChats.set(r.id, entry);

                    // вывод в консоль по ходу
                    //console.log(r.id, "-", label, entry.text ? ("- " + entry.text) : "");
                }
            }

            page++;
        } while ((page - 1) < (opgrdata.total / 100));

        currentWidth += step;
        progressBar.style.width = currentWidth.toFixed(1) + "%";
        progressBar.textContent = currentWidth.toFixed(1) + "%";
    }

    console.log("=== Итоговый список чатов с высоким приоритетом ===");
    console.table([...criticalChats.values()]);


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
    const columnNames = ['№', 'Date', 'Operator', 'ChatId', '🏁 CSAT', 'Тема', 'SLACompl', 'Country'];

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

        //Add Country column
        const CountryCol = document.createElement('td');
        CountryCol.textContent = element.Country;
        CountryCol.style = 'text-align:center; border: 1px solid black; font-size: 12px;'
        row.appendChild(CountryCol);

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

    const resultCountry = pureArray.reduce((acc, obj) => {
        const countryValue = obj.Country;
        acc.uniqueValues.add(countryValue);
        acc.countryCounts[countryValue] = (acc.countryCounts[countryValue] || 0) + 1;
        return acc;
    }, { uniqueValues: new Set(), countryCounts: {} });

    const uniqueValuesArray = Array.from(result.uniqueValues);
    countsArray = Object.entries(result.counts).map(([themeValue, count]) => ({ ThemeValue: themeValue, Count: count }));
    countsCountryArray = Object.entries(resultCountry.countryCounts).map(([countryValue, count]) => ({ Country: countryValue, Count: count }));

    isDescending = true; // Флаг для определения порядка сортировки

    const switchToTableButton = document.getElementById('SwitchToTable');
    switchToTableButton.addEventListener('click', () =>
        buildUniversalTable({
            mode: "simple",
            groupField: "ThemeValue",
            columnTitle: "Тематика",
            saveButtonId: null
        })
    );

    const switchToGraphButton = document.getElementById('SwitchToGraph');
    switchToGraphButton.addEventListener('click', () => {
        drawUniversalGraph({
            mode: "simple",
            groupField: "ThemeValue",
            chartType: "bar",
            title: "Тематика"
        });
    });

    const switchToTableCountryButton = document.getElementById('SwitchToTableCountry');
    switchToTableCountryButton.addEventListener('click', () =>
        buildUniversalTable({
            mode: "simple",
            groupField: "Country",
            columnTitle: "Страна",
            saveButtonId: null
        })
    );

    const switchToGraphCountryButton = document.getElementById('SwitchToGraphCountry');
    switchToGraphCountryButton.addEventListener('click', () => {
        drawUniversalGraph({
            mode: "simple",
            groupField: "Country",
            chartType: "bar",
            title: "Страна"
        });
    });

    const switchToIntervalTableButton = document.getElementById('SwitchToIntervalTable');
    switchToIntervalTableButton.addEventListener('click', () =>
        buildUniversalTable({
            mode: "interval",
            groupField: "ThemeValue",
            columnTitle: "Тематика",
            saveButtonId: "SaveIntervalCSV"
        })
    );

    const switchToIntervalGraphButton = document.getElementById('SwitchToIntervalGraph');
    switchToIntervalGraphButton.addEventListener('click', () => {
        drawUniversalGraph({
            mode: "interval",
            groupField: "ThemeValue",
            chartType: "line",
            title: "Тематика"
        });
    });

    const SaveIntervalCSVButton = document.getElementById('SaveIntervalCSV');
    SaveIntervalCSVButton.addEventListener('click', saveToCSVInterval);

    const switchToIntervalTableCountryButton = document.getElementById('SwitchToIntervalTableCountry');
    switchToIntervalTableCountryButton.addEventListener('click', () =>
        buildUniversalTable({
            mode: "interval",
            groupField: "Country",
            columnTitle: "Страна",
            saveButtonId: "SaveIntervalCountryCSV"
        })
    );

    const switchToIntervalGraphCountryButton = document.getElementById('SwitchToIntervalGraphCountry');
    switchToIntervalGraphCountryButton.addEventListener('click', () => {
        drawUniversalGraph({
            mode: "interval",
            groupField: "Country",
            chartType: "line",
            title: "Страна"
        });
    });

    const SaveIntervalСountryCSVButton = document.getElementById('SaveIntervalСountryCSV');
    SaveIntervalСountryCSVButton.addEventListener('click', SaveIntervalСountryCSV);

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
                    console.log('Invalid JSON for:', str, 'Error:', e.message);
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

    document.getElementById('SaveСountryTableCSV').onclick = function () {
        SaveСountryCSV('Country_Aggregated.csv');
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

function toggleBlock({ containerId, blockId, extraId }) {
    const block = document.getElementById(blockId);
    const extra = extraId ? document.getElementById(extraId) : null;
    const container = document.getElementById(containerId);

    const isHidden = window.getComputedStyle(block).display === "none";


    if (isHidden) {
        block.style.display = blockId === "activeoperatorsgroup" ? "grid" : "";
        if (extra) extra.style.display = "";
        container.classList.add("glowing-border-animation");

        // --- Специальная логика для othercontainer ---
        if (containerId === "othercontainer") {
            otherfilters = "on";
            console.log("otherfilters:", otherfilters);
        }

    } else {
        block.style.display = "none";
        if (extra) extra.style.display = "none";
        container.classList.remove("glowing-border-animation");

        // --- Специальная логика для othercontainer ---
        if (containerId === "othercontainer") {
            otherfilters = "off";
            console.log("otherfilters:", otherfilters);
        }
    }
}

document.getElementById('opscontainer').onclick = () =>
    toggleBlock({
        containerId: 'opscontainer',
        blockId: 'activeoperatorsgroup',
        extraId: 'hideselecall'
    });

document.getElementById('markscontainer').onclick = () =>
    toggleBlock({
        containerId: 'markscontainer',
        blockId: 'listofthemarks',
        extraId: 'hideselecallmarks'
    });

document.getElementById('tagscontainer').onclick = () =>
    toggleBlock({
        containerId: 'tagscontainer',
        blockId: 'listofthetags',
        extraId: 'hideselecalltags'
    });

document.getElementById('othercontainer').onclick = () =>
    toggleBlock({
        containerId: 'othercontainer',
        blockId: 'listofotheroptions',
        extraId: null
    });

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

document.getElementById('dayplus').onclick = function () {
    const adjustDate = (dateId) => {
        let date = new Date(document.getElementById(dateId).value);
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    };

    document.getElementById('dateFromGrab').value = adjustDate('dateFromGrab');
    document.getElementById('dateToGrab').value = adjustDate('dateToGrab');
}

document.getElementById('dayminus').onclick = function () {
    const adjustDate = (dateId) => {
        let date = new Date(document.getElementById(dateId).value);
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    };

    document.getElementById('dateFromGrab').value = adjustDate('dateFromGrab');
    document.getElementById('dateToGrab').value = adjustDate('dateToGrab');
}