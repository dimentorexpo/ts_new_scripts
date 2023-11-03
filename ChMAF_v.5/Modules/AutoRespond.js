var win_FrozeChat =  // описание формы чтобы не давала чату закрыться
    `<div style="display: flex; width: 400px;">
        <span style="width: 410px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 395px;" id="froze_chat_header">
                                <button title="скрывает меню" id="hidefrozechat" style="width:50px; background: #228B22;">hide</button>
								<button id="clearallchathash">🧹</button>
								<button id="arinfo" style="float:right" title="При добавлении хеша чата и выборе времени, по умолчанию 6 минут, по истечению которого в этот чат автоматически будет отправлен ответ по умолчанию Извините, что заставляю вас ждать, но мне нужно еще несколько минут 🙏">❓</button>
                        </div>
						<div>
							<input id="chatfrozehash" placeholder="Введите хэш чата" title="Введите хеш чата, которые хотите, чтобы через время скрипт отправил ответ от вашего имени" autocomplete="off" type="text" style="text-align: center; width: 300px; color: black;margin-left:5px">
							<input id="frozetimer" value="6" style="width:38px;" oninput="maxLengthCheck(this)" type="number" maxlength="2" min="0" max="59">
							<span style="color:bisque;">min</span>
							<button id="freezechat" title="Задать таймер автоответа">❄</button>
						</div>
			    </span>
                        <div style="margin: 5px; width: 400px" id="chats_hash_box">
                                <p id="chathastable" style="max-height:400px; margin-left:5px; font-size:16px; color:bisque; overflow:auto;"></p>
                        </div>
        </span>
</div>`;

if (localStorage.getItem('winTopFrozeChat') == null) { //начальное положение окна автоответа через время
    localStorage.setItem('winTopFrozeChat', '120');
    localStorage.setItem('winLeftFrozeChat', '295');
}

let wintFrozeChat = document.createElement('div'); // создание окна для заморозки чата
document.body.append(wintFrozeChat);
wintFrozeChat.style = 'min-height: 25px; width: 410px; background: #464451; top: ' + localStorage.getItem('winTopFrozeChat') + 'px; left: ' + localStorage.getItem('winLeftFrozeChat') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintFrozeChat.style.display = 'none';
wintFrozeChat.setAttribute('id', 'AF_FrozeChat');
wintFrozeChat.innerHTML = win_FrozeChat;

wintFrozeChat.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintFrozeChat.offsetLeft;
    let elemTop = wintFrozeChat.offsetTop;

    function onMouseMove(event) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintFrozeChat.style.left = (elemLeft + deltaX) + "px";
      wintFrozeChat.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopFrozeChat', String(elemTop + deltaY));
      localStorage.setItem('winLeftFrozeChat', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};


	document.getElementById('butFrozeChat').onclick = function () {
		let uniqarr = []; //уникальный массив. чтобы не было задвоение одного и того же хеша
		let chathasharr = []; // исходный массив, куда  заносятя все хеши чатов
		let sessid = []; //массив сессий для каждого хеша чата
		let flagtimer = []; // флаг для проверки есть ли на чате таймаут, который выполнит функцию по истечении времени
		let timeoutsarr=[]; // массив таймаутов
		let infoarr = []; // массив выводимого в HTML хеша чата с кнопкой таймера обратного отсчета и отмены
		var intervarr =[]; // массив интервалов
		let cancelflag=[]; // флаг что таймер был отменен
		var startarr=[]; // массив исходного времени когда была нажата кнопка для запуска таймера
		var timerarray=[]; //количество минут для отработки скрипта для каждого добавленного хеша чата, например для одного задали 2 м инуты, для второго 5 и чтобы у каждого был свой отсчет
		
		if (document.getElementById('AF_FrozeChat').style.display == 'none') {
			document.getElementById('AF_FrozeChat').style.display = ''
		    document.getElementById('idmymenu').style.display = 'none'
			document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
		} else {
			document.getElementById('AF_FrozeChat').style.display = 'none'
			document.getElementById('idmymenu').style.display = 'none'
			document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
		} 
		
		document.getElementById('hidefrozechat').onclick = function() {
			document.getElementById('AF_FrozeChat').style.display = 'none'
		}
		
		document.getElementById('freezechat').onclick = async function() {
			
			if (document.getElementById('chatfrozehash').value != '') {
				function secondsToms(d) {
				d = Number(d);
				var m = Math.floor(d % 3600 / 60);
				var s = Math.floor(d % 3600 % 60);
				
				var mDisplay = (m > 0 && m < 10) ? '0' + m + ':' : (m > 0 && m >= 10) ? m + ':' : "00:";
				var sDisplay = (s > 0 && s < 10) ? '0' + s : (s > 0 && s >= 10) ? s : "";
				return mDisplay + sDisplay; 
			}

			// function sndmsgaftertime(session, hashchat) { // функция отправки сообщения в заметки по айди сессии и хешу
				  // let notemsg = '<p>Извините, что заставляю вас ждать, но мне нужно еще несколько минут 🙏</p>';
					
					// fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        // "headers": {
                            // "accept": "*/*",
                            // "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                            // "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryH2CK1t5M3Dc3ziNW",
                            // "sec-fetch-mode": "cors",
                            // "sec-fetch-site": "same-origin"
                        // },
                        // "body": "------WebKitFormBoundaryH2CK1t5M3Dc3ziNW\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + session + "\",\"conversationId\":\"" + hashchat + "\",\"text\":\"" + notemsg + "\",\"isComment\":true}\r\n------WebKitFormBoundaryH2CK1t5M3Dc3ziNW--\r\n",
                        // "method": "POST",
                        // "mode": "cors",
                        // "credentials": "include"
                    // });
			// }
			
			function sndmsgaftertime(session, hashchat) { // функция отправки сообщения в чат по айди сессии и хешу , ее потом включить сейчас для теста использую заметки
				  let notemsg = '<p>Извините, что заставляю вас ждать, но мне нужно еще несколько минут 🙏</p>';

                    fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
                        "headers": {
                            "accept": "*/*",
                            "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
                            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryFeIiMdHaxAteNUHd",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin"
                        },
                        "body": "------WebKitFormBoundaryFeIiMdHaxAteNUHd\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + session + "\",\"conversationId\":\"" + hashchat + "\",\"text\":\"" + notemsg + "\"}\r\n------WebKitFormBoundaryFeIiMdHaxAteNUHd--\r\n",
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
			}
			
			if (flagtimer.indexOf(0) === -1) {
				timerarray = [];
				uniqarr = []; 
				timeoutsarr=[] 
				stopfunc = [];
				flagtimer=[];
				intervarr =[]; 
				chathasharr=[] //testovo proverochka!
				cancelflag=[];
			} 
			
			async function getsesid(arg) { // функция получения Idsession из хеша чата для отправки заметок или сообщений в чат пользователю
				await fetch("https://skyeng.autofaq.ai/api/conversations/" + arg).then(r=>r.json()).then(r=>datachat=r)
				return datachat.sessionId
			}
						
				if (document.getElementById('chatfrozehash').value.split('/').length == 1){
					chathasharr.push(document.getElementById('chatfrozehash').value.trim())
				} else if (document.getElementById('chatfrozehash').value.split('/')[2] == "hdi.skyeng.ru"){
					chathasharr.push(document.getElementById('chatfrozehash').value.split('/')[6])
				} else if (document.getElementById('chatfrozehash').value.split('/')[4] == "assigned"){
					chathasharr.push(document.getElementById('chatfrozehash').value.split('/')[5])
				}
				uniqarr = new Set(chathasharr)
				uniqarr = [...uniqarr]
				document.getElementById('chatfrozehash').value = ''
				document.getElementById('chathastable').innerHTML  = ''
				for (let i=0; i<uniqarr.length; i++) {
					infoarr[i] = document.createElement('div')
					infoarr[i].innerHTML = chathasharr[i] + ' ' + '<button name="frozechattimer"></button>' + ' ' + '<span name="deletetimer" title="Удаляет таймер автоответа" style="cursor:pointer">❌</span>'
					document.getElementById('chathastable').append(infoarr[i])
					cancelflag[i] = 0
						
					if (flagtimer[i] != 0 && cancelflag[i] != 1) {
						flagtimer[i] = 0
						
					timerarray[i] = document.getElementById('frozetimer').value
					console.log(timerarray)
						
					startarr[i] = new Date().getTime();
					intervarr[i] = setInterval(function () {
						var now = timerarray[i] * 60 * 1000 - (new Date().getTime() - startarr[i]);
						if (now <= 0 || flagtimer[i] == 1 && cancelflag[i] == 0) {
							clearInterval(intervarr[i]);
							document.getElementsByName('frozechattimer')[i].innerHTML = "Done!"
						} else document.getElementsByName('frozechattimer')[i].innerHTML = secondsToms(Math.floor(now / 1000));
					}, 300); // the smaller this number, the more accurate the timer will be
																		
						timeoutsarr[i] = setTimeout(async function () {
							sndmsgaftertime(session = await getsesid(uniqarr[i]), uniqarr[i])
							flagtimer[i] = 1;
							console.log(flagtimer)
							clearTimeout(timeoutsarr[i])
						} , document.getElementById('frozetimer').value  * 60 * 1000) //*60  убрал чтобы в секундах бьыстрее тестить
					} 			
				}
				
				console.log(uniqarr)
				
				let removetimerarray = document.getElementsByName('deletetimer');
				for (let i=0; i<removetimerarray.length; i++) {
					removetimerarray[i].onclick = function() {
						clearTimeout(timeoutsarr[i])
						clearInterval(intervarr[i])
						console.log(intervarr)
						cancelflag[i] = 1;
						flagtimer[i] = 1;
						document.getElementsByName('frozechattimer')[i].innerHTML = "Canceled!"
						// chathasharr.splice(i,1)
						//document.getElementsByName('frozechattimer')[i].innerText = "Canceled!"
					}
				}

		} else {
				alert('Не введен хеш чата!. Введите хеш и попробуйте еще раз.')
			}
			
		}
		document.getElementById('clearallchathash').onclick = function() {
			document.getElementById('chathastable').innerHTML = '';
				timerarray = [];
				uniqarr = []; 
				timeoutsarr=[] 
				stopfunc = [];
				flagtimer=[];
				intervarr =[]; 
				chathasharr=[] //testovo proverochka!
				cancelflag=[];
		}
	}