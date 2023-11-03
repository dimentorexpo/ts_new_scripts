var win_addChatMenu = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px;" id="addChatMenuHeader">
                            <button class="commonbtn" title="скрывает меню" id="hideMeAddChatMenu" style="width:50px; background: #228B22;">hide</button>
							<span id="outputstatus" style="display:none; background:#537068; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border-radius: 20px; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); border: 1px solid black; font-weight:700;padding: 5px;"></span>
                        </div>

						<input id="userid1" style="margin-left: 5px; width:100px; text-align:center;" placeholder="teacherId">
						<input id="userid2" style="width:100px; text-align:center;" placeholder="userId #2">
						<button class="commonbtn" id="addChat" style="margin:5px">➕💬</button>
						<button class="commonbtn" id="RemoveChat" style="margin:5px">❌💬</button>
					</span>
				   </div>`;

if (localStorage.getItem('winTopAddChatMenu') == null) { //additional Chat menu
    localStorage.setItem('winTopAddChatMenu', '118');
    localStorage.setItem('winLeftAddChatMenu', '407');
}

let wintAddChatMenu = document.createElement('div');
document.body.append(wintAddChatMenu);
wintAddChatMenu.className = 'wintInitializeChat'
wintAddChatMenu.style = 'display:none;  top: ' + localStorage.getItem('winTopAddChatMenu') + 'px; left: ' + localStorage.getItem('winLeftAddChatMenu') + 'px;';
wintAddChatMenu.setAttribute('id', 'AFMS_addChatMenu');
wintAddChatMenu.innerHTML = win_addChatMenu;

// add chat menu

var listenerAddChatMenu = function (e, a) {
    wintAddChatMenu.style.left = Number(e.clientX - myX9998) + "px";
    wintAddChatMenu.style.top = Number(e.clientY - myY9998) + "px";
    localStorage.setItem('winTopAddChatMenu', String(Number(e.clientY - myY9998)));
    localStorage.setItem('winLeftAddChatMenu', String(Number(e.clientX - myX9998)));
};
wintAddChatMenu.onmousedown = function (a) {
    if (checkelementt(a)) {
        window.myX9998 = a.layerX;
        window.myY9998 = a.layerY;
        document.addEventListener('mousemove', listenerAddChatMenu);
    }
}
wintAddChatMenu.onmouseup = function () { document.removeEventListener('mousemove', listenerAddChatMenu); }

// end add chat menu

document.getElementById('openchataddmenu').onclick = async function () { // открывает меню для удаления и добавления чатов
    if (wintAddChatMenu.style.display == 'none') {
        wintAddChatMenu.style.display = ''

        let sidarr = [];
        document.getElementById('userid1').value = await getUserId();

        document.getElementById('addChat').onclick = function () { //функция добавления чата

		    fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
				"headers": {
					"content-type": "application/json",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-site"
				},
				"referrer": "https://vimbox.skyeng.ru/",
				"referrerPolicy": "strict-origin-when-cross-origin",
				"body": `{\"userId1\":${document.getElementById('userid1').value},\"userId2\":${document.getElementById('userid2').value}}`,
				"method": "POST",
				"mode": "cors",
				"credentials": "include"
			});
			
            console.log('%cChat was added successfully!', 'color:lightgreen; font-weight:700');
            document.getElementById('outputstatus').innerText = "Чат добавлен"
            document.getElementById('outputstatus').style.color = "#48e114"
            document.getElementById('outputstatus').style.display = ""
            setTimeout(() => {
                document.getElementById('outputstatus').innerText = ""
                document.getElementById('outputstatus').style.display = "none"
            }, 3000)
        }

        document.getElementById('RemoveChat').onclick = function () { //функция удаления чата
		
		
		    fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
				"headers": {
					"content-type": "application/json",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-site"
				},
				"referrer": "https://vimbox.skyeng.ru/",
				"referrerPolicy": "strict-origin-when-cross-origin",
				"body": `{\"userId1\":${document.getElementById('userid1').value},\"userId2\":${document.getElementById('userid2').value}}`,
				"method": "DELETE",
				"mode": "cors",
				"credentials": "include"
			});
		
            console.log('%cChat was removed successfully!', 'color:orange; font-weight:700');

            document.getElementById('outputstatus').innerText = "Чат удалён"
            document.getElementById('outputstatus').style.color = "orange"
            document.getElementById('outputstatus').style.display = ""
            setTimeout(() => {
                document.getElementById('outputstatus').innerText = ""
                document.getElementById('outputstatus').style.color = "#48e114"
                document.getElementById('outputstatus').style.display = "none"
            }, 3000)

        }

        document.getElementById('hideMeAddChatMenu').onclick = function () { //функция скрытия меню чатов
            wintAddChatMenu.style.display = 'none'
        }
    }
    else wintAddChatMenu.style.display = 'none'
}