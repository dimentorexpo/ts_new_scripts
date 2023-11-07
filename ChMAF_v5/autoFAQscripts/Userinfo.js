let usrServLanguage 
let usrAge
let usrName
let usrCountry 
let usrType 
let stid;

var win_serviceinfo =  // описание элементов окна информации об услугах и пользователе
  `<div style="display: flex; width: 320px;">
        <span style="width: 320px">
                <span style="cursor: -webkit-grab;">
                        <div style="width: 320px; padding: 5px; border-bottom:1px solid #556B2F;" id="servicehead">
                                <button title="скрывает меню" id="hideMeservice" class="mainButton buttonHide">hide</button>
                                <button class="mainButton" title="открывает СРМ пользователя при введенном айди в поле" id="GotoCRM" style="width:50px;">CRM</button>
                                <button class="mainButton" title="Начинает чат с пользователем" id="startnewchat" style="width: 25.23px;">💬</button>
								<button class="mainButton" title="Делаем видимым номер телефона и почты" id='dounhidemailandphone'>👁‍🗨</button>
                                <button class="mainButton" title="Левый клик обновить статус. Легенда: 💥 - задача на исход уже создана или есть также задача на тп1л , 📵 - нет задачи на исход и на тп, 🛠 - нет задачи на исход, но есть задача на тп" id="CrmStatus" style="width:30px; display:none;"></button>
								<span style="padding:7px; margin-left: 5px;height:28px; color:#ffff;  font-weight:700; border: 1px solid bisque;width: 82px; background-color:#1E90FF;display:none;" id="getcurrentstatus"></span>
                        </div>
						<div style="width: 320px; margin:5px; display:flex; justify-content:left;" id="input_field">
							<input id="idstudent" placeholder="ID У/П" title="Введите ID ученика для получения информации по услугам" oninput="onlyNumber(this)" autocomplete="off" type="text" style="text-align: center; width: 100px; color: black;">
							<button title="запускает поиск по услугам" id="getidstudent" class="mainButton usinfoops">🚀</button>
							<button title="Открывает список со всеми задачами пользователя" id="crmactivetasks" class="mainButton usinfoops">📋</button>
							<button class="mainButton" title="TRM 2.0 для информации по П" id="newtrm" style="margin-left: 5px; display: none; width: 25.23px;">🗿</button>
							<button class="mainButton" title="Личная страница П, как видят ученики" id="personalteacherpage" style="margin-left: 5px; display: none; width: 25.23px;">🎭</button>
							<button title="Изменяет Язык обслуживания для профиля на Русский" id="changelocalelng" class="mainButton usinfoops">🌍</button>
							<button title="Открывает начислятор для проверки реального баланса ученика" id="checkbalance" class="mainButton usinfoops">💰</button>
							<button title="Просмотр прошедших и предстоящих уроков" id="getpastandfuturelessons" class="mainButton usinfoops">📆</button>
							<button title="очищает все поля" id="clearservinfo" class="mainButton usinfoops">🧹</button>
				       	</div>
						<div style="width: 320px; margin:5px; display:flex; justify-content:left;" id="input_field2">
							<input readonly id="onetimepassout"  placeholder="One time pass" title="Вывод разового пароля после выполнения команды" autocomplete="off" type="text" style="float:left; text-align: center; width: 100px; color: black;" class="">
							<button title="Генерирует одноразовый код для входа в мобильное приложение и выводит его в спец поле" id="getonetimepass" class="mainButton usinfoops">📱</button>
							<button title="Открывает админку редактирования пользователя/просмотра ролей" id="editadmbtn" class="mainButton usinfoops">✏</button>
							<button title="Открывает кота для просмотра истории чатов" id="catchathistory" class="mainButton usinfoops">🗄</button>
							<button title="Открывает меню для просмотра рассрочки" id="partialpaymentinfo" class="mainButton usinfoops">💸</button>
							<button title="Открывает меню для просмотра статуса подписки" id="subscriptioninfo" class="mainButton usinfoops">💵</button>
						</div>
					   </span>
                        <div style="width: 320px; color:bisque; text-align:center">
						<img id="useravatar" style="position: absolute; left: 1px; top: 120px; width: 55px; height: 60px; border-radius: 30px; border: 3px solid seagreen; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); display:none;">
                                <div id="basicInfo" style="max-height:400px; overflow:auto; color:bisque; text-align:center">
									<div style="text-align: center;" id="usrType">
									</div>
									 <div style="text-align: center;">
										<span id="getshowcase" title="При клике на кнопку копирует в буфер шоукейс ученика" style="cursor:pointer;">ℹ</span>
										<span id="usrAge"></span>
										<span id="getloginer" title="При клике делает ссылку-логгинер и копирует в буфер обмена для авторизации" class="cursor-userinfobtns"> Имя: </span>
										<span id="usrName"></span>
									</div>
									<div style="text-align: center;">
										<span class="cursor-userinfobtns" title="При клике копирует в буфер обмена почту пользователя" id="getusremail">Email: </span>
										<span id="mailunhidden">hidden</span>
									</div>
									<div style="text-align: center;">
										<span class="cursor-userinfobtns" title="При клике копирует в буфер обмена телефон пользователя" id="getusrphone">Phone: </span>
										<span id="phoneunhidden">hidden</span>
										<span>• 🌍: </span>
										<span id="usrCountry"></span>
									</div>
									<div style="text-align: center;">
										<span name="studentosFields">Identity: </span>
										<span name="studentosFields" id="pochtaIdentity"></span>
										<span name="studentosFields" id="telefonIdentity"></span>
										<span name="studentosFields">• Язык осблуж.: </span>
										<span name="studentosFields" id="usrServLang"></span>
									</div>
									<div style="text-align: center;">
										<span name="studentosFields">UTC:</span>
										<span name="studentosFields" id="utcOffset"></span>
										<span name="studentosFields">MSK(+/-):</span>
										<span name="studentosFields" id="UTCtoMSK"></span>
										<span name="studentosFields"> ⏰Время(местное): </span>
										<span name="studentosFields" id="localTime"></span>
									</div>
								 </div>
                        </div>
						<div style="width: 320px;" id="serviceList">
								<p id="servicetable" style="max-height:400px; overflow:auto; color:bisque; text-align:center"></p>
						</div>
        </span>
</div>`;

var win_Timetable = // описание элементов окна предстоящих и прошедших занятиях
  `<div style="display: flex; width: 450px;">
<span style="width: 450px">
        <span style="cursor: -webkit-grab;">
                <div style="margin: 5px; width: 450;" id="HeadTimetable">
                        <button class="mainButton" id="hideMeTT" style="width:50px; background: #228B22;">hide</button>
                </div>
                <div style="display:flex; justify-content:space-evenly; margin-top:5px;">
                     <button class="mainButton" title="Выводит инфо о прошедших уроках" id="getlessonpast">Прошедшие уроки</button>
                     <button class="mainButton" title="Выводит инфо о предстоящих уроках" id="getlessonfuture">Предстоящие уроки</button>
                 </div>
                 </span>
                <div id="timetableinfo">
                     <p id="timetabledata" style="width:450px;color:bisque; max-height:400px; margin-left:5px; margin-top:5px; overflow:auto;text-align:center;"></p>
                </div>
</span>
</div>`;

if (localStorage.getItem('winTopService') == null) { // началоное положение окна информации об  услугах
  localStorage.setItem('winTopService', '120');
  localStorage.setItem('winLeftService', '295');
}

if (localStorage.getItem('winTopTimetable') == null) { // начальное положение окна проверки прошедшего расписания и предстоящих уроков
  localStorage.setItem('winTopTimetable', '120');
  localStorage.setItem('winLeftTimetable', '295');
}

let wintServices = document.createElement('div'); // создание окна вензель user info
document.body.append(wintServices);
wintServices.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopService') + 'px; left: ' + localStorage.getItem('winLeftService') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintServices.style.display = 'none';
wintServices.setAttribute('id', 'AF_Service');
wintServices.innerHTML = win_serviceinfo;

wintServices.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintServices.offsetLeft;
    let elemTop = wintServices.offsetTop;

    function onMouseMove(event) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintServices.style.left = (elemLeft + deltaX) + "px";
      wintServices.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopService', String(elemTop + deltaY));
      localStorage.setItem('winLeftService', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};

let wintTimetable = document.createElement('div'); // создание окна предстоящих и прошедших занятиях
document.body.append(wintTimetable);
wintTimetable.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopTimetable') + 'px; left: ' + localStorage.getItem('winLeftTimetable') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintTimetable.style.display = 'none';
wintTimetable.setAttribute('id', 'AF_Timetable');
wintTimetable.innerHTML = win_Timetable;

wintTimetable.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintTimetable.offsetLeft;
    let elemTop = wintTimetable.offsetTop;

    function onMouseMove(event) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintTimetable.style.left = (elemLeft + deltaX) + "px";
      wintTimetable.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopTimetable', String(elemTop + deltaY));
      localStorage.setItem('winLeftTimetable', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};


document.getElementById('servicehead').ondblclick = function (a) { // скрытие окна вензель user info по двойному клику
  if (checkelementtype(a)) { 
    document.getElementById('AF_Service').style.display = 'none'; 
    document.getElementById('butServ').classList.remove('activeScriptBtn');
  }
}

document.getElementById('hideMeservice').onclick = function () { // скрытие окна вензель user info
  if (document.getElementById('AF_Service').style.display == '')
        document.getElementById('AF_Service').style.display = 'none'
		document.getElementById('butServ').classList.remove('activeScriptBtn')
}

async function startnewchat(polzid) { //открывает чат с пользователем
  if (operatorId == "") {
    await whoAmI()
  }

  if (polzid) {
    console.log(polzid);
    await fetch(`https://skyeng.autofaq.ai/api/conversation/start?channelId=eca64021-d5e9-4c25-b6e9-03c24s638d4d&userId=${polzid}&operatorId=${operatorId}&groupId=c7bbb211-a217-4ed3-8112-98728dc382d8`, {
      headers: {
      },
      referrer: "https://skyeng.autofaq.ai/tickets/assigned/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "POST",
      mode: "cors",
      credentials: "include"
    })
      .then(response => response.json())
      .then(data => {
        chatId = data.conversationId
        if (data.conversationId != undefined) {
          console.log(data, chatId)
          alert(`Чат начат c пользователем ${polzid}`);
        } else alert('Чат не был открыт по причине: ' + data.message + ' ' + data.textCode + ' ' + 'code: ' + data.code)
      })

  } else alert('Не введен id пользователя');
}

document.getElementById('startnewchat').onclick = async function () { // нажатие на начать новый чат
  let polzid = document.getElementById('idstudent').value.trim();
  startnewchat(polzid)
}

document.getElementById('dounhidemailandphone').onclick = function () {
  getunhideemail();
  getunhidephone();
  checkemailandphoneidentity() 
}

document.getElementById('checkbalance').onclick = function () {
  window.open("https://billing-api.skyeng.ru/operations/user/" + document.getElementById('idstudent').value + "/info")
}

document.getElementById('GotoCRM').onclick = function () {
  window.open("https://crm2.skyeng.ru/persons/" + document.getElementById('idstudent').value)    // открываем ссылку в новой вкладке на  Пользовательская админка
}

document.getElementById('partialpaymentinfo').onclick = function () {
  window.open("https://accounting.skyeng.ru/credit/list?studentId=" + document.getElementById('idstudent').value)
}

document.getElementById('subscriptioninfo').onclick = function () {  // открываем ссылку в новой вкладке на просмотр Подписки
  window.open(`https://billing-api.skyeng.ru/subscriptions/user/${document.getElementById('idstudent').value}/info`)
}

document.getElementById('editadmbtn').onclick = function () {
  let stuid = document.getElementById('idstudent').value;
  stuid = stuid.trim();
  window.open("https://id.skyeng.ru/admin/users/" + stuid + "/update-contacts")
}

document.getElementById('getonetimepass').onclick = function () { //функция генерации разового пароля для МП
  if (document.getElementById('idstudent').value == "")
    console.log('Введите id в поле')
  else {
    document.getElementById('getonetimepass').innerHTML = "✅";
    setTimeout(function () { document.getElementById('getonetimepass').innerHTML = "📱" }, 2000);

    document.getElementById('responseTextarea1').value = `{
			"headers": {
				"content-type": "application/x-www-form-urlencoded",
					"sec-fetch-site": "same-origin",
					"sec-fetch-user": "?1",
					"upgrade-insecure-requests": "1"
			},
			"body": "user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D= + ${document.getElementById('idstudent').value} + &user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null",
				"method": "POST",
				"mode": "cors",
				"credentials": "include"
			}`
    document.getElementById('responseTextarea2').value = "https://id.skyeng.ru/admin/auth/one-time-password"
    document.getElementById('responseTextarea3').value = 'getmobpwdnew'
    document.getElementById('sendResponse').click()

    function getPassInfo1() {
      var resprez11 = document.getElementById('responseTextarea1').getAttribute('getmobpwdnew')
      document.getElementById('responseTextarea1').removeAttribute('getmobpwdnew');
      var convertres11 = resprez11.match(/div class="alert alert-success" role="alert".*?([0-9]{5}).*/);
      onetimepassout.value = convertres11[1];
    }
    setTimeout(getPassInfo1, 1000);
  };
  setTimeout(function () { document.getElementById('onetimepassout').value = "" }, 15000);
}

document.getElementById('AF_Timetable').ondblclick = function (a) { // скрытие окна предстоящих и прошедших занятиях по двойному клику
  if (checkelementtype(a)) {
    document.getElementById('AF_Timetable').style.display = 'none';
    document.getElementById('timetabledata').innerHTML = "";
  }
}

document.getElementById('hideMeTT').onclick = function () { // скрытие окна предстоящих и прошедших занятиях
  if (document.getElementById('AF_Timetable').style.display == '')
    document.getElementById('AF_Timetable').style.display = 'none'

  document.getElementById('timetabledata').innerHTML = "";
}

let responseinfo;

function checkemailandphoneidentity() {
	pochtaStatus.textContent =''
	telefonStatus.textContent =''
  document.getElementById('responseTextarea1').value = `{}`;
  document.getElementById('responseTextarea2').value = "https://id.skyeng.ru/admin/users/" + document.getElementById('idstudent').value + "/update-contacts";
  document.getElementById('responseTextarea3').value = 'responseupdate';
  document.getElementById('sendResponse').click();

  const responseTextarea1 = document.getElementById('responseTextarea1');

  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'responseupdate') {
        responseinfo = responseTextarea1.getAttribute('responseupdate');
        if (responseinfo) {
          if (flagusertype === "teacher") {
            console.log('It is a teacher!');
          } else if (flagusertype === "student") {
            if (responseinfo.includes('"identityEmail" disabled data-value=""') && responseinfo.includes('"identityPhone" disabled data-value=""')) {
              pochtaStatus.textContent = "📧✖";
              telefonStatus.textContent = "☎✖";
            } else if (responseinfo.includes('"identityEmail" disabled data-value=""') && !responseinfo.includes('"identityPhone" disabled data-value=""')) {
              pochtaStatus.textContent = "📧✖";
              telefonStatus.textContent = "☎✔";
            } else if (!responseinfo.includes('"identityEmail" disabled data-value=""') && responseinfo.includes('"identityPhone" disabled data-value=""')) {
              pochtaStatus.textContent = "📧✔";
              telefonStatus.textContent = "☎✖";
            } else {
              pochtaStatus.textContent = "📧✔";
              telefonStatus.textContent = "☎✔";
            }
          }
          responseTextarea1.removeAttribute('responseupdate');
        }
      }
    });
  });

  const config = { attributes: true, childList: false, characterData: false, subtree: false };
  observer.observe(responseTextarea1, config);
}


function getunhidephone() {  //открывает телефон пользователя
  document.getElementById('responseTextarea1').value = `{}`;
  document.getElementById('responseTextarea2').value = "https://backend.skyeng.ru/api/persons/" + document.getElementById('idstudent').value + "/personal-data/?pdType=phone&source=persons.profile";
  document.getElementById('responseTextarea3').value = 'phoneishere';
  document.getElementById('sendResponse').click();

  document.getElementById("responseTextarea1").addEventListener("DOMSubtreeModified", function () {
    const unhidephone = document.getElementById('responseTextarea1').getAttribute('phoneishere');
    if (unhidephone != null) {
      document.getElementById('phoneunhidden').textContent = JSON.parse(unhidephone).data.value;
      document.getElementById('responseTextarea1').removeAttribute('phoneishere');
    }
  });
}

function getunhideemail() { //открывает почту пользователя
  document.getElementById("responseTextarea1").value = "{}";
  document.getElementById("responseTextarea2").value = `https://backend.skyeng.ru/api/persons/${document.getElementById("idstudent").value}/personal-data/?pdType=email&source=persons.profile`;
  document.getElementById("responseTextarea3").value = "emailishere";
  document.getElementById("sendResponse").click();

  document.getElementById("responseTextarea1").addEventListener("DOMSubtreeModified", function () {
    const unhiddenEmail = document.getElementById("responseTextarea1").getAttribute("emailishere");
    if (unhiddenEmail) {
      document.getElementById('mailunhidden').textContent = JSON.parse(unhiddenEmail).data.value;
      document.getElementById("responseTextarea1").removeAttribute("emailishere");
    }
  });
}

function getservicearr() {
  return new Promise((resolve, reject) => {
    document.getElementById('responseTextarea1').value = `{}`
    document.getElementById('responseTextarea2').value = "https://backend.skyeng.ru/api/products/configurations/"
    document.getElementById('responseTextarea3').value = 'arrayofservices'
    document.getElementById('sendResponse').click()
  
    document.getElementById("responseTextarea1").addEventListener("DOMSubtreeModified", function () {
      const servicearray = document.getElementById('responseTextarea1').getAttribute('arrayofservices');
      let tmpvalue = '';
      if (servicearray) {
        tmpvalue = JSON.parse(servicearray);
        if (tmpvalue.length !=0) {
          console.log(tmpvalue);
          document.getElementById('responseTextarea1').removeAttribute('arrayofservices');
          resolve(tmpvalue);
        }
      }
    });
  });
}

let servicecontainer;
getservicearr().then(value => {
  servicecontainer = value;
  console.log(servicecontainer);
}).catch(err => {
  console.log(err);
});


  let pochtaStatus = document.getElementById('pochtaIdentity')
  let telefonStatus =  document.getElementById('telefonIdentity')

document.getElementById('getlessonpast').onclick = function () { // показывает прошедшие уроки
  document.getElementById('timetabledata').innerHTML = "";
  let stid = document.getElementById('idstudent').value;
  stid = stid.trim();
  let pastlessondata = "";
  let pastlessoninfo = "";
  document.getElementById('responseTextarea1').value = `{}`
  document.getElementById('responseTextarea2').value = "https://backend.skyeng.ru/api/students/" + stid + "/timetable/lessons-history/?page=0";
  document.getElementById('responseTextarea3').value = 'pastlessoninfodata'
  document.getElementById('sendResponse').click()

  document.getElementById("responseTextarea1").addEventListener("DOMSubtreeModified", function () {
    pastlessoninfo = JSON.parse(document.getElementById('responseTextarea1').getAttribute('pastlessoninfodata'))
    if (pastlessoninfo != null) {
      if (pastlessoninfo.data == "") {
        document.getElementById('timetabledata').innerHTML = "Еще не было уроков";
      } else {
        for (let i = 0; i < pastlessoninfo.data.length; i++) {
          let d = new Date(pastlessoninfo.data[i].startedAt)
          let minutka;
          let denek;
          let mesacok;
          let chasok;
          if (d.getHours() < 10) {
            chasok = "0" + (d.getUTCHours() + 3);
          } else {
            chasok = (d.getUTCHours() + 3);
          }
          if (d.getMinutes() < 10) {
            minutka = "0" + d.getMinutes();
          } else {
            minutka = d.getMinutes();
          }
          if (d.getDate() < 10) {
            denek = "0" + d.getDate();
          } else {
            denek = d.getDate();
          }
          if (d.getMonth() + 1 < 10) {
            mesacok = "0" + (d.getMonth() + 1);
          } else {
            mesacok = d.getMonth() + 1;
          }
          if (pastlessoninfo.data[i].status == "missed_by_student") {
            pastlessoninfo.data[i].status = "Пропущен учеником";
          } else if (pastlessoninfo.data[i].status == "canceled_by_student") {
            pastlessoninfo.data[i].status = "Отменен учеником";
          } else if (pastlessoninfo.data[i].status == "success") {
            pastlessoninfo.data[i].status = "Прошел";
          } else if (pastlessoninfo.data[i].status == "moved_by_student") {
            pastlessoninfo.data[i].status = "Перенесен учеником";
          } else if (pastlessoninfo.data[i].status == "canceled_by_teacher") {
            pastlessoninfo.data[i].status = "Отменен учителем";
          } else if (pastlessoninfo.data[i].status == "student_refused_to_study") {
            pastlessoninfo.data[i].status = "Отказался от обучения"
          } else if (pastlessoninfo.data[i].status == "interrupted") {
            pastlessoninfo.data[i].status = "Прерван"
          } else if (pastlessoninfo.data[i].status == "did_not_get_through_student") {
            pastlessoninfo.data[i].status = "Не смогли связаться с У"
          } else if (pastlessoninfo.data[i].status == "canceled_not_marked") {
            pastlessoninfo.data[i].status = "Не отмечен учителем вовремя"
          }

          if (pastlessoninfo.data[i].lessonType == "regular") {
            pastlessoninfo.data[i].lessonType = "Регулярный";
          } else if (pastlessoninfo.data[i].lessonType == "single") {
            pastlessoninfo.data[i].lessonType = "Одиночный";
          } else if (pastlessoninfo.data[i].lessonType == "trial") {
            pastlessoninfo.data[i].lessonType = "Пробный";
          }

          for (let j = 0; j < servicecontainer.data.length; j++) {
            if (servicecontainer.data[j].serviceTypeKey == pastlessoninfo.data[i].educationService.serviceTypeKey)
              pastlessoninfo.data[i].educationService.serviceTypeKey = servicecontainer.data[j].title;
          }

          if (pastlessoninfo.data[i].educationService.serviceTypeKey == null) {
            pastlessoninfo.data[i].educationService.serviceTypeKey = "Услуга была в CRM1, см позднее обозначение!"
          }

          if (pastlessoninfo.data[i].teacher != null) {
            pastlessondata += '<span style="color: #00FA9A">&#5129;</span>' + '<span style="color:#FF7F50; font-weight:900;">Дата: </span>' + denek + "-" + mesacok + "-" + d.getFullYear() + " " + chasok + ":" + minutka +
              '<span style="color:#00FF7F; font-weight:900;"> Статус: </span>' + pastlessoninfo.data[i].status + '<span style="color:#FFD700; font-weight:900;"> Урок: </span>' + pastlessoninfo.data[i].lessonType + '<br>'
              + '<span style="color:#00BFFF; font-weight:900;">Услуга: </span>' + pastlessoninfo.data[i].educationService.id + " " + pastlessoninfo.data[i].educationService.serviceTypeKey + '<br>'
              + '<span style="color:#32CD32; font-weight:900;">Преподаватель: </span>' + " " + pastlessoninfo.data[i].teacher.general.id + " " + pastlessoninfo.data[i].teacher.general.name + " " + pastlessoninfo.data[i].teacher.general.surname + '<br>'
              + '<hr style="width:420px; border: 1px dotted #ff0000;  border-style: none none dotted; color: #fff; background-color: #fff;"></hr>';
          } else {
            pastlessondata += '<span style="color: #00FA9A">&#5129;</span>' + '<span style="color:#FF7F50; font-weight:900;">Дата: </span>' + denek + "-" + mesacok + "-" + d.getFullYear() + " " + chasok + ":" + minutka +
              '<span style="color:#00FF7F; font-weight:900;"> Статус: </span>' + pastlessoninfo.data[i].status + '<span style="color:#FFD700; font-weight:900;"> Урок: </span>' + pastlessoninfo.data[i].lessonType + '<br>'
              + '<span style="color:#00BFFF; font-weight:900;">Услуга: </span>' + pastlessoninfo.data[i].educationService.id + " " + pastlessoninfo.data[i].educationService.serviceTypeKey + '<br>'
              + '<hr style="width:420px; border: 1px dotted #ff0000;  border-style: none none dotted; color: #fff; background-color: #fff;"></hr>';
          }
        }

        document.getElementById('timetabledata').innerHTML = pastlessondata;
        pastlessondata = "";
      }

      document.getElementById('responseTextarea1').removeAttribute('pastlessoninfodata')
    }
  })
}

document.getElementById('getlessonfuture').onclick = function () { // показывает предстоящие уроки

  document.getElementById('timetabledata').innerHTML = "";
  let stid = document.getElementById('idstudent').value;
  stid = stid.trim();
  let futurelessondata = "";
  let futurelessoninfo = "";
  document.getElementById('responseTextarea1').value = `{}`
  document.getElementById('responseTextarea2').value = "https://backend.skyeng.ru/api/students/" + stid + "/timetable/future-lessons/"
  document.getElementById('responseTextarea3').value = 'futurelessoninfodata'
  document.getElementById('sendResponse').click()

  document.getElementById("responseTextarea1").addEventListener("DOMSubtreeModified", function () {
    futurelessoninfo = JSON.parse(document.getElementById('responseTextarea1').getAttribute('futurelessoninfodata'))
    if (futurelessoninfo != null) {
      if (futurelessoninfo.data == "") {
        document.getElementById('timetabledata').innerHTML = "Уроки не запланированы";
      } else {
        for (let i = 0; i < futurelessoninfo.data.length; i++) {
          let d = new Date(futurelessoninfo.data[i].startedAt)
          let minutka;
          let denek;
          let mesacok;
          let chasok;
          if (d.getHours() < 10) {
            chasok = "0" + (d.getUTCHours() + 3);
          } else {
            chasok = (d.getUTCHours() + 3);
          }
          if (d.getMinutes() < 10) {
            minutka = "0" + d.getMinutes();
          } else {
            minutka = d.getMinutes();
          }
          if (d.getDate() < 10) {
            denek = "0" + d.getDate();
          } else {
            denek = d.getDate();
          }
          if (d.getMonth() + 1 < 10) {
            mesacok = "0" + (d.getMonth() + 1);
          } else {
            mesacok = d.getMonth() + 1;
          }

          if (futurelessoninfo.data[i].lessonType == "regular") {
            futurelessoninfo.data[i].lessonType = "Регулярный";
          } else if (futurelessoninfo.data[i].lessonType == "single") {
            futurelessoninfo.data[i].lessonType = "Одиночный";
          } else if (futurelessoninfo.data[i].lessonType == "trial") {
            futurelessoninfo.data[i].lessonType = "Пробный";
          }

          for (let j = 0; j < servicecontainer.data.length; j++) {
            if (servicecontainer.data[j].serviceTypeKey == futurelessoninfo.data[i].educationService.serviceTypeKey)
              futurelessoninfo.data[i].educationService.serviceTypeKey = servicecontainer.data[j].title;
          }

          if (futurelessoninfo.data[i].teacher != null) {
            futurelessondata += '<span style="color: #00FA9A">&#5129;</span>' + '<span style="color:#FF7F50; font-weight:900;">Дата: </span>' + denek + "-" + mesacok + "-" + d.getFullYear() + " " + chasok + ":" + minutka
              + '<span style="color:#FFD700; font-weight:900;"> Урок: </span>' + futurelessoninfo.data[i].lessonType + '<br>'
              + '<span style="color:#00BFFF; font-weight:900;">Услуга: </span>' + futurelessoninfo.data[i].educationService.id + " " + futurelessoninfo.data[i].educationService.serviceTypeKey + '<br>'
              + '<span style="color:#32CD32; font-weight:900;">Преподаватель: </span>' + " " + futurelessoninfo.data[i].teacher.general.id + " " + futurelessoninfo.data[i].teacher.general.name + " " + futurelessoninfo.data[i].teacher.general.surname + '<br>'
              + '<hr style="width:420px; border: 1px dotted #ff0000;  border-style: none none dotted; color: #fff; background-color: #fff;"></hr>';
          } else {
            futurelessondata += '<span style="color: #00FA9A">&#5129;</span>' + '<span style="color:#FF7F50; font-weight:900;">Дата: </span>' + denek + "-" + mesacok + "-" + d.getFullYear() + " " + chasok + ":" + minutka
              + '<span style="color:#FFD700; font-weight:900;"> Урок: </span>' + futurelessoninfo.data[i].lessonType + '<br>'
              + '<span style="color:#00BFFF; font-weight:900;">Услуга: </span>' + futurelessoninfo.data[i].educationService.id + " " + futurelessoninfo.data[i].educationService.serviceTypeKey + '<br>'
              + '<hr style="width:420px; border: 1px dotted #ff0000;  border-style: none none dotted; color: #fff; background-color: #fff;"></hr>';
          }

        }
        document.getElementById('timetabledata').innerHTML = futurelessondata;
        futurelessondata = "";
      }
      document.getElementById('responseTextarea1').removeAttribute('futurelessoninfodata')
    }
  })
}

document.getElementById('changelocalelng').onclick = function () { // меняет язык обслуживания выбранного пользователя в вензеле на русский

  document.getElementById('responseTextarea1').value = `{
		   "headers": {
			"content-type": "application/json",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-site"
		  },
		  "referrer": "https://crm2.skyeng.ru/",
		  "referrerPolicy": "strict-origin-when-cross-origin",
		  "body": "{\\"serviceLocale\\":\\"ru\\"}",
		  "method": "PUT",
		  "mode": "cors",
		  "credentials": "include"
	 }`
  document.getElementById('responseTextarea2').value = "https://backend.skyeng.ru/api/persons/general/" + document.getElementById('idstudent').value
  document.getElementById('responseTextarea3').value = ''
  document.getElementById('sendResponse').click()
  document.getElementById('changelocalelng').innerHTML = "✅"
  setTimeout(function () { document.getElementById('changelocalelng').innerHTML = "🌍" }, 2000);
}

document.getElementById('catchathistory').onclick = function () { // открывает в вензеле историю чатов введеного айди пользователя

  if (document.getElementById('AF_ChatHis').style.display == 'none') {
    document.getElementById('opennewcat').click();
    document.getElementById('chatuserhis').value = document.getElementById('idstudent').value.trim();
    btn_search_history.click()
  } else {
    document.getElementById('chatuserhis').value = document.getElementById('idstudent').value.trim();
    btn_search_history.click()
  }
}

let nameofuser, teachername, studentname, responsedata, utczone, localtime;
let servlocalestatus, avatarofuser, countryofuser, ageofuser;

function getusernamecrm() {
  const changeLocaleLngElement = document.getElementById('changelocalelng');
  const checkBalanceElement = document.getElementById('checkbalance');
  const partialPaymentInfoElement = document.getElementById('partialpaymentinfo');
  const subscriptioninfoElement = document.getElementById('subscriptioninfo');
  const getPastAndFutureLessonsElement = document.getElementById('getpastandfuturelessons');
  const newTrmElement = document.getElementById('newtrm');
  const personalTeacherPageElement = document.getElementById('personalteacherpage');
  avatarofuser = '';
  
  let filteredid = document.getElementById('idstudent').value.trim();
  flagusertype = '';
  document.getElementById('responseTextarea1').value = `{}`
  document.getElementById('responseTextarea2').value = "https://backend.skyeng.ru/api/persons/" + filteredid + "?crm2=true&debugParam=profile-page"
  document.getElementById('responseTextarea3').value = 'getusernameinfo'
  document.getElementById('sendResponse').click()

  const responseTextarea1 = document.getElementById('responseTextarea1');

  // Создаём экземпляр наблюдателя с функцией обратного вызова
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'getusernameinfo') {
        responsedata = responseTextarea1.getAttribute('getusernameinfo');
        if (responsedata) {
          let studentData = JSON.parse(responsedata).data;

          // Оставшаяся часть вашей функции...
          // ...
		        if (studentData.name) {
        let name = studentData.name + (studentData.surname ? ` ${studentData.surname}` : '');
        if (studentData.type == "student") {
		pochtaStatus.innerText = "hidden"
		telefonStatus.innerText = "hidden"
	
          nameofuser = name;
		  usrName.textContent = nameofuser;
          flagusertype = 'student'
		  usrType.textContent = "Ученик";
		  usrType.style = "color:#38cf7a; font-weight:900; text-align:center;";
		  usrAge.style.display = "";
		  
		  let elemsToUnHide = document.getElementsByName('studentosFields')
			elemsToUnHide.forEach(function(item) {
				item.style.display = ""
			})
		  
		pochtaIdentity.style.display = "";
		telefonIdentity.style.display = "";
        checkBalanceElement.style.display = "";
        usrAge.style.display = "";
        partialPaymentInfoElement.style.display = "";
        subscriptioninfoElement.style.display = "";
        getPastAndFutureLessonsElement.style.display = "";
        newTrmElement.style.display = "none";
        personalTeacherPageElement.style.display = "none";
		      if (studentData.avatarUrl) {
				avatarofuser = studentData.avatarUrl.match(/(https:\/\/auth-avatars-skyeng.imgix.net.*?\d+.\S+).auto/)[1];
			  }
		
        } else if (studentData.type == "teacher") {
          teachername = name;
		  
		  usrName.textContent = teachername;
          flagusertype = 'teacher'
		  usrType.textContent = "Преподаватель";
		  usrType.style = "color:#00BFFF; font-weight:900; text-align:center;";
		  usrAge.style.display = "none";
		  
			let elemsToHide = document.getElementsByName('studentosFields')
			elemsToHide.forEach(function(item) {
				item.style.display = "none"
			})
		  
			pochtaIdentity.style.display = "none";
			telefonIdentity.style.display = "none";
		  	usrAge.style.display = "none";
            changeLocaleLngElement.style.display = "none";
            checkBalanceElement.style.display = "none";
            partialPaymentInfoElement.style.display = "none";
            subscriptioninfoElement.style.display = "none";
            getPastAndFutureLessonsElement.style.display = "none";
            newTrmElement.style.display = "";
            personalTeacherPageElement.style.display = "";
			if (studentData.avatarUrl) {
				avatarofuser = studentData.avatarUrl.match(/(https:\/\/auth-avatars-skyeng.imgix.net.*?\d+.\S+).auto/)[1];
			  }
			  
			  document.getElementById('servicetable').innerHTML = ''
			  
			  					if (document.getElementById('getloginer') != null) {
								  document.getElementById('getloginer').onclick = async function () {
									document.getElementById('getloginer').style.color = "orange"
									await postuderdatatologin();

									setTimeout(function () {
									  if (flaggetlogginer == 1)
										document.getElementById('getloginer').style.color = "green"
									  else document.getElementById('getloginer').style.color = "red"

									  setTimeout(() => {
										document.getElementById('getloginer').style.color = "bisque"
									  }, 5000)
									}, 2000)
								  }
								}
								
								if (document.getElementById('getusremail') != null) {
								  document.getElementById('getusremail').onclick = function () {
									copyToClipboard(document.getElementById('mailunhidden').textContent);
								  };
								}

								if (document.getElementById('getusrphone') != null) {
								  document.getElementById('getusrphone').onclick = function () {
									copyToClipboard(document.getElementById('phoneunhidden').textContent);
								  };
								}
        }
      }
	  
		servlocalestatus = studentData.serviceLocale || "⭕";
		countryofuser = studentData.country || null;
	  
	    usrServLanguage.textContent = servlocalestatus;
		usrCountry.textContent = countryofuser;

        if (servlocalestatus === "ru") {
            changeLocaleLngElement.style.display = "none";
        } else if (servlocalestatus !== "ru" || servlocalestatus === "⭕") {
            changeLocaleLngElement.style.display = "";
        }
	  	  
	  	const userAvatarElement = document.querySelector('#useravatar');

		if (avatarofuser != null && avatarofuser != '') {
			userAvatarElement.style.display = "";
			userAvatarElement.src = avatarofuser;
		}

	  let utcZoneLnk = document.getElementById('utcOffset')
	  let MSKdifference = document.getElementById('UTCtoMSK')
	  let localMSKTime = document.getElementById('localTime')
	  let curdate = new Date();
      utczone = studentData.utcOffset;
	  utcZoneLnk.textContent = utczone
	  MSKdifference.textContent = (utczone - 3)
      let curhours = (curdate.getUTCHours() + 3);
      localtime = new Date(curdate.getTime() + utczone * 60 * 60 * 1000).toISOString().substr(11, 5);
	  localMSKTime.textContent = localtime


      let currentYear = curdate.getFullYear();
      if (studentData.birthday) {
        let birthYear = parseInt(studentData.birthday.split('-')[0]);
        let age = currentYear - birthYear;
        ageofuser = age < 18 ? "🔞" : (age >= 18 && age < 99 ? "🅰" : "❓");
      } else {
        ageofuser = "❓";
      }
	  usrAge.textContent = ageofuser;

          document.getElementById('responseTextarea1').removeAttribute('getusernameinfo')
        }
      }
    });
  });

  // Настройка наблюдателя: какие изменения отслеживать
  const config = { attributes: true, childList: false, characterData: false, subtree: false };

  // Начинаем наблюдение
  observer.observe(responseTextarea1, config);
}

let tokenlogginer;
let logginerinfo;
function postuderdatatologin() { // логгинер для У П , переработать нужно!
  logginerinfo = '';
  let useriddata = document.getElementById('idstudent').value;
  useriddata = useriddata.trim();
  document.getElementById('responseTextarea1').value = `{
			  "headers": {
				"content-type": "application/x-www-form-urlencoded",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1"
			  },
			  "referrer": "https://id.skyeng.ru/admin/auth/login-links",
			  "referrerPolicy": "strict-origin-when-cross-origin",
			  "body": "login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${useriddata}&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru&login_link_form%5Bpromocode%5D=&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=&login_link_form%5B_token%5D=${tokenlogginer}",
			  "method": "POST",
			  "mode": "cors",
			  "credentials": "include"
			}`
  document.getElementById('responseTextarea2').value = "https://id.skyeng.ru/admin/auth/login-links";
  document.getElementById('responseTextarea3').value = 'postdata'
  document.getElementById('sendResponse').click()

  document.getElementById("responseTextarea1").addEventListener("DOMSubtreeModified", function () {
    logginerinfo = document.getElementById('responseTextarea1').getAttribute('postdata');
    if (logginerinfo != null) {
      logginerinfo = logginerinfo.match(/("https:\/\/id.skyeng.ru\/auth\/login-link\/\w+.*?")/gm);
      logginerinfo = logginerinfo[logginerinfo.length - 1].split("\"");

      copyToClipboard(logginerinfo[1])
      if (logginerinfo[1])
        flaggetlogginer = 1;
      else flaggetlogginer = 0;
      document.getElementById('responseTextarea1').removeAttribute('postdata')
    }
  })
}

let getcrmstatusinfo;
let crmresponseinfo;

function crmstatus() {
  const tempvarcrm = document.getElementById('idstudent').value.trim();

  let flagtpout = false;
  let flagtp = false;
  let flagnottp = false;
  let flagstatuswait = false;
  let flagstatusprocessing = false;
  let opername = '';

  document.getElementById('getcurrentstatus').style.display = 'none';
  document.getElementById('CrmStatus').style.display = 'none';

  document.getElementById('responseTextarea1').value = '{}';
  document.getElementById('responseTextarea2').value = `https://customer-support.skyeng.ru/task/user/${tempvarcrm}`;
  document.getElementById('responseTextarea3').value = 'getcrmtaskinfo';
  document.getElementById('sendResponse').click();

  const responseTextarea1 = document.getElementById('responseTextarea1');

  // Создаём экземпляр наблюдателя с функцией обратного вызова
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'getcrmtaskinfo') {
        crmresponseinfo = responseTextarea1.getAttribute('getcrmtaskinfo');
        if (crmresponseinfo) {
          getcrmstatusinfo = JSON.parse(crmresponseinfo);

          for (const data of getcrmstatusinfo.data) {
            switch (data.operatorGroup.name) {
              case 'technical_support_outgoing':
                flagtpout = true;
                if (data.status === 'waiting') flagstatuswait = true;
                if (data.status === 'processing') {
                  flagstatusprocessing = true;
                  opername = data.operator.name;
                }
                break;
              case 'technical_support_first_line':
                flagtp = true;
                break;
              default:
                flagnottp = true;
                break;
            }
          }

          // Оставшаяся часть вашей функции...
           if (flagstatuswait) {
        document.getElementById('getcurrentstatus').style.display = '';
        document.getElementById('getcurrentstatus').innerText = 'В ожидании';
        document.getElementById('getcurrentstatus').style.backgroundColor = '#1E90FF';
      } else if (flagstatusprocessing) {
        document.getElementById('getcurrentstatus').style.display = '';
        document.getElementById('getcurrentstatus').innerText = 'Решается';
        document.getElementById('getcurrentstatus').title = opername;
        document.getElementById('getcurrentstatus').style.backgroundColor = '#DC143C';
      }

      if (flagtpout && !flagtp && !flagnottp) {
        document.getElementById('CrmStatus').style.display = '';
        document.getElementById('CrmStatus').innerText = '💥';
        console.log('Есть активные задачи');
      } else if (!flagtpout && flagtp && !flagnottp) {
        document.getElementById('CrmStatus').style.display = '';
        document.getElementById('CrmStatus').innerText = '🛠';
        console.log('Входящий звонок или с др отдела на ТП была создана задача');
      } else if (!flagtpout && !flagtp && flagnottp) {
        document.getElementById('CrmStatus').style.display = '';
        document.getElementById('CrmStatus').innerText = '📵';
        console.log('Нет активных задач по ТП линии');
      } else if (flagtpout && flagtp && !flagnottp) {
        document.getElementById('CrmStatus').style.display = '';
        document.getElementById('CrmStatus').innerText = '💥';
        console.log('Есть активные задачи на исход и на ТП 1 линии')
      } else if (flagtpout && flagtp && flagnottp) {
        document.getElementById('CrmStatus').style.display = '';
        document.getElementById('CrmStatus').innerText = '💥';
        console.log('Есть активные задачи на исход и на ТП 1 линии и на др отделы');
      } else if (flagtp == true && flagnottp == true && flagtpout == false) {
        document.getElementById('CrmStatus').style.display = '';
        document.getElementById('CrmStatus').innerText = '🛠';
        console.log('Входящий звонок или с др отдела на ТП была создана задача. И есть задача на др отдел');
      } else if (flagtp == false && flagnottp == true && flagtpout == true) {
        document.getElementById('CrmStatus').style.display = '';
        document.getElementById('CrmStatus').innerText = '💥';
        console.log('Есть задача на ТП Исход. И есть задача на др отдел');
	  }	else {
        document.getElementById('CrmStatus').style.display = '';
        document.getElementById('CrmStatus').innerText = '📵';
        console.log('No DATA');
      }
          responseTextarea1.removeAttribute('getcrmtaskinfo');
        }
      }
    });
  });

  // Настройка наблюдателя: какие изменения отслеживать
  const config = { attributes: true, childList: false, characterData: false, subtree: false };

  // Начинаем наблюдение
  observer.observe(responseTextarea1, config);
}

function observeChange(element) {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutationsList) => {
            for(let mutation of mutationsList) {
                if(mutation.type === 'attributes') {
                    observer.disconnect(); // Отключаем наблюдатель после разрешения промиса
                    resolve();
                }
            }
        });
        observer.observe(element, {attributes: true});
    });
}

async function checkServiceAndUserInfo() {
	setTimeout(function() {
		console.log(flagusertype)
		if (flagusertype =="teacher") {
			document.getElementById('servicetable').innerHTML = '';
			arrservice = null;
		} else {
		document.getElementById('servicetable').innerHTML = "Загрузка..."
		
		new Promise((resolve, reject) => {
			const responseTextarea1 = document.getElementById('responseTextarea1');
			responseTextarea1.value = `{}`;
			const responseTextarea2 = document.getElementById('responseTextarea2');
			responseTextarea2.value = "https://backend.skyeng.ru/api/persons/" + stid + "/education-services/";
			const responseTextarea3 = document.getElementById('responseTextarea3');
			responseTextarea3.value = 'getserviceinfo';
			const sendResponse = document.getElementById('sendResponse');
			sendResponse.click();
			
			setTimeout(function(){
				const servicearr = responseTextarea1.getAttribute('getserviceinfo');
				let srvparsed = '';
				if (servicearr) {
					srvparsed = JSON.parse(servicearr);
					if (srvparsed.length !== 0) {
						console.log(srvparsed.data)
						if (srvparsed.data.length != 0) {
						console.log(srvparsed);
						responseTextarea1.removeAttribute('getserviceinfo');
						resolve(srvparsed);
						
						    let tinfo = ""; // инфо о постоянном П
							let temtinfo = ""; // инфо о временном П
							let servinfo = ""; //инфо об услуге
							let noservinfo = ""; //нет инфо об услугах, обычно если профиль П или оператора
							let arrservice = []; // пустой массив, куда будет передавать ID отобранных услуг по условию
						
							let srvKeyMap = new Map(servicecontainer.data.map(d => [d.serviceTypeKey, d.shortTitle]));
							srvparsed.data.forEach((service, i) => {
								if (srvKeyMap.has(service.serviceTypeKey)) {
									service.serviceTypeKey = srvKeyMap.get(service.serviceTypeKey);
								}
								
								if(service.student.general.id == stid) {
									if (service.incorrectnessReason == null) {
															
									if ((service.stage === "after_trial" || service.stage === "before_call") && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey !="Групповые онлайн-мероприятия Life" && service.serviceTypeKey !="Скрининг" && service.serviceTypeKey !="Англ adult АЯ Даунсейл") {
										servinfo += '<div style="text-align:center; background:#c26919; color:#ffffff; font-weight:700;border: 1px solid black;">Этап ВУ |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #c26919; color:#000000;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '</div>'
										arrservice += service.id + ", ";
									}

									if (service.stage === "regular_lessons" && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey !="Групповые онлайн-мероприятия Life" && service.serviceTypeKey !="Скрининг" && service.serviceTypeKey !="Англ adult АЯ Даунсейл") {
										const teacherInfo = service.teacher
											? "👽 Teacher: " + service.teacher.general.id + "," + " " + service.teacher.general.name + " " + service.teacher.general.surname
											: "👽 Teacher: Не закреплен!";
										const tmpTeacherInfo = service.temporaryTeacher
											? "⏳👽 Teacher: " + service.temporaryTeacher.general.id + "," + " " + service.temporaryTeacher.general.name + " " + service.temporaryTeacher.general.surname
											: "NoTmp";
										
										if (tmpTeacherInfo !="NoTmp") {
											servinfo += '<div style="text-align:center; background:#30508c; font-weight:700;border: 1px solid black;">Регулярные занятия |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #2b602b; color:navajowhite;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '<br>' + teacherInfo + '<br>' + tmpTeacherInfo + '</div>';
											arrservice += service.id + ", ";
										} else {
											servinfo += '<div style="text-align:center; background:#30508c; font-weight:700;border: 1px solid black;">Регулярные занятия |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #2b602b; color:navajowhite;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '<br>' + teacherInfo + '</div>';
											arrservice += service.id + ", ";
										}

									}

									
									if (service.stage === "lost" && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey !="Групповые онлайн-мероприятия Life" && service.serviceTypeKey !="Скрининг" && service.serviceTypeKey !="Англ adult АЯ Даунсейл") {
										servinfo += '<div style="text-align:center; background:#626367; font-weight:700;border: 1px solid black;">Потерянная услуга |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #5a0f77; color:#c6c5c5;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '</div>'
										arrservice += service.id + ", ";
									}
								} 
								}
									
									document.getElementById('servicetable').innerHTML = '<span style="color:#00BFFF; font-weight:900;">Информация об услугах:</span><br>' + servinfo;
								
									});

								if (arrservice != null && arrservice.length > 0 && arrservice != undefined) {
								  arrservice = arrservice.split(', ')
								}

								let tmparr = document.querySelectorAll('.copyserviceid');
								for (let j = 0; j < tmparr.length; j++) {
								  tmparr[j].onclick = function () {
									copyToClipboard(arrservice[j])
								  }
								}

								if (document.getElementById('getusremail') != null) {
								  document.getElementById('getusremail').onclick = function () {
									copyToClipboard(document.getElementById('mailunhidden').textContent);
								  };
								}

								if (document.getElementById('getusrphone') != null) {
								  document.getElementById('getusrphone').onclick = function () {
									copyToClipboard(document.getElementById('phoneunhidden').textContent);
								  };
								}

								if (document.getElementById('getshowcase') != null) {
								  document.getElementById('getshowcase').onclick = function () {
									copyToClipboard("https://profile.skyeng.ru/profile/" + stid + "/showcase");
								  };
								}
								
								if (document.getElementById('getloginer') != null) {
								  document.getElementById('getloginer').onclick = async function () {
									document.getElementById('getloginer').style.color = "orange"
									await postuderdatatologin();

									setTimeout(function () {
									  if (flaggetlogginer == 1)
										document.getElementById('getloginer').style.color = "green"
									  else document.getElementById('getloginer').style.color = "red"

									  setTimeout(() => {
										document.getElementById('getloginer').style.color = "bisque"
									  }, 5000)
									}, 2000)
								  }
								}
						} else {
							document.getElementById('servicetable').innerHTML = '<div style="text-align:center; background:coral; font-weight:700;border: 1px solid black; color: floralwhite;">Услуг вообще нет!</div>'
						}
						

					} 
				}
			}, 1500)			
		});
		}
	}, 1000)
}


function getuserinfo() {
		document.getElementById('servicetable').innerHTML = "Загрузка..."
  // document.getElementById('servicetable').innerHTML = "";
	usrServLanguage = document.getElementById('usrServLang');
	usrAge = document.getElementById('usrAge');
	usrName = document.getElementById('usrName');
	usrCountry = document.getElementById('usrCountry');
	usrType =  document.getElementById('usrType')
  usrType.textContent = '';
  document.getElementById('mailunhidden').textContent = "hidden"
  document.getElementById('phoneunhidden').textContent = "hidden"
  console.log("changed pochtaStatus and telefonstatus:")
  
  // document.getElementById('servicetable').innerHTML = "Загрузка информации о пользователе";

  document.querySelector('#useravatar').src = "";
  if (document.querySelector('#useravatar').style.display != "none")
    document.querySelector('#useravatar').style.display = "none";

  document.getElementById('getcurrentstatus').title = "";
  stid = document.getElementById('idstudent').value.trim();

  setTimeout(getusernamecrm, 640);
  setTimeout(crmstatus, 700);
  setTimeout(checkServiceAndUserInfo, 720)
}

document.getElementById('getidstudent').onclick = function () { // нажатие на ракету
  getuserinfo()
  setTimeout(function () {
    if (document.getElementById('servicetable').innerHTML == "Загрузка...") {
      checkServiceAndUserInfo()
    }
  }, 4000)
}

document.getElementById('CrmStatus').onclick = crmstatus;

document.getElementById('crmactivetasks').onclick = function () { //открыват СРМ с активными задачами
  window.open("https://crm2.skyeng.ru/persons/" + document.getElementById('idstudent').value + "/customer-support/list")
}

document.getElementById('newtrm').onclick = function () { //открывает новый TRM 2.0 п
  window.open("https://trm.skyeng.ru/teacher/" + document.getElementById('idstudent').value)
}

document.getElementById('personalteacherpage').onclick = function () { //открывает личную страницу П
  window.open("https://skyeng.ru/teachers/id/" + document.getElementById('idstudent').value)
}

document.getElementById('clearservinfo').onclick = function () { //очищает все в вензеле
  document.getElementById('idstudent').value = "";
  document.getElementById('servicetable').innerHTML = "";
  document.getElementById('CrmStatus').style.display = "none";
  document.getElementById('getcurrentstatus').style.display = "none";
  document.getElementById('changelocalelng').style.display = "";
  document.getElementById('getpastandfuturelessons').style.display = "";
  document.querySelector('#useravatar').src = "";
  document.querySelector('#useravatar').style.display = "none";
  document.getElementById('AF_Timetable').style.display = "none";
  document.getElementById('timetabledata').innerText = "";
  document.getElementById('usrType').innerText = "";
  document.getElementById('usrAge').innerText = "";
  document.getElementById('usrName').innerText = "";
  document.getElementById('telefonIdentity').innerText = "";
  document.getElementById('pochtaIdentity').innerText = "";
  document.getElementById('usrCountry').innerText = "";
  document.getElementById('mailunhidden').innerText = "";
  document.getElementById('phoneunhidden').innerText = "";
}

document.getElementById('useravatar').onmouseover = function () { // взаимодействие с аватаром пользователя увеличивает
  document.getElementById('useravatar').style.width = "200px";
  document.getElementById('useravatar').style.height = "230px";
}

document.getElementById('useravatar').onmouseout = function () { // взаимодействие с аватаром пользователя уменьшает
  document.getElementById('useravatar').style.width = "55px";
  document.getElementById('useravatar').style.height = "60px";
}

document.getElementById('getpastandfuturelessons').onclick = function () { //открывает меню прошедших и предстоящих уроков
  if (document.getElementById('AF_Timetable').style.display == '')
    document.getElementById('AF_Timetable').style.display = 'none'
  else
    document.getElementById('AF_Timetable').style.display = ''
  getlessonfuture.click();
}

