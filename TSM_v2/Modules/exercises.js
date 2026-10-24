/* =========================================================
   TSM Exercises — Smartroom, TTC, Комплектации
   ========================================================= */

const EMPHASIS_ICONS = { writing: tsmIcon("pencil", 12), pronunciation: tsmIcon("headphones", 12), speaking: tsmIcon("mic", 12) };

/* ---------- Разметка окон ---------- */

const identityStripHTML = (suffix) => `
<div class="tsm-info-panel">
    <div class="tsm-info-row">
        <span class="tsm-chip tsm-chip-person" id="studname${suffix}"></span>
        <select class="tsm-select tsm-select-student tsm-hidden" id="studselect${suffix}" title="Выбор ученика"></select>
        <span class="tsm-chip" id="studserviceid${suffix}" title="ID услуги"></span>
        <span class="tsm-chip" id="studid${suffix}" title="ID ученика"></span>
        ${suffix ? `<span class="tsm-chip" id="groupid${suffix}" title="ID группы"></span>` : ""}
        <span class="tsm-info-divider" aria-hidden="true"></span>
        <span class="tsm-chip tsm-chip-person tsm-chip-teacher" id="teachname${suffix}"></span>
        <span class="tsm-chip" id="teachdid${suffix}" title="ID преподавателя"></span>
        ${suffix ? `<span class="tsm-chip tsm-chip-status" id="RoomStatus"></span>
        <span class="tsm-chip tsm-chip-violet tsm-hidden" id="variantIdComplectChip">variantId <span id="variantIdValue"></span></span>` : ""}
    </div>
</div>`;

const win_kidsExercises = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">${tsmIcon("monitor", 15)} Smartroom</span>
        <label class="tsm-checkbox-label" title="Не показывать темы без карточек">
            <input type="checkbox" id="hideNullCards">Скрыть пустые темы
        </label>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="RefreshInfoExerciseKids" title="Подставить ссылку текущей страницы" aria-label="Подставить ссылку текущей страницы">${tsmIcon("refresh")}</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hideExercisesSkysmartMenu">${tsmIcon("close")}</button>
    </div>
    <div class="tsm-input-group">
        <input id="roomhashhwkids" class="tsm-input" autocomplete="off" placeholder="Ссылка на комнату или домашку">
        <button type="button" class="tsm-btn" id="getroomdatakids">Загрузить</button>
    </div>
    <div id="identityKids" class="tsm-hidden">${identityStripHTML("")}</div>
    <div id="exercisebarskysmart" class="tsm-exercise-bar"></div>
</div>`;

const win_TTCExercises = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">${tsmIcon("layers", 15)} TTC</span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="RefreshInfoExerciseTTC" title="Подставить хеш текущей страницы" aria-label="Подставить хеш текущей страницы">${tsmIcon("refresh")}</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hideExercisesTTCMenu">${tsmIcon("close")}</button>
    </div>
    <div class="tsm-input-group">
        <input id="roomhashttc" class="tsm-input" autocomplete="off" placeholder="Хеш комнаты TTC">
        <button type="button" class="tsm-btn" id="getroomdatattc">Загрузить</button>
    </div>
    <div id="exercisebarttc" class="tsm-exercise-bar"></div>
</div>`;

const win_complectationExercises = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">${tsmIcon("package", 15)} Комплектации</span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="RefreshInfoExerciseComplect" title="Подставить ссылку текущей страницы" aria-label="Подставить ссылку текущей страницы">${tsmIcon("refresh")}</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" id="hideExercisesComplectMenu" title="Скрыть" aria-label="Скрыть">${tsmIcon("close")}</button>
    </div>
    <div class="tsm-input-group">
        <input id="roomhashhwComplect" class="tsm-input" autocomplete="off" placeholder="Ссылка на комнату">
        <button type="button" class="tsm-btn" id="getroomdataComplect">Загрузить</button>
    </div>
    <div id="identityComplect" class="tsm-hidden">${identityStripHTML("Complect")}</div>
    <div id="exercisebarComplect" class="tsm-exercise-bar"></div>
</div>`;

const wintExercSkysmart = createTSMWindow("AFMS_SkysmartExercInfo", "winTopexercisesSkysmart", "winLeftexercisesSkysmart", win_kidsExercises);
wintExercSkysmart.className = "tsm-window tsm-window-exercises";

const wintExercTTC = createTSMWindow("AFMS_TTCExercInfo", "winTopexercisesTTC", "winLeftexercisesTTC", win_TTCExercises);
wintExercTTC.className = "tsm-window tsm-window-exercises";

const wintComplect = createTSMWindow("AFMS_Complect", "winTopComplect", "winLeftComplect", win_complectationExercises);
wintComplect.className = "tsm-window tsm-window-exercises";

/* ---------- Общие помощники ---------- */

const EMPTY_ROOM_HINT = tsmEmptyState("monitor", "Комната не открыта", "Откройте комнату ученика или вставьте ссылку на неё и нажмите «Загрузить»");

/* Разбор ссылки вида https://vimbox.skyeng.ru/kids/<subject>/room/<hash>
   (и /kids/<subject>/room/test/<hash> для тестовых комнат) */
function parseKidsRoomLink(raw) {
    const value = String(raw || "").trim();
    if (!value) throw new Error("Вставьте ссылку на комнату");
    let url;
    try {
        url = new URL(value, location.origin);
    } catch {
        throw new Error("Некорректная ссылка на комнату");
    }
    const parts = url.pathname.split("/").filter(Boolean);
    const subject = parts[1];
    const isTest = parts[3] === "test";
    const hash = isTest ? parts[4] : parts[3];
    if (!subject || !hash || parts[0] !== "kids") throw new Error("Ссылка не похожа на ссылку комнаты /kids/…/room/…");
    return { subject, hash, isTest };
}

function looksLikeKidsRoom(link) {
    try { parseKidsRoomLink(link); return true; } catch { return false; }
}

function cmsLessonLink(subject, lessonId, stepId) {
    const base = `https://cms.skyeng.ru/${subject}/cms/lesson/${lessonId}`;
    return stepId ? `${base}/cards/${stepId}/edit` : base;
}

function normalizeCard(card) {
    let completeness = card.completeness;
    let score = card.score;
    if (completeness === 100 && score == null) score = 100;
    if (completeness == null) return { completeness: "—", score: "—", done: false, empty: true };
    return { completeness, score: score ?? "—", done: completeness >= 100, empty: false };
}

function cardDisplayName(card) {
    const icon = EMPHASIS_ICONS[card.emphasis];
    return escapeHTML(card.name) + (icon ? ` <span class="tsm-emphasis" title="${escapeHTML(card.emphasis)}">${icon}</span>` : "");
}

function categoryStatsHTML(block) {
    if (!block) return "";
    return `<div class="tsm-stats">
        <div class="tsm-stat"><span class="tsm-stat-value">${escapeHTML(block.completedCardsCount ?? 0)}<span class="tsm-stat-of">/${escapeHTML(block.cardsCount ?? 0)}</span></span><span class="tsm-stat-label">карточек завершено</span></div>
        <div class="tsm-stat"><span class="tsm-stat-value">${escapeHTML(block.completeness ?? 0)}%</span><span class="tsm-stat-label">выполнено</span></div>
        <div class="tsm-stat"><span class="tsm-stat-value">${escapeHTML(block.score ?? "—")}</span><span class="tsm-stat-label">баллов из 100</span></div>
    </div>`;
}

function collapsibleHTML(title, count, inner, open = false) {
    return `<div class="tsm-collapsible${open ? " active" : ""}" role="button" tabindex="0" aria-expanded="${open}">
        <span>${escapeHTML(title)}</span>${count != null ? `<span class="tsm-collapsible-count">${count}</span>` : ""}
    </div>
    <div class="tsm-slide-box${open ? "" : " tsm-hidden"}">${inner}</div>`;
}

/* Один обработчик на контейнер: раскрытие секций + действия по data-action */
function bindExerciseContainer(container, actions) {
    const toggle = (head) => {
        const box = head.nextElementSibling;
        const open = box.classList.contains("tsm-hidden");
        box.classList.toggle("tsm-hidden", !open);
        head.classList.toggle("active", open);
        head.setAttribute("aria-expanded", String(open));
    };
    container.addEventListener("click", (event) => {
        const head = event.target.closest(".tsm-collapsible");
        if (head && container.contains(head)) {
            toggle(head);
            return;
        }
        const actionEl = event.target.closest("[data-action]");
        if (actionEl && actions[actionEl.dataset.action]) actions[actionEl.dataset.action](actionEl);
    });
    container.addEventListener("keydown", (event) => {
        const head = event.target.closest(".tsm-collapsible");
        if (head && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            toggle(head);
        }
    });
}

function setChip(elementId, label, value, copyable = true) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (value == null || value === "") {
        el.classList.add("tsm-hidden");
        return;
    }
    el.classList.remove("tsm-hidden");
    el.innerHTML = `<span class="tsm-chip-label">${escapeHTML(label)}</span>${escapeHTML(value)}`;
    if (copyable) markCopyable(el, String(value));
}

function renderIdentity(suffix, student, teacher, extra = {}, students = [], onSelectStudent = null) {
    const nameChip = document.getElementById(`studname${suffix}`);
    const select = document.getElementById(`studselect${suffix}`);

    if (students && students.length > 1) {
        nameChip?.classList.add("tsm-hidden");
        select?.classList.remove("tsm-hidden");
        if (select) {
            select.innerHTML = students.map((s) =>
                `<option value="${escapeHTML(s.userId)}" ${String(s.userId) === String(student?.userId) ? "selected" : ""}>${escapeHTML(s.name || s.userId)}</option>`
            ).join("");
            select.onchange = (e) => {
                onSelectStudent?.(e.target.value);
            };
        }
    } else {
        select?.classList.add("tsm-hidden");
        nameChip?.classList.remove("tsm-hidden");
        setChip(`studname${suffix}`, "ученик", student?.name, false);
    }

    setChip(`studserviceid${suffix}`, "услуга", student?.educationServiceId);
    setChip(`studid${suffix}`, "ID", student?.userId);
    setChip(`teachname${suffix}`, "преподаватель", teacher?.name, false);
    setChip(`teachdid${suffix}`, "ID", teacher?.userId);
    if (suffix) setChip(`groupid${suffix}`, "группа", extra.groupId);
}

function splitParticipants(participants = []) {
    const students = participants.filter((p) => p.role === "student");
    const teacher = participants.find((p) => p.role !== "student") || null;
    return { students, student: students[0] || null, teacher };
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, { credentials: "include", ...options });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

/* =========================================================
   Smartroom
   ========================================================= */

const smartroomState = { data: null, room: null, selectedStudentId: null };

const hideNullCardsCheckbox = document.getElementById("hideNullCards");
hideNullCardsCheckbox.checked = localStorage.getItem("Nullcards") !== "0";
hideNullCardsCheckbox.addEventListener("change", function () {
    localStorage.setItem("Nullcards", this.checked ? "1" : "0");
    /* Перерисовываем из уже загруженных данных — без повторного запроса */
    if (smartroomState.data) renderSmartroom();
});

async function LoadStep(stepUuid) {
    const data = await fetchJson("https://api-english.skyeng.ru/api/student-cabinet/v1/step-store/load-step", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ stepUuid, last: true, language: "ru", baseDomain: "skyeng.ru" })
    });
    if (data?.id == null) throw new Error("load-step не вернул id шага");
    return String(data.id);
}

async function ResetStepProgress(apiName, userId, stepId, roomHash) {
    try {
        const response = await fetch(`https://api-${apiName}.skyeng.ru/api/v1/store-blocks/delete`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ userId, contentGroupId: stepId, roomHash })
        });
        if (!response.ok) console.error("[TSM] store-blocks/delete:", response.status, response.statusText);
        return response.ok;
    } catch (err) {
        console.error("[TSM] Сбой store-blocks/delete:", err);
        return false;
    }
}

function smartroomCategoryHTML(title, block, subject, isHomework) {
    if (!block) return "";
    const hideEmpty = localStorage.getItem("Nullcards") !== "0";
    let rows = "";

    (block.themes || []).forEach((theme) => {
        const cards = theme.cards || [];
        if (hideEmpty && cards.length === 0) return;
        const lessonId = escapeHTML(theme.meta?.contentLessonId);
        rows += `<tr class="tsm-theme-row"><td colspan="${isHomework ? 8 : 7}">
            <div class="tsm-theme-title">
                <button type="button" class="tsm-btn-save" data-action="copy-cms" data-subtype="${escapeHTML(subject)}" data-lessonid="${lessonId}" title="Скопировать ссылку на урок в CMS" aria-label="Скопировать ссылку на урок в CMS">${tsmIcon("link", 14)}</button>
                <span class="tsm-theme-name" title="${escapeHTML(theme.name)}">${escapeHTML(theme.name)}</span>
            </div>
        </td></tr>`;

        cards.forEach((card, idx) => {
            const { completeness, score, done, empty } = normalizeCard(card);
            const cellClass = empty ? "" : (done ? "tsm-cell-success" : "tsm-cell-warn");
            rows += `<tr class="tsm-card-row">
                <td class="tsm-table-cell-center tsm-cell-num">${idx + 1}</td>
                <td class="tsm-card-name">${cardDisplayName(card)}</td>
                <td class="tsm-table-cell-center">${escapeHTML(score)}</td>
                <td class="tsm-table-cell-center ${cellClass}">${escapeHTML(completeness)}</td>
                <td class="tsm-table-cell-center"><button type="button" class="tsm-btn-save" data-action="copy-cms" data-subtype="${escapeHTML(subject)}" data-lessonid="${lessonId}" data-stepid="${escapeHTML(card.id)}" title="Скопировать ссылку на слайд в CMS" aria-label="Скопировать ссылку на слайд в CMS">${tsmIcon("link", 14)}</button></td>
                <td class="tsm-table-cell-center tsm-text-xs">${toMoscowTime(card.sentAt)}</td>
                <td class="tsm-table-cell-center tsm-text-xs">${toMoscowTime(card.scoreUpdatedAt)}</td>
                ${isHomework ? `<td class="tsm-table-cell-center"><button type="button" class="tsm-btn-reset" data-action="reset-progress" data-stepuuid="${escapeHTML(card.stepUuid)}" data-cardname="${escapeHTML(card.name)}" title="Сбросить прогресс ученика по слайду" aria-label="Сбросить прогресс ученика по слайду">${tsmIcon("reset", 14)}</button></td>` : ""}
            </tr>`;
        });
    });

    const table = `<div class="tsm-table-scroll"><table class="tsm-slide-table">
        <thead><tr class="tsm-table-header">
            <th>#</th><th>Слайд</th><th>Балл</th><th>%</th><th>CMS</th><th>Задано</th><th>Скор обновлён</th>
            ${isHomework ? "<th>Сброс</th>" : ""}
        </tr></thead>
        <tbody>${rows || `<tr><td colspan="8" class="tsm-table-empty">Нет карточек</td></tr>`}</tbody>
    </table></div>`;

    return collapsibleHTML(title, block.cardsCount, categoryStatsHTML(block) + table);
}

function renderSmartroom() {
    const { data, room } = smartroomState;
    const container = document.getElementById("exercisebarskysmart");
    const { students, teacher } = splitParticipants(data.participants);
    const activeStudent = students.find((s) => String(s.userId) === String(smartroomState.selectedStudentId)) || students[0] || null;
    if (activeStudent) smartroomState.selectedStudentId = String(activeStudent.userId);

    const index = activeStudent ? (data.lessonCards || []).findIndex((c) => String(c.userId) === String(activeStudent.userId)) : -1;

    renderIdentity("", activeStudent, teacher, {}, students, (newStudentId) => {
        smartroomState.selectedStudentId = newStudentId;
        renderSmartroom();
    });
    document.getElementById("identityKids").classList.remove("tsm-hidden");

    if (index < 0) {
        container.innerHTML = tsmEmptyState("monitor", "В комнате не найден план ученика");
        return;
    }
    container.innerHTML =
        smartroomCategoryHTML("🎓 План урока", data.lessonCards?.[index], room.subject, false) +
        smartroomCategoryHTML("💼 План домашки", data.homeworkCards?.[index], room.subject, true);
}

async function loadSmartroom() {
    const button = document.getElementById("getroomdatakids");
    const container = document.getElementById("exercisebarskysmart");
    let room;
    try {
        room = parseKidsRoomLink(document.getElementById("roomhashhwkids").value);
    } catch (err) {
        container.innerHTML = `<div class="tsm-empty">${escapeHTML(err.message)}</div>`;
        return;
    }

    container.innerHTML = tsmSkeleton(6);
    setBusy(button, true);
    try {
        smartroomState.data = await fetchJson(`https://api-${room.subject}.skyeng.ru/api/v2/rooms/${room.hash}`);
        smartroomState.room = room;
        smartroomState.selectedStudentId = null;
        renderSmartroom();
    } catch (err) {
        console.error("[TSM Smartroom]", err);
        container.innerHTML = tsmEmptyState("alert", "Не удалось загрузить комнату", `Проверьте ссылку и авторизацию (${err.message})`, tsmRetryButton());
        container.querySelector(".tsm-empty-retry")?.addEventListener("click", loadSmartroom);
    } finally {
        setBusy(button, false);
    }
}

bindExerciseContainer(document.getElementById("exercisebarskysmart"), {
    "copy-cms": async (el) => {
        const link = cmsLessonLink(el.dataset.subtype, el.dataset.lessonid, el.dataset.stepid);
        if (await copyWithNotify(link, el.dataset.stepid ? "Ссылка на слайд в CMS скопирована" : "Ссылка на урок в CMS скопирована")) flashButton(el, "✓");
    },
    "reset-progress": async (el) => {
        const { room, data, selectedStudentId } = smartroomState;
        const { students } = splitParticipants(data?.participants);
        const student = students.find((s) => String(s.userId) === String(selectedStudentId)) || students[0] || null;
        if (!room || !student) return;

        const confirmed = await tsmConfirm({
            title: "Сброс прогресса",
            message: `Ответы ученика ${student.name} на слайде «${el.dataset.cardname}» будут удалены без возможности восстановления.`,
            okText: "Сбросить",
            danger: true
        });
        if (!confirmed) return;

        el.disabled = true;
        try {
            const stepId = await LoadStep(el.dataset.stepuuid);
            /* FIX: хеш комнаты берётся из загруженной ссылки, а не из адреса страницы */
            const ok = await ResetStepProgress(room.subject, Number(student.userId), stepId, room.hash);
            flashButton(el, ok ? "✓" : "✕", 3000);
            createNotify(ok ? "Прогресс по слайду сброшен" : "Сервер не принял сброс прогресса", ok ? "message" : "error");
        } catch (err) {
            flashButton(el, "✕", 3000);
            createNotify(`Не удалось сбросить прогресс: ${err.message}`, "error");
        } finally {
            el.disabled = false;
        }
    }
});

document.getElementById("getroomdatakids").onclick = loadSmartroom;
document.getElementById("roomhashhwkids").addEventListener("keydown", (e) => { if (e.key === "Enter") loadSmartroom(); });
document.getElementById("RefreshInfoExerciseKids").onclick = () => {
    document.getElementById("roomhashhwkids").value = document.URL;
    loadSmartroom();
};
document.getElementById("hideExercisesSkysmartMenu").onclick = () => { wintExercSkysmart.style.display = "none"; };

function OpenExercisesSmartroom() {
    if (!toggleTSMWindow(wintExercSkysmart)) return;
    wintExercTTC.style.display = "none";
    wintComplect.style.display = "none";
    const input = document.getElementById("roomhashhwkids");
    if (looksLikeKidsRoom(document.URL)) {
        input.value = document.URL;
        loadSmartroom();
    } else if (!smartroomState.data) {
        document.getElementById("exercisebarskysmart").innerHTML = EMPTY_ROOM_HINT;
        input.focus();
    }
}

/* =========================================================
   TTC
   ========================================================= */

function currentTTCHash() {
    return location.host === "ttc.skyeng.ru" ? (document.URL.split("/")[5] || "").split("?")[0] : "";
}

async function getTTCData() {
    const button = document.getElementById("getroomdatattc");
    const container = document.getElementById("exercisebarttc");
    const rhash = document.getElementById("roomhashttc").value.trim();
    if (!rhash) {
        container.innerHTML = '<div class="tsm-empty">Откройте курс TTC или введите хеш комнаты</div>';
        return;
    }

    container.innerHTML = tsmSkeleton(6);
    setBusy(button, true);
    try {
        /* FIX: тело запроса собиралось конкатенацией строк — кавычка в хеше ломала JSON */
        const data = await fetchJson("https://ttc-api.skyeng.ru/api/v1/lesson/join", {
            method: "POST",
            mode: "cors",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ roomHash: rhash })
        });
        const node = data?.participants?.[0]?.nodes?.[0];
        if (!node) throw new Error("в ответе нет данных урока");

        const steps = node.steps || [];
        const items = steps.map((step, i) => `<div class="tsm-ttc-slide-item">
            <span class="tsm-cell-num">${i + 1}</span>
            <span class="tsm-ttc-title" title="${escapeHTML(step.title)}">${escapeHTML(step.title)}</span>
            <span class="tsm-ttc-step-id">${escapeHTML(step.stepId)}</span>
            <button type="button" class="tsm-btn-save-ttc" data-action="copy-ttc" data-stepid="${escapeHTML(step.stepId)}" title="Скопировать ссылку на слайд в CMS" aria-label="Скопировать ссылку на слайд в CMS">${tsmIcon("link", 14)}</button>
            <span class="tsm-ttc-num ${(step.completeness ?? 0) >= 100 ? "tsm-text-ok" : ""}">${escapeHTML(step.completeness ?? 0)}%</span>
            <span class="tsm-ttc-num">${escapeHTML((step.score ?? 0) / 10)}</span>
        </div>`).join("");

        /* FIX: название урока выводилось без экранирования */
        container.innerHTML = `<div class="tsm-ttc-summary">
                <div class="tsm-ttc-summary-title">${escapeHTML(node.title)}</div>
                <div class="tsm-stats">
                    <div class="tsm-stat"><span class="tsm-stat-value">${escapeHTML(node.completeness ?? 0)}%</span><span class="tsm-stat-label">выполнено</span></div>
                    <div class="tsm-stat"><span class="tsm-stat-value">${escapeHTML((node.score ?? 0) / 10)}</span><span class="tsm-stat-label">оценка</span></div>
                    <div class="tsm-stat"><span class="tsm-stat-value">${steps.length}</span><span class="tsm-stat-label">слайдов</span></div>
                </div>
            </div>
            <div class="tsm-ttc-header-row"><span>#</span><span>Слайд</span><span>ID</span><span>CMS</span><span>%</span><span>Балл</span></div>
            ${items || tsmEmptyState("layers", "В уроке нет слайдов")}`;
    } catch (err) {
        console.error("[TSM TTC]", err);
        container.innerHTML = tsmEmptyState("alert", "Не удалось загрузить курс", err.message, tsmRetryButton());
        container.querySelector(".tsm-empty-retry")?.addEventListener("click", () => getTTCData());
    } finally {
        setBusy(button, false);
    }
}

bindExerciseContainer(document.getElementById("exercisebarttc"), {
    "copy-ttc": async (el) => {
        if (await copyWithNotify(`https://content-vimbox.skyeng.ru/cms/stepStore/update/stepId/${el.dataset.stepid}`, "Ссылка на слайд в CMS скопирована")) flashButton(el, "✓");
    }
});

document.getElementById("getroomdatattc").onclick = getTTCData;
document.getElementById("roomhashttc").addEventListener("keydown", (e) => { if (e.key === "Enter") getTTCData(); });
document.getElementById("hideExercisesTTCMenu").onclick = () => { wintExercTTC.style.display = "none"; };
document.getElementById("RefreshInfoExerciseTTC").onclick = () => {
    const hash = currentTTCHash();
    if (!hash) {
        createNotify("Текущая страница — не курс TTC. Введите хеш вручную", "error");
        return;
    }
    document.getElementById("roomhashttc").value = hash;
    getTTCData();
};

function OpenExercisesTTC() {
    if (!toggleTSMWindow(wintExercTTC)) return;
    wintExercSkysmart.style.display = "none";
    wintComplect.style.display = "none";
    const hash = currentTTCHash();
    const input = document.getElementById("roomhashttc");
    if (hash) {
        input.value = hash;
        getTTCData();
    } else {
        /* FIX: подсказка раньше записывалась в value поля и уходила в запрос как хеш */
        document.getElementById("exercisebarttc").innerHTML = tsmEmptyState("layers", "Курс не открыт", "Откройте курс TTC или введите хеш комнаты");
        input.focus();
    }
}

/* =========================================================
   Комплектации
   ========================================================= */

const complectState = { room: null, studentId: "", data: null, selectedStudentId: null };

function complectTableHTML(themes, subject, variantId) {
    let rows = "";
    (themes || []).forEach((theme) => {
        const lessonId = escapeHTML(theme.meta?.contentLessonId);
        rows += `<tr class="tsm-theme-row"><td colspan="7">
            <div class="tsm-theme-title">
                <button type="button" class="tsm-btn-save" data-action="copy-cms" data-subtype="${escapeHTML(subject)}" data-lessonid="${lessonId}" title="Скопировать ссылку на урок в CMS" aria-label="Скопировать ссылку на урок в CMS">${tsmIcon("link", 14)}</button>
                <span class="tsm-theme-name" title="${escapeHTML(theme.name)}">${escapeHTML(theme.name)}</span>
            </div>
        </td></tr>`;

        (theme.cards || []).forEach((card, j) => {
            const { completeness, score, done, empty } = normalizeCard(card);
            const uuid = escapeHTML(card.stepUuid || "");
            rows += `<tr class="tsm-card-row">
                <td class="tsm-table-cell-center tsm-cell-num">${j + 1}</td>
                <td class="tsm-card-name">${cardDisplayName(card)}</td>
                <td class="tsm-table-cell-center">${escapeHTML(score)}</td>
                <td class="tsm-table-cell-center ${empty ? "" : (done ? "tsm-cell-success" : "tsm-cell-warn")}">${escapeHTML(completeness)}</td>
                <td class="tsm-table-cell-center"><button type="button" class="tsm-btn-save" data-action="copy-cms" data-subtype="${escapeHTML(subject)}" data-lessonid="${lessonId}" data-stepid="${escapeHTML(card.id)}" title="Скопировать ссылку на слайд в CMS" aria-label="Скопировать ссылку на слайд в CMS">${tsmIcon("link", 14)}</button></td>
                <td class="tsm-table-cell-center"><button type="button" class="tsm-btn-step" data-action="copy-uuid" data-stepuuid="${uuid}" title="Скопировать stepUuid" aria-label="Скопировать stepUuid">${tsmIcon("copy", 14)}</button></td>
                <td class="tsm-table-cell-center"><button type="button" class="tsm-btn-save-revision" data-action="reset-revision" data-stepuuid="${uuid}" data-variantid="${escapeHTML(variantId || "")}" data-cardname="${escapeHTML(card.name)}" ${variantId ? "" : "disabled"} title="${variantId ? "Сбросить ревизию слайда" : "Сброс недоступен: у комплекта нет variantId"}" aria-label="Сбросить ревизию слайда">${tsmIcon("reset", 14)}</button></td>
            </tr>`;
        });
    });

    return `<div class="tsm-table-scroll"><table class="tsm-exercise-table">
        <thead><tr class="tsm-table-header"><th>#</th><th>Слайд</th><th>Балл</th><th>%</th><th>CMS</th><th>Степ</th><th>Сброс</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7" class="tsm-table-empty">Нет карточек</td></tr>'}</tbody>
    </table></div>`;
}

function blockVariantId(block) {
    return block?.themes?.[0]?.variantId || block?.variantId || "";
}

function renderComplect() {
    const { data, room } = complectState;
    const container = document.getElementById("exercisebarComplect");
    const { students, teacher } = splitParticipants(data.participants);
    const activeStudent = students.find((s) => String(s.userId) === String(complectState.selectedStudentId)) || students[0] || null;
    if (activeStudent) complectState.selectedStudentId = String(activeStudent.userId);

    const index = activeStudent ? (data.lessonCards || []).findIndex((c) => String(c.userId) === String(activeStudent.userId)) : -1;

    renderIdentity("Complect", activeStudent, teacher, { groupId: data.groupInfo?.externalGroupId }, students, (newStudentId) => {
        complectState.selectedStudentId = newStudentId;
        renderComplect();
    });
    renderComplectStatus(data.status, blockVariantId(data.homeworkCards?.[index]));
    document.getElementById("identityComplect").classList.remove("tsm-hidden");

    complectState.studentId = String(activeStudent?.userId ?? "");

    if (index < 0) {
        container.innerHTML = tsmEmptyState("package", "В комнате не найден план ученика");
        return;
    }

    const lesson = data.lessonCards[index];
    const homework = data.homeworkCards?.[index];
    const diagnostic = data.diagnosticsCards?.[index];
    const hasDiagnostic = Array.isArray(diagnostic?.themes) && diagnostic.themes.some((t) => (t.cards || []).length > 0);

    container.innerHTML =
        collapsibleHTML("🎓 План урока", lesson?.cardsCount, categoryStatsHTML(lesson) + complectTableHTML(lesson?.themes, room.subject, blockVariantId(lesson))) +
        (homework ? collapsibleHTML("💼 План домашки", homework.cardsCount, categoryStatsHTML(homework) + complectTableHTML(homework.themes, room.subject, blockVariantId(homework))) : "") +
        (hasDiagnostic ? collapsibleHTML("🧪 Diagnostic", diagnostic.cardsCount, categoryStatsHTML(diagnostic) + complectTableHTML(diagnostic.themes, room.subject, "")) : "");
}

async function loadComplect() {
    const button = document.getElementById("getroomdataComplect");
    const container = document.getElementById("exercisebarComplect");
    const rawLink = document.getElementById("roomhashhwComplect").value.trim();
    let room;
    try {
        room = parseKidsRoomLink(rawLink);
    } catch (err) {
        container.innerHTML = `<div class="tsm-empty">${escapeHTML(err.message)}</div>`;
        return;
    }

    container.innerHTML = tsmSkeleton(6);
    setBusy(button, true);
    try {
        const url = `https://api-${room.subject}.skyeng.ru/api/v2/rooms/${room.hash}${room.isTest ? "" : "?verbosity=only_mine_participants"}`;
        const data = await fetchJson(url, {
            method: room.isTest ? "GET" : "POST",
            mode: "cors",
            headers: { "content-type": "application/json" },
            body: room.isTest ? null : JSON.stringify({ roomHash: rawLink })
        });

        complectState.data = data;
        complectState.room = room;
        complectState.selectedStudentId = null;
        renderComplect();
    } catch (err) {
        console.error("[TSM Комплектации]", err);
        container.innerHTML = tsmEmptyState("alert", "Не удалось загрузить комнату", `Проверьте ссылку и авторизацию (${err.message})`, tsmRetryButton());
        container.querySelector(".tsm-empty-retry")?.addEventListener("click", loadComplect);
    } finally {
        setBusy(button, false);
    }
}

function renderComplectStatus(status, variantId) {
    const statusEl = document.getElementById("RoomStatus");
    statusEl.innerHTML = `<span class="tsm-chip-label">статус</span>${escapeHTML(status || "—")}`;
    statusEl.dataset.state = status === "success" ? "ok" : "warn";

    const variantChip = document.getElementById("variantIdComplectChip");
    const variantValue = document.getElementById("variantIdValue");
    if (variantId) {
        variantValue.textContent = variantId;
        variantChip.classList.remove("tsm-hidden");
        markCopyable(variantChip, String(variantId));
    } else {
        variantChip.classList.add("tsm-hidden");
    }
}

async function resetRevision(el) {
    const { room, studentId } = complectState;
    const stepUuid = el.dataset.stepuuid;
    const variantId = el.dataset.variantid;
    if (!room || !stepUuid) {
        createNotify("У слайда нет stepUuid", "error");
        return;
    }
    /* Без variantId сервер не соберёт contentGroupId — сброс не сработает или заденет чужую группу */
    if (!variantId) {
        createNotify("У слайда нет variantId — сброс ответов недоступен", "error");
        return;
    }

    const confirmed = await tsmConfirm({
        title: "Сброс ревизии",
        message: `Сохранённые ответы на слайде «${el.dataset.cardname}» будут удалены, слайд загрузится в последней ревизии.`,
        okText: "Сбросить ревизию",
        danger: true
    });
    if (!confirmed) return;

    el.disabled = true;
    try {
        const loaded = await fetchJson(`https://api-${room.subject}.skyeng.ru/api/student-cabinet/v1/step-store/load-step`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ stepUuid, variantId, last: true })
        });
        if (!loaded?.id) throw new Error("load-step не вернул id");

        /* FIX: roomHash раньше брался из адреса страницы (для тестовых комнат там «test») */
        const delRes = await fetch(`https://api-${room.subject}.skyeng.ru/api/v1/store-blocks/delete`, {
            method: "POST",
            mode: "cors",
            credentials: "include",
            headers: { "accept": "application/json", "content-type": "application/json" },
            body: JSON.stringify({ userId: studentId, contentGroupId: `${loaded.id}_${variantId}`, roomHash: room.hash })
        });

        if (delRes.ok) {
            flashButton(el, "✓", 2500);
            createNotify("Ревизия сброшена");
        } else {
            flashButton(el, "✕", 2500);
            createNotify(`Ревизия обновлена, но сервер не удалил ответы: HTTP ${delRes.status}`, "error");
        }
    } catch (err) {
        flashButton(el, "✕", 2500);
        createNotify(`Не удалось сбросить ревизию: ${err.message}`, "error");
    } finally {
        el.disabled = false;
    }
}

bindExerciseContainer(document.getElementById("exercisebarComplect"), {
    "copy-cms": async (el) => {
        const link = cmsLessonLink(el.dataset.subtype, el.dataset.lessonid, el.dataset.stepid);
        if (await copyWithNotify(link, el.dataset.stepid ? "Ссылка на слайд в CMS скопирована" : "Ссылка на урок в CMS скопирована")) flashButton(el, "✓");
    },
    "copy-uuid": async (el) => {
        if (!el.dataset.stepuuid) {
            createNotify("У слайда нет stepUuid", "error");
            return;
        }
        if (await copyWithNotify(el.dataset.stepuuid, "stepUuid скопирован")) flashButton(el, "✓");
    },
    "reset-revision": resetRevision
});

document.getElementById("getroomdataComplect").onclick = loadComplect;
document.getElementById("roomhashhwComplect").addEventListener("keydown", (e) => { if (e.key === "Enter") loadComplect(); });
document.getElementById("hideExercisesComplectMenu").onclick = () => { wintComplect.style.display = "none"; };
document.getElementById("RefreshInfoExerciseComplect").onclick = () => {
    document.getElementById("roomhashhwComplect").value = document.URL;
    loadComplect();
};

function OpenExercisesComplect() {
    if (!toggleTSMWindow(wintComplect)) return;
    wintExercSkysmart.style.display = "none";
    wintExercTTC.style.display = "none";
    document.getElementById("AFMS_addMenu").style.display = "none";
    const input = document.getElementById("roomhashhwComplect");
    if (looksLikeKidsRoom(document.URL)) {
        input.value = document.URL;
        loadComplect();
    } else if (!complectState.room) {
        document.getElementById("exercisebarComplect").innerHTML = EMPTY_ROOM_HINT;
        input.focus();
    }
}
