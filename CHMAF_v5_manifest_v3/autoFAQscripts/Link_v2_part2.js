// ==========================================
// 3. MODAL MANAGER - Модальные окна
// ==========================================

class LinksModalManager {
    constructor(configManager, uiRenderer) {
        this.config = configManager;
        this.ui = uiRenderer;
        this.currentModal = null;
    }

    showButtonEditor(button, categoryId) {
        const categories = this.config.config.categories;
        const categoryOptions = categories
            .map(cat => `<option value="${cat.id}" ${cat.id === categoryId ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`)
            .join('');

        const modalHTML = `
            <div class="premium-modal-overlay" id="premium-modal-overlay">
                <div class="premium-modal">
                    <div class="premium-modal-header">
                        <div class="premium-modal-title">✏️ Редактировать кнопку</div>
                        <button class="premium-modal-close" id="premium-modal-close">❌</button>
                    </div>
                    <div class="premium-modal-body">
                        <div class="premium-form-group">
                            <label class="premium-form-label">Название</label>
                            <input
                                type="text"
                                class="premium-form-input"
                                id="edit-button-title"
                                value="${button.title}"
                                placeholder="Название кнопки"
                            />
                        </div>

                        <div class="premium-form-group">
                            <label class="premium-form-label">Иконка (эмодзи)</label>
                            <input
                                type="text"
                                class="premium-form-input"
                                id="edit-button-icon"
                                value="${button.icon}"
                                placeholder="📌"
                                maxlength="2"
                            />
                            <div class="premium-emoji-picker">
                                ${this.renderEmojiPicker()}
                            </div>
                        </div>

                        <div class="premium-form-group">
                            <label class="premium-form-label">URL</label>
                            <input
                                type="text"
                                class="premium-form-input"
                                id="edit-button-url"
                                value="${button.url}"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div class="premium-form-group">
                            <label class="premium-form-label">Категория</label>
                            <select class="premium-form-select" id="edit-button-category">
                                ${categoryOptions}
                            </select>
                        </div>
                    </div>
                    <div class="premium-modal-footer">
                        ${button.isCustom ? '<button class="premium-btn premium-btn-danger" id="delete-button-btn">🗑️ Удалить</button>' : ''}
                        <button class="premium-btn premium-btn-secondary" id="cancel-button-btn">Отмена</button>
                        <button class="premium-btn premium-btn-primary" id="save-button-btn">💾 Сохранить</button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);

        // Обработчики
        document.getElementById('premium-modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-button-btn').addEventListener('click', () => this.closeModal());

        // Emoji picker
        const emojiItems = document.querySelectorAll('.premium-emoji-item');
        const iconInput = document.getElementById('edit-button-icon');
        emojiItems.forEach(item => {
            item.addEventListener('click', () => {
                iconInput.value = item.textContent;
                emojiItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });

        // Сохранение
        document.getElementById('save-button-btn').addEventListener('click', () => {
            const newTitle = document.getElementById('edit-button-title').value.trim();
            const newIcon = document.getElementById('edit-button-icon').value.trim();
            const newUrl = document.getElementById('edit-button-url').value.trim();
            const newCategoryId = document.getElementById('edit-button-category').value;

            if (!newTitle || !newIcon || !newUrl) {
                this.ui.showToast('Заполните все поля', 'error');
                return;
            }

            // Если категория изменилась, перемещаем кнопку
            if (newCategoryId !== categoryId) {
                this.config.deleteButton(categoryId, button.id);
                button.title = newTitle;
                button.icon = newIcon;
                button.url = newUrl;
                this.config.addButton(newCategoryId, button);
            } else {
                this.config.updateButton(categoryId, button.id, {
                    title: newTitle,
                    icon: newIcon,
                    url: newUrl
                });
            }

            this.ui.showToast('Кнопка обновлена', 'success');
            this.closeModal();
            this.ui.render(this.ui.container.id);
        });

        // Удаление
        const deleteBtn = document.getElementById('delete-button-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm(`Удалить кнопку "${button.title}"?`)) {
                    this.config.deleteButton(categoryId, button.id);
                    this.ui.showToast('Кнопка удалена', 'success');
                    this.closeModal();
                    this.ui.render(this.ui.container.id);
                }
            });
        }
    }

    showAddButton() {
        const categories = this.config.config.categories;
        const categoryOptions = categories
            .map(cat => `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`)
            .join('');

        const modalHTML = `
            <div class="premium-modal-overlay" id="premium-modal-overlay">
                <div class="premium-modal">
                    <div class="premium-modal-header">
                        <div class="premium-modal-title">➕ Добавить кнопку</div>
                        <button class="premium-modal-close" id="premium-modal-close">❌</button>
                    </div>
                    <div class="premium-modal-body">
                        <div class="premium-form-group">
                            <label class="premium-form-label">Название</label>
                            <input
                                type="text"
                                class="premium-form-input"
                                id="add-button-title"
                                placeholder="Моя ссылка"
                            />
                        </div>

                        <div class="premium-form-group">
                            <label class="premium-form-label">Иконка (эмодзи)</label>
                            <input
                                type="text"
                                class="premium-form-input"
                                id="add-button-icon"
                                placeholder="🔗"
                                maxlength="2"
                            />
                            <div class="premium-emoji-picker">
                                ${this.renderEmojiPicker()}
                            </div>
                        </div>

                        <div class="premium-form-group">
                            <label class="premium-form-label">URL</label>
                            <input
                                type="text"
                                class="premium-form-input"
                                id="add-button-url"
                                placeholder="https://example.com"
                            />
                        </div>

                        <div class="premium-form-group">
                            <label class="premium-form-label">Категория</label>
                            <select class="premium-form-select" id="add-button-category">
                                ${categoryOptions}
                            </select>
                        </div>
                    </div>
                    <div class="premium-modal-footer">
                        <button class="premium-btn premium-btn-secondary" id="cancel-add-btn">Отмена</button>
                        <button class="premium-btn premium-btn-primary" id="save-add-btn">➕ Добавить</button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);

        // Обработчики
        document.getElementById('premium-modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-add-btn').addEventListener('click', () => this.closeModal());

        // Emoji picker
        const emojiItems = document.querySelectorAll('.premium-emoji-item');
        const iconInput = document.getElementById('add-button-icon');
        emojiItems.forEach(item => {
            item.addEventListener('click', () => {
                iconInput.value = item.textContent;
                emojiItems.forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });

        // Добавление
        document.getElementById('save-add-btn').addEventListener('click', () => {
            const title = document.getElementById('add-button-title').value.trim();
            const icon = document.getElementById('add-button-icon').value.trim();
            const url = document.getElementById('add-button-url').value.trim();
            const categoryId = document.getElementById('add-button-category').value;

            if (!title || !icon || !url) {
                this.ui.showToast('Заполните все поля', 'error');
                return;
            }

            const newButton = {
                title,
                icon,
                url,
                type: 'link',
                isCustom: true,
                visible: true
            };

            this.config.addButton(categoryId, newButton);
            this.ui.showToast('Кнопка добавлена', 'success');
            this.closeModal();
            this.ui.render(this.ui.container.id);
        });
    }

    showSettings() {
        const modalHTML = `
            <div class="premium-modal-overlay" id="premium-modal-overlay">
                <div class="premium-modal">
                    <div class="premium-modal-header">
                        <div class="premium-modal-title">⚙️ Настройки</div>
                        <button class="premium-modal-close" id="premium-modal-close">❌</button>
                    </div>
                    <div class="premium-modal-body">
                        <div class="premium-form-group">
                            <label class="premium-form-label">Управление данными</label>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <button class="premium-btn premium-btn-secondary" id="export-config-btn">
                                    📤 Экспорт
                                </button>
                                <button class="premium-btn premium-btn-secondary" id="import-config-btn">
                                    📥 Импорт
                                </button>
                            </div>
                            <input type="file" id="import-file-input" accept=".json" style="display: none;" />
                        </div>

                        <div class="premium-form-group" style="margin-top: 20px;">
                            <button class="premium-btn premium-btn-danger" id="reset-config-btn" style="width: 100%;">
                                🔄 Сбросить к настройкам по умолчанию
                            </button>
                        </div>

                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center; color: rgba(255,255,255,0.5); font-size: 12px;">
                            Premium Links v2.0
                        </div>
                    </div>
                    <div class="premium-modal-footer">
                        <button class="premium-btn premium-btn-secondary" id="close-settings-btn">Закрыть</button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHTML);

        // Обработчики
        document.getElementById('premium-modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('close-settings-btn').addEventListener('click', () => this.closeModal());

        // Экспорт
        document.getElementById('export-config-btn').addEventListener('click', () => {
            const json = this.config.exportConfig();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `premium-links-config-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.ui.showToast('Конфигурация экспортирована', 'success');
        });

        // Импорт
        const fileInput = document.getElementById('import-file-input');
        document.getElementById('import-config-btn').addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const success = this.config.importConfig(event.target.result);
                if (success) {
                    this.ui.showToast('Конфигурация импортирована', 'success');
                    this.closeModal();
                    this.ui.render(this.ui.container.id);
                } else {
                    this.ui.showToast('Ошибка импорта', 'error');
                }
            };
            reader.readAsText(file);
        });

        // Сброс
        document.getElementById('reset-config-btn').addEventListener('click', () => {
            if (confirm('Сбросить все настройки к значениям по умолчанию? Все пользовательские кнопки будут удалены!')) {
                this.config.resetToDefaults();
                this.ui.showToast('Настройки сброшены', 'success');
                this.closeModal();
                this.ui.render(this.ui.container.id);
            }
        });
    }

    renderEmojiPicker() {
        const emojis = [
            '🔗', '📌', '⭐', '🏠', '🛠️', '💰', '📚', '🔍',
            '📅', '💼', '📝', '💸', '🌐', '📊', '🎯', '🔧',
            '💡', '🚀', '⚡', '🎨', '📱', '💻', '🖥️', '⌨️',
            '🖱️', '🎮', '🎵', '🎬', '📷', '📹', '🎤', '🎧',
            '📞', '📧', '💬', '💭', '🗨️', '🗯️', '💌', '📮',
            '📬', '📭', '📦', '📋', '📄', '📃', '📑', '📊',
            '📈', '📉', '🗂️', '🗃️', '🗄️', '📇', '🗳️', '🗂️',
            '📁', '📂', '🗂️', '📅', '📆', '🗓️', '📇', '🗃️'
        ];

        return emojis.map(emoji => `<div class="premium-emoji-item">${emoji}</div>`).join('');
    }

    showModal(html) {
        // Удаляем предыдущее модальное окно, если есть
        this.closeModal();

        // Создаём новое
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer.firstElementChild);

        this.currentModal = document.getElementById('premium-modal-overlay');

        // Закрытие по клику на overlay
        this.currentModal.addEventListener('click', (e) => {
            if (e.target === this.currentModal) {
                this.closeModal();
            }
        });
    }

    closeModal() {
        if (this.currentModal) {
            this.currentModal.style.animation = 'premiumOverlayFadeIn 0.3s ease reverse';
            setTimeout(() => {
                if (this.currentModal && this.currentModal.parentNode) {
                    this.currentModal.remove();
                }
                this.currentModal = null;
            }, 300);
        }
    }
}

// ==========================================
// 4. ИНИЦИАЛИЗАЦИЯ
// ==========================================

function initPremiumLinks() {
    // Создаём менеджеры
    const configManager = new LinksConfigManager();
    const modalManager = new LinksModalManager(configManager, null);
    const uiRenderer = new LinksUIRenderer(configManager, modalManager);

    // Связываем modal manager с ui renderer
    modalManager.ui = uiRenderer;

    // Создаём окно
    const windowElement = createWindow('AF_Links_Premium', 'winTopLinksPremium', 'winLeftLinksPremium', '<div id="premium-links-container"></div>');
    windowElement.style.display = 'none';

    // Рендерим UI
    setTimeout(() => {
        uiRenderer.render('premium-links-container');
    }, 100);

    // Привязываем к кнопке открытия с повторными попытками
    function bindLinksButton() {
        const linksButton = document.getElementById('links');
        if (linksButton) {
            linksButton.onclick = function() {
                const panel = document.getElementById('AF_Links_Premium');
                if (panel) {
                    if (panel.style.display === 'none') {
                        panel.style.display = '';
                        uiRenderer.render('premium-links-container');
                    } else {
                        panel.style.display = 'none';
                    }
                }
            };
            console.log('✅ Кнопка Links привязана к Premium Links');
        } else {
            // Если кнопка ещё не создана, пробуем через 500мс
            setTimeout(bindLinksButton, 500);
        }
    }

    bindLinksButton();

    // Сохраняем глобально для доступа
    window.premiumLinksManager = {
        config: configManager,
        ui: uiRenderer,
        modal: modalManager
    };

    console.log('✅ Premium Links v2.0 инициализирован');
}

// Экспортируем
window.LinksModalManager = LinksModalManager;
window.initPremiumLinks = initPremiumLinks;

// Автоматическая инициализация при загрузке
if (typeof createWindow === 'function') {
    initPremiumLinks();
} else {
    console.warn('⚠️ createWindow не найдена, ожидаем загрузки utils.js');
    setTimeout(initPremiumLinks, 1000);
}
