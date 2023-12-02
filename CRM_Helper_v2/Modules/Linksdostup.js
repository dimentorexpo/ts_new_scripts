var win_linksd =  // описание элементов окна доступов
    `<div style="display: flex; width: 450px;">
        <span style="width: 450px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 440px;" id="linksd_1str">
                            <button class="buttonHide" title="скрывает меню" id="hideMeLinksd">hide</button>
                            <button class="btnCRM" id="curVeriOSCRM" style="float: right;"></button>
							<button class="btnCRM" id="curVerAndroidCRM" style="float: right; margin-right: 7px;"></button>
                        </div>
                        <div style="margin: 5px; margin-top: 0px; width: 450px">
                            <p style="margin-left: 44%; margin-bottom: 0px; margin-top: 0px; color: #F6358A; font-size: 16px">Redash</p>
                            <input class="inputCRM" id="mobappid" placeholder="ID mob.app" title="Вводим id пользователя для открытия действий в приложении" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="btnCRM btnCRMsmall" id="mobappidbut">🔎</button>
                            <input class="inputCRM" id="rpayid" placeholder="ID платежи" title="Вводим id пользователя для открытия лога платежей" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="btnCRM btnCRMsmall" id="rpayidbut">🔎</button>
 							<input class="inputCRM" id="UserActions" placeholder="ID У/П действ" title="Вводим id пользователя для открытия информации о действиях в личном кабинете" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
                            <button class="btnCRM btnCRMsmall" id="GetUserActions">🔎</button>
                        </div>
                        <div id="dostupbnts" style="margin: 5px; width: 440px">
                            <button class="btnCRM" title="Открывает Графану с состоянием видеосерверов, при наплыве обращений проверяйте его" id="grafanalnk">Видео сервера в Grafana</button>
                            <button class="btnCRM" title="Открывает Tableaue для просмотра информации по KPI teachers" id="kpiteachersdashboard">KPI Teachers Dashboard</button>
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
wintLinksd.style = 'min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopLinksd') + 'px; left: ' + localStorage.getItem('winLeftLinksd') + 'px; font-size: 14px; z-index: 20; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintLinksd.style.display = 'none';
wintLinksd.setAttribute('id', 'AF_Linksd');
wintLinksd.innerHTML = win_linksd;

var listenerLinksd = function (e, a) { // сохранение позиции окна доступов
    wintLinksd.style.left = Number(e.clientX - myX9) + "px";
    wintLinksd.style.top = Number(e.clientY - myY9) + "px";
    localStorage.setItem('winTopLinksd', String(Number(e.clientY - myY9)));
    localStorage.setItem('winLeftLinksd', String(Number(e.clientX - myX9)));
};

wintLinksd.onmousedown = function (a) { // изменение позиции окна доступов
    if (checkelementtype(a)) {
        window.myX9 = a.layerX;
        window.myY9 = a.layerY;
        document.addEventListener('mousemove', listenerLinksd);
    }
}
wintLinksd.onmouseup = function () { document.removeEventListener('mousemove', listenerLinksd); } // прекращение изменения позиции окна доступов

document.getElementById('AF_Linksd').ondblclick = function (a) { // скрытие окна доступов по двойному клику
    if (checkelementtype(a)) { document.getElementById('AF_Linksd').style.display = 'none'; }
}

    document.getElementById('butdiagtoolsCRM').onclick = function () { //открывает окно доступов
        if (document.getElementById('AF_Linksd').style.display == ''){
            document.getElementById('AF_Linksd').style.display = 'none'
            document.getElementById('idmymenucrm').style.display = 'none'
        } else{
            document.getElementById('AF_Linksd').style.display = ''
            document.getElementById('idmymenucrm').style.display = 'none'
			
				document.getElementById('curVeriOSCRM').textContent  = tableres[1][0] + ':' + tableres[1][1]
				document.getElementById('curVeriOSCRM').addEventListener('click', function () { // открываем актуальную версию приложения iOS
				window.open("https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732")
			})

			document.getElementById('curVerAndroidCRM').textContent  = tableres[0][0] + ':' + tableres[0][1]
			document.getElementById('curVerAndroidCRM').addEventListener('click', function () { // открываем актуальную версию приложения Android
				window.open("https://play.google.com/store/apps/details?id=skyeng.words.prod")
			})
			}	
        // }            
    }
    document.getElementById('hideMeLinksd').onclick = function () { // скрытие окна доступов
        if (document.getElementById('AF_Linksd').style.display == '')
            document.getElementById('AF_Linksd').style.display = 'none'
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
	
	    document.getElementById('grafanalnk').addEventListener('click', function () {
        window.open("https://grafana.skyeng.link/d/NZkMHsVMk/video-servers-health-check?orgId=1&refresh=1m")    // открываем Grafana
    })

    document.getElementById('kpiteachersdashboard').addEventListener('click', function () {
        window.open("https://tableau.skyeng.ru/#/views/-_16291119357240/sheet18?:iid=1")    // копируем открываем дашборд КПИ тичерсов
    })