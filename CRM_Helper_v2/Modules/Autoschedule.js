let configsObj = null; // FIX: инициализируем null, чтобы можно было безопасно проверять перед использованием
var win_Autoschedule =  // описание элементов окна статуса уроков
    `<div class="maindivst" style="display: flex; width: 700px;">
        <span style="width: 1060px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 700px;">
                                <button class="buttonHide" id="hideMeAutoSchedule">hide</button>
                                <button class="btnCRM btnCRMsmall" id="clearAutoSchedule" title="Очищает поля с результатами и полем для ввода">🧹</button>
                        </div>
                        <div style="margin: 5px; width: 700px">
                            <input class="inputCRM" id="studentAPSearch" placeholder="Student ID" title="Введите ID ученика, чтобы отфильтровать поиск" autocomplete="off" type="text" style="position:relative; text-align:center; width:200px; color:black; margin-left:30%;">
                            <button class="btnCRM" title="Запускает процесс поиска информации по статусам урока (отменен, перенесен, удален)" id="startlookAPstatus" style="float: right; margin-right: 10%;">Узнатть статус АП</button>
						</div>
				</span>
						<div>
							<p id="aptabledata" style="margin-top:5px; max-height:400px; overflow:auto; display:none; color:bisque; text-align:center"></p>
						</div>
        </span>
</div>`;

const wintAutoSchedule = createWindowCRM('AF_Autoschedule', 'winTopAutoSchedule', 'winLeftAutoSchedule', win_Autoschedule);
hideWindowOnDoubleClick('AF_Autoschedule');

document.getElementById('hideMeAutoSchedule').onclick = function () { // скрытие окна статус урока
    document.getElementById('AF_Autoschedule').style.display = 'none'
    document.querySelector('#aptabledata').innerText = "";
    document.querySelector('#studentAPSearch').value = "";
}

document.getElementById('clearAutoSchedule').onclick = function () { // скрытие окна статус урока
    document.querySelector('#aptabledata').innerText = "";
    document.querySelector('#studentAPSearch').value = "";
}

document.getElementById('butAutoschedule').onclick = function () {
    if (document.getElementById('AF_Autoschedule').style.display == '') {
        document.getElementById('AF_Autoschedule').style.display = 'none'
        document.getElementById('idmymenucrm').style.display = 'none'
    } else {
        document.getElementById('AF_Autoschedule').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'
		configsObj = ''
		
		const fetchURL = `https://backend.skyeng.ru/api/products/configurations/`;
        const requestOptions = {
            method: 'GET'
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            } else {
                const otvetConfigs = JSON.parse(response.fetchansver);
                configsObj = new Map(otvetConfigs.data.map(d => [d.serviceTypeKey, d.shortTitle]));
                console.log(configsObj)
            }
        })
    }
}

function parseSrvAndAP() {

    const studid = document.getElementById('studentAPSearch').value.trim()
    let massivOfSrvIDs = []
    if (studid.length < 3) {
        alert("ID не введен или меньше трех символов. Пожалуйста, введите корректный ID и повторите попытку!")
    } else {
        const fetchURL = `https://backend.skyeng.ru/api/students/${studid}/education-services/`;
        const requestOptions = {
            method: 'GET'
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            } else {
                document.querySelector('#aptabledata').style.display = "";
                document.querySelector('#aptabledata').innerText = "Загрузка. Если информация не появилась нажмите повторно на кнопку получить инфа";
                const otvetServices = JSON.parse(response.fetchansver);
                console.log(otvetServices)
                if (otvetServices.data.length != 0) {
                    checkAPAvailability(otvetServices.data)
                } else {
                    document.querySelector('#aptabledata').innerText = "Услуги отсутствуют или не прошли фильтр";
                }
            }
        })

    }
}

function checkAPAvailability(items) {
    const table = document.createElement('table');
    table.style.width = '99.4%';
    table.style.color = 'bisque';
    table.style.fontWeight = '500';
    table.style.backgroundColor = '#464451';
    table.style.borderStyle = 'double';
    table.style.fontSize = '13px';

    const headers = ["ID услуги", "STK услуги", "Статус АП", "Причина недоступности"];
    let headerRow = document.createElement('tr');
    headers.forEach(header => {
        let th = document.createElement('th');
        th.textContent = header;
        th.style = 'text-align:center; font-weight:700; background:dimgrey; border:1px solid black; padding:5px; position: sticky; top: 0;'
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    if (items) {
        items.forEach(item => {
            if (item.serviceTypeKey !== 'english_adult_self_study' && item.serviceTypeKey !== 'english_adult_not_native_speaker_talks_15min' && item.serviceTypeKey !==  'life_adult') {

                const fetchURL = `https://teachers-schedule.skyeng.ru/api/education-services/${item.id}/auto-schedule/is-available/`;
                const requestOptions = {
                    method: 'GET'
                };

                chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
                    if (!response.success) {
                        alert('Не удалось выполнить запрос: ' + response.error);
                        return;
                    } else {
                        const otvetAPstatus = JSON.parse(response.fetchansver);
                        console.log(otvetAPstatus)

                        let serviceId = item.id;

                        // FIX: раньше при незагруженном configsObj падал TypeError,
                        // теперь просто показываем системный ключ услуги.
                        let STKname = (configsObj && configsObj.has(item.serviceTypeKey))
                            ? configsObj.get(item.serviceTypeKey)
                            : item.serviceTypeKey;
                        let row = document.createElement('tr');
                        row.classList = "rowOfLessonStatus"
                        let cell;

                        cell = document.createElement('td');
                        cell.textContent = serviceId;
                        cell.style = "border: 1px solid black; font-size:12px;"
                        row.appendChild(cell);

                        cell = document.createElement('td');
                        cell.textContent = STKname;
                        cell.style = "border: 1px solid black; font-size:12px;"
                        row.appendChild(cell);

                        let isDostupenAP = otvetAPstatus.data.isAvailable;
                        cell = document.createElement('td');
                        cell.innerHTML = isDostupenAP == true ? `<span style="color:#1de51d; font-weight: 700; font-size: 13px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);">Доступен</span>` : `<span style="color:coral;  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5); font-weight: 700; font-size: 13px;">Недоступен</span>`
                        cell.style = "border: 1px solid black; font-size:12px;"
                        row.appendChild(cell);

                        // FIX: reasons может быть undefined — раньше .length падал.
                        let reasonNedostupen = otvetAPstatus.data?.reasons ?? [];
                        cell = document.createElement('td');
                        cell.textContent = reasonNedostupen.length == 0 ? "➖" : reasonNedostupen
                        cell.style = "border: 1px solid black; font-size:12px;"
                        row.appendChild(cell);
                        table.appendChild(row);
                        document.getElementById('aptabledata').innerHTML = '';
                        document.getElementById('aptabledata').appendChild(table);

                    }
                })
            }
        });
    }
}

let btnStartSearchAP = document.getElementById('startlookAPstatus')
btnStartSearchAP.addEventListener('click', parseSrvAndAP)