var win_VimbotMenu = `
<div style="max-height:250px; width:400px; cursor:grab">
    <div>
        <button class="mainButton buttonHide" id="hideVimbot"
                title="Скрывает расширение и др открытых окон" style="margin:5px;">hide</button>
        <button class="mainButton smallbtn" title="По нажатию очищает поля и сбрасывает форму"
                id="clearVimbotMenu">🧹</button>
        <label style="background: transparent; color:bisque;">Vimbot - отправка текста в Support Chat</label>
    </div>
    <input class="${exttheme}" id="uIdToVimbot"
           style="margin:5px;text-align:center; border-radius: 20px;"
           placeholder="User ID">
    <button class="mainButton" id="sendToVimbotFromCRM">💬 Отправить</button>
    <button class="mainButton" id="GetTexttmplt">⤵️</button>
    <p id="chattype" style="color:bisque; text-align:center; margin-bottom: auto; display: none"></p>
    <textarea class="${exttheme}"
              style="height:114px; width:97%; margin:5px; max-height: 165px; min-height: 40px;"
              id="textToVimbotSend"></textarea>
</div>`;

const wintVimbot = createWindow('AF_Vimbot', 'winTopVimbot', 'winLeftVimbot', win_VimbotMenu);
hideWindowOnDoubleClick('AF_Vimbot');
hideWindowOnClick('AF_Vimbot', 'hideVimbot');

const chatTypeElement = document.getElementById("chattype");
const uIdToVimbot = document.getElementById('uIdToVimbot');

// Очистка формы
document.getElementById('clearVimbotMenu').addEventListener('click', function () {
    uIdToVimbot.value = '';
    document.getElementById('textToVimbotSend').value = '';
    chatTypeElement.style.display = 'none';
    chatTypeElement.textContent = '';
});

// Обработка вставки/drag&drop
function VimhandleInput(event) {
    uIdToVimbot.value = '';
    const pastedValue = (event.clipboardData || event.dataTransfer).getData('text').trim();
    setTimeout(() => {
        if (/^\d+$/.test(pastedValue)) {
            uIdToVimbot.value = pastedValue;
            checkchattype();
        }
    }, 0);
}

uIdToVimbot.addEventListener('paste', VimhandleInput);
uIdToVimbot.addEventListener('drop', VimhandleInput);
uIdToVimbot.addEventListener('change', checkchattype);

// Ввод только цифр
uIdToVimbot.addEventListener('input', function () {
    onlyNumbers(this);
    if (chatTypeElement.style.display !== "none" && chatTypeElement.textContent !== "") {
        chatTypeElement.style.display = "none";
        chatTypeElement.textContent = "";
    }
});

// Открытие/скрытие окна
let lnkToOpenVimbotWindow = document.getElementById('openVimbotWindows');
lnkToOpenVimbotWindow.addEventListener('click', function () {
    wintVimbot.style.display = (wintVimbot.style.display === 'none') ? 'block' : 'none';
});

// Получение текста из шаблона
document.getElementById('GetTexttmplt').addEventListener('click', function () {
    let tmpltText = document.getElementById('inp').value;
    if (tmpltText) {
        document.getElementById('textToVimbotSend').value = tmpltText;
        document.getElementById('inp').value = "";
    }
});
// Отправка сообщения
document.getElementById('sendToVimbotFromCRM').addEventListener('click', function () {
    const usrIDraw = uIdToVimbot.value.trim();
    const recipientId = Number(usrIDraw); // ключевая правка: число, не строка
    const textTosent = document.getElementById('textToVimbotSend').value.replace(/\n/g, '\\n');
    const canWrite = chatTypeElement.textContent === "Support chat✅";

    if (!Number.isFinite(recipientId) || usrIDraw.length <= 3) {
        return createAndShowButton('Некорректный ID пользователя', 'error');
    }
    if (textTosent.length === 0 || !canWrite) {
        return createAndShowButton('Проверьте текст и статус Support chat', 'error');
    }

    const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/send/from-bot`;
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            chatType: "customer_support",
            recipientId,            // число, без кавычек в JSON
            text: textTosent,
            attachments: []
        })
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, function (response) {
        if (!response.success) {
            alert('Не удалось отправить сообщение: ' + response.error);
            return;
        }
        createAndShowButton('✅Отправлено');
        uIdToVimbot.value = "";
        document.getElementById('textToVimbotSend').value = "";
        console.log("Текст успешно отправлен!");
    });
});


// Проверка типа чата
function checkchattype() {
    let usrID = uIdToVimbot.value.trim();
    if (usrID.length > 3) {
        const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/users/${usrID}/channels`;
        const requestOptions = {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        };
        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, function (response) {
            if (!response.success) {
                alert('Не удалось получить данные: ' + response.error);
                return;
            } else {
                try {
                    const otvetchat = JSON.parse(response.fetchansver);
                    let foundSupportChat = otvetchat.data.some(item => item.label === "Support chat");
                    chatTypeElement.textContent = foundSupportChat ? "Support chat✅" : "Нет Support chat❌";
                    chatTypeElement.style.display = "";
                } catch (error) {
                    console.log("Ошибка при обработке ответа:", error);
                }
            }
        });
    }
}

// Открытие окна по ID студента
document.getElementById('openVimbotWindowsUserinfo').onclick = function () {
    let studentId = document.getElementById('idstudent').value.trim();
    if (studentId) {
        lnkToOpenVimbotWindow.click();
        uIdToVimbot.value = studentId;
        checkchattype();
    }
};