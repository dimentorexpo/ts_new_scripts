// ---------------------------
// HTML шаблон окна
// ---------------------------
const win_NaborStatus = `
<div class="maindivst">
    <span>
        <span class="nabor-grab">
            <div class="nabor-header" id="naborData">
                <button class="mainButton buttonHide" id="hideNaborStatus">hide</button>
                <button class="mainButton" id="openTrmTeacher" title="Открыть TRM учителя">🧑‍🏫 TRM</button>
            </div>

            <div class="nabor-input-row" id="databoNabor">
                <input class="nabor-input " id="tidNabor"
                    placeholder="Teacher ID"
                    title="Введите ID учителя, чтобы проверить информацию по статусу набора"
                    autocomplete="off" type="text">

                <button class="mainButton" id="getNaborInfo"
                    title="Запускает процесс поиска информации по статусам набора">🔍</button>
            </div>
        </span>

        <div>
            <p id="naborStatusTable" class="nabor-table"></p>
        </div>
    </span>
</div>`;

// ---------------------------
// Создание окна
// ---------------------------
createWindow('AF_NaborStatus', 'winTopNaborStatus', 'winLeftNaborStatus', win_NaborStatus);
hideWindowOnDoubleClick('AF_NaborStatus');

// ---------------------------
// DOM ссылки
// ---------------------------
const NAB = {
    win: document.getElementById('AF_NaborStatus'),
    btnHide: document.getElementById('hideNaborStatus'),
    btnGet: document.getElementById('getNaborInfo'),
    btnTRM: document.getElementById('openTrmTeacher'),
    input: document.getElementById('tidNabor'),
    table: document.getElementById('naborStatusTable')
};


// ---------------------------
// Утилиты
// ---------------------------
function formatDateToMSK(dateStr) {
    const date = new Date(dateStr);
    const msk = new Date(date.getTime() + 3 * 3600 * 1000);

    const pad = n => n.toString().padStart(2, '0');

    return `${pad(msk.getUTCDate())}.${pad(msk.getUTCMonth() + 1)}.${msk.getUTCFullYear()}, ${pad(msk.getUTCHours())}:${pad(msk.getUTCMinutes())}`;
}

function renderTable(rows) {
    NAB.table.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'nabor-table-inner';

    const headers = ["Новое значение", "Событие", "Дата изменения", "Пользователь"];
    const headerRow = document.createElement('tr');

    headers.forEach(h => {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    rows.forEach(row => table.appendChild(row));
    NAB.table.appendChild(table);
}

function createRow(valueAfter, context, date, userName) {
    const tr = document.createElement('tr');

    const cells = [
        valueAfter ? "✅" : "❌",
        context,
        formatDateToMSK(date),
        userName
    ];

    cells.forEach(text => {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
    });

    return tr;
}


// ---------------------------
// Основная логика
// ---------------------------
async function getNaborStatus() {
    const teacherId = NAB.input.value.trim();

    if (teacherId.length < 3) {
        createAndShowButton('Введите корректный ID П', 'error');
        return;
    }

    NAB.table.style.display = 'block';
    NAB.table.textContent = "Загрузка… Если данных нет — нажмите ещё раз.";

    const fetchURL = 'https://trm-api.skyeng.ru/api/v1/actionLog/getTeacherChangelog';
    const requestOptions = {
        method: "POST",
        headers: { "content-type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
            teacherId: Number(teacherId),
            property: "_common.isScheduleClosedByTeacher",
            until: null,
            lastPreviousRecordId: null
        }),
        credentials: "include"
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, async response => {
        if (!response.success) {
            createAndShowButton("Ошибка получения статусов: " + response.error, 'error');
            return;
        }

        const data = JSON.parse(response.fetchansver);

        if (!data.data) {
            createAndShowButton("Учитель не найден или указан ID ученика", 'error');
            return;
        }

        const changelog = data.data.changelog;
        const rows = [];

        for (const item of changelog) {
            const userName = await decodeUserHash(item.hash);
            rows.push(createRow(item.valueAfter, item.context, item.createdAt, userName));
        }

        renderTable(rows);
    });
}


// ---------------------------
// Декодирование hash → имя пользователя
// ---------------------------
function decodeUserHash(hash) {
    return new Promise(resolve => {
        const fetchURL = 'https://teachers-conductor.skyeng.ru/api/v1/getIdUsersData';
        const requestOptions = {
            method: "POST",
            headers: { "content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify({ hashes: [hash] }),
            credentials: "include"
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, response => {
            if (!response.success) return resolve("—");

            const data = JSON.parse(response.fetchansver);
            const user = data.data?.[0]?.data;

            if (!user) return resolve("—");

            resolve(`${user.firstName} ${user.lastName}`);
        });
    });
}


// ---------------------------
// Обработчики
// ---------------------------

// ⚡ ИСПОЛЬЗУЕМ ДЕЛЕГИРОВАНИЕ СОБЫТИЙ:
// Ждем клика по всему документу. Если кликнули по кнопке из окна Userinfo, скрипт сработает на 100%,
// даже если на момент запуска скрипта Nabor.js этой кнопки еще не существовало в коде страницы.
document.addEventListener('click', (e) => {
    const btnOpen = e.target.closest('#butTeacherNabor');

    if (btnOpen) {
        const win = NAB.win;
        if (win.style.display === '') {
            win.style.display = 'none';
        } else {
            win.style.display = '';

            // Безопасно тянем ID студента
            const idInput = document.getElementById('idstudent');
            if (idInput) {
                NAB.input.value = idInput.value.trim();
            }
            getNaborStatus();
        }
    }
});

NAB.btnHide.addEventListener('click', () => {
    NAB.win.style.display = 'none';
    NAB.table.innerHTML = '';
});

NAB.btnGet.addEventListener('click', getNaborStatus);

NAB.btnTRM.addEventListener('click', () => {
    const id = NAB.input.value.trim();
    if (id.length < 3) {
        createAndShowButton('Введите корректный ID П', 'error');
        return;
    }
    window.open(`https://trm.skyeng.ru/teacher/${id}`);
});