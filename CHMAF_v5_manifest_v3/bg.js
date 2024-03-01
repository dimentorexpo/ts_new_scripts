// Global Variables
chrome.storage.local.set({ TS_addr: 'https://script.google.com/macros/s/AKfycbyuK-HoVzF2v66klEcqNyAKFFqtvVheEe4vLhRz/exec' });
chrome.storage.local.set({ KC_addr: 'https://script.google.com/macros/s/AKfycbzV8BHtyD3XUcPjZmb9pwwY-2cwAKx8hTRZKVENpKhdCJYe-hF0rpyDVdUIXBUin326Lw/exec' });
chrome.storage.local.set({ TP_addr: 'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec' });
chrome.storage.local.set({ KC_addrRzrv: 'https://script.google.com/macros/s/AKfycbzn2Lv0uuqXG5-mSWHu2W_fAmeeVJ9WVtT1hNNMAj9z9p5I0WLZnydzTcE8z1H5nuaTiQ/exec' });
chrome.storage.local.set({ TP_addrRzrv: 'https://script.google.com/macros/s/AKfycbyL2uTpWRlajHmtRXpjUq2yiPw6f_t-tHoBglkG-ojoA7ksnqMXr0_BXzhZFk31qV7jmQ/exec' });
chrome.storage.local.set({ TP_addrth: 'https://script.google.com/macros/s/AKfycbzgGszbjUND_GUDNFbKlRrpjrGtEFuCK-mMprFCADI8VFrQxCe01WZ_tXfnxsdEx4EB5w/exec' });
chrome.storage.local.set({ KC_addrth: 'https://script.google.com/macros/s/AKfycbwwSfk_Y4xCsi3jI-TiBxb5ODKGes4vV_dgwnmMBPRTPiCR64AzMzAzIWgxkpbvmO7raQ/exec' });

//Block of requests
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	function sendErrorResponse(error) {
		console.error(error);
		sendResponse({ error: error });
	}

	function makeFetchRequest(url, method, data) {
		return fetch(url, {
			method,
			credentials: 'include',
			...(data ? { body: JSON.stringify(data) } : {}),
		});
	}

	if (request.action === 'getFetchRequest') { // обработчик универсального запроса
		const url = request.fetchURL;
		const requestOptions = request.requestOptions;

		fetch(url, requestOptions)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok: ' + response.statusText);
				}
				return response.text();
			})
			.then(text => {
				if (text) {
					sendResponse({ success: true, fetchansver: text });
				} else {
					throw new Error('Fetch response not found');
				}
			})
			.catch(error => {
				sendResponse({ success: false, error: error.message });
			});

		return true; // Возвращаем true для асинхронной отправки ответа
	}

	//Блок запросов в CRM2
	if (request.action === 'getUserCrmName') { // Получение информации об ФИ
		const sid = request.sid;
		makeFetchRequest(`https://backend.skyeng.ru/api/persons/${sid}?crm2=true&debugParam=person-page`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === 'getEducationSrv') { // получение общего списка услуг
		makeFetchRequest("https://backend.skyeng.ru/api/products/configurations/", 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === 'getUserServices') { // Получение информации об ФИ
		const userid = request.userid;
		makeFetchRequest(`https://backend.skyeng.ru/api/persons/${userid}/education-services/`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "getUserTasks") { // Получение списка активных задач на пользователе
		const userid = request.userid;
		makeFetchRequest(`https://customer-support.skyeng.ru/task/user/${userid}`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "getUserPhone") { // Получение телефона пользователя
		const userid = request.userid;
		makeFetchRequest(`https://backend.skyeng.ru/api/persons/${userid}/personal-data/?pdType=phone&source=persons.profile`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "getUserEmail") { // Получение email пользователя
		const userid = request.userid;
		makeFetchRequest(`https://backend.skyeng.ru/api/persons/${userid}/personal-data/?pdType=email&source=persons.profile`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "changeLocaleToRu") {
		let userid = request.userId;
		fetch(`https://backend.skyeng.ru/api/persons/general/${userid}`, {
			"headers": {
				"content-type": "application/json",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-site"
			},
			"referrer": "https://crm2.skyeng.ru/",
			"referrerPolicy": "strict-origin-when-cross-origin",
			"body": "{\"serviceLocale\":\"ru\"}",
			"method": "PUT",
			"mode": "cors",
			"credentials": "include"
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			sendResponse({ success: true });
		})
		.catch(error => {
			console.error('Ошибка при смене локали:', error);
			sendErrorResponse('Произошла ошибка при смене локали: ' + error.message);
		});
		return true; // Это необходимо для асинхронной обработки sendResponse
	}
	

	if (request.action === 'checkLessonHistoryPast') { // Просмотреть прошедшие  уроки
		const uchId = request.uchId;
		makeFetchRequest(`https://backend.skyeng.ru/api/students/${uchId}/timetable/lessons-history/?page=0`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === 'checkLessonHistoryFuture') { // Просмотреть предстоящие уроки
		const uchIdNew = request.uchIdNew;
		makeFetchRequest(`https://backend.skyeng.ru/api/students/${uchIdNew}/timetable/future-lessons/`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}
	//Конец блока запросов в CRM2

	// Блок отправки в Google forms отказы от помощи, или же пожелания предложения, поэтому должен универсальный быть, чтобы входящие данные были разные но функция была одна по сути
	if (request.action === 'sentToForms') {
		const url = request.url;
		const body = request.body;
		console.log(url, body);
		fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: body,
		})
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok ' + response.statusText);
			}
			// Отправляем статус успешности запроса
			sendResponse({ success: true });
		})
		.catch(error => {
			console.error('Ошибка при отправке данных в форму:', error);
			sendErrorResponse('Произошла при отправке данных в форму: ' + error.message);
		});
		return true; // Это необходимо для асинхронной обработки sendResponse
	};
	//конец блока отправки в google forms

	//Блок работы с Jira
	if (request.action === 'checkJiraAuth') { // Проверка авторизации в Jira
		makeFetchRequest("https://jira.skyeng.tech", 'GET')
			.then(response => response.text())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === 'getTokenToCreate') { // Получение счетчика Support Tab баги
		const issueId = request.issueId;
		makeFetchRequest(`https://jira.skyeng.tech/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${issueId}`, 'GET')
			.then(response => response.text())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "increaseSupportTab") { // Увеличение счетчика Support Tab на +1
		const newcount = request.newcount;
		const issueId = request.issueId;
		const jira_token = request.jirakey
		fetch("https://jira.skyeng.tech/secure/AjaxIssueAction.jspa?decorator=none", {
			headers: {
				"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-requested-with": "XMLHttpRequest",
				"x-sitemesh-off": "true"
			},
			body: `customfield_15410=${newcount}&issueId=${issueId}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`,
			method: "POST",
			mode: "cors",
			credentials: "include"
		})
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "startJiraSearch") { // Запуска поиска по ключевому слову/фразе 
		const startIndex = request.startIndex;
		const textQuery = request.textQuery;
		fetch("https://jira.skyeng.tech/rest/issueNav/1/issueTable", {
			"headers": {
				"__amdmodulename": "jira/issue/utils/xsrf-token-header",
				"accept": "*/*",
				"sec-fetch-mode": "cors",
				"sec-fetch-site": "same-origin",
				"x-atlassian-token": "no-check",
				"x-requested-with": "XMLHttpRequest"
			},
			"body": `startIndex=${startIndex}&filterId=21266&jql=${textQuery}&layoutKey=list-view`,
			"method": "POST",
			"mode": "cors",
			"credentials": "include"
		})
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "searchForTaskName") { // поиск по коду баги ее названия
		const taskCode = request.taskCode;
		makeFetchRequest(`https://jira.skyeng.tech/rest/quicksearch/1.0/productsearch/search?q=${taskCode}`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	// Конец блока с Jira

	// Блок с инфрой и Jira
	if (request.action === "checkInfraAuth") { // проверка авторизации в системе, чтобы делать запросы
		makeFetchRequest(`https://api-infra.skyeng.ru/api/v1/session`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "checkInfraHistory") { // проверка истории обращений
		const infraOID = request.infraOID;
		makeFetchRequest(`https://api-infra.skyeng.ru/api/v1/rs/requests?reporterId=${infraOID}&approverId=${infraOID}&maxResults=40&page=1`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "checkTimeLinkInTask") { // проверка ссылки на обращение в Time в задаче Jira
		const taskId = request.taskId;
		makeFetchRequest(`https://jira.skyeng.tech/browse/${taskId}`, 'GET')
			.then(response => response.text())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "sendRequestToCreate") { // отправка запроса на создание задачи в QA
		const requestOptions = request.requestOptions
		fetch("https://api-infra.skyeng.ru/api/v1/rs/request", requestOptions)
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "getListOfTypes") { // получение перечня тематика QA канала
		const category = request.category;
		makeFetchRequest(`https://api-infra.skyeng.ru/api/v1/rs/categories/${category}/request-types`, 'GET')
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}

	if (request.action === "getOptionsCommunication") { // получение опций выпадающего списка для communication problems
		const ioperId = request.ioperId;
		fetch(`https://api-infra.skyeng.ru/api/v1/rs/request-types/541/form`, {
			headers: {
				'accept': 'application/json',
				'content-type': 'application/json'
			},
			referrer: 'https://infra.skyeng.ru/',
			body: `{\"reporterId\":${ioperId},\"data\":{}}`,
			method: 'PATCH',
			credentials: 'include'
		})
			.then(response => response.json())
			.then(data => sendResponse(data))
			.catch(sendErrorResponse);
		return true;
	}
	// Конец блока с инфрой
	if (request.name === "ChM") {


		if (request.question == 'sendResponse') {
			fetch(request.addr, request.options)
				.then(response => response.text())
				.then(result => { sendResponse({ answer: result, respName: request.respName }) });
			return true;
		}

	}
	const extensionId = chrome.runtime.id
	if (request.question === "get-extension-id") {
		sendResponse(extensionId)
	}

	if (request.name === 'chm_message') {
		console.log('Received request:', request);
		console.log('Sender:', sender);
		console.log(request)
		if (request.question == 'send_event') {
			const laserExtensionId = "kggpdmfnfmmkneemhknlojemcjmdlpjb";
			console.log(request)
			const callback = (response) => {
				console.log(response)
			}
			const messageValue = request.messageValue
			const tabId = sender.tab.id
			const message = {
				messageValue,
				tabId
			}
			chrome.runtime.sendMessage(laserExtensionId,
				message,
				callback
			);
		}
	}
	
});