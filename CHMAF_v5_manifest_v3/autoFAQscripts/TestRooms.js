/**
 * Refactored TestRooms Module (Fixed)
 * Style: Dark Glassmorphism
 * Unique Prefix: trm-
 */

(function () {
    // Внедрение уникальных стилей
    const injectStyles = () => {
        if (document.getElementById('trm-styles')) return;
        const style = document.createElement('style');
        style.id = 'trm-styles';
        style.innerHTML = `
            .trm-panel {
                background: rgba(20, 22, 30, 0.85) !important;
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 20px;
                color: #e2e8f0;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
                padding: 18px !important;
                width: 320px;
                z-index: 1000005;
            }
            .trm-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                cursor: grab;
            }
            .trm-row {
                display: flex;
                gap: 8px;
                margin-bottom: 12px;
                width: 100%;
            }
            .trm-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-bottom: 12px;
            }
            .trm-input, .trm-select {
                background: rgba(0, 0, 0, 0.3) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 10px !important;
                color: #fff !important;
                padding: 6px 10px !important;
                outline: none !important;
                font-size: 13px !important;
                width: 100%;
                box-sizing: border-box;
                transition: border-color 0.2s;
            }
            .trm-input:focus, .trm-select:focus { border-color: #4facfe !important; }
            .trm-btn {
                background: rgba(255, 255, 255, 0.06) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 10px !important;
                color: #fff !important;
                padding: 6px !important;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            }
            .trm-btn:hover { background: rgba(255, 255, 255, 0.15) !important; transform: translateY(-1px); }
            .trm-btn-primary {
                background: linear-gradient(135deg, rgba(79, 172, 254, 0.4), rgba(0, 242, 254, 0.4)) !important;
                border-color: rgba(79, 172, 254, 0.5) !important;
                font-weight: 600 !important;
                padding: 10px !important;
                width: 100% !important;
                margin-top: 5px;
                font-size: 14px;
            }
            .trm-btn-hide { width: 55px; background: rgba(56, 142, 60, 0.3) !important; font-size: 12px; }
        `;
        document.head.appendChild(style);
    };

    const win_Template = `
        <div class="trm-panel" id="trm-container">
            <div class="trm-header chmaf-drag-handle" id="trm-drag">
                <button id="hideMetestrooms" class="trm-btn trm-btn-hide">hide</button>
                <div style="display:flex; gap:5px;">
                    <button id="clrTestRooms" class="trm-btn" title="Очистить" style="font-size:14px;">🧹</button>
                    <button id="aboutTestRooms" class="trm-btn" title="Инструкция">❓</button>
                    <button id="confluenceTestRooms" class="trm-btn" title="Confluence">📋</button>
                </div>
            </div>

            <select id="lessontypeselect" class="trm-select" style="margin-bottom:10px;">
                <option disabled selected value="lessonnotselect">Выбери тип урока</option>
                <option value="test">1 - 1</option>
                <option value="test-parallel">Параллельный</option>
                <option value="test-webinar">Вебинар</option>
                <option value="test-group">Групповой</option>
            </select>

            <select id="subjecttypeselect" class="trm-select" style="margin-bottom:12px;">
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

            <div class="trm-row">
                <input id="teachforroom" class="trm-input" placeholder="ID П">
                <input id="studforroom" class="trm-input" placeholder="ID У">
            </div>

            <div class="trm-grid">
                <button id="insertteachid" class="trm-btn">👽</button>
                <button id="insertstudid" class="trm-btn">👨‍🎓</button>
                <button id="userfromchatid" class="trm-btn" style="font-size:11px;">Чат→ID</button>
                <button id="engfromchat" class="trm-btn" style="font-size:11px;">Eng→ID</button>
            </div>

            <button id="starttestroom" class="trm-btn trm-btn-primary">Создать тестовый урок</button>
        </div>
    `;

    // Инициализация
    injectStyles();
    createWindow('AF_testrooms', 'winToptestrooms', 'winLefttestrooms', win_Template);
    hideWindowOnDoubleClick('AF_testrooms');

    const TR = {
        win: document.getElementById('AF_testrooms'),
        teacher: document.getElementById('teachforroom'),
        student: document.getElementById('studforroom'),
        subject: document.getElementById('subjecttypeselect'),
        type: document.getElementById('lessontypeselect')
    };

    // --- Обработчики ссылок (Исправлено) ---
    document.getElementById('aboutTestRooms').onclick = () =>
        window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971");

    document.getElementById('confluenceTestRooms').onclick = () =>
        window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638");

    // --- Утилиты ---
    const generateHash = (len = 14) =>
        Array.from({ length: len }, () =>
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62))
        ).join('');

    const validate = (val, msg, errors) => {
        if (!val || val.length < 4) { errors.push(msg); return null; }
        return val.replace(/[^0-9,]/g, '');
    };

    const insertTestId = (key, field, label) => {
        const val = localStorage.getItem(key);
        if (val) field.value = val;
        else typeof createAndShowButton === 'function' && createAndShowButton(`Не указан ${label}`, 'error');
    };

    // --- Обработчики остальных кнопок ---
    document.getElementById('hideMetestrooms').onclick = () => TR.win.style.display = 'none';

    document.getElementById('clrTestRooms').onclick = () => {
        TR.teacher.value = ''; TR.student.value = '';
        TR.subject.value = 'subjnotselect'; TR.type.value = 'lessonnotselect';
    };

    document.getElementById("insertteachid").onclick = () => insertTestId('test_teach', TR.teacher, 'ID П');
    document.getElementById("insertstudid").onclick = () => insertTestId('test_stud', TR.student, 'ID У');

    document.getElementById('userfromchatid').onclick = () => {
        const type = typeof SearchinAFnewUI === 'function' ? SearchinAFnewUI("userType") : null;
        const id = typeof SearchinAFnewUI === 'function' ? SearchinAFnewUI("id") : null;
        if (!type || !id) return typeof createAndShowButton === 'function' && createAndShowButton('Нет выбранного чата', 'error');
        if (type === 'teacher') {
            insertTestId('test_stud', TR.student, 'ID У');
            TR.teacher.value = id;
        } else {
            insertTestId('test_teach', TR.teacher, 'ID П');
            TR.student.value = id;
        }
    };

    document.getElementById('engfromchat').onclick = () => {
        TR.type.value = 'test'; TR.subject.value = 'api-english';
        document.getElementById('userfromchatid').click();
    };

    document.getElementById('starttestroom').onclick = () => {
        const errors = [];
        const lessonType = TR.type.value === 'lessonnotselect' ? null : TR.type.value;
        const subject = TR.subject.value === 'subjnotselect' ? null : TR.subject.value;
        if (!lessonType) errors.push('Выбери тип урока');
        if (!subject) errors.push('Выбери предмет');
        const tId = validate(TR.teacher.value, 'ID преподавателя', errors);
        const sIdRaw = validate(TR.student.value, 'ID ученика', errors);
        if (errors.length) return typeof createAndShowButton === 'function' && createAndShowButton(errors.join('<br>'), 'error');
        const sId = sIdRaw.replace(/,/g, '%2C');
        const hash = generateHash();
        const url = `https://${subject}.skyeng.ru/admin/tech-support-room/create?uniqid=${hash}`;
        const params = new URLSearchParams({
            [`${hash}[type]`]: lessonType, [`${hash}[teacherId]`]: tId,
            [`${hash}[studentIds]`]: sId, [`${hash}[isOpenEntryEnabled]`]: 1,
            btn_create_and_list: ''
        });
        chrome.runtime.sendMessage({
            action: 'getFetchRequest', fetchURL: url,
            requestOptions: {
                method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params.toString(), credentials: "include"
            }
        }, response => {
            if (response?.success) {
                typeof createAndShowButton === 'function' && createAndShowButton('Тестовый урок создан! 🚀', 'message');
                setTimeout(() => TR.win.style.display = 'none', 3000);
            } else { alert('Ошибка создания: ' + (response?.error || 'unknown')); }
        });
    };

    window.getTestRoomsButtonPress = () => {
        TR.win.style.display = (TR.win.style.display === 'none' || TR.win.style.display === '') ? 'block' : 'none';
    };
})();
