(function () {
    'use strict';

    const WINDOW_ID = 'AF_Vimbot';
    const MAX_WAIT_TIME = 5000;
    const CHECK_INTERVAL = 100;

    function notify(message, type = 'info') {
        if (typeof createAndShowButton === 'function') {
            createAndShowButton(message);
        } else {
            console.log(`[Vimbot] ${message}`);
        }
    }

    function initVimbot() {
        if (typeof createWindow !== 'function') return;

        const win_VimbotMenu = `
        <div class="vimbot-glass">
            <div class="vimbot-warning-bar"></div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px; margin-top: 5px;">
                <span style="font-size: 11px; font-weight: bold; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1.5px;">Vimbot Chat Support</span>
                <div style="display:flex; gap: 8px;">
                    <button class="vimbot-btn" id="clearVimbotMenu" title="Очистить всё">🧹</button>
                    <button class="vimbot-btn" id="hideVimbot" style="background: rgba(211, 47, 47, 0.3); border-color: rgba(211, 47, 47, 0.2);">✕</button>
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

            <div style="text-align: right; margin-top: 8px; font-size: 10px; color: rgba(255,255,255,0.3);">
                Vimbot Integration v2.0
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
        const checkChatStatus = (userId) => {
            if (!userId || userId.length < 4) return;
            setStatus("🔍 Проверка каналов связи...", "#feca57");

            const fetchURL = `https://communications.skyeng.ru/gateway/widget/vimbot/users/${userId}/channels`;
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions: { method: "GET", credentials: "include" } }, (response) => {
                if (!response?.success) return setStatus("❌ Ошибка соединения", "#ff6b6b");
                try {
                    const data = JSON.parse(response.fetchansver);
                    const hasSupport = data.data?.some(item => item.label === "Support chat");
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
                UI.sendBtn.disabled = false;
                UI.sendBtn.style.opacity = "1";
                UI.sendBtn.textContent = "💬 Отправить сообщение";
                if (response?.success) {
                    notify('✅ Успешно отправлено!');
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
                if (sId) {
                    UI.win.style.display = 'block';
                    UI.uIdInput.value = sId;
                    checkChatStatus(sId);
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