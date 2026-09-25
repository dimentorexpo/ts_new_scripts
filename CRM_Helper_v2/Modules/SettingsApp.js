const _sa_close = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const _sa_save = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
const _sa_dl = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
const _sa_play = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

var win_SettingsApp =  // описание элементов главного окна
    `<style>
        #SettingsApp_bar { width: 372px; padding: 0 0 10px 0; border: 1px solid rgba(255,255,255,.09);
            border-radius: 16px; overflow: hidden; color: #e2e8f0;
            background: linear-gradient(165deg, #1e1c26 0%, #151320 100%);
            box-shadow: 0 16px 44px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.03);
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
        #SettingsApp_1str { display: flex; align-items: center; gap: 6px; margin: 0; padding: 10px 12px;
            background: linear-gradient(135deg, rgba(201,168,76,.14), rgba(139,111,46,.05));
            border-bottom: 1px solid rgba(255,255,255,.07); cursor: grab; user-select: none; }
        #SettingsApp_1str:active { cursor: grabbing; }
        #SettingsApp_1str > span:last-child { margin-left: auto; display: flex; align-items: center; gap: 6px;
            color: #c9a84c; font-size: 12px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; }
        .set-sec { margin: 10px 12px 0 12px; padding: 10px 12px 12px 12px; border-radius: 12px;
            background: linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,.015));
            border: 1px solid rgba(255,255,255,.07); }
        .set-sec-title { display: flex; align-items: center; gap: 7px; margin-bottom: 9px;
            font-size: 11px; font-weight: 800; letter-spacing: 1.1px; text-transform: uppercase; color: #c9a84c; }
        .set-sec-title::after { content: ''; flex: 1; height: 1px;
            background: linear-gradient(90deg, rgba(201,168,76,.35), transparent); }
        .set-row { display: flex; align-items: center; gap: 8px; margin-top: 7px; flex-wrap: wrap; }
        .set-label { color: #b6c2d2; font-size: 12.5px; }
        #SettingsApp_bar .inputCRM { background: rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.1);
            color: #fff; border-radius: 9px; padding: 6px 9px; font-size: 12.5px; outline: none;
            transition: border-color .2s ease, box-shadow .2s ease; }
        #SettingsApp_bar .inputCRM:focus { border-color: rgba(201,168,76,.6);
            box-shadow: 0 0 0 3px rgba(201,168,76,.15); }
        #SettingsApp_bar select.inputCRM { color: #e2e8f0; text-align: center; }
        #SettingsApp_bar select.inputCRM option { background: #1e1c26; color: #e2e8f0; }
        #soundlistaddrCRM { flex: 1; min-width: 210px; text-align: center; }
        #rangeCRM { flex: 1; min-width: 110px; accent-color: #c9a84c; }
        .set-chip { display: inline-flex; align-items: center; gap: 7px; padding: 7px 11px; border-radius: 10px;
            background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.09);
            color: #cbd5e1; font-size: 12.5px; cursor: pointer; transition: all .18s ease; }
        .set-chip:hover { border-color: rgba(201,168,76,.5); transform: translateY(-1px); }
        .set-chip input[type="checkbox"] { accent-color: #c9a84c; margin: 0; }
        #SettingsApp_bar .btnCRM { border-radius: 9px; }
        #test_stdCRM, #test_teachCRM { width: 120px; text-align: center; }
        #soundplayintervalCRM { width: 56px; text-align: center; }
        .set-fs-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .set-fs-row .btnCRM { flex: 1; justify-content: center; white-space: nowrap; }
        /* Переключатель звука */
        .checkbox-audio { display: inline-flex; margin-left: auto; }
        .checkbox-audio-switch-CRM { position: relative; display: inline-block; width: 40px; height: 22px;
            background: rgba(255,255,255,.12); border-radius: 22px; transition: background .2s ease; cursor: pointer; }
        .checkbox-audio-switch-CRM::after { content: ''; position: absolute; top: 3px; left: 3px;
            width: 16px; height: 16px; border-radius: 50%; background: #94a3b8;
            transition: transform .2s ease, background .2s ease; }
        #audioCRMswitcher { display: none; }
        #audioCRMswitcher:checked + .checkbox-audio-switch-CRM { background: rgba(201,168,76,.55); }
        #audioCRMswitcher:checked + .checkbox-audio-switch-CRM::after {
            transform: translateX(18px); background: #fde68a; box-shadow: 0 0 8px rgba(201,168,76,.8); }
    </style>
    <div id="SettingsApp_bar">
        <div id="SettingsApp_1str">
            <button class="buttonHide" title="скрывает меню" id="hideSettingsApp">${_sa_close} hide</button>
            <span>⚙ Settings</span>
        </div>

        <!-- ЗВУК -->
        <div class="set-sec">
            <div class="set-sec-title">🔔 Звуковые оповещения</div>
            <div class="set-row">
                <select class="inputCRM" id="soundlistaddrCRM">
                    <option selected="" disabled="">Звук нового сообщения</option>
                    <option value="othersound">Выбрать свой звук</option>
                </select>
                <button class="btnCRM btnCRMsmall" title="Проверка звука" id="sound_testCRM" style="display:flex; align-items:center; justify-content:center;">${_sa_play}</button>
                <label title="Включение и отключение звука входящих запросов" class="checkbox-audio">
                    <input id="audioCRMswitcher" type="checkbox" checked="">
                        <span class="checkbox-audio-switch-CRM"></span>
                </label>
            </div>
            <div class="set-row">
                <input class="inputCRM" id="sound_adrCRM" placeholder="Введи адрес звука" autocomplete="off" type="text" style="display: none; flex: 1; min-width: 180px;">
                <button class="btnCRM btnCRMsmall" title="Сохранить звук" id="sound_saveCRM" style="display: none; align-items:center;">${_sa_save}</button>
            </div>
            <div class="set-row">
                <span class="set-label">Громкость</span>
                <input id="rangeCRM" min="0" max="1" value="1.0" step="0.1" type="range">
            </div>
            <div class="set-row">
                <label class="set-chip" title="Повторять звук новой задачи">
                    <input type="checkbox" id="repeatsoundselectCRM"> 🔁 Повторять звук
                </label>
            </div>
            <div class="set-row">
                <span class="set-label">Интервал повтора:</span>
                <input class="inputCRM" title="Ввод интервала в секундах между повторами звука нового чата" id="soundplayintervalCRM" placeholder="N" autocomplete="off" type="number" maxlength="2" min="0" max="59">
                <span class="set-label">сек</span>
                <button class="btnCRM btnCRMsmall" title="Внести изменения в интервал между повторами звука нового чата" id="setsoundplayintervalCRM">SET ✓</button>
            </div>
        </div>

        <!-- АВТОМАТИКА -->
        <div class="set-sec">
            <div class="set-sec-title">⚡ Автоматизация</div>
            <div class="set-row">
                <label class="set-chip" title="Автоматическое взятие задач в работу" style="flex:1; justify-content:flex-start;">
                    <input type="checkbox" id="skyautoEnabledCRM"> 🤖 Автовзятие задач (SkyAuto)
                </label>
            </div>
        </div>

        <!-- ТЕСТОВЫЕ АККАУНТЫ -->
        <div class="set-sec">
            <div class="set-sec-title">👤 Тестовые аккаунты</div>
            <div class="set-row">
                <input class="inputCRM" id="test_stdCRM" placeholder="ID тест У" autocomplete="off" title="ID личного тестового ученика" type="text">
                <button class="btnCRM btnCRMsmall" id="setteststdCRM" title="Добавить в localstorage ID тестового У">💾</button>
                <input class="inputCRM" id="test_teachCRM" placeholder="ID тест П" autocomplete="off" title="ID личного тестового преподавателя" type="text">
                <button class="btnCRM btnCRMsmall" id="settestteachCRM" title="Добавить в localstorage ID тестового П">💾</button>
            </div>
        </div>

        <!-- РЕЗЕРВНАЯ КОПИЯ -->
        <div class="set-sec">
            <div class="set-sec-title">💾 Резервная копия</div>
            <div class="set-fs-row">
                <button class="btnCRM" id="savesettingstofileCRM" title="Сохранить настройки в .json" style="color: #e5ece6; display:flex; align-items:center; gap:4px;">${_sa_save} Экспорт</button>
                <input class="btnCRM" type="file" id="fileinputCRM" title="Загружает все настройки в localstorage из ранее сохраненного файла настроек в формте .json" style="display:none;">
                <label class="btnCRM" style="color: #e5ece6; background: linear-gradient(135deg,#0e7490,#155e75); padding: 6px 10px; border: 1px solid rgba(255,255,255,.12); display:flex; align-items:center; gap:4px; cursor:pointer;" for="fileinputCRM">${_sa_dl} Импорт</label>
            </div>
        </div>
    </div>
    `;

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



