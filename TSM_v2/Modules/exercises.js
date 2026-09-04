/* =========================================================
   TSM Exercises — NEON GLASS ULTRA Refactored
   ========================================================= */

let hwroomdata = '';
let ttcroomdata = '';

const win_kidsExercises = `
<div class="tsm-window-grab">
    <div class="tsm-toolbar" id="exercisesSkysmartHeader">
        <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hideExercisesSkysmartMenu">Скрыть</button>
        <button class="tsm-btn tsm-btn-sm" id="RefreshInfoExerciseKids" title="Обновляет информацию по открытой комнате">♻</button>
        <span id="studname" class="tsm-identity tsm-text-cyan tsm-glow-cyan"></span>
        <span id="studserviceid" class="tsm-identity tsm-cursor-pointer"></span>
        <span id="studid" class="tsm-identity tsm-cursor-pointer"></span>
    </div>
    <div class="tsm-toolbar" id="exercisesSkysmartTeacher">
        <label class="tsm-checkbox-label">
            <input type="checkbox" id="hideNullCards">Скрыть Темы с 0 карточек
        </label>
        <span id="teachname" class="tsm-identity tsm-text-cyan tsm-glow-cyan"></span>
        <span id="teachdid" class="tsm-identity tsm-cursor-pointer"></span>
    </div>
    <div class="tsm-input-group">
        <input id="roomhashhwkids" placeholder="homework link" class="tsm-input tsm-input-centered tsm-input-pill">
        <button class="tsm-btn tsm-btn-sm" id="getroomdatakids">🔎</button>
    </div>
    <div id="exercisebarskysmart" class="tsm-exercise-bar"></div>
</div>`;

const win_TTCExercises = `
<div class="tsm-window-grab">
    <div class="tsm-toolbar" id="exercisesTTCHeader">
        <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hideExercisesTTCMenu">Скрыть</button>
        <button class="tsm-btn tsm-btn-sm" id="RefreshInfoExerciseTTC" title="Обновляет информацию по открытой комнате">♻</button>
    </div>
    <div class="tsm-input-group">
        <input id="roomhashttc" placeholder="Room link" class="tsm-input tsm-input-centered">
        <button class="tsm-btn tsm-btn-sm" id="getroomdatattc">🔎</button>
    </div>
    <div id="exercisebarttc" class="tsm-exercise-bar"></div>
</div>`;

const win_complectationExercises = `
<div class="tsm-window-grab">
    <div class="tsm-info-panel" id="exercisesComplectHeaderWrapper">
        <div class="tsm-info-row" id="exercisesComplectHeader">
            <button class="tsm-btn tsm-btn-hide" id="hideExercisesComplectMenu" title="скрыть меню">Скрыть</button>
            <button class="tsm-btn tsm-btn-sm" id="RefreshInfoExerciseComplect" title="Обновляет информацию по открытой комнате">♻</button>
            <div class="tsm-chip tsm-chip-blue"><span id="studnameComplect"></span></div>
            <div class="tsm-chip" title="ID услуги"><span id="studserviceidComplect"></span></div>
            <div class="tsm-chip" title="ID ученика"><span id="studidComplect"></span></div>
            <div class="tsm-chip" title="ID группы"><span id="groupidComplect"></span></div>
        </div>
        <div class="tsm-info-row" id="exercisesComplectTeacher">
            <div class="tsm-chip tsm-chip-purple"><span id="teachnameComplect"></span></div>
            <div class="tsm-chip" title="ID учителя"><span id="teachdidComplect"></span></div>
            <div class="tsm-chip tsm-chip-green"><span id="RoomStatus"></span></div>
        </div>
    </div>
    <div class="tsm-input-group">
        <input id="roomhashhwComplect" placeholder="Room link" class="tsm-input tsm-input-centered tsm-input-pill">
        <button class="tsm-btn tsm-btn-sm" id="getroomdataComplect">🔎</button>
    </div>
    <div id="exercisebarComplect" class="tsm-exercise-bar"></div>
</div>`;

const wintExercSkysmart = createTSMWindow('AFMS_SkysmartExercInfo', 'winTopexercisesSkysmart', 'winLeftexercisesSkysmart', win_kidsExercises);
wintExercSkysmart.className = 'tsm-window tsm-window-exercises';

const wintExercTTC = createTSMWindow('AFMS_TTCExercInfo', 'winTopexercisesTTC', 'winLeftexercisesTTC', win_TTCExercises);
wintExercTTC.className = 'tsm-window tsm-window-exercises';

const wintComplect = createTSMWindow('AFMS_Complect', 'winTopComplect', 'winLeftComplect', win_complectationExercises);
wintComplect.className = 'tsm-window tsm-window-exercises';

async function OpenExercisesSmartroom() {
    if (wintExercSkysmart.style.display == 'none') {
        wintExercSkysmart.style.display = '';
        wintExercTTC.style.display = 'none';
        document.getElementById('RefreshInfoExerciseKids').onclick = function () {
            document.getElementById('roomhashhwkids').value = document.URL;
        };
        document.getElementById('hideExercisesSkysmartMenu').onclick = function () {
            wintExercSkysmart.style.display = 'none';
        };
        document.getElementById('roomhashhwkids').value = document.URL;
        setTimeout(function () {
            getroomdatakids.click();
        }, 1000);
        document.getElementById('getroomdatakids').onclick = async function () {
            document.getElementById('exercisebarskysmart').innerHTML = '';
            let urlComponents = document.getElementById('roomhashhwkids').value.split('/');
            if (!urlComponents[4] || !urlComponents[6]) {
                createNotify('Некорректная ссылка на комнату', 'error');
                return;
            }
            let hashroomkids = urlComponents[6].split('?')[0];
            let kidsselector = urlComponents[4];
            const baseURL = `https://api-${kidsselector}.skyeng.ru/api/v2/rooms/`;
            await gethwroominfo(baseURL, hashroomkids);
            getkidsroominfo(hwroomdata, kidsselector);
        };
    } else {
        wintExercSkysmart.style.display = 'none';
    }
}

async function gethwroominfo(api, hash) {
    await fetch(api + hash, { "credentials": "include" })
        .then(r => r.json()).then(r => hwroomdata = r);
}

const hideNullCardsCheckbox = document.getElementById("hideNullCards");
let checkedHideNullCards = localStorage.getItem("Nullcards");
if (checkedHideNullCards === null) {
    checkedHideNullCards = "1";
    localStorage.setItem("Nullcards", checkedHideNullCards);
    hideNullCardsCheckbox.checked = true;
} else {
    hideNullCardsCheckbox.checked = checkedHideNullCards === "1";
}
hideNullCardsCheckbox.addEventListener("change", function () {
    checkedHideNullCards = this.checked ? "1" : "0";
    localStorage.setItem("Nullcards", checkedHideNullCards);
    document.getElementById('getroomdatakids').click();
});

async function LoadStep(stepuuid) {
    const response = await fetch("https://api-english.skyeng.ru/api/student-cabinet/v1/step-store/load-step", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ stepUuid: stepuuid, last: true, language: "ru", baseDomain: "skyeng.ru" }),
        credentials: "include"
    });
    const data = await response.json();
    return String(data.id);
}

async function ResetStepProgress(apiName, userId, stepId, roomHash) {
    try {
        const response = await fetch(`https://api-${apiName}.skyeng.ru/api/v1/store-blocks/delete`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ userId: userId, contentGroupId: stepId, roomHash: roomHash }),
            credentials: "include"
        });
        if (!response.ok) {
            console.error("Ошибка удаления:", response.status, response.statusText);
            return false;
        }
        const result = await response.json();
        console.log("Удаление прошло успешно:", result);
        return true;
    } catch (err) {
        console.error("Сбой при запросе:", err);
        return false;
    }
}

function getkidsroominfo(data, subjecttype) {
    const nullCards = localStorage.getItem("Nullcards") === "1";
    const studentId = data.participants.find(p => p.role === "student")?.userId;
    const indexOfSlides = data.lessonCards.findIndex(c => c.userId === studentId);

    const normalizeCard = (card) => {
        let completeness = card.completeness;
        let score = card.score;
        if (completeness === 100 && score == null) score = 100;
        if (completeness == null) { completeness = "——"; score = "—"; }
        return { completeness, score };
    };

    const renderCategory = (title, cardBlock, isHomework = false) => {
        const themes = cardBlock[indexOfSlides].themes;
        let rows = "";
        themes.forEach(theme => {
            if (!nullCards || theme.cards.length > 0) {
                rows += `<tr class="tsm-theme-row"><td colspan="8">
                    <span class="tsm-btn-save" title="Копирует в буфер обмена ссылку на CMS для этого урока" data-subtype="${subjecttype}" data-lessonid="${theme.meta.contentLessonId}">💾</span>
                    ${theme.name}
                </td></tr>`;
            }
            theme.cards.forEach((card, idx) => {
                const { completeness, score } = normalizeCard(card);
                const emphasisIcons = { writing: "✏", pronunciation: "🎧", speaking: "🎙" };
                const icon = isHomework ? (emphasisIcons[card.emphasis] || "") : "";
                const cardName = card.name + icon;
                const completenessCell = completeness == 100
                    ? `<td class="tsm-table-cell-center" style="background:rgba(57,255,20,0.15); color:var(--tsm-neon-lime);">${completeness}</td>`
                    : `<td class="tsm-table-cell-center" style="background:rgba(255,140,0,0.12); color:var(--tsm-neon-orange);">${completeness}</td>`;
                rows += `<tr class="tsm-card-row">
                    <td class="tsm-table-cell-center">${idx + 1}</td>
                    <td class="tsm-table-cell">${cardName}</td>
                    <td class="tsm-table-cell-center">${score}</td>
                    ${completenessCell}
                    <td class="tsm-btn-save tsm-table-cell-center" title="Копирует в буфер обмена ссылку на CMS для этого слайда" data-subtype="${subjecttype}" data-lessonid="${theme.meta.contentLessonId}" data-stepid="${card.id}">💾</td>
                    <td class="tsm-table-cell-center tsm-text-xs">${toMoscowTime(card.sentAt)}</td>
                    <td class="tsm-table-cell-center tsm-text-xs">${toMoscowTime(card.scoreUpdatedAt)}</td>
                    ${isHomework ? `<td class="tsm-btn-reset tsm-table-cell-center" data-stepUUID="${card.stepUuid}">🔄️</td>` : ""}
                </tr>`;
            });
        });

        return `<div class="tsm-collapsible">${title}</div>
        <div class="tsm-slide-box" style="display:none">
            <div class="tsm-exercise-item">
                <div style="text-align:center;">Информация по категории: ${title}</div>
                Количество завершенных карточек: ${cardBlock[indexOfSlides].completedCardsCount} из ${cardBlock[indexOfSlides].cardsCount}
                <br>Общий % завершения слайдов: ${cardBlock[indexOfSlides].completeness}%
                <br>Итоговый результат: ${cardBlock[indexOfSlides].score} баллов из 100
            </div>
            <table class="tsm-slide-table" style="width:100%; border-collapse:collapse; margin-top:10px;">
                <thead><tr class="tsm-table-header">
                    <th class="tsm-table-cell-center">#</th>
                    <th class="tsm-table-cell-center">Название слайда</th>
                    <th class="tsm-table-cell-center">Балл</th>
                    <th class="tsm-table-cell-center">%</th>
                    <th class="tsm-table-cell-center">Ссылка</th>
                    <th class="tsm-table-cell-center">Задано</th>
                    <th class="tsm-table-cell-center">Обновлен скор</th>
                    ${isHomework ? `<th class="tsm-table-cell-center">Сброс</th>` : ""}
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    };

    document.getElementById("exercisebarskysmart").innerHTML +=
        renderCategory("🎓План урока", data.lessonCards) +
        renderCategory("💼План домашки", data.homeworkCards, true);

    let subjbtnsarr = document.getElementById('exercisebarskysmart').getElementsByClassName('tsm-collapsible');
    let slidesbar = document.getElementById('exercisebarskysmart').getElementsByClassName('tsm-slide-box');
    for (let i = 0; i < subjbtnsarr.length; i++) {
        subjbtnsarr[i].onclick = function () {
            if (slidesbar[i].style.display == 'none') slidesbar[i].style.display = '';
            else slidesbar[i].style.display = 'none';
        };
    }

    let savelinkarr = document.getElementById('exercisebarskysmart').getElementsByClassName('tsm-btn-save');
    for (let z = 0; z < savelinkarr.length; z++) {
        savelinkarr[z].onclick = function () {
            let subtype = this.getAttribute('data-subtype');
            let lessonid = this.getAttribute('data-lessonid');
            let stepid = this.getAttribute('data-stepid');
            let link = !stepid ? `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}` : `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}/cards/${stepid}/edit`;
            savelinkarr[z].textContent = "✅";
            copyToClipboardTSM(link);
            createNotify('💾 Ссылка на слайд в CMS cкопирована в буфер обмена', 'message');
            setTimeout(function () { savelinkarr[z].textContent = "💾"; }, 4000);
        };
    }

    let rstProgArray = document.getElementById('exercisebarskysmart').getElementsByClassName('tsm-btn-reset');
    for (let k = 0; k < rstProgArray.length; k++) {
        rstProgArray[k].onclick = async function () {
            let apiToDoName = location.pathname.split('/')[2].trim();
            let roomhashtoinsert = location.pathname.split('/')[4].trim();
            let stepuuid = this.getAttribute('data-stepUuid');
            let studentID = Number(document.getElementById('studid').textContent.split(" ")[1]);
            let getNumberToDelete = await LoadStep(stepuuid);
            const success = await ResetStepProgress(apiToDoName, studentID, getNumberToDelete, roomhashtoinsert);
            if (success) {
                rstProgArray[k].textContent = "✅";
                setTimeout(function () { rstProgArray[k].textContent = "🔄️"; }, 4000);
            } else {
                rstProgArray[k].textContent = "❌";
                setTimeout(function () { rstProgArray[k].textContent = "🔄️"; }, 4000);
            }
        };
    }

    if (data.participants[0].role == 'student') {
        renderSkysmartIdentity(data.participants[0], data.participants[1]);
    } else if (data.participants[1].role == 'student') {
        renderSkysmartIdentity(data.participants[1], data.participants[0]);
    }
}

function setIdField(elementId, label, value) {
    const el = document.getElementById(elementId);
    el.innerHTML = `<span class="tsm-user-select-none tsm-identity-emoji">${label}</span>${value}`;
    if (value != null) {
        el.style.cursor = "pointer";
        markCopyable(el, String(value));
    }
}

function renderSkysmartIdentity(student, teacher) {
    document.getElementById('studname').innerHTML = '<span class="tsm-identity-emoji"> 👨‍🎓 </span>' + student.name;
    setIdField('studserviceid', '🆔 услуги: ', student.educationServiceId);
    setIdField('studid', '🆔: ', student.userId);
    document.getElementById('teachname').innerHTML = '<span class="tsm-identity-emoji"> 👽 Teacher </span>' + teacher.name;
    setIdField('teachdid', '🆔: ', teacher.userId);
}

async function getTTCData() {
    let rhash = document.getElementById('roomhashttc').value;
    if (rhash.length < 20) {
        await fetch("https://ttc-api.skyeng.ru/api/v1/lesson/join", {
            "headers": { "content-type": "application/json" },
            "body": "{\"roomHash\":\"" + rhash + "\"}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(r => r.json()).then(r => ttcroomdata = r);
        console.log(ttcroomdata);
        let tmparr = '';
        for (let i = 0; i < ttcroomdata.participants[0].nodes[0].steps.length; i++) {
            if (ttcroomdata.participants[0].nodes[0].steps[i].score == null) ttcroomdata.participants[0].nodes[0].steps[i].score = 0;
            if (ttcroomdata.participants[0].nodes[0].steps[i].completeness == null) ttcroomdata.participants[0].nodes[0].steps[i].completeness = 0;
            const step = ttcroomdata.participants[0].nodes[0].steps[i];
            tmparr += `<div class="tsm-exercise-item" style="display:grid; grid-template-columns: auto 1fr auto auto auto; align-items:center; gap:8px; padding:8px 12px;">
                <span>${i + 1}.</span>
                <span>${step.title}</span>
                <span class="tsm-ttc-step-id">${step.stepId}</span>
                <span class="tsm-btn-save-ttc" title="Копирует в буфер обмена ссылку на CMS для этого слайда"> 💾 </span>
                <span class="tsm-text-bisque tsm-text-sm tsm-text-right" style="min-width:40px;">${step.completeness}%</span>
                <span class="tsm-text-bisque tsm-text-sm tsm-text-right" style="min-width:30px;">${step.score / 10}</span>
            </div>`;
        }
        const ttcSummary = ttcroomdata.participants[0].nodes[0];
        document.getElementById('exercisebarttc').innerHTML =
            `<div class="tsm-ttc-summary">"${ttcSummary.title}" • Выполнено на: ${ttcSummary.completeness}% • Оценка: ${ttcSummary.score / 10}</div>` +
            `<div class="tsm-ttc-header-row">
                <span style="flex:1">Название слайда</span>
                <span style="min-width:50px; text-align:center;">Балл</span>
                <span style="min-width:40px; text-align:center;">%</span>
                <span style="min-width:50px; text-align:center;">Ссылка</span>
            </div>` + tmparr;
        let savelinkarr = document.getElementsByClassName('tsm-btn-save-ttc');
        for (let z = 0; z < savelinkarr.length; z++) {
            savelinkarr[z].onclick = function () {
                copyToClipboardTSM("https://content-vimbox.skyeng.ru/cms/stepStore/update/stepId/" + document.getElementsByClassName('tsm-ttc-step-id')[z].textContent);
            };
        }
    }
}

async function OpenExercisesTTC() {
    if (wintExercTTC.style.display == 'none') {
        wintExercTTC.style.display = '';
        wintExercSkysmart.style.display = 'none';
        if (location.host == 'ttc.skyeng.ru') {
            document.getElementById('roomhashttc').value = document.URL.split('/')[5];
            getTTCData();
        } else {
            document.getElementById('roomhashttc').value = "Не открыт TTC курс! Откройте и повторите Или введите хеш одним словом";
        }
        document.getElementById('hideExercisesTTCMenu').onclick = function () {
            wintExercTTC.style.display = 'none';
        };
        document.getElementById('RefreshInfoExerciseTTC').onclick = function () {
            if (location.host == 'ttc.skyeng.ru') {
                document.getElementById('roomhashttc').value = document.URL.split('/')[5];
                getTTCData();
            } else {
                document.getElementById('roomhashttc').value = "Не открыт TTC курс! Откройте и повторите Или введите хеш одним словом";
            }
        };
        document.getElementById('getroomdatattc').onclick = getTTCData;
    } else {
        wintExercTTC.style.display = 'none';
    }
}

async function OpenExercisesComplect() {
    if (document.getElementById('AFMS_Complect').style.display == 'none') {
        wintComplect.style.display = '';
        wintExercSkysmart.style.display = 'none';
        wintExercTTC.style.display = 'none';
        document.getElementById('AFMS_addMenu').style.display = 'none';
        document.getElementById('roomhashhwComplect').value = document.URL;
        setTimeout(function () {
            getroomdataComplect.click();
        }, 500);
    } else {
        wintComplect.style.display = 'none';
    }
    document.getElementById('hideExercisesComplectMenu').onclick = function () {
        wintComplect.style.display = 'none';
    };

    function buildCardsTable(themes, kidsselector) {
        let html = `<table class="tsm-exercise-table"><thead><tr class="tsm-table-header">
            <th class="tsm-table-cell-center">#</th>
            <th class="tsm-table-cell-center">Название</th>
            <th class="tsm-table-cell-center">Балл</th>
            <th class="tsm-table-cell-center">%</th>
            <th class="tsm-table-cell-center">Ссылка</th>
        </tr></thead><tbody>`;
        for (let i = 0; i < themes.length; i++) {
            const theme = themes[i];
            const contentLessonId = theme.meta.contentLessonId;
            html += `<tr class="tsm-theme-row"><td colspan="5" class="tsm-theme-title">
                <span class="tsm-btn-save" complectationsData-subtype="${kidsselector}" complectationsData-lessonid="${contentLessonId}" title="Скопировать ссылку на урок">💾</span>
                ${theme.name}
            </td></tr>`;
            for (let j = 0; j < theme.cards.length; j++) {
                const card = theme.cards[j];
                const completeness = card.completeness ?? "——";
                const score = card.score ?? "—";
                let name = card.name;
                if (card.emphasis === "writing") name += " ✏";
                if (card.emphasis === "pronunciation") name += " 🎧";
                if (card.emphasis === "speaking") name += " 🎙";
                html += `<tr class="tsm-card-row">
                    <td class="tsm-table-cell-center">${j + 1}</td>
                    <td class="tsm-table-cell-center">${name}</td>
                    <td class="tsm-table-cell-center">${score}</td>
                    <td class="tsm-table-cell-center">${completeness}</td>
                    <td class="tsm-btn-save tsm-table-cell-center" complectationsData-subtype="${kidsselector}" complectationsData-lessonid="${contentLessonId}" complectationsData-stepid="${card.id}" title="Скопировать ссылку на слайд">💾</td>
                </tr>`;
            }
        }
        html += `</tbody></table>`;
        return html;
    }

    function buildCollapsibleBlock(title, infoHTML, tableHTML) {
        return `<div class="tsm-collapsible">${title}</div>
        <div class="tsm-slide-box" style="display:none">
            ${infoHTML}
            ${tableHTML}
        </div>`;
    }

    function buildCategoryInfoBlock(cardData, title) {
        return `<div class="category-info" style="color:bisque;">
            <div style="margin-left:30%"><b>Информация по категории: ${title}</b></div>
            <div>Количество завершенных карточек: ${cardData.completedCardsCount} из ${cardData.cardsCount}</div>
            <div>Общий % завершения слайдов: ${cardData.completeness}%</div>
            <div>Итоговый результат: ${cardData.score} баллов из 100</div>
        </div>`;
    }

    document.getElementById('getroomdataComplect').onclick = async function () {
        document.getElementById('exercisebarComplect').innerHTML = '';
        const rhash = document.getElementById('roomhashhwComplect').value;
        const urlComponents = rhash.split('/');
        if (!urlComponents[4] || !urlComponents[6]) {
            createNotify('Некорректная ссылка на комнату', 'error');
            return;
        }
        const isTest = urlComponents[6].split('?')[0] === 'test';
        const kidsselector = urlComponents[4];
        const hashroomkids = isTest ? urlComponents[7] : urlComponents[6].split('?')[0];
        const baseURL = `https://api-${kidsselector}.skyeng.ru/api/v2/rooms/${hashroomkids}${isTest ? '' : '?verbosity=only_mine_participants'}`;

        const complectationsData = await fetch(baseURL, {
            method: isTest ? "GET" : "POST",
            mode: "cors",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: isTest ? null : `{\"roomHash\":\"${rhash}\"}`
        }).then(r => r.json());

        const student = complectationsData.participants.find(p => p.role === "student");
        const indexOfSlides = complectationsData.lessonCards.findIndex(c => c.userId === student.userId);

        const lessonInfo = buildCategoryInfoBlock(complectationsData.lessonCards[indexOfSlides], "План урока");
        const lessonTable = buildCardsTable(complectationsData.lessonCards[indexOfSlides].themes, kidsselector);
        document.getElementById('exercisebarComplect').innerHTML += buildCollapsibleBlock("🎓План урока", lessonInfo, lessonTable);

        const homeworkInfo = buildCategoryInfoBlock(complectationsData.homeworkCards[indexOfSlides], "План домашки");
        const homeworkTable = buildCardsTable(complectationsData.homeworkCards[indexOfSlides].themes, kidsselector);
        document.getElementById('exercisebarComplect').innerHTML += buildCollapsibleBlock("💼План домашки", homeworkInfo, homeworkTable);

        const diagnosticBlock = complectationsData.diagnosticsCards?.[indexOfSlides];
        const hasDiagnosticCards = diagnosticBlock && Array.isArray(diagnosticBlock.themes) && diagnosticBlock.themes.some(theme => theme.cards.length > 0);
        if (hasDiagnosticCards) {
            const diagnosticInfo = buildCategoryInfoBlock(diagnosticBlock, "Diagnostic");
            const diagnosticTable = buildCardsTable(diagnosticBlock.themes, kidsselector);
            document.getElementById('exercisebarComplect').innerHTML += buildCollapsibleBlock("Diagnostic", diagnosticInfo, diagnosticTable);
        }

        const subjbtnsarr = document.getElementById('exercisebarComplect').getElementsByClassName('tsm-collapsible');
        const slidesbar = document.getElementById('exercisebarComplect').getElementsByClassName('tsm-slide-box');
        for (let i = 0; i < subjbtnsarr.length; i++) {
            subjbtnsarr[i].onclick = function () {
                slidesbar[i].style.display = slidesbar[i].style.display === 'none' ? '' : 'none';
            };
        }

        const savelinkarr = document.getElementById('exercisebarComplect').getElementsByClassName('tsm-btn-save');
        for (let z = 0; z < savelinkarr.length; z++) {
            savelinkarr[z].onclick = function () {
                const subtype = this.getAttribute('complectationsData-subtype');
                const lessonid = this.getAttribute('complectationsData-lessonid');
                const stepid = this.getAttribute('complectationsData-stepid');
                const link = stepid ? `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}/cards/${stepid}/edit` : `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}`;
                savelinkarr[z].textContent = "✅";
                copyToClipboardTSM(link);
                createNotify('💾 Ссылка на слайд в CMS cкопирована в буфер обмена', 'message');
                setTimeout(function () { savelinkarr[z].textContent = "💾"; }, 4000);
            };
        }

        const studentIndex = complectationsData.participants.findIndex(p => p.role === 'student');
        const teacherIndex = 1 - studentIndex;
        const studentData = complectationsData.participants[studentIndex];
        const teacherData = complectationsData.participants[teacherIndex];

        renderComplectIdentity(studentData, teacherData, complectationsData.groupInfo?.externalGroupId, complectationsData.status);
    };
}

function renderComplectIdentity(studentData, teacherData, externalGroupId, status) {
    document.getElementById('studnameComplect').innerHTML = `<span class="tsm-identity-emoji"> 👨‍🎓 </span>${studentData.name}`;
    setIdField('studserviceidComplect', '🆔 услуги: ', studentData.educationServiceId);
    setIdField('studidComplect', '🆔: ', studentData.userId);
    setIdField('groupidComplect', '🆔 гр: ', externalGroupId);
    document.getElementById('teachnameComplect').innerHTML = `<span class="tsm-identity-emoji"> 👽 Teacher </span>${teacherData.name}`;
    setIdField('teachdidComplect', '🆔: ', teacherData.userId);
    const statusColor = status === 'success' ? 'var(--tsm-neon-lime)' : 'var(--tsm-neon-gold)';
    document.getElementById('RoomStatus').innerHTML = `<span class="tsm-user-select-none tsm-identity-emoji">Статус комнаты: </span><span style="color:${statusColor}; text-shadow:0 0 8px ${statusColor};">${status}</span>`;
}
