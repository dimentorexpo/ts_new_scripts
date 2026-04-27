// ==========================================
// 1. HTML ШАБЛОНЫ (С ОБНОВЛЕННОЙ СТРУКТУРОЙ)
// ==========================================
const win_Links = `
<div class="sky-panel" id="main_links_panel">
    <!-- Верхний бар иконок -->
    <div class="sky-grid" style="grid-template-columns: repeat(10, 1fr); margin-bottom: 8px;">
        <button title="Скрытие меню" id="hideMe" class="sky-btn" style="background: #ff4757;">❌</button>
        <button title="Удаление ПД" id="deleteaclnk" class="sky-btn">🗑</button>
        <button title="База знаний" id="knoweledgebase" class="sky-btn">📚</button>
        <button title="Админка эссе" id="essayadmin" class="sky-btn">📝</button>
        <button title="Статистика" id="getStats" class="sky-btn">📋</button>
        <button title="Сброс пароля MM" id="resetMMPassword" class="sky-btn">🔐</button>
        <button title="Список группы" id="GrListData" class="sky-btn">👩‍👩‍👧‍👦</button>
        <button title="УЗ Minecraft" id="minecraftAccs" class="sky-btn">⛏️</button>
        <button title="Информация по IP" id="openIPCheck" class="sky-btn">🌐</button>
        <button title="Известные баги" id="confbugs" class="sky-btn">🐞</button>
    </div>

    <!-- Основные кнопки -->
    <div class="sky-grid" style="grid-template-columns: repeat(5, 1fr); gap: 5px; margin-bottom: 10px;">
        <button class="sky-btn" id="timetable" title="Timetable">📅 TimeTable</button>
        <button class="sky-btn" id="talksadm" title="Talks Admin">💋 Talks</button>
        <button class="sky-btn" id="compensNotFairPayments" title="Нет честных оплат">🚫 Честн.Оплат</button>
        <button class="sky-btn" id="compens" title="Компенсации">💸 Компенсац.</button>
        <button class="sky-btn" id="CMS" title="CMS">🌀 CMS</button>
        <button class="sky-btn" id="useradm" title="Админка пользователей">🛠️ Админка</button>
        <button class="sky-btn" id="transactions" title="Поиск транзакций">💰 Поиск $</button>
        <button class="sky-btn" id="billingadm" title="Начислятор">💸 Начислятор</button>
        <button class="sky-btn" id="userfeatures" title="User Фичи">🏡 Фичи</button>
        <button class="sky-btn" id="kidscms" title="Kids CMS">🌀 Kids CMS</button>
        <button class="sky-btn" id="testroom" title="Тестовые комнаты">ℹ️ TestRooms</button>
        <button class="sky-btn" id="subscribebilling" title="Подписки">💰 $Подписки</button>
        <button class="sky-btn" id="apelation" title="Апелляции">💫 Апелляции</button>
        <button class="sky-btn" id="browserstack" title="BrowserStack">🌐 B-Stack</button>
        <button class="sky-btn" id="certificates" title="Сертификаты">📜 Сертиф.</button>
        <button class="sky-btn" id="promocodes" title="Промокоды">*️⃣ Промо</button>
        <button class="sky-btn" id="helpocentrstud" title="Help БЗ У">📔 БЗ У</button>
        <button class="sky-btn" id="helpocentrteach" title="Help БЗ П">📗 БЗ П</button>
        <button class="sky-btn" id="trshoothing" title="Траблшутинг">🔨 ТраблШут</button>
        <button class="sky-btn" id="Synchronizer" title="Синхрон ДЗ">♻️ Синхрон</button>
        <button class="sky-btn" id="AddRemoveChat" title="Добавить/Удалить чат">➕/➖ Чат</button>
        <button class="sky-btn" id="CheckPrices" title="Check Price">🤑 Prices</button>
        <button class="sky-btn" id="CheckVidConnection" title="Видеосервер">📹 Video</button>
        <button class="sky-btn" id="openFinansoBin" title="Check BIN">💳 BIN</button>
        <button class="sky-btn" id="faqext" title="Инструкция">❓ ChMAF</button>
    </div>

    <!-- Инпуты с поиском -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
        <div class="sky-input-group">
            <input class="sky-input" id="cpuname" placeholder="CPU name" title="Рейтинг CPU">
            <button class="sky-btn" id="benchmark">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="creditstatus" placeholder="ID У рассрочка">
            <button class="sky-btn" id="credits">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="iplookup" placeholder="IP адрес">
            <button class="sky-btn" id="gotolookip">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="lgssearch" placeholder="ID Группы LGS">
            <button class="sky-btn" id="getlgsinfo">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="cmsstepid" placeholder="CMS stepUUID">
            <button class="sky-btn" id="cmsid">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="schemesteacher" placeholder="ID П схемы">
            <button class="sky-btn" id="getschemes">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="pushes" placeholder="ID У пуши">
            <button class="sky-btn" id="getpushes">🔎</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="trshooterhash" placeholder="Hash комнаты">
            <button class="sky-btn" id="gettrshinfo">🚀</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="sIdSynchronize" placeholder="ID Ус синхр">
            <button class="sky-btn" id="doSynchrozine">🚀</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="enablerAP" placeholder="ID услуги АП">
            <button class="sky-btn" id="getenablerAP">💾</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="skiponboarding" placeholder="ID ус(skip Onbo)" title="Отключить онбоардинг в ЛКУ" disabled>
            <button class="sky-btn" id="doskiponboard" disabled>💾</button>
        </div>
        <div class="sky-input-group">
            <input class="sky-input" id="skipAP" placeholder="ID ус(skipАП)" title="Пропустить АП (копирует ссылку)" disabled>
            <button class="sky-btn" id="getskipAP" disabled>💾</button>
        </div>
    </div>

    <!-- Подвал с версиями -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px solid #eee; padding-top: 5px;">
        <div style="display: flex; gap: 5px;">
            <button class="sky-btn" id="restartlesson" style="background: #2ed573; color: white;">Classwork💾</button>
            <button class="sky-btn" id="openGrabber" title="Парсинг чатов" style="background: #ffa502; color: white;">Grabber 🔎</button>
        </div>
        <div style="display: flex; gap: 5px;">
            <button class="sky-btn" id="curVeriOS" style="font-size: 13px;">iOS: ⏳</button>
            <button class="sky-btn" id="curVerAndroid" style="font-size: 13px;">Android: ⏳</button>
        </div>
    </div>
</div>`;

const win_LinksKC = `
<div class="sky-panel" id="main_links_panel_kc">
    <div class="sky-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 8px;">
        <button title="Скрытие меню" id="hideMe" class="sky-btn" style="background: #ff4757;">❌</button>
        <button title="База знаний" id="knoweledgebaseKC" class="sky-btn">📚</button>
        <button title="Запись урока" id="lessonrecordKC" class="sky-btn">👩‍🏫</button>
        <button title="Skyeng Home" id="skyhomeKC" class="sky-btn">💼</button>
    </div>
    <div class="sky-grid" style="grid-template-columns: repeat(2, 1fr); gap: 5px;">
        <button class="sky-btn" id="timetableKC">📅 TimeTable</button>
        <button class="sky-btn" id="CalcKC">🧮 Калькулятор</button>
        <button class="sky-btn" id="nachislyatorKC">💸 Начислятор</button>
        <button class="sky-btn" id="rassrochKC">💳 Рассрочка</button>
        <button class="sky-btn" id="pondpisKC">💰 Подписки</button>
        <button class="sky-btn" id="omniKC">📩 Omni</button>
        <button class="sky-btn" id="RKKC">👥 РК</button>
        <button class="sky-btn" id="shablKC">📝 Шаблоны</button>
        <button class="sky-btn" id="narushKC">⚠️ Нарушение БП</button>
        <button class="sky-btn" id="grafKC">📅 График</button>
    </div>
</div>`;

// ==========================================
// 2. ИНИЦИАЛИЗАЦИЯ И СОБЫТИЯ
// ==========================================

function initEventHandlers(section) {
    if (section === 'KC') {
        const linksKC = {
            'knoweledgebaseKC': "https://confluence.skyeng.tech/display/CSW/Customer+Service+WIKI",
            'lessonrecordKC': "https://tramway.skyeng.ru/record",
            'skyhomeKC': "https://home.skyeng.ru/dashboard",
            'timetableKC': "https://timetable.skyeng.ru/",
            'CalcKC': "https://billing-api.skyeng.ru/operations",
            'nachislyatorKC': "https://billing-marketing.skyeng.ru/accrual-operations/create",
            'rassrochKC': "https://accounting.skyeng.ru/credit/list",
            'pondpisKC': "https://billing-api.skyeng.ru/subscriptions",
            'omniKC': "https://skyeng.omnidesk.ru/",
            'RKKC': "https://group.skyeng.ru/admin/?crudAction=index&crudControllerFqcn=App%5CController%5CAdmin%5CClubMemberCrudController&signature=V8w5PW8LT3GcoYMoSYzprG1lCW8F5sb5y7Bdrxh08pc",
            'shablKC': "https://docs.google.com/spreadsheets/d/14paTabjaJcRIvlpTQzdGePltiN0bsPaFjFEbn4DD3Ho/edit#gid=410124091",
            'narushKC': "https://docs.google.com/forms/d/e/1FAIpQLSeAxtdad9yc5iLo-7v4rqMj5M2wdaJKOpzy5X_eWkHqHWY9sg/viewform",
            'grafKC': "https://docs.google.com/spreadsheets/d/1SiD1yfpzIEF8ZafVXnq0Z-hyF0b45aAQ8s6BWgy-s0c/edit#gid=1933422994"
        };
        bindSimpleLinks(linksKC);
        return;
    }

    if (section === 'TP') {
        const linksTP = {
            'knoweledgebase': "https://confluence.skyeng.tech/pages/viewpage.action?pageId=25407293",
            'essayadmin': "https://api-english.skyeng.ru/admin/platform/openanswer/list",
            'timetable': "https://timetable.skyeng.ru/",
            'talksadm': "https://vimbox.skyeng.ru/talks/admin/statistics",
            'billingadm': "https://billing-api.skyeng.ru/operations",
            'CMS': "https://cms-vimbox.skyeng.ru/vim",
            'confbugs': "https://confluence.skyeng.tech/pages/viewpage.action?pageId=96042583",
            'compens': "https://billing-marketing.skyeng.ru/accrual-operations/create",
            'useradm': "https://id.skyeng.ru/admin/users",
            'compensNotFairPayments': "https://forms.yandex.ru/cloud/6876066349363940156734b8/?page=1",
            'transactions': "https://accounting.skyeng.ru/userpayment/search/transaction",
            'subscribebilling': "https://billing-api.skyeng.ru/subscriptions",
            'apelation': "https://docs.google.com/forms/d/e/1FAIpQLSdgsb6pte1H1dz15Eb5NjDe0gj3kEnh0hTe6Cgy8d81mT7NUA/viewform",
            'browserstack': "https://www.browserstack.com/users/sign_in",
            'trshoothing': "https://video-trouble-shooter.skyeng.ru/",
            'Synchronizer': "https://learning.skyeng.ru/upsert-history",
            'testroom': "https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638",
            'certificates': "https://billing-marketing.skyeng.ru/certificate/certSearch",
            'promocodes': "https://billing-marketing.skyeng.ru/promocode/list",
            'helpocentrteach': "https://helpcenter.skyeng.ru/teachers",
            'helpocentrstud': "https://helpcenter.skyeng.ru/students",
            'kidscms': "https://vimbox.skyeng.ru/kids/math/cms/lessons/1",
            'userfeatures': "https://vimbox.skyeng.ru/circles/editor",
            'AddRemoveChat': "https://communications.skyeng.ru/gateway/support/chat-management",
            'CheckPrices': "https://billing-marketing.skyeng.ru/priceSet/list",
            'CheckVidConnection': "https://video-check.skyeng.ru/",
            'openFinansoBin': "https://finanso.ru/bin-search/",
            'minecraftAccs': "https://disk.yandex.ru/edit/d/ARTwOEreBvxL1L4cDRCvEyPegnqahzm72s0qoIz-cKg6al9hdmhpLVFTZw",
            'deleteaclnk': "https://infra.skyeng.ru/request/create/166",
            'resetMMPassword': "https://infra.skyeng.ru/request/create/233",
            'faqext': "https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971"
        };

        // 1. Логика для Skip Onboarding
        const btnSkipOnbo = document.getElementById('doskiponboard');
        const inputSkipOnbo = document.getElementById('skiponboarding');
        if (btnSkipOnbo && inputSkipOnbo) {
            btnSkipOnbo.onclick = () => {
                const val = inputSkipOnbo.value.trim();
                if (val && typeof copyToClipboard === 'function') {
                    copyToClipboard(`https://learning.skyeng.ru/api/v1/education-service/${val}/skip-onboarding`); // Проверь эндпоинт, если он изменился
                    if (typeof createAndShowButton === 'function') createAndShowButton('💾 Ссылка Skip Onbo скопирована', 'message');
                    inputSkipOnbo.value = '';
                }
            };
        }

        // 2. Логика для Skip AP
        const btnSkipAP = document.getElementById('getskipAP');
        const inputSkipAP = document.getElementById('skipAP');
        if (btnSkipAP && inputSkipAP) {
            btnSkipAP.onclick = () => {
                const val = inputSkipAP.value.trim();
                if (val && typeof copyToClipboard === 'function') {
                    copyToClipboard(`https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${val}&skipAutoSelection=1`);
                    if (typeof createAndShowButton === 'function') createAndShowButton('💾 Ссылка Skip AP скопирована', 'message');
                    inputSkipAP.value = '';
                }
            };
        }


        bindSimpleLinks(linksTP);

        const inputActions = [
            { btn: 'benchmark', input: 'cpuname', url: 'https://www.cpubenchmark.net/cpu_lookup.php?cpu=', error: 'Введите CPU' },
            { btn: 'getschemes', input: 'schemesteacher', url: 'https://teacher-incentive.skyeng.ru/incentive/teacher/', error: 'Введите ID П' },
            { btn: 'gotolookip', input: 'iplookup', url: 'https://check-host.net/ip-info?host=', error: 'Введите IP' },
            { btn: 'cmsid', input: 'cmsstepid', url: 'https://content.vimbox.skyeng.ru/cms/step-store/update/id/', error: 'Введите STEPUUID' },
            { btn: 'credits', input: 'creditstatus', url: 'https://billing-api.skyeng.ru/installments?perPage=10&ownerId=', error: 'Введите ID У' },
            { btn: 'getlgsinfo', input: 'lgssearch', url: 'https://learning-groups-storage.skyeng.ru/group/', error: 'Введите ID группы' },
            { btn: 'getpushes', input: 'pushes', url: 'https://push-notifications.skyeng.ru/cms/logs?page=1&paginateBy=100&userId=', error: 'Введите ID У' },
            { btn: 'gettrshinfo', input: 'trshooterhash', url: 'https://video-trouble-shooter.skyeng.ru/?hash=', error: 'Введите hash' }
        ];

        inputActions.forEach(({ btn, input, url, error }) => {
            const buttonEl = document.getElementById(btn);
            const inputEl = document.getElementById(input); // Кэшируем инпут

            if (buttonEl && inputEl) {
                const action = () => {
                    const val = inputEl.value.trim();
                    if (!val) {
                        if (typeof createAndShowButton === 'function') createAndShowButton(error, 'error');
                    } else {
                        // Используем шаблонные строки для удобства чтения
                        const finalUrl = btn === 'getlgsinfo' ? `${url}${val}?cp=(section:participants)` : `${url}${val}`;
                        window.open(finalUrl, '_blank');
                        inputEl.value = '';
                    }
                };

                buttonEl.addEventListener('click', action);

                // УЛУЧШЕНИЕ: Обработка нажатия Enter в инпуте
                inputEl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') action();
                });
            }
        });

        // Специальная логика для АП
        const btnEnablerAP = document.getElementById('getenablerAP');
        const inputEnablerAP = document.getElementById('enablerAP');

        if (btnEnablerAP && inputEnablerAP) {
            btnEnablerAP.addEventListener('click', () => {
                const val = inputEnablerAP.value.trim();
                if (!val) {
                    if (typeof createAndShowButton === 'function') createAndShowButton('Введите ID услуги', 'error');
                } else {
                    if (typeof copyToClipboard === 'function') copyToClipboard(`https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=${val}`);
                    if (typeof createAndShowButton === 'function') createAndShowButton('💾 Ссылка АП скопирована', 'message');
                    inputEnablerAP.value = '';
                }
            });
        }

        // Остальные обработчики (с проверками на существование элементов)
        const btnRestart = document.getElementById('restartlesson');
        if (btnRestart) {
            btnRestart.addEventListener('click', () => {
                if (typeof copyToClipboard === 'function') copyToClipboard("setStatus('classwork')");
                if (typeof createAndShowButton === 'function') createAndShowButton('💾 Команда скопирована', 'message');
            });
        }

        const btnIpCheck = document.getElementById('openIPCheck');
        if (btnIpCheck) {
            btnIpCheck.addEventListener('click', () => {
                const panel = document.getElementById('AF_IpCheck');
                if (panel) panel.style.display = panel.style.display === '' ? 'none' : '';
            });
        }

        // Привязка внешних функций только если они существуют
        const bindExternalFunc = (id, func) => {
            const el = document.getElementById(id);
            if (el && typeof func === 'function') el.onclick = func;
        };

        bindExternalFunc('GrListData', typeof getGrListDataButtonPress !== 'undefined' ? getGrListDataButtonPress : null);
        bindExternalFunc('getStats', typeof getStatsButtonPress !== 'undefined' ? getStatsButtonPress : null);
        bindExternalFunc('openGrabber', typeof getopenGrabberButtonPress !== 'undefined' ? getopenGrabberButtonPress : null);

        // Обработчики для кнопок версий
        const btnIos = document.getElementById('curVeriOS');
        if (btnIos) {
            btnIos.onclick = () => window.open("https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732", "_blank");
        }

        const btnAnd = document.getElementById('curVerAndroid');
        if (btnAnd) {
            btnAnd.onclick = () => window.open("https://play.google.com/store/apps/details?id=skyeng.words.prod", "_blank");
        }

        if (typeof setupSynchronizer === 'function') setupSynchronizer();
    }
}

// ==========================================
// 3. ОСНОВНАЯ ФУНКЦИЯ ЗАПУСКА
// ==========================================

async function checkOpsectionIs() {
    try {
        // Обернул в try-catch, так как getStorageData асинхронна и может отвалиться
        const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']);

        // Защита от undefined данных
        if (!data) throw new Error("Не удалось получить данные из хранилища");

        const isKC = [data.KC_addr, data.KC_addrRzrv].includes(typeof scriptAdr !== 'undefined' ? scriptAdr : '');
        const section = isKC ? 'KC' : 'TP';
        const htmlTemplate = isKC ? win_LinksKC : win_Links;

        if (typeof createWindow === 'function') {
            createWindow('AF_Links', 'winTopLinks', 'winLeftLinks', htmlTemplate);
        } else {
            console.warn("Функция createWindow не определена");
            return; // Дальше продолжать нет смысла, если окно не создано
        }

        const panel = document.getElementById('AF_Links');
        if (!panel) return;

        panel.style.display = 'none';

        if (typeof hideWindowOnDoubleClick === 'function') hideWindowOnDoubleClick('AF_Links');
        if (typeof hideWindowOnClick === 'function') hideWindowOnClick('AF_Links', 'hideMe');

        initEventHandlers(section);

        const btnL = document.getElementById('links');
        if (btnL) {
            btnL.onclick = function () {
                if (panel.style.display === 'none') {
                    panel.style.display = '';
                    if (section === 'TP') getVersionsApp();
                } else {
                    panel.style.display = 'none';
                }
            };
        }
    } catch (error) {
        console.error("Ошибка при инициализации панели ссылок:", error);
    }
}

checkOpsectionIs();

async function getVersionsApp() {
    const iosEl = document.getElementById('curVeriOS');
    const andEl = document.getElementById('curVerAndroid');

    try {
        const url = 'https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec';
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();
        const result = data.result;

        if (iosEl) {
            // Оставляем только номер версии и сборку
            const iosVer = result[1][0];
            const iosBuild = result[1][1];
            iosEl.textContent = `${iosVer} (${iosBuild})`;
        }
        if (andEl) {
            const andVer = result[0][0];
            const andBuild = result[0][1];
            andEl.textContent = `${andVer} (${andBuild})`;
        }
    } catch (e) {
        console.error("Ошибка загрузки версий:", e);
        // УЛУЧШЕНИЕ: Показываем юзеру, что данные не загрузились, чтобы он не ждал бесконечные часики
        if (iosEl) iosEl.textContent = `iOS: ❌`;
        if (andEl) andEl.textContent = `And: ❌`;
    }
}

function bindSimpleLinks(linksMap) {
    Object.entries(linksMap).forEach(([id, url]) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('click', () => window.open(url, '_blank'));
        }
    });
}