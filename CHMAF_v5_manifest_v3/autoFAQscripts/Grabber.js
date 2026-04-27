// --- VARIABLES & STATE ---
let chosentheme;
let pureArray = [];
let filteredArrayTags = [];
let cleanedarray = [];
let themesarray = [];
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
let otherfilters = "off";
let keyMatch = "Высокий";
let currentTableData = [];
let isDescending = true; // Сортировка по умолчанию DESC
let lastTableParams = null;
let criticalChats = new Map();
let dataToRender = [];

// STATE ДЛЯ УНИВЕРСАЛЬНЫХ ФИЛЬТРОВ И ГРАФИКОВ
let tableColumnFilters = {};
let currentFilterColIndex = -1;
let currentChartState = null;

const timeOptions = {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
};

const categoryMap = [
    { key: "Категория: Техподдержка 2-я линия crm2", label: "2ЛТП" },
    { key: "Категория: Техподдержка исход crm2", label: "ТП исход" },
    { key: "Категория: Teachers Care crm2", label: "Teachers Care" },
    { key: "Категория: Исходящие звонки (crm2)", label: "Исходящие звонки (crm2)" },
    { key: "Категория: Кризис менеджеры", label: "Кризис менеджеры" }
];

// --- THEMES ---
const themes = [
    { value: "parseallthemes", label: "ALL", style: "background-color:#0d9488; color:white; font-weight:700;" },
    { value: "parsenothemes", label: "Without themes", style: "background-color:#e11d48; color:white; font-weight:700;" },
    { group: "skmob", label: "Skyeng👨‍🎓Mob" },
    { value: "1804", label: "📱‍👨‍🎓Авторизация" }, { value: "1805", label: "📱‍👨‍🎓Домашка" }, { value: "1806", label: "📱‍👨‍🎓Оплата" }, { value: "1807", label: "📱‍👨‍🎓Профиль" }, { value: "1808", label: "📱‍👨‍🎓Тренажер слов" }, { value: "1809", label: "📱‍👨‍🎓Уроки" }, { value: "1810", label: "📱‍👨‍🎓Чат" },
    { group: "tmob", label: "Teachers👽Mob" },
    { value: "1833", label: "📱👽Авторизация" }, { value: "1836", label: "📱👽Виджет расписания" }, { value: "1839", label: "📱👽Чат" }, { value: "1835", label: "📱👽Виджет финансов" }, { value: "1838", label: "📱👽Профиль" }, { value: "1840", label: "📱👽3Сторис" }, { value: "1837", label: "📱👽Страница расписания" }, { value: "1834", label: "📱👽Страница финансов" },
    { group: "sksmpartapp", label: "Skysmart👪родит" },
    { value: "1884", label: "📱👪Другое" }, { value: "1883", label: "📱👪Материалы" }, { value: "1880", label: "📱👪Предметы и баланс" }, { value: "1881", label: "📱👪Профиль родителя" }, { value: "1879", label: "📱👪Расписание" }, { value: "1882", label: "📱👪Чат" },
    { group: "skyproapp", label: "Приложение Skypro" },
    { value: "1904", label: "Skypro App - Виджет входа на урок" },
    { group: "solanka", label: "Different" },
    { value: "2034", label: "🚫Прочее" }, { value: "2030", label: "ⓂSlack-проблемы со входом" }, { value: "69", label: "☎Проблемы с телефонией" },
    { group: "payf", label: "Проблемы с оплатой" },
    { value: "1077", label: "💳Вина школы" }, { value: "1658", label: "💳Консультация" }, { value: "1661", label: "💳Карта У" }, { value: "1662", label: "💳Сбой оплаты" }, { value: "1660", label: "💳Подписки" },
    { group: "hwtr", label: "Проблемы с ДЗ" },
    { value: "1744", label: "💼Контент" }, { value: "1745", label: "💼Оценка" }, { value: "1746", label: "💼Словарь" }, { value: "1747", label: "💼Упражнение" },
    { group: "svyaz", label: "Проблемы связь" },
    { value: "1581", label: "💻ОС/брауз ниж мин" }, { value: "1589", label: "💻Консультация работы связи" }, { value: "1582", label: "💻Корп сеть/ус-во" }, { value: "1583", label: "💻ОС/браузер" }, { value: "1586", label: "💻ПК" }, { value: "1584", label: "💻Гарнитура" }, { value: "1585", label: "💻Камера" }, { value: "1580", label: "💻Блокировалось ПО" }, { value: "1594", label: "💻Не подерж браузер" }, { value: "1595", label: "💻Не подерж камера гарнитура пк" }, { value: "1593", label: "💻Сбой платф" }, { value: "1592", label: "💻Сб задерж кам" }, { value: "1587", label: "💻Инет ниж мин" }, { value: "1590", label: "💻Сб плат блок прерыв связь" }, { value: "1588", label: "💻Хар ниж мин" }, { value: "1591", label: "💻Сб задерж звука" },
    { group: "lkp", label: "Проблемы ЛКП" },
    { value: "1721", label: "👽ЛКП - Группа" }, { value: "1714", label: "👽ЛКП - Чат" }, { value: "1719", label: "👽ЛКП - Финансы" }, { value: "1717", label: "👽ЛКП - Упражнения" }, { value: "1712", label: "👽ЛКП - Карта роста" }, { value: "1716", label: "👽ЛКП - Настройки" }, { value: "1718", label: "👽ЛКП - Перерыв" }, { value: "1715", label: "👽ЛКП - Профиль" }, { value: "1720", label: "👽ЛКП - Работы на проверку" }, { value: "1713", label: "👽ЛКП - Расписание" },
    { group: "lku", label: "Проблемы ЛКУ" },
    { value: "1708", label: "👨‍🎓ЛКУ - Чат" }, { value: "1710", label: "👨‍🎓ЛКУ - Профиль" }, { value: "1706", label: "👨‍🎓ЛКУ - Виджет прогресса" }, { value: "1707", label: "👨‍🎓ЛКУ - История занятий/портфолио" }, { value: "1709", label: "👨‍🎓ЛКУ - Семья" }, { value: "1711", label: "👨‍🎓ЛКУ - Настройки" }, { value: "1705", label: "👨‍🎓ЛКУ - Навыки" }, { value: "1704", label: "👨‍🎓ЛКУ - Грамматика" },
    { group: "problvh", label: "Проблемы вход" },
    { value: "1632", label: "🔐Не привяз почт/тел" }, { value: "1635", label: "🔐Данные для входа" }, { value: "1634", label: "🔐Сброс пароля" }, { value: "1631", label: "🔐Консультация авторизации" }, { value: "1633", label: "🔐Сбой авторизации" },
    { group: "problpodk", label: "Проблемы подкл" },
    { value: "1624", label: "🔌Истекла подписка" }, { value: "1627", label: "🔌Консультациия" }, { value: "1629", label: "🔌Нет кнопки входа" }, { value: "1628", label: "🔌У не в ГУ" }, { value: "1625", label: "🔌Ур в др вр" }, { value: "1626", label: "🔌У отпуск" }, { value: "1630", label: "🔌Неактивна кнопка входа" },
    { group: "lesfunc", label: "Функционал урок" },
    { value: "1772", label: "👨‍🎓STT" }, { value: "1773", label: "👽TTT" }, { value: "1767", label: "📎Вложения" }, { value: "1771", label: "🖥Демонстрация экр" }, { value: "1768", label: "⌨Доска" }, { value: "2037", label: "📝Заметки" }, { value: "1775", label: "💨Отправка ДЗ на уроке" }, { value: "1770", label: "🔀Перекл материалов" }, { value: "1776", label: "🎵/📽Ауд/вид плеер" }, { value: "1769", label: "📙Словарь на уроке" }, { value: "1774", label: "🎯Упражнения на уроке" },
    { group: "feedbk", label: "Отзывы и пожел" },
    { value: "1970", label: "💭Vim-контент" }, { value: "1971", label: "💭Vim-оценка" }, { value: "1972", label: "💭Vim-словарь" }, { value: "1973", label: "💭Vim-упражнения" }, { value: "1966", label: "💭ЛК-ОС род" }, { value: "1965", label: "💭ЛК-перенос отмена ур" }, { value: "1967", label: "💭ЛК-профиль" }, { value: "1968", label: "💭ЛК-семья" }, { value: "1969", label: "💭ЛК чат" }, { value: "1974", label: "💭App Skyeng" }, { value: "1975", label: "💭App Teachers" }, { value: "1979", label: "💭App Skypro" }, { value: "1976", label: "💭App класс" }, { value: "1977", label: "💭App решения" }, { value: "1978", label: "💭App Skysmart род" }, { value: "1980", label: "💭Прочее" },
    { group: "difCCthemes", label: "Разные тематики с КЦ" },
    { value: "479", label: "💰КЦ-Проблемы с оплатой" }, { value: "63", label: "💻КЦ-Нет видео или звука" }, { value: "68", label: "📍КЦ-Другие тех проблемы" }, { value: "66", label: "💼КЦ-ДЗ и вирт класс" }, { value: "109", label: "💼КЦ-Сброс" }, { value: "73", label: "🏝КЦ-Отпуск У" }, { value: "107", label: "📱КЦ-Проч обр по Skyeng App" }, { value: "1249", label: "💋КЦ-Talks" }, { value: "2426", label: "Запланирована связь с пользователем" }
];

// --- CYBER-DARK UI & HTML TEMPLATE ---
var win_Grabber = `
<style>
.cdu-app-wrapper { display: flex; align-items: flex-start; gap: 15px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
.cdu-app-container { display: flex; width: 960px; color: #cbd5e1; background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); overflow: hidden; flex-shrink: 0; }
.cdu-sidebar { display: none; flex-direction: column; gap: 15px; width: 260px; flex-shrink: 0; }
.cdu-main-col { width: 100%; display: flex; flex-direction: column; padding: 15px; }
.cdu-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: rgba(30, 41, 59, 0.6); border-radius: 8px; border: 1px solid #1e293b; }
.cdu-btn { background: transparent; border: 1px solid #38bdf8; color: #38bdf8; padding: 6px 14px; border-radius: 6px; cursor: pointer; text-transform: uppercase; font-weight: bold; font-size: 11px; letter-spacing: 1px; transition: all 0.2s ease; box-shadow: 0 0 3px rgba(56, 189, 248, 0.1); display: inline-flex; justify-content: center; align-items: center; }
.cdu-btn:hover:not(:disabled) { background: #38bdf8; color: #0f172a; box-shadow: 0 0 8px #38bdf8; text-shadow: none; }
.cdu-btn:disabled { border-color: #334155; color: #475569; box-shadow: none; cursor: not-allowed; }
.cdu-btn-hide { border-color: #f43f5e; color: #f43f5e; box-shadow: 0 0 3px rgba(244, 63, 94, 0.1); }
.cdu-btn-hide:hover:not(:disabled) { background: #f43f5e; color: #fff; box-shadow: 0 0 8px #f43f5e; }
.cdu-btn-accent { border-color: #a855f7; color: #a855f7; box-shadow: 0 0 3px rgba(168, 85, 247, 0.1); }
.cdu-btn-accent:hover:not(:disabled) { background: #a855f7; color: #fff; box-shadow: 0 0 8px #a855f7; }
.cdu-progress-container { flex-grow: 1; max-width: 450px; background: #1e293b; height: 18px; border-radius: 9px; overflow: hidden; border: 1px solid #334155; margin-left: 20px; }
.cdu-progress-bar { width: 0%; height: 100%; background: linear-gradient(90deg, #38bdf8, #a855f7); color: #fff; font-size: 10px; font-weight: bold; display: flex; align-items: center; justify-content: center; transition: width 0.3s ease; }
.cdu-panel { background: rgba(15, 23, 42, 0.96); border: 1px solid #38bdf8; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.6); overflow: hidden; display: flex; flex-direction: column; }
.cdu-date-picker { background: #1e293b; border: 1px solid #38bdf8; color: #e2e8f0; padding: 4px 8px; border-radius: 4px; outline: none; transition: border-color 0.2s; font-family: monospace; }
.cdu-date-picker:focus { border-color: #a855f7; }
.cdu-filter-box { background: rgba(30, 41, 59, 0.6); border: 1px solid #334155; border-radius: 8px; cursor: pointer; text-align: center; padding: 8px; font-size: 14px; flex: 1; margin: 0 5px; transition: all 0.2s ease; user-select: none; }
.cdu-filter-box:hover { border-color: #38bdf8; color: #38bdf8; }
.glowing-border-animation { border-color: #a855f7 !important; box-shadow: 0 0 6px rgba(168, 85, 247, 0.2) !important; color: #a855f7 !important; text-shadow: none; }
.cdu-options-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #1e293b; border: 1px solid #334155; padding: 10px; border-radius: 8px; margin: 5px; max-height: 200px; overflow-y: auto; }
.cdu-checkbox-label { display: flex; align-items: center; font-size: 13px; color: #cbd5e1; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; }
.cdu-checkbox-label:hover { background: rgba(56, 189, 248, 0.1); color: #38bdf8; }
.cdu-checkbox-label input[type="checkbox"] { accent-color: #38bdf8; margin-right: 8px; width: 14px; height: 14px; cursor: pointer; }
.cdu-select { background: #1e293b; border: 1px solid #38bdf8; color: #e2e8f0; padding: 6px; border-radius: 4px; outline: none; margin: 0 15px; max-width: 300px; font-size: 13px; }
.cdu-table-wrapper { flex-grow: 1; overflow-y: auto; margin-top: 15px; border-radius: 8px; border: 1px solid #1e293b; position: relative; background: #0b0f19; max-height: 400px; }
.cdu-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.cdu-table th { background: #1e293b; color: #38bdf8; padding: 10px 5px; position: sticky; top: 0; text-transform: uppercase; border-bottom: 1px solid #38bdf8; z-index: 10; font-weight: 600; user-select: none; transition: background 0.2s; }
.cdu-table th:hover { background: rgba(56, 189, 248, 0.15); cursor: pointer; }
.cdu-table td { padding: 8px 5px; border-bottom: 1px solid #1e293b; color: #e2e8f0; }
.cdu-table tr.rowOfChatGrabbed:hover td { background: rgba(56, 189, 248, 0.08); color: #fff; cursor: pointer; }
.cdu-stat-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 10px; margin-right: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
.cdu-stat-primary { background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #38bdf8; }
.cdu-stat-accent { background: rgba(168, 85, 247, 0.2); border: 1px solid #a855f7; color: #a855f7; }
.cdu-stat-success { background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #10b981; }
.cdu-tools-header { font-size: 12px; color: #94a3b8; text-transform: uppercase; margin: 10px 0 5px; letter-spacing: 1px; border-bottom: 1px solid #334155; padding-bottom: 3px; }
.cdu-input-text { width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; outline: none; margin-bottom: 10px; transition: border-color 0.2s; }
.cdu-input-text:focus { border-color: #38bdf8; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #0f172a; border-radius: 4px; }
::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #38bdf8; }
</style>

<div class="cdu-app-wrapper">
    <div class="cdu-app-container">
        <div class="cdu-main-col">
            <div class="cdu-topbar" id="grabdata">
                <button class="cdu-btn cdu-btn-hide" id="hideMeGrabber">Hide App</button>
                <button class="cdu-btn cdu-btn-accent" id="GatherStatByThemes" disabled style="margin-left:10px;">🧮 Stats</button>
                <div class="cdu-progress-container">
                    <div id="progressBarGrabber" class="cdu-progress-bar">0%</div>
                </div>
            </div>

            <div class="cdu-topbar" id="grabbox" style="justify-content: flex-start; gap: 15px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:12px; font-weight:bold; color:#94a3b8;">Start:</span>
                    <input class="cdu-date-picker" type="date" name="FirstData" id="dateFromGrab">
                </div>
                <div>
                    <button class="cdu-btn" id="dayminus">◀ -1 Day</button>
                    <button class="cdu-btn" id="dayplus">+1 Day ▶</button>
                </div>
                <div style="display:flex; align-items:center; gap:10px; margin-left:auto;">
                    <span style="font-size:12px; font-weight:bold; color:#94a3b8;">End:</span>
                    <input class="cdu-date-picker" type="date" name="LastData" id="dateToGrab">
                </div>
            </div>

            <div style="display:flex; justify-content: space-between; margin-bottom: 10px;">
                <div id="opscontainer" class="cdu-filter-box">🔱 Operators 🦸‍♂️</div>
                <div id="markscontainer" class="cdu-filter-box">🔱 Marks 🔢</div>
                <div id="tagscontainer" class="cdu-filter-box">🔱 Tags 🏷</div>
                <div id="othercontainer" class="cdu-filter-box">🔱 Advanced Filters</div>
            </div>

            <div id="activeoperatorsgroup" class="cdu-options-grid" style="display:none;"></div>
            <label id="hideselecall" class="cdu-checkbox-label" style="display:none; color:#10b981; margin-left:10px; font-weight:bold;"><input type="checkbox" id="checkthemall"> Select All Operators</label>

            <div id="listofthemarks" class="cdu-options-grid" style="display:none; grid-template-columns: repeat(6, 1fr);">
                <label class="cdu-checkbox-label"><input type="checkbox" name="marks" value="5"> 5 🤩</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="marks" value="4"> 4 🙂</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="marks" value="3"> 3 😑</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="marks" value="2"> 2 😠</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="marks" value="1"> 1 🤬</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="marks" value="undefined"> No marks ⭕</label>
            </div>
            <label id="hideselecallmarks" class="cdu-checkbox-label" style="display:none; color:#10b981; margin-left:10px; font-weight:bold;"><input type="checkbox" id="checkthemallmarks"> Select All Marks</label>

            <div id="listofotheroptions" style="display:none; background: rgba(15, 23, 42, 0.95); border: 1px solid #38bdf8; border-radius: 8px; width:100%; padding:20px; box-sizing:border-box; margin-bottom:10px;">
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px;">
                    <div>
                        <div class="cdu-tools-header" style="text-align:center; border:none; color:#10b981;">Priority</div>
                        <label class="cdu-checkbox-label"><input type="checkbox" checked name="priorityfilter" value="Any"> Any</label>
                        <label class="cdu-checkbox-label"><input type="checkbox" name="priorityfilter" value="Низкий"> Low</label>
                        <label class="cdu-checkbox-label"><input type="checkbox" name="priorityfilter" value="Высокий"> High</label>
                        <label class="cdu-checkbox-label"><input type="checkbox" name="priorityfilter" value="Критический"> Critical</label>
                    </div>
                    <div>
                        <div class="cdu-tools-header" style="text-align:center; border:none; color:#10b981;">Department</div>
                        <label class="cdu-checkbox-label"><input type="checkbox" checked name="deptfilter" value="Any"> Any</label>
                        <label class="cdu-checkbox-label" title="Техподдержка 1Л CRM (исход)"><input type="checkbox" name="deptfilter" value="Техподдержка исход crm2"> TP Outbound</label>
                        <label class="cdu-checkbox-label" title="Техподдержка 2Л CRM"><input type="checkbox" name="deptfilter" value="Техподдержка 2-я линия crm2"> TP 2L</label>
                        <label class="cdu-checkbox-label" title="Teachers Care"><input type="checkbox" name="deptfilter" value="Teachers Care crm2"> Teachers Care</label>
                        <label class="cdu-checkbox-label" title="Кризис менеджмент"><input type="checkbox" name="deptfilter" value="Кризис менеджеры"> Crisis Management</label>
                        <label class="cdu-checkbox-label" title="Исходящие звонки crm2"><input type="checkbox" name="deptfilter" value="Исходящие звонки (crm2)"> CC Outbound</label>
                    </div>
                    <div>
                        <div class="cdu-tools-header" style="text-align:center; border:none; color:#10b981;">User Type</div>
                        <label class="cdu-checkbox-label"><input type="checkbox" checked name="usrtypefilter" value="Any"> Any</label>
                        <label class="cdu-checkbox-label"><input type="checkbox" name="usrtypefilter" value="student"> Student</label>
                        <label class="cdu-checkbox-label"><input type="checkbox" name="usrtypefilter" value="parent"> Parent</label>
                        <label class="cdu-checkbox-label"><input type="checkbox" name="usrtypefilter" value="teacher"> Teacher</label>
                        <label class="cdu-checkbox-label"><input type="checkbox" name="usrtypefilter" value="null"> Unknown</label>
                    </div>
                </div>
                <hr style="border-color:#334155; margin:15px 0;">
                <input class="cdu-input-text" placeholder="Search in Comment..." style="text-align:center;">
                <input class="cdu-input-text" placeholder="Search in Message..." style="text-align:center; margin-bottom:0;">
            </div>

            <div id="listofthetags" class="cdu-options-grid" style="display:none; margin-bottom:10px;">
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="server_issues"> Server</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="untargeted"> Untargeted</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="request_forwarded_to_tc"> ➔ TC</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="request_forwarded_to_channel_qa"> ➔ QA</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="request_forwarded_to_development"> ➔ Dev</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="refusal_of_help"> Refusal</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="request_forwarded_to_outgoing_tp_crm2"> ➔ TP Out</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="queue"> Queue</label>
                <label class="cdu-checkbox-label"><input type="checkbox" name="tagsforfilter" value="oo"> CC Error</label>
                <div style="grid-column: span 3; display:flex; gap:10px; margin-top:10px;">
                    <button class="cdu-btn" id="hideselecalltags" style="flex:1;">🚀 Apply Tag Filter</button>
                    <button class="cdu-btn cdu-btn-accent" id="SaveToCSVFilteredByTags" style="flex:1;">💾 Export Tag CSV</button>
                </div>
            </div>

            <div style="display:flex; justify-content: center; align-items:center; margin-bottom: 15px; gap: 15px;">
                <select id="ThemesToSearch" class="cdu-select"></select>
                <button class="cdu-btn" id="stargrab" title="Search chats by selected theme">🔍 Search</button>
                <button class="cdu-btn cdu-btn-accent" id="webtoCSV">💾 Download Main CSV</button>
            </div>

            <div id="grabbedchats" style="display:flex; flex-direction:column; flex-grow:1; min-height:0;">
                <div id="themesgrabbeddata" class="cdu-table-wrapper"></div>
                <div style="display:flex; flex-wrap:wrap; margin-top:10px;">
                    <div id="foundcount"></div>
                    <div id="avgCsatCount"></div>
                    <div id="avgSLAClosedData"></div>
                </div>
            </div>
        </div>
    </div>

    <div class="cdu-sidebar" id="SideBarContainer">
        <div id="UniversalFilterPanel" class="cdu-panel" style="display:none; flex-grow:0;">
            <div style="background: rgba(30,41,59,0.9); border-bottom: 1px solid #38bdf8; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span id="FilterTitle" style="color:#38bdf8; font-weight:bold; font-size:12px; text-transform:uppercase;">Filter</span>
                <span id="CloseFilterBtn" style="cursor:pointer; color:#f43f5e; font-weight:bold; font-size: 16px;" title="Close">✖</span>
            </div>
            <div style="padding: 15px;">
                <div id="FilterCheckboxList" style="max-height: 250px; overflow-y: auto; margin-bottom: 10px; display:flex; flex-direction:column; gap:5px;">
                    </div>
                <div style="display: flex; gap: 5px;">
                   <button class="cdu-btn" id="FilterSelectAll" style="flex:1;">Select All</button>
                   <button class="cdu-btn" id="FilterClearAll" style="flex:1;">Clear All</button>
                </div>
                <button class="cdu-btn cdu-btn-accent" id="DownloadFilteredCSV" style="width:100%; margin-top:10px;">💾 Save Visible to CSV</button>
            </div>
        </div>
    </div>
</div>

<div id="AgregatedDataThemes" class="cdu-panel" style="display:none; position:fixed; top:80px; left:60px; z-index:9999; flex-direction: column; transition: width 0.3s ease;">
    <div id="StatsDragHandle" style="cursor:move; background: rgba(30,41,59,0.9); border-bottom: 1px solid #a855f7; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color:#a855f7; font-weight:bold; font-size:12px; text-transform:uppercase;">📊 Analytics Board</span>
        <span id="HideToolsPanel" style="cursor:pointer; color:#f43f5e; font-weight:bold; font-size: 16px;" title="Close">✖</span>
    </div>
    <div style="padding:15px; max-height:80vh; overflow-y:auto; flex-grow: 1;">
        <div class="cdu-tools-header">By Theme (Chart/Table)</div>
        <div style="display:flex; gap:5px; margin-bottom:5px;">
            <button class="cdu-btn" id="SwitchToGraph" style="flex:1;">📊 Base</button>
            <button class="cdu-btn" id="SwitchToTable" style="flex:1;">🧮 Base</button>
        </div>
        <div style="display:flex; gap:5px; margin-bottom:5px;">
            <button class="cdu-btn" id="SwitchToIntervalGraph" style="flex:1;">📊 Timeline</button>
            <button class="cdu-btn" id="SwitchToIntervalTable" style="flex:1;">🧮 Timeline</button>
        </div>
        <button class="cdu-btn cdu-btn-accent" id="SaveIntervalCSV" disabled style="width:100%; margin-bottom:15px;">💾 Export Theme Timeline CSV</button>

        <div class="cdu-tools-header">By Country (Chart/Table)</div>
        <div style="display:flex; gap:5px; margin-bottom:5px;">
            <button class="cdu-btn" id="SwitchToGraphCountry" style="flex:1;">📊 Base</button>
            <button class="cdu-btn" id="SwitchToTableCountry" style="flex:1;">🧮 Base</button>
        </div>
        <button class="cdu-btn cdu-btn-accent" id="SaveСountryTableCSV" style="width:100%; margin-bottom:5px;">💾 Export Country Base CSV</button>
        <div style="display:flex; gap:5px; margin-bottom:5px;">
            <button class="cdu-btn" id="SwitchToIntervalGraphCountry" style="flex:1;">📊 Timeline</button>
            <button class="cdu-btn" id="SwitchToIntervalTableCountry" style="flex:1;">🧮 Timeline</button>
        </div>
        <button class="cdu-btn cdu-btn-accent" id="SaveIntervalСountryCSV" disabled style="width:100%;">💾 Export Country Timeline CSV</button>

        <div id="AgregatedDataOut" style="margin-top: 15px; max-width: 100%; overflow-x: auto;"></div>
    </div>
</div>
`;

// INITIALIZATION CALLS
const wintGrabber = createWindow('AF_Grabber', 'winTopGrabber', 'winLeftGrabber', win_Grabber);
hideWindowOnDoubleClick('AF_Grabber');
hideWindowOnClick('AF_Grabber', 'hideMeGrabber');

// --- ROBUST DRAGGABLE LOGIC FOR STATS PANEL ---
function makeDraggable(elementId, handleId) {
    const element = document.getElementById(elementId);
    const handle = document.getElementById(handleId);
    if (!element || !handle) return;
    if (element.dataset.draggableAttached) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = function (e) {
        e.preventDefault();
        e.stopPropagation(); // БЛОКИРОВКА ВСПЛЫТИЯ (фикст таскание родительского окна)
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    };
    function elementDrag(e) {
        e.preventDefault();
        e.stopPropagation(); // БЛОКИРОВКА ВСПЛЫТИЯ
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    }
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
    element.dataset.draggableAttached = "true";
}

document.getElementById('HideToolsPanel').onclick = () => document.getElementById('AgregatedDataThemes').style.display = 'none';
document.getElementById('GatherStatByThemes').onclick = () => {
    const pnl = document.getElementById('AgregatedDataThemes');
    pnl.style.display = pnl.style.display === 'none' ? 'flex' : 'none';
    makeDraggable('AgregatedDataThemes', 'StatsDragHandle');
}

// --- SIDEBAR TOGGLE LOGIC (Filters ONLY) ---
function toggleFilterSidebar(forceOpen = false) {
    const sidebar = document.getElementById('SideBarContainer');
    const panel = document.getElementById('UniversalFilterPanel');

    if (forceOpen || panel.style.display === 'none') {
        sidebar.style.display = 'flex';
        panel.style.display = 'flex';
    } else {
        panel.style.display = 'none';
        sidebar.style.display = 'none';
    }
}
document.getElementById('CloseFilterBtn').onclick = () => toggleFilterSidebar(false);


// --- UNIVERSAL COLUMN FILTERING LOGIC ---
function openColumnFilter(colIndex, colName) {
    currentFilterColIndex = colIndex;
    document.getElementById('FilterTitle').textContent = `Filter: ${colName}`;
    const rows = document.querySelectorAll('.rowOfChatGrabbed');
    const uniqueValues = new Set();

    rows.forEach(row => uniqueValues.add(row.cells[colIndex].textContent.trim()));

    if (!tableColumnFilters[colIndex]) tableColumnFilters[colIndex] = new Set(uniqueValues);
    const activeSet = tableColumnFilters[colIndex];
    const listContainer = document.getElementById('FilterCheckboxList');
    listContainer.innerHTML = '';

    const sortedValues = Array.from(uniqueValues).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    sortedValues.forEach(val => {
        const isChecked = activeSet.has(val) ? 'checked' : '';
        const label = document.createElement('label');
        label.className = 'cdu-checkbox-label';

        const safeVal = val.replace(/"/g, '&quot;');
        label.innerHTML = `<input type="checkbox" value="${safeVal}" ${isChecked}> <span style="word-break: break-all;">${val === '' ? '(Empty)' : val}</span>`;

        const input = label.querySelector('input');
        input.addEventListener('change', (e) => {
            if (e.target.checked) activeSet.add(val);
            else activeSet.delete(val);
            applyTableFilters();
        });
        listContainer.appendChild(label);
    });

    toggleFilterSidebar(true);
}

function applyTableFilters() {
    const rows = document.querySelectorAll('.rowOfChatGrabbed');
    rows.forEach(row => {
        let isVisible = true;
        for (const colIdx in tableColumnFilters) {
            const cellVal = row.cells[colIdx].textContent.trim();
            if (!tableColumnFilters[colIdx].has(cellVal)) {
                isVisible = false;
                break;
            }
        }
        row.style.display = isVisible ? '' : 'none';
    });
    calcAvgCsat();
    calcAvgSLACompleted();
}

document.getElementById('FilterSelectAll').onclick = () => {
    document.querySelectorAll('#FilterCheckboxList input[type="checkbox"]').forEach(input => {
        input.checked = true;
        tableColumnFilters[currentFilterColIndex].add(input.value.replace(/&quot;/g, '"'));
    });
    applyTableFilters();
};

document.getElementById('FilterClearAll').onclick = () => {
    document.querySelectorAll('#FilterCheckboxList input[type="checkbox"]').forEach(input => {
        input.checked = false;
        tableColumnFilters[currentFilterColIndex].delete(input.value.replace(/&quot;/g, '"'));
    });
    applyTableFilters();
};

document.getElementById('DownloadFilteredCSV').onclick = saveFilteredTableCSV;

// --- ANY LOGIC SETUP ---
function setupAnyLogic(groupName) {
    const checkboxes = document.querySelectorAll(`input[name="${groupName}"]`);
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (cb.value === "Any" && cb.checked) {
                checkboxes.forEach(other => { if (other.value !== "Any") other.checked = false; });
            } else if (cb.value !== "Any" && cb.checked) {
                checkboxes.forEach(other => { if (other.value === "Any") other.checked = false; });
            }
        });
    });
}
setupAnyLogic("priorityfilter");
setupAnyLogic("deptfilter");
setupAnyLogic("usrtypefilter");

const commentInputEl = document.querySelector('#listofotheroptions input[placeholder="Search in Comment..."]');
const messageInputEl = document.querySelector('#listofotheroptions input[placeholder="Search in Message..."]');

commentInputEl.addEventListener("input", () => { if (commentInputEl.value.trim() !== "") messageInputEl.value = ""; });
messageInputEl.addEventListener("input", () => { if (messageInputEl.value.trim() !== "") commentInputEl.value = ""; });

function getCheckedValues(name) {
    const arr = [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
    return arr.length ? arr : ["Any"];
}

function collectOtherFilters() {
    const priority = getCheckedValues("priorityfilter");
    const dept = getCheckedValues("deptfilter");
    const usertype = getCheckedValues("usrtypefilter");
    const commentInput = commentInputEl.value.trim();
    const messageInput = messageInputEl.value.trim();
    const markscheklist = document.getElementsByName('marks');
    const csatValues = [];
    for (let i = 0; i < markscheklist.length - 1; i++) {
        if (markscheklist[i].checked) csatValues.push(Number(markscheklist[i].value));
    }
    const csatIncludeUndefined = markscheklist[5]?.checked === true;
    let theme = '';
    const selTheme = document.getElementById('ThemesToSearch').options;
    for (let i = 0; i < selTheme.length; i++) {
        if (selTheme[i].selected) theme = selTheme[i].value;
    }
    return { priority, dept, usertype, commentInput, messageInput, csatValues, csatIncludeUndefined, theme };
}

async function getlistofopers() {
    await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", { "headers": { "x-csrf-token": aftoken } })
        .then(r => r.json())
        .then(r => dataInfo = r);

    let tpopers = dataInfo.onOperator
        .map(el => el.groupId === "c7bbb211-a217-4ed3-8112-98728dc382d8" ? ({ id: el.operator.id, name: el.operator.fullName }) : el.groupId === "8266dbb1-db44-4910-8b5f-a140deeec5c0" ? ({ id: el.operator.id, name: el.operator.fullName }) : null)
        .filter(el => el !== null)
        .filter(el => /ТП[^0-9]/.test(el.name));

    const activeOperatorsGroup = document.getElementById('activeoperatorsgroup');
    activeOperatorsGroup.innerHTML = '';
    for (let i = 0; i < tpopers.length; i++) {
        if (tpopers[i].name !== 'ТП/ОКК-Березкин Александр' && tpopers[i].name !== 'ТП-Борисов Евгений(СRM2)') {
            activeOperatorsGroup.innerHTML += `<label class="cdu-checkbox-label"><input type="checkbox" name="chekforsearch" checked><span name="listofops" value='${tpopers[i].id}'>${tpopers[i].name}</span></label>`;
        }
    }
    document.getElementById('checkthemall').checked = true;

    let listofchkbxmarks = document.getElementsByName('marks');
    for (let i = 0; i < listofchkbxmarks.length; i++) { listofchkbxmarks[i].checked = true; }
    document.getElementById('checkthemallmarks').checked = true;
}

function calcAvgCsat() {
    const csatCells = document.getElementsByName('CSATvalue');
    const marks = [];

    for (let i = 0; i < csatCells.length; i++) {
        const row = csatCells[i].parentElement;
        if (row && window.getComputedStyle(row).display === "none") continue;

        const cellValue = csatCells[i].textContent;
        if (cellValue === '-' || cellValue.trim() === '') continue;

        const numeric = Number(cellValue);
        if (!isNaN(numeric)) marks.push(numeric);
    }

    let sum = 0;
    for (const m of marks) sum += m;
    const avg = marks.length > 0 ? (sum / marks.length) : 0;
    const safeAvg = Number.isFinite(avg) ? avg : 0;

    document.getElementById('avgCsatCount').innerHTML = `<span class="cdu-stat-badge cdu-stat-primary">Avg CSAT: ${safeAvg.toFixed(2)}</span>`;
}

function calcAvgSLACompleted() {
    const SLACompContainer = document.getElementsByName('SLACompletedValue');
    let outtimedCount = 0;
    let totalVisible = 0;

    for (let i = 0; i < SLACompContainer.length; i++) {
        const row = SLACompContainer[i].parentElement;
        if (row && window.getComputedStyle(row).display === "none") continue;
        totalVisible++;
        if (SLACompContainer[i].textContent === "0") outtimedCount++;
    }

    const percent = totalVisible > 0 ? ((totalVisible - outtimedCount) / totalVisible) * 100 : 0;
    document.getElementById('avgSLAClosedData').innerHTML = `<span class="cdu-stat-badge cdu-stat-accent">SLA Closing: ${percent.toFixed(1)}%</span>`;
}

function saveFilteredTableCSV() {
    let nwtable = document.getElementById("TableGrabbed");
    if (!nwtable) return;
    let csvData = [];
    for (let i = 0; i < nwtable.rows.length; i++) {
        if (window.getComputedStyle(nwtable.rows[i]).display !== "none") {
            let rowData = [];
            for (let j = 0; j < nwtable.rows[i].cells.length; j++) {
                rowData.push(`"${nwtable.rows[i].cells[j].textContent.trim().replace(/"/g, '""')}"`);
            }
            csvData.push(rowData.join(","));
        }
    }
    let csvContent = "\uFEFF" + csvData.join("\n");
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
        if (t.group) opt.style.fontWeight = 'bold';
        select.appendChild(opt);
    });

    themesarray = [];
    const parseThemesAndVals = document.getElementById('ThemesToSearch');
    for (let i = 0; i < parseThemesAndVals.length; i++) {
        themesarray.push({ value: parseThemesAndVals[i].value, ThemeName: parseThemesAndVals[i].textContent });
    }

    const modal = document.getElementById('AF_Grabber');
    modal.style.display = modal.style.display === '' ? 'none' : '';

    let getcurdate = new Date();
    let year = getcurdate.getFullYear();
    let day = String(getcurdate.getDate()).padStart(2, "0");
    let lastDayOfPrevMonth = new Date(year, getcurdate.getMonth(), 0).getDate();
    let toDate = new Date(year, getcurdate.getMonth(), day);

    if (day === "01") {
        dateFromGrab = new Date(year, getcurdate.getMonth() - 1, lastDayOfPrevMonth);
        dateToGrab = new Date(year, getcurdate.getMonth(), 1);
    }

    document.getElementById("dateFromGrab").value = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;
    document.getElementById("dateToGrab").value = `${toDate.getFullYear()}-${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}`;

    getlistofopers();
}

document.getElementById('checkthemall').onclick = function () {
    const c = !this.checked;
    this.checked = !c;
    document.getElementsByName('chekforsearch').forEach(cb => cb.checked = !c);
};

document.getElementById('checkthemallmarks').onclick = function () {
    const c = !this.checked;
    this.checked = !c;
    document.getElementsByName('marks').forEach(cb => cb.checked = !c);
};

function getSelectedCheckboxTagsValues() { return [...document.querySelectorAll('input[name="tagsforfilter"]:checked')].map(cb => cb.value); }

function buildUniversalTable({ mode, groupField, columnTitle, saveButtonId }) {
    document.getElementById('AgregatedDataThemes').style.width = "450px";
    const tableContainer = document.getElementById('AgregatedDataOut');
    tableContainer.innerHTML = '';

    isDescending = true; // Сбрасываем сортировку на DESC при каждом новом построении
    let data = mode === "interval" ? buildIntervalData(groupField) : buildSimpleData(groupField);
    currentTableData = data;

    const table = buildHTMLTable(data, columnTitle, mode, groupField);
    tableContainer.appendChild(table);

    if (saveButtonId) document.getElementById(saveButtonId).removeAttribute('disabled');
    lastTableParams = { mode, groupField, columnTitle, saveButtonId };
}

function isTimeInInterval(time, start, end) {
    if (end === "00:00") end = "24:00";
    return time >= start && time < end;
}

function buildIntervalData(groupField) {
    const intervals = [
        '07:00 - 07:30', '07:30 - 08:00', '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00',
        '11:00 - 11:30', '11:30 - 12:00', '12:00 - 12:30', '12:30 - 13:00', '13:00 - 13:30', '13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00',
        '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00', '17:00 - 17:30', '17:30 - 18:00', '18:00 - 18:30', '18:30 - 19:00',
        '19:00 - 19:30', '19:30 - 20:00', '20:00 - 20:30', '20:30 - 21:00', '21:00 - 21:30', '21:30 - 22:00', '22:00 - 22:30', '22:30 - 23:00',
        '23:00 - 23:30', '23:30 - 00:00'
    ];

    const result = payloadarray.reduce((acc, obj) => {
        const value = obj[groupField];
        const timeMatch = obj.timeStamp.match(/\b(\d{1,2}:\d{2})\b/);
        const timeKey = timeMatch ? timeMatch[1].padStart(5, '0') : "00:00";

        const interval = intervals.find(inv => {
            const [s, e] = inv.split(' - ');
            return isTimeInInterval(timeKey, s, e);
        });

        if (interval) {
            acc.counts[interval] = acc.counts[interval] || {};
            acc.counts[interval][value] = (acc.counts[interval][value] || 0) + 1;
        }
        return acc;
    }, { counts: {} });

    const data = Object.entries(result.counts).flatMap(([interval, counts]) =>
        Object.entries(counts).map(([value, count]) => ({
            [groupField]: value,
            TimeStamp: interval,
            Count: count
        }))
    );

    data.sort((a, b) => a.TimeStamp.localeCompare(b.TimeStamp));
    countsArrayInterval = data;
    return data;
}

function buildSimpleData(groupField) {
    const targetArray = groupField === "Country" ? pureArray : payloadarray;
    const counts = targetArray.reduce((acc, obj) => {
        const value = obj[groupField];
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});

    let result = Object.entries(counts).map(([value, count]) => ({ [groupField]: value, Count: count }));
    // Сортировка по умолчанию (от большего к меньшему)
    result.sort((a, b) => b.Count - a.Count);
    return result;
}

function buildHTMLTable(data, columnTitle, mode, groupField) {
    const table = document.createElement('table');
    table.className = 'cdu-table';
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Добавляем индикатор сортировки для красоты и понимания
    const countTitle = `Count ${isDescending ? '▼' : '▲'}`;
    const headers = mode === "interval" ? ['№', columnTitle, 'Interval', countTitle] : ['№', columnTitle, countTitle];

    headers.forEach((text) => {
        const th = document.createElement('th');
        th.textContent = text;
        if (text.includes("Count")) {
            th.style.cursor = "pointer";
            th.title = "Click to sort";
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
            row.innerHTML = `<td>${index + 1}</td><td>${item[groupField]}</td><td>${item.TimeStamp}</td><td>${item.Count}</td>`;
        } else {
            row.innerHTML = `<td>${index + 1}</td><td>${item[groupField]}</td><td>${item.Count}</td>`;
        }
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    return table;
}

function rebuildLastTable() { if (lastTableParams) buildUniversalTable(lastTableParams); }
function sortUniversalTableByCount() {
    isDescending = !isDescending; // Меняем флаг ДО сортировки, чтобы таблица перестроилась
    currentTableData.sort((a, b) => isDescending ? b.Count - a.Count : a.Count - b.Count);

    const tableContainer = document.getElementById('AgregatedDataOut');
    tableContainer.innerHTML = '';
    const table = buildHTMLTable(currentTableData, lastTableParams.columnTitle, lastTableParams.mode, lastTableParams.groupField);
    tableContainer.appendChild(table);
}

// --- NEW INTERACTIVE CHART LOGIC ---
function drawUniversalGraph({ mode, groupField, chartType, title }) {
    // Вычисляем оптимальную ширину на основе экрана (максимум 90% или 1400px)
    const maxWidth = Math.min(window.innerWidth * 0.9, 1400);
    const panelWidth = mode === "interval" ? maxWidth : 940; // Base график может быть 940, Timeline - шире

    document.getElementById('AgregatedDataThemes').style.width = panelWidth + "px";

    const graphContainer = document.getElementById('AgregatedDataOut');
    graphContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = panelWidth - 40;
    canvas.height = 450;
    canvas.style.width = "100%";
    canvas.style.height = "auto";
    graphContainer.appendChild(canvas);

    let labels = [];
    let datasets = [];

    if (mode === "simple") {
        let source = buildSimpleData(groupField); // Он уже отсортирован по убыванию
        labels = source.map(item => item[groupField]);
        const colors = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
        datasets = [{
            label: "Count",
            data: source.map(item => item.Count),
            colors: labels.map((_, i) => colors[i % colors.length])
        }];
    } else if (mode === "interval") {
        const intervals = [
            '07:00 - 07:30', '07:30 - 08:00', '08:00 - 08:30', '08:30 - 09:00', '09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00',
            '11:00 - 11:30', '11:30 - 12:00', '12:00 - 12:30', '12:30 - 13:00', '13:00 - 13:30', '13:30 - 14:00', '14:00 - 14:30', '14:30 - 15:00',
            '15:00 - 15:30', '15:30 - 16:00', '16:00 - 16:30', '16:30 - 17:00', '17:00 - 17:30', '17:30 - 18:00', '18:00 - 18:30', '18:30 - 19:00',
            '19:00 - 19:30', '19:30 - 20:00', '20:00 - 20:30', '20:30 - 21:00', '21:00 - 21:30', '21:30 - 22:00', '22:00 - 22:30', '22:30 - 23:00',
            '23:00 - 23:30', '23:30 - 00:00'
        ];
        labels = intervals;

        const result = payloadarray.reduce((acc, obj) => {
            const value = obj[groupField];
            const timeMatch = obj.timeStamp.match(/\b(\d{1,2}:\d{2})\b/);
            const timeKey = timeMatch ? timeMatch[1].padStart(5, '0') : "00:00";

            const interval = intervals.find(inv => {
                const [s, e] = inv.split(' - ');
                return isTimeInInterval(timeKey, s, e);
            });

            if (interval) {
                acc.counts[interval] = acc.counts[interval] || {};
                acc.counts[interval][value] = (acc.counts[interval][value] || 0) + 1;
            }
            acc.unique.add(value);
            return acc;
        }, { counts: {}, unique: new Set() });

        const colors = ['#38bdf8', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'];
        datasets = Array.from(result.unique).map((value, idx) => ({
            label: value,
            data: intervals.map(inv => (result.counts[inv] && result.counts[inv][value]) ? result.counts[inv][value] : 0),
            color: colors[idx % colors.length]
        }));
    }

    currentChartState = { canvas, mode, chartType, labels, datasets, hiddenItems: new Set() };
    canvas.addEventListener('click', handleChartClick);

    renderCyberChartInteractive();
}

function handleChartClick(e) {
    if (!currentChartState || !currentChartState.canvas.__legendBoxes) return;

    const canvas = currentChartState.canvas;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Сначала проверяем клик по легенде
    let clickedItemLabel = null;
    const clickedLegend = canvas.__legendBoxes.find(b => clickX >= b.x && clickX <= b.x + b.w && clickY >= b.y && clickY <= b.y + b.h);

    if (clickedLegend) {
        clickedItemLabel = clickedLegend.label;
    } else if (canvas.__dataShapes) {
        // Если не легенда, проверяем элементы графика (хитбоксы столбцов или увеличенные хитбоксы точек)
        const clickedShape = canvas.__dataShapes.find(s => {
            if (s.type === 'rect') {
                return clickX >= s.x && clickX <= s.x + s.w && clickY >= s.y && clickY <= s.y + s.h;
            }
            if (s.type === 'circle') {
                return Math.hypot(clickX - s.cx, clickY - s.cy) <= s.r;
            }
            return false;
        });
        if (clickedShape) clickedItemLabel = clickedShape.label;
    }

    // Если кликнули по чему-то осмысленному
    if (clickedItemLabel) {
        const hidden = currentChartState.hiddenItems;
        const allItems = currentChartState.mode === "simple" ? currentChartState.labels : currentChartState.datasets.map(d => d.label);

        if (e.ctrlKey || e.metaKey) {
            if (hidden.has(clickedItemLabel)) hidden.delete(clickedItemLabel);
            else hidden.add(clickedItemLabel);
        } else {
            const isOnlyVisible = !hidden.has(clickedItemLabel) && hidden.size === allItems.length - 1;
            if (isOnlyVisible) {
                hidden.clear();
            } else {
                hidden.clear();
                allItems.forEach(i => { if (i !== clickedItemLabel) hidden.add(i); });
            }
        }
        renderCyberChartInteractive();
    }
}

function renderCyberChartInteractive() {
    const { canvas, mode, chartType, labels, datasets, hiddenItems } = currentChartState;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    let h = canvas.height;

    let activeLabels = [];
    let activeDatasets = [];

    if (mode === "simple") {
        activeLabels = labels.filter(l => !hiddenItems.has(l));
        const filteredData = datasets[0].data.filter((_, i) => !hiddenItems.has(labels[i]));
        const filteredColors = datasets[0].colors.filter((_, i) => !hiddenItems.has(labels[i]));
        activeDatasets = [{ ...datasets[0], data: filteredData, colors: filteredColors }];
    } else {
        activeLabels = labels;
        activeDatasets = datasets.filter(ds => !hiddenItems.has(ds.label));
    }

    const padL = 35, padR = 15, padB = 80;
    canvas.__legendBoxes = [];
    canvas.__dataShapes = []; // Хранилище хитбоксов для кликов по графику

    let legX = 10;
    let legY = 10;
    const legendItems = mode === "simple" ? labels : datasets.map(ds => ds.label);
    const legendColors = mode === "simple" ? datasets[0].colors : datasets.map(ds => ds.color);

    ctx.font = '12px sans-serif';
    legendItems.forEach((itemLabel, i) => {
        const textWidth = ctx.measureText(itemLabel).width;
        const itemWidth = 18 + textWidth + 15;

        if (legX + itemWidth > w - 10) {
            legX = 10;
            legY += 20;
        }
        canvas.__legendBoxes.push({ label: itemLabel, x: legX, y: legY, w: itemWidth, h: 15, color: legendColors[i] });
        legX += itemWidth;
    });

    const padT = legY + 30;
    if (h < padT + 200) {
        canvas.height = padT + 300;
        h = canvas.height;
    }

    ctx.clearRect(0, 0, w, h);
    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    // Отрисовка легенды
    canvas.__legendBoxes.forEach(box => {
        const isHidden = hiddenItems.has(box.label);
        ctx.fillStyle = isHidden ? '#334155' : box.color;
        ctx.fillRect(box.x, box.y, 12, 12);
        ctx.fillStyle = isHidden ? '#64748b' : '#e2e8f0';
        ctx.textAlign = 'left';
        ctx.fillText(box.label, box.x + 18, box.y + 10);
    });

    if (activeDatasets.length === 0 || (mode === "simple" && activeLabels.length === 0)) return;

    let maxVal = Math.max(...activeDatasets.flatMap(ds => ds.data.length ? ds.data : [0]));
    maxVal = maxVal === 0 ? 10 : Math.ceil(maxVal * 1.2);

    // Сетка
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
    ctx.lineWidth = 1;
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const y = padT + (chartH * (ySteps - i) / ySteps);
        ctx.moveTo(padL, y); ctx.lineTo(w - padR, y);
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal * i / ySteps), padL - 5, y + 4);
    }
    ctx.stroke();

    // Подписи X
    const xStep = chartW / Math.max(activeLabels.length, 1);
    ctx.fillStyle = '#cbd5e1';
    activeLabels.forEach((lbl, i) => {
        const x = padL + (i * xStep) + (xStep / 2);
        ctx.save();
        ctx.translate(x, h - padB + 20);
        ctx.rotate(-Math.PI / 6);
        ctx.textAlign = 'right';

        let displayLbl = lbl;
        if (displayLbl.length > 15) displayLbl = displayLbl.substring(0, 15) + '...';
        ctx.fillText(displayLbl, 0, 0);
        ctx.restore();
    });

    // Данные
    if (chartType === 'bar' && mode === "simple") {
        const ds = activeDatasets[0];
        const barW = (xStep * 0.7);
        activeLabels.forEach((labelName, i) => {
            const val = ds.data[i] || 0;
            const barColor = ds.colors[i] || '#38bdf8';
            const barH = (val / maxVal) * chartH;
            const x = padL + (i * xStep) + (xStep * 0.15);
            const y = padT + chartH - barH;

            ctx.fillStyle = barColor;
            ctx.shadowBlur = 3;
            ctx.shadowColor = barColor;
            ctx.fillRect(x, y, barW, barH);
            ctx.shadowBlur = 0;

            // Записываем хитбокс для клика
            canvas.__dataShapes.push({ label: labelName, type: 'rect', x, y, w: barW, h: barH });
        });
    } else if (chartType === 'line' && mode === "interval") {
        activeDatasets.forEach(ds => {
            const lineColor = ds.color || '#a855f7';
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 3;
            ctx.shadowColor = lineColor;

            ctx.beginPath();
            activeLabels.forEach((_, i) => {
                const val = ds.data[i] || 0;
                const x = padL + (i * xStep) + (xStep / 2);
                const y = padT + chartH - ((val / maxVal) * chartH);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#0f172a';
            activeLabels.forEach((_, i) => {
                const val = ds.data[i] || 0;
                const x = padL + (i * xStep) + (xStep / 2);
                const y = padT + chartH - ((val / maxVal) * chartH);

                ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

                // Хитбокс для точки: даем комфортный радиус в 12px, чтобы было легко попасть мышкой
                canvas.__dataShapes.push({ label: ds.label, type: 'circle', cx: x, cy: y, r: 12 });
            });
        });
    }
}

// --- CSV SAVING ---
function triggerDownload(csvContent, filename) {
    const downloadLink = document.createElement("a");
    downloadLink.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    downloadLink.setAttribute("download", filename);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function saveToCSVInterval() {
    let csvContent = "\uFEFFTimeStamp,ThemeValue,Count\n";
    countsArrayInterval.forEach(({ TimeStamp, ThemeValue, Count }) => csvContent += `${TimeStamp},${ThemeValue},${Count}\n`);
    triggerDownload(csvContent, "data.csv");
}

function SaveIntervalСountryCSV() {
    let csvContent = "\uFEFFTimeStamp,Country,Count\n";
    countsArrayInterval.forEach(({ TimeStamp, Country, Count }) => csvContent += `${TimeStamp},${Country},${Count}\n`);
    triggerDownload(csvContent, "data.csv");
}

function SaveСountryCSV(filename) {
    const csvRows = [];
    const headers = Array.from(document.querySelectorAll('#AgregatedDataOut thead th')).map(h => h.innerText);
    csvRows.push(headers.join(','));
    const rows = document.querySelectorAll('#AgregatedDataOut tbody tr');
    for (const row of rows) {
        csvRows.push(Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).join(','));
    }
    triggerDownload("\uFEFF" + csvRows.join('\n'), filename);
}

function resolveThemeLabel(topicValue) {
    if (!topicValue) return '⁉No theme';
    const theme = themes.find(t => t.value === String(topicValue));
    return theme ? theme.label : '⁉Unknown theme';
}

async function getChat(id) {
    return await fetch(`https://skyeng.autofaq.ai/api/conversations/${id}`, { headers: { "x-csrf-token": aftoken } }).then(r => r.json());
}

function pushPayload({ r, duration, operatorName, csat }) {
    const topicValue = r.payload?.topicId?.value;
    const themeLabel = resolveThemeLabel(topicValue);
    const isActive = duration == null;
    payloadarray.push({
        ChatId: r.id,
        OperatorName: operatorName,
        timeStamp: isActive ? "Active chat, ⏳" : new Date(r.tsCreate + duration).toLocaleString('ru-RU', timeOptions),
        CSAT: csat,
        ThemeValue: themeLabel,
        SLACompleted: isActive ? null : ((duration / 1000 / 60) > 25 ? 0 : 1),
        Country: r.channelUser?.payload?.country ?? "-"
    });
}

function pushTags(r) { operstagsarray.push({ ChatId: r.id, Tags: r.payload?.tags?.value || '' }); }
function themeMatches(r, chosen) {
    if (chosen === "parseallthemes") return true;
    if (chosen === "parsenothemes") return r.payload.topicId?.value === '';
    return r.payload.topicId?.value === chosen;
}

function filterTableRowsByTags() {
    const selectedValues = getSelectedCheckboxTagsValues();
    const rows = document.querySelectorAll('.rowOfChatGrabbed');
    if (selectedValues.length > 0) {
        rows.forEach(row => {
            const cellValue = row.children[3].textContent;
            let isMatched = false;
            selectedValues.forEach(val => {
                const filtered = cleanedarray.filter(item => item.Tags.split(',').map(tag => tag.trim()).includes(val));
                if (filtered.some(i => i.ChatId === cellValue)) isMatched = true;
            });
            row.style.display = isMatched ? '' : 'none';
        });
    } else rows.forEach(row => row.style.display = '');
    calcAvgCsat(); calcAvgSLACompleted();
}

function toggleBlock({ containerId, blockId, extraId }) {
    const block = document.getElementById(blockId);
    const extra = extraId ? document.getElementById(extraId) : null;
    const container = document.getElementById(containerId);
    const isHidden = window.getComputedStyle(block).display === "none";

    if (isHidden) {
        block.style.display = blockId === "activeoperatorsgroup" ? "grid" : "block";
        if (extra) extra.style.display = "flex";
        container.classList.add("glowing-border-animation");
        if (containerId === "othercontainer") otherfilters = "on";
    } else {
        block.style.display = "none";
        if (extra) extra.style.display = "none";
        container.classList.remove("glowing-border-animation");
        if (containerId === "othercontainer") otherfilters = "off";
    }
}

function aggregateCounts(array, field) {
    return array.reduce((acc, obj) => { acc[obj[field]] = (acc[obj[field]] || 0) + 1; return acc; }, {});
}

function addCell(row, value, attrs = {}) {
    const cell = document.createElement('td');
    cell.textContent = value;
    for (const [key, val] of Object.entries(attrs)) cell.setAttribute(key, val);
    row.appendChild(cell);
}

function initRowClickHandlers() {
    document.querySelectorAll('.rowOfChatGrabbed').forEach(row => {
        row.onclick = () => {
            document.getElementById('hashchathis').value = row.children[3].textContent;
            if (document.getElementById('AF_ChatHis').style.display === 'none') document.getElementById('opennewcat').click();
            btn_search_history.click();
        };
    });
}

function getDateRange() {
    const formatDate = (date, time) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}T${time}`;
    };
    const selectedDate = new Date(document.getElementById("dateFromGrab").value);
    selectedDate.setDate(selectedDate.getDate() - 1);
    const selectedEndDate = new Date(document.getElementById("dateToGrab").value);
    return { leftDateFromGrab: formatDate(selectedDate, "21:00:00.000z"), rightDateToGrab: formatDate(selectedEndDate, "20:59:59.059z") };
}

function getSelectedOperators() {
    const ops = document.getElementsByName('listofops');
    const checks = document.getElementsByName('chekforsearch');
    const ids = [], names = [];
    for (let i = 0; i < checks.length; i++) {
        if (checks[i].checked) { ids.push(ops[i].getAttribute('value')); names.push(ops[i].textContent); }
    }
    return { ids, names };
}

async function loadChatsForOperator(operatorId, operatorName, leftDate, rightDate, filters) {
    let page = 1; let opgrdata; const tmponlyoperhashes = [];
    do {
        const body = { serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json", participatingOperatorsIds: [operatorId], tsFrom: leftDate, tsTo: rightDate, orderBy: "ts", orderDirection: "Asc", page, limit: 100 };
        opgrdata = await fetch("https://skyeng.autofaq.ai/api/conversations/history", { method: "POST", headers: { "content-type": "application/json", "x-csrf-token": aftoken }, body: JSON.stringify(body), credentials: "include" }).then(r => r.json());
        if (!opgrdata?.items) break;
        for (const el of opgrdata.items) {
            const rate = el.stats.rate.rate;
            const csatAllowed = filters.csatIncludeUndefined ? (rate === undefined || filters.csatValues.includes(rate)) : (rate !== undefined && filters.csatValues.includes(rate));
            if (csatAllowed) chatswithmarksarray.push({ ConvId: el.conversationId, Rate: rate });
            if (el.operatorId === operatorId) tmponlyoperhashes.push({ HashId: el.conversationId, Duration: el.stats.conversationDuration, operatorName });
        }
        page++;
    } while ((page - 1) < (opgrdata.total / 100));
    return tmponlyoperhashes;
}

function extractCommentLine(txt) {
    const lines = txt.split(/<br\s*\/?>/i);
    const line = lines.find(l => l.toLowerCase().includes("комментарий:"));
    return line ? line.trim() : "";
}

async function processChat(chat, filters, criticalChats) {
    const matched = chatswithmarksarray.find(x => x.ConvId === chat.HashId);
    if (!matched) return;
    const r = await getChat(chat.HashId);
    if (!themeMatches(r, filters.theme)) return;
    pushTags(r);

    const priorityFilters = filters.priority ?? ["Any"];
    const deptFilters = filters.dept ?? ["Any"];
    const userTypeFilters = filters.usertype ?? ["Any"];
    const commentSearch = (filters.commentInput ?? "").toLowerCase();
    const messageSearch = (filters.messageInput ?? "").toLowerCase();

    const actualUserType = r.channelUser.payload?.userType ?? null;
    const operatorComments = r.messages.filter(m => m.tpe === "OperatorComment");
    const allOpText = operatorComments.map(m => m.txt.toLowerCase()).join("\n");

    if (!priorityFilters.includes("Any") && !priorityFilters.some(p => allOpText.includes(`критичность: ${p.toLowerCase()}`))) return;
    if (!deptFilters.includes("Any") && !deptFilters.some(d => allOpText.includes(`категория: ${d.toLowerCase()}`))) return;

    const found = categoryMap.find(c => allOpText.includes(c.key.toLowerCase()));
    const label = found ? found.label : "";

    if (!userTypeFilters.includes("Any")) {
        if (userTypeFilters.includes("null") && actualUserType !== null) return;
        if (!userTypeFilters.includes("null") && !userTypeFilters.includes(actualUserType)) return;
    }

    let matchedCommentMsg = null;
    if (commentSearch !== "") {
        matchedCommentMsg = operatorComments.find(m => m.txt.toLowerCase().includes(commentSearch));
        if (!matchedCommentMsg) return;
    }

    let matchedUserMsg = null;
    if (messageSearch !== "") {
        matchedUserMsg = r.messages.find(m => ["Question", "AnswerOperator", "AnswerOperatorWithBot"].includes(m.tpe) && (m.txt ?? "").toLowerCase().includes(messageSearch));
        if (!matchedUserMsg) return;
    }

    const blockComment = operatorComments.find(m => { const t = m.txt.toLowerCase(); return t.includes("критичность:") || t.includes("категория:"); });
    let finalText = blockComment ? extractCommentLine(blockComment.txt) : "";
    if (matchedUserMsg) finalText += "\n\n" + matchedUserMsg.txt;

    criticalChats.set(r.id, { ChatId: r.id, timeStamp: new Date(r.tsCreate).toLocaleString('ru-RU', timeOptions), OperatorName: chat.operatorName, CSAT: matched.Rate, Department: label, text: finalText.trim() });
    pushPayload({ r, duration: r.tsMod ? r.tsMod - r.tsCreate : undefined, operatorName: chat.operatorName, csat: matched.Rate });
}

function renderMainTable(pureArray, chatswithmarksarray) {
    const table = document.createElement('table');
    table.className = 'cdu-table srvhhelpnomove'; table.id = "TableGrabbed";
    const headerRow = document.createElement('tr');['№', 'Date', 'Operator', 'ChatId', '🏁 CSAT', 'Тема', 'SLACompl', 'Country'].forEach((name, index) => {
        const th = document.createElement('th');
        th.textContent = name;
        th.setAttribute('name', 'btnNameFilter');
        th.title = index > 0 ? `Click to filter by ${name}` : "";
        if (index > 0) {
            th.onclick = () => openColumnFilter(index, name);
        }
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    pureArray.forEach((el, index) => {
        const row = document.createElement('tr'); row.className = "rowOfChatGrabbed";
        addCell(row, index + 1);
        addCell(row, el.timeStamp);
        addCell(row, el.OperatorName);
        addCell(row, el.ChatId, { style: "font-family:monospace; color:#38bdf8;" });
        const matched = chatswithmarksarray.find(x => x.ConvId === el.ChatId);
        addCell(row, matched ? (matched.Rate ?? '-') : '-', { name: "CSATvalue", style: "text-align:center; font-weight:bold;" });
        addCell(row, el.ThemeValue);
        addCell(row, el.SLACompleted, { name: "SLACompletedValue", style: "text-align:center;" });
        addCell(row, el.Country, { style: "text-align:center;" });
        table.appendChild(row);
    });
    return table;
}

function renderCriticalTable(pureArray) {
    const table = document.createElement('table');
    table.className = 'cdu-table srvhhelpnomove'; table.id = "TableGrabbed";
    const headerRow = document.createElement('tr');['№', 'Date', 'Operator', 'ChatId', '🏁 CSAT', 'Отдел', "Text"].forEach((name, index) => {
        const th = document.createElement('th');
        th.textContent = name;
        th.setAttribute('name', 'btnNameFilter');
        th.title = index > 0 ? `Click to filter by ${name}` : "";
        if (index > 0) {
            th.onclick = () => openColumnFilter(index, name);
        }
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    pureArray.forEach((el, index) => {
        const row = document.createElement('tr'); row.className = "rowOfChatGrabbed";
        addCell(row, index + 1);
        addCell(row, el.timeStamp);
        addCell(row, el.OperatorName);
        addCell(row, el.ChatId, { style: "font-family:monospace; color:#38bdf8;" });
        const matched = chatswithmarksarray.find(x => x.ConvId === el.ChatId);
        addCell(row, matched ? (matched.Rate ?? '-') : '-', { name: "CSATvalue", style: "text-align:center; font-weight:bold;" });
        addCell(row, el.Department);
        addCell(row, el.text, { style: "max-width: 250px; white-space: pre-wrap; word-wrap: break-word;" });
        table.appendChild(row);
    });
    return table;
}

document.getElementById('stargrab').onclick = async function () {
    const filters = collectOtherFilters();
    if (!filters) return;

    tableColumnFilters = {};
    document.getElementById('GatherStatByThemes').setAttribute('disabled', '');
    document.getElementById('themesgrabbeddata').innerHTML = '<div style="padding:20px; text-align:center; color:#38bdf8;">⏳ System Processing Data...</div>';

    payloadarray = []; chatswithmarksarray = []; operstagsarray = []; arrofthemes = []; dataToRender = []; criticalChats = new Map();
    const { leftDateFromGrab, rightDateToGrab } = getDateRange();
    const { ids: operatorIds, names: operatorNames } = getSelectedOperators();

    let progress = 0; const step = 100 / Math.max(operatorIds.length, 1);
    const progressBar = document.getElementById("progressBarGrabber");

    for (let i = 0; i < operatorIds.length; i++) {
        const chats = await loadChatsForOperator(operatorIds[i], operatorNames[i], leftDateFromGrab, rightDateToGrab, filters);
        for (const chat of chats) await processChat(chat, filters, criticalChats);
        progress += step;
        progressBar.style.width = `${progress}%`; progressBar.textContent = `${Math.round(progress)}%`;
    }

    let table;
    if (otherfilters == "on") {
        dataToRender = [...criticalChats.values()];
        table = renderCriticalTable(dataToRender);
    } else {
        dataToRender = [...new Map(payloadarray.map(x => [x.ChatId, x])).values()];
        table = renderMainTable(dataToRender, chatswithmarksarray);
    }

    pureArray = dataToRender;

    const container = document.getElementById('themesgrabbeddata');
    container.innerHTML = ''; container.appendChild(table);

    initRowClickHandlers();
    countsArray = Object.entries(aggregateCounts(payloadarray, "ThemeValue")).map(([ThemeValue, Count]) => ({ ThemeValue, Count }));
    countsCountryArray = Object.entries(aggregateCounts(pureArray, "Country")).map(([Country, Count]) => ({ Country, Count }));

    document.getElementById('foundcount').innerHTML = `<span class="cdu-stat-badge cdu-stat-success">Total Records: ${pureArray.length}</span>`;
    calcAvgCsat(); calcAvgSLACompleted();
    document.getElementById('GatherStatByThemes').removeAttribute('disabled');
};

// ACTIONS HOOKS
document.getElementById('SwitchToTable').onclick = () => buildUniversalTable({ mode: "simple", groupField: "ThemeValue", columnTitle: "Тематика" });
document.getElementById('SwitchToGraph').onclick = () => drawUniversalGraph({ mode: "simple", groupField: "ThemeValue", chartType: "bar", title: "Тематика" });
document.getElementById('SwitchToTableCountry').onclick = () => buildUniversalTable({ mode: "simple", groupField: "Country", columnTitle: "Страна", saveButtonId: null });
document.getElementById('SwitchToGraphCountry').onclick = () => drawUniversalGraph({ mode: "simple", groupField: "Country", chartType: "bar", title: "Страна" });
document.getElementById('SwitchToIntervalTable').onclick = () => buildUniversalTable({ mode: "interval", groupField: "ThemeValue", columnTitle: "Тематика", saveButtonId: "SaveIntervalCSV" });
document.getElementById('SwitchToIntervalGraph').onclick = () => drawUniversalGraph({ mode: "interval", groupField: "ThemeValue", chartType: "line", title: "Тематика" });
document.getElementById('SaveIntervalCSV').onclick = saveToCSVInterval;
document.getElementById('SwitchToIntervalTableCountry').onclick = () => buildUniversalTable({ mode: "interval", groupField: "Country", columnTitle: "Страна", saveButtonId: "SaveIntervalCountryCSV" });
document.getElementById('SwitchToIntervalGraphCountry').onclick = () => drawUniversalGraph({ mode: "interval", groupField: "Country", chartType: "line", title: "Страна" });
document.getElementById('SaveIntervalСountryCSV').onclick = SaveIntervalСountryCSV;
document.getElementById('SaveСountryTableCSV').onclick = () => SaveСountryCSV('Country_Aggregated.csv');
document.getElementById('hideselecalltags').onclick = filterTableRowsByTags;

document.getElementById('SaveToCSVFilteredByTags').onclick = () => {
    const allUnchecked = [...document.querySelectorAll('input[name="tagsforfilter"]')].every(cb => !cb.checked);
    allUnchecked ? (function () {
        let csvContent = "ChatId,Tag1,Tag2,Tag3,Tag4,Tag5,Tag6\r\n";
        operstagsarray.forEach(item => {
            let tags = [];
            if (item.Tags) { try { tags = JSON.parse(item.Tags); } catch (e) { } }
            csvContent += [item.ChatId, ...tags].join(",") + "\r\n";
        });
        triggerDownload("\uFEFF" + csvContent, "export.csv");
    })() : saveFilteredTableCSV();
};

document.getElementById('opscontainer').onclick = () => toggleBlock({ containerId: 'opscontainer', blockId: 'activeoperatorsgroup', extraId: 'hideselecall' });
document.getElementById('markscontainer').onclick = () => toggleBlock({ containerId: 'markscontainer', blockId: 'listofthemarks', extraId: 'hideselecallmarks' });
document.getElementById('tagscontainer').onclick = () => toggleBlock({ containerId: 'tagscontainer', blockId: 'listofthetags', extraId: 'hideselecalltags' });
document.getElementById('othercontainer').onclick = () => toggleBlock({ containerId: 'othercontainer', blockId: 'listofotheroptions', extraId: null });

document.getElementById('webtoCSV').onclick = function () {
    if (otherfilters == "off") {
        const csvRows = [Object.keys(dataToRender[0]).join(",")];
        dataToRender.forEach(row => csvRows.push(Object.keys(dataToRender[0]).map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")));
        triggerDownload("\uFEFF" + csvRows.join("\n"), "data.csv");
    } else {
        let csvContent = "\uFEFFChatId,Department,timeStamp,OperatorName,CSAT,text\r\n";[...criticalChats.values()].forEach(item => {
            const safe = str => `"${String(str ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
            csvContent += [safe(item.ChatId), safe(item.Department), safe(item.timeStamp), safe(item.OperatorName), safe(item.CSAT), safe(item.text)].join(",") + "\r\n";
        });
        triggerDownload(csvContent, "critical_chats.csv");
    }
};

const adjustDateGrabber = (dateId, offset) => {
    let date = new Date(document.getElementById(dateId).value);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
};
document.getElementById('dayplus').onclick = () => { document.getElementById('dateFromGrab').value = adjustDateGrabber('dateFromGrab', 1); document.getElementById('dateToGrab').value = adjustDateGrabber('dateToGrab', 1); };
document.getElementById('dayminus').onclick = () => { document.getElementById('dateFromGrab').value = adjustDateGrabber('dateFromGrab', -1); document.getElementById('dateToGrab').value = adjustDateGrabber('dateToGrab', -1); };