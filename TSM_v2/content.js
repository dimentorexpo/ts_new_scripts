/* =========================================================
   TSM Content Script — общие утилиты для всех модулей
   ========================================================= */

const MESSENGER_WEB_LINK = "https://mm-time.skyeng.tech/skyeng/pl/";
const SERVICE_HOSTS = ["skyeng.autofaq.ai", "crm2.skyeng.ru"];
const TSM_TOAST_TTL = 3500;
const TSM_TOAST_LIMIT = 4;

let token;
let lastChatIdF = null;

/* ---------- Общие утилиты ---------- */

function escapeHTML(str) {
    if (str == null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ---------- Иконки ---------- */

/* Цветной двухтоновый SVG-набор (24×24). У каждой иконки своя тема: основной цвет
   обводки и заливки + светлый акцент. Цвета вшиты в сам SVG (атрибутами), поэтому
   иконки одинаково выглядят в окнах TSM, тостах, диалогах и отдельных вкладках.
   Эмодзи остаются только в нативном контекстном меню Chrome — оно рисует лишь текст.
   Метки в разметке: f — заливка без обводки, fs — заливка + обводка,
   a — обводка акцентным цветом, af — акцентная заливка. */
const TSM_ICON_THEMES = {
    blue:   ["#5eb8ff", "#b6e0ff"],
    green:  ["#4fd69c", "#b0f2d4"],
    red:    ["#ff6b72", "#ffb8bc"],
    amber:  ["#ffb940", "#ffe29a"],
    violet: ["#a78bfa", "#d9ceff"],
    teal:   ["#2ed3c6", "#a6f2ec"],
    pink:   ["#ff7ac6", "#ffc4e4"]
};

const TSM_ICONS = {
    "close": ["red", '<circle class="f" cx="12" cy="12" r="10.5"/><line x1="16" y1="8" x2="8" y2="16"/><line x1="8" y1="8" x2="16" y2="16"/>'],
    "check": ["green", '<circle class="f" cx="12" cy="12" r="10.5"/><polyline points="17 9 10.5 15.5 7 12"/>'],
    "refresh": ["blue", '<circle class="f" cx="12" cy="12" r="6.5"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/><polyline class="a" points="23 4 23 10 17 10"/>'],
    "reset": ["amber", '<circle class="f" cx="12" cy="12" r="6.5"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/><polyline class="a" points="1 4 1 10 7 10"/>'],
    "trash": ["red", '<path class="fs" d="M5 6h14v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><line class="a" x1="3" y1="6" x2="21" y2="6"/><path class="a" d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>'],
    "copy": ["violet", '<rect class="fs" x="9" y="9" width="13" height="13" rx="2" ry="2"/><path class="a" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'],
    "link": ["blue", '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path class="a" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'],
    "chat": ["teal", '<path class="fs" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle class="af" cx="8" cy="10" r="1.2"/><circle class="af" cx="12" cy="10" r="1.2"/><circle class="af" cx="16" cy="10" r="1.2"/>'],
    "info": ["blue", '<circle class="fs" cx="12" cy="12" r="10"/><line class="a" x1="12" y1="16" x2="12" y2="12"/><line class="a" x1="12" y1="8" x2="12.01" y2="8"/>'],
    "user": ["violet", '<path class="fs" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2z"/><circle class="fs" cx="12" cy="7" r="4"/>'],
    "users": ["pink", '<path class="fs" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2z"/><circle class="fs" cx="9" cy="7" r="4"/><path class="a" d="M23 21v-2a4 4 0 0 0-3-3.87"/><path class="a" d="M16 3.13a4 4 0 0 1 0 7.75"/>'],
    "target": ["pink", '<circle class="fs" cx="12" cy="12" r="10"/><circle class="a" cx="12" cy="12" r="6"/><circle class="af" cx="12" cy="12" r="2"/>'],
    "book": ["amber", '<path class="fs" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path class="a" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>'],
    "monitor": ["blue", '<rect class="fs" x="2" y="3" width="20" height="14" rx="2" ry="2"/><line class="a" x1="8" y1="21" x2="16" y2="21"/><line class="a" x1="12" y1="17" x2="12" y2="21"/>'],
    "layers": ["violet", '<polygon class="fs" points="12 2 2 7 12 12 22 7 12 2"/><polyline class="a" points="2 17 12 22 22 17"/><polyline class="a" points="2 12 12 17 22 12"/>'],
    "package": ["amber", '<path class="fs" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline class="a" points="3.27 6.96 12 12.01 20.73 6.96"/><line class="a" x1="12" y1="22.08" x2="12" y2="12"/>'],
    "tool": ["teal", '<path class="fs" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'],
    "arrow-left": ["blue", '<line x1="19" y1="12" x2="5" y2="12"/><polyline class="a" points="12 19 5 12 12 5"/>'],
    "pause": ["amber", '<rect class="fs" x="6" y="4" width="4" height="16" rx="1"/><rect class="fs" x="14" y="4" width="4" height="16" rx="1"/>'],
    "play": ["green", '<polygon class="fs" points="5 3 19 12 5 21 5 3"/>'],
    "check-circle": ["green", '<circle class="fs" cx="12" cy="12" r="10"/><polyline class="a" points="16.5 9 10.5 15 7.5 12"/>'],
    "x-circle": ["red", '<circle class="fs" cx="12" cy="12" r="10"/><line class="a" x1="15" y1="9" x2="9" y2="15"/><line class="a" x1="9" y1="9" x2="15" y2="15"/>'],
    "alert": ["amber", '<path class="fs" d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line class="a" x1="12" y1="9" x2="12" y2="13"/><line class="a" x1="12" y1="17" x2="12.01" y2="17"/>'],
    "clipboard": ["teal", '<path class="fs" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect class="a" x="8" y="2" width="8" height="4" rx="1" ry="1"/>'],
    "file-text": ["blue", '<path class="fs" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline class="a" points="14 2 14 8 20 8"/><line class="a" x1="16" y1="13" x2="8" y2="13"/><line class="a" x1="16" y1="17" x2="8" y2="17"/>'],
    "credit-card": ["green", '<rect class="fs" x="1" y="4" width="22" height="16" rx="2" ry="2"/><line class="a" x1="1" y1="10" x2="23" y2="10"/>'],
    "eye": ["teal", '<path class="fs" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle class="af" cx="12" cy="12" r="3"/>'],
    "pencil": ["amber", '<path class="fs" d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>'],
    "headphones": ["violet", '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path class="fs" d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'],
    "mic": ["pink", '<path class="fs" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path class="a" d="M19 10v2a7 7 0 0 1-14 0v-2"/><line class="a" x1="12" y1="19" x2="12" y2="23"/>'],
    "check-square": ["green", '<path class="fs" d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/><polyline class="a" points="9 11 12 14 22 4"/>'],
    "grad": ["violet", '<polygon class="fs" points="12 3 1 9 12 15 23 9"/><path class="a" d="M5 11.5V17c0 1.5 3.1 3 7 3s7-1.5 7-3v-5.5"/><line class="a" x1="23" y1="9" x2="23" y2="15"/>'],
    "briefcase": ["amber", '<rect class="fs" x="2" y="7" width="20" height="14" rx="2" ry="2"/><path class="a" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line class="a" x1="2" y1="13" x2="22" y2="13"/>'],
    "flask": ["teal", '<path class="fs" d="M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3"/><line class="a" x1="8.5" y1="3" x2="15.5" y2="3"/><line class="a" x1="7" y1="15" x2="17" y2="15"/>'],
    "moon": ["blue", '<path class="fs" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'],
    "sun": ["amber", '<circle class="fs" cx="12" cy="12" r="4.5"/><line class="a" x1="12" y1="1.5" x2="12" y2="3.5"/><line class="a" x1="12" y1="20.5" x2="12" y2="22.5"/><line class="a" x1="1.5" y1="12" x2="3.5" y2="12"/><line class="a" x1="20.5" y1="12" x2="22.5" y2="12"/><line class="a" x1="4.6" y1="4.6" x2="6" y2="6"/><line class="a" x1="18" y1="18" x2="19.4" y2="19.4"/><line class="a" x1="4.6" y1="19.4" x2="6" y2="18"/><line class="a" x1="18" y1="6" x2="19.4" y2="4.6"/>'],
    "library": ["pink", '<rect class="fs" x="3" y="3" width="5" height="18" rx="1"/><rect class="fs" x="9.5" y="3" width="5" height="18" rx="1"/><path class="a" d="M16.2 5.2l4.4-1.2 3 15.6-4.4 1.2z" transform="translate(-1.6 0)"/>']
};

const TSM_ICON_CACHE = new Map();

function tsmIcon(name, size = 16, extraClass = "") {
    const def = TSM_ICONS[name];
    if (!def) return "";
    const key = `${name}|${size}|${extraClass}`;
    const cached = TSM_ICON_CACHE.get(key);
    if (cached) return cached;
    const [main, accent] = TSM_ICON_THEMES[def[0]];
    const body = def[1]
        .replace(/class="fs"/g, `fill="${main}" fill-opacity=".24"`)
        .replace(/class="f"/g, `fill="${main}" fill-opacity=".24" stroke="none"`)
        .replace(/class="af"/g, `fill="${accent}" stroke="none"`)
        .replace(/class="a"/g, `stroke="${accent}"`);
    const cls = extraClass ? ` ${extraClass}` : "";
    const html = `<svg class="tsm-icon${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${main}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
    TSM_ICON_CACHE.set(key, html);
    return html;
}

/* Заголовок с ведущим эмодзи → цветная SVG-иконка + экранированный текст.
   Так заголовки секций можно оставлять строками вида «🎓 План урока». */
const TSM_TITLE_EMOJI = { "🎓": "grad", "💼": "briefcase", "🧪": "flask", "💬": "chat", "📚": "library", "⚠": "alert" };
function tsmTitleHTML(title, size = 16) {
    const text = String(title ?? "");
    const first = [...text][0];
    const icon = TSM_TITLE_EMOJI[first] || (text.startsWith("⚠") ? "alert" : "");
    if (!icon) return escapeHTML(text);
    const rest = text.slice(first.length).replace(/^️?\s*/, "");
    return `${tsmIcon(icon, size)}<span>${escapeHTML(rest)}</span>`;
}

/* Пустое состояние: иконка + заголовок + подсказка */
function tsmEmptyState(icon, title, hint = "", extraHTML = "") {
    return `<div class="tsm-empty">
        <span class="tsm-empty-icon">${tsmIcon(icon, 24)}</span>
        <div class="tsm-empty-title">${escapeHTML(title)}</div>
        ${hint ? `<div class="tsm-text-xs">${escapeHTML(hint)}</div>` : ""}
        ${extraHTML}
    </div>`;
}

/* Кнопка «Повторить» для ошибок загрузки */
function tsmRetryButton() {
    return '<button type="button" class="tsm-btn tsm-btn-primary tsm-empty-retry">Повторить</button>';
}

/* Скелетон-заглушка списка на время загрузки */
function tsmSkeleton(rows = 5) {
    let html = '<div class="tsm-skeleton-stack">';
    for (let i = 0; i < rows; i++) {
        html += `<div class="tsm-skeleton" style="width:${58 + ((i * 37) % 42)}%"></div>`;
    }
    return `${html}</div>`;
}

function parsePageCookies() {
    return Object.fromEntries(
        document.cookie.split(/; */).filter(Boolean).map((c) => {
            const [key, ...rest] = c.split("=");
            let value = rest.join("=");
            try { value = decodeURIComponent(value); } catch { /* битая кука — оставляем как есть */ }
            return [key, value];
        })
    );
}

function getGlobalToken() {
    return parsePageCookies().token_global || "";
}

function toMoscowTime(isoString) {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}

/* ---------- Буфер обмена ---------- */

function legacyCopy(str) {
    const area = document.createElement("textarea");
    area.value = str;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:-1000px;left:-1000px;opacity:0;";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { ok = false; }
    area.remove();
    return ok;
}

/* FIX: navigator.clipboard падает без фокуса документа (например, после клика по
   контекстному меню) — добавлен запасной вариант через execCommand */
async function copyToClipboardTSM(str) {
    const text = String(str ?? "");
    if (!text) return false;
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        if (legacyCopy(text)) return true;
        createNotify("Не удалось скопировать в буфер обмена", "error");
        return false;
    }
}

/* Копирует и сразу показывает подтверждение — общий сценарий для всех кнопок 💾 / 📋 */
async function copyWithNotify(text, label = "Скопировано") {
    const ok = await copyToClipboardTSM(text);
    if (ok) createNotify(`${label}`);
    return ok;
}

/* ---------- Уведомления ---------- */

/* FIX: раньше все тосты висели в одной точке и перекрывали друг друга.
   Теперь они складываются в стопку снизу справа. */
function getToastStack() {
    let stack = document.getElementById("tsm-toast-stack");
    if (!stack) {
        stack = document.createElement("div");
        stack.id = "tsm-toast-stack";
        stack.className = "tsm-toast-stack";
        stack.setAttribute("role", "status");
        stack.setAttribute("aria-live", "polite");
        document.body.appendChild(stack);
    }
    return stack;
}

function dismissToast(toast) {
    if (!toast || toast.dataset.leaving) return;
    toast.dataset.leaving = "1";
    toast.classList.add("tsm-toast-leaving");
    setTimeout(() => toast.remove(), 220);
}

function createToast(content, type = "info", isHTML = false, ttl = TSM_TOAST_TTL) {
    const stack = getToastStack();
    const live = stack.querySelectorAll(".tsm-toast:not([data-leaving])");
    if (live.length >= TSM_TOAST_LIMIT) dismissToast(live[0]);

    const toast = document.createElement("div");
    toast.className = `tsm-toast tsm-toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    const icon = document.createElement("span");
    icon.className = "tsm-toast-icon";
    icon.innerHTML = tsmIcon(type === "error" ? "x-circle" : type === "ok" ? "check-circle" : "info", 15);

    const body = document.createElement("div");
    body.className = "tsm-toast-body";
    if (isHTML) body.innerHTML = content;
    else body.textContent = content;

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "tsm-toast-close";
    closeBtn.setAttribute("aria-label", "Закрыть уведомление");
    closeBtn.innerHTML = tsmIcon("close", 13);

    const countdownBar = document.createElement("div");
    countdownBar.className = "tsm-countdown-bar";
    countdownBar.style.animationDuration = `${ttl}ms`;

    toast.append(icon, body, closeBtn, countdownBar);

    /* Наведение приостанавливает обратный отсчёт — текст можно спокойно прочитать */
    let remaining = ttl;
    let startedAt = Date.now();
    let hideTimer = setTimeout(() => dismissToast(toast), ttl);
    toast.addEventListener("mouseenter", () => {
        clearTimeout(hideTimer);
        remaining -= Date.now() - startedAt;
        countdownBar.style.animationPlayState = "paused";
    });
    toast.addEventListener("mouseleave", () => {
        startedAt = Date.now();
        countdownBar.style.animationPlayState = "running";
        hideTimer = setTimeout(() => dismissToast(toast), Math.max(remaining, 0));
    });

    toast.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;
        dismissToast(toast);
    });

    stack.appendChild(toast);
    return toast;
}

function createNotify(text, result = "message") {
    createToast(text, result === "error" ? "error" : "ok", false);
}

/* ---------- Копируемые по клику значения ---------- */

/* FIX: раньше обработчик навешивался один раз и запоминал ПЕРВОЕ значение,
   поэтому после обновления данных копировался старый ID. Теперь значение
   хранится на элементе и обновляется при каждом вызове. */
function markCopyable(element, getText) {
    if (!element) return;
    element._tsmCopySource = getText;
    if (element.dataset.tsmCopyable) return;

    element.dataset.tsmCopyable = "1";
    element.classList.add("tsm-copyable");
    element.tabIndex = 0;
    const hint = "Клик — скопировать";
    element.title = element.title ? `${element.title}\n${hint}` : hint;

    const doCopy = async (event) => {
        event.stopPropagation();
        const source = element._tsmCopySource;
        const text = typeof source === "function" ? source() : String(source ?? "");
        if (!text || text === "undefined" || text === "null") return;
        if (await copyToClipboardTSM(text)) createNotify(`Скопировано: ${text}`);
    };

    element.addEventListener("mousedown", (event) => event.stopPropagation());
    element.addEventListener("click", doCopy);
    element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            doCopy(event);
        }
    });
}

/* Временная иконка-статус на кнопке (✓ / ✕), затем возврат исходной */
function flashButton(button, symbol, ms = 2500) {
    if (!button) return;
    if (!button.dataset.tsmFlashHtml) button.dataset.tsmFlashHtml = button.innerHTML;
    button.innerHTML = symbol === "✕" ? tsmIcon("close", 14, "tsm-flash-bad") : tsmIcon("check", 14, "tsm-flash-ok");
    clearTimeout(button._tsmFlashTimer);
    button._tsmFlashTimer = setTimeout(() => {
        button.innerHTML = button.dataset.tsmFlashHtml;
    }, ms);
}

/* ---------- Диалоговые окна ---------- */

let tsmDialogSeq = 0;

function buildTsmDialog({ title, message, okText, cancelText, inputMode }) {
    const overlay = document.createElement("div");
    overlay.className = "tsm-dialog-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const id = `tsm-dialog-${++tsmDialogSeq}`;
    const titleHtml = title ? `<div class="tsm-dialog-title" id="${id}-title">${tsmTitleHTML(title)}</div>` : "";
    const inputHtml = inputMode === "text"
        ? '<input class="tsm-dialog-input" type="text">'
        : inputMode === "multiline"
            ? '<textarea class="tsm-dialog-input" rows="4"></textarea>'
            : "";
    const hint = inputMode === "multiline" ? '<div class="tsm-dialog-hint">Ctrl + Enter — отправить</div>' : "";
    if (title) overlay.setAttribute("aria-labelledby", `${id}-title`);
    overlay.setAttribute("aria-describedby", `${id}-message`);

    overlay.innerHTML = `
        <div class="tsm-dialog">
            ${titleHtml}
            <div class="tsm-dialog-message" id="${id}-message">${escapeHTML(message)}</div>
            ${inputHtml}
            ${hint}
            <div class="tsm-dialog-actions">
                <button type="button" class="tsm-dialog-btn tsm-dialog-btn-cancel">${escapeHTML(cancelText)}</button>
                <button type="button" class="tsm-dialog-btn tsm-dialog-btn-ok">${escapeHTML(okText)}</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("tsm-dialog-visible"));
    return overlay;
}

/* Tab не должен уводить фокус за пределы модального диалога */
function cycleDialogFocus(event, overlay) {
    const focusables = overlay.querySelectorAll("button, input, textarea, select");
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const outside = !overlay.contains(document.activeElement);
    if (event.shiftKey && (document.activeElement === first || outside)) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || outside)) {
        event.preventDefault();
        first.focus();
    }
}

function restoreFocusToOpener(opener) {
    if (opener instanceof HTMLElement && document.contains(opener)) opener.focus();
}

function closeTsmDialog(overlay, onKeyDown) {
    document.removeEventListener("keydown", onKeyDown, true);
    overlay.classList.remove("tsm-dialog-visible");
    setTimeout(() => overlay.remove(), 200);
}

function tsmConfirm({ title = "", message = "", okText = "OK", cancelText = "Отмена", danger = false } = {}) {
    return new Promise((resolve) => {
        const opener = document.activeElement;
        const overlay = buildTsmDialog({ title, message, okText, cancelText });
        const okBtn = overlay.querySelector(".tsm-dialog-btn-ok");
        const cancelBtn = overlay.querySelector(".tsm-dialog-btn-cancel");
        if (danger) okBtn.classList.add("tsm-dialog-btn-danger");

        const close = (result) => {
            closeTsmDialog(overlay, onKeyDown);
            restoreFocusToOpener(opener);
            resolve(result);
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                close(false);
            } else if (event.key === "Tab") {
                cycleDialogFocus(event, overlay);
            } else if (event.key === "Enter" && document.activeElement !== cancelBtn) {
                event.preventDefault();
                close(true);
            }
        };

        okBtn.onclick = () => close(true);
        cancelBtn.onclick = () => close(false);
        overlay.addEventListener("mousedown", (event) => {
            if (event.target === overlay) close(false);
        });
        document.addEventListener("keydown", onKeyDown, true);
        /* Для опасных действий фокус по умолчанию на «Отмена» — случайный Enter не запустит удаление */
        (danger ? cancelBtn : okBtn).focus();
    });
}

function tsmPrompt({ title = "", message = "", value = "", placeholder = "", okText = "OK", cancelText = "Отмена", multiline = false, danger = false } = {}) {
    return new Promise((resolve) => {
        const opener = document.activeElement;
        const overlay = buildTsmDialog({ title, message, okText, cancelText, inputMode: multiline ? "multiline" : "text" });
        const input = overlay.querySelector(".tsm-dialog-input");
        const okBtn = overlay.querySelector(".tsm-dialog-btn-ok");
        const cancelBtn = overlay.querySelector(".tsm-dialog-btn-cancel");
        if (danger) okBtn.classList.add("tsm-dialog-btn-danger");

        input.placeholder = placeholder;
        input.value = value;

        const close = (result) => {
            closeTsmDialog(overlay, onKeyDown);
            restoreFocusToOpener(opener);
            resolve(result);
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                close(null);
            } else if (event.key === "Tab") {
                cycleDialogFocus(event, overlay);
            }
        };
        const submit = () => close(input.value);

        okBtn.onclick = submit;
        cancelBtn.onclick = () => close(null);
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && (!multiline || event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                submit();
            }
        });
        overlay.addEventListener("mousedown", (event) => {
            if (event.target === overlay) close(null);
        });
        document.addEventListener("keydown", onKeyDown, true);
        input.focus();
        input.select();
    });
}

/* ---------- Плавающие окна ---------- */

/* Перетаскивание не стартует с элементов управления и со списков данных —
   иначе невозможно выделить текст в таблицах и словаре */
const TSM_NO_DRAG_SELECTOR = [
    "button", "input", "textarea", "select", "option", "label", "a",
    "[contenteditable]", ".tsm-copyable",
    ".tsm-exercise-bar", ".tsm-words-out", ".tsm-info-bar-kids", ".tsm-table-wrapper",
    "[data-tsm-no-drag]"
].join(",");

let tsmTopZ = 1000000;

function bringToFront(win) {
    tsmTopZ += 1;
    win.style.setProperty("z-index", String(tsmTopZ), "important");
}

const tsmClamp = (val, min, max) => Math.min(Math.max(val, min), max);

/* Возвращает окно в видимую область (после смены разрешения/размера окна браузера) */
function keepInViewport(win) {
    if (!win || win.style.display === "none") return;
    const maxLeft = Math.max(8, window.innerWidth - win.offsetWidth - 8);
    const maxTop = Math.max(8, window.innerHeight - Math.min(win.offsetHeight, 120) - 8);
    win.style.left = `${tsmClamp(win.offsetLeft, 8, maxLeft)}px`;
    win.style.top = `${tsmClamp(win.offsetTop, 8, maxTop)}px`;
}

/* Синхронизация расположения окон через chrome.storage.local (с памятью и fallback в localStorage) */
const tsmWindowPositionsCache = {};

if (chrome?.storage?.local) {
    chrome.storage.local.get(null, (items) => {
        if (!chrome.runtime.lastError && items) {
            Object.assign(tsmWindowPositionsCache, items);
            document.querySelectorAll(".tsm-window").forEach((win) => {
                if (win._tsmTopKey && win._tsmLeftKey) {
                    const top = parseInt(tsmWindowPositionsCache[win._tsmTopKey], 10);
                    const left = parseInt(tsmWindowPositionsCache[win._tsmLeftKey], 10);
                    if (Number.isFinite(top) && Number.isFinite(left)) {
                        win.style.top = `${top}px`;
                        win.style.left = `${left}px`;
                        keepInViewport(win);
                    }
                }
            });
        }
    });
}

function getWindowCoord(key, defaultVal) {
    if (key in tsmWindowPositionsCache) {
        const val = parseInt(tsmWindowPositionsCache[key], 10);
        if (Number.isFinite(val)) return val;
    }
    try {
        const localVal = parseInt(localStorage.getItem(key), 10);
        if (Number.isFinite(localVal)) return localVal;
    } catch {}
    return defaultVal;
}

function setWindowCoord(key, val) {
    tsmWindowPositionsCache[key] = val;
    try {
        localStorage.setItem(key, String(val));
    } catch {}
    if (chrome?.storage?.local) {
        chrome.storage.local.set({ [key]: val }, () => void chrome.runtime.lastError);
    }
}

function createTSMWindow(id, topKey, leftKey, content) {
    const windowElement = document.createElement("div");
    windowElement._tsmTopKey = topKey;
    windowElement._tsmLeftKey = leftKey;
    const top = getWindowCoord(topKey, 118);
    const left = getWindowCoord(leftKey, 407);

    windowElement.style.cssText = `display:none; top:${top}px; left:${left}px;`;
    windowElement.id = id;
    windowElement.innerHTML = content;
    document.body.append(windowElement);

    /* При каждом показе — поверх остальных окон TSM и в пределах экрана.
       Реагируем только на переход «скрыто → видно», иначе собственные правки style
       (z-index, left/top) зациклили бы наблюдатель. */
    let wasVisible = false;
    new MutationObserver(() => {
        const visible = windowElement.style.display !== "none";
        if (visible && !wasVisible) {
            bringToFront(windowElement);
            requestAnimationFrame(() => keepInViewport(windowElement));
        }
        wasVisible = visible;
    }).observe(windowElement, { attributes: true, attributeFilter: ["style"] });

    windowElement.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return;
        bringToFront(windowElement);
        if (event.target.closest(TSM_NO_DRAG_SELECTOR)) return;
        event.preventDefault();

        const startX = event.clientX;
        const startY = event.clientY;
        const elemLeft = windowElement.offsetLeft;
        const elemTop = windowElement.offsetTop;
        windowElement.classList.add("tsm-dragging");

        const onMouseMove = (e) => {
            const maxLeft = Math.max(8, window.innerWidth - windowElement.offsetWidth - 8);
            const maxTop = Math.max(8, window.innerHeight - 60);
            windowElement.style.left = `${tsmClamp(elemLeft + e.clientX - startX, 8, maxLeft)}px`;
            windowElement.style.top = `${tsmClamp(elemTop + e.clientY - startY, 8, maxTop)}px`;
        };
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            windowElement.classList.remove("tsm-dragging");
            setWindowCoord(topKey, windowElement.offsetTop);
            setWindowCoord(leftKey, windowElement.offsetLeft);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    return windowElement;
}

window.addEventListener("resize", () => {
    document.querySelectorAll(".tsm-window").forEach(keepInViewport);
});

/* Переключение видимости окна: возвращает true, если окно стало видимым */
function toggleTSMWindow(win, forceShow) {
    const show = forceShow ?? win.style.display === "none";
    win.style.display = show ? "" : "none";
    return show;
}

/* Состояние «идёт загрузка» для кнопки */
function setBusy(button, busy) {
    if (!button) return;
    button.classList.toggle("is-loading", busy);
    button.disabled = busy;
}

/* Общий хелпер отправки сообщений в background */
function sendRuntimeMessage(message) {
    return new Promise((resolve) => {
        try {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(chrome.runtime.lastError ? { success: false, error: chrome.runtime.lastError.message } : response);
            });
        } catch (err) {
            resolve({ success: false, error: "Расширение было перезагружено — обновите страницу (F5)" });
        }
    });
}

/* Перетаскивание окон за любой handleEl (окно position: fixed или absolute) */
function makeDraggable(windowEl, handleEl = windowEl) {
    if (!windowEl || !handleEl || windowEl._tsmDragInitialized) return;
    windowEl._tsmDragInitialized = true;

    handleEl.addEventListener("mousedown", (e) => {
        if (e.button !== 0 || e.target.closest(TSM_NO_DRAG_SELECTOR)) return;
        e.preventDefault();
        bringToFront(windowEl);
        const rect = windowEl.getBoundingClientRect();
        const startX = e.clientX;
        const startY = e.clientY;
        windowEl.classList.add("tsm-dragging");

        const onMouseMove = (ev) => {
            windowEl.style.left = `${tsmClamp(rect.left + ev.clientX - startX, 8, window.innerWidth - rect.width - 8)}px`;
            windowEl.style.top = `${tsmClamp(rect.top + ev.clientY - startY, 8, window.innerHeight - 60)}px`;
        };
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            windowEl.classList.remove("tsm-dragging");
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
}

/* Закрытие верхнего активного окна TSM по Escape */
function closeTopTSMWindow() {
    if (document.querySelector(".tsm-dialog-overlay")) return false;

    const visibleWindows = Array.from(document.querySelectorAll(".tsm-window"))
        .filter((win) => win.style.display !== "none" && (win.offsetWidth > 0 || win.offsetHeight > 0));

    if (!visibleWindows.length) return false;

    visibleWindows.sort((a, b) => {
        const za = parseInt(window.getComputedStyle(a).zIndex, 10) || 0;
        const zb = parseInt(window.getComputedStyle(b).zIndex, 10) || 0;
        return zb - za;
    });

    const topWin = visibleWindows[0];
    const closeBtn = topWin.querySelector(".tsm-btn-hide, .tsm-close-modal, [id^='hide']");
    if (closeBtn) {
        closeBtn.click();
    } else {
        topWin.style.display = "none";
    }
    return true;
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.querySelector(".tsm-dialog-overlay")) {
        if (closeTopTSMWindow()) {
            event.stopPropagation();
        }
    }
});

/* ---------- Логирование сетевых запросов ---------- */

function logRequest(details) {
    console.log(
        `%cTSM ▸ ${details.statusCode} ${details.method} ${details.url}${details.ip ? " (IP " + details.ip + ")" : ""}`,
        "background:#3a1d24;color:#ffc9cc;padding:2px 6px;border-radius:3px;"
    );
}

/* ---------- Единый хаб сообщений от background ---------- */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action || message.message) {
        case "logRequest":
            logRequest(message.details);
            break;

        case "notify":
            createNotify(message.text, message.type === "error" ? "error" : "message");
            break;

        case "CallMMComment":
            if (SERVICE_HOSTS.includes(location.host)) handleMMComment(message.Chatid);
            break;

        case "copyToClipboard":
            copyToClipboardTSM(message.text).then((copied) => {
                if (copied) createNotify(message.label || "Скопировано в буфер обмена");
                sendResponse(copied ? { success: true } : { success: false, error: "clipboard write failed" });
            });
            return true;

        case "showConfirmDialog":
            (async () => {
                const confirmed = await tsmConfirm({
                    title: "🆘 #dev-disaster",
                    message: "Сообщение увидят все команды поддержки и разработки. Используйте только при массовой проблеме на платформе.",
                    okText: "Продолжить",
                    danger: true
                });
                if (!confirmed) {
                    sendResponse({ confirmed: false });
                    return;
                }
                const textmsg = await tsmPrompt({
                    title: "🆘 #dev-disaster",
                    message: "Опишите проблему: что не работает, у кого и с какого времени.",
                    okText: "Отправить",
                    multiline: true
                });
                sendResponse({ confirmed: typeof textmsg === "string", textmsg });
            })();
            return true;

        case "showPromptDialog":
            (async () => {
                const textmsg = await tsmPrompt({
                    title: "💬 Сообщение в #techsupport",
                    message: "Текст будет отправлен вместе со ссылкой на задачу.",
                    okText: "Отправить",
                    multiline: true
                });
                sendResponse({
                    textmsg,
                    confirmed: typeof textmsg === "string" && textmsg.trim().length > 3
                });
            })();
            return true;
    }
    return false;
});

/* ---------- Передача тикета в #techsupport ---------- */

async function handleMMComment(chatId) {
    if (!chatId || chatId === lastChatIdF) {
        createNotify("Сообщение уже передано. Если нужно повторить — отправьте его в ММ заново", "error");
        return;
    }
    lastChatIdF = chatId;

    const messlink = MESSENGER_WEB_LINK + encodeURIComponent(chatId);

    if (location.host === "crm2.skyeng.ru") {
        const copied = await copyToClipboardTSM(messlink);
        const suffix = copied ? ", ссылка скопирована" : "";
        createToast(`Передано в #techsupport${suffix}: <a href="${escapeHTML(messlink)}" target="_blank" rel="noopener">открыть пост</a>`, "ok", true, 6000);
    } else if (location.href.includes("skyeng.autofaq.ai/tickets/assigned")) {
        const sent = await sendCommentTSM(`Передано в канал #techsupport: <a href="${messlink}" target="_blank" rel="noopener">ссылка</a>`);
        createNotify(sent ? "Передано в #techsupport, комментарий добавлен в тикет" : "Передано в #techsupport, но комментарий в тикет не добавлен", sent ? "message" : "error");
    }
}

function getChatIdTSM() {
    if (!location.href.includes("tickets/assigned")) return "";
    const frame = document.querySelector('[class^="NEW_FRONTEND"]');
    let frameDocument = null;
    try {
        frameDocument = frame && (frame.contentDocument || frame.contentWindow?.document);
    } catch { /* кросс-доменный фрейм */ }
    if (!frameDocument) return "";

    const selected = frameDocument.querySelector('#__next [class^="DialogsCard_Card"][aria-selected="true"]');
    return selected ? selected.getAttribute("data-conv-id") || "" : "";
}

async function getInfoTSM() {
    const activeConvId = getChatIdTSM();
    if (!activeConvId) return ["", ""];
    try {
        const response = await fetch("https://skyeng.autofaq.ai/api/conversations/" + activeConvId);
        const { sessionId = "" } = await response.json();
        return [activeConvId, sessionId];
    } catch (err) {
        console.error("[TSM] Не удалось получить sessionId:", err);
        return [activeConvId, ""];
    }
}

async function sendCommentTSM(txt) {
    const [conversationId, sessionId] = await getInfoTSM();
    if (!conversationId || !sessionId) return false;

    const boundary = "----TSMFormBoundary" + Math.random().toString(36).slice(2);
    const payload = JSON.stringify({ sessionId, conversationId, text: txt, isComment: true });
    try {
        const res = await fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            method: "POST",
            credentials: "include",
            headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
            body: `--${boundary}\r\nContent-Disposition: form-data; name="payload"\r\n\r\n${payload}\r\n--${boundary}--\r\n`
        });
        return res.ok;
    } catch (err) {
        console.error("[TSM] Ошибка отправки комментария:", err);
        return false;
    }
}

/* ---------- Отслеживание выделения текста ---------- */

function detectSelectionType(text) {
    /* FIX: в классе символов «\:-;» дефис был диапазоном, и ID вида 123-456 не распознавались */
    if (/^(?=(?:\D*\d){4})[\d\s,.:;\/айдиАЙДИIDуУ-]+$/.test(text)) return "NUMERIC_SELECTION";
    if (/^[a-zA-Z]{6,}$/.test(text)) return "HASH_SELECTION";
    return "OTHER_SELECTION";
}

let lastSentSelectionType = null;
const tsmWatchedDocs = new WeakSet();

function setSelectionListener(doc) {
    if (!doc || tsmWatchedDocs.has(doc)) return;
    tsmWatchedDocs.add(doc);
    doc.addEventListener("selectionchange", () => {
        const selectedText = doc.getSelection()?.toString().trim();
        if (!selectedText) {
            if (lastSentSelectionType !== null) {
                lastSentSelectionType = null;
                try {
                    chrome.runtime.sendMessage({ type: "OTHER_SELECTION" });
                } catch {
                    /* контекст расширения перезагружен — страницу нужно обновить */
                }
            }
            return;
        }
        const type = detectSelectionType(selectedText);
        if (type !== lastSentSelectionType) {
            lastSentSelectionType = type;
            try {
                chrome.runtime.sendMessage({ type });
            } catch {
                /* контекст расширения перезагружен — страницу нужно обновить */
            }
        }
    });
}

setSelectionListener(document);

/* AutoFAQ рендерит диалоги во фрейме, который пересоздаётся при навигации.
   FIX: раньше слушатель вешался на документ, захваченный ДО загрузки фрейма,
   и после onload указывал на уже мёртвый документ. */
function attachToAutofaqFrame(frame) {
    const hook = () => {
        try {
            const doc = frame.contentDocument || frame.contentWindow?.document;
            if (doc && doc.readyState !== "uninitialized") setSelectionListener(doc);
        } catch { /* кросс-доменный фрейм */ }
    };
    if (!frame.dataset.tsmHooked) {
        frame.dataset.tsmHooked = "1";
        frame.addEventListener("load", hook);
    }
    hook();
}

if (location.host === "skyeng.autofaq.ai") {
    const scanFrames = () => document.querySelectorAll('[class^="NEW_FRONTEND"]').forEach(attachToAutofaqFrame);
    scanFrames();
    let scanScheduled = false;
    new MutationObserver(() => {
        if (scanScheduled) return;
        scanScheduled = true;
        requestAnimationFrame(() => {
            scanScheduled = false;
            scanFrames();
        });
    }).observe(document.body, { childList: true, subtree: true });
}