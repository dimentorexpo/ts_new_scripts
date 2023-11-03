let indexStart;
let customquery = '';
let requesttojiratext;
let favissues = [];
const textArea1 = document.getElementById('responseTextarea1');
const textArea2 = document.getElementById('responseTextarea2');
const textArea3 = document.getElementById('responseTextarea3');
const sendRespbtn = document.getElementById('sendResponse');
var win_Jira =  // описание элементов окна Поиска по Jira
    `<div style="display: flex; width: 550px;">
        <span style="width: 550px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 550;" id="jira_1str">
                                <button title="скрывает меню" id="hideMej" style="width:50px; background: #228B22;">hide</button>
								<button id="RefreshJiraStatus" title="Обновляет статус Токена Jira, чтобы проверить авторизованы вы или нет">🔄</button>
								<button id="ClearJiraData" title="Очищает поля с результатами и полем для ввода">🧹</button>
								<span style="color:bisque">Token Status: </span>
								<span id="searchjiratknstatus"></span>
								<button id="jirainstr" style="float:right;" title="Инструкция по этой форме">❓</button>
                        </div>

						<div id="control_jira_search">
							<button id="defaultQuery" title="Страница для поиска по умолчанию с заранее записанным JQL запросом" class="active-query">📇Default</button>
                            <button id="ZBPQuery" title="Страница для поиска Zero Bug Policy">🙅‍♂️ZeroBug</button>
							<button id="freshQuery" title="Страница при поиске по ключевому слову, выводящая свежесозданные баги в порядке убывания и с 0 Support Tab с заранее записанным JQL запросом">🍀Fresh</button>
							<button id="customQuery" title="Страница для ручного составления JQL запроса. Поле для ввода поиска не используется, только лишь верхняя часть от выбора отдела до ввода искомого текста в двойных кавычках после надписи text~">📝Custom</button>
							<button id="PSquery" title="Страница для поиска по ID или тексту срези запросов в Project Support, потому как в Mattermost может не найти">😵PS</button>
							<button id="getiosbugs" title="По клику сразу ищет баги по iOS как если бы выискали стандартно с вводом текста поиска iOS">🍏iOS</button>
							<button id="getandroidbugs" title="По клику сразу ищет баги по iOS как если бы выискали стандартно с вводом текста поиска Android">🤖Android</button>
							<button id="favouriteBugs" title="Страница с сохраненными багами для быстрого доступа">❤</button>
                        </div>

                        <div id="fields_jira_search">
							<textarea id="JQLquery" placeholder="JQL запрос" title="Введите сюда JQL запрос" autocomplete="off" type="text" style="text-align: center; width: 500px; color: black; margin-top: 5px; margin-left: 5%;"></textarea>
							<input id="testJira" placeholder="Введите слово или фразу для поиска" title="введите слово или фразу для поиска по Jira при одном клике будет искать по багам, если ввести в поле номер задачи например VIM-7288 и дабл кликнуть на рокету будет поиск по номеру" autocomplete="off" type="text" style="text-align: center; width: 300px; color: black; margin-top: 5px; margin-left: 20%; border-radius: 20px;">
							<button id="getJiraTasks" style="width: 25.23px;">🚀</button>
						</div>

                        <div style="margin: 5px; width: 550px" id="jira_tasks_box">
                                <p id="issuetable" style="max-height:400px; margin-left:5px; overflow:auto"></p>
                                <div id="favouriteissuetable" style="max-height:400px; margin-left:5px; overflow:auto; display:none"></div>
								<span style="color:bisque" id="foundIssuesAmount"></span>
                        </div>
						<div>
							<div id="pagesSwitcher" style="display:flex; color:bisque; cursor:pointer; justify-content:space-evenly; padding:5px;"></div>
						</div>
                </span>
        </span>
</div>`;

if (localStorage.getItem('winTopJira') == null) { // началоное положение окна поиска по Jira (если не задано ранее)
    localStorage.setItem('winTopJira', '120');
    localStorage.setItem('winLeftJira', '295');
}

let wintJira = document.createElement('div'); // создание окна поиска по Jira
document.body.append(wintJira);
wintJira.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopJira') + 'px; left: ' + localStorage.getItem('winLeftJira') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintJira.style.display = 'none';
wintJira.setAttribute('id', 'AF_Jira');
wintJira.innerHTML = win_Jira;

// начало изменения позиции окна поиска по Jira
wintJira.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintJira.offsetLeft;
    let elemTop = wintJira.offsetTop;

    function onMouseMove(event) {
		if (!(event.buttons & 1)) {
			onMouseUp();
			return;
		  }
		  
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintJira.style.left = (elemLeft + deltaX) + "px";
      wintJira.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopJira', String(elemTop + deltaY));
      localStorage.setItem('winLeftJira', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};
// прекращение изменения позиции окна поиска по Jira

function optionsforfetch(queryName, indexStart) {
	let tempvar;
	tempvar = `
		"headers": {
			"__amdmodulename": "jira/issue/utils/xsrf-token-header",
		   "accept": "*/*",
			"sec-fetch-mode": "cors",
		   "sec-fetch-site": "same-origin",
		   "x-atlassian-token": "no-check",
		   "x-requested-with": "XMLHttpRequest"
		 },
		 "body": "startIndex=${indexStart}&filterId=21266&jql=${queryName}&layoutKey=list-view",
		 "method": "POST",
		 "mode": "cors",
		 "credentials": "include"
		`
	return tempvar;
}

const JQLTemplates = { // шаблоны JQL запросов
    defqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    frqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports >= 0 AND text ~ "${testJira.value}" ORDER BY Created',
    zbpqueryitem: 'issuetype in (Bug, Task) AND status = closed AND resolution in ("Won\'t Fix", "Won\'t Do") AND Reports >= 0 AND created >= 2022-01-01 AND text ~ "${testJira.value}" ORDER BY updated',
    iosbugsqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    androidbugsqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    PSqueryitem: 'project = PS AND text ~ "${testJira.value}" ORDER BY Created'
};

for (const [key, template] of Object.entries(JQLTemplates)) { // передача запросов в форму
    Object.defineProperty(window, key, {
        get: function() {
            return template.replace('${testJira.value}', testJira.value);
        }
    });
}

function toggleAndDeactivateQueries(currentId) { // Смена класса кнопок типа запросов
    let queryIds = ['defaultQuery', 'getiosbugs', 'getandroidbugs', 'customQuery', 'favouriteBugs', 'ZBPQuery', 'freshQuery', 'PSquery'];
    
    queryIds.forEach(id => {
        let element = document.getElementById(id);
        if (id === currentId) {
            element.classList.toggle('active-query'); // Переключаем класс для текущего элемента
        } else {
            element.classList.remove('active-query'); // Деактивируем все остальные
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

function formatIssue(item, currentNumber, issueKey, searchText, currentpic, currentIds) {
    const temporarka = isSearchTextMatched(item, searchText) 
        ? highlightSearchText(item, searchText) 
        : replaceItem(item);
    
    return `
        <span style="color: #00FA9A">&#5129;</span>
        <img src="${currentpic}" style="width:20px; height:25px;" title="Приоритеты: ⛔ - Blocker, полностью залитая красная стрелка вверх - Critical, три красные стрелки вверх - Major, три синие вниз - Minor, ⭕ - Trivial">
        ${currentNumber ? `<span class="newcount" style="width:20px; margin-left: 5px; background:#3CB371; padding:2px; padding-left:6px; font-weight:700; border-radius:10px;">${currentNumber} </span>` : ""}
        <a name="buglinks" href="https://jira.skyeng.tech/browse/${issueKey}" target="_blank" style="margin-left:5px; color: #ffe4c4">${temporarka}</a>
        <span name="issueIds" style="display:none">${currentIds}</span>
        <span class="jiraissues" style="margin-left: 5px; cursor: pointer">💬</span>
        ${currentNumber ? `
            <span class="refreshissues" style="color:#ADFF2F; margin-left: 1px; cursor: pointer">&#69717;&#120783;</span>
            <span name="addtofavourites" style="margin-left: 4px; cursor:pointer;" title="Добавить задачу в Избранное">🤍</span>
        ` : ""}
        </br>
    `;
}

function isSearchTextMatched(item, searchText) {
    const processedItem = replaceItem(item);
    return processedItem && processedItem.toLowerCase().includes(searchText.toLowerCase());
}

function highlightSearchText(item, searchText) {
					const replacePattern = new RegExp(searchText, 'i');
					const replaceValue = `<span style="color:MediumSpringGreen; font-weight:700; text-shadow:1px 2px 5px rgb(0 0 0 / 55%);">${searchText.toUpperCase()}</span>`;
    return replaceItem(item).replace(replacePattern, replaceValue);
    }

function addPageSwitcher(spanCount) { // добавляем страницы для переключения
    if (spanCount <= 1) return;

    let spanElements = "";
    for (let i = 0; i < spanCount; i++) {
        const isActive = i === 0 ? "active" : "";
        spanElements += `<span style="Flex: 1; background: darkslateblue; text-align: center; border: 1px solid steelblue;" class="${isActive}" name="changeList" value="${i * 50}">${i + 1}</span>`;
    }
    document.getElementById('pagesSwitcher').innerHTML = spanElements;
}

function addJiraIssueOnClickEvent(barray, issueKeys) { // обработчик нажатия на задачу
		for (let j = 0; j < barray.length; j++) {
			barray[j].addEventListener('click', function () {
				let chatId = getChatId();
				if (chatId){
					if (window.location.href.includes('tickets/assigned')) {
				sendComment("https://jira.skyeng.tech/browse/" + issueKeys[j])
				}
				fetch("https://skyeng.autofaq.ai/api/conversation/" + chatId + "/payload", {
					"headers": {
						"accept": "*/*",
						"content-type": "application/json",
						"sec-fetch-dest": "empty",
						"sec-fetch-mode": "cors",
						"sec-fetch-site": "same-origin"
					},
				"body": "{\"conversationId\":\"${b[5]}\",\"elements\":[{\"name\":\"taskUrl\",\"value\":\"https://jira.skyeng.tech/browse/" + issueKeys[j] + "\"}]}",
					"method": "POST",
					"mode": "cors",
					"credentials": "include"
				})
			}
		})
		}
}

function addFavouritesOnClickEvent(addtofarr, tagsarray, massivissueids, outputTable) { // добавление в избранное
		for (let v = 0; v < addtofarr.length; v++) {
			addtofarr[v].addEventListener('click', function () {
				addtofarr[v].innerText = "❤";
				for (let x = 0; x < tagsarray.length; x++) {
					if (x == v) {
						let testvar = document.createElement('div');
						testvar.innerHTML = '<p style="margin-bottom:0">' + '<span style="color: #00FA9A">&#5129;</span>' +
							`<a name="favbugs" href="${tagsarray[x].href}" target="_blank" style="color:bisque;">` +
							tagsarray[x].innerHTML + '</a>' +
							`<span name="favissuemassive" style="display:none">${massivissueids[x].innerText}</span>` +
							'<span name="addtonotesbug" style="cursor:pointer;" title="Добавить в комментарий в чат и в ссылку на Jira">💬</span>' +
							'<span name="removefromfavourites" style="cursor:pointer;" title="Удалить задачу из Избранного">❌</span>' +
							'<span name = "increasecount" style="color:#ADFF2F; margin-left: 5px; cursor: pointer">&#69717;&#120783;</span>' + '</p>';
						outputTable.appendChild(testvar);
						favissues.push(testvar.innerHTML);
						localStorage.setItem('bugsarray', JSON.stringify(favissues));
					}
				}
			})
		}
}

function addRefreshIssueOnClickEvent(refreshissuesarr, issueIds) {
		for (let f = 0; f < refreshissuesarr.length; f++) {
			refreshissuesarr[f]..addEventListener('click', function () {

			textArea1.value = '{}'
			textArea2.value = "https://jira.skyeng.tech/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=" + issueIds[f]
			textArea3.value = 'reportscount'
			sendRespbtn.click()

				let count;
				let jira_token;
				let increasedcount;
				setTimeout(async function () {

				let repcount = textArea1.getAttribute('reportscount')
					repcount = await repcount;
					jira_token = repcount.match(/"atl_token":"(.*lin)/)[1]
				textArea1.removeAttribute('reportscount')

					count = repcount.match(/customfield_15410.*?value=.*?(\d+)/)[1];
					count = parseInt(count);
					increasedcount = count + 1;
					increasedcount = increasedcount.toString();
					console.log("count=" + count + " increasedcount " + increasedcount);

					setTimeout(function () {

					textArea1.value = `{
							"headers": {
								"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
								"sec-fetch-mode": "cors",
								"sec-fetch-site": "same-origin",
								"x-requested-with": "XMLHttpRequest",
								"x-sitemesh-off": "true"
										},
						"body": "customfield_15410=${increasedcount}&issueId=${issueIds[f]}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410",
							  "method": "POST",
							  "mode": "cors",
							  "credentials": "include"
								}`
					textArea2.value = "https://jira.skyeng.tech/secure/AjaxIssueAction.jspa?decorator=none"
					textArea3.value = ''
					sendRespbtn.click()
						let newinfocount = document.querySelectorAll('.newcount');
						newinfocount[f].innerHTML = increasedcount;
						increasedcount = "";
					}, 1000);
				}, 1000)
			})
		}
}

let firstJiraParse = false;
		
function getJiraTask() { // поиск задач в jira
    const rezissuetable = JSON.parse(textArea1.getAttribute('getissuetable'));

    if (!rezissuetable) {
        setTimeout(getJiraTask, 1000);
        return;
    }

    textArea1.removeAttribute('getissuetable');

    const { issueKeys, table, issueIds } = rezissuetable.issueTable;
    if (!table) {
        document.getElementById('issuetable').innerHTML = '<a style="margin-left:5px; color: #ffe4c4">Задачь не найдено</a>'
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
		const currentpic = table.match(/https:\/\/jira.skyeng.tech\/images\/icons\/priorities\/.*svg/gm)[i];

        if (currentIssue && currentKey) {
            issues += formatIssue(currentIssue, currentNumber, currentKey, searchText, currentpic, currentIds);
        } else {
            console.error(`Не удалось найти соответствие для индекса: ${i}`);
        }
											}

    document.getElementById('issuetable').innerHTML = issues;

    const foundIssuesAmount = issueKeys.length;
    addPageSwitcher(Math.floor(foundIssuesAmount / 50) + 1);

    document.getElementById('foundIssuesAmount').innerHTML = `Всего найдено задач: ${foundIssuesAmount}`;

	const barray = document.querySelectorAll('.jiraissues');
    addJiraIssueOnClickEvent(barray, issueKeys);

    addFavouritesOnClickEvent(
        document.getElementsByName('addtofavourites'),
        document.getElementsByName('buglinks'),
        document.getElementsByName('issueIds'),
        document.getElementById('favouriteissuetable')
    );

	const refreshissuesarr = document.querySelectorAll('.refreshissues');
	addRefreshIssueOnClickEvent(refreshissuesarr, issueIds);

    setTimeout(() => { issues = []; }, 5000);
    
    switchJiraPages();
}
function switchJiraPages() {
    if (!requesttojiratext) {
        alert("Выполни поиск заново");
        return;
    }

    const pageSwArr = document.getElementsByName('changeList');

    pageSwArr.forEach((page, d) => {
        page.addEventListener('click', function () {
            if (!this.classList.contains('active')) {
                document.getElementById('issuetable').innerHTML = '<span style="color:bisque">Загрузка...</span>';
                
                pageSwArr.forEach(p => p.classList.remove('active'));
                this.classList.add('active');

                const optionsValue = optionsforfetch(requesttojiratext, page.getAttribute('value'));

                textArea1.value = `{${optionsValue}}`;
                textArea2.value = "https://jira.skyeng.tech/rest/issueNav/1/issueTable";
                textArea3.value = 'newPageIssue';
                sendRespbtn.click();

                setTimeout(function() {
                    const rezissuetable = JSON.parse(textArea1.getAttribute('newPageIssue'));
                    textArea1.removeAttribute('newPageIssue');

                    const { issueKeys, table, issueIds } = rezissuetable.issueTable;
                    const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi).filter(filterItems);
                    const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);
                    const searchText = document.getElementById('testJira').value;
                    
                    let issues = '';
                    for (let i = 0; i < rezissuetable.issueTable.displayed; i++) {
                        const currentNumber = matchedNumbers ? matchedNumbers[i] : null;
                        const currentIssue = matchedItems[i];
                        const currentKey = issueKeys[i];
                        const currentIds = issueIds[i];
                        const currentpic = table.match(/https:\/\/jira.skyeng.tech\/images\/icons\/priorities\/.*svg/gm)[i];

                        if (currentIssue && currentKey) {
                            issues += formatIssue(currentIssue, currentNumber, currentKey, searchText, currentpic, currentIds);
                                } else {
                                    console.error("Не удалось найти соответствие для индекса: " + i);
                                            }
                                        }

                                        document.getElementById('issuetable').innerHTML = issues;
                                        
                    const barray = document.querySelectorAll('.jiraissues');
                    addJiraIssueOnClickEvent(barray, issueKeys);

                    addFavouritesOnClickEvent(
                        document.getElementsByName('addtofavourites'),
                        document.getElementsByName('buglinks'),
                        document.getElementsByName('issueIds'),
                        document.getElementById('favouriteissuetable')
                    );

                    const refreshissuesarr = document.querySelectorAll('.refreshissues');
                    addRefreshIssueOnClickEvent(refreshissuesarr, issueIds);
                    
                }, 1000);
            }
        })
    });
			}

document.getElementById('AF_Jira').ondblclick = function (a) { // скрытие окна Jira по двойному клику
    if (checkelementtype(a)) { document.getElementById('AF_Jira').style.display = 'none'; }
}

document.getElementById('hideMej').addEventListener('click', function () { // скрытие окна поиска по Jira
    if (document.getElementById('AF_Jira').style.display == '')
        document.getElementById('AF_Jira').style.display = 'none'
})

document.getElementById('ClearJiraData').addEventListener('click', function () {  // функция очистки полей в форме
    document.getElementById('testJira').value = '';
    document.getElementById('issuetable').innerText = '';
    document.getElementById('foundIssuesAmount').innerText = '';
	ClearPages();
})

function ClearPages() { // Удаляем страницы найденных задачь
	var pagesSwitcher = document.getElementById('pagesSwitcher');

	if (pagesSwitcher.children.length !== 0) {
		while (pagesSwitcher.firstChild) {
			pagesSwitcher.removeChild(pagesSwitcher.firstChild);
		}
	}
}

document.getElementById('jirainstr').addEventListener('click', function () {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-jirasearch%F0%9F%94%8EJiraSearch')
})

function getJiraOpenFormPress() { // открывает поле для работой с JIRA поиском
    if (document.getElementById('AF_Jira').style.display == 'none') {
        document.getElementById('AF_Jira').style.display = ''
		document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
        document.getElementById('idmymenu').style.display = 'none'

        document.getElementById('JQLquery').innerText = defqueryitem;

        function checkJiraToken() {
            // Set initial values for the textarea elements
            textArea1.value = '{}';
            textArea2.value = "https://jira.skyeng.tech/";
            textArea3.value = 'getjiratoken';

            // Click the 'sendResponse' element to trigger the DOMSubtreeModified event
            sendRespbtn.click();

            // Add an event listener for the DOMSubtreeModified event
            document.getElementById("responseTextarea1").addEventListener("DOMSubtreeModified", function () {
                // Get the 'getjiratoken' attribute from the 'responseTextarea1' element
                const jiratknAttr = textArea1.getAttribute('getjiratoken');

                // Check if the 'getjiratoken' attribute is not null
                if (jiratknAttr) {
                    // Check if the 'getjiratoken' attribute matches the regex pattern
                    const regexMatch = jiratknAttr.match(/name="atlassian-token" content="(.*lin)/);
                    if (regexMatch) {
                        // Set the 'jiratkn' variable to the first capturing group of the regex match
                        const jiratkn = regexMatch[1];
                        // Set the inner text of the 'searchjiratknstatus' element to a green checkmark
                        document.getElementById('searchjiratknstatus').innerText = "🟢";
                        console.log(`TOKEN: ${jiratkn}`);
                    } else {
                        // If the regex pattern is not found, show an alert and set the inner text of the 'searchjiratknstatus' element to a red cross
                        alert("Авторизуйтесь в системе Jira, чтобы при поиске запрос был отправлен");
                        document.getElementById('searchjiratknstatus').innerText = "🔴";
                    }
                    // Remove the 'getjiratoken'
                    textArea1.removeAttribute('getjiratoken');
                }
            })
        }

        checkJiraToken()
				
        document.getElementById('RefreshJiraStatus').addEventListener('click', checkJiraToken); // функция повторной проверки авторизации в Jira

        if (localStorage.getItem('bugsarray')) {
            favissues = JSON.parse(localStorage.getItem('bugsarray'));
            document.getElementById('favouriteissuetable').innerHTML = favissues.join(" ");
        }

        document.getElementById('defaultQuery').addEventListener('click', function () { // если выбрана default
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').value = defqueryitem;
            showelemonpages();
        })
		
		document.getElementById('PSquery').addEventListener('click', function () { //Если выбрана PS
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').value = PSqueryitem;
			showelemonpages();
		})

        document.getElementById('getiosbugs').addEventListener('click', function () { // если выбрана ios
            toggleAndDeactivateQueries(this.id);
			showelemonpages();
			document.getElementById('testJira').value = "ios";
            document.getElementById('getJiraTasks').click();
        })

        document.getElementById('getandroidbugs').addEventListener('click', function () { // если выбрана android
            toggleAndDeactivateQueries(this.id);
			showelemonpages();
			document.getElementById('testJira').value = "android";
            document.getElementById('getJiraTasks').click();
        })

        document.getElementById('freshQuery').addEventListener('click', function () { // если выбрана fresh
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').value = frqueryitem;
			showelemonpages();
        })

        document.getElementById('ZBPQuery').addEventListener('click', function () {  // если выбрана fresh
            toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').value = zbpqueryitem;
			showelemonpages();
        })

        document.getElementById('customQuery').addEventListener('click', function () { // если выбрана custom
			toggleAndDeactivateQueries(this.id);
            document.getElementById('JQLquery').oninput = function () {
                localStorage.setItem('customquery', this.value)
            }
            document.getElementById('JQLquery').value = localStorage.getItem('customquery');
			showelemonpages();
        })

        document.getElementById('favouriteBugs').addEventListener('click', function () { // если выбрана ❤ favourite
            if (document.getElementById('favouriteissuetable').style.display != "") {
				toggleAndDeactivateQueries(this.id);
                document.getElementById('issuetable').style.display = "none";
                document.getElementById('fields_jira_search').style.display = "none";
				document.getElementById('foundIssuesAmount').style.display = "none";
				document.getElementById('pagesSwitcher').style.display = "none";
				document.getElementById('favouriteissuetable').style.display = "";

                for (let i = 0; i < document.getElementsByName('removefromfavourites').length; i++) {
                    document.getElementsByName('removefromfavourites')[i].addEventListener('click', function () {
                        let parent = this.parentNode.parentNode;
                        favissues.splice(favissues.indexOf(this.value), 1);
                        localStorage.setItem('bugsarray', JSON.stringify(favissues));
                        parent.removeChild(this.parentNode);
                        sndmsgafterdeletebug() //test
                        plusonecount() // test
                    })
                }

                for (let j = 0; j < document.getElementsByName('addtonotesbug').length; j++) {
                    document.getElementsByName('addtonotesbug')[j].addEventListener('click', function () {
                        sendComment('https://jira.skyeng.tech/browse/' + favissues[j].match(/browse.(\S+)"/)[1])

                        let Chatid = getChatId();
                        fetch("https://skyeng.autofaq.ai/api/conversation/" + Chatid + "/payload", {
                            "headers": {
                                "accept": "*/*",
                                "content-type": "application/json",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin"
                            },
                            "body": `{\"conversationId\":\"${Chatid}\",\"elements\":[{\"name\":\"taskUrl\",\"value\":\"https://jira.skyeng.tech/browse/${favissues[j].match(/browse.(\S+)"/)[1]}\"}]}`,
                            "method": "POST",
                            "mode": "cors",
                            "credentials": "include"
                        })
                    })
                }

                function sndmsgafterdeletebug() {
                    for (let j = 0; j < document.getElementsByName('addtonotesbug').length; j++) {
                        document.getElementsByName('addtonotesbug')[j].addEventListener('click', function () {
                            sendComment(favissues[j].match(/href.=(\S+)/)[1])
                        })
                    }
                }

                let cnttoincrease = document.getElementsByName('increasecount');
                let itarrs = document.getElementsByName('favissuemassive')
                for (let c = 0; c < cnttoincrease.length; c++) {
                     cnttoincrease[c].addEventListener('click', plusonecount);
                }

                function plusonecount() { // функция увеличения +1 в сапорт таб в джира
                    let cnttoincrease = document.getElementsByName('increasecount');
                    let itarrs = document.getElementsByName('favissuemassive')
                    for (let c = 0; c < cnttoincrease.length; c++) {
                        cnttoincrease[c].addEventListener('click', function () {
                            console.log('clicked')

                            textArea1.value = '{}'
                            textArea2.value = "https://jira.skyeng.tech/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=" + itarrs[c].innerText
                            textArea3.value = 'suptabcnt'
                            sendRespbtn.click()

                            let count;
                            let jira_token;
                            let increasedcount;
                            setTimeout(async function () {

                                let repcount = textArea1.getAttribute('suptabcnt')
                                repcount = await repcount;
                                jira_token = repcount.match(/"atl_token":"(.*lin)/)[1]
                                textArea1.removeAttribute('suptabcnt')

                                count = repcount.match(/customfield_15410.*?value=.*?(\d+)/)[1];
                                count = parseInt(count);
                                increasedcount = count + 1;
                                increasedcount = increasedcount.toString();
                                console.log("count=" + count + " increasedcount " + increasedcount);

                                setTimeout(function () {

                                    textArea1.value = `{
											"headers": {
												"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
												"sec-fetch-mode": "cors",
												"sec-fetch-site": "same-origin",
												"x-requested-with": "XMLHttpRequest",
												"x-sitemesh-off": "true"
														},
											"body": "customfield_15410=${increasedcount}&issueId=${itarrs[c].innerText}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410",
											  "method": "POST",
											  "mode": "cors",
											  "credentials": "include"
												}`
                                    textArea2.value = "https://jira.skyeng.tech/secure/AjaxIssueAction.jspa?decorator=none"
                                    textArea3.value = ''
                                    sendRespbtn.click()

                                    alert(`Support Tab для задачи ${document.getElementsByName('favbugs')[c].href} увеличен на 1 и сейчас равен: ${increasedcount}`)
                                }, 1000);
                            }, 1000)
                        })
                    }
                }
            } else {
                document.getElementById('issuetable').style.display = "none"
                document.getElementById('favouriteissuetable').style.display = "none"
                document.getElementById('favouriteBugs').classList.remove('active-query')
            }
        })
		// end of favouritebugs

        document.getElementById('getJiraTasks').addEventListener('click', function () {
			ClearPages();

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
					requesttojiratext = encodeURI(document.getElementById('JQLquery').value);
					textArea1.value = `{${optionsforfetch(requesttojiratext, 0)}}`;
					break;
				}
			}
		
			textArea2.value = "https://jira.skyeng.tech/rest/issueNav/1/issueTable";
			textArea3.value = 'getissuetable';
			sendRespbtn.click();
		
			setTimeout(getJiraTask, 1000);					
})

        // Просмотр таски по джира по ее коду и номеру
        document.getElementById('getJiraTasks').ondblclick = function () {
            if (document.getElementById('AF_Jira').style.display == 'none') {
                document.getElementById('AF_Jira').style.display = ''
            }

            let rezissuetable;

            textArea1.value = `{}`
            textArea2.value = "https://jira.skyeng.tech/rest/quicksearch/1.0/productsearch/search?q=" + document.getElementById('testJira').value;
            textArea3.value = 'getissuetable1'
            sendRespbtn.click()

            async function getJiraTask1() {

                rezissuetable = JSON.parse(textArea1.getAttribute('getissuetable1'))
                rezissuetable = await rezissuetable;
                textArea1.removeAttribute('getissuetable1')
                if (rezissuetable != null) {
                    let issues = [];
                    issues = '<span style="color: #00FA9A">&#5129;</span>' + '<a href="' + rezissuetable[0].items[0].url + '" onclick="" target="_blank" style="color: #ffe4c4">' + rezissuetable[0].items[0].subtitle + " - " + rezissuetable[0].items[0].title + '</a>' + " " + '<span class = "jiraissues" style="margin-left: 10px; cursor: pointer">💬</span>';

                    document.getElementById('issuetable').innerHTML = issues;

                    let barray = document.querySelector('.jiraissues');
                    barray.addEventListener('click', function () {
                        sendComment(rezissuetable[0].items[0].url)
                        let b = document.URL.split('/')
                        fetch("https://skyeng.autofaq.ai/api/conversation/" + b[5] + "/payload", {
                            "headers": {
                                "accept": "*/*",
                                "content-type": "application/json",
                                "sec-fetch-dest": "empty",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-origin"
                            },
                            "body": "{\"conversationId\":\"${b[5]}\",\"elements\":[{\"name\":\"taskUrl\",\"value\":\"" + rezissuetable[0].items[0].url + "\"}]}",
                            "method": "POST",
                            "mode": "cors",
                            "credentials": "include"
                        })
                    })

                    setTimeout(function () { issues = []; testJira.value = ""; }, 5000)
                }
            }

            setTimeout(getJiraTask1, 1000)
        }

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
		document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    }
	
	 document.getElementById('idmymenu').style.display = 'none'
}