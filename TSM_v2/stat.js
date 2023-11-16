let butctxt = document.createElement('button')
butctxt.style.display = 'none'
butctxt.id = 'sendResponseCtxt'
requestOptions = ''
requestAddr = ''
butctxt.onclick = function() {
		var options = JSON.parse(document.getElementById('inputTextAreaOptions').value)
		var addr = document.getElementById('inputTextAreaURL').value
		var respName = document.getElementById('responseVariable').value
		chrome.runtime.sendMessage({name: "Ctxt", question: 'sendResponse', addr: addr, options: options, respName: respName}, function(response) {
			if(response.respName != '')
				document.getElementById('inputTextAreaOptions').setAttribute(response.respName, response.answer)
	});
}

let inp4 = document.createElement('textarea')
inp4.style.display = 'none'
inp4.id = 'inputTextAreaOptions'
let inp5 = document.createElement('textarea')
inp5.style.display = 'none'
inp5.id = 'inputTextAreaURL'
let inp6 = document.createElement('textarea')
inp6.style.display = 'none'
inp6.id = 'responseVariable'

let divctxt = document.createElement('div')
divctxt.style.display = 'none'
divctxt.appendChild(inp4)
divctxt.appendChild(inp5)
divctxt.appendChild(inp6)
divctxt.appendChild(butctxt)

document.body.append(divctxt);
