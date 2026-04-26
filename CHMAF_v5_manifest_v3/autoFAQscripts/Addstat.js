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

// Функция для кнопки в боковом меню (открыть/скрыть основное окно)
window.getStatsButtonPress = function () {
    let win = document.getElementById('AF_Stat');
    if (!win) return;
    win.style.display = (win.style.display === 'none' || win.style.display === '') ? 'block' : 'none';
};

// ---------- 2. Разметка основного окна ----------
var win_Stat = `
<style>
    .adds-glass-container { display: flex; width: 580px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .adds-glass-panel { width: 100%; background: rgba(30, 35, 45, 0.9); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); color: #e0e6ed; padding: 15px; }
    .adds-glass-header { cursor: grab; }
    .adds-glass-input, .adds-glass-select { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #fff; padding: 6px 10px; outline: none; transition: all 0.3s ease; }
    .adds-glass-input:focus, .adds-glass-select:focus { background: rgba(255, 255, 255, 0.15); border-color: rgba(100, 150, 255, 0.6); box-shadow: 0 0 8px rgba(100, 150, 255, 0.3); }
    .adds-glass-select option { background: #232732; color: #fff; }
    .adds-glass-btn { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 8px; color: #fff; padding: 8px 12px; cursor: pointer; font-weight: 500; transition: all 0.3s ease; }
    .adds-glass-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-1px); }
    .adds-flex-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .adds-chat-link { color: #64b5f6; text-decoration: none; font-weight: bold; }
    .adds-action-icon { cursor: pointer; margin-left: 8px; transition: transform 0.2s; display: inline-block; font-size: 16px; }
    .adds-action-icon:hover { transform: scale(1.3); }
    .adds-fav-comment { font-size: 0.85em; color: #a5d6a7; margin-left: 10px; font-style: italic; }
    .adds-content-area { max-height: 380px; overflow-y: auto; margin-top: 15px; padding-right: 5px; }
    .adds-content-area::-webkit-scrollbar { width: 6px; }
    .adds-content-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
    .stat-label-group { margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
</style>

<div class="adds-glass-container">
    <div class="adds-glass-panel">
        <div class="adds-glass-header">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
                <button class="adds-glass-btn" id="hideMeStat" style="padding: 4px 10px;">Скрыть</button>
            </div>

            <div class="adds-flex-row">
                <span>Начальная <input type="date" id="dateFrom" class="adds-glass-input" style="width: 120px;"></span>
                <span>Конечная <input type="date" id="dateTo" class="adds-glass-input" style="width: 120px;"></span>
            </div>

            <div style="text-align: center; margin-bottom: 15px;">
                <input id="commenttosearch" class="adds-glass-input" autocomplete="off" placeholder="Слово/фраза для поиска по заметкам" style="width: 100%; margin-bottom: 10px;">
                <select id="thematics" class="adds-glass-select" style="width: 60%; margin-right: 10px;">
                    <option class="${typeof selecttheme !== 'undefined' ? selecttheme : ''}" value="skmob">Skyeng👨‍🎓Mob</option>
                    <option value="1804">-Авторизация</option>
                    <option value="1805">-Домашка</option>
                    <option value="1806">-Оплата</option>
                    <option value="1807">-Профиль</option>
                    <option value="1808">-Тренажер слов</option>
                    <option value="1809">-Уроки</option>
                    <option value="1810">-Чат</option>

                    <option class="${typeof selecttheme !== 'undefined' ? selecttheme : ''}" value="tmob">Teachers👽Mob</option>
                    <option value="1833">-Авторизация</option>
                    <option value="1836">-Виджет расписания</option>
                    <option value="1839">-Чат</option>
                    <option value="1835">-Виджет финансов</option>
                    <option value="1838">-Профиль</option>
                    <option value="1840">-Сторис</option>
                    <option value="1837">-Стр расписания</option>
                    <option value="1834">-Стр финансов</option>

                    <option class="${typeof selecttheme !== 'undefined' ? selecttheme : ''}" value="sksmpar">Skysmart👪родит</option>
                    <option value="1884">-Другое</option>
                    <option value="1883">-Материалы</option>
                    <option value="1880">-Предметы и баланс</option>
                    <option value="1881">-Профиль родителя</option>
                    <option value="1879">-Расписание</option>
                    <option value="1882">-Чат</option>

                    <option class="${typeof selecttheme !== 'undefined' ? selecttheme : ''}" value="solanka">Different</option>
                    <option value="2034">-Прочее</option>
                    <option value="2030">-Slack-вход</option>
                    <option value="2020">-Логи ур У</option>
                    <option value="2019">-Логи ур П</option>
                    <option value="2018">-БД ур оператор</option>
                    <option value="2017">-БД ур система</option>

                    <option class="${typeof selecttheme !== 'undefined' ? selecttheme : ''}" value="payf">Проблемы с оплатой</option>
                    <option value="1077">-Вина школы</option>
                    <option value="1658">-Консультация</option>
                    <option value="1661">-Карта У</option>
                    <option value="1662">-Сбой</option>
                    <option value="1660">-Подписки</option>

                    <option class="${typeof selecttheme !== 'undefined' ? selecttheme : ''}" value="hwtr">Проблемы с ДЗ</option>
                    <option value="1744">-Контент</option>
                    <option value="1745">-Оценка</option>
                    <option value="1746">-Словарь</option>
                    <option value="1747">-Упражнение</option>

                    <option class="${typeof selecttheme !== 'undefined' ? selecttheme : ''}" value="svyaz">Проблемы связь</option>
                    <option value="1581">-ОС/брауз ниж мин</option>
                    <option value="1589">-Конс раб св</option>
                </select>
                <button class="adds-glass-btn" id="gofindit">Find</button>
                <button class="adds-glass-btn" id="changetheme">Change</button>
            </div>

            <div style="display:flex; justify-content:space-between; flex-wrap: wrap; gap: 8px;">
                <button class="adds-glass-btn" id="getstatfromperiod">Статистика</button>
                <button class="adds-glass-btn" id="getlowcsat">КСАТ < 4</button>
                <button class="adds-glass-btn" id="parsechat">Поиск</button>
                <button class="adds-glass-btn" id="showFavoritesBtn" style="color:#ffb74d; border-color:#ffb74d;">Избранное ⭐</button>
                <button class="adds-glass-btn" id="clearall" style="color:#ef5350;">Очистить</button>
                <button class="adds-glass-btn" id="getfile">🔰</button>
            </div>

            <div id="chatcoutnsinfo" class="adds-content-area">
                <div id="mainStatsLabels" class="stat-label-group">
                    <span id="sumchatcounttouched"></span><br>
                    <span id="sumchatcountclosed"></span>
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
    .fav-glass-container { display: flex; width: 420px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .fav-glass-panel { width: 100%; background: rgba(30, 35, 45, 0.95); backdrop-filter: blur(16px); border: 1px solid rgba(255, 183, 77, 0.3); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: #e0e6ed; padding: 15px; }
    .fav-header { cursor: grab; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; }
    .fav-title { color: #ffb74d; font-weight: bold; font-size: 16px; }
    .fav-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: #fff; padding: 4px 10px; cursor: pointer; font-size: 12px; }
    .fav-btn:hover { background: rgba(255,255,255,0.2); }
    .fav-content { max-height: 400px; overflow-y: auto; padding-right: 4px; }
    .fav-content::-webkit-scrollbar { width: 6px; }
    .fav-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 4px; }
    .fav-empty { text-align: center; padding: 30px 20px; color: #aaa; }
    .fav-item { margin-bottom: 10px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; border-left: 3px solid #ffb74d; }
    .fav-link { color: #64b5f6; text-decoration: none; font-weight: bold; }
    .fav-actions { margin-top: 6px; }
    .fav-icon { cursor: pointer; margin-right: 10px; font-size: 15px; display: inline-block; transition: transform 0.2s; }
    .fav-icon:hover { transform: scale(1.2); }
    .fav-comment { font-size: 0.85em; color: #a5d6a7; margin-top: 4px; font-style: italic; }
    .fav-date { color: #777; font-style: normal; font-size: 0.8em; }
</style>
<div class="fav-glass-container">
    <div class="fav-glass-panel">
        <div class="fav-header">
            <span class="fav-title">⭐ Избранные задачи</span>
            <button class="fav-btn" id="hideMeFav">Скрыть</button>
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
    // Создаём отдельное окно избранного, если его ещё нет
    if (!document.getElementById('AF_Fav') && typeof createWindow === 'function') {
        createWindow('AF_Fav', 'winTopFav', 'winLeftFav', win_Fav);
        hideWindowOnDoubleClick('AF_Fav');
        hideWindowOnClick('AF_Fav', 'hideMeFav');
        // По умолчанию скрыто
        const favWin = document.getElementById('AF_Fav');
        if (favWin) favWin.style.display = 'none';
    }
}

// ---------- 4. Вспомогательные функции ----------
function fmtDate(d) { return d.toISOString().split('T')[0]; }
function toUTC(dateStr, h, m, s, ms) {
    const d = new Date(dateStr + "T00:00:00");
    d.setHours(h - 3, m, s, ms);
    return d.toISOString();
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

// ---------- 5. Логика Избранного (ОТДЕЛЬНОЕ ОКНО) ----------
function renderFavoritesWindow() {
    const container = document.getElementById('favContent');
    const favWin = document.getElementById('AF_Fav');
    if (!container) return;

    const favKeys = Object.keys(favoritesChats);

    if (favKeys.length === 0) {
        container.innerHTML = `<div class="fav-empty"><b>Избранных чатов пока нет.</b><br><small>Добавляйте их через ❤️ в статистике</small></div>`;
        return;
    }

    let html = "";
    favKeys.forEach(chatId => {
        const favData = favoritesChats[chatId];
        html += `<div class="fav-item">
            <span style="color:#00FA9A">&#5129;</span>
            <a href="https://skyeng.autofaq.ai/logs/${chatId}" target="_blank" class="fav-link">${chatId}</a>
            <div class="fav-actions">
                <span class="fav-icon open-history-btn" data-id="${chatId}" title="История">👁️</span>
                <span class="fav-icon toggle-fav-btn" data-id="${chatId}" title="Удалить из избранного">❤️</span>
            </div>
            <div class="fav-comment">💬 ${favData.comment} <span class="fav-date">(${favData.date})</span></div>
        </div>`;
    });
    container.innerHTML = html;
}

function toggleFavoritesWindow() {
    const favWin = document.getElementById('AF_Fav');
    if (!favWin) {
        console.warn('Окно AF_Fav не найдено');
        return;
    }
    if (favWin.style.display === 'none' || favWin.style.display === '') {
        renderFavoritesWindow();
        favWin.style.display = 'block';
    } else {
        favWin.style.display = 'none';
    }
}

// ---------- 6. Безопасная инициализация обработчиков ----------
function attachEventHandlers() {
    // Кнопка "Избранное" в основном окне — открывает ОТДЕЛЬНОЕ окно
    const showFavBtn = document.getElementById('showFavoritesBtn');
    if (showFavBtn) {
        showFavBtn.onclick = toggleFavoritesWindow;
    }

    // Кнопка "Очистить"
    const clearBtn = document.getElementById('clearall');
    if (clearBtn) {
        clearBtn.onclick = function () {
            ['sumchatcounttouched', 'sumchatcountclosed'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = "";
            });
            ['chatsinfoout', 'lowCSATcount', 'chatcommentsdata', 'favoritesSection'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerHTML = "";
            });
            const commentSearch = document.getElementById('commenttosearch');
            if (commentSearch) commentSearch.value = "";
            switchView('chatsinfoout');
        };
    }

    // Кнопка "Статистика"
    const statBtn = document.getElementById('getstatfromperiod');
    if (statBtn) {
        statBtn.onclick = async function () {
            switchView('chatsinfoout');
            const dateFromEl = document.getElementById('dateFrom');
            const dateToEl = document.getElementById('dateTo');
            if (!dateFromEl || !dateToEl) return;

            const datefrom = toUTC(dateFromEl.value, 0, 0, 0, 0);
            const dateto = toUTC(dateToEl.value, 23, 59, 59, 59);

            const out = document.getElementById('chatsinfoout');
            const btn = this;
            const originalText = btn.textContent;
            btn.textContent = "⏳...";
            if (out) out.innerHTML = "<i>Идет расчет...</i>";

            try {
                let page = 1, manualClosed = 0, csatScore = 0, csatCount = 0;
                const rates = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                let line2Html = "";

                const bodyTouched = { serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json", participatingOperatorsIds: [typeof operatorId !== 'undefined' ? operatorId : ''], tsFrom: datefrom, tsTo: dateto, page: 1, limit: 1 };
                const touchedData = await doOperationsWithHistory(JSON.stringify(bodyTouched));
                const touchedEl = document.getElementById('sumchatcounttouched');
                if (touchedEl) touchedEl.textContent = "Количество пощупанных чатов: " + (touchedData?.total || 0);

                while (true) {
                    const bodyArchive = { serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json", tsFrom: datefrom, tsTo: dateto, orderBy: "ts", orderDirection: "Asc", page: page, limit: 100 };
                    const resp = await fetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                        method: "POST",
                        headers: { "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' },
                        body: JSON.stringify(bodyArchive)
                    });
                    const data = await resp.json();
                    if (!data?.items?.length) break;

                    for (const item of data.items) {
                        const convReq = await doOperationsWithConversations(item.conversationId);
                        const conv = await convReq.json();

                        const currentOp = conv.operatorId || conv.assigneeId || item.operatorId;
                        if (typeof operatorId !== 'undefined' && String(currentOp) !== String(operatorId)) continue;

                        manualClosed++;

                        const rate = item.stats?.rate?.rate || item.stats?.rate || conv.stats?.rate?.rate || (conv.stats?.rate ? conv.stats.rate : 0);
                        if (rate && rate > 0) {
                            csatScore += Number(rate);
                            csatCount++;
                            if (rates.hasOwnProperty(rate)) rates[rate]++;
                        }

                        if (conv.messages?.some(m => m.txt?.includes("Техподдержка 2-я линия"))) {
                            const isFav = !!favoritesChats[item.conversationId];
                            line2Html += `<div style="margin-bottom: 5px;"><span style="color:#00FA9A">&#5129;</span> <a href="https://skyeng.autofaq.ai/logs/${item.conversationId}" target="_blank" class="adds-chat-link">${item.conversationId}</a> <span class="adds-action-icon open-history-btn" data-id="${item.conversationId}">👁️</span> <span class="adds-action-icon toggle-fav-btn" data-id="${item.conversationId}">${isFav ? '❤️' : '🤍'}</span></div>`;
                        }
                    }
                    if (page * 100 < data.total) page++; else break;
                }

                const closedEl = document.getElementById('sumchatcountclosed');
                if (closedEl) closedEl.textContent = "Количество закрытых чатов: " + manualClosed;

                if (out) {
                    out.innerHTML = `
                        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 10px; text-align:center;">
                            <b>Средняя оценка КСАТ:</b> <span style="color:#4db6ac; font-size:18px;">${csatCount ? (csatScore / csatCount).toFixed(2) : "0.00"}</span><br>
                            <small>Всего оценок: ${csatCount}</small>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:12px; color:#aaa;">
                            <span>1⭐:${rates[1]}</span><span>2⭐:${rates[2]}</span><span>3⭐:${rates[3]}</span><span>4⭐:${rates[4]}</span><span>5⭐:${rates[5]}</span>
                        </div>
                        <b style="color:#64b5f6;">Чаты переданные на 2ЛТП:</b><br>${line2Html || "<i>нет таких</i>"}`;
                }
            } catch (e) {
                console.error(e);
                if (out) out.innerHTML = "Ошибка!";
            } finally {
                btn.textContent = originalText;
            }
        };
    }

    // Делегирование кликов — обрабатывает и основное окно, и окно избранного
    document.addEventListener('click', async function (e) {
        const target = e.target.closest('.toggle-fav-btn');
        if (target) {
            const id = target.getAttribute('data-id');
            if (!id) return;
            e.preventDefault();

            if (favoritesChats[id]) {
                delete favoritesChats[id];
                target.textContent = '🤍';
            } else {
                const comment = prompt("Введите заметку для этой задачи:", "На контроле (2ЛТП)");
                if (comment !== null) {
                    favoritesChats[id] = { comment: comment || "Без комментария", date: new Date().toLocaleDateString() };
                    target.textContent = '❤️';
                }
            }
            saveFavorites();
            // Обновляем окно избранного, если оно открыто
            const favWin = document.getElementById('AF_Fav');
            if (favWin && favWin.style.display === 'block') {
                renderFavoritesWindow();
            }
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

    // Ждём появления элементов в DOM, затем вешаем обработчики
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