// Обертка, чтобы не засорять глобальный скоуп
(function () {
    'use strict';

    // --- КОНФИГУРАЦИЯ ---
    const WINDOW_ID = 'AF_Vimbot';
    const MAX_WAIT_TIME = 2000; // Ждать появления createWindow не более 2 секунд
    const CHECK_INTERVAL = 100; // Проверять каждые 100 мс

    // --- ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ ---
    function initVimbot() {
        console.log(`[Vimbot] Попытка инициализации...`);

        // 1. ПРОВЕРКА ЗАВИСИМОСТЕЙ
        if (typeof createWindow !== 'function') {
            console.error(`[Vimbot] Функция createWindow не найдена. Скрипт content.js, вероятно, еще не загружен.`);
            // Мы не выходим, а будем ждать. Но если хочешь выйти сразу - раскомментируй return;
        }

        if (!document.body) {
            console.error(`[Vimbot] document.body не найден. Это невозможно, но вдруг.`);
            return;
        }

        // 2. HTML ШАБЛОН ОКНА
        // exttheme может быть не определена, поэтому используем безопасный доступ
        const themeClass = (typeof exttheme !== 'undefined' && exttheme) ? exttheme : 'ext-theme-default';

        const win_VimbotMenu = `
        <div style="max-height:250px; width:400px; cursor:grab; background: #2c3e50; color: white; padding: 10px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 5px;">
                <button class="mainButton buttonHide" id="hideVimbot" style="padding: 2px 8px; font-size: 12px;">hide</button>
                <button class="mainButton smallbtn" id="clearVimbotMenu" style="padding: 2px 8px; font-size: 12px;">🧹</button>
                <label style="font-weight: bold; font-size: 14px; background: transparent; color:bisque">Vimbot - отправка текста в Support Chat</label>
            </div>
            <input class="${themeClass}" id="uIdToVimbot" style="width: 100%; margin:5px 0; text-align:center; border-radius: 20px; padding: 5px; box-sizing: border-box;" placeholder="User ID">
            <div style="display:flex; gap:5px;">
                <button class="mainButton" id="sendToVimbotFromCRM" style="flex:1; font-size: 16px; padding: 5px;">💬 Отправить</button>
                <button class="mainButton" id="GetTexttmplt" style="flex:0 0 30px; font-size: 16px; padding: 5px;" title="Вставлят в поле для ввода текста набранный текст из самого расширения">⤵️</button>
            </div>
            <p id="chattype" style="color: #f1c40f; text-align:center; font-size: 16px; margin: 5px 0; display: none;"></p>
            <textarea class="${themeClass}" style="height:80px; width:100%; margin:5px 0; resize: vertical; box-sizing: border-box;" id="textToVimbotSend" placeholder="Введите текст для оптравки пользователю"></textarea>
        </div>`;

        // 3. СОЗДАНИЕ ОКНА
        // Проверяем, не создали ли мы его уже ранее (например, при перезагрузке скрипта)
        let wintVimbot = document.getElementById(WINDOW_ID);
        if (wintVimbot) {
            console.log(`[Vimbot] Окно ${WINDOW_ID} уже существует. Используем его.`);
        } else {
            console.log(`[Vimbot] Создаем новое окно ${WINDOW_ID}...`);
            if (typeof createWindow !== 'function') {
                console.error(`[Vimbot] Не могу создать окно: createWindow не является функцией.`);
                return;
            }
            wintVimbot = createWindow(WINDOW_ID, 'winTopVimbot', 'winLeftVimbot', win_VimbotMenu);
        }

        if (!wintVimbot) {
            console.error(`[Vimbot] Критическая ошибка: Окно не было создано или не найдено в DOM.`);
            return;
        }

        // Убедимся, что окно скрыто по умолчанию
        wintVimbot.style.display = 'none';

        // 4. КЭШИРОВАНИЕ ЭЛЕМЕНТОВ (Ищем внутри окна для надежности)
        const elements = {
            win: wintVimbot,
            hideBtn: wintVimbot.querySelector('#hideVimbot'),
            clearBtn: wintVimbot.querySelector('#clearVimbotMenu'),
            sendBtn: wintVimbot.querySelector('#sendToVimbotFromCRM'),
            getTmpltBtn: wintVimbot.querySelector('#GetTexttmplt'),
            openWinBtn: document.getElementById('openVimbotWindows'), // Внешняя кнопка
            openUserBtn: document.getElementById('openVimbotWindowsUserinfo'), // Внешняя кнопка
            uIdInput: wintVimbot.querySelector('#uIdToVimbot'),
            textArea: wintVimbot.querySelector('#textToVimbotSend'),
            chatType: wintVimbot.querySelector('#chattype'),
            idStudentInput: document.getElementById('idstudent'),
            tmpltInput: document.getElementById('inp')
        };

        // Проверка критических элементов
        if (!elements.openWinBtn) {
            console.warn(`[Vimbot] Кнопка 'openVimbotWindows' не найдена на странице. Окно можно будет открыть только программно или через другую кнопку.`);
        }
        if (!elements.uIdInput || !elements.sendBtn) {
            console.error(`[Vimbot] Внутренние элементы окна (input/btn) не найдены. Проверьте HTML шаблон.`);
            return;
        }

        console.log(`[Vimbot] Все элементы найдены. Окно создано:`, wintVimbot);

        // 5. ЛОГИКА ПРИЛОЖЕНИЯ
        const showNotification = (message, type = 'info') => {
            console.log(`[Vimbot ${type}] ${message}`);
            createAndShowButton('✅Отправлено');
        };

        const toggleWindow = () => {
            if (!wintVimbot) return;
            const isHidden = wintVimbot.style.display === 'none' || wintVimbot.style.display === '';
            wintVimbot.style.display = isHidden ? 'block' : 'none';
        };

        const clearForm = () => {
            elements.uIdInput.value = '';
            elements.textArea.value = '';
            elements.chatType.style.display = 'none';
            elements.chatType.textContent = '';
        };

        let debounceTimer;
        const checkchattype = (usrID) => {
            if (!usrID || usrID.length <= 3) return;
            const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/users/${usrID}/channels`;
            const requestOptions = { method: "GET", credentials: "include" };
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, (response) => {
                if (!response?.success) return showNotification('Ошибка проверки чата', 'error');
                try {
                    const data = JSON.parse(response.fetchansver);
                    const hasSupport = data.data.some(item => item.label === "Support chat");
                    elements.chatType.textContent = hasSupport ? "Support chat✅" : "Нет Support chat❌";
                    elements.chatType.style.display = "block";
                } catch (error) {
                    console.error("Ошибка парсинга ответа чата:", error);
                }
            });
        };

        const handleIdInput = () => {
            elements.uIdInput.value = elements.uIdInput.value.replace(/\D/g, '');
            if (elements.chatType.style.display !== 'none') {
                elements.chatType.style.display = 'none';
                elements.chatType.textContent = '';
            }
            clearTimeout(debounceTimer);
            const usrID = elements.uIdInput.value.trim();
            if (usrID.length > 3) {
                debounceTimer = setTimeout(() => checkchattype(usrID), 500);
            }
        };

        const handlePasteDrop = (e) => {
            e.preventDefault();
            const pastedValue = (e.clipboardData || e.dataTransfer).getData('text').trim();
            if (/^\d+$/.test(pastedValue)) {
                elements.uIdInput.value = pastedValue;
                handleIdInput();
            }
        };

        const sendMessage = () => {
            const usrIDraw = elements.uIdInput.value.trim();
            const recipientId = Number(usrIDraw);
            const textTosent = elements.textArea.value.trim();
            const isSupportChat = elements.chatType.textContent === "Support chat✅";

            if (!Number.isFinite(recipientId) || usrIDraw.length <= 3) return showNotification('Некорректный ID', 'error');
            if (!textTosent || !isSupportChat) return showNotification('Проверьте текст и статус чата', 'error');

            const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/send/from-bot`;
            const requestOptions = {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
                body: JSON.stringify({ chatType: "customer_support", recipientId, text: textTosent, attachments: [] })
            };
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, (response) => {
                if (!response?.success) return showNotification('Не удалось отправить', 'error');
                showNotification('✅ Отправлено', 'success');
                clearForm();
            });
        };

        const getTemplate = () => {
            if (elements.tmpltInput?.value) {
                elements.textArea.value = elements.tmpltInput.value;
                elements.tmpltInput.value = "";
            }
        };

        const openByStudentId = () => {
            const studentId = elements.idStudentInput?.value.trim();
            if (studentId && elements.openWinBtn) {
                elements.openWinBtn.click();
                elements.uIdInput.value = studentId;
                handleIdInput();
            }
        };

        // 6. НАЗНАЧЕНИЕ СОБЫТИЙ
        const attachListeners = () => {
            if (elements.openWinBtn && !elements.openWinBtn.hasAttribute('data-vimbot-listener')) {
                elements.openWinBtn.addEventListener('click', toggleWindow);
                elements.openWinBtn.setAttribute('data-vimbot-listener', 'true');
            }
            elements.hideBtn?.addEventListener('click', toggleWindow);
            elements.clearBtn?.addEventListener('click', clearForm);
            elements.getTmpltBtn?.addEventListener('click', getTemplate);
            elements.sendBtn?.addEventListener('click', sendMessage);
            elements.openUserBtn?.addEventListener('click', openByStudentId);
            elements.uIdInput?.addEventListener('input', handleIdInput);
            elements.uIdInput?.addEventListener('paste', handlePasteDrop);
            elements.uIdInput?.addEventListener('drop', handlePasteDrop);
        };

        attachListeners();
        console.log(`[Vimbot] Инициализация завершена. Слушатели событий прикреплены.`);
    }

    // --- ЗАПУСК С ОЖИДАНИЕМ ---
    let attempts = 0;
    const intervalId = setInterval(() => {
        attempts++;
        if (typeof createWindow === 'function') {
            clearInterval(intervalId);
            initVimbot();
        } else if (attempts * CHECK_INTERVAL > MAX_WAIT_TIME) {
            clearInterval(intervalId);
            console.error(`[Vimbot] Тайм-аут: Функция createWindow не появилась за ${MAX_WAIT_TIME / 1000} сек.`);
        }
    }, CHECK_INTERVAL);

})();