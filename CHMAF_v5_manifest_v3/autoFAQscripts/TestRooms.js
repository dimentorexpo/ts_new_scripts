var win_testrooms =  // описание элементов окна создания тестовых комнат
    `<div style="display: flex; width: 260px;">
      <span style="width: 260px">
          <span style="cursor: -webkit-grab;">
              <div style="width: 260px; margin: 5px;" id="testroomshead">
                  <button title="скрывает меню" id="hideMetestrooms" class="mainButton buttonHide">hide</button>
                  <button class="mainButton" id="clrTestRooms" title="По нажатию очищает поля" style="width:24px;">🧹</button>
                  <button class="mainButton" id="aboutTestRooms" style="width:24px; float: right; margin-right: 10px;" title="Инструкция по этой форме">❓</button>
                  <button class="mainButton" id="confluenceTestRooms" title="Открывает раздел в Confluence по созданию тестовых комнат" style="width:24px; float: right; margin-right: 5px;">📋</button>
              </div>

					    <div style="width: 260px; margin:5px; display:flex; justify-content:left;">
                <select id="lessontypeselect" style="text-align: center; width: 240px; height: 26px; color: black; margin-left: 7px;">
                    <option disabled="" selected="" value="lessonnotselect" style="background-color: orange; color: white;">Выбери тип урока</option>
                    <option value="test">1 - 1</option>
                    <option value="test-parallel">Паралельный</option>
                    <option value="test-webinar">Вебинар</option>
                </select>
              </div>

					    <div style="width: 260px; margin:5px; display:flex; justify-content:left;">
                  <select id="subjecttypeselect" style="text-align: center; width: 240px; height: 26px; color: black; margin-left: 7px;">
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

              <div style="width: 260px; margin:5px; display:flex; justify-content:left;">
                  <input id="teachforroom" placeholder="Введи ID П" title="Введи id П для кого создать тестовую комнату" autocomplete="off" type="text" style="text-align: center; width: 120px; color: black; margin-left: 5px;">
                  <input id="studforroom" placeholder="Введи ID У" title="Введи id У для кого создать тестовую комнату(Если У несколько, вводите через запятую)" autocomplete="off" type="text" style="text-align: center; width: 120px; color: black; margin-left: 5px;">
    					</div>

              <div style="width: 260px; margin:2px; display:flex; justify-content:left;">
                  <button id="insertteachid" title="Поставить id вашего тестового П" class="mainButton testroomsbtn" style="margin-left:5px;">Тест👽</button>
                  <button id="insertstudid" title="Поставить id вашего тестового У" class="mainButton testroomsbtn">Тест👨&zwj;🎓</button>
                  <button id="userfromchatid" title="Подставить id пользователя из активного чата и подставить id вашего тестового У или П" class="mainButton testroomsbtn">ID из чата</button>
              </div>
              <div style="width: 260px; margin:5px; display:flex; justify-content:left;">
                  <button id="starttestroom" title="Тут и так понятно" class="mainButton testroomscreate">Создать тестовый урок</button>
              </div>
              <div style="width: 260px; margin:5px; display:flex; justify-content:left;">
              <label id="testroomsmessage" style="color:bisque; width:250px; text-align: center; border: 1px solid #3e4f55; background: rgb(70, 68, 81); border-radius: 10px; font-size: 15px; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);"></label>
              </div>
          </span>
      </span>
  </div>`;

const winttestrooms  = createWindow('AF_testrooms', 'winToptestrooms', 'winLefttestrooms', win_testrooms);

function getTestRoomsButtonPress() { //открывает окно создания тестовых комнат
    setDisplayStyle(document.getElementById('AF_testrooms'), document.getElementById('AF_testrooms').style.display === '' ? 'none' : '');
}

function cleartestroomsfields() { // очистка полей окно создания тестовых комнат
    document.getElementById('teachforroom').value = '';
    document.getElementById('studforroom').value = '';
    document.getElementById('subjecttypeselect').children[0].selected = true;
    document.getElementById('lessontypeselect').children[0].selected = true
}

function testteachertofield() { // подставить тестового П
    if (localStorage.getItem('test_teach') != '' && localStorage.getItem('test_teach') != null) {
        document.getElementById('teachforroom').value = localStorage.getItem('test_teach');
    } else {
        document.getElementById('teachforroom').placeholder = "Не указан ID П";
        testroomsshowmessage('error', 'В настройках расширения не указан id тестового преподавателя')
    }
}

function teststudenttofield() { // подставить тестового У
    if (localStorage.getItem('test_stud') != '' && localStorage.getItem('test_stud') != null) {
        document.getElementById('studforroom').value = localStorage.getItem('test_stud');
    } else {
        document.getElementById('studforroom').placeholder = "Не указан ID У";
        testroomsshowmessage('error', 'В настройках расширения не указан id тестового ученика')
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

function testroomsshowmessage(type, text) { // вывод уведомлений
    if (type == 'error') {
        messagefield.style.background = '#d5484f';
    } else if (type == 'message') {
        messagefield.style.background = '#46d17e';
    } else {
        console.log('Получен неизвестный тип сообщения');
        messagefield.style.background = 'rgb(70, 68, 81)';
    }

    messagefield.innerText = text;
    messagefield.display = '';
    setTimeout(testroomshidemessage, 5000)
}

function testroomshidemessage() { //скрытие уведомлений
    messagefield.display = 'none';
    messagefield.innerText = '';
    messagefield.style.background = 'rgb(70, 68, 81)';
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
document.getElementById("hideMetestrooms").addEventListener("click", function(){
	    if (document.getElementById('AF_testrooms').style.display == '')
        document.getElementById('AF_testrooms').style.display = 'none'
});
document.getElementById('testroomshead').addEventListener('dblclick', function(){
	document.getElementById('AF_testrooms').style.display = 'none'; 
})

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
            testroomsshowmessage('error', 'Не удается определить тип пользователя, пожалуйста, внесите id вручную')
        }
    } else {
        testroomsshowmessage('error', 'Нет выбранного чата')
    }
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

        chrome.runtime.sendMessage({ action: 'createTestRoom', lessonsubjecttype: lessonsubjecttype, randomHash: randomHash, lessontype: lessontype, teacheridforroom: teacheridforroom, studentidforroom: studentidforroom }, function (response) {
            testroomsshowmessage('message', 'Тестовый урок создан, приглашение на него отображаются в личных кабинетах У и П');
            cleartestroomsfields()
        })

    } else {
        testroomsshowmessage('error', massagetexttoshow);
    }
})