const win_Alarmclock = `
<div class="maindivst" id="AlarmclockCRM" style="width: 300px;">
  <div class="crm-win-header">
    <button class="buttonHide" id="hideAlarmclock">hide</button>
    <button class="btnCRM" id="clock_jsCRM" style="margin-left: auto; font-family: monospace;">00:00:00</button>
  </div>
  <div class="crm-alarm-group">
    <label class="crm-section-label" style="text-align: center; display: block;">Напоминание №1</label>
    <input class="inputCRM" id="remindertextCRM" placeholder="Текст напоминания" style="width: 100%;">
    <div class="crm-flex-row" style="justify-content: center;">
      <input class="inputCRM" id="setchasCRM" placeholder="HH" type="number" min="0" max="23" style="width: 60px; text-align: center;">
      <span class="spanCRM">:</span>
      <input class="inputCRM" id="setminutaCRM" placeholder="MM" type="number" min="0" max="59" style="width: 60px; text-align: center;">
    </div>
    <div class="crm-flex-row">
      <button class="btnCRM" id="setreminderCRM">SET 🔔</button>
      <button class="btnCRM" id="clock_reminCRM" title="Двойной клик = удаление" style="margin-left: auto; color: var(--accent-green);">00 : 00 : 00</button>
    </div>
  </div>
  <div class="crm-alarm-group">
    <label class="crm-section-label" style="text-align: center; display: block;">Напоминание №2</label>
    <input class="inputCRM" id="remindertextCRM1" placeholder="Текст напоминания" style="width: 100%;">
    <div class="crm-flex-row" style="justify-content: center;">
      <input class="inputCRM" id="setchasCRM1" placeholder="HH" type="number" min="0" max="23" style="width: 60px; text-align: center;">
      <span class="spanCRM">:</span>
      <input class="inputCRM" id="setminutaCRM1" placeholder="MM" type="number" min="0" max="59" style="width: 60px; text-align: center;">
    </div>
    <div class="crm-flex-row">
      <button class="btnCRM" id="setreminderCRM1">SET 🔔</button>
      <button class="btnCRM" id="clock_reminCRM1" title="Двойной клик = удаление" style="margin-left: auto; color: var(--accent-green);">00 : 00 : 00</button>
    </div>
  </div>
</div>`;

const wintAlarmclock = createWindowCRM('winAlarmclock', 'winTopAlarmclock', 'winLeftAlarmclock', win_Alarmclock);
hideWindowOnDoubleClick('winAlarmclock');
hideWindowOnClick('winAlarmclock', 'hideAlarmclock');

document.getElementById('AlarmclockCRM').addEventListener('input', (e) => {
  if (e.target.matches('.inputCRM[type="number"]')) {
    maxLengthCheck(e.target);
    checkMinMaxValue(e.target);
  }
});

document.getElementById('btnAlarmclock').onclick = () => {
  const win = document.getElementById('winAlarmclock');
  win.style.display = win.style.display === 'none' || !win.style.display ? '' : 'none';
  document.getElementById('idmymenucrm').style.display = 'none';
};

function formatTime(date) {
  return [date.getHours(), date.getMinutes(), date.getSeconds()].map(v => String(v).padStart(2, '0')).join(' : ');
}

function CRM_clock_on_javascript_1() {
  document.getElementById("clock_jsCRM").textContent = formatTime(new Date());
}

// FIX: compute remaining time from stored target timestamp
function getRemainingTime(hoursKey, minutesKey, stampKey) {
  const targetTs = localStorage.getItem(stampKey);
  if (!targetTs) return null;
  const target = new Date(parseInt(targetTs, 10));
  const now = new Date();
  let secs = Math.floor((target - now) / 1000);
  if (secs <= 0) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(' : ');
}

function CRM_clock_on_javascript_2() {
  document.getElementById("clock_reminCRM").innerHTML = getRemainingTime('setchasCRM', 'setminutaCRM', 'chronostamp') || "00 : 00 : 00";
}

function CRM_clock_on_javascript_3() {
  document.getElementById("clock_reminCRM1").innerHTML = getRemainingTime('setchasCRM1', 'setminutaCRM1', 'chronostamp1') || "00 : 00 : 00";
}

let CRMabortTimeOut = '';
let CRMabortTimeOut1 = '';

if (!localStorage.getItem('chronostamp') && !localStorage.getItem('chronostamp1')) {
  document.getElementById('btnAlarmclock').textContent = "🔕 Reminder";
}

// FIX: store absolute target timestamp instead of delta
function setAlarm(hourId, minuteId, textId, stampKey) {
  const cleanChas = parseInt(document.getElementById(hourId).value, 10);
  const cleanMinuta = parseInt(document.getElementById(minuteId).value, 10);
  if (Number.isNaN(cleanChas) || Number.isNaN(cleanMinuta)) { alert('Укажите время'); return; }
  localStorage.setItem(textId, document.getElementById(textId).value);
  localStorage.setItem(hourId, cleanChas);
  localStorage.setItem(minuteId, cleanMinuta);
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), cleanChas, cleanMinuta, 0);
  if (target <= now) target.setDate(target.getDate() + 1); // next day if time passed
  const chronostamp = target.getTime();
  localStorage.setItem(stampKey, chronostamp);
  alert(`Напоминание установлено на ${cleanChas}:${String(cleanMinuta).padStart(2,'0')}:00`);
  document.getElementById('btnAlarmclock').textContent = "🔔 Reminder";
  return setTimeout(() => setRemindCRM(stampKey), target - now);
}

document.getElementById('setreminderCRM').onclick = () => { CRMabortTimeOut = setAlarm('setchasCRM', 'setminutaCRM', 'remindertextCRM', 'chronostamp'); };
document.getElementById('setreminderCRM1').onclick = () => { CRMabortTimeOut1 = setAlarm('setchasCRM1', 'setminutaCRM1', 'remindertextCRM1', 'chronostamp1'); };

document.getElementById('clock_reminCRM').ondblclick = () => removeAlarm('clock_reminCRM', CRMabortTimeOut, 'chronostamp', 'chronostamp2', 'remindertextCRM', 'setchasCRM', 'setminutaCRM');
document.getElementById('clock_reminCRM1').ondblclick = () => removeAlarm('clock_reminCRM1', CRMabortTimeOut1, 'chronostamp1', 'chronostamp22', 'remindertextCRM1', 'setchasCRM1', 'setminutaCRM1');

function setRemindCRM(tsname) {
  const map = {
    'chronostamp': { text: 'remindertextCRM', h: 'setchasCRM', m: 'setminutaCRM' },
    'chronostamp1': { text: 'remindertextCRM1', h: 'setchasCRM1', m: 'setminutaCRM1' }
  };
  const cfg = map[tsname];
  if (!cfg) return;
  alert(localStorage.getItem(cfg.text));
  localStorage.removeItem(cfg.text);
  localStorage.removeItem(tsname);
  document.getElementById(cfg.h).value = "";
  document.getElementById(cfg.m).value = "";
  document.getElementById(cfg.text).value = "";
  const hasAny = localStorage.getItem('chronostamp') || localStorage.getItem('chronostamp1');
  document.getElementById('btnAlarmclock').textContent = hasAny ? "🔔 Reminder" : "🔕 Reminder";
}

function removeAlarm(clockElem, timeoutVar, stampKey, stamp2Key, textKey, hKey, mKey) {
  if (!localStorage.getItem(stampKey)) return;
  clearTimeout(timeoutVar);
  localStorage.removeItem(stampKey);
  localStorage.removeItem(stamp2Key);
  document.getElementById(hKey).value = "";
  document.getElementById(mKey).value = "";
  document.getElementById(textKey).value = "";
  alert("Напоминание удалено");
  const hasAny = localStorage.getItem('chronostamp') || localStorage.getItem('chronostamp1');
  document.getElementById('btnAlarmclock').textContent = hasAny ? "🔔 Reminder" : "🔕 Reminder";
}

setInterval(CRM_clock_on_javascript_1, 1000);
setInterval(CRM_clock_on_javascript_2, 1000);
setInterval(CRM_clock_on_javascript_3, 1000);
