// Окно статистики оценок.
// Использует существующие функции проекта:
// createWindow, hideWindowOnDoubleClick, hideWindowOnClick,
// doOperationsWithHistory.

const marksStyles = `
<style>
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
        --afm-text: #eef2fa;
        --afm-muted: #9da9bd;
        --afm-line: #3a4559;

        width: min(390px, calc(100vw - 20px));
        padding: 17px;
        display: flex;
        flex-direction: column;
        gap: 16px;

        color: var(--afm-text);
        font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

        background:
            radial-gradient(
                circle at 100% 0%,
                rgba(82, 99, 192, .13),
                transparent 44%
            ),
            linear-gradient(155deg, #282e3b 0%, #202633 72%, #1c222d 100%);

        border: 1px solid #495468;
        border-top-color: #647086;
        border-radius: 16px;

        box-shadow:
            0 26px 65px rgba(0, 0, 0, .46),
            0 5px 16px rgba(0, 0, 0, .18),
            inset 0 1px rgba(255, 255, 255, .07);
    }

    #marks_wrapper button,
    #marks_wrapper input {
        font: inherit;
    }

    /* Шапка */

    #marks_wrapper .afm-header,
    #marks_wrapper .afm-brand,
    #marks_wrapper .afm-actions,
    #marks_wrapper .afm-search {
        display: flex;
        align-items: center;
    }

    #marks_wrapper .afm-header {
        justify-content: space-between;
        gap: 10px;
        cursor: grab;
    }

    #marks_wrapper .afm-header:active {
        cursor: grabbing;
    }

    #marks_wrapper .afm-brand {
        min-width: 0;
        gap: 11px;
    }

    #marks_wrapper .afm-icon {
        flex: none;
        display: grid;
        place-items: center;

        width: 39px;
        height: 39px;

        color: #dce5ff;
        font-size: 19px;

        background: linear-gradient(145deg, #394a77, #30365e);
        border: 1px solid #6678ad;
        border-radius: 10px;

        box-shadow:
            inset 0 1px rgba(255, 255, 255, .13),
            0 5px 12px rgba(0, 0, 0, .18);
    }

    #marks_wrapper .afm-title {
        margin: 0;
        color: #f2f5fb;
        font-size: 14px;
        font-weight: 750;
        letter-spacing: -.025em;
    }

    #marks_wrapper .afm-subtitle {
        margin-top: 4px;
        color: #9ba8bf;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: .14em;
        text-transform: uppercase;
    }

    #marks_wrapper .afm-actions {
        flex: none;
        gap: 6px;
    }

    /* Кнопки */

    #marks_wrapper .afm-btn {
        flex: none;
        display: grid;
        place-items: center;

        min-width: 35px;
        height: 35px;
        padding: 0 10px;

        color: #c2cadb;
        background: #303848;
        border: 1px solid #465167;
        border-radius: 9px;

        cursor: pointer;

        transition:
            background .18s ease,
            border-color .18s ease,
            transform .18s ease;
    }

    #marks_wrapper .afm-btn:hover {
        background: #3b465b;
        border-color: #7584a3;
        transform: translateY(-1px);
    }

    #marks_wrapper .afm-btn:active {
        transform: translateY(0);
    }

    #marks_wrapper #hideMeMarks:hover {
        color: #ffb7c1;
        background: #503643;
        border-color: #89576b;
    }

    #marks_wrapper .afm-btn--primary {
        color: #fff;
        font-size: 21px;
        font-weight: 700;

        background: linear-gradient(135deg, #348ff0, #5868dc);
        border-color: #679fff;

        box-shadow: 0 5px 14px rgba(42, 107, 222, .2);
    }

    #marks_wrapper .afm-btn--primary:hover {
        background: linear-gradient(135deg, #52a7ff, #717df0);
        border-color: #9bc3ff;
    }

    #marks_wrapper .afm-btn:focus-visible {
        outline: 2px solid #86b8ff;
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
        gap: 7px;
    }

    #marks_wrapper .afm-label,
    #marks_wrapper .afm-section-label {
        color: #9eabc0;
        font-size: 10px;
        font-weight: 750;
        letter-spacing: .1em;
        text-transform: uppercase;
    }

    #marks_wrapper .afm-input {
        width: 100%;
        min-width: 0;
        height: 39px;
        padding: 0 11px;

        color: #edf2fa;
        color-scheme: dark;
        background: #1a212d;
        border: 1px solid #414e63;
        border-radius: 9px;
        outline: none;

        font-size: 12px;
        font-weight: 550;

        transition:
            border-color .18s ease,
            box-shadow .18s ease;
    }

    #marks_wrapper .afm-input::placeholder {
        color: #8795aa;
        opacity: 1;
        font-weight: 400;
    }

    #marks_wrapper .afm-input:hover {
        border-color: #61718d;
    }

    #marks_wrapper .afm-input:focus {
        border-color: #67aaff;
        box-shadow: 0 0 0 3px rgba(54, 143, 240, .15);
    }

    #marks_wrapper .afm-search {
        gap: 7px;
    }

    #marks_wrapper .afm-search .afm-input {
        flex: 1;
    }

    /* Панель результата */

    #marks_wrapper .afm-panel {
        min-height: 88px;
        max-height: min(510px, 55vh);
        max-height: min(510px, 55dvh);
        padding: 13px;

        overflow-y: auto;
        overscroll-behavior: contain;

        background: #1a202b;
        border: 1px solid #394458;
        border-radius: 12px;

        box-shadow: inset 0 2px 8px rgba(0, 0, 0, .15);

        scrollbar-width: thin;
        scrollbar-color: #566685 transparent;
    }

    #marks_wrapper .afm-panel::-webkit-scrollbar {
        width: 6px;
    }

    #marks_wrapper .afm-panel::-webkit-scrollbar-track {
        background: transparent;
    }

    #marks_wrapper .afm-panel::-webkit-scrollbar-thumb {
        background: #566685;
        border-radius: 10px;
    }

    #marks_wrapper .afm-message {
        padding: 10px 2px;
        color: #a6b2c5;
        font-size: 12px;
        line-height: 1.55;
    }

    #marks_wrapper .afm-message--error {
        color: #ffacb7;
    }

    /* Пользователь */

    #marks_wrapper .afm-person {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        margin-bottom: 13px;
    }

    #marks_wrapper .afm-avatar {
        flex: none;
        display: grid;
        place-items: center;

        width: 36px;
        height: 36px;

        color: #d8e5ff;
        font-size: 15px;
        font-weight: 800;

        background: #303e65;
        border: 1px solid #526ca4;
        border-radius: 9px;
    }

    #marks_wrapper .afm-person-info {
        min-width: 0;
    }

    #marks_wrapper .afm-person-name {
        overflow-wrap: anywhere;
        color: #f1f4fa;
        font-size: 12px;
        font-weight: 750;
        line-height: 1.35;
    }

    #marks_wrapper .afm-person-id {
        margin-top: 3px;
        overflow-wrap: anywhere;
        color: #9daac0;
        font-size: 10px;
        font-weight: 600;
    }

    /* Главный показатель */

    #marks_wrapper .afm-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;

        padding: 15px;
        margin-bottom: 18px;

        background:
            radial-gradient(
                circle at 100% 0%,
                rgba(128, 121, 255, .25),
                transparent 55%
            ),
            linear-gradient(115deg, #254a83, #343d80 65%, #484080);

        border: 1px solid #6478ba;
        border-left: 3px solid #7dbbff;
        border-radius: 10px;

        box-shadow:
            inset 0 1px rgba(255, 255, 255, .11),
            0 8px 18px rgba(11, 22, 55, .22);
    }

    #marks_wrapper .afm-hero-caption {
        display: block;
        color: #d0ddf5;
        font-size: 10px;
        font-weight: 600;
    }

    #marks_wrapper .afm-hero-number {
        display: block;
        margin-top: 5px;

        color: #fff;
        font-size: 29px;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -.05em;
        font-variant-numeric: tabular-nums;
    }

    #marks_wrapper .afm-hero-side {
        text-align: right;
    }

    #marks_wrapper .afm-hero-percent {
        display: block;
        margin-bottom: 4px;

        color: #d9e9ff;
        font-size: 19px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
    }

    /* Карточки оценок */

    #marks_wrapper .afm-ratings {
        display: grid;
        gap: 8px;
        margin-top: 11px;
    }

    #marks_wrapper .afm-rating {
        --rating-color: #8ba9e6;
        --rating-bg: #303b59;
        --rating-border: #52648e;

        padding: 10px 11px;

        background: linear-gradient(145deg, #293242, #242c3a);
        border: 1px solid #3c485d;
        border-radius: 10px;

        box-shadow: inset 0 1px rgba(255, 255, 255, .045);
    }

    /* Холодная шкала сверху, тёплая — только для низких оценок */
    #marks_wrapper .afm-rating--5 {
        --rating-color: #64b5ff;
        --rating-bg: #253e60;
        --rating-border: #426da0;
    }

    #marks_wrapper .afm-rating--4 {
        --rating-color: #8b9cff;
        --rating-bg: #32385f;
        --rating-border: #5d68a4;
    }

    #marks_wrapper .afm-rating--3 {
        --rating-color: #b69af2;
        --rating-bg: #403456;
        --rating-border: #725a98;
    }

    #marks_wrapper .afm-rating--2 {
        --rating-color: #eba77f;
        --rating-bg: #4a3740;
        --rating-border: #805963;
    }

    #marks_wrapper .afm-rating--1 {
        --rating-color: #f1829b;
        --rating-bg: #4d3142;
        --rating-border: #875267;
    }

    #marks_wrapper .afm-rating-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    #marks_wrapper .afm-rating-identity {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
    }

    #marks_wrapper .afm-rating-badge {
        flex: none;
        display: grid;
        place-items: center;

        width: 29px;
        height: 29px;

        color: var(--rating-color);
        background: var(--rating-bg);
        border: 1px solid var(--rating-border);
        border-radius: 8px;

        font-size: 13px;
        font-weight: 800;
    }

    #marks_wrapper .afm-rating-name {
        display: block;
        color: #e9eef8;
        font-size: 11px;
        font-weight: 700;
    }

    #marks_wrapper .afm-rating-stars {
        display: block;
        margin-top: 2px;

        color: var(--rating-color);
        font-size: 9px;
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
        color: #f3f5fb;
        font-size: 13px;
        font-weight: 800;
    }

    #marks_wrapper .afm-rating-percent {
        display: block;
        margin-top: 2px;
        color: #a6b1c5;
        font-size: 10px;
        font-weight: 600;
    }

    #marks_wrapper .afm-track {
        height: 5px;
        margin-top: 10px;
        overflow: hidden;

        background: #19212e;
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
        margin-top: 18px;
        margin-bottom: 10px;
    }

    #marks_wrapper .afm-summary {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
    }

    #marks_wrapper .afm-metric {
        min-width: 0;
        min-height: 71px;
        padding: 11px;

        background: #293242;
        border: 1px solid #404d63;
        border-radius: 9px;
    }

    #marks_wrapper .afm-metric-value {
        display: block;
        color: #eef2fb;
        font-size: 16px;
        font-weight: 800;
        line-height: 1.15;
        font-variant-numeric: tabular-nums;
    }

    #marks_wrapper .afm-metric-label {
        display: block;
        margin-top: 7px;
        color: #a8b4c7;
        font-size: 10px;
        font-weight: 550;
        line-height: 1.35;
    }

    #marks_wrapper .afm-note {
        margin-top: 12px;
        color: #a7b2c5;
        font-size: 10px;
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
        <div class="afm-brand">
            <div class="afm-icon" aria-hidden="true">✦</div>
            <div>
                <h2 class="afm-title">Статистика оценок</h2>
                <div class="afm-subtitle">Score analytics</div>
            </div>
        </div>

        <div class="afm-actions">
            <button class="afm-btn" id="marksinstr" type="button"
                    title="Инструкция" aria-label="Открыть инструкцию">?</button>
            <button class="afm-btn buttonHide" id="hideMeMarks" type="button"
                    title="Закрыть" aria-label="Закрыть окно">×</button>
        </div>
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
        <button class="afm-btn afm-btn--primary" id="findmarksstat"
                type="button" title="Найти" aria-label="Найти оценки">⌕</button>
        <button class="afm-btn" id="clearmarksstat"
                type="button" title="Очистить" aria-label="Очистить поиск">↺</button>
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

    // Если не все страницы загрузились, не выдаём проценты
    // от загруженных записей за проценты от всей истории.
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
        tsFrom: `${from}T00:00:00.000Z`,
        tsTo: `${to}T23:59:59.999Z`,
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