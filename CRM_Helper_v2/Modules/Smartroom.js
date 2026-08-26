var win_smartroomform =  // описание элементов окна Мультирум пожелания/баги
	`<div class="maindivst" style="display: flex; width: 414px;">
		<div>
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 410px;" id="smartroomsug_form_header">
                            <button class="buttonHide" title="скрывает меню" id="hideMeSmartRoomForm">hide</button>
                            <button class="btnCRM btnCRMsmall" title="По нажатию обновляет хеш чата в соответствующем поле, на случай, если при открытии формы вы открыли не тот чат, в котором обратился пользователь" id="refreshhashsmartform" style="width:30px;">♻</button>
                            <button class="btnCRM btnCRMsmall" title="По нажатию очищает поля и сбрасывает в дефолтное состояние формы" id="clearsmartroomform" style="width:30px;">🧹</button>
							<button class="btnCRM btnCRMsmall" title="Инструкция по этой форме" id="smartroomforminstr" style="float:right">❓</button>
                        </div>

                        <div style="margin: 5px; margin-top: 0px; width: 410px" id="smartroom_form_menu">
							<label style="color:#c4ffd3; padding:5px; font-weight: 500;">Тип клиента</label>
							<br>
							<div style="margin-top:5px; margin-bottom:5px;" id = "smartroomuser">
								<input class = "smartroom-radio" type="radio" id="typestudadults" name="typetoform" value="Ученик Adults">
								<label class = "smartroom-label spanCRM" for="typestudadults">Ученик Adults</label>
								<input class = "smartroom-radio" type="radio" id="typestudkids" name="typetoform" value="Ученик Kids">
								<label class = "smartroom-label spanCRM" for="typestudkids">Ученик Kids</label>
								<input class = "smartroom-radio" type="radio" id="typestudprem" name="typetoform" value="Ученик Premium">
								<label class = "smartroom-label spanCRM" for="typestudprem">Ученик Premium</label>
								<br>
							    <input class = "smartroom-radio" type="radio" id="typeteach" name="typetoform" value="Преподаватель">
								<label class = "smartroom-label spanCRM" for="typeteach">Преподаватель</label>
							</div>

                            <label style="margin-top: 5px; color:#c4ffd3; padding:5px; font-weight: 500;">Формат обучения</label>
							<br>
							<div style="margin-top:5px; margin-bottom: 5px;" id = "smartroomformat">
								<input class = "smartroom-radio" type="radio" id="formatF2F" name="formattoform" value="F2F">
								<label class = "smartroom-label spanCRM" for="formatF2F">F2F</label>
								<input class = "smartroom-radio" type="radio" id="formatF2G" name="formattoform" value="F2G">
								<label class = "smartroom-label spanCRM" for="formatF2G">F2G</label>
								<input class = "smartroom-radio" type="radio" id="formatvebinar" name="formattoform" value="Вебинар">
								<label class = "smartroom-label spanCRM" for="formatvebinar">Вебинар</label>
							    <input class = "smartroom-radio" type="radio" id="formatPU" name="formattoform" value="ПУ">
								<label class = "smartroom-label spanCRM" for="formatPU">ПУ</label>
							</div>

							<input class="inputCRM" id="clientid" style="margin-top:5px;" placeholder="ID пользователя" autocomplete="off" type="text">
							<br>

							<div style="margin-top:5px; color:#c4ffd3; padding:5px; font-weight: 500;" id = "smartroomquestion">С чем обратились?</div>
								<input class = "smartroom-radio" type="radio" id="whatobratsugest" name="whatobratform" value="Пожелание по улучшению">
								<label class = "smartroom-label spanCRM" for="whatobratsugest">Пожелания</label>
								<input class = "smartroom-radio" type="radio" id="whattonegative" name="whatobratform" value="Негатив по работе функционала платформы">
								<label class = "smartroom-label spanCRM" for="whattonegative">Негатив</label>
							
							<div style="color:#c4ffd3; padding:5px; font-weight: 500;" id = "smartroomecosysrem">Экосистема</div>
                                <input class = "smartroom-radio" type="radio" id="ecosystemplat" name="smartroomecos" value="Функционал платформы"> 
                                <label class = "smartroom-label spanCRM" for="ecosystemplat">Функционал платформы</label>
                                <input class = "smartroom-radio" type="radio" id="ecosystemios" name="smartroomecos" value="Мобильное приложение IOS"> 
                                <label class = "smartroom-label spanCRM" for="ecosystemios">МП IOS</label>
                                <input class = "smartroom-radio" type="radio" id="ecosystemandr" name="smartroomecos" value="Мобильное приложение Android"> 
                                <label class = "smartroom-label spanCRM" for="ecosystemandr">МП Android</label>

							<div style="color:#c4ffd3; padding:5px; font-weight: 500;">Тема</div>
							<div>
								<select class="inputCRM" id="cattwosmatrtoom" style="margin-left: 5px; padding-top: 5px; vertical-align: middle; color: black;">
									<option style="background-color:DarkKhaki;" value="Выбрать категорию" disabled selected>Выбрать категорию</option>
									<option value="Домашние задания">-Домашние задания</option>
									<option value="Интерфейс платформы">-Интерфейс платформы</option>
									<option value="Функционал урока П">-Функционал урока П</option>
									<option value="Функционал урока У">-Функционал урока У</option>
									<option value="Вернуть старую платформу">-Вернуть старую платформу</option>
									<option value="Мобильное приложение Skyeng">-Мобильное приложение Skyeng</option>
                                </select>
							</div>	

							<div style="color:#c4ffd3; padding:5px; font-weight: 500;">Подтема</div>
							<div>
								<select class="inputCRM" id="catthreesmatrtoom" style="margin-left: 5px; padding-top: 5px; vertical-align: middle; color: black;">
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
							<textarea class="textareaCRM"id="fullcomentsmartroom" placeholder="Полный комментарий предложения по улучшению" autocomplete="off" type="text" style="text-align: center; width: 405px; color: black; margin-top: 5px" data-gramm="false" wt-ignore-input="true"></textarea>
						<br>
							<button class="btnCRM" title="Отправляет заполненные поля формы в док" id="send2smartroom" style="width:105px; position: relative; left: 50%; margin-top: 5px; transform: translate(-50%, 0);">Отправить</button>
						</div>
				</span>
        </span>
		</div>
</div>`;

const wintSmartroom = createWindowCRM('AF_Smartroomform', 'winTopSmartroom', 'winLeftSmartroom', win_smartroomform);
hideWindowOnDoubleClick('AF_Smartroomform');
hideWindowOnClick('AF_Smartroomform', 'hideMeSmartRoomForm');


document.getElementById('smartroomformCRM').onclick = function () {
	if (document.getElementById('AF_Smartroomform').style.display == '') {
		document.getElementById('AF_Smartroomform').style.display = 'none'
		document.getElementById('idmymenucrm').style.display = 'none'
	} else {
		document.getElementById('AF_Smartroomform').style.display = ''
		document.getElementById('idmymenucrm').style.display = 'none'
	}

    function clearradio() { // функция очистки радиобатонов
        let cheksradio = document.getElementsByClassName('smartroom-radio');
        for (let j = 0; j < cheksradio.length; j++) {
            cheksradio[j].checked = false
        }
		document.getElementById('cattwosmatrtoom').selectedIndex = 0;
		document.getElementById('catthreesmatrtoom').selectedIndex = 0;
    }

	if (location.pathname.split('/')[4] == 'task')
		document.getElementById('fullcomentsmartroom').value = document.getElementsByTagName('crm-grid')[8].children[0].innerText.replace('Комментарий\n', '')

	if (document.URL.split('/')[3] == 'persons') {
		var clientId = document.URL.split('/')[4];
		// Регулярное выражение для проверки, что clientId является числом от 4 до 10 цифр
		var regex = /^\d{4,10}$/;

		if (regex.test(clientId)) {
			document.getElementById('clientid').value = clientId;
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

			const requestOptions = {
				"headers": {
					"content-type": "application/x-www-form-urlencoded",
				},
				"body": body2,
				"method": "POST",
			}
			const requestAdr = 'https://docs.google.com/forms/u/1/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/formResponse';

			chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: requestAdr, requestOptions: requestOptions }, function (offerresponse) {
				if (offerresponse.success) {
					document.getElementById('send2smartroom').innerText = "Отправлено✅"
					setTimeout(() => {
						document.getElementById('send2smartroom').innerText = "Отправить"
						document.getElementById('AF_Smartroomform').style.display = 'none'
						document.getElementById('clientid').value = ''
						document.getElementById('fullcomentsmartroom').value = ''
						clearradio()
					}, 3000)
				} else {
					alert('Не удалось отправить пожелания ' + offerresponse.error);
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
		clearradio()
	}

	document.getElementById('smartroomforminstr').onclick = function () {
		window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-smartroom%F0%9F%A6%90Smartroom')
	}

	document.getElementById('refreshhashsmartform').onclick = function () {
		if (document.URL.split('/')[3] == 'persons') {
			var clientId = document.URL.split('/')[4];
			// Регулярное выражение для проверки, что clientId является числом от 4 до 10 цифр
			var regex = /^\d{4,10}$/;

			if (regex.test(clientId)) {
				document.getElementById('clientid').value = clientId;
			}
		}
		if (location.pathname.split('/')[4] == 'task')
			document.getElementById('fullcomentsmartroom').value = document.getElementsByTagName('crm-grid')[8].children[0].innerText.replace('Комментарий\n', '')
	}
}