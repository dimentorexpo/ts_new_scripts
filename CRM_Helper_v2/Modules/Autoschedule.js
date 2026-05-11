let configsObj;

const win_Autoschedule = `
<div class="maindivst" style="width: 720px;">
  <span style="cursor: -webkit-grab; display: block;">
    <div class="crm-win-header">
      <button class="buttonHide" id="hideMeAutoSchedule">hide</button>
      <button class="btnCRM btnCRMsmall" id="clearAutoSchedule" title="Очистить">🧹</button>
    </div>
    <div class="crm-flex-row" style="padding: 8px;">
      <input class="inputCRM" id="studentAPSearch" placeholder="Student ID" title="ID ученика" style="flex: 1; max-width: 200px; text-align: center;">
      <button class="btnCRM" id="startlookAPstatus" title="Проверить статус АП" style="margin-left: auto;">Узнать статус АП</button>
    </div>
    <div id="aptabledata" class="crm-scrollable" style="max-height: 400px; overflow: auto; display: none; padding: 8px;"></div>
  </span>
</div>`;

const wintAutoSchedule = createWindowCRM('AF_Autoschedule', 'winTopAutoSchedule', 'winLeftAutoSchedule', win_Autoschedule);
hideWindowOnDoubleClick('AF_Autoschedule');

document.getElementById('hideMeAutoSchedule').onclick = () => {
  document.getElementById('AF_Autoschedule').style.display = 'none';
  document.querySelector('#aptabledata').innerText = "";
  document.querySelector('#studentAPSearch').value = "";
};

document.getElementById('clearAutoSchedule').onclick = () => {
  document.querySelector('#aptabledata').innerText = "";
  document.querySelector('#studentAPSearch').value = "";
};

document.getElementById('butAutoschedule').onclick = () => {
  const win = document.getElementById('AF_Autoschedule');
  const isHidden = win.style.display === 'none' || !win.style.display;
  win.style.display = isHidden ? '' : 'none';
  document.getElementById('idmymenucrm').style.display = 'none';
  if (!isHidden) return;
  configsObj = new Map();
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: 'https://backend.skyeng.ru/api/products/configurations/', requestOptions: { method: 'GET' } }, (response) => {
    if (!response?.success) { alert('Ошибка: ' + response?.error); return; }
    const data = JSON.parse(response.fetchansver);
    configsObj = new Map(data.data.map(d => [d.serviceTypeKey, d.shortTitle]));
  });
};

function parseSrvAndAP() {
  const studid = document.getElementById('studentAPSearch').value.trim();
  if (studid.length < 3) { alert("Введите корректный ID (минимум 3 символа)"); return; }
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/students/${studid}/education-services/`, requestOptions: { method: 'GET' } }, (response) => {
    if (!response?.success) { alert('Ошибка: ' + response?.error); return; }
    const container = document.getElementById('aptabledata');
    container.style.display = "";
    container.innerText = "Загрузка...";
    const otvetServices = JSON.parse(response.fetchansver);
    if (otvetServices.data?.length) checkAPAvailability(otvetServices.data);
    else container.innerText = "Услуги отсутствуют";
  });
}

function checkAPAvailability(items) {
  const table = document.createElement('table');
  table.className = 'crm-table'; // SCOPED TABLE
  const headers = ["ID услуги", "STK услуги", "Статус АП", "Причина недоступности"];
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  headers.forEach(h => { const th = document.createElement('th'); th.textContent = h; tr.appendChild(th); });
  thead.appendChild(tr);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);
  const container = document.getElementById('aptabledata');
  container.innerHTML = '';
  container.appendChild(table);
  const skipTypes = ['english_adult_self_study', 'english_adult_not_native_speaker_talks_15min', 'life_adult'];

  items.forEach(item => {
    if (skipTypes.includes(item.serviceTypeKey)) return;
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://teachers-schedule.skyeng.ru/api/education-services/${item.id}/auto-schedule/is-available/`, requestOptions: { method: 'GET' } }, (response) => {
      if (!response?.success) return;
      const otvetAPstatus = JSON.parse(response.fetchansver);
      const row = document.createElement('tr');
      row.className = "rowOfLessonStatus";
      const cells = [
        item.id,
        configsObj.get(item.serviceTypeKey) || item.serviceTypeKey,
        otvetAPstatus.data?.isAvailable ? '<span class="status-success">Доступен</span>' : '<span class="status-error">Недоступен</span>',
        otvetAPstatus.data?.reasons?.length ? otvetAPstatus.data.reasons.join(', ') : '➖'
      ];
      cells.forEach(content => { const td = document.createElement('td'); td.innerHTML = content; row.appendChild(td); });
      tbody.appendChild(row);
    });
  });
}

document.getElementById('startlookAPstatus').addEventListener('click', parseSrvAndAP);
