// Global Variables
chrome.storage.local.set({ TS_addr: 'https://script.google.com/macros/s/AKfycbyuK-HoVzF2v66klEcqNyAKFFqtvVheEe4vLhRz/exec' });
chrome.storage.local.set({ KC_addr: 'https://script.google.com/macros/s/AKfycbzV8BHtyD3XUcPjZmb9pwwY-2cwAKx8hTRZKVENpKhdCJYe-hF0rpyDVdUIXBUin326Lw/exec' });
chrome.storage.local.set({ TP_addr: 'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec' });
chrome.storage.local.set({ KC_addrRzrv: 'https://script.google.com/macros/s/AKfycbzn2Lv0uuqXG5-mSWHu2W_fAmeeVJ9WVtT1hNNMAj9z9p5I0WLZnydzTcE8z1H5nuaTiQ/exec' });
chrome.storage.local.set({ TP_addrRzrv: 'https://script.google.com/macros/s/AKfycbyL2uTpWRlajHmtRXpjUq2yiPw6f_t-tHoBglkG-ojoA7ksnqMXr0_BXzhZFk31qV7jmQ/exec' });
chrome.storage.local.set({ TP_addrth : 'https://script.google.com/macros/s/AKfycbzgGszbjUND_GUDNFbKlRrpjrGtEFuCK-mMprFCADI8VFrQxCe01WZ_tXfnxsdEx4EB5w/exec' });
chrome.storage.local.set({ KC_addrth : 'https://script.google.com/macros/s/AKfycbwwSfk_Y4xCsi3jI-TiBxb5ODKGes4vV_dgwnmMBPRTPiCR64AzMzAzIWgxkpbvmO7raQ/exec' });

//Block of requests
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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

  if (request.action === 'getGroupList') { // получение списка учеников группы
    const tmp = request.tmp;
    makeFetchRequest(`https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${tmp}`, 'GET')
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(sendErrorResponse);
    return true;
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
    const sid = request.sid;
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
	//Конец блока запросов в CRM2
 	  
  if (request.action === 'getLoginer') { // генерация ссылки-логиннера с копирование в буфер обмена
    const userid = request.userid;
    fetch("https://id.skyeng.ru/admin/auth/login-links", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            // ...
        },
        body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${userid}&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=&login_link_form%5B_token%5D`,
        mode: "cors",
        credentials: "include"
    })
    .then(response => response.text())
    .then(textHtml => {
        let domPars = new DOMParser();
        let testlink = domPars.parseFromString(textHtml, 'text/html').querySelectorAll("[value^='https://id.skyeng.ru/auth/login-link/']");
        
        // Выведите последнюю найденную ссылку в консоль
        if (testlink.length > 0) {
            console.log(`Loginner: ${testlink[testlink.length - 1].value}`);
            
            // Создайте элемент input и скопируйте ссылку в буфер обмена
            let copyloginlnk = document.createElement("input");
            copyloginlnk.setAttribute("value", testlink[testlink.length - 1].value);
            document.body.appendChild(copyloginlnk);
            copyloginlnk.select();
            document.execCommand("copy");
            document.body.removeChild(copyloginlnk);
        } else {
            console.error('Ссылки не найдены.');
        }
    })
    .catch(error => {
        console.error(error);
        sendResponse({ error: error });
    });
    return true;
}



  // Блок при работе с Datsy
  if (request.action === 'checkAuthDatsy') { // получение информации авторизован пользователь на сайте Datsy или нет
    makeFetchRequest('https://api.datsy.info/api/auth/check.php', 'GET')
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(sendErrorResponse);
    return true;
  }

  if (request.action === 'getTimeSlots') { // получение информации по времени слотов
    const date = request.date;
    makeFetchRequest(`https://api.datsy.info/api/main-events/?date=${date}`, 'GET')
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(sendErrorResponse);
    return true;
  }

	if (request.action === 'removeTimeSlot') { // удаление занятого слота
	  const slot = request.slottodelete;
	  fetch("https://api.datsy.info/api/slot-event/delete.php", {
		method: "POST",
		headers: {
		  "Content-Type": "application/x-www-form-urlencoded"
		},
		body: `deleteslot=${slot}`,
		credentials: "include"
	  })
	  .then(response => response.json())
	  .then(data => sendResponse(data))
	  .catch(sendErrorResponse);
	  return true;
	}
	
		if (request.action === 'addTimeSlot') { // добавление занятого слота
	  const value = request.value;
	  const time = request.time;
	  const date = request.date;
	  fetch("https://api.datsy.info/api/slot-event/add.php", {
		method: "POST",
		headers: {
		  "Content-Type": "application/x-www-form-urlencoded"
		},
		body: `addinput=${value}&slotname=${time}&date=${date}`,
		credentials: "include"
	  })
	  .then(response => response.json())
	  .then(data => sendResponse(data))
	  .catch(sendErrorResponse);
	  return true;
	}
	
		if (request.action === 'saveTimeSlot') { // сохранение изменений при правке занятого слота
	  const textval = request.textval;
	  const value = request.value
	  fetch("https://api.datsy.info/api/slot-event/save.php", {
		method: "POST",
		headers: {
		  "Content-Type": "application/x-www-form-urlencoded"
		},
		body: `event-text=${textval}&save-slot=${value}`,
		credentials: "include"
	  })
	  .then(response => response.json())
	  .then(data => sendResponse(data))
	  .catch(sendErrorResponse);
	  return true;
	}
	// Конец блока работы с Datsy
		
	//Блок с Testrooms
		if (request.action === 'createTestRoom') { // создание тестовой комнаты
	  const lessonsubjecttype = request.lessonsubjecttype;
	  const randomHash = request.randomHash;
	  const lessontype = request.lessontype;
	  const teacheridforroom = request.teacheridforroom;
	  const studentidforroom = request.studentidforroom;
	  fetch(`https://${lessonsubjecttype}.skyeng.ru/admin/tech-support-room/create?uniqid=${randomHash}`, {
		method: "POST",
		headers: {
		  "Content-Type": "application/x-www-form-urlencoded"
		},
		body: `${randomHash}%5Btype%5D=${lessontype}&${randomHash}%5BteacherId%5D=${teacheridforroom}&${randomHash}%5BstudentIds%5D=${studentidforroom}&btn_create_and_list=`,
		credentials: "include"
	  })
	  .then(response => response.json())
	  .then(data => sendResponse(data))
	  .catch(sendErrorResponse);
	  return true;
	}
	
	//Конец блока с Testrooms
	
	// Блок отправки в Google forms отказы от помощи, или же пожелания предложения, поэтому должен универсальный быть, чтобы входящие данные были разные но функция была одна по сути
	function sendDataToForm(url, body) {
	  return fetch(url, {
		method: 'POST',
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: body,
	  })
		.then(response => response.json())
		.catch(error => {
		  console.error(error);
		  return { error: error };
		});
	}

	  if (request.action === 'sentToForms') {
		const url = request.url;
		const body = request.body;
		
		sendDataToForm(url, body)
		  .then(data => sendResponse(data));
		
		return true;
	  }
	;
	//конец блока отправки в google forms
	
	//Блок работы с Timetable
	if (request.action === 'getTimeData') { // удаление занятого слота
	  const startdate = request.startdate;
	  const enddate = request.enddate;
	  const ticherid = request.ticherid;
	  fetch("https://timetable.skyeng.ru/api/teachers/search", {
		method: "POST",
		headers: {
		  "Content-Type": "application/x-www-form-urlencoded"
		},
		body: `from=${startdate}:00:00&to=${enddate}:00:00&offset=0&filters[teacherIds][]=${ticherid}&callback=getJSONP`,
		credentials: "include"
	  })
	  .then(response => response.json())
	  .then(data => sendResponse(data))
	  .catch(sendErrorResponse);
	  return true;
	}
	//Конец блока с Timetable
	
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
				  headers:{
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
			
	// Конец блока с Jira
});




// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

		// const extensionId = chrome.runtime.id
		    // if (request.question === "get-extension-id") {
			// sendResponse(extensionId)
    // }
// });



// chrome.runtime.onMessageExternal.addListener(function (request, sender, sendResponse) {
    // console.log(request)
    // console.log(sender)
    // if (request.name === 'chm_message') {
        // console.log(request)
        // if (request.question == 'send_event') {
            // const laserExtensionId = "kggpdmfnfmmkneemhknlojemcjmdlpjb";
            // console.log(request)
            // const callback = (response)=>{
                // console.log(response)
            // }
            // const messageValue = request.messageValue
            // const tabId = sender.tab.id
            // const message = {
                // messageValue,
                // tabId
            // }
            // chrome.runtime.sendMessage(laserExtensionId,
                // message,
                // callback
            // );
        // }
    // }
// })

