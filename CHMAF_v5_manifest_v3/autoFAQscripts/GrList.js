// === 1. СТИЛИ — Corporate Graphite Dark (как Queue.js) ===
// Все правила под #AF_GrList, чтобы ничего не утекало в другие окна.

const neonGlassStyles = `
<style>
    /* Шрифты (Inter, JetBrains Mono) загружаются один раз в design-system.css */
    #AF_GrList {
        --ngu-cyan: #a9c0ff; /* используется инлайном в JS (подсветка «Скопировано!») */
    }

    #AF_GrList .ngu-wrapper,
    #AF_GrList .ngu-wrapper * { box-sizing: border-box; }

    #AF_GrList .ngu-wrapper {
        width: min(500px, calc(100vw - 24px));
        padding: 18px;
        color: #edf2fb;
        background:
            radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
            #111827;
        border: 1px solid #344258;
        border-radius: 18px;
        box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
        font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
        position: relative;
        animation: ngu-appear .25s cubic-bezier(.2, .8, .2, 1);
    }

    @keyframes ngu-appear { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
    @keyframes ngu-slide-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    @keyframes ngu-spin { to { transform: rotate(360deg); } }

    /* === HEADER === */
    #AF_GrList .ngu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 14px;
        padding-bottom: 14px;
        border-bottom: 1px solid #344258;
        cursor: move;
    }
    #AF_GrList .ngu-title-group { display: flex; align-items: center; gap: 10px; min-width: 0; }
    #AF_GrList .ngu-title-icon {
        width: 34px; height: 34px; flex: 0 0 34px;
        display: flex; align-items: center; justify-content: center;
        font-size: 17px;
        background: #182335;
        border: 1px solid #364660;
        border-radius: 10px;
    }
    #AF_GrList .ngu-title-icon::before { content: '👥'; }
    #AF_GrList .ngu-title { font-size: 15px; font-weight: 700; color: #fff; line-height: 1.2; }
    #AF_GrList .ngu-subtitle {
        margin-top: 2px;
        font-size: 11px; font-weight: 700;
        letter-spacing: .03em; text-transform: uppercase;
        color: #a6b4cb;
    }

    /* === CONTROLS === */
    #AF_GrList .ngu-controls { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
    #AF_GrList .ngu-input-wrap { min-width: 0; }
    #AF_GrList .ngu-input {
        width: 100%;
        height: 36px;
        padding: 0 10px;
        color: #edf2fb;
        background: #0d1625;
        border: 1px solid #3a4961;
        border-radius: 9px;
        outline: none;
        font-size: 13px;
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
        transition: background .2s, border-color .2s, box-shadow .2s;
    }
    #AF_GrList .ngu-input::placeholder { color: #6f7f99; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
    #AF_GrList .ngu-input:hover { background: #142034; border-color: #657caa; }
    #AF_GrList .ngu-input:focus { background: #142034; border-color: #829fff; box-shadow: 0 0 0 3px rgba(110, 152, 247, .16); }

    #AF_GrList .ngu-btn {
        min-height: 36px;
        padding: 8px 14px;
        display: inline-flex; align-items: center; gap: 8px;
        color: #dce5f5;
        background: #1b283c;
        border: 1px solid #3c4d68;
        border-radius: 9px;
        cursor: pointer;
        font: 600 13px/1 inherit;
        font-family: inherit;
        white-space: nowrap;
        transition: background-color .16s ease, border-color .16s ease, transform .16s ease, box-shadow .16s ease;
    }
    #AF_GrList .ngu-btn:hover { color: #fff; background: #293b56; border-color: #7799e2; transform: translateY(-1px); }
    #AF_GrList .ngu-btn:active { transform: translateY(0); }
    #AF_GrList .ngu-btn-primary {
        color: #eef3ff;
        background: #4268c9;
        border-color: #7293ed;
        box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
    }
    #AF_GrList .ngu-btn-primary:hover { background: #547ce1; border-color: #a2b9fa; box-shadow: 0 6px 19px rgba(58, 96, 205, .3); }
    #AF_GrList .ngu-btn-danger {
        padding: 8px 12px;
        color: #ffb0be;
        background: rgba(255, 116, 140, .08);
        border-color: rgba(255, 116, 140, .3);
    }
    #AF_GrList .ngu-btn-danger:hover { color: #fff; background: rgba(255, 116, 140, .18); border-color: rgba(255, 116, 140, .6); }

    /* === CONTENT === */
    #AF_GrList .ngu-content {
        max-height: 460px;
        overflow-y: auto;
        padding-right: 6px;
        scrollbar-width: thin;
        scrollbar-color: #536a8e transparent;
    }
    #AF_GrList .ngu-content:empty { display: none; }
    #AF_GrList .ngu-content::-webkit-scrollbar { width: 6px; }
    #AF_GrList .ngu-content::-webkit-scrollbar-track { background: transparent; }
    #AF_GrList .ngu-content::-webkit-scrollbar-thumb { background: #536a8e; border-radius: 4px; }

    /* Loader */
    #AF_GrList .ngu-loader { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 26px 0; }
    #AF_GrList .ngu-loader-ring {
        width: 30px; height: 30px; margin-bottom: 6px;
        border: 3px solid #2a3a55;
        border-top-color: #7799e2;
        border-radius: 50%;
        animation: ngu-spin .8s linear infinite;
    }
    #AF_GrList .ngu-loader-text { font-size: 13px; font-weight: 600; color: #dce5f5; }
    #AF_GrList .ngu-loader-sub { font-size: 11px; color: #7c8aa3; font-family: 'JetBrains Mono', monospace; }

    /* Counter */
    #AF_GrList .ngu-counter { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
    #AF_GrList .ngu-counter-item {
        padding: 9px 10px;
        background: #182335;
        border: 1px solid #364660;
        border-radius: 10px;
        text-align: center;
    }
    #AF_GrList .ngu-counter-value {
        font-size: 17px; font-weight: 700; color: #a9c0ff;
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    #AF_GrList .ngu-counter-label {
        margin-top: 4px;
        font-size: 10px; font-weight: 700;
        letter-spacing: .03em; text-transform: uppercase;
        color: #a6b4cb;
    }

    /* Teacher row */
    #AF_GrList .ngu-teacher {
        display: flex; align-items: center; gap: 8px;
        margin-bottom: 7px;
        padding: 8px 12px;
        font-size: 12px; font-weight: 600;
        color: #cfe0ff;
        background: #1b2a44;
        border: 1px solid #3b5179;
        border-left: 3px solid #4f8cff;
        border-radius: 10px;
    }
    #AF_GrList .ngu-teacher-icon { color: #4f8cff; font-size: 10px; }

    /* Student card */
    #AF_GrList .ngu-student-card {
        display: flex; align-items: center; gap: 10px;
        min-width: 0;
        margin-bottom: 7px;
        padding: 9px 12px;
        background: #1a2536;
        border: 1px solid #344258;
        border-left: 3px solid #617fbd;
        border-radius: 10px;
        animation: ngu-slide-up .25s ease both;
        transition: background-color .16s ease, border-color .16s ease;
    }
    #AF_GrList .ngu-student-card:hover { background: #23334b; border-color: #6685be; border-left-color: #92afff; }

    #AF_GrList .ngu-index {
        flex: 0 0 22px;
        font-size: 11px; font-weight: 700;
        color: #6f7f99;
        font-family: 'JetBrains Mono', monospace;
    }
    #AF_GrList .ngu-avatar {
        width: 32px; height: 32px; flex: 0 0 32px;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700;
        color: #dfe8ff;
        background: #293e67;
        border: 1px solid #536fa7;
        border-radius: 50%;
    }
    #AF_GrList .ngu-info { flex: 1; min-width: 0; }
    #AF_GrList .ngu-name {
        font-size: 13px; font-weight: 600; color: #f0f4fb;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    #AF_GrList .ngu-meta {
        display: inline-block;
        margin-top: 2px;
        font-size: 11px;
        color: #8fa0bd;
        font-family: 'JetBrains Mono', monospace;
        cursor: copy;
        transition: color .15s;
    }
    #AF_GrList .ngu-meta:hover { color: #a9c0ff; }
    #AF_GrList .ngu-meta-row { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 10px; margin-top: 2px; }
    #AF_GrList .ngu-meta-row .ngu-meta { margin-top: 0; }
    #AF_GrList .ngu-start {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 1px 7px;
        font-size: 10.5px; font-weight: 600;
        color: #9fe0bd;
        background: rgba(52, 211, 153, .08);
        border: 1px solid rgba(52, 211, 153, .28);
        border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
        white-space: nowrap;
    }

    #AF_GrList .ngu-crm-btn {
        flex: 0 0 auto;
        height: 28px;
        padding: 0 10px;
        color: #cfe0ff;
        background: #293e67;
        border: 1px solid #536fa7;
        border-radius: 8px;
        cursor: pointer;
        font: 700 11px/1 inherit;
        font-family: inherit;
        transition: all .16s ease;
    }
    #AF_GrList .ngu-crm-btn:hover { color: #fff; background: #395892; border-color: #87a9ed; transform: translateY(-1px); }

    #AF_GrList .ngu-service-tag {
        max-width: 90px;
        padding: 2px 6px;
        font-size: 10px;
        color: #c8d6f4;
        background: #293a56;
        border: 1px solid #435b80;
        border-radius: 6px;
        font-family: 'JetBrains Mono', monospace;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    /* Status (error / empty) */
    #AF_GrList .ngu-status {
        padding: 18px 14px;
        text-align: center;
        background: #182335;
        border: 1px solid #364660;
        border-radius: 12px;
    }
    #AF_GrList .ngu-status.error { background: rgba(255, 116, 140, .07); border-color: rgba(255, 116, 140, .3); }
    #AF_GrList .ngu-status.empty { border-style: dashed; }
    #AF_GrList .ngu-status-icon { display: block; font-size: 20px; margin-bottom: 6px; color: #a6b4cb; }
    #AF_GrList .ngu-status.error .ngu-status-icon { color: #ff8fa3; }
    #AF_GrList .ngu-status-title { font-size: 13px; font-weight: 700; color: #fff; }
    #AF_GrList .ngu-status-desc { margin-top: 4px; font-size: 12px; color: #a6b4cb; word-break: break-word; }
</style>
`;
// === HTML STRUCTURE ===
var win_GrList = `
    ${neonGlassStyles}
    <div class="ngu-wrapper">
        <div class="ngu-header chmaf-drag-handle">
            <div class="ngu-title-group">
                <div class="ngu-title-icon"></div>
                <div>
                    <div class="ngu-title">Состав группы</div>
                    <div class="ngu-subtitle">Участники по ID группы</div>
                </div>
            </div>
            <button class="ngu-btn ngu-btn-danger" id="ngu-hide-btn" title="Закрыть">✕</button>
        </div>
        <div class="ngu-controls">
            <div class="ngu-input-wrap" style="flex: 1;">
                <input id="ngu-input-id" class="ngu-input" placeholder="Введите ID группы..." autocomplete="off" type="text">
            </div>
            <button class="ngu-btn ngu-btn-primary" id="ngu-get-btn">Найти</button>
        </div>
        <div id="ngu-results" class="ngu-content"></div>
    </div>
`;

// === WINDOW INIT ===
// ВАЖНО: ключи позиции должны быть разными. Раньше оба были 'winTopGrList' —
// drag сохранял X поверх Y в один ключ, и окно «прыгало» при повторном открытии
createWindow('AF_GrList', 'winTopGrList', 'winLeftGrList', win_GrList);
hideWindowOnDoubleClick('AF_GrList');

// === SANITIZE POSITION (защита от улёта) ===
function sanitizeWindowPosition(winElement) {
    if (!winElement) return;
    const rect = winElement.getBoundingClientRect();
    const padding = 60;
    let top = parseInt(winElement.style.top) || 120;
    let left = parseInt(winElement.style.left) || 295;

    const maxTop = window.innerHeight - padding;
    const maxLeft = window.innerWidth - padding;

    if (top < -rect.height + padding) top = padding;
    if (top > maxTop) top = Math.max(padding, maxTop - rect.height);
    if (left < -rect.width + padding) left = padding;
    if (left > maxLeft) left = Math.max(padding, maxLeft - rect.width);

    winElement.style.top = `${top}px`;
    winElement.style.left = `${left}px`;
    localStorage.setItem('winTopGrList', String(top));
    localStorage.setItem('winLeftGrList', String(left));
}

// === TOGGLE ===
function getGrListDataButtonPress() {
    const win = document.getElementById('AF_GrList');
    if (!win) {
        console.warn('[GrList] Окно не найдено');
        return;
    }
    sanitizeWindowPosition(win);
    const isHidden = window.getComputedStyle(win).display === 'none';
    win.style.display = isHidden ? 'block' : 'none';
    if (isHidden) setTimeout(() => document.getElementById('ngu-input-id')?.focus(), 50);
}
window.getGrListDataButtonPress = getGrListDataButtonPress;

// === EVENTS ===
document.getElementById('ngu-hide-btn').addEventListener('click', () => {
    const win = document.getElementById('AF_GrList');
    if (win) {
        win.style.display = 'none';
        document.getElementById('ngu-results').innerHTML = '';
        document.getElementById('ngu-input-id').value = '';
    }
});

document.getElementById('ngu-input-id').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('ngu-get-btn').click();
    if (e.key === 'Escape') document.getElementById('ngu-hide-btn').click();
});

// === API ===
const fetchViaBackground = (payload) => new Promise((resolve) => {
    chrome.runtime.sendMessage(payload, (response) => resolve(response));
});

// === MAIN LOGIC ===

// "2026-09-01T00:00:00+00:00" → "01.09.2026". Берём дату из строки как есть,
// без new Date(), чтобы часовой пояс не сдвигал день.
const nguFormatDate = (value) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value || ''));
    return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
};

// Экранирование данных API перед вставкой в innerHTML
const nguEsc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

document.getElementById('ngu-get-btn').addEventListener('click', async function () {
    const container = document.getElementById('ngu-results');
    const groupId = document.getElementById('ngu-input-id').value.trim();

    if (!/^\d+$/.test(groupId)) {
        container.innerHTML = `
            <div class="ngu-status error">
                <span class="ngu-status-icon">⚠</span>
                <div class="ngu-status-title">Требуется ID группы</div>
                <div class="ngu-status-desc">Введите числовой идентификатор группы</div>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="ngu-loader">
            <div class="ngu-loader-ring"></div>
            <div class="ngu-loader-text">Загрузка данных</div>
            <div class="ngu-loader-sub">skyeng api v1 › groups › participants</div>
        </div>`;

    try {
        const groupResponse = await fetchViaBackground({
            action: 'getFetchRequest',
            fetchURL: `https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${groupId}`,
            requestOptions: { method: 'GET' }
        });

        if (!groupResponse?.success) {
            container.innerHTML = `
                <div class="ngu-status error">
                    <span class="ngu-status-icon">✕</span>
                    <div class="ngu-status-title">Ошибка запроса</div>
                    <div class="ngu-status-desc">${nguEsc(groupResponse?.error || 'Unknown error')}</div>
                </div>`;
            return;
        }

        const groupData = JSON.parse(groupResponse.fetchansver);
        const students = groupData.data?.students || [];
        const userIds = students.map(s => s.userId);

        if (userIds.length === 0) {
            container.innerHTML = `
                <div class="ngu-status empty">
                    <span class="ngu-status-icon">◯</span>
                    <div class="ngu-status-title">Группа пуста</div>
                    <div class="ngu-status-desc">Ученики не найдены или неверный ID</div>
                </div>`;
            return;
        }

        const namesResponse = await fetchViaBackground({
            action: 'getFetchRequest',
            fetchURL: "https://learning-groups-storage-api.skyeng.ru/api/v1/userInfo/findByIds",
            requestOptions: {
                method: "POST",
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({ ids: userIds })
            }
        });

        const namesMap = {};
        if (namesResponse?.success) {
            const namesData = JSON.parse(namesResponse.fetchansver);
            namesData.data?.forEach(user => {
                const first = user.name?.first || '';
                const last = user.name?.last || '';
                namesMap[user.id] = `${first} ${last}`.trim() || 'Без имени';
            });
        }

        // Counter
        const teachers = groupData.data?.teachers || groupData.teachers;
        const teacherCount = teachers?.length || 0;

        container.innerHTML = `
            <div class="ngu-counter">
                <div class="ngu-counter-item">
                    <div class="ngu-counter-value">${students.length}</div>
                    <div class="ngu-counter-label">Учеников</div>
                </div>
                <div class="ngu-counter-item">
                    <div class="ngu-counter-value">${teacherCount}</div>
                    <div class="ngu-counter-label">Преподавателей</div>
                </div>
                <div class="ngu-counter-item">
                    <div class="ngu-counter-value">${nguEsc(groupId)}</div>
                    <div class="ngu-counter-label">ID группы</div>
                </div>
            </div>`;

        // Показываем всех преподавателей группы, а не только первого.
        (teachers || []).forEach(teacher => {
            const teacherRow = document.createElement('div');
            teacherRow.className = 'ngu-teacher';
            teacherRow.innerHTML = `<span class="ngu-teacher-icon">●</span> Преподаватель: ${nguEsc(teacher.userId)}`;
            container.appendChild(teacherRow);
        });

        students.forEach((student, index) => {
            const name = namesMap[student.userId] || 'Имя не определено';
            // filter(Boolean) — защита от двойных пробелов (иначе в аватар попадает «undefined»)
            const initials = name.split(' ').filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase();

            const startDate = nguFormatDate(student.learningStartDate);

            const card = document.createElement('div');
            card.className = 'ngu-student-card';
            card.style.animationDelay = `${index * 60}ms`;

            card.innerHTML = `
                <span class="ngu-index">${String(index + 1).padStart(2, '0')}</span>
                <div class="ngu-avatar">${nguEsc(initials)}</div>
                <div class="ngu-info">
                    <div class="ngu-name">${nguEsc(name)}</div>
                    <div class="ngu-meta-row">
                        <span class="ngu-meta" data-copy="${nguEsc(student.userId)}">ID: ${nguEsc(student.userId)}</span>
                        ${startDate ? `<span class="ngu-start" title="Дата начала обучения">📅 ${nguEsc(startDate)}</span>` : ''}
                    </div>
                </div>
                <button class="ngu-crm-btn" data-userid="${nguEsc(student.userId)}">CRM</button>
                <span class="ngu-service-tag">${nguEsc(student.educationServiceId)}</span>
            `;

            card.querySelector('.ngu-crm-btn').addEventListener('click', (e) => {
                window.open(`https://crm2.skyeng.ru/persons/${e.currentTarget.dataset.userid}`, '_blank');
            });

            const meta = card.querySelector('.ngu-meta');
            meta.addEventListener('click', async () => {
                await copyToClipboard(student.userId);
                meta.textContent = 'Скопировано!';
                meta.style.color = 'var(--ngu-cyan)';
                setTimeout(() => {
                    meta.textContent = `ID: ${student.userId}`;
                    meta.style.color = '';
                }, 1500);
            });

            container.appendChild(card);
        });



    } catch (error) {
        console.error('[GrList]', error);
        container.innerHTML = `
            <div class="ngu-status error">
                <span class="ngu-status-icon">⚡</span>
                <div class="ngu-status-title">Системная ошибка</div>
                <div class="ngu-status-desc">${nguEsc(error.message)}</div>
            </div>`;
    }
});

// Клик по #GrListData обрабатывается делегированно в Link_Hybrid.js (ACTIONS.getGrListDataButtonPress).
// Раньше здесь был ещё и btn.onclick — из-за двойного вызова окно открывалось и сразу закрывалось.
