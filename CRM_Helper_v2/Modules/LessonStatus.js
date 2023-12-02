var win_LessonStatus =  // описание элементов окна статуса уроков
    `<div class="maindivst" style="display: flex; width: 550px;">
        <span style="width: 550px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 550px;" id="lessomstatdata">
                                <button class="buttonHide" id="hideMeLessonStatus">hide</button>
                                <button class="btnCRM btnCRMsmall" onclick="setdatesfildsbnt()" title="Очищает поля с результатами и полем для ввода">🧹</button>
                        </div>
						<div style="margin: 5px; width: 550px">
								 <span class="spanCRM" style="color:bisque; float:center; margin-top:5px; margin-left:10px;">Начальная дата<input class="inputCRM" type="date" style="color:black; margin-left:20px; width:125px;" name="StartDataLS" id="dateFromLS"></span>
                                 <input class="inputCRM" id="idteacherforsearch" placeholder="Teacher ID" title="Введите ID учителя, чтобы проверить информацию по урокам" autocomplete="off" type="text" style=" text-align: center; width: 100px; color: black;margin-left:20px"">
                                 <input class="inputCRM" id="idstudentforsearch" placeholder="Student ID" title="Введите ID ученика, чтобы отфильтровать поиск" autocomplete="off" type="text" style="text-align: center; width: 100px; color: black;margin-left:5px"">
                        </div>
						<div style="margin: 5px; width: 550px">
                            <span class="spanCRM" style="color:bisque; float:center; margin-top:5px; margin-left:10px;">Конечная дата<input class="inputCRM" type="date" style="color:black; margin-left:30px; width:125px;" name="EndDataLS" id="dateToLS"</span>
                            <button class="btnCRM" title="Запускает процесс поиска информации по статусам урока (отменен, перенесен, удален)" id="startlookstatus" style="margin-left:40px;">Получить инфо об уроках</button>
						</div>
				</span>
						<div>
							<p id="statustable" style="margin-top:5px; max-height:400px;  overflow:auto; display:none; color:bisque; text-align:center"></p>
						</div>
        </span>
</div>`;

if (localStorage.getItem('winTopLessonStatus') == null) { // начальное положение окна проверки статуса урока удален перенесен и кем
    localStorage.setItem('winTopLessonStatus', '120');
    localStorage.setItem('winLeftLessonStatus', '295');
}

let wintLessonStatus = document.createElement('div'); // создание окна статус урока
document.body.append(wintLessonStatus);
wintLessonStatus.style = 'min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopLessonStatus') + 'px; left: ' + localStorage.getItem('winLeftLessonStatus') + 'px; font-size: 14px; z-index: 20; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintLessonStatus.style.display = 'none';
wintLessonStatus.setAttribute('id', 'AF_LessonStatus');
wintLessonStatus.innerHTML = win_LessonStatus;

var listenerLessonStatus = function (e, a) { // сохранение позиции окна статус урока
    wintLessonStatus.style.left = Number(e.clientX - myX8) + "px";
    wintLessonStatus.style.top = Number(e.clientY - myY8) + "px";
    localStorage.setItem('winTopLessonStatus', String(Number(e.clientY - myY8)));
    localStorage.setItem('winLeftLessonStatus', String(Number(e.clientX - myX8)));
};

wintLessonStatus.onmousedown = function (a) { // изменение позиции окна статус урока
    if (checkelementtype(a)) {
        window.myX8 = a.layerX;
        window.myY8 = a.layerY;
        document.addEventListener('mousemove', listenerLessonStatus);
    }
}
wintLessonStatus.onmouseup = function () { document.removeEventListener('mousemove', listenerLessonStatus); } // прекращение изменения позиции окна


document.getElementById('AF_LessonStatus').ondblclick = function (a) { // скрытие окна статус урока по двойному клику
    if (checkelementtype(a)) { document.getElementById('AF_LessonStatus').style.display = 'none'; }
}

document.getElementById('hideMeLessonStatus').onclick = function () { // скрытие окна статус урока
        if (document.getElementById('AF_LessonStatus').style.display == '') {
            document.getElementById('AF_LessonStatus').style.display = 'none'
            document.getElementById('statustable').innerText = "";
        }
}

function setdatesfilds(){
    let getdateset = new Date()
    let getyearLS = getdateset.getFullYear();
    let getcurmonthLS = (getdateset.getMonth() + 1)
    let todayLS = getdateset.getDate();
    if (getcurmonthLS < 10) {
        getcurmonthLS = "0" + (getdateset.getMonth() + 1)
    } else {
        getcurmonthLS = (getdateset.getMonth() + 1);
    }
    if (getdateset.getDate() < 10) {
        todayLS = "0" + getdateset.getDate();
        document.getElementById('dateFromLS').value = getyearLS + "-" + getcurmonthLS + "-" + "0" + (Number(todayLS) - 1);
        document.getElementById('dateToLS').value = getyearLS + "-" + getcurmonthLS + "-" + todayLS;
    } else {
        todayLS = getdateset.getDate();
        document.getElementById('dateFromLS').value = getyearLS + "-" + getcurmonthLS + "-" + (todayLS - 1);
        document.getElementById('dateToLS').value = getyearLS + "-" + getcurmonthLS + "-" + todayLS;
    }
}

function setdatesfildsbnt(){
    setdatesfilds();

    document.getElementById('statustable').innerText = "";
    document.getElementById('idteacherforsearch').value = "";
    document.getElementById('idstudentforsearch').value = "";
}
	
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
let arregetted;

document.getElementById('startlookstatus').onclick = function () { //Функция проверки статусов урока
    if (document.getElementById('idteacherforsearch').value != "") {
        document.querySelector('#statustable').style.display = "";
        document.querySelector('#statustable').innerText = "Загрузка. Если информация не появилась нажмите повторно на кнопку получить инфа";
        let time_t = new Date();
        let ticherid = document.getElementById('idteacherforsearch').value;
        ticherid = ticherid.trim();
        let startdate = document.querySelector('#dateFromLS').value;
        startdate = startdate.split('-');
        startdate = Number(startdate[2]) + '-' + Number(startdate[1]) + '-' + Number(startdate[0]) + ' ' + 21;
        console.log("start date= " + startdate);
        let enddate = document.querySelector('#dateToLS').value;
        enddate = enddate.split('-');
        enddate = Number(enddate[2]) + '-' + Number(enddate[1]) + '-' + Number(enddate[0]) + ' ' + 21;
        console.log("end date= " + enddate);

        document.getElementById('responseTextarea1').value = `{
		  "headers": {
			"content-type": "application/x-www-form-urlencoded",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin"
		  },
		  "referrer": "https://timetable.skyeng.ru/",
		  "referrerPolicy": "strict-origin-when-cross-origin",
		  "body": "from=${startdate}:00:00&to=${enddate}:00:00&offset=0&filters[teacherIds][]=${ticherid}&callback=getJSONP",
		  "method": "POST",
		  "mode": "cors",
		  "credentials": "include"
		}`
        document.getElementById('responseTextarea2').value = "https://timetable.skyeng.ru/api/teachers/search";
        document.getElementById('responseTextarea3').value = 'getlessonstatusinfos'
        document.getElementById('sendResponse').click()

        document.getElementById("responseTextarea1").addEventListener("DOMSubtreeModified", function () {
            arregetted = document.getElementById('responseTextarea1').getAttribute('getlessonstatusinfos');
            arregetted = JSON.parse(arregetted);
            if (arregetted != null) {
                if (arregetted[0].result[0].classes != null || arregetted[0].result[0].classes !== undefined) {
                    document.querySelector('#statustable').innerText = "";
                    for (let i = 0; i < arregetted[0].result[0].classes.length; i++) {
                        if (arregetted[0].result[0].classes[i].studentId == document.getElementById('idstudentforsearch').value.trim()) {

                            let text = '💠 У: ' + arregetted[0].result[0].classes[i].studentId + ' | 📆 ' + new Date(arregetted[0].result[0].classes[i].startAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }).slice(0, 17)

                            if (arregetted[0].result[0].classes[i].classStatus !== undefined) {
                                arregetted[0].result[0].classes[i].classStatus.createdByUserId == document.getElementById('idteacherforsearch').value ? arregetted[0].result[0].classes[i].classStatus.createdByUserId = arregetted[0].result[0].classes[i].classStatus.createdByUserId + ' (П)👽' : arregetted[0].result[0].classes[i].classStatus.createdByUserId = arregetted[0].result[0].classes[i].classStatus.createdByUserId

                                text = text + ' | услуга: ' + arregetted[0].result[0].classes[i].educationServiceId;
                                text = text + ' | статус: ' + arregetted[0].result[0].classes[i].classStatus.status;
                                text = text + ' | 📅 когда выставлен: ' + new Date(arregetted[0].result[0].classes[i].classStatus.createdAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' });
                                text = text + ' | кем ❓: ' + arregetted[0].result[0].classes[i].classStatus.createdByUserId;
                                text = text + ' | тип: ' + arregetted[0].result[0].classes[i].type;
                                if (arregetted[0].result[0].classes[i].classStatus.comment !== '') {
                                    text = text + ' | комментарий: ' + arregetted[0].result[0].classes[i].classStatus.comment;
                                }
                            } else if (arregetted[0].result[0].classes[i].removedAt) {

                                arregetted[0].result[0].classes[i].createdByUserId == document.getElementById('idteacherforsearch').value ? arregetted[0].result[0].classes[i].createdByUserId = arregetted[0].result[0].classes[i].createdByUserId + ' (П)👽' : arregetted[0].result[0].classes[i].createdByUserId = arregetted[0].result[0].classes[i].createdByUserId

                                arregetted[0].result[0].classes[i].createdByUserId == arregetted[0].result[0].classes[i].studentId ? arregetted[0].result[0].classes[i].createdByUserId = arregetted[0].result[0].classes[i].studentId + ' (У)👨‍🎓' : arregetted[0].result[0].classes[i].createdByUserId = arregetted[0].result[0].classes[i].createdByUserId


                                text = text + ' | ❌ удален (проверить CRM на отпуск или удаление оператором): ' + arregetted[0].result[0].classes[i].createdByUserId
                                text = text + ' | 📅 дата удаления: ' + new Date(arregetted[0].result[0].classes[i].removedAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' });
                            }

                            let tempor = document.createElement('textarea');
                            document.getElementById('statustable').append(tempor);
                            tempor.setAttribute('style', 'width: 98.9%; color: bisque; font-weight:500; background-color:#464451;border-style:double; font-size:13px; height:52px;');
                            tempor.setAttribute('wrap', 'soft');
                            tempor.value = text;
                            //    console.log(text);
                        } else if (document.getElementById('idstudentforsearch').value == "") {
                            let text = '💠 У: ' + arregetted[0].result[0].classes[i].studentId + ' | 📆 ' + new Date(arregetted[0].result[0].classes[i].startAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }).slice(0, 17)

                            if (arregetted[0].result[0].classes[i].classStatus !== undefined) {
                                arregetted[0].result[0].classes[i].classStatus.createdByUserId == document.getElementById('idteacherforsearch').value ? arregetted[0].result[0].classes[i].classStatus.createdByUserId = arregetted[0].result[0].classes[i].classStatus.createdByUserId + ' (П)👽' : arregetted[0].result[0].classes[i].classStatus.createdByUserId = arregetted[0].result[0].classes[i].classStatus.createdByUserId
                                text = text + ' | услуга: ' + arregetted[0].result[0].classes[i].educationServiceId;
                                text = text + ' | статус: ' + arregetted[0].result[0].classes[i].classStatus.status;
                                text = text + ' | 📅 когда выставлен: ' + new Date(arregetted[0].result[0].classes[i].classStatus.createdAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' });
                                text = text + ' | кем ❓: ' + arregetted[0].result[0].classes[i].classStatus.createdByUserId;
                                text = text + ' | тип: ' + arregetted[0].result[0].classes[i].type;
                                if (arregetted[0].result[0].classes[i].classStatus.comment !== '') {
                                    text = text + ' | комментарий: ' + arregetted[0].result[0].classes[i].classStatus.comment;
                                }
                            } else if (arregetted[0].result[0].classes[i].removedAt) {

                                arregetted[0].result[0].classes[i].createdByUserId == document.getElementById('idteacherforsearch').value ? arregetted[0].result[0].classes[i].createdByUserId = arregetted[0].result[0].classes[i].createdByUserId + ' (П)👽' : arregetted[0].result[0].classes[i].createdByUserId = arregetted[0].result[0].classes[i].createdByUserId

                                arregetted[0].result[0].classes[i].createdByUserId == arregetted[0].result[0].classes[i].studentId ? arregetted[0].result[0].classes[i].createdByUserId = arregetted[0].result[0].classes[i].studentId + ' (У)👨‍🎓' : arregetted[0].result[0].classes[i].createdByUserId = arregetted[0].result[0].classes[i].createdByUserId

                                text = text + ' | ❌ удален (проверить CRM на отпуск или удаление оператором): ' + arregetted[0].result[0].classes[i].createdByUserId
                                text = text + ' | 📅 дата удаления: ' + new Date(arregetted[0].result[0].classes[i].removedAt).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' });
                            }

                            let tempor = document.createElement('textarea');
                            document.getElementById('statustable').append(tempor);
                            // tempor.setAttribute('type', 'text');
                            tempor.setAttribute('style', 'width: 98.9%; color: bisque; font-weight:500; background-color:#464451;border-style:double; font-size:13px; height:52px;');
                            tempor.setAttribute('wrap', 'soft');
                            tempor.value = text;
                        }
                    }
                } else {
                    alert("Уроков нет");
                }

                document.getElementById('responseTextarea1').removeAttribute('getlessonstatusinfos');
            }
        })



    } else {
        alert("Введите ID учителя в поле");
    }
}