var win_refusefrom =  // описание элементов окна отказа от помощи
    `<div style="display: flex; width: 414px;">
        <span style="width: 414px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 410px;" id="refuse_form_header">
                            <button title="скрывает меню" id="hideMeRefuseFormv2" style="width:50px; background: #228B22;">hide</button>
                            <button title="По нажатию обновляет хеш чата в соответствующем поле, на случай, если при открытии формы вы открыли не тот чат, в котором обратился пользователь" id="refreshhashrefuseform" style="width:24px;">♻</button>
                            <button title="По нажатию обновляет перечень опций в разделе Проблема и Как решилось" id="refreshoptions" style="width:24px;">🔄</button>
                            <button title="По нажатию очищает поля и сбрасывает в дефолтное состояние формы" id="clearrefuseform" style="width:24px;">🧹</button>
							<button title="Инструкция по этой форме" id="refuseforminstr" style="float:right">❓</button>
                        </div>
                        <div style="margin: 5px; margin-top: 0px; width: 410px" id="refuse_form_menu">
                            <input id="chatlnk" placeholder="Ссылка на чат" title="Вставьте сюда ссылку на чат" autocomplete="off" type="text" style="text-align: center; width: 410px; color: black; margin-top: 5px">
							<br>
							<select id="userissue" style="height: 25px; width:410px; margin-top:5px;">
									<option selected disabled="" style="background-color:orange; color:white;" value="problclient">Проблема клиента</option>
							</select>
							<br>

							<textarea id="otherproblem" class="otherfieldoff" disabled="true" placeholder="Другое, не подошли варианты 'Проблема'" title="Вводим свой вариант какая у пользователя проблема" autocomplete="off" type="text" style="text-align: center; width: 405px; color: black; margin-top: 5px" data-gramm="false" wt-ignore-input="true"></textarea>

							<br>

							<select id="howissuesolverd" style="width:410px; height: 25px;">
									<option selected disabled="" style="background-color:orange; color:white;" value="howsolved">Как решилась</option>
                            </select>

							<br>

							<textarea id="othersolved" class="otherfieldoff" disabled="true" placeholder="Другое, не подошли варианты 'Решилось'" title="Вводим свой вариант как решилась проблема" autocomplete="off" type="text" style="text-align: center; width: 405px; color: black; margin-top: 5px" data-gramm="false" wt-ignore-input="true"></textarea>

							<br>
							<button title="Отправляет заполненные поля формы в док" id="send2doc" style="width:105px; position: relative; left: 50%; margin-top: 5px; transform: translate(-50%, 0);">Отправить</button>
						</div>
		</span>
        </span>
</div>`;

if (localStorage.getItem('winTopRefuseNew') == null) { //начальное положение окна Отказ от помощи
    localStorage.setItem('winTopRefuseNew', '295');
    localStorage.setItem('winLeftRefuseNew', '295');
}

let wintRefuseFormNew = document.createElement('div'); // создание окна отказов
document.body.append(wintRefuseFormNew);
wintRefuseFormNew.style = 'min-height: 25px; width: 420px; background: #464451; top: ' + localStorage.getItem('winTopRefuseNew') + 'px; left: ' + localStorage.getItem('winLeftRefuseNew') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintRefuseFormNew.style.display = 'none';
wintRefuseFormNew.setAttribute('id', 'AF_Refuseformnew');
wintRefuseFormNew.innerHTML = win_refusefrom;

wintRefuseFormNew.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintRefuseFormNew.offsetLeft;
    let elemTop = wintRefuseFormNew.offsetTop;

    function onMouseMove(event) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintRefuseFormNew.style.left = (elemLeft + deltaX) + "px";
      wintRefuseFormNew.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopRefuseNew', String(elemTop + deltaY));
      localStorage.setItem('winLeftRefuseNew', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};
 // прекращение изменения позиции окна отказов

function hashrefuseform(){
    let chatId = getChatId();
    if (chatId){
        document.getElementById('chatlnk').value = "https://skyeng.autofaq.ai/logs/" + getChatId()
    }else {
        document.getElementById('chatlnk').value = ''
    }
}


let intervalotak = setInterval(function () {
    if (document.getElementById('otkaz') != null || document.getElementById('otkaz') != undefined) {
        clearInterval(intervalotak)
        document.getElementById('otkaz').onclick = function () { // открыть форму Отказ от помощи
            if (document.getElementById('AF_Refuseformnew').style.display == '') {
                document.getElementById('AF_Refuseformnew').style.display = 'none'
                document.getElementById('idmymenu').style.display = 'none'
				document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
            } else {
                document.getElementById('AF_Refuseformnew').style.display = ''
                document.getElementById('idmymenu').style.display = 'none'
				document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')

                let objSelIssue = document.getElementById("userissue");
                let objSelSolution = document.getElementById("howissuesolverd");
                let issuefromdoc;
                let issuecontainer;
                let solutionfromdoc;
                let solutioncontainer;

                async function getissueandsolution() {
                    if (objSelIssue.children.length == 1 && objSelSolution.children.length == 1) {
                        document.getElementById('send2doc').textContent = 'Загрузка'

                        issuefromdoc = 'https://script.google.com/macros/s/AKfycbyBl2CvdFSi2IXYDTkCroJJjlP63NMBfSsp6TwXYYGfwct0YT1_gnTumsdFbcTpR7KksA/exec'
                        await fetch(issuefromdoc).then(r => r.json()).then(r => issuedata = r)
                        issuecontainer = issuedata.result;
                        console.log(issuedata.result) //получим список проблем

                        for (let i = 0; i < issuecontainer.length; i++) {
                            addOption(objSelIssue, `${issuecontainer[i][0]}`, `${issuecontainer[i][0]}`)
                        }

                        solutionfromdoc = 'https://script.google.com/macros/s/AKfycbxut3AuCkPNsK_sR7zxxF8B7xFelbTPnR_iEywL1qo0BXbKbLiBRilGuKFm2XnPcCNdHQ/exec'
                        await fetch(solutionfromdoc).then(r => r.json()).then(r => solutiondata = r)
                        solutioncontainer = solutiondata.result;
                        console.log(solutiondata.result) //получим список как решилось

                        for (let i = 0; i < solutioncontainer.length; i++) {
                            addOption(objSelSolution, `${solutioncontainer[i][0]}`, `${solutioncontainer[i][0]}`)
                        }

                        document.getElementById('send2doc').textContent = 'Отправить'
                    } else {
                        document.getElementById('send2doc').textContent = 'Отправить'
                    }

                }

                getissueandsolution();

                //unhide fields when choose 'other'
                let flagotherproblem = 0;
                let problemlist = document.getElementById('userissue')

                problemlist.onchange = () => {

                    for (let i = 0; i < problemlist.children.length; i++) {

                        if (problemlist.children[i].selected == true && problemlist.children[i].value == 'Другое') {

                            document.getElementById('otherproblem').classList.remove('otherfieldoff')
                            document.getElementById('otherproblem').classList.add('otherfieldon')
                            document.getElementById('otherproblem').removeAttribute('disabled')
                            flagotherproblem = 1;

                        } else {
                            document.getElementById('otherproblem').classList.add('otherfieldoff')
                            document.getElementById('otherproblem').classList.remove('otherfieldon')
                            document.getElementById('otherproblem').setAttribute('disabled', 'disabled')
                            flagotherproblem = 0;
                        }
                    }
                }

                let flagothersolved = 0;
                let solvedlist = document.getElementById('howissuesolverd')

                solvedlist.onchange = () => {

                    for (let i = 0; i < solvedlist.children.length; i++) {

                        if (solvedlist.children[i].selected == true && solvedlist.children[i].value == 'Другое') {

                            document.getElementById('othersolved').classList.remove('otherfieldoff')
                            document.getElementById('othersolved').classList.add('otherfieldon')
                            document.getElementById('othersolved').removeAttribute('disabled')
                            flagothersolved = 1;

                        } else {
                            document.getElementById('othersolved').classList.add('otherfieldoff')
                            document.getElementById('othersolved').classList.remove('otherfieldon')
                            document.getElementById('othersolved').setAttribute('disabled', 'disabled')
                            flagothersolved = 0;
                        }
                    }
                }

                document.getElementById('hideMeRefuseFormv2').onclick = () => { //форма hide
                    if (document.getElementById('AF_Refuseformnew').style.display == '')
                        document.getElementById('AF_Refuseformnew').style.display = 'none'
                }

                document.getElementById('AF_Refuseformnew').ondblclick = function (a) { // скрытие окна отказа от помощи по двойному клику
                    if (checkelementtype(a)) {
                        document.getElementById('AF_Refuseformnew').style.display = 'none';
                    }
                }

                document.getElementById('refuseforminstr').onclick = function () {
                    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-otkazotpom%E2%9D%8C%D0%9E%D1%82%D0%BA%D0%B0%D0%B7%D0%BE%D1%82%D0%BF%D0%BE%D0%BC%D0%BE%D1%89%D0%B8')
                }

                document.getElementById('refreshoptions').onclick = async function () {
                    objSelIssue.length = 1;
                    objSelSolution.length = 1;

                    document.getElementById('send2doc').textContent = 'Загрузка'

                    issuefromdoc = 'https://script.google.com/macros/s/AKfycbyBl2CvdFSi2IXYDTkCroJJjlP63NMBfSsp6TwXYYGfwct0YT1_gnTumsdFbcTpR7KksA/exec'
                    await fetch(issuefromdoc).then(r => r.json()).then(r => issuedata = r)
                    issuecontainer = issuedata.result;
                    console.log(issuedata.result) //получим список проблем

                    for (let i = 0; i < issuecontainer.length; i++) {
                        addOption(objSelIssue, `${issuecontainer[i][0]}`, `${issuecontainer[i][0]}`)
                    }

                    solutionfromdoc = 'https://script.google.com/macros/s/AKfycbxut3AuCkPNsK_sR7zxxF8B7xFelbTPnR_iEywL1qo0BXbKbLiBRilGuKFm2XnPcCNdHQ/exec'
                    await fetch(solutionfromdoc).then(r => r.json()).then(r => solutiondata = r)
                    solutioncontainer = solutiondata.result;
                    console.log(solutiondata.result) //получим список как решилось

                    for (let i = 0; i < solutioncontainer.length; i++) {
                        addOption(objSelSolution, `${solutioncontainer[i][0]}`, `${solutioncontainer[i][0]}`)
                    }

                    document.getElementById('send2doc').textContent = 'Отправить'

                }

                // end of it

                hashrefuseform()

                document.getElementById('refreshhashrefuseform').onclick = () => {
                    hashrefuseform()
                }

                document.getElementById('clearrefuseform').onclick = () => {
                    document.getElementById('chatlnk').style.background = '';
                    document.getElementById('chatlnk').value = '';
                    document.getElementById('userissue').style.background = '';
                    document.getElementById('userissue').children[0].selected = true
                    document.getElementById('otherproblem').style.background = '';
                    document.getElementById('otherproblem').value = '';
                    document.getElementById('otherproblem').removeAttribute('class');
                    document.getElementById('otherproblem').classList.add('otherfieldoff')
                    document.getElementById('howissuesolverd').style.background = '';
                    document.getElementById('howissuesolverd').children[0].selected = true
                    document.getElementById('othersolved').style.background = '';
                    document.getElementById('othersolved').value = '';
                    document.getElementById('othersolved').removeAttribute('class');
                    document.getElementById('othersolved').classList.add('otherfieldoff')
                }

                let sendrefuseformbyenter = document.querySelector('#userissue'); //по Enter отправляет в форму отказа но еще тестится
                sendrefuseformbyenter.addEventListener('keydown', event => {
                    if (event.key === "Enter") {
                        document.querySelector('#send2doc').click()
                    }
                })

                let textrefuseformsolutionbyenter = document.querySelector('#howissuesolverd'); //по Enter отправляет в форму отказа но еще тестится
                textrefuseformsolutionbyenter.addEventListener('keydown', event => {
                    if (event.key === "Enter") {
                        document.querySelector('#send2doc').click()
                    }
                })

                document.getElementById('send2doc').onclick = () => {

                    let textclientsolution;
                    let textaskclient;
                    let otherproblemtext;
                    let othersolvedtext;
                    let body2;

                    let flagempty = 0;

                    if (document.getElementById('chatlnk').value.length < 3) {
                        document.getElementById('chatlnk').style.backgroundColor = 'Coral';
                        flagempty = 1;
                    } else {
                        document.getElementById('chatlnk').style.backgroundColor = '';
                    }

                    if (document.getElementById('userissue').children[0].selected == true) {
                        document.getElementById('userissue').style.backgroundColor = 'Coral';
                        flagempty = 1;
                    } else {
                        document.getElementById('userissue').style.backgroundColor = '';
                    }

                    if (!document.getElementById('otherproblem').disabled && document.getElementById('otherproblem').value.length < 3) {
                        document.getElementById('otherproblem').style.backgroundColor = 'Coral';
                        flagempty = 1;
                    } else {
                        document.getElementById('otherproblem').style.backgroundColor = '';
                    }

                    if (document.getElementById('howissuesolverd').children[0].selected == true) {
                        document.getElementById('howissuesolverd').style.backgroundColor = 'Coral';
                        flagempty = 1;
                    } else {
                        document.getElementById('howissuesolverd').style.backgroundColor = '';
                    }

                    if (!document.getElementById('othersolved').disabled && document.getElementById('othersolved').value.length < 3) {
                        document.getElementById('othersolved').style.backgroundColor = 'Coral';
                        flagempty = 1;
                    } else {
                        document.getElementById('othersolved').style.backgroundColor = '';
                    }

                    if (flagempty == 0) {
                        let chatlink = document.getElementById('chatlnk').value

                        for (let i = 0; i < document.getElementById('userissue').children.length; i++) {
                            if (document.getElementById('userissue').children[i].selected == true)
                                textaskclient = encodeURIComponent(document.getElementById('userissue').children[i].value)
                        }

                        for (let i = 0; i < document.getElementById('howissuesolverd').children.length; i++) {
                            if (document.getElementById('howissuesolverd').children[i].selected == true)
                                textclientsolution = encodeURIComponent(document.getElementById('howissuesolverd').children[i].value)
                        }

                        if (flagotherproblem == 0 && flagothersolved == 0) {

                            body2 = 'entry.1040202788=' + chatlink + '&entry.763930179=' + textaskclient + '&entry.870072493=' + textclientsolution


                        } else if (flagotherproblem == 1 && flagothersolved == 0) {

                            otherproblemtext = encodeURIComponent(document.getElementById('otherproblem').value)

                            body2 = 'entry.1040202788=' + chatlink + '&entry.763930179=' + textaskclient + '&entry.870072493=' + textclientsolution + '&entry.8206738=' + otherproblemtext
                            console.log(body2)

                            console.log('other problem =1  othersolve = 0')

                        } else if (flagotherproblem == 0 && flagothersolved == 1) {

                            othersolvedtext = encodeURIComponent(document.getElementById('othersolved').value)

                            body2 = 'entry.1040202788=' + chatlink + '&entry.763930179=' + textaskclient + '&entry.870072493=' + textclientsolution + '&entry.917004094=' + othersolvedtext
                            console.log(body2)

                            console.log('other problem =0  othersolve = 1')

                        } else if (flagotherproblem == 1 && flagothersolved == 1) {

                            otherproblemtext = encodeURIComponent(document.getElementById('otherproblem').value)
                            othersolvedtext = encodeURIComponent(document.getElementById('othersolved').value)

                            body2 = 'entry.1040202788=' + chatlink + '&entry.763930179=' + textaskclient + '&entry.870072493=' + textclientsolution + '&entry.917004094=' + othersolvedtext + '&entry.8206738=' + otherproblemtext
                            console.log(body2)

                        }

                        let options2 = {
                            "headers": {
                                "content-type": "application/x-www-form-urlencoded",
                            },
                            "body": body2,
                            "method": "POST",
                        }

                        document.getElementById('responseTextarea1').value = JSON.stringify(options2)
                        document.getElementById('responseTextarea2').value = 'https://docs.google.com/forms/d/e/1FAIpQLScXLf0uRuESjzpu0gR-kE7T5LcCblOQtqzadtcwnTUb4_vpnQ/formResponse'
                        if (document.getElementById('responseTextarea3') != null)
                            document.getElementById('responseTextarea3').value = ''
                        document.getElementById('sendResponse').click()

                        sendComment('Отправка в документ "Отказ от помощи" прошла успешно')
                        document.getElementById('send2doc').textContent = "Отправлено✅"

                        setTimeout(() => {
                            document.getElementById('send2doc').textContent = "Отправить"
                            document.getElementById('AF_Refuseformnew').style.display = 'none'
                        }, 3000)

                        document.getElementById('chatlnk').value = ''
                        document.getElementById('userissue').children[0].selected = true
                        document.getElementById('howissuesolverd').children[0].selected = true
                        document.getElementById('othersolved').classList.add('otherfieldoff')
                        document.getElementById('othersolved').classList.remove('otherfieldon')
                        document.getElementById('othersolved').setAttribute('disabled', 'disabled')
                        document.getElementById('otherproblem').classList.add('otherfieldoff')
                        document.getElementById('otherproblem').classList.remove('otherfieldon')
                        document.getElementById('otherproblem').setAttribute('disabled', 'disabled')
                        document.getElementById('otherproblem').value = ''
                        document.getElementById('othersolved').value = ''
                    }
                }
            }
        }
    }

}, 1000)