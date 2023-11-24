var win_studentsAdults = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px;" id="studentsAdultsHeader">
                            <button class="commonbtn hidebtns" title="скрывает меню" id="hidestudentsAdultstMenu">hide</button>
							<button class="commonbtn" id="addallchatswithadult" style="margin:5px" title="Добавляет чаты со всеми учениками из раздела "Уроки">➕💬</button>
							<button class="commonbtn smallbtns" id="actualizestudreportadult" style="margin:5px" title="Актуализирует отчеты по всем ученикам заполняя поля символами --">📝</button>
                        </div>

						<input id="usersearch" style="margin-left: 8px;width: 628px; text-align:center;" placeholder="Enter user ID or name for search">

						<div id="infobaradult" class="infbaradult">
						<div>

					</span>
				   </div>`;

var win_studentsSkysmart = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px;" id="studentsSkysmartHeader">
                            <button class="commonbtn hidebtns" title="скрывает меню" id="hidestudentsSkysmartMenu">hide</button>
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
const wintStudAdults  = createTSMWindow('AFMS_AdultStudInfo', 'winTopstudentsAdults', 'winLeftstudentsAdults', win_studentsAdults);
wintStudAdults.className = 'wintInitializeAdultsStudentsInfo';

const wintStudSkysmart  = createTSMWindow('AFMS_SkysmartStudInfo', 'winTopstudentsSkysmart', 'winLeftstudentsSkysmart', win_studentsSkysmart);
wintStudSkysmart.className = 'wintInitializeSkysmartStudentsInfo';

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
			var val2 = this.value.toLowerCase();
			var s2 = '';

			for (let i = 0; i < Object.keys(kidsdata).length; i++) {
				for (let j = 0; j < Object.values(kidsdata)[i].length; j++) {
					let kidName = Object.values(kidsdata)[i][j].name.toLowerCase();
					let kidId = Object.values(kidsdata)[i][j].id.toString();

					if (kidName.includes(val2) || kidId.includes(val2)) {
						// Теперь этот блок будет выполняться, если найдено соответствие
						var kid = Object.values(kidsdata)[i][j];
						var statusSymbol = kid.status === 'sleep' ? '💤' : (kid.status === 'vacation' ? '⛱' : '');
						var statusTitle = kid.status === 'sleep' ? 'ученик уснул' : (kid.status === 'vacation' ? 'ученик в отпуске' : '');
						var segmentBadge = kid.segmentBadge ? `<div class="badgename">${kid.segmentBadge}</div>` : '';
						var serviceLocale = kid.serviceLocale ? kid.serviceLocale : 'Пусто';
						s2 += `<div class="kidsoutdata ${kid.status}">
									<div class="sbjnamesearch">${Object.keys(kidsdata)[i]}</div>
									<div class="studadultname">
										<span title="${statusTitle}">${statusSymbol}</span> ${kid.name}
									</div>
									<div class="idkidsstyle">🆔: ${kid.id}</div>
									${segmentBadge}
									<div class="languageobsl">Яз.обслуж: ${serviceLocale}</div>
									<div style="text-align:center;">
										<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>
										<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>
										<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>
										<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>
									</div>
								</div>`;
					}
				}
			}

            document.getElementById('infobarskysmart').innerHTML = document.getElementById("usersearchskysmart").value != '' ? s2 : commonarr;

            let arrmvurepkid = document.getElementsByName('mvurkidseport') // функция открытия отчетов МВУ при работе со списком исходным после получения инфы об учениках
            for (let j = 0; j < arrmvurepkid.length; j++) {
                arrmvurepkid[j].onclick = function () {
                    window.open("https://overbooking.skyeng.ru/html/report?student_id=" + document.getElementsByClassName('idkidsstyle')[j].textContent.match(/\d+/)[0])
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
                    arraytoshow += '<div class="kidsoutdata sleep">' + '<div class="studkidstname">' + '<span title="💤 - ученик уснул">💤</span>' + Object.values(kidsdata)[item][j].name + '</div>' + '<div class="idkidsstyle">' + '🆔: ' + Object.values(kidsdata)[item][j].id + '</div>' + (Object.values(kidsdata)[item][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[item][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[item][j].serviceLocale != null ? Object.values(kidsdata)[item][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>';
                } else if (Object.values(kidsdata)[item][j].status == 'vacation') {
                    arraytoshow += '<div class="kidsoutdata vacation">' + '<div class="studkidstname">' + '<span title="⛱ - ученик в отпуске">⛱</span>' + Object.values(kidsdata)[item][j].name + '</div>' + '<div class="idkidsstyle">' + '🆔: ' + Object.values(kidsdata)[item][j].id + '</div>' + (Object.values(kidsdata)[item][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[item][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[item][j].serviceLocale != null ? Object.values(kidsdata)[item][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>';
                } else {
                    arraytoshow += '<div class="kidsoutdata">' + '<div class="studkidstname">' + Object.values(kidsdata)[item][j].name + '</div>' + '<div class="idkidsstyle">' + '🆔: ' + Object.values(kidsdata)[item][j].id + '</div>' + (Object.values(kidsdata)[item][j].segmentBadge != null ? '<div class="badgename">' + Object.values(kidsdata)[item][j].segmentBadge + '</div>' : '') + '<div class="languageobsl">' + 'Яз.обслуж: ' + (Object.values(kidsdata)[item][j].serviceLocale != null ? Object.values(kidsdata)[item][j].serviceLocale : 'Пусто') + '</div>' + '<div style="text-align:center;">' + '<span name="mvurkidseport" class="mvushka" title="По клику открывает отчет МВУ с новой ссылкой">📋</span>' + ' ' + '<span name="delkidschat" class="deletechat" title="По клику удаляет чат с учеником">❌</span>' + ' ' + '<span name="openkidsprofile" class="adultprofile" title="Открывает полный профиль ученика">🕵️‍♂️</span>' + ' ' + '<span name="openpaymentkidsshistory" class="paymenthistory" title="Открывает Историю оплат ученика">💰</span>' + '</div>' + '</div>';
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
                    window.open("https://overbooking.skyeng.ru/html/report?student_id=" + document.getElementsByClassName('idkidsstyle')[j].textContent.match(/\d+/)[0])
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
                window.open("https://overbooking.skyeng.ru/html/report?student_id=" + document.getElementsByClassName('idkidsstyle')[j].textContent.match(/\d+/)[0])
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
