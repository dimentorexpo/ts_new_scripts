// --- КОНФИГУРАЦИЯ И КОНСТАНТЫ ---
// Выносим "магические строки" в константы для легкого изменения и избежания опечаток.

let usrServLanguage
let usrAge
let usrName
let usrCountry
let usrType
let stid;
let servicecontainer = null;

const IDENTITY_EMAIL_DISABLED_ATTR = '"identityEmail" disabled data-value=""';
const IDENTITY_PHONE_DISABLED_ATTR = '"identityPhone" disabled data-value=""';

const STATUS_ICONS = {
    VALID: '✅',
    INVALID: '❌',
    EMAIL: '📧',
    PHONE: '☎️',
};

const API_BASE_URL = 'https://backend.skyeng.ru/api/persons';
const PHONE_ELEMENT_ID = 'phoneunhidden';
const EMAIL_ELEMENT_ID = 'mailunhidden';

const LINK_CONFIG = {
    checkBalance: {
        url: (userId) => `https://billing-api.skyeng.ru/operations/user/${userId}/info`
    },
    GotoCRM: {
        url: (userId) => `https://crm2.skyeng.ru/persons/${userId}`
    },
    partialPaymentinfo: {
        url: (userId) => `https://billing-api.skyeng.ru/installments?ownerId=${userId}&state=&perPage=50&currentPage=1`
    },
    subscriptioninfo: {
        // Обратите внимание: здесь тоже используется userId, а не value напрямую
        url: (userId) => `https://billing-api.skyeng.ru/subscriptions/user/${userId}/info`
    },
    editadmbtn: {
        url: (userId) => `https://id.skyeng.ru/admin/users/${userId}/update-contacts`
    }
};

const PAST_LESSONS_CONFIG = {
    // ID элементов
    buttonId: 'getlessonpast',
    outputElementId: 'timetabledata',
    studentIdFieldId: 'idstudent', // Предполагаем, что это глобальная переменная или поле

    // API и параметры
    apiUrl: (userId) => `https://backend.skyeng.ru/api/students/${userId}/timetable/lessons-history/?page=0`,

    // Словари для перевода статусов и типов уроков. Чисто и расширяемо.
    STATUS_MAP: {
        "missed_by_student": "Пропущен учеником",
        "canceled_by_student": "Отменен учеником",
        "success": "Прошел",
        "moved_by_student": "Перенесен учеником",
        "canceled_by_teacher": "Отменен учителем",
        "student_refused_to_study": "Отказался от обучения",
        "interrupted": "Прерван",
        "did_not_get_through_student": "Не смогли связаться с У",
        "canceled_not_marked": "Не отмечен учителем вовремя",
    },
    LESSON_TYPE_MAP: {
        "regular": "Регулярный",
        "single": "Одиночный",
        "trial": "Пробный",
    },
    // Стили для разных статусов
    STATUS_STYLES: {
        "Прошел": { color: '#00FF7F', fontWeight: 'bold' },
        "default": { color: 'coral', fontWeight: '700' },
    }
};

const LESSONS_CONFIG = {
    // ID элементов
    buttonId: 'getlessonfuture', // Можно легко поменять на 'getlessonpast'
    outputElementId: 'timetabledata',
    studentIdFieldId: 'idstudent',

    // API
    apiUrls: {
        future: (userId) => `https://backend.skyeng.ru/api/students/${userId}/timetable/future-lessons/`,
        past: (userId) => `https://backend.skyeng.ru/api/students/${userId}/timetable/lessons-history/?page=0`,
    },

    // Словари для перевода
    LESSON_TYPE_MAP: {
        "regular": "Регулярный",
        "single": "Одиночный",
        "trial": "Пробный",
    },

    // Стили
    STATUS_STYLES: {
        "Прошел": { color: '#00FF7F', fontWeight: 'bold' },
        "default": { color: 'coral', fontWeight: '700' },
    },

    // ВАЖНО: Зависимость servicecontainer должна быть передана явно, а не браться из глобальной области.
    // Здесь мы предполагаем, что она будет передана или загружена.
    // Для примера, оставим как есть, но с комментарием.
    serviceContainer: window.servicecontainer || null, // Пытаемся взять из глобальной области
};

var win_serviceinfo =  // описание элементов окна информации об услугах и пользователе
    `<div style="display: flex; width: 320px;">
        <span style="width: 320px">
                <span style="cursor: -webkit-grab;">
                        <div style="width: 320px; padding: 5px; border-bottom:1px solid #556B2F;" id="servicehead">
                                <button title="скрывает меню" id="hideMeservice" class="mainButton buttonHide">hide</button>
                                <button class="mainButton" title="открывает СРМ пользователя при введенном айди в поле" id="GotoCRM" style="width:50px;">CRM</button>
								<button class="mainButton smallbtn" title="Делаем видимым номер телефона и почты" id='dounhidemailandphone'>👁‍🗨</button>
                                <button class="mainButton" title="Левый клик обновить статус. Легенда: 💥 - задача на исход уже создана или есть также задача на тп1л , 📵 - нет задачи на исход и на тп, 🛠 - нет задачи на исход, но есть задача на тп" id="CrmStatus" style="width:30px; display:none;"></button>
								<span style="padding:7px; margin-left: 5px;height:28px; color:#ffff;  font-weight:700; border: 1px solid bisque;width: 82px; background-color:#1E90FF;display:none;" id="getcurrentstatus"></span>
                        </div>
						<div style="width: 320px; margin:5px; display:flex; justify-content:left;" id="input_field">
							<input class="" id="idstudent" placeholder="ID У/П" title="Введите ID ученика для получения информации по услугам" autocomplete="off" type="text" style="text-align: center; width: 100px; border-radius:20px;">
							<button title="запускает поиск по услугам" id="getidstudent" class="mainButton usinfoops">🚀</button>
							<button title="Открывает список со всеми задачами пользователя" id="crmactivetasks" class="mainButton usinfoops">📋</button>
							<button class="mainButton" title="TRM 2.0 для информации по П" id="newTrm" style="margin-left: 5px; display: none; width: 25.23px;">🗿</button>
							<button class="mainButton" title="Личная страница П, как видят ученики" id="personalteacherpage" style="margin-left: 5px; display: none; width: 25.23px;">🎭</button>
							<button title="Изменяет Язык обслуживания для профиля на Русский" id="changeLocaleLng" class="mainButton usinfoops">🌍</button>
							<button title="Открывает начислятор для проверки реального баланса ученика" id="checkBalance" class="mainButton usinfoops">💰</button>
							<button title="Просмотр прошедших и предстоящих уроков" id="getPastAndFutureLessons" class="mainButton usinfoops">📆</button>
							<button title="очищает все поля" id="clearservinfo" class="mainButton usinfoops">🧹</button>
				       	</div>
						<div style="width: 320px; margin:5px; display:flex; justify-content:left;" id="input_field2">
							<input class="" readonly id="onetimepassout"  placeholder="One time pass" title="Вывод разового пароля после выполнения команды" autocomplete="off" type="text" style="float:left; text-align: center; width: 100px; border-radius:20px;">
							<button title="Генерирует одноразовый код для входа в мобильное приложение и выводит его в спец поле" id="getonetimepass" class="mainButton usinfoops">📱</button>
							<button title="Открывает админку редактирования пользователя/просмотра ролей" id="editadmbtn" class="mainButton usinfoops">✏</button>
							<button title="Открывает историю чатов" id="catchathistory" class="mainButton usinfoops">🗄</button>
							<button title="Открывает окно для просмотра когда и кто открывал/закрывал набор учеников для П" id="butTeacherNabor" class="mainButton" style="margin-left: 5px; display: none; width: 25.23px;"> 🚷</button>
							<button title="Открывает меню для просмотра рассрочки" id="partialPaymentinfo" class="mainButton usinfoops">💸</button>
							<button title="Открывает меню для просмотра статуса подписки" id="subscriptioninfo" class="mainButton usinfoops">💵</button>
                            <button title="Отправить текст от имени пользователя через Vimbot" id="openVimbotWindowsUserinfo" class="mainButton usinfoops">▶️</button>
						</div>
					   </span>
                        <div style="width: 320px; color:bisque; text-align:center">
						<img id="useravatar" style="position: absolute; left: 1px; top: 120px; width: 55px; height: 60px; border-radius: 30px; border: 3px solid seagreen; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); display:none; z-index:99999999">
                                <div id="basicInfo" style="max-height:400px; overflow:auto; color:bisque; text-align:center">
									<div style="text-align: center;" id="usrType">
									</div>
									<div style="text-align: center;align-items: center;display: flex;flex-direction: row;flex-wrap: nowrap;justify-content: flex-end;/* align-content: stretch; */">
										<span id="usrAge"></span>
										<span id="getloginer" title="При клике делает ссылку-логгинер и копирует в буфер обмена для авторизации" class="cursor-userinfobtns"> 🔑 </span>
                                        <span> Имя: </span>
										<span id="usrName" style="max-width: 160px;margin-right: 30px;"></span>
									</div>
									<div style="text-align: center;">
										<span class="cursor-userinfobtns copyBtnUsrEmailInfo" title="При клике копирует в буфер обмена почту пользователя" id="getusremail"></span>
										<span id="mailunhidden">hidden</span>
									</div>
									<div style="text-align: center;">
										<span class="cursor-userinfobtns copyBtnUsrPhoneInfo" title="При клике копирует в буфер обмена телефон пользователя" id="getusrphone">Phone: </span>
										<span id="phoneunhidden">hidden</span>
										<span>• 🌍: </span>
										<span id="usrCountry"></span>
									</div>
									<div style="text-align: center;">
										<span name="studentosFields">Identity: </span>
										<span name="studentosFields" id="pochtaIdentity"></span>
										<span name="studentosFields" id="telefonIdentity"></span>
										<span name="studentosFields">• Язык осблуж.: </span>
										<span name="studentosFields" id="usrServLang"></span>
									</div>
									<div style="text-align: center;">
										<span name="studentosFields">UTC:</span>
										<span name="studentosFields" id="utcOffset"></span>
										<span name="studentosFields">MSK(+/-):</span>
										<span name="studentosFields" id="UTCtoMSK"></span>
										<span name="studentosFields"> ⏰Время(местное): </span>
										<span name="studentosFields" id="localTime"></span>
									</div>
								 </div>
                        </div>
						<div style="width: 320px;" id="serviceList">
								<p id="servicetable" style="max-height:400px; overflow:auto; color:bisque; text-align:center"></p>
						</div>
                        <div style="width: 320px;" id="complektList">
								<p id="complekttable" style="max-height:400px; overflow:auto; color:bisque; text-align:center"></p>
						</div>
        </span>
</div>`;

var win_Timetable = // описание элементов окна предстоящих и прошедших занятиях
    `<div style="display: flex; width: 450px;">
<span style="width: 450px">
        <span style="cursor: -webkit-grab;">
                <div style="margin: 5px; width: 450;" id="HeadTimetable">
                        <button class="mainButton buttonHide" id="hideMeTT" style="width:50px; background: #228B22;">hide</button>
                </div>
                <div style="display:flex; justify-content:space-evenly; margin-top:5px;">
                     <button class="mainButton" title="Выводит инфо о прошедших уроках" id="getlessonpast">Прошедшие уроки</button>
                     <button class="mainButton" title="Выводит инфо о предстоящих уроках" id="getlessonfuture">Предстоящие уроки</button>
                 </div>
                 </span>
                <div id="timetableinfo">
                     <p id="timetabledata" style="width:450px;color:bisque; max-height:400px; margin-left:5px; margin-top:5px; overflow:auto;text-align:center;"></p>
                </div>
</span>
</div>`;

var win_Complectations = //описание элементов окна с комплектациями
    `<div style="display: flex; width: 500px;">
<span style="width: 500px">
        <span style="cursor: -webkit-grab;">
                <div style="margin: 5px; width: 500;" id="headComplectations">
                        <button class="mainButton buttonHide" id="hideComplecations" style="width:50px; background: #228B22;">hide</button>
                </div>
        </span>
                <div id="cmplInfo">
                     <p id="cmplData" style="width:500px;color:bisque; max-height:400px; margin-left:5px; margin-top:5px; overflow:auto;text-align:center;"></p>
                </div>
</span>
</div>`;

const wintServices = createWindow('AF_Service', 'winTopService', 'winLeftService', win_serviceinfo);
const wintTimetable = createWindow('AF_Timetable', 'winTopTimetable', 'winLeftTimetable', win_Timetable);
const wintComplectations = createWindow('AF_Complectations', 'winTopComplectations', 'winLeftComplectations', win_Complectations);

document.getElementById('servicehead').ondblclick = function (a) { // скрытие окна вензель user info по двойному клику
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
        document.getElementById('AF_Service').style.display = 'none';
        document.getElementById('butServ').classList.remove('activeScriptBtn');
    }
}

document.getElementById('hideMeservice').onclick = function () { // скрытие окна вензель user info
    if (document.getElementById('AF_Service').style.display == '')
        document.getElementById('AF_Service').style.display = 'none'
    document.getElementById('butServ').classList.remove('activeScriptBtn')
}

////////////////////////
// Находим кнопку один раз, а не при каждом клике
const unhideButton = document.getElementById('dounhidemailandphone');

// Проверяем, что кнопка существует, чтобы избежать ошибок
if (unhideButton) {
    // Делаем обработчик асинхронным
    unhideButton.onclick = async function () {
        // --- Подготовка UI: блокируем кнопку и показываем состояние загрузки ---
        this.disabled = true;
        const originalText = this.textContent;
        this.textContent = '⏳';

        try {
            // --- Параллельное выполнение независимых запросов ---
            // Promise.all запускает оба запроса одновременно и ждет завершения обоих.
            // Это быстрее, чем ждать их по очереди (await getUnhideEmail(); await getUnhidePhone();).
            await Promise.all([
                getUnhideEmail(),
                getUnhidePhone()
            ]);

            // --- Последовательное выполнение зависимого запроса ---
            // Этот запрос выполняется только после того, как email и телефон получены.
            await checkEmailAndPhoneIdentity();

            // Опционально: можно показать сообщение об успехе
            // alert('Данные успешно обновлены!');

        } catch (error) {
            // --- Централизованная обработка ошибок ---
            // Этот блок перехватит любую ошибку из любой из трех функций.
            console.error('Произошла ошибка при обновлении данных:', error);
            alert(`Не удалось обновить данные: ${error.message}`);
            // Опционально: можно очистить поля в случае ошибки
            document.getElementById('mailunhidden').textContent = '';
            document.getElementById('phoneunhidden').textContent = '';
            document.getElementById('pochtaStatus').textContent = '';
            document.getElementById('telefonStatus').textContent = '';

        } finally {
            // --- Финальная очистка: выполняется всегда (и при успехе, и при ошибке) ---
            // Возвращаем кнопку в исходное состояние.
            this.disabled = false;
            this.textContent = originalText;
        }
    };
} else {
    console.error("Кнопка с ID 'dounhidemailandphone' не найдена на странице.");
}

/**
 * Безопасно получает ID студента из поля ввода.
 * @returns {string|null} - Очищенный ID или null, если он пустой.
 */
function getStudentId() { //Функция получения ID ученика
    // Предполагаем, что idstudentField определена глобально или передана как аргумент
    const idField = document.getElementById('idstudent');
    if (!idField) {
        console.error("Поле 'idstudent' не найдено!");
        return null;
    }

    const userId = idField.value.trim();
    if (!userId) {
        alert('Пожалуйста, введите ID студента.');
        return null;
    }
    return userId;
}

/**
 * Универсальная функция для открытия ссылки.
 * @param {string} userId - ID пользователя.
 * @param {string} url - Полный URL для открытия.
 */
function openLinkInNewTab(userId, url) { // Функция открытия ссылки в новой вкладке
    if (!userId) return; // Не открываем, если ID невалидный

    console.log(`Открываем ссылку для пользователя ${userId}: ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Находим поле ввода один раз
const idstudentField = document.getElementById('idstudent');

if (idstudentField) {
    // Проходим по всем ключам в нашей конфигурации
    for (const buttonId in LINK_CONFIG) {
        const button = document.getElementById(buttonId);

        if (button) {
            // Используем современный addEventListener
            button.addEventListener('click', () => {
                // 1. Получаем и валидируем ID
                const userId = getStudentId();

                // 2. Если ID валидный, генерируем URL и открываем
                if (userId) {
                    const urlGenerator = LINK_CONFIG[buttonId].url;
                    const url = urlGenerator(userId);
                    openLinkInNewTab(userId, url);
                }
            });
        } else {
            console.warn(`Кнопка с ID '${buttonId}' не найдена на странице.`);
        }
    }
    console.log("Обработчики для ссылок успешно установлены.");
} else {
    console.error("Критическая ошибка: поле 'idstudent' не найдено. Скрипт не может работать.");
}

async function generateOneTimePassword() { // Функция генерации одноразового пароля для МП
    // --- Конфигурация для этой конкретной функции ---
    const CONFIGUSER = {
        buttonId: 'getonetimepass',
        outputFieldId: 'onetimepassout',
        apiUrl: 'https://id.skyeng.ru/admin/auth/one-time-password',
        otpRegex: /Одноразовый пароль: (\d+)\./,
        uiFeedbackDelay: 2000,
        outputClearDelay: 15000,
    };

    // --- Получаем элементы UI ---
    const button = document.getElementById(CONFIGUSER.buttonId);
    const outputField = document.getElementById(CONFIGUSER.outputFieldId);
    if (!button || !outputField) {
        console.error('Не найдены необходимые элементы UI (кнопка или поле вывода).');
        return;
    }

    // --- ИСПОЛЬЗУЕМ УНИВЕРСАЛЬНУЮ ФУНКЦИЮ ---
    // Вот ключевой момент: мы просто вызываем getStudentId()
    const userId = getStudentId();
    if (!userId) return; // Если ID невалидный, прерываем выполнение

    // --- Дальнейшая логика специфична для этой функции ---
    button.disabled = true;
    button.innerHTML = '✅';

    try {
        const requestOptions = {
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: `user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D=${userId}&user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null`,
            method: 'POST',
            mode: 'cors',
            credentials: 'include'
        };

        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: 'getFetchRequest', fetchURL: CONFIGUSER.apiUrl, requestOptions },
                (res) => (res.success ? resolve(res) : reject(new Error(res.error || 'Ошибка расширения')))
            );
        });

        const otpMatch = response.fetchansver.match(CONFIGUSER.otpRegex);
        const otp = otpMatch ? otpMatch[1] : null;

        if (otp) {
            outputField.value = otp;
        } else {
            outputField.value = 'Не удалось извлечь пароль';
            console.error('Не удалось найти пароль в ответе:', response.fetchansver);
        }

    } catch (error) {
        console.error('Ошибка при генерации пароля:', error);
        alert(`Произошла ошибка: ${error.message}`);
        outputField.value = '';
    } finally {
        button.disabled = false;
        button.innerHTML = '📱';
        setTimeout(() => { outputField.value = ''; }, CONFIGUSER.outputClearDelay);
    }
}

document.getElementById('getonetimepass')?.addEventListener('click', generateOneTimePassword)

document.getElementById('AF_Timetable').ondblclick = function (a) { // скрытие окна предстоящих и прошедших занятиях по двойному клику
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
        document.getElementById('AF_Timetable').style.display = 'none';
        document.getElementById('timetabledata').innerHTML = "";
    }
}

document.getElementById('hideMeTT').onclick = function () { // скрытие окна предстоящих и прошедших занятиях
    if (document.getElementById('AF_Timetable').style.display == '')
        document.getElementById('AF_Timetable').style.display = 'none'

    document.getElementById('timetabledata').innerHTML = "";
}

document.getElementById('hideComplecations').onclick = function () { // скрытие окна предстоящих и прошедших занятиях
    if (document.getElementById('AF_Complectations').style.display == '') {
        document.getElementById('AF_Complectations').style.display = 'none';
        if (document.getElementById('AF_SpecCommWindow').style.display == '') {
            document.getElementById('hideMeSpecComm').click();
        }
    }
}

let responseinfo;

async function checkEmailAndPhoneIdentity() { //Функция проверки привязки Email and Phone как Identity
    // Получаем ID пользователя и очищаем его от лишних пробелов.
    const userId = idstudentField.value.trim();
    if (!userId) {
        console.warn("ID пользователя не указан.");
        // Можно добавить очистку статусов, если поле пустое
        pochtaStatus.textContent = '';
        telefonStatus.textContent = '';
        return;
    }

    const fetchURL = `https://id.skyeng.ru/admin/users/${userId}/update-contacts`;
    const requestOptions = { method: 'GET' };

    try {
        // Используем await для ожидания ответа от расширения, что делает код линейным и понятным.
        const response = await chrome.runtime.sendMessage({
            action: 'getFetchRequest',
            fetchURL: fetchURL,
            requestOptions: requestOptions
        });

        if (!response.success) {
            // Более информативное сообщение об ошибке.
            throw new Error(`Ошибка при выполнении запроса: ${response.error}`);
        }

        const responseHTML = response.fetchansver;

        // Проверяем, является ли пользователь студентом, так как логика применяется только к ним.
        if (flagusertype !== "student") {
            console.log(`Проверка пропущена: пользователь является '${flagusertype}', а не 'student'.`);
            // Очищаем статусы для других типов пользователей.
            pochtaStatus.textContent = '';
            telefonStatus.textContent = '';
            return;
        }

        // Вызываем вспомогательную функцию для определения статусов.
        const identityStatus = getIdentityStatus(responseHTML);

        // Обновляем UI на основе полученных статусов.
        updateStatusUI(identityStatus);

    } catch (error) {
        // Централизованная обработка всех возможных ошибок (сетевые, ошибки в логике и т.д.).
        console.error("Не удалось проверить статус identity:", error);
        alert(`Произошла ошибка: ${error.message}`);
        // Очищаем статусы в случае ошибки.
        pochtaStatus.textContent = '';
        telefonStatus.textContent = '';
    }
}

/**
 * Анализирует HTML-ответ и определяет статус email и телефона.
 * @param {string} htmlString - HTML-строка, полученная с сервера.
 * @returns {{hasEmail: boolean, hasPhone: boolean}} - Объект со статусами.
 */
function getIdentityStatus(htmlString) { // Функция получения статуса Identity
    // Логика инвертирована: мы проверяем наличие атрибута 'disabled', что означает ОТСУТСТВИЕ identity.
    const hasEmail = !htmlString.includes(IDENTITY_EMAIL_DISABLED_ATTR);
    const hasPhone = !htmlString.includes(IDENTITY_PHONE_DISABLED_ATTR);

    return { hasEmail, hasPhone };
}

/**
 * Обновляет элементы интерфейса (pochtaStatus, telefonStatus) на основе статусов.
 * @param {{hasEmail: boolean, hasPhone: boolean}} status - Объект со статусами.
 */
function updateStatusUI(status) { // Функция вывода статуса вида подключения телефона или почты как Identity
    // Используем тернарные операторы для краткости и ясности.
    pochtaStatus.textContent = `${STATUS_ICONS.EMAIL}${status.hasEmail ? STATUS_ICONS.VALID : STATUS_ICONS.INVALID}`;
    telefonStatus.textContent = `${STATUS_ICONS.PHONE}${status.hasPhone ? STATUS_ICONS.VALID : STATUS_ICONS.INVALID}`;
}

/**
 * Универсальная функция для получения и отображения персональных данных (email/phone).
 * @param {string} pdType - Тип запрашиваемых данных ('email' или 'phone').
 * @param {string} targetElementId - ID DOM-элемента для вывода результата.
 * @private
 */
async function _fetchAndDisplayPersonalData(pdType, targetElementId) { //Функция проверки информации и отображению ее
    const userId = idstudentField.value.trim();
    const targetElement = document.getElementById(targetElementId);

    // --- ПРЕДВАРИТЕЛЬНЫЕ ПРОВЕРКИ ---
    if (!userId) {
        console.warn("ID пользователя не указан.");
        if (targetElement) targetElement.textContent = '';
        return;
    }

    if (!targetElement) {
        console.error(`Элемент с ID '${targetElementId}' не найден.`);
        return;
    }

    const fetchURL = `${API_BASE_URL}/${userId}/personal-data/?pdType=${pdType}&source=persons.profile`;
    const requestOptions = { method: 'GET' };

    try {
        // Оборачиваем chrome.runtime.sendMessage в Promise для использования await
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: 'getFetchRequest', fetchURL, requestOptions },
                (res) => (res.success ? resolve(res) : reject(new Error(res.error || 'Ошибка расширения')))
            );
        });

        const data = JSON.parse(response.fetchansver);

        // Безопасное извлечение значения с помощью опциональной цепочки (?.)
        const value = data?.data?.value;

        if (value) {
            targetElement.textContent = value;
        } else {
            console.warn(`Значение для '${pdType}' не найдено в ответе.`, data);
            targetElement.textContent = 'Не заполнен';
        }

    } catch (error) {
        console.error(`Ошибка при получении ${pdType}:`, error);
        alert(`Произошла ошибка: ${error.message}`);
        targetElement.textContent = ''; // Очищаем при ошибке
    }
}

function getUnhideEmail() { // Функция обертка выполняет основную функцию по расшифровке почты пользователя
    // Просто вызываем универсальную функцию с нужными параметрами
    _fetchAndDisplayPersonalData('email', EMAIL_ELEMENT_ID);
}

function getUnhidePhone() { // Функция обертка выполняет основную функцию по расшифровке телефона пользователя
    _fetchAndDisplayPersonalData('phone', PHONE_ELEMENT_ID);
}


// Вспомогательная функция-обертка (можно вынести в отдельный utility-файл)
function sendMessageAsync(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            // Проверяем, что ответ от фонового скрипта пришел и не содержит ошибки chrome
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError.message));
            }
            if (response && response.success) {
                resolve(response);
            } else {
                // Ответ пришел, но содержит ошибку приложения
                reject(new Error(response?.error || 'Unknown error from extension'));
            }
        });
    });
}

// --- Основной код ---

// Константы лучше вынести и назвать более осмысленно
const CONFIG_API_URL = 'https://backend.skyeng.ru/api/products/configurations/';
const GET_REQUEST_OPTIONS = { method: 'GET' };

// Объявляем переменную в нужной области видимости, а не глобально
async function fetchServiceConfiguration() {
    try {
        const message = {
            action: 'getFetchRequest',
            fetchURL: CONFIG_API_URL,
            requestOptions: GET_REQUEST_OPTIONS
        };

        const response = await sendMessageAsync(message);

        // Безопасный парсинг JSON
        const configData = JSON.parse(response.fetchansver);

        servicecontainer = configData;
        console.log('Конфигурация успешно загружена:', servicecontainer);
        return servicecontainer; // Возвращаем данные для дальнейшего использования

    } catch (error) {
        // Централизованная и более информативная обработка ошибок
        console.error('Ошибка при получении конфигурации сервиса:', error.message);
        // Вместо alert() можно показать уведомление в UI или записать в лог
        // alert(`Ошибка: ${error.message}`); // Если очень нужно
        return null; // Возвращаем null в случае ошибки
    }
}

fetchServiceConfiguration()

let pochtaStatus = document.getElementById('pochtaIdentity')
let telefonStatus = document.getElementById('telefonIdentity')
let complectationsOutput = document.getElementById('complekttable')

/**
 * Форматирует дату в строку "ДД-ММ-ГГГГ ЧЧ:ММ" с учетом часового пояса.
 * @param {string} dateString - Дата в формате ISO (например, "2023-10-27T10:00:00Z").
 * @returns {string} - Отформатированная строка.
 */
function formatLessonDate(dateString) {
    const date = new Date(dateString);
    // Используем toLocaleString для простого получения компонентов с учетом локали
    // и padStart для добавления ведущих нулей.
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    // ВАЖНО: Часовой пояс. В оригинале было getUTCHours() + 3.
    // Это жестко заданный сдвиг. Лучше использовать toLocaleTimeString с опциями.
    const hours = String(date.getHours()).padStart(2, '0'); // Используем локальное время браузера как пример
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

/**
 * Создает HTML-строку для одного урока.
 * @param {object} lesson - Объект урока из API.
 * @returns {string} - Готовый HTML-фрагмент.
 */
function createLessonHTML(lesson) {
    const { startedAt, status, lessonType, educationService, teacher } = lesson;

    // Используем словари для перевода, с запасным вариантом (original value)
    const translatedStatus = PAST_LESSONS_CONFIG.STATUS_MAP[status] || status;
    const translatedLessonType = PAST_LESSONS_CONFIG.LESSON_TYPE_MAP[lessonType] || lessonType;

    // Определяем стиль для статуса
    const statusStyle = PAST_LESSONS_CONFIG.STATUS_STYLES[translatedStatus] || PAST_LESSONS_CONFIG.STATUS_STYLES.default;
    const statusColor = statusStyle.color;
    const statusFontWeight = statusStyle.fontWeight || 'normal';

    const formattedDate = formatLessonDate(startedAt);

    // Шаблон для вывода информации об учителе
    const teacherInfo = teacher
        ? `<span style="color:#32CD32; font-weight:900;">Преподаватель: </span> ${teacher.general.id} ${teacher.general.name} ${teacher.general.surname}<br>`
        : '';

    // Используем шаблонные строки для чистого и читаемого HTML
    return `
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ff0000;">
            <span style="color: #00FA9A">&#5129;</span>
            <span style="color:#FF7F50; font-weight:900;">Дата: </span>${formattedDate}<br>
            <span style="color:#c9dbd2; font-weight:900;">Статус: </span>
            <span style="color:${statusColor}; font-weight:${statusFontWeight};">${translatedStatus}</span><br>
            <span style="color:#c9dbd2; font-weight:900;">Урок: </span>${translatedLessonType}<br>
            <span style="color:#00BFFF; font-weight:900;">Услуга: </span>${educationService.id} ${educationService.serviceTypeKey || 'N/A'}<br>
            ${teacherInfo}
        </div>
    `;
}


// --- 3. ОСНОВНАЯ АСИНХРОННАЯ ФУНКЦИЯ ---

/**
 * Асинхронно запрашивает и отображает историю прошедших уроков.
 */
async function fetchAndDisplayPastLessons() {
    const button = document.getElementById(PAST_LESSONS_CONFIG.buttonId);
    const outputElement = document.getElementById(PAST_LESSONS_CONFIG.outputElementId);

    if (!button || !outputElement) {
        console.error("Кнопка или элемент вывода не найдены.");
        return;
    }

    // Получаем ID студента, используя уже существующую утилиту
    const userId = getStudentId(); // Предполагаем, что эта функция уже есть
    if (!userId) return;

    // Блокируем кнопку и показываем состояние загрузки
    button.disabled = true;
    button.innerHTML = 'Загрузка...';
    outputElement.innerHTML = ''; // Очищаем предыдущие результаты

    try {
        const fetchURL = PAST_LESSONS_CONFIG.apiUrl(userId);
        const requestOptions = { method: 'GET' };

        // Оборачиваем chrome.runtime.sendMessage в Promise для использования await
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: 'getFetchRequest', fetchURL, requestOptions },
                (res) => (res.success ? resolve(res) : reject(new Error(res.error || 'Ошибка расширения')))
            );
        });

        const lessonsHistory = JSON.parse(response.fetchansver);

        if (!lessonsHistory || !Array.isArray(lessonsHistory.data) || lessonsHistory.data.length === 0) {
            outputElement.innerHTML = 'Еще не было уроков';
            return;
        }

        // Обрабатываем каждый урок и создаем HTML-фрагменты
        const lessonHTMLFragments = lessonsHistory.data.map(lesson => createLessonHTML(lesson));

        // Объединяем все фрагменты в одну строку и вставляем в DOM
        outputElement.innerHTML = lessonHTMLFragments.join('');

    } catch (error) {
        console.error('Ошибка при получении истории уроков:', error);
        alert(`Произошла ошибка: ${error.message}`);
        outputElement.innerHTML = 'Не удалось загрузить историю уроков.';
    } finally {
        // Всегда возвращаем кнопку в исходное состояние
        button.disabled = false;
        button.innerHTML = 'Показать прошедшие'; // Верните оригинальный текст/иконку
    }
}

const pastLessonsButton = document.getElementById(PAST_LESSONS_CONFIG.buttonId);
if (pastLessonsButton) {
    pastLessonsButton.addEventListener('click', fetchAndDisplayPastLessons);
} else {
    console.error(`Кнопка с ID '${PAST_LESSONS_CONFIG.buttonId}' не найдена.`);
}


///////////////
/**
 * Находит название услуги по ключу в serviceContainer.
 * @param {string} serviceKey - Ключ услуги.
 * @returns {string} - Название услуги или исходный ключ.
 */
function getServiceTitle(serviceKey, stkInfo = servicecontainer) {
    const service = stkInfo.data.find(item => item.serviceTypeKey === serviceKey);
    return service ? service.shortTitle : serviceKey;
}

/**
 * Создает HTML-строку для одного урока.
 * @param {object} lesson - Объект урока.
 * @param {string} type - Тип отображения ('future' или 'past').
 * @returns {string} - Готовый HTML-фрагмент.
 */
function createFutureLessonHTML(lesson, type) {
    const { startedAt, lessonType, educationService, teacher } = lesson;

    const translatedLessonType = LESSONS_CONFIG.LESSON_TYPE_MAP[lessonType] || lessonType;
    const serviceTitle = getServiceTitle(educationService.serviceTypeKey);
    const formattedDate = formatLessonDate(startedAt);

    const teacherInfo = teacher
        ? `<span style="color:#32CD32; font-weight:900;">Преподаватель: </span> ${teacher.general.id} ${teacher.general.name} ${teacher.general.surname}<br>`
        : '';

    // Для будущих уроков статус не отображается, для прошедших - можно добавить
    const statusHTML = type === 'past'
        ? `<span style="color:#c9dbd2; font-weight:900;">Статус: </span><span style="color:green; font-weight:bold;">Прошел</span><br>` // Упрощенно
        : '';

    return `
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dotted #ff0000;">
            <span style="color: #00FA9A">&#5129;</span>
            <span style="color:#FF7F50; font-weight:900;">Дата: </span>${formattedDate}<br>
            <span style="color:#FFD700; font-weight:900;">Урок: </span>${translatedLessonType}<br>
            <span style="color:#00BFFF; font-weight:900;">Услуга: </span>${educationService.id} ${serviceTitle}<br>
            ${statusHTML}
            ${teacherInfo}
        </div>
    `;
}

// --- 3. УНИВЕРСАЛЬНАЯ АСИНХРОННАЯ ФУНКЦИЯ ---

/**
 * Запрашивает и отображает уроки (прошедшие или будущие).
 * @param {'future' | 'past'} type - Тип уроков для отображения.
 */
async function fetchAndDisplayLessons(type) {
    const button = document.getElementById(LESSONS_CONFIG.buttonId);
    const outputElement = document.getElementById(LESSONS_CONFIG.outputElementId);

    if (!button || !outputElement) {
        console.error("Кнопка или элемент вывода не найдены.");
        return;
    }

    const userId = getStudentId(); // Используем универсальную функцию
    if (!userId) return;

    // Блокируем кнопку
    button.disabled = true;
    button.innerHTML = 'Загрузка...';
    outputElement.innerHTML = '';

    try {
        const fetchURL = LESSONS_CONFIG.apiUrls[type](userId);
        const requestOptions = { method: 'GET' };

        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage(
                { action: 'getFetchRequest', fetchURL, requestOptions },
                (res) => (res.success ? resolve(res) : reject(new Error(res.error || 'Ошибка расширения')))
            );
        });

        const lessonsData = JSON.parse(response.fetchansver);

        if (!lessonsData || !Array.isArray(lessonsData.data) || lessonsData.data.length === 0) {
            outputElement.innerHTML = type === 'future' ? 'Уроки не запланированы' : 'Еще не было уроков';
            return;
        }

        const lessonsHTMLFragments = lessonsData.data.map(lesson => createFutureLessonHTML(lesson, type));
        outputElement.innerHTML = lessonsHTMLFragments.join('');

    } catch (error) {
        console.error(`Ошибка при получении ${type} уроков:`, error);
        alert(`Произошла ошибка: ${error.message}`);
        outputElement.innerHTML = `Не удалось загрузить ${type === 'future' ? 'будущие' : 'прошедшие'} уроки.`;
    } finally {
        button.disabled = false;
        button.innerHTML = type === 'future' ? 'Показать предстоящие' : 'Показать прошедшие';
    }
}

// Для кнопки "Показать предстоящие"
document.getElementById('getlessonfuture')?.addEventListener('click', () => fetchAndDisplayLessons('future'));

// Locale changer handler with optimized structure
document.getElementById('changeLocaleLng').addEventListener('click', async () => {
    // Get user ID safely with optional chaining
    const userId = document.getElementById('idstudent')?.value.trim();
    if (!userId) {
        createAndShowButton('User ID is required', 'error');
        return;
    }

    // API configuration
    const API_BASE = 'https://backend.skyeng.ru/api/persons/general';
    const fetchURL = `${API_BASE}/${userId}`;
    const requestOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'
        },
        referrer: 'https://crm2.skyeng.ru/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: JSON.stringify({ serviceLocale: 'ru' }),
        method: 'PUT',
        mode: 'cors',
        credentials: 'include'
    };

    try {
        // Show loading state
        const button = document.getElementById('changeLocaleLng');
        button.disabled = true;
        button.innerHTML = '⏳';

        // Send request through Chrome runtime
        const response = await new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({
                action: 'getFetchRequest',
                fetchURL,
                requestOptions
            }, (response) => {
                response.success ? resolve(response) : reject(new Error(response.error));
            });
        });

        // Success handling
        createAndShowButton('Language successfully updated', 'message');
        button.innerHTML = '✅';

        // Reset button after delay
        setTimeout(() => {
            button.innerHTML = '🌍';
            button.disabled = false;
        }, 2000);

    } catch (error) {
        // Error handling
        createAndShowButton(`Failed to update language: ${error.message}`, 'error');
        console.error('Locale change error:', error);

        // Reset button state
        const button = document.getElementById('changeLocaleLng');
        button.disabled = false;
        button.innerHTML = '🌍';
    }
});

document.getElementById('catchathistory').onclick = function () { // открывает в вензеле историю чатов введеного айди пользователя

    if (document.getElementById('AF_ChatHis').style.display == 'none') {
        document.getElementById('opennewcat').click();
        document.getElementById('chatuserhis').value = idstudentField.value.trim();
        btn_search_history.click()
    } else {
        document.getElementById('chatuserhis').value = idstudentField.value.trim();
        btn_search_history.click()
    }
}

let nameofuser, teachername, studentname, responsedata, utczone, localtime;
let servlocalestatus, avatarofuser, countryofuser, ageofuser;

function getusernamecrm() {
    const sid = idstudentField.value.trim();
    avatarofuser = '';
    flagusertype = '';

    const fetchURL = `https://backend.skyeng.ru/api/persons/${sid}?crm2=true&debugParam=person-page`;

    chrome.runtime.sendMessage(
        { action: 'getFetchRequest', fetchURL, requestOptions: { method: 'GET' } },
        function (response) {
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            }

            const data = JSON.parse(response.fetchansver).data;
            const fullName = data.name + (data.surname ? ` ${data.surname}` : '');

            // --- Общие элементы ---
            const studentFields = document.getElementsByName('studentosFields');
            const isStudent = data.type === "student";
            const isTeacher = data.type === "teacher";

            flagusertype = data.type;
            usrName.textContent = fullName;
            usrType.textContent = isStudent ? "Ученик" : "Преподаватель";
            usrType.style = isStudent
                ? "color:#38cf7a; font-weight:900; text-align:center;"
                : "color:#00BFFF; font-weight:900; text-align:center;";

            // --- Аватар ---
            if (data.avatarUrl) {
                const match = data.avatarUrl.match(/https:\/\/cdn-auth-avatars\.skyeng\.ru\/\d+\/[a-f0-9-]+$/);
                avatarofuser = match ? match[0] : '';
            }
            useravatar.style.display = avatarofuser ? "" : "none";
            if (avatarofuser) useravatar.src = avatarofuser;

            // --- Страна ---
            usrCountry.textContent = data.country || null;

            // --- Переключение UI блоков ---
            const show = el => el && (el.style.display = "");
            const hide = el => el && (el.style.display = "none");

            const uiMap = {
                student: [
                    pochtaStatus, telefonStatus, usrAge,
                    pochtaIdentity, telefonIdentity,
                    checkBalance, partialPaymentinfo,
                    subscriptioninfo, getPastAndFutureLessons,
                    complectationsOutput
                ],
                teacher: [
                    newTrm, butTeacherNabor, personalteacherpage
                ]
            };

            // Скрываем всё
            [...uiMap.student, ...uiMap.teacher].forEach(hide);
            studentFields.forEach(el => hide(el));

            // Показываем нужное
            if (isStudent) {
                uiMap.student.forEach(show);
                studentFields.forEach(show);
            } else {
                uiMap.teacher.forEach(show);
                hide(usrAge);
                document.getElementById('servicetable').innerHTML = '';
            }

            // --- Язык сервиса ---
            servlocalestatus = data.serviceLocale || "⭕";
            usrServLanguage.textContent = servlocalestatus;
            changeLocaleLng.style.display = servlocalestatus === "ru" ? "none" : "";

            // --- Копирование почты/телефона ---
            const mailBtn = document.getElementById('getusremail');
            const phoneBtn = document.getElementById('getusrphone');
            if (mailBtn) {
                mailBtn.onclick = () => {
                    console.log('clicked usermail')
                    const mail = document.getElementById('mailunhidden').textContent;
                    copyToClipboard(mail);
                    createAndShowButton(`Почта ${mail} скопирована в буфер обмена`, 'message');
                };
            }
            if (phoneBtn) {
                phoneBtn.onclick = () => {
                    console.log('clicked phone')
                    const phone = document.getElementById('phoneunhidden').textContent
                    copyToClipboard(phone);
                    createAndShowButton(`Телефон ${phone} скопирован в буфер обмена`, 'message');
                }
            }

            // --- Время ---
            const utc = data.utcOffset;
            utcOffset.textContent = utc;
            UTCtoMSK.textContent = utc - 3;

            const now = new Date();
            const local = new Date(now.getTime() + utc * 3600000)
                .toISOString()
                .substr(11, 5);

            localTime.textContent = local;

            // --- Возраст ---
            if (data.birthday) {
                const birthYear = Number(data.birthday.split('-')[0]);
                const age = now.getFullYear() - birthYear;
                ageofuser = age < 18 ? "🔞" : age < 99 ? "🅰" : "❓";
            } else {
                ageofuser = "❓";
            }
            usrAge.textContent = ageofuser;
        }
    );
}


let getcrmstatusinfo;
let crmresponseinfo;

function crmstatus() {
    const userId = idstudentField.value.trim();

    // UI reset
    const statusEl = document.getElementById('getcurrentstatus');
    const crmEl = document.getElementById('CrmStatus');
    statusEl.style.display = 'none';
    crmEl.style.display = 'none';

    const fetchURL = `https://customer-support.skyeng.ru/task/user/${userId}`;
    const requestOptions = { method: 'GET' };

    chrome.runtime.sendMessage(
        { action: 'getFetchRequest', fetchURL, requestOptions },
        function (response) {
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            }

            const tasks = JSON.parse(response.fetchansver).data;

            // --- Флаги состояния ---
            const flags = {
                tpOut: false,
                tp: false,
                notTp: false,
                wait: false,
                processing: false,
                operator: ''
            };

            // --- Анализ задач ---
            for (const task of tasks) {
                const group = task.operatorGroup.name;

                if (group === 'technical_support_outgoing') {
                    flags.tpOut = true;
                    if (task.status === 'waiting') flags.wait = true;
                    if (task.status === 'processing') {
                        flags.processing = true;
                        flags.operator = task.operator.name;
                    }
                } else if (group === 'technical_support_first_line') {
                    flags.tp = true;
                } else {
                    flags.notTp = true;
                }
            }

            // --- UI helpers ---
            const showStatus = (text, color, title = '') => {
                statusEl.style.display = '';
                statusEl.innerText = text;
                statusEl.style.backgroundColor = color;
                if (title) statusEl.title = title;
            };

            const showCrm = (text, log) => {
                crmEl.style.display = '';
                crmEl.innerText = text;
                console.log(log);
            };

            // --- Отображение статуса ожидания/решения ---
            if (flags.wait) {
                showStatus('В ожидании', '#1E90FF');
            } else if (flags.processing) {
                showStatus('Решается', '#DC143C', flags.operator);
            }

            // --- Таблица условий для CrmStatus ---
            const conditions = [
                { cond: flags.tpOut && !flags.tp && !flags.notTp, text: '💥', log: 'Есть активные задачи' },
                { cond: !flags.tpOut && flags.tp && !flags.notTp, text: '🛠', log: 'Входящий звонок или с др отдела на ТП была создана задача' },
                { cond: !flags.tpOut && !flags.tp && flags.notTp, text: '📵', log: 'Нет активных задач по ТП линии' },
                { cond: flags.tpOut && flags.tp && !flags.notTp, text: '💥', log: 'Есть активные задачи на исход и на ТП 1 линии' },
                { cond: flags.tpOut && flags.tp && flags.notTp, text: '💥', log: 'Есть активные задачи на исход, ТП 1 линии и др отделы' },
                { cond: flags.tp && flags.notTp && !flags.tpOut, text: '🛠', log: 'Входящий звонок на ТП + задача на др отдел' },
                { cond: !flags.tp && flags.notTp && flags.tpOut, text: '💥', log: 'Есть задача на ТП Исход + задача на др отдел' }
            ];

            const match = conditions.find(c => c.cond);

            if (match) {
                showCrm(match.text, match.log);
            } else {
                showCrm('📵', 'No DATA');
            }
        }
    );
}


async function checkServiceAndUserInfo() {
    let stidNew = idstudentField.value.trim()

    setTimeout(function () {
        if (flagusertype == "teacher") {
            document.getElementById('servicetable').innerHTML = '';
            arrservice = null;
        } else {
            getservices(stidNew)
        }
    }, 1000)
}

async function getservices(stidNew) {
    document.getElementById('servicetable').innerHTML = "Загрузка..."
    let complectationServInfo = document.getElementById('cmplData');
    complectationServInfo.innerHTML = ""
    let linkToComplectationtable = document.getElementById('complekttable')
    linkToComplectationtable.innerHTML = ""
    let operatorNote = "";


    const fetchURL = `https://backend.skyeng.ru/api/persons/${stidNew}/education-services/`;
    const requestOptions = {
        method: 'GET'
    };

    const fetchURLComplectations = `https://backend.skyeng.ru/api/v1/students/${stidNew}/education-service-kits/`;
    const requestOptionsComplectations = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLComplectations, requestOptions: requestOptionsComplectations }, function (response) { // получение информации по комплектациям
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const chechkComplectations = JSON.parse(response.fetchansver);

            if (chechkComplectations.data.length > 0) {
                linkToComplectationtable.innerHTML += '<div id="openOneComplectation" style="background: #4e7891; text-align:center; cursor:pointer; text-shadow: 1px 1px 2px black;">✅Есть комплектации >>></div>'

                const openOneCompl = document.getElementById('openOneComplectation');
                openOneCompl.addEventListener('click', function () {
                    let getComplWindow = document.getElementById('AF_Complectations');
                    if (getComplWindow.style.display == "none") {
                        getComplWindow.style.display = "";
                    } else {
                        getComplWindow.style.display = "none";
                    }
                });

                chechkComplectations.data.forEach((service) => {
                    if (service.incorrectnessReason == null) {
                        if (service.operatorNote) {
                            operatorNote = service.operatorNote.replace(/\/\//g, ' ').replace(/\//g, '&#47;');
                            console.log(operatorNote);
                        }

                        let gatheredInfoComplSrvs = '<table style="width: 98%; margin: 10px 0; border-collapse: collapse;">';
                        gatheredInfoComplSrvs += `
                            <tr style="background: #776d69; color: white; position: sticky; top: 0px; z-index:10">
                                <th style="border: 1px solid black; padding: 5px; ">ID Услуги</th>
                                <th style="border: 1px solid black; padding: 5px; ">STK</th>
                                <th style="border: 1px solid black; padding: 5px; ">💰</th>
                                <th style="border: 1px solid black; padding: 5px; ">Sync</th>
                            </tr>`;

                        const allEduServicesCompl = service.educationServices;
                        allEduServicesCompl.forEach((el) => {
                            let { formattedText, lessontype } = formatServiceType(el.serviceTypeKey); // Вызов функции для форматирования строки
                            gatheredInfoComplSrvs += `
                        <tr>
                        <td name="idServForSync" style="border: 1px solid black; padding: 5px; background: #4f4c4c;">
                        <a href="https://crm2.skyeng.ru/persons/${service.student.general.id}/services/${el.id}" target="_blank" style="color:#32b5f5; text-decoration: none;">${el.id}</a>
                    </td>
                            <td style="border: 1px solid black; padding: 5px; background: #4f4c4c;">${formattedText}</td>
                            <td style="border: 1px solid black; padding: 5px; background: #4f4c4c;">${el.balance}</td>
                            <td class="syncBtn" name="btnSynchro"><span class="emoji">♻️</span></td>
                        </tr>`;
                        });
                        gatheredInfoComplSrvs += '</table>';

                        complectationServInfo.innerHTML += `<div style="background: #4a7d55; text-align: center; border-radius: 20px; width: 97%; text-shadow: 1px 1px 2px black; margin-bottom:5px;" title="${operatorNote}">ℹ️ [${service.id}] ${service.productKit.title} | ${service.stage == "regular_lessons" ? "Регулярные занятия" : service.stage == "lost" ? "Потерянная" : service.stage}</div>` + gatheredInfoComplSrvs;

                    } else {
                        complectationServInfo.innerHTML += `<div style="background: #8d310f; text-align: center; border-radius: 20px; width: 97%; text-shadow: 1px 1px 2px black; margin-bottom:5px;">[${service.id}] '${service.productKit.title}' - некорректна</div>`
                    }

                });


                let allBtns = document.getElementsByName('btnSynchro')
                let allIdSrv = document.getElementsByName('idServForSync')
                let allSyncEmojis = document.getElementsByClassName('emoji')
                for (let i = 0; i < allBtns.length; i++) {
                    allBtns[i].onclick = function () {
                        allSyncEmojis[i].innerText = "⏳"
                        const gToken = localStorage.getItem('token_global');
                        const fetchURL = `https://skysmart-core.skyeng.ru/api/v1/academic-activity/upsert-education-service-history/${allIdSrv[i].innerText}`;
                        const requestOptions = {
                            headers: {
                                "accept": "application/json, text/plain, */*",
                                "authorization": `Bearer ${gToken}`
                            },
                            method: "POST",
                            mode: "cors"
                        };

                        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
                            if (!response.success) {
                                alert('Не удалось выполнить запрос: ' + response.error + 'Если запускали синхронизацию через расширение, то необходимо после закрытия окна повторно открыть в новой вкладке CRM на 5 секунд. После чего вернуться в окно AF иобновить страницу');
                                allSyncEmojis[i + 1].innerText = "❌";
                                localStorage.removeItem('token_global')
                            } else {
                                allSyncEmojis[i + 1].innerText = "✅";
                                setTimeout(function () { allSyncEmojis[i + 1].innerText = "♻️"; }, 5000);
                            }
                        });
                    }
                }

            } else {
                linkToComplectationtable.innerHTML += '<div style="background: #4e7891; text-align:center; text-shadow: 1px 1px 2px black;">❌Нет комплектаций</div>';
                console.log("Нет услуг комплектаций Домашний Лицей, Large Classes Exams и других");
            }
        }
    });

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetEdServ = JSON.parse(response.fetchansver);

            if (otvetEdServ.data.length != 0) {
                let servinfo = ""; //инфо об услуге
                let arrservice = []; // пустой массив, куда будет передавать ID отобранных услуг по условию

                let srvKeyMap = new Map(servicecontainer.data.map(d => [d.serviceTypeKey, d.shortTitle]));
                otvetEdServ.data.forEach((service, i) => {
                    if (srvKeyMap.has(service.serviceTypeKey)) {
                        service.serviceTypeKey = srvKeyMap.get(service.serviceTypeKey);
                    }

                    if (service.student.general.id == stid) {
                        if (service.incorrectnessReason == null) {

                            if ((service.stage === "after_trial" || service.stage === "before_call") && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey != "Групповые онлайн-мероприятия Life" && service.serviceTypeKey != "Скрининг" && service.serviceTypeKey != "Англ adult АЯ Даунсейл") {
                                servinfo += '<div style="text-align:center; background:#c26919; color:#ffffff; font-weight:700;border: 1px solid black;">Этап ВУ |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #c26919; color:#000000;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '</div>'
                                arrservice += service.id + ", ";
                            }

                            if (service.stage === "regular_lessons" && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey != "Групповые онлайн-мероприятия Life" && service.serviceTypeKey != "Скрининг" && service.serviceTypeKey != "Англ adult АЯ Даунсейл") {
                                const teacherInfo = service.teacher
                                    ? "👽 Teacher: " + service.teacher.general.id + "," + " " + service.teacher.general.name + " " + service.teacher.general.surname
                                    : "👽 Teacher: Не закреплен!";
                                const tmpTeacherInfo = service.temporaryTeacher
                                    ? "⏳👽 Teacher: " + service.temporaryTeacher.general.id + "," + " " + service.temporaryTeacher.general.name + " " + service.temporaryTeacher.general.surname
                                    : "NoTmp";

                                if (tmpTeacherInfo != "NoTmp") {
                                    servinfo += '<div style="text-align:center; background:#30508c; font-weight:700;border: 1px solid black;">Регулярные занятия |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #2b602b; color:navajowhite;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '<br>' + teacherInfo + '<br>' + tmpTeacherInfo + '</div>';
                                    arrservice += service.id + ", ";
                                } else {
                                    servinfo += '<div style="text-align:center; background:#30508c; font-weight:700;border: 1px solid black;">Регулярные занятия |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #2b602b; color:navajowhite;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '<br>' + teacherInfo + '</div>';
                                    arrservice += service.id + ", ";
                                }
                            }

                            if (service.stage === "lost" && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey != "Групповые онлайн-мероприятия Life" && service.serviceTypeKey != "Скрининг" && service.serviceTypeKey != "Англ adult АЯ Даунсейл") {
                                servinfo += '<div style="text-align:center; background:#626367; font-weight:700;border: 1px solid black;">Потерянная услуга |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #5a0f77; color:#c6c5c5;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '</div>'
                                arrservice += service.id + ", ";
                            }
                        }
                    }

                    document.getElementById('servicetable').innerHTML = '<span style="color:#00BFFF; font-weight:900;">Информация об услугах:</span><br>' + servinfo;

                });

                if (arrservice != null && arrservice.length > 0 && arrservice != undefined) {
                    arrservice = arrservice.split(', ')
                }

                let tmparr = document.querySelectorAll('.copyserviceid');
                for (let j = 0; j < tmparr.length; j++) {
                    tmparr[j].onclick = function () {
                        copyToClipboard(arrservice[j])
                    }
                }

                if (document.getElementById('getusremail') != null) {
                    document.getElementById('getusremail').onclick = function () {
                        copyToClipboard(document.getElementById('mailunhidden').textContent);
                        createAndShowButton(`Почта ${document.getElementById('mailunhidden').textContent} скопирована в буфер обмена `, 'message');
                    };
                }

                if (document.getElementById('getusrphone') != null) {
                    document.getElementById('getusrphone').onclick = function () {
                        copyToClipboard(document.getElementById('phoneunhidden').textContent);
                        createAndShowButton(`Телефон ${document.getElementById('phoneunhidden').textContent} скопирован в буфер обмена `, 'message');
                    };
                }



            } else {
                document.getElementById('servicetable').innerHTML = '<div style="text-align:center; background:coral; font-weight:700;border: 1px solid black; color: floralwhite;">Услуг вообще нет!</div>'
            }

        }
    })
}

function getuserinfo() {
    document.getElementById('pochtaIdentity').textContent = 'hidden'
    document.getElementById('telefonIdentity').textContent = 'hidden'
    document.getElementById('servicetable').innerHTML = "Загрузка..."
    usrServLanguage = document.getElementById('usrServLang');
    usrAge = document.getElementById('usrAge');
    usrName = document.getElementById('usrName');
    usrCountry = document.getElementById('usrCountry');
    usrType = document.getElementById('usrType')
    usrType.textContent = '';
    document.getElementById('mailunhidden').textContent = "hidden"
    document.getElementById('phoneunhidden').textContent = "hidden"

    document.querySelector('#useravatar').src = "";
    if (document.querySelector('#useravatar').style.display != "none")
        document.querySelector('#useravatar').style.display = "none";

    document.getElementById('getcurrentstatus').title = "";
    stid = idstudentField.value.trim();

    setTimeout(getusernamecrm, 640);
    setTimeout(crmstatus, 700);
    setTimeout(checkServiceAndUserInfo, 720)
}

const getidstudentbtn = document.getElementById('getidstudent');
getidstudentbtn.onclick = function () { // нажатие на ракету
    getuserinfo()
    setTimeout(function () {
        if (document.getElementById('servicetable').innerHTML == "Загрузка...") {
            checkServiceAndUserInfo()
        }
    }, 4000)
}

function handleInput(event) {
    idstudentField.value = '';
    const pastedValue = (event.clipboardData || event.dataTransfer).getData('text').trim();
    setTimeout(() => {
        if (/^\d+$/.test(pastedValue)) {
            idstudentField.value = pastedValue;
            getidstudentbtn.click();
        }
    }, 0);
}

idstudentField.addEventListener('paste', handleInput);
idstudentField.addEventListener('drop', handleInput);
idstudentField.addEventListener('input', () => onlyNumber(idstudentField));

document.getElementById('CrmStatus').onclick = crmstatus;

document.getElementById('crmactivetasks').onclick = function () { //открыват СРМ с активными задачами
    window.open("https://crm2.skyeng.ru/persons/" + idstudentField.value.trim() + "/customer-support/list")
}

document.getElementById('newTrm').onclick = function () { //открывает новый TRM 2.0 п
    window.open("https://trm.skyeng.ru/teacher/" + idstudentField.value.trim())
}

document.getElementById('personalteacherpage').onclick = function () { //открывает личную страницу П
    window.open("https://skyeng.ru/teachers/id/" + idstudentField.value.trim())
}

document.getElementById('clearservinfo').onclick = function () { //очищает все в вензеле
    idstudentField.value = "";
    document.getElementById('servicetable').innerHTML = "";
    document.getElementById('CrmStatus').style.display = "none";
    document.getElementById('getcurrentstatus').style.display = "none";
    document.getElementById('changeLocaleLng').style.display = "";
    document.getElementById('getPastAndFutureLessons').style.display = "";
    document.querySelector('#useravatar').src = "";
    document.querySelector('#useravatar').style.display = "none";
    document.getElementById('AF_Timetable').style.display = "none";
    document.getElementById('timetabledata').innerText = "";
    document.getElementById('usrType').innerText = "";
    document.getElementById('usrAge').innerText = "";
    document.getElementById('usrName').innerText = "";
    document.getElementById('telefonIdentity').innerText = "";
    document.getElementById('pochtaIdentity').innerText = "";
    document.getElementById('usrCountry').innerText = "";
    document.getElementById('mailunhidden').innerText = "";
    document.getElementById('phoneunhidden').innerText = "";
}

document.getElementById('useravatar').onmouseover = function () { // взаимодействие с аватаром пользователя увеличивает
    document.getElementById('useravatar').style.width = "200px";
    document.getElementById('useravatar').style.height = "230px";
}

document.getElementById('useravatar').onmouseout = function () { // взаимодействие с аватаром пользователя уменьшает
    document.getElementById('useravatar').style.width = "55px";
    document.getElementById('useravatar').style.height = "60px";
}

document.getElementById('getPastAndFutureLessons').onclick = function () { //открывает меню прошедших и предстоящих уроков
    if (document.getElementById('AF_Timetable').style.display == '')
        document.getElementById('AF_Timetable').style.display = 'none'
    else
        document.getElementById('AF_Timetable').style.display = ''
    getlessonfuture.click();
}

document.getElementById('getloginer').onclick = async function () {
    let userIdForLogIn = document.getElementById('idstudent').value.trim();
    console.log('Button logginer clicked')
    const button = document.getElementById('getloginer');
    button.style = "background:orange; padding: 2px; border-radius:20%";

    try {
        await getLoginLink(userIdForLogIn);
        button.style = "background:green; padding: 2px; border-radius:20%";
        createAndShowButton('💾 Ссылка-логинер cкопирована', 'message');
    } catch (error) {
        console.log('Ошибка: ', error);
        button.style = "background:red; padding: 2px; border-radius:20%";
        createAndShowButton('Ошибка при получении ссылки-логинера', 'error');
        alert('Не удалось получить логиннер: ' + error.message);
    } finally {
        setTimeout(() => {
            button.style.background = "none";
        }, 2000);
    }
};