/* =========================================================
   TSM Background Service Worker — NEON GLASS ULTRA Refactored
   ========================================================= */

const Messanger_API_URL = "https://mm-time.skyeng.tech/api/v4/posts";
const OperId_API_URL = "https://mm-time.skyeng.tech/api/v4/users/me";
let MMostOperId = '';
const taskUrlPattern = "https://crm2.skyeng.ru/customer-support/task/*";
const personTaskUrlPattern = "https://crm2.skyeng.ru/persons/*/customer-support/task/*";
const ListTaskUrlPattern = "https://crm2.skyeng.ru/persons/*/customer-support/list";
const showForPages = ["*://skyeng.autofaq.ai/*", "*://*.skyeng.ru/*", "*://*.skyeng.tech/*"];
const ChanelDev = "hg8rcub4pfg3dcae8jxkwzkq9h";
const ChanelSupport = "pspyooisr3rd7qzx9as8uc96xc";
let lastChatId = null;
let lastMessage = null;

chrome.webRequest.onCompleted.addListener(
    function(details) {
        if ((details.statusCode >= 400) && (details.statusCode <= 511)) {
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, { message: 'logRequest', details: details });
                }
            });
        }
    },
    {urls: ["<all_urls>"]}
);

function createContextMenu(id, options) {
    chrome.contextMenus.remove(id, function () {
        if (chrome.runtime.lastError) {
            console.log(`Пункт меню с id=${id} не существует. Создаем новый.`);
        }
        chrome.contextMenus.create(options);
    });
}

createContextMenu("mainoption", { "id": "mainoption", "title": "Technical Support Master", "documentUrlPatterns": showForPages });
createContextMenu("searchPaymentId", { "id": "searchPaymentId", "title": "💸 Поиск платежа", "contexts": ["page"], "parentId": "mainoption" });
createContextMenu("balanceInfoId", { "id": "balanceInfoId", "title": "💰 Начислятор / 📑 Подписки", "contexts": ["page"], "parentId": "mainoption" });
createContextMenu("certAndPromoId", { "id": "certAndPromoId", "title": "🧾 Сертификаты / 🎟 Промокоды", "contexts": ["page"], "parentId": "mainoption" });
createContextMenu("opentTTId", { "id": "opentTTId", "title": "📟 Timetable", "contexts": ["page"], "parentId": "mainoption" });
createContextMenu("openCalendarId", { "id": "openCalendarId", "title": "📆 Календарь (Datsy)", "contexts": ["page"], "parentId": "mainoption" });
createContextMenu("makeCompensId", { "id": "makeCompensId", "title": "💵 Компенсации", "contexts": ["page"], "parentId": "mainoption" });
createContextMenu("openTalksAdminId", { "id": "openTalksAdminId", "title": "💋 Админка Talks", "contexts": ["page"], "parentId": "mainoption" });
createContextMenu("sendToDisasterId", { "id": "sendToDisasterId", "title": "🆘 #dev-disaster", "contexts": ["page"], "parentId": "mainoption" });

createContextMenu("selMainOption", { "id": "selMainOption", "title": "Technical Support Master", "contexts": ["selection"], "documentUrlPatterns": showForPages, "visible": false });
createContextMenu("InfoID", { "id": "InfoID", "title": "🔎Info ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });
createContextMenu("LoginerLinkID", { "id": "LoginerLinkID", "title": "🏡 Ссылка-логинер для ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });
createContextMenu("openCRMId", { "id": "openCRMId", "title": "🕵️‍♂️ Открыть CRM для ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });
createContextMenu("PartialPaymentId", { "id": "PartialPaymentId", "title": "💳 Список рассрочек для ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });
createContextMenu("editAdminId", { "id": "editAdminId", "title": "🆔 Отредактировать в админке ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });
createContextMenu("serviceSkipId", { "id": "serviceSkipId", "title": "💨 ID Услуги Skip АП", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });
createContextMenu("skpiOnboaringId", { "id": "skpiOnboaringId", "title": "💨 ID Услуги Skip Onboarding", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });
createContextMenu("openTRM2Id", { "id": "openTRM2Id", "title": "👨‍🏫 Открыть ТРМ2.0 ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });
createContextMenu("openGroupAdminId", { "id": "openGroupAdminId", "title": "👩‍👧‍👧 Открыть админку группы: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });

createContextMenu("openByHashId", { "id": "openByHashId", "title": "♐ Открыть ТШ по хешу: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false });

chrome.runtime.onMessage.addListener(function (message) {
    switch (message.type) {
        case 'NUMERIC_SELECTION':
            chrome.contextMenus.update("selMainOption", { visible: true });
            chrome.contextMenus.update("InfoID", { visible: true });
            chrome.contextMenus.update("LoginerLinkID", { visible: true });
            chrome.contextMenus.update("openCRMId", { visible: true });
            chrome.contextMenus.update("PartialPaymentId", { visible: true });
            chrome.contextMenus.update("editAdminId", { visible: true });
            chrome.contextMenus.update("serviceSkipId", { visible: true });
            chrome.contextMenus.update("skpiOnboaringId", { visible: true });
            chrome.contextMenus.update("openTRM2Id", { visible: true });
            chrome.contextMenus.update("openGroupAdminId", { visible: true });
            chrome.contextMenus.update("openByHashId", { visible: false });
            break;
        case 'HASH_SELECTION':
            chrome.contextMenus.update("selMainOption", { visible: true });
            chrome.contextMenus.update("openByHashId", { visible: true });
            chrome.contextMenus.update("InfoID", { visible: false });
            chrome.contextMenus.update("LoginerLinkID", { visible: false });
            chrome.contextMenus.update("openCRMId", { visible: false });
            chrome.contextMenus.update("PartialPaymentId", { visible: false });
            chrome.contextMenus.update("editAdminId", { visible: false });
            chrome.contextMenus.update("serviceSkipId", { visible: false });
            chrome.contextMenus.update("skpiOnboaringId", { visible: false });
            chrome.contextMenus.update("openTRM2Id", { visible: false });
            chrome.contextMenus.update("openGroupAdminId", { visible: false });
            break;
        default:
            chrome.contextMenus.update("selMainOption", { visible: false });
            chrome.contextMenus.update("InfoID", { visible: false });
            chrome.contextMenus.update("LoginerLinkID", { visible: false });
            chrome.contextMenus.update("openCRMId", { visible: false });
            chrome.contextMenus.update("PartialPaymentId", { visible: false });
            chrome.contextMenus.update("editAdminId", { visible: false });
            chrome.contextMenus.update("serviceSkipId", { visible: false });
            chrome.contextMenus.update("skpiOnboaringId", { visible: false });
            chrome.contextMenus.update("openTRM2Id", { visible: false });
            chrome.contextMenus.update("openGroupAdminId", { visible: false });
            chrome.contextMenus.update("openByHashId", { visible: false });
            break;
    }
});

createContextMenu("linkOption", { "id": "linkOption", "title": "Technical Support Master", "contexts": ["link"], "documentUrlPatterns": showForPages, "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern] });

createContextMenu("cancel1linebaseId", { "id": "cancel1linebaseId", "title": "🚫 Отмена ТП1Л (исход)", "contexts": ["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern] });
createContextMenu("cancel1linewithtextId", { "id": "cancel1linewithtextId", "title": "💬 Написать ТП1Л (исход) со ссылкой", "contexts": ["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern] });
createContextMenu("cancel2linewithtextId", { "id": "cancel2linewithtextId", "title": "💬 Написать 2ЛТП со ссылкой", "contexts": ["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern] });
createContextMenu("cancel2linebaseId", { "id": "cancel2linebaseId", "title": "🚫 Отмена 2ЛТП", "contexts": ["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern] });

const menuActions = {
    "searchPaymentId": searchpayment,
    "balanceInfoId": balanceinfo,
    "certAndPromoId": certandpromo,
    "opentTTId": opentt,
    "openCalendarId": opencalendar,
    "makeCompensId": makecompens,
    "openTalksAdminId": opentalksadm,
    "sendToDisasterId": sendtodisaster,
    "InfoID": openinfo,
    "LoginerLinkID": dologginer,
    "openCRMId": opencrmid,
    "PartialPaymentId": creditpayments,
    "editAdminId": editadmacc,
    "serviceSkipId": copytoskipap,
    "skpiOnboaringId": copytoskipob,
    "openTRM2Id": opentrm,
    "openGroupAdminId": openlgs,
    "openByHashId": opntshash,
    "cancel1linebaseId": cancelishodcall,
    "cancel1linewithtextId": sendCustomMessage1line,
    "cancel2linewithtextId": sendCustomMessage2line,
    "cancel2linebaseId": cancelsecondline
};

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (menuActions[info.menuItemId]) {
        menuActions[info.menuItemId](info, tab);
    }
});

function searchpayment(info, tab) {
    const createProperties = { url: encodeURI("https://accounting.skyeng.ru/userpayment/search/transaction") };
    chrome.tabs.create(createProperties);
}

function balanceinfo(info, tab) {
    const createProperties = { url: encodeURI("https://billing-api.skyeng.ru/operations") };
    chrome.tabs.create(createProperties);
}

function certandpromo(info, tab) {
    const createProperties = { url: encodeURI("https://billing-marketing.skyeng.ru/certificate/certSearch") };
    chrome.tabs.create(createProperties);
}

function opentt(info, tab) {
    const createProperties = { url: encodeURI("https://timetable.skyeng.ru/") };
    chrome.tabs.create(createProperties);
}

function opencalendar(info, tab) {
    const createProperties = { url: encodeURI("https://datsy.info/") };
    chrome.tabs.create(createProperties);
}

function makecompens(info, tab) {
    const createProperties = { url: encodeURI("https://billing-marketing.skyeng.ru/accrual-operations/create") };
    chrome.tabs.create(createProperties);
}

function opentalksadm(info, tab) {
    const createProperties = { url: encodeURI("https://vimbox.skyeng.ru/talks/admin/statistics") };
    chrome.tabs.create(createProperties);
}

async function sendtodisaster(info, tab) {
    if (!MMostOperId) {
        MMostOperId = await getMMostOperId();
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "showConfirmDialog" }, async function (response) {
            if (response && response.confirmed) {
                const textmsg = response.textmsg;
                if (!textmsg || textmsg.length <= 3) {
                    console.error("Текст слишком короткий или пустой");
                    return;
                }
                try {
                    let response = await sendFetchMessage(`:alert: ${textmsg}`, ChanelDev);
                    let tsresponse = response.id;
                    console.log(tsresponse);
                    await sendFetchMessage(`@techsupport-team @techsupport-leads @tech-curators @pk-chats @sos-inform-teachers @teacherscareteam @outbound-team-new @m-vhod @pm-team1 @premium-support @a-players @news`, ChanelDev, tsresponse);
                } catch (error) {
                    console.error("Ошибка при отправке сообщения: ", error);
                }
            } else {
                console.log("Отправка сообщения отменена пользователем");
            }
        });
    });
}

async function sendFetchMessage(message, channelId, rootId = "") {
    const headers = {
        "accept": "*/*",
        "accept-language": "ru",
        "content-type": "application/json",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
    };
    const bodyData = {
        "message": message,
        "channel_id": channelId,
        "pending_post_id": `${MMostOperId}:`,
        "user_id": MMostOperId
    };
    if (rootId) bodyData.root_id = rootId;
    const response = await fetch(Messanger_API_URL, {
        headers,
        "referrerPolicy": "no-referrer",
        "body": JSON.stringify(bodyData),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    return await response.json();
}

function openinfo(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    console.log(selid);
    const laserExtensionId = "kggpdmfnfmmkneemhknlojemcjmdlpjb";
    let messageValue = {
        message: 'open-user-info',
        userId: selid,
    };
    console.log(messageValue);
    let tabId = tab.id;
    console.log(tabId);
    const message = { messageValue, tabId };
    chrome.runtime.sendMessage(laserExtensionId, message);
}

function extractLoginLink(text) {
    const regex = /https:\/\/id\.skyeng\.ru\/auth\/login-link\/\S+/g;
    let matches = text.match(regex);
    if (matches && matches.length) {
        let lastMatch = matches[matches.length - 1];
        return lastMatch.replace(/["']+$/, '');
    }
    return null;
}

function dologginer(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    let tokenId = null;
    fetch("https://id.skyeng.ru/admin/auth/login-links", {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        referrer: "https://id.skyeng.ru/admin/auth/login-links",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${selid}&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru&login_link_form%5Bpromocode%5D=&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=&login_link_form%5B_token%5D=${tokenId}`,
        method: "POST",
        mode: "cors",
        credentials: "include"
    })
        .then(res => res.text())
        .then(textHtml => {
            const loginLink = extractLoginLink(textHtml);
            if (loginLink) {
                console.log(`Loginner: ${loginLink}`);
                chrome.tabs.sendMessage(tab.id, { action: "copyToClipboard", text: loginLink });
            } else {
                console.error('Ссылка для входа не найдена');
            }
        });
}

function opencrmid(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    const createProperties = { url: encodeURI("https://crm2.skyeng.ru/persons/" + selid) };
    chrome.tabs.create(createProperties);
}

function creditpayments(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    const createProperties = { url: encodeURI("https://accounting.skyeng.ru/credit/list?studentId=" + selid) };
    chrome.tabs.create(createProperties);
}

function editadmacc(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    const createProperties = { url: encodeURI("https://id.skyeng.ru/admin/users/" + selid + "/update-contacts") };
    chrome.tabs.create(createProperties);
}

function copytoskipap(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    let textToCopy = "https://student.skyeng.ru/product-stage?stage=auto-schedule&educationServiceId=" + selid;
    chrome.tabs.sendMessage(tab.id, { action: "copyToClipboard", text: textToCopy });
}

function copytoskipob(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    let textToCopy = "https://student.skyeng.ru/product-stage?stage=onboarding&educationServiceId=" + selid;
    chrome.tabs.sendMessage(tab.id, { action: "copyToClipboard", text: textToCopy });
}

function opentrm(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    const createProperties = { url: encodeURI("https://trm.skyeng.ru/teacher/" + selid) };
    chrome.tabs.create(createProperties);
}

function openlgs(info, tab) {
    let selid = info.selectionText.replace(/\D/g, '');
    const createProperties = { url: encodeURI("https://learning-groups-storage.skyeng.ru/group/" + selid + "?cp=(section:participants)") };
    chrome.tabs.create(createProperties);
}

function opntshash(info, tab) {
    const createProperties = { url: encodeURI("https://video-trouble-shooter.skyeng.ru/?hash=" + info.selectionText) };
    chrome.tabs.create(createProperties);
}

async function cancelishodcall(info, tab) {
    MMostOperId = await getMMostOperId();
    if (MMostOperId) {
        const message = `@techsupport-1line-crm2 ${info.linkUrl} Охрана - отмена 🚫`;
        sendMattermostMessage(message);
    }
}

async function sendCustomMessage(info, tab, recipient) {
    try {
        const MMostOperId = await getMMostOperId();
        if (!MMostOperId) {
            console.error("MMostOperId не найден");
            return;
        }
        const activeTab = await getActiveTab();
        if (!activeTab) {
            console.error("Активная вкладка не найдена");
            return;
        }
        const response = await sendMessageToTab(activeTab.id, {
            action: "showPromptDialog",
            linkUrl: info.linkUrl,
        });
        if (response && response.textmsg) {
            if (response.textmsg.length > 3) {
                const message = `@techsupport-${recipient} ${info.linkUrl} ${response.textmsg}`;
                sendMattermostMessage(message);
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

function sendCustomMessage1line(info, tab) {
    sendCustomMessage(info, tab, "1line-crm2");
}

function sendCustomMessage2line(info, tab) {
    sendCustomMessage(info, tab, "2line");
}

async function getActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs && tabs[0]);
        });
    });
}

async function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            resolve(response);
        });
    });
}

async function cancelsecondline(info, tab) {
    MMostOperId = await getMMostOperId();
    MMostOperId = await getMMostOperId();
    if (MMostOperId) {
        const message = `@techsupport-2line ${info.linkUrl} Охрана - отмена 🚫`;
        sendMattermostMessage(message);
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.name === "Ctxt") {
        if (request.question == 'sendResponse') {
            fetch(request.addr, request.options)
                .then(response => response.text())
                .then(result => { sendResponse({ answer: result, respName: request.respName }) });
            return true;
        }
    }
    if (request.action === 'getOvercomeCORS') {
        const url = request.fetchURL;
        const requestOptions = request.requestOptions;
        (async () => {
            try {
                const response = await fetch(url, requestOptions);
                if (!response.ok) {
                    throw new Error('Network response was not ok (проверь авторизацию в CRM, после чего повтори попытку): ' + response.status + " " + response.statusText);
                }
                const text = await response.text();
                sendResponse({ success: true, fetchansver: text });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true;
    }
});

async function getMMostOperId() {
    try {
        const MMostOperId = await new Promise((resolve, reject) => {
            chrome.storage.local.get(['matermost_oid'], function (result) {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                resolve(result.matermost_oid);
            });
        });
        if (MMostOperId) {
            return MMostOperId;
        } else {
            const response = await fetch(OperId_API_URL);
            if (!response.ok) throw new Error("Failed to fetch user data.");
            const data = await response.json();
            const newMMostOperId = data.id;
            await new Promise((resolve, reject) => {
                chrome.storage.local.set({ 'matermost_oid': newMMostOperId }, function () {
                    if (chrome.runtime.lastError) {
                        return reject(chrome.runtime.lastError);
                    }
                    resolve();
                });
            });
            return newMMostOperId;
        }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

function sendMattermostMessage(message) {
    lastMessage = message;
    let bodyData = {
        message: message,
        channel_id: ChanelSupport,
        pending_post_id: `${MMostOperId}:`,
        user_id: MMostOperId
    };
    fetch(Messanger_API_URL, {
        "headers": {
            "accept": "*/*",
            "accept-language": "ru",
            "content-type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest"
        },
        "referrerPolicy": "no-referrer",
        "body": JSON.stringify(bodyData),
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    })
        .then(response => response.json())
        .then(data => {
            transfertoTSM(data.id);
        })
        .catch(error => {
            console.error("Ошибка:", error);
        });
}

function transfertoTSM(Chatid) {
    if (Chatid === lastChatId) {
        sendMattermostMessage(lastMessage);
        return;
    }
    lastChatId = Chatid;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            chrome.tabs.sendMessage(activeTab.id, { action: "CallMMComment", Chatid: Chatid });
        }
    });
}
