let abortTimeOut, abortTimeOut1; // Declare these variables once at the top

const alarmWindow = `
    <div style="border: 2px double black; background-color: #464451; cursor: -webkit-grab; width: 350px;" id="reminder_bar">
        <div>
            <button title="Скрытие меню" id="hideMeAlarm" class="mainButton buttonHide" style="margin: 5px; float: left;">hide</button>
            <button class="mainButton" title="Отображение текущего времени" id="clock_js" style="margin: 5px; float: right;"></button>
        </div>
        <div style="display: flex; margin: 5px; width: 100%; max-width: 700px;">
            ${createAlarmSection('Будильник №1', 'setchas', 'setminuta', 'setreminder', 'clock_remin', 'lightgreen')}
            ${createAlarmSection('Будильник №2', 'setchas1', 'setminuta1', 'setreminder1', 'clock_remin1', 'MediumSpringGreen')}
        </div>
    </div>`;

const alarmClockWindow = createWindow('AF_AlarmClock', 'winTopAlarmclock', 'winLeftAlarmclock', alarmWindow);
hideWindowOnDoubleClick('AF_AlarmClock');
hideWindowOnClick('AF_AlarmClock', 'hideMeAlarm');

document.getElementById('AF_AlarmClock').addEventListener('input', function (event) {
    if (event.target.type === 'number') {
        maxLengthCheck(event.target);
        checkMinMaxValue(event.target);
    }
});

function createAlarmSection(label, hourId, minuteId, setButtonId, displayId, color) {
    return `
        <div style="width: 49%; display: inline-block;">
            <div style="text-align: center;">
                <label style="color: bisque;">${label}</label>
            </div>
            <input class="${exttheme}" title="Ввод часа от 0 до 23 для будильника" id="${hourId}" placeholder="HH" autocomplete="off" type="number" maxlength="2" min="0" max="23" style="text-align: left; margin-top: 5px; width: 50px;">
            <span style="color: white; margin-top: 5px;">:</span>
            <input class="${exttheme}" title="Ввод минут от 0 до 59 для будильника" id="${minuteId}" placeholder="MM" autocomplete="off" type="number" maxlength="2" min="0" max="59" style="text-align: left; margin-top: 5px; width: 50px;">
            <button class="mainButton" title="Запуск будильника при установленном времени" id="${setButtonId}" style="margin-top: 5px;">SET🔔</button>
            <div style="text-align: center;">
                <button class="mainButton" id="${displayId}" title="Двойной клик = удаление таймера. Кнопка отображения оставшегося времени" style="color: ${color}!important; margin-top: 5px;">00 : 00 : 00</button>
            </div>
        </div>`;
}

function updateClockDisplay(id, time) {
    const displayElement = document.getElementById(id);
    if (displayElement) {
        displayElement.textContent = time;
    }
}

function formatTime(value) {
    return value < 10 ? "0" + value : value;
}

function updateCurrentTime() {
    const now = new Date();
    const time = `${formatTime(now.getHours())} : ${formatTime(now.getMinutes())} : ${formatTime(now.getSeconds())}`;
    updateClockDisplay('clock_js', time);
}

function updateRemainingTime(displayId, alarmTime) {
    const displayElement = document.getElementById(displayId);
    if (!displayElement) return;

    if (alarmTime === null || isNaN(alarmTime)) {
        updateClockDisplay(displayId, "00 : 00 : 00");
        return;
    }

    const now = new Date();
    const remainingSeconds = Math.max(0, (alarmTime - now.getTime()) / 1000);

    const remainingHours = Math.floor(remainingSeconds / 3600);
    const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
    const remainingSecs = Math.floor(remainingSeconds % 60);

    const time = `${formatTime(remainingHours)} : ${formatTime(remainingMinutes)} : ${formatTime(remainingSecs)}`;
    updateClockDisplay(displayId, time);
}

function setAlarm(hourId, minuteId, displayId, storageKey, timeoutVar) {
    const hoursInput = document.getElementById(hourId);
    const minutesInput = document.getElementById(minuteId);

    const hours = parseInt(hoursInput.value, 10);
    const minutes = parseInt(minutesInput.value, 10);

    // Check if the input is empty or zero
    if (isNaN(hours) || isNaN(minutes)) {
        showCustomAlert("Пожалуйста, введите корректное время (не пустое).");
        return;
    }

    const now = new Date();
    const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);

    if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1);
    }

    localStorage.setItem(storageKey, alarmTime.getTime());
    localStorage.setItem(hourId, hours);
    localStorage.setItem(minuteId, minutes);
    showCustomAlert(`Будильник установлен на ${formatTime(hours)}:${formatTime(minutes)}:00`);

    const timeLeft = alarmTime.getTime() - now.getTime();
    clearTimeout(timeoutVar);
    timeoutVar = setTimeout(() => setRemindAf(storageKey), timeLeft);
    refreshTimerReminder();
    updateRemainingTime(displayId, alarmTime.getTime()); // Update display immediately
}

function refreshTimerReminder() {
    const alarm1 = localStorage.getItem('chronostamp');
    const alarm2 = localStorage.getItem('chronostamp1');

    if (alarm1 || alarm2) {
        document.getElementById('reminderstatus').textContent = "🔔";
    } else {
        document.getElementById('reminderstatus').textContent = "🔕";
    }
}

function setRemindAf(storageKey) {
    fetch("https://skyeng.autofaq.ai/api/reason8/operator/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            command: "DO_SET_OPERATOR_STATUS",
            status: "Busy",
            source: "Operator"
        }),
        mode: "cors",
        credentials: "include"
    });

    showCustomAlert("Время ставить занят! :D", 1);
    localStorage.removeItem(storageKey);

    const reminderstatus = document.getElementById('reminderstatus');
    if (!localStorage.getItem('chronostamp') && !localStorage.getItem('chronostamp1')) {
        reminderstatus.textContent = "🔕";
    } else {
        reminderstatus.textContent = "🔔";
    }

    if (storageKey === 'chronostamp') {
        document.getElementById('setchas').value = "";
        document.getElementById('setminuta').value = "";
        localStorage.removeItem('setchas');
        localStorage.removeItem('setminuta');
    } else if (storageKey === 'chronostamp1') {
        document.getElementById('setchas1').value = "";
        document.getElementById('setminuta1').value = "";
        localStorage.removeItem('setchas1');
        localStorage.removeItem('setminuta1');
    }
}

document.getElementById('reminderstatus').onclick = function () {
    const alarmClock = document.getElementById('AF_AlarmClock');
    alarmClock.style.display = alarmClock.style.display === 'none' ? '' : 'none';
    populateAlarmFields(); // Ensure fields are populated when the window is opened
};

document.getElementById('setreminder').onclick = () => setAlarm('setchas', 'setminuta', 'clock_remin', 'chronostamp', abortTimeOut);
document.getElementById('setreminder1').onclick = () => setAlarm('setchas1', 'setminuta1', 'clock_remin1', 'chronostamp1', abortTimeOut1);

document.getElementById('clock_remin').ondblclick = () => removeAlarm('clock_remin', abortTimeOut, 'chronostamp', 'setchas', 'setminuta');
document.getElementById('clock_remin1').ondblclick = () => removeAlarm('clock_remin1', abortTimeOut1, 'chronostamp1', 'setchas1', 'setminuta1');

function removeAlarm(displayId, timeoutVar, storageKey, hourId, minuteId) {
    clearTimeout(timeoutVar);
    localStorage.removeItem(storageKey);
    document.getElementById(hourId).value = "";
    document.getElementById(minuteId).value = "";
    localStorage.removeItem(hourId);
    localStorage.removeItem(minuteId);
    showCustomAlert("Будильник удален");
    refreshTimerReminder();
    updateRemainingTime(displayId, null); // Update display to 00:00:00
}

function populateAlarmFields() {
    const setChas = document.getElementById('setchas');
    const setMinuta = document.getElementById('setminuta');
    const setChas1 = document.getElementById('setchas1');
    const setMinuta1 = document.getElementById('setminuta1');

    if (localStorage.getItem('setchas') !== null) {
        setChas.value = localStorage.getItem('setchas').padStart(2, '0');
    }

    if (localStorage.getItem('setminuta') !== null) {
        setMinuta.value = localStorage.getItem('setminuta').padStart(2, '0');
    }

    if (localStorage.getItem('setchas1') !== null) {
        setChas1.value = localStorage.getItem('setchas1').padStart(2, '0');
    }

    if (localStorage.getItem('setminuta1') !== null) {
        setMinuta1.value = localStorage.getItem('setminuta1').padStart(2, '0');
    }
}

window.addEventListener('load', populateAlarmFields);

setInterval(updateCurrentTime, 1000);
setInterval(() => updateRemainingTime('clock_remin', parseInt(localStorage.getItem('chronostamp'))), 1000);
setInterval(() => updateRemainingTime('clock_remin1', parseInt(localStorage.getItem('chronostamp1'))), 1000);

refreshTimerReminder();
