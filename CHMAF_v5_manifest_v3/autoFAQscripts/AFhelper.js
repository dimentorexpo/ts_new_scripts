var win_AFhelper =  // описание элементов главного окна
    `<div style="width: 351px;">
        <span style="width: 351px">
			<span style="cursor: -webkit-grab;">
				<div style="margin: 5px;" id="1str">
					<button class="mainButton" id="languageAF" title="Переключает язык Русский/Английский" style="width:100px">Русский</button>
                    <button id="testCustTMPL" class="mainButton" title="Открывает окно для добавления своих шаблонов либо информации в ячейки в этом поле">📒</button>
					<button class="mainButton buttonHide" id="hideMenuMain" title="Скрывает расширение и др открытых окон" style="margin-left:18px;">hide</button>
					<button class="mainButton" id="setting" title="Открывает настройки расширения и включения/отключения будильника" style="width:23px; float: right; margin-right: 5px">⚙</button>
					<button class="mainButton" id="links" title="Открывает доп.меню со ссылками и функциями" style="width:16px; float: right; margin-right: 5px">L</button>
					<button id="addsrc" class="mainButton onlyfortp" title="Открывает доп меню для работы с сервисами школы, требующими запрос на выдачу доступа" style="width:16px; float: right; margin-right: 5px">*</button>
					<button class="mainButton" id="getnewtmpldata" title="Обновляет шаблоны из документа с шаблонами без необходимости обновлять страницу для актуализации" style="width:27px; float: right; margin-right: 5px">🔄</button>
					<button class="mainButton" id="reminderstatus" title="Статус будильника 🔔 - вкл, 🔕 - выкл" style="width:25px; float: right; margin-right: 5px"></button>
					<input id ="phone_tr" class="onlyfortp ${exttheme}" placeholder="Телефон" autocomplete="off" type="text" style = "text-align: center; width: 150px; margin-left: 15px; margin-top: 5px; border-radius: 10px;"></input>
                    <input id ="email_tr" class="onlyfortp ${exttheme}" placeholder="Почта" autocomplete="off" type="text" style = "text-align: center; width: 150px; margin-left: 12px; margin-top: 5px; border-radius: 10px;"></input>
				</div>
				<div style="margin-left: 5px; margin-right: 5px; margin-bottom:5px;" id="pages">
				</div>
			</span>
			<div style="margin: 5px;" id="6str">
			</div>
			<div style="margin: 5px;" id="7str">
				<textarea class="${exttheme}" style="width: 341px; border-radius: 10px; min-height: 100px; max-height: 350px; resize: vertical;" id="inp"></textarea>
			<div id="hyperlnk" class="hyperlnk">
				<input id="bindlinktotext" class="${exttheme}" type="text" placeholder="Enter your link 🔗 here" style="margin-bottom:5px;width:270px;text-align:center;border-radius: 10px;" title="Вводите в это поле ссылку, после чего в общем поле выделяете слово или фразу и кнопкой Insert встраиваете ссылку в текст шаблона"></input>
				<button class="mainButton" id="insertlinktotext" title="Добавляет ссылку из поля слева в выделеное слово или фразу в тексте шаблона">Insert ✅</button>
			</div>
            <button class="mainButton" title="Переключение для выбора отправить или доработать сообщение" id="msg1" style="width:90px;">Доработать</button>
            <button class="mainButton msgtype" title="Переключает между отправкой текста в заметки или в чат пользователю" id="msg">Чат</button>
            <button class="mainButton" id="opandclsbarhyper" style="width:  30px; margin: 0; padding: 2px; text-align: center;" title="Открывает форму для прикрепления ссылки в текст">🔗</button>
            <button class="mainButton" title="Отправить текст от имени бота" id="sndbot" style="width: 30px;">🤖</button>
            <button class="mainButton" title="Отправить текст" id="snd" style="width:40px; background: ForestGreen;">Send</button>
            <button class="mainButton" title="Сохранить текст в личные шаблоны" id="addtocusttmplt" style="width: 30px;">⬆️</button>
            <button class="mainButton onlyfortp" title="Отправить текст от имени пользователя через Vimbot" id="openVimbotWindows">▶️</button>
			</div>
		<div style="border: 2px double black; display: none; background-color: #464451; cursor: -webkit-grab;" id="addTmp">
			<div style="margin: 5px; width: 350px">
			</div>
		</div>
	</span>
</div>`;

const wintAF = createWindow('AF_helper', 'winTopAF', 'winLeftAF', win_AFhelper);

function replaceSelectedText(elem, str) { //функция замены выделенного текста, для формирования гиперссылки
    elem.focus();

    if (document.selection) {
        var s = document.selection.createRange();
        if (s.text) {
            s.text = window[str](s.text);
            s.select();
            return true;
        }
    } else if (typeof (elem.selectionStart) == "number") {
        if (elem.selectionStart != elem.selectionEnd) {
            var start = elem.selectionStart;
            var end = elem.selectionEnd;

            var rs = window[str](elem.value.substr(start, end - start));
            elem.value = elem.value.substr(0, start) + rs + elem.value.substr(end);
            elem.setSelectionRange(end, end);
        }
        return true;
    }
    return false;
}

function change_str(s) { // вспомогательная функция для подстановки вместо текста гиперссылку и сохраняя выделенный сам текст
    return `<a href="${document.getElementById('bindlinktotext').value}" target="_blank" rel="noopener">` + s + "</a>";
}

if (localStorage.getItem('msg') != null) {
    document.getElementById('msg').innerHTML = localStorage.getItem('msg')
    if (localStorage.getItem('msg') == 'Чат')
        document.getElementById('msg').classList.remove('notes')
    else if (localStorage.getItem('msg') == 'Заметки')
        document.getElementById('msg').classList.add('notes')
}

if (localStorage.getItem('msg1') != null) {
    document.getElementById('msg1').innerHTML = localStorage.getItem('msg1')
}

document.getElementById('msg').onclick = function () { //  переключатель отправить сообщение в чат или заметки
    if (this.innerHTML == "Чат") {
        this.innerHTML = "Заметки";
        this.classList.toggle('notes')
        localStorage.setItem('msg', 'Заметки')
    } else {
        this.innerHTML = "Чат";
        this.classList.toggle('notes')
        localStorage.setItem('msg', 'Чат')
    }
}

document.getElementById('msg1').onclick = function () { //  переключатель Доработать или отправить сообщение
    if (this.innerHTML == "Отправить") {
        this.innerHTML = "Доработать";
        localStorage.setItem('msg1', 'Доработать')
    } else {
        this.innerHTML = "Отправить";
        localStorage.setItem('msg1', 'Отправить')
    }
}

document.getElementById('snd').onclick = function () { //функция отправки сообщений в чат или заметки
    const inp = document.getElementById('inp');
    const phoneTr = document.getElementById('phone_tr');
    const emailTr = document.getElementById('email_tr');
    const snd = document.getElementById('snd');

    snd.setAttribute('disabled', 'disabled');
    setTimeout(function () { snd.removeAttribute('disabled') }, 500);

    if (document.getElementById('msg').innerHTML === 'Чат') {
        if (template_flag === 1) {
            if (template_flag2 === 1) {
                sendAnswerTemplate2(inp.value, 1);
            } else {
                sendAnswerTemplate('', '', 1, inp.value, 1);
            }
        } else {
            sendAnswer(inp.value, 0);
        }
    } else {
        sendComment(inp.value);
    }

    inp.value = '';
    if (phoneTr) phoneTr.value = '';
    if (emailTr) emailTr.value = '';
};

document.getElementById('opandclsbarhyper').onclick = function () { // функция открытия формы для добавления гиперссылки
    if (document.getElementById('hyperlnk').classList.contains('hyper-active') == false) {
        document.getElementById('hyperlnk').classList.add('hyper-active')
        document.getElementById('hyperlnk').classList.remove('hyperlnk')
    } else {
        document.getElementById('hyperlnk').classList.remove('hyper-active')
        document.getElementById('hyperlnk').classList.add('hyperlnk')
    }
}

document.getElementById('insertlinktotext').onclick = function () { // функция замены текста на гиперссылку
    replaceSelectedText(document.getElementById('inp'), 'change_str');
    document.getElementById('bindlinktotext').value = ''
    document.getElementById('hyperlnk').classList.remove('hyper-active')
    document.getElementById('hyperlnk').classList.add('hyperlnk')
}

document.getElementById('sndbot').onclick = async function () { //отправить сообщение от автофак бота
    const inp = document.getElementById('inp');
    const phoneTr = document.getElementById('phone_tr');
    const emailTr = document.getElementById('email_tr');
    const txt = inp.value;
    var values = await getInfo(flag)
    var adr = values[0]; var adr1 = values[1]; var uid = values[2]
    var txt2 = txt.split('\n')
    var txt3 = ""
    txt2.forEach(el => txt3 += "<p>" + el + "</p>\\n")
    txt3 = txt3.split("\"").join("\\\"")
    txt3 = txt3.split('<p></p>').join("<p><br></p>")
    txt3 = txt3.substr(0, txt3.length - 2)

    if (document.getElementById('msg').innerHTML == "Чат")
        fetch("https://skyeng.autofaq.ai/api/reason8/answers", {
            "headers": {
                "content-type": "multipart/form-data; boundary=----WebKitFormBoundarymasjvc4O46a190zh",
                "x-csrf-token": aftoken
            },
            "body": "------WebKitFormBoundarymasjvc4O46a190zh\r\nContent-Disposition: form-data; name=\"payload\"\r\n\r\n{\"sessionId\":\"" + uid + "\",\"conversationId\":\"" + adr1 + "\",\"text\":\"" + txt3 + "\",\"suggestedAnswerDocId\":0}\r\n------WebKitFormBoundarymasjvc4O46a190zh--\r\n",
            "method": "POST",
            "credentials": "include"
        });

    inp.value = '';
    if (phoneTr) phoneTr.value = '';
    if (emailTr) emailTr.value = '';
}

document.getElementById('hideMenuMain').onclick = function () { // кнопка hide на главном окне скрипта
    var elements = ['AF_helper', 'AF_CustomTemplates', 'AF_Links', 'AF_AlarmClock', 'AF_Stat', 'AF_LessonStatus', 'AF_Linksd', 'AF_Settings'];
    elements.forEach(e => { if (document.getElementById(e)) { setDisplayStyle(document.getElementById(e), 'none') } });
    document.getElementById('scriptBut').classList.remove('activeScriptBtn')
}

document.getElementById('getnewtmpldata').onclick = getText // по клику на кнопку сработает функция обновления шаблонов из документа