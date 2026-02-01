// ---------------------------
// HTML шаблон окна
// ---------------------------
const win_testrooms = `
<div class="tr-window">
    <div class="tr-header">
        <button id="hideMetestrooms" class="mainButton buttonHide" title="скрывает меню">hide</button>
        <button id="clrTestRooms" class="mainButton" title="Очистить поля">🧹</button>
        <button id="aboutTestRooms" class="mainButton" title="Инструкция">❓</button>
        <button id="confluenceTestRooms" class="mainButton" title="Confluence">📋</button>
    </div>

    <div class="tr-row">
        <select id="lessontypeselect" class="${exttheme}">
            <option disabled selected value="lessonnotselect">Выбери тип урока</option>
            <option value="test">1 - 1</option>
            <option value="test-parallel">Параллельный</option>
            <option value="test-webinar">Вебинар</option>
            <option value="test-group">Групповой</option>
        </select>
    </div>

    <div class="tr-row">
        <select id="subjecttypeselect" class="${exttheme}">
            <option disabled selected value="subjnotselect">Выбери предмет</option>
            <option value="api-english">Английский</option>
            <option value="api-biology">Биология</option>
            <option value="api-geography">География</option>
            <option value="api-preschool">Дошкольная математика</option>
            <option value="api-history">История</option>
            <option value="api-computer-science">Компьютерные курсы</option>
            <option value="api-literature">Литература</option>
            <option value="api-math">Математика</option>
            <option value="api-social-science">Обществознание</option>
            <option value="api-russian">Русский язык</option>
            <option value="api-physics">Физика</option>
            <option value="api-chemistry">Химия</option>
            <option value="api-chess">Шахматы</option>
            <option value="api-turkish">Турецкий</option>
            <option value="api-spanish">Испанский</option>
            <option value="api-portuguese">Португальский</option>
            <option value="api-korean">Корейский</option>
            <option value="api-japanese">Японский</option>
            <option value="api-italian">Итальянский</option>
            <option value="api-greek">Греческий</option>
            <option value="api-german">Немецкий</option>
            <option value="api-french">Французский</option>
            <option value="api-chinese">Китайский</option>
        </select>
    </div>

    <div class="tr-row">
        <input id="teachforroom" class="${exttheme} "style="width:50%" placeholder="ID П" autocomplete="off">
        <input id="studforroom" class="${exttheme} "style="width:50%" placeholder="ID У" autocomplete="off">
    </div>

    <div class="tr-row">
        <button id="insertteachid" class="mainButton testroomsbtn">Тест👽</button>
        <button id="insertstudid" class="mainButton testroomsbtn">Тест👨‍🎓</button>
        <button id="userfromchatid" class="mainButton testroomsbtn">Чат→ID</button>
        <button id="engfromchat" class="mainButton testroomsbtn">Eng→ID</button>
    </div>

    <div class="tr-row">
        <button id="starttestroom" class="mainButton testroomscreate">Создать тестовый урок</button>
    </div>
</div>`;


// ---------------------------
// Создание окна
// ---------------------------
createWindow('AF_testrooms', 'winToptestrooms', 'winLefttestrooms', win_testrooms);
hideWindowOnDoubleClick('AF_testrooms');
hideWindowOnClick('AF_testrooms', 'hideMetestrooms');


// ---------------------------
// Функция открытия окна (нужна TestUsers.js)
// ---------------------------
function getTestRoomsButtonPress() {
    const win = document.getElementById('AF_testrooms');
    if (!win) return;

    win.style.display = win.style.display === 'none' || win.style.display === '' ? 'block' : 'none';

    toggleButtonState('TestRooms', 'active');
    setTimeout(() => toggleButtonState('TestRooms', 'active'), 500);
}


// ---------------------------
// Инициализация элементов
// ---------------------------
function initTestRooms() {
    const TR = {
        win: document.getElementById('AF_testrooms'),
        teacher: document.getElementById('teachforroom'),
        student: document.getElementById('studforroom'),
        subject: document.getElementById('subjecttypeselect'),
        type: document.getElementById('lessontypeselect')
    };

    if (!TR.win) return;

    // ---------------------------
    // Утилиты
    // ---------------------------
    const generateHash = (len = 14) =>
        Array.from({ length: len }, () =>
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
                .charAt(Math.floor(Math.random() * 62))
        ).join('');

    const validate = (value, min, msg, errors) => {
        if (!value || value.length < min) {
            errors.push(msg);
            return null;
        }
        return value.replace(/[^0-9,]/g, '');
    };

    const insertTestId = (key, field, placeholder) => {
        const val = localStorage.getItem(key);
        if (val) field.value = val;
        else {
            field.placeholder = placeholder;
            createAndShowButton(`Не указан ${placeholder}`, 'error');
        }
    };

    const clearFields = () => {
        TR.teacher.value = '';
        TR.student.value = '';
        TR.subject.value = 'subjnotselect';
        TR.type.value = 'lessonnotselect';
    };


    // ---------------------------
    // Обработчики
    // ---------------------------
    document.getElementById("insertteachid")
        .addEventListener("click", () => insertTestId('test_teach', TR.teacher, 'ID П'));

    document.getElementById("insertstudid")
        .addEventListener("click", () => insertTestId('test_stud', TR.student, 'ID У'));

    function fillFromChat() {
        const type = SearchinAFnewUI("userType");
        const id = SearchinAFnewUI("id");

        if (!type || !id)
            return createAndShowButton('Нет выбранного чата', 'error');

        if (type === 'teacher') {
            insertTestId('test_stud', TR.student, 'ID У');
            TR.teacher.value = id;
        } else if (type === 'student') {
            insertTestId('test_teach', TR.teacher, 'ID П');
            TR.student.value = id;
        } else {
            createAndShowButton('Не удается определить тип пользователя', 'error');
        }
    }

    document.getElementById('userfromchatid').addEventListener('click', fillFromChat);

    document.getElementById('engfromchat').addEventListener('click', () => {
        TR.type.value = 'test';
        TR.subject.value = 'api-english';
        fillFromChat();
    });

    document.getElementById('clrTestRooms').addEventListener('click', clearFields);

    document.getElementById('aboutTestRooms').addEventListener('click', () =>
        window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971")
    );

    document.getElementById('confluenceTestRooms').addEventListener('click', () =>
        window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638")
    );


    // ---------------------------
    // Создание комнаты
    // ---------------------------
    document.getElementById('starttestroom').addEventListener('click', () => {
        const errors = [];

        const lessonType = TR.type.value === 'lessonnotselect' ? null : TR.type.value;
        const subject = TR.subject.value === 'subjnotselect' ? null : TR.subject.value;

        if (!lessonType) errors.push('Не выбран тип урока');
        if (!subject) errors.push('Не выбран предмет');

        const teacherId = validate(TR.teacher.value, 4, 'Не указан id преподавателя', errors);
        const studentIdRaw = validate(TR.student.value, 4, 'Не указан id ученика', errors);
        const studentId = studentIdRaw ? studentIdRaw.replace(/,/g, '%2C') : null;

        if (errors.length) {
            return createAndShowButton(errors.join('<br>'), 'error');
        }

        const hash = generateHash();
        const url = `https://${subject}.skyeng.ru/admin/tech-support-room/create?uniqid=${hash}`;

        const params = new URLSearchParams({
            [`${hash}[type]`]: lessonType,
            [`${hash}[teacherId]`]: teacherId,
            [`${hash}[studentIds]`]: studentId,
            [`${hash}[isOpenEntryEnabled]`]: 1,
            btn_create_and_list: ''
        });

        chrome.runtime.sendMessage(
            {
                action: 'getFetchRequest',
                fetchURL: url,
                requestOptions: {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: params.toString(),
                    credentials: "include"
                }
            },
            response => {
                if (!response.success) {
                    alert('Не удалось создать комнату: ' + response.error);
                    return;
                }

                createAndShowButton('Тестовый урок создан', 'message');
                clearFields();
                setTimeout(() => TR.win.style.display = 'none', 5000);
            }
        );
    });
}


// ---------------------------
// Запуск инициализации
// ---------------------------
initTestRooms();
