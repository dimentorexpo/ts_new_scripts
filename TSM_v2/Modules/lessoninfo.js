/* =========================================================
   TSM Lesson Info — информация о комнате
   ========================================================= */

const ORIGIN_VIMBOX = "https://vimbox.skyeng.ru";

const SUBJECTS = new Set([
    "english", "math", "computer-science", "geography", "chess", "social-science",
    "history", "biology", "physics", "literature", "chemistry", "russian", "preschool",
    "it", "programming", "spanish", "german", "french", "chinese", "gaming", "olymp",
    "pre-school", "music", "art"
]);

const CREATION_TYPES = { auto: "Автоматически", manually: "Вручную" };

const win_getLessonInfo = `
<div class="tsm-window-header">
    <span class="tsm-window-title">${tsmIcon("info", 15)} Комната</span>
    <span class="tsm-toolbar-spacer"></span>
    <button type="button" id="RefreshInfo" class="tsm-btn tsm-btn-icon" title="Обновить по текущей странице" aria-label="Обновить по текущей странице">${tsmIcon("refresh")}</button>
    <button type="button" id="ClearInfo" class="tsm-btn tsm-btn-icon" title="Очистить поля" aria-label="Очистить поля">${tsmIcon("trash")}</button>
    <button type="button" id="hideMeLessonInfo" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть">${tsmIcon("close")}</button>
</div>

<div class="tsm-input-group">
    <input id="hashfield" class="tsm-input tsm-input-hash" autocomplete="off" placeholder="Ссылка на комнату или хеш">
    <button type="button" id="searchHash" class="tsm-btn" title="Найти комнату">Найти</button>
</div>

<div id="lessonInfoBody">
    <div class="tsm-card">
        <div class="tsm-card-title">Занятие</div>
        <div class="tsm-field"><span class="tsm-field-label">Предмет</span><span id="subjectnamefield" class="tsm-field-value"></span></div>
        <div class="tsm-field"><span class="tsm-field-label">Создана</span><span id="creationType" class="tsm-field-value"></span></div>
        <div class="tsm-field"><span class="tsm-field-label">Тип</span><span id="lessonType" class="tsm-field-value"></span></div>
        <div class="tsm-field"><span class="tsm-field-label">Статус</span><span id="statusroom" class="tsm-field-value"></span></div>
        <div class="tsm-field"><span class="tsm-field-label">Хеш</span><span id="hashroom" class="tsm-field-value tsm-field-link" title="Клик — скопировать ссылку на комнату"></span></div>
    </div>

    <div class="tsm-card">
        <div class="tsm-card-title">Участники
            <button type="button" id="participantCounter" class="tsm-counter tsm-counter-btn" title="Открыть список участников">0</button>
        </div>
        <div class="tsm-field"><span class="tsm-field-label">Преподаватель</span><span id="partteachid" class="tsm-field-value"></span></div>
        <div class="tsm-field"><span class="tsm-field-label">Ученик</span><span id="partstudid" class="tsm-field-value"></span></div>
    </div>

    <div class="tsm-action-row">
        <button type="button" id="setstclass" class="tsm-btn" disabled title="Вернуть комнату в статус classwork">▶ Classwork</button>
        <button type="button" id="setstsucc" class="tsm-btn" disabled title="Перевести комнату в статус success">✓ Success</button>
    </div>
</div>

<!-- Окно переносится в body при первом открытии -->
<div id="allParticipants" class="tsm-window tsm-window-participants" style="display:none;">
    <div class="tsm-modal-header" id="participantsDragHandle">
        <span class="tsm-modal-title">${tsmIcon("users", 15)} Участники комнаты</span>
        <button type="button" class="tsm-close-modal" id="closeParticipantsBtn" title="Закрыть" aria-label="Закрыть">${tsmIcon("close")}</button>
    </div>
    <input id="searchForParticipant" class="tsm-input" autocomplete="off" placeholder="Поиск по ID или имени">
    <div class="tsm-table-wrapper">
        <table id="participantsOutput" class="tsm-table">
            <thead><tr><th>Роль</th><th>ID</th><th>Имя</th><th>Вход, МСК</th></tr></thead>
            <tbody id="participantsTbody"></tbody>
        </table>
    </div>
</div>`;

const wintLessonInfo = createTSMWindow("AFMS_LessonInfo", "winTopLessonInfo", "winLeftLessonInfo", win_getLessonInfo);
wintLessonInfo.className = "tsm-window tsm-window-lesson";

const DOM = {
    subject: () => document.getElementById("subjectnamefield"),
    status: () => document.getElementById("statusroom"),
    hash: () => document.getElementById("hashroom"),
    lesType: () => document.getElementById("lessonType"),
    particCounter: () => document.getElementById("participantCounter"),
    teacher: () => document.getElementById("partteachid"),
    student: () => document.getElementById("partstudid"),
    creationType: () => document.getElementById("creationType"),
    hashInput: () => document.getElementById("hashfield"),
    btnClass: () => document.getElementById("setstclass"),
    btnSuccess: () => document.getElementById("setstsucc")
};

/* Комната, данные которой сейчас показаны */
let currentLessonRoom = null;

function subjectFromPath(pathname) {
    /* /kids/<subject>/room/<hash> или /<subject>/room/<hash> */
    const parts = pathname.split("/").filter(Boolean);
    const kidsIdx = parts.indexOf("kids");
    if (kidsIdx >= 0 && parts[kidsIdx + 1] && parts[kidsIdx + 2] === "room") {
        const subj = parts[kidsIdx + 1];
        SUBJECTS.add(subj);
        return subj;
    }
    const roomIdx = parts.indexOf("room");
    if (roomIdx > 0 && parts[roomIdx - 1] !== "kids") {
        const subj = parts[roomIdx - 1];
        SUBJECTS.add(subj);
        return subj;
    }
    return parts.find((part) => SUBJECTS.has(part)) || "";
}

function parseRoomURL(rawUrl = location.href) {
    const trimmed = String(rawUrl || "").trim();
    if (!trimmed) throw new Error("Пустая ссылка");

    /* Голый хеш — предмет берём из текущей страницы.
       FIX: раньше брался первый сегмент пути («kids») вместо предмета */
    if (!trimmed.includes("/") && /^[a-z0-9-]{6,}$/i.test(trimmed)) {
        const subjectName = subjectFromPath(location.pathname);
        if (!subjectName) throw new Error("По голому хешу предмет определяется только со страницы комнаты — вставьте полную ссылку");
        return { subjectName, roomHash: trimmed };
    }

    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(trimmed, location.origin);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const roomIndex = pathParts.indexOf("room");
    const subjectName = subjectFromPath(url.pathname);
    const roomHash = roomIndex >= 0 ? pathParts[roomIndex + 1] : pathParts[3];
    if (!subjectName || !roomHash) throw new Error("Ссылка не похожа на ссылку комнаты");
    return { subjectName, roomHash };
}

function getApiEndpoint(subjectName, version) {
    if (!subjectName || !/^[a-z0-9-]+$/i.test(subjectName)) {
        throw new Error(`Некорректный предмет «${subjectName}»`);
    }
    return `https://api-${subjectName}.skyeng.ru/api/v${version}/rooms/`;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, { credentials: "include", ...options });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    if (!text) return { ok: true };
    try { return JSON.parse(text); }
    catch { return { ok: true, raw: text }; }
}

function setStatusButtons(enabled) {
    DOM.btnClass().disabled = !enabled;
    DOM.btnSuccess().disabled = !enabled;
}

/* FIX: «Очистить» раньше прятал кнопки смены статуса навсегда */
function clearUI() {
    ["subject", "status", "hash", "lesType", "teacher", "student", "creationType"].forEach((key) => {
        const el = DOM[key]();
        el.textContent = "";
        el.removeAttribute("title");
        el.dataset.state = "";
    });
    DOM.hashInput().value = "";
    DOM.particCounter().textContent = "0";
    document.getElementById("participantsTbody").innerHTML = "";
    currentLessonRoom = null;
    setStatusButtons(false);
}

function filterParticipants(query) {
    const q = query.toLowerCase();
    const isNumeric = /^\d+$/.test(q);
    document.querySelectorAll("#participantsTbody tr").forEach((row) => {
        const target = row.children[isNumeric ? 1 : 2]?.textContent.toLowerCase() || "";
        row.style.display = !q || target.includes(q) ? "" : "none";
    });
}

function sortParticipants(participants) {
    return [...participants].sort((a, b) => {
        if (a.role === "teacher" && b.role !== "teacher") return -1;
        if (b.role === "teacher" && a.role !== "teacher") return 1;
        if (!a.joinedAt && b.joinedAt) return 1;
        if (!b.joinedAt && a.joinedAt) return -1;
        if (!a.joinedAt && !b.joinedAt) return 0;
        return new Date(a.joinedAt) - new Date(b.joinedAt);
    });
}

function fillParticipantField(target, participant) {
    if (!participant) {
        target.textContent = "—";
        target.removeAttribute("title");
        return;
    }
    target.textContent = participant.userId;
    target.title = `Имя: ${participant.name}\nСоздание: ${toMoscowTime(participant.startAt)}\nПодключение: ${toMoscowTime(participant.joinedAt)}`;
    markCopyable(target, String(participant.userId));
}

function renderParticipantsTable(participants) {
    document.getElementById("participantsTbody").innerHTML = sortParticipants(participants)
        .map((p) => `<tr class="${p.joinedAt ? "" : "tsm-row-muted"}"><td>${p.role === "teacher" ? "Преподаватель" : escapeHTML(p.role)}</td><td>${escapeHTML(p.userId)}</td><td>${escapeHTML(p.name)}</td><td>${toMoscowTime(p.joinedAt)}</td></tr>`)
        .join("");
}

async function loadRoomInfo(subjectName, roomHash, button) {
    setBusy(button, true);
    try {
        const data = await apiRequest(getApiEndpoint(subjectName, 2) + roomHash);
        const participants = Array.isArray(data.participants) ? data.participants : [];

        DOM.status().textContent = data.status ?? "—";
        DOM.status().dataset.state = data.status || "";
        DOM.hash().textContent = data.hash ?? roomHash;
        DOM.lesType().textContent = data.type ?? "—";
        DOM.subject().textContent = subjectName;
        DOM.creationType().textContent = CREATION_TYPES[data.meta?.creationType] || (data.meta?.creationType ? "Через админку" : "—");
        DOM.particCounter().textContent = data.allParticipantsCount ?? participants.length;

        /* Преподаватель и первый ученик показываются всегда, полный список — в отдельном окне */
        fillParticipantField(DOM.teacher(), participants.find((p) => p.role === "teacher"));
        const students = participants.filter((p) => p.role !== "teacher");
        fillParticipantField(DOM.student(), students.length === 1 ? students[0] : null);
        if (students.length > 1) DOM.student().textContent = `${students.length} — см. список`;
        renderParticipantsTable(participants);

        currentLessonRoom = { subjectName, roomHash: data.hash ?? roomHash };
        setStatusButtons(true);
    } catch (e) {
        console.error("[TSM Комната] Ошибка загрузки:", e);
        createNotify(`Не удалось загрузить комнату: ${e.message}`, "error");
    } finally {
        setBusy(button, false);
    }
}

function toggleParticipantsModal() {
    const modal = document.getElementById("allParticipants");
    if (!modal) return;
    if (modal.style.display !== "none") {
        modal.style.display = "none";
        return;
    }
    if (modal.parentNode !== document.body) document.body.appendChild(modal);

    modal.style.display = "block";
    bringToFront(modal);
    modal.style.left = `${Math.max(10, window.innerWidth / 2 - modal.offsetWidth / 2)}px`;
    modal.style.top = "10vh";

    modal.classList.remove("tsm-modal-animate");
    void modal.offsetWidth;
    modal.classList.add("tsm-modal-animate");

    makeDraggable(modal, document.getElementById("participantsDragHandle"));
    document.getElementById("searchForParticipant").focus();
}

async function changeRoomStatus(status, button) {
    if (!currentLessonRoom) {
        createNotify("Сначала загрузите комнату", "error");
        return;
    }
    const { subjectName, roomHash } = currentLessonRoom;

    /* FIX: смена статуса раньше выполнялась без подтверждения */
    const confirmed = await tsmConfirm({
        title: "Смена статуса комнаты",
        message: `Комната ${roomHash} (${subjectName}) получит статус «${status}».`,
        okText: "Изменить статус"
    });
    if (!confirmed) return;

    setBusy(button, true);
    try {
        await apiRequest(getApiEndpoint(subjectName, 1) + roomHash, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status, name: "" })
        });
        createNotify(`Статус комнаты изменён на «${status}»`);
        /* Перезагружаем страницу, только если она и есть эта комната */
        if (location.pathname.includes(roomHash)) setTimeout(() => location.reload(), 1200);
        else loadRoomInfo(subjectName, roomHash);
    } catch (e) {
        console.error("[TSM Комната] Ошибка изменения статуса:", e);
        createNotify(`Не удалось изменить статус: ${e.message}`, "error");
    } finally {
        setBusy(button, false);
    }
}

function openMenu(isSearch, button) {
    if (!isSearch && location.origin !== ORIGIN_VIMBOX) return;
    try {
        const { subjectName, roomHash } = isSearch ? parseRoomURL(DOM.hashInput().value) : parseRoomURL();
        loadRoomInfo(subjectName, roomHash, button);
    } catch (e) {
        if (isSearch) createNotify(e.message, "error");
        else console.info("[TSM Комната] Текущая страница не является комнатой:", e.message);
    }
}

/* Обработчики навешиваются один раз */
DOM.btnClass().onclick = function () { changeRoomStatus("classwork", this); };
DOM.btnSuccess().onclick = function () { changeRoomStatus("success", this); };
DOM.particCounter().onclick = toggleParticipantsModal;
DOM.hash().onclick = async () => {
    if (!currentLessonRoom) return;
    const link = `${ORIGIN_VIMBOX}/kids/${currentLessonRoom.subjectName}/room/${currentLessonRoom.roomHash}`;
    if (await copyToClipboardTSM(link)) createNotify("Ссылка на комнату скопирована");
};
document.getElementById("ClearInfo").onclick = clearUI;
document.getElementById("RefreshInfo").onclick = function () { openMenu(false, this); };
document.getElementById("searchHash").onclick = function () { openMenu(true, this); };
DOM.hashInput().addEventListener("keydown", (event) => {
    if (event.key === "Enter") openMenu(true, document.getElementById("searchHash"));
});
document.getElementById("hideMeLessonInfo").onclick = () => { wintLessonInfo.style.display = "none"; };
document.getElementById("closeParticipantsBtn").onclick = () => {
    document.getElementById("allParticipants").style.display = "none";
};
document.getElementById("searchForParticipant").addEventListener("input", function () {
    filterParticipants(this.value.trim());
});

function OpenLessonInfoMenu() {
    if (toggleTSMWindow(wintLessonInfo)) openMenu(false, document.getElementById("RefreshInfo"));
}
