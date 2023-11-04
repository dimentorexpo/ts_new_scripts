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

  if (request.action === 'getGroupList') {
    const tmp = request.tmp;
    makeFetchRequest(`https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${tmp}`, 'GET')
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(sendErrorResponse);
    return true;
  }

  if (request.action === 'getUserCrmName') {
    const sid = request.sid;
    makeFetchRequest(`https://backend.skyeng.ru/api/persons/${sid}?crm2=true&debugParam=person-page`, 'GET')
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(sendErrorResponse);
    return true;
  }

  if (request.action === 'getLoginer') { // получение логиннера (сперва пробуем для тестовых учеток, а дальше может и в остальных кусках)
    const userid = request.userid;
    makeFetchRequest('https://id.skyeng.ru/admin/auth/login-links', 'POST', {
      login_link_form: {
        identity: '',
        id: userid,
        target: 'https://skyeng.ru',
        promocode: '',
        lifetime: 3600,
        create: '',
        _token: '',
      },
    })
      .then(response => response.text())
      .then(data => sendResponse(data))
      .catch(sendErrorResponse);
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
    makeFetchRequest('https://api.datsy.info/api/slot-event/delete.php', 'POST', { deleteslot: slot })
      .then(response => response.json())
      .then(data => sendResponse(data))
      .catch(sendErrorResponse);
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

