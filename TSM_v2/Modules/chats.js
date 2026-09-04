/* =========================================================
   TSM Chat Menu
   ========================================================= */

const win_addChatMenu = `
<div class="tsm-window-grab">
    <div class="tsm-window-header" id="addChatMenuHeader">
        <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hideMeAddChatMenu">Скрыть</button>
        <span id="outputstatus" class="tsm-status"></span>
    </div>
    <div class="tsm-search-row">
        <input id="userid1" class="tsm-input tsm-input-centered" style="width:100px;" placeholder="teacherId">
        <input id="userid2" class="tsm-input tsm-input-centered" style="width:100px;" placeholder="userId #2">
        <button class="tsm-btn" id="addChat">➕💬</button>
        <button class="tsm-btn" id="RemoveChat">❌💬</button>
    </div>
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
    status.style.display = "inline-block";
    status.style.background = `linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4))`;
    status.style.color = color;
    status.style.borderColor = color;
    status.style.borderRadius = "20px";
    status.style.border = `1px solid ${color}`;
    status.style.boxShadow = `0 0 12px ${color}40`;
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
