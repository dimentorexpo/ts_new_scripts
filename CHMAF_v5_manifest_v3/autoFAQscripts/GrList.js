var win_GrList =  // описание элементов окна Списка группы
    `<div style="display: flex; width: 450px;">
        <span style="width: 450px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 400;" id="grlistdata">
                                <button class="mainButton buttonHide" id="hideList">hide</button>
                        </div>
						<div>
                        <input id="idgrouptolist" class="${exttheme}" placeholder="ID группы" title="Введите ID группы для получения списка учеников" autocomplete="off" type="text" style="text-align: center; width: 80px; margin-left:5px; position:relative; left:30%;">
							<button class="mainButton" title="Запуск получения списка учеников группы" id="getidgrouptolist" style="position:relative; left:30%;">Get info</button>
						</div>
				</span>
						<div id="grlstdiv">
							 <br>
							 <p id="grlistinfo" style="margin-left: 5px; color:bisque;  max-height: 600px; overflow-y: auto;"></span>
							 <br>
						</div>
        </span>
</div>`;

const wintGrList = createWindow('AF_GrList', 'winTopGrList', 'winTopGrList', win_GrList);
hideWindowOnDoubleClick('AF_GrList');

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

    // Первый запрос: получение списка учеников группы
    const fetchURL = `https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${tempgrid}`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
        if (!response.success) {
            alert('Не удалось получить список группы: ' + response.error);
            return;
        }
        const groupData = JSON.parse(response.fetchansver);
        userIdsarray = [];
        for (let i = 0; i < groupData.data.students.length; i++) {
            dataarr += [i + 1] + "." + '<span class="grstdcrm" style="cursor:pointer" title="открывает профиль в CRM">ℹID У:</span>' + groupData.data.students[i].userId + " ID услуги: " + groupData.data.students[i].educationServiceId + " " + '<span class="stname"></span>' + '<br>';
            userIdsarray.push(groupData.data.students[i].userId);
        }

        // Второй запрос: получение имен учеников группы
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
            if (!response.success) {
                console.log('Не удалось получить имена учеников: ', response.error);
                return;
            }

            const namesData = JSON.parse(response.fetchansver);
            let allStudents = document.getElementsByClassName('stname');
            for (let i = 0; i < allStudents.length; i++) {
                // Проверяем, что last name существует и не пустое
                const lastName = namesData.data[i].name.last;
                const fullName = lastName ? namesData.data[i].name.first + " " + lastName : namesData.data[i].name.first;

                allStudents[i].textContent = fullName;
            }

        });

        document.getElementById('grlistinfo').innerHTML = !groupData.teachers ? dataarr : dataarr + '<br>ID П ' + groupData.teachers[0].userId;

        let grstdcrmarr = document.querySelectorAll('.grstdcrm');
        for (let f = 0; f < grstdcrmarr.length; f++) {
            grstdcrmarr[f].addEventListener('click', function () {
                window.open("https://crm2.skyeng.ru/persons/" + groupData.data.students[f].userId);
            });
        }

        dataarr = '';
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