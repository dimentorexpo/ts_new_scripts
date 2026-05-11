const win_SettingsApp = `
<div class="maindivst" style="width: 360px;">
  <div class="crm-win-header">
    <button class="buttonHide" id="hideSettingsApp">hide</button>
  </div>
  <div style="padding: 8px; display: flex; flex-direction: column; gap: 8px;">
    <div class="crm-flex-row">
      <select class="inputCRM" id="soundlistaddrCRM" style="flex: 1;">
        <option selected disabled>Звук нового сообщения</option>
        <option value="othersound">Выбрать свой звук</option>
      </select>
      <button class="btnCRM btnCRMsmall" id="sound_testCRM" title="Тест">▶</button>
      <label class="checkbox-audio">
        <input id="audioCRMswitcher" type="checkbox" checked>
        <span class="checkbox-audio-switch-CRM"></span>
      </label>
    </div>
    <input class="inputCRM" id="sound_adrCRM" placeholder="Введи адрес звука" style="display: none;">
    <button class="btnCRM btnCRMsmall" id="sound_saveCRM" style="display: none;">💾</button>
    <span class="spanCRM">Громкость звука</span>
    <input id="rangeCRM" class="crm-range" min="0" max="1" value="1.0" step="0.1" type="range">
    <label class="spanCRM" style="display: flex; align-items: center; gap: 6px;">
      <input type="checkbox" id="repeatsoundselectCRM"> Повторять звук новой задачи
    </label>
    <div class="crm-flex-row">
      <span class="spanCRM">Интервал (сек):</span>
      <input class="inputCRM" id="soundplayintervalCRM" placeholder="N" type="number" min="0" max="59" style="width: 60px; text-align: center;">
      <button class="btnCRM" id="setsoundplayintervalCRM">SET ⌚</button>
    </div>
    <div class="crm-flex-row">
      <input class="inputCRM" id="test_stdCRM" placeholder="ID тест У" title="Тестовый ученик" style="flex: 1;">
      <button class="btnCRM btnCRMsmall" id="setteststdCRM" title="Сохранить">💾</button>
      <input class="inputCRM" id="test_teachCRM" placeholder="ID тест П" title="Тестовый преподаватель" style="flex: 1;">
      <button class="btnCRM btnCRMsmall" id="settestteachCRM" title="Сохранить">💾</button>
    </div>
    <div class="crm-flex-row">
      <button class="btnCRM" id="savesettingstofileCRM" style="flex: 1;">💾 Сохранить настройки</button>
      <input type="file" id="fileinputCRM" style="display: none;" accept=".json">
      <label class="btnCRM" for="fileinputCRM" style="flex: 1; text-align: center;">⤵ Загрузить настройки</label>
    </div>
  </div>
</div>`;

let soundsfromdocCRM;
let soundflagCRM = 0;

if (localStorage.getItem('sound_strCRM')) {
  audioCRM = new Audio(localStorage.getItem('sound_strCRM'));
} else {
  audioCRM = new Audio("https://dimentorexpo.github.io/Sounds/msg.mp3");
}

if (!localStorage.getItem('splinterCRM')) localStorage.setItem('splinterCRM', 3);
if (localStorage.getItem('audioCRMvol')) {
  audioCRM.volume = parseFloat(localStorage.getItem('audioCRMvol'));
} else {
  localStorage.setItem('audioCRMvol', 1);
}
if (!localStorage.getItem('audioCRM')) localStorage.setItem('audioCRM', 1);
if (!localStorage.getItem('repeatsound')) localStorage.setItem('repeatsound', 0);

const wintSettingsApp = createWindowCRM('winSettingsApp', 'winTopSettingsApp', 'winLeftSettingsApp', win_SettingsApp);
hideWindowOnDoubleClick('winSettingsApp');
hideWindowOnClick('winSettingsApp', 'hideSettingsApp');

document.getElementById('winSettingsApp').addEventListener('input', (e) => {
  if (e.target.matches('.inputCRM[type="number"]')) { maxLengthCheck(e.target); checkMinMaxValue(e.target); }
  if (['test_stdCRM', 'test_teachCRM'].includes(e.target.id)) onlyNumbers(e.target);
});

const objSoundListCRM = document.getElementById('soundlistaddrCRM');
if (objSoundListCRM.length < 3) getsoundsfromdocCRM();

document.getElementById('btnSettingsApp').onclick = () => {
  const win = document.getElementById('winSettingsApp');
  const isHidden = win.style.display === 'none' || !win.style.display;
  win.style.display = isHidden ? '' : 'none';
  document.getElementById('idmymenucrm').style.display = 'none';
  if (!isHidden) return;
  document.getElementById('test_stdCRM').value = localStorage.getItem('test_studCRM') || '';
  document.getElementById('test_teachCRM').value = localStorage.getItem('test_teachCRM') || '';
  document.getElementById('soundplayintervalCRM').value = localStorage.getItem('splinterCRM') || 3;
  document.getElementById('rangeCRM').value = localStorage.getItem('audioCRMvol') || 1;
  document.getElementById('audioCRMswitcher').checked = localStorage.getItem('audioCRM') !== '0';
  document.getElementById('repeatsoundselectCRM').checked = localStorage.getItem('repeatsound') === '1';
  const checked = document.getElementById('repeatsoundselectCRM').checked;
  document.getElementById('setsoundplayintervalCRM').toggleAttribute('disabled', !checked);
  document.getElementById('soundplayintervalCRM').toggleAttribute('disabled', !checked);
};

async function getsoundsfromdocCRM() {
  soundsfromdocCRM = 'https://script.google.com/macros/s/AKfycbyD1l-oLcE-BBmyN1QmcHKoi0rwVfCwWjE6cfTqw6Y9QQGAju-9inKbwSOfHCI6qBEjtg/exec';
  try {
    const r = await fetch(soundsfromdocCRM);
    const data = await r.json();
    soundsconteinerCRM = data.result;
    soundsconteinerCRM.forEach(([name, url]) => { if (name) addOptionCRM(objSoundListCRM, name, url); });
    const saved = localStorage.getItem('sound_strCRM');
    Array.from(objSoundListCRM.options).forEach((opt, i) => { if (opt.value === saved) objSoundListCRM.selectedIndex = i; });
    if (objSoundListCRM.selectedIndex === 0) {
      objSoundListCRM.selectedIndex = 1;
      document.getElementById('sound_adrCRM').style.display = '';
      document.getElementById('sound_saveCRM').style.display = '';
      document.getElementById('sound_adrCRM').value = saved || '';
    }
  } catch (e) { console.error('Sounds load error:', e); }
}

function changesoundaddrCRM() {
  const selected = objSoundListCRM.options[objSoundListCRM.selectedIndex];
  if (selected.value === "othersound") {
    document.getElementById('sound_adrCRM').style.display = '';
    document.getElementById('sound_saveCRM').style.display = '';
  } else {
    document.getElementById('sound_adrCRM').style.display = 'none';
    document.getElementById('sound_saveCRM').style.display = 'none';
    document.getElementById('sound_adrCRM').value = "";
    localStorage.setItem('sound_strCRM', selected.value);
    audioCRM = new Audio(selected.value);
  }
}
objSoundListCRM.addEventListener('change', changesoundaddrCRM);

document.getElementById('repeatsoundselectCRM').addEventListener('change', () => {
  const checked = document.getElementById('repeatsoundselectCRM').checked;
  localStorage.setItem('repeatsound', checked ? '1' : '0');
  document.getElementById('setsoundplayintervalCRM').toggleAttribute('disabled', !checked);
  document.getElementById('soundplayintervalCRM').toggleAttribute('disabled', !checked);
  if (!checked && typeof soundintervalsetCRM === 'number') { clearInterval(soundintervalsetCRM); soundintervalsetCRM = null; }
});

document.getElementById('setsoundplayintervalCRM').onclick = () => {
  const val = document.getElementById('soundplayintervalCRM').value;
  if (val) localStorage.setItem('splinterCRM', val);
};

document.getElementById('rangeCRM').onchange = function () {
  audioCRM.volume = parseFloat(this.value);
  localStorage.setItem('audioCRMvol', this.value);
};

document.querySelector('.checkbox-audio-switch-CRM').onclick = () => {
  const newVal = localStorage.getItem('audioCRM') === '1' ? '0' : '1';
  localStorage.setItem('audioCRM', newVal);
  document.getElementById('audioCRMswitcher').checked = newVal === '1';
};

document.getElementById('sound_testCRM').onclick = () => {
  const btn = document.getElementById('sound_testCRM');
  if (btn.innerHTML === '▶') {
    btn.innerHTML = '⏹';
    btn.title = 'Остановить';
    audioCRM.play();
    setTimeout(() => { btn.innerHTML = '▶'; btn.title = 'Проверка звука'; }, (audioCRM.duration || 0) * 1000 + 100);
  } else {
    btn.innerHTML = '▶';
    btn.title = 'Проверка звука';
    audioCRM.pause();
    audioCRM.currentTime = 0;
  }
};

document.getElementById('setteststdCRM').onclick = () => { const val = document.getElementById('test_stdCRM').value; if (val) localStorage.setItem('test_studCRM', val); };
document.getElementById('settestteachCRM').onclick = () => { const val = document.getElementById('test_teachCRM').value; if (val) localStorage.setItem('test_teachCRM', val); };

function getLocalstorageToFileCRM(fileName) {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); data[k] = localStorage.getItem(k); }
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName; a.style.display = "none";
  document.body.appendChild(a); a.click();
  setTimeout(() => document.body.removeChild(a), 100);
}

document.getElementById('savesettingstofileCRM').onclick = () => getLocalstorageToFileCRM('settings-CRMhelp');

document.getElementById('fileinputCRM').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file || !file.name.endsWith('.json')) { console.log("Неподдерживаемый файл"); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
      alert("Настройки загружены!");
    } catch (err) { console.error("Parse error:", err); }
  };
  reader.readAsText(file);
});