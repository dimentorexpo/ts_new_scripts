//Global variables
let responsejira;
let psarr = [];
const messanger_name = "TiMe";
const messanger_URL = "https://mm-time.skyeng.tech";
const messregexPattern = new RegExp(`">(${messanger_URL}.*?)<\/a>`);
let varinfraOID; //переменная для хранения значения ID оператора в Infra

const Paragrafsstyles = "color: bisque; font-size: 18px; position: relative; width: 95%; margin-top: 5px; margin-bottom: 5px;";

const buttons = [ //array of buttonsnames
    '.edumodbtn',
    '.teacbtn',
    '.c1sbtn',
    '.schdbtn',
    '.authbtn',
    '.crm2sbtn',
    '.billbtn',
    '.mrktbillbtn',
    '.vimbugsbtn',
    '.vimvidsbtn',
    '.studcabbtn',
    '.chatqabtn',
    '.mobilebugsbtn',
    '.CommProblemsbtn'
];

const otherOptions = [ // array of buttons categories id's, важен порядок размещения, так как иначе может открываться описание не для того канала!
    'teacherssrvdskoptions',
    'crm2srvdskoptions',
    'authsrvdskoptions',
    'schedulesrvdskoptions',
    'c1srvdskoptions',
    'billingsrvdskoptions',
    'mrktbillrvdskoptions',
    'vimbugsoptions',
    'vimvidoptions',
    'studcaboptions',
    'chatqaoptions',
    'edumodeloptions',
    'mobilebugsoptions',
    'CommProblemsoptions'
];

var win_servicedesk = // описание элементов окна Service Desk
    `<div style="display: flex; width: 520px;">
		<span style="width: 520px">
        <span style="cursor: -webkit-grab;">
                <div style="margin: 5px; width: 510px;" id="SrvDskSummary">
                        <button id="hideMeSrvDsk" class="mainButton buttonHide">hide</button>
						<button class="mainButton smallbtn" id="refreshjiraauth" title="Перепроверить авторизацию в Jira">🔄</button>
                        <button class="mainButton smallbtn" id="infratasklist" title="Открыть список своих задач в Infra">📑</button>
						<button class="mainButton smallbtn" id="ServiceDeskinstr" title="Инструкция по этой форме">❓</button>
						<span style="color:bisque">Infra Id:</span>
						<span id="jiratknstatus">🟢</span>
						<span style="color:yellow">Prev.tsk</span>
						<button class="mainButton" id="prevtask" style="width: 85px" title="Предыдущая задача"></button>
						<span style="color:cyan">Last tsk</span>
						<button class="mainButton" id="newtask" style="width: 85px" title="Последняя задача"></button>
                </div>
                <div id="servicedeskinfo" style="margin-left:10px;">
                    <button class="mainButton sdbtn" id="optionTeacher" value="36">👽Teacher&C</button>
                    <button class="mainButton sdbtn" id="optionCRM2" value="26" >🧮CRM2</button>
                    <button class="mainButton sdbtn" id="optionAuth" value="20">🔐Auth</button>
                    <button class="mainButton sdbtn" id="optionSchedule" value="33">📆Schedul</button>
                    <button class="mainButton sdbtn" id="optionOnboarding" value="23">♻Onboard</button>
                    <button class="mainButton sdbtn" id="optionBilling" value="21">💰Billing</button>
                    <button class="mainButton sdbtn" id="optionMrktbill" value="31">📈Mrkt-Bill</button>
                    <button class="mainButton sdbtn" id="optionVimbugs" value="38">🐞Vim-bug</button>
                    <button class="mainButton sdbtn" id="optionVimvideocall" value="39">📸Vid-call</button>
                    <button class="mainButton sdbtn" id="optionStudcab" value="34">👨‍🎓Erp</button>
                    <button class="mainButton sdbtn" id="optionChat" value="24">💬Chat</button>
                    <button class="mainButton sdbtn" id="optionEdModel" value="28">🎓LearnPers</button>
					<button class="mainButton sdbtn" id="optionMobileAppbugs" value="136">📱Mob Bugs</button>
					<button class="mainButton sdbtn" id="optionCommProblems" value="75">📧Comm</button>
                </div>

				<div id="studcabmobbugskoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#erp-mobile-bugs; Cообщаем о проблемах в МП Skysmart Parents и в МП Skyeng главные страницы продуктов</p>
				</div>

				<div id="teacherssrvdskoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#tp-qa-support; канал по вопросам Teacher & Corp пользователей</p>
				</div>

				<div id="crm2srvdskoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#crm2-support</p>
				</div>

				<div id="authsrvdskoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#auth; Обсуждение общих вопросов по проектам Auth/ID (авторизация, роли и доступы, данные пользователей и т. д.)</p>
				</div>

				<div id="schedulesrvdskoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#study-coordinations-qa-support Канал по вопросам расписания ученика, ТТ, TRM, автоподбора и ручного подбора</p>
				</div>

				<div id="billingqasrvdskoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#billing-qa-support; Канал для рассмотрения причины расхождений баланса учеников</p>
				</div>

				<div id="c1srvdskoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#c1-support; Поддержка витрины оплаты (Не виджет оплаты в pcs), Onboarding (Kids&Adult), Scoring, AutoIntroLesson (АвтоВУ)</p>
				</div>

				<div id="billingsrvdskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; top:7px; left:180px; width:90%;">#billing</p>
				</div>

                <div id="mrktbillrvdskoptions" style="display: none; margin-left:20px;">
                    <p style="${Paragrafsstyles}">#mrkt-bill-questions; Канал для вопросов по промокодам, сертификатам, реферальной программе</p>
                </div>

				<div id="vimbugsoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#vim-bugs; Проблемы с Vimbox/Smartroom</p>
				</div>

				<div id="edumodeloptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#learning-personalization-qa-support: Канал для обращений по функционалу learning personalization</p>
				</div>

				<div id="vimvidoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#vim-video-call; Разработка модуля видеосвязи</p>
				</div>

                <div id="chatqaoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles} top:7px;">#chat-qa-support; Решают проблемы с чатами в ЛКП и ЛКУ</p>
                </div>

				 <div id="CommProblemsoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#communication-problems  - вопросы по коммуниациям</p>
				</div>

                <div id="studcaboptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#erp-bugs; Сообщаем о проблемах во взрослом и детском ЛКУ (страницы на домене student.skyeng.ru), в ЛККК и в ЛКП</p>
                </div>

				<div id="academyselfstudysoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#academic-selfstudy-bugs; Канал обработки обращений по ВЕБ тренажерам, расширениями Subtly и Vimbox Переводчик</p>
				</div>

				<div id="mobilebugsoptions" style="display: none; margin-left:20px;">
					<p style="${Paragrafsstyles}">#mobile-app-bugs; Канал обработки обращений по МП Skyeng связанных с обучением.</p>
				</div>

				<div id="buttonsfromtest" style="margin-left: 2%; margin-bottom: 5px; max-height: 200px; overflow-x: hidden; overflow-y: auto;">
				</div>

				<div id="inputfieldsdiv" style="display: none;">
					<select class="" style="height:28px; margin-left: 21px; margin-top: 5px; font-size: 14px; display: none;" id="prioritymbugs">
							<option selected disabled="">Приоритет</option>
							<option value="Blocker">Blocker</option>
							<option value="Critical">Critical</option>
							<option value="High">High</option>
							<option value="Major">Major</option>
							<option value="Minor">Minor</option>
							<option value="Trivial">Trivial</option>
					    </select>
                    <select class="" style="height:28px; width: 90%; font-size: 14px; margin-left: 21px; margin-top: 5px; display: none;" id="categoryCommproblems">
                            <option selected disabled="">Категория проблемы</option>
                        </select>
                    <input id="custom_CMS" placeholder="Ссылка на CMS" class="sdcustfieldformlines removefield " style="margin-left: 21px; display: none;">
					<input id="custom_id" placeholder="ID Пользователей (Id П, Id У)" class="sdcustfieldformlines removefield " style="margin-left: 21px;">
                    <input id="custom_service" placeholder="ID Услуги" class="sdcustfieldformlines removefield " style="margin-left: 21px; display: none;">
                    <input id="custom_hesh" placeholder="Хэш урока" class="sdcustfieldformlines removefield " style="margin-left: 21px; display: none;">
                    <input id="custom_email" placeholder="Почта пользователей" class="sdcustfieldformlines removefield " style="margin-left: 21px; display: none;">
                    <input id="custom_appinfo" placeholder="Приложение / Версия / Платформа" class="sdcustfieldformlines removefield " style="margin-left: 21px; display: none;"></input>
                    <input id="custom_deviceinfo" placeholder="Девайс / ОС" class="sdcustfieldformlines removefield " style="margin-left: 21px; display: none;"></input>
					<textarea id="custom_descr" placeholder="Описание проблемы" class="sdcustfieldformlines removefield " style="margin-left: 21px;"></textarea>
					<textarea id="custom_str" placeholder="Как воспроизвести ошибку?" class="sdcustfieldformlines removefield " style="margin-left: 21px;"></textarea>
					<textarea id="custom_er" placeholder="Ожидаемое поведение" class="sdexpecactual removefield " style="margin-left: 21px;"></textarea>
					<textarea id="custom_ar" placeholder="Фактическое поведение" class="sdexpecactual removefield " style="margin-left: 21px;"></textarea>
					<button class="mainButton" id="createsd" style="width: 150px; position:relative; left:35%; margin-bottom:5px;">Создать</button>
				</div>
	        </span>
		</span>
</div>`;

const wintServDsk = createWindow('AF_ServDsk', 'winTopServDsk', 'winLeftServDsk', win_servicedesk);
const inputsFieldsSD = document.getElementById('inputfieldsdiv');

function getInfraOId() {

    const fetchURL = 'https://api-infra.skyeng.ru/api/v1/session';
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetCheckAuthJira = JSON.parse(response.fetchansver);
            localStorage.setItem('infraOID', otvetCheckAuthJira.id);
            document.getElementById('jiratknstatus').innerText = "🟢"
        }
    })
}

function getprsuplasttask() { //функция для получения ссылки на последний созданный после отправки в канал тикет в джира +

    const prevtask = document.getElementById('prevtask');

    const fetchURL = `https://api-infra.skyeng.ru/api/v1/rs/requests?reporterId=${varinfraOID}&approverId=${varinfraOID}&maxResults=40&page=1`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetInfraHis = JSON.parse(response.fetchansver);
            const prevtsk = otvetInfraHis.items[0].jiraIssueKey;
            prevtask.innerText = prevtsk;
            prevtask.onclick = function () {
                if (prevtask.innerText === "") {
                    console.log('Задача не найдена');
                } else {
                    window.open(`https://jira.skyeng.tech/browse/${prevtsk}`);
                }
            }
        }
    })
}

function getmmlink(lasttsk, activeConvId) {
    if (lasttsk) {
        const fetchURL = `https://jira.skyeng.tech/browse/${lasttsk}`;
        const requestOptions = { method: 'GET' };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) {
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            } else {
                const otvetTimeLink = response.fetchansver;
                const matchResult = otvetTimeLink.match(messregexPattern);
                if (matchResult === null) {
                    setTimeout(function () { getmmlink(lasttsk, activeConvId); }, 2000);
                    return;
                } else {
                    const mmlink = matchResult[1];
                    sendComment(`${messanger_name} link: ${mmlink}`, activeConvId);
                }
            }
        });
    }
}

function MakeFetch(bodyrequst, activeConvId) {
    const fetchURL = 'https://api-infra.skyeng.ru/api/v1/rs/request';
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
        body: bodyrequst,
        mode: 'cors',
        credentials: 'include',
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetCreateIssue = JSON.parse(response.fetchansver);

            const lasttsk = otvetCreateIssue.jiraIssueKey;
            newtask.innerText = lasttsk;
            if (activeConvId) {
                sendComment(`Jira PS link: https://jira.skyeng.tech/browse/${lasttsk}`, activeConvId);
                getmmlink(lasttsk, activeConvId);
            }
            const removefields = document.getElementsByClassName('removefield');
            for (let i = 0; i < removefields.length; i++) {
                removefields[i].value = '';
            }
        }
    })
}

function sendRequest(idstdserv, dscr, str, erx, ary, code, activeConvId) {
    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>', '\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>', '\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>', '\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>', '\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>', '\n'))

    let bodyrequst = formData.toString();
    MakeFetch(bodyrequst, activeConvId);
}

function sendRequestmrktbill(idstdserv, service, dscr, str, erx, ary, code, activeConvId) {
    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>', '\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>', '\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>', '\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>', '\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>', '\n'))
    formData.append('data[serviceId]', decodeURIComponent(idstdserv).replaceAll('<br>', '\n'))

    let bodyrequst = formData.toString();
    MakeFetch(bodyrequst, activeConvId);
}

function sendRequestVimVid(idstdserv, hesh, dscr, str, erx, ary, code, activeConvId) {
    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>', '\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>', '\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>', '\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>', '\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>', '\n'))
    formData.append('data[hashLesson]', hesh)

    let bodyrequst = formData.toString();
    MakeFetch(bodyrequst, activeConvId);
}

function sendRequestCommprob(categoryvalue, usermail, idstdserv, dscr, code, activeConvId) {
    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[category]', decodeURIComponent(categoryvalue).replaceAll('<br>', '\n'))
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>', '\n'))
    formData.append('data[user_id]', decodeURIComponent(idstdserv).replaceAll('<br>', '\n'))
    formData.append('data[user_email]', decodeURIComponent(usermail).replaceAll('<br>', '\n'))

    let bodyrequst = formData.toString();
    MakeFetch(bodyrequst, activeConvId);
}

function sendRequestMobNoPriority(idstdserv, ary, erx, str, dscr, deviceinfo, appinfo, code, activeConvId) {

    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[appInfo]', decodeURIComponent(appinfo).replaceAll('<br>', '\n'))
    formData.append('data[userDeviceInfo]', decodeURIComponent(deviceinfo).replaceAll('<br>', '\n'))
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>', '\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>', '\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>', '\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>', '\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>', '\n'))

    let bodyrequst = formData.toString();
    MakeFetch(bodyrequst, activeConvId);
}

function sendRequestMobWithPriority(priorvalue, appinfo, deviceinfo, dscr, str, erx, ary, idstdserv, code, activeConvId) {

    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[appInfo]', decodeURIComponent(appinfo).replaceAll('<br>', '\n'))
    formData.append('data[userDeviceInfo]', decodeURIComponent(deviceinfo).replaceAll('<br>', '\n'))
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>', '\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>', '\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>', '\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>', '\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>', '\n'))
    formData.append('data[priority]', decodeURIComponent(priorvalue).replaceAll('<br>', '\n'))

    let bodyrequst = formData.toString();
    MakeFetch(bodyrequst, activeConvId);
}

function sendRequestAcademMob(CMSvalue, priorvalue, appinfo, deviceinfo, dscr, str, erx, ary, idstdserv, code, activeConvId) {

    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[cms_link]', CMSvalue);
    formData.append('data[priority]', decodeURIComponent(priorvalue).replaceAll('<br>', '\n'))
    formData.append('data[appInfo]', decodeURIComponent(appinfo).replaceAll('<br>', '\n'))
    formData.append('data[userDeviceInfo]', decodeURIComponent(deviceinfo).replaceAll('<br>', '\n'))
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>', '\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>', '\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>', '\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>', '\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>', '\n'))

    let bodyrequst = formData.toString();
    MakeFetch(bodyrequst, activeConvId);
}

let checkingId = [];
function getthemesfrominfra(categoryId, index) {

    const fetchURL = `https://api-infra.skyeng.ru/api/v1/rs/categories/${categoryId}/request-types`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        } else {
            const otvetListOfTypes = JSON.parse(response.fetchansver);

            checkingId = [];
            for (let i = 0; i < otvetListOfTypes.length; i++) {
                checkingId.push({ id: otvetListOfTypes[i].id, summary: otvetListOfTypes[i].summary });
            }
            buttonsfromtest.innerHTML = ''
            for (let j = 0; j < checkingId.length; j++) {
                buttonsfromtest.innerHTML += `<button class="${buttons[index].replace('.', '')} widthofsd mainButton" value=${checkingId[j].id}>${checkingId[j].summary}</button>`
            }
            buttons.forEach(button => {
                $(button).click(function () {
                    remres(this);
                });
            });
        }
    })
}

function getcommproboptions() {
    const commprobselect = document.getElementById('categoryCommproblems');
    let addoptflag = 0;
    if (commprobselect.length < 2) {

        let infraOID = localStorage.getItem('infraOID')

        const fetchURL = `https://api-infra.skyeng.ru/api/v1/rs/request-types/541/form`;
        const requestOptions = {
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            referrer: 'https://infra.skyeng.ru/',
            body: `{\"reporterId\":${infraOID},\"data\":{}}`,
            method: 'PATCH',
            credentials: 'include'
        };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (response) { // получение информации авторизован пользователь на сайте Datsy или нет
            if (!response.success) {
                alert('Не удалось выполнить запрос: ' + response.error);
                return;
            } else {
                const otvetCategoriesCommunic = JSON.parse(response.fetchansver);

                otvetCategoriesCommunic.forEach((item) => {
                    if (item.label == "Категория проблемы") {
                        const commprobarropt = item.attributes.options;
                        if (addoptflag < commprobarropt.length) {
                            addoptflag = commprobarropt.length;
                            commprobarropt.forEach((option) => {
                                if (option !== '') {
                                    let opt = JSON.stringify(option);
                                    const [value, text] = opt.split(":").map(item => item.replace(/["{\\}]/g, '').trim());
                                    addOption(commprobselect, text, value);
                                }
                            });
                        }
                    }
                });
            }
        })

    }
}

function getservDskPress() { // функция открытия главного окна SD +
    if (document.getElementById('AF_ServDsk').style.display == '') {
        document.getElementById('AF_ServDsk').style.display = 'none'
        document.getElementById('newtask').textContent = ''
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    } else {
        document.getElementById('AF_ServDsk').style.display = ''
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
        document.getElementById('idmymenu').style.display = 'none'
    }

    if (localStorage.getItem('infraOID') == null) {
        document.getElementById('jiratknstatus').innerText = "🔴"
        getInfraOId()
    } else varinfraOID = localStorage.getItem('infraOID');

    setTimeout(getprsuplasttask, 2000)

    const sdbtn = document.getElementsByClassName('sdbtn');
    for (let i = 0; i < sdbtn.length; i++) {
        sdbtn[i].onclick = function () {
            let index = i;
            inputsFieldsSD.style.display = 'none';
            getthemesfrominfra(this.value, index)
            let activeBtnsd = document.getElementsByClassName('activebtnsd');
            for (let j = 0; j < activeBtnsd.length; j++) {
                activeBtnsd[j].classList.remove('activebtnsd');
            }
            this.classList.toggle('activebtnsd');
            let elementId = otherOptions[index];
            document.getElementById(elementId).style.display = "block";

            let otherElements = document.querySelectorAll(otherOptions.filter((_, idx) => idx !== index).map(id => '#' + id).join(', '));
            for (let k = 0; k < otherElements.length; k++) {
                otherElements[k].style.display = 'none';
            }

            updateDisplay(elementId); // Вызов функции обновления отображения здесь
        }
    }

    buttons.forEach(button => {
        $(button).click(function () {
            inputsFieldsSD.style.display = 'none';
            remres(this);
        });
    });

    // Определение функций setDisplayStyleSD и updateDisplay на уровне всей функции getservDskPress
    function setDisplayStyleSD(elementIds, style) {
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = style;
            }
        });
    }

    function setDefaultOptions() {
        const categoryElement = document.getElementById('categoryCommproblems');
        if (categoryElement && categoryElement.children[0]) {
            categoryElement.children[0].selected = true;
        }
    }

    const configSD = {
        academyselfstudysoptions: {
            show: ['prioritymbugs', 'custom_CMS', 'custom_appinfo', 'custom_deviceinfo', 'custom_id', 'custom_descr', 'custom_str', 'custom_er', 'custom_ar'],
            hide: ['categoryCommproblems', 'custom_email', 'custom_hesh', 'custom_service']
        },
        mobilebugsoptions: {
            show: ['prioritymbugs', 'custom_CMS', 'custom_appinfo', 'custom_deviceinfo', 'custom_id', 'custom_descr', 'custom_str', 'custom_er', 'custom_ar'],
            hide: ['categoryCommproblems', 'custom_email', 'custom_hesh', 'custom_service']
        },
        studcabmobbugskoptions: {
            show: ['custom_appinfo', 'custom_deviceinfo', 'custom_id', 'custom_descr', 'custom_str', 'custom_er', 'custom_ar'],
            hide: ['prioritymbugs', 'categoryCommproblems', 'custom_email', 'custom_CMS', 'custom_hesh', 'custom_service']
        },
        CommProblemsoptions: {
            show: ['categoryCommproblems', 'custom_email'],
            hide: ['prioritymbugs', 'custom_appinfo', 'custom_deviceinfo', 'custom_str', 'custom_er', 'custom_ar', 'custom_CMS', 'custom_hesh', 'custom_service'],
            callback: getcommproboptions
        },
        vimvidoptions: {
            show: ['custom_id', 'custom_hesh', 'custom_descr', 'custom_str', 'custom_er', 'custom_ar'],
            hide: ['prioritymbugs', 'custom_appinfo', 'custom_deviceinfo', 'categoryCommproblems', 'custom_email', 'custom_CMS', 'custom_service']
        },
        mrktbillrvdskoptions: {
            show: ['custom_id', 'custom_descr', 'custom_str', 'custom_er', 'custom_ar', 'custom_service'],
            hide: ['prioritymbugs', 'custom_appinfo', 'custom_deviceinfo', 'categoryCommproblems', 'custom_email', 'custom_CMS', 'custom_hesh']
        },
        default: {
            show: ['custom_id', 'custom_descr', 'custom_str', 'custom_er', 'custom_ar'],
            hide: ['prioritymbugs', 'custom_appinfo', 'custom_deviceinfo', 'categoryCommproblems', 'custom_email', 'custom_CMS', 'custom_hesh', 'custom_service']
        }
    };

    function updateDisplay(elementId) {
        const conf = configSD[elementId] || configSD.default;

        setDisplayStyleSD(conf.show, '');
        setDisplayStyleSD(conf.hide, 'none');
        setDefaultOptions();

        if (conf.callback) {
            conf.callback();
        }
    }
}
// tested

document.getElementById('AF_ServDsk').ondblclick = function (a) { // скрытие окна ServiceDesk по двойному клику
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') { document.getElementById('hideMeSrvDsk').click(); }
}

document.getElementById('ServiceDeskinstr').onclick = function () {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-ServiceDesk')
}

document.getElementById('infratasklist').onclick = function () { // открываем список задач оператора в Infra
    window.open('https://infra.skyeng.ru/request/list')
}

document.getElementById('hideMeSrvDsk').onclick = function () { //форма hide
    if (document.getElementById('AF_ServDsk').style.display == '') {

        buttons.forEach(button => {
            $(button).click(function () {
                remres(this);
            });
        });

        document.getElementById('newtask').textContent = ''

        document.getElementById('AF_ServDsk').style.display = 'none'
    }
}

document.getElementById('refreshjiraauth').onclick = getInfraOId; //функция обновления статуса авторизации

function remres(a) { // функция переключения класса по нажатию на кнопку
    let isActive = $(a).hasClass('activebtn');
    let isThemeBtn = $(a).hasClass('sdbtn');

    if (isActive || isThemeBtn) {
        buttons.forEach(button => {
            $(button).show().removeClass('activebtn');
        });
        inputsFieldsSD.style.display = 'none';
    } else {
        buttons.forEach(button => {
            if (button !== a) {
                $(button).hide().removeClass('activebtn');
            }
        });
        $(a).addClass('activebtn').show();
        inputsFieldsSD.style.display = 'block';
    }
}

document.getElementById('createsd').addEventListener('click', function () { //функция создания задачи на сервис деск
    let activeConvId = getChatId();

    let priorityMobile = document.getElementById('prioritymbugs')
    let catcommprob = document.getElementById('categoryCommproblems')
    let usermail = document.getElementById('custom_email')
    let idUser = document.getElementById('custom_id')
    let appInfo = document.getElementById('custom_appinfo')
    let deviceInfo = document.getElementById('custom_deviceinfo')
    let CMSlink = document.getElementById('custom_CMS')
    let lessonHesh = document.getElementById('custom_hesh')
    let userservice = document.getElementById('custom_service')
    let descriptionField = encodeURIComponent(document.getElementById('custom_descr').value.replace(/[\n\t\"]/g, function (match) {
        if (match === '\n') return '<br>';
        if (match === '\t') return '&emsp;';
        if (match === '\"') return '&quot;';
    }))
    let stepsToReproduce = encodeURIComponent(document.getElementById('custom_str').value.replace(/[\n\t\"]/g, function (match) {
        if (match === '\n') return '<br>';
        if (match === '\t') return '&emsp;';
        if (match === '\"') return '&quot;';
    }))
    let expectedResult = encodeURIComponent(document.getElementById('custom_er').value.replace(/[\n\t\"]/g, function (match) {
        if (match === '\n') return '<br>';
        if (match === '\t') return '&emsp;';
        if (match === '\"') return '&quot;';
    }))
    let actualResult = encodeURIComponent(document.getElementById('custom_ar').value.replace(/[\n\t\"]/g, function (match) {
        if (match === '\n') return '<br>';
        if (match === '\t') return '&emsp;';
        if (match === '\"') return '&quot;';
    }))
    let activeButtons = document.querySelectorAll('.activebtn');

    if (catcommprob.style.display == '') {
        for (const button of activeButtons) {
            sendRequestCommprob(catcommprob.value, usermail.value, idUser.value, descriptionField, button.value, activeConvId);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (userservice.style.display == '') {
        for (const button of activeButtons) {
            sendRequestmrktbill(idUser.value, userservice.value, descriptionField, stepsToReproduce, expectedResult, actualResult, button.value, activeConvId);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (lessonHesh.style.display == '') {
        for (const button of activeButtons) {
            sendRequestVimVid(idUser.value, lessonHesh.value, descriptionField, stepsToReproduce, expectedResult, actualResult, button.value, activeConvId);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (priorityMobile.style.display == 'none' && appInfo.style.display == 'none' && deviceInfo.style.display == 'none') {
        for (const button of activeButtons) {
            sendRequest(idUser.value, descriptionField, stepsToReproduce, expectedResult, actualResult, button.value, activeConvId);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (priorityMobile.style.display == '' && appInfo.style.display == '' && deviceInfo.style.display == '' && CMSlink.style.display == '') {
        for (const button of activeButtons) {
            sendRequestAcademMob(CMSlink.value, priorityMobile.value, appInfo.value, deviceInfo.value, descriptionField, stepsToReproduce, expectedResult, actualResult, idUser.value, button.value, activeConvId);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (priorityMobile.style.display == '' && appInfo.style.display == '' && deviceInfo.style.display == '' && CMSlink.style.display == 'none') {
        for (const button of activeButtons) {
            sendRequestMobWithPriority(priorityMobile.value, appInfo.value, deviceInfo.value, descriptionField, stepsToReproduce, expectedResult, actualResult, idUser.value, button.value, activeConvId);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (priorityMobile.style.display == 'none' && appInfo.style.display == '' && deviceInfo.style.display == '') {
        for (const button of activeButtons) {
            sendRequestMobNoPriority(idUser.value, actualResult, expectedResult, stepsToReproduce, descriptionField, deviceInfo.value, appInfo.value, button.value, activeConvId);
            console.log(`Selected topic: ${button.innerText}`);
        }
    }
});
//End of script