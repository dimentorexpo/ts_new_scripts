var win_studentsAdults = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px;" id="studentsAdultsHeader">
                            <button class="commonbtn" title="скрывает меню" id="hidestudentsAdultstMenu" style="width:50px; height:30px; background: #228B22;">hide</button>
							<button class="commonbtn" id="addallchatswithadult" style="margin:5px" title="Добавляет чаты со всеми учениками из раздела "Уроки">➕💬</button>
							<button class="commonbtn" id="actualizestudreportadult" style="margin:5px" title="Актуализирует отчеты по всем ученикам заполняя поля символами --">📝</button>
                        </div>

						<input id="usersearch" style="margin-left: 8px;width: 628px; text-align:center;" placeholder="Enter user ID or name for search">

						<div id="infobaradult" class="infbaradult">
						<div>

					</span>
				   </div>`;

var win_studentsSkysmart = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px;" id="studentsSkysmartHeader">
                            <button class="commonbtn" title="скрывает меню" id="hidestudentsSkysmartMenu" style="width:50px; height:30px; background: #228B22;">hide</button>
							<button class="commonbtn" id="addallchatsmulticlassrom" style="margin:5px" title="Добавляет чаты со всеми учениками из раздела Multiclassroom">➕💬</button>
							<select id="listofsubjects">
								<option value="all">Все</option>
							</select>
							<button class="commonbtn" id="actualizestudreportkids" style="margin:5px" title="Актуализирует отчеты по всем ученикам в выбранном разделе "все" или отдельно каждом заполняя поля символами --">📝</button>
                        </div>

						<input id="usersearchskysmart" style="margin-left: 8px;width: 628px; text-align:center;" placeholder="Enter user ID for search">

						<div id="infobarskysmart" class="infbarskysmart">
						<div>

					</span>
				   </div>`;
                   
if (localStorage.getItem('winTopstudentsAdults') == null) { //additional adults students info menu
    localStorage.setItem('winTopstudentsAdults', '118');
    localStorage.setItem('winLeftstudentsAdults', '407');
}

if (localStorage.getItem('winTopstudentsSkysmart') == null) { //additional skysmart students info menu
    localStorage.setItem('winTopstudentsSkysmart', '118');
    localStorage.setItem('winLeftstudentsSkysmart', '407');
}

let wintStudAdults = document.createElement('div');
document.body.append(wintStudAdults);
wintStudAdults.className = 'wintInitializeAdultsStudentsInfo'
wintStudAdults.style = 'display:none;  top: ' + localStorage.getItem('winTopstudentsAdults') + 'px; left: ' + localStorage.getItem('winLeftstudentsAdults') + 'px;';
wintStudAdults.setAttribute('id', 'AFMS_AdultStudInfo');
wintStudAdults.innerHTML = win_studentsAdults;

let wintStudSkysmart = document.createElement('div');
document.body.append(wintStudSkysmart);
wintStudSkysmart.className = 'wintInitializeSkysmartStudentsInfo'
wintStudSkysmart.style = 'display:none;  top: ' + localStorage.getItem('winTopstudentsSkysmart') + 'px; left: ' + localStorage.getItem('winLeftstudentsSkysmart') + 'px;';
wintStudSkysmart.setAttribute('id', 'AFMS_SkysmartStudInfo');
wintStudSkysmart.innerHTML = win_studentsSkysmart;

// info students adult

var listenerStudAdults = function (e, a) {
    wintStudAdults.style.left = Number(e.clientX - myX9996) + "px";
    wintStudAdults.style.top = Number(e.clientY - myY9996) + "px";
    localStorage.setItem('winTopstudentsAdults', String(Number(e.clientY - myY9996)));
    localStorage.setItem('winLeftstudentsAdults', String(Number(e.clientX - myX9996)));
};
wintStudAdults.onmousedown = function (a) {
    if (checkelementt(a)) {
        window.myX9996 = a.layerX;
        window.myY9996 = a.layerY;
        document.addEventListener('mousemove', listenerStudAdults);
    }
}
wintStudAdults.onmouseup = function () { document.removeEventListener('mousemove', listenerStudAdults); }

// end info students adult

// info students kids

var listenerStudSkysmart = function (e, a) {
    wintStudSkysmart.style.left = Number(e.clientX - myX9995) + "px";
    wintStudSkysmart.style.top = Number(e.clientY - myY9995) + "px";
    localStorage.setItem('winTopstudentsSkysmart', String(Number(e.clientY - myY9995)));
    localStorage.setItem('winLeftstudentsSkysmart', String(Number(e.clientX - myX9995)));
};
wintStudSkysmart.onmousedown = function (a) {
    if (checkelementt(a)) {
        window.myX9995 = a.layerX;
        window.myY9995 = a.layerY;
        document.addEventListener('mousemove', listenerStudSkysmart);
    }
}
wintStudSkysmart.onmouseup = function () { document.removeEventListener('mousemove', listenerStudSkysmart); }

// end info students kids

document.getElementById('hidestudentsSkysmartMenu').onclick = function () {
    wintStudSkysmart.style.display = 'none'
}

document.getElementById('hidestudentsAdultstMenu').onclick = function () {
    wintStudAdults.style.display = 'none'
}

document.getElementById('lkpskysmart').onclick = async function () { //обработчик открытия окна для ЛКП - Skysmart
    if (wintStudSkysmart.style.display == 'none') {
        wintStudSkysmart.style.display = ''
        wintStudAdults.style.display = 'none'

        let arraytoshow = [];
        let commonarr = [];
        let sleepflag = '';
        let vacationflag = '';
        document.getElementById('infobarskysmart').innerHTML = '';
        let objSel = document.getElementById("listofsubjects");
        objSel.length = 1
        objSel[0].selected = true;

        await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {
            "credentials": "include",
            "method": "POST"
        }).then(r => r.json()).then(r => artId = r)
        console.log(artId)

        await fetch("https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/personal", {
            "headers": {
                "content-type": "application/json",
            },
            "method": "POST",
            "body": "{\"teacherId\":null}",
            "credentials": "include"
        }).then(r => r.json()).then(r => kidsdata = r)
        console.log(kidsdata)

        for (let i = 0; i < Object.keys(kidsdata).length; i++) {
            let multiclasssubjects = Object.keys(kidsdata)[i]
            switch (multiclasssubjects) {
                case 'math':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Математика</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Математика</span>' + '<br>' + arraytoshow;
                    break;

                case 'english':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Английский язык</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Английский язык</span>' + '<br>' + arraytoshow;
                    break;

                case 'russian':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Русский язык</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Русский язык</span>' + '<br>' + arraytoshow;
                    break;

                case 'social-science':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Обществознание</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Обществознание</span>' + '<br>' + arraytoshow;
                    break;

                case 'preschool':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Дошколка</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Дошколка</span>' + '<br>' + arraytoshow;
                    break;

                case 'chess':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Шахматы</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Шахматы</span>' + '<br>' + arraytoshow;
                    break;

                case 'computer-science':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Компьютерные курсы</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Компьютерные курсы</span>' + '<br>' + arraytoshow;
                    break;

                case 'chemistry':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Химия</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Химия</span>' + '<br>' + arraytoshow;
                    break;

                case 'physics':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Физика</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Физика</span>' + '<br>' + arraytoshow;
                    break;

                case 'history':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">История</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">История</span>' + '<br>' + arraytoshow;
                    break;

                case 'biology':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Биология</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">Биология</span>' + '<br>' + arraytoshow;
                    break;

                case 'geography':
                    arraytoshow = [];
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">География</span>' + '<br>' + arraytoshow;
                    commonarr += '<span class="subjname">География</span>' + '<br>' + arraytoshow;
                    break;
            }
        }

        if (Object.keys(kidsdata).length != 0) {
            for (let i = 0; i < Object.keys(kidsdata).length; i++) {
                if (Object.keys(kidsdata)[i] == "math") {
                    addOption(objSel, 'Математика', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "english") {
                    addOption(objSel, 'Английский язык', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "chess") {
                    addOption(objSel, 'Шахматы', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "computer-science") {
                    addOption(objSel, 'Компьютерные курсы', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "preschool") {
                    addOption(objSel, 'Дошколка', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "social-science") {
                    addOption(objSel, 'Обществознание', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "russian") {
                    addOption(objSel, 'Русский язык', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "physics") {
                    addOption(objSel, 'Физика', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "chemistry") {
                    addOption(objSel, 'Химия', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "history") {
                    addOption(objSel, 'История', `${Object.keys(kidsdata)[i]}`)
                } else if (Object.keys(kidsdata)[i] == "biology") {
                    addOption(objSel, 'Биология', `${Object.keys(kidsdata)[i]}`)
                }
            }
        }

        document.getElementById('usersearchskysmart').oninput = function () {
            var text2 = document.getElementById("usersearchskysmart");
            var val2 = text2.value;
            s2 = '';

            for (let i = 0; i < Object.keys(kidsdata).length; i++) {
                for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {
                    if (Object.values(kidsdata)[i][j].id == val2) {
                        if (Object.values(kidsdata)[i][j].status == "sleep") {
                            s2 += '<div class="kidsoutdata sleep">' + '<div class="sbjnamesearch">' + Object.keys(kidsdata)[i] + '</div>' + '<div class="studadultname">' + '<span title="💤 - ученик уснул">💤</span>' + ' ' + Object.values(kidsdata)[i][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[i][j].id + '</div>' + '</div>' + (Object.values(kidsdata)[i][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[i][j].segmentBadge + '</div>' : '') + 'Яз.обслуж: ' + (Object.values(kidsdata)[i][j].serviceLocale != null ? Object.values(kidsdata)[i][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>' + '</div>';
                        } else if (Object.values(kidsdata)[i][j].status == "vacation") {
                            s2 += '<div class="kidsoutdata vacation">' + '<div class="sbjnamesearch">' + Object.keys(kidsdata)[i] + '</div>' + '<div class="studadultname">' + '<span title="⛱ - ученик в отпуске">⛱</span>' + ' ' + Object.values(kidsdata)[i][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[i][j].id + '</div>' + (Object.values(kidsdata)[i][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[i][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[i][j].serviceLocale != null ? Object.values(kidsdata)[i][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>' + '</div>';
                        } else {
                            s2 += '<div class="kidsoutdata">' + '<div class="sbjnamesearch">' + Object.keys(kidsdata)[i] + '</div>' + '<div class="studadultname">' + Object.values(kidsdata)[i][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[i][j].id + '</div>' + (Object.values(kidsdata)[i][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[i][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[i][j].serviceLocale != null ? Object.values(kidsdata)[i][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>' + '</div>';
                        }
                    } else if (Object.values(kidsdata)[i][j].name.toUpperCase() == val2.toUpperCase()) {
                        if (Object.values(kidsdata)[i][j].status == "sleep") {
                            s2 += '<div class="kidsoutdata sleep">' + '<div class="sbjnamesearch">' + Object.keys(kidsdata)[i] + '</div>' + '<div class="studadultname">' + '<span title="💤 - ученик уснул">💤</span>' + ' ' + Object.values(kidsdata)[i][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[i][j].id + '</div>' + (Object.values(kidsdata)[i][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[i][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[i][j].serviceLocale != null ? Object.values(kidsdata)[i][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>' + '</div>';
                        } else if (Object.values(kidsdata)[i][j].status == "vacation") {
                            s2 += '<div class="kidsoutdata vacation">' + '<div class="studadultname">' + '<div class="sbjnamesearch">' + Object.keys(kidsdata)[i] + '</div>' + '<span title="⛱ - ученик в отпуске">⛱</span>' + ' ' + Object.values(kidsdata)[i][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[i][j].id + '</div>' + (Object.values(kidsdata)[i][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[i][j].segmentBadge + '</div>' : '') + '<div  class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[i][j].serviceLocale != null ? Object.values(kidsdata)[i][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>' + '</div>';
                        } else {
                            s2 += '<div class="kidsoutdata">' + '<div class="sbjnamesearch">' + Object.keys(kidsdata)[i] + '</div>' + '<div class="studadultname">' + Object.values(kidsdata)[i][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[i][j].id + '</div>' + (Object.values(kidsdata)[i][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[i][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[i][j].serviceLocale != null ? Object.values(kidsdata)[i][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>' + '</div>';
                        }
                    }
                }
            }

            document.getElementById('infobarskysmart').innerHTML = document.getElementById("usersearchskysmart").value != '' ? s2 : commonarr;

            let arrmvurepkid = document.getElementsByName('mvurkidseport') // функция открытия отчетов МВУ при работе со списком исходным после получения инфы об учениках
            for (let j = 0; j < arrmvurepkid.length; j++) {
                arrmvurepkid[j].onclick = function () {
                    window.open("https://marketing-core.skyeng.ru/report/html/report?student_id=" + document.getElementsByClassName('idkidsstyle')[j].textContent.match(/\d+/)[0])
                }
            }

            let deleteonechatkid = document.getElementsByName('delkidschat') // функция удаления чатов с учеником при работе с исходным списком после получения инфы об учениках
            for (let l = 0; l < deleteonechatkid.length; l++) {
                deleteonechatkid[l].onclick = function () {
                    let answ = confirm("Вы действительно желаете удалить чат с учеником? " + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0]);
                    if (answ) {
                        fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
                            "headers": {
                                "content-type": "application/json",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-site"
                            },
                            "referrer": "https://new-teachers.skyeng.ru/",
                            "referrerPolicy": "strict-origin-when-cross-origin",
                            "body": `{\"userId1\": ${artId.user.id},\"userId2\":${document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0]}}`,
                            "method": "DELETE",
                            "mode": "cors",
                            "credentials": "include"
                        });
                    }
                }
            }

            let kidsprofile = document.getElementsByName('openkidsprofile') // функция открытия профиля ученика после получения исходного списка
            for (let l = 0; l < kidsprofile.length; l++) {
                kidsprofile[l].onclick = function () {
                    window.open("https://vimbox.skyeng.ru/profile/" + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0])
                }
            }

            let kidspaymentshistory = document.getElementsByName('openpaymentkidsshistory')  // функция открытия истории оплат ученика после получения исходного списка
            for (let l = 0; l < kidspaymentshistory.length; l++) {
                kidspaymentshistory[l].onclick = function () {
                    window.open('https://vimbox.skyeng.ru/profile/student/' + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0] + '/last-classes')
                }
            }
        }

        async function outputskysmartstudents(item) { //вывод учеников чтобы 100500 раз не писать этот текст
            for (let j = 0; j < Object.values(kidsdata)[item].length; j++) {
                Object.values(kidsdata)[item][j].segmentBadge != null ? Object.values(kidsdata)[item][j].segmentBadge : '';
                if (Object.values(kidsdata)[item][j].status == 'sleep') {
                    arraytoshow += '<div class="kidsoutdata sleep">' + '<div class="studkidstname">' + '<span title="💤 - ученик уснул">💤</span>' + Object.values(kidsdata)[item][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[item][j].id + '</div>' + (Object.values(kidsdata)[item][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[item][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[item][j].serviceLocale != null ? Object.values(kidsdata)[item][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>';
                } else if (Object.values(kidsdata)[item][j].status == 'vacation') {
                    arraytoshow += '<div class="kidsoutdata vacation">' + '<div class="studkidstname">' + '<span title="⛱ - ученик в отпуске">⛱</span>' + Object.values(kidsdata)[item][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[item][j].id + '</div>' + (Object.values(kidsdata)[item][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[item][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[item][j].serviceLocale != null ? Object.values(kidsdata)[item][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>';
                } else {
                    arraytoshow += '<div class="kidsoutdata">' + '<div class="studkidstname">' + Object.values(kidsdata)[item][j].name + '</div>' + '<div class="idkidsstyle">' + 'ID: ' + Object.values(kidsdata)[item][j].id + '</div>' + (Object.values(kidsdata)[item][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[item][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[item][j].serviceLocale != null ? Object.values(kidsdata)[item][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>';
                }
            }
        }


        function showselectedsubject() { // функция переключения отображения списка учеников в мультиклассруме только один предмет выводит или все
            document.getElementById('infobarskysmart').innerHTML = ''
            arraytoshow = [];
            document.getElementById('infobarskysmart').innerHTML = '';
            for (let i = 0; i < Object.keys(kidsdata).length; i++) {
                let objSelf = document.getElementById("listofsubjects");
                if (objSelf.value == 'math' && Object.keys(kidsdata)[i] == 'math') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Математика</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'english' && Object.keys(kidsdata)[i] == 'english') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Английский язык</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'russian' && Object.keys(kidsdata)[i] == 'russian') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Русский язык</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'chess' && Object.keys(kidsdata)[i] == 'chess') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Шахматы</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'computer-science' && Object.keys(kidsdata)[i] == 'computer-science') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Компьютерные курсы</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'preschool' && Object.keys(kidsdata)[i] == 'preschool') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Дошколка</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'social-science' && Object.keys(kidsdata)[i] == 'social-science') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Обществознание</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'physics' && Object.keys(kidsdata)[i] == 'physics') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Физика</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'chemistry' && Object.keys(kidsdata)[i] == 'chemistry') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Химия</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'history' && Object.keys(kidsdata)[i] == 'history') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">История</span>' + '<br>' + arraytoshow;
                    break;
                } else if (objSelf.value == 'biology' && Object.keys(kidsdata)[i] == 'biology') {
                    outputskysmartstudents(item = i)
                    document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Биология</span>' + '<br>' + arraytoshow;
                    break;

                } else if (objSelf.value == 'all') {
                    let multiclasssubjects = Object.keys(kidsdata)[i]
                    switch (multiclasssubjects) {
                        case 'math':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Математика</span>' + '<br>' + arraytoshow;
                            break;

                        case 'english':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Английский язык</span>' + '<br>' + arraytoshow;
                            break;

                        case 'russian':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Русский язык</span>' + '<br>' + arraytoshow;
                            break;

                        case 'social-science':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Обществознание</span>' + '<br>' + arraytoshow;
                            break;

                        case 'preschool':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Дошколка</span>' + '<br>' + arraytoshow;
                            break;

                        case 'chess':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Шахматы</span>' + '<br>' + arraytoshow;
                            break;

                        case 'computer-science':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Компьютерные курсы</span>' + '<br>' + arraytoshow;
                            break;

                        case 'chemistry':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Химия</span>' + '<br>' + arraytoshow;
                            break;

                        case 'physics':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Физика</span>' + '<br>' + arraytoshow;
                            break;

                        case 'history':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">История</span>' + '<br>' + arraytoshow;
                            break;

                        case 'biology':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">Биология</span>' + '<br>' + arraytoshow;
                            break;

                        case 'geography':
                            arraytoshow = [];
                            outputskysmartstudents(item = i)
                            document.getElementById('infobarskysmart').innerHTML += '<span class="subjname">География</span>' + '<br>' + arraytoshow;
                            break;
                    }
                }
            }

            let arrmvurepkid = document.getElementsByName('mvurkidseport') // функция открытия отчетов МВУ при работе со списком фильтрации предметов
            for (let j = 0; j < arrmvurepkid.length; j++) {
                arrmvurepkid[j].onclick = function () {
                    window.open("https://marketing-core.skyeng.ru/report/html/report?student_id=" + document.getElementsByClassName('idkidsstyle')[j].textContent.match(/\d+/)[0])
                }
            }

            let deleteonechatkid = document.getElementsByName('delkidschat') // функция удаления чатов с учеником при работе со списком фильтрации предметов
            for (let l = 0; l < deleteonechatkid.length; l++) {
                deleteonechatkid[l].onclick = function () {
                    let answ = confirm("Вы действительно желаете удалить чат с учеником? " + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0]);
                    if (answ) {
                        fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
                            "headers": {
                                "content-type": "application/json",
                                "sec-fetch-mode": "cors",
                                "sec-fetch-site": "same-site"
                            },
                            "referrer": "https://new-teachers.skyeng.ru/",
                            "referrerPolicy": "strict-origin-when-cross-origin",
                            "body": `{\"userId1\": ${artId.user.id},\"userId2\":${document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0]}}`,
                            "method": "DELETE",
                            "mode": "cors",
                            "credentials": "include"
                        });
                    }
                }
            }

            let kidsprofile = document.getElementsByName('openkidsprofile') // функция открытия профиля ученика после фильтрации списка
            for (let l = 0; l < kidsprofile.length; l++) {
                kidsprofile[l].onclick = function () {
                    window.open("https://vimbox.skyeng.ru/profile/" + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0])
                }
            }

            let kidspaymentshistory = document.getElementsByName('openpaymentkidsshistory')  // функция открытия истории оплат ученика после фильтрации
            for (let l = 0; l < kidspaymentshistory.length; l++) {
                kidspaymentshistory[l].onclick = function () {
                    window.open('https://vimbox.skyeng.ru/profile/student/' + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0] + '/last-classes')
                }
            }
        }

        document.getElementById('actualizestudreportkids').onclick = function () { // функция актуалазирует все отчеты в выбранном предмете или разделе "Все"
            let idslist = document.getElementsByClassName('idkidsstyle')
            for (let k = 0; k < idslist.length; k++) {

                fetch("https://api-profile.skyeng.ru/api/v1/students/" + idslist[k].textContent.match(/\d+/)[0] + "/school-report", {
                    "body": "{\"student_level\":\"--\",\"materials_used\":\"--\",\"endurance\":\"--\",\"distraction\":\"--\",\"difficulties\":\"--\",\"activities\":\"--\",\"skills_to_develop\":\"--\",\"technical_problems\":\"--\",\"homework\":\"--\"}",
                    "method": "POST",
                    "credentials": "include"
                });
            }
            alert('Отчеты об учениках были успешно актуализированы с заполнением полей -- !');
        }

        let arrmvurepkid = document.getElementsByName('mvurkidseport') // функция открытия отчетов МВУ при работе со списком исходным после получения инфы об учениках
        for (let j = 0; j < arrmvurepkid.length; j++) {
            arrmvurepkid[j].onclick = function () {
                window.open("https://marketing-core.skyeng.ru/report/html/report?student_id=" + document.getElementsByClassName('idkidsstyle')[j].textContent.match(/\d+/)[0])
            }
        }

        let deleteonechatkid = document.getElementsByName('delkidschat') // функция удаления чатов с учеником при работе с исходным списком после получения инфы об учениках
        for (let l = 0; l < deleteonechatkid.length; l++) {
            deleteonechatkid[l].onclick = function () {
                let answ = confirm("Вы действительно желаете удалить чат с учеником? " + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0]);
                if (answ) {
                    fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
                        "headers": {
                            "content-type": "application/json",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site"
                        },
                        "referrer": "https://new-teachers.skyeng.ru/",
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "body": `{\"userId1\": ${artId.user.id},\"userId2\":${document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0]}}`,
                        "method": "DELETE",
                        "mode": "cors",
                        "credentials": "include"
                    });
                }
            }
        }

        let kidsprofile = document.getElementsByName('openkidsprofile') // функция открытия профиля ученика после получения исходного списка
        for (let l = 0; l < kidsprofile.length; l++) {
            kidsprofile[l].onclick = function () {
                window.open("https://vimbox.skyeng.ru/profile/" + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0])
            }
        }

        let kidspaymentshistory = document.getElementsByName('openpaymentkidsshistory')  // функция открытия истории оплат ученика после получения исходного списка
        for (let l = 0; l < kidspaymentshistory.length; l++) {
            kidspaymentshistory[l].onclick = function () {
                window.open('https://vimbox.skyeng.ru/profile/student/' + document.getElementsByClassName('idkidsstyle')[l].textContent.match(/\d+/)[0] + '/last-classes')
            }
        }


        document.getElementById('listofsubjects').onchange = showselectedsubject;

        document.getElementById('addallchatsmulticlassrom').onclick = function () { // функция добавляющая в один клик чаты со всеми не уснувшими учениками
            let sidarr = [];

            for (let i = 0; i < Object.keys(kidsdata).length; i++) {
                let arrayofsubjects = Object.keys(kidsdata)[i]
                switch (arrayofsubjects) {
                    case 'math': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cМатематика', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }
                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками в разделе Математика - Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'russian': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cРусский язык', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }
                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Русский язык - Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'social-science': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cОбществознание', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Обществознание - Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'preschool': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cДошколка', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Дошкольная подготовка - Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'chess': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cШахматы', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Шахматы -  Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'computer-science': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cКомпьютерные курсы', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Компьютерные курсы - Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'chemistry': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cХимия', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Химия -  Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'physics': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cФизика', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Физика - Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'english': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cАнглийский язык', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Английский язык -  Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'history': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cИстория', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела История -  Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'biology': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cБиология', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","

                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела Биология - Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                    case 'geography': console.log(Object.values(kidsdata)[i])
                        sidarr = [];
                        console.log('%cГеография', 'color:lightgreen; font-weight:700')
                        for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {

                            if (Object.values(kidsdata)[i][j].status != "sleep")
                                sidarr += Object.values(kidsdata)[i][j].id + ","


                            console.log(Object.values(kidsdata)[i][j].id + " Status: " + Object.values(kidsdata)[i][j].status)
                        }

                        if (typeof (sidarr) != 'object') {
                            sidarr = sidarr.split(',');

                            for (let j = 0; j < sidarr.length - 1; j++) {
                                fetchaddchat(sidarr[j], artId.user.id, "POST")
                            }
                            alert("Чаты с учениками раздела География - Multi-classroom добавлены в количестве: " + (sidarr.length - 1))
                        }
                        break;
                }
            }
        }

    } else {
        wintStudSkysmart.style.display = 'none'
    }
}

let testos;
document.getElementById('lkpadult').onclick = async function () { // функция обработчик открытия меню ЛКП Adults
    if (wintStudAdults.style.display == 'none') {
        wintStudSkysmart.style.display = 'none'
        wintStudAdults.style.display = ''

        let arrtoshow = [];

        await fetch("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {
            "credentials": "include",
            "method": "POST"
        }).then(r => r.json()).then(r => artId = r)
        console.log(artId)

        await fetch("https://rooms-vimbox.skyeng.ru/users/api/v1/teachers/" + artId.user.id + "/students", {
            "method": "GET",
            "credentials": "include"
        }).then(r => r.json()).then(r => adultdata = r)
        console.log(adultdata)
        testos = adultdata;

        for (let i = 0; i < adultdata.length; i++) {
            arrtoshow += '<div class="rowadultdata">' + '<div class="studadultname">' + adultdata[i].name + '</div>' + '<div class="idadultstyle"> ID: ' + adultdata[i].id + '<span name="removeadult" class="removestudent" title="По клику удаляет ученика из списка учеников">🚷</span>' + ' ' + '</div>' + '<div style="margin-top: 5px; margin-bottom: 5px; text-align:center;">' + '<span name="mvureport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delchat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + ' ' + '<span name="listofhomework" class="homeworklist" title="Открывает раздел с домашними заданиями ученика">🏡</span>' + ' ' + '<span name="portfolioadult" class="portfoliolist" title="Открывает раздел с Портфолио">📚</span>' + '</div>' + '</div>'
        }

        document.getElementById('infobaradult').innerHTML = arrtoshow;

        document.getElementById('usersearch').oninput = function () { //функция поикска по айди пользователя
            var text1 = document.getElementById("usersearch");
            var val1 = text1.value;
            var idcontainer = [];
            s = '';

            for (var i = 0; i < testos.length; ++i) {
                if (adultdata[i].id == val1) {
                    s += '<div class="rowadultdata">' + '<div class="studadultname">' + adultdata[i].name + '</div>' + '<div class="idadultstyle"> ID: ' + adultdata[i].id + '<span name="removeadult" class="removestudent" title="По клику удаляет ученика из списка учеников">🚷</span>' + ' ' + '</div>' + '<div style="margin-top: 5px; margin-bottom: 5px; text-align:center;">' + '<span name="mvureport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delchat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + ' ' + '<span name="listofhomework" class="homeworklist" title="Открывает раздел с домашними заданиями ученика">🏡</span>' + ' ' + '<span name="portfolioadult" class="portfoliolist" title="Открывает раздел с Портфолио">📚</span>' + '</div>' + '</div>'
                    idcontainer.push(adultdata[i].id)
                } else if (adultdata[i].name.toUpperCase() == val1.toUpperCase()) {
                    s += '<div class="rowadultdata">' + '<div class="studadultname">' + adultdata[i].name + '</div>' + '<div class="idadultstyle"> ID: ' + adultdata[i].id + '<span name="removeadult" class="removestudent" title="По клику удаляет ученика из списка учеников">🚷</span>' + ' ' + '</div>' + '<div style="margin-top: 5px; margin-bottom: 5px; text-align:center;">' + '<span name="mvureport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delchat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + ' ' + '<span name="listofhomework" class="homeworklist" title="Открывает раздел с домашними заданиями ученика">🏡</span>' + ' ' + '<span name="portfolioadult" class="portfoliolist" title="Открывает раздел с Портфолио">📚</span>' + '</div>' + '</div>'
                    idcontainer.push(adultdata[i].id)
                }
            }
            console.log("ID's: " + idcontainer)
            document.getElementById('infobaradult').innerHTML = document.getElementById("usersearch").value != '' ? s : arrtoshow;

            let arrmvurep = document.getElementsByName('mvureport')
            for (let j = 0; j < arrmvurep.length; j++) {
                arrmvurep[j].onclick = function () {
                    window.open("https://marketing-core.skyeng.ru/report/html/report?student_id=" + idcontainer[j])
                }
            }

            let removestudent = document.getElementsByName('removeadult')
            for (let z = 0; z < removestudent.length; z++) {
                removestudent[z].onclick = function () {

                    let answ = confirm("Вы действительно желаете удалить ученика " + idcontainer[z] + " из списка?");
                    if (answ) {
                        fetch("https://rooms-vimbox.skyeng.ru/users/api/v1/teachers/unlink-student/" + idcontainer[z], {
                            "method": "POST",
                            "mode": "cors",
                            "credentials": "include"
                        });
                    }
                }
            }

            let deleteonechat = document.getElementsByName('delchat')
            for (let l = 0; l < deleteonechat.length; l++) {
                deleteonechat[l].onclick = function () {
                    let answ = confirm("Вы действительно желаете удалить чат с учеником? " + idcontainer[l]);
                    if (answ) {

                        fetchaddchat(artId.user.id, idcontainer[i], "DELETE")
                    }
                }
            }

            let adultprofile = document.getElementsByName('openprofile')
            for (let l = 0; l < adultprofile.length; l++) {
                adultprofile[l].onclick = function () {
                    window.open("https://vimbox.skyeng.ru/profile/" + idcontainer[l])
                }
            }

            let showpaymentshistory = document.getElementsByName('openpaymentshistory')
            for (let l = 0; l < showpaymentshistory.length; l++) {
                showpaymentshistory[l].onclick = function () {
                    window.open('https://vimbox.skyeng.ru/profile/student/' + idcontainer[l] + '/last-classes')
                }
            }

            let hwlist = document.getElementsByName('listofhomework')
            for (let l = 0; l < hwlist.length; l++) {
                hwlist[l].onclick = function () {
                    window.open('https://vimbox.skyeng.ru/student/' + idcontainer[l] + '/homework')
                }
            }

            let portflist = document.getElementsByName('portfolioadult')
            for (let l = 0; l < portflist.length; l++) {
                portflist[l].onclick = function () {
                    window.open('https://vimbox.skyeng.ru/portfolio?studentId=' + idcontainer[l])
                }
            }
        }

        document.getElementById('addallchatswithadult').onclick = function () { // функция добавляет чаты со всеми взрослыми ученикаим

            for (let k = 0; k < adultdata.length; k++) {

                fetchaddchat(artId.user.id, adultdata[k].id, "POST")

            }
            alert('Чаты со всеми учениками были добавлены успешно! Страницу будет перезагружена!');
            location.reload()
        }

        document.getElementById('actualizestudreportadult').onclick = function () {

            for (let k = 0; k < adultdata.length; k++) {

                fetch("https://api-profile.skyeng.ru/api/v1/students/" + adultdata[k].id + "/school-report", {
                    "body": "{\"student_level\":\"--\",\"materials_used\":\"--\",\"endurance\":\"--\",\"distraction\":\"--\",\"difficulties\":\"--\",\"activities\":\"--\",\"skills_to_develop\":\"--\",\"technical_problems\":\"--\",\"homework\":\"--\"}",
                    "method": "POST",
                    "credentials": "include"
                });
            }
            alert('Отчеты об учениках были успешно актуализированы с заполнением полей -- !');
        }

        let arrmvurep = document.getElementsByName('mvureport')
        for (let j = 0; j < arrmvurep.length; j++) {
            arrmvurep[j].onclick = function () {
                window.open("https://marketing-core.skyeng.ru/report/html/report?student_id=" + adultdata[j].id)
            }
        }

        let removestudent = document.getElementsByName('removeadult')
        for (let z = 0; z < removestudent.length; z++) {
            removestudent[z].onclick = function () {
                let deletestudansw;
                deletestudansw = confirm("Вы уверены, что хотите удалить ученика из Showcase?")
                if (deletestudansw) {

                    fetch("https://rooms-vimbox.skyeng.ru/users/api/v1/teachers/unlink-student/" + adultdata[z].id, {
                        "method": "POST",
                        "mode": "cors",
                        "credentials": "include"
                    });
                }
            }
        }

        let deleteonechat = document.getElementsByName('delchat')
        for (let l = 0; l < deleteonechat.length; l++) {
            deleteonechat[l].onclick = function () {
                let answ = confirm("Вы действительно желаете удалить чат с учеником? " + adultdata[l].id);
                if (answ) {
                    fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
                        "headers": {
                            "content-type": "application/json",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-site"
                        },
                        "referrer": "https://new-teachers.skyeng.ru/",
                        "referrerPolicy": "strict-origin-when-cross-origin",
                        "body": `{\"userId1\": ${artId.user.id},\"userId2\":${adultdata[l].id}}`,
                        "method": "DELETE",
                        "mode": "cors",
                        "credentials": "include"
                    });
                }
            }
        }

        let adultprofile = document.getElementsByName('openprofile')
        for (let l = 0; l < adultprofile.length; l++) {
            adultprofile[l].onclick = function () {
                window.open("https://vimbox.skyeng.ru/profile/" + adultdata[l].id)
            }
        }

        let showpaymentshistory = document.getElementsByName('openpaymentshistory')
        for (let l = 0; l < showpaymentshistory.length; l++) {
            showpaymentshistory[l].onclick = function () {
                window.open('https://vimbox.skyeng.ru/profile/student/' + adultdata[l].id + '/last-classes')
            }
        }

        let hwlist = document.getElementsByName('listofhomework')
        for (let l = 0; l < hwlist.length; l++) {
            hwlist[l].onclick = function () {
                window.open('https://vimbox.skyeng.ru/student/' + adultdata[l].id + '/homework')
            }
        }

        let portflist = document.getElementsByName('portfolioadult')
        for (let l = 0; l < portflist.length; l++) {
            portflist[l].onclick = function () {
                window.open('https://vimbox.skyeng.ru/portfolio?studentId=' + adultdata[l].id)
            }
        }

    } else {
        wintStudAdults.style.display = 'none'
    }
}