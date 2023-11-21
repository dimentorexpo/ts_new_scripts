chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.name === "ChM") {

			
		if (request.question == 'sendResponse') {
			fetch(request.addr, request.options)
				.then(response => response.text())
				.then(result => { sendResponse({answer: result, respName: request.respName}) });
			return true;
		}
		
    }		

});




