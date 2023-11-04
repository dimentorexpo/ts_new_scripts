var win_Alarmclock =  // описание элементов окна будильника
    `<div style="border: 2px double black; background-color: #464451; cursor: -webkit-grab;" id="reminder_bar">
				<div>
					<button title="Скрытие меню" id="hideMeAlarm" class="buttonHide">hide</button>
				</div>
				<div style="margin: 5px; width: 350px">
					<label style="color:bisque">__Будильник №1</label> <label style="color:bisque">........................... Будильник №2__</label>
				<br>
					<input title="Ввод часа от 0 до 23 для будильника" "="" id="setchas" placeholder="HH" autocomplete="off" type="number" maxlength="2" min="0" max="23" style="text-align: center; margin-top: 5px; width: 50px; color: black;"> <span style="color: white; margin-top: 5px;">:</span>
					<input title="Ввод минут от 0 до 59 для будильника" id="setminuta" placeholder="MM" autocomplete="off"  type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px;  width: 50px; color: black;">
					<button title="Запуск будильника при устаноовленном времени" id="setreminder" style="margin-top: 5px">SET🔔</button>
					<input title="Ввод часа от 0 до 23 для будильника" "="" id="setchas1" placeholder="HH" autocomplete="off"  type="number" maxlength="2" min="0" max="23" style="text-align: center; margin-top: 5px; width: 50px; color: black;"> <span style="color: white; margin-top: 5px;">:</span>
					<input title="Ввод минут от 0 до 59 для будильника" id="setminuta1" placeholder="MM" autocomplete="off"  type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px;  width: 50px; color: black;">
					<button title="Запуск будильника при устаноовленном времени" id="setreminder1" style="margin-top: 5px">SET🔔</button>
				<br>
					<button title="Отображение текущего времени" id="clock_js" style="color: white; margin-top: 5px"></button>
					<button id="clock_remin" title="Двойной клик = удаление таймера. Кнопка отображения оставшегося времени" style="color: lightgreen; margin-top: 5px">00 : 00 : 00</button>
					<button id="clock_remin1" title="Двойной клик = удаление таймера. Кнопка отображения оставшегося времени" style="color: MediumSpringGreen; margin-left:28px; margin-top: 5px">00 : 00 : 00</button>
				</div>
			</div>`;
			
			
// function maxLengthCheck(object) { // функция ограничения кол-ва символов в полях
    // if (object.value.length > object.maxLength)
        // object.value = object.value.slice(0, object.maxLength)
// }
			

if (localStorage.getItem('winTopAlarmclock') == null) { // началоное положение окна будильника (если не задано ранее)
    localStorage.setItem('winTopAlarmclock', '120');
    localStorage.setItem('winLeftAlarmclock', '295');
}

let wintAlarmclock = document.createElement('div'); // создание окна будильника
document.body.append(wintAlarmclock);
wintAlarmclock.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopAlarmclock') + 'px; left: ' + localStorage.getItem('winLeftAlarmclock') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintAlarmclock.style.display = 'none';
wintAlarmclock.setAttribute('id', 'AF_AlarmClock');
wintAlarmclock.innerHTML = win_Alarmclock;

wintAlarmclock.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintAlarmclock.offsetLeft;
    let elemTop = wintAlarmclock.offsetTop;

    function onMouseMove(event) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintAlarmclock.style.left = (elemLeft + deltaX) + "px";
      wintAlarmclock.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopAlarmclock', String(elemTop + deltaY));
      localStorage.setItem('winLeftAlarmclock', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};
 // прекращение изменения позиции окна будильника

function clock_on_javascript_1() {  //таймер обычного отсчета текущего времени
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
    document.getElementById("clock_js").textContent = time;
}

function clock_on_javascript_2() { //таймер отсчета до срабатывания будильника #1
    var data = new Date();
    var currentHours = data.getHours();
    var currentMinutes = data.getMinutes();
    var currentSeconds = data.getSeconds();

    if (localStorage.getItem('setchas')){
    var setHours = JSON.parse(localStorage.getItem('setchas'));
    var setMinutes = JSON.parse(localStorage.getItem('setminuta'));
    }

    if (localStorage.getItem('chronostamp') === null) {
        time = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_remin").innerHTML = time;
        return;
    }

    var remainingSeconds = (setHours - currentHours) * 3600 + (setMinutes - currentMinutes) * 60 - currentSeconds;
    if (remainingSeconds <= 0) {
        time = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_remin").innerHTML = time;
        return;
    }

    var remainingMinutes = Math.floor(remainingSeconds / 60);
    remainingSeconds = remainingSeconds % 60;
    var remainingHours = Math.floor(remainingMinutes / 60);
    remainingMinutes = remainingMinutes % 60;

    time = (remainingHours < 10 ? "0" + remainingHours : remainingHours) + " : " + (remainingMinutes < 10 ? "0" + remainingMinutes : remainingMinutes) + " : " + (remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds);
    document.getElementById("clock_remin").innerHTML = time;
}

function clock_on_javascript_3() { //таймер отсчета до срабатывания будильника #2
    var data1 = new Date();
    var currentHours1 = data1.getHours();
    var currentMinutes1 = data1.getMinutes();
    var currentSeconds1 = data1.getSeconds();

    if (localStorage.getItem('setchas1')){
    var setHours1 = JSON.parse(localStorage.getItem('setchas1'));
    var setMinutes1 = JSON.parse(localStorage.getItem('setminuta1'));
    }

    if (localStorage.getItem('chronostamp1') === null) {
        time1 = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_remin1").innerHTML = time1;
        return;
    }

    var remainingSeconds1 = (setHours1 - currentHours1) * 3600 + (setMinutes1 - currentMinutes1) * 60 - currentSeconds1;
    if (remainingSeconds1 <= 0) {
        time1 = "00" + " : " + "00" + " : " + "00";
        document.getElementById("clock_remin1").innerHTML = time1;
        return;
    }

    var remainingMinutes1 = Math.floor(remainingSeconds1 / 60);
    remainingSeconds1 = remainingSeconds1 % 60;
    var remainingHours1 = Math.floor(remainingMinutes1 / 60);
    remainingMinutes1 = remainingMinutes1 % 60;

    time1 = (remainingHours1 < 10 ? "0" + remainingHours1 : remainingHours1) + " : " + (remainingMinutes1 < 10 ? "0" + remainingMinutes1 : remainingMinutes1) + " : " + (remainingSeconds1 < 10 ? "0" + remainingSeconds1 : remainingSeconds1);
    document.getElementById("clock_remin1").innerHTML = time1;
}

function refreshTimerReminder() {
    if (localStorage.getItem('chronostamp') !== null && localStorage.getItem('chronostamp') > 0) {
        document.getElementById('reminderstatus').textContent = "🔔";
        setchas.value = localStorage.getItem('setchas');
        setminuta.value = localStorage.getItem('setminuta');
        var timearr = new Date();
        var chronostamp2 = (((localStorage.getItem('setchas') - timearr.getHours()) * 60 * 60) + ((localStorage.getItem('setminuta') - timearr.getMinutes()) * 60) + (0 - timearr.getSeconds())) * 1000;
        localStorage.setItem('chronostamp2', chronostamp2);
        abortTimeOut = setTimeout(function () {
            setRemindAf('chronostamp')
        }, localStorage.getItem('chronostamp2'));
        if (localStorage.getItem('chronostamp1') !== null && localStorage.getItem('chronostamp1') > 0) {
            setchas1.value = localStorage.getItem('setchas1');
            setminuta1.value = localStorage.getItem('setminuta1');
            var timearr1 = new Date();
            var chronostamp22 = (((localStorage.getItem('setchas1') - timearr1.getHours()) * 60 * 60) + ((localStorage.getItem('setminuta1') - timearr1.getMinutes()) * 60) + (0 - timearr1.getSeconds())) * 1000;
            localStorage.setItem('chronostamp22', chronostamp22);
            abortTimeOut1 = setTimeout(function () {
            setRemindAf('chronostamp1')
            }, localStorage.getItem('chronostamp22'));
        }
    } else if (localStorage.getItem('chronostamp1') !== null && localStorage.getItem('chronostamp1') > 0) {
        document.getElementById('reminderstatus').textContent = "🔔";
        setchas1.value = localStorage.getItem('setchas1');
        setminuta1.value = localStorage.getItem('setminuta1');
        var timearr1 = new Date();
        var chronostamp22 = (((localStorage.getItem('setchas1') - timearr1.getHours()) * 60 * 60) + ((localStorage.getItem('setminuta1') - timearr1.getMinutes()) * 60) + (0 - timearr1.getSeconds())) * 1000;
        localStorage.setItem('chronostamp22', chronostamp22);
		abortTimeOut1 = setTimeout(function () {
		setRemindAf('chronostamp1')
		}, localStorage.getItem('chronostamp22'));
		} else {
		clearTimeout(abortTimeOut);
		clearTimeout(abortTimeOut1);
		document.getElementById('reminderstatus').textContent = "🔕";
		}
}

function setRemindAf(tsname) { //функция  при наступлении времени перевода в статус занят Будильник №1
    const data = {
        command: "DO_SET_OPERATOR_STATUS",
        status: "Busy",
        source: "Operator"
    };

    fetch("https://skyeng.autofaq.ai/api/reason8/operator/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
        mode: "cors",
        credentials: "include"
    });

    alert("Время ставить занят! :D");
    localStorage.removeItem(tsname);

    const reminderstatus = document.getElementById('reminderstatus');
    if (!localStorage.getItem('chronostamp') && !localStorage.getItem('chronostamp1')) {
        reminderstatus.textContent = "🔕";
    } else {
        reminderstatus.textContent = "🔔";
    }

    if (tsname === 'chronostamp') {
        setchas.value = "";
        setminuta.value = "";
        localStorage.removeItem('setchas');
        localStorage.removeItem('setminuta');
    } else if (tsname === 'chronostamp1') {
        setchas1.value = "";
        setminuta1.value = "";
        localStorage.removeItem('setchas1');
        localStorage.removeItem('setminuta1');
    }
}

// блок работы с будильником
document.getElementById('reminderstatus').onclick = function () { // открывает настройки будильника
    if (document.getElementById('AF_AlarmClock').style.display == '')
        document.getElementById('AF_AlarmClock').style.display = 'none'
    else {
        document.getElementById('AF_AlarmClock').style.display = ''
        document.getElementById('AF_Settings').style.display = 'none'
        document.getElementById('addTmp').style.display = 'none'
    }
}

if (localStorage.getItem('chronostamp') == null && localStorage.getItem('chronostamp1') == null) { // если будильники не заданы статус отмечать такой
    document.getElementById('reminderstatus').textContent = "🔕";
}

document.getElementById('setreminder').onclick = function () {
    document.getElementById('reminderstatus').textContent = "🔔";
    localStorage.setItem('setchas', setchas.value);

    var cleanMinuta = parseInt(setminuta.value, 10).toString();
    localStorage.setItem('setminuta', cleanMinuta);

    var timearr = new Date();
    var chronostamp = (((localStorage.getItem('setchas') - timearr.getHours()) * 60 * 60) + ((localStorage.getItem('setminuta') - timearr.getMinutes()) * 60) + (0 - timearr.getSeconds())) * 1000;

    localStorage.setItem('chronostamp', chronostamp);

    alert("Будильник установлен на " + setchas.value + ":" + cleanMinuta + ":" + "00");

    abortTimeOut = setTimeout(function () {
        setRemindAf('chronostamp');
    }, localStorage.getItem('chronostamp'));
}


document.getElementById('setreminder1').onclick = function () {  // выставляем будильник 2
    document.getElementById('reminderstatus').textContent = "🔔";
    localStorage.setItem('setchas1', setchas1.value);

    var cleanMinuta1 = parseInt(setminuta1.value, 10).toString();
    localStorage.setItem('setminuta1', cleanMinuta1);

    var timearr1 = new Date()
    var chronostamp1 = (((localStorage.getItem('setchas1') - timearr1.getHours()) * 60 * 60) + ((localStorage.getItem('setminuta1') - timearr1.getMinutes()) * 60) + (0 - timearr1.getSeconds())) * 1000;
    
    localStorage.setItem('chronostamp1', chronostamp1);

    alert("Будильник установлен на " + setchas1.value + ":" + setminuta1.value + ":" + "00");

    abortTimeOut1 = setTimeout(function () {
        setRemindAf('chronostamp1')
    }, localStorage.getItem('chronostamp1'));
}

document.getElementById('clock_remin').ondblclick = function () {
    removeAlarm('clock_remin', abortTimeOut, 'chronostamp', 'chronostamp2', 'setchas', 'setminuta');
}

document.getElementById('clock_remin1').ondblclick = function () {
    removeAlarm('clock_remin1', abortTimeOut1, 'chronostamp1', 'chronostamp22', 'setchas1', 'setminuta1');
}

function removeAlarm(clockElem, timeoutVar, chronostampKey, chronostamp2Key, chasKey, minutaKey) {
    if (localStorage.getItem(chronostampKey) !== null && localStorage.getItem(chronostampKey) > 0) {
        clearTimeout(timeoutVar);
        localStorage.removeItem(chronostampKey);
        localStorage.removeItem(chronostamp2Key);
        document.getElementById(chasKey).value = "";
        document.getElementById(minutaKey).value = "";
        localStorage.removeItem(chasKey);
        localStorage.removeItem(minutaKey);
        alert("Будильник удален");
        checkAlarmsStatus();
    }
}

function checkAlarmsStatus() {
    var chronostamp = localStorage.getItem('chronostamp');
    var chronostamp1 = localStorage.getItem('chronostamp1');

    if ((!chronostamp || chronostamp <= 0) && (!chronostamp1 || chronostamp1 <= 0)) {
        document.getElementById('reminderstatus').textContent = "🔕";
    }
}


document.getElementById('hideMeAlarm').onclick = function() {
	document.getElementById('AF_AlarmClock').style.display = 'none'
}

refreshTimerReminder(); //обновляет оставшееся время до будильника №1

setInterval(clock_on_javascript_1, 1000);
setInterval(clock_on_javascript_2, 1000);
setInterval(clock_on_javascript_3, 1000);

// setInterval(operstatusleftbar, 3000);

// конец блока работы с будильником

// Добавьте обработчики событий для ограничения максимальной длины
setchas.addEventListener('input', function() {
  maxLengthCheck(this);
});

setminuta.addEventListener('input', function() {
  maxLengthCheck(this);
});

setchas1.addEventListener('input', function() {
  maxLengthCheck(this);
});

setminuta1.addEventListener('input', function() {
  maxLengthCheck(this);
});