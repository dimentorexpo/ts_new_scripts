let flagRemember = '';
var win_Calendar =  // описание формы чтобы не давала чату закрыться
    `<div style="width: 600px;">
        <span style="width: 600px; min-height: 70px; max-height:700px; overflow-y:auto; overflow-x:hidden;">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 600px;" id="stataaf_header">
                                <button class="mainButton buttonHide" title="Скрывает меню" id="hidecalendar">hide</button>
								<button class="mainButton smallbtn" title="Очищает окно календаря" id="clearcalendar">🧹</button>
								<button class="mainButton smallbtn" title="Обновляет информацию о слотах выбранной даты" id="refreshcalendar">♻</button>
								<button class="mainButton smallbtn" title="Открывает сайт datsy.info" id="opendatsy">📅</button>
								<label title="Включение и отключение автоматического обновления информации в слотах с интервалом 30 секунд" class="checkbox-refresh">
									<input id="autorefreshswitcher" type="checkbox" checked="">
										<span class="checkbox-refresh-switch"></span>
								</label>
								<button class="mainButton smallbtn" id="showOperActiveSlots" title="Открывает боковое дополнительное окно, чтобы просмотреть все добавленные за выбранную дату. Если есть знак ⚠ значит в этот день вы точно добавляли календарь и можете нажать кнопку, чтобы узнать на какое время">📑</button>
								<span id="availableActiveSlots" style="display:none; position: absolute; top: -4px; left: 210px;" class="">⚠</span>
			    </span>
                        </div>

						<div style="display: flex; justify-content: center;">
								<button class="mainButton" id="prevDay" style="border-radius: 20px; padding: 5px; padding-top: 6px;">◀</button>
								<input class="${otherinpth}" type="date" id="eventDate" style="width:100px; text-align:center; font-weight: 700; border-radius: 20px;"></input>
								<button class="mainButton" id="nextDay" style="border-radius: 20px; padding: 5px; padding-top: 6px;">▶</button>
								<button class="mainButton" id="nowDay" style="margin-left: 5px; padding: 5px;">Сегодня</button>
								<label style="margin-left: 5px; margin-right: 5px; margin-top: 5px; color: bisque;">Слоты по состоянию на: </label>
								<input class="${otherinpth}" type="text" id="datenowtime" style="text-align:center; border-radius: 20px;" disabled></input>
						</div>

						<div id="outputcalendarfield" style="color:bisque; display:flex; flex-wrap:wrap; justify-content: center; align-items: center; padding-bottom: 5px; margin-top: 5px">
						</div>

						<div id="slotList" style="display:none;">
							<span id="chosenSlot" style="background: chartreuse; padding: 5px; margin-left: 36%; box-shadow: 0px 3px 1px rgb(0 0 0 / 55%); border-radius: 20px; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); font-weight: 700; color: darkblue; font-family: cursive; cursor:pointer;" title="При клике на поле копирует в буфер обмена дату и время"></span>
							<span id="hideSlot" style="font-size: 20px; cursor: pointer; transition:all 0.5s ease;">⤴</span>
							<div id="slotData" style="margin-bottom: 5px; margin-left: 5px;">
							</div>
						</div>

						<div id="operatorActiveSlots" style="display:none; position:absolute; top:-1px; left:599px; background:#464451; width: 362px; height:300px;">
						</div>
        </span>
</div>`;

const wintCalendar = createWindow('AF_Calendar', 'winTopCalendar', 'winLeftCalendar', win_Calendar);
hideWindowOnDoubleClick('AF_Calendar');

function compareTimes(time1, time2) { //функция сравнения времени
    var date1 = new Date("1970-01-01 " + time1);
    var date2 = new Date("1970-01-01 " + time2);
    return date1.getTime() - date2.getTime();
}

let parsedData;
function checkAuth() { //функция проверки авторизации на datsy.info
    const fetchURL = 'https://api.datsy.info/api/auth/check.php';
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetCheckAuth = JSON.parse(response.fetchansver);

            if (otvetCheckAuth['value-status'] == "Не авторизован") {
                alert("Вы не авторизованы на datsy.info Проверьте, пожалуйста, авторизацию и повторите попытку после переоткрытия виджета в расширении или кнопкой обновить ♻, иначе слоты могут не добавляться!")
                window.open("https://datsy.info/")
            } else {
                console.log("Вы авторизованы, смело продолжайте работу с календарем")
                getTimeSlots()
            }
        }
    })
}

function getSlotData(name) {
    let allRows = document.getElementsByName('slotRow')
    allRows[name].classList.toggle('glowing-border-animation')

    let tempVarMatches = [];
    if (document.getElementById('slotList').style.display == "none") {
        document.getElementById('slotList').style.display = ""
    }

    document.getElementById('hideSlot').onclick = function () {
        allRows[name].classList.toggle('glowing-border-animation')
        flagRemember = ''
        document.getElementById('slotList').style.display = "none"
    }

    document.getElementById('chosenSlot').textContent = allRows[name].textContent
    document.getElementById('chosenSlot').onclick = function () {

        let dateString = document.getElementById('chosenSlot').textContent
        // Split the date and time into separate variables
        let parts = dateString.split(" ");
        let time = parts[0];
        let originalDate = parts[1];

        // Create a Date object from the original date string
        let date = new Date(originalDate);

        // Format the date as desired
        let formattedDate = `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()} ${time}`;

        copyToClipboard(formattedDate)


    }

    document.getElementById('slotData').innerHTML = ''
    for (let j = 0; j < parseInt(allRows[name].getAttribute('dlina')); j++) {
        let testd = document.createElement('div')
        testd.style = "margin-top: 5px;"
        testd.innerHTML = `<input class="${exttheme}" name="slotInfo" style="width: 478px;"><button class="mainButton" name="saveToCalend">💾</button><button class="mainButton" name="deleteFromCalend">❌</button>`;
        document.getElementById('slotData').appendChild(testd)
    }

    for (let z = 0; z < arrayOfEvents.length; z++) {
        if (arrayOfEvents[z].slotTime + ' ' + arrayOfEvents[z].slotDate == document.getElementById('chosenSlot').textContent) {
            tempVarMatches.push(arrayOfEvents[z])
        }
    }

    let spisok = document.getElementsByName('slotInfo'); //заполнение строк полей информацией об уже внесенных значениях
    if (tempVarMatches.length != 0) {
        for (n = 0; n < tempVarMatches.length; n++) {
            spisok[n].value = tempVarMatches[n].eventText
            spisok[n].title = tempVarMatches[n].eventId
            spisok[n].setAttribute('createdByOperator', `${tempVarMatches[n].createdBy}`)
            if (spisok[n].getAttribute('createdByOperator') == operNamesAF[0] || spisok[n].getAttribute('createdByOperator') == operNamesAF[1]) {
                spisok[n].classList.remove(exttheme);
                spisok[n].classList.add(selectedinpth);
            }
        }
    }

    for (let b = 0; b < spisok.length; b++) {
        spisok[b].ondblclick = function () {
            if (spisok[b].value != '') {
                const matches = spisok[b].value.match(/(https?:\/\/[^\s]+)/g);
                if (matches && matches.length > 0) {
                    window.open(matches[0]);
                }
            }
        }
    }

    let saveBtns = document.getElementsByName('saveToCalend')
    let deleteBtns = document.getElementsByName('deleteFromCalend')
    let curSlotTime = document.getElementById('chosenSlot').textContent.split(' ')[0]
    let curSlotDate = document.getElementById('chosenSlot').textContent.split(' ')[1]
    for (let v = 0; v < saveBtns.length; v++) {
        saveBtns[v].onclick = function () {
            if (spisok[v].title == '') { // функция добавления нового слота

                const value = spisok[v].value;
                const time = curSlotTime;
                const date = curSlotDate;
                const fetchURL = `https://api.datsy.info/api/slot-event/add.php`;
                const requestOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `addinput=${value}&slotname=${time}&date=${date}`,
                    credentials: "include"
                };

                chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
                    if (!response.success) {
                        alert('Не удалось добавить слот: ' + response.error);
                        return;
                    } else {
                        getTimeSlots()
                    }
                })
            } else if (spisok[v].title != '') { //функция модификации информации в слоте
                const textval = spisok[v].value;
                const value = spisok[v].title
                const fetchURL = `https://api.datsy.info/api/slot-event/save.php`;
                const requestOptions = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `event-text=${textval}&save-slot=${value}`,
                    credentials: "include"
                };

                chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
                    if (!response.success) {
                        alert('Не удалось сохранить слот: ' + response.error);
                        return;
                    } else {
                        getTimeSlots()
                    }
                })
            }
        }
    }

    for (let f = 0; f < deleteBtns.length; f++) {
        deleteBtns[f].onclick = function () { // функция удаления слота из календаря
            if (spisok[f].title != '') {
                let podtvudal = confirm("Вы действительно хотите удалить этот слот из календаря?")
                if (podtvudal) {
					let reasonDescription = encodeURIComponent(prompt("Слот будет удален, укажи причину удаления:"))
						if (reasonDescription){
							removeSlot(slotId = spisok[f].title, reasonDescription)
							spisok[f].title = ''
							spisok[f].value = ''
						}

                }
            }
        }
    }
}

function removeSlot(slotId, reason) {
    const fetchURL = `https://api.datsy.info/api/slot-event/delete.php`;
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `deleteslot=${slotId}&reason=${reason}`,
        credentials: "include"
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // удаление занятого слота
        if (!response.success) {
            alert('Не удалось удалить слот: ' + response.error);
            return;
        } else {
            getTimeSlots()
        }
    })
}

let responseslotsdata;
var arrayOfEvents = [];
var arrayOfMyEvents = [];
let uniqueEvents;
function getTimeSlots() { //функция получения информации по временным слотам

    let eventDate = document.getElementById('eventDate').value;
    let dateCalend = new Date();
    let offsetCalend = 3; // Moscow Timezone Offset in hours
    let utcHoursCalendar = dateCalend.getUTCHours();
    let hoursCalendar = (utcHoursCalendar + offsetCalend) % 24;
    hoursCalendar = hoursCalendar < 10 ? '0' + hoursCalendar : hoursCalendar;
    let minutesCalendar = dateCalend.getMinutes();
    minutesCalendar = minutesCalendar < 10 ? '0' + minutesCalendar : minutesCalendar;
    let currentTimeCalendar = hoursCalendar + ':' + minutesCalendar;
    let currentMonth = dateCalend.getMonth() + 1;
    let formattedMonth = currentMonth < 10 ? '0' + currentMonth : currentMonth;
    let curentDate = dateCalend.getFullYear() + '-' + formattedMonth + '-' + (dateCalend.getDate() < 10 ? "0" + dateCalend.getDate() : dateCalend.getDate());

    let textvar = 0;
    let searchDate = document.getElementById('eventDate').value;

    const fetchURL = `https://api.datsy.info/api/main-events/?date=${searchDate}`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации по слотам
        if (!response.success) {
            alert('Не удалось получить слоты: ' + response.error);
            return;
        } else {
            const otvetDatsySlots = JSON.parse(response.fetchansver);

            arrayOfEvents = [];
            document.getElementById('outputcalendarfield').innerHTML = ''
            arrayOfMyEvents = [];
            uniqueEvents = new Set();
            document.getElementById('datenowtime').value = otvetDatsySlots.nowDateTime;
            const unwantedTimes = [
                "00:00", "00:20", "00:40",
                "01:00", "01:20", "01:40",
                "02:00", "02:20", "02:40",
                "03:00", "03:20", "03:40",
                "04:00", "04:20", "04:40",
                "05:00", "05:20", "05:40",
                "06:00", "06:20", "06:40",
                "07:00", "07:20", "07:40",
                "23:00", "23:20", "23:40"
            ];

            let availableslotsentries = Object.entries(otvetDatsySlots.DataTimeSlot)
            for (let i = 0; i < availableslotsentries.length; i++) {
                if (!unwantedTimes.includes(availableslotsentries[i][0])) {
                    if (availableslotsentries[i][1].EventList.length != 0) {

                        for (let k = 0; k < Object.keys(availableslotsentries[i][1].EventList).length; k++) {
                            const event = Object.values(availableslotsentries[i][1].EventList)[k];

                            if (!uniqueEvents.has(event.id)) {
                                arrayOfEvents.push({
                                    'eventId': event.id,
                                    'eventText': event.text,
                                    'slotTime': event.slot,
                                    'slotDate': event.new_date_slot,
                                    'createdBy': event.created_by_name
                                });

                                uniqueEvents.add(event.id);

                                if (
                                    operNamesAF[0] == event.created_by_name ||
                                    operNamesAF[1] == event.created_by_name
                                ) {
                                    arrayOfMyEvents.push({
                                        'eventId': event.id,
                                        'eventText': event.text,
                                        'slotTime': event.slot,
                                        'slotDate': event.new_date_slot,
                                        'createdBy': event.created_by_name
                                    });
                                }
                            }
                        }
                    } else {
                        for (let k = 0; k < Object.keys(availableslotsentries[i][1].EventList).length; k++) {
                            arrayOfEvents.push({
                                'eventId': null,
                                'eventText': null,
                                'slotTime': null,
                                'slotDate': null,
                                'createdBy': null
                            });
                        }
                    }

                    textvar = '<span style = "background: #2058cb; border-radius:10px; padding-left: 5px; padding-right: 5px;">' + availableslotsentries[i][0] + '</span>' + ' ' + document.getElementById('eventDate').value
                    let tempor = document.createElement('p');
                    document.getElementById('outputcalendarfield').append(tempor);

                    if (availableslotsentries[i][1].CountEvent / availableslotsentries[i][1].CountSlot == 1) {
                        tempor.setAttribute('style', 'width: 32%; cursor:pointer; color: #ececec; font-weight:700; background:rgb(171 65 62); border:1px solid black; font-size:14px; height:25px; margin-bottom:6px; text-align:center; text-shadow:rgb(0 0 0 / 75%) 1px 2px 5px;padding-top:2px; font-family: cursive; margin-right:5px;');
                    } else if (availableslotsentries[i][1].CountEvent / availableslotsentries[i][1].CountSlot == 0) {
                        tempor.setAttribute('style', 'width: 32%; cursor:pointer; color: #ececec; font-weight:700; background:rgb(62 158 83); border:1px solid black; font-size:14px; height:25px; margin-bottom:6px; text-align:center; text-shadow:rgb(0 0 0 / 75%) 1px 2px 5px;padding-top:2px; font-family: cursive; margin-right:5px;');
                    } else if (availableslotsentries[i][1].CountEvent / availableslotsentries[i][1].CountSlot > 0 && availableslotsentries[i][1].CountEvent / availableslotsentries[i][1].CountSlot < 1) {
                        tempor.setAttribute('style', 'width: 32%; cursor:pointer; color: #ececec; font-weight:700; background:rgb(62 158 83); border:1px solid black; font-size:14px; height:25px; margin-bottom:6px; text-align:center; text-shadow:rgb(0 0 0 / 75%) 1px 2px 5px;padding-top:2px; font-family: cursive; margin-right:5px;');
                        tempor.setAttribute('title', '⚠ Есть как занятые так и свободные слоты')
                    } else if (availableslotsentries[i][1].CountEvent == 0 && availableslotsentries[i][1].CountSlot == 0) {
                        tempor.setAttribute('style', 'width: 32%; cursor:pointer; color: #ececec; font-weight:700; background:rgb(171 65 62); border:1px solid black; font-size:14px; height:25px; margin-bottom:6px; text-align:center; text-shadow:rgb(0 0 0 / 75%) 1px 2px 5px;padding-top:2px; font-family: cursive; margin-right:5px;');
                        tempor.setAttribute('title', '🚫 Свободных слотов изначально и не было')
                    } else if (availableslotsentries[i][1].AssignSlot == 0 && availableslotsentries[i][1].CountEvent == 0 && availableslotsentries[i][1].CountSlot == availableslotsentries[i][1].FreeSlot) {
                        tempor.setAttribute('style', 'width: 32%; cursor:pointer; color: #ececec; font-weight:700; background:rgb(171 65 62); border:1px solid black; font-size:14px; height:25px; margin-bottom:6px; text-align:center; text-shadow:rgb(0 0 0 / 75%) 1px 2px 5px; padding-top:2px; font-family: cursive; margin-right:5px;');
                    } else if (availableslotsentries[i][1].FreeSlot < 0) {
                        tempor.setAttribute('style', 'width: 32%; cursor:pointer; color: #ececec; font-weight:700; background:rgb(171 65 62); border:1px solid black; font-size:14px; height:25px; margin-bottom:6px; text-align:center; text-shadow:rgb(0 0 0 / 75%) 1px 2px 5px; padding-top:2px; font-family: cursive; margin-right:5px;');
                    }

                    if (eventDate < curentDate || compareTimes(availableslotsentries[i][0], currentTimeCalendar) <= 0 && eventDate == curentDate) {
                        tempor.setAttribute('style', 'width: 32%; cursor:pointer; color: #cbcbcb; font-weight:700; background:rgb(126 113 113); border:1px solid black; font-size:14px; height:25px; margin-bottom:6px; text-align:center; text-shadow:rgb(0 0 0 / 75%) 1px 2px 5px; padding-top:2px; font-family: cursive; margin-right:5px;');
                    }

                    tempor.setAttribute('name', 'slotRow');
                    tempor.setAttribute('dlina', `${availableslotsentries[i][1].CountSlot}`)
                    tempor.innerHTML = textvar;

                }
            }

            let allRows = document.getElementsByName('slotRow')

            if (flagRemember != '') {
                getSlotData(flagRemember)

            }

            for (let i = 0; i < allRows.length; i++) {
                allRows[i].onclick = function () {

                    flagRemember = i;

                    for (let j = 0; j < allRows.length; j++) {
                        allRows[j].classList.remove('glowing-border-animation');
                    }
                    getSlotData(i)

                }
            }
            refreshActiveOperSlots()
        }
    })
}

document.getElementById('eventDate').addEventListener('change', getTimeSlots);

let operNamesAF = []
let refreshintervalset;

function getdatsyCalendarButtonPress() {
    if (document.getElementById('AF_Calendar').style.display == "none") {
        document.getElementById('AF_Calendar').style.display = ""
        document.getElementById('datsyCalendar').classList.add('activeScriptBtn')
        let operNameAF = document.getElementsByClassName('user_menu-dropdown-user_name')[0].textContent.split('-')[1].trim()
        operNamesAF = [operNameAF, operNameAF.split(" ").reverse().join(" ")];
        checkAuth()

        let getcurdate = new Date();
        let year = getcurdate.getFullYear();
        let month = String(getcurdate.getMonth() + 1).padStart(2, "0");
        let day = String(getcurdate.getDate()).padStart(2, "0");
        document.getElementById("eventDate").value = `${year}-${month}-${day}`;

        if (localStorage.getItem('refreshCalend') == '1') {
            document.getElementById('autorefreshswitcher').checked = true;
            if (!refreshintervalset) {
                refreshintervalset = setInterval(() => { getTimeSlots() }, 30000)

            } else {
                clearInterval(refreshintervalset)
                refreshintervalset = null
            }
        } else if (localStorage.getItem('refreshCalend') == '0') {
            document.getElementById('autorefreshswitcher').checked = false
        }

    } else {
        document.getElementById('AF_Calendar').style.display = "none"
        document.getElementById('datsyCalendar').classList.remove('activeScriptBtn')
    }

}

function refreshActiveOperSlots() { // функция обновления инфы в боковом доп окошке по активным слотам на операторе
    document.getElementById('operatorActiveSlots').innerHTML = '';
    if (arrayOfMyEvents.length != 0) {
        document.getElementById('availableActiveSlots').style.display = ''
        // for (let i=0; i <arrayOfMyEvents.length;i++) {
        // document.getElementById('operatorActiveSlots').innerHTML += '<div style="margin-left:5px; margin-top:5px; background: darkgray;">'+ '<span style="background: #2058cb; padding: 6px; margin-top: 5px; padding-bottom: 8px; color: white; font-weight: 700;">' + arrayOfMyEvents[i].slotTime + '</span>' + '<span style="background: darkseagreen; padding: 5px; font-weight: 700;">' + arrayOfMyEvents[i].slotDate + '</span>' + `<input name="slotToDelete" title="${arrayOfMyEvents[i].eventId}" value="${arrayOfMyEvents[i].eventText.match(/\d{4,9}/)[0]}" style="width: 80px; text-align: center;">` +  '<button name="deleMySlot">❌</button>' + `<input value="${arrayOfMyEvents[i].eventText.match(/бронь/g)[0]} == 'бронь' ? <span style="background:green">Бронь</span> : ➰">` + '</div>'
        // }

        for (let i = 0; i < arrayOfMyEvents.length; i++) {
            const slotDate = arrayOfMyEvents[i].slotDate;
            const eventId = arrayOfMyEvents[i].eventId;
            const eventText = arrayOfMyEvents[i].eventText;
            const slotTime = arrayOfMyEvents[i].slotTime;
            const isReserved = eventText.includes('бронь');
            const slotToDelete = eventText.match(/\d{4,9}/)[0];
            const statusLabel = isReserved ? '<span style="background:#ffdb00; padding:5px;" title="слово бронь было найдено в поле с занятым слотом, значит было бронирование">Бронь</span>' : '<span style="background:coral; padding: 5px; padding-right: 15px; padding-left: 15px;" title="слово бронь не встречалось в поле с занятым слотом, значит не бронировался">➰</span>';

            const slotDiv = `
			<div style="margin-left:5px; margin-top:5px; background: darkgray;">
			  <span style="background: #2058cb; padding: 6px; margin-top: 5px; padding-bottom: 8px; color: white; font-weight: 700;">${slotTime}</span>
			  <span style="background: darkseagreen; padding: 5px; font-weight: 700;">${slotDate}</span>
			  <input class="${exttheme}" name="slotToDelete" title="${eventId}" value="${slotToDelete}" style="width: 80px; text-align: center;">
			  <button class="mainButton" name="deleMySlot">❌</button>
			  <span style="width: 90px;">${statusLabel}</span>
			</div>
		  `;

            document.getElementById('operatorActiveSlots').innerHTML += slotDiv;
        }


        let allDelBtns = document.getElementsByName('deleMySlot');
        let allSlotsToDelete = document.getElementsByName('slotToDelete')
        for (let j = 0; j < allDelBtns.length; j++) {
            allDelBtns[j].onclick = function () {
                if (allSlotsToDelete[j].title != '') {
                    let podtvudal = confirm("Вы действительно хотите удалить этот слот из календаря?")
                    if (podtvudal) {
						let reasonDescription = encodeURIComponent(prompt("Слот будет удален, укажи причину удаления:"))
						if (reasonDescription){
							removeSlot(slotId = allSlotsToDelete[j].title, reasonDescription)
						}
                    }
                }
            }
        }
    } else {
        document.getElementById('operatorActiveSlots').innerHTML = '<span style="color:bisque; font-weight:700">В этот день слоты не были заняты!</span>'
        document.getElementById('availableActiveSlots').style.display = 'none'
    }
}

document.getElementById('nextDay').onclick = function () { // обработчик нажатия на кнопку следующего дня
    let dateInput = document.getElementById('eventDate').value;
    let date = new Date(dateInput);
    date.setDate(date.getDate() + 1);
    let newDate = date.toISOString().split('T')[0];
    document.getElementById('eventDate').value = newDate;
    getTimeSlots()
}

document.getElementById('prevDay').onclick = function () { // обработчик нажатия на кнопку предыдущего дня
    let dateInput = document.getElementById('eventDate').value;
    let date = new Date(dateInput);
    date.setDate(date.getDate() - 1);
    let newDate = date.toISOString().split('T')[0];
    document.getElementById('eventDate').value = newDate;
    getTimeSlots()
}

document.getElementById('nowDay').onclick = function () { // обработчик нажатия на кнопку "сегодня"
    let now = new Date();
    let newDate = now.toISOString().split('T')[0];
    document.getElementById('eventDate').value = newDate;
    getTimeSlots()
}

document.getElementsByClassName('checkbox-refresh-switch')[0].onclick = function () {  // функция переключатели автообновления
    if (localStorage.getItem('refreshCalend') != null) {
        if (localStorage.getItem('refreshCalend') == '0') {
            document.getElementById('autorefreshswitcher').checked = false;
            localStorage.setItem('refreshCalend', '1');
            refreshintervalset = setInterval(() => { getTimeSlots() }, 30000)
        } else if (localStorage.getItem('refreshCalend') == '1') {
            document.getElementById('autorefreshswitcher').checked = true;
            localStorage.setItem('refreshCalend', '0');
            clearInterval(refreshintervalset)
            refreshintervalset = null
        }
    } else {
        localStorage.setItem('refreshCalend', '1');
    }
}

document.getElementById('hidecalendar').onclick = function () {
    document.getElementById('AF_Calendar').style.display = "none"
    document.getElementById('datsyCalendar').classList.remove('activeScriptBtn')
}

document.getElementById('clearcalendar').onclick = function () {
    document.getElementById('slotList').style.display = "none"
    document.getElementById('outputcalendarfield').innerHTML = ''
    if (document.getElementsByName('slotRow').length > 0) {
        let elements = document.getElementsByName('slotRow');
        for (let i = elements.length - 1; i >= 0; i--) {
            elements[i].remove();
        }
    }
}

document.getElementById('refreshcalendar').onclick = function () {
    checkAuth()
    refreshActiveOperSlots()
    document.getElementById('slotList').style.display = "none"
}

document.getElementById('opendatsy').onclick = function () {
    window.open("https://datsy.info/")
}

document.getElementById('showOperActiveSlots').onclick = function () {
    if (document.getElementById('operatorActiveSlots').style.display == 'none') {
        document.getElementById('operatorActiveSlots').style.display = ''
        refreshActiveOperSlots()

    } else document.getElementById('operatorActiveSlots').style.display = 'none'
}
