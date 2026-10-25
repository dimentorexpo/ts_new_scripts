/**
 * Refactored TestRooms Module (Fixed)
 * Visual Style: Corporate Graphite Dark (как Queue.js)
 * Unique Prefix: trm-
 */

(function () {
    // Внедрение уникальных стилей
    const injectStyles = () => {
        if (document.getElementById('trm-styles')) return;
        const style = document.createElement('style');
        style.id = 'trm-styles';
        style.innerHTML = `
            #AF_testrooms .trm-panel {
                box-sizing: border-box;
                width: min(360px, calc(100vw - 24px));
                max-width: 100%;
                padding: 18px !important;
                color: #edf2fb;
                background:
                    radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
                    #111827 !important;
                border: 1px solid #344258 !important;
                border-radius: 18px;
                box-shadow:
                    0 26px 70px rgba(3, 9, 22, .52),
                    inset 0 1px rgba(255, 255, 255, .06) !important;
                font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
                z-index: var(--z-window-raised, 1000100);
                position: relative;
            }
            #AF_testrooms .trm-panel,
            #AF_testrooms .trm-panel * { box-sizing: border-box; }

            #AF_testrooms .trm-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 14px;
                padding-bottom: 14px;
                border-bottom: 1px solid #344258;
                cursor: move;
            }
            #AF_testrooms .trm-title {
                flex: 1;
                min-width: 0;
                padding: 7px 12px;
                color: #a6b4cb;
                background: #182335;
                border: 1px solid #364660;
                border-radius: 10px;
                letter-spacing: .03em;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            #AF_testrooms .trm-section-label {
                margin: 0 0 6px 2px;
                color: #8e96b8;
                font-size: 11px;
                font-weight: 600;
                letter-spacing: .03em;
                text-transform: uppercase;
            }

            #AF_testrooms .trm-row {
                display: flex;
                gap: 8px;
                margin-bottom: 8px;
                width: 100%;
            }
            #AF_testrooms .trm-grid {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr 1fr;
                gap: 8px;
                margin-bottom: 14px;
            }

            #AF_testrooms .trm-input,
            #AF_testrooms .trm-select {
                width: 100%;
                min-width: 0;
                height: 36px;
                color: #edf2fb !important;
                background: #0d1625 !important;
                border: 1px solid #3a4961 !important;
                border-radius: 9px !important;
                padding: 0 10px !important;
                outline: none !important;
                font-size: 13px !important;
                font-family: inherit;
                transition: background .2s, border-color .2s, box-shadow .2s;
            }
            #AF_testrooms .trm-input { font-family: 'JetBrains Mono', 'SF Mono', monospace; }
            #AF_testrooms .trm-input::placeholder { color: #6b7896; font-family: 'Inter', 'Segoe UI', sans-serif; }
            #AF_testrooms .trm-input:hover,
            #AF_testrooms .trm-select:hover {
                background: #142034 !important;
                border-color: #657caa !important;
            }
            #AF_testrooms .trm-input:focus,
            #AF_testrooms .trm-select:focus {
                background: #142034 !important;
                border-color: #829fff !important;
                box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
            }
            #AF_testrooms .trm-select option { background: #111827; color: #edf2fb; }

            #AF_testrooms .trm-btn {
                min-height: 36px;
                padding: 8px 12px;
                color: #dce5f5;
                background: #1b283c;
                border: 1px solid #3c4d68;
                border-radius: 9px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                font-family: inherit;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                white-space: nowrap;
                transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
            }
            #AF_testrooms .trm-btn:hover:not(:disabled) {
                color: #fff;
                background: #293b56;
                border-color: #7799e2;
                transform: translateY(-1px);
            }
            #AF_testrooms .trm-btn:disabled { opacity: .55; cursor: progress; }
            #AF_testrooms .trm-btn-icon { padding: 8px 10px; font-size: 14px; }
            #AF_testrooms .trm-btn-small { font-size: 11px; padding: 6px; }

            #AF_testrooms #hideMetestrooms {
                background: rgba(255, 116, 140, .08) !important;
                border-color: rgba(255, 116, 140, .3) !important;
                color: #ffb0be !important;
                padding: 8px 12px !important;
            }

            #AF_testrooms .trm-btn-primary {
                width: 100%;
                min-height: 40px;
                color: #eef3ff;
                background: #4268c9;
                border-color: #7293ed;
                box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
                font-size: 14px;
            }
            #AF_testrooms .trm-btn-primary:hover:not(:disabled) {
                background: #547ce1;
                border-color: #a2b9fa;
                box-shadow: 0 6px 19px rgba(58, 96, 205, .3);
            }
        `;
        document.head.appendChild(style);
    };

    const win_Template = `
        <div class="trm-panel" id="trm-container">
            <div class="trm-header chmaf-drag-handle" id="trm-drag">
                <button id="hideMetestrooms" class="trm-btn buttonHide" title="Скрыть">❌</button>
                <div class="trm-title">🧪ТУ</div>
                <button id="clrTestRooms" class="trm-btn trm-btn-icon" title="Очистить">🧹</button>
                <button id="aboutTestRooms" class="trm-btn trm-btn-icon" title="Инструкция">❓</button>
                <button id="confluenceTestRooms" class="trm-btn trm-btn-icon" title="Confluence">📋</button>
            </div>

            <div class="trm-section-label">Урок</div>
            <div class="trm-row">
                <select id="lessontypeselect" class="trm-select" title="Тип урока">
                    <option disabled selected value="lessonnotselect">Тип урока</option>
                    <option value="test">👤 1 - 1</option>
                    <option value="test-parallel">🔀 Параллельный</option>
                    <option value="test-webinar">📺 Вебинар</option>
                    <option value="test-group">👥 Групповой</option>
                </select>
            </div>
            <div class="trm-row" style="margin-bottom:14px;">
                <select id="subjecttypeselect" class="trm-select" title="Предмет">
                    <option disabled selected value="subjnotselect">Предмет</option>
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

            <div class="trm-section-label">Участники</div>
            <div class="trm-row">
                <input id="teachforroom" class="trm-input" placeholder="ID преподавателя" autocomplete="off">
                <input id="studforroom" class="trm-input" placeholder="ID ученика(ов)" autocomplete="off"
                       title="Несколько учеников — через запятую">
            </div>
            <div class="trm-grid">
                <button id="insertteachid" class="trm-btn" title="Подставить тестового П">👽</button>
                <button id="insertstudid" class="trm-btn" title="Подставить тестового У">👨‍🎓</button>
                <button id="userfromchatid" class="trm-btn trm-btn-small" title="ID из открытого чата">💬 Чат</button>
                <button id="engfromchat" class="trm-btn trm-btn-small" title="1-1, английский, ID из чата">🇬🇧 Eng</button>
            </div>

            <button id="starttestroom" class="trm-btn trm-btn-primary">🚀 Создать тестовый урок</button>
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

    // Сначала чистим, потом проверяем: раньше «abcd» проходило проверку длины,
    // а в запрос уходил пустой ID. Для П — один ID, для У — можно через запятую.
    const validate = (val, msg, errors, allowList = false) => {
        const clean = String(val || '').replace(allowList ? /[^0-9,]/g : /\D/g, '')
            .split(',').filter(Boolean).join(',');
        const ok = allowList ? /^\d{4,}(,\d{4,})*$/.test(clean) : /^\d{4,}$/.test(clean);
        if (!ok) { errors.push(msg); return null; }
        return clean;
    };

    // Единая точка показа уведомлений
    const notify = (msg, type) => {
        if (typeof createAndShowButton === 'function') createAndShowButton(msg, type);
    };

    const insertTestId = (key, field, label) => {
        const val = localStorage.getItem(key);
        if (val) field.value = val;
        else notify(`Не указан ${label}`, 'error');
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
        if (!type || !id) return notify('Нет выбранного чата', 'error');
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
        const sIdRaw = validate(TR.student.value, 'ID ученика', errors, true);
        if (errors.length) return notify(errors.join('<br>'), 'error');
        // URLSearchParams сам кодирует запятые как %2C;
        // прежняя ручная замена давала двойное кодирование (%252C) и ломала мульти-ID
        const sId = sIdRaw;
        const btn = document.getElementById('starttestroom');
        btn.disabled = true;
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
            btn.disabled = false;
            if (response?.success) {
                notify('Тестовый урок создан! 🚀 Приглашение на него доступно в ЛКУ и ЛКП', 'info');
                // Таймер запоминаем: при повторном открытии окна он отменяется,
                // иначе окно закрывалось «само» через пару секунд после открытия.
                clearTimeout(TR.hideTimer);
                TR.hideTimer = setTimeout(() => TR.win.style.display = 'none', 3000);
            } else {
                notify('Ошибка создания: ' + (response?.error || chrome.runtime.lastError?.message || 'unknown'), 'error');
            }
        });
    };

    window.getTestRoomsButtonPress = () => {
        clearTimeout(TR.hideTimer);
        // Реальная видимость: display === '' у открытого окна — это «видно»
        TR.win.style.display = getComputedStyle(TR.win).display === 'none' ? 'block' : 'none';
    };
})();