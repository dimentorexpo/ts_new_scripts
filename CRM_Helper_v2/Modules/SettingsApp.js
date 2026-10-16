/**
 * SettingsApp.js — окно «Настройки»: звук новой задачи, SkyAuto,
 * тестовые аккаунты, экспорт и импорт настроек.
 * Плеер (audioCRM, crmSetSound, crmPlaySound) живёт в content.js.
 */
(function () {
    'use strict';

    // Значения по умолчанию.
    const DEFAULTS = { splinterCRM: '3', audioCRMvol: '1', audioCRM: '1', repeatsound: '0', skyauto_enabled: '1' };
    Object.entries(DEFAULTS).forEach(([key, value]) => {
        if (localStorage.getItem(key) === null) localStorage.setItem(key, value);
    });

    const html = `
        ${crmWinHeader({ icon: '⚙️', title: 'Настройки', closeId: 'hideSettingsApp' })}

        <div class="crm-section">
            <div class="crm-section-title">Звук новой задачи</div>
            <div class="crm-row">
                <label class="crm-switch" title="Звук, когда в пуле появляется задача">
                    <input type="checkbox" id="audioCRMswitcher"><span class="crm-switch-track"></span><span>Включён</span>
                </label>
                <span class="crm-grow"></span>
                <label class="crm-switch" title="Повторять звук, пока задачу не возьмут">
                    <input type="checkbox" id="repeatsoundselectCRM"><span class="crm-switch-track"></span><span>Повторять каждые</span>
                </label>
                <input class="crm-input is-center" id="soundplayintervalCRM" type="number" min="1" max="59" style="width:52px" title="Интервал повтора, секунд">
                <span class="crm-label">с</span>
            </div>
            <div class="crm-row">
                <select class="crm-select crm-grow" id="soundlistaddrCRM" title="Звук уведомления">
                    <option value="${CRM_DEFAULT_SOUND}">Стандартный</option>
                    <option value="othersound">Свой звук по ссылке…</option>
                </select>
                <button type="button" class="crm-icon-btn is-boxed" id="sound_testCRM" title="Прослушать" aria-label="Прослушать">${crmIcon('play', 14)}</button>
            </div>
            <div class="crm-row crm-hidden" id="sound_custom_row">
                <input class="crm-input crm-grow" id="sound_adrCRM" placeholder="https://…/sound.mp3" autocomplete="off">
                <button type="button" class="crm-btn" id="sound_saveCRM">Сохранить</button>
            </div>
            <div class="crm-row">
                <span class="crm-label" style="width:72px">Громкость</span>
                <input class="crm-range" id="rangeCRM" type="range" min="0" max="1" step="0.05">
                <span class="crm-label crm-mono" id="rangeCRMvalue" style="width:40px;text-align:right"></span>
            </div>
        </div>

        <div class="crm-section">
            <div class="crm-section-title">Автоматизация</div>
            <label class="crm-switch">
                <input type="checkbox" id="skyautoEnabledCRM"><span class="crm-switch-track"></span>
                <span>Автовзятие задач (SkyAuto)</span>
            </label>
            <div class="crm-hint" style="margin-top:6px">Работает на странице /customer-support/start в статусе «В работе».</div>
        </div>

        <div class="crm-section">
            <div class="crm-section-title">Тестовые аккаунты</div>
            <div class="crm-row">
                <span class="crm-label" style="width:110px">Ученик</span>
                <input class="crm-input crm-mono crm-grow" id="test_stdCRM" placeholder="ID тестового У" autocomplete="off" inputmode="numeric">
                <button type="button" class="crm-icon-btn is-boxed" id="setteststdCRM" title="Сохранить ID тестового ученика" aria-label="Сохранить">${crmIcon('save', 15)}</button>
            </div>
            <div class="crm-row">
                <span class="crm-label" style="width:110px">Преподаватель</span>
                <input class="crm-input crm-mono crm-grow" id="test_teachCRM" placeholder="ID тестового П" autocomplete="off" inputmode="numeric">
                <button type="button" class="crm-icon-btn is-boxed" id="settestteachCRM" title="Сохранить ID тестового преподавателя" aria-label="Сохранить">${crmIcon('save', 15)}</button>
            </div>
        </div>

        <div class="crm-section">
            <div class="crm-section-title">Резервная копия</div>
            <div class="crm-row">
                <button type="button" class="crm-btn crm-grow" id="savesettingstofileCRM" title="Скачать настройки расширения в .json">${crmIcon('download', 15)} Экспорт</button>
                <button type="button" class="crm-btn crm-grow" id="loadsettingsCRM" title="Загрузить настройки из ранее сохранённого .json">${crmIcon('upload', 15)} Импорт</button>
                <input type="file" id="fileinputCRM" accept=".json,application/json" hidden>
            </div>
        </div>`;

    createWindowCRM('winSettingsApp', 'winTopSettingsApp', 'winLeftSettingsApp', html);
    const win = document.getElementById('winSettingsApp');
    win.style.width = '440px';
    hideWindowOnDoubleClick('winSettingsApp');
    hideWindowOnClick('winSettingsApp', 'hideSettingsApp');

    const $ = (id) => document.getElementById(id);
    const soundList = $('soundlistaddrCRM');

    /* ---------- Список звуков ---------- */

    async function loadSoundList() {
        try {
            const r = await fetch('https://script.google.com/macros/s/AKfycbyD1l-oLcE-BBmyN1QmcHKoi0rwVfCwWjE6cfTqw6Y9QQGAju-9inKbwSOfHCI6qBEjtg/exec');
            const data = await r.json();
            soundsconteinerCRM = data && data.result;
        } catch (err) {
            console.warn('[Settings] список звуков не загружен:', err);
        }
        (soundsconteinerCRM || []).forEach(([name, url]) => {
            if (name) addOptionCRM(soundList, name, url);
        });
        syncSoundSelect();
    }

    /** Выбирает в списке текущий звук; неизвестный адрес — «свой звук». */
    function syncSoundSelect() {
        const current = localStorage.getItem('sound_strCRM') || CRM_DEFAULT_SOUND;
        const match = Array.from(soundList.options).find((o) => o.value && o.value === current);
        if (match) {
            soundList.value = match.value;
            $('sound_custom_row').classList.add('crm-hidden');
        } else {
            soundList.value = 'othersound';
            $('sound_adrCRM').value = localStorage.getItem('sound_strCRM') || '';
            $('sound_custom_row').classList.remove('crm-hidden');
        }
    }

    function applySound(url) {
        localStorage.setItem('sound_strCRM', url);
        crmSetSound(url);
        stopSoundInterval();
        resetTestButton();
    }

    soundList.addEventListener('change', () => {
        if (soundList.value === 'othersound') {
            $('sound_custom_row').classList.remove('crm-hidden');
            $('sound_adrCRM').focus();
            return;
        }
        $('sound_custom_row').classList.add('crm-hidden');
        applySound(soundList.value);
    });

    $('sound_saveCRM').onclick = () => {
        const raw = $('sound_adrCRM').value.trim();
        let ok = false;
        try { ok = /^https?:$/.test(new URL(raw).protocol); } catch (_) { ok = false; }
        if (!ok) {
            $('sound_adrCRM').classList.add('is-invalid');
            crmToast('Нужна ссылка на звуковой файл, начинающаяся с http:// или https://', 'warning');
            return;
        }
        $('sound_adrCRM').classList.remove('is-invalid');
        applySound(raw);
        crmToast('Свой звук сохранён', 'success', { duration: 2000 });
    };

    /* ---------- Проверка звука ---------- */

    const testBtn = $('sound_testCRM');
    let testing = false;

    function resetTestButton() {
        testing = false;
        testBtn.innerHTML = crmIcon('play', 14);
        testBtn.title = 'Прослушать';
    }

    testBtn.onclick = () => {
        if (testing) {
            audioCRM.pause();
            audioCRM.currentTime = 0;
            resetTestButton();
            return;
        }
        testing = true;
        testBtn.innerHTML = crmIcon('stop', 14);
        testBtn.title = 'Остановить';
        audioCRM.currentTime = 0;
        audioCRM.onended = resetTestButton;
        const p = audioCRM.play();
        if (p && p.catch) {
            p.catch((e) => {
                resetTestButton();
                crmToast(`Звук не воспроизводится (${e.name}). Проверьте ссылку на файл.`, 'error');
            });
        }
    };

    /* ---------- Переключатели и громкость ---------- */

    function syncRepeatControls() {
        const repeat = $('repeatsoundselectCRM').checked;
        $('soundplayintervalCRM').disabled = !repeat;
    }

    $('audioCRMswitcher').addEventListener('change', (e) => {
        localStorage.setItem('audioCRM', e.target.checked ? '1' : '0');
        if (!e.target.checked) stopSoundInterval();
    });

    $('repeatsoundselectCRM').addEventListener('change', (e) => {
        localStorage.setItem('repeatsound', e.target.checked ? '1' : '0');
        stopSoundInterval();
        syncRepeatControls();
    });

    $('soundplayintervalCRM').addEventListener('change', (e) => {
        const seconds = Math.min(59, Math.max(1, parseInt(e.target.value, 10) || 3));
        e.target.value = seconds;
        localStorage.setItem('splinterCRM', String(seconds));
        stopSoundInterval(); // новый интервал применится при следующем звуке
    });

    $('rangeCRM').addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        audioCRM.volume = volume;
        localStorage.setItem('audioCRMvol', String(volume));
        $('rangeCRMvalue').textContent = `${Math.round(volume * 100)}%`;
    });

    $('skyautoEnabledCRM').addEventListener('change', (e) => {
        localStorage.setItem('skyauto_enabled', e.target.checked ? '1' : '0');
    });

    /* ---------- Тестовые аккаунты ---------- */

    function bindTestAccount(inputId, buttonId, storageKey, who) {
        const input = $(inputId);
        input.addEventListener('input', () => onlyNumbers(input));
        const save = () => {
            const value = input.value.trim();
            if (!value) {
                localStorage.removeItem(storageKey);
                crmToast(`ID тестового ${who} очищен`, 'info', { duration: 2000 });
                return;
            }
            localStorage.setItem(storageKey, value);
            crmToast(`ID тестового ${who}: ${value}`, 'success', { title: 'Сохранено', duration: 2000 });
        };
        $(buttonId).onclick = save;
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') save(); });
    }

    bindTestAccount('test_stdCRM', 'setteststdCRM', 'test_studCRM', 'ученика');
    bindTestAccount('test_teachCRM', 'settestteachCRM', 'test_teachCRM', 'преподавателя');

    /* ---------- Экспорт / импорт ---------- */

    // В файл попадают только настройки расширения: служебные ключи самой CRM
    // (токены, кэш интерфейса) не выгружаются и при импорте не перезаписываются.
    const EXPORT_KEYS = /^(audioCRM|audioCRMvol|splinterCRM|repeatsound|sound_strCRM|skyauto_enabled|skyauto_ui_pos|test_studCRM|test_teachCRM|CRM_LinksCustom|customquery|bugsarray|jiraFavsV2|mms_.*|tplWidgetCyberV3\..*|winTop.*|winLeft.*|remindertextCRM1?|setchasCRM1?|setminutaCRM1?|chronostamp1?)$/;

    $('savesettingstofileCRM').onclick = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (EXPORT_KEYS.test(key)) data[key] = localStorage.getItem(key);
        }
        const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `crmhelper-settings-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        crmToast(`Сохранено настроек: ${Object.keys(data).length}`, 'success', { title: 'Экспорт' });
    };

    $('loadsettingsCRM').onclick = () => $('fileinputCRM').click();

    $('fileinputCRM').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        e.target.value = ''; // чтобы тот же файл можно было выбрать снова
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            let parsed;
            try {
                parsed = JSON.parse(reader.result);
                if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('формат');
            } catch (_) {
                crmToast('Файл повреждён или это не файл настроек CRMHelper', 'error', { title: 'Импорт' });
                return;
            }

            const entries = Object.entries(parsed).filter(([k]) => EXPORT_KEYS.test(k));
            const skipped = Object.keys(parsed).length - entries.length;
            if (!entries.length) {
                crmToast('В файле нет настроек расширения', 'warning', { title: 'Импорт' });
                return;
            }

            const ok = await crmConfirm({
                title: 'Загрузить настройки?',
                message: `Будет заменено настроек: ${entries.length}.` +
                    (skipped ? `\nКлючи CRM из старого файла (${skipped}) пропускаются.` : '') +
                    '\nПосле загрузки страница перезагрузится.',
                okText: 'Загрузить'
            });
            if (!ok) return;

            entries.forEach(([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)));
            crmToast('Настройки загружены. Перезагружаю страницу…', 'success', { title: 'Импорт' });
            setTimeout(() => location.reload(), 1200);
        };
        reader.readAsText(file);
    });

    /* ---------- Открытие окна ---------- */

    function fillForm() {
        $('audioCRMswitcher').checked = localStorage.getItem('audioCRM') !== '0';
        $('repeatsoundselectCRM').checked = localStorage.getItem('repeatsound') === '1';
        $('soundplayintervalCRM').value = localStorage.getItem('splinterCRM') || '3';
        $('skyautoEnabledCRM').checked = localStorage.getItem('skyauto_enabled') !== '0';
        $('test_stdCRM').value = localStorage.getItem('test_studCRM') || '';
        $('test_teachCRM').value = localStorage.getItem('test_teachCRM') || '';
        $('rangeCRM').value = audioCRM.volume;
        $('rangeCRMvalue').textContent = `${Math.round(audioCRM.volume * 100)}%`;
        syncRepeatControls();
        syncSoundSelect();
    }

    win.addEventListener('crm:hidden', () => {
        if (testing) { audioCRM.pause(); resetTestButton(); }
    });

    $('btnSettingsApp').onclick = () => {
        if (crmToggleWindow('winSettingsApp')) fillForm();
    };

    loadSoundList();
})();
