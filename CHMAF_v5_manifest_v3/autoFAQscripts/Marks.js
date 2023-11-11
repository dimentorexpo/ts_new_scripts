var win_Marks =  // описание элементов окна оценок от пользователя
    `<div style="display: flex; width: 320px;">
    <span style="width: 320px">
            <span style="cursor: -webkit-grab;">
                    <div style="margin: 5px; width: 320px;" id="marks_header">
                            <button class="mainButton" title="скрывает меню" id="hideMeMarks" style="width:50px; background: #228B22;">hide</button>
                            <button class="mainButton" id="marksinstr" style="float: right; margin-right: 10px;" title="Инструкция по этой форме">❓</button>
                    </div>
                    <div>
                        <span style="color:bisque; float:center; margin-top:5px; margin-left:10px;">От </span>
                        <input type="date" style="color:black; margin-left:5px;  width:115px; text-align:center;" name="StartDataMarks" id="dateFromMarks">
                        <span style="color:bisque; margin-top:5px; margin-left:10px; height:28px;">До </span>
                        <input type="date" style="color:black; margin-left:5px; margin-right:10px; width:115px; text-align:center;" name="EndDataMarks" id="dateToMarks">
                    </div>
                    <div>
                        <input id="useridsearch" placeholder="ID У/П для 🔎статистики оценок" title="Ввведите ID ученика или учителя для получения информации с начала года по выставляемым оценкам" autocomplete="off" type="text" style="text-align: center; width: 230px; color: black;margin-left:5px">
                        <button class="mainButton" id="findmarksstat">🔎</button>
                        <button class="mainButton" id="clearmarksstat">🧹</button>
                    </div>
            </span>
                    <div style="margin: 5px; width: 300px" id="marks_box">
                            <p id="markstable" style="max-height:400px; margin-left:5px; font-size:16px; color:bisque; overflow:auto;"></p>
                    </div>
    </span>
</div>`;

if (localStorage.getItem('winTopMarks') == null) { //начальное положение окна оценко
    localStorage.setItem('winTopMarks', '120');
    localStorage.setItem('winLeftMarks', '295');
}

let wintMarks = document.createElement('div'); // создание окна поиска оценок от пользователя
document.body.append(wintMarks);
wintMarks.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopMarks') + 'px; left: ' + localStorage.getItem('winLeftMarks') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintMarks.style.display = 'none';
wintMarks.setAttribute('id', 'AF_Marks');
wintMarks.innerHTML = win_Marks;

wintMarks.onmousedown = function (event) {
    if (checkelementtype(event)) {
        let startX = event.clientX;
        let startY = event.clientY;
        let elemLeft = wintMarks.offsetLeft;
        let elemTop = wintMarks.offsetTop;

        function onMouseMove(event) {
            let deltaX = event.clientX - startX;
            let deltaY = event.clientY - startY;

            wintMarks.style.left = (elemLeft + deltaX) + "px";
            wintMarks.style.top = (elemTop + deltaY) + "px";

            localStorage.setItem('winTopMarks', String(elemTop + deltaY));
            localStorage.setItem('winLeftMarks', String(elemLeft + deltaX));
        }

        document.addEventListener('mousemove', onMouseMove);

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mouseup', onMouseUp);
    }
};
// прекращение изменения позиции окна поиска оценок от пользователя

function getDate() {

    let getdateset = new Date();
    let getyearLS = getdateset.getFullYear();
    let getcurmonthLS = (getdateset.getMonth() + 1);
    let todayLS = getdateset.getDate();

    if (getcurmonthLS < 10) {
        getcurmonthLS = "0" + (getdateset.getMonth() + 1);
    } else {
        getcurmonthLS = (getdateset.getMonth() + 1);
    }

    if (getdateset.getDate() < 10 && getcurmonthLS <= 10) {
        todayLS = "0" + getdateset.getDate();
        document.getElementById('dateFromMarks').value = getyearLS + "-" + '0' + JSON.stringify(getcurmonthLS - 1) + "-" + "0" + Number(todayLS);
        document.getElementById('dateToMarks').value = getyearLS + "-" + getcurmonthLS + "-" + todayLS;
    } else if (getdateset.getDate() < 10 && getcurmonthLS > 10) {
        todayLS = "0" + getdateset.getDate();
        document.getElementById('dateFromMarks').value = getyearLS + "-" + JSON.stringify(getcurmonthLS - 1) + "-" + "0" + Number(todayLS);
        document.getElementById('dateToMarks').value = getyearLS + "-" + getcurmonthLS + "-" + todayLS;
    } else if ((getdateset.getDate() == 10 && getcurmonthLS > 10) || (getdateset.getDate() > 10 && (getcurmonthLS - 1 == 10))) {
        todayLS = getdateset.getDate();
        document.getElementById('dateFromMarks').value = getyearLS + "-" + JSON.stringify(getcurmonthLS - 1) + "-" + todayLS.toString().padStart(2, '0');
        document.getElementById('dateToMarks').value = getyearLS + "-" + getcurmonthLS + "-" + todayLS.toString().padStart(2, '0');
    } else {
        todayLS = getdateset.getDate();
        let previousDay = todayLS - 1;
        let previousMonth = getcurmonthLS - 1;

        if (previousMonth < 1) {
            previousMonth = 12;
            getyearLS -= 1;
        }

        if (previousMonth === 2 && previousDay > 28) {
            previousDay = 28;
        }

        document.getElementById('dateFromMarks').value = getyearLS + "-" + previousMonth.toString().padStart(2, '0') + "-" + previousDay.toString().padStart(2, '0');
        document.getElementById('dateToMarks').value = getyearLS + "-" + getcurmonthLS.toString().padStart(2, '0') + "-" + todayLS.toString().padStart(2, '0');
    }

}

document.getElementById('AF_Marks').ondblclick = function (a) { // скрытие окна оценок от пользователя по двойному клику
    if (checkelementtype(a)) { document.getElementById('AF_Marks').style.display = 'none'; }
}

document.getElementById('hideMeMarks').onclick = function () { // скрытие окна поиска оценок от пользователя
    if (document.getElementById('AF_Marks').style.display == '')
        document.getElementById('AF_Marks').style.display = 'none'
}

document.getElementById('marksinstr').onclick = function () {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-Score%F0%9F%93%8A%D0%9E%D1%86%D0%B5%D0%BD%D0%BA%D0%B8')
}

document.getElementById('clearmarksstat').onclick = function () { // кнопка очистки поля
    document.getElementById('markstable').innerHTML = "";
    document.getElementById('useridsearch').value = "";
}

async function getUserMarks(option, idfromchat) {
    let tempval;
    if (option == 'menu') {
        tempval = document.getElementById('useridsearch').value.trim();
    } else if (option == 'userdetailsbar') {
        tempval = idfromchat;
    }

    document.getElementById('markstable').innerText = "Загрузка..."

    let from = document.getElementById('dateFromMarks').value
    let to = document.getElementById('dateToMarks').value

    await fetch("https://skyeng.autofaq.ai/api/conversations/history", {
        "headers": {
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin"
        },
        "referrer": "https://skyeng.autofaq.ai/tickets/archive",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{\"serviceId\":\"361c681b-340a-4e47-9342-c7309e27e7b5\",\"mode\":\"Json\",\"channelUserFullTextLike\":\"" + tempval + "\",\"tsFrom\":\"" + from + "T00:00:00.000Z\",\"tsTo\":\"" + to + "T23:59:59.059Z\",\"orderBy\":\"ts\",\"orderDirection\":\"Desc\",\"page\":1,\"limit\":100}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    }).then(r => r.json()).then(r => datamarks = r)

    let count = {};
    let clswoutmark = 0;
    let markscount = 0;
    let flagok = [];
    for (let i = 0; i < datamarks.items.length; i++) {
        if (datamarks.items[i].stats.rate != undefined && datamarks.items[i].stats.rate.rate == undefined)
            clswoutmark++;
        if (datamarks.items[i].stats.rate != undefined && datamarks.items[i].stats.rate.rate != undefined)
            flagok.push(datamarks.items[i].stats.rate.rate)
    }
    flagok.forEach(function (i) { count[i] = (count[i] || 0) + 1; });
    if (count[1] == undefined)
        count[1] = 0;
    if (count[2] == undefined)
        count[2] = 0;
    if (count[3] == undefined)
        count[3] = 0;
    if (count[4] == undefined)
        count[4] = 0;
    if (count[5] == undefined)
        count[5] = 0;
    markscount = (count[1] + count[2] + count[3] + count[4] + count[5]);
    if (datamarks.items == '') {
        document.getElementById('markstable').innerHTML = 'Пользователь не обращался за выбранный период'
    } else {
        document.getElementById('markstable').innerHTML = 'Пользователь 🕵️‍♀️: ' + tempval + '<br>' +
            'Name: ' + datamarks.items[0].channelUser.fullName + '<br>' +
            'Оценка 1 🤬: ' + count[1] + ' ................... ' + ((count[1] / markscount) * 100).toFixed(1) + '%' + '<br>' +
            'Оценка 2 🤢: ' + count[2] + ' ................... ' + ((count[2] / markscount) * 100).toFixed(1) + "%" + '<br>' +
            'Оценка 3 😐: ' + count[3] + ' ................... ' + ((count[3] / markscount) * 100).toFixed(1) + "%" + '<br>' +
            'Оценка 4 🥴: ' + count[4] + ' ................... ' + ((count[4] / markscount) * 100).toFixed(1) + "%" + '<br>' +
            'Оценка 5 😊: ' + count[5] + ' ................... ' + ((count[5] / markscount) * 100).toFixed(1) + '%' + '<br>' +
            'Всего оценок: ' + markscount + '<br>' + `Обращений с ${from}: ` + datamarks.total + '<br>' +
            'Оценки/кол-во обращений: ' + ((markscount / datamarks.total) * 100).toFixed(1) + '%' + '<br>' +
            'Закрыто без оценок: ' + clswoutmark + ' ............. ' + (clswoutmark / datamarks.total * 100).toFixed(1) + '%' + '<br>' +
            'Автозакрытие: ' + (datamarks.total - clswoutmark - markscount) + ' ....................... ' + ((datamarks.total - clswoutmark - markscount) / datamarks.total * 100).toFixed(1) + '%';
    }
}

function getbutMarksButtonPress() { //открыть форму для поиска оценок от пользователя
    if (document.getElementById('AF_Marks').style.display == '') {
        document.getElementById('AF_Marks').style.display = 'none'
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    } else {
        document.getElementById('AF_Marks').style.display = ''
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')

        getDate()
        document.getElementById('findmarksstat').onclick = async function () {
            getUserMarks('menu')
        }
    }
}

async function marksstata(idfromchat) { //проверка статистики оценок от пользователя

    if (document.getElementById('AF_Marks').style.display == 'none') {
        document.getElementById('AF_Marks').style.display = ''
        getDate()
        getUserMarks('userdetailsbar', idfromchat)
    } else {
        getDate()
        getUserMarks('userdetailsbar', idfromchat)
    }
}
