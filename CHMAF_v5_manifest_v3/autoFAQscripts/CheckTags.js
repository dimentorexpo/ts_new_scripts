// Вспомогательные функции ожидания
function waitForIframe() {
    return new Promise(resolve => {
        const check = setInterval(() => {
            const iframeNew = document.querySelector('[class^="NEW_FRONTEND__frame"]');
            if (iframeNew) {
                const iframeDocument = iframeNew.contentDocument || iframeNew.contentWindow.document;
                if (iframeDocument) {
                    clearInterval(check);
                    resolve(iframeDocument);
                }
            }
        }, 500);
    });
}

function waitForOpSection() {
    return new Promise(resolve => {
        const check = setInterval(() => {
            const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
            if (!iframe || !iframe.contentDocument) return;

            const sectionKey = iframe.contentDocument.querySelector('span[id^="mantine-"][id$="-target"]');
            if (!sectionKey) return;

            const operGroup = sectionKey.textContent.split('-')[0];
            if (operGroup === "ТП") {
                clearInterval(check);
                resolve(true);
            }
        }, 300);
    });
}

// === МОДУЛЬ 1: DRAG & DROP И СОРТИРОВКА ===
function initDragAndDropAndSorting(iframeDoc) {
    const container = iframeDoc.querySelector('.Operator_DialogsList__4Q5tH');
    if (!container) return;

    // Внедряем уникальные стили (Glassmorphism для закрепленных)
    const style = iframeDoc.createElement('style');
    style.textContent = `
        /* Стили для закрепленной карточки (Glassmorphism) */
        .skyeng-mod-pinned {
            position: relative;
            background: rgba(255, 152, 0, 0.08) !important;
            backdrop-filter: blur(8px) saturate(120%);
            -webkit-backdrop-filter: blur(8px) saturate(120%);
            border-left: 4px solid rgba(255, 152, 0, 0.8) !important;
            box-shadow: inset 0 0 15px rgba(255, 152, 0, 0.05), 0 4px 10px rgba(0,0,0,0.1) !important;
            transition: all 0.3s ease;
        }
        /* Иконка булавки в углу */
        .skyeng-mod-pinned::after {
            content: '📌';
            position: absolute;
            top: 5px;
            right: 5px;
            font-size: 14px;
            opacity: 0.8;
            filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));
            pointer-events: none;
        }
        /* Тег проверки */
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
    iframeDoc.head.appendChild(style);

    const pinnedDialogs = new Set();
    let isDragging = false;
    let draggedItem = null;
    let listObserver = null; // Заранее объявляем, чтобы избежать ReferenceError

    function getSecondsFromCard(card) {
        const timerEls = Array.from(card.querySelectorAll('.DialogsCard_Timer__XBR_3'));
        const timerEl = timerEls.find(el => el.textContent.includes(':'));
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
        card.classList.add('skyeng-mod-pinned');
        card.title = "📌 Закреплено вручную. Двойной клик для возврата к авто-сортировке.";

        if (!card.dataset.dblClickInit) {
            card.dataset.dblClickInit = "true";
            card.addEventListener('dblclick', function () {
                pinnedDialogs.delete(convId);
                card.classList.remove('skyeng-mod-pinned');
                card.title = '';
                sortDialogs();
            });
        }
    }

    function sortDialogs() {
        if (isDragging) return;

        const dialogs = Array.from(container.querySelectorAll('.DialogsCard_Card__dU57S'));
        const pinnedMap = new Map();
        const autoDialogs = [];

        dialogs.forEach((dialog, index) => {
            const convId = dialog.dataset.convId;
            if (convId && pinnedDialogs.has(convId)) {
                pinnedMap.set(index, dialog);
            } else {
                autoDialogs.push(dialog);
            }
        });

        autoDialogs.sort((a, b) => getSecondsFromCard(a) - getSecondsFromCard(b));

        const finalOrder = [];
        let autoIndex = 0;
        for (let i = 0; i < dialogs.length; i++) {
            if (pinnedMap.has(i)) {
                finalOrder.push(pinnedMap.get(i));
            } else {
                finalOrder.push(autoDialogs[autoIndex]);
                autoIndex++;
            }
        }

        let orderChanged = false;
        for (let i = 0; i < finalOrder.length; i++) {
            if (dialogs[i] !== finalOrder[i]) {
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
            this.style.cursor = 'grabbing';
            setTimeout(() => this.style.opacity = '0.4', 0);
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', function () {
            draggedItem = null;
            this.style.opacity = '1';
            this.style.cursor = 'grab';

            const convId = this.dataset.convId;
            if (convId && !pinnedDialogs.has(convId)) {
                pinnedDialogs.add(convId);
                applyPinVisuals(this, convId);
            }

            isDragging = false;
            sortDialogs();
        });

        card.addEventListener('dragover', function (e) {
            e.preventDefault();
            if (this === draggedItem || !draggedItem) return;

            const bounding = this.getBoundingClientRect();
            const offset = bounding.y + (bounding.height / 2);

            if (e.clientY - offset > 0) {
                if (this.nextSibling !== draggedItem) this.after(draggedItem);
            } else {
                if (this.previousSibling !== draggedItem) this.before(draggedItem);
            }
        });
    }

    container.querySelectorAll('.DialogsCard_Card__dU57S').forEach(card => {
        initDraggable(card);
        const convId = card.dataset.convId;
        if (convId && pinnedDialogs.has(convId)) {
            applyPinVisuals(card, convId);
        }
    });

    // Инициализируем observer ДО первого вызова sortDialogs
    listObserver = new MutationObserver((mutations) => {
        let needsSort = false;
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1 && node.classList.contains('DialogsCard_Card__dU57S')) {
                    initDraggable(node);
                    const convId = node.dataset.convId;
                    if (convId && pinnedDialogs.has(convId)) {
                        applyPinVisuals(node, convId);
                    }
                    needsSort = true;
                }
            });
        });

        if (needsSort && !isDragging) {
            setTimeout(sortDialogs, 100);
        }
    });

    listObserver.observe(container, { childList: true, subtree: true });
    sortDialogs(); // Первичная сортировка

    // Фоновая сортировка каждые 3 секунды
    setInterval(() => {
        if (!isDragging) sortDialogs();
    }, 3000);

    console.log('🚀 Drag & Drop модуль запущен!');
}


// === МОДУЛЬ 2: ПРОВЕРКА ТЕГОВ ===
function initTagChecker(iframeDoc) {
    setInterval(() => {
        try {
            const wrappers = iframeDoc.querySelectorAll('#__next div[class*="List_ListWrapper"]');
            let targetBlock = null;

            wrappers.forEach(wrap => {
                if (wrap.innerText.includes("Выбор тегов")) targetBlock = wrap;
            });

            if (!targetBlock) return; // Если блока сейчас нет - просто ждем следующего тика

            const btn = iframeDoc.querySelector('button[title="Закрыть"]');
            const urlParts = iframeDoc.location ? iframeDoc.location.pathname.split('/') : window.location.pathname.split('/');
            const currentConvId = urlParts[urlParts.length - 1]; // Берем последний кусок URL

            const convElement = iframeDoc.querySelector(`[data-conv-id="${currentConvId}"]`);
            if (!convElement) return;

            let existing = convElement.querySelector('[data-my-tag="no-tag"]');
            if (!existing) {
                existing = document.createElement('span');
                existing.setAttribute("data-my-tag", "no-tag");
                existing.classList.add('skyeng-mod-tag'); // Юзаем наш CSS-класс
                convElement.append(existing);
            }

            const text = targetBlock.innerText.trim();
            if (text.includes("Пусто")) {
                if (btn) btn.disabled = true;
                // Подсвечиваем блок тегов красным
                if (targetBlock.children[0] && targetBlock.children[0].children[0]) {
                    targetBlock.children[0].children[0].style.border = "2px solid firebrick";
                    targetBlock.children[0].children[0].style.background = "rgba(178,34,34, 0.1)";
                }

                existing.textContent = "❌ Нет тега";
                existing.style.background = "linear-gradient(135deg, #ff9800, #ff5722)";
            } else {
                if (btn) btn.disabled = false;
                // Убираем красную подсветку
                if (targetBlock.children[0] && targetBlock.children[0].children[0]) {
                    targetBlock.children[0].children[0].style.border = "";
                    targetBlock.children[0].children[0].style.background = "";
                }

                existing.textContent = "☑️ Есть тег";
                existing.style.background = "linear-gradient(135deg, #4caf50, #087f23)";
            }
        } catch (e) {
            // Ошибки чтения DOM игнорируем, чтобы не спамить в консоль при переходе между страницами
        }
    }, 1500); // Проверяем теги раз в 1.5 секунды
    console.log('🚀 Модуль проверки тегов запущен!');
}


// === ТОЧКА ВХОДА (MAIN) ===
(async function startWhenReady() {
    await waitForOpSection();
    console.log("✅ opsection = ТП, инициализируем скрипты...");

    const iframeDocument = await waitForIframe();

    // Запускаем каждый модуль один раз. Они сами внутри создадут нужные фоновые интервалы.
    initDragAndDropAndSorting(iframeDocument);
    initTagChecker(iframeDocument);
})();