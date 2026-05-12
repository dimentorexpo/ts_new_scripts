// ==========================================
// PREMIUM LINKS V2 - MVP
// ==========================================

// ==========================================
// 1. CONFIG MANAGER - Управление данными
// ==========================================

class LinksConfigManager {
    constructor() {
        this.storageKey = 'AF_LinksConfig_v2';
        this.config = this.loadConfig();
    }

    loadConfig() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Ошибка загрузки конфигурации:', e);
                return this.getDefaultConfig();
            }
        }
        return this.getDefaultConfig();
    }

    saveConfig() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.config));
            return true;
        } catch (e) {
            console.error('Ошибка сохранения конфигурации:', e);
            return false;
        }
    }

    getDefaultConfig() {
        const isTP = this.checkIsTP();

        if (!isTP) {
            // Конфигурация для KC
            return {
                version: "2.0",
                categories: [
                    {
                        id: "kc-main",
                        name: "Основные",
                        icon: "🏠",
                        collapsed: false,
                        order: 0,
                        buttons: [
                            { id: "knoweledgebaseKC", title: "База знаний", icon: "📚", url: "https://confluence.skyeng.tech/display/CSW/Customer+Service+WIKI", type: "link", isCustom: false, order: 0, visible: true },
                            { id: "lessonrecordKC", title: "Запись урока", icon: "👩‍🏫", url: "https://tramway.skyeng.ru/record", type: "link", isCustom: false, order: 1, visible: true },
                            { id: "skyhomeKC", title: "Skyeng Home", icon: "💼", url: "https://home.skyeng.ru/dashboard", type: "link", isCustom: false, order: 2, visible: true },
                            { id: "timetableKC", title: "TimeTable", icon: "📅", url: "https://timetable.skyeng.ru/", type: "link", isCustom: false, order: 3, visible: true }
                        ]
                    },
                    {
                        id: "kc-tools",
                        name: "Инструменты",
                        icon: "🛠️",
                        collapsed: false,
                        order: 1,
                        buttons: [
                            { id: "CalcKC", title: "Калькулятор", icon: "🧮", url: "https://billing-api.skyeng.ru/operations", type: "link", isCustom: false, order: 0, visible: true },
                            { id: "nachislyatorKC", title: "Начислятор", icon: "💸", url: "https://billing-marketing.skyeng.ru/accrual-operations/create", type: "link", isCustom: false, order: 1, visible: true },
                            { id: "rassrochKC", title: "Рассрочка", icon: "💳", url: "https://accounting.skyeng.ru/credit/list", type: "link", isCustom: false, order: 2, visible: true },
                            { id: "pondpisKC", title: "Подписки", icon: "💰", url: "https://billing-api.skyeng.ru/subscriptions", type: "link", isCustom: false, order: 3, visible: true },
                            { id: "omniKC", title: "Omni", icon: "📩", url: "https://skyeng.omnidesk.ru/", type: "link", isCustom: false, order: 4, visible: true },
                            { id: "RKKC", title: "РК", icon: "👥", url: "https://group.skyeng.ru/admin/?crudAction=index&crudControllerFqcn=App%5CController%5CAdmin%5CClubMemberCrudController&signature=V8w5PW8LT3GcoYMoSYzprG1lCW8F5sb5y7Bdrxh08pc", type: "link", isCustom: false, order: 5, visible: true }
                        ]
                    },
                    {
                        id: "custom",
                        name: "Мои ссылки",
                        icon: "⭐",
                        collapsed: false,
                        order: 999,
                        buttons: []
                    }
                ],
                settings: {
                    theme: "dark",
                    showIcons: true
                }
            };
        }

        // Конфигурация для TP
        return {
            version: "2.0",
            categories: [
                {
                    id: "tp-admin",
                    name: "Админ панели",
                    icon: "🛠️",
                    collapsed: false,
                    order: 0,
                    buttons: [
                        { id: "timetable", title: "TimeTable", icon: "📅", url: "https://timetable.skyeng.ru/", type: "link", isCustom: false, order: 0, visible: true },
                        { id: "useradm", title: "Админка", icon: "🛠️", url: "https://id.skyeng.ru/admin/users", type: "link", isCustom: false, order: 1, visible: true },
                        { id: "CMS", title: "CMS", icon: "🌀", url: "https://cms-vimbox.skyeng.ru/vim", type: "link", isCustom: false, order: 2, visible: true },
                        { id: "kidscms", title: "Kids CMS", icon: "🌀", url: "https://vimbox.skyeng.ru/kids/math/cms/lessons/1", type: "link", isCustom: false, order: 3, visible: true },
                        { id: "talksadm", title: "Talks", icon: "💋", url: "https://vimbox.skyeng.ru/talks/admin/statistics", type: "link", isCustom: false, order: 4, visible: true },
                        { id: "essayadmin", title: "Эссе", icon: "📝", url: "https://api-english.skyeng.ru/admin/platform/openanswer/list", type: "link", isCustom: false, order: 5, visible: true }
                    ]
                },
                {
                    id: "tp-finance",
                    name: "Финансы",
                    icon: "💰",
                    collapsed: false,
                    order: 1,
                    buttons: [
                        { id: "billingadm", title: "Начислятор", icon: "💸", url: "https://billing-api.skyeng.ru/operations", type: "link", isCustom: false, order: 0, visible: true },
                        { id: "compens", title: "Компенсации", icon: "💸", url: "https://billing-marketing.skyeng.ru/accrual-operations/create", type: "link", isCustom: false, order: 1, visible: true },
                        { id: "transactions", title: "Поиск $", icon: "💰", url: "https://accounting.skyeng.ru/userpayment/search/transaction", type: "link", isCustom: false, order: 2, visible: true },
                        { id: "subscribebilling", title: "Подписки", icon: "💰", url: "https://billing-api.skyeng.ru/subscriptions", type: "link", isCustom: false, order: 3, visible: true },
                        { id: "certificates", title: "Сертификаты", icon: "📜", url: "https://billing-marketing.skyeng.ru/certificate/certSearch", type: "link", isCustom: false, order: 4, visible: true },
                        { id: "promocodes", title: "Промокоды", icon: "*️⃣", url: "https://billing-marketing.skyeng.ru/promocode/list", type: "link", isCustom: false, order: 5, visible: true }
                    ]
                },
                {
                    id: "tp-support",
                    name: "Поддержка",
                    icon: "🆘",
                    collapsed: false,
                    order: 2,
                    buttons: [
                        { id: "knoweledgebase", title: "База знаний", icon: "📚", url: "https://confluence.skyeng.tech/pages/viewpage.action?pageId=25407293", type: "link", isCustom: false, order: 0, visible: true },
                        { id: "helpocentrstud", title: "БЗ У", icon: "📔", url: "https://helpcenter.skyeng.ru/students", type: "link", isCustom: false, order: 1, visible: true },
                        { id: "helpocentrteach", title: "БЗ П", icon: "📗", url: "https://helpcenter.skyeng.ru/teachers", type: "link", isCustom: false, order: 2, visible: true },
                        { id: "trshoothing", title: "ТраблШут", icon: "🔨", url: "https://video-trouble-shooter.skyeng.ru/", type: "link", isCustom: false, order: 3, visible: true },
                        { id: "confbugs", title: "Баги", icon: "🐞", url: "https://confluence.skyeng.tech/pages/viewpage.action?pageId=96042583", type: "link", isCustom: false, order: 4, visible: true }
                    ]
                },
                {
                    id: "tp-tools",
                    name: "Инструменты",
                    icon: "🔧",
                    collapsed: false,
                    order: 3,
                    buttons: [
                        { id: "userfeatures", title: "Фичи", icon: "🏡", url: "https://vimbox.skyeng.ru/circles/editor", type: "link", isCustom: false, order: 0, visible: true },
                        { id: "Synchronizer", title: "Синхрон", icon: "♻️", url: "https://learning.skyeng.ru/upsert-history", type: "link", isCustom: false, order: 1, visible: true },
                        { id: "AddRemoveChat", title: "➕/➖ Чат", icon: "💬", url: "https://communications.skyeng.ru/gateway/support/chat-management", type: "link", isCustom: false, order: 2, visible: true },
                        { id: "CheckVidConnection", title: "Video", icon: "📹", url: "https://video-check.skyeng.ru/", type: "link", isCustom: false, order: 3, visible: true },
                        { id: "browserstack", title: "B-Stack", icon: "🌐", url: "https://www.browserstack.com/users/sign_in", type: "link", isCustom: false, order: 4, visible: true }
                    ]
                },
                {
                    id: "tp-search",
                    name: "Поиск и действия",
                    icon: "🔍",
                    collapsed: false,
                    order: 4,
                    buttons: []
                },
                {
                    id: "custom",
                    name: "Мои ссылки",
                    icon: "⭐",
                    collapsed: false,
                    order: 999,
                    buttons: []
                }
            ],
            settings: {
                theme: "dark",
                showIcons: true
            }
        };
    }

    checkIsTP() {
        // Проверяем, является ли текущий пользователь TP
        try {
            const data = JSON.parse(localStorage.getItem('AF_storage_data') || '{}');
            if (typeof scriptAdr !== 'undefined') {
                const isKC = [data.KC_addr, data.KC_addrRzrv].includes(scriptAdr);
                console.log('checkIsTP:', !isKC, 'scriptAdr:', scriptAdr, 'KC_addr:', data.KC_addr);
                return !isKC;
            }
        } catch (e) {
            console.error('Ошибка проверки TP/KC:', e);
        }
        return true; // По умолчанию TP
    }

    // Методы для работы с кнопками
    addButton(categoryId, button) {
        const category = this.config.categories.find(c => c.id === categoryId);
        if (!category) return false;

        button.id = button.id || `custom-${Date.now()}`;
        button.order = category.buttons.length;
        button.isCustom = true;
        button.visible = true;

        category.buttons.push(button);
        this.saveConfig();
        return true;
    }

    updateButton(categoryId, buttonId, updates) {
        const category = this.config.categories.find(c => c.id === categoryId);
        if (!category) return false;

        const button = category.buttons.find(b => b.id === buttonId);
        if (!button) return false;

        Object.assign(button, updates);
        this.saveConfig();
        return true;
    }

    deleteButton(categoryId, buttonId) {
        const category = this.config.categories.find(c => c.id === categoryId);
        if (!category) return false;

        const index = category.buttons.findIndex(b => b.id === buttonId);
        if (index === -1) return false;

        category.buttons.splice(index, 1);
        this.saveConfig();
        return true;
    }

    getButton(categoryId, buttonId) {
        const category = this.config.categories.find(c => c.id === categoryId);
        if (!category) return null;
        return category.buttons.find(b => b.id === buttonId);
    }

    toggleCategory(categoryId) {
        const category = this.config.categories.find(c => c.id === categoryId);
        if (!category) return false;

        category.collapsed = !category.collapsed;
        this.saveConfig();
        return category.collapsed;
    }

    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }

    importConfig(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (imported.version && imported.categories) {
                this.config = imported;
                this.saveConfig();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Ошибка импорта:', e);
            return false;
        }
    }

    resetToDefaults() {
        this.config = this.getDefaultConfig();
        this.saveConfig();
    }
}

// ==========================================
// 2. UI RENDERER - Рендеринг интерфейса
// ==========================================

class LinksUIRenderer {
    constructor(configManager, modalManager) {
        this.config = configManager;
        this.modal = modalManager;
        this.container = null;
        this.searchQuery = '';
        this.versionsLoaded = false; // Флаг для загрузки версий только один раз
    }

    render(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Контейнер не найден:', containerId);
            return;
        }

        // === ФИКС: запоминаем именно ВНЕШНЕЕ окно, а не внутренний div ===
        this.windowEl = this.container.closest('.extwindows, .wintInitializeChat, .testuserwindow, .onlyfortp') || this.container;

        const html = `
            <div class="premium-links-panel">
                ${this.renderHeader()}
                ${this.renderSearch()}
                ${this.renderCategories()}
                ${this.renderFooter()}
            </div>
        `;

        this.container.innerHTML = html;
        this.attachEventListeners();

        this.versionsLoaded = false;
        this.loadVersions();
    }

    renderHeader() {
        return `
            <div class="premium-links-header chmaf-drag-handle">
                <div class="premium-links-title">
                    🔗 Ссылки
                </div>
                <div class="premium-links-actions">
                    <button class="premium-action-btn" id="premium-add-btn" title="Добавить кнопку">
                        ➕
                    </button>
                    <button class="premium-action-btn" id="premium-settings-btn" title="Настройки">
                        ⚙️
                    </button>
                    <button class="premium-action-btn danger" id="premium-close-btn" title="Закрыть">
                        ❌
                    </button>
                </div>
            </div>
        `;
    }

    renderSearch() {
        return `
            <div class="premium-search-wrapper">
                <span class="premium-search-icon">🔍</span>
                <input
                    type="text"
                    class="premium-search-input"
                    id="premium-search-input"
                    placeholder="Поиск по названию..."
                    value="${this.searchQuery}"
                />
            </div>
        `;
    }

    renderFooter() {
        const isTP = this.config.checkIsTP();

        return `
            <div class="premium-links-footer">
                <div class="premium-footer-versions">
                    ${isTP ? `
                        <div class="premium-version-badge" id="premium-ios-version" title="Версия iOS приложения">
                            iOS: ⏳
                        </div>
                        <div class="premium-version-badge" id="premium-android-version" title="Версия Android приложения">
                            Android: ⏳
                        </div>
                    ` : ''}
                </div>
                <div class="premium-footer-actions">
                    ${isTP ? `
                        <button class="premium-footer-btn grabber" id="premium-grabber-btn" title="Парсинг чатов">
                            Grabber 🔎
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderCategories() {
        const categories = this.config.config.categories
            .sort((a, b) => a.order - b.order);

        return categories.map(category => this.renderCategory(category)).join('');
    }

    renderCategory(category) {
        const filteredButtons = this.filterButtons(category.buttons);

        const toggleIcon = category.collapsed ? '▶' : '▼';
        const gridClass = category.collapsed ? 'collapsed' : '';

        // Специальная обработка для категории поиска - всегда показываем, без счётчика
        if (category.id === 'tp-search') {
            return `
                <div class="premium-category" data-category-id="${category.id}">
                    <div class="premium-category-header" data-category-id="${category.id}">
                        <div class="premium-category-title">
                            <span class="premium-category-icon">${category.icon}</span>
                            <span>${category.name}</span>
                        </div>
                        <span class="premium-category-toggle ${category.collapsed ? 'collapsed' : ''}">${toggleIcon}</span>
                    </div>
                    <div class="premium-input-groups ${gridClass}">
                        ${this.renderSearchInputs()}
                    </div>
                </div>
            `;
        }

        // Если после фильтрации нет кнопок, не показываем категорию
        if (filteredButtons.length === 0 && this.searchQuery) {
            return '';
        }

        return `
            <div class="premium-category" data-category-id="${category.id}">
                <div class="premium-category-header" data-category-id="${category.id}">
                    <div class="premium-category-title">
                        <span class="premium-category-icon">${category.icon}</span>
                        <span>${category.name}</span>
                        <span class="premium-category-count" style="color: rgba(255,255,255,0.4); font-size: 12px;">(${filteredButtons.length})</span>
                    </div>
                    <span class="premium-category-toggle ${category.collapsed ? 'collapsed' : ''}">${toggleIcon}</span>
                </div>
                <div class="premium-buttons-grid ${gridClass}">
                    ${filteredButtons.map(button => this.renderButton(button, category.id)).join('')}
                </div>
            </div>
        `;
    }

    renderSearchInputs() {
        return `
            <div class="premium-input-group">
                <input type="text" id="premium-cpuname" placeholder="CPU name" title="Рейтинг CPU">
                <button id="premium-benchmark">🔎</button>
            </div>
            <div class="premium-input-group">
                <input type="text" id="premium-creditstatus" placeholder="ID У рассрочка">
                <button id="premium-credits">🔎</button>
            </div>
            <div class="premium-input-group">
                <input type="text" id="premium-iplookup" placeholder="IP адрес">
                <button id="premium-gotolookip">🔎</button>
            </div>
            <div class="premium-input-group">
                <input type="text" id="premium-lgssearch" placeholder="ID Группы LGS">
                <button id="premium-getlgsinfo">🔎</button>
            </div>
            <div class="premium-input-group">
                <input type="text" id="premium-cmsstepid" placeholder="CMS stepUUID">
                <button id="premium-cmsid">🔎</button>
            </div>
            <div class="premium-input-group">
                <input type="text" id="premium-schemesteacher" placeholder="ID П схемы">
                <button id="premium-getschemes">🔎</button>
            </div>
            <div class="premium-input-group">
                <input type="text" id="premium-pushes" placeholder="ID У пуши">
                <button id="premium-getpushes">🔎</button>
            </div>
            <div class="premium-input-group">
                <input type="text" id="premium-trshooterhash" placeholder="Hash комнаты">
                <button id="premium-gettrshinfo">🚀</button>
            </div>
            <div class="premium-input-group">
                <input type="text" id="premium-enablerAP" placeholder="ID услуги АП">
                <button id="premium-getenablerAP">💾</button>
            </div>
        `;
    }

    renderButton(button, categoryId) {
        const customClass = button.isCustom ? 'custom' : '';

        return `
            <div
                class="premium-link-btn ${customClass}"
                data-button-id="${button.id}"
                data-category-id="${categoryId}"
                data-url="${button.url}"
                title="${button.title}"
            >
                <div class="premium-link-btn-icon">${button.icon}</div>
                <div class="premium-link-btn-title">${button.title}</div>
            </div>
        `;
    }

    filterButtons(buttons) {
        if (!this.searchQuery) {
            return buttons.filter(b => b.visible).sort((a, b) => a.order - b.order);
        }

        const query = this.searchQuery.toLowerCase();
        return buttons
            .filter(b => b.visible && b.title.toLowerCase().includes(query))
            .sort((a, b) => a.order - b.order);
    }

    attachEventListeners() {
        // Поиск - живой поиск без перерендера
        const searchInput = document.getElementById('premium-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.applySearch();
            });
        }

        // Кнопки в header
        const addBtn = document.getElementById('premium-add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Не тащим окно при клике на кнопку
                this.modal.showAddButton();
            });
        }

        const settingsBtn = document.getElementById('premium-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.modal.showSettings();
            });
        }

        const closeBtn = document.getElementById('premium-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Скрываем ВНЕШНЕЕ окно, а не только внутренний контент
                if (this.windowEl) {
                    this.windowEl.style.display = 'none';
                }
            });
        }

        // Сворачивание категорий
        const categoryHeaders = document.querySelectorAll('.premium-category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                // Игнорируем клики на кнопки действий
                if (e.target.closest('.premium-category-actions')) return;

                const categoryId = e.currentTarget.dataset.categoryId;
                const collapsed = this.config.toggleCategory(categoryId);

                // Обновляем только UI категории без полного перерендера
                const categoryEl = e.currentTarget.closest('.premium-category');
                const grid = categoryEl.querySelector('.premium-buttons-grid, .premium-input-groups');
                const toggle = categoryEl.querySelector('.premium-category-toggle');

                if (grid && toggle) {
                    if (collapsed) {
                        grid.classList.add('collapsed');
                        toggle.classList.add('collapsed');
                        toggle.textContent = '▶';
                    } else {
                        grid.classList.remove('collapsed');
                        toggle.classList.remove('collapsed');
                        toggle.textContent = '▼';
                    }
                }
            });
        });

        // Клик по кнопкам
        const linkButtons = document.querySelectorAll('.premium-link-btn');
        linkButtons.forEach(btn => {
            // Левый клик - открыть ссылку
            btn.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                if (url) {
                    window.open(url, '_blank');
                }
            });

            // Правый клик - редактировать
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const buttonId = e.currentTarget.dataset.buttonId;
                const categoryId = e.currentTarget.dataset.categoryId;
                const button = this.config.getButton(categoryId, buttonId);
                if (button) {
                    this.modal.showButtonEditor(button, categoryId);
                }
            });
        });

        // Привязываем обработчики для input полей
        this.attachSearchInputHandlers();
    }

    attachSearchInputHandlers() {
        // Обработчики для input полей с поиском
        const inputActions = [
            { btn: 'premium-benchmark', input: 'premium-cpuname', url: 'https://www.cpubenchmark.net/cpu_lookup.php?cpu=', error: 'Введите CPU' },
            { btn: 'premium-getschemes', input: 'premium-schemesteacher', url: 'https://teacher-incentive.skyeng.ru/incentive/teacher/', error: 'Введите ID П' },
            { btn: 'premium-gotolookip', input: 'premium-iplookup', url: 'https://check-host.net/ip-info?host=', error: 'Введите IP' },
            { btn: 'premium-cmsid', input: 'premium-cmsstepid', url: 'https://content.vimbox.skyeng.ru/cms/step-store/update/id/', error: 'Введите STEPUUID' },
            { btn: 'premium-credits', input: 'premium-creditstatus', url: 'https://billing-api.skyeng.ru/installments?perPage=10&ownerId=', error: 'Введите ID У' },
            { btn: 'premium-getlgsinfo', input: 'premium-lgssearch', url: 'https://learning-groups-storage.skyeng.ru/group/', error: 'Введите ID группы', suffix: '?cp=(section:participants)' },
            { btn: 'premium-getpushes', input: 'premium-pushes', url: 'https://push-notifications.skyeng.ru/cms/logs?page=1&paginateBy=100&userId=', error: 'Введите ID У' },
            { btn: 'premium-gettrshinfo', input: 'premium-trshooterhash', url: 'https://video-trouble-shooter.skyeng.ru/?hash=', error: 'Введите hash' }
        ];

        inputActions.forEach(({ btn, input, url, error, suffix }) => {
            const buttonEl = document.getElementById(btn);
            const inputEl = document.getElementById(input);

            if (buttonEl && inputEl) {
                const action = () => {
                    const val = inputEl.value.trim();
                    if (!val) {
                        this.showToast(error, 'error');
                    } else {
                        const finalUrl = suffix ? `${url}${val}${suffix}` : `${url}${val}`;
                        window.open(finalUrl, '_blank');
                        inputEl.value = '';
                    }
                };

                buttonEl.addEventListener('click', action);
                inputEl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') action();
                });
            }
        });

        // Специальная логика для АП
        const btnEnablerAP = document.getElementById('premium-getenablerAP');
        const inputEnablerAP = document.getElementById('premium-enablerAP');

        if (btnEnablerAP && inputEnablerAP) {
            const action = () => {
                const val = inputEnablerAP.value.trim();
                if (!val) {
                    this.showToast('Введите ID услуги', 'error');
                } else {
                    if (typeof copyToClipboard === 'function') {
                        copyToClipboard(`https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${val}`);
                        this.showToast('💾 Ссылка АП скопирована', 'success');
                    } else {
                        window.open(`https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${val}`, '_blank');
                    }
                    inputEnablerAP.value = '';
                }
            };

            btnEnablerAP.addEventListener('click', action);
            inputEnablerAP.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') action();
            });
        }
    }

    applySearch() {
        const categories = document.querySelectorAll('.premium-category');

        categories.forEach(categoryEl => {
            const categoryId = categoryEl.dataset.categoryId;
            const buttons = categoryEl.querySelectorAll('.premium-link-btn');
            let visibleCount = 0;

            buttons.forEach(btn => {
                const title = btn.getAttribute('title').toLowerCase();
                if (!this.searchQuery || title.includes(this.searchQuery)) {
                    btn.style.display = '';
                    visibleCount++;
                } else {
                    btn.style.display = 'none';
                }
            });

            // Скрываем категорию если нет видимых кнопок (кроме tp-search)
            if (this.searchQuery && visibleCount === 0 && categoryId !== 'tp-search') {
                categoryEl.style.display = 'none';
            } else {
                categoryEl.style.display = '';

                // Автоматически раскрываем категорию если есть поиск и найдены результаты
                if (this.searchQuery && visibleCount > 0) {
                    const grid = categoryEl.querySelector('.premium-buttons-grid');
                    const toggle = categoryEl.querySelector('.premium-category-toggle');
                    if (grid && toggle) {
                        grid.classList.remove('collapsed');
                        toggle.classList.remove('collapsed');
                        toggle.textContent = '▼';
                    }
                } else if (!this.searchQuery) {
                    // Если поиск очищен, возвращаем исходное состояние из конфига
                    const category = this.config.config.categories.find(c => c.id === categoryId);
                    if (category) {
                        const grid = categoryEl.querySelector('.premium-buttons-grid, .premium-input-groups');
                        const toggle = categoryEl.querySelector('.premium-category-toggle');
                        if (grid && toggle) {
                            if (category.collapsed) {
                                grid.classList.add('collapsed');
                                toggle.classList.add('collapsed');
                                toggle.textContent = '▶';
                            } else {
                                grid.classList.remove('collapsed');
                                toggle.classList.remove('collapsed');
                                toggle.textContent = '▼';
                            }
                        }
                    }
                }
            }

            // Обновляем счётчик в заголовке категории
            const countSpan = categoryEl.querySelector('.premium-category-count');
            if (countSpan) {
                countSpan.textContent = `(${visibleCount})`;
            }
        });
    }

    loadVersions() {
        const isTP = this.config.checkIsTP();
        if (!isTP) {
            console.log('Не TP, версии не загружаем');
            return;
        }

        const iosEl = document.getElementById('premium-ios-version');
        const andEl = document.getElementById('premium-android-version');

        console.log('Элементы версий:', { iosEl, andEl, versionsLoaded: this.versionsLoaded });

        // Проверяем, что элементы существуют
        if (!iosEl || !andEl) {
            console.log('Элементы версий не найдены');
            return;
        }

        // Если уже загружены, не загружаем повторно
        if (this.versionsLoaded) {
            console.log('Версии уже загружены');
            return;
        }

        this.versionsLoaded = true; // Устанавливаем флаг

        console.log('Загружаем версии приложений...');

        // Загружаем версии приложений
        fetch('https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec')
            .then(res => {
                console.log('Ответ получен:', res.status);
                return res.json();
            })
            .then(data => {
                const result = data.result;
                console.log('Версии загружены:', result);
                if (iosEl && result[1]) {
                    const iosVer = result[1][0];
                    const iosBuild = result[1][1];
                    iosEl.textContent = `${iosVer} (${iosBuild})`;
                    iosEl.onclick = () => window.open("https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732", "_blank");
                }
                if (andEl && result[0]) {
                    const andVer = result[0][0];
                    const andBuild = result[0][1];
                    andEl.textContent = `${andVer} (${andBuild})`;
                    andEl.onclick = () => window.open("https://play.google.com/store/apps/details?id=skyeng.words.prod", "_blank");
                }
            })
            .catch(e => {
                console.error('Ошибка загрузки версий:', e);
                if (iosEl) iosEl.textContent = 'iOS: ❌';
                if (andEl) andEl.textContent = 'Android: ❌';
            });

        // Обработчик для Grabber
        const grabberBtn = document.getElementById('premium-grabber-btn');
        if (grabberBtn) {
            grabberBtn.addEventListener('click', () => {
                if (typeof getopenGrabberButtonPress === 'function') {
                    getopenGrabberButtonPress();
                } else {
                    const grabberWindow = document.getElementById('AF_Grabber');
                    if (grabberWindow) {
                        grabberWindow.style.display = grabberWindow.style.display === 'none' ? '' : 'none';
                    }
                }
            });
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `premium-toast ${type}`;

        const icon = type === 'success' ? '✅' : '❌';
        toast.innerHTML = `
            <span class="premium-toast-icon">${icon}</span>
            <span class="premium-toast-message">${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'premiumToastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Экспортируем классы
window.LinksConfigManager = LinksConfigManager;
window.LinksUIRenderer = LinksUIRenderer;
