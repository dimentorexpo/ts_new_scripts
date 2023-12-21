var win_ChatMenuWin = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px;" id="addChatMenuHeader">
                            <button class="mainButton buttonHide" title="скрывает меню" id="hideMeChatMenu">hide</button>
							<span id="outputstatuschat" style="display:none; background:#537068; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border-radius: 20px; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); border: 1px solid black; font-weight:700;padding: 5px;"></span>
                        </div>

						<input id="chatuserid1" style="margin-left: 5px; width:100px; text-align:center;" placeholder="teacherId">
						<input id="chatuserid2" style="width:100px; text-align:center;" placeholder="userId #2">
						<button class="mainButton" id="addtoChat" style="margin:5px">➕💬</button>
						<button class="mainButton" id="RemovefromChat" style="margin:5px">❌💬</button>
					</span>
				   </div>`;

var wintChatMenu;

function waitForChatButton() {
	var chatButtonObserver = new MutationObserver(function (mutations, observer) {
		for (var mutation of mutations) {
			if (mutation.addedNodes.length) {
				var chatElement = document.querySelector('.chat');
				if (chatElement) {
					// Вызов функции добавления кнопки чата
					addOpenChatMenuButton();

					// Остановить наблюдение
					chatButtonObserver.disconnect();
					break;
				}
			}
		}
	});

	var config = { childList: true, subtree: true };
	chatButtonObserver.observe(document.body, config);
}

// Вызов функции
waitForChatButton();

function addOpenChatMenuButton() {
	var chatElement = document.querySelector('.chat');
	wintChatMenu = createWindow('AF_addChatMenu', 'winTopAddChatMenu', 'winLeftAddChatMenu', win_ChatMenuWin);
	var chatmenubtn = document.createElement('div');
	chatmenubtn.setAttribute('id', 'AF_chatbtnmenu');
	chatmenubtn.textContent = '💬👷‍♂️';
	chatElement.parentNode.insertBefore(chatmenubtn, chatElement);
	chatmenubtn.addEventListener('click',OpenAddChatMenu);
}

async function OpenAddChatMenu() { // открывает меню для удаления и добавления чатов
	if (wintChatMenu.style.display == 'none') {
		wintChatMenu.style.display = ''

		document.getElementById('chatuserid1').value = await getchatuserid();

		document.getElementById('addtoChat').addEventListener('click', function () { //функция добавления чата
			fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
				"headers": {
					"content-type": "application/json",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-site"
				},
				"referrer": "https://vimbox.skyeng.ru/",
				"referrerPolicy": "strict-origin-when-cross-origin",
				"body": `{\"userId1\":${document.getElementById('chatuserid1').value},\"userId2\":${document.getElementById('chatuserid2').value}}`,
				"method": "POST",
				"mode": "cors",
				"credentials": "include"
			});

			console.log('%cChat was added successfully!', 'color:lightgreen; font-weight:700');
			document.getElementById('outputstatuschat').innerText = "Чат добавлен"
			document.getElementById('outputstatuschat').style.color = "#48e114"
			document.getElementById('outputstatuschat').style.display = ""
			setTimeout(() => {
				document.getElementById('outputstatuschat').innerText = ""
				document.getElementById('outputstatuschat').style.display = "none"
			}, 3000)
		})

		document.getElementById('RemovefromChat').addEventListener('click', function () { //функция удаления чата
			fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
				"headers": {
					"content-type": "application/json",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-site"
				},
				"referrer": "https://vimbox.skyeng.ru/",
				"referrerPolicy": "strict-origin-when-cross-origin",
				"body": `{\"userId1\":${document.getElementById('chatuserid1').value},\"userId2\":${document.getElementById('chatuserid2').value}}`,
				"method": "DELETE",
				"mode": "cors",
				"credentials": "include"
			});

			console.log('%cChat was removed successfully!', 'color:orange; font-weight:700');

			document.getElementById('outputstatuschat').innerText = "Чат удалён"
			document.getElementById('outputstatuschat').style.color = "orange"
			document.getElementById('outputstatuschat').style.display = ""
			setTimeout(() => {
				document.getElementById('outputstatuschat').innerText = ""
				document.getElementById('outputstatuschat').style.color = "#48e114"
				document.getElementById('outputstatuschat').style.display = "none"
			}, 3000)

		})

		document.getElementById('hideMeChatMenu').onclick = function () { //функция скрытия меню чатов
			wintChatMenu.style.display = 'none'
		}
	}
	else wintChatMenu.style.display = 'none'
}

async function getchatuserid() { // получаем Id пользователя
    try {
        const response = await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {
            credentials: "include",
            method: "POST"
        });

        if (response.ok) {
            const data = await response.json();
            const chatuserid = data?.user?.id || '';
            return chatuserid;
        } else {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
    }
}