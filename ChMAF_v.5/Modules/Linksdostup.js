var win_linksd =  // описание элементов окна доступов
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 409px;" id="linksd_1str">
                            <button title="скрывает меню" id="hideMeLinksd" style="width:50px; background: #228B22;">hide</button>
                        </div>
                        <div style="margin: 5px; margin-top: 0px; width: 409px" id="linksd_kib_box">
                            <p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Kibana</p>
                            <input id="kibsvid" placeholder="ID Summary" title="Вводим id пользователя для открытия Video | Tech Summary" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="kibsvidbut">🔎</button>
                            <input id="kibsvhesh" placeholder="Хэш Summary" title="Вводим Хэш комнаты для открытия Video | Tech Summary" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="kibsvheshbut">🔎</button>
                            <input id="kibservhesh" placeholder="Хэш = сервер" title="Вводим Хэш комнаты для определения сервера" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="kibservheshbut">🔎</button>
                            <input id="kibslow" placeholder="Хэш слоу" title="Вводим Хэш комнаты для проверки слоулинков" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="kibslowbut">🔎</button>
                            <input id="kibheshvid" placeholder="Хэш видео" title="Вводим Хэш комнаты для проверки состояния видео" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="kibheshvidbut">🔎</button>
                            <input id="kibstihesh" placeholder="Хэш стрим" title="Вводим Хэш комнаты для проверки срстояния стрима" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="kibstiheshbut">🔎</button>
                            <p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Redash</p>
                            <input id="mobappid" placeholder="ID mob.app" title="Вводим id пользователя для открытия действий в приложении" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="mobappidbut">🔎</button>
                            <input id="rpayid" placeholder="ID платежи" title="Вводим id пользователя для открытия лога платежей" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="rpayidbut">🔎</button>
 							<input id="UserActions" placeholder="ID У/П действ" title="Вводим id пользователя для открытия информации о действиях в личном кабинете" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="GetUserActions">🔎</button>
							<input id="essayHashRoom" placeholder="Эссе Hash" title="Вводим хеш комнаты с эссе на открывшейся странице не забываем изменить дату" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="getUserEssay">🔎</button>
                            <p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Grafana</p>
                            <input id="WidgetLessonStatus" placeholder="ID У/П виджет" title="Вводим id пользователя для открытия информации об отображении виджета входа на урок" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button id="GetWidgetLessonStatus">🔎</button>
                            <button title="Открывает Графану с состоянием видеосерверов, при наплыве обращений проверяйте его" id="grafanalnk" style="width:130px">Видео сервера</button>
                            <button title="Открывает Графану с отображением пула задачь на группе Техподдержка Исход CRM2" id="grafanapoolCRM2" style="width:130px">Пул исход CRM2</button>
							<p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">KPI Teachers</p>
							<button title="Открывает Datalens для просмотра информации по KPI teachers" id="kpiteachersdashboard" style="width:150px">Datalens Dashboard</button>
                        </div>
                </span>
        </span>
</div>`;

if (localStorage.getItem('winTopLinksd') == null) { // началоное положение окна ссылок с доступами (если не задано ранее)
    localStorage.setItem('winTopLinksd', '120');
    localStorage.setItem('winLeftLinksd', '295');
}

let wintLinksd = document.createElement('div'); // создание окна доступов
document.body.append(wintLinksd);
wintLinksd.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopLinksd') + 'px; left: ' + localStorage.getItem('winLeftLinksd') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintLinksd.style.display = 'none';
wintLinksd.setAttribute('id', 'AF_Linksd');
wintLinksd.innerHTML = win_linksd;

wintLinksd.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintLinksd.offsetLeft;
    let elemTop = wintLinksd.offsetTop;

    function onMouseMove(event) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintLinksd.style.left = (elemLeft + deltaX) + "px";
      wintLinksd.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopLinksd', String(elemTop + deltaY));
      localStorage.setItem('winLeftLinksd', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};
 // прекращение изменения позиции окна доступов

document.getElementById('AF_Linksd').ondblclick = function (a) { // скрытие окна доступов по двойному клику
    if (checkelementtype(a)) { document.getElementById('AF_Linksd').style.display = 'none'; }
}

    document.getElementById('addsrc').onclick = function () { //открывает окно доступов
        if (document.getElementById('AF_Linksd').style.display == '')
            document.getElementById('AF_Linksd').style.display = 'none'
        else
            document.getElementById('AF_Linksd').style.display = ''
    }
	
	    document.getElementById('hideMeLinksd').onclick = function () { // скрытие окна доступов
        if (document.getElementById('AF_Linksd').style.display == '')
            document.getElementById('AF_Linksd').style.display = 'none'
    }
	
	  // обработка нажатий на странице доступов
    document.getElementById('kibsvidbut').onclick = function () { // kibana Tech Summary - ID
        if (kibsvid.value == "") {
            console.log('Введите id в поле')
        } else {
            window.open("https://kibana-logs.skyeng.link/app/kibana#/discover/da6a6090-731a-11ea-9172-7db0f10793b8?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1w,to:now))&_a=(columns:!(userId,event,appSessionId,details.summary.userAgent,details.summary.iceDisconnectedCount,details.summary.mediaStates.video.down.count,details.summary.mediaStates.audio.down.count,details.summary.publishedSuccessfully,details.summary.localStreamReady,details.summary.remoteStreamReady,details.summary.video.muteCount,details.summary.slowLinkCount.publisher.toServer.count,details.summary.slowLinkCount.subscriber.fromServer.count),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'6e2a3760-704b-11ea-9172-7db0f10793b8',key:event,negate:!f,params:(query:tech-summary),type:phrase,value:tech-summary),query:(match:(event:(query:tech-summary,type:phrase))))),index:'6e2a3760-704b-11ea-9172-7db0f10793b8',interval:auto,query:(language:kuery,query:'userId:" + kibsvid.value + "'),sort:!(!('@timestamp',desc)))");
        };
        kibsvid.value = "";
    }

    document.getElementById('kibsvheshbut').onclick = function () { // kibana Tech Summary - хэш
        if (kibsvhesh.value == "") {
            console.log('Введите ХЭШ в поле')
        } else {
            window.open("https://kibana-logs.skyeng.link/app/kibana#/discover/da6a6090-731a-11ea-9172-7db0f10793b8?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-2w,to:now))&_a=(columns:!(userId,event,roomId,appSessionId,detailsJson,details.summary.mediaStates.video.down.count,details.summary.publishedSuccessfully,details.summary.mediaStates.audio.down.count,details.summary.iceDisconnectedCount,details.summary.localStreamReady,details.summary.remoteStreamReady),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:'6e2a3760-704b-11ea-9172-7db0f10793b8',key:event,negate:!f,params:(query:tech-summary),type:phrase,value:tech-summary),query:(match:(event:(query:tech-summary,type:phrase))))),index:'6e2a3760-704b-11ea-9172-7db0f10793b8',interval:auto,query:(language:kuery,query:'appSessionId " + kibsvhesh.value + "'),sort:!(!('@timestamp',desc)))");
        };
        kibsvhesh.value = "";
    }

    document.getElementById('kibservheshbut').onclick = function () { // kibana найти по хешу комнаты сервер
        if (kibservhesh.value == "") {
            console.log('Введите ХЭШ в поле')
        } else {
            window.open("https://kibana-logs.skyeng.link/app/kibana#/discover/2d464cf0-af5e-11ea-b33d-d1adb43c9089?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-1w,to:now))&_a=(columns:!(appSessionId,userId,event),filters:!(),index:'6e2a3760-704b-11ea-9172-7db0f10793b8',interval:auto,query:(language:kuery,query:'webRTCStateUp%20and%20appSessionId%20" + kibservhesh.value + "'),sort:!(!('@timestamp',desc)))");
        };
        kibservhesh.value = "";
    }

    document.getElementById('kibslowbut').onclick = function () { // kibana Слоулинки, дисконнекты, отвалы
        if (kibslow.value == "") {
            console.log('Введите ХЭШ в поле')
        } else {
            window.open("https://kibana-logs.skyeng.link/app/kibana#/discover/da6a6090-731a-11ea-9172-7db0f10793b8?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-30d,to:now))&_a=(columns:!(userId,appSessionId,details.summary.slowLinkCount.publisher.toServer.count,details.summary.slowLinkCount.publisher.toServer.lostSum,details.summary.slowLinkCount.subscriber.fromServer.lostSum,details.summary.slowLinkCount.subscriber.fromServer.count,details.summary.iceDisconnectedCount,details.summary.mediaStates.audio.down.count,details.summary.mediaStates.video.down.count),filters:!(),index:'6e2a3760-704b-11ea-9172-7db0f10793b8',interval:auto,query:(language:kuery,query:'appSessionId: " + kibslow.value + " and (details.summary.slowLinkCount.subscriber.fromServer.count > 0 or details.summary.slowLinkCount.publisher.toServer.count > 0  or details.summary.slowLinkCount.publisher.toServer.lostSum > 0 or details.summary.slowLinkCount.subscriber.fromServer.lostSum > 0 or details.summary.iceDisconnectedCount > 0 or details.summary.mediaStates.audio.down.count > 0 or details.summary.mediaStates.video.down.count > 0)'),sort:!(!('@timestamp',asc)))");
        };
        kibslow.value = "";
    }

    document.getElementById('kibheshvidbut').onclick = function () { // kibana видео-аудио не передавалось
        if (kibheshvid.value == "") {
            console.log('Введите ХЭШ в поле')
        } else {
            window.open("https://kibana-logs.skyeng.link/app/kibana#/discover/243e0230-a0c0-11ea-b33d-d1adb43c9089?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-30d,to:now))&_a=(columns:!(userId,appSessionId,event,details.source,description,details.pluginEvent.type,details.pluginEvent.name,contextId,janusClientId,details.pluginEvent.message),filters:!(),index:'6e2a3760-704b-11ea-9172-7db0f10793b8',interval:auto,query:(language:kuery,query:'appSessionId: " + kibheshvid.value + " and (description : \"mediaState video down\" or description : \"mediaState audio down\")\'),sort:!(!(\'@timestamp\',asc)))");
        };
        kibheshvid.value = "";
    }

    document.getElementById('kibstiheshbut').onclick = function () { // kibana Стрим локально и до платформы
        if (kibstihesh.value == "") {
            console.log('Введите ХЭШ в поле')
        } else {
            window.open("https://kibana-logs.skyeng.link/app/kibana#/discover/da6a6090-731a-11ea-9172-7db0f10793b8?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-30d,to:now))&_a=(columns:!(userId,appSessionId,details.summary.localStreamReady,details.summary.publishedSuccessfully),filters:!(),index:'6e2a3760-704b-11ea-9172-7db0f10793b8',interval:auto,query:(language:kuery,query:'appSessionId: " + kibstihesh.value + " and (details.summary.publishedSuccessfully : false or  details.summary.localStreamReady: false)'),sort:!(!('@timestamp',asc)))");
        };
        kibstihesh.value = "";
    }

    // действия конопок редаш в окне доступов
    document.getElementById('mobappidbut').onclick = function () { // Редаш логи действий мобилки
        if (mobappid.value == "") {
            console.log('Введите id в поле')
        } else {
            window.open("https://redash.skyeng.ru/queries/13000?p_end_at=d_now&p_id=" + mobappid.value + "&p_start_at=d_yesterday");
        };
        mobappid.value = "";
    }

    document.getElementById('rpayidbut').onclick = function () { // Редаш логи платежей
        if (rpayid.value == "") {
            console.log('Введите id в поле')
        } else {
            window.open("https://redash.skyeng.ru/queries/22630?p_ID%20%D0%A1%D1%82%D1%83%D0%B4%D0%B5%D0%BD%D1%82%D0%B0=" + rpayid.value);
        };
        rpayid.value = "";
    }

    document.getElementById('GetUserActions').onclick = function () { // Редаш логи платежей
        if (UserActions.value == "") {
            console.log('Введите id в поле')
        } else {
            window.open("https://redash.skyeng.ru/queries/30681?p_end_at=d_now&p_id=" + UserActions.value + "&p_start_at=d_yesterday");
        };
        UserActions.value = "";
    } 

	document.getElementById('getUserEssay').onclick = function () { // Редаш логи эссе
        if (essayHashRoom.value == "") {
            console.log('Введите hash комнаты в поле')
        } else {
            window.open("https://redash.skyeng.ru/queries/41043?p_fromDate=2023-02-15&p_roomHash=" + essayHashRoom.value);
        };
        essayHashRoom.value = "";
    }
	
	// Остальные сервисы
    document.getElementById('grafanalnk').addEventListener('click', function () {
        window.open("https://grafana.skyeng.link/d/NZkMHsVMk/video-servers-health-check?orgId=1&refresh=1m")    // открываем Grafana
    })

    document.getElementById('grafanapoolCRM2').addEventListener('click', function () {
        window.open("https://grafana.skyeng.link/d/fzN-fk5Gk/task-dashboard?orgId=1&var-task_id=null&var-task_status=waiting&var-task_status=assigned&var-task_status=processing&var-operator_group_id=All&var-operator_id=All&var-task_operator_group_id=207")    // открываем Grafana пул задачь CRM2
    })

    document.getElementById('GetWidgetLessonStatus').onclick = function () { // Графана лог виджета входа на урок
        if (WidgetLessonStatus.value == "") {
            console.log('Введите id в поле')
        } else {
            window.open("https://grafana.skyeng.link/d/DZop3WKVz/nextlesson-analytics?orgId=1&var-UserId=" + WidgetLessonStatus.value + "&from=now-24h&to=now");
        };
        WidgetLessonStatus.value = "";
    }

    document.getElementById('kpiteachersdashboard').addEventListener('click', function () {
        window.open("https://datalens.yandex.ru/lupggqkv0uewa-kpi-p-dlya-tp?tab=GrW&state=684e0be1371")    // копируем открываем дашборд КПИ тичерсов
    })