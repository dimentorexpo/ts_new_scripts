var win_FrozeChat = `<div style="display: flex; width: 400px;">
    <span style="width: 410px">
        <span style="cursor: -webkit-grab;">
            <div style="margin: 5px; width: 395px;" id="froze_chat_header">
                <button class="mainButton buttonHide" title="скрывает меню" id="hidefrozechat">hide</button>
                <button class="mainButton smallbtn" id="clearallchathash">🧹</button>
                <button class="mainButton smallbtn" id="arinfo" style="float:right; margin-right: 5px;" title="Auto-reply settings">❓</button>
            </div>
            <div>
                <input id="chatfrozehash" class="${exttheme}" placeholder="Введите хэш чата" title="Chat hash for auto-reply" autocomplete="off" type="text" style="text-align: center; width: 290px; margin-left:5px">
                <textarea id="chatfrozemsg" class="${exttheme}" placeholder="Введите текст сообщения" title="Custom response (optional)" autocomplete="off" style="text-align: center; width: 290px; margin-left:5px"></textarea>
                <input id="frozetimer" class="${exttheme}" value="6" style="position:absolute; right: 62px; top: 37px; width:38px;" type="number" min="0" max="59">
                <span style="color:bisque;position: absolute;right: 34px; top: 42px;">min</span>
                <button class="mainButton smallbtn" id="freezechat" title="Set auto-reply timer" style="position: absolute; right: 28px; top: 72px; width: 66px; height: 38px; font-size: 22px;">❄</button>
            </div>
        </span>
        <div style="margin: 5px; width: 400px" id="chats_hash_box">
            <p id="chathastable" style="max-height:400px; margin-left:5px; font-size:16px; color:bisque; overflow:auto;"></p>
        </div>
    </span>
</div>`;

// Create window immediately but keep it hidden initially if needed
const wintFrozeChat = createWindow('AF_FrozeChat', 'winTopFrozeChat', 'winLeftFrozeChat', win_FrozeChat);
hideWindowOnDoubleClick('AF_FrozeChat');
hideWindowOnClick('AF_FrozeChat', 'hidefrozechat');

// Optimized function kept with original name for compatibility
function getbutFrozeChatButtonPress() {
    // State management object
    const state = {
        chats: new Map(),
        timeouts: new Map(),
        intervals: new Map(),
        cancelled: new Set()
    };

    const DEFAULT_RESPONSE = 'Извините за ожидание! Мне нужно еще немного времени, но я уже почти готов с ответом. Спасибо за ваше понимание! 🙏😊';
    const TIMER_UPDATE_INTERVAL = 1000;

    // Toggle window visibility
    const chatWindow = document.getElementById('AF_FrozeChat');
    if (chatWindow.style.display === 'none') {
        chatWindow.style.display = '';
        document.getElementById('idmymenu').style.display = 'none';
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn');
    } else {
        chatWindow.style.display = 'none';
    }

    // Hide button functionality
    document.getElementById('hidefrozechat').onclick = () => {
        chatWindow.style.display = 'none';
    };

    // Clear all button functionality
    document.getElementById('clearallchathash').onclick = () => {
        // Clear all active timers
        for (const [hash, data] of state.timeouts) {
            clearTimeout(data.timeoutId);
            clearInterval(state.intervals.get(hash));
        }
        state.chats.clear();
        state.timeouts.clear();
        state.intervals.clear();
        state.cancelled.clear();
        document.getElementById('chathastable').innerHTML = '';
    };

    // Freeze chat button functionality
    document.getElementById('freezechat').onclick = async function () {
        const hashInput = document.getElementById('chatfrozehash').value.trim();
        if (!hashInput) {
            return createAndShowButton('Не введен хеш чата!. Введите хеш и попробуйте еще раз', 'error');
        }

        // Extract chat hash from URL
        const extractHash = (input) => {
            const parts = input.split('/');
            if (parts.length === 1) return parts[0];
            if (parts[3] === 'logs') return parts[4];
            if (parts[4] === 'assigned') return parts[5];
            return input;
        };

        const chatHash = extractHash(hashInput);
        const customMessage = document.getElementById('chatfrozemsg').value || DEFAULT_RESPONSE;
        const duration = parseInt(document.getElementById('frozetimer').value) * 60 * 1000;

        if (state.chats.has(chatHash)) {
            return createAndShowButton('Таймер для этого чата уже запущен', 'warning');
        }

        try {
            // Get session ID
            const sessionId = await getsesid(chatHash);

            // Store timer data
            const timerData = {
                message: customMessage,
                sessionId: sessionId,
                endTime: Date.now() + duration,
                cancelled: false
            };

            state.chats.set(chatHash, timerData);

            // Create countdown display
            const timeoutId = setTimeout(async () => {
                if (!timerData.cancelled) {
                    await sendMessage(timerData.sessionId, chatHash, timerData.message);
                    state.chats.delete(chatHash);
                    updateChatsList();
                }
            }, duration);

            state.timeouts.set(chatHash, { timeoutId, ...timerData });

            // Create interval for countdown display
            const intervalId = setInterval(() => {
                if (timerData.cancelled) {
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

            // Update UI
            updateChatsList();
            document.getElementById('chatfrozehash').value = '';
            document.getElementById('chatfrozemsg').value = '';

        } catch (error) {
            console.error('Failed to initialize frozen chat:', error);
            createAndShowButton('Ошибка при инициализации таймера', 'error');
        }
    };

    // Helper function to update timer display
    function updateTimerDisplay(hash, remaining) {
        const element = document.querySelector(`[data-hash="${hash}"] .timer-display`);
        if (element) {
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            element.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Helper function to update the chats list UI
    function updateChatsList() {
        const container = document.getElementById('chathastable');
        container.innerHTML = '';

        for (const [hash, data] of state.chats) {
            const div = document.createElement('div');
            div.dataset.hash = hash;

            const remaining = data.endTime - Date.now();
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            div.innerHTML = `
                ${hash}
                <span class="timer-display mainButton">${timeString}</span>
                <button name="deletetimer" class="mainButton" data-hash="${hash}" title="Удаляет таймер автоответа" style="cursor:pointer">❌</button>
            `;
            container.appendChild(div);
        }

        // Add event listeners for cancel buttons
        container.querySelectorAll('[name="deletetimer"]').forEach(btn => {
            btn.onclick = function () {
                const hash = this.dataset.hash;
                cancelTimer(hash);
            };
        });
    }

    // Cancel timer function
    function cancelTimer(hash) {
        const timerData = state.timeouts.get(hash);
        if (timerData) {
            timerData.cancelled = true;
            clearTimeout(timerData.timeoutId);
            clearInterval(state.intervals.get(hash));
            state.timeouts.delete(hash);
            state.chats.delete(hash);
            state.intervals.delete(hash);
            updateChatsList();
        }
    }

    // Get session ID helper
    async function getsesid(arg) {
        const datachat = await doOperationsWithConversations(arg);
        return datachat.sessionId;
    }

    // Send message helper
    async function sendMessage(sessionId, hash, message) {
        const payload = JSON.stringify({
            sessionId: sessionId,
            conversationId: hash,
            text: message
        });

        await fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            headers: {
                "accept": "*/*",
                "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
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
