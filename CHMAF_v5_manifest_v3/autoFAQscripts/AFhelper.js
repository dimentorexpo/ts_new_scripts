const editorExtensionIdNew = localStorage.getItem('ext_id');

var win_AFhelper = `
<div class="glass-panel" id="addTmpWrapper">
    <div class="glass-warning-bar"></div>

    <img src="chrome-extension://${editorExtensionIdNew}/Images/hat.png" id="hatSack" alt="Шляпа" width="140" style="position: absolute; top: -104px; right: -60px; z-index: 9999999; user-select: none; pointer-events: none;">
    <img src="chrome-extension://${editorExtensionIdNew}/Images/bag.png" id="giftSack" alt="Мешок" width="112" style="position: absolute; top: -98px; left: -72px; z-index: 9999999; user-select: none; pointer-events: none; transform: rotate(-30deg);">

    <div class="flex-row" id="1str" style="cursor: -webkit-grab; padding-top: 5px;">
        <button class="glass-btn mainButton" id="languageAF" title="Переключает язык Русский/Английский" style="width: 94px;">Русский</button>
        <button class="glass-btn mainButton" id="testCustTMPL" title="Открывает окно для добавления своих шаблонов">📒</button>
        <button class="glass-btn mainButton buttonHide" id="hideMenuMain" title="Скрывает расширение">Скрыть</button>

        <div class="flex-right">
            <button class="glass-btn mainButton" id="reminderstatus" title="Статус будильника 🔔 - вкл, 🔕 - выкл"></button>
            <button class="glass-btn mainButton" id="getnewtmpldata" title="Обновляет шаблоны">🔄</button>
            <button class="glass-btn mainButton onlyfortp" id="addsrc" title="Доп меню для работы с сервисами школы">*</button>
            <button class="glass-btn mainButton" id="links" title="Открывает доп.меню со ссылками">L</button>
            <button class="glass-btn mainButton" id="setting" title="Настройки">⚙</button>
        </div>
    </div>

    <div class="flex-row" style="justify-content: center;">
        <input id="phone_tr" class="glass-input onlyfortp ${exttheme}" placeholder="Телефон" autocomplete="off" type="text" style="width: 180px; text-align: center;">
        <input id="email_tr" class="glass-input onlyfortp ${exttheme}" placeholder="Почта" autocomplete="off" type="text" style="width: 180px; text-align: center;">
    </div>

    <div id="pages" style="margin-bottom: 5px; font-size: 17px;"></div>
    <div id="7str"></div>
    <div id="6str"></div>

    <textarea id="inp" class="glass-textarea ${exttheme}" style="width: 100%; min-height: 100px; max-height: 350px; resize: vertical; margin-bottom: 8px; box-sizing: border-box;"></textarea>

    <div id="hyperlnk" class="flex-row hyper-bar">
        <input id="bindlinktotext" class="glass-input ${exttheme}" type="text" placeholder="Enter your link 🔗 here" title="Ссылка для встраивания" style="flex-grow: 1; text-align: center;">
        <button class="glass-btn mainButton" id="insertlinktotext">Insert ✅</button>
    </div>

    <div class="flex-row">
        <button class="glass-btn mainButton" id="msg1" title="Отправить или доработать" style="width: 90px;">Доработать</button>
        <button class="glass-btn mainButton msgtype" id="msg" title="Отправить в заметки или в чат">Чат</button>
        <button class="glass-btn mainButton" id="opandclsbarhyper" title="Прикрепить ссылку">🔗</button>
        <button class="glass-btn mainButton" id="sndbot" title="Отправить от имени бота">🤖</button>
        <button class="glass-btn mainButton primary" id="snd" title="Отправить текст" style="width: 70px;">Send</button>

        <div class="flex-right">
            <button class="glass-btn mainButton" id="addtocusttmplt" title="Сохранить в личные шаблоны">⬆️+Tmpl</button>
            <button class="glass-btn mainButton onlyfortp" id="openVimbotWindows" title="Через Vimbot">▶️Vimbot</button>
        </div>
    </div>

    <div id="addTmp" style="display: none;"></div>
</div>`;

const wintAF = createWindow('AF_helper', 'winTopAF', 'winLeftAF', win_AFhelper);

// --- Вспомогательные функции ---

// Современная функция замены текста с коллбеком форматирования
function replaceSelectedText(elem, formatCallback) {
    elem.focus();
    if (typeof elem.selectionStart === "number" && elem.selectionStart !== elem.selectionEnd) {
        const start = elem.selectionStart;
        const end = elem.selectionEnd;
        const selectedText = elem.value.substring(start, end);
        const replacedText = formatCallback(selectedText);

        elem.value = elem.value.substring(0, start) + replacedText + elem.value.substring(end);

        // Возвращаем курсор в конец вставленного текста
        const newPos = start + replacedText.length;
        elem.setSelectionRange(newPos, newPos);
        return true;
    }
    return false;
}

// --- Инициализация LocalStorage ---
const msgBtn = document.getElementById('msg');
const msg1Btn = document.getElementById('msg1');

if (localStorage.getItem('msg')) {
    msgBtn.textContent = localStorage.getItem('msg');
    // Заменен класс notes на notes
    msgBtn.classList.toggle('notes', msgBtn.textContent === 'Заметки');
}

if (localStorage.getItem('msg1')) {
    msg1Btn.textContent = localStorage.getItem('msg1');
}

// --- Обработчики событий ---

// Обработчик ползунка масштаба (Используем zoom для корректных границ)
// Обработчик ползунка масштаба с плавным переходом



// Переключатель: Чат / Заметки
msgBtn.addEventListener('click', function () {
    const isChat = this.textContent === "Чат";
    this.textContent = isChat ? "Заметки" : "Чат";
    this.classList.toggle('notes'); // Заменен класс
    localStorage.setItem('msg', this.textContent);
});

// Переключатель: Отправить / Доработать
msg1Btn.addEventListener('click', function () {
    const isSend = this.textContent === "Отправить";
    this.textContent = isSend ? "Доработать" : "Отправить";
    localStorage.setItem('msg1', this.textContent);
});

// Отправка сообщений (Send)
document.getElementById('snd').addEventListener('click', function () {
    const inp = document.getElementById('inp');
    const phoneTr = document.getElementById('phone_tr');
    const emailTr = document.getElementById('email_tr');

    // Блокировка от дабл-клика
    this.disabled = true;
    setTimeout(() => this.disabled = false, 500);

    const textVal = inp.value;

    if (msgBtn.textContent === 'Чат') {
        if (template_flag === 1) {
            if (template_flag2 === 1) {
                sendAnswerTemplate2(textVal, 1);
            } else {
                sendAnswerTemplate('', '', 1, textVal, 1);
            }
        } else {
            sendAnswer(textVal, 0);
        }
    } else {
        sendComment(textVal);
    }

    // Очистка полей
    inp.value = '';
    if (phoneTr) phoneTr.value = '';
    if (emailTr) emailTr.value = '';
});

// Открытие/закрытие панели ссылок
const hyperLnkPanel = document.getElementById('hyperlnk');
document.getElementById('opandclsbarhyper').addEventListener('click', function () {
    hyperLnkPanel.classList.toggle('active'); // Заменен класс
});

// Вставка гиперссылки
document.getElementById('insertlinktotext').addEventListener('click', function () {
    const linkInput = document.getElementById('bindlinktotext');
    const textArea = document.getElementById('inp');

    const formatLink = (text) => `<a href="${linkInput.value}" target="_blank" rel="noopener">${text}</a>`;

    if (replaceSelectedText(textArea, formatLink)) {
        linkInput.value = ''; // Очищаем поле ссылки только при успешной вставке
        hyperLnkPanel.classList.remove('active'); // Заменен класс
    }
});

// Отправка от лица бота (API)
document.getElementById('sndbot').addEventListener('click', async function () {
    const inp = document.getElementById('inp');
    const textVal = inp.value;

    if (!textVal.trim()) return;

    const [adr, adr1, uid] = await getInfo(flag);

    let formattedText = textVal.split('\n')
        .map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>')
        .join('');

    if (msgBtn.textContent === "Чат") {
        const payloadJson = JSON.stringify({
            sessionId: uid,
            conversationId: adr1,
            text: formattedText,
            suggestedAnswerDocId: 0
        });

        const formData = new FormData();
        formData.append("payload", payloadJson);

        try {
            await fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                method: "POST",
                headers: { "x-csrf-token": aftoken },
                body: formData,
                credentials: "include"
            });
            inp.value = '';
        } catch (err) {
            console.error("Ошибка отправки ботом:", err);
        }
    }
});

// Скрытие окон
document.getElementById('hideMenuMain').addEventListener('click', function () {
    const windowsToHide = [
        'AF_helper', 'AF_CustomTemplates', 'AF_Links',
        'AF_AlarmClock', 'AF_Stat', 'AF_LessonStatus',
        'AF_Linksd', 'AF_Settings'
    ];

    windowsToHide.forEach(id => {
        const el = document.getElementById(id);
        if (el) setDisplayStyle(el, 'none');
    });

    const scriptBut = document.getElementById('scriptBut');
    if (scriptBut) scriptBut.classList.remove('activeScriptBtn'); // Заменен класс
});

// Обновление данных шаблона
document.getElementById('getnewtmpldata').addEventListener('click', getText);