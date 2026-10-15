// ============================================================
// ChMAF — AFhelper.js: главное окно шаблонов (AF_helper)
// ============================================================

var win_AFhelper = `
<div class="glass-panel" id="addTmpWrapper">

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
        <input id="phone_tr" class="glass-input onlyfortp" placeholder="Телефон" autocomplete="off" type="tel" inputmode="tel" style="width: 180px; text-align: center;">
        <input id="email_tr" class="glass-input onlyfortp" placeholder="Почта" autocomplete="off" type="text" inputmode="email" style="width: 180px; text-align: center;">
    </div>

    <div id="pages" style="margin-bottom: 5px; font-size: 17px;"></div>
    <div id="7str"></div>
    <div id="6str"></div>

    <textarea id="inp" class="glass-textarea" placeholder="Текст ответа (Ctrl+Enter — отправить)" style="width: 100%; min-height: 100px; max-height: 350px; resize: vertical; margin-bottom: 8px; box-sizing: border-box; font-size:17px"></textarea>

    <div id="hyperlnk" class="flex-row hyper-bar">
        <input id="bindlinktotext" class="glass-input" type="text" placeholder="Вставь ссылку, выдели текст и нажми Enter" title="Ссылка для встраивания. Enter — вставить, Esc — закрыть" style="flex-grow: 1; text-align: center;">
        <button class="glass-btn mainButton" id="insertlinktotext">Insert ✅</button>
    </div>

    <div class="flex-row chmaf-drag-handle">
        <button class="glass-btn mainButton" id="msg1" title="Отправить или доработать">Доработать</button>
        <button class="glass-btn mainButton msgtype" id="msg" title="Отправить в заметки или в чат">Чат</button>
        <button class="glass-btn mainButton" id="opandclsbarhyper" title="Прикрепить ссылку" aria-expanded="false">🔗</button>
        <button class="glass-btn mainButton" id="sndbot" title="Отправить от имени бота">🤖</button>
        <button class="glass-btn mainButton primary" id="snd" title="Отправить текст (Ctrl+Enter)">Send</button>

        <div class="flex-right">
            <button class="glass-btn mainButton" id="addtocusttmplt" title="Сохранить в личные шаблоны">⬆️+Tmpl</button>
            <button class="glass-btn mainButton onlyfortp" id="openVimbotWindows" title="Через Vimbot">▶️Vimbot</button>
        </div>
    </div>

    <div id="addTmp" style="display: none;"></div>
</div>`;

createWindow('AF_helper', 'winTopAF', 'winLeftAF', win_AFhelper);

// ============================================================
// Утилиты
// ============================================================
const $af = (id) => document.getElementById(id);

/** Тост, если в расширении есть система уведомлений; иначе — в консоль. */
function afNotify(message, type = 'message') {
    if (typeof window.showCustomAlert === 'function') return window.showCustomAlert(message, type);
    if (typeof createAndShowButton === 'function') return createAndShowButton(message, type);
    (type === 'error' ? console.warn : console.log)('[ChMAF]', message);
}

/** Кратко подсвечивает элемент классом (ошибка/успех) и снимает его. */
function afFlash(el, className, ms = 1200) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth; // перезапуск анимации, если класс уже стоял
    el.classList.add(className);
    setTimeout(() => el.classList.remove(className), ms);
}

/** Блокирует кнопку на время async-действия (не меньше minMs — защита от дабл-клика). */
async function afWithLock(btn, action, minMs = 500) {
    if (btn.dataset.busy === '1') return;
    btn.dataset.busy = '1';
    btn.disabled = true;
    const started = Date.now();
    try {
        return await action();
    } finally {
        const rest = Math.max(0, minMs - (Date.now() - started));
        setTimeout(() => { btn.disabled = false; btn.dataset.busy = ''; }, rest);
    }
}

// --- Применение сохранённого масштаба при загрузке ---
(function applyInitialScale() {
    const savedScale = Number(localStorage.getItem('AF_windowScale')) || 100;
    const target = $af('AF_helper') || $af('addTmpWrapper');
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

/** Вставляет текст в позицию курсора. */
function afInsertAtCursor(elem, text) {
    elem.focus();
    const pos = typeof elem.selectionStart === 'number' ? elem.selectionStart : elem.value.length;
    elem.value = elem.value.slice(0, pos) + text + elem.value.slice(pos);
    elem.setSelectionRange(pos + text.length, pos + text.length);
}

// ============================================================
// Переключатели режима: «Чат/Заметки» и «Доработать/Отправить»
// ============================================================
const msgBtn = $af('msg');
const msg1Btn = $af('msg1');

msg1Btn.classList.add('msg1type');

/** Восстанавливает подпись и подсветку кнопки-режима из localStorage. */
function restoreModeButton(btn, storageKey, allowed, markerWord, markerClass) {
    const saved = localStorage.getItem(storageKey);
    // В localStorage мог остаться мусор — принимаем только известные подписи
    btn.textContent = allowed.includes(saved) ? saved : allowed[0];
    const on = btn.textContent === markerWord;
    btn.classList.toggle(markerClass, on);
    btn.setAttribute('aria-pressed', String(on));
}

restoreModeButton(msgBtn, 'msg', ['Чат', 'Заметки'], 'Заметки', 'notes');
restoreModeButton(msg1Btn, 'msg1', ['Доработать', 'Отправить'], 'Отправить', 'send-mode');

msgBtn.addEventListener('click', function () {
    const toNotes = this.textContent === 'Чат';

    this.textContent = toNotes ? 'Заметки' : 'Чат';
    this.classList.toggle('notes', toNotes);
    this.setAttribute('aria-pressed', String(toNotes));
    localStorage.setItem('msg', this.textContent);
});

msg1Btn.addEventListener('click', function () {
    const toSend = this.textContent === 'Доработать';

    this.textContent = toSend ? 'Отправить' : 'Доработать';
    this.classList.toggle('send-mode', toSend);
    this.setAttribute('aria-pressed', String(toSend));
    localStorage.setItem('msg1', this.textContent);
});

// ============================================================
// Отправка (Send): в чат/заметки с учётом состояния шаблонов
// ============================================================
$af('snd').addEventListener('click', function () {
    const inp = $af('inp');
    const textVal = inp.value;

    if (!textVal.trim()) {
        afFlash(inp, 'input-error');
        return;
    }

    afWithLock(this, async () => {
        try {
            if (msgBtn.textContent === 'Чат') {
                if (template_flag === 1) {
                    if (template_flag2 === 1) await sendAnswerTemplate2(textVal, 1);
                    else await sendAnswerTemplate('', '', 1, textVal, 1);
                } else {
                    await sendAnswer(textVal, 0);
                }
            } else {
                await sendComment(textVal);
            }
        } catch (err) {
            // Текст не стираем — оператор не теряет набранное
            console.error('[ChMAF] Ошибка отправки:', err);
            afNotify('⚠️ Не удалось отправить — текст остался в поле', 'error');
            return;
        }

        // Чистим, только если за время отправки текст не меняли
        if (inp.value === textVal) inp.value = '';
        const phoneTr = $af('phone_tr');
        const emailTr = $af('email_tr');
        if (phoneTr) phoneTr.value = '';
        if (emailTr) emailTr.value = '';
    });
});

// ============================================================
// Панель гиперссылок
// ============================================================
const hyperLnkPanel = $af('hyperlnk');
const afHyperToggleBtn = $af('opandclsbarhyper');
const afLinkInput = $af('bindlinktotext');

function afSetHyperPanel(open) {
    hyperLnkPanel.classList.toggle('active', open);
    afHyperToggleBtn.setAttribute('aria-expanded', String(open));
    if (open) afLinkInput.focus();
}

/** Нормализует ссылку: добавляет https://, отсекает javascript:/data:, экранирует кавычки. */
function afNormalizeLink(raw) {
    let url = raw.trim();
    if (!url) return null;
    if (/^(javascript|data|vbscript):/i.test(url)) return null;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = 'https://' + url;
    return url.replace(/"/g, '%22').replace(/</g, '%3C').replace(/>/g, '%3E');
}

function afInsertLink() {
    const textArea = $af('inp');
    const url = afNormalizeLink(afLinkInput.value);

    if (!url) {
        afFlash(afLinkInput, 'input-error');
        afLinkInput.focus();
        return;
    }

    const toAnchor = (text) => `<a href="${url}" target="_blank" rel="noopener">${text}</a>`;

    // Есть выделение — оборачиваем его; нет — вставляем саму ссылку в позицию курсора
    if (!replaceSelectedText(textArea, toAnchor)) {
        afInsertAtCursor(textArea, toAnchor(url));
    }

    afLinkInput.value = '';
    afSetHyperPanel(false);
}

afHyperToggleBtn.addEventListener('click', () => {
    afSetHyperPanel(!hyperLnkPanel.classList.contains('active'));
});

$af('insertlinktotext').addEventListener('click', afInsertLink);

afLinkInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
        e.preventDefault();
        afInsertLink();
    } else if (e.key === 'Escape') {
        afSetHyperPanel(false);
        $af('inp').focus();
    }
});

// ============================================================
// Отправка от имени бота
// ============================================================
$af('sndbot').addEventListener('click', function () {
    const inp = $af('inp');
    const textVal = inp.value;

    if (!textVal.trim()) {
        afFlash(inp, 'input-error');
        return;
    }

    if (msgBtn.textContent !== 'Чат') {
        afNotify('🤖 От имени бота можно отправить только в чат — переключи «Заметки» на «Чат»', 'error');
        return;
    }

    afWithLock(this, async () => {
        const [, conversationId, sessionId] = await getInfo(0);

        const payload = {
            sessionId,
            conversationId,
            text: textVal.split('\n')
                .map((line) => (line.trim() ? `<p>${line}</p>` : '<p><br></p>'))
                .join(''),
            suggestedAnswerDocId: 0
        };

        try {
            let response;
            if (typeof sendAnswersRequest === 'function') {
                // Общий путь из TemplatesFuncs.js: сам покажет тост при HTTP-ошибке
                response = await sendAnswersRequest(payload);
            } else {
                const formData = new FormData();
                formData.append('payload', JSON.stringify(payload));
                const origin = typeof AF_ORIGIN !== 'undefined' ? AF_ORIGIN : 'https://skyeng.autofaq.ai';
                response = await afApiFetch(`${origin}/api/reason8/answers`, { method: 'POST', body: formData });
            }

            if (response && response.ok) {
                if (inp.value === textVal) inp.value = '';
                afFlash(this, 'success-green', 900);
            } else {
                afFlash(this, 'error-red', 1500);
            }
        } catch (err) {
            console.error('[ChMAF] Ошибка отправки ботом:', err);
            afFlash(this, 'error-red', 1500);
            afNotify('⚠️ Бот не отправил сообщение — текст остался в поле', 'error');
        }
    });
});

// ============================================================
// Скрытие всех окон расширения
// ============================================================
$af('hideMenuMain').addEventListener('click', function () {
    ['AF_helper', 'AF_CustomTemplates', 'AF_Links',
        'AF_AlarmClock', 'AF_Linksd', 'AF_Settings']
        .forEach((id) => {
            const el = $af(id);
            if (el) setDisplayStyle(el, 'none');
        });

    $af('scriptBut')?.classList.remove('active');
});

// ============================================================
// Обновление шаблонов: загрузка → успех/ошибка
// ============================================================
$af('getnewtmpldata').addEventListener('click', async function () {
    if (this.disabled) return;
    const btn = this;

    btn.classList.remove('success-green', 'error-red');
    btn.classList.add('loading-orange');
    btn.disabled = true;

    try {
        // getText не бросает исключение после 5 неудачных попыток, а возвращает null
        const result = await getText();
        if (!Array.isArray(result)) throw new Error('getText вернул пустой результат');

        btn.classList.replace('loading-orange', 'success-green');
        setTimeout(() => {
            btn.classList.remove('success-green');
            btn.disabled = false;
        }, 3000);
    } catch (err) {
        console.error('[ChMAF] Ошибка обновления шаблонов:', err);
        btn.classList.replace('loading-orange', 'error-red');
        afNotify('⚠️ Шаблоны не обновились — подробности в консоли', 'error');
        setTimeout(() => {
            btn.classList.remove('error-red');
            btn.disabled = false;
        }, 2500);
    }
});

// ============================================================
// Отправка по Ctrl + Enter (или Cmd + Enter на macOS)
// ============================================================
$af('inp')?.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !e.isComposing && !e.repeat) {
        e.preventDefault(); // Предотвращает перенос строки
        $af('snd')?.click();
    }
});