let but = document.createElement('button')
but.style.display = 'none'
but.id = 'sendResponse'
requestOptions = ''
requestAddr = ''
but.onclick = function() {
		var options = JSON.parse(document.getElementById('responseTextarea1').value)
		var addr = document.getElementById('responseTextarea2').value
		var respName = document.getElementById('responseTextarea3').value
		chrome.runtime.sendMessage({name: "ChM", question: 'sendResponse', addr: addr, options: options, respName: respName}, function(response) {
			if(response.respName != '')
				document.getElementById('responseTextarea1').setAttribute(response.respName, response.answer)
	});
}

let inp = document.createElement('textarea')
inp.style.display = 'none'
inp.id = 'responseTextarea1'
let inp2 = document.createElement('textarea')
inp2.style.display = 'none'
inp2.id = 'responseTextarea2'
let inp3 = document.createElement('textarea')
inp3.style.display = 'none'
inp3.id = 'responseTextarea3'

let div = document.createElement('div')
div.style.display = 'none'
div.appendChild(inp)
div.appendChild(inp2)
div.appendChild(inp3)
div.appendChild(but)

document.body.append(div);
