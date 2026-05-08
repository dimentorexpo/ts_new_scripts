/**
 * Module: CheckTags & Drag-and-Drop (SPA Bulletproof & Smart Order)
 * Filename: pipa.js
 */

// Оборачиваем весь код в IIFE (самовызывающуюся функцию), чтобы изолировать переменные
(function () {
    // ЗАЩИТА №1: Предотвращаем повторный запуск скрипта, если он уже работает
    if (window.__skyengModInitialized) return;
    window.__skyengModInitialized = true;

    // Глобальное состояние
    const STORAGE_KEY = 'chmaf_pinned_dialogs_ordered';
    let pinnedOrder = [];
    let isDragging = false;
    let draggedItem = null;
    let hasReordered = false;
    let listObserver = null;
    let activeContainer = null;

    // ─── Утилиты для настраиваемого цвета «Нет тега/темы» ───
    const getMissingTagColor = () => {
        // Пробуем сначала Settings (если объект доступен глобально)
        if (typeof Settings !== 'undefined' && Settings.get) {
            return Settings.get('missingTagColor') || '#ff1744';
        }
        // Fallback — читаем напрямую из localStorage
        try { return localStorage.getItem('chmaf_missingTagColor') || '#ff1744'; }
        catch (e) { return '#ff1744'; }
    };

    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    // Затемняем HEX на N процентов для второго цвета градиента
    const darkenHex = (hex, percent) => {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    };

    // Универсальные селекторы (защита от смены хешей в классах)
    const SELECTORS = {
        container: '[class*="Operator_DialogsList"]',
        card: '[class*="DialogsCard_Card"]',
        timer: '[class*="DialogsCard_Timer"]'
    };

    // Вспомогательная функция для получения текущего "живого" iframe
    function getActiveIframeDoc() {
        const iframeNew = document.querySelector('[class^="NEW_FRONTEND__frame"]');
        if (iframeNew) {
            return iframeNew.contentDocument || iframeNew.contentWindow?.document;
        }
        return null;
    }

    function waitForOpSection() {
        return new Promise(resolve => {
            const check = setInterval(() => {
                const doc = getActiveIframeDoc();
                if (!doc) return;

                const sectionKey = doc.querySelector('span[id^="mantine-"][id$="-target"]');
                if (!sectionKey) return;

                if (sectionKey.textContent.split('-')[0] === "ТП") {
                    clearInterval(check);
                    resolve(true);
                }
            }, 300);
        });
    }

    function loadPinned() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const ids = JSON.parse(saved);
                if (Array.isArray(ids)) pinnedOrder = ids;
            }
        } catch (e) { console.error("ChMAF: LS Load Error", e); }
    }

    function savePinned() {
        if (pinnedOrder.length > 100) pinnedOrder = pinnedOrder.slice(-100);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedOrder));
    }

    function getSecondsFromCard(card) {
        // Используем универсальный селектор таймера
        const timerEl = card.querySelector(SELECTORS.timer);
        let timeStr = timerEl ? timerEl.textContent.trim() : null;
        if (!timeStr) {
            const match = card.textContent.match(/\b(\d{2}:\d{2}(?::\d{2})?)\b/);
            if (match) timeStr = match[1];
        }
        if (!timeStr) return Infinity;

        const parts = timeStr.split(':').map(Number);
        if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
        if (parts.length === 2) return parts[0] * 60 + parts[1];
        return Infinity;
    }

    function applyPinVisuals(card, convId) {
        if (!card.classList.contains('skyeng-mod-pinned')) {
            card.classList.add('skyeng-mod-pinned');
        }
        if (!card.dataset.dblClickInit) {
            card.dataset.dblClickInit = "true";
            card.addEventListener('dblclick', function () {
                pinnedOrder = pinnedOrder.filter(id => id !== convId);
                savePinned();
                card.classList.remove('skyeng-mod-pinned');
                // Используем универсальный селектор контейнера
                const container = card.closest(SELECTORS.container);
                if (container) sortDialogs(container);
            });
        }
    }

    function sortDialogs(container) {
        if (isDragging || !container || !container.parentNode) return;

        // ИСПРАВЛЕНО: querySelectorAll вместо querySelector для получения всех карточек
        const dialogs = Array.from(container.querySelectorAll(SELECTORS.card));
        if (dialogs.length === 0) return;

        const pinnedElements = [];
        const autoDialogs = [];

        dialogs.forEach((dialog) => {
            const convId = dialog.dataset.convId;
            if (convId && pinnedOrder.includes(convId)) {
                pinnedElements.push(dialog);
                applyPinVisuals(dialog, convId);
            } else {
                autoDialogs.push(dialog);
                dialog.classList.remove('skyeng-mod-pinned');
            }
        });

        pinnedElements.sort((a, b) => pinnedOrder.indexOf(a.dataset.convId) - pinnedOrder.indexOf(b.dataset.convId));
        autoDialogs.sort((a, b) => getSecondsFromCard(a) - getSecondsFromCard(b));

        const finalOrder = [...pinnedElements, ...autoDialogs];
        let orderChanged = false;
        const currentNodes = Array.from(container.children);

        for (let i = 0; i < finalOrder.length; i++) {
            if (currentNodes[i] !== finalOrder[i]) {
                orderChanged = true;
                break;
            }
        }

        if (orderChanged) {
            if (listObserver) listObserver.disconnect();

            finalOrder.forEach(dialog => {
                if (container && dialog) {
                    container.appendChild(dialog);
                }
            });

            if (listObserver) {
                listObserver.observe(container, { childList: true, subtree: true });
            }
        }
    }

    function initDraggable(card) {
        if (card.dataset.dndInit) return;
        card.dataset.dndInit = "true";

        card.setAttribute('draggable', 'true');
        card.style.cursor = 'grab';

        card.addEventListener('dragstart', function (e) {
            isDragging = true;
            draggedItem = this;
            hasReordered = false;
            this.style.opacity = '0.4';
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', function () {
            this.style.opacity = '1';
            isDragging = false;
            draggedItem = null;

            // Используем универсальный селектор
            const currentContainer = this.closest(SELECTORS.container);
            if (!currentContainer) return;

            if (hasReordered) {
                const targetId = this.dataset.convId;
                const newPinnedOrder = [];
                const currentNodes = Array.from(currentContainer.children);
                let foundTarget = false;

                currentNodes.forEach(node => {
                    const id = node.dataset.convId;
                    if (!id) return;

                    const isTarget = (id === targetId);
                    const wasPinned = pinnedOrder.includes(id);

                    if (isTarget) {
                        foundTarget = true;
                        newPinnedOrder.push(id);
                        applyPinVisuals(node, id);
                    } else if (!foundTarget || wasPinned) {
                        newPinnedOrder.push(id);
                        applyPinVisuals(node, id);
                    } else {
                        node.classList.remove('skyeng-mod-pinned');
                    }
                });

                pinnedOrder = [...new Set(newPinnedOrder)];
                savePinned();
            }

            sortDialogs(currentContainer);
        });

        card.addEventListener('dragover', function (e) {
            e.preventDefault();
            if (this === draggedItem || !draggedItem) return;
            const bounding = this.getBoundingClientRect();
            const offset = bounding.y + (bounding.height / 2);
            if (e.clientY - offset > 0) {
                if (this.nextSibling !== draggedItem) {
                    this.after(draggedItem);
                    hasReordered = true;
                }
            } else {
                if (this.previousSibling !== draggedItem) {
                    this.before(draggedItem);
                    hasReordered = true;
                }
            }
        });
    }

    // === ЦЕНТРАЛЬНЫЙ МОДУЛЬ НАБЛЮДЕНИЯ ===
    function setupSPA() {
        setInterval(() => {
            const doc = getActiveIframeDoc();
            if (!doc) return;

            // Внедряем стили
            if (!doc.getElementById('skyeng-mod-styles')) {
                const style = doc.createElement('style');
                style.id = 'skyeng-mod-styles';
                style.textContent = `
                    .skyeng-mod-pinned {
                        position: relative !important;
                        border-left: 6px solid #ff9800 !important;
                        transition: all 0.3s ease;
                    }
                    .skyeng-mod-pinned::after {
                        content: '📌';
                        position: absolute;
                        top: 5px;
                        right: 5px;
                        font-size: 18px;
                        z-index: 10;
                        filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.5));
                        pointer-events: none;
                    }
                    .skyeng-mod-tag {
                        text-align: center;
                        border-radius: 20px;
                        padding: 2px 8px;
                        font-size: 12px;
                        font-weight: bold;
                        color: #fff;
                        text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
                        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        transition: background 0.3s;
                    }
                `;
                const target = doc.head || doc.getElementsByTagName('head')[0] || doc.documentElement;
                if (target) {
                    target.appendChild(style);
                }
            }

            // Используем универсальный селектор
            const container = doc.querySelector(SELECTORS.container);

            // ЗАЩИТА №2: Обработка ухода со страницы /assigned на страницу /archive
            if (!container) {
                if (activeContainer) {
                    activeContainer = null;
                    if (listObserver) {
                        listObserver.disconnect();
                        listObserver = null;
                    }
                    isDragging = false;
                    draggedItem = null;
                }
                return;
            }

            if (isDragging && draggedItem && !doc.contains(draggedItem)) {
                isDragging = false;
                draggedItem = null;
                hasReordered = false;
            }

            // Если вернулись на /assigned и фреймворк создал новый контейнер
            if (container !== activeContainer) {
                activeContainer = container;
                if (listObserver) listObserver.disconnect();

                // Универсальный поиск карточек
                container.querySelectorAll(SELECTORS.card).forEach(card => initDraggable(card));

                listObserver = new MutationObserver((mutations) => {
                    let hasNew = false;
                    mutations.forEach(m => {
                        m.addedNodes.forEach(node => {
                            // Проверяем совпадение части класса через matches()
                            if (node.nodeType === 1 && node.matches(SELECTORS.card)) {
                                initDraggable(node);
                                hasNew = true;
                            }
                        });
                    });
                    if (hasNew && !isDragging) {
                        setTimeout(() => sortDialogs(activeContainer), 100);
                    }
                });

                listObserver.observe(container, { childList: true, subtree: true });
                sortDialogs(container);
            } else if (!isDragging) {
                sortDialogs(container);
            }
        }, 1500);
    }

    // === МОДУЛЬ 2: ПРОВЕРКА ТЕГОВ ===
    // === МОДУЛЬ 2: ПРОВЕРКА ТЕГОВ И ТЕМЫ/ПОДТЕМЫ ===
    function initTagChecker() {
        setInterval(() => {
            try {
                const missingColor = getMissingTagColor();          // ← выбранный цвет
                const missingColorDark = darkenHex(missingColor, 40);   // ← авто-темнее для градиента
                const missingRgbaBg = hexToRgba(missingColor, 0.06); // ← фон подсветки поля
                const missingRgbaGlow = hexToRgba(missingColor, 0.5);  // ← тень бейджа

                const doc = getActiveIframeDoc();
                if (!doc) return;

                const currentUrl = doc.location ? doc.location.pathname : window.location.pathname;
                const urlParts = currentUrl.split('/').filter(Boolean);
                const currentConvId = urlParts[urlParts.length - 1];

                if (!currentConvId || currentConvId === 'assigned' || currentConvId === 'archive') return;

                const convElement = doc.querySelector(`[data-conv-id="${currentConvId}"]`);
                if (!convElement) return;

                const wrappers = doc.querySelectorAll('#__next div[class*="List_ListWrapper"]');

                let tagBlock = null;
                let topicBlock = null;
                wrappers.forEach(wrap => {
                    const txt = wrap.innerText;
                    if (txt.includes("Выбор тегов")) tagBlock = wrap;
                    if (txt.includes("Выбор темы/подтемы")) topicBlock = wrap;
                });

                if (!tagBlock && !topicBlock) return;

                const btn = doc.querySelector('button[title="Закрыть"]');

                let existing = convElement.querySelector('[data-my-tag="no-tag"]');
                if (!existing) {
                    existing = doc.createElement('span');
                    existing.setAttribute("data-my-tag", "no-tag");
                    existing.classList.add('skyeng-mod-tag');
                    convElement.append(existing);
                }

                const tagEmpty = tagBlock ? tagBlock.innerText.trim().includes("Пусто") : false;
                const topicEmpty = topicBlock ? topicBlock.innerText.trim().includes("Пусто") : false;
                const hasEmpty = tagEmpty || topicEmpty;

                // ─── Универсальная стилизация пустого поля ───
                const styleEmptyBlock = (block, isEmpty) => {
                    if (!block) return;
                    const target = block.children[0]?.children[0];
                    if (!target) return;

                    if (isEmpty) {
                        target.style.border = `2px solid ${missingColor}`;
                        target.style.background = missingRgbaBg;
                        target.style.borderRadius = "8px";
                        target.classList.add('skyeng-mod-pulse');
                    } else {
                        target.style.border = "";
                        target.style.background = "";
                        target.style.borderRadius = "";
                        target.classList.remove('skyeng-mod-pulse');
                    }
                };

                styleEmptyBlock(tagBlock, tagEmpty);
                styleEmptyBlock(topicBlock, topicEmpty);

                if (hasEmpty) {
                    if (btn) btn.disabled = true;

                    const missing = [];
                    if (tagEmpty) missing.push("тега");
                    if (topicEmpty) missing.push("темы");

                    existing.textContent = `❌ Нет ${missing.join(' и ')}`;
                    existing.style.background = `linear-gradient(135deg, ${missingColor}, ${missingColorDark})`;
                    existing.style.boxShadow = `0 0 12px ${missingRgbaGlow}`;
                } else {
                    if (btn) btn.disabled = false;
                    existing.textContent = "☑️ Всё заполнено";
                    existing.style.background = "linear-gradient(135deg, #4caf50, #087f23)";
                    existing.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                }
            } catch (e) {
                // молчим
            }
        }, 1500);
    }

    // === ТОЧКА ВХОДА ===
    (async function startWhenReady() {
        await waitForOpSection();
        loadPinned();
        setupSPA();
        initTagChecker();
    })();

})(); // Конец IIFE