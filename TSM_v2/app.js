// src/app.js

/* =========================================================
   TSM Background Service Worker
   ========================================================= */

const MESSENGER_API_URL = "https://mm-time.skyeng.tech/api/v4/posts";
const MESSENGER_USER_URL = "https://mm-time.skyeng.tech/api/v4/users/me";
const LASER_EXTENSION_ID = "kggpdmfnfmmkneemhknlojemcjmdlpjb";
const CHANNEL_DEV = "hg8rcub4pfg3dcae8jxkwzkq9h";
const CHANNEL_SUPPORT = "pspyooisr3rd7qzx9as8uc96xc";

const TASK_LINK_PATTERNS = [
    "https://crm2.skyeng.ru/customer-support/task/*",
    "https://crm2.skyeng.ru/persons/*/customer-support/task/*",
    "https://crm2.skyeng.ru/persons/*/customer-support/list"
];
const SHOW_FOR_PAGES = ["*://skyeng.autofaq.ai/*", "*://*.skyeng.ru/*", "*://*.skyeng.tech/*"];

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
    "https://skyeng.autofaq.ai",
    "https://mm-time.skyeng.tech"
]);

const MAX_PAYLOAD_BYTES = 5 * 1024 * 1024;

function isAllowedUrl(urlString) {
    try {
        const parsed = new URL(urlString);
        return parsed.protocol === "https:" && ALLOWED_FETCH_ORIGINS.has(parsed.origin);
    } catch {
        return false;
    }
}

function isValidSender(sender) {
    if (!sender?.tab?.url) return false;
    try {
        const senderUrl = new URL(sender.tab.url);
        return (
            senderUrl.protocol === "https:" &&
            (senderUrl.hostname.endsWith(".skyeng.ru") ||
             senderUrl.hostname.endsWith(".skyeng.tech") ||
             senderUrl.hostname === "skyeng.autofaq.ai")
        );
    } catch {
        return false;
    }
}

function isSupportedTabUrl(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return (
            parsed.protocol === "https:" &&
            (parsed.hostname.endsWith(".skyeng.ru") ||
             parsed.hostname.endsWith(".skyeng.tech") ||
             parsed.hostname === "skyeng.autofaq.ai")
        );
    } catch {
        return false;
    }
}

/* ---------- Логирование ошибочных сетевых запросов ---------- */

chrome.webRequest.onCompleted.addListener((details) => {
    if (details.statusCode >= 400 && details.statusCode <= 511) {
        getActiveTab().then((tab) => {
            if (tab?.id && isSupportedTabUrl(tab.url)) {
                sendMessageToTab(tab.id, { message: "logRequest", details }).catch(() => {});
            }
        });
    }
}, {
    urls: [
        "*://*.skyeng.ru/*",
        "*://*.skyeng.tech/*",
        "*://skyeng.autofaq.ai/*"
    ]
});

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
    ["InfoID", "🔎Info ID: %s"],
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


function initContextMenus() {
    chrome.contextMenus.removeAll(() => {
        if (chrome.runtime.lastError) {
            console.warn("ContextMenus clear error:", chrome.runtime.lastError.message);
        }

        chrome.contextMenus.create({
            id: "mainoption",
            title: "Technical Support Master",
            documentUrlPatterns: SHOW_FOR_PAGES
        });

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

chrome.runtime.onInstalled.addListener(() => {
    initContextMenus();
});

function setSelectionVisibility(visibleIds) {
    chrome.contextMenus.update("selMainOption", { visible: visibleIds.length > 0 }, () => void chrome.runtime.lastError);
    for (const [id] of SELECTION_MENU_ITEMS) {
        chrome.contextMenus.update(id, { visible: visibleIds.includes(id) }, () => void chrome.runtime.lastError);
    }
}

chrome.runtime.onMessage.addListener((message, sender) => {
    if (!isValidSender(sender)) return;

    switch (message.type) {
        case "NUMERIC_SELECTION":
            setSelectionVisibility(NUMERIC_SELECTION_IDS);
            break;
        case "HASH_SELECTION":
            setSelectionVisibility(["openByHashId"]);
            break;
        default:
            setSelectionVisibility([]);
    }
});

/* ---------- Общие помощники ---------- */

function getActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs?.[0] ?? null));
    });
}

function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                resolve(null);
            } else {
                resolve(response);
            }
        });
    });
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

async function sessionGet(key) {
    if (!chrome.storage.session) return storageGet(key);
    return new Promise((resolve) => {
        chrome.storage.session.get([key], (result) => {
            if (chrome.runtime.lastError) resolve(null);
            else resolve(result[key] ?? null);
        });
    });
}

async function sessionSet(key, value) {
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

async function getOperatorId() {
    const cached = await sessionGet("cachedOperatorId");
    if (cached) return cached;

    try {
        const stored = await storageGet("matermost_oid");
        if (stored) {
            await sessionSet("cachedOperatorId", stored);
            return stored;
        }
        const response = await fetch(MESSENGER_USER_URL);
        if (!response.ok) throw new Error("Failed to fetch user data.");
        const data = await response.json();
        const opId = data.id;
        await storageSet("matermost_oid", opId);
        await sessionSet("cachedOperatorId", opId);
        return opId;
    } catch (error) {
        console.error("Error getting operator ID:", error);
        return null;
    }
}

/* ---------- Mattermost ---------- */

const MM_HEADERS = {
    "accept": "*/*",
    "accept-language": "ru",
    "content-type": "application/json",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest"
};

async function postToMessenger(message, channelId, rootId = "") {
    const userId = await getOperatorId();
    if (!userId) throw new Error("MMostOperId не найден");
    const bodyData = { message, channel_id: channelId, pending_post_id: `${userId}:`, user_id: userId };
    if (rootId) bodyData.root_id = rootId;
    const response = await fetch(MESSENGER_API_URL, {
        headers: MM_HEADERS,
        referrerPolicy: "no-referrer",
        body: JSON.stringify(bodyData),
        method: "POST",
        mode: "cors",
        credentials: "include"
    });
    return response.json();
}

async function sendToSupportChannel(message) {
    await sessionSet("lastMessage", message);
    try {
        const post = await postToMessenger(message, CHANNEL_SUPPORT);
        if (post?.id) {
            await transferToTSM(post.id);
        }
    } catch (error) {
        console.error("Ошибка при отправке в саппорт канал:", error);
    }
}

async function transferToTSM(chatId) {
    const lastChatId = await sessionGet("lastChatId");
    if (chatId === lastChatId) {
        return;
    }
    await sessionSet("lastChatId", chatId);
    const tab = await getActiveTab();
    if (tab?.id && isSupportedTabUrl(tab.url)) {
        await sendMessageToTab(tab.id, { action: "CallMMComment", Chatid: chatId });
    }
}

/* ---------- Действия контекстного меню ---------- */

const PAGE_ACTIONS = {
    searchPaymentId: () => openTab("https://accounting.skyeng.ru/userpayment/search/transaction"),
    balanceInfoId: () => openTab("https://billing-api.skyeng.ru/operations"),
    certAndPromoId: () => openTab("https://billing-marketing.skyeng.ru/certificate/certSearch"),
    openTTId: () => openTab("https://timetable.skyeng.ru/"),
    openCalendarId: () => openTab("https://datsy.info/"),
    makeCompensId: () => openTab("https://billing-marketing.skyeng.ru/accrual-operations/create"),
    openTalksAdminId: () => openTab("https://vimbox.skyeng.ru/talks/admin/statistics"),
    sendToDisasterId: () => sendToDisasterChannel()
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
    openByHashId: (info) => openTab(`https://video-trouble-shooter.skyeng.ru/?hash=${encodeURIComponent(info.selectionText)}`)
};

function copySkipLink(stage) {
    return (info, tab) => {
        if (!tab?.id) return;
        const url = `https://student.skyeng.ru/product-stage?stage=${stage}&educationServiceId=${digitsOnly(info.selectionText)}`;
        sendMessageToTab(tab.id, { action: "copyToClipboard", text: url }).catch(() => {});
    };
}

const LINK_ACTIONS = {
    cancel1linebaseId: cancelOutgoingCall,
    cancel1linewithtextId: (info) => sendCustomMessage(info, "1line-crm2"),
    cancel2linewithtextId: (info) => sendCustomMessage(info, "2line"),
    cancel2linebaseId: cancelSecondLine
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
    }, () => void chrome.runtime.lastError);
}

async function fetchCsrfToken(url) {
    try {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) return null;
        const html = await response.text();
        const tokenMatch = html.match(/name="login_link_form\[_token\]"\s+value="([^"]+)"/i)
            || html.match(/id="login_link_form__token"\s+value="([^"]+)"/i);
        return tokenMatch?.[1] ?? null;
    } catch {
        return null;
    }
}

function extractLoginLink(text) {
    const matches = text.match(/https:\/\/id\.skyeng\.ru\/auth\/login-link\/[A-Za-z0-9_-]+/g);
    if (!matches || !matches.length) return null;
    return matches[matches.length - 1];
}

async function createLoginLink(info, tab) {
    if (!tab?.id) return;
    const targetUserId = digitsOnly(info.selectionText);
    if (!targetUserId) return;

    try {
        const formUrl = "https://id.skyeng.ru/admin/auth/login-links";
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
            headers: { "content-type": "application/x-www-form-urlencoded" },
            referrer: formUrl,
            referrerPolicy: "strict-origin-when-cross-origin",
            body: formBody.toString(),
            method: "POST",
            mode: "cors",
            credentials: "include"
        });

        const textHtml = await res.text();
        const loginLink = extractLoginLink(textHtml);
        if (loginLink) {
            await sendMessageToTab(tab.id, { action: "copyToClipboard", text: loginLink });
        } else {
            console.error("Ссылка для входа не найдена");
        }
    } catch (err) {
        console.error("Ошибка запроса login-links:", err);
    }
}

async function cancelOutgoingCall(info) {
    const operatorId = await getOperatorId();
    if (operatorId) await sendToSupportChannel(`@techsupport-1line-crm2 ${info.linkUrl} Охрана - отмена 🚫`);
}

async function cancelSecondLine(info) {
    const operatorId = await getOperatorId();
    if (operatorId) await sendToSupportChannel(`@techsupport-2line ${info.linkUrl} Охрана - отмена 🚫`);
}

async function sendCustomMessage(info, recipient) {
    try {
        const operatorId = await getOperatorId();
        if (!operatorId) {
            console.error("MMostOperId не найден");
            return;
        }
        const tab = await getActiveTab();
        if (!tab?.id || !isSupportedTabUrl(tab.url)) {
            console.error("Активная поддерживаемая вкладка не найдена");
            return;
        }
        const response = await sendMessageToTab(tab.id, { action: "showPromptDialog", linkUrl: info.linkUrl });
        if (response?.textmsg) {
            if (response.textmsg.length > 3) {
                await sendToSupportChannel(`@techsupport-${recipient} ${info.linkUrl} ${response.textmsg}`);
            } else {
                console.error("Текст слишком короткий");
            }
        }
    } catch (error) {
        console.error("sendCustomMessage error:", error);
    }
}

async function sendToDisasterChannel() {
    await getOperatorId();
    const tab = await getActiveTab();
    if (!tab?.id || !isSupportedTabUrl(tab.url)) return;
    const response = await sendMessageToTab(tab.id, { action: "showConfirmDialog" });
    if (!response?.confirmed) return;

    const textmsg = response.textmsg;
    if (!textmsg || textmsg.length <= 3) {
        console.error("Текст слишком короткий или пустой");
        return;
    }
    try {
        const post = await postToMessenger(`:alert: ${textmsg}`, CHANNEL_DEV);
        await postToMessenger("@techsupport-team @techsupport-leads @tech-curators @pk-chats @sos-inform-teachers @teacherscareteam @outbound-team-new @m-vhod @pm-team1 @premium-support @a-players @news", CHANNEL_DEV, post.id);
    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
    }
}

/* ---------- CORS-прокси для контент-скриптов ---------- */

async function readResponseTextBounded(response) {
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
        throw new Error("Payload exceeds allowed 5MB limit");
    }
    const text = await response.text();
    if (text.length > MAX_PAYLOAD_BYTES) {
        throw new Error("Payload exceeds allowed 5MB limit");
    }
    return text;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!isValidSender(sender)) {
        return false;
    }

    if (request.name === "Ctxt" && request.question === "sendResponse") {
        if (!isAllowedUrl(request.addr)) {
            sendResponse({ error: "Disallowed destination URL" });
            return false;
        }

        (async () => {
            try {
                const response = await fetch(request.addr, request.options);
                const result = await readResponseTextBounded(response);
                sendResponse({ answer: result, respName: request.respName });
            } catch (err) {
                sendResponse({ error: err.message });
            }
        })();
        return true;
    }

    if (request.action === "getOvercomeCORS") {
        if (!isAllowedUrl(request.fetchURL)) {
            sendResponse({ success: false, error: "Disallowed destination URL" });
            return false;
        }

        (async () => {
            try {
                const response = await fetch(request.fetchURL, request.requestOptions);
                if (!response.ok) {
                    throw new Error(`Network response was not ok (проверь авторизацию в CRM, после чего повтори попытку): ${response.status} ${response.statusText}`);
                }
                const fetchAnswer = await readResponseTextBounded(response);
                sendResponse({ success: true, fetchAnswer, fetchansver: fetchAnswer });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
});
