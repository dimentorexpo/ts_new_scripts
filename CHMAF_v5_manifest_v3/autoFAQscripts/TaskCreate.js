// --- CSS СТИЛИ ДЛЯ GLASSMORPHISM ---
const glassStylesTask = `
<style>
    .glass-panel-task {
        background: rgba(45, 47, 56, 0.7);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.15);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35);
        color: bisque;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        padding: 10px;
        box-sizing: border-box;
    }
    .glass-btn-task {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        color: #fff;
        padding: 6px 12px;
        transition: all 0.3s ease;
        cursor: pointer;
        outline: none;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .glass-btn-task:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.4);
        transform: translateY(-2px);
    }
    .glass-btn-task:active {
        transform: translateY(1px);
    }
    .glass-input-task,
    .glass-select-task,
    .glass-textarea-task {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 8px;
        color: #fff;
        padding: 8px;
        outline: none;
        transition: all 0.3s ease;
        width: 100%;
        box-sizing: border-box;
    }
    .glass-input-task::placeholder,
    .glass-textarea-task::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
    .glass-input-task:focus,
    .glass-select-task:focus,
    .glass-textarea-task:focus {
        background: rgba(0, 0, 0, 0.3);
        border-color: rgba(105, 164, 199, 0.8);
        box-shadow: 0 0 10px rgba(105, 164, 199, 0.3);
    }
    .glass-textarea-task {
        resize: vertical;
        min-height: 80px;
    }
    .err-shake-task {
        animation: shake 0.4s;
        border-color: #ff4d4d !important;
        background: rgba(255, 77, 77, 0.15) !important;
    }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
    }
    /* Кастомный красивый скроллбар */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.1); border-radius: 4px; }
    ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }

    .status-badge-task {
        padding: 4px 8px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 12px;
        display: inline-block;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .btn-row-task {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
        gap: 6px;
    }
    .btn-row-task .glass-btn-task {
        flex: 1;
        font-size: 13px;
        padding: 6px;
    }
</style>
`;

var win_taskform = `
    ${glassStylesTask}
    <div style="display: flex; width: 420px; position: relative;">
        <div class="glass-panel-task" style="width: 100%; position: relative; z-index: 2;">
            <div style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;" id="create_form_header">
                <button class="glass-btn-task" title="Скрыть меню" id="hideMeCreateForm">👁️ Hide</button>
                <button class="glass-btn-task" title="Обновить хеш чата" id="refreshhashcreateform">♻</button>
                <button class="glass-btn-task" title="Очистить форму" id="clearcreateform">🧹</button>
                <span style="font-size: 13px; margin-left: auto;">Статус: <span id="statusuroka" class="status-badge-task" style="background: #69a4c7;">Загрузка...</span></span>
            </div>

            <div id="addcreateformbtns" style="margin-bottom: 15px;">
                <div class="btn-row-task">
                    <button class="glass-btn-task" id="critteachertostudent">🔴 👽П -&gt; У👨‍🎓</button>
                    <button class="glass-btn-task" id="critstudenttoteacher">🔴 👨‍🎓У -&gt; П👽</button>
                </div>
                <div class="btn-row-task">
                    <button class="glass-btn-task" id="critteacherno">🔴 👽П н.о.</button>
                    <button class="glass-btn-task" id="critstudentno">🔴 👨‍🎓У н.о.</button>
                </div>
                <div class="btn-row-task">
                    <button class="glass-btn-task" id="highteachersc">👽 Исх. (SC)</button>
                    <button class="glass-btn-task" id="highteachertc">👽 Teachers Care</button>
                </div>
                <div class="btn-row-task">
                    <button class="glass-btn-task" id="highsecondline" style="flex: 1.5;">🗓 Календарь У/П</button>
                    <button class="glass-btn-task" id="lowkm">😡 КМ</button>
                    <button class="glass-btn-task" id="highprem">🅿️ Prem</button>
                    <button class="glass-btn-task" id="low2lvimbug">🐞2Л vim</button>
                </div>
            </div>

            <div id="create_form_menu" style="display: flex; flex-direction: column; gap: 8px;">
                <input class="glass-input-task ${exttheme}" disabled id="chathashlnk" placeholder="Хэш чата" autocomplete="off" style="text-align: center;">

                <select class="glass-select-task ${exttheme}" id="priority" style="text-align: center;">
                    <option disabled selected value="">Укажите Приоритет</option>
                    <option value="low" style="color: #4CAF50; font-weight:600">🟢 Низкий</option>
                    <option value="high" style="color: #FFC107; font-weight:600">🟡 Высокий</option>
                    <option value="highest" style="color: #F44336; font-weight:600">🔴 Критический</option>
                </select>

                <select class="glass-select-task ${exttheme}" id="customerservice" style="text-align: center;">
                    <option disabled selected value="">Укажите Отдел</option>
                    <option value="tech_support_outgoing_crm2" style="color: #F44336;">🛠️ Техподдержка 1Л CRM (исход)</option>
                    <option value="teachers_care_crm">👽 Teachers Care</option>
                    <option value="content_management">📄 Контент</option>
                    <option value="outgoing_calls_crm2">📞 Исходящие звонки (КЦ исход)</option>
                    <option value="tech_support_second_line_crm2" style="color: #4CAF50;">🥈 Техподдержка 2Л CRM</option>
                    <option value="crisis_manager">😡 Кризис менеджеры</option>
                    <option value="personal_support">🅿️ Персональное сопровождение (Premium)</option>
                </select>

                <input class="glass-input-task ${exttheme}" id="taskserviceid" placeholder="🆔 ID услуги">

                <div style="display: flex; gap: 8px;">
                    <input class="glass-input-task ${exttheme}" id="taskuserid" placeholder="🆔 ID пользователя">
                    <button class="glass-btn-task" id="searchuserservices" title="Найти услуги">🔎</button>
                </div>

                <div id="NoteNoticeWrap" style="font-size: 13px; display: none; background: rgba(105, 164, 199, 0.3); padding: 6px; border-radius: 6px;">
                    <span style="color: bisque;">Будет добавлена заметка: </span>
                    <span id="NoteNoticeText" title="Нажми для отмены" style="color: #fff; cursor: pointer; text-decoration: underline;"></span>
                </div>

                <button class="glass-btn-task" style="display:none; background: rgba(76, 175, 80, 0.4);" id="taskcreate2linecrm">Создать задачу на 2ЛТП по календарю</button>

                <textarea class="glass-textarea-task ${exttheme}" id="taskcomment" placeholder="Комментарий к задаче" autocomplete="off"></textarea>

                <div class="btn-row-task" style="margin-top: 5px;">
                    <button class="glass-btn-task" id="studcontact">Обр П ➔ У</button>
                    <button class="glass-btn-task" id="teachcontact">Обр У ➔ П</button>
                    <button class="glass-btn-task" id="nrteacher">Крит П Н.О</button>
                    <button class="glass-btn-task" id="nrstudent">Крит У Н.О</button>
                </div>

                <button class="glass-btn-task" id="createtask" style="background: rgba(210, 105, 30, 0.8); font-weight: bold; font-size: 15px; padding: 10px; margin-top: 5px;">🚀 Отправить задачу</button>
            </div>
        </div>

        <div id="servicehelper" class="glass-panel-task srvhhelpnomove" style="position: absolute; top: 0; left: -320px; width: 310px; max-height: 500px; overflow-y: auto; z-index: 1;">
            <div style="display: flex; gap: 5px; margin-bottom: 10px;">
                <input class="glass-input-task ${exttheme}" id="useriddata" placeholder="ID студента (услуги)">
                <button class="glass-btn-task" id="getuserservices">🔎</button>
            </div>
            <div id="serviceinf" style="display: flex; flex-direction: column; gap: 8px;"></div>
            <div id="serviceComplinf" style="margin-top: 10px;"></div>
        </div>
    </div>`;

var win_speccommwindow = `
    ${glassStylesTask}
    <div class="glass-panel-task" style="width: 350px; cursor: -webkit-grab;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 5px;">
            <button title="Скрыть меню" id="hideMeSpecComm" class="glass-btn-task" style="padding: 2px 8px; font-size: 12px;">✖ Close</button>
        </div>
        <div id="speccommtext" style="font-size: 14px; max-height: 300px; overflow-y: auto; padding: 5px; word-wrap: break-word;"></div>
    </div>`;

// Глобальные переменные
var NoteFlag = 0;
var NoteText = '';
var srvcont = null;

// Инициализация окон (твоя внешняя функция createWindow)
const wintCreateTask = createWindow('AF_Createtask', 'winTopTaskCreate', 'winLeftTaskCreate', win_taskform);
const winSpecCommWindow = createWindow('AF_SpecCommWindow', 'winTopSpecCommWindow', 'winLeftSpecCommWindow', win_speccommwindow);

// Обработчики двойного клика для скрытия
document.getElementById('AF_SpecCommWindow').ondblclick = (a) => {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') document.getElementById('hideMeSpecComm').click();
};
document.getElementById('AF_Createtask').ondblclick = (a) => {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') document.getElementById('hideMeCreateForm').click();
};

document.getElementById('hideMeSpecComm').onclick = () => {
    document.getElementById('AF_SpecCommWindow').style.display = 'none';
    document.getElementById('speccommtext').innerHTML = '';
};

function handleSpecCommentClick(text) {
    document.getElementById('speccommtext').innerHTML = text;
    document.getElementById('AF_SpecCommWindow').style.display = '';
}

// Защита от ввода не-цифр (твоя функция onlyNumber)
['taskserviceid', 'taskuserid', 'useriddata'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => onlyNumber(e.target));
});
// Утилита для выполнения API запросов с Promise (избавляет от вложенностей)
const sendBgRequest = (url, options = { method: 'GET' }) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url, requestOptions: options }, (response) => {
            if (!response || !response.success) reject(new Error(response?.error || 'Unknown error'));
            else resolve(JSON.parse(response.fetchansver));
        });
    });
};

function doHideForm(flag = localStorage.getItem('hideTaskWindow')) {
    if (location.href.indexOf('skyeng.autofaq.ai/tickets/assigned') !== -1) {
        if (flag == 1) {
            let newFrontend = document.getElementsByTagName('iframe');
            if (newFrontend.length > 0 && document.getElementsByTagName('iframe')[0].contentDocument.children.length > 0) {
                newFrontend = document.getElementsByTagName('iframe')[0].contentDocument.children[0].children[1].children
                for (let g = 0; g < newFrontend.length; g++) {
                    if (newFrontend[g].innerText.split('\n')[0] == "Создать задачу") {
                        newFrontend[g].children[0].children[0].style.display = "none"
                    }
                }
            }

        }
    }
}

// ГЛАВНАЯ ФУНКЦИЯ
async function gettaskButButtonPress() {
    let conversid;
    document.getElementById('serviceinf').innerHTML = '';

    if (document.getElementById('AF_Createtask').style.display === 'none') {
        document.getElementById('AF_Createtask').style.display = '';
        if (typeof taskBut !== 'undefined') taskBut.classList.add('activeScriptBtn');

        // Запрашиваем конфигурацию (Один раз при открытии)
        if (!srvcont) {
            try {
                srvcont = await sendBgRequest(`https://backend.skyeng.ru/api/products/configurations/`);
            } catch (e) {
                console.error("Ошибка загрузки конфигураций:", e);
            }
        }

        // Кнопка поиска услуг (Лупа)
        document.getElementById('getuserservices').onclick = async () => {
            const idshka = document.getElementById('useriddata').value.trim();
            if (!idshka) return;

            document.getElementById('serviceinf').innerHTML = '<div style="text-align:center;">⏳ Загрузка...</div>';
            document.getElementById('serviceComplinf').innerHTML = "";
            const complectationServInfo = document.getElementById('cmplData');
            if (complectationServInfo) complectationServInfo.innerHTML = "";

            try {
                const [otvetEdServ, chechkComplectations] = await Promise.all([
                    sendBgRequest(`https://backend.skyeng.ru/api/persons/${idshka}/education-services/`),
                    sendBgRequest(`https://backend.skyeng.ru/api/v1/students/${idshka}/education-service-kits/`)
                ]);

                document.getElementById('serviceinf').innerHTML = ''; // Очистка после загрузки

                // Рендер регулярных услуг
                if (otvetEdServ?.data && srvcont?.data) {
                    otvetEdServ.data.forEach(srv => {
                        const config = srvcont.data.find(c => c.serviceTypeKey === srv.serviceTypeKey);
                        if (config) srv.serviceTypeKey = config.shortTitle;

                        if (srv.incorrectnessReason == null) {
                            let balance = srv.balance ?? '0';
                            let studentInfo = `${srv.student.general.id} ${srv.student.general.name || ''} ${srv.student.general.surname || ''}`;
                            let teacherInfo = srv.teacher ? `${srv.teacher.general.id} ${srv.teacher.general.name} ${srv.teacher.general.surname}` : '—';

                            let stageObj = { bg: '#2b602b', text: 'bisque', title: 'Регулярные занятия' }; // regular_lessons
                            if (srv.stage === 'lost') stageObj = { bg: '#5a0f77', text: 'bisque', title: 'Потерянная услуга' };
                            else if (["after_trial", "before_call"].includes(srv.stage)) stageObj = { bg: '#d59f34', text: '#fff', title: 'Этап ВУ' };

                            let html = `
                                <div class="glass-panel-task srvhhelpnomove outservfield-item" data-id="${srv.id}" style="background: ${stageObj.bg}; color: ${stageObj.text}; font-size: 13px; border-color: rgba(255,255,255,0.2);">
                                    <div style="text-align:center; background: rgba(0,0,0,0.4); padding: 4px; border-radius: 4px; margin-bottom: 4px;">
                                        ${stageObj.title} <span class="specomment-btn" data-id="${srv.id}" style="cursor:pointer;" title="Спец. комментарий">💭</span> | 💰 Баланс: ${balance}
                                    </div>
                                    🆔 <span style="font-weight: bold;">${srv.id}</span> — ${srv.serviceTypeKey}
                                    <span class="movetoservid-btn" title="Перенести ID" style="cursor:pointer; float:right; font-size: 16px;">➡️</span><br>
                                    👨‍🎓 Студент: ${studentInfo}<br>
                                    👽 Препод: ${teacherInfo}
                                </div>`;
                            document.getElementById('serviceinf').insertAdjacentHTML('beforeend', html);
                        }
                    });
                }

                // Рендер комплектаций
                if (chechkComplectations?.data?.length > 0) {
                    let lnkTaskCrCompl = document.getElementById('serviceComplinf');
                    lnkTaskCrCompl.innerHTML = '<div id="openComplectationTaskCreate" class="glass-btn" style="background: rgba(78, 120, 145, 0.8); text-align:center;">✅ Открыть комплектации ➔</div>';

                    document.getElementById('openComplectationTaskCreate').addEventListener('click', () => {
                        let getComplWindow = document.getElementById('AF_Complectations');
                        if (getComplWindow) getComplWindow.style.display = getComplWindow.style.display === "none" ? "" : "none";
                    });

                    chechkComplectations.data.forEach(service => {
                        if (service.incorrectnessReason == null && complectationServInfo) {
                            let tableHTML = `<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 5px;">`;
                            tableHTML += `<tr style="background: rgba(0,0,0,0.5); border-bottom: 1px solid #555;">
                                <th>ID</th><th>STK</th><th>Урок</th><th>СК</th><th></th></tr>`;

                            service.educationServices.forEach(el => {
                                let { formattedText, lessontype } = formatServiceType(el.serviceTypeKey);
                                tableHTML += `
                                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                                    <td style="padding: 4px;"><a href="https://crm2.skyeng.ru/persons/${service.student.general.id}/services/${el.id}" target="_blank" style="color:#69a4c7;">${el.id}</a></td>
                                    <td>${formattedText}</td>
                                    <td data-id="${el.id}" lessontype="${lessontype}" class="complect-nextlesson">⏳</td>
                                    <td class="specomment-compl" data-id="${el.id}" style="cursor:pointer;">💭</td>
                                    <td class="insert-complect-id" data-id="${el.id}" style="cursor:pointer;">➡️</td>
                                </tr>`;
                            });
                            tableHTML += '</table>';
                            complectationServInfo.insertAdjacentHTML('beforeend',
                                `<div class="glass-panel-task" style="margin-bottom: 8px; background: rgba(74, 125, 85, 0.6); padding: 5px;">
                                    <div style="text-align: center; font-weight: bold;">${service.productKit.title} | ${service.stage}</div>
                                    ${tableHTML}
                                </div>`);
                        }
                    });
                }

                // Перенос ID в инпут
                document.querySelectorAll('.movetoservid-btn, .insert-complect-id').forEach(btn => {
                    btn.onclick = (e) => {
                        const targetId = e.target.closest('[data-id]').getAttribute('data-id');
                        if (document.getElementById('taskserviceid')) document.getElementById('taskserviceid').value = targetId;
                        validateField(document.getElementById('taskserviceid'), true); // Снимаем подсветку ошибки
                    };
                });

                // Загрузка Спец. комментариев
                document.querySelectorAll('.specomment-btn, .specomment-compl').forEach(btn => {
                    btn.onclick = async (e) => {
                        const servId = e.target.getAttribute('data-id');
                        try {
                            const specData = await sendBgRequest(`https://backend.skyeng.ru/api/students/${idshka}/education-services/${servId}/general/`);
                            let note = specData?.data?.operatorNote;
                            if (!note) {
                                e.target.innerText = '❌';
                                return;
                            }
                            note = note.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
                            if (note.toLowerCase().includes("звон")) {
                                note = highlightSearchText(note, "звон");
                                e.target.innerText = '⚠️';
                            }
                            handleSpecCommentClick(note);
                        } catch (err) {
                            e.target.innerText = '❌';
                        }
                    };
                });

                // Подгрузка будущих уроков
                document.querySelectorAll('.complect-nextlesson').forEach(async el => {
                    let eduservise = el.getAttribute('data-id');
                    let lessontype = el.getAttribute('lessontype');
                    let url = lessontype === 'f2f'
                        ? `https://backend.skyeng.ru/api/students/education-services/${eduservise}/timetable/future-lessons/`
                        : `https://backend.skyeng.ru/api/students/education-services/${eduservise}/timetable/group/future-lessons/`;

                    try {
                        const ttData = await sendBgRequest(url);
                        if (ttData?.data?.length > 0 && ttData.data[0].startedAt) {
                            const lessonDateObj = new Date(ttData.data[0].startedAt);
                            const formatter = new Intl.DateTimeFormat('ru-RU', {
                                timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                            });
                            el.innerText = formatter.format(lessonDateObj);

                            const now = new Date();
                            const diffMinutes = (now - lessonDateObj) / (1000 * 60);
                            if (diffMinutes >= -50 && diffMinutes <= 10) {
                                el.style.color = '#ff4d4d';
                                el.style.fontWeight = 'bold';
                            }
                        } else {
                            el.innerText = '—';
                        }
                    } catch { el.innerText = '—'; }
                });

            } catch (e) {
                document.getElementById('serviceinf').innerHTML = `<div style="color:red; text-align:center;">Ошибка: ${e.message}</div>`;
            }
        };

        // Связка поля пользователя с поисковиком
        document.getElementById('searchuserservices').onclick = () => {
            let val = document.getElementById('taskuserid').value.replace(/\D/g, '');
            if (val.length > 4) {
                document.getElementById('useriddata').value = val;
                document.getElementById('getuserservices').click();
            }
        };

        // Заполнение текущего чата
        let activeConvId = getChatId();
        if (activeConvId) {
            document.getElementById('chathashlnk').value = activeConvId;
            sendAutofaqAction(activeConvId, [{ name: "buttonId", isFile: false, value: "b49609f3-9ff7-4ba5-a8a8-f2cef770bf19" }], true);
        }

        document.getElementById('refreshhashcreateform').onclick = () => {
            let id = getChatId();
            document.getElementById('chathashlnk').value = id || '';
            const lessonStatus = SearchinAFnewUI("nextClass-statusHTML") || "";
            const statusEl = document.getElementById('statusuroka');
            if (lessonStatus.includes("идет") || lessonStatus.includes("идёт")) {
                statusEl.innerHTML = "Урок идет 🔴";
                statusEl.style.background = "#d32f2f";
            } else {
                statusEl.innerHTML = "Урок не идет 🔵";
                statusEl.style.background = "#69a4c7";
            }
        };
        document.getElementById('refreshhashcreateform').click();

        document.getElementById('hideMeCreateForm').onclick = () => {
            document.getElementById('AF_Createtask').style.display = 'none';
            if (typeof taskBut !== 'undefined') taskBut.classList.remove('activeScriptBtn');
            if (document.getElementById('AF_Complectations')) document.getElementById('AF_Complectations').style.display = 'none';
            document.getElementById('hideMeSpecComm').click();

            if (activeConvId) sendAutofaqAction(activeConvId);
        };

        document.getElementById('priority').onchange = (e) => {
            const el = e.target;
            el.style.color = el.options[el.selectedIndex].style.color || '#fff';
            el.classList.remove('err-shake');
        };

        // Универсальная функция применения пресетов
        const applyPreset = (prioVal, deptVal, noteText, commentPrefix, assignUsluga = true, useNextClassId = false) => {
            document.getElementById('priority').value = prioVal;
            document.getElementById('priority').dispatchEvent(new Event('change'));
            document.getElementById('customerservice').value = deptVal;

            if (noteText) { NoteFlag = 1; NoteText = noteText; NoteNoticeSet(); }
            else NoteNoticeClear();

            document.getElementById('taskuserid').value = SearchinAFnewUI(useNextClassId ? "nextClass-studentId" : "id") || "";
            if (assignUsluga) {
                document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId") || "";
            } else {
                document.getElementById('taskserviceid').value = "";
            }

            let comEl = document.getElementById('taskcomment');
            if (commentPrefix) {
                comEl.value = comEl.value ? comEl.value + "\n" + commentPrefix : commentPrefix;
            }
        };

        // ИСПРАВЛЕНИЕ: Кнопки пресетов теперь направляют в Техподдержку 1Л Исход.
        document.getElementById('critteachertostudent').onclick = () => applyPreset('highest', 'tech_support_outgoing_crm2', 'Обратился П. Связаться с У.', 'Проверил связь с П, все ок, свяжитесь с У! КРИТ', true, true);
        document.getElementById('critstudenttoteacher').onclick = () => applyPreset('highest', 'tech_support_outgoing_crm2', 'Обратился У. Связаться с П.', 'Проверил связь с У, все ок, свяжитесь с П! КРИТ', true, false);
        document.getElementById('critteacherno').onclick = () => applyPreset('highest', 'tech_support_outgoing_crm2', 'Крит Н.О. П', 'Неполадка со стороны П. в чате н.о. Пожалуйста, свяжитесь с П КРИТ', true, true);
        document.getElementById('critstudentno').onclick = () => applyPreset('highest', 'tech_support_outgoing_crm2', 'Крит Н.О. У', 'Неполадка со стороны У. в чате н.о. Пожалуйста, свяжитесь с У КРИТ', true, false);

        document.getElementById('highsecondline').onclick = () => applyPreset('high', 'tech_support_second_line_crm2', null, 'Дата и время календаря:\nПриоритетный способ связи:\nОписание неполадки:\nЧто было сделано:', false, false);
        document.getElementById('highteachertc').onclick = () => applyPreset('high', 'teachers_care_crm', null, null, false, false);
        document.getElementById('highteachersc').onclick = () => applyPreset('high', 'outgoing_calls_crm2', null, null, false, false);
        document.getElementById('lowkm').onclick = () => applyPreset('low', 'crisis_manager', null, null, true, false);
        document.getElementById('highprem').onclick = () => applyPreset('high', 'personal_support', null, null, true, false);
        document.getElementById('low2lvimbug').onclick = () => applyPreset('low', 'tech_support_second_line_crm2', null, 'Краткое описание:\nШаги воспроизведения:\nОП:\nФП:\nСсылки на скриншоты:\nНужна ли ОС:', false, false);

        const validateField = (el, condition) => {
            if (!condition) {
                el.classList.add('err-shake-task');
                // Убираем класс через 450мс, чтобы можно было вызвать анимацию повторно
                setTimeout(() => el.classList.remove('err-shake-task'), 450);
                return false;
            }
            el.classList.remove('err-shake-task'); // Если поле валидно, убираем подсветку
            return true;
        };

        // Отправка формы Autofaq
        document.getElementById('createtask').onclick = async function () {
            let chathash = document.getElementById('chathashlnk');
            let priority = document.getElementById('priority');
            let cs = document.getElementById('customerservice');
            let tservid = document.getElementById('taskserviceid');
            let tuserid = document.getElementById('taskuserid');
            let comment = document.getElementById('taskcomment');

            // Сбрасываем старые ошибки перед новой проверкой
            [chathash, priority, cs, tservid, tuserid, comment].forEach(el => el.classList.remove('err-shake-task'));

            let isValid = true;

            // Базовые проверки
            isValid &= validateField(chathash, chathash.value.length >= 3);
            isValid &= validateField(priority, priority.value !== "" && priority.value !== null);
            isValid &= validateField(cs, cs.value !== "" && cs.value !== null);
            isValid &= validateField(tuserid, tuserid.value.trim().length >= 3);
            isValid &= validateField(comment, comment.value.trim().length >= 3);

            // ЛОГИКА ПРОВЕРКИ ID УСЛУГИ (как в старом коде):
            // ID услуги обязателен ТОЛЬКО если:
            // 1. Отдел = Кризис менеджеры (любой приоритет)
            // 2. Отдел = Техподдержка 1Л CRM Исход И приоритет = КРИТИЧЕСКИЙ
            const isServiceIdRequired = (cs.value === 'crisis_manager') ||
                (cs.value === 'tech_support_outgoing_crm2' && priority.value === 'highest');

            if (isServiceIdRequired) {
                isValid &= validateField(tservid, tservid.value.trim().length >= 3);
            }

            if (!isValid) {
                createAndShowButton('Проверьте правильность заполнения выделенных полей', 'error');
                return;
            }

            // Если всё ок — отправляем
            const btn = this;
            btn.disabled = true;
            btn.innerHTML = '⏳ Отправка...';

            let usluga = tservid.value.trim() === "" ? "null" : tservid.value.trim(); // Если пусто, отправляем пустую строку
            let conversid = chathash.value;

            let elementsObj = [
                { name: "priority", isFile: false, value: priority.value },
                { name: "category", isFile: false, value: cs.value },
                { name: "educationServiceIdInput", isFile: false, value: usluga },
                { name: "userId", isFile: false, value: tuserid.value.trim() },
                { name: "comment", isFile: false, value: comment.value }
            ];

            if (!SearchinAFnewUI("userType")) {
                let initId = tuserid.value.trim();
                elementsObj.push({ name: "initiatorId", isFile: false, value: initId ? parseInt(initId) : 0 });
            }

            const success = await sendAutofaqAction(conversid, elementsObj);

            if (success) {
                if (NoteFlag === 1) { sendComment(NoteText); NoteNoticeClear(); }

                // Просто скрываем форму напрямую, не вызывая событие клика по кнопке "Hide"
                document.getElementById('AF_Createtask').style.display = 'none';
                if (typeof taskBut !== 'undefined') taskBut.classList.remove('activeScriptBtn');

                document.getElementById('clearcreateform').click();
            } else {
                createAndShowButton('Ошибка сети при отправке задачи', 'error');
            }

            btn.disabled = false;
            btn.innerHTML = '🚀 Отправить задачу';
        };

        const setupFastNote = (id, text) => {
            document.getElementById(id).onclick = () => { copyToClipboard(text); sendComment(text); };
        };
        setupFastNote('studcontact', 'Обратился П. Связаться с У');
        setupFastNote('teachcontact', 'Обратился У. Связаться с П');
        setupFastNote('nrstudent', 'Крит Н.О. У');
        setupFastNote('nrteacher', 'Крит Н.О. П');

        document.getElementById('clearcreateform').onclick = () => {
            document.getElementById('chathashlnk').value = '';
            document.getElementById('taskcomment').value = '';
            document.getElementById('taskserviceid').value = '';
            document.getElementById('taskuserid').value = '';
            document.getElementById('useriddata').value = '';
            document.getElementById('priority').value = '';
            document.getElementById('customerservice').value = '';
            document.getElementById('priority').style.color = '#fff';
            NoteNoticeClear();
        };

    } else {
        document.getElementById('AF_Createtask').style.display = 'none';
        if (typeof taskBut !== 'undefined') taskBut.classList.remove('activeScriptBtn');
        let conversid = document.getElementById('chathashlnk').value;
        sendAutofaqAction(conversid);
    }

    function NoteNoticeSet() {
        document.getElementById('NoteNoticeText').innerText = NoteText;
        document.getElementById('NoteNoticeWrap').style.display = 'block';
    }
    function NoteNoticeClear() {
        document.getElementById('NoteNoticeWrap').style.display = 'none';
        document.getElementById('NoteNoticeText').innerText = '';
        NoteText = '';
        NoteFlag = 0;
    }
    document.getElementById('NoteNoticeText').onclick = NoteNoticeClear;
}

// ИСПРАВЛЕНИЕ: Формируем правильный application/json запрос для сервера Autofaq.
// Нативный JSON.stringify() сам идеально экранирует любые переносы строк и кавычки.
// Финальная и самая надежная версия функции отправки!
async function sendAutofaqAction(conversationId, elements = null, isClickMode = false) {
    if (!conversationId) return false;
    try {
        let endpoint = isClickMode ? "click" : "form";
        // Базовые заголовки. ВАЖНО: Мы НЕ прописываем здесь content-type!
        let headers = {
            "accept": "application/json, text/plain, */*",
            "x-csrf-token": aftoken
        };

        let config = {
            method: "POST",
            credentials: "include",
            mode: "cors"
        };

        if (isClickMode) {
            // Если это просто клик (смена статуса чата и тд), отправляем как JSON
            headers["content-type"] = "application/json";
            config.body = JSON.stringify({ buttonId: elements[0].value, conversationId: conversationId });
        } else {
            // Если это отправка формы (создание задачи) - используем FormData.
            // Браузер САМ поставит заголовок "multipart/form-data" и сгенерирует правильный boundary!
            const fd = new FormData();
            let payload = { conversationId: conversationId };
            if (elements) payload.elements = elements;

            // JSON.stringify безопасно упакует все кавычки и переносы строк внутри комментария
            fd.append("payload", JSON.stringify(payload));
            config.body = fd;
        }

        config.headers = headers;

        const response = await fetch(`https://skyeng.autofaq.ai/api/reason8/operator/customButtons/${endpoint}`, config);

        // Возвращаем успешность запроса (true если статус 200-299)
        return response.ok;
    } catch (err) {
        console.error("Autofaq submit error:", err);
        return false;
    }
}

// start test
setInterval(doHideForm, 500);
// end test