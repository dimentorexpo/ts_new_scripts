var win_GrList =  // описание элементов окна Списка группы
    `<div style="display: flex; width: 450px;">
        <span style="width: 450px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 400;" id="grlistdata">
                                <button class="mainButton buttonHide" id="hideList">hide</button>
                        </div>
						<div>
                        <input id="idgrouptolist" placeholder="ID группы" title="Введите ID группы для получения списка учеников" autocomplete="off" type="text" style="text-align: center; width: 80px; color: black;margin-left:5px; position:relative; left:30%;">
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
    let tempgrid = document.getElementById('idgrouptolist').value;
    tempgrid = tempgrid.trim();

    chrome.runtime.sendMessage({ action: 'getGroupList', tmp: tempgrid }, function (response) {
        userIdsarray = [];
        for (let i = 0; i < response.data.students.length; i++) {
            dataarr += [i + 1] + "." + '<span class="grstdcrm" style="cursor:pointer" title="открывает профиль в CRM">ℹID У:</span>' + response.data.students[i].userId + " ID услуги: " + response.data.students[i].educationServiceId + " " + '<span class="stname"></span>' + '<br>';
            userIdsarray.push(response.data.students[i].userId)
        }

        chrome.runtime.sendMessage({ action: "getGroupUserNames", userIds: userIdsarray }, function (response) {
            let allStudents = document.getElementsByClassName('stname')
            for (let i = 0; i < allStudents.length; i++) {
                allStudents[i].textContent = response.data[i].name.first + " " + response.data[i].name.last
            }
        });

        document.getElementById('grlistinfo').innerHTML = !response.data.teachers ? dataarr : dataarr + '<br>ID П ' + response.data.teachers[0].userId;

        let grstdcrmarr = document.querySelectorAll('.grstdcrm');
        for (let f = 0; f < grstdcrmarr.length; f++) {
            grstdcrmarr[f].addEventListener('click', function () {
                window.open("https://crm2.skyeng.ru/persons/" + response.data.students[f].userId)
            })
        }

        dataarr = '';
    });
})
// end of func getidgrouptolist

document.getElementById('hideList').addEventListener('click', function () { // скрытие окна Список группы
    if (document.getElementById('AF_GrList').style.display == '') {
        document.getElementById('AF_GrList').style.display = 'none';
        document.getElementById('grlistinfo').innerText = "";
        document.getElementById('idgrouptolist').value = "";
    }
})