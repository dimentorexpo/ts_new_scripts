var win_testroomsCRM =  // описание элементов окна создания тестовых комнат
  `<div style="display: flex; width: 310px;">
      <span style="width: 310px">
          <span style="cursor: -webkit-grab;">
              <div style="width: 310px; margin: 5px;" id="testroomsCRMhead">
                  <button class="buttonHide" title="скрывает меню" id="hideMetestroomsCRM">hide</button>
                  <button class="btnCRM btnCRMsmall" id="clrTestRooms" title="По нажатию очищает поля" style="width:30px;">🧹</button>
                  <button class="btnCRM btnCRMsmall" id="aboutTestRooms" style="width:30px; float: right; margin-right: 10px;" title="Инструкция по этой форме">❓</button>
                  <button class="btnCRM btnCRMsmall" id="confluenceTestRooms" title="Открывает раздел в Confluence по созданию тестовых комнат" style="width:30px; float: right; margin-right: 5px;">📋</button>
              </div>

              <div style="width: 310px; margin:5px; display:flex; justify-content:left;">
                <select class="inputCRM" id="lessontypeselect" style="text-align: center; width: 290px; height: 26px; color: black; margin-left: 7px;">
                    <option disabled="" selected="" value="lessonnotselect" style="background-color: orange; color: white;">Выбери тип урока</option>
                    <option value="test">1 - 1</option>
                    <option value="test-parallel">Паралельный</option>
                    <option value="test-webinar">Вебинар</option>
                </select>
              </div>

					    <div style="width: 310px; margin:5px; display:flex; justify-content:left;">
                  <select class="inputCRM" id="subjecttypeselect" style="text-align: center; width: 290px; height: 26px; color: black; margin-left: 7px;">
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

              <div style="width: 310px; margin:5px; display:flex; justify-content:left;">
                  <input class="inputCRM" id="teachforroom" placeholder="Введи ID П" title="Введи id П для кого создать тестовую комнату" autocomplete="off" type="text" style="text-align: center; width: 135px; color: black; margin-left: 5px;">
                  <input class="inputCRM" id="studforroom" placeholder="Введи ID У" title="Введи id У для кого создать тестовую комнату(Если У несколько, вводите через запятую)" autocomplete="off" type="text" style="text-align: center; width: 135px; color: black; margin-left: 5px;">
    					</div>

              <div style="width: 310px; margin:2px; display:flex; justify-content:left;">
                  <button id="insertteachid" title="Поставить id вашего тестового П" class="btnCRM testroomsCRMbtn" style="margin-left:5px;">Тест П</button>
                  <button id="insertstudid" title="Поставить id вашего тестового У" class="btnCRM testroomsCRMbtn">Тест У</button>
                  <button id="userfromchatid" title="Подставить id пользователя из активной задачи и подставить id вашего тестового У или П" class="btnCRM testroomsCRMbtn">User ID</button>
              </div>
              <div style="width: 310px; margin:5px; display:flex; justify-content:left;">
                  <button id="starttestroom" title="Тут и так понятно" class="btnCRM testroomsCRMcreate">Создать тестовый урок</button>
              </div>
              <div style="width: 310px; margin:5px; display:flex; justify-content:left;">
              <label id="testroomsCRMmessage" style="color:bisque; width:298px; text-align: center; border: 1px solid #3e4f55; background: rgb(70, 68, 81); border-radius: 10px; font-size: 15px; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);"></label>
              </div>
          </span>
      </span>
  </div>`;

const winttestroomsCRM = createWindowCRM('testroomsCRM', 'winToptestroomsCRM', 'winLefttestroomsCRM', win_testroomsCRM);
hideWindowOnDoubleClick('testroomsCRMhead');
hideWindowOnClick('testroomsCRM', 'hideMetestroomsCRM');

const messagefield = document.getElementById('testroomsCRMmessage');
messagefield.display = 'none';

document.getElementById('btnCreateTestRoom').onclick = function () { // открытие окна создания тестовых комнат
  if (document.getElementById('testroomsCRM').style.display == 'none') {
      document.getElementById('testroomsCRM').style.display = ''
      document.getElementById('idmymenucrm').style.display = 'none'
  } else {
      document.getElementById('testroomsCRM').style.display = 'none'
      document.getElementById('idmymenucrm').style.display = 'none'
  }
}

function cleartestroomsCRMfields(){ // очистка полей окно создания тестовых комнат
  document.getElementById('teachforroom').value = '';
  document.getElementById('studforroom').value = '';
  document.getElementById('subjecttypeselect').children[0].selected = true;
  document.getElementById('lessontypeselect').children[0].selected = true;
}

function testteachertofield(){ // подставить тестового П
  if (localStorage.getItem('test_teachCRM') != '' && localStorage.getItem('test_teachCRM') != null) {
    document.getElementById('teachforroom').value = localStorage.getItem('test_teachCRM');
  } else {
    document.getElementById('teachforroom').placeholder = "Не указан ID П";
    testroomsCRMshowmessage('error','В настройках расширения не указан id тестового преподавателя')
  }
}

function teststudenttofield(){ // подставить тестового У
  if (localStorage.getItem('test_studCRM') != '' && localStorage.getItem('test_studCRM') != null) {
    document.getElementById('studforroom').value = localStorage.getItem('test_studCRM');
  } else {
    document.getElementById('studforroom').placeholder = "Не указан ID У";
    testroomsCRMshowmessage('error','В настройках расширения не указан id тестового ученика')
  }
}

document.getElementById('userfromchatid').onclick = function () { // добавить id пользователя из активного чата и добавить id тестовго У или П
  let userIDfromCRM = document.getElementsByClassName('id')[0].innerText;
  if (userIDfromCRM){
    let flagwhouser = 0;
      let insertionfield = document.getElementById('studforroom');
      let UserTypeBages = document.querySelectorAll('div[data-qa]');

      UserTypeBages.forEach(div => {
        let bagetype = div.getAttribute('data-qa');
          if (bagetype == 'is-teacher-badge') {
            
            insertionfield = document.getElementById('teachforroom')
            flagwhouser = 1;
          }
      });
      insertionfield.value = userIDfromCRM;

      if (flagwhouser == 1){
        teststudenttofield()
      } else {
        testteachertofield()
      }
  } else {
    testroomsCRMshowmessage('error','Нет открытой задачи')
  }
}

document.getElementById('starttestroom').onclick = function () { // добавляем тестовую комнату
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
    console.log ('Не выбран тип урока');
  } else { lessontype = document.getElementById('lessontypeselect').value }

  if (document.getElementById('subjecttypeselect').value == 'subjnotselect') { // проверяем выбран ли предмет
      flagemptyttfields = '1';
      massagetexttoshow += 'Не выбран предмет\n'
      console.log ('Не выбран предмет');
  } else { lessonsubjecttype = document.getElementById('subjecttypeselect').value }

  if ( document.getElementById('teachforroom').value.length <4){ // проверяем введен ли id П
      flagemptyttfields = '1';
      massagetexttoshow += 'Не указан id преподавателя\n'
      console.log ('Не указан id преподавателя');
  } else { 
      teacheridforroom =  document.getElementById('teachforroom').value
          .replace(/[^0-9,]/g, '')   // Удалить все символы, кроме цифр и запятой
  }

  if ( document.getElementById('studforroom').value.length <4){ // проверяем введен ли id У
      flagemptyttfields = '1';
      massagetexttoshow += 'Не указан id ученика\n'
      console.log ('Не указан id ученика');
  } else {
      studentidforroom = document.getElementById('studforroom').value
          .replace(/[^0-9,]/g, '')   // Удалить все символы, кроме цифр и запятой
          .replace(/,/g, '%2C');    // Заменить запятую на %2C
  }

  if (flagemptyttfields === '0'){
    randomHash = GenerateHash(14);

    const requestBody = `${randomHash}%5Btype%5D=${lessontype}&${randomHash}%5BteacherId%5D=${teacheridforroom}&${randomHash}%5BstudentIds%5D=${studentidforroom}&btn_create_and_list=`;
    const requestreferrer = `https://${lessonsubjecttype}.skyeng.ru/admin/tech-support-room/create`;
    const requestAdr = `https://${lessonsubjecttype}.skyeng.ru/admin/tech-support-room/create?uniqid=${randomHash}`;
    const requestHeaders = {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "en-US,en;q=0.9,ru;q=0.8",
          "cache-control": "max-age=0",
          "content-type": "application/x-www-form-urlencoded",
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "upgrade-insecure-requests": "1"
    };
    const requestOptions = {
          headers: requestHeaders,
          referrer: requestreferrer,
          referrerPolicy: 'strict-origin-when-cross-origin',
          body: requestBody,
          method: 'POST',
          mode: 'cors',
          credentials: 'include',
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: requestAdr, requestOptions: requestOptions }, function (response) {
      if (response.success) {
        testroomsCRMshowmessage('message', 'Тестовый урок создан, приглашение на него отображаются в личных кабинетах У и П');
        cleartestroomsCRMfields()
      } else {
          alert('Не удалось создать урок ' + response.error);
      }
    });

  } else {
    testroomsCRMshowmessage('error',massagetexttoshow);
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

function testroomsCRMshowmessage(type,text){ // вывод уведомлений
    if (type == 'error'){
      messagefield.style.background = '#d5484f';
    } else if (type == 'message'){
      messagefield.style.background = '#46d17e';
    } else {
      console.log ('Получен неизвестный тип сообщения');
      messagefield.style.background = 'rgb(70, 68, 81)';
    }

    messagefield.innerText = text;
    messagefield.display = '';
    setTimeout(testroomsCRMhidemessage, 7000)
}

function testroomsCRMhidemessage(){ //скрытие уведомлений
    messagefield.display = 'none';
    messagefield.innerText = '';
    messagefield.style.background = 'rgb(70, 68, 81)';
}

function opentestroomsCRMconf() { // Открывает раздел в Confluence по созданию тестовых комнат
  window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638")
}

function opentestroomsCRMhelp() { // Открывает раздел в Confluence инструкцию
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
document.getElementById("clrTestRooms").addEventListener("click", cleartestroomsCRMfields);
document.getElementById("aboutTestRooms").addEventListener("click", opentestroomsCRMhelp);
document.getElementById("confluenceTestRooms").addEventListener("click", opentestroomsCRMconf);