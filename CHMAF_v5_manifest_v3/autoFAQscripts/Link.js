var win_Links =  // описание элементов окна ссылок
    `<div style="display: flex; width: 550px;">
        <span style="width: 550px">
			<span style="cursor: -webkit-grab;">
				<div style="margin: 5px; width: 550;" id="links_1str">
					<button title="Скрытие меню" id="hideMe" class="mainButton buttonHide">hide</button>
					<button title="Открывает раздел для формирования заявки на удаленине персональных данных" id="deleteaclnk" class="mainButton uplinksbar">🗑</button>
					<button title="Открывает Базу знаний в Confluence" id="knoweledgebase" class="mainButton uplinksbar">📚</button>
					<button title="Открывает админку с эссе для перезакрепления за П" id="essayadmin" class="mainButton uplinksbar">📝</button>
					<button title="Открывает меню для работы со статистикой, поиска чатов без тематики, с низкими оценками, по комментарию" id="getStats" class="mainButton uplinksbar">📋</button>
					<button title="Открывает Infra для запроса сброса пароля в Mattermost Teacher" id="resetMMPassword" class="mainButton uplinksbar">🔐</button>
					<button title="Открывает менюшку для просмотра информации по BIN банка, чтобы узнать тип карты, страну происхождения, название банка" id="bankCheck" class="mainButton uplinksbar">💳</button>
					<button title="Открывает просмотр список группы" id="GrListData" class="mainButton uplinksbar">👩‍👩‍👧‍👦</button>
                    <button title="Открывает известные баги на платформе" id="confbugs" style="width: 50px; float: right; margin-right: 5px" class="mainButton uplinksbar">🐞</button>
				</div>
				<div style="margin: 5px; width: 550px;" id="links_but">
					<button class="mainButton" title="Открывает Timetable" id="timetable" style="width:105px">TimeTable</button>
					<button class="mainButton" title="Открывает админку Talks для поиска по ID П ID У , с которым идет урок" id="talksadm" style="width:105px">Talks</button>
					<button class="mainButton" title="Открывает начислятор билинга для просмотра реального баланса у ученика и зависших уроков не на той STK" id="billingadm" style="width:105px">Начислятор</button>
					<button class="mainButton" title="Открывает раздел для создания операции компенсации ученику" id="compens" style="width:105px">Компенсация</button>
					<button class="mainButton" title="Открывает CMS хранилище материалов уроков" id="CMS" style="width:105px">CMS</button>
					<button class="mainButton" title="Открывает админку пользователей" id="useradm" style="width:105px; margin-top: 3px">Админка</button>
					<button class="mainButton" title="Открывает поиск платежа по данным карте, сумме, дате платежа" id="transactions" style="width:105px; margin-top: 3px">Поиск $</button>
					<button class="mainButton" title="Открывает форму передачи предложений от пользователей" id="suggestions" style="width:105px; margin-top: 3px">Предложения</button>
					<button class="mainButton" title="Открывает раздел с проверкой фичей(кругов), подключенных пользователю и добавление/удаление их" id="userfeatures" style="width:105px; margin-top: 3px">User Фичи</button>
					<button class="mainButton" title="Открывает  CMS детских предметов" id="kidscms" style="width:105px; margin-top: 3px">Kids CMS</button>
					<button class="mainButton" title="Открывает раздел в Confluence по созданию тестовых комнат" id="testroom" style="width:105px; margin-top: 3px">TestRooms</button>
					<button class="mainButton" title="Открывает билинг для просмотра и редактирования подписок" id="subscribebilling" style="width:105px; margin-top: 3px">$Подписки</button>
					<button class="mainButton" title="Открывает форму по аппеляциям аудита" id="apelation" style="width:105px; margin-top: 3px">Апелляции</button>
					<button class="mainButton" title="Открывает сайт BrowserStack" id="browserstack" style="width:105px; margin-top: 3px">BrowserStaсk</button>
					<button class="mainButton" title="Открывает сайт для поиска записей уроков" id="lesrecords" style="width:105px; margin-top: 3px">LessonRecords</button>
					<button class="mainButton" title="Открывает раздел для проверки сертификата" id="certificates" style="width:105px; margin-top: 3px">Сертификаты</button>
					<button class="mainButton" title="Открывает раздел для проверки промокодов" id="promocodes" style="width:105px; margin-top: 3px">Промокоды</button>
					<button class="mainButton" title="Открывает Help Centr для учеников" id="helpocentrstud" style="width:105px; margin-top: 3px">Help Center У</button>
					<button class="mainButton" title="Открывает Help Centr для преподавателей" id="helpocentrteach" style="width:105px; margin-top: 3px">Help Center П</button>	
					<button class="mainButton" title="Открывает сайт для просмотра ошибок и логов в комнате" id="trshoothing" style="width:105px; margin-top: 3px">Troubleshooting</button>
				</div>
				<div style="margin: 5px; width: 550px" id="links_box">
					<input id="cpuname" placeholder="CPU name" title="вводим название процессора, чтобы сразу перейти на сайт с проверкой рейтинга CPU" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="benchmark">🔎</button>
					<input id="creditstatus" placeholder="ID У рассрочка" title="вводим ID У, чтобы получить прямую ссылку для проверки рассрочек ученика" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="credits">🔎</button>
					<input id="iplookup" placeholder="IP У/П/Vimbox" title="вводим IP У/П/Платформы, чтобы получить информацию о месторасположении географического адреса и получения информации о хостинге" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="gotolookip">🔎</button>
					<input id="lgssearch" placeholder="ID Группы LGS" title="Введите ID LGS или обычной группы KGL для просмотра информации" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="getlgsinfo">🔎</button>
					<input id="cmsstepid" placeholder="CMS stepUUID" title="вводим stepUUID, чтобы сразу попасть в ЦМС на нужный урок и найти на нем наш слайд и проверить" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="cmsid">🔎</button>
					<input id="schemesteacher" placeholder="ID П схем возн" title="Вводим ID П, чтобы открытть ресурс с подключенными схемами вознаграждения П" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="getschemes">🔎</button>	
					<input id="pushes" placeholder="ID У пуши" title="Вводим ID У, чтобы увидеть были отправлены пуши ученику или нет" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="getpushes">🔎</button>
					<input id="idforservicelocaleru" placeholder="ID У обсл RU" title="вводим ID У и по нажатию изменяем сразу ему язык обслуживания на русский" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="setservicelocaleru">🚀</button>
					<input id="setidformobpass" placeholder="ID У/П МП" title="введите ID У/П для генерации разового пароля он будет отображен в поле ввода ID и скопирован в  буфер обмена" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="getmobpasscode" style="width: 25.23px;">🚀</button>
					<input id="trshooterhash" placeholder="hash trshooter" title="Вводим хеш комнаты чтобы посмотреть сразу инфу в трабл шутере" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="gettrshinfo" style="width: 25.23px;">🚀</button>
					<input id="enablerAP" placeholder="ID услуги(АП)" title="копируем услуги, где нужно активировать АП и сохраняем в буфер, в ЛКУ переходим по ссылке для активации" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="getenablerAP" style="width: 25.23px;">💾</button>
					<input id="skipAP" placeholder="ID ус(skipАП)" title="копируем услуги, где нужно пропустить АП и сохраняем в буфер, в ЛКУ переходим по ссылке для деактивации" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="getskipAP" style="width: 25.23px;">💾</button>
					<input id="skiponboarding" placeholder="ID ус(skip Onbo)" title="копируем услуги, где нужно отключить онбоардинг в ЛКУ" autocomplete="off" type="text" style="text-align: center; width: 103px; color: black; margin-top: 5px">
					<button class="mainButton" id="doskiponboard" style="width: 25.23px;">💾</button>
				</div>
				<div style="margin: 5px; width: 550px" id="links_butd">
					<button class="mainButton" title="копирует в буфер обмена команду setstatus('classwork') для перезапуска уроков" id="restartlesson" style="width:100px">Redo MAT💾</button>
					<button class="mainButton" title="открывает модуль парсинга чатов операторов и вытягиваиет из них теги тематику или все вместе для дальнейшего анализа" id="openGrabber" style="width:100px">Grabber</button>
					<button class="mainButton" title="отображает актуальную версию iOS приложения" id="curVeriOS" style="float: right; margin-right: 10px;"></button>
			  	    <button class="mainButton" title="Отображает актуальную версию Android приложения" id="curVerAndroid" style="float: right; margin-right: 5px;"></button>
			  	    <button class="mainButton" title="Открывает Confluence с инструкцией по расширению" id="faqext" style="float: right; margin-right: 5px;">ChMAF</button>
				</div>
			</span>
	</span>
</div>`;

const wintLinks  = createWindow('AF_Links', 'winTopLinks', 'winLeftLinks', win_Links);
hideWindowOnDoubleClick('AF_Links');
hideWindowOnClick('AF_Links', 'hideMe');

if (localStorage.getItem('winTopLinks') == null) { // началоное положение окна ссылок (если не задано ранее)
    localStorage.setItem('winTopLinks', '120');
    localStorage.setItem('winLeftLinks', '295');
}

document.getElementById('links').onclick = function () { //открывает окно ссылок
    if (document.getElementById('AF_Links').style.display == '')
        document.getElementById('AF_Links').style.display = 'none'
    else {
        document.getElementById('AF_Links').style.display = ''
        getversionsapp()
    }
}                              

document.getElementById('knoweledgebase').onclick = function () { // открытие Confluence БЗ 2.0
    window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=25407293")
}

document.getElementById('essayadmin').onclick = function () { // открытие админки эссе
    window.open("https://api-english.skyeng.ru/admin/platform/openanswer/list")
}

document.getElementById('timetable').addEventListener('click', function () { // копируем в буфер ссылку на Timetable
    window.open("https://timetable.skyeng.ru/")    
})

document.getElementById('faqext').addEventListener('click', function () { // открываем инструкцию по расширению
    window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971")    
})

document.getElementById('curVeriOS').addEventListener('click', function () { // открываем актуальную версию приложения iOS
    window.open("https://apps.apple.com/ru/app/skyeng-%D0%B0%D0%BD%D0%B3%D0%BB%D0%B8%D0%B9%D1%81%D0%BA%D0%B8%D0%B9-%D1%8F%D0%B7%D1%8B%D0%BA-%D0%BE%D0%BD%D0%BB%D0%B0%D0%B9%D0%BD/id1065290732")
})

document.getElementById('curVerAndroid').addEventListener('click', function () { // открываем актуальную версию приложения Android
    window.open("https://play.google.com/store/apps/details?id=skyeng.words.prod")
})

document.getElementById('talksadm').addEventListener('click', function () { // открываем ссылку в новой вкладке на  Talks админку
    window.open("https://vimbox.skyeng.ru/talks/admin/statistics")
})

document.getElementById('billingadm').addEventListener('click', function () { // открываем ссылку в новой вкладке на  Начислятор
    window.open("https://billing-api.skyeng.ru/operations")    
})

document.getElementById('compens').addEventListener('click', function () { // открываем ссылку в новой вкладке на  Компенсации
    window.open("https://billing-marketing.skyeng.ru/accrual-operations/create")
})

document.getElementById('useradm').addEventListener('click', function () { // открываем ссылку в новой вкладке на  Пользовательская админка
    window.open("https://id.skyeng.ru/admin/users")
})

document.getElementById('suggestions').addEventListener('click', function () { // открываем ссылку в новой вкладке на  Предложения/пожелания
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScnX8PdboJjcq2hgLmIyHvZoaqKXmgfp-6gGkyFjwJ1JYAK3Q/viewform")
})

document.getElementById('transactions').addEventListener('click', function () { // открываем ссылку в новой вкладке на  Поиск транзакций
    window.open("https://accounting.skyeng.ru/userpayment/search/transaction")    
})

document.getElementById('CMS').addEventListener('click', function () { // открываем ссылку в новой вкладке на CMS
    window.open("https://cms-vimbox.skyeng.ru/vim")    
})

document.getElementById('subscribebilling').addEventListener('click', function () { // открываем ссылку в новой вкладке на Необоснованные оценки ТП АФ
    window.open("https://billing-api.skyeng.ru/subscriptions")    
})

document.getElementById('apelation').addEventListener('click', function () { // открываем ссылку в новой вкладке на Форма для апелляций чатов ТП АФ
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSdgsb6pte1H1dz15Eb5NjDe0gj3kEnh0hTe6Cgy8d81mT7NUA/viewform")    
})

document.getElementById('confbugs').addEventListener('click', function () { // открываем ссылку список багов в confluence
    window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=96042583")    
})

document.getElementById('restartlesson').addEventListener('click', function () { // копируем ссылку в буфер для перезапуска урока
    copyToClipboard("setStatus('classwork')")   
    document.getElementById('restartlesson').innerHTML = "Copied!";
    setTimeout(function () { document.getElementById('restartlesson').innerHTML = "Redo MAT💾" }, 2000);
})

document.getElementById('browserstack').addEventListener('click', function () { // открываем ссылку в новой вкладке на Browserstak
    window.open("https://www.browserstack.com/users/sign_in")    
})

document.getElementById('trshoothing').addEventListener('click', function () { // открываем ссылку в новой вкладке на TRM 2.0
    window.open("https://video-trouble-shooter.skyeng.ru/")    
})

document.getElementById('lesrecords').addEventListener('click', function () { // открываем ссылку в новой вкладке на Tramway Lesson Records
    window.open("https://tramway.skyeng.ru/record")    
})

document.getElementById('testroom').addEventListener('click', function () { // открываем ссылку в админку тестовых комнат
    window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=82244638")    
})

document.getElementById('certificates').addEventListener('click', function () { // открываем ссылку в новой вкладке на Подарочные сертификаты
    window.open("https://billing-marketing.skyeng.ru/certificate/certSearch")    
})

document.getElementById('promocodes').addEventListener('click', function () { // открываем ссылку в новой вкладке на Промокоды
    window.open("https://billing-marketing.skyeng.ru/promocode/list")    
})

document.getElementById('helpocentrteach').addEventListener('click', function () { // открываем ссылку в новой вкладке на Help Centr для П
    window.open("https://helpcenter.skyeng.ru/teachers")    
})

document.getElementById('helpocentrstud').addEventListener('click', function () { // открываем ссылку в новой вкладке на Help Centr для У
    window.open("https://helpcenter.skyeng.ru/students")    
})

document.getElementById('kidscms').addEventListener('click', function () { // открываем ссылку в новой вкладке Kids CMS
    window.open("https://vimbox.skyeng.ru/kids/math/cms/lessons/1")    
})

document.getElementById('userfeatures').addEventListener('click', function () { // открываем ссылку в новой вкладке на проверку фичей пользователя
    window.open("https://vimbox.skyeng.ru/circles/editor")    
})

document.getElementById('benchmark').onclick = function () {                  //поиск по имени процессора на сайте cpubenchmark
    let lnkgr = 'https://www.cpubenchmark.net/cpu_lookup.php?cpu=';
    if (cpuname.value == "")
        alert('Введите CPU в поле')
    else {
        window.open(lnkgr + cpuname.value);
    };
    cpuname.value = "";
}
	
document.getElementById('cmsid').onclick = function () {                     // переход на степID в CMSке
    if (cmsstepid.value == "")
        alert('Введите STEPUUID в поле')
    else {
        window.open('https://content.vimbox.skyeng.ru/cms/stepStore/update/stepId/' + cmsstepid.value);
    };
    cmsstepid.value = "";
}

document.getElementById('getschemes').onclick = function() { // переход на просмотра подключенных схем вознаграждения преподавателей
	    if (schemesteacher.value == "")
        alert('Введите ID П в поле')
    else {
        window.open('https://teacher-incentive.skyeng.ru/incentive/teacher/' + schemesteacher.value);
    };
    schemesteacher.value = "";
}

document.getElementById('getpushes').onclick = function() { // переход на просмотр статусов пушей ученику в МП
	    if (pushes.value == "")
        alert('Введите ID У в поле')
    else {
        window.open('https://push-notifications.skyeng.ru/cms/logs?page=1&paginateBy=100&id=&userId=' + pushes.value + '&status=&useCase=&notificationSource=&createdAtFrom=&createdAtTo=');
    };
    pushes.value = "";
}
		
document.getElementById('credits').onclick = function () {                  // проверка рассрочки у ученика она же поэтапная оплата (ПО)
    let lnkscredits = 'https://accounting.skyeng.ru/credit/list?studentId=';
    if (creditstatus.value == "")
        alert('Введите id  ученика в поле')
    else {
        window.open(lnkscredits + creditstatus.value);
    };
    creditstatus.value = "";
}
	
document.getElementById('gettrshinfo').onclick = function () {               // сохранение в буфере айди ученика для просмотра всего списка ДЗ по нему
    let trshootlnk = 'https://video-trouble-shooter.skyeng.ru/?hash=';
    if (trshooterhash.value == "")
        alert('Введите id  ученика в поле')
    else {
        window.open(trshootlnk + trshooterhash.value);
    };
    trshooterhash.value = "";
}
	
document.getElementById('getenablerAP').onclick = function () {               // сохранение в буфере ссылки для активации АП
    let enableAPlnk = 'https://pcs.skyeng.ru/cabinet/teacher-selection?educationServiceId=';
    if (enablerAP.value == "")
        alert('Введите hash комнаты в поле')
    else {
        copyToClipboard(enableAPlnk + enablerAP.value);
    };
    document.getElementById('getenablerAP').innerHTML = "✅";
    setTimeout(function () { document.getElementById('getenablerAP').innerHTML = "💾" }, 2000);
    enablerAP.value = "";
}

document.getElementById('getskipAP').onclick = function () {               // сохранение в буфере ссылки для активации АП
    let skipAPlnk = 'https://student.skyeng.ru/product-stage?stage=auto-schedule&educationServiceId=';
    if (skipAP.value == "")
        alert('Введите hash комнаты в поле')
    else {
        copyToClipboard(skipAPlnk + skipAP.value);
    };
    document.getElementById('getskipAP').innerHTML = "✅";
    setTimeout(function () { document.getElementById('getskipAP').innerHTML = "💾" }, 2000);
    skipAP.value = "";
}


document.getElementById('doskiponboard').onclick = function () {               // сохранение в буфере ссылки для активации АП
    let skiponblnk = 'https://student.skyeng.ru/product-stage?stage=onboarding&educationServiceId=';
    if (skiponboarding.value == "")
        alert('Введите ID услуги в поле')
    else {
        copyToClipboard(skiponblnk + skiponboarding.value);
    };
    document.getElementById('doskiponboard').innerHTML = "✅";
    setTimeout(function () { document.getElementById('doskiponboard').innerHTML = "💾" }, 2000);
    skiponboarding.value = "";
}
	
document.getElementById('setservicelocaleru').onclick = function () { // меняет язык обслуживания выбранного пользователя в вензеле на русский но через кнопку в "L"
    document.getElementById('responseTextarea1').value = `{
		"headers": {
		    "content-type": "application/json",
		    "sec-fetch-mode": "cors",
		    "sec-fetch-site": "same-site"
		},
		"referrer": "https://crm2.skyeng.ru/",
		"referrerPolicy": "strict-origin-when-cross-origin",
		"body": "{\\"serviceLocale\\":\\"ru\\"}",
		"method": "PUT",
		"mode": "cors",
		"credentials": "include"
	}`
    document.getElementById('responseTextarea2').value = "https://backend.skyeng.ru/api/persons/general/" + idforservicelocaleru.value
    document.getElementById('responseTextarea3').value = ''
    document.getElementById('sendResponse').click()
    document.getElementById('setservicelocaleru').innerHTML = "✅"
    idforservicelocaleru.value = "";
    setTimeout(function () { document.getElementById('setservicelocaleru').innerHTML = "🚀" }, 2000);
}
	
document.getElementById('deleteaclnk').addEventListener('click', function () { // открываем ссылку в новой вкладке для создания задачи на удаление аккаунта
    window.open("https://infra.skyeng.ru/request/create/166")    
})

document.getElementById('resetMMPassword').addEventListener('click', function () { // 
    window.open("https://infra.skyeng.ru/request/create/233")    
})

document.getElementById('bankCheck').addEventListener('click', function () { // открывает окно просмотра информации о групповых уроков
    if (document.getElementById('AF_BankCheck').style.display == '')
        document.getElementById('AF_BankCheck').style.display = 'none'
    else
        document.getElementById('AF_BankCheck').style.display = ''
})
	
document.getElementById('gotolookip').onclick = function () { // проверка информации по айпишнику ученика/препода/ хостинга
    let iplink = 'https://check-host.net/ip-info?host=';
    if (iplookup.value == "")
        alert('Введите ip в поле')
    else {
        window.open(iplink + iplookup.value);
    };
    iplookup.value = "";
}
	
document.getElementById('getlgsinfo').onclick = function () { // открытие админки LGS по ID группы
    let lgslink = 'https://learning-groups-storage.skyeng.ru/group/';
    if (lgssearch.value == "")
        alert('Введите текст в поле')
    else {
        window.open(lgslink + lgssearch.value + '?cp=(section:participants)');
    };
    lgssearch.value = "";
}
let versionsfromdoc;
let versionscontainer;

async function getversionsapp() { // получаем из файла список версий моб. приложений

	versionsfromdoc = 'https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec'
	await fetch(versionsfromdoc).then(r => r.json()).then(r => versionsdata = r)
	versionscontainer = versionsdata.result;
	document.getElementById('curVeriOS').textContent  = versionscontainer[1][0] + ' : ' + versionscontainer[1][1]
	document.getElementById('curVerAndroid').innerText = versionscontainer[0][0] + ' : ' + versionscontainer[0][1]

}
	const getmobpasscode = document.querySelector('#getmobpasscode');

	getmobpasscode.onclick = function () {
	const setidformobpass = document.querySelector('#setidformobpass');
	if (setidformobpass.value.trim() == "") {
	alert('Введите id в поле');
	} else {
	getmobpasscode.innerHTML = '✅';
	setTimeout(() => getmobpasscode.innerHTML = '🚀', 2000);
	document.querySelector('#responseTextarea1').value = JSON.stringify({
	headers: {
	'content-type': 'application/x-www-form-urlencoded',
	'sec-fetch-dest': 'document',
	'sec-fetch-mode': 'navigate',
	'sec-fetch-site': 'same-origin',
	'sec-fetch-user': '?1',
	'upgrade-insecure-requests': '1'
	},
	body: "user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D= + ${setidformobpass.value} + &user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null",
	method: 'POST',
	mode: 'cors',
	credentials: 'include'
	});
	document.querySelector('#responseTextarea2').value = 'https://id.skyeng.ru/admin/auth/one-time-password';
	document.querySelector('#responseTextarea3').value = 'getmobpwd';
	document.querySelector('#sendResponse').click();

	const getPassInfo = async () => {
	  const resprez = await document.querySelector('#responseTextarea1').getAttribute('getmobpwd');
	  document.querySelector('#responseTextarea1').removeAttribute('getmobpwd');
	  const convertres = resprez.match(/div class="alert alert-success" role="alert".*?([0-9]{5}).*/);
	  setidformobpass.value = convertres[1];
	};
	setTimeout(getPassInfo, 2000);
	};
	setTimeout(() => setidformobpass.value = "", 15000);
	};
	
	
document.getElementById('getStats').onclick = getStatsButtonPress; 
document.getElementById('openGrabber').onclick = getopenGrabberButtonPress;
document.getElementById('GrListData').onclick = getGrListDataButtonPress;