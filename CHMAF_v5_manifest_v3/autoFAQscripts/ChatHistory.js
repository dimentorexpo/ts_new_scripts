// --- ПРЕМИАЛЬНЫЕ СТИЛИ GLASSMORPHISM ---
const afgStyles = document.createElement('style');
afgStyles.textContent = `
    /* Глобальные CSS переменные */
    :root {
        --afg-dark-bg: linear-gradient(135deg, rgba(22, 25, 35, 0.95) 0%, rgba(15, 18, 28, 0.98) 100%);
        --afg-dark-border: rgba(255, 255, 255, 0.12);
        --afg-accent: #00d4ff;
        --afg-accent-glow: rgba(0, 212, 255, 0.3);
        --afg-hover: rgba(255, 255, 255, 0.15);
    }

    /* Основной контейнер панели */
    .afg-panel {
        position: fixed; top: 0; right: 0; width: 480px; height: 100vh;
        z-index: 1000000; display: flex; flex-direction: column;
        backdrop-filter: blur(24px) saturate(140%); -webkit-backdrop-filter: blur(24px) saturate(140%);
        box-shadow: -8px 0 40px rgba(0,0,0,0.5), inset 1px 0 0 rgba(255,255,255,0.05);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px; background: var(--afg-dark-bg);
        border-left: 1px solid var(--afg-dark-border); color: #f0f0f0;
    }

    /* Кнопки */
    .afg-btn {
        background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
        border-radius: 10px; color: #fff; cursor: pointer; padding: 8px 14px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-flex; align-items: center; justify-content: center;
        backdrop-filter: blur(8px); font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .afg-btn:hover {
        background: rgba(255,255,255,0.12); transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.25); border-color: rgba(255,255,255,0.2);
    }
    .afg-btn:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .afg-btn-small { padding: 6px 10px; font-size: 16px; }

    .afg-btn-accent {
        background: rgba(0, 212, 255, 0.15);
        border-color: rgba(0, 212, 255, 0.4);
        color: var(--afg-accent);
        text-shadow: 0 0 8px var(--afg-accent-glow);
    }
    .afg-btn-accent:hover {
        background: rgba(0, 212, 255, 0.25);
        border-color: rgba(0, 212, 255, 0.6);
        box-shadow: 0 6px 20px rgba(0, 212, 255, 0.2);
    }

    /* Инпуты и Селекты */
    .afg-input {
        background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px; color: #f0f0f0; padding: 8px 12px; outline: none;
        transition: all 0.2s ease; font-size: 13px;
        box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
    }
    .afg-input:focus {
        border-color: var(--afg-accent); background: rgba(0,0,0,0.4);
        box-shadow: 0 0 0 3px var(--afg-accent-glow), inset 0 2px 6px rgba(0,0,0,0.3);
    }
    .afg-input::placeholder { color: rgba(255,255,255,0.4); }
    select.afg-input option { background: #1a1d28; color: #fff; }

    /* Секции */
    .afg-header, .afg-controls, .afg-footer {
        padding: 12px; display: flex; align-items: center;
        background: rgba(0,0,0,0.2);
        border-bottom: 1px solid rgba(255,255,255,0.08); gap: 8px; flex-wrap: wrap;
    }
    .afg-chat-info {
        padding: 12px; font-size: 13px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        background: rgba(0,0,0,0.15);
    }

    /* Область сообщений */
    .afg-chat-area {
        flex: 1; overflow-y: auto; overflow-x: hidden; padding: 20px 15px;
        display: flex; flex-direction: column; gap: 16px; scrollbar-width: thin;
    }
    .afg-chat-area::-webkit-scrollbar { width: 8px; }
    .afg-chat-area::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
    .afg-chat-area::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.15); border-radius: 10px;
        border: 2px solid rgba(15, 18, 28, 0.5);
    }
    .afg-chat-area::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }

    /* Темы */
    .theme-light {
        background: linear-gradient(135deg, rgba(245, 248, 252, 0.98) 0%, rgba(235, 240, 248, 0.98) 100%);
        color: #1a1d28; border-radius: 8px 0 0 8px;
    }
    .theme-dark { background: transparent; color: #f0f0f0; }

    /* НОВЫЕ СТИЛИ СООБЩЕНИЙ - Всегда показываем дату/время */
    .afg-msg {
        padding: 12px 16px; border-radius: 16px; max-width: 85%;
        word-break: break-word; position: relative;
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
        backdrop-filter: blur(8px);
        animation: msgFadeIn 0.3s ease;
    }

    @keyframes msgFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Заголовок сообщения - ВСЕГДА ВИДИМЫЙ */
    .afg-msg-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 8px; padding-bottom: 6px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        font-size: 12px; font-weight: 600;
    }

    .afg-msg-author { color: inherit; opacity: 0.9; }
    .afg-msg-date {
        font-weight: 400; opacity: 0.6; font-size: 11px;
        font-family: 'SF Mono', 'Consolas', monospace;
    }

    /* Типы сообщений */
    .afg-msg-user {
        background: linear-gradient(135deg, rgba(0, 191, 255, 0.12) 0%, rgba(0, 150, 255, 0.08) 100%);
        border-color: rgba(0, 191, 255, 0.25);
        border-left: 3px solid var(--afg-accent);
        align-self: flex-start;
    }
    .afg-msg-user .afg-msg-author { color: var(--afg-accent); }

    .afg-msg-oper {
        background: linear-gradient(135deg, rgba(255, 193, 7, 0.12) 0%, rgba(255, 160, 0, 0.08) 100%);
        border-color: rgba(255, 193, 7, 0.25);
        border-right: 3px solid #ffc107;
        align-self: flex-end;
    }
    .afg-msg-oper .afg-msg-author { color: #ffc107; }

    .afg-msg-bot {
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(56, 142, 60, 0.08) 100%);
        border-color: rgba(76, 175, 80, 0.25);
        border-right: 3px solid #4caf50;
        align-self: flex-end;
    }
    .afg-msg-bot .afg-msg-author { color: #4caf50; }

    .afg-msg-comment {
        background: linear-gradient(135deg, rgba(158, 158, 158, 0.12) 0%, rgba(117, 117, 117, 0.08) 100%);
        border-color: rgba(158, 158, 158, 0.25);
        align-self: center; font-style: italic; width: 85%;
        border-left: 3px solid #9e9e9e;
    }
    .afg-msg-comment .afg-msg-author { color: #9e9e9e; }

    .afg-msg-event {
        text-align: center; font-size: 12px; opacity: 0.7; padding: 8px 16px;
        align-self: center; background: rgba(0,0,0,0.15);
        border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);
        font-weight: 500; letter-spacing: 0.3px;
    }

    /* Светлая тема */
    .theme-light .afg-msg { color: #1a1d28; border-color: rgba(0,0,0,0.08); }
    .theme-light .afg-msg-header { border-bottom-color: rgba(0,0,0,0.1); }

    /* Улучшенная контрастность для светлой темы */
    .theme-light .afg-msg-user {
        background: linear-gradient(135deg, rgba(0, 150, 255, 0.15) 0%, rgba(0, 120, 255, 0.1) 100%);
        border-color: rgba(0, 120, 255, 0.3);
    }
    .theme-light .afg-msg-user .afg-msg-author {
        color: #0066cc; /* Тёмно-синий вместо светло-голубого */
        font-weight: 600;
    }

    .theme-light .afg-msg-comment {
        background: linear-gradient(135deg, rgba(100, 100, 100, 0.2) 0%, rgba(80, 80, 80, 0.15) 100%);
        border-color: rgba(80, 80, 80, 0.4);
    }
    .theme-light .afg-msg-comment .afg-msg-author {
        color: #424242; /* Тёмно-серый вместо светло-серого */
        font-weight: 600;
    }

    .theme-light .afg-msg-oper .afg-msg-author {
        color: #d68000; /* Более тёмный оранжевый */
        font-weight: 600;
    }

    .theme-light .afg-msg-bot .afg-msg-author {
        color: #2e7d32; /* Более тёмный зелёный */
        font-weight: 600;
    }

    /* Модалка */
    .afg-modal {
        position: absolute; top: 20px; left: -400px; width: 380px; max-height: 80vh; overflow: auto;
        border-radius: 16px; padding: 20px; display: none; z-index: 100;
        box-shadow: 0 16px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.12);
        background: linear-gradient(135deg, rgba(30, 35, 45, 0.98) 0%, rgba(20, 25, 35, 0.98) 100%);
        backdrop-filter: blur(24px); color: #f0f0f0;
    }

    /* Ссылки и картинки */
    .afg-chat-area a {
        color: var(--afg-accent); text-decoration: none;
        transition: all 0.2s ease;
    }
    .afg-chat-area a:hover {
        text-decoration: underline;
        text-shadow: 0 0 8px var(--afg-accent-glow);
    }
    .chat-history-image {
        border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 240px; cursor: zoom-in;
        border: 1px solid rgba(255,255,255,0.1);
    }
    .chat-history-image:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }

    .chatlist {
        padding: 10px 12px; border-radius: 10px;
        transition: all 0.2s ease; display: block; margin-bottom: 6px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        cursor: pointer;
    }
    .chatlist:hover {
        background: rgba(255,255,255,0.1);
        transform: translateX(8px);
        border-color: rgba(255,255,255,0.15);
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    /* --- ГАЛЕРЕЯ OVERLAY --- */
    .afg-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.95);
        display: flex; justify-content: center; align-items: center;
        z-index: 9999999; cursor: zoom-out;
        backdrop-filter: blur(12px);
        animation: overlayFadeIn 0.3s ease;
    }
    @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .afg-overlay img {
        max-width: 90vw; max-height: 90vh; border-radius: 16px;
        box-shadow: 0 16px 60px rgba(0,0,0,0.8);
        transition: opacity 0.2s;
    }

    .afg-gallery-nav {
        position: absolute; top: 50%; transform: translateY(-50%);
        background: rgba(255,255,255,0.08); color: white;
        border: 1px solid rgba(255,255,255,0.15); font-size: 28px;
        width: 60px; height: 60px; display: flex; justify-content: center; align-items: center;
        cursor: pointer; border-radius: 50%; z-index: 10000000;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(8px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .afg-gallery-nav:hover {
        background: rgba(0,212,255,0.9);
        transform: translateY(-50%) scale(1.15);
        border-color: transparent;
        box-shadow: 0 12px 32px rgba(0,212,255,0.4);
    }
    .afg-nav-left { left: 40px; }
    .afg-nav-right { right: 40px; }

    .afg-gallery-counter {
        position: absolute; top: 30px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.7); color: white; padding: 10px 20px;
        border-radius: 24px; font-size: 16px; font-weight: 600;
        backdrop-filter: blur(12px); z-index: 10000000;
        border: 1px solid rgba(255,255,255,0.15);
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }

    /* Убираем старую логику группировки - теперь каждое сообщение самостоятельное */
    .afg-msg-continuous { display: none; } /* Больше не используется */

    /* Адаптивность для узких экранов */
    @media (max-width: 500px) {
        .afg-panel { width: 100vw; }
    }

    /* Плавная прокрутка */
    .afg-chat-area {
        scroll-behavior: smooth;
    }

    /* Улучшенная читаемость кода и ссылок */
    .afg-msg code {
        background: rgba(0,0,0,0.3);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'SF Mono', 'Consolas', monospace;
        font-size: 12px;
    }

    .afg-msg pre {
        background: rgba(0,0,0,0.3);
        padding: 10px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 8px 0;
        border: 1px solid rgba(255,255,255,0.05);
    }

    /* Анимация для кнопок */
    .afg-btn {
        position: relative;
        overflow: hidden;
    }

    .afg-btn::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }

    .afg-btn:active::before {
        width: 300px;
        height: 300px;
    }
`;
document.head.appendChild(afgStyles);

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let data = null;
const DATE_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric' }; // Убрали время отсюда
const TIME_OPTIONS = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

if (!localStorage.getItem('winTopChatHis')) {
    localStorage.setItem('winTopChatHis', '0');
    localStorage.setItem('winLeftChatHis', '80.6');
}
if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'dark');
}

// --- ПРЕМИАЛЬНЫЙ HTML ШАБЛОН ---
const win_Chathis = `
    <div class="afg-header chmaf-drag-handle" style="justify-content: space-between;">
        <button class="afg-btn afg-btn-small" title="Скрыть панель" id="hideMeChHis">✕</button>
        <div style="display:flex; flex:1; margin: 0 10px; gap: 6px;">
            <select class="afg-input" style="flex: 1; min-width: 0;" id="operatorstp">
                <option selected disabled>👥 Операторы на линии</option>
            </select>
            <button class="afg-btn afg-btn-small afg-btn-accent" title="Обновить статус операторов" id="RefrehOperators">↻</button>
        </div>
        <button class="afg-btn afg-btn-small" title="Информация пользователя" id="getdatafrchat">ℹ️</button>
        <button class="afg-btn afg-btn-small" title="Очистка полей" id="clearallinfo">🗑️</button>
    </div>

    <div class="afg-controls">
        <button class="afg-btn afg-btn-small" title="Назад к списку" id="back_to_chat_his">←</button>
        <input class="afg-input" id="chatuserhis" placeholder="🔍 ID пользователя" autocomplete="off" type="text" style="flex: 1; min-width: 0; text-align:center;">
        <input class="afg-input" id="hashchathis" placeholder="🔗 Хеш чата" autocomplete="off" type="text" style="flex: 1; min-width: 0; text-align:center;">
        <button class="afg-btn afg-btn-small afg-btn-accent" title="Поиск" id="btn_search_history">⚡</button>
    </div>

    <div class="afg-controls" style="justify-content: space-between; font-size: 13px;">
        <div style="display: flex; gap: 6px;">
            <button class="afg-btn afg-btn-small" id="chhisinstr" title="Инструкция">?</button>
            <button class="afg-btn afg-btn-small afg-btn-accent" id="refreshchat" title="Обновить чат">⟳</button>
        </div>
        <div style="display: flex; gap: 6px; align-items: center; font-size: 12px; font-weight: 500;">
            <span style="opacity: 0.7;">С</span>
            <input class="afg-input" type="date" style="padding: 6px 8px; font-size: 12px; width: 120px;" id="dateFromChHis">
            <span style="opacity: 0.7;">По</span>
            <input class="afg-input" type="date" style="padding: 6px 8px; font-size: 12px; width: 120px;" id="dateToChHis">
        </div>
        <button class="afg-btn afg-btn-small" id="chagetheme" title="Сменить тему">◐</button>
    </div>

    <div class="afg-chat-info" id="somechatinfo" style="display:none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="opacity: 0.7; font-size: 12px;">👤 User ID:</span>
                <span id="placeusid" style="font-weight: 600; color: var(--afg-accent); cursor: pointer;" title="Копировать ID"></span>
            </div>
            <button class="afg-btn afg-btn-accent" id="takechat" title="Забрать чат на себя" style="padding: 6px 12px;">📥 Забрать</button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="opacity: 0.7; font-size: 12px;">💬 Chat ID:</span>
                <span id="placechatid" style="font-weight: 600; color: var(--afg-accent); cursor: pointer;" title="Копировать ссылку"></span>
            </div>
            <button class="afg-btn" id="reassign" title="Перевести на выбранного оператора" style="padding: 6px 12px;">🔄 Перевести</button>
        </div>
    </div>

    <div id="infofield" class="afg-chat-area theme-dark"></div>

    <div class="afg-footer" id="bottommenuchhis" style="display:none; flex-direction: column; gap: 10px;">
        <textarea class="afg-input" id="msgftochatornotes" style="width: 100%; height: 60px; resize: vertical; min-height: 60px; max-height: 200px; text-align: left; padding: 10px;" placeholder="✍️ Введите текст сообщения или заметки..."></textarea>
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <button class="afg-btn afg-btn-accent" id="sendmsgtochatornotes" style="padding: 8px 20px; font-weight: 600;">📤 Отправить</button>
            <div style="display: flex; gap: 16px; align-items: center; font-size: 13px;">
                <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <input type="radio" name="chatornotes" value="Notes" checked style="cursor: pointer;">
                    <span>📝 Заметки</span>
                </label>
                <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <input type="radio" name="chatornotes" value="Chat" style="cursor: pointer;">
                    <span>💬 Чат</span>
                </label>
            </div>
        </div>
    </div>

    <div id="userchatdata" class="afg-modal">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; gap: 8px;">
            <button class="afg-btn" id="hideuserdatainfo" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); flex: 1;">✕ Закрыть</button>
            <button class="afg-btn afg-btn-accent" id="gotocrmhis" style="flex: 1;">🔗 Открыть CRM</button>
        </div>
        <div id="datafield" style="line-height: 1.6; font-size: 14px; word-break: break-word;"></div>
    </div>
`;

let wintChatHis = document.createElement('div');
wintChatHis.className = 'afg-panel';
wintChatHis.style.display = 'none';
wintChatHis.setAttribute('id', 'AF_ChatHis');
wintChatHis.innerHTML = win_Chathis;
document.body.append(wintChatHis);

// --- ГАЛЕРЕЯ ИЗОБРАЖЕНИЙ ---
document.getElementById('infofield').addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('chat-history-image')) {
        // Собираем все картинки из текущего чата
        const allImages = Array.from(document.querySelectorAll('#infofield .chat-history-image'));
        const currentIndex = allImages.indexOf(e.target);
        openImageGallery(allImages, currentIndex);
    }
});

function openImageGallery(imagesArray, startIndex) {
    if (document.querySelector('.afg-overlay')) return; // Защита от дублей

    let currentIndex = startIndex !== -1 ? startIndex : 0;

    const overlay = document.createElement('div');
    overlay.className = 'afg-overlay';

    const img = document.createElement('img');
    img.src = imagesArray[currentIndex].dataset.full || imagesArray[currentIndex].src;

    // Функция обновления картинки с плавной анимацией
    const updateGalleryView = () => {
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = imagesArray[currentIndex].dataset.full || imagesArray[currentIndex].src;
            img.style.opacity = '1';
            updateCounter();
        }, 150);
    };

    // Навигация и счетчик
    let btnPrev, btnNext, counter;

    if (imagesArray.length > 1) {
        btnPrev = document.createElement('button');
        btnPrev.innerHTML = '&#10094;'; // Стрелка влево
        btnPrev.className = 'afg-gallery-nav afg-nav-left';
        btnPrev.title = "Назад (Клавиша: Влево)";
        btnPrev.onclick = (e) => {
            e.stopPropagation(); // Чтобы не закрывался оверлей
            currentIndex = (currentIndex - 1 + imagesArray.length) % imagesArray.length;
            updateGalleryView();
        };

        btnNext = document.createElement('button');
        btnNext.innerHTML = '&#10095;'; // Стрелка вправо
        btnNext.className = 'afg-gallery-nav afg-nav-right';
        btnNext.title = "Вперед (Клавиша: Вправо)";
        btnNext.onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % imagesArray.length;
            updateGalleryView();
        };

        counter = document.createElement('div');
        counter.className = 'afg-gallery-counter';

        overlay.appendChild(btnPrev);
        overlay.appendChild(btnNext);
        overlay.appendChild(counter);
    }

    const updateCounter = () => { if (counter) counter.innerText = `${currentIndex + 1} / ${imagesArray.length}`; };
    updateCounter();

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // Функция закрытия
    const closeOverlay = () => {
        overlay.remove();
        document.removeEventListener('keydown', keyHandler);
    };

    // Клик в любом месте оверлея закрывает галерею
    overlay.onclick = closeOverlay;

    // Управление с клавиатуры
    const keyHandler = (e) => {
        if (e.key === 'Escape') closeOverlay();
        if (imagesArray.length > 1) {
            if (e.key === 'ArrowLeft') btnPrev.click();
            if (e.key === 'ArrowRight') btnNext.click();
        }
    };
    document.addEventListener('keydown', keyHandler);
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function extractUrlFromHtml(htmlString) {
    try {
        const doc = new DOMParser().parseFromString(htmlString, 'text/html');
        const link = doc.querySelector('a');
        if (link && link.href) return link.href;
    } catch (e) { }
    const match = htmlString.match(/href="([^"]+)"/);
    return match ? match[1] : null;
}

function renderMedia(url) {
    const lower = url.toLowerCase();
    if (lower.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
        return `<img src="${url}" class="chat-history-image" data-full="${url}" style="margin-top: 8px;">`;
    }
    if (lower.match(/\.(mp4|mov|mkv|webm)$/)) {
        return `
            <video controls playsinline preload="metadata" style="max-width:100%; border-radius:12px; display:block; margin-top:8px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <source src="${url}" type="video/mp4">
                Ваш браузер не поддерживает видео. <a href="${url}" target="_blank" style="color: var(--afg-accent);">Скачать файл</a>
            </video>`;
    }
    if (lower.match(/\.(mp3|wav|ogg|oga)$/)) {
        return `<audio src="${url}" controls style="max-width:100%; margin-top:8px; border-radius: 8px;"></audio>`;
    }
    return `<a href="${url}" target="_blank" style="color: var(--afg-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; padding: 6px 10px; background: rgba(0,212,255,0.1); border-radius: 8px; border: 1px solid rgba(0,212,255,0.2); transition: all 0.2s;">
        📎 ${url.split('/').pop() || 'Файл'}
    </a>`;
}
function getOperatorNameById(operatorId, defaultName) {
    const operator = typeof operatorsarray !== 'undefined' ? operatorsarray.find(op => op.operator && op.operator.id === operatorId) : null;
    return (operator && operator.operator.fullName) || defaultName;
}

function extractDate(ts) { return new Date(ts).toLocaleDateString('ru-RU', DATE_OPTIONS); }
function extractTime(ts) { return new Date(ts).toLocaleTimeString('ru-RU', TIME_OPTIONS); }

function convertToMSK(dateString) {
    const d = new Date(dateString);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)} в ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function checkAndChangeStyle() {
    const theme = localStorage.getItem('theme');
    const infoField = document.getElementById('infofield');
    if (theme === 'light') {
        infoField.classList.remove('theme-dark');
        infoField.classList.add('theme-light');
    } else {
        infoField.classList.remove('theme-light');
        infoField.classList.add('theme-dark');
    }
}

// --- ОСНОВНАЯ ЛОГИКА ОТРИСОВКИ ЧАТА ---
function fillchatbox() {
    const infoField = document.getElementById('infofield');
    infoField.innerHTML = '';

    if (!convdata) return;

    const groupIdToSection = {
        'c7bbb211-a217-4ed3-8112-98728dc382d8': 'ТП',
        '8266dbb1-db44-4910-8b5f-a140deeec5c0': 'ТП ОС',
        'b6f7f34d-2f08-fc19-3661-29ac00842898': 'КЦ'
    };

    if (convdata.groupId && groupIdToSection[convdata.groupId]) {
        infoField.setAttribute('opsetction', groupIdToSection[convdata.groupId]);
    }
    infoField.setAttribute('openhistorytime', new Date().toISOString());

    const user = convdata.channelUser;
    const payload = user.payload || {};
    const type = user.channelTpe;
    const isEmptyPayload = Object.keys(payload).length === 0;

    let result = "Widget";
    if (type === 'Telegram') result = "Telegram";
    else if (type === 'WhatsApp') result = "WhatsApp";
    else if (type === 'Widget' && payload.id) result = payload.id;
    else if (!isEmptyPayload) result = user.id;

    document.getElementById('placeusid').innerText = result;
    document.getElementById('placechatid').innerText = convdata.id;
    document.getElementById('somechatinfo').style.display = 'block';
    document.getElementById('bottommenuchhis').style.display = 'flex';

    let htmlBuilder = '';

    // УБРАЛИ ЛОГИКУ ГРУППИРОВКИ - каждое сообщение теперь полностью независимое
    for (let i = convdata.messages.length - 1; i >= 0; i--) {
        const message = convdata.messages[i];
        const date = extractDate(message.ts);
        const time = extractTime(message.ts);

        switch (message.tpe) {
            case "Question":
                const name = user.fullName || "Widget";
                let content = message.txt;

                // 1. Обработка медиа-ссылок в тегах <a>
                content = content.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]+)"[^>]*>.*?<\/a>/gi, (match, url) => {
                    if (url.match(/\.(png|jpg|jpeg|gif|webp|mp4|mov|mkv|webm|mp3|wav|ogg|oga)(?:[?#]|$)/i)) {
                        return `<div>${renderMedia(url)}</div>`;
                    }
                    return match;
                });

                // 2. Удаляем технический тег <p> со ссылкой на /attachment
                content = content.replace(/<p>https?:\/\/[^<]+\/attachment<\/p>/gi, '');

                // 3. Обрабатываем прямые ссылки в тегах <p>
                content = content.replace(/<p>(https?:\/\/[^<]+\.(png|jpg|jpeg|gif|webp|mp4|mov|mkv|webm|mp3|wav|ogg|oga))<\/p>/gi, (match, url) => {
                    return `<div>${renderMedia(url)}</div>`;
                });

                // 4. Если ссылки присланы просто текстом
                if (!content.includes('<video') && !content.includes('<img')) {
                    const mediaRegex = /(https:\/\/vimbox-resource[^\s<>"']+\.(mp4|mov|mkv|webm|mp3|wav|ogg|oga|png|jpg|jpeg|gif|webp))/gi;
                    content = content.replace(mediaRegex, (url) => {
                        return renderMedia(url);
                    });
                }

                // ВСЕГДА показываем заголовок с датой и временем
                htmlBuilder += `
                    <div class="afg-msg afg-msg-user">
                        <div class="afg-msg-header">
                            <span class="afg-msg-author">${name}</span>
                            <span class="afg-msg-date">${date} • ${time}</span>
                        </div>
                        <div class="afg-msg-body">${content}</div>
                    </div>`;
                break;

            case "Event":
                const evPayload = message.payload || {};
                let evMsg = '';

                if (message.eventTpe === 'AssignToOperator') {
                    if (evPayload.status === 'OnOperator' && evPayload.oid) evMsg = `Диалог назначен на ${getOperatorNameById(evPayload.oid, "Оператор")}`;
                    else if (evPayload.status === 'AssignedToOperator' && evPayload.oid) evMsg = `${getOperatorNameById(evPayload.oid, "Оператор")} взял(а) диалог`;
                } else if (message.eventTpe === 'CloseConversation') {
                    const { status, sender, src, closeOnAwake, awakeDt } = evPayload;
                    if (status !== 'ClosedByBot' && sender === 'userAnswerTimer') evMsg = 'Автозакрытие (нет активности)';
                    else if (status !== 'ClosedTemporary' && src !== 'delivery' && src !== 'pause' && sender && sender !== 'userAnswerTimer') evMsg = `${getOperatorNameById(sender, "Оператор")} закрыл чат!`;
                    else if (status !== 'ClosedByBot' && src === 'pause' && sender !== 'userAnswerTimer') evMsg = 'Автозакрытие после паузы!';
                    else if (status === 'ClosedTemporary' && closeOnAwake === 'true') evMsg = `${getOperatorNameById(sender, "Оператор")} пауза с автозакрытием ${convertToMSK(awakeDt)}!`;
                    else if (status === 'ClosedTemporary' && closeOnAwake === 'false') evMsg = `${getOperatorNameById(sender, "Оператор")} пауза до ${convertToMSK(awakeDt)}!`;
                    else if (src === 'delivery') evMsg = 'Закрыто рассылкой';
                    else evMsg = message.eventTpe;
                } else {
                    const mapping = {
                        NewConversation: 'Начат новый диалог', RunScenario: 'Сценарий запущен', FirstTimeInQueue: 'Диалог в очереди',
                        RunIntegration: `Запущена интеграция ${evPayload.name}`, FinishIntegration: 'Интеграция успешна',
                        CreatedByOperator: `${getOperatorNameById(evPayload.oid, "Оператор")} открыл(а) диалог`
                    };
                    evMsg = mapping[message.eventTpe] || '';
                }

                if (evMsg) {
                    htmlBuilder += `<div class="afg-msg-event">${evMsg} • ${time}</div>`;
                }
                break;

            case "AnswerOperatorWithBot": case "AnswerOperatorQuickReply": case "AnswerSystem": case "AnswerBot": case "AnswerChatterbox":
                const botName = "AutoFAQ bot";

                // ВСЕГДА показываем заголовок
                htmlBuilder += `
                    <div class="afg-msg afg-msg-bot">
                        <div class="afg-msg-header">
                            <span class="afg-msg-author">${botName}</span>
                            <span class="afg-msg-date">${date} • ${time}</span>
                        </div>
                        <div>${message.txt}</div>
                    </div>`;
                break;

            case "AnswerOperator":
                const operName = getOperatorNameById(message.operatorId, "Оператор");

                // ВСЕГДА показываем заголовок
                htmlBuilder += `
                    <div class="afg-msg afg-msg-oper">
                        <div class="afg-msg-header">
                            <span class="afg-msg-author">${operName}</span>
                            <span class="afg-msg-date">${date} • ${time}</span>
                        </div>
                        <div>${message.txt}</div>
                    </div>`;
                break;

            case "OperatorComment":
                const commentAuthor = message.operatorId === "autoFAQ"
                    ? "autoFAQ"
                    : getOperatorNameById(message.operatorId, "Оператор");

                // ВСЕГДА показываем заголовок
                htmlBuilder += `
                    <div class="afg-msg afg-msg-comment">
                        <div class="afg-msg-header">
                            <span class="afg-msg-author">${commentAuthor}</span>
                            <span class="afg-msg-date">${date} • ${time}</span>
                        </div>
                        <div>${message.txt}</div>
                    </div>`;
                break;
        }
    }

    infoField.innerHTML = htmlBuilder;
}

// --- СОБЫТИЯ И ЛОГИКА ---
document.getElementById('operatorstp').addEventListener('change', async function () {
    let objSel = this;

    // Получаем текущую дату в формате YYYY-MM-DD
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    flagsearch = 'searchbyoperator';
    document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⏳ Загрузка чатов оператора...</div>';
    resetChatInfo();

    for (let i = 1; i < objSel.length; i++) {
        if (objSel[i].selected) {
            try {
                let r = await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                    method: "POST", credentials: "include", mode: "cors",
                    headers: { "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' },
                    body: JSON.stringify({
                        serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json",
                        participatingOperatorsIds: [objSel[i].value],
                        tsFrom: `${todayStr}T00:00:00.000Z`,
                        tsTo: `${todayStr}T23:59:59.000Z`,
                        usedStatuses: ["OnOperator", "AssignedToOperator", "Active"], orderBy: "ts", orderDirection: "Asc", page: 1, limit: 20
                    })
                });
                operchatsdata = await r.json();

                if (operchatsdata.total === 0) {
                    alert(`У ${objSel[i].innerText} нет активных чатов в выбранном диапазоне`);
                    document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.5;">📭 Нет активных чатов</div>';
                    return;
                }

                foundarr = "";
                operchatsdata.items.forEach(item => {
                    const d = new Date(item.ts.replace(/\[.*?\]/g, '').trim());
                    const pad = n => String(n).padStart(2, '0');
                    const dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

                    let name = item.channelUser.fullName;
                    if (item.channelUser.payload?.userFullName) name = item.channelUser.payload.userFullName;

                    const userType = item.channelUser.payload?.userType || "";
                    const typeColor = userType ? 'style="color: #4caf50; font-weight: 600;"' : '';

                    foundarr += `<span class="chatlist" data-id="${item.conversationId}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="opacity: 0.7; font-size: 12px;">🕐 ${dateStr}</span>
                            <span ${typeColor}>${userType}</span>
                        </div>
                        <div style="margin-top: 4px; color: var(--afg-accent); font-weight: 500;">${name}</div>
                    </span>`;
                });

                document.getElementById('infofield').innerHTML = foundarr;
                bindChatListClicks(operchatsdata.items, 'searchbyoperator');

            } catch (e) {
                console.error(e);
                document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b;">❌ Ошибка загрузки</div>';
            }
        }
    }
});

function bindChatListClicks(items, mode) {
    document.querySelectorAll('.chatlist').forEach((el, index) => {
        const id = el.getAttribute('data-id');
        el.onclick = async () => {
            document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⏳ Загрузка чата...</div>';
            try {
                let r = await fetch(`https://skyeng.autofaq.ai/api/conversations/${id}`, {
                    headers: { "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' }
                });
                convdata = await r.json();
                isChatOnOperator = convdata.status === 'AssignedToOperator';
                fillchatbox();
            } catch (e) {
                console.error(e);
                document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b;">❌ Ошибка загрузки чата</div>';
            }
        };
        el.oncontextmenu = (e) => { e.preventDefault(); typeof copyToClipboard === 'function' && copyToClipboard(id); };
    });
}

function resetChatInfo() {
    document.getElementById('placeusid').innerText = '';
    document.getElementById('placechatid').innerText = '';
    document.getElementById('somechatinfo').style.display = 'none';
    document.getElementById('bottommenuchhis').style.display = 'none';
}

function resetChatHistoryUI() {
    document.getElementById('infofield').innerHTML = '';
    resetChatInfo();
    document.getElementById('chatuserhis').value = '';
    document.getElementById('hashchathis').value = '';
    document.getElementById('infofield').removeAttribute('opsetction');
    document.getElementById('infofield').removeAttribute('openhistorytime');
}

function setDefaultDates() {
    const dTo = new Date();
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('dateToChHis').value = `${dTo.getFullYear()}-${pad(dTo.getMonth() + 1)}-${pad(dTo.getDate())}`;

    const dFrom = new Date();
    dFrom.setMonth(dFrom.getMonth() - 1);
    document.getElementById('dateFromChHis').value = `${dFrom.getFullYear()}-${pad(dFrom.getMonth() + 1)}-${pad(dFrom.getDate())}`;
}

document.getElementById('hideMeChHis').onclick = () => {
    wintChatHis.style.display = 'none';
    const openBtn = document.getElementById('opennewcat');
    if (openBtn) openBtn.classList.remove('active');
    const rightPanel = document.getElementById('rightPanel');
    if (rightPanel) rightPanel.style.right = "22px";
    resetChatHistoryUI();
};

document.getElementById('clearallinfo').onclick = () => {
    resetChatHistoryUI();
    // Визуальная обратная связь
    const btn = document.getElementById('clearallinfo');
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
};

document.getElementById('chatuserhis').addEventListener('input', function () {
    typeof onlyNumbers === 'function' && onlyNumbers(this);
});

// Улучшенная обработка Enter в полях поиска
document.getElementById('chatuserhis').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn_search_history').click();
    }
});

document.getElementById('hashchathis').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn_search_history').click();
    }
});

// Улучшенная обработка Enter в textarea
document.getElementById('msgftochatornotes').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        document.getElementById('sendmsgtochatornotes').click();
    }
});

document.getElementById('back_to_chat_his').onclick = () => {
    resetChatInfo();
    document.getElementById('infofield').innerHTML = foundarr || '<div style="text-align:center; padding: 40px; opacity: 0.5;">📋 История поиска пуста</div>';
    if (foundarr) bindChatListClicks(null, flagsearch);
};

document.getElementById('chhisinstr').onclick = () => window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-chathistory%F0%9F%92%ACChatHistory');

document.getElementById('refreshchat').onclick = async () => {
    const chatId = document.getElementById('placechatid').innerText;
    if (chatId) {
        document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⏳ Обновление чата...</div>';
        await updateChatInfo(chatId);
    }
};

async function updateChatInfo(chatId) {
    try {
        const response = await fetch(`https://skyeng.autofaq.ai/api/conversations/${chatId}`, {
            headers: { "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' }
        });
        if (!response.ok) throw new Error("Ошибка сети");
        convdata = await response.json();
        isChatOnOperator = convdata.status === 'AssignedToOperator';
        fillchatbox();
    } catch (err) {
        console.error(err);
        document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b;">❌ Ошибка загрузки чата</div>';
    }
}

document.getElementById('takechat').onclick = async function () {
    const timeStart = document.getElementById('infofield').getAttribute('openhistorytime');
    if (!timeStart || (new Date() - new Date(timeStart)) / 1000 > 60) {
        return alert("⚠️ История чата открыта слишком долго. Пожалуйста, обновите чат.");
    }

    const chatId = document.getElementById('placechatid').innerText.trim();
    if (!chatId || typeof operatorId === 'undefined' || !operatorId) return alert("❌ Чат не выбран или ID оператора не найден");

    if (!confirm("📥 Забрать чат на себя?")) return;

    const assignChat = async (id) => {
        await fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
            method: "POST", credentials: "include",
            headers: { "content-type": "application/json", "x-csrf-token": aftoken },
            body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: chatId, assignToOperatorId: id })
        });
    };

    try {
        await assignChat('null');
        setTimeout(() => assignChat(operatorId), 2000);
    } catch (e) {
        console.error(e);
        alert("❌ Ошибка при попытке забрать чат");
    }
};

document.getElementById('reassign').onclick = async () => {
    const selected = document.querySelector('#operatorstp option:checked');
    const chatId = document.getElementById('placechatid').innerText.trim();

    if (!chatId || !selected || !selected.value) return alert("❌ Не выбран чат или оператор");

    if (!confirm(`🔄 Перевести чат на ${selected.textContent}?`)) return;

    try {
        await fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
            method: "POST", credentials: "include", mode: "cors",
            headers: { "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' },
            body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: chatId, assignToOperatorId: selected.value })
        });
        console.log("✅ Успешный перевод");
        alert("✅ Чат успешно переведён");
    } catch (e) {
        console.error(e);
        alert("❌ Ошибка передачи чата");
    }
};

document.getElementById('sendmsgtochatornotes').onclick = async () => {
    const mode = document.querySelector('input[name="chatornotes"]:checked')?.value;
    const chatId = document.getElementById('placechatid').innerText.trim();
    const msgField = document.getElementById('msgftochatornotes');

    if (!mode || !chatId || !msgField.value.trim()) return alert("❌ Не заполнены все поля");

    const btn = document.getElementById('sendmsgtochatornotes');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Отправка...';
    btn.disabled = true;

    try {
        const conv = await fetch(`https://skyeng.autofaq.ai/api/conversations/${chatId}`, {
            headers: { "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' }
        }).then(r => r.json());

        const payload = { sessionId: conv.sessionId, conversationId: chatId, text: `<p>${msgField.value}</p>` };
        if (mode === "Notes") payload.isComment = true;

        msgField.value = "";

        const boundary = "----WebKitFormBoundary" + Math.random().toString(16).slice(2);
        const body = `--${boundary}\r\nContent-Disposition: form-data; name="payload"\r\n\r\n${JSON.stringify(payload)}\r\n--${boundary}--\r\n`;

        await fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            method: "POST", credentials: "include", mode: "cors",
            headers: { "content-type": `multipart/form-data; boundary=${boundary}`, "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' },
            body
        });

        btn.textContent = '✅ Отправлено';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            updateChatInfo(chatId);
        }, 1000);
    } catch (e) {
        console.error(e);
        btn.textContent = '❌ Ошибка';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }
};

document.getElementById('hideuserdatainfo').onclick = () => {
    const modal = document.getElementById('userchatdata');
    modal.style.display = 'none';
};

document.getElementById('gotocrmhis').onclick = () => {
    if (typeof convdata !== 'undefined' && convdata) {
        const userId = convdata.channelUser.payload?.id || convdata.channelUser.id;
        if (userId) {
            window.open(`https://crm2.skyeng.ru/persons/${userId}`);
        } else {
            alert('❌ ID пользователя не найден в данных чата');
        }
    } else {
        alert('❌ Не выбран активный чат');
    }
};

document.getElementById('chagetheme').onclick = () => {
    const current = localStorage.getItem('theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    checkAndChangeStyle();

    // Визуальная обратная связь
    const btn = document.getElementById('chagetheme');
    btn.style.transform = 'rotate(180deg)';
    setTimeout(() => { btn.style.transform = 'rotate(0deg)'; }, 300);
};

function getopennewcatButtonPress() {
    const isHidden = wintChatHis.style.display === 'none';
    wintChatHis.style.display = isHidden ? 'flex' : 'none';

    const rp = document.getElementById('rightPanel');
    if (rp) rp.style.right = isHidden ? "482px" : "22px";

    const btn = document.getElementById('opennewcat');
    if (btn) isHidden ? btn.classList.add('active') : btn.classList.remove('active');

    if (!isHidden) return;

    checkAndChangeStyle();
    setDefaultDates();

    document.getElementById('RefrehOperators').onclick = async () => {
        let opsflag = 'Unknown';
        const userMenu = document.querySelector('.user_menu-dropdown-user_name');
        if (userMenu) {
            let prefix = userMenu.innerText.split('-')[0];
            if (['ТП', 'ТП ОС', 'КЦ', 'КМ', 'ТС', 'ТПPrem'].includes(prefix)) opsflag = prefix;
        }

        let objSel = document.getElementById("operatorstp");
        objSel.length = 1; // Очищаем список, оставляем только дефолтный 1й элемент

        const btn = document.getElementById('RefrehOperators');
        const originalText = btn.textContent;
        btn.textContent = '⏳';
        btn.disabled = true;

        try {
            let res = await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", {
                headers: { "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' }, credentials: "include"
            }).then(r => r.json());

            const statusMap = { Online: '🟢', Busy: '🟡', Pause: '🔴' };
            res.onOperator.forEach(({ operator, aCnt = 0 }) => {
                if (operator.status !== "Offline" && operator.fullName.includes(opsflag)) {
                    let opt = document.createElement('option');
                    opt.value = operator.id;
                    opt.textContent = `${statusMap[operator.status] || ''} ${operator.fullName} (${aCnt})`;
                    objSel.appendChild(opt);
                }
            });

            // Сброс селекта на первый пункт
            objSel.selectedIndex = 0;

            btn.textContent = '✅';
            setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1000);

        } catch (e) {
            console.error(e);
            btn.textContent = '❌';
            setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
        }
    };

    document.getElementById('RefrehOperators').click();
}

document.getElementById('getdatafrchat').onclick = () => {
    if (typeof convdata !== 'undefined' && convdata) {
        const modal = document.getElementById('userchatdata');

        // Переключение видимости модалки
        modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';

        if (modal.style.display === 'block') {
            let userData = convdata.channelUser.payload || {};
            let techScreeningData = userData.techScreeningData || userData["Тех.инфа об устройствах"] || "Нет данных";

            document.getElementById('datafield').innerHTML = `
                <div style="font-size:16px; margin-bottom:16px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 10px; border-left: 3px solid var(--afg-accent);">
                    <div style="font-size: 18px; font-weight: 600; color: var(--afg-accent); margin-bottom: 6px;">
                        ${userData.userFullName || convdata.channelUser.fullName}
                    </div>
                    <div style="opacity: 0.7; font-size: 13px;">
                        ${userData.userType || 'Тип не указан'}
                    </div>
                </div>
                <div style="display: grid; gap: 10px;">
                    <div style="padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px;">
                        <div style="opacity: 0.6; font-size: 11px; margin-bottom: 4px;">USER ID</div>
                        <div style="font-weight: 500;">${userData.id || 'N/A'}</div>
                    </div>
                    <div style="padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px;">
                        <div style="opacity: 0.6; font-size: 11px; margin-bottom: 4px;">📧 EMAIL</div>
                        <div style="font-weight: 500; word-break: break-all;">${userData.email || 'N/A'}</div>
                    </div>
                    <div style="padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px;">
                        <div style="opacity: 0.6; font-size: 11px; margin-bottom: 4px;">📞 PHONE</div>
                        <div style="font-weight: 500;">${userData.phone || 'N/A'}</div>
                    </div>
                    <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="opacity: 0.6; font-size: 11px; margin-bottom: 6px;">🖥️ TECH SCREENING</div>
                        <div style="font-size: 13px; line-height: 1.5; white-space: pre-wrap;">${techScreeningData}</div>
                    </div>
                </div>
            `;
        }
    } else {
        alert("❌ Не выбран активный чат");
    }
};

document.getElementById('btn_search_history').onclick = async () => {
    let userId = document.getElementById('chatuserhis').value.trim();
    let chatHash = document.getElementById('hashchathis').value.trim();

    // Получаем даты из инпутов интерфейса
    let dFrom = document.getElementById('dateFromChHis').value;
    let dTo = document.getElementById('dateToChHis').value;

    // Генерируем текущую дату для подстраховки (за текущие сутки)
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    // ЛОГИКА СЦЕНАРИЕВ:
    const dFromStr = (userId && dFrom) ? dFrom : todayStr;
    const dToStr = (userId && dTo) ? dTo : todayStr;

    document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⏳ Поиск...</div>';
    resetChatInfo();

    if (userId && !chatHash) {
        flagsearch = 'searchbyuser';
        try {
            let res = await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
                method: "POST", credentials: "include", mode: "cors",
                headers: { "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' },
                body: JSON.stringify({
                    serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json",
                    channelUserFullTextLike: userId,
                    tsFrom: `${dFromStr}T00:00:00.000Z`,
                    tsTo: `${dToStr}T23:59:59.000Z`,
                    orderBy: "ts", orderDirection: "Desc", page: 1, limit: 20
                })
            });
            data = await res.json();

            if (data.total === 0) {
                document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.5;">📭 Чат не найден в выбранном диапазоне дат</div>';
                return;
            }

            foundarr = '';
            data.items.forEach(item => {
                let d = new Date(item.ts.replace(/\[.*?\]/g, '').trim());
                let rating = item.stats.rate?.rate || '⭕';
                let mark = item.status === "ClosedByBot" ? "🤖" : (item.stats.usedStatuses === "AssignedToOperator" ? "🛠" : rating);
                let name = item.channelUser.payload?.userFullName || item.channelUser.fullName;
                let userType = item.channelUser.payload?.userType || "";

                const dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
                const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

                foundarr += `<span class="chatlist" data-id="${item.conversationId}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="opacity: 0.7; font-size: 12px;">🕐 ${dateStr} ${timeStr}</span>
                        <span style="font-size: 18px;" title="Оценка">${mark}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="color: #4caf50; font-weight: 600; font-size: 12px;">${userType}</span>
                            <span style="color: var(--afg-accent); font-weight: 500; margin-left: 6px;">${name}</span>
                        </div>
                    </div>
                </span>`;
            });

            document.getElementById('infofield').innerHTML = foundarr;
            bindChatListClicks(data.items, 'searchbyuser');

        } catch (e) {
            console.error(e);
            document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b;">❌ Ошибка поиска</div>';
        }

    } else if (!userId && chatHash) {
        flagsearch = 'searchbyhash';
        updateChatInfo(chatHash);
    } else {
        document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⚠️ Укажите только один параметр:<br>ID пользователя или Хеш чата</div>';
    }
};

// Обработчики копирования
document.getElementById('placeusid').onclick = () => {
    const text = document.getElementById('placeusid').innerText;
    if (typeof copyToClipboard === 'function') {
        copyToClipboard(text);
        // Визуальная обратная связь
        const el = document.getElementById('placeusid');
        const originalColor = el.style.color;
        el.style.color = '#4caf50';
        setTimeout(() => { el.style.color = originalColor; }, 300);
    }
};

document.getElementById('placechatid').onclick = () => {
    const chatId = document.getElementById('placechatid').innerText;
    if (typeof copyToClipboard === 'function') {
        copyToClipboard('https://skyeng.autofaq.ai/logs/' + chatId);
        // Визуальная обратная связь
        const el = document.getElementById('placechatid');
        const originalColor = el.style.color;
        el.style.color = '#4caf50';
        setTimeout(() => { el.style.color = originalColor; }, 300);
    }
};
// Инициализация при загрузке
console.log("✅ ChatHistory Premium v2.0 загружен");
console.log("📋 Особенности: Всегда видимые дата/время, премиальный Glassmorphism дизайн, улучшенная читаемость");

