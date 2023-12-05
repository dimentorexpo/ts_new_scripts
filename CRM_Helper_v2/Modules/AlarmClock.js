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

const wintAlarmclock = createWindowCRM('winAlarmclock', 'winTopAlarmclock', 'winLeftAlarmclock', win_Alarmclock);
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

function CRM_clock_on_javascript_1() { //таймер обычного отсчета текущего времени
    // Get the current date and time
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    // Add a leading zero to hours, minutes, and seconds if they are less than 10
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    // Concatenate the hours, minutes, and seconds into a single string
    const time = `${hours} : ${minutes} : ${seconds}`;

    // Set the text content of the clock_js element to the time string
    document.getElementById("clock_jsCRM").textContent = time;
}

function CRM_clock_on_javascript_2() { //таймер отсчета до срабатывания будильника #1
    var data = new Date();
    var currentHours = data.getHours();
    var currentMinutes = data.getMinutes();
    var currentSeconds = data.getSeconds();

    if (localStorage.getItem('setchasCRM')) {
        var setHours = JSON.parse(localStorage.getItem('setchasCRM'));
        var setMinutes = JSON.parse(localStorage.getItem('setminutaCRM'));
    }

    if (localStorage.getItem('chronostamp') === null) {
        time = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_reminCRM").innerHTML = time;
        return;
    }

    var remainingSeconds = (setHours - currentHours) * 3600 + (setMinutes - currentMinutes) * 60 - currentSeconds;
    if (remainingSeconds <= 0) {
        time = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_reminCRM").innerHTML = time;
        return;
    }

    var remainingMinutes = Math.floor(remainingSeconds / 60);
    remainingSeconds = remainingSeconds % 60;
    var remainingHours = Math.floor(remainingMinutes / 60);
    remainingMinutes = remainingMinutes % 60;

    time = (remainingHours < 10 ? "0" + remainingHours : remainingHours) + " : " + (remainingMinutes < 10 ? "0" + remainingMinutes : remainingMinutes) + " : " + (remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds);
    document.getElementById("clock_reminCRM").innerHTML = time;
}

function CRM_clock_on_javascript_3() { //таймер отсчета до срабатывания будильника #2
    var data1 = new Date();
    var currentHours1 = data1.getHours();
    var currentMinutes1 = data1.getMinutes();
    var currentSeconds1 = data1.getSeconds();

    if (localStorage.getItem('setchasCRM1')) {
        var setHours1 = JSON.parse(localStorage.getItem('setchasCRM1'));
        var setMinutes1 = JSON.parse(localStorage.getItem('setminutaCRM1'));
    }

    if (localStorage.getItem('chronostamp1') === null) {
        time1 = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_reminCRM1").innerHTML = time1;
        return;
    }

    var remainingSeconds1 = (setHours1 - currentHours1) * 3600 + (setMinutes1 - currentMinutes1) * 60 - currentSeconds1;
    if (remainingSeconds1 <= 0) {
        time1 = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_reminCRM1").innerHTML = time1;
        return;
    }

    var remainingMinutes1 = Math.floor(remainingSeconds1 / 60);
    remainingSeconds1 = remainingSeconds1 % 60;
    var remainingHours1 = Math.floor(remainingMinutes1 / 60);
    remainingMinutes1 = remainingMinutes1 % 60;

    time1 = (remainingHours1 < 10 ? "0" + remainingHours1 : remainingHours1) + " : " + (remainingMinutes1 < 10 ? "0" + remainingMinutes1 : remainingMinutes1) + " : " + (remainingSeconds1 < 10 ? "0" + remainingSeconds1 : remainingSeconds1);
    document.getElementById("clock_reminCRM1").innerHTML = time1;
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
    var cleanMinuta = parseInt(setminutaCRM.value, 10).toString();
    localStorage.setItem('setminutaCRM', cleanMinuta);
    var timearr = new Date()
    var chronostamp = (((localStorage.getItem('setchasCRM') - timearr.getHours()) * 60 * 60) + ((localStorage.getItem('setminutaCRM') - timearr.getMinutes()) * 60) + (0 - timearr.getSeconds())) * 1000;
    localStorage.setItem('chronostamp', chronostamp);
    alert("Напоминание установлено на " + setchasCRM.value + ":" + setminutaCRM.value + ":" + "00");
    CRMabortTimeOut = setTimeout(function () {
        setRemindCRM('chronostamp');
    }, localStorage.getItem('chronostamp'));
}

document.getElementById('setreminderCRM1').onclick = function () {  // выставляем будильник
    document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    localStorage.setItem('remindertextCRM1', remindertextCRM1.value);
    localStorage.setItem('setchasCRM1', setchasCRM1.value);
    var cleanMinuta1 = parseInt(setminuta1.value, 10).toString();
    localStorage.setItem('setminuta1', cleanMinuta1);
    var timearr1 = new Date()
    var chronostamp1 = (((localStorage.getItem('setchasCRM1') - timearr1.getHours()) * 60 * 60) + ((localStorage.getItem('setminutaCRM1') - timearr1.getMinutes()) * 60) + (0 - timearr1.getSeconds())) * 1000;
    localStorage.setItem('chronostamp1', chronostamp1);
    //		setchasCRM.value = "";
    //		setminutaCRM.value = "";
    alert("Напоминание установлено на " + setchasCRM1.value + ":" + setminutaCRM1.value + ":" + "00");
    CRMabortTimeOut1 = setTimeout(function () {
        setRemindCRM('chronostamp1');
    }, localStorage.getItem('chronostamp1'));
}

function CRMrefreshTimerReminder() {
    if (localStorage.getItem('chronostamp') !== null && localStorage.getItem('chronostamp') > 0) {
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
        setchasCRM.value = localStorage.getItem('setchasCRM');
        setminutaCRM.value = localStorage.getItem('setminutaCRM');
        var timearr = new Date();
        var chronostamp2 = (((localStorage.getItem('setchasCRM') - timearr.getHours()) * 60 * 60) + ((localStorage.getItem('setminutaCRM') - timearr.getMinutes()) * 60) + (0 - timearr.getSeconds())) * 1000;
        localStorage.setItem('chronostamp2', chronostamp2);
        CRMabortTimeOut = setTimeout(function () {
            setRemindAf('chronostamp')
        }, localStorage.getItem('chronostamp2'));
        if (localStorage.getItem('chronostamp1') !== null && localStorage.getItem('chronostamp1') > 0) {
            setchasCRM1.value = localStorage.getItem('setchasCRM1');
            setminutaCRM1.value = localStorage.getItem('setminutaCRM1');
            var timearr1 = new Date();
            var chronostamp22 = (((localStorage.getItem('setchasCRM1') - timearr1.getHours()) * 60 * 60) + ((localStorage.getItem('setminutaCRM1') - timearr1.getMinutes()) * 60) + (0 - timearr1.getSeconds())) * 1000;
            localStorage.setItem('chronostamp22', chronostamp22);
            CRMabortTimeOut1 = setTimeout(function () {
                setRemindAf('chronostamp1')
            }, localStorage.getItem('chronostamp22'));
        }
    } else if (localStorage.getItem('chronostamp1') !== null && localStorage.getItem('chronostamp1') > 0) {
        document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
        setchasCRM1.value = localStorage.getItem('setchasCRM1');
        setminutaCRM1.value = localStorage.getItem('setminuta1');
        var timearr1 = new Date();
        var chronostamp22 = (((localStorage.getItem('setchasCRM1') - timearr1.getHours()) * 60 * 60) + ((localStorage.getItem('setminuta1') - timearr1.getMinutes()) * 60) + (0 - timearr1.getSeconds())) * 1000;
        localStorage.setItem('chronostamp22', chronostamp22);
        CRMabortTimeOut1 = setTimeout(function () {
            setRemindAf('chronostamp1')
        }, localStorage.getItem('chronostamp22'));
    } else {
        clearTimeout(CRMabortTimeOut);
        clearTimeout(CRMabortTimeOut1);
        document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
    }
}

document.getElementById('clock_reminCRM').ondblclick = function () {		// Удаление будильника
    removeAlarm('clock_reminCRM', CRMabortTimeOut, 'chronostamp', 'chronostamp2', 'remindertextCRM', 'setchasCRM', 'setminutaCRM');
}

document.getElementById('clock_reminCRM1').ondblclick = function () {		// Удаление будильника
    removeAlarm('clock_reminCRM1', CRMabortTimeOut1, 'chronostamp1', 'chronostamp22', 'remindertextCRM1', 'setchasCRM1', 'setminutaCRM1');
}

function setRemindCRM(tsname) {
    // Объект для хранения ключей и элементов управления для каждого напоминания
    const reminders = {
        'chronostamp': {
            textKey: 'remindertextCRM',
            hourInput: 'setchasCRM',
            minuteInput: 'setminutaCRM'
        },
        'chronostamp1': {
            textKey: 'remindertextCRM1',
            hourInput: 'setchasCRM1',
            minuteInput: 'setminutaCRM1'
        }
    };

    // Получаем данные для активного напоминания
    const activeReminder = reminders[tsname];

    // Показываем уведомление и удаляем данные из localStorage
    if (activeReminder) {
        alert(localStorage.getItem(activeReminder.textKey));
        localStorage.removeItem(activeReminder.textKey);
        localStorage.removeItem(tsname);

        // Очищаем поля ввода
        document.getElementById(activeReminder.hourInput).value = "";
        document.getElementById(activeReminder.minuteInput).value = "";
        localStorage.removeItem(activeReminder.hourInput);
        localStorage.removeItem(activeReminder.minuteInput);
    }

    // Обновляем текст кнопки напоминания
    const reminderstatus = document.getElementById('btnAlarmclock');
    reminderstatus.textContent = (!localStorage.getItem('chronostamp') && !localStorage.getItem('chronostamp1')) ? "🔕Reminder" : "🔔Reminder";
}


function removeAlarm(clockElem, timeoutVar, chronostampKey, chronostamp2Key, Mestextkey, chasKey, minutaKey) {
    if (localStorage.getItem(chronostampKey) !== null && localStorage.getItem(chronostampKey) > 0) {
        clearTimeout(timeoutVar);
        localStorage.removeItem(chronostampKey);
        localStorage.removeItem(chronostamp2Key);
        document.getElementById(chasKey).value = "";
        document.getElementById(minutaKey).value = "";
        document.getElementById(Mestextkey).value = "";
        localStorage.removeItem(chasKey);
        localStorage.removeItem(minutaKey);
        localStorage.removeItem(Mestextkey)
        alert("Напоминание удалено");
        checkAlarmsStatus();
    }
}

function checkAlarmsStatus() {
    var chronostamp = localStorage.getItem('chronostamp');
    var chronostamp1 = localStorage.getItem('chronostamp1');

    if ((!chronostamp || chronostamp <= 0) && (!chronostamp1 || chronostamp1 <= 0)) {
        document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
    }
}

setInterval(CRM_clock_on_javascript_1, 1000);
setInterval(CRM_clock_on_javascript_2, 1000);
setInterval(CRM_clock_on_javascript_3, 1000);

CRMrefreshTimerReminder(); //обновляет оставшееся время до будильника

