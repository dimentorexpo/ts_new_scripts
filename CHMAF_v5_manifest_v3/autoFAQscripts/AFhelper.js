// ============================================================
// ChMAF — AFhelper.js: главное окно шаблонов (AF_helper)
// ============================================================

var win_AFhelper = `
<div class="glass-panel" id="addTmpWrapper">
    <div class="glass-warning-bar chmaf-drag-handle"></div>

    <div class="flex-row chmaf-drag-handle" id="1str" style="padding-top: 5px;">
        <button class="glass-btn mainButton" id="languageAF" title="Переключает язык Русский/Английский">Русский</button>
        <button class="glass-btn mainButton" id="testCustTMPL" title="Открывает окно для добавления своих шаблонов">📒</button>
        <button class="glass-btn mainButton buttonHide" id="hideMenuMain" title="Скрывает расширение">Скрыть</button>

        <div class="flex-right">
            <button class="glass-btn mainButton" id="reminderstatus" title="Статус будильника 🔔 - вкл, 🔕 - выкл"></button>
            <button class="glass-btn mainButton" id="getnewtmpldata" title="Обновляет шаблоны">
                <span class="btn-icon">🔄</span>
            </button>
            <button class="glass-btn mainButton onlyfortp" id="addsrc" title="Доп меню для работы с сервисами школы">*</button>
            <button class="glass-btn mainButton" id="links" title="Открывает доп.меню со ссылками">L</button>
            <button class="glass-btn mainButton" id="setting" title="Настройки">⚙</button>
        </div>
    </div>

    <div class="flex-row" style="justify-content: center;">
        <input id="phone_tr" class="glass-input onlyfortp" placeholder="Телефон" autocomplete="off" type="text" style="width: 180px; text-align: center;">
        <input id="email_tr" class="glass-input onlyfortp" placeholder="Почта" autocomplete="off" type="text" style="width: 180px; text-align: center;">
    </div>

    <div id="pages" style="margin-bottom: 5px; font-size: 17px;"></div>
    <div id="7str"></div>
    <div id="6str"></div>

    <textarea id="inp" class="glass-textarea" style="width: 100%; min-height: 100px; max-height: 350px; resize: vertical; margin-bottom: 8px; box-sizing: border-box; font-size:17px"></textarea>

    <div id="hyperlnk" class="flex-row hyper-bar">
        <input id="bindlinktotext" class="glass-input" type="text" placeholder="Enter your link 🔗 here" title="Ссылка для встраивания" style="flex-grow: 1; text-align: center;">
        <button class="glass-btn mainButton" id="insertlinktotext">Insert ✅</button>
    </div>

    <div class="flex-row chmaf-drag-handle">
        <button class="glass-btn mainButton" id="msg1" title="Отправить или доработать">Доработать</button>
        <button class="glass-btn mainButton msgtype" id="msg" title="Отправить в заметки или в чат">Чат</button>
        <button class="glass-btn mainButton" id="opandclsbarhyper" title="Прикрепить ссылку">🔗</button>
        <button class="glass-btn mainButton" id="sndbot" title="Отправить от имени бота">🤖</button>
        <button class="glass-btn mainButton primary" id="snd" title="Отправить текст">Send</button>

        <div class="flex-right">
            <button class="glass-btn mainButton" id="addtocusttmplt" title="Сохранить в личные шаблоны">⬆️+Tmpl</button>
            <button class="glass-btn mainButton onlyfortp" id="openVimbotWindows" title="Через Vimbot">▶️Vimbot</button>
        </div>
    </div>

    <div id="addTmp" style="display: none;"></div>
</div>`;

createWindow('AF_helper', 'winTopAF', 'winLeftAF', win_AFhelper);

// --- Применение сохранённого масштаба при загрузке ---
(function applyInitialScale() {
    const savedScale = localStorage.getItem('AF_windowScale') || 100;
    const target = document.getElementById('AF_helper') || document.getElementById('addTmpWrapper');
    if (target) {
        target.style.transformOrigin = 'top left';
        target.style.transform = `scale(${savedScale / 100})`;
    }
})();

/**
 * Заменяет выделенный в textarea текст на результат formatCallback.
 * @param {HTMLTextAreaElement} elem — поле ввода
 * @param {Function} formatCallback — форматирует выделенный фрагмент
 * @returns {boolean} — true, если замена выполнена
 */
function replaceSelectedText(elem, formatCallback) {
    elem.focus();

    if (typeof elem.selectionStart === 'number' && elem.selectionStart !== elem.selectionEnd) {
        const start = elem.selectionStart;
        const end = elem.selectionEnd;
        const replacedText = formatCallback(elem.value.substring(start, end));

        elem.value = elem.value.substring(0, start) + replacedText + elem.value.substring(end);

        // Курсор — в конец вставленного фрагмента
        const newPos = start + replacedText.length;
        elem.setSelectionRange(newPos, newPos);
        return true;
    }

    return false;
}

// ============================================================
// Переключатели режима: «Чат/Заметки» и «Доработать/Отправить»
// ============================================================
const msgBtn = document.getElementById('msg');
const msg1Btn = document.getElementById('msg1');

msg1Btn.classList.add('msg1type');

/** Восстанавливает подпись и подсветку кнопки-режима из localStorage. */
function restoreModeButton(btn, storageKey, defaultText, markerWord, markerClass) {
    btn.textContent = localStorage.getItem(storageKey) || defaultText;
    btn.classList.toggle(markerClass, btn.textContent.includes(markerWord));
}

restoreModeButton(msgBtn, 'msg', 'Чат', 'Заметки', 'notes');
restoreModeButton(msg1Btn, 'msg1', 'Доработать', 'Отправить', 'send-mode');

msgBtn.addEventListener('click', function () {
    const isChat = this.textContent.includes('Чат');

    this.textContent = isChat ? 'Заметки' : 'Чат';
    this.classList.toggle('notes', isChat);
    localStorage.setItem('msg', this.textContent);
});

msg1Btn.addEventListener('click', function () {
    const isSend = this.textContent.includes('Отправить');

    this.textContent = isSend ? 'Доработать' : 'Отправить';
    this.classList.toggle('send-mode', !isSend);
    localStorage.setItem('msg1', this.textContent);
});

// ============================================================
// Отправка (Send): в чат/заметки с учётом состояния шаблонов
// ============================================================
document.getElementById('snd').addEventListener('click', function () {
    const inp = document.getElementById('inp');

    // Блокировка от дабл-клика
    this.disabled = true;
    setTimeout(() => { this.disabled = false; }, 500);

    const textVal = inp.value;

    if (msgBtn.textContent === 'Чат') {
        if (template_flag === 1) {
            if (template_flag2 === 1) sendAnswerTemplate2(textVal, 1);
            else sendAnswerTemplate('', '', 1, textVal, 1);
        } else {
            sendAnswer(textVal, 0);
        }
    } else {
        sendComment(textVal);
    }

    // Очистка полей
    inp.value = '';
    const phoneTr = document.getElementById('phone_tr');
    const emailTr = document.getElementById('email_tr');
    if (phoneTr) phoneTr.value = '';
    if (emailTr) emailTr.value = '';
});

// ============================================================
// Панель гиперссылок
// ============================================================
const hyperLnkPanel = document.getElementById('hyperlnk');

document.getElementById('opandclsbarhyper').addEventListener('click', function () {
    hyperLnkPanel.classList.toggle('active');
});

document.getElementById('insertlinktotext').addEventListener('click', function () {
    const linkInput = document.getElementById('bindlinktotext');
    const textArea = document.getElementById('inp');

    const formatLink = (text) => `<a href="${linkInput.value}" target="_blank" rel="noopener">${text}</a>`;

    if (replaceSelectedText(textArea, formatLink)) {
        linkInput.value = '';
        hyperLnkPanel.classList.remove('active');
    }
});

// ============================================================
// Отправка от имени бота
// ============================================================
document.getElementById('sndbot').addEventListener('click', async function () {
    const inp = document.getElementById('inp');
    const textVal = inp.value;

    if (!textVal.trim()) return;

    const [adr, adr1, uid] = await getInfo(0);

    let formattedText = textVal.split('\n')
        .map(line => line.trim() ? `<p>${line}</p>` : '<p><br></p>')
        .join('');

    if (msgBtn.textContent === 'Чат') {
        const formData = new FormData();
        formData.append('payload', JSON.stringify({
            sessionId: uid,
            conversationId: adr1,
            text: formattedText,
            suggestedAnswerDocId: 0
        }));

        try {
            // Без content-type: при FormData браузер сам ставит multipart с boundary
            await afApiFetch(`${AF_ORIGIN}/api/reason8/answers`, {
                method: 'POST',
                body: formData
            });
            inp.value = '';
        } catch (err) {
            console.error('Ошибка отправки ботом:', err);
        }
    }
});

// ============================================================
// Скрытие всех окон расширения
// ============================================================
document.getElementById('hideMenuMain').addEventListener('click', function () {
    ['AF_helper', 'AF_CustomTemplates', 'AF_Links',
     'AF_AlarmClock', 'AF_Linksd', 'AF_Settings']
        .forEach((id) => {
            const el = document.getElementById(id);
            if (el) setDisplayStyle(el, 'none');
        });

    document.getElementById('scriptBut')?.classList.remove('active');
});

// ============================================================
// Обновление шаблонов с анимацией и блокировкой от дабл-клика
// ============================================================
document.getElementById('getnewtmpldata').addEventListener('click', async function () {
    this.classList.add('loading-orange'); // статус "Загрузка"
    this.disabled = true;

    try {
        await getText();

        this.classList.remove('loading-orange');
        this.classList.add('success-green'); // статус "Успех"

        setTimeout(() => {
            this.classList.remove('success-green');
            this.disabled = false;
        }, 3000);
    } catch (err) {
        console.error('Ошибка обновления:', err);
        this.classList.remove('loading-orange');
        this.disabled = false;
    }
});
