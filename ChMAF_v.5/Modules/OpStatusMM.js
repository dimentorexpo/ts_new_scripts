let MMostOperId = localStorage.getItem('matermost_oid'); // id оператора в ММ
let issending = localStorage.getItem('is_sending_MM'); // записываем отправляем сообщения в ММ или нет, чтобы не слетала отправка при обновлении страницы
let setsendinterval; // сохраняем id интервала
let sendinterval; // интервал отправки сообщений получаемый из документа
let channel_id; // id канала куда отправлять
let undistributed; // при каком нераспреде тэгать
let whomtotag; // кого тэгать


let settingsfromdoc;
let settingscontainer;

if(!issending){ // если не записана переменная в локалсторедж, записываем
    issending = 0;
    localStorage.setItem('is_sending_MM', issending);
}

if(!localStorage.getItem('hidestatMM')){ 
    localStorage.setItem('hidestatMM', 0)
}

function getMMostOperId(){ // функция получения id 
    document.getElementById('responseTextarea1').value = `{
        "headers": {
          "accept": "*/*",
          "accept-language": "ru",
          "content-type": "application/json",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrerPolicy": "no-referrer",
        "body": null,
        "method": "GET",
        "mode": "cors",
        "credentials": "include"
      }`;
    document.getElementById('responseTextarea2').value = "https://mattermost.skyeng.tech/api/v4/users/me";
    document.getElementById('responseTextarea3').value = 'postdata';
    document.getElementById('sendResponse').click(); 

    
    document.getElementById('responseTextarea1').addEventListener('DOMSubtreeModified', () => {
        let responseMMoid = document.getElementById('responseTextarea1').getAttribute('postdata');
        let result
        if (responseMMoid) {
            result = JSON.parse(responseMMoid)
            MMostOperId = result.id;
            console.log(MMostOperId);
          document.getElementById('responseTextarea1').removeAttribute('postdata');
        }
    });

    localStorage.setItem('matermost_oid', MMostOperId)
}
    
if (!MMostOperId) {getMMostOperId()} // проверяем есть ли id оператора ММ

async function getsettingsfromdoc() { // получаем из файла настройки отправки
	settingsfromdoc = 'https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec'
	await fetch(settingsfromdoc).then(r => r.json()).then(r => settingsdata = r)
	settingscontainer = settingsdata.result;
    channel_id = settingscontainer[3][1];
    sendinterval = settingscontainer[4][1]*1000;
    undistributed = settingscontainer[5][1];
    whomtotag = settingscontainer[6][1];
    console.log("id канала : " + channel_id) // выводим id канала
    console.log("Интервал : " + sendinterval + " ms") // выводим интервал
    console.log("Нераспред : " + undistributed) // выводим при каком нераспреде тэгать
    console.log("кого тэгать : " + whomtotag) // выводим кого тэгать
}
getsettingsfromdoc()

async function docheckopers() { // функция сбора статистики и отправки сообщения
    let opstats = []
    let moderresult = '';
    let flagtpkc;
    let operonlinecnt = 0;
    let busycnt = 0;
    let pausecnt = 0;
    let chatneraspcountleft = 0;
    let chattpquecountleft = 0;
    let undistributedString = '';
    let operdep = document.getElementsByClassName('user_menu-dropdown-user_name')[0].innerText.split('-')[0]
    if (operdep == 'ТП')
        flagtpkc = 'ТП'
    else if (operdep == 'КЦ')
        flagtpkc = 'КЦ'
    else if (operdep == 'КМ')
        flagtpkc = 'КМ'
    else if (operdep == 'Teachers Care')
        flagtpkc = 'Teachers Care'
    else if (operdep == 'Prem')
        flagtpkc = 'Prem'

    let currdate = getcurrentdate();
    let currtime = getcurrenttime();
    let timetomsg = ` ` + currdate + ` ` + currtime;

await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", {
    "credentials": "include"
}).then(r => r.json()).then(result => {
    opstats.push(...result.onOperator.filter(operator => 
        operator.operator?.status !== "Offline" && 
        flagtpkc === 'ТП' && 
        operator.operator?.fullName.match(/ТП\D/)
    ));
    chattpquecountleft = result.unAssigned.find(unAssigned => 
        unAssigned.kb === 120181
    )?.count ?? chattpquecountleft;
});

if (chattpquecountleft < undistributed){
    undistributedString = `\\\\n\`\`\`Очередь ТП:\`\`\` ${chattpquecountleft}`;
} else {
    undistributedString = `\\\\n\`\`\`Очередь ТП:\`\`\` ${chattpquecountleft} ${whomtotag} :allert:`;
}

    let myString;
if (opstats.length > 0) {
     myString =`| Чатов | Оператор | Статус |\\\\n|:---------:|:----------------------:|:----------:|\\\\n` + opstats.map(obj => `|${obj.aCnt} | ${obj.operator.fullName} | **[${obj.operator.status}]**|`).join('\\\\n') + undistributedString + `\\\\n\`\`\`Статус операторов по состоянию на\`\`\`${timetomsg}`;
} else {
     myString =`На линии никого нет!` + undistributedString + `\\\\n\`\`\`Статус операторов по состоянию на\`\`\`${timetomsg}`;
}
document.getElementById('responseTextarea1').value = `{
    "headers": {
      "accept": "*/*",
      "accept-language": "ru",
      "content-type": "application/json",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest"
    },
    "referrerPolicy": "no-referrer",
    "body": "{\\"message\\":\\"${myString}\\",\\"channel_id\\":\\"${channel_id}\\",\\"user_id\\":\\"${MMostOperId}\\"}",
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  }`;
document.getElementById('responseTextarea2').value = "https://mattermost.skyeng.tech/api/v4/posts";
document.getElementById('responseTextarea3').value = '';
document.getElementById('sendResponse').click(); 
}

function CheckComponentOfDate(dateComponent) { // функция добавляет 0 к компоненту даты
    return dateComponent < 10 ? '0' + dateComponent : dateComponent;
  }

function getcurrenttime(){  // получение текущего времени
    let ctime = new Date();
    let chour = CheckComponentOfDate(ctime.getHours());
    let cminute = CheckComponentOfDate(ctime.getMinutes());
    let csecond = CheckComponentOfDate(ctime.getSeconds());
    let time = `${chour} : ${cminute} : ${csecond}`;

    return time;
}

function getcurrentdate(){ //получение текущей даты
    let cdate = new Date();
    let cyear = cdate.getFullYear();
    let cmonth = CheckComponentOfDate(cdate.getMonth() + 1);
    let cday = CheckComponentOfDate(cdate.getDate());
    let today = `${cday}.${cmonth}.${cyear}`;

    return today;
}

function startstatsending(){ // запуск отправки статистики
    StatistikToMM.classList.remove('rightPanelBtn');
    StatistikToMM.classList.add('statMMactive');
    docheckopers();
    setsendinterval = setInterval(docheckopers, sendinterval);
    console.log("Запущена отправка статистики");
}

function stopstatsending(){ // Остановка отправки статистики
    StatistikToMM.classList.remove('statMMactive');
    StatistikToMM.classList.add('rightPanelBtn');
    clearInterval(setsendinterval);
    console.log("Остановлена отправка статистики")
}

let StatistikToMM = document.createElement('button')
StatistikToMM.innerHTML = '📕';
StatistikToMM.id = 'StatMM';
StatistikToMM.title = 'Запуск и остановка отправки статистики в Mattermost';
StatistikToMM.classList.add('rightPanelBtn')
document.getElementById('rightPanel').appendChild(StatistikToMM)

StatistikToMM.addEventListener("click", (event) => { //
    if(issending == 0){
        let answersend = confirm("Запустить отправку статистики в Mattermost?")
        if(answersend){
            issending = 1;
            localStorage.setItem('is_sending_MM', issending);
            startstatsending()
        }
    } else if(issending == 1){
        let answersend = confirm("Прекратить отправку статистики в Mattermost?")
        if(answersend){
            issending = 0;
            localStorage.setItem('is_sending_MM', issending);
            stopstatsending()
        }
    }
});

setDisplayStyle(StatistikToMM, localStorage.getItem('hidestatMM') === '0' ? 'none' : '');

StatistikToMM.addEventListener("contextmenu", (event) => { // 
    event.preventDefault();
    if (issending == 1) {
        alert("Нельзя обновить настройки отправки статистики пока запущена отправка")
    } else {
        getMMostOperId()
        getsettingsfromdoc()
        alert('Настройки отправки статистики обновлены')
        console.log("ID оператора и настройки из дока обновлены")
    }
});

function firstloadstatmodule() {
    if(issending == 1){ // Если обновили страницу, автоматим запустим
        let checkforload = setInterval(() => {
            if(document.getElementById('idforpeopstatus')){
                setTimeout(() => {
                    startstatsending()
                }, 2000);
                clearInterval(checkforload);
            }
        }, 1000);
    }
}
if(window.location.href.indexOf('skyeng.autofaq.ai/tickets/assigned') !== -1 || window.location.href.indexOf('skyeng.autofaq.ai/tickets/common') !== -1) {
    firstloadstatmodule()
} else if (window.location.href.indexOf('skyeng.autofaq.ai') !==-1 && issending == 1) {
    StatistikToMM.classList.remove('rightPanelBtn');
    StatistikToMM.classList.add('statMMactive');
}