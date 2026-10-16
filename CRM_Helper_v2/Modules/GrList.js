/**
 * GrList.js — «Состав группы»: по ID группы показывает учеников (ID, услуга, имя)
 * и преподавателя. Клик по ID открывает карточку в CRM, правый клик — копирует ID.
 * Окно открывается кнопкой «Список гр.» из «Ссылок и инструментов» (Link.js).
 */

/** Показать/скрыть окно (вызывается из Link.js — имя менять нельзя). */
function getGrListDataButtonPress() {
    crmToggleWindow('AF_GrList');
}

(function () {
    'use strict';

    const html = `
        ${crmWinHeader({ icon: '👥', title: 'Состав группы', closeId: 'hideList' })}
        <div class="crm-body">
            <div class="crm-input-group">
                <input class="crm-input crm-mono" id="idgrouptolist" placeholder="ID группы" autocomplete="off" inputmode="numeric">
                <button type="button" class="crm-btn crm-btn-primary" id="getidgrouptolist">Показать</button>
            </div>
            <div id="grlistinfo" style="margin-top:10px"></div>
        </div>`;

    createWindowCRM('AF_GrList', 'winTopGrList', 'winLeftGrList', html);
    document.getElementById('AF_GrList').style.width = '460px';
    hideWindowOnDoubleClick('AF_GrList');

    const input = document.getElementById('idgrouptolist');
    const output = document.getElementById('grlistinfo');
    const loadBtn = document.getElementById('getidgrouptolist');

    input.addEventListener('input', () => onlyNumbers(input));
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadGroup(); });
    loadBtn.addEventListener('click', loadGroup);

    document.getElementById('hideList').addEventListener('click', () => {
        crmHideWindow(document.getElementById('AF_GrList'));
        output.innerHTML = '';
        input.value = '';
    });

    /** Строка участника: номер, ID (ссылка), услуга, имя. */
    function rowHtml(num, userId, serviceId, role) {
        return `
            <div class="gr-row" data-user="${crmEsc(userId)}">
                <span class="gr-num">${num}</span>
                <a class="crm-link crm-mono" data-open="${crmEsc(userId)}" title="Открыть в CRM. Правый клик — скопировать ID">${crmEsc(userId)}</a>
                ${role ? `<span class="crm-pill" data-tone="info">${role}</span>` : ''}
                ${serviceId ? `<span class="crm-pill" title="ID услуги">услуга ${crmEsc(serviceId)}</span>` : ''}
                <span class="gr-name"></span>
            </div>`;
    }

    // Клик по ID — карточка в CRM, правый клик — копирование.
    output.addEventListener('click', (e) => {
        const link = e.target.closest('[data-open]');
        if (link) window.open(`https://crm2.skyeng.ru/persons/${link.dataset.open}`, '_blank', 'noopener');
    });
    output.addEventListener('contextmenu', async (e) => {
        const link = e.target.closest('[data-open]');
        if (!link) return;
        e.preventDefault();
        if (await crmCopy(link.dataset.open)) crmToast(`ID ${link.dataset.open} скопирован`, 'success', { duration: 1800 });
    });

    let requestSeq = 0;

    async function loadGroup() {
        const groupId = input.value.trim();
        if (!groupId) {
            input.classList.add('is-invalid');
            input.focus();
            return;
        }
        input.classList.remove('is-invalid');

        const seq = ++requestSeq;
        crmSetBusy(loadBtn, true);
        output.innerHTML = '<div class="crm-loading"><span class="crm-spinner"></span>Загружаю состав группы…</div>';

        try {
            const res = await crmRequestJson(
                `https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${encodeURIComponent(groupId)}`,
                { method: 'GET' }
            );
            if (seq !== requestSeq) return;

            const students = (res && res.data && res.data.students) || [];
            const teachers = (res && res.data && res.data.teachers) || [];

            if (!students.length && !teachers.length) {
                output.innerHTML = '<div class="crm-empty">В группе нет участников. Проверьте ID группы.</div>';
                return;
            }

            output.innerHTML =
                `<div class="crm-hint" style="margin-bottom:6px">Учеников: ${students.length}</div>` +
                '<div class="crm-table-wrap" style="max-height:480px">' +
                students.map((s, i) => rowHtml(i + 1, s.userId, s.educationServiceId, '')).join('') +
                teachers.map((t) => rowHtml('П', t.userId, '', 'преподаватель')).join('') +
                '</div>';

            await fillNames([...students, ...teachers].map((p) => p.userId), seq);
        } catch (e) {
            if (seq !== requestSeq) return;
            output.innerHTML = `<div class="crm-empty is-error">Не удалось загрузить группу: ${crmEsc(e.message)}. Проверьте ID и вход в LGS.</div>`;
        } finally {
            if (seq === requestSeq) crmSetBusy(loadBtn, false);
        }
    }

    /** Подставляет имена. Сопоставляем по ID, а если сервис его не вернул — по порядку. */
    async function fillNames(ids, seq) {
        if (!ids.length) return;
        try {
            const res = await crmRequestJson('https://learning-groups-storage-api.skyeng.ru/api/v1/userInfo/findByIds', {
                method: 'POST',
                headers: { accept: 'application/json, text/plain, */*', 'content-type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ ids }),
                credentials: 'include'
            });
            if (seq !== requestSeq) return;

            const list = (res && res.data) || [];
            const rows = output.querySelectorAll('.gr-row');
            list.forEach((info, i) => {
                const name = info && info.name ? `${info.name.first || ''} ${info.name.last || ''}`.trim() : '';
                const id = info && (info.id ?? info.userId);
                const row = id !== undefined
                    ? output.querySelector(`.gr-row[data-user="${CSS.escape(String(id))}"]`)
                    : rows[i];
                if (row && name) {
                    const nameEl = row.querySelector('.gr-name');
                    nameEl.textContent = name;
                    nameEl.title = name;
                }
            });
        } catch (e) {
            console.warn('[GrList] имена не загружены:', e.message);
        }
    }
})();
