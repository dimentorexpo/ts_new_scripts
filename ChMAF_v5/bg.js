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
  if (request.action === 'getGroupList') { // получение списка группы в модуле GrList.js
    let tmp = request.tmp; // Получаем переменную tmp из сообщения
    fetch(`https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${tmp}`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => {
      console.error(error);
      sendResponse({ error: error });
    });
    return true;
  }
  
  if (request.action === 'getUserCrmName') { // получение фамилии и имени пользователя в модуле GrList.js
	  let sid = request.sid
	  fetch(`https://backend.skyeng.ru/api/persons/${sid}?crm2=true&debugParam=person-page`, {
		"method": "GET",
		"credentials": "include"
	  }) 
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => {
      console.error(error);
      sendResponse({ error: error });
    });
    return true;
  }
  
    if (request.action === 'getLoginer') { // получение логиннера (сперва пробуем для тестовых учеток, а дальше может и в остальных кусках)
	  let userid = request.userid
		fetch("https://id.skyeng.ru/admin/auth/login-links", {
		  "headers": {
			"content-type": "application/x-www-form-urlencoded",
			"sec-fetch-site": "same-origin",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1"
		  },
		  "referrer": "https://id.skyeng.ru/admin/auth/login-links",
		  "referrerPolicy": "strict-origin-when-cross-origin",
		  "body":  `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${userid}&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru&login_link_form%5Bpromocode%5D=&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=&login_link_form%5B_token%5D`,
		  "method": "POST",
		  "mode": "cors",
		  "credentials": "include"
		})
    .then(response => response.json())
    .then(data => sendResponse(data))
    .catch(error => {
      console.error(error);
      sendResponse({ error: error });
    });
    return true;
  }
  
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

