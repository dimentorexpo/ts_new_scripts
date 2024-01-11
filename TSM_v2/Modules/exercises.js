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

						<div style="margin: 5px; width:550px;">
							<input id="roomhashhwkids" placeholder="homework link" style="width: 490px; margin-left: 15px; text-align: center; height: 30px;">
							<button class="commonbtn smallbtns" id="getroomdatakids">🔎</button>
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
							<input id="roomhashhwComplect" placeholder="Room link" style="width: 490px; margin-left: 15px; text-align: center; height: 30px;">
							<button class="commonbtn smallbtns" id="getroomdataComplect">🔎</button>
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

        //document.getElementById('exercisebarskysmart').innerText = "В РАЗРАБОТКЕ"

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

function getkidsroominfo(data, subjecttype) {
    let temparr = [];
    let hwarr = [];
    let indexOfSlides = ''

    let flagofuser = '';

    for (let z = 0; z < data.participants.length; z++) {
        if (data.participants[z].role == 'student')
            flagofuser = data.participants[z].userId;
    }

    for (let usId = 0; usId < data.lessonCards.length; usId++) {
        if (flagofuser == data.lessonCards[usId].userId) {
            indexOfSlides = usId
        }
    }

    for (let i = 0; i < data.lessonCards[indexOfSlides].themes.length; i++) {
        if (localStorage.getItem("Nullcards") == 1 && data.lessonCards[indexOfSlides].themes[i].cards.length > 0) {
            temparr += '<div style="margin: 5px">' +
                '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока" ' +
                'data-subtype="' + subjecttype + '" ' +
                'data-lessonid="' + data.lessonCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' + '"> 💾 </span>' +
                '<div class="roomtypekids" style="cursor:default;">' + data.lessonCards[indexOfSlides].themes[i].name + ' ' + '<br>' +
                '</div></div>'
        } else if (localStorage.getItem("Nullcards") == 0) {
            temparr += '<div style="margin: 5px">' +
                '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока" ' +
                'data-subtype="' + subjecttype + '" ' +
                'data-lessonid="' + data.lessonCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' + '"> 💾 </span>' +
                '<div class="roomtypekids" style="cursor:default;">' + data.lessonCards[indexOfSlides].themes[i].name + ' ' + '<br>' +
                '</div></div>'
        }
        for (let j = 0; j < data.lessonCards[indexOfSlides].themes[i].cards.length; j++) {
            (data.lessonCards[indexOfSlides].themes[i].cards[j].completeness == 100 && data.lessonCards[indexOfSlides].themes[i].cards[j].score == null) ? data.lessonCards[indexOfSlides].themes[i].cards[j].score = 100 : data.lessonCards[indexOfSlides].themes[i].cards[j].score;
            if (data.lessonCards[indexOfSlides].themes[i].cards[j].completeness == null) {
                data.lessonCards[indexOfSlides].themes[i].cards[j].completeness = '——'
                data.lessonCards[indexOfSlides].themes[i].cards[j].score = '—'
            }
            temparr += '<div class="itemexerciseskids">' + [j + 1] + '.' +
                data.lessonCards[indexOfSlides].themes[i].cards[j].name + ' ' +
                '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого слайда" ' +
                'data-subtype="' + subjecttype + '" ' +
                'data-lessonid="' + data.lessonCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' +
                'data-stepid="' + data.lessonCards[indexOfSlides].themes[i].cards[j].id + '"> 💾 </span>' +
                '<span style="float:right; margin-right: 80px;">' + data.lessonCards[indexOfSlides].themes[i].cards[j].completeness + '</span>' +
                '<span style="float:right; margin-right: 60px;">' + data.lessonCards[indexOfSlides].themes[i].cards[j].score + '</span>' +
                '</div>';
        }
    }

    document.getElementById('exercisebarskysmart').innerHTML += '<div class="roomtype">Lesson</div>' +
        '<div class="boxwithslides" style="display:none">' +
        '<div class="itemexerciseskids">' +
        '<div style="text-align:center;">Информация по категории: Lesson</div>' +
        'Количество завершенных карточек: ' + data.lessonCards[indexOfSlides].completedCardsCount + ' из ' + data.lessonCards[indexOfSlides].cardsCount +
        '<br>Общий % завершения слайдов: ' + data.lessonCards[indexOfSlides].completeness + '%' +
        '<br>Итоговый результат: ' + data.lessonCards[indexOfSlides].score + ' баллов из 100<br>' +
        '<div class="headerexplain">' +
        '<span style="margin-left: 60px;">Название слайда</span>' +
        '<span style="margin-left: 155px;">Балл</span>' +
        '<span style="margin-left: 70px;">%</span>' +
        '<span style="margin-left: 50px;">Ссылка</span>' +
        '</div>' +
        '</div>' +
        temparr +
        '</div>';

    for (let i = 0; i < data.homeworkCards[indexOfSlides].themes.length; i++) {
        if (localStorage.getItem("Nullcards") == 1 && data.homeworkCards[indexOfSlides].themes[i].cards.length > 0) {
            hwarr += '<div style="margin: 5px">' +
                '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока" ' +
                'data-subtype="' + subjecttype + '" ' +
                'data-lessonid="' + data.homeworkCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' + '"> 💾 </span>' +
                '<div class="roomtypekids" style="cursor:default;">' + data.homeworkCards[indexOfSlides].themes[i].name + '<br>' +
                '</div></div>'
        } else if (localStorage.getItem("Nullcards") == 0) {
            hwarr += '<div style="margin: 5px">' +
                '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока" ' +
                'data-subtype="' + subjecttype + '" ' +
                'data-lessonid="' + data.homeworkCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' + '"> 💾 </span>' +
                '<div class="roomtypekids" style="cursor:default;">' + data.homeworkCards[indexOfSlides].themes[i].name + '<br>' +
                '</div></div>'
        }
        for (let j = 0; j < data.homeworkCards[indexOfSlides].themes[i].cards.length; j++) {
            (data.homeworkCards[indexOfSlides].themes[i].cards[j].completeness == 100 && data.homeworkCards[indexOfSlides].themes[i].cards[j].score == null) ? data.homeworkCards[indexOfSlides].themes[i].cards[j].score = 100 : data.homeworkCards[indexOfSlides].themes[i].cards[j].score;
            if (data.homeworkCards[indexOfSlides].themes[i].cards[j].completeness == null) {
                data.homeworkCards[indexOfSlides].themes[i].cards[j].completeness = '——'
                data.homeworkCards[indexOfSlides].themes[i].cards[j].score = '—'
            }

            if (data.homeworkCards[indexOfSlides].themes[i].cards[j].emphasis == 'writing') {
                data.homeworkCards[indexOfSlides].themes[i].cards[j].name = data.homeworkCards[indexOfSlides].themes[i].cards[j].name + '✏'
            } else if (data.homeworkCards[indexOfSlides].themes[i].cards[j].emphasis == 'pronunciation') {
                data.homeworkCards[indexOfSlides].themes[i].cards[j].name = data.homeworkCards[indexOfSlides].themes[i].cards[j].name + '🎧'
            } else if (data.homeworkCards[indexOfSlides].themes[i].cards[j].emphasis == 'speaking') {
                data.homeworkCards[indexOfSlides].themes[i].cards[j].name = data.homeworkCards[indexOfSlides].themes[i].cards[j].name + '🎙'
            }

            hwarr += '<div class="itemexerciseskids">' + [j + 1] + '.' +
                data.homeworkCards[indexOfSlides].themes[i].cards[j].name + ' ' +
                '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого слайда" ' +
                'data-subtype="' + subjecttype + '" ' +
                'data-lessonid="' + data.homeworkCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' +
                'data-stepid="' + data.homeworkCards[indexOfSlides].themes[i].cards[j].id + '"> 💾 </span>' +
                '<span style="float:right; margin-right: 80px;">' + data.homeworkCards[indexOfSlides].themes[i].cards[j].completeness + '</span>' +
                '<span style="float:right; margin-right: 60px;">' + data.homeworkCards[indexOfSlides].themes[i].cards[j].score + '</span>' +
                '</div>';
        }
    }

    document.getElementById('exercisebarskysmart').innerHTML += '<div class="roomtype">Homework</div>' +
        '<div class="boxwithslides" style="display:none">' +
        '<div class="itemexerciseskids">' +
        '<div style="text-align:center;">Информация по категории: Homework</div>' +
        'Количество завершенных карточек: ' + data.homeworkCards[indexOfSlides].completedCardsCount + ' из ' + data.homeworkCards[indexOfSlides].cardsCount +
        '<br>Общий % завершения слайдов: ' + data.homeworkCards[indexOfSlides].completeness + '%' +
        '<br>Итоговый результат: ' + data.homeworkCards[indexOfSlides].score + ' баллов из 100<br>' +
        '<div class="headerexplain">' +
        '<span style="margin-left: 60px;">Название слайда</span>' +
        '<span style="margin-left: 140px;">Балл</span>' +
        '<span style="margin-left: 60px;">%</span>' +
        '<span style="margin-left: 50px;">Ссылка</span>' +
        '</div>' +
        '</div>' +
        hwarr +
        '</div>';

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

            copyToClipboardTSM(link);
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

    document.getElementById('getroomdataComplect').onclick = async function () {
        const nullCardsValue = localStorage.getItem("Nullcards");
        document.getElementById('exercisebarComplect').innerHTML = '';
        const rhash = document.getElementById('roomhashhwComplect').value;
        const urlComponents = rhash.split('/');
        if (urlComponents[6].split('?')[0] !== 'test') {
            const hashroomkids = urlComponents[6].split('?')[0];
            const kidsselector = urlComponents[4];

            const baseURL = `https://api-${kidsselector}.skyeng.ru/api/v2/rooms/${hashroomkids}?verbosity=only_mine_participants`;

            const complectationsData = await fetch(baseURL, {
                "headers": {
                    "content-type": "application/json",
                },
                "body": `{"roomHash":"${rhash}"}`,
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            }).then(r => r.json());

            let temparr = '';
            let hwarr = '';
            let indexOfSlides = '';

            let flagofuser = '';

            for (let z = 0; z < complectationsData.participants.length; z++) {
                if (complectationsData.participants[z].role === 'student') {
                    flagofuser = complectationsData.participants[z].userId;
                }
            }

            for (let usId = 0; usId < complectationsData.lessonCards.length; usId++) {
                if (flagofuser === complectationsData.lessonCards[usId].userId) {
                    indexOfSlides = usId;
                }
            }

            for (let i = 0; i < complectationsData.lessonCards[indexOfSlides].themes.length; i++) {
                const theme = complectationsData.lessonCards[indexOfSlides].themes[i];
                const contentLessonId = theme.meta.contentLessonId;

                if (localStorage.getItem("Nullcards") == 1 && theme.cards.length > 0) {
                    temparr += `
        <div style="margin: 5px">
          <span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока"
            complectationsData-subtype="${kidsselector}" complectationsData-lessonid="${contentLessonId}"> 💾 </span>
          <div class="roomtypekids" style="cursor:default;">${theme.name}<br></div>
        </div>`;
                } else if (localStorage.getItem("Nullcards") == 0) {
                    temparr += `
        <div style="margin: 5px">
          <span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока"
            complectationsData-subtype="${kidsselector}" complectationsData-lessonid="${contentLessonId}"> 💾 </span>
          <div class="roomtypekids" style="cursor:default;">${theme.name}<br></div>
        </div>`;
                }

                for (let j = 0; j < theme.cards.length; j++) {
                    const card = theme.cards[j];
                    card.completeness = card.completeness || '——';
                    card.score = card.score === null ? '—' : card.score;

                    if (card.emphasis === 'writing') {
                        card.name += '✏';
                    } else if (card.emphasis === 'pronunciation') {
                        card.name += '🎧';
                    } else if (card.emphasis === 'speaking') {
                        card.name += '🎙';
                    }

                    temparr += `
        <div class="itemexerciseskids">${j + 1}.${card.name}
          <span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого слайда"
            complectationsData-subtype="${kidsselector}"
            complectationsData-lessonid="${contentLessonId}"
            complectationsData-stepid="${card.id}"> 💾 </span>
          <span style="float:right; margin-right: 80px;">${card.completeness}</span>
          <span style="float:right; margin-right: 60px;">${card.score}</span>
        </div>`;
                }
            }

            document.getElementById('exercisebarComplect').innerHTML += `
    <div class="roomtype">Lesson</div>
    <div class="boxwithslides" style="display:none">
      <div class="itemexerciseskids">
        <div style="text-align:center;">Информация по категории: Lesson</div>
        Количество завершенных карточек: ${complectationsData.lessonCards[indexOfSlides].completedCardsCount} из ${complectationsData.lessonCards[indexOfSlides].cardsCount}<br>
        Общий % завершения слайдов: ${complectationsData.lessonCards[indexOfSlides].completeness}%<br>
        Итоговый результат: ${complectationsData.lessonCards[indexOfSlides].score} баллов из 100<br>
        <div class="headerexplain">
          <span style="margin-left: 15px;">Название слайда</span>
          <span style="margin-left: 155px;">Балл</span>
          <span style="margin-left: 70px;">%</span>
          <span style="margin-left: 50px;">Ссылка</span>
        </div>
      </div>
      ${temparr}
    </div>`;

            for (let i = 0; i < complectationsData.homeworkCards[indexOfSlides].themes.length; i++) {
                const theme = complectationsData.homeworkCards[indexOfSlides].themes[i];
                const contentLessonId = theme.meta.contentLessonId;

                if (nullCardsValue == 1 && theme.cards.length > 0) {
                    hwarr += `
				  <div style="margin: 5px">
					<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока"
					  complectationsData-subtype="${kidsselector}" complectationsData-lessonid="${contentLessonId}"> 💾 </span>
					<div class="roomtypekids" style="cursor:default;">${theme.name}<br></div>
				  </div>`;
                } else if (nullCardsValue == 0) {
                    hwarr += `
				  <div style="margin: 5px">
					<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока"
					  complectationsData-subtype="${kidsselector}" complectationsData-lessonid="${contentLessonId}"> 💾 </span>
					<div class="roomtypekids" style="cursor:default;">${theme.name}<br></div>
				  </div>`;
                }

                for (let j = 0; j < theme.cards.length; j++) {
                    const card = theme.cards[j];
                    card.completeness = card.completeness || '——';
                    card.score = card.score === null ? '—' : card.score;

                    if (card.emphasis === 'writing') {
                        card.name += '✏';
                    } else if (card.emphasis === 'pronunciation') {
                        card.name += '🎧';
                    } else if (card.emphasis === 'speaking') {
                        card.name += '🎙';
                    }

                    hwarr += `
				  <div class="itemexerciseskids">${j + 1}.${card.name}
					<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого слайда"
					  complectationsData-subtype="${kidsselector}"
					  complectationsData-lessonid="${contentLessonId}"
					  complectationsData-stepid="${card.id}"> 💾 </span>
					<span style="float:right; margin-right: 80px;">${card.completeness}</span>
					<span style="float:right; margin-right: 60px;">${card.score}</span>
				  </div>`;
                }
            }

            document.getElementById('exercisebarComplect').innerHTML += `
			  <div class="roomtype">Homework</div>
			  <div class="boxwithslides" style="display:none">
				<div class="itemexerciseskids">
				  <div style="text-align:center;">Информация по категории: Homework</div>
				  Количество завершенных карточек: ${complectationsData.homeworkCards[indexOfSlides].completedCardsCount} из ${complectationsData.homeworkCards[indexOfSlides].cardsCount}<br>
				  Общий % завершения слайдов: ${complectationsData.homeworkCards[indexOfSlides].completeness}%<br>
				  Итоговый результат: ${complectationsData.homeworkCards[indexOfSlides].score} баллов из 100<br>
				  <div class="headerexplain">
					<span style="margin-left: 15px;">Название слайда</span>
					<span style="margin-left: 140px;">Балл</span>
					<span style="margin-left: 60px;">%</span>
					<span style="margin-left: 50px;">Ссылка</span>
				  </div>
				</div>
				${hwarr}
			  </div>`;

            console.log(complectationsData);

            const studentIndex = complectationsData.participants.findIndex(participant => participant.role === 'student');
            const teacherIndex = 1 - studentIndex; // Предполагается, что всего два участника

            const studentData = complectationsData.participants[studentIndex];
            const teacherData = complectationsData.participants[teacherIndex];

            document.getElementById('studnameComplect').innerHTML = `<span style="font-size: 17px;"> 👨‍🎓 </span>${studentData.name}`;
            document.getElementById('studserviceidComplect').innerHTML = `<span style="user-select:none; font-size: 17px;">🆔 услуги: </span>${studentData.educationServiceId}`;
            document.getElementById('studidComplect').innerHTML = `<span style="user-select:none; font-size: 17px;">🆔: </span>${studentData.userId}`;
            document.getElementById('teachnameComplect').innerHTML = `<span style="font-size: 17px;"> 👽 Teacher </span>${teacherData.name}`;
            document.getElementById('teachdidComplect').innerHTML = `<span style="user-select:none; font-size: 17px;">🆔: </span>${teacherData.userId}`;
            document.getElementById('groupidComplect').innerHTML = `<span style="user-select:none; font-size: 17px;">🆔 гр: </span>${complectationsData.groupInfo.externalGroupId}`;
            document.getElementById('RoomStatus').innerHTML = `<span style="user-select:none; font-size: 17px;">Статус комнаты: </span>${complectationsData.status == "success" ? '<span style="color:#00ff5c">success</span>' : `<span style="color:#daf50c">${complectationsData.status}</span>`}`;



        } else {
            let kidsselector = urlComponents[4];
            let hashroomkids = urlComponents[7]
            const baseURL = `https://api-${kidsselector}.skyeng.ru/api/v2/rooms/${hashroomkids}`;

            await fetch(baseURL, {
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            }).then(r => r.json()).then(r => complectationsData = r)

            console.log(complectationsData)

            let testarr = [];
            let indexOfSlides = ''

            let flagofuser = '';

            for (let z = 0; z < complectationsData.participants.length; z++) {
                if (complectationsData.participants[z].role == 'student')
                    flagofuser = complectationsData.participants[z].userId;
            }

            for (let usId = 0; usId < complectationsData.lessonCards.length; usId++) {
                if (flagofuser == complectationsData.lessonCards[usId].userId) {
                    indexOfSlides = usId
                }
            }

            //DiagnosticCards
            // Функция для генерации HTML для уроков
            function generateExerciseHTML(complectationsData, kidsselector) {
                let testarr = '';

                for (let i = 0; i < complectationsData.diagnosticsCards[indexOfSlides].themes.length; i++) {
                    if (localStorage.getItem("Nullcards") == 1 && complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards.length > 0) {
                        testarr += '<div style="margin: 5px">' +
                            '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока" ' +
                            'complectationsData-subtype="' + kidsselector + '" ' +
                            'complectationsData-lessonid="' + complectationsData.diagnosticsCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' + '"> 💾 </span>' +
                            '<div class="roomtypekids" style="cursor:default;">' + complectationsData.diagnosticsCards[indexOfSlides].themes[i].name + '<br>' +
                            '</div></div>';
                    } else if (localStorage.getItem("Nullcards") == 0) {
                        testarr += '<div style="margin: 5px">' +
                            '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого урока" ' +
                            'complectationsData-subtype="' + kidsselector + '" ' +
                            'complectationsData-lessonid="' + complectationsData.diagnosticsCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' + '"> 💾 </span>' +
                            '<div class="roomtypekids" style="cursor:default;">' + complectationsData.diagnosticsCards[indexOfSlides].themes[i].name + '<br>' +
                            '</div></div>';
                    }

                    for (let j = 0; j < complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards.length; j++) {
                        (complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].completeness == 100 && complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].score == null) ? complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].score = 100 : complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].score;
                        if (complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].completeness == null) {
                            complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].completeness = '——'
                            complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].score = '—'
                        }

                        if (complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].emphasis == 'writing') {
                            complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].name = complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].name + '✏'
                        } else if (complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].emphasis == 'pronunciation') {
                            complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].name = complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].name + '🎧'
                        } else if (complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].emphasis == 'speaking') {
                            complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].name = complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].name + '🎙'
                        }

                        testarr += '<div class="itemexerciseskids">' + [j + 1] + '.' +
                            complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].name + ' ' +
                            '<span class="savelinktocms" title="Копирует в буфер обмена ссылку на CMS для этого слайда" ' +
                            'complectationsData-subtype="' + kidsselector + '" ' +
                            'complectationsData-lessonid="' + complectationsData.diagnosticsCards[indexOfSlides].themes[i].meta.contentLessonId + '" ' +
                            'complectationsData-stepid="' + complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].id + '"> 💾 </span>' +
                            '<span style="float:right; margin-right: 80px;">' + complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].completeness + '</span>' +
                            '<span style="float:right; margin-right: 60px;">' + complectationsData.diagnosticsCards[indexOfSlides].themes[i].cards[j].score + '</span>' +
                            '</div>';
                    }
                }

                return testarr;
            }

            // Функция для генерации HTML для панели упражнений
            function generateExerciseBarHTML(complectationsData, kidsselector) {
                const exerciseHTML = generateExerciseHTML(complectationsData, kidsselector);

                const exerciseBarHTML = `
        <div class="roomtype">Тест/Пробник</div>
        <div class="boxwithslides" style="display:none">
            <div class="itemexerciseskids">
                <!-- Вставьте сюда информацию по категории -->
                ${exerciseHTML}
            </div>
        </div>
    `;

                document.getElementById('exercisebarComplect').innerHTML += exerciseBarHTML;
            }

            // Вызов функции для генерации HTML
            generateExerciseBarHTML(complectationsData, kidsselector);
            //End of DiagnosticCards

            if (complectationsData.participants[0].role == 'student') {
                var studentIndex = 0;
                var teacherIndex = 1;
            } else {
                var studentIndex = 1;
                var teacherIndex = 0;
            }

            document.getElementById('studnameComplect').innerHTML = '<span style="font-size: 17px;"> 👨‍🎓 </span>' + complectationsData.participants[studentIndex].name;
            document.getElementById('studserviceidComplect').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔 услуги: </span>' + complectationsData.participants[studentIndex].educationServiceId;
            document.getElementById('studidComplect').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + complectationsData.participants[studentIndex].userId;
            document.getElementById('teachnameComplect').innerHTML = '<span style="font-size: 17px;"> 👽 Teacher </span>' + complectationsData.participants[teacherIndex].name;
            document.getElementById('teachdidComplect').innerHTML = '<span style="user-select:none; font-size: 17px;">🆔: </span>' + complectationsData.participants[teacherIndex].userId;
            document.getElementById('RoomStatus').innerHTML = '<span style="user-select:none; font-size: 17px;">Статус комнаты: </span>' + (complectationsData.status == "success" ? '<span style="color:#00ff5c">success</span>' : `<span style="color:#daf50c">${complectationsData.status}</span>`);


        }

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
                let subtype = this.getAttribute('complectationsData-subtype');
                let lessonid = this.getAttribute('complectationsData-lessonid');
                let stepid = this.getAttribute('complectationsData-stepid');

                // Определение нужной ссылки в зависимости от наличия атрибута data-stepid
                let link;
                if (!stepid) {
                    link = `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}`;
                } else {
                    link = `https://cms.skyeng.ru/${subtype}/cms/lesson/${lessonid}/cards/${stepid}/edit`;
                }

                copyToClipboardTSM(link);
            }
        }
    }
}