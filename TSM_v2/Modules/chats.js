/* =========================================================
   TSM Chat Menu — добавление / удаление чата между пользователями
   ========================================================= */

const win_addChatMenu = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">💬 Чат между пользователями</span>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hideMeAddChatMenu">✕</button>
    </div>
    <div class="tsm-chat-grid">
        <label class="tsm-field-stack">
            <span class="tsm-field-label">ID преподавателя</span>
            <input id="userid1" class="tsm-input" inputmode="numeric" autocomplete="off" placeholder="teacherId">
        </label>
        <label class="tsm-field-stack">
            <span class="tsm-field-label">ID второго участника</span>
            <input id="userid2" class="tsm-input" inputmode="numeric" autocomplete="off" placeholder="userId">
        </label>
    </div>
    <div class="tsm-action-row tsm-mt-12">
        <button type="button" class="tsm-btn tsm-btn-primary" id="addChat">Добавить чат</button>
        <button type="button" class="tsm-btn tsm-btn-danger" id="RemoveChat">Удалить чат</button>
    </div>
    <div id="outputstatus" class="tsm-status" role="status"></div>
</div>`;

const CHAT_MANAGEMENT_URL = "https://communications.skyeng.ru/gateway/support/chat-management";
const CHAT_FORM_BOUNDARY = "----TSMChatFormBoundary7f3a9c";

const wintAddChatMenu = createTSMWindow("AFMS_addChatMenu", "winTopAddChatMenu", "winLeftAddChatMenu", win_addChatMenu);
wintAddChatMenu.className = "tsm-window tsm-window-chat";

/* FIX: по RFC 2046 каждая граница в теле начинается с "--" + boundary.
   Раньше в теле стоял boundary без префикса, и сервер получал битое тело формы. */
function buildChatFormData(parts) {
    const body = parts.map(([name, value]) =>
        `--${CHAT_FORM_BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
    ).join("");
    return `${body}--${CHAT_FORM_BOUNDARY}--\r\n`;
}

function buildChatManagementOptions(firstUserId, secondUserId, action) {
    return {
        method: "POST",
        credentials: "include",
        headers: {
            "accept": "*/*",
            "accept-language": "ru,en;q=0.9,ru-RU;q=0.8",
            "content-type": `multipart/form-data; boundary=${CHAT_FORM_BOUNDARY}`,
            "x-requested-with": "XMLHttpRequest"
        },
        body: buildChatFormData([
            ["first_user_id", firstUserId],
            ["second_user_id", secondUserId],
            ["action", action]
        ]),
        referrer: CHAT_MANAGEMENT_URL,
        referrerPolicy: "strict-origin-when-cross-origin",
        mode: "cors"
    };
}

let chatStatusTimer = null;
function showChatStatus(text, kind) {
    const status = document.getElementById("outputstatus");
    status.textContent = text;
    status.className = `tsm-status tsm-status-${kind} tsm-status-visible`;
    clearTimeout(chatStatusTimer);
    chatStatusTimer = setTimeout(() => {
        status.className = "tsm-status";
    }, 4000);
}

function sendRuntimeMessage(message) {
    return new Promise((resolve) => {
        try {
            chrome.runtime.sendMessage(message, (response) => {
                resolve(chrome.runtime.lastError ? { success: false, error: chrome.runtime.lastError.message } : response);
            });
        } catch (err) {
            resolve({ success: false, error: "Расширение было перезагружено — обновите страницу (F5)" });
        }
    });
}

async function manageChat(action, button) {
    const firstUserId = document.getElementById("userid1").value.replace(/\D/g, "");
    const secondUserId = document.getElementById("userid2").value.replace(/\D/g, "");

    if (!firstUserId || !secondUserId) {
        showChatStatus("Укажите оба ID — только цифры", "error");
        return;
    }
    if (firstUserId === secondUserId) {
        showChatStatus("ID участников совпадают", "error");
        return;
    }

    setBusy(button, true);
    const response = await sendRuntimeMessage({
        action: "getOvercomeCORS",
        fetchURL: CHAT_MANAGEMENT_URL,
        requestOptions: buildChatManagementOptions(firstUserId, secondUserId, action)
    });
    setBusy(button, false);

    if (response?.success) {
        showChatStatus(action === "add" ? "Чат добавлен" : "Чат удалён", action === "add" ? "ok" : "warn");
    } else {
        const verb = action === "add" ? "добавить" : "удалить";
        showChatStatus(`Не удалось ${verb} чат: ${response?.error || "нет ответа"}`, "error");
        console.error("[TSM Чаты]", response);
    }
}

document.getElementById("addChat").addEventListener("click", function () { manageChat("add", this); });
document.getElementById("RemoveChat").addEventListener("click", function () { manageChat("remove", this); });
document.getElementById("hideMeAddChatMenu").onclick = () => { wintAddChatMenu.style.display = "none"; };

["userid1", "userid2"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (event) => {
        if (event.key === "Enter") manageChat("add", document.getElementById("addChat"));
    });
});

async function OpenAddChatMenu() {
    if (!toggleTSMWindow(wintAddChatMenu)) return;
    const firstInput = document.getElementById("userid1");
    if (!firstInput.value) {
        const userId = await getUserId();
        if (userId) firstInput.value = userId;
    }
    document.getElementById(firstInput.value ? "userid2" : "userid1").focus();
}
