var win_getLessonInfo = `
				<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

						<div style="margin: 5px; width: 490px;" id="LessonInfoHeader">
                            <button class="commonbtn hidebtns" title="скрывает меню" id="hideMeLessonInfo">hide</button>
							<button class="commonbtn smallbtns" id="RefreshInfo" title = "Обновляет информацию в полях, использовать при подключении к уроку! Если работаете на других страницах с формой есть кнопка Search позволяющая подтягивать актуальный статус" style="margin: 5px;">♻</button>
							<button class="commonbtn smallbtns" id="ClearInfo" title = "Очищает информацию в полях">🧹</button>
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

const wintLessonInfo = createTSMWindow('AFMS_LessonInfo', 'winTopLessonInfo', 'winLeftLessonInfo', win_getLessonInfo);
wintLessonInfo.className = 'wintInitializeLessonInfo';

async function OpenLessonmInfoMenu() {
    const menuVisible = wintLessonInfo.style.display !== 'none';
    wintLessonInfo.style.display = menuVisible ? 'none' : '';

    if (!menuVisible) {
        handleRoomInfo('join');
        setupEventHandlers();
    }
}

function setupEventHandlers() {
    document.getElementById('setstclass').addEventListener('click', () => changeRoomStatus('classwork'));
    document.getElementById('setstsucc').addEventListener('click', () => changeRoomStatus('success'));
    document.getElementById('hashroom').addEventListener('click', copyRoomLink);
    document.getElementById('searchHash').addEventListener('click', () => handleRoomInfo('search'));
    document.getElementById('RefreshInfo').addEventListener('click', () => handleRoomInfo('join'));
    document.getElementById('ClearInfo').addEventListener('click', clearInfoFields);
    document.getElementById('hideMeLessonInfo').addEventListener('click', () => wintLessonInfo.style.display = 'none');
}

function handleRoomInfo(action) {
    let platformType, subject, hash;
    if (action === 'search') {
        const hashval = document.getElementById('hashfield').value.split('/');
        platformType = determinePlatformType(hashval);
        subject = hashval[4] + '/' + hashval[5];
        hash = hashval[4];
    } else {
        platformType = getPlatformType();
        subject = document.URL.split('/')[4] + "/" + document.URL.split('/')[5];
        hash = document.URL.split('/')[4];
    }

    setPlatformUI(platformType);
    const api = findapi(subject, 1);

    if (document.location.origin === 'https://vimbox.skyeng.ru') {
        switch (platformType) {
            case 1:
                loadinfo(api);
                break;
            case 2:
                document.getElementById('hashroom').textContent = hash;
                document.getElementById('statusroom').textContent = "No status";
                document.getElementById('subjectnamefield').textContent = "ENGLISH";
                getusersadults(hash);
                getjoinadultsinfo(hash);
                break;
            default:
                resetPlatformUI();
                break;
        }
    }
}

function determinePlatformType(hashval) {
    return hashval[3] === 'kids' ? 1 : hashval[3] === 'lesson' ? 2 : 0;
}

function getPlatformType() {
    const path = location.pathname.split('/');
    return path[1] === 'kids' ? 1 : path[1] === 'lesson' ? 2 : 0;
}

function setPlatformUI(platformType) {
    const platformNameElem = document.getElementById('platformname');
    const roomForElem = document.getElementById('roomfor');
    const forStudentIdElem = document.getElementById('forstudentid');
    const setStClassElem = document.getElementById('setstclass');
    const setStSuccElem = document.getElementById('setstsucc');

    if (platformType === 1) {
        platformNameElem.textContent = "Skysmart";
        roomForElem.style.display = 'none';
        forStudentIdElem.style.display = 'none';
        setStClassElem.style.display = '';
        setStSuccElem.style.display = '';
    } else if (platformType === 2) {
        platformNameElem.textContent = "Adults";
        roomForElem.style.display = '';
        forStudentIdElem.style.display = '';
        setStClassElem.style.display = 'none';
        setStSuccElem.style.display = 'none';
    } else {
        resetPlatformUI();
    }
}

function resetPlatformUI() {
    document.getElementById('platformname').textContent = "";
    document.getElementById('roomfor').style.display = 'none';
    document.getElementById('forstudentid').style.display = 'none';
    document.getElementById('setstclass').style.display = 'none';
    document.getElementById('setstsucc').style.display = 'none';
}

function changeRoomStatus(status) {
    let subject, api;
    const hashFieldVal = document.getElementById('hashfield').value.split('/');

    if (!hashFieldVal[0]) {
        subject = document.URL.split('/')[4] + "/" + document.URL.split('/')[5];
    } else {
        subject = hashFieldVal[4] + '/' + hashFieldVal[5];
        alert('Комната была перезапущена. Можете нажать на кнопку Search и увидеть актуальный статус комнаты');
    }

    api = findapi(subject, 1);
    setstclasswork(api, status);
}

function copyRoomLink() {
    const subjectNameField = document.getElementById('subjectnamefield').textContent;
    const platformName = document.getElementById('platformname').textContent;
    const hashRoom = document.getElementById('hashroom').textContent;
    let link;

    if (subjectNameField && platformName === 'Skysmart') {
        link = `https://vimbox.skyeng.ru/kids/${subjectNameField.toLowerCase()}/room/${hashRoom}`;
    } else if (subjectNameField && platformName === 'Adults') {
        link = `https://vimbox.skyeng.ru/lesson/${hashRoom}`;
    }

    if (link) {
        copyToClipboardTSM(link);
        alert('Ссылка на комнату скопирована в буфер обмена!');
    }
}

function clearInfoFields() {
    document.getElementById('platformname').textContent = "";
    document.getElementById('roomfor').style.display = 'none';
    document.getElementById('forstudentid').style.display = 'none';
    document.getElementById('subjectnamefield').textContent = "";
    document.getElementById('statusroom').textContent = "";
    document.getElementById('hashroom').textContent = "";
    document.getElementById('partteachid').textContent = "";
    document.getElementById('partstudid').textContent = "";
    document.getElementById('hashfield').value = "";
    document.getElementById('setstclass').style.display = 'none';
    document.getElementById('setstsucc').style.display = 'none';
}

async function getusersadults(hash) {
    try {
        const response = await fetch("https://rooms.vimbox.skyeng.ru/rooms/api/v1/workbooks/last?roomHash=" + hash, {
            method: "GET",
            credentials: "include"
        });
        const usersadults = await response.json();
        console.log(usersadults);
        document.getElementById('forstudentid').textContent = usersadults.studentId;

        document.getElementById('forstudentid').onclick = () => {
            copyToClipboardTSM(usersadults.studentId);
        };
    } catch (error) {
        console.error('Ошибка при получении информации о пользователе:', error);
    }
}

async function getjoinadultsinfo(hash) {
    try {
        const joinresult = await joinroom(hash);
        document.getElementById('partteachid').textContent = joinresult.teacher.id;
        document.getElementById('partteachid').title = joinresult.teacher.name + " " + joinresult.teacher.surname;

        const studentInfo = joinresult.students.length > 0 ? joinresult.students[0] : { id: "New Student", name: "No name", surname: "Student didn't join the room" };
        document.getElementById('partstudid').textContent = studentInfo.id;
        document.getElementById('partstudid').title = studentInfo.name + " " + studentInfo.surname;
    } catch (error) {
        console.error('Ошибка при получении информации о комнате:', error);
    }
}

async function loadinfo(api) {
    const hashroom = document.getElementById('hashfield').value.split('/')[6] || document.URL.split('/')[6];
    const subjname = document.getElementById('hashfield').value.split('/')[4] || document.URL.split('/')[4];

    try {
        const response = await fetch(api + hashroom, {
            method: "GET",
            credentials: "include"
        });
        const joinresult = await response.json();
        document.getElementById('statusroom').textContent = joinresult.status;
        document.getElementById('hashroom').textContent = joinresult.hash;
        // Обновление информации об участниках
        updateParticipantsInfo(joinresult.participants);
        document.getElementById('subjectnamefield').textContent = subjname.toUpperCase();
        console.log('Информация об уроке получена:', joinresult);
    } catch (error) {
        console.error('Ошибка при загрузке информации о комнате:', error);
    }
}

function updateParticipantsInfo(participants) {
    participants.forEach(participant => {
        const idField = participant.role === 'teacher' ? 'partteachid' : 'partstudid';
        document.getElementById(idField).textContent = participant.userId;
        document.getElementById(idField).title = `Имя ${participant.name}, Время создания комнаты: ${participant.startAt}, Время подключения: ${participant.joinedAt}`;
    });
}

function findapi(subject, vapi) {
    const baseURL = "https://api-";
    const subjects = {
        "english": "english",
        "math": "math",
        "computer-science": "computer-science",
        "geography": "geography",
        "chess": "chess",
        "social-science": "social-science",
        "history": "history",
        "biology": "biology",
        "physics": "physics",
        "literature": "literature",
        "chemistry": "chemistry",
        "russian": "russian",
        "preschool": "preschool"
    };

    let subjectName = subject.split("/")[0];
    if (!subjects[subjectName]) {
        console.error(`Ошибка: предмет ${subjectName} не найден.`);
        return null;
    }

    return `${baseURL}${subjects[subjectName]}.skyeng.ru/api/v${vapi}/rooms/`;
}

async function setstclasswork(api, status) {
    const hashval = document.getElementById('hashfield').value.split('/');
    const roomId = hashval[6] || document.URL.split('/')[6];

    if (location.origin === 'https://vimbox.skyeng.ru' && location.pathname.split('/')[3] !== 'teacher') {
        try {
            const response = await fetch(api + roomId, {
                headers: {
                    accept: "application/json",
                    "content-type": "application/json"
                },
                body: JSON.stringify({ status, name: "" }),
                method: "PATCH",
                mode: "cors",
                credentials: "include"
            });

            if (response.ok) {
                alert('Статус комнаты изменён на ' + status + '!');
                location.reload();
            } else {
                alert('Ошибка при изменении статуса.');
            }
        } catch (error) {
            console.error('Ошибка при изменении статуса комнаты:', error);
        }
    } else {
        console.error('Невозможно изменить статус комнаты: неверный путь или домен.');
    }
}

async function joinroom(item) {
    try {
        const response = await fetch(`https://rooms-vimbox.skyeng.ru/rooms/api/v1/rooms/${item}/join`, {
            method: "PATCH",
            credentials: "include"
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка при подключении к комнате:', error);
        return null;
    }
}