var win_linksd =  // описание элементов окна доступов
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 409px;" id="linksd_1str">
                            <button class="mainButton buttonHide" title="скрывает меню" id="hideMeLinksd">hide</button>
                        </div>
                        <div style="margin: 5px; margin-top: 0px; width: 409px" id="linksd_kib_box">
                            <p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Redash</p>
                            <input id="mobappid" placeholder="ID mob.app" title="Вводим id пользователя для открытия действий в приложении" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="mainButton" id="mobappidbut">🔎</button>
                            <input id="rpayid" placeholder="ID платежи" title="Вводим id пользователя для открытия лога платежей" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="mainButton" id="rpayidbut">🔎</button>
 							<input id="UserActions" placeholder="ID У/П действ" title="Вводим id пользователя для открытия информации о действиях в личном кабинете" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="mainButton" id="GetUserActions">🔎</button>
							<input id="essayHashRoom" placeholder="Эссе Hash" title="Вводим хеш комнаты с эссе на открывшейся странице не забываем изменить дату" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="mainButton" id="getUserEssay">🔎</button>
                            <p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Grafana</p>
                            <input id="WidgetLessonStatus" placeholder="ID У/П виджет" title="Вводим id пользователя для открытия информации об отображении виджета входа на урок" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="mainButton" id="GetWidgetLessonStatus">🔎</button>
                            <button class="mainButton" title="Открывает Графану с состоянием видеосерверов, при наплыве обращений проверяйте его" id="grafanalnk" style="width:130px">Видео сервера</button>
                            <button class="mainButton" title="Открывает Графану с отображением пула задачь на группе Техподдержка Исход CRM2" id="grafanapoolCRM2" style="width:130px">Пул исход CRM2</button>
							<p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">KPI Teachers</p>
							<button class="mainButton" title="Открывает Datalens для просмотра информации по KPI teachers" id="kpiteachersdashboard" style="width:150px">Datalens Dashboard</button>
                        </div>
                </span>
        </span>
</div>`;

const wintLinksd= createWindow('AF_Linksd', 'winTopLinksd', 'winLeftLinksd', win_linksd);
hideWindowOnDoubleClick('AF_Linksd');
hideWindowOnClick('AF_Linksd', 'hideMeLinksd');


document.getElementById('addsrc').onclick = function () { //открывает окно доступов
    if (document.getElementById('AF_Linksd').style.display == '')
        document.getElementById('AF_Linksd').style.display = 'none'
    else
        document.getElementById('AF_Linksd').style.display = ''
}

// обработка нажатий на странице доступов
document.getElementById('mobappidbut').onclick = function () { // Редаш логи действий мобилки
    if (mobappid.value == "") {
        alert('Введите id в поле')
    } else {
        window.open("https://redash.skyeng.ru/queries/13000?p_end_at=d_now&p_id=" + mobappid.value + "&p_start_at=d_yesterday");
    };
    mobappid.value = "";
}

document.getElementById('rpayidbut').onclick = function () { // Редаш логи платежей
    if (rpayid.value == "") {
        alert('Введите id в поле')
    } else {
        window.open("https://redash.skyeng.ru/queries/22630?p_ID%20%D0%A1%D1%82%D1%83%D0%B4%D0%B5%D0%BD%D1%82%D0%B0=" + rpayid.value);
    };
    rpayid.value = "";
}

document.getElementById('GetUserActions').onclick = function () { // Редаш логи платежей
    if (UserActions.value == "") {
        alert('Введите id в поле')
    } else {
        window.open("https://redash.skyeng.ru/queries/30681?p_end_at=d_now&p_id=" + UserActions.value + "&p_start_at=d_yesterday");
    };
    UserActions.value = "";
}

document.getElementById('getUserEssay').onclick = function () { // Редаш логи эссе
    if (essayHashRoom.value == "") {
        alert('Введите hash комнаты в поле')
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
        alert('Введите id в поле')
    } else {
        window.open("https://grafana.skyeng.link/d/DZop3WKVz/nextlesson-analytics?orgId=1&var-UserId=" + WidgetLessonStatus.value + "&from=now-24h&to=now");
    };
    WidgetLessonStatus.value = "";
}

document.getElementById('kpiteachersdashboard').addEventListener('click', function () {
    window.open("https://datalens.yandex.ru/lupggqkv0uewa-kpi-p-dlya-tp?tab=GrW&state=684e0be1371")    // копируем открываем дашборд КПИ тичерсов
})