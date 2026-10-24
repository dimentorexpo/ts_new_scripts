/**
 * Link.js — окно «Ссылки и инструменты»: быстрые ссылки ТП, переходы по ID,
 * свои кнопки пользователя (ПКМ — редактировать), версии мобильных приложений.
 */
(function () {
    'use strict';

    /* ---------- Свои кнопки (localStorage) ---------- */

    const CUSTOM_KEY = 'CRM_LinksCustom';

    function loadCustom() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CUSTOM_KEY) || 'null');
            if (parsed && Array.isArray(parsed.customButtons)) return parsed;
        } catch (_) { /* битый JSON — начинаем с пустого списка */ }
        return { version: '1.0', customButtons: [] };
    }

    const custom = loadCustom();
    const saveCustom = () => localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom));

    /** Разрешаем только http(s) — чтобы в кнопку нельзя было положить javascript:. */
    function normalizeUrl(raw) {
        try {
            const url = new URL(String(raw).trim());
            return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
        } catch (_) {
            return null;
        }
    }

    /* ---------- Справочник ---------- */

    const TP_LINK_BUTTONS = [
        { id: 'deleteaclnk', icon: '🗑', label: 'ПД', title: 'Заявка на удаление персональных данных', url: 'https://infra.skyeng.ru/request/create/166' },
        { id: 'knoweledgebase', icon: '📚', label: 'БЗ', title: 'База знаний в Confluence', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=25407293' },
        { id: 'essayadmin', icon: '📝', label: 'Эссе', title: 'Админка эссе для перезакрепления за П', url: 'https://api-english.skyeng.ru/admin/platform/openanswer/list' },
        { id: 'resetMMPassword', icon: '🔐', label: 'MM пароль', title: 'Infra: сброс пароля Mattermost Teacher', url: 'https://infra.skyeng.ru/request/create/233' },
        { id: 'confbugs', icon: '🐞', label: 'Баги', title: 'Известные баги на платформе', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=96042583' },
        { id: 'GrListData', icon: '👥', label: 'Список гр.', title: 'Состав группы по ID', url: null },
        { id: 'minecraftAccs', icon: '⛏️', label: 'Minecraft', title: 'УЗ Minecraft', url: 'https://disk.yandex.ru/edit/d/ARTwOEreBvxL1L4cDRCvEyPegnqahzm72s0qoIz-cKg6al9hdmhpLVFTZw' },
        { id: 'timetable', icon: '📅', label: 'TimeTable', title: 'Timetable', url: 'https://timetable.skyeng.ru/' },
        { id: 'talksadm', icon: '🗣', label: 'Talks', title: 'Talks Admin — поиск по ID П / ID У урока', url: 'https://vimbox.skyeng.ru/talks/admin/statistics' },
        { id: 'compensNotFairPayments', icon: '🚫', label: 'Честн. оплат', title: 'Форма: нет честных оплат', url: 'https://forms.yandex.ru/cloud/6876066349363940156734b8/?page=1' },
        { id: 'compens', icon: '💸', label: 'Компенсации', title: 'Создание операции компенсации ученику', url: 'https://billing-marketing.skyeng.ru/accrual-operations/create' },
        { id: 'CMS', icon: '🌀', label: 'CMS', title: 'CMS хранилище материалов уроков', url: 'https://cms-vimbox.skyeng.ru/vim' },
        { id: 'kidscms', icon: '🌀', label: 'Kids CMS', title: 'CMS детских предметов', url: 'https://vimbox.skyeng.ru/kids/math/cms/lessons/1' },
        { id: 'useradm', icon: '🛠️', label: 'Админка', title: 'Админка пользователей', url: 'https://id.skyeng.ru/admin/users' },
        { id: 'transactions', icon: '💳', label: 'Поиск платежа', title: 'Поиск платежа по карте, сумме, дате', url: 'https://accounting.skyeng.ru/userpayment/search/transaction' },
        { id: 'billingadm', icon: '🧮', label: 'Начислятор', title: 'Начислятор биллинга: реальный баланс и зависшие уроки', url: 'https://billing-api.skyeng.ru/operations' },
        { id: 'subscribebilling', icon: '🔁', label: 'Подписки', title: 'Биллинг подписок: просмотр и редактирование', url: 'https://billing-api.skyeng.ru/subscriptions' },
        { id: 'userfeatures', icon: '🏡', label: 'Фичи', title: 'Проверка фичей (кругов) пользователя', url: 'https://vimbox.skyeng.ru/circles/editor' },
        { id: 'testroom', icon: 'ℹ️', label: 'TestRooms', title: 'Инструкция по созданию тестовых комнат', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638' },
        { id: 'apelation', icon: '💫', label: 'Апелляции', title: 'Форма апелляций аудита', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdgsb6pte1H1dz15Eb5NjDe0gj3kEnh0hTe6Cgy8d81mT7NUA/viewform' },
        { id: 'browserstack', icon: '🌐', label: 'BrowserStack', title: 'BrowserStack', url: 'https://www.browserstack.com/users/sign_in' },
        { id: 'certificates', icon: '📜', label: 'Сертификаты', title: 'Проверка сертификатов', url: 'https://billing-marketing.skyeng.ru/certificate/certSearch' },
        { id: 'promocodes', icon: '🏷', label: 'Промокоды', title: 'Проверка промокодов', url: 'https://billing-marketing.skyeng.ru/promocode/list' },
        { id: 'helpocentrstud', icon: '📔', label: 'БЗ У', title: 'Help Center для учеников', url: 'https://helpcenter.skyeng.ru/students' },
        { id: 'helpocentrteach', icon: '📗', label: 'БЗ П', title: 'Help Center для преподавателей', url: 'https://helpcenter.skyeng.ru/teachers' },
        { id: 'trshoothing', icon: '🔨', label: 'Траблшутер', title: 'Траблшутер: ошибки и логи комнаты', url: 'https://video-trouble-shooter.skyeng.ru/' },
        { id: 'Synchronizer', icon: '♻️', label: 'Синхрон ДЗ', title: 'Синхронизация ДЗ (upsert-history)', url: 'https://learning.skyeng.ru/upsert-history' },
        { id: 'AddRemoveChat', icon: '💬', label: 'Чаты', title: 'Добавить или удалить чат', url: 'https://communications.skyeng.ru/gateway/support/chat-management' },
        { id: 'CheckPrices', icon: '🏷', label: 'Цены', title: 'Check Price — наборы цен', url: 'https://billing-marketing.skyeng.ru/priceSet/list' },
        { id: 'CheckVidConnection', icon: '📹', label: 'Видео', title: 'Проверка видеосервера', url: 'https://video-check.skyeng.ru/' },
        { id: 'goProcash', icon: '💳', label: 'BIN', title: 'Check BIN банка', url: 'https://procash.app/tools/bin-lookup' },
        { id: 'suggestions', icon: '✉️', label: 'Предложения', title: 'Форма передачи предложений от пользователей', url: 'https://docs.google.com/forms/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/viewform' },
        { id: 'faqext', icon: '❓', label: 'Инструкции', title: 'Инструкция ChMAF', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971' },
        { id: 'rkKidsTP', icon: '🧒', label: 'РК Kids', title: 'Админка Kids РК (встречи клубов)', url: 'https://group.skyeng.ru/admin/?crudAction=index&crudControllerFqcn=App%5CController%5CAdmin%5CClubKidMeetingCrudController&entityFqcn=App%5CEntity%5CClubMeeting' },
        { id: 'rkAdultsTP', icon: '👥', label: 'РК Adults', title: 'Админка Adults РК (расписание клубов)', url: 'https://skyeng.ru/clubs/admin/schedule' },
        { id: 'flexAdminTP', icon: '🎓', label: 'Flex', title: 'Админка Flex (публичные семинары)', url: 'https://public-seminars-admin.skyeng.ru/english?dateFrom=1787605200&dateTo=1787691599' },
        { id: 'grafanalnk', icon: '📊', label: 'Grafana', title: 'Grafana: состояние видеосерверов', url: 'https://grafana.skyeng.link/d/NZkMHsVMk/video-servers-health-check?orgId=1&refresh=1m' },
        { id: 'kpiteachersdashboard', icon: '📈', label: 'KPI П', title: 'Datalens: KPI teachers', url: 'https://datalens.yandex.ru/lupggqkv0uewa-kpi-p-dlya-tp?tab=GrW&state=684e0be1371' }
    ];

    // Поле → действие. kind: open (открыть ссылку), copy (скопировать ссылку), otp (разовый пароль).
    const LK_FIELDS = [
        { btn: 'benchmark', input: 'cpuname', ph: 'Процессор', kind: 'open', url: 'https://www.cpubenchmark.net/cpu_lookup.php?cpu=', title: 'Название процессора → рейтинг на cpubenchmark' },
        { btn: 'credits', input: 'creditstatus', ph: 'ID У: рассрочки', kind: 'open', url: 'https://billing-api.skyeng.ru/installments?perPage=10&ownerId=', title: 'ID ученика → рассрочки' },
        { btn: 'gotolookip', input: 'iplookup', ph: 'IP адрес', kind: 'open', url: 'https://check-host.net/ip-info?host=', title: 'IP → гео и хостинг' },
        { btn: 'getlgsinfo', input: 'lgssearch', ph: 'ID группы LGS/KGL', kind: 'open', url: 'https://learning-groups-storage.skyeng.ru/group/', suffix: '?cp=(section:participants)', title: 'ID группы → админка LGS' },
        { btn: 'cmsid', input: 'cmsstepid', ph: 'stepUUID в CMS', kind: 'open', url: 'https://content.vimbox.skyeng.ru/cms/step-store/update/id/', title: 'stepUUID → шаг в CMS' },
        { btn: 'getschemes', input: 'schemesteacher', ph: 'ID П: схемы оплаты', kind: 'open', url: 'https://teacher-incentive.skyeng.ru/incentive/teacher/', title: 'ID преподавателя → схемы вознаграждения' },
        { btn: 'getpushes', input: 'pushes', ph: 'ID У: пуши', kind: 'open', url: 'https://push-notifications.skyeng.ru/cms/logs?page=1&paginateBy=100&userId=', title: 'ID ученика → отправленные пуши' },
        { btn: 'gettrshinfo', input: 'trshooterhash', ph: 'Хеш комнаты', kind: 'open', url: 'https://video-trouble-shooter.skyeng.ru/?hash=', title: 'Хеш комнаты → траблшутер' },
        { btn: 'getmobpasscode', input: 'setidformobpass', ph: 'ID У/П: пароль МП', kind: 'otp', title: 'ID пользователя → разовый пароль для мобильного приложения (появится в поле на 15 с)' },
        { btn: 'getenablerAP', input: 'enablerAP', ph: 'ID услуги: включить АП', kind: 'copy', build: (v) => `https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${v}`, msg: 'Ссылка включения автоподбора скопирована', title: 'Копирует ссылку активации АП в ЛКУ' },
        { btn: 'getskipAP', input: 'skipAP', ph: 'ID услуги: пропуск АП', kind: 'copy', build: (v) => `https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${v}&skipAutoSelection=1`, msg: 'Ссылка пропуска автоподбора скопирована', title: 'Копирует ссылку пропуска АП в ЛКУ' },
        { btn: 'doskiponboard', input: 'skiponboarding', ph: 'ID услуги: без онбординга', kind: 'copy', build: (v) => `https://learning.skyeng.ru/api/v1/education-service/${v}/skip-onboarding`, msg: 'Ссылка отключения онбординга скопирована', title: 'Копирует ссылку отключения онбординга в ЛКУ' }
    ];

    const FIELD_ICONS = { open: crmIcon('external', 15), copy: crmIcon('copy', 15), otp: crmIcon('next', 15) };

    /* ---------- Разметка ---------- */

    function linksGridHtml() {
        const base = TP_LINK_BUTTONS.map((b) =>
            `<button type="button" class="lk-btn" id="${b.id}" title="${crmEsc(b.title)}">` +
            `<span class="lk-btn-ico">${b.icon}</span><span class="lk-btn-text">${crmEsc(b.label)}</span></button>`
        );
        const own = custom.customButtons.map((b) =>
            `<button type="button" class="lk-btn is-custom" data-custom-id="${crmEsc(b.id)}" title="${crmEsc(b.title)} — правый клик: изменить">` +
            `<span class="lk-btn-ico">${crmEsc(b.icon)}</span><span class="lk-btn-text">${crmEsc(b.title)}</span></button>`
        );
        return `<div class="lk-grid" id="lk-grid">${base.concat(own).join('')}</div>`;
    }

    const fieldsHtml = `<div class="lk-fields">${LK_FIELDS.map((f) => `
        <div class="crm-input-group">
            <input class="crm-input" id="${f.input}" placeholder="${crmEsc(f.ph)}" title="${crmEsc(f.title)}" autocomplete="off">
            <button type="button" class="crm-icon-btn is-boxed" id="${f.btn}" title="${crmEsc(f.title)}" aria-label="${crmEsc(f.title)}">${FIELD_ICONS[f.kind]}</button>
        </div>`).join('')}</div>`;

    const html = `
        ${crmWinHeader({
            icon: '🧰',
            title: 'Ссылки и инструменты',
            tools: crmToolButton('add-custom-btn', crmIcon('plus'), 'Добавить свою кнопку-ссылку'),
            closeId: 'hideMe'
        })}
        <div class="crm-section">
            <div class="crm-section-title">Ссылки</div>
            <div id="lk-grid-holder">${linksGridHtml()}</div>
        </div>
        <div class="crm-section">
            <div class="crm-section-title">Переход по ID</div>
            ${fieldsHtml}
        </div>
        <div class="crm-section lk-foot">
            <button type="button" class="crm-btn crm-btn-sm" id="restartlesson" title="Скопировать команду setStatus('classwork') для перезапуска урока">${crmIcon('copy', 14)} Classwork</button>
            <span class="crm-grow"></span>
            <span class="crm-label">Версии МП</span>
            <button type="button" class="crm-btn crm-btn-sm" id="curVeriOSCRM" title="Актуальная версия iOS. Клик — App Store">iOS: …</button>
            <button type="button" class="crm-btn crm-btn-sm" id="curVerAndroidCRM" title="Актуальная версия Android. Клик — Google Play">Android: …</button>
        </div>`;

    createWindowCRM('AF_Links', 'winTopLinks', 'winLeftLinks', html);
    const win = document.getElementById('AF_Links');
    win.style.width = '790px';
    hideWindowOnDoubleClick('AF_Links');
    hideWindowOnClick('AF_Links', 'hideMe');

    /* ---------- Кнопки-ссылки (делегирование: переживает перерисовку) ---------- */

    const linkById = new Map(TP_LINK_BUTTONS.map((b) => [b.id, b]));
    const open = (url) => window.open(url, '_blank', 'noopener');

    function renderGrid() {
        document.getElementById('lk-grid-holder').innerHTML = linksGridHtml();
    }

    win.addEventListener('click', (e) => {
        const btn = e.target.closest('.lk-btn');
        if (!btn) return;
        if (btn.dataset.customId) {
            const item = custom.customButtons.find((b) => b.id === btn.dataset.customId);
            const url = item && normalizeUrl(item.url);
            if (url) open(url);
            return;
        }
        if (btn.id === 'GrListData') {
            if (typeof getGrListDataButtonPress === 'function') getGrListDataButtonPress();
            return;
        }
        const item = linkById.get(btn.id);
        if (item && item.url) open(item.url);
    });

    win.addEventListener('contextmenu', (e) => {
        const btn = e.target.closest('.lk-btn[data-custom-id]');
        if (!btn) return;
        e.preventDefault();
        const item = custom.customButtons.find((b) => b.id === btn.dataset.customId);
        if (item) editCustomButton(item);
    });

    document.getElementById('add-custom-btn').onclick = () => editCustomButton(null);

    /* ---------- Диалог своей кнопки ---------- */

    function editCustomButton(existing) {
        const overlay = document.createElement('div');
        overlay.className = 'crm-scope crm-dialog-overlay';
        overlay.innerHTML = `
            <div class="crm-dialog" role="dialog" aria-modal="true">
                <div class="crm-dialog-body">
                    <div class="crm-dialog-title">${existing ? 'Изменить кнопку' : 'Новая кнопка'}</div>
                    <div class="crm-dialog-msg">Кнопка появится в разделе «Ссылки». Правый клик по ней — изменить.</div>
                    <div class="crm-dialog-fields">
                        <label><span class="crm-label">Название</span><input class="crm-input" id="lk-btn-title" maxlength="40" placeholder="Моя ссылка"></label>
                        <label><span class="crm-label">Значок (эмодзи)</span><input class="crm-input" id="lk-btn-icon" maxlength="4" placeholder="🔗"></label>
                        <label><span class="crm-label">Адрес</span><input class="crm-input" id="lk-btn-url" placeholder="https://…"></label>
                    </div>
                </div>
                <div class="crm-dialog-foot">
                    ${existing ? '<button type="button" class="crm-btn crm-btn-danger is-left" id="lk-btn-delete">Удалить</button>' : ''}
                    <button type="button" class="crm-btn" id="lk-btn-cancel">Отмена</button>
                    <button type="button" class="crm-btn crm-btn-primary" id="lk-btn-save">Сохранить</button>
                </div>
            </div>`;

        const $ = (sel) => overlay.querySelector(sel);
        $('#lk-btn-title').value = existing ? existing.title : '';
        $('#lk-btn-icon').value = existing ? existing.icon : '';
        $('#lk-btn-url').value = existing ? existing.url : '';

        const close = () => overlay.remove();
        $('#lk-btn-cancel').onclick = close;
        overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
            if (e.key === 'Enter') $('#lk-btn-save').click();
        });

        $('#lk-btn-save').onclick = () => {
            const title = $('#lk-btn-title').value.trim();
            const icon = $('#lk-btn-icon').value.trim() || '🔗';
            const url = normalizeUrl($('#lk-btn-url').value);
            $('#lk-btn-title').classList.toggle('is-invalid', !title);
            $('#lk-btn-url').classList.toggle('is-invalid', !url);
            if (!title || !url) {
                crmToast('Нужны название и адрес, начинающийся с http:// или https://', 'warning');
                return;
            }
            if (existing) Object.assign(existing, { title, icon, url });
            else custom.customButtons.push({ id: `custom-${Date.now()}`, title, icon, url });
            saveCustom();
            renderGrid();
            close();
        };

        if (existing) {
            $('#lk-btn-delete').onclick = async () => {
                const ok = await crmConfirm({
                    title: 'Удалить кнопку?',
                    message: `Кнопка «${existing.title}» исчезнет из раздела «Ссылки».`,
                    okText: 'Удалить',
                    danger: true
                });
                if (!ok) return;
                custom.customButtons = custom.customButtons.filter((b) => b.id !== existing.id);
                saveCustom();
                renderGrid();
                close();
            };
        }

        document.body.appendChild(overlay);
        $('#lk-btn-title').focus();
    }

    /* ---------- Поля «Переход по ID» ---------- */

    async function getMobilePassword(field, inputEl, buttonEl) {
        const id = inputEl.value.replace(/\D/g, '');
        if (!id) return false;
        crmSetBusy(buttonEl, true);
        try {
            const body = new URLSearchParams({
                'user_id_or_identity_for_one_time_password_form[userIdOrIdentity]': id,
                'user_id_or_identity_for_one_time_password_form[generate]': '',
                'user_id_or_identity_for_one_time_password_form[_token]': 'null'
            }).toString();
            const page = await crmRequest('https://id.skyeng.ru/admin/auth/one-time-password', {
                method: 'POST',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                body,
                credentials: 'include'
            });
            const otp = page.match(/div class="alert alert-success" role="alert".*?([0-9]{5})/);
            if (!otp) throw new Error('пароль не найден в ответе');
            inputEl.value = otp[1];
            inputEl.select();
            crmToast(`Пароль ${otp[1]} — поле очистится через 15 с`, 'success', { title: 'Разовый пароль МП' });
            setTimeout(() => { if (inputEl.value === otp[1]) inputEl.value = ''; }, 15000);
        } catch (e) {
            crmToast(`${e.message}. Проверьте ID и вход в id.skyeng.ru`, 'error', { title: 'Разовый пароль МП' });
        } finally {
            crmSetBusy(buttonEl, false);
        }
        return true;
    }

    LK_FIELDS.forEach((f) => {
        const buttonEl = document.getElementById(f.btn);
        const inputEl = document.getElementById(f.input);

        const run = async () => {
            const value = inputEl.value.trim();
            if (!value) {
                inputEl.classList.add('is-invalid');
                inputEl.focus();
                setTimeout(() => inputEl.classList.remove('is-invalid'), 1200);
                return;
            }
            if (f.kind === 'otp') {
                await getMobilePassword(f, inputEl, buttonEl);
                return;
            }
            const encoded = encodeURIComponent(value);
            if (f.kind === 'copy') {
                if (await crmCopy(f.build(encoded))) crmToast(f.msg, 'success', { duration: 2200 });
                else crmToast('Не удалось скопировать ссылку', 'error');
            } else {
                open(`${f.url}${encoded}${f.suffix || ''}`);
            }
            inputEl.value = '';
        };

        buttonEl.onclick = run;
        inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
    });

    /* ---------- Подвал ---------- */

    document.getElementById('restartlesson').onclick = async () => {
        if (await crmCopy("setStatus('classwork')")) crmToast("Команда setStatus('classwork') скопирована", 'success', { duration: 2200 });
    };

    document.getElementById('curVeriOSCRM').onclick = () =>
        open('https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732');
    document.getElementById('curVerAndroidCRM').onclick = () =>
        open('https://play.google.com/store/apps/details?id=skyeng.words.prod');

    /* ---------- Версии мобильных приложений (грузим один раз) ---------- */

    let versionsPromise = null;

    /** Скрипт-источник иногда сам присылает «iOS 10.19» — не дублируем платформу. */
    function versionText(platform, value, note) {
        const name = String(value || '').trim();
        return new RegExp(`^${platform}\\b`, 'i').test(name) ? `${name} (${note})` : `${platform}: ${name} (${note})`;
    }

    function loadVersions() {
        if (versionsPromise) return versionsPromise;
        const iosEl = document.getElementById('curVeriOSCRM');
        const andEl = document.getElementById('curVerAndroidCRM');

        versionsPromise = fetch('https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec')
            .then((r) => r.json())
            .then((data) => {
                const v = data && data.result;
                if (!v || !v[0] || !v[1]) throw new Error('пустой ответ');
                iosEl.textContent = versionText('iOS', v[1][0], v[1][1]);
                andEl.textContent = versionText('Android', v[0][0], v[0][1]);
            })
            .catch((err) => {
                console.warn('[Links] версии приложений не загружены:', err);
                iosEl.textContent = 'iOS: нет данных';
                andEl.textContent = 'Android: нет данных';
                versionsPromise = null; // повторим при следующем открытии
            });
        return versionsPromise;
    }

    document.getElementById('butdiagtoolsCRM').onclick = () => {
        if (crmToggleWindow('AF_Links')) loadVersions();
    };
})();
