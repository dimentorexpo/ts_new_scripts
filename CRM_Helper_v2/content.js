/**
 * content.js — основной контент-скрипт расширения CRMHelper.
 *
 * Отвечает за:
 *  1. Кнопку «Меню» и всплывающее меню модулей в верхней панели CRM.
 *  2. Общие утилиты, которыми пользуются модули (createWindowCRM, copyToClipboard и т.д.).
 *  3. Звуковое оповещение о новых задачах + предпросмотр скриншотов в чатах.
 *  4. Блок UserBlocker/CallStatus на страницах /persons/:id.
 *  5. SkyAuto — автовзятие задач из пула.
 */

/* ============================================================
 *  ХРАНИЛИЩЕ И ГЛОБАЛЬНОЕ СОСТОЯНИЕ
 * ============================================================ */

// Контейнер списка звуков — используется модулем SettingsApp.js (глобальная зависимость).
var soundsconteinerCRM;

// Флаг/ID интервала повторного звука (true = однократный звук уже проигран).
let soundintervalsetCRM = null;
let appverresult;

/* ============================================================
 *  РАЗМЕТКА МЕНЮ
 * ============================================================ */

const win_Menu = `<!-- описание кнопок меню -->
    <div id="jirafinder" class="menubtnsCRM">🔎Jira search</div>
    <div id="mattermostfinder" class="menubtnsCRM">💬Mattermost search</div>
    <div id="smartroomformCRM" class="menubtnsCRM">🦐Smartroom</div>
    <div id="butLessonInfoCRM" class="menubtnsCRM">🎓 Lesson Info</div>
    <div id="butAutoschedule" class="menubtnsCRM">👽 Автоподбор</div>
    <div id="butdiagtoolsCRM" class="menubtnsCRM">🛠 Diagnostic tools</div>
    <div id="btnOperStatus" class="menubtnsCRM">🕵️‍♀️ OperStatus</div>
    <div id="btnCreateTestRoom" class="menubtnsCRM">🎲 Create Test Room</div>
    <div id="btnAlarmclock" class="menubtnsCRM">🔕Reminder</div>
    <div id="btnSettingsApp" class="menubtnsCRM">⚙ Settings</div>
    <!-- Вертикальные ярлыки тестовых У/П по краям меню -->
    <span id="testuchenik" style="height: 277px;">Тест У</span>
    <span id="testprepod" style="height: 277px;">Тест П</span>
`;

/* ============================================================
 *  ОБЩИЕ УТИЛИТЫ (используются и модулями)
 * ============================================================ */

// Кнопка «Меню» для верхней панели CRM.
let upmenubtn = document.createElement('span');
upmenubtn.innerText = "Меню";
upmenubtn.id = 'MenubarCRM';
upmenubtn.style = "cursor:pointer;font-weight:500; text-shadow: 1px 0 1px #000, 0 1px 1px #000, -1px 0 1px #000, 0 -1px 1px #000; border: 1px solid black; padding: 8px; background: #5083ff; border-radius:18px";

/**
 * Создаёт «плавающее» окно расширения.
 * @param {string} id       - id создаваемого DOM-элемента.
 * @param {string} topKey   - ключ localStorage для сохранённой координаты top.
 * @param {string} leftKey  - ключ localStorage для сохранённой координаты left.
 * @param {string} content  - HTML-содержимое окна.
 * @returns {HTMLElement}
 */
function createWindowCRM(id, topKey, leftKey, content) {
    const windowElement = document.createElement('div');
    document.body.append(windowElement);

    // Восстанавливаем последнюю позицию окна или используем дефолтную.
    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    windowElement.classList.add('showedwindows');
    windowElement.style.cssText = `top: ${storedTop}px; left: ${storedLeft}px; display:none;`;
    windowElement.setAttribute('id', id);
    windowElement.innerHTML = content;

    // Перетаскивание окна мышью (за любую область, кроме контролов).
    windowElement.onmousedown = function (event) {
        if (!checkelementtype(event)) return; // клик по кнопке/полю — не таскаем окно

        const startX = event.clientX;
        const startY = event.clientY;
        const elemLeft = windowElement.offsetLeft;
        const elemTop = windowElement.offsetTop;

        function onMouseMove(e) {
            // Если кнопка мыши уже отпущена (за пределами окна) — завершаем перенос.
            if (!(e.buttons & 1)) {
                onMouseUp();
                return;
            }
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            windowElement.style.left = `${elemLeft + deltaX}px`;
            windowElement.style.top = `${elemTop + deltaY}px`;

            // Сохраняем позицию, чтобы восстановить её после перезагрузки страницы.
            localStorage.setItem(topKey, String(elemTop + deltaY));
            localStorage.setItem(leftKey, String(elemLeft + deltaX));
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return windowElement;
}

/** Изменить display элемента. */
function setDisplayStyle(element, value) {
    element.style.display = value;
}

/** Скрыть окно двойным кликом (по «свободной» области окна). */
function hideWindowOnDoubleClick(id) {
    const windowElement = document.getElementById(id);
    windowElement.ondblclick = function (a) {
        if (checkelementtype(a)) {
            setDisplayStyle(windowElement, 'none');
        }
    };
}

/** Скрыть окно кликом по кнопке hide. */
function hideWindowOnClick(windowId, buttonId) {
    const windowElement = document.getElementById(windowId);
    const buttonElement = document.getElementById(buttonId);

    buttonElement.onclick = function () {
        setDisplayStyle(windowElement, 'none');
    };
}

/** Добавить <option> в выпадающий список. */
function addOptionCRM(oListboxCRM, text, value) {
    const oOptionCRM = document.createElement("option");
    oOptionCRM.appendChild(document.createTextNode(text));
    oOptionCRM.setAttribute("value", value);
    oListboxCRM.appendChild(oOptionCRM);
}

/**
 * Проверка цели mousedown/dblclick: разрешаем действие только если
 * пользователь нажал не на интерактивный элемент (кнопку/поле/селект).
 */
function checkelementtype(a) {
    const elem = document.elementFromPoint(a.clientX, a.clientY);
    const isInteractive =
        elem.nodeName === 'BUTTON' ||
        elem.nodeName === 'INPUT' ||
        elem.nodeName === 'TEXTAREA' ||
        elem.nodeName === 'SELECT' ||
        elem.classList.contains('checkbox-audio-switch-CRM');

    return !isInteractive;
}

/** Ограничение количества символов в поле значением maxLength. */
function maxLengthCheck(object) {
    if (object.value.length > object.maxLength)
        object.value = object.value.slice(0, object.maxLength);
}

/** Принудительная установка значения поля в границы min/max. */
function checkMinMaxValue(input) {
    const minValue = parseInt(input.min, 10);
    const maxValue = parseInt(input.max, 10);
    const currentValue = parseInt(input.value, 10);

    if (currentValue < minValue) {
        input.value = minValue;
    } else if (currentValue > maxValue) {
        input.value = maxValue;
    }
}

/** Разрешить ввод только цифр. */
function onlyNumbers(object) {
    object.value = object.value.replace(/[^0-9]/g, '');
}

/** Разрешить ввод только цифр и запятой. */
function onlyNumbersAndComma(object) {
    object.value = object.value.replace(/[^0-9,]/g, '');
}

/**
 * Создание логинера (ссылки входа) для тестового У/П через id.skyeng.ru.
 * Запрос идёт через bg.js (обход CORS). Ссылка копируется в буфер обмена.
 */
function logginerfortestsCRM(polzovatel) {
    return new Promise((resolve, reject) => {
        const fetchURL = 'https://id.skyeng.ru/admin/auth/login-links';
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${polzovatel}&login_link_form%5Btarget%5D=https%3A%2F%2Fvimbox.skyeng.ru%2Fhome&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=`,
            mode: 'cors',
            credentials: 'include',
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions }, function (loginresponse) {
            if (!loginresponse || !loginresponse.success) {
                alert('Не удалось получить логиннер: ' + (loginresponse ? loginresponse.error : 'нет ответа'));
                reject(new Error(loginresponse ? loginresponse.error : 'no response'));
                return;
            }

            const link = extractLoginLink(loginresponse.fetchansver);
            if (!link) {
                console.log('Ссылка логинера не найдена в ответе');
                reject(new Error('Ссылка логинера не найдена'));
                return;
            }

            navigator.clipboard.writeText(link).then(() => {
                console.log('Логинер создан для пользователя: ' + polzovatel);
                resolve(true);
            }).catch(err => {
                console.error('Не удалось скопировать текст: ', err);
                reject(err);
            });
        });
    });
}

/** Резервное копирование в буфер обмена (устаревший execCommand). */
const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

/** Достаёт из HTML-ответа последнюю ссылку логинера. */
function extractLoginLink(text) {
    const regex = /https:\/\/id\.skyeng\.ru\/auth\/login-link\/\S+/g;
    const matches = text.match(regex);

    if (matches && matches.length) {
        // Берём последний URL и отрезаем кавычки в конце, если есть.
        return matches[matches.length - 1].replace(/["']+$/, '');
    }
    return null;
}

/* ============================================================
 *  КНОПКА «МЕНЮ» И САМО МЕНЮ
 * ============================================================ */

let menubarcrm = document.createElement('div');
menubarcrm.id = 'idmymenucrm';
menubarcrm.style = `background: white; position:absolute; left: 950px; top: 50px; border: 0px solid #000000; display:none; min-height: 60px; min-width:170px; box-shadow: -1px 4px 16px 7px rgba(34, 60, 80, 0.09); z-index:999;`;
menubarcrm.innerHTML = win_Menu;
document.body.append(menubarcrm)

// Клик мимо меню (по странице CRM) — закрываем меню.
if (document.querySelector('crm-container') != null) {
    document.querySelector('crm-container').addEventListener('click', function (event) {
        const e = document.getElementById('idmymenucrm');
        if (e && !e.contains(event.target)) e.style.display = 'none';
    });
}

/**
 * Инициализация: вставляем кнопку «Меню» в тулбар CRM, как только он появится.
 * Страница — SPA, тулбар рисуется асинхронно, поэтому поллим каждые 3 сек.
 */
function initialize() {
    try {
        if (location.origin !== 'https://crm2.skyeng.ru') return;

        const toolbarRow = document.getElementsByClassName('mat-toolbar-row')[0];
        if (toolbarRow != undefined && document.getElementById('MenubarCRM') == null) {
            toolbarRow.children[1].children[0].append(upmenubtn);

            document.getElementById('MenubarCRM').onclick = function () {
                const menuEl = document.getElementById('idmymenucrm');
                if (menuEl.style.display == 'none') {
                    // Показываем меню и позиционируем его под кнопкой.
                    menuEl.style.display = '';
                    const xvarmenu = parseInt(document.getElementById('MenubarCRM').getBoundingClientRect().x - 21, 10);
                    menubarcrm.style.left = xvarmenu + 'px';

                    // Растягиваем вертикальные ярлыки тестовых У/П на высоту меню.
                    const hghtelem = menuEl.offsetHeight - 12;
                    document.getElementById("testuchenik").style.height = hghtelem + "px";
                    document.getElementById("testprepod").style.height = hghtelem + "px";
                } else {
                    menuEl.style.display = 'none';
                }
            };

        }
    }
    catch (e) { console.error(e, e.stack); }
}

// MutationObserver вместо setInterval — реагирует на появление тулбара мгновенно
if (location.origin === 'https://crm2.skyeng.ru') {
    initialize(); // первичная попытка
    const mo = new MutationObserver(() => {
        if (document.getElementsByClassName('mat-toolbar-row').length > 0 && document.getElementById('MenubarCRM') == null) {
            initialize();
        }
    });
    mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
} else {
    let init = setInterval(initialize, 3000);
}

/**
 * Единый обработчик для кнопок «Тест У» / «Тест П»:
 * создаёт логинер и подсвечивает кнопку результатом.
 */
function setupTestLoginButton(buttonId, storageKey) {
    const btn = document.getElementById(buttonId);

    btn.onclick = function () {
        btn.classList.add('active');

        logginerfortestsCRM(localStorage.getItem(storageKey))
            .then(() => {
                btn.classList.remove('active');
                btn.classList.add('successbtn');
                setTimeout(() => btn.classList.remove('successbtn'), 1000);
            })
            .catch(() => {
                btn.classList.remove('active');
                btn.classList.add('errorbtn');
                setTimeout(() => btn.classList.remove('errorbtn'), 1000);
            });
    };
}

setupTestLoginButton('testuchenik', 'test_studCRM');
setupTestLoginButton('testprepod', 'test_teachCRM');

/* ============================================================
 *  КНОПКА «MATTERMOST SEARCH» В МЕНЮ
 *  Обработчик здесь (в content.js), потому что content_scripts
 *  загружаются раньше модулей и гарантируют привязку onclick.
 * ============================================================ */
document.getElementById('mattermostfinder').onclick = function () {
    var win = document.getElementById('AF_Mattermost');
    // Если окна нет — создаём его (стили + HTML)
    if (!win) {
        var css = document.createElement('style');
        css.id = 'mms-styles';
        css.textContent = '.mms-panel{background:linear-gradient(165deg,rgba(24,26,36,.96) 0%,rgba(11,12,18,.98) 100%)!important;backdrop-filter:blur(24px) saturate(140%);border:1px solid rgba(255,255,255,.09)!important;border-top:2px solid rgba(184,134,11,.55)!important;border-radius:18px!important;color:#e8ecf4;font-family:Inter,Segoe UI,system-ui,sans-serif;box-shadow:0 24px 60px rgba(0,0,0,.55),0 0 40px rgba(184,134,11,.06)!important;padding:16px!important;overflow:hidden}.mms-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;cursor:grab}.mms-titleblock{display:flex;align-items:center;gap:10px}.mms-icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;background:linear-gradient(135deg,rgba(184,134,11,.25),rgba(160,126,53,.12));border:1px solid rgba(184,134,11,.35);box-shadow:0 4px 14px rgba(184,134,11,.2),inset 0 1px 0 rgba(255,255,255,.15)}.mms-title{font-size:13px;font-weight:700;color:#fff;letter-spacing:.3px}.mms-subtitle{font-size:9px;text-transform:uppercase;letter-spacing:1.4px;color:rgba(255,255,255,.45)}.mms-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#e8e0d0;padding:7px 12px;border-radius:10px;cursor:pointer;transition:all .22s cubic-bezier(.4,0,.2,1);font-size:12px;line-height:1}.mms-btn:hover{background:rgba(255,255,255,.13);border-color:rgba(184,134,11,.4);transform:translateY(-1px);box-shadow:0 6px 16px rgba(0,0,0,.35)}.mms-btn:active{transform:translateY(0) scale(.97)}.mms-btn:disabled{opacity:.55;cursor:not-allowed;transform:none}.mms-btn-danger{background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.25);color:#fca5a5}.mms-btn-primary{background:linear-gradient(135deg,rgba(184,134,11,.85),rgba(160,126,53,.75));border:none;color:#fff;font-weight:700;box-shadow:0 6px 20px rgba(184,134,11,.3),inset 0 1px 0 rgba(255,255,255,.2)}.mms-btn-primary:hover{filter:brightness(1.12)}.mms-search-row{display:flex;gap:8px;align-items:center}.mms-input{background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.09);border-radius:10px;color:#fff;padding:9px 12px;outline:none;font-size:13px;font-family:inherit;transition:all .22s cubic-bezier(.4,0,.2,1);box-sizing:border-box}.mms-input::placeholder{color:rgba(255,255,255,.35)}.mms-input:focus{border-color:rgba(184,134,11,.6);background:rgba(0,0,0,.5);box-shadow:0 0 0 3px rgba(184,134,11,.12)}select.mms-input option{background:#14121d;color:#e8ecf4}.mms-status{font-size:12px;color:rgba(255,255,255,.55);white-space:nowrap}.mms-results{margin-top:12px;max-height:580px;overflow-y:auto;padding-right:6px}.mms-results::-webkit-scrollbar{width:5px}.mms-results::-webkit-scrollbar-track{background:transparent}.mms-results::-webkit-scrollbar-thumb{background:rgba(184,134,11,.25);border-radius:10px}.mms-empty{text-align:center;padding:26px 16px;opacity:.45;font-size:12px;letter-spacing:.3px}.mms-item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-left:3px solid rgba(184,134,11,.7);padding:12px 14px;margin-bottom:9px;border-radius:11px;transition:all .22s cubic-bezier(.4,0,.2,1)}.mms-item:hover{background:rgba(255,255,255,.08);border-color:rgba(184,134,11,.35);transform:translateX(3px)}.mms-item-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap}.mms-channel{display:inline-flex;align-items:center;gap:4px;background:rgba(184,134,11,.15);border:1px solid rgba(184,134,11,.3);color:#d4a843;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap}.mms-author{font-size:13px;font-weight:600;color:#e8d5a0}.mms-time{font-size:10px;opacity:.5;font-family:SF Mono,monospace}.mms-msg{font-size:14.5px;line-height:1.55;color:#e8ecf4;word-break:break-word;white-space:pre-wrap}.mms-att{margin-top:8px;padding:9px 11px;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.07);border-left:3px solid rgba(184,134,11,.65);border-radius:9px}.mms-att-title{font-weight:700;color:#e8d5a0;font-size:14px;margin-bottom:3px;word-break:break-word}.mms-att-text{font-size:13.5px;line-height:1.5;color:#e0d8c8;white-space:pre-wrap;word-break:break-word;margin-top:3px}.mms-att-fields{display:flex;flex-wrap:wrap;gap:7px 16px;margin-top:7px}.mms-att-field{font-size:11.5px;min-width:150px;flex:1 1 100%}.mms-att-field-short{flex:1 1 40%;min-width:130px}.mms-att-f-title{display:block;font-size:9.5px;text-transform:uppercase;letter-spacing:.7px;color:rgba(255,255,255,.45);margin-bottom:2px}.mms-att-f-value{color:#f0ece4;word-break:break-word;white-space:pre-wrap}.mms-actions{display:flex;gap:6px;margin-top:7px}.mms-act-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);color:#c4b896;padding:4px 9px;border-radius:7px;cursor:pointer;font-size:11px;transition:all .18s ease}.mms-act-btn:hover{background:rgba(255,255,255,.12);color:#fff;border-color:rgba(184,134,11,.45)}.mms-hit{background:rgba(250,204,21,.35);color:#fde68a;border-radius:3px;padding:0 1px}.mms-loading{display:flex;align-items:center;justify-content:center;gap:10px;padding:26px 16px;opacity:.7;font-size:13px}.mms-spinner{width:18px;height:18px;border-radius:50%;border:2px solid rgba(184,134,11,.2);border-top-color:#c9a84c;animation:mms-spin .9s linear infinite}@keyframes mms-spin{100%{transform:rotate(360deg)}}.mms-group{margin-bottom:10px}.mms-group-head{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;user-select:none;background:rgba(184,134,11,.08);border:1px solid rgba(184,134,11,.15);border-radius:10px;margin-bottom:6px;transition:background .2s;font-size:13px}.mms-group-head:hover{background:rgba(184,134,11,.15)}.mms-group-arrow{font-size:10px;transition:transform .2s;opacity:.6}.mms-group.mms-collapsed .mms-group-arrow{transform:rotate(-90deg)}.mms-group.mms-collapsed .mms-group-body{display:none}.mms-group-cnt{margin-left:auto;font-size:10px;font-weight:700;background:rgba(184,134,11,.25);color:#e8d5a0;padding:1px 7px;border-radius:10px}.mms-channel-bar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:10px;padding:8px 10px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.06);border-radius:10px}.mms-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:20px;cursor:pointer;font-size:11px;font-weight:600;background:rgba(184,134,11,.18);border:1px solid rgba(184,134,11,.35);color:#e8d5a0;transition:all .18s;user-select:none}.mms-chip:hover{background:rgba(184,134,11,.3)}.mms-chip-off{opacity:.4;background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.1);color:#a09880}.mms-chip-name{max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mms-chip-cnt{font-size:10px;opacity:.7}.mms-chip-reset{background:none;border:none;color:#d4a843;cursor:pointer;font-size:11px;text-decoration:underline;padding:2px 6px}.mms-files{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.mms-file-img{position:relative;display:inline-block;max-width:180px;border-radius:9px;overflow:hidden;border:1px solid rgba(255,255,255,.1);transition:transform .2s;text-decoration:none}.mms-file-img:hover{transform:scale(1.02);border-color:rgba(184,134,11,.5)}.mms-file-img img{display:block;max-width:100%;max-height:140px;object-fit:cover}.mms-file-name{display:block;font-size:10px;color:#c4b896;padding:3px 6px;background:rgba(0,0,0,.4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.mms-file-broken img{display:none}.mms-file-broken::before{content:"🖼 ";font-size:18px;display:block;padding:8px}.mms-file-link{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:9px;font-size:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#e8d5a0;text-decoration:none;max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mms-file-link:hover{background:rgba(184,134,11,.15);border-color:rgba(184,134,11,.4)}.mms-thread-bar{display:flex;align-items:center;gap:12px;margin-bottom:12px}.mms-thread-info{font-size:12px;color:#d4a843;font-weight:600}.mms-item-root{border-left-color:#fbbf24;background:rgba(251,191,36,.06)}.mms-root-badge{font-size:9px;font-weight:800;letter-spacing:1px;background:rgba(251,191,36,.2);color:#fcd34d;padding:2px 7px;border-radius:6px;border:1px solid rgba(251,191,36,.35)}';
        document.head.appendChild(css);
        win = createWindowCRM('AF_Mattermost', 'winTopMMS', 'winLeftMMS', '<div class="mms-panel" style="width:740px;"><div class="mms-header"><div class="mms-titleblock"><span class="mms-icon">🔍</span><div><div class="mms-title">Mattermost Search</div><div class="mms-subtitle">поиск по каналам Skyeng</div></div></div><div style="display:flex;gap:8px;"><button class="mms-btn" id="mms-clear" title="Очистить">🧹</button><button class="mms-btn mms-btn-danger" id="mms-hide" title="Скрыть">✕</button></div></div><div class="mms-search-row"><select class="mms-input" id="mms-team" style="width:180px;text-align:center;"><option value="">Загрузка команд...</option></select><input class="mms-input" id="mms-query" placeholder="Что ищем? (Enter)" autocomplete="off" style="flex:1;"><button class="mms-btn mms-btn-primary" id="mms-search">🚀 Найти</button></div><div class="mms-search-row" style="margin-top:8px;"><span class="mms-status" id="mms-status"></span></div><div class="mms-channel-bar" id="mms-channel-bar" style="display:none;"></div><div id="mms-results" class="mms-results"><div class="mms-empty">Введите запрос и нажмите «Найти».</div></div></div>');
        hideWindowOnDoubleClick('AF_Mattermost');
        hideWindowOnClick('AF_Mattermost', 'mms-hide');
    }
    // Закрываем выпадающее меню
    document.getElementById('idmymenucrm').style.display = 'none';
    // Делегируем полный функционал IIFE (треды, файлы, группы, чипсы)
    if (typeof window.mmsToggle === 'function') {
        window.mmsToggle();
    } else if (win.style.display == 'none') {
        // IIFE ещё не загрузился — просто показываем окно
        win.style.display = '';
    } else {
        win.style.display = 'none';
    }
};

/* ============================================================
 *  ПРЕДПРОСМОРТ СКРИНШОТОВ В АКТИВНОМ ЧАТЕ
 * ============================================================ */

// Домены-источники картинок, ссылки на которые превращаем в превью.
const SCREENSHOT_HOSTS = new Set([
    'vimbox-resource-chat-prod.imgix.net',
    'vimbox-resource-storage-prod-ru-1.storage.yandexcloud.net',
    'math-prod.storage.yandexcloud.net',
    'i.imgur.com',
    'joxi.ru',
    'skr.sh'
]);

function screenshotsCRM() { // просмотр и трансформация скриншотов в активном чате
    const rows = document.getElementsByTagName('crm-row');
    for (let i = 0; i < rows.length; i++) {
        // Ищем строку «Комментарий» в карточке задачи.
        if (rows[i].children.length !== 0 && rows[i].children[0].innerText === 'Комментарий') {
            const divimg = rows[i];

            for (const a of divimg.querySelectorAll('a')) {
                // ФИКС: раньше проверка «уже обработано» применялась только к skr.sh
                // (приоритет && выше ||), из-за чего остальные картинки
                // пересоздавались заново каждые 5 секунд. Теперь guard общий для всех хостов.
                if (SCREENSHOT_HOSTS.has(a.host) && !a.classList.contains('crm-screenshot-link')) {
                    const img = document.createElement('img');
                    img.style.width = '100px';
                    img.src = a.href;
                    img.alt = 'Изображение';

                    const alink = document.createElement('a');
                    // Класс-метка: (1) «ссылка уже обработана», (2) триггер для
                    // собственного просмотрщика ImageViewer.js (замена Lightbox).
                    alink.classList.add('crm-screenshot-link');
                    alink.href = img.src;
                    alink.append(img);

                    a.replaceWith(alink);
                }
            }
        }
    }
}

screenshotsCRM();
// MutationObserver вместо setInterval(5000) — реагирует на изменение DOM
const screenshotsMO = new MutationObserver(() => screenshotsCRM());
screenshotsMO.observe(document.body || document.documentElement, { childList: true, subtree: true });

/* ============================================================
 *  ЗВУК НОВОЙ ЗАДАЧИ
 * ============================================================ */

let takeTaskBtn;

/** Полностью останавливает воспроизведение звука (и разовый интервал). */
function stopSoundInterval() {
    clearInterval(soundintervalsetCRM);
    soundintervalsetCRM = null;
}

function checkforsoundplay() {
    takeTaskBtn = document.getElementsByClassName('mdc-button');
    const onStartPage = window.location.href.indexOf('https://crm2.skyeng.ru/customer-support/start') !== -1;
    const soundEnabled = localStorage.getItem('audioCRM') == 1;

    if (soundEnabled && onStartPage && takeTaskBtn.length > 0) {
        // Ищем именно кнопку взятия задачи среди всех .mdc-button.
        const btn = Array.from(takeTaskBtn).find(b => b.innerText.trim() === 'Взять новую задачу');
        const btnActive = btn && !btn.classList.contains('mat-mdc-button-disabled') &&
                          document.getElementsByClassName('mat-mdc-button-disabled').length == 0;

        if (btnActive) {
            if (localStorage.getItem('repeatsound') == 0) {
                // Разовый режим: проигрываем звук один раз при появлении задачи.
                if (!soundintervalsetCRM) {
                    audioCRM.play();
                    soundintervalsetCRM = true;
                }
            } else {
                // Режим повтора: играем звук каждые N секунд, пока задачу не возьмут.
                if (!soundintervalsetCRM) {
                    audioCRM.oncanplaythrough = (event) => {
                        const playedPromise = audioCRM.play();
                        if (playedPromise) {
                            playedPromise.catch((e) => {
                                // Автоплей может быть заблокирован браузером до первого взаимодействия.
                                console.log(e);
                                if (e.name === 'NotAllowedError' || e.name === 'NotSupportedError') {
                                    console.log(e.name);
                                }
                            }).then(() => {
                                console.log("playing sound repeatedly !!!");
                            });
                        }
                    };
                    soundintervalsetCRM = setInterval(() => { audioCRM.play(); }, localStorage.getItem('splinterCRM') * 1000);
                }
            }
        } else {
            stopSoundInterval(); // ФИКС: прежнее условие (a != null || a != true) было всегда истинным
        }
    } else {
        stopSoundInterval(); // выключены звук/страница или задач нет
    }
}

setInterval(checkforsoundplay, 1000);

/* ============================================================
 *  ВСПЛЫВАЮЩЕЕ УВЕДОМЛЕНИЕ-КНОПКА (например «Скопировано»)
 * ============================================================ */

function createAndShowButton(text) {
    const btnSuccess = document.createElement("button");
    btnSuccess.id = "successButton";
    btnSuccess.className = "sucsbtn";
    btnSuccess.textContent = text;

    // Полоса обратного отсчёта внизу кнопки (анимация описана в styles.css).
    const countdownBar = document.createElement("div");
    countdownBar.id = "countdownBar";
    countdownBar.className = "countdown-bar";
    btnSuccess.appendChild(countdownBar);

    document.body.appendChild(btnSuccess);
    btnSuccess.style.display = 'block';

    // Самоудаляемся через 3.5 секунды (время синхронизировано с CSS-анимацией).
    setTimeout(() => {
        btnSuccess.remove();
    }, 3500);
}

/* ============================================================
 *  БЛОК: UserBlocker (статус пользователя) + CallStatus (isForbiddenToCall)
 *  Работает на страницах https://crm2.skyeng.ru/persons/<id>
 * ============================================================ */
(function () {
    'use strict';

    // --- Защита от повторной инициализации (если скрипт вдруг инъецируется дважды) ---
    if (window.__skyCRMHelperInitialized) return;
    window.__skyCRMHelperInitialized = true;

    /** Мы на странице конкретного пользователя? */
    const isPersonPage = () => /^https:\/\/crm2\.skyeng\.ru\/persons\/\d+/.test(location.href);

    // ============================================================
    //  USER BLOCKER — бейдж со статусом пользователя из id.skyeng.ru
    // ============================================================
    let ubCheckInterval = null;
    let ubIsLoading = false;

    /** Достаёт статус («активный», «временно отключен», ...) из HTML админки. */
    function ubParseStatus(html) {
        const tableMatch = html.match(/<th[^>]*>\s*Статус\s*<\/th>\s*<td>([^<]+)<\/td>/i);
        const divMatch   = html.match(/статус:\s*<strong>([^<]+)<\/strong>/i);
        const looseMatch = html.match(/статус[:\s]*<strong>([^<]+)<\/strong>/i);
        const m = tableMatch || divMatch || looseMatch;
        return m ? m[1].trim() : null;
    }

    function ubStopChecker() {
        if (ubCheckInterval) { clearInterval(ubCheckInterval); ubCheckInterval = null; }
    }

    /** Рисует (или обновляет) бейдж статуса рядом с ID пользователя. */
    function ubRenderBadge(status, sid) {
        const field = document.querySelector('[data-qa="person-id-field"]');
        if (!field) return;

        const container = field.closest('.data-container') || field.parentElement;
        let badge = document.getElementById('isUserBlocked');

        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'isUserBlocked';
            badge.style.cssText = 'color:#fff; padding:2px 6px; margin-top:4px; margin-bottom:4px; border-radius:3px; font-weight:700; display:block; width:fit-content; font-size:12px;';
            const badges = container.querySelector('.badges');
            badges ? container.insertBefore(badge, badges) : container.appendChild(badge);
        }

        badge.textContent = status || 'неизвестно';
        badge.dataset.pid = sid;

        // Цвет бейджа зависит от статуса.
        if (status === 'активный') badge.style.backgroundColor = '#28a745';
        else if (status === 'временно отключен') badge.style.backgroundColor = '#d32b49';
        else badge.style.backgroundColor = '#6c757d';
    }

    /** Один шаг поллинга: нашли ID пользователя → запросили статус. */
    function ubTick() {
        if (!isPersonPage()) { ubStopChecker(); return; }

        const field = document.querySelector('[data-qa="person-id-field"]');
        if (!field) return; // страница ещё не отрисована — попробуем на следующем тике

        const sid = field.textContent.trim().replace(/\D/g, '');
        if (!sid) return;

        // Уже показали бейдж именно для этого пользователя — больше не делаем ничего.
        const badge = document.getElementById('isUserBlocked');
        if (badge && badge.dataset.pid === sid) { ubStopChecker(); return; }
        if (ubIsLoading) return;

        ubRenderBadge('Загрузка…', sid);
        ubIsLoading = true;

        const fetchURL = `https://id.skyeng.ru/admin/users/${encodeURIComponent(sid)}`;
        const requestOptions = {
            method: 'GET',
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "accept-language": "ru,en;q=0.9"
                // sec-ch-ua / sec-fetch-* — служебные заголовки, их браузер ставит сам,
                // поэтому вручную их не дублируем.
            },
            credentials: 'include'
        };

        chrome.runtime.sendMessage(
            { action: 'getFetchRequest', fetchURL, requestOptions },
            (response) => {
                ubIsLoading = false;

                if (!response || response.success !== true) {
                    console.error('[UserBlock] Ошибка:', response?.error);
                    ubRenderBadge('ошибка', sid);
                    ubStopChecker();
                    return;
                }

                const html = response.fetchAnswer || response.fetchansver || '';
                const status = ubParseStatus(html);

                if (status) {
                    ubRenderBadge(status, sid);
                    console.log(`[UserBlock] ${sid} → ${status}`);
                } else {
                    ubRenderBadge('статус не найден', sid);
                    console.warn('[UserBlock] Статус не спарсился для', sid);
                }
                ubStopChecker();
            }
        );
    }

    function ubStartCheck() {
        if (ubCheckInterval) return;
        if (!isPersonPage()) return;

        const old = document.getElementById('isUserBlocked');
        if (old) old.remove();      // новый профиль — старый бейдж не показываем
        ubIsLoading = false;

        ubTick();
        ubCheckInterval = setInterval(ubTick, 1000);
    }

    // ============================================================
    //  CALL STATUS — индикатор «Можно звонить ученику» / «Не звонить»
    // ============================================================
    let csCheckInterval = null;
    let csIsLoading = false;

    /** Достаёт ID пользователя из URL (/persons/<id>). */
    function csParsePersonId() {
        const m = location.pathname.match(/\/persons\/(\d+)/);
        return m ? m[1] : null;
    }

    /** Создаёт (или возвращает существующий) элемент-индикатор рядом с кнопкой меню. */
    function csInsertElement() {
        const menu = document.getElementById('MenubarCRM');
        if (!menu) return null;

        let el = document.getElementById('callStatusIndicator');
        if (el) return el;

        el = document.createElement('span');
        el.id = 'callStatusIndicator';
        el.style.cssText = `
            margin-left: 12px; padding: 6px 12px; border-radius: 12px;
            font-size: 14px; font-weight: 500; display: inline-flex;
            align-items: center; gap: 6px; font-family: system-ui, sans-serif;
            vertical-align: middle; cursor: default;
        `;
        menu.insertAdjacentElement('afterend', el);
        return el;
    }

    /** Отрисовка индикатора в зависимости от состояния. */
    function csRender(status, text) {
        const el = csInsertElement();
        if (!el) return;

        // Сбрасываем базовые стили перед каждым рендером.
        el.style.background = '';
        el.style.color = '';
        el.style.border = '';

        if (status === 'loading') {
            el.style.cssText += '; background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;';
            el.innerHTML = '⏳ Загрузка статуса…';
        } else if (status === 'forbidden') {
            el.style.cssText += '; background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;';
            el.innerHTML = `<span style="width:16px;height:16px;border:2px solid #dc2626;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;background:#dc2626;flex-shrink:0;color:#fff;font-size:11px;font-weight:bold;">✓</span>Не звонить ученику`;
        } else if (status === 'allowed') {
            el.style.cssText += '; background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0;';
            el.innerHTML = `<span style="width:16px;height:16px;border:2px solid #16a34a;border-radius:3px;display:inline-flex;align-items:center;justify-content:center;background:#16a34a;flex-shrink:0;font-size:10px;">🟢</span>Можно звонить ученику`;
        } else if (status === 'error') {
            el.style.cssText += '; background: #fef3c7; color: #d97706; border: 1px solid #fde68a;';
            el.innerHTML = '⚠️ ' + (text || 'Ошибка загрузки');
        } else {
            el.style.cssText += '; background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;';
            el.textContent = text || 'Статус неизвестен';
        }
    }

    /** Загружает данные пользователя и обновляет индикатор. */
    function csLoad() {
        if (!isPersonPage()) return;
        if (csIsLoading) return;

        const personId = csParsePersonId();
        if (!personId) return;

        // Для этого пользователя уже показан актуальный статус — не дёргаем API.
        const existing = document.getElementById('callStatusIndicator');
        if (existing && existing.dataset.personId === personId) {
            csStopCheck();
            return;
        }

        csIsLoading = true;
        csRender('loading');

        const fetchURL = `https://backend.skyeng.ru/api/persons/${personId}`;
        const requestOptions = {
            method: 'GET',
            headers: {
                "accept": "application/json, text/plain, */*",
                "accept-language": "ru"
            },
            credentials: 'include'
        };

        chrome.runtime.sendMessage(
            { action: 'getFetchRequest', fetchURL, requestOptions },
            (response) => {
                csIsLoading = false;

                if (!response || response.success !== true) {
                    console.error('[CallStatus] Ошибка:', response?.error);
                    csRender('error', response?.error || 'Ошибка сервера');
                    return;
                }

                let data;
                try {
                    const raw = response.fetchAnswer || response.fetchansver || response.data;
                    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
                } catch (e) {
                    console.error('[CallStatus] Parse error:', e);
                    csRender('error', 'Неверный ответ');
                    return;
                }

                const forbidden = data?.data?.isForbiddenToCall;
                const userTypeCRM = data?.data?.type;
                const el = document.getElementById('callStatusIndicator');

                // Для преподавателей индикатор звонков не нужен — убираем.
                if (userTypeCRM === "teacher") {
                    if (el) el.remove();
                    csStopCheck();
                    return;
                }

                if (el) el.dataset.personId = personId;

                if (forbidden === true) csRender('forbidden');
                else if (forbidden === false) csRender('allowed');
                else csRender('unknown', 'Статус не определён');
            }
        );
    }

    function csStartCheck() {
        if (csCheckInterval) return;
        if (!isPersonPage()) return;
        csLoad();
        csCheckInterval = setInterval(csLoad, 2000);
    }

    function csStopCheck() {
        if (csCheckInterval) { clearInterval(csCheckInterval); csCheckInterval = null; }
    }

    // ============================================================
    //  НАВИГАЦИЯ: единый перехват history (SPA не перезагружает страницу)
    // ============================================================
    function onNavigate() {
        setTimeout(() => {
            if (!isPersonPage()) {
                // Ушли со страницы пользователя — глушим оба поллера и чистим UI.
                ubStopChecker();
                csStopCheck();
                const el = document.getElementById('callStatusIndicator');
                if (el) el.remove();
                return;
            }

            // --- UserBlocker: перезапускаем, если сменился пользователь ---
            const field = document.querySelector('[data-qa="person-id-field"]');
            const sid = field ? field.textContent.trim().replace(/\D/g, '') : null;
            const ubBadge = document.getElementById('isUserBlocked');
            if (!ubBadge || (sid && ubBadge.dataset.pid !== sid)) {
                ubStopChecker();
                ubStartCheck();
            }

            // --- CallStatus: перезапускаем, если сменился пользователь ---
            const personId = csParsePersonId();
            const csEl = document.getElementById('callStatusIndicator');
            if (!csEl || (personId && csEl.dataset.personId !== personId)) {
                csStopCheck();
                csStartCheck();
            }
        }, 500);
    }

    // Оборачиваем pushState/replaceState + слушаем popstate.
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
        originalPushState.apply(this, args);
        onNavigate();
    };
    history.replaceState = function (...args) {
        originalReplaceState.apply(this, args);
        onNavigate();
    };
    window.addEventListener('popstate', onNavigate);

    // Первый запуск.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            ubStartCheck();
            csStartCheck();
        });
    } else {
        ubStartCheck();
        csStartCheck();
    }
})();
/* === КОНЕЦ БЛОКА USERBLOCKER/CALLSTATUS === */

/* ============================================================
 *  SKYAUTO — АВТОВЗЯТИЕ ЗАДАЧИ С ПУЛА
 * ============================================================ */
(function () {
    'use strict';

    const BTN_TEXT = 'Взять новую задачу';
    const TARGET_PATH = '/customer-support/start';
    const COOLDOWN_MS = 20000;              // пауза после клика/возврата на страницу
    const LAST_CLICK_KEY = 'skyauto_lastclick';
    const UI_POS_KEY = 'skyauto_ui_pos';

    let lastClickedBtn = null;
    let wasDisabled = true;
    let lastUrl = location.pathname;
    let cooldownUntil = 0;
    let btnWasVisible = false;
    let isFirstTick = true;

    // Восстанавливаем кулдаун после перезагрузки страницы.
    const lastClick = sessionStorage.getItem(LAST_CLICK_KEY);
    if (lastClick && location.pathname.includes(TARGET_PATH)) {
        const nextAllowed = parseInt(lastClick, 10) + COOLDOWN_MS; // FIX: добавлено основание системы счисления
        if (nextAllowed > Date.now()) {
            cooldownUntil = nextAllowed;
            console.log('SkyAuto: Кулдаун восстановлен после перезагрузки');
        }
    }

    /* ---------- Всплывающая панель статуса ---------- */
    const ui = document.createElement('div');
    ui.style.cssText = `
        position: fixed;
        z-index: 99999;
        background: #1a1a2e;
        color: #a0a0b0;
        font-family: 'Segoe UI', system-ui, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        padding: 10px 14px;
        border-radius: 10px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.5);
        min-width: 200px;
        opacity: 0;
        transition: opacity 0.3s;
        cursor: default;
        user-select: none;
    `;

    // Шапка панели — за неё можно перетаскивать.
    const header = document.createElement('div');
    header.style.cssText = `
        cursor: move;
        margin: -10px -14px 6px -14px;
        padding: 6px 14px;
        background: rgba(255,255,255,0.05);
        border-radius: 10px 10px 0 0;
        font-size: 10px;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: space-between;
    `;
    header.innerHTML = '<span>SkyAuto</span><span style="font-size:14px;">⋮⋮</span>';
    ui.appendChild(header);

    const contentDiv = document.createElement('div');
    ui.appendChild(contentDiv);

    // Восстанавливаем сохранённую позицию панели.
    const savedPos = localStorage.getItem(UI_POS_KEY);
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            ui.style.top = pos.top + 'px';
            ui.style.left = pos.left + 'px';
        } catch (e) {
            ui.style.top = '12px';
            ui.style.right = '12px';
        }
    } else {
        ui.style.top = '12px';
        ui.style.right = '12px';
    }

    /* ---------- Перетаскивание панели ---------- */
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = ui.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        ui.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        ui.style.left = (e.clientX - dragOffsetX) + 'px';
        ui.style.top = (e.clientY - dragOffsetY) + 'px';
        ui.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        ui.style.transition = 'opacity 0.3s';
        const rect = ui.getBoundingClientRect();
        localStorage.setItem(UI_POS_KEY, JSON.stringify({ top: rect.top, left: rect.left }));
    });

    const attachUI = () => {
        if (document.body) {
            document.body.appendChild(ui);
            ui.style.opacity = '1';
        } else {
            setTimeout(attachUI, 100);
        }
    };
    attachUI();

    /** Обновляет текст панели статуса. */
    const updateStatus = (mainText, color = '#a0a0b0', subText = '') => {
        contentDiv.innerHTML = `
            <div style="font-weight:600; color:${color}; margin-bottom:2px;">🤖 ${mainText}</div>
            ${subText ? `<div style="color:#888; font-size:11px;">${subText}</div>` : ''}
        `;
    };

    /* ---------- Определение статуса оператора ---------- */

    // Все известные статусы оператора в CRM.
    const ALL_STATUSES = [
        'В работе', 'Оффлайн', 'Перерыв/обед', 'Тренинг',
        'Встреча', 'Работа с выгрузкой', 'Работа в другом отделе'
    ];

    /** Убирает из текста статуса таймер вида (ЧЧ:ММ:СС). */
    const stripTimer = (text) => text.replace(/\s*\(\d{1,2}:\d{2}:\d{2}\)/, '').trim();

    /** Соотносит текст с известными статусами; возвращает null, если это мусор. */
    const matchKnownStatus = (text) => ALL_STATUSES.find(s => text.includes(s));

    /**
     * ГИБРИДНЫЙ v3: пробует несколько способов определить статус оператора,
     * от самого точного к самому грубому.
     */
    const getOperatorStatus = () => {
        // Способ A: crm-operator-statuses > button (самый точный).
        const container = document.querySelector('crm-operator-statuses');
        if (container) {
            const btn = container.querySelector('button');
            if (btn) {
                const text = stripTimer(btn.textContent);
                if (text) {
                    const matched = matchKnownStatus(text);
                    if (matched) return matched;
                    if (text.length < 50) return text; // похож на статус — берём как есть
                }
            }
        }

        // Способ B: aria-label кнопки статуса.
        const statusBtn = document.querySelector('button[aria-haspopup="menu"]');
        if (statusBtn?.ariaLabel) {
            const clean = stripTimer(statusBtn.ariaLabel);
            const matched = matchKnownStatus(clean);
            if (matched) return matched;
        }

        // Способ C: span.mdc-button__label, содержащий таймер.
        const allSpans = document.querySelectorAll('span.mdc-button__label');
        for (const span of allSpans) {
            const text = span.textContent.trim();
            if (/\(\d{1,2}:\d{2}:\d{2}\)/.test(text)) {
                const status = stripTimer(text);
                const matched = matchKnownStatus(status);
                if (matched) return matched;
                if (status.length < 50) return status;
            }
        }

        // Способ D: грубый поиск «Статус (таймер)» по всему тексту страницы.
        const bodyText = document.body?.innerText || '';
        for (const status of ALL_STATUSES) {
            const escaped = status.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escaped + '\\s*\\(\\d{1,2}:\\d{2}:\\d{2}\\)');
            if (regex.test(bodyText)) return status;
        }

        return null;
    };

    /** Кнопка взятия задачи сейчас недоступна? */
    const isDisabled = (btn) => {
        if (!btn) return true;
        return btn.disabled ||
               btn.getAttribute('disabled') === 'true' ||
               btn.classList.contains('mat-mdc-button-disabled');
    };

    /* ---------- Основной цикл (раз в секунду) ---------- */
    const tick = () => {
        const currentUrl = location.pathname;
        const now = Date.now();

        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
        }

        if (!currentUrl.includes(TARGET_PATH)) {
            updateStatus('Вне зоны', '#666', 'Работаем только на /start');
            btnWasVisible = false;
            return;
        }

        // --- Ищем кнопку взятия задачи ---
        const btn = [...document.querySelectorAll('button')].find(b =>
            b.textContent.trim().includes(BTN_TEXT)
        );

        if (!btn) {
            lastClickedBtn = null;
            wasDisabled = true;
            btnWasVisible = false;
            updateStatus('Ожидание', '#a0a0b0', 'Кнопка не найдена');
            return;
        }

        // Кнопка появилась после отсутствия = вернулись на страницу → пауза 20 сек.
        if (!btnWasVisible && !isFirstTick) {
            cooldownUntil = now + COOLDOWN_MS;
            lastClickedBtn = null;
            wasDisabled = true;
            console.log('SkyAuto: Кнопка появилась, кулдаун 20 сек');
        }
        btnWasVisible = true;
        isFirstTick = false;

        // FIX: проверку настройки автовзятия делаем ДО определения статуса оператора —
        // иначе при выключенной функции панель показывала «ПАУЗА» вместо «ВЫКЛЮЧЕНО».
        if (localStorage.getItem('skyauto_enabled') === '0') {
            updateStatus('ВЫКЛЮЧЕНО', '#ff5555', 'Автовзятие отключено в настройках');
            return;
        }

        // --- Проверка статуса оператора: работаем только в режиме «В работе» ---
        const status = getOperatorStatus();

        if (status !== 'В работе') {
            const display = status || 'не определён';
            updateStatus('ПАУЗА', '#ff5555', `Статус: ${display} (нужен "В работе")`);
            return;
        }

        // --- Кулдаун после предыдущего клика ---
        if (cooldownUntil > now) {
            const sec = Math.ceil((cooldownUntil - now) / 1000);
            updateStatus('Кулдаун', '#ffd700', `Автоклик через ${sec} сек...`);
            return;
        }

        // --- Состояние кнопки ---
        const disabled = isDisabled(btn);

        if (disabled) {
            updateStatus('Мониторинг', '#00ff88', 'Кнопка недоступна, жду активации...');
            lastClickedBtn = null;
            wasDisabled = true;
            return;
        }

        // --- Кликаем ---
        if (btn !== lastClickedBtn || wasDisabled) {
            lastClickedBtn = btn;
            wasDisabled = false;

            updateStatus('КЛИК!', '#00ff88', 'Взял новую задачу');
            console.log('SkyAuto: Кликаю!', new Date().toLocaleTimeString());
            btn.click();

            sessionStorage.setItem(LAST_CLICK_KEY, String(Date.now()));

            setTimeout(() => {
                if (location.pathname.includes(TARGET_PATH)) {
                    updateStatus('Мониторинг', '#00ff88', 'Задача взята, жду следующей...');
                }
            }, 3000);
        } else {
            updateStatus('Мониторинг', '#00ff88', 'Кнопка активна, уже кликал');
        }
    };

    setInterval(tick, 1000);
    console.log('SkyAuto: Запущен.');
})();

/* ============================================================
 *  MATTERMOST SEARCH — полный функционал (из other/MattermostSearch.js)
 *  Работает через bg.js для обхода CORS.
 * ============================================================ */
(function () {
    'use strict';
    var MM_ORIGIN = 'https://mm-time.skyeng.tech';
    var WINDOW_ID = 'AF_Mattermost';
    var STORAGE_KEY = 'mms_cache_v1';
    var SEARCH_LIMIT = 20;
    var AUTH_ERR = 'AUTH';

    // Кэш
    var mmsCache = { channels: {}, users: {} };
    try { var cs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); if (cs && cs.channels && cs.users) mmsCache = cs; } catch (e) {}
    var persistCache = function() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mmsCache)); } catch (e) {} };

    // API через bg.js (CORS bypass)
    function mmsRequest(path, opts) {
        opts = opts || {};
        var url = MM_ORIGIN + path;
        var ro = Object.assign({}, opts, { credentials: 'include', headers: Object.assign({ 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }, opts.headers || {}) });
        return new Promise(function(resolve, reject) {
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url, requestOptions: ro }, function(resp) {
                if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
                if (!resp || !resp.success) { var e = (resp && resp.error) || 'no response'; if (/(401|403)/.test(e)) reject(new Error(AUTH_ERR)); else reject(new Error(e)); return; }
                try { resolve(JSON.parse(resp.fetchansver)); } catch (e) { reject(new Error('JSON error')); }
            });
        });
    }

    // Состояние
    var mmsDom = {};
    var mmsTeamId = '', mmsTeamName = '', mmsResults = [], mmsTerms = '', mmsPage = 0, mmsHasMore = false, mmsTeamsLoaded = false, mmsHidden = new Set();
    function mmsSetStatus(t, c) { if (!mmsDom.status) return; mmsDom.status.textContent = t || ''; if (c) mmsDom.status.style.color = c; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function prevOf(m) { return String(m || '').replace(/```[\s\S]*?```/g, ' ').replace(/`([^`]*)`/g, '$1').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/^#{1,6}\s*/gm, '').replace(/[*_~>]/g, '').replace(/\s+/g, ' ').trim(); }
    function hl(et, terms) { if (!terms) return et; String(terms).split(/\s+/).filter(function(w){return w.length>2}).forEach(function(w) { et = et.replace(new RegExp(esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), function(m){return '<span class="mms-hit">' + m + '</span>'}); }); return et; }

    // Вложения
    function getAtts(post) { return (!post) ? [] : (post.attachments || (post.props && post.props.attachments) || (post.metadata && post.metadata.attachments) || []); }
    function renderFiles(post) {
        var files = (post.metadata && Array.isArray(post.metadata.files)) ? post.metadata.files : [];
        if (!files.length && Array.isArray(post.file_ids) && post.file_ids.length) files = post.file_ids.map(function(id){return {id:id,name:'file',extension:''}});
        if (!files.length) return '';
        return '<div class="mms-files">' + files.map(function(f) {
            var url = MM_ORIGIN + '/api/v4/files/' + f.id;
            var ext = String(f.extension || '').toLowerCase();
            if (/^(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(ext)) return '<a class="mms-file-img" href="' + url + '" target="_blank"><img src="' + url + '" loading="lazy" onerror="this.closest(\'.mms-file-img\').classList.add(\'mms-file-broken\');"><span class="mms-file-name">' + esc(f.name || '') + '</span></a>';
            return '<a class="mms-file-link" href="' + url + '" target="_blank">📎 ' + esc(f.name || f.id) + '</a>';
        }).join('') + '</div>';
    }
    function renderAtts(post, terms) {
        var atts = getAtts(post);
        if (!atts.length) return '';
        return atts.map(function(a) {
            var bc = (a && a.color) ? esc(String(a.color)) : '';
            var title = (a && a.title) ? '<div class="mms-att-title">' + esc(String(a.title)).slice(0, 400) + '</div>' : '';
            var text = (a && a.text) ? '<div class="mms-att-text">' + hl(esc(String(a.text)).slice(0, 1200), terms) + '</div>' : '';
            var fields = (a && Array.isArray(a.fields) && a.fields.length) ? '<div class="mms-att-fields">' + a.fields.map(function(f) {
                var ft = (f && f.title) ? '<span class="mms-att-f-title">' + esc(String(f.title)) + '</span>' : '';
                var fv = (f && f.value != null) ? '<span class="mms-att-f-value">' + hl(esc(String(f.value)).slice(0, 600), terms) + '</span>' : '';
                if (!ft && !fv) return '';
                return '<div class="mms-att-field' + (f && f.short ? ' mms-att-field-short' : '') + '">' + ft + fv + '</div>';
            }).join('') + '</div>' : '';
            if (!title && !text && !fields) return '';
            return '<div class="mms-att"' + (bc ? ' style="border-left-color:' + bc + ';"' : '') + '>' + title + text + fields + '</div>';
        }).join('');
    }
    function renderPost(post, terms, opts) {
        opts = opts || {};
        var ch = mmsCache.channels[post.channel_id] || { displayName: post.channel_id };
        var author = mmsCache.users[post.user_id] || post.user_id || '';
        var date = new Date(post.create_at).toLocaleString('ru-RU');
        var preview = hl(esc(prevOf(post.message)), terms).slice(0, 900);
        var permalink = MM_ORIGIN + '/' + mmsTeamName + '/pl/' + post.id;
        var inThread = !!post.root_id, hasReplies = (post.reply_count || 0) > 0;
        var threadBtn = (opts.showThread !== false && (inThread || hasReplies)) ? '<button class="mms-act-btn" data-action="thread">🧵 Тред' + (hasReplies && !inThread ? ' (' + post.reply_count + ')' : '') + '</button>' : '';
        var item = document.createElement('div');
        item.className = 'mms-item' + (opts.isRoot ? ' mms-item-root' : '');
        item.innerHTML = '<div class="mms-item-head">' + (opts.isRoot ? '<span class="mms-root-badge">НАЧАЛО ТРЕДА</span>' : '') + '<span class="mms-channel"># ' + esc(ch.displayName) + '</span><span class="mms-author">' + esc(author) + '</span><span class="mms-time">' + esc(date) + '</span></div><div class="mms-msg">' + (preview || ((renderAtts(post, terms) || renderFiles(post)) ? '' : '<i>пустое сообщение</i>')) + '</div>' + renderFiles(post) + renderAtts(post, terms) + '<div class="mms-actions"><button class="mms-act-btn" data-action="open">🔗 Открыть</button><button class="mms-act-btn" data-action="copy">📋 Копировать</button>' + threadBtn + '</div>';
        item.querySelector('[data-action="open"]').onclick = function() { window.open(permalink, '_blank'); };
        item.querySelector('[data-action="copy"]').onclick = function() { navigator.clipboard.writeText(permalink).then(function(){ if (typeof createAndShowButton === 'function') createAndShowButton('Скопировано'); }); };
        var tb = item.querySelector('[data-action="thread"]');
        if (tb) tb.onclick = function() { mmsOpenThread(post); };
        return item;
    }

    // Команды
    function mmsInitTeams() {
        return mmsRequest('/api/v4/teams', { method: 'GET' }).then(function(teams) {
            mmsDom.team.innerHTML = '';
            teams = Array.isArray(teams) ? teams : [];
            if (!teams.length) { mmsDom.team.add(new Option('Нет команд', '')); return; }
            teams.forEach(function(t) { var o = new Option(t.display_name || t.name, t.id); o.dataset.name = t.name; mmsDom.team.add(o); });
            var preferred = null;
            try { var sid = localStorage.getItem('mms_team_id'); if (sid && teams.some(function(t){return t.id===sid})) preferred = teams.find(function(t){return t.id===sid}); } catch (e) {}
            if (!preferred) preferred = teams.find(function(t){return /skyeng/i.test((t.display_name || '') + ' ' + (t.name || ''))}) || teams[0];
            mmsDom.team.value = preferred.id; mmsTeamId = preferred.id; mmsTeamName = preferred.name; mmsTeamsLoaded = true;
            mmsSetStatus('Команда: ' + (preferred.display_name || preferred.name), '#d4a843');
        }).catch(function(e) { mmsDom.team.innerHTML = '<option value="">Ошибка</option>'; mmsSetStatus(e.message === AUTH_ERR ? 'Нужна авторизация' : 'Ошибка', '#f87171'); });
    }

    // Объединение результатов
    function mmsMerge(res) {
        var posts = (res && res.posts) || {};
        var order = Array.isArray(res.order) ? res.order : Object.keys(posts);
        var raw = order.map(function(id){return posts[id]}).filter(Boolean);
        var existing = new Set(mmsResults.map(function(p){return p.id}));
        var fresh = raw.filter(function(p){return !existing.has(p.id)});
        mmsResults.push.apply(mmsResults, fresh);
        mmsHasMore = !!((res && res.next_post_id) || fresh.length === SEARCH_LIMIT);
        var cids = [...new Set(fresh.map(function(p){return p.channel_id}).filter(Boolean))];
        var uids = [...new Set(fresh.map(function(p){return p.user_id}).filter(Boolean))];
        return Promise.all([
            Promise.all(cids.map(function(id){ return mmsRequest('/api/v4/channels/' + id, {method:'GET'}).then(function(ch){ mmsCache.channels[id]={name:ch.name,displayName:ch.display_name||ch.name}; persistCache(); }).catch(function(){ mmsCache.channels[id]={name:id,displayName:id}; }); })),
            mmsRequest('/api/v4/users/ids', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(uids)}).then(function(u){ (Array.isArray(u)?u:[]).forEach(function(x){ mmsCache.users[x.id]=x.username||x.nickname||x.first_name||x.id; }); persistCache(); }).catch(function(){})
        ]);
    }

    // Отрисовка результатов с группировкой по каналам
    function mmsDrawResults(terms) {
        var list = mmsResults.filter(function(p){return !mmsHidden.has(p.channel_id)});
        mmsDom.results.innerHTML = '';
        if (!mmsResults.length) { mmsDom.results.innerHTML = '<div class="mms-empty">Ничего не найдено.</div>'; mmsSetStatus('0', '#f87171'); return; }
        if (!list.length) { mmsDom.results.innerHTML = '<div class="mms-empty">Все каналы скрыты.</div>'; return; }
        var groups = new Map();
        list.forEach(function(p) { var id = p.channel_id || '_'; if (!groups.has(id)) groups.set(id, []); groups.get(id).push(p); });
        [...groups.entries()].sort(function(a,b){return b[1].length-a[1].length}).forEach(function(entry) {
            var chId = entry[0], posts = entry[1];
            var ch = mmsCache.channels[chId] || { displayName: chId };
            var g = document.createElement('div'); g.className = 'mms-group';
            var h = document.createElement('div'); h.className = 'mms-group-head';
            h.innerHTML = '<span class="mms-group-arrow">▾</span><span class="mms-channel"># ' + esc(ch.displayName) + '</span><span class="mms-group-cnt">' + posts.length + '</span>';
            h.onclick = function() { g.classList.toggle('mms-collapsed'); };
            var b = document.createElement('div'); b.className = 'mms-group-body';
            posts.forEach(function(p) { b.appendChild(renderPost(p, terms)); });
            g.appendChild(h); g.appendChild(b); mmsDom.results.appendChild(g);
        });
        if (mmsHasMore) { var mb = document.createElement('button'); mb.id = 'mms-more'; mb.className = 'mms-btn mms-btn-primary'; mb.style.cssText = 'width:100%;margin-top:10px;'; mb.textContent = '📥 Показать ещё'; mb.onclick = mmsLoadMore; mmsDom.results.appendChild(mb); }
        mmsSetStatus('Найдено: ' + mmsResults.length, '#86efac');
    }

    // Панель каналов-чипсов
    function mmsDrawChips() {
        var counts = new Map(); mmsResults.forEach(function(p) { if (p.channel_id) counts.set(p.channel_id, (counts.get(p.channel_id) || 0) + 1); });
        if (counts.size <= 1) { mmsDom.chips.style.display = 'none'; mmsDom.chips.innerHTML = ''; return; }
        mmsDom.chips.style.display = 'flex';
        mmsDom.chips.innerHTML = [...counts.entries()].sort(function(a,b){return b[1]-a[1]}).map(function(entry) {
            var id = entry[0], cnt = entry[1];
            var ch = mmsCache.channels[id] || { displayName: id };
            var off = mmsHidden.has(id);
            return '<span class="mms-chip' + (off ? ' mms-chip-off' : '') + '" data-ch="' + id + '"><span class="mms-chip-name"># ' + esc(ch.displayName) + '</span><span class="mms-chip-cnt">' + cnt + '</span></span>';
        }).join('') + (mmsHidden.size ? '<button class="mms-chip-reset" id="mms-chip-reset">показать все</button>' : '');
        mmsDom.chips.querySelectorAll('.mms-chip').forEach(function(c) { c.onclick = function() { var id = c.dataset.ch; if (mmsHidden.has(id)) mmsHidden.delete(id); else mmsHidden.add(id); mmsDrawChips(); mmsDrawResults(mmsTerms); }; });
        var r = mmsDom.chips.querySelector('#mms-chip-reset');
        if (r) r.onclick = function() { mmsHidden.clear(); mmsDrawChips(); mmsDrawResults(mmsTerms); };
    }

    // Тред
    function mmsOpenThread(post) {
        var rootId = post.root_id || post.id;
        mmsDom.chips.style.display = 'none';
        mmsDom.results.innerHTML = '<div class="mms-loading"><div class="mms-spinner"></div>Загрузка треда...</div>';
        mmsRequest('/api/v4/posts/' + rootId + '/thread', { method: 'GET' }).then(function(res) {
            var posts = (res && res.posts) || {};
            var order = Array.isArray(res.order) ? res.order : Object.keys(posts);
            var tp = order.map(function(id){return posts[id]}).filter(Boolean).sort(function(a,b){return (a.create_at||0)-(b.create_at||0)});
            var uids = [...new Set(tp.map(function(p){return p.user_id}).filter(Boolean))];
            var cids = [...new Set(tp.map(function(p){return p.channel_id}).filter(Boolean))];
            return Promise.all([Promise.all(cids.map(function(id){ return mmsRequest('/api/v4/channels/' + id, {method:'GET'}).then(function(ch){ mmsCache.channels[id]={name:ch.name,displayName:ch.display_name||ch.name}; persistCache(); }).catch(function(){ mmsCache.channels[id]={name:id,displayName:id}; }); })), mmsRequest('/api/v4/users/ids', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(uids)}).then(function(u){ (Array.isArray(u)?u:[]).forEach(function(x){ mmsCache.users[x.id]=x.username||x.nickname||x.first_name||x.id; }); persistCache(); }).catch(function(){})]).then(function() {
                mmsDom.results.innerHTML = '';
                var bar = document.createElement('div'); bar.className = 'mms-thread-bar';
                bar.innerHTML = '<button class="mms-btn" id="mms-thread-back">← Назад</button><span class="mms-thread-info">🧵 ' + tp.length + ' сообщ.</span>';
                mmsDom.results.appendChild(bar);
                bar.querySelector('#mms-thread-back').onclick = function() { mmsDrawChips(); mmsDrawResults(mmsTerms); };
                tp.forEach(function(p) { mmsDom.results.appendChild(renderPost(p, mmsTerms, { isRoot: p.id === rootId, showThread: false })); });
            });
        }).catch(function(e) { mmsDom.results.innerHTML = '<div class="mms-empty">Ошибка треда</div>'; mmsDrawChips(); mmsDrawResults(mmsTerms); });
    }

    // Поиск
    function mmsRunSearch() {
        var terms = mmsDom.query.value.trim();
        if (!terms) { mmsSetStatus('Введите запрос', '#fbbf24'); return Promise.resolve(); }
        if (!mmsTeamId) { mmsSetStatus('Команда не выбрана', '#f87171'); return Promise.resolve(); }
        mmsResults = []; mmsTerms = terms; mmsPage = 0; mmsHasMore = false; mmsHidden.clear();
        mmsDom.searchBtn.disabled = true;
        mmsDom.results.innerHTML = '<div class="mms-loading"><div class="mms-spinner"></div>Поиск...</div>';
        return mmsRequest('/api/v4/teams/' + mmsTeamId + '/posts/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ terms: terms, is_or_search: true, page: 0, per_page: SEARCH_LIMIT }) })
        .then(function(res) { return mmsMerge(res); })
        .then(function() { mmsDrawChips(); mmsDrawResults(terms); })
        .catch(function(e) { mmsSetStatus(e.message === AUTH_ERR ? 'Нужна авторизация' : 'Ошибка', '#f87171'); mmsDom.results.innerHTML = '<div class="mms-empty">Ошибка</div>'; })
        .finally(function() { mmsDom.searchBtn.disabled = false; });
    }

    function mmsLoadMore() {
        if (!mmsTeamId || !mmsTerms) return;
        var btn = document.getElementById('mms-more');
        if (btn) { btn.disabled = true; btn.textContent = 'Загрузка...'; }
        mmsPage++;
        mmsRequest('/api/v4/teams/' + mmsTeamId + '/posts/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ terms: mmsTerms, is_or_search: true, page: mmsPage, per_page: SEARCH_LIMIT }) })
        .then(function(res) { return mmsMerge(res); })
        .then(function() { mmsDrawChips(); mmsDrawResults(mmsTerms); })
        .catch(function(e) { if (typeof createAndShowButton === 'function') createAndShowButton('Ошибка: ' + e.message); });
    }

    // Привязка к окну
    function mmsBind() {
        mmsDom.win = document.getElementById(WINDOW_ID);
        if (!mmsDom.win) return false;
        mmsDom.team = document.getElementById('mms-team');
        mmsDom.query = document.getElementById('mms-query');
        mmsDom.status = document.getElementById('mms-status');
        mmsDom.results = document.getElementById('mms-results');
        mmsDom.chips = document.getElementById('mms-channel-bar');
        mmsDom.searchBtn = document.getElementById('mms-search');
        document.getElementById('mms-clear').onclick = function() { mmsDom.query.value = ''; mmsHidden.clear(); mmsResults = []; mmsTerms = ''; mmsPage = 0; mmsHasMore = false; mmsDom.results.innerHTML = '<div class="mms-empty">Введите запрос и нажмите «Найти».</div>'; mmsSetStatus(''); };
        mmsDom.searchBtn.onclick = mmsRunSearch;
        mmsDom.query.addEventListener('keydown', function(e) { if (e.key === 'Enter') mmsRunSearch(); });
        mmsDom.team.addEventListener('change', function() { var o = mmsDom.team.options[mmsDom.team.selectedIndex]; mmsTeamId = o.value; mmsTeamName = o.dataset.name || mmsTeamName; mmsSetStatus('Команда: ' + o.textContent.trim(), '#d4a843'); try { localStorage.setItem('mms_team_id', o.value); } catch (e) {} });
        return true;
    }

    // Публичное API
    window.mmsToggle = function() {
        mmsBind();
        if (!mmsDom.win) return;
        var hidden = mmsDom.win.style.display === 'none';
        mmsDom.win.style.display = hidden ? '' : 'none';
        if (hidden && !mmsTeamsLoaded) mmsInitTeams();
    };

    console.log('[MMS] Полный функционал загружен');
})();
