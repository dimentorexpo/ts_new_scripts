// === 1. ВСТРАИВАЕМЫЕ СТИЛИ (CYBER-DARK UI) ===
const cyberDarkStyles = `
<style>
    .cdui-gl-wrapper {
        width: 450px;
        background: #0d1117;
        border: 1px solid #30363d;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 240, 255, 0.1);
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        overflow: hidden;
        color: #c9d1d9;
    }
    .cdui-gl-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #161b22;
        padding: 12px 16px;
        border-bottom: 1px solid #30363d;
        cursor: -webkit-grab;
    }
    .cdui-gl-title {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 1px;
        color: #e6edf3;
        text-transform: uppercase;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.2);
    }
    .cdui-gl-controls {
        display: flex;
        gap: 12px;
        padding: 16px;
        background: #0d1117;
    }
    .cdui-gl-input {
        flex: 1;
        background: #010409;
        border: 1px solid #30363d;
        color: #00f0ff;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        outline: none;
        text-align: center;
        transition: all 0.3s ease;
    }
    .cdui-gl-input:focus {
        border-color: #00f0ff;
        box-shadow: 0 0 8px rgba(0, 240, 255, 0.3);
    }
    .cdui-gl-btn {
        background: #21262d;
        color: #c9d1d9;
        border: 1px solid #363e48;
        border-radius: 6px;
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        text-transform: uppercase;
        transition: all 0.2s ease;
    }
    .cdui-gl-btn-primary {
        color: #00f0ff;
        border-color: rgba(0, 240, 255, 0.4);
    }
    .cdui-gl-btn-primary:hover {
        background: rgba(0, 240, 255, 0.1);
        border-color: #00f0ff;
        box-shadow: 0 0 12px rgba(0, 240, 255, 0.4);
    }
    .cdui-gl-btn-danger:hover {
        background: rgba(255, 51, 102, 0.1);
        color: #ff3366;
        border-color: #ff3366;
        box-shadow: 0 0 12px rgba(255, 51, 102, 0.4);
    }
    .cdui-gl-content {
        max-height: 500px;
        overflow-y: auto;
        padding: 0 16px 16px 16px;
        font-size: 13px;
    }
    /* Стилизация скроллбара */
    .cdui-gl-content::-webkit-scrollbar { width: 6px; }
    .cdui-gl-content::-webkit-scrollbar-track { background: #010409; }
    .cdui-gl-content::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
    .cdui-gl-content::-webkit-scrollbar-thumb:hover { background: #8b949e; }

    /* Элементы списка */
    .cdui-gl-student-row {
        display: flex;
        align-items: center;
        padding: 8px 10px;
        border-bottom: 1px solid #21262d;
        gap: 10px;
        transition: background 0.2s;
    }
    .cdui-gl-student-row:hover { background: #161b22; }
    .cdui-gl-crm-badge {
        background: rgba(176, 38, 255, 0.15);
        color: #d2a8ff;
        border: 1px solid #b026ff;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.2s;
    }
    .cdui-gl-crm-badge:hover {
        background: #b026ff;
        color: #fff;
        box-shadow: 0 0 8px rgba(176, 38, 255, 0.6);
    }
    .cdui-gl-student-name { color: #e6edf3; flex: 1; }
    .cdui-gl-student-service { color: #8b949e; font-size: 11px; }
    .cdui-gl-teacher-row {
        margin-top: 15px;
        padding: 8px;
        color: #3fb950;
        font-weight: 600;
        text-align: center;
        border-top: 1px dashed #30363d;
    }
    .cdui-gl-status { padding: 10px; text-align: center; color: #8b949e; }
    .cdui-gl-status.error { color: #ff3366; }
</style>
`;

// === 2. РАЗМЕТКА (HTML) ===
var win_GrList =
    `${cyberDarkStyles}
    <div class="cdui-gl-wrapper">
        <div class="cdui-gl-header">
            <span class="cdui-gl-title">Group List Info</span>
            <button class="cdui-gl-btn cdui-gl-btn-danger" id="cdui-gl-hide-btn">Hide</button>
        </div>
        <div class="cdui-gl-controls">
            <input id="cdui-gl-input-id" class="cdui-gl-input" placeholder="ID группы" title="Введите ID группы для получения списка учеников" autocomplete="off" type="text">
            <button class="cdui-gl-btn cdui-gl-btn-primary" id="cdui-gl-get-btn" title="Запуск получения списка учеников группы">Get Info</button>
        </div>
        <div id="cdui-gl-results" class="cdui-gl-content"></div>
    </div>`;

// Вызовы существующих глобальных функций
const wintGrList = createWindow('AF_GrList', 'winTopGrList', 'winTopGrList', win_GrList);
hideWindowOnDoubleClick('AF_GrList');

// === 3. ЛОГИКА ОТОБРАЖЕНИЯ ОКНА ===
// 1. Используем классическую декларацию (чтобы работало "всплытие" / hoisting)
function getGrListDataButtonPress() {
    const win = document.getElementById('AF_GrList');
    if (!win) {
        console.warn("Окно AF_GrList не найдено в DOM!");
        return;
    }

    // 2. Используем getComputedStyle — это 100% надежный способ узнать, видно ли окно,
    // даже если display: none задан через классы, а не inline-стилем.
    const isHidden = window.getComputedStyle(win).display === 'none';

    if (isHidden) {
        win.style.display = ''; // Показываем
    } else {
        win.style.display = 'none'; // Скрываем
    }
}

// 3. ПРИНУДИТЕЛЬНО отправляем функцию в глобальную область видимости (Global Scope).
// Это решает проблему, если bindExternalFunc вызывается из другого скрипта расширения.
window.getGrListDataButtonPress = getGrListDataButtonPress;

document.getElementById('cdui-gl-hide-btn').addEventListener('click', () => {
    const win = document.getElementById('AF_GrList');
    if (win && win.style.display === '') {
        win.style.display = 'none';
        document.getElementById('cdui-gl-results').innerHTML = "";
        document.getElementById('cdui-gl-input-id').value = "";
    }
});

// === 4. ОПТИМИЗИРОВАННАЯ ЛОГИКА ЗАПРОСОВ (ASYNC/AWAIT PROMISE WRAPPER) ===

// Обертка для chrome.runtime.sendMessage в Promise для чистого кода
const fetchViaBackground = (messagePayload) => {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(messagePayload, (response) => {
            resolve(response);
        });
    });
};

document.getElementById('cdui-gl-get-btn').addEventListener('click', async function () {
    const resultContainer = document.getElementById('cdui-gl-results');
    const inputGroupId = document.getElementById('cdui-gl-input-id').value.trim();

    if (!inputGroupId) {
        resultContainer.innerHTML = `<div class="cdui-gl-status error">Укажите ID группы!</div>`;
        return;
    }

    resultContainer.innerHTML = `<div class="cdui-gl-status" style="color: #00f0ff; text-shadow: 0 0 5px rgba(0,240,255,0.5);">Загрузка данных...</div>`;

    try {
        // --- ЗАПРОС 1: Получение списка группы ---
        const groupResponse = await fetchViaBackground({
            action: 'getFetchRequest',
            fetchURL: `https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${inputGroupId}`,
            requestOptions: { method: 'GET' }
        });

        if (!groupResponse || !groupResponse.success) {
            resultContainer.innerHTML = `<div class="cdui-gl-status error">Не удалось получить список: ${groupResponse?.error || 'Unknown error'}</div>`;
            return;
        }

        const groupData = JSON.parse(groupResponse.fetchansver);
        const students = groupData.data?.students || [];
        const userIds = students.map(s => s.userId);

        if (userIds.length === 0) {
            resultContainer.innerHTML = `<div class="cdui-gl-status error">В группе нет учеников или группа не найдена.</div>`;
            return;
        }

        // --- ЗАПРОС 2: Получение имен ---
        const namesResponse = await fetchViaBackground({
            action: 'getFetchRequest',
            fetchURL: "https://learning-groups-storage-api.skyeng.ru/api/v1/userInfo/findByIds",
            requestOptions: {
                method: "POST",
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({ ids: userIds })
            }
        });

        // Создаем словарь (Map) для привязки имени к ID ученика
        // (это надежнее, чем поиск по индексам)
        const namesMap = {};
        if (namesResponse && namesResponse.success) {
            const namesData = JSON.parse(namesResponse.fetchansver);
            namesData.data.forEach(user => {
                const first = user.name?.first || '';
                const last = user.name?.last || '';
                namesMap[user.id] = `${first} ${last}`.trim() || 'Без имени';
            });
        }

        // --- РЕНДЕРИНГ РЕЗУЛЬТАТА ---
        resultContainer.innerHTML = ''; // Очищаем статус загрузки

        students.forEach((student, index) => {
            const studentName = namesMap[student.userId] || 'Загрузка имени не удалась';

            // Создаем DOM элементы напрямую, чтобы безопасно вешать EventListeners
            const row = document.createElement('div');
            row.className = 'cdui-gl-student-row';

            row.innerHTML = `
                <span style="color: #484f58; width: 20px;">${index + 1}.</span>
                <span class="cdui-gl-crm-badge" data-userid="${student.userId}" title="Открыть профиль в CRM">CRM</span>
                <span class="cdui-gl-student-name">${studentName} <span style="color:#8b949e; font-size:11px;">(ID: ${student.userId})</span></span>
                <span class="cdui-gl-student-service">Услуга: ${student.educationServiceId}</span>
            `;

            // Привязка клика для CRM
            row.querySelector('.cdui-gl-crm-badge').addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-userid');
                window.open(`https://crm2.skyeng.ru/persons/${id}`, '_blank');
            });

            resultContainer.appendChild(row);
        });

        // Обработка преподавателя (Исправлена логика доступа к teachers, если он лежит в data)
        const teachers = groupData.data?.teachers || groupData.teachers;
        if (teachers && teachers.length > 0) {
            const teacherRow = document.createElement('div');
            teacherRow.className = 'cdui-gl-teacher-row';
            teacherRow.innerText = `ID Преподавателя: ${teachers[0].userId}`;
            resultContainer.appendChild(teacherRow);
        }

    } catch (error) {
        console.error("Ошибка UI Списка Группы:", error);
        resultContainer.innerHTML = `<div class="cdui-gl-status error">Системная ошибка: ${error.message}</div>`;
    }
});