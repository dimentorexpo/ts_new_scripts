const Messanger_API_URL = "https://mm-time.skyeng.tech/api/v4/posts";
const OperId_API_URL = "https://mm-time.skyeng.tech/api/v4/users/me";

const taskUrlPattern = "https://crm2.skyeng.ru/customer-support/task/*";
const personTaskUrlPattern = "https://crm2.skyeng.ru/persons/*/customer-support/task/*";
const mmtUrlPattern = "https://mattermost.skyeng.tech/*";


const showForPages = ["*://*.skyeng.ru/*","*://skyeng.autofaq.ai/*","*://*.slack.com/*","*://jira.skyeng.tech/*","*://*.skyeng.tech/*"]; //фильтр чтобы контекстное меню отображалась для сайтов из внесенного перечня иначе если не добавить потом при обьявлении родительских опций они будут на всех сайтах эта "documentUrlPatterns":showForPages конструкция и вносится при обьявлении для фильтрации страниц 

//переменные каналов отправки сообщений
const ChanelDev = "hg8rcub4pfg3dcae8jxkwzkq9h";
const ChanelSupport = "pspyooisr3rd7qzx9as8uc96xc";
//const ChanelDev = "9gmj89efo38o3doxzu19g3gk6r";
//const ChanelSupport = "9gmj89efo38o3doxzu19g3gk6r";

let lastChatId = null; // Глобальная переменная для хранения последнего chatid
let lastMessage = null; // Глобальная переменная для хранения последнего сообщения

const main = chrome.contextMenus.create( {"id":"mainoption","title": "Technical Support Master", "documentUrlPatterns":showForPages} ); //обьявляем контекстное меню для страницы, отвечает свойство page и также в дочерних ветках

chrome.contextMenus.create({"title": "💸 Поиск платежа", "contexts":["page"], "parentId": "mainoption", "onclick": searchpayment}); //опция открывает поиск платежа
function searchpayment(i){
	const createProperties = {url: encodeURI("https://accounting.skyeng.ru/userpayment/search/transaction")};
	chrome.tabs.create(createProperties);
}

chrome.contextMenus.create({"title": "💰 Начислятор / 📑 Подписки", "contexts":["page"], "parentId": "mainoption", "onclick": balanceinfo}); //опция открывает раздел Начислятор для просмотра баланса
function balanceinfo(i){
	const createProperties = {url: encodeURI("https://billing-api.skyeng.ru/operations")};
	chrome.tabs.create(createProperties);
}

chrome.contextMenus.create({"title": "🧾 Сертификаты / 🎟 Промокоды", "contexts":["page"], "parentId": "mainoption", "onclick": certandpromo}); //опция открывает раздел Начислятор для просмотра баланса
function certandpromo(i){
	const createProperties = {url: encodeURI("https://billing-marketing.skyeng.ru/certificate/certSearch")};
	chrome.tabs.create(createProperties);
}

chrome.contextMenus.create({"title": "📟 Timetable", "contexts":["page"], "parentId": "mainoption", "onclick": opentt}); //опция открывает Timetable
function opentt(i){
	const createProperties = {url: encodeURI("https://timetable.skyeng.ru/")};
	chrome.tabs.create(createProperties);
}

chrome.contextMenus.create({"title": "📆 Календарь (Datsy)", "contexts":["page"], "parentId": "mainoption", "onclick": opencalendar}); //опция открывает Datsy календарь
function opencalendar(i){
	const createProperties = {url: encodeURI("https://datsy.info/")};
	chrome.tabs.create(createProperties);
}

chrome.contextMenus.create({"title": "💵 Компенсации", "contexts":["page"], "parentId": "mainoption", "onclick": makecompens}); //опция открывает Окно с компенсациями
function makecompens(i){
	const createProperties = {url: encodeURI("https://billing-marketing.skyeng.ru/accrual-operations/create")};
	chrome.tabs.create(createProperties);
}

chrome.contextMenus.create({"title": "💋 Админка Talks", "contexts":["page"], "parentId": "mainoption", "onclick": opentalksadm}); //опция открывает Окно с компенсациями
function opentalksadm(i){
	const createProperties = {url: encodeURI("https://vimbox.skyeng.ru/talks/admin/statistics")};
	chrome.tabs.create(createProperties);
}

chrome.contextMenus.create({"title": "🆘 #dev-disaster", "contexts":["page"], "parentId": "mainoption", "onclick": sendtodisaster}); //опция для копирования ссылки для отправки сообщения в дизастер
async function sendtodisaster(i,t){
	
	if (!MMostOperId) { MMostOperId = await getMMostOperId() }
	
	let answersend = confirm("Вы уверены, что хотите пробудить Древнее Зло и воззвать к команде Фиксиков для исправления катаклизма на платформе?\nОК - Для продолжения. Отмена закрыть форму.")
	if (answersend) {
	const textmsg = prompt('Введите ваш текст в это поле');
	if (textmsg !== null){
        if (textmsg.length > 3) {
				await fetch(Messanger_API_URL, {
				"headers": {
					  "accept": "*/*",
					  "accept-language": "ru",
					  "content-type": "application/json",
					  "sec-fetch-mode": "cors",
					  "sec-fetch-site": "same-origin",
					  "x-requested-with": "XMLHttpRequest"
					},
					"referrerPolicy": "no-referrer",
					"body": `{\"message\":\":allert: ${textmsg}\",\"channel_id\":\"${ChanelDev}\",\"pending_post_id\":\"${MMostOperId}:\",\"user_id\":\"${MMostOperId}\"}`,
				"method": "POST",
				"mode": "cors",
				"credentials": "include"
		  	}).then(r=>r.json()).then(r=>receiveddata=r)
				let tsresponse = receiveddata.id
				console.log(tsresponse)
				
				fetch(Messanger_API_URL, {
						"headers": {
						  "accept": "application/json, text/plain, */*",
						  "accept-language": "ru",
						  "content-type": "application/json",
						  "sec-fetch-mode": "cors",
						  "sec-fetch-site": "same-origin",
						  "x-requested-with": "XMLHttpRequest"
						},
						"referrerPolicy": "no-referrer",
						"body": `{\"message\":\"@techsupport-team @techsupport-leads @tech-curators @pk-chats @sos-inform-teachers @teacherscareteam @outbound-team-new @m-vhod @pm-team1 @premium-support @a-players @news\",\"channel_id\":\"${ChanelDev}\",\"root_id\":\"${tsresponse}\",\"pending_post_id\":\"${MMostOperId}\",\"user_id\":\"${MMostOperId}\"}`,
		  "method": "POST",
		  "mode": "cors",
		  "credentials": "include"
		});
						
		} else alert("Текст слишком короткий");
	} else console.log("Нажата кнопка Отмена");
	} else console.log("Не уверен, жаль, повезет в другой раз!")
}	

const selmain = chrome.contextMenus.create( {"id":"selMainOption","title": "Technical Support Master", "contexts":["selection"], "documentUrlPatterns":showForPages, "visible": false} ); // обьявляем контекстное меню при выделении текста отвечает свойство selection

const numericMenuIds = [ // Создаем все дочерние пункты меню для числового выделения
    chrome.contextMenus.create({"title": "🔎Info ID: %s", "contexts": ["selection"], "parentId": selmain, "onclick": openinfo, "visible": false}),
    chrome.contextMenus.create({"title": "🏡 Ссылка-логинер для ID: %s", "contexts": ["selection"], "parentId": selmain, "onclick": dologginer, "visible": false}),
    chrome.contextMenus.create({"title": "🕵️‍♂️ Открыть CRM для ID: %s", "contexts": ["selection"], "parentId": selmain, "onclick": opencrmid, "visible": false}),
    chrome.contextMenus.create({"title": "💳 Список рассрочек для ID: %s", "contexts": ["selection"], "parentId": selmain, "onclick": creditpayments, "visible": false}),
    chrome.contextMenus.create({"title": "🆔 Отредактировать в админке ID: %s", "contexts": ["selection"], "parentId": selmain, "onclick": editadmacc, "visible": false}),
    chrome.contextMenus.create({"title": "💨 ID Услуги Skip АП", "contexts": ["selection"], "parentId": selmain, "onclick": copytoskipap, "visible": false}),
    chrome.contextMenus.create({"title": "💨 ID Услуги Skip Onboarding", "contexts": ["selection"], "parentId": selmain, "onclick": copytoskipap, "visible": false}),
    chrome.contextMenus.create({"title": "👨‍🏫 Открыть ТРМ2.0 ID: %s", "contexts": ["selection"], "parentId": selmain, "onclick": opentrm, "visible": false}),
	chrome.contextMenus.create({"title": "👩‍👧‍👧 Открыть админку группы: %s", "contexts": ["selection"], "parentId": selmain, "onclick": openlgs, "visible": false}),
];

// Создаем пункт меню для хэша
const hashMenuId = chrome.contextMenus.create({"title": "♐ Открыть ТШ по хешу: %s", "contexts": ["selection"], "parentId": selmain, "onclick": opntshash, "visible": false});

chrome.runtime.onMessage.addListener(function(message) {
    switch (message.type) {
        case 'NUMERIC_SELECTION':
            chrome.contextMenus.update(selmain, {visible: true});
            numericMenuIds.forEach(id => chrome.contextMenus.update(id, {visible: true}));
            chrome.contextMenus.update(hashMenuId, {visible: false});
            break;
        case 'HASH_SELECTION':
            chrome.contextMenus.update(selmain, {visible: true});
            chrome.contextMenus.update(hashMenuId, {visible: true});
            numericMenuIds.forEach(id => chrome.contextMenus.update(id, {visible: false}));
            break;
        default:
            chrome.contextMenus.update(selmain, {visible: false});
            numericMenuIds.forEach(id => chrome.contextMenus.update(id, {visible: false}));
            chrome.contextMenus.update(hashMenuId, {visible: false});
            break;
    }
});

//Начало функций для обработки пунков меню выделенного текста
function openinfo(i,t) { // открытие информации в scriptPackage
	let selid = i.selectionText.replace(/\D/g, '');
    console.log(selid)
    const laserExtensionId = "kggpdmfnfmmkneemhknlojemcjmdlpjb";
    let messageValue = {
        message: 'open-user-info',
        userId: selid,
    }
    console.log(messageValue)

    let tabId = t.id
    console.log(tabId)

    const message = {
        messageValue,
        tabId
    }

    chrome.runtime.sendMessage(laserExtensionId,
        message,
    );
} 

function dologginer(i){ // создание ссылки логинера

// Данные для form-data токен можно взять как тебе удобно
let selid = i.selectionText.replace(/\D/g, '');
let tokenId = null

// fetch
fetch("https://id.skyeng.ru/admin/auth/login-links", {
    headers: {"content-type": "application/x-www-form-urlencoded"},
    referrer: "https://id.skyeng.ru/admin/auth/login-links",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${selid}+&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru&login_link_form%5Bpromocode%5D=&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=&login_link_form%5B_token%5D=${tokenId}`,
    method: "POST",
    mode: "cors",
    credentials: "include"
})
    .then(res => res.text())
    .then(textHtml => {
        let domPars = new DOMParser()
        // let loginLink = domPars.parseFromString(textHtml, `text/html`).querySelector("[value^='https://id.skyeng.ru/auth/login-link/']").value
		let testlink =domPars.parseFromString(textHtml, `text/html`).querySelectorAll("[value^='https://id.skyeng.ru/auth/login-link/']")
		        
        // Выводит последнюю ссылку в инпуте 
        console.log(`Loginner: ${testlink[testlink.length-1].value}`)
		
		let copyloginlnk = document.createElement("input");
		copyloginlnk.setAttribute("value", testlink[testlink.length-1].value)
		document.body.appendChild(copyloginlnk);
		copyloginlnk.select();
		document.execCommand("copy");
		document.body.removeChild(copyloginlnk);

    })
}

function opencrmid(i){ //открытие СРМки по выделенному ID пользователя
	let selid = i.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://crm2.skyeng.ru/persons/" + selid) };
	chrome.tabs.create(createProperties);
}

function creditpayments(i){ //открытие рассрочек по выделенному ID пользователя 
	let selid = i.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://accounting.skyeng.ru/credit/list?studentId=" + selid) };
	chrome.tabs.create(createProperties);
}

function editadmacc(i){ //открытие админки по выделенному ID пользователя
	let selid = i.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://id.skyeng.ru/admin/users/" + selid + "/update-contacts") };
	chrome.tabs.create(createProperties);
}

function copytoskipap(i){ //копирование ссылки для пропуска АП
	let selid = i.selectionText.replace(/\D/g, '');
	let aux = document.createElement("input");
	aux.setAttribute("value", "https://student.skyeng.ru/product-stage?stage=auto-schedule&educationServiceId="  +  selid)
	document.body.appendChild(aux);
	aux.select();
	document.execCommand("copy");
	document.body.removeChild(aux);
}

function copytoskipob(i){ //копирование ссылки для пропуска Onboarding
	let selid = i.selectionText.replace(/\D/g, '');
	let aux = document.createElement("input");
	aux.setAttribute("value", "https://student.skyeng.ru/product-stage?stage=onboarding&educationServiceId="  +  selid)
	document.body.appendChild(aux);
	aux.select();
	document.execCommand("copy");
	document.body.removeChild(aux);
}

function opentrm(i){  //опция для открытия TRM2
	let selid = i.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://trm.skyeng.ru/teacher/"  +  selid) }
	chrome.tabs.create(createProperties);
}

function openlgs(i){  //опция для открытия LGS
	let selid = i.selectionText.replace(/\D/g, '');
	const createProperties = { url: encodeURI("https://learning-groups-storage.skyeng.ru/group/"  +  selid + "?cp=(section:participants)") }
	chrome.tabs.create(createProperties);
}

function opntshash(i){ //опция для открытия ТШ по хэш комнаты
const createProperties = { url: encodeURI("https://video-trouble-shooter.skyeng.ru/?hash="  +  i.selectionText) }
	chrome.tabs.create(createProperties);
}
//Конец функций для обработки пунков меню выделенного текста

const linkparent = chrome.contextMenus.create( {"id":"linkOption","title": "Technical Support Master", "contexts":["link"], "documentUrlPatterns":showForPages, "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern, mmtUrlPattern]} ); // обьявляем контекстное меню при выделении текста отвечает свойство selection

let MMostOperId ='';

chrome.contextMenus.create({"title": "🚫 Отмена ТП1Л (исход)", "contexts":["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern], "onclick": cancelishodcall}); //опция для копирования ссылки для test msg

async function cancelishodcall(i,t) {
	MMostOperId = await getMMostOperId();
	if (MMostOperId) { 
		const message = `@techsupport-1line-crm2 ${i.linkUrl} Охрана - отмена 🚫`;
		sendMattermostMessage(message);
	}
}

chrome.contextMenus.create({"title": "💬 Написать ТП1Л (исход) со ссылкой", "contexts":["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern], "onclick": sendtestmsgcustommsg}); //опция для копирования ссылки для test msg

async function sendtestmsgcustommsg(i,t) {
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

chrome.contextMenus.create({"title": "🚫 Отмена 2ЛТП", "contexts":["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern], "onclick": cancelsecondline}); //опция для копирования ссылки для test msg

async function cancelsecondline(i,t) {	MMostOperId = await getMMostOperId();
	MMostOperId = await getMMostOperId();
	if (MMostOperId) { 
		const message = `@techsupport-2line ${i.linkUrl} Охрана - отмена 🚫`;
		sendMattermostMessage(message);
	}
}

chrome.contextMenus.create({"title": "💬 Написать 2ЛТП со ссылкой", "contexts":["link"], "parentId": "linkOption", "targetUrlPatterns": [taskUrlPattern, personTaskUrlPattern], "onclick": send2ndlinetestmsgcustommsg}); //опция для копирования ссылки для test msg

async function send2ndlinetestmsgcustommsg(i,t) {
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

chrome.contextMenus.create({"title": "🍤 Открыть в TiMe", "contexts": ["link"], "parentId": "linkOption","targetUrlPatterns": [mmtUrlPattern],"onclick": openReplacedUrl}); // обьявляем пункт контекстного меню для открытия ссылок из MM в TiMe

async function openReplacedUrl(info, tab) {
	if (info.linkUrl) { // Проверяем, существует ли URL
	  const newUrl = info.linkUrl.replace("https://mattermost.skyeng.tech/", "https://mm-time.skyeng.tech/"); // Заменяем часть URL на нужную нам и сохраняем результат в переменную
	  chrome.tabs.create({ url: newUrl }); // Открываем новую вкладку в браузере с измененным URL
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

