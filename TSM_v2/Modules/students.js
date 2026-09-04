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

document.getElementById("hidestudentsSkysmartMenu").onclick = function () { wintStudSkysmart.style.display = "none"; };
document.getElementById("hidestudentsAdultstMenu").onclick = function () { wintStudAdults.style.display = "none"; };

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

function buildKidCardHTML(kid, subjectKey) {
    const statusSymbol = kid.status === "sleep" ? "💤" : (kid.status === "vacation" ? "⛱" : "");
    const statusTitle = kid.status === "sleep" ? "ученик уснул" : (kid.status === "vacation" ? "ученик в отпуске" : "");
    const segmentBadge = kid.segmentBadge ? `<div class="tsm-badge">${kid.segmentBadge}</div>` : "";
    const serviceLocale = kid.serviceLocale || "Пусто";
    const statusClass = kid.status || "";
    return `<div class="tsm-kid-card ${statusClass}">
        <div class="tsm-subj-search">${subjectKey}</div>
        <div class="tsm-student-name-kid">
            <span title="${statusTitle}">${statusSymbol}</span> ${kid.name}
        </div>
        <div class="tsm-id-badge">🆔: ${kid.id}</div>
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
    if (!willShow) return;

    wintStudAdults.style.display = "none";
    document.getElementById("mainmenu").style.display = "none";
    document.getElementById("exercisesmenu").style.display = "none";

    const infobar = document.getElementById("infobarskysmart");
    infobar.innerHTML = "";

    const objSel = document.getElementById("listofsubjects");
    objSel.length = 1;
    objSel[0].selected = true;

    const response = await fetch("https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/personal", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: '{"teacherId":null}',
        credentials: "include"
    });
    const kidsdata = await response.json();

    const sections = [];
    for (const [key, label] of Object.entries(SUBJECT_MAP)) {
        if (!kidsdata[key]) continue;
        sections.push(`<div class="tsm-subj-title">${label}</div>` + kidsdata[key].map((kid) => buildKidCardHTML(kid, label)).join(""));
    }
    const commonarr = sections.join("");
    renderKidCards(infobar, commonarr);

    for (const [key, label] of Object.entries(SUBJECT_MAP)) {
        if (kidsdata[key]) addOption(objSel, label, key);
    }

    document.getElementById("usersearchskysmart").oninput = function () {
        const query = this.value.toLowerCase().trim();
        if (!query) {
            renderKidCards(infobar, commonarr);
            return;
        }
        const matches = [];
        for (const [key, label] of Object.entries(SUBJECT_MAP)) {
            if (!kidsdata[key]) continue;
            for (const kid of kidsdata[key]) {
                if (kid.name.toLowerCase().includes(query) || String(kid.id).includes(query)) {
                    matches.push(buildKidCardHTML(kid, label));
                }
            }
        }
        renderKidCards(infobar, matches.join(""));
    };

    function showselectedsubject() {
        const selected = document.getElementById("listofsubjects").value;
        if (selected === "all") {
            renderKidCards(infobar, commonarr);
            return;
        }
        if (!kidsdata[selected]) {
            infobar.innerHTML = "";
            return;
        }
        renderKidCards(
            infobar,
            `<div class="tsm-subj-title">${SUBJECT_MAP[selected]}</div>` +
            kidsdata[selected].map((kid) => buildKidCardHTML(kid, SUBJECT_MAP[selected])).join("")
        );
    }

    document.getElementById("actualizestudreportkids").onclick = async function () {
        const studentIds = Array.from(document.getElementsByClassName("tsm-id-badge"))
            .map((el) => el.textContent.match(/\d+/)[0]);

        await Promise.all(studentIds.map((studentId) =>
            fetch("https://api-profile.skyeng.ru/api/v1/students/" + studentId + "/school-report", {
                body: '{"student_level":"--","materials_used":"--","endurance":"--","distraction":"--","difficulties":"--","activities":"--","skills_to_develop":"--","technical_problems":"--","homework":"--"}',
                method: "POST",
                credentials: "include"
            })
        ));

        createNotify("Отчеты об учениках были успешно актуализированы с заполнением полей --");
    };

    document.getElementById("listofsubjects").onchange = showselectedsubject;
};
