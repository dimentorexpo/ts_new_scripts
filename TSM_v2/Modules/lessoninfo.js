var win_getLessonInfo = `
				<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

						<div style="margin: 5px; width: 490px;" id="LessonInfoHeader">
                            <button class="commonbtn hidebtns" title="скрывает меню" id="hideMeLessonInfo">hide</button>
							<button class="commonbtn" id="RefreshInfo" title = "Обновляет информацию в полях, использовать при подключении к уроку! Если работаете на других страницах с формой есть кнопка Search позволяющая подтягивать актуальный статус" style="margin: 5px; width: 25px; height: 25px; padding: 0;">♻</button>
							<button class="commonbtn" id="ClearInfo" title = "Очищает информацию в полях" style="width: 25px; height: 25px; padding: 0;">🧹</button>
							<span id="platform" style="margin-left: 5px; width:50px; height:25px; text-align:center; color:bisque; margin:5px; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); user-select:none;">Platform: </span>
							<span id="platformname" style="width: 110px; height:30px;text-align: center;color: #fff; border-radius:5px;background: #627998f0; padding:5px; margin:5px; border:1px solid white; font-weight:500; box-shadow: 0px 5px 5px rgb(0 0 0 / 55%); font-size: 12px; cursor:text;"></span>
							<span id="roomfor" style="display: none; margin-left: 5px; width:50px; height:25px; text-align:center; color:bisque; margin:5px; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); user-select:none;">Room for Student ID: </span>
							<span id="forstudentid" style="display:none; width: 110px; height:30px;text-align: center;color: #fff; border-radius:5px;background: #627998f0; padding:5px; margin:5px; border:1px solid white; font-weight:500; box-shadow: 0px 5px 5px rgb(0 0 0 / 55%); font-size: 12px; cursor:pointer;" title="При клике копирует в буфер обмена айди ученика"></span>
                        </div>

						<div style="margin-left: 5px; height: 25px;">
							<span id="subjectname" style="margin-left: 5px; width:50px; height:25px; text-align:center; color:bisque; margin:5px; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); user-select:none;">Subject: </span>
							<span id="subjectnamefield" style="width: 110px; height:30px;text-align: center;color: #fff; border-radius:5px;background: #2569c3f0; padding:5px; margin:5px; border:1px solid white; font-weight:500; box-shadow: 0px 5px 5px rgb(0 0 0 / 55%); font-size: 11px; user-select:none;"></span>
						</div>

						<div style="margin: 5px; width: 490px; display:flex; flex-wrap: wrap; align-items:center;">
							<span id="statusroomid" class = "lesson-field-name">Status:</span>
							<span id="statusroom" class = "lesson-field-value"></span>
							<span id="hashroomid" class = "lesson-field-name">Hash:</span>
							<span id="hashroom" class = "lesson-field-value" style="cursor:pointer;" title = "При клике копирует в буфер обмена ссылку на комнату!"></span>
						<br>
							<span id="participantteacher" class = "lesson-field-name">Teacher:</span>
							<span id="partteachid" class = "lesson-field-value"></span>
							<span id="participantstudent" class = "lesson-field-name">Student:</span>
							<span id="partstudid" class = "lesson-field-value"></span>
						</div>

						<div>
						<input id="hashfield" placeholder = "Enter full hash or  just 1 word roomhash for adults platform" title = "Example: https://vimbox.skyeng.ru/kids/russian/room/xinisoborada" style="width:480px; text-align:center; margin-left:6px;">
						</div>

						<div style="display: flex; justify-content: center;">
							<button class="commonbtn" id="setstclass" style="margin: 5px; width: 70px; height: 30px;">Classwork</button>
                            <button class="commonbtn" id="setstsucc" style="margin: 5px; width: 70px; height: 30px;">Success</button>
							<button class="commonbtn" id="searchHash" style="margin: 5px; width: 70px; height: 30px;">Search</button>
						</div>

					</span>
				  </div>`;

const wintLessonInfo  = createTSMWindow('AFMS_LessonInfo', 'winTopLessonInfo', 'winLeftLessonInfo', win_getLessonInfo);
wintLessonInfo.className = 'wintInitializeLessonInfo';

async function OpenLessonmInfoMenu() { // открывает меню для просмотра информации об уроке

    if (wintLessonInfo.style.display == 'none') {
        wintLessonInfo.style.display = ''

        getlesinfojoin()

        //	Start

        document.getElementById('setstclass').onclick = function () { //изменяет статус комнаты на classwork
            let status = 'classwork'
            let subject;
            let api;
            let vapi = '1';
            if (document.getElementById('hashfield').value.split('/') == '')
                subject = document.URL.split('/')[4] + "/" + document.URL.split('/')[5]
            else if (document.getElementById('hashfield').value.split('/') != '') {
                subject = document.getElementById('hashfield').value.split('/')[4] + '/' + document.getElementById('hashfield').value.split('/')[5];
                alert('Комната была перезапущена. Можете нажать на кнопку Searсh и увидеть актуальный статус комнаты')
            }
            api = findapi(subject, vapi)
            setstclasswork(api, status)
        }

        // End

        //	Start

        document.getElementById('setstsucc').onclick = function () { //изменяет статус комнаты на success
            let status = 'success'
            let subject;
            let api;
            let vapi = '1';
            if (document.getElementById('hashfield').value.split('/') == '')
                subject = document.URL.split('/')[4] + "/" + document.URL.split('/')[5]
            else if (document.getElementById('hashfield').value.split('/') != '') {
                subject = document.getElementById('hashfield').value.split('/')[4] + '/' + document.getElementById('hashfield').value.split('/')[5];
                alert('Комната была перезапущена. Можете нажать на кнопку Searсh и увидеть актуальный статус комнаты')
            }
            api = findapi(subject, vapi)
            setstclasswork(api, status)
        }

        // End

        // Start

        document.getElementById('hashroom').onclick = function () { // копируепт по клику ссылку на комнату в skysmart в буфер обмена
            if (document.getElementById('subjectnamefield').textContent != '' && document.getElementById('platformname').textContent == 'Skysmart') {
                copyToClipboardTSM('https://vimbox.skyeng.ru/kids/' + document.getElementById('subjectnamefield').textContent.toLowerCase() + '/room/' + document.getElementById('hashroom').textContent)
                alert('Ссылка на комнату скопирована в буфер обмена!')
            } else if (document.getElementById('subjectnamefield').textContent != '' && document.getElementById('platformname').textContent == 'Adults') {
                copyToClipboardTSM('https://vimbox.skyeng.ru/lesson/' + document.getElementById('hashroom').textContent)
                alert('Ссылка на комнату скопирована в буфер обмена!')
            }
        }

        // End

        // Start
        document.getElementById('searchHash').onclick = async function () { // функция ищет информацию о комнате по полному хешу
            let vapi = '1';
            let api1;
            let api2;
            let hashval = document.getElementById('hashfield').value.split('/')

            let flagplatf = 0; // unknown platform, for example main page or other page (1) - skysmart, (2) - adults
            if (hashval[3] == 'kids') {
                document.getElementById('platformname').textContent = "Skysmart";
                flagplatf = 1;
                document.getElementById('roomfor').style.display = 'none'
                document.getElementById('forstudentid').style.display = 'none'
                document.getElementById('setstclass').style.display = ''
                document.getElementById('setstsucc').style.display = ''
            } else if (hashval[3] == 'lesson') {
                document.getElementById('platformname').textContent = "Adults";
                flagplatf = 2;
                document.getElementById('roomfor').style.display = ''
                document.getElementById('forstudentid').style.display = ''
                document.getElementById('setstclass').style.display = 'none'
                document.getElementById('setstsucc').style.display = 'none'
            } else {
                flagplatf = 0
                document.getElementById('platformname').textContent = "";
                document.getElementById('roomfor').style.display = 'none'
                document.getElementById('forstudentid').style.display = 'none'
                document.getElementById('setstclass').style.display = 'none'
                document.getElementById('setstsucc').style.display = 'none'
            }

            if (hashval != '' && flagplatf == 1) {
                let subject = hashval[4] + '/' + hashval[5]

                api1 = findapi(subject, vapi)
                vapi++;
                api2 = findapi(subject, vapi)
                loadinfo(api2)

            } else if (hashval != '' && flagplatf == 2) {
                document.getElementById('hashroom').textContent = hashval[4];
                document.getElementById('statusroom').textContent = "No status"
                document.getElementById('subjectnamefield').textContent = "ENGLISH"

                getusersadults(hash = hashval[4]);
                getjoinadultsinfo(hash = hashval[4]);

            } else if (hashval != '' && flagplatf == 0 && hashval.length == 1) {
                getusersadults(hash = hashval[0]);
                getjoinadultsinfo(hash = hashval[0]);

                document.getElementById('platformname').textContent = "Adults"
                document.getElementById('hashroom').textContent = hashval[0];
                document.getElementById('statusroom').textContent = "No status"
                document.getElementById('subjectnamefield').textContent = "ENGLISH"
                document.getElementById('roomfor').style.display = ''
                document.getElementById('forstudentid').style.display = ''
            }
        }
        //end

        document.getElementById('RefreshInfo').onclick = getlesinfojoin; //функция обновляет информацию о комнате

        document.getElementById('ClearInfo').onclick = function () { // Очиска полей ввода
            document.getElementById('platformname').textContent = ""
            document.getElementById('roomfor').style.display = 'none'
            document.getElementById('forstudentid').style.display = 'none'
            document.getElementById('subjectnamefield').textContent = ""
            document.getElementById('statusroom').textContent = ""
            document.getElementById('hashroom').textContent = ""
            document.getElementById('partteachid').textContent = ""
            document.getElementById('partstudid').textContent = ""
            document.getElementById('hashfield').value = ""
            document.getElementById('setstclass').style.display = 'none'
            document.getElementById('setstsucc').style.display = 'none'
        }

        document.getElementById('hideMeLessonInfo').onclick = function () { // функция скрывает меню статуса уроков
            wintLessonInfo.style.display = 'none'
        }

    } else wintLessonInfo.style.display = 'none'

}

async function getlesinfojoin() { // получает инфо об уроке и записывает в поля
    let vapi = '1';
    let api1;
    let api2;
    let flagplatf = 0; // unknown platform, for example main page or other page (1) - skysmart, (2) - adults
    if (location.pathname.split('/')[1] == 'kids') {
        document.getElementById('platformname').textContent = "Skysmart";
        flagplatf = 1;
        document.getElementById('roomfor').style.display = 'none'
        document.getElementById('forstudentid').style.display = 'none'
        document.getElementById('setstclass').style.display = ''
    } else if (location.pathname.split('/')[1] == 'lesson') {
        document.getElementById('platformname').textContent = "Adults";
        flagplatf = 2;
        document.getElementById('roomfor').style.display = ''
        document.getElementById('forstudentid').style.display = ''
        document.getElementById('setstclass').style.display = 'none'
    } else {
        flagplatf = 0
        document.getElementById('platformname').textContent = "";
        document.getElementById('roomfor').style.display = 'none'
        document.getElementById('forstudentid').style.display = 'none'
        document.getElementById('setstclass').style.display = 'none'
    }

    if (document.location.origin == 'https://vimbox.skyeng.ru' && flagplatf == 1) {
        let subject = document.URL.split('/')[4] + "/" + document.URL.split('/')[5]

        api1 = findapi(subject, vapi)
        vapi++;
        api2 = findapi(subject, vapi)
        loadinfo(api2)

    } else if (document.location.origin == 'https://vimbox.skyeng.ru' && flagplatf == 2) {

        document.getElementById('hashroom').textContent = document.URL.split('/')[4];
        document.getElementById('statusroom').textContent = "No status"
        document.getElementById('subjectnamefield').textContent = "ENGLISH"
        getusersadults(hash = document.URL.split('/')[4]);
        getjoinadultsinfo(hash = document.URL.split('/')[4]);

    }
}

async function getusersadults(hash) { // функция получения информации для какого пользователя была создана комната на Adults
    await fetch("https://rooms.vimbox.skyeng.ru/rooms/api/v1/workbooks/last?roomHash=" + hash, {
        "method": "GET",
        "credentials": "include"
    }).then(r => r.json()).then(r => usersadults = r)

    console.log(usersadults)

    document.getElementById('forstudentid').textContent = usersadults.studentId;

    document.getElementById('forstudentid').onclick = function () {
        copyToClipboardTSM(document.getElementById('forstudentid').textContent)
    }
}

async function getjoinadultsinfo(hash) { // функция получает информацию пользователйе на Adults
    await joinroom(hash)

    document.getElementById('partteachid').textContent = joinresult.teacher.id
    document.getElementById('partteachid').title = joinresult.teacher.name + " " + joinresult.teacher.surname

    if (joinresult.students == '') {
        document.getElementById('partstudid').textContent = "New Student"
        document.getElementById('partstudid').title = "No name, because student didn't join the room"
    }
    else {
        document.getElementById('partstudid').textContent = joinresult.students[0].id
        document.getElementById('partstudid').title = joinresult.students[0].name + " " + joinresult.students[0].surname
    }


}

async function loadinfo(api2) { // инициализация функции для загрузки инфо о комнате
    let hashroom;
    let subjname;
    if (document.getElementById('hashfield').value == '') {
        hashroom = document.URL.split('/')[6]
        subjname = document.URL.split('/')[4]
    } else if (document.getElementById('hashfield').value != '') {
        hashroom = document.getElementById('hashfield').value.split('/')[6]
        subjname = document.getElementById('hashfield').value.split('/')[4]
    }


    await fetch(api2 + hashroom, {
        "body": null,
        "method": "GET",
        "credentials": "include"
    }).then(r => r.json()).then(r => joinresult = r)
    document.getElementById('statusroom').textContent = joinresult.status
    document.getElementById('hashroom').textContent = joinresult.hash

    for (let i = 0; i < joinresult.participants.length; i++) {
        if (joinresult.participants[i].role == 'teacher') {
            document.getElementById('partteachid').textContent = joinresult.participants[i].userId
            document.getElementById('partteachid').title = "Имя " + joinresult.participants[i].name + ' Время создания комнаты: ' + joinresult.participants[i].startAt + ' Время подключения: ' + joinresult.participants[i].joinedAt
        } else if (joinresult.participants[i].role == 'student') {
            document.getElementById('partstudid').textContent = joinresult.participants[i].userId
            document.getElementById('partstudid').title = "Имя " + joinresult.participants[i].name + ' Время создания комнаты: ' + joinresult.participants[i].startAt + ' Время подключения: ' + joinresult.participants[i].joinedAt
        }
    }

    document.getElementById('subjectnamefield').textContent = subjname.toUpperCase();

    console.log('%cИнформация об уроке получена!', 'color:lightgreen; font-weight:700')
    console.log(joinresult)
}

function findapi(subject, vapi) {
    let findapiv1;
    let findapiv2;

    switch (subject) {
        case "english/room":
            findapiv1 = ("https://api-english.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-english.skyeng.ru/api/v2/rooms/")
            break;

        case "math/room":
            findapiv1 = ("https://api-math.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-math.skyeng.ru/api/v2/rooms/")
            break;

        case "computer-science/room":
            findapiv1 = ("https://api-computer-science.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-computer-science.skyeng.ru/api/v2/rooms/")
            break;

        case "geography/room":
            findapiv1 = ("https://api-geography.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-geography.skyeng.ru/api/v2/rooms/")
            break;

        case "chess/room":
            findapiv1 = ("https://api-chess.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-chess.skyeng.ru/api/v2/rooms/")
            break;

        case "social-science/room":
            findapiv1 = ("https://api-social-science.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-social-science.skyeng.ru/api/v2/rooms/")
            break;

        case "history/room":
            findapiv1 = ("https://api-history.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-history.skyeng.ru/api/v2/rooms/")
            break;

        case "biology/room":
            findapiv1 = ("https://api-biology.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-biology.skyeng.ru/api/v2/rooms/")
            break;

        case "physics/room":
            findapiv1 = ("https://api-physics.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-physics.skyeng.ru/api/v2/rooms/")
            break;

        case "literature/room":
            findapiv1 = ("https://api-literature.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-literature.skyeng.ru/api/v2/rooms/")
            break;

        case "chemistry/room":
            findapiv1 = ("https://api-chemistry.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-chemistry.skyeng.ru/api/v2/rooms/")
            break;

        case "russian/room":
            findapiv1 = ("https://api-russian.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-russian.skyeng.ru/api/v2/rooms/")
            break;

        case "preschool/room":
            findapiv1 = ("https://api-preschool.skyeng.ru/api/v1/rooms/")
            findapiv2 = ("https://api-preschool.skyeng.ru/api/v2/rooms/")
            break;
    }
    if (vapi == '1') {
        return (findapiv1)
    } else if (vapi == '2') {
        return (findapiv2)
    } else {
        console.log(vapi + 'ошибка определения api');
    }
}

function setstclasswork(api, status) { // функция изменяющая статус комнаты

    let hashval = document.getElementById('hashfield').value.split('/')

    if (location.origin == 'https://vimbox.skyeng.ru' && hashval == '' && location.pathname.split('/')[3] != 'teacher') {

        fetch(api + document.URL.split('/')[6], {
            "headers": {
                "accept": "application/json",
                "content-type": "application/json",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "body": "{\"status\":\"" + status + "\",\"name\":\"\"}",
            "method": "PATCH",
            "mode": "cors",
            "credentials": "include"
        });

        alert('Выставлен статус ' + status + ' !')
        location.reload();
    } else if (hashval != '') {

        fetch(api + hashval[6], {
            "headers": {
                "accept": "application/json",
                "content-type": "application/json",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site"
            },
            "body": "{\"status\":\"" + status + "\",\"name\":\"\"}",
            "method": "PATCH",
            "mode": "cors",
            "credentials": "include"
        });

    }

}

async function joinroom(item) { //функция сканирования комнаты по запросу на join
    await fetch("https://rooms-vimbox.skyeng.ru/rooms/api/v1/rooms/" + item + "/join", {
        "method": "PATCH",
        "credentials": "include"
    }).then(r => r.json()).then(r => joinresult = r)
    console.log(joinresult)
}