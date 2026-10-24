/**
 * content.js — основной контент-скрипт CRMHelper.
 *
 *  1. Общие утилиты для модулей: окна, запросы через bg.js, тосты, диалоги, иконки.
 *  2. Кнопка «Меню» в тулбаре CRM и выпадающее меню модулей.
 *  3. Звук новой задачи и превью скриншотов в карточке задачи.
 *  4. Бейдж статуса пользователя на /persons/:id.
 *  5. SkyAuto — автовзятие задачи из пула.
 *
 * Скрипт подключается и на video-trouble-shooter.skyeng.ru (ради общих утилит),
 * поэтому всё, что относится только к CRM, запускается под флагом CRM_IS_CRM.
 * Все контент-скрипты расширения делят одну глобальную область: имена верхнего
 * уровня здесь — публичное API для модулей, повторять их в модулях нельзя.
 */

const CRM_IS_CRM = location.hostname === 'crm2.skyeng.ru';

/* ============================================================
 *  1. ОБЩИЕ УТИЛИТЫ
 * ============================================================ */

/** Экранирование текста для вставки в HTML. */
function crmEsc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Набор линейных иконок (stroke = currentColor). */
const CRM_ICON_PATHS = {
    close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
    clear: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6"/><line x1="12" y1="17" x2="12" y2="17.01"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
    play: '<polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" stroke="none"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    insert: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    back: '<polyline points="15 18 9 12 15 6"/>',
    next: '<polyline points="9 18 15 12 9 6"/>',
    thread: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
};

/** SVG-иконка по имени. */
function crmIcon(name, size = 16) {
    const paths = CRM_ICON_PATHS[name] || '';
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

/**
 * Запрос через bg.js (обход CORS). Возвращает текст ответа.
 * Ошибка содержит .status (HTTP-код, если сервер ответил).
 */
function crmRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        try {
            chrome.runtime.sendMessage(
                { action: 'getFetchRequest', fetchURL: url, requestOptions: options },
                (resp) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }
                    if (!resp || !resp.success) {
                        const err = new Error((resp && resp.error) || 'Нет ответа от расширения');
                        err.status = (resp && resp.status) || 0;
                        reject(err);
                        return;
                    }
                    resolve(resp.fetchansver);
                }
            );
        } catch (e) {
            // Бывает после обновления расширения: старая вкладка теряет связь с bg.js.
            reject(new Error('Расширение обновилось — перезагрузите страницу'));
        }
    });
}

/** То же, что crmRequest, но с разбором JSON. */
async function crmRequestJson(url, options = {}) {
    const text = await crmRequest(url, options);
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error('Сервер вернул не JSON');
    }
}

/** Копирование в буфер обмена с запасным путём через execCommand. */
async function crmCopy(text) {
    try {
        await navigator.clipboard.writeText(String(text));
        return true;
    } catch (_) { /* пробуем старый способ */ }

    const el = document.createElement('textarea');
    el.value = String(text);
    el.setAttribute('readonly', '');
    el.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
    document.body.appendChild(el);
    el.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
    el.remove();
    return ok;
}

/** Кнопка в состоянии «идёт запрос». */
function crmSetBusy(button, busy) {
    if (!button) return;
    button.disabled = !!busy;
    button.classList.toggle('is-busy', !!busy);
}

/** Пауза. */
function crmSleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** ID пользователя из адреса /persons/<id>, если открыта карточка. */
function crmPersonIdFromUrl() {
    const m = location.pathname.match(/\/persons\/(\d{3,12})/);
    return m ? m[1] : '';
}

/** Разрешить ввод только цифр. */
function onlyNumbers(object) {
    object.value = object.value.replace(/[^0-9]/g, '');
}

/** Разрешить ввод только цифр и запятой. */
function onlyNumbersAndComma(object) {
    object.value = object.value.replace(/[^0-9,]/g, '');
}

/** Добавить <option> в выпадающий список. */
function addOptionCRM(listbox, text, value) {
    const option = document.createElement('option');
    option.textContent = text;
    option.value = value;
    listbox.appendChild(option);
}

/* ============================================================
 *  ТОСТЫ И ДИАЛОГИ
 * ============================================================ */

/**
 * Уведомление в правом верхнем углу.
 * @param {string} message - текст (выводится как текст, не HTML).
 * @param {'info'|'success'|'warning'|'error'} type
 * @param {{title?:string, duration?:number, sticky?:boolean, html?:boolean}} opts
 */
function crmToast(message, type = 'info', opts = {}) {
    let container = document.getElementById('crm-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'crm-toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }

    // Не больше пяти уведомлений одновременно.
    while (container.children.length >= 5) container.firstElementChild.remove();

    const icons = { success: '✓', error: '!', warning: '!', info: 'i' };
    const titles = { success: 'Готово', error: 'Ошибка', warning: 'Внимание', info: 'Информация' };
    const duration = opts.sticky ? 0 : (opts.duration || (type === 'error' ? 6000 : 3500));

    const toast = document.createElement('div');
    toast.className = `crm-toast ${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `
        <div class="crm-toast-icon">${icons[type] || 'i'}</div>
        <div class="crm-toast-content">
            <div class="crm-toast-title"></div>
            <div class="crm-toast-msg"></div>
        </div>
        <button type="button" class="crm-toast-close" title="Закрыть" aria-label="Закрыть">×</button>
        ${duration ? '<div class="crm-toast-progress"></div>' : ''}`;

    toast.querySelector('.crm-toast-title').textContent = opts.title || titles[type] || titles.info;
    const msgEl = toast.querySelector('.crm-toast-msg');
    if (opts.html) msgEl.innerHTML = String(message);
    else msgEl.textContent = String(message ?? '');
    if (!String(message ?? '').trim()) msgEl.remove();

    container.appendChild(toast);

    let closed = false;
    const close = () => {
        if (closed) return;
        closed = true;
        toast.classList.add('closing');
        setTimeout(() => toast.remove(), 180);
    };

    toast.querySelector('.crm-toast-close').onclick = (e) => { e.stopPropagation(); close(); };
    toast.onclick = close;

    if (duration) {
        const progress = toast.querySelector('.crm-toast-progress');
        let remaining = duration;
        let startedAt = Date.now();
        let timer = setTimeout(close, remaining);

        progress.style.transition = `transform ${remaining}ms linear`;
        requestAnimationFrame(() => { progress.style.transform = 'scaleX(0)'; });

        // Наведение «замораживает» таймер.
        toast.onmouseenter = () => {
            clearTimeout(timer);
            remaining = Math.max(600, remaining - (Date.now() - startedAt));
            const scale = progress.getBoundingClientRect().width / toast.getBoundingClientRect().width;
            progress.style.transition = 'none';
            progress.style.transform = `scaleX(${scale})`;
        };
        toast.onmouseleave = () => {
            startedAt = Date.now();
            progress.style.transition = `transform ${remaining}ms linear`;
            requestAnimationFrame(() => { progress.style.transform = 'scaleX(0)'; });
            timer = setTimeout(close, remaining);
        };
    }

    return toast;
}
window.crmToast = crmToast;

/**
 * Модальный диалог подтверждения (замена confirm()).
 * Для разрушительных действий danger: true — фокус по умолчанию на «Отмена».
 * @returns {Promise<boolean>}
 */
function crmConfirm({ title = 'Подтвердите действие', message = '', okText = 'Продолжить', cancelText = 'Отмена', danger = false } = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'crm-scope crm-dialog-overlay';
        overlay.innerHTML = `
            <div class="crm-dialog" role="alertdialog" aria-modal="true">
                <div class="crm-dialog-body">
                    <div class="crm-dialog-title"></div>
                    <div class="crm-dialog-msg"></div>
                </div>
                <div class="crm-dialog-foot">
                    <button type="button" class="crm-btn" data-answer="0"></button>
                    <button type="button" class="crm-btn ${danger ? 'crm-btn-danger-solid' : 'crm-btn-primary'}" data-answer="1"></button>
                </div>
            </div>`;
        overlay.querySelector('.crm-dialog-title').textContent = title;
        overlay.querySelector('.crm-dialog-msg').textContent = message;
        const cancelBtn = overlay.querySelector('[data-answer="0"]');
        const okBtn = overlay.querySelector('[data-answer="1"]');
        cancelBtn.textContent = cancelText;
        okBtn.textContent = okText;

        const finish = (answer) => {
            document.removeEventListener('keydown', onKey, true);
            overlay.remove();
            resolve(answer);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); finish(false); }
        };

        cancelBtn.onclick = () => finish(false);
        okBtn.onclick = () => finish(true);
        overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) finish(false); });
        document.addEventListener('keydown', onKey, true);

        document.body.appendChild(overlay);
        (danger ? cancelBtn : okBtn).focus();
    });
}

/* ============================================================
 *  ОКНА
 * ============================================================ */

let crmTopZ = 9950;

/** Поднимает окно поверх остальных окон расширения. */
function crmBringToFront(win) {
    crmTopZ += 1;
    win.style.zIndex = String(crmTopZ);
}

/** Возвращает окно в видимую область экрана (хотя бы шапка должна быть видна). */
function crmClampWindow(win) {
    if (!win || win.style.display === 'none') return;
    const rect = win.getBoundingClientRect();
    const minLeft = Math.min(8, 140 - rect.width);
    const maxLeft = Math.max(minLeft, window.innerWidth - 140);
    const maxTop = Math.max(8, window.innerHeight - 48);
    const left = Math.min(maxLeft, Math.max(minLeft, rect.left));
    const top = Math.min(maxTop, Math.max(8, rect.top));
    if (left !== rect.left) win.style.left = `${Math.round(left)}px`;
    if (top !== rect.top) win.style.top = `${Math.round(top)}px`;
}

/**
 * Проверка цели mousedown/dblclick: true — клик по «свободному» месту,
 * false — по интерактивному элементу (кнопке, полю, ссылке и т. п.).
 */
function checkelementtype(event) {
    const target = event && event.target instanceof Element ? event.target : null;
    if (!target) return true;
    return !target.closest('button, input, textarea, select, option, label, a, [contenteditable="true"], [contenteditable=""], .crm-no-drag');
}

/**
 * Общее перетаскивание мышью: тянем за handle, двигаем target.
 * Слушатели навешиваются на время перетаскивания, после отпускания снимаются.
 * @param {Element} handle - за что тянем
 * @param {Element} target - что двигаем (меняет style.left/top)
 * @param {{onEnd?: Function, freeArea?: Function}} [opts]
 *   freeArea(event) — true, если цель клика не интерактивный элемент (по умолчанию checkelementtype).
 *   onEnd() — вызывается после отпускания (сохранить позицию и т. п.).
 */
function crmDraggable(handle, target, opts = {}) {
    if (!handle || !target) return;
    const isFree = opts.freeArea || checkelementtype;
    handle.addEventListener('mousedown', (event) => {
        if (event.button !== 0 || !isFree(event)) return;
        event.preventDefault();

        const startX = event.clientX;
        const startY = event.clientY;
        const elemLeft = target.offsetLeft;
        const elemTop = target.offsetTop;

        const onMove = (e) => {
            if (!(e.buttons & 1)) { onUp(); return; }
            target.style.left = `${elemLeft + e.clientX - startX}px`;
            target.style.top = `${elemTop + e.clientY - startY}px`;
        };
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            if (opts.onEnd) opts.onEnd();
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
}

/**
 * Создаёт плавающее окно расширения.
 * Перетаскивается за шапку (.crm-head), позиция запоминается в localStorage.
 */
function createWindowCRM(id, topKey, leftKey, content, opts = {}) {
    const win = document.createElement('div');
    win.id = id;
    win.className = 'showedwindows crm-scope' + (opts.className ? ` ${opts.className}` : '');

    const storedTop = parseInt(localStorage.getItem(topKey), 10);
    const storedLeft = parseInt(localStorage.getItem(leftKey), 10);
    win.style.top = `${Number.isFinite(storedTop) ? storedTop : 120}px`;
    win.style.left = `${Number.isFinite(storedLeft) ? storedLeft : 295}px`;
    win.style.display = 'none';
    win.innerHTML = content;
    document.body.append(win);

    win.addEventListener('mousedown', () => crmBringToFront(win), true);

    const handle = win.querySelector('.crm-head');
    if (handle) {
        crmDraggable(handle, win, {
            freeArea: (event) => handle.contains(event.target) && checkelementtype(event),
            onEnd: () => {
                crmClampWindow(win);
                localStorage.setItem(topKey, String(win.offsetTop));
                localStorage.setItem(leftKey, String(win.offsetLeft));
            }
        });
    }

    return win;
}

/** Показать окно. */
function crmShowWindow(win) {
    if (!win) return;
    win.style.display = '';
    crmBringToFront(win);
    requestAnimationFrame(() => crmClampWindow(win));
    win.dispatchEvent(new CustomEvent('crm:shown'));
}

/** Скрыть окно (модули могут слушать событие crm:hidden). */
function crmHideWindow(win) {
    if (!win || win.style.display === 'none') return;
    win.style.display = 'none';
    win.dispatchEvent(new CustomEvent('crm:hidden'));
}

/** Переключить окно; возвращает true, если окно открылось. */
function crmToggleWindow(idOrEl) {
    const win = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    crmCloseMenu();
    if (!win) return false;
    if (win.style.display === 'none') {
        crmShowWindow(win);
        return true;
    }
    crmHideWindow(win);
    return false;
}

/** Скрыть окно двойным кликом по шапке. */
function hideWindowOnDoubleClick(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.addEventListener('dblclick', (event) => {
        const head = win.querySelector('.crm-head');
        if (head && !head.contains(event.target)) return;
        if (!checkelementtype(event)) return;
        crmHideWindow(win);
    });
}

/** Скрыть окно кликом по кнопке. */
function hideWindowOnClick(windowId, buttonId) {
    const win = document.getElementById(windowId);
    const button = document.getElementById(buttonId);
    if (win && button) button.onclick = () => crmHideWindow(win);
}

/**
 * Разметка шапки окна: иконка и заголовок слева, инструменты и «Скрыть» справа.
 * Все аргументы — доверенные строки из кода модулей.
 */
function crmWinHeader({ icon = '', title = '', tools = '', closeId = '', closeTitle = 'Скрыть' }) {
    return `
        <div class="crm-head">
            <span class="crm-title">${icon ? `<span class="crm-title-ico">${icon}</span>` : ''}<span>${title}</span></span>
            <span class="crm-head-tools">
                ${tools}
                <button type="button" class="crm-icon-btn is-close" id="${closeId}" title="${closeTitle}" aria-label="${closeTitle}">${crmIcon('close')}</button>
            </span>
        </div>`;
}

/** Иконка-кнопка для шапки. */
function crmToolButton(id, icon, title) {
    return `<button type="button" class="crm-icon-btn" id="${id}" title="${title}" aria-label="${title}">${icon}</button>`;
}

window.addEventListener('resize', () => {
    document.querySelectorAll('.showedwindows').forEach(crmClampWindow);
});

/* ============================================================
 *  ЛОГИНЕР ДЛЯ ТЕСТОВЫХ У/П
 * ============================================================ */

/** Достаёт из HTML-ответа последнюю ссылку логинера. */
function extractLoginLink(text) {
    const matches = String(text || '').match(/https:\/\/id\.skyeng\.ru\/auth\/login-link\/[^\s"'<>]+/g);
    return matches && matches.length ? matches[matches.length - 1] : null;
}

/** Создаёт ссылку входа для тестового пользователя и копирует её в буфер. */
async function logginerfortestsCRM(userId) {
    if (!userId) throw new Error('ID тестового пользователя не задан в настройках');

    const body = new URLSearchParams({
        'login_link_form[identity]': '',
        'login_link_form[id]': String(userId),
        'login_link_form[target]': 'https://vimbox.skyeng.ru/',
        'login_link_form[lifetime]': '3600',
        'login_link_form[create]': ''
    }).toString();

    const html = await crmRequest('https://id.skyeng.ru/admin/auth/login-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        credentials: 'include'
    });

    const link = extractLoginLink(html);
    if (!link) throw new Error('Ссылка не найдена в ответе — проверьте вход в id.skyeng.ru');
    if (!(await crmCopy(link))) throw new Error('Не удалось скопировать ссылку');
    return link;
}

/* ============================================================
 *  2. КНОПКА «МЕНЮ» И МЕНЮ МОДУЛЕЙ
 * ============================================================ */

// [id, иконка, подпись, подсказка]. id используются модулями — не переименовывать.
const CRM_MENU_ITEMS = [
    ['templatesCRM', '📑', 'Шаблоны ответов', 'Поиск, правка и вставка шаблона в поле ответа'],
    ['jirafinder', '🔎', 'Поиск в Jira', 'Баги и задачи, избранное, Support Tab'],
    ['mattermostfinder', '💬', 'Поиск в Mattermost', 'Поиск сообщений по каналам'],
    ['smartroomformCRM', '🦐', 'Smartroom: пожелания', 'Отправить пожелание или негатив в документ Smartroom'],
    ['butLessonInfoCRM', '🎓', 'Статусы уроков', 'Уроки преподавателя за период'],
    ['butAutoschedule', '🗓️', 'Автоподбор', 'Доступность автоподбора по услугам ученика'],
    ['butdiagtoolsCRM', '🧰', 'Ссылки и инструменты', 'Быстрые ссылки и переходы по ID'],
    ['btnOperStatus', '🎧', 'Статусы операторов', 'Кто свободен, на линии, в DND'],
    ['btnCreateTestRoom', '🎲', 'Тестовый урок', 'Создать тестовую комнату'],
    ['btnAlarmclock', '🔕', 'Напоминания', 'Два напоминания на время'],
    ['btnSettingsApp', '⚙️', 'Настройки', 'Звук, автовзятие, тестовые аккаунты, резервная копия']
];

const menubarcrm = document.createElement('div');
menubarcrm.id = 'idmymenucrm';
menubarcrm.className = 'crm-scope';
menubarcrm.setAttribute('role', 'menu');
menubarcrm.style.display = 'none';
menubarcrm.innerHTML =
    CRM_MENU_ITEMS.map(([id, icon, label, hint]) =>
        `<button type="button" class="menubtnsCRM" id="${id}" role="menuitem" title="${crmEsc(hint)}">` +
        `<span class="crm-menu-ico">${icon}</span><span class="crm-menu-text">${crmEsc(label)}</span></button>`
    ).join('') +
    `<div class="crm-menu-sep"></div>
     <div class="crm-menu-foot">
        <span class="crm-label" title="Ссылка входа для тестового пользователя копируется в буфер">Логинер</span>
        <button type="button" class="crm-btn crm-btn-sm" id="testuchenik" title="Скопировать ссылку входа тестового ученика">Тест У</button>
        <button type="button" class="crm-btn crm-btn-sm" id="testprepod" title="Скопировать ссылку входа тестового преподавателя">Тест П</button>
        <span class="crm-menu-ver" title="Версия CRMHelper">v${chrome.runtime.getManifest().version}</span>
     </div>`;
document.body.append(menubarcrm);

const upmenubtn = document.createElement('button');
upmenubtn.type = 'button';
upmenubtn.id = 'MenubarCRM';
upmenubtn.innerHTML = `${crmIcon('grid', 15)}<span>Меню</span>`;
upmenubtn.title = 'Модули CRMHelper';

/** Иконка пункта меню (например, индикатор напоминаний). */
function crmSetMenuIcon(itemId, icon) {
    const el = document.querySelector(`#${itemId} .crm-menu-ico`);
    if (el) el.textContent = icon;
}

function crmCloseMenu() {
    menubarcrm.style.display = 'none';
    upmenubtn.classList.remove('is-open');
}

function crmOpenMenu() {
    menubarcrm.style.display = '';
    upmenubtn.classList.add('is-open');
    const btnRect = upmenubtn.getBoundingClientRect();
    const width = menubarcrm.offsetWidth;
    const left = Math.min(Math.max(8, btnRect.left), window.innerWidth - width - 8);
    menubarcrm.style.left = `${Math.round(left)}px`;
    menubarcrm.style.top = `${Math.round(btnRect.bottom + 6)}px`;
}

upmenubtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menubarcrm.style.display === 'none') crmOpenMenu();
    else crmCloseMenu();
});

// Клик мимо меню или Esc — закрываем.
document.addEventListener('mousedown', (e) => {
    if (menubarcrm.style.display === 'none') return;
    if (menubarcrm.contains(e.target) || upmenubtn.contains(e.target)) return;
    crmCloseMenu();
}, true);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menubarcrm.style.display !== 'none') crmCloseMenu();
});

/** Вставляет кнопку «Меню» в тулбар CRM, как только он появится (SPA). */
function initialize() {
    if (!CRM_IS_CRM || document.getElementById('MenubarCRM')) return;
    const toolbarRow = document.querySelector('.mat-toolbar-row');
    if (!toolbarRow) return;
    const slot = (toolbarRow.children[1] && toolbarRow.children[1].children[0]) || toolbarRow;
    slot.append(upmenubtn);
}

if (CRM_IS_CRM) {
    initialize();
    let menuInitQueued = false;
    new MutationObserver(() => {
        if (menuInitQueued) return;
        menuInitQueued = true;
        requestAnimationFrame(() => {
            menuInitQueued = false;
            if (!document.getElementById('MenubarCRM')) initialize();
        });
    }).observe(document.body, { childList: true, subtree: true });
}

/** Кнопки «Тест У» / «Тест П»: создать логинер и показать результат. */
function setupTestLoginButton(buttonId, storageKey, label) {
    const btn = document.getElementById(buttonId);
    btn.onclick = async () => {
        if (btn.disabled) return;
        crmSetBusy(btn, true);
        try {
            await logginerfortestsCRM(localStorage.getItem(storageKey));
            btn.classList.add('successbtn');
            crmToast(`Ссылка входа (${label}) скопирована`, 'success', { duration: 2500 });
        } catch (e) {
            btn.classList.add('errorbtn');
            crmToast(e.message, 'error', { title: `Логинер: ${label}` });
        } finally {
            crmSetBusy(btn, false);
            setTimeout(() => btn.classList.remove('successbtn', 'errorbtn'), 1500);
        }
    };
}

setupTestLoginButton('testuchenik', 'test_studCRM', 'тестовый ученик');
setupTestLoginButton('testprepod', 'test_teachCRM', 'тестовый преподаватель');

/* ============================================================
 *  3. ПРЕВЬЮ СКРИНШОТОВ В КАРТОЧКЕ ЗАДАЧИ
 * ============================================================ */

const SCREENSHOT_HOSTS = new Set([
    'vimbox-resource-chat-prod.imgix.net',
    'vimbox-resource-storage-prod-ru-1.storage.yandexcloud.net',
    'math-prod.storage.yandexcloud.net',
    'i.imgur.com',
    'joxi.ru',
    'skr.sh'
]);

/** Строка «Комментарий» в карточке задачи (crm-row). */
function crmFindCommentRow() {
    for (const row of document.getElementsByTagName('crm-row')) {
        if (row.children.length && row.children[0].innerText.trim() === 'Комментарий') return row;
    }
    return null;
}

function screenshotsCRM() {
    const row = crmFindCommentRow();
    if (!row) return;
    for (const a of row.querySelectorAll('a:not(.crm-screenshot-link)')) {
        if (!SCREENSHOT_HOSTS.has(a.host)) continue;
        const img = document.createElement('img');
        img.src = a.href;
        img.alt = 'Скриншот';
        img.loading = 'lazy';

        const link = document.createElement('a');
        link.className = 'crm-screenshot-link';  // триггер для ImageViewer.js
        link.href = a.href;
        link.append(img);
        a.replaceWith(link);
    }
}

if (CRM_IS_CRM) {
    screenshotsCRM();
    let screenshotsDebounce = null;
    new MutationObserver(() => {
        clearTimeout(screenshotsDebounce);
        screenshotsDebounce = setTimeout(screenshotsCRM, 250);
    }).observe(document.body, { childList: true, subtree: true });
}

/* ============================================================
 *  ЗВУК НОВОЙ ЗАДАЧИ
 *  Плеер общий: настройки (SettingsApp.js) меняют источник и громкость.
 * ============================================================ */

const CRM_DEFAULT_SOUND = 'https://dimentorexpo.github.io/Sounds/msg.mp3';
let soundintervalsetCRM = null;    // true — разовый звук проигран; число — id интервала повтора
let audioCRM = new Audio(localStorage.getItem('sound_strCRM') || CRM_DEFAULT_SOUND);
audioCRM.volume = Math.min(1, Math.max(0, parseFloat(localStorage.getItem('audioCRMvol') ?? '1') || 0));

/** Меняет источник звука, сохраняя громкость. */
function crmSetSound(url) {
    const volume = audioCRM.volume;
    audioCRM.pause();
    audioCRM = new Audio(url || CRM_DEFAULT_SOUND);
    audioCRM.volume = volume;
}

/** Проиграть звук; блокировку автоплея браузером просто пишем в консоль. */
function crmPlaySound() {
    try {
        audioCRM.currentTime = 0;
        const p = audioCRM.play();
        if (p && p.catch) p.catch((e) => console.log('[CRMHelper] звук не воспроизведён:', e.name));
    } catch (e) {
        console.log('[CRMHelper] звук не воспроизведён:', e);
    }
}

/** Полностью останавливает повтор звука. */
function stopSoundInterval() {
    if (typeof soundintervalsetCRM === 'number') clearInterval(soundintervalsetCRM);
    soundintervalsetCRM = null;
}

function checkforsoundplay() {
    const onStartPage = location.href.includes('https://crm2.skyeng.ru/customer-support/start');
    const soundEnabled = localStorage.getItem('audioCRM') !== '0';
    if (!soundEnabled || !onStartPage) { stopSoundInterval(); return; }

    const btn = Array.from(document.getElementsByClassName('mdc-button'))
        .find((b) => b.innerText.trim() === 'Взять новую задачу');
    const btnActive = btn && !btn.classList.contains('mat-mdc-button-disabled') &&
        document.getElementsByClassName('mat-mdc-button-disabled').length === 0;

    if (!btnActive) { stopSoundInterval(); return; }
    if (soundintervalsetCRM) return; // уже играет / уже проиграно

    crmPlaySound();
    if (localStorage.getItem('repeatsound') === '1') {
        const seconds = Math.min(59, Math.max(1, parseInt(localStorage.getItem('splinterCRM'), 10) || 3));
        soundintervalsetCRM = setInterval(crmPlaySound, seconds * 1000);
    } else {
        soundintervalsetCRM = true;
    }
}

if (CRM_IS_CRM) setInterval(checkforsoundplay, 1000);

/* ============================================================
 *  4. СТАТУС ПОЛЬЗОВАТЕЛЯ НА /persons/:id
 *  SPA-роутинг страницы из контент-скрипта не перехватить (у нас свой
 *  экземпляр history), поэтому отслеживаем адрес таймером.
 * ============================================================ */
(function () {
    'use strict';
    if (!CRM_IS_CRM || window.__skyUserBlockerInitialized) return;
    window.__skyUserBlockerInitialized = true;

    let isLoading = false;
    let lastProcessedId = null;

    function parseStatus(html) {
        const m = html.match(/<th[^>]*>\s*Статус\s*<\/th>\s*<td>([^<]+)<\/td>/i) ||
                  html.match(/статус[:\s]*<strong>([^<]+)<\/strong>/i);
        return m ? m[1].trim() : null;
    }

    function renderBadge(status, sid, tone) {
        const field = document.querySelector('[data-qa="person-id-field"]');
        if (!field) return;
        const container = field.closest('.data-container') || field.parentElement;

        let badge = document.getElementById('isUserBlocked');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'isUserBlocked';
            badge.title = 'Статус учётной записи в id.skyeng.ru';
            const badges = container.querySelector('.badges');
            if (badges) container.insertBefore(badge, badges);
            else container.appendChild(badge);

            // В горизонтальном flex-контейнере бейдж выравниваем по центру строки,
            // иначе он «съезжает» вниз относительно поля ID.
            const cs = getComputedStyle(container);
            const rowFlex = cs.display.includes('flex') && !cs.flexDirection.startsWith('column');
            badge.classList.toggle('is-inline', rowFlex);
        }

        badge.textContent = status || 'неизвестно';
        badge.dataset.pid = sid;
        badge.dataset.tone = tone ||
            (status === 'активный' ? 'ok' : status === 'временно отключен' ? 'bad' : 'muted');
    }

    async function checkAndFetch() {
        const sid = crmPersonIdFromUrl();
        const badge = document.getElementById('isUserBlocked');

        if (!sid) {
            if (badge) badge.remove();
            lastProcessedId = null;
            return;
        }
        if (badge && badge.dataset.pid !== sid) badge.remove();
        if (!document.querySelector('[data-qa="person-id-field"]')) return; // карточка ещё рисуется
        if (lastProcessedId === sid && document.getElementById('isUserBlocked')) return;
        if (isLoading) return;

        isLoading = true;
        renderBadge('Загрузка…', sid, 'info');
        try {
            const html = await crmRequest(`https://id.skyeng.ru/admin/users/${encodeURIComponent(sid)}`, {
                method: 'GET',
                headers: { accept: 'text/html,application/xhtml+xml' },
                credentials: 'include'
            });
            if (crmPersonIdFromUrl() !== sid) return; // пока шёл запрос, открыли другого пользователя
            const status = parseStatus(html);
            renderBadge(status || 'статус не найден', sid);
        } catch (e) {
            if (crmPersonIdFromUrl() === sid) renderBadge('нет доступа к id.skyeng.ru', sid, 'muted');
            console.warn('[UserBlock]', e.message);
        } finally {
            isLoading = false;
            lastProcessedId = sid;
        }
    }

    window.addEventListener('popstate', checkAndFetch);
    setInterval(checkAndFetch, 1000);
})();

/* ============================================================
 *  5. SKYAUTO — АВТОВЗЯТИЕ ЗАДАЧИ ИЗ ПУЛА
 * ============================================================ */
(function () {
    'use strict';
    if (!CRM_IS_CRM) return;

    const BTN_TEXT = 'Взять новую задачу';
    const TARGET_PATH = '/customer-support/start';
    const COOLDOWN_MS = 20000;                 // пауза после клика / возврата на страницу
    const LAST_CLICK_KEY = 'skyauto_lastclick';
    const UI_POS_KEY = 'skyauto_ui_pos';
    const ALL_STATUSES = ['В работе', 'Оффлайн', 'Перерыв/обед', 'Тренинг', 'Встреча', 'Работа с выгрузкой', 'Работа в другом отделе'];

    let lastClickedBtn = null;
    let wasDisabled = true;
    let cooldownUntil = 0;
    let btnWasVisible = false;
    let isFirstTick = true;

    // Восстанавливаем кулдаун после перезагрузки страницы.
    const lastClick = parseInt(sessionStorage.getItem(LAST_CLICK_KEY), 10);
    if (lastClick && location.pathname.includes(TARGET_PATH) && lastClick + COOLDOWN_MS > Date.now()) {
        cooldownUntil = lastClick + COOLDOWN_MS;
    }

    /* ---------- Панель статуса ---------- */
    const ui = document.createElement('div');
    ui.className = 'crm-scope crm-skyauto';
    ui.innerHTML = `
        <div class="crm-skyauto-head"><span>SkyAuto</span><span aria-hidden="true">⋮⋮</span></div>
        <div class="crm-skyauto-body">
            <div class="crm-skyauto-main"><span class="crm-dot"></span><span class="crm-skyauto-text"></span></div>
            <div class="crm-skyauto-sub"></div>
        </div>`;
    const header = ui.querySelector('.crm-skyauto-head');
    const mainEl = ui.querySelector('.crm-skyauto-main');
    const textEl = ui.querySelector('.crm-skyauto-text');
    const subEl = ui.querySelector('.crm-skyauto-sub');

    try {
        const pos = JSON.parse(localStorage.getItem(UI_POS_KEY) || 'null');
        if (pos && Number.isFinite(pos.top) && Number.isFinite(pos.left)) {
            ui.style.top = `${Math.min(Math.max(0, pos.top), window.innerHeight - 60)}px`;
            ui.style.left = `${Math.min(Math.max(0, pos.left), window.innerWidth - 220)}px`;
        } else throw new Error('нет позиции');
    } catch (_) {
        ui.style.top = '12px';
        ui.style.right = '12px';
    }

    // Позиция может быть задана через right — до перетаскивания переводим её в left/top,
    // которые и двигает crmDraggable.
    header.addEventListener('mousedown', () => {
        const rect = ui.getBoundingClientRect();
        ui.style.left = `${Math.round(rect.left)}px`;
        ui.style.top = `${Math.round(rect.top)}px`;
        ui.style.right = 'auto';
    });
    crmDraggable(header, ui, {
        freeArea: () => true,
        onEnd: () => {
            const rect = ui.getBoundingClientRect();
            localStorage.setItem(UI_POS_KEY, JSON.stringify({ top: Math.round(rect.top), left: Math.round(rect.left) }));
        }
    });

    document.body.appendChild(ui);

    let lastRendered = '';
    const updateStatus = (main, tone = '', sub = '') => {
        const key = `${main}|${tone}|${sub}`;
        if (key === lastRendered) return; // не трогаем DOM без изменений
        lastRendered = key;
        textEl.textContent = main;
        mainEl.dataset.tone = tone;
        subEl.textContent = sub;
    };

    /* ---------- Статус оператора ---------- */
    const stripTimer = (text) => text.replace(/\s*\(\d{1,2}:\d{2}:\d{2}\)/, '').trim();
    const matchKnownStatus = (text) => ALL_STATUSES.find((s) => text.includes(s));

    /** Несколько способов определить статус: от точного к грубому. */
    const getOperatorStatus = () => {
        const btn = document.querySelector('crm-operator-statuses button');
        if (btn) {
            const text = stripTimer(btn.textContent);
            const matched = text && matchKnownStatus(text);
            if (matched) return matched;
            if (text && text.length < 50) return text;
        }

        const statusBtn = document.querySelector('button[aria-haspopup="menu"]');
        if (statusBtn && statusBtn.ariaLabel) {
            const matched = matchKnownStatus(stripTimer(statusBtn.ariaLabel));
            if (matched) return matched;
        }

        for (const span of document.querySelectorAll('span.mdc-button__label')) {
            const text = span.textContent.trim();
            if (/\(\d{1,2}:\d{2}:\d{2}\)/.test(text)) {
                const status = stripTimer(text);
                return matchKnownStatus(status) || (status.length < 50 ? status : null);
            }
        }
        return null;
    };

    const isDisabled = (btn) => !btn || btn.disabled ||
        btn.getAttribute('disabled') === 'true' || btn.classList.contains('mat-mdc-button-disabled');

    /* ---------- Основной цикл ---------- */
    const tick = () => {
        const now = Date.now();

        if (!location.pathname.includes(TARGET_PATH)) {
            updateStatus('Вне зоны', '', 'Работает только на странице /start');
            btnWasVisible = false;
            return;
        }

        const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim().includes(BTN_TEXT));
        if (!btn) {
            lastClickedBtn = null;
            wasDisabled = true;
            btnWasVisible = false;
            updateStatus('Ожидание', '', 'Кнопка взятия задачи не найдена');
            return;
        }

        // Кнопка появилась после отсутствия — вернулись на страницу: пауза.
        if (!btnWasVisible && !isFirstTick) {
            cooldownUntil = now + COOLDOWN_MS;
            lastClickedBtn = null;
            wasDisabled = true;
        }
        btnWasVisible = true;
        isFirstTick = false;

        if (localStorage.getItem('skyauto_enabled') === '0') {
            updateStatus('Выключено', 'bad', 'Автовзятие отключено в настройках');
            return;
        }

        const status = getOperatorStatus();
        if (status !== 'В работе') {
            updateStatus('Пауза', 'warn', `Статус: ${status || 'не определён'}. Нужен «В работе»`);
            return;
        }

        if (cooldownUntil > now) {
            updateStatus('Кулдаун', 'info', `Автоклик через ${Math.ceil((cooldownUntil - now) / 1000)} с`);
            return;
        }

        if (isDisabled(btn)) {
            updateStatus('Мониторинг', 'ok', 'Кнопка недоступна, жду активации');
            lastClickedBtn = null;
            wasDisabled = true;
            return;
        }

        if (btn !== lastClickedBtn || wasDisabled) {
            lastClickedBtn = btn;
            wasDisabled = false;
            updateStatus('Беру задачу', 'ok', 'Нажата «Взять новую задачу»');
            btn.click();
            sessionStorage.setItem(LAST_CLICK_KEY, String(Date.now()));
        } else {
            updateStatus('Мониторинг', 'ok', 'Кнопка активна, клик уже был');
        }
    };

    setInterval(tick, 1000);
})();