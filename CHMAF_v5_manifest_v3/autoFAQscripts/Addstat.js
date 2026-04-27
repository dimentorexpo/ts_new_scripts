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
    win.style.display = (win.style.display === 'none' || win.style.display === '') ? 'block' : 'none';
};

// ---------- 2. Разметка основного окна (Cyber-Dark UI) ----------
var win_Stat = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    .adds-glass-container { display: flex; width: 580px; font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }

    /* Cyber-Dark Base Panel */
    .adds-glass-panel { width: 100%; background: #0a0d14; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid #1f2430; border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(0, 240, 255, 0.03); color: #a1aab8; padding: 18px; position: relative; overflow: hidden; }

    .adds-glass-header { cursor: grab; }

    /* Inputs & Selects */
    .adds-glass-input, .adds-glass-select { background: #131722; border: 1px solid #282e3e; border-radius: 6px; color: #e2e8f0; padding: 8px 12px; outline: none; transition: all 0.3s ease; font-family: inherit; font-size: 13px; }
    .adds-glass-input:focus, .adds-glass-select:focus { background: #181d2a; border-color: #00f0ff; box-shadow: 0 0 10px rgba(0, 240, 255, 0.2); color: #fff; }
    .adds-glass-select option { background: #131722; color: #fff; }

    /* Cyber Buttons */
    .adds-glass-btn { background: #131722; border: 1px solid #282e3e; border-radius: 6px; color: #94a3b8; padding: 8px 14px; cursor: pointer; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center; }
    .adds-glass-btn:hover { background: #1a202c; border-color: #00f0ff; color: #00f0ff; box-shadow: 0 0 12px rgba(0, 240, 255, 0.25); text-shadow: 0 0 5px rgba(0,240,255,0.5); transform: translateY(-1px); }

    /* Grid Buttons Layout */
    .action-buttons-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; border-top: 1px dashed #1f2430; padding-top: 15px; margin-top: 5px; }
    .action-buttons-grid .adds-glass-btn { width: 100%; box-sizing: border-box; }

    /* Flex Layouts */
    .adds-flex-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }

    /* Custom Scrollbar */
    .adds-content-area { max-height: 380px; overflow-y: auto; margin-top: 15px; padding-right: 8px; }
    .adds-content-area::-webkit-scrollbar { width: 6px; }
    .adds-content-area::-webkit-scrollbar-track { background: #0a0d14; border-radius: 4px; }
    .adds-content-area::-webkit-scrollbar-thumb { background: #282e3e; border-radius: 4px; border: 1px solid #131722; }
    .adds-content-area::-webkit-scrollbar-thumb:hover { background: #00f0ff; box-shadow: 0 0 10px #00f0ff; }

    /* Link & Action Icons */
    .adds-chat-link { color: #cbd5e1; text-decoration: none; font-weight: 600; transition: color 0.2s; }
    .adds-chat-link:hover { color: #00f0ff; text-shadow: 0 0 8px rgba(0,240,255,0.4); }
    .adds-action-icon { cursor: pointer; margin-left: 8px; transition: all 0.2s; display: inline-block; font-size: 16px; opacity: 0.8; }
    .adds-action-icon:hover { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)); }

    .stat-label-group { margin-bottom: 10px; border-bottom: 1px solid #1f2430; padding-bottom: 12px; }

    /* === CYBER STAT CARDS === */
    .stat-cards-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .stat-card { flex: 1; background: #131722; border-radius: 10px; padding: 14px 6px; text-align: center; border: 1px solid #1f2430; transition: all 0.3s ease; position: relative; overflow: hidden; }
    .stat-card:hover { transform: translateY(-3px); background: #161b28; box-shadow: 0 8px 20px rgba(0,0,0,0.5); }
    .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 10px 10px 0 0; }

    .stat-card-touched::before { background: #00f0ff; box-shadow: 0 0 15px #00f0ff; }
    .stat-card-closed::before { background: #39ff14; box-shadow: 0 0 15px #39ff14; }
    .stat-card-transferred::before { background: #b829ea; box-shadow: 0 0 15px #b829ea; }

    .stat-card-icon { font-size: 12px; margin-bottom: 8px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-card-value { display: block; font-size: 28px; font-weight: 800; letter-spacing: -1px; margin-top: 4px; font-family: 'Inter', sans-serif; }

    .stat-card-touched .stat-card-value { color: #00f0ff; text-shadow: 0 0 12px rgba(0,240,255,0.4); }
    .stat-card-closed .stat-card-value { color: #39ff14; text-shadow: 0 0 12px rgba(57,255,20,0.4); }
    .stat-card-transferred .stat-card-value { color: #b829ea; text-shadow: 0 0 12px rgba(184,41,234,0.4); }

    /* === PREMIUM CYBER CSAT === */
    .csat-premium-container { background: #0f131c; border-radius: 12px; padding: 18px; margin-bottom: 16px; border: 1px solid #1f2430; box-shadow: inset 0 0 30px rgba(0,0,0,0.6); animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity:0; transform: translateY(-10px);} to { opacity:1; transform: translateY(0);} }
    .csat-premium-header { text-align: center; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px dashed #282e3e; }
    .csat-premium-score { font-size: 42px; font-weight: 800; letter-spacing: -1.5px; line-height: 1; }
    .csat-premium-total { color: #64748b; font-size: 11px; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
    .csat-premium-bars { display: flex; flex-direction: column; gap: 12px; }
    .csat-premium-row { display: flex; align-items: center; gap: 12px; }
    .csat-premium-label { width: 32px; text-align: center; font-weight: 800; font-size: 15px; }
    .csat-premium-bar-wrap { flex: 1; height: 18px; background: #131722; border-radius: 4px; border: 1px solid #1f2430; overflow: hidden; position: relative; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5); }
    .csat-premium-bar-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1); display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; box-sizing: border-box; min-width: 28px; position: relative; }
    .csat-premium-count { font-size: 11px; font-weight: 800; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,0.8); z-index: 2; }
    .csat-premium-percent { width: 45px; text-align: right; font-size: 12px; color: #94a3b8; font-weight: 700; }

    /* === CYBER 2ЛТП LIST === */
    .line2-section-title { color: #00f0ff; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; font-size: 12px; margin: 20px 0 12px; text-shadow: 0 0 8px rgba(0,240,255,0.4); display: flex; align-items: center; gap: 8px; }
    .line2-section-title::before { content: '⚡'; text-shadow: none; font-size: 14px; }
    .line2-list { display: flex; flex-direction: column; gap: 8px; }
    .line2-item { display: flex; align-items: center; justify-content: space-between; background: #131722; border-radius: 8px; padding: 10px 14px; border: 1px solid #1f2430; transition: all 0.2s ease; }
    .line2-item:hover { background: #161b28; border-color: #00f0ff; box-shadow: inset 0 0 15px rgba(0,240,255,0.05), 0 4px 10px rgba(0,0,0,0.4); transform: translateX(4px); }
    .line2-left { display: flex; align-items: center; gap: 10px; }
    .line2-arrow { color: #b829ea; font-size: 12px; text-shadow: 0 0 8px rgba(184,41,234,0.6); }
    .line2-actions { display: flex; gap: 10px; align-items: center; }
    .line2-empty { color: #475569; font-style: italic; font-size: 12px; padding: 10px 4px; text-align: center; }
</style>

<div class="adds-glass-container">
    <div class="adds-glass-panel">
        <div class="adds-glass-header">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
                <button class="adds-glass-btn buttonHide" id="hideMeStat" style="padding: 4px 10px; border-color: #ef4444; color: #ef4444;">❌</button>
            </div>

            <div class="adds-flex-row" style="justify-content: center; gap: 8px; flex-wrap: wrap;">
                <button class="adds-glass-btn" id="prevDayStata" title="Сдвинуть на 1 день назад">◀ -1д</button>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #64748b;">От</span>
                    <input type="date" id="dateFrom" class="adds-glass-input" style="width: 120px;">
                </div>
                <div style="display: flex; align-items: center; gap: 6px;">
                    <span style="font-size: 11px; text-transform: uppercase; color: #64748b;">До</span>
                    <input type="date" id="dateTo" class="adds-glass-input" style="width: 120px;">
                </div>
                <button class="adds-glass-btn" id="nextDayStata" title="Сдвинуть на 1 день вперёд">+1д ▶</button>
            </div>

            <div style="text-align: center; margin-bottom: 5px; display: flex; flex-direction: column; gap: 10px;">
                <input id="commenttosearch" class="adds-glass-input" autocomplete="off" placeholder="Слово/фраза для поиска по заметкам" style="width: 100%; box-sizing: border-box;">
                <div style="display: flex; gap: 10px;">
                    <select id="thematics" class="adds-glass-select" style="flex: 1;">
                        <option class="${typeof selecttheme !== 'undefined' ? selecttheme : ''}" value="skmob">Skyeng👨‍🎓Mob</option>
                        <option value="1804">-Авторизация</option>
                        <option value="1805">-Домашка</option>
                        <option value="1810">-Чат</option>
                        <option value="payf">Проблемы с оплатой</option>
                        <option value="hwtr">Проблемы с ДЗ</option>
                    </select>
                    <button class="adds-glass-btn" id="gofindit">Search</button>
                    <button class="adds-glass-btn" id="changetheme">Change</button>
                </div>
            </div>

            <div class="action-buttons-grid">
                <button class="adds-glass-btn" id="getstatfromperiod">Статистика</button>
                <button class="adds-glass-btn" id="getlowcsat">CSAT < 4</button>
                <button class="adds-glass-btn" id="parsechat">Поиск</button>
                <button class="adds-glass-btn" id="showFavoritesBtn" style="color:#fbbf24; border-color: rgba(251,191,36,0.3);">Избранное ⭐</button>
                <button class="adds-glass-btn" id="clearall" style="color:#ef4444; border-color: rgba(239,68,68,0.3);">Очистить</button>
                <button class="adds-glass-btn" id="getfile" style="color:#39ff14; border-color: rgba(57,255,20,0.3);">Экспорт 🔰</button>
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
    .fav-glass-container { display: flex; width: 440px; font-family: 'Inter', 'Segoe UI', sans-serif; }
    .fav-glass-panel { width: 100%; background: #0a0d14; border: 1px solid #fbbf24; border-radius: 12px; box-shadow: 0 15px 35px rgba(0,0,0,0.8), 0 0 20px rgba(251,191,36,0.1); color: #a1aab8; padding: 18px; }
    .fav-header { cursor: grab; display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px dashed #1f2430; padding-bottom: 12px; }
    .fav-title { color: #fbbf24; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 10px rgba(251,191,36,0.3); }
    .fav-btn { background: #131722; border: 1px solid #ef4444; border-radius: 6px; color: #ef4444; padding: 6px 10px; cursor: pointer; font-size: 11px; font-weight: bold; transition: all 0.2s; }
    .fav-btn:hover { background: #1a202c; color: #fff; box-shadow: 0 0 10px rgba(239,68,68,0.5); }

    .fav-content { max-height: 400px; overflow-y: auto; padding-right: 6px; }
    .fav-content::-webkit-scrollbar { width: 6px; }
    .fav-content::-webkit-scrollbar-track { background: #0a0d14; }
    .fav-content::-webkit-scrollbar-thumb { background: #282e3e; border-radius: 4px; }

    .fav-empty { text-align: center; padding: 40px 20px; color: #475569; font-size: 13px; }

    .fav-item { margin-bottom: 10px; background: #131722; padding: 12px; border-radius: 8px; border: 1px solid #1f2430; border-left: 3px solid #fbbf24; transition: all 0.2s ease; }
    .fav-item:hover { background: #161b28; border-color: #fbbf24; box-shadow: inset 0 0 15px rgba(251,191,36,0.05); transform: translateX(3px); }
    .fav-link { color: #e2e8f0; text-decoration: none; font-weight: 700; transition: color 0.2s; font-size: 14px; }
    .fav-item:hover .fav-link { color: #fbbf24; }
    .fav-actions { margin-top: 10px; border-top: 1px solid #1f2430; padding-top: 8px; display: flex; gap: 12px; }
    .fav-icon { cursor: pointer; font-size: 16px; transition: transform 0.2s; opacity: 0.8; }
    .fav-icon:hover { transform: scale(1.2); opacity: 1; }
    .fav-comment { font-size: 12px; color: #94a3b8; margin-top: 6px; }
    .fav-comment-text { color: #39ff14; font-weight: 500; }
    .fav-date { color: #475569; font-size: 10px; float: right; margin-top: 2px; }
</style>
<div class="fav-glass-container">
    <div class="fav-glass-panel">
        <div class="fav-header">
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

function toUTC(dateStr, h, m, s, ms) {
    const d = new Date(dateStr + "T00:00:00");
    d.setHours(h - 3, m, s, ms);
    return d.toISOString();
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
            <span style="color:#b829ea; margin-right:5px;">⚡</span>
            <a href="https://skyeng.autofaq.ai/logs/${chatId}" target="_blank" class="fav-link">${chatId}</a>
            <span class="fav-date">${favData.date}</span>
            <div class="fav-comment">Заметка: <span class="fav-comment-text">${favData.comment}</span></div>
            <div class="fav-actions">
                <span class="fav-icon open-history-btn" data-id="${chatId}" title="Открыть историю">👁️</span>
                <span class="fav-icon toggle-fav-btn" data-id="${chatId}" title="Удалить из избранного">🗑️</span>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

function toggleFavoritesWindow() {
    const favWin = document.getElementById('AF_Fav');
    if (!favWin) return;
    if (favWin.style.display === 'none' || favWin.style.display === '') {
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
            switchView('chatsinfoout');
            const dateFromEl = document.getElementById('dateFrom');
            const dateToEl = document.getElementById('dateTo');
            if (!dateFromEl || !dateToEl || !dateFromEl.value || !dateToEl.value) {
                alert('Укажите даты');
                return;
            }

            const datefrom = toUTC(dateFromEl.value, 0, 0, 0, 0);
            const dateto = toUTC(dateToEl.value, 23, 59, 59, 59);

            const out = document.getElementById('chatsinfoout');
            const btn = this;
            const originalText = btn.textContent;
            btn.textContent = "⏳...";

            if (out) {
                out.innerHTML = `
                    <div style="padding: 20px 10px;">
                        <div id="statProgressBar" style="width: 100%; background: #131722; border-radius: 6px; border: 1px solid #1f2430; overflow: hidden; height: 14px; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);">
                            <div id="statProgressFill" style="width: 0%; height: 100%; background: #00f0ff; box-shadow: 0 0 10px rgba(0,240,255,0.6); transition: width 0.3s ease;"></div>
                        </div>
                        <div id="statProgressText" style="text-align: center; color: #00f0ff; margin-top: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 0 8px rgba(0,240,255,0.4);">Инициализация...</div>
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

                while (true) {
                    const bodyArchive = { serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json", tsFrom: datefrom, tsTo: dateto, orderBy: "ts", orderDirection: "Asc", page: page, limit: 100 };
                    const resp = await fetch("https://skyeng.autofaq.ai/api/conversations/queues/archive", {
                        method: "POST",
                        headers: { "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' },
                        body: JSON.stringify(bodyArchive)
                    });
                    const data = await resp.json();

                    if (!data?.items?.length) break;

                    if (page === 1) totalArchiveItems = data.total || 1;

                    for (const item of data.items) {
                        const convReq = await doOperationsWithConversations(item.conversationId);
                        const conv = await convReq.json();

                        processedCount++;
                        let percent = Math.min(100, Math.round((processedCount / totalArchiveItems) * 100));
                        const fill = document.getElementById('statProgressFill');
                        const text = document.getElementById('statProgressText');
                        if (fill) fill.style.width = percent + '%';
                        if (text) text.textContent = `Анализ пула очереди... ${processedCount} / ${totalArchiveItems} (${percent}%)`;

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

                        if (isLine2) {
                            line2Count++;
                            const isFav = !!favoritesChats[item.conversationId];
                            line2Html += `<div class="line2-item">
                                <div class="line2-left">
                                    <span class="line2-arrow">⚡</span>
                                    <a href="https://skyeng.autofaq.ai/logs/${item.conversationId}" target="_blank" class="adds-chat-link">${item.conversationId}</a>
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
                    if (page * 100 < data.total) page++; else break;
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

                const rateColors = { 1: '#ff003c', 2: '#ff6600', 3: '#ffea00', 4: '#39ff14', 5: '#00f0ff' };
                const rateGlow = { 1: 'rgba(255,0,60,0.5)', 2: 'rgba(255,102,0,0.5)', 3: 'rgba(255,234,0,0.4)', 4: 'rgba(57,255,20,0.4)', 5: 'rgba(0,240,255,0.4)' };

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

                const scoreColor = csatAvg >= 4.5 ? '#00f0ff' : csatAvg >= 4 ? '#39ff14' : csatAvg >= 3 ? '#ffea00' : '#ff003c';
                const emoji = csatAvg >= 4.5 ? '🏆' : csatAvg >= 4 ? '🔥' : csatAvg >= 3 ? '😐' : '💀';

                const out = document.getElementById('chatsinfoout');
                if (out) {
                    out.innerHTML = `
                        <div class="csat-premium-container">
                            <div class="csat-premium-header">
                                <div class="csat-premium-score" style="color:${scoreColor}; text-shadow: 0 0 20px ${scoreColor};">${csatAvg} <span style="font-size:30px; filter: grayscale(0.2);">${emoji}</span></div>
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
                const comment = prompt("Введите заметку для этой задачи:", "На контроле (2ЛТП)");
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