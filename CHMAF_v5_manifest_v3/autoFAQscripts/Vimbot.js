(function () {
    'use strict';

    const WINDOW_ID = 'AF_Vimbot';
    const MAX_WAIT_TIME = 5000;
    const CHECK_INTERVAL = 100;

    function notify(message, type = 'info') {
        if (typeof createAndShowButton === 'function') {
            // Тип передаём дальше: раньше ошибки показывались обычным серым сообщением
            createAndShowButton(message, type);
        } else {
            console.log(`[Vimbot] ${message}`);
        }
    }

    function initVimbot() {
        if (typeof createWindow !== 'function') return;

        const win_VimbotMenu = `
        <div class="vimbot-glass">
            <div class="vimbot-warning-bar chmaf-drag-handle"></div>

            <div class="chmaf-drag-handle" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; margin-top: 5px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="vimbot-icon-chip">💬</div>
                    <div>
                        <div class="vimbot-title">Vimbot</div>
                        <div class="vimbot-subtitle">Chat Support Integration</div>
                    </div>
                </div>
                <div style="display:flex; gap: 8px;">
                    <button class="vimbot-btn" id="clearVimbotMenu" title="Очистить всё">🧹</button>
                    <button class="vimbot-btn vimbot-btn-danger" id="hideVimbot" title="Закрыть">✕</button>
                </div>
            </div>

            <input class="vimbot-input" id="uIdToVimbot" placeholder="Введите ID студента" style="text-align: center; margin-bottom: 12px;">

            <div style="display:flex; gap: 8px; margin-bottom: 12px;">
                <button class="vimbot-btn primary" id="sendToVimbotFromCRM" style="flex: 1;">
                    <span style="font-size:16px">💬</span> Отправить сообщение
                </button>
                <button class="vimbot-btn" id="GetTexttmplt" title="Вставить текст из CRM" style="width: 45px; font-size: 16px;">⤵️</button>
            </div>

            <div id="chattype" class="vimbot-status"></div>

            <textarea class="vimbot-input" id="textToVimbotSend"
                style="height: 110px; resize: none; line-height: 1.5;"
                placeholder="Текст сообщения..."></textarea>

            <div style="display:flex; align-items:center; justify-content:space-between; margin-top: 10px;">
                <div style="font-size: 10px; letter-spacing: 1px; color: rgba(255,255,255,0.35); text-transform: uppercase;">Vimbot Integration</div>
                <div class="vimbot-version">v2.0</div>
            </div>
        </div>`;

        let wintVimbot = document.getElementById(WINDOW_ID);
        if (!wintVimbot) {
            wintVimbot = createWindow(WINDOW_ID, 'winTopVimbot', 'winLeftVimbot', win_VimbotMenu);
        }

        if (!wintVimbot) return;
        wintVimbot.style.display = 'none';
        wintVimbot.style.background = 'transparent';
        wintVimbot.style.border = 'none';

        const UI = {
            win: wintVimbot,
            hideBtn: wintVimbot.querySelector('#hideVimbot'),
            clearBtn: wintVimbot.querySelector('#clearVimbotMenu'),
            sendBtn: wintVimbot.querySelector('#sendToVimbotFromCRM'),
            getTmpltBtn: wintVimbot.querySelector('#GetTexttmplt'),
            uIdInput: wintVimbot.querySelector('#uIdToVimbot'),
            textArea: wintVimbot.querySelector('#textToVimbotSend'),
            chatStatus: wintVimbot.querySelector('#chattype'),
            idStudentInput: document.getElementById('idstudent'),
            tmpltInput: document.getElementById('inp'),
            openUserBtn: document.getElementById('openVimbotWindowsUserinfo'),
            openWinBtn: document.getElementById('openVimbotWindows')
        };

        const setStatus = (text, color = '#feca57') => {
            if (!text) {
                UI.chatStatus.style.display = 'none';
                return;
            }
            UI.chatStatus.style.display = 'block';
            UI.chatStatus.textContent = text;
            UI.chatStatus.style.color = color;
            UI.chatStatus.style.border = `1px solid ${color}44`;
        };

        let checkTimeout;
        let checkRequestId = 0;
        let chatAvailable = null; // true / false / null — неизвестно
        const checkChatStatus = (userId) => {
            if (!userId || userId.length < 4) return;
            setStatus("🔍 Проверка каналов связи...", "#feca57");
            chatAvailable = null;

            // Ответ проверки предыдущего ID не должен перетереть статус нового
            const requestId = ++checkRequestId;

            const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/users/${userId}/channels`;
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions: { method: "GET", credentials: "include" } }, (response) => {
                if (requestId !== checkRequestId) return;
                if (!response?.success) return setStatus("❌ Ошибка соединения", "#ff6b6b");
                try {
                    const data = JSON.parse(response.fetchansver);
                    const hasSupport = data.data?.some(item => item.label === "Support chat");
                    chatAvailable = !!hasSupport;
                    if (hasSupport) {
                        setStatus("Чат доступен ✅", "#1dd1a1");
                    } else {
                        setStatus("Чат не найден ❌", "#ff6b6b");
                    }
                } catch (e) {
                    setStatus("⚠️ Ошибка данных", "#ff6b6b");
                }
            });
        };

        const sendMessage = async () => {
            const userId = UI.uIdInput.value.trim();
            const text = UI.textArea.value.trim();

            if (!userId || userId.length < 4) return notify('Введите ID пользователя', 'error');
            if (!text) return notify('Введите текст сообщения', 'error');
            if (chatAvailable === false &&
                !confirm('У пользователя не найден чат поддержки. Всё равно отправить?')) return;

            UI.sendBtn.disabled = true;
            UI.sendBtn.style.opacity = "0.6";
            UI.sendBtn.textContent = "Отправка...";

            const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/send/from-bot`;
            const requestOptions = {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    chatType: "customer_support",
                    recipientId: Number(userId),
                    text: text,
                    attachments: []
                })
            };

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, (response) => {
                void chrome.runtime.lastError; // гасим «Unchecked runtime.lastError»
                UI.sendBtn.disabled = false;
                UI.sendBtn.style.opacity = "1";
                UI.sendBtn.textContent = "💬 Отправить сообщение";
                if (response?.success) {
                    notify('✅ Успешно отправлено!', 'success');
                    UI.textArea.value = '';
                } else {
                    notify('❌ Ошибка при отправке', 'error');
                }
            });
        };

        UI.uIdInput.addEventListener('input', () => {
            UI.uIdInput.value = UI.uIdInput.value.replace(/\D/g, '');
            clearTimeout(checkTimeout);
            if (UI.uIdInput.value.length > 3) {
                checkTimeout = setTimeout(() => checkChatStatus(UI.uIdInput.value), 800);
            } else {
                setStatus(null);
            }
        });

        UI.getTmpltBtn.addEventListener('click', () => {
            if (UI.tmpltInput?.value) {
                UI.textArea.value = UI.tmpltInput.value;
            } else {
                notify('Поле шаблона в CRM пустое', 'info');
            }
        });

        UI.clearBtn.addEventListener('click', () => {
            UI.uIdInput.value = '';
            UI.textArea.value = '';
            setStatus(null);
        });

        UI.sendBtn.addEventListener('click', sendMessage);
        UI.hideBtn.addEventListener('click', () => UI.win.style.display = 'none');

        if (UI.openWinBtn) UI.openWinBtn.addEventListener('click', () => UI.win.style.display = 'block');

        if (UI.openUserBtn) {
            UI.openUserBtn.addEventListener('click', () => {
                const sId = UI.idStudentInput?.value.trim();
                UI.win.style.display = 'block';
                if (sId) {
                    UI.uIdInput.value = sId;
                    checkChatStatus(sId);
                } else {
                    // Раньше без ID в поле услуг кнопка молча ничего не делала
                    UI.uIdInput.focus();
                }
            });
        }
    }

    let attempts = 0;
    const intervalId = setInterval(() => {
        attempts++;
        if (typeof createWindow === 'function') {
            clearInterval(intervalId);
            initVimbot();
        } else if (attempts * CHECK_INTERVAL > MAX_WAIT_TIME) {
            clearInterval(intervalId);
        }
    }, CHECK_INTERVAL);

})();