/* =========================================================
   TSM Chat Menu — NEON GLASS ULTRA Refactored
   ========================================================= */

var win_addChatMenu = `<div style="display: flex;">
    <span style="cursor: -webkit-grab;">
        <div style="margin: 5px;" id="addChatMenuHeader">
            <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hideMeAddChatMenu">hide</button>
            <span id="outputstatus" style="display:none; background:#537068; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border-radius: 20px; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); border: 1px solid black; font-weight:700;padding: 5px;"></span>
        </div>
        <input id="userid1" style="margin-left: 5px; width:100px; text-align:center;" class="tsm-input" placeholder="teacherId">
        <input id="userid2" style="width:100px; text-align:center;" class="tsm-input" placeholder="userId #2">
        <button class="tsm-btn" id="addChat" style="margin:5px">➕💬</button>
        <button class="tsm-btn" id="RemoveChat" style="margin:5px">❌💬</button>
    </span>
</div>`;

const wintAddChatMenu = createTSMWindow('AFMS_addChatMenu', 'winTopAddChatMenu', 'winLeftAddChatMenu', win_addChatMenu);
wintAddChatMenu.className = 'tsm-window tsm-window-chat';

async function OpenAddChatMenu() {
    if (wintAddChatMenu.style.display == 'none') {
        wintAddChatMenu.style.display = '';
        document.getElementById('userid1').value = await getUserId();
        const fetchURLToken = "https://communications.skyeng.ru/gateway/support/chat-management";

        document.getElementById('addChat').addEventListener('click', function () {
            const requestOptionsToken = {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "accept": "*/*",
                    "accept-language": "ru,en;q=0.9,ru-RU;q=0.8",
                    "content-type": "multipart/form-data; boundary=----WebKitFormBoundarywHqL89nNTDBBlpUo",
                    "x-requested-with": "XMLHttpRequest"
                },
                body: `------WebKitFormBoundarywHqL89nNTDBBlpUo\r\nContent-Disposition: form-data; name=\"first_user_id\"\r\n\r\n${document.getElementById('userid1').value}\r\n------WebKitFormBoundarywHqL89nNTDBBlpUo\r\nContent-Disposition: form-data; name=\"second_user_id\"\r\n\r\n${document.getElementById('userid2').value}\r\n------WebKitFormBoundarywHqL89nNTDBBlpUo\r\nContent-Disposition: form-data; name=\"action\"\r\n\r\nadd\r\n------WebKitFormBoundarywHqL89nNTDBBlpUo--\r\n`,
                referrer: "https://communications.skyeng.ru/gateway/support/chat-management",
                referrerPolicy: "strict-origin-when-cross-origin",
                mode: "cors"
            };

            chrome.runtime.sendMessage({ action: 'getOvercomeCORS', fetchURL: fetchURLToken, requestOptions: requestOptionsToken }, function (responseToken) {
                if (responseToken.success) {
                    console.log('%cChat was added successfully!', 'color:lightgreen; font-weight:700');
                    document.getElementById('outputstatus').innerText = "Чат добавлен";
                    document.getElementById('outputstatus').style.color = "#48e114";
                    document.getElementById('outputstatus').style.display = "";
                    setTimeout(() => {
                        document.getElementById('outputstatus').innerText = "";
                        document.getElementById('outputstatus').style.display = "none";
                    }, 3000);
                } else {
                    console.log('Ошибка при добавлении чата');
                }
            });
        });

        document.getElementById('RemoveChat').addEventListener('click', function () {
            const requestOptionsToken = {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "accept": "*/*",
                    "accept-language": "ru,en;q=0.9,ru-RU;q=0.8",
                    "content-type": "multipart/form-data; boundary=----WebKitFormBoundarywHqL89nNTDBBlpUo",
                    "x-requested-with": "XMLHttpRequest"
                },
                body: `------WebKitFormBoundarywHqL89nNTDBBlpUo\r\nContent-Disposition: form-data; name=\"first_user_id\"\r\n\r\n${document.getElementById('userid1').value}\r\n------WebKitFormBoundarywHqL89nNTDBBlpUo\r\nContent-Disposition: form-data; name=\"second_user_id\"\r\n\r\n${document.getElementById('userid2').value}\r\n------WebKitFormBoundarywHqL89nNTDBBlpUo\r\nContent-Disposition: form-data; name=\"action\"\r\n\r\nremove\r\n------WebKitFormBoundarywHqL89nNTDBBlpUo--\r\n`,
                referrer: "https://communications.skyeng.ru/gateway/support/chat-management",
                referrerPolicy: "strict-origin-when-cross-origin",
                mode: "cors"
            };

            chrome.runtime.sendMessage({ action: 'getOvercomeCORS', fetchURL: fetchURLToken, requestOptions: requestOptionsToken }, function (responseToken) {
                if (responseToken.success) {
                    console.log('%cChat was removed successfully!', 'color:orange; font-weight:700');
                    document.getElementById('outputstatus').innerText = "Чат удалён";
                    document.getElementById('outputstatus').style.color = "orange";
                    document.getElementById('outputstatus').style.display = "";
                    setTimeout(() => {
                        document.getElementById('outputstatus').innerText = "";
                        document.getElementById('outputstatus').style.color = "#48e114";
                        document.getElementById('outputstatus').style.display = "none";
                    }, 3000);
                } else {
                    console.log('Ошибка при удалении чата');
                }
            });
        });

        document.getElementById('hideMeAddChatMenu').onclick = function () {
            wintAddChatMenu.style.display = 'none';
        };
    } else {
        wintAddChatMenu.style.display = 'none';
    }
}
