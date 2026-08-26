/**
 * AlarmClock.js — модуль «Reminder» (будильник с двумя напоминаниями).
 *
 * Возможности:
 *  - часы текущего времени;
 *  - два независимых напоминания на выбранное время (ЧЧ:ММ);
 *  - обратный отсчёт до срабатывания (двойной клик по кнопке отсчёта — удалить будильник);
 *  - восстановление таймеров после перезагрузки страницы.
 */

var win_Alarmclock = `<!-- описание элементов окна будильника -->
<div class="maindivst" id="AlarmclockCRM">
    <div style="margin: 5px; width: 291px;" id="Alarmclock_1str">
        <button class="buttonHide" title="скрывает меню" id="hideAlarmclock">hide</button>
        <button class="btnCRM" title="Отображение текущего времени" id="clock_jsCRM" style="color: white; float: right;"></button>
    </div>
    <div style="margin: 5px; width: 291px">
        <!-- Напоминание №1 -->
        <label class="spanCRM" style="display: block; margin-left: auto; margin-right: auto; text-align: center; color:bisque;">Напоминание №1</label>
        <input class="inputCRM" title="Ввод текста напоминания" id="remindertextCRM" placeholder="Текст напоминания" autocomplete="off" style="text-align: center; margin-top: 5px; width: 284px; color: black;">
        <input class="inputCRM" title="Ввод часа от 0 до 23 для напоминания" id="setchasCRM" placeholder="HH" autocomplete="off" type="number" maxlength="2" min="0" max="23" style="text-align: center; margin-top: 5px; width: 50px; color: black;"> <span class="spanCRM" style="color: white; margin-top: 5px;">:</span>
        <input class="inputCRM" title="Ввод минут от 0 до 59 для напоминания" id="setminutaCRM" placeholder="MM" autocomplete="off" type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px; width: 50px; color: black;">
        <button class="btnCRM" title="Запуск напоминания при установленном времени" id="setreminderCRM" style="margin-top: 5px">SET🔔</button>
        <button class="btnCRM" id="clock_reminCRM" title="Двойной клик = удаление таймера. Кнопка отображения оставшегося времени" style="color: lightgreen; margin-top: 5px; float: right;">00 : 00 : 00</button>
        <br>
        <!-- Напоминание №2 -->
        <label class="spanCRM" style="display: block; margin-left: auto; margin-right: auto; margin-top:5px; text-align: center; color:bisque;">Напоминание №2</label>
        <input class="inputCRM" title="Ввод текста напоминания" id="remindertextCRM1" placeholder="Текст напоминания" autocomplete="off" style="text-align: center; margin-top: 5px; width: 284px; color: black;">
        <input class="inputCRM" title="Ввод часа от 0 до 23 для напоминания" id="setchasCRM1" placeholder="HH" autocomplete="off" type="number" maxlength="2" min="0" max="23" style="text-align: center; margin-top: 5px; width: 50px; color: black;"> <span class="spanCRM" style="color: white; margin-top: 5px;">:</span>
        <input class="inputCRM" title="Ввод минут от 0 до 59 для напоминания" id="setminutaCRM1" placeholder="MM" autocomplete="off" type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px; width: 50px; color: black;">
        <button class="btnCRM" title="Запуск напоминания при установленном времени" id="setreminderCRM1" style="margin-top: 5px">SET🔔</button>
        <button class="btnCRM" id="clock_reminCRM1" title="Двойной клик = удаление таймера. Кнопка отображения оставшегося времени" style="color: lightgreen; margin-top: 5px; float: right;">00 : 00 : 00</button>
    </div>
</div>`;

const wintAlarmclock = createWindowCRM('winAlarmclock', 'winTopAlarmclock', 'winLeftAlarmclock', win_Alarmclock);
hideWindowOnDoubleClick('winAlarmclock');
hideWindowOnClick('winAlarmclock', 'hideAlarmclock');

// Ограничиваем ввод в числовых полях (maxLength + min/max).
document.getElementById('AlarmclockCRM').addEventListener('input', function (event) {
    if (event.target.matches('.inputCRM[type="number"]')) {
        maxLengthCheck(event.target);
        checkMinMaxValue(event.target);
    }
});

document.getElementById('btnAlarmclock').onclick = function () { // открытие/закрытие окна будильника
    if (document.getElementById('winAlarmclock').style.display == 'none') {
        document.getElementById('winAlarmclock').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'
    } else {
        document.getElementById('winAlarmclock').style.display = 'none'
        document.getElementById('idmymenucrm').style.display = 'none'
    }
}

/* ============================================================
 *  ЧАСЫ И ОТСЧЁТ ВРЕМЕНИ
 * ============================================================ */

/** Добавляет ведущий ноль: 9 -> "09". */
function pad2(num) {
    num = String(num);
    return num.length < 2 ? "0" + num : num;
}

/** Таймер обычного отсчёта текущего времени. */
function CRM_clock_on_javascript_1() {
    const date = new Date();
    document.getElementById("clock_jsCRM").textContent =
        `${pad2(date.getHours())} : ${pad2(date.getMinutes())} : ${pad2(date.getSeconds())}`;
}

/**
 * Отрисовка обратного отсчёта до срабатывания напоминания.
 * FIX: раньше было две почти идентичные функции (№1 и №2), причём в версии
 * для напоминания №2 были опечатки в ключах localStorage ('setminuta1').
 *
 * @param {string} idx - суффикс напоминания: '' для №1 или '1' для №2.
 */
function renderReminderCountdown(idx) {
    const hourKey = 'setchasCRM' + idx;
    const minuteKey = 'setminutaCRM' + idx;
    const stampKey = 'chronostamp' + idx;
    const targetEl = document.getElementById('clock_reminCRM' + idx);

    const ZERO_TIME = "00 : 00 : 00";

    // Будильник ещё не установлен — показываем нули.
    if (localStorage.getItem(stampKey) === null) {
        targetEl.innerHTML = ZERO_TIME;
        return;
    }

    // FIX: раньше при отсутствии сохранённых часов/минут падал ReferenceError.
    const storedHours = localStorage.getItem(hourKey);
    const storedMinutes = localStorage.getItem(minuteKey);
    if (storedHours === null || storedMinutes === null) {
        targetEl.innerHTML = ZERO_TIME;
        return;
    }

    const setHours = JSON.parse(storedHours);
    const setMinutes = JSON.parse(storedMinutes);

    const data = new Date();
    let remainingSeconds =
        (setHours - data.getHours()) * 3600 +
        (setMinutes - data.getMinutes()) * 60 -
        data.getSeconds();

    if (remainingSeconds <= 0) {
        targetEl.innerHTML = ZERO_TIME;
        return;
    }

    const remainingMinutes = Math.floor(remainingSeconds / 60);
    remainingSeconds %= 60;
    const remainingHours = Math.floor(remainingMinutes / 60);
    const displayMinutes = remainingMinutes % 60;

    targetEl.innerHTML =
        `${pad2(remainingHours)} : ${pad2(displayMinutes)} : ${pad2(remainingSeconds)}`;
}

/* ============================================================
 *  УСТАНОВКА БУДИЛЬНИКОВ
 * ============================================================ */

// Таймеры для возможности отмены будильника (clearTimeout).
var CRMabortTimeOut = '';   // напоминание №1
var CRMabortTimeOut1 = '';  // напоминание №2

if (localStorage.getItem('chronostamp') == null && localStorage.getItem('chronostamp1') == null) {
    document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
}

/**
 * Устанавливает напоминание по номеру.
 * @param {string} idx - '' для №1 или '1' для №2.
 */
function setupReminder(idx) {
    const hourInput = document.getElementById('setchasCRM' + idx);
    const minuteInput = document.getElementById('setminutaCRM' + idx);
    const textInput = document.getElementById('remindertextCRM' + idx);

    // FIX: раньше пустые поля сохранялись как "NaN" и ломали таймеры.
    if (hourInput.value === '' || minuteInput.value === '') {
        alert("Заполните время напоминания (часы и минуты)!");
        return;
    }

    document.getElementById('btnAlarmclock').textContent = "🔔Reminder";

    const cleanChas = parseInt(hourInput.value, 10).toString();
    const cleanMinuta = parseInt(minuteInput.value, 10).toString();

    localStorage.setItem('remindertextCRM' + idx, textInput.value);
    localStorage.setItem('setchasCRM' + idx, cleanChas);
    localStorage.setItem('setminutaCRM' + idx, cleanMinuta);

    // Считаем миллисекунды до момента срабатывания относительно текущего времени.
    const timearr = new Date();
    const chronostamp =
        (((localStorage.getItem('setchasCRM' + idx) - timearr.getHours()) * 60 * 60) +
         ((localStorage.getItem('setminutaCRM' + idx) - timearr.getMinutes()) * 60) +
         (0 - timearr.getSeconds())) * 1000;

    localStorage.setItem('chronostamp' + idx, chronostamp);
    alert("Напоминание установлено на " + hourInput.value + ":" + minuteInput.value + ":" + "00");

    const timeoutId = setTimeout(function () {
        setRemindCRM('chronostamp' + idx);
    }, localStorage.getItem('chronostamp' + idx));

    // Раскладываем по «историческим» переменным, которые ждут removeAlarm.
    if (idx === '') {
        CRMabortTimeOut = timeoutId;
    } else {
        CRMabortTimeOut1 = timeoutId;
    }
}

document.getElementById('setreminderCRM').onclick = function () {  // выставляем будильник №1
    setupReminder('');
};

document.getElementById('setreminderCRM1').onclick = function () { // выставляем будильник №2
    setupReminder('1');
};

/* ============================================================
 *  ВОССТАНОВЛЕНИЕ ТАЙМЕРОВ ПОСЛЕ ПЕРЕЗАГРУЗКИ СТРАНИЦЫ
 * ============================================================ */

// «Исторические» ключи временных меток (названия сохранены для совместимости
// с removeAlarm, который чистит именно их).
const REFRESH_TMP_KEYS = { '': 'chronostamp2', '1': 'chronostamp22' };

/**
 * Планирует срабатывание уже установленного напоминания заново.
 * @returns {boolean} true, если напоминание действительно было активно.
 */
function rescheduleStoredReminder(idx) {
    const stampKey = 'chronostamp' + idx;

    // Напоминание отсутствует или уже истекло.
    if (!(localStorage.getItem(stampKey) !== null && +localStorage.getItem(stampKey) > 0)) {
        return false;
    }

    document.getElementById('btnAlarmclock').textContent = "🔔Reminder";
    document.getElementById('setchasCRM' + idx).value = localStorage.getItem('setchasCRM' + idx);
    document.getElementById('setminutaCRM' + idx).value = localStorage.getItem('setminutaCRM' + idx);

    // Пересчитываем остаток времени от текущего момента.
    const timearr = new Date();
    const freshStamp =
        (((localStorage.getItem('setchasCRM' + idx) - timearr.getHours()) * 60 * 60) +
         ((localStorage.getItem('setminutaCRM' + idx) - timearr.getMinutes()) * 60) +
         (0 - timearr.getSeconds())) * 1000;

    localStorage.setItem(REFRESH_TMP_KEYS[idx], freshStamp);

    const timeoutId = setTimeout(function () {
        // FIX: в оригинале вызывалась несуществующая setRemindAf() — после
        // перезагрузки страницы будильник падал с ошибкой и не срабатывал.
        setRemindCRM(stampKey);
    }, freshStamp);

    if (idx === '') {
        CRMabortTimeOut = timeoutId;
    } else {
        CRMabortTimeOut1 = timeoutId;
    }
    return true;
}

function CRMrefreshTimerReminder() {
    // FIX: раньше второе напоминание восстанавливалось только внутри ветки первого,
    // а также использовались несуществующие ключи 'setminuta1' (опечатка).
    const restoredFirst = rescheduleStoredReminder('');
    const restoredSecond = rescheduleStoredReminder('1');

    if (!restoredFirst && !restoredSecond) {
        clearTimeout(CRMabortTimeOut);
        clearTimeout(CRMabortTimeOut1);
        document.getElementById('btnAlarmclock').textContent = "🔕Reminder";
    }
}

/* ============================================================
 *  УДАЛЕНИЕ И СРАБАТЫВАНИЕ НАПОМИНАНИЙ
 * ============================================================ */

document.getElementById('clock_reminCRM').ondblclick = function () {   // удаление будильника №1
    removeAlarm('clock_reminCRM', CRMabortTimeOut, 'chronostamp', 'chronostamp2', 'remindertextCRM', 'setchasCRM', 'setminutaCRM');
}

document.getElementById('clock_reminCRM1').ondblclick = function () {  // удаление будильника №2
    removeAlarm('clock_reminCRM1', CRMabortTimeOut1, 'chronostamp1', 'chronostamp22', 'remindertextCRM1', 'setchasCRM1', 'setminutaCRM1');
}

/**
 * Показывает уведомление о срабатывании и подчищает данные напоминания.
 * @param {string} tsname - ключ таймера ('chronostamp' | 'chronostamp1').
 */
function setRemindCRM(tsname) {
    // Соответствие ключей таймера полям формы.
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

    const activeReminder = reminders[tsname];

    if (activeReminder) {
        alert(localStorage.getItem(activeReminder.textKey));
        localStorage.removeItem(activeReminder.textKey);
        localStorage.removeItem(tsname);

        // Очищаем поля ввода и хранилище.
        document.getElementById(activeReminder.hourInput).value = "";
        document.getElementById(activeReminder.minuteInput).value = "";
        document.getElementById(activeReminder.textKey).value = "";
        localStorage.removeItem(activeReminder.hourInput);
        localStorage.removeItem(activeReminder.minuteInput);
    }

    // Обновляем индикатор на кнопке меню.
    const reminderstatus = document.getElementById('btnAlarmclock');
    reminderstatus.textContent = (!localStorage.getItem('chronostamp') && !localStorage.getItem('chronostamp1'))
        ? "🔕Reminder"
        : "🔔Reminder";
}

/**
 * Удаляет будильник: сбрасывает таймер, поля и ключи в localStorage.
 */
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
        localStorage.removeItem(Mestextkey);
        alert("Напоминание удалено");
        const reminderstatus = document.getElementById('btnAlarmclock');
        reminderstatus.textContent = (!localStorage.getItem('chronostamp') && !localStorage.getItem('chronostamp1'))
            ? "🔕Reminder"
            : "🔔Reminder";
    }
}

/* ============================================================
 *  ЗАПУСК ТАЙМЕРОВ
 * ============================================================ */

setInterval(CRM_clock_on_javascript_1, 1000);                       // текущее время
setInterval(() => renderReminderCountdown(''), 1000);               // отсчёт №1
setInterval(() => renderReminderCountdown('1'), 1000);              // отсчёт №2

CRMrefreshTimerReminder(); // восстанавливаем активные будильники после загрузки страницы
