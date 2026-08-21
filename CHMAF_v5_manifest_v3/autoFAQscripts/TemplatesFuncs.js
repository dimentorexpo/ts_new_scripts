// ============================================================
// ChMAF — TemplatesFuncs.js: шаблоны из Google Sheets, кнопки
// информации о пользователе, быстрые теги, отправка ответов.
// ============================================================

// Адреса ТП-скриптов (загружаются асинхронно из chrome.storage)
let TP_addres = '';
let TP_addresRzrv = '';
chrome.storage.local.get({ TP_addr: '', TP_addrRzrv: '' }, function (result) {
    TP_addres = result.TP_addr;
    TP_addresRzrv = result.TP_addrRzrv;
});

const editorExtensionId = localStorage.getItem('ext_id');

var nameContainer = '';     // ID чата, для которого собрана панель UsersInfo
let currentUserType = '';   // userType активного чата (startTimer ↔ buttonsFromDoc)
let currentVertical = '';   // vertical активного чата

const AF_API_ORIGIN = 'https://skyeng.autofaq.ai';
const AUTOFAQ_TOP_BATCH_URL = `${AF_API_ORIGIN}/api/reason8/autofaq/top/batch`;
const ANSWERS_URL = `${AF_API_ORIGIN}/api/reason8/answers`;

// ============================================================
// Панель кнопок текущего/следующего пользователя (win_UsersInfo)
// ============================================================
const UI_PREFIX = 'usinf';

const usersConfig = [
    {
        rowId: 'currUserRow',
        rowVisible: true,
        buttons: [
            { id: 'CurrUser', title: 'Открыть в CRM', content: '👨‍🎓', label: 'CRM' },
            { id: 'CurUsLoginer', title: 'Логинер', content: '🔑', label: 'Логинер' },
            { id: 'CurUstroublesh', title: 'ТШ', content: '🕵️‍♀️', label: 'Troubleshooter' },
            { id: 'CurUsChatHis', title: 'История чатов', content: '☢️', label: 'История' },
            { id: 'CurUsChatHisWA', title: 'WA', isImage: true, src: `chrome-extension://${editorExtensionId}/Images/WA.png`, alt: 'WA', label: 'WhatsApp' },
            { id: 'CurUsUserInf', title: 'UserInf', content: '⚜️', label: 'Инфо' },
            { id: 'CurUsAdminka', title: 'Админка', content: '✏️', label: 'Админка' }
        ]
    },
    {
        rowId: 'nextUsersp',
        rowVisible: false,
        buttons: [
            { id: 'NextUser', title: 'CRM', content: '👽', label: 'CRM' },
            { id: 'NextUsLoginer', title: 'Логинер', content: '🔑', label: 'Логинер' },
            { id: 'NextUstroublesh', title: 'ТШ', content: '🕵️‍♀️', label: 'Troubleshooter' },
            { id: 'NextUsChatHis', title: 'История', content: '☢️', label: 'История' },
            { id: 'NextUsUserInf', title: 'Инфо', content: '⚜️', label: 'Инфо' },
            { id: 'NextUsAdminka', title: 'Админка', content: '✏️', label: 'Админка' }
        ]
    }
];

const glassmorphismCSS = `
/* Основная панель */
.${UI_PREFIX}-glass-panel {
border-radius: 20px !important;
    padding: 24px 16px 16px 16px !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 16px !important;
    width: fit-content !important;
    /* Цвета теперь придут из JS динамически */
}

.${UI_PREFIX}-row {
    display: flex !important;
    align-items: center !important;
    height: 40px !important;
}

/* Кнопка - теперь это всегда ровный круг, который не меняет ширину */
.${UI_PREFIX}-btn-glass {
    cursor: pointer !important;
    height: 42px !important;
    width: 42px !important;
    min-width: 42px !important;
    border-radius: 50% !important;

     /* border без !important — иначе он всегда чёрный */
    border: 1px solid rgba(0, 0, 0, 0.08);

    /* УБРАЛИ !important отсюда, чтобы JS мог менять цвет */
    background: #ffffff;

    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    margin-left: -12px !important;
    position: relative !important;
    z-index: 1 !important;

    /* ДОБАВИЛИ background в transition для плавного перетекания цвета */
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease, z-index 0s linear 0.2s !important;
    will-change: transform, background;
}

/* Физическое "нажатие" кнопки при клике */
.${UI_PREFIX}-btn-glass:active {
    transform: translateY(0px) scale(0.92) !important;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1) !important;
    transition: transform 0.05s ease, box-shadow 0.05s ease !important;
}

.${UI_PREFIX}-btn-glass:first-child {
    margin-left: 0 !important;
}

.${UI_PREFIX}-icon-box {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 18px !important;
}

/* Парящая подсказка (tooltip) */
.${UI_PREFIX}-label-text {
    position: absolute !important;
    bottom: calc(100% + 10px) !important;
    left: 50% !important;
    transform: translateX(-50%) translateY(8px) scale(0.9) !important;
    opacity: 0 !important;
    pointer-events: none !important;

    background: rgba(255, 255, 255, 0.9) !important;
    backdrop-filter: blur(8px) !important;
    border: 1px solid rgba(255, 255, 255, 0.8) !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
    border-radius: 8px !important;
    padding: 6px 12px !important;

    white-space: nowrap !important;
    font-family: 'Segoe UI', system-ui, sans-serif !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #333 !important;

    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    will-change: transform, opacity;
}

.${UI_PREFIX}-btn-glass:hover {
    z-index: 100 !important;
    transform: translateY(-4px) !important;
    box-shadow: 0 8px 16px rgba(0,0,0,0.12) !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease, z-index 0s linear 0s !important;
}

.${UI_PREFIX}-btn-glass:hover .${UI_PREFIX}-label-text {
    opacity: 1 !important;
    transform: translateX(-50%) translateY(0) scale(1) !important;
}

.${UI_PREFIX}-btn-img {
    width: 22px !important;
    height: 22px !important;
}
`;

function buildBtn(cfg) {
    const content = cfg.isImage
        ? `<img src="${cfg.src}" alt="${cfg.alt}" class="${UI_PREFIX}-btn-img">`
        : `<span>${cfg.content}</span>`;

    return `
    <button class="${UI_PREFIX}-btn-glass" id="${cfg.id}" title="${cfg.title}">
        <div class="${UI_PREFIX}-icon-box">${content}</div>
        <span class="${UI_PREFIX}-label-text">${cfg.label}</span>
    </button>`;
}

function buildRow(cfg) {
    const display = cfg.rowVisible ? 'flex' : 'none';
    return `
    <div id="${cfg.rowId}" class="${UI_PREFIX}-row" style="display: ${display}">
        ${cfg.buttons.map(buildBtn).join('')}
    </div>`;
}

var win_UsersInfo = `
<style>${glassmorphismCSS}</style>
<div class="${UI_PREFIX}-glass-panel">
    ${usersConfig.map(buildRow).join('')}
</div>
`;

// ============================================================
// Кнопка «Взять запрос» и индикатор урока
// ============================================================

/** Красит кнопку взятия запроса при наличии входящих. */
function requestsRed(taketaskElement) {
    if (!taketaskElement) return;

    const text = taketaskElement.textContent.trim();
    const hasRequests = /Взять запрос\s*\(\d+\)/.test(text);

    // Активна ли тёмная/кастомная тема
    const doc = taketaskElement.ownerDocument;
    const isDark = !!(doc.getElementById('chmaf-bg-iframe') || document.getElementById('chmaf-bg-main'));

    if (hasRequests) {
        taketaskElement.style.setProperty('background', '#F34723', 'important');
        taketaskElement.style.setProperty('color', '#ffffff', 'important');
    } else {
        taketaskElement.style.removeProperty('background');
        taketaskElement.style.removeProperty('color');

        if (!isDark && text === 'Нет входящих запросов') {
            taketaskElement.style.setProperty('background', 'white', 'important');
        }
    }
}

/** Добавляет несколько тегов в чат (строкой «тег1,тег2»). */
function newTags(tagName) {
    const chatId = getChatId();
    if (!chatId) return;

    const tags = String(tagName).split(',').map((t) => t.trim()).filter(Boolean);
    if (!tags.length) return;

    afApiFetch(`${AF_API_ORIGIN}/api/conversation/${chatId}/payload`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            conversationId: chatId,
            elements: [{ name: 'tags', value: tags }]
        })
    }).catch(() => {});
}

/** Красная плашка «идёт урок» на активной карточке чата. */
function Lessonisnow(iframeDoc) {
    const convList = iframeDoc.querySelectorAll('#__next [class^="DialogsCard_Card"]');
    if (!convList.length) return;

    const lessonStatus = SearchinAFnewUI('nextClass-statusHTML');
    if (!lessonStatus.includes('идет') && !lessonStatus.includes('идёт')) return;

    const activeConvElem =
        Array.from(convList).find((card) => card.getAttribute('aria-selected') === 'true');

    if (activeConvElem && activeConvElem.getElementsByClassName('LessonIndicator').length === 0) {
        const indicator = iframeDoc.createElement('span');
        indicator.style.cssText =
            'background:rgb(187,5,5);padding:5px;color:#fff;font-weight:400;border:1px solid black;';
        indicator.className = 'LessonIndicator';
        indicator.textContent = lessonStatus;

        activeConvElem.children[0].children[0].append(indicator);
    }
}

// ============================================================
// Автостатус при входе на /tickets/common
// ============================================================
function autoStatusSwitch() {
    try {
        if (window.location.href === 'https://skyeng.autofaq.ai/login') {
            clearInterval(statusCheckInt);
            return;
        }

        if (location.href !== 'https://skyeng.autofaq.ai/tickets/common') return;

        // Ждём токен и DOM
        if (!aftoken) return;

        const userNameEl = document.querySelector('.user_menu-dropdown-user_name');
        if (!userNameEl) return;

        // Для ТП ОС статус не трогаем
        if (userNameEl.textContent.includes('Обратная связь')) {
            console.log('[AutoStatus] Это ТП ОС, автостатус не нужен.');
            clearInterval(statusCheckInt);
            return;
        }

        let savedStatus = Settings.get('defaultStatusAfterLogin');
        if (!savedStatus) {
            savedStatus = 'Online';
            Settings.set('defaultStatusAfterLogin', savedStatus);
            console.log('[AutoStatus] Настройка не найдена, установлено по умолчанию:', savedStatus);
        }

        changeStatus(savedStatus, aftoken);
        clearInterval(statusCheckInt);
        console.log('[AutoStatus] Статус установлен:', savedStatus);
    } catch (error) {
        console.error('[AutoStatus] Ошибка:', error.message);
    }
}

const statusCheckInt = setInterval(autoStatusSwitch, 500);

// ============================================================
// startTimer — основной цикл (каждые 500 мс)
// ============================================================

/** Обновляет строку «вертикаль + тип» в окне тестовых пользователей. */
function updateUserBadgeInTestUsers(iframeDoc) {
    if (!document.getElementById('TestUsers')) return;

    const infoUserEl = document.getElementById('addInfoUser');
    if (!infoUserEl) return;

    const convList = iframeDoc.querySelectorAll('#__next [class^="DialogsCard_Card"]');
    if (!convList.length) {
        infoUserEl.innerHTML = '';
        return;
    }

    currentUserType = SearchinAFnewUI('userType');
    currentVertical = currentUserType === 'teacher'
        ? SearchinAFnewUI('teacherVertical')
        : SearchinAFnewUI('supportVertical');

    infoUserEl.innerHTML = (currentUserType === '' || currentVertical === '')
        ? ''
        : `${currentVertical} + ${currentUserType}`;
}

/** Показывает/скрывает панель быстрых тегов согласно настройке. */
function toggleQuickTags(iframeDoc, usernameField, tagsShowFlag) {
    if (!usernameField) return;

    if (tagsShowFlag === '1') {
        showTaggs(iframeDoc);
    } else {
        iframeDoc.getElementById('quickTagsdiv')?.remove();
    }
}

/** Строит или пересобирает панель UsersInfo при смене чата. */
function rebuildUsersPanelIfNeeded(iframeDoc, usernameField) {
    const panels = iframeDoc.getElementsByClassName('UsersInfo');

    if (panels.length === 0) {
        buildUsersPanel(iframeDoc, usernameField);
    } else if (panels.length === 1 && getChatId() !== nameContainer) {
        // Чат сменился — убираем старую панель для пересборки
        panels[0].remove();
        iframeDoc.getElementById('userTypeId')?.remove();
        iframeDoc.getElementById('diskettocopy')?.remove();
    }
}

function buildUsersPanel(iframeDoc, usernameField) {
    const nameRow = usernameField.children[0];

    const userTypeName = iframeDoc.createElement('span');
    userTypeName.id = 'userTypeId';
    userTypeName.style.cssText = 'margin-left:5px;';
    nameRow.append(userTypeName);

    const usersInfoField = iframeDoc.createElement('div');
    usersInfoField.className = 'UsersInfo';
    usersInfoField.style.cssText = 'display:block;';
    usersInfoField.innerHTML = win_UsersInfo;
    usernameField.append(usersInfoField);

    nameContainer = getChatId();
    const usertypeis = SearchinAFnewUI('userType');

    // 💾 копировать ссылку на карточку в CRM
    const copyCrmFromName = iframeDoc.createElement('span');
    copyCrmFromName.textContent = ' 💾';
    copyCrmFromName.style.cssText = 'cursor:pointer;margin-left:5px;';
    copyCrmFromName.id = 'diskettocopy';
    nameRow.append(copyCrmFromName);
    copyCrmFromName.onclick = function () {
        const idaf = SearchinAFnewUI('id');
        copyToClipboard('https://crm2.skyeng.ru/persons/' + idaf);
        createAndShowButton('💾 Cкопировано', 'message');
    };

    // test — кнопка тестового чата
    const testchatbtn = iframeDoc.createElement('span');
    testchatbtn.textContent = ' test';
    testchatbtn.style.cssText =
        'cursor:pointer;margin-left:5px;color:crimson;font-size:medium;margin-left:auto;margin-right:auto;display:none;';
    testchatbtn.id = 'testchatbtn';
    nameRow.append(testchatbtn);
    testchatbtn.onclick = function () {
        sendComment('Тестовый чат');
        setTimeout(() => newTaggg('double'), 500);
        setTimeout(() => setTheme('1710'), 1000);
    };

    paintUserTypeBadge(iframeDoc, usertypeis);
    buttonsfunctionsinfo(iframeDoc, usertypeis);
}

/** Иконка+подпись для кнопки Curr/Next панели. */
function setUserIcon(iframeDoc, buttonId, icon, label) {
    const iconEl = iframeDoc.querySelector(`#${buttonId} .usinf-icon-box span`);
    if (iconEl) iconEl.textContent = icon;

    if (label) {
        const labelEl = iframeDoc.querySelector(`#${buttonId} .usinf-label-text`);
        if (labelEl) labelEl.textContent = label;
    }
}

/** Бейдж типа пользователя и пары «текущий → следующий». */
function paintUserTypeBadge(iframeDoc, usertypeis) {
    const badge = iframeDoc.getElementById('userTypeId');
    if (!badge) return;

    const ICON_TEACHER = '👽';
    const LABEL_TEACHER = 'CRM П';
    const ICON_STUDENT = '👨‍🎓';
    const LABEL_STUDENT = 'CRM У';

    if (usertypeis === 'teacher') {
        badge.textContent = ' (П)';
        badge.style.color = '#1E90FF';

        setUserIcon(iframeDoc, 'CurrUser', ICON_TEACHER, LABEL_TEACHER);

        if (SearchinAFnewUI('nextClass-studentId') !== '') {
            setUserIcon(iframeDoc, 'NextUser', ICON_STUDENT, LABEL_STUDENT);
            iframeDoc.getElementById('nextUsersp').style.display = 'flex';
        }
    } else if (usertypeis === 'student' || usertypeis === 'parent') {
        badge.textContent = usertypeis === 'parent' ? ' (РУ)' : ' (У)';
        badge.style.color = '#DC143C';

        setUserIcon(iframeDoc, 'CurrUser', ICON_STUDENT, LABEL_STUDENT);

        if (SearchinAFnewUI('nextClass-teacherId') !== '') {
            setUserIcon(iframeDoc, 'NextUser', ICON_TEACHER, LABEL_TEACHER);
            iframeDoc.getElementById('nextUsersp').style.display = 'flex';
        }
    } else {
        setUserIcon(iframeDoc, 'CurrUser', '❓', null);
    }
}

function startTimer() {
    const tagsShowFlag = localStorage.getItem('showquicktags');
    const trigerTestChat = localStorage.getItem('trigertestchat');
    const hrefIsNow = window.location.href;
    const iframeElement = document.querySelector('[class^="NEW_FRONTEND__frame"]');
    let taketaskElement = null;

    if (iframeElement) {
        const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document;
        const usernameField = iframeDoc?.querySelectorAll('[class^="User_Preview"]')[0];
        const searchList = iframeDoc?.querySelectorAll('[class^="Operator_DialogsActions"]') ?? [];

        // Ищем кнопку «Взять запрос»
        for (const actions of searchList) {
            const candidate = actions.children[1];
            if (candidate &&
                Array.from(candidate.classList).some((c) => c.includes('Operator_TakeRequestButton'))) {
                taketaskElement = candidate;
                break;
            }
        }

        if (hrefIsNow.includes('skyeng.autofaq.ai/tickets/assigned')) {
            Lessonisnow(iframeDoc);
            requestsRed(taketaskElement);

            if (scriptAdr === TP_addres || scriptAdr === TP_addresRzrv) { // блок только для ТП
                updateUserBadgeInTestUsers(iframeDoc);
                toggleQuickTags(iframeDoc, usernameField, tagsShowFlag);

                // Видимость кнопки тестового чата
                const testChatBtn = iframeDoc.getElementById('testchatbtn');
                if (testChatBtn) {
                    if (trigerTestChat === '0') testChatBtn.style.display = 'none';
                    else if (trigerTestChat === '1') testChatBtn.style.display = '';
                }

                if (hrefIsNow.includes('skyeng.autofaq.ai/tickets/assigned') && usernameField) {
                    rebuildUsersPanelIfNeeded(iframeDoc, usernameField);
                }
            }
        }
    }

    // Звук при входящих запросах
    if (localStorage.getItem('audio') === '1' &&
        hrefIsNow.includes('skyeng.autofaq.ai') && taketaskElement) {
        ConvAudio(taketaskElement.textContent !== 'Нет входящих запросов' ? 'on' : 'off');
    }
}

// ============================================================
// Действия кнопок панели UsersInfo
// ============================================================

/** Ссылка на Troubleshooter за последние сутки (логика дат — как в оригинале). */
function buildTroubleshooterUrl(userId) {
    const now = new Date();
    const pad2 = (n) => String(n).padStart(2, '0');
    const year = now.getFullYear();
    const month = pad2(now.getMonth() + 1);
    const day = pad2(now.getDate());
    // Для 1-го числа «предыдущий день» = текущий день (поведение оригинала)
    const prevDay = now.getDate() - 1 === 0 ? day : pad2(now.getDate() - 1);

    return (
        'https://video-trouble-shooter.skyeng.ru/?userId=' + userId +
        '&from=' + `${year}-${month}-${prevDay}T00:00:00` +
        '&to=' + `${year}-${month}-${day}T23:59:00&order=desc`
    );
}

function findrequestargument(usertypeis) {
    return usertypeis === 'teacher' ? 'nextClass-studentId' : 'nextClass-teacherId';
}

function buttonsfunctionsinfo(iframeDoc, usertypeis) {
    /** Зелёная вспышка кнопки на 1 с. */
    function flashGreen(btn) {
        btn.style.background = 'lightgreen';
        setTimeout(() => { btn.style.background = ''; }, 1000);
    }

    /** Вспышка с important (перебивает классы темы). */
    function flashImportant(btn, color) {
        btn.style.setProperty('background', color, 'important');
        setTimeout(() => btn.style.removeProperty('background'), 1000);
    }

    async function handleLoginLinkClick(idNode, buttonStyle) {
        buttonStyle.background = 'coral';
        try {
            await getLoginLink(idNode);
            buttonStyle.background = 'rgb(29, 235, 10)';
        } catch (error) {
            console.log('Ошибка: ', error);
            buttonStyle.background = 'rgb(201, 17, 17)';
        } finally {
            setTimeout(() => { buttonStyle.background = ''; }, 1000);
        }
    }

    const currentUserId = () => SearchinAFnewUI('id');
    const nextUserId = () => SearchinAFnewUI(findrequestargument(usertypeis));
    const phoneWithoutPlus = () => SearchinAFnewUI('phone').split('+')[1];

    function openCrm(idNode) {
        window.open('https://crm2.skyeng.ru/persons/' + idNode);
    }

    function openTroubleshooter(idNode) {
        window.open(buildTroubleshooterUrl(idNode));
    }

    function openAdminka(idNode) {
        window.open(`https://id.skyeng.ru/admin/users/${idNode}/update-contacts`);
    }

    function openUserInfo(idNode) {
        const serviceWin = document.getElementById('AF_Service');
        if (serviceWin && serviceWin.style.display === 'none') serviceWin.style.display = '';
        const idInput = document.getElementById('idstudent');
        if (idInput) idInput.value = idNode;
        document.getElementById('getidstudent')?.click();
    }

    function openChatHistory(idNode) {
        // Окно истории открывается даже без ID — как в оригинале
        document.getElementById('opennewcat')?.click();
        if (!idNode) return;

        const input = document.getElementById('chatuserhis');
        if (input) input.value = idNode;
        document.getElementById('btn_search_history')?.click();
    }

    /** Простая кнопка: вспышка + действие при наличии ID. */
    function bindSimple(btnId, getIdNode, action) {
        iframeDoc.getElementById(btnId).onclick = function () {
            flashGreen(this);
            const idNode = getIdNode();
            if (idNode) action(idNode);
        };
    }

    /**
     * Кнопка логинера. Повторяет оригинальное поведение:
     * зелёная вспышка и тост показываются после попытки копирования
     * независимо от её результата.
     */
    function bindLoginer(btnId, getIdNode) {
        iframeDoc.getElementById(btnId).onclick = async function () {
            const idNode = getIdNode();
            if (!idNode) {
                flashImportant(this, 'rgba(255, 71, 87, 0.9)');
                return;
            }

            await handleLoginLinkClick(idNode, this.style);
            flashImportant(this, 'rgba(46, 213, 115, 0.9)');
            createAndShowButton('💾 Ссылка-логинер скопирована', 'message');
        };
    }

    bindSimple('CurrUser', currentUserId, openCrm);
    bindLoginer('CurUsLoginer', currentUserId);
    bindSimple('CurUstroublesh', currentUserId, openTroubleshooter);
    bindSimple('CurUsAdminka', currentUserId, openAdminka);
    bindSimple('CurUsChatHis', currentUserId, openChatHistory);
    bindSimple('CurUsChatHisWA', phoneWithoutPlus, openChatHistory);
    bindSimple('CurUsUserInf', currentUserId, openUserInfo);

    bindSimple('NextUser', nextUserId, openCrm);
    bindLoginer('NextUsLoginer', nextUserId);
    bindSimple('NextUstroublesh', nextUserId, openTroubleshooter);
    bindSimple('NextUsAdminka', nextUserId, openAdminka);
    bindSimple('NextUsChatHis', nextUserId, openChatHistory);
    bindSimple('NextUsUserInf', nextUserId, openUserInfo);
}

// ============================================================
// Звук входящих запросов
// ============================================================
function ConvAudio(triger) {
    if (!soundintervalset && triger === 'on') {
        audio.play().catch(() => {});

        const repeatSeconds = parseInt(localStorage.getItem('splinter'), 10) || 3;
        soundintervalset = setInterval(() => {
            audio.play().catch(() => {});
        }, repeatSeconds * 1000);
    } else if (soundintervalset && triger === 'off') {
        clearInterval(soundintervalset);
        soundintervalset = null;
    }
}

// ============================================================
// Быстрые теги в чате
// ============================================================
const QUICK_TAG_BASE_STYLE = 'float:left;margin-right:5px;margin-top:10px;cursor:pointer;';

const QUICK_TAG_BUTTONS = [
    { id: 'continue_chat_button', label: 'Дубль', tag: 'double' },
    { id: 'refuse', label: 'Отказ', tag: 'refusal_of_help' },
    { id: 'TPcallsend', label: 'Исход', tag: 'request_forwarded_to_outgoing_tp_crm2' },
    // Завершающий пробел в теге ниже сохранён намеренно (как в оригинале)
    { id: 'recgiv', label: 'Даны реком', tag: 'recommendations_given ' },
    { id: 'solvd', label: 'Решен', tag: 'request_solved' },
    { id: 'servis', label: 'Серверные', tag: 'server_issues' },
    { id: 'untargeted', label: 'Нецелевой', tag: 'untargeted' },
    { id: 'ochered', label: 'Очередь', tag: 'queue' },
    { id: 'svyazsU', label: 'П->связь У', comment: 'Обратился П, связаться с У', color: '#1e90ff' },
    { id: 'svyazsP', label: 'У->связь П', comment: 'Обратился У, связаться с П', color: '#c92e52' },
    { id: 'PNO', label: 'П НО', comment: 'Крит Н.О. П', color: '#1e90ff' },
    { id: 'UNO', label: 'У НО', comment: 'Крит Н.О. У', color: '#c92e52' }
];

function showTaggs(iframeDoc) {
    if (iframeDoc.getElementById('quickTagsdiv')) return;

    const fieldToTags = iframeDoc.querySelectorAll('[class^="conversation-payload-form"]')[0];
    if (!fieldToTags) return;

    const quickTagsDiv = iframeDoc.createElement('div');
    quickTagsDiv.id = 'quickTagsdiv';
    fieldToTags.children[0].children[0].children[0].append(quickTagsDiv);

    for (const cfg of QUICK_TAG_BUTTONS) {
        const btn = iframeDoc.createElement('span');
        btn.id = cfg.id;

        const accentStyle = cfg.color
            ? `color:${cfg.color};cursor:pointer;font-weight:700;`
            : 'color:black;cursor:pointer;';
        btn.innerHTML = `<a style="${QUICK_TAG_BASE_STYLE}${accentStyle}">${cfg.label}</a>`;

        if (cfg.tag) btn.setAttribute('data-tagname', cfg.tag);
        if (cfg.comment) btn.setAttribute('comment-text', cfg.comment);
        quickTagsDiv.append(btn);

        btn.addEventListener('click', function () {
            const tagName = this.getAttribute('data-tagname');
            const comment = this.getAttribute('comment-text');

            // События обрабатываются в основном документе (слушатели внизу файла)
            if (tagName) {
                window.dispatchEvent(new CustomEvent('callNewTaggg', { detail: { tagName } }));
            }
            if (comment) {
                window.dispatchEvent(new CustomEvent('CallNewComment', { detail: { comment } }));
            }
        });
    }
}

// ============================================================
// Маскирование персональных данных
// ============================================================

function maskPhoneNumber(number) {
    const start = number.startsWith('+') ? number.substring(0, 5) : number.substring(0, 4);
    const end = number.slice(-2);
    const stars = '*'.repeat(number.length - start.length - end.length);
    return start + stars + end;
}

function maskEmail(email) {
    const [localPart, domainPart] = email.split('@');
    let maskedLocalPart;

    if (localPart.length > 5) {
        maskedLocalPart = localPart.substring(0, 3) + '*'.repeat(localPart.length - 5) + localPart.slice(-2);
    } else if (localPart.length >= 4) {
        maskedLocalPart = localPart.substring(0, 2) + '*'.repeat(localPart.length - 3) + localPart.slice(-1);
    } else {
        maskedLocalPart = localPart.substring(0, 1) + '*'.repeat(localPart.length - 1);
    }

    return maskedLocalPart + '@' + domainPart;
}

/** Подставляет телефон/почту/имя в шаблон вместо маркеров (phone)/(email)/(name). */
function transfPageButtons(textFromTable) {
    if (textFromTable.includes('(phone)')) {
        const phoneInput = document.getElementById('phone_tr');
        let phone = phoneInput.value || phoneInput.placeholder;

        const phonePattern = /^(\+?[0-9]{7,20})$/;
        if (!phonePattern.test(phone) || phone === 'Телефон') {
            document.getElementById('inp').value = 'Введите номер телефона';
            return;
        }

        textFromTable = textFromTable.split('(phone)').join(maskPhoneNumber(phone));
    }

    if (textFromTable.includes('(email)')) {
        const emailInput = document.getElementById('email_tr');
        let email = emailInput.value || emailInput.placeholder;

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email) || email === 'Почта') {
            document.getElementById('inp').value = 'Введите почту';
            return;
        }

        textFromTable = textFromTable.split('(email)').join(maskEmail(email));
    }

    if (textFromTable.includes('(name)')) {
        const tempname = getActiveConvUserName();
        const cyrillicPattern = /^[\u0400-\u04FF]+$/;
        const languageAF = document.getElementById('languageAF').innerHTML;

        let name = '';
        if (tempname !== 'Неизвестный') {
            const matchesLanguage =
                (languageAF === 'Русский' && cyrillicPattern.test(tempname)) ||
                (languageAF === 'Английский' && !cyrillicPattern.test(tempname));
            if (matchesLanguage) name = tempname;
        }

        textFromTable = textFromTable.split('(name)').join(name);
    }

    return textFromTable;
}

// ============================================================
// Отправка сообщений и работа с таблицей шаблонов
// ============================================================

function setInputMessage(message) {
    document.getElementById('inp').value = message;
}

/** Приветствие с учётом языка интерфейса и языка имени пользователя. */
function buildGreeting() {
    const tempname = getActiveConvUserName();
    const cyrillicPattern = /^[\u0400-\u04FF]+$/;
    const isRussian = document.getElementById('languageAF').innerHTML === 'Русский';

    const canUseName =
        (isRussian ? cyrillicPattern.test(tempname) : !cyrillicPattern.test(tempname)) &&
        tempname !== 'Неизвестный' &&
        tempname !== '' &&
        document.getElementById('msg1').innerHTML === 'Доработать';

    const hello = isRussian ? 'Здравствуйте' : 'Hello';
    const tail = isRussian
        ? 'Работаю над вашим вопросом — скоро вернусь с результатом.'
        : "I'm working on your question - I'll be back with the results soon.";

    return canUseName
        ? `${hello}, ${tempname}!\r\n${tail}`
        : `${hello}!\r\n${tail}`;
}

const SMARTROOM_TEMPLATE_NAMES = [
    '🤬Негатив ОС',
    '🖼Нет изобр в ДЗ ЛК',
    '💨Сброс ответов ДЗ ЛК',
    '🔇Звук ответов ЛК',
    '🖥Размер видео',
    '🖼📱Нет изобр ДЗ в МП'
];

async function buttonsFromDoc(butName) {
    // «ус+брауз» разворачивается в вариант для ученика/учителя
    if (butName === 'ус+брауз') {
        butName = (!currentUserType || currentUserType === 'student')
            ? 'ус+брауз (У)'
            : 'ус+брауз (П)';
    }

    if (butName === 'Привет') {
        sendAnswerTemplate2(buildGreeting());
        return;
    }

    // Шаблоны Smartroom открывают своё окно настроек
    if (SMARTROOM_TEMPLATE_NAMES.includes(butName) &&
        document.getElementById('AF_Smartroomform')?.style.display === 'none') {
        document.getElementById('smartroomform')?.click();
    }

    msgFromTable(butName);
}

async function addJiraURL(URLvalue) {
    const hashRoom = document.URL.split('/')[5];

    try {
        const response = await afApiFetch(`${AF_API_ORIGIN}/api/conversation/${hashRoom}/payload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                conversationId: hashRoom,
                elements: [{ name: 'taskUrl', value: URLvalue }]
            })
        });

        if (!response.ok) {
            console.error('Ошибка при отправке Jira URL:', response.statusText);
        } else {
            console.log('Jira URL успешно добавлен');
        }
    } catch (error) {
        console.error('Ошибка сети при отправке Jira URL:', error);
    }
}

async function servFromDoc(event) {
    msgFromTable(event.target.textContent);

    const linkInput = document.getElementById('avariyalink');
    if (linkInput && linkInput.value.trim() !== '') {
        const linkToSend = linkInput.value.trim();
        sendComment(linkToSend);
        await addJiraURL(linkToSend);
    }

    const themeSelect = document.getElementById('avariyatema');
    if (themeSelect && themeSelect.selectedIndex > 0) {
        setTheme(encodeURIComponent(themeSelect.value));
    }
}

/**
 * Информация о чате: [url, conversationId, sessionId].
 * sessionId берётся из кэша; вне режима «Доработать» (или при flag1 = 0)
 * дополнительно запускается фоновый запрос для обновления кэша.
 */
async function getInfo(flag1 = 1) {
    const activeConvId = getChatId() || '';
    const url = `${AF_API_ORIGIN}/tickets/assigned/${activeConvId}`;

    const cached = chatsArray.find((chat) => chat.id === activeConvId);
    if (cached) return [url, activeConvId, cached.sessionId];

    if (document.getElementById('msg1').innerHTML !== 'Доработать' || flag1 === 0) {
        doOperationsWithConversations(activeConvId)
            .then((result) => {
                chatsArray.push(result);
                localStorage.setItem('serviceIdGlob', result.serviceId);
            })
            .catch((error) => console.error('Ошибка при получении данных:', error));
    }

    return [url, activeConvId, ''];
}

function setTheme(valueId) {
    const chatId = getChatId();
    if (!chatId) return;

    afApiFetch(`${AF_API_ORIGIN}/api/conversation/${chatId}/payload`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            conversationId: chatId,
            elements: [{ name: 'topicId', value: String(valueId) }]
        })
    }).catch(() => {});
}

/** Пустая ли ячейка таблицы шаблонов. */
function isEmptyCell(value) {
    return value == null || value === '' || value === ' ';
}

/** Тематика (сразу) и теги (через 1 с) для строки шаблонов. */
function applyRowThemeAndTags(row) {
    if (isEmptyCell(row[8])) console.log('Не значения тематики');
    else setTheme(row[8]);

    setTimeout(() => {
        if (isEmptyCell(row[9])) console.log('Нет значения тегов');
        else newTags(row[9]);
    }, 1000);
}

/** Шаблоны, тематики и теги из таблицы по имени кнопки. */
function msgFromTable(btnName) {
    for (let l = 0; l < table.length; l++) {
        if (btnName !== table[l][0]) continue;

        const row = table[l];
        applyRowThemeAndTags(row);

        if (document.getElementById('languageAF').innerHTML === 'Русский') {
            if (row[1] === 'Быстрый шаблон') {
                sendAnswerTemplate2(row[2]);
            } else if (row[1] === 'Текст') {
                sendAnswer(transfPageButtons(row[2]));
            } else if (row[1] === 'Шаблон') {
                sendAnswerTemplate(row[2], row[3]);
            } else if (row[1].indexOf('Рандом') !== -1) {
                // Формат типа: "РандомN" — N вариантов в колонках 2..2+N
                const variantsCount = Number(row[1][7]);
                const variantIndex = Math.floor(Math.random() * variantsCount);
                const [kind, value] = row[2 + variantIndex].split('$');

                if (kind === 'Текст') sendAnswer(transfPageButtons(value));
                else if (kind === 'Шаблон') sendAnswerTemplate(value, value);
                else setInputMessage('Шаблон  указан не верно, повторите попытку еще раз!');
            }
            break;
        }

        if (row[1].indexOf('Рандом') !== -1) {
            // Формат типа: "РандомN/M" — сначала N русских, затем M английских
            const ruCount = parseInt(row[1][7], 10);
            const enCount = row[1][9];

            if (!(enCount > 0)) {
                setInputMessage('Нет английского варианта шаблонов');
            } else if (ruCount + parseInt(enCount, 10) > 6) {
                setInputMessage('Шаблон  указан не верно, повторите попытку еще раз!');
            } else {
                const variantIndex = Math.floor(Math.random() * enCount);
                const [kind, value] = row[2 + ruCount + variantIndex].split('$');

                if (kind === 'Текст') sendAnswer(transfPageButtons(value));
                else if (kind === 'Шаблон') sendAnswerTemplate(value, value);
                else setInputMessage('Шаблон  указан не верно, повторите попытку еще раз!');
            }
        } else if (row[4] === '') {
            setInputMessage('Нет английского варианта шаблона');
        } else {
            if (row[5] === 'Быстрый шаблон') {
                sendAnswerTemplate2(row[6]);
            } else if (row[5] === 'Текст') {
                sendAnswer(transfPageButtons(row[6]));
            } else if (row[5] === 'Шаблон') {
                sendAnswerTemplate(row[6], row[7]);
            }
            break;
        }
    }
}

// ============================================================
// Загрузка шаблонов из AutoFAQ API
// ============================================================
const AUTOFAQ_SERVICE_IDS = {
    tp: [121286, 119638, 121385, 119843, 118980, 121692, 121386, 119636, 119649,
         121381, 119841, 120181, 119646, 121384, 121387, 119844, 119025],
    tpPrem: [121533, 121775, 121527, 121531, 121831]
};

/**
 * Чистит HTML ответа AutoFAQ, сохраняя ссылки <a>.
 * Цепочка преобразований — как в оригинале.
 */
function stripAutoFaqHtml(html) {
    const P_TAG = '<p class="TextEditor_Paragraph__68XKv">';

    let text = html
        .split('<br>').join('\n')
        .split('<br>↵').join('\n')
        .split('&nbsp;').join(' ')
        .split('<br />').join('\n');

    if (text.startsWith(P_TAG)) {
        text = text.replace(P_TAG, '');
    }
    text = text.split(P_TAG).join('\n').split('</p>').join('');

    return text
        .split('<a').join('TMPaTMP')
        .split('</a').join('TMPENDaTMEPEND')
        .replace(/<\/?[^>]+>/g, '')
        .split('TMPaTMP').join('<a')
        .split('TMPENDaTMEPEND').join('</a');
}

/** Укороченная цепочка очистки (для быстрых шаблонов). */
function stripAutoFaqHtmlLight(html) {
    return html
        .split('<br>↵').join('\n')
        .split('&nbsp;').join(' ')
        .split('<br />').join('\n')
        .split('<a').join('TMPaTMP')
        .split('</a').join('TMPENDaTMEPEND')
        .replace(/<\/?[^>]+>/g, '')
        .split('TMPaTMP').join('<a')
        .split('TMPENDaTMEPEND').join('</a');
}

async function loadTemplates(template, word) {
    const tpflag = localStorage.getItem('tpflag');
    const serviceIds =
        tpflag === 'ТП' ? AUTOFAQ_SERVICE_IDS.tp :
        tpflag === 'ТПPrem' ? AUTOFAQ_SERVICE_IDS.tpPrem : null;

    if (!serviceIds) return;

    const result = await afApiFetch(AUTOFAQ_TOP_BATCH_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: word, answersLimit: 10, autoFaqServiceIds: serviceIds })
    }).then((response) => response.json());

    const match = result.find((item) => item.title === template);
    if (!match) return;

    const entry = [
        template,
        match.documentId,
        match.serviceId,
        match.queryId,
        match.sessionId,
        stripAutoFaqHtml(match.text),
        match.title,
        match.accuracy
    ];
    templatesAF.push(entry);

    return entry;
}

// ============================================================
// Отправка ответов (multipart/form-data c JSON-payload)
// ============================================================

/** Текст → HTML-абзацы (<p>…</p>), пустые строки → <p><br></p>. */
function toParagraphHtml(text) {
    return text
        .split('\n')
        .map((el) => `<p>${el}</p>`)
        .join('\n')
        .split('<p></p>')
        .join('<p><br></p>');
}

/** POST в /answers с payload через нативный FormData (boundary генерирует браузер). */
function sendAnswersRequest(payloadObj) {
    const formData = new FormData();
    formData.append('payload', JSON.stringify(payloadObj));

    return afApiFetch(ANSWERS_URL, {
        method: 'POST',
        body: formData
    });
}

/** Быстрый шаблон: короткий текст ищется в AutoFAQ, иначе отправляется как есть. */
async function sendAnswerTemplate2(word, flag = 0) {
    let tmpTxt = '';

    if (word.length < 50) {
        try {
            const result = await afApiFetch(AUTOFAQ_TOP_BATCH_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ query: word, answersLimit: 25, autoFaqServiceIds: [121384] })
            }).then((response) => response.json());

            const match = result.find((k) => k.title === word);
            if (match) tmpTxt = stripAutoFaqHtmlLight(match.text);
        } catch (e) {
            // Как в оригинале: ошибка поиска не ломает отправку
        }
    }

    if (!tmpTxt) tmpTxt = word;

    if (document.getElementById('msg1').innerHTML === 'Доработать' && flag === 0) {
        document.getElementById('inp').value = tmpTxt;
        template_flag = 1;
        template_flag2 = 1;
        return;
    }

    const values = await getInfo(0);
    await sendAnswersRequest({
        sessionId: values[2],
        conversationId: values[1],
        text: toParagraphHtml(tmpTxt),
        suggestedAnswerDocId: 0
    });

    resetFlags();
    flagggg = 0;
}

/** Шаблон AutoFAQ с метаданными (documentId, accuracy и т.д.). */
async function sendAnswerTemplate(template, word, flag = 0, newText = '', flag2 = 0) {
    if (flag === 1) {
        template = template_text;
        word = word_text;
    }

    let curTemplate = templatesAF.find((entry) => entry[0] === template);
    if (!curTemplate) curTemplate = await loadTemplates(template, word);
    if (!curTemplate) return;

    const textAfterSubstitution = transfPageButtons(curTemplate[5]);

    if (document.getElementById('msg1').innerHTML === 'Доработать' && flag2 === 0) {
        document.getElementById('inp').value = String(textAfterSubstitution ?? '')
            .replace(/\\n/g, '\n');
        template_text = template;
        word_text = word;
        template_flag = 1;
        return;
    }

    if (!textAfterSubstitution) {
        console.log('Шаблон не найден');
        return;
    }

    let textToSend = textAfterSubstitution;
    if (flag === 1) textToSend = newText;

    const values = await getInfo(0);

    await sendAnswersRequest({
        sessionId: values[2],
        conversationId: values[1],
        text: toParagraphHtml(textToSend),
        ext: null,
        files: [],
        suggestedAnswerDocId: curTemplate[1],
        autoFaqServiceId: curTemplate[2],
        autoFaqSessionId: String(curTemplate[4]),
        autoFaqQueryId: String(curTemplate[3]),
        autoFaqTitle: curTemplate[6],
        autoFaqQuery: word,
        autoFaqAccuracy: curTemplate[7]
    });

    resetFlags();
}

/** Обычный текстовый ответ в чат. */
async function sendAnswer(txt, flag = 1) {
    const values = await getInfo(flag);
    const adr1 = values[1];
    const uid = values[2];

    if (document.getElementById('msg1').innerHTML === 'Доработать' && flag) {
        resetFlags();
        document.getElementById('inp').value = txt;
        return;
    }

    await sendAnswersRequest({
        sessionId: uid,
        conversationId: adr1,
        text: toParagraphHtml(txt)
    });

    resetFlags();
}

// ============================================================
// Мост событий из iframe (быстрые теги)
// ============================================================
window.addEventListener('callNewTaggg', (event) => newTaggg(event.detail.tagName));
window.addEventListener('CallNewComment', (event) => sendComment(event.detail.comment));

setInterval(startTimer, 500);
