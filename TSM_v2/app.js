const Messanger_API_URL = "https://mm-time.skyeng.tech/api/v4/posts";
const OperId_API_URL = "https://mm-time.skyeng.tech/api/v4/users/me";
let MMostOperId ='';
const taskUrlPattern = "https://crm2.skyeng.ru/customer-support/task/*";
const personTaskUrlPattern = "https://crm2.skyeng.ru/persons/*/customer-support/task/*";
const ListTaskUrlPattern = "https://crm2.skyeng.ru/persons/*/customer-support/list";
const showForPages = ["*://skyeng.autofaq.ai/*", "*://vimbox.skyeng.ru/*", "*://new-teachers.skyeng.ru/*", "*://teachers.skyeng.ru/*", "*://student.skyeng.ru/*", "*://ttc.skyeng.ru/*"];
const ChanelDev = "hg8rcub4pfg3dcae8jxkwzkq9h";
const ChanelSupport = "pspyooisr3rd7qzx9as8uc96xc";
let lastChatId = null; // Глобальная переменная для хранения последнего chatid
let lastMessage = null; // Глобальная переменная для хранения последнего сообщения

function createContextMenu(id, options) {
    chrome.contextMenus.remove(id, function() {
        if (chrome.runtime.lastError) {
            console.log(`Пункт меню с id=${id} не существует. Создаем новый.`);
        }
        chrome.contextMenus.create(options);
    });
}

createContextMenu("mainoption", {"id":"mainoption","title": "Technical Support Master", "documentUrlPatterns":showForPages});
createContextMenu("searchPaymentId", {"id": "searchPaymentId", "title": "💸 Поиск платежа", "contexts":["page"], "parentId": "mainoption"});
createContextMenu("balanceInfoId", {"id": "balanceInfoId", "title": "💰 Начислятор / 📑 Подписки", "contexts":["page"], "parentId": "mainoption"});
createContextMenu("certAndPromoId", {"id": "certAndPromoId", "title": "🧾 Сертификаты / 🎟 Промокоды", "contexts":["page"], "parentId": "mainoption"});
createContextMenu("opentTTId", {"id": "opentTTId", "title": "📟 Timetable", "contexts":["page"], "parentId": "mainoption"});
createContextMenu("openCalendarId", {"id": "openCalendarId", "title": "📆 Календарь (Datsy)", "contexts":["page"], "parentId": "mainoption"});
createContextMenu("makeCompensId", {"id": "makeCompensId", "title": "💵 Компенсации", "contexts":["page"], "parentId": "mainoption"});
createContextMenu("openTalksAdminId", {"id": "openTalksAdminId", "title": "💋 Админка Talks", "contexts":["page"], "parentId": "mainoption"});
createContextMenu("sendToDisasterId", {"id": "sendToDisasterId", "title": "🆘 #dev-disaster", "contexts":["page"], "parentId": "mainoption"});

createContextMenu("selMainOption",{"id":"selMainOption","title": "Technical Support Master", "contexts":["selection"], "documentUrlPatterns":showForPages, "visible": false});
createContextMenu("InfoID", {"id": "InfoID", "title": "🔎Info ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});
createContextMenu("LoginerLinkID", {"id": "LoginerLinkID", "title": "🏡 Ссылка-логинер для ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});
createContextMenu("openCRMId", {"id": "openCRMId", "title": "🕵️‍♂️ Открыть CRM для ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});
createContextMenu("PartialPaymentId", {"id": "PartialPaymentId", "title": "💳 Список рассрочек для ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});
createContextMenu("editAdminId", {"id": "editAdminId", "title": "🆔 Отредактировать в админке ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});
createContextMenu("serviceSkipId", {"id": "serviceSkipId", "title": "💨 ID Услуги Skip АП", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});
createContextMenu("skpiOnboaringId", {"id": "skpiOnboaringId", "title": "💨 ID Услуги Skip Onboarding", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});
createContextMenu("openTRM2Id", {"id": "openTRM2Id", "title": "👨‍🏫 Открыть ТРМ2.0 ID: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});
createContextMenu("openGroupAdminId", {"id": "openGroupAdminId", "title": "👩‍👧‍👧 Открыть админку группы: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});

createContextMenu("openByHashId",{"id": "openByHashId", "title": "♐ Открыть ТШ по хешу: %s", "contexts": ["selection"], "parentId": "selMainOption", "visible": false});

chrome.runtime.onMessage.addListener(function(message) {
    switch (message.type) {
        case 'NUMERIC_SELECTION':
            chrome.contextMenus.update(selmain, {visible: true});
            chrome.contextMenus.update("InfoID", {visible: true});
            chrome.contextMenus.update("LoginerLinkID", {visible: true});
            chrome.contextMenus.update("openCRMId", {visible: true});
            chrome.contextMenus.update("PartialPaymentId", {visible: true});
            chrome.contextMenus.update("editAdminId", {visible: true});
            chrome.contextMenus.update("serviceSkipId", {visible: true});
            chrome.contextMenus.update("skpiOnboaringId", {visible: true});
            chrome.contextMenus.update("openTRM2Id", {visible: true});
            chrome.contextMenus.update("openGroupAdminId", {visible: true});
            chrome.contextMenus.update(hashMenuId, {visible: false});
            break;
        case 'HASH_SELECTION':
            chrome.contextMenus.update(selmain, {visible: true});
            chrome.contextMenus.update(hashMenuId, {visible: true});
            chrome.contextMenus.update("InfoID", {visible: false});
            chrome.contextMenus.update("LoginerLinkID", {visible: false});
            chrome.contextMenus.update("openCRMId", {visible: false});
            chrome.contextMenus.update("PartialPaymentId", {visible: false});
            chrome.contextMenus.update("editAdminId", {visible: false});
            chrome.contextMenus.update("serviceSkipId", {visible: false});
            chrome.contextMenus.update("skpiOnboaringId", {visible: false});
            chrome.contextMenus.update("openTRM2Id", {visible: false});
            chrome.contextMenus.update("openGroupAdminId", {visible: false});
            break;
        default:
            chrome.contextMenus.update(selmain, {visible: false});
            chrome.contextMenus.update("InfoID", {visible: false});
            chrome.contextMenus.update("LoginerLinkID", {visible: false});
            chrome.contextMenus.update("openCRMId", {visible: false});
            chrome.contextMenus.update("PartialPaymentId", {visible: false});
            chrome.contextMenus.update("editAdminId", {visible: false});
            chrome.contextMenus.update("serviceSkipId", {visible: false});
            chrome.contextMenus.update("skpiOnboaringId", {visible: false});
            chrome.contextMenus.update("openTRM2Id", {visible: false});
            chrome.contextMenus.update("openGroupAdminId", {visible: false});
            chrome.contextMenus.update(hashMenuId, {visible: false});
            break;
    }
});

createContextMenu("linkOption", {"id":"linkOption","title": "Technical Support Master", "contexts":["link"], "documentUrlPatterns":showForPages, "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern]} ); // обьявляем контекстное меню при выделении текста отвечает свойство selection

createContextMenu("cancel1linebaseId", {"id": "cancel1linebaseId", "title": "🚫 Отмена ТП1Л (исход)", "contexts":["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern]}); //опция для копирования ссылки для test msg
createContextMenu("cancel1linewithtextId", {"id": "cancel1linewithtextId", "title": "💬 Написать ТП1Л (исход) со ссылкой", "contexts":["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern]}); //опция для копирования ссылки для test msg
createContextMenu("cancel2linewithtextId", {"id": "cancel2linewithtextId", "title": "💬 Написать 2ЛТП со ссылкой", "contexts":["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern]}); //опция для копирования ссылки для test msg
createContextMenu("cancel2linebaseId", {"id": "cancel2linebaseId", "title": "🚫 Отмена 2ЛТП", "contexts":["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, ListTaskUrlPattern]}); //опция для копирования ссылки для test msg

// Обработка кликов
chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch(info.menuItemId) {
        case "searchPaymentId":
            searchpayment(info, tab);
            break;
        case "balanceInfoId":
            balanceinfo(info, tab);
            break;
		case "certAndPromoId":
			certandpromo(info, tab);
			break;	
		case "opentTTId":
			certandpromo(info, tab);
			break;
		case "openCalendarId":
			opencalendar(info, tab);
			break;
		case "makeCompensId":
			makecompens(info, tab);
			break;
		case "openTalksAdminId":
			opentalksadm(info, tab);
			break;
		case "sendToDisasterId":
			sendtodisaster(info, tab);
			break;	
		case "InfoID":
			openinfo(info, tab);
			break;
		case "LoginerLinkID":
			dologginer(info, tab);
			break;
		case "openCRMId":
			opencrmid(info, tab);
			break;
		case "PartialPaymentId":
			creditpayments(info, tab);
			break;
		case "editAdminId":
			editadmacc(info, tab);
			break;	
		case "serviceSkipId":
			copytoskipap(info, tab);
			break;	
		case "skpiOnboaringId":
			copytoskipob(info, tab);
			break;
		case "openTRM2Id":
			opentrm(info, tab);
			break;	
		case "openGroupAdminId":
			openlgs(info, tab);
			break;	
		case "openByHashId":
			opntshash(info, tab);
			break;
		case "cancel1linebaseId":
			cancelishodcall(info, tab);
			break;	
		case "cancel1linewithtextId":
			sendtestmsgcustommsg(info, tab);
			break;
		case "cancel2linebaseId":
			cancelsecondline(info, tab);
			break;	
		case "cancel2linewithtextId":
			send2ndlinetestmsgcustommsg(info, tab);
			break;

    }
});

// Функции для обработки действий
function searchpayment(info, tab) { //опция открывает поиск платежа
    const createProperties = {url: encodeURI("https://accounting.skyeng.ru/userpayment/search/transaction")};
    chrome.tabs.create(createProperties);
}

function balanceinfo(info, tab) { //опция открывает раздел Начислятор для просмотра баланса
    const createProperties = {url: encodeURI("https://billing-api.skyeng.ru/operations")};
    chrome.tabs.create(createProperties);
}

function certandpromo(info, tab){ //опция открывает раздел с сертификатом и промокодами
	const createProperties = {url: encodeURI("https://billing-marketing.skyeng.ru/certificate/certSearch")};
	chrome.tabs.create(createProperties);
}

function opentt(info, tab){ // опция открывает раздел Timetable
	const createProperties = {url: encodeURI("https://timetable.skyeng.ru/")};
	chrome.tabs.create(createProperties);
}

function opencalendar(info, tab){ // опция открывает datsy.info
	const createProperties = {url: encodeURI("https://datsy.info/")};
	chrome.tabs.create(createProperties);
}

function makecompens(info, tab){ // опция открывает сайт с созданием компенсации
	const createProperties = {url: encodeURI("https://billing-marketing.skyeng.ru/accrual-operations/create")};
	chrome.tabs.create(createProperties);
}

function opentalksadm(info, tab){ // опция открывает админку Talks
	const createProperties = {url: encodeURI("https://vimbox.skyeng.ru/talks/admin/statistics")};
	chrome.tabs.create(createProperties);
}

async function sendtodisaster(info, tab){ // опция отправляет сообщение в дизастер канал
   if (!MMostOperId) { 
        MMostOperId = await getMMostOperId();
    }

    let answersend = confirm("Вы уверены, что хотите пробудить Древнее Зло и воззвать к команде Фиксиков для исправления катаклизма на платформе?\nОК - Для продолжения. Отмена закрыть форму.");
    if (!answersend) return console.log("Не уверен, жаль, повезет в другой раз!");

    const textmsg = prompt('Введите ваш текст в это поле');
    if (!textmsg || textmsg.length <= 3) {
        return alert("Текст слишком короткий или пустой");
    }

    try {
        let response = await sendFetchMessage(`:allert: ${textmsg}`, ChanelDev);
        let tsresponse = response.id;
        console.log(tsresponse);

        await sendFetchMessage(`@techsupport-team @techsupport-leads @tech-curators @pk-chats @sos-inform-teachers @teacherscareteam @outbound-team-new @m-vhod @pm-team1 @premium-support @a-players @news`, ChanelDev, tsresponse);
    } catch (error) {
        console.error("Ошибка при отправке сообщения: ", error);
    }
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

function openinfo(info, tab){ // открытие информации в scriptPackage
	let selid = info.selectionText.replace(/\D/g, '');
    console.log(selid)
    const laserExtensionId = "kggpdmfnfmmkneemhknlojemcjmdlpjb";
    let messageValue = {
        message: 'open-user-info',
        userId: selid,
    }
    console.log(messageValue)

    let tabId = tab.id
    console.log(tabId)

    const message = {
        messageValue,
        tabId
    }

    chrome.runtime.sendMessage(laserExtensionId,
        message,
    );
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

function dologginer(info, tab) { // создание ссылки логинера
    let selid = info.selectionText.replace(/\D/g, '');
    let tokenId = null; // Установите соответствующий токен здесь

    fetch("https://id.skyeng.ru/admin/auth/login-links", {
        headers: {"content-type": "application/x-www-form-urlencoded"},
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

function opencrmid(info, tab){ //открытие СРМки по выделенному ID пользователя
	let selid = info.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://crm2.skyeng.ru/persons/" + selid) };
	chrome.tabs.create(createProperties);
}

function creditpayments(info, tab){ //открытие рассрочек по выделенному ID пользователя 
	let selid = info.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://accounting.skyeng.ru/credit/list?studentId=" + selid) };
	chrome.tabs.create(createProperties);
}

function editadmacc(info, tab){ //открытие админки по выделенному ID пользователя
	let selid = info.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://id.skyeng.ru/admin/users/" + selid + "/update-contacts") };
	chrome.tabs.create(createProperties);
}

function copytoskipap(info, tab) { // копирование ссылки для пропуска АП
    let selid = info.selectionText.replace(/\D/g, '');
    let textToCopy = "https://student.skyeng.ru/product-stage?stage=auto-schedule&educationServiceId=" + selid;
	chrome.tabs.sendMessage(tab.id, { action: "copyToClipboard", text: textToCopy });
	
}

function copytoskipob(info, tab) { // копирование ссылки для пропуска Onboarding
    let selid = info.selectionText.replace(/\D/g, '');
    let textToCopy = "https://student.skyeng.ru/product-stage?stage=onboarding&educationServiceId=" + selid;
	chrome.tabs.sendMessage(tab.id, { action: "copyToClipboard", text: textToCopy });
}

function opentrm(info, tab){ //опция для открытия TRM2
	let selid = info.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://trm.skyeng.ru/teacher/"  +  selid) }
	chrome.tabs.create(createProperties);
}

function openlgs(info, tab){ //опция для открытия LGS
	let selid = info.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://learning-groups-storage.skyeng.ru/group/"  +  selid + "?cp=(section:participants)") }
	chrome.tabs.create(createProperties);
}

function opntshash(info, tab){ //опция для открытия ТШ по хэш комнаты
const createProperties = { url: encodeURI("https://video-trouble-shooter.skyeng.ru/?hash="  +  info.selectionText) }
	chrome.tabs.create(createProperties);
}

async function cancelishodcall(info, tab){ 
	MMostOperId = await getMMostOperId();
	if (MMostOperId) { 
		const message = `@techsupport-1line-crm2 ${i.linkUrl} Охрана - отмена 🚫`;
		sendMattermostMessage(message);
	}
}

async function sendtestmsgcustommsg(info, tab){
	MMostOperId = await getMMostOperId();
	if (MMostOperId) { 
		const textmsg = prompt('Введите ваш текст в это поле');
		if (textmsg !== null && textmsg.length > 3) {
			const message = `@techsupport-1line-crm2 ${i.linkUrl} ${textmsg}`;
			sendMattermostMessage(message);
		} else if (textmsg !== null) {
			alert("Текст слишком короткий");
		} else {
			console.log("Нажата кнопка Отмена");
		}
	}
}

async function cancelsecondline(info, tab){	MMostOperId = await getMMostOperId();
	MMostOperId = await getMMostOperId();
	if (MMostOperId) { 
		const message = `@techsupport-2line ${i.linkUrl} Охрана - отмена 🚫`;
		sendMattermostMessage(message);
	}
}

async function send2ndlinetestmsgcustommsg(info, tab){
	MMostOperId = await getMMostOperId();
	if (MMostOperId) { 
		const textmsg = prompt('Введите ваш текст в это поле');
		if (textmsg !== null && textmsg.length > 3) {
			const message = `@techsupport-2line ${i.linkUrl} ${textmsg}`;
			sendMattermostMessage(message);
		} else if (textmsg !== null) {
			alert("Текст слишком короткий");
		} else {
			console.log("Нажата кнопка Отмена");
		}
	}	
}

// функция общения с stat.js чтобы отправлять запрос на получение какой либо инфы для обхода CORS
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	    if (request.name === "Ctxt") {
			if (request.question == 'sendResponse') {
				fetch(request.addr, request.options)
					.then(response => response.text())
					.then(result => { sendResponse({answer: result, respName: request.respName}) });
				return true;
			}
		}
});

async function getMMostOperId() {
	return new Promise(async (resolve) => {
	  let MMostOperId = localStorage.getItem('matermost_oid');
  
	  if (MMostOperId !== null) {
		resolve(MMostOperId);
	  } else {
		try {
		  const response = await fetch(OperId_API_URL);
		  
		  if (!response.ok) {
			throw new Error("Failed to fetch user data.");
		  }
  
		  const data = await response.json();
		  MMostOperId = data.id;
  
		  if (MMostOperId) {
			localStorage.setItem('matermost_oid', MMostOperId);
			resolve(MMostOperId);
		  }
		} catch (error) {
		  console.error("Error fetching user data:", error);
		  resolve(null); // Если возникла ошибка, вернуть null
		}
	  }
	});
  }

function sendMattermostMessage(message) {
    lastMessage = message; // Сохраняем каждое новое сообщение

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
	if (Chatid === lastChatId) { // Если текущий chatid такой же, как и передыдущий
        sendMattermostMessage(lastMessage); // Пересылаем сообщение заново
        return; // Прекращаем выполнение функции, чтобы не отправлять сообщение в content.js
    }

    lastChatId = Chatid; // Обновляем последний chatid

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	  const activeTab = tabs[0];
	  if (activeTab) {
		chrome.tabs.sendMessage(activeTab.id, { action: "CallMMComment", Chatid: Chatid });
	  }
	});
}