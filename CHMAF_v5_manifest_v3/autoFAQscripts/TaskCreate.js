var win_taskform = //описание формы создания задач в СРМ2
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 410px;" id="create_form_header">
                            <button class="mainButton buttonHide" title="скрывает меню" id="hideMeCreateForm">hide</button>
                            <button class="mainButton smallbtn" title="По нажатию обновляет хеш чата в соответствующем поле, на случай, если при открытии формы вы открыли не тот чат, в котором обратился пользователь" id="refreshhashcreateform">♻</button>
							<button class="mainButton smallbtn" title="По нажатию очищает поля и сбрасывает в дефолтное состояние формы" id="clearcreateform">🧹</button>
							<span style="color:bisque">Статус урока: </span>
							<span id="statusuroka"></span>
                        </div>

                        <div id="addcreateformbtns">
                            <button class="mainButton" id="critteachertostudent" style="height:25px; width: 48%; margin-left:8px;">🔴 👽П -&gt; У👨‍🎓</button>
                            <button class="mainButton" id="critstudenttoteacher" style="height:25px; width: 48%;">🔴 👨‍🎓У -&gt; П👽</button>
                            <br>
                            <button class="mainButton" id="critteacherno" style="height:25px; width: 48%; margin-left:8px; margin-top:3px;">🔴 👽П н.о.</button>
                            <button class="mainButton" id="critstudentno" style="height:25px; width: 48%;">🔴 👨‍🎓У н.о.</button>
                            <br>
                            <button class="mainButton" id="highteachersc" style="height:25px; width: 48%; margin-left:8px; margin-top:3px;">👽 Исх. звонки (SC)</button>
							<button class="mainButton" id="highteachertc" style="height:25px; width: 48%;">👽 Teachers Care</button>
                            <br>
                            <button class="mainButton" id="highsecondline" style="height:25px; width: 32%; margin-left:8px; margin-top:3px;">🗓 Календарь У/П</button>
                            <button class="mainButton" id="lowkm" style="height:25px; width: 18%;">😡 КМ</button>
                            <button class="mainButton" id="highprem" style="height:25px; width: 18%;">🅿️ Prem</button>
                            <button class="mainButton" id="low2lvimbug" style="height:25px; width: 26%;">🐞2Л vim-bug</button>
                        </div>

                        <div style="margin: 5px; margin-top: 0px; width: 405px" id="create_form_menu">
                            <input class="${exttheme}" disabled="" required id="chathashlnk" placeholder="Хэш чата" title="Хеш чата, из которого будет создано обращение в СРМ" autocomplete="off" type="text" style="text-align: center; width: 410px; margin-top: 5px; text-align:center; width:100%">
							<br>
							<select class="${exttheme}" required id="priority" style="width: 100%; text-align: center; height: 28px;">
								<option disabled="" selected="">Приоритет</option>
								<option value="low" style="color:green; font-weight:600">🟢 Низкий</option>
								<option value="high" style="color:orange; font-weight:600">🟡 Высокий</option>
								<option value="highest" style="color:red; font-weight:600">🔴 Критический</option>
							</select>

							<select class="${exttheme}" required id="customerservice" style="width: 100%; text-align: center; height: 28px;">
								<option disabled="" selected="">Отдел</option>
								<option value="tech_support_outgoing_crm2" style="color:red;">🛠️Техподдержка 1Л CRM (исход)</option>
								<option value="teachers_care_crm">👽Teachers Care</option>
								<option value="content_management">📄Контент</option>
								<option value="outgoing_calls_crm2">📞Исходящие звонки (КЦ исход)</option>
								<option value="tech_support_second_line_crm2" style="color:green;">🥈Техподдержка 2Л CRM</option>
                                <option value="crisis_manager">😡Кризис менеджеры</option>
                                <option value="personal_support">🅿️Персональное сопровождение(Premium)</option>
							</select>

							<input class="${exttheme}" id="taskserviceid" placeholder="🆔 ID услуги" style="width: 100%; height: 28px;">
							<br>
							<input class="${exttheme}" required id="taskuserid" placeholder="🆔 ID пользователя" style="width: 92%; height: 28px;">
                            <button class="mainButton smallbtn" id="searchuserservices">⬅️</button>
							<br>
                            <span id="NoteNotice" style="color:bisque; display:none;">Будет добавлена заметка: </span>
                            <span id="NoteNoticeText" title="Нажми для отмены отправки заметки" style="background:#69a4c7; color:#fff;  font-weight:300; border:1px solid black; display:none;"></span>
							<label style="color:bisque; display:none;">Используйте кнопку ниже для открытия создания задачи в СРМ на техподдержку 2 линии с обязательным выбором Темы обращения "Запланированная связь с пользователем" и время открытия задачи, которое забронировали на datsy.ru . Другие задачи на 2ЛТП передаем в прежнем режиме через это окно.</label>
							<br>
							<button class="mainButton" style="margin-left: 70px; display:none;" id="taskcreate2linecrm">Создать задачу на 2ЛТП по календарю</button>

							<textarea class="${exttheme}" required id="taskcomment" placeholder="Комментарий" title="Укажите комментарий к задаче, что было сделано, что требуется сделать" autocomplete="off" type="text" style="text-align: center; width: 100%; height:100px; margin-top: 5px"></textarea>

							<br>
							<button class="mainButton" id="studcontact" style="width: 115px;position: relative;left: 14%;margin-top: 5px;transform: translate(-50%, 0);">Обр П, связь с У</button>
							<button class="mainButton" id="teachcontact" style="width: 115px;position: relative;left: 14%;margin-top: 5px;transform: translate(-50%, 0);">Обр У, связь с П</button>
							<button class="mainButton" id="nrteacher" style="width: 80px;position: relative;left: 11%;margin-top: 5px;transform: translate(-50%, 0);">Крит П Н.О</button>
							<button class="mainButton" id="nrstudent" style="width: 80px;position: relative;left: 11%;margin-top: 5px;transform: translate(-50%, 0);">Крит У Н.О</button>

							<div>
								<button class="mainButton" title="Создает задачу на СРМ2 на выранный отдел и приоритет" id="createtask" style="width: 80px;position: relative;left: 50%;margin-top: 5px;transform: translate(-50%, 0); background: chocolate;">Отправить</button>
							</div>

						</div>
		</span>
        </span>
			<div id="servicehelper" class="srvhhelpnomove" style="position: absolute; top: -1px; left: -311px; width: 310px; max-height: 400px; overflow: auto; background: #464451; cursor:default;">
				<input class="${exttheme}" id="useriddata" placeholder="ID У для получения списка услуг" style="width:240px; margin:10px; text-align:center;">
				<button class="mainButton smallbtn" id="getuserservices">🔎</button>
				<p id="serviceinf"></p>
                <p id="serviceComplinf"></p>
			</div>
</div>`;

var win_speccommwindow =
    `<div style="border: 2px double black; background-color: #464451; cursor: -webkit-grab; width: 350px;">
        <div style="display: flex;">
            <button title="Скрытие меню" id="hideMeSpecComm" class="mainButton buttonHide" style="margin: 5px; float: left;">hide</button>
        </div>
        <div style="display: flex;">
            <p id="speccommtext" style="color: bisque; font-size: 16px; margin: 5px; max-height: 300px; overflow-y: auto; border: 1px solid #000; padding: 5px;"></p>
        </div>
    </div>`;


var NoteFlag = 0; // флаг отправлять заметку или нет
var NoteText = ''; // какой текст отправим в заметку

const wintCreateTask = createWindow('AF_Createtask', 'winTopTaskCreate', 'winLeftTaskCreate', win_taskform);
const winSpecCommWindow = createWindow('AF_SpecCommWindow', 'winTopSpecCommWindow', 'winLeftSpecCommWindow', win_speccommwindow);

document.getElementById('AF_SpecCommWindow').ondblclick = function (a) {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') { document.getElementById('hideMeSpecComm').click(); }
}

document.getElementById('AF_Createtask').ondblclick = function (a) { // скрытие окна создания задачи в CRM2 по двойному клику
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') { document.getElementById('hideMeCreateForm').click(); }
}

document.getElementById('hideMeSpecComm').onclick = function () {
    document.getElementById('AF_SpecCommWindow').style.display = 'none';
    document.getElementById('speccommtext').innerText = '';
}

function handleSpecCommentClick(text) {
    document.getElementById('speccommtext').innerHTML = text;
    document.getElementById('AF_SpecCommWindow').style.display = '';
}

document.getElementById('taskserviceid').addEventListener('input', () => onlyNumber(document.getElementById('taskserviceid')));
document.getElementById('taskuserid').addEventListener('input', () => onlyNumber(document.getElementById('taskuserid')));
document.getElementById('useriddata').addEventListener('input', () => onlyNumber(document.getElementById('useriddata')));

function replaceAllwrongsimbols(text) {
    text = text.replace(/\n/g, '<br>')
        .replace(/\/\//g, ' ')
        .replace(/\//g, '&#47;');
    return text;
}

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

var srvarray;
var srvcont;

var usersrv;
var usersrvparsed;

function gettaskButButtonPress() { // функция открытия окна для работы с созданием задач на СРМ

    let conversid;
    document.getElementById('serviceinf').innerHTML = '';

    if (document.getElementById('AF_Createtask').style.display == 'none') {
        document.getElementById('AF_Createtask').style.display = ''
        taskBut.classList.add('activeScriptBtn')

        const fetchURL = `https://backend.skyeng.ru/api/products/configurations/`;
        const requestOptions = {
            method: 'GET'
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            } else {
                const otvet = JSON.parse(response.fetchansver);
                srvcont = otvet
            }
        })

        document.getElementById('getuserservices').onclick = function () {
            let speccommntarray = [];
            let speccommntcompl = [];
            let speccommntcomplcount = '';
            if (document.getElementById('serviceinf').innerHTML != '')
                document.getElementById('serviceinf').innerHTML = '';

            if (document.getElementById('serviceComplinf').innerHTML != '')
                document.getElementById('serviceComplinf').innerHTML = ""

            let complectationServInfo = document.getElementById('cmplData');
            complectationServInfo.innerHTML = ""


            let idshka = document.getElementById('useriddata').value.trim();
            let lnkTaskCrCompl = document.getElementById('serviceComplinf')

            const fetchURL = `https://backend.skyeng.ru/api/persons/${idshka}/education-services/`;
            const requestOptions = {
                method: 'GET'
            };

            const fetchURLComplectations = `https://backend.skyeng.ru/api/v1/students/${idshka}/education-service-kits/`;
            const requestOptionsComplectations = {
                method: 'GET'
            };

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
                if (!response.success) {
                    alert('Не удалось выполнить запрос: ' + response.error);
                    return;
                } else {
                    const otvetEdServ = JSON.parse(response.fetchansver);

                    for (let i = 0; i < otvetEdServ.data.length; i++) {
                        for (let j = 0; j < srvcont.data.length; j++) {
                            if (srvcont.data[j].serviceTypeKey == otvetEdServ.data[i].serviceTypeKey) {
                                otvetEdServ.data[i].serviceTypeKey = srvcont.data[j].shortTitle;
                                if (otvetEdServ.data[i].incorrectnessReason == null) {
                                    let specommentElement = '<span name="specomment" title="Посмотреть Спец.комментарий">💭</span>';
                                    let balance = otvetEdServ.data[i].balance != null ? otvetEdServ.data[i].balance : '0';
                                    let studentInfo = otvetEdServ.data[i].student.general.id + ' ' +
                                        (otvetEdServ.data[i].student.general.name || '') + ' ' +
                                        (otvetEdServ.data[i].student.general.surname || '');
                                    let teacherInfo = otvetEdServ.data[i].teacher != null ?
                                        otvetEdServ.data[i].teacher.general.id + ' ' +
                                        otvetEdServ.data[i].teacher.general.name + ' ' +
                                        otvetEdServ.data[i].teacher.general.surname : '—';
                                    let serviceIdInfo = '🆔 услуги: ' + otvetEdServ.data[i].id + ' — ' + otvetEdServ.data[i].serviceTypeKey +
                                        '<span class="srvhhelpnomove" name="movetoservid" title="По клику перенесет ID услуги в поле создания задачи" style="cursor:pointer; font-size:16px;"> ➡</span>';

                                    let generateBlock = (background, textColor, stageText, teacherInfoText) =>
                                        `<div class="srvhhelpnomove" name="outservfield" title="${otvetEdServ.data[i].id}" style="background: ${background}; color:${textColor}; margin-left: 5px; border: 1px solid bisque;">` +
                                        `<div style="text-align:center; background:grey;">${stageText} ${specommentElement} | 💰 Баланс: ${balance}</div>` +
                                        `${serviceIdInfo}<br>` +
                                        `👨‍🎓 Student: ${studentInfo}<br>` +
                                        `👽 Teacher: ${teacherInfoText}<br></div>`;

                                    if (otvetEdServ.data[i].stage == 'regular_lessons') {
                                        document.getElementById('serviceinf').innerHTML += generateBlock('#2b602b', 'bisque', 'Регулярные занятия', teacherInfo);
                                    } else if (otvetEdServ.data[i].stage == 'lost') {
                                        document.getElementById('serviceinf').innerHTML += generateBlock('#5a0f77', 'bisque', 'Потерянная услуга', '—');
                                    } else if (otvetEdServ.data[i].stage == "after_trial" || otvetEdServ.data[i].stage == "before_call") {
                                        document.getElementById('serviceinf').innerHTML += generateBlock('#d59f34', '#ffffff', 'Этап ВУ', '—');
                                    }
                                }
                            }
                        }
                    }

                    for (let z = 0; z < document.getElementsByName('movetoservid').length; z++) {
                        document.getElementsByName('movetoservid')[z].onclick = function () {
                            document.getElementById('taskserviceid').value = document.getElementsByName('outservfield')[z].title
                        }
                    }

                    for (let z = 0; z < document.getElementsByName('specomment').length; z++) {
                        let serviceid = document.getElementsByName('outservfield')[z].title;
                        let specommentelem = document.getElementsByName('specomment')[z];
                        const fetchURLspec = `https://backend.skyeng.ru/api/students/${idshka}/education-services/${serviceid}/general/`;
                        const requestOptionsspec = {
                            method: 'GET'
                        };

                        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLspec, requestOptions: requestOptionsspec }, function (response) {
                            if (!response.success) {
                                console.log('Не удалось выполнить запрос: ' + response.error);
                                specommentelem.innerText = '❌';
                                return;
                            } else {
                                const otvetspec = JSON.parse(response.fetchansver);
                                if (!otvetspec.data.operatorNote) {
                                    specommentelem.innerText = '❌';
                                } else {
                                    speccommntarray[z] = otvetspec.data.operatorNote;
                                    speccommntarray[z] = replaceAllwrongsimbols(speccommntarray[z]);
                                    if (speccommntarray[z].toLowerCase().includes("звон")) {
                                        speccommntarray[z] = highlightSearchText(speccommntarray[z], "звон");
                                        specommentelem.innerText = '⚠️';
                                        specommentelem.classList.add('allertcomment', 'blinking');
                                    }
                                    specommentelem.addEventListener('click', function () { handleSpecCommentClick(speccommntarray[z]) });
                                }
                            }
                        })
                    }
                }
            })

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLComplectations, requestOptions: requestOptionsComplectations }, function (response) { // получение информации по комплектациям
                if (!response.success) {
                    alert('Не удалось выполнить запрос: ' + response.error);
                    return;
                } else {
                    const chechkComplectations = JSON.parse(response.fetchansver);

                    if (chechkComplectations.data.length > 0) {
                        lnkTaskCrCompl.innerHTML += '<div id="openComplectationTaskCreate" style="background: #4e7891; text-align:center; cursor:pointer; text-shadow: 1px 1px 2px black; color:bisque;">✅Есть комплектации >>></div>'

                        const openOneCompl = document.getElementById('openComplectationTaskCreate');
                        openOneCompl.addEventListener('click', function () {
                            let getComplWindow = document.getElementById('AF_Complectations');
                            if (getComplWindow.style.display == "none") {
                                getComplWindow.style.display = "";
                            } else {
                                getComplWindow.style.display = "none";
                            }
                        });

                        chechkComplectations.data.forEach((service) => {
                            if (!speccommntcomplcount) {
                                speccommntcomplcount = 0;
                            } else {
                                speccommntcomplcount++;
                            }
                            let specommenttitleElementtitle = '<span name="specommenttitle" title="Посмотреть Спец.комментарий">💭</span>';
                            if (service.incorrectnessReason == null) {
                                if (service.operatorNote) {
                                    i = speccommntcomplcount;
                                    speccommntcompl[i] = service.operatorNote;
                                    speccommntcompl[i] = replaceAllwrongsimbols(speccommntcompl[i]);
                                }

                                let gatheredInfoComplSrvs = '<table style="width: 98%; margin: 10px 0; border-collapse: collapse;">';
                                gatheredInfoComplSrvs += `
                                    <tr style="background: #776d69; color: white; position: sticky; top: 0;">
                                        <th style="border: 1px solid black; padding: 5px;">ID Услуги</th>
                                        <th style="border: 1px solid black; padding: 5px;">STK</th>
                                        <th style="border: 1px solid black; padding: 5px;">Урок</th>
                                        <th style="border: 1px solid black; padding: 5px;">СК</th>
                                        <th style="border: 1px solid black; padding: 5px;"></th>
                                    </tr>`;

                                const allEduServicesCompl = service.educationServices;
                                allEduServicesCompl.forEach((el) => {
                                    let { formattedText, lessontype } = formatServiceType(el.serviceTypeKey); // Вызов функции для форматирования строки
                                    gatheredInfoComplSrvs += `
                                            <tr>
                                                <td style="border: 1px solid black; padding: 5px; background: #4f4c4c;">
                                                    <a href="https://crm2.skyeng.ru/persons/${service.student.general.id}/services/${el.id}" target="_blank" style="color:#32b5f5; text-decoration: none;">${el.id}</a>
                                                </td>
                                                <td style="border: 1px solid black; padding: 5px; background: #4f4c4c;">${formattedText}</td>
                                                <td style="border: 1px solid black; padding: 5px; background: #4f4c4c;" data-id="${el.id}" lessontype="${lessontype}" class="complect-nextlesson"> - </td>
                                                <td style="border: 1px solid black; padding: 5px; background: #4f4c4c;" data-id="${el.id}" name="specommentcompl" title="Посмотреть Спец.комментарий">💭</td>
                                                <td style="border: 1px solid black; padding: 5px; background: #4f4c4c; cursor:pointer;" data-id="${el.id}" class="insert-complect-id">➡</td>
                                            </tr>`;
                                });
                                gatheredInfoComplSrvs += '</table>';
                                complectationServInfo.innerHTML += `<div style="background: #4a7d55; text-align: center; border-radius: 20px; width: 97%; text-shadow: 1px 1px 2px black; font-weight: 800; margin-bottom:5px;">${service.productKit.title} | ${service.stage == "regular_lessons" ? "Регулярные занятия" : service.stage == "lost" ? "Потерянная" : service.stage} ${specommenttitleElementtitle}</div>` + gatheredInfoComplSrvs;
                            }
                        });

                        document.querySelectorAll('.insert-complect-id').forEach(element => {
                            element.addEventListener('click', function () {
                                const id = this.getAttribute('data-id');
                                if (id && document.getElementById('taskserviceid')) {
                                    document.getElementById('taskserviceid').value = id.trim();
                                }
                            });
                        });

                        document.querySelectorAll('.complect-nextlesson').forEach(element => {
                            let fetchURLComplectationsTT = "";
                            let eduservise = element.getAttribute('data-id');
                            let lessontype = element.getAttribute('lessontype');
                            if (lessontype == 'f2f') {
                                fetchURLComplectationsTT = `https://backend.skyeng.ru/api/students/education-services/${eduservise}/timetable/future-lessons/`;
                            } else if (lessontype == 'group') {
                                fetchURLComplectationsTT = `https://backend.skyeng.ru/api/students/education-services/${eduservise}/timetable/group/future-lessons/`;
                            } else {
                                console.log('не верный тип урока!')
                                return;
                            }

                            const requestOptionsComplectationsTT = {
                                method: 'GET'
                            };
                            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLComplectationsTT, requestOptions: requestOptionsComplectationsTT }, function (response) { // получение информации по комплектациям
                                let nextlessondate = '-';
                                if (response.success) {
                                    const chechkComplectationsTT = JSON.parse(response.fetchansver).data;
                                    if (chechkComplectationsTT.length > 0 && chechkComplectationsTT[0].startedAt) {
                                        nextlessondate = chechkComplectationsTT[0].startedAt;
                                        nextlessondate = nextlessondate.replace('T', ' ').replace(/\+00:00$/, '');
                                        let dateObj = new Date(nextlessondate);
                                        dateObj.setHours(dateObj.getHours() + 3); // Приводим время к MSK
                                        nextlessondate = dateObj.toLocaleString('ru-RU', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                        });
                                    }
                                } else {
                                    alert('Не удалось выполнить запрос: ' + response.error);
                                }

                                // Получаем текущее время устройства и приводим его к +3 МСК
                                let currentDateObj = new Date();
                                currentDateObj.setMinutes(currentDateObj.getMinutes() + currentDateObj.getTimezoneOffset()); // Приводим к UTC
                                currentDateObj.setHours(currentDateObj.getHours() + 3); // Приводим к +3 МСК

                                let currentDateTime = currentDateObj.getTime(); // Текущее время в миллисекундах

                                // Разделяем строку nextlessondate на дату и время
                                let nextLessonDateParts = nextlessondate.split(' ');
                                if (nextLessonDateParts.length === 2) {
                                    let dateParts = nextLessonDateParts[0].split('.'); // Разделяем дату на [дд, мм, гггг]
                                    let timeParts = nextLessonDateParts[1].split(':'); // Разделяем время на [чч, мм, сс]

                                    // Проверяем, что все части корректно распарсились
                                    if (dateParts.length === 3 && timeParts.length >= 2) {
                                        // Создаем объект Date из частей даты и времени
                                        let nextLessonDateTime = new Date(
                                            parseInt(dateParts[2], 10),            // Год
                                            parseInt(dateParts[1], 10) - 1,        // Месяц (0-based)
                                            parseInt(dateParts[0], 10),            // День
                                            parseInt(timeParts[0], 10),            // Часы
                                            parseInt(timeParts[1], 10),            // Минуты
                                            timeParts[2] ? parseInt(timeParts[2], 10) : 0 // Секунды (если есть)
                                        ).getTime();

                                        // Проверяем диапазон времени
                                        if (currentDateTime >= nextLessonDateTime - 10 * 60 * 1000 &&
                                            currentDateTime <= nextLessonDateTime + 50 * 60 * 1000) {
                                            element.style.background = 'red'; // Красим элемент в красный цвет
                                        }
                                    } else {
                                        console.log("Ошибка разбора даты/времени: некорректный формат nextlessondate");
                                    }
                                } else {
                                    console.log("Ошибка: Некорректный формат nextlessondate");
                                }

                                element.innerText = nextlessondate;
                            });
                        });

                        for (let z = 0; z < document.getElementsByName('specommenttitle').length; z++) {
                            let SCElement = document.getElementsByName('specommenttitle')
                            if (speccommntcompl[z]) {
                                if (speccommntcompl[z].toLowerCase().includes("звон")) {
                                    speccommntcompl[z] = highlightSearchText(speccommntcompl[z], "звон");
                                    SCElement[z].innerText = '⚠️';
                                    SCElement[z].classList.add('allertcomment', 'blinking');
                                }
                                SCElement[z].addEventListener('click', function () { handleSpecCommentClick(speccommntcompl[z]) });
                            } else {
                                SCElement[z].innerText = '❌';
                            }
                        }

                        for (let z = 0; z < document.getElementsByName('specommentcompl').length; z++) {
                            let specommentelem = document.getElementsByName('specommentcompl')[z];
                            let serviceid = document.getElementsByName('specommentcompl')[z].getAttribute('data-id')
                            const fetchURLspec = `https://backend.skyeng.ru/api/students/${idshka}/education-services/${serviceid}/general/`;
                            const requestOptionsspec = {
                                method: 'GET'
                            };

                            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLspec, requestOptions: requestOptionsspec }, function (response) {
                                if (!response.success) {
                                    console.log('Не удалось выполнить запрос: ' + response.error);
                                    specommentelem.innerText = '❌';
                                    return;
                                } else {
                                    const otvetspec = JSON.parse(response.fetchansver);
                                    if (!otvetspec.data.operatorNote) {
                                        specommentelem.innerText = '❌';
                                    } else {
                                        speccommntarray[z] = otvetspec.data.operatorNote;
                                        console.log(speccommntarray[z])
                                        speccommntarray[z] = replaceAllwrongsimbols(speccommntarray[z]);
                                        if (speccommntarray[z].toLowerCase().includes("звон")) {
                                            speccommntarray[z] = highlightSearchText(speccommntarray[z], "звон");
                                            console.log(speccommntarray[z])
                                            specommentelem.innerText = '⚠️';
                                            specommentelem.classList.add('allertcomment', 'blinking');
                                        }
                                        specommentelem.addEventListener('click', function () { handleSpecCommentClick(speccommntarray[z]) });
                                    }
                                }
                            })
                        }

                    } else {
                        linkToComplectationtable.innerHTML += '<div style="background: #4e7891; text-align:center; text-shadow: 1px 1px 2px black;">❌Нет комплектаций</div>';
                        console.log("Нет услуг комплектаций Домашний Лицей, Large Classes Exams и других");
                    }
                }
            });
        }

        document.getElementById('refreshhashcreateform').click();

        document.getElementById('searchuserservices').onclick = function () {
            let inputValue = document.getElementById('taskuserid').value;
            let idfieldvalue = inputValue.replace(/\D/g, ''); // Оставляем только цифры, удаляем все остальное
            if (idfieldvalue.length > 4) {
                document.getElementById('useriddata').value = idfieldvalue;
                document.getElementById('getuserservices').click();
            } else {
                console.log('Введен не верный id');
            }
        }


        let activeConvId = getChatId();

        if (activeConvId) {
            document.getElementById('chathashlnk').value = activeConvId

            fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/click", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json",
                    "x-csrf-token": aftoken
                },
                "body": `{\"buttonId\":\"b49609f3-9ff7-4ba5-a8a8-f2cef770bf19\",\"conversationId\":\"${activeConvId}\"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });

        }

        document.getElementById('refreshhashcreateform').onclick = function () {
            document.getElementById('chathashlnk').value = '';
            let activeConvId = getChatId();

            if (activeConvId) {
                document.getElementById('chathashlnk').value = activeConvId
            }
            const lessonStatus = SearchinAFnewUI("nextClass-statusHTML");
            if (lessonStatus.includes("идет") || lessonStatus.includes("идёт")) {
                document.getElementById('statusuroka').innerHTML = lessonStatus
                document.getElementById('statusuroka').style = "background:rgb(187 5 5); padding:5px; color:#fff;  font-weight:600; border:1px solid black;"
            } else {
                document.getElementById('statusuroka').innerHTML = "Урок не идет"
                document.getElementById('statusuroka').style = "background:#69a4c7; padding:5px; color:#fff;  font-weight:600; border:1px solid black;"
            }

        }

        document.getElementById('hideMeCreateForm').onclick = function () {
            document.getElementById('AF_Createtask').style.display = 'none'
            taskBut.classList.remove('activeScriptBtn')
            document.getElementById('chathashlnk').value = '';
            if (document.getElementById('AF_Service').style.display == 'none') {
                document.getElementById('AF_Complectations').style.display = 'none';
            }
            if (document.getElementById('AF_SpecCommWindow').style.display != 'none') {
                document.getElementById('hideMeSpecComm').click();
            }
            if (activeConvId) {
                fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/form", {
                    "headers": {
                        "accept": "application/json, text/plain, */*",
                        "content-type": "multipart/form-data; boundary=----WebKitFormBoundarysuN73wIfkSXb2Lvr",
                        "x-csrf-token": aftoken
                    },
                    "body": `------WebKitFormBoundarysuN73wIfkSXb2Lvr\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"conversationId\":\"${activeConvId}\"}\r\n------WebKitFormBoundarysuN73wIfkSXb2Lvr--\r\n`,
                    "method": "POST",
                    "mode": "cors",
                    "credentials": "include"
                });
            }
        }

        function changePriorityColor() {
            const priorityElement = document.getElementById('priority');
            priorityElement.classList.remove('inputgreen', 'inputorange', 'inputred');
            if (priorityElement.children[1].selected) {
                priorityElement.classList.add('inputgreen');
            } else if (priorityElement.children[2].selected) {
                priorityElement.classList.add('inputorange');
            } else if (priorityElement.children[3].selected) {
                priorityElement.classList.add('inputred');
            }
        }

        document.getElementById('priority').onchange = changePriorityColor;

        document.getElementById('NoteNoticeText').onclick = NoteNoticeClear;

        document.getElementById('clearcreateform').onclick = function () {
            document.getElementById('chathashlnk').value = '';
            document.getElementById('taskcomment').value = '';
            document.getElementById('taskserviceid').value = '';
            document.getElementById('taskuserid').value = '';
            document.getElementById('useriddata').value = '';
            document.getElementById('priority').children[0].selected = true;
            document.getElementById('customerservice').children[0].selected = true;
            document.getElementById('openComplectationTaskCreate')?.remove();
            document.getElementById('AF_Complectations').style.display = 'none';
            removeCoralBackground();
            changePriorityColor();
            NoteNoticeClear();
        };

        function removeCoralBackground() {
            const createTaskForm = document.getElementById('AF_Createtask');
            if (createTaskForm) {
                const inputsAndTextareas = createTaskForm.querySelectorAll('input, textarea, select');
                inputsAndTextareas.forEach(element => {
                    element.classList.remove('inputalertbackground');
                });
            }
        }

        document.getElementById('critteachertostudent').onclick = function () {
            document.getElementById('priority').children[3].selected = true;
            document.getElementById('customerservice').children[1].selected = true;
            changePriorityColor();
            NoteFlag = 1
            NoteText = 'Обратился П. Связаться с У.'
            NoteNoticeSet();
            document.getElementById('taskuserid').value = SearchinAFnewUI("nextClass-studentId")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nПроверил связь с П, все ок, свяжитесь с У! КРИТ"
        }

        document.getElementById('critstudenttoteacher').onclick = function () {
            document.getElementById('priority').children[3].selected = true;
            document.getElementById('customerservice').children[1].selected = true;
            changePriorityColor();
            NoteFlag = 1
            NoteText = 'Обратился У. Связаться с П.'
            NoteNoticeSet();
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nПроверил связь с У, все ок, свяжитесь с П! КРИТ"
        }

        document.getElementById('critteacherno').onclick = function () {
            document.getElementById('priority').children[3].selected = true;
            document.getElementById('customerservice').children[1].selected = true;
            changePriorityColor();
            NoteFlag = 1
            NoteText = 'Крит Н.О. П'
            NoteNoticeSet();
            document.getElementById('taskuserid').value = SearchinAFnewUI("nextClass-studentId")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nНеполадка со стороны П. в чате н.о. Пожалуйста, свяжитесь с П КРИТ"
        }

        document.getElementById('critstudentno').onclick = function () {
            document.getElementById('priority').children[3].selected = true;
            document.getElementById('customerservice').children[1].selected = true;
            changePriorityColor();
            NoteFlag = 1
            NoteText = 'Крит Н.О. У'
            NoteNoticeSet();
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nНеполадка со стороны У. в чате н.о. Пожалуйста, свяжитесь с У КРИТ"
        }

        document.getElementById('highsecondline').onclick = function () {
            document.getElementById('priority').children[2].selected = true;
            document.getElementById('customerservice').children[6].selected = true;
            changePriorityColor();
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = '';
            document.querySelector('#taskcomment').value = "Дата и время календаря:\nПриоритетный способ связи:\nОписание неполадки:\nЧто было сделано:"
        }

        document.getElementById('highteachertc').onclick = function () {
            document.getElementById('priority').children[2].selected = true;
            document.getElementById('customerservice').children[2].selected = true;
            changePriorityColor();
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = '';
        }


        document.getElementById('highteachersc').onclick = function () {
            document.getElementById('priority').children[2].selected = true;
            document.getElementById('customerservice').children[4].selected = true;
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = '';
        }

        document.getElementById('lowkm').onclick = function () {
            document.getElementById('priority').children[1].selected = true;
            document.getElementById('customerservice').children[6].selected = true;
            changePriorityColor();
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
        }

        document.getElementById('highprem').onclick = function () {
            document.getElementById('priority').children[2].selected = true;
            document.getElementById('customerservice').children[7].selected = true;
            changePriorityColor();
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
        }

        document.getElementById('low2lvimbug').onclick = function () {
            document.getElementById('priority').children[1].selected = true;
            document.getElementById('customerservice').children[5].selected = true;
            changePriorityColor();
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value = "Краткое описание:\nШаги воспроизведения:\nОП:\nФП: \nссылки на скриншоты: \nНужна ли ОС : "
        }

        document.getElementById('createtask').onclick = function () {
            let chathashlnk = document.getElementById('chathashlnk');
            let priority = document.getElementById('priority');
            let customerservice = document.getElementById('customerservice');
            let taskserviceid = document.getElementById('taskserviceid');
            let taskuserid = document.getElementById('taskuserid');
            let taskcomment = document.getElementById('taskcomment');
            let prioritystate;
            let csstate;
            let usluga;

            let taskflagempty = 0;
            let idflagempty = 0;

            if (chathashlnk.value.length < 3) {
                chathashlnk.classList.add('inputalertbackground');
                taskflagempty = 1;
            } else { chathashlnk.classList.remove('inputalertbackground'); }

            if (priority.value != 'Приоритет') {
                priority.classList.remove('inputalertbackground');
                for (let i = 0; i < priority.children.length; i++) {
                    if (priority.children[i].selected == true)
                        prioritystate = priority.children[i].value
                }
            } else {
                priority.classList.add('inputalertbackground');
                taskflagempty = 1;
            }

            if (customerservice.value === 'crisis_manager' && taskserviceid.value.length < 3) {
                taskserviceid.classList.add('inputalertbackground');
                taskflagempty = 1;
            }
            else if (customerservice.value === 'tech_support_outgoing_crm2' && priority.value === 'highest' && taskserviceid.value.length < 3) {
                taskserviceid.classList.add('inputalertbackground');
                taskflagempty = 1;
            }
            else {
                taskserviceid.classList.remove('inputalertbackground');
            }

            if (customerservice.value != 'Отдел') {
                customerservice.classList.remove('inputalertbackground');
                for (let i = 0; i < customerservice.children.length; i++) {
                    if (customerservice.children[i].selected == true)
                        csstate = customerservice.children[i].value
                }
            } else {
                customerservice.classList.add('inputalertbackground');
                taskflagempty = 1;
            }

            if (taskuserid.value.length < 3) {
                taskuserid.classList.add('inputalertbackground');
                taskflagempty = 1;
            } else { taskuserid.classList.remove('inputalertbackground'); }

            if (taskcomment.value.length < 3) {
                taskcomment.classList.add('inputalertbackground');
                taskflagempty = 1;
            } else { taskcomment.classList.remove('inputalertbackground'); }

            if (taskflagempty == 0) {
                if (taskserviceid.value == '')
                    usluga = taskserviceid.value = null;
                else usluga = taskserviceid.value


                if (SearchinAFnewUI("userType")) {
                    idflagempty = 1;
                }

                conversid = chathashlnk.value;
                if (idflagempty == 1) {
                    fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/form", {
                        "headers": {
                            "accept": "application/json, text/plain, */*",
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTGBaRD5lMEUpA8IG",
                            "x-csrf-token": aftoken
                        },

                        "body": `------WebKitFormBoundaryTGBaRD5lMEUpA8IG\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"conversationId\":\"${conversid}\",\"elements\":[{\"name\":\"priority\",\"isFile\":false,\"value\":\"${prioritystate}"},{\"name\":\"category\",\"isFile\":false,\"value\":\"${csstate}\"},{\"name\":\"educationServiceIdInput\",\"isFile\":false,\"value\":\"${usluga}\"},{\"name\":\"userId\",\"isFile\":false,\"value\":\"${taskuserid.value.trim()}\"},{\"name\":\"comment\",\"isFile\":false,\"value\":\"${taskcomment.value.replaceAll("\n", "\\n").replaceAll(/"/g, "``")}\"}]}\r\n------WebKitFormBoundaryTGBaRD5lMEUpA8IG--\r\n`,


                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
                } else {
                    fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/form", {
                        "headers": {
                            "accept": "application/json, text/plain, */*",
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryTGBaRD5lMEUpA8IG",
                            "x-csrf-token": aftoken
                        },
                        "body": `------WebKitFormBoundaryTGBaRD5lMEUpA8IG\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"conversationId\":\"${conversid}\",\"elements\":[{\"name\":\"priority\",\"isFile\":false,\"value\":\"${prioritystate}"},{\"name\":\"category\",\"isFile\":false,\"value\":\"${csstate}\"},{\"name\":\"educationServiceIdInput\",\"isFile\":false,\"value\":\"${usluga}\"},{\"name\":\"userId\",\"isFile\":false,\"value\":\"${taskuserid.value.trim()}\"},{\"name\":\"initiatorId\",\"isFile\":false,\"value\":${taskuserid.value.trim()}}, {\"name\":\"comment\",\"isFile\":false,\"value\":\"${taskcomment.value.replaceAll("\n", "\\n").replaceAll(/"/g, "``")}\"}]}\r\n------WebKitFormBoundaryTGBaRD5lMEUpA8IG--\r\n`,

                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
                }

                if (NoteFlag == 1) {
                    sendComment(NoteText);
                    NoteNoticeClear();
                }

                document.getElementById('AF_Createtask').style.display = 'none'
                if (document.getElementById('AF_SpecCommWindow').style.display != 'none') {
                    document.getElementById('hideMeSpecComm').click();
                }
                document.getElementById('clearcreateform').click();
                document.getElementById('taskBut').classList.remove('activeScriptBtn')

            } else createAndShowButton('Задача не была создана, проверьте, пожалуйста, заполнение полей', 'error')
        }

        document.getElementById('taskcreate2linecrm').onclick = function () {
            if (document.getElementById('taskuserid').value != '') {
                window.open("https://crm2.skyeng.ru/persons/" + document.getElementById('taskuserid').value + "/customer-support/manual")
            } else createAndShowButton('Введите ID пользователя в соответствующее поле и повторите попытку', 'error')
        }


    } else {
        document.getElementById('AF_Createtask').style.display = 'none'
        taskBut.classList.remove('activeScriptBtn')
        conversid = document.getElementById('chathashlnk').value;
        fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/form", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundarysuN73wIfkSXb2Lvr",
                "x-csrf-token": aftoken
            },
            "body": `------WebKitFormBoundarysuN73wIfkSXb2Lvr\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"conversationId\":\"${activeConvId}\"}\r\n------WebKitFormBoundarysuN73wIfkSXb2Lvr--\r\n`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
    }

    studcontact.onclick = function () {
        copyToClipboard('Обратился П. Связаться с У');
        sendComment('Обратился П. Связаться с У')
    }

    teachcontact.onclick = function () {
        copyToClipboard('Обратился У. Связаться с П');
        sendComment('Обратился У. Связаться с П')
    }

    nrstudent.onclick = function () {
        copyToClipboard('Крит Н.О. У');
        sendComment('Крит Н.О. У')
    }

    nrteacher.onclick = function () {
        copyToClipboard('Крит Н.О. П');
        sendComment('Крит Н.О. П')
    }

    function NoteNoticeSet() {
        document.getElementById('NoteNoticeText').innerText = NoteText;
        document.getElementById('NoteNotice').style.display = '';
        document.getElementById('NoteNoticeText').style.display = '';
    }

    function NoteNoticeClear() {
        document.getElementById('NoteNotice').style.display = 'none';
        document.getElementById('NoteNoticeText').style.display = 'none';
        document.getElementById('NoteNoticeText').innerText = '';
        NoteText = '';
        NoteFlag = 0;
    }
}

//start test
setInterval(function () {
    doHideForm()
}, 100)
//end test