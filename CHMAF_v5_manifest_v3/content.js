'use strict';
// ═══════════════════════════════════════════════════════════════
// ВАЖНО: этот файл грузится ПОСЛЕ utils.js и разделяет scope.
// НЕ ОБЪЯВЛЯЕМ повторно переменные из utils.js (table, scriptAdr,
// opsection, bool) — иначе SyntaxError.
// ═══════════════════════════════════════════════════════════════

if (typeof window.Settings === 'undefined') {
    window.Settings = {
        get(key) { try { return localStorage.getItem(key); } catch { return null; } },
        set(key, value) { try { localStorage.setItem(key, value); } catch { } }
    };
}

chrome.runtime.sendMessage({ question: 'get-extension-id' }, (result) => {
    if (chrome.runtime.lastError) {
        console.warn('[ChMAF] get-extension-id:', chrome.runtime.lastError.message);
        return;
    }
    if (result) try { localStorage.setItem('ext_id', result); } catch { }
});

const AF_ORIGIN = 'https://skyeng.autofaq.ai';
const SERVER_THEMES_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxNjuQ7EbZZkLEfC1_aSoK4ncsF0W0XSkjYttCj2nQ23BBzMEmDq-vqJL3MvwJk9Pnm_g/exec';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const subjectTranslations = {
    algebra: 'Алгебра', basemath: 'Математика', biology: 'Биология',
    chemistry: 'Химия', computer: 'Информатика', english: 'Английский',
    geography: 'География', geometry: 'Геометрия', history: 'История',
    literature: 'Литература', math: 'Математика', physics: 'Физика',
    russian: 'Русский язык', social: 'Обществознание'
};
const formatTranslations = {
    webinar: 'ВЕБИНАР', f2g: 'F2G', coach: 'Практика с коучем',
    f2f: 'F2F', life: 'Разговорные Клубы', talks: 'Talks'
};
const MEDIA_TYPES = [
    { extensions: /\.(mp4|mov|mkv|webm)$/i, label: 'Видео📺', labelType: 'video-label', tag: 'video', playerType: 'video-player' },
    { extensions: /\.(mp3|wav|ogg|oga)$/i, label: '🎧 Аудио', labelType: 'audio-label', tag: 'audio', playerType: 'audio-player' }
];
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp)$/i;

// ⚡ ТОЛЬКО локальные для content.js переменные
// (глобальные table/scriptAdr/opsection/bool — из utils.js)
let aftoken = '';
let operatorFullTitle = '';
let operatorId = '';
let operatorsarray = [];
let template_flag = 0;
let template_flag2 = 0;
let word_text = '';
let template_text = '';
let flagggg = 0;
let templatesAF = [];
let chatsArray = [];
let soundintervalset;
let flagsearch;
let foundarr;
let operchatsdata;
let isChatOnOperator = false;
let flag = 0;
let audio;
let selectedinpth = 'calendarmyinputsdark';
let otherinpth = 'othercalendardark';
let flagTokenGlobal = '';

// Очистка мусора AutoFAQ
const LS_GARBAGE_RE = /^(SMART_TABLE\.|messageContent\.)/;
try {
    Object.keys(localStorage).forEach((key) => {
        if (LS_GARBAGE_RE.test(key)) localStorage.removeItem(key);
    });
    localStorage.setItem('SMART_TABLE_SORTED_INFO(/tickets/archive)', '{"columnKey":"ts","order":"descend"}');
} catch { }

{
    const savedSound = localStorage.getItem('sound_str');
    audio = new Audio(savedSound || 'https://dimentorexpo.github.io/Sounds/msg.mp3');
}

// ============================================================
// Идентификация оператора
// ============================================================
async function findOperator(fullName) {
    try {
        const state = await fetchStaticData();
        if (!Array.isArray(state.onOperator)) throw new Error('onOperator не массив');
        operatorsarray = state.onOperator;
        const user = state.onOperator.find((op) => op.operator?.fullName === fullName);
        if (user) {
            operatorId = user.operator?.id ?? '';
            return user;
        }
        console.warn(`[ChMAF] Оператор "${fullName}" не найден`);
        return null;
    } catch (error) {
        console.error('[ChMAF] findOperator:', error);
        return null;
    }
}

let whoAmICompleted = false;

// ⚡ Валидация заголовка оператора формата "ОТДЕЛ-Фамилия Имя".
// Mantine рендерит множество span[id$="-target"] (фильтры, селекты статусов и т.п.),
// и ПЕРВЫЙ попавшийся — не всегда селектор отдела. Без валидации whoAmI
// "защёлкивал" чужой текст в opsection навсегда (whoAmICompleted=true),
// из-за чего isTP считался false и элементы .onlyfortp не появлялись до F5.
function parseOperatorTitle(raw) {
    const title = (raw || '').replace(/\s+/g, ' ').trim();
    const dash = title.indexOf('-');
    if (dash < 1) return null;
    const section = title.slice(0, dash).trim();
    const name = title.slice(dash + 1).trim();
    // Префикс отдела короткий и без цифр (ТП, ТП ОС, КЦ, Prem, ТПPrem...), имя не пустое
    if (section.length < 2 || section.length > 15 || /\d/.test(section) || name.length < 2) return null;
    return { title, section };
}

async function whoAmI() {
    if (whoAmICompleted) return true;
    if (!location.host.includes('autofaq')) return false;
    const tokenMatch = document.cookie.match(/csrf_token=([^;]*)/);
    if (!tokenMatch) return false;
    aftoken = tokenMatch[1];
    applyLoginStatus();

    // ⚡ Кандидаты: имя в шапке сайта + ВСЕ mantine-селекторы в iframe.
    // Берём первый текст, прошедший валидацию "ОТДЕЛ-Имя"; мусорные селекторы
    // пропускаем — return false, и waitForOperator повторит попытку позже.
    const candidates = [];
    const menuNameField = document.getElementsByClassName('user_menu-dropdown-user_name')[0];
    if (menuNameField) candidates.push(menuNameField.textContent);
    const iframeDoc = getIframeDoc();
    if (iframeDoc) {
        iframeDoc.querySelectorAll('span[id^="mantine-"][id$="-target"]')
            .forEach(el => candidates.push(el.textContent));
    }

    for (const raw of candidates) {
        const parsed = parseOperatorTitle(raw);
        if (!parsed) continue;
        operatorFullTitle = parsed.title;
        opsection = parsed.section; // ⚡ уже trim → строгие сравнения 'ТП' везде работают
        findOperator(operatorFullTitle);
        whoAmICompleted = true;
        return true;
    }
    return false;
}
window.whoAmI = whoAmI;

function readCsrfFromCookie() {
    const match = document.cookie.match(/csrf_token=([^;]*)/);
    return match ? match[1] : '';
}
function getCsrfToken() {
    if (!aftoken) aftoken = readCsrfFromCookie();
    return aftoken;
}

async function afApiFetch(url, options = {}) {
    options.credentials = options.credentials || 'include';
    options.headers = { 'x-csrf-token': getCsrfToken(), ...(options.headers || {}) };
    let response = await fetch(url, options);
    if (response.status === 403) {
        const freshToken = readCsrfFromCookie();
        if (freshToken && freshToken !== aftoken) {
            aftoken = freshToken;
            options.headers['x-csrf-token'] = freshToken;
            response = await fetch(url, options);
        }
    }
    if (!response.ok) {
        let details = '';
        try { details = (await response.text()).slice(0, 300); } catch { }
        console.error(`[ChMAF API] ${options.method || 'GET'} ${url} → ${response.status}`, details);
    }
    return response;
}

function changeStatus(status, token = aftoken) {
    return afApiFetch(`${AF_ORIGIN}/api/reason8/operator/status`, {
        method: 'POST',
        referrer: `${AF_ORIGIN}/tickets/archive`,
        referrerPolicy: 'strict-origin-when-cross-origin',
        headers: Object.assign({ 'content-type': 'application/json' }, token ? { 'x-csrf-token': token } : {}),
        body: JSON.stringify({ command: 'DO_SET_OPERATOR_STATUS', status, source: 'Operator' })
    }).then(() => console.log(`Status → ${status}`)).catch(console.error);
}

let loginStatusApplied = false;
function applyLoginStatus() {
    if (loginStatusApplied || window.location.pathname === '/login' || !aftoken) return;
    const savedStatus = window.Settings.get('defaultStatusAfterLogin') || window.Settings.get('afterLoginFunction') || 'Online';
    loginStatusApplied = true;
    changeStatus(savedStatus, aftoken);
}

function resetFlags() { template_flag = 0; template_flag2 = 0; }

async function sendComment(txt, activeConvId) {
    const values = await window.getInfo?.(0);
    if (!values) return;
    const conversationId = activeConvId || values[1];
    const sessionId = values[2];
    resetFlags();
    const formData = new FormData();
    formData.append('payload', JSON.stringify({ sessionId, conversationId, text: txt, isComment: true }));
    afApiFetch(`${AF_ORIGIN}/api/reason8/answers`, { method: 'POST', body: formData }).catch(console.error);
}

function newTaggg(tagName) {
    const chatId = getChatId();
    if (!chatId) return;
    afApiFetch(`${AF_ORIGIN}/api/conversation/${chatId}/payload`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ conversationId: chatId, elements: [{ name: 'tags', value: [tagName] }] })
    }).catch(() => { });
}

async function doOperationsWithHistory(body = '') {
    if (typeof body !== 'string' && typeof body !== 'object') throw new Error('body must be string or object');
    const response = await afApiFetch(`${AF_ORIGIN}/api/conversations/history`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: typeof body === 'object' ? JSON.stringify(body) : body
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

async function doOperationsWithConversations(id) {
    if (typeof window.CONFIGSTAT === 'undefined') throw new Error('CONFIGSTAT not defined');
    const response = await afApiFetch(`${window.CONFIGSTAT.API.BASE_URL}${window.CONFIGSTAT.API.CONVERSATIONS}/${id}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

async function fetchStaticData() {
    const response = await afApiFetch(`${AF_ORIGIN}/api/operators/statistic/currentState`, { method: 'GET' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

// ============================================================
// DOM-утилиты
// ============================================================
function setDisplayStyle(element, value) { element.style.display = value; }
function onlyNumber(object) { sanitizeInput(object, /[^0-9-]/g); }
function onlyNumbers(object) { sanitizeInput(object, /[^0-9]/g); }
function sanitizeInput(object, garbagePattern) { if (object) object.value = object.value.replace(garbagePattern, ''); }
function toggleButtonState(buttonId, className) { document.getElementById(buttonId)?.classList.toggle(className); }
function addOption(oListbox, text, value) {
    const oOption = document.createElement('option');
    oOption.appendChild(document.createTextNode(text));
    oOption.setAttribute('value', value);
    oListbox.appendChild(oOption);
}

// ⚡ waitForElement с cleanup через cleanupRegistry
function waitForElement(selector, callback, timeout = 10000, interval = 100) {
    const startTime = Date.now();
    const intervalId = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
            clearInterval(intervalId);
            try { callback(); } catch (e) { console.error(e); }
        } else if (Date.now() - startTime > timeout) {
            clearInterval(intervalId);
            console.error(`Элемент ${selector} не найден за ${timeout / 1000}с.`);
        }
    }, interval);
    window.cleanupRegistry?.register(() => clearInterval(intervalId));
}

function createAndShowButton(message, type = 'message') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type, { html: true });
        return;
    }
    let toast = document.querySelector('.cyber-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'cyber-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = message;
    toast.className = `cyber-toast ${type}`;
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 5000);
}
window.createAndShowButton = createAndShowButton;

// ============================================================
// Медиа в сообщениях
// ============================================================
let processTimer = null;
function scheduleProcessAll() {
    clearTimeout(processTimer);
    processTimer = setTimeout(processAll, 150);
}

function initObservers() {
    if (!document.body) {
        document.addEventListener('DOMContentLoaded', initObservers, { once: true });
        return;
    }
    new MutationObserver(scheduleProcessAll).observe(document.body, { childList: true, subtree: true });
    if (location.host.includes('autofaq')) {
        waitForIframeDoc((doc) => {
            new MutationObserver(scheduleProcessAll).observe(doc.body, { childList: true, subtree: true });
            scheduleProcessAll();
        });
    }
}

function getIframeDoc() {
    const iframe = document.querySelector('iframe.NEW_FRONTEND__frame') ||
        document.querySelector('iframe[class^="NEW_FRONTEND"]') ||
        document.querySelector('[class^="NEW_FRONTEND"] iframe');
    if (!iframe) return null;
    try { return iframe.contentDocument || iframe.contentWindow?.document || null; }
    catch { return null; }
}

function waitForIframeDoc(callback) {
    const tryGet = () => {
        const doc = getIframeDoc();
        if (doc && doc.body) callback(doc);
        else setTimeout(tryGet, 200);
    };
    tryGet();
}

function processAll() {
    handleRootDocument(document, true);
    const iframeDoc = getIframeDoc();
    if (iframeDoc) handleRootDocument(iframeDoc, false);
}

const MEDIA_LABEL_CSS = 'color:#e2e8f0;font-weight:600;background:linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(185, 28, 28, 0.9));border:1px solid rgba(255,255,255,0.15);border-radius:10px;text-align:center;font-size:14px;padding:6px 12px;margin-top:8px;';
const MEDIA_PLAYER_CSS = 'max-width:300px;display:block;margin-top:8px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.4);';

function handleRootDocument(root, isOldUi) {
    const selector = isOldUi ? '.chat-messages a[href]' : 'div[class*="ChatMessages_RegularMessageContent"] a[href]';
    const links = root.querySelectorAll(selector);
    if (!links.length) return;
    links.forEach((link) => {
        if (link.dataset.processed === '1') return;
        const href = link.href || '';
        if (!href) return;
        const mediaType = MEDIA_TYPES.find((t) => t.extensions.test(href));
        if (mediaType) {
            link.dataset.processed = '1';
            insertMediaPreview(root, link, href, mediaType);
        } else if (IMAGE_EXTENSIONS.test(href)) {
            link.dataset.processed = '1';
            const img = root.createElement('img');
            img.src = href; img.style.width = '120px'; img.style.cursor = 'zoom-in';
            img.dataset.full = href;
            img.addEventListener('click', openImageViewer);
            link.replaceWith(img);
        }
    });
}

function insertMediaPreview(root, link, href, mediaType) {
    const parent = link.closest('div, p, span') || link.parentElement;
    if (!parent) return;
    const label = root.createElement('div');
    label.dataset.type = mediaType.labelType;
    label.style.cssText = MEDIA_LABEL_CSS;
    label.textContent = mediaType.label;
    const player = root.createElement(mediaType.tag);
    player.src = href; player.controls = true; player.preload = 'metadata';
    player.style.cssText = MEDIA_PLAYER_CSS + 'opacity:0;transition:opacity 0.3s ease;';
    player.dataset.type = mediaType.playerType;
    player.addEventListener('loadedmetadata', () => { player.style.opacity = '1'; }, { once: true });
    setTimeout(() => { if (player.style.opacity === '0') player.style.opacity = '1'; }, 1000);
    parent.insertAdjacentElement('afterend', label);
    label.insertAdjacentElement('afterend', player);
}

function openImageViewer(e) {
    const src = e.target.dataset.full;
    if (!src) return;
    const overlay = document.createElement('div');
    overlay.dataset.type = 'img-viewer';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(12px);display:flex;justify-content:center;align-items:center;z-index:999999;cursor:zoom-out;';
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = 'max-width:90%;max-height:90%;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.7);';
    overlay.appendChild(img);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.remove());
}

initObservers();
scheduleProcessAll();

// ============================================================
// Панель шаблонов
// ============================================================
function initializeMyLogic() {
    if (!document.getElementById('AF_helper')) console.error('AF_helper не найден');
}
if (location.host === 'skyeng.autofaq.ai') waitForElement('#AF_helper', initializeMyLogic);

function pageClick(event) {
    const clickedBtn = event.currentTarget;
    const pageNum = clickedBtn.id.split('_')[0];
    document.querySelectorAll('#pages button').forEach((btn) => {
        btn.style.backgroundColor = 'rgba(36, 62, 229, 0.5)';
        btn.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
    });
    for (let i = 0; i < 100; i++) {
        const page = document.getElementById(i + 'page');
        if (!page) break;
        page.style.display = 'none';
    }
    clickedBtn.style.backgroundColor = 'rgba(34, 139, 34, 0.5)';
    clickedBtn.style.borderTop = '3px solid orange';
    const targetPage = document.getElementById(pageNum + 'page');
    if (targetPage) targetPage.style.display = 'block';
}

// ⚡ ИСПРАВЛЕНО: использует table из utils.js (общий scope)
function refreshTemplates() {
    if (location.host !== 'skyeng.autofaq.ai') return;
    if (!table || !table.length) {
        console.warn('Ожидание загрузки шаблонов...');
        return;
    }
    const pagesContainer = document.getElementById('pages');
    const contentArea = document.getElementById('7str');
    const addTmpElement = document.getElementById('addTmp');
    if (!pagesContainer || !contentArea) return;

    pagesContainer.innerHTML = '';
    document.querySelectorAll('[id$="page"]').forEach((el) => el.remove());
    if (addTmpElement) addTmpElement.innerHTML = '';

    let countOfStr = 0, countOfPages = 0, pageType = '', addTmpFlag = 0;
    let currentPage = null, currentRow = null;

    const makeRow = (extraClass = '') => {
        currentRow = document.createElement('div');
        currentRow.className = `flex-row${extraClass ? ' ' + extraClass : ''}`;
        currentRow.id = `${countOfPages}page_${countOfStr}str`;
        currentPage.appendChild(currentRow);
        return currentRow;
    };
    const makeClearButton = (title, onClear) => {
        const btn = document.createElement('button');
        btn.textContent = '🧹'; btn.title = title; btn.className = 'glass-btn mainButton';
        btn.onclick = onClear;
        return btn;
    };

    for (const row of table) {
        switch (row[0]) {
            case '':
                addTmpFlag = 0; countOfStr++;
                currentRow = document.createElement('div');
                currentRow.className = 'flex-row chmaf-drag-handle';
                currentRow.id = `${countOfPages}page_${countOfStr}str`;
                if (currentPage) currentPage.appendChild(currentRow);
                break;
            case 'Additional templates':
                addTmpFlag = 1;
                if (addTmpElement) addTmpElement.className = 'flex-row glass-panel';
                break;
            case 'Страница': {
                const pageBtn = document.createElement('button');
                pageBtn.textContent = row[1];
                pageBtn.className = 'glass-btn mainButton';
                pageBtn.id = `${countOfPages}_page_button`;
                pageBtn.addEventListener('click', pageClick);
                pagesContainer.appendChild(pageBtn);
                pageType = row[2];
                currentPage = document.createElement('div');
                currentPage.id = `${countOfPages}page`;
                contentArea.appendChild(currentPage);
                countOfPages++; countOfStr = 1;
                if (pageType === 'Серверные') buildServerInputsSection();
                makeRow();
                break;
            }
            default: {
                const templateBtn = document.createElement('button');
                templateBtn.textContent = row[0];
                templateBtn.className = 'glass-btn mainButton';
                if (pageType === 'Шаблоны') {
                    if (templateBtn.textContent === 'ус+брауз (П)') continue;
                    if (templateBtn.textContent === 'Урок NS') templateBtn.id = 'NS';
                    if (templateBtn.textContent === 'ус+брауз (У)') templateBtn.textContent = 'ус+брауз';
                    templateBtn.addEventListener('click', (event) => window.buttonsFromDoc?.(event.target.textContent));
                    if (addTmpFlag === 0 && currentRow) currentRow.appendChild(templateBtn);
                    else if (addTmpElement) addTmpElement.appendChild(templateBtn);
                } else if (pageType === 'Серверные') {
                    templateBtn.addEventListener('click', () => window.servFromDoc?.());
                    if (currentRow) currentRow.appendChild(templateBtn);
                }
                break;
            }
        }
    }
    bindAddTmpToggle(addTmpElement);
    document.getElementById('0_page_button')?.click();

    function buildServerInputsSection() {
        const linkRow = makeRow();
        const linkInput = document.createElement('input');
        linkInput.id = 'avariyalink';
        linkInput.placeholder = 'Ссылка на трэд или Jira северных';
        linkInput.autocomplete = 'off'; linkInput.className = 'glass-input';
        linkInput.style.flexGrow = '1';
        linkRow.appendChild(linkInput);
        linkRow.appendChild(makeClearButton('Очистить', () => { linkInput.value = ''; }));

        const themeRow = document.createElement('div');
        themeRow.className = 'flex-row';
        const themeSelect = document.createElement('select');
        themeSelect.id = 'avariyatema'; themeSelect.className = 'glass-input';
        themeSelect.style.flexGrow = '1';
        const placeholderOption = document.createElement('option');
        placeholderOption.text = 'Выбери тематику для серверных';
        placeholderOption.selected = true; placeholderOption.disabled = true;
        placeholderOption.value = 'thenenotselect';
        placeholderOption.style.cssText = 'background-color:orange;color:white;';
        themeSelect.add(placeholderOption);
        themeRow.appendChild(themeSelect);
        themeRow.appendChild(makeClearButton('Сбросить тему', () => { themeSelect.selectedIndex = 0; }));
        currentPage.appendChild(themeRow);

        const themesInterval = setInterval(async () => {
            if (!themeSelect.isConnected || themeSelect.children.length > 1) {
                clearInterval(themesInterval);
                return;
            }
            try {
                const response = await fetch(SERVER_THEMES_SCRIPT_URL);
                const data = await response.json();
                data.result?.forEach((item) => addOption(themeSelect, item[3], item[4]));
                clearInterval(themesInterval);
            } catch (e) { console.error('Ошибка загрузки серверных тем:', e); }
        }, 4000);
        window.cleanupRegistry?.register(() => clearInterval(themesInterval));
        countOfStr++;
    }

    function bindAddTmpToggle(target) {
        if (!target || target.childElementCount === 0) return;
        document.getElementById('0page')?.addEventListener('dblclick', (event) => {
            if (window.checkelementtype?.(event)) {
                target.style.display = target.style.display === 'none' ? 'flex' : 'none';
            }
        });
    }
}
window.refreshTemplates = refreshTemplates;

function timerHideButtons() {
    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;
    const modalHeader = iframeDoc.getElementsByClassName('mantine-Modal-header')[0];
    const modalClose = iframeDoc.getElementsByClassName('mantine-Modal-close')[0];
    if (modalHeader && modalClose && !iframeDoc.getElementById('maskBackHide')) {
        modalHeader.insertBefore(maskBackHide, modalClose);
    }
}
window.timerHideButtons = timerHideButtons;

// ============================================================
// Кнопки маскировки
// ============================================================
const maskBack = document.createElement('button');
maskBack.id = 'maskBack';
maskBack.innerHTML = '↩️';
maskBack.title = 'Вернуть скрытое окно';
maskBack.style.display = 'none';
maskBack.classList.add('gpanneon-glass-btn', 'fab-premium');

const maskBackHide = document.createElement('span');
maskBackHide.id = 'maskBackHide';
maskBackHide.innerHTML = '❌ Скрыть';
maskBackHide.style.cssText = 'margin-left:auto;margin-right:10px;cursor:pointer;display:none;padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600;background:linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08));border:1px solid rgba(239,68,68,0.3);color:#fca5a5;';

let isMasked = false;

function getMaskTargets(iframeDoc) {
    return {
        modalMask: iframeDoc.querySelector('.mantine-Modal-root'),
        chatActions: iframeDoc.querySelector('#__next [class^="ConversationActions_Actions"]'),
        notesButton: iframeDoc.querySelector('.mantine-RichTextEditor-control')
    };
}

function getCurrentChatIdentity() {
    return {
        name: getActiveConvUserName(),
        email: SearchinAFnewUI('email'),
        phone: SearchinAFnewUI('phone')
    };
}

maskBack.onclick = function () {
    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;
    const saved = {
        name: maskBack.getAttribute('name'),
        email: maskBack.getAttribute('email'),
        phone: maskBack.getAttribute('phone')
    };
    const current = getCurrentChatIdentity();
    if (current.name === saved.name && current.email === saved.email && current.phone === saved.phone) {
        const { modalMask, chatActions, notesButton } = getMaskTargets(iframeDoc);
        if (modalMask) modalMask.style.display = 'block';
        if (chatActions) chatActions.style.display = 'flex';
        if (notesButton) notesButton.style.display = 'flex';
        isMasked = false;
        maskBack.style.display = 'none';
    } else {
        maskBack.innerHTML = '❌';
        maskBack.title = 'Открыт не тот чат';
        setTimeout(() => { maskBack.innerHTML = '↩️'; maskBack.title = 'Вернуть скрытое окно'; }, 3000);
    }
};

maskBackHide.onclick = function () {
    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;
    const { modalMask, chatActions, notesButton } = getMaskTargets(iframeDoc);
    if (modalMask) modalMask.style.display = 'none';
    if (chatActions) chatActions.style.display = 'none';
    if (notesButton) notesButton.style.display = 'none';
    const current = getCurrentChatIdentity();
    maskBack.setAttribute('name', current.name);
    maskBack.setAttribute('email', current.email);
    maskBack.setAttribute('phone', current.phone);
    isMasked = true;
    maskBackHide.style.display = 'none';
    maskBack.style.display = 'inline-block';
};

// ============================================================
// ⚡ ЕДИНЫЙ uiTick с CLEANUP
// ============================================================
let uiTickIntervalId = null;
function startUiTick() {
    if (uiTickIntervalId !== null) return;
    uiTickIntervalId = setInterval(uiTick, 1000);
    window.cleanupRegistry?.register(() => {
        clearInterval(uiTickIntervalId);
        uiTickIntervalId = null;
    });
}

function uiTick() {
    ensureMaskButtonsPlacement();
    updateContactPlaceholders();
    injectChatCardStyle();
}

function ensureMaskButtonsPlacement() {
    const rightPanel = document.getElementById('rightPanel');
    if (rightPanel && !rightPanel.contains(maskBack)) rightPanel.appendChild(maskBack);
    if (isMasked) return;
    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;
    const modalMask = iframeDoc.querySelector('.mantine-Modal-root');
    if (modalMask && modalMask.style.display !== 'none') {
        const modalHeader = modalMask.querySelector('.mantine-Modal-header');
        if (modalHeader) {
            if (!modalHeader.contains(maskBackHide)) modalHeader.appendChild(maskBackHide);
            maskBackHide.style.display = 'inline-block';
        }
    } else {
        maskBackHide.style.display = 'none';
    }
}

function updateContactPlaceholders() {
    const phoneInput = document.getElementById('phone_tr');
    const emailInput = document.getElementById('email_tr');
    if (!phoneInput && !emailInput) return;
    const phone = SearchinAFnewUI('phone');
    const email = SearchinAFnewUI('email');
    if (phoneInput) phoneInput.placeholder = phone === '-' || phone === '' ? 'Телефон' : phone;
    if (emailInput) emailInput.placeholder = email === '-' || email === '' ? 'Почта' : email;
}

function SearchinAFnewUI(whatsearch) {
    const doc = getIframeDoc();
    if (!doc) return '';
    const upperName = whatsearch.toUpperCase();
    const keyMatches = (key) => key === whatsearch || key === upperName;
    const valueFromEntry = (el) => {
        const [key, value] = el.textContent.split(':');
        if (value === undefined) return null;
        const k = key.trim();
        return keyMatches(k) ? value.trim() : null;
    };
    const variablesList = doc.querySelector('#__next ul[class*="Variables_List"]');
    if (variablesList) {
        for (const entry of variablesList.children) {
            const value = valueFromEntry(entry);
            if (value !== null) return value;
        }
    }
    if (whatsearch === 'id') {
        for (const wrapper of doc.querySelectorAll('#__next div[class*="List_ListWrapper"]')) {
            const wrapperKey = wrapper.textContent.split(':')[0]?.trim();
            if (!keyMatches(wrapperKey)) continue;
            for (const entry of wrapper.children) {
                const value = valueFromEntry(entry);
                if (value !== null) return value;
            }
        }
    }
    return '';
}

function findUuidIn(rootDoc, selector) {
    for (const el of rootDoc.querySelectorAll(selector)) {
        const text = el.textContent.trim();
        if (UUID_RE.test(text)) return text;
    }
    return null;
}

function getChatId() {
    const hrefnow = window.location.href;
    if (hrefnow.includes('skyeng.autofaq.ai/logs')) {
        const doc = getIframeDoc();
        const candidates = [];
        if (doc) {
            candidates.push(
                findUuidIn(doc, 'span[id^="mantine-"][id$="-target"]'),
                findUuidIn(doc, 'span, div, p, a'),
                findUuidIn(doc, '[aria-controls*="mantine-"]')
            );
        }
        candidates.push(
            findUuidIn(document, 'span[id^="mantine-"][id$="-target"]'),
            findUuidIn(document, 'span, div, p, a')
        );
        return candidates.find(Boolean) || '';
    }
    if (hrefnow.includes('tickets/assigned')) {
        const doc = getIframeDoc();
        const selectedCard = doc?.querySelector('#__next [class^="DialogsCard_Card"][aria-selected="true"]');
        return selectedCard?.getAttribute('data-conv-id') || '';
    }
    if (hrefnow.includes('tickets/archive')) {
        for (const field of document.querySelectorAll('.ant-spin-container')) {
            if (field.textContent.split(':')[0] === 'ID') {
                const firstChild = field.children[0];
                const value = firstChild?.textContent?.split(':')[1]?.trim();
                if (value) return value;
            }
        }
    }
    return '';
}
window.getChatId = getChatId;

const SERVICE_NAME_PREFIXES = ['тьютор', 'тютор', 'тутор', 'бадди', 'tutor', 'buddy'];
function getActiveConvUserName() {
    const nameField = getIframeDoc()?.querySelectorAll('[class^="User_Preview"]')[0];
    if (!nameField) return '';
    const nameParts = nameField.textContent.split(/[\s_]+/);
    const firstPart = nameParts[0].toLowerCase();
    if (SERVICE_NAME_PREFIXES.includes(firstPart)) return nameParts[1] || '';
    return firstPart ? nameParts[0] : '';
}

function hmsToSeconds(timeStr) {
    const [h, m, s] = timeStr.split(':').map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

const CARD_COLOR_KEYS = {
    newChat: 'answchatcolor',
    awaitingAnswer: 'responschatcolor',
    closingSoon: 'defaclschatcolor'
};

function paintCard(card, colorKey) {
    card.style.setProperty('--chat-card-bg', localStorage.getItem(CARD_COLOR_KEYS[colorKey]));
}

// ⚡ checkchats экспортируется в window для utils.js
function checkchats() {
    const doc = getIframeDoc();
    if (!doc) return;
    const cards = doc.querySelectorAll('[class*="DialogsCard_Card"]');
    const timers = doc.querySelectorAll('[class*="DialogsCard_Timers"]');
    cards.forEach((card) => card.style.removeProperty('--chat-card-bg'));
    timers.forEach((timer) => {
        const card = timer.closest('[class*="DialogsCard_Card"]');
        if (!card) return;
        const timeClose = timer.children[2]?.textContent?.trim();
        const timeAnswer = timer.children[1]?.textContent?.trim();
        if (!timeClose && !timeAnswer) paintCard(card, 'newChat');
        else if (!timeClose && timeAnswer) paintCard(card, 'awaitingAnswer');
        else if (timeClose && hmsToSeconds(timeClose) < 120) paintCard(card, 'closingSoon');
    });
}
window.checkchats = checkchats;

// ⚡ injectChatCardStyle: пишем CSS только при изменении (кэш)
let lastCssText = '';
function injectChatCardStyle() {
    const doc = getIframeDoc();
    if (!doc || !doc.head) return;
    let style = doc.getElementById('chmaf-card-fix');
    if (!style) {
        style = doc.createElement('style');
        style.id = 'chmaf-card-fix';
        doc.head.appendChild(style);
    }
    const cssText = `[class*="DialogsCard_Card"] { background-color: var(--chat-card-bg, transparent) !important; transition: background-color 0.3s ease; }`;
    if (lastCssText === cssText) return;
    lastCssText = cssText;
    style.textContent = cssText;
}

// ============================================================
// Синхронизация токенов с CLEANUP
// ============================================================
async function getToken() {
    return (await chrome.storage.local.get('token_global')).token_global;
}
function setToken(token) { return chrome.storage.local.set({ token_global: token }); }

if (location.host === 'crm2.skyeng.ru') {
    const crmTokenInterval = setInterval(async () => {
        const token = localStorage.getItem('token_global');
        if (!token) return;
        await setToken(token);
        clearInterval(crmTokenInterval);
        console.log('Токен CRM получен');
    }, 3000);
    window.cleanupRegistry?.register(() => clearInterval(crmTokenInterval));
}

if (location.host === 'skyeng.autofaq.ai') {
    const respondTokenInterval = setInterval(async () => {
        const token = await getToken();
        if (!token) return;
        flagTokenGlobal = token;
        try { localStorage.setItem('token_global', flagTokenGlobal); } catch { }
        clearInterval(respondTokenInterval);
        console.log('Токен установлен на AutoFAQ');
    }, 4000);
    window.cleanupRegistry?.register(() => clearInterval(respondTokenInterval));
}

function formatServiceType(serviceTypeKey) {
    const parts = serviceTypeKey.split('_');
    let subjectKey, lessontype = 'group';
    if (parts[0] === 'lc' && parts[1] === 'exam') subjectKey = parts[3];
    else if (parts[0] === 'english' && parts[1] === 'adult' && (parts[2] === 'courses' || parts[2] === 'minicourses')) {
        subjectKey = 'english'; lessontype = 'f2f';
    } else subjectKey = parts[2];
    const subject = subjectTranslations[subjectKey] || subjectKey;
    let format = formatTranslations[parts[3]] || formatTranslations[parts[4]] || formatTranslations[parts[parts.length - 1]];
    if (format) format = `<span style="font-weight:bold;color:#00b8ff;text-transform:uppercase">${format}</span>`;
    if (parts.includes('life') || parts.includes('talks') || parts.includes('coach')) {
        return { formattedText: format || '', lessontype };
    }
    return { formattedText: format ? `${subject} ${format}`.trim() : subject, lessontype };
}

function highlightSearchText(item, searchText) {
    if (typeof item !== 'string' || !searchText) return item;
    const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'i');
    const replacement = `<span style="color:MediumSpringGreen;font-weight:700;">${searchText.toUpperCase()}</span>`;
    let cleaned = item.replace(/"\s*:\s*/g, ' – ');
    if (cleaned === item) cleaned = item;
    return cleaned.replace(pattern, replacement);
}

function applyEnLangHue(hue) {
    let h = parseInt(hue ?? localStorage.getItem('enLangHue'), 10);
    if (Number.isNaN(h)) h = 265;
    document.body.style.setProperty('--en-h', String(h));
}
window.applyEnLangHue = applyEnLangHue;
applyEnLangHue();

// Горячие клавиши
if (window.location.host === 'skyeng.autofaq.ai' && window.location.pathname !== '/login') {
    document.addEventListener('keydown', (event) => {
        if (!event.altKey) return;
        if (event.code === 'KeyO') changeStatus('Offline');
        else if (event.code === 'KeyI') changeStatus('Busy');
        else if (event.code === 'KeyT') {
            const current = localStorage.getItem('trigertestchat');
            try { localStorage.setItem('trigertestchat', current === '0' ? '1' : '0'); } catch { }
        }
    });
}

// ⚡ Banner removal С CLEANUP (было: setInterval навсегда)
if (location.hostname === 'student.skyeng.ru') {
    const bannerInterval = setInterval(() => {
        if (!location.href.startsWith('https://student.skyeng.ru/home')) return;
        document.querySelector('.tag.promo-image')?.remove();
    }, 500);
    window.cleanupRegistry?.register(() => clearInterval(bannerInterval));
}

// Запускаем uiTick только если мы на нужном домене
if (location.host === 'skyeng.autofaq.ai') startUiTick();