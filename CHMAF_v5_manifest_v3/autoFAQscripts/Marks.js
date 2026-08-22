// --- CSS стили Premium Obsidian внедрены напрямую ---
const glassStylesMarks = `
<style>
    .af-gl-container {
        display: flex;
        flex-direction: column;
        width: 340px;
        background: linear-gradient(165deg, rgba(26, 32, 30, 0.94) 0%, rgba(12, 15, 14, 0.97) 100%);
        backdrop-filter: blur(24px) saturate(140%);
        -webkit-backdrop-filter: blur(24px) saturate(140%);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-top-color: rgba(255, 255, 255, 0.16);
        border-radius: 18px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
        padding: 16px;
        color: #e8f0ec;
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        box-sizing: border-box;
        gap: 12px;
    }
    .marks-gl-header { display: flex; justify-content: space-between; align-items: center; cursor: grab; }
    .marks-titleblock { display: flex; align-items: center; gap: 10px; }
    .marks-icon-chip {
        width: 34px; height: 34px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 17px;
        background: linear-gradient(135deg, rgba(52, 211, 153, 0.22), rgba(5, 150, 105, 0.1));
        border: 1px solid rgba(52, 211, 153, 0.35);
        box-shadow: 0 4px 14px rgba(52, 211, 153, 0.18), inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .marks-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.3px; }
    .marks-subtitle {
        font-size: 9px; text-transform: uppercase;
        letter-spacing: 1.4px; color: rgba(255, 255, 255, 0.45);
    }

    .af-gl-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #dfe6f1;
        border-radius: 10px;
        padding: 7px 11px;
        cursor: pointer;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 12px;
        line-height: 1;
        outline: none;
    }
    .af-gl-btn:hover {
        background: rgba(255, 255, 255, 0.13);
        border-color: rgba(52, 211, 153, 0.35);
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    }
    .af-gl-btn:active { transform: translateY(0) scale(0.97); }

    #findmarksstat.af-gl-btn:hover {
        background: rgba(52, 211, 153, 0.18);
        border-color: rgba(52, 211, 153, 0.5);
    }

    .af-gl-row { display: flex; align-items: center; justify-content: space-between; gap: 7px; }
    .af-gl-row > span {
        font-size: 10px; text-transform: uppercase;
        letter-spacing: 1px; color: rgba(255, 255, 255, 0.45);
        font-weight: 600;
    }

    .af-gl-input {
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.09);
        color: #fff;
        border-radius: 10px;
        padding: 8px 11px;
        outline: none;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: inherit;
        font-size: 13px;
        min-width: 0;
    }
    .af-gl-input:focus {
        border-color: rgba(52, 211, 153, 0.6);
        background: rgba(0, 0, 0, 0.5);
        box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.12);
    }
    .af-gl-input::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }

    .af-gl-stats-box {
        background: rgba(0, 0, 0, 0.28);
        border-radius: 13px;
        padding: 14px;
        max-height: 360px;
        overflow-y: auto;
        font-size: 13px;
        line-height: 1.55;
        border: 1px solid rgba(255, 255, 255, 0.06);
        box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    .af-gl-stats-box::-webkit-scrollbar { width: 5px; }
    .af-gl-stats-box::-webkit-scrollbar-track { background: transparent; }
    .af-gl-stats-box::-webkit-scrollbar-thumb {
        background: rgba(52, 211, 153, 0.25);
        border-radius: 10px;
    }
    .af-gl-stat-line {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed rgba(255,255,255,0.08);
        padding: 6px 8px;
        margin: 0 -8px;
        border-radius: 7px;
        transition: background 0.2s ease;
    }
    .af-gl-stat-line:hover { background: rgba(255, 255, 255, 0.05); }
    .af-gl-stat-line:last-child { border-bottom: none; }
    .af-gl-stat-line strong { color: #fff; font-variant-numeric: tabular-nums; }

    /* Заголовочный блок результата */
    #markstable > div:first-child strong { letter-spacing: 0.3px; }
</style>
`;

// --- Описание элементов окна ---
var win_Marks = glassStylesMarks + `
<div class="af-gl-container" id="marks_wrapper">
    <div class="marks-gl-header chmaf-drag-handle" id="marks_header">
        <div class="marks-titleblock">
            <div class="marks-icon-chip">📊</div>
            <div>
                <div class="marks-title">Оценки</div>
                <div class="marks-subtitle">Score Statistics</div>
            </div>
        </div>
        <div style="display:flex; gap:6px;">
            <button class="af-gl-btn" id="marksinstr" title="Инструкция по этой форме">❓</button>
            <button class="af-gl-btn buttonHide" title="Скрыть меню" id="hideMeMarks">✕</button>
        </div>
    </div>

    <div class="af-gl-row">
        <span>От</span>
        <input class="af-gl-input" type="date" id="dateFromMarks" style="flex: 1;">
        <span>До</span>
        <input class="af-gl-input" type="date" id="dateToMarks" style="flex: 1;">
    </div>

    <div class="af-gl-row">
        <input class="af-gl-input" id="useridsearch" placeholder="ID (Ученик/Учитель)" title="ID для статистики" autocomplete="off" type="text" style="flex: 1;">
        <button class="af-gl-btn" id="findmarksstat" title="Искать">🔎</button>
        <button class="af-gl-btn" id="clearmarksstat" title="Очистить">🧹</button>
    </div>

    <div class="af-gl-stats-box" id="marks_box">
        <div id="markstable">Готово к поиску. Введите ID и нажмите 🔎</div>
    </div>
</div>`;

// --- Инициализация окна ---
const wintMarks = createWindow('AF_Marks', 'winTopMarks', 'winLeftMarks', win_Marks);
hideWindowOnDoubleClick('AF_Marks');
hideWindowOnClick('AF_Marks', 'hideMeMarks');

// --- Оптимизированная функция получения дат ---
function getDate() {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setMonth(today.getMonth() - 1); // Нативный сдвиг на 1 месяц назад (учитывает февраль и т.д.)

    const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    document.getElementById('dateFromMarks').value = formatDate(fromDate);
    document.getElementById('dateToMarks').value = formatDate(today);
}

// --- Обработчики событий ---
document.getElementById('marksinstr').onclick = function () {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-Score%F0%9F%93%8A%D0%9E%D1%86%D0%B5%D0%BD%D0%BA%D0%B8');
};

document.getElementById('clearmarksstat').onclick = function () {
    document.getElementById('markstable').innerHTML = "Готово к поиску. Введите ID и нажмите 🔎";
    document.getElementById('useridsearch').value = "";
};

// --- Оптимизированный асинхронный поиск ---
async function getUserMarks(option, idfromchat) {
    const searchInput = document.getElementById('useridsearch');
    const marksTable = document.getElementById('markstable');

    let tempval = option === 'menu' ? searchInput.value.trim() : idfromchat;
    if (!tempval) {
        marksTable.innerHTML = "<span style='color: #ffb8b8;'>Укажите ID пользователя!</span>";
        return;
    }

    marksTable.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.65); padding: 10px;">⏳ Загрузка данных...</div>`;

    let from = document.getElementById('dateFromMarks').value;
    let to = document.getElementById('dateToMarks').value;

    let requestBody = JSON.stringify({
        serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
        mode: "Json",
        channelUserFullTextLike: tempval,
        tsFrom: `${from}T00:00:00.000Z`,
        tsTo: `${to}T23:59:59.059Z`,
        orderBy: "ts",
        orderDirection: "Desc",
        page: 1,
        limit: 100
    });

    try {
        // Вызываем вашу функцию
        const result = await doOperationsWithHistory(requestBody);

        // ФИКС ОШИБКИ: Проверяем, нужно ли парсить JSON или он уже готов
        if (result && typeof result.json === 'function') {
            datamarks = await result.json();
        } else {
            datamarks = result; // Значит функция уже вернула объект
        }

        if (!datamarks || !datamarks.items || datamarks.items.length === 0) {
            marksTable.innerHTML = `<div style="color: #ffb8b8;">Пользователь не обращался за выбранный период.</div>`;
            return;
        }

        let counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let clswoutmark = 0;

        datamarks.items.forEach(item => {
            const rateObj = item?.stats?.rate;
            if (rateObj !== undefined) {
                if (rateObj.rate === undefined) {
                    clswoutmark++;
                } else if (rateObj.rate >= 1 && rateObj.rate <= 5) {
                    counts[rateObj.rate]++;
                }
            }
        });

        const markscount = counts[1] + counts[2] + counts[3] + counts[4] + counts[5];
        const total = datamarks.total || 1;
        const autoClosed = total - clswoutmark - markscount;

        const makeLine = (label, count, pctTot) =>
            `<div class="af-gl-stat-line"><span>${label}: <strong>${count}</strong></span> <span>${pctTot}%</span></div>`;
        const getPct = (val, tot) => tot > 0 ? ((val / tot) * 100).toFixed(1) : '0.0';

        marksTable.innerHTML = `
            <div style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.14);">
                <div style="font-size: 16px; margin-bottom:4px;">🕵️‍♀️ <strong>${tempval}</strong></div>
                <div style="color: rgba(255,255,255,0.6); font-size: 12px;">${datamarks.items[0].channelUser?.fullName || 'Имя не найдено'}</div>
            </div>

            ${makeLine('Оценка 1 🤬', counts[1], getPct(counts[1], markscount))}
            ${makeLine('Оценка 2 🤢', counts[2], getPct(counts[2], markscount))}
            ${makeLine('Оценка 3 😐', counts[3], getPct(counts[3], markscount))}
            ${makeLine('Оценка 4 🥴', counts[4], getPct(counts[4], markscount))}
            ${makeLine('Оценка 5 😊', counts[5], getPct(counts[5], markscount))}

            <div style="margin: 12px 0; border-top: 1px solid rgba(255,255,255,0.14);"></div>

            <div class="af-gl-stat-line" style="color: #86efac;"><span>Всего оценок:</span> <strong>${markscount}</strong></div>
            <div class="af-gl-stat-line" style="color: #93c5fd;"><span>Обращений с ${from}:</span> <strong>${datamarks.total}</strong></div>

            <div style="margin: 12px 0; border-top: 1px solid rgba(255,255,255,0.14);"></div>

            ${makeLine('Оценки к обращениям', '', getPct(markscount, total))}
            ${makeLine('Закрыто без оценок', clswoutmark, getPct(clswoutmark, total))}
            ${makeLine('Автозакрытие', autoClosed, getPct(autoClosed, total))}
        `;
    } catch (error) {
        marksTable.innerHTML = `<div style="color: #ffb8b8;">❌ Ошибка загрузки: ${error.message}</div>`;
        console.error("Fetch error:", error);
    }
}

// --- Управление отображением меню ---
function getbutMarksButtonPress() {
    const afMarks = document.getElementById('AF_Marks');
    const myMenu = document.getElementById('idmymenu');
    const mainMenuBtn = document.getElementById('MainMenuBtn');

    if (afMarks.style.display === '') {
        afMarks.style.display = 'none';
        if (myMenu) myMenu.style.display = 'none';
        if (mainMenuBtn) mainMenuBtn.classList.remove('activeScriptBtn');
    } else {
        afMarks.style.display = '';
        if (myMenu) myMenu.style.display = 'none';
        if (mainMenuBtn) mainMenuBtn.classList.remove('activeScriptBtn');

        getDate();
        document.getElementById('findmarksstat').onclick = function () {
            getUserMarks('menu');
        };
    }
}

// --- Внешний вызов статистики ---
async function marksstata(idfromchat) {
    const afMarks = document.getElementById('AF_Marks');
    if (afMarks.style.display === 'none') {
        afMarks.style.display = '';
    }
    getDate();
    await getUserMarks('userdetailsbar', idfromchat);
}
