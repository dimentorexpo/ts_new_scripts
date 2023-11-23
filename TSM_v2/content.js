const messangerlink = "https://mm-time.skyeng.tech/skyeng/pl/";
const servicesites = ["skyeng.autofaq.ai","crm2.skyeng.ru"];
let isIframeListenerSet = false;
let lastChatIdF = null; // Глобальная переменная для хранения последнего chatid
let attemptCount = 0;
const MAX_ATTEMPTS = 60;
//From TSM.js
let allowedSites = ["vimbox.skyeng.ru", "new-teachers.skyeng.ru", "teachers.skyeng.ru", "student.skyeng.ru", "ttc.skyeng.ru", "skyeng.autofaq.ai", "crm2.skyeng.ru"];
let token;
// end of TSM.js global vars
if (servicesites.includes(location.host)) { initTSM() }

function initTSM() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "CallMMComment") {
            const Chatid = message.Chatid;
            console.log("Получен Chatid из background.js:", Chatid);
            if (!Chatid || Chatid === lastChatIdF) { // Если текущий chatid пуст или такой же, как и последний
                alert("Ошибка. Повтори отправку сообщения в ММ")
            } else {
                lastChatIdF = Chatid;
                const messlink = messangerlink + Chatid;
                const SendMessage = `Передано в канал #techsupport: <a href="${messlink}" target="_blank" rel="noopener">ссылка</a>`;
                const SendMessageCRM = `Передано в канал #techsupport и ссылка скопирована в буфер обмена: ${messlink}`;
                    
                if (location.href.includes('crm2.skyeng.ru')) {
                    copyToClipboardBack(messlink);
                    alert(SendMessageCRM);
                } else if (location.href.includes('skyeng.autofaq.ai/tickets/assigned')) {
                    sendCommentTSM(SendMessage);
                }
            }
        }
    });
}

async function sendCommentTSM(txt) { // функция отправки комментария
    var values = await getInfoTSM();
    activeConvId = values[0]; sessionId = values[1];
    if (activeConvId, sessionId) {
        var txt2 = txt.split('\n').join('\\n')
        var txt2 = txt2.split("\"").join("\\\"")
        fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            "headers": {
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
            },
            "body": "------WebKitFormBoundaryH2CK1t5M3Dc3ziNW\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + sessionId + "\",\"conversationId\":\"" + activeConvId + "\",\"text\":\"" + txt2 + "\",\"isComment\":true}\r\n------WebKitFormBoundaryH2CK1t5M3Dc3ziNW--\r\n",
            "method": "POST",
            "credentials": "include"
        });
    }
}

async function getInfoTSM() { //функция получения инфо о чате и сервис айди
    let activeConvId = getChatIdTSM();
	let sessionId = "";
 
    await fetch("https://skyeng.autofaq.ai/api/conversations/" + activeConvId)
        .then(response => response.json())
        .then(result => { sessionId = result.sessionId;});

    return [activeConvId, sessionId]
}

function getChatIdTSM() {
    const hrefnow = window.location.href;
    let chatId = '';
    if (hrefnow.includes('tickets/assigned')) {
        const iframeDocument = document.querySelector('[class^="NEW_FRONTEND"]').contentDocument || document.querySelector('[class^="NEW_FRONTEND"]').contentWindow.document;
        const ConvArray = iframeDocument.querySelectorAll('#__next [class^="DialogsCard_Card"]');

        for (let i = 0; i < ConvArray.length; i++) {
            if (ConvArray[i].getAttribute('aria-selected') === 'true') {
                chatId = ConvArray[i].getAttribute('data-conv-id');
                break;
            }
        }
    }

    return chatId;
}

const copyToClipboardBack = str => { // функция копирования в буфер обмена
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function setSelectionListener(doc) {
    doc.addEventListener('selectionchange', function() {
        let selectedText = doc.getSelection().toString().trim();
        console.log(selectedText);

        if (selectedText) {
            let messageType;
            if (/^(?=(?:[^0-9]*[0-9]){4})[\d\s,.айдиIDАЙДИуУ\/\:-;]+$/.test(selectedText)) {
                messageType = 'NUMERIC_SELECTION';
            } else if (/^[a-zA-Z]{6,}$/.test(selectedText)) {
                messageType = 'HASH_SELECTION';
            } else {
                messageType = 'OTHER_SELECTION';
            }

            chrome.runtime.sendMessage({type: messageType});
        }
    });

    if (doc === document) {
        console.log("Листенер контекстного меню добавлен к document");
    } else {
        console.log("Листенер контекстного меню добавлен к iframeDocument");
        isIframeListenerSet = true;
    }
}

function checkIframeLoaded() {
    if (attemptCount >= MAX_ATTEMPTS) {
        console.log("Попытка поиска iframe завершилась неудачей после", MAX_ATTEMPTS, "попыток.");
        return;
    }

    const iframeElement = document.querySelector('[class^="NEW_FRONTEND"]');
    if (iframeElement) {
        const iframeDocument = iframeElement.contentDocument || iframeElement.contentWindow.document;

        if (iframeDocument.readyState === 'complete') {
            setSelectionListener(iframeDocument);
        } else {
            iframeElement.onload = function() {
                setSelectionListener(iframeDocument);
            };
        }
    } else {
        attemptCount++;
        setTimeout(checkIframeLoaded, 1000);
    }
}

// Устанавливаем обработчик событий для главного документа
setSelectionListener(document);

if (window.location.href === "https://skyeng.autofaq.ai/tickets/assigned") {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE && node.matches('[class^="NEW_FRONTEND"]')) {
                        isIframeListenerSet = false;
                        checkIframeLoaded();
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    if (!isIframeListenerSet) {
        checkIframeLoaded();
    }

    setInterval(() => {
        if (!isIframeListenerSet) {
            checkIframeLoaded();
        }
    }, 60000);
}

////////////////////////////Added from TSM.js\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

function checkelementt(a) { // проверка на какой элемент нажали
    let elem = document.elementFromPoint(a.clientX, a.clientY)

    if (elem.nodeName != 'BUTTON' && elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA' && elem.nodeName != 'SELECT') {
        return true;
    }
    return false;
}

async function getUserId() { // получаем Id пользователя
    try {
        const response = await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {
            credentials: "include",
            method: "POST"
        });

        if (response.ok) {
            const data = await response.json();
            const userId = data?.user?.id || '';
            return userId;
        } else {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
//        return '';
    }
}

function addOption(oListbox, text, value) {  //функция добавления опции в список
    var oOption = document.createElement("option");
    oOption.appendChild(document.createTextNode(text));
    oOption.setAttribute("value", value);
    oListbox.appendChild(oOption);
}

const copyToClipboardTSM = str => { // функция копирования в буфер обмена
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function fetchaddchat(userid1, userid2, method) { //вспомогательная функция просто добавления чата мекжду пользователям
    fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
        "headers": {
            "content-type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://vimbox.skyeng.ru/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `{\"userId1\":${userid1},\"userId2\":${userid2}}`,
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });
}

// Контентный скрипт
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyToClipboard") {
        navigator.clipboard.writeText(message.text)
            .then(() => console.log('Текст скопирован в буфер обмена'))
            .catch(err => console.error('Ошибка при копировании текста: ', err));
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "showConfirmDialog") {
        const confirmed = confirm("Вы уверены, что хотите пробудить Древнее Зло и воззвать к команде Фиксиков для исправления катаклизма на платформе?");
        if (confirmed) {
            const textmsg = prompt('Введите ваш текст в это поле');
            sendResponse({ confirmed: true, textmsg: textmsg });
        } else {
            sendResponse({ confirmed: false });
        }
    }
	
	if (request.action === "showPromptDialog") {
        const textmsg = prompt('Введите ваш текст в это поле');
        sendResponse({ textmsg: textmsg, linkUrl: request.linkUrl });
    }
	
	 if (request.action === "showPromptDialog2LTP") {
        const textmsg = prompt('Введите ваш текст в это поле');
        sendResponse({ textmsg: textmsg, confirmed: textmsg !== null && textmsg.length > 3 });
    }
	
    return true; // Важно для асинхронного ответа
});

