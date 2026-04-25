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
        const timerEl = card.querySelector('.DialogsCard_Timer__XBR_3');
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
                const container = card.closest('.Operator_DialogsList__4Q5tH');
                if (container) sortDialogs(container);
            });
        }
    }

    function sortDialogs(container) {
        if (isDragging || !container) return;

        const dialogs = Array.from(container.querySelectorAll('.DialogsCard_Card__dU57S'));
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
            finalOrder.forEach(dialog => container.appendChild(dialog));
            if (listObserver) listObserver.observe(container, { childList: true, subtree: true });
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

            const currentContainer = this.closest('.Operator_DialogsList__4Q5tH');
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
                doc.head.appendChild(style);
            }

            const container = doc.querySelector('.Operator_DialogsList__4Q5tH');

            // ЗАЩИТА №2: Обработка ухода со страницы /assigned на страницу /archive
            if (!container) {
                if (activeContainer) {
                    // Контейнер пропал (мы ушли с нужной вкладки). Очищаем память.
                    activeContainer = null;
                    if (listObserver) {
                        listObserver.disconnect();
                        listObserver = null;
                    }
                    isDragging = false;
                    draggedItem = null;
                }
                return; // Ждем, пока пользователь вернется
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

                container.querySelectorAll('.DialogsCard_Card__dU57S').forEach(card => initDraggable(card));

                listObserver = new MutationObserver((mutations) => {
                    let hasNew = false;
                    mutations.forEach(m => {
                        m.addedNodes.forEach(node => {
                            if (node.nodeType === 1 && node.classList.contains('DialogsCard_Card__dU57S')) {
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
    function initTagChecker() {
        setInterval(() => {
            try {
                const doc = getActiveIframeDoc();
                if (!doc) return;

                // ЗАЩИТА №3: Безопасный парсинг URL (защита от падения на /archive)
                const currentUrl = doc.location ? doc.location.pathname : window.location.pathname;
                const urlParts = currentUrl.split('/').filter(Boolean);
                const currentConvId = urlParts[urlParts.length - 1];

                // Если ID диалога нет (например, URL просто /tickets/assigned), прерываем шаг
                if (!currentConvId || currentConvId === 'assigned' || currentConvId === 'archive') return;

                const convElement = doc.querySelector(`[data-conv-id="${currentConvId}"]`);
                if (!convElement) return;

                const wrappers = doc.querySelectorAll('#__next div[class*="List_ListWrapper"]');
                let targetBlock = null;
                wrappers.forEach(wrap => { if (wrap.innerText.includes("Выбор тегов")) targetBlock = wrap; });
                if (!targetBlock) return;

                const btn = doc.querySelector('button[title="Закрыть"]');

                let existing = convElement.querySelector('[data-my-tag="no-tag"]');
                if (!existing) {
                    existing = doc.createElement('span');
                    existing.setAttribute("data-my-tag", "no-tag");
                    existing.classList.add('skyeng-mod-tag');
                    convElement.append(existing);
                }

                const text = targetBlock.innerText.trim();
                if (text.includes("Пусто")) {
                    if (btn) btn.disabled = true;
                    if (targetBlock.children[0]?.children[0]) {
                        targetBlock.children[0].children[0].style.border = "2px solid firebrick";
                        targetBlock.children[0].children[0].style.background = "rgba(178,34,34, 0.1)";
                    }
                    existing.textContent = "❌ Нет тега";
                    existing.style.background = "linear-gradient(135deg, #ff9800, #ff5722)";
                } else {
                    if (btn) btn.disabled = false;
                    if (targetBlock.children[0]?.children[0]) {
                        targetBlock.children[0].children[0].style.border = "";
                        targetBlock.children[0].children[0].style.background = "";
                    }
                    existing.textContent = "☑️ Есть тег";
                    existing.style.background = "linear-gradient(135deg, #4caf50, #087f23)";
                }
            } catch (e) {
                // Молча глотаем ошибки в цикле, чтобы скрипт не умер
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