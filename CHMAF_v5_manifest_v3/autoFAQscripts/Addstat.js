// ---------- 1. Хранилище избранного ----------
const FAV_STORAGE_KEY = 'af_stat_favorites';
let favoritesChats = {};
try {
    const stored = localStorage.getItem(FAV_STORAGE_KEY);
    if (stored) favoritesChats = JSON.parse(stored);
} catch (e) {
    console.error('Ошибка чтения избранного из localStorage:', e);
    favoritesChats = {};
}

function saveFavorites() {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(favoritesChats));
}

// Функция для кнопки в боковом меню
window.getStatsButtonPress = function () {
    let win = document.getElementById('AF_Stat');
    if (!win) return;
    // Реальная видимость: display === '' у открытого окна — это «видно»
    win.style.display = getComputedStyle(win).display === 'none' ? 'block' : 'none';
};

// ---------- 2. Разметка основного окна (Corporate Graphite, как Queue.js) ----------
var win_Stat = `
<style>
    /* AF Stat — Corporate Graphite Dark (как Queue.js / qg5) */
    #AF_Stat .adds-glass-container { display: flex; width: min(600px, calc(100vw - 24px)); font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif; }
    #AF_Stat .adds-glass-container * { box-sizing: border-box; }
    #AF_Stat .adds-glass-panel {
        width: 100%; position: relative; padding: 18px; color: #edf2fb;
        background: radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%), #111827;
        border: 1px solid #344258; border-radius: 18px;
        box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
    }
    #AF_Stat .adds-glass-header { display: flex; flex-direction: column; gap: 12px; }
    #AF_Stat .adds-top {
        display: flex; align-items: center; gap: 10px;
        padding-bottom: 14px; border-bottom: 1px solid #344258; cursor: move;
    }
    #AF_Stat .adds-title {
        flex: 1; min-width: 0; padding: 7px 12px; color: #a6b4cb; background: #182335;
        border: 1px solid #364660; border-radius: 10px; font-size: 11px; font-weight: 700;
        letter-spacing: .03em; text-transform: uppercase;
    }
    #AF_Stat .adds-flex-row { display: flex; align-items: center; }
    #AF_Stat .adds-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: #8a9bb8; }

    /* Поля */
    #AF_Stat .adds-glass-input, #AF_Stat .adds-glass-select {
        height: 36px; padding: 0 10px; color: #edf2fb; background: #0d1625;
        border: 1px solid #3a4961; border-radius: 9px; outline: none;
        font-size: 13px; font-family: inherit; color-scheme: dark;
        transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
    }
    #AF_Stat .adds-glass-input:hover, #AF_Stat .adds-glass-select:hover { background: #142034; border-color: #657caa; }
    #AF_Stat .adds-glass-input:focus, #AF_Stat .adds-glass-select:focus { background: #142034; border-color: #829fff; box-shadow: 0 0 0 3px rgba(110, 152, 247, .16); }
    #AF_Stat .adds-glass-input::placeholder { color: #66748c; }
    #AF_Stat .adds-glass-select option { background: #111827; color: #edf2fb; }

    /* Кнопки */
    #AF_Stat .adds-glass-btn {
        min-height: 36px; padding: 8px 14px; color: #dce5f5; background: #1b283c;
        border: 1px solid #3c4d68; border-radius: 9px; cursor: pointer;
        font-size: 13px; font-weight: 600; font-family: inherit;
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    }
    #AF_Stat .adds-glass-btn:hover:not(:disabled) { color: #fff; background: #293b56; border-color: #7799e2; transform: translateY(-1px); }
    #AF_Stat .adds-glass-btn:disabled { opacity: .55; cursor: default; }
    #AF_Stat .adds-btn-primary { color: #eef3ff; background: #4268c9; border-color: #7293ed; box-shadow: 0 5px 15px rgba(58, 96, 205, .22); }
    #AF_Stat .adds-btn-primary:hover:not(:disabled) { background: #547ce1; border-color: #a2b9fa; }
    #AF_Stat .adds-btn-warn { color: #f0c674; border-color: rgba(240, 198, 116, .35); }
    #AF_Stat .adds-btn-warn:hover:not(:disabled) { background: rgba(240, 198, 116, .12); border-color: #f0c674; color: #ffe0a3; }
    #AF_Stat .adds-btn-danger, #AF_Stat #hideMeStat {
        color: #ffb0be; background: rgba(255, 116, 140, .08); border-color: rgba(255, 116, 140, .3);
    }
    #AF_Stat .adds-btn-danger:hover:not(:disabled), #AF_Stat #hideMeStat:hover { background: rgba(255, 116, 140, .16); border-color: rgba(255, 116, 140, .55); color: #ffd0d8; }
    #AF_Stat #hideMeStat { padding: 8px 12px; }

    #AF_Stat .action-buttons-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
    #AF_Stat .action-buttons-grid .adds-glass-btn { padding: 8px 6px; }

    /* Область результатов */
    #AF_Stat .adds-content-area {
        max-height: 440px; overflow-y: auto; padding: 12px; margin-top: 2px;
        background: #0d1625; border: 1px solid #2c3a52; border-radius: 12px;
        font-size: 13px; line-height: 1.5; color: #dce5f5;
        scrollbar-width: thin; scrollbar-color: #536a8e transparent;
    }
    #AF_Stat .adds-content-area::-webkit-scrollbar { width: 6px; }
    #AF_Stat .adds-content-area::-webkit-scrollbar-thumb { background: #536a8e; border-radius: 4px; }
    #AF_Stat .adds-chat-link { color: #a9c0ff; text-decoration: none; font-family: 'JetBrains Mono', 'SF Mono', monospace; font-weight: 600; }
    #AF_Stat .adds-chat-link:hover { color: #d4e0ff; text-decoration: underline; }
    #AF_Stat .adds-action-icon { cursor: pointer; padding: 2px 4px; border-radius: 6px; transition: background-color .15s ease; }
    #AF_Stat .adds-action-icon:hover { background: #23334b; }

    /* Карточки счётчиков */
    #AF_Stat .stat-label-group { margin-bottom: 10px; }
    #AF_Stat .stat-cards-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    #AF_Stat .stat-card {
        display: flex; flex-direction: column; gap: 4px; padding: 10px 12px;
        background: #1a2536; border: 1px solid #344258; border-left: 3px solid #617fbd; border-radius: 10px;
        transition: background-color .16s ease, border-color .16s ease;
    }
    #AF_Stat .stat-card:hover { background: #23334b; border-color: #6685be; }
    #AF_Stat .stat-card-closed { border-left-color: #5fbf8a; }
    #AF_Stat .stat-card-transferred { border-left-color: #f0c674; }
    #AF_Stat .stat-card-icon { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: #8a9bb8; }
    #AF_Stat .stat-card-value { font-size: 20px; font-weight: 800; color: #a9c0ff; font-family: 'JetBrains Mono', 'SF Mono', monospace; }

    /* CSAT */
    #AF_Stat .csat-premium-container { margin: 10px 0; padding: 12px; background: #1a2536; border: 1px solid #344258; border-radius: 12px; }
    #AF_Stat .csat-premium-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
    #AF_Stat .csat-premium-score { font-size: 20px; font-weight: 800; color: #a9c0ff; }
    #AF_Stat .csat-premium-total { font-size: 12px; color: #8a9bb8; }
    #AF_Stat .csat-premium-bars { display: flex; flex-direction: column; gap: 6px; }
    #AF_Stat .csat-premium-row { display: flex; align-items: center; gap: 8px; }
    #AF_Stat .csat-premium-label { width: 28px; font-weight: 700; text-shadow: none !important; }
    #AF_Stat .csat-premium-bar-wrap { flex: 1; height: 18px; background: #0d1625; border: 1px solid #2c3a52; border-radius: 6px; overflow: hidden; }
    #AF_Stat .csat-premium-bar-fill { height: 100%; min-width: 22px; display: flex; align-items: center; padding: 0 6px; border-radius: 5px; box-shadow: none !important; }
    #AF_Stat .csat-premium-count { font-size: 11px; font-weight: 700; color: #0d1625; }
    #AF_Stat .csat-premium-percent { width: 46px; text-align: right; font-size: 12px; color: #a6b4cb; font-family: 'JetBrains Mono', monospace; }

    /* Список 2-й линии */
    #AF_Stat .line2-section-title { margin: 12px 0 8px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: #8a9bb8; }
    #AF_Stat .line2-list { display: flex; flex-direction: column; gap: 6px; }
    #AF_Stat .line2-item {
        display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px;
        background: #1a2536; border: 1px solid #344258; border-left: 3px solid #f0c674; border-radius: 10px;
        transition: background-color .16s ease, border-color .16s ease;
    }
    #AF_Stat .line2-item:hover { background: #23334b; border-color: #6685be; }
    #AF_Stat .line2-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
    #AF_Stat .line2-arrow { color: #f0c674; }
    #AF_Stat .line2-actions { display: flex; gap: 6px; }
    #AF_Stat .line2-empty { padding: 10px; text-align: center; color: #66748c; }
</style>

<div class="adds-glass-container">
    <div class="adds-glass-panel">
        <div class="adds-glass-header chmaf-drag-handle">
            <div class="adds-top chmaf-drag-handle">
                <button class="adds-glass-btn buttonHide" id="hideMeStat" title="Скрыть">❌</button>
                <div class="adds-title">📊 Моя статистика · заметки</div>
            </div>

            <div class="adds-flex-row" style="justify-content: center; gap: 8px; flex-wrap: wrap;">
                <button class="adds-glass-btn" id="prevDayStata" title="Сдвинуть на 1 день назад">◀ -1д</button>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="adds-label">От</span>
                    <input type="date" id="dateFrom" class="adds-glass-input" style="width: 120px;">
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span class="adds-label">До</span>
                    <input type="date" id="dateTo" class="adds-glass-input" style="width: 120px;">
                </div>
                <button class="adds-glass-btn" id="nextDayStata" title="Сдвинуть на 1 день вперёд">+1д ▶</button>
            </div>

            <div style="text-align: center; margin-bottom: 5px; display: flex; flex-direction: column; gap: 10px;">
                <input id="commenttosearch" class="adds-glass-input" autocomplete="off" placeholder="Слово/фраза для поиска по заметкам" style="width: 100%; box-sizing: border-box;">
                <div style="display: flex; gap: 10px;">
                    <select id="thematics" class="adds-glass-select" style="flex: 1;">
                  <option  value="skmob">Skyeng👨‍🎓Mob</option>
                    <option value="1804">-Авторизация</option>
                    <option value="1805">-Домашка</option>
                    <option value="1806">-Оплата</option>
                    <option value="1807">-Профиль</option>
                    <option value="1808">-Тренажер слов</option>
                    <option value="1809">-Уроки</option>
                    <option value="1810">-Чат</option>

                    <option  value="tmob">Teachers👽Mob</option>
                    <option value="1833">-Авторизация</option>
                    <option value="1836">-Виджет расписания</option>
                    <option value="1839">-Чат</option>
                    <option value="1835">-Виджет финансов</option>
                    <option value="1838">-Профиль</option>
                    <option value="1840">-Сторис</option>
                    <option value="1837">-Стр расписания</option>
                    <option value="1834">-Стр финансов</option>

                    <option  value="sksmpar">Skysmart👪родит</option>
                    <option value="1884">-Другое</option>
                    <option value="1883">-Материалы</option>
                    <option value="1880">-Предметы и баланс</option>
                    <option value="1881">-Профиль родителя</option>
                    <option value="1879">-Расписание</option>
                    <option value="1882">-Чат</option>

                    <option  value="solanka">Different</option>
                    <option value="2034">-Прочее</option>
                    <option value="2030">-Slack-вход</option>
                    <option value="2020">-Логи ур У</option>
                    <option value="2019">-Логи ур П</option>
                    <option value="2018">-БД ур оператор</option>
                    <option value="2017">-БД ур система</option>

                    <option  value="payf">Проблемы с оплатой</option>
                    <option value="1077">-Вина школы</option>
                    <option value="1658">-Консультация</option>
                    <option value="1661">-Карта У</option>
                    <option value="1662">-Сбой</option>
                    <option value="1660">-Подписки</option>

                    <option  value="hwtr">Проблемы с ДЗ</option>
                    <option value="1744">-Контент</option>
                    <option value="1745">-Оценка</option>
                    <option value="1746">-Словарь</option>
                    <option value="1747">-Упражнение</option>

                    <option  value="svyaz">Проблемы связь</option>
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

                    <option  value="lkp">Проблемы ЛКП</option>
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

                    <option  value="lku">Проблемы ЛКУ</option>
                    <option value="1708">-Чат</option>
                    <option value="1710">-Профиль</option>
                    <option value="1706">-Видж прогр</option>
                    <option value="1707">-Ис зан/портф</option>
                    <option value="1709">-Семья</option>
                    <option value="1711">-Настройки</option>
                    <option value="1705">-Навыки</option>
                    <option value="1704">-Грамматика</option>

                    <option  value="problvh">Проблемы вход</option>
                    <option value="1632">-Не привяз почт/тел</option>
                    <option value="1635">-Данные</option>
                    <option value="1634">-Сброс пароля</option>
                    <option value="1631">-Консультация</option>
                    <option value="1633">-Сбой</option>

                    <option  value="problpodk">Проблемы подкл</option>
                    <option value="1624">-Истек подпис</option>
                    <option value="1627">-Консультациия</option>
                    <option value="1629">-Нет кн входа</option>
                    <option value="1628">-У не в ГУ</option>
                    <option value="1625">-Ур в др вр</option>
                    <option value="1626">-У отпуск</option>
                    <option value="1630">-Неакт кн вх</option>

                    <option  value="lesfunc">Функционал урок</option>
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

                    <option  value="feedbk">Отзывы и пожел</option>
                    <option value="1970">-Vim-контент</option>
                    <option value="1971">-Vim-оценка</option>
                    <option value="1972">-Vim-словарь</option>
                    <option value="1973">-Vim-упражнения</option>

                    <option  value="1966">-ЛК-ОС род</option>
                    <option value="1965">-ЛК-пер,отм ур</option>
                    <option value="1967">-ЛК-профиль</option>
                    <option value="1968">-ЛК-семья</option>
                    <option value="1969">-ЛК чат</option>

                    <option  value="1974">-App Skyeng</option>
                    <option value="1975">-App Teachers</option>
                    <option value="1979">-App Skypro</option>
                    <option value="1976">-App класс</option>
                    <option value="1977">-App решения</option>
                    <option value="1978">-App Skysmart род</option>
                    <option value="1980">-Прочее</option>
                    </select>
                    <button class="adds-glass-btn" id="gofindit">Search</button>
                    <button class="adds-glass-btn" id="changetheme">Change</button>
                </div>
            </div>

            <div class="action-buttons-grid">
                <button class="adds-glass-btn adds-btn-primary" id="getstatfromperiod">Статистика</button>
                <button class="adds-glass-btn" id="getlowcsat">CSAT < 4</button>
                <button class="adds-glass-btn" id="parsechat">Поиск</button>
                <button class="adds-glass-btn adds-btn-warn" id="showFavoritesBtn">Избранное ⭐</button>
                <button class="adds-glass-btn adds-btn-danger" id="clearall">Очистить</button>
            </div>

            <div id="chatcoutnsinfo" class="adds-content-area">
                <div id="mainStatsLabels" class="stat-label-group">
                    <div class="stat-cards-row">
                        <div class="stat-card stat-card-touched">
                            <div class="stat-card-icon" title="Общее количество взятых в работу">👆 Пощупано</div>
                            <span class="stat-card-value" id="sumchatcounttouched">—</span>
                        </div>
                        <div class="stat-card stat-card-closed">
                            <div class="stat-card-icon" title="Закрыто лично вами">✅ Закрыто</div>
                            <span class="stat-card-value" id="sumchatcountclosed">—</span>
                        </div>
<div class="stat-card stat-card-transferred">
    <div class="stat-card-icon" title="Переведено на 2-ю линию техподдержки">🤝 2-я линия</div>
    <span class="stat-card-value" id="sumchatcounttransferred">—</span>
</div>
                    </div>
                </div>
                <div id="chatsinfoout"></div>
                <div id="lowCSATcount" style="display:none;"></div>
                <div id="chatcommentsdata" style="display:none;"></div>
                <div id="favoritesSection" style="display:none;"></div>
            </div>
        </div>
    </div>
</div>
`;

// ---------- Разметка ОТДЕЛЬНОГО окна избранного ----------
var win_Fav = `
<style>
    /* AF Fav — Corporate Graphite Dark */
    #AF_Fav .fav-glass-container { display: flex; width: min(480px, calc(100vw - 24px)); font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif; }
    #AF_Fav .fav-glass-container * { box-sizing: border-box; }
    #AF_Fav .fav-glass-panel {
        width: 100%; padding: 18px; color: #edf2fb;
        background: radial-gradient(circle at 95% 0%, rgba(240, 198, 116, .10), transparent 40%), #111827;
        border: 1px solid #344258; border-radius: 18px;
        box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
    }
    #AF_Fav .fav-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #344258; cursor: move; }
    #AF_Fav .fav-title {
        flex: 1; padding: 7px 12px; color: #f0c674; background: #182335; border: 1px solid #364660;
        border-radius: 10px; font-size: 11px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase;
    }
    #AF_Fav .fav-btn {
        min-height: 36px; padding: 8px 12px; color: #ffb0be; background: rgba(255, 116, 140, .08);
        border: 1px solid rgba(255, 116, 140, .3); border-radius: 9px; cursor: pointer;
        font-size: 13px; font-weight: 600; font-family: inherit; transition: background-color .16s ease, border-color .16s ease;
    }
    #AF_Fav .fav-btn:hover { background: rgba(255, 116, 140, .16); border-color: rgba(255, 116, 140, .55); color: #ffd0d8; }
    #AF_Fav .fav-content { max-height: 460px; overflow-y: auto; padding-right: 6px; scrollbar-width: thin; scrollbar-color: #536a8e transparent; }
    #AF_Fav .fav-content::-webkit-scrollbar { width: 6px; }
    #AF_Fav .fav-content::-webkit-scrollbar-thumb { background: #536a8e; border-radius: 4px; }
    #AF_Fav .fav-empty { padding: 24px 12px; text-align: center; color: #8a9bb8; font-size: 13px; line-height: 1.5; }
    #AF_Fav .fav-item {
        position: relative; margin-bottom: 7px; padding: 10px 12px; font-size: 13px;
        background: #1a2536; border: 1px solid #344258; border-left: 3px solid #f0c674; border-radius: 10px;
        transition: background-color .16s ease, border-color .16s ease;
    }
    #AF_Fav .fav-item:hover { background: #23334b; border-color: #6685be; }
    #AF_Fav .fav-link { color: #a9c0ff; font-weight: 700; text-decoration: none; font-family: 'JetBrains Mono', 'SF Mono', monospace; }
    #AF_Fav .fav-link:hover { color: #d4e0ff; text-decoration: underline; }
    #AF_Fav .fav-date { margin-left: 8px; font-size: 11px; color: #8a9bb8; font-family: 'JetBrains Mono', monospace; }
    #AF_Fav .fav-comment { margin-top: 6px; color: #a6b4cb; }
    #AF_Fav .fav-comment-text { color: #edf2fb; }
    #AF_Fav .fav-actions { position: absolute; top: 8px; right: 10px; display: flex; gap: 4px; }
    #AF_Fav .fav-icon { cursor: pointer; padding: 3px 6px; border-radius: 6px; background: #182335; border: 1px solid #364660; transition: background-color .15s ease, border-color .15s ease; }
    #AF_Fav .fav-icon:hover { background: #293b56; border-color: #7799e2; }
</style>
<div class="fav-glass-container">
    <div class="fav-glass-panel">
        <div class="fav-header chmaf-drag-handle">
            <span class="fav-title">⭐ Избранные задачи</span>
            <button class="fav-btn buttonHide" id="hideMeFav">Закрыть ❌</button>
        </div>
        <div id="favContent" class="fav-content">
            <div class="fav-empty">Загрузка...</div>
        </div>
    </div>
</div>
`;

// ---------- 3. Создание окон ----------
function initWindows() {
    if (!document.getElementById('AF_Stat')) {
        createWindow('AF_Stat', 'winTopStat', 'winLeftStat', win_Stat);
        hideWindowOnDoubleClick('AF_Stat');
        hideWindowOnClick('AF_Stat', 'hideMeStat');
    }
    if (!document.getElementById('AF_Fav') && typeof createWindow === 'function') {
        createWindow('AF_Fav', 'winTopFav', 'winLeftFav', win_Fav);
        hideWindowOnDoubleClick('AF_Fav');
        hideWindowOnClick('AF_Fav', 'hideMeFav');
        const favWin = document.getElementById('AF_Fav');
        if (favWin) favWin.style.display = 'none';
    }
}

// ---------- 4. Вспомогательные функции ----------
function fmtDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// Время по МСК (UTC+3) → ISO в UTC. Раньше дата создавалась в поясе браузера
// и из неё ещё раз вычиталось 3 часа: у оператора в МСК период уезжал
// на 3 часа назад (с 21:00 предыдущего дня до 20:59 последнего).
function toUTC(dateStr, h, m, s, ms) {
    const [y, mo, d] = String(dateStr).split('-').map(Number);
    return new Date(Date.UTC(y, mo - 1, d, h - 3, m, s, ms)).toISOString();
}

// Экранирование для вставки в innerHTML (заметки избранного вводятся вручную)
function addsEsc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);
}

function shiftDates(days) {
    const dateFromEl = document.getElementById('dateFrom');
    const dateToEl = document.getElementById('dateTo');
    if (!dateFromEl || !dateToEl) return;

    const valFrom = dateFromEl.value;
    const valTo = dateToEl.value;
    if (!valFrom || !valTo) return;

    const parseLocal = (str) => {
        const [y, m, d] = str.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    const fmtLocal = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const from = parseLocal(valFrom);
    const to = parseLocal(valTo);

    from.setDate(from.getDate() + days);
    to.setDate(to.getDate() + days);

    dateFromEl.value = fmtLocal(from);
    dateToEl.value = fmtLocal(to);
}

function switchView(activeId) {
    const views = ['chatsinfoout', 'lowCSATcount', 'chatcommentsdata', 'favoritesSection'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = (id === activeId) ? 'block' : 'none';
    });
    const labels = document.getElementById('mainStatsLabels');
    if (labels) {
        labels.style.display = (activeId === 'chatsinfoout') ? 'block' : 'none';
    }
}

// ---------- 5. Логика Избранного ----------
function renderFavoritesWindow() {
    const container = document.getElementById('favContent');
    if (!container) return;

    const favKeys = Object.keys(favoritesChats);
    if (favKeys.length === 0) {
        container.innerHTML = `<div class="fav-empty"><b>Избранных чатов пока нет.</b><br><br>Добавляйте их через ❤️ в основном окне статистики.</div>`;
        return;
    }

    let html = "";
    favKeys.forEach(chatId => {
        const favData = favoritesChats[chatId];
        html += `<div class="fav-item">
            <span style="color:#f0c674; margin-right:5px;">⭐</span>
            <a href="https://skyeng.autofaq.ai/logs/${encodeURIComponent(chatId)}" target="_blank" class="fav-link">${addsEsc(chatId)}</a>
            <span class="fav-date">${addsEsc(favData?.date)}</span>
            <div class="fav-comment">Заметка: <span class="fav-comment-text">${addsEsc(favData?.comment)}</span></div>
            <div class="fav-actions">
                <span class="fav-icon open-history-btn" data-id="${addsEsc(chatId)}" title="Открыть историю">👁️</span>
                <span class="fav-icon toggle-fav-btn" data-id="${addsEsc(chatId)}" title="Удалить из избранного">🗑️</span>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function toggleFavoritesWindow() {
    const favWin = document.getElementById('AF_Fav');
    if (!favWin) return;
    if (getComputedStyle(favWin).display === 'none') {
        renderFavoritesWindow();
        favWin.style.display = 'block';
    } else {
        favWin.style.display = 'none';
    }
}

// ---------- 6. Безопасная инициализация обработчиков ----------
function attachEventHandlers() {
    const prevDayStataBtn = document.getElementById('prevDayStata');
    const nextDayStataBtn = document.getElementById('nextDayStata');
    if (prevDayStataBtn) prevDayStataBtn.onclick = () => shiftDates(-1);
    if (nextDayStataBtn) nextDayStataBtn.onclick = () => shiftDates(1);

    const showFavBtn = document.getElementById('showFavoritesBtn');
    if (showFavBtn) showFavBtn.onclick = toggleFavoritesWindow;

    const clearBtn = document.getElementById('clearall');
    if (clearBtn) {
        clearBtn.onclick = function () {
            const touchedEl = document.getElementById('sumchatcounttouched');
            const closedEl = document.getElementById('sumchatcountclosed');
            const transferredEl = document.getElementById('sumchatcounttransferred');
            if (touchedEl) touchedEl.textContent = '—';
            if (closedEl) closedEl.textContent = '—';
            if (transferredEl) transferredEl.textContent = '—';['chatsinfoout', 'lowCSATcount', 'chatcommentsdata', 'favoritesSection'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = "";
            });
            const commentSearch = document.getElementById('commenttosearch');
            if (commentSearch) commentSearch.value = "";
            switchView('chatsinfoout');
        };
    }

    const statBtn = document.getElementById('getstatfromperiod');
    if (statBtn) {
        statBtn.onclick = async function () {
            // Повторный клик во время подсчёта запускал второй параллельный проход
            if (this.dataset.busy) return;
            switchView('chatsinfoout');
            const dateFromEl = document.getElementById('dateFrom');
            const dateToEl = document.getElementById('dateTo');
            if (!dateFromEl || !dateToEl || !dateFromEl.value || !dateToEl.value) {
                createAndShowButton('Укажите даты', 'warning');
                return;
            }

            const datefrom = toUTC(dateFromEl.value, 0, 0, 0, 0);
            const dateto = toUTC(dateToEl.value, 23, 59, 59, 59);

            const out = document.getElementById('chatsinfoout');
            const btn = this;
            const originalText = btn.textContent;
            btn.textContent = "⏳...";
            btn.dataset.busy = '1';

            if (out) {
                out.innerHTML = `
                    <div style="padding: 20px 10px;">
                        <div id="statProgressBar" style="width: 100%; background: #0d1625; border-radius: 6px; border: 1px solid #2c3a52; overflow: hidden; height: 10px;">
                            <div id="statProgressFill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #4268c9, #7293ed); transition: width 0.3s ease;"></div>
                        </div>
                        <div id="statProgressText" style="text-align: center; color: #a9c0ff; margin-top: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .03em;">Инициализация...</div>
                    </div>
                `;
            }

            try {
                let page = 1, touchedCount = 0, manualClosed = 0, line2Count = 0, csatScore = 0, csatCount = 0;
                let processedCount = 0, totalArchiveItems = 0;
                const rates = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                let line2Html = "";

                // ВАЖНО: Мы удалили старый кривой API-запрос doOperationsWithHistory для "Пощупано"
                // Теперь считаем всё абсолютно честно на лету из спарсенных чатов.
                const touchedEl = document.getElementById('sumchatcounttouched');
                if (touchedEl) touchedEl.textContent = "⏳...";

                // Полный перебор пула (нужен, чтобы ловить чаты, где оператор что-то делал,
                // но не попал в участники). Ускорение: следующая страница списка грузится
                // заранее, пока обрабатывается текущая, и чаты качаются по 12 одновременно.
                const fetchArchivePage = async (p) => {
                    const bodyArchive = { serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json", tsFrom: datefrom, tsTo: dateto, orderBy: "ts", orderDirection: "Asc", page: p, limit: 100 };
                    // Через общий слой: диагностика ошибок и CSRF-ретрай
                    const resp = await afApiFetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                        method: "POST",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify(bodyArchive)
                    });
                    return resp.json();
                };
                let pendingPage = fetchArchivePage(page);
                while (true) {
                    const data = await pendingPage;

                    if (!data?.items?.length) break;

                    if (page === 1) totalArchiveItems = data.total || 1;

                    // Сразу запрашиваем следующую страницу — параллельно с разбором текущей
                    const hasNext = page * 100 < data.total;
                    if (hasNext) pendingPage = fetchArchivePage(page + 1);

                    // Чаты страницы загружаем параллельно (по 12 одновременно) вместо
                    // строго по одному — подсчёт за день идёт в разы быстрее.
                    // Ошибка одного чата больше не обрывает всю статистику.
                    const pageItems = data.items;
                    const convs = new Array(pageItems.length);
                    let nextIdx = 0;
                    const worker = async () => {
                        while (nextIdx < pageItems.length) {
                            const idx = nextIdx++;
                            try {
                                convs[idx] = await doOperationsWithConversations(pageItems[idx].conversationId);
                            } catch (err) {
                                console.warn('[Addstat] Не удалось загрузить чат', pageItems[idx].conversationId, err);
                                convs[idx] = null;
                            }
                            processedCount++;
                            const percent = Math.min(100, Math.round((processedCount / totalArchiveItems) * 100));
                            const fill = document.getElementById('statProgressFill');
                            const text = document.getElementById('statProgressText');
                            if (fill) fill.style.width = percent + '%';
                            if (text) text.textContent = `Анализ пула очереди... ${processedCount} / ${totalArchiveItems} (${percent}%)`;
                        }
                    };
                    await Promise.all(Array.from({ length: Math.min(12, pageItems.length) }, worker));

                    for (const [itemIdx, item] of pageItems.entries()) {
                        const conv = convs[itemIdx] || {};

                        const myOpId = typeof operatorId !== 'undefined' ? String(operatorId) : '';

                        let isTouchedByMe = false;
                        let isClosedByMe = false;
                        let isLine2 = false;

                        // 1. Проверяем список участников
                        let participants = conv.participatingOperatorsIds || item.participatingOperatorsIds || [];
                        if (myOpId && participants.map(String).includes(myOpId)) {
                            isTouchedByMe = true;
                        }

                        if (conv.messages && Array.isArray(conv.messages)) {
                            for (const m of conv.messages) {
                                // 2. Глубокая проверка: если я не в участниках, но что-то писал/делал в чате
                                if (myOpId) {
                                    if (String(m.sender) === myOpId ||
                                        (m.payload && String(m.payload.sender) === myOpId) ||
                                        (m.payload && String(m.payload.oid) === myOpId)) {
                                        isTouchedByMe = true;
                                    }

                                    // 3. Кто реально нажал кнопку "ЗАКРЫТЬ ЧАТ"
                                    // Читаем событие, перехватываем последнее закрытие
                                    if (m.eventTpe === "CloseConversation" || String(m.payload?.status).includes("Closed")) {
                                        if (String(m.payload?.sender) === myOpId || String(m.payload?.oid) === myOpId) {
                                            isClosedByMe = true;
                                        } else {
                                            // Если кто-то другой закрыл после нас (например, переоткрыли и закрыли)
                                            isClosedByMe = false;
                                        }
                                    }
                                }

                                // 4. Поиск 2ЛТП (по тексту и событиям)
                                let rawText = m.txt || m.text || "";
                                if (m.tpe === "Event" && m.payload) {
                                    rawText += " " + (m.payload.awakeText || "");
                                    rawText += " " + (m.payload.comment || "");
                                    if (m.payload.status) rawText += " " + m.payload.status;
                                }
                                if (!rawText && m.payload) rawText = JSON.stringify(m.payload);

                                let cleanText = String(rawText).toLowerCase().replace(/<[^>]*>?/gm, ' ');
                                const normalizedStr = cleanText.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

                                if (normalizedStr.includes("техподдержка 2-я линия") ||
                                    normalizedStr.includes("техподдержка 2 линия") ||
                                    normalizedStr.includes("2-я линия crm2")) {
                                    isLine2 = true;
                                }
                            }
                        }

                        // Если явного системного события не было, но я остался последним владельцем
                        const currentOp = conv.operatorId || conv.assigneeId || item.operatorId;
                        if (!isClosedByMe && myOpId && String(currentOp) === myOpId && isTouchedByMe) {
                            isClosedByMe = true;
                        }

                        // УВЕЛИЧИВАЕМ СЧЕТЧИКИ
                        if (isTouchedByMe) touchedCount++;
                        if (isClosedByMe) manualClosed++;

                        // «Переведено на 2ЛТП» — только чаты, где работал этот оператор.
                        // Раньше считались переводы по ВСЕМУ пулу очереди за период.
                        if (isLine2 && isTouchedByMe) {
                            line2Count++;
                            const isFav = !!favoritesChats[item.conversationId];
                            line2Html += `<div class="line2-item">
                                <div class="line2-left">
                                    <span class="line2-arrow">⚡</span>
                                    <a href="https://skyeng.autofaq.ai/logs/${encodeURIComponent(item.conversationId)}" target="_blank" class="adds-chat-link">${addsEsc(item.conversationId)}</a>
                                </div>
                                <div class="line2-actions">
                                    <span class="adds-action-icon open-history-btn" data-id="${item.conversationId}" title="История">👁️</span>
                                    <span class="adds-action-icon toggle-fav-btn" data-id="${item.conversationId}" title="${isFav ? 'Удалить из избранного' : 'Добавить в избранное'}">${isFav ? '❤️' : '🤍'}</span>
                                </div>
                            </div>`;
                        }

                        // === ПОДСЧЕТ CSAT ТОЛЬКО ДЛЯ ВАШИХ ЗАКРЫТЫХ ЧАТОВ ===
                        let rawRate = item.stats?.rate || conv.stats?.rate;
                        let rate = 0;
                        if (typeof rawRate === 'object' && rawRate !== null) {
                            rate = Number(rawRate.rate || 0);
                        } else {
                            rate = Number(rawRate || 0);
                        }

                        if (rate > 0 && isClosedByMe) {
                            csatScore += rate;
                            csatCount++;
                            if (rates.hasOwnProperty(rate)) rates[rate]++;
                        }
                    }
                    if (hasNext) page++; else break;
                }

                // === ФИНАЛЬНАЯ ЗАПИСЬ В КАРТОЧКИ ===
                if (touchedEl) touchedEl.textContent = touchedCount;

                const closedEl = document.getElementById('sumchatcountclosed');
                if (closedEl) closedEl.textContent = manualClosed;

                const transferredEl = document.getElementById('sumchatcounttransferred');
                if (transferredEl) transferredEl.textContent = line2Count;

                // === CYBER CSAT RENDER ===
                const csatAvg = csatCount ? (csatScore / csatCount).toFixed(2) : "0.00";
                const maxRate = Math.max(...Object.values(rates), 1);

                const rateColors = { 1: '#f87171', 2: '#fb923c', 3: '#f0c674', 4: '#86efac', 5: '#7dd3fc' };
                const rateGlow = { 1: 'transparent', 2: 'transparent', 3: 'transparent', 4: 'transparent', 5: 'transparent' };

                let barsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    const count = rates[i];
                    const percent = csatCount ? ((count / csatCount) * 100).toFixed(1) : '0.0';
                    const width = maxRate ? ((count / maxRate) * 100) : 0;
                    barsHtml += `
                        <div class="csat-premium-row">
                            <div class="csat-premium-label" style="color:${rateColors[i]}; text-shadow: 0 0 8px ${rateGlow[i]};">${i}★</div>
                            <div class="csat-premium-bar-wrap">
                                <div class="csat-premium-bar-fill" style="width:${width}%; background: ${rateColors[i]}; box-shadow: 0 0 10px ${rateGlow[i]};">
                                    <span class="csat-premium-count">${count}</span>
                                </div>
                            </div>
                            <div class="csat-premium-percent">${percent}%</div>
                        </div>`;
                }

                const scoreColor = csatAvg >= 4.5 ? '#7dd3fc' : csatAvg >= 4 ? '#86efac' : csatAvg >= 3 ? '#f0c674' : '#f87171';
                const emoji = csatAvg >= 4.5 ? '🏆' : csatAvg >= 4 ? '🔥' : csatAvg >= 3 ? '😐' : '💀';

                const out = document.getElementById('chatsinfoout');
                if (out) {
                    out.innerHTML = `
                        <div class="csat-premium-container">
                            <div class="csat-premium-header">
                                <div class="csat-premium-score" style="color:${scoreColor};">${csatAvg} <span style="font-size:20px;">${emoji}</span></div>
                                <div class="csat-premium-total">СРЕДНИЙ БАЛЛ CSAT • ОЦЕНОК: ${csatCount}</div>
                            </div>
                            <div class="csat-premium-bars">${barsHtml}</div>
                        </div>
                        <div class="line2-section-title">Переведено на 2ЛТП</div>
                        <div class="line2-list">${line2Html || '<div class="line2-empty">Система не зафиксировала чатов на 2ЛТП за этот период.</div>'}</div>`;
                }

            } catch (e) {
                console.error(e);
                const out = document.getElementById('chatsinfoout');
                if (out) out.innerHTML = "<div style='color:#ef4444; padding:10px;'>Ошибка при загрузке. Проверьте консоль.</div>";
            } finally {
                btn.textContent = originalText;
                delete btn.dataset.busy;
            }
        };
    }

    // Делегирование кликов (Избранное & История)
    document.addEventListener('click', async function (e) {
        const target = e.target.closest('.toggle-fav-btn');
        if (target) {
            const id = target.getAttribute('data-id');
            if (!id) return;
            e.preventDefault();

            if (favoritesChats[id]) {
                // УДАЛЕНИЕ ИЗ ИЗБРАННОГО
                delete favoritesChats[id];

                // Синхронизируем ИКОНКИ в основном окне (меняем все ❤️ на 🤍)
                document.querySelectorAll(`.toggle-fav-btn[data-id="${id}"]`).forEach(btn => {
                    if (!btn.closest('.fav-glass-panel')) btn.textContent = '🤍';
                });

                // Если кликнули в самом окне избранного — перерисовываем его содержимое
                if (target.closest('.fav-glass-panel')) {
                    renderFavoritesWindow();
                } else {
                    // Если удалили из основного окна, но окно избранного открыто - обновляем его
                    const favWin = document.getElementById('AF_Fav');
                    if (favWin && favWin.style.display === 'block') {
                        renderFavoritesWindow();
                    }
                }
            } else {
                // ДОБАВЛЕНИЕ В ИЗБРАННОЕ
                const comment = await chmafDialog.prompt({
                    title: "Заметка к задаче",
                    label: "Введите заметку для этой задачи:",
                    value: "На контроле (2ЛТП)",
                    okText: "Добавить"
                });
                if (comment !== null) {
                    favoritesChats[id] = { comment: comment || "Без комментария", date: new Date().toLocaleDateString() };

                    // Синхронизируем ИКОНКИ в основном окне (меняем все 🤍 на ❤️)
                    document.querySelectorAll(`.toggle-fav-btn[data-id="${id}"]`).forEach(btn => {
                        if (!btn.closest('.fav-glass-panel')) btn.textContent = '❤️';
                    });

                    const favWin = document.getElementById('AF_Fav');
                    if (favWin && favWin.style.display === 'block') {
                        renderFavoritesWindow();
                    }
                }
            }
            saveFavorites();
            return;
        }

        const historyTarget = e.target.closest('.open-history-btn');
        if (historyTarget) {
            const id = historyTarget.getAttribute('data-id');
            if (!id) return;

            const isCsat = historyTarget.getAttribute('data-type') === 'csat';
            if (isCsat) {
                const hideBtn = document.querySelector('#hide_or_display');
                if (hideBtn && hideBtn.textContent !== "свернуть") hideBtn.click();
                const chatIdInput = document.getElementById('chat_id');
                if (chatIdInput) chatIdInput.value = id;
                const searchBtn = document.getElementById('search');
                if (searchBtn) searchBtn.click();
            } else {
                const chatHisWin = document.getElementById('AF_ChatHis');
                if (chatHisWin && chatHisWin.style.display === 'none') {
                    const openBtn = document.getElementById('opennewcat');
                    if (openBtn) openBtn.click();
                }
                const hashInput = document.getElementById('hashchathis');
                if (hashInput) hashInput.value = id;
                const btnSearch = document.getElementById('btn_search_history');
                if (btnSearch) btnSearch.click();
            }
        }
    });
}

// ---------- 7. Запуск ----------
function initAll() {
    initWindows();
    if (document.getElementById('showFavoritesBtn')) {
        attachEventHandlers();
    } else {
        setTimeout(initAll, 50);
    }
}

initAll();

// Инициализация дат
(function () {
    const now = new Date();
    const dateFrom = document.getElementById("dateFrom");
    const dateTo = document.getElementById("dateTo");
    if (dateFrom) dateFrom.value = fmtDate(now);
    if (dateTo) dateTo.value = fmtDate(now);
})();