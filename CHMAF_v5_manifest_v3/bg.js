// Global Variables
chrome.storage.local.set({ KC_addr: 'https://script.google.com/macros/s/AKfycbzV8BHtyD3XUcPjZmb9pwwY-2cwAKx8hTRZKVENpKhdCJYe-hF0rpyDVdUIXBUin326Lw/exec' });
chrome.storage.local.set({ TP_addr: 'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec' });
chrome.storage.local.set({ KC_addrRzrv: 'https://script.google.com/macros/s/AKfycbzn2Lv0uuqXG5-mSWHu2W_fAmeeVJ9WVtT1hNNMAj9z9p5I0WLZnydzTcE8z1H5nuaTiQ/exec' });
chrome.storage.local.set({ TP_addrRzrv: 'https://script.google.com/macros/s/AKfycbyL2uTpWRlajHmtRXpjUq2yiPw6f_t-tHoBglkG-ojoA7ksnqMXr0_BXzhZFk31qV7jmQ/exec' });
chrome.storage.local.set({ TP_addrth: 'https://script.google.com/macros/s/AKfycbzgGszbjUND_GUDNFbKlRrpjrGtEFuCK-mMprFCADI8VFrQxCe01WZ_tXfnxsdEx4EB5w/exec' });
chrome.storage.local.set({ KC_addrth: 'https://script.google.com/macros/s/AKfycbwwSfk_Y4xCsi3jI-TiBxb5ODKGes4vV_dgwnmMBPRTPiCR64AzMzAzIWgxkpbvmO7raQ/exec' });

//Block of requests
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

	if (request.action === 'getFetchRequest') {
		const url = request.fetchURL;
		const requestOptions = request.requestOptions;

		(async () => {
			try {
				const response = await fetch(url, requestOptions);
				if (!response.ok) {
					throw new Error('Network response was not ok (проверь авторизацию в CRM, после чего повтори попытку): ' + response.status + " " + response.statusText);
				}
				const text = await response.text(); // Или response.json(), если ожидается JSON
				sendResponse({ success: true, fetchansver: text });
			} catch (error) {
				sendResponse({ success: false, error: error.message });
			}
		})();

		return true; // Возвращаем true для асинхронной отправки ответа
	}

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