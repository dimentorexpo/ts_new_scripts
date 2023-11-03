let hwroomdata = '';
var win_kidsExercises = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px; width:550px;" id="exercisesSkysmartHeader">
                            <button class="commonbtn" title="скрывает меню" id="hideExercisesSkysmartMenu" style="width:50px; height:30px; background: #228B22;">hide</button>
							<button class="commonbtn" id="RefreshInfoExerciseKids" title = "Обновляет информацию по открытой комнате" style="margin: 5px; width: 25px; height: 25px; padding: 0;">♻</button>
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
							<input id="roomhashhwkids" placeholder="homework link" style="width: 490px; margin-left: 15px; text-align: center;">
							<button class="commonbtn" id="getroomdatakids">🔎</button>
						</div>

						<div id="exercisebarskysmart" class="skysmartexcbar">
						<div>

					</span>
				   </div>`;

var win_TTCExercises = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px; width:500px;" id="exercisesTTCHeader">
                            <button class="commonbtn" title="скрывает меню" id="hideExercisesTTCMenu" style="width:50px; height:30px; background: #228B22;">hide</button>
							<button class="commonbtn" id="RefreshInfoExerciseTTC" title = "Обновляет информацию по открытой комнате" style="margin: 5px; width: 25px; height: 25px; padding: 0;">♻</button>
                        </div>

						<div style="margin:5px;">
							<input id="roomhashttc" placeholder="Room link" style="width: 500px; margin-left: 10px; text-align: center;">
							<button class="commonbtn" id="getroomdatattc">🔎</button>
						</div>

						<div id="exercisebarttc" class="skysmartexcbar">
						<div>

					</span>
				   </div>`;

if (localStorage.getItem('winTopexercisesSkysmart') == null) { //additional skysmart students exercise menu
    localStorage.setItem('winTopexercisesSkysmart', '118');
    localStorage.setItem('winLeftexercisesSkysmart', '407');
}

if (localStorage.getItem('winTopexercisesTTC') == null) { //additional TTC info menu
    localStorage.setItem('winTopexercisesTTC', '118');
    localStorage.setItem('winLeftexercisesTTC', '407');
}

let wintExercSkysmart = document.createElement('div');
document.body.append(wintExercSkysmart);
wintExercSkysmart.className = 'wintInitializeSkysmartExercisesInfo'
wintExercSkysmart.style = 'display:none;  top: ' + localStorage.getItem('winTopexercisesSkysmart') + 'px; left: ' + localStorage.getItem('winLeftexercisesSkysmart') + 'px;';
wintExercSkysmart.setAttribute('id', 'AFMS_SkysmartExercInfo');
wintExercSkysmart.innerHTML = win_kidsExercises;

let wintExercTTC = document.createElement('div');
document.body.append(wintExercTTC);
wintExercTTC.className = 'wintInitializeTTCExercisesInfo'
wintExercTTC.style = 'display:none;  top: ' + localStorage.getItem('winTopexercisesTTC') + 'px; left: ' + localStorage.getItem('winLeftexercisesTTC') + 'px;';
wintExercTTC.setAttribute('id', 'AFMS_TTCExercInfo');
wintExercTTC.innerHTML = win_TTCExercises;

// Exercises skysmart

var listenerExercSkysmart = function (e, a) {
    wintExercSkysmart.style.left = Number(e.clientX - myX9993) + "px";
    wintExercSkysmart.style.top = Number(e.clientY - myY9993) + "px";
    localStorage.setItem('winTopexercisesSkysmart', String(Number(e.clientY - myY9993)));
    localStorage.setItem('winLeftexercisesSkysmart', String(Number(e.clientX - myX9993)));
};
wintExercSkysmart.onmousedown = function (a) {
    if (checkelementt(a)) {
        window.myX9993 = a.layerX;
        window.myY9993 = a.layerY;
        document.addEventListener('mousemove', listenerExercSkysmart);
    }
}
wintExercSkysmart.onmouseup = function () { document.removeEventListener('mousemove', listenerExercSkysmart); }

// End Exercises skysmart

// Exercises TTC

var listenerExercTTC = function (e, a) {
    wintExercTTC.style.left = Number(e.clientX - myX9992) + "px";
    wintExercTTC.style.top = Number(e.clientY - myY9992) + "px";
    localStorage.setItem('winTopexercisesTTC', String(Number(e.clientY - myY9992)));
    localStorage.setItem('winLeftexercisesTTC', String(Number(e.clientX - myX9992)));
};
wintExercTTC.onmousedown = function (a) {
    if (checkelementt(a)) {
        window.myX9992 = a.layerX;
        window.myY9992 = a.layerY;
        document.addEventListener('mousemove', listenerExercTTC);
    }
}
wintExercTTC.onmouseup = function () { document.removeEventListener('mousemove', listenerExercTTC); }

// End Exercises TTC

document.getElementById('exercisekysmart').onclick = async function () { // открывает менюшку скайсмарт упражнений
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
		setTimeout( function() {
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

function getkidsroominfo(data,subjecttype) {
    let temparr = [];
    let hwarr = [];
	let indexOfSlides=''
			
	let flagofuser='';

	for (let z=0; z<data.participants.length;z++) {
		if (data.participants[z].role == 'student')
			flagofuser = data.participants[z].userId;
	}
	
	for (let usId=0; usId<data.lessonCards.length; usId++) {
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
			temparr += '<div style="margin: 5px">'+ 
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
        savelinkarr[z].onclick = function() {
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

document.getElementById('exercisesttc').onclick = async function () {
    if (wintExercTTC.style.display == 'none') {
        wintExercTTC.style.display = ''
        wintExercSkysmart.style.display = 'none'

        if (location.host == 'ttc.skyeng.ru') {
            document.getElementById('roomhashttc').value = document.URL.split('/')[5];
            document.getElementById('getroomdatakids').click();
        } else document.getElementById('roomhashttc').value = "Не открыт TTC курс! Откройте и повторите Или введите хеш одним словом"

        document.getElementById('hideExercisesTTCMenu').onclick = function () {
            wintExercTTC.style.display = 'none'
        }

        document.getElementById('RefreshInfoExerciseTTC').onclick = function () {
            if (location.host == 'ttc.skyeng.ru') {
                document.getElementById('roomhashttc').value = document.URL.split('/')[5];
                document.getElementById('getroomdatakids').click();
            } else document.getElementById('roomhashttc').value = "Не открыт TTC курс! Откройте и повторите Или введите хеш одним словом"
        }

        document.getElementById('getroomdatattc').onclick = async function () {
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
    }
    else {
        wintExercTTC.style.display = 'none'
    }
}
