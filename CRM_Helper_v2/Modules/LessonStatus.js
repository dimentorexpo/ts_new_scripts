/**
 * LessonStatus.js — «Статусы уроков»: уроки преподавателя за период
 * (по московскому времени) с отметками статусов, комментариями и удалениями.
 * Клик по ID ученика — карточка в CRM, правый клик — копирование.
 */
(function () {
    'use strict';

    const html = `
        ${crmWinHeader({
            icon: '🎓',
            title: 'Статусы уроков',
            tools: crmToolButton('clearlessonstatus', crmIcon('clear', 15), 'Очистить фильтры и результаты'),
            closeId: 'hideMeLessonStatus'
        })}
        <div class="crm-body">
            <div class="crm-row is-wrap">
                <button type="button" class="crm-icon-btn is-boxed" id="prevDay" title="Сдвинуть период на день назад" aria-label="День назад">${crmIcon('back', 15)}</button>
                <input class="crm-input" type="date" id="dateFromLS" style="width:142px" title="С (МСК)">
                <span class="crm-label">—</span>
                <input class="crm-input" type="date" id="dateToLS" style="width:142px" title="По (МСК, включительно)">
                <button type="button" class="crm-icon-btn is-boxed" id="nextDay" title="Сдвинуть период на день вперёд" aria-label="День вперёд">${crmIcon('next', 15)}</button>
                <input class="crm-input crm-mono" id="idteacherforsearch" placeholder="ID преподавателя" autocomplete="off" inputmode="numeric" style="width:150px">
                <input class="crm-input crm-mono" id="idstudentforsearch" placeholder="ID ученика (необяз.)" autocomplete="off" inputmode="numeric" style="width:160px">
                <button type="button" class="crm-btn crm-btn-primary" id="startlookstatus" style="margin-left:auto">Показать уроки</button>
            </div>
            <div id="statustable" style="margin-top:12px">
                <div class="crm-empty">Укажите период и ID преподавателя.</div>
            </div>
        </div>`;

    createWindowCRM('AF_LessonStatus', 'winTopLessonStatus', 'winLeftLessonStatus', html);
    const win = document.getElementById('AF_LessonStatus');
    win.style.width = '1080px';
    hideWindowOnDoubleClick('AF_LessonStatus');
    hideWindowOnClick('AF_LessonStatus', 'hideMeLessonStatus');

    const $ = (id) => document.getElementById(id);
    const out = $('statustable');

    const toInputDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    function resetForm() {
        const now = new Date();
        const prev = new Date(now);
        prev.setDate(prev.getDate() - 1);
        $('dateFromLS').value = toInputDate(prev);
        $('dateToLS').value = toInputDate(now);
        $('idteacherforsearch').value = '';
        $('idstudentforsearch').value = '';
        out.innerHTML = '<div class="crm-empty">Укажите период и ID преподавателя.</div>';
    }

    function shiftDates(days) {
        ['dateFromLS', 'dateToLS'].forEach((id) => {
            const input = $(id);
            if (!input.value) return;
            const d = new Date(`${input.value}T00:00:00`);
            d.setDate(d.getDate() + days);
            input.value = toInputDate(d);
        });
    }

    /** Дата из поля (как московская) → строка UTC «ДД-ММ-ГГГГ ЧЧ:мм:сс» для API. */
    function toApiDate(value, endOfDay) {
        const [y, m, d] = value.split('-').map(Number);
        const utc = new Date(Date.UTC(y, m - 1, d, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0) - 3 * 3600 * 1000);
        const p = (n) => String(n).padStart(2, '0');
        return `${p(utc.getUTCDate())}-${p(utc.getUTCMonth() + 1)}-${utc.getUTCFullYear()} ${p(utc.getUTCHours())}:${p(utc.getUTCMinutes())}:${p(utc.getUTCSeconds())}`;
    }

    const fmt = (s, short) => {
        if (!s) return '—';
        const text = new Date(s).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
        return short ? text.slice(0, 17) : text;
    };

    const STATUS_TONE = { success: 'ok' };

    async function search() {
        const btn = $('startlookstatus');
        const teacherId = $('idteacherforsearch').value.replace(/\D/g, '');
        const studentFilter = $('idstudentforsearch').value.replace(/\D/g, '');
        const from = $('dateFromLS').value;
        const to = $('dateToLS').value;

        $('idteacherforsearch').classList.toggle('is-invalid', !teacherId);
        if (!teacherId) { $('idteacherforsearch').focus(); return; }
        if (!from || !to || from > to) {
            crmToast('Проверьте период: дата «с» не может быть позже даты «по»', 'warning');
            return;
        }

        crmSetBusy(btn, true);
        out.innerHTML = '<div class="crm-loading"><span class="crm-spinner"></span>Загружаю уроки…</div>';

        try {
            const body = new URLSearchParams({
                from: toApiDate(from, false),
                to: toApiDate(to, true),
                offset: '0',
                'filters[teacherIds][]': teacherId,
                callback: 'getJSONP'
            }).toString();

            const data = await crmRequestJson('https://timetable.skyeng.ru/api/teachers/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body,
                credentials: 'include'
            });

            const classes = (data?.[0]?.result?.[0]?.classes || [])
                .filter((l) => l.studentId && (!studentFilter || String(l.studentId) === studentFilter));

            if (!classes.length) {
                out.innerHTML = `<div class="crm-empty">${studentFilter ? 'У этого ученика нет уроков с преподавателем за период.' : 'За период уроков не найдено.'}</div>`;
                return;
            }

            const rows = classes.map((l) => {
                const status = l.classStatus?.status;
                const tone = status ? (STATUS_TONE[status] || 'bad') : '';
                return `<tr>
                    <td><a class="crm-link crm-mono" data-id="${crmEsc(l.studentId)}" title="Открыть в CRM. Правый клик — скопировать">${crmEsc(l.studentId)}</a></td>
                    <td class="is-nowrap">${crmEsc(fmt(l.startAt, true))}</td>
                    <td>${status ? `<span class="crm-pill" data-tone="${tone}">${crmEsc(status)}</span>` : '<span class="is-muted">—</span>'}</td>
                    <td class="is-muted is-nowrap">${crmEsc(fmt(l.classStatus?.createdAt))}</td>
                    <td class="crm-mono is-muted">${crmEsc(l.classStatus?.createdByUserId || '—')}</td>
                    <td class="is-muted">${crmEsc(l.type || '—')}</td>
                    <td class="is-wrap">${crmEsc(l.classStatus?.comment || '—')}</td>
                    <td class="is-muted is-nowrap">${crmEsc(fmt(l.removedAt))}</td>
                </tr>`;
            }).join('');

            out.innerHTML = `
                <div class="crm-hint" style="margin-bottom:6px">Найдено уроков: ${classes.length}</div>
                <div class="crm-table-wrap">
                    <table class="crm-table">
                        <thead><tr><th>Ученик</th><th>Урок, МСК</th><th>Статус</th><th>Отмечен</th><th>Кем</th><th>Тип</th><th>Комментарий</th><th>Удалён</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>`;
        } catch (e) {
            out.innerHTML = `<div class="crm-empty is-error">Не удалось получить уроки: ${crmEsc(e.message)}. Проверьте вход в timetable.skyeng.ru.</div>`;
        } finally {
            crmSetBusy(btn, false);
        }
    }

    out.addEventListener('click', (e) => {
        const link = e.target.closest('[data-id]');
        if (link) window.open(`https://crm2.skyeng.ru/persons/${link.dataset.id}`, '_blank', 'noopener');
    });
    out.addEventListener('contextmenu', async (e) => {
        const link = e.target.closest('[data-id]');
        if (!link) return;
        e.preventDefault();
        if (await crmCopy(link.dataset.id)) crmToast(`ID ${link.dataset.id} скопирован`, 'success', { duration: 1800 });
    });

    ['idteacherforsearch', 'idstudentforsearch'].forEach((id) => {
        $(id).addEventListener('input', (e) => onlyNumbers(e.target));
        $(id).addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
    });

    $('prevDay').onclick = () => shiftDates(-1);
    $('nextDay').onclick = () => shiftDates(1);
    $('clearlessonstatus').onclick = resetForm;
    $('startlookstatus').onclick = search;

    resetForm();
    $('butLessonInfoCRM').onclick = () => crmToggleWindow(win);
})();
