chrome.storage.local.set({ scriptAdrAppVers: 'https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec' });


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === 'getFetchRequest') {
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
});