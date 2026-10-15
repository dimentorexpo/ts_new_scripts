// Премиальные стили: Sleek Dark Mode & Neon Accents
const fz_styles = `
<style>
    .fz-container {
        display: flex; flex-direction: column; width: 420px;
        /* Палитра "corporate graphite" — визуальная копия окна очереди (Queue.js, #AF_Queue) */
        background:
            radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
            #111827;
        border: 1px solid #344258;
        box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
        border-radius: 18px; padding: 18px; color: #edf2fb;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-sizing: border-box; transition: all 0.3s ease;
    }
    .fz-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 16px; padding-bottom: 12px;
        border-bottom: 1px solid #344258; cursor: grab;
    }
    .fz-header:active { cursor: grabbing; }
    .fz-title { font-size: 14px; font-weight: 600; color: #a6b4cb; letter-spacing: 0.5px; text-transform: uppercase; }

    .fz-btn {
        background: #1b283c; border: 1px solid #3c4d68;
        border-radius: 9px; color: #dce5f5; cursor: pointer;
        padding: 6px 12px; font-size: 13px; font-weight: 600;
        transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
        display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    }
    .fz-btn:hover { background: #293b56; color: #fff; border-color: #7799e2; box-shadow: none; transform: translateY(-1px); }
    .fz-btn:active { transform: scale(0.96); }
    .fz-btn-icon { padding: 6px 10px; font-size: 14px; }

    /* Закрытие — в красной гамме кнопки «❌» из очереди */
    #hidefrozechat {
        background: rgba(255, 116, 140, .08);
        border-color: rgba(255, 116, 140, .3);
        color: #ffb0be;
    }
    #hidefrozechat:hover {
        background: rgba(255, 116, 140, .2);
        border-color: rgba(255, 116, 140, .5);
        transform: none;
    }

    .fz-input-group { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
    .fz-input, .fz-textarea {
        background: #0d1625; border: 1px solid #3a4961;
        border-radius: 9px; color: #edf2fb; padding: 12px 16px; outline: none;
        transition: all 0.16s ease; width: 100%; box-sizing: border-box;
        font-size: 14px; box-shadow: none;
    }
    .fz-input::placeholder, .fz-textarea::placeholder { color: #7d8ca6; }
    .fz-input:focus, .fz-textarea:focus { background: #142034; border-color: #829fff; box-shadow: 0 0 0 3px rgba(110, 152, 247, .16); }
    .fz-textarea { resize: vertical; min-height: 70px; font-family: inherit; }

    .fz-action-row { display: flex; gap: 12px; align-items: center; }

    /* Кастомный степпер времени (решение проблемы бага с протяжкой) */
    .fz-stepper {
        display: flex; align-items: center;        background: #0d1625;
        border: 1px solid #3a4961; border-radius: 9px;
        padding: 4px; box-shadow: none;
    }
    .fz-stepper-btn {
        background: transparent; border: none; color: #a6b4cb;
        width: 32px; height: 32px; border-radius: 6px; cursor: pointer;
        font-size: 18px; font-weight: bold; display: flex; align-items: center; justify-content: center;
        transition: 0.2s;
    }
    .fz-stepper-btn:hover { background: #293b56; color: #fff; }
    .fz-stepper-val {
        width: 36px; text-align: center; background: transparent; border: none;
        color: #fff; font-size: 16px; font-weight: 700; outline: none; pointer-events: none;
    }
    .fz-stepper-label { color: #a6b4cb; font-size: 13px; margin-right: 12px; font-weight: 600; user-select: none; }

    .fz-btn-primary {
        flex: 1; background: #4268c9;
        color: #eef3ff; border: 1px solid #7293ed; padding: 0 16px; height: 42px; border-radius: 9px;
        font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;
        box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
        transition: background-color .16s ease, border-color .16s ease, transform .16s ease; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .fz-btn-primary:hover { background: #547ce1; border-color: #a2b9fa; transform: translateY(-1px); box-shadow: 0 6px 19px rgba(58, 96, 205, .3); }
    .fz-btn-primary:active { transform: translateY(1px); }

    .fz-list {
        max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;
        padding-right: 4px; margin-top: 16px;
    }
    .fz-list::-webkit-scrollbar { width: 5px; }
    .fz-list::-webkit-scrollbar-track { background: #111b2a; border-radius: 4px; }
    .fz-list::-webkit-scrollbar-thumb { background: #536a8e; border-radius: 4px; }
    .fz-list::-webkit-scrollbar-thumb:hover { background: #6b82ab; }

    .fz-item {
        display: flex; justify-content: space-between; align-items: center;
        background: #1a2536; padding: 12px 14px;
        border-radius: 10px; border: 1px solid #344258; border-left: 3px solid #617fbd;
        transition: background-color .16s ease, border-color .16s ease;
    }
    .fz-item:hover { background: #23334b; border-color: #6685be; border-left-color: #92afff; transform: none; }
    .fz-item-warn { font-size: 12px; cursor: help; flex-shrink: 0; }
    .fz-item-hash { font-size: 13px; color: #a6b4cb; font-family: monospace; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 150px; }
    .fz-item-timer {
        font-family: monospace; font-size: 14px; font-weight: 700;
        color: #a9c0ff; background: #182335; padding: 4px 10px; border-radius: 6px;
        border: 1px solid #364660; box-shadow: none;
    }
    .fz-del-btn {
        background: rgba(255, 116, 140, .08); border: 1px solid rgba(255, 116, 140, .3);
        color: #ffb0be; padding: 6px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: 0.2s;
        display: flex; align-items: center; justify-content: center;
    }
    .fz-del-btn:hover { background: rgba(255, 116, 140, .2); border-color: rgba(255, 116, 140, .5); color: #fff; }

    .fz-btn:focus-visible,
    .fz-input:focus-visible,
    .fz-textarea:focus-visible {
        outline: 2px solid #9ab5ff;
        outline-offset: 2px;
    }
</style>
`;

var win_FrozeChat = fz_styles + `
<div class="fz-container">
    <div class="fz-header chmaf-drag-handle" id="froze_chat_header">
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

// ============================================================
// АВТООТВЕТ ПО ТАЙМЕРУ
//  • Таймеры сохраняются в localStorage и переживают перезагрузку страницы.
//  • Перед отправкой проверяется, не ответил ли оператор в чате сам после
//    запуска таймера, — если ответил, автоответ отменяется.
//  • Несколько вкладок AutoFAQ не отправят один автоответ дважды:
//    вкладка «захватывает» таймер перед отправкой.
// ============================================================

const FZ_STORAGE_KEY = 'AF_autoRespondTimers';
const FZ_DEFAULT_RESPONSE = 'Извините за ожидание! Мне нужно еще немного времени, но я уже почти готов с ответом. Спасибо за ваше понимание! 🙏😊';
const FZ_MAX_LATE_MS = 10 * 60 * 1000;   // опоздали больше чем на 10 мин (страница была закрыта) — не отправляем
const FZ_REPLY_CHECK_MS = 30 * 1000;     // как часто проверять, не ответил ли оператор
const FZ_CLAIM_TTL_MS = 60 * 1000;       // «захват» таймера вкладкой на время отправки

function getbutFrozeChatButtonPress() {
    const chatWindow = document.getElementById('AF_FrozeChat');
    if (!chatWindow) return;

    // Реальная видимость: display === '' у открытого окна — это «видно»
    if (getComputedStyle(chatWindow).display === 'none') {
        chatWindow.style.display = 'block';
        const myMenu = document.getElementById('idmymenu');
        if (myMenu) myMenu.style.display = 'none';
        const mainBtn = document.getElementById('MainMenuBtn');
        if (mainBtn) mainBtn.classList.remove('activeScriptBtn');
    } else {
        chatWindow.style.display = 'none';
    }
}

(function initAutoRespond() {
    if (window.__FrozeChatState?.isInitialized) return;

    const TAB_ID = Math.random().toString(36).slice(2);

    const state = window.__FrozeChatState = {
        timers: new Map(),   // hash → { timeoutId }
        pending: new Set(),  // хэши, для которых идёт создание таймера
        isInitialized: true
    };

    const notify = (msg, type = 'message') => {
        if (typeof createAndShowButton === 'function') createAndShowButton(msg, type);
        else console.log('[AutoRespond]', msg);
    };

    // ---------- Хранилище ----------
    const loadAll = () => {
        try {
            const obj = JSON.parse(localStorage.getItem(FZ_STORAGE_KEY) || '{}');
            return obj && typeof obj === 'object' ? obj : {};
        } catch (_) {
            return {};
        }
    };
    const saveAll = (all) => {
        try {
            localStorage.setItem(FZ_STORAGE_KEY, JSON.stringify(all));
        } catch (e) {
            console.warn('[AutoRespond] Не удалось сохранить таймеры:', e);
        }
    };
    const getRec = (hash) => loadAll()[hash] || null;
    const putRec = (hash, rec) => { const all = loadAll(); all[hash] = rec; saveAll(all); };
    const delRec = (hash) => { const all = loadAll(); if (hash in all) { delete all[hash]; saveAll(all); } };

    // ---------- Сообщения оператора в чате ----------
    // Снимок «сколько ответов оператора было на момент запуска таймера».
    // Сравниваем количество, а не время: так не мешает разница часов
    // между компьютером и сервером AutoFAQ.
    // Ответ оператора — любое сообщение семейства AnswerOperator*, включая
    // шаблоны, отправленные оператором «от имени бота» (AnswerOperatorWithBot,
    // AnswerOperatorQuickReply). Отсекаем только то, что прислал сам AutoFAQ
    // (operatorId === 'autoFAQ'), и чисто ботовые типы (AnswerBot, AnswerSystem…),
    // которые сюда и не попадают.
    const OPERATOR_TYPES = new Set(['AnswerOperator', 'AnswerOperatorWithBot', 'AnswerOperatorQuickReply']);
    const isOperatorMessage = (m) => OPERATOR_TYPES.has(m?.tpe) && m?.operatorId !== 'autoFAQ';
    const msgTime = (m) => {
        const t = m?.ts ?? m?.createdAt ?? m?.time;
        const n = typeof t === 'number' ? t : Date.parse(t);
        return Number.isFinite(n) ? n : 0;
    };
    const takeSnapshot = (conv) => {
        if (!Array.isArray(conv?.messages)) return null;
        const ops = conv.messages.filter(isOperatorMessage);
        return { count: ops.length, lastTs: ops.reduce((max, m) => Math.max(max, msgTime(m)), 0) };
    };
    // true — оператор ответил после запуска; false — нет; null — не удалось понять
    const operatorRepliedSince = (conv, baseline) => {
        const snap = takeSnapshot(conv);
        if (!snap || !baseline) return null;
        return snap.count > baseline.count || snap.lastTs > baseline.lastTs;
    };

    const fetchConversation = async (hash) => {
        if (typeof doOperationsWithConversations !== 'function') {
            throw new Error('doOperationsWithConversations недоступна');
        }
        return doOperationsWithConversations(hash);
    };

    async function sendMessage(sessionId, hash, message) {
        // Через общий слой: FormData вместо ручного multipart,
        // диагностика неуспешных ответов и авто-ретрай с обновлённым CSRF
        const response = await sendAnswersRequest({
            sessionId,
            conversationId: hash,
            text: message
        });

        if (!response.ok) {
            throw new Error(`AutoReply send failed: HTTP ${response.status}`);
        }

        return response;
    }

    // ---------- Планирование ----------
    function unschedule(hash) {
        clearTimeout(state.timers.get(hash)?.timeoutId);
        state.timers.delete(hash);
    }

    function schedule(hash, delayOverride = null) {
        unschedule(hash);
        const rec = getRec(hash);
        if (!rec) return;
        const delay = delayOverride ?? Math.max(0, rec.endTime - Date.now());
        state.timers.set(hash, { timeoutId: setTimeout(() => fire(hash), Math.min(delay, 2 ** 31 - 1)) });
    }

    function finish(hash) {
        unschedule(hash);
        delRec(hash);
        updateChatsList();
    }

    // Отправка не удалась: снимаем таймер и явно сообщаем, чтобы его можно было запустить заново
    function failTimer(hash) {
        finish(hash);
        notify(`Автоответ для чата ${hash} НЕ отправлен — таймер снят, запусти заново или ответь вручную`, 'error');
    }

    // Захват таймера вкладкой: если открыто несколько вкладок, отправит только одна
    async function claim(hash) {
        const rec = getRec(hash);
        if (!rec) return null;
        if (rec.claimedBy && rec.claimedBy !== TAB_ID && Date.now() - rec.claimedAt < FZ_CLAIM_TTL_MS) return null;

        rec.claimedBy = TAB_ID;
        rec.claimedAt = Date.now();
        putRec(hash, rec);

        await new Promise(r => setTimeout(r, 150 + Math.random() * 250));
        const again = getRec(hash);
        return again && again.claimedBy === TAB_ID ? again : null;
    }

    function release(hash) {
        const rec = getRec(hash);
        if (rec && rec.claimedBy === TAB_ID) {
            delete rec.claimedBy;
            delete rec.claimedAt;
            putRec(hash, rec);
        }
    }

    async function fire(hash) {
        state.timers.delete(hash);

        const rec = await claim(hash);
        if (!rec) {
            // Таймер удалили или его отправляет другая вкладка. Если та вкладка
            // «умрёт» посреди отправки, попробуем сами после истечения захвата.
            if (getRec(hash)) schedule(hash, FZ_CLAIM_TTL_MS + 1000);
            updateChatsList();
            return;
        }

        // Таймер успели перезапустить с новым временем
        if (Date.now() < rec.endTime - 1000) {
            release(hash);
            schedule(hash);
            return;
        }

        markItem(hash, 'Отправка…');

        let conv = null;
        try {
            conv = await fetchConversation(hash);
        } catch (e) {
            console.warn('[AutoRespond] Не удалось прочитать чат перед отправкой:', e);
        }

        if (operatorRepliedSince(conv, rec.baseline) === true) {
            finish(hash);
            notify(`Автоответ для чата ${hash} отменён — вы уже ответили клиенту`, 'info');
            return;
        }

        try {
            const sessionId = conv?.sessionId || rec.sessionId;
            const response = await sendMessage(sessionId, hash, rec.message);
            if (response && response.ok) {
                finish(hash);
                notify(`✅ Автоответ отправлен в чат ${hash}`, 'success');
            } else {
                failTimer(hash);
            }
        } catch (e) {
            console.error('AutoReply send error:', e);
            failTimer(hash);
        }
    }

    // ---------- Восстановление после перезагрузки ----------
    function restoreAll() {
        const now = Date.now();
        for (const [hash, rec] of Object.entries(loadAll())) {
            if (!rec || typeof rec.endTime !== 'number') {
                delRec(hash);
                continue;
            }
            if (now - rec.endTime > FZ_MAX_LATE_MS) {
                delRec(hash);
                notify(`Автоответ для чата ${hash} не отправлен: страница была закрыта в момент отправки`, 'warning');
                continue;
            }
            // Время уже прошло, но недавно — отправим сразу (с проверкой ответа оператора)
            schedule(hash);
        }
        updateChatsList();
    }

    // Другая вкладка добавила / удалила / отправила таймер — синхронизируемся
    window.addEventListener('storage', (e) => {
        if (e.key !== FZ_STORAGE_KEY) return;
        const all = loadAll();
        for (const hash of [...state.timers.keys()]) {
            if (!all[hash]) unschedule(hash);
        }
        for (const hash of Object.keys(all)) {
            if (!state.timers.has(hash)) schedule(hash);
        }
        updateChatsList();
    });

    // Периодически проверяем, не ответил ли оператор сам, — чтобы таймер
    // исчезал из списка сразу, а не только в момент отправки
    setInterval(async () => {
        if (document.visibilityState !== 'visible') return;
        for (const [hash, rec] of Object.entries(loadAll())) {
            if (!rec?.baseline || rec.claimedBy) continue;
            if (rec.endTime - Date.now() < 5000) continue; // скоро проверит fire()
            try {
                const conv = await fetchConversation(hash);
                if (operatorRepliedSince(conv, rec.baseline) === true && getRec(hash)) {
                    finish(hash);
                    notify(`Автоответ для чата ${hash} отменён — вы уже ответили клиенту`, 'info');
                }
            } catch (_) { /* сеть — проверим в следующий раз или перед отправкой */ }
        }
    }, FZ_REPLY_CHECK_MS);

    // ---------- Список таймеров в окне ----------
    const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);

    const formatRemaining = (ms) => {
        const total = Math.max(0, Math.floor(ms / 1000));
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    };

    function markItem(hash, text) {
        const item = [...document.querySelectorAll('#chathastable .fz-item')].find(i => i.dataset.hash === hash);
        const el = item?.querySelector('.fz-item-timer');
        if (el) {
            el.textContent = text;
            el.dataset.frozen = '1';
        }
    }

    function updateChatsList() {
        const container = document.getElementById('chathastable');
        if (!container) return;
        container.innerHTML = '';

        const entries = Object.entries(loadAll()).sort((a, b) => a[1].endTime - b[1].endTime);
        for (const [hash, rec] of entries) {
            const div = document.createElement('div');
            div.className = 'fz-item';
            div.dataset.hash = hash;
            div.dataset.end = String(rec.endTime);

            const warn = rec.baseline
                ? ''
                : '<span class="fz-item-warn" title="Не удалось прочитать сообщения чата: автоответ уйдёт, даже если вы ответите сами">⚠️</span>';

            div.innerHTML = `
                <span class="fz-item-hash" title="${escHtml(hash)}">${escHtml(hash)}</span>
                ${warn}
                <span class="fz-item-timer">${formatRemaining(rec.endTime - Date.now())}</span>
                <button name="deletetimer" class="fz-del-btn" data-hash="${escHtml(hash)}" title="Удалить таймер">✕</button>
            `;
            container.appendChild(div);
        }
    }

    // Один общий тикер обратного отсчёта вместо интервала на каждый таймер
    setInterval(() => {
        document.querySelectorAll('#chathastable .fz-item').forEach(item => {
            const timer = item.querySelector('.fz-item-timer');
            if (!timer || timer.dataset.frozen) return;
            timer.textContent = formatRemaining(Number(item.dataset.end) - Date.now());
        });
    }, 1000);

    // ---------- Обработчики окна ----------
    document.getElementById('chathastable')?.addEventListener('click', (e) => {
        const btn = e.target.closest('[name="deletetimer"]');
        if (btn) finish(btn.dataset.hash);
    });

    document.getElementById('clearallchathash')?.addEventListener('click', () => {
        for (const hash of [...state.timers.keys()]) unschedule(hash);
        saveAll({});
        updateChatsList();
    });

    // Кастомный степпер (нет бага перетаскивания)
    const timerInput = document.getElementById('frozetimer');
    document.getElementById('fz-timer-minus')?.addEventListener('click', () => {
        const val = parseInt(timerInput.value, 10) || 0;
        if (val > 0) timerInput.value = val - 1;
    });
    document.getElementById('fz-timer-plus')?.addEventListener('click', () => {
        const val = parseInt(timerInput.value, 10) || 0;
        if (val < 59) timerInput.value = val + 1;
    });

    // Хэш — последний сегмент пути ссылки (assigned / archive / logs / голый хэш)
    const extractHash = (input) => {
        try {
            const url = new URL(input);
            return url.pathname.split('/').filter(Boolean).pop() || '';
        } catch (_) {
            return input.split(/[?#]/)[0].split('/').filter(Boolean).pop() || '';
        }
    };

    let warnedNoSnapshot = false;

    document.getElementById('freezechat')?.addEventListener('click', async () => {
        const hashInput = document.getElementById('chatfrozehash').value.trim();
        if (!hashInput) {
            return notify('Не введен хеш чата!', 'error');
        }

        const chatHash = extractHash(hashInput);
        if (!/^[\w-]{6,}$/.test(chatHash)) {
            return notify('Не похоже на хэш чата — проверь ссылку', 'error');
        }

        const customMessage = document.getElementById('chatfrozemsg').value || FZ_DEFAULT_RESPONSE;
        const duration = (parseInt(timerInput.value, 10) || 0) * 60 * 1000;

        if (getRec(chatHash) || state.pending.has(chatHash)) {
            return notify('Таймер для этого чата уже запущен', 'warning');
        }

        // Резервируем синхронно до первого await — иначе быстрый двойной клик
        // успевал создать два таймера на один хэш
        state.pending.add(chatHash);

        try {
            const conv = await fetchConversation(chatHash);
            if (!conv?.sessionId) throw new Error('не найден sessionId чата');

            const baseline = takeSnapshot(conv);
            if (!baseline && !warnedNoSnapshot) {
                warnedNoSnapshot = true;
                console.warn('[AutoRespond] В ответе по чату нет списка сообщений — проверка «оператор уже ответил» недоступна', conv);
                notify('Не удалось прочитать сообщения чата: автоответ уйдёт, даже если вы ответите сами', 'warning');
            }

            const now = Date.now();
            putRec(chatHash, {
                message: customMessage,
                sessionId: conv.sessionId,
                createdAt: now,
                endTime: now + duration,
                baseline
            });

            schedule(chatHash);
            updateChatsList();

            document.getElementById('chatfrozehash').value = '';
            document.getElementById('chatfrozemsg').value = '';
        } catch (error) {
            console.error('Failed to initialize timer:', error);
            notify('Ошибка при инициализации таймера: ' + (error?.message || error), 'error');
        } finally {
            state.pending.delete(chatHash);
        }
    });

    restoreAll();
})();