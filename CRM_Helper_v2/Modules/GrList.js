/**
 * GrList.js — модуль «Список группы»:
 * по ID группы показывает учеников (ID, услуга, имя) и преподавателя.
 * Клик по ID ученика открывает его профиль в CRM2.
 */

const _gr_close = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const _gr_search = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
const _gr_users = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>';

var win_GrList = `<!-- описание элементов окна Списка группы -->
<div style="display: flex; width: 450px;">
    <span style="width: 450px">
        <span style="cursor: -webkit-grab;">
            <div style="margin: 5px; width: 400; display:flex; align-items:center; gap:4px;" id="grlistdata">
                <button class="buttonHide" id="hideList">${_gr_close} hide</button>
                <span style="margin-left:auto; display:flex; align-items:center; gap:4px;">
                    <span style="color:#c9a84c; font-size:13px;">${_gr_users}</span>
                    <input class="inputCRM" id="idgrouptolist" placeholder="ID группы" title="Введите ID группы"
                           autocomplete="off" type="text" style="text-align: center; width: 100px; color: black; border-radius:6px;">
                    <button class="btnCRM" title="Получить список учеников" id="getidgrouptolist" style="display:flex; align-items:center; gap:4px;">${_gr_search} Get</button>
                </span>
            </div>
        </span>
        <div id="grlstdiv">
            <p id="grlistinfo" style="margin-left: 5px; color:bisque; max-height: 600px; overflow-y: auto;"></p>
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
