/**
 * Link_Hybrid.js — окно «Ссылки и инструменты» (ТП / КЦ)
 * Visual Style: Corporate Graphite Dark (как Queue.js)
 * Unique Prefix: lkg-
 *
 * Быстрые ссылки, переход по ID, свои кнопки (ПКМ — изменить), версии МП.
 * Структура — по образцу CRM_Helper_v2/Modules/Link.js: справочники данных + рендер.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'AF_LinksHybrid'; // ключ прежний — свои кнопки пользователей сохраняются

    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[ch]);

    const notify = (msg, type) => {
        if (typeof showCustomAlert === 'function') showCustomAlert(msg, type);
        else alert(msg);
    };

    const open = (url) => window.open(url, '_blank', 'noopener');

    /** Только http(s): в свою кнопку нельзя положить javascript:… */
    function normalizeUrl(raw) {
        try {
            const url = new URL(String(raw).trim());
            return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
        } catch (_) {
            return null;
        }
    }

    /** Flex-админка за ТЕКУЩИЕ сутки по МСК (URL считается в момент клика). */
    function flexAdminTodayUrl() {
        const DAY = 86400;
        const MSK = 3 * 3600;
        const nowSec = Math.floor(Date.now() / 1000);
        const dayStart = Math.floor((nowSec + MSK) / DAY) * DAY - MSK;
        return `https://public-seminars-admin.skyeng.ru/english?dateFrom=${dayStart}&dateTo=${dayStart + DAY - 1}`;
    }

    /* ---------- Иконки (inline SVG, наследуют currentColor) ---------- */

    const svg = (path, size = 15) =>
        `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

    const ICONS = {
        external: svg('<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>'),
        copy: svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>'),
        run: svg('<path d="M6 4l14 8-14 8z"/>'),
        plus: svg('<path d="M12 5v14M5 12h14"/>', 16),
        close: svg('<path d="M6 6l12 12M18 6L6 18"/>', 16)
    };

    /* ---------- Справочник: ТП ---------- */

    // action — вызывает внешнюю функцию ChMAF вместо ссылки
    const TP_LINKS = [
        { id: 'deleteaclnk', top: true, icon: '🗑', label: 'ПД', title: 'Заявка на удаление персональных данных', url: 'https://infra.skyeng.ru/request/create/166' },
        { id: 'knoweledgebase', top: true, icon: '📚', label: 'БЗ', title: 'База знаний в Confluence', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=25407293' },
        { id: 'essayadmin', top: true, icon: '📝', label: 'Эссе', title: 'Админка эссе', url: 'https://api-english.skyeng.ru/admin/platform/openanswer/list' },
        { id: 'getStats', top: true, icon: '📋', label: 'Статистика', title: 'Статистика', action: 'getStatsButtonPress' },
        { id: 'resetMMPassword', top: true, icon: '🔐', label: 'MM пароль', title: 'Infra: сброс пароля Mattermost', url: 'https://infra.skyeng.ru/request/create/233' },
        { id: 'GrListData', top: true, icon: '👥', label: 'Список гр.', title: 'Состав группы по ID', action: 'getGrListDataButtonPress' },
        { id: 'minecraftAccs', top: true, icon: '⛏️', label: 'Minecraft', title: 'УЗ Minecraft', url: 'https://disk.yandex.ru/edit/d/ARTwOEreBvxL1L4cDRCvEyPegnqahzm72s0qoIz-cKg6al9hdmhpLVFTZw' },
        { id: 'openIPCheck', top: true, icon: '🌐', label: 'IP инфо', title: 'Окно проверки IP', action: 'toggleIpCheck' },
        { id: 'confbugs', top: true, icon: '🐞', label: 'Баги', title: 'Известные баги на платформе', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=96042583' },
        { id: 'timetable', icon: '📅', label: 'TimeTable', title: 'Timetable', url: 'https://timetable.skyeng.ru/' },
        { id: 'talksadm', icon: '🗣', label: 'Talks', title: 'Talks Admin', url: 'https://vimbox.skyeng.ru/talks/admin/statistics' },
        { id: 'compensNotFairPayments', icon: '🚫', label: 'Честн. оплат', title: 'Форма: нет честных оплат', url: 'https://forms.yandex.ru/cloud/6876066349363940156734b8/?page=1' },
        { id: 'compens', icon: '💸', label: 'Компенсации', title: 'Создание операции компенсации', url: 'https://billing-marketing.skyeng.ru/accrual-operations/create' },
        { id: 'CMS', icon: '🌀', label: 'CMS', title: 'CMS хранилище материалов уроков', url: 'https://cms-vimbox.skyeng.ru/vim' },
        { id: 'kidscms', icon: '🌀', label: 'Kids CMS', title: 'CMS детских предметов', url: 'https://vimbox.skyeng.ru/kids/math/cms/lessons/1' },
        { id: 'useradm', icon: '🛠️', label: 'Админка', title: 'Админка пользователей', url: 'https://id.skyeng.ru/admin/users' },
        { id: 'transactions', icon: '💳', label: 'Поиск платежа', title: 'Поиск транзакций', url: 'https://accounting.skyeng.ru/userpayment/search/transaction' },
        { id: 'billingadm', icon: '🧮', label: 'Начислятор', title: 'Начислятор биллинга', url: 'https://billing-api.skyeng.ru/operations' },
        { id: 'subscribebilling', icon: '🔁', label: 'Подписки', title: 'Биллинг подписок', url: 'https://billing-api.skyeng.ru/subscriptions' },
        { id: 'userfeatures', icon: '🏡', label: 'Фичи', title: 'Фичи (круги) пользователя', url: 'https://vimbox.skyeng.ru/circles/editor' },
        { id: 'testroom', icon: 'ℹ️', label: 'TestRooms', title: 'Тестовые комнаты', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638' },
        { id: 'apelation', icon: '💫', label: 'Апелляции', title: 'Форма апелляций', url: 'https://docs.google.com/forms/d/e/1FAIpQLSdgsb6pte1H1dz15Eb5NjDe0gj3kEnh0hTe6Cgy8d81mT7NUA/viewform' },
        { id: 'browserstack', icon: '🌐', label: 'BrowserStack', title: 'BrowserStack', url: 'https://www.browserstack.com/users/sign_in' },
        { id: 'certificates', icon: '📜', label: 'Сертификаты', title: 'Проверка сертификатов', url: 'https://billing-marketing.skyeng.ru/certificate/certSearch' },
        { id: 'promocodes', icon: '🏷', label: 'Промокоды', title: 'Проверка промокодов', url: 'https://billing-marketing.skyeng.ru/promocode/list' },
        { id: 'helpocentrstud', icon: '📔', label: 'БЗ У', title: 'Help Center для учеников', url: 'https://helpcenter.skyeng.ru/students' },
        { id: 'helpocentrteach', icon: '📗', label: 'БЗ П', title: 'Help Center для преподавателей', url: 'https://helpcenter.skyeng.ru/teachers' },
        { id: 'trshoothing', icon: '🔨', label: 'Траблшутер', title: 'Траблшутер', url: 'https://video-trouble-shooter.skyeng.ru/' },
        { id: 'Synchronizer', icon: '♻️', label: 'Синхрон ДЗ', title: 'Синхронизация ДЗ', url: 'https://learning.skyeng.ru/upsert-history' },
        { id: 'AddRemoveChat', icon: '💬', label: 'Чаты', title: 'Добавить / удалить чат', url: 'https://communications.skyeng.ru/gateway/support/chat-management' },
        { id: 'CheckPrices', icon: '🏷', label: 'Цены', title: 'Check Price — наборы цен', url: 'https://billing-marketing.skyeng.ru/priceSet/list' },
        { id: 'CheckVidConnection', icon: '📹', label: 'Видео', title: 'Проверка видеосервера', url: 'https://video-check.skyeng.ru/' },
        { id: 'goProcash', icon: '💳', label: 'BIN', title: 'Check BIN банка', url: 'https://procash.app/tools/bin-lookup' },
        { id: 'faqext', icon: '❓', label: 'ChMAF', title: 'Инструкция ChMAF', url: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971' },
        { id: 'rkKidsTP', icon: '🧒', label: 'РК Kids', title: 'Админка Kids РК (встречи клубов)', url: 'https://group.skyeng.ru/admin/?crudAction=index&crudControllerFqcn=App%5CController%5CAdmin%5CClubKidMeetingCrudController&entityFqcn=App%5CEntity%5CClubMeeting' },
        { id: 'rkAdultsTP', icon: '👥', label: 'РК Adults', title: 'Админка Adults РК (расписание клубов)', url: 'https://skyeng.ru/clubs/admin/schedule' },
        { id: 'flexAdminTP', icon: '🎓', label: 'Flex', title: 'Админка Flex (семинары за сегодня)', url: flexAdminTodayUrl }
    ];

    /* ---------- Справочник: КЦ ---------- */

    const KC_LINKS = [
        { id: 'knoweledgebaseKC', top: true, icon: '📚', label: 'БЗ', title: 'База знаний', url: 'https://confluence.skyeng.tech/display/CSW/Customer+Service+WIKI' },
        { id: 'lessonrecordKC', top: true, icon: '👩‍🏫', label: 'Запись урока', title: 'Запись урока', url: 'https://tramway.skyeng.ru/record' },
        { id: 'skyhomeKC', top: true, icon: '💼', label: 'Skyeng Home', title: 'Skyeng Home', url: 'https://home.skyeng.ru/dashboard' },
        { id: 'timetableKC', icon: '📅', label: 'TimeTable', title: 'Timetable', url: 'https://timetable.skyeng.ru/' },
        { id: 'CalcKC', icon: '🧮', label: 'Калькулятор', title: 'Операции биллинга', url: 'https://billing-api.skyeng.ru/operations' },
        { id: 'nachislyatorKC', icon: '💸', label: 'Начислятор', title: 'Создание операции начисления', url: 'https://billing-marketing.skyeng.ru/accrual-operations/create' },
        { id: 'rassrochKC', icon: '💳', label: 'Рассрочка', title: 'Список рассрочек', url: 'https://accounting.skyeng.ru/credit/list' },
        { id: 'pondpisKC', icon: '🔁', label: 'Подписки', title: 'Биллинг подписок', url: 'https://billing-api.skyeng.ru/subscriptions' },
        { id: 'omniKC', icon: '📩', label: 'Omni', title: 'Omnidesk', url: 'https://skyeng.omnidesk.ru/' },
        { id: 'RKKC', icon: '👥', label: 'РК', title: 'Участники РК', url: 'https://group.skyeng.ru/admin/?crudAction=index&crudControllerFqcn=App%5CController%5CAdmin%5CClubMemberCrudController&signature=V8w5PW8LT3GcoYMoSYzprG1lCW8F5sb5y7Bdrxh08pc' },
        { id: 'rkKidsKC', icon: '🧒', label: 'РК Kids', title: 'Админка Kids РК (встречи клубов)', url: 'https://group.skyeng.ru/admin/?crudAction=index&crudControllerFqcn=App%5CController%5CAdmin%5CClubKidMeetingCrudController&entityFqcn=App%5CEntity%5CClubMeeting' },
        { id: 'rkAdultsKC', icon: '👥', label: 'РК Adults', title: 'Админка Adults РК (расписание клубов)', url: 'https://skyeng.ru/clubs/admin/schedule' },
        { id: 'flexAdminKC', icon: '🎓', label: 'Flex', title: 'Админка Flex (семинары за сегодня)', url: flexAdminTodayUrl },
        { id: 'shablKC', icon: '📝', label: 'Шаблоны', title: 'Таблица шаблонов', url: 'https://docs.google.com/spreadsheets/d/14paTabjaJcRIvlpTQzdGePltiN0bsPaFjFEbn4DD3Ho/edit#gid=410124091' },
        { id: 'narushKC', icon: '⚠️', label: 'Нарушение БП', title: 'Форма нарушения БП', url: 'https://docs.google.com/forms/d/e/1FAIpQLSeAxtdad9yc5iLo-7v4rqMj5M2wdaJKOpzy5X_eWkHqHWY9sg/viewform' },
        { id: 'grafKC', icon: '🗓', label: 'График', title: 'График смен', url: 'https://docs.google.com/spreadsheets/d/1SiD1yfpzIEF8ZafVXnq0Z-hyF0b45aAQ8s6BWgy-s0c/edit#gid=1933422994' }
    ];

    /* ---------- Поля «Переход по ID» (только ТП) ---------- */

    // kind: open — открыть ссылку, copy — скопировать ссылку, sync — внешний синхронизатор
    const TP_FIELDS = [
        { btn: 'benchmark', input: 'cpuname', ph: 'Процессор', kind: 'open', url: 'https://www.cpubenchmark.net/cpu_lookup.php?cpu=', title: 'Название CPU → рейтинг на cpubenchmark' },
        { btn: 'credits', input: 'creditstatus', ph: 'ID У: рассрочки', kind: 'open', url: 'https://billing-api.skyeng.ru/installments?perPage=10&ownerId=', title: 'ID ученика → рассрочки' },
        { btn: 'gotolookip', input: 'iplookup', ph: 'IP адрес', kind: 'open', url: 'https://check-host.net/ip-info?host=', title: 'IP → гео и хостинг' },
        { btn: 'getlgsinfo', input: 'lgssearch', ph: 'ID группы LGS', kind: 'open', url: 'https://learning-groups-storage.skyeng.ru/group/', suffix: '?cp=(section:participants)', title: 'ID группы → админка LGS' },
        { btn: 'cmsid', input: 'cmsstepid', ph: 'stepUUID в CMS', kind: 'open', url: 'https://content.vimbox.skyeng.ru/cms/step-store/update/id/', title: 'stepUUID → шаг в CMS' },
        { btn: 'getschemes', input: 'schemesteacher', ph: 'ID П: схемы оплаты', kind: 'open', url: 'https://teacher-incentive.skyeng.ru/incentive/teacher/', title: 'ID преподавателя → схемы вознаграждения' },
        { btn: 'getpushes', input: 'pushes', ph: 'ID У: пуши', kind: 'open', url: 'https://push-notifications.skyeng.ru/cms/logs?page=1&paginateBy=100&userId=', title: 'ID ученика → отправленные пуши' },
        { btn: 'gettrshinfo', input: 'trshooterhash', ph: 'Хеш комнаты', kind: 'open', url: 'https://video-trouble-shooter.skyeng.ru/?hash=', title: 'Хеш комнаты → траблшутер' },
        { btn: 'doSynchrozine', input: 'sIdSynchronize', ph: 'ID услуги: синхрон', kind: 'sync', title: 'Синхронизация ДЗ по ID услуги' },
        { btn: 'getenablerAP', input: 'enablerAP', ph: 'ID услуги: включить АП', kind: 'copy', build: v => `https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${v}`, msg: '💾 Ссылка АП скопирована', title: 'Копирует ссылку активации АП' },
        { btn: 'doskiponboard', input: 'skiponboarding', ph: 'ID услуги: без онбординга', kind: 'copy', disabled: true, build: v => `https://learning.skyeng.ru/api/v1/education-service/${v}/skip-onboarding`, msg: '💾 Ссылка Skip Onbo скопирована', title: 'Отключить онбординг в ЛКУ (временно недоступно)' },
        { btn: 'getskipAP', input: 'skipAP', ph: 'ID услуги: пропуск АП', kind: 'copy', disabled: true, build: v => `https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${v}&skipAutoSelection=1`, msg: '💾 Ссылка Skip AP скопирована', title: 'Пропустить АП (временно недоступно)' }
    ];

    const FIELD_ICONS = { open: ICONS.external, copy: ICONS.copy, sync: ICONS.run };

    /* ---------- Конфиг (свои кнопки + отдел) ---------- */

    function checkIsTP() {
        try {
            const data = JSON.parse(localStorage.getItem('AF_storage_data') || '{}');
            if (typeof scriptAdr !== 'undefined') {
                return ![data.KC_addr, data.KC_addrRzrv].includes(scriptAdr);
            }
        } catch (_) { /* нет данных — считаем ТП */ }
        return true;
    }

    function loadConfig() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (parsed && Array.isArray(parsed.customButtons)) return parsed;
        } catch (_) { /* битый JSON — с нуля */ }
        return { version: '1.0', customButtons: [] };
    }

    const config = loadConfig();
    // Отдел всегда актуализируем: оператор мог перейти из ТП в КЦ
    config.isTP = checkIsTP();
    const saveConfig = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    saveConfig();

    const isTP = config.isTP;
    const LINKS = isTP ? TP_LINKS : KC_LINKS;
    const linkById = new Map(LINKS.map(b => [b.id, b]));

    /* ---------- Стили ---------- */

    function injectStyles() {
        if (document.getElementById('lkg-styles')) return;
        const style = document.createElement('style');
        style.id = 'lkg-styles';
        style.textContent = `
            #AF_Links .lkg-panel {
                box-sizing: border-box;
                width: ${isTP ? 'min(790px, calc(100vw - 24px))' : 'min(560px, calc(100vw - 24px))'};
                max-width: 100%;
                max-height: calc(100vh - 40px);
                overflow-y: auto;
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
                position: relative;
                scrollbar-width: thin;
                scrollbar-color: #536a8e transparent;
            }
            #AF_Links .lkg-panel, #AF_Links .lkg-panel * { box-sizing: border-box; }

            /* Шапка */
            #AF_Links .lkg-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 14px;
                padding-bottom: 14px;
                border-bottom: 1px solid #344258;
                cursor: move;
            }
            #AF_Links .lkg-title {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 7px 12px;
                color: #a6b4cb;
                background: #182335;
                border: 1px solid #364660;
                border-radius: 10px;
                letter-spacing: .03em;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
            }
            #AF_Links .lkg-title b { color: #a9c0ff; font-family: 'JetBrains Mono', 'SF Mono', monospace; }
            #AF_Links .lkg-grow { flex: 1 1 auto; }

            /* Кнопки */
            #AF_Links .lkg-btn {
                min-height: 36px;
                padding: 8px 14px;
                color: #dce5f5;
                background: #1b283c;
                border: 1px solid #3c4d68;
                border-radius: 9px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-family: inherit;
                white-space: nowrap;
                transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
            }
            #AF_Links .lkg-btn:hover:not(:disabled) {
                color: #fff;
                background: #293b56;
                border-color: #7799e2;
                transform: translateY(-1px);
            }
            #AF_Links .lkg-btn:disabled { opacity: .45; cursor: not-allowed; }
            #AF_Links .lkg-btn:focus-visible { outline: 2px solid #9ab5ff; outline-offset: 2px; }
            #AF_Links .lkg-btn-sm { min-height: 30px; padding: 5px 10px; font-size: 12px; }

            #AF_Links .lkg-btn-primary {
                color: #eef3ff;
                background: #4268c9;
                border-color: #7293ed;
                box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
            }
            #AF_Links .lkg-btn-primary:hover:not(:disabled) {
                background: #547ce1;
                border-color: #a2b9fa;
                box-shadow: 0 6px 19px rgba(58, 96, 205, .3);
            }
            #AF_Links .lkg-btn-accent {
                color: #cfe0ff;
                background: #293e67;
                border-color: #536fa7;
            }
            #AF_Links .lkg-btn-accent:hover:not(:disabled) {
                background: #395892;
                border-color: #87a9ed;
            }
            /* !important — перебить глобальный #hideMe из CSS/style.css */
            #AF_Links #hideMe {
                min-height: 36px !important;
                width: auto !important;
                padding: 8px 12px !important;
                margin: 0 !important;
                background: rgba(255, 116, 140, .08) !important;
                border: 1px solid rgba(255, 116, 140, .3) !important;
                border-radius: 9px !important;
                color: #ffb0be !important;
            }
            #AF_Links #hideMe:hover { background: rgba(255, 116, 140, .2) !important; }

            /* Секции */
            #AF_Links .lkg-section + .lkg-section {
                margin-top: 14px;
                padding-top: 14px;
                border-top: 1px solid #263349;
            }
            #AF_Links .lkg-section-title {
                margin-bottom: 9px;
                color: #8d9cb6;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: .06em;
                text-transform: uppercase;
            }

            /* Сетка ссылок */
            #AF_Links .lkg-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
                gap: 6px;
            }
            #AF_Links .lkg-link {
                display: flex;
                align-items: center;
                gap: 7px;
                min-width: 0;
                min-height: 34px;
                padding: 6px 9px;
                color: #dce5f5;
                background: #1a2536;
                border: 1px solid #344258;
                border-left: 3px solid #617fbd;
                border-radius: 9px;
                cursor: pointer;
                font-size: 12px; font-weight: 600; line-height: 1.2;
                font-family: inherit;
                text-align: left;
                transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
            }
            #AF_Links .lkg-link:hover {
                color: #fff;
                background: #23334b;
                border-color: #6685be;
                border-left-color: #92afff;
                transform: translateY(-1px);
            }
            #AF_Links .lkg-link.is-action { border-left-color: #c49a4a; }
            #AF_Links .lkg-link.is-action:hover { border-left-color: #f0c674; }
            #AF_Links .lkg-link.is-custom { border-left-color: #4fae8c; border-style: dashed; border-left-style: solid; }
            #AF_Links .lkg-link.is-custom:hover { border-left-color: #7fe0bb; }
            #AF_Links .lkg-link-ico { flex: 0 0 auto; font-size: 15px; line-height: 1; }
            #AF_Links .lkg-link-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

            /* Строка быстрого доступа (только значки) */
            #AF_Links .lkg-quick {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(66px, 1fr));
                gap: 6px;
            }
            #AF_Links .lkg-link.lkg-quick-btn,
            #AF_Links .lkg-link.lkg-quick-btn:hover {
                border: 1px solid #344258;
            }
            #AF_Links .lkg-link.lkg-quick-btn:hover { border-color: #6685be; }
            #AF_Links .lkg-quick-btn {
                flex-direction: column;
                justify-content: center;
                gap: 4px;
                min-height: 58px;
                padding: 7px 4px;
                text-align: center;
            }
            #AF_Links .lkg-quick-btn .lkg-link-ico { font-size: 19px; }
            #AF_Links .lkg-quick-btn .lkg-link-text { max-width: 100%; font-size: 11px; color: #b9c6dc; }
            #AF_Links .lkg-quick-btn:hover .lkg-link-text { color: #fff; }

            /* Поля «Переход по ID» */
            #AF_Links .lkg-fields {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 6px;
            }
            #AF_Links .lkg-field { display: flex; min-width: 0; }
            #AF_Links .lkg-input {
                flex: 1 1 auto;
                min-width: 0;
                height: 34px;
                padding: 0 10px;
                color: #edf2fb;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-right: none;
                border-radius: 9px 0 0 9px;
                outline: none;
                font-size: 12px;
                font-family: inherit;
                transition: background .2s, border-color .2s, box-shadow .2s;
            }
            #AF_Links .lkg-input:hover:not(:disabled) { background: #142034; border-color: #657caa; }
            #AF_Links .lkg-input:focus {
                background: #142034;
                border-color: #829fff;
                box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
            }
            #AF_Links .lkg-input::placeholder { color: #7d8ca6; }
            #AF_Links .lkg-input:disabled { opacity: .45; cursor: not-allowed; }
            #AF_Links .lkg-input.is-invalid { border-color: #ff748c; box-shadow: 0 0 0 3px rgba(255, 116, 140, .16); }
            #AF_Links .lkg-field-btn {
                flex: 0 0 36px;
                height: 34px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: #cfe0ff;
                background: #293e67;
                border: 1px solid #536fa7;
                border-radius: 0 9px 9px 0;
                cursor: pointer;
                transition: background-color .16s ease, border-color .16s ease;
            }
            #AF_Links .lkg-field-btn:hover:not(:disabled) { color: #fff; background: #395892; border-color: #87a9ed; }
            #AF_Links .lkg-field-btn:disabled { opacity: .45; cursor: not-allowed; }

            /* Подвал */
            #AF_Links .lkg-foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
            #AF_Links .lkg-label { color: #8d9cb6; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
            #AF_Links .lkg-version { font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 11px; color: #b6c9f5; }

            #AF_Links .lkg-panel::-webkit-scrollbar { width: 6px; }
            #AF_Links .lkg-panel::-webkit-scrollbar-thumb { background: #536a8e; border-radius: 4px; }

            /* Диалог своей кнопки */
            .lkg-dialog-overlay {
                position: fixed;
                inset: 0;
                z-index: 2147483000;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(3, 9, 22, .62);
                font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
            }
            .lkg-dialog {
                width: min(400px, calc(100vw - 32px));
                color: #edf2fb;
                background:
                    radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
                    #111827;
                border: 1px solid #344258;
                border-radius: 16px;
                box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
            }
            .lkg-dialog * { box-sizing: border-box; }
            .lkg-dialog-body { padding: 18px 18px 6px; }
            .lkg-dialog-title { font-size: 15px; font-weight: 700; color: #f0f4fb; margin-bottom: 4px; }
            .lkg-dialog-msg { font-size: 12px; color: #8d9cb6; margin-bottom: 14px; }
            .lkg-dialog label { display: block; margin-bottom: 10px; }
            .lkg-dialog label span { display: block; margin-bottom: 4px; color: #8d9cb6; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
            .lkg-dialog input {
                width: 100%;
                height: 36px;
                padding: 0 10px;
                color: #edf2fb;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 9px;
                outline: none;
                font-size: 13px;
                font-family: inherit;
            }
            .lkg-dialog input:focus { background: #142034; border-color: #829fff; box-shadow: 0 0 0 3px rgba(110, 152, 247, .16); }
            .lkg-dialog input.is-invalid { border-color: #ff748c; }
            .lkg-dialog-foot { display: flex; gap: 8px; justify-content: flex-end; padding: 12px 18px 18px; }
            .lkg-dialog-foot button {
                min-height: 34px;
                padding: 7px 14px;
                color: #dce5f5;
                background: #1b283c;
                border: 1px solid #3c4d68;
                border-radius: 9px;
                cursor: pointer;
                font-size: 13px; font-weight: 600;
                font-family: inherit;
            }
            .lkg-dialog-foot button:hover { color: #fff; background: #293b56; border-color: #7799e2; }
            .lkg-dialog-foot .is-primary { color: #eef3ff; background: #4268c9; border-color: #7293ed; }
            .lkg-dialog-foot .is-primary:hover { background: #547ce1; border-color: #a2b9fa; }
            .lkg-dialog-foot .is-danger { margin-right: auto; color: #ffb0be; background: rgba(255, 116, 140, .08); border-color: rgba(255, 116, 140, .3); }
            .lkg-dialog-foot .is-danger:hover { background: rgba(255, 116, 140, .2); border-color: rgba(255, 116, 140, .55); }
        `;
        document.head.appendChild(style);
    }

    /* ---------- Разметка ---------- */

    function linksGridHtml() {
        const base = LINKS.filter(b => !b.top).map(b =>
            `<button type="button" class="lkg-link${b.action ? ' is-action' : ''}" id="${b.id}" title="${esc(b.title)}">` +
            `<span class="lkg-link-ico">${b.icon}</span><span class="lkg-link-text">${esc(b.label)}</span></button>`
        );
        const own = config.customButtons.map(b =>
            `<button type="button" class="lkg-link is-custom" data-custom-id="${esc(b.id)}" title="${esc(b.title)} — правый клик: изменить">` +
            `<span class="lkg-link-ico">${esc(b.icon)}</span><span class="lkg-link-text">${esc(b.title)}</span></button>`
        );
        return `<div class="lkg-grid">${base.concat(own).join('')}</div>`;
    }

    const quickHtml = () => `<div class="lkg-quick">${LINKS.filter(b => b.top).map(b =>
        `<button type="button" class="lkg-link lkg-quick-btn${b.action ? ' is-action' : ''}" id="${b.id}" title="${esc(b.title)}"><span class="lkg-link-ico">${b.icon}</span><span class="lkg-link-text">${esc(b.label)}</span></button>`
    ).join('')}</div>`;

    const fieldsHtml = () => `<div class="lkg-fields">${TP_FIELDS.map(f => `
        <div class="lkg-field">
            <input class="lkg-input" id="${f.input}" placeholder="${esc(f.ph)}" title="${esc(f.title)}" autocomplete="off"${f.disabled ? ' disabled' : ''}>
            <button type="button" class="lkg-field-btn" id="${f.btn}" title="${esc(f.title)}" aria-label="${esc(f.title)}"${f.disabled ? ' disabled' : ''}>${FIELD_ICONS[f.kind]}</button>
        </div>`).join('')}</div>`;

    function panelHtml() {
        const tpExtra = isTP ? `
            <div class="lkg-section">
                <div class="lkg-section-title">Переход по ID</div>
                ${fieldsHtml()}
            </div>
            <div class="lkg-section lkg-foot">
                <button type="button" class="lkg-btn lkg-btn-sm lkg-btn-accent" id="restartlesson" title="Скопировать setStatus('classwork')">${ICONS.copy} Classwork</button>
                <button type="button" class="lkg-btn lkg-btn-sm lkg-btn-primary" id="openGrabber" title="Открыть Grabber">📊 Grabber</button>
                <span class="lkg-grow"></span>
                <span class="lkg-label">Версии МП</span>
                <button type="button" class="lkg-btn lkg-btn-sm lkg-version" id="curVeriOS" title="Актуальная версия iOS. Клик — App Store">iOS: …</button>
                <button type="button" class="lkg-btn lkg-btn-sm lkg-version" id="curVerAndroid" title="Актуальная версия Android. Клик — Google Play">Android: …</button>
            </div>` : '';

        return `
            <div class="lkg-panel" id="lkg-container">
                <div class="lkg-header chmaf-drag-handle" id="lkg-drag-handle">
                    <button type="button" class="lkg-btn buttonHide" id="hideMe" title="Скрыть окно">❌</button>
                    <div class="lkg-title">🔗 Ссылки и инструменты <b>${isTP ? 'ТП' : 'КЦ'}</b></div>
                    <span class="lkg-grow"></span>
                    <button type="button" class="lkg-btn lkg-btn-accent" id="add-custom-btn" title="Добавить свою кнопку-ссылку">${ICONS.plus} Кнопка</button>
                </div>
                <div class="lkg-section">
                    <div class="lkg-section-title">Быстрый доступ</div>
                    ${quickHtml()}
                </div>
                <div class="lkg-section">
                    <div class="lkg-section-title">Ссылки</div>
                    <div id="lkg-grid-holder">${linksGridHtml()}</div>
                </div>
                ${tpExtra}
            </div>`;
    }

    /* ---------- Действия ---------- */

    const ACTIONS = {
        getStatsButtonPress: () => typeof getStatsButtonPress === 'function' && getStatsButtonPress(),
        getGrListDataButtonPress: () => typeof getGrListDataButtonPress === 'function' && getGrListDataButtonPress(),
        toggleIpCheck: () => {
            const panel = document.getElementById('AF_IpCheck');
            if (panel) panel.style.display = panel.style.display === '' ? 'none' : '';
        }
    };

    async function copyText(text) {
        if (typeof copyToClipboard === 'function') {
            copyToClipboard(text);
            return true;
        }
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (_) {
            return false;
        }
    }

    function renderGrid() {
        const holder = document.getElementById('lkg-grid-holder');
        if (holder) holder.innerHTML = linksGridHtml();
    }

    /* ---------- Диалог своей кнопки ---------- */

    function editCustomButton(existing) {
        const overlay = document.createElement('div');
        overlay.className = 'lkg-dialog-overlay';
        overlay.innerHTML = `
            <div class="lkg-dialog" role="dialog" aria-modal="true">
                <div class="lkg-dialog-body">
                    <div class="lkg-dialog-title">${existing ? '✏️ Изменить кнопку' : '➕ Новая кнопка'}</div>
                    <div class="lkg-dialog-msg">Кнопка появится в разделе «Ссылки». Правый клик по ней — изменить.</div>
                    <label><span>Название</span><input id="lkg-btn-title" maxlength="40" placeholder="Моя ссылка"></label>
                    <label><span>Значок (эмодзи)</span><input id="lkg-btn-icon" maxlength="8" placeholder="🔗"></label>
                    <label><span>Адрес</span><input id="lkg-btn-url" placeholder="https://…"></label>
                </div>
                <div class="lkg-dialog-foot">
                    ${existing ? '<button type="button" class="is-danger" id="lkg-btn-delete">🗑 Удалить</button>' : ''}
                    <button type="button" id="lkg-btn-cancel">Отмена</button>
                    <button type="button" class="is-primary" id="lkg-btn-save">Сохранить</button>
                </div>
            </div>`;

        const $ = sel => overlay.querySelector(sel);
        $('#lkg-btn-title').value = existing ? existing.title : '';
        $('#lkg-btn-icon').value = existing ? existing.icon : '';
        $('#lkg-btn-url').value = existing ? existing.url : '';

        const close = () => overlay.remove();
        $('#lkg-btn-cancel').onclick = close;
        overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(); });
        overlay.addEventListener('keydown', e => {
            if (e.key === 'Escape') close();
            if (e.key === 'Enter') $('#lkg-btn-save').click();
        });

        $('#lkg-btn-save').onclick = () => {
            const title = $('#lkg-btn-title').value.trim();
            const icon = $('#lkg-btn-icon').value.trim() || '🔗';
            const url = normalizeUrl($('#lkg-btn-url').value);
            $('#lkg-btn-title').classList.toggle('is-invalid', !title);
            $('#lkg-btn-url').classList.toggle('is-invalid', !url);
            if (!title || !url) {
                notify('Нужны название и адрес, начинающийся с http:// или https://', 'warning');
                return;
            }
            if (existing) Object.assign(existing, { title, icon, url });
            else config.customButtons.push({ id: `custom-${Date.now()}`, title, icon, url });
            saveConfig();
            renderGrid();
            close();
        };

        if (existing) {
            $('#lkg-btn-delete').onclick = () => {
                if (!confirm(`Удалить кнопку «${existing.title}»?`)) return;
                config.customButtons = config.customButtons.filter(b => b.id !== existing.id);
                saveConfig();
                renderGrid();
                close();
            };
        }

        document.body.appendChild(overlay);
        $('#lkg-btn-title').focus();
    }

    /* ---------- Версии мобильных приложений ---------- */

    let versionsPromise = null;

    function loadVersions() {
        if (versionsPromise) return versionsPromise;
        const iosEl = document.getElementById('curVeriOS');
        const andEl = document.getElementById('curVerAndroid');
        if (!iosEl || !andEl) return Promise.resolve();

        versionsPromise = fetch('https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec')
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(data => {
                const v = data && data.result;
                if (!v || !v[0] || !v[1]) throw new Error('пустой ответ');
                iosEl.textContent = `${v[1][0]} (${v[1][1]})`;
                andEl.textContent = `${v[0][0]} (${v[0][1]})`;
            })
            .catch(err => {
                console.warn('[Link_Hybrid] версии приложений не загружены:', err);
                iosEl.textContent = 'iOS: ❌';
                andEl.textContent = 'Android: ❌';
                versionsPromise = null; // повторим при следующем открытии
            });
        return versionsPromise;
    }

    /* ---------- События ---------- */

    function attachEvents(win) {
        // Делегирование: переживает перерисовку сетки
        win.addEventListener('click', e => {
            const btn = e.target.closest('.lkg-link');
            if (!btn) return;
            if (btn.dataset.customId) {
                const item = config.customButtons.find(b => b.id === btn.dataset.customId);
                const url = item && normalizeUrl(item.url);
                if (url) open(url);
                return;
            }
            const item = linkById.get(btn.id);
            if (!item) return;
            if (item.action) ACTIONS[item.action]?.();
            else if (item.url) open(typeof item.url === 'function' ? item.url() : item.url);
        });

        win.addEventListener('contextmenu', e => {
            const btn = e.target.closest('.lkg-link[data-custom-id]');
            if (!btn) return;
            e.preventDefault();
            const item = config.customButtons.find(b => b.id === btn.dataset.customId);
            if (item) editCustomButton(item);
        });

        document.getElementById('add-custom-btn').onclick = () => editCustomButton(null);

        if (!isTP) return;

        TP_FIELDS.forEach(f => {
            const buttonEl = document.getElementById(f.btn);
            const inputEl = document.getElementById(f.input);
            if (!buttonEl || !inputEl || f.disabled) return;

            if (f.kind === 'sync') {
                // Логика синхронизатора живёт во внешнем модуле (если подключён)
                if (typeof setupSynchronizer === 'function') setupSynchronizer();
                else buttonEl.disabled = inputEl.disabled = true;
                return;
            }

            const run = async () => {
                const value = inputEl.value.trim();
                if (!value) {
                    inputEl.classList.add('is-invalid');
                    inputEl.focus();
                    setTimeout(() => inputEl.classList.remove('is-invalid'), 1200);
                    return;
                }
                const encoded = encodeURIComponent(value);
                if (f.kind === 'copy') {
                    if (await copyText(f.build(encoded))) notify(f.msg);
                    else notify('Не удалось скопировать ссылку', 'error');
                } else {
                    open(`${f.url}${encoded}${f.suffix || ''}`);
                }
                inputEl.value = '';
            };

            buttonEl.onclick = run;
            inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
        });

        document.getElementById('restartlesson').onclick = async () => {
            if (await copyText("setStatus('classwork')")) notify('💾 Команда скопирована');
        };
        document.getElementById('openGrabber').onclick = () => {
            if (typeof getopenGrabberButtonPress === 'function') getopenGrabberButtonPress();
        };
        document.getElementById('curVeriOS').onclick = () =>
            open('https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732');
        document.getElementById('curVerAndroid').onclick = () =>
            open('https://play.google.com/store/apps/details?id=skyeng.words.prod');
    }

    /* ---------- Запуск ---------- */

    function init() {
        if (document.getElementById('AF_Links')) return;
        if (typeof createWindow !== 'function') {
            console.warn('[Link_Hybrid] createWindow не найдена');
            return;
        }

        injectStyles();
        createWindow('AF_Links', 'winTopLinks', 'winLeftLinks', panelHtml());

        const win = document.getElementById('AF_Links');
        if (!win) {
            console.error('[Link_Hybrid] Панель AF_Links не найдена!');
            return;
        }
        win.style.display = 'none';

        if (typeof hideWindowOnDoubleClick === 'function') hideWindowOnDoubleClick('AF_Links');
        if (typeof hideWindowOnClick === 'function') hideWindowOnClick('AF_Links', 'hideMe');

        attachEvents(win);

        const btnL = document.getElementById('links');
        if (btnL) {
            btnL.onclick = () => {
                const hidden = win.style.display === 'none';
                win.style.display = hidden ? '' : 'none';
                if (hidden && isTP) loadVersions();
            };
        } else {
            console.warn('[Link_Hybrid] Кнопка links не найдена');
        }
    }

    if (typeof createWindow === 'function') init();
    else setTimeout(init, 1000);
})();
