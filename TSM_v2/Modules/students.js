/* =========================================================
   TSM Students — NEON GLASS ULTRA Refactored
   ========================================================= */

var win_studentsAdults = `<div style="display: flex;">
    <span style="cursor: -webkit-grab;">
        <div style="margin: 5px;" id="studentsAdultsHeader">
            <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hidestudentsAdultstMenu">hide</button>
            <button class="tsm-btn" id="addallchatswithadult" style="margin:5px" title="Добавляет чаты со всеми учениками из раздела Уроки">➕💬</button>
            <button class="tsm-btn tsm-btn-sm" id="actualizestudreportadult" style="margin:5px" title="Актуализирует отчеты по всем ученикам заполняя поля символами --">📝</button>
        </div>
        <input id="usersearch" class="tsm-input" style="margin-left: 8px;width: 628px; text-align:center;" placeholder="Enter user ID or name for search">
        <div id="infobaradult" class="tsm-info-bar-adult"></div>
    </span>
</div>`;

var win_studentsSkysmart = `<div style="display: flex;">
    <span style="cursor: -webkit-grab;">
        <div style="margin: 5px;" id="studentsSkysmartHeader">
            <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hidestudentsSkysmartMenu">hide</button>
            <select id="listofsubjects"><option value="all">Все</option></select>
            <button class="tsm-btn" id="actualizestudreportkids" style="margin:5px" title="Актуализирует отчеты по всем ученикам в выбранном разделе все или отдельно каждом заполняя поля символами --">📝</button>
        </div>
        <input id="usersearchskysmart" class="tsm-input" style="margin-left: 8px;width: 628px; text-align:center;" placeholder="Enter user ID for search">
        <div id="infobarskysmart" class="tsm-info-bar-kids"></div>
    </span>
</div>`;

const wintStudAdults = createTSMWindow('AFMS_AdultStudInfo', 'winTopstudentsAdults', 'winLeftstudentsAdults', win_studentsAdults);
wintStudAdults.className = 'tsm-window tsm-window-students-adult';

const wintStudSkysmart = createTSMWindow('AFMS_SkysmartStudInfo', 'winTopstudentsSkysmart', 'winLeftstudentsSkysmart', win_studentsSkysmart);
wintStudSkysmart.className = 'tsm-window tsm-window-students-kids';

document.getElementById('hidestudentsSkysmartMenu').onclick = function () { wintStudSkysmart.style.display = 'none'; };
document.getElementById('hidestudentsAdultstMenu').onclick = function () { wintStudAdults.style.display = 'none'; };

const SUBJECT_MAP = {
    math: 'Математика', english: 'Английский язык', russian: 'Русский язык',
    'social-science': 'Обществознание', preschool: 'Дошколка', chess: 'Шахматы',
    'computer-science': 'Компьютерные курсы', chemistry: 'Химия', physics: 'Физика',
    history: 'История', biology: 'Биология', geography: 'География'
};

function buildKidCardHTML(kid, subjectKey) {
    const statusSymbol = kid.status === 'sleep' ? '💤' : (kid.status === 'vacation' ? '⛱' : '');
    const statusTitle = kid.status === 'sleep' ? 'ученик уснул' : (kid.status === 'vacation' ? 'ученик в отпуске' : '');
    const segmentBadge = kid.segmentBadge ? `<div class="tsm-badge">${kid.segmentBadge}</div>` : '';
    const serviceLocale = kid.serviceLocale || 'Пусто';
    const statusClass = kid.status || '';
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

function attachKidActions(container) {
    let arrmvurepkid = container.getElementsByName('mvurkidseport');
    for (let j = 0; j < arrmvurepkid.length; j++) {
        arrmvurepkid[j].onclick = function () {
            window.open("https://overbooking.skyeng.ru/html/report?student_id=" + container.getElementsByClassName('tsm-id-badge')[j].textContent.match(/\d+/)[0]);
        };
    }
    let kidsprofile = container.getElementsByName('openkidsprofile');
    for (let l = 0; l < kidsprofile.length; l++) {
        kidsprofile[l].onclick = function () {
            window.open("https://vimbox.skyeng.ru/profile/" + container.getElementsByClassName('tsm-id-badge')[l].textContent.match(/\d+/)[0]);
        };
    }
    let kidspaymentshistory = container.getElementsByName('openpaymentkidsshistory');
    for (let l = 0; l < kidspaymentshistory.length; l++) {
        kidspaymentshistory[l].onclick = function () {
            window.open('https://vimbox.skyeng.ru/profile/student/' + container.getElementsByClassName('tsm-id-badge')[l].textContent.match(/\d+/)[0] + '/last-classes');
        };
    }
}

document.getElementById('openstudentsmenu').onclick = async function () {
    if (wintStudSkysmart.style.display == 'none') {
        wintStudSkysmart.style.display = '';
        wintStudAdults.style.display = 'none';
        let commonarr = '';
        document.getElementById('infobarskysmart').innerHTML = '';
        let objSel = document.getElementById("listofsubjects");
        objSel.length = 1;
        objSel[0].selected = true;

        await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", { "credentials": "include", "method": "POST" })
            .then(r => r.json()).then(r => artId = r);
        console.log(artId);

        await fetch("https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/personal", {
            "headers": { "content-type": "application/json" },
            "method": "POST",
            "body": "{\"teacherId\":null}",
            "credentials": "include"
        }).then(r => r.json()).then(r => kidsdata = r);
        console.log(kidsdata);

        for (const [key, label] of Object.entries(SUBJECT_MAP)) {
            if (kidsdata[key]) {
                let arraytoshow = '';
                for (let j = 0; j < kidsdata[key].length; j++) {
                    arraytoshow += buildKidCardHTML(kidsdata[key][j], label);
                }
                const section = `<div class="tsm-subj-title">${label}</div>` + arraytoshow;
                document.getElementById('infobarskysmart').innerHTML += section;
                commonarr += section;
            }
        }

        for (const [key, label] of Object.entries(SUBJECT_MAP)) {
            if (kidsdata[key]) addOption(objSel, label, key);
        }

        document.getElementById('usersearchskysmart').oninput = function () {
            var val2 = this.value.toLowerCase();
            var s2 = '';
            for (const [key, label] of Object.entries(SUBJECT_MAP)) {
                if (!kidsdata[key]) continue;
                for (let j = 0; j < kidsdata[key].length; j++) {
                    let kid = kidsdata[key][j];
                    let kidName = kid.name.toLowerCase();
                    let kidId = kid.id.toString();
                    if (kidName.includes(val2) || kidId.includes(val2)) {
                        s2 += buildKidCardHTML(kid, label);
                    }
                }
            }
            const container = document.getElementById('infobarskysmart');
            container.innerHTML = document.getElementById("usersearchskysmart").value != '' ? s2 : commonarr;
            attachKidActions(container);
        };

        function showselectedsubject() {
            document.getElementById('infobarskysmart').innerHTML = '';
            let objSelf = document.getElementById("listofsubjects");
            const selected = objSelf.value;
            if (selected === 'all') {
                document.getElementById('infobarskysmart').innerHTML = commonarr;
            } else if (kidsdata[selected]) {
                let arraytoshow = '';
                for (let j = 0; j < kidsdata[selected].length; j++) {
                    arraytoshow += buildKidCardHTML(kidsdata[selected][j], SUBJECT_MAP[selected]);
                }
                document.getElementById('infobarskysmart').innerHTML = `<div class="tsm-subj-title">${SUBJECT_MAP[selected]}</div>` + arraytoshow;
            }
            attachKidActions(document.getElementById('infobarskysmart'));
        }

        document.getElementById('actualizestudreportkids').onclick = function () {
            let idslist = document.getElementsByClassName('tsm-id-badge');
            for (let k = 0; k < idslist.length; k++) {
                fetch("https://api-profile.skyeng.ru/api/v1/students/" + idslist[k].textContent.match(/\d+/)[0] + "/school-report", {
                    "body": "{\"student_level\":\"--\",\"materials_used\":\"--\",\"endurance\":\"--\",\"distraction\":\"--\",\"difficulties\":\"--\",\"activities\":\"--\",\"skills_to_develop\":\"--\",\"technical_problems\":\"--\",\"homework\":\"--\"}",
                    "method": "POST",
                    "credentials": "include"
                });
            }
            alert('Отчеты об учениках были успешно актуализированы с заполнением полей -- !');
        };

        attachKidActions(document.getElementById('infobarskysmart'));
        document.getElementById('listofsubjects').onchange = showselectedsubject;
    } else {
        wintStudSkysmart.style.display = 'none';
    }
};
