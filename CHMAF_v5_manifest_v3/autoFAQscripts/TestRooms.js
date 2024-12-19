var win_testrooms =  // описание элементов окна создания тестовых комнат
    `<div style="display: flex; width: 280px;">
      <span style="width: 280px">
          <span style="cursor: -webkit-grab;">
            <div style="width: 280px; margin: 5px;" id="testroomshead">
                  <button title="скрывает меню" id="hideMetestrooms" class="mainButton buttonHide">hide</button>
                  <button class="mainButton" id="clrTestRooms" title="По нажатию очищает поля" style="width:24px;">🧹</button>
                  <button class="mainButton" id="aboutTestRooms" style="width:24px; float: right; margin-right: 10px;" title="Инструкция по этой форме">❓</button>
                  <button class="mainButton" id="confluenceTestRooms" title="Открывает раздел в Confluence по созданию тестовых комнат" style="width:24px; float: right; margin-right: 5px;">📋</button>
              </div>

			<div style="width: 280px; margin:5px; display:flex; justify-content:left;">
                <select class="${exttheme}" id="lessontypeselect" style="text-align: center; width: 260px; height: 26px; margin-left: 7px;">
                    <option disabled="" selected="" value="lessonnotselect" style="background-color: orange; color: white;">Выбери тип урока</option>
                    <option value="test">1 - 1</option>
                    <option value="test-parallel">Паралельный</option>
                    <option value="test-webinar">Вебинар</option>
                    <option value="test-group">Групповой</option>
                </select>
              </div>

				<div style="width: 280px; margin:5px; display:flex; justify-content:left;">
                  <select class="${exttheme}" id="subjecttypeselect" style="text-align: center; width: 260px; height: 26px; margin-left: 7px;">
                      <option disabled="" selected="" value="subjnotselect" style="background-color: orange; color: white;">Выбери предмет</option>
                      <option value="api-english">Английский</option>
                      <option value="api-biology">Биология</option>
                      <option value="api-geography">География</option>
                      <option value="api-preschool">Дошкольная математика</option>
                      <option value="api-history">История</option>
                      <option value="api-computer-science">Компьютерные курсы</option>
                      <option value="api-literature">Литература</option>
                      <option value="api-math">Математика</option>
                      <option value="api-social-science">Обществознание</option>
                      <option value="api-russian">Русский язык</option>
                      <option value="api-physics">Физика</option>
                      <option value="api-chemistry">Химия</option>
                      <option value="api-chess">Шахматы</option>
                  </select>
              </div>

              <div style="width: 280px; margin:5px; display:flex; justify-content:left;">
                  <input class="${exttheme}" id="teachforroom" placeholder="Введи ID П" title="Введи id П для кого создать тестовую комнату" autocomplete="off" type="text" style="text-align: center; width: 130px; margin-left: 5px;">
                  <input class="${exttheme}" id="studforroom" placeholder="Введи ID У" title="Введи id У для кого создать тестовую комнату(Если У несколько, вводите через запятую)" autocomplete="off" type="text" style="text-align: center; width: 130px; margin-left: 5px;">
    			</div>

              <div style="width: 280px; margin:2px; display:flex; justify-content:left;">
                  <button id="insertteachid" title="Поставить id вашего тестового П" class="mainButton testroomsbtn" style="margin-left:5px;">Тест👽</button>
                  <button id="insertstudid" title="Поставить id вашего тестового У" class="mainButton testroomsbtn">Тест👨&zwj;🎓</button>
                  <button id="userfromchatid" title="Подставить id пользователя из активного чата и подставить id вашего тестового У или П" class="mainButton testroomsbtn">Чат->ID</button>
                  <button id="engfromchat" title="Подставить id пользователя из активного чата и подставить id вашего тестового У или П для начала урока по Англ 1 на 1" class="mainButton testroomsbtn">Eng->ID</button>
              </div>
              <div style="width: 280px; margin:5px; display:flex; justify-content:left;">
                  <button id="starttestroom" title="Тут и так понятно" class="mainButton testroomscreate">Создать тестовый урок</button>
              </div>
          </span>
      </span>
  </div>`;

const winttestrooms = createWindow('AF_testrooms', 'winToptestrooms', 'winLefttestrooms', win_testrooms);
hideWindowOnDoubleClick('AF_testrooms');
hideWindowOnClick('AF_testrooms', 'hideMetestrooms');

function getTestRoomsButtonPress() { //открывает окно создания тестовых комнат
    const AF_testrooms = document.getElementById('AF_testrooms');
    setDisplayStyle(AF_testrooms, AF_testrooms.style.display === '' ? 'none' : '');
    toggleButtonState('TestRooms', 'active');
    setTimeout(() => toggleButtonState('TestRooms', 'active'), 500);
}

function cleartestroomsfields() { // очистка полей окно создания тестовых комнат
    document.getElementById('teachforroom').value = '';
    document.getElementById('studforroom').value = '';
    document.getElementById('subjecttypeselect').children[0].selected = true;
    document.getElementById('lessontypeselect').children[0].selected = true;
}

function testteachertofield() { // подставить тестового П
    if (localStorage.getItem('test_teach') != '' && localStorage.getItem('test_teach') != null) {
        document.getElementById('teachforroom').value = localStorage.getItem('test_teach');
    } else {
        document.getElementById('teachforroom').placeholder = "Не указан ID П";
        createAndShowButton('В настройках расширения не указан id тестового преподавателя <br>' , 'error');
    }
}

function teststudenttofield() { // подставить тестового У
    if (localStorage.getItem('test_stud') != '' && localStorage.getItem('test_stud') != null) {
        document.getElementById('studforroom').value = localStorage.getItem('test_stud');
    } else {
        document.getElementById('studforroom').placeholder = "Не указан ID У";
        createAndShowButton('В настройках расширения не указан id тестового ученика' , 'error');
    }
}

function GenerateHash(length) { // генерируем случайный хэш
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function opentestroomsconf() { // Открывает раздел в Confluence по созданию тестовых комнат
    window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638")
}

function opentestroomshelp() { // Открывает раздел в Confluence по созданию тестовых комнат
    window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-testrooms%D0%9E%D0%BA%D0%BD%D0%BE%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D1%8F%D1%82%D0%B5%D1%81%D1%82%D0%BE%D0%B2%D1%8B%D1%85%D1%83%D1%80%D0%BE%D0%BA%D0%BE%D0%B2")
}

teachforroom.addEventListener('input', function () {
    onlyNumbers(this);
});

studforroom.addEventListener('input', function () {
    onlyNumbersAndComma(this);
});

document.getElementById("insertteachid").addEventListener("click", testteachertofield);
document.getElementById("insertstudid").addEventListener("click", teststudenttofield);
document.getElementById("clrTestRooms").addEventListener("click", cleartestroomsfields);
document.getElementById("aboutTestRooms").addEventListener("click", opentestroomshelp);
document.getElementById("confluenceTestRooms").addEventListener("click", opentestroomsconf);

document.getElementById('userfromchatid').addEventListener('click', function () { // добавить id пользователя из активного чата и добавить id тестовго У или П
    let whoisuser = SearchinAFnewUI("userType");
    if (whoisuser) {
        let insertionfield = ''
        let flagwhouser = '0'
        if (whoisuser === "teacher") {
            teststudenttofield()
            insertionfield = document.getElementById('teachforroom')
            flagwhouser = '1';
        } else if (whoisuser === "student") {
            testteachertofield()
            insertionfield = document.getElementById('studforroom')
            flagwhouser = '1';
        }

        if (flagwhouser == '1') {
            let useridis = SearchinAFnewUI("id");
            if (useridis)
                insertionfield.value = useridis;
        } else {
            createAndShowButton('Не удается определить тип пользователя, пожалуйста, внесите id вручную' , 'error');
        }
    } else {
        createAndShowButton('Нет выбранного чата' , 'error');
    }
})

document.getElementById('engfromchat').addEventListener('click', function () { // добавить id пользователя из активного чата и добавить id тестовго У или П
    document.getElementById('lessontypeselect').children[1].selected = true;
    document.getElementById('subjecttypeselect').children[1].selected = true;
    document.getElementById('userfromchatid').click();
})

document.getElementById('starttestroom').addEventListener('click', function () { // добавляем тестовую комнату
    let randomHash = '';
    let flagemptyttfields = '0';
    let studentidforroom = '';
    let teacheridforroom = '';
    let lessonsubjecttype = '';
    let lessontype = '';
    let massagetexttoshow = '';

    if (document.getElementById('lessontypeselect').value == 'lessonnotselect') { // проверяем выбран ли тип урока
        flagemptyttfields = '1';
        massagetexttoshow += 'Не выбран тип урока\n'
    } else { lessontype = document.getElementById('lessontypeselect').value }

    if (document.getElementById('subjecttypeselect').value == 'subjnotselect') { // проверяем выбран ли предмет
        flagemptyttfields = '1';
        massagetexttoshow += 'Не выбран предмет\n'
    } else { lessonsubjecttype = document.getElementById('subjecttypeselect').value }

    if (document.getElementById('teachforroom').value.length < 4) { // проверяем введен ли id П
        flagemptyttfields = '1';
        massagetexttoshow += 'Не указан id преподавателя\n'
    } else {
        teacheridforroom = document.getElementById('teachforroom').value
            .replace(/[^0-9,]/g, '')   // Удалить все символы, кроме цифр и запятой
    }

    if (document.getElementById('studforroom').value.length < 4) { // проверяем введен ли id У
        flagemptyttfields = '1';
        massagetexttoshow += 'Не указан id ученика\n'
    } else {
        studentidforroom = document.getElementById('studforroom').value
            .replace(/[^0-9,]/g, '')   // Удалить все символы, кроме цифр и запятой
            .replace(/,/g, '%2C');    // Заменить запятую на %2C
    }

    if (flagemptyttfields === '0') {
        randomHash = GenerateHash(14);

        const fetchURL = `https://${lessonsubjecttype}.skyeng.ru/admin/tech-support-room/create?uniqid=${randomHash}`;
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `${randomHash}%5Btype%5D=${lessontype}&${randomHash}%5BteacherId%5D=${teacheridforroom}&${randomHash}%5BstudentIds%5D=${studentidforroom}&${randomHash}%5BisOpenEntryEnabled%5D=1&btn_create_and_list=`,
            credentials: "include"
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
            if (!response.success) {
                alert('Не удалось создать комнату: ' + response.error);
                return;
            } else {
                createAndShowButton('Тестовый урок создан, приглашение на него отображаются в личных кабинетах У и П' , 'message');
                cleartestroomsfields()
                setTimeout(() => {
                    document.getElementById('AF_testrooms').style.display = 'none'; 
                }, 5000);
            }
        })
    } else {
        createAndShowButton(massagetexttoshow , 'error');
    }
})