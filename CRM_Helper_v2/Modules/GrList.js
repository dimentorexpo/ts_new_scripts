const win_GrList = `
<div style="width: 450px;">
  <span style="cursor: -webkit-grab; display: block;">
    <div class="crm-win-header">
      <button class="buttonHide" id="hideList">hide</button>
    </div>
    <div class="crm-flex-row" style="padding: 8px; justify-content: center;">
      <input class="inputCRM" id="idgrouptolist" placeholder="ID группы" title="ID группы" style="width: 100px; text-align: center;">
      <button class="btnCRM" id="getidgrouptolist">Get info</button>
    </div>
    <div id="grlistinfo" class="crm-scrollable" style="max-height: 600px; overflow-y: auto; padding: 8px;"></div>
  </span>
</div>`;

// FIX: was 'winTopGrList' for both top and left keys — broke position persistence
const wintGrList = createWindowCRM('AF_GrList', 'winTopGrList', 'winLeftGrList', win_GrList);
hideWindowOnDoubleClick('AF_GrList');

document.getElementById('idgrouptolist').addEventListener('input', (e) => onlyNumbers(e.target));

function getGrListDataButtonPress() {
  const win = document.getElementById('AF_GrList');
  win.style.display = win.style.display === '' ? 'none' : '';
}

document.getElementById('getidgrouptolist').addEventListener('click', async () => {
  const grid = document.getElementById('idgrouptolist').value.trim();
  const container = document.getElementById('grlistinfo');
  container.innerHTML = "Загрузка...";
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${grid}`, requestOptions: { method: 'GET' } }, (response) => {
    if (!response?.success) { container.innerText = 'Ошибка загрузки'; return; }
    const data = JSON.parse(response.fetchansver);
    const students = data.data?.students || [];
    const teacher = data.data?.teachers?.[0];
    let html = students.map((s, i) => `
      <div class="crm-student-row">
        <span class="crm-student-num">${i + 1}.</span>
        <span class="grstdcrm" title="Открыть в CRM">ℹ ID У: ${s.userId}</span>
        <span class="crm-student-service">ID услуги: ${s.educationServiceId}</span>
        <span class="stname"></span>
      </div>
    `).join('');
    if (teacher) html += `<div class="crm-teacher-row">ID П: ${teacher.userId}</div>`;
    container.innerHTML = html;
    if (students.length) {
      chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: "https://learning-groups-storage-api.skyeng.ru/api/v1/userInfo/findByIds", requestOptions: { headers: { "content-type": "application/json; charset=UTF-8" }, body: JSON.stringify({ ids: students.map(s => s.userId) }), method: "POST", credentials: "include" } }, (res) => {
        if (!res?.success) return;
        const names = JSON.parse(res.fetchansver).data || [];
        document.querySelectorAll('.stname').forEach((el, i) => {
          if (names[i]?.name) el.textContent = `${names[i].name.first} ${names[i].name.last}`;
        });
      });
    }
    document.querySelectorAll('.grstdcrm').forEach((el, i) => {
      el.addEventListener('click', () => window.open(`https://crm2.skyeng.ru/persons/${students[i].userId}`));
    });
  });
});

document.getElementById('hideList').addEventListener('click', () => {
  document.getElementById('AF_GrList').style.display = 'none';
  document.getElementById('grlistinfo').innerText = "";
  document.getElementById('idgrouptolist').value = "";
});
