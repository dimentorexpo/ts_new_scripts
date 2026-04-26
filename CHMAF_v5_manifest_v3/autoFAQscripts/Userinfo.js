// --- ВНЕДРЕНИЕ ИЗОЛИРОВАННЫХ СТИЛЕЙ (GLASSMORPHISM v2) ---
const injectGlassStyles = () => {
    if (document.getElementById('af-glass-styles')) return;
    const style = document.createElement('style');
    style.id = 'af-glass-styles';
    style.innerHTML = `
        .af-gl-wrapper {
            font-family: system-ui, -apple-system, sans-serif;
            color: #e2e8f0;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            font-size: 13px;
            box-sizing: border-box;
            width: 380px; /* Увеличили ширину для ровного ряда кнопок */
            line-height: 1.4;
        }
        .af-gl-panel {
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .af-gl-header {
            display: flex;
            gap: 8px;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 12px;
        }
        .af-gl-row {
            display: flex;
            flex-wrap: nowrap; /* Запрещаем перенос, чтобы поле ввода сжималось */
            gap: 6px;
            align-items: center;
        }
        .af-gl-btn {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            padding: 6px 12px;
            height: 32px;
        }
        .af-gl-btn-icon {
            width: 32px;
            padding: 0; /* Делаем кнопку квадратной для эмодзи */
            font-size: 15px;
            flex-shrink: 0; /* Чтобы кнопки не сжимались */
        }
        .af-gl-btn:hover:not(:disabled) {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .af-gl-btn:active:not(:disabled) {
            transform: translateY(1px);
        }
        .af-gl-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .af-gl-input {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            padding: 0 10px;
            height: 32px;
            outline: none;
            text-align: center;
            transition: all 0.2s;
            flex: 1; /* Поле ввода занимает всё оставшееся место */
            min-width: 80px;
        }
        .af-gl-input:focus {
            border-color: rgba(56, 189, 248, 0.6);
            box-shadow: 0 0 8px rgba(56, 189, 248, 0.3);
            background: rgba(0, 0, 0, 0.5);
        }
        .af-gl-badge {
            padding: 4px 8px;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.1);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            height: 32px;
            box-sizing: border-box;
        }

        /* Стили блока информации пользователя */
        .af-gl-info-container {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 16px 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .af-gl-info-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            flex-wrap: wrap;
        }

        /* Стили аватара (теперь он внутри блока, а не висит сбоку) */
        .af-gl-avatar-wrapper {
            display: flex;
            justify-content: center;
            margin-bottom: 4px;
        }
        .af-gl-avatar {
            width: 70px;
            height: 70px;
            border-radius: 50%;
            border: 2px solid rgba(56, 189, 248, 0.5);
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            object-fit: cover;
            transition: transform 0.3s ease;
        }
        .af-gl-avatar:hover {
            transform: scale(1.8);
            z-index: 100;
            border-color: rgba(56, 189, 248, 1);
        }

        .af-gl-scrollable {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 6px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .af-gl-scrollable::-webkit-scrollbar { width: 6px; }
        .af-gl-scrollable::-webkit-scrollbar-track { background: rgba(0,0,0,0.15); border-radius: 4px; }
        .af-gl-scrollable::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 4px; }
        .af-gl-scrollable::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }

        .af-gl-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 12px;
            text-align: left;
            transition: transform 0.2s;
        }
        .af-gl-card:hover {
            background: rgba(255, 255, 255, 0.06);
        }
        .af-gl-card-header {
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 6px;
            margin-bottom: 8px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .af-gl-bg-info { background: rgba(30, 144, 255, 0.3); }
        .af-gl-bg-danger { background: rgba(220, 20, 60, 0.3); }
        .af-gl-bg-success { background: rgba(46, 139, 87, 0.3); }
        .af-gl-bg-vu { background: rgba(245, 131, 32, 0.79); border-color: rgba(194, 105, 25, 0.5); }
        .af-gl-bg-regular { background: rgba(69, 199, 52, 0.25); border-color: rgba(48, 80, 140, 0.5); }
        .af-gl-bg-lost { background: rgba(138, 28, 129, 0.51); border-color: rgba(98, 99, 103, 0.5); }

        .af-gl-text-accent { color: #38bdf8; }
        .af-gl-text-success { color: #4ade80; }
        .af-gl-text-warning { color: #fbbf24; }
        .af-gl-text-muted { color: #94a3b8; }

        .cursor-pointer { cursor: pointer; transition: opacity 0.2s; }
        .cursor-pointer:hover { opacity: 0.7; }
    `;
    document.head.appendChild(style);
};
injectGlassStyles();

// --- КОНФИГУРАЦИЯ И ГЛОБАЛЬНЫЕ СОСТОЯНИЯ ---
let servicecontainer = null;
let stid = null;

const STATUS_ICONS = { VALID: '✅', INVALID: '❌', EMAIL: '📧', PHONE: '☎️' };
const API_BASE_URL = 'https://backend.skyeng.ru/api/persons';

const LINK_CONFIG = {
    checkBalance: { url: (id) => `https://billing-api.skyeng.ru/operations/user/${id}/info` },
    GotoCRM: { url: (id) => `https://crm2.skyeng.ru/persons/${id}` },
    partialPaymentinfo: { url: (id) => `https://billing-api.skyeng.ru/installments?ownerId=${id}&state=&perPage=50&currentPage=1` },
    subscriptioninfo: { url: (id) => `https://billing-api.skyeng.ru/subscriptions/user/${id}/info` },
    editadmbtn: { url: (id) => `https://id.skyeng.ru/admin/users/${id}/update-contacts` }
};

const PAST_LESSONS_CONFIG = {
    buttonId: 'getlessonpast',
    outputElementId: 'timetabledata',
    apiUrl: (id) => `https://backend.skyeng.ru/api/students/${id}/timetable/lessons-history/?page=0`,
    STATUS_MAP: { "missed_by_student": "Пропущен учеником", "canceled_by_student": "Отменен учеником", "success": "Прошел", "moved_by_student": "Перенесен учеником", "canceled_by_teacher": "Отменен учителем", "student_refused_to_study": "Отказался от обучения", "interrupted": "Прерван", "did_not_get_through_student": "Не смогли связаться с У", "canceled_not_marked": "Не отмечен учителем вовремя" },
    LESSON_TYPE_MAP: { "regular": "Регулярный", "single": "Одиночный", "trial": "Пробный" }
};

const LESSONS_CONFIG = {
    buttonId: 'getlessonfuture',
    outputElementId: 'timetabledata',
    apiUrls: {
        future: (id) => `https://backend.skyeng.ru/api/students/${id}/timetable/future-lessons/`,
        past: (id) => `https://backend.skyeng.ru/api/students/${id}/timetable/lessons-history/?page=0`,
    },
    LESSON_TYPE_MAP: PAST_LESSONS_CONFIG.LESSON_TYPE_MAP
};

// --- HTML ШАБЛОНЫ (С ПРИМЕНЕНИЕМ GLASSMORPHISM) ---
const win_serviceinfo = `
<div class="af-gl-wrapper">
    <div class="af-gl-panel">

        <div class="af-gl-header" id="servicehead" style="cursor: -webkit-grab;">
            <button title="Скрыть меню" id="hideMeservice" class="af-gl-btn af-gl-btn-icon buttonHide" style="color: #ef4444;">❌</button>
            <button title="CRM" id="GotoCRM" class="af-gl-btn">CRM</button>
            <button title="Показать контакты" id="dounhidemailandphone" class="af-gl-btn af-gl-btn-icon">👁‍🗨</button>
            <button title="Статус CRM" id="CrmStatus" class="af-gl-btn af-gl-btn-icon" style="display:none;"></button>
            <span id="getcurrentstatus" class="af-gl-badge af-gl-bg-info" style="display:none;"></span>
        </div>

        <div class="af-gl-row">
            <input id="idstudent" class="af-gl-input" placeholder="ID У/П" autocomplete="off">
            <button title="Поиск" id="getidstudent" class="af-gl-btn af-gl-btn-icon">🚀</button>
            <button title="Все задачи" id="crmactivetasks" class="af-gl-btn af-gl-btn-icon">📋</button>
            <button title="TRM 2.0" id="newTrm" class="af-gl-btn af-gl-btn-icon" style="display:none;">🗿</button>
            <button title="Стран. учителя" id="personalteacherpage" class="af-gl-btn af-gl-btn-icon" style="display:none;">🎭</button>
            <button title="Язык: RU" id="changeLocaleLng" class="af-gl-btn af-gl-btn-icon">🌍</button>
            <button title="Баланс" id="checkBalance" class="af-gl-btn af-gl-btn-icon">💰</button>
            <button title="Уроки" id="getPastAndFutureLessons" class="af-gl-btn af-gl-btn-icon">📆</button>
            <button title="Очистить" id="clearservinfo" class="af-gl-btn af-gl-btn-icon">🧹</button>
        </div>

        <div class="af-gl-row">
            <input id="onetimepassout" class="af-gl-input" readonly placeholder="OTP код">
            <button title="Сген. код (МП)" id="getonetimepass" class="af-gl-btn af-gl-btn-icon">📱</button>
            <button title="Админка" id="editadmbtn" class="af-gl-btn af-gl-btn-icon">✏️</button>
            <button title="История чатов" id="catchathistory" class="af-gl-btn af-gl-btn-icon">🗄</button>
            <button title="Набор" id="butTeacherNabor" class="af-gl-btn af-gl-btn-icon" style="display:none;">🚷</button>
            <button title="Рассрочка" id="partialPaymentinfo" class="af-gl-btn af-gl-btn-icon">💸</button>
            <button title="Подписка" id="subscriptioninfo" class="af-gl-btn af-gl-btn-icon">💵</button>
            <button title="Vimbot" id="openVimbotWindowsUserinfo" class="af-gl-btn af-gl-btn-icon">▶️</button>
        </div>

        <div id="basicInfo" class="af-gl-info-container">
            <div id="avatarWrapper" class="af-gl-avatar-wrapper" style="display:none;">
                <img id="useravatar" class="af-gl-avatar" src="">
            </div>

            <div id="usrType" style="font-size: 15px; text-align: center; margin-bottom: 2px;"></div>

            <div class="af-gl-info-row">
                <span id="usrAge"></span>
                <span id="getloginer" class="cursor-pointer" title="Ссылка-логгинер" style="padding: 2px 4px; border-radius: 6px;">🔑</span>
                <span class="af-gl-text-muted">Имя:</span>
                <span id="usrName" style="font-weight: bold; font-size: 14px;"></span>
            </div>

            <div class="af-gl-info-row">
                <span class="cursor-pointer" title="Скопировать" id="getusremail">📧</span>
                <span id="mailunhidden" class="af-gl-text-accent">hidden</span>
            </div>

            <div class="af-gl-info-row">
                <span class="cursor-pointer" title="Скопировать" id="getusrphone">☎️</span>
                <span id="phoneunhidden" class="af-gl-text-accent">hidden</span>
                <span class="af-gl-text-muted" style="margin-left: 4px;">• 🌍: </span>
                <span id="usrCountry"></span>
            </div>

            <div class="af-gl-info-row" style="margin-top: 4px;">
                <span class="af-gl-text-muted" name="studentosFields">Identity:</span>
                <span id="pochtaIdentity" name="studentosFields"></span>
                <span id="telefonIdentity" name="studentosFields"></span>
                <span class="af-gl-text-muted" name="studentosFields" style="margin-left: 4px;">• Язык: </span>
                <span id="usrServLang" name="studentosFields" style="font-weight: bold;"></span>
            </div>

            <div class="af-gl-info-row af-gl-text-muted" style="font-size: 11px; margin-top: 4px;">
                <span name="studentosFields">UTC: <span id="utcOffset" style="color:#fff;"></span></span> |
                <span name="studentosFields">MSK: <span id="UTCtoMSK" style="color:#fff;"></span></span> |
                <span name="studentosFields">Местное: <span id="localTime" style="color:#fff;"></span></span>
            </div>
        </div>

        <div id="serviceList" class="af-gl-scrollable">
            <div id="servicetable"></div>
        </div>
        <div id="complektList" class="af-gl-scrollable">
            <div id="complekttable"></div>
        </div>
    </div>
</div>`;

const win_Timetable = `
<div class="af-gl-wrapper" style="width: 450px;">
    <div class="af-gl-panel">
        <div class="af-gl-header" id="HeadTimetable" style="cursor: -webkit-grab; justify-content: space-between;">
            <span style="font-weight: bold; font-size: 14px;">📅 Расписание</span>
            <button class="af-gl-btn" id="hideMeTT" style="color: #ef4444;">❌</button>
        </div>
        <div class="af-gl-row" style="justify-content: center;">
            <button class="af-gl-btn" id="getlessonpast">Прошедшие</button>
            <button class="af-gl-btn" id="getlessonfuture">Предстоящие</button>
        </div>
        <div id="timetableinfo" class="af-gl-scrollable" style="margin-top: 10px;">
            <div id="timetabledata" style="text-align: center;"></div>
        </div>
    </div>
</div>`;

const win_Complectations = `
<div class="af-gl-wrapper" style="width: 500px;">
    <div class="af-gl-panel">
        <div class="af-gl-header" id="headComplectations" style="cursor: -webkit-grab; justify-content: space-between;">
            <span style="font-weight: bold; font-size: 14px;">📦 Комплектации</span>
            <button class="af-gl-btn" id="hideComplecations" style="color: #ef4444;">❌</button>
        </div>
        <div id="cmplInfo" class="af-gl-scrollable">
            <div id="cmplData"></div>
        </div>
    </div>
</div>`;

// --- ИНИЦИАЛИЗАЦИЯ ОКОН (функции createWindow ожидаются извне) ---
const wintServices = createWindow('AF_Service', 'winTopService', 'winLeftService', win_serviceinfo);
const wintTimetable = createWindow('AF_Timetable', 'winTopTimetable', 'winLeftTimetable', win_Timetable);
const wintComplectations = createWindow('AF_Complectations', 'winTopComplectations', 'winLeftComplectations', win_Complectations);

// --- УТИЛИТЫ И ХЕЛПЕРЫ ---
const getStudentId = () => {
    const userId = document.getElementById('idstudent')?.value.trim();
    if (!userId) {
        alert('Пожалуйста, введите ID студента.');
        return null;
    }
    return userId;
};

const openLinkInNewTab = (userId, url) => {
    if (!userId) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};

const sendMessageAsync = (message) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            if (response && response.success) resolve(response);
            else reject(new Error(response?.error || 'Unknown error from extension'));
        });
    });
};

// --- ОСНОВНЫЕ ОБРАБОТЧИКИ СОБЫТИЙ ---

// Скрытие окон
document.getElementById('servicehead')?.addEventListener('dblclick', (a) => {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
        document.getElementById('AF_Service').style.display = 'none';
        document.getElementById('butServ')?.classList.remove('activeScriptBtn');
    }
});
document.getElementById('hideMeservice')?.addEventListener('click', () => {
    document.getElementById('AF_Service').style.display = 'none';
    document.getElementById('butServ')?.classList.remove('activeScriptBtn');
});

// Кнопка Identity (раскрыть почту/телефон)
document.getElementById('dounhidemailandphone')?.addEventListener('click', async function () {
    this.disabled = true;
    const originalText = this.textContent;
    this.textContent = '⏳';
    try {
        await Promise.all([getUnhideEmail(), getUnhidePhone()]);
        await checkEmailAndPhoneIdentity();
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('mailunhidden').textContent = '';
        document.getElementById('phoneunhidden').textContent = '';
        document.getElementById('pochtaIdentity').textContent = '';
        document.getElementById('telefonIdentity').textContent = '';
    } finally {
        this.disabled = false;
        this.textContent = originalText;
    }
});

// Настройка линков из конфига
const idstudentField = document.getElementById('idstudent');
if (idstudentField) {
    for (const buttonId in LINK_CONFIG) {
        document.getElementById(buttonId)?.addEventListener('click', () => {
            const userId = getStudentId();
            if (userId) openLinkInNewTab(userId, LINK_CONFIG[buttonId].url(userId));
        });
    }
}

// Генерация OTP
document.getElementById('getonetimepass')?.addEventListener('click', async function () {
    const userId = getStudentId();
    if (!userId) return;
    const outputField = document.getElementById('onetimepassout');

    this.disabled = true;
    this.innerHTML = '✅';
    try {
        const reqOpts = {
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: `user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D=${userId}&user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null`,
            method: 'POST'
        };
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: 'https://id.skyeng.ru/admin/auth/one-time-password', requestOptions: reqOpts });
        const otpMatch = response.fetchansver.match(/Одноразовый пароль: (\d+)\./);
        outputField.value = otpMatch ? otpMatch[1] : 'Не найден';
    } catch (e) {
        alert(`Ошибка: ${e.message}`);
    } finally {
        this.disabled = false;
        this.innerHTML = '📱';
        setTimeout(() => outputField.value = '', 15000);
    }
});

// Управление окнами Timetable / Complectations
document.getElementById('AF_Timetable')?.addEventListener('dblclick', (a) => {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
        document.getElementById('AF_Timetable').style.display = 'none';
        document.getElementById('timetabledata').innerHTML = "";
    }
});
document.getElementById('hideMeTT')?.addEventListener('click', () => {
    document.getElementById('AF_Timetable').style.display = 'none';
    document.getElementById('timetabledata').innerHTML = "";
});
document.getElementById('hideComplecations')?.addEventListener('click', () => {
    document.getElementById('AF_Complectations').style.display = 'none';
    if (document.getElementById('AF_SpecCommWindow')?.style.display == '') {
        document.getElementById('hideMeSpecComm')?.click();
    }
});

// --- ЛОГИКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ---

async function checkEmailAndPhoneIdentity() {
    const userId = idstudentField?.value.trim();
    if (!userId || window.flagusertype !== "student") return;

    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: `https://id.skyeng.ru/admin/users/${userId}/update-contacts`, requestOptions: { method: 'GET' } });
        const html = response.fetchansver;
        const hasEmail = !html.includes('"identityEmail" disabled data-value=""');
        const hasPhone = !html.includes('"identityPhone" disabled data-value=""');

        document.getElementById('pochtaIdentity').textContent = `${STATUS_ICONS.EMAIL}${hasEmail ? STATUS_ICONS.VALID : STATUS_ICONS.INVALID}`;
        document.getElementById('telefonIdentity').textContent = `${STATUS_ICONS.PHONE}${hasPhone ? STATUS_ICONS.VALID : STATUS_ICONS.INVALID}`;
    } catch (error) {
        console.error("Не удалось проверить статус identity:", error);
    }
}

async function _fetchAndDisplayPersonalData(pdType, targetElementId) {
    const userId = getStudentId();
    const targetEl = document.getElementById(targetElementId);
    if (!userId || !targetEl) return;

    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: `${API_BASE_URL}/${userId}/personal-data/?pdType=${pdType}&source=persons.profile`, requestOptions: { method: 'GET' } });
        const data = JSON.parse(response.fetchansver);
        targetEl.textContent = data?.data?.value || 'Не заполнен';
    } catch (e) {
        targetEl.textContent = '';
    }
}

const getUnhideEmail = () => _fetchAndDisplayPersonalData('email', 'mailunhidden');
const getUnhidePhone = () => _fetchAndDisplayPersonalData('phone', 'phoneunhidden');

// Получение конфигурации услуг
async function fetchServiceConfiguration() {
    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: 'https://backend.skyeng.ru/api/products/configurations/', requestOptions: { method: 'GET' } });
        servicecontainer = JSON.parse(response.fetchansver);
    } catch (e) {
        console.error('Ошибка конфигурации сервиса:', e.message);
    }
}
fetchServiceConfiguration();

// Форматирование дат и уроков
function formatLessonDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function createFutureLessonHTML(lesson, type) {
    const { startedAt, lessonType, educationService, teacher } = lesson;
    const translatedType = LESSONS_CONFIG.LESSON_TYPE_MAP[lessonType] || lessonType;
    const srvTitle = servicecontainer?.data.find(i => i.serviceTypeKey === educationService.serviceTypeKey)?.shortTitle || educationService.serviceTypeKey;

    const teacherInfo = teacher ? `<div class="af-gl-text-success">👨‍🏫 ${teacher.general.id} ${teacher.general.name} ${teacher.general.surname}</div>` : '';
    const statusHTML = type === 'past' ? `<div>Статус: <span class="af-gl-text-success">Прошел</span></div>` : '';

    return `
        <div class="af-gl-card">
            <div><span class="af-gl-text-warning">📅 Дата:</span> ${formatLessonDate(startedAt)}</div>
            <div><span class="af-gl-text-warning">🎓 Урок:</span> ${translatedType}</div>
            <div><span class="af-gl-text-accent">📚 Услуга:</span> ${educationService.id} ${srvTitle}</div>
            ${statusHTML}
            ${teacherInfo}
        </div>`;
}

async function fetchAndDisplayLessons(type) {
    const btn = document.getElementById(type === 'future' ? 'getlessonfuture' : 'getlessonpast');
    const out = document.getElementById('timetabledata');
    const userId = getStudentId();
    if (!userId || !btn || !out) return;

    btn.disabled = true;
    out.innerHTML = 'Загрузка...';
    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: LESSONS_CONFIG.apiUrls[type](userId), requestOptions: { method: 'GET' } });
        const data = JSON.parse(response.fetchansver);
        if (!data?.data?.length) {
            out.innerHTML = type === 'future' ? 'Уроки не запланированы' : 'Уроков еще не было';
            return;
        }
        out.innerHTML = data.data.map(l => createFutureLessonHTML(l, type)).join('');
    } catch (e) {
        out.innerHTML = 'Ошибка загрузки';
    } finally {
        btn.disabled = false;
    }
}

document.getElementById('getlessonfuture')?.addEventListener('click', () => fetchAndDisplayLessons('future'));
document.getElementById('getlessonpast')?.addEventListener('click', () => fetchAndDisplayLessons('past'));

// Управление Locale
document.getElementById('changeLocaleLng')?.addEventListener('click', async function () {
    const userId = getStudentId();
    if (!userId) return;
    this.disabled = true; this.innerHTML = '⏳';
    try {
        await sendMessageAsync({
            action: 'getFetchRequest',
            fetchURL: `https://backend.skyeng.ru/api/persons/general/${userId}`,
            requestOptions: { method: 'PUT', body: JSON.stringify({ serviceLocale: 'ru' }), headers: { 'Content-Type': 'application/json' } }
        });
        createAndShowButton('Язык обновлен', 'message');
        this.innerHTML = '✅';
    } catch (e) {
        this.innerHTML = '❌';
    } finally {
        setTimeout(() => { this.innerHTML = '🌍'; this.disabled = false; }, 2000);
    }
});

function getusernamecrm() {
    const sid = idstudentField?.value.trim();
    if (!sid) return;
    window.flagusertype = '';

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/persons/${sid}?crm2=true&debugParam=person-page`, requestOptions: { method: 'GET' } }, function (res) {
        if (!res.success) return alert('Ошибка: ' + res.error);
        const data = JSON.parse(res.fetchansver).data;
        window.flagusertype = data.type;
        const isStudent = data.type === "student";

        document.getElementById('usrName').textContent = `${data.name} ${data.surname || ''}`;
        document.getElementById('usrType').innerHTML = isStudent ? `<span class="af-gl-text-success">🎓 Ученик</span>` : `<span class="af-gl-text-accent">👨‍🏫 Преподаватель</span>`;
        document.getElementById('usrCountry').textContent = data.country || '';

        // Логика отрисовки аватара внутри info-card
        const avatarWrapper = document.getElementById('avatarWrapper');
        const avatarEl = document.getElementById('useravatar');
        if (data.avatarUrl) {
            const matchSrc = data.avatarUrl.match(/https:\/\/cdn-auth-avatars\.skyeng\.ru\/\d+\/[a-f0-9-]+$/)?.[0];
            if (matchSrc) {
                avatarEl.src = matchSrc;
                avatarWrapper.style.display = 'flex';
            } else {
                avatarWrapper.style.display = 'none';
            }
        } else {
            avatarWrapper.style.display = 'none';
        }

        // Переключение блоков для Студент/Препод
        const elsToHide = ['pochtaIdentity', 'telefonIdentity', 'checkBalance', 'partialPaymentinfo', 'subscriptioninfo', 'getPastAndFutureLessons', 'complekttable', 'newTrm', 'butTeacherNabor', 'personalteacherpage'];
        elsToHide.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

        if (isStudent) {
            // ВАЖНО: Добавили 'complekttable' обратно в список элементов, которые нужно показать для студента
            ['checkBalance', 'partialPaymentinfo', 'subscriptioninfo', 'getPastAndFutureLessons', 'pochtaIdentity', 'telefonIdentity', 'complekttable'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });
        } else {
            ['newTrm', 'butTeacherNabor', 'personalteacherpage'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });
            document.getElementById('usrAge').style.display = 'none';
            document.getElementById('servicetable').innerHTML = '';
        }

        const locale = data.serviceLocale || "⭕";
        document.getElementById('usrServLang').textContent = locale;
        document.getElementById('changeLocaleLng').style.display = locale === "ru" ? "none" : "";

        document.getElementById('utcOffset').textContent = data.utcOffset;
        document.getElementById('UTCtoMSK').textContent = data.utcOffset - 3;
        document.getElementById('localTime').textContent = new Date(Date.now() + data.utcOffset * 3600000).toISOString().substr(11, 5);

        let ageIco = "❓";
        if (data.birthday) {
            const age = new Date().getFullYear() - Number(data.birthday.split('-')[0]);
            ageIco = age < 18 ? "🔞" : age < 99 ? "🅰️" : "❓";
        }
        document.getElementById('usrAge').textContent = ageIco;
    });
}

function crmstatus() {
    const userId = idstudentField?.value.trim();
    if (!userId) return;
    const statusEl = document.getElementById('getcurrentstatus');
    const crmEl = document.getElementById('CrmStatus');
    statusEl.style.display = 'none'; crmEl.style.display = 'none';

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://customer-support.skyeng.ru/task/user/${userId}`, requestOptions: { method: 'GET' } }, function (res) {
        if (!res.success) return;
        const tasks = JSON.parse(res.fetchansver).data;
        let flags = { tpOut: false, tp: false, notTp: false, wait: false, processing: false, operator: '' };

        tasks.forEach(task => {
            if (task.operatorGroup.name === 'technical_support_outgoing') {
                flags.tpOut = true;
                if (task.status === 'waiting') flags.wait = true;
                if (task.status === 'processing') { flags.processing = true; flags.operator = task.operator.name; }
            } else if (task.operatorGroup.name === 'technical_support_first_line') {
                flags.tp = true;
            } else { flags.notTp = true; }
        });

        if (flags.wait) { statusEl.style.display = ''; statusEl.innerText = 'В ожидании'; statusEl.className = 'af-gl-badge af-gl-bg-info'; }
        else if (flags.processing) { statusEl.style.display = ''; statusEl.innerText = 'Решается'; statusEl.className = 'af-gl-badge af-gl-bg-danger'; statusEl.title = flags.operator; }

        let icon = '📵';
        if (flags.tpOut && !flags.tp && !flags.notTp) icon = '💥';
        else if (!flags.tpOut && flags.tp && !flags.notTp) icon = '🛠';
        else if (flags.tpOut && flags.tp) icon = '💥';
        else if (flags.tp && flags.notTp && !flags.tpOut) icon = '🛠';

        crmEl.style.display = ''; crmEl.innerText = icon;
    });
}

async function getservices(stidNew) {
    const servTable = document.getElementById('servicetable');
    const compTable = document.getElementById('cmplData');
    const linkTable = document.getElementById('complekttable');

    servTable.innerHTML = "Загрузка...";
    compTable.innerHTML = "";
    linkTable.innerHTML = "";

    // --- 1. ЗАПРОС КОМПЛЕКТАЦИЙ ---
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/v1/students/${stidNew}/education-service-kits/`, requestOptions: { method: 'GET' } }, function (res) {
        if (!res.success) return;
        const data = JSON.parse(res.fetchansver);

        if (data.data.length > 0) {
            linkTable.innerHTML += `<div id="openOneComplectation" class="af-gl-card cursor-pointer af-gl-bg-success" style="text-align:center;">✅ Есть комплектации >>></div>`;
            document.getElementById('openOneComplectation')?.addEventListener('click', () => {
                const w = document.getElementById('AF_Complectations');
                w.style.display = w.style.display === "none" ? "" : "none";
            });

            data.data.forEach(service => {
                if (service.incorrectnessReason == null) {
                    let sHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 5px;">`;
                    service.educationServices.forEach(el => {
                        let { formattedText } = typeof formatServiceType === 'function' ? formatServiceType(el.serviceTypeKey) : { formattedText: el.serviceTypeKey };
                        sHtml += `<tr>
                            <td class="af-gl-text-accent"><a href="https://crm2.skyeng.ru/persons/${service.student.general.id}/services/${el.id}" target="_blank" style="color:inherit;">${el.id}</a></td>
                            <td>${formattedText}</td>
                            <td>${el.balance}</td>
                            <td style="text-align: right; width: 30px;">
                                <span class="cursor-pointer btn-sync-srv" data-srvid="${el.id}" title="Синхронизировать">♻️</span>
                            </td>
                        </tr>`;
                    });
                    sHtml += `</table>`;

                    let opNote = service.operatorNote ? `title="${service.operatorNote.replace(/"/g, '&quot;')}"` : "";

                    compTable.innerHTML += `<div class="af-gl-card" style="margin-bottom:8px;">
                        <div class="af-gl-card-header af-gl-bg-success" ${opNote}>
                            ℹ️ [${service.id}] ${service.productKit.title} | ${service.stage === "regular_lessons" ? "Регулярные" : service.stage === "lost" ? "Потерянная" : service.stage}
                        </div>
                        ${sHtml}
                    </div>`;
                } else {
                    compTable.innerHTML += `<div class="af-gl-card af-gl-bg-danger" style="margin-bottom:8px; text-align:center;">[${service.id}] '${service.productKit.title}' - некорректна</div>`;
                }
            });

            // ВОЗВРАЩАЕМ ЛОГИКУ КНОПКИ ♻️ (Синхронизация)
            document.querySelectorAll('.btn-sync-srv').forEach(btn => {
                btn.onclick = function () {
                    const srvId = this.getAttribute('data-srvid');
                    const emojiSpan = this;

                    emojiSpan.innerText = "⏳";
                    const gToken = localStorage.getItem('token_global');

                    const fetchURL = `https://skysmart-core.skyeng.ru/api/v1/academic-activity/upsert-education-service-history/${srvId}`;
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
                            alert('Не удалось выполнить запрос: ' + response.error + '. Если запускали синхронизацию через расширение, то необходимо после закрытия окна повторно открыть в новой вкладке CRM на 5 секунд. После чего вернуться в окно AF и обновить страницу');
                            emojiSpan.innerText = "❌";
                            localStorage.removeItem('token_global');
                        } else {
                            emojiSpan.innerText = "✅";
                            setTimeout(() => { emojiSpan.innerText = "♻️"; }, 5000);
                        }
                    });
                };
            });

        } else {
            linkTable.innerHTML += `<div class="af-gl-card af-gl-bg-danger" style="text-align:center;">❌ Нет комплектаций</div>`;
        }
    });

    // --- 2. ЗАПРОС ОБЫЧНЫХ УСЛУГ ---
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/persons/${stidNew}/education-services/`, requestOptions: { method: 'GET' } }, function (res) {
        if (!res.success) return;
        const data = JSON.parse(res.fetchansver);

        if (data.data.length > 0) {
            let htmlStr = `<div style="font-weight:bold; margin-bottom: 8px; font-size: 14px;" class="af-gl-text-accent">Информация об услугах:</div>`;
            let arrservice = [];

            let srvKeyMap = new Map((servicecontainer?.data || []).map(d => [d.serviceTypeKey, d.shortTitle]));

            data.data.forEach((service, i) => {
                if (srvKeyMap.has(service.serviceTypeKey)) service.serviceTypeKey = srvKeyMap.get(service.serviceTypeKey);
                if (service.student.general.id != stidNew || service.incorrectnessReason != null) return;

                const sType = service.serviceTypeKey;
                const ignoreTypes = ["Англ Talks 15 min", "Skyeng Space", "Групповые онлайн-мероприятия Life", "Скрининг", "Англ adult АЯ Даунсейл"];

                if (ignoreTypes.includes(sType)) return;

                arrservice.push(service.id);

                if (service.stage === "after_trial" || service.stage === "before_call") {
                    htmlStr += `<div class="af-gl-card af-gl-bg-vu" style="margin-bottom: 10px;">
                        <div class="af-gl-card-header">Этап ВУ | 💰 Баланс: ${service.balance}</div>
                        <div>${i + 1}) 🆔: ${service.id} <span class="copyserviceid cursor-pointer" data-sid="${service.id}" style="font-size:16px;">💾</span></div>
                        <div class="af-gl-text-warning" style="margin-top: 4px;">💡: ${sType}</div>
                    </div>`;
                } else if (service.stage === "regular_lessons") {
                    const t = service.teacher ? `👨‍🏫 ${service.teacher.general.id}, ${service.teacher.general.name} ${service.teacher.general.surname}` : `👨‍🏫 Не закреплен!`;
                    const tmp = service.temporaryTeacher ? `<br>⏳ ${service.temporaryTeacher.general.id}, ${service.temporaryTeacher.general.name} ${service.temporaryTeacher.general.surname}` : '';
                    htmlStr += `<div class="af-gl-card af-gl-bg-regular" style="margin-bottom: 10px;">
                        <div class="af-gl-card-header">Регулярные занятия | 💰 Баланс: ${service.balance}</div>
                        <div>${i + 1}) 🆔: ${service.id} <span class="copyserviceid cursor-pointer" data-sid="${service.id}" style="font-size:16px;">💾</span></div>
                        <div class="af-gl-text-warning" style="margin-top: 4px; margin-bottom: 4px;">💡: ${sType}</div>
                        <div class="af-gl-text-muted">${t}${tmp}</div>
                    </div>`;
                } else if (service.stage === "lost") {
                    htmlStr += `<div class="af-gl-card af-gl-bg-lost" style="margin-bottom: 10px;">
                        <div class="af-gl-card-header">Потерянная услуга | 💰 Баланс: ${service.balance}</div>
                        <div>${i + 1}) 🆔: ${service.id} <span class="copyserviceid cursor-pointer" data-sid="${service.id}" style="font-size:16px;">💾</span></div>
                        <div class="af-gl-text-warning" style="margin-top: 4px;">💡: ${sType}</div>
                    </div>`;
                }
            });
            servTable.innerHTML = htmlStr;

            document.querySelectorAll('.copyserviceid').forEach(btn => {
                btn.onclick = () => copyToClipboard(btn.dataset.sid);
            });

            document.getElementById('getusremail').onclick = () => {
                const text = document.getElementById('mailunhidden').textContent;
                copyToClipboard(text);
                createAndShowButton(`Почта ${text} скопирована`, 'message');
            };
            document.getElementById('getusrphone').onclick = () => {
                const text = document.getElementById('phoneunhidden').textContent;
                copyToClipboard(text);
                createAndShowButton(`Телефон ${text} скопирован`, 'message');
            };
        } else {
            servTable.innerHTML = `<div class="af-gl-card af-gl-bg-danger" style="text-align:center;">Услуг вообще нет!</div>`;
        }
    });
}

function getuserinfo() {
    ['pochtaIdentity', 'telefonIdentity', 'mailunhidden', 'phoneunhidden', 'usrType', 'usrAge', 'usrName', 'usrCountry', 'getcurrentstatus']
        .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = id.includes('hidden') ? 'hidden' : ''; });
    document.getElementById('servicetable').innerHTML = "Загрузка...";

    const avaWrapper = document.getElementById('avatarWrapper');
    if (avaWrapper) avaWrapper.style.display = "none";

    stid = idstudentField?.value.trim();
    if (!stid) return;

    setTimeout(getusernamecrm, 640);
    setTimeout(crmstatus, 700);
    setTimeout(() => {
        if (window.flagusertype === "teacher") {
            document.getElementById('servicetable').innerHTML = '';
        } else {
            getservices(stid);
        }
    }, 720);
}

document.getElementById('getidstudent')?.addEventListener('click', () => {
    getuserinfo();
});

idstudentField?.addEventListener('paste', (e) => {
    idstudentField.value = '';
    const pastedValue = (e.clipboardData || e.dataTransfer).getData('text').trim();
    setTimeout(() => {
        if (/^\d+$/.test(pastedValue)) {
            idstudentField.value = pastedValue;
            document.getElementById('getidstudent')?.click();
        }
    }, 0);
});
idstudentField?.addEventListener('input', () => { if (typeof onlyNumber === 'function') onlyNumber(idstudentField); });

document.getElementById('clearservinfo')?.addEventListener('click', () => {
    ['idstudent', 'timetabledata'].forEach(id => { const el = document.getElementById(id); if (el) el.value = el.innerText = ""; });['servicetable', 'usrType', 'usrAge', 'usrName', 'telefonIdentity', 'pochtaIdentity', 'usrCountry', 'mailunhidden', 'phoneunhidden']
        .forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ""; });
    ['CrmStatus', 'getcurrentstatus', 'AF_Timetable'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = "none"; });

    const avaWrapper = document.getElementById('avatarWrapper');
    if (avaWrapper) avaWrapper.style.display = "none";
});

document.getElementById('catchathistory')?.addEventListener('click', () => {
    document.getElementById('opennewcat')?.click();
    const cInput = document.getElementById('chatuserhis');
    if (cInput) cInput.value = idstudentField?.value.trim() || '';
    document.getElementById('btn_search_history')?.click();
});

document.getElementById('crmactivetasks')?.addEventListener('click', () => window.open(`https://crm2.skyeng.ru/persons/${idstudentField?.value.trim()}/customer-support/list`));
document.getElementById('newTrm')?.addEventListener('click', () => window.open(`https://trm.skyeng.ru/teacher/${idstudentField?.value.trim()}`));
document.getElementById('personalteacherpage')?.addEventListener('click', () => window.open(`https://skyeng.ru/teachers/id/${idstudentField?.value.trim()}`));

document.getElementById('getPastAndFutureLessons')?.addEventListener('click', () => {
    const tt = document.getElementById('AF_Timetable');
    if (tt) tt.style.display = tt.style.display === '' ? 'none' : '';
    document.getElementById('getlessonfuture')?.click();
});

document.getElementById('getloginer')?.addEventListener('click', async function () {
    const id = idstudentField?.value.trim();
    if (!id) return;
    this.style.background = "rgba(255, 165, 0, 0.4)";
    try {
        if (typeof getLoginLink === 'function') await getLoginLink(id);
        this.style.background = "rgba(0, 128, 0, 0.5)";
        createAndShowButton('💾 Ссылка-логинер cкопирована', 'message');
    } catch (e) {
        this.style.background = "rgba(255, 0, 0, 0.5)";
        alert('Не удалось получить логиннер: ' + e.message);
    } finally {
        setTimeout(() => this.style.background = "transparent", 2000);
    }
});