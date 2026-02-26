let hwroomdata = '';
var win_kidsExercises = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">
										     <div style="margin: 5px; width:550px;" id="exercisesSkysmartHeader">
                            <button class="commonbtn hidebtns" title="скрывает меню" id="hideExercisesSkysmartMenu">hide</button>
							<button class="commonbtn smallbtns" id="RefreshInfoExerciseKids" title = "Обновляет информацию по открытой комнате" style="margin: 5px;">♻</button>
							<span id="studname" style="color:#d5f4ff; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
							<span id="studserviceid" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
							<span id="studid" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
                        </div>

						<div style="margin: 5px; width:550px;" id="exercisesSkysmartTeacher">
							<label style="color: black; margin-left: 5px; background: mediumseagreen; font-weight: 700; box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); border-radius: 8px; padding: 3px; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);"><input type="checkbox" id="hideNullCards">Скрыть Темы с 0 карточек</label>
							<span id="teachname" style="color:#d5f4ff; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
							<span id="teachdid" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
						</div>

						<div style="margin: 5px; width:551px;">
							<input id="roomhashhwkids" placeholder="homework link" style="width: 490px; margin-left: 10px; text-align: center; height: 30px; border-radius:20px;">
							<button class="commonbtn smallbtns" style="border-radius: 20px; width: 34px !important; height: 34px !important; vertical-align: middle;" id="getroomdatakids">🔎</button>
						</div>

						<div id="exercisebarskysmart" class="skysmartexcbar">
						<div>

					</span>
				   </div>`;

var win_TTCExercises = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px; width:500px;" id="exercisesTTCHeader">
                            <button class="commonbtn hidebtns" title="скрывает меню" id="hideExercisesTTCMenu">hide</button>
							<button class="commonbtn smallbtns" id="RefreshInfoExerciseTTC" title = "Обновляет информацию по открытой комнате" style="margin: 5px;">♻</button>
                        </div>

						<div style="margin:5px;">
							<input id="roomhashttc" placeholder="Room link" style="width: 500px; margin-left: 10px; text-align: center; height: 30px;">
							<button class="commonbtn smallbtns" id="getroomdatattc">🔎</button>
						</div>

						<div id="exercisebarttc" class="skysmartexcbar">
						<div>

					</span>
				   </div>`;

var win_complectationExercises = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px; width:550px;" id="exercisesComplectHeader">
                            <button class="commonbtn hidebtns" title="скрывает меню" id="hideExercisesComplectMenu">hide</button>
							<button class="commonbtn smallbtns" id="RefreshInfoExerciseComplect title = "Обновляет информацию по открытой комнате" style="margin: 5px;">♻</button>
							<span id="studnameComplect" style="color:#d5f4ff; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
							<span id="studserviceidComplect" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
							<span id="studidComplect" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
							<span id="groupidComplect" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
                        </div>

						<div style="margin: 5px; width:550px;" id="exercisesComplectTeacher">
							<span id="teachnameComplect" style="color:#d5f4ff; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
							<span id="teachdidComplect" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
							<span id="RoomStatus" style="color:bisque; cursor:text; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%)"></span>
						</div>

						<div style="margin: 5px; width:550px;">
							<input id="roomhashhwComplect" placeholder="Room link" style="width: 490px; margin-left: 15px; text-align: center; height: 30px; border-radius:20px;">
							<button class="commonbtn smallbtns" style="border-radius: 20px; width: 34px !important; height: 34px !important; vertical-align: middle;" id="getroomdataComplect">🔎</button>
						</div>

						<div id="exercisebarComplect" class="skysmartexcbar">
						<div>

					</span>
				   </div>`;

const wintExercSkysmart = createTSMWindow('AFMS_SkysmartExercInfo', 'winTopexercisesSkysmart', 'winLeftexercisesSkysmart', win_kidsExercises);
wintExercSkysmart.className = 'wintInitializeExercisesData';

const wintExercTTC = createTSMWindow('AFMS_TTCExercInfo', 'winTopexercisesTTC', 'winLeftexercisesTTC', win_TTCExercises);
wintExercTTC.className = 'wintInitializeExercisesData';

const wintComplect = createTSMWindow('AFMS_Complect', 'winTopComplect', 'winLeftComplect', win_complectationExercises);
wintComplect.className = 'wintInitializeExercisesData';

async function OpenExercisesSmartroom() { // открывает менюшку скайсмарт упражнений
    if (wintExercSkysmart.style.display == 'none') {
        wintExercSkysmart.style.display = ''
        wintExercTTC.style.display = 'none'

        document.getElementById('RefreshInfoExerciseKids').onclick = function () {
            document.getElementById('roomhashhwkids').value = document.URL;
        }


        document.getElementById('hideExercisesSkysmartMenu').onclick = function () { // функция скрывает меню
            wintExercSkysmart.style.display = 'none'
        }

        document.getElementById('roomhashhwkids').value = document.URL
        setTimeout(function () {
            getroomdatakids.click()
        }, 1000)
        document.getElementById('getroomdatakids').onclick = async function () {
            document.getElementById('exercisebarskysmart').innerHTML = '';
            let urlComponents = document.getElementById('roomhashhwkids').value.split('/');
            let hashroomkids = urlComponents[6].split('?')[0];
            let kidsselector = urlComponents[4];

            const baseURL = `https://api-${kidsselector}.skyeng.ru/api/v2/rooms/`;
            await gethwroominfo(baseURL, hashroomkids);
            getkidsroominfo(data = hwroomdata, subjecttype = kidsselector);
        }
    } else {
        wintExercSkysmart.style.display = 'none'
    }
}

async function gethwroominfo(api, hash) {
    await fetch(api + hash, {
        "credentials": "include"
    }).then(r => r.json()).then(r => hwroomdata = r)
}

// Получаем элемент чекбокса
const hideNullCardsCheckbox = document.getElementById("hideNullCards");

// Получаем значение из локального хранилища
let checkedHideNullCards = localStorage.getItem("Nullcards");

// Если значение в локальном хранилище не установлено, устанавливаем его по умолчанию в "1" и включаем чекбокс
if (checkedHideNullCards === null) {
    checkedHideNullCards = "1";
    localStorage.setItem("Nullcards", checkedHideNullCards);
    hideNullCardsCheckbox.checked = true;
} else {
    // В противном случае, устанавливаем состояние чекбокса в соответствии с значением из локального хранилища
    hideNullCardsCheckbox.checked = checkedHideNullCards === "1";
}

// Добавляем обработчик события при изменении состояния чекбокса
hideNullCardsCheckbox.addEventListener("change", function () {
    // Обновляем значение в локальном хранилище
    checkedHideNullCards = this.checked ? "1" : "0";
    localStorage.setItem("Nullcards", checkedHideNullCards);
    document.getElementById('getroomdatakids').click();
});

async function LoadStep(stepuuid) {
    const response = await fetch("https://api-english.skyeng.ru/api/student-cabinet/v1/step-store/load-step", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            stepUuid: stepuuid,
            last: true,
            language: "ru",
            baseDomain: "skyeng.ru"
        }),
        credentials: "include"
    });

    const data = await response.json();
    return String(data.id);
}

async function ResetStepProgress(apiName, userId, stepId, roomHash) {
    try {
        const response = await fetch(`https://api-${apiName}.skyeng.ru/api/v1/store-blocks/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                userId: userId,
                contentGroupId: stepId,
                roomHash: roomHash
            }),
            credentials: "include"
        });

        if (!response.ok) {
            // Сервер вернул ошибку (например, 400 или 500)
            console.error("Ошибка удаления:", response.status, response.statusText);
            return false;
        }

        const result = await response.json(); // если сервер возвращает JSON
        console.log("Удаление прошло успешно:", result);
        return true;
    } catch (err) {
        console.error("Сбой при запросе:", err);
        return false;
    }
}



function getkidsroominfo(data, subjecttype) {
    // ----------------------
    // Общие константы
    // ----------------------
    const nullCards = localStorage.getItem("Nullcards") === "1";
    const studentId = data.participants.find(p => p.role === "student")?.userId;
    const indexOfSlides = data.lessonCards.findIndex(c => c.userId === studentId);

    // ----------------------
    // Универсальные функции
    // ----------------------

    // Нормализация карточки
    const normalizeCard = (card) => {
        let completeness = card.completeness;
        let score = card.score;

        if (completeness === 100 && score == null) score = 100;
        if (completeness == null) {
            completeness = "——";
            score = "—";
        }

        return { completeness, score };
    };

    // Заголовок темы
    const renderThemeHeader = (theme) => `
    <div style="margin: 5px">
        <span class="savelinktocms"
            title="Копирует в буфер обмена ссылку на CMS для этого урока"
            data-subtype="${subjecttype}"
            data-lessonid="${theme.meta.contentLessonId}">
            💾
        </span>
        <div class="roomtypekids" style="cursor:default;">
            ${theme.name}<br>
        </div>
    </div>
`;

    // Карточка
    const renderCard = (theme, card, index, isHomework = false) => {
        const { completeness, score } = normalizeCard(card);

        const emphasisIcons = {
            writing: "✏",
            pronunciation: "🎧",
            speaking: "🎙"
        };

        const icon = isHomework ? (emphasisIcons[card.emphasis] || "") : "";
        const cardName = card.name + icon;

        return `
        <div class="itemexerciseskids">
            ${index + 1}. ${cardName}
            <span class="savelinktocms"
                title="Копирует в буфер обмена ссылку на CMS для этого слайда"
                data-subtype="${subjecttype}"
                data-lessonid="${theme.meta.contentLessonId}"
                data-stepid="${card.id}">
                💾
            </span>

            ${isHomework ? `
                <span class="resetprogress" style="cursor:pointer"
                    data-stepUUID="${card.stepUuid}">
                    🔄️
                </span>
                <span class="resetStatus"></span>
            ` : ""}

            <span style="float:right; margin-right: 80px; border: 1px solid black;">${completeness}</span>
            <span style="float:right; margin-right: 60px; border: 1px solid black;">${score}</span>
        </div>
    `;
    };

    // Универсальный рендер категории (Lesson / Homework)
    const renderCategory = (title, cardBlock, isHomework = false) => {
        const themes = cardBlock[indexOfSlides].themes;

        let rows = "";

        themes.forEach(theme => {
            // Заголовок темы
            if (!nullCards || theme.cards.length > 0) {
                rows += `
                <tr class="theme-row">
                    <td colspan="6">
                        <span class="savelinktocms"
                            title="Копирует в буфер обмена ссылку на CMS для этого урока"
                            data-subtype="${subjecttype}"
                            data-lessonid="${theme.meta.contentLessonId}">
                            💾
                        </span>
                        ${theme.name}
                    </td>
                </tr>
            `;
            }

            // Карточки темы
            theme.cards.forEach((card, idx) => {
                const { completeness, score } = normalizeCard(card);

                const emphasisIcons = {
                    writing: "✏",
                    pronunciation: "🎧",
                    speaking: "🎙"
                };

                const icon = isHomework ? (emphasisIcons[card.emphasis] || "") : "";
                const cardName = card.name + icon;

                const completenessCell = completeness == 100
                    ? `<td style="text-align:center; border: 1px solid black; background: green">${completeness}</td>`
                    : `<td style="text-align:center; border: 1px solid black; background: #bb6904">${completeness}</td>`;


                rows += `
  <tr class="card-row">
    <td style="border: 1px solid black;">${idx + 1}</td>
    <td style="border: 1px solid black;">${cardName}</td>
    <td style="text-align:center; border: 1px solid black;">${score}</td>
    ${completenessCell}
    <td class="savelinktocms" style="width:80px; text-align:center; border: 1px solid black; cursor:pointer"
        title="Копирует в буфер обмена ссылку на CMS для этого слайда"
        data-subtype="${subjecttype}"
        data-lessonid="${theme.meta.contentLessonId}"
        data-stepid="${card.id}"> 💾 </td>
    ${isHomework ? `<td class="resetprogress" style="cursor:pointer; border:1px solid black;" data-stepUUID="${card.stepUuid}"> 🔄️ </td>` : ""}
  </tr>
`;

            });
        });

        return `
        <div class="roomtype collapsible">${title}</div>
        <div class="boxwithslides" style="display:none">

            <div class="itemexerciseskids">
                <div style="text-align:center;">Информация по категории: ${title}</div>
                Количество завершенных карточек: ${cardBlock[indexOfSlides].completedCardsCount} из ${cardBlock[indexOfSlides].cardsCount}
                <br>Общий % завершения слайдов: ${cardBlock[indexOfSlides].completeness}%
                <br>Итоговый результат: ${cardBlock[indexOfSlides].score} баллов из 100
            </div>

            <table class="slides-table" style="width:100%; border-collapse:collapse; margin-top:10px;">
                <thead>
                    <tr class="headerexplain">
                        <th style="padding:6px; border: 1px solid black;">#</th>
                        <th style="padding:6px; border: 1px solid black;">Название слайда</th>
                        <th style="padding:6px; border: 1px solid black;">Балл</th>
                        <th style="padding:6px; border: 1px solid black;">%</</th>
                        <th style="padding:6px; border: 1px solid black;">Ссылка</th>
						${isHomework ? ` <th style="padding:6px; border: 1px solid black;">Сброс</th> ` : ""}
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>

        </div>
    `;
    };


    // ----------------------
    // Финальный вывод
    // ----------------------
    document.getElementById("exercisebarskysmart").innerHTML +=
        renderCategory("🎓План урока", data.lessonCards) +
        renderCategory("💼План домашки", data.homeworkCards, true);


    let subjbtnsarr = document.getElementsByClassName('roomtype')
    let slidesbar = document.getElementsByClassName('boxwithslides')
    for (let i = 0; i < subjbtnsarr.length; i++) {
        subjbtnsarr[i].onclick = function () {
            if (slidesbar[i].style.display == 'none')
                slidesbar[i].style.display = ''
            else slidesbar[i].style.display = 'none'
        }
    }

    let savelinkarr = document.getElementsByClassName('savelinktocms');

    for (let z = 0; z < savelinkarr.length; z++) {
        savelinkarr[z].onclick = function () {
            let subtype = this.getAttribute('data-subtype');
            let lessonid = this.getAttribute('data-lessonid');
            let stepid = this.getAttribute('data-stepid');

            // Определение нужной ссылки в зависимости от наличия атрибута data-stepid
            let link;
            if (!stepid) {
                link = `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}`;
            } else {
                link = `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}/cards/${stepid}/edit`;
            }
            savelinkarr[z].textContent = "✅"
            copyToClipboardTSM(link);
            createNotify('💾 Ссылка на слайд в CMS cкопирована в буфер обмена', 'message');
            setTimeout(function () {
                savelinkarr[z].textContent = "💾"
            }, 4000)
        }
    }

    let rstProgArray = document.getElementsByClassName('resetprogress') // блок сброса прогресса
    let statusBtns = document.getElementsByClassName('resetStatus')
    for (let k = 0; k < rstProgArray.length; k++) {
        rstProgArray[k].onclick = async function () {
            let apiToDoName = location.pathname.split('/')[2].trim()
            let roomhashtoinsert = location.pathname.split('/')[4].trim()
            let stepuuid = this.getAttribute('data-stepUuid');
            let studentID = Number(document.getElementById('studid').textContent.split(" ")[1])
            let getNumberToDelete = await LoadStep(stepuuid);

            const success = await ResetStepProgress(apiToDoName, studentID, getNumberToDelete, roomhashtoinsert)
            if (success) {
                rstProgArray[k].textContent = "✅"
                setTimeout(function () {
                    rstProgArray[k].textContent = "🔄️"
                }, 4000)
            } else {
                rstProgArray[k].textContent = "❌"
                setTimeout(function () {
                    rstProgArray[k].textContent = "🔄️"
                }, 4000)
            }
        }
    }

    if (data.participants[0].role == 'student') {
        document.getElementById('studname').innerHTML = '<span style="font-size: 17px;"> 👨‍🎓 </span>' + data.participants[0].name
        document.getElementById('studserviceid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔 услуги: </span>' + data.participants[0].educationServiceId
        document.getElementById('studid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + data.participants[0].userId
        document.getElementById('teachname').innerHTML = '<span style="font-size: 17px;"> 👽 Teacher </span>' + data.participants[1].name
        document.getElementById('teachdid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + data.participants[1].userId
    } else if (data.participants[1].role == 'student') {
        document.getElementById('studname').innerHTML = '<span style="font-size: 17px;"> 👨‍🎓 </span>' + data.participants[1].name
        document.getElementById('studserviceid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔 услуги: </span>' + data.participants[1].educationServiceId
        document.getElementById('studid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + data.participants[1].userId
        document.getElementById('teachname').innerHTML = '<span style="font-size: 17px;"> 👽 Teacher </span>' + data.participants[0].name
        document.getElementById('teachdid').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + data.participants[0].userId
    }

}

async function getTTCData() {
    let rhash = document.getElementById('roomhashttc').value
    if (rhash.length < 20) {
        await fetch("https://ttc-api.skyeng.ru/api/v1/lesson/join", {
            "headers": {
                "content-type": "application/json",
            },
            "body": "{\"roomHash\":\"" + rhash + "\"}",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        }).then(r => r.json()).then(r => ttcroomdata = r)

        console.log(ttcroomdata)

        let tmparr = [];
        for (let i = 0; i < ttcroomdata.participants[0].nodes[0].steps.length; i++) {
            if (ttcroomdata.participants[0].nodes[0].steps[i].score == null)
                ttcroomdata.participants[0].nodes[0].steps[i].score = 0
            if (ttcroomdata.participants[0].nodes[0].steps[i].completeness == null)
                ttcroomdata.participants[0].nodes[0].steps[i].completeness = 0
            tmparr += '<div class="itemexerciseskids">' + [i + 1] + '.' + '<span>' + ttcroomdata.participants[0].nodes[0].steps[i].title + '</span>' + '<span class="TTCstepid" style="display:none">' + ttcroomdata.participants[0].nodes[0].steps[i].stepId + '</span>' + '<span class="savelinktocmsttc" title="Копирует в буфер обмена ссылку на CMS для этого слайда"> 💾 </span>' + '<span style="float:right;margin-right:20%">' + ttcroomdata.participants[0].nodes[0].steps[i].completeness + '%' + '</span>' + '<span style="float:right;margin-right:11%">' + ttcroomdata.participants[0].nodes[0].steps[i].score / 10 + '</span>' + '<br>' + '</div>'
        }

        document.getElementById('exercisebarttc').innerHTML = `<div style="width:90%; margin-left:5%; text-align:center; color:bisque; background: #bb531a; border-radius: 20px;">"${ttcroomdata.participants[0].nodes[0].title}" • Выполнено на: ${ttcroomdata.participants[0].nodes[0].completeness}% • Оценка: ${ttcroomdata.participants[0].nodes[0].score / 10}</div>` + '<br>' +
            '<div class="headerexplain">' +
            '<span style="margin-left: 60px;">Название слайда</span>' +
            '<span style="margin-left: 140px;">Балл</span>' +
            '<span style="margin-left: 60px;">%</span>' +
            '<span style="margin-left: 50px;">Ссылка</span>' +
            '</div>' +
            tmparr;

        let savelinkarr = document.getElementsByClassName('savelinktocmsttc')
        for (let z = 0; z < savelinkarr.length; z++) {
            savelinkarr[z].onclick = function () {
                copyToClipboardTSM("https://content-vimbox.skyeng.ru/cms/stepStore/update/stepId/" + document.getElementsByClassName('TTCstepid')[z].textContent)
            }
        }

    }
}

async function OpenExercisesTTC() {
    if (wintExercTTC.style.display == 'none') {
        wintExercTTC.style.display = ''
        wintExercSkysmart.style.display = 'none'

        if (location.host == 'ttc.skyeng.ru') {
            document.getElementById('roomhashttc').value = document.URL.split('/')[5];
            getTTCData()
        } else document.getElementById('roomhashttc').value = "Не открыт TTC курс! Откройте и повторите Или введите хеш одним словом"

        document.getElementById('hideExercisesTTCMenu').onclick = function () {
            wintExercTTC.style.display = 'none'
        }

        document.getElementById('RefreshInfoExerciseTTC').onclick = function () {
            if (location.host == 'ttc.skyeng.ru') {
                document.getElementById('roomhashttc').value = document.URL.split('/')[5];
                getTTCData()
            } else document.getElementById('roomhashttc').value = "Не открыт TTC курс! Откройте и повторите Или введите хеш одним словом"
        }

        document.getElementById('getroomdatattc').onclick = getTTCData
    }
    else {
        wintExercTTC.style.display = 'none'
    }
}

async function OpenExercisesComplect() {
    if (document.getElementById('AFMS_Complect').style.display == 'none') {
        wintComplect.style.display = ''
        wintExercSkysmart.style.display = 'none'
        wintExercTTC.style.display = 'none'
        AFMS_addMenu.style.display = 'none'
        document.getElementById('roomhashhwComplect').value = document.URL;
        setTimeout(function () {
            getroomdataComplect.click()
        }, 500)

    } else {
        wintComplect.style.display = 'none'
    }

    document.getElementById('hideExercisesComplectMenu').onclick = function () {
        wintComplect.style.display = 'none'
    }

    function buildCardsTable(themes, kidsselector) {
        let html = `
        <table class="exercisetable">
            <thead>
                <tr class="headerexplain">
                    <th style="padding:6px; border: 1px solid black;">#</th>
                    <th style="padding:6px; border: 1px solid black;">Название</th>
                    <th style="padding:6px; border: 1px solid black;">Балл</th>
                    <th style="padding:6px; border: 1px solid black;">%</th>
                    <th style="padding:6px; border: 1px solid black;">Ссылка</th>
                </tr>
            </thead>
            <tbody>
    `;

        for (let i = 0; i < themes.length; i++) {
            const theme = themes[i];
            const contentLessonId = theme.meta.contentLessonId;

            html += `
            <tr class="theme-row">
                <td colspan="5" class="theme-title">
                    <span class="savelinktocms"
                        complectationsData-subtype="${kidsselector}"
                        complectationsData-lessonid="${contentLessonId}"
                        title="Скопировать ссылку на урок">💾</span>
                    ${theme.name}
                </td>
            </tr>
        `;

            for (let j = 0; j < theme.cards.length; j++) {
                const card = theme.cards[j];

                const completeness = card.completeness ?? "——";
                const score = card.score ?? "—";

                let name = card.name;
                if (card.emphasis === "writing") name += " ✏";
                if (card.emphasis === "pronunciation") name += " 🎧";
                if (card.emphasis === "speaking") name += " 🎙";

                html += `
                <tr class="card-row">
                    <td style="text-align:center; border: 1px solid black;">${j + 1}</td>
                    <td style="text-align:center; border: 1px solid black;">${name}</td>
                    <td style="text-align:center; border: 1px solid black;">${score}</td>
                    <td style="text-align:center; border: 1px solid black;">${completeness}</td>
                    <td class="savelinktocms" style="text-align:center; border: 1px solid black;"
                            complectationsData-subtype="${kidsselector}"
                            complectationsData-lessonid="${contentLessonId}"
                            complectationsData-stepid="${card.id}"
                            title="Скопировать ссылку на слайд">💾
                    </td>
                </tr>
            `;
            }
        }

        html += `</tbody></table>`;
        return html;
    }


    function buildCollapsibleBlock(title, infoHTML, tableHTML) {
        return `
        <div class="roomtype collapsible">${title}</div>
        <div class="boxwithslides" style="display:none">
            ${infoHTML}
            ${tableHTML}
        </div>
    `;
    }


    function buildCategoryInfoBlock(cardData, title) {
        return `
        <div class="category-info" style="color:bisque;">
            <div style="margin-left:30%"><b>Информация по категории: ${title}</b></div>
            <div>Количество завершенных карточек: ${cardData.completedCardsCount} из ${cardData.cardsCount}</div>
            <div>Общий % завершения слайдов: ${cardData.completeness}%</div>
            <div>Итоговый результат: ${cardData.score} баллов из 100</div>
        </div>
    `;
    }

    document.getElementById('getroomdataComplect').onclick = async function () {

        document.getElementById('exercisebarComplect').innerHTML = '';
        const rhash = document.getElementById('roomhashhwComplect').value;
        const urlComponents = rhash.split('/');
        const nullCardsValue = localStorage.getItem("Nullcards");

        const isTest = urlComponents[6].split('?')[0] === 'test';
        const kidsselector = urlComponents[4];
        const hashroomkids = isTest ? urlComponents[7] : urlComponents[6].split('?')[0];

        const baseURL = `https://api-${kidsselector}.skyeng.ru/api/v2/rooms/${hashroomkids}${isTest ? '' : '?verbosity=only_mine_participants'}`;

        const complectationsData = await fetch(baseURL, {
            method: isTest ? "GET" : "POST",
            mode: "cors",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: isTest ? null : `{"roomHash":"${rhash}"}`
        }).then(r => r.json());

        const student = complectationsData.participants.find(p => p.role === "student");
        const indexOfSlides = complectationsData.lessonCards.findIndex(c => c.userId === student.userId);

        // LESSON
        const lessonInfo = buildCategoryInfoBlock(
            complectationsData.lessonCards[indexOfSlides],
            "План урока"
        );

        const lessonTable = buildCardsTable(
            complectationsData.lessonCards[indexOfSlides].themes,
            kidsselector
        );

        document.getElementById('exercisebarComplect').innerHTML +=
            buildCollapsibleBlock("🎓План урока", lessonInfo, lessonTable);


        // HOMEWORK
        const homeworkInfo = buildCategoryInfoBlock(
            complectationsData.homeworkCards[indexOfSlides],
            "План домашки"
        );

        const homeworkTable = buildCardsTable(
            complectationsData.homeworkCards[indexOfSlides].themes,
            kidsselector
        );

        document.getElementById('exercisebarComplect').innerHTML +=
            buildCollapsibleBlock("💼План домашки", homeworkInfo, homeworkTable);


        // DIAGNOSTIC (если есть)
        const diagnosticBlock = complectationsData.diagnosticsCards?.[indexOfSlides];

        const hasDiagnosticCards =
            diagnosticBlock &&
            Array.isArray(diagnosticBlock.themes) &&
            diagnosticBlock.themes.some(theme => theme.cards.length > 0);

        if (hasDiagnosticCards) {
            const diagnosticInfo = buildCategoryInfoBlock(diagnosticBlock, "Diagnostic");
            const diagnosticTable = buildCardsTable(diagnosticBlock.themes, kidsselector);

            document.getElementById('exercisebarComplect').innerHTML +=
                buildCollapsibleBlock("Diagnostic", diagnosticInfo, diagnosticTable);
        }



        // Сворачивание
        const subjbtnsarr = document.getElementsByClassName('collapsible');
        const slidesbar = document.getElementsByClassName('boxwithslides');

        for (let i = 0; i < subjbtnsarr.length; i++) {
            subjbtnsarr[i].onclick = function () {
                slidesbar[i].style.display =
                    slidesbar[i].style.display === 'none' ? '' : 'none';
            };
        }

        // Копирование ссылок
        const savelinkarr = document.getElementsByClassName('savelinktocms');
        for (let z = 0; z < savelinkarr.length; z++) {
            savelinkarr[z].onclick = function () {
                const subtype = this.getAttribute('complectationsData-subtype');
                const lessonid = this.getAttribute('complectationsData-lessonid');
                const stepid = this.getAttribute('complectationsData-stepid');

                const link = stepid
                    ? `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}/cards/${stepid}/edit`
                    : `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}`;

                savelinkarr[z].textContent = "✅"
                copyToClipboardTSM(link);
                createNotify('💾 Ссылка на слайд в CMS cкопирована в буфер обмена', 'message');
                setTimeout(function () {
                    savelinkarr[z].textContent = "💾"
                }, 4000)
            };
        }

        // Определяем индексы
        const studentIndex = complectationsData.participants.findIndex(p => p.role === 'student');
        const teacherIndex = 1 - studentIndex;

        const studentData = complectationsData.participants[studentIndex];
        const teacherData = complectationsData.participants[teacherIndex];

        // Заполняем существующие поля
        document.getElementById('studnameComplect').innerHTML =
            `<span style="font-size: 17px;"> 👨‍🎓 </span>${studentData.name}`;

        document.getElementById('studserviceidComplect').innerHTML =
            `<span style="user-select:none; font-size: 17px;">🆔 услуги: </span>${studentData.educationServiceId}`;

        document.getElementById('studidComplect').innerHTML =
            `<span style="user-select:none; font-size: 17px;">🆔: </span>${studentData.userId}`;

        document.getElementById('teachnameComplect').innerHTML =
            `<span style="font-size: 17px;"> 👽 Teacher </span>${teacherData.name}`;

        document.getElementById('teachdidComplect').innerHTML =
            `<span style="user-select:none; font-size: 17px;">🆔: </span>${teacherData.userId}`;

        document.getElementById('groupidComplect').innerHTML =
            `<span style="user-select:none; font-size: 17px;">🆔 гр: </span>${complectationsData.groupInfo.externalGroupId}`;

        document.getElementById('RoomStatus').innerHTML =
            `<span style="user-select:none; font-size: 17px;">Статус комнаты: </span>${complectationsData.status === "success"
                ? '<span style="color:#00ff5c">success</span>'
                : `<span style="color:#daf50c">${complectationsData.status}</span>`
            }`;


    };

}