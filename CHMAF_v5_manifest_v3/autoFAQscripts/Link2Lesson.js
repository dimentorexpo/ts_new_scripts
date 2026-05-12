/**
 * Refactored Link2Lesson Module
 * Style: Dark Glassmorphism
 * Unique Prefix: l2l-
 */

(function () {
    const state = {
        subjects: [
            { v: "english", t: "Английский" }, { v: "math", t: "Математика" },
            { v: "russian", t: "Русский язык" }, { v: "physics", t: "Физика" },
            { v: "chemistry", t: "Химия" }, { v: "biology", t: "Биология" },
            { v: "history", t: "История" }, { v: "computer-science", t: "Информатика" },
            { v: "literature", t: "Литература" }, { v: "social-science", t: "Обществознание" },
            { v: "geography", t: "География" }, { v: "chess", t: "Шахматы" },
            { v: "spanish", t: "Испанский" }, { v: "french", t: "Французский" },
            { v: "german", t: "Немецкий" }, { v: "italian", t: "Итальянский" },
            { v: "chinese", t: "Китайский" }, { v: "japanese", t: "Японский" },
            { v: "turkish", t: "Турецкий" }, { v: "portuguese", t: "Португальский" },
            { v: "korean", t: "Корейский" }, { v: "greek", t: "Греческий" },
            { v: "preschool", t: "Дошкольник" }
        ]
    };

    const injectStyles = () => {
        if (document.getElementById('l2l-styles')) return;
        const style = document.createElement('style');
        style.id = 'l2l-styles';
        style.innerHTML = `
            .l2l-panel {
                background: rgba(20, 23, 33, 0.85) !important;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 20px;
                color: #e2e8f0;
                font-family: system-ui, -apple-system, sans-serif;
                box-shadow: 0 15px 45px rgba(0, 0, 0, 0.6);
                padding: 18px !important;
                width: 320px;
                z-index: 1000007;
            }
            .l2l-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                cursor: grab;
            }
            .l2l-row { margin-bottom: 12px; width: 100%; }
            .l2l-input, .l2l-select {
                background: rgba(0, 0, 0, 0.3) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 10px !important;
                color: #fff !important;
                padding: 7px 12px !important;
                outline: none !important;
                font-size: 13px !important;
                width: 100%;
                box-sizing: border-box;
                transition: border-color 0.2s;
            }
            .l2l-input:focus, .l2l-select:focus { border-color: #4facfe !important; }
            .l2l-btn {
                background: rgba(255, 255, 255, 0.08) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 10px !important;
                color: #fff !important;
                padding: 6px 12px !important;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 12px;
            }
            .l2l-btn:hover { background: rgba(255, 255, 255, 0.18) !important; transform: translateY(-1px); }
            .l2l-btn-primary {
                background: linear-gradient(135deg, rgba(79, 172, 254, 0.4), rgba(0, 242, 254, 0.4)) !important;
                border-color: rgba(79, 172, 254, 0.5) !important;
                font-weight: 700 !important;
                padding: 12px !important;
                width: 100% !important;
                font-size: 13px !important;
            }
            .l2l-btn-primary:hover { background: linear-gradient(135deg, rgba(79, 172, 254, 0.6), rgba(0, 242, 254, 0.6)) !important; }
            .l2l-checkbox-group {
                display: flex;
                gap: 15px;
                justify-content: center;
                font-size: 12px;
                color: #ccc;
                margin: 10px 0;
            }
            .l2l-checkbox-group label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
        `;
        document.head.appendChild(style);
    };

    const win_Template = `
        <div class="l2l-panel" id="l2l-container">
            <div class="l2l-header chmaf-drag-handle" id="l2l-drag">
                <button id="l2l-hide" class="buttonHide" style="background: rgba(56, 142, 60, 0.3);">hide</button>
                <div style="display:flex; gap:5px;">
                    <button id="l2l-clear" class="l2l-btn" title="Очистить">🧹</button>
                    <button id="l2l-help" class="l2l-btn" title="Инструкция">❓</button>
                </div>
            </div>

            <div class="l2l-row">
                <select id="l2l-subject" class="l2l-select">
                    <option disabled selected value="none">--- Выбери предмет ---</option>
                    ${state.subjects.map(s => `<option value="${s.v}">${s.t}</option>`).join('')}
                </select>
            </div>

            <div class="l2l-row">
                <input id="l2l-hash" class="l2l-input" placeholder="Введи хэш комнаты..." autocomplete="off">
            </div>

            <div class="l2l-checkbox-group">
                <label><input type="checkbox" id="l2l-is-webinar"> Вебинар</label>
                <label><input type="checkbox" id="l2l-is-hw"> ДЗ</label>
            </div>

            <button id="l2l-create" class="l2l-btn l2l-btn-primary">Скопировать ссылку</button>
        </div>
    `;

    window.Link2LessonModule = {
        init: function () {
            if (document.getElementById('AF_link2less')) return;
            injectStyles();
            createWindow('AF_link2less', 'winToplink2less', 'winLeftlink2less', win_Template);
            hideWindowOnDoubleClick('AF_link2less');
            this.attachHandlers();
        },

        attachHandlers: function () {
            const self = this;
            const ui = {
                win: document.getElementById('AF_link2less'),
                hash: document.getElementById('l2l-hash'),
                subj: document.getElementById('l2l-subject'),
                web: document.getElementById('l2l-is-webinar'),
                hw: document.getElementById('l2l-is-hw')
            };

            document.getElementById('l2l-hide').onclick = () => ui.win.style.display = 'none';

            document.getElementById('l2l-clear').onclick = () => {
                ui.hash.value = ''; ui.subj.selectedIndex = 0;
                ui.web.checked = false; ui.hw.checked = false;
            };

            document.getElementById('l2l-help').onclick = () =>
                window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971");

            // Исключающие чекбоксы
            ui.web.onchange = () => { if (ui.web.checked) ui.hw.checked = false; };
            ui.hw.onchange = () => { if (ui.hw.checked) ui.web.checked = false; };

            // Основная кнопка
            document.getElementById('l2l-create').onclick = function () {
                const subject = ui.subj.value;
                const hash = ui.hash.value.trim();
                const errors = [];

                if (subject === 'none') errors.push('Не выбран предмет');
                if (!/^[a-zA-Z0-9]{12,}$/.test(hash)) errors.push('Некорректный хэш (мин. 12 символов)');

                if (errors.length) {
                    if (typeof createAndShowButton === 'function') createAndShowButton(errors.join('<br>'), 'error');
                    else alert(errors.join('\n'));
                    return;
                }

                let param = ui.web.checked ? '?player=true' : (ui.hw.checked ? '?homework=true' : '');
                const finalLink = `https://vimbox.skyeng.ru/kids/${subject}/room/${hash}${param}`;

                if (typeof copyToClipboard === 'function') {
                    copyToClipboard(finalLink);
                    createAndShowButton('Ссылка скопирована! 💾', 'message');
                } else {
                    console.log(finalLink);
                }

                // Авто-очистка и скрытие
                setTimeout(() => { ui.win.style.display = 'none'; }, 3000);
            };
        }
    };

    // Глобальный вызов для TestUsers.js
    window.getlink2lessButtonPress = function () {
        window.Link2LessonModule.init();
        const win = document.getElementById('AF_link2less');
        win.style.display = (win.style.display === 'none' || win.style.display === '') ? 'block' : 'none';
    };

})();
