/* =========================================================
   TSM Lesson Info — NEON GLASS ULTRA Refactored
   ========================================================= */

const PLATFORM = { VIMBOX: 1 };
const ORIGIN_VIMBOX = 'https://vimbox.skyeng.ru';

const SUBJECTS = {
    english: 'english', math: 'math', 'computer-science': 'computer-science',
    geography: 'geography', chess: 'chess', 'social-science': 'social-science',
    history: 'history', biology: 'biology', physics: 'physics',
    literature: 'literature', chemistry: 'chemistry', russian: 'russian', preschool: 'preschool'
};

var win_getLessonInfo = `
    <div class="tsm-lesson-actions" style="display: flex; gap: 8px; margin-bottom: 10px;">
        <button id="hideMeLessonInfo" class="tsm-btn tsm-btn-hide">Hide</button>
        <button id="RefreshInfo" class="tsm-btn tsm-btn-sm" title="Обновить инфо">♻</button>
        <button id="ClearInfo" class="tsm-btn tsm-btn-sm" title="Очистить поля">🧹</button>
    </div>

    <div class="tsm-card">
        <div class="tsm-card-title">Информация о занятии</div>
        <div class="tsm-field">
            <span class="tsm-field-label">Предмет:</span>
            <span id="subjectnamefield" class="tsm-field-value"></span>
        </div>
        <div class="tsm-field">
            <span class="tsm-field-label">Создана:</span>
            <span id="creationType" class="tsm-field-value"></span>
        </div>
        <div class="tsm-field" id="roomfor-block" style="display:none;">
            <span class="tsm-field-label">Room for:</span>
            <span id="forstudentid" class="tsm-field-value"></span>
        </div>
    </div>

    <div class="tsm-card">
        <div class="tsm-card-title">Комната</div>
        <div class="tsm-field">
            <span class="tsm-field-label">Статус:</span>
            <span id="statusroom" class="tsm-field-value"></span>
        </div>
        <div class="tsm-field">
            <span class="tsm-field-label">Хеш комнаты:</span>
            <span id="hashroom" class="tsm-field-value" style="cursor:pointer; color:var(--tsm-neon-cyan);"></span>
        </div>
        <div class="tsm-field">
            <span class="tsm-field-label">Тип:</span>
            <span id="lessonType" class="tsm-field-value"></span>
        </div>
    </div>

    <div class="tsm-card">
        <div class="tsm-card-title">Участники</div>
        <div style="color:var(--tsm-text-secondary); margin-bottom: 12px; font-size: 12px; display: flex; align-items: center; justify-content: space-between;">
            <span>Количество участников:</span>
            <span id="participantCounter" title="Кликните, чтобы открыть список" style="cursor:pointer;">0</span>
        </div>
        <div class="tsm-field">
            <span class="tsm-field-label">Teacher:</span>
            <span id="partteachid" class="tsm-field-value"></span>
        </div>
        <div class="tsm-field">
            <span class="tsm-field-label">Student:</span>
            <span id="partstudid" class="tsm-field-value"></span>
        </div>
    </div>
    
    <!-- Это окно будет извлечено в корень документа при открытии -->
    <div id="allParticipants" class="tsm-window" style="display:none; width: 700px; padding: 20px;">
        <div class="tsm-modal-header" id="participantsDragHandle">
            <span class="tsm-modal-title">👥 Список участников</span>
            <button class="tsm-close-modal" id="closeParticipantsBtn" title="Закрыть">✖</button>
        </div>
        
        <div class="tsm-modal-body">
            <input id="searchForParticipant" class="tsm-input" placeholder="Введите ID или Имя для поиска..." style="margin-bottom: 15px;">
            <div class="tsm-table-wrapper" style="max-height: 350px; overflow-y: auto;">
                <table id="participantsOutput" class="tsm-table">
                    <thead>
                        <tr><th>Тип</th><th>ID</th><th>Имя</th><th>Время входа, МСК</th></tr>
                    </thead>
                    <tbody id="participantsTbody">
                        <!-- Сюда вставляются строки -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="tsm-card">
        <input id="hashfield" class="tsm-input tsm-input-hash" placeholder="Введите полный хеш комнаты">
    </div>

    <div class="tsm-card">
        <div class="tsm-lesson-actions" style="display: flex; gap: 8px;">
            <button id="setstclass" class="tsm-btn" style="flex:1;">▶️ Classwork</button>
            <button id="setstsucc" class="tsm-btn" style="flex:1;">✅ Success</button>
            <button id="searchHash" class="tsm-btn" style="flex:1;">🔍 Search</button>
        </div>
    </div>
`;

const wintLessonInfo = createTSMWindow('AFMS_LessonInfo', 'winTopLessonInfo', 'winLeftLessonInfo', win_getLessonInfo);
wintLessonInfo.className = 'tsm-window tsm-window-lesson';

async function OpenLessonmInfoMenu() {
    const menuVisible = wintLessonInfo.style.display !== 'none';
    wintLessonInfo.style.display = menuVisible ? 'none' : '';
    if (!menuVisible) {
        openMenu(false);
        setupEventHandlers();
    }
}

const DOM = {
    platform: () => document.getElementById('platformname'),
    roomFor: () => document.getElementById('roomfor'),
    studentId: () => document.getElementById('forstudentid'),
    subject: () => document.getElementById('subjectnamefield'),
    status: () => document.getElementById('statusroom'),
    hash: () => document.getElementById('hashroom'),
    lesType: () => document.getElementById('lessonType'),
    particCounter: () => document.getElementById('participantCounter'),
    allParticipants: () => document.getElementById('participantsOutput'),
    teacher: () => document.getElementById('partteachid'),
    student: () => document.getElementById('partstudid'),
    creationType: () => document.getElementById('creationType'),
    hashInput: () => document.getElementById('hashfield'),
    btnClass: () => document.getElementById('setstclass'),
    btnSuccess: () => document.getElementById('setstsucc')
};

function parseRoomURL(rawUrl = location.href) {
    if (!rawUrl) throw new Error('URL пустой');
    const url = rawUrl.startsWith('http') ? new URL(rawUrl) : new URL(rawUrl, location.origin);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length < 4) throw new Error('Некорректный URL комнаты');
    const subjectName = pathParts[1];
    const roomHash = pathParts[3];
    return { subject: `${subjectName}/room`, subjectName, roomHash };
}

function getApiEndpoint(subject, version) {
    const name = subject.split('/')[0];
    if (!SUBJECTS[name]) {
        console.error(`Предмет ${name} не поддерживается`);
        return null;
    }
    return `https://api-${SUBJECTS[name]}.skyeng.ru/api/v${version}/rooms/`;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, { credentials: 'include', ...options });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const text = await response.text();
    if (!text) return { ok: true };
    try { return JSON.parse(text); }
    catch (e) {
        console.warn("Ответ не JSON:", text);
        return { ok: true, raw: text };
    }
}

function clearUI() {
    Object.values(DOM).forEach(fn => {
        const el = fn();
        if (!el) return;
        if ('value' in el) el.value = '';
        else el.textContent = '';
    });
    DOM.btnClass().style.display = 'none';
    DOM.btnSuccess().style.display = 'none';
    DOM.particCounter().textContent = '0';
}

function filterParticipants(query) {
    const tbody = document.getElementById("participantsTbody");
    const rows = tbody.querySelectorAll("tr");
    const isNumeric = /^\d+$/.test(query);
    const q = query.toLowerCase();
    rows.forEach(row => {
        const userId = row.children[1].textContent.toLowerCase();
        const name = row.children[2].textContent.toLowerCase();
        let match = isNumeric ? userId.includes(q) : name.includes(q);
        row.style.display = match ? "" : "none";
    });
}

function sortParticipants(participants) {
    return participants.sort((a, b) => {
        if (a.role === "teacher" && b.role !== "teacher") return -1;
        if (b.role === "teacher" && a.role !== "teacher") return 1;
        if (!a.joinedAt && b.joinedAt) return 1;
        if (!b.joinedAt && a.joinedAt) return -1;
        if (!a.joinedAt && !b.joinedAt) return 0;
        return new Date(a.joinedAt) - new Date(b.joinedAt);
    });
}

async function loadRoomInfo(api, roomHash, subjectName) {
    try {
        const data = await apiRequest(api + roomHash);
        console.log(data);
        DOM.status().textContent = data.status;
        DOM.hash().textContent = data.hash;
        DOM.lesType().textContent = data.type;
        DOM.subject().textContent = subjectName.toUpperCase();
        DOM.creationType().textContent = data.meta.creationType == "auto" ? "Автоматически" : data.meta.creationType == "manually" ? "Вручную" : "Через админку";
        DOM.particCounter().textContent = data.allParticipantsCount;
        
        if (data.participants.length == 2) {
            updateParticipants(data.participants);
        } else {
            updateParticipantsWebinar(data.participants);
            document.getElementById('searchForParticipant').addEventListener('input', function () {
                filterParticipants(this.value.trim());
            });
        }
        
        // Открытие самобытного окна участников
        DOM.particCounter().onclick = function () {
            let modal = document.getElementById('allParticipants');
            if (!modal) return;

            // Вырываем окно из родителя в корень body
            if (modal.parentNode !== document.body) {
                document.body.appendChild(modal);
            }

if (modal.style.display === "none" || modal.style.display === "") {
    modal.style.display = "block";
    modal.style.position = "absolute"; // или fixed, как удобнее
    modal.style.margin   = "0";
    modal.style.zIndex   = "999999";
    modal.style.transform = "none";    // сбрасываем старый transform

    let screenCenter = (window.innerWidth / 2) - 350;
    modal.style.left = screenCenter + "px";
    modal.style.top  = "10vh";

    // запускаем анимацию появления
    modal.classList.add('tsm-modal-animate');
    setTimeout(() => modal.classList.remove('tsm-modal-animate'), 500);

    const dragHandle = document.getElementById('participantsDragHandle');
    makeDraggable(modal, dragHandle);
            } else {
                modal.style.display = "none";
            }
        };

    } catch (e) {
        console.error('Ошибка загрузки комнаты:', e);
    }
}

function updateParticipants(participants) {
    participants.forEach(p => {
        const target = p.role === 'teacher' ? DOM.teacher() : DOM.student();
        target.textContent = p.userId;
        target.title = `Имя: ${p.name}\nСоздание: ${toMoscowTime(p.startAt)}\nПодключение: ${toMoscowTime(p.joinedAt)}`;
    });
}

function updateParticipantsWebinar(participants) {
    const tbody = document.getElementById("participantsTbody");
    tbody.innerHTML = "";
    const sorted = sortParticipants(participants);
    sorted.forEach(p => {
        const row = `<tr><td>${p.role}</td><td>${p.userId}</td><td>${p.name}</td><td>${toMoscowTime(p.joinedAt)}</td></tr>`;
        tbody.innerHTML += row;
    });
}

async function changeRoomStatus(status) {
    try {
        const { subject, roomHash } = DOM.hashInput().value ? parseRoomURL(DOM.hashInput().value) : parseRoomURL();
        const api = getApiEndpoint(subject, 1);
        await apiRequest(api + roomHash, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ status, name: '' })
        });
        alert(`Статус изменён на ${status}`);
        location.reload();
    } catch (e) {
        console.error('Ошибка изменения статуса:', e);
    }
}

/* =========================================================
   Перетаскивание окна за заголовок
   ========================================================= */

function makeDraggable(windowEl, handleEl) {
    if (!windowEl || !handleEl) return;
    if (windowEl._tsmDragInitialized) return;
    windowEl._tsmDragInitialized = true;

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    handleEl.style.cursor = 'move';
    handleEl.style.userSelect = 'none';

    handleEl.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        if (e.target.closest('button, a, input')) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = windowEl.getBoundingClientRect();
        startLeft = rect.left + window.scrollX;
        startTop  = rect.top  + window.scrollY;

        windowEl.style.position = 'absolute';
        windowEl.style.left     = startLeft + 'px';
        windowEl.style.top      = startTop  + 'px';
        windowEl.style.margin   = '0';

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup',   onMouseUp);
        e.preventDefault();
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        windowEl.style.left = (startLeft + e.clientX - startX) + 'px';
        windowEl.style.top  = (startTop  + e.clientY - startY) + 'px';
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup',   onMouseUp);
    }
}

function setupEventHandlers() {
    DOM.btnClass().onclick = () => changeRoomStatus('classwork');
    DOM.btnSuccess().onclick = () => changeRoomStatus('success');
    
    DOM.hash().onclick = () => {
        const link = `https://vimbox.skyeng.ru/kids/${DOM.subject().textContent.toLowerCase()}/room/${DOM.hash().textContent}`;
        copyToClipboardTSM(link);
        alert('Ссылка скопирована');
    };
    
    document.getElementById('ClearInfo').onclick = clearUI;
    document.getElementById('RefreshInfo').onclick = () => openMenu(false);
    document.getElementById('searchHash').onclick = () => openMenu(true);
    document.getElementById('hideMeLessonInfo').onclick = () => wintLessonInfo.style.display = 'none';

    const closeBtn = document.getElementById('closeParticipantsBtn');
    if (closeBtn) {
        closeBtn.onclick = () => {
            const modal = document.getElementById('allParticipants');
            if (modal) modal.style.display = 'none';
        };
    }
    
    const allParts = document.getElementById('allParticipants');
    if (allParts) {
        allParts.addEventListener('mousedown', e => { e.stopPropagation(); });
    }
}

function openMenu(isSearch) {
    console.log("isSearch is ", isSearch);
    if (isSearch == false && location.origin !== ORIGIN_VIMBOX) return;
    try {
        const { subject, subjectName, roomHash } = isSearch ? parseRoomURL(DOM.hashInput().value) : parseRoomURL();
        console.log(roomHash);
        const api = getApiEndpoint(subject, 2);
        if (!api) {
            console.error('API endpoint не определён');
            return;
        }
        loadRoomInfo(api, roomHash, subjectName);
    } catch (e) {
        console.error('Ошибка при открытии меню:', e);
    }
}

// Глобальная функция копирования (если её нет в других модулях)
if (typeof copyToClipboardTSM === 'undefined') {
    window.copyToClipboardTSM = str => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };
}