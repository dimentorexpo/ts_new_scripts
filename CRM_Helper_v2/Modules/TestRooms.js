const win_testroomsCRM = `
<div style="width: 330px;">
  <span style="cursor: -webkit-grab; display: block;">
    <div class="crm-win-header">
      <button class="buttonHide" id="hideMetestroomsCRM">hide</button>
      <button class="btnCRM btnCRMsmall" id="clrTestRooms" title="Очистить">🧹</button>
      <button class="btnCRM btnCRMsmall crm-win-header-spacer" id="aboutTestRooms" title="Инструкция">❓</button>
      <button class="btnCRM btnCRMsmall" id="confluenceTestRooms" title="Confluence">📋</button>
    </div>
    <div class="crm-flex-col" style="gap: 8px; padding: 8px;">
      <select class="inputCRM" id="lessontypeselect">
        <option disabled selected value="lessonnotselect">Выбери тип урока</option>
        <option value="test">1 - 1</option>
        <option value="test-parallel">Параллельный</option>
        <option value="test-webinar">Вебинар</option>
        <option value="test-group">Групповой</option>
      </select>
      <select class="inputCRM" id="subjecttypeselect">
        <option disabled selected value="subjnotselect">Выбери предмет</option>
        <option value="api-english">Английский</option>
        <option value="api-biology">Биология</option>
        <option value="api-geography">География</option>
        <option value="api-preschool">Дошкольная математика</option>
        <option value="api-history">История</option>
        <option value="api-computer-science">Компьютерные курсы</option>
        <option value="api-literature">Литература</option>
        <option value="api-math">Математика</option>
        <option value="api-social-science">Обществознание</option>
        <option value="api-russian">Русский язык</option>
        <option value="api-physics">Физика</option>
        <option value="api-chemistry">Химия</option>
        <option value="api-chess">Шахматы</option>
      </select>
      <div class="crm-flex-row">
        <input class="inputCRM" id="teachforroom" placeholder="ID П" title="ID преподавателя">
        <input class="inputCRM" id="studforroom" placeholder="ID У" title="ID ученика (через запятую)">
      </div>
      <div class="crm-flex-row">
        <button class="btnCRM testroomsCRMbtn" id="insertteachid" title="Тестовый П">Тест П</button>
        <button class="btnCRM testroomsCRMbtn" id="insertstudid" title="Тестовый У">Тест У</button>
        <button class="btnCRM testroomsCRMbtn" id="userfromchatid" title="ID из чата">User ID</button>
      </div>
      <button class="btnCRM testroomsCRMcreate" id="starttestroom" title="Создать тестовый урок">Создать тестовый урок</button>
      <label id="testroomsCRMmessage" style="display: none; text-align: center; padding: 8px; border-radius: 8px; color: #fff; font-weight: 500;"></label>
    </div>
  </span>
</div>`;

const winttestroomsCRM = createWindowCRM('testroomsCRM', 'winToptestroomsCRM', 'winLefttestroomsCRM', win_testroomsCRM);
hideWindowOnDoubleClick('testroomsCRM'); // FIX: was 'testroomsCRMhead' — id didn't exist
hideWindowOnClick('testroomsCRM', 'hideMetestroomsCRM');

const messagefield = document.getElementById('testroomsCRMmessage');

document.getElementById('btnCreateTestRoom').onclick = () => {
  const win = document.getElementById('testroomsCRM');
  win.style.display = win.style.display === 'none' || !win.style.display ? '' : 'none';
  document.getElementById('idmymenucrm').style.display = 'none';
};

function cleartestroomsCRMfields() {
  document.getElementById('teachforroom').value = '';
  document.getElementById('studforroom').value = '';
  document.getElementById('subjecttypeselect').selectedIndex = 0;
  document.getElementById('lessontypeselect').selectedIndex = 0;
}

function testteachertofield() {
  const id = localStorage.getItem('test_teachCRM');
  if (id) document.getElementById('teachforroom').value = id;
  else { document.getElementById('teachforroom').placeholder = "Не указан ID П"; testroomsCRMshowmessage('error', 'В настройках не указан ID тестового преподавателя'); }
}

function teststudenttofield() {
  const id = localStorage.getItem('test_studCRM');
  if (id) document.getElementById('studforroom').value = id;
  else { document.getElementById('studforroom').placeholder = "Не указан ID У"; testroomsCRMshowmessage('error', 'В настройках не указан ID тестового ученика'); }
}

document.getElementById('userfromchatid').onclick = () => {
  const userID = document.querySelector('.id')?.innerText;
  if (!userID) { testroomsCRMshowmessage('error', 'Нет открытой задачи'); return; }
  const isTeacher = Array.from(document.querySelectorAll('div[data-qa]')).some(d => d.getAttribute('data-qa') === 'is-teacher-badge');
  if (isTeacher) { document.getElementById('teachforroom').value = userID; teststudenttofield(); }
  else { document.getElementById('studforroom').value = userID; testteachertofield(); }
};

document.getElementById('starttestroom').onclick = () => {
  let errors = [];
  let lessontype = document.getElementById('lessontypeselect').value;
  let lessonsubject = document.getElementById('subjecttypeselect').value;
  let teacherid = document.getElementById('teachforroom').value.trim();
  let studentid = document.getElementById('studforroom').value.trim();
  if (lessontype === 'lessonnotselect') errors.push('Не выбран тип урока');
  if (lessonsubject === 'subjnotselect') errors.push('Не выбран предмет');
  if (teacherid.length < 4) errors.push('Не указан ID преподавателя');
  if (studentid.length < 4) errors.push('Не указан ID ученика');
  if (errors.length) { testroomsCRMshowmessage('error', errors.join('\n')); return; }

  const randomHash = GenerateHash(14);
  const requestBody = `${randomHash}%5Btype%5D=${lessontype}&${randomHash}%5BteacherId%5D=${teacherid.replace(/[^0-9,]/g, '')}&${randomHash}%5BstudentIds%5D=${studentid.replace(/[^0-9,]/g, '').replace(/,/g, '%2C')}&${randomHash}%5BisOpenEntryEnabled%5D=1&btn_create_and_list=`;
  const requestreferrer = `https://${lessonsubject}.skyeng.ru/admin/tech-support-room/create`;
  const requestAdr = `https://${lessonsubject}.skyeng.ru/admin/tech-support-room/create?uniqid=${randomHash}`;

  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: requestAdr, requestOptions: {
    headers: { "accept": "text/html,*/*", "content-type": "application/x-www-form-urlencoded", "sec-fetch-dest": "document", "sec-fetch-mode": "navigate", "sec-fetch-site": "same-origin", "upgrade-insecure-requests": "1" },
    referrer: requestreferrer, referrerPolicy: 'strict-origin-when-cross-origin', body: requestBody, method: 'POST', mode: 'cors', credentials: 'include'
  } }, (roomresponse) => {
    if (roomresponse?.success) { testroomsCRMshowmessage('message', 'Тестовый урок создан!'); cleartestroomsCRMfields(); }
    else { alert('Не удалось создать урок: ' + roomresponse?.error); }
  });
};

function GenerateHash(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function testroomsCRMshowmessage(type, text) {
  messagefield.style.display = 'block';
  messagefield.innerText = text;
  messagefield.className = type === 'error' ? 'highlight-error' : (type === 'message' ? 'success' : '');
  setTimeout(testroomsCRMhidemessage, 7000);
}

function testroomsCRMhidemessage() {
  messagefield.style.display = 'none';
  messagefield.innerText = '';
  messagefield.className = '';
}

document.getElementById('confluenceTestRooms').onclick = () => window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638");
document.getElementById('aboutTestRooms').onclick = () => window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-testrooms");

document.getElementById('teachforroom').addEventListener('input', function () { onlyNumbers(this); });
document.getElementById('studforroom').addEventListener('input', function () { onlyNumbersAndComma(this); });
document.getElementById("insertteachid").addEventListener("click", testteachertofield);
document.getElementById("insertstudid").addEventListener("click", teststudenttofield);
document.getElementById("clrTestRooms").addEventListener("click", cleartestroomsCRMfields);
