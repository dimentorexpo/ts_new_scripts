/* =========================================================
   TSM Content Script
   ========================================================= */

const MESSENGER_WEB_LINK = "https://mm-time.skyeng.tech/skyeng/pl/";
const SERVICE_HOSTS = ["skyeng.autofaq.ai", "crm2.skyeng.ru"];

let token;
let lastChatIdF = null;
let attemptCount = 0;
let isIframeListenerSet = false;
const MAX_ATTEMPTS = 60;

/* ---------- Общие утилиты ---------- */

function toMoscowTime(isoString) {
    if (!isoString) return "--";
    return new Date(isoString).toLocaleString("ru-RU", {
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

function parsePageCookies() {
    return Object.fromEntries(
        document.cookie.split(/; */).map((c) => {
            const [key, ...rest] = c.split("=");
            return [key, decodeURIComponent(rest.join("="))];
        })
    );
}

async function copyToClipboardTSM(str) {
    try {
        await navigator.clipboard.writeText(str);
        return true;
    } catch (err) {
        console.error("Не удалось скопировать текст:", err);
        createNotify("Не удалось скопировать текст", "error");
        return false;
    }
}

function createToast(text, type = "sucsbtnok") {
    const toast = document.createElement("button");
    toast.className = `tsm-toast ${type}`;
    toast.innerHTML = text;

    const countdownBar = document.createElement("div");
    countdownBar.className = "tsm-countdown-bar";
    toast.appendChild(countdownBar);

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

function createNotify(text, result = "message") {
    createToast(text, result === "message" ? "sucsbtnok" : "sucsbtnnotok");
}

/* ---------- Диалоговые окна ---------- */

function buildTsmDialog({ title, message, okText, cancelText, inputMode }) {
    const overlay = document.createElement("div");
    overlay.className = "tsm-dialog-overlay";

    const titleHtml = title ? `<div class="tsm-dialog-title">${title}</div>` : "";
    const inputHtml = inputMode === "text"
        ? '<input class="tsm-dialog-input" type="text">'
        : inputMode === "multiline"
            ? '<textarea class="tsm-dialog-input" rows="4"></textarea>'
            : "";

    overlay.innerHTML = `
        <div class="tsm-dialog">
            ${titleHtml}
            <div class="tsm-dialog-message">${message}</div>
            ${inputHtml}
            <div class="tsm-dialog-actions">
                <button class="tsm-dialog-btn tsm-dialog-btn-cancel">${cancelText}</button>
                <button class="tsm-dialog-btn tsm-dialog-btn-ok">${okText}</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("tsm-dialog-visible"));
    return overlay;
}

function tsmConfirm({ title = "", message = "", okText = "OK", cancelText = "Отмена", danger = false } = {}) {
    return new Promise((resolve) => {
        const overlay = buildTsmDialog({ title, message, okText, cancelText });
        const okBtn = overlay.querySelector(".tsm-dialog-btn-ok");
        const cancelBtn = overlay.querySelector(".tsm-dialog-btn-cancel");
        if (danger) okBtn.classList.add("tsm-dialog-btn-danger");

        const close = (result) => {
            document.removeEventListener("keydown", onKeyDown, true);
            overlay.classList.remove("tsm-dialog-visible");
            setTimeout(() => overlay.remove(), 200);
            resolve(result);
        };
        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                close(false);
            } else if (event.key === "Enter") {
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
        okBtn.focus();
    });
}

function tsmPrompt({ title = "", message = "", value = "", placeholder = "", okText = "OK", cancelText = "Отмена", multiline = false } = {}) {
    return new Promise((resolve) => {
        const overlay = buildTsmDialog({
            title,
            message,
            okText,
            cancelText,
            inputMode: multiline ? "multiline" : "text"
        });
        const input = overlay.querySelector(".tsm-dialog-input");
        const okBtn = overlay.querySelector(".tsm-dialog-btn-ok");
        const cancelBtn = overlay.querySelector(".tsm-dialog-btn-cancel");

        input.placeholder = placeholder;
        input.value = value;

        const close = (result) => {
            document.removeEventListener("keydown", onKeyDown, true);
            overlay.classList.remove("tsm-dialog-visible");
            setTimeout(() => overlay.remove(), 200);
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
            if (event.key === "Enter" && (!multiline || event.ctrlKey)) {
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

function isInteractiveElement(event) {
    const el = document.elementFromPoint(event.clientX, event.clientY);
    return !["BUTTON", "INPUT", "TEXTAREA", "SELECT"].includes(el?.nodeName);
}

function createTSMWindow(id, topKey, leftKey, content) {
    const windowElement = document.createElement("div");
    document.body.append(windowElement);
    const storedTop = localStorage.getItem(topKey) || "118";
    const storedLeft = localStorage.getItem(leftKey) || "407";
    windowElement.style.cssText = `display:none; top: ${storedTop}px; left: ${storedLeft}px;`;
    windowElement.setAttribute("id", id);
    windowElement.innerHTML = content;

    windowElement.onmousedown = (event) => {
        if (!isInteractiveElement(event)) return;
        event.preventDefault();

        const startX = event.clientX;
        const startY = event.clientY;
        const elemLeft = windowElement.offsetLeft;
        const elemTop = windowElement.offsetTop;

        const onMouseMove = (e) => {
            windowElement.style.left = `${elemLeft + e.clientX - startX}px`;
            windowElement.style.top = `${elemTop + e.clientY - startY}px`;
        };
        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            localStorage.setItem(topKey, String(windowElement.offsetTop));
            localStorage.setItem(leftKey, String(windowElement.offsetLeft));
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    return windowElement;
}

/* ---------- Логирование сетевых запросов ---------- */

function logRequest(details) {
    console.log(
        "%cСетевой запрос: " + details.url + " Метод: " + details.method + " Status Code: " + details.statusCode + " IP: " + details.ip,
        "background: rgba(255, 0, 0, 0.7); color: white; padding: 2px 5px; border-radius: 2px;"
    );
}

/* ---------- Единый хаб сообщений от background ---------- */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action || message.message) {
        case "logRequest":
            logRequest(message.details);
            break;

        case "CallMMComment":
            if (SERVICE_HOSTS.includes(location.host)) handleMMComment(message.Chatid);
            break;

        case "copyToClipboard":
            copyToClipboardTSM(message.text).then((copied) => {
                if (copied) {
                    createNotify("💾 Успешно");
                    sendResponse({ success: true });
                } else {
                    sendResponse({ success: false, error: "clipboard write failed" });
                }
            });
            return true;

        case "showConfirmDialog":
            (async () => {
                const confirmed = await tsmConfirm({
                    title: "🆘 #dev-disaster",
                    message: "Вы уверены, что хотите пробудить Древнее Зло и воззвать к команде Фиксиков для исправления катаклизма на платформе?",
                    okText: "🚨 Продолжить",
                    cancelText: "Отмена",
                    danger: true
                });
                if (!confirmed) {
                    sendResponse({ confirmed: false });
                    return;
                }
                const textmsg = await tsmPrompt({
                    title: "🆘 #dev-disaster",
                    message: "Введите ваш текст в это поле",
                    okText: "Отправить",
                    multiline: true
                });
                sendResponse({ confirmed: true, textmsg });
            })();
            return true;

        case "showPromptDialog":
            (async () => {
                const textmsg = await tsmPrompt({
                    title: "💬 Сообщение для канала",
                    message: "Введите ваш текст в это поле",
                    okText: "Отправить",
                    multiline: true
                });
                sendResponse({ textmsg, confirmed: textmsg !== null && textmsg.length > 3 });
            })();
            return true;
    }
});

/* ---------- Передача тикета в #techsupport ---------- */

async function handleMMComment(chatId) {
    if (!chatId || chatId === lastChatIdF) {
        createNotify("Ошибка. Повтори отправку сообщения в ММ", "error");
        return;
    }
    lastChatIdF = chatId;

    const messlink = MESSENGER_WEB_LINK + chatId;

    if (location.href.includes("crm2.skyeng.ru")) {
        const copied = await copyToClipboardTSM(messlink);
        const suffix = copied ? " и ссылка скопирована в буфер обмена" : "";
        createToast(`Передано в канал #techsupport${suffix}: <a href="${messlink}" target="_blank" rel="noopener">${messlink}</a>`);
    } else if (location.href.includes("skyeng.autofaq.ai/tickets/assigned")) {
        sendCommentTSM(`Передано в канал #techsupport: <a href="${messlink}" target="_blank" rel="noopener">ссылка</a>`);
    }
}

async function getInfoTSM() {
    const activeConvId = getChatIdTSM();
    let sessionId = "";
    try {
        const response = await fetch("https://skyeng.autofaq.ai/api/conversations/" + activeConvId);
        sessionId = (await response.json()).sessionId || "";
    } catch (err) {
        console.error("Не удалось получить sessionId:", err);
    }
    return [activeConvId, sessionId];
}

async function sendCommentTSM(txt) {
    const [activeConvId, sessionId] = await getInfoTSM();
    if (!activeConvId || !sessionId) return;

    const escaped = txt.split("\n").join("\\n").split("\"").join("\\\"");
    const payload = JSON.stringify({ sessionId, conversationId: activeConvId, text: escaped, isComment: true });

    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
        headers: { "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW" },
        body: `------WebKitFormBoundaryH2CK1t5M3Dc3ziNW\r\nContent-Disposition: form-data; name="payload"\r\n\r\n${payload}\r\n------WebKitFormBoundaryH2CK1t5M3Dc3ziNW--\r\n`,
        method: "POST",
        credentials: "include"
    });
}

function getChatIdTSM() {
    if (!location.href.includes("tickets/assigned")) return "";

    const frame = document.querySelector('[class^="NEW_FRONTEND"]');
    const frameDocument = frame && (frame.contentDocument || frame.contentWindow.document);
    if (!frameDocument) return "";

    const cards = frameDocument.querySelectorAll('#__next [class^="DialogsCard_Card"]');
    const selected = Array.from(cards).find((card) => card.getAttribute("aria-selected") === "true");
    return selected ? selected.getAttribute("data-conv-id") : "";
}

/* ---------- Отслеживание выделения текста ---------- */

function detectSelectionType(text) {
    if (/^(?=(?:[^0-9]*[0-9]){4})[\d\s,.айдиIDАЙДИуУ\/\:-;]+$/.test(text)) return "NUMERIC_SELECTION";
    if (/^[a-zA-Z]{6,}$/.test(text)) return "HASH_SELECTION";
    return "OTHER_SELECTION";
}

function setSelectionListener(doc) {
    doc.addEventListener("selectionchange", () => {
        const selectedText = doc.getSelection().toString().trim();
        if (selectedText) {
            chrome.runtime.sendMessage({ type: detectSelectionType(selectedText) });
        }
    });
}

function checkIframeLoaded() {
    if (attemptCount >= MAX_ATTEMPTS) {
        console.log("Попытка поиска iframe завершилась неудачей после", MAX_ATTEMPTS, "попыток.");
        return;
    }
    const iframeElement = document.querySelector('[class^="NEW_FRONTEND"]');
    if (!iframeElement) {
        attemptCount++;
        setTimeout(checkIframeLoaded, 1000);
        return;
    }
    const iframeDocument = iframeElement.contentDocument || iframeElement.contentWindow.document;
    if (iframeDocument && iframeDocument.readyState === "complete") {
        setSelectionListener(iframeDocument);
        isIframeListenerSet = true;
    } else if (iframeDocument) {
        iframeElement.onload = () => {
            setSelectionListener(iframeDocument);
            isIframeListenerSet = true;
        };
    } else {
        attemptCount++;
        setTimeout(checkIframeLoaded, 1000);
    }
}

setSelectionListener(document);

if (window.location.href === "https://skyeng.autofaq.ai/tickets/assigned") {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes || []) {
                if (node.nodeType === Node.ELEMENT_NODE && node.matches('[class^="NEW_FRONTEND"]')) {
                    isIframeListenerSet = false;
                    checkIframeLoaded();
                }
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    if (!isIframeListenerSet) checkIframeLoaded();
    setInterval(() => {
        if (!isIframeListenerSet) checkIframeLoaded();
    }, 60000);
}
