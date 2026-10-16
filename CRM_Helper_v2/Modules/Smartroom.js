/**
 * Smartroom.js — форма «Smartroom: пожелания и негатив».
 * Ответ уходит в Google-форму (через bg.js). ID клиента и комментарий
 * подставляются из открытой карточки/задачи CRM.
 */
(function () {
    'use strict';

    const FORM_URL = 'https://docs.google.com/forms/u/1/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/formResponse';
    const HELP_URL = 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-smartroom%F0%9F%A6%90Smartroom';

    const CLIENT_TYPES = [['typestudadults', 'Ученик Adults'], ['typestudkids', 'Ученик Kids'], ['typestudprem', 'Ученик Premium'], ['typeteach', 'Преподаватель']];
    const FORMATS = [['formatF2F', 'F2F'], ['formatF2G', 'F2G'], ['formatvebinar', 'Вебинар'], ['formatPU', 'ПУ']];
    const REQUESTS = [['whatobratsugest', 'Пожелание по улучшению', 'Пожелание'], ['whattonegative', 'Негатив по работе функционала платформы', 'Негатив']];
    const ECOSYSTEM = [['ecosystemplat', 'Функционал платформы', 'Платформа'], ['ecosystemios', 'Мобильное приложение IOS', 'МП iOS'], ['ecosystemandr', 'Мобильное приложение Android', 'МП Android']];
    const TOPICS = ['Домашние задания', 'Интерфейс платформы', 'Функционал урока П', 'Функционал урока У', 'Вернуть старую платформу', 'Мобильное приложение Skyeng'];
    const SUBTOPICS = ['Интерфейс раздела домашки', 'Нет', 'Перемешаны слайды в уроке', 'План урока', 'План урока\\домашки', 'Вложения', 'Домашка', 'Информирование', 'Навигация в домашке', 'Не видно какие уроки уже пройдены У', 'П не может изменить оценку', 'Предложения по улучшению', 'Сброс ответов', 'Вход в урок', 'Заметки', 'Масштабирование видео', 'Не находит словарь', 'Нет отображения кол-ва символов', 'Нумерация степов в уроке', 'ОС', 'Плохой шрифт', 'Словарь', 'Урок', 'Ширина доски', 'Баллы и картинки', 'Нет прохождения тестов', 'Повтор пройденного материала', 'Связь У с П', 'Звуки', 'Перевод слов на стороне У'];

    const choices = (name, items) => items.map(([id, value, label]) =>
        `<label class="crm-choice"><input type="radio" name="${name}" id="${id}" value="${crmEsc(value)}"><span>${crmEsc(label || value)}</span></label>`
    ).join('');

    const options = (items) => '<option value="" disabled selected>Выберите…</option>' +
        items.map((v) => `<option value="${crmEsc(v)}">${crmEsc(v)}</option>`).join('');

    const html = `
        ${crmWinHeader({
            icon: '🦐',
            title: 'Smartroom: пожелания',
            tools: crmToolButton('refreshhashsmartform', crmIcon('refresh', 15), 'Подставить ID и комментарий из открытой задачи') +
                   crmToolButton('clearsmartroomform', crmIcon('clear', 15), 'Очистить форму') +
                   crmToolButton('smartroomforminstr', crmIcon('help', 15), 'Инструкция'),
            closeId: 'hideMeSmartRoomForm'
        })}
        <div class="crm-body" id="smartroom_form_menu">
            <div class="crm-section-title">Кто обратился</div>
            <div class="crm-choices" id="smartroomuser">${choices('typetoform', CLIENT_TYPES)}</div>

            <div class="crm-section-title" style="margin-top:12px">Формат обучения</div>
            <div class="crm-choices" id="smartroomformat">${choices('formattoform', FORMATS)}</div>

            <div class="crm-row" style="margin-top:12px">
                <div class="crm-grow">
                    <div class="crm-section-title">С чем обратились</div>
                    <div class="crm-choices" id="smartroomquestion">${choices('whatobratform', REQUESTS)}</div>
                </div>
            </div>

            <div class="crm-section-title" style="margin-top:12px">Экосистема</div>
            <div class="crm-choices" id="smartroomecosysrem">${choices('smartroomecos', ECOSYSTEM)}</div>

            <div class="crm-row" style="margin-top:12px; align-items:flex-start">
                <label class="crm-grow"><span class="crm-section-title" style="display:block">ID пользователя</span>
                    <input class="crm-input crm-mono" id="clientid" placeholder="Например, 12345678" autocomplete="off" inputmode="numeric"></label>
            </div>

            <div class="crm-row" style="margin-top:10px; align-items:flex-start">
                <label class="crm-grow"><span class="crm-section-title" style="display:block">Тема</span>
                    <select class="crm-select" id="cattwosmatrtoom">${options(TOPICS)}</select></label>
                <label class="crm-grow"><span class="crm-section-title" style="display:block">Подтема</span>
                    <select class="crm-select" id="catthreesmatrtoom">${options(SUBTOPICS)}</select></label>
            </div>

            <label style="display:block; margin-top:10px"><span class="crm-section-title" style="display:block">Комментарий</span>
                <textarea class="crm-textarea" id="fullcomentsmartroom" rows="4" placeholder="Что именно предлагает или на что жалуется пользователь" data-gramm="false"></textarea></label>

            <button type="button" class="crm-btn crm-btn-primary crm-btn-block" id="send2smartroom" style="margin-top:12px; height:36px">Отправить в документ</button>
        </div>`;

    createWindowCRM('AF_Smartroomform', 'winTopSmartroom', 'winLeftSmartroom', html);
    const win = document.getElementById('AF_Smartroomform');
    win.style.width = '500px';
    hideWindowOnDoubleClick('AF_Smartroomform');
    hideWindowOnClick('AF_Smartroomform', 'hideMeSmartRoomForm');

    const $ = (id) => document.getElementById(id);
    $('clientid').addEventListener('input', (e) => onlyNumbers(e.target));

    /* ---------- Данные со страницы CRM ---------- */

    function fillFromPage() {
        const personId = crmPersonIdFromUrl();
        if (personId) $('clientid').value = personId;

        if (location.pathname.split('/')[4] === 'task') {
            const row = crmFindCommentRow();
            const text = row ? row.innerText.replace(/^Комментарий\s*/, '').trim() : '';
            if (text) $('fullcomentsmartroom').value = text;
        }
    }

    function clearForm() {
        win.querySelectorAll('input[type="radio"]').forEach((r) => { r.checked = false; });
        $('cattwosmatrtoom').selectedIndex = 0;
        $('catthreesmatrtoom').selectedIndex = 0;
        $('clientid').value = '';
        $('fullcomentsmartroom').value = '';
        win.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    }

    /* ---------- Отправка ---------- */

    const checked = (name) => {
        const el = win.querySelector(`input[name="${name}"]:checked`);
        return el ? el.value : '';
    };

    function validate() {
        const rules = [
            ['smartroomuser', !!checked('typetoform')],
            ['smartroomformat', !!checked('formattoform')],
            ['smartroomquestion', !!checked('whatobratform')],
            ['smartroomecosysrem', !!checked('smartroomecos')],
            ['clientid', $('clientid').value.trim().length >= 3],
            ['cattwosmatrtoom', !!$('cattwosmatrtoom').value],
            ['catthreesmatrtoom', !!$('catthreesmatrtoom').value],
            ['fullcomentsmartroom', $('fullcomentsmartroom').value.trim().length >= 3]
        ];
        rules.forEach(([id, ok]) => $(id).classList.toggle('is-invalid', !ok));
        return rules.every(([, ok]) => ok);
    }

    // Выбор снимает подсветку ошибки с группы.
    win.addEventListener('change', (e) => {
        const group = e.target.closest('.crm-choices') || e.target;
        group.classList.remove('is-invalid');
    });

    $('send2smartroom').onclick = async () => {
        const btn = $('send2smartroom');
        if (btn.disabled) return;
        if (!validate()) {
            crmToast('Заполните выделенные поля', 'warning', { title: 'Smartroom' });
            return;
        }

        const body = new URLSearchParams({
            'entry.505070950': $('clientid').value.trim(),
            'entry.1879097323': $('fullcomentsmartroom').value.trim(),
            'entry.1625340245': $('cattwosmatrtoom').value,
            'entry.478427702': $('catthreesmatrtoom').value,
            'entry.466256037': checked('typetoform'),
            'entry.685236831': checked('formattoform'),
            'entry.876256156': checked('whatobratform'),
            'entry.156405977': checked('smartroomecos')
        }).toString();

        crmSetBusy(btn, true);
        try {
            await crmRequest(FORM_URL, {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body
            });
            crmToast('Пожелание записано в документ Smartroom', 'success', { title: 'Smartroom' });
            clearForm();
            crmHideWindow(win);
        } catch (e) {
            crmToast(`Не удалось отправить: ${e.message}`, 'error', { title: 'Smartroom' });
        } finally {
            crmSetBusy(btn, false);
        }
    };

    $('clearsmartroomform').onclick = clearForm;
    $('refreshhashsmartform').onclick = fillFromPage;
    $('smartroomforminstr').onclick = () => window.open(HELP_URL, '_blank', 'noopener');

    $('smartroomformCRM').onclick = () => {
        if (crmToggleWindow(win)) fillFromPage();
    };
})();
