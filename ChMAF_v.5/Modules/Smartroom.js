var win_smartroomform =  // описание элементов окна Мультирум пожелания/баги
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 410px;" id="smartroomsug_form_header">
                            <button title="скрывает меню" id="hideMeSmartRoomForm" style="width:50px; background: #228B22;">hide</button>
                            <button title="По нажатию обновляет хеш чата в соответствующем поле, на случай, если при открытии формы вы открыли не тот чат, в котором обратился пользователь" id="refreshhashsmartform" style="width:24px;">♻</button>
                            <button title="По нажатию очищает поля и сбрасывает в дефолтное состояние формы" id="clearsmartroomform" style="width:24px;">🧹</button>
							<button title="Инструкция по этой форме" id="smartroomforminstr" style="float:right">❓</button>
                        </div>

                        <div style="margin: 5px; margin-top: 0px; width: 410px" id="smartroom_form_menu">

							<label style="color:#c4ffd3; padding:5px; font-weight: 600;">Тип клиента</label>
							<br>
							<div style="margin-top:5px; color:bisque;" id = "smartroomuser">
								<input type="radio" id="typestudadults" name="typetoform" value="Ученик Adults">
								<label for="typestud">Ученик Adults</label>
								<input type="radio" id="typestudkids" name="typetoform" value="Ученик Kids">
								<label for="typestud">Ученик Kids</label>
								<input type="radio" id="typestudprem" name="typetoform" value="Ученик Premium">
								<label for="typestudprem">Ученик Premium</label>
								<br>
							    <input type="radio" id="typeteach" name="typetoform" value="Преподаватель">
								<label for="typeteach">Преподаватель</label>
							</div>
							<input id="clientid" placeholder="ID пользователя" autocomplete="off" type="text">
							<br>
							<div style="margin-top:5px; color:#c4ffd3; padding:5px; font-weight: 600;">С чем обратились?</div>
							<div style="margin-top:5px; color:bisque;" id = "smartroomquestion">
								<input type="radio" id="whatobratsugest" name="whatobratform" value="Пожелание по мультирум" checked>
								<label for="whatobratsugest">Пожелание по мультирум</label>
								<input type="radio" id="whattonegative" name="whatobratform" value="Негатив по мультирум">
								<label for="whattonegative">Негатив по мультирум</label>
							</div>
							<div style="color:#c4ffd3; padding:5px; font-weight: 600;">Категория 1</div>
								<label class="catsmartroom"><input class="radio" type="radio" name="catsmartroom" value="Обновление платформы" resolved="" checked> Обновление платформы</label>
							</div>

							<div style="color:#c4ffd3; padding:5px; font-weight: 600;">Категория 2</div>
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

							<div style="color:#c4ffd3; padding:5px; font-weight: 600;">Категория 3</div>
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
							<button title="Отправляет заполненные поля формы в док" id="send2smartroom" style="width:105px; position: relative; left: 50%; margin-top: 5px; transform: translate(-50%, 0);">Отправить</button>
						</div>
				</span>
        </span>
</div>`;

if (localStorage.getItem('winTopSmartroom') == null) { //начальное положение окна Smartroom
    localStorage.setItem('winTopSmartroom', '295');
    localStorage.setItem('winLeftSmartroom', '295');
}

let wintSmartroom = document.createElement('div'); // создание окна Мультирум пожелания/баги
document.body.append(wintSmartroom);
wintSmartroom.style = 'min-height: 25px; width: 420px; background: #464451; top: ' + localStorage.getItem('winTopSmartroom') + 'px; left: ' + localStorage.getItem('winLeftSmartroom') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintSmartroom.style.display = 'none';
wintSmartroom.setAttribute('id', 'AF_Smartroomform');
wintSmartroom.innerHTML = win_smartroomform;

wintSmartroom.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintSmartroom.offsetLeft;
    let elemTop = wintSmartroom.offsetTop;

    function onMouseMove(event) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintSmartroom.style.left = (elemLeft + deltaX) + "px";
      wintSmartroom.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopSmartroom', String(elemTop + deltaY));
      localStorage.setItem('winLeftSmartroom', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
}; // прекращение изменения позиции окна Мультирум пожелания/баги


document.getElementById('AF_Smartroomform').ondblclick = function (a) { // скрытие окна Мультирум пожелания/баги от помощи по двойному клику
    if (checkelementtype(a)) { document.getElementById('AF_Smartroomform').style.display = 'none'; }
}

    document.getElementById('smartroomform').onclick = function () {
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
            for (let j = 0; j < 4; j++) {
                document.getElementsByName('typetoform')[j].checked = false
            }
			
			document.getElementById('cattwosmatrtoom')[0].selected = true
			document.getElementById('catthreesmatrtoom')[0].selected = true

        }
        let useridis = SearchinAFnewUI('id');
        let userType = SearchinAFnewUI('userType');

        if (useridis){
            document.getElementById('clientid').value = useridis;
            if (userType === 'teacher'){
                        document.getElementsByName('typetoform')[3].checked = true
            } else if (userType === 'parent') {
                document.getElementsByName('typetoform')[1].checked = true
            } else if (userType === 'student') {
                let verticalis = SearchinAFnewUI("supportVertical");
                if (verticalis === 'Adult') {
                    document.getElementsByName('typetoform')[0].checked = true
                } else if (verticalis === 'Kids') {
                    document.getElementsByName('typetoform')[1].checked = true
                }
            }
        }

        document.getElementById('send2smartroom').onclick = function () {

            let checkedclienttype;
            let checkedquestion;
            let alloptions;
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
				
				for (let i =0; i<document.getElementById('cattwosmatrtoom').length;i++) {
					if (document.getElementById('cattwosmatrtoom')[i].selected == true)
					cat2selected = document.getElementById('cattwosmatrtoom')[i].value
				}
				
				for (let i =0; i<document.getElementById('catthreesmatrtoom').length;i++) {
					if (document.getElementById('catthreesmatrtoom')[i].selected == true)
					cat3selected = document.getElementById('catthreesmatrtoom')[i].value
				}
					

				for (let i =0; i<document.getElementsByName('whatobratform').length;i++) {
					if (document.getElementsByName('whatobratform')[i].checked == true)
					checkedquestion = document.getElementsByName('whatobratform')[i].value;
				}					

				let body2 = 'entry.466256037=' + encodeURIComponent(checkedclienttype) + '&entry.505070950=' + encodeURIComponent(document.getElementById('clientid').value) + '&entry.876256156=' + encodeURIComponent(checkedquestion) + '&entry.1879097323=' + encodeURIComponent(document.getElementById('fullcomentsmartroom').value) + '&entry.156405977=' + encodeURIComponent(document.getElementsByName('catsmartroom')[0].value) + '&entry.1625340245=' + encodeURIComponent(cat2selected) + '&entry.478427702=' + encodeURIComponent(cat3selected)

				let options2 = {
					"headers": {
						"content-type": "application/x-www-form-urlencoded",
					},
					"body": body2,
					"method": "POST",
				}

				document.getElementById('responseTextarea1').value = JSON.stringify(options2)
				document.getElementById('responseTextarea2').value = 'https://docs.google.com/forms/u/1/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/formResponse'
				if (document.getElementById('responseTextarea3') != null)
					document.getElementById('responseTextarea3').value = ''
				document.getElementById('sendResponse').click()

				document.getElementById('AF_Smartroomform').style.display = 'none'
				document.getElementById('clientid').value = ''
				document.getElementById('fullcomentsmartroom').value = ''
				clearradio()
				sendComment('Отправка в документ "Пожелания Смартрум" прошла успешно')

                     
				
            }
        }

        document.getElementById('clearsmartroomform').onclick = function () {
            document.getElementById('clientid').value = ''
            document.getElementById('fullcomentsmartroom').value = ''
            document.getElementById('otheroptionsmartchecked').value = ''
            document.getElementById('smartroomuser').style.background = '';
            document.getElementById('clientid').style.background = '';
            document.getElementById('smartroomquestion').style.background = '';
            document.getElementById('fullcomentsmartroom').style.background = '';
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