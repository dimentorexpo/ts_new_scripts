/* =========================================================
   TSM Students — ученики преподавателя (ЛКП)
   ========================================================= */

const win_studentsSkysmart = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">${tsmIcon("user", 15)} Ученики</span>
        <span id="studentsCounter" class="tsm-counter"></span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hidestudentsSkysmartMenu">${tsmIcon("close")}</button>
    </div>
    <div class="tsm-toolbar">
        <input id="usersearchskysmart" class="tsm-input" autocomplete="off" placeholder="Поиск по имени или ID">
        <select id="listofsubjects" class="tsm-select" title="Раздел"><option value="all">Все разделы</option></select>
        <button type="button" class="tsm-btn" id="actualizestudreportkids" title="Заполняет отчёт каждого показанного ученика символами «--»">${tsmIcon("clipboard", 14)} Актуализировать отчёты</button>
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

function buildKidCardHTML(kid, subject) {
    const status = KID_STATUS[kid.status];
    const statusMark = status ? `<span class="tsm-kid-status" title="${status.title}">${status.symbol}</span>` : "";
    const segmentBadge = kid.segmentBadge ? `<span class="tsm-badge">${escapeHTML(kid.segmentBadge)}</span>` : "";
    const safeId = escapeHTML(kid.id);
    const roomHash = kid.roomInfo?.hash || kid.roomHash || kid.hash || "";
    let chips = "";
    if (roomHash) chips += `<span class="tsm-id-badge" data-copy="${escapeHTML(roomHash)}" title="Скопировать хеш комнаты">Хеш ${escapeHTML(roomHash)}</span>`;
    if (kid.contentLessonId != null) {
        chips += `<span class="tsm-id-badge" data-copy="${escapeHTML(studCmsUrl(detectTeacherSubject(subject), kid.contentLessonId))}" title="Скопировать ссылку на урок в CMS">CMS ${escapeHTML(kid.contentLessonId)}</span>`;
    }

    return `<div class="tsm-kid-card ${status ? escapeHTML(kid.status) : ""}" data-kid-id="${safeId}" data-subject="${escapeHTML(subject)}">
        <div class="tsm-student-name-kid">${statusMark}<span class="tsm-kid-name">${escapeHTML(kid.name)}</span></div>
        <div class="tsm-kid-meta">
            <span class="tsm-id-badge" data-copy="${safeId}">ID ${safeId}</span>
            ${segmentBadge}
            <span class="tsm-lang-badge" title="Язык обслуживания">${kid.serviceLocale ? escapeHTML(kid.serviceLocale) : "язык не указан"}</span>
            ${chips}
        </div>
        <div class="tsm-kid-actions">
            <button type="button" data-link="mvurkidseport" class="tsm-btn-report" title="Отчёт МВУ" aria-label="Отчёт МВУ">${tsmIcon("file-text", 14)}</button>
            <button type="button" data-link="openkidsprofile" class="tsm-btn-profile" title="Полный профиль ученика" aria-label="Полный профиль ученика">${tsmIcon("eye", 14)}</button>
            <button type="button" data-link="openpaymentkidsshistory" class="tsm-btn-payment" title="История оплат и занятий" aria-label="История оплат и занятий">${tsmIcon("credit-card", 14)}</button>
            <button type="button" data-hw="1" class="tsm-btn-homework" title="Домашние задания и тесты — откроются в новой вкладке" aria-label="Домашние задания">${tsmIcon("book", 14)} ДЗ</button>
        </div>
    </div>`;
}

function buildSectionHTML(key, kids) {
    return `<div class="tsm-subj-title">${escapeHTML(labelForSubject(key))}<span class="tsm-subj-count">${kids.length}</span></div>`
        + kids.map((kid) => buildKidCardHTML(kid, key)).join("");
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
    const hwButton = event.target.closest("[data-hw]");
    if (hwButton) {
        const card = hwButton.closest(".tsm-kid-card");
        const kid = findKid(card?.dataset.subject, card?.dataset.kidId);
        if (kid) openStudentHomework(kid, card.dataset.subject);
        return;
    }
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
        renderKids(tsmEmptyState("user", `По запросу «${query}» никого не найдено`, "Измените запрос или раздел"));
    } else {
        renderKids(tsmEmptyState("user", "В этом разделе учеников нет"));
    }
}

async function loadStudents() {
    renderKids(tsmSkeleton(8));
    const select = document.getElementById("listofsubjects");
    select.length = 1;
    select.value = "all";

    try {
        /* Запрос идёт напрямую из контент-скрипта — работает, пока API отдаёт CORS-заголовки для origin страницы */
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
            renderKids(tsmEmptyState("user", "Учеников не найдено", `Ключи ответа API: ${keys}`));
        }
    } catch (err) {
        console.error("[TSM Ученики] ошибка загрузки:", err);
        renderKids(tsmEmptyState("alert", "Не удалось загрузить учеников", `Проверьте, что вы вошли в ЛКП (${err.message})`, tsmRetryButton()));
        document.querySelector("#infobarskysmart .tsm-empty-retry")?.addEventListener("click", loadStudents);
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

/* =========================================================
   Домашние задания ученика — открываются в новой вкладке
   ========================================================= */

const STUD_HW_PATH = "/api/v2/rooms/history/by-stk";
const STUD_SUBJECT_RE = /\/kids\/([a-z][a-z-]*)\//i;

/* Предмет преподавателя: 1) из адреса vimbox.skyeng.ru/kids/<предмет>/...;
   2) из ссылки «Уроки» в левом меню teacher.skyeng.ru;
   3) из любой ссылки на /kids/<предмет>/ на странице; 4) запасной вариант. */
function detectTeacherSubject(fallback) {
    const fromUrl = location.href.match(STUD_SUBJECT_RE);
    if (fromUrl) return fromUrl[1].toLowerCase();
    const link = document.querySelector('a[data-qa-id="left-menu-item:Уроки"][href*="/kids/"]')
        || document.querySelector('a[href*="vimbox.skyeng.ru/kids/"]');
    const fromLink = link?.href.match(STUD_SUBJECT_RE);
    if (fromLink) return fromLink[1].toLowerCase();
    return SUBJECT_MAP[fallback] ? fallback : "english";
}
const STUD_HW_TYPES = {
    homework: "Домашняя работа",
    writingHomework: "Письменная работа",
    diagnostics: "Диагностика",
    tests: "Тест"
};

function findKid(subject, kidId) {
    const list = studentsState.data?.[subject];
    return Array.isArray(list) ? list.find((kid) => kid && String(kid.id) === String(kidId)) : null;
}

function studCmsUrl(subject, lessonId) {
    return `https://cms.skyeng.ru/${encodeURIComponent(subject || "english")}/cms/lesson/${encodeURIComponent(lessonId)}`;
}

/* homework / writingHomework → «ДЗ», tests / diagnostics → «Тесты» */
function studHwGroup(type) {
    return type === "tests" || type === "diagnostics" ? "tests" : "hw";
}

/* Выполнено, если completeness ≥ 100 или пройдены все карточки; нет данных — не выполнено */
function studHwDone(item) {
    if (item.completeness != null) return Number(item.completeness) >= 100;
    if (Number(item.cardsCount) > 0) return Number(item.completedCardsCount || 0) >= Number(item.cardsCount);
    return false;
}

function studFmtRange(start, end) {
    const d1 = new Date(start);
    if (!start || isNaN(d1)) return "";
    const day = d1.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
    const time = (d) => d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    const d2 = end ? new Date(end) : null;
    if (!d2 || isNaN(d2)) return `${day}, ${time(d1)}`;
    return d1.toDateString() === d2.toDateString() ? `${day}, ${time(d1)}–${time(d2)}` : `${day} ${time(d1)} — ${d2.toLocaleDateString("ru-RU")} ${time(d2)}`;
}

async function fetchStudentHomework(kid, subject) {
    const userId = kid.userId ?? kid.user_id ?? kid.id;
    const params = new URLSearchParams({
        serviceTypeKey: kid.serviceTypeKey || "english_adult_not_native_speaker",
        userId: String(userId),
        page: "1",
        limit: "1000",
        roomTypes: "personal",
        nodeTypes: "homework,writingHomework,diagnostics,tests",
        onlyWithTeacherParticipant: "true"
    });
    const response = await fetch(`https://api-${encodeURIComponent(subject)}.skyeng.ru${STUD_HW_PATH}?${params}`, { credentials: "include", headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const json = await response.json();
    return Array.isArray(json?.results) ? json.results : [];
}

/* Стили вкладки ДЗ: та же палитра Graphite & Ice, страница своя — :root здесь безопасен */
const STUD_HW_CSS = `
:root{--bg:#0e131c;--surface:#121722;--raised:rgba(255,255,255,.035);--sunken:rgba(0,0,0,.28);--line:rgba(148,163,184,.14);--line2:rgba(148,163,184,.28);--text:#e7ecf3;--text2:#9ba7b9;--text3:#8a95a8;--accent:#7cc4ff;--accent-soft:rgba(124,196,255,.12);--accent-line:rgba(124,196,255,.45);--ok:#62d29d;--warn:#f1b84f;--bad:#f07a7e;}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
.wrap{max-width:960px;margin:0 auto;padding:28px 20px 64px}
header{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:16px;margin-bottom:14px}
h1{font-size:22px;font-weight:700;margin:0 0 4px}
.sub{color:var(--text2);font-size:13px}
input[type=text],select{background:var(--surface);border:1px solid var(--line2);color:var(--text);border-radius:9px;height:34px;padding:0 12px;outline:none;font-size:13px}
input[type=text]{width:300px}
input:focus,select:focus{border-color:var(--accent-line)}
select:disabled{opacity:.45}
.filters{display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
.f{display:inline-flex;align-items:center;gap:8px;color:var(--text2);font-size:13px;user-select:none}
.f input[type=checkbox]{accent-color:var(--accent);width:15px;height:15px;margin:0}
.count{color:var(--text3);font-size:12px;margin:0 0 12px 2px}
.hw{display:flex;gap:16px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:10px}
.hw:hover{border-color:var(--line2)}
.cover{width:104px;height:74px;border-radius:9px;object-fit:cover;background:var(--raised);flex:none}
.hbody{flex:1;min-width:0}
.top{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.name{font-size:15px;font-weight:700;word-break:break-word}
.tag{font-size:11.5px;padding:2px 9px;border-radius:999px;border:1px solid var(--line2);color:var(--text2);white-space:nowrap}
.tag.ok{color:var(--ok);border-color:rgba(98,210,157,.4)}
.tag.bad{color:var(--bad);border-color:rgba(240,122,126,.4)}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.chip{display:inline-flex;gap:6px;align-items:center;height:24px;padding:0 10px;border-radius:7px;background:var(--sunken);border:1px solid var(--line);color:var(--text);font:11.5px/1 "SF Mono",Consolas,monospace;cursor:pointer}
.chip b{color:var(--accent);font-weight:600}
.chip:hover{border-color:var(--accent-line)}
.chip.copied{border-color:var(--ok);color:var(--ok)}.chip.failed{border-color:var(--bad);color:var(--bad)}
.dates{color:var(--text2);font-size:12.5px;margin-top:6px}
.metrics{display:flex;gap:18px;margin-top:10px;align-items:center;flex-wrap:wrap;font-size:12.5px;color:var(--text2)}
.metrics b{color:var(--text)}
.good{color:var(--ok)!important}.mid{color:var(--warn)!important}.low{color:var(--bad)!important}
.bar{width:150px;height:6px;background:var(--sunken);border-radius:3px;overflow:hidden}
.bar i{display:block;height:100%;background:var(--accent)}
.bar i.full{background:var(--ok)}
.actions{margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.btn{display:inline-flex;align-items:center;height:30px;padding:0 14px;border-radius:8px;border:1px solid var(--line2);color:var(--text);text-decoration:none;font-size:12.5px}
.btn:hover{border-color:var(--accent-line);color:var(--accent);background:var(--accent-soft)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:#0b1220;font-weight:600}
.btn.primary:hover{filter:brightness(1.08);color:#0b1220}
.records{display:flex;flex-direction:column;gap:6px;margin-top:10px}.rec{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--text3)}.rec span{width:64px;flex:none}audio{height:32px;width:320px;max-width:100%}
.empty{text-align:center;color:var(--text3);padding:70px 0}
.spin{width:26px;height:26px;margin:60px auto;border:3px solid var(--line);border-top-color:var(--accent);border-radius:50%;animation:s 1s linear infinite}
@keyframes s{to{transform:rotate(360deg)}}`;

function studHwShell(name) {
    return `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>ДЗ — ${escapeHTML(name)}</title><style>${STUD_HW_CSS}</style></head><body>
<div class="wrap">
  <header><div><h1>📚 Домашние задания</h1><div class="sub">${escapeHTML(name)}</div></div>
  <input id="q" type="text" placeholder="Поиск по названию урока"></header>
  <div class="filters">
    <label class="f">Тип <select id="typef"><option value="">все</option><option value="hw">Домашние задания</option><option value="tests">Тесты</option></select></label>
    <label class="f">Комната <select id="hashf"><option value="">все</option></select></label>
    <label class="f"><input type="checkbox" id="undonef"> только невыполненные</label>
  </div>
  <div class="count" id="count"></div>
  <div id="list"><div class="spin"></div></div>
</div></body></html>`;
}

function studHwRowHTML(item, subject) {
    const done = studHwDone(item);
    const room = item.roomInfo || {};
    const percent = (value) => Math.max(0, Math.min(100, Number(value) || 0));
    const scoreCls = (v) => (v >= 85 ? "good" : v >= 50 ? "mid" : "low");

    let teacher = "";
    if (room.teacherName || room.teacherUserId != null) {
        teacher = " · преподаватель: " + [room.teacherName, room.teacherUserId != null ? `(ID ${room.teacherUserId})` : ""].filter(Boolean).join(" ");
    }

    let chips = "";
    if (room.hash) chips += `<span class="chip" data-copy="${escapeHTML(room.hash)}" title="Скопировать хеш"><b>Хеш</b>${escapeHTML(room.hash)}</span>`;
    if (item.contentLessonId != null) chips += `<span class="chip" data-copy="${escapeHTML(studCmsUrl(subject, item.contentLessonId))}" title="Скопировать ссылку на CMS"><b>CMS</b>${escapeHTML(item.contentLessonId)}</span>`;

    let metrics = "";
    if (item.score != null) metrics += `<span>Балл: <b class="${scoreCls(item.score)}">${escapeHTML(item.score)}</b></span>`;
    if (item.completeness != null) {
        metrics += `<span>Выполнено: <b>${escapeHTML(item.completeness)}%</b></span><span class="bar"><i class="${done ? "full" : ""}" style="width:${percent(item.completeness)}%"></i></span>`;
    }
    if (item.cardsCount != null) metrics += `<span>Карточки: <b>${escapeHTML(item.completedCardsCount ?? 0)}</b> / ${escapeHTML(item.cardsCount)}</span>`;
    if (item.type === "tests" && item.remainingTimeMinutes != null) {
        const rem = Number(item.remainingTimeMinutes);
        metrics += `<span>Осталось: <b class="${rem <= 15 ? "low" : rem <= 45 ? "mid" : ""}">${escapeHTML(rem)} мин</b></span>`;
    }

    /* API может вернуть одну и ту же запись несколько раз — оставляем уникальные URL */
    const audioUrls = [...new Set((Array.isArray(room.records) ? room.records : [])
        .filter((rec) => rec?.type === "audio" && rec.recordUrl)
        .map((rec) => rec.recordUrl))];
    const audio = audioUrls.length
        ? `<div class="records">${audioUrls.map((url, i) => `<div class="rec"><span>${audioUrls.length > 1 ? `Запись ${i + 1}` : "Запись"}</span><audio controls preload="none" src="${escapeHTML(url)}"></audio></div>`).join("")}</div>`
        : "";

    return `<div class="hw">
  ${item.lessonImageUrl ? `<img class="cover" src="${escapeHTML(item.lessonImageUrl)}" alt="" loading="lazy">` : ""}
  <div class="hbody">
    <div class="top"><span class="name">${escapeHTML(item.name || "Без названия")}</span>
      ${STUD_HW_TYPES[item.type] || item.type ? `<span class="tag">${escapeHTML(STUD_HW_TYPES[item.type] || item.type)}</span>` : ""}
      <span class="tag ${done ? "ok" : "bad"}">${done ? "выполнено" : "не выполнено"}</span></div>
    ${chips ? `<div class="chips">${chips}</div>` : ""}
    ${item.startingAt ? `<div class="dates">${escapeHTML(studFmtRange(item.startingAt, item.endAt) + teacher)}</div>` : ""}
    ${metrics ? `<div class="metrics">${metrics}</div>` : ""}
    <div class="actions">
      ${room.link ? `<a class="btn primary" href="${escapeHTML(room.link)}" target="_blank" rel="noopener">Открыть комнату</a>` : ""}
    </div>
    ${audio}
  </div></div>`;
}

/* Копирование внутри вкладки ДЗ. navigator.clipboard страницы-родителя здесь не годится:
   фокус во вкладке ДЗ, и браузер отклоняет запись («Document is not focused»).
   Поэтому берём clipboard самой вкладки, а при отказе — execCommand в её документе. */
function studCopyInDoc(doc, text) {
    const fallback = () => {
        const area = doc.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.cssText = "position:fixed;top:0;left:0;opacity:0";
        doc.body.appendChild(area);
        area.select();
        let ok = false;
        try { ok = doc.execCommand("copy"); } catch (e) { ok = false; }
        area.remove();
        return ok;
    };
    const clip = doc.defaultView?.navigator?.clipboard;
    if (!clip?.writeText) return Promise.resolve(fallback());
    return clip.writeText(text).then(() => true, () => fallback());
}

function setupStudentHomework(doc, items, subject) {
    const sorted = items.filter((item) => item && typeof item === "object")
        .sort((a, b) => new Date(b.startingAt || 0) - new Date(a.startingAt || 0));
    const $ = (id) => doc.getElementById(id);
    const hashes = [...new Set(sorted.map((item) => item.roomInfo?.hash).filter(Boolean))].sort();

    if (hashes.length) {
        $("hashf").innerHTML = `<option value="">все (${hashes.length})</option>`
            + hashes.map((hash) => `<option value="${escapeHTML(hash)}">${escapeHTML(hash)}</option>`).join("");
    } else {
        $("hashf").disabled = true;
    }

    const undoneTotal = sorted.filter((item) => !studHwDone(item)).length;

    function render() {
        const query = $("q").value.trim().toLowerCase();
        const hash = $("hashf").value;
        const type = $("typef").value;
        const onlyUndone = $("undonef").checked;
        const rows = sorted.filter((item) => (!query || String(item.name || "").toLowerCase().includes(query))
            && (!hash || item.roomInfo?.hash === hash)
            && (!type || studHwGroup(item.type) === type)
            && (!onlyUndone || !studHwDone(item)));
        $("count").textContent = `Показано ${rows.length} из ${sorted.length} · не выполнено всего: ${undoneTotal}`;
        $("list").innerHTML = rows.length
            ? rows.map((item) => studHwRowHTML(item, subject)).join("")
            : `<div class="empty">${sorted.length ? "Ничего не найдено — измените фильтры" : "У ученика нет домашних заданий и тестов"}</div>`;
    }

    ["q", "hashf", "typef", "undonef"].forEach((id) => $(id).addEventListener(id === "q" ? "input" : "change", render));
    $("list").addEventListener("click", (event) => {
        const chip = event.target.closest(".chip[data-copy]");
        if (!chip) return;
        studCopyInDoc(doc, chip.dataset.copy).then((ok) => {
            chip.classList.add(ok ? "copied" : "failed");
            setTimeout(() => chip.classList.remove("copied", "failed"), 1200);
        });
    });
    /* Битые обложки прячем без inline-обработчиков */
    $("list").addEventListener("error", (event) => {
        if (event.target.classList?.contains("cover")) event.target.remove();
    }, true);

    render();
}

async function openStudentHomework(kid, sectionKey) {
    const subject = detectTeacherSubject(sectionKey);
    const name = kid.name || [kid.surname, kid.firstName].filter(Boolean).join(" ") || `ID ${kid.id}`;
    const tab = window.open("", "_blank");
    if (!tab) {
        createNotify("Браузер заблокировал новую вкладку — разрешите всплывающие окна для этого сайта", "error");
        return;
    }
    tab.document.open();
    tab.document.write(studHwShell(name));
    tab.document.close();
    try {
        const items = await fetchStudentHomework(kid, subject);
        setupStudentHomework(tab.document, items, subject);
    } catch (err) {
        console.error("[TSM Ученики] ошибка загрузки ДЗ:", err);
        const list = tab.document.getElementById("list");
        if (list) list.innerHTML = `<div class="empty">Не удалось загрузить ДЗ: ${escapeHTML(err.message)}</div>`;
        createNotify(`ДЗ ученика ${name}: ${err.message}`, "error");
    }
}

function OpenStudentsMenu() {
    if (!toggleTSMWindow(wintStudSkysmart)) {
        restoreMainMenu();
        return;
    }
    /* Главное меню скрываем целиком — окно учеников занимает его место */
    const mainWin = document.getElementById("AFMS_addMenu");
    if (mainWin) mainWin.style.display = "none";
    document.getElementById("usersearchskysmart").value = "";
    loadStudents();
}
