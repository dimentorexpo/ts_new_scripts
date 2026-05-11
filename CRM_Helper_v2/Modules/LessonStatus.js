const win_LessonStatus = `
<div class="maindivst" style="width: 1080px;">
  <span style="cursor: -webkit-grab; display: block;">
    <div class="crm-win-header">
      <button class="buttonHide" id="hideMeLessonStatus">hide</button>
      <button class="btnCRM btnCRMsmall" id="clearlessonstatus" title="Очистить">🧹</button>
    </div>
    <div class="crm-flex-row" style="padding: 8px; flex-wrap: wrap; gap: 8px;">
      <span class="spanCRM">Начальная дата <input class="inputCRM" type="date" id="dateFromLS" style="width: 130px; color: #fff;"></span>
      <span class="spanCRM">Конечная дата <input class="inputCRM" type="date" id="dateToLS" style="width: 130px; color: #fff;"></span>
      <input class="inputCRM" id="idteacherforsearch" placeholder="Teacher ID" style="width: 100px; text-align: center;">
      <input class="inputCRM" id="idstudentforsearch" placeholder="Student ID" style="width: 100px; text-align: center;">
      <button class="btnCRM" id="startlookstatus" style="margin-left: auto;">Получить инфо об уроках</button>
    </div>
    <div id="statustable" class="crm-scrollable" style="max-height: 400px; overflow: auto; display: none; padding: 8px;"></div>
  </span>
</div>`;

const wintLessonStatus = createWindowCRM('AF_LessonStatus', 'winTopLessonStatus', 'winLeftLessonStatus', win_LessonStatus);
hideWindowOnDoubleClick('AF_LessonStatus');

document.getElementById('hideMeLessonStatus').onclick = () => {
  document.getElementById('AF_LessonStatus').style.display = 'none';
  document.getElementById('statustable').innerText = "";
};

function setdatesfilds() {
  const now = new Date();
  const prev = new Date(now);
  prev.setDate(prev.getDate() - 1);
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  document.getElementById("dateFromLS").value = fmt(prev);
  document.getElementById("dateToLS").value = fmt(now);
  document.getElementById('statustable').innerText = "";
  document.getElementById('idteacherforsearch').value = "";
  document.getElementById('idstudentforsearch').value = "";
}

document.getElementById('clearlessonstatus').onclick = () => {
  if (!confirm("Очистить поля?")) return;
  setdatesfilds();
};

document.getElementById('butLessonInfoCRM').onclick = () => {
  setdatesfilds();
  const win = document.getElementById('AF_LessonStatus');
  win.style.display = win.style.display === '' ? 'none' : '';
  document.getElementById('idmymenucrm').style.display = 'none';
};

const TABLE_HEADERS = ["🆔 Ученика", "📆 Урока, ⏰", "⚡ Статус", "📅 Отмечен, в ⏰", "❓ Кем", "💦 Тип", "💬 Комментарий", "❌ Удалил", "📅 Удален, в ⏰"];

function createStatusTable() {
  const table = document.createElement('table');
  table.className = 'crm-table'; // SCOPED TABLE
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  TABLE_HEADERS.forEach(h => { const th = document.createElement('th'); th.textContent = h; tr.appendChild(th); });
  thead.appendChild(tr);
  table.appendChild(thead);
  table.appendChild(document.createElement('tbody'));
  return table;
}

function formatDateTime(iso) {
  return iso ? new Date(iso).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }) : "";
}

function createLessonRow(lesson, filterStudentId) {
  const studentId = lesson.studentId;
  if (filterStudentId && studentId !== filterStudentId) return null;
  if (!studentId) return null;
  const row = document.createElement('tr');
  row.className = "rowOfLessonStatus";
  const status = lesson.classStatus;
  const statusClass = status?.status === 'success' ? 'status-success' : 'status-error';
  const cells = [
    studentId,
    formatDateTime(lesson.startAt)?.slice(0, 17) || "",
    `<span class="${statusClass}">${status?.status || ""}</span>`,
    formatDateTime(status?.createdAt),
    status?.createdByUserId || "",
    lesson.type || "",
    status?.comment || "",
    lesson.removedAt ? studentId : "",
    formatDateTime(lesson.removedAt)
  ];
  cells.forEach((content, i) => {
    const td = document.createElement('td');
    td.innerHTML = content;
    if (i === 0) td.setAttribute('name', 'idToCRM');
    row.appendChild(td);
  });
  return row;
}

document.getElementById('startlookstatus').onclick = () => {
  const teacherId = document.getElementById('idteacherforsearch').value.trim();
  if (!teacherId) return alert("Введите ID учителя");
  const container = document.getElementById('statustable');
  container.style.display = "";
  container.innerText = "Загрузка...";
  const start = document.getElementById('dateFromLS').value.split('-').reverse().join('-') + ' 21:00:00';
  const end = document.getElementById('dateToLS').value.split('-').reverse().join('-') + ' 21:00:00';
  const filterStudent = document.getElementById('idstudentforsearch').value.trim();

  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: 'https://timetable.skyeng.ru/api/teachers/search', requestOptions: { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `from=${start}&to=${end}&offset=0&filters[teacherIds][]=${teacherId}&callback=getJSONP`, credentials: "include" } }, (lessonsresponse) => {
    if (!lessonsresponse?.success) { alert('Ошибка: ' + lessonsresponse?.error); return; }
    const data = JSON.parse(lessonsresponse.fetchansver);
    const classes = data[0]?.result?.[0]?.classes;
    if (!classes?.length) { alert("Уроков нет"); return; }
    const table = createStatusTable();
    const tbody = table.querySelector('tbody');
    classes.forEach(lesson => {
      const row = createLessonRow(lesson, filterStudent || null);
      if (row) tbody.appendChild(row);
    });
    container.innerHTML = '';
    container.appendChild(table);
    document.querySelectorAll('[name="idToCRM"]').forEach(el => {
      el.onclick = () => window.open(`https://crm2.skyeng.ru/persons/${el.textContent}`);
      el.oncontextmenu = (e) => { e.preventDefault(); copyToClipboard(el.textContent); };
    });
  });
};
