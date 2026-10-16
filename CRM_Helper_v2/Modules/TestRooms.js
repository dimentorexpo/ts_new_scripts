/**
 * TestRooms.js — окно «Тестовый урок»: создание тестовой комнаты
 * в админке предмета (tech-support-room/create) для П и одного или нескольких У.
 */
(function () {
    'use strict';

    const HELP_URL = 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-testrooms%D0%9E%D0%BA%D0%BD%D0%BE%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D1%8F%D1%82%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D1%8B%D1%85%D1%83%D1%80%D0%BE%D0%BA%D0%BE%D0%B2';
    const CONF_URL = 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638';

    const LESSON_TYPES = [['test', '1 на 1'], ['test-parallel', 'Параллельный'], ['test-webinar', 'Вебинар'], ['test-group', 'Групповой']];
    const SUBJECTS = [
        ['api-english', 'Английский'], ['api-biology', 'Биология'], ['api-geography', 'География'],
        ['api-preschool', 'Дошкольная математика'], ['api-history', 'История'], ['api-computer-science', 'Компьютерные курсы'],
        ['api-literature', 'Литература'], ['api-math', 'Математика'], ['api-social-science', 'Обществознание'],
        ['api-russian', 'Русский язык'], ['api-physics', 'Физика'], ['api-chemistry', 'Химия'], ['api-chess', 'Шахматы']
    ];

    const opts = (placeholder, items) => `<option value="" disabled selected>${placeholder}</option>` +
        items.map(([v, t]) => `<option value="${v}">${t}</option>`).join('');

    const html = `
        ${crmWinHeader({
            icon: '🎲',
            title: 'Тестовый урок',
            tools: crmToolButton('clrTestRooms', crmIcon('clear', 15), 'Очистить поля') +
                   crmToolButton('aboutTestRooms', crmIcon('help', 15), 'Инструкция') +
                   crmToolButton('confluenceTestRooms', crmIcon('doc', 15), 'Статья в Confluence'),
            closeId: 'hideMetestroomsCRM'
        })}
        <div class="crm-body">
            <div class="crm-row">
                <select class="crm-select crm-grow" id="lessontypeselect" title="Тип урока">${opts('Тип урока', LESSON_TYPES)}</select>
                <select class="crm-select crm-grow" id="subjecttypeselect" title="Предмет">${opts('Предмет', SUBJECTS)}</select>
            </div>
            <div class="crm-row">
                <input class="crm-input crm-mono crm-grow" id="teachforroom" placeholder="ID П" title="ID преподавателя" autocomplete="off" inputmode="numeric">
                <input class="crm-input crm-mono crm-grow" id="studforroom" placeholder="ID У (через запятую)" title="ID ученика; несколько — через запятую" autocomplete="off">
            </div>
            <div class="crm-row">
                <button type="button" class="crm-btn crm-btn-sm crm-grow" id="insertteachid" title="Подставить ID вашего тестового П из настроек">Мой тест П</button>
                <button type="button" class="crm-btn crm-btn-sm crm-grow" id="insertstudid" title="Подставить ID вашего тестового У из настроек">Мой тест У</button>
                <button type="button" class="crm-btn crm-btn-sm crm-grow" id="userfromchatid" title="Взять ID пользователя из открытой задачи, второе поле — ваш тестовый аккаунт">Из задачи</button>
            </div>
            <button type="button" class="crm-btn crm-btn-primary crm-btn-block" id="starttestroom" style="margin-top:12px; height:36px">Создать урок</button>
            <div class="crm-note crm-hidden" id="testroomsCRMmessage" style="margin-top:10px"></div>
        </div>`;

    createWindowCRM('testroomsCRM', 'winToptestroomsCRM', 'winLefttestroomsCRM', html);
    const win = document.getElementById('testroomsCRM');
    win.style.width = '380px';
    hideWindowOnDoubleClick('testroomsCRM');
    hideWindowOnClick('testroomsCRM', 'hideMetestroomsCRM');

    const $ = (id) => document.getElementById(id);
    const messageField = $('testroomsCRMmessage');
    let messageTimer = null;

    /** Статус в окне (дублируется тостом при ошибке). */
    function showMessage(tone, text) {
        clearTimeout(messageTimer);
        messageField.dataset.tone = tone;
        messageField.textContent = text;
        messageField.classList.remove('crm-hidden');
        messageTimer = setTimeout(() => messageField.classList.add('crm-hidden'), 9000);
    }

    function clearFields() {
        $('teachforroom').value = '';
        $('studforroom').value = '';
        $('subjecttypeselect').selectedIndex = 0;
        $('lessontypeselect').selectedIndex = 0;
        win.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    }

    function fillFromSettings(field, storageKey, who) {
        const value = localStorage.getItem(storageKey);
        if (value) {
            $(field).value = value;
            return true;
        }
        showMessage('bad', `В настройках не указан ID тестового ${who}. Откройте «Настройки» → «Тестовые аккаунты».`);
        return false;
    }

    $('teachforroom').addEventListener('input', (e) => onlyNumbers(e.target));
    $('studforroom').addEventListener('input', (e) => onlyNumbersAndComma(e.target));

    $('insertteachid').onclick = () => fillFromSettings('teachforroom', 'test_teachCRM', 'преподавателя');
    $('insertstudid').onclick = () => fillFromSettings('studforroom', 'test_studCRM', 'ученика');

    // Пользователь из задачи: преподаватель → поле П и тестовый У, иначе наоборот.
    $('userfromchatid').onclick = () => {
        const idEl = document.getElementsByClassName('id')[0];
        const userId = idEl ? idEl.innerText.replace(/\D/g, '') : '';
        if (!userId) {
            showMessage('bad', 'Нет открытой задачи с ID пользователя.');
            return;
        }
        const isTeacher = !!document.querySelector('div[data-qa="is-teacher-badge"]');
        if (isTeacher) {
            $('teachforroom').value = userId;
            fillFromSettings('studforroom', 'test_studCRM', 'ученика');
        } else {
            $('studforroom').value = userId;
            fillFromSettings('teachforroom', 'test_teachCRM', 'преподавателя');
        }
    };

    function generateHash(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const bytes = crypto.getRandomValues(new Uint8Array(length));
        return Array.from(bytes, (b) => chars[b % chars.length]).join('');
    }

    $('starttestroom').onclick = async () => {
        const btn = $('starttestroom');
        if (btn.disabled) return;

        const lessonType = $('lessontypeselect').value;
        const subject = $('subjecttypeselect').value;
        const teacherId = $('teachforroom').value.replace(/\D/g, '');
        const studentIds = $('studforroom').value.split(',').map((s) => s.replace(/\D/g, '')).filter(Boolean);

        const problems = [];
        $('lessontypeselect').classList.toggle('is-invalid', !lessonType);
        $('subjecttypeselect').classList.toggle('is-invalid', !subject);
        $('teachforroom').classList.toggle('is-invalid', teacherId.length < 4);
        $('studforroom').classList.toggle('is-invalid', !studentIds.length || studentIds.some((s) => s.length < 4));
        if (!lessonType) problems.push('тип урока');
        if (!subject) problems.push('предмет');
        if (teacherId.length < 4) problems.push('ID преподавателя');
        if (!studentIds.length || studentIds.some((s) => s.length < 4)) problems.push('ID ученика');
        if (problems.length) {
            showMessage('bad', `Укажите: ${problems.join(', ')}.`);
            return;
        }

        const hash = generateHash(14);
        const body = `${hash}%5Btype%5D=${encodeURIComponent(lessonType)}` +
            `&${hash}%5BteacherId%5D=${teacherId}` +
            `&${hash}%5BstudentIds%5D=${studentIds.join('%2C')}` +
            `&${hash}%5BisOpenEntryEnabled%5D=1&btn_create_and_list=`;

        crmSetBusy(btn, true);
        try {
            await crmRequest(`https://${subject}.skyeng.ru/admin/tech-support-room/create?uniqid=${hash}`, {
                method: 'POST',
                headers: {
                    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'content-type': 'application/x-www-form-urlencoded'
                },
                referrer: `https://${subject}.skyeng.ru/admin/tech-support-room/create`,
                referrerPolicy: 'strict-origin-when-cross-origin',
                body,
                credentials: 'include'
            });
            showMessage('ok', 'Урок создан. Приглашение появится в личных кабинетах У и П.');
            crmToast('Тестовый урок создан', 'success');
            clearFields();
        } catch (e) {
            showMessage('bad', `Не удалось создать урок: ${e.message}. Проверьте вход в админку предмета.`);
            crmToast(e.message, 'error', { title: 'Тестовый урок' });
        } finally {
            crmSetBusy(btn, false);
        }
    };

    $('clrTestRooms').onclick = clearFields;
    $('aboutTestRooms').onclick = () => window.open(HELP_URL, '_blank', 'noopener');
    $('confluenceTestRooms').onclick = () => window.open(CONF_URL, '_blank', 'noopener');

    $('btnCreateTestRoom').onclick = () => crmToggleWindow(win);
})();
