// ============================================================
// ChMAF — AFhelper.js: главное окно шаблонов (AF_helper)
// ============================================================

var win_AFhelper = `
<div class="glass-panel" id="addTmpWrapper">

    <div class="flex-row chmaf-drag-handle" id="1str" style="padding-top: 5px;">
        <button class="glass-btn mainButton" id="languageAF" title="Переключает язык Русский/Английский">Русский</button>
        <button class="glass-btn mainButton" id="testCustTMPL" title="Свои шаблоны" aria-label="Свои шаблоны"><svg class="afh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4"/><path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg></button>
        <button class="glass-btn mainButton buttonHide" id="hideMenuMain" title="Скрывает расширение">Скрыть</button>

        <div class="flex-right">
            <button class="glass-btn mainButton" id="reminderstatus" title="Статус будильника 🔔 - вкл, 🔕 - выкл"></button>
            <button class="glass-btn mainButton" id="getnewtmpldata" title="Обновляет шаблоны">
                <span class="btn-icon"><svg class="afh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg></span>
            </button>
            <button class="glass-btn mainButton onlyfortp" id="addsrc" title="Доп. ссылки (нужен отдельный доступ)" aria-label="Доп. ссылки с доступом"><svg class="afh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg></button>
            <button class="glass-btn mainButton" id="links" title="Ссылки" aria-label="Ссылки"><svg class="afh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
            <button class="glass-btn mainButton" id="setting" title="Настройки" aria-label="Настройки"><svg class="afh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></button>
        </div>
    </div>

    <div class="flex-row" style="justify-content: center;">
        <input id="phone_tr" class="glass-input onlyfortp" placeholder="Телефон" autocomplete="off" type="tel" inputmode="tel" style="width: 180px; text-align: center;">
        <input id="email_tr" class="glass-input onlyfortp" placeholder="Почта" autocomplete="off" type="text" inputmode="email" style="width: 180px; text-align: center;">
    </div>

    <div class="afh-search" id="afhSearchBox">
        <input id="afhSearch" class="glass-input" type="search" autocomplete="off" spellcheck="false"
               placeholder="🔎 Поиск шаблона — по названию или тексту"
               aria-label="Поиск шаблона" aria-controls="afhSearchResults" aria-expanded="false">
        <div class="afh-search-results" id="afhSearchResults" role="listbox" hidden></div>
    </div>

    <div id="pages" style="margin-bottom: 5px; font-size: 17px;"></div>
    <div id="7str"></div>
    <div id="6str"></div>

    <textarea id="inp" class="glass-textarea" placeholder="Текст ответа (Ctrl+Enter — отправить)" style="width: 100%; min-height: 100px; max-height: 350px; resize: vertical; margin-bottom: 8px; box-sizing: border-box; font-size:17px"></textarea>

    <div id="hyperlnk" class="flex-row hyper-bar">
        <input id="bindlinktotext" class="glass-input" type="text" placeholder="Вставь ссылку, выдели текст и нажми Enter" title="Ссылка для встраивания. Enter — вставить, Esc — закрыть" style="flex-grow: 1; text-align: center;">
        <button class="glass-btn mainButton" id="insertlinktotext"><svg class="afh-ico afh-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Вставить</button>
    </div>

    <div class="flex-row chmaf-drag-handle">
        <button class="glass-btn mainButton" id="msg1" title="Отправить или доработать">Доработать</button>
        <button class="glass-btn mainButton msgtype" id="msg" title="Отправить в заметки или в чат">Чат</button>
        <button class="glass-btn mainButton" id="opandclsbarhyper" title="Прикрепить ссылку" aria-expanded="false" aria-label="Прикрепить ссылку"><svg class="afh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>
        <button class="glass-btn mainButton" id="sndbot" title="Отправить от имени бота" aria-label="Отправить от имени бота"><svg class="afh-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg></button>
        <button class="glass-btn mainButton primary" id="snd" title="Отправить текст (Ctrl+Enter)"><svg class="afh-ico afh-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>Send</button>

        <div class="flex-right">
            <button class="glass-btn mainButton" id="addtocusttmplt" title="Сохранить в личные шаблоны"><svg class="afh-ico afh-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/><line x1="12" x2="12" y1="7" y2="13"/><line x1="15" x2="9" y1="10" y2="10"/></svg>Tmpl</button>
            <button class="glass-btn mainButton onlyfortp" id="openVimbotWindows" title="Через Vimbot"><svg class="afh-ico afh-ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l6-3.5z" fill="currentColor"/></svg>Vimbot</button>
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
$af('hideMenuMain').addEventListener('click', function (event) {
    // «Скрыть» закрывает только окна шаблонов — Grabber (и его аналитика)
    // должен остаться в том состоянии, в котором был.
    event.stopPropagation();

    const keep = ['AF_Grabber', 'ag-analytics']
        .map((id) => [$af(id), $af(id)?.style.display, $af(id)?.hidden])
        .filter(([el]) => el);

    setTimeout(() => {
        keep.forEach(([el, display, hidden]) => {
            el.style.display = display;
            el.hidden = hidden;
        });
    }, 0);

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

// ============================================================
// 🔎 Поиск по шаблонам
// Ищет по названию кнопки и тексту шаблона во ВСЕХ вкладках,
// подсказывает, на какой вкладке лежит шаблон, показывает текст.
//  • клик / Enter — открыть вкладку и подсветить кнопку
//  • «Вставить» / Ctrl+Enter — сработать как клик по кнопке шаблона
//  • Esc — очистить поиск
//
// Кнопки вкладки рисуются только когда вкладка открыта, поэтому при
// первом поиске окно один раз «пролистывает» все вкладки (незаметно,
// содержимое на это время скрыто) и запоминает их шаблоны. Индекс
// пересобирается после «Обновить шаблоны» (новая table) и раз в 5 минут.
// ============================================================
(function initTemplateSearch() {
    const wrapper = $af('addTmpWrapper');
    const input = $af('afhSearch');
    const results = $af('afhSearchResults');
    if (!wrapper || !input || !results) return;

    const MAX_RESULTS = 30;
    const INDEX_TTL_MS = 5 * 60 * 1000;
    // Кнопки окна, которые не являются шаблонами
    const SERVICE_ZONES = '#pages, #afhSearchBox, #hyperlnk, #hyperlnk + .flex-row, #addTmpWrapper > .flex-row:first-child';

    let found = [];
    let activeIndex = -1;
    let debounceId = null;

    const norm = (s) => String(s ?? '').toLocaleLowerCase('ru-RU').replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();

    const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    /** Убирает HTML-разметку из текста шаблона (в таблице бывают <a>, <br>). */
    function plainText(s) {
        const div = document.createElement('div');
        div.innerHTML = String(s ?? '').replace(/<br\s*\/?>/gi, ' ');
        return div.textContent.replace(/\s+/g, ' ').trim();
    }

    const currentTable = () => (typeof table !== 'undefined' && Array.isArray(table) ? table : null);

    // --- Текст шаблона из таблицы (table из utils.js): строка, где есть название кнопки,
    //     и первая следующая за ним ячейка длиннее названия.
    let textCacheFor = null;
    let textCache = new Map();

    function textFromTable(label) {
        const rows = currentTable();
        if (!rows) return '';

        if (textCacheFor !== rows) {
            textCacheFor = rows;
            textCache = new Map();
        }
        if (textCache.has(label)) return textCache.get(label);

        let text = '';
        const key = norm(label);

        for (const row of rows) {
            if (!Array.isArray(row)) continue;
            const idx = row.findIndex((cell) => typeof cell === 'string' && norm(cell) === key);
            if (idx === -1) continue;

            const next = row.slice(idx + 1).find((cell) =>
                typeof cell === 'string' && cell.trim().length > label.length
            );
            if (next) { text = plainText(next); break; }
        }

        textCache.set(label, text);
        return text;
    }

    function textOf(btn, label) {
        const own = btn.dataset.text || btn.dataset.tmpl || btn.dataset.template ||
            (btn.value && btn.value !== label ? btn.value : '') ||
            (btn.title && btn.title !== label && btn.title.length > 20 ? btn.title : '');
        return own ? plainText(own) : textFromTable(label);
    }

    // --- Вкладки ---
    const getTabs = () => [...document.querySelectorAll('#pages button')];
    const getActiveTab = () =>
        document.querySelector('#pages .is-active, #pages [style*="orange"]') || null;
    const tabName = (tab) => (tab ? tab.textContent.trim() : 'текущая вкладка');

    function isTemplateButton(btn) {
        if (btn.closest(SERVICE_ZONES)) return false;
        const label = btn.textContent.trim();
        return Boolean(label) && label !== '🧹';
    }

    /** Шаблоны, которые сейчас есть в окне и видны. Вкладку определяем по активной. */
    function liveItems() {
        const activeTab = getActiveTab();
        return [...wrapper.querySelectorAll('button')]
            .filter((btn) => isTemplateButton(btn) && btn.offsetParent !== null)
            .map((btn) => {
                const label = btn.textContent.trim();
                const personal = btn.closest('[id="6str"]');
                const extra = btn.closest('#addTmp');
                const page = personal ? { name: 'Личные шаблоны', tab: null }
                    : extra ? { name: 'Доп. шаблоны', tab: null }
                        : { name: tabName(activeTab), tab: activeTab };
                return { btn, label, text: textOf(btn, label), page, visible: true };
            });
    }

    // --- Индекс всех вкладок: один раз пролистываем вкладки и запоминаем шаблоны ---
    let indexCache = null;      // [{ label, text, tabIndex, tabLabel }]
    let indexBuiltAt = 0;
    let indexTable = null;
    let indexPromise = null;

    const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

    let scanning = false;

    async function buildFullIndex() {
        scanning = true;
        const tabs = getTabs();
        const original = getActiveTab();
        const items = [];
        if (!tabs.length) return items;

        // Пока перебираем вкладки — содержимое скрыто, а высота зафиксирована,
        // чтобы окно не «прыгало», если вкладка рисуется не мгновенно
        const zone = $af('7str');
        const keepHeight = zone ? zone.offsetHeight : 0;
        if (zone) { zone.style.height = keepHeight + 'px'; zone.style.overflow = 'hidden'; }
        wrapper.classList.add('afh-scanning');
        try {
            for (let i = 0; i < tabs.length; i++) {
                const tab = tabs[i];
                const before = liveSignature();
                tab.click();
                // Вкладка обычно рисуется сразу; если нет — даём ей пару кадров
                if (liveSignature() === before) { await nextFrame(); }
                if (liveSignature() === before) { await nextFrame(); }

                liveItems()
                    .filter((it) => it.page.tab) // личные/доп. шаблоны видны всегда — их берём «вживую»
                    .forEach((it) => items.push({
                        label: it.label,
                        text: it.text,
                        tabIndex: i,
                        tabLabel: tab.textContent.trim()
                    }));
            }
        } finally {
            // Возвращаем вкладку, которая была открыта
            if (original && original.isConnected) original.click();
            else tabs[0]?.click();
            wrapper.classList.remove('afh-scanning');
            if (zone) { zone.style.height = ''; zone.style.overflow = ''; }
            scanning = false;
            requestAnimationFrame(() => { cleanupStale(); refreshMatches(); });
        }
        return items;
    }

    function liveSignature() {
        const zone = $af('7str');
        return zone ? zone.textContent.length + ':' + zone.childElementCount + ':' + (getActiveTab()?.id || '') : '';
    }

    function ensureIndex() {
        const stale = !indexCache ||
            indexTable !== currentTable() ||
            Date.now() - indexBuiltAt > INDEX_TTL_MS;

        if (!stale) return Promise.resolve(indexCache);
        if (indexPromise) return indexPromise;

        indexPromise = buildFullIndex()
            .then((items) => {
                indexCache = items;
                indexBuiltAt = Date.now();
                indexTable = currentTable();
                return items;
            })
            .catch((err) => {
                console.warn('[ChMAF] Поиск: не удалось просмотреть вкладки', err);
                return indexCache || [];
            })
            .finally(() => { indexPromise = null; });

        return indexPromise;
    }

    /** Живые шаблоны (с кнопками) + шаблоны других вкладок из индекса. */
    function allItems() {
        const live = liveItems();
        const activeTab = getActiveTab();
        const tabs = getTabs();
        const seen = new Set(live.map((it) => it.page.name + '\u0000' + it.label));

        const hidden = (indexCache || [])
            .filter((it) => {
                const tab = tabs[it.tabIndex];
                if (tab && tab === activeTab) return false; // эта вкладка открыта — берём «вживую»
                return !seen.has(it.tabLabel + '\u0000' + it.label);
            })
            .map((it) => ({
                btn: null,
                label: it.label,
                text: it.text,
                page: { name: it.tabLabel, tab: tabs[it.tabIndex] || null },
                visible: false
            }));

        return [...live, ...hidden].map((it) => ({ ...it, nLabel: norm(it.label), nText: norm(it.text) }));
    }

    function score(item, tokens) {
        let total = 0;
        for (const t of tokens) {
            if (item.nLabel.startsWith(t)) total += 30;
            else if (item.nLabel.includes(t)) total += 20;
            else if (item.nText.includes(t)) total += 5;
            else return 0; // все слова запроса должны найтись
        }
        return total + (item.visible ? 1 : 0);
    }

    /** Подсветка совпадений: сначала делим исходный текст, потом экранируем куски. */
    function highlight(text, tokens) {
        const parts = tokens.filter(Boolean)
            .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/е/g, '[её]'));
        if (!parts.length) return escHtml(text);

        const re = new RegExp(`(${parts.join('|')})`, 'gi');
        return String(text).split(re)
            .map((chunk, i) => (i % 2 ? `<mark>${escHtml(chunk)}</mark>` : escHtml(chunk)))
            .join('');
    }

    /** Фрагмент текста вокруг первого совпадения. */
    function snippet(text, tokens) {
        if (!text) return '';
        const n = norm(text);
        const pos = tokens.map((t) => n.indexOf(t)).filter((p) => p >= 0).sort((a, b) => a - b)[0] ?? 0;
        const start = Math.max(0, pos - 40);
        const cut = text.slice(start, start + 170);
        return (start > 0 ? '…' : '') + cut + (start + 170 < text.length ? '…' : '');
    }

    // Приглушение при поиске: класс .afh-searching на окне + .afh-match на совпавших кнопках.
    // Сам по себе .afh-match ничего не меняет внешне, поэтому даже если вкладка
    // сохранит кнопку вместе с классом, без активного поиска «залипания» не будет.
    // Кнопки, которые подсвечены прямо сейчас. WeakSet, а не data-атрибут: копия кнопки,
    // восстановленная вкладкой из сохранённого HTML, — это другой элемент, и её подсветка снимется.
    const flashing = new WeakSet();

    function setDimmed(matchSet) {
        wrapper.classList.toggle('afh-searching', Boolean(matchSet));
        wrapper.querySelectorAll('.afh-match, .afh-dim').forEach((b) => b.classList.remove('afh-match', 'afh-dim'));
        if (!matchSet) return;
        matchSet.forEach((btn) => btn?.classList.add('afh-match'));
    }

    /** Пересчитать совпадения для того, что сейчас на экране (после смены вкладки). */
    function refreshMatches() {
        const tokens = norm(input.value).split(' ').filter(Boolean);
        if (!tokens.length) { setDimmed(null); return; }

        const matched = liveItems()
            .filter((item) => score({ ...item, nLabel: norm(item.label), nText: norm(item.text) }, tokens) > 0)
            .map((item) => item.btn);
        setDimmed(new Set(matched));
    }

    /** Снять «залипшие» классы (подсветка, бегущая строка), если они попали в перерисованную вкладку. */
    function cleanupStale() {
        document.querySelectorAll('#AF_helper button.afh-found-flash, #AF_helper button.afh-marq-run, #AF_helper button.afh-dim')
            .forEach((btn) => {
                if (btn.matches(':hover, :focus') && !btn.classList.contains('afh-dim')) return;
                btn.classList.remove('afh-dim', 'afh-marq-run');
                if (!flashing.has(btn)) btn.classList.remove('afh-found-flash');
            });
        if (!input.value.trim()) setDimmed(null);
    }

    function closeResults() {
        results.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        activeIndex = -1;
    }

    function render(query) {
        const tokens = norm(query).split(' ').filter(Boolean);

        if (!tokens.length) {
            found = [];
            results.innerHTML = '';
            closeResults();
            setDimmed(null);
            return;
        }

        found = allItems()
            .map((item) => ({ item, s: score(item, tokens) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s || a.item.label.localeCompare(b.item.label, 'ru'))
            .map((x) => x.item);

        refreshMatches();

        const scanning = Boolean(indexPromise);

        if (!found.length) {
            results.innerHTML = scanning
                ? '<div class="afh-sr-empty"><span class="afh-sr-spinner"></span>Просматриваю все вкладки…</div>'
                : '<div class="afh-sr-empty">Ничего не нашлось. Попробуйте другое слово или часть слова.</div>';
        } else {
            const shown = found.slice(0, MAX_RESULTS);
            results.innerHTML = shown.map((item, i) => `
                <div class="afh-sr-item" role="option" data-i="${i}" aria-selected="false">
                    <div class="afh-sr-top">
                        <span class="afh-sr-label">${highlight(item.label, tokens)}</span>
                        <span class="afh-sr-page${item.visible ? ' is-here' : ''}" title="${item.visible ? 'Кнопка уже на экране' : 'Шаблон на вкладке «' + escHtml(item.page.name) + '»'}">${item.visible ? '✓ на экране' : '📁 ' + escHtml(item.page.name)}</span>
                        <button type="button" class="afh-sr-insert" data-i="${i}" title="Сработать как клик по шаблону (Ctrl+Enter)">Вставить</button>
                    </div>
                    ${item.text ? `<div class="afh-sr-text">${highlight(snippet(item.text, tokens), tokens)}</div>` : ''}
                </div>`).join('') +
                (found.length > MAX_RESULTS
                    ? `<div class="afh-sr-more">…и ещё ${found.length - MAX_RESULTS}. Уточните запрос.</div>`
                    : '') +
                (scanning ? '<div class="afh-sr-more"><span class="afh-sr-spinner"></span>Ищу и в остальных вкладках…</div>' : '');
        }

        results.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        setActive(found.length ? 0 : -1);
    }

    function setActive(i) {
        const items = results.querySelectorAll('.afh-sr-item');
        items.forEach((el) => el.setAttribute('aria-selected', 'false'));
        activeIndex = i;
        const el = items[i];
        if (el) {
            el.setAttribute('aria-selected', 'true');
            el.scrollIntoView({ block: 'nearest' });
        }
    }

    /** Находит кнопку шаблона на экране по названию (после переключения вкладки). */
    function findLiveButton(label) {
        return liveItems().find((it) => it.label === label)?.btn || null;
    }

    /** Открывает вкладку с шаблоном, подсвечивает кнопку и возвращает её. */
    async function reveal(item) {
        if (!item) return null;

        let btn = item.btn && item.btn.isConnected && item.btn.offsetParent !== null ? item.btn : null;

        if (!btn && item.page.tab) {
            item.page.tab.click();
            btn = findLiveButton(item.label);
            if (!btn) { await nextFrame(); btn = findLiveButton(item.label); }
        }

        if (!btn) {
            afNotify(`Шаблон «${item.label}» на вкладке «${item.page.name}», но кнопка не нашлась — обновите шаблоны`, 'warning');
            return null;
        }

        btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        flashing.add(btn);
        afFlash(btn, 'afh-found-flash', 1600);
        setTimeout(() => flashing.delete(btn), 1700);
        btn.focus({ preventScroll: true });
        return btn;
    }

    async function apply(item) {
        const btn = await reveal(item);
        if (!btn) return;
        btn.click();
        clearSearch();
    }

    function choose(item) {
        closeResults();
        // Совпадения пересчитываются для открывшейся вкладки
        reveal(item).then(refreshMatches);
    }

    function clearSearch() {
        input.value = '';
        render('');
        cleanupStale();
    }

    function runSearch() {
        render(input.value);
        // Индекс остальных вкладок ещё не готов или устарел — строим и перерисовываем
        if (input.value.trim() && (!indexCache || indexTable !== currentTable() || Date.now() - indexBuiltAt > INDEX_TTL_MS)) {
            ensureIndex().then(() => {
                if (input.value.trim()) render(input.value);
            });
            if (indexPromise) render(input.value); // показать «ищу в остальных вкладках…»
        }
    }

    input.addEventListener('input', () => {
        clearTimeout(debounceId);
        debounceId = setTimeout(runSearch, 80);
    });

    // Индекс начинаем строить сразу при фокусе — к моменту ввода он уже готов
    input.addEventListener('focus', () => {
        ensureIndex();
        if (input.value.trim()) runSearch();
    });

    input.addEventListener('keydown', (e) => {
        if (e.isComposing) return;
        const count = results.querySelectorAll('.afh-sr-item').length;

        if (e.key === 'ArrowDown' && count) {
            e.preventDefault();
            if (results.hidden) render(input.value);
            setActive(Math.min(activeIndex + 1, count - 1));
        } else if (e.key === 'ArrowUp' && count) {
            e.preventDefault();
            setActive(Math.max(activeIndex - 1, 0));
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault();
            const item = found[activeIndex];
            if (e.ctrlKey || e.metaKey) apply(item);
            else choose(item);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            clearSearch();
        }
    });

    // mousedown, а не click: иначе поле теряет фокус раньше, чем сработает выбор
    results.addEventListener('mousedown', (e) => {
        const insertBtn = e.target.closest('.afh-sr-insert');
        const row = e.target.closest('.afh-sr-item');
        if (!row) return;
        e.preventDefault();

        const item = found[Number((insertBtn || row).dataset.i)];
        if (insertBtn) apply(item);
        else choose(item);
    });

    results.addEventListener('mousemove', (e) => {
        const row = e.target.closest('.afh-sr-item');
        if (row && Number(row.dataset.i) !== activeIndex) setActive(Number(row.dataset.i));
    });

    // Клик мимо поиска закрывает список (подсветка совпадений остаётся, пока есть запрос)
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('#afhSearchBox')) closeResults();
    });

    // После «Обновить шаблоны» индекс устаревает
    $af('getnewtmpldata')?.addEventListener('click', () => { indexCache = null; });

    // Ручное переключение вкладки — пересчитать совпадения (или снять подсветку, если поиска нет)
    $af('pages')?.addEventListener('click', () => {
        if (scanning) return; // это сам поиск перебирает вкладки
        requestAnimationFrame(() => { cleanupStale(); refreshMatches(); });
    });

    // Вкладка перерисовалась (в т.ч. из сохранённой копии) — чистим состояние кнопок
    let cleanupScheduled = false;
    const zoneObserver = new MutationObserver(() => {
        if (scanning || cleanupScheduled) return;
        cleanupScheduled = true;
        requestAnimationFrame(() => {
            cleanupScheduled = false;
            cleanupStale();
            if (input.value.trim()) refreshMatches();
        });
    });
    ['7str', '6str', 'addTmp'].forEach((id) => {
        const el = $af(id);
        if (el) zoneObserver.observe(el, { childList: true, subtree: true });
    });
})();

// ============================================================
// Кнопки шаблонов: бегущая строка при наведении, если текст не влез
// (сетка и анимация — style.css, класс .afh-marq-run).
// Разметку кнопок не трогаем: текст сдвигается через text-indent.
// ============================================================
(function initTemplateMarquee() {
    const wrapper = $af('addTmpWrapper');
    if (!wrapper) return;

    const SPEED_PX_PER_SEC = 45;
    const ZONES = '[id="7str"], [id="6str"], #addTmp';

    function isTemplateButton(el) {
        return el instanceof HTMLButtonElement &&
            el.matches('button.glass-btn.mainButton') &&
            Boolean(el.closest(ZONES)) &&
            !el.parentElement?.querySelector(':scope > input, :scope > select, :scope > textarea');
    }

    function start(btn) {
        btn.classList.remove('afh-marq-run');
        const overflow = btn.scrollWidth - btn.clientWidth;
        if (overflow <= 2) return;

        btn.style.setProperty('--afh-marq-shift', `-${overflow + 6}px`);
        btn.style.setProperty('--afh-marq-time', `${Math.max(1.6, overflow / SPEED_PX_PER_SEC + 1).toFixed(2)}s`);
        btn.classList.add('afh-marq-run');
    }

    function stop(btn) {
        btn.classList.remove('afh-marq-run');
    }

    wrapper.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('button');
        if (btn && !btn.contains(e.relatedTarget) && isTemplateButton(btn)) start(btn);
    });

    wrapper.addEventListener('mouseout', (e) => {
        const btn = e.target.closest('button');
        if (btn && !btn.contains(e.relatedTarget)) stop(btn);
    });

    // С клавиатуры (и после поиска) — для кнопки в фокусе
    wrapper.addEventListener('focusin', (e) => { if (isTemplateButton(e.target)) start(e.target); });
    wrapper.addEventListener('focusout', (e) => { if (e.target instanceof HTMLButtonElement) stop(e.target); });
})();