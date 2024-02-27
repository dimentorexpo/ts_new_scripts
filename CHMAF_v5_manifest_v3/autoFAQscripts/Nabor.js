var win_NaborStatus =  // описание элементов окна статуса уроков
    `<div class="maindivst" style="display: flex; width: 700px;">
        <span style="width: 700px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 700px;" id="naborData">
                                <button class="mainButton buttonHide" id="hideNaborStatus">hide</button>
                                <button class="mainButton" id="openTrmTeacher" title="Очищает поля с результатами и полем для ввода">🧑‍🏫 TRM</button>
                        </div>
                        <div style="margin: 5px; width: 700px" id="databoNabor">
                            <input id="tidNabor" placeholder="Teacher ID" title="Введите ID учителя, чтобы проверить информацию по статусу набора" autocomplete="off" type="text" style="position:relative; text-align:center; width:100px; color:black; margin-left:40%; font-size:14px; min-height:25px">
                            <button class="mainButton" title="Запускает процесс поиска информации по статусам набора" id="getNaborInfo">🔍</button>
						</div>
				</span>
						<div>
							<p id="naborStatusTable" style="margin-top:5px; max-height:400px; overflow:auto; display:none; color:bisque; text-align:center"></p>
						</div>
        </span>
</div>`;

const wintNaborStatus = createWindow('AF_NaborStatus', 'winTopNaborStatus', 'winLeftNaborStatus', win_NaborStatus);
hideWindowOnDoubleClick('AF_NaborStatus');

let btnTNabor = document.getElementById('butTeacherNabor');
btnTNabor.addEventListener('click', function () {

    if (document.getElementById('AF_NaborStatus').style.display == '') {
        document.getElementById('AF_NaborStatus').style.display = 'none'
    } else {
        document.getElementById('AF_NaborStatus').style.display = ''
		let valNabor = document.getElementById('tidNabor')
		let useriddata = document.getElementById('idstudent').value.trim();
		valNabor.value = useriddata
		getNaborStatus()
    }
})	

let hideStatBtn = document.getElementById('hideNaborStatus')
hideStatBtn.addEventListener('click', function(){
	document.getElementById('AF_NaborStatus').style.display = 'none'
	btnTNabor.classList.remove('activeScriptBtn')
	let btnLinkToStatusTable = document.getElementById('naborStatusTable')
	btnLinkToStatusTable.innerHTML = ""
	
})

let usrHashArr = []
let usrHashTmp;
function getNaborStatus() {
	usrHashArr = []
	usrHashTmp = ''
	let tIdValue = document.getElementById('tidNabor').value.trim()
	if (tIdValue.length<3) {
		alert("Введите корректный ID П")
	} else {
		
		document.querySelector('#naborStatusTable').style.display = "";
        document.querySelector('#naborStatusTable').innerText = "Загрузка. Если информация не появилась нажмите повторно на кнопку получить инфа";
		
		
		const fetchURL = 'https://trm-api.skyeng.ru/api/v1/actionLog/getTeacherChangelog';
        const requestOptions = {
			method: "POST",
			headers: {
				"content-type": "application/json; charset=UTF-8"
			},
			body: `{\"teacherId\":${tIdValue},\"property\":\"_common.isScheduleClosedByTeacher\",\"until\":null,\"lastPreviousRecordId\":null}`,
			credentials: "include"
		};
		
		
		chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (NabStatusResponse) {
			if (NabStatusResponse.success) {
				const nabStatArr = JSON.parse(NabStatusResponse.fetchansver);
				if (nabStatArr.data) {
				let formattedNabStatArr = nabStatArr.data.changelog;
				console.log(nabStatArr)
				
				    const table = document.createElement('table');
                    table.style.width = '99.4%';
                    table.style.color = 'bisque';
                    table.style.fontWeight = '500';
                    table.style.backgroundColor = '#464451';
                    table.style.borderStyle = 'double';
                    table.style.fontSize = '13px';
					
					const headers = ["Новое значение", "Событие", "Дата изменения", "Пользователь"];
                    let headerRow = document.createElement('tr');
                    headers.forEach(header => {
                        let th = document.createElement('th');
                        th.textContent = header;
                        th.style = 'text-align:center; font-weight:500; background:dimgrey; border:1px solid black; padding:5px; position: sticky; top: 0;'
                        headerRow.appendChild(th);
                    });
                    table.appendChild(headerRow);
					
					for (let i=0; i<formattedNabStatArr.length; i++) {
						let row = document.createElement('tr');
						let cell;
						
						cell = document.createElement('td');
						cell.textContent = formattedNabStatArr[i].valueAfter == true ? "✅" : "❌" ;
						cell.style = "border: 1px solid black; font-size:16px;"
						row.appendChild(cell);
						
						cell = document.createElement('td');
						cell.textContent = formattedNabStatArr[i].context
						cell.style = "border: 1px solid black; font-size:12px;"
						row.appendChild(cell);
												
						cell = document.createElement('td');
						let date = new Date(formattedNabStatArr[i].createdAt); // Создать объект Date из строки
						date = new Date(date.getTime() + 10800000); // Добавить разницу между UTC и МСК
						let day = date.getUTCDate().toString().padStart(2, '0'); // Получить день в UTC и преобразовать в строку с ведущим нулем
						let month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Получить месяц в UTC, прибавить 1 и преобразовать в строку с ведущим нулем
						let year = date.getUTCFullYear().toString(); // Получить год в UTC и преобразовать в строку
						let hour = date.getUTCHours().toString().padStart(2, '0'); // Получить час в UTC и преобразовать в строку с ведущим нулем
						let minute = date.getUTCMinutes().toString().padStart(2, '0'); // Получить минуту в UTC и преобразовать в строку с ведущим нулем
						let formattedDate = `${day}.${month}.${year}, ${hour}:${minute}`; // Соединить строки с разделителями
						cell.textContent = formattedDate; // Присвоить значение ячейке
						cell.style = "border: 1px solid black; font-size:12px;"
						row.appendChild(cell);
						
						// Start
							const fetchURL = 'https://teachers-conductor.skyeng.ru/api/v1/getIdUsersData';
							const requestOptions = {
								method: "POST",
								headers: {
									"content-type": "application/json; charset=UTF-8"
								},
								body: `{\"hashes\":[\"${formattedNabStatArr[i].hash}"]}`,
								credentials: "include"
							};
							
							
							chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (decodeHashResponse) {
								if (decodeHashResponse.success) {
									const decodedPerson = JSON.parse(decodeHashResponse.fetchansver);
									cell = document.createElement('td');
									cell.textContent = decodedPerson.data[0].data.firstName + " " + decodedPerson.data[0].data.lastName
									cell.style = "border: 1px solid black; font-size:12px;"
									row.appendChild(cell);
								} else {
									alert("Something went wrong")
								}
							})
						
						//End
												
						table.appendChild(row);
					}
					
					document.getElementById('naborStatusTable').innerHTML = '';
                    document.getElementById('naborStatusTable').appendChild(table);
				} else {
					alert("Teacher not found or used student ID")
				}

					
			} else {
				alert("Не удалось получить статусы набора: " + NabStatusResponse.error)
			}
		})
	}
}

let getNabStatBtn = document.getElementById('getNaborInfo')
getNabStatBtn.addEventListener('click', getNaborStatus)

let oTrmBtn = document.getElementById('openTrmTeacher')
oTrmBtn.addEventListener('click',function() {
	let tIdValue = document.getElementById('tidNabor').value.trim()
	if (tIdValue.length<3) {
		alert("Введите корректный ID П в поле ниже")
	} else {
			window.open("https://trm.skyeng.ru/teacher/" + tIdValue)
	}
	
})