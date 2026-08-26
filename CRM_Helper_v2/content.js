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
    <div id="SrvDskCRMbtn" class="menubtnsCRM">🛠 Service Desk</div>
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

            clearInterval(init); // тулбар найден — поллинг больше не нужен
        }
    }
    catch (e) { console.error(e, e.stack); }
}

let init = setInterval(initialize, 3000); // заносим в переменную, чтобы иметь возможность остановить

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
setInterval(screenshotsCRM, 5000);

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
            console.log('SkyAuto: URL →', currentUrl);
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
        console.log('SkyAuto: Статус оператора =', JSON.stringify(status));

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
