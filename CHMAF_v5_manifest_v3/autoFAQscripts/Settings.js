/**
 * Refactored Settings for ChMAF Extension
 * Visual Style: Glassmorphism (Scoped)
 */

async function init_settings() {
    // --- Constants & Configuration ---
    const DEFAULTS = {
        extentiontheme: 'light',
        defaclschatcolor: '#FF47CA',
        answchatcolor: '#A0522D',
        responschatcolor: '#DDA0DD',
        splinter: 3,
        audio: 1,
        audiovol: 1,
        hideTaskWindow: 1,
        showquicktags: 0,
        dblhidewindow: 0,
        brnotificatios: 0,
        clearlessoninfo: 0,
        disablelpmwindow: 0,
        AF_windowScale: 100,
        afterLoginFunction: 'Online',
        sound_str: 'https://grumstv.github.io/Sounds/msg.mp3'
    };

    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']);
    const ADDR = {
        KC: data.KC_addr,
        TP: data.TP_addr,
        KC_Rzrv: data.KC_addrRzrv,
        TP_Rzrv: data.TP_addrRzrv
    };

    // --- Core Logic & State Management ---
    const Settings = {
        get: (key) => localStorage.getItem(key) ?? DEFAULTS[key],
        set: (key, val) => localStorage.setItem(key, val),

        initDefaults() {
            Object.entries(DEFAULTS).forEach(([key, val]) => {
                if (localStorage.getItem(key) === null) this.set(key, val);
            });
            // Initialize global audio if not present
            const savedVol = parseFloat(this.get('audiovol'));
            if (typeof audio === 'undefined' || audio === null) {
                audio = new Audio(this.get('sound_str'));
            }
            audio.volume = savedVol;
        },


    };

    Settings.initDefaults();

    // --- UI Component (Scoped Glassmorphism Styles) ---
    const injectStyles = () => {
        if (document.getElementById('chmaf-settings-styles')) return;
        const style = document.createElement('style');
        style.id = 'chmaf-settings-styles';
        style.innerHTML = `
            .set-glass-panel {
                background: rgba(30, 32, 45, 0.8) !important;
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 20px;
                color: #e0e0e0;
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5);
                padding: 0 !important;
                overflow: hidden;
                z-index: 1000001;
            }
            .set-glass-header {
                background: rgba(255, 255, 255, 0.07);
                padding: 12px 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                cursor: grab;
            }
            .set-glass-content {
                padding: 20px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .set-glass-content::-webkit-scrollbar { width: 6px; }
            .set-glass-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }

            .set-group {
                background: rgba(255, 255, 255, 0.04);
                border-radius: 14px;
                padding: 16px;
                margin-bottom: 16px;
                border: 1px solid rgba(255, 255, 255, 0.06);
            }
            .set-row {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 14px;
                flex-wrap: nowrap;
            }
            .set-label {
                color: #bbb;
                font-size: 0.9em;
                min-width: 140px;
                flex-shrink: 0;
            }
            .set-btn {
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.12);
                color: #fff;
                padding: 6px 14px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 13px;
                white-space: nowrap;
            }
            .set-btn:hover { background: rgba(255, 255, 255, 0.15); transform: translateY(-1.5px); border-color: rgba(255,255,255,0.2); }
            .set-btn:active { transform: translateY(0.5px); }
            .set-btn.active { background: #388e3c; border-color: #4caf50; }

            .set-input {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                color: #fff;
                padding: 6px 12px;
                outline: none;
                font-size: 13px;
                transition: all 0.2s;
            }
            .set-input:focus { border-color: #7c4dff; background: rgba(0,0,0,0.5); }

            .set-select {
                background: #1e202d;
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 8px;
                padding: 6px;
                font-size: 13px;
                outline: none;
            }
            .set-slider {
                flex-grow: 1;
                accent-color: #7c4dff;
                height: 4px;
                cursor: pointer;
            }
            .set-dept-badge {
                flex: 1;
                font-size: 12px;
                font-weight: 600;
                text-align: center;
                padding: 8px 4px;
            }
            .set-grid-colors {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 12px;
                width: 100%;
            }
            .set-color-wrap {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 6px;
                font-size: 11px;
                color: #999;
            }
        `;
        document.head.appendChild(style);
    };

    const win_Settings = `
        <div class="set-glass-panel" style="width: 540px" id="settings_container">
            <div class="set-glass-header" id="settings_head">
                <span style="font-weight: 600; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">⚙</span> Настройки ChMAF
                </span>
                <button id="hideMeSettings" class="set-btn" style="padding: 4px 10px; font-size: 11px; opacity: 0.8;">hide</button>
            </div>

            <div class="set-glass-content">
                <!-- Аудио и Масштаб -->
                <div class="set-group">
                    <div class="set-row">
                        <select id="soundlistaddr" class="set-select" style="width: 190px; text-align:center;">
                            <option selected disabled>Звук уведомления</option>
                            <option value="othersound">Свой звук...</option>
                        </select>
                        <button class="set-btn" id="sound_test" title="Проверить">▶</button>
                        <label class="checkbox-audio" style="margin-left: auto;">
                            <input id="audioswitcher" type="checkbox">
                            <span class="checkbox-audio-switch"></span>
                        </label>
                    </div>

                    <div class="set-row" id="custom_sound_row" style="display: none;">
                        <input class="set-input" id="sound_adr" placeholder="URL звука" style="width: 100%;">
                        <button class="set-btn" id="sound_save">💾</button>
                    </div>

                    <div class="set-row">
                        <span class="set-label">Громкость</span>
                        <input id="range" type="range" class="set-slider" min="0" max="1" step="0.05">
                    </div>

                    <div class="set-row">
                        <span class="set-label">Масштаб окна</span>
                        <input id="scaleSliderAF" type="range" class="set-slider" min="50" max="100" step="1">
                        <span id="scale_val" style="min-width: 40px; text-align: right; font-size: 12px; font-family: monospace;">100%</span>
                    </div>

                    <div class="set-row">
                        <span class="set-label">Интервал звука (сек)</span>
                        <input class="set-input" id="soundplayinterval" type="number" style="width: 65px; text-align: center;">
                        <button class="set-btn" id="setsoundplayinterval">SET⌚</button>
                    </div>
                </div>

                <!-- Темы и Цвета -->
                <div class="set-group">

                    <div class="set-row" style="margin-top: 10px;">
                        <div class="set-grid-colors">
                            <div class="set-color-wrap">
                                <input type="color" id="aclstimepicker" class="set-input" style="padding:0; width:34px; height:34px; border-radius:50%; border:2px solid rgba(255,255,255,0.1); cursor:pointer;">
                                <span>Закрытие</span>
                            </div>
                            <div class="set-color-wrap">
                                <input type="color" id="answtimepicker" class="set-input" style="padding:0; width:34px; height:34px; border-radius:50%; border:2px solid rgba(255,255,255,0.1); cursor:pointer;">
                                <span>Новый</span>
                            </div>
                            <div class="set-color-wrap">
                                <input type="color" id="responstimepicker" class="set-input" style="padding:0; width:34px; height:34px; border-radius:50%; border:2px solid rgba(255,255,255,0.1); cursor:pointer;">
                                <span>Ожидание</span>
                            </div>
                        </div>
                    </div>
                    <div class="set-row" style="margin-top: 5px;">
                         <span class="set-label">Статус при входе</span>
                         <select id="defaultStatusAfterLogin" class="set-select" style="flex: 1; text-align:center;">
                            <option value="Online">🟢 Онлайн</option>
                            <option value="Busy">🟡 Занят</option>
                            <option value="Offline">🔴 Офлайн</option>
                        </select>
                    </div>
                </div>

                <!-- Функционал (Checkbox list) -->
                <div class="set-group onlyfortp">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85em; color: #ccc;">
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="hidelpmwindow"> Скрыть окно Л П МВУ</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="showquicktags"> Быстрые тэги в меню</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="hideInnerTaskCreate"> Скрыть окно задач</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="dblhidewindow"> Отключить dblclick hide</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="brnotificatios"> Отключить Notifications</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="clearlessoninfo"> Не очищать LessonInfo</label>
                    </div>
                </div>

                <!-- Отделы и Тестовые ID -->
                <div class="set-group">
                    <div class="set-row">
                        <button class="set-btn set-dept-badge" id="set_TP">ТП</button>
                        <button class="set-btn set-dept-badge" id="set_TPrezerv">ТП рез</button>
                        <button class="set-btn set-dept-badge" id="set_KC">КЦ</button>
                        <button class="set-btn set-dept-badge" id="set_KCrezerv">КЦ рез</button>
                    </div>
                    <div class="set-row onlyfortp" style="margin-top: 10px;">
                        <div style="display: grid; grid-template-columns: 1fr 40px 1fr 40px; gap: 8px; width: 100%; align-items: center;">
                            <input class="set-input" id="test_std" placeholder="ID Ученика" style="width: 100%; box-sizing: border-box; text-align:center;">
                            <button class="set-btn" id="setteststd" style="padding: 6px 0; width: 100%;">💾</button>
                            <input class="set-input" id="test_teach" placeholder="ID Препода" style="width: 100%; box-sizing: border-box; text-align:center;">
                            <button class="set-btn" id="settestteach" style="padding: 6px 0; width: 100%;">💾</button>
                        </div>
                    </div>
                </div>

                <!-- Backup -->
                <div class="set-row" style="justify-content: center; gap: 20px; margin-top: 10px; margin-bottom: 0;">
                    <button class="set-btn" id="savesettingstofile" style="background: rgba(124, 77, 255, 0.15); border-color: rgba(124, 77, 255, 0.3);">💾 Экспорт</button>
                    <label class="set-btn" for="fileinput" style="background: rgba(255, 255, 255, 0.05);">⤵ Импорт</label>
                    <input type="file" id="fileinput" style="display:none;">
                </div>
            </div>
        </div>
    `;

    injectStyles();
    createWindow('AF_Settings', 'winTopSettings', 'winLeftSettings', win_Settings);
    hideWindowOnDoubleClick('AF_Settings');
    hideWindowOnClick('AF_Settings', 'hideMeSettings');

    // --- Helpers ---
    const bindToggle = (id, key, cb) => {
        const el = document.getElementById(id);
        el.checked = Settings.get(key) == 1;
        el.onclick = () => {
            const val = el.checked ? 1 : 0;
            Settings.set(key, val);
            cb?.(val);
        };
        cb?.(el.checked ? 1 : 0);
    };

    const bindInput = (id, key) => {
        const el = document.getElementById(id);
        el.value = Settings.get(key);
        el.onchange = () => Settings.set(key, el.value);
    };

    // --- Initialization & Event Listeners ---
    const ui = {
        btnSetting: document.getElementById('setting'),
        win: document.getElementById('AF_Settings'),
        soundList: document.getElementById('soundlistaddr'),
        statusList: document.getElementById('defaultStatusAfterLogin'),
        scaleSlider: document.getElementById('scaleSliderAF'),
        scaleVal: document.getElementById('scale_val'),

    };

    // --- Scale Logic (Global for init) ---
    const applyScale = (val, isInit = false) => {
        const target = document.getElementById('AF_helper') || document.getElementById('addTmpWrapper');
        if (target) {
            target.style.transformOrigin = 'top left';
            target.style.transform = `scale(${val / 100})`;
            if (!isInit) target.style.transition = 'transform 0.15s ease-out';
        }
        const scaleValEl = document.getElementById('scale_val');
        if (scaleValEl) scaleValEl.innerText = `${val}%`;
    };

    // Apply scale immediately on load
    setTimeout(() => applyScale(Settings.get('AF_windowScale'), true), 100);

    ui.btnSetting.onclick = () => {
        ui.win.style.display = ui.win.style.display === 'none' ? '' : 'none';
        if (ui.win.style.display === 'none') return;

        // Sync UI
        bindInput('aclstimepicker', 'defaclschatcolor');
        bindInput('answtimepicker', 'answchatcolor');
        bindInput('responstimepicker', 'responschatcolor');
        bindInput('test_std', 'test_stud');
        bindInput('test_teach', 'test_teach');
        bindInput('soundplayinterval', 'splinter');

        bindToggle('hideInnerTaskCreate', 'hideTaskWindow');
        bindToggle('showquicktags', 'showquicktags');
        bindToggle('dblhidewindow', 'dblhidewindow');
        bindToggle('brnotificatios', 'brnotificatios');
        bindToggle('clearlessoninfo', 'clearlessoninfo');

        bindToggle('hidelpmwindow', 'disablelpmwindow', (v) => {
            const lpm = document.getElementById('TestUsers');
            if (lpm) lpm.style.display = v == 1 ? 'none' : '';
        });

        bindToggle('audioswitcher', 'audio', (v) => {
            if (v == 0 && typeof soundintervalset !== 'undefined') {
                clearInterval(soundintervalset);
                soundintervalset = null;
            }
        });

        // Volume
        const range = document.getElementById('range');
        range.value = Settings.get('audiovol');
        range.oninput = () => {
            Settings.set('audiovol', range.value);
            if (typeof audio !== 'undefined' && audio) audio.volume = range.value;
        };

        // Scale Sync
        const scaleVal = Settings.get('AF_windowScale');
        ui.scaleSlider.value = scaleVal;
        ui.scaleVal.innerText = `${scaleVal}%`;

        ui.scaleSlider.oninput = () => applyScale(ui.scaleSlider.value);
        ui.scaleSlider.onchange = () => Settings.set('AF_windowScale', ui.scaleSlider.value);

        // Status
        ui.statusList.value = Settings.get('afterLoginFunction');
        ui.statusList.onchange = () => {
            Settings.set('afterLoginFunction', ui.statusList.value);
            const colors = { Online: '#388e3c', Busy: '#fbc02d', Offline: '#d32f2f' };
            ui.statusList.style.background = colors[ui.statusList.value];
        };
        ui.statusList.dispatchEvent(new Event('change'));

        // TP/KC visibility
        const isTP = (opsection === 'ТП' || opsection === 'ТП ОС');
        document.querySelectorAll('.onlyfortp').forEach(el => el.style.display = isTP ? '' : 'none');

        // Active department highlight
        const activeAddr = localStorage.getItem('scriptAdr');
        const deptMap = { [ADDR.TP]: 'set_TP', [ADDR.TP_Rzrv]: 'set_TPrezerv', [ADDR.KC]: 'set_KC', [ADDR.KC_Rzrv]: 'set_KCrezerv' };
        if (deptMap[activeAddr]) document.getElementById(deptMap[activeAddr]).classList.add('active');
    };

    // --- Audio Logic ---
    ui.soundList.onchange = () => {
        const val = ui.soundList.value;
        const row = document.getElementById('custom_sound_row');
        if (val === 'othersound') {
            row.style.display = 'flex';
        } else {
            row.style.display = 'none';
            Settings.set('sound_str', val);
            audio = new Audio(val);
            audio.volume = parseFloat(Settings.get('audiovol'));
        }
    };

    document.getElementById('sound_test').onclick = function () {
        const isPlay = this.innerText === '▶';
        this.innerText = isPlay ? '⏹' : '▶';
        if (isPlay && typeof audio !== 'undefined' && audio) {
            audio.play().catch(e => console.error('Audio play error:', e));
            setTimeout(() => { if (this.innerText === '⏹') this.innerText = '▶'; }, (audio.duration || 2) * 1000);
        } else if (typeof audio !== 'undefined' && audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    document.getElementById('sound_save').onclick = () => {
        const url = document.getElementById('sound_adr').value;
        if (!url) return;
        Settings.set('sound_str', url);
        audio = new Audio(url);
        audio.volume = parseFloat(Settings.get('audiovol'));
        document.getElementById('sound_save').innerText = '✅';
        setTimeout(() => document.getElementById('sound_save').innerText = '💾', 2000);
    };

    // Load Sounds
    if (ui.soundList.length < 3) {
        try {
            const resp = await fetch('https://script.google.com/macros/s/AKfycbyD1l-oLcE-BBmyN1QmcHKoi0rwVfCwWjE6cfTqw6Y9QQGAju-9inKbwSOfHCI6qBEjtg/exec');
            const data = await resp.json();
            data.result.forEach(s => {
                if (s[0]) {
                    const opt = new Option(s[0], s[1]);
                    ui.soundList.add(opt);
                    if (s[1] === Settings.get('sound_str')) opt.selected = true;
                }
            });
        } catch (e) { console.error('Failed to load sounds', e); }
    }

    // --- Save IDs ---
    document.getElementById('setteststd').onclick = () => {
        Settings.set('test_stud', document.getElementById('test_std').value);
        document.getElementById('setteststd').innerText = '✅';
        setTimeout(() => document.getElementById('setteststd').innerText = '💾', 2000);
    };
    document.getElementById('settestteach').onclick = () => {
        Settings.set('test_teach', document.getElementById('test_teach').value);
        document.getElementById('settestteach').innerText = '✅';
        setTimeout(() => document.getElementById('settestteach').innerText = '💾', 2000);
    };

    // --- Department Switchers ---
    const setDept = (addr, isTP) => {
        localStorage.setItem('scriptAdr', addr);
        if (isTP) localStorage.setItem('tpflag', 'ТП');
        else localStorage.removeItem('tpflag');
        location.reload();
    };

    document.getElementById('set_KC').onclick = () => setDept(ADDR.KC, false);
    document.getElementById('set_KCrezerv').onclick = () => setDept(ADDR.KC_Rzrv, false);
    document.getElementById('set_TP').onclick = () => setDept(ADDR.TP, true);
    document.getElementById('set_TPrezerv').onclick = () => setDept(ADDR.TP_Rzrv, true);

    // --- Backup Logic ---
    document.getElementById('savesettingstofile').onclick = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            data[k] = localStorage.getItem(k);
        }
        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `chmaf_settings_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    };

    document.getElementById('fileinput').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target.result);
                Object.entries(json).forEach(([k, v]) => localStorage.setItem(k, v));
                createAndShowButton?.('Настройки загружены! Перезагрузка...', 'message');
                setTimeout(() => location.reload(), 1500);
            } catch (err) { alert('Ошибка формата файла'); }
        };
        reader.readAsText(file);
    };

    // --- Status Painting ---
    const paintStatus = () => {
        const statusElem = document.querySelectorAll('.user_menu-status-name')[1];
        if (!statusElem) return;

        const map = { "Офлайн": "red", "Перерыв": "red", "Онлайн": "green", "Занят": "yellow" };
        const color = map[statusElem.textContent];
        if (color) {
            statusElem.style.background = color;
            statusElem.style.color = color === 'yellow' ? 'black' : 'white';
            statusElem.style.fontWeight = '700';
            statusElem.style.padding = '2px 8px';
            statusElem.style.borderRadius = '10px';
        }
    };
    setInterval(paintStatus, 5000);
    paintStatus();
}

// Global initialization
init_settings();
