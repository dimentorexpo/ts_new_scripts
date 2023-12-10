var win_LessonStatus =  // описание элементов окна статуса уроков
    `<div class="maindivst" style="display: flex; width: 1060px;">
        <span style="width: 1060px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 1050px;" id="lessomstatdata">
                                <button class="buttonHide" id="hideMeLessonStatus">hide</button>
                                <button class="btnCRM btnCRMsmall" id="clearlessonstatus" title="Очищает поля с результатами и полем для ввода">🧹</button>
                        </div>
                        <div style="margin: 5px; width: 1050px" id="databox">
							<span class="spanCRM" style="color:bisque; float:center; margin-top:5px; margin-left:5px;">Начальная дата<input class="inputCRM" type="date" style="color:black; margin-left:5px; width:125px;" name="StartDataLS" id="dateFromLS"></span>
                            <span class="spanCRM" style="color:bisque; margin-top:2px; margin-left: 10px; height:28px;">Конечная дата<input class="inputCRM" type="date" style="color:black; margin-left:5px; width:125px;" name="EndDataLS" id="dateToLS"></span>
                            <input class="inputCRM" id="idteacherforsearch" placeholder="Teacher ID" title="Введите ID учителя, чтобы проверить информацию по урокам" autocomplete="off" type="text" style="position:relative; text-align:center; width:100px; color:black; margin-left:10%;">
                            <input class="inputCRM" id="idstudentforsearch" placeholder="Student ID" title="Введите ID ученика, чтобы отфильтровать поиск" autocomplete="off" type="text" style="position:relative; text-align:center; width:100px; color:black; margin-left:10px;">
                            <button class="btnCRM" title="Запускает процесс поиска информации по статусам урока (отменен, перенесен, удален)" id="startlookstatus" style="float: right; margin-right: 10px;">Получить инфо об уроках</button>
						</div>
				</span>
						<div>
							<p id="statustable" style="margin-top:5px; max-height:400px; overflow:auto; display:none; color:bisque; text-align:center"></p>
						</div>
        </span>
</div>`;

const wintLessonStatus = createWindowCRM('AF_LessonStatus', 'winTopLessonStatus', 'winLeftLessonStatus', win_LessonStatus);
hideWindowOnDoubleClick('AF_LessonStatus');

document.getElementById('hideMeLessonStatus').onclick = function () { // скрытие окна статус урока
    if (document.getElementById('AF_LessonStatus').style.display == '') {
        document.getElementById('AF_LessonStatus').style.display = 'none'
        document.getElementById('statustable').innerText = "";
    }
}

function setdatesfilds(){
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
    const prevDay = String(prevDate.getDate()).padStart(2, "0");

    // set date values in form inputs
    document.getElementById("dateFromLS").value = `${prevYear}-${prevMonth}-${prevDay}`;
    document.getElementById("dateToLS").value = `${curYear}-${curMonth}-${curDay}`;

    document.getElementById('statustable').innerText = "";
    document.getElementById('idteacherforsearch').value = "";
    document.getElementById('idstudentforsearch').value = "";
}

document.getElementById('clearlessonstatus').onclick = function () { // очистить поля проверки статуса урока
    if (!confirm("Are you sure you want to clear?")) {
        return;
    }
    setdatesfilds();
};
	
document.getElementById('butLessonInfoCRM').onclick = function () {
    setdatesfilds();

    if (document.getElementById('AF_LessonStatus').style.display == '') {
        document.getElementById('AF_LessonStatus').style.display = 'none'
        document.getElementById('idmymenucrm').style.display = 'none'
    } else {
        document.getElementById('AF_LessonStatus').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'
    }
}	

//Функция проверки статусов урока

document.getElementById('startlookstatus').onclick = function () { //Функция проверки статусов урока
    if (document.getElementById('idteacherforsearch').value != "") {
        document.querySelector('#statustable').style.display = "";
        document.querySelector('#statustable').innerText = "Загрузка. Если информация не появилась нажмите повторно на кнопку получить инфа";
        let ticherid = document.getElementById('idteacherforsearch').value.trim();
        let startdate = document.querySelector('#dateFromLS').value;
        startdate = startdate.split('-');
        startdate = `${startdate[2]}-${startdate[1]}-${startdate[0]} 21`;
        let enddate = document.querySelector('#dateToLS').value;
        enddate = enddate.split('-');
        enddate = `${enddate[2]}-${enddate[1]}-${enddate[0]} 21`;

        const fetchURL = 'https://timetable.skyeng.ru/api/teachers/search';
        const requestOptions = {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: `from=${startdate}:00:00&to=${enddate}:00:00&offset=0&filters[teacherIds][]=${ticherid}&callback=getJSONP`,
			credentials: "include"
		};

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (lessonsresponse) {
            if (lessonsresponse.success) {
                const lessonsarray = JSON.parse(lessonsresponse.fetchansver);
                if (lessonsarray[0].result[0].classes) {
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
    
                    for (let i = 0; i < lessonsarray[0].result[0].classes.length; i++) {
                        let studentId = lessonsarray[0].result[0].classes[i].studentId;
                        if (document.getElementById('idstudentforsearch').value.trim().length != 0 && studentId && studentId == document.getElementById('idstudentforsearch').value.trim()) {
                            let row = document.createElement('tr');
                            row.classList = "rowOfLessonStatus"
                            let cell;
    
                            cell = document.createElement('td');
                            cell.textContent = studentId;
                            cell.style = "border: 1px solid black; font-size:12px;"
                            cell.setAttribute('name', 'idToCRM')
                            row.appendChild(cell);
    
                            let startAt = lessonsarray[0].result[0].classes[i].startAt;
                            cell = document.createElement('td');
                            cell.textContent = startAt ? new Date(startAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }).slice(0, 17) : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);
    
                            let classStatus = lessonsarray[0].result[0].classes[i].classStatus;
                            cell = document.createElement('td');
                            cell.textContent = classStatus ? classStatus.status : "";
                            if (classStatus) {
                                classStatus.status == "success" ? cell.style = "border: 1px solid black; font-size:12px; color:#50e850; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);" : cell.style = "border: 1px solid black; font-size:12px; color:tomato; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);"
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
    
                            let type = lessonsarray[0].result[0].classes[i].type;
                            cell = document.createElement('td');
                            cell.textContent = type || "";
                            cell.style = "border: 1px solid black; font-size:10px;"
                            row.appendChild(cell);
    
                            cell = document.createElement('td');
                            cell.textContent = classStatus ? classStatus.comment : "";
                            cell.style = "border: 1px solid black; font-size:10px;"
                            row.appendChild(cell);
    
                            let removedAt = lessonsarray[0].result[0].classes[i].removedAt;
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
    
                            let startAt = lessonsarray[0].result[0].classes[i].startAt;
                            cell = document.createElement('td');
                            cell.textContent = startAt ? new Date(startAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }).slice(0, 17) : "";
                            cell.style = "border: 1px solid black; font-size:12px;"
                            row.appendChild(cell);
    
                            let classStatus = lessonsarray[0].result[0].classes[i].classStatus;
                            cell = document.createElement('td');
                            cell.textContent = classStatus ? classStatus.status : "";
                            if (classStatus) {
                                classStatus.status == "success" ? cell.style = "border: 1px solid black; font-size:12px; color:#50e850; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);" : cell.style = "border: 1px solid black; font-size:12px; color:tomato; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);"
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
    
                            let type = lessonsarray[0].result[0].classes[i].type;
                            cell = document.createElement('td');
                            cell.textContent = type || "";
                            cell.style = "border: 1px solid black; font-size:10px;"
                            row.appendChild(cell);
    
                            cell = document.createElement('td');
                            cell.textContent = classStatus ? classStatus.comment : "";
                            cell.style = "border: 1px solid black; font-size:10px;"
                            row.appendChild(cell);
    
                            let removedAt = lessonsarray[0].result[0].classes[i].removedAt;
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
                    alert("Уроков нет");
                }
            } else {
                alert('Не удалось получить уроки: ' + lessonsresponse.error);
            }
        });

    } else {
        alert("Введите ID учителя в поле");
    }
}