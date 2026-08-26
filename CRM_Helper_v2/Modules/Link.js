// ==========================================
// LINKS — панель ссылок (новый UI, перенос из CHMAF Link_Hybrid)
// Кастомные кнопки пользователя + быстрый поиск
// ==========================================

// ==========================================
// 1. CONFIG MANAGER (кастомные кнопки)
// ==========================================
class LinksConfigCRM {
    constructor() {
        this.storageKey = 'CRM_LinksCustom';
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && Array.isArray(parsed.customButtons)) return parsed;
            }
        } catch (e) { /* битый JSON — откатываемся на дефолт */ }
        return this.getDefaultConfig();
    }

    saveConfig() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    }

    getDefaultConfig() {
        return { version: '1.0', customButtons: [] };
    }

    addCustomButton(button) {
        button.id = `custom-${Date.now()}`;
        this.config.customButtons.push(button);
        this.saveConfig();
        return button.id;
    }

    updateCustomButton(id, updates) {
        const btn = this.config.customButtons.find(b => b.id === id);
        if (btn) {
            Object.assign(btn, updates);
            this.saveConfig();
            return true;
        }
        return false;
    }

    deleteCustomButton(id) {
        const index = this.config.customButtons.findIndex(b => b.id === id);
        if (index !== -1) {
            this.config.customButtons.splice(index, 1);
            this.saveConfig();
            return true;
        }
        return false;
    }

    getCustomButtons() {
        return this.config.customButtons;
    }
}

const linksCfg = new LinksConfigCRM();

// ==========================================
// 2. СПРАВОЧНИК КНОПОК-ССЫЛОК (ТП)
// ==========================================

const TP_LINK_BUTTONS = [
    { id: 'deleteaclnk', icon: '🗑', label: 'ПД', title: 'Заявка на удаление персональных данных', url: 'https://infra.skyeng.ru/request/create/166' },
    { id: 'knoweledgebase', icon: '📚', label: 'БЗ', title: 'База знаний в Confluence', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=25407293' },
    { id: 'essayadmin', icon: '📝', label: 'Эссе', title: 'Админка эссе для перезакрепления за П', url: 'https://api-english.skyeng.ru/admin/platform/openanswer/list' },
    { id: 'resetMMPassword', icon: '🔐', label: 'MM пароль', title: 'Infra: сброс пароля Mattermost Teacher', url: 'https://infra.skyeng.ru/request/create/233' },
    { id: 'confbugs', icon: '🐞', label: 'Баги', title: 'Известные баги на платформе', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=96042583' },
    { id: 'GrListData', icon: '👥', label: 'Список гр.', title: 'Список группы', url: null }, // обработчик — getGrListDataButtonPress из GrList.js
    { id: 'minecraftAccs', icon: '⛏️', label: 'Minecraft', title: 'УЗ Minecraft', url: 'https://disk.yandex.ru/edit/d/ARTwOEreBvxL1L4cDRCvEyPegnqahzm72s0qoIz-cKg6al9hdmhpLVFTZw' },
    { id: 'timetable', icon: '📅', label: 'TimeTable', title: 'Timetable', url: 'https://timetable.skyeng.ru/' },
    { id: 'talksadm', icon: '💋', label: 'Talks', title: 'Talks Admin — поиск по ID П / ID У урока', url: 'https://vimbox.skyeng.ru/talks/admin/statistics' },
    { id: 'compensNotFairPayments', icon: '🚫', label: 'Честн.Оплат', title: 'Форма: нет честных оплат', url: 'https://forms.yandex.ru/cloud/6876066349363940156734b8/?page=1' },
    { id: 'compens', icon: '💸', label: 'Компенсац.', title: 'Создание операции компенсации ученику', url: 'https://billing-marketing.skyeng.ru/accrual-operations/create' },
    { id: 'CMS', icon: '🌀', label: 'CMS', title: 'CMS хранилище материалов уроков', url: 'https://cms-vimbox.skyeng.ru/vim' },
    { id: 'kidscms', icon: '🌀', label: 'Kids CMS', title: 'CMS детских предметов', url: 'https://vimbox.skyeng.ru/kids/math/cms/lessons/1' },
    { id: 'useradm', icon: '🛠️', label: 'Админка', title: 'Админка пользователей', url: 'https://id.skyeng.ru/admin/users' },
    { id: 'transactions', icon: '💰', label: 'Поиск $', title: 'Поиск платежа по карте, сумме, дате', url: 'https://accounting.skyeng.ru/userpayment/search/transaction' },
    { id: 'billingadm', icon: '🧮', label: 'Начислятор', title: 'Начислятор билинга: реальный баланс и зависшие уроки', url: 'https://billing-api.skyeng.ru/operations' },
    { id: 'subscribebilling', icon: '💰', label: '$Подписки', title: 'Биллинг подписок: просмотр и редактирование', url: 'https://billing-api.skyeng.ru/subscriptions' },
    { id: 'userfeatures', icon: '🏡', label: 'Фичи', title: 'Проверка фичей (кругов) пользователя', url: 'https://vimbox.skyeng.ru/circles/editor' },
    { id: 'testroom', icon: 'ℹ️', label: 'TestRooms', title: 'Инструкция по созданию тестовых комнат', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638' },
    { id: 'apelation', icon: '💫', label: 'Апелляции', title: 'Форма апелляций аудита', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdgsb6pte1H1dz15Eb5NjDe0gj3kEnh0hTe6Cgy8d81mT7NUA/viewform' },
    { id: 'browserstack', icon: '🌐', label: 'B-Stack', title: 'BrowserStack', url: 'https://www.browserstack.com/users/sign_in' },
    { id: 'certificates', icon: '📜', label: 'Сертиф.', title: 'Проверка сертификатов', url: 'https://billing-marketing.skyeng.ru/certificate/certSearch' },
    { id: 'promocodes', icon: '*️⃣', label: 'Промо', title: 'Проверка промокодов', url: 'https://billing-marketing.skyeng.ru/promocode/list' },
    { id: 'helpocentrstud', icon: '📔', label: 'БЗ У', title: 'Help Center для учеников', url: 'https://helpcenter.skyeng.ru/students' },
    { id: 'helpocentrteach', icon: '📗', label: 'БЗ П', title: 'Help Center для преподавателей', url: 'https://helpcenter.skyeng.ru/teachers' },
    { id: 'trshoothing', icon: '🔨', label: 'ТраблШут', title: 'Траблшутер: ошибки и логи комнаты', url: 'https://video-trouble-shooter.skyeng.ru/' },
    { id: 'Synchronizer', icon: '♻️', label: 'Синхрон', title: 'Синхронизация ДЗ (upsert-history)', url: 'https://learning.skyeng.ru/upsert-history' },
    { id: 'AddRemoveChat', icon: '➕➖', label: 'Чат', title: 'Добавить/удалить чат', url: 'https://communications.skyeng.ru/gateway/support/chat-management' },
    { id: 'CheckPrices', icon: '🤑', label: 'Prices', title: 'Check Price — наборы цен', url: 'https://billing-marketing.skyeng.ru/priceSet/list' },
    { id: 'CheckVidConnection', icon: '📹', label: 'Video', title: 'Проверка видеосервера', url: 'https://video-check.skyeng.ru/' },
    { id: 'goProcash', icon: '💳', label: 'BIN', title: 'Check BIN банка', url: 'https://procash.app/tools/bin-lookup' },
    { id: 'suggestions', icon: '✉️', label: 'Предложения', title: 'Форма передачи предложений от пользователей', url: 'https://docs.google.com/forms/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/viewform' },
    { id: 'faqext', icon: '❓', label: 'Инструкции', title: 'Инструкция ChMAF', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971' },
    { id: 'rkKidsTP', icon: '🧒', label: 'РК Kids', title: 'Админка Kids РК (встречи клубов)', url: 'https://group.skyeng.ru/admin/?crudAction=index&crudControllerFqcn=App%5CController%5CAdmin%5CClubKidMeetingCrudController&entityFqcn=App%5CEntity%5CClubMeeting' },
    { id: 'rkAdultsTP', icon: '👥', label: 'РК Adults', title: 'Админка Adults РК (расписание клубов)', url: 'https://skyeng.ru/clubs/admin/schedule' },
    { id: 'flexAdminTP', icon: '🎓', label: 'Flex', title: 'Админка Flex (публичные семинары)', url: 'https://public-seminars-admin.skyeng.ru/english?dateFrom=1787605200&dateTo=1787691599' },
    { id: 'grafanalnk', icon: '📊', label: 'Grafana', title: 'Grafana: состояние видеосерверов', url: 'https://grafana.skyeng.link/d/NZkMHsVMk/video-servers-health-check?orgId=1&refresh=1m' },
    { id: 'kpiteachersdashboard', icon: '📈', label: 'KPI Teachers', title: 'Datalens: KPI teachers', url: 'https://datalens.yandex.ru/lupggqkv0uewa-kpi-p-dlya-tp?tab=GrW&state=684e0be1371' }
];

// Поля быстрого поиска: [кнопка, поле, placeholder, иконка кнопки, подсказка]
const LK_INPUT_GROUPS = [
    { btn: 'benchmark', input: 'cpuname', ph: 'CPU name', icon: '🔎', title: 'Название процессора → поиск рейтинга на cpubenchmark' },
    { btn: 'credits', input: 'creditstatus', ph: 'ID У рассрочка', icon: '🔎', title: 'ID У → прямая ссылка на рассрочки ученика' },
    { btn: 'gotolookip', input: 'iplookup', ph: 'IP У/П/Vimbox', icon: '🔎', title: 'IP У/П/Платформы → гео и хостинг' },
    { btn: 'getlgsinfo', input: 'lgssearch', ph: 'ID Группы LGS/KGL', icon: '🔎', title: 'ID группы → админка LGS' },
    { btn: 'cmsid', input: 'cmsstepid', ph: 'CMS stepUUID', icon: '🔎', title: 'stepUUID → нужный шаг в CMS' },
    { btn: 'getschemes', input: 'schemesteacher', ph: 'ID П схемы', icon: '🔎', title: 'ID П → схемы вознаграждения П' },
    { btn: 'getpushes', input: 'pushes', ph: 'ID У пуши', icon: '🔎', title: 'ID У → отправлялись ли пуши' },
    { btn: 'getmobpasscode', input: 'setidformobpass', ph: 'ID У/П МП', icon: '🚀', title: 'ID У/П → разовый пароль для МП появится в поле ввода' },
    { btn: 'gettrshinfo', input: 'trshooterhash', ph: 'Hash комнаты', icon: '🚀', title: 'Хеш комнаты → инфо в траблшутере' },
    { btn: 'getenablerAP', input: 'enablerAP', ph: 'ID услуги (АП)', icon: '💾', title: 'Копирует ссылку для активации АП в ЛКУ' },
    { btn: 'getskipAP', input: 'skipAP', ph: 'ID ус (skip АП)', icon: '💾', title: 'Копирует ссылку для пропуска АП в ЛКУ' },
    { btn: 'doskiponboard', input: 'skiponboarding', ph: 'ID ус (skip Onbo)', icon: '💾', title: 'Копирует ссылку отключения онбоардинга в ЛКУ' }
];

// Кнопки «скопировать ссылку»: [кнопка, поле, шаблон ссылки, сообщение]
const LK_COPY_ACTIONS = [
    { btn: 'getenablerAP', input: 'enablerAP', build: v => `https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${v}`, msg: '💾 Ссылка АП скопирована' },
    { btn: 'getskipAP', input: 'skipAP', build: v => `https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${v}&skipAutoSelection=1`, msg: '💾 Ссылка Skip AP скопирована' },
    { btn: 'doskiponboard', input: 'skiponboarding', build: v => `https://learning.skyeng.ru/api/v1/education-service/${v}/skip-onboarding`, msg: '💾 Ссылка Skip Onbo скопирована' }
];

// Поля, открывающие ссылку: [кнопка, поле, url, suffix, текст ошибки]
const LK_INPUT_ACTIONS = [
    { btn: 'benchmark', input: 'cpuname', url: 'https://www.cpubenchmark.net/cpu_lookup.php?cpu=', error: 'Введите CPU в поле' },
    { btn: 'getschemes', input: 'schemesteacher', url: 'https://teacher-incentive.skyeng.ru/incentive/teacher/', error: 'Введите ID П в поле' },
    { btn: 'gotolookip', input: 'iplookup', url: 'https://check-host.net/ip-info?host=', error: 'Введите IP в поле' },
    { btn: 'cmsid', input: 'cmsstepid', url: 'https://content.vimbox.skyeng.ru/cms/step-store/update/id/', error: 'Введите STEPUUID в поле' },
    { btn: 'credits', input: 'creditstatus', url: 'https://billing-api.skyeng.ru/installments?perPage=10&ownerId=', error: 'Введите ID У в поле' },
    { btn: 'getlgsinfo', input: 'lgssearch', url: 'https://learning-groups-storage.skyeng.ru/group/', error: 'Введите ID группы в поле', suffix: '?cp=(section:participants)' },
    { btn: 'getpushes', input: 'pushes', url: 'https://push-notifications.skyeng.ru/cms/logs?page=1&paginateBy=100&userId=', error: 'Введите ID У в поле' },
    { btn: 'gettrshinfo', input: 'trshooterhash', url: 'https://video-trouble-shooter.skyeng.ru/?hash=', error: 'Введите hash комнаты в поле' }
];

// ==========================================
// 3. HTML ШАБЛОН
// ==========================================

/** Экранирование пользовательских строк при вставке в разметку. */
function lkEsc(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function lkRenderLinkButtons(buttons) {
    return `<div class="lk-grid">
                ${buttons.map(b =>
                    `<button class="lk-btn" id="${lkEsc(b.id)}" title="${lkEsc(b.title)}">${b.icon} ${lkEsc(b.label)}</button>`
                ).join('\n')}
                ${linksCfg.getCustomButtons().map(b =>
                    `<button class="lk-btn custom-btn" data-custom-id="${lkEsc(b.id)}" title="${lkEsc(b.title)} (ПКМ — редактировать)">${lkEsc(b.icon)} ${lkEsc(b.title)}</button>`
                ).join('\n')}
            </div>`;
}

function lkRenderFields() {
    return `<div class="lk-fields">
                ${LK_INPUT_GROUPS.map(g =>
                    `<div class="lk-field">
                        <input class="inputCRM" id="${g.input}" placeholder="${g.ph}" title="${g.title}" autocomplete="off" type="text">
                        <button class="btnCRM btnCRMsmall" id="${g.btn}" title="${g.title}">${g.icon}</button>
                    </div>`
                ).join('\n')}
            </div>`;
}

function getLinksHTML() {
    return `
    <div class="lk-head">
        <span class="lk-title">🔗 CRM Helper — Ссылки</span>
        <button title="Скрытие меню" id="hideMe" class="lk-close">❌</button>
    </div>

    <div class="lk-sub">Ссылки</div>
    ${lkRenderLinkButtons(TP_LINK_BUTTONS)}

    <div class="lk-sub">🔍 Быстрый поиск</div>
    ${lkRenderFields()}

    <div class="lk-footer">
        <button class="lk-btn custom-btn" id="add-custom-btn" title="Добавить свою кнопку со ссылкой">➕ Кнопка</button>
        <button class="btnCRM" id="restartlesson" title="Копирует команду setStatus('classwork') для перезапуска уроков" style="min-height:26px;">Classwork 💾</button>
        <span class="lk-footer-right">
            <button class="btnCRM lk-mini" id="curVeriOSCRM" title="Актуальная версия iOS приложения (клик — магазин)">iOS: ⏳</button>
            <button class="btnCRM lk-mini" id="curVerAndroidCRM" title="Актуальная версия Android приложения (клик — магазин)">Android: ⏳</button>
        </span>
    </div>`;
}

// ==========================================
// 4. МОДАЛКА ДОБАВЛЕНИЯ / РЕДАКТИРОВАНИЯ КНОПКИ
// ==========================================
function showLinkButtonModal(existingButton = null) {
    const isEdit = !!existingButton;

    const overlay = document.createElement('div');
    overlay.className = 'lkovl';
    overlay.innerHTML = `
    <div class="lkmodal">
        <div class="lkmodal-header">
            <span>${isEdit ? '✏️ Редактировать кнопку' : '➕ Новая кнопка'}</span>
            <button class="lkmodal-x" title="Закрыть">❌</button>
        </div>
        <div class="lkmodal-body">
            <label class="lkmodal-label">Название</label>
            <input type="text" class="lkmodal-input" id="lk-btn-title" value="${isEdit ? lkEsc(existingButton.title) : ''}" placeholder="Моя ссылка">
            <label class="lkmodal-label">Иконка (эмодзи)</label>
            <input type="text" class="lkmodal-input" id="lk-btn-icon" value="${isEdit ? lkEsc(existingButton.icon) : ''}" placeholder="🔗" maxlength="4">
            <label class="lkmodal-label">URL</label>
            <input type="text" class="lkmodal-input" id="lk-btn-url" value="${isEdit ? lkEsc(existingButton.url) : ''}" placeholder="https://example.com">
            <div class="lkmodal-hint">Кнопка появится в панели ссылок. Левый клик — открыть, правый клик — редактировать.</div>
        </div>
        <div class="lkmodal-footer">
            ${isEdit ? '<button class="lkmodal-btn lkmb-danger" id="lk-btn-delete">🗑️ Удалить</button>' : ''}
            <button class="lkmodal-btn lkmb-secondary" id="lk-btn-cancel">Отмена</button>
            <button class="lkmodal-btn lkmb-primary" id="lk-btn-save">💾 Сохранить</button>
        </div>
    </div>`;

    document.body.appendChild(overlay);
    const close = () => overlay.remove();

    overlay.querySelector('.lkmodal-x').onclick = close;
    overlay.querySelector('#lk-btn-cancel').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };

    overlay.querySelector('#lk-btn-save').onclick = () => {
        const title = overlay.querySelector('#lk-btn-title').value.trim();
        const icon = overlay.querySelector('#lk-btn-icon').value.trim() || '🔗';
        const url = overlay.querySelector('#lk-btn-url').value.trim();

        if (!title || !url) {
            alert('Заполните название и URL');
            return;
        }

        if (isEdit) linksCfg.updateCustomButton(existingButton.id, { title, icon, url });
        else linksCfg.addCustomButton({ title, icon, url });

        close();
        renderLinksPanel();
    };

    if (isEdit) {
        overlay.querySelector('#lk-btn-delete').onclick = () => {
            if (confirm(`Удалить кнопку "${existingButton.title}"?`)) {
                linksCfg.deleteCustomButton(existingButton.id);
                close();
                renderLinksPanel();
            }
        };
    }
}

// ==========================================
// 5. ОБРАБОТЧИКИ
// ==========================================

function bindSimpleLinks(linksMap) {
    Object.entries(linksMap).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (el && url) el.onclick = () => window.open(url, '_blank');
    });
}

function initLinksHandlers() {
    // --- Кнопки-ссылки ---
    bindSimpleLinks(Object.fromEntries(TP_LINK_BUTTONS.map(b => [b.id, b.url])));

    // Список группы — функция из GrList.js
    const grListBtn = document.getElementById('GrListData');
    if (grListBtn) {
        if (typeof getGrListDataButtonPress === 'function') grListBtn.onclick = getGrListDataButtonPress;
        else grListBtn.style.display = 'none';
    }

    // --- Кастомные кнопки: клик — открыть, ПКМ — редактировать ---
    document.querySelectorAll('#AF_Links .custom-btn[data-custom-id]').forEach(btnEl => {
        const id = btnEl.dataset.customId;
        const button = linksCfg.getCustomButtons().find(b => b.id === id);
        if (!button) return;

        btnEl.onclick = () => { if (button.url) window.open(button.url, '_blank'); };
        btnEl.oncontextmenu = e => {
            e.preventDefault();
            showLinkButtonModal(button);
        };
    });

    // --- Добавление кастомной кнопки ---
    const addBtn = document.getElementById('add-custom-btn');
    if (addBtn) addBtn.onclick = () => showLinkButtonModal(null);

    // --- Быстрый поиск (открытие ссылки по значению поля) ---
    LK_INPUT_ACTIONS.forEach(({ btn, input, url, error, suffix }) => {
        const buttonEl = document.getElementById(btn);
        const inputEl = document.getElementById(input);
        if (!buttonEl || !inputEl) return;

        const action = () => {
            const val = inputEl.value.trim();
            if (!val) {
                alert(error);
                return;
            }
            window.open(suffix ? `${url}${val}${suffix}` : `${url}${val}`, '_blank');
            inputEl.value = '';
        };
        buttonEl.onclick = action;
        inputEl.onkeypress = e => { if (e.key === 'Enter') action(); };
    });

    // --- Кнопки, копирующие готовую ссылку в буфер (АП / skip AP / skip onboarding) ---
    LK_COPY_ACTIONS.forEach(({ btn, input, build, msg }) => {
        const buttonEl = document.getElementById(btn);
        const inputEl = document.getElementById(input);
        if (!buttonEl || !inputEl) return;

        const originalIcon = buttonEl.textContent;
        const action = () => {
            const val = inputEl.value.trim();
            if (!val) {
                alert('Введите ID услуги в поле');
                return;
            }
            copyToClipboard(build(val));
            if (typeof createAndShowButton === 'function') createAndShowButton(msg);
            buttonEl.textContent = '✅';
            setTimeout(() => { buttonEl.textContent = originalIcon; }, 2000);
            inputEl.value = '';
        };
        buttonEl.onclick = action;
        inputEl.onkeypress = e => { if (e.key === 'Enter') action(); };
    });

    // --- Разовый пароль для МП (через bg.js, обход CORS) ---
    const mobPassBtn = document.getElementById('getmobpasscode');
    const mobPassInput = document.getElementById('setidformobpass');
    if (mobPassBtn && mobPassInput) {
        mobPassBtn.onclick = function () {
            const cleanedId = mobPassInput.value.replace(/\D/g, '').trim();
            if (!cleanedId) {
                alert('Введите ID У/П в поле');
                return;
            }

            mobPassBtn.textContent = '✅';
            setTimeout(() => mobPassBtn.textContent = '🚀', 2000);

            const url = 'https://id.skyeng.ru/admin/auth/one-time-password';
            const requestOptions = {
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body: `user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D=${cleanedId}&user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null`,
                method: 'POST',
                mode: 'cors',
                credentials: 'include'
            };

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url, requestOptions }, function (response) {
                if (!response || !response.success) {
                    console.error('Ответ от background script пуст или не определен', response?.error);
                    return;
                }
                const otp = response.fetchansver.match(/div class="alert alert-success" role="alert".*?([0-9]{5}).*/);
                if (otp && otp.length > 1) {
                    mobPassInput.value = otp[1];
                    setTimeout(() => mobPassInput.value = '', 15000); // пароль живёт в поле 15 секунд
                } else {
                    console.error('OTP не найден в ответе');
                }
            });
        };
        mobPassInput.onkeypress = e => { if (e.key === 'Enter') mobPassBtn.click(); };
    }

    // --- Classwork: копирование команды перезапуска урока ---
    const restartBtn = document.getElementById('restartlesson');
    if (restartBtn) {
        restartBtn.onclick = function () {
            copyToClipboard("setStatus('classwork')");
            restartBtn.textContent = 'Copied!';
            setTimeout(() => restartBtn.textContent = 'Classwork 💾', 2000);
        };
    }

    // --- Кнопки версий приложения: клик — страница в магазине ---
    const iosBtn = document.getElementById('curVeriOSCRM');
    const andBtn = document.getElementById('curVerAndroidCRM');
    if (iosBtn) iosBtn.onclick = () => window.open('https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732', '_blank');
    if (andBtn) andBtn.onclick = () => window.open('https://play.google.com/store/apps/details?id=skyeng.words.prod', '_blank');

    lkApplyVersionsText();
}

// ==========================================
// 6. ВЕРСИИ МОБ. ПРИЛОЖЕНИЙ
// ==========================================
let versionscontainer;
let linksVersionsCache = null;

async function getversionsapp() {
    const versionsDocURL = 'https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec';

    let versionsdata;
    try {
        const r = await fetch(versionsDocURL);
        versionsdata = await r.json();
    } catch (err) {
        console.error('Не удалось загрузить версии приложений:', err);
        const iosEl = document.getElementById('curVeriOSCRM');
        const andEl = document.getElementById('curVerAndroidCRM');
        if (iosEl) iosEl.textContent = 'iOS: ❌';
        if (andEl) andEl.textContent = 'Android: ❌';
        return;
    }

    versionscontainer = versionsdata.result;
    if (!versionscontainer) return;

    linksVersionsCache = {
        ios: `${versionscontainer[1][0]} (${versionscontainer[1][1]})`,
        android: `${versionscontainer[0][0]} (${versionscontainer[0][1]})`
    };
    lkApplyVersionsText();
}

/** Восстанавливает текст версий после перерисовки панели. */
function lkApplyVersionsText() {
    if (!linksVersionsCache) return;
    const iosEl = document.getElementById('curVeriOSCRM');
    const andEl = document.getElementById('curVerAndroidCRM');
    if (iosEl) iosEl.textContent = linksVersionsCache.ios;
    if (andEl) andEl.textContent = linksVersionsCache.android;
}

// ==========================================
// 7. ИНИЦИАЛИЗАЦИЯ ОКНА
// ==========================================

/** Перерисовывает панель (изменение кастомных кнопок). */
function renderLinksPanel() {
    const panel = document.getElementById('AF_Links');
    if (!panel) return;

    panel.innerHTML = getLinksHTML();
    hideWindowOnClick('AF_Links', 'hideMe');
    initLinksHandlers();
}

const wintLinks = createWindowCRM('AF_Links', 'winTopLinks', 'winLeftLinks', getLinksHTML());
hideWindowOnDoubleClick('AF_Links');
hideWindowOnClick('AF_Links', 'hideMe');
initLinksHandlers();

document.getElementById('butdiagtoolsCRM').onclick = function () { // открывает окно ссылок
    const panel = document.getElementById('AF_Links');
    const menu = document.getElementById('idmymenucrm');

    if (panel.style.display == '') {
        panel.style.display = 'none';
        if (menu) menu.style.display = 'none';
    } else {
        panel.style.display = '';
        if (menu) menu.style.display = 'none';

        getversionsapp();
    }
};
