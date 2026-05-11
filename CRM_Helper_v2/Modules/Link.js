const win_Links = `
<div style="width: 620px;">
  <span style="cursor: -webkit-grab; display: block;">
    <div class="crm-win-header">
      <button class="buttonHide" id="hideMe">hide</button>
      <button class="btnCRM uplinksbar" id="deleteaclnk" title="Удаление персональных данных">🗑</button>
      <button class="btnCRM uplinksbar" id="knoweledgebase" title="База знаний">📚</button>
      <button class="btnCRM uplinksbar" id="essayadmin" title="Админка эссе">📝</button>
      <button class="btnCRM uplinksbar" id="resetMMPassword" title="Сброс пароля MM">🔐</button>
      <button class="btnCRM uplinksbar" id="bankCheck" title="BIN банка">💳</button>
      <button class="btnCRM uplinksbar" id="GrListData" title="Список группы">👩‍👩‍👧‍👦</button>
      <button class="btnCRM uplinksbar" id="confbugs" title="Известные баги" style="margin-left: auto;">🐞</button>
    </div>
    <div class="crm-links-grid" id="links_but">
      <button class="btnCRM" id="timetable" title="TimeTable">TimeTable</button>
      <button class="btnCRM" id="talksadm" title="Talks">Talks</button>
      <button class="btnCRM" id="billingadm" title="Начислятор">Начислятор</button>
      <button class="btnCRM" id="compens" title="Компенсация">Компенсация</button>
      <button class="btnCRM" id="CMS" title="CMS">CMS</button>
      <button class="btnCRM" id="useradm" title="Админка">Админка</button>
      <button class="btnCRM" id="transactions" title="Поиск $">Поиск $</button>
      <button class="btnCRM" id="suggestions" title="Предложения">Предложения</button>
      <button class="btnCRM" id="userfeatures" title="User Фичи">User Фичи</button>
      <button class="btnCRM" id="kidscms" title="Kids CMS">Kids CMS</button>
      <button class="btnCRM" id="testroom" title="TestRooms">TestRooms</button>
      <button class="btnCRM" id="subscribebilling" title="$Подписки">$Подписки</button>
      <button class="btnCRM" id="apelation" title="Апелляции">Апелляции</button>
      <button class="btnCRM" id="browserstack" title="BrowserStack">BrowserStack</button>
      <button class="btnCRM" id="lesrecords" title="LessonRecords">LessonRecords</button>
      <button class="btnCRM" id="certificates" title="Сертификаты">Сертификаты</button>
      <button class="btnCRM" id="promocodes" title="Промокоды">Промокоды</button>
      <button class="btnCRM" id="helpocentrstud" title="Help Center У">Help Center У</button>
      <button class="btnCRM" id="helpocentrteach" title="Help Center П">Help Center П</button>
      <button class="btnCRM" id="trshoothing" title="Troubleshooting">Troubleshooting</button>
    </div>
    <div class="crm-links-inputs" id="links_box">
      <div class="crm-input-group"><input class="inputCRM" id="cpuname" placeholder="CPU name" title="Название процессора"><button class="btnCRM btnCRMsmall" id="benchmark">🔎</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="creditstatus" placeholder="ID У рассрочка" title="ID ученика"><button class="btnCRM btnCRMsmall" id="credits">🔎</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="iplookup" placeholder="IP У/П/Vimbox" title="IP адрес"><button class="btnCRM btnCRMsmall" id="gotolookip">🔎</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="lgssearch" placeholder="ID Группы LGS" title="ID группы"><button class="btnCRM btnCRMsmall" id="getlgsinfo">🔎</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="cmsstepid" placeholder="CMS stepUUID" title="stepUUID"><button class="btnCRM btnCRMsmall" id="cmsid">🔎</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="schemesteacher" placeholder="ID П схем" title="ID преподавателя"><button class="btnCRM btnCRMsmall" id="getschemes">🔎</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="pushes" placeholder="ID У пуши" title="ID ученика"><button class="btnCRM btnCRMsmall" id="getpushes">🔎</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="setidformobpass" placeholder="ID У/П МП" title="ID для разового пароля"><button class="btnCRM btnCRMsmall" id="getmobpasscode">🚀</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="trshooterhash" placeholder="hash trshooter" title="Хеш комнаты"><button class="btnCRM btnCRMsmall" id="gettrshinfo">🚀</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="enablerAP" placeholder="ID услуги (АП)" title="Активация АП"><button class="btnCRM btnCRMsmall" id="getenablerAP">💾</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="skipAP" placeholder="ID ус (skip АП)" title="Пропуск АП"><button class="btnCRM btnCRMsmall" id="getskipAP">💾</button></div>
      <div class="crm-input-group"><input class="inputCRM" id="skiponboarding" placeholder="ID ус (skip Onbo)" title="Отключить онбоардинг"><button class="btnCRM btnCRMsmall" id="doskiponboard">💾</button></div>
    </div>
    <div class="crm-flex-row" style="margin-top: 8px;">
      <button class="btnCRM" id="restartlesson" title="setStatus('classwork')">Lesson restart 💾</button>
      <button class="btnCRM" id="curVeriOSCRM" title="Версия iOS" style="margin-left: auto;"></button>
      <button class="btnCRM" id="curVerAndroidCRM" title="Версия Android"></button>
    </div>
    <div class="crm-flex-row" style="margin-top: 8px;">
      <button class="btnCRM" id="grafanalnk" title="Видео сервера">Видео сервера в Grafana</button>
      <button class="btnCRM" id="kpiteachersdashboard" title="KPI Teachers">KPI Teachers Dashboard</button>
    </div>
  </span>
</div>`;

let versionsfromdoc;
let versionscontainer;

const wintLinks = createWindowCRM('AF_Links', 'winTopLinks', 'winLeftLinks', win_Links);
hideWindowOnDoubleClick('AF_Links');
hideWindowOnClick('AF_Links', 'hideMe');

async function getversionsapp() {
  versionsfromdoc = 'https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec';
  try {
    const r = await fetch(versionsfromdoc);
    const data = await r.json();
    versionscontainer = data.result;
    document.getElementById('curVeriOSCRM').textContent = `${versionscontainer[1][0]} : ${versionscontainer[1][1]}`;
    document.getElementById('curVerAndroidCRM').innerText = `${versionscontainer[0][0]} : ${versionscontainer[0][1]}`;
  } catch (e) { console.error('Versions fetch error:', e); }
}

document.getElementById('butdiagtoolsCRM').onclick = () => {
  const win = document.getElementById('AF_Links');
  const isHidden = win.style.display === 'none' || !win.style.display;
  win.style.display = isHidden ? '' : 'none';
  document.getElementById('idmymenucrm').style.display = 'none';
  if (isHidden) getversionsapp();
};

const linkHandlers = {
  knoweledgebase: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=25407293',
  essayadmin: 'https://api-english.skyeng.ru/admin/platform/openanswer/list',
  timetable: 'https://timetable.skyeng.ru/',
  curVeriOSCRM: 'https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732',
  curVerAndroidCRM: 'https://play.google.com/store/apps/details?id=skyeng.words.prod',
  talksadm: 'https://vimbox.skyeng.ru/talks/admin/statistics',
  billingadm: 'https://billing-api.skyeng.ru/operations',
  compens: 'https://billing-marketing.skyeng.ru/accrual-operations/create',
  useradm: 'https://id.skyeng.ru/admin/users',
  suggestions: 'https://docs.google.com/forms/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/viewform',
  transactions: 'https://accounting.skyeng.ru/userpayment/search/transaction',
  CMS: 'https://cms-vimbox.skyeng.ru/vim',
  subscribebilling: 'https://billing-api.skyeng.ru/subscriptions',
  apelation: 'https://docs.google.com/forms/d/e/1FAIpQLSdgsb6pte1H1dz15Eb5NjDe0gj3kEnh0hTe6Cgy8d81mT7NUA/viewform',
  confbugs: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=96042583',
  browserstack: 'https://www.browserstack.com/users/sign_in',
  trshoothing: 'https://video-trouble-shooter.skyeng.ru/',
  lesrecords: 'https://tramway.skyeng.ru/record',
  testroom: 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638',
  certificates: 'https://billing-marketing.skyeng.ru/certificate/certSearch',
  promocodes: 'https://billing-marketing.skyeng.ru/promocode/list',
  helpocentrteach: 'https://helpcenter.skyeng.ru/teachers',
  helpocentrstud: 'https://helpcenter.skyeng.ru/students',
  kidscms: 'https://vimbox.skyeng.ru/kids/math/cms/lessons/1',
  userfeatures: 'https://vimbox.skyeng.ru/circles/editor',
  grafanalnk: 'https://grafana.skyeng.link/d/NZkMHsVMk/video-servers-health-check?orgId=1&refresh=1m',
  kpiteachersdashboard: 'https://datalens.yandex.ru/lupggqkv0uewa-kpi-p-dlya-tp?tab=GrW&state=684e0be1371',
  deleteaclnk: 'https://infra.skyeng.ru/request/create/166',
  resetMMPassword: 'https://infra.skyeng.ru/request/create/233'
};

Object.entries(linkHandlers).forEach(([id, url]) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => window.open(url));
});

document.getElementById('restartlesson').addEventListener('click', () => {
  copyToClipboard("setStatus('classwork')");
  const btn = document.getElementById('restartlesson');
  btn.innerHTML = "Copied!";
  setTimeout(() => btn.innerHTML = "Lesson restart 💾", 2000);
});

document.getElementById('benchmark').onclick = () => {
  if (!cpuname.value) return alert('Введите CPU');
  window.open(`https://www.cpubenchmark.net/cpu_lookup.php?cpu=${cpuname.value}`);
  cpuname.value = "";
};

document.getElementById('getschemes').onclick = () => {
  if (!schemesteacher.value) return alert('Введите ID П');
  window.open(`https://teacher-incentive.skyeng.ru/incentive/teacher/${schemesteacher.value}`);
  schemesteacher.value = "";
};

document.getElementById('getpushes').onclick = () => {
  if (!pushes.value) return alert('Введите ID У');
  window.open(`https://push-notifications.skyeng.ru/cms/logs?page=1&paginateBy=100&id=&userId=${pushes.value}&status=&useCase=&notificationSource=&createdAtFrom=&createdAtTo=`);
  pushes.value = "";
};

document.getElementById('credits').onclick = () => {
  if (!creditstatus.value) return alert('Введите ID ученика');
  window.open(`https://billing-api.skyeng.ru/installments?ownerId=${creditstatus.value}&state=&perPage=10`);
  creditstatus.value = "";
};

document.getElementById('gettrshinfo').onclick = () => {
  if (!trshooterhash.value) return alert('Введите hash');
  window.open(`https://video-trouble-shooter.skyeng.ru/?hash=${trshooterhash.value}`);
  trshooterhash.value = "";
};

function saveToClipboard(btnId, linkPrefix, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!input.value) return alert('Введите ID');
  copyToClipboard(linkPrefix + input.value);
  btn.innerHTML = "✅";
  setTimeout(() => btn.innerHTML = "💾", 2000);
  input.value = "";
}

document.getElementById('getenablerAP').onclick = () => saveToClipboard('getenablerAP', 'https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=', 'enablerAP');
document.getElementById('getskipAP').onclick = () => saveToClipboard('getskipAP', 'https://student.skyeng.ru/product-stage?stage=auto-schedule&educationServiceId=', 'skipAP');
document.getElementById('doskiponboard').onclick = () => saveToClipboard('doskiponboard', 'https://student.skyeng.ru/product-stage?stage=onboarding&educationServiceId=', 'skiponboarding');

document.getElementById('gotolookip').onclick = () => {
  if (!iplookup.value) return alert('Введите IP');
  window.open(`https://check-host.net/ip-info?host=${iplookup.value}`);
  iplookup.value = "";
};

document.getElementById('getlgsinfo').onclick = () => {
  if (!lgssearch.value) return alert('Введите ID группы');
  window.open(`https://learning-groups-storage.skyeng.ru/group/${lgssearch.value}?cp=(section:participants)`);
  lgssearch.value = "";
};

document.getElementById('cmsid').onclick = () => {
  if (!cmsstepid.value) return alert('Введите STEPUUID');
  window.open(`https://content.vimbox.skyeng.ru/cms/stepStore/update/stepId/${cmsstepid.value}`);
  cmsstepid.value = "";
};

document.getElementById('getmobpasscode').onclick = () => {
  const input = document.getElementById('setidformobpass');
  const cleaned = input.value.replace(/\D/g, '').trim();
  if (!cleaned) return alert('Введите ID');
  const btn = document.getElementById('getmobpasscode');
  btn.innerHTML = '✅';
  setTimeout(() => btn.innerHTML = '🚀', 2000);
  const url = "https://id.skyeng.ru/admin/auth/one-time-password";
  const requestOptions = {
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: `user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D=${cleaned}&user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null`,
    method: "POST",
    credentials: "include"
  };
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url, requestOptions }, (response) => {
    if (!response?.success) { console.error('OTP error:', response?.error); return; }
    const match = response.fetchansver.match(/div class="alert alert-success" role="alert".*?([0-9]{5}).*/);
    if (match?.[1]) { input.value = match[1]; setTimeout(() => input.value = "", 15000); }
  });
};

document.getElementById('bankCheck').addEventListener('click', () => {
  const win = document.getElementById('AF_BankCheck');
  win.style.display = win.style.display === '' ? 'none' : '';
});

document.getElementById('GrListData').onclick = getGrListDataButtonPress;