// ============================================================
// ChMAF — content.js (общий слой расширения)
//
// ВАЖНО ДЛЯ РАЗРАБОТЧИКОВ:
// этот файл грузится ПОСЛЕДНИМ (см. manifest.json) и разделяет
// общую область видимости со всеми autoFAQscripts/*.js.
// Глобальные объявления из блока «Shared state» используются
// другими скриптами (utils.js, TemplatesFuncs.js, ChatHistory.js,
// Calendar.js, Queue.js, Settings.js и др.) — не удалять и не
// переименовывать без проверки по всему проекту.
// ============================================================

// ---------- Настройки: fallback, если Settings.js ещё не определил объект ----------
if (typeof window.Settings === 'undefined') {
    window.Settings = {
        get(key) {
            try { return localStorage.getItem(key); } catch (e) { return null; }
        },
        set(key, value) {
            try { localStorage.setItem(key, value); } catch (e) { /* noop */ }
        }
    };
}

// ID расширения кэшируем из background-скрипта
chrome.runtime.sendMessage({ question: 'get-extension-id' }, (result) => {
    if (chrome.runtime.lastError) {
        console.warn('[ChMAF] get-extension-id:', chrome.runtime.lastError.message);
        return;
    }
    if (result) localStorage.setItem('ext_id', result);
});

// ============================================================
// Константы
// ============================================================
const AF_ORIGIN = 'https://skyeng.autofaq.ai';
const DEFAULT_SCRIPT_ADR =
    'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec';
const SERVER_THEMES_SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbxNjuQ7EbZZkLEfC1_aSoK4ncsF0W0XSkjYttCj2nQ23BBzMEmDq-vqJL3MvwJk9Pnm_g/exec';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Словарь для перевода предметов и направлений
const subjectTranslations = {
    algebra: 'Алгебра',
    basemath: 'Математика',
    biology: 'Биология',
    chemistry: 'Химия',
    computer: 'Информатика',
    english: 'Английский',
    geography: 'География',
    geometry: 'Геометрия',
    history: 'История',
    literature: 'Литература',
    math: 'Математика',
    physics: 'Физика',
    russian: 'Русский язык',
    social: 'Обществознание'
};

// Словарь для перевода форматов обучения
const formatTranslations = {
    webinar: 'ВЕБИНАР',
    f2g: 'F2G',
    coach: 'Практика с коучем',
    f2f: 'F2F',
    life: 'Разговорные Клубы',
    talks: 'Talks'
};

// Медиа-файлы в сообщениях чата: расширение → подпись + плеер
const MEDIA_TYPES = [
    { extensions: /\.(mp4|mov|mkv|webm)$/i, label: 'Видео📺', labelType: 'video-label', tag: 'video', playerType: 'video-player' },
    { extensions: /\.(mp3|wav|ogg|oga)$/i, label: '🎧 Аудио', labelType: 'audio-label', tag: 'audio', playerType: 'audio-player' }
];
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp)$/i;

// ============================================================
// Shared state (используется и другими скриптами расширения!)
// ============================================================
let aftoken = '';                 // CSRF-токен AutoFAQ
let opsection = '';             // отдел оператора
let operatorFullTitle = '';       // полное имя оператора
let operatorId = '';              // ID авторизованного оператора
let operatorsarray = [];          // общий список операторов (onOperator)

let template_flag = 0;            // состояние вставки шаблонов (TemplatesFuncs.js)
let template_flag2 = 0;
let word_text = '';
let template_text = '';
let flagggg = 0;
let templatesAF = [];             // кэш загруженных шаблонов (TemplatesFuncs.js)
let chatsArray = [];              // пары conversationId → sessionId (TemplatesFuncs.js)
let soundintervalset;             // ID интервала звука уведомлений (TemplatesFuncs.js, Settings.js)

let flagsearch;                   // состояние поиска (ChatHistory.js)
let foundarr;
let operchatsdata;
let isChatOnOperator = false;

let bool = 0;                     // трекинг Ctrl (utils.js)
let flag = 0;                     // общий флаг (AFhelper.js → getInfo(flag))

let table;                        // таблица шаблонов (заполняет utils.js → getText())
let scriptAdr;                    // адрес Google Apps Script с шаблонами

// --- локальное для этого файла ---
let audio;                        // звук уведомления о новом чате (переиспользуется Settings.js)
let selectedinpth = 'calendarmyinputsdark'; // классы тем (Calendar.js)
let otherinpth = 'othercalendardark';
let flagTokenGlobal = '';

// ---------- Инициализация localStorage ----------
// Дефолтный адрес GAS ставим ДО чтения в переменную,
// иначе после первой установки scriptAdr навсегда остаётся null.
if (localStorage.getItem('scriptAdr') == null) {
    localStorage.setItem('scriptAdr', DEFAULT_SCRIPT_ADR);
}
scriptAdr = localStorage.getItem('scriptAdr');

localStorage.setItem('tpflag', localStorage.getItem('tpflag') || 'ТП');

// Чистка мусора, который AutoFAQ пишет в localStorage на каждый лог
const LS_GARBAGE_RE = /^(SMART_TABLE\.|messageContent\.)/;
Object.keys(localStorage).forEach((key) => {
    if (LS_GARBAGE_RE.test(key)) localStorage.removeItem(key);
});

// Сортировка архива по умолчанию — по времени убыванию
localStorage.setItem('SMART_TABLE_SORTED_INFO(/tickets/archive)', '{"columnKey":"ts","order":"descend"}');

// Звук уведомления о новом чате
{
    const savedSound = localStorage.getItem('sound_str');
    audio = new Audio(savedSound || 'https://dimentorexpo.github.io/Sounds/msg.mp3');
}

// ============================================================
// Идентификация оператора
// ============================================================

/**
 * Ищет оператора по полному имени в общем списке onOperator.
 * Найденный ID пишется в глобальный operatorId.
 * @param {string} fullName — ФИО оператора
 * @returns {Promise<Object|null>} — найденный объект или null
 */
async function findOperator(fullName) {
    try {
        const state = await fetchStaticData();

        if (!Array.isArray(state.onOperator)) {
            throw new Error('onOperator не является массивом или отсутствует.');
        }

        operatorsarray = state.onOperator;
        const user = state.onOperator.find((op) => op.operator?.fullName === fullName);

        if (user) {
            operatorId = user.operator?.id ?? '';
            return user;
        }

        console.warn(`[ChMAF] Оператор "${fullName}" не найден в списке.`);
        return null;
    } catch (error) {
        console.error('[ChMAF] findOperator:', error);
        return null;
    }
}

let whoAmICompleted = false; // идентификация уже успешно выполнена

/**
 * Определяет текущего оператора: читает CSRF-токен из cookie,
 * извлекает ФИО и отдел из интерфейса (архив/логи или новый фронт в iframe),
 * применяет сохранённый статус и ищет оператора в общем списке.
 * @returns {Promise<boolean>} — true, если оператор успешно идентифицирован
 */
async function whoAmI() {
    if (whoAmICompleted) return true;
    if (!location.host.includes('autofaq')) return false;

    const tokenMatch = document.cookie.match(/csrf_token=([^;]*)/);
    if (!tokenMatch) return false;

    aftoken = tokenMatch[1];
    applyLoginStatus();

    const onArchiveOrLogs =
        location.pathname.includes('/archive') || location.pathname.includes('/logs');

    // Старый UI: имя оператора в дропдауне меню пользователя
    const menuNameField = document.getElementsByClassName('user_menu-dropdown-user_name')[0];

    if (onArchiveOrLogs && menuNameField) {
        operatorFullTitle = menuNameField.textContent;
        opsection = operatorFullTitle.split('-')[0];  // ← ВСЕГДА
        findOperator(operatorFullTitle);
        whoAmICompleted = true;
        return true;
    }

    // Новый UI: секция «отдел-имя» в селекторе внутри iframe
    if (!onArchiveOrLogs) {
        const sectionKey = getIframeDoc()?.querySelector('span[id^="mantine-"][id$="-target"]');

        if (sectionKey) {
            operatorFullTitle = sectionKey.textContent;
            const [section] = sectionKey.textContent.split('-');
            console.log('[whoAmI] section found:', section, '| textContent:', sectionKey.textContent);
            opsection = section;  // ← фикс
            findOperator(operatorFullTitle);
            whoAmICompleted = true;
            return true;
        }
    }

    return false;
}

// ============================================================
// API AutoFAQ
// ============================================================

/** Читает CSRF-токен напрямую из cookie. */
function readCsrfFromCookie() {
    const match = document.cookie.match(/csrf_token=([^;]*)/);
    return match ? match[1] : '';
}

/** Актуальный CSRF-токен: глобальный кэш либо свежее чтение из cookie. */
function getCsrfToken() {
    if (!aftoken) aftoken = readCsrfFromCookie();
    return aftoken;
}

/**
 * Единая точка запросов к AutoFAQ API: подставляет CSRF-токен и cookies,
 * при неуспешном ответе печатает в консоль URL, статус и тело ошибки.
 * При 403 перечитывает токен из cookie и повторяет запрос один раз.
 */
async function afApiFetch(url, options = {}) {
    options.credentials = options.credentials || 'include';
    options.headers = { 'x-csrf-token': getCsrfToken(), ...(options.headers || {}) };

    let response = await fetch(url, options);

    if (response.status === 403) {
        const freshToken = readCsrfFromCookie();
        if (freshToken && freshToken !== aftoken) {
            console.warn(`[ChMAF API] 403 на ${url} — обновляю CSRF-токен и повторяю запрос`);
            aftoken = freshToken;
            options.headers['x-csrf-token'] = freshToken;
            response = await fetch(url, options);
        }
    }

    if (!response.ok) {
        let details = '';
        try {
            details = (await response.text()).slice(0, 300);
        } catch (e) { /* тело недоступно */ }

        console.error(
            `[ChMAF API] ${options.method || 'GET'} ${url} → ${response.status} ${response.statusText}`,
            details
        );
    }

    return response;
}

/**
 * Меняет статус оператора (Online / Busy / Offline и т.д.).
 * @param {string} status — новый статус
 * @param {string} [token=aftoken] — CSRF-токен
 */
function changeStatus(status, token = aftoken) {
    return afApiFetch(`${AF_ORIGIN}/api/reason8/operator/status`, {
        method: 'POST',
        referrer: `${AF_ORIGIN}/tickets/archive`,
        referrerPolicy: 'strict-origin-when-cross-origin',
        headers: Object.assign(
            { 'content-type': 'application/json' },
            token ? { 'x-csrf-token': token } : {}
        ),
        body: JSON.stringify({
            command: 'DO_SET_OPERATOR_STATUS',
            status,
            source: 'Operator'
        })
    })
        .then(() => console.log(`Status changed to ${status}`))
        .catch((err) => console.error(err));
}

/**
 * Применяет сохранённый статус оператора один раз после входа.
 */
let loginStatusApplied = false;

function applyLoginStatus() {
    if (loginStatusApplied) return;
    if (window.location.pathname === '/login') return;
    if (!aftoken) return;

    const savedStatus =
        Settings.get('defaultStatusAfterLogin') ||
        Settings.get('afterLoginFunction') ||
        'Online';

    console.log('[AutoStatus] Applying saved status:', savedStatus);
    loginStatusApplied = true;
    changeStatus(savedStatus, aftoken);
}

/** Сбрасывает флаги состояния вставки шаблонов. */
function resetFlags() {
    template_flag = 0;
    template_flag2 = 0;
}

/**
 * Отправляет внутренний комментарий оператора в чат AutoFAQ.
 * @param {string} txt — текст комментария
 * @param {string} [activeConvId] — ID чата; если не передан, берётся из getInfo()
 */
async function sendComment(txt, activeConvId) {
    const values = await getInfo(0);
    const conversationId = activeConvId || values[1];
    const sessionId = values[2];

    resetFlags();

    // Нативный FormData: браузер сам формирует boundary и Content-Type
    const formData = new FormData();
    formData.append('payload', JSON.stringify({
        sessionId,
        conversationId,
        text: txt,
        isComment: true
    }));

    afApiFetch(`${AF_ORIGIN}/api/reason8/answers`, {
        method: 'POST',
        body: formData
    }).catch((err) => console.error('[ChMAF API] sendComment:', err));
}

/** Добавляет тег в активный чат. */
function newTaggg(tagName) {
    const chatId = getChatId();
    if (!chatId) return;

    afApiFetch(`${AF_ORIGIN}/api/conversation/${chatId}/payload`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            conversationId: chatId,
            elements: [{ name: 'tags', value: [tagName] }]
        })
    }).catch(() => { });
}

/**
 * Общая функция запросов истории диалогов.
 * @param {string|Object} [body=""]
 * @returns {Promise<Object>} — распарсенный ответ
 */
async function doOperationsWithHistory(body = '') {
    if (typeof body !== 'string' && typeof body !== 'object') {
        throw new Error('Аргумент body должен быть строкой или объектом.');
    }

    const response = await afApiFetch(`${AF_ORIGIN}/api/conversations/history`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: typeof body === 'object' ? JSON.stringify(body) : body
    });

    if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
}

/**
 * Получает данные конкретного диалога по ID.
 * @param {string} id — ID диалога
 * @returns {Promise<Object>}
 */
async function doOperationsWithConversations(id) {
    const response = await afApiFetch(`${CONFIGSTAT.API.BASE_URL}${CONFIGSTAT.API.CONVERSATIONS}/${id}`);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
}

/**
 * Текущее состояние всех операторов (онлайн, статусы и т.д.).
 * @returns {Promise<Object>} — объект с массивом onOperator
 */
async function fetchStaticData() {
    const response = await afApiFetch(`${AF_ORIGIN}/api/operators/statistic/currentState`, {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.status} - ${response.statusText}`);
    }

    return await response.json();
}

// ============================================================
// DOM-утилиты
// ============================================================

/** Устанавливает CSS display для элемента. */
function setDisplayStyle(element, value) {
    element.style.display = value;
}

/** Оставляет в поле ввода только цифры и знак минус. */
function onlyNumber(object) {
    sanitizeInput(object, /[^0-9-]/g);
}

/** Оставляет в поле ввода только цифры. */
function onlyNumbers(object) {
    sanitizeInput(object, /[^0-9]/g);
}

function sanitizeInput(object, garbagePattern) {
    if (object) object.value = object.value.replace(garbagePattern, '');
}

/** Переключает CSS-класс кнопки по её id. */
function toggleButtonState(buttonId, className) {
    document.getElementById(buttonId)?.classList.toggle(className);
}

/** Добавляет <option> в список. */
function addOption(oListbox, text, value) {
    const oOption = document.createElement('option');
    oOption.appendChild(document.createTextNode(text));
    oOption.setAttribute('value', value);
    oListbox.appendChild(oOption);
}

/**
 * Ждёт появления элемента и вызывает callback.
 * @param {string} selector
 * @param {Function} callback
 * @param {number} [timeout=10000]
 * @param {number} [interval=100]
 */
function waitForElement(selector, callback, timeout = 10000, interval = 100) {
    const startTime = Date.now();
    const intervalId = setInterval(() => {
        const element = document.querySelector(selector);

        if (element) {
            clearInterval(intervalId);
            callback();
        } else if (Date.now() - startTime > timeout) {
            clearInterval(intervalId);
            console.error(`Элемент ${selector} не найден за ${(timeout / 1000).toFixed(1)} c.`);
        }
    }, interval);
}

/**
 * Показывает всплывающее уведомление внизу экрана.
 * Стили — .cyber-toast (инжектятся в TestUsers.js).
 * @param {string} message — HTML-текст уведомления (<br> поддерживается)
 * @param {string} [type='message'] — 'message' | 'error' | 'warning'
 */
function createAndShowButton(message, type = 'message') {
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

// ============================================================
// Медиа в сообщениях чата (видео / аудио / картинки)
// ============================================================
let processTimer = null;

/** Дебаунс обработки DOM-мутаций. */
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

    // Новый фронт живёт в iframe — актуально только на AutoFAQ
    if (location.host.includes('autofaq')) {
        waitForIframeDoc((doc) => {
            new MutationObserver(scheduleProcessAll).observe(doc.body, { childList: true, subtree: true });
            scheduleProcessAll();
        });
    }
}

/** Документ iframe нового фронта (или null). */
function getIframeDoc() {
    const iframe =
        document.querySelector('iframe.NEW_FRONTEND__frame') ||
        document.querySelector('iframe[class^="NEW_FRONTEND"]') ||
        document.querySelector('[class^="NEW_FRONTEND"] iframe');

    if (!iframe) return null;

    try {
        return iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) || null;
    } catch (e) {
        return null;
    }
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
    handleRootDocument(document, true);      // лог + архив (старый UI)

    const iframeDoc = getIframeDoc();        // живое окно (новый UI)
    if (iframeDoc) handleRootDocument(iframeDoc, false);
}

const MEDIA_LABEL_CSS =
    'color:#e2e8f0;font-weight:600;background:linear-gradient(135deg, rgba(239, 68, 68, 0.85), rgba(185, 28, 28, 0.9));' +
    'border:1px solid rgba(255,255,255,0.15);border-radius:10px;' +
    'text-align:center;font-size:14px;letter-spacing:0.3px;padding:6px 12px;margin-top:8px;' +
    'box-shadow:0 4px 14px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.1);';
const MEDIA_PLAYER_CSS = 'max-width:300px;display:block;margin-top:8px;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,0.4);';

/**
 * Обрабатывает ссылки в сообщениях одного контекста (документ или iframe):
 * заменяет медиа-ссылки на плееры, картинки — на превью с зумом.
 * @param {Document} root
 * @param {boolean} isOldUi
 */
function handleRootDocument(root, isOldUi) {
    const selector = isOldUi
        ? '.chat-messages a[href]'
        : 'div[class*="ChatMessages_RegularMessageContent"] a[href]';

    const links = root.querySelectorAll(selector);
    if (!links.length) return;

    links.forEach((link) => {
        if (link.dataset.processed === '1') return;

        const href = link.href || '';
        if (!href) return;

        const mediaType = MEDIA_TYPES.find((t) => t.extensions.test(href));

        // ---------- ВИДЕО / АУДИО ----------
        if (mediaType) {
            link.dataset.processed = '1';
            insertMediaPreview(root, link, href, mediaType);
            return;
        }

        // ---------- КАРТИНКИ ----------
        if (IMAGE_EXTENSIONS.test(href)) {
            link.dataset.processed = '1';

            const img = root.createElement('img');
            img.src = href;
            img.style.width = '120px';
            img.style.cursor = 'zoom-in';
            img.dataset.full = href;
            img.addEventListener('click', openImageViewer);

            link.replaceWith(img);
        }
    });
}

/** Ставит после контейнера ссылки подпись и плеер. */
function insertMediaPreview(root, link, href, mediaType) {
    const parent = link.closest('div, p, span') || link.parentElement;
    if (!parent) return;

    const label = root.createElement('div');
    label.dataset.type = mediaType.labelType;
    label.style.cssText = MEDIA_LABEL_CSS;
    label.textContent = mediaType.label;

    const player = root.createElement(mediaType.tag);
    player.src = href;
    player.controls = true;
    player.style.cssText = MEDIA_PLAYER_CSS;
    player.dataset.type = mediaType.playerType;

    parent.insertAdjacentElement('afterend', label);
    label.insertAdjacentElement('afterend', player);
}

/** Полноэкранный просмотр изображения; закрытие — кликом. */
function openImageViewer(e) {
    const src = e.target.dataset.full;
    if (!src) return;

    const overlay = document.createElement('div');
    overlay.dataset.type = 'img-viewer';
    overlay.style.cssText = [
        'position:fixed', 'inset:0',
        'background:rgba(0,0,0,0.88)',
        'backdrop-filter:blur(12px)',
        'display:flex', 'justify-content:center', 'align-items:center',
        'z-index:999999', 'cursor:zoom-out',
        'animation:fadeIn 0.2s ease'
    ].join(';');

    const img = document.createElement('img');
    img.src = src;
    img.style.cssText =
        'max-width:90%;max-height:90%;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.08);';

    overlay.appendChild(img);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.remove());
}

initObservers();
scheduleProcessAll();

// ============================================================
// Панель шаблонов (AF_helper)
// ============================================================

function initializeMyLogic() {
    const afHelper = document.getElementById('AF_helper');
    if (!afHelper) {
        console.error('AF_helper все еще не найден!');
        return;
    }
}

// Ждём построения AF_helper (его создаёт utils.js / AFhelper.js)
if (location.host === 'skyeng.autofaq.ai') {
    waitForElement('#AF_helper', initializeMyLogic);
}

/** Переключение страниц панели шаблонов по клику на вкладку. */
function pageClick(event) {
    const clickedBtn = event.currentTarget;
    const pageNum = clickedBtn.id.split('_')[0]; // "0_page_button" → "0"

    // 1. Сбрасываем выделение у всех вкладок
    document.querySelectorAll('#pages button').forEach((btn) => {
        btn.style.backgroundColor = 'rgba(36, 62, 229, 0.5)';
        btn.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
    });

    // 2. Скрываем все страницы шаблонов
    for (let i = 0; document.getElementById(i + 'page'); i++) {
        document.getElementById(i + 'page').style.display = 'none';
    }

    // 3. Выделяем активную вкладку
    clickedBtn.style.backgroundColor = 'rgba(34, 139, 34, 0.5)';
    clickedBtn.style.borderTop = '3px solid orange';

    // 4. Показываем нужную страницу
    const targetPage = document.getElementById(pageNum + 'page');
    if (targetPage) targetPage.style.display = 'block';
}

/**
 * Перерисовывает кнопки шаблонов из загруженной таблицы (глобальная table).
 * Вызывается из utils.js после загрузки данных с Google Apps Script.
 */
function refreshTemplates() {
    if (location.host !== 'skyeng.autofaq.ai') return;

    if (!table || !table.length) {
        console.warn('Ожидание загрузки данных шаблонов...');
        return;
    }

    const pagesContainer = document.getElementById('pages');
    const contentArea = document.getElementById('7str');
    const addTmpElement = document.getElementById('addTmp');
    if (!pagesContainer || !contentArea) return;

    // Очистка старых данных перед рендером новых
    pagesContainer.innerHTML = '';
    document.querySelectorAll('[id$="page"]').forEach((el) => el.remove());
    if (addTmpElement) addTmpElement.innerHTML = '';

    let countOfStr = 0;
    let countOfPages = 0;
    let pageType = '';
    let addTmpFlag = 0;
    let currentPage = null;
    let currentRow = null;

    /** Создаёт строку flex-row внутри текущей страницы. */
    const makeRow = (extraClass = '') => {
        currentRow = document.createElement('div');
        currentRow.className = `flex-row${extraClass ? ' ' + extraClass : ''}`;
        currentRow.id = `${countOfPages}page_${countOfStr}str`;
        currentPage.appendChild(currentRow);
        return currentRow;
    };

    /** Кнопка-«щётка», очищающая связанное поле. */
    const makeClearButton = (title, onClear) => {
        const btn = document.createElement('button');
        btn.textContent = '🧹';
        btn.title = title;
        btn.className = 'glass-btn mainButton';
        btn.onclick = onClear;
        return btn;
    };

    for (const row of table) {
        switch (row[0]) {
            case '':
                addTmpFlag = 0;
                countOfStr++;
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
                // Кнопка переключения страницы
                const pageBtn = document.createElement('button');
                pageBtn.textContent = row[1];
                pageBtn.className = 'glass-btn mainButton';
                pageBtn.id = `${countOfPages}_page_button`;
                pageBtn.addEventListener('click', pageClick);
                pagesContainer.appendChild(pageBtn);

                pageType = row[2];

                // Контейнер самой страницы
                currentPage = document.createElement('div');
                currentPage.id = `${countOfPages}page`;
                contentArea.appendChild(currentPage);

                countOfPages++;
                countOfStr = 1;

                if (pageType === 'Серверные') buildServerInputsSection();
                makeRow();
                break;
            }

            default: {
                const templateBtn = document.createElement('button');
                templateBtn.textContent = row[0];
                templateBtn.className = 'glass-btn mainButton';

                if (pageType === 'Шаблоны') {
                    if (templateBtn.textContent === 'ус+брауз (П)') continue; // пропускаем

                    if (templateBtn.textContent === 'Урок NS') templateBtn.id = 'NS';
                    if (templateBtn.textContent === 'ус+брауз (У)') templateBtn.textContent = 'ус+брауз';

                    templateBtn.addEventListener(
                        'click',
                        (event) => buttonsFromDoc(event.target.textContent)
                    );

                    if (addTmpFlag === 0 && currentRow) currentRow.appendChild(templateBtn);
                    else if (addTmpElement) addTmpElement.appendChild(templateBtn);
                } else if (pageType === 'Серверные') {
                    templateBtn.addEventListener('click', servFromDoc);
                    if (currentRow) currentRow.appendChild(templateBtn);
                }
                break;
            }
        }
    }

    bindAddTmpToggle(addTmpElement);

    // Открываем первую вкладку по умолчанию
    document.getElementById('0_page_button')?.click();

    // ---- локальные помощники ----

    function buildServerInputsSection() {
        // -- Блок ссылки --
        const linkRow = makeRow();

        const linkInput = document.createElement('input');
        linkInput.id = 'avariyalink';
        linkInput.placeholder = 'Ссылка на трэд или Jira северных';
        linkInput.autocomplete = 'off';
        linkInput.className = 'glass-input';
        linkInput.style.flexGrow = '1';

        linkRow.appendChild(linkInput);
        linkRow.appendChild(makeClearButton('Очистить', () => { linkInput.value = ''; }));

        // -- Блок выбора темы --
        const themeRow = document.createElement('div');
        themeRow.className = 'flex-row';

        const themeSelect = document.createElement('select');
        themeSelect.id = 'avariyatema';
        themeSelect.className = 'glass-input';
        themeSelect.style.flexGrow = '1';

        const placeholderOption = document.createElement('option');
        placeholderOption.text = 'Выбери тематику для серверных';
        placeholderOption.selected = true;
        placeholderOption.disabled = true;
        placeholderOption.value = 'thenenotselect';
        placeholderOption.style.cssText = 'background-color:orange;color:white;';
        themeSelect.add(placeholderOption);

        themeRow.appendChild(themeSelect);
        themeRow.appendChild(makeClearButton('Сбросить тему', () => { themeSelect.selectedIndex = 0; }));
        currentPage.appendChild(themeRow);

        // Подтягиваем список тем, пока он не загрузится
        const themesInterval = setInterval(async () => {
            if (!themeSelect.isConnected || themeSelect.children.length > 1) {
                clearInterval(themesInterval);
                return;
            }
            try {
                const response = await fetch(SERVER_THEMES_SCRIPT_URL);
                const data = await response.json();
                data.result.forEach((item) => addOption(themeSelect, item[3], item[4]));
                clearInterval(themesInterval);
            } catch (e) {
                console.error('Ошибка загрузки серверных тем:', e);
            }
        }, 4000);

        countOfStr++;
    }

    /** Двойной клик по первой странице показывает/скрывает блок доп. шаблонов. */
    function bindAddTmpToggle(target) {
        if (!target || target.childElementCount === 0) return;

        document.getElementById('0page')?.addEventListener('dblclick', (event) => {
            if (checkelementtype(event)) {
                target.style.display = target.style.display === 'none' ? 'flex' : 'none';
            }
        });
    }
}

/** Вставляет кнопку «Скрыть» в шапку модального окна нового фронта. */
function timerHideButtons() {
    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;

    const modalHeader = iframeDoc.getElementsByClassName('mantine-Modal-header')[0];
    const modalClose = iframeDoc.getElementsByClassName('mantine-Modal-close')[0];

    if (modalHeader && modalClose && !iframeDoc.getElementById('maskBackHide')) {
        modalHeader.insertBefore(maskBackHide, modalClose);
    }
}

// ============================================================
// Кнопки «❌Скрыть» / «↩️Вернуть» (маскировка окна данных чата)
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
maskBackHide.style.cssText =
    'margin-left:auto;margin-right:10px;cursor:pointer;display:none;' +
    'padding:4px 12px;border-radius:8px;font-size:12px;font-weight:600;' +
    'background:linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.08));' +
    'border:1px solid rgba(239,68,68,0.3);color:#fca5a5;' +
    'transition:all 0.22s cubic-bezier(0.4,0,0.2,1);';

let isMasked = false;

/** Элементы нового UI, которые скрываются/возвращаются маскировкой. */
function getMaskTargets(iframeDoc) {
    return {
        modalMask: iframeDoc.querySelector('.mantine-Modal-root'),
        chatActions: iframeDoc.querySelector('#__next [class^="ConversationActions_Actions"]'),
        notesButton: iframeDoc.querySelector('.mantine-RichTextEditor-control')
    };
}

/** Данные текущего чата (имя/почта/телефон) одним вызовом. */
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
        setTimeout(() => {
            maskBack.innerHTML = '↩️';
            maskBack.title = 'Вернуть скрытое окно';
        }, 3000);
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
// Единый секундный тик интерфейса
// (замена трёх отдельных setInterval: кнопки маскировки,
// плейсхолдеры телефона/почты, стили карточек чатов)
// ============================================================
setInterval(uiTick, 1000);

function uiTick() {
    ensureMaskButtonsPlacement();
    updateContactPlaceholders();
    injectChatCardStyle();
}

function ensureMaskButtonsPlacement() {
    // Кнопка «Вернуть» всегда должна быть в правой панели
    const rightPanel = document.getElementById('rightPanel');
    if (rightPanel && !rightPanel.contains(maskBack)) {
        rightPanel.appendChild(maskBack);
    }

    if (isMasked) return;

    const iframeDoc = getIframeDoc();
    if (!iframeDoc) return;

    // Кнопка «Скрыть» показывается только в открытой модалке
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

/** Подставляет телефон/почту чата в подсказки инпутов панели шаблонов. */
function updateContactPlaceholders() {
    const phoneInput = document.getElementById('phone_tr');
    const emailInput = document.getElementById('email_tr');
    if (!phoneInput && !emailInput) return;

    const phone = SearchinAFnewUI('phone');
    const email = SearchinAFnewUI('email');

    if (phoneInput) phoneInput.placeholder = phone === '-' || phone === '' ? 'Телефон' : phone;
    if (emailInput) emailInput.placeholder = email === '-' || email === '' ? 'Почта' : email;
}

// ============================================================
// Данные активного чата (новый UI в iframe)
// ============================================================

/**
 * Ищет значение поля (phone, email, id и т.д.) в панели данных пользователя.
 * @param {string} whatsearch — имя поля, например 'phone', 'email', 'id'
 * @returns {string} — найденное значение или пустая строка
 */
function SearchinAFnewUI(whatsearch) {
    const doc = getIframeDoc();
    if (!doc) return '';

    const upperName = whatsearch.toUpperCase();

    /** key совпадает с именем точно либо в верхнем регистре. */
    const keyMatches = (key) => key === whatsearch || key === upperName;

    /** Значение из строки вида "ключ: значение" или null. */
    const valueFromEntry = (el) => {
        const [key, value] = el.textContent.split(':');
        if (value === undefined) return null;
        const k = key.trim();
        return keyMatches(k) ? value.trim() : null;
    };

    // Основной список переменных
    const variablesList = doc.querySelector('#__next ul[class*="Variables_List"]');
    if (variablesList) {
        for (const entry of variablesList.children) {
            const value = valueFromEntry(entry);
            if (value !== null) return value;
        }
    }

    // Fallback для id: обёртки списков
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

/** Первое значение-UUID среди элементов по селектору (или null). */
function findUuidIn(rootDoc, selector) {
    for (const el of rootDoc.querySelectorAll(selector)) {
        const text = el.textContent.trim();
        if (UUID_RE.test(text)) return text;
    }
    return null;
}

/**
 * ID активного чата в зависимости от раздела
 * (логи / назначенные тикеты нового UI / архив).
 * @returns {string}
 */
function getChatId() {
    const hrefnow = window.location.href;

    if (hrefnow.includes('skyeng.autofaq.ai/logs')) {
        const doc = getIframeDoc();

        // Приоритет: span mantine → любой элемент → aria-controls (в iframe),
        // затем те же проверки в основном документе
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
                return field.children[0].textContent.split(':')[1].trim();
            }
        }
    }

    return '';
}

// Служебные префиксы, которые не являются именем пользователя
const SERVICE_NAME_PREFIXES = ['тьютор', 'тютор', 'тутор', 'бадди', 'tutor', 'buddy'];

/**
 * Имя пользователя из активного чата.
 * Отсекает служебные префиксы (тьютор, buddy и т.п.).
 * @returns {string}
 */
function getActiveConvUserName() {
    const nameField = getIframeDoc()?.querySelectorAll('[class^="User_Preview"]')[0];
    if (!nameField) return '';

    const nameParts = nameField.textContent.split(/[\s_]+/);
    const firstPart = nameParts[0].toLowerCase();

    if (SERVICE_NAME_PREFIXES.includes(firstPart)) {
        return nameParts[1] || '';
    }

    return firstPart ? nameParts[0] : '';
}

// ============================================================
// Подсветка карточек чатов по таймерам
// (интервал запускается в utils.js: setInterval(checkchats, 1000))
// ============================================================

/** 'HH:MM:SS' → секунды (нечисловые части — в 0). */
function hmsToSeconds(timeStr) {
    const [h, m, s] = timeStr.split(':').map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}

const CARD_COLOR_KEYS = {
    newChat: 'answchatcolor',      // новый чат — таймеров нет вообще
    awaitingAnswer: 'responschatcolor', // есть время ответа, нет времени закрытия
    closingSoon: 'defaclschatcolor'     // меньше 2 минут до закрытия
};

function paintCard(card, colorKey) {
    card.style.setProperty('--chat-card-bg', localStorage.getItem(CARD_COLOR_KEYS[colorKey]));
}

/**
 * Подсвечивает карточки чатов в новом UI:
 * новый чат / ожидание ответа / меньше 2 минут до закрытия.
 */
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

        if (!timeClose && !timeAnswer) {
            paintCard(card, 'newChat');
        } else if (!timeClose && timeAnswer) {
            paintCard(card, 'awaitingAnswer');
        } else if (timeClose && hmsToSeconds(timeClose) < 120) {
            paintCard(card, 'closingSoon');
        }
    });
}

/**
 * Стили карточек нужно инжектить прямо в iframe, где живут чаты.
 * Вызывается из uiTick (iframe может пересоздаваться).
 */
function injectChatCardStyle() {
    const doc = getIframeDoc();
    if (!doc || !doc.head) return;

    let style = doc.getElementById('chmaf-card-fix');
    if (!style) {
        style = doc.createElement('style');
        style.id = 'chmaf-card-fix';
        doc.head.appendChild(style);
    }

    // !important обязателен, чтобы пробить заводские стили
    style.textContent = `
        [class*="DialogsCard_Card"] {
            background-color: var(--chat-card-bg, transparent) !important;
            transition: background-color 0.3s ease;
        }
    `;
}

// ============================================================
// Синхронизация токена CRM ↔ AutoFAQ (chrome.storage)
// ============================================================

async function getToken() {
    return (await chrome.storage.local.get('token_global')).token_global;
}

function setToken(token) {
    return chrome.storage.local.set({ token_global: token });
}

// CRM → storage: забираем токен со страницы CRM
if (location.host === 'crm2.skyeng.ru') {
    const crmTokenInterval = setInterval(async () => {
        const token = localStorage.getItem('token_global');
        if (!token) return;

        await setToken(token);
        clearInterval(crmTokenInterval);
        console.log('Токен CRM получен, интервал остановлен');
    }, 3000);
}

// storage → AutoFAQ: кладём токен на страницу AutoFAQ
if (location.host === 'skyeng.autofaq.ai') {
    const respondTokenInterval = setInterval(async () => {
        const token = await getToken();
        if (!token) return;

        flagTokenGlobal = token;
        localStorage.setItem('token_global', flagTokenGlobal);
        clearInterval(respondTokenInterval);
        console.log('Токен установлен на AutoFAQ, интервал остановлен');
    }, 4000);
}

// ============================================================
// Форматирование услуги из ключа CRM
// ============================================================

/**
 * Форматирует системный ключ услуги (например, 'lc_exam_ege_math')
 * в человекочитаемую строку «Предмет + формат» с HTML-подсветкой формата.
 * @param {string} serviceTypeKey — ключ услуги из CRM
 * @returns {{formattedText: string, lessontype: string}}
 */
function formatServiceType(serviceTypeKey) {
    const parts = serviceTypeKey.split('_');
    let subjectKey;
    let lessontype = 'group'; // по умолчанию

    if (parts[0] === 'lc' && parts[1] === 'exam') {
        // lc_exam_<ege>_<предмет>
        subjectKey = parts[3];
    } else if (
        parts[0] === 'english' &&
        parts[1] === 'adult' &&
        (parts[2] === 'courses' || parts[2] === 'minicourses')
    ) {
        subjectKey = 'english';
        lessontype = 'f2f';
    } else {
        subjectKey = parts[2];
    }

    const subject = subjectTranslations[subjectKey] || subjectKey;
    let format =
        formatTranslations[parts[3]] ||
        formatTranslations[parts[4]] ||
        formatTranslations[parts[parts.length - 1]];

    if (format) {
        format =
            `<span style="font-weight:bold;color:#00b8ff;text-transform:uppercase">${format}</span>`;
    }

    // Для Talks / Разговорных клубов / коуча предмет не пишем
    if (parts.includes('life') || parts.includes('talks') || parts.includes('coach')) {
        return { formattedText: format || '', lessontype };
    }

    return { formattedText: format ? `${subject} ${format}`.trim() : subject, lessontype };
}

/**
 * Подсветка искомого текста в строке.
 * @param {string} item
 * @param {string} searchText — экранируется, спецсимволы regex безопасны
 */
function highlightSearchText(item, searchText) {
    const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(escaped, 'i');
    const replacement =
        `<span style="color:MediumSpringGreen;font-weight:700;text-shadow:1px 2px 5px rgb(0 0 0 / 55%);">` +
        `${searchText.toUpperCase()}</span>`;
    return replaceItem(item).replace(pattern, replacement);
}

// ============================================================
// Оттенок EN-режима шаблонов («цветное стекло при смене языка»).
// Токен --en-h выставляется на body и наследуется панелями,
// поэтому Настройки могут менять его на лету.
// ============================================================
function applyEnLangHue(hue) {
    let h = parseInt(hue ?? localStorage.getItem('enLangHue'), 10);
    if (Number.isNaN(h)) h = 265; // фиолетовый по умолчанию
    document.body.style.setProperty('--en-h', String(h));
}
window.applyEnLangHue = applyEnLangHue;
applyEnLangHue();

// ============================================================
// Горячие клавиши (Alt+O — Offline, Alt+I — Busy, Alt+T — тестовый чат)
// ============================================================
if (window.location.host === 'skyeng.autofaq.ai' && window.location.pathname !== '/login') {
    document.onkeydown = (event) => {
        if (!event.altKey) return;

        if (event.code === 'KeyO') changeStatus('Offline');
        else if (event.code === 'KeyI') changeStatus('Busy');
        else if (event.code === 'KeyT') {
            const current = localStorage.getItem('trigertestchat');
            localStorage.setItem('trigertestchat', current === '0' ? '1' : '0');
        }
    };
}

// ============================================================
// Удаление рекламного баннера на домашней странице Student
// ============================================================
if (location.hostname === 'student.skyeng.ru') {
    setInterval(() => {
        if (!location.href.startsWith('https://student.skyeng.ru/home')) return;
        document.querySelector('.tag.promo-image')?.remove();
    }, 500);
}
