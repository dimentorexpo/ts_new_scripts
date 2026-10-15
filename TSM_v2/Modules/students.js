/* =========================================================
   TSM Students — ученики преподавателя (ЛКП)
   ========================================================= */

const win_studentsSkysmart = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">👨‍🎓 Ученики</span>
        <span id="studentsCounter" class="tsm-counter"></span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hidestudentsSkysmartMenu">✕</button>
    </div>
    <div class="tsm-toolbar">
        <input id="usersearchskysmart" class="tsm-input" autocomplete="off" placeholder="Поиск по имени или ID">
        <select id="listofsubjects" class="tsm-select" title="Раздел"><option value="all">Все разделы</option></select>
        <button type="button" class="tsm-btn" id="actualizestudreportkids" title="Заполняет отчёт каждого показанного ученика символами «--»">📝 Актуализировать отчёты</button>
    </div>
    <div id="infobarskysmart" class="tsm-info-bar-kids"></div>
</div>`;

const wintStudSkysmart = createTSMWindow("AFMS_SkysmartStudInfo", "winTopstudentsSkysmart", "winLeftstudentsSkysmart", win_studentsSkysmart);
wintStudSkysmart.className = "tsm-window tsm-window-students-kids";

const SUBJECT_MAP = {
    math: "Математика",
    english: "Английский язык",
    russian: "Русский язык",
    "social-science": "Обществознание",
    preschool: "Дошколка",
    chess: "Шахматы",
    "computer-science": "Компьютерные курсы",
    chemistry: "Химия",
    physics: "Физика",
    history: "История",
    biology: "Биология",
    geography: "География",
    literature: "Литература"
};

const KID_STATUS = {
    sleep: { symbol: "💤", title: "Ученик уснул" },
    vacation: { symbol: "⛱", title: "Ученик в отпуске" }
};

const KID_CARD_LINKS = {
    mvurkidseport: (id) => "https://overbooking.skyeng.ru/html/report?student_id=" + id,
    openkidsprofile: (id) => "https://vimbox.skyeng.ru/profile/" + id,
    openpaymentkidsshistory: (id) => "https://vimbox.skyeng.ru/profile/student/" + id + "/last-classes"
};

const studentsState = { data: {}, loaded: false };

function restoreMainMenu() {
    /* Возвращаем всё окно меню целиком, иначе остаётся «шапка» без пунктов */
    const mainWin = document.getElementById("AFMS_addMenu");
    if (mainWin) mainWin.style.display = "block";
    if (typeof showMainMenuSection === "function") showMainMenuSection("mainmenu");
}

function closeStudentsWindow() {
    wintStudSkysmart.style.display = "none";
    restoreMainMenu();
}

/* API может завернуть данные в обёртку ({data: {...}} / {result: {...}}) */
function pickKidData(raw) {
    if (!raw || typeof raw !== "object") return {};
    const hasSections = (obj) => Object.values(obj).some(Array.isArray);
    if (hasSections(raw)) return raw;
    for (const wrapKey of ["data", "result", "payload"]) {
        const inner = raw[wrapKey];
        if (inner && typeof inner === "object" && !Array.isArray(inner) && hasSections(inner)) return inner;
    }
    return raw;
}

function labelForSubject(key) {
    return SUBJECT_MAP[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

/* Непустые разделы: [key, kids[]] */
function kidSections(data) {
    return Object.entries(data || {})
        .filter(([, list]) => Array.isArray(list))
        .map(([key, list]) => [key, list.filter((kid) => kid && typeof kid === "object")])
        .filter(([, list]) => list.length > 0);
}

function buildKidCardHTML(kid) {
    const status = KID_STATUS[kid.status];
    const statusMark = status ? `<span class="tsm-kid-status" title="${status.title}">${status.symbol}</span>` : "";
    const segmentBadge = kid.segmentBadge ? `<span class="tsm-badge">${escapeHTML(kid.segmentBadge)}</span>` : "";
    const safeId = escapeHTML(kid.id);

    return `<div class="tsm-kid-card ${status ? escapeHTML(kid.status) : ""}" data-kid-id="${safeId}">
        <div class="tsm-student-name-kid">${statusMark}<span class="tsm-kid-name">${escapeHTML(kid.name)}</span></div>
        <div class="tsm-kid-meta">
            <span class="tsm-id-badge" data-copy="${safeId}">ID ${safeId}</span>
            ${segmentBadge}
            <span class="tsm-lang-badge" title="Язык обслуживания">${kid.serviceLocale ? escapeHTML(kid.serviceLocale) : "язык не указан"}</span>
        </div>
        <div class="tsm-kid-actions">
            <button type="button" data-link="mvurkidseport" class="tsm-btn-report" title="Отчёт МВУ">📋</button>
            <button type="button" data-link="openkidsprofile" class="tsm-btn-profile" title="Полный профиль ученика">🕵️‍♂️</button>
            <button type="button" data-link="openpaymentkidsshistory" class="tsm-btn-payment" title="История оплат и занятий">💰</button>
        </div>
    </div>`;
}

function buildSectionHTML(key, kids) {
    return `<div class="tsm-subj-title">${escapeHTML(labelForSubject(key))}<span class="tsm-subj-count">${kids.length}</span></div>`
        + kids.map(buildKidCardHTML).join("");
}

function renderKids(html) {
    const container = document.getElementById("infobarskysmart");
    container.innerHTML = html;
    container.querySelectorAll(".tsm-id-badge[data-copy]").forEach((badge) => {
        markCopyable(badge, badge.dataset.copy);
    });
    const shown = container.querySelectorAll(".tsm-kid-card").length;
    document.getElementById("studentsCounter").textContent = shown ? String(shown) : "";
}

/* Один делегированный обработчик вместо обработчика на каждую кнопку */
document.getElementById("infobarskysmart").addEventListener("click", (event) => {
    const button = event.target.closest("[data-link]");
    if (!button) return;
    const kidId = button.closest(".tsm-kid-card")?.dataset.kidId;
    const builder = KID_CARD_LINKS[button.dataset.link];
    if (kidId && builder) window.open(builder(kidId), "_blank", "noopener");
});

function renderStudentsView() {
    const query = document.getElementById("usersearchskysmart").value.toLowerCase().trim();
    const selected = document.getElementById("listofsubjects").value;
    const sections = kidSections(studentsState.data)
        .filter(([key]) => selected === "all" || key === selected)
        .map(([key, kids]) => [key, query
            ? kids.filter((kid) => String(kid.name || "").toLowerCase().includes(query) || String(kid.id ?? "").includes(query))
            : kids])
        .filter(([, kids]) => kids.length > 0);

    if (sections.length) {
        renderKids(sections.map(([key, kids]) => buildSectionHTML(key, kids)).join(""));
    } else if (query) {
        renderKids(`<div class="tsm-empty">По запросу «${escapeHTML(query)}» никого не найдено</div>`);
    } else {
        renderKids('<div class="tsm-empty">В этом разделе учеников нет</div>');
    }
}

async function loadStudents() {
    renderKids('<div class="tsm-empty tsm-empty-loading">Загружаем учеников…</div>');
    const select = document.getElementById("listofsubjects");
    select.length = 1;
    select.value = "all";

    try {
        const response = await fetch("https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/personal", {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ teacherId: null })
        });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const raw = await response.json();
        studentsState.data = pickKidData(raw);
        studentsState.loaded = true;

        const sections = kidSections(studentsState.data);
        sections.forEach(([key, kids]) => addOption(select, `${labelForSubject(key)} (${kids.length})`, key));

        if (sections.length) {
            renderStudentsView();
        } else {
            const keys = raw && typeof raw === "object" ? Object.keys(raw).join(", ") : typeof raw;
            console.log("[TSM Ученики] ответ API без учеников:", raw);
            renderKids(`<div class="tsm-empty">Учеников не найдено.<span class="tsm-text-xs">Ключи ответа API: ${escapeHTML(keys)}</span></div>`);
        }
    } catch (err) {
        console.error("[TSM Ученики] ошибка загрузки:", err);
        renderKids(`<div class="tsm-empty">Не удалось загрузить учеников (${escapeHTML(err.message)}).<span class="tsm-text-xs">Проверьте, что вы вошли в ЛКП, и откройте окно заново</span></div>`);
    }
}

async function actualizeReports(button) {
    const studentIds = Array.from(document.querySelectorAll("#infobarskysmart .tsm-kid-card"))
        .map((card) => card.dataset.kidId)
        .filter((id) => /^\d+$/.test(id || ""));

    if (!studentIds.length) {
        createNotify("Нет учеников для актуализации отчётов", "error");
        return;
    }

    /* FIX: массовая перезапись отчётов раньше запускалась без подтверждения */
    const confirmed = await tsmConfirm({
        title: "Актуализировать отчёты",
        message: `Поля школьного отчёта будут перезаписаны символами «--» у ${studentIds.length} учеников, показанных в списке.`,
        okText: "Перезаписать",
        danger: true
    });
    if (!confirmed) return;

    setBusy(button, true);
    let failed = 0;
    const BATCH_SIZE = 5;
    const reportBody = JSON.stringify({
        student_level: "--", materials_used: "--", endurance: "--", distraction: "--", difficulties: "--",
        activities: "--", skills_to_develop: "--", technical_problems: "--", homework: "--"
    });

    for (let i = 0; i < studentIds.length; i += BATCH_SIZE) {
        const batch = studentIds.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map((studentId) =>
            fetch(`https://api-profile.skyeng.ru/api/v1/students/${studentId}/school-report`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: reportBody
            }).then((res) => res.ok).catch(() => false)
        ));
        failed += results.filter((ok) => !ok).length;
        if (i + BATCH_SIZE < studentIds.length) await new Promise((r) => setTimeout(r, 150));
    }
    setBusy(button, false);

    if (failed) createNotify(`Отчёты обновлены: ${studentIds.length - failed} из ${studentIds.length}. Ошибок: ${failed}`, "error");
    else createNotify(`Отчёты актуализированы у ${studentIds.length} учеников`);
}

document.getElementById("hidestudentsSkysmartMenu").onclick = closeStudentsWindow;
document.getElementById("usersearchskysmart").addEventListener("input", renderStudentsView);
document.getElementById("listofsubjects").addEventListener("change", renderStudentsView);
document.getElementById("actualizestudreportkids").addEventListener("click", function () { actualizeReports(this); });

document.getElementById("openstudentsmenu").onclick = () => {
    if (!toggleTSMWindow(wintStudSkysmart)) {
        restoreMainMenu();
        return;
    }
    /* Главное меню скрываем целиком — окно учеников занимает его место */
    const mainWin = document.getElementById("AFMS_addMenu");
    if (mainWin) mainWin.style.display = "none";
    document.getElementById("usersearchskysmart").value = "";
    loadStudents();
};
