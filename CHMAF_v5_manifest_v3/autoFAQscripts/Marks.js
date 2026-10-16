// Окно статистики оценок.
// Использует существующие функции проекта:
// createWindow, hideWindowOnDoubleClick, hideWindowOnClick,
// doOperationsWithHistory.

const marksStyles = `
<style>
    /* Оформление как у окна Userinfo (#af-glass-styles, «corporate graphite») */
    #AF_Marks {
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
    }

    #marks_wrapper,
    #marks_wrapper * {
        box-sizing: border-box;
    }

    #marks_wrapper {
        width: min(420px, calc(100vw - 20px));
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;

        color: #f8fafc;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        letter-spacing: 0.01em;
        text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
        -webkit-font-smoothing: antialiased;

        background:
            radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
            #111827;
        border: 1px solid #344258;
        border-radius: 18px;
        box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
    }

    #marks_wrapper button,
    #marks_wrapper input {
        font: inherit;
    }

    /* Шапка */

    #marks_wrapper .afm-header {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(66, 104, 201, .15);
        cursor: grab;
    }

    #marks_wrapper .afm-header::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        width: 40%;
        height: 1px;
        background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
    }

    #marks_wrapper .afm-header:active {
        cursor: grabbing;
    }

    #marks_wrapper .afm-title {
        flex: 1;
        min-width: 0;
        margin: 0;
        overflow: hidden;
        color: #fefefe;
        font-size: 15px;
        font-weight: 700;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    /* Кнопки */

    #marks_wrapper .afm-btn {
        flex: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;

        min-width: 34px;
        height: 34px;
        padding: 0;

        color: #dce5f5;
        font-size: 16px;
        background: #1b283c;
        border: 1px solid #3c4d68;
        border-radius: 9px;
        cursor: pointer;

        transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    }

    #marks_wrapper .afm-btn:hover {
        color: #fff;
        background: #293b56;
        border-color: #7799e2;
        transform: translateY(-1px);
    }

    #marks_wrapper .afm-btn:active {
        transform: translateY(0) scale(.98);
    }

    #marks_wrapper .afm-btn--close {
        color: #ffb0be;
        background: rgba(255, 116, 140, .08);
        border-color: rgba(255, 116, 140, .3);
    }

    #marks_wrapper .afm-btn--close:hover {
        background: rgba(255, 116, 140, .16);
        border-color: rgba(255, 116, 140, .55);
    }

    #marks_wrapper .afm-btn:focus-visible {
        outline: 2px solid #9ab5ff;
        outline-offset: 2px;
    }

    /* Даты и поиск */

    #marks_wrapper .afm-filters {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 10px;
    }

    #marks_wrapper .afm-field {
        display: flex;
        flex-direction: column;
        min-width: 0;
        gap: 6px;
    }

    #marks_wrapper .afm-label,
    #marks_wrapper .afm-section-label {
        color: #94a3b8;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
    }

    #marks_wrapper .afm-section-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #fefefe;
        font-size: 12px;
        letter-spacing: .06em;
    }

    #marks_wrapper .afm-section-label::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, rgba(66, 104, 201, .4), transparent);
    }

    #marks_wrapper .afm-input {
        width: 100%;
        min-width: 0;
        height: 34px;
        padding: 0 12px;

        color: #edf2fb;
        color-scheme: dark;
        background: #0d1625;
        border: 1px solid #3a4961;
        border-radius: 9px;
        outline: none;

        font-size: 14px;
        font-weight: 600;

        transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
    }

    #marks_wrapper .afm-input::placeholder {
        color: #7d8ca6;
        opacity: 1;
        font-weight: 500;
    }

    #marks_wrapper .afm-input:focus {
        background: #142034;
        border-color: #829fff;
        box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
    }

    #marks_wrapper .afm-search {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    #marks_wrapper .afm-search .afm-input {
        flex: 1;
        text-align: center;
    }

    /* Панель результата */

    #marks_wrapper .afm-panel {
        min-height: 88px;
        max-height: min(510px, 55vh);
        max-height: min(510px, 55dvh);
        padding: 14px;

        overflow-y: auto;
        overscroll-behavior: contain;

        background: linear-gradient(145deg, rgba(255, 255, 255, .04), rgba(255, 255, 255, .01));
        border: 1px solid rgba(66, 104, 201, .15);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, .2), inset 0 1px 0 rgba(255, 255, 255, .05);

        scrollbar-width: thin;
        scrollbar-color: rgba(66, 104, 201, .4) transparent;
    }

    #marks_wrapper .afm-panel::-webkit-scrollbar { width: 4px; }
    #marks_wrapper .afm-panel::-webkit-scrollbar-track { background: transparent; }
    #marks_wrapper .afm-panel::-webkit-scrollbar-thumb { background: rgba(66, 104, 201, .3); border-radius: 8px; }
    #marks_wrapper .afm-panel::-webkit-scrollbar-thumb:hover { background: rgba(66, 104, 201, .6); }

    #marks_wrapper .afm-message {
        padding: 10px 2px;
        color: #94a3b8;
        font-size: 14px;
        text-align: center;
    }

    #marks_wrapper .afm-message--error {
        color: #fca5a5;
    }

    /* Пользователь */

    #marks_wrapper .afm-person {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
        margin-bottom: 14px;
    }

    #marks_wrapper .afm-avatar {
        flex: none;
        display: grid;
        place-items: center;
        width: 44px;
        height: 44px;

        color: #a9c0ff;
        font-size: 17px;
        font-weight: 800;

        background: rgba(66, 104, 201, .12);
        border: 2px solid rgba(66, 104, 201, .5);
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, .4);
    }

    #marks_wrapper .afm-person-info {
        min-width: 0;
    }

    #marks_wrapper .afm-person-name {
        overflow-wrap: anywhere;
        color: #fefefe;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.3;
    }

    #marks_wrapper .afm-person-id {
        margin-top: 2px;
        overflow-wrap: anywhere;
        color: #94a3b8;
        font-family: 'JetBrains Mono', monospace;
        font-size: 12px;
        font-weight: 500;
    }

    /* Главный показатель */

    #marks_wrapper .afm-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        padding: 14px;
        margin-bottom: 16px;

        background: #1a2536;
        border: 1px solid #344258;
        border-left: 3px solid #92afff;
        border-radius: 10px;
    }

    #marks_wrapper .afm-hero-caption {
        display: block;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
    }

    #marks_wrapper .afm-hero-number {
        display: block;
        margin-top: 6px;
        color: #fff;
        font-size: 30px;
        font-weight: 800;
        line-height: 1;
        font-variant-numeric: tabular-nums;
    }

    #marks_wrapper .afm-hero-side {
        text-align: right;
    }

    #marks_wrapper .afm-hero-percent {
        display: block;
        margin-bottom: 4px;
        color: #a9c0ff;
        font-family: 'JetBrains Mono', monospace;
        font-size: 19px;
        font-weight: 700;
    }

    /* Карточки оценок */

    #marks_wrapper .afm-ratings {
        display: grid;
        gap: 8px;
        margin-top: 10px;
    }

    #marks_wrapper .afm-rating {
        --rating-color: #a9c0ff;

        padding: 10px 12px;
        background: #1a2536;
        border: 1px solid #344258;
        border-left: 3px solid var(--rating-color);
        border-radius: 10px;
        transition: background-color .16s ease, border-color .16s ease;
    }

    #marks_wrapper .afm-rating:hover {
        background: #23334b;
    }

    /* Статусные цвета как в Userinfo: зелёный — хорошо, красный — плохо */
    #marks_wrapper .afm-rating--5 { --rating-color: #86efac; }
    #marks_wrapper .afm-rating--4 { --rating-color: #7dd3fc; }
    #marks_wrapper .afm-rating--3 { --rating-color: #a9c0ff; }
    #marks_wrapper .afm-rating--2 { --rating-color: #fdba74; }
    #marks_wrapper .afm-rating--1 { --rating-color: #fca5a5; }

    #marks_wrapper .afm-rating-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    #marks_wrapper .afm-rating-identity {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
    }

    #marks_wrapper .afm-rating-badge {
        flex: none;
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;

        color: var(--rating-color);
        background: rgba(0, 0, 0, .3);
        border: 1px solid rgba(66, 104, 201, .25);
        border-radius: 8px;

        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        font-weight: 700;
    }

    #marks_wrapper .afm-rating-name {
        display: block;
        color: #f1f5f9;
        font-size: 13px;
        font-weight: 600;
    }

    #marks_wrapper .afm-rating-stars {
        display: block;
        margin-top: 1px;
        color: var(--rating-color);
        font-size: 10px;
        letter-spacing: 1px;
        white-space: nowrap;
    }

    #marks_wrapper .afm-rating-values {
        flex: none;
        text-align: right;
        font-variant-numeric: tabular-nums;
    }

    #marks_wrapper .afm-rating-count {
        display: block;
        color: #f1f5f9;
        font-size: 15px;
        font-weight: 800;
    }

    #marks_wrapper .afm-rating-percent {
        display: block;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 600;
    }

    #marks_wrapper .afm-track {
        height: 5px;
        margin-top: 9px;
        overflow: hidden;
        background: rgba(0, 0, 0, .35);
        border-radius: 10px;
    }

    #marks_wrapper .afm-fill {
        height: 100%;
        background: var(--rating-color);
        border-radius: inherit;
        transition: width .3s ease;
    }

    /* Нижние метрики */

    #marks_wrapper .afm-summary-title {
        margin-top: 16px;
        margin-bottom: 10px;
    }

    #marks_wrapper .afm-summary {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }

    #marks_wrapper .afm-metric {
        min-width: 0;
        padding: 10px 12px;
        background: rgba(0, 0, 0, .25);
        border: 1px solid rgba(66, 104, 201, .1);
        border-radius: 10px;
        transition: background-color .25s ease, border-color .25s ease;
    }

    #marks_wrapper .afm-metric:hover {
        background: rgba(0, 0, 0, .35);
        border-color: rgba(66, 104, 201, .25);
    }

    #marks_wrapper .afm-metric-value {
        display: block;
        color: #f1f5f9;
        font-size: 17px;
        font-weight: 800;
        line-height: 1.2;
        font-variant-numeric: tabular-nums;
    }

    #marks_wrapper .afm-metric-label {
        display: block;
        margin-top: 4px;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.35;
    }

    #marks_wrapper .afm-note {
        margin-top: 12px;
        color: #94a3b8;
        font-size: 12px;
        line-height: 1.5;
    }

    @media (prefers-reduced-motion: reduce) {
        #marks_wrapper *,
        #marks_wrapper *::before,
        #marks_wrapper *::after {
            transition: none !important;
        }
    }
</style>`;

const win_Marks = marksStyles + `
<div id="marks_wrapper">
    <div class="afm-header chmaf-drag-handle" id="marks_header">
        <button class="afm-btn afm-btn--close buttonHide" id="hideMeMarks" type="button"
                title="Скрыть" aria-label="Закрыть окно">❌</button>
        <h2 class="afm-title">📊 Статистика оценок</h2>
        <button class="afm-btn" id="marksinstr" type="button"
                title="Инструкция" aria-label="Открыть инструкцию">📖</button>
    </div>

    <div class="afm-filters">
        <label class="afm-field">
            <span class="afm-label">Период с</span>
            <input class="afm-input" type="date" id="dateFromMarks">
        </label>
        <label class="afm-field">
            <span class="afm-label">По</span>
            <input class="afm-input" type="date" id="dateToMarks">
        </label>
    </div>

    <div class="afm-search">
        <input class="afm-input" id="useridsearch" type="text"
               placeholder="ID ученика или учителя"
               aria-label="ID ученика или учителя"
               autocomplete="off">
        <button class="afm-btn" id="findmarksstat"
                type="button" title="Найти" aria-label="Найти оценки">🚀</button>
        <button class="afm-btn" id="clearmarksstat"
                type="button" title="Очистить" aria-label="Очистить поиск">🧹</button>
    </div>

    <div class="afm-panel" id="marks_box">
        <div id="markstable" aria-live="polite" aria-atomic="true"></div>
    </div>
</div>`;

createWindow("AF_Marks", "winTopMarks", "winLeftMarks", win_Marks);
hideWindowOnDoubleClick("AF_Marks");
hideWindowOnClick("AF_Marks", "hideMeMarks");

const marksElements = {
    window: document.getElementById("AF_Marks"),
    from: document.getElementById("dateFromMarks"),
    to: document.getElementById("dateToMarks"),
    input: document.getElementById("useridsearch"),
    table: document.getElementById("markstable")
};

let marksRequestVersion = 0;

function marksFormatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// Месяц назад с ограничением дня: 31 марта → 28/29 февраля,
// а не переход в март из-за переполнения дня.
function marksOneMonthAgo(today) {
    const result = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDay = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0
    ).getDate();

    result.setDate(Math.min(today.getDate(), lastDay));
    return result;
}

// Заполняем только пустые поля — выбранный пользователем период не сбрасывается.
function getDate() {
    const today = new Date();

    if (!marksElements.from.value) {
        marksElements.from.value = marksFormatDate(marksOneMonthAgo(today));
    }

    if (!marksElements.to.value) {
        marksElements.to.value = marksFormatDate(today);
    }
}

function marksShowMessage(message, isError = false) {
    const element = document.createElement("div");
    element.className = `afm-message${isError ? " afm-message--error" : ""}`;
    element.textContent = message;
    marksElements.table.replaceChildren(element);
}

function marksAddText(parent, tag, className, value) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = String(value);
    parent.appendChild(element);
    return element;
}

function marksAddSummaryRow(parent, label, value, accent = false) {
    const row = document.createElement("div");
    row.className = `afm-summary-row${accent ? " afm-summary-row--accent" : ""}`;

    marksAddText(row, "span", "", label);
    marksAddText(row, "strong", "", value);

    parent.appendChild(row);
}

function marksPercent(value, total) {
    return total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";
}

function marksRenderResult({ id, name, items, reportedTotal, complete }) {
    const counts = [0, 0, 0, 0, 0, 0];

    let closedWithoutRating = 0;
    let withoutRatingData = 0;
    let other = 0;

    for (const item of items) {
        const rateObject = item?.stats?.rate;

        if (rateObject == null) {
            withoutRatingData++;
            continue;
        }

        if (rateObject.rate == null) {
            closedWithoutRating++;
            continue;
        }

        const rating = Number(rateObject.rate);

        if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
            counts[rating]++;
        } else {
            other++;
        }
    }

    const rated = counts.slice(1).reduce((sum, count) => sum + count, 0);
    const loaded = items.length;

    // Проценты считаем по реально загруженным обращениям; если загрузились
    // не все страницы, ниже выводится пояснение «Показаны N из M».
    const denominator = loaded;

    const root = document.createDocumentFragment();

    const person = document.createElement("div");
    person.className = "afm-person";

    const avatar = document.createElement("div");
    avatar.className = "afm-avatar";
    avatar.textContent = (name || String(id)).trim().charAt(0).toUpperCase() || "•";

    const personInfo = document.createElement("div");
    personInfo.className = "afm-person-info";

    marksAddText(
        personInfo,
        "div",
        "afm-person-name",
        name || "Пользователь"
    );

    marksAddText(
        personInfo,
        "div",
        "afm-person-id",
        `ID ${id}`
    );

    person.append(avatar, personInfo);
    root.appendChild(person);

    const hero = document.createElement("div");
    hero.className = "afm-hero";

    const heroMain = document.createElement("div");
    marksAddText(heroMain, "span", "afm-hero-caption", "Всего оценок");
    marksAddText(heroMain, "strong", "afm-hero-number", rated);

    const heroSide = document.createElement("div");
    heroSide.className = "afm-hero-side";

    marksAddText(
        heroSide,
        "strong",
        "afm-hero-percent",
        marksPercent(rated, denominator)
    );

    marksAddText(
        heroSide,
        "span",
        "afm-hero-caption",
        "от обращений"
    );

    hero.append(heroMain, heroSide);
    root.appendChild(hero);

    marksAddText(
        root,
        "div",
        "afm-section-label",
        "Распределение оценок"
    );

    const ratings = document.createElement("div");
    ratings.className = "afm-ratings";

    const ratingNames = {
        5: "Отлично",
        4: "Хорошо",
        3: "Нейтрально",
        2: "Низко",
        1: "Очень низко"
    };

    for (let rating = 5; rating >= 1; rating--) {
        const card = document.createElement("div");
        card.className = `afm-rating afm-rating--${rating}`;

        const top = document.createElement("div");
        top.className = "afm-rating-top";

        const identity = document.createElement("div");
        identity.className = "afm-rating-identity";

        marksAddText(
            identity,
            "div",
            "afm-rating-badge",
            rating
        );

        const label = document.createElement("div");

        marksAddText(
            label,
            "span",
            "afm-rating-name",
            ratingNames[rating]
        );

        marksAddText(
            label,
            "span",
            "afm-rating-stars",
            "★".repeat(rating)
        );

        identity.appendChild(label);

        const values = document.createElement("div");
        values.className = "afm-rating-values";

        marksAddText(
            values,
            "strong",
            "afm-rating-count",
            counts[rating]
        );

        marksAddText(
            values,
            "span",
            "afm-rating-percent",
            marksPercent(counts[rating], rated)
        );

        top.append(identity, values);

        const track = document.createElement("div");
        track.className = "afm-track";

        const fill = document.createElement("div");
        fill.className = "afm-fill";
        fill.style.width = marksPercent(counts[rating], rated);

        track.appendChild(fill);
        card.append(top, track);
        ratings.appendChild(card);
    }

    root.appendChild(ratings);

    marksAddText(
        root,
        "div",
        "afm-section-label afm-summary-title",
        "По обращениям"
    );

    const summary = document.createElement("div");
    summary.className = "afm-summary";

    function addMetric(value, label) {
        const metric = document.createElement("div");
        metric.className = "afm-metric";

        marksAddText(metric, "strong", "afm-metric-value", value);
        marksAddText(metric, "span", "afm-metric-label", label);

        summary.appendChild(metric);
    }

    addMetric(
        loaded,
        complete ? "Всего обращений" : "Загружено обращений"
    );

    addMetric(
        `${closedWithoutRating} · ${marksPercent(closedWithoutRating, denominator)}`,
        "Закрыто без оценки"
    );

    addMetric(
        `${withoutRatingData} · ${marksPercent(withoutRatingData, denominator)}`,
        "Без данных об оценке"
    );

    addMetric(
        marksPercent(rated, denominator),
        "Доля обращений с оценкой"
    );

    if (other > 0) {
        addMetric(other, "Другой формат оценки");
    }

    root.appendChild(summary);

    if (!complete) {
        marksAddText(
            root,
            "div",
            "afm-note",
            `Показаны ${loaded} из ${reportedTotal} обращений. ` +
            "Проценты рассчитаны по загруженным данным."
        );
    }

    marksElements.table.replaceChildren(root);
}
async function marksLoadPage(request) {
    const response = await doOperationsWithHistory(JSON.stringify(request));

    if (response && typeof response.json === "function") {
        if (response.ok === false) {
            throw new Error(`Сервер вернул HTTP ${response.status}`);
        }
        return response.json();
    }

    return response;
}

async function getUserMarks(option, idfromchat) {
    const version = ++marksRequestVersion;
    const id = String(
        option === "menu" ? marksElements.input.value : (idfromchat ?? "")
    ).trim();

    if (!id) {
        marksShowMessage("Укажите ID ученика или учителя.", true);
        return;
    }

    const from = marksElements.from.value;
    const to = marksElements.to.value;

    if (!from || !to) {
        marksShowMessage("Укажите обе даты периода.", true);
        return;
    }

    if (from > to) {
        marksShowMessage("Начало периода не может быть позже его окончания.", true);
        return;
    }

    marksShowMessage("Загружаем обращения…");

    const PAGE_SIZE = 100;
    const MAX_PAGES = 50; // Защита от бесконечной или чрезмерной загрузки.

    const baseRequest = {
        serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
        mode: "Json",
        channelUserFullTextLike: id,
        // Границы дня по локальному времени оператора, а не по UTC:
        // иначе для МСК период сдвигается на 3 часа (с 03:00 до 02:59).
        tsFrom: new Date(`${from}T00:00:00`).toISOString(),
        tsTo: new Date(`${to}T23:59:59.999`).toISOString(),
        orderBy: "ts",
        orderDirection: "Desc",
        limit: PAGE_SIZE
    };

    try {
        const items = [];
        let reportedTotal = null;
        let complete = false;

        for (let page = 1; page <= MAX_PAGES; page++) {
            const data = await marksLoadPage({ ...baseRequest, page });

            // Старый запрос больше не должен менять интерфейс.
            if (version !== marksRequestVersion) return;

            if (!data || !Array.isArray(data.items)) {
                throw new Error("Некорректный формат ответа сервера");
            }

            if (page === 1) {
                const total = Number(data.total);
                reportedTotal = Number.isFinite(total) && total >= 0
                    ? total
                    : null;
            }

            items.push(...data.items);

            if (data.items.length === 0) {
                complete = true;
                break;
            }

            if (reportedTotal !== null && items.length >= reportedTotal) {
                complete = true;
                break;
            }

            if (data.items.length < PAGE_SIZE) {
                // Следующая страница отсутствует, даже если total не передан.
                complete = reportedTotal === null ||
                    items.length >= reportedTotal;
                break;
            }

            if (page < MAX_PAGES) {
                marksShowMessage(`Загружено обращений: ${items.length}…`);
            }
        }

        if (version !== marksRequestVersion) return;

        if (items.length === 0) {
            marksShowMessage("За выбранный период обращения не найдены.");
            return;
        }

        marksRenderResult({
            id,
            name: items[0]?.channelUser?.fullName,
            items,
            reportedTotal: reportedTotal ?? items.length,
            complete
        });
    } catch (error) {
        if (version !== marksRequestVersion) return;

        console.error("Ошибка загрузки оценок:", error);
        marksShowMessage(
            `Не удалось загрузить статистику: ${error?.message || "неизвестная ошибка"}`,
            true
        );
    }
}

document.getElementById("marksinstr").addEventListener("click", () => {
    window.open(
        "https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-Score%F0%9F%93%8A%D0%9E%D1%86%D0%B5%D0%BD%D0%BA%D0%B8",
        "_blank",
        "noopener,noreferrer"
    );
});

document.getElementById("findmarksstat").addEventListener("click", () => {
    getUserMarks("menu");
});

marksElements.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") getUserMarks("menu");
});

document.getElementById("clearmarksstat").addEventListener("click", () => {
    marksRequestVersion++;
    marksElements.input.value = "";
    marksShowMessage("Введите ID и нажмите кнопку поиска.");
    marksElements.input.focus();
});

function getbutMarksButtonPress() {
    const isHidden = getComputedStyle(marksElements.window).display === "none";
    marksElements.window.style.display = isHidden ? "" : "none";

    const menu = document.getElementById("idmymenu");
    const mainMenuButton = document.getElementById("MainMenuBtn");

    if (menu) menu.style.display = "none";
    if (mainMenuButton) {
        mainMenuButton.classList.remove("activeScriptBtn");
    }

    if (isHidden) getDate();
}

async function marksstata(idfromchat) {
    marksElements.window.style.display = "";
    marksElements.input.value = String(idfromchat ?? "");
    getDate();
    await getUserMarks("userdetailsbar", idfromchat);
}

getDate();
marksShowMessage("Введите ID и нажмите кнопку поиска.");