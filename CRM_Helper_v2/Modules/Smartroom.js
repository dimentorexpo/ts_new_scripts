const win_smartroomform = `
<div class="maindivst" style="width: 430px;">
  <span style="cursor: -webkit-grab; display: block;">
    <div class="crm-win-header">
      <button class="buttonHide" id="hideMeSmartRoomForm">hide</button>
      <button class="btnCRM btnCRMsmall" id="refreshhashsmartform" title="Обновить хеш">♻</button>
      <button class="btnCRM btnCRMsmall" id="clearsmartroomform" title="Очистить">🧹</button>
      <button class="btnCRM btnCRMsmall crm-win-header-spacer" id="smartroomforminstr" title="Инструкция">❓</button>
    </div>
    <div class="crm-smartroom-form">
      <div class="crm-form-section">
        <label class="crm-section-label">Тип клиента</label>
        <div class="crm-radio-group" id="smartroomuser">
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="typetoform" value="Ученик Adults"> <span>Ученик Adults</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="typetoform" value="Ученик Kids"> <span>Ученик Kids</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="typetoform" value="Ученик Premium"> <span>Ученик Premium</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="typetoform" value="Преподаватель"> <span>Преподаватель</span></label>
        </div>
      </div>
      <div class="crm-form-section">
        <label class="crm-section-label">Формат обучения</label>
        <div class="crm-radio-group" id="smartroomformat">
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="formattoform" value="F2F"> <span>F2F</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="formattoform" value="F2G"> <span>F2G</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="formattoform" value="Вебинар"> <span>Вебинар</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="formattoform" value="ПУ"> <span>ПУ</span></label>
        </div>
      </div>
      <input class="inputCRM" id="clientid" placeholder="ID пользователя" autocomplete="off" type="text">
      <div class="crm-form-section">
        <label class="crm-section-label">С чем обратились?</label>
        <div class="crm-radio-group" id="smartroomquestion">
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="whatobratform" value="Пожелание по улучшению"> <span>Пожелания</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="whatobratform" value="Негатив по работе функционала платформы"> <span>Негатив</span></label>
        </div>
      </div>
      <div class="crm-form-section">
        <label class="crm-section-label">Экосистема</label>
        <div class="crm-radio-group" id="smartroomecosysrem">
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="smartroomecos" value="Функционал платформы"> <span>Платформа</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="smartroomecos" value="Мобильное приложение IOS"> <span>МП iOS</span></label>
          <label class="crm-radio-label"><input class="smartroom-radio" type="radio" name="smartroomecos" value="Мобильное приложение Android"> <span>МП Android</span></label>
        </div>
      </div>
      <div class="crm-form-section">
        <label class="crm-section-label">Тема</label>
        <select class="inputCRM" id="cattwosmatrtoom">
          <option disabled selected>Выбрать категорию</option>
          <option value="Домашние задания">Домашние задания</option>
          <option value="Интерфейс платформы">Интерфейс платформы</option>
          <option value="Функционал урока П">Функционал урока П</option>
          <option value="Функционал урока У">Функционал урока У</option>
          <option value="Вернуть старую платформу">Вернуть старую платформу</option>
          <option value="Мобильное приложение Skyeng">Мобильное приложение Skyeng</option>
        </select>
      </div>
      <div class="crm-form-section">
        <label class="crm-section-label">Подтема</label>
        <select class="inputCRM" id="catthreesmatrtoom">
          <option disabled selected>Выбрать категорию</option>
          <option value="Интерфейс раздела домашки">Интерфейс раздела домашки</option>
          <option value="Нет">Нет</option>
          <option value="Перемешаны слайды в уроке">Перемешаны слайды</option>
          <option value="План урока">План урока</option>
          <option value="План урока\\домашки">План урока\домашки</option>
          <option value="Вложения">Вложения</option>
          <option value="Домашка">Домашка</option>
          <option value="Информирование">Информирование</option>
          <option value="Навигация в домашке">Навигация в домашке</option>
          <option value="Не видно какие уроки уже пройдены У">Не видно пройденные уроки</option>
          <option value="П не может изменить оценку">П не может изменить оценку</option>
          <option value="Предложения по улучшению">Предложения по улучшению</option>
          <option value="Сброс ответов">Сброс ответов</option>
          <option value="Вход в урок">Вход в урок</option>
          <option value="Заметки">Заметки</option>
          <option value="Масштабирование видео">Масштабирование видео</option>
          <option value="Не находит словарь">Не находит словарь</option>
          <option value="Нет отображения кол-ва символов">Нет отображения символов</option>
          <option value="Нумерация степов в уроке">Нумерация степов</option>
          <option value="ОС">ОС</option>
          <option value="Плохой шрифт">Плохой шрифт</option>
          <option value="Словарь">Словарь</option>
          <option value="Урок">Урок</option>
          <option value="Ширина доски">Ширина доски</option>
          <option value="Баллы и картинки">Баллы и картинки</option>
          <option value="Нет прохождения тестов">Нет прохождения тестов</option>
          <option value="Повтор пройденного материала">Повтор материала</option>
          <option value="Связь У с П">Связь У с П</option>
          <option value="Звуки">Звуки</option>
          <option value="Перевод слов на стороне У">Перевод слов У</option>
        </select>
      </div>
      <textarea class="textareaCRM" id="fullcomentsmartroom" placeholder="Полный комментарий" data-gramm="false" wt-ignore-input="true"></textarea>
      <button class="btnCRM" id="send2smartroom" style="width: 100%; margin-top: 8px;">Отправить</button>
    </div>
  </span>
</div>`;

const wintSmartroom = createWindowCRM('AF_Smartroomform', 'winTopSmartroom', 'winLeftSmartroom', win_smartroomform);
hideWindowOnDoubleClick('AF_Smartroomform');
hideWindowOnClick('AF_Smartroomform', 'hideMeSmartRoomForm');

document.getElementById('smartroomformCRM').onclick = () => {
  const win = document.getElementById('AF_Smartroomform');
  const isHidden = win.style.display === 'none' || !win.style.display;
  win.style.display = isHidden ? '' : 'none';
  document.getElementById('idmymenucrm').style.display = 'none';
  if (!isHidden) return;
  if (location.pathname.split('/')[4] === 'task') {
    const grid = document.getElementsByTagName('crm-grid')[8];
    if (grid?.children[0]) document.getElementById('fullcomentsmartroom').value = grid.children[0].innerText.replace('Комментарий\n', '');
  }
  if (document.URL.split('/')[3] === 'persons') {
    const clientId = document.URL.split('/')[4];
    if (/^\d{4,10}$/.test(clientId)) document.getElementById('clientid').value = clientId;
  }
};

function clearradio() {
  document.querySelectorAll('.smartroom-radio').forEach(r => r.checked = false);
  document.getElementById('cattwosmatrtoom').selectedIndex = 0;
  document.getElementById('catthreesmatrtoom').selectedIndex = 0;
}

function getCheckedValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

function getSelectedValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : null;
}

function validateSmartroomForm() {
  let valid = true;
  const fields = [
    { name: 'typetoform', container: 'smartroomuser' },
    { name: 'formattoform', container: 'smartroomformat' },
    { name: 'whatobratform', container: 'smartroomquestion' },
    { name: 'smartroomecos', container: 'smartroomecosysrem' }
  ];
  fields.forEach(({ name, container }) => {
    const el = document.getElementById(container);
    if (!getCheckedValue(name)) { el.classList.add('highlight-error'); valid = false; }
    else { el.classList.remove('highlight-error'); }
  });
  const clientid = document.getElementById('clientid');
  if (clientid.value.length < 3) { clientid.classList.add('highlight-error'); valid = false; }
  else { clientid.classList.remove('highlight-error'); }
  const comment = document.getElementById('fullcomentsmartroom');
  if (comment.value.length < 3) { comment.classList.add('highlight-error'); valid = false; }
  else { comment.classList.remove('highlight-error'); }
  return valid;
}

document.getElementById('send2smartroom').onclick = () => {
  if (!validateSmartroomForm()) return;
  const body2 = [
    `entry.505070950=${encodeURIComponent(document.getElementById('clientid').value)}`,
    `entry.1879097323=${encodeURIComponent(document.getElementById('fullcomentsmartroom').value)}`,
    `entry.1625340245=${encodeURIComponent(getSelectedValue('cattwosmatrtoom'))}`,
    `entry.478427702=${encodeURIComponent(getSelectedValue('catthreesmatrtoom'))}`,
    `entry.466256037=${encodeURIComponent(getCheckedValue('typetoform'))}`,
    `entry.685236831=${encodeURIComponent(getCheckedValue('formattoform'))}`,
    `entry.876256156=${encodeURIComponent(getCheckedValue('whatobratform'))}`,
    `entry.156405977=${encodeURIComponent(getCheckedValue('smartroomecos'))}`
  ].join('&');
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: 'https://docs.google.com/forms/u/1/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/formResponse', requestOptions: { headers: { "content-type": "application/x-www-form-urlencoded" }, body: body2, method: "POST" } }, (offerresponse) => {
    if (offerresponse?.success) {
      const btn = document.getElementById('send2smartroom');
      btn.innerText = "Отправлено ✅";
      setTimeout(() => {
        btn.innerText = "Отправить";
        document.getElementById('AF_Smartroomform').style.display = 'none';
        document.getElementById('clientid').value = '';
        document.getElementById('fullcomentsmartroom').value = '';
        clearradio();
      }, 3000);
    } else {
      alert('Не удалось отправить: ' + offerresponse?.error);
    }
  });
};

document.getElementById('clearsmartroomform').onclick = () => {
  document.getElementById('clientid').value = '';
  document.getElementById('fullcomentsmartroom').value = '';
  document.querySelectorAll('.highlight-error').forEach(el => el.classList.remove('highlight-error'));
  clearradio();
};

document.getElementById('smartroomforminstr').onclick = () => {
  window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-smartroom%F0%9F%A6%90Smartroom');
};

document.getElementById('refreshhashsmartform').onclick = () => {
  if (document.URL.split('/')[3] === 'persons') {
    const clientId = document.URL.split('/')[4];
    if (/^\d{4,10}$/.test(clientId)) document.getElementById('clientid').value = clientId;
  }
  if (location.pathname.split('/')[4] === 'task') {
    const grid = document.getElementsByTagName('crm-grid')[8];
    if (grid?.children[0]) document.getElementById('fullcomentsmartroom').value = grid.children[0].innerText.replace('Комментарий\n', '');
  }
};