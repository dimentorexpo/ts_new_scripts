var win_GrList =  // описание элементов окна Списка группы
    `<div style="display: flex; width: 450px;">
        <span style="width: 450px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 400;" id="grlistdata">
                                <button class="buttonHide" id="hideList">hide</button>
                        </div>
						<div>
                        <input class="inputCRM" id="idgrouptolist" placeholder="ID группы" title="Введите ID группы для получения списка учеников" autocomplete="off" type="text" style="text-align: center; width: 80px; color: black;margin-left:5px; position:relative; left:30%;">
							<button class="btnCRM" title="Запуск получения списка учеников группы" id="getidgrouptolist" style="position:relative; left:30%;">Get info</button>
						</div>
				</span>
						<div id="grlstdiv">
							 <br>
							 <p id="grlistinfo" style="margin-left: 5px; color:bisque;  max-height: 600px; overflow-y: auto;"></span>
							 <br>
						</div>
        </span>
</div>`;

const wintGrList = createWindowCRM('AF_GrList', 'winTopGrList', 'winTopGrList', win_GrList);
hideWindowOnDoubleClick('AF_GrList');

document.getElementById('idgrouptolist').addEventListener('input', function (event) {
    onlyNumbers(event.target);
});

function getGrListDataButtonPress() {
    if (document.getElementById('AF_GrList').style.display == '') {
        document.getElementById('AF_GrList').style.display = 'none';
    } else {
        document.getElementById('AF_GrList').style.display = '';
    }
}
document.getElementById('getidgrouptolist').addEventListener('click', async function () {
    let dataarr = [];
    let userIdsarray = [];
    document.getElementById('grlistinfo').innerHTML = "Загрузка...";
    let tempgrid = document.getElementById('idgrouptolist').value.trim();

    // Обновление для отправки запроса через 'getFetchRequest'
    const fetchURL = `https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${tempgrid}`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
        if (response && response.success) {
            const responseData = JSON.parse(response.fetchansver);
            console.log(responseData);
            // Обработка полученных данных
            userIdsarray = [];
            for (let i = 0; i < responseData.data.students.length; i++) {
                dataarr += [i + 1] + "." + '<span class="grstdcrm" style="cursor:pointer" title="открывает профиль в CRM">ℹID У:</span>' + responseData.data.students[i].userId + " ID услуги: " + responseData.data.students[i].educationServiceId + " " + '<span class="stname"></span>' + '<br>';
                userIdsarray.push(responseData.data.students[i].userId)
            }

            // Формирование запроса для получения данных пользователей
            const userNamesURL = "https://learning-groups-storage-api.skyeng.ru/api/v1/userInfo/findByIds";
            const userNamesRequestOptions = {
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json; charset=UTF-8",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site"
                },
                referrer: "https://learning-groups-storage.skyeng.ru/",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: JSON.stringify({ ids: userIdsarray }),
                method: "POST",
                mode: "cors",
                credentials: "include"
            };

            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: userNamesURL, requestOptions: userNamesRequestOptions }, function (response) {
                if (response && response.success) {
                    const userNamesResponse = JSON.parse(response.fetchansver);
                    console.log(userNamesResponse);
                    // Обработка данных пользователей
                    let allStudents = document.getElementsByClassName('stname')
                    for (let i = 0; i < allStudents.length; i++) {
                        allStudents[i].textContent = userNamesResponse.data[i].name.first + " " + userNamesResponse.data[i].name.last
                    }
                } else {
                    console.error('Ошибка при получении данных пользователей', response.error);
                }
            });

            document.getElementById('grlistinfo').innerHTML = !responseData.data.teachers ? dataarr : dataarr + '<br>ID П ' + responseData.data.teachers[0].userId;

            let grstdcrmarr = document.querySelectorAll('.grstdcrm');
            for (let f = 0; f < grstdcrmarr.length; f++) {
                grstdcrmarr[f].addEventListener('click', function () {
                    window.open("https://crm2.skyeng.ru/persons/" + responseData.data.students[f].userId)
                })
            }

            dataarr = '';

        } else {
            console.error('Ошибка в получении данных', response.error);
            document.getElementById('grlistinfo').innerHTML = 'Ошибка загрузки данных';
        }
    });
});

// end of func getidgrouptolist

document.getElementById('hideList').addEventListener('click', function () { // скрытие окна Список группы
    if (document.getElementById('AF_GrList').style.display == '') {
        document.getElementById('AF_GrList').style.display = 'none';
        document.getElementById('grlistinfo').innerText = "";
        document.getElementById('idgrouptolist').value = "";
    }
})