var win_Alarmclock =  // описание элементов окна будильника
    `<div class="maindivst" id="AlarmclockCRM">
        <div style="margin: 5px; width: 291px;" id="Alarmclock_1str">
            <button class="buttonHide" title="скрывает меню" id="hideAlarmclock">hide</button>
            <button class="btnCRM" title="Отображение текущего времени" id="clock_jsCRM" style="color: white; float: right;"></button>
        </div>
		<div style="margin: 5px; width: 291px">
			<label class="spanCRM" style="display: block; margin-left: auto; margin-right: auto; text-align: center; color:bisque;">Напоминание №1</label>
            <input class="inputCRM" title="Ввод текста напоминания" id="remindertextCRM"  placeholder="Текст напоминания" autocomplete="off" style="text-align: center; margin-top: 5px; width: 284px; color: black;">
			<input class="inputCRM" title="Ввод часа от 0 до 23 для напоминания" "="" id="setchasCRM" placeholder="HH" autocomplete="off" type="number" maxlength="2" min="0" max="23" style="text-align: center; margin-top: 5px; width: 50px; color: black;"> <span class="spanCRM" style="color: white; margin-top: 5px;">:</span>
			<input class="inputCRM" title="Ввод минут от 0 до 59 для напоминания" id="setminutaCRM" placeholder="MM" autocomplete="off" type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px;  width: 50px; color: black;">
			<button class="btnCRM" title="Запуск напоминания при устаноовленном времени" id="setreminderCRM" style="margin-top: 5px">SET🔔</button>
            <button class="btnCRM" id="clock_reminCRM" title="Двойной клик = удаление таймера. Кнопка отображения оставшегося времени" style="color: lightgreen; margin-top: 5px; float: right;">00 : 00 : 00</button>
            <br>
            <label class="spanCRM" style="display: block; margin-left: auto; margin-right: auto; margin-top:5px; text-align: center; color:bisque;">Напоминание №2</label>
			<input class="inputCRM" title="Ввод текста напоминания" id="remindertextCRM1"  placeholder="Текст напоминания" autocomplete="off" style="text-align: center; margin-top: 5px; width: 284px; color: black;">
			<input class="inputCRM" title="Ввод часа от 0 до 23 для напоминания" "="" id="setchasCRM1" placeholder="HH" autocomplete="off" type="number" maxlength="2" min="0" max="23" style="text-align: center; margin-top: 5px; width: 50px; color: black;"> <span class="spanCRM" style="color: white; margin-top: 5px;">:</span>
			<input class="inputCRM" title="Ввод минут от 0 до 59 для напоминания" id="setminutaCRM1" placeholder="MM" autocomplete="off" type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px;  width: 50px; color: black;">
			<button class="btnCRM" title="Запуск напоминания при устаноовленном времени" id="setreminderCRM1" style="margin-top: 5px">SET🔔</button>
            <button class="btnCRM" id="clock_reminCRM1" title="Двойной клик = удаление таймера. Кнопка отображения оставшегося времени" style="color: lightgreen; margin-top: 5px; float: right;">00 : 00 : 00</button>
		</div>
</div>`;

const wintAlarmclock = createWindow('winAlarmclock', 'winTopAlarmclock', 'winLeftAlarmclock', win_Alarmclock);
hideWindowOnDoubleClick('winAlarmclock');
hideWindowOnClick('winAlarmclock', 'hideAlarmclock');

document.getElementById('AlarmclockCRM').addEventListener('input', function (event) {
    // Проверяем, что событие произошло в интересующем нас input с типом 'number'
    if (event.target.matches('.inputCRM[type="number"]')) {
        maxLengthCheck(event.target);
        checkMinMaxValue(event.target);
    }
});

document.getElementById('btnAlarmclock').onclick = function () { // открытие окна будильника
    if (document.getElementById('winAlarmclock').style.display == 'none') {
        document.getElementById('winAlarmclock').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'
    } else {
        document.getElementById('winAlarmclock').style.display = 'none'
        document.getElementById('idmymenucrm').style.display = 'none'
    }
}

setInterval(CRM_clock_on_javascript_1, 1000);
setInterval(CRM_clock_on_javascript_2, 1000);
setInterval(CRM_clock_on_javascript_3, 1000);

function CRM_clock_on_javascript_1() { //таймер обычного отсчета текущего времени
    var data = new Date();
    hours = data.getHours();
    if (hours < 10) { hours = "0" + hours; }
    minutes = data.getMinutes();
    if (minutes < 10) { minutes = "0" + minutes; }
    seconds = data.getSeconds();
    if (seconds < 10) { seconds = "0" + seconds; }
    time = hours + " : " + minutes + " : " + seconds;
    document.getElementById("clock_jsCRM").innerHTML = time;
}

function CRM_clock_on_javascript_2() { //таймер отсчета до срабатывания будильника #1
    var data = new Date();
    hours = data.getHours();
    if (hours < 10) { hours = "0" + hours; }
    minutes = data.getMinutes();
    if (minutes < 10) { minutes = "0" + minutes; }
    seconds = data.getSeconds();
    if (seconds < 10) { seconds = "0" + seconds; }
    var summin = JSON.parse(localStorage.getItem('setminutaCRM')) + 60;
    if (localStorage.getItem('chronostamp') === null) {
        time = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_reminCRM").innerHTML = time;
    } else if (((localStorage.getItem('setchasCRM') - hours) == 0) && ((localStorage.getItem('setminutaCRM') > minutes))) {
        time = "00" + " : " + (localStorage.getItem('setminutaCRM') - minutes - 1) + " : " + (60 - seconds);
        document.getElementById("clock_reminCRM").innerHTML = time;
    } else if (((localStorage.getItem('setchasCRM') - hours) > 1) && ((localStorage.getItem('setminutaCRM') - minutes) == 0)) {
        time = (localStorage.getItem('setchasCRM') - hours) + " : " + "00" + " : " + (60 - seconds);
        document.getElementById("clock_reminCRM").innerHTML = time;
    } else if (((localStorage.getItem('setchasCRM') - hours) >= 1) && localStorage.getItem('setminutaCRM') < minutes) {
        time = ((localStorage.getItem('setchasCRM') - hours) - 1) + " : " + (summin - minutes) + " : " + (60 - seconds);
        document.getElementById("clock_reminCRM").innerHTML = time;
    } else if (((localStorage.getItem('setchasCRM') - hours) > 0) && localStorage.getItem('setminutaCRM') > minutes) {
        time = localStorage.getItem('setchasCRM') - hours + " : " + (localStorage.getItem('setminutaCRM') - minutes - 1) + " : " + (60 - seconds);
        document.getElementById("clock_reminCRM").innerHTML = time;
    } else if (((localStorage.getItem('setchasCRM') - hours) == 1) && (localStorage.getItem('setminutaCRM') - minutes) == 0) {
        time = localStorage.getItem('setchasCRM') - hours + " : " + "00" + " : " + (60 - seconds);
        document.getElementById("clock_reminCRM").innerHTML = time;
    } else {
        time = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_reminCRM").innerHTML = time;
    }
}

function CRM_clock_on_javascript_3() { //таймер отсчета до срабатывания будильника #2
    var data1 = new Date();
    hours1 = data1.getHours();
    if (hours1 < 10) { hours1 = "0" + hours1; }
    minutes1 = data1.getMinutes();
    if (minutes1 < 10) { minutes1 = "0" + minutes1; }
    seconds1 = data1.getSeconds();
    if (seconds1 < 10) { seconds1 = "0" + seconds1; }
    var summin1 = JSON.parse(localStorage.getItem('setminutaCRM1')) + 60;
    if (localStorage.getItem('chronostamp1') === null) {
        time1 = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_reminCRM1").innerHTML = time1;
    } else if (((localStorage.getItem('setchasCRM1') - hours1) == 0) && ((localStorage.getItem('setminutaCRM1') > minutes1))) {
        time1 = "00" + " : " + (localStorage.getItem('setminutaCRM1') - minutes1 - 1) + " : " + (60 - seconds1);
        document.getElementById("clock_reminCRM1").innerHTML = time1;
    } else if (((localStorage.getItem('setchasCRM1') - hours1) > 1) && ((localStorage.getItem('setminutaCRM1') - minutes1) == 0)) {
        time1 = (localStorage.getItem('setchasCRM1') - hours1) + " : " + "00" + " : " + (60 - seconds1);
        document.getElementById("clock_reminCRM1").innerHTML = time1;
    } else if (((localStorage.getItem('setchasCRM1') - hours1) >= 1) && localStorage.getItem('setminutaCRM1') < minutes1) {
        time1 = ((localStorage.getItem('setchasCRM1') - hours1) - 1) + " : " + (summin1 - minutes1) + " : " + (60 - seconds1);
        document.getElementById("clock_reminCRM1").innerHTML = time1;
    } else if (((localStorage.getItem('setchasCRM1') - hours1) > 0) && localStorage.getItem('setminutaCRM1') > minutes1) {
        time1 = localStorage.getItem('setchasCRM1') - hours1 + " : " + (localStorage.getItem('setminutaCRM1') - minutes1 - 1) + " : " + (60 - seconds1);
        document.getElementById("clock_reminCRM1").innerHTML = time1;
    } else if (((localStorage.getItem('setchasCRM1') - hours1) == 1) && (localStorage.getItem('setminutaCRM1') - minutes1) == 0) {
        time1 = localStorage.getItem('setchasCRM1') - hours1 + " : " + "00" + " : " + (60 - seconds1);
        document.getElementById("clock_reminCRM1").innerHTML = time1;
    } else {
        time1 = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_reminCRM1").innerHTML = time1;
    }
}

var CRMabortTimeOut = ''								// перменная для отмены будильника
var CRMabortTimeOut1 = ''								// перменная для отмены будильника
if (localStorage.getItem('chronostamp') == null && localStorage.getItem('chronostamp1') == null) {
    document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
}

document.getElementById('setreminderCRM').onclick = function () {  // выставляем будильник
    document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    localStorage.setItem('remindertextCRM', remindertextCRM.value);
    localStorage.setItem('setchasCRM', setchasCRM.value);
    if (setminutaCRM.value == "00") {
        setminutaCRM.value = 0;
    }
    localStorage.setItem('setminutaCRM', setminutaCRM.value);
    var timearr = new Date()
    var chronostamp = (((localStorage.getItem('setchasCRM') - timearr.getHours()) * 60 * 60) + ((localStorage.getItem('setminutaCRM') - timearr.getMinutes()) * 60) + (0 - timearr.getSeconds())) * 1000;
    localStorage.setItem('chronostamp', chronostamp);
    //		setchasCRM.value = "";
    //		setminutaCRM.value = "";
    alert("Напоминание установлено на " + setchasCRM.value + ":" + setminutaCRM.value + ":" + "00");
    CRMabortTimeOut = setTimeout(setRemindCRM, localStorage.getItem('chronostamp'));
}

document.getElementById('setreminderCRM1').onclick = function () {  // выставляем будильник
    document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    localStorage.setItem('remindertextCRM1', remindertextCRM1.value);
    localStorage.setItem('setchasCRM1', setchasCRM1.value);
    if (setminutaCRM1.value == "00") {
        setminutaCRM1.value = 0;
    }
    localStorage.setItem('setminutaCRM1', setminutaCRM1.value);
    var timearr1 = new Date()
    var chronostamp1 = (((localStorage.getItem('setchasCRM1') - timearr1.getHours()) * 60 * 60) + ((localStorage.getItem('setminutaCRM1') - timearr1.getMinutes()) * 60) + (0 - timearr1.getSeconds())) * 1000;
    localStorage.setItem('chronostamp1', chronostamp1);
    //		setchasCRM.value = "";
    //		setminutaCRM.value = "";
    alert("Напоминание установлено на " + setchasCRM1.value + ":" + setminutaCRM1.value + ":" + "00");
    CRMabortTimeOut1 = setTimeout(setRemindCRM1, localStorage.getItem('chronostamp1'));
}

function CRMrefreshTimerReminder() { // обновляет оставшееся время будильника №1
    if (localStorage.getItem('chronostamp') !== null && localStorage.getItem('chronostamp') > 0) {
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
        setchasCRM.value = localStorage.getItem('setchasCRM');
        setminutaCRM.value = localStorage.getItem('setminutaCRM');
        var timearr = new Date()
        var chronostamp2 = (((localStorage.getItem('setchasCRM') - timearr.getHours()) * 60 * 60) + ((localStorage.getItem('setminutaCRM') - timearr.getMinutes()) * 60) + (0 - timearr.getSeconds())) * 1000;
        localStorage.setItem('chronostamp2', chronostamp2);
        CRMabortTimeOut = setTimeout(setRemindCRM, localStorage.getItem('chronostamp2'));
    } else if (localStorage.getItem('chronostamp') == null && localStorage.getItem('chronostamp') == null) {
        clearTimeout(CRMabortTimeOut);
        document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
    } else if (localStorage.getItem('chronostamp1') !== null) {
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    }
}

function CRMrefreshTimerReminder1() { // обновляет оставшееся время будильника №2
    if (localStorage.getItem('chronostamp1') !== null && localStorage.getItem('chronostamp1') > 0) {
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
        setchasCRM1.value = localStorage.getItem('setchasCRM1');
        setminutaCRM1.value = localStorage.getItem('setminutaCRM1');
        var timearr1 = new Date()
        var chronostamp22 = (((localStorage.getItem('setchasCRM1') - timearr1.getHours()) * 60 * 60) + ((localStorage.getItem('setminutaCRM1') - timearr1.getMinutes()) * 60) + (0 - timearr1.getSeconds())) * 1000;
        localStorage.setItem('chronostamp22', chronostamp22);
        CRMabortTimeOut1 = setTimeout(setRemindCRM1, localStorage.getItem('chronostamp22'));
    } else if (localStorage.getItem('chronostamp') == null && localStorage.getItem('chronostamp') == null) {
        clearTimeout(CRMabortTimeOut1);
        document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
    } else if (localStorage.getItem('chronostamp') !== null) {
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    }
}

document.getElementById('clock_reminCRM').ondblclick = function () {		// Удаление будильника
    if (localStorage.getItem('chronostamp') !== null && localStorage.getItem('chronostamp') > 0) {
        clearTimeout(CRMabortTimeOut)
        localStorage.removeItem('chronostamp')
        localStorage.removeItem('chronostamp2')
        localStorage.removeItem('remindertextCRM')
        setchasCRM.value = ""
        setminutaCRM.value = ""
        remindertextCRM.value = ""
        alert("Напоминание удалено")
        document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
    }
}

document.getElementById('clock_reminCRM1').ondblclick = function () {		// Удаление будильника
    if (localStorage.getItem('chronostamp1') !== null && localStorage.getItem('chronostamp1') > 0) {
        clearTimeout(CRMabortTimeOut1)
        localStorage.removeItem('chronostamp1')
        localStorage.removeItem('chronostamp22')
        localStorage.removeItem('remindertextCRM1')
        setchasCRM1.value = ""
        setminutaCRM1.value = ""
        remindertextCRM1.value = ""
        alert("Напоминание удалено")
        // document.getElementById('btnAlarmclock').textContent = "🔕 Будильник";  //тут еще подумать логику если первый будильник тоже не выставлен и удален второй тогда да изменять иконку
    }
}

CRMrefreshTimerReminder(); //обновляет оставшееся время до будильника №1
CRMrefreshTimerReminder1(); //обновляет оставшееся время до будильника №2

function setRemindCRM() { //функция  при наступлении времени перевода в статус занят Будильник №1
    alert(localStorage.getItem('remindertextCRM'));
    localStorage.removeItem('chronostamp');
    localStorage.removeItem('remindertextCRM');

    if (localStorage.getItem('chronostamp') === null && localStorage.getItem('chronostamp1') === null)
        document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
    else if (localStorage.getItem('chronostamp') !== null && localStorage.getItem('chronostamp1') !== null)
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    else if (localStorage.getItem('chronostamp') === null && localStorage.getItem('chronostamp1') !== null)
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    else if (localStorage.getItem('chronostamp') !== null && localStorage.getItem('chronostamp1') === null)
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";

    setchasCRM.value = "";
    setminutaCRM.value = "";
    remindertextCRM.value = "";
}

function setRemindCRM1() { //функция  при наступлении времени перевода в статус занят Будильник №2
    alert(localStorage.getItem('remindertextCRM1'));
    localStorage.removeItem('chronostamp1');
    localStorage.removeItem('remindertextCRM1');

    if (localStorage.getItem('chronostamp') === null && localStorage.getItem('chronostamp1') === null)
        document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
    else if (localStorage.getItem('chronostamp') !== null && localStorage.getItem('chronostamp1') !== null)
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    else if (localStorage.getItem('chronostamp') === null && localStorage.getItem('chronostamp1') !== null)
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    else if (localStorage.getItem('chronostamp') !== null && localStorage.getItem('chronostamp1') === null)
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";

    setchasCRM1.value = "";
    setminutaCRM1.value = "";
    remindertextCRM1.value = ""
}