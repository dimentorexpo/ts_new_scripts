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
							<div style="margin-top:5px; border-bottom: 2px dashed rgb(101, 101, 207);" id = "smartroomuser">
                            	<label style="color:#c4ffd3; padding:5px; font-weight: 600;">Тип клиента</label> <br>
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
                            <div style="margin-top:5px; margin-bottom: 5px; border-bottom: 2px dashed rgb(101, 101, 207);" id = "smartroomformat">
                                <label style="color:#c4ffd3; padding:5px; font-weight: 600;">Формат обучения</label> <br>
								<input class = "smartroom-radio" type="radio" id="formatF2F" name="formattoform" value="F2F">
								<label class = "smartroom-label" for="formatF2F">F2F</label>
								<input class = "smartroom-radio" type="radio" id="formatF2G" name="formattoform" value="F2G">
								<label class = "smartroom-label" for="formatF2G">F2G</label>
								<input class = "smartroom-radio" type="radio" id="formatvebinar" name="formattoform" value="Вебинар">
								<label class = "smartroom-label" for="formatvebinar">Вебинар</label>
							    <input class = "smartroom-radio" type="radio" id="formatPU" name="formattoform" value="ПУ">
								<label class = "smartroom-label" for="formatPU">ПУ</label>
							</div>
							<input class="" id="clientid" placeholder="ID пользователя" autocomplete="off" type="text" style="margin-left: 5px; width: calc(100% - 10px); padding-top: 5px; font-size: 16px; vertical-align: middle;">
							<br>
							<div style="margin-top:5px; color:#c4ffd3; padding:5px; font-weight: 600; border-bottom: 2px dashed rgb(101, 101, 207);" id = "smartroomquestion">
                                <label style="color:#c4ffd3; padding:5px; font-weight: 600;">С чем обратились?</label> <br>
								<input class = "smartroom-radio" type="radio" checked="true" id="whatobratsugest" name="whatobratform" value="Пожелание по улучшению">
								<label class = "smartroom-label" for="whatobratsugest">Пожелания</label>

							</div>
							<div style="color:#c4ffd3; padding:5px; font-weight: 600; border-bottom: 2px dashed rgb(101, 101, 207);" id = "smartroomecosysrem">
                                <label style="color:#c4ffd3; padding:5px; font-weight: 600;">Экосистема</label> <br>
                                <input class = "smartroom-radio" type="radio" id="ecosystemplat" name="smartroomecos" value="Функционал платформы">
                                <label class = "smartroom-label" for="ecosystemplat">Функционал платформы</label>
                                <input class = "smartroom-radio" type="radio" id="ecosystemios" name="smartroomecos" value="Мобильное приложение IOS">
                                <label class = "smartroom-label" for="ecosystemios">МП IOS</label>
                                <input class = "smartroom-radio" type="radio" id="ecosystemandr" name="smartroomecos" value="Мобильное приложение Android">
                                <label class = "smartroom-label" for="ecosystemandr">МП Android</label>
							</div>
							<div style="color:#c4ffd3; padding:5px; font-weight: 600; border-bottom: 2px dashed rgb(101, 101, 207);">
								<input type="text" id="cattwosmatrtoom" list="cattwosmatrtoom-options-list" placeholder="Выбрать тему" class=" listinput" style="margin-left: 5px; width: calc(100% - 10px); padding-top: 5px; font-size: 16px; vertical-align: middle;">
                                <datalist id="cattwosmatrtoom-options-list">
									<option value="Домашние задания">
									<option value="Интерфейс платформы">
									<option value="Функционал урока П">
									<option value="Функционал урока У">
									<option value="Вернуть старую платформу">
									<option value="Мобильное приложение Skyeng">
                                </datalist>
							</div>

							<div style="color:#c4ffd3; padding:5px; font-weight: 600; border-bottom: 2px dashed rgb(101, 101, 207);">
								<input type="text" id="catthreesmatrtoom" list="catthreesmatrtoom-options-list" placeholder="Выбрать подтему" class=" listinput" style="margin-left: 5px; width: calc(100% - 10px); padding-top: 5px; font-size: 16px; vertical-align: middle;">
                                <datalist id="catthreesmatrtoom-options-list">
									<option value="Интерфейс раздела домашки">
									<option value="Нет">
									<option value="Перемешаны слайды в уроке">
									<option value="План урока">
									<option value="План урока\\домашки">
									<option value="Вложения">
									<option value="Домашка">
									<option value="Информирование">
									<option value="Навигация в домашке">
									<option value="Не видно какие уроки уже пройдены У">
									<option value="П не может изменить оценку">
									<option value="Предложения по улучшению">
									<option value="Сброс ответов">
									<option value="Вход в урок">
									<option value="Заметки">
									<option value="Масштабирование видео">
									<option value="Не находит словарь">
									<option value="Нет отображения кол-ва символов">
									<option value="Нумерация степов в уроке">
									<option value="ОС">
									<option value="Плохой шрифт">
									<option value="Словарь">
									<option value="Урок">
									<option value="Ширина доски">
									<option value="Баллы и картинки">
									<option value="Нет прохождения тестов">
									<option value="Повтор пройденного материала">
									<option value="Связь У с П">
									<option value="Звуки">
									<option value="Перевод слов на стороне У">
                                </datalist>
                            </div>

						<div>
							<textarea class="" id="fullcomentsmartroom" placeholder="Полный комментарий предложения по улучшению" autocomplete="off" type="text" style="text-align: center; width: 405px; margin-top: 5px" data-gramm="false" wt-ignore-input="true"></textarea>
						<br>
							<button class="mainButton" title="Отправляет заполненные поля формы в док" id="send2smartroom" style="width:105px; position: relative; left: 50%; margin-top: 5px; transform: translate(-50%, 0);">Отправить</button>
						</div>
				</span>
        </span>
</div>`;

const wintSmartroom = createWindow('AF_Smartroomform', 'winTopSmartroom', 'winLeftSmartroom', win_smartroomform);
hideWindowOnDoubleClick('AF_Smartroomform');
hideWindowOnClick('AF_Smartroomform', 'hideMeSmartRoomForm');

function addValidationlist(e) {
    const inputElement = e.target; // Элемент, вызвавший событие
    const listId = inputElement.getAttribute('list'); // Получаем id связанного datalist
    const dataList = document.getElementById(listId); // Находим связанный datalist

    if (dataList) {
        const options = Array.from(dataList.options).map(opt => opt.value); // Собираем значения из datalist
        const value = inputElement.value; // Получаем текущее значение инпута

        if (options.includes(value)) { // Проверяем, есть ли значение в списке
            inputElement.setCustomValidity(''); // Сбрасываем сообщение об ошибке
            inputElement.setAttribute('data-valid', 'true'); // Устанавливаем атрибут валидности
        } else {
            inputElement.setCustomValidity('Пожалуйста, выберите одно из доступных значений.'); // Устанавливаем сообщение об ошибке
            inputElement.removeAttribute('data-valid'); // Удаляем атрибут валидности
        }
    }
}

document.getElementById('cattwosmatrtoom').addEventListener('drop', addValidationlist);
document.getElementById('cattwosmatrtoom').addEventListener('paste', addValidationlist);
document.getElementById('cattwosmatrtoom').addEventListener('input', addValidationlist);
document.getElementById('catthreesmatrtoom').addEventListener('drop', addValidationlist);
document.getElementById('catthreesmatrtoom').addEventListener('paste', addValidationlist);
document.getElementById('catthreesmatrtoom').addEventListener('input', addValidationlist);

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
            document.getElementById('smartroomuser').classList.add('inputalertbackground');
            flagemptysmart = 1;
        } else {
            document.getElementById('smartroomuser').classList.remove('inputalertbackground');
        }

        if (!document.getElementsByName('formattoform')[0].checked && !document.getElementsByName('formattoform')[1].checked && !document.getElementsByName('formattoform')[2].checked && !document.getElementsByName('formattoform')[3].checked) {
            document.getElementById('smartroomformat').classList.add('inputalertbackground');
            flagemptysmart = 1;
        } else {
            document.getElementById('smartroomformat').classList.remove('inputalertbackground');
        }

        if (document.getElementById('clientid').value.length < 3) {
            document.getElementById('clientid').classList.add('inputalertbackground');
            flagemptysmart = 1;
        } else {
            document.getElementById('clientid').classList.remove('inputalertbackground');
        }

        if (!document.getElementsByName('smartroomecos')[0].checked && !document.getElementsByName('smartroomecos')[1].checked && !document.getElementsByName('smartroomecos')[2].checked) {
            document.getElementById('smartroomecosysrem').classList.add('inputalertbackground');
            flagemptysmart = 1;
        } else {
            document.getElementById('smartroomecosysrem').classList.remove('inputalertbackground');
        }

        if (document.getElementById('fullcomentsmartroom').value.length < 3) {
            document.getElementById('fullcomentsmartroom').classList.add('inputalertbackground');
            flagemptysmart = 1;
        } else {
            document.getElementById('fullcomentsmartroom').classList.remove('inputalertbackground');
        }

        if (!document.getElementById('cattwosmatrtoom').hasAttribute('data-valid')) {
            document.getElementById('cattwosmatrtoom').classList.add('inputalertbackground');
            flagemptysmart = 1;
        } else {
            document.getElementById('cattwosmatrtoom').classList.remove('inputalertbackground');
        }

        if (!document.getElementById('catthreesmatrtoom').hasAttribute('data-valid')) {
            document.getElementById('catthreesmatrtoom').classList.add('inputalertbackground');
            flagemptysmart = 1;
        } else {
            document.getElementById('catthreesmatrtoom').classList.remove('inputalertbackground');
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

            const inputElement = document.getElementById('cattwosmatrtoom');
            const dataListElement = document.getElementById('cattwosmatrtoom-options-list');
            let cat2selected = null;

            for (let i = 0; i < dataListElement.options.length; i++) {
                if (dataListElement.options[i].value === inputElement.value) {
                    cat2selected = dataListElement.options[i].value;
                    break;
                }
            }

            const inputElementThree = document.getElementById('catthreesmatrtoom');
            const dataListElementThree = document.getElementById('catthreesmatrtoom-options-list');
            let cat3selected = null;

            for (let i = 0; i < dataListElementThree.options.length; i++) {
                if (dataListElementThree.options[i].value === inputElementThree.value) {
                    cat3selected = dataListElementThree.options[i].value;
                    break;
                }
            }

            checkedquestion = document.getElementsByName('whatobratform')[0].value;

            let body2 = 'entry.505070950=' + encodeURIComponent(document.getElementById('clientid').value) + '&entry.1879097323=' + encodeURIComponent(document.getElementById('fullcomentsmartroom').value) + '&entry.1625340245=' + encodeURIComponent(cat2selected) + '&entry.478427702=' + encodeURIComponent(cat3selected) + '&entry.466256037=' + encodeURIComponent(checkedclienttype) + '&entry.685236831=' + encodeURIComponent(checkeducformat) + '&entry.876256156=' + encodeURIComponent(checkedquestion) + '&entry.156405977=' + encodeURIComponent(checkecosystem)

            const fetchURL = 'https://docs.google.com/forms/u/1/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/formResponse';
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body2,
            };

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
                if (response && response.success) {
                    document.getElementById('AF_Smartroomform').style.display = 'none';
                    document.getElementById('clearsmartroomform').click();
                    sendComment('Отправка в документ "Пожелания Смартрум" прошла успешно');
                } else {
                    // В случае ошибки
                    console.error('Ошибка при отправке в документ "Пожелания Смартрум":', response.error);
                }
            });
        }
    }

    document.getElementById('clearsmartroomform').onclick = function () {
        const elementsToClear = [
            'clientid',
            'fullcomentsmartroom',
            'smartroomuser',
            'smartroomquestion',
            'smartroomformat',
            'smartroomecosysrem',
            'cattwosmatrtoom',
            'catthreesmatrtoom'
        ];

        // Очищаем значения и удаляем классы для указанных элементов
        elementsToClear.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = ''; // Очищаем значения
                }
                element.classList.remove('inputalertbackground'); // Удаляем класс
                if (element.hasAttribute('data-valid')) {
                    element.removeAttribute('data-valid'); // Удаляем атрибут data-valid
                }
            }
        });

        // Функция очистки радиобатонов
        const cheksradio = document.getElementsByClassName('smartroom-radio');
        for (let j = 0; j < cheksradio.length; j++) {
            cheksradio[j].checked = false; // Снимаем выбор с радиокнопок
        }
    };


    document.getElementById('smartroomforminstr').onclick = function () {
        window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-smartroom%F0%9F%A6%90Smartroom')
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