var win_SettingsApp =  // описание элементов главного окна
    `<div style="border: 2px double black; background-color: #464451" id="SettingsApp_bar">
        <div style="margin: 5px; width: 350px;" id="SettingsApp_1str">
            <button class="buttonHide" title="скрывает меню" id="hideSettingsApp">hide</button>
        </div>
		<div style="margin: 5px; width: 350px">
                <select class="inputCRM" style="height:28px; width:242px; text-align:center" id="soundlistaddrCRM">
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
				<label class="spanCRM" style="color:bisque"><input type="checkbox" id="repeatsoundselectCRM">Повторять звук новой задачи</label>
                    <br>
				<label class="spanCRM" style="color:bisque"><input type="checkbox" id="skyautoEnabledCRM">Автовзятие задач (SkyAuto)</label>
				<br>
				<span class="spanCRM" style="color:bisque">Интервал воспроизведения звука:</span>
				<input class="inputCRM" title="Ввод интервала в секундах между повторами звука нового чата" id="soundplayintervalCRM" placeholder="N" autocomplete="off" type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px; width: 50px; color: black;">
				<button class="btnCRM" title="Внести изменения в интервал между повторами звука нового чата" id="setsoundplayintervalCRM" style="margin-top: 5px">SET⌚</button>
					<br>
				<div style="margin-top: 5px; width: 350px">
                    <input class="inputCRM" id="test_stdCRM" placeholder="ID тест У" autocomplete="off" title = "ID личного тестового ученика" type="text" style="text-align: center; width: 130px; color: black;">
                    <button class="btnCRM btnCRMsmall" id="setteststdCRM" title="Добавить в localstorage ID тестового У" style="margin-top: 5px">💾</button>
                    <input class="inputCRM" id="test_teachCRM" placeholder="ID тест П" autocomplete="off" title = "ID личного тестового преподавателя" type="text" style="text-align: center; width: 130px; color: black;">
                    <button class="btnCRM btnCRMsmall" id="settestteachCRM" title="Добавить в localstorage ID тестового П" style="margin-top: 5px">💾</button>
                </div>
				<button class="btnCRM" id="savesettingstofileCRM" title="Сохраняет все настройки из localstorage в отдельный .json файл" style="color: #e5ece6; margin-top: 5px">💾 Сохранить настройки</button>
				<input class="btnCRM" type="file" id="fileinputCRM" title="Загружает все настройки в localstorage из ранее сохраненного файла настроек в формте .json" style="display:none;">
				<label class="btnCRM" style="color: #e5ece6; background: #768d87; padding: 5px; border-radius: 5px; border: 1px solid #566963;" for="fileinputCRM">⤵ Загрузить настройки</label>
			</div>
		</div>
    </div>`;

let audioCRM // аудиоплеер уведомлений (используется также в content.js)
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

if (localStorage.getItem('audioCRM') == null) { // Задаем переключатель вкл/выкл звук
    localStorage.setItem('audioCRM', 1);
}

if (localStorage.getItem('repeatsound') == null) { // Задаем переключатель повторять/не повторять звук
    localStorage.setItem('repeatsound', 0);
}

if (localStorage.getItem('skyauto_enabled') == null) { // Задаем переключатель автовзятия задач (по умолчанию ВКЛ)
    localStorage.setItem('skyauto_enabled', 1);
}

const wintSettingsApp = createWindowCRM('winSettingsApp', 'winTopSettingsApp', 'winLeftSettingsApp', win_SettingsApp);
hideWindowOnDoubleClick('winSettingsApp');
hideWindowOnClick('winSettingsApp', 'hideSettingsApp');

document.getElementById('winSettingsApp').addEventListener('input', function (event) {
    // Проверяем, что событие произошло на интересующем нас элементе
    if (event.target.matches('.inputCRM[type="number"]')) {
        maxLengthCheck(event.target);
        checkMinMaxValue(event.target);
    }
    // Дополнительная проверка для элементов с определёнными id, не зависимо от их типа
    if (event.target.id === 'test_stdCRM' || event.target.id === 'test_teachCRM') {
        onlyNumbers(event.target);
    }
});


let objSoundListCRM = document.getElementById('soundlistaddrCRM')
if (objSoundListCRM.length < 3) { // если не загружен спискок звуков - загружаем
    getsoundsfromdocCRM()
}

document.getElementById('btnSettingsApp').onclick = function () { // открытие окна настроек
    if (document.getElementById('winSettingsApp').style.display == '') {
        document.getElementById('winSettingsApp').style.display = 'none'
        document.getElementById('idmymenucrm').style.display = 'none'
    } else {
        document.getElementById('winSettingsApp').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'

        // FIX: раньше условие было (a != "" || a != null) — всегда истинно,
        // из-за чего ветка else была недостижима.
        if (localStorage.getItem('test_studCRM') != null && localStorage.getItem('test_studCRM') != "") { // если в localStorage записан тестовый У отобразить
            document.getElementById('test_stdCRM').value = localStorage.getItem('test_studCRM');
        } else document.getElementById('test_stdCRM').value = "";

        if (localStorage.getItem('test_teachCRM') != null && localStorage.getItem('test_teachCRM') != "") { // если в localStorage записан тестовый П отобразить
            document.getElementById('test_teachCRM').value = localStorage.getItem('test_teachCRM');
        } else document.getElementById('test_teachCRM').value = "";

        if (localStorage.getItem('splinterCRM') != null) { //Загружаем интервал между воспроизведением звука
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
    const soundsDocURL = 'https://script.google.com/macros/s/AKfycbyD1l-oLcE-BBmyN1QmcHKoi0rwVfCwWjE6cfTqw6Y9QQGAju-9inKbwSOfHCI6qBEjtg/exec';

    // FIX: раньше soundsdata создавалась как неявная глобальная переменная,
    // а счётчик j утекал в window; ошибки сети не обрабатывались.
    let soundsdata;
    try {
        const r = await fetch(soundsDocURL);
        soundsdata = await r.json();
    } catch (err) {
        console.error('Не удалось загрузить список звуков:', err);
        return;
    }

    soundsconteinerCRM = soundsdata.result;
    if (!soundsconteinerCRM) return;

    for (let j = 0; j < soundsconteinerCRM.length; j++) {
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
document.getElementById('soundlistaddrCRM').addEventListener('change', changesoundaddrCRM);

function changerepeatsoundCRM() {
    if (localStorage.getItem('repeatsound') == 1) {
        document.getElementById("repeatsoundselectCRM").checked = false;
        localStorage.setItem('repeatsound', 0)
        document.getElementById('setsoundplayintervalCRM').setAttribute('disabled', 'disabled')
        document.getElementById('soundplayintervalCRM').setAttribute('disabled', 'disabled')
        if (soundintervalsetCRM != null) {
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
document.getElementById('repeatsoundselectCRM').addEventListener('change', changerepeatsoundCRM);

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

if (localStorage.getItem('skyauto_enabled') == '0') {
    document.getElementById('skyautoEnabledCRM').checked = false;
} else {
    document.getElementById('skyautoEnabledCRM').checked = true;
}

function changeskyautoEnabledCRM() {
    if (localStorage.getItem('skyauto_enabled') == '1') {
        document.getElementById("skyautoEnabledCRM").checked = false;
        localStorage.setItem('skyauto_enabled', '0')
    } else {
        document.getElementById("skyautoEnabledCRM").checked = true;
        localStorage.setItem('skyauto_enabled', '1')
    }
}
document.getElementById('skyautoEnabledCRM').addEventListener('change', changeskyautoEnabledCRM);

document.getElementById('sound_testCRM').onclick = function () { // кнопка тест звука
    if (document.getElementById('sound_testCRM').innerHTML == '▶') {
        document.getElementById('sound_testCRM').innerHTML = '⏹'
        document.getElementById('sound_testCRM').title = 'Остановить воспроизведение'
        audioCRM.play()

        // FIX: раньше при NaN в duration получался таймаут "NaN".
        // Если длительность неизвестна — возвращаем кнопку через 30 сек.
        const playMs = isFinite(audioCRM.duration) ? Math.ceil(audioCRM.duration * 1000) + 1 : 30000;
        setTimeout(() => {
            document.getElementById('sound_testCRM').innerHTML = '▶'
            document.getElementById('sound_testCRM').title = 'Проверка звука при добавленной ссылке'
        }, playMs);
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
document.getElementById('savesettingstofileCRM').onclick = function () {
    getLocalstorageToFileCRM('settings-CRMhelp')
}

// FIX: раньше слушатель 'change' добавлялся внутри onclick — при каждом клике
// на «Загрузить настройки» вешалась ещё одна копия обработчика, и файл
// импортировался в localStorage многократно. Слушатель регистрируется один раз.
document.getElementById('fileinputCRM').addEventListener('change', function (e) {
    const fileinputCRM = document.getElementById('fileinputCRM');
    const file = fileinputCRM.files[0];
    const textType = /.json/;

    if (!file || !file.type.match(textType)) {
        console.log("File not supported!")
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        try {
            const jsonparsed = JSON.parse(reader.result);
            // Переносим все ключи из файла настроек в localStorage.
            for (const [key, value] of Object.entries(jsonparsed)) {
                localStorage.setItem(key, value);
            }
            alert("Настройки расширения в localstorage загружены успешно!");
        } catch (err) {
            console.error('Не удалось разобрать файл настроек:', err);
            alert("Файл настроек повреждён или имеет неверный формат!");
        }
    };

    reader.readAsText(file);
});



