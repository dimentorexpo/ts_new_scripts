async function init_settings() {
    const data = await getStorageData(['TS_addr', 'KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']); // Получаем данные из хранилища

    // Присваиваем данные константам
    const TS_addr = data.TS_addr;
    const KC_addr = data.KC_addr;
    const TP_addr = data.TP_addr;
    const KC_addrRzrv = data.KC_addrRzrv;
    const TP_addrRzrv = data.TP_addrRzrv;

    // Универсальная функция для проверки и установки значений по умолчанию
    function setDefaultValue(key, defaultValue) {
        if (localStorage.getItem(key) == null) {
            localStorage.setItem(key, defaultValue);
        }
    }

    // Светлая/темная тема
    setDefaultValue('extentiontheme', 'light');

    // Цвет заливки чата перед автозакрытием
    setDefaultValue('defaclschatcolor', '#FF47CA');

    // Цвет заливки чата только взятого в работу
    setDefaultValue('answchatcolor', '#A0522D');

    // Цвет заливки чата ожидающего ответа
    setDefaultValue('responschatcolor', '#DDA0DD');

    // Для интервала воспроизведения звука
    setDefaultValue('splinter', 3);

    // Для переключателя вкл/выкл звук
    setDefaultValue('audio', 1);

    // Громкость звука 
    setDefaultValue('audiovol', 1);

    // Для скрытия окна создания задач
    setDefaultValue('hideTaskWindow', 1);

    // Для отображения быстрых тэгов
    setDefaultValue('showquicktags', 0);

    var win_Settings =  // описание элементов окна ссылок
        `<span style="width: 500px">
        <span style="cursor: -webkit-grab;">
            <div style="margin: 5px; width: 500px;" id="settings_head">
                <button title="Скрытие меню" id="hideMeSettings" class="mainButton buttonHide">hide</button>
            </div>

            <div style="border: 2px double black; background-color: #464451" id="set_bar">
                <div style="margin: 5px; width: 500px">
                    <select style="height:28px; width:140px; text-align:center" id="soundlistaddr">
                        <option selected="" disabled="">Звук нового сообщения</option>
                        <option value="othersound">Выбрать свой звук</option>
                     </select>
                    <button class="mainButton" title="Проверка звука при добавленной ссылке" id="sound_test">▶</button>
                    <label title="Включение и отключение звука в АФ входящих запросов" class="checkbox-audio">
                        <input id="audioswitcher" type="checkbox" checked="">
                        <span class="checkbox-audio-switch"></span>
                    </label>
                    <span style="color:bisque">Громкость</span>
                    <input id="range" min="0" max="1" value="1.0" step="0.025" type="range">
                    <input id="sound_adr" placeholder="Введи адрес звука" autocomplete="off" type="text" style="display: none; text-align: center; width: 210px; color: black;">
                    <button class="mainButton" title="Сохраняет ссылки на новый источник звука для входящего запроса в АФ" id="sound_save" style="display: none">💾</button>
                    <br>
                    <span style="color:bisque">Интервал воспроизведения звука:</span>
                    <input title="Ввод интервала в секундах между повторами звука нового чата" id="soundplayinterval" placeholder="N" autocomplete="off" oninput="maxLengthCheck(this)" type="number" maxlength="2" min="0" max="59" style="text-align: center; margin-top: 5px; width: 50px; color: black;">
                    <button class="mainButton" title="Внести изменения в интервал между повторами звука нового чата" id="setsoundplayinterval" style="margin-top: 5px">SET⌚</button>
                    <br>
                    <div class="onlyfortp">
                        <label style="color:bisque; margin-left: 5px;"><input type="checkbox" id="hidelpmwindow">Скрыть окно с У П</label>
                        <label style="color:bisque; margin-left: 5px;" title="Добавить тэги в боковое меню"><input type="checkbox" id="showquicktags">Добавить тэги</label>
                        <label style="color:bisque; margin-left: 5px;"><input type="checkbox" id="hideInnerTaskCreate">Скрыть окно АФ создании задачи</label>
                        <br>
						<label style="color:bisque"> Автостатус при авторизации в AF</label>
						<select style="height:28px; width:140px; text-align:center" id="defaultStatusAfterLogin">
							<option value="Online" style="background: green;">Онлайн</option>
							<option value="Busy" style="background: yellow;">Занят</option>
							<option value="Offline" style="background: red;">Офлайн</option>
						</select>
						 <br>
                    </div>
                    <div>
                        <div style="float: left;">
                            <label style="color:bisque;"><input type="color" id="aclstimepicker">Цвет заливки закрытия чата</label>
                            <br>
                            <label style="color:bisque;"><input type="color" id="answtimepicker">Цвет заливки нового чата</label>
                            <br>
                            <label style="color:bisque;"><input type="color" id="responstimepicker">Цвет заливки неотвеченного чата</label>
                            <br>
                        </div>
                        
                        <div style="float: left; margin-left: 20px;">
                            <label style="color:bisque;">Выбор темы расширения</label>
                            <button class="mainButton" style="width:30px;" id="chagethemeextention" title="Переключение на светлую ☀ или темную 🌛 тему"></button>
                        </div>
                    </div>

                <div style="margin-top: 5px; width: 500px; clear: both;">
                    <span style="color:bisque;">Выберите отдел:</span>
                    <button class="mainButton onlyfortp" id="set_TPrezerv" title="Нажмите если вы из ТП и в АФ не работает Базы Знаний" style="margin-top: 5px">ТП рез</button>
                    <button class="mainButton onlyfortp" id="set_TP" title="Нажмите если вы из ТП" style="margin-top: 5px">ТП</button>
                    <button class="mainButton" id="set_KC" title="Нажмите если вы из КЦ" style="margin-top: 5px">КЦ</button>
                    <button class="mainButton" id="set_KCrezerv" title="Нажмите если вы из КЦ и в АФ не работает Базы Знаний" style="margin-top: 5px">КЦ рез</button>
                    <br>
                </div>
                <div class="onlyfortp">
                    <input id="test_std" placeholder="ID тест У" autocomplete="off" title = "ID личного тестового ученика" type="text" style="text-align: center; width: 100px; color: black;">
                    <button class="mainButton" id="setteststd" title="Добавить в localstorage ID тестового У" style="margin-top: 5px">💾</button>
                    <input id="test_teach" placeholder="ID тест П" autocomplete="off" title = "ID личного тестового преподавателя" type="text" style="text-align: center; width: 100px; color: black;">
                    <button class="mainButton" id="settestteach" title="Добавить в localstorage ID тестового П" style="margin-top: 5px">💾</button>
                </div>
                    <button class="mainButton" id="savesettingstofile" title="Сохраняет все настройки из localstorage в отдельный .json файл" style="color: #e5ece6; margin-top: 5px">💾 Сохранить настройки</button>
                    <input type="file" id="fileinput" title="Загружает все настройки в localstorage из ранее сохраненного файла настроек в формте .json" style="display:none;">
                    <label style="color: #e5ece6; background: #768d87; padding: 5px; border-radius: 5px; border: 1px solid #566963;" for="fileinput">⤵ Загрузить настройки</label>
                </div>
            </div>
        </span>
</span>`;

    const wintStataAF = createWindow('AF_Settings', 'winTopSettings', 'winLeftSettings', win_Settings);
    hideWindowOnDoubleClick('AF_Settings');
    hideWindowOnClick('AF_Settings', 'hideMeSettings');

    function ShowMustGoOn() { //функция вносит в локалсторедж адрес скрипта с гугл таблиц шаблонов для КЦ
        localStorage.setItem('scriptAdr', KC_addr)
        location.reload()
    }

    function AFthePieceofShitKC() { //функция вносит в локалсторедж адрес скрипта с гугл таблиц шаблонов для КЦ
        localStorage.setItem('scriptAdr', KC_addrRzrv)
        location.reload()
    }

    function WeAreTheChempions() { //функция вносит в локалсторедж адрес скрипта с гугл таблиц шаблонов для ТП
        localStorage.setItem('scriptAdr', TP_addr)
        localStorage.setItem('tpflag', 'ТП')
        location.reload()
    }

    function AFthePieceofShit() { //функция вносит в локалсторедж адрес скрипта с гугл таблиц шаблонов для ТП резервных тестовых
        localStorage.setItem('scriptAdr', TP_addrRzrv)
        localStorage.setItem('tpflag', 'ТП')
        location.reload()
    }

    function getLocalstorageToFile(fileName) { //функция сохранения содержимого localstorage в файл на компьютере

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

    function changesoundaddr() { //функция изменения адреса звука
        let objSoundList = document.getElementById('soundlistaddr');

        if (objSoundList.length > 1) {
            for (let i = 1; i < objSoundList.length; i++) {
                if (objSoundList[i].selected == true) {
                    if (objSoundList[i].value == "othersound") {
                        document.getElementById('sound_adr').style.display = '';
                        document.getElementById('sound_save').style.display = '';
                    } else {
                        document.getElementById('sound_adr').style.display = 'none';
                        document.getElementById('sound_save').style.display = 'none';
                        document.getElementById('sound_adr').value = "";
                        localStorage.setItem('sound_str', objSoundList[i].value);
                        audio = new Audio(localStorage.getItem('sound_str'));
                    }
                }
            }
        }
    }

    function changeAutoStatus() { //функция изменения статуса в АФ по умолчанию
        let objStatusList = document.getElementById('defaultStatusAfterLogin');

        if (objStatusList.length > 1) {
            for (let i = 0; i < objStatusList.length; i++) {
                if (objStatusList[i].selected == true) {
                    localStorage.setItem('afterLoginFunction', objStatusList[i].value)
                    console.log(localStorage.getItem('afterLoginFunction'))
                    switch (objStatusList[i].value) {
                        case "Offline":
                            objStatusList.style = "background:red; height: 28px; width: 140px; text-align: center; border-radius:20px;";
                            break;
                        case "Busy":
                            objStatusList.style = "background:yellow; height: 28px; width: 140px; text-align: center; border-radius:20px;";
                            break;
                        default:
                            objStatusList.style = "background:green; height: 28px; width: 140px; text-align: center; border-radius:20px;";
                            break;
                    }

                }
            }
        }

    }

    document.getElementById('soundlistaddr').addEventListener('change', changesoundaddr); // функция запоминания выбранного нового звука
    document.getElementById('defaultStatusAfterLogin').addEventListener('change', changeAutoStatus); // функция запоминания дефолтного статуса при его смене

    function paintstatus() { //функция перекрашивания статуса оператора онлайн зеленый, занят желтый, офлайн и перерыв красные
        const statusElem = document.querySelectorAll('.user_menu-status-name')[1];
        const buttonElems = document.querySelectorAll('.ant-btn');
        if (!statusElem) {
            return;
        }

        let color;
        let text;
        switch (statusElem.textContent) {
            case "Офлайн":
                color = "red";
                text = "Офлайн";
                break;
            case "Перерыв":
                color = "red";
                text = "Перерыв";
                break;
            case "Онлайн":
                color = "green";
                text = "Онлайн";
                break;
            case "Занят":
                color = "yellow";
                text = "Занят";
                break;
        }

        if (color) {
            let style = `background: ${color}; color: white; font-weight: 700`;
            if (color === "yellow") {
                style += "; color: black";
            }
            statusElem.style = style;

            let buttonElem;
            if (document.URL === "https://skyeng.autofaq.ai/tickets/archive") {
                buttonElem = buttonElems[5];
            } else {
                buttonElem = buttonElems[4];
            }

            if (buttonElem && buttonElem.textContent === text) {
                buttonElem.style.background = color;
            }
        }
    }

    // Блок настроек и взаимодействия с ними

    const soundTestBtn = document.getElementById('sound_test');

    soundTestBtn.onclick = function () { // кнопка тест звука
        const isPlaying = soundTestBtn.innerHTML == '▶';
        soundTestBtn.innerHTML = isPlaying ? '⏹' : '▶';
        soundTestBtn.title = isPlaying ? 'Остановить воспроизведение' : 'Проверка звука при добавленной ссылке';
        if (isPlaying) {
            audio.play();
            setTimeout(() => {
                soundTestBtn.innerHTML = '▶';
                soundTestBtn.title = 'Проверка звука при добавленной ссылке';
            }, Number(audio.duration * 1000 + 1).toFixed(0));
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    // Универсальная функция для установки и отображения цвета
    function setupColorPicker(elementId, localStorageKey, defaultColor) {
        const element = document.getElementById(elementId);
        const savedColor = localStorage.getItem(localStorageKey) || defaultColor;

        localStorage.setItem(localStorageKey, savedColor);
        element.value = savedColor;

        element.onchange = function () {
            localStorage.setItem(localStorageKey, this.value);
        };

        element.ondblclick = function () {
            localStorage.setItem(localStorageKey, defaultColor);
            element.value = defaultColor;
        };
    }

    // Универсальная функция для установки значений input
    function setupInputValue(elementId, localStorageKey, defaultValue = '') {
        const element = document.getElementById(elementId);
        const savedValue = localStorage.getItem(localStorageKey) || defaultValue;
        element.value = savedValue;
    }

    // Настройка темы интерфейса
    function setupThemeButton(buttonId, localStorageKey) {
        const button = document.getElementById(buttonId);
        const currentTheme = localStorage.getItem(localStorageKey) || 'light';

        const updateButtonIcon = (theme) => {
            button.innerHTML = theme === 'light' ? '☀' : theme === 'dark' ? '🌛' : '🌚';
        };

        updateButtonIcon(currentTheme);
        localStorage.setItem(localStorageKey, currentTheme);

        // Можно добавить обработчик клика для изменения темы
        button.onclick = function () {
            const currentTheme = localStorage.getItem(localStorageKey) || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem(localStorageKey, newTheme);
            updateButtonIcon(newTheme);ы
        };        
    }

    // Универсальная функция для настройки чекбоксов
    function setupCheckbox(checkboxId, localStorageKey, callback = () => { }) {
        const checkbox = document.getElementById(checkboxId);
        const savedValue = localStorage.getItem(localStorageKey) || '0';

        checkbox.checked = savedValue === '1';

        checkbox.onclick = function () {
            const isChecked = checkbox.checked ? '1' : '0';
            localStorage.setItem(localStorageKey, isChecked);
            callback(isChecked);
        };
        callback(savedValue);
    }

    // Настройка громкости
    function setupRange(rangeId, localStorageKey, defaultValue = 1, callback = () => { }) {
        const range = document.getElementById(rangeId);
        const savedValue = localStorage.getItem(localStorageKey) || defaultValue;

        range.value = savedValue;
        callback(savedValue);

        range.onchange = function () {
            const newValue = this.value;
            localStorage.setItem(localStorageKey, newValue);
            callback(newValue);
        };
    }

    document.getElementById('setting').onclick = function () { // открывает параметры
        if (document.getElementById('AF_Settings').style.display == '')
            document.getElementById('AF_Settings').style.display = 'none'
        else {
            document.getElementById('AF_Settings').style.display = ''

            setupColorPicker('aclstimepicker', 'defaclschatcolor', '#FF47CA');
            setupColorPicker('answtimepicker', 'answchatcolor', '#A0522D');
            setupColorPicker('responstimepicker', 'responschatcolor', '#DDA0DD');

            setupInputValue('test_std', 'test_stud');
            setupInputValue('test_teach', 'test_teach');
            setupInputValue('soundplayinterval', 'splinter', 3);
            setupThemeButton('chagethemeextention', 'extentiontheme');

            // Настройка чекбокса для скрытия окна задач
            setupCheckbox('hideInnerTaskCreate', 'hideTaskWindow');

            // Настройка чекбокса для отображения/скрытия дополнительных тэгов
            setupCheckbox('showquicktags', 'showquicktags');

            // Настройка чекбокса для скрытия окна Л П МВУ
            setupCheckbox('hidelpmwindow', 'disablelpmwindow', (isChecked) => {
                document.getElementById('TestUsers').style.display = isChecked === '1' ? 'none' : '';
            });

            // Настройка громкости звука
            setupRange('range', 'audiovol', 1, (volume) => {
                audio.volume = volume;
            });

            // Настройка переключателя звука
            setupCheckbox('audioswitcher', 'audio', (isChecked) => {
                if (isChecked === '1') {
                    // Логика для включенного звука
                    console.log("Звук включен");
                } else {
                    // Логика для выключенного звука
                    if (typeof soundintervalset !== 'undefined' && soundintervalset !== null) {
                        clearInterval(soundintervalset);
                        soundintervalset = null;
                    }
                    console.log("Звук выключен");
                }
            });

            // Сохранение ID тестового ученика
            document.getElementById('setteststd').onclick = function () {
                const value = document.getElementById('test_std').value;
                if (value) {
                    localStorage.setItem('test_stud', value);
                } else {
                    console.log("Введите ID тестового ученика");
                }
            };

            // Сохранение ID тестового преподавателя
            document.getElementById('settestteach').onclick = function () {
                const value = document.getElementById('test_teach').value;
                if (value) {
                    localStorage.setItem('test_teach', value);
                } else {
                    console.log("Введите ID тестового преподавателя");
                }
            };

            // скрываем от других отделов возможность включать расширение с ТП  плююшками и шаблонами

            let needtohide = document.getElementsByClassName('onlyfortp');

            if (opsection !== 'ТП' && opsection !== 'ТП ОС') {
                for (i = 0; i < needtohide.length; i++) {
                    needtohide[i].style.display = 'none'
                }
            } else {
                for (i = 0; i < needtohide.length; i++) {
                    needtohide[i].style.display = ''
                }
            }

            switch (localStorage.getItem('scriptAdr')) {
                case TP_addr:
                    document.getElementById('set_TP').style.background = 'green';
                    break;
                case TP_addrRzrv:
                    document.getElementById('set_TPrezerv').style.background = 'green';
                    break;
                case KC_addr:
                    document.getElementById('set_KC').style.background = 'green';
                    break;
                case KC_addrRzrv:
                    document.getElementById('set_KCrezerv').style.background = 'green';
                    break;
                default:
                    break;
            }
            //

            let objSoundList = document.getElementById('soundlistaddr')
            let soundsfromdoc;
            let soundsconteiner;

            async function getsoundsfromdoc() { // загрузка списка звуков из файла
                const soundsfromdoc = 'https://script.google.com/macros/s/AKfycbyD1l-oLcE-BBmyN1QmcHKoi0rwVfCwWjE6cfTqw6Y9QQGAju-9inKbwSOfHCI6qBEjtg/exec';
                const response = await fetch(soundsfromdoc);
                const soundsdata = await response.json();
                const soundsconteiner = soundsdata.result;
                soundsconteiner.forEach((sound) => {
                    if (sound[0] !== '') {
                        addOption(objSoundList, `${sound[0]}`, `${sound[1]}`)
                    }
                });
                Array.prototype.forEach.call(objSoundList.children, (option) => { // проверяем какой звук выбран
                    if (option.value === localStorage.getItem('sound_str')) {
                        option.selected = true;
                    }
                });
                if (objSoundList.children[0].selected) {
                    objSoundList.children[1].selected = true;
                    document.getElementById('sound_adr').style.display = '';
                    document.getElementById('sound_save').style.display = '';
                    document.getElementById('sound_adr').value = localStorage.getItem('sound_str');
                }
            }

            if (objSoundList.length < 3) {
                getsoundsfromdoc()
            }

            //Для автостатуса меняем настройку сверяя с сохраненной в localstorage
            let objStatusListMain = document.getElementById('defaultStatusAfterLogin');

            Array.prototype.forEach.call(objStatusListMain.children, (option) => { // проверяем какой статус выбран
                if (option.value === localStorage.getItem('afterLoginFunction')) {
                    option.selected = true;

                    switch (option.value) {
                        case "Offline":
                            objStatusListMain.style = "background:red; height: 28px; width: 140px; text-align: center; border-radius:20px;";
                            break;
                        case "Busy":
                            objStatusListMain.style = "background:yellow; height: 28px; width: 140px; text-align: center; border-radius:20px;";
                            break;
                        default:
                            objStatusListMain.style = "background:green; height: 28px; width: 140px; text-align: center; border-radius:20px;";
                            break;
                    }


                }
            }
            );

            //Для интервала между воспроизведением звука
            document.getElementById('setsoundplayinterval').onclick = function () {
                if (document.getElementById('soundplayinterval').value != '') {
                    localStorage.setItem('splinter', document.getElementById('soundplayinterval').value);
                } else console.log("Базовое значение равно 3 секунды")
            }

            document.getElementById('sound_save').onclick = function () { //функция сохранения адреса звукового уведомления о входящем чате в АФ
                localStorage.setItem('sound_str', document.getElementById('sound_adr').value);
                if (document.getElementById('sound_adr').value == "")
                    audio = new Audio("https://grumstv.github.io/Sounds/msg.mp3");
                else {
                    audio = new Audio(document.getElementById('sound_adr').value);
                    document.getElementById('sound_save').textContent = "✅";
                    setTimeout(function () {
                        document.getElementById('sound_save').textContent = "💾";
                    }, 3000);
                }
            }

            if (flagLangBut == 0) {
                document.getElementById('languageAF').onclick = function () {
                    if (this.innerHTML == "Русский") {
                        this.innerHTML = "Английский";
                        document.getElementById('AF_helper').style.background = "#EBC7DF";
                    } else {
                        this.innerHTML = "Русский";
                        document.getElementById('AF_helper').style.background = "#464451";
                    }
                }
            }

            document.getElementById('savesettingstofile').onclick = function () {  // по клику на кнопку Сохранить настройки сохраянется на жесткомм диске файл с содержимым localstorage
                getLocalstorageToFile('settings-af')
            }

            document.getElementById('fileinput').onclick = function () { // по клику на кнопку Загрузить настройки предлагает выбрать файл настроек, добавлять при этом ранее сохраненный в формате .json
                let fileInput = document.getElementById('fileinput');
                let jsonparsed;

                fileInput.addEventListener('change', function (e) {
                    let file = fileInput.files[0];
                    let textType = /.json/;

                    if (file.type.match(textType)) {
                        let reader = new FileReader();

                        reader.onload = function (e) {
                            jsonparsed = JSON.parse(reader.result)
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
        }
    }

    // конец блока настроек

    setInterval(paintstatus, 5000); //  вызов функции перекрашивания статуса в котором оператор находится

    document.getElementById('set_KC').addEventListener('click', ShowMustGoOn)
    document.getElementById('set_KCrezerv').addEventListener('click', AFthePieceofShitKC)
    document.getElementById('set_TP').addEventListener('click', WeAreTheChempions)
    document.getElementById('set_TPrezerv').addEventListener('click', AFthePieceofShit)

}

init_settings()