/* =========================================================
   TSM Background Service Worker
   ========================================================= */

const MESSENGER_API_URL = "https://mm-time.skyeng.tech/api/v4/posts";
const MESSENGER_USER_URL = "https://mm-time.skyeng.tech/api/v4/users/me";
const LASER_EXTENSION_ID = "kggpdmfnfmmkneemhknlojemcjmdlpjb";
const CHANNEL_DEV = "hg8rcub4pfg3dcae8jxkwzkq9h";
const CHANNEL_SUPPORT = "pspyooisr3rd7qzx9as8uc96xc";

const DISASTER_MENTIONS = "@techsupport-team @techsupport-leads @tech-curators @pk-chats @sos-inform-teachers @teacherscareteam @outbound-team-new @m-vhod @pm-team1 @premium-support @a-players @news";

const TASK_LINK_PATTERNS = [
    "https://crm2.skyeng.ru/customer-support/task/*",
    "https://crm2.skyeng.ru/persons/*/customer-support/task/*",
    "https://crm2.skyeng.ru/persons/*/customer-support/list"
];
const SHOW_FOR_PAGES = ["*://skyeng.autofaq.ai/*", "*://*.skyeng.ru/*", "*://*.skyeng.tech/*"];

/* Белый список адресов для CORS-прокси.
   FIX: communications.skyeng.ru отсутствовал — «Меню чата» всегда получало отказ. */
const ALLOWED_FETCH_ORIGINS = new Set([
    "https://crm2.skyeng.ru",
    "https://id.skyeng.ru",
    "https://api-words.skyeng.ru",
    "https://api-profile.skyeng.ru",
    "https://billing-api.skyeng.ru",
    "https://billing-marketing.skyeng.ru",
    "https://dictionary.skyeng.ru",
    "https://video-trouble-shooter.skyeng.ru",
    "https://timetable.skyeng.ru",
    "https://vimbox.skyeng.ru",
    "https://student.skyeng.ru",
    "https://trm.skyeng.ru",
    "https://learning-groups-storage.skyeng.ru",
    "https://communications.skyeng.ru",
    "https://skyeng.autofaq.ai",
    "https://mm-time.skyeng.tech"
]);

const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;

/* ---------- Проверки адресов ---------- */

function isSkyengHost(hostname) {
    return hostname.endsWith(".skyeng.ru")
        || hostname.endsWith(".skyeng.tech")
        || hostname === "skyeng.autofaq.ai";
}

function isSupportedTabUrl(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" && isSkyengHost(parsed.hostname);
    } catch {
        return false;
    }
}

function isValidSender(sender) {
    return isSupportedTabUrl(sender?.tab?.url);
}

function isAllowedUrl(urlString) {
    try {
        const parsed = new URL(urlString);
        return parsed.protocol === "https:" && ALLOWED_FETCH_ORIGINS.has(parsed.origin);
    } catch {
        return false;
    }
}

/* ---------- Общие помощники ---------- */

function getActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs?.[0] ?? null));
    });
}

function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
        if (tabId == null || tabId < 0) {
            resolve(null);
            return;
        }
        chrome.tabs.sendMessage(tabId, message, (response) => {
            resolve(chrome.runtime.lastError ? null : response);
        });
    });
}

/* Показывает тост во вкладке — чтобы ошибки фонового скрипта не терялись в консоли SW */
function notifyTab(tabId, text, type = "message") {
    return sendMessageToTab(tabId, { action: "notify", text, type });
}

function storageGet(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(result[key]);
        });
    });
}

function storageSet(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve();
        });
    });
}

function sessionGet(key) {
    if (!chrome.storage.session) return storageGet(key);
    return new Promise((resolve) => {
        chrome.storage.session.get([key], (result) => {
            resolve(chrome.runtime.lastError ? null : (result[key] ?? null));
        });
    });
}

function sessionSet(key, value) {
    if (!chrome.storage.session) return storageSet(key, value);
    return new Promise((resolve) => {
        chrome.storage.session.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) console.warn(chrome.runtime.lastError.message);
            resolve();
        });
    });
}

const digitsOnly = (text) => String(text ?? "").replace(/\D/g, "");
const openTab = (url) => chrome.tabs.create({ url });

/* ---------- Логирование ошибочных сетевых запросов ---------- */

chrome.webRequest.onCompleted.addListener((details) => {
    if (details.statusCode < 400 || details.statusCode > 599) return;
    /* FIX: раньше лог уходил в активную вкладку, а не в ту, где упал запрос */
    if (details.tabId >= 0) {
        sendMessageToTab(details.tabId, { message: "logRequest", details });
    }
}, { urls: SHOW_FOR_PAGES });

/* ---------- Контекстное меню: конфигурация ---------- */

const PAGE_MENU_ITEMS = [
    ["searchPaymentId", "💸 Поиск платежа"],
    ["balanceInfoId", "💰 Начислятор / 📑 Подписки"],
    ["certAndPromoId", "🧾 Сертификаты / 🎟 Промокоды"],
    ["openTTId", "📟 Timetable"],
    ["openCalendarId", "📆 Календарь (Datsy)"],
    ["makeCompensId", "💵 Компенсации"],
    ["openTalksAdminId", "💋 Админка Talks"],
    ["sendToDisasterId", "🆘 #dev-disaster"]
];

const SELECTION_MENU_ITEMS = [
    ["InfoID", "🔎 Info ID: %s"],
    ["LoginerLinkID", "🏡 Ссылка-логинер для ID: %s"],
    ["openCRMId", "🕵️‍♂️ Открыть CRM для ID: %s"],
    ["PartialPaymentId", "💳 Список рассрочек для ID: %s"],
    ["editAdminId", "🆔 Отредактировать в админке ID: %s"],
    ["serviceSkipId", "💨 ID Услуги Skip АП"],
    ["skipOnboardingId", "💨 ID Услуги Skip Onboarding"],
    ["openTRM2Id", "👨‍🏫 Открыть ТРМ2.0 ID: %s"],
    ["openGroupAdminId", "👩‍👧‍👧 Открыть админку группы: %s"],
    ["openByHashId", "♐ Открыть ТШ по хешу: %s"]
];

const LINK_MENU_ITEMS = [
    ["cancel1linebaseId", "🚫 Отмена ТП1Л (исход)"],
    ["cancel1linewithtextId", "💬 Написать ТП1Л (исход) со ссылкой"],
    ["cancel2linewithtextId", "💬 Написать 2ЛТП со ссылкой"],
    ["cancel2linebaseId", "🚫 Отмена 2ЛТП"]
];

const NUMERIC_SELECTION_IDS = SELECTION_MENU_ITEMS.map(([id]) => id).filter((id) => id !== "openByHashId");
const SELECTION_TYPES = new Set(["NUMERIC_SELECTION", "HASH_SELECTION", "OTHER_SELECTION"]);

function initContextMenus() {
    chrome.contextMenus.removeAll(() => {
        void chrome.runtime.lastError;

        chrome.contextMenus.create({ id: "mainoption", title: "Technical Support Master", documentUrlPatterns: SHOW_FOR_PAGES });
        for (const [id, title] of PAGE_MENU_ITEMS) {
            chrome.contextMenus.create({ id, title, contexts: ["page"], parentId: "mainoption" });
        }

        chrome.contextMenus.create({
            id: "selMainOption",
            title: "Technical Support Master",
            contexts: ["selection"],
            documentUrlPatterns: SHOW_FOR_PAGES,
            visible: false
        });
        for (const [id, title] of SELECTION_MENU_ITEMS) {
            chrome.contextMenus.create({ id, title, contexts: ["selection"], parentId: "selMainOption", visible: false });
        }

        chrome.contextMenus.create({
            id: "linkOption",
            title: "Technical Support Master",
            contexts: ["link"],
            documentUrlPatterns: SHOW_FOR_PAGES,
            targetUrlPatterns: TASK_LINK_PATTERNS
        });
        for (const [id, title] of LINK_MENU_ITEMS) {
            chrome.contextMenus.create({ id, title, contexts: ["link"], parentId: "linkOption", targetUrlPatterns: TASK_LINK_PATTERNS });
        }
    });
}

chrome.runtime.onInstalled.addListener(initContextMenus);

function setSelectionVisibility(visibleIds) {
    chrome.contextMenus.update("selMainOption", { visible: visibleIds.length > 0 }, () => void chrome.runtime.lastError);
    for (const [id] of SELECTION_MENU_ITEMS) {
        chrome.contextMenus.update(id, { visible: visibleIds.includes(id) }, () => void chrome.runtime.lastError);
    }
}

/* ---------- Mattermost ---------- */

async function getOperatorId() {
    const cached = await sessionGet("cachedOperatorId");
    if (cached) return cached;
    try {
        const stored = await storageGet("matermost_oid");
        if (stored) {
            await sessionSet("cachedOperatorId", stored);
            return stored;
        }
        const response = await fetch(MESSENGER_USER_URL, { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const { id } = await response.json();
        if (!id) throw new Error("пустой id пользователя");
        await storageSet("matermost_oid", id);
        await sessionSet("cachedOperatorId", id);
        return id;
    } catch (error) {
        console.error("[TSM] Не удалось получить ID оператора Mattermost:", error);
        return null;
    }
}

async function postToMessenger(message, channelId, rootId = "") {
    const userId = await getOperatorId();
    if (!userId) throw new Error("Не найден ID оператора в Mattermost — войдите в mm-time.skyeng.tech");

    const bodyData = { message, channel_id: channelId, pending_post_id: `${userId}:${Date.now()}`, user_id: userId };
    if (rootId) bodyData.root_id = rootId;

    const response = await fetch(MESSENGER_API_URL, {
        method: "POST",
        mode: "cors",
        credentials: "include",
        referrerPolicy: "no-referrer",
        headers: {
            "accept": "*/*",
            "accept-language": "ru",
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest"
        },
        body: JSON.stringify(bodyData)
    });
    if (!response.ok) throw new Error(`Mattermost ответил HTTP ${response.status}`);
    return response.json();
}

async function sendToSupportChannel(message, tabId) {
    await sessionSet("lastMessage", message);
    try {
        const post = await postToMessenger(message, CHANNEL_SUPPORT);
        if (post?.id) await transferToTSM(post.id, tabId);
    } catch (error) {
        console.error("[TSM] Ошибка отправки в #techsupport:", error);
        notifyTab(tabId, `Не удалось отправить в #techsupport: ${error.message}`, "error");
    }
}

async function transferToTSM(postId, tabId) {
    const lastChatId = await sessionGet("lastChatId");
    if (postId === lastChatId) return;
    await sessionSet("lastChatId", postId);
    await sendMessageToTab(tabId, { action: "CallMMComment", Chatid: postId });
}

/* ---------- Действия контекстного меню ---------- */

function copySkipLink(stage) {
    return (info, tab) => {
        const url = `https://student.skyeng.ru/product-stage?stage=${stage}&educationServiceId=${digitsOnly(info.selectionText)}`;
        sendMessageToTab(tab?.id, { action: "copyToClipboard", text: url });
    };
}

const PAGE_ACTIONS = {
    searchPaymentId: () => openTab("https://accounting.skyeng.ru/userpayment/search/transaction"),
    balanceInfoId: () => openTab("https://billing-api.skyeng.ru/operations"),
    certAndPromoId: () => openTab("https://billing-marketing.skyeng.ru/certificate/certSearch"),
    openTTId: () => openTab("https://timetable.skyeng.ru/"),
    openCalendarId: () => openTab("https://datsy.info/"),
    makeCompensId: () => openTab("https://billing-marketing.skyeng.ru/accrual-operations/create"),
    openTalksAdminId: () => openTab("https://vimbox.skyeng.ru/talks/admin/statistics"),
    sendToDisasterId: (info, tab) => sendToDisasterChannel(tab)
};

const SELECTION_ACTIONS = {
    InfoID: openUserInfo,
    LoginerLinkID: createLoginLink,
    openCRMId: (info) => openTab(`https://crm2.skyeng.ru/persons/${digitsOnly(info.selectionText)}`),
    PartialPaymentId: (info) => openTab(`https://accounting.skyeng.ru/credit/list?studentId=${digitsOnly(info.selectionText)}`),
    editAdminId: (info) => openTab(`https://id.skyeng.ru/admin/users/${digitsOnly(info.selectionText)}/update-contacts`),
    serviceSkipId: copySkipLink("auto-schedule"),
    skipOnboardingId: copySkipLink("onboarding"),
    openTRM2Id: (info) => openTab(`https://trm.skyeng.ru/teacher/${digitsOnly(info.selectionText)}`),
    openGroupAdminId: (info) => openTab(`https://learning-groups-storage.skyeng.ru/group/${digitsOnly(info.selectionText)}?cp=(section:participants)`),
    openByHashId: (info) => openTab(`https://video-trouble-shooter.skyeng.ru/?hash=${encodeURIComponent(info.selectionText.trim())}`)
};

const LINK_ACTIONS = {
    cancel1linebaseId: (info, tab) => sendToSupportChannel(`@techsupport-1line-crm2 ${info.linkUrl} Охрана - отмена 🚫`, tab?.id),
    cancel2linebaseId: (info, tab) => sendToSupportChannel(`@techsupport-2line ${info.linkUrl} Охрана - отмена 🚫`, tab?.id),
    cancel1linewithtextId: (info, tab) => sendCustomMessage(info, tab, "1line-crm2"),
    cancel2linewithtextId: (info, tab) => sendCustomMessage(info, tab, "2line")
};

const MENU_ACTIONS = { ...PAGE_ACTIONS, ...SELECTION_ACTIONS, ...LINK_ACTIONS };

chrome.contextMenus.onClicked.addListener((info, tab) => {
    MENU_ACTIONS[info.menuItemId]?.(info, tab);
});

function openUserInfo(info, tab) {
    if (!tab?.id) return;
    chrome.runtime.sendMessage(LASER_EXTENSION_ID, {
        messageValue: { message: "open-user-info", userId: digitsOnly(info.selectionText) },
        tabId: tab.id
    }, () => {
        if (chrome.runtime.lastError) {
            notifyTab(tab.id, "Расширение Laser не отвечает — проверьте, что оно установлено и включено", "error");
        }
    });
}

async function fetchCsrfToken(url) {
    try {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) return null;
        const html = await response.text();
        const match = html.match(/name="login_link_form\[_token\]"\s+value="([^"]+)"/i)
            || html.match(/id="login_link_form__token"\s+value="([^"]+)"/i);
        return match?.[1] ?? null;
    } catch {
        return null;
    }
}

function extractLoginLink(text) {
    const matches = text.match(/https:\/\/id\.skyeng\.ru\/auth\/login-link\/[A-Za-z0-9_-]+/g);
    return matches?.length ? matches[matches.length - 1] : null;
}

async function createLoginLink(info, tab) {
    const targetUserId = digitsOnly(info.selectionText);
    if (!tab?.id || !targetUserId) return;

    const formUrl = "https://id.skyeng.ru/admin/auth/login-links";
    try {
        const csrfToken = (await fetchCsrfToken(formUrl)) ?? "";
        const formBody = new URLSearchParams({
            "login_link_form[identity]": "",
            "login_link_form[id]": targetUserId,
            "login_link_form[target]": "https://vimbox.skyeng.ru",
            "login_link_form[promocode]": "",
            "login_link_form[lifetime]": "3600",
            "login_link_form[create]": "",
            "login_link_form[_token]": csrfToken
        });

        const res = await fetch(formUrl, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            referrer: formUrl,
            referrerPolicy: "strict-origin-when-cross-origin",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: formBody.toString()
        });

        const loginLink = extractLoginLink(await res.text());
        if (loginLink) {
            await sendMessageToTab(tab.id, { action: "copyToClipboard", text: loginLink, label: "Ссылка-логинер скопирована" });
        } else {
            notifyTab(tab.id, "Ссылка-логинер не создана — проверьте авторизацию в id.skyeng.ru", "error");
        }
    } catch (err) {
        console.error("[TSM] Ошибка запроса login-links:", err);
        notifyTab(tab.id, `Ошибка создания логинера: ${err.message}`, "error");
    }
}

async function sendCustomMessage(info, tab, recipient) {
    /* FIX: используем вкладку из события клика, а не «активную» — они могут не совпадать */
    const tabId = tab?.id;
    if (tabId == null) return;
    const response = await sendMessageToTab(tabId, { action: "showPromptDialog", linkUrl: info.linkUrl });
    if (response?.confirmed && response.textmsg) {
        await sendToSupportChannel(`@techsupport-${recipient} ${info.linkUrl} ${response.textmsg.trim()}`, tabId);
    }
}

async function sendToDisasterChannel(tab) {
    const target = tab?.id != null ? tab : await getActiveTab();
    if (!target?.id || !isSupportedTabUrl(target.url)) return;

    const response = await sendMessageToTab(target.id, { action: "showConfirmDialog" });
    if (!response?.confirmed) return;

    const textmsg = (response.textmsg || "").trim();
    if (textmsg.length <= 3) {
        notifyTab(target.id, "Сообщение не отправлено: текст слишком короткий", "error");
        return;
    }
    try {
        const post = await postToMessenger(`:alert: ${textmsg}`, CHANNEL_DEV);
        await postToMessenger(DISASTER_MENTIONS, CHANNEL_DEV, post.id);
        notifyTab(target.id, "🆘 Сообщение отправлено в #dev-disaster");
    } catch (error) {
        console.error("[TSM] Ошибка отправки в #dev-disaster:", error);
        notifyTab(target.id, `Не удалось отправить в #dev-disaster: ${error.message}`, "error");
    }
}

/* ---------- Единый обработчик сообщений от контент-скриптов ---------- */

async function readResponseTextBounded(response) {
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
        throw new Error("Ответ превышает лимит 5 МБ");
    }
    const text = await response.text();
    if (text.length > MAX_PAYLOAD_BYTES) throw new Error("Ответ превышает лимит 5 МБ");
    return text;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!isValidSender(sender)) return false;

    /* FIX: раньше любой запрос к прокси (без поля type) скрывал меню выделения */
    if (SELECTION_TYPES.has(request.type)) {
        if (request.type === "NUMERIC_SELECTION") setSelectionVisibility(NUMERIC_SELECTION_IDS);
        else if (request.type === "HASH_SELECTION") setSelectionVisibility(["openByHashId"]);
        else setSelectionVisibility([]);
        return false;
    }

    if (request.name === "Ctxt" && request.question === "sendResponse") {
        if (!isAllowedUrl(request.addr)) {
            sendResponse({ error: "Адрес не входит в белый список TSM" });
            return false;
        }
        (async () => {
            try {
                const response = await fetch(request.addr, request.options);
                sendResponse({ answer: await readResponseTextBounded(response), respName: request.respName });
            } catch (err) {
                sendResponse({ error: err.message });
            }
        })();
        return true;
    }

    if (request.action === "getOvercomeCORS") {
        if (!isAllowedUrl(request.fetchURL)) {
            sendResponse({ success: false, error: "Адрес не входит в белый список TSM" });
            return false;
        }
        (async () => {
            try {
                const response = await fetch(request.fetchURL, request.requestOptions);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}${response.statusText ? " " + response.statusText : ""} — проверьте авторизацию и повторите`);
                }
                const fetchAnswer = await readResponseTextBounded(response);
                /* fetchansver оставлен для обратной совместимости со старым кодом */
                sendResponse({ success: true, fetchAnswer, fetchansver: fetchAnswer });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }

    return false;
});
