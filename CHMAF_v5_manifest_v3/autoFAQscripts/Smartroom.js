var win_smartroomform =  // описание элементов окна Мультирум пожелания/баги
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 410px;" id="smartroomsug_form_header">
                            <button class="mainButton buttonHide" title="скрывает меню" id="hideMeSmartRoomForm">hide</button>
                            <button class="mainButton smallbtn" title="По нажатию обновляет хеш чата в соответствующем поле, на случай, если при открытии формы вы открыли не тот чат, в котором обратился пользователь" id="refreshhashsmartform" style="width:24px;">♻</button>
                            <button class="mainButton smallbtn" title="По нажатию очищает поля и сбрасывает в дефолтное состояние формы" id="clearsmartroomform" style="width:24px;">🧹</button>
							<button class="mainButton smallbtn" title="Инструкция по этой форме" id="smartroomforminstr" style="float:right; margin-right: 5px;">❓</button>
                        </div>

                        <div style="margin: 5px; margin-top: 0px; width: 410px" id="smartroom_form_menu">

							<label style="color:#c4ffd3; padding:5px; font-weight: 600;">Тип клиента</label>
							<br>
							<div style="margin-top:5px" id = "smartroomuser">
								<input class = "smartroom-radio" type="radio" id="typestudadults" name="typetoform" value="Ученик Adults">
								<label class = "smartroom-label" for="typestudadults">Ученик Adults</label>
								<input class = "smartroom-radio" type="radio" id="typestudkids" name="typetoform" value="Ученик Kids">
								<label class = "smartroom-label" for="typestudkids">Ученик Kids</label>
								<input class = "smartroom-radio" type="radio" id="typestudprem" name="typetoform" value="Ученик Premium">
								<label class = "smartroom-label" for="typestudprem">Ученик Premium</label>
								<br>
							    <input class = "smartroom-radio" type="radio" id="typeteach" name="typetoform" value="Преподаватель">
								<label class = "smartroom-label" for="typeteach">Преподаватель</label>
							</div>
                            <label style="color:#c4ffd3; padding:5px; font-weight: 600;">Формат обучения</label>
							<br>
							<div style="margin-top:5px; margin-bottom: 5px;" id = "smartroomformat">
								<input class = "smartroom-radio" type="radio" id="formatF2F" name="formattoform" value="F2F">
								<label class = "smartroom-label" for="formatF2F">F2F</label>
								<input class = "smartroom-radio" type="radio" id="formatF2G" name="formattoform" value="F2G">
								<label class = "smartroom-label" for="formatF2G">F2G</label>
								<input class = "smartroom-radio" type="radio" id="formatvebinar" name="formattoform" value="Вебинар">
								<label class = "smartroom-label" for="formatvebinar">Вебинар</label>
							    <input class = "smartroom-radio" type="radio" id="formatPU" name="formattoform" value="ПУ">
								<label class = "smartroom-label" for="formatPU">ПУ</label>
							</div>
							<input id="clientid" placeholder="ID пользователя" autocomplete="off" type="text">
							<br>
							<div style="margin-top:5px; color:#c4ffd3; padding:5px; font-weight: 600;" id = "smartroomquestion">С чем обратились?</div>
								<input class = "smartroom-radio" type="radio" id="whatobratsugest" name="whatobratform" value="Пожелание по улучшению">
								<label class = "smartroom-label" for="whatobratsugest">Пожелания</label>
								<input class = "smartroom-radio" type="radio" id="whattonegative" name="whatobratform" value="Негатив по работе функционала платформы">
								<label class = "smartroom-label" for="whattonegative">Негатив</label>
							</div>
							<div style="color:#c4ffd3; padding:5px; font-weight: 600;" id = "smartroomecosysrem">Экосистема</div>
                                <input class = "smartroom-radio" type="radio" id="ecosystemplat" name="smartroomecos" value="Функционал платформы"> 
                                <label class = "smartroom-label" for="ecosystemplat">Функционал платформы</label>
                                <input class = "smartroom-radio" type="radio" id="ecosystemios" name="smartroomecos" value="Мобильное приложение IOS"> 
                                <label class = "smartroom-label" for="ecosystemios">МП IOS</label>
                                <input class = "smartroom-radio" type="radio" id="ecosystemandr" name="smartroomecos" value="Мобильное приложение Android"> 
                                <label class = "smartroom-label" for="ecosystemandr">МП Android</label>
							</div>

							<div style="color:#c4ffd3; padding:5px; font-weight: 600;">Тема</div>
								<select id="cattwosmatrtoom" style="margin-left: 5px; padding-top: 5px; font-size: 16px; vertical-align: middle; color: black;">
									<option style="background-color:DarkKhaki;" value="Выбрать категорию" disabled selected>Выбрать категорию</option>
									<option value="Домашние задания">-Домашние задания</option>
									<option value="Интерфейс платформы">-Интерфейс платформы</option>
									<option value="Функционал урока П">-Функционал урока П</option>
									<option value="Функционал урока У">-Функционал урока У</option>
									<option value="Вернуть старую платформу">-Вернуть старую платформу</option>
									<option value="Мобильное приложение Skyeng">-Мобильное приложение Skyeng</option>
                                </select>
							</div>

							<div style="color:#c4ffd3; padding:5px; font-weight: 600;">Подтема</div>
								<select id="catthreesmatrtoom" style="margin-left: 5px; padding-top: 5px; font-size: 16px; vertical-align: middle; color: black;">
									<option style="background-color:DarkKhaki;" value="Выбрать категорию" disabled selected>Выбрать категорию</option>
									<option value="Интерфейс раздела домашки">-Интерфейс раздела домашки</option>
									<option value="Нет">-Нет</option>
									<option value="Перемешаны слайды в уроке">-Перемешаны слайды в уроке</option>
									<option value="План урока">-План урока</option>
									<option value="План урока\\домашки">-План урока\домашки</option>
									<option value="Вложения">-Вложения</option>
									<option value="Домашка">-Домашка</option>
									<option value="Информирование">-Информирование</option>
									<option value="Навигация в домашке">-Навигация в домашке</option>
									<option value="Не видно какие уроки уже пройдены У">-Не видно какие уроки уже пройдены У</option>
									<option value="П не может изменить оценку">-П не может изменить оценку</option>
									<option value="Предложения по улучшению">-Предложения по улучшению</option>
									<option value="Сброс ответов">-Сброс ответов</option>
									<option value="Вход в урок">-Вход в урок</option>
									<option value="Заметки">-Заметки</option>
									<option value="Масштабирование видео">-Масштабирование видео</option>
									<option value="Не находит словарь">-Не находит словарь</option>
									<option value="Нет отображения кол-ва символов">-Нет отображения кол-ва символов</option>
									<option value="Нумерация степов в уроке">-Нумерация степов в уроке</option>
									<option value="ОС">-ОС</option>
									<option value="Плохой шрифт">-Плохой шрифт</option>
									<option value="Словарь">-Словарь</option>
									<option value="Урок">-Урок</option>
									<option value="Ширина доски">-Ширина доски</option>
									<option value="Баллы и картинки">-Баллы и картинки</option>
									<option value="Нет прохождения тестов">-Нет прохождения тестов</option>
									<option value="Повтор пройденного материала">-Повтор пройденного материала</option>
									<option value="Связь У с П">-Связь У с П</option>
									<option value="Звуки">-Звуки</option>
									<option value="Перевод слов на стороне У">-Перевод слов на стороне У</option>

                                </select>
							</div>

						<div>
							<textarea id="fullcomentsmartroom" placeholder="Полный комментарий предложения по улучшению" autocomplete="off" type="text" style="text-align: center; width: 405px; color: black; margin-top: 5px" data-gramm="false" wt-ignore-input="true"></textarea>
						<br>
							<button class="mainButton" title="Отправляет заполненные поля формы в док" id="send2smartroom" style="width:105px; position: relative; left: 50%; margin-top: 5px; transform: translate(-50%, 0);">Отправить</button>
						</div>
				</span>
        </span>
</div>`;

const wintSmartroom = createWindow('AF_Smartroomform', 'winTopSmartroom', 'winLeftSmartroom', win_smartroomform);
hideWindowOnDoubleClick('AF_Smartroomform');

function getsmartroomformButtonPress() {
    if (document.getElementById('AF_Smartroomform').style.display == '') {
        document.getElementById('AF_Smartroomform').style.display = 'none'
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    } else {
        document.getElementById('AF_Smartroomform').style.display = ''
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    }

    function clearradio() { // функция очистки радиобатонов
        let cheksradio = document.getElementsByClassName('smartroom-radio');
        for (let j = 0; j < cheksradio.length; j++) {
            cheksradio[j].checked = false
        }
    }

    let useridis = SearchinAFnewUI('id');
    let userType = SearchinAFnewUI('userType');

    if (useridis) {
        document.getElementById('clientid').value = useridis;
        if (userType === 'teacher') {
            document.getElementsByName('typetoform')[3].checked = true
        } else if (userType === 'parent') {
            document.getElementsByName('typetoform')[1].checked = true
        } else if (userType === 'student') {
            let verticalis = SearchinAFnewUI("supportVertical");
            if (verticalis === 'Adult' || verticalis === 'Adults') {
                document.getElementsByName('typetoform')[0].checked = true
            } else if (verticalis === 'Kids' || verticalis === 'Kid') {
                document.getElementsByName('typetoform')[1].checked = true
            }
        }
    }

    document.getElementById('send2smartroom').onclick = function () {

        let checkedclienttype;
        let checkedquestion;
        let checkeducformat;
        let checkecosystem;
        let cat2selected;
        let cat3selected;

        let flagemptysmart = 0;

        if (!document.getElementsByName('typetoform')[0].checked && !document.getElementsByName('typetoform')[1].checked && !document.getElementsByName('typetoform')[2].checked && !document.getElementsByName('typetoform')[3].checked) {
            document.getElementById('smartroomuser').style.backgroundColor = 'Coral';
            document.getElementById('smartroomuser').style.color = 'black';
            flagemptysmart = 1;
        } else {
            document.getElementById('smartroomuser').style.backgroundColor = '';
            document.getElementById('smartroomuser').style.color = '#c4ffd3';
        }
        
        if (!document.getElementsByName('formattoform')[0].checked && !document.getElementsByName('formattoform')[1].checked && !document.getElementsByName('formattoform')[2].checked && !document.getElementsByName('formattoform')[3].checked) {
            document.getElementById('smartroomformat').style.backgroundColor = 'Coral';
            document.getElementById('smartroomformat').style.color = 'black';
            flagemptysmart = 1;
        } else {
            document.getElementById('smartroomformat').style.backgroundColor = '';
            document.getElementById('smartroomformat').style.color = '#c4ffd3';
        }

        if (document.getElementById('clientid').value.length < 3) {
            document.getElementById('clientid').style.backgroundColor = 'Coral';
            flagemptysmart = 1;
        } else {
            document.getElementById('clientid').style.backgroundColor = '';
        }

        if (!document.getElementsByName('whatobratform')[0].checked && !document.getElementsByName('whatobratform')[1].checked) {
            document.getElementById('smartroomquestion').style.backgroundColor = 'Coral';
            document.getElementById('smartroomquestion').style.color = 'black';
            flagemptysmart = 1;
        } else {
            document.getElementById('smartroomquestion').style.backgroundColor = '';
            document.getElementById('smartroomquestion').style.color = '#c4ffd3';
        }

        if (!document.getElementsByName('smartroomecos')[0].checked && !document.getElementsByName('smartroomecos')[1].checked && !document.getElementsByName('smartroomecos')[2].checked) {
            document.getElementById('smartroomecosysrem').style.backgroundColor = 'Coral';
            document.getElementById('smartroomecosysrem').style.color = 'black';
            flagemptysmart = 1;
        } else {
            document.getElementById('smartroomecosysrem').style.backgroundColor = '';
            document.getElementById('smartroomecosysrem').style.color = '#c4ffd3';
        }

        if (document.getElementById('fullcomentsmartroom').value.length < 3) {
            document.getElementById('fullcomentsmartroom').style.backgroundColor = 'Coral';
            flagemptysmart = 1;
        } else {
            document.getElementById('fullcomentsmartroom').style.backgroundColor = '';
        }

        if (flagemptysmart == 0) {
            for (let i = 0; i < document.getElementsByName('typetoform').length; i++) {
                if (document.getElementsByName('typetoform')[i].checked == true)
                    checkedclienttype = document.getElementsByName('typetoform')[i].value;
            }

            for (let i = 0; i < document.getElementsByName('formattoform').length; i++) {
                if (document.getElementsByName('formattoform')[i].checked == true)
                    checkeducformat = document.getElementsByName('formattoform')[i].value;
            }

            for (let i = 0; i < document.getElementsByName('smartroomecos').length; i++) {
                if (document.getElementsByName('smartroomecos')[i].checked == true)
                    checkecosystem = document.getElementsByName('smartroomecos')[i].value;
            }

            for (let i = 0; i < document.getElementById('cattwosmatrtoom').length; i++) {
                if (document.getElementById('cattwosmatrtoom')[i].selected == true)
                    cat2selected = document.getElementById('cattwosmatrtoom')[i].value
            }

            for (let i = 0; i < document.getElementById('catthreesmatrtoom').length; i++) {
                if (document.getElementById('catthreesmatrtoom')[i].selected == true)
                    cat3selected = document.getElementById('catthreesmatrtoom')[i].value
            }

            for (let i = 0; i < document.getElementsByName('whatobratform').length; i++) {
                if (document.getElementsByName('whatobratform')[i].checked == true)
                    checkedquestion = document.getElementsByName('whatobratform')[i].value;
            }

            let body2 = 'entry.505070950=' + encodeURIComponent(document.getElementById('clientid').value) + '&entry.1879097323=' + encodeURIComponent(document.getElementById('fullcomentsmartroom').value) + '&entry.1625340245=' + encodeURIComponent(cat2selected) + '&entry.478427702=' + encodeURIComponent(cat3selected) + '&entry.466256037=' + encodeURIComponent(checkedclienttype) + '&entry.685236831=' + encodeURIComponent(checkeducformat) + '&entry.876256156=' + encodeURIComponent(checkedquestion) + '&entry.156405977=' + encodeURIComponent(checkecosystem)
            
            const fetchURL = 'https://docs.google.com/forms/u/1/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/formResponse';
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body2,
            };

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions}, function(response) {
                if (response && response.success) {
                    document.getElementById('AF_Smartroomform').style.display = 'none';
                    document.getElementById('clientid').value = '';
                    document.getElementById('fullcomentsmartroom').value = '';
                    clearradio();
                    sendComment('Отправка в документ "Пожелания Смартрум" прошла успешно');
                } else {
                    // В случае ошибки
                    console.error('Ошибка при отправке в документ "Пожелания Смартрум":', response.error);
                }
            });
        }
    }

    document.getElementById('clearsmartroomform').onclick = function () {
        document.getElementById('clientid').value = ''
        document.getElementById('fullcomentsmartroom').value = ''
        document.getElementById('smartroomuser').style.background = '';
        document.getElementById('clientid').style.background = '';
        document.getElementById('smartroomquestion').style.background = '';
        document.getElementById('fullcomentsmartroom').style.background = '';
        document.getElementById('smartroomformat').style.background = '';
        document.getElementById('smartroomecosysrem').style.background = '';
        clearradio()
    }

    document.getElementById('smartroomforminstr').onclick = function () {
        window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-smartroom%F0%9F%A6%90Smartroom')
    }

    document.getElementById('hideMeSmartRoomForm').onclick = function () {
        document.getElementById('AF_Smartroomform').style.display = 'none'
        document.getElementById('clientid').value = ''
        document.getElementById('fullcomentsmartroom').value = ''
        clearradio()
    }

    document.getElementById('refreshhashsmartform').onclick = function () {
        for (i = 0; document.getElementsByClassName('expert-user_details-list')[1].childNodes[i] != undefined; i++) {
            if (document.getElementsByClassName('expert-user_details-list')[1].childNodes[i].firstChild.innerText == "id") {
                document.getElementById('clientid').value = document.getElementsByClassName('expert-user_details-list')[1].childNodes[i].childNodes[1].innerText.split(' ')[0]
            } else if (document.getElementsByClassName('expert-user_details-list')[1].childNodes[i].firstChild.innerText == "userType") {
                if (document.getElementsByClassName('expert-user_details-list')[1].childNodes[i].childNodes[1].innerText.split(' ')[0] == 'student' || document.getElementsByClassName('expert-user_details-list')[1].childNodes[i].childNodes[1].innerText.split(' ')[0] == 'parent') {
                    document.getElementsByName('typetoform')[0].checked = true
                    document.getElementsByName('typetoform')[3].checked = false
                } else if (document.getElementsByClassName('expert-user_details-list')[1].childNodes[i].childNodes[1].innerText.split(' ')[0] == 'teacher') {
                    document.getElementsByName('typetoform')[0].checked = false
                    document.getElementsByName('typetoform')[3].checked = true
                } else {
                    document.getElementsByName('typetoform')[0].checked = false
                    document.getElementsByName('typetoform')[1].checked = false
                    document.getElementsByName('typetoform')[2].checked = false
                    document.getElementsByName('typetoform')[3].checked = false
                }
            }
        }
    }
}