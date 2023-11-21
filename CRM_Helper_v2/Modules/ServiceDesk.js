//Global variables
let jiratoken;
let jiratokennew;
let responsejira;
let psarr = [];
let firstEl;
let mmlink;
const messanger_name = "TiMe";
const messanger_URL = "https://mm-time.skyeng.tech";
const messregexPattern = new RegExp(`">(${messanger_URL}.*?)<\/a>`);
// let infoarr;
let lasttsk;
let prevtsk;
let flagpsis = 0;
let msgissnd = 0;
let varinfraOID; //переменная для хранения значения ID оператора в Infra
const responseTextarea1 = document.getElementById('responseTextarea1');
const responseTextarea2 = document.getElementById('responseTextarea2');
const responseTextarea3 = document.getElementById('responseTextarea3');
const sendResponse = document.getElementById('sendResponse');

const buttons = [ //array of buttonsnames
    '.edumodbtn',
    '.bilqabtn',
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
    '.tripwbtn',
    '.mobbugsbtn',
    '.academymobbugsbtn',
    '.stcabmbsbtn',
    '.CommProblemsbtn',
    '.analystbtn'
];

const otherOptions = [ // array of buttons categories id's
    'teacherssrvdskoptions',
    'crm2srvdskoptions',
    'authsrvdskoptions',
    'schedulesrvdskoptions',
    'billingqasrvdskoptions',
    'c1srvdskoptions',
    'billingsrvdskoptions',
    'mrktbillrvdskoptions',
    'vimbugsoptions',
    'vimvidoptions',
    'studcaboptions',
    'chatqaoptions',
    'tripwireoptions',
    'edumodeloptions',
    'studcabmobbugskoptions',
    'mobbugsoptions',
    'academymobbugsoptions',
    'CommProblemsoptions',
    'analystoptions'
];

var win_servicedesk = // описание элементов окна Service Desk
    `<div class="maindivst" style="display: flex; width: 520px;">
		<span style="width: 520px">
        <span style="cursor: -webkit-grab;">
                <div style="margin: 5px; width: 510px;" id="SrvDskSummary">
                        <button class="buttonHide" title="скрывает меню" id="hideMeSrvDsk">hide</button>
						<button class="btnCRM btnCRMsmall" id="refreshjiraauth" title="Перепроверить авторизацию в Jira">🔄</button>
                        <button class="btnCRM btnCRMsmall" id="infratasklist" title="Открыть список своих задач в Infra">📑</button>
						<button class="btnCRM btnCRMsmall" id="ServiceDeskinstr" title="Инструкция по этой форме">❓</button>
						<span class="spanCRM" style="color:bisque">Infra Id:</span>
						<span class="spanCRM" id="jiratknstatus">🟢</span>
						<span class="spanCRM" style="color:yellow">Prev.tsk</span>
						<button class="btnCRM" id="prevtask" style="width: 85px" title="Предыдущая задача"></button>
						<span class="spanCRM" style="color:cyan">Last tsk</span>
						<button class="btnCRM" id="newtask" style="width: 85px" title="Последняя задача"></button>
                </div>
                <div id="servicedeskinfo" style="margin-left:10px;">
                    <button class="sdbtn btnCRM" id="optionTeacher" value="36">👺Corp</button>
                    <button class="sdbtn btnCRM" id="optionCRM2" value="26">🧮CRM2</button>
                    <button class="sdbtn btnCRM" id="optionAuth" value="20">🔐Auth</button>
                    <button class="sdbtn btnCRM" id="optionSchedule" value="33">📆Schedul</button>
                    <button class="sdbtn btnCRM" id="optionBillingQA" value="22">💲Billing-QA</button>
                    <button class="sdbtn btnCRM" id="optionOnboarding" value="23">♻Onboard</button>
                    <button class="sdbtn btnCRM" id="optionBilling"  value="21">💰Billing</button>
                    <button class="sdbtn btnCRM" id="optionMrktbill"  value="31">📈Mrkt-Bill</button>
                    <button class="sdbtn btnCRM" id="optionVimbugs" value="38">🐞Vim-bug</button>
                    <button class="sdbtn btnCRM" id="optionVimvideocall" value="39">📸Vid-call</button>
                    <button class="sdbtn btnCRM" id="optionStudcab" value="34">👨‍🎓Studcab</button>
                    <button class="sdbtn btnCRM" id="optionChat" value="24">💬Chat</button>
                    <button class="sdbtn btnCRM" id="optionTripwire" value="27">🗣Tripwire</button>
                    <button class="sdbtn btnCRM" id="optionEdModel" value="28">🎓SmartL</button>
                    <button class="sdbtn btnCRM" id="optionStudcabmobbugs" value="35">👨‍🎓📱Bugs</button>
					<button class="sdbtn btnCRM" id="optionMobbugs" value="30">📱Mobil bug</button>
                    <button class="sdbtn btnCRM" id="optionAcademymobbugs" value="19">🅰📱🐞</button>
                    <button class="sdbtn btnCRM" id="optionCommProblems" value="75">📧Comm</button>
                    <button class="sdbtn btnCRM" id="optionAnalyst"  value="18" style="display: none;">TEST</button>
                </div>
				<div id="studcabmobbugskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#student-cabinet-mobile-bugs; Cообщаем о проблемах в МП Skysmart Parents и в МП Skyeng главные страницы продуктов</p>

				</div>

				<div id="teacherssrvdskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#promise-keepers-qa-support; канал по вопросам corp учеников</p>

				</div>
				<div id="crm2srvdskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#crm2-support</p>

				</div>
				<div id="authsrvdskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#auth; Обсуждение общих вопросов по проектам Auth/ID (авторизация, роли и доступы, данные пользователей и т. д.)</p>

				</div>
				<div id="schedulesrvdskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#study-coordinations-qa-support Канал по вопросам расписания ученика, ТТ, TRM, автоподбора и ручного подбора</p>

				</div>
				<div id="billingqasrvdskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#billing-qa-support; Канал для рассмотрения причины расхождений баланса учеников</p>

				</div>
				<div id="c1srvdskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#c1-support; Поддержка витрины оплаты (Не виджет оплаты в pcs), Onboarding (Kids&Adult), Scoring, AutoIntroLesson (АвтоВУ)</p>

				</div>
				<div id="billingsrvdskoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; top:7px; width:95%;margin-top: 5px;margin-bottom: 5px;">#billing</p>

				</div>
                <div id="mrktbillrvdskoptions" style="display: none; margin-left:20px;">
                    <p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#mrkt-bill-questions; Канал для вопросов по промокодам, сертификатам, реферальной программе</p>

                </div>
				<div id="vimbugsoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#vim-bugs; Проблемы с Vimbox/Smartroom</p>

				</div>				
				<div id="edumodeloptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#smart-learning-qa-support: Канал для обращений по функционалу Educational Model</p>

				</div>
				<div id="vimvidoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#vim-video-call; Разработка модуля видеосвязи</p>

				</div>
                <div id="chatqaoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque; font-size:18px; position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#chat-qa-support; Решают проблемы с чатами в ЛКП и ЛКУ</p>

                </div>
				<div id="tripwireoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#eco-tripwire-bugs; Life, Talks, РК adults, расширение переводчик для браузера</p>

				</div>
				<div id="analystoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#analysts-gm-tl; канал МЕРТВЫЙ НЕ ИСПОЛЬЗУЕМ В РАБОТЕ, ЭТО НЕ ШУТКА!, ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ!</p>

				</div>
				<div id="mobbugsoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#mobile-bugs; Канал обработки обращений по мобильному приложению Skyeng и Teachers.</p>

				</div>

				<div id="academymobbugsoptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#academic-mobile-bugs; Канал обработки обращений по МП Skyeng связанных с обучением.</p>

				</div>

                <div id="CommProblemsoptions" style="display: none; margin-left:20px;">
                    <p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;"">#communication-problems</p>

                </div>

                <div id="studcaboptions" style="display: none; margin-left:20px;">
					<p style="color:bisque;font-size:18px;position:relative; width:95%;margin-top: 5px;margin-bottom: 5px;">#student-cabinet-bugs; Сообщаем о проблемах во взрослом и детском ЛКУ (страницы на домене student.skyeng.ru), в ЛККК и в ЛКП</p>

                </div>
								
				<div id="buttonsfromtest" style="margin-left: 2%; margin-bottom: 5px; max-height: 200px; overflow-x: hidden; overflow-y: auto;">
				</div>

				<div id="inputfieldsdiv" style="display: none;">
					<select class="inputCRM" style="height:28px; margin-left: 21px; margin-top: 5px; display: none;" id="prioritymbugs">
							<option selected disabled="">Приоритет</option>
							<option value="Blocker">Blocker</option>
							<option value="Critical">Critical</option>
							<option value="High">High</option>
							<option value="Major">Major</option>
							<option value="Minor">Minor</option>
							<option value="Trivial">Trivial</option>
					    </select>
                    <select class="inputCRM" style="height:28px; margin-left: 21px; margin-top: 5px; width: 476px; display: none;" id="categoryCommproblems">
                            <option selected disabled="">Категория проблемы</option>
                        </select>
                    <input id="custom_CMS" placeholder="Ссылка на CMS" class="inputCRM sdcustfieldformlines removefield" style="margin-left: 21px; display: none;">
                    <input id="custom_id" placeholder="ID Пользователей (Id П, Id У)" class="inputCRM sdcustfieldformlines removefield" style="margin-left: 21px;">
                    <input id="custom_service" placeholder="ID Услуги" class="inputCRM sdcustfieldformlines removefield" style="margin-left: 21px; display: none;">
                    <input id="custom_hesh" placeholder="Хэш урока" class="inputCRM sdcustfieldformlines removefield" style="margin-left: 21px; display: none;">
                    <input id="custom_email" placeholder="Почта пользователей" class="inputCRM sdcustfieldformlines removefield" style="margin-left: 21px; display: none;">
                    <input id="custom_appinfo" placeholder="Приложение / Версия / Платформа" class="inputCRM sdcustfieldformlines removefield" style="margin-left: 21px; display: none;"></input>
                    <input id="custom_deviceinfo" placeholder="Девайс / ОС" class="inputCRM sdcustfieldformlines removefield" style="margin-left: 21px; display: none;"></input>
					<textarea id="custom_descr" placeholder="Описание проблемы" class="textareaCRM sdcustfieldformlines removefield" style="margin-left: 21px;"></textarea>
					<textarea id="custom_str" placeholder="Как воспроизвести ошибку?" class="textareaCRM sdcustfieldformlines removefield" style="margin-left: 21px;"></textarea>
					<textarea id="custom_er" placeholder="Ожидаемое поведение" class="textareaCRM sdexpecactual removefield" style="margin-left: 21px;"></textarea>
					<textarea id="custom_ar" placeholder="Фактическое поведение" class="textareaCRM sdexpecactual removefield" style="margin-left: 21px;"></textarea>
					<button class="btnCRM" id="createsd" style="width: 150px; position:relative; left:35%; margin-bottom:5px;">Создать</button>
                    <button class="btnCRM btnCRMsmall" title="Очищает поля для ввода" onclick ="clearfields()" style="float: right; margin-right:25px;"margin-bottom:5px;>🧹</button>
				</div>
	        </span>
		</span>
</div>`;

//func getOperInfraId
function getInfraOId() {
	responseTextarea1.value = `{}`
    responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/session";
    responseTextarea3.value = 'infradata'
    sendResponse.click()
	
	responseTextarea1.addEventListener("DOMSubtreeModified", function () {
        const rsparray = JSON.parse(responseTextarea1.getAttribute('infradata'));
        if (rsparray) {
			localStorage.setItem('infraOID',rsparray.id);
			document.getElementById('jiratknstatus').innerText = "🟢"
        }
        responseTextarea1.removeAttribute('infradata');
    });
}

function getprsuplasttask() { //функция для получения ссылки на последний созданный после отправки в канал тикет в джира +
    const prevtask = document.getElementById('prevtask');

    responseTextarea1.value = `{}`;
    responseTextarea2.value = `https://api-infra.skyeng.ru/api/v1/rs/requests?reporterId=${varinfraOID}&approverId=${varinfraOID}&maxResults=40&page=1`;
    responseTextarea3.value = 'pstickets';
    sendResponse.click();

    responseTextarea1.addEventListener("DOMSubtreeModified", function () {
        const psarr = JSON.parse(responseTextarea1.getAttribute('pstickets'));
        if (psarr) {
            prevtsk = psarr.items[0].jiraIssueKey;
            prevtask.innerText = prevtsk;

            prevtask.onclick = function () {
                if (prevtask.innerText === "") {
                    console.log('Задача не найдена');
                } else {
                    window.open(`https://jira.skyeng.tech/browse/${prevtsk}`);
                }
            }
        }
        responseTextarea1.removeAttribute('pstickets');
    });
}

function getmmlink() {
	        if (newtask.innerText != '') {
            responseTextarea1.value = `{}`
            responseTextarea2.value = "https://jira.skyeng.tech/browse/" + newtask.innerText ;
            responseTextarea3.value = 'mmlinkhere'
            sendResponse.click()
			
			    responseTextarea1.addEventListener("DOMSubtreeModified", function () {
				const infoarr = responseTextarea1.getAttribute('mmlinkhere');
				if (infoarr) {
                    mmlink = infoarr.match(messregexPattern)[1];
					console.log("Jira PS link:" + ' ' + "https://jira.skyeng.tech/browse/" + lasttsk);
                    console.log(`${messanger_name} link ${mmlink}`);
                    document.getElementById('custom_ar').value = "Jira PS link:" + ' ' + "https://jira.skyeng.tech/browse/" + lasttsk + "\n" + messanger_name + " link: " + mmlink;
				}
				responseTextarea1.removeAttribute('mmlinkhere');
			});

        } else console.log("Задача не была создана, поэтому в заметки нечего размещать")
}

function sendRequest(idstdserv, dscr, str, erx, ary, code) {
  let formData = new URLSearchParams();
  formData.append('requestTypeId', code);
  formData.append('reporterId', varinfraOID);
  formData.append('initiatorId', varinfraOID);
  formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>','\n'))
  formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>','\n'))
  formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>','\n'))
  formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>','\n'))
  formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>','\n'))

  let requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    mode: 'cors',
    credentials: 'include',
  };

  let requestOptionsString = JSON.stringify(requestOptions);

  responseTextarea1.value = requestOptionsString;
  responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/rs/request";
  responseTextarea3.value = 'responseRequest';

  // логируем входящие переменные и значение полей отправки запроса
  console.log(`${idstdserv} ${dscr} ${str} ${erx} ${ary} ${code}`);
  console.log(responseTextarea1.value);
  console.log(responseTextarea2.value);

  sendResponse.click();
    
      responseTextarea1.addEventListener("DOMSubtreeModified", function () {
        const reqvarr = JSON.parse(responseTextarea1.getAttribute('responseRequest'));
        if (reqvarr) {
            lasttsk = reqvarr.jiraIssueKey;
            newtask.innerText = lasttsk;
			
			const removefields = document.getElementsByClassName('removefield');
            for (let i = 0; i < removefields.length; i++) {
                removefields[i].value = '';
            }
        }
        responseTextarea1.removeAttribute('responseRequest');
    });

   setTimeout(getmmlink, 8000);
}

function sendRequestVimVid(idstdserv, hesh, dscr, str, erx, ary, code) {
    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>','\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>','\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>','\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>','\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>','\n'))
    formData.append('data[hashLesson]', hesh)
  
    let requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      mode: 'cors',
      credentials: 'include',
    };
  
    let requestOptionsString = JSON.stringify(requestOptions);
  
    responseTextarea1.value = requestOptionsString;
    responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/rs/request";
    responseTextarea3.value = 'responseRequest';
  
    // логируем входящие переменные и значение полей отправки запроса
    console.log(`${idstdserv} ${hesh} ${dscr} ${str} ${erx} ${ary} ${code}`);
    console.log(responseTextarea1.value);
    console.log(responseTextarea2.value);
  
    sendResponse.click();
      
        responseTextarea1.addEventListener("DOMSubtreeModified", function () {
          const reqvarr = JSON.parse(responseTextarea1.getAttribute('responseRequest'));
          if (reqvarr) {
              lasttsk = reqvarr.jiraIssueKey;
              newtask.innerText = lasttsk;
              
              const removefields = document.getElementsByClassName('removefield');
              for (let i = 0; i < removefields.length; i++) {
                  removefields[i].value = '';
              }
          }
          responseTextarea1.removeAttribute('responseRequest');
      });
  
     setTimeout(getmmlink, 8000);
  }

function sendRequestmrktbill(idstdserv, service, dscr, str, erx, ary, code) {
    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>','\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>','\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>','\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>','\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>','\n'))
    formData.append('data[serviceId]', decodeURIComponent(idstdserv).replaceAll('<br>','\n'))
  
    let requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      mode: 'cors',
      credentials: 'include',
    };
  
    let requestOptionsString = JSON.stringify(requestOptions);
  
    responseTextarea1.value = requestOptionsString;
    responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/rs/request";
    responseTextarea3.value = 'responseRequest';
  
    // логируем входящие переменные и значение полей отправки запроса
    console.log(`${idstdserv} ${service} ${dscr} ${str} ${erx} ${ary} ${code}`);
    console.log(responseTextarea1.value);
    console.log(responseTextarea2.value);
  
    sendResponse.click();
      
        responseTextarea1.addEventListener("DOMSubtreeModified", function () {
          const reqvarr = JSON.parse(responseTextarea1.getAttribute('responseRequest'));
          if (reqvarr) {
              lasttsk = reqvarr.jiraIssueKey;
              newtask.innerText = lasttsk;
              
              const removefields = document.getElementsByClassName('removefield');
              for (let i = 0; i < removefields.length; i++) {
                  removefields[i].value = '';
              }
          }
          responseTextarea1.removeAttribute('responseRequest');
      });
  
     setTimeout(getmmlink, 8000);
  }

function sendRequestCommprob(categoryvalue, usermail, idstdserv, dscr, code) {
    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[category]', decodeURIComponent(categoryvalue).replaceAll('<br>','\n'))
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>','\n'))
    formData.append('data[user_id]', decodeURIComponent(idstdserv).replaceAll('<br>','\n'))
    formData.append('data[user_email]', decodeURIComponent(usermail).replaceAll('<br>','\n'))    
  
    let requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      mode: 'cors',
      credentials: 'include',
    };
  
    let requestOptionsString = JSON.stringify(requestOptions);
  
    responseTextarea1.value = requestOptionsString;
    responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/rs/request";
    responseTextarea3.value = 'responseRequest';
  
    // логируем входящие переменные и значение полей отправки запроса
    console.log(`${idstdserv} ${dscr} ${categoryvalue} ${usermail} ${code}`);
    console.log(responseTextarea1.value);
    console.log(responseTextarea2.value);
  
    sendResponse.click();
      
        responseTextarea1.addEventListener("DOMSubtreeModified", function () {
          const reqvarr = JSON.parse(responseTextarea1.getAttribute('responseRequest'));
          if (reqvarr) {
              lasttsk = reqvarr.jiraIssueKey;
              newtask.innerText = lasttsk;
              
              const removefields = document.getElementsByClassName('removefield');
              for (let i = 0; i < removefields.length; i++) {
                  removefields[i].value = '';
              }
              document.getElementById('categoryCommproblems').children[0].selected = true;
          }
          responseTextarea1.removeAttribute('responseRequest');
      });
  
     setTimeout(getmmlink, 8000);
}

let checkingId = [];
function getthemesfrominfra(categoryId,index) {
  responseTextarea1.value = '{}';
  responseTextarea2.value = `https://api-infra.skyeng.ru/api/v1/rs/categories/${categoryId}/request-types`;
  responseTextarea3.value = 'sendrequest';

  sendResponse.click();

  responseTextarea1.addEventListener("DOMSubtreeModified", function () {
    const reqvarr = JSON.parse(responseTextarea1.getAttribute('sendrequest'));
    if (reqvarr) {
      checkingId = [];
      for (let i = 0; i < reqvarr.length; i++) {
        checkingId.push({ id: reqvarr[i].id, summary: reqvarr[i].summary });
      }
	  buttonsfromtest.innerHTML = ''
	  for (let j=0; j<checkingId.length; j++) {
			buttonsfromtest.innerHTML += `<button class="${buttons[index].replace('.','')} widthofsd" value=${checkingId[j].id}>${checkingId[j].summary}</button>`
		}
	      buttons.forEach(button => {
        $(button).click(function () {
            remres(this);
        });
    });
    }
    responseTextarea1.removeAttribute('sendrequest');
  });
}

function getcommproboptions(){
    const commprobselect = document.getElementById('categoryCommproblems');
    let addoptflag = 0;
    if (commprobselect.length < 2){
    
    let infraOID = localStorage.getItem('infraOID')
    const requestopt = {
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        referrer: 'https://infra.skyeng.ru/',
        body: `{\"reporterId\":${infraOID},\"data\":{}}`,
        method: 'PATCH',
        credentials: 'include'
    };

        responseTextarea1.value = JSON.stringify(requestopt);
        responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/rs/request-types/541/form";
        responseTextarea3.value = 'getoptionscomm';
      
        sendResponse.click();
      
        responseTextarea1.addEventListener("DOMSubtreeModified", function () {
            const commprobarr = JSON.parse(responseTextarea1.getAttribute('getoptionscomm'));
            if (commprobarr !== '') {
                commprobarr.forEach((item) => {
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
                    responseTextarea1.removeAttribute('getoptionscomm');
                    }
                  }); 
            }
        });
    }
}

function sendRequestMobNoPriority(idstdserv, ary, erx, str, dscr, deviceinfo , appinfo, code) {
		
  let formData = new URLSearchParams();
  formData.append('requestTypeId', code);
  formData.append('reporterId', varinfraOID);
  formData.append('initiatorId', varinfraOID);
  formData.append('data[appInfo]', decodeURIComponent(appinfo).replaceAll('<br>','\n'))
  formData.append('data[userDeviceInfo]', decodeURIComponent(deviceinfo).replaceAll('<br>','\n'))
  formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>','\n'))
  formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>','\n'))
  formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>','\n'))
  formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>','\n'))
  formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>','\n'))

  let requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    mode: 'cors',
    credentials: 'include',
  };

  let requestOptionsString = JSON.stringify(requestOptions);

  responseTextarea1.value = requestOptionsString;
  responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/rs/request";
  responseTextarea3.value = 'responseRequest';
	

    // логируем входящие переменные и значение полей отправки запроса
    console.log(appinfo + " " + deviceinfo + " " + dscr + " " + str + " " + erx + " " + ary + " " + idstdserv + " " + code)

    sendResponse.click()
	
	      responseTextarea1.addEventListener("DOMSubtreeModified", function () {
        const reqvarr = JSON.parse(responseTextarea1.getAttribute('responseRequest'));
        if (reqvarr) {
            lasttsk = reqvarr.jiraIssueKey;
            newtask.innerText = lasttsk;
			
			const removefields = document.getElementsByClassName('removefield');
            for (let i = 0; i < removefields.length; i++) {
                removefields[i].value = '';
            }
        }
        responseTextarea1.removeAttribute('responseRequest');
    });

    setTimeout(getmmlink, 8000);
}

function sendRequestMobWithPriority(priorvalue, appinfo, deviceinfo, dscr, str, erx, ary, idstdserv, code) {
	
  let formData = new URLSearchParams();
  formData.append('requestTypeId', code);
  formData.append('reporterId', varinfraOID);
  formData.append('initiatorId', varinfraOID);
  formData.append('data[appInfo]', decodeURIComponent(appinfo).replaceAll('<br>','\n'))
  formData.append('data[userDeviceInfo]', decodeURIComponent(deviceinfo).replaceAll('<br>','\n'))
  formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>','\n'))
  formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>','\n'))
  formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>','\n'))
  formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>','\n'))
  formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>','\n'))
  formData.append('data[priority]', decodeURIComponent(priorvalue).replaceAll('<br>','\n'))

  let requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
    mode: 'cors',
    credentials: 'include',
  };

  let requestOptionsString = JSON.stringify(requestOptions);

  responseTextarea1.value = requestOptionsString;
  responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/rs/request";
  responseTextarea3.value = 'responseRequest';
	
	
    // логируем входящие переменные и значение полей отправки запроса
    console.log(priorvalue + " " + appinfo + " " + deviceinfo + " " + dscr + " " + str + " " + erx + " " + ary + " " + idstdserv + " " + code)

    sendResponse.click()
	
	      responseTextarea1.addEventListener("DOMSubtreeModified", function () {
        const reqvarr = JSON.parse(responseTextarea1.getAttribute('responseRequest'));
        if (reqvarr) {
            lasttsk = reqvarr.jiraIssueKey;
            newtask.innerText = lasttsk;
			
			const removefields = document.getElementsByClassName('removefield');
            for (let i = 0; i < removefields.length; i++) {
                removefields[i].value = '';
            }
        }
        responseTextarea1.removeAttribute('responseRequest');
    });

    setTimeout(getmmlink, 8000);
}

function sendRequestAcademMob(CMSvalue, priorvalue, appinfo, deviceinfo, dscr, str, erx, ary, idstdserv, code) {
	
    let formData = new URLSearchParams();
    formData.append('requestTypeId', code);
    formData.append('reporterId', varinfraOID);
    formData.append('initiatorId', varinfraOID);
    formData.append('data[cms_link]', CMSvalue);
	formData.append('data[priority]', decodeURIComponent(priorvalue).replaceAll('<br>','\n'))
    formData.append('data[appInfo]', decodeURIComponent(appinfo).replaceAll('<br>','\n'))
    formData.append('data[userDeviceInfo]', decodeURIComponent(deviceinfo).replaceAll('<br>','\n'))
    formData.append('data[description]', decodeURIComponent(dscr).replaceAll('<br>','\n'))
    formData.append('data[reproduceSteps]', decodeURIComponent(str).replaceAll('<br>','\n'))
    formData.append('data[expectedResult]', decodeURIComponent(erx).replaceAll('<br>','\n'))
    formData.append('data[actualResult]', decodeURIComponent(ary).replaceAll('<br>','\n'))
    formData.append('data[userIds]', decodeURIComponent(idstdserv).replaceAll('<br>','\n'))
  
    let requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
      mode: 'cors',
      credentials: 'include',
    };
  
    let requestOptionsString = JSON.stringify(requestOptions);
  
    responseTextarea1.value = requestOptionsString;
    responseTextarea2.value = "https://api-infra.skyeng.ru/api/v1/rs/request";
    responseTextarea3.value = 'responseRequest';
      
      
      // логируем входящие переменные и значение полей отправки запроса
      console.log(CMSvalue + " "  + priorvalue + " " + appinfo + " " + deviceinfo + " " + dscr + " " + str + " " + erx + " " + ary + " " + idstdserv + " " + code)
  
      sendResponse.click()
      
            responseTextarea1.addEventListener("DOMSubtreeModified", function () {
          const reqvarr = JSON.parse(responseTextarea1.getAttribute('responseRequest'));
          if (reqvarr) {
              lasttsk = reqvarr.jiraIssueKey;
              newtask.innerText = lasttsk;
              
              const removefields = document.getElementsByClassName('removefield');
              for (let i = 0; i < removefields.length; i++) {
                  removefields[i].value = '';
              }
          }
          responseTextarea1.removeAttribute('responseRequest');
      });
  
      setTimeout(getmmlink, 8000);
  }

//main

if (localStorage.getItem('winTopSrvDskCRM') == null) { // начальное положение окна Service Desk
    localStorage.setItem('winTopSrvDskCRM', '120');
    localStorage.setItem('winLeftSrvDskCRM', '295');
}

let wintSrvDskCRM = document.createElement('div'); // создание окна ServiceDesk
document.body.append(wintSrvDskCRM);
wintSrvDskCRM.style = 'min-height: 165px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopSrvDskCRM') + 'px; left: ' + localStorage.getItem('winLeftSrvDskCRM') + 'px; font-size: 14px; z-index: 21; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintSrvDskCRM.style.display = 'none';
wintSrvDskCRM.setAttribute('id', 'CRMServDsk');
wintSrvDskCRM.innerHTML = win_servicedesk;

const inputsFieldsSD = document.getElementById('inputfieldsdiv');
var listenerSrvDskCRM = function (e, a) { // сохранение позиции окна ServiceDesk
    wintSrvDskCRM.style.left = Number(e.clientX - myX12) + "px";
    wintSrvDskCRM.style.top = Number(e.clientY - myY12) + "px";
    localStorage.setItem('winTopSrvDskCRM', String(Number(e.clientY - myY12)));
    localStorage.setItem('winLeftSrvDskCRM', String(Number(e.clientX - myX12)));
};

wintSrvDskCRM.onmousedown = function (a) { // изменение позиции окна ServiceDesk
    if (checkelementtype(a)) {
        window.myX12 = a.layerX;
        window.myY12 = a.layerY;
        document.addEventListener('mousemove', listenerSrvDskCRM);
    }
}
wintSrvDskCRM.onmouseup = function () { document.removeEventListener('mousemove', listenerSrvDskCRM); } // прекращение изменения позиции окна ServiceDesk

document.getElementById('SrvDskCRMbtn').onclick = function () { // функция открытия главного окна SD +
    if (document.getElementById('CRMServDsk').style.display == '') {
        document.getElementById('CRMServDsk').style.display = 'none'
        document.getElementById('idmymenucrm').style.display = 'none'
        document.getElementById('newtask').textContent = ''
        lasttsk = '';
    } else {
        document.getElementById('CRMServDsk').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'
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
			getthemesfrominfra(this.value,index)
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

            if (elementId === "academymobbugsoptions") {
                document.getElementById('prioritymbugs').style.display = '';
                document.getElementById('custom_CMS').style.display = '';
                document.getElementById('custom_appinfo').style.display = '';
                document.getElementById('custom_deviceinfo').style.display = '';
                document.getElementById('custom_id').style.display = '';
                document.getElementById('custom_descr').style.display = '';
                document.getElementById('custom_str').style.display = '';
                document.getElementById('custom_er').style.display = '';
                document.getElementById('custom_ar').style.display = '';
                document.getElementById('categoryCommproblems').style.display = 'none';
                document.getElementById('categoryCommproblems').children[0].selected = true
                document.getElementById('custom_email').style.display = 'none';
                document.getElementById('custom_hesh').style.display = 'none';
                document.getElementById('custom_service').style.display = 'none';
            }else if (elementId === "mobbugsoptions") {
                document.getElementById('prioritymbugs').style.display = '';
                document.getElementById('custom_appinfo').style.display = '';
                document.getElementById('custom_deviceinfo').style.display = '';
                document.getElementById('custom_id').style.display = '';
                document.getElementById('custom_descr').style.display = '';
                document.getElementById('custom_str').style.display = '';
                document.getElementById('custom_er').style.display = '';
                document.getElementById('custom_ar').style.display = '';
                document.getElementById('categoryCommproblems').style.display = 'none';
                document.getElementById('categoryCommproblems').children[0].selected = true
                document.getElementById('custom_email').style.display = 'none';
                document.getElementById('custom_CMS').style.display = 'none';
                document.getElementById('custom_hesh').style.display = 'none';
                document.getElementById('custom_service').style.display = 'none';
            } else if (elementId === 'studcabmobbugskoptions') {
                document.getElementById('custom_appinfo').style.display = '';
                document.getElementById('custom_deviceinfo').style.display = '';
                document.getElementById('custom_id').style.display = '';
                document.getElementById('custom_descr').style.display = '';
                document.getElementById('custom_str').style.display = '';
                document.getElementById('custom_er').style.display = '';
                document.getElementById('custom_ar').style.display = '';
                document.getElementById('prioritymbugs').style.display = 'none';
                document.getElementById('categoryCommproblems').style.display = 'none';
                document.getElementById('categoryCommproblems').children[0].selected = true
                document.getElementById('custom_email').style.display = 'none';
                document.getElementById('custom_CMS').style.display = 'none';
                document.getElementById('custom_hesh').style.display = 'none';
                document.getElementById('custom_service').style.display = 'none';
            } else if(elementId === 'CommProblemsoptions') {
                getcommproboptions();
                document.getElementById('categoryCommproblems').style.display = '';
                document.getElementById('custom_email').style.display = '';
                document.getElementById('prioritymbugs').style.display = 'none';
                document.getElementById('custom_appinfo').style.display = 'none';
                document.getElementById('custom_deviceinfo').style.display = 'none';
                document.getElementById('custom_str').style.display = 'none';
                document.getElementById('custom_er').style.display = 'none';
                document.getElementById('custom_ar').style.display = 'none';
                document.getElementById('custom_CMS').style.display = 'none';
                document.getElementById('custom_hesh').style.display = 'none';
                document.getElementById('custom_service').style.display = 'none';
            } else if (elementId === 'vimvidoptions') {
                document.getElementById('custom_id').style.display = '';
                document.getElementById('custom_hesh').style.display = '';
                document.getElementById('custom_descr').style.display = '';
                document.getElementById('custom_str').style.display = '';
                document.getElementById('custom_er').style.display = '';
                document.getElementById('custom_ar').style.display = '';
                document.getElementById('prioritymbugs').style.display = 'none';
                document.getElementById('custom_appinfo').style.display = 'none';
                document.getElementById('custom_deviceinfo').style.display = 'none';
                document.getElementById('categoryCommproblems').style.display = 'none';
                document.getElementById('categoryCommproblems').children[0].selected = true
                document.getElementById('custom_email').style.display = 'none';
                document.getElementById('custom_CMS').style.display = 'none';
                document.getElementById('custom_service').style.display = 'none';
            } else if (elementId === 'mrktbillrvdskoptions') {
                document.getElementById('custom_id').style.display = '';
                document.getElementById('custom_descr').style.display = '';
                document.getElementById('custom_str').style.display = '';
                document.getElementById('custom_er').style.display = '';
                document.getElementById('custom_ar').style.display = '';
                document.getElementById('custom_service').style.display = '';
                document.getElementById('prioritymbugs').style.display = 'none';
                document.getElementById('custom_appinfo').style.display = 'none';
                document.getElementById('custom_deviceinfo').style.display = 'none';
                document.getElementById('categoryCommproblems').style.display = 'none';
                document.getElementById('categoryCommproblems').children[0].selected = true
                document.getElementById('custom_email').style.display = 'none';
                document.getElementById('custom_CMS').style.display = 'none';
                document.getElementById('custom_hesh').style.display = 'none';
            } else {
                document.getElementById('custom_id').style.display = '';
                document.getElementById('custom_descr').style.display = '';
                document.getElementById('custom_str').style.display = '';
                document.getElementById('custom_er').style.display = '';
                document.getElementById('custom_ar').style.display = '';
                document.getElementById('prioritymbugs').style.display = 'none';
                document.getElementById('custom_appinfo').style.display = 'none';
                document.getElementById('custom_deviceinfo').style.display = 'none';
                document.getElementById('categoryCommproblems').style.display = 'none';
                document.getElementById('categoryCommproblems').children[0].selected = true
                document.getElementById('custom_email').style.display = 'none';
                document.getElementById('custom_CMS').style.display = 'none';
                document.getElementById('custom_hesh').style.display = 'none';
                document.getElementById('custom_service').style.display = 'none';
            }
        }
    }

    buttons.forEach(button => {
        $(button).click(function () {
            inputsFieldsSD.style.display = 'none';
            remres(this);
        });
    });

} // tested

document.getElementById('CRMServDsk').ondblclick = function (a) { // скрытие окна ServiceDesk по двойному клику
    if (checkelementtype(a)) { document.getElementById('hideMeSrvDsk').click(); }
}

document.getElementById('ServiceDeskinstr').onclick = function () {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-ServiceDesk')
}

document.getElementById('infratasklist').onclick = function () { // открываем список задач оператора в Infra
    window.open('https://infra.skyeng.ru/request/list')
}

document.getElementById('hideMeSrvDsk').onclick = function () { //форма hide
    if (document.getElementById('CRMServDsk').style.display == '') {
        // $('.sdbtn').click(function () {
            // $('.sdbtn').not(this).removeClass('activebtnsd');
            // $(this).toggleClass('activebtnsd');
        // });

        buttons.forEach(button => {
            $(button).click(function () {
                remres(this);
            });
        });

        document.getElementById('newtask').textContent = ''

        document.getElementById('CRMServDsk').style.display = 'none'
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

    if (catcommprob.style.display == ''){
        for (const button of activeButtons) {
            sendRequestCommprob(catcommprob.value, usermail.value, idUser.value, descriptionField, button.value);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (userservice.style.display == '') {
        for (const button of activeButtons) {
            sendRequestmrktbill(idUser.value, userservice.value, descriptionField, stepsToReproduce, expectedResult, actualResult, button.value);
            console.log(`Selected topic: ${button.innerText}`);
        }
    }else if (lessonHesh.style.display == '') {
        for (const button of activeButtons) {
            sendRequestVimVid(idUser.value, lessonHesh.value, descriptionField, stepsToReproduce, expectedResult, actualResult, button.value);
            console.log(`Selected topic: ${button.innerText}`);
        }
    }else if (priorityMobile.style.display == 'none' && appInfo.style.display == 'none' && deviceInfo.style.display == 'none') {
        for (const button of activeButtons) {
            sendRequest(idUser.value, descriptionField, stepsToReproduce, expectedResult, actualResult, button.value);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (priorityMobile.style.display == '' && appInfo.style.display == '' && deviceInfo.style.display == '' && CMSlink.style.display == '') {
        for (const button of activeButtons) {
            sendRequestAcademMob(CMSlink.value, priorityMobile.value, appInfo.value, deviceInfo.value, descriptionField, stepsToReproduce, expectedResult, actualResult, idUser.value, button.value);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (priorityMobile.style.display == '' && appInfo.style.display == '' && deviceInfo.style.display == '' && CMSlink.style.display == 'none') {
        for (const button of activeButtons) {
            sendRequestMobWithPriority(priorityMobile.value, appInfo.value, deviceInfo.value, descriptionField, stepsToReproduce, expectedResult, actualResult, idUser.value, button.value);
            console.log(`Selected topic: ${button.innerText}`);
        }
    } else if (priorityMobile.style.display == 'none' && appInfo.style.display == '' && deviceInfo.style.display == '') {
        for (const button of activeButtons) {
            sendRequestMobNoPriority(idUser.value, actualResult, expectedResult, stepsToReproduce, descriptionField, deviceInfo.value, appInfo.value, button.value);
            console.log(`Selected topic: ${button.innerText}`);
        }
    }

});

function SDtestbtn() {
    if (document.getElementById('optionAnalyst').style.display == 'none'){
        document.getElementById('optionAnalyst').style.display = ''
    } else {document.getElementById('optionAnalyst').style.display = 'none'}
}

function clearfields(){
    $("#CRMServDsk input, #CRMServDsk textarea").val('');
}
	//End of script
// }