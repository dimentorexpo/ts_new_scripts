let indexStart;
let customquery = '';
let requesttojiratext;
let favissues = [];

// SVG-иконки для модуля
const _jira_close = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const _jira_refresh = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';
const _jira_broom = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6l3-3h12l3 3"/><path d="M5 6v12a2 2 0 002 2h10a2 2 0 002-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';

var win_Jira =
    `<div style="width:560px; background:linear-gradient(165deg,#1e1c26 0%,#151320 100%);border:1px solid rgba(201,168,76,.15);border-radius:14px;color:#e0d8c8;font-family:Inter,Segoe UI,system-ui,sans-serif;padding:0;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.03);">

        <!-- Шапка -->
        <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:linear-gradient(135deg,rgba(201,168,76,.12),rgba(139,111,46,.06));border-bottom:1px solid rgba(255,255,255,.06);cursor:grab;" id="jira_1str">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span style="font-size:14px;font-weight:700;color:#fff;letter-spacing:.3px;">Jira Search</span>
            <span style="font-size:10px;color:rgba(255,255,255,.35);font-family:monospace;">v2.0</span>
            <span style="margin-left:auto;display:flex;align-items:center;gap:4px;">
                <span style="font-size:11px;color:rgba(255,255,255,.4);">Token:</span>
                <span id="searchjiratknstatus" style="font-size:11px;"></span>
            </span>
            <button class="btnCRM btnCRMsmall" id="RefreshJiraStatus" title="Обновить статус токена" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;display:flex;align-items:center;padding:4px 8px;border-radius:8px;transition:all .15s ease;">${_jira_refresh}</button>
            <button class="btnCRM btnCRMsmall" id="ClearJiraData" title="Очистить результаты" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;display:flex;align-items:center;padding:4px 8px;border-radius:8px;transition:all .15s ease;">${_jira_broom}</button>
            <button class="btnCRM btnCRMsmall" id="jirainstr" title="Инструкция" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;padding:4px 8px;border-radius:8px;">❓</button>
            <button class="buttonHide" title="Скрыть" id="hideMej" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#fca5a5;display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:8px;font-size:11px;transition:all .15s ease;">${_jira_close} hide</button>
        </div>

        <!-- Пресеты запросов -->
        <div id="control_jira_search" style="display:flex;flex-wrap:wrap;gap:5px;padding:10px 14px;">
            <button class="btnCRM active-query" id="defaultQuery" title="По умолчанию" style="background:linear-gradient(135deg,rgba(201,168,76,.85),rgba(139,111,46,.75));border:none;color:#fff;font-weight:700;padding:5px 10px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:4px;">📇 Default</button>
            <button class="btnCRM" id="ZBPQuery" title="Zero Bug Policy" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;padding:5px 10px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:4px;transition:all .15s ease;">🙅‍♂️ ZeroBug</button>
            <button class="btnCRM" id="freshQuery" title="Свежие баги" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;padding:5px 10px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:4px;transition:all .15s ease;">🍀 Fresh</button>
            <button class="btnCRM" id="customQuery" title="Свой JQL" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;padding:5px 10px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:4px;transition:all .15s ease;">📝 Custom</button>
            <button class="btnCRM" id="PSquery" title="Project Support" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;padding:5px 10px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:4px;transition:all .15s ease;">😵 PS</button>
            <button class="btnCRM" id="getiosbugs" title="iOS баги" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;padding:5px 10px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:4px;transition:all .15s ease;">🍏 iOS</button>
            <button class="btnCRM" id="getandroidbugs" title="Android баги" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#c4b896;padding:5px 10px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:4px;transition:all .15s ease;">🤖 Android</button>
            <button class="btnCRM" id="favouriteBugs" title="Избранное" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fca5a5;padding:5px 10px;border-radius:8px;font-size:11px;display:flex;align-items:center;gap:4px;transition:all .15s ease;">❤️</button>
        </div>

        <!-- Поля ввода -->
        <div id="fields_jira_search" style="padding:0 14px 10px 14px;">
            <textarea class="textareaCRM" id="JQLquery" placeholder="JQL запрос" title="Введите JQL запрос" autocomplete="off" type="text" style="text-align:left;width:100%;box-sizing:border-box;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#e8e0d0;padding:10px 12px;font-size:12px;font-family:SF Mono,monospace,monospace;resize:vertical;min-height:55px;max-height:200px;outline:none;transition:border-color .2s ease,box-shadow .2s ease;"></textarea>
            <div style="display:flex;gap:6px;margin-top:8px;align-items:center;">
                <input class="inputCRM" id="testJira" placeholder="Поиск по слову или номеру задачи (Enter)" title="Введите слово или номер задачи" autocomplete="off" type="text" style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:#fff;padding:9px 12px;font-size:13px;outline:none;transition:border-color .2s ease,box-shadow .2s ease;">
                <button class="btnCRM" id="getJiraTasks" title="Найти" style="background:linear-gradient(135deg,rgba(201,168,76,.85),rgba(139,111,46,.75));border:none;color:#fff;font-weight:700;padding:8px 14px;border-radius:10px;display:flex;align-items:center;gap:4px;box-shadow:0 4px 14px rgba(201,168,76,.2);transition:all .15s ease;">🚀 Найти</button>
            </div>
        </div>

        <!-- Результаты -->
        <div id="jira_tasks_box" style="padding:0 14px 10px 14px;">
            <p id="issuetable" style="max-height:400px;overflow-y:auto;margin:0;padding-right:4px;"></p>
            <p id="favouriteissuetable" style="max-height:400px;overflow-y:auto;margin:0;display:none;"></p>
            <span id="foundIssuesAmount" style="font-size:12px;color:rgba(255,255,255,.45);"></span>
        </div>

        <!-- Переключатель страниц -->
        <div id="pagesSwitcher" style="display:flex;gap:4px;padding:6px 14px 10px 14px;justify-content:center;"></div>

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

const JQLTemplates = { // шаблоны JQL запросов
    defqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    frqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports >= 0 AND text ~ "${testJira.value}" ORDER BY Created',
    zbpqueryitem: 'issuetype in (Bug, Task) AND status = closed AND resolution in ("Won\'t Fix", "Won\'t Do") AND Reports >= 0 AND created >= 2022-01-01 AND text ~ "${testJira.value}" ORDER BY updated',
    iosbugsqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    androidbugsqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    PSqueryitem: 'project = PS AND text ~ "${testJira.value}" ORDER BY Created'
};

// Каждый шаблон становится глобальной константой с геттером:
// при обращении (например defqueryitem) плейсхолдер заменяется текущим текстом из поля поиска.
// Так выражения вида 'text ~ "${testJira.value}"' подставляют живое значение.
for (const [key, template] of Object.entries(JQLTemplates)) {
    Object.defineProperty(window, key, {
        get: function () {
            return template.replace('${testJira.value}', testJira.value);
        }
    });
}

function toggleAndDeactivateQueries(currentId) { // Смена класса кнопок типа запросов
    let queryIds = ['defaultQuery', 'getiosbugs', 'getandroidbugs', 'customQuery', 'favouriteBugs', 'ZBPQuery', 'freshQuery', 'PSquery'];

    queryIds.forEach(id => {
        let element = document.getElementById(id);
        if (id === currentId && !element.classList.contains('active-query')) {
            element.classList.add('active-query'); // Добавляем класс, если его нет у текущего элемента
        } else if (id !== currentId && element.classList.contains('active-query')) {
            element.classList.remove('active-query'); // Удаляем класс, если он есть у других элементов
        }
    });
}

function showelemonpages() { // открываем элементы окна если они скрыты
    document.getElementById('testJira').value = ""
    document.getElementById('fields_jira_search').style.display = ""
    document.getElementById('issuetable').style.display = ""
    document.getElementById('foundIssuesAmount').style.display = "";
    document.getElementById('pagesSwitcher').style.display = "flex";
    document.getElementById('favouriteissuetable').style.display = "none"
}

// Функция для фильтрации элементов списка.
function filterItems(item, index) { // Возвращает элементы списка с нечетными индексами.
    return index % 2 !== 0 ? item : null;
}

function replaceItem(item) { // Функция заменяет '">', на ' – ' в переданной строке.
    if (item) {
        return item.replace('">', ' – ');
    }
    return item;
}

// Кэш приоритетов: URL → data URI (загружаем через bg.js один раз)
const priorityCache = {};
function fetchPriorityIcon(url) {
    if (!url) return Promise.resolve('');
    if (priorityCache[url] !== undefined) return Promise.resolve(priorityCache[url]);
    return new Promise(resolve => {
        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url, requestOptions: { method: 'GET', credentials: 'include' } }, resp => {
            if (resp && resp.success) {
                // Ответ — SVG текст, кодируем в data URI
                const svg = resp.fetchansver;
                const dataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
                priorityCache[url] = dataUri;
                resolve(dataUri);
            } else {
                priorityCache[url] = '';
                resolve('');
            }
        });
    });
}

function getPriorityColor(picUrl) {
    if (!picUrl) return '#666';
    const name = picUrl.split('/').pop().replace('.svg', '').toLowerCase();
    const map = { blocker: '#ef4444', critical: '#f97316', major: '#eab308', minor: '#3b82f6', trivial: '#6b7280' };
    return map[name] || '#c9a84c';
}
// Загружает все SVG иконки приоритетов через bg.js и вставляет как data URI
function loadAllPriorityIcons() {
    document.querySelectorAll('.jira-issue-row img[id^="pri_"]').forEach(img => {
        const issueKey = img.id.replace('pri_', '').replace(/_/g, '-');
        // Ищем URL приоритета из data-атрибута или кэша
        const picUrl = img.dataset.src || '';
        if (!picUrl) return;
        fetchPriorityIcon(picUrl).then(dataUri => {
            if (dataUri) img.src = dataUri;
        });
    });
}

function formatIssue(item, currentNumber, issueKey, searchText, currentpic, currentIds) {
    const temporarka = isSearchTextMatched(item, searchText)
        ? highlightSearchText(item, searchText)
        : replaceItem(item);

    const isAlreadyFav = favissues.some(html => html.includes(currentIds));
    const heartIcon = isAlreadyFav ? '❤️' : '🤍';
    const heartColor = isAlreadyFav ? '#ef4444' : '#888';
    const heartTitle = isAlreadyFav ? 'Удалить из избранного' : 'В избранное';
    const priColor = getPriorityColor(currentpic);
    const priName = currentpic ? currentpic.split('/').pop().replace('.svg','') : '';
    // Уникальный ID для img чтобы обновить src после загрузки
    const imgId = 'pri_' + issueKey.replace(/[^a-zA-Z0-9]/g, '_');

    return `
        <div class="jira-issue-row" style="display:flex;align-items:center;gap:6px;padding:6px 8px;margin-bottom:4px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:8px;transition:background .15s ease;border-left:3px solid ${priColor};" onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background='rgba(255,255,255,.03)'">
            <img id="${imgId}" data-src="${currentpic || ''}" src="" style="width:18px;height:18px;flex-shrink:0;" title="${priName}">
            <span class="newcount" style="background:linear-gradient(135deg,rgba(201,168,76,.8),rgba(139,111,46,.8));box-shadow:inset 0 1px 1px rgba(255,255,255,.15),0 2px 4px rgba(0,0,0,.2);min-width:24px;height:22px;display:inline-flex;align-items:center;justify-content:center;padding:0 5px;font-weight:700;border-radius:7px;font-size:11px;color:#fff;flex-shrink:0;">${currentNumber || 0}</span>
            <span class="addIssueToJiralnk" style="cursor:pointer;font-size:13px;opacity:.45;transition:opacity .15s ease;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.45'" title="Вставить ссылку в чат">💬</span>
            <span class="refreshissues" style="cursor:pointer;opacity:.45;transition:opacity .15s ease;font-size:11px;font-weight:700;color:#c9a84c;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='.45'" title="Увеличить Support Tab">+1</span>
            <span name="addtofavourites" data-id="${currentIds}" style="cursor:pointer;font-size:13px;color:${heartColor};transition:all .2s ease;transform:scale(1);" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'" title="${heartTitle}">${heartIcon}</span>
            <a name="buglinks" href="https://jira.skyeng.link/browse/${issueKey}" target="_blank" style="color:#e8d5a0;text-decoration:none;font-size:12.5px;line-height:1.4;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${temporarka}</a>
            <span name="issueIds" style="display:none">${currentIds}</span>
        </div>
    `;
}

function isSearchTextMatched(item, searchText) {
    const processedItem = replaceItem(item);
    return processedItem && processedItem.toLowerCase().includes(searchText.toLowerCase());
}

function highlightSearchText(item, searchText) {
    const replacePattern = new RegExp(searchText, 'i');
    const replaceValue = `<span style="color:#fde68a;background:rgba(250,204,21,.2);border-radius:3px;padding:0 2px;font-weight:700;">${searchText.toUpperCase()}</span>`;
    return replaceItem(item).replace(replacePattern, replaceValue);
}

function addPageSwitcher(spanCount) { // добавляем страницы для переключения
    if (spanCount <= 1) return;

    let spanElements = "";
    for (let i = 0; i < spanCount; i++) {
        const isActive = i === 0 ? "active" : "";
        spanElements += `<span style="flex:1;text-align:center;padding:4px 8px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;background:${isActive ? 'linear-gradient(135deg,rgba(201,168,76,.85),rgba(139,111,46,.75))' : 'rgba(255,255,255,.05)'};border:1px solid ${isActive ? 'rgba(201,168,76,.5)' : 'rgba(255,255,255,.08)'};color:${isActive ? '#fff' : '#c4b896'};transition:all .15s ease;" class="${isActive}" name="changeList" value="${i * 50}">${i + 1}</span>`;
    }
    document.getElementById('pagesSwitcher').innerHTML = spanElements;
}


function addFavouritesOnClickEvent(addtofarr, tagsarray, massivissueids, outputTable) {
    for (let v = 0; v < addtofarr.length; v++) {
        addtofarr[v].onclick = function () {
            const issueId = massivissueids[v] ? massivissueids[v].innerText : '';
            const isFav = favissues.some(html => html.includes(issueId));

            if (isFav) {
                // Уже в избранном — убираем
                removeIssueFromFavourites(issueId);
                addtofarr[v].innerText = '🤍';
                addtofarr[v].style.color = '#888';
                addtofarr[v].style.transform = 'scale(1)';
                if (typeof createAndShowButton === 'function') createAndShowButton('Удалено из избранного');
            } else {
                // Добавляем в избранное
                for (let x = 0; x < tagsarray.length; x++) {
                    if (x == v) {
                        let testvar = document.createElement('div');
                        testvar.innerHTML = '<div style="display:flex;align-items:center;gap:6px;padding:4px 6px;margin-bottom:3px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:8px;border-left:3px solid rgba(251,191,36,.6);">' + '<span style="color:#fbbf24;font-size:12px;">★</span>' +
                            `<a name="favbugs" href="${tagsarray[x].href}" target="_blank" style="color:#e8d5a0;text-decoration:none;">` +
                            tagsarray[x].innerHTML + '</a>' +
                            `<span name="favissuemassive" style="display:none">${massivissueids[x].innerText}</span>` +
                            '<span name="removefromfavourites" style="cursor:pointer;opacity:.5;transition:opacity .15s ease;font-size:13px;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'.5\'" title="Удалить из Избранного">✕</span>' +
                            '<span name="increasecount" style="cursor:pointer;opacity:.5;transition:opacity .15s ease;font-size:12px;" onmouseover="this.style.opacity=\'1\'" onmouseout="this.style.opacity=\'.5\'" title="Увеличить Support Tab">🔄</span>' + '</div>';
                        outputTable.appendChild(testvar);
                        favissues.push(testvar.innerHTML);
                        localStorage.setItem('bugsarray', JSON.stringify(favissues));
                    }
                }
                // Анимация сердца
                addtofarr[v].innerText = '❤️';
                addtofarr[v].style.color = '#ef4444';
                addtofarr[v].style.transform = 'scale(1.4)';
                setTimeout(() => { addtofarr[v].style.transform = 'scale(1)'; }, 200);
                if (typeof createAndShowButton === 'function') createAndShowButton('Добавлено в избранное ❤️');
            }
        };
    }
}

/**
 * Удаляет задачу из массива избранного по её issueId.
 * FIX: раньше удалялся последний элемент (indexOf(this.value) на span
 * всегда давал -1, а splice(-1, 1) отрезал конец массива).
 */
function removeIssueFromFavourites(issueId) {
    const idx = favissues.findIndex(html => html.includes(issueId));
    if (idx !== -1) {
        favissues.splice(idx, 1);
        localStorage.setItem('bugsarray', JSON.stringify(favissues));
    }
}

function addRefreshIssueOnClickEvent(refreshissuesarr, issueIds) {
	    refreshissuesarr.forEach((issueElement, index) => {
        issueElement.addEventListener('click', function () {
            const fetchURLtkn = `https://jira.skyeng.link/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${issueIds[index]}`;
            const requestOptionsTkn = { method: 'GET', credentials: 'include', }

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLtkn, requestOptions: requestOptionsTkn }, function (authresponse) {
                if (authresponse.success) {
                    let responseAuth = authresponse.fetchansver;
                    let jira_token = responseAuth.match(/"atl_token":"(.*lin)/)[1];
                    let count = parseInt(responseAuth.match(/customfield_15410.*?value=.*?(\d+)/)[1]);
                    let increasedcount = (count + 1).toString();

                    const fetchURLIncreased = "https://jira.skyeng.link/secure/AjaxIssueAction.jspa?decorator=none";
                    const requestOptionsIncreased = {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        },
                        body: `customfield_15410=${increasedcount}&issueId=${issueIds[index]}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`,
                        credentials: 'include',
                    }

                    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLIncreased, requestOptions: requestOptionsIncreased }, function (responseIncrease) {
                        if (responseIncrease.success) {
                            let newinfocount = document.querySelectorAll('.newcount');
                            newinfocount[index].innerHTML = increasedcount;
                        } else {
                            console.log('Ошибка при увеличении счетчика Support Tab:', responseIncrease.error);
                        }
                    });
                } else {
                    console.log('Ошибка при получении токена и счетчика:', authresponse.error);
                }
            });
        });
    });
}

function addJiraIssueOnClickEvent(barray, issueKeys) { // обработчик нажатия на задачу
    for (let j = 0; j < barray.length; j++) {
        barray[j].addEventListener('click', function () {
                if (window.location.href.includes('crm2.skyeng.ru')) {
					
					// Находим label с нужным текстом
					const label = Array.from(document.querySelectorAll('mat-label'))
					  .find(el => el.textContent.trim() === 'Ссылка на Jira');

					if (label) {
					  // Ищем ближайший input в пределах общего контейнера
					  const container = label.closest('mat-form-field');
					  const input = container?.querySelector('input');

					  if (input) {
						input.value = "https://jira.skyeng.link/browse/" + issueKeys[j]
						input.dispatchEvent(new Event('input', { bubbles: true }));
						input.dispatchEvent(new Event('change', { bubbles: true }));
					  } else {
						console.warn('Input не найден рядом с label');
					  }
					} else {
					  console.warn('Label "Ссылка на Jira" не найден');
					}
                }
        })
    }
}


let firstJiraParse = false;

function getJiraTask(requestOptions) { // поиск задач в jira
    const fetchURL = 'https://jira.skyeng.link/rest/issueNav/1/issueTable';

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (tasksresponse) {
        if (tasksresponse.success) {
            const rezissuetable = JSON.parse(tasksresponse.fetchansver)
            console.log(tasksresponse)
            const { issueKeys, table, issueIds } = rezissuetable.issueTable;
            if (!table) {
                document.getElementById('issuetable').innerHTML = '<div style="text-align:center;padding:20px;opacity:.45;font-size:13px;">Задач не найдено</div>'
                return;
            }
            const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi).filter(filterItems);
            const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);
            const searchText = document.getElementById('testJira').value;

            let issues = '';
            for (let i = 0; i < Math.min(issueKeys.length, 50); i++) {
                const currentNumber = matchedNumbers ? matchedNumbers[i] : null;
                const currentIssue = matchedItems[i];
                const currentKey = issueKeys[i];
                const currentIds = issueIds[i];
                const currentpic = table.match(/https:\/\/jira.skyeng.link\/images\/icons\/priorities\/.*svg/gm)[i];

                if (currentIssue && currentKey) {
                    issues += formatIssue(currentIssue, currentNumber, currentKey, searchText, currentpic, currentIds);
                } else {
                    console.error(`Не удалось найти соответствие для индекса: ${i}`);
                }
            }

            document.getElementById('issuetable').innerHTML = issues;
            loadAllPriorityIcons();

            const foundIssuesAmount = issueKeys.length;
            addPageSwitcher(Math.floor(foundIssuesAmount / 50) + 1);

            document.getElementById('foundIssuesAmount').innerHTML = `Всего найдено задач: ${foundIssuesAmount}`;
			
			const barray = document.querySelectorAll('.addIssueToJiralnk');
			 addJiraIssueOnClickEvent(barray, issueKeys);

            addFavouritesOnClickEvent(
                document.getElementsByName('addtofavourites'),
                document.getElementsByName('buglinks'),
                document.getElementsByName('issueIds'),
                document.getElementById('favouriteissuetable')
            );

            const refreshissuesarr = document.querySelectorAll('.refreshissues');
            addRefreshIssueOnClickEvent(refreshissuesarr, issueIds);

            switchJiraPages();
        } else {
            alert('Не удалось получить задачи: ' + tasksresponse.error);
        }
    });
}
function switchJiraPages() {
    if (!requesttojiratext) {
        alert("Выполни поиск заново");
        return;
    }

    const pageSwArr = document.getElementsByName('changeList');
    const fetchURL = 'https://jira.skyeng.link/rest/issueNav/1/issueTable';

    pageSwArr.forEach((page, d) => {
        page.onclick = async function () {
            if (!this.classList.contains('active')) {
                document.getElementById('issuetable').innerHTML = '<div style="text-align:center;padding:20px;opacity:.6;font-size:13px;">🔍 Загрузка...</div>';

                pageSwArr.forEach(p => p.classList.remove('active'));
                this.classList.add('active');

                const requestOptions = optionsforfetch(requesttojiratext, page.getAttribute('value'));

                chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (tasksresponse2) {
                    if (tasksresponse2.success) {
                        const rezissuetable = JSON.parse(tasksresponse2.fetchansver)
                        console.log(tasksresponse2)
                        const { issueKeys, table, issueIds } = rezissuetable.issueTable;
                        const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi).filter(filterItems);
                        const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);

                        const regex = /<tr id="issuerow(\d+)"/g;
                        const matches = table.matchAll(regex);
                        const ids = Array.from(matches, m => m[1]);
                        console.log(ids)
                        const searchText = document.getElementById('testJira').value;

                        let issues = '';
                        let switcher = Number(page.getAttribute('value'))
                        for (let i = 0; i < rezissuetable.issueTable.displayed; i++) {
                            const currentNumber = matchedNumbers ? matchedNumbers[i] : null;
                            const currentIssue = matchedItems[i];
                            const currentKey = issueKeys[+i + switcher];
                            const currentIds = ids[i];
                            const currentpic = table.match(/https:\/\/jira.skyeng.link\/images\/icons\/priorities\/.*svg/gm)[i];
                            if (currentIssue && currentKey) {
                                issues += formatIssue(currentIssue, currentNumber, currentKey, searchText, currentpic, currentIds);
                            } else {
                                console.error("Не удалось найти соответствие для индекса: " + i);
                            }
                        }

                        document.getElementById('issuetable').innerHTML = issues;
            loadAllPriorityIcons();

                        addFavouritesOnClickEvent(
                            document.getElementsByName('addtofavourites'),
                            document.getElementsByName('buglinks'),
                            document.getElementsByName('issueIds'),
                            document.getElementById('favouriteissuetable')
                        );

                        const refreshissuesarr = document.querySelectorAll('.refreshissues');
                        addRefreshIssueOnClickEvent(refreshissuesarr, ids);
                    } else {
                        alert('Не удалось получить задачи: ' + tasksresponse2.error);
                    }
                });
            }
        }
    });
}

document.getElementById('ClearJiraData').onclick = function () {  // функция очистки полей в форме
    document.getElementById('testJira').value = '';
    document.getElementById('issuetable').innerText = '';
    document.getElementById('foundIssuesAmount').innerText = '';
    ClearPages();
}

function ClearPages() { // Удаляем страницы найденных задачь
    var pagesSwitcher = document.getElementById('pagesSwitcher');

    if (pagesSwitcher.children.length !== 0) {
        while (pagesSwitcher.firstChild) {
            pagesSwitcher.removeChild(pagesSwitcher.firstChild);
        }
    }
}

document.getElementById('jirainstr').onclick = function () {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-jirasearch%F0%9F%94%8EJiraSearch')
}

document.getElementById('jirafinder').onclick = function () { // открывает поле для работой с JIRA поиском
    if (document.getElementById('AF_Jira').style.display == 'none') {
        document.getElementById('AF_Jira').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'

        // FIX: было .innerText — для textarea корректно задавать значение через .value
        document.getElementById('JQLquery').value = defqueryitem;

        function checkJiraToken() { // Функция проверки авторизации в Jira
            const fetchURL = 'https://jira.skyeng.link/';
            const requestOptions = {
                method: 'GET'
            };
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (responseAuth) {
                const regexMatch = responseAuth.fetchansver.match(/name="atlassian-token" content="(.*lin)/);
                if (regexMatch) {
                    // Токен найден — пользователь авторизован в Jira.
                    document.getElementById('searchjiratknstatus').innerText = "🟢";
                } else {
                    // Если токен не найден, предупреждаем и показываем красный индикатор.
                    alert("Авторизуйтесь в системе Jira, чтобы при поиске запрос был отправлен");
                    document.getElementById('searchjiratknstatus').innerText = "🔴";
                }
            })
        }

        checkJiraToken()
        document.getElementById('RefreshJiraStatus').onclick = checkJiraToken // функция повторной проверки авторизации в Jira

        if (localStorage.getItem('bugsarray')) {
            favissues = JSON.parse(localStorage.getItem('bugsarray'));
            document.getElementById('favouriteissuetable').innerHTML = favissues.join(" ");
        }

        document.getElementById('defaultQuery').onclick = function () { // если выбрана default
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').value = defqueryitem;
            showelemonpages();
        }

        document.getElementById('PSquery').onclick = function () { //Если выбрана PS
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').value = PSqueryitem;
            showelemonpages();
        }

        document.getElementById('getiosbugs').onclick = function () { // если выбрана ios
            toggleAndDeactivateQueries(this.id);
            showelemonpages();
            document.getElementById('testJira').value = "ios";
            document.getElementById('getJiraTasks').click();
        }

        document.getElementById('getandroidbugs').onclick = function () { // если выбрана android
            toggleAndDeactivateQueries(this.id);
            showelemonpages();
            document.getElementById('testJira').value = "android";
            document.getElementById('getJiraTasks').click();
        }

        document.getElementById('freshQuery').onclick = function () {  // если выбрана fresh
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').value = frqueryitem;
            showelemonpages();
        }

        document.getElementById('ZBPQuery').onclick = function () {  // если выбрана fresh
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').value = zbpqueryitem;
            showelemonpages();
        }

        document.getElementById('customQuery').onclick = function () { // если выбрана custom
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').oninput = function () {
                localStorage.setItem('customquery', this.value)
            }
            document.getElementById('JQLquery').value = localStorage.getItem('customquery');
            showelemonpages();
        }

        document.getElementById('favouriteBugs').onclick = function () { // если выбрана ❤ favourite
            if (document.getElementById('favouriteissuetable').style.display != "") {
                toggleAndDeactivateQueries(this.id);
                document.getElementById('issuetable').style.display = "none";
                document.getElementById('fields_jira_search').style.display = "none";
                document.getElementById('foundIssuesAmount').style.display = "none";
                document.getElementById('pagesSwitcher').style.display = "none";
                document.getElementById('favouriteissuetable').style.display = "";

                for (let i = 0; i < document.getElementsByName('removefromfavourites').length; i++) {
                    document.getElementsByName('removefromfavourites')[i].onclick = function () {
                        let parent = this.parentNode.parentNode;
                        // FIX: раньше splice(-1, 1) удалял последнюю задачу в избранном,
                        // т.к. indexOf(this.value) на span всегда возвращал -1.
                        const issueId = this.parentNode.querySelector('[name="favissuemassive"]').innerText;
                        removeIssueFromFavourites(issueId);
                        parent.removeChild(this.parentNode);
                        plusonecount() // перепривязываем обработчики увеличения счётчика
                    }
                }

                let cnttoincrease = document.getElementsByName('increasecount');
                let itarrs = document.getElementsByName('favissuemassive')
                for (let c = 0; c < cnttoincrease.length; c++) {
                    cnttoincrease[c].onclick = plusonecount;
                }

                function plusonecount() { // функция увеличения +1 в сапорт таб в джира
                    let cnttoincrease = document.getElementsByName('increasecount');
                    let itarrs = document.getElementsByName('favissuemassive')
                    for (let c = 0; c < cnttoincrease.length; c++) {
                        cnttoincrease[c].onclick = function () {
                            console.log('clicked')
                            const fetchURL = `https://jira.skyeng.link/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${itarrs[c].innerText}`;
                            const requestOptions = {
                                method: 'GET'
                            };

                            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (authresponse2) {
                                if (authresponse2.success) {
                                    const repcount = authresponse2.fetchansver;
                                    if (repcount) {
                                        let count;
                                        let jira_token;
                                        let increasedcount;

                                        jira_token = repcount.match(/"atl_token":"(.*lin)/)[1];
                                        count = repcount.match(/customfield_15410.*?value=.*?(\d+)/)[1];
                                        count = parseInt(count);
                                        increasedcount = count + 1;
                                        increasedcount = increasedcount.toString();
                                        console.log("count=" + count + " increasedcount " + increasedcount);

                                        const fetchURL2 = 'https://jira.skyeng.link/secure/AjaxIssueAction.jspa?decorator=none';
                                        // FIX: раньше options формировались как JSON-строка — fetch
                                        // молча игнорировал её и слал GET вместо POST с телом,
                                        // поэтому Support Tab фактически не увеличивался.
                                        const requestOptions2 = {
                                            headers: {
                                                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                                                "x-requested-with": "XMLHttpRequest",
                                                "x-sitemesh-off": "true"
                                                // sec-fetch-* браузер проставит сам
                                            },
                                            body: `customfield_15410=${increasedcount}&issueId=${itarrs[c].innerText}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`,
                                            method: "POST",
                                            mode: "cors",
                                            credentials: "include"
                                        };

                                        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL2, requestOptions: requestOptions2 }, function (refissplusresponse) {
                                            if (refissplusresponse.success) {
                                                alert(`Support Tab для задачи ${document.getElementsByName('favbugs')[c].href} увеличен на 1 и сейчас равен: ${increasedcount}`)
                                            } else {
                                                alert('Не удалось добавить SupportTab: ' + refissplusresponse.error);
                                            }
                                        });
                                    }
                                } else {
                                    // FIX: было обращение к несуществующей переменной refissresponse — падал ReferenceError.
                                    alert('Не удалось добавить SupportTab: ' + authresponse2.error);
                                }
                            });
                        }
                    }
                }
            } else {
                document.getElementById('issuetable').style.display = "none"
                document.getElementById('favouriteissuetable').style.display = "none"
                document.getElementById('favouriteBugs').classList.remove('active-query')
            }
        }
        // end of favouritebugs

        document.getElementById('getJiraTasks').onclick = function () {
            ClearPages();
            let requestOptions;

            const queries = {
                'defaultQuery': defqueryitem,
                'PSquery': PSqueryitem,
                'freshQuery': frqueryitem,
                'customQuery': localStorage.getItem('customquery'),
                'getiosbugs': iosbugsqueryitem,
                'getandroidbugs': androidbugsqueryitem,
                'ZBPQuery': zbpqueryitem
            };

            for (let id in queries) {
                if (document.getElementById(id).classList.contains('active-query')) {
                    document.getElementById('JQLquery').value = queries[id];
                    requesttojiratext = encodeURIComponent(document.getElementById('JQLquery').value);
                    requestOptions = optionsforfetch(requesttojiratext, 0);
                    break;
                }
            }

            // FIX: если ни одна вкладка запроса не выбрана, раньше в fetch уходил
            // undefined вместо options — теперь подставляем дефолтный запрос.
            if (!requestOptions) {
                requesttojiratext = encodeURIComponent(defqueryitem);
                requestOptions = optionsforfetch(requesttojiratext, 0);
            }

            getJiraTask(requestOptions);
        }

        // Просмотр таски по джира по ее коду и номеру
        document.getElementById('getJiraTasks').addEventListener('contextmenu', function (event) {
            event.preventDefault(); // Предотвращаем появление стандартного контекстного меню

            if (document.getElementById('AF_Jira').style.display == 'none') {
                document.getElementById('AF_Jira').style.display = ''
            }

            let tasksearch = document.getElementById('testJira').value;

            const fetchURL = `https://jira.skyeng.link/rest/quicksearch/1.0/productsearch/search?q=${tasksearch}`;
            const requestOptions = {
                method: 'GET'
            };

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (searchissresponse) {
                if (searchissresponse.success) {
                    const rezissuetable = JSON.parse(searchissresponse.fetchansver);
                    if (rezissuetable) {
                        let issues = [];
                        issues = '<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:8px;border-left:3px solid rgba(201,168,76,.5);">' + '<a href="' + rezissuetable[0].items[0].url + '" onclick="" target="_blank" style="color:#e8d5a0;text-decoration:none;font-size:12.5px;">' + rezissuetable[0].items[0].subtitle + " - " + rezissuetable[0].items[0].title + '</a></div>';
                        document.getElementById('issuetable').innerHTML = issues;
            loadAllPriorityIcons();
                        // Через 5 секунд очищаем поле поиска (сброс локальной переменной issues убран как бесполезный).
                        setTimeout(function () { testJira.value = ""; }, 5000)
                    }
                } else {
                    // FIX: было обращение к несуществующей переменной refissresponse — падал ReferenceError.
                    alert('Не удалось найти задачу: ' + searchissresponse.error);
                }
            });
        });

        const searchJiraByEnter = document.querySelector('#testJira');
        const searchJiraByEnterInput = document.querySelector('#JQLquery');
        const getJiraTasksBtn = document.querySelector('#getJiraTasks');

        function handleSearchJiraByEnter(event) { //по Enter запускает поиск по Jira
            if (event.key === "Enter") {
                getJiraTasksBtn.click();
            }
        }

        searchJiraByEnter.addEventListener('keydown', handleSearchJiraByEnter);
        searchJiraByEnterInput.addEventListener('keydown', handleSearchJiraByEnter);

    } else if (document.getElementById('AF_Jira').style.display == '') {
        document.getElementById('AF_Jira').style.display = 'none'
        // FIX: элемента MainMenuBtn не существует (кнопка меню называется MenubarCRM) —
        // раньше здесь падал TypeError при закрытии окна через меню.
        document.getElementById('MenubarCRM')?.classList.remove('activeScriptBtn')
    }

    document.getElementById('idmymenucrm').style.display = 'none'
}