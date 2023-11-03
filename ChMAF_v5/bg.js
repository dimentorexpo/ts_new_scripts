chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	    if (request.name === "chmaf") {
			let answer;
		}
})


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


//////////////////////////////////////////////////////////////


chrome.storage.local.set({ TS_addr: 'https://script.google.com/macros/s/AKfycbyuK-HoVzF2v66klEcqNyAKFFqtvVheEe4vLhRz/exec' });
chrome.storage.local.set({ KC_addr: 'https://script.google.com/macros/s/AKfycbzV8BHtyD3XUcPjZmb9pwwY-2cwAKx8hTRZKVENpKhdCJYe-hF0rpyDVdUIXBUin326Lw/exec' });
chrome.storage.local.set({ TP_addr: 'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec' });
chrome.storage.local.set({ KC_addrRzrv: 'https://script.google.com/macros/s/AKfycbzn2Lv0uuqXG5-mSWHu2W_fAmeeVJ9WVtT1hNNMAj9z9p5I0WLZnydzTcE8z1H5nuaTiQ/exec' });
chrome.storage.local.set({ TP_addrRzrv: 'https://script.google.com/macros/s/AKfycbyL2uTpWRlajHmtRXpjUq2yiPw6f_t-tHoBglkG-ojoA7ksnqMXr0_BXzhZFk31qV7jmQ/exec' });

