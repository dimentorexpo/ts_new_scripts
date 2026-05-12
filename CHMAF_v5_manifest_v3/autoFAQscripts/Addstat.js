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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    /* ============================================
       AF Stat — NEON GLASS ULTRA
       ============================================ */

    .adds-glass-container {
        display: flex;
        width: 580px;
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    }

    /* Main Panel */
    .adds-glass-panel {
        width: 100%;
        position: relative;
        background:
            linear-gradient(135deg, rgba(26, 26, 44, 0.94) 0%, rgba(18, 18, 34, 0.96) 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23242850' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        backdrop-filter: blur(20px) saturate(1.3);
        -webkit-backdrop-filter: blur(20px) saturate(1.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.5),
            0 20px 50px rgba(0, 0, 0, 0.7),
            0 0 30px rgba(139, 92, 246, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        color: #e2e8f0;
        padding: 16px;
        overflow: hidden;
        animation: nuFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Animated neon top border */
    .adds-glass-panel::before {
        content: '';
        position: absolute;
        top: 0; left: -50%; right: -50%;
        height: 2px;
        background: linear-gradient(90deg,
            transparent 0%,
            #8b5cf6 20%,
            #ec4899 40%,
            #06b6d4 60%,
            #8b5cf6 80%,
            transparent 100%);
        background-size: 200% 100%;
        animation: nuBorderFlow 3s linear infinite;
        opacity: 0.7;
        z-index: 5;
        pointer-events: none;
    }

    /* Inner radial glow */
    .adds-glass-panel::after {
        content: '';
        position: absolute;
        top: -50%; left: -50%;
        width: 200%; height: 200%;
        background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
    }

    @keyframes nuBorderFlow {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
    }

    @keyframes nuFadeIn {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .adds-glass-header {
        position: relative;
        z-index: 2;
        cursor: grab;
    }

    /* Inputs & Selects — Neon Glass */
    .adds-glass-input, .adds-glass-select {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        color: #e2e8f0;
        padding: 7px 10px;
        outline: none;
        transition: all 0.25s ease;
        font-family: inherit;
        font-size: 12px;
        position: relative;
        z-index: 1;
    }

    .adds-glass-input:focus, .adds-glass-select:focus {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(34, 211, 238, 0.5);
        box-shadow:
            0 0 0 2px rgba(34, 211, 238, 0.05),
            0 0 12px rgba(34, 211, 238, 0.1);
        color: #fff;
    }

    .adds-glass-select option {
        background: #1a1a2e;
        color: #e2e8f0;
    }

    /* Neon Glass Buttons */
    .adds-glass-btn {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        color: #94a3b8;
        padding: 7px 12px;
        cursor: pointer;
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
        z-index: 1;
    }

    .adds-glass-btn::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 45%;
        background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
        border-radius: 8px 8px 0 0;
        pointer-events: none;
    }

    .adds-glass-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }

    /* Button color accents */
    #gofindit:hover, #changetheme:hover {
        border-color: rgba(34, 211, 238, 0.4);
        color: #22d3ee;
        box-shadow: 0 0 12px rgba(34, 211, 238, 0.15), inset 0 0 8px rgba(34, 211, 238, 0.05);
    }

    #getstatfromperiod:hover {
        border-color: rgba(52, 211, 153, 0.4);
        color: #34d399;
        box-shadow: 0 0 12px rgba(52, 211, 153, 0.15), inset 0 0 8px rgba(52, 211, 153, 0.05);
    }

    #getlowcsat:hover {
        border-color: rgba(248, 113, 113, 0.4);
        color: #f87171;
        box-shadow: 0 0 12px rgba(248, 113, 113, 0.15), inset 0 0 8px rgba(248, 113, 113, 0.05);
    }

    #parsechat:hover {
        border-color: rgba(167, 139, 250, 0.4);
        color: #a78bfa;
        box-shadow: 0 0 12px rgba(167, 139, 250, 0.15), inset 0 0 8px rgba(167, 139, 250, 0.05);
    }

    #showFavoritesBtn:hover {
        color: #fbbf24 !important;
        border-color: rgba(251, 191, 36, 0.4) !important;
        box-shadow: 0 0 12px rgba(251, 191, 36, 0.15), inset 0 0 8px rgba(251, 191, 36, 0.05) !important;
    }

    #clearall:hover {
        color: #f87171 !important;
        border-color: rgba(248, 113, 113, 0.4) !important;
        box-shadow: 0 0 12px rgba(248, 113, 113, 0.15), inset 0 0 8px rgba(248, 113, 113, 0.05) !important;
    }

    #hideMeStat:hover {
        color: #f87171 !important;
        border-color: rgba(248, 113, 113, 0.4) !important;
        box-shadow: 0 0 12px rgba(248, 113, 113, 0.15), inset 0 0 8px rgba(248, 113, 113, 0.05) !important;
    }

    /* Grid Buttons */
    .action-buttons-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 14px;
        margin-top: 5px;
        position: relative;
        z-index: 1;
    }

    .action-buttons-grid .adds-glass-btn { width: 100%; box-sizing: border-box; }

    /* Flex Layouts */
    .adds-flex-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        position: relative;
        z-index: 1;
    }

    /* Custom Scrollbar — Neon */
    .adds-content-area {
        max-height: 380px;
        overflow-y: auto;
        margin-top: 14px;
        padding-right: 6px;
        position: relative;
        z-index: 1;
    }

    .adds-content-area::-webkit-scrollbar { width: 4px; }
    .adds-content-area::-webkit-scrollbar-track { background: transparent; }
    .adds-content-area::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 4px; }
    .adds-content-area::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }

    /* Link & Action Icons */
    .adds-chat-link {
        color: #cbd5e1;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.2s ease;
    }

    .adds-chat-link:hover {
        color: #22d3ee;
        text-shadow: 0 0 8px rgba(34, 211, 238, 0.4);
    }

    .adds-action-icon {
        cursor: pointer;
        margin-left: 8px;
        transition: all 0.2s ease;
        display: inline-block;
        font-size: 15px;
        opacity: 0.7;
    }

    .adds-action-icon:hover {
        transform: scale(1.15);
        opacity: 1;
        filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));
    }

    .stat-label-group {
        margin-bottom: 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding-bottom: 12px;
        position: relative;
        z-index: 1;
    }

    /* === NEON GLASS STAT CARDS === */
    .stat-cards-row {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        position: relative;
        z-index: 1;
    }

    .stat-card {
        flex: 1;
        position: relative;
        background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        padding: 12px 6px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    }

    .stat-card::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 40%;
        background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
        border-radius: 12px 12px 0 0;
        pointer-events: none;
    }

    .stat-card:hover {
        transform: translateY(-3px);
        background: linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
        box-shadow: 0 8px 25px rgba(0,0,0,0.5), 0 0 20px var(--card-glow, transparent);
        border-color: rgba(255, 255, 255, 0.08);
    }

    .stat-card-touched { --card-glow: rgba(34, 211, 238, 0.1); }
    .stat-card-closed { --card-glow: rgba(52, 211, 153, 0.1); }
    .stat-card-transferred { --card-glow: rgba(167, 139, 250, 0.1); }

    .stat-card-touched::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, #22d3ee, transparent);
        opacity: 0.6;
    }

    .stat-card-closed::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, #34d399, transparent);
        opacity: 0.6;
    }

    .stat-card-transferred::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 2px;
        background: linear-gradient(90deg, transparent, #a78bfa, transparent);
        opacity: 0.6;
    }

    .stat-card-icon {
        font-size: 10px;
        margin-bottom: 6px;
        color: #94a3b8;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        position: relative;
        z-index: 1;
    }

    .stat-card-value {
        display: block;
        font-size: 26px;
        font-weight: 900;
        letter-spacing: -1px;
        margin-top: 2px;
        font-family: 'Inter', sans-serif;
        position: relative;
        z-index: 1;
    }

    .stat-card-touched .stat-card-value { color: #22d3ee; text-shadow: 0 0 12px rgba(34, 211, 238, 0.4); }
    .stat-card-closed .stat-card-value { color: #34d399; text-shadow: 0 0 12px rgba(52, 211, 153, 0.4); }
    .stat-card-transferred .stat-card-value { color: #a78bfa; text-shadow: 0 0 12px rgba(167, 139, 250, 0.4); }

    /* === NEON GLASS CSAT === */
    .csat-premium-container {
        background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 14px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03);
        animation: nuFadeIn 0.4s ease-out;
        position: relative;
        z-index: 1;
        overflow: hidden;
    }

    .csat-premium-container::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 40%;
        background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%);
        border-radius: 12px 12px 0 0;
        pointer-events: none;
    }

    .csat-premium-header {
        text-align: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        position: relative;
        z-index: 1;
    }

    .csat-premium-score {
        font-size: 40px;
        font-weight: 900;
        letter-spacing: -1.5px;
        line-height: 1;
    }

    .csat-premium-total {
        color: #64748b;
        font-size: 10px;
        margin-top: 8px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-weight: 700;
    }

    .csat-premium-bars {
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
        z-index: 1;
    }

    .csat-premium-row { display: flex; align-items: center; gap: 10px; }

    .csat-premium-label {
        width: 32px;
        text-align: center;
        font-weight: 900;
        font-size: 14px;
    }

    .csat-premium-bar-wrap {
        flex: 1;
        height: 16px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.3);
    }

    .csat-premium-bar-fill {
        height: 100%;
        border-radius: 5px;
        transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 8px;
        box-sizing: border-box;
        min-width: 28px;
        position: relative;
        box-shadow: 0 0 10px var(--bar-glow, transparent);
    }

    .csat-premium-count {
        font-size: 10px;
        font-weight: 900;
        color: #fff;
        text-shadow: 0 1px 3px rgba(0,0,0,0.8);
        z-index: 2;
    }

    .csat-premium-percent {
        width: 45px;
        text-align: right;
        font-size: 11px;
        color: #94a3b8;
        font-weight: 700;
    }

    /* === NEON GLASS 2ЛТП LIST === */
    .line2-section-title {
        color: #22d3ee;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        font-weight: 800;
        font-size: 11px;
        margin: 18px 0 10px;
        text-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
        z-index: 1;
    }

    .line2-section-title::before { content: '⚡'; text-shadow: none; font-size: 13px; }

    .line2-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        position: relative;
        z-index: 1;
    }

    .line2-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
        border-radius: 10px;
        padding: 8px 12px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        z-index: 1;
    }

    .line2-item::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 40%;
        background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
        border-radius: 10px 10px 0 0;
        pointer-events: none;
    }

    .line2-item:hover {
        background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
        border-color: rgba(34, 211, 238, 0.15);
        box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 15px rgba(34, 211, 238, 0.05);
        transform: translateX(4px);
    }

    .line2-left { display: flex; align-items: center; gap: 8px; position: relative; z-index: 1; }

    .line2-arrow {
        color: #a78bfa;
        font-size: 11px;
        text-shadow: 0 0 8px rgba(167, 139, 250, 0.5);
    }

    .line2-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        position: relative;
        z-index: 1;
    }

    .line2-empty {
        color: #475569;
        font-style: italic;
        font-size: 11px;
        padding: 10px 4px;
        text-align: center;
    }
</style>

<div class="adds-glass-container">
    <div class="adds-glass-panel">
        <div class="adds-glass-header chmaf-drag-handle">
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
                <button class="adds-glass-btn" id="getstatfromperiod">Статистика</button>
                <button class="adds-glass-btn" id="getlowcsat">CSAT < 4</button>
                <button class="adds-glass-btn" id="parsechat">Поиск</button>
                <button class="adds-glass-btn" id="showFavoritesBtn" style="color:#fbbf24; border-color: rgba(251,191,36,0.3);">Избранное ⭐</button>
                <button class="adds-glass-btn" id="clearall" style="color:#ef4444; border-color: rgba(239,68,68,0.3);">Очистить</button>
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
     /* === FAVORITES WINDOW — NEON GLASS === */
    .fav-glass-container {
        display: flex;
        width: 440px;
        font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    .fav-glass-panel {
        width: 100%;
        position: relative;
        background:
            linear-gradient(135deg, rgba(26, 26, 44, 0.94) 0%, rgba(18, 18, 34, 0.96) 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23242850' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        border: 1px solid rgba(251, 191, 36, 0.2);
        border-radius: 16px;
        box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.5),
            0 20px 50px rgba(0, 0, 0, 0.7),
            0 0 30px rgba(251, 191, 36, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        color: #e2e8f0;
        padding: 16px;
        overflow: hidden;
        animation: nuFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .fav-glass-panel::before {
        content: '';
        position: absolute;
        top: 0; left: -50%; right: -50%;
        height: 2px;
        background: linear-gradient(90deg,
            transparent 0%,
            #fbbf24 30%,
            #fb923c 60%,
            transparent 100%);
        background-size: 200% 100%;
        animation: nuBorderFlow 3s linear infinite;
        opacity: 0.6;
        pointer-events: none;
    }

    .fav-glass-panel::after {
        content: '';
        position: absolute;
        top: -50%; left: -50%;
        width: 200%; height: 200%;
        background: radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.06) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
    }

    .fav-header {
        cursor: grab;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        padding-bottom: 12px;
        position: relative;
        z-index: 1;
    }

    .fav-title {
        color: #fbbf24;
        font-weight: 900;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        text-shadow: 0 0 12px rgba(251, 191, 36, 0.3);
    }

    .fav-btn {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(248, 113, 113, 0.3);
        border-radius: 8px;
        color: #f87171;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 10px;
        font-weight: 700;
        transition: all 0.25s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .fav-btn:hover {
        background: rgba(248, 113, 113, 0.1);
        border-color: rgba(248, 113, 113, 0.5);
        color: #fff;
        box-shadow: 0 0 12px rgba(248, 113, 113, 0.15);
        transform: translateY(-1px);
    }

    .fav-content {
        max-height: 400px;
        overflow-y: auto;
        padding-right: 4px;
        position: relative;
        z-index: 1;
    }

    .fav-content::-webkit-scrollbar { width: 4px; }
    .fav-content::-webkit-scrollbar-track { background: transparent; }
    .fav-content::-webkit-scrollbar-thumb { background: rgba(251, 191, 36, 0.3); border-radius: 4px; }
    .fav-content::-webkit-scrollbar-thumb:hover { background: rgba(251, 191, 36, 0.5); }

    .fav-empty {
        text-align: center;
        padding: 40px 20px;
        color: #475569;
        font-size: 12px;
    }

    .fav-item {
        margin-bottom: 8px;
        background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-left: 3px solid #fbbf24;
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }

    .fav-item::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 40%;
        background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%);
        border-radius: 10px 10px 0 0;
        pointer-events: none;
    }

    .fav-item:hover {
        background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
        border-color: rgba(251, 191, 36, 0.15);
        box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 15px rgba(251, 191, 36, 0.05);
        transform: translateX(3px);
    }

    .fav-link {
        color: #e2e8f0;
        text-decoration: none;
        font-weight: 700;
        transition: color 0.2s;
        font-size: 13px;
        position: relative;
        z-index: 1;
    }

    .fav-item:hover .fav-link { color: #fbbf24; }

    .fav-actions {
        margin-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        padding-top: 8px;
        display: flex;
        gap: 12px;
        position: relative;
        z-index: 1;
    }

    .fav-icon {
        cursor: pointer;
        font-size: 15px;
        transition: all 0.2s ease;
        opacity: 0.7;
    }

    .fav-icon:hover {
        transform: scale(1.15);
        opacity: 1;
        filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));
    }

    .fav-comment {
        font-size: 11px;
        color: #94a3b8;
        margin-top: 6px;
        position: relative;
        z-index: 1;
    }

    .fav-comment-text { color: #34d399; font-weight: 600; }

    .fav-date {
        color: #475569;
        font-size: 10px;
        float: right;
        margin-top: 2px;
    }
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
                        const conv = await doOperationsWithConversations(item.conversationId);

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