/* =========================================================
   TSM Chat Menu
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

const CHAT_MANAGEMENT_URL = "https://communications.skyeng.ru/gateway/support/chat-management";
const FORM_BOUNDARY = "----WebKitFormBoundarywHqL89nNTDBBlpUo";

const wintAddChatMenu = createTSMWindow("AFMS_addChatMenu", "winTopAddChatMenu", "winLeftAddChatMenu", win_addChatMenu);
wintAddChatMenu.className = "tsm-window tsm-window-chat";

function buildFormData(parts) {
    const body = parts.map(([name, value]) =>
        `${FORM_BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
    ).join("");
    return body + `${FORM_BOUNDARY}--\r\n`;
}

function buildChatManagementOptions(firstUserId, secondUserId, action) {
    return {
        method: "POST",
        credentials: "include",
        headers: {
            "accept": "*/*",
            "accept-language": "ru,en;q=0.9,ru-RU;q=0.8",
            "content-type": `multipart/form-data; boundary=${FORM_BOUNDARY}`,
            "x-requested-with": "XMLHttpRequest"
        },
        body: buildFormData([
            ["first_user_id", firstUserId],
            ["second_user_id", secondUserId],
            ["action", action]
        ]),
        referrer: CHAT_MANAGEMENT_URL,
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors"
    };
}

function showChatStatus(text, color) {
    const status = document.getElementById("outputstatus");
    status.innerText = text;
    status.style.color = color;
    status.style.display = "";
    setTimeout(() => {
        status.innerText = "";
        status.style.display = "none";
    }, 3000);
}

function manageChat(action, successText, successColor) {
    const firstUserId = document.getElementById("userid1").value;
    const secondUserId = document.getElementById("userid2").value;

    chrome.runtime.sendMessage(
        { action: "getOvercomeCORS", fetchURL: CHAT_MANAGEMENT_URL, requestOptions: buildChatManagementOptions(firstUserId, secondUserId, action) },
        (response) => {
            if (response && response.success) {
                console.log(`%cChat was ${action === "add" ? "added" : "removed"} successfully!`, "color:lightgreen; font-weight:700");
                showChatStatus(successText, successColor);
            } else {
                console.log(`Ошибка при ${action === "add" ? "добавлении" : "удалении"} чата`);
            }
        }
    );
}

document.getElementById("addChat").addEventListener("click", () => manageChat("add", "Чат добавлен", "#48e114"));
document.getElementById("RemoveChat").addEventListener("click", () => manageChat("remove", "Чат удалён", "orange"));
document.getElementById("hideMeAddChatMenu").onclick = () => { wintAddChatMenu.style.display = "none"; };

async function OpenAddChatMenu() {
    const willShow = wintAddChatMenu.style.display === "none";
    wintAddChatMenu.style.display = willShow ? "" : "none";
    if (willShow) {
        const userId = await getUserId();
        if (userId) document.getElementById("userid1").value = userId;
    }
}
