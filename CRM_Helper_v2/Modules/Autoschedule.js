/**
 * Autoschedule.js — «Автоподбор»: для каждой услуги ученика показывает,
 * доступен ли автоподбор преподавателя и почему нет.
 */
(function () {
    'use strict';

    // Услуги, для которых автоподбор не применяется.
    const SKIP_SERVICE_TYPES = new Set(['english_adult_self_study', 'english_adult_not_native_speaker_talks_15min', 'life_adult']);

    const html = `
        ${crmWinHeader({
            icon: '🗓️',
            title: 'Автоподбор',
            tools: crmToolButton('clearAutoSchedule', crmIcon('clear', 15), 'Очистить'),
            closeId: 'hideMeAutoSchedule'
        })}
        <div class="crm-body">
            <div class="crm-input-group">
                <input class="crm-input crm-mono" id="studentAPSearch" placeholder="ID ученика" autocomplete="off" inputmode="numeric">
                <button type="button" class="crm-btn crm-btn-primary" id="startlookAPstatus">Проверить</button>
            </div>
            <div id="aptabledata" style="margin-top:12px"><div class="crm-empty">Введите ID ученика — покажу автоподбор по каждой услуге.</div></div>
        </div>`;

    createWindowCRM('AF_Autoschedule', 'winTopAutoSchedule', 'winLeftAutoSchedule', html);
    const win = document.getElementById('AF_Autoschedule');
    win.style.width = '680px';
    hideWindowOnDoubleClick('AF_Autoschedule');

    const input = document.getElementById('studentAPSearch');
    const out = document.getElementById('aptabledata');
    const btn = document.getElementById('startlookAPstatus');
    const EMPTY = '<div class="crm-empty">Введите ID ученика — покажу автоподбор по каждой услуге.</div>';

    /* ---------- Справочник названий услуг (грузим один раз) ---------- */

    let configsPromise = null;

    function loadConfigs() {
        if (!configsPromise) {
            configsPromise = crmRequestJson('https://backend.skyeng.ru/api/products/configurations/', { method: 'GET' })
                .then((res) => new Map((res.data || []).map((d) => [d.serviceTypeKey, d.shortTitle])))
                .catch((e) => {
                    console.warn('[Autoschedule] справочник услуг не загружен:', e.message);
                    configsPromise = null; // попробуем ещё раз в следующий раз
                    return new Map();
                });
        }
        return configsPromise;
    }

    /** Причины недоступности бывают строками или объектами — приводим к тексту. */
    function formatReasons(reasons) {
        if (!Array.isArray(reasons) || !reasons.length) return '';
        return reasons.map((r) => (typeof r === 'string' ? r : r?.message || r?.title || r?.code || JSON.stringify(r))).join('; ');
    }

    let requestSeq = 0;

    async function check() {
        const studentId = input.value.replace(/\D/g, '');
        input.classList.toggle('is-invalid', studentId.length < 3);
        if (studentId.length < 3) { input.focus(); return; }

        const seq = ++requestSeq;
        crmSetBusy(btn, true);
        out.innerHTML = '<div class="crm-loading"><span class="crm-spinner"></span>Загружаю услуги ученика…</div>';

        try {
            const [services, names] = await Promise.all([
                crmRequestJson(`https://backend.skyeng.ru/api/students/${studentId}/education-services/`, { method: 'GET' }),
                loadConfigs()
            ]);
            if (seq !== requestSeq) return;

            const items = (services.data || []).filter((s) => !SKIP_SERVICE_TYPES.has(s.serviceTypeKey));
            if (!items.length) {
                out.innerHTML = '<div class="crm-empty">У ученика нет услуг, для которых работает автоподбор.</div>';
                return;
            }

            const results = await Promise.allSettled(items.map((s) =>
                crmRequestJson(`https://teachers-schedule.skyeng.ru/api/education-services/${s.id}/auto-schedule/is-available/`, { method: 'GET' })
            ));
            if (seq !== requestSeq) return;

            const rows = items.map((s, i) => {
                const title = names.get(s.serviceTypeKey) || s.serviceTypeKey;
                const r = results[i];
                let status;
                let reason;
                if (r.status === 'rejected') {
                    status = '<span class="crm-pill">нет ответа</span>';
                    reason = `<span class="is-muted">${crmEsc(r.reason.message)}</span>`;
                } else {
                    const available = r.value?.data?.isAvailable === true;
                    status = available
                        ? '<span class="crm-pill" data-tone="ok"><span class="crm-dot"></span>Доступен</span>'
                        : '<span class="crm-pill" data-tone="bad"><span class="crm-dot"></span>Недоступен</span>';
                    reason = crmEsc(formatReasons(r.value?.data?.reasons) || '—');
                }
                return `<tr>
                    <td class="crm-mono">${crmEsc(s.id)}</td>
                    <td title="${crmEsc(s.serviceTypeKey)}">${crmEsc(title)}</td>
                    <td>${status}</td>
                    <td class="is-wrap">${reason}</td>
                </tr>`;
            }).join('');

            out.innerHTML = `
                <div class="crm-table-wrap">
                    <table class="crm-table">
                        <thead><tr><th>ID услуги</th><th>Услуга</th><th>Автоподбор</th><th>Причина</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>`;
        } catch (e) {
            if (seq !== requestSeq) return;
            out.innerHTML = `<div class="crm-empty is-error">Не удалось получить услуги: ${crmEsc(e.message)}. Проверьте ID и вход в CRM.</div>`;
        } finally {
            if (seq === requestSeq) crmSetBusy(btn, false);
        }
    }

    function clear() {
        requestSeq++;
        crmSetBusy(btn, false);
        input.value = '';
        input.classList.remove('is-invalid');
        out.innerHTML = EMPTY;
    }

    input.addEventListener('input', () => onlyNumbers(input));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
    btn.addEventListener('click', check);
    document.getElementById('clearAutoSchedule').onclick = clear;
    document.getElementById('hideMeAutoSchedule').onclick = () => { crmHideWindow(win); clear(); };

    document.getElementById('butAutoschedule').onclick = () => {
        if (!crmToggleWindow(win)) return;
        loadConfigs();
        const personId = crmPersonIdFromUrl();
        if (personId && !input.value) input.value = personId;
        input.focus();
    };
})();
