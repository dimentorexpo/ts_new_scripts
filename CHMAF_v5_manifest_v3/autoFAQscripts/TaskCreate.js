var win_taskform = //описание формы создания задач в СРМ2
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 410px;" id="create_form_header">
                            <button class="mainButton buttonHide" title="скрывает меню" id="hideMeCreateForm">hide</button>
                            <button class="mainButton" title="По нажатию обновляет хеш чата в соответствующем поле, на случай, если при открытии формы вы открыли не тот чат, в котором обратился пользователь" id="refreshhashcreateform" style="width:24px;">♻</button>
							<button class="mainButton" title="По нажатию очищает поля и сбрасывает в дефолтное состояние формы" id="clearcreateform" style="width:24px;">🧹</button>
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
                            <button class="mainButton" id="lowkm" style="height:25px; width: 31%;">😡 КМ</button>
                            <button class="mainButton" id="lowcontrol" style="height:25px; width: 32%;">🛂 Контроль</button>
                        </div>

                        <div style="margin: 5px; margin-top: 0px; width: 410px" id="create_form_menu">
                            <input disabled="" required id="chathashlnk" placeholder="Хэш чата" title="Хеш чата, из которого будет создано обращение в СРМ" autocomplete="off" type="text" style="text-align: center; width: 410px; color: black; margin-top: 5px; text-align:center;background:#cac1b1; width:100%">
							<br>
							<select required id="priority" style="width: 100%; text-align: center; height: 25px;">
								<option disabled="" selected="">Приоритет</option>
								<option value="low" style="background: white; color:green; font-weight:600">🟢 Низкий</option>
								<option value="high" style="background: white; color:orange; font-weight:600">🟡 Высокий</option>
								<option value="highest" style="background: white; color:red; font-weight:600">🔴 Критический</option>
							</select>

							<select required id="customerservice" style="width: 100%; text-align: center; height: 25px;">
								<option disabled="" selected="">Отдел</option>
								<option value="tech_support_outgoing_crm2" style="background: white">Техподдержка 1Л CRM (исход)</option>
								<option value="teachers_care_crm" style="background: white">Teachers Care</option>
								<option value="content_management_dictionary" style="background: white">Словарь</option>
								<option value="content_management" style="background: white">Контент</option>
								<option value="outgoing_calls_crm2" style="background: white">Исходящие звонки</option>
								<option value="tech_support_second_line_crm2" style="background: white">Техподдержка 2Л CRM</option>
                                <option value="crisis_manager" style="background: white">Кризис менеджеры</option>
                                <option value="tech_support_incoming_crm2" style="background: white">Техподдержка 1Л CRM (вход)</option>
							</select>

							<input id="taskserviceid" placeholder="🆔 ID услуги" style="width: 100%; height: 25px;">
							<br>
							<input required id="taskuserid" placeholder="🆔 ID пользователя" style="width: 100%; height: 25px;">
							<br>
                            <span id="NoteNotice" style="color:bisque; display:none;">Будет добавлена заметка: </span>
                            <span id="NoteNoticeText" title="Нажми для отмены отправки заметки" style="background:#69a4c7; color:#fff;  font-weight:300; border:1px solid black; display:none;"></span>
							<label style="color:bisque; display:none;">Используйте кнопку ниже для открытия создания задачи в СРМ на техподдержку 2 линии с обязательным выбором Темы обращения "Запланированная связь с пользователем" и время открытия задачи, которое забронировали на datsy.ru . Другие задачи на 2ЛТП передаем в прежнем режиме через это окно.</label>
							<br>
							<button class="mainButton" style="margin-left: 70px; display:none;" id="taskcreate2linecrm">Создать задачу на 2ЛТП по календарю</button>

							<textarea required id="taskcomment" placeholder="Комментарий" title="Укажите комментарий к задаче, что было сделано, что требуется сделать" autocomplete="off" type="text" style="text-align: center; width: 100%; height:100px; color: black; margin-top: 5px"></textarea>

							<br>
							<button class="mainButton" id="studcontact" style="width: 115px;position: relative;left: 15%;margin-top: 5px;transform: translate(-50%, 0);">Обр П, связь с У</button>
							<button class="mainButton" id="teachcontact" style="width: 115px;position: relative;left: 15%;margin-top: 5px;transform: translate(-50%, 0);">Обр У, связь с П</button>
							<button class="mainButton" id="nrteacher" style="width: 80px;position: relative;left: 11%;margin-top: 5px;transform: translate(-50%, 0);">Крит П Н.О</button>
							<button class="mainButton" id="nrstudent" style="width: 80px;position: relative;left: 11%;margin-top: 5px;transform: translate(-50%, 0);">Крит У Н.О</button>

							<div>
								<button class="mainButton" title="Создает задачу на СРМ2 на выранный отдел и приоритет" id="createtask" style="width: 80px;position: relative;left: 50%;margin-top: 5px;transform: translate(-50%, 0); background: chocolate;">Отправить</button>
							</div>

						</div>
		</span>
        </span>
			<div id="servicehelper" class="srvhhelpnomove" style="position: absolute; top: -1px; left: -311px; width: 310px; max-height: 400px; overflow: auto; background: #464451; cursor:default;">
				<input id="useriddata" placeholder="ID У для получения списка услуг" style="width:240px; margin:10px; text-align:center;">
				<button class="mainButton" id="getuserservices">🔎</button>
				<p id="serviceinf"></p>
			</div>
</div>`;

var NoteFlag = 0; // флаг отправлять заметку или нет
var NoteText = ''; // какой текст отправим в заметку

const wintCreateTask   = createWindow('AF_Createtask', 'winTopTaskCreate', 'winLeftTaskCreate', win_taskform);

document.getElementById('AF_Createtask').ondblclick = function (a) { // скрытие окна создания задачи в CRM2 по двойному клику
    if (checkelementtype(a)) { document.getElementById('hideMeCreateForm').click(); }
}

function doHideForm(flag = localStorage.getItem('hideTaskWindow')) {
    if (location.href.indexOf('skyeng.autofaq.ai/tickets/assigned') !== -1) {
        if (flag == 1) {
            let newFrontend = document.getElementsByTagName('iframe');
            if (newFrontend.length > 0) {
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

    document.getElementById('useriddata').value = '';
    document.getElementById('serviceinf').innerHTML = '';

    if (document.getElementById('AF_Createtask').style.display == 'none') {
        document.getElementById('AF_Createtask').style.display = ''
        taskBut.classList.add('activeScriptBtn')

        chrome.runtime.sendMessage({ action: 'getEducationSrv' }, function (allUserSTK) {
            srvcont = allUserSTK;
        })

        document.getElementById('getuserservices').onclick = function () {
            if (document.getElementById('serviceinf').innerHTML != '')
                document.getElementById('serviceinf').innerHTML = '';

            let idshka = document.getElementById('useriddata').value.trim();
            chrome.runtime.sendMessage({ action: 'getUserServices', userid: idshka }, function (userServices) {

                for (let i = 0; i < userServices.data.length; +i++) {
                    for (let j = 0; j < srvcont.data.length; j++) {
                        if (srvcont.data[j].serviceTypeKey == userServices.data[i].serviceTypeKey) {
                            userServices.data[i].serviceTypeKey = srvcont.data[j].shortTitle
                            if (userServices.data[i].incorrectnessReason == null) {
                                if (userServices.data[i].stage == 'regular_lessons') {
                                    document.getElementById('serviceinf').innerHTML += `<div class="srvhhelpnomove" name="outservfield" title="${userServices.data[i].id}" style="background: #2b602b; color:bisque;  margin-left: 5px; border: 1px solid bisque;">` + '<div style="text-align:center; background:grey;">Регулярные занятия |' + ' 💰 Баланс: ' + (userServices.data[i].balance != null ? userServices.data[i].balance : '0') + '</div>' + '🆔 услуги: ' + userServices.data[i].id + ' — ' + userServices.data[i].serviceTypeKey + '<span class="srvhhelpnomove" name="movetoservid" title="По клику перенесет ID услуги в поле создания задачи" style="cursor:pointer; font-size:16px;"> ➡</span>' + '<br>' + '👨‍🎓 Student: ' + userServices.data[i].student.general.id + ' ' + (userServices.data[i].student.general.name != null ? userServices.data[i].student.general.name : '') + ' ' + (userServices.data[i].student.general.surname != null ? userServices.data[i].student.general.surname : '') + '<br>' + '👽 Teacher: ' + (userServices.data[i].teacher != null ? userServices.data[i].teacher.general.id + ' ' + userServices.data[i].teacher.general.name + ' ' + userServices.data[i].teacher.general.surname : ' —') + '<br>' + '</div>'
                                } else if (userServices.data[i].stage == 'lost') {
                                    document.getElementById('serviceinf').innerHTML += `<div class="srvhhelpnomove" name="outservfield" title="${userServices.data[i].id}" style="background: #5a0f77; color:bisque;  margin-left: 5px; border: 1px solid bisque;">` + '<div style="text-align:center; background:grey;">Потерянная услуга |' + ' 💰 Баланс: ' + (userServices.data[i].balance != null ? userServices.data[i].balance : '0') + '</div>' + '🆔 услуги: ' + userServices.data[i].id + ' — ' + userServices.data[i].serviceTypeKey + '<span class="srvhhelpnomove" name="movetoservid" title="По клику перенесет ID услуги в поле создания задачи" style="cursor:pointer; font-size:16px;"> ➡</span>' + '<br>' + '👨‍🎓 Student: ' + userServices.data[i].student.general.id + ' ' + (userServices.data[i].student.general.name != null ? userServices.data[i].student.general.name : '') + ' ' + (userServices.data[i].student.general.surname != null ? userServices.data[i].student.general.surname : '') + '<br>' + '👽 Teacher: —' + '</div>'
                                } else if (userServices.data[i].stage == "after_trial" || userServices.data[i].stage == "before_call") {
                                    document.getElementById('serviceinf').innerHTML += `<div class="srvhhelpnomove" name="outservfield" title="${userServices.data[i].id}" style="background: #d59f34; color:#ffffff;  margin-left: 5px; border: 1px solid bisque;">` + '<div style="text-align:center; background:grey;">Этап ВУ |' + ' 💰 Баланс: ' + (userServices.data[i].balance != null ? userServices.data[i].balance : '0') + '</div>' + '🆔 услуги: ' + userServices.data[i].id + ' — ' + userServices.data[i].serviceTypeKey + '<span class="srvhhelpnomove" name="movetoservid" title="По клику перенесет ID услуги в поле создания задачи" style="cursor:pointer; font-size:16px;"> ➡</span>' + '<br>' + '👨‍🎓 Student: ' + userServices.data[i].student.general.id + ' ' + (userServices.data[i].student.general.name != null ? userServices.data[i].student.general.name : '') + ' ' + (userServices.data[i].student.general.surname != null ? userServices.data[i].student.general.surname : '') + '<br>' + '👽 Teacher: —' + '</div>'
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
            })




        }
        document.getElementById('refreshhashcreateform').click();

        let activeConvId = getChatId();

        if (activeConvId) {
            document.getElementById('chathashlnk').value = activeConvId

            fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/click", {
                "headers": {
                    "content-type": "application/json",
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

            fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/form", {
                "headers": {
                    "content-type": "application/json",
                },
                "body": `{\"conversationId\":\"${activeConvId}\"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });
        }

        function changeprioritycolor() {
            if (document.getElementById('priority').children[1].selected == true)
                document.getElementById('priority').style = "color:green;font-weight:600; width: 100%; height: 25px; text-align: center;"
            else if (document.getElementById('priority').children[2].selected == true)
                document.getElementById('priority').style = "color:orange;font-weight:600; width: 100%; height: 25px; text-align: center;"
            else if (document.getElementById('priority').children[3].selected == true)
                document.getElementById('priority').style = "color:red;font-weight:600;width: 100%;  height: 25px; text-align: center;"
            else document.getElementById('priority').style = "color:#000;font-weight:400;width: 100%; height: 25px; text-align: center;"
        }

        document.getElementById('priority').onchange = changeprioritycolor;

        document.getElementById('NoteNoticeText').onclick = NoteNoticeClear;

        document.getElementById('clearcreateform').onclick = function () {
            document.getElementById('chathashlnk').style.background = '#cac1b1';
            document.getElementById('chathashlnk').value = '';
            document.getElementById('taskcomment').value = '';
            document.getElementById('taskcomment').style.background = '';
            document.getElementById('taskserviceid').value = '';
            document.getElementById('taskserviceid').style.background = '';
            document.getElementById('taskserviceid').style = 'color:#000; font-weight:400;width:100%'
            document.getElementById('taskuserid').value = '';
            document.getElementById('taskuserid').style.background = '';
            document.getElementById('priority').children[0].selected = true
            document.getElementById('priority').style = "color:#000;font-weight:400;width: 100%; height: 25px; text-align: center;"
            document.getElementById('customerservice').children[0].selected = true
            document.getElementById('customerservice').style.background = '';
            NoteNoticeClear();
        }

        document.getElementById('critteachertostudent').onclick = function () {
            document.getElementById('priority').children[3].selected = true;
            document.getElementById('priority').style = "color:red;font-weight:600;width: 100%;  height: 25px; text-align: center;"
            document.getElementById('customerservice').children[1].selected = true;

            NoteFlag = 1
            NoteText = 'Обратился П. Связаться с У.'
            NoteNoticeSet();

            document.getElementById('taskuserid').value = SearchinAFnewUI("nextClass-studentId")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nПроверил связь с П, все ок, свяжитесь с У!"
        }

        document.getElementById('critstudenttoteacher').onclick = function () {
            document.getElementById('priority').children[3].selected = true;
            document.getElementById('priority').style = "color:red;font-weight:600;width: 100%;  height: 25px; text-align: center;"
            document.getElementById('customerservice').children[1].selected = true;

            NoteFlag = 1
            NoteText = 'Обратился У. Связаться с П.'
            NoteNoticeSet();

            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nПроверил связь с У, все ок, свяжитесь с П!"
        }

        document.getElementById('critteacherno').onclick = function () {
            document.getElementById('priority').children[3].selected = true;
            document.getElementById('priority').style = "color:red;font-weight:600;width: 100%;  height: 25px; text-align: center;"
            document.getElementById('customerservice').children[1].selected = true;
            NoteFlag = 1
            NoteText = 'Крит Н.О. П'
            NoteNoticeSet();
            document.getElementById('taskuserid').value = SearchinAFnewUI("nextClass-studentId")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nНеполадка со стороны П. в чате н.о. Пожалуйста, свяжитесь с П"
        }

        document.getElementById('critstudentno').onclick = function () {
            document.getElementById('priority').children[3].selected = true;
            document.getElementById('priority').style = "color:red;font-weight:600;width: 100%;  height: 25px; text-align: center;"
            document.getElementById('customerservice').children[1].selected = true;
            NoteFlag = 1
            NoteText = 'Крит Н.О. У'
            NoteNoticeSet();
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nНеполадка со стороны У. в чате н.о. Пожалуйста, свяжитесь с У"
        }

        document.getElementById('highsecondline').onclick = function () {
            document.getElementById('priority').children[2].selected = true;
            document.getElementById('priority').style = "color:orange;font-weight:600; width: 100%; height: 25px; text-align: center;"
            document.getElementById('customerservice').children[6].selected = true;
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = '';
            document.querySelector('#taskcomment').value = "Дата и время календаря:\nПриоритетный способ связи:\nОписание неполадки:\nЧто было сделано:"
        }

        document.getElementById('highteachertc').onclick = function () {
            document.getElementById('priority').children[2].selected = true;
            document.getElementById('priority').style = "color:orange;font-weight:600; width: 100%; height: 25px; text-align: center;"
            document.getElementById('customerservice').children[2].selected = true;
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = '';
        }


        document.getElementById('highteachersc').onclick = function () {
            document.getElementById('priority').children[2].selected = true;
            document.getElementById('customerservice').children[5].selected = true;
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = '';
        }

        document.getElementById('lowkm').onclick = function () {
            document.getElementById('priority').children[1].selected = true;
            document.getElementById('priority').style = "color:green;font-weight:600; width: 100%; height: 25px; text-align: center;"
            document.getElementById('customerservice').children[7].selected = true;
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId")
        }

        document.getElementById('lowcontrol').onclick = function () {
            document.getElementById('priority').children[1].selected = true;
            document.getElementById('priority').style = "color:green;font-weight:600; width: 100%; height: 25px; text-align: center;"
            document.getElementById('customerservice').children[8].selected = true;
            NoteNoticeClear()
            document.getElementById('taskuserid').value = SearchinAFnewUI("id")
            document.getElementById('taskcomment').value = document.getElementById('taskcomment').value + "\nКонтроль"
        }

        document.getElementById('createtask').onclick = function () {
            let prioritystate;
            let csstate;
            let usluga;

            let taskflagempty = 0;
            let idflagempty = 0;

            if (document.getElementById('chathashlnk').value.length < 3) {
                document.getElementById('chathashlnk').style.background = 'Coral';
                taskflagempty = 1;
            } else { document.getElementById('chathashlnk').style.background = '#cac1b1'; }

            if (document.getElementById('priority').value != 'Приоритет') {
                document.getElementById('priority').style.background = '';
                for (let i = 0; i < document.getElementById('priority').children.length; i++) {
                    if (document.getElementById('priority').children[i].selected == true)
                        prioritystate = document.getElementById('priority').children[i].value
                }
            } else {
                document.getElementById('priority').style.background = 'Coral';
                taskflagempty = 1;
            }

            if (document.getElementById('customerservice').value != 'Отдел') {
                document.getElementById('customerservice').style.background = '';
                for (let i = 0; i < document.getElementById('customerservice').children.length; i++) {
                    if (document.getElementById('customerservice').children[i].selected == true)
                        csstate = document.getElementById('customerservice').children[i].value
                }
            } else {
                document.getElementById('customerservice').style.background = 'Coral';
                taskflagempty = 1;
            }

            if (document.getElementById('taskserviceid').value.length < 3) {
                if (document.getElementById('priority').value == 'highest') {
                    document.getElementById('taskserviceid').style.background = 'Coral';
                    taskflagempty = 1;
                } else {
                    document.getElementById('taskserviceid').style.background = '';
                }
            } else {
                document.getElementById('taskserviceid').style.background = '';
            }

            if (document.getElementById('customerservice').value == 'crisis_manager') {
                if (document.getElementById('taskserviceid').value.length < 3) {
                    document.getElementById('taskserviceid').style.background = 'Coral';
                    taskflagempty = 1;
                } else {
                    document.getElementById('taskserviceid').style.background = '';
                }
            } else {
                document.getElementById('taskserviceid').style.background = '';
            }

            if (document.getElementById('taskuserid').value.length < 3) {
                document.getElementById('taskuserid').style.background = 'Coral';
                taskflagempty = 1;
            } else { document.getElementById('taskuserid').style.background = ''; }

            if (document.getElementById('taskcomment').value.length < 3) {
                document.getElementById('taskcomment').style.background = 'Coral';
                taskflagempty = 1;
            } else { document.getElementById('taskcomment').style.background = ''; }

            if (taskflagempty == 0) {
                if (document.getElementById('taskserviceid').value == '')
                    usluga = document.getElementById('taskserviceid').value = null;
                else usluga = document.getElementById('taskserviceid').value


                if (SearchinAFnewUI("id")) {
                    idflagempty = 1;
                }

                conversid = document.getElementById('chathashlnk').value;
                if (idflagempty == 1) {
                    fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/form", {
                        "headers": {
                            "content-type": "application/json",
                        },
                        "body": `{\"conversationId\":\"${conversid}",\"elements\":[{\"name\":\"priority\",\"value\":\"${prioritystate}\"},{\"name\":\"category\",\"value\":\"${csstate}\"},{\"name\":\"educationServiceIdInput\",\"value\":${usluga}},{\"name\":\"userId\",\"value\":${document.getElementById('taskuserid').value.trim()}},{\"name\":\"comment\",\"value\":\"${document.getElementById('taskcomment').value.replaceAll("\n", "\\n").replaceAll(/"/g, "``")}\"}]}`,
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
                } else {
                    fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/form", {
                        "headers": {
                            "content-type": "application/json",
                        },
                        "body": `{\"conversationId\":\"${conversid}",\"elements\":[{\"name\":\"priority\",\"value\":\"${prioritystate}\"},{\"name\":\"category\",\"value\":\"${csstate}\"},{\"name\":\"educationServiceIdInput\",\"value\":${usluga}},{\"name\":\"userId\",\"value\":${document.getElementById('taskuserid').value.trim()}},{\"name\":\"initiatorId\",\"value\":${document.getElementById('taskuserid').value.trim()}},{\"name\":\"comment\",\"value\":\"${document.getElementById('taskcomment').value.replaceAll("\n", "\\n").replaceAll(/"/g, "``")}\"}]}`,
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
                }

                if (NoteFlag == 1) {
                    sendComment(NoteText);
                    NoteNoticeClear();
                }

                document.getElementById('taskcomment').value = '';
                document.getElementById('chathashlnk').value = '';
                document.getElementById('taskserviceid').value = '';
                document.getElementById('taskuserid').value = '';
                document.getElementById('priority').children[0].selected = true
                document.getElementById('customerservice').children[0].selected = true
                document.getElementById('AF_Createtask').style.display = 'none'
                document.getElementById('taskBut').classList.remove('activeScriptBtn')

            } else alert("Задача не была создана, проверьте, пожалуйста, заполнение полей")
        }

        document.getElementById('taskcreate2linecrm').onclick = function () {
            if (document.getElementById('taskuserid').value != '') {
                window.open("https://crm2.skyeng.ru/persons/" + document.getElementById('taskuserid').value + "/customer-support/manual")
            } else alert("Введите ID пользователя в соответствующее поле и повторите попытку")
        }


    } else {
        document.getElementById('AF_Createtask').style.display = 'none'
        taskBut.classList.remove('activeScriptBtn')
        conversid = document.getElementById('chathashlnk').value;
        fetch("https://skyeng.autofaq.ai/api/reason8/operator/customButtons/form", {
            "headers": {
                "content-type": "application/json",
            },
            "body": `{\"conversationId\":\"${conversid}\"}`,
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