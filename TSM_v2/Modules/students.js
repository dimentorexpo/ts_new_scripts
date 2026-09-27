/* =========================================================
   TSM Students
   ========================================================= */

const win_studentsAdults = `
<div class="tsm-window-grab">
    <div class="tsm-toolbar" id="studentsAdultsHeader">
        <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hidestudentsAdultstMenu">Скрыть</button>
        <button class="tsm-btn" id="addallchatswithadult" title="Добавляет чаты со всеми учениками из раздела Уроки">➕💬</button>
        <button class="tsm-btn tsm-btn-sm" id="actualizestudreportadult" title="Актуализирует отчеты по всем ученикам заполняя поля символами --">📝</button>
    </div>
    <input id="usersearch" class="tsm-input tsm-input-centered tsm-ml-8" style="width:100%;" placeholder="Enter user ID or name for search">
    <div id="infobaradult" class="tsm-info-bar-adult"></div>
</div>`;

const win_studentsSkysmart = `
<div class="tsm-window-grab">
    <div class="tsm-toolbar" id="studentsSkysmartHeader">
        <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hidestudentsSkysmartMenu">Скрыть</button>
        <select id="listofsubjects"><option value="all">Все</option></select>
        <button class="tsm-btn" id="actualizestudreportkids" title="Актуализирует отчеты по всем ученикам в выбранном разделе все или отдельно каждом заполняя поля символами --">📝</button>
    </div>
    <input id="usersearchskysmart" class="tsm-input tsm-input-centered tsm-ml-8" style="width:100%;" placeholder="Enter user ID for search">
    <div id="infobarskysmart" class="tsm-info-bar-kids"></div>
</div>`;

const wintStudAdults = createTSMWindow("AFMS_AdultStudInfo", "winTopstudentsAdults", "winLeftstudentsAdults", win_studentsAdults);
wintStudAdults.className = "tsm-window tsm-window-students-adult";

const wintStudSkysmart = createTSMWindow("AFMS_SkysmartStudInfo", "winTopstudentsSkysmart", "winLeftstudentsSkysmart", win_studentsSkysmart);
wintStudSkysmart.className = "tsm-window tsm-window-students-kids";

document.getElementById("hidestudentsSkysmartMenu").onclick = function () {
    wintStudSkysmart.style.display = "none";
    restoreMainMenu();
};
document.getElementById("hidestudentsAdultstMenu").onclick = function () { wintStudAdults.style.display = "none"; };

function restoreMainMenu() {
    // Возвращаем всё окно меню (AFMS_addMenu), а не только список пунктов:
    // при открытии «Учеников» окно скрывается целиком, иначе остаётся
    // «шляпка» с кнопкой Скрыть.
    const mainWin = document.getElementById("AFMS_addMenu");
    const mainMenu = document.getElementById("mainmenu");
    const exercisesMenu = document.getElementById("exercisesmenu");
    if (mainWin) mainWin.style.display = "block";
    if (mainMenu) mainMenu.style.display = "block";
    if (exercisesMenu) exercisesMenu.style.display = "none";
}

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
    geography: "География"
};

// API может завернуть данные в обёртку ({data: {...}} / {result: {...}}).
// Возвращаем тот объект, в котором реально лежат ключи разделов из SUBJECT_MAP.
function pickKidData(raw) {
    if (!raw || typeof raw !== "object") return {};
    // «Есть разделы» = есть хотя бы один массив (ключи разделов динамические).
    const hasSections = (obj) => Object.values(obj).some(Array.isArray);
    if (hasSections(raw)) return raw;
    for (const wrapKey of ["data", "result", "payload"]) {
        const inner = raw[wrapKey];
        if (inner && typeof inner === "object" && !Array.isArray(inner) && hasSections(inner)) {
            return inner;
        }
    }
    return raw;
}

// Подпись раздела: SUBJECT_MAP — только словарь подписей,
// ключи ответа API могут быть любыми (например, italian).
function labelForSubject(key) {
    if (SUBJECT_MAP[key]) return SUBJECT_MAP[key];
    return key.charAt(0).toUpperCase() + key.slice(1);
}

// Реальные разделы из ответа: пары [key, list], где list — массив.
function kidSections(data) {
    return Object.entries(data || {}).filter(([, list]) => Array.isArray(list));
}

function buildKidCardHTML(kid, subjectKey) {
    const statusSymbol = kid.status === "sleep" ? "💤" : (kid.status === "vacation" ? "⛱" : "");
    const statusTitle = kid.status === "sleep" ? "ученик уснул" : (kid.status === "vacation" ? "ученик в отпуске" : "");
    const segmentBadge = kid.segmentBadge ? `<div class="tsm-badge">${escapeHTML(kid.segmentBadge)}</div>` : "";
    const serviceLocale = kid.serviceLocale ? escapeHTML(kid.serviceLocale) : "Пусто";
    const statusClass = kid.status ? escapeHTML(kid.status) : "";
    const safeName = escapeHTML(kid.name);
    const safeId = escapeHTML(kid.id);
    const safeSubj = escapeHTML(subjectKey);

    return `<div class="tsm-kid-card ${statusClass}">
        <div class="tsm-subj-search">${safeSubj}</div>
        <div class="tsm-student-name-kid">
            <span title="${escapeHTML(statusTitle)}">${statusSymbol}</span> ${safeName}
        </div>
        <div class="tsm-id-badge">🆔: ${safeId}</div>
        ${segmentBadge}
        <div class="tsm-lang-badge">Яз.обслуж: ${serviceLocale}</div>
        <div style="text-align:center;">
            <span name="mvurkidseport" class="tsm-btn-report" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>
            <span name="openkidsprofile" class="tsm-btn-profile" title="Открывает полный профиль ученика">🕵️‍♂️</span>
            <span name="openpaymentkidsshistory" class="tsm-btn-payment" title="Открывает Историю оплат ученика">💰</span>
        </div>
    </div>`;
}

const KID_CARD_LINKS = [
    ["mvurkidseport", (id) => "https://overbooking.skyeng.ru/html/report?student_id=" + id],
    ["openkidsprofile", (id) => "https://vimbox.skyeng.ru/profile/" + id],
    ["openpaymentkidsshistory", (id) => "https://vimbox.skyeng.ru/profile/student/" + id + "/last-classes"]
];

function getKidId(button) {
    return button.closest(".tsm-kid-card").querySelector(".tsm-id-badge").textContent.match(/\d+/)[0];
}

function attachKidActions(container) {
    for (const [name, urlBuilder] of KID_CARD_LINKS) {
        container.querySelectorAll(`[name="${name}"]`).forEach((btn) => {
            btn.onclick = () => window.open(urlBuilder(getKidId(btn)));
        });
    }
}

function renderKidCards(container, html) {
    container.innerHTML = html;
    attachKidActions(container);
}

document.getElementById("openstudentsmenu").onclick = async function () {
    const willShow = wintStudSkysmart.style.display === "none";
    wintStudSkysmart.style.display = willShow ? "" : "none";
    if (!willShow) {
        // Students window is being closed — restore the main menu items
        restoreMainMenu();
        return;
    }

    wintStudAdults.style.display = "none";
    // Скрываем главное меню ЦЕЛИКОМ (окно AFMS_addMenu), иначе остаётся
    // «шляпка» с кнопкой Скрыть без пунктов меню.
    const mainWin = document.getElementById("AFMS_addMenu");
    if (mainWin) mainWin.style.display = "none";
    document.getElementById("mainmenu").style.display = "none";
    document.getElementById("exercisesmenu").style.display = "none";

    const infobar = document.getElementById("infobarskysmart");
    infobar.innerHTML = '<div class="tsm-empty tsm-text-secondary">Загрузка учеников…</div>';

    const objSel = document.getElementById("listofsubjects");
    objSel.length = 1;
    objSel[0].selected = true;

    let kidsdata = {};
    let commonarr = "";

    try {
        const response = await fetch("https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/personal", {
            headers: { "content-type": "application/json" },
            method: "POST",
            body: '{"teacherId":null}',
            credentials: "include"
        });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const raw = await response.json();
        kidsdata = pickKidData(raw);
        console.log("[TSM Ученики] ответ API:", raw);

        const sections = [];
        for (const [key, list] of kidSections(kidsdata)) {
            if (list.length === 0) continue;
            const label = labelForSubject(key);
            const cards = list
                .filter((kid) => kid && typeof kid === "object")
                .map((kid) => buildKidCardHTML(kid, label))
                .join("");
            if (cards) sections.push(`<div class="tsm-subj-title">${escapeHTML(label)}</div>` + cards);
        }
        commonarr = sections.join("");
        if (commonarr) {
            renderKidCards(infobar, commonarr);
        } else {
            const keys = raw && typeof raw === "object" ? Object.keys(raw).join(", ") : typeof raw;
            renderKidCards(infobar, `<div class="tsm-empty">Ученики не найдены.<br>Ключи ответа API: <b>${escapeHTML(keys)}</b><br><span class="tsm-text-xs">Подробности — в консоли (F12)</span></div>`);
        }

        for (const [key, list] of kidSections(kidsdata)) {
            if (list.length > 0) addOption(objSel, labelForSubject(key), key);
        }
    } catch (err) {
        console.error("[TSM Ученики] ошибка загрузки:", err);
        createNotify("Ошибка загрузки учеников: " + err.message, "error");
        renderKidCards(infobar, `<div class="tsm-empty">Не удалось загрузить учеников: ${escapeHTML(err.message)}<br><span class="tsm-text-xs">Проверьте, что вы вошли в ЛКП (F12 → Console)</span></div>`);
    }

    document.getElementById("usersearchskysmart").oninput = function () {
        const query = this.value.toLowerCase().trim();
        if (!query) {
            renderKidCards(infobar, commonarr || "");
            return;
        }
        const matches = [];
        for (const [key, list] of kidSections(kidsdata)) {
            const label = labelForSubject(key);
            for (const kid of list) {
                if (!kid) continue;
                const name = String(kid.name || "").toLowerCase();
                if (name.includes(query) || String(kid.id ?? "").includes(query)) {
                    matches.push(buildKidCardHTML(kid, label));
                }
            }
        }
        renderKidCards(infobar, matches.join("") ||
            `<div class="tsm-empty">Ничего не найдено по запросу «${escapeHTML(this.value.trim())}»</div>`);
    };

    function showselectedsubject() {
        const selected = document.getElementById("listofsubjects").value;
        if (selected === "all") {
            renderKidCards(infobar, commonarr || "");
            return;
        }
        if (!Array.isArray(kidsdata[selected]) || kidsdata[selected].length === 0) {
            renderKidCards(infobar, `<div class="tsm-empty">В разделе «${escapeHTML(labelForSubject(selected))}» учеников нет</div>`);
            return;
        }
        renderKidCards(
            infobar,
            `<div class="tsm-subj-title">${escapeHTML(labelForSubject(selected))}</div>` +
            kidsdata[selected].filter((kid) => kid && typeof kid === "object")
                .map((kid) => buildKidCardHTML(kid, labelForSubject(selected))).join("")
        );
    }

    document.getElementById("actualizestudreportkids").onclick = async function () {
        const studentIds = Array.from(document.getElementsByClassName("tsm-id-badge"))
            .map((el) => el.textContent.match(/\d+/)?.[0])
            .filter(Boolean);

        if (studentIds.length === 0) {
            createNotify("Нет учеников для актуализации отчётов", "error");
            return;
        }

        const BATCH_SIZE = 5;
        for (let i = 0; i < studentIds.length; i += BATCH_SIZE) {
            const batch = studentIds.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map((studentId) =>
                fetch("https://api-profile.skyeng.ru/api/v1/students/" + studentId + "/school-report", {
                    body: '{"student_level":"--","materials_used":"--","endurance":"--","distraction":"--","difficulties":"--","activities":"--","skills_to_develop":"--","technical_problems":"--","homework":"--"}',
                    headers: { "Content-Type": "application/json" },
                    method: "POST",
                    credentials: "include"
                }).catch((err) => console.error("Report actualization error for student " + studentId, err))
            ));
            if (i + BATCH_SIZE < studentIds.length) {
                await new Promise((r) => setTimeout(r, 150));
            }
        }

        createNotify("Отчеты об учениках были успешно актуализированы с заполнением полей --");
    };

    document.getElementById("listofsubjects").onchange = showselectedsubject;
};
