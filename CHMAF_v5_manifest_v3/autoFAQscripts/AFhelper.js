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

// ============================================================
// 🔎 Поиск по шаблонам
// Ищет по названию кнопки и тексту шаблона во всех вкладках,
// подсказывает, на какой вкладке лежит шаблон, показывает текст.
//  • клик / Enter — открыть вкладку и подсветить кнопку
//  • «Вставить» / Ctrl+Enter — сработать как клик по кнопке шаблона
//  • Esc — очистить поиск
// Индекс строится из DOM при каждом поиске, поэтому после
// «Обновить шаблоны» ничего пересобирать не нужно.
// ============================================================
(function initTemplateSearch() {
    const wrapper = $af('addTmpWrapper');
    const input = $af('afhSearch');
    const results = $af('afhSearchResults');
    if (!wrapper || !input || !results) return;

    const MAX_RESULTS = 30;
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

    // --- Текст шаблона из таблицы (table из utils.js): строка, где есть название кнопки,
    //     и первая следующая за ним ячейка длиннее названия. Кэш — на каждую версию table.
    let textCacheFor = null;
    let textCache = new Map();

    function textFromTable(label) {
        const rows = typeof table !== 'undefined' && Array.isArray(table) ? table : null;
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

    /** Вкладка, на которой лежит кнопка: ищем предка, для которого есть кнопка «<id>_button». */
    function pageOf(btn) {
        for (let el = btn.parentElement; el && el !== wrapper; el = el.parentElement) {
            if (el.id) {
                const tab = document.getElementById(el.id + '_button');
                if (tab && tab.closest('#pages')) return { name: tab.textContent.trim(), tab };
            }
            if (el.id === '6str') return { name: 'Личные шаблоны', tab: null };
            if (el.id === 'addTmp') return { name: 'Доп. шаблоны', tab: null };
        }
        const active = document.querySelector('#pages .is-active, #pages [style*="orange"]');
        return { name: active ? active.textContent.trim() : 'текущая вкладка', tab: null };
    }

    function isTemplateButton(btn) {
        if (btn.closest(SERVICE_ZONES)) return false;
        const label = btn.textContent.trim();
        if (!label || label === '🧹') return false;
        return true;
    }

    function buildIndex() {
        return [...wrapper.querySelectorAll('button')]
            .filter(isTemplateButton)
            .map((btn) => {
                const label = btn.textContent.trim();
                const text = textOf(btn, label);
                return {
                    btn, label, text,
                    page: pageOf(btn),
                    visible: btn.offsetParent !== null,
                    nLabel: norm(label),
                    nText: norm(text)
                };
            });
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

    function setDimmed(matchSet) {
        wrapper.classList.toggle('afh-searching', Boolean(matchSet));
        wrapper.querySelectorAll('.afh-dim').forEach((b) => b.classList.remove('afh-dim'));
        if (!matchSet) return;
        buildIndex().forEach((item) => {
            if (item.visible && !matchSet.has(item.btn)) item.btn.classList.add('afh-dim');
        });
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

        found = buildIndex()
            .map((item) => ({ item, s: score(item, tokens) }))
            .filter((x) => x.s > 0)
            .sort((a, b) => b.s - a.s || a.item.label.localeCompare(b.item.label, 'ru'))
            .map((x) => x.item);

        setDimmed(new Set(found.map((f) => f.btn)));

        if (!found.length) {
            results.innerHTML = '<div class="afh-sr-empty">Ничего не нашлось. Попробуйте другое слово или часть слова.</div>';
        } else {
            const shown = found.slice(0, MAX_RESULTS);
            results.innerHTML = shown.map((item, i) => `
                <div class="afh-sr-item" role="option" data-i="${i}" aria-selected="false">
                    <div class="afh-sr-top">
                        <span class="afh-sr-label">${highlight(item.label, tokens)}</span>
                        <span class="afh-sr-page${item.visible ? ' is-here' : ''}">${item.visible ? '✓ на экране' : '📁 ' + escHtml(item.page.name)}</span>
                        <button type="button" class="afh-sr-insert" data-i="${i}" title="Сработать как клик по шаблону (Ctrl+Enter)">Вставить</button>
                    </div>
                    ${item.text ? `<div class="afh-sr-text">${highlight(snippet(item.text, tokens), tokens)}</div>` : ''}
                </div>`).join('') +
                (found.length > MAX_RESULTS
                    ? `<div class="afh-sr-more">…и ещё ${found.length - MAX_RESULTS}. Уточните запрос.</div>`
                    : '');
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

    /** Открывает вкладку с шаблоном и подсвечивает кнопку. */
    function reveal(item) {
        if (!item) return;
        if (item.btn.offsetParent === null && item.page.tab) item.page.tab.click();

        requestAnimationFrame(() => {
            if (item.btn.offsetParent === null) {
                afNotify(`Шаблон «${item.label}» на вкладке «${item.page.name}», но открыть её не удалось`, 'warning');
                return;
            }
            item.btn.classList.remove('afh-dim');
            item.btn.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            afFlash(item.btn, 'afh-found-flash', 1600);
            item.btn.focus({ preventScroll: true });
        });
    }

    function apply(item) {
        if (!item) return;
        reveal(item);
        requestAnimationFrame(() => {
            item.btn.click();
            clearSearch();
        });
    }

    function clearSearch() {
        input.value = '';
        render('');
    }

    input.addEventListener('input', () => {
        clearTimeout(debounceId);
        debounceId = setTimeout(() => render(input.value), 80);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim()) render(input.value);
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
            else { reveal(item); closeResults(); }
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
        else { reveal(item); closeResults(); }
    });

    results.addEventListener('mousemove', (e) => {
        const row = e.target.closest('.afh-sr-item');
        if (row && Number(row.dataset.i) !== activeIndex) setActive(Number(row.dataset.i));
    });

    // Клик мимо поиска закрывает список (подсветка совпадений остаётся, пока есть запрос)
    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('#afhSearchBox')) closeResults();
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