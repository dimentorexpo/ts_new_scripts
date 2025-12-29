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