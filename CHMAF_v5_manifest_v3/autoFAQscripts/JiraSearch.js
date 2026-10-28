// ============================================================
// JiraSearch — стиль Corporate Graphite Dark (как Queue.js), SVG-иконки
// ============================================================

let requesttojiratext;
// Топ-уровень модуля: битый JSON здесь валил бы весь JiraSearch,
// поэтому только через защитный readJsonLocal (из utils.js)
let favissues = readJsonLocal('bugsarray', []);

// --- SVG-иконки (Lucide, stroke = currentColor) ---
const JIRA_ICO_PATHS = {
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    eraser: '<path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    bugOff: '<path d="M15 7.13V6a3 3 0 0 0-5.14-2.1L8 2"/><path d="M14.12 3.88 16 2"/><path d="M22 13h-4v-2a4 4 0 0 0-4-4h-1.3"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="m2 2 20 20"/><path d="M7.7 7.7A4 4 0 0 0 6 11v3a6 6 0 0 0 11.13 3.13"/><path d="M12 20v-8"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    lifebuoy: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
    apple: '<path d="M12 6.528V3a1 1 0 0 1 1-1"/><path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"/>',
    phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>'
};
const jIco = (name, cls = 'jiras-ico') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${JIRA_ICO_PATHS[name] || ''}</svg>`;

/** Сердечко «в избранном»: заливка через класс, иконка одна. */
function setJiraHeart(btn, isFav) {
    if (!btn) return;
    btn.classList.toggle('is-fav', isFav);
    btn.title = isFav ? 'Удалить из избранного' : 'В избранное';
}

const glassStylesJiraS = `
<style>
    /* Шрифты (Inter, JetBrains Mono) загружаются один раз в design-system.css */
    #AF_Jira .jiras-glass-wrapper,
    #AF_Jira .jiras-glass-wrapper * { box-sizing: border-box; }

    #AF_Jira .jiras-glass-wrapper {
        display: flex;
        flex-direction: column;
        width: min(650px, calc(100vw - 24px));
        padding: 18px;
        color: #edf2fb;
        background:
            radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
            #111827;
        border: 1px solid #344258;
        border-radius: 18px;
        box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
        font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
        font-size: 13px;
    }

    #AF_Jira .jiras-ico { width: 17px; height: 17px; display: block; flex: 0 0 auto; transition: transform .2s cubic-bezier(.3, 1.4, .6, 1), color .16s ease; }

    /* === HEADER === */
    #AF_Jira .jiras-glass-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
        padding-bottom: 14px;
        border-bottom: 1px solid #344258;
        cursor: move;
    }
    #AF_Jira .jiras-title {
        display: flex; align-items: center; gap: 10px;
        flex: 1; min-width: 0;
    }
    #AF_Jira .jiras-title-name { font-size: 15px; font-weight: 700; color: #fff; }
    #AF_Jira .jiras-token {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 6px 11px;
        color: #a6b4cb;
        background: #182335;
        border: 1px solid #364660;
        border-radius: 10px;
        font-size: 11px; font-weight: 700;
        letter-spacing: .03em; text-transform: uppercase;
    }
    #AF_Jira #searchjiratknstatus {
        display: inline-flex; align-items: center; gap: 6px;
        color: #7c8aa3;
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
        text-transform: none;
        letter-spacing: 0;
    }
    #AF_Jira #searchjiratknstatus::before {
        content: '';
        width: 8px; height: 8px;
        border-radius: 50%;
        background: currentColor;
        box-shadow: 0 0 8px currentColor;
    }
    #AF_Jira #searchjiratknstatus.is-ok  { color: #4ade80; }
    #AF_Jira #searchjiratknstatus.is-bad { color: #ff7a8f; }

    /* Квадратные кнопки-иконки */
    #AF_Jira .jiras-glass-btn-icon {
        width: 36px; height: 36px; min-width: 36px;
        padding: 0;
        display: inline-flex; align-items: center; justify-content: center;
        color: #dce5f5;
        background: #1b283c;
        border: 1px solid #3c4d68;
        border-radius: 9px;
        cursor: pointer;
        transition: background-color .16s ease, border-color .16s ease, transform .16s ease, box-shadow .16s ease;
    }
    #AF_Jira .jiras-glass-btn-icon:hover { color: #fff; background: #293b56; border-color: #7799e2; transform: translateY(-1px); }
    #AF_Jira #RefreshJiraStatus .jiras-ico { color: #7dd3fc; }
    #AF_Jira #ClearJiraData .jiras-ico     { color: #f0c674; }
    #AF_Jira #jirainstr .jiras-ico         { color: #a9c0ff; }
    #AF_Jira #RefreshJiraStatus:hover .jiras-ico { transform: rotate(90deg); }
    #AF_Jira #ClearJiraData:hover .jiras-ico     { transform: rotate(-12deg) translateX(-1px); }
    #AF_Jira #jirainstr:hover .jiras-ico         { transform: scale(1.12); }

    #AF_Jira #hideMej {
        color: #ffb0be;
        background: rgba(255, 116, 140, .08);
        border-color: rgba(255, 116, 140, .3);
    }
    #AF_Jira #hideMej:hover { color: #fff; background: rgba(255, 116, 140, .18); border-color: rgba(255, 116, 140, .6); }

    /* === ФИЛЬТРЫ === */
    #AF_Jira .jiras-glass-toolbar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-bottom: 14px;
    }
    #AF_Jira .glass-tool-line {
        --tc: #8fb4ff; --tc-rgb: 143, 180, 255;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 6px;
        min-height: 62px;
        padding: 10px 6px;
        color: #c3cee2;
        background: #1a2536;
        border: 1px solid #344258;
        border-radius: 12px;
        cursor: pointer;
        font: 600 12px/1 inherit;
        font-family: inherit;
        transition: background-color .16s ease, border-color .16s ease, transform .16s ease, box-shadow .16s ease, color .16s ease;
    }
    #AF_Jira .glass-tool-line .jiras-ico { width: 20px; height: 20px; color: var(--tc); }
    #AF_Jira .glass-tool-line:hover {
        color: #fff;
        background: #23334b;
        border-color: rgba(var(--tc-rgb), .7);
        transform: translateY(-1px);
    }
    #AF_Jira .glass-tool-line:hover .jiras-ico { transform: scale(1.12); }
    #AF_Jira .glass-tool-line.active-query {
        color: #fff;
        background: linear-gradient(180deg, rgba(var(--tc-rgb), .22), rgba(var(--tc-rgb), .08));
        border-color: rgba(var(--tc-rgb), .8);
        box-shadow: 0 0 0 3px rgba(var(--tc-rgb), .14), 0 6px 16px rgba(var(--tc-rgb), .16);
    }
    #AF_Jira .glass-tool-line.active-query .jiras-ico { filter: drop-shadow(0 0 5px rgba(var(--tc-rgb), .7)); }

    #AF_Jira #defaultQuery   { --tc: #8fb4ff; --tc-rgb: 143, 180, 255; }
    #AF_Jira #ZBPQuery       { --tc: #ff7a8f; --tc-rgb: 255, 122, 143; }
    #AF_Jira #freshQuery     { --tc: #4ade80; --tc-rgb: 74, 222, 128; }
    #AF_Jira #customQuery    { --tc: #c4a8ff; --tc-rgb: 196, 168, 255; }
    #AF_Jira #PSquery        { --tc: #fb923c; --tc-rgb: 251, 146, 60; }
    #AF_Jira #getiosbugs     { --tc: #e2e8f0; --tc-rgb: 226, 232, 240; }
    #AF_Jira #getandroidbugs { --tc: #a3e635; --tc-rgb: 163, 230, 53; }
    #AF_Jira #favouriteBugs  { --tc: #f472b6; --tc-rgb: 244, 114, 182; }

    @media (max-width: 500px) {
        #AF_Jira .jiras-glass-toolbar { grid-template-columns: repeat(2, 1fr); }
    }

    /* === ПОЛЯ === */
    #AF_Jira .jiras-glass-input-container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    #AF_Jira .jiras-search-line { display: flex; gap: 8px; }
    #AF_Jira .jiras-glass-input {
        width: 100%;
        min-height: 36px;
        padding: 8px 12px;
        color: #edf2fb;
        background: #0d1625;
        border: 1px solid #3a4961;
        border-radius: 9px;
        outline: none;
        font-size: 13px;
        font-family: inherit;
        transition: background .2s, border-color .2s, box-shadow .2s;
    }
    #AF_Jira .jiras-glass-input::placeholder { color: #6f7f99; }
    #AF_Jira .jiras-glass-input:hover { background: #142034; border-color: #657caa; }
    #AF_Jira .jiras-glass-input:focus { background: #142034; border-color: #829fff; box-shadow: 0 0 0 3px rgba(110, 152, 247, .16); }
    #AF_Jira .jiras-glass-textarea { resize: vertical; min-height: 54px; font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 12px; }

    #AF_Jira #getJiraTasks {
        width: auto; padding: 0 16px; gap: 7px;
        color: #eef3ff;
        background: #4268c9;
        border-color: #7293ed;
        box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
        font: 600 13px/1 inherit;
        font-family: inherit;
    }
    #AF_Jira #getJiraTasks:hover { background: #547ce1; border-color: #a2b9fa; box-shadow: 0 6px 19px rgba(58, 96, 205, .3); }
    #AF_Jira #getJiraTasks .jiras-ico { width: 16px; height: 16px; }

    /* === СПИСОК === */
    #AF_Jira .jiras-glass-scroll {
        max-height: 420px;
        overflow-y: auto;
        padding-right: 6px;
        margin-bottom: 8px;
        scrollbar-width: thin;
        scrollbar-color: #536a8e transparent;
    }
    #AF_Jira .jiras-glass-scroll::-webkit-scrollbar { width: 6px; }
    #AF_Jira .jiras-glass-scroll::-webkit-scrollbar-track { background: transparent; }
    #AF_Jira .jiras-glass-scroll::-webkit-scrollbar-thumb { background: #536a8e; border-radius: 4px; }

    #AF_Jira .jiras-glass-issue-row {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        margin-bottom: 7px;
        padding: 8px 10px;
        background: #1a2536;
        border: 1px solid #344258;
        border-left: 3px solid #617fbd;
        border-radius: 10px;
        line-height: 1.4;
        transition: background-color .16s ease, border-color .16s ease;
    }
    #AF_Jira .jiras-glass-issue-row:hover { background: #23334b; border-color: #6685be; border-left-color: #92afff; }

    #AF_Jira .jiras-glass-issue-row a {
        flex: 1;
        min-width: 0;
        color: #f0f4fb;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        word-break: break-word;
        transition: color .15s;
    }
    #AF_Jira .jiras-glass-issue-row a:hover { color: #a9c0ff; text-decoration: underline; text-underline-offset: 3px; }

    #AF_Jira .jiras-priority-img { width: 18px; height: 18px; flex: 0 0 18px; }
    #AF_Jira .jiras-prio-dot { width: 18px; height: 18px; flex: 0 0 18px; display: inline-flex; align-items: center; justify-content: center; }
    #AF_Jira .jiras-prio-dot::before { content: ''; width: 9px; height: 9px; border-radius: 50%; background: var(--pc, #94a3b8); box-shadow: 0 0 6px var(--pc, #94a3b8); }

    /* Кнопки в строке */
    #AF_Jira .jiras-glass-icon-btn {
        width: 28px; height: 28px; flex: 0 0 28px;
        display: inline-flex; align-items: center; justify-content: center;
        color: #a6b4cb;
        background: #1b283c;
        border: 1px solid #364660;
        border-radius: 8px;
        cursor: pointer;
        font: 700 11px/1 'JetBrains Mono', monospace;
        transition: all .16s ease;
    }
    #AF_Jira .jiras-glass-icon-btn .jiras-ico { width: 15px; height: 15px; }
    #AF_Jira .jiras-glass-icon-btn:hover { color: #fff; background: #293b56; border-color: #7799e2; transform: translateY(-1px); }
    #AF_Jira .jiras-btn-chat .jiras-ico { color: #8fb4ff; }
    #AF_Jira .jiras-btn-plus { color: #4ade80; }
    #AF_Jira .jiras-btn-plus:hover { border-color: #4ade80; }
    #AF_Jira .jiras-btn-del .jiras-ico { color: #ff8fa3; }
    #AF_Jira .jiras-btn-del:hover { border-color: #ff7a8f; background: rgba(255, 116, 140, .14); }
    #AF_Jira .jiras-btn-heart .jiras-ico { color: #8c97ad; }
    #AF_Jira .jiras-btn-heart:hover .jiras-ico { color: #f472b6; transform: scale(1.15); }
    #AF_Jira .jiras-btn-heart.is-fav { border-color: rgba(244, 114, 182, .55); background: rgba(244, 114, 182, .12); }
    #AF_Jira .jiras-btn-heart.is-fav .jiras-ico { color: #f472b6; fill: #f472b6; filter: drop-shadow(0 0 4px rgba(244, 114, 182, .6)); }

    /* Счётчик репортов */
    #AF_Jira .newcount {
        min-width: 30px; height: 24px;
        padding: 0 6px;
        display: inline-flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        color: #a9c0ff;
        background: #293a56;
        border: 1px solid #435b80;
        border-radius: 7px;
        font: 700 11px/1 'JetBrains Mono', 'SF Mono', monospace;
    }

    #AF_Jira .jiras-row-actions { display: flex; gap: 5px; margin-left: auto; }
    #AF_Jira .jiras-empty {
        padding: 18px 14px;
        text-align: center;
        color: #a6b4cb;
        background: #182335;
        border: 1px dashed #364660;
        border-radius: 12px;
    }
    #AF_Jira #foundIssuesAmount {
        display: inline-block;
        color: #a6b4cb;
        font-size: 11px; font-weight: 700;
        letter-spacing: .03em; text-transform: uppercase;
    }
    #AF_Jira #foundIssuesAmount:empty { display: none; }

    /* Пагинация */
    #AF_Jira #pagesSwitcher { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; padding-top: 8px; }
    #AF_Jira .jiras-glass-page-btn {
        min-width: 34px; height: 30px;
        padding: 0 8px;
        display: inline-flex; align-items: center; justify-content: center;
        color: #c3cee2;
        background: #1b283c;
        border: 1px solid #3c4d68;
        border-radius: 8px;
        cursor: pointer;
        font: 700 12px/1 'JetBrains Mono', monospace;
        transition: all .16s ease;
    }
    #AF_Jira .jiras-glass-page-btn:hover { color: #fff; background: #293b56; border-color: #7799e2; }
    #AF_Jira .jiras-glass-page-btn.active { color: #fff; background: #4268c9; border-color: #7293ed; box-shadow: 0 4px 12px rgba(58, 96, 205, .28); }

    @media (prefers-reduced-motion: reduce) {
        #AF_Jira .jiras-ico { transition: none; transform: none !important; }
    }
</style>
`;

const win_Jira = `
${glassStylesJiraS}
<div class="jiras-glass-wrapper">
    <div class="jiras-glass-header chmaf-drag-handle" id="jira_1str">
        <div class="jiras-title">
            <span class="jiras-title-name">Jira</span>
            <span class="jiras-token">Токен <span id="searchjiratknstatus">—</span></span>
        </div>

        <button class="mainButton jiras-glass-btn-icon" id="RefreshJiraStatus" title="Обновить статус токена">${jIco('refresh')}</button>
        <button class="mainButton jiras-glass-btn-icon" id="ClearJiraData" title="Очистить всё">${jIco('eraser')}</button>
        <button class="mainButton jiras-glass-btn-icon" id="jirainstr" title="Инструкция">${jIco('help')}</button>
        <button class="mainButton jiras-glass-btn-icon buttonHide" id="hideMej" title="Закрыть">${jIco('close')}</button>
    </div>

    <div class="jiras-glass-toolbar" id="control_jira_search">
        <button class="mainButton jiras-glass-btn active-query glass-tool-line" id="defaultQuery" title="Дефолтный поиск">${jIco('list')}Default</button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="ZBPQuery" title="Zero Bug Policy">${jIco('bugOff')}ZeroBug</button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="freshQuery" title="Свежие баги">${jIco('sparkles')}Fresh</button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="customQuery" title="Ваш JQL запрос">${jIco('code')}Custom</button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="PSquery" title="Project Support">${jIco('lifebuoy')}Support</button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="getiosbugs" title="iOS задачи">${jIco('apple')}iOS</button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="getandroidbugs" title="Android задачи">${jIco('phone')}Android</button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="favouriteBugs" title="Избранное">${jIco('heart')}Saved</button>
    </div>

    <div class="jiras-glass-input-container" id="fields_jira_search">
        <textarea id="JQLquery" class="jiras-glass-input jiras-glass-textarea" placeholder="JQL запрос" title="Введите сюда JQL запрос" autocomplete="off"></textarea>
        <div class="jiras-search-line">
            <input id="testJira" class="jiras-glass-input" placeholder="Введите слово или фразу" autocomplete="off">
            <button class="mainButton jiras-glass-btn-icon" id="getJiraTasks" title="Искать (Enter)">${jIco('search')}Найти</button>
        </div>
    </div>

    <div id="jira_tasks_box">
        <div id="issuetable" class="jiras-glass-scroll"></div>
        <div id="favouriteissuetable" class="jiras-glass-scroll" style="display:none"></div>
        <span id="foundIssuesAmount"></span>
    </div>

    <div id="pagesSwitcher"></div>
</div>`;

createWindow('AF_Jira', 'winTopJira', 'winLeftJira', win_Jira);
hideWindowOnDoubleClick('AF_Jira');
hideWindowOnClick('AF_Jira', 'hideMej');

const optionsforfetch = (queryName, indexStart) => ({
    headers: {
        "__amdmodulename": "jira/issue/utils/xsrf-token-header",
        "accept": "*/*",
        "x-atlassian-token": "no-check",
        "x-requested-with": "XMLHttpRequest"
        // sec-fetch-* — запрещённые для ручной установки заголовки, браузер их игнорирует
    },
    body: `startIndex=${indexStart}&filterId=21266&jql=${queryName}&layoutKey=list-view`,
    method: "POST",
    mode: "cors",
    credentials: "include"
});

const JQLTemplates = { // шаблоны JQL запросов
    defqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    frqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports >= 0 AND text ~ "${testJira.value}" ORDER BY Created',
    zbpqueryitem: 'issuetype in (Bug, Task) AND status = closed AND resolution in ("Won\'t Fix", "Won\'t Do") AND Reports >= 0 AND created >= 2022-01-01 AND text ~ "${testJira.value}" ORDER BY updated',
    iosbugsqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    androidbugsqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    PSqueryitem: 'project = PS AND text ~ "${testJira.value}" ORDER BY Created'
};

// передача запросов в форму через геттеры
// Кавычки и обратный слэш в тексте поиска экранируем, иначе JQL ломается
// (например, поиск по фразе с ") и Jira возвращает ошибку вместо задач.
const escapeJqlText = (value) => String(value ?? '').replace(/[\\"]/g, '\\$&');

Object.entries(JQLTemplates).forEach(([key, template]) => {
    Object.defineProperty(window, key, {
        // Функция-замена: строка-замена интерпретировала бы $& и $' в тексте поиска.
        get: () => template.replace('${testJira.value}', () => escapeJqlText(document.getElementById('testJira').value))
    });
});

function toggleAndDeactivateQueries(currentId) {
    const queryIds = ['defaultQuery', 'getiosbugs', 'getandroidbugs', 'customQuery', 'favouriteBugs', 'ZBPQuery', 'freshQuery', 'PSquery'];
    queryIds.forEach(id => {
        const element = document.getElementById(id);
        if (id === currentId) {
            element.classList.add('active-query');
        } else {
            element.classList.remove('active-query');
        }
    });
}

function showelemonpages() {
    document.getElementById('testJira').value = "";
    document.getElementById('fields_jira_search').style.display = "";
    document.getElementById('issuetable').style.display = "";
    document.getElementById('foundIssuesAmount').style.display = "";
    document.getElementById('pagesSwitcher').style.display = "flex";
    document.getElementById('favouriteissuetable').style.display = "none";
}

// Функции фильтрации и замены
const filterItems = (item, index) => index % 2 !== 0 ? item : null;
const replaceItem = (item) => item ? item.replace('">', ' – ').replace(/<\/a>\s*$/, '') : item;

// Хелпер для проверки, в избранном ли задача
const isFavorite = (issueId) => favissues.some(fav => fav.id === issueId);

// ============================================================
// ИКОНКИ ПРИОРИТЕТОВ JIRA
// Прямые <img src="jira..."> блокируются Chrome (Private Network Access:
// публичный autofaq.ai → внутренний адрес jira). Грузим SVG через
// background-прокси (у расширения host-permission) и подставляем data-URI.
// ============================================================
const priorityIconCache = new Map(); // url → dataURI | '' (ошибка)

// Эмодзи-фолбэк на случай, если SVG приоритета не загрузился
const PRIO_COLOR = {
    blocker: '#ef4444', critical: '#f43f5e', highest: '#f43f5e', major: '#fb923c',
    high: '#fb923c', medium: '#facc15', minor: '#60a5fa', low: '#4ade80', lowest: '#94a3b8', trivial: '#cbd5e1'
};

function applyPriorityIcon(url, uri) {
    // Фолбэк: цветной эмодзи вместо битой/недоступной иконки
    const fallbackSpan = () => {
        const key = (url.match(/priorities\/([a-z0-9_]+)\.svg/i) || [])[1] || '';
        const span = document.createElement('span');
        span.className = 'jiras-prio-dot';
        span.title = key || 'priority';
        span.style.setProperty('--pc', PRIO_COLOR[key.toLowerCase()] || '#94a3b8');
        return span;
    };

    document.querySelectorAll(`img.jiras-priority-img[data-src="${url}"]`).forEach(img => {
        if (uri) {
            img.src = uri;
            img.removeAttribute('data-src');
            // КРИТИЧНО: снимаем display:none, поставленный на время загрузки,
            // иначе иконка навсегда остаётся скрытой (баг «пустых» строк)
            img.style.display = '';
        } else {
            img.replaceWith(fallbackSpan());
        }
    });
}

function hydratePriorityImages(rootEl) {
    if (!rootEl) return;

    const imgs = rootEl.querySelectorAll('img.jiras-priority-img[data-src]');
    const uniqueUrls = [...new Set(Array.from(imgs).map(img => img.dataset.src))];

    uniqueUrls.forEach(url => {
        // Уже в кэше — применяем и выходим
        if (priorityIconCache.has(url)) {
            applyPriorityIcon(url, priorityIconCache.get(url));
            return;
        }

        priorityIconCache.set(url, ''); // метка «в процессе» против дублей запросов

        chrome.runtime.sendMessage({
            action: 'getFetchRequest',
            fetchURL: url,
            requestOptions: { method: 'GET' }
        }, res => {
            let uri = '';
            if (res?.success && /<svg/i.test(res.fetchansver)) {
                uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(res.fetchansver);
            }
            priorityIconCache.set(url, uri);
            applyPriorityIcon(url, uri);
        });
    });

    // Применяем всё, что уже лежит в кэше с прошлых рендеров/страниц
    imgs.forEach(img => {
        const uri = priorityIconCache.get(img.dataset.src);
        if (uri) {
            img.src = uri;
            img.removeAttribute('data-src');
        } else if (uri === '') {
            img.style.display = 'none';
        }
    });
}

function formatIssue(item, currentNumber, issueKey, searchText, currentpic, currentIds) {
    const processedItem = replaceItem(item);
    const temporarka = (processedItem && processedItem.toLowerCase().includes(searchText.toLowerCase()))
        ? highlightSearchText(processedItem, searchText)
        : processedItem;

    // Сверяем ID строки с массивом избранного (приводим к строке для надежности)
    const isAlreadyFav = favissues.some(fav => String(fav.id) === String(currentIds));
    const heartTitle = isAlreadyFav ? "Удалить из избранного" : "В избранное";

    return `
        <div class="jiras-glass-issue-row" data-id="${currentIds}">
            <span class="newcount" title="Репорты">${currentNumber || 0}</span>
            <img class="jiras-priority-img" data-src="${currentpic}" title="Приоритет">
            <span class="jiraissues jiras-glass-icon-btn jiras-btn-chat" title="Отправить в чат">${jIco('chat')}</span>
            <span class="refreshissues jiras-glass-icon-btn jiras-btn-plus" title="Увеличить Support Tab">+1</span>
            <span name="addtofavourites" class="jiras-glass-icon-btn jiras-btn-heart${isAlreadyFav ? ' is-fav' : ''}" title="${heartTitle}">${jIco('heart')}</span>
            <a name="buglinks" href="https://jira.skyeng.link/browse/${issueKey}" target="_blank">${temporarka}</a>
            <span name="issueIds" style="display:none">${currentIds}</span>
        </div>
    `;
}

function addPageSwitcher(spanCount) {
    if (spanCount <= 1) return;
    let spanElements = "";
    for (let i = 0; i < spanCount; i++) {
        const isActive = i === 0 ? "active" : "";
        spanElements += `<span class="jiras-glass-page-btn ${isActive}" name="changeList" value="${i * 50}">${i + 1}</span>`;
    }
    document.getElementById('pagesSwitcher').innerHTML = spanElements;
}

function addJiraIssueOnClickEvent(barray, issueKeys) {
    barray.forEach((el, j) => {
        el.addEventListener('click', () => {
            const chatId = getChatId();
            if (chatId) {
                if (window.location.href.includes('tickets/assigned')) {
                    sendComment(`https://jira.skyeng.link/browse/${issueKeys[j]}`);
                }
                afApiFetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        conversationId: chatId,
                        elements: [{ name: "taskUrl", value: `https://jira.skyeng.link/browse/${issueKeys[j]}` }]
                    }),
                    method: "POST"
                });
            }
        });
    });
}

function renderFavorites() {
    const outputTable = document.getElementById('favouriteissuetable');
    if (!outputTable) return;

    // Сохраняем состояние в localStorage при каждом рендере для надежности
    localStorage.setItem('bugsarray', JSON.stringify(favissues));

    if (favissues.length === 0) {
        outputTable.innerHTML = '<div class="jiras-empty">Список избранного пуст</div>';
        return;
    }

    outputTable.innerHTML = favissues.map(fav => `
        <div class="jiras-glass-issue-row" data-id="${fav.id}">
            <span class="newcount" title="Репорты">${fav.num}</span>
            <a href="${fav.href}" target="_blank">${fav.html}</a>
            <div class="jiras-row-actions">
                <span name="addtonotesbug" class="jiras-glass-icon-btn jiras-btn-chat" title="В чат">${jIco('chat')}</span>
                <span name="increasecount" class="jiras-glass-icon-btn jiras-btn-plus" title="Увеличить Tab">+1</span>
                <span name="removefromfavourites" class="jiras-glass-icon-btn jiras-btn-del" title="Удалить">${jIco('trash')}</span>
            </div>
        </div>
    `).join("");

    // Навешиваем события ПОСЛЕ отрисовки
    outputTable.querySelectorAll('.jiras-glass-issue-row').forEach((row, index) => {
        const id = row.getAttribute('data-id');
        const currentFav = favissues.find(f => f.id === id);

        // Кнопка удаления
        row.querySelector('[name="removefromfavourites"]').onclick = () => {
            favissues = favissues.filter(fav => String(fav.id) !== String(id));
            localStorage.setItem('bugsarray', JSON.stringify(favissues));

            // КЛЮЧЕВОЙ МОМЕНТ: Синхронизируем иконку в основном поиске (если он отрисован)
            const mainSearchBtn = document.querySelector(`#issuetable .jiras-glass-issue-row[data-id="${id}"] [name="addtofavourites"]`);
            if (mainSearchBtn) {
                setJiraHeart(mainSearchBtn, false);
            }

            renderFavorites();
        };

        // Кнопка "В чат"
        row.querySelector('[name="addtonotesbug"]').onclick = () => {
            if (currentFav) {
                const issueUrl = currentFav.href;
                if (typeof sendComment === 'function') sendComment(issueUrl);

                const chatId = typeof getChatId === 'function' ? getChatId() : null;
                if (chatId) {
                    afApiFetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ conversationId: chatId, elements: [{ name: "taskUrl", value: issueUrl }] }),
                        method: "POST"
                    });
                }
            }
        };

        // Кнопка инкремента (+1)
        row.querySelector('[name="increasecount"]').onclick = function () {
            const countBadge = row.querySelector('.newcount');
            chrome.runtime.sendMessage({
                action: 'getFetchRequest',
                fetchURL: `https://jira.skyeng.link/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${id}`,
                requestOptions: { method: 'GET' }
            }, authresponse => {
                if (authresponse.success) {
                    const jira_token = authresponse.fetchansver.match(/"atl_token":"(.*lin)/)?.[1];
                    const countMatch = authresponse.fetchansver.match(/customfield_15410.*?value=.*?(\d+)/);
                    if (jira_token && countMatch) {
                        const newCount = (parseInt(countMatch[1]) + 1).toString();
                        const body = `customfield_15410=${newCount}&issueId=${id}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`;

                        chrome.runtime.sendMessage({
                            action: 'getFetchRequest',
                            fetchURL: 'https://jira.skyeng.link/secure/AjaxIssueAction.jspa?decorator=none',
                            requestOptions: {
                                method: 'POST',
                                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                                body: body
                            }
                        }, res => {
                            if (res.success) {
                                countBadge.innerText = newCount;
                                // Обновляем данные в массиве избранного, чтобы при обновлении страницы число сохранилось
                                const favIdx = favissues.findIndex(f => f.id === id);
                                if (favIdx !== -1) {
                                    favissues[favIdx].num = newCount;
                                    localStorage.setItem('bugsarray', JSON.stringify(favissues));
                                }
                            }
                        });
                    }
                }
            });
        };
    });
}

function addFavouritesOnClickEvent(addtofarr, tagsarray, massivissueids) {
    addtofarr.forEach((btn, v) => {
        btn.onclick = () => {
            const issueId = massivissueids[v].innerText;
            const isFav = favissues.some(fav => String(fav.id) === String(issueId));

            if (!isFav) {
                // Добавляем в избранное
                const issueData = {
                    id: issueId,
                    html: tagsarray[v].innerHTML,
                    href: tagsarray[v].href,
                    num: btn.closest('.jiras-glass-issue-row').querySelector('.newcount').innerText
                };
                favissues.push(issueData);
                setJiraHeart(btn, true);
            } else {
                // Удаляем из избранного (если нажали на красное сердечко в поиске)
                favissues = favissues.filter(fav => String(fav.id) !== String(issueId));
                setJiraHeart(btn, false);
            }

            localStorage.setItem('bugsarray', JSON.stringify(favissues));

            // Если вкладка избранного открыта в фоне, обновляем её
            if (document.getElementById('favouriteissuetable').style.display === "block") {
                renderFavorites();
            }
        };
    });
}

function addRefreshIssueOnClickEvent(refreshissuesarr, issueIds) {
    refreshissuesarr.forEach((issueElement, index) => {
        issueElement.addEventListener('click', () => {
            // Защита от двойного клика: два параллельных чтения счётчика
            // давали одно и то же значение, и +1 засчитывался один раз.
            if (issueElement.dataset.busy) return;
            issueElement.dataset.busy = '1';
            const unlock = () => { delete issueElement.dataset.busy; };

            const fetchURLToken = `https://jira.skyeng.link/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${issueIds[index]}`;
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLToken, requestOptions: { method: 'GET', credentials: 'include' } }, responseToken => {
                if (responseToken?.success) {
                    const responseAuth = responseToken.fetchansver;
                    const jira_token = responseAuth.match(/"atl_token":"(.*lin)/)?.[1];
                    const countMatch = responseAuth.match(/customfield_15410.*?value=.*?(\d+)/);
                    if (jira_token && countMatch) {
                        const increasedcount = (parseInt(countMatch[1]) + 1).toString();
                        const fetchURLIncrease = "https://jira.skyeng.link/secure/AjaxIssueAction.jspa?decorator=none";
                        const requestOptionsIncrease = {
                            method: 'POST',
                            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                            body: `customfield_15410=${increasedcount}&issueId=${issueIds[index]}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`,
                            credentials: 'include',
                        };

                        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLIncrease, requestOptions: requestOptionsIncrease }, responseIncrease => {
                            unlock();
                            if (responseIncrease?.success) {
                                // Счётчик своей строки, а не N-й .newcount на всей странице.
                                const badge = issueElement.closest('.jiras-glass-issue-row')?.querySelector('.newcount');
                                if (badge) badge.textContent = increasedcount;

                                const fav = favissues.find(f => String(f.id) === String(issueIds[index]));
                                if (fav) {
                                    fav.num = increasedcount;
                                    localStorage.setItem('bugsarray', JSON.stringify(favissues));
                                }
                            } else {
                                console.log('Ошибка при увеличении счетчика Support Tab:', responseIncrease?.error);
                            }
                        });
                    } else {
                        unlock();
                    }
                } else {
                    unlock();
                    console.log('Ошибка при получении токена и счетчика:', responseToken?.error);
                }
            });
        });
    });
}

function getJiraTask(requestOptions) {
    const fetchURL = 'https://jira.skyeng.link/rest/issueNav/1/issueTable';
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, tasksresponse => {
        if (tasksresponse?.success) {
            const rezissuetable = JSON.parse(tasksresponse.fetchansver);
            const { issueKeys, table, issueIds } = rezissuetable.issueTable;

            if (!table) {
                document.getElementById('issuetable').innerHTML = '<div class="jiras-empty">Задач не найдено</div>';
                return;
            }

            const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi)?.filter(filterItems) || [];
            const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);
            const searchText = document.getElementById('testJira').value;
            const currentpics = table.match(/https:\/\/jira.skyeng.link\/images\/icons\/priorities\/.*svg/gm) || [];

            let issues = '';
            for (let i = 0; i < Math.min(issueKeys.length, 50); i++) {
                if (matchedItems[i] && issueKeys[i]) {
                    issues += formatIssue(matchedItems[i], matchedNumbers?.[i], issueKeys[i], searchText, currentpics[i], issueIds[i]);
                }
            }

            document.getElementById('issuetable').innerHTML = issues;
            hydratePriorityImages(document.getElementById('issuetable'));
            const foundIssuesAmount = issueKeys.length;

            // ceil: при ровно 50 задачах раньше появлялась пустая вторая страница.
            addPageSwitcher(Math.ceil(foundIssuesAmount / 50));
            document.getElementById('foundIssuesAmount').innerHTML = `Всего найдено задач: ${foundIssuesAmount}`;

            addJiraIssueOnClickEvent(document.querySelectorAll('.jiraissues'), issueKeys);
            addFavouritesOnClickEvent(
                document.getElementsByName('addtofavourites'),
                document.getElementsByName('buglinks'),
                document.getElementsByName('issueIds'),
                document.getElementById('favouriteissuetable')
            );
            addRefreshIssueOnClickEvent(document.querySelectorAll('.refreshissues'), issueIds);

            switchJiraPages();
        } else {
            createAndShowButton('Не удалось получить задачи: ' + (tasksresponse?.error || chrome.runtime.lastError?.message || 'неизвестная ошибка'), 'error');
        }
    });
}

function switchJiraPages() {
    if (!requesttojiratext) { createAndShowButton("Выполни поиск заново", 'warning'); return; }

    const pageSwArr = document.getElementsByName('changeList');
    const fetchURL = 'https://jira.skyeng.link/rest/issueNav/1/issueTable';

    pageSwArr.forEach(page => {
        page.addEventListener('click', function () {
            if (!this.classList.contains('active')) {
                document.getElementById('issuetable').innerHTML =
                    chmafSkeletons(6, { dot: true });
                pageSwArr.forEach(p => p.classList.remove('active'));
                this.classList.add('active');

                const requestOptions = optionsforfetch(requesttojiratext, page.getAttribute('value'));

                chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, response => {
                    if (response?.success) {
                        const responseData = JSON.parse(response.fetchansver);
                        const { issueKeys, table } = responseData.issueTable;
                        const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi)?.filter(filterItems) || [];
                        const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);
                        const ids = Array.from(table.matchAll(/<tr id="issuerow(\d+)"/g), m => m[1]);
                        const currentpics = table.match(/https:\/\/jira.skyeng.link\/images\/icons\/priorities\/.*svg/gm) || [];
                        const searchText = document.getElementById('testJira').value;
                        const switcher = Number(page.getAttribute('value'));

                        let issues = '';
                        for (let i = 0; i < responseData.issueTable.displayed; i++) {
                            if (matchedItems[i] && issueKeys[+i + switcher]) {
                                issues += formatIssue(matchedItems[i], matchedNumbers?.[i], issueKeys[+i + switcher], searchText, currentpics[i], ids[i]);
                            }
                        }

                        document.getElementById('issuetable').innerHTML = issues;
                        hydratePriorityImages(document.getElementById('issuetable'));

                        addJiraIssueOnClickEvent(document.querySelectorAll('.jiraissues'), issueKeys);
                        addFavouritesOnClickEvent(
                            document.getElementsByName('addtofavourites'),
                            document.getElementsByName('buglinks'),
                            document.getElementsByName('issueIds'),
                            document.getElementById('favouriteissuetable')
                        );
                        addRefreshIssueOnClickEvent(document.querySelectorAll('.refreshissues'), ids);
                    } else {
                        console.log('Ошибка при запросе: ', response?.error);
                    }
                });
            }
        });
    });
}

function ClearPages() {
    const pagesSwitcher = document.getElementById('pagesSwitcher');
    while (pagesSwitcher.firstChild) {
        pagesSwitcher.removeChild(pagesSwitcher.firstChild);
    }
}

document.getElementById('ClearJiraData').addEventListener('click', () => {
    document.getElementById('testJira').value = '';
    document.getElementById('issuetable').innerHTML = '';
    document.getElementById('foundIssuesAmount').innerText = '';
    ClearPages();
});

document.getElementById('jirainstr').addEventListener('click', () => {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-jirasearch%F0%9F%94%8EJiraSearch');
});

function closeChmafMenus() {
    window.closeModuleMenu?.();

    const legacyMenu = document.getElementById('idmymenu');
    if (legacyMenu) {
        legacyMenu.style.setProperty('display', 'none', 'important');
    }

    const mainMenuBtn = document.getElementById('MainMenuBtn');
    if (mainMenuBtn) {
        mainMenuBtn.classList.remove('activeScriptBtn');
    }
}

function getJiraOpenFormPress() {
    const mainBox = document.getElementById('AF_Jira');

    if (!mainBox) {
        window.showCustomAlert?.(
            'Окно Jira не найдено. Обновите расширение и страницу (Ctrl+Shift+R).',
            'error'
        );
        return;
    }

    if (mainBox.style.display === 'none') {
        mainBox.style.display = '';
        closeChmafMenus();

        const jqlQuery = document.getElementById('JQLquery');
        if (jqlQuery) {
            jqlQuery.value = defqueryitem;
        }

        // ═══ ЗАЩИТА ОТ ДУБЛЕЙ СЛУШАТЕЛЕЙ ═══
        const isFirstOpen = !mainBox.dataset.jiraBound;
        mainBox.dataset.jiraBound = '1';

        function checkJiraToken() {
            try {
                chrome.runtime.sendMessage(
                    {
                        action: 'getFetchRequest',
                        fetchURL: 'https://jira.skyeng.link',
                        requestOptions: { method: 'GET' }
                    },
                    response => {
                        const statusEl = document.getElementById('searchjiratknstatus');
                        const html = String(response?.fetchansver ?? '');

                        const ok = Boolean(
                            response?.success &&
                            html.match(/name="atlassian-token" content="(.*lin)/)
                        );

                        if (statusEl) {
                            statusEl.textContent = ok ? 'активен' : 'нет входа';
                            statusEl.classList.toggle('is-ok', ok);
                            statusEl.classList.toggle('is-bad', !ok);
                        }

                        if (!ok) {
                            const message =
                                'Авторизуйтесь в системе Jira — иначе поиск вернёт пустоту';

                            if (typeof window.createAndShowButton === 'function') {
                                window.createAndShowButton(message, 'warning');
                            } else {
                                window.showCustomAlert?.(message, 'warning');
                            }
                        }
                    }
                );
            } catch (error) {
                console.error('[ChMAF][Jira] Ошибка проверки токена:', error);
                window.showCustomAlert?.(
                    'Не удалось проверить авторизацию Jira.',
                    'error'
                );
            }
        }

        checkJiraToken();

        if (localStorage.getItem('bugsarray')) {
            // Повреждённый кэш не должен ронять панель Jira
            const parsedFavs = readJsonLocal('bugsarray', []);
            favissues = Array.isArray(parsedFavs) ? parsedFavs : [];

            renderFavorites();
        }

        if (!isFirstOpen) {
            // Повторное открытие: только обновили токен/избранное — слушатели уже висят
            closeChmafMenus();
            return;
        }

        document
            .getElementById('RefreshJiraStatus')
            ?.addEventListener('click', checkJiraToken);

        const queryButtons = [
            { id: 'defaultQuery', val: () => defqueryitem, search: false },
            { id: 'PSquery', val: () => PSqueryitem, search: false },
            { id: 'freshQuery', val: () => frqueryitem, search: false },
            { id: 'ZBPQuery', val: () => zbpqueryitem, search: false },
            {
                id: 'customQuery',
                val: () => localStorage.getItem('customquery') || '',
                search: false,
                custom: true
            },
            { id: 'getiosbugs', val: () => 'ios', search: true },
            { id: 'getandroidbugs', val: () => 'android', search: true }
        ];

        queryButtons.forEach(btn => {
            const buttonEl = document.getElementById(btn.id);
            if (!buttonEl) return;

            buttonEl.addEventListener('click', function () {
                toggleAndDeactivateQueries(this.id);
                showelemonpages();

                if (btn.search) {
                    const testJira = document.getElementById('testJira');
                    const getJiraTasks = document.getElementById('getJiraTasks');

                    if (testJira) {
                        testJira.value = btn.val();
                    }

                    getJiraTasks?.click();
                } else {
                    const jqlQueryEl = document.getElementById('JQLquery');

                    if (jqlQueryEl) {
                        jqlQueryEl.value = btn.val();

                        if (btn.custom) {
                            jqlQueryEl.oninput = function () {
                                localStorage.setItem('customquery', this.value);
                            };
                        }
                    }
                }
            });
        });

        // Favourite logic
        document.getElementById('favouriteBugs')?.addEventListener('click', function () {
            const favouriteTable = document.getElementById('favouriteissuetable');
            const isVisible = favouriteTable?.style.display === 'block';

            if (!isVisible) {
                toggleAndDeactivateQueries(this.id);

                const issuetable = document.getElementById('issuetable');
                const fields = document.getElementById('fields_jira_search');
                const amount = document.getElementById('foundIssuesAmount');
                const pages = document.getElementById('pagesSwitcher');

                if (issuetable) issuetable.style.display = 'none';
                if (fields) fields.style.display = 'none';
                if (amount) amount.style.display = 'none';
                if (pages) pages.style.display = 'none';
                if (favouriteTable) favouriteTable.style.display = 'block';

                renderFavorites();
            } else {
                document.getElementById('defaultQuery')?.click();
            }
        });

        document.getElementById('getJiraTasks')?.addEventListener('click', () => {
            ClearPages();

            const queries = {
                defaultQuery: defqueryitem,
                PSquery: PSqueryitem,
                freshQuery: frqueryitem,
                customQuery: localStorage.getItem('customquery') || '',
                getiosbugs: iosbugsqueryitem,
                getandroidbugs: androidbugsqueryitem,
                ZBPQuery: zbpqueryitem
            };

            for (const id in queries) {
                const activeEl = document.getElementById(id);

                if (activeEl?.classList.contains('active-query')) {
                    const jqlQueryEl = document.getElementById('JQLquery');

                    if (jqlQueryEl) {
                        jqlQueryEl.value = queries[id];
                        // encodeURIComponent: encodeURI не кодирует & и +, и запрос
                        // «C++» или «A&B» обрезался/искажался в теле формы.
                        requesttojiratext = encodeURIComponent(jqlQueryEl.value);
                        getJiraTask(optionsforfetch(requesttojiratext, 0));
                    }

                    break;
                }
            }
        });

        const handleSearchJiraByEnter = event => {
            if (event.key === 'Enter') {
                document.getElementById('getJiraTasks')?.click();
            }
        };

        document
            .querySelector('#testJira')
            ?.addEventListener('keydown', handleSearchJiraByEnter);

        document
            .querySelector('#JQLquery')
            ?.addEventListener('keydown', handleSearchJiraByEnter);
    } else {
        mainBox.style.display = 'none';
        closeChmafMenus();
    }
}