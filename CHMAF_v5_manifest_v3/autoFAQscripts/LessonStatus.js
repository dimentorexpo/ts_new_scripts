const clearlessoninfo = localStorage.getItem('clearlessoninfo');
var win_LessonStatus =  // описание элементов окна статуса уроков
    `<div style="display: flex; width: 1060px;">
        <span style="width: 1060px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 1050px;">
                                <button class="mainButton buttonHide" id="hideMeLessonStatus">hide</button>
                                <button class="mainButton smallbtn" id="clearlessonstatus">🧹</button>
                        </div>
						 <div style="margin: 5px; width: 1050px" id="databox">
                            <span style="color:bisque; margin-top:5px; margin-left:5px;">Начальная дата<input class="" type="date" style="margin-left:5px; width:125px;" name="StartDataLS" id="dateFromLS"></span>
							<span style="color:bisque; margin-top:2px; margin-left: 10px; height:28px;">Конечная дата<input class="" type="date" style="margin-left:5px; width:125px;" name="EndDataLS" id="dateToLS"></span>
                            <input id="idteacherforsearch" class="" placeholder="Teacher ID" title="Введите ID учителя, чтобы проверить информацию по урокам" autocomplete="off" type="text" style="position:relative;text-align: center;width: 100px; margin-left: 15%;">
							<input id="idstudentforsearch" class="" placeholder="Student ID" title="Введите ID ученика, чтобы отфильтровать поиск" autocomplete="off" type="text" style="position:relative; text-align: center; width: 100px; margin-left:5px;">
                            <button class="mainButton" title="Запускает процесс поиска информации по статусам урока (отменен, перенесен, удален)" id="startlookstatus" style="float: right; margin-right: 10px;">Получить инфо об уроках</button>
                        </div>
				</span>
						<div>
							<p id="statustable" style="margin-top:5px; max-height:400px; overflow:auto; display:none; color:bisque; text-align:center"></p>
						</div>
        </span>
</div>`;

const wintLessonStatus = createWindow('AF_LessonStatus', 'winTopLessonStatus', 'winLeftLessonStatus', win_LessonStatus);
document.getElementById('AF_LessonStatus').ondblclick = function (a) { // скрытие окна создания
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') { document.getElementById('hideMeLessonStatus').click(); }
}

document.getElementById('hideMeLessonStatus').onclick = function () { // скрытие окна статус урока
    if (document.getElementById('AF_LessonStatus').style.display == '') {
        document.getElementById('AF_LessonStatus').style.display = 'none'
        if (clearlessoninfo == '0') { document.getElementById('statustable').innerText = ""; }
    }
}

function renewdate() { // функция обновления даты
    // get current date
    const now = new Date();

    // get current year, month and day
    const curYear = now.getFullYear();
    const curMonth = String(now.getMonth() + 1).padStart(2, "0");
    const curDay = String(now.getDate()).padStart(2, "0");

    // calculate previous day
    const prevDate = new Date(now);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, "0");

    // set date values in form inputs
    document.getElementById("dateFromLS").value = `${prevYear}-${prevMonth}-${curDay}`;
    document.getElementById("dateToLS").value = `${curYear}-${curMonth}-${curDay}`;

    document.getElementById('statustable').innerText = "";
    document.getElementById('idteacherforsearch').value = "";
    document.getElementById('idstudentforsearch').value = "";
}

document.getElementById('clearlessonstatus').onclick = function () { // очистить поля проверки статуса урока
    if (!confirm("Are you sure you want to clear?")) {
        return;
    }
    renewdate()
};

function getbutLessonInfoButtonPress() {
    if (clearlessoninfo == '0' || clearlessoninfo == '1' && document.getElementById('statustable').innerText == "") { renewdate() };

    if (document.getElementById('AF_LessonStatus').style.display == '') {
        document.getElementById('AF_LessonStatus').style.display = 'none'
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
        if (clearlessoninfo == '0') { document.getElementById('statustable').innerText = ""; }
    } else {
        document.getElementById('AF_LessonStatus').style.display = ''
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    }
}

//Функция проверки статусов урока

document.getElementById('startlookstatus').onclick = function () { //Функция проверки статусов урока
    if (document.getElementById('idteacherforsearch').value != "") {
        document.querySelector('#statustable').style.display = "";
        document.querySelector('#statustable').innerText = "Загрузка. Если информация не появилась нажмите повторно на кнопку получить инфа";
        let time_t = new Date();
        let ticherid = document.getElementById('idteacherforsearch').value.trim();
        let startdateElement = document.querySelector('#dateFromLS');
        let enddateElement = document.querySelector('#dateToLS');

        // Преобразуем значение в объект Date
        let startdate = new Date(startdateElement.value);
        let enddate = new Date(enddateElement.value);

        // Уменьшаем startdate на один день
        startdate.setDate(startdate.getDate() - 1);

        // Форматируем даты в требуемый формат
        startdate = `${('0' + startdate.getDate()).slice(-2)}-${('0' + (startdate.getMonth() + 1)).slice(-2)}-${startdate.getFullYear()} 21`;
        enddate = `${('0' + enddate.getDate()).slice(-2)}-${('0' + (enddate.getMonth() + 1)).slice(-2)}-${enddate.getFullYear()} 20`;

        const fetchURL = `https://timetable.skyeng.ru/api/teachers/search`;
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `from=${startdate}:00:00&to=${enddate}:59:59&offset=0&filters[teacherIds][]=${ticherid}&callback=getJSONP`,
            credentials: "include"
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
            if (!response.success) {
                alert('Не удалось проверить авторизацию на Datsy: ' + response.error);
                return;
            } else {
                const otvetTimeTable = JSON.parse(response.fetchansver);

                if (otvetTimeTable && otvetTimeTable[0].result[0].classes) {
                    const table = document.createElement('table');
                    table.style.width = '99.4%';
                    table.style.color = 'bisque';
                    table.style.fontWeight = '500';
                    table.style.backgroundColor = '#464451';
                    table.style.borderStyle = 'double';
                    table.style.fontSize = '13px';

                    const headers = ["🆔Ученика", "📆Урока, ⏰", "⚡Статус", "📅Отмечен, в⏰", "❓Кем", "💦Тип", "💬Комментарий", "❌Удалил", "📅Удален, в⏰"];
                    let headerRow = document.createElement('tr');
                    headers.forEach(header => {
                        let th = document.createElement('th');
                        th.textContent = header;
                        th.style = 'text-align:center; font-weight:700; background:dimgrey; border:1px solid black; padding:5px; position: sticky; top: 0;'
                        headerRow.appendChild(th);
                    });
                    table.appendChild(headerRow);

                    for (let i = 0; i < otvetTimeTable[0].result[0].classes.length; i++) {
                        let studentId = otvetTimeTable[0].result[0].classes[i].studentId;
                        if (document.getElementById('idstudentforsearch').value.trim().length != 0 && studentId && studentId == document.getElementById('idstudentforsearch').value.trim()) {
                            let row = document.createElement('tr');
                            row.classList = "rowOfLessonStatus"
                            let cell;

                            cell = document.createElement('td');
                            cell.textContent = studentId;
                            cell.style = "border: 1px solid black; font-size:12px;"
                            cell.setAttribute('name', 'idToCRM')
                            row.appendChild(cell);

                            let startAt = otvetTimeTable[0].result[0].classes[i].startAt;
                            cell = document.createElement('td');
                            cell.textContent = startAt ? new Date(startAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }).slice(0, 17) : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            let classStatus = otvetTimeTable[0].result[0].classes[i].classStatus;
                            cell = document.createElement('td');
                            cell.style.border = "1px solid black";
                            cell.style.fontSize = "12px";
                            cell.style.textShadow = "1px 2px 5px rgb(0 0 0 / 55%)";

                            if (classStatus) {
                                cell.textContent = classStatus.status;
                                cell.style.color = classStatus.status === "success" ? "#50e850" : "tomato";
                            } else if (typeof otvetTimeTable[0].result[0].classes[i].removedAt !== 'undefined') {
                                cell.textContent = "removed";
                                cell.style.color = "tomato";
                            } else {
                                cell.textContent = "unknown";
                            }
                            row.appendChild(cell);

                            cell = document.createElement('td');
                            cell.textContent = classStatus ? new Date(classStatus.createdAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }) : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            cell = document.createElement('td');
                            cell.textContent = classStatus ? classStatus.createdByUserId : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            let type = otvetTimeTable[0].result[0].classes[i].type;
                            cell = document.createElement('td');
                            cell.textContent = type || "";
                            cell.style = "border: 1px solid black; font-size:10px;"
                            row.appendChild(cell);

                            cell = document.createElement('td');
                            cell.textContent = classStatus ? classStatus.comment : "";
                            cell.style = "border: 1px solid black; font-size:10px;"
                            row.appendChild(cell);

                            let removedAt = otvetTimeTable[0].result[0].classes[i].removedAt;
                            cell = document.createElement('td');
                            cell.textContent = removedAt ? studentId : "";
                            cell.style = "border: 1px solid black;  font-size:12px;"
                            row.appendChild(cell);

                            cell = document.createElement('td');
                            cell.textContent = removedAt ? new Date(removedAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }) : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            table.appendChild(row);
                        } else if (document.getElementById('idstudentforsearch').value.trim().length == 0 && studentId) {
                            let row = document.createElement('tr');
                            row.classList = "rowOfLessonStatus"
                            let cell;

                            cell = document.createElement('td');
                            cell.textContent = studentId;
                            cell.style = "border: 1px solid black; font-size:12px;"
                            cell.setAttribute('name', 'idToCRM')
                            row.appendChild(cell);

                            let startAt = otvetTimeTable[0].result[0].classes[i].startAt;
                            cell = document.createElement('td');
                            cell.textContent = startAt ? new Date(startAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }).slice(0, 17) : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            let classStatus = otvetTimeTable[0].result[0].classes[i].classStatus;
                            cell = document.createElement('td');
                            cell.style.border = "1px solid black";
                            cell.style.fontSize = "12px";
                            cell.style.textShadow = "1px 2px 5px rgb(0 0 0 / 55%)";

                            if (classStatus) {
                                cell.textContent = classStatus.status;
                                cell.style.color = classStatus.status === "success" ? "#50e850" : "tomato";
                            } else if (typeof otvetTimeTable[0].result[0].classes[i].removedAt !== 'undefined') {
                                cell.textContent = "removed";
                                cell.style.color = "tomato";
                            } else {
                                cell.textContent = "unknown";
                            }
                            row.appendChild(cell);

                            cell = document.createElement('td');
                            cell.textContent = classStatus ? new Date(classStatus.createdAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }) : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            cell = document.createElement('td');
                            cell.textContent = classStatus ? classStatus.createdByUserId : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            let type = otvetTimeTable[0].result[0].classes[i].type;
                            cell = document.createElement('td');
                            cell.textContent = type || "";
                            cell.style = "border: 1px solid black; font-size:10px;"
                            row.appendChild(cell);

                            cell = document.createElement('td');
                            cell.textContent = classStatus ? classStatus.comment : "";
                            cell.style = "border: 1px solid black; font-size:10px;"
                            row.appendChild(cell);

                            let removedAt = otvetTimeTable[0].result[0].classes[i].removedAt;
                            cell = document.createElement('td');
                            cell.textContent = removedAt ? studentId : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            cell = document.createElement('td');
                            cell.textContent = removedAt ? new Date(removedAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }) : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);

                            table.appendChild(row);
                        }

                    }

                    document.getElementById('statustable').innerHTML = '';
                    document.getElementById('statustable').appendChild(table);

                    let spisochekU = '';
                    spisochekU = document.querySelectorAll('[name="idToCRM"]');
                    for (let i = 0; i < spisochekU.length; i++) {
                        spisochekU[i].onclick = function () {
                            window.open("https://crm2.skyeng.ru/persons/" + spisochekU[i].textContent)
                        }
                        spisochekU[i].oncontextmenu = function (event) {
                            event.preventDefault(); // Это предотвращает появление контекстного меню браузера
                            copyToClipboard(spisochekU[i].textContent);
                        }

                    }
                } else {
                    createAndShowButton('Уроков нет', 'error');
                }
            }
        })
    } else {
        createAndShowButton('Введите ID учителя в поле', 'error');
    }
}