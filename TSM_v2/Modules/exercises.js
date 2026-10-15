/* =========================================================
   TSM Exercises — Smartroom, TTC, Комплектации
   ========================================================= */

const EMPHASIS_ICONS = { writing: "✏", pronunciation: "🎧", speaking: "🎙" };

/* ---------- Разметка окон ---------- */

const identityStripHTML = (suffix) => `
<div class="tsm-info-panel">
    <div class="tsm-info-row tsm-info-row-inline">
        <span class="tsm-chip tsm-chip-person" id="studname${suffix}"></span>
        <span class="tsm-chip" id="studserviceid${suffix}" title="ID услуги"></span>
        <span class="tsm-chip" id="studid${suffix}" title="ID ученика"></span>
        ${suffix ? `<span class="tsm-chip" id="groupid${suffix}" title="ID группы"></span>` : ""}
        <span class="tsm-info-divider" aria-hidden="true"></span>
        <span class="tsm-chip tsm-chip-person tsm-chip-teacher" id="teachname${suffix}"></span>
        <span class="tsm-chip" id="teachdid${suffix}" title="ID преподавателя"></span>
        ${suffix ? `<span class="tsm-chip tsm-chip-status" id="RoomStatus"></span>
        <span class="tsm-chip tsm-chip-violet" id="variantIdComplectChip" style="display:none;">variantId <span id="variantIdValue"></span></span>` : ""}
    </div>
</div>`;

const win_kidsExercises = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">🎓 Smartroom</span>
        <label class="tsm-checkbox-label" title="Не показывать темы без карточек">
            <input type="checkbox" id="hideNullCards">Скрыть пустые темы
        </label>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="RefreshInfoExerciseKids" title="Подставить ссылку текущей страницы">♻</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hideExercisesSkysmartMenu">✕</button>
    </div>
    <div class="tsm-input-group">
        <input id="roomhashhwkids" class="tsm-input" autocomplete="off" placeholder="Ссылка на комнату или домашку">
        <button type="button" class="tsm-btn" id="getroomdatakids">Загрузить</button>
    </div>
    <div id="identityKids" style="display:none;">${identityStripHTML("")}</div>
    <div id="exercisebarskysmart" class="tsm-exercise-bar"></div>
</div>`;

const win_TTCExercises = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">👽 TTC</span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="RefreshInfoExerciseTTC" title="Подставить хеш текущей страницы">♻</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hideExercisesTTCMenu">✕</button>
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
        <span class="tsm-window-title">🛍 Комплектации</span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="RefreshInfoExerciseComplect" title="Подставить ссылку текущей страницы">♻</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" id="hideExercisesComplectMenu" title="Скрыть" aria-label="Скрыть">✕</button>
    </div>
    <div class="tsm-input-group">
        <input id="roomhashhwComplect" class="tsm-input" autocomplete="off" placeholder="Ссылка на комнату">
        <button type="button" class="tsm-btn" id="getroomdataComplect">Загрузить</button>
    </div>
    <div id="identityComplect" style="display:none;">${identityStripHTML("Complect")}</div>
    <div id="exercisebarComplect" class="tsm-exercise-bar"></div>
</div>`;

const wintExercSkysmart = createTSMWindow("AFMS_SkysmartExercInfo", "winTopexercisesSkysmart", "winLeftexercisesSkysmart", win_kidsExercises);
wintExercSkysmart.className = "tsm-window tsm-window-exercises";

const wintExercTTC = createTSMWindow("AFMS_TTCExercInfo", "winTopexercisesTTC", "winLeftexercisesTTC", win_TTCExercises);
wintExercTTC.className = "tsm-window tsm-window-exercises";

const wintComplect = createTSMWindow("AFMS_Complect", "winTopComplect", "winLeftComplect", win_complectationExercises);
wintComplect.className = "tsm-window tsm-window-exercises";

/* ---------- Общие помощники ---------- */

const EMPTY_ROOM_HINT = '<div class="tsm-empty">Откройте комнату ученика или вставьте ссылку на неё и нажмите «Загрузить»</div>';

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
    <div class="tsm-slide-box" style="${open ? "" : "display:none"}">${inner}</div>`;
}

/* Один обработчик на контейнер: раскрытие секций + действия по data-action */
function bindExerciseContainer(container, actions) {
    const toggle = (head) => {
        const box = head.nextElementSibling;
        const open = box.style.display === "none";
        box.style.display = open ? "" : "none";
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
        el.style.display = "none";
        return;
    }
    el.style.display = "";
    el.innerHTML = `<span class="tsm-chip-label">${escapeHTML(label)}</span>${escapeHTML(value)}`;
    if (copyable) markCopyable(el, String(value));
}

function renderIdentity(suffix, student, teacher, extra = {}) {
    setChip(`studname${suffix}`, "👨‍🎓", student?.name, false);
    setChip(`studserviceid${suffix}`, "услуга", student?.educationServiceId);
    setChip(`studid${suffix}`, "ID", student?.userId);
    setChip(`teachname${suffix}`, "👽", teacher?.name, false);
    setChip(`teachdid${suffix}`, "ID", teacher?.userId);
    if (suffix) setChip(`groupid${suffix}`, "группа", extra.groupId);
}

function splitParticipants(participants = []) {
    const student = participants.find((p) => p.role === "student") || null;
    const teacher = participants.find((p) => p.role !== "student") || null;
    return { student, teacher };
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, { credentials: "include", ...options });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

/* =========================================================
   Smartroom
   ========================================================= */

const smartroomState = { data: null, room: null };

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
                <button type="button" class="tsm-btn-save" data-action="copy-cms" data-subtype="${escapeHTML(subject)}" data-lessonid="${lessonId}" title="Скопировать ссылку на урок в CMS">💾</button>
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
                <td class="tsm-table-cell-center"><button type="button" class="tsm-btn-save" data-action="copy-cms" data-subtype="${escapeHTML(subject)}" data-lessonid="${lessonId}" data-stepid="${escapeHTML(card.id)}" title="Скопировать ссылку на слайд в CMS">💾</button></td>
                <td class="tsm-table-cell-center tsm-text-xs">${toMoscowTime(card.sentAt)}</td>
                <td class="tsm-table-cell-center tsm-text-xs">${toMoscowTime(card.scoreUpdatedAt)}</td>
                ${isHomework ? `<td class="tsm-table-cell-center"><button type="button" class="tsm-btn-reset" data-action="reset-progress" data-stepuuid="${escapeHTML(card.stepUuid)}" data-cardname="${escapeHTML(card.name)}" title="Сбросить прогресс ученика по слайду">↻</button></td>` : ""}
            </tr>`;
        });
    });

    const table = `<div class="tsm-table-scroll"><table class="tsm-slide-table${isHomework ? "" : " tsm-slide-table-lesson"}">
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
    const { student, teacher } = splitParticipants(data.participants);
    const index = student ? (data.lessonCards || []).findIndex((c) => c.userId === student.userId) : -1;

    renderIdentity("", student, teacher);
    document.getElementById("identityKids").style.display = "";

    if (index < 0) {
        container.innerHTML = '<div class="tsm-empty">В комнате не найден план ученика</div>';
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

    container.innerHTML = '<div class="tsm-empty tsm-empty-loading">Загружаем данные комнаты…</div>';
    setBusy(button, true);
    try {
        smartroomState.data = await fetchJson(`https://api-${room.subject}.skyeng.ru/api/v2/rooms/${room.hash}`);
        smartroomState.room = room;
        renderSmartroom();
    } catch (err) {
        console.error("[TSM Smartroom]", err);
        container.innerHTML = `<div class="tsm-empty">Не удалось загрузить комнату (${escapeHTML(err.message)}). Проверьте ссылку и авторизацию.</div>`;
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
        const { room, data } = smartroomState;
        const student = splitParticipants(data?.participants).student;
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

    container.innerHTML = '<div class="tsm-empty tsm-empty-loading">Загружаем курс…</div>';
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
            <button type="button" class="tsm-btn-save-ttc" data-action="copy-ttc" data-stepid="${escapeHTML(step.stepId)}" title="Скопировать ссылку на слайд в CMS">💾</button>
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
            ${items || '<div class="tsm-empty">В уроке нет слайдов</div>'}`;
    } catch (err) {
        console.error("[TSM TTC]", err);
        container.innerHTML = `<div class="tsm-empty">Не удалось загрузить курс (${escapeHTML(err.message)})</div>`;
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
    const hash = currentTTCHash();
    const input = document.getElementById("roomhashttc");
    if (hash) {
        input.value = hash;
        getTTCData();
    } else {
        /* FIX: подсказка раньше записывалась в value поля и уходила в запрос как хеш */
        document.getElementById("exercisebarttc").innerHTML = '<div class="tsm-empty">Откройте курс TTC или введите хеш комнаты</div>';
        input.focus();
    }
}

/* =========================================================
   Комплектации
   ========================================================= */

const complectState = { room: null, studentId: "" };

function complectTableHTML(themes, subject, variantId) {
    let rows = "";
    (themes || []).forEach((theme) => {
        const lessonId = escapeHTML(theme.meta?.contentLessonId);
        rows += `<tr class="tsm-theme-row"><td colspan="7">
            <div class="tsm-theme-title">
                <button type="button" class="tsm-btn-save" data-action="copy-cms" data-subtype="${escapeHTML(subject)}" data-lessonid="${lessonId}" title="Скопировать ссылку на урок в CMS">💾</button>
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
                <td class="tsm-table-cell-center"><button type="button" class="tsm-btn-save" data-action="copy-cms" data-subtype="${escapeHTML(subject)}" data-lessonid="${lessonId}" data-stepid="${escapeHTML(card.id)}" title="Скопировать ссылку на слайд в CMS">💾</button></td>
                <td class="tsm-table-cell-center"><button type="button" class="tsm-btn-step" data-action="copy-uuid" data-stepuuid="${uuid}" title="Скопировать stepUuid">📋</button></td>
                <td class="tsm-table-cell-center"><button type="button" class="tsm-btn-save-revision" data-action="reset-revision" data-stepuuid="${uuid}" data-variantid="${escapeHTML(variantId || "")}" data-cardname="${escapeHTML(card.name)}" title="Сбросить ревизию слайда">↺</button></td>
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

    container.innerHTML = '<div class="tsm-empty tsm-empty-loading">Загружаем комплектации…</div>';
    setBusy(button, true);
    try {
        const url = `https://api-${room.subject}.skyeng.ru/api/v2/rooms/${room.hash}${room.isTest ? "" : "?verbosity=only_mine_participants"}`;
        const data = await fetchJson(url, {
            method: room.isTest ? "GET" : "POST",
            mode: "cors",
            headers: { "content-type": "application/json" },
            body: room.isTest ? null : JSON.stringify({ roomHash: rawLink })
        });

        const { student, teacher } = splitParticipants(data.participants);
        const index = student ? (data.lessonCards || []).findIndex((c) => c.userId === student.userId) : -1;

        renderIdentity("Complect", student, teacher, { groupId: data.groupInfo?.externalGroupId });
        renderComplectStatus(data.status, blockVariantId(data.homeworkCards?.[index]));
        document.getElementById("identityComplect").style.display = "";

        complectState.room = room;
        complectState.studentId = String(student?.userId ?? "");

        if (index < 0) {
            container.innerHTML = '<div class="tsm-empty">В комнате не найден план ученика</div>';
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
    } catch (err) {
        console.error("[TSM Комплектации]", err);
        container.innerHTML = `<div class="tsm-empty">Не удалось загрузить комнату (${escapeHTML(err.message)}). Проверьте ссылку и авторизацию.</div>`;
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
        variantChip.style.display = "";
        markCopyable(variantChip, String(variantId));
    } else {
        variantChip.style.display = "none";
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