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
								<button class="mainButton smallbtn" title="Делаем видимым номер телефона и почты" id='dounhidemailandphone'>👁‍🗨</button>
                                <button class="mainButton" title="Левый клик обновить статус. Легенда: 💥 - задача на исход уже создана или есть также задача на тп1л , 📵 - нет задачи на исход и на тп, 🛠 - нет задачи на исход, но есть задача на тп" id="CrmStatus" style="width:30px; display:none;"></button>
								<span style="padding:7px; margin-left: 5px;height:28px; color:#ffff;  font-weight:700; border: 1px solid bisque;width: 82px; background-color:#1E90FF;display:none;" id="getcurrentstatus"></span>
                        </div>
						<div style="width: 320px; margin:5px; display:flex; justify-content:left;" id="input_field">
							<input class="${exttheme}" id="idstudent" placeholder="ID У/П" title="Введите ID ученика для получения информации по услугам" autocomplete="off" type="text" style="text-align: center; width: 100px;">
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
							<input class="${exttheme}" readonly id="onetimepassout"  placeholder="One time pass" title="Вывод разового пароля после выполнения команды" autocomplete="off" type="text" style="float:left; text-align: center; width: 100px;">
							<button title="Генерирует одноразовый код для входа в мобильное приложение и выводит его в спец поле" id="getonetimepass" class="mainButton usinfoops">📱</button>
							<button title="Открывает админку редактирования пользователя/просмотра ролей" id="editadmbtn" class="mainButton usinfoops">✏</button>
							<button title="Открывает историю чатов" id="catchathistory" class="mainButton usinfoops">🗄</button>
							<button title="Открывает окно для просмотра когда и кто открывал/закрывал набор учеников для П" id="butTeacherNabor" class="mainButton" style="margin-left: 5px; display: none; width: 25.23px;"> 🚷</button>
							<button title="Открывает меню для просмотра рассрочки" id="partialpaymentinfo" class="mainButton usinfoops">💸</button>
							<button title="Открывает меню для просмотра статуса подписки" id="subscriptioninfo" class="mainButton usinfoops">💵</button>
                            <button title="Отправить текст от имени пользователя через Vimbot" id="openVimbotWindowsUserinfo" class="mainButton usinfoops">▶️</button>
						</div>
					   </span>
                        <div style="width: 320px; color:bisque; text-align:center">
						<img id="useravatar" style="position: absolute; left: 1px; top: 120px; width: 55px; height: 60px; border-radius: 30px; border: 3px solid seagreen; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); display:none;">
                                <div id="basicInfo" style="max-height:400px; overflow:auto; color:bisque; text-align:center">
									<div style="text-align: center;" id="usrType">
									</div>
									<div style="text-align: center;align-items: center;display: flex;flex-direction: row;flex-wrap: nowrap;justify-content: flex-end;/* align-content: stretch; */">
										<span id="usrAge"></span>
										<span id="getloginer" title="При клике делает ссылку-логгинер и копирует в буфер обмена для авторизации" class="cursor-userinfobtns"> 🔑 </span>
                                        <span> Имя: </span>
										<span id="usrName" style="max-width: 160px;margin-right: 30px;"></span>
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
                        <div style="width: 320px;" id="complektList">
								<p id="complekttable" style="max-height:400px; overflow:auto; color:bisque; text-align:center"></p>
						</div>
        </span>
</div>`;

var win_Timetable = // описание элементов окна предстоящих и прошедших занятиях
    `<div style="display: flex; width: 450px;">
<span style="width: 450px">
        <span style="cursor: -webkit-grab;">
                <div style="margin: 5px; width: 450;" id="HeadTimetable">
                        <button class="mainButton buttonHide" id="hideMeTT" style="width:50px; background: #228B22;">hide</button>
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

var win_Complectations = //описание элементов окна с комплектациями
    `<div style="display: flex; width: 500px;">
<span style="width: 500px">
        <span style="cursor: -webkit-grab;">
                <div style="margin: 5px; width: 500;" id="headComplectations">
                        <button class="mainButton buttonHide" id="hideComplecations" style="width:50px; background: #228B22;">hide</button>
                </div>
        </span>
                <div id="cmplInfo">
                     <p id="cmplData" style="width:500px;color:bisque; max-height:400px; margin-left:5px; margin-top:5px; overflow:auto;text-align:center;"></p>
                </div>
</span>
</div>`;

const wintServices = createWindow('AF_Service', 'winTopService', 'winLeftService', win_serviceinfo);
const wintTimetable = createWindow('AF_Timetable', 'winTopTimetable', 'winLeftTimetable', win_Timetable);
const wintComplectations = createWindow('AF_Complectations', 'winTopComplectations', 'winLeftComplectations', win_Complectations);

const idstudentField = document.getElementById('idstudent');
const getidstudentbtn = document.getElementById('getidstudent');

document.getElementById('servicehead').ondblclick = function (a) { // скрытие окна вензель user info по двойному клику
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
        document.getElementById('AF_Service').style.display = 'none';
        document.getElementById('butServ').classList.remove('activeScriptBtn');
    }
}

document.getElementById('hideMeservice').onclick = function () { // скрытие окна вензель user info
    if (document.getElementById('AF_Service').style.display == '')
        document.getElementById('AF_Service').style.display = 'none'
    document.getElementById('butServ').classList.remove('activeScriptBtn')
}

document.getElementById('dounhidemailandphone').onclick = function () {
    getunhideemail();
    getunhidephone();
    checkemailandphoneidentity()
}

document.getElementById('checkbalance').onclick = function () {
    window.open("https://billing-api.skyeng.ru/operations/user/" + idstudentField.value.trim() + "/info")
}

document.getElementById('GotoCRM').onclick = function () {
    window.open("https://crm2.skyeng.ru/persons/" + idstudentField.value.trim()) 	// открываем ссылку в новой вкладке на  Пользовательская админка
}

document.getElementById('partialpaymentinfo').onclick = function () {
    window.open(`https://billing-api.skyeng.ru/installments?ownerId=${idstudentField.value.trim()}&state=&perPage=50&currentPage=1`)
}

document.getElementById('subscriptioninfo').onclick = function () {  // открываем ссылку в новой вкладке на просмотр Подписки
    window.open(`https://billing-api.skyeng.ru/subscriptions/user/${idstudentField.value}/info`)
}

document.getElementById('editadmbtn').onclick = function () {
    let stuid = idstudentField.value.trim();
    window.open("https://id.skyeng.ru/admin/users/" + stuid + "/update-contacts")
}

document.getElementById('getonetimepass').onclick = function () { //функция генерации разового пароля для МП
    let userId = idstudentField.value.trim();
    if (userId == "")
        console.log('Введите id в поле')
    else {
        document.getElementById('getonetimepass').innerHTML = "✅";
        setTimeout(function () { document.getElementById('getonetimepass').innerHTML = "📱" }, 2000);

        const fetchURL = `https://id.skyeng.ru/admin/auth/one-time-password`;
        const requestOptions = {
            "headers": {
                "content-type": "application/x-www-form-urlencoded",
            },
            "body": `user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D=${userId}&user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            } else {
                const otvetOTPMob = response.fetchansver;
                const convertres11 = otvetOTPMob.match(/Одноразовый пароль: (\d+)\./);
                const otp = convertres11 ? convertres11[1] : null;
                onetimepassout.value = otp;
            }
        })

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

document.getElementById('hideComplecations').onclick = function () { // скрытие окна предстоящих и прошедших занятиях
    if (document.getElementById('AF_Complectations').style.display == '')
        document.getElementById('AF_Complectations').style.display = 'none'
}

let responseinfo;

function checkemailandphoneidentity() {
    let idUser = idstudentField.value.trim()
    pochtaStatus.textContent = ''
    telefonStatus.textContent = ''

    const fetchURL = `https://id.skyeng.ru/admin/users/${idUser}/update-contacts`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const checkEmailAndIdty = response.fetchansver;

            if (flagusertype === "teacher") {
                console.log('It is a teacher!');
            } else if (flagusertype === "student") {
                if (checkEmailAndIdty.includes('"identityEmail" disabled data-value=""') && checkEmailAndIdty.includes('"identityPhone" disabled data-value=""')) {
                    pochtaStatus.textContent = "📧❌";
                    telefonStatus.textContent = "☎❌";
                } else if (checkEmailAndIdty.includes('"identityEmail" disabled data-value=""') && !checkEmailAndIdty.includes('"identityPhone" disabled data-value=""')) {
                    pochtaStatus.textContent = "📧❌";
                    telefonStatus.textContent = "☎✅";
                } else if (!checkEmailAndIdty.includes('"identityEmail" disabled data-value=""') && checkEmailAndIdty.includes('"identityPhone" disabled data-value=""')) {
                    pochtaStatus.textContent = "📧✅";
                    telefonStatus.textContent = "☎❌";
                } else {
                    pochtaStatus.textContent = "📧✅";
                    telefonStatus.textContent = "☎✅";
                }
            }
        }
    })
}

function getunhidephone() { //открывает телефон пользователя
    const polzID = idstudentField.value.trim();

    const fetchURL = `https://backend.skyeng.ru/api/persons/${polzID}/personal-data/?pdType=phone&source=persons.profile`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetPhone = JSON.parse(response.fetchansver);

            if (otvetPhone && otvetPhone.data && 'value' in otvetPhone.data) {
                document.getElementById('phoneunhidden').textContent = otvetPhone.data.value;
            } else {
                // Handle the case where responsePhone or responsePhone.data is undefined, or value is not present
                console.log('Failed to get user phone', otvetPhone);
            }

        }
    })

}

function getunhideemail() { //открывает почту пользователя
    const polzIDNew = idstudentField.value.trim();

    const fetchURL = `https://backend.skyeng.ru/api/persons/${polzIDNew}/personal-data/?pdType=email&source=persons.profile`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetEmail = JSON.parse(response.fetchansver);
            if (otvetEmail && otvetEmail.data && 'value' in otvetEmail.data) {
                document.getElementById('mailunhidden').textContent = otvetEmail.data.value;
            } else {
                // Handle the case where responseEmail or responseEmail.data is undefined, or value is not present
                console.log('Failed to get user email', otvetEmail);
            }
        }
    })

}

let servicecontainer;
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
        servicecontainer = otvet
    }
})

let pochtaStatus = document.getElementById('pochtaIdentity')
let telefonStatus = document.getElementById('telefonIdentity')

document.getElementById('getlessonpast').onclick = function () { // показывает прошедшие уроки
    document.getElementById('timetabledata').innerHTML = "";
    let stid = idstudentField.value.trim();
    let pastlessondata = "";

    const fetchURL = `https://backend.skyeng.ru/api/students/${stid}/timetable/lessons-history/?page=0`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetHistoryPast = JSON.parse(response.fetchansver);

            if (otvetHistoryPast != null) {
                if (otvetHistoryPast.data == "") {
                    document.getElementById('timetabledata').innerHTML = "Еще не было уроков";
                } else {
                    for (let i = 0; i < otvetHistoryPast.data.length; i++) {
                        let d = new Date(otvetHistoryPast.data[i].startedAt)
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
                        if (otvetHistoryPast.data[i].status == "missed_by_student") {
                            otvetHistoryPast.data[i].status = "Пропущен учеником";
                        } else if (otvetHistoryPast.data[i].status == "canceled_by_student") {
                            otvetHistoryPast.data[i].status = "Отменен учеником";
                        } else if (otvetHistoryPast.data[i].status == "success") {
                            otvetHistoryPast.data[i].status = "Прошел";
                        } else if (otvetHistoryPast.data[i].status == "moved_by_student") {
                            otvetHistoryPast.data[i].status = "Перенесен учеником";
                        } else if (otvetHistoryPast.data[i].status == "canceled_by_teacher") {
                            otvetHistoryPast.data[i].status = "Отменен учителем";
                        } else if (otvetHistoryPast.data[i].status == "student_refused_to_study") {
                            otvetHistoryPast.data[i].status = "Отказался от обучения"
                        } else if (otvetHistoryPast.data[i].status == "interrupted") {
                            otvetHistoryPast.data[i].status = "Прерван"
                        } else if (otvetHistoryPast.data[i].status == "did_not_get_through_student") {
                            otvetHistoryPast.data[i].status = "Не смогли связаться с У"
                        } else if (otvetHistoryPast.data[i].status == "canceled_not_marked") {
                            otvetHistoryPast.data[i].status = "Не отмечен учителем вовремя"
                        }

                        if (otvetHistoryPast.data[i].lessonType == "regular") {
                            otvetHistoryPast.data[i].lessonType = "Регулярный";
                        } else if (otvetHistoryPast.data[i].lessonType == "single") {
                            otvetHistoryPast.data[i].lessonType = "Одиночный";
                        } else if (otvetHistoryPast.data[i].lessonType == "trial") {
                            otvetHistoryPast.data[i].lessonType = "Пробный";
                        }

                        for (let j = 0; j < servicecontainer.data.length; j++) {
                            if (servicecontainer.data[j].serviceTypeKey == otvetHistoryPast.data[i].educationService.serviceTypeKey)
                                otvetHistoryPast.data[i].educationService.serviceTypeKey = servicecontainer.data[j].title;
                        }

                        if (otvetHistoryPast.data[i].educationService.serviceTypeKey == null) {
                            otvetHistoryPast.data[i].educationService.serviceTypeKey = "Услуга была в CRM1, см позднее обозначение!"
                        }

                        if (otvetHistoryPast.data[i].teacher != null) {
                            pastlessondata += '<span style="color: #00FA9A">&#5129;</span>' + '<span style="color:#FF7F50; font-weight:900;">Дата: </span>' + denek + "-" + mesacok + "-" + d.getFullYear() + " " + chasok + ":" + minutka +
                                '<span style="color:#c9dbd2; font-weight:900;"> Статус: </span>' + (otvetHistoryPast.data[i].status == "Прошел" ? ('<span style="color:#00FF7F;">' + otvetHistoryPast.data[i].status + '</span>') : ('<span style="color:coral; font-weight:700">' + otvetHistoryPast.data[i].status + '</span>')) + '<span style="color:#c9dbd2; font-weight:900;"> Урок: </span>' + otvetHistoryPast.data[i].lessonType + '<br>'
                                + '<span style="color:#00BFFF; font-weight:900;">Услуга: </span>' + otvetHistoryPast.data[i].educationService.id + " " + otvetHistoryPast.data[i].educationService.serviceTypeKey + '<br>'
                                + '<span style="color:#32CD32; font-weight:900;">Преподаватель: </span>' + " " + otvetHistoryPast.data[i].teacher.general.id + " " + otvetHistoryPast.data[i].teacher.general.name + " " + otvetHistoryPast.data[i].teacher.general.surname + '<br>'
                                + '<hr style="width:420px; border: 1px dotted #ff0000;  border-style: none none dotted; color: #fff; background-color: #fff;"></hr>';
                        } else {
                            pastlessondata += '<span style="color: #00FA9A">&#5129;</span>' + '<span style="color:#FF7F50; font-weight:900;">Дата: </span>' + denek + "-" + mesacok + "-" + d.getFullYear() + " " + chasok + ":" + minutka +
                                '<span style="color:#c9dbd2; font-weight:900;"> Статус: </span>' + otvetHistoryPast.data[i].status + '<span style="color:#c9dbd2; font-weight:900;"> Урок: </span>' + otvetHistoryPast.data[i].lessonType + '<br>'
                                + '<span style="color:#00BFFF; font-weight:900;">Услуга: </span>' + otvetHistoryPast.data[i].educationService.id + " " + otvetHistoryPast.data[i].educationService.serviceTypeKey + '<br>'
                                + '<hr style="width:420px; border: 1px dotted #ff0000;  border-style: none none dotted; color: #fff; background-color: #fff;"></hr>';
                        }
                    }

                    document.getElementById('timetabledata').innerHTML = pastlessondata;
                    pastlessondata = ""
                }
            }
        }
    })

}

document.getElementById('getlessonfuture').onclick = function () { // показывает предстоящие уроки

    document.getElementById('timetabledata').innerHTML = "";
    let idShka = idstudentField.value.trim();
    if (idShka.length > 0) {
        let futurelessondata = "";

        const fetchURL = `https://backend.skyeng.ru/api/students/${idShka}/timetable/future-lessons/`;
        const requestOptions = {
            method: 'GET'
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            } else {
                const otvetHistoryFuture = JSON.parse(response.fetchansver);

                if (otvetHistoryFuture != null) {
                    if (otvetHistoryFuture.data == "") {
                        document.getElementById('timetabledata').innerHTML = "Уроки не запланированы";
                    } else {
                        for (let i = 0; i < otvetHistoryFuture.data.length; i++) {
                            let d = new Date(otvetHistoryFuture.data[i].startedAt)
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

                            if (otvetHistoryFuture.data[i].lessonType == "regular") {
                                otvetHistoryFuture.data[i].lessonType = "Регулярный";
                            } else if (otvetHistoryFuture.data[i].lessonType == "single") {
                                otvetHistoryFuture.data[i].lessonType = "Одиночный";
                            } else if (otvetHistoryFuture.data[i].lessonType == "trial") {
                                otvetHistoryFuture.data[i].lessonType = "Пробный";
                            }

                            for (let j = 0; j < servicecontainer.data.length; j++) {
                                if (servicecontainer.data[j].serviceTypeKey == otvetHistoryFuture.data[i].educationService.serviceTypeKey)
                                    otvetHistoryFuture.data[i].educationService.serviceTypeKey = servicecontainer.data[j].title;
                            }

                            if (otvetHistoryFuture.data[i].teacher != null) {
                                futurelessondata += '<span style="color: #00FA9A">&#5129;</span>' + '<span style="color:#FF7F50; font-weight:900;">Дата: </span>' + denek + "-" + mesacok + "-" + d.getFullYear() + " " + chasok + ":" + minutka
                                    + '<span style="color:#FFD700; font-weight:900;"> Урок: </span>' + otvetHistoryFuture.data[i].lessonType + '<br>'
                                    + '<span style="color:#00BFFF; font-weight:900;">Услуга: </span>' + otvetHistoryFuture.data[i].educationService.id + " " + otvetHistoryFuture.data[i].educationService.serviceTypeKey + '<br>'
                                    + '<span style="color:#32CD32; font-weight:900;">Преподаватель: </span>' + " " + otvetHistoryFuture.data[i].teacher.general.id + " " + otvetHistoryFuture.data[i].teacher.general.name + " " + otvetHistoryFuture.data[i].teacher.general.surname + '<br>'
                                    + '<hr style="width:420px; border: 1px dotted #ff0000;  border-style: none none dotted; color: #fff; background-color: #fff;"></hr>';
                            } else {
                                futurelessondata += '<span style="color: #00FA9A">&#5129;</span>' + '<span style="color:#FF7F50; font-weight:900;">Дата: </span>' + denek + "-" + mesacok + "-" + d.getFullYear() + " " + chasok + ":" + minutka
                                    + '<span style="color:#FFD700; font-weight:900;"> Урок: </span>' + otvetHistoryFuture.data[i].lessonType + '<br>'
                                    + '<span style="color:#00BFFF; font-weight:900;">Услуга: </span>' + otvetHistoryFuture.data[i].educationService.id + " " + otvetHistoryFuture.data[i].educationService.serviceTypeKey + '<br>'
                                    + '<hr style="width:420px; border: 1px dotted #ff0000;  border-style: none none dotted; color: #fff; background-color: #fff;"></hr>';
                            }

                        }
                        document.getElementById('timetabledata').innerHTML = futurelessondata;
                        futurelessondata = "";
                    }
                }
            }
        })



    } else alert('Запрос не выполнен. Введите ID в поле!')
}

document.getElementById('changelocalelng').onclick = function () {
    let userOk = idstudentField.value;

    const fetchURL = `https://backend.skyeng.ru/api/persons/general/${userOk}`;
    const requestOptions = {
        "headers": {
            "content-type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://crm2.skyeng.ru/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"serviceLocale\":\"ru\"}",
        "method": "PUT",
        "mode": "cors",
        "credentials": "include"
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            console.log('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            console.log("Язык обслуживания Successfully changed")
            document.getElementById('changelocalelng').innerHTML = "✅";
            setTimeout(function () { document.getElementById('changelocalelng').innerHTML = "🌍"; }, 2000);
        }
    })
}

document.getElementById('catchathistory').onclick = function () { // открывает в вензеле историю чатов введеного айди пользователя

    if (document.getElementById('AF_ChatHis').style.display == 'none') {
        document.getElementById('opennewcat').click();
        document.getElementById('chatuserhis').value = idstudentField.value.trim();
        btn_search_history.click()
    } else {
        document.getElementById('chatuserhis').value = idstudentField.value.trim();
        btn_search_history.click()
    }
}

let nameofuser, teachername, studentname, responsedata, utczone, localtime;
let servlocalestatus, avatarofuser, countryofuser, ageofuser;

function getusernamecrm() {
    const sid = idstudentField.value.trim()
    const changeLocaleLngElement = document.getElementById('changelocalelng');
    const checkBalanceElement = document.getElementById('checkbalance');
    const partialPaymentInfoElement = document.getElementById('partialpaymentinfo');
    const subscriptioninfoElement = document.getElementById('subscriptioninfo');
    const getPastAndFutureLessonsElement = document.getElementById('getpastandfuturelessons');
    const newTrmElement = document.getElementById('newtrm');
    const TeachNabElement = document.getElementById('butTeacherNabor')
    const personalTeacherPageElement = document.getElementById('personalteacherpage');
    avatarofuser = '';
    flagusertype = '';

    const fetchURL = `https://backend.skyeng.ru/api/persons/${sid}?crm2=true&debugParam=person-page`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetUsrCrmName = JSON.parse(response.fetchansver);

            let name = otvetUsrCrmName.data.name + (otvetUsrCrmName.data.surname ? ` ${otvetUsrCrmName.data.surname}` : '');
            if (otvetUsrCrmName.data.type == "student") {
                pochtaStatus.innerText = "hidden"
                telefonStatus.innerText = "hidden"

                nameofuser = name;
                usrName.textContent = nameofuser;
                flagusertype = 'student'
                usrType.textContent = "Ученик";
                usrType.style = "color:#38cf7a; font-weight:900; text-align:center;";
                usrAge.style.display = "";

                let elemsToUnHide = document.getElementsByName('studentosFields')
                elemsToUnHide.forEach(function (item) {
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
                TeachNabElement.style.display = "none";
                personalTeacherPageElement.style.display = "none";
                if (otvetUsrCrmName.data.avatarUrl) {
                    avatarofuser = otvetUsrCrmName.data.avatarUrl.match(/https:\/\/cdn-auth-avatars\.skyeng\.ru\/\d+\/[a-f0-9-]+$/)[0];
                }

            } else if (otvetUsrCrmName.data.type == "teacher") {
                teachername = name;

                usrName.textContent = teachername;
                flagusertype = 'teacher'
                usrType.textContent = "Преподаватель";
                usrType.style = "color:#00BFFF; font-weight:900; text-align:center;";
                usrAge.style.display = "none";

                let elemsToHide = document.getElementsByName('studentosFields')
                elemsToHide.forEach(function (item) {
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
                TeachNabElement.style.display = "";
                personalTeacherPageElement.style.display = "";
                if (otvetUsrCrmName.data.avatarUrl) {
                    avatarofuser = otvetUsrCrmName.data.avatarUrl.match(/https:\/\/cdn-auth-avatars\.skyeng\.ru\/\d+\/[a-f0-9-]+$/)[0];
                }

                document.getElementById('servicetable').innerHTML = ''
            }

            if (document.getElementById('getloginer') != null) {
                document.getElementById('getloginer').onclick = async function () {
                    const button = document.getElementById('getloginer');
                    button.style = "background:orange; padding: 2px; border-radius:20%";

                    try {
                        await getLoginLink(idstudentField.value.trim());
                        button.style = "background:green; padding: 2px; border-radius:20%";
                    } catch (error) {
                        console.log('Ошибка: ', error);
                        button.style = "background:red; padding: 2px; border-radius:20%";
                        alert('Не удалось получить логиннер: ' + error.message);
                    } finally {
                        setTimeout(() => {
                            button.style.background = "none";
                        }, 2000);
                    }
                };
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

            servlocalestatus = otvetUsrCrmName.data.serviceLocale || "⭕";
            countryofuser = otvetUsrCrmName.data.country || null;

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
            utczone = otvetUsrCrmName.data.utcOffset;
            utcZoneLnk.textContent = utczone
            MSKdifference.textContent = (utczone - 3)
            let curhours = (curdate.getUTCHours() + 3);
            localtime = new Date(curdate.getTime() + utczone * 60 * 60 * 1000).toISOString().substr(11, 5);
            localMSKTime.textContent = localtime


            let currentYear = curdate.getFullYear();
            if (otvetUsrCrmName.data.birthday) {
                let birthYear = parseInt(otvetUsrCrmName.data.birthday.split('-')[0]);
                let age = currentYear - birthYear;
                ageofuser = age < 18 ? "🔞" : (age >= 18 && age < 99 ? "🅰" : "❓");
            } else {
                ageofuser = "❓";
            }
            usrAge.textContent = ageofuser;
        }
    })
}

let getcrmstatusinfo;
let crmresponseinfo;

function crmstatus() {
    const tempvarcrm = idstudentField.value.trim();

    let flagtpout = false;
    let flagtp = false;
    let flagnottp = false;
    let flagstatuswait = false;
    let flagstatusprocessing = false;
    let opername = '';

    document.getElementById('getcurrentstatus').style.display = 'none';
    document.getElementById('CrmStatus').style.display = 'none';

    const fetchURL = `https://customer-support.skyeng.ru/task/user/${tempvarcrm}`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otveUserTasks = JSON.parse(response.fetchansver);

            for (const data of otveUserTasks.data) {
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

            function updateCrmStatus(innerText, consoleText) {
                document.getElementById('CrmStatus').style.display = '';
                document.getElementById('CrmStatus').innerText = innerText;
                console.log(consoleText);
            }

            if (flagtpout && !flagtp && !flagnottp) {
                updateCrmStatus('💥', 'Есть активные задачи');
            } else if (!flagtpout && flagtp && !flagnottp) {
                updateCrmStatus('🛠', 'Входящий звонок или с др отдела на ТП была создана задача');
            } else if (!flagtpout && !flagtp && flagnottp) {
                updateCrmStatus('📵', 'Нет активных задач по ТП линии');
            } else if (flagtpout && flagtp && !flagnottp) {
                updateCrmStatus('💥', 'Есть активные задачи на исход и на ТП 1 линии');
            } else if (flagtpout && flagtp && flagnottp) {
                updateCrmStatus('💥', 'Есть активные задачи на исход и на ТП 1 линии и на др отделы');
            } else if (flagtp == true && flagnottp == true && flagtpout == false) {
                updateCrmStatus('🛠', 'Входящий звонок или с др отдела на ТП была создана задача. И есть задача на др отдел');
            } else if (flagtp == false && flagnottp == true && flagtpout == true) {
                updateCrmStatus('💥', 'Есть задача на ТП Исход. И есть задача на др отдел');
            } else {
                updateCrmStatus('📵', 'No DATA');
            }
        }
    })

}

async function checkServiceAndUserInfo() {
    let stidNew = idstudentField.value.trim()

    setTimeout(function () {
        if (flagusertype == "teacher") {
            document.getElementById('servicetable').innerHTML = '';
            arrservice = null;
        } else {
            getservices(stidNew)
        }
    }, 1000)
}

async function getservices(stidNew) {
    document.getElementById('servicetable').innerHTML = "Загрузка..."
    let complectationServInfo = document.getElementById('cmplData');
    complectationServInfo.innerHTML = ""
    let linkToComplectationtable = document.getElementById('complekttable')
    linkToComplectationtable.innerHTML = ""
    let operatorNote = "";


    const fetchURL = `https://backend.skyeng.ru/api/persons/${stidNew}/education-services/`;
    const requestOptions = {
        method: 'GET'
    };

    const fetchURLComplectations = `https://backend.skyeng.ru/api/v1/students/${stidNew}/education-service-kits/`;
    const requestOptionsComplectations = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLComplectations, requestOptions: requestOptionsComplectations }, function (response) { // получение информации по комплектациям
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const chechkComplectations = JSON.parse(response.fetchansver);

            if (chechkComplectations.data.length > 0) {
                linkToComplectationtable.innerHTML += '<div id="openOneComplectation" style="background: #4e7891; text-align:center; cursor:pointer; text-shadow: 1px 1px 2px black;">✅Есть комплектации >>></div>'

                const openOneCompl = document.getElementById('openOneComplectation');
                openOneCompl.addEventListener('click', function () {
                    let getComplWindow = document.getElementById('AF_Complectations');
                    if (getComplWindow.style.display == "none") {
                        getComplWindow.style.display = "";
                    } else {
                        getComplWindow.style.display = "none";
                    }
                });

                chechkComplectations.data.forEach((service) => {
                    if (service.incorrectnessReason == null) {
                        if (service.operatorNote) {
                            operatorNote = service.operatorNote.replace(/\/\//g, ' ').replace(/\//g, '&#47;');
                            console.log(operatorNote);
                        }

                        let gatheredInfoComplSrvs = '<table style="width: 98%; margin: 10px 0; border-collapse: collapse;">';
                        gatheredInfoComplSrvs += `
                            <tr style="background: #776d69; color: white; position: sticky; top: 0px; z-index:10">
                                <th style="border: 1px solid black; padding: 5px; ">ID Услуги</th>
                                <th style="border: 1px solid black; padding: 5px; ">STK</th>
                                <th style="border: 1px solid black; padding: 5px; ">💰</th>
                                <th style="border: 1px solid black; padding: 5px; ">Sync</th>
                            </tr>`;

                        const allEduServicesCompl = service.educationServices;
                        allEduServicesCompl.forEach((el) => {
                            let { formattedText, lessontype } = formatServiceType(el.serviceTypeKey); // Вызов функции для форматирования строки
                            gatheredInfoComplSrvs += `
                        <tr>
                        <td name="idServForSync" style="border: 1px solid black; padding: 5px; background: #4f4c4c;">
                        <a href="https://crm2.skyeng.ru/persons/${service.student.general.id}/services/${el.id}" target="_blank" style="color:#32b5f5; text-decoration: none;">${el.id}</a>
                    </td>
                            <td style="border: 1px solid black; padding: 5px; background: #4f4c4c;">${formattedText}</td>
                            <td style="border: 1px solid black; padding: 5px; background: #4f4c4c;">${el.balance}</td>
                            <td class="syncBtn" name="btnSynchro"><span class="emoji">♻️</span></td>
                        </tr>`;
                        });
                        gatheredInfoComplSrvs += '</table>';

                        complectationServInfo.innerHTML += `<div style="background: #4a7d55; text-align: center; border-radius: 20px; width: 97%; text-shadow: 1px 1px 2px black; margin-bottom:5px;" title="${operatorNote}">ℹ️ [${service.id}] ${service.productKit.title} | ${service.stage == "regular_lessons" ? "Регулярные занятия" : service.stage == "lost" ? "Потерянная" : service.stage}</div>` + gatheredInfoComplSrvs;

                    } else {
                        complectationServInfo.innerHTML += `<div style="background: #8d310f; text-align: center; border-radius: 20px; width: 97%; text-shadow: 1px 1px 2px black; margin-bottom:5px;">[${service.id}] '${service.productKit.title}' - некорректна</div>`
                    }

                });


                let allBtns = document.getElementsByName('btnSynchro')
                let allIdSrv = document.getElementsByName('idServForSync')
                let allSyncEmojis = document.getElementsByClassName('emoji')
                for (let i = 0; i < allBtns.length; i++) {
                    allBtns[i].onclick = function () {
                        allSyncEmojis[i].innerText = "⏳"
                        const gToken = localStorage.getItem('token_global');
                        const fetchURL = `https://skysmart-core.skyeng.ru/api/v1/academic-activity/upsert-education-service-history/${allIdSrv[i].innerText}`;
                        const requestOptions = {
                            headers: {
                                "accept": "application/json, text/plain, */*",
                                "authorization": `Bearer ${gToken}`
                            },
                            method: "POST",
                            mode: "cors"
                        };

                        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
                            if (!response.success) {
                                alert('Не удалось выполнить запрос: ' + response.error + 'Если запускали синхронизацию через расширение, то необходимо после закрытия окна повторно открыть в новой вкладке CRM на 5 секунд. После чего вернуться в окно AF иобновить страницу');
                                allSyncEmojis[i].innerText = "❌";
                                localStorage.removeItem('token_global')
                            } else {
                                allSyncEmojis[i].innerText = "✅";
                                setTimeout(function () { allSyncEmojis[i].innerText = "♻️"; }, 5000);
                            }
                        });
                    }
                }

            } else {
                linkToComplectationtable.innerHTML += '<div style="background: #4e7891; text-align:center; text-shadow: 1px 1px 2px black;">❌Нет комплектаций</div>';
                console.log("Нет услуг комплектаций Домашний Лицей, Large Classes Exams и других");
            }
        }
    });

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetEdServ = JSON.parse(response.fetchansver);

            if (otvetEdServ.data.length != 0) {
                let servinfo = ""; //инфо об услуге
                let arrservice = []; // пустой массив, куда будет передавать ID отобранных услуг по условию

                let srvKeyMap = new Map(servicecontainer.data.map(d => [d.serviceTypeKey, d.shortTitle]));
                otvetEdServ.data.forEach((service, i) => {
                    if (srvKeyMap.has(service.serviceTypeKey)) {
                        service.serviceTypeKey = srvKeyMap.get(service.serviceTypeKey);
                    }

                    if (service.student.general.id == stid) {
                        if (service.incorrectnessReason == null) {

                            if ((service.stage === "after_trial" || service.stage === "before_call") && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey != "Групповые онлайн-мероприятия Life" && service.serviceTypeKey != "Скрининг" && service.serviceTypeKey != "Англ adult АЯ Даунсейл") {
                                servinfo += '<div style="text-align:center; background:#c26919; color:#ffffff; font-weight:700;border: 1px solid black;">Этап ВУ |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #c26919; color:#000000;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '</div>'
                                arrservice += service.id + ", ";
                            }

                            if (service.stage === "regular_lessons" && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey != "Групповые онлайн-мероприятия Life" && service.serviceTypeKey != "Скрининг" && service.serviceTypeKey != "Англ adult АЯ Даунсейл") {
                                const teacherInfo = service.teacher
                                    ? "👽 Teacher: " + service.teacher.general.id + "," + " " + service.teacher.general.name + " " + service.teacher.general.surname
                                    : "👽 Teacher: Не закреплен!";
                                const tmpTeacherInfo = service.temporaryTeacher
                                    ? "⏳👽 Teacher: " + service.temporaryTeacher.general.id + "," + " " + service.temporaryTeacher.general.name + " " + service.temporaryTeacher.general.surname
                                    : "NoTmp";

                                if (tmpTeacherInfo != "NoTmp") {
                                    servinfo += '<div style="text-align:center; background:#30508c; font-weight:700;border: 1px solid black;">Регулярные занятия |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #2b602b; color:navajowhite;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '<br>' + teacherInfo + '<br>' + tmpTeacherInfo + '</div>';
                                    arrservice += service.id + ", ";
                                } else {
                                    servinfo += '<div style="text-align:center; background:#30508c; font-weight:700;border: 1px solid black;">Регулярные занятия |' + ' 💰 Баланс: ' + service.balance + '</div>' + '<div style="background: #2b602b; color:navajowhite;  margin-left: 5px; border: 1px solid bisque;">' + [i + 1] + ") " + '<span>🆔 Услуги: </span>' + service.id + '<span class = "copyserviceid">💾</span>' + '<br>' + '💡:' + service.serviceTypeKey + '<br>' + teacherInfo + '</div>';
                                    arrservice += service.id + ", ";
                                }
                            }

                            if (service.stage === "lost" && service.serviceTypeKey != "Англ Talks 15 min" && service.serviceTypeKey != "Skyeng Space" && service.serviceTypeKey != "Групповые онлайн-мероприятия Life" && service.serviceTypeKey != "Скрининг" && service.serviceTypeKey != "Англ adult АЯ Даунсейл") {
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

                if (document.getElementById('getloginer') != null) {
                    document.getElementById('getloginer').onclick = async function () {
                        const button = document.getElementById('getloginer');
                        button.style = "background:orange; padding: 2px; border-radius:20%";

                        try {
                            await getLoginLink(idstudentField.value.trim());
                            button.style = "background:green; padding: 2px; border-radius:20%";
                        } catch (error) {
                            console.log('Ошибка: ', error);
                            button.style = "background:red; padding: 2px; border-radius:20%";
                            alert('Не удалось получить логиннер: ' + error.message);
                        } finally {
                            setTimeout(() => {
                                button.style.background = "none";
                            }, 2000);
                        }
                    };
                }

            } else {
                document.getElementById('servicetable').innerHTML = '<div style="text-align:center; background:coral; font-weight:700;border: 1px solid black; color: floralwhite;">Услуг вообще нет!</div>'
            }

        }
    })
}

// async function getcomplect(stidNew) {

//}

function getuserinfo() {
    document.getElementById('servicetable').innerHTML = "Загрузка..."
    usrServLanguage = document.getElementById('usrServLang');
    usrAge = document.getElementById('usrAge');
    usrName = document.getElementById('usrName');
    usrCountry = document.getElementById('usrCountry');
    usrType = document.getElementById('usrType')
    usrType.textContent = '';
    document.getElementById('mailunhidden').textContent = "hidden"
    document.getElementById('phoneunhidden').textContent = "hidden"

    document.querySelector('#useravatar').src = "";
    if (document.querySelector('#useravatar').style.display != "none")
        document.querySelector('#useravatar').style.display = "none";

    document.getElementById('getcurrentstatus').title = "";
    stid = idstudentField.value.trim();

    setTimeout(getusernamecrm, 640);
    setTimeout(crmstatus, 700);
    setTimeout(checkServiceAndUserInfo, 720)
}

getidstudentbtn.onclick = function () { // нажатие на ракету
    getuserinfo()
    setTimeout(function () {
        if (document.getElementById('servicetable').innerHTML == "Загрузка...") {
            checkServiceAndUserInfo()
        }
    }, 4000)
}

function handleInput(event) {
    idstudentField.value = '';
    const pastedValue = (event.clipboardData || event.dataTransfer).getData('text').trim();
    setTimeout(() => {
        if (/^\d+$/.test(pastedValue)) {
            idstudentField.value = pastedValue;
            getidstudentbtn.click();
        }
    }, 0);
}

idstudentField.addEventListener('paste', handleInput);
idstudentField.addEventListener('drop', handleInput);
idstudentField.addEventListener('input', () => onlyNumber(idstudentField));

document.getElementById('CrmStatus').onclick = crmstatus;

document.getElementById('crmactivetasks').onclick = function () { //открыват СРМ с активными задачами
    window.open("https://crm2.skyeng.ru/persons/" + idstudentField.value.trim() + "/customer-support/list")
}

document.getElementById('newtrm').onclick = function () { //открывает новый TRM 2.0 п
    window.open("https://trm.skyeng.ru/teacher/" + idstudentField.value.trim())
}

document.getElementById('personalteacherpage').onclick = function () { //открывает личную страницу П
    window.open("https://skyeng.ru/teachers/id/" + idstudentField.value.trim())
}

document.getElementById('clearservinfo').onclick = function () { //очищает все в вензеле
    idstudentField.value = "";
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

