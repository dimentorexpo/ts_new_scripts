/* =========================================================
   TSM Content Script — NEON GLASS ULTRA Refactored
   ========================================================= */

function logRequest(details) {
    console.log('%cСетевой запрос: ' + details.url + ' Метод: ' + details.method + ' Status Code: ' + details.statusCode + ' IP: ' + details.ip, 'background: rgba(255, 0, 0, 0.7); color: white; padding: 2px 5px; border-radius: 2px;');
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === 'logRequest') {
        logRequest(request.details);
    }
});

const messangerlink = "https://mm-time.skyeng.tech/skyeng/pl/";
const servicesites = ["skyeng.autofaq.ai", "crm2.skyeng.ru"];
let isIframeListenerSet = false;
let lastChatIdF = null;
let attemptCount = 0;
const MAX_ATTEMPTS = 60;
let token;

if (servicesites.includes(location.host)) { initTSM(); }

function initTSM() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "CallMMComment") {
            const Chatid = message.Chatid;
            console.log("Получен Chatid из background.js:", Chatid);
            if (!Chatid || Chatid === lastChatIdF) {
                alert("Ошибка. Повтори отправку сообщения в ММ");
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

async function sendCommentTSM(txt) {
    var values = await getInfoTSM();
    activeConvId = values[0]; sessionId = values[1];
    if (activeConvId && sessionId) {
        var txt2 = txt.split('\n').join('\\n');
        txt2 = txt2.split("\"").join("\\\"");
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

async function getInfoTSM() {
    let activeConvId = getChatIdTSM();
    let sessionId = "";
    await fetch("https://skyeng.autofaq.ai/api/conversations/" + activeConvId)
        .then(response => response.json())
        .then(result => { sessionId = result.sessionId; });
    return [activeConvId, sessionId];
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

function createNotify(text, result = 'message') {
    let type = result == 'message' ? 'sucsbtnok' : 'sucsbtnnotok';
    let btnSuccess = document.createElement("button");
    btnSuccess.className = `tsm-toast ${type}`;
    btnSuccess.innerHTML = text;

    let countdownBar = document.createElement("div");
    countdownBar.className = "tsm-countdown-bar";
    btnSuccess.appendChild(countdownBar);

    document.body.appendChild(btnSuccess);
    btnSuccess.style.display = 'block';

    setTimeout(() => {
        btnSuccess.remove();
    }, 3500);
}

const copyToClipboardBack = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function setSelectionListener(doc) {
    doc.addEventListener('selectionchange', function () {
        let selectedText = doc.getSelection().toString().trim();
        if (selectedText) {
            let messageType;
            if (/^(?=(?:[^0-9]*[0-9]){4})[\d\s,.айдиIDАЙДИуУ\/\:-;]+$/.test(selectedText)) {
                messageType = 'NUMERIC_SELECTION';
            } else if (/^[a-zA-Z]{6,}$/.test(selectedText)) {
                messageType = 'HASH_SELECTION';
            } else {
                messageType = 'OTHER_SELECTION';
            }
            chrome.runtime.sendMessage({ type: messageType });
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
            iframeElement.onload = function () {
                setSelectionListener(iframeDocument);
            };
        }
    } else {
        attemptCount++;
        setTimeout(checkIframeLoaded, 1000);
    }
}

function toMoscowTime(isoString) {
    if (!isoString) return "--";
    const date = new Date(isoString);
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
    observer.observe(document.body, { childList: true, subtree: true });
    if (!isIframeListenerSet) {
        checkIframeLoaded();
    }
    setInterval(() => {
        if (!isIframeListenerSet) {
            checkIframeLoaded();
        }
    }, 60000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "copyToClipboard") {
        navigator.clipboard.writeText(message.text)
            .then(() => {
                console.log('Текст скопирован в буфер обмена');
                createAndShowButton();
                sendResponse({ success: true });
            })
            .catch(err => {
                console.error('Ошибка при копировании текста: ', err);
                sendResponse({ success: false, error: err });
            });
        return true;
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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
        sendResponse({ textmsg: textmsg, confirmed: textmsg !== null && textmsg.length > 3 });
    }
    return true;
});

function createTSMWindow(id, topKey, leftKey, content) {
    const windowElement = document.createElement('div');
    document.body.append(windowElement);
    const storedTop = localStorage.getItem(topKey) || '118';
    const storedLeft = localStorage.getItem(leftKey) || '407';
    windowElement.style = `display:none; top: ${storedTop}px; left: ${storedLeft}px;`;
    windowElement.style.display = 'none';
    windowElement.setAttribute('id', id);
    windowElement.innerHTML = content;
    windowElement.onmousedown = function (event) {
        if (checkelementt(event)) {
            event.preventDefault();
            let startX = event.clientX;
            let startY = event.clientY;
            let elemLeft = windowElement.offsetLeft;
            let elemTop = windowElement.offsetTop;
            let isDragging = true;

            function onMouseMove(event) {
                if (!isDragging) return;
                let deltaX = event.clientX - startX;
                let deltaY = event.clientY - startY;
                windowElement.style.left = `${elemLeft + deltaX}px`;
                windowElement.style.top = `${elemTop + deltaY}px`;
            }

            function onMouseUp() {
                if (!isDragging) return;
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                localStorage.setItem(topKey, String(windowElement.offsetTop));
                localStorage.setItem(leftKey, String(windowElement.offsetLeft));
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    };
    return windowElement;
}

function createAndShowButton() {
    let btnSuccess = document.createElement("button");
    btnSuccess.id = "successButton";
    btnSuccess.className = "tsm-toast sucsbtnok";
    btnSuccess.textContent = "💾 Успешно";
    let countdownBar = document.createElement("div");
    countdownBar.id = "countdownBar";
    countdownBar.className = "tsm-countdown-bar";
    btnSuccess.appendChild(countdownBar);
    document.body.appendChild(btnSuccess);
    btnSuccess.style.display = 'block';
    setTimeout(() => {
        btnSuccess.remove();
    }, 3500);
}
