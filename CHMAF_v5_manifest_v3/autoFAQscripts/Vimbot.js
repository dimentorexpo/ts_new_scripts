var win_VimbotMenu = // описание кнопок меню
    `<div style="max-height:250px; width:400px; cursor:grab">
        <div>
        <button class="mainButton buttonHide" id="hideVimbot" title="Скрывает расширение и др открытых окон" style="margin:5px;">hide</button>
        <label class="${exttheme}" style="background: transparent;">Vimbot - отправка текста в Support Chat</label>
        </div>
        <input class="${exttheme}" id="uIdToVimbot" style="margin:5px;text-align:center; border-radius: 20px;" placeholder='User ID'></input>
        <button class="mainButton" id="sendToVimbotFromCRM">💬 Отправить</button>
        <button class="mainButton" id="GetTexttmplt">⤵️</button> 
        <p id="chattype" style="color:bisque; text-align:center; margin-bottom: auto; display: none"></p>
        <textarea class="${exttheme}" style="height:114px; width:97%; margin:5px" id="textToVimbotSend"></textarea>
    </div>`;

const wintVimbot = createWindow('AF_Vimbot', 'winTopVimbot', 'winLeftVimbot', win_VimbotMenu);
hideWindowOnDoubleClick('AF_Vimbot');
hideWindowOnClick('AF_Vimbot', 'hideVimbot');
const chatTypeElement = document.getElementById("chattype");
const uIdToVimbot = document.getElementById('uIdToVimbot')

function VimhandleInput(event) {
    uIdToVimbot.value = '';
    const pastedValue = (event.clipboardData || event.dataTransfer).getData('text').trim();
    setTimeout(() => {
        if (/^\d+$/.test(pastedValue)) {
            uIdToVimbot.value = pastedValue;
            checkchattype()
        }
    }, 0);
}

uIdToVimbot.addEventListener('paste', VimhandleInput);
uIdToVimbot.addEventListener('drop', VimhandleInput);
uIdToVimbot.addEventListener('change', checkchattype);

uIdToVimbot.addEventListener('input', function () {
    onlyNumbers(this);
    if (chatTypeElement.style.display !== "none" || chatTypeElement.textContent !== "") {
        chatTypeElement.style.display = "none";
        chatTypeElement.textContent = "";
    }
});

let lnkToOpenVimbotWindow = document.getElementById('openVimbotWindows')
lnkToOpenVimbotWindow.addEventListener('click', function () {
    if (wintVimbot.style.display == 'none') {
        wintVimbot.style.display = ''
    } else {
        wintVimbot.style.display = 'none'
    }

    let btnGetTexttmplt = document.getElementById('GetTexttmplt');
    btnGetTexttmplt.addEventListener('click', function () {
        let tmpltText = document.getElementById('inp').value
        if (tmpltText) {
            document.getElementById('textToVimbotSend').value = tmpltText;
            document.getElementById('inp').value = "";
        }
    });

    let btnSendToUserMSG = document.getElementById('sendToVimbotFromCRM')
    btnSendToUserMSG.addEventListener('click', function () {
        let usrID = uIdToVimbot.value.trim();
        let textTosent = document.getElementById('textToVimbotSend').value.replace(/\n/g, '\\n');
        let canWrite = chatTypeElement.textContent === "Support chat✅";
        if (usrID.length > 3 && textTosent.length > 0 && canWrite) {
            const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/send/from-bot`;
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: `{\"chatType\":\"customer_support\",\"recipientId\":${usrID},\"text\":\"${textTosent}\",\"attachments\":[]}`,
                credentials: "include"
            };

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
                if (!response.success) {
                    alert('Не удалось отправить сообщение: ' + response.error);
                    return;
                } else {
                    createAndShowButton('✅Отправлено');
                    uIdToVimbot.value = ""
                    document.getElementById('textToVimbotSend').value = ""
                    console.log("Текст успешно отправлен!")
                }
            })
        } else alert("Проверьте ID пользователя или текст, чтобы он не был пустой и был Support chat")
    })
})

function checkchattype() {
    let usrID = uIdToVimbot.value.trim()
    if (usrID.length > 3) {
        const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/users/${usrID}/channels`;
        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        };
        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
            if (!response.success) {
                alert('Не удалось отправить сообщение: ' + response.error);
                return;
            } else {
                try {
                    const otvetchat = JSON.parse(response.fetchansver);
                    let foundSupportChat = false;
                    otvetchat.data.forEach((item) => {
                        if (item.label === "Support chat") {
                            foundSupportChat = true;
                        }
                    });
                    if (foundSupportChat) {
                        chatTypeElement.textContent = "Support chat✅";
                        chatTypeElement.style.display = "";
                    } else {
                        chatTypeElement.textContent = "Нет Support chat❌";
                        chatTypeElement.style.display = "";
                    }
                } catch (error) {
                    console.log("Ошибка при обработке ответа:", error);
                }
            }
        });

    } else alert("Проверьте ID пользователя, чтобы он не был пустой")
}

document.getElementById('openVimbotWindowsUserinfo').onclick = function () {
    let getedid = document.getElementById('idstudent').value.trim();
    if (getedid) {
        lnkToOpenVimbotWindow.click();
        uIdToVimbot.value = getedid;
        checkchattype();
    }
}