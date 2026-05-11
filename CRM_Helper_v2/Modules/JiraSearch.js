let indexStart;
let customquery = '';
let requesttojiratext;
let favissues = [];

const win_Jira = `
<div class="maindivst" style="width: 560px;">
  <span style="cursor: -webkit-grab; display: block;">
    <div class="crm-win-header">
      <button class="buttonHide" id="hideMej">hide</button>
      <button class="btnCRM btnCRMsmall" id="RefreshJiraStatus" title="Обновить статус токена Jira">🔄</button>
      <button class="btnCRM btnCRMsmall" id="ClearJiraData" title="Очистить поля">🧹</button>
      <span class="spanCRM">Token Status:</span>
      <span class="spanCRM" id="searchjiratknstatus" style="font-size: 16px;"></span>
      <button class="btnCRM btnCRMsmall crm-win-header-spacer" id="jirainstr" title="Инструкция">❓</button>
    </div>
    <div class="crm-flex-row" id="control_jira_search">
      <button class="btnCRM active-query" id="defaultQuery" title="Поиск по умолчанию">📇 Default</button>
      <button class="btnCRM" id="ZBPQuery" title="Zero Bug Policy">🙅‍♂️ ZeroBug</button>
      <button class="btnCRM" id="freshQuery" title="Свежие баги">🍀 Fresh</button>
      <button class="btnCRM" id="customQuery" title="Custom JQL">📝 Custom</button>
      <button class="btnCRM" id="PSquery" title="Project Support">😵 PS</button>
      <button class="btnCRM" id="getiosbugs" title="iOS баги">🍏 iOS</button>
      <button class="btnCRM" id="getandroidbugs" title="Android баги">🤖 Android</button>
      <button class="btnCRM" id="favouriteBugs" title="Избранное">❤</button>
    </div>
    <div class="crm-flex-row" id="fields_jira_search" style="margin-top: 8px;">
      <textarea class="textareaCRM" id="JQLquery" placeholder="JQL запрос" title="JQL запрос" style="flex: 1; min-height: 40px; text-align: center;"></textarea>
      <div class="crm-flex-row" style="flex: 1;">
        <input class="inputCRM" id="testJira" placeholder="Введите слово или фразу" title="Поисковый запрос" style="flex: 1; text-align: center;">
        <button class="btnCRM btnCRMsmall" id="getJiraTasks" title="Поиск">🚀</button>
      </div>
    </div>
    <div style="margin-top: 8px;">
      <p class="crm-issue-table" id="issuetable"></p>
      <p class="crm-issue-table" id="favouriteissuetable" style="display: none;"></p>
      <span class="spanCRM" id="foundIssuesAmount" style="display: block; margin-top: 6px;"></span>
    </div>
    <div class="crm-pages" id="pagesSwitcher"></div>
  </span>
</div>`;

const wintJira = createWindowCRM('AF_Jira', 'winTopJira', 'winLeftJira', win_Jira);
hideWindowOnDoubleClick('AF_Jira');
hideWindowOnClick('AF_Jira', 'hideMej');

function optionsforfetch(queryName, indexStart) {
  return {
    headers: {
      "__amdmodulename": "jira/issue/utils/xsrf-token-header",
      "accept": "*/*",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-atlassian-token": "no-check",
      "x-requested-with": "XMLHttpRequest"
    },
    body: `startIndex=${indexStart}&filterId=21266&jql=${queryName}&layoutKey=list-view`,
    method: "POST",
    mode: "cors",
    credentials: "include"
  };
}

window.JQLTemplates = {
  defqueryitem: (s) => `issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${s}" ORDER BY updated`,
  frqueryitem: (s) => `issuetype in (Bug, Task) AND status != closed AND Reports >= 0 AND text ~ "${s}" ORDER BY Created`,
  zbpqueryitem: (s) => `issuetype in (Bug, Task) AND status = closed AND resolution in ("Won't Fix", "Won't Do") AND Reports >= 0 AND created >= 2022-01-01 AND text ~ "${s}" ORDER BY updated`,
  iosbugsqueryitem: (s) => `issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${s}" ORDER BY updated`,
  androidbugsqueryitem: (s) => `issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${s}" ORDER BY updated`,
  PSqueryitem: (s) => `project = PS AND text ~ "${s}" ORDER BY Created`
};

function toggleAndDeactivateQueries(currentId) {
  const ids = ['defaultQuery', 'getiosbugs', 'getandroidbugs', 'customQuery', 'favouriteBugs', 'ZBPQuery', 'freshQuery', 'PSquery'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active-query', id === currentId);
  });
}

function showelemonpages() {
  document.getElementById('testJira').value = "";
  document.getElementById('fields_jira_search').style.display = "";
  document.getElementById('issuetable').style.display = "";
  document.getElementById('foundIssuesAmount').style.display = "";
  document.getElementById('pagesSwitcher').style.display = "flex";
  document.getElementById('favouriteissuetable').style.display = "none";
}

function filterItems(item, index) { return index % 2 !== 0 ? item : null; }
function replaceItem(item) { return item ? item.replace('">', ' – ') : item; }

function formatIssue(item, currentNumber, issueKey, searchText, currentpic, currentIds) {
  const temporarka = isSearchTextMatched(item, searchText)
    ? highlightSearchText(item, searchText)
    : replaceItem(item);
  return `
    <div class="crm-flex-row" style="align-items: center; gap: 8px; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
      <span style="color: var(--accent-green); font-size: 16px;">&#5129;</span>
      <img src="${currentpic}" style="width: 18px; height: 22px;" title="Приоритет">
      ${currentNumber ? `<span class="newcount" style="background: var(--accent-green); color: #000; padding: 2px 8px; border-radius: 10px; font-weight: 700; font-size: 12px;">${currentNumber}</span>` : ""}
      <a name="buglinks" href="https://jira.skyeng.link/browse/${issueKey}" target="_blank" style="color: var(--text-bisque); text-decoration: none; flex: 1;">${temporarka}</a>
      <span name="issueIds" style="display:none">${currentIds}</span>
      ${currentNumber ? `
        <span class="addIssueToJiralnk" title="Добавить в ссылку Jira">💬</span>
        <span class="refreshissues" style="color: var(--accent-green); cursor: pointer; font-size: 14px;" title="+1 Support Tab">&#69717;&#120783;</span>
        <span name="addtofavourites" style="cursor: pointer;" title="В избранное">🤍</span>
      ` : ""}
    </div>`;
}

function isSearchTextMatched(item, searchText) {
  const processed = replaceItem(item);
  return processed && processed.toLowerCase().includes(searchText.toLowerCase());
}

function highlightSearchText(item, searchText) {
  const pattern = new RegExp(searchText, 'i');
  const value = `<span style="color: var(--accent-cyan); font-weight: 700; text-shadow: 0 0 8px rgba(0,212,255,0.3);">${searchText.toUpperCase()}</span>`;
  return replaceItem(item).replace(pattern, value);
}

function addPageSwitcher(spanCount) {
  if (spanCount <= 1) return;
  let html = "";
  for (let i = 0; i < spanCount; i++) {
    html += `<span class="${i === 0 ? 'active' : ''}" name="changeList" value="${i * 50}">${i + 1}</span>`;
  }
  document.getElementById('pagesSwitcher').innerHTML = html;
}

function addFavouritesOnClickEvent(addtofarr, tagsarray, massivissueids, outputTable) {
  for (let v = 0; v < addtofarr.length; v++) {
    addtofarr[v].onclick = () => {
      addtofarr[v].innerText = "❤";
      for (let x = 0; x < tagsarray.length; x++) {
        if (x !== v) continue;
        const testvar = document.createElement('div');
        testvar.innerHTML = `
          <p style="margin-bottom: 4px;">
            <span style="color: var(--accent-green);">&#5129;</span>
            <a name="favbugs" href="${tagsarray[x].href}" target="_blank" style="color: var(--text-bisque);">${tagsarray[x].innerHTML}</a>
            <span name="favissuemassive" style="display:none">${massivissueids[x].innerText}</span>
            <span name="removefromfavourites" style="cursor: pointer;" title="Удалить">❌</span>
            <span name="increasecount" style="color: var(--accent-green); margin-left: 6px; cursor: pointer;">&#69717;&#120783;</span>
          </p>`;
        outputTable.appendChild(testvar);
        favissues.push(testvar.innerHTML);
        localStorage.setItem('bugsarray', JSON.stringify(favissues));
      }
    };
  }
}

function addRefreshIssueOnClickEvent(refreshissuesarr, issueIds) {
  refreshissuesarr.forEach((issueElement, index) => {
    issueElement.addEventListener('click', () => {
      const fetchURLtkn = `https://jira.skyeng.link/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${issueIds[index]}`;
      chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLtkn, requestOptions: { method: 'GET', credentials: 'include' } }, (authresponse) => {
        if (!authresponse?.success) { console.error('Ошибка токена:', authresponse?.error); return; }
        const text = authresponse.fetchansver;
        const jira_token = text.match(/"atl_token":"(.*lin)/)?.[1];
        const countMatch = text.match(/customfield_15410.*?value=.*?(\d+)/);
        if (!jira_token || !countMatch) return;
        const count = parseInt(countMatch[1]);
        const increasedcount = (count + 1).toString();
        const body = `customfield_15410=${increasedcount}&issueId=${issueIds[index]}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`;
        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: 'https://jira.skyeng.link/secure/AjaxIssueAction.jspa?decorator=none', requestOptions: { method: 'POST', headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }, body, credentials: 'include' } }, (responseIncrease) => {
          if (responseIncrease?.success) {
            const newinfocount = document.querySelectorAll('.newcount');
            if (newinfocount[index]) newinfocount[index].innerHTML = increasedcount;
          } else {
            console.error('Ошибка увеличения счетчика:', responseIncrease?.error);
          }
        });
      });
    });
  });
}

function addJiraIssueOnClickEvent(barray, issueKeys) {
  barray.forEach((el, j) => {
    el.addEventListener('click', () => {
      if (!window.location.href.includes('crm2.skyeng.ru')) return;
      const label = Array.from(document.querySelectorAll('mat-label')).find(l => l.textContent.trim() === 'Ссылка на Jira');
      if (!label) { console.warn('Label не найден'); return; }
      const input = label.closest('mat-form-field')?.querySelector('input');
      if (!input) { console.warn('Input не найден'); return; }
      input.value = `https://jira.skyeng.link/browse/${issueKeys[j]}`;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}

function getJiraTask(requestOptions) {
  const fetchURL = 'https://jira.skyeng.link/rest/issueNav/1/issueTable';
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, (tasksresponse) => {
    if (!tasksresponse?.success) { alert('Не удалось получить задачи: ' + tasksresponse?.error); return; }
    const rezissuetable = JSON.parse(tasksresponse.fetchansver);
    const { issueKeys, table, issueIds } = rezissuetable.issueTable;
    if (!table) { document.getElementById('issuetable').innerHTML = '<span style="color: var(--text-bisque);">Задач не найдено</span>'; return; }
    const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi)?.filter(filterItems) || [];
    const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);
    const searchText = document.getElementById('testJira').value;
    const pics = table.match(/https:\/\/jira.skyeng.link\/images\/icons\/priorities\/.*svg/gm) || [];
    let issues = '';
    const limit = Math.min(issueKeys.length, 50);
    for (let i = 0; i < limit; i++) {
      issues += formatIssue(matchedItems[i], matchedNumbers?.[i], issueKeys[i], searchText, pics[i], issueIds[i]);
    }
    document.getElementById('issuetable').innerHTML = issues;
    addPageSwitcher(Math.floor(issueKeys.length / 50) + 1);
    document.getElementById('foundIssuesAmount').innerHTML = `Всего найдено задач: ${issueKeys.length}`;
    addJiraIssueOnClickEvent(document.querySelectorAll('.addIssueToJiralnk'), issueKeys);
    addFavouritesOnClickEvent(document.getElementsByName('addtofavourites'), document.getElementsByName('buglinks'), document.getElementsByName('issueIds'), document.getElementById('favouriteissuetable'));
    addRefreshIssueOnClickEvent(document.querySelectorAll('.refreshissues'), issueIds);
    switchJiraPages();
  });
}

function switchJiraPages() {
  if (!requesttojiratext) { alert("Выполни поиск заново"); return; }
  const pageSwArr = document.getElementsByName('changeList');
  const fetchURL = 'https://jira.skyeng.link/rest/issueNav/1/issueTable';
  pageSwArr.forEach((page) => {
    page.onclick = () => {
      if (page.classList.contains('active')) return;
      document.getElementById('issuetable').innerHTML = '<span class="spanCRM">Загрузка...</span>';
      pageSwArr.forEach(p => p.classList.remove('active'));
      page.classList.add('active');
      const requestOptions = optionsforfetch(requesttojiratext, page.getAttribute('value'));
      chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, (tasksresponse2) => {
        if (!tasksresponse2?.success) { alert('Не удалось получить задачи: ' + tasksresponse2?.error); return; }
        const rezissuetable = JSON.parse(tasksresponse2.fetchansver);
        const { issueKeys, table } = rezissuetable.issueTable;
        const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi)?.filter(filterItems) || [];
        const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);
        const regex = /<tr id="issuerow(\d+)"/g;
        const ids = Array.from(table.matchAll(regex), m => m[1]);
        const searchText = document.getElementById('testJira').value;
        const pics = table.match(/https:\/\/jira.skyeng.link\/images\/icons\/priorities\/.*svg/gm) || [];
        let issues = '';
        const switcher = Number(page.getAttribute('value'));
        for (let i = 0; i < rezissuetable.issueTable.displayed; i++) {
          issues += formatIssue(matchedItems[i], matchedNumbers?.[i], issueKeys[+i + switcher], searchText, pics[i], ids[i]);
        }
        document.getElementById('issuetable').innerHTML = issues;
        addFavouritesOnClickEvent(document.getElementsByName('addtofavourites'), document.getElementsByName('buglinks'), document.getElementsByName('issueIds'), document.getElementById('favouriteissuetable'));
        addRefreshIssueOnClickEvent(document.querySelectorAll('.refreshissues'), ids);
      });
    };
  });
}

document.getElementById('ClearJiraData').onclick = () => {
  document.getElementById('testJira').value = '';
  document.getElementById('issuetable').innerText = '';
  document.getElementById('foundIssuesAmount').innerText = '';
  ClearPages();
};

function ClearPages() {
  const pagesSwitcher = document.getElementById('pagesSwitcher');
  while (pagesSwitcher?.firstChild) pagesSwitcher.removeChild(pagesSwitcher.firstChild);
}

document.getElementById('jirainstr').onclick = () => {
  window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-jirasearch%F0%9F%94%8EJiraSearch');
};

document.getElementById('jirafinder').onclick = function () {
  const win = document.getElementById('AF_Jira');
  if (win.style.display === 'none' || !win.style.display) {
    win.style.display = '';
    document.getElementById('idmymenucrm').style.display = 'none';
    document.getElementById('JQLquery').innerText = window.defqueryitem || '';
    checkJiraToken();
    document.getElementById('RefreshJiraStatus').onclick = checkJiraToken;
    if (localStorage.getItem('bugsarray')) {
      favissues = JSON.parse(localStorage.getItem('bugsarray'));
      document.getElementById('favouriteissuetable').innerHTML = favissues.join(" ");
    }
    setupQueryButtons();
    setupSearchHandlers();
  } else {
    win.style.display = 'none';
  }
  document.getElementById('idmymenucrm').style.display = 'none';
};

function checkJiraToken() {
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: 'https://jira.skyeng.link/', requestOptions: { method: 'GET' } }, (responseAuth) => {
    const match = responseAuth?.fetchansver?.match(/name="atlassian-token" content="(.*lin)/);
    const statusEl = document.getElementById('searchjiratknstatus');
    if (match) { statusEl.innerText = "🟢"; }
    else { alert("Авторизуйтесь в Jira"); statusEl.innerText = "🔴"; }
  });
}

function setupQueryButtons() {
  const queries = {
    defaultQuery: { tmpl: 'defqueryitem', show: true },
    PSquery: { tmpl: 'PSqueryitem', show: true },
    freshQuery: { tmpl: 'frqueryitem', show: true },
    ZBPQuery: { tmpl: 'zbpqueryitem', show: true },
    customQuery: { custom: true, show: true },
    getiosbugs: { val: 'ios', show: true },
    getandroidbugs: { val: 'android', show: true },
    favouriteBugs: { fav: true }
  };
  Object.entries(queries).forEach(([id, cfg]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.onclick = () => {
      toggleAndDeactivateQueries(id);
      if (cfg.fav) showFavourites();
      else if (cfg.custom) {
        const area = document.getElementById('JQLquery');
        area.oninput = () => localStorage.setItem('customquery', area.value);
        area.value = localStorage.getItem('customquery') || '';
        showelemonpages();
      } else if (cfg.val) {
        showelemonpages();
        document.getElementById('testJira').value = cfg.val;
        document.getElementById('getJiraTasks').click();
      } else {
        const searchVal = document.getElementById('testJira')?.value || ''; document.getElementById('JQLquery').value = window.JQLTemplates[cfg.tmpl] ? window.JQLTemplates[cfg.tmpl](searchVal) : '';
        showelemonpages();
      }
    };
  });
}

function showFavourites() {
  document.getElementById('issuetable').style.display = "none";
  document.getElementById('fields_jira_search').style.display = "none";
  document.getElementById('foundIssuesAmount').style.display = "none";
  document.getElementById('pagesSwitcher').style.display = "none";
  document.getElementById('favouriteissuetable').style.display = "";
  document.querySelectorAll('[name="removefromfavourites"]').forEach((btn, i) => {
    btn.onclick = () => {
      const parent = btn.parentNode.parentNode;
      favissues.splice(i, 1);
      localStorage.setItem('bugsarray', JSON.stringify(favissues));
      parent.removeChild(btn.parentNode);
    };
  });
  document.querySelectorAll('[name="increasecount"]').forEach((btn, i) => {
    btn.onclick = () => increaseFavCount(i);
  });
}

function increaseFavCount(index) {
  const itarrs = document.getElementsByName('favissuemassive');
  const fetchURL = `https://jira.skyeng.link/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${itarrs[index]?.innerText}`;
  chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions: { method: 'GET' } }, (authresponse2) => {
    if (!authresponse2?.success) return;
    const repcount = authresponse2.fetchansver;
    const jira_token = repcount.match(/"atl_token":"(.*lin)/)?.[1];
    const countMatch = repcount.match(/customfield_15410.*?value=.*?(\d+)/);
    if (!jira_token || !countMatch) return;
    const count = parseInt(countMatch[1]);
    const increasedcount = (count + 1).toString();
    const body = `customfield_15410=${increasedcount}&issueId=${itarrs[index].innerText}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`;
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: 'https://jira.skyeng.link/secure/AjaxIssueAction.jspa?decorator=none', requestOptions: { headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" }, body, method: "POST", credentials: "include" } }, (refissplusresponse) => {
      if (refissplusresponse?.success) alert(`Support Tab увеличен на 1, сейчас: ${increasedcount}`);
    });
  });
}

function setupSearchHandlers() {
  document.getElementById('getJiraTasks').onclick = () => {
    ClearPages();
    const active = ['defaultQuery', 'PSquery', 'freshQuery', 'customQuery', 'getiosbugs', 'getandroidbugs', 'ZBPQuery']
      .find(id => document.getElementById(id)?.classList.contains('active-query'));
    if (!active) return;
    const searchVal = document.getElementById('testJira')?.value || ''; const queries = { defaultQuery: window.JQLTemplates.defqueryitem(searchVal), PSquery: window.JQLTemplates.PSqueryitem(searchVal), freshQuery: window.JQLTemplates.frqueryitem(searchVal), customQuery: localStorage.getItem('customquery'), getiosbugs: window.JQLTemplates.iosbugsqueryitem(searchVal), getandroidbugs: window.JQLTemplates.androidbugsqueryitem(searchVal), ZBPQuery: window.JQLTemplates.zbpqueryitem(searchVal) };
    document.getElementById('JQLquery').value = queries[active] || '';
    requesttojiratext = encodeURIComponent(document.getElementById('JQLquery').value);
    getJiraTask(optionsforfetch(requesttojiratext, 0));
  };

  document.getElementById('getJiraTasks').addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const tasksearch = document.getElementById('testJira').value;
    if (!tasksearch) return;
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://jira.skyeng.link/rest/quicksearch/1.0/productsearch/search?q=${tasksearch}`, requestOptions: { method: 'GET' } }, (searchissresponse) => {
      if (!searchissresponse?.success) { alert('Не удалось найти задачу: ' + searchissresponse?.error); return; }
      const rez = JSON.parse(searchissresponse.fetchansver);
      if (rez?.[0]?.items?.[0]) {
        const item = rez[0].items[0];
        document.getElementById('issuetable').innerHTML = `<span style="color: var(--accent-green);">&#5129;</span> <a href="${item.url}" target="_blank" style="color: var(--text-bisque);">${item.subtitle} – ${item.title}</a>`;
        setTimeout(() => document.getElementById('testJira').value = "", 5000);
      }
    });
  });

  const handleEnter = (e) => { if (e.key === "Enter") document.getElementById('getJiraTasks').click(); };
  document.getElementById('testJira').addEventListener('keydown', handleEnter);
  document.getElementById('JQLquery').addEventListener('keydown', handleEnter);
}