// ============================================
// SmartRoom Form — Premium Edition (compact)
// Требует существующую функцию createWindow()
// ============================================

(function () {
    'use strict';

    const WINDOW_ID = 'AF_Smartroomform';
    const PREFIX = 'sr-form';

    // Защита от повторного запуска скрипта
    if (document.getElementById(WINDOW_ID)) return;

    if (typeof createWindow !== 'function') {
        console.error('[SmartRoom] Не найдена функция createWindow');
        return;
    }

    const CONFIG = {
        googleFormUrl:
            'https://docs.google.com/forms/u/1/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/formResponse',

        confluenceUrl:
            'https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-smartroom%F0%9F%A6%90Smartroom',

        requestTimeout: 20000
    };

    const categories = [
        'Домашние задания',
        'Интерфейс платформы',
        'Функционал урока П',
        'Функционал урока У',
        'Вернуть старую платформу',
        'Мобильное приложение Skyeng'
    ];

    const subcategories = [
        'Интерфейс раздела домашки',
        'Нет',
        'Перемешаны слайды в уроке',
        'План урока',
        'План урока\\домашки',
        'Вложения',
        'Домашка',
        'Информирование',
        'Навигация в домашке',
        'Не видно какие уроки уже пройдены У',
        'П не может изменить оценку',
        'Предложения по улучшению',
        'Сброс ответов',
        'Вход в урок',
        'Заметки',
        'Масштабирование видео',
        'Не находит словарь',
        'Нет отображения кол-ва символов',
        'Нумерация степов в уроке',
        'ОС',
        'Плохой шрифт',
        'Словарь',
        'Урок',
        'Ширина доски',
        'Баллы и картинки',
        'Нет прохождения тестов',
        'Повтор пройденного материала',
        'Связь У с П',
        'Звуки',
        'Перевод слов на стороне У'
    ];

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function optionsHtml(items) {
        return items
            .map(item => `<option value="${escapeHtml(item)}"></option>`)
            .join('');
    }

    // ------------------------------------------------------------
    // Стили
    // ------------------------------------------------------------
const styles = `
    /* Сбрасываем оформление внешней рамки, если её добавляет createWindow */
    #${WINDOW_ID} {
        background: transparent !important;
        border: 0 !important;
        box-shadow: none !important;
    }

    .${PREFIX},
    .${PREFIX} * {
        box-sizing: border-box;
    }

    .${PREFIX} {
        /* Палитра "corporate graphite" — как в окне очереди (Queue.js,
           блок #AF_Queue). Копия визуальной составляющей, без заимствований. */
        --sr-bg: #111827;
        --sr-surface: #182335;
        --sr-field: #0d1625;
        --sr-hover: #142034;

        --sr-line: #344258;
        --sr-line-strong: #3a4961;

        --sr-text: #edf2fb;
        --sr-muted: #a6b4cb;
        --sr-subtle: #8ea0bd;

        --sr-accent: #4268c9;
        --sr-accent-hover: #547ce1;

        --sr-error: #ff929b;
        --sr-success: #79d5ae;

        display: flex;
        flex-direction: column;

        width: min(430px, calc(100vw - 16px));
        max-height: calc(100vh - 16px);
        max-height: calc(100dvh - 16px);
        overflow: hidden;

        color: var(--sr-text);
        background:
            radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
            var(--sr-bg);
        border: 1px solid var(--sr-line);
        border-radius: 18px;

        box-shadow:
            0 26px 70px rgba(3, 9, 22, .52),
            inset 0 1px rgba(255, 255, 255, .06);

        font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        font-size: 13px;
        line-height: 1.4;
    }

    .${PREFIX} button,
    .${PREFIX} input,
    .${PREFIX} textarea {
        font: inherit;
    }

    /* Шапка */

    .${PREFIX}__header {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: none;

        min-width: 0;
        padding: 12px 13px;

        background: transparent;
        border-bottom: 1px solid var(--sr-line);

        cursor: grab;
        user-select: none;
    }

    .${PREFIX}__header:active {
        cursor: grabbing;
    }

    .${PREFIX}__mark {
        display: grid;
        place-items: center;
        flex: none;

        width: 34px;
        height: 34px;

        color: #a9c0ff;
        background: var(--sr-surface);
        border: 1px solid #364660;
        border-radius: 9px;

        font-size: 16px;
        font-weight: 800;
    }

    .${PREFIX}__heading {
        flex: 1;
        min-width: 0;
    }

    .${PREFIX}__eyebrow {
        color: var(--sr-muted);
        font-size: 9px;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
    }

    .${PREFIX}__title {
        margin: 3px 0 0;
        overflow: hidden;

        color: #f0f4fb;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: -.025em;
        line-height: 1.2;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .${PREFIX}__actions {
        display: flex;
        flex: none;
        gap: 5px;
    }

    .${PREFIX}__icon-button {
        display: grid;
        place-items: center;
        flex: none;

        width: 29px;
        height: 29px;
        padding: 0;

        color: #dce5f5;
        background: #1b283c;
        border: 1px solid #3c4d68;
        border-radius: 9px;

        cursor: pointer;

        transition:
            color .16s ease,
            background .16s ease,
            border-color .16s ease;
    }

    .${PREFIX}__icon-button:hover {
        color: #fff;
        background: #293b56;
        border-color: #7799e2;
    }

    .${PREFIX}__icon-button--close:hover {
        color: #ffb0be;
        background: rgba(255, 116, 140, .12);
        border-color: rgba(255, 116, 140, .4);
    }

    .${PREFIX}__icon-button:disabled {
        opacity: .5;
        cursor: not-allowed;
    }

    /* Форма и прокрутка */

    .${PREFIX}__form {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;

        min-height: 0;
        margin: 0;
    }

    .${PREFIX}__body {
        display: flex;
        flex-direction: column;
        gap: 14px;
        flex: 1 1 auto;

        min-height: 0;
        padding: 15px;
        overflow-y: auto;
        overscroll-behavior: contain;

        scrollbar-width: thin;
        scrollbar-color: #536a8e transparent;
    }

    .${PREFIX}__body::-webkit-scrollbar {
        width: 6px;
    }

    .${PREFIX}__body::-webkit-scrollbar-thumb {
        background: #536a8e;
        border-radius: 10px;
    }

    /* Группы и подписи */

    .${PREFIX}__group {
        min-width: 0;
        margin: 0;
        padding: 0;
        border: 0;
    }

    .${PREFIX}__row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 10px;
    }

    .${PREFIX}__legend,
    .${PREFIX}__label {
        display: block;
        width: 100%;
        margin: 0 0 7px;
        padding: 0;

        color: var(--sr-muted);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: .09em;
        line-height: 1.3;
        text-transform: uppercase;
    }

    .${PREFIX}__group.is-invalid > .${PREFIX}__legend,
    .${PREFIX}__group.is-invalid > .${PREFIX}__label {
        color: var(--sr-error);
    }

    .${PREFIX}__group.is-invalid .${PREFIX}__choice {
        border-color: rgba(255, 146, 155, .65);
    }

    /* Переключатели */

    .${PREFIX}__choices {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
    }

    .${PREFIX}__radio {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
    }

    .${PREFIX}__choice {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        min-height: 31px;
        padding: 5px 11px;

        color: #dce5f5;
        background: #1b283c;
        border: 1px solid #3c4d68;
        border-radius: 9px;

        font-size: 12px;
        font-weight: 550;
        line-height: 1.2;

        cursor: pointer;
        user-select: none;

        transition:
            color .16s ease,
            background .16s ease,
            border-color .16s ease;
    }

    .${PREFIX}__choice:hover {
        color: #fff;
        background: #293b56;
        border-color: #7799e2;
    }

    .${PREFIX}__radio:checked + .${PREFIX}__choice {
        color: #eef3ff;
        background: #4268c9;
        border-color: #7293ed;
    }

    .${PREFIX}__radio:focus-visible + .${PREFIX}__choice {
        outline: 2px solid #9ab5ff;
        outline-offset: 2px;
    }

    /* Поля ввода */

    .${PREFIX}__input,
    .${PREFIX}__textarea {
        display: block;
        width: 100%;
        min-width: 0;

        padding: 9px 11px;

        color: var(--sr-text);
        background: var(--sr-field);
        border: 1px solid var(--sr-line-strong);
        border-radius: 8px;
        outline: none;

        font-size: 12px;
        line-height: 1.4;

        transition:
            background .16s ease,
            border-color .16s ease,
            box-shadow .16s ease;
    }

    .${PREFIX}__input {
        min-height: 38px;
    }

    .${PREFIX}__input::placeholder,
    .${PREFIX}__textarea::placeholder {
        color: #7d8ca6;
        opacity: 1;
    }

    .${PREFIX}__input:hover,
    .${PREFIX}__textarea:hover {
        border-color: #657caa;
    }

    .${PREFIX}__input:focus,
    .${PREFIX}__textarea:focus {
        background: #142034;
        border-color: #829fff;
        box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
    }

    .${PREFIX}__input.is-invalid,
    .${PREFIX}__textarea.is-invalid {
        border-color: var(--sr-error);
    }

    .${PREFIX}__input.is-invalid:focus,
    .${PREFIX}__textarea.is-invalid:focus {
        box-shadow: 0 0 0 3px rgba(255, 146, 155, .13);
    }

    .${PREFIX}__textarea {
        min-height: 88px;
        max-height: 220px;
        resize: vertical;
    }

    /* Подвал и отправка */

    .${PREFIX}__footer {
        flex: none;
        padding: 11px 14px 14px;

        background: transparent;
        border-top: 1px solid var(--sr-line);
    }

    .${PREFIX}__status {
        margin: 0 0 9px;
        color: var(--sr-muted);
        font-size: 11px;
        line-height: 1.45;
    }

    .${PREFIX}__status:empty {
        display: none;
    }

    .${PREFIX}__status[data-tone="error"] {
        color: var(--sr-error);
    }

    .${PREFIX}__status[data-tone="success"] {
        color: var(--sr-success);
    }

    .${PREFIX}__submit {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;

        width: 100%;
        min-height: 41px;
        padding: 10px 16px;

        color: #eef3ff;
        background: #4268c9;
        border: 1px solid #7293ed;
        border-radius: 9px;

        box-shadow: 0 5px 15px rgba(58, 96, 205, .22);

        font-size: 12px;
        font-weight: 750;

        cursor: pointer;

        transition:
            background .16s ease,
            border-color .16s ease,
            transform .16s ease;
    }

    .${PREFIX}__submit:hover:not(:disabled) {
        background: #547ce1;
        border-color: #a2b9fa;
        box-shadow: 0 6px 19px rgba(58, 96, 205, .3);
        transform: translateY(-1px);
    }

    .${PREFIX}__submit:active:not(:disabled) {
        transform: translateY(0);
    }

    .${PREFIX}__submit:disabled {
        opacity: .6;
        cursor: wait;
    }

    .${PREFIX} button:focus-visible {
        outline: 2px solid #9ab5ff;
        outline-offset: 2px;
    }

    @media (max-width: 440px) {
        .${PREFIX}__row {
            grid-template-columns: 1fr;
        }
    }

    @media (max-height: 520px) {
        .${PREFIX} {
            max-height: calc(100dvh - 8px);
        }

        .${PREFIX}__body {
            gap: 11px;
            padding: 11px 14px;
        }

        .${PREFIX}__header {
            padding-top: 9px;
            padding-bottom: 9px;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .${PREFIX} *,
        .${PREFIX} *::before,
        .${PREFIX} *::after {
            transition: none !important;
        }
    }
`;

    // ------------------------------------------------------------
    // Разметка
    // ------------------------------------------------------------
    const html = `
        <style>${styles}</style>

        <div class="${PREFIX}">
            <div class="${PREFIX}__header chmaf-drag-handle" id="smartroomsug_form_header">
                <div class="${PREFIX}__mark" aria-hidden="true">S</div>

                <div class="${PREFIX}__heading">
                    <div class="${PREFIX}__eyebrow">SmartRoom · Feedback</div>
                    <h2 class="${PREFIX}__title">Пожелание по улучшению</h2>
                </div>

                <div class="${PREFIX}__actions">
                    <button type="button" class="${PREFIX}__icon-button"
                            id="refreshhashsmartform"
                            title="Обновить данные клиента из чата"
                            aria-label="Обновить данные клиента">↻</button>
                    <button type="button" class="${PREFIX}__icon-button"
                            id="clearsmartroomform"
                            title="Очистить форму"
                            aria-label="Очистить форму">⌫</button>
                    <button type="button" class="${PREFIX}__icon-button"
                            id="smartroomforminstr"
                            title="Открыть инструкцию"
                            aria-label="Открыть инструкцию">?</button>
                    <button type="button"
                            class="${PREFIX}__icon-button ${PREFIX}__icon-button--close"
                            id="hideMeSmartRoomForm"
                            title="Закрыть окно"
                            aria-label="Закрыть окно">✕</button>
                </div>
            </div>

            <form class="${PREFIX}__form" id="smartroom_form_menu" novalidate>
                <div class="${PREFIX}__body">

                    <!-- Тип обращения: единственное значение, скрыто, но отправляется -->
                    <input type="radio" hidden checked
                           id="whatobratsugest" name="whatobratform"
                           value="Пожелание по улучшению">

                    <fieldset class="${PREFIX}__group" id="smartroomuser">
                        <legend class="${PREFIX}__legend">Клиент</legend>
                        <div class="${PREFIX}__choices">
                            <input class="${PREFIX}__radio" type="radio" id="typestudadults"
                                   name="typetoform" value="Ученик Adults">
                            <label class="${PREFIX}__choice" for="typestudadults"
                                   title="Ученик Adults">Adults</label>

                            <input class="${PREFIX}__radio" type="radio" id="typestudkids"
                                   name="typetoform" value="Ученик Kids">
                            <label class="${PREFIX}__choice" for="typestudkids"
                                   title="Ученик Kids">Kids</label>

                            <input class="${PREFIX}__radio" type="radio" id="typestudprem"
                                   name="typetoform" value="Ученик Premium">
                            <label class="${PREFIX}__choice" for="typestudprem"
                                   title="Ученик Premium">Premium</label>

                            <input class="${PREFIX}__radio" type="radio" id="typeteach"
                                   name="typetoform" value="Преподаватель">
                            <label class="${PREFIX}__choice" for="typeteach">Преподаватель</label>
                        </div>
                    </fieldset>

                    <fieldset class="${PREFIX}__group" id="smartroomformat">
                        <legend class="${PREFIX}__legend">Формат обучения</legend>
                        <div class="${PREFIX}__choices">
                            <input class="${PREFIX}__radio" type="radio" id="formatF2F"
                                   name="formattoform" value="F2F">
                            <label class="${PREFIX}__choice" for="formatF2F">F2F</label>

                            <input class="${PREFIX}__radio" type="radio" id="formatF2G"
                                   name="formattoform" value="F2G">
                            <label class="${PREFIX}__choice" for="formatF2G">F2G</label>

                            <input class="${PREFIX}__radio" type="radio" id="formatvebinar"
                                   name="formattoform" value="Вебинар">
                            <label class="${PREFIX}__choice" for="formatvebinar">Вебинар</label>

                            <input class="${PREFIX}__radio" type="radio" id="formatPU"
                                   name="formattoform" value="ПУ">
                            <label class="${PREFIX}__choice" for="formatPU">ПУ</label>
                        </div>
                    </fieldset>

                    <fieldset class="${PREFIX}__group" id="smartroomecosysrem">
                        <legend class="${PREFIX}__legend">Экосистема</legend>
                        <div class="${PREFIX}__choices">
                            <input class="${PREFIX}__radio" type="radio" id="ecosystemplat"
                                   name="smartroomecos" value="Функционал платформы">
                            <label class="${PREFIX}__choice" for="ecosystemplat">Платформа</label>

                            <input class="${PREFIX}__radio" type="radio" id="ecosystemios"
                                   name="smartroomecos" value="Мобильное приложение IOS">
                            <label class="${PREFIX}__choice" for="ecosystemios">iOS</label>

                            <input class="${PREFIX}__radio" type="radio" id="ecosystemandr"
                                   name="smartroomecos" value="Мобильное приложение Android">
                            <label class="${PREFIX}__choice" for="ecosystemandr">Android</label>
                        </div>
                    </fieldset>

                    <div class="${PREFIX}__group">
                        <label class="${PREFIX}__label" for="clientid">ID пользователя</label>
                        <input class="${PREFIX}__input" id="clientid" type="text"
                               inputmode="numeric" autocomplete="off"
                               placeholder="Например, 123456">
                    </div>

                    <div class="${PREFIX}__row">
                        <div class="${PREFIX}__group">
                            <label class="${PREFIX}__label" for="cattwosmatrtoom">Тема</label>
                            <input class="${PREFIX}__input" type="text" id="cattwosmatrtoom"
                                   list="cattwosmatrtoom-options-list" autocomplete="off"
                                   placeholder="Выберите тему">
                            <datalist id="cattwosmatrtoom-options-list">
                                ${optionsHtml(categories)}
                            </datalist>
                        </div>

                        <div class="${PREFIX}__group">
                            <label class="${PREFIX}__label" for="catthreesmatrtoom">Подтема</label>
                            <input class="${PREFIX}__input" type="text" id="catthreesmatrtoom"
                                   list="catthreesmatrtoom-options-list" autocomplete="off"
                                   placeholder="Выберите подтему">
                            <datalist id="catthreesmatrtoom-options-list">
                                ${optionsHtml(subcategories)}
                            </datalist>
                        </div>
                    </div>

                    <div class="${PREFIX}__group">
                        <label class="${PREFIX}__label" for="fullcomentsmartroom">Комментарий</label>
                        <textarea class="${PREFIX}__textarea" id="fullcomentsmartroom"
                                  autocomplete="off" data-gramm="false" wt-ignore-input="true"
                                  placeholder="Что стоит изменить и почему?"></textarea>
                    </div>
                </div>

                <div class="${PREFIX}__footer">
                    <p class="${PREFIX}__status" id="smartroomformstatus"
                       role="status" aria-live="polite"></p>

                    <button class="${PREFIX}__submit" id="send2smartroom" type="submit">
                        Отправить <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </form>
        </div>
    `;

    // ------------------------------------------------------------
    // Создание окна
    // ------------------------------------------------------------
    try {
        createWindow(WINDOW_ID, 'winTopSmartroom', 'winLeftSmartroom', html);
    } catch (error) {
        console.error('[SmartRoom] Не удалось создать окно:', error);
        return;
    }

    const windowEl = document.getElementById(WINDOW_ID);
    const form = windowEl?.querySelector('#smartroom_form_menu');

    if (!windowEl || !form) {
        console.error('[SmartRoom] Окно создано без содержимого формы');
        return;
    }

    const $ = selector => form.querySelector(selector);
    const submitButton = $('#send2smartroom');
    const clearButton = windowEl.querySelector('#clearsmartroomform');
    const statusEl = $('#smartroomformstatus');
    const SUBMIT_LABEL = 'Отправить <span aria-hidden="true">↗</span>';

    let isSending = false;

    // ------------------------------------------------------------
    // Хелперы
    // ------------------------------------------------------------
    function setStatus(message = '', tone = '') {
        statusEl.textContent = message;
        if (tone) statusEl.dataset.tone = tone;
        else statusEl.removeAttribute('data-tone');
    }

    function notify(message, type) {
        if (typeof createAndShowButton === 'function') {
            createAndShowButton(message, type);
        }
    }

    function closeWindow() {
        windowEl.style.display = 'none';
    }

    // Возвращает окно в видимую область экрана, если оно выехало за границы
    function keepInViewport() {
        const position = getComputedStyle(windowEl).position;
        if (position !== 'fixed' && position !== 'absolute') return;

        const rect = windowEl.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
        const maxTop = Math.max(8, window.innerHeight - rect.height - 8);

        if (rect.top < 8 || rect.top > maxTop) {
            windowEl.style.top = `${Math.min(Math.max(rect.top, 8), maxTop)}px`;
        }
        if (rect.left < 8 || rect.left > maxLeft) {
            windowEl.style.left = `${Math.min(Math.max(rect.left, 8), maxLeft)}px`;
        }
    }

    function checked(name) {
        return form.querySelector(`input[name="${name}"]:checked`)?.value ?? null;
    }

    function markInvalid(element, invalid) {
        element.classList.toggle('is-invalid', invalid);
        element.setAttribute('aria-invalid', String(invalid));
        element.closest(`.${PREFIX}__group`)?.classList.toggle('is-invalid', invalid);
    }

    // ------------------------------------------------------------
    // Валидация
    // ------------------------------------------------------------
    function validateRadio(name, groupId) {
        const group = windowEl.querySelector(`#${groupId}`);
        const valid = Boolean(checked(name));

        group.classList.toggle('is-invalid', !valid);

        return {
            valid,
            focusTarget: group.querySelector(`input[name="${name}"]`)
        };
    }

    function validateText(id) {
        const element = $(`#${id}`);
        const valid = element.value.trim().length >= 3;

        markInvalid(element, !valid);
        return { valid, focusTarget: element };
    }

    function matchedOption(element) {
        const list = windowEl.querySelector(`#${element.getAttribute('list')}`);
        if (!list) return null;

        const value = element.value.trim();
        return Array.from(list.options).find(o => o.value === value)?.value ?? null;
    }

    function validateList(id) {
        const element = $(`#${id}`);
        const valid = matchedOption(element) !== null;

        markInvalid(element, !valid);
        return { valid, focusTarget: element };
    }

    function validateForm() {
        const checks = [
            validateRadio('typetoform', 'smartroomuser'),
            validateRadio('formattoform', 'smartroomformat'),
            validateRadio('smartroomecos', 'smartroomecosysrem'),
            validateText('clientid'),
            validateList('cattwosmatrtoom'),
            validateList('catthreesmatrtoom'),
            validateText('fullcomentsmartroom')
        ];

        const firstInvalid = checks.find(c => !c.valid);

        if (firstInvalid) {
            setStatus(
                'Проверьте выделенные поля. Тему и подтему нужно выбрать из списка.',
                'error'
            );
            firstInvalid.focusTarget?.focus();
            firstInvalid.focusTarget?.scrollIntoView?.({ block: 'nearest' });
            return false;
        }

        setStatus();
        return true;
    }

    function clearForm() {
        if (isSending) return;

        form.reset();

        form.querySelectorAll('.is-invalid')
            .forEach(el => el.classList.remove('is-invalid'));
        form.querySelectorAll('[aria-invalid]')
            .forEach(el => el.removeAttribute('aria-invalid'));

        setStatus();
    }

    // ------------------------------------------------------------
    // Данные из чата
    // ------------------------------------------------------------
    function readChatValue(key) {
        if (typeof SearchinAFnewUI === 'function') {
            try {
                const value = SearchinAFnewUI(key);
                if (value !== null && value !== undefined && value !== '') {
                    return String(value).trim();
                }
            } catch (error) {
                console.warn(`[SmartRoom] Не удалось прочитать ${key} из чата:`, error);
            }
        }

        // Резервный вариант для старой разметки
        const detailsList = document.getElementsByClassName('expert-user_details-list')[1];
        if (!detailsList) return '';

        for (const row of detailsList.children) {
            const cells = row.children;
            if (cells.length >= 2 && cells[0].textContent.trim() === key) {
                return cells[1].textContent.trim().split(/\s+/)[0];
            }
        }
        return '';
    }

    function clientTypeRadio(userType, vertical) {
        const type = userType.toLowerCase();
        const v = vertical.toLowerCase();

        if (type === 'teacher') return 'typeteach';
        if (type === 'parent') return 'typestudkids';

        if (type === 'student') {
            if (v.includes('premium')) return 'typestudprem';
            if (v.includes('kid')) return 'typestudkids';
            if (v.includes('adult')) return 'typestudadults';
        }
        return null;
    }

    function fillFromChat(force = false) {
        const clientId = readChatValue('id');
        const userType = readChatValue('userType');
        const vertical = readChatValue('supportVertical');
        const idInput = $('#clientid');

        let updated = false;

        // При обычном открытии не затираем уже введённое
        if (clientId && (force || !idInput.value.trim())) {
            idInput.value = clientId;
            markInvalid(idInput, false);
            updated = true;
        }

        const radioId = clientTypeRadio(userType, vertical);

        if (radioId && (force || !checked('typetoform'))) {
            const radio = $(`#${radioId}`);
            radio.checked = true;
            radio.closest(`.${PREFIX}__group`)?.classList.remove('is-invalid');
            updated = true;
        }

        return updated;
    }

    // ------------------------------------------------------------
    // Показ / скрытие (имя функции сохранено для меню)
    // ------------------------------------------------------------
    function closeMainMenu() {
        const menu = document.getElementById('idmymenu');
        const mainMenuButton = document.getElementById('MainMenuBtn');

        if (menu) menu.style.display = 'none';
        mainMenuButton?.classList.remove('activeScriptBtn');
    }

    function showWindow() {
        windowEl.style.display = '';
        fillFromChat();
        requestAnimationFrame(keepInViewport);
    }

    function toggleWindow() {
        const hidden = getComputedStyle(windowEl).display === 'none';

        if (hidden) showWindow();
        else closeWindow();

        closeMainMenu();
    }

    window.getsmartroomformButtonPress = toggleWindow;

    // ------------------------------------------------------------
    // Отправка
    // ------------------------------------------------------------
    function sendViaExtension(body) {
        return new Promise((resolve, reject) => {
            if (!globalThis.chrome?.runtime?.sendMessage) {
                reject(new Error('Недоступно расширение браузера'));
                return;
            }

            let settled = false;

            const timeoutId = setTimeout(() => {
                if (settled) return;
                settled = true;
                reject(new Error('Время ожидания ответа истекло'));
            }, CONFIG.requestTimeout);

            try {
                chrome.runtime.sendMessage(
                    {
                        action: 'getFetchRequest',
                        fetchURL: CONFIG.googleFormUrl,
                        requestOptions: {
                            method: 'POST',
                            headers: {
                                'Content-Type':
                                    'application/x-www-form-urlencoded;charset=UTF-8'
                            },
                            body
                        }
                    },
                    response => {
                        if (settled) return;
                        settled = true;
                        clearTimeout(timeoutId);

                        const runtimeError = chrome.runtime.lastError;
                        if (runtimeError) {
                            reject(new Error(runtimeError.message));
                            return;
                        }

                        if (response?.success) resolve(response);
                        else reject(new Error(response?.error || 'Сервер не подтвердил отправку'));
                    }
                );
            } catch (error) {
                if (settled) return;
                settled = true;
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }

    async function submitForm(event) {
        event.preventDefault();

        if (isSending || !validateForm()) return;

        const body = new URLSearchParams({
            'entry.505070950': $('#clientid').value.trim(),
            'entry.1879097323': $('#fullcomentsmartroom').value.trim(),
            'entry.1625340245': matchedOption($('#cattwosmatrtoom')),
            'entry.478427702': matchedOption($('#catthreesmatrtoom')),
            'entry.466256037': checked('typetoform'),
            'entry.685236831': checked('formattoform'),
            'entry.876256156': checked('whatobratform'),
            'entry.156405977': checked('smartroomecos')
        }).toString();

        isSending = true;
        submitButton.disabled = true;
        clearButton.disabled = true;
        submitButton.textContent = 'Отправляем…';
        setStatus('Отправляем предложение…');

        let ok = false;

        try {
            await sendViaExtension(body);
            ok = true;
        } catch (error) {
            console.error('[SmartRoom] Ошибка отправки:', error);
            // Введённые данные при ошибке остаются
            setStatus(`Не удалось отправить: ${error.message}`, 'error');
            notify('❌ Не удалось отправить форму', 'error');
        } finally {
            isSending = false;
            submitButton.disabled = false;
            clearButton.disabled = false;
            submitButton.innerHTML = SUBMIT_LABEL;
        }

        if (ok) {
            clearForm();
            closeWindow();

            if (typeof sendComment === 'function') {
                sendComment('Отправка в документ "Пожелания Смартрум" прошла успешно');
            }
            notify('✅ Отправлено в Смартрум-док', 'message');
        }
    }

    // ------------------------------------------------------------
    // Обработчики (навешиваются один раз)
    // ------------------------------------------------------------
    form.addEventListener('submit', submitForm);

    form.addEventListener('input', event => {
        const target = event.target;
        if (!target.matches('input, textarea')) return;

        target.classList.remove('is-invalid');
        target.removeAttribute('aria-invalid');
        target.closest(`.${PREFIX}__group`)?.classList.remove('is-invalid');

        if (statusEl.dataset.tone === 'error') setStatus();
    });

    form.addEventListener('change', event => {
        if (!event.target.matches('input[type="radio"]')) return;

        event.target.closest(`.${PREFIX}__group`)?.classList.remove('is-invalid');

        if (statusEl.dataset.tone === 'error') setStatus();
    });

    clearButton.addEventListener('click', clearForm);

    windowEl.querySelector('#hideMeSmartRoomForm')
        .addEventListener('click', closeWindow);

    windowEl.querySelector('#refreshhashsmartform')
        .addEventListener('click', () => {
            const updated = fillFromChat(true);
            setStatus(
                updated
                    ? 'Данные клиента обновлены из чата.'
                    : 'Не удалось найти данные клиента в чате.',
                updated ? 'success' : 'error'
            );
        });

    windowEl.querySelector('#smartroomforminstr')
        .addEventListener('click', () => {
            window.open(CONFIG.confluenceUrl, '_blank', 'noopener,noreferrer');
        });

    const menuButton = document.getElementById('smartroomform');
    if (menuButton) {
        menuButton.addEventListener('click', window.getsmartroomformButtonPress);
    }

    // На случай, если окно уже открыто при создании
    requestAnimationFrame(keepInViewport);
})();