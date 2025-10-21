var win_linksd =  // описание элементов окна доступов
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 409px;" id="linksd_1str">
                            <button class="mainButton buttonHide" title="скрывает меню" id="hideMeLinksd">hide</button>
                        </div>
                        <div style="margin: 5px; margin-top: 0px; width: 409px" id="linksd_kib_box">
                            <p style="margin-left: 42%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Grafana</p>
                            <input class="${exttheme}" id="WidgetLessonStatus" placeholder="ID У/П виджет" title="Вводим id пользователя для открытия информации об отображении виджета входа на урок" autocomplete="off" type="text" style="text-align: center; width: 103px; margin-top: 5px">
                            <button class="mainButton" id="GetWidgetLessonStatus">🔎</button>
                            <button class="mainButton" title="Открывает Графану с состоянием видеосерверов, при наплыве обращений проверяйте его" id="grafanalnk" style="width:130px">Видео сервера</button>
                            <button class="mainButton" title="Открывает Графану с отображением пула задачь на группе Техподдержка Исход CRM2" id="grafanapoolCRM2" style="width:130px">Пул исход CRM2</button>
                            <button class="mainButton" title="Открывает Графану с просмотром действий над разовыми и регулярными уроками, кто когда отменял, удалял, добавлял" id="grafanadeystviyauroki" style="width:130px">Действия уроками</button>
                            <button class="mainButton" title="Открывает Графану с просмотром действий с запросами на перенос урока, были ли они, если да то отклонены или приняты или еще активны" id="grafanazaprosperenos" style="width:130px">Запрос на перенос</button>
                            <button class="mainButton" title="Открывает Графану с просмотром действий по открытию или закрытию разовых или регулярных слотов у П" id="grafanopencloseslots" style="width:130px">Откр/закр слот</button>
                            <button class="mainButton" title="Открывает Графану с просмотром действий по просмотру блокировок у пользователя" id="grafanablocks" style="width:130px">Блокировки</button>
							<p style="margin-left: 32%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Datalens Dashboard</p>
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

document.getElementById('grafanadeystviyauroki').addEventListener('click', function () {
    window.open("https://grafana.skyeng.link/d/f744d199-99db-4d86-98b3-a91edbdc273c/dejstvija-nad-urokami?orgId=1&var-student_id=&var-teacher_id=19886047&var-group_id=&from=now-2d&to=now")    // открываем Grafana
})

document.getElementById('grafanazaprosperenos').addEventListener('click', function () {
    window.open("https://grafana.skyeng.link/d/aey5ciha9s35sb/zapros-na-perenos-uroka?orgId=1&var-teacher_id=&from=now-2d&to=now")    // открываем Grafana
})

document.getElementById('grafanopencloseslots').addEventListener('click', function () {
    window.open("https://grafana.skyeng.link/d/e457e17f-729c-499d-bd38-b68dc32ef599/logi-otkrytija-zakrytija-slotov-p?orgId=1&from=now-2d&to=now")    // открываем Grafana
})

document.getElementById('grafanablocks').addEventListener('click', function () {
    window.open("https://grafana.skyeng.link/d/dd4c2d01-65ec-493b-9089-15591c91aea2/blokirovki-uslug?orgId=1&var-reason_type=All&var-education_service_kit_id=&var-education_service_id=&var-owner_id=42397377&from=now-2d&to=now")    // открываем Grafana
})

document.getElementById('GetWidgetLessonStatus').onclick = function () { // Графана лог виджета входа на урок
    if (WidgetLessonStatus.value == "") createAndShowButton('Введите id в поле', 'error')
    else {
        window.open("https://grafana.skyeng.link/d/DZop3WKVz/nextlesson-analytics?orgId=1&var-UserId=" + WidgetLessonStatus.value + "&from=now-24h&to=now");
    };
    WidgetLessonStatus.value = "";
}

document.getElementById('kpiteachersdashboard').addEventListener('click', function () {
    window.open("https://datalens.yandex.ru/lupggqkv0uewa-kpi-p-dlya-tp?tab=GrW")    // копируем открываем дашборд КПИ тичерсов
})

document.getElementById('lkmpdashboard').addEventListener('click', function () {
    window.open("https://datalens.yandex.cloud/b4ut2mi8b8z8y-deystvie-polzovateley-v-lk-mp")
})