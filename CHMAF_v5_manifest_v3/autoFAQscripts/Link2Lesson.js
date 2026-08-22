/**
 * Link2Lesson Module — Premium Obsidian Edition
 * Акцент: sky #38bdf8 → indigo #818cf8
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

    /**
     * Вставляет стили для модуля
     */
    const injectStyles = () => {
        if (document.getElementById('l2l-styles')) return;
        const style = document.createElement('style');
        style.id = 'l2l-styles';
        style.innerHTML = `
            .l2l-panel {
                background: linear-gradient(165deg, rgba(28, 32, 44, 0.94) 0%, rgba(12, 14, 21, 0.97) 100%) !important;
                backdrop-filter: blur(24px) saturate(140%);
                -webkit-backdrop-filter: blur(24px) saturate(140%);
                border: 1px solid rgba(255, 255, 255, 0.09);
                border-top-color: rgba(255, 255, 255, 0.16);
                border-radius: 18px;
                color: #e8ecf4;
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
                padding: 16px !important;
                width: 330px;
                box-sizing: border-box;
                z-index: 1000007;
            }
            .l2l-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                cursor: grab;
            }
            .l2l-titleblock { display: flex; align-items: center; gap: 10px; }
            .l2l-icon-chip {
                width: 34px; height: 34px;
                border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                font-size: 17px;
                background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(129, 140, 248, 0.12));
                border: 1px solid rgba(56, 189, 248, 0.35);
                box-shadow: 0 4px 14px rgba(56, 189, 248, 0.2), inset 0 1px 0 rgba(255,255,255,0.15);
            }
            .l2l-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.3px; }
            .l2l-subtitle {
                font-size: 9px; text-transform: uppercase;
                letter-spacing: 1.4px; color: rgba(255, 255, 255, 0.45);
            }

            .l2l-row { margin-bottom: 12px; width: 100%; }
            .l2l-input, .l2l-select {
                background: rgba(0, 0, 0, 0.35) !important;
                border: 1px solid rgba(255, 255, 255, 0.09) !important;
                border-radius: 10px !important;
                color: #fff !important;
                padding: 10px 13px !important;
                outline: none !important;
                font-size: 13px !important;
                font-family: inherit !important;
                width: 100%;
                box-sizing: border-box;
                transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
                color-scheme: dark;
            }
            .l2l-input:focus, .l2l-select:focus {
                border-color: rgba(56, 189, 248, 0.6) !important;
                background: rgba(0, 0, 0, 0.5) !important;
                box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12), 0 0 18px rgba(56, 189, 248, 0.08) !important;
            }
            .l2l-input::placeholder { color: rgba(255, 255, 255, 0.35); }
            .l2l-select option { background: #14161d; color: #e8ecf4; }

            .l2l-actions { display: flex; gap: 6px; }
            .l2l-btn {
                background: rgba(255, 255, 255, 0.06) !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 10px !important;
                color: #dfe6f1 !important;
                padding: 7px 11px !important;
                cursor: pointer;
                transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 12px;
                line-height: 1;
            }
            .l2l-btn:hover {
                background: rgba(255, 255, 255, 0.13) !important;
                border-color: rgba(56, 189, 248, 0.35) !important;
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
            }
            .l2l-btn:active { transform: translateY(0) scale(0.97); }

            #l2l-hide.buttonHide {
                background: rgba(52, 211, 153, 0.14) !important;
                border-color: rgba(52, 211, 153, 0.3) !important;
                color: #6ee7b7 !important;
            }
            #l2l-hide.buttonHide:hover { background: rgba(52, 211, 153, 0.28) !important; box-shadow: none !important; }

            .l2l-checkbox-group {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin: 4px 0 14px;
            }
            .l2l-checkbox-group label {
                display: flex;
                align-items: center;
                gap: 7px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 600;
                color: rgba(232, 236, 244, 0.75);
                padding: 8px 16px;
                border-radius: 20px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
            }
            .l2l-checkbox-group label:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(56, 189, 248, 0.3);
            }
            .l2l-checkbox-group input[type="checkbox"] {
                accent-color: #38bdf8;
                width: 14px; height: 14px;
                margin: 0;
                cursor: pointer;
            }

            .l2l-btn-primary {
                background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%) !important;
                border: none !important;
                color: #071018 !important;
                font-weight: 700 !important;
                padding: 13px !important;
                width: 100% !important;
                font-size: 13px !important;
                letter-spacing: 0.4px;
                text-transform: uppercase;
                box-shadow: 0 8px 22px rgba(56, 189, 248, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
            }
            .l2l-btn-primary:hover {
                filter: brightness(1.1);
                transform: translateY(-1px) !important;
                box-shadow: 0 10px 28px rgba(99, 145, 250, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
            }
            .l2l-btn-primary:active { transform: translateY(0) scale(0.98) !important; }
        `;
        document.head.appendChild(style);
    };

    /**
     * Шаблон окна для модуля
     * @type {string}
     */
    const win_Template = `
        <div class="l2l-panel" id="l2l-container">
            <div class="l2l-header chmaf-drag-handle" id="l2l-drag">
                <div class="l2l-titleblock">
                    <div class="l2l-icon-chip">🔗</div>
                    <div>
                        <div class="l2l-title">Ссылка на урок</div>
                        <div class="l2l-subtitle">Link Generator</div>
                    </div>
                </div>
                <div class="l2l-actions">
                    <button id="l2l-clear" class="l2l-btn" title="Очистить">🧹</button>
                    <button id="l2l-help" class="l2l-btn" title="Инструкция">❓</button>
                    <button id="l2l-hide" class="buttonHide" title="Скрыть">✕</button>
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

    /**
     * Инициализирует модуль
     */
    window.Link2LessonModule = {
        init: function () {
            if (document.getElementById('AF_link2less')) return;
            injectStyles();
            createWindow('AF_link2less', 'winToplink2less', 'winLeftlink2less', win_Template);
            hideWindowOnDoubleClick('AF_link2less');
            this.attachHandlers();
        },

        /**
         * Привязывает обработчики событий
         */
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
