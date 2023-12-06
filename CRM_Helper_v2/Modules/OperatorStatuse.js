
var win_OperStatus =  // описание элементов окна оценок от пользователя
	`<div style="display: flex; width: 400px;">
        <span style="width: 400px">
            <span style="cursor: -webkit-grab;">
                <div style="margin: 5px; width: 400px;" id="OpSt_header">
                    <button class="buttonHide" title="скрывает меню" id="hideMeOpSt">hide</button>
					<button class="btnCRM btnCRMsmall" id="clearopersinfo">🧹</button>
                </div>
		    </span>
            <div style="margin: 5px; width: 400px" id="opers_box">
                <p id="operstatustable" style="max-height:400px; margin-left:5px; font-size:16px; color:bisque; overflow:auto;"></p>
            </div>
        </span>
	</div>`;

const wintOperStatus = createWindowCRM('CRM_OperStat', 'winTopOpStat', 'winLeftOpStat', win_OperStatus);
hideWindowOnDoubleClick('CRM_OperStat');

document.getElementById('clearopersinfo').onclick = function () { // кнопка очистки поля
	document.getElementById('operstatustable').innerHTML = "";
}

document.getElementById('btnOperStatus').onclick = function () {

	let readyarr = [];
	let rcnt = 0;
	let dndarr = [];
	let dndcnt = 0;
	let inservicearr = [];
	let inservvcnt = 0;
	let afterservicearr = []
	let aftscnt = 0;
	let timeoutarr = []
	let timeoutcnt = 0;

	if (document.getElementById('CRM_OperStat').style.display == 'none')
		document.getElementById('CRM_OperStat').style.display = ''
	else document.getElementById('CRM_OperStat').style.display = 'none'


	var socket = new WebSocket("wss://telephony.skyeng.ru/phone-stats/?EIO=4&transport=websocket");
	var checksocket = setInterval(function () {
		if (socket.readyState == 1) {
			clearInterval(checksocket)
			socket.send('40/group-413,')
			socket.onmessage = function (event) {
				readyarr = [];
				dndarr = [];
				inservicearr = [];
				afterservicearr = []
				timeoutarr = []
				document.getElementById('operstatustable').innerHTML = ''
				var message = event.data;
				// console.log(message)
				socket.send('3')

				if (message.match(/(:")(\D+)(",)(?="lastStatus":"Ready")/gm) != null) {
					rcnt = message.match(/(:")(\D+)(",)(?="lastStatus":"Ready")/gm).length;
					for (let i = 0; i < message.match(/(:")(\D+)(",)(?="lastStatus":"Ready")/gm).length; i++) {
						readyarr += '🟢 ' + message.match(/(:")(\D+)(",)(?="lastStatus":"Ready")/gm)[i].replaceAll(":", '').replace(",", '').replaceAll('"', '') + '<br>'
					}
				} else rcnt = 0

				if (message.match(/(:")(\D+)(",)(?="lastStatus":"DND")/gm) != null) {
					dndcnt = message.match(/(:")(\D+)(",)(?="lastStatus":"DND")/gm).length;
					for (let i = 0; i < message.match(/(:")(\D+)(",)(?="lastStatus":"DND")/gm).length; i++) {
						dndarr += '🔴 🍔' + message.match(/(:")(\D+)(",)(?="lastStatus":"DND")/gm)[i].replaceAll(":", '').replace(",", '').replaceAll('"', '') + '<br>'
					}
				} else dndcnt = 0

				if (message.match(/(:")(\D+)(",)(?="lastStatus":"InServiceOut")/gm) != null) {
					inservvcnt = message.match(/(:")(\D+)(",)(?="lastStatus":"InServiceOut")/gm).length;
					for (let i = 0; i < message.match(/(:")(\D+)(",)(?="lastStatus":"InServiceOut")/gm).length; i++) {
						inservicearr += '🟡 📞' + message.match(/(:")(\D+)(",)(?="lastStatus":"InServiceOut")/gm)[i].replaceAll(":", '').replace(",", '').replaceAll('"', '') + '<br>'
					}
				} else inservvcnt = 0

				if (message.match(/(:")(\D+)(",)(?="lastStatus":"AfterServiceOut")/gm) != null) {
					aftscnt = message.match(/(:")(\D+)(",)(?="lastStatus":"AfterServiceOut")/gm).length;
					for (let i = 0; i < message.match(/(:")(\D+)(",)(?="lastStatus":"AfterServiceOut")/gm).length; i++) {
						afterservicearr += '🟠 📵' + message.match(/(:")(\D+)(",)(?="lastStatus":"AfterServiceOut")/gm)[i].replaceAll(":", '').replace(",", '').replaceAll('"', '') + '<br>'
					}
				} else aftscnt = 0

				if (message.match(/(:")(\D+)(",)(?="lastStatus":"Timeout")/gm) != null) {
					timeoutcnt = message.match(/(:")(\D+)(",)(?="lastStatus":"Timeout")/gm).length;
					for (let i = 0; i < message.match(/(:")(\D+)(",)(?="lastStatus":"Timeout")/gm).length; i++) {
						timeoutarr += '⭕ ⏳' + message.match(/(:")(\D+)(",)(?="lastStatus":"Timeout")/gm)[i].replaceAll(":", '').replace(",", '').replaceAll('"', '') + '<br>'
					}
				} else timeoutcnt = 0

				document.getElementById('operstatustable').innerHTML = '<div style="background:#768d87; width:96%; padding: 0.3%; padding-bottom: 2px; color:#37ff85; font-weight: 700; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border:1px solid black; padding-left:5px; border-radius:10px; text-align:center;">' + 'Ready' + '<span style="background: orange; color: #00365d; padding-left: 20px; padding-right: 20px; border: 1px solid transparent; float:right; height: 17px; border-radius: 17px;">' + rcnt + '</span>' + '</div>' + readyarr +
					'<div style="background:#768d87; width:96%; padding: 0.3%; padding-bottom: 2px; color:#37ff85; font-weight: 700; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border:1px solid black; padding-left:5px; border-top:0px; border-radius:10px;  text-align:center;">' + 'InService' + '<span style="background: orange; color: #00365d; padding-left: 20px; padding-right: 20px; border: 1px solid transparent; float:right; height: 17px; border-radius: 17px;">' + inservvcnt + '</span>' + '</div>' + inservicearr +
					'<div style="background:#768d87; width:96%; padding: 0.3%; padding-bottom: 2px; color:#37ff85; font-weight: 700; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border:1px solid black; padding-left:5px; border-top:0px; border-radius:10px; text-align:center;">' + 'Afterservice' + '<span style="background: orange; color: #00365d; padding-left: 20px; padding-right: 20px; border: 1px solid transparent; float:right; height: 17px; border-radius: 17px;">' + aftscnt + '</span>' + '</div>' + afterservicearr +
					'<div style="background:#768d87; width:96%; padding: 0.3%; padding-bottom: 2px; color:#37ff85; font-weight: 700; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border:1px solid black; padding-left:5px; border-top:0px; border-radius:10px; text-align:center;">' + 'Timeout' + '<span style="background: orange; color: #00365d; padding-left: 20px; padding-right: 20px; border: 1px solid transparent; float:right; height: 17px; border-radius: 17px;">' + timeoutcnt + '</span>' + '</div>' + timeoutarr +
					'<div style="background:#768d87; width:96%; padding: 0.3%; padding-bottom: 2px; color:#37ff85; font-weight: 700; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border:1px solid black; padding-left:5px; border-top:0px; border-radius:10px; text-align:center;">' + 'DND' + '<span style="background: orange; color: #00365d; padding-left: 20px; padding-right: 20px; border: 1px solid transparent; float:right; height: 17px; border-radius: 17px;">' + dndcnt + '</span>' + '</div>' + dndarr + '<div style="background:#0e9196; width:96%; padding: 0.3%; padding-bottom: 2px; color:#dcdcdc; font-weight: 700; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) -1px 0px 1px, rgb(0 0 0) 0px -1px 1px; border:1px solid black; padding-left:5px; border-top:0px; border-radius:10px; text-align:center;">' + 'Всего операторов в системе:' + '<span style="background: #00b5ff; color: #00365d; padding-left: 20px; padding-right: 20px; border: 1px solid transparent; float:right; height: 17px; border-radius: 17px; text-shadow:rgb(0 0 0) 1px 0px 1px;">' + (+rcnt + inservvcnt + aftscnt + timeoutcnt + dndcnt) + '</span>' + '</div>'
			}
		}
	}, 1000)

	document.getElementById('hideMeOpSt').onclick = function () { // скрытие окна поиска оценок от пользователя
		if (document.getElementById('CRM_OperStat').style.display == '')
			document.getElementById('CRM_OperStat').style.display = 'none'
		socket.send('2')
		document.getElementById('operstatustable').innerHTML = ''
	}
}
