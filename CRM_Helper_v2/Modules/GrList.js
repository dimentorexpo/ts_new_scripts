/**
 * GrList.js — модуль «Список группы»:
 * по ID группы показывает учеников (ID, услуга, имя) и преподавателя.
 * Клик по ID ученика открывает его профиль в CRM2.
 */

var win_GrList = `<!-- описание элементов окна Списка группы -->
<div style="display: flex; width: 450px;">
    <span style="width: 450px">
        <span style="cursor: -webkit-grab;">
            <div style="margin: 5px; width: 400;" id="grlistdata">
                <button class="buttonHide" id="hideList">hide</button>
            </div>
            <div>
                <input class="inputCRM" id="idgrouptolist" placeholder="ID группы" title="Введите ID группы для получения списка учеников"
                       autocomplete="off" type="text" style="text-align: center; width: 80px; color: black;margin-left:5px; position:relative; left:30%;">
                <button class="btnCRM" title="Запуск получения списка учеников группы" id="getidgrouptolist" style="position:relative; left:30%;">Get info</button>
            </div>
        </span>
        <div id="grlstdiv">
            <br>
            <p id="grlistinfo" style="margin-left: 5px; color:bisque; max-height: 600px; overflow-y: auto;"></p>
            <br>
        </div>
    </span>
</div>`;

// FIX: раньше третьим аргументом дважды передавался 'winTopGrList',
// из-за чего позиция окна по горизонтали не сохранялась.
const wintGrList = createWindowCRM('AF_GrList', 'winTopGrList', 'winLeftGrList', win_GrList);
hideWindowOnDoubleClick('AF_GrList');

document.getElementById('idgrouptolist').addEventListener('input', function (event) {
    onlyNumbers(event.target);
});

/** Показать/скрыть окно списка группы (используется кнопкой из Link.js). */
function getGrListDataButtonPress() {
    if (document.getElementById('AF_GrList').style.display == '') {
        document.getElementById('AF_GrList').style.display = 'none';
    } else {
        document.getElementById('AF_GrList').style.display = '';
    }
}

document.getElementById('getidgrouptolist').addEventListener('click', function () {
    const groupInfoEl = document.getElementById('grlistinfo');
    const groupId = document.getElementById('idgrouptolist').value.trim();

    if (!groupId) {
        alert("Введите ID группы!");
        return;
    }

    groupInfoEl.innerHTML = "Загрузка...";

    // Шаг 1: получаем состав группы (ученики + преподаватель).
    const fetchURL = `https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${groupId}`;
    const requestOptions = { method: 'GET' };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, function (response) {
        if (!response || !response.success) {
            console.error('Ошибка в получении данных', response?.error);
            groupInfoEl.innerHTML = 'Ошибка загрузки данных';
            return;
        }

        let responseData;
        try {
            responseData = JSON.parse(response.fetchansver);
        } catch (e) {
            console.error('Не удалось разобрать ответ:', e);
            groupInfoEl.innerHTML = 'Ошибка загрузки данных';
            return;
        }
        console.log(responseData);

        const students = responseData.data.students ?? [];
        if (students.length === 0) {
            groupInfoEl.innerHTML = 'Ученики в группе не найдены';
            return;
        }

        // Собираем строки списка и параллельно массив ID учеников.
        let rowsHtml = '';
        const userIdsarray = [];
        for (let i = 0; i < students.length; i++) {
            rowsHtml += [i + 1] + "." +
                '<span class="grstdcrm" style="cursor:pointer" title="открывает профиль в CRM">ℹID У:</span>' +
                students[i].userId +
                " ID услуги: " + (students[i].educationServiceId ?? "—") + " " +
                '<span class="stname"></span>' + '<br>';
            userIdsarray.push(students[i].userId);
        }

        // Шаг 2: подтягиваем имена учеников по их ID.
        const userNamesURL = "https://learning-groups-storage-api.skyeng.ru/api/v1/userInfo/findByIds";
        const userNamesRequestOptions = {
            headers: {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/json; charset=UTF-8"
                // sec-fetch-* браузер проставит сам
            },
            referrer: "https://learning-groups-storage.skyeng.ru/",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: JSON.stringify({ ids: userIdsarray }),
            method: "POST",
            mode: "cors",
            credentials: "include"
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: userNamesURL, requestOptions: userNamesRequestOptions }, function (namesResponse) {
            if (!namesResponse || !namesResponse.success) {
                console.error('Ошибка при получении данных пользователей', namesResponse?.error);
                return;
            }

            try {
                const userNamesResponse = JSON.parse(namesResponse.fetchansver);
                console.log(userNamesResponse);

                // Имена подставляются по порядку в span-заглушки.
                const allStudents = document.getElementsByClassName('stname');
                for (let i = 0; i < allStudents.length && i < (userNamesResponse.data?.length ?? 0); i++) {
                    allStudents[i].textContent =
                        userNamesResponse.data[i].name.first + " " + userNamesResponse.data[i].name.last;
                }
            } catch (e) {
                console.error('Не удалось разобрать имена пользователей:', e);
            }
        });

        // Рисуем список; если есть преподаватель — добавляем его ID в конец.
        groupInfoEl.innerHTML = !responseData.data.teachers
            ? rowsHtml
            : rowsHtml + '<br>ID П ' + responseData.data.teachers[0].userId;

        // Клик по «ℹID У:» — открыть профиль ученика в CRM.
        const grstdcrmarr = document.querySelectorAll('.grstdcrm');
        for (let f = 0; f < grstdcrmarr.length; f++) {
            grstdcrmarr[f].addEventListener('click', function () {
                window.open("https://crm2.skyeng.ru/persons/" + students[f].userId);
            });
        }
    });
});
// end of func getidgrouptolist

document.getElementById('hideList').addEventListener('click', function () { // скрытие окна с очисткой полей
    if (document.getElementById('AF_GrList').style.display == '') {
        document.getElementById('AF_GrList').style.display = 'none';
        document.getElementById('grlistinfo').innerText = "";
        document.getElementById('idgrouptolist').value = "";
    }
});
