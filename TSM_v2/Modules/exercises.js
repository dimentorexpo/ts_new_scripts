/* =========================================================
   TSM Exercises — NEON GLASS ULTRA Refactored
   ========================================================= */

let hwroomdata = '';

var win_kidsExercises = `<div style="display: flex;">
    <span style="cursor: -webkit-grab;">
        <div style="margin: 5px; width:550px;" id="exercisesSkysmartHeader">
            <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hideExercisesSkysmartMenu">hide</button>
            <button class="tsm-btn tsm-btn-sm" id="RefreshInfoExerciseKids" title="Обновляет информацию по открытой комнате" style="margin: 5px;">♻</button>
            <span id="studname" style="color:#d5f4ff; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
            <span id="studserviceid" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
            <span id="studid" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
        </div>
        <div style="margin: 5px; width:550px;" id="exercisesSkysmartTeacher">
            <label style="color: black; margin-left: 5px; background: mediumseagreen; font-weight: 700; box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 3px; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);">
                <input type="checkbox" id="hideNullCards">Скрыть Темы с 0 карточек
            </label>
            <span id="teachname" style="color:#d5f4ff; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
            <span id="teachdid" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
        </div>
        <div style="margin: 5px; width:551px;">
            <input id="roomhashhwkids" placeholder="homework link" class="tsm-input" style="width: 490px; margin-left: 10px; text-align: center; height: 30px; border-radius:20px;">
            <button class="tsm-btn tsm-btn-sm" style="border-radius: 20px; width: 34px !important; height: 34px !important; vertical-align: middle;" id="getroomdatakids">🔎</button>
        </div>
        <div id="exercisebarskysmart" class="tsm-exercise-bar"></div>
    </span>
</div>`;

var win_TTCExercises = `<div style="display: flex;">
    <span style="cursor: -webkit-grab;">
        <div style="margin: 5px; width:500px;" id="exercisesTTCHeader">
            <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hideExercisesTTCMenu">hide</button>
            <button class="tsm-btn tsm-btn-sm" id="RefreshInfoExerciseTTC" title="Обновляет информацию по открытой комнате" style="margin: 5px;">♻</button>
        </div>
        <div style="margin:5px;">
            <input id="roomhashttc" placeholder="Room link" class="tsm-input" style="width: 500px; margin-left: 10px; text-align: center; height: 30px;">
            <button class="tsm-btn tsm-btn-sm" id="getroomdatattc">🔎</button>
        </div>
        <div id="exercisebarttc" class="tsm-exercise-bar"></div>
    </span>
</div>`;

var win_complectationExercises = `<div style="display: flex;">
    <span style="cursor: -webkit-grab;">
<div class="tsm-info-panel" id="exercisesComplectHeaderWrapper">
    <!-- Строка Ученика и кнопок -->
    <div class="tsm-info-row" id="exercisesComplectHeader">
        <button class="tsm-btn tsm-btn-hide" id="hideExercisesComplectMenu" title="скрыть меню">hide</button>
        <button class="tsm-btn tsm-btn-sm" id="RefreshInfoExerciseComplect" title="Обновляет информацию по открытой комнате">♻</button>
        
        <div class="tsm-chip tsm-chip-blue"><span id="studnameComplect"></span></div>
        <div class="tsm-chip" title="ID услуги"><span id="studserviceidComplect"></span></div>
        <div class="tsm-chip" title="ID ученика"><span id="studidComplect"></span></div>
        <div class="tsm-chip" title="ID группы"><span id="groupidComplect"></span></div>
    </div>

    <!-- Строка Учителя -->
    <div class="tsm-info-row" id="exercisesComplectTeacher">
        <div class="tsm-chip tsm-chip-purple"><span id="teachnameComplect"></span></div>
        <div class="tsm-chip" title="ID учителя"><span id="teachdidComplect"></span></div>
        <div class="tsm-chip tsm-chip-green"><span id="RoomStatus"></span></div>
    </div>
</div>
        <div style="margin: 5px; width:550px;">
            <input id="roomhashhwComplect" placeholder="Room link" class="tsm-input" style="width: 490px; margin-left: 15px; text-align: center; height: 30px; border-radius:20px;">
            <button class="tsm-btn tsm-btn-sm" style="border-radius: 20px; width: 34px !important; height: 34px !important; vertical-align: middle;" id="getroomdataComplect">🔎</button>
        </div>
        <div id="exercisebarComplect" class="tsm-exercise-bar"></div>
    </span>
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
            let hashroomkids = urlComponents[6].split('?')[0];
            let kidsselector = urlComponents[4];
            const baseURL = `https://api-${kidsselector}.skyeng.ru/api/v2/rooms/`;
            await gethwroominfo(baseURL, hashroomkids);
            getkidsroominfo(data = hwroomdata, subjecttype = kidsselector);
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
                    ? `<td style="text-align:center; border: 1px solid black; background: green">${completeness}</td>`
                    : `<td style="text-align:center; border: 1px solid black; background: #bb6904">${completeness}</td>`;
                rows += `<tr class="tsm-card-row">
                    <td style="border: 1px solid black;">${idx + 1}</td>
                    <td style="border: 1px solid black;">${cardName}</td>
                    <td style="text-align:center; border: 1px solid black;">${score}</td>
                    ${completenessCell}
                    <td class="tsm-btn-save" style="width:80px; text-align:center; border: 1px solid black; cursor:pointer" title="Копирует в буфер обмена ссылку на CMS для этого слайда" data-subtype="${subjecttype}" data-lessonid="${theme.meta.contentLessonId}" data-stepid="${card.id}">💾</td>
                    <td style="border: 1px solid black; font-size: 12px; text-align:center;">${toMoscowTime(card.sentAt)}</td>
                    <td style="border: 1px solid black; font-size: 12px; text-align:center;">${toMoscowTime(card.scoreUpdatedAt)}</td>
                    ${isHomework ? `<td class="tsm-btn-reset" style="cursor:pointer; border:1px solid black;" data-stepUUID="${card.stepUuid}">🔄️</td>` : ""}
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
                    <th style="padding:6px; border: 1px solid black;">#</th>
                    <th style="padding:6px; border: 1px solid black;">Название слайда</th>
                    <th style="padding:6px; border: 1px solid black;">Балл</th>
                    <th style="padding:6px; border: 1px solid black;">%</th>
                    <th style="padding:6px; border: 1px solid black;">Ссылка</th>
                    <th style="padding:6px; border: 1px solid black;">Задано</th>
                    <th style="padding:6px; border: 1px solid black;">Обновлен скор</th>
                    ${isHomework ? `<th style="padding:6px; border: 1px solid black;">Сброс</th>` : ""}
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
    };

    document.getElementById("exercisebarskysmart").innerHTML +=
        renderCategory("🎓План урока", data.lessonCards) +
        renderCategory("💼План домашки", data.homeworkCards, true);

    let subjbtnsarr = document.getElementsByClassName('tsm-collapsible');
    let slidesbar = document.getElementsByClassName('tsm-slide-box');
    for (let i = 0; i < subjbtnsarr.length; i++) {
        subjbtnsarr[i].onclick = function () {
            if (slidesbar[i].style.display == 'none') slidesbar[i].style.display = '';
            else slidesbar[i].style.display = 'none';
        };
    }

    let savelinkarr = document.getElementsByClassName('tsm-btn-save');
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

    let rstProgArray = document.getElementsByClassName('tsm-btn-reset');
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
        document.getElementById('studname').innerHTML = '<span style="font-size: 17px;"> 👨‍🎓 </span>' + data.participants[0].name;
        document.getElementById('studserviceid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔 услуги: </span>' + data.participants[0].educationServiceId;
        document.getElementById('studid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + data.participants[0].userId;
        document.getElementById('teachname').innerHTML = '<span style="font-size: 17px;"> 👽 Teacher </span>' + data.participants[1].name;
        document.getElementById('teachdid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + data.participants[1].userId;
    } else if (data.participants[1].role == 'student') {
        document.getElementById('studname').innerHTML = '<span style="font-size: 17px;"> 👨‍🎓 </span>' + data.participants[1].name;
        document.getElementById('studserviceid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔 услуги: </span>' + data.participants[1].educationServiceId;
        document.getElementById('studid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + data.participants[1].userId;
        document.getElementById('teachname').innerHTML = '<span style="font-size: 17px;"> 👽 Teacher </span>' + data.participants[0].name;
        document.getElementById('teachdid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + data.participants[0].userId;
    }
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
        let tmparr = [];
        for (let i = 0; i < ttcroomdata.participants[0].nodes[0].steps.length; i++) {
            if (ttcroomdata.participants[0].nodes[0].steps[i].score == null) ttcroomdata.participants[0].nodes[0].steps[i].score = 0;
            if (ttcroomdata.participants[0].nodes[0].steps[i].completeness == null) ttcroomdata.participants[0].nodes[0].steps[i].completeness = 0;
            tmparr += '<div class="tsm-exercise-item">' + [i + 1] + '.' + '<span>' + ttcroomdata.participants[0].nodes[0].steps[i].title + '</span>' + '<span class="tsm-ttc-step-id">' + ttcroomdata.participants[0].nodes[0].steps[i].stepId + '</span>' + '<span class="tsm-btn-save-ttc" title="Копирует в буфер обмена ссылку на CMS для этого слайда"> 💾 </span>' + '<span style="float:right;margin-right:20%">' + ttcroomdata.participants[0].nodes[0].steps[i].completeness + '%' + '</span>' + '<span style="float:right;margin-right:11%">' + ttcroomdata.participants[0].nodes[0].steps[i].score / 10 + '</span>' + '<br>' + '</div>';
        }
        document.getElementById('exercisebarttc').innerHTML = `<div style="width:90%; margin-left:5%; text-align:center; color:bisque; background: #bb531a; border-radius: 20px;">"${ttcroomdata.participants[0].nodes[0].title}" • Выполнено на: ${ttcroomdata.participants[0].nodes[0].completeness}% • Оценка: ${ttcroomdata.participants[0].nodes[0].score / 10}</div>` + '<br>' +
            '<div class="tsm-table-header">' +
            '<span style="margin-left: 60px;">Название слайда</span>' +
            '<span style="margin-left: 140px;">Балл</span>' +
            '<span style="margin-left: 60px;">%</span>' +
            '<span style="margin-left: 50px;">Ссылка</span>' +
            '</div>' + tmparr;
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
        AFMS_addMenu.style.display = 'none';
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
            <th style="padding:6px; border: 1px solid black;">#</th>
            <th style="padding:6px; border: 1px solid black;">Название</th>
            <th style="padding:6px; border: 1px solid black;">Балл</th>
            <th style="padding:6px; border: 1px solid black;">%</th>
            <th style="padding:6px; border: 1px solid black;">Ссылка</th>
        </tr></thead><tbody>`;
        for (let i = 0; i < themes.length; i++) {
            const theme = themes[i];
            const contentLessonId = theme.meta.contentLessonId;
            html += `<tr class="tsm-theme-row"><td colspan="5" class="theme-title">
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
                    <td style="text-align:center; border: 1px solid black;">${j + 1}</td>
                    <td style="text-align:center; border: 1px solid black;">${name}</td>
                    <td style="text-align:center; border: 1px solid black;">${score}</td>
                    <td style="text-align:center; border: 1px solid black;">${completeness}</td>
                    <td class="tsm-btn-save" style="text-align:center; border: 1px solid black;" complectationsData-subtype="${kidsselector}" complectationsData-lessonid="${contentLessonId}" complectationsData-stepid="${card.id}" title="Скопировать ссылку на слайд">💾</td>
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

        const subjbtnsarr = document.getElementsByClassName('tsm-collapsible');
        const slidesbar = document.getElementsByClassName('tsm-slide-box');
        for (let i = 0; i < subjbtnsarr.length; i++) {
            subjbtnsarr[i].onclick = function () {
                slidesbar[i].style.display = slidesbar[i].style.display === 'none' ? '' : 'none';
            };
        }

        const savelinkarr = document.getElementsByClassName('tsm-btn-save');
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

        document.getElementById('studnameComplect').innerHTML = `<span style="font-size: 17px;"> 👨‍🎓 </span>${studentData.name}`;
        document.getElementById('studserviceidComplect').innerHTML = `<span style="user-select:none; font-size: 17px;">🆔 услуги: </span>${studentData.educationServiceId}`;
        document.getElementById('studidComplect').innerHTML = `<span style="user-select:none; font-size: 17px;">🆔: </span>${studentData.userId}`;
        document.getElementById('teachnameComplect').innerHTML = `<span style="font-size: 17px;"> 👽 Teacher </span>${teacherData.name}`;
        document.getElementById('teachdidComplect').innerHTML = `<span style="user-select:none; font-size: 17px;">🆔: </span>${teacherData.userId}`;
        document.getElementById('groupidComplect').innerHTML = `<span style="user-select:none; font-size: 17px;">🆔 гр: </span>${complectationsData.groupInfo.externalGroupId}`;
        document.getElementById('RoomStatus').innerHTML = `<span style="user-select:none; font-size: 17px;">Статус комнаты: </span>${complectationsData.status === "success" ? '<span style="color:#00ff5c">success</span>' : `<span style="color:#daf50c">${complectationsData.status}</span>`}`;
    };
}
