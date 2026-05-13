// ==========================================
// HYBRID LINKS - Компактный UI + Управление кнопками
// ==========================================

console.log('[Link_Hybrid] ===== ФАЙЛ НАЧАЛ ЗАГРУЖАТЬСЯ =====');

// ==========================================
// 1. CONFIG MANAGER
// ==========================================
class LinksConfigHybrid {
    constructor() {
        this.storageKey = 'AF_LinksHybrid';
        this.config = this.loadConfig();
    }

    loadConfig() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                return this.getDefaultConfig();
            }
        }
        return this.getDefaultConfig();
    }

    saveConfig() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    }

    getDefaultConfig() {
        const isTP = this.checkIsTP();
        return {
            version: "1.0",
            customButtons: [],
            isTP: isTP
        };
    }

    checkIsTP() {
        try {
            const data = JSON.parse(localStorage.getItem('AF_storage_data') || '{}');
            if (typeof scriptAdr !== 'undefined') {
                return ![data.KC_addr, data.KC_addrRzrv].includes(scriptAdr);
            }
        } catch (e) {}
        return true;
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

console.log('[Link_Hybrid] LinksConfigHybrid класс определен');

// ==========================================
// 2. HTML TEMPLATES (Компактные из оригинала)
// ==========================================
const getLinksHTML = (isTP, customButtons) => {
    console.log('[Link_Hybrid] getLinksHTML вызвана, isTP:', isTP);

    if (!isTP) {
        // KC версия
        console.log('[Link_Hybrid] Генерируем KC версию');
        return `
<div class="sky-panel" id="main_links_panel_kc">
    <div class="chmaf-drag-handle" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 8px 12px; border-radius: 8px 8px 0 0; margin: -10px -10px 8px -10px; cursor: grab; display: flex; align-items: center; justify-content: space-between;">
        <span style="color: white; font-weight: 600; font-size: 14px;">🔗 Ссылки KC</span>
        <button title="Скрытие меню" id="hideMe" class="sky-btn" style="background: #ff4757; padding: 4px 8px; font-size: 12px;">❌</button>
    </div>
    <div class="sky-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 4px;">
        <button title="База знаний" id="knoweledgebaseKC" class="sky-btn">📚</button>
        <button title="Запись урока" id="lessonrecordKC" class="sky-btn">👩‍🏫</button>
        <button title="Skyeng Home" id="skyhomeKC" class="sky-btn">💼</button>
    </div>
    <div class="sky-grid" style="grid-template-columns: repeat(2, 1fr); gap: 4px;">
        <button class="sky-btn" id="timetableKC">📅 TimeTable</button>
        <button class="sky-btn" id="CalcKC">🧮 Калькулятор</button>
        <button class="sky-btn" id="nachislyatorKC">💸 Начислятор</button>
        <button class="sky-btn" id="rassrochKC">💳 Рассрочка</button>
        <button class="sky-btn" id="pondpisKC">💰 Подписки</button>
        <button class="sky-btn" id="omniKC">📩 Omni</button>
        <button class="sky-btn" id="RKKC">👥 РК</button>
        <button class="sky-btn" id="shablKC">📝 Шаблоны</button>
        <button class="sky-btn" id="narushKC">⚠️ Нарушение БП</button>
        <button class="sky-btn" id="grafKC">📅 График</button>
        ${customButtons.map(btn => `<button class="sky-btn custom-btn" data-custom-id="${btn.id}" title="${btn.title}">${btn.icon} ${btn.title}</button>`).join('')}
    </div>
    <div style="text-align: center; margin-top: 6px;">
        <button class="sky-btn" id="add-custom-btn" style="background: rgba(16, 185, 129, 0.3);">➕ Добавить кнопку</button>
    </div>
</div>`;
    }

    // TP версия
    console.log('[Link_Hybrid] Генерируем TP версию');
    const html = `
<div class="sky-panel" id="main_links_panel">
    <div class="chmaf-drag-handle" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 8px 12px; border-radius: 8px 8px 0 0; margin: -10px -10px 8px -10px; cursor: grab; display: flex; align-items: center; justify-content: space-between;">
        <span style="color: white; font-weight: 600; font-size: 14px;">🔗 Ссылки TP</span>
        <button title="Скрытие меню" id="hideMe" class="sky-btn" style="background: #ff4757; padding: 4px 8px; font-size: 12px;">❌</button>
    </div>
    <div class="sky-grid" style="grid-template-columns: repeat(10, 1fr); margin-bottom: 4px;">
        <button title="Удаление ПД" id="deleteaclnk" class="sky-btn">🗑</button>
        <button title="База знаний" id="knoweledgebase" class="sky-btn">📚</button>
        <button title="Админка эссе" id="essayadmin" class="sky-btn">📝</button>
        <button title="Статистика" id="getStats" class="sky-btn">📋</button>
        <button title="Сброс пароля MM" id="resetMMPassword" class="sky-btn">🔐</button>
        <button title="Список группы" id="GrListData" class="sky-btn">👩‍👩‍👧‍👦</button>
        <button title="УЗ Minecraft" id="minecraftAccs" class="sky-btn">⛏️</button>
        <button title="Информация по IP" id="openIPCheck" class="sky-btn">🌐</button>
        <button title="Известные баги" id="confbugs" class="sky-btn">🐞</button>
    </div>

    <div class="sky-grid" style="grid-template-columns: repeat(5, 1fr); gap: 4px; margin-bottom: 6px;">
        <button class="sky-btn" id="timetable" title="Timetable">📅 TimeTable</button>
        <button class="sky-btn" id="talksadm" title="Talks Admin">💋 Talks</button>
        <button class="sky-btn" id="compensNotFairPayments" title="Нет честных оплат">🚫 Честн.Оплат</button>
        <button class="sky-btn" id="compens" title="Компенсации">💸 Компенсац.</button>
        <button class="sky-btn" id="CMS" title="CMS">🌀 CMS</button>
        <button class="sky-btn" id="useradm" title="Админка пользователей">🛠️ Админка</button>
        <button class="sky-btn" id="transactions" title="Поиск транзакций">💰 Поиск $</button>
        <button class="sky-btn" id="billingadm" title="Начислятор">💸 Начислятор</button>
        <button class="sky-btn" id="userfeatures" title="User Фичи">🏡 Фичи</button>
        <button class="sky-btn" id="kidscms" title="Kids CMS">🌀 Kids CMS</button>
        <button class="sky-btn" id="testroom" title="Тестовые комнаты">ℹ️ TestRooms</button>
        <button class="sky-btn" id="subscribebilling" title="Подписки">💰 $Подписки</button>
        <button class="sky-btn" id="apelation" title="Апелляции">💫 Апелляции</button>
        <button class="sky-btn" id="browserstack" title="BrowserStack">🌐 B-Stack</button>
        <button class="sky-btn" id="certificates" title="Сертификаты">📜 Сертиф.</button>
        <button class="sky-btn" id="promocodes" title="Промокоды">*️⃣ Промо</button>
        <button class="sky-btn" id="helpocentrstud" title="Help БЗ У">📔 БЗ У</button>
        <button class="sky-btn" id="helpocentrteach" title="Help БЗ П">📗 БЗ П</button>
        <button class="sky-btn" id="trshoothing" title="Траблшутинг">🔨 ТраблШут</button>
        <button class="sky-btn" id="Synchronizer" title="Синхрон ДЗ">♻️ Синхрон</button>
        <button class="sky-btn" id="AddRemoveChat" title="Добавить/Удалить чат">➕/➖ Чат</button>
        <button class="sky-btn" id="CheckPrices" title="Check Price">🤑 Prices</button>
        <button class="sky-btn" id="CheckVidConnection" title="Видеосервер">📹 Video</button>
        <button class="sky-btn" id="openFinansoBin" title="Check BIN">💳 BIN</button>
        <button class="sky-btn" id="faqext" title="Инструкция">❓ ChMAF</button>
        ${customButtons.map(btn => `<button class="sky-btn custom-btn" data-custom-id="${btn.id}" title="${btn.title}">${btn.icon} ${btn.title}</button>`).join('')}
    </div>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px;">
        <div class="sky-input-group">
            <input class="sky-input" id="cpuname" placeholder="CPU name" title="Рейтинг CPU">
            <button class="sky-btn" id="benchmark">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="creditstatus" placeholder="ID У рассрочка">
            <button class="sky-btn" id="credits">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="iplookup" placeholder="IP адрес">
            <button class="sky-btn" id="gotolookip">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="lgssearch" placeholder="ID Группы LGS">
            <button class="sky-btn" id="getlgsinfo">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="cmsstepid" placeholder="CMS stepUUID">
            <button class="sky-btn" id="cmsid">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="schemesteacher" placeholder="ID П схемы">
            <button class="sky-btn" id="getschemes">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="pushes" placeholder="ID У пуши">
            <button class="sky-btn" id="getpushes">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="trshooterhash" placeholder="Hash комнаты">
            <button class="sky-btn" id="gettrshinfo">🚀</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="sIdSynchronize" placeholder="ID Ус синхр">
            <button class="sky-btn" id="doSynchrozine">🚀</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="enablerAP" placeholder="ID услуги АП">
            <button class="sky-btn" id="getenablerAP">💾</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="skiponboarding" placeholder="ID ус(skip Onbo)" title="Отключить онбоардинг в ЛКУ" disabled>
            <button class="sky-btn" id="doskiponboard" disabled>💾</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="skipAP" placeholder="ID ус(skipАП)" title="Пропустить АП (копирует ссылку)" disabled>
            <button class="sky-btn" id="getskipAP" disabled>💾</button>
        </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 5px;">
        <button class="sky-btn" id="restartlesson" style="background: #2ed573; color: white;">Classwork💾</button>
        <button class="sky-btn" id="openGrabber" style="background: linear-gradient(135deg, #ffa502 0%, #ff6348 100%); color: white;">📊 Grabber</button>
        <button class="sky-btn" id="add-custom-btn" style="background: rgba(16, 185, 129, 0.3);">➕ Кнопка</button>
        <div style="display: flex; gap: 4px;">
            <button class="sky-btn" id="curVeriOS" style="font-size: 10px;">iOS: ⏳</button>
            <button class="sky-btn" id="curVerAndroid" style="font-size: 10px;">Android: ⏳</button>
        </div>
    </div>
</div>`;

    console.log('[Link_Hybrid] HTML содержит compensNotFairPayments:', html.includes('compensNotFairPayments'));
    return html;
};

console.log('[Link_Hybrid] getLinksHTML функция определена');

// ==========================================
// 3. MODAL для добавления/редактирования
// ==========================================
function showCustomButtonModal(config, existingButton = null) {
    const isEdit = !!existingButton;
    const modalHTML = `
<div class="premium-modal-overlay" id="custom-btn-modal">
    <div class="premium-modal">
        <div class="premium-modal-header">
            <div class="premium-modal-title">${isEdit ? '✏️ Редактировать' : '➕ Добавить'} кнопку</div>
            <button class="premium-modal-close" id="modal-close">❌</button>
        </div>
        <div class="premium-modal-body">
            <div class="premium-form-group">
                <label class="premium-form-label">Название</label>
                <input type="text" class="premium-form-input" id="btn-title" value="${existingButton?.title || ''}" placeholder="Моя ссылка">
            </div>
            <div class="premium-form-group">
                <label class="premium-form-label">Иконка (эмодзи)</label>
                <input type="text" class="premium-form-input" id="btn-icon" value="${existingButton?.icon || ''}" placeholder="🔗" maxlength="2">
            </div>
            <div class="premium-form-group">
                <label class="premium-form-label">URL</label>
                <input type="text" class="premium-form-input" id="btn-url" value="${existingButton?.url || ''}" placeholder="https://example.com">
            </div>
        </div>
        <div class="premium-modal-footer">
            ${isEdit ? '<button class="premium-btn premium-btn-danger" id="delete-btn">🗑️ Удалить</button>' : ''}
            <button class="premium-btn premium-btn-secondary" id="cancel-btn">Отмена</button>
            <button class="premium-btn premium-btn-primary" id="save-btn">💾 Сохранить</button>
        </div>
    </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('custom-btn-modal');
    const close = () => modal.remove();

    document.getElementById('modal-close').onclick = close;
    document.getElementById('cancel-btn').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };

    document.getElementById('save-btn').onclick = () => {
        const title = document.getElementById('btn-title').value.trim();
        const icon = document.getElementById('btn-icon').value.trim();
        const url = document.getElementById('btn-url').value.trim();

        if (!title || !icon || !url) {
            alert('Заполните все поля');
            return;
        }

        if (isEdit) {
            config.updateCustomButton(existingButton.id, { title, icon, url });
        } else {
            config.addCustomButton({ title, icon, url });
        }

        close();
        reloadLinksPanel();
    };

    if (isEdit) {
        document.getElementById('delete-btn').onclick = () => {
            if (confirm(`Удалить кнопку "${existingButton.title}"?`)) {
                config.deleteCustomButton(existingButton.id);
                close();
                reloadLinksPanel();
            }
        };
    }
}

console.log('[Link_Hybrid] showCustomButtonModal функция определена');

// ==========================================
// 4. ИНИЦИАЛИЗАЦИЯ
// ==========================================
let linksConfig = null;

function reloadLinksPanel() {
    const container = document.getElementById('AF_Links');
    if (!container) return;

    const isTP = linksConfig.config.isTP;
    const customButtons = linksConfig.getCustomButtons();
    container.innerHTML = getLinksHTML(isTP, customButtons);

    initEventHandlers(isTP ? 'TP' : 'KC');
}

function initEventHandlers(section) {
    // Кнопка добавления
    const addBtn = document.getElementById('add-custom-btn');
    if (addBtn) {
        addBtn.onclick = () => showCustomButtonModal(linksConfig);
    }

    // Правый клик на кастомных кнопках
    document.querySelectorAll('.custom-btn').forEach(btn => {
        btn.oncontextmenu = (e) => {
            e.preventDefault();
            const id = btn.dataset.customId;
            const button = linksConfig.getCustomButtons().find(b => b.id === id);
            if (button) showCustomButtonModal(linksConfig, button);
        };
        btn.onclick = () => {
            const id = btn.dataset.customId;
            const button = linksConfig.getCustomButtons().find(b => b.id === id);
            if (button?.url) window.open(button.url, '_blank');
        };
    });

    if (section === 'KC') {
        const linksKC = {
            'knoweledgebaseKC': "https://confluence.skyeng.tech/display/CSW/Customer+Service+WIKI",
            'lessonrecordKC': "https://tramway.skyeng.ru/record",
            'skyhomeKC': "https://home.skyeng.ru/dashboard",
            'timetableKC': "https://timetable.skyeng.ru/",
            'CalcKC': "https://billing-api.skyeng.ru/operations",
            'nachislyatorKC': "https://billing-marketing.skyeng.ru/accrual-operations/create",
            'rassrochKC': "https://accounting.skyeng.ru/credit/list",
            'pondpisKC': "https://billing-api.skyeng.ru/subscriptions",
            'omniKC': "https://skyeng.omnidesk.ru/",
            'RKKC': "https://group.skyeng.ru/admin/?crudAction=index&crudControllerFqcn=App%5CController%5CAdmin%5CClubMemberCrudController&signature=V8w5PW8LT3GcoYMoSYzprG1lCW8F5sb5y7Bdrxh08pc",
            'shablKC': "https://docs.google.com/spreadsheets/d/14paTabjaJcRIvlpTQzdGePltiN0bsPaFjFEbn4DD3Ho/edit#gid=410124091",
            'narushKC': "https://docs.google.com/forms/d/e/1FAIpQLSeAxtdad9yc5iLo-7v4rqMj5M2wdaJKOpzy5X_eWkHqHWY9sg/viewform",
            'grafKC': "https://docs.google.com/spreadsheets/d/1SiD1yfpzIEF8ZafVXnq0Z-hyF0b45aAQ8s6BWgy-s0c/edit#gid=1933422994"
        };
        bindSimpleLinks(linksKC);
        return;
    }

    // TP ссылки
    const linksTP = {
        'knoweledgebase': "https://confluence.skyeng.tech/pages/viewpage.action?pageId=25407293",
        'essayadmin': "https://api-english.skyeng.ru/admin/platform/openanswer/list",
        'timetable': "https://timetable.skyeng.ru/",
        'talksadm': "https://vimbox.skyeng.ru/talks/admin/statistics",
        'billingadm': "https://billing-api.skyeng.ru/operations",
        'CMS': "https://cms-vimbox.skyeng.ru/vim",
        'confbugs': "https://confluence.skyeng.tech/pages/viewpage.action?pageId=96042583",
        'compens': "https://billing-marketing.skyeng.ru/accrual-operations/create",
        'useradm': "https://id.skyeng.ru/admin/users",
        'compensNotFairPayments': "https://forms.yandex.ru/cloud/6876066349363940156734b8/?page=1",
        'transactions': "https://accounting.skyeng.ru/userpayment/search/transaction",
        'subscribebilling': "https://billing-api.skyeng.ru/subscriptions",
        'apelation': "https://docs.google.com/forms/d/e/1FAIpQLSdgsb6pte1H1dz15Eb5NjDe0gj3kEnh0hTe6Cgy8d81mT7NUA/viewform",
        'browserstack': "https://www.browserstack.com/users/sign_in",
        'trshoothing': "https://video-trouble-shooter.skyeng.ru/",
        'Synchronizer': "https://learning.skyeng.ru/upsert-history",
        'testroom': "https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638",
        'certificates': "https://billing-marketing.skyeng.ru/certificate/certSearch",
        'promocodes': "https://billing-marketing.skyeng.ru/promocode/list",
        'helpocentrteach': "https://helpcenter.skyeng.ru/teachers",
        'helpocentrstud': "https://helpcenter.skyeng.ru/students",
        'kidscms': "https://vimbox.skyeng.ru/kids/math/cms/lessons/1",
        'userfeatures': "https://vimbox.skyeng.ru/circles/editor",
        'AddRemoveChat': "https://communications.skyeng.ru/gateway/support/chat-management",
        'CheckPrices': "https://billing-marketing.skyeng.ru/priceSet/list",
        'CheckVidConnection': "https://video-check.skyeng.ru/",
        'openFinansoBin': "https://finanso.ru/bin-search/",
        'minecraftAccs': "https://disk.yandex.ru/edit/d/ARTwOEreBvxL1L4cDRCvEyPegnqahzm72s0qoIz-cKg6al9hdmhpLVFTZw",
        'deleteaclnk': "https://infra.skyeng.ru/request/create/166",
        'resetMMPassword': "https://infra.skyeng.ru/request/create/233",
        'faqext': "https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971"
    };

    bindSimpleLinks(linksTP);

    // Input actions
    const inputActions = [
        { btn: 'benchmark', input: 'cpuname', url: 'https://www.cpubenchmark.net/cpu_lookup.php?cpu=', error: 'Введите CPU' },
        { btn: 'getschemes', input: 'schemesteacher', url: 'https://teacher-incentive.skyeng.ru/incentive/teacher/', error: 'Введите ID П' },
        { btn: 'gotolookip', input: 'iplookup', url: 'https://check-host.net/ip-info?host=', error: 'Введите IP' },
        { btn: 'cmsid', input: 'cmsstepid', url: 'https://content.vimbox.skyeng.ru/cms/step-store/update/id/', error: 'Введите STEPUUID' },
        { btn: 'credits', input: 'creditstatus', url: 'https://billing-api.skyeng.ru/installments?perPage=10&ownerId=', error: 'Введите ID У' },
        { btn: 'getlgsinfo', input: 'lgssearch', url: 'https://learning-groups-storage.skyeng.ru/group/', error: 'Введите ID группы', suffix: '?cp=(section:participants)' },
        { btn: 'getpushes', input: 'pushes', url: 'https://push-notifications.skyeng.ru/cms/logs?page=1&paginateBy=100&userId=', error: 'Введите ID У' },
        { btn: 'gettrshinfo', input: 'trshooterhash', url: 'https://video-trouble-shooter.skyeng.ru/?hash=', error: 'Введите hash' }
    ];

    inputActions.forEach(({ btn, input, url, error, suffix }) => {
        const buttonEl = document.getElementById(btn);
        const inputEl = document.getElementById(input);
        if (buttonEl && inputEl) {
            const action = () => {
                const val = inputEl.value.trim();
                if (!val) {
                    if (typeof showCustomAlert === 'function') showCustomAlert(error);
                    else alert(error);
                } else {
                    window.open(suffix ? `${url}${val}${suffix}` : `${url}${val}`, '_blank');
                    inputEl.value = '';
                }
            };
            buttonEl.onclick = action;
            inputEl.onkeypress = (e) => { if (e.key === 'Enter') action(); };
        }
    });

    // АП
    const btnAP = document.getElementById('getenablerAP');
    const inputAP = document.getElementById('enablerAP');
    if (btnAP && inputAP) {
        btnAP.onclick = () => {
            const val = inputAP.value.trim();
            if (val && typeof copyToClipboard === 'function') {
                copyToClipboard(`https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${val}`);
                if (typeof showCustomAlert === 'function') showCustomAlert('💾 Ссылка АП скопирована');
            }
            inputAP.value = '';
        };
        inputAP.onkeypress = (e) => { if (e.key === 'Enter') btnAP.click(); };
    }

    // Skip Onboarding
    const btnSkipOnbo = document.getElementById('doskiponboard');
    const inputSkipOnbo = document.getElementById('skiponboarding');
    if (btnSkipOnbo && inputSkipOnbo) {
        btnSkipOnbo.onclick = () => {
            const val = inputSkipOnbo.value.trim();
            if (val && typeof copyToClipboard === 'function') {
                copyToClipboard(`https://learning.skyeng.ru/api/v1/education-service/${val}/skip-onboarding`);
                if (typeof showCustomAlert === 'function') showCustomAlert('💾 Ссылка Skip Onbo скопирована');
                inputSkipOnbo.value = '';
            }
        };
    }

    // Skip AP
    const btnSkipAP = document.getElementById('getskipAP');
    const inputSkipAP = document.getElementById('skipAP');
    if (btnSkipAP && inputSkipAP) {
        btnSkipAP.onclick = () => {
            const val = inputSkipAP.value.trim();
            if (val && typeof copyToClipboard === 'function') {
                copyToClipboard(`https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${val}&skipAutoSelection=1`);
                if (typeof showCustomAlert === 'function') showCustomAlert('💾 Ссылка Skip AP скопирована');
                inputSkipAP.value = '';
            }
        };
    }

    // Synchronizer
    const btnSync = document.getElementById('doSynchrozine');
    const inputSync = document.getElementById('sIdSynchronize');
    if (btnSync && inputSync && typeof setupSynchronizer === 'function') {
        setupSynchronizer();
    }

    // Classwork
    const btnRestart = document.getElementById('restartlesson');
    if (btnRestart) {
        btnRestart.onclick = () => {
            if (typeof copyToClipboard === 'function') copyToClipboard("setStatus('classwork')");
            if (typeof showCustomAlert === 'function') showCustomAlert('💾 Команда скопирована');
        };
    }

    // IP Check
    const btnIpCheck = document.getElementById('openIPCheck');
    if (btnIpCheck) {
        btnIpCheck.onclick = () => {
            const panel = document.getElementById('AF_IpCheck');
            if (panel) panel.style.display = panel.style.display === '' ? 'none' : '';
        };
    }

    // Внешние функции
    const bindExt = (id, func) => {
        const el = document.getElementById(id);
        if (el && typeof func === 'function') el.onclick = func;
    };
    bindExt('GrListData', typeof getGrListDataButtonPress !== 'undefined' ? getGrListDataButtonPress : null);
    bindExt('getStats', typeof getStatsButtonPress !== 'undefined' ? getStatsButtonPress : null);
    bindExt('openGrabber', typeof getopenGrabberButtonPress !== 'undefined' ? getopenGrabberButtonPress : null);

    // Версии
    const btnIos = document.getElementById('curVeriOS');
    const btnAnd = document.getElementById('curVerAndroid');
    if (btnIos) btnIos.onclick = () => window.open("https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732", "_blank");
    if (btnAnd) btnAnd.onclick = () => window.open("https://play.google.com/store/apps/details?id=skyeng.words.prod", "_blank");

    getVersionsApp();
}

async function getVersionsApp() {
    const iosEl = document.getElementById('curVeriOS');
    const andEl = document.getElementById('curVerAndroid');
    try {
        const res = await fetch('https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec');
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        const result = data.result;
        if (iosEl) {
            const iosVer = result[1][0];
            const iosBuild = result[1][1];
            iosEl.textContent = `${iosVer} (${iosBuild})`;
        }
        if (andEl) {
            const andVer = result[0][0];
            const andBuild = result[0][1];
            andEl.textContent = `${andVer} (${andBuild})`;
        }
    } catch (e) {
        console.error("Ошибка загрузки версий:", e);
        if (iosEl) iosEl.textContent = 'iOS: ❌';
        if (andEl) andEl.textContent = 'Android: ❌';
    }
}

function bindSimpleLinks(linksMap) {
    Object.entries(linksMap).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (el) el.onclick = () => window.open(url, '_blank');
    });
}

// ==========================================
// 5. ЗАПУСК
// ==========================================
async function initLinksHybrid() {
    console.log('[Link_Hybrid] Инициализация начата');
    linksConfig = new LinksConfigHybrid();
    const isTP = linksConfig.config.isTP;
    const customButtons = linksConfig.getCustomButtons();
    console.log('[Link_Hybrid] isTP:', isTP, 'customButtons:', customButtons.length);

    if (typeof createWindow === 'function') {
        createWindow('AF_Links', 'winTopLinks', 'winLeftLinks', getLinksHTML(isTP, customButtons));
        console.log('[Link_Hybrid] Окно создано');
    } else {
        console.warn('[Link_Hybrid] createWindow не найдена');
    }

    const panel = document.getElementById('AF_Links');
    if (!panel) {
        console.error('[Link_Hybrid] Панель AF_Links не найдена!');
        return;
    }

    panel.style.display = 'none';

    if (typeof hideWindowOnDoubleClick === 'function') hideWindowOnDoubleClick('AF_Links');
    if (typeof hideWindowOnClick === 'function') hideWindowOnClick('AF_Links', 'hideMe');

    initEventHandlers(isTP ? 'TP' : 'KC');
    console.log('[Link_Hybrid] Event handlers инициализированы');

    const btnL = document.getElementById('links');
    if (btnL) {
        btnL.onclick = () => {
            if (panel.style.display === 'none') {
                panel.style.display = '';
                if (isTP) getVersionsApp();
            } else {
                panel.style.display = 'none';
            }
        };
        console.log('[Link_Hybrid] Кнопка links привязана');
    } else {
        console.warn('[Link_Hybrid] Кнопка links не найдена');
    }
}

console.log('[Link_Hybrid] initLinksHybrid функция определена');

// Запуск
console.log('[Link_Hybrid] Скрипт загружен');
if (typeof createWindow === 'function') {
    initLinksHybrid();
} else {
    console.log('[Link_Hybrid] createWindow не готова, ждем 1 секунду');
    setTimeout(initLinksHybrid, 1000);
}
