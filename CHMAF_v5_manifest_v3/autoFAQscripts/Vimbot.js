var win_VimbotMenu = // описание кнопок меню
    `<div style="height:200px; width:400px; cursor:grab">
        <div>
        <button class="mainButton buttonHide" id="hideVimbot" title="Скрывает расширение и др открытых окон" style="margin:5px;">hide</button>
        <label class="${exttheme}" style="background: transparent;">Vimbot - отправка текста в Support Chat</label>
        </div>
        <input class="${exttheme}" id="uIdToVimbot" style="margin:5px;text-align:center; border-radius: 20px;" placeholder='User ID'></input>
        <button class="mainButton" id="sendToVimbotFromCRM">💬 Отправить</button>
        <button class="mainButton" id="GetTexttmplt">⤵️</button> <br>
        <textarea class="${exttheme}" style="height:114px; width:97%; margin:5px" id="textToVimbotSend"></textarea>
    </div>`;

const wintVimbot = createWindow('AF_Vimbot', 'winTopVimbot', 'winLeftVimbot', win_VimbotMenu);
hideWindowOnDoubleClick('AF_Vimbot');
hideWindowOnClick('AF_Vimbot', 'hideVimbot');

let uIdToVimbot = document.getElementById('uIdToVimbot')
uIdToVimbot.addEventListener('input', function () { onlyNumbers(this);} );

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
        let usrID = uIdToVimbot.value.trim()
        let textTosent = document.getElementById('textToVimbotSend').value
        if (usrID.length > 3 && textTosent.length > 0) {
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
        } else alert("Проверьте ID пользователя или текст, чтобы он не был пустой")
    })
})

document.getElementById('openVimbotWindowsUserinfo').onclick = function () {
    let getedid = document.getElementById('idstudent').value.trim();
    if (getedid) {
        lnkToOpenVimbotWindow.click();
        uIdToVimbot.value = getedid;
    }
}