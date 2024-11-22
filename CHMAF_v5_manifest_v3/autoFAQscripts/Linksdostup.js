var win_linksd =  // описание элементов окна доступов
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 409px;" id="linksd_1str">
                            <button class="mainButton buttonHide" title="скрывает меню" id="hideMeLinksd">hide</button>
                        </div>
                        <div style="margin: 5px; margin-top: 0px; width: 409px" id="linksd_kib_box">
                            <p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Grafana</p>
                            <input id="WidgetLessonStatus" placeholder="ID У/П виджет" title="Вводим id пользователя для открытия информации об отображении виджета входа на урок" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="mainButton" id="GetWidgetLessonStatus">🔎</button>
                            <button class="mainButton" title="Открывает Графану с состоянием видеосерверов, при наплыве обращений проверяйте его" id="grafanalnk" style="width:130px">Видео сервера</button>
                            <button class="mainButton" title="Открывает Графану с отображением пула задачь на группе Техподдержка Исход CRM2" id="grafanapoolCRM2" style="width:130px">Пул исход CRM2</button>
							<p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Datalens Dashboard</p>
							<button class="mainButton" title="Открывает Datalens для просмотра информации по KPI teachers" id="kpiteachersdashboard" style="width:48%">KPI Teachers</button>
                            <button class="mainButton" title="Открывает Datalens для просмотра информации по действия пользвоателя в ЛК/МП" id="lkmpdashboard" style="width:48%">Действия П/У ЛК/МП</button>
                        </div>
                </span>
        </span>
</div>`;

const wintLinksd = createWindow('AF_Linksd', 'winTopLinksd', 'winLeftLinksd', win_linksd);
hideWindowOnDoubleClick('AF_Linksd');
hideWindowOnClick('AF_Linksd', 'hideMeLinksd');


document.getElementById('addsrc').onclick = function () { //открывает окно доступов
    if (document.getElementById('AF_Linksd').style.display == '')
        document.getElementById('AF_Linksd').style.display = 'none'
    else
        document.getElementById('AF_Linksd').style.display = ''
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

document.getElementById('lkmpdashboard').addEventListener('click', function () {
    window.open("https://datalens.yandex.cloud/b4ut2mi8b8z8y-deystvie-polzovateley-v-lk-mp")
})