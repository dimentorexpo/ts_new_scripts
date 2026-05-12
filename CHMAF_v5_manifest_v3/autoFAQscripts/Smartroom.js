// ============================================
// SmartRoom Form - Refactored & Optimized
// Glassmorphism Premium UI
// ============================================

// Глобальная функция для кнопки меню (должна быть доступна снаружи)
window.getsmartroomformButtonPress = function () {
    const form = document.getElementById('AF_Smartroomform');
    const menu = document.getElementById('idmymenu');
    const menuBtn = document.getElementById('MainMenuBtn');

    if (!form) return;

    if (form.style.display === '') {
        form.style.display = 'none';
        if (menu) menu.style.display = 'none';
        if (menuBtn) menuBtn.classList.remove('activeScriptBtn');
    } else {
        form.style.display = '';
        if (menu) menu.style.display = 'none';
        if (menuBtn) menuBtn.classList.remove('activeScriptBtn');

        // Авто-заполнение при открытии
        const userId = SearchinAFnewUI('id');
        const userType = SearchinAFnewUI('userType');

        if (userId) {
            const clientIdInput = document.getElementById('clientid');
            if (clientIdInput) clientIdInput.value = userId;

            if (userType === 'teacher') {
                const radio = document.getElementById('typeteach');
                if (radio) radio.checked = true;
            } else if (userType === 'parent') {
                const radio = document.getElementById('typestudkids');
                if (radio) radio.checked = true;
            } else if (userType === 'student') {
                const vertical = SearchinAFnewUI('supportVertical');
                if (vertical === 'Adult' || vertical === 'Adults') {
                    const radio = document.getElementById('typestudadults');
                    if (radio) radio.checked = true;
                } else if (vertical === 'Kids' || vertical === 'Kid') {
                    const radio = document.getElementById('typestudkids');
                    if (radio) radio.checked = true;
                }
            }
        }
    }
};

(function () {
    'use strict';

    // --- Configuration ---
    const CONFIG = {
        prefix: 'sr-form',
        googleFormUrl: 'https://docs.google.com/forms/u/1/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/formResponse',
        confluenceUrl: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-smartroom%F0%9F%A6%90Smartroom',
        fields: {
            clientId: 'clientid',
            comment: 'fullcomentsmartroom',
            category2: 'cattwosmatrtoom',
            category3: 'catthreesmatrtoom',
            datalist2: 'cattwosmatrtoom-options-list',
            datalist3: 'catthreesmatrtoom-options-list'
        }
    };

    // --- CSS Styles (Glassmorphism) ---
    const styles = `
        .${CONFIG.prefix} {
            --sr-glass-bg: rgba(20, 20, 35, 0.65);
            --sr-glass-border: rgba(255, 255, 255, 0.08);
            --sr-glass-highlight: rgba(255, 255, 255, 0.15);
            --sr-accent: #6366f1;
            --sr-accent-hover: #818cf8;
            --sr-text-primary: #f1f5f9;
            --sr-text-secondary: #94a3b8;
            --sr-success: #10b981;
            --sr-error: #ef4444;
            --sr-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            --sr-blur: blur(20px) saturate(180%);

            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            width: 440px;
            background: var(--sr-glass-bg);
            backdrop-filter: var(--sr-blur);
            -webkit-backdrop-filter: var(--sr-blur);
            border: 1px solid var(--sr-glass-border);
            border-radius: 20px;
            box-shadow: var(--sr-shadow), inset 0 1px 0 var(--sr-glass-highlight);
            overflow: hidden;
            color: var(--sr-text-primary);
        }

        .${CONFIG.prefix}__header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 16px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
            border-bottom: 1px solid var(--sr-glass-border);
            cursor: -webkit-grab;
        }

        .${CONFIG.prefix}__header-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--sr-glass-border);
            color: var(--sr-text-primary);
            border-radius: 10px;
            padding: 8px 12px;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
            backdrop-filter: blur(10px);
        }

        .${CONFIG.prefix}__header-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .${CONFIG.prefix}__header-btn--icon {
            width: 32px;
            height: 32px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }

        .${CONFIG.prefix}__header-btn--right {
            margin-left: auto;
        }

        .${CONFIG.prefix}__body {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-height: 80vh;
            overflow-y: auto;
        }

        .${CONFIG.prefix}__body::-webkit-scrollbar {
            width: 6px;
        }

        .${CONFIG.prefix}__body::-webkit-scrollbar-track {
            background: transparent;
        }

        .${CONFIG.prefix}__body::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
        }

        .${CONFIG.prefix}__section {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--sr-glass-border);
            border-radius: 16px;
            padding: 16px;
            transition: all 0.3s ease;
        }

        .${CONFIG.prefix}__section:focus-within {
            background: rgba(255, 255, 255, 0.06);
            border-color: rgba(99, 102, 241, 0.3);
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
        }

        .${CONFIG.prefix}__section--error {
            background: rgba(239, 68, 68, 0.1) !important;
            border-color: rgba(239, 68, 68, 0.4) !important;
            animation: srShake 0.4s ease;
        }

        @keyframes srShake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
        }

        .${CONFIG.prefix}__label {
            display: block;
            color: #c4ffd3;
            font-weight: 600;
            font-size: 13px;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .${CONFIG.prefix}__radio-group {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .${CONFIG.prefix}__radio {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
        }

        .${CONFIG.prefix}__radio-label {
            display: inline-flex;
            align-items: center;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--sr-glass-border);
            border-radius: 12px;
            cursor: pointer;
            font-size: 13px;
            color: var(--sr-text-secondary);
            transition: all 0.2s ease;
            user-select: none;
        }

        .${CONFIG.prefix}__radio-label:hover {
            background: rgba(255, 255, 255, 0.1);
            color: var(--sr-text-primary);
        }

        .${CONFIG.prefix}__radio:checked + .${CONFIG.prefix}__radio-label {
            background: linear-gradient(135deg, var(--sr-accent) 0%, #8b5cf6 100%);
            border-color: transparent;
            color: white;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
        }

        .${CONFIG.prefix}__input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--sr-glass-border);
            border-radius: 12px;
            color: var(--sr-text-primary);
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
            box-sizing: border-box;
        }

        .${CONFIG.prefix}__input::placeholder {
            color: var(--sr-text-secondary);
        }

        .${CONFIG.prefix}__input:focus {
            border-color: var(--sr-accent);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .${CONFIG.prefix}__input--error {
            border-color: var(--sr-error) !important;
            background: rgba(239, 68, 68, 0.1) !important;
        }

        .${CONFIG.prefix}__textarea {
            width: 100%;
            min-height: 100px;
            padding: 12px 16px;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid var(--sr-glass-border);
            border-radius: 12px;
            color: var(--sr-text-primary);
            font-size: 14px;
            outline: none;
            resize: vertical;
            transition: all 0.2s ease;
            box-sizing: border-box;
            font-family: inherit;
        }

        .${CONFIG.prefix}__textarea:focus {
            border-color: var(--sr-accent);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
        }

        .${CONFIG.prefix}__submit {
            width: 100%;
            padding: 14px 24px;
            background: linear-gradient(135deg, var(--sr-accent) 0%, #8b5cf6 100%);
            border: none;
            border-radius: 14px;
            color: white;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            margin-top: 8px;
        }

        .${CONFIG.prefix}__submit::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
        }

        .${CONFIG.prefix}__submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }

        .${CONFIG.prefix}__submit:hover::before {
            left: 100%;
        }

        .${CONFIG.prefix}__submit:active {
            transform: translateY(0);
        }
    `;

    // --- HTML Template ---
    const win_smartroomform = `
        <style>${styles}</style>
        <div class="${CONFIG.prefix}">
            <div class="${CONFIG.prefix}__header chmaf-drag-handle" id="smartroomsug_form_header">
                <button class="${CONFIG.prefix}__header-btn ${CONFIG.prefix}__header-btn--icon buttonHide" title="скрывает меню" id="hideMeSmartRoomForm">✕</button>
                <button class="${CONFIG.prefix}__header-btn ${CONFIG.prefix}__header-btn--icon" title="Обновляет хеш чата" id="refreshhashsmartform">↻</button>
                <button class="${CONFIG.prefix}__header-btn ${CONFIG.prefix}__header-btn--icon" title="Очищает поля формы" id="clearsmartroomform">🧹</button>
                <button class="${CONFIG.prefix}__header-btn ${CONFIG.prefix}__header-btn--right" title="Инструкция по форме" id="smartroomforminstr">❓</button>
            </div>

            <div class="${CONFIG.prefix}__body" id="smartroom_form_menu">
                <!-- Client Type -->
                <div class="${CONFIG.prefix}__section" id="smartroomuser">
                    <label class="${CONFIG.prefix}__label">Тип клиента</label>
                    <div class="${CONFIG.prefix}__radio-group">
                        <input class="${CONFIG.prefix}__radio" type="radio" id="typestudadults" name="typetoform" value="Ученик Adults">
                        <label class="${CONFIG.prefix}__radio-label" for="typestudadults">Ученик Adults</label>

                        <input class="${CONFIG.prefix}__radio" type="radio" id="typestudkids" name="typetoform" value="Ученик Kids">
                        <label class="${CONFIG.prefix}__radio-label" for="typestudkids">Ученик Kids</label>

                        <input class="${CONFIG.prefix}__radio" type="radio" id="typestudprem" name="typetoform" value="Ученик Premium">
                        <label class="${CONFIG.prefix}__radio-label" for="typestudprem">Ученик Premium</label>

                        <input class="${CONFIG.prefix}__radio" type="radio" id="typeteach" name="typetoform" value="Преподаватель">
                        <label class="${CONFIG.prefix}__radio-label" for="typeteach">Преподаватель</label>
                    </div>
                </div>

                <!-- Format -->
                <div class="${CONFIG.prefix}__section" id="smartroomformat">
                    <label class="${CONFIG.prefix}__label">Формат обучения</label>
                    <div class="${CONFIG.prefix}__radio-group">
                        <input class="${CONFIG.prefix}__radio" type="radio" id="formatF2F" name="formattoform" value="F2F">
                        <label class="${CONFIG.prefix}__radio-label" for="formatF2F">F2F</label>

                        <input class="${CONFIG.prefix}__radio" type="radio" id="formatF2G" name="formattoform" value="F2G">
                        <label class="${CONFIG.prefix}__radio-label" for="formatF2G">F2G</label>

                        <input class="${CONFIG.prefix}__radio" type="radio" id="formatvebinar" name="formattoform" value="Вебинар">
                        <label class="${CONFIG.prefix}__radio-label" for="formatvebinar">Вебинар</label>

                        <input class="${CONFIG.prefix}__radio" type="radio" id="formatPU" name="formattoform" value="ПУ">
                        <label class="${CONFIG.prefix}__radio-label" for="formatPU">ПУ</label>
                    </div>
                </div>

                <!-- Client ID -->
                <input class="${CONFIG.prefix}__input" id="clientid" placeholder="ID пользователя" autocomplete="off" type="text">

                <!-- Question Type -->
                <div class="${CONFIG.prefix}__section" id="smartroomquestion">
                    <label class="${CONFIG.prefix}__label">С чем обратились?</label>
                    <div class="${CONFIG.prefix}__radio-group">
                        <input class="${CONFIG.prefix}__radio" type="radio" checked id="whatobratsugest" name="whatobratform" value="Пожелание по улучшению">
                        <label class="${CONFIG.prefix}__radio-label" for="whatobratsugest">Пожелания</label>
                    </div>
                </div>

                <!-- Ecosystem -->
                <div class="${CONFIG.prefix}__section" id="smartroomecosysrem">
                    <label class="${CONFIG.prefix}__label">Экосистема</label>
                    <div class="${CONFIG.prefix}__radio-group">
                        <input class="${CONFIG.prefix}__radio" type="radio" id="ecosystemplat" name="smartroomecos" value="Функционал платформы">
                        <label class="${CONFIG.prefix}__radio-label" for="ecosystemplat">Функционал платформы</label>

                        <input class="${CONFIG.prefix}__radio" type="radio" id="ecosystemios" name="smartroomecos" value="Мобильное приложение IOS">
                        <label class="${CONFIG.prefix}__radio-label" for="ecosystemios">МП IOS</label>

                        <input class="${CONFIG.prefix}__radio" type="radio" id="ecosystemandr" name="smartroomecos" value="Мобильное приложение Android">
                        <label class="${CONFIG.prefix}__radio-label" for="ecosystemandr">МП Android</label>
                    </div>
                </div>

                <!-- Category 2 -->
                <div class="${CONFIG.prefix}__section">
                    <input class="${CONFIG.prefix}__input" type="text" id="cattwosmatrtoom" list="cattwosmatrtoom-options-list" placeholder="Выбрать тему">
                    <datalist id="cattwosmatrtoom-options-list">
                        <option value="Домашние задания">
                        <option value="Интерфейс платформы">
                        <option value="Функционал урока П">
                        <option value="Функционал урока У">
                        <option value="Вернуть старую платформу">
                        <option value="Мобильное приложение Skyeng">
                    </datalist>
                </div>

                <!-- Category 3 -->
                <div class="${CONFIG.prefix}__section">
                    <input class="${CONFIG.prefix}__input" type="text" id="catthreesmatrtoom" list="catthreesmatrtoom-options-list" placeholder="Выбрать подтему">
                    <datalist id="catthreesmatrtoom-options-list">
                        <option value="Интерфейс раздела домашки">
                        <option value="Нет">
                        <option value="Перемешаны слайды в уроке">
                        <option value="План урока">
                        <option value="План урока\\домашки">
                        <option value="Вложения">
                        <option value="Домашка">
                        <option value="Информирование">
                        <option value="Навигация в домашке">
                        <option value="Не видно какие уроки уже пройдены У">
                        <option value="П не может изменить оценку">
                        <option value="Предложения по улучшению">
                        <option value="Сброс ответов">
                        <option value="Вход в урок">
                        <option value="Заметки">
                        <option value="Масштабирование видео">
                        <option value="Не находит словарь">
                        <option value="Нет отображения кол-ва символов">
                        <option value="Нумерация степов в уроке">
                        <option value="ОС">
                        <option value="Плохой шрифт">
                        <option value="Словарь">
                        <option value="Урок">
                        <option value="Ширина доски">
                        <option value="Баллы и картинки">
                        <option value="Нет прохождения тестов">
                        <option value="Повтор пройденного материала">
                        <option value="Связь У с П">
                        <option value="Звуки">
                        <option value="Перевод слов на стороне У">
                    </datalist>
                </div>

                <!-- Comment & Submit -->
                <div>
                    <textarea class="${CONFIG.prefix}__textarea" id="fullcomentsmartroom" placeholder="Полный комментарий предложения по улучшению" autocomplete="off" data-gramm="false" wt-ignore-input="true"></textarea>
                    <button class="${CONFIG.prefix}__submit" title="Отправляет заполненные поля формы в док" id="send2smartroom">Отправить</button>
                </div>
            </div>
        </div>
    `;

    // --- Window Initialization ---
    const wintSmartroom = createWindow('AF_Smartroomform', 'winTopSmartroom', 'winLeftSmartroom', win_smartroomform);
    hideWindowOnDoubleClick('AF_Smartroomform');
    hideWindowOnClick('AF_Smartroomform', 'hideMeSmartRoomForm');

    // --- Utility Functions ---

    function validateDatalistInput(e) {
        const input = e.target;
        const listId = input.getAttribute('list');
        const datalist = document.getElementById(listId);

        if (!datalist) return;

        const validValues = Array.from(datalist.options).map(opt => opt.value);
        const isValid = validValues.includes(input.value);

        input.setCustomValidity(isValid ? '' : 'Пожалуйста, выберите одно из доступных значений.');
        input.toggleAttribute('data-valid', isValid);
        input.classList.toggle(`${CONFIG.prefix}__input--error`, !isValid && input.value !== '');
    }

    function getCheckedRadioValue(name) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        return checked ? checked.value : null;
    }

    function validateRadioSection(name, sectionId) {
        const section = document.getElementById(sectionId);
        const isValid = !!getCheckedRadioValue(name);
        section.classList.toggle(`${CONFIG.prefix}__section--error`, !isValid);
        return isValid;
    }

    function validateTextInput(elementId, minLength = 3) {
        const element = document.getElementById(elementId);
        const isValid = element.value.trim().length >= minLength;
        element.classList.toggle(`${CONFIG.prefix}__input--error`, !isValid);
        return isValid;
    }

    function validateDatalist(elementId) {
        const element = document.getElementById(elementId);
        const isValid = element.hasAttribute('data-valid');
        element.classList.toggle(`${CONFIG.prefix}__input--error`, !isValid);
        return isValid;
    }

    function getDatalistValue(elementId) {
        const element = document.getElementById(elementId);
        const datalist = document.getElementById(element.getAttribute('list'));
        if (!datalist || !element.hasAttribute('data-valid')) return null;

        const option = Array.from(datalist.options).find(opt => opt.value === element.value);
        return option ? option.value : null;
    }

    function clearForm() {
        const elementsToClear = [
            CONFIG.fields.clientId,
            CONFIG.fields.comment,
            CONFIG.fields.category2,
            CONFIG.fields.category3
        ];

        elementsToClear.forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = '';
            }
            element.classList.remove(`${CONFIG.prefix}__section--error`, `${CONFIG.prefix}__input--error`);
            element.removeAttribute('data-valid');
        });

        document.querySelectorAll(`.${CONFIG.prefix}__radio`).forEach(radio => {
            radio.checked = false;
        });

        const defaultQuestion = document.getElementById('whatobratsugest');
        if (defaultQuestion) defaultQuestion.checked = true;

        ['smartroomuser', 'smartroomformat', 'smartroomecosysrem'].forEach(id => {
            const section = document.getElementById(id);
            if (section) section.classList.remove(`${CONFIG.prefix}__section--error`);
        });
    }

    function submitForm() {
        const validations = [
            validateRadioSection('typetoform', 'smartroomuser'),
            validateRadioSection('formattoform', 'smartroomformat'),
            validateTextInput(CONFIG.fields.clientId),
            validateRadioSection('smartroomecos', 'smartroomecosysrem'),
            validateTextInput(CONFIG.fields.comment),
            validateDatalist(CONFIG.fields.category2),
            validateDatalist(CONFIG.fields.category3)
        ];

        if (validations.some(v => !v)) return;

        const formData = new URLSearchParams({
            'entry.505070950': document.getElementById(CONFIG.fields.clientId).value,
            'entry.1879097323': document.getElementById(CONFIG.fields.comment).value,
            'entry.1625340245': getDatalistValue(CONFIG.fields.category2),
            'entry.478427702': getDatalistValue(CONFIG.fields.category3),
            'entry.466256037': getCheckedRadioValue('typetoform'),
            'entry.685236831': getCheckedRadioValue('formattoform'),
            'entry.876256156': getCheckedRadioValue('whatobratform'),
            'entry.156405977': getCheckedRadioValue('smartroomecos')
        });

        chrome.runtime.sendMessage({
            action: 'getFetchRequest',
            fetchURL: CONFIG.googleFormUrl,
            requestOptions: {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData.toString()
            }
        }, (response) => {
            if (response?.success) {
                document.getElementById('AF_Smartroomform').style.display = 'none';
                clearForm();
                sendComment('Отправка в документ "Пожелания Смартрум" прошла успешно');
            } else {
                console.error('Ошибка при отправке в документ "Пожелания Смартрум":', response?.error);
            }
        });
    }

    function refreshFromChat() {
        const detailsList = document.getElementsByClassName('expert-user_details-list')[1];
        if (!detailsList) return;

        Array.from(detailsList.childNodes).forEach(node => {
            if (!node.firstChild || !node.childNodes[1]) return;

            const label = node.firstChild.innerText;
            const value = node.childNodes[1].innerText.split(' ')[0];

            if (label === 'id') {
                const input = document.getElementById(CONFIG.fields.clientId);
                if (input) input.value = value;
            } else if (label === 'userType') {
                document.querySelectorAll('input[name="typetoform"]').forEach(r => r.checked = false);

                if (value === 'student' || value === 'parent') {
                    const target = document.getElementById('typestudadults');
                    if (target) target.checked = true;
                } else if (value === 'teacher') {
                    const target = document.getElementById('typeteach');
                    if (target) target.checked = true;
                }
            }
        });
    }

    // --- Event Listeners (bind once) ---

    [CONFIG.fields.category2, CONFIG.fields.category3].forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;
        ['input', 'drop', 'paste'].forEach(event => {
            element.addEventListener(event, validateDatalistInput);
        });
    });

    document.querySelectorAll(`.${CONFIG.prefix}__input, .${CONFIG.prefix}__textarea`).forEach(input => {
        input.addEventListener('input', function () {
            this.classList.remove(`${CONFIG.prefix}__input--error`);
            const section = this.closest(`.${CONFIG.prefix}__section`);
            if (section) section.classList.remove(`${CONFIG.prefix}__section--error`);
        });
    });

    document.querySelectorAll(`.${CONFIG.prefix}__radio`).forEach(radio => {
        radio.addEventListener('change', function () {
            const section = this.closest(`.${CONFIG.prefix}__section`);
            if (section) section.classList.remove(`${CONFIG.prefix}__section--error`);
        });
    });

    document.getElementById('send2smartroom').onclick = submitForm;
    document.getElementById('clearsmartroomform').onclick = clearForm;

    document.getElementById('smartroomforminstr').onclick = () => {
        window.open(CONFIG.confluenceUrl, '_blank');
    };

    document.getElementById('refreshhashsmartform').onclick = refreshFromChat;

    // --- Bind external menu button ---
    const menuBtn = document.getElementById('smartroomform');
    if (menuBtn) {
        menuBtn.onclick = window.getsmartroomformButtonPress;
    }

})();