// Премиальные стили: Sleek Dark Mode & Neon Accents
const fz_styles = `
<style>
    .fz-container {
        display: flex; flex-direction: column; width: 420px;
        background: linear-gradient(145deg, #13151a, #1c1f26);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        border-radius: 16px; padding: 18px; color: #e2e8f0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-sizing: border-box; transition: all 0.3s ease;
    }
    .fz-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 16px; padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06); cursor: grab;
    }
    .fz-header:active { cursor: grabbing; }
    .fz-title { font-size: 14px; font-weight: 600; color: #94a3b8; letter-spacing: 0.5px; text-transform: uppercase; }

    .fz-btn {
        background: #272a33; border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px; color: #a1a1aa; cursor: pointer;
        padding: 6px 12px; font-size: 13px; font-weight: 600;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    }
    .fz-btn:hover { background: #323642; color: #fff; border-color: rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
    .fz-btn:active { transform: scale(0.96); }
    .fz-btn-icon { padding: 6px 10px; font-size: 14px; }

    .fz-input-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .fz-input, .fz-textarea {
        background: #090a0c; border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px; color: #f8fafc; padding: 12px 16px; outline: none;
        transition: all 0.3s ease; width: 100%; box-sizing: border-box;
        font-size: 14px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }
    .fz-input::placeholder, .fz-textarea::placeholder { color: #475569; }
    .fz-input:focus, .fz-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2), inset 0 2px 4px rgba(0,0,0,0.3); }
    .fz-textarea { resize: vertical; min-height: 70px; font-family: inherit; }

    .fz-action-row { display: flex; gap: 12px; align-items: center; }

    /* Кастомный степпер времени (решение проблемы бага с протяжкой) */
    .fz-stepper {
        display: flex; align-items: center; background: #090a0c;
        border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px;
        padding: 4px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
    }
    .fz-stepper-btn {
        background: transparent; border: none; color: #64748b;
        width: 32px; height: 32px; border-radius: 6px; cursor: pointer;
        font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center;
        transition: 0.2s;
    }
    .fz-stepper-btn:hover { background: #272a33; color: #fff; }
    .fz-stepper-val {
        width: 36px; text-align: center; background: transparent; border: none;
        color: #fff; font-size: 16px; font-weight: 700; outline: none; pointer-events: none;
    }
    .fz-stepper-label { color: #64748b; font-size: 13px; margin-right: 12px; font-weight: 600; user-select: none; }

    .fz-btn-primary {
        flex: 1; background: linear-gradient(135deg, #2563eb, #4f46e5);
        color: #fff; border: none; padding: 0 16px; height: 42px; border-radius: 10px;
        font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.25), inset 0 1px 0 rgba(255,255,255,0.2);
        transition: all 0.3s ease; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .fz-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255,255,255,0.2); }
    .fz-btn-primary:active { transform: translateY(1px); }

    .fz-list {
        max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;
        padding-right: 4px; margin-top: 16px;
    }
    .fz-list::-webkit-scrollbar { width: 5px; }
    .fz-list::-webkit-scrollbar-track { background: #090a0c; border-radius: 4px; }
    .fz-list::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
    .fz-list::-webkit-scrollbar-thumb:hover { background: #52525b; }

    .fz-item {
        display: flex; justify-content: space-between; align-items: center;
        background: rgba(255, 255, 255, 0.02); padding: 12px 14px;
        border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.04);
        transition: all 0.2s;
    }
    .fz-item:hover { background: rgba(255, 255, 255, 0.04); border-color: rgba(255, 255, 255, 0.08); transform: translateX(2px); }
    .fz-item-hash { font-size: 13px; color: #94a3b8; font-family: monospace; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 150px; }
    .fz-item-timer {
        font-family: monospace; font-size: 14px; font-weight: 700;
        color: #60a5fa; background: #0f172a; padding: 4px 10px; border-radius: 6px;
        border: 1px solid rgba(96, 165, 250, 0.15); box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
    }
    .fz-del-btn {
        background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2);
        color: #f87171; padding: 6px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: 0.2s;
        display: flex; align-items: center; justify-content: center;
    }
    .fz-del-btn:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #fff; }
</style>
`;

var win_FrozeChat = fz_styles + `
<div class="fz-container">
    <div class="fz-header" id="froze_chat_header">
        <span class="fz-title">Auto-Reply Timer</span>
        <div style="display:flex; gap: 8px;">
            <button class="fz-btn fz-btn-icon" id="clearallchathash" title="Очистить все таймеры">Очистить</button>
            <button class="fz-btn fz-btn-icon" id="arinfo" title="Инфо">ℹ</button>
            <button class="fz-btn fz-btn-icon" id="hidefrozechat" title="Скрыть">✕</button>
        </div>
    </div>

    <div class="fz-input-group">
        <input id="chatfrozehash" class="fz-input" placeholder="Хэш чата (или ссылка)..." autocomplete="off" type="text">
        <textarea id="chatfrozemsg" class="fz-textarea" placeholder="Свой текст ответа (опционально)..." autocomplete="off"></textarea>
    </div>

    <div class="fz-action-row">
        <div class="fz-stepper">
            <button class="fz-stepper-btn" id="fz-timer-minus">−</button>
            <input id="frozetimer" class="fz-stepper-val" value="6" type="text" readonly>
            <button class="fz-stepper-btn" id="fz-timer-plus">+</button>
        </div>
        <span class="fz-stepper-label">MIN</span>

        <button class="fz-btn-primary" id="freezechat" title="Запустить таймер">
            <span>⚡ Запустить</span>
        </button>
    </div>

    <div id="chats_hash_box" style="width: 100%;">
        <div id="chathastable" class="fz-list"></div>
    </div>
</div>`;

// Создаем окно через ваши внешние функции
const wintFrozeChat = createWindow('AF_FrozeChat', 'winTopFrozeChat', 'winLeftFrozeChat', win_FrozeChat);
hideWindowOnDoubleClick('AF_FrozeChat');
hideWindowOnClick('AF_FrozeChat', 'hidefrozechat');

function getbutFrozeChatButtonPress() {
    // Безопасное хранилище (решает проблему дублирования и утечки памяти)
    window.__FrozeChatState = window.__FrozeChatState || {
        chats: new Map(),
        timeouts: new Map(),
        intervals: new Map(),
        isInitialized: false
    };

    const state = window.__FrozeChatState;
    const DEFAULT_RESPONSE = 'Извините за ожидание! Мне нужно еще немного времени, но я уже почти готов с ответом. Спасибо за ваше понимание! 🙏😊';
    const TIMER_UPDATE_INTERVAL = 1000;

    const chatWindow = document.getElementById('AF_FrozeChat');
    if (chatWindow.style.display === 'none' || chatWindow.style.display === '') {
        chatWindow.style.display = 'block';
        const myMenu = document.getElementById('idmymenu');
        if (myMenu) myMenu.style.display = 'none';
        const mainBtn = document.getElementById('MainMenuBtn');
        if (mainBtn) mainBtn.classList.remove('activeScriptBtn');
    } else {
        chatWindow.style.display = 'none';
    }

    if (!state.isInitialized) {

        document.getElementById('hidefrozechat').addEventListener('click', () => {
            chatWindow.style.display = 'none';
        });

        document.getElementById('clearallchathash').addEventListener('click', () => {
            for (const [hash, data] of state.timeouts) {
                clearTimeout(data.timeoutId);
                clearInterval(state.intervals.get(hash));
            }
            state.chats.clear();
            state.timeouts.clear();
            state.intervals.clear();
            updateChatsList();
        });

        // Логика кастомного безопасного степпера (нет бага перетаскивания)
        const timerInput = document.getElementById('frozetimer');
        document.getElementById('fz-timer-minus').addEventListener('click', () => {
            let val = parseInt(timerInput.value, 10) || 0;
            if (val > 0) timerInput.value = val - 1;
        });
        document.getElementById('fz-timer-plus').addEventListener('click', () => {
            let val = parseInt(timerInput.value, 10) || 0;
            if (val < 59) timerInput.value = val + 1;
        });

        document.getElementById('freezechat').addEventListener('click', async () => {
            const hashInput = document.getElementById('chatfrozehash').value.trim();
            if (!hashInput) {
                return createAndShowButton('Не введен хеш чата!', 'error');
            }

            const extractHash = (input) => {
                const parts = input.split('/');
                if (parts.length === 1) return parts[0];
                if (parts[3] === 'logs') return parts[4];
                if (parts[4] === 'assigned') return parts[5];
                return input;
            };

            const chatHash = extractHash(hashInput);
            const customMessage = document.getElementById('chatfrozemsg').value || DEFAULT_RESPONSE;
            const durationInput = parseInt(document.getElementById('frozetimer').value, 10) || 0;
            const duration = durationInput * 60 * 1000;

            if (state.chats.has(chatHash)) {
                return createAndShowButton('Таймер для этого чата уже запущен', 'warning');
            }

            try {
                const sessionId = await getsesid(chatHash);

                const timerData = {
                    message: customMessage,
                    sessionId: sessionId,
                    endTime: Date.now() + duration,
                    cancelled: false
                };

                state.chats.set(chatHash, timerData);

                const timeoutId = setTimeout(async () => {
                    const currentData = state.timeouts.get(chatHash);
                    if (currentData && !currentData.cancelled) {
                        await sendMessage(currentData.sessionId, chatHash, currentData.message);
                        cancelTimer(chatHash);
                    }
                }, duration);

                state.timeouts.set(chatHash, { timeoutId, ...timerData });

                const intervalId = setInterval(() => {
                    const currentData = state.timeouts.get(chatHash);
                    if (!currentData || currentData.cancelled) {
                        clearInterval(intervalId);
                        return;
                    }

                    const remaining = timerData.endTime - Date.now();
                    if (remaining <= 0) {
                        clearInterval(intervalId);
                    } else {
                        updateTimerDisplay(chatHash, remaining);
                    }
                }, TIMER_UPDATE_INTERVAL);

                state.intervals.set(chatHash, intervalId);

                updateChatsList();
                document.getElementById('chatfrozehash').value = '';
                document.getElementById('chatfrozemsg').value = '';

            } catch (error) {
                console.error('Failed to initialize timer:', error);
                createAndShowButton('Ошибка при инициализации таймера', 'error');
            }
        });

        state.isInitialized = true;
    }

    function updateTimerDisplay(hash, remaining) {
        const element = document.querySelector(`[data-hash="${hash}"] .fz-item-timer`);
        if (element) {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            element.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    function updateChatsList() {
        const container = document.getElementById('chathastable');
        container.innerHTML = '';

        for (const [hash, data] of state.chats) {
            const remaining = data.endTime - Date.now();
            const minutes = Math.max(0, Math.floor(remaining / 60000));
            const seconds = Math.max(0, Math.floor((remaining % 60000) / 1000));
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            const div = document.createElement('div');
            div.className = 'fz-item';
            div.dataset.hash = hash;

            div.innerHTML = `
                <span class="fz-item-hash" title="${hash}">${hash}</span>
                <span class="fz-item-timer">${timeString}</span>
                <button name="deletetimer" class="fz-del-btn" data-hash="${hash}" title="Удалить таймер">✕</button>
            `;
            container.appendChild(div);
        }

        container.querySelectorAll('[name="deletetimer"]').forEach(btn => {
            btn.addEventListener('click', function () {
                cancelTimer(this.dataset.hash);
            });
        });
    }

    function cancelTimer(hash) {
        const timerData = state.timeouts.get(hash);
        if (timerData) {
            timerData.cancelled = true;
            clearTimeout(timerData.timeoutId);
        }
        clearInterval(state.intervals.get(hash));

        state.timeouts.delete(hash);
        state.chats.delete(hash);
        state.intervals.delete(hash);

        updateChatsList();
    }

    async function getsesid(arg) {
        const datachat = await doOperationsWithConversations(arg);
        return datachat.sessionId;
    }

    async function sendMessage(sessionId, hash, message) {
        const payload = JSON.stringify({
            sessionId: sessionId,
            conversationId: hash,
            text: message
        });

        await fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            headers: {
                "accept": "*/*",
                "accept-language": "ru-RU,ru;q=0.9",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryFeIiMdHaxAteNUHd",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-csrf-token": aftoken
            },
            body: `------WebKitFormBoundaryFeIiMdHaxAteNUHd\r\nContent-Disposition: form-data; name="payload"\r\n\r\n${payload}\r\n------WebKitFormBoundaryFeIiMdHaxAteNUHd--\r\n`,
            method: "POST",
            mode: "cors",
            credentials: "include"
        });
    }
}