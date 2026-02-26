/*************************
 * CONSTANTS & CONFIG
 *************************/
const PLATFORM = {
    VIMBOX: 1
};

const ORIGIN_VIMBOX = 'https://vimbox.skyeng.ru';

const SUBJECTS = {
    english: 'english',
    math: 'math',
    'computer-science': 'computer-science',
    geography: 'geography',
    chess: 'chess',
    'social-science': 'social-science',
    history: 'history',
    biology: 'biology',
    physics: 'physics',
    literature: 'literature',
    chemistry: 'chemistry',
    russian: 'russian',
    preschool: 'preschool'
};

var win_getLessonInfo = `
    <div class="lesson-actions">
        <button id="hideMeLessonInfo" class="commonbtn">Hide</button>
        <button id="RefreshInfo" class="commonbtn">♻</button>
        <button id="ClearInfo" class="commonbtn">🧹</button>
    </div>

<div class="lesson-card">
    <div class="lesson-title">Информация о занятии</div>

    <div class="lesson-field">
        <span class="lesson-field-name">Предмет:</span>
        <span id="subjectnamefield" class="lesson-field-value"></span>
    </div>

    <div class="lesson-field">
        <span class="lesson-field-name">Создана:</span>
        <span id="creationType" class="lesson-field-value"></span>
    </div>

    <div class="lesson-field" id="roomfor-block" style="display:none;">
        <span class="lesson-field-name">Room for:</span>
        <span id="forstudentid" class="lesson-field-value"></span>
    </div>
</div>

<div class="lesson-card">
    <div class="lesson-title">Комната</div>

    <div class="lesson-field">
        <span class="lesson-field-name">Статус:</span>
        <span id="statusroom" class="lesson-field-value"></span>
    </div>

    <div class="lesson-field">
        <span class="lesson-field-name">Хеш комнаты:</span>
        <span id="hashroom" class="lesson-field-value" style="cursor:pointer"></span>
    </div>

    <div class="lesson-field">
        <span class="lesson-field-name">Тип:</span>
        <span id="lessonType" class="lesson-field-value"></span>
    </div>
</div>

<div class="lesson-card">
    <div class="lesson-title">Участники</div>
    <div style="color:bisque">Количество участников комнаты: <span id="participantCounter" style="cursor:pointer; background: chocolate; border-radius: 20px; padding: 5px;
    border: 2px solid yellowgreen;"></span></div>

    <div class="lesson-field">
        <span class="lesson-field-name">Teacher:</span>
        <span id="partteachid" class="lesson-field-value"></span>
    </div>

    <div class="lesson-field">
        <span class="lesson-field-name">Student:</span>
        <span id="partstudid" class="lesson-field-value"></span>
    </div>
</div>

<div id="allParticipants" style="display:none; position:absolute; color:bisque; top:0; right:-548px; width:548px; background:#464451; max-height:300px; overflow:auto;">
    <input id="searchForParticipant" style="margin-left: 30%;    text-align: center;" placeholder="ID для поиска">
    <table id="participantsOutput" class="participants-table">
        <thead>
            <tr>
                <th>Тип</th>
                <th>ID</th>
                <th>Имя</th>
                <th>Время входа, МСК</th>
            </tr>
        </thead>
        <tbody></tbody>
    </table>
</div>

<div class="lesson-card">
    <input id="hashfield" class="hash-input" placeholder="Введите полный хеш комнаты">
</div>

<div class="lesson-card">
    <div class="lesson-actions">
        <button id="setstclass" class="commonbtn">▶️Classwork</button>
        <button id="setstsucc" class="commonbtn">✅Success</button>
        <button id="searchHash" class="commonbtn">🔍Search</button>
    </div>
</div>
`;

const wintLessonInfo = createTSMWindow('AFMS_LessonInfo', 'winTopLessonInfo', 'winLeftLessonInfo', win_getLessonInfo);
wintLessonInfo.className = 'wintInitializeLessonInfo';

async function OpenLessonmInfoMenu() {
    const menuVisible = wintLessonInfo.style.display !== 'none';
    wintLessonInfo.style.display = menuVisible ? 'none' : '';

    if (!menuVisible) {
        openMenu();
        setupEventHandlers();
    }
}

/*************************
 * DOM CACHE
 *************************/
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

/*************************
 * URL HELPERS
 *************************/
function parseRoomURL(rawUrl = location.href) {
    if (!rawUrl) {
        throw new Error('URL пустой');
    }

    // если передали относительный URL — добавляем origin
    const url = rawUrl.startsWith('http')
        ? new URL(rawUrl)
        : new URL(rawUrl, location.origin);

    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts.length < 4) {
        throw new Error('Некорректный URL комнаты');
    }

    const subjectName = pathParts[1];
    const roomHash = pathParts[3];

    return {
        subject: `${subjectName}/room`,
        subjectName,
        roomHash
    };
}

/*************************
 * API
 *************************/
function getApiEndpoint(subject, version = 2) {
    const name = subject.split('/')[0];
    if (!SUBJECTS[name]) {
        console.error(`Предмет ${name} не поддерживается`);
        return null;
    }
    return `https://api-${SUBJECTS[name]}.skyeng.ru/api/v${version}/rooms/`;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        ...options
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}

/*************************
 * UI HELPERS
 *************************/

function clearUI() {
    Object.values(DOM).forEach(fn => {
        const el = fn();
        if (!el) return;
        if ('value' in el) el.value = '';
        else el.textContent = '';
    });

    DOM.btnClass().style.display = 'none';
    DOM.btnSuccess().style.display = 'none';
}

function filterParticipants(query) {
    const tbody = DOM.allParticipants().querySelector("tbody");
    const rows = tbody.querySelectorAll("tr");

    const isNumeric = /^\d+$/.test(query); // только цифры?

    rows.forEach(row => {
        const userId = row.children[1].textContent.toLowerCase();
        const name = row.children[2].textContent.toLowerCase();
        const q = query.toLowerCase();

        let match = false;

        if (isNumeric) {
            // поиск по ID
            match = userId.includes(q);
        } else {
            // поиск по имени
            match = name.includes(q);
        }

        row.style.display = match ? "" : "none";
    });
}



/*************************
 * CORE LOGIC
 *************************/
function sortParticipants(participants) {
    return participants.sort((a, b) => {
        // 1. teacher всегда выше student
        if (a.role === "teacher" && b.role !== "teacher") return -1;
        if (b.role === "teacher" && a.role !== "teacher") return 1;

        // 2. null (не подключался) — в самый низ
        if (!a.joinedAt && b.joinedAt) return 1;
        if (!b.joinedAt && a.joinedAt) return -1;
        if (!a.joinedAt && !b.joinedAt) return 0;

        // 3. сортировка по дате (по возрастанию)
        return new Date(a.joinedAt) - new Date(b.joinedAt);
    });
}




async function loadRoomInfo(api, roomHash, subjectName) {
    try {
        const data = await apiRequest(api + roomHash);
        console.log(data)
        DOM.status().textContent = data.status;
        DOM.hash().textContent = data.hash;
        DOM.lesType().textContent = data.type
        DOM.subject().textContent = subjectName.toUpperCase();
        DOM.creationType().textContent = data.meta.creationType == "auto" ? "Автоматически" : data.meta.creationType == "manually" ? "Вручную" : "Через админку";
        DOM.particCounter().textContent = data.allParticipantsCount
        if (data.participants.length == 2) {
            updateParticipants(data.participants);
        } else {
            updateParticipantsWebinar(data.participants);
            document.getElementById('searchForParticipant').addEventListener('input', function () {
                filterParticipants(this.value.trim());
            });

        }


        DOM.particCounter().onclick = function () {
            const el = document.getElementById('allParticipants');
            el.style.display = el.style.display === "none" ? "" : "none";
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
    const tbody = DOM.allParticipants().querySelector("tbody");
    tbody.innerHTML = "";

    const sorted = sortParticipants(participants);

    sorted.forEach(p => {
        const row = `
            <tr>
                <td>${p.role}</td>
                <td>${p.userId}</td>
                <td>${p.name}</td>
                <td>${toMoscowTime(p.joinedAt)}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}



/*************************
 * STATUS UPDATE
 *************************/
async function changeRoomStatus(status) {
    try {
        const { subject, roomHash } = DOM.hashInput().value
            ? parseRoomURL(DOM.hashInput().value)
            : parseRoomURL();

        const api = getApiEndpoint(subject);
        await apiRequest(api + roomHash, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ status, name: '' })
        });

        alert(`Статус изменён на ${status}`);
        location.reload();
    } catch (e) {
        console.error('Ошибка изменения статуса:', e);
    }
}

/*************************
 * EVENTS
 *************************/
function setupEventHandlers() {
    DOM.btnClass().onclick = () => changeRoomStatus('classwork');
    DOM.btnSuccess().onclick = () => changeRoomStatus('success');

    DOM.hash().onclick = () => {
        const link = `https://vimbox.skyeng.ru/kids/${DOM.subject().textContent.toLowerCase()}/room/${DOM.hash().textContent}`;
        copyToClipboardTSM(link);
        alert('Ссылка скопирована');
    };

    document.getElementById('ClearInfo').onclick = clearUI;
    document.getElementById('RefreshInfo').onclick = openMenu;
    document.getElementById('searchHash').onclick = () => openMenu(true);
}

/*************************
 * ENTRY
 *************************/
function openMenu(isSearch = false) {
    if (location.origin !== ORIGIN_VIMBOX) return;

    try {
        const { subject, subjectName, roomHash } = isSearch
            ? parseRoomURL(DOM.hashInput().value)
            : parseRoomURL();

        const api = getApiEndpoint(subject);

        if (!api) {
            console.error('API endpoint не определён');
            return;
        }
        loadRoomInfo(api, roomHash, subjectName);

    } catch (e) {
        console.error('Ошибка при открытии меню:', e);
    }
}

//setupEventHandlers();

DOM.allParticipants().addEventListener('mousedown', e => {
    e.stopPropagation();
});




