// --- СТИЛИ GLASSMORPHISM ---
const afgStyles = document.createElement('style');
afgStyles.textContent = `
    /* Глобальные CSS переменные */
    :root {
        --afg-dark-bg: rgba(30, 30, 40, 0.85);
        --afg-dark-border: rgba(255, 255, 255, 0.15);
        --afg-accent: rgba(0, 191, 255, 0.8);
        --afg-hover: rgba(255, 255, 255, 0.2);
    }

    /* Основной контейнер панели */
    .afg-panel {
        position: fixed; top: 0; right: 0; width: 420px; height: 100vh;
        z-index: 1000000; display: flex; flex-direction: column;
        backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        box-shadow: -5px 0 25px rgba(0,0,0,0.25); font-family: 'Segoe UI', Tahoma, sans-serif;
        font-size: 14px; background: var(--afg-dark-bg); border-left: 1px solid var(--afg-dark-border); color: #f0f0f0;
    }

    /* Кнопки */
    .afg-btn {
        background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
        border-radius: 8px; color: inherit; cursor: pointer; padding: 6px 12px;
        transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center;
        backdrop-filter: blur(5px);
        text-shadow: 0 1px 3px rgba(0,0,0,0.6); /* Делает эмодзи более контрастными */
    }
    .afg-btn:hover { background: var(--afg-hover); transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
    .afg-btn:active { transform: translateY(1px); }
    .afg-btn-small { padding: 4px 8px; font-size: 16px; }

        .afg-btn-accent {
        background: rgba(0, 191, 255, 0.2);
        border-color: rgba(0, 191, 255, 0.4);
    }
    .afg-btn-accent:hover {
        background: rgba(0, 191, 255, 0.4);
        border-color: rgba(0, 191, 255, 0.6);
    }

    /* Инпуты и Селекты */
    .afg-input {
        background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.15);
        border-radius: 8px; color: #f0f0f0; padding: 6px 10px; outline: none; transition: 0.2s;
    }
    .afg-input:focus { border-color: var(--afg-accent); box-shadow: 0 0 8px var(--afg-accent); }
    .afg-input::placeholder { color: rgba(255,255,255,0.6); }
    select.afg-input option { background: #2c2c35; color: #fff; }

    /* Секции */
    .afg-header, .afg-controls, .afg-footer {
        padding: 10px; display: flex; align-items: center; background: rgba(0,0,0,0.1);
        border-bottom: 1px solid rgba(255,255,255,0.05); gap: 8px; flex-wrap: wrap;
    }
    .afg-chat-info { padding: 10px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.1); }

    /* Область сообщений */
    .afg-chat-area {
        flex: 1; overflow-y: auto; overflow-x: hidden; padding: 15px 10px;
        display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin; transition: 0.3s;
    }
    .afg-chat-area::-webkit-scrollbar { width: 6px; }
    .afg-chat-area::-webkit-scrollbar-thumb { background: rgba(150,150,150,0.5); border-radius: 10px; }

    /* Темы */
    .theme-light { background: rgba(245, 245, 245, 0.95); color: #111; border-radius: 8px 0 0 8px; }
    .theme-dark { background: transparent; color: #f0f0f0; }

    /* Стили сообщений */
    .afg-msg { padding: 10px 14px; border-radius: 14px; max-width: 90%; word-break: break-word; position: relative; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .afg-msg-user { background: rgba(0, 191, 255, 0.15); border-color: rgba(0, 191, 255, 0.3); border-bottom-left-radius: 4px; align-self: flex-start; }
    .afg-msg-oper { background: rgba(152, 155, 30, 0.26); border-color: rgba(147, 112, 219, 0.3); border-bottom-right-radius: 4px; align-self: flex-end; } /* Изменил на фиолетовый, чтобы отделить от бота */
	.afg-msg-comment { background: rgba(91, 89, 85, 0.5); border-color: rgba(57, 184, 225, 0.3); align-self: center; font-style: italic; width: 90%; }
    .afg-msg-event { text-align: center; font-size: 12px; opacity: 0.7; padding: 6px; align-self: center; background: rgba(0,0,0,0.05); border-radius: 20px; }

    /* Бот */
    .afg-msg-bot { border-bottom-right-radius: 4px; align-self: flex-end; }
    .theme-dark .afg-msg-bot { background: rgba(50, 205, 50, 0.15); border-color: rgba(50, 205, 50, 0.3); }
    .theme-light .afg-msg-bot { background: rgba(34, 139, 34, 0.2); border-color: rgba(34, 139, 34, 0.4); }

    .theme-light .afg-msg { color: #111; border-color: rgba(0,0,0,0.1); }
    .theme-dark .afg-msg { color: #f0f0f0; }

    .afg-msg-header { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 5px; opacity: 0.8; font-weight: bold; }
    .afg-msg-date { font-weight: normal; opacity: 0.6; font-size: 11px; margin-left: 10px; }

    /* Модалка */
    .afg-modal {
        position: absolute; top: 20px; left: -380px; width: 360px; max-height: 80vh; overflow: auto;
        border-radius: 16px; padding: 15px; display: none; z-index: 100;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2);
        background: rgba(40,40,50,0.95); backdrop-filter: blur(20px); color: #f0f0f0;
    }

    /* Ссылки и картинки */
    .afg-chat-area a { color: var(--afg-accent); text-decoration: none; }
    .afg-chat-area a:hover { text-decoration: underline; }
    .chat-history-image { border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: 0.2s; max-width: 200px; cursor: zoom-in; }
    .chat-history-image:hover { transform: scale(1.02); }

    .chatlist { padding: 6px; border-radius: 6px; transition: 0.2s; display: block; margin-bottom: 4px; background: rgba(0,0,0,0.05); }
    .chatlist:hover { background: rgba(150,150,150,0.15); transform: translateX(5px); cursor: pointer; }

    /* --- ГАЛЕРЕЯ OVERLAY --- */
    .afg-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999999; cursor: zoom-out; backdrop-filter: blur(8px); }
    .afg-overlay img { max-width: 90vw; max-height: 90vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); transition: opacity 0.2s; }

    .afg-gallery-nav {
        position: absolute; top: 50%; transform: translateY(-50%);
        background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); font-size: 24px;
        width: 50px; height: 50px; display: flex; justify-content: center; align-items: center; cursor: pointer; border-radius: 50%; z-index: 10000000;
        transition: 0.2s; backdrop-filter: blur(5px);
    }
    .afg-gallery-nav:hover { background: rgba(0,191,255,0.8); transform: translateY(-50%) scale(1.1); border-color: transparent; }
    .afg-nav-left { left: 30px; }
    .afg-nav-right { right: 30px; }

    .afg-gallery-counter {
        position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
        background: rgba(255,255,255,0.1); color: white; padding: 6px 16px; border-radius: 20px;
        font-size: 15px; font-weight: bold; backdrop-filter: blur(5px); z-index: 10000000; border: 1px solid rgba(255,255,255,0.2);
    }
`;
document.head.appendChild(afgStyles);

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let data = null;
const DATE_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
const TIME_OPTIONS = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

if (!localStorage.getItem('winTopChatHis')) {
    localStorage.setItem('winTopChatHis', '0');
    localStorage.setItem('winLeftChatHis', '80.6');
}
if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'dark');
}

// --- HTML ШАБЛОН ---
const win_Chathis = `
    <div class="afg-header" style="justify-content: space-between;">
        <button class="afg-btn afg-btn-small" title="Скрыть панель" id="hideMeChHis">❌</button>
        <div style="display:flex; flex:1; margin: 0 8px; gap: 4px;">
            <select class="afg-input" style="flex: 1; width:100px" id="operatorstp">
                <option selected disabled>Операторы на линии</option>
            </select>
            <button class="afg-btn afg-btn-small" title="Обновить статус операторов" id="RefrehOperators">♻</button>
        </div>
        <button class="afg-btn afg-btn-small" title="Информация пользователя" id="getdatafrchat">🗒️</button>
        <button class="afg-btn afg-btn-small" title="Очистка полей" id="clearallinfo">🧹</button>
    </div>

    <div class="afg-controls">
        <button class="afg-btn afg-btn-small" title="Назад к списку" id="back_to_chat_his">🔙</button>
        <input class="afg-input" id="chatuserhis" placeholder="ID юзера" autocomplete="off" type="text" style="flex: 1; min-width: 0; text-align:center;">
        <input class="afg-input" id="hashchathis" placeholder="Хеш чата" autocomplete="off" type="text" style="flex: 1; min-width: 0; text-align:center;">
        <button class="afg-btn afg-btn-small" title="Поиск" id="btn_search_history">🔎</button>
    </div>

    <div class="afg-controls" style="justify-content: space-between; font-size: 13px;">
        <div style="display: flex; gap: 4px;">
            <button class="afg-btn afg-btn-small" id="chhisinstr" title="Инструкция">❓</button>
            <button class="afg-btn afg-btn-small" id="refreshchat" title="Обновить чат">🔄</button>
        </div>
        <div style="display: flex; gap: 4px; align-items: center;">
            <span style="opacity: 0.8;">С</span>
            <input class="afg-input" type="date" style="padding: 2px 4px; font-size: 12px; width: 110px;" id="dateFromChHis">
            <span style="opacity: 0.8;">По</span>
            <input class="afg-input" type="date" style="padding: 2px 4px; font-size: 12px; width: 110px;" id="dateToChHis">
        </div>
        <button class="afg-btn afg-btn-small" id="chagetheme" title="Сменить тему">🌗</button>
    </div>

    <div class="afg-chat-info" id="somechatinfo" style="display:none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <div>
                <span id="usidchat" style="cursor:pointer; opacity: 0.8;" title="Копировать ID">User ID:</span>
                <span id="placeusid" style="font-weight: bold;"></span>
            </div>
            <button class="afg-btn afg-btn-small" id="takechat" title="Забрать чат на себя">Забрать</button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span id="chid" style="cursor:pointer; opacity: 0.8; user-select:none" title="Копировать ссылку">Chat ID:</span>
                <span id="placechatid" style="font-weight: bold;"></span>
            </div>
            <button class="afg-btn afg-btn-small" id="reassign" title="Перевести на выбранного оператора">🔀</button>
        </div>
    </div>

    <div id="infofield" class="afg-chat-area theme-dark"></div>

    <div class="afg-footer" id="bottommenuchhis" style="display:none; flex-direction: column;">
        <textarea class="afg-input" id="msgftochatornotes" style="width: 100%; height: 40px; resize: none; margin-bottom: 5px; text-align:center" placeholder="Введите текст сообщения или заметки"></textarea>
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <button class="afg-btn" id="sendmsgtochatornotes">Отправить</button>
            <div style="display: flex; gap: 10px; align-items: center;">
                <label style="cursor: pointer;"><input type="radio" name="chatornotes" value="Notes" checked> Заметки</label>
                <label style="cursor: pointer;"><input type="radio" name="chatornotes" value="Chat"> Чат</label>
            </div>
        </div>
    </div>

    <div id="userchatdata" class="afg-modal">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <button class="afg-btn" id="hideuserdatainfo" style="background: rgba(255, 0, 0, 0.2);">❌</button>
            <button class="afg-btn" id="gotocrmhis" style="background: rgba(0, 191, 255, 0.2);">CRM</button>
        </div>
        <div id="datafield" style="line-height: 1.5; font-size: 14px; word-break: break-all;"></div>
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
        return `<img src="${url}" class="chat-history-image" data-full="${url}">`;
    }
    if (lower.match(/\.(mp4|mov|mkv|webm)$/)) {
        // Используем структуру со <source> и добавляем preload="metadata"
        return `
            <video controls playsinline preload="metadata" style="max-width:100%; border-radius:8px; display:block; margin-top:5px;">
                <source src="${url}" type="video/mp4">
                Ваш браузер не поддерживает видео. <a href="${url}" target="_blank">Скачать файл</a>
            </video>`;
    }
    if (lower.match(/\.(mp3|wav|ogg|oga)$/)) {
        return `<audio src="${url}" controls style="max-width:100%; margin-top:5px;"></audio>`;
    }
    return `<a href="${url}" target="_blank">${url}</a>`;
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

    for (let i = convdata.messages.length - 1; i >= 0; i--) {
        const message = convdata.messages[i];
        const date = extractDate(message.ts);

        switch (message.tpe) {
            case "Question":
                const name = user.fullName || "Widget";
                let content = message.txt; // Сначала берем весь текст

                // 1. НОВОЕ: Ищем теги <a>, у которых href ведет на медиафайл (как в вашем примере с Telegram)
                content = content.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]+)"[^>]*>.*?<\/a>/gi, (match, url) => {
                    // Проверяем, есть ли в ссылке расширение медиафайла
                    if (url.match(/\.(png|jpg|jpeg|gif|webp|mp4|mov|mkv|webm|mp3|wav|ogg|oga)(?:[?#]|$)/i)) {
                        return `<div>${renderMedia(url)}</div>`; // Отдаем ссылку в ваш плеер
                    }
                    return match; // Если это обычная ссылка на сайт, не трогаем её
                });

                // 2. НОВОЕ: Удаляем технический тег <p> со ссылкой на /attachment,
                // который часто прилетает вместе с медиафайлами, чтобы не засорять окно чата
                content = content.replace(/<p>https?:\/\/[^<]+\/attachment<\/p>/gi, '');

                // 3. Старая логика: обрабатываем прямые ссылки в тегах <p>, если они остались
                content = content.replace(/<p>(https?:\/\/[^<]+\.(png|jpg|jpeg|gif|webp|mp4|mov|mkv|webm|mp3|wav|ogg|oga))<\/p>/gi, (match, url) => {
                    return `<div>${renderMedia(url)}</div>`;
                });

                // 4. Старая логика: Если ссылки присланы просто текстом
                if (!content.includes('<video') && !content.includes('<img')) {
                    const mediaRegex = /(https:\/\/vimbox-resource[^\s<>"']+\.(mp4|mov|mkv|webm|mp3|wav|ogg|oga|png|jpg|jpeg|gif|webp))/gi;
                    content = content.replace(mediaRegex, (url) => {
                        return renderMedia(url);
                    });
                }

                htmlBuilder += `
                    <div class="afg-msg afg-msg-user">
                        <div class="afg-msg-header"><span>${name}</span><span class="afg-msg-date">${date}</span></div>
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

                if (evMsg) htmlBuilder += `<div class="afg-msg-event">${evMsg} &bull; ${extractTime(message.ts)}</div>`;
                break;

            case "AnswerOperatorWithBot": case "AnswerOperatorQuickReply": case "AnswerSystem": case "AnswerBot": case "AnswerChatterbox":
                htmlBuilder += `
                    <div class="afg-msg afg-msg-bot">
                        <div class="afg-msg-header"><span>AutoFAQ bot</span><span class="afg-msg-date">${date}</span></div>
                        <div>${message.txt}</div>
                    </div>`;
                break;

            case "AnswerOperator":
                htmlBuilder += `
                    <div class="afg-msg afg-msg-oper">
                        <div class="afg-msg-header"><span>${getOperatorNameById(message.operatorId, "Оператор")}</span><span class="afg-msg-date">${date}</span></div>
                        <div>${message.txt}</div>
                    </div>`;
                break;

            case "OperatorComment":
                const commentAuthor = message.operatorId === "autoFAQ"
                    ? "autoFAQ"
                    : getOperatorNameById(message.operatorId, "Оператор");
                htmlBuilder += `
        <div class="afg-msg afg-msg-comment">
            <div class="afg-msg-header"><span>${commentAuthor}</span><span class="afg-msg-date">${date}</span></div>
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
    document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 20px;">Загрузка...</div>';
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
                        tsFrom: `${todayStr}T00:00:00.000Z`, // Подставляем сегодняшний день
                        tsTo: `${todayStr}T23:59:59.000Z`,   // Подставляем сегодняшний день
                        usedStatuses: ["OnOperator", "AssignedToOperator", "Active"], orderBy: "ts", orderDirection: "Asc", page: 1, limit: 20
                    })
                });
                operchatsdata = await r.json();

                if (operchatsdata.total === 0) {
                    alert(`У ${objSel[i].innerText} нет активных чатов в выбранном диапазоне`);
                    document.getElementById('infofield').innerHTML = '';
                    return;
                }

                foundarr = "";
                operchatsdata.items.forEach(item => {
                    const d = new Date(item.ts.replace(/\[.*?\]/g, '').trim());
                    const pad = n => String(n).padStart(2, '0');
                    const dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

                    let name = item.channelUser.fullName;
                    if (item.channelUser.payload?.userFullName) name = item.channelUser.payload.userFullName;

                    foundarr += `<span class="chatlist" data-id="${item.conversationId}"><b>${dateStr}</b> <span style="color:#00fb00">${item.channelUser.payload?.userType || ""}</span>  <span style="color:var(--afg-accent);">${name}</span></span>`;
                });

                document.getElementById('infofield').innerHTML = foundarr;
                bindChatListClicks(operchatsdata.items, 'searchbyoperator');

            } catch (e) { console.error(e); }
        }
    }
});

function bindChatListClicks(items, mode) {
    document.querySelectorAll('.chatlist').forEach((el, index) => {
        const id = el.getAttribute('data-id');
        el.onclick = async () => {
            document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 20px;">Загрузка чата...</div>';
            try {
                let r = await fetch(`https://skyeng.autofaq.ai/api/conversations/${id}`, {
                    headers: { "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' }
                });
                convdata = await r.json();
                isChatOnOperator = convdata.status === 'AssignedToOperator';
                fillchatbox();
            } catch (e) { console.error(e); document.getElementById('infofield').innerHTML = 'Ошибка загрузки'; }
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
    if (openBtn) openBtn.classList.remove('activeScriptBtn');
    const rightPanel = document.getElementById('rightPanel');
    if (rightPanel) rightPanel.style.right = "22px";
    resetChatHistoryUI();
};

document.getElementById('clearallinfo').onclick = resetChatHistoryUI;
document.getElementById('chatuserhis').addEventListener('input', function () { typeof onlyNumbers === 'function' && onlyNumbers(this); });

document.getElementById('chid').onclick = () => { typeof copyToClipboard === 'function' && copyToClipboard('https://skyeng.autofaq.ai/logs/' + document.getElementById('placechatid').innerText); };
document.getElementById('usidchat').onclick = () => { typeof copyToClipboard === 'function' && copyToClipboard(document.getElementById('placeusid').innerText); };

document.getElementById('hideuserdatainfo').onclick = () => { document.getElementById('userchatdata').style.display = 'none'; };

document.getElementById('gotocrmhis').onclick = () => {
    let fdata = document.getElementById('datafield').innerText;
    let match = fdata.match(/ID:\s?(\d+)/);
    if (match) window.open(`https://crm2.skyeng.ru/persons/${match[1]}`);
};

document.getElementById('chagetheme').onclick = () => {
    const current = localStorage.getItem('theme');
    localStorage.setItem('theme', current === 'light' ? 'dark' : 'light');
    checkAndChangeStyle();
};

function getopennewcatButtonPress() {
    const isHidden = wintChatHis.style.display === 'none';
    wintChatHis.style.display = isHidden ? 'flex' : 'none';

    const rp = document.getElementById('rightPanel');
    if (rp) rp.style.right = isHidden ? "422px" : "22px";

    const btn = document.getElementById('opennewcat');
    if (btn) isHidden ? btn.classList.add('activeScriptBtn') : btn.classList.remove('activeScriptBtn');

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

            // --- Сброс селекта на первый пункт ("Операторы на линии") ---
            objSel.selectedIndex = 0;

        } catch (e) { console.error(e); }
    };

    document.getElementById('RefrehOperators').click();
}

document.getElementById('getdatafrchat').onclick = () => {
    if (typeof convdata !== 'undefined' && convdata) {
        const modal = document.getElementById('userchatdata');

        // ИСПРАВЛЕНА ЛОГИКА ПЕРЕКЛЮЧЕНИЯ
        modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';

        let userData = convdata.channelUser.payload || {};
        let techScreeningData = userData.techScreeningData || userData["Тех.инфа об устройствах"] || "";

        document.getElementById('datafield').innerHTML = `
            <div style="font-size:16px; margin-bottom:10px;">
                <b style="color:var(--afg-accent);">${userData.userFullName || convdata.channelUser.fullName}</b>
                <span style="opacity:0.8;">(${userData.userType || 'Нет типа'})</span>
            </div>
            <b>ID:</b> ${userData.id || 'N/A'}<br>
            <b>📧:</b> ${userData.email || 'N/A'}<br>
            <b>📞:</b> ${userData.phone || 'N/A'}<br>
            <div style="margin-top:10px; background:rgba(0,0,0,0.2); padding:10px; border-radius:8px;">
                <b>Tech Screening:</b><br>${techScreeningData}
            </div>
        `;
    } else {
        alert("Не выбран активный чат");
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
    // 1. Если введен ID пользователя и даты есть в полях -> берем их.
    // 2. Если ID пустой (или если кто-то стер дату в полях) -> жестко берем текущие сутки (сегодня).
    const dFromStr = (userId && dFrom) ? dFrom : todayStr;
    const dToStr = (userId && dTo) ? dTo : todayStr;

    document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 20px;">Загрузка...</div>';
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
                    // Используем выбранные даты или сегодняшние сутки
                    tsFrom: `${dFromStr}T00:00:00.000Z`,
                    tsTo: `${dToStr}T23:59:59.000Z`,
                    orderBy: "ts", orderDirection: "Desc", page: 1, limit: 20
                })
            });
            data = await res.json();

            if (data.total === 0) {
                document.getElementById('infofield').innerHTML = '<div style="text-align:center;">Чат не найден в выбранном диапазоне дат</div>';
                return;
            }

            foundarr = '';
            data.items.forEach(item => {
                let d = new Date(item.ts.replace(/\[.*?\]/g, '').trim());
                let rating = item.stats.rate?.rate || '⭕';
                let mark = item.status === "ClosedByBot" ? "🤖" : (item.stats.usedStatuses === "AssignedToOperator" ? "🛠" : rating);
                let name = item.channelUser.payload?.userFullName || item.channelUser.fullName;

                foundarr += `<span class="chatlist" data-id="${item.conversationId}">
                    ${d.toLocaleDateString('ru-RU')} ${d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    <span style="color:var(--afg-accent);"><b>${item.channelUser.payload?.userType || ""}</b> ${name}</span>
                    <span style="float:right;">Оценка: ${mark}</span>
                </span>`;
            });

            document.getElementById('infofield').innerHTML = foundarr;
            bindChatListClicks(data.items, 'searchbyuser');

        } catch (e) { console.error(e); }

    } else if (!userId && chatHash) {
        flagsearch = 'searchbyhash';
        updateChatInfo(chatHash);
    } else {
        document.getElementById('infofield').innerHTML = '<div style="text-align:center;">Укажите только один параметр: ID пользователя или Хеш чата</div>';
    }
};

document.getElementById('back_to_chat_his').onclick = () => {
    resetChatInfo();
    document.getElementById('infofield').innerHTML = foundarr || '';
    if (foundarr) bindChatListClicks(null, flagsearch);
};

document.getElementById('chhisinstr').onclick = () => window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-chathistory%F0%9F%92%ACChatHistory');

document.getElementById('refreshchat').onclick = async () => {
    const chatId = document.getElementById('placechatid').innerText;
    if (chatId) {
        document.getElementById('infofield').innerHTML = '<div style="text-align:center;">Обновление...</div>';
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
    } catch (err) { console.error(err); }
}

document.getElementById('takechat').onclick = async function () {
    const timeStart = document.getElementById('infofield').getAttribute('openhistorytime');
    if (!timeStart || (new Date() - new Date(timeStart)) / 1000 > 60) {
        return alert("История чата открыта слишком долго. Пожалуйста, обновите чат.");
    }

    const chatId = document.getElementById('placechatid').innerText.trim();
    if (!chatId || typeof operatorId === 'undefined' || !operatorId) return alert("Чат не выбран или ID оператора не найден");

    if (!confirm("Забрать чат?")) return;

    const assignChat = async (id) => {
        await fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
            method: "POST", credentials: "include",
            headers: { "content-type": "application/json", "x-csrf-token": aftoken },
            body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: chatId, assignToOperatorId: id })
        });
    };

    await assignChat('null');
    setTimeout(() => assignChat(operatorId), 2000);
};

document.getElementById('reassign').onclick = () => {
    const selected = document.querySelector('#operatorstp option:checked');
    const chatId = document.getElementById('placechatid').innerText.trim();

    if (!chatId || !selected || !selected.value) return alert("Не выбран чат или оператор");

    fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
        method: "POST", credentials: "include", mode: "cors",
        headers: { "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' },
        body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: chatId, assignToOperatorId: selected.value })
    }).then(() => console.log("Успешный перевод")).catch(e => alert("Ошибка передачи"));
};

document.getElementById('sendmsgtochatornotes').onclick = async () => {
    const mode = document.querySelector('input[name="chatornotes"]:checked')?.value;
    const chatId = document.getElementById('placechatid').innerText.trim();
    const msgField = document.getElementById('msgftochatornotes');

    if (!mode || !chatId || !msgField.value.trim()) return alert("Не заполнены все поля");

    try {
        const conv = await fetch(`https://skyeng.autofaq.ai/api/conversations/${chatId}`, { headers: { "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : '' } }).then(r => r.json());

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

        setTimeout(() => updateChatInfo(chatId), 1000);
    } catch (e) { console.error(e); }
};