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

function createToast(content, type = "sucsbtnok", isHTML = false, ttl = TSM_TOAST_TTL) {
    const stack = getToastStack();
    const live = stack.querySelectorAll(".tsm-toast:not([data-leaving])");
    if (live.length >= TSM_TOAST_LIMIT) dismissToast(live[0]);

    const toast = document.createElement("div");
    toast.className = `tsm-toast ${type}`;

    const body = document.createElement("div");
    body.className = "tsm-toast-body";
    if (isHTML) body.innerHTML = content;
    else body.textContent = content;
    toast.appendChild(body);

    const countdownBar = document.createElement("div");
    countdownBar.className = "tsm-countdown-bar";
    countdownBar.style.animationDuration = `${ttl}ms`;
    toast.appendChild(countdownBar);

    toast.addEventListener("click", (event) => {
        if (event.target.closest("a")) return;
        dismissToast(toast);
    });

    stack.appendChild(toast);
    setTimeout(() => dismissToast(toast), ttl);
    return toast;
}

function createNotify(text, result = "message") {
    createToast(text, result === "message" ? "sucsbtnok" : "sucsbtnnotok", false);
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

/* Временная иконка-статус на кнопке (✅ / ❌), затем возврат исходной */
function flashButton(button, symbol, ms = 2500) {
    if (!button) return;
    if (!button.dataset.tsmIcon) button.dataset.tsmIcon = button.textContent;
    button.textContent = symbol;
    clearTimeout(button._tsmFlashTimer);
    button._tsmFlashTimer = setTimeout(() => {
        button.textContent = button.dataset.tsmIcon;
    }, ms);
}

/* ---------- Диалоговые окна ---------- */

function buildTsmDialog({ title, message, okText, cancelText, inputMode }) {
    const overlay = document.createElement("div");
    overlay.className = "tsm-dialog-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const titleHtml = title ? `<div class="tsm-dialog-title">${escapeHTML(title)}</div>` : "";
    const inputHtml = inputMode === "text"
        ? '<input class="tsm-dialog-input" type="text">'
        : inputMode === "multiline"
            ? '<textarea class="tsm-dialog-input" rows="4"></textarea>'
            : "";
    const hint = inputMode === "multiline" ? '<div class="tsm-dialog-hint">Ctrl + Enter — отправить</div>' : "";

    overlay.innerHTML = `
        <div class="tsm-dialog">
            ${titleHtml}
            <div class="tsm-dialog-message">${escapeHTML(message)}</div>
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

function closeTsmDialog(overlay, onKeyDown) {
    document.removeEventListener("keydown", onKeyDown, true);
    overlay.classList.remove("tsm-dialog-visible");
    setTimeout(() => overlay.remove(), 200);
}

function tsmConfirm({ title = "", message = "", okText = "OK", cancelText = "Отмена", danger = false } = {}) {
    return new Promise((resolve) => {
        const overlay = buildTsmDialog({ title, message, okText, cancelText });
        const okBtn = overlay.querySelector(".tsm-dialog-btn-ok");
        const cancelBtn = overlay.querySelector(".tsm-dialog-btn-cancel");
        if (danger) okBtn.classList.add("tsm-dialog-btn-danger");

        const close = (result) => {
            closeTsmDialog(overlay, onKeyDown);
            resolve(result);
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                close(false);
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

function tsmPrompt({ title = "", message = "", value = "", placeholder = "", okText = "OK", cancelText = "Отмена", multiline = false } = {}) {
    return new Promise((resolve) => {
        const overlay = buildTsmDialog({ title, message, okText, cancelText, inputMode: multiline ? "multiline" : "text" });
        const input = overlay.querySelector(".tsm-dialog-input");
        const okBtn = overlay.querySelector(".tsm-dialog-btn-ok");
        const cancelBtn = overlay.querySelector(".tsm-dialog-btn-cancel");

        input.placeholder = placeholder;
        input.value = value;

        const close = (result) => {
            closeTsmDialog(overlay, onKeyDown);
            resolve(result);
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                close(null);
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

function createTSMWindow(id, topKey, leftKey, content) {
    const windowElement = document.createElement("div");
    const storedTop = parseInt(localStorage.getItem(topKey), 10);
    const storedLeft = parseInt(localStorage.getItem(leftKey), 10);
    const top = Number.isFinite(storedTop) ? storedTop : 118;
    const left = Number.isFinite(storedLeft) ? storedLeft : 407;

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
            localStorage.setItem(topKey, String(windowElement.offsetTop));
            localStorage.setItem(leftKey, String(windowElement.offsetLeft));
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
        createToast(`Передано в #techsupport${suffix}: <a href="${escapeHTML(messlink)}" target="_blank" rel="noopener">открыть пост</a>`, "sucsbtnok", true, 6000);
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
            lastSentSelectionType = null;
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
