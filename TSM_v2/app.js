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

let lastChatId = null;
let lastMessage = null;
let cachedOperatorId = null;

/* ---------- Логирование ошибочных сетевых запросов ---------- */

chrome.webRequest.onCompleted.addListener((details) => {
    if (details.statusCode >= 400 && details.statusCode <= 511) {
        getActiveTab().then((tab) => {
            if (tab) chrome.tabs.sendMessage(tab.id, { message: "logRequest", details });
        });
    }
}, { urls: ["<all_urls>"] });

/* ---------- Контекстное меню: конфигурация ---------- */

function upsertContextMenu(id, options) {
    chrome.contextMenus.remove(id, () => void chrome.runtime.lastError);
    chrome.contextMenus.create(options);
}

const PAGE_MENU_ITEMS = [
    ["searchPaymentId", "💸 Поиск платежа"],
    ["balanceInfoId", "💰 Начислятор / 📑 Подписки"],
    ["certAndPromoId", "🧾 Сертификаты / 🎟 Промокоды"],
    ["opentTTId", "📟 Timetable"],
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
    ["skpiOnboaringId", "💨 ID Услуги Skip Onboarding"],
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

upsertContextMenu("mainoption", { id: "mainoption", title: "Technical Support Master", documentUrlPatterns: SHOW_FOR_PAGES });
for (const [id, title] of PAGE_MENU_ITEMS) {
    upsertContextMenu(id, { id, title, contexts: ["page"], parentId: "mainoption" });
}

upsertContextMenu("selMainOption", { id: "selMainOption", title: "Technical Support Master", contexts: ["selection"], documentUrlPatterns: SHOW_FOR_PAGES, visible: false });
for (const [id, title] of SELECTION_MENU_ITEMS) {
    upsertContextMenu(id, { id, title, contexts: ["selection"], parentId: "selMainOption", visible: false });
}

upsertContextMenu("linkOption", { id: "linkOption", title: "Technical Support Master", contexts: ["link"], documentUrlPatterns: SHOW_FOR_PAGES, targetUrlPatterns: TASK_LINK_PATTERNS });
for (const [id, title] of LINK_MENU_ITEMS) {
    upsertContextMenu(id, { id, title, contexts: ["link"], parentId: "linkOption", targetUrlPatterns: TASK_LINK_PATTERNS });
}

function setSelectionVisibility(visibleIds) {
    chrome.contextMenus.update("selMainOption", { visible: visibleIds.length > 0 });
    for (const [id] of SELECTION_MENU_ITEMS) {
        chrome.contextMenus.update(id, { visible: visibleIds.includes(id) });
    }
}

chrome.runtime.onMessage.addListener((message) => {
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
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => resolve(tabs && tabs[0]));
    });
}

function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => chrome.tabs.sendMessage(tabId, message, resolve));
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

const digitsOnly = (text) => String(text ?? "").replace(/\D/g, "");
const openTab = (url) => chrome.tabs.create({ url: encodeURI(url) });

async function getOperatorId() {
    if (cachedOperatorId) return cachedOperatorId;
    try {
        const stored = await storageGet("matermost_oid");
        if (stored) {
            cachedOperatorId = stored;
            return cachedOperatorId;
        }
        const response = await fetch(MESSENGER_USER_URL);
        if (!response.ok) throw new Error("Failed to fetch user data.");
        const data = await response.json();
        cachedOperatorId = data.id;
        await storageSet("matermost_oid", data.id);
        return cachedOperatorId;
    } catch (error) {
        console.error("Error:", error);
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
    lastMessage = message;
    try {
        const post = await postToMessenger(message, CHANNEL_SUPPORT);
        transferToTSM(post.id);
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

function transferToTSM(chatId) {
    if (chatId === lastChatId) {
        sendToSupportChannel(lastMessage);
        return;
    }
    lastChatId = chatId;
    getActiveTab().then((tab) => {
        if (tab) chrome.tabs.sendMessage(tab.id, { action: "CallMMComment", Chatid: chatId });
    });
}

/* ---------- Действия контекстного меню ---------- */

const PAGE_ACTIONS = {
    searchPaymentId: () => openTab("https://accounting.skyeng.ru/userpayment/search/transaction"),
    balanceInfoId: () => openTab("https://billing-api.skyeng.ru/operations"),
    certAndPromoId: () => openTab("https://billing-marketing.skyeng.ru/certificate/certSearch"),
    opentTTId: () => openTab("https://timetable.skyeng.ru/"),
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
    skpiOnboaringId: copySkipLink("onboarding"),
    openTRM2Id: (info) => openTab(`https://trm.skyeng.ru/teacher/${digitsOnly(info.selectionText)}`),
    openGroupAdminId: (info) => openTab(`https://learning-groups-storage.skyeng.ru/group/${digitsOnly(info.selectionText)}?cp=(section:participants)`),
    openByHashId: (info) => openTab(`https://video-trouble-shooter.skyeng.ru/?hash=${encodeURIComponent(info.selectionText)}`)
};

function copySkipLink(stage) {
    return (info, tab) => {
        const url = `https://student.skyeng.ru/product-stage?stage=${stage}&educationServiceId=${digitsOnly(info.selectionText)}`;
        chrome.tabs.sendMessage(tab.id, { action: "copyToClipboard", text: url });
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
    chrome.runtime.sendMessage(LASER_EXTENSION_ID, {
        messageValue: { message: "open-user-info", userId: digitsOnly(info.selectionText) },
        tabId: tab.id
    });
}

function extractLoginLink(text) {
    const matches = text.match(/https:\/\/id\.skyeng\.ru\/auth\/login-link\/\S+/g);
    if (!matches || !matches.length) return null;
    return matches[matches.length - 1].replace(/["']+$/, "");
}

function createLoginLink(info, tab) {
    const csrfToken = null;
    fetch("https://id.skyeng.ru/admin/auth/login-links", {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        referrer: "https://id.skyeng.ru/admin/auth/login-links",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${digitsOnly(info.selectionText)}&login_link_form%5Btarget%5D=https%3A%2F%2Fvimbox.skyeng.ru&login_link_form%5Bpromocode%5D=&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=&login_link_form%5B_token%5D=${csrfToken}`,
        method: "POST",
        mode: "cors",
        credentials: "include"
    })
        .then((res) => res.text())
        .then((textHtml) => {
            const loginLink = extractLoginLink(textHtml);
            if (loginLink) {
                chrome.tabs.sendMessage(tab.id, { action: "copyToClipboard", text: loginLink });
            } else {
                console.error('Ссылка для входа не найдена');
            }
        });
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
        if (!tab) {
            console.error("Активная вкладка не найдена");
            return;
        }
        const response = await sendMessageToTab(tab.id, { action: "showPromptDialog", linkUrl: info.linkUrl });
        if (response && response.textmsg) {
            if (response.textmsg.length > 3) {
                await sendToSupportChannel(`@techsupport-${recipient} ${info.linkUrl} ${response.textmsg}`);
            } else {
                console.error("Текст слишком короткий");
            }
        } else {
            console.log("Нажата кнопка Отмена или текст пустой");
        }
    } catch (error) {
        console.error(error);
    }
}

async function sendToDisasterChannel() {
    await getOperatorId();
    const tab = await getActiveTab();
    if (!tab) return;
    const response = await sendMessageToTab(tab.id, { action: "showConfirmDialog" });
    if (!response || !response.confirmed) {
        console.log("Отправка сообщения отменена пользователем");
        return;
    }
    const textmsg = response.textmsg;
    if (!textmsg || textmsg.length <= 3) {
        console.error("Текст слишком короткий или пустой");
        return;
    }
    try {
        const post = await postToMessenger(`:alert: ${textmsg}`, CHANNEL_DEV);
        await postToMessenger("@techsupport-team @techsupport-leads @tech-curators @pk-chats @sos-inform-teachers @teacherscareteam @outbound-team-new @m-vhod @pm-team1 @premium-support @a-players @news", CHANNEL_DEV, post.id);
    } catch (error) {
        console.error("Ошибка при отправке сообщения: ", error);
    }
}

/* ---------- CORS-прокси для контент-скриптов ---------- */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.name === "Ctxt" && request.question === "sendResponse") {
        fetch(request.addr, request.options)
            .then((response) => response.text())
            .then((result) => sendResponse({ answer: result, respName: request.respName }));
        return true;
    }
    if (request.action === "getOvercomeCORS") {
        (async () => {
            try {
                const response = await fetch(request.fetchURL, request.requestOptions);
                if (!response.ok) {
                    throw new Error(`Network response was not ok (проверь авторизацию в CRM, после чего повтори попытку): ${response.status} ${response.statusText}`);
                }
                sendResponse({ success: true, fetchansver: await response.text() });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
});
