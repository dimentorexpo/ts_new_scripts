var win_SettingsApp =  // описание элементов главного окна
    `<div style="border: 2px double black; background-color: #464451" id="SettingsApp_bar">
        <div style="margin: 5px; width: 350px;" id="SettingsApp_1str">
            <button class="buttonHide" title="скрывает меню" id="hideSettingsApp">hide</button>
        </div>
		<div style="margin: 5px; width: 350px">
                <select class="inputCRM" style="height:28px; width:242px; text-align:center" id="soundlistaddrCRM" onchange="changesoundaddrCRM()">
                    <option selected="" disabled="">Звук нового сообщения</option>
                    <option value="othersound">Выбрать свой звук</option>
                    </select>
				<button class="btnCRM btnCRMsmall" title="Проверка звука при добавленной ссылке" id="sound_testCRM">▶</button>
				<label title="Включение и отключение звука входящих запросов" class="checkbox-audio">
					<input id="audioCRMswitcher" type="checkbox" checked="">
						<span class="checkbox-audio-switch-CRM"></span>
				</label>
                <input class="inputCRM" id="sound_adrCRM" placeholder="Введи адрес звука" autocomplete="off" type="text" style="display: none; text-align: center; width: 235px; color: black; margin-top: 5px;">
				<button class="btnCRM btnCRMsmall" title="Сохраняет ссылки на новый источник звука для входящего запроса" id="sound_saveCRM" style="display: none;">💾</button>
				<br>
				<span class="spanCRM" style="color:bisque; margin-top: 5px;">Громкость звука</span>
				<input id="rangeCRM" min="0" max="1" value="1.0" step="0.1" type="range">
                    <br>
				<label class="spanCRM" style="color:bisque"><input type="checkbox" onchange="changerepeatsoundCRM()" id="repeatsoundselectCRM">Повторять звук новой задачи</label>
                    <br>
				<span class="spanCRM" style="color:bisque">Интервал воспроизведения звука:</span>
				<input class="inputCRM" title="Ввод интервала в секундах между повторами звука нового чата" id="soundplayintervalCRM" placeholder="N" autocomplete="off" oninput="maxLengthCheck(this)" type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px; width: 50px; color: black;">
				<button class="btnCRM" title="Внести изменения в интервал между повторами звука нового чата" id="setsoundplayintervalCRM" style="margin-top: 5px">SET⌚</button>
					<br>
				<div style="margin-top: 5px; width: 350px">
                    <input class="inputCRM" id="test_stdCRM" placeholder="ID тест У" autocomplete="off" title = "ID личного тестового ученика" type="text" style="text-align: center; width: 130px; color: black;">
                    <button class="btnCRM btnCRMsmall" id="setteststdCRM" title="Добавить в localstorage ID тестового У" style="margin-top: 5px">💾</button>
                    <input class="inputCRM" id="test_teachCRM" placeholder="ID тест П" autocomplete="off" title = "ID личного тестового преподавателя" type="text" style="text-align: center; width: 130px; color: black;">
                    <button class="btnCRM btnCRMsmall" id="settestteachCRM" title="Добавить в localstorage ID тестового П" style="margin-top: 5px">💾</button>
                </div>
				<button class="btnCRM" id="savesettingstofileCRM" onclick="getLocalstorageToFileCRM('settings-CRMhelp')" title="Сохраняет все настройки из localstorage в отдельный .json файл" style="color: #e5ece6; margin-top: 5px">💾 Сохранить настройки</button>
				<input class="btnCRM" type="file" id="fileinputCRM" title="Загружает все настройки в localstorage из ранее сохраненного файла настроек в формте .json" style="display:none;">
				<label class="btnCRM" style="color: #e5ece6; background: #768d87; padding: 5px; border-radius: 5px; border: 1px solid #566963;" for="fileinputCRM">⤵ Загрузить настройки</label>
			</div>
		</div>
    </div>`;

let audioCRM
let soundsfromdocCRM;
let soundflagCRM = 0

if (localStorage.getItem('sound_strCRM') !== null && localStorage.getItem('sound_strCRM') !== "")
    audioCRM = new Audio(localStorage.getItem('sound_strCRM'));
else
    audioCRM = new Audio("https://dimentorexpo.github.io/Sounds/msg.mp3");

if (localStorage.getItem('splinterCRM') == null) { //Задаем интервал воспроизведения если не задан
    localStorage.setItem('splinterCRM', 3);
}

if (localStorage.getItem('audioCRMvol') != null) { //Задаем громкость если не задана
    audioCRM.volume = localStorage.getItem('audioCRMvol');
} else localStorage.setItem('audioCRMvol', 1);

if (localStorage.getItem('audioCRM') == null){ // Задаем переключатель вкл/выкл звук
    localStorage.setItem('audioCRM', 1);
}

if (localStorage.getItem('repeatsound') == null){ // Задаем переключатель повторять/не повторять звук
    localStorage.setItem('repeatsound', 0);
}

if (localStorage.getItem('winTopSettingsApp') == null) { // началоное положение окна настроек (если не задано ранее)
    localStorage.setItem('winTopSettingsApp', '120');
    localStorage.setItem('winLeftSettingsApp', '295');
}
    
let wintSettingsApp = document.createElement('div'); // создание окна настроек
document.body.append(wintSettingsApp);
wintSettingsApp.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopSettingsApp') + 'px; left: ' + localStorage.getItem('winLeftSettingsApp') + 'px; font-size: 14px; z-index: 20; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintSettingsApp.style.display = 'none';
wintSettingsApp.setAttribute('id', 'winSettingsApp');
wintSettingsApp.innerHTML = win_SettingsApp;

let objSoundListCRM = document.getElementById('soundlistaddrCRM')
if (objSoundListCRM.length < 3) { // если не загружен спискок звуков - загружаем
    getsoundsfromdocCRM()
}
    
var listenerSettingsApp = function (e, a) { // сохранение позиции окна настроек
    wintSettingsApp.style.left = Number(e.clientX - myX5) + "px";
    wintSettingsApp.style.top = Number(e.clientY - myY5) + "px";
    localStorage.setItem('winTopSettingsApp', String(Number(e.clientY - myY5)));
    localStorage.setItem('winLeftSettingsApp', String(Number(e.clientX - myX5)));
};
    
wintSettingsApp.onmousedown = function (a) { // изменение позиции окна настроек
    if (checkelementtype(a)) {
        window.myX5 = a.layerX;
        window.myY5 = a.layerY;
        document.addEventListener('mousemove', listenerSettingsApp);
    }
}
wintSettingsApp.onmouseup = function () { document.removeEventListener('mousemove', listenerSettingsApp); } // прекращение изменения позиции окна настроек
    
document.getElementById('winSettingsApp').ondblclick = function (a) { // скрытие окна настроек по двойному клику
    if (checkelementtype(a)) { document.getElementById('winSettingsApp').style.display = 'none'; }
}
    
document.getElementById('hideSettingsApp').onclick = function () { // скрытие окна настроек
    if (document.getElementById('winSettingsApp').style.display == '')
        document.getElementById('winSettingsApp').style.display = 'none'
}
    
document.getElementById('btnSettingsApp').onclick = function () { // открытие окна настроек
    if (document.getElementById('winSettingsApp').style.display == '') {
        document.getElementById('winSettingsApp').style.display = 'none'
        document.getElementById('idmymenucrm').style.display = 'none'
    } else {
        document.getElementById('winSettingsApp').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'

        if (localStorage.getItem('test_studCRM') != "" || localStorage.getItem('test_studCRM') != null) { // если в localStorage записан тестовый У отобразить
            document.getElementById('test_stdCRM').value = localStorage.getItem('test_studCRM');
        } else document.getElementById('test_stdCRM').value = "";
        
        if (localStorage.getItem('test_teachCRM') != "" || localStorage.getItem('test_teachCRM') != null) { // если в localStorage записан тестовый У отобразить
            document.getElementById('test_teachCRM').value = localStorage.getItem('test_teachCRM');
        } else document.getElementById('test_teachCRM').value = "";   

        if (localStorage.getItem('splinterCRM') != null || localStorage.getItem('splinterCRM') != "") { //Загружаем интервал между воспроизведением звука
            document.getElementById('soundplayintervalCRM').value = localStorage.getItem('splinterCRM');
        } else {
            localStorage.setItem('splinterCRM', 3);
            document.getElementById('soundplayintervalCRM').value = localStorage.getItem('splinterCRM');
        }

        let rangeCRM = document.getElementById('rangeCRM'); // Загружаем громкость
        rangeCRM.value = localStorage.getItem('audioCRMvol');

        if (localStorage.getItem('audioCRM') == '0') // загружаем ВКЛ/ВЫКЛ звук
            document.getElementById('audioCRMswitcher').checked = false;
        else
            document.getElementById('audioCRMswitcher').checked = true;

        if (localStorage.getItem('repeatsound') == 1) {
            document.getElementById("repeatsoundselectCRM").checked = true;
        } else {
            document.getElementById("repeatsoundselectCRM").checked = false;
            document.getElementById('setsoundplayintervalCRM').setAttribute('disabled', 'disabled')
            document.getElementById('soundplayintervalCRM').setAttribute('disabled', 'disabled')
        }
    }
}

async function getsoundsfromdocCRM() { // загрузка списка звуков из файла
    soundsfromdocCRM = 'https://script.google.com/macros/s/AKfycbyD1l-oLcE-BBmyN1QmcHKoi0rwVfCwWjE6cfTqw6Y9QQGAju-9inKbwSOfHCI6qBEjtg/exec'
    await fetch(soundsfromdocCRM).then(r => r.json()).then(r => soundsdata = r)
    soundsconteinerCRM = soundsdata.result;
    console.log(soundsdata.result) //получим список звуков
    for (j = 0; j < soundsconteinerCRM.length; j++) {
        if (soundsconteinerCRM[j][0] != '') {
            addOptionCRM(objSoundListCRM, `${soundsconteinerCRM[j][0]}`, `${soundsconteinerCRM[j][1]}`)
        }
    }
    for (let i = 0; i < objSoundListCRM.length; i++) { // проверяем какой звук выбран
        if (objSoundListCRM.children[i].value == localStorage.getItem('sound_strCRM')) {
            objSoundListCRM.children[i].selected = true;
        }
    }
    if (objSoundListCRM.children[0].selected) {
        objSoundListCRM.children[1].selected = true
        document.getElementById('sound_adrCRM').style.display = ''
        document.getElementById('sound_saveCRM').style.display = ''
        document.getElementById('sound_adrCRM').value = localStorage.getItem('sound_strCRM')
    }
}
    
function changesoundaddrCRM() { // сохранение измнений адресса звука    
    if (objSoundListCRM.length > 1) {
        for (let i = 1; i < objSoundListCRM.length; i++) {
            if (objSoundListCRM[i].selected == true) {
                if (objSoundListCRM[i].value == "othersound") {
                    document.getElementById('sound_adrCRM').style.display = ''
                    document.getElementById('sound_saveCRM').style.display = ''
                } else {
                    document.getElementById('sound_adrCRM').style.display = 'none'
                    document.getElementById('sound_saveCRM').style.display = 'none'
                    document.getElementById('sound_adrCRM').value = ""
                    console.log(objSoundListCRM[i].innerText + ' ' + objSoundListCRM[i].value)
                    localStorage.setItem('sound_strCRM', objSoundListCRM[i].value)
                    audioCRM = new Audio(localStorage.getItem('sound_strCRM'))
                }
            }
        }
    }
}

function changerepeatsoundCRM() {
    if (localStorage.getItem('repeatsound') == 1) {
        document.getElementById("repeatsoundselectCRM").checked = false;
        localStorage.setItem('repeatsound', 0)
        document.getElementById('setsoundplayintervalCRM').setAttribute('disabled', 'disabled')
        document.getElementById('soundplayintervalCRM').setAttribute('disabled', 'disabled')
        if (soundintervalsetCRM != null){
            clearInterval(soundintervalsetCRM)
            soundintervalsetCRM = null    
        }
    } else {
        document.getElementById("repeatsoundselectCRM").checked = true;
        localStorage.setItem('repeatsound', 1)
        document.getElementById('setsoundplayintervalCRM').removeAttribute('disabled')
        document.getElementById('soundplayintervalCRM').removeAttribute('disabled')
    }
}

document.getElementById('setsoundplayintervalCRM').onclick = function () { // сохранение изменения интервала воспроизведения звука
    if (document.getElementById('soundplayintervalCRM').value != '') {
        localStorage.setItem('splinterCRM', document.getElementById('soundplayintervalCRM').value);
    } else console.log("Базовое значение равно 3 секунды")
}

rangeCRM.onchange = function () { // сохранение изменения громкости
    if (localStorage.getItem('audioCRMvol') != null) {
        audioCRM.volume = this.value;
        localStorage.setItem('audioCRMvol', audioCRM.volume);
    } else localStorage.setItem('audioCRMvol', this.value);
}

document.getElementsByClassName('checkbox-audio-switch-CRM')[0].onclick = function () {  // функция переключатели звука ВКЛ и ВЫКЛ

    if (localStorage.getItem('audioCRM') != null) {
        if (localStorage.getItem('audioCRM') == '0') {
            document.getElementById('audioCRMswitcher').checked = false;
            localStorage.setItem('audioCRM', '1');
        } else if (localStorage.getItem('audioCRM') == '1') {
            document.getElementById('audioCRMswitcher').checked = true;
            localStorage.setItem('audioCRM', '0');
        }
    }
}

document.getElementById('sound_testCRM').onclick = function () { // кнопка тест звука
    if (document.getElementById('sound_testCRM').innerHTML == '▶'){
        document.getElementById('sound_testCRM').innerHTML = '⏹'
        document.getElementById('sound_testCRM').title = 'Остановить воспроизведение'
        audioCRM.play()
        setTimeout(() => {
            document.getElementById('sound_testCRM').innerHTML = '▶'
            document.getElementById('sound_testCRM').title = 'Проверка звука при добавленной ссылке'
        }, Number(audioCRM.duration * 1000 + 1).toFixed(0));
    } else {
        document.getElementById('sound_testCRM').innerHTML = '▶'
        document.getElementById('sound_testCRM').title = 'Проверка звука при добавленной ссылке'
        audioCRM.pause()
        audioCRM.currentTime = 0
    }
}

document.getElementById('setteststdCRM').onclick = function () { // сохраняется ID в настройках расширения тестового ученика в localstorage
    if (document.getElementById('test_stdCRM').value != '') {
        localStorage.setItem('test_studCRM', document.getElementById('test_stdCRM').value);
    } else console.log("Ведите ID тестового ученика")
}

document.getElementById('settestteachCRM').onclick = function () { // сохраняется ID в настройках расширения тестового учителя в localstorage
    if (document.getElementById('test_teachCRM').value != '') {
        localStorage.setItem('test_teachCRM', document.getElementById('test_teachCRM').value);
    } else console.log("Ведите ID тестового преподавателя")
}

function getLocalstorageToFileCRM(fileName) { //функция сохранения содержимого localstorage в файл на компьютере

    /* dump local storage to string */

    var a = {};
    for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        var v = localStorage.getItem(k);
        a[k] = v;
    }

    /* save as blob */

    var textToSave = JSON.stringify(a)
    var textToSaveAsBlob = new Blob([textToSave], {
        type: "application/json"
    });
    var textToSaveAsURL = window.URL.createObjectURL(textToSaveAsBlob);

    /* download without button hack */

    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.innerHTML = "Download File";
    downloadLink.href = textToSaveAsURL;
    downloadLink.onclick = function () {
        document.body.removeChild(event.target);
    };
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();

}

document.getElementById('fileinputCRM').onclick = function () { // по клику на кнопку Загрузить настройки предлагает выбрать файл настроек, добавлять при этом ранее сохраненный в формате .json
    let fileinputCRM = document.getElementById('fileinputCRM');
    let jsonparsed;

    fileinputCRM.addEventListener('change', function (e) {
        let file = fileinputCRM.files[0];
        let textType = /.json/;

        if (file.type.match(textType)) {
            let reader = new FileReader();

            reader.onload = function (e) {
                console.log(reader.result)
                jsonparsed = JSON.parse(reader.result)
                console.log(jsonparsed)
                console.log(Object.keys(jsonparsed).length)
                for (let i = 0; i < Object.keys(jsonparsed).length; i++) {
                    localStorage.setItem(Object.keys(jsonparsed)[i], Object.values(jsonparsed)[i])
                }
                alert("Настройки расширения в localstorage загружены успешно!")
            }

            reader.readAsText(file);
        } else {
            console.log("File not supported!")
        }
    });
}



