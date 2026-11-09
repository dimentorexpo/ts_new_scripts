// ============================================================================
// AFStudentHelper.js — блок «Вспомогательная информация по У» в окне тикета
// ----------------------------------------------------------------------------
// Где живёт: новый фронт AutoFAQ (iframe [class^="NEW_FRONTEND"]), вставляется
//            между шапкой диалога (кнопки «Вернуть / Действия / …») и сообщениями.
// Правила и поля сверены с KC.html («Маркеры ученика», Суфлёр 1.5.6):
//   • ID ученика — из двух мест интерфейса (UserInfo_UserIdContainer и переменная id),
//     роль — переменная userType (student → Ученик, parent → Родитель);
//   • список услуг   GET backend.skyeng.ru/api/persons/{id}/education-services/
//   • карточка услуги GET backend.skyeng.ru/api/students/{id}/education-services/{sid}/general/
//     (stage, isOnCrisisSupport, operatorNote, teacher/temporaryTeacher/teachers[],
//      isTeacherReplacementInProgress, corporate, paymentAgreement.companyContract …)
//   • промокод  GET backend.skyeng.ru/api/v2/students/education-services/{sid}/promocode/active/
//   • рассрочка GET backend.skyeng.ru/api/v2/students/education-services/{sid}/credit/active/
//   • отпуск    GET student-vacation.skyeng.ru/api/v1/education-services/{sid}/student-vacations/current-or-future
//   404 у промокода/рассрочки/отпуска = «нет». Запросы идут через фон расширения.
// ============================================================================
(() => {
    'use strict';
    if (window.__AF_STUDENT_HELPER__) return;
    window.__AF_STUDENT_HELPER__ = true;

    const BLOCK_ID = 'af-sth-block';
    const STYLE_ID = 'af-sth-style';
    const FRAME_SEL = '[class^="NEW_FRONTEND"]';
    const HEADER_SEL = '[class*="ConversationScreen_Header"]';
    const TICK_MS = 700;
    const STABLE_TICKS = 2;   // сколько тиков подряд DOM должен показывать одного и того же ученика, прежде чем ему верить
    const MAX_CACHE = 40;     // сколько чатов держим в памяти
    const MAX_SERVICES = 8; // защита от лавины запросов у учеников с десятками услуг

    const BACKEND = 'https://backend.skyeng.ru/api';
    const SOURCES = {
        services: (id) => `${BACKEND}/persons/${id}/education-services/`,
        general: (id, sid) => `${BACKEND}/students/${id}/education-services/${sid}/general/`,
        promocode: (sid) => `${BACKEND}/v2/students/education-services/${sid}/promocode/active/`,
        history: (id) => `${BACKEND}/students/${id}/timetable/lessons-history/?page=0`,
        future: (id) => `${BACKEND}/students/${id}/timetable/future-lessons/`,
        credit: (sid) => `${BACKEND}/v2/students/education-services/${sid}/credit/active/`,
        vacation: (sid) => `https://student-vacation.skyeng.ru/api/v1/education-services/${sid}/student-vacations/current-or-future`
    };

    // Бренд по serviceTypeKey (KC.html): есть adult → Skyeng; иначе kids/junior/klp/… → Skysmart; иначе Skyeng
    const KIDS_MARKERS = ['kids', 'junior', 'klp', 'preschool', 'homeschool', 'skysmart', 'chess_kids', 'mini_course_kids', 'f2g_kids', 'computer_courses'];
    const KM_NOTE_RE = /(?<![а-яёa-z])км(?![а-яёa-z])|кризис|работе км/i;

    // ── Кеш по чату ─────────────────────────────────────────────────────────
    // Ключ — хеш чата из адресной строки (/tickets/assigned/{uuid}). Оператор ведёт несколько
    // чатов сразу: данные каждого хранятся отдельно, при возврате в чат запросов нет.
    const cache = new Map();
    const newEntry = () => ({ id: null, role: null, data: null, loading: false, pending: false, error: null, collapsed: false, reqToken: 0, tplBrand: null, tplOpen: null, tplFloat: false, tblOpen: null });
    let state = newEntry();      // запись текущего чата (на неё смотрят renderBody/renderBlock)
    let currentKey = null;
    let stab = { sig: '', n: 0 };
    let staleId = null;          // ученик предыдущего чата: пока DOM показывает его же, чат мог ещё не перерисоваться

    function getEntry(key) {
        let e = cache.get(key);
        if (e) { cache.delete(key); } else { e = newEntry(); }
        cache.set(key, e); // перемещаем в конец (LRU)
        while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
        return e;
    }

    const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    function chatKey() {
        const m = location.pathname.match(UUID_RE) || location.hash.match(UUID_RE);
        return m ? m[0].toLowerCase() : 'no-chat';
    }

    // ── Утилиты ──────────────────────────────────────────────────────────────
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    function getFrameDoc() {
        const f = document.querySelector(FRAME_SEL);
        try { return f?.contentDocument || f?.contentWindow?.document || null; } catch { return null; }
    }

    // Обход открытых shadow-root: селектор ищется и внутри них
    function deepQueryAll(root, selector) {
        const out = [...root.querySelectorAll(selector)];
        root.querySelectorAll('*').forEach((el) => {
            if (el.shadowRoot) out.push(...deepQueryAll(el.shadowRoot, selector));
        });
        return out;
    }

    function readVariable(doc, key) {
        const items = deepQueryAll(doc, 'dl[class*="Variables_Item"]');
        for (const dl of items) {
            const k = dl.querySelector('dt')?.textContent.replace(/:\s*$/, '').trim();
            if (k === key) return dl.querySelector('dd')?.textContent.trim() || '';
        }
        return '';
    }

    function readStudentIds(doc) {
        const ids = [];
        const box = deepQueryAll(doc, '[class*="UserInfo_UserIdContainer"]')[0];
        const a = box?.textContent.match(/\d{3,}/)?.[0];
        if (a) ids.push(a);
        const b = readVariable(doc, 'id').match(/^\d{3,}$/)?.[0];
        if (b) ids.push(b);
        return ids;
    }

    function roleLabel(userType) {
        const t = String(userType || '').toLowerCase();
        if (t === 'student') return { text: 'Ученик', kind: 'student' };
        if (t === 'parent') return { text: 'Родитель', kind: 'parent' };
        return { text: userType || 'Тип не определён', kind: 'unknown' };
    }

    function apiGet(url) {
        const test = window.AFStudentHelperTest?.fetch;
        if (test) return test(url);
        const payload = { action: 'getFetchRequest', fetchURL: url, requestOptions: { method: 'GET', credentials: 'include', headers: { accept: 'application/json, text/plain, */*' } } };
        if (typeof sendMessageAsync === 'function') return sendMessageAsync(payload);
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(payload, (r) => (chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(r)));
            } catch (e) { reject(e); }
        });
    }

    // ── Иконки (stroke = currentColor, цвет через --ic) ─────────────────────
    const P = {
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
        shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M12 8v4M12 15v.5"/>',
        coin: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.5-.8-1.5-1.2-2.8-1.2-1.7 0-2.8.8-2.8 2 0 3 5.6 1.4 5.6 4.2 0 1.2-1.1 2-2.8 2-1.3 0-2.4-.5-3-1.4M12 6v2M12 16v2"/>',
        plane: '<path d="M3 17l18-6L3 5l3 6-3 6zM6 11h8"/>',
        teacher: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
        coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7M15 11c3.3 0 6 1.3 6 3v3c0 1.7-2.7 3-6 3-1.2 0-2.3-.2-3.2-.5"/>',
        tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="8" cy="8" r="1.4"/>',
        refresh: '<path d="M20 11a8 8 0 00-14.9-3M4 4v4h4M4 13a8 8 0 0014.9 3M20 20v-4h-4"/>',
        chevron: '<path d="M6 9l6 6 6-6"/>',
        student: '<path d="M2 9l10-5 10 5-10 5L2 9zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6"/>',
        users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0114 0M16 4.5a3.5 3.5 0 010 7M18 20a7 7 0 00-3-5.7"/>'
    };
    const ico = (n, cls = '') => `<svg class="sth-i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

    // ── Стили (вставляются в документ iframe) ───────────────────────────────
    const CSS = `
    #${BLOCK_ID}{--bg:#2a303c;--line:rgba(255,255,255,.08);--txt:#e5e9f0;--mut:#9aa7bd;margin:0;padding:10px 18px 12px;background:linear-gradient(180deg,#2e3440,#2a303c);border-bottom:1px solid var(--line);font-family:Roboto,system-ui,sans-serif;color:var(--txt);font-size:13px;line-height:1.4;box-sizing:border-box}
    #${BLOCK_ID} *{box-sizing:border-box}
    #${BLOCK_ID} .sth-head{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
    #${BLOCK_ID} .sth-title{font-weight:700;font-size:13px;letter-spacing:.2px;display:flex;align-items:center;gap:7px}
    #${BLOCK_ID} .sth-title .sth-i{--ic:#7dd3fc}
    #${BLOCK_ID} .sth-id{font-family:ui-monospace,Consolas,monospace;font-size:12px;color:var(--mut);padding:1px 7px;border-radius:999px;background:rgba(255,255,255,.06)}
    #${BLOCK_ID} .sth-role{font-size:11px;font-weight:700;padding:2px 9px;border-radius:999px;display:inline-flex;align-items:center;gap:5px;border:1px solid}
    #${BLOCK_ID} .sth-role.student{--ic:#86efac;color:#86efac;background:rgba(134,239,172,.1);border-color:rgba(134,239,172,.35)}
    #${BLOCK_ID} .sth-role.parent{--ic:#fbbf24;color:#fbbf24;background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.35)}
    #${BLOCK_ID} .sth-crm{font-size:12px;font-weight:600;color:#7dd3fc;text-decoration:none;padding:1px 9px;border-radius:999px;border:1px solid rgba(125,211,252,.4);background:rgba(125,211,252,.1)}
    #${BLOCK_ID} .sth-crm:hover,#${BLOCK_ID} .sth-lnk:hover b{text-decoration:underline}
    #${BLOCK_ID} .sth-lnk{color:inherit;text-decoration:none}
    #${BLOCK_ID} .sth-role.corp{--ic:#d8b4fe;color:#d8b4fe;background:rgba(192,132,252,.14);border-color:rgba(192,132,252,.5)}
    #${BLOCK_ID} .sth-role.unknown{--ic:#94a3b8;color:#94a3b8;background:rgba(148,163,184,.1);border-color:rgba(148,163,184,.3)}
    #${BLOCK_ID} .sth-spacer{flex:1}
    #${BLOCK_ID} .sth-btn{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--mut);cursor:pointer;padding:0}
    #${BLOCK_ID} .sth-btn:hover{background:rgba(255,255,255,.1);color:var(--txt)}
    #${BLOCK_ID} .sth-btn .sth-i{--ic:currentColor;width:14px;height:14px}
    #${BLOCK_ID} .sth-chev{transition:transform .2s}
    #${BLOCK_ID}.collapsed .sth-chev{transform:rotate(-90deg)}
    #${BLOCK_ID}.collapsed .sth-body{display:none}
    #${BLOCK_ID} .sth-body{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;margin-top:10px}
    #${BLOCK_ID} .sth-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-left:3px solid var(--ic,#64748b);min-width:0}
    #${BLOCK_ID} .sth-card.wide{grid-column:1/-1}
    #${BLOCK_ID} .sth-card.ok{--ic:#4ade80}
    #${BLOCK_ID} .sth-card.warn{--ic:#fbbf24}
    #${BLOCK_ID} .sth-card.bad{--ic:#f87171}
    #${BLOCK_ID} .sth-card.mute{--ic:#64748b}
    #${BLOCK_ID} .sth-lbl{display:flex;align-items:center;gap:6px;color:var(--mut);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
    #${BLOCK_ID} .sth-lbl .sth-i{--ic:var(--ic)}
    #${BLOCK_ID} .sth-val{font-weight:700;font-size:13px}
    #${BLOCK_ID} .sth-card.ok .sth-val{color:#86efac}
    #${BLOCK_ID} .sth-card.warn .sth-val{color:#fcd34d}
    #${BLOCK_ID} .sth-card.bad .sth-val{color:#fca5a5}
    #${BLOCK_ID} .sth-card.mute .sth-val{color:#94a3b8}
    #${BLOCK_ID} .sth-sub{color:var(--mut);font-size:11.5px;margin-top:2px;font-weight:400}
    #${BLOCK_ID} .sth-more{margin-top:4px}
    #${BLOCK_ID} .sth-more>summary{cursor:pointer;color:#7dd3fc;font-size:11.5px;list-style:none;user-select:none}
    #${BLOCK_ID} .sth-more>summary::-webkit-details-marker{display:none}
    #${BLOCK_ID} .sth-more>summary::before{content:'▸ ';font-size:10px}
    #${BLOCK_ID} .sth-more[open]>summary::before{content:'▾ '}
    #${BLOCK_ID} .sth-list{margin:4px 0 0;padding:0;list-style:none;display:grid;gap:2px}
    #${BLOCK_ID} .sth-list li{display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:500}
    #${BLOCK_ID} .sth-list li span:first-child{color:var(--mut);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
    #${BLOCK_ID} .sth-list b{font-variant-numeric:tabular-nums}
    #${BLOCK_ID} .sth-list b.neg{color:#fca5a5}
    #${BLOCK_ID} .sth-list b.zero{color:#94a3b8}
    #${BLOCK_ID} .sth-list b.pos{color:#86efac}
    #${BLOCK_ID} .sth-list b.warn{color:#fcd34d}
    #${BLOCK_ID} .sth-tablewrap{overflow-x:auto;margin-top:6px}
    #${BLOCK_ID} .sth-table{width:100%;border-collapse:collapse;font-size:12px}
    #${BLOCK_ID} .sth-table th{text-align:left;font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--mut);padding:2px 8px 6px 0;white-space:nowrap}
    #${BLOCK_ID} .sth-table td{padding:6px 8px 6px 0;border-top:1px solid var(--line);vertical-align:top;white-space:nowrap}
    #${BLOCK_ID} .sth-table td.svc{white-space:normal;min-width:190px;max-width:340px}
    #${BLOCK_ID} .svc-name{white-space:normal;word-break:break-all}
    #${BLOCK_ID} .sth-tplbox.tpl-hot{border-color:rgba(251,191,36,.55);border-left-color:#fbbf24;background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(251,191,36,.03));box-shadow:0 0 0 1px rgba(251,191,36,.15),0 4px 16px rgba(251,191,36,.08)}
    #${BLOCK_ID} .sth-tplbox.tpl-km{border-color:rgba(248,113,113,.7);border-left-color:#f87171;background:linear-gradient(135deg,rgba(248,113,113,.2),rgba(248,113,113,.05));box-shadow:0 0 0 1px rgba(248,113,113,.25),0 4px 18px rgba(248,113,113,.15)}
    #${BLOCK_ID} .sth-tplbox.tpl-hot>details>summary{color:#fde68a;font-size:12.5px}
    #${BLOCK_ID} .sth-tplbox.tpl-km>details>summary{color:#fecaca;font-size:13px}
    #${BLOCK_ID} .sth-tplbox.tpl-km .sth-tpl-h b{color:#fecaca;font-size:14px}
    #${BLOCK_ID} .sth-tplbox .sth-tpl{background:rgba(0,0,0,.18)}
    #${BLOCK_ID} .sth-body{max-height:62vh;overflow:auto;padding-right:4px}
    #${BLOCK_ID} .sth-float-btn{margin-left:auto;border:1px solid var(--line);background:rgba(125,211,252,.12);color:#bae6fd;border-radius:8px;padding:3px 10px;font-size:12px;cursor:pointer}
    #${BLOCK_ID} .sth-tplbtn{width:auto;padding:0 10px;gap:6px;display:inline-flex;align-items:center;font-size:12px;color:#fde68a;border-color:rgba(251,191,36,.45);background:rgba(251,191,36,.1)}
    #${BLOCK_ID} .sth-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(5,8,15,.6);display:flex;align-items:flex-start;justify-content:center;padding:4vh 16px;backdrop-filter:blur(2px)}
    #${BLOCK_ID} .sth-ov-panel{width:min(860px,100%);max-height:92vh;display:flex;flex-direction:column;background:#262c38;border:1px solid rgba(255,255,255,.14);border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.6);padding:12px 14px}
    #${BLOCK_ID} .sth-ov-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}
    #${BLOCK_ID} .sth-ov-h .sth-i{--ic:#fbbf24}
    #${BLOCK_ID} .sth-ov-close{width:28px;height:28px;border-radius:8px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:var(--txt);cursor:pointer}
    #${BLOCK_ID} .sth-ov-list{overflow:auto;flex:1;min-height:0;padding-right:4px}
    #${BLOCK_ID}.collapsed .sth-ov{display:flex}
    #${BLOCK_ID} .sth-tpl-bar{display:flex;align-items:center;gap:10px;margin:8px 0}
    #${BLOCK_ID} .sth-tbrand{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}
    #${BLOCK_ID} .sth-tbrand button{background:rgba(255,255,255,.04);color:var(--mut);border:0;padding:3px 12px;font-size:12px;cursor:pointer}
    #${BLOCK_ID} .sth-tbrand button.on{background:#3b82f6;color:#fff}
    #${BLOCK_ID} .sth-tpl{margin:6px 0;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-left:3px solid #64748b}
    #${BLOCK_ID} .sth-tpl.bad{border-left-color:#f87171}
    #${BLOCK_ID} .sth-tpl.act{border-left-color:#fbbf24}
    #${BLOCK_ID} .sth-tpl.fact{border-left-color:#60a5fa}
    #${BLOCK_ID} .sth-tpl-h{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    #${BLOCK_ID} .sth-tpl-h a{color:#7dd3fc;font-size:12px}
    #${BLOCK_ID} .sth-table td.ev{white-space:normal;min-width:180px}
    #${BLOCK_ID} .sth-evbtn{display:inline-block;margin:0 5px 4px 0;padding:3px 10px;border-radius:8px;border:1px solid rgba(251,191,36,.55);background:rgba(251,191,36,.16);color:#fde68a;font-size:12px;font-weight:600;cursor:pointer}
    #${BLOCK_ID} .sth-evbtn:hover{background:rgba(251,191,36,.3)}
    #${BLOCK_ID} .sth-evbtn.done{background:rgba(134,239,172,.25);border-color:rgba(134,239,172,.6);color:#bbf7d0}
    #${BLOCK_ID} .sth-tpl-svcs{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 2px}
    #${BLOCK_ID} .sth-svc{display:inline-flex;align-items:baseline;gap:6px;padding:3px 9px;border-radius:7px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-left:3px solid #64748b;font-size:12.5px;line-height:1.3;max-width:100%}
    #${BLOCK_ID} .sth-svc.ad{border-left-color:#60a5fa}
    #${BLOCK_ID} .sth-svc.kd{border-left-color:#f472b6}
    #${BLOCK_ID} .sth-svc i{font-style:normal;font-family:ui-monospace,Consolas,monospace;font-size:11.5px;color:#94a3b8}
    #${BLOCK_ID} .sth-svc b{font-weight:600;color:#f1f5f9;word-break:break-all}
    #${BLOCK_ID} .sth-tpl-list{max-height:min(60vh,520px);overflow:auto;padding-right:4px}
    #${BLOCK_ID} .sth-tpl-act{margin-left:auto;display:inline-flex;align-items:center;gap:8px}
    #${BLOCK_ID} .sth-tpl-act .sth-copy{margin-top:0}
    #${BLOCK_ID} .sth-tpl-toggle{border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--mut);border-radius:8px;padding:3px 10px;font-size:12px;cursor:pointer}
    #${BLOCK_ID} .sth-tpl:not(.open) .sth-tpl-body{display:none}
    #${BLOCK_ID} .sth-tpl.open .sth-tpl-toggle{background:rgba(255,255,255,.14);color:var(--txt)}
    #${BLOCK_ID} .sth-tpl-op{color:var(--mut);font-size:12px;margin:4px 0}
    #${BLOCK_ID} .sth-tpl-say{white-space:pre-wrap;background:rgba(0,0,0,.18);border-radius:8px;padding:7px 9px;font-size:12.5px;}
    #${BLOCK_ID} .sth-copy{margin-top:6px;border:1px solid var(--line);background:rgba(125,211,252,.12);color:#bae6fd;border-radius:8px;padding:3px 12px;font-size:12px;cursor:pointer}
    #${BLOCK_ID} .sth-copy.done{background:rgba(134,239,172,.2);color:#bbf7d0}
    #${BLOCK_ID} .sth-fold>summary{cursor:pointer;list-style:none}
    #${BLOCK_ID} .sth-fold>summary::-webkit-details-marker{display:none}
    #${BLOCK_ID} .sth-fold>summary::after{content:'▾';float:right;color:var(--mut)}
    #${BLOCK_ID} .sth-fold[open]>summary::after{content:'▴'}
    #${BLOCK_ID} .svc-name b{color:#cbd5e1}
    #${BLOCK_ID} .svc-tags{margin-top:2px}
    #${BLOCK_ID} .svc-tags .sth-chip{margin:0 4px 0 0}
    #${BLOCK_ID} td.bal{font-weight:700;font-variant-numeric:tabular-nums}
    #${BLOCK_ID} td.bal.neg{color:#fca5a5} #${BLOCK_ID} td.bal.warn{color:#fcd34d} #${BLOCK_ID} td.bal.pos{color:#86efac} #${BLOCK_ID} td.bal.zero{color:#94a3b8}
    #${BLOCK_ID} .sth-pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid transparent}
    #${BLOCK_ID} .sth-pill.ok{color:#86efac;background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.28)}
    #${BLOCK_ID} .sth-pill.warn{color:#fcd34d;background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.3)}
    #${BLOCK_ID} .sth-pill.bad{color:#fca5a5;background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.35)}
    #${BLOCK_ID} .sth-pill.mute{color:#94a3b8;background:rgba(148,163,184,.08);border-color:rgba(148,163,184,.2)}
    #${BLOCK_ID} .sth-chip{display:inline-block;margin-left:5px;padding:0 6px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.3px;background:rgba(148,163,184,.14);color:#aab6c9;vertical-align:1px}
    #${BLOCK_ID} .sth-chip.brand{background:rgba(125,211,252,.14);color:#7dd3fc}
    #${BLOCK_ID} .sth-chip.corp{background:rgba(192,132,252,.16);color:#d8b4fe}
    #${BLOCK_ID} .sth-chip.bf{background:rgba(250,204,21,.16);color:#fde047}
    #${BLOCK_ID} .sth-i{width:15px;height:15px;flex:none;fill:none;stroke:var(--ic,currentColor);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    #${BLOCK_ID} .sth-load{display:flex;align-items:center;gap:8px;color:var(--mut);padding:8px 0 2px}
    #${BLOCK_ID} .sth-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(125,211,252,.25);border-top-color:#7dd3fc;animation:sthSpin .8s linear infinite}
    #${BLOCK_ID} .sth-err{color:#fca5a5;padding:6px 0 0;grid-column:1/-1}
    @keyframes sthSpin{to{transform:rotate(360deg)}}
    `;

    function ensureStyle(doc) {
        if (doc.getElementById(STYLE_ID)) return;
        const st = doc.createElement('style');
        st.id = STYLE_ID;
        st.textContent = CSS;
        doc.head.appendChild(st);
    }

    // ── Загрузка и разбор данных ────────────────────────────────────────────
    const toNum = (v) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? null : Number(v));
    const personName = (p) => {
        const g = p?.general || p || {};
        return [g.name, g.surname].filter(Boolean).join(' ').trim();
    };
    const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && !v.length);

    // Услуги без преподавателя по определению (life_adult, self_study и т.п.)
    const NO_TEACHER_RE = /life_adult|self_study|(^|_)self($|_)|(^|_)talks(_|$)/i;

    function typeTitle(key) {
        try {
            if (typeof formatServiceType === 'function') {
                const r = formatServiceType(key);
                return r?.formattedText || key;
            }
        } catch { /* ignore */ }
        return key;
    }

    // GET → JSON. 404 даёт null («нет данных / нет сущности»), прочие ошибки пробрасываются
    async function getJson(url) {
        try {
            const res = await apiGet(url);
            const text = res?.fetchansver ?? '';
            return text ? JSON.parse(text) : null;
        } catch (e) {
            if (/HTTP 404/.test(String(e?.message))) return null;
            throw e;
        }
    }
    const settled = (r, fallback = null) => (r.status === 'fulfilled' ? { ok: true, v: r.value } : { ok: false, v: fallback, err: r.reason });

    function brandOf(keys) {
        const joined = keys.map((k) => String(k || '').toLowerCase());
        if (joined.some((k) => k.includes('adult'))) return 'Skyeng';
        if (joined.some((k) => KIDS_MARKERS.some((m) => k.includes(m)))) return 'Skysmart';
        return 'Skyeng';
    }
    function categoryOf(key) {
        const k = String(key || '').toLowerCase();
        for (const c of ['adult', 'junior', 'klp', 'kids']) if (k.includes(c)) return c;
        return '';
    }

    function vacationInfo(raw, stage) {
        const d = raw?.data ?? raw;
        const hasObj = d && typeof d === 'object';
        const now = Date.now();
        const st = hasObj ? String(d.state || '').toLowerCase() : '';
        const s = hasObj ? Date.parse(d.startsAt) : NaN;
        const e = hasObj ? Date.parse(d.endsAt) : NaN;
        const inRange = !isNaN(s) && !isNaN(e) && now >= s && now <= e;
        const active = st === 'started' || st === 'active' || (st === 'scheduled' && inRange) || stage === 'vacation';
        const future = !active && hasObj && st === 'scheduled' && !isNaN(s) && s > now;
        return {
            active, future,
            title: hasObj && d.type === 'school_break' ? 'Каникулы' : 'Отпуск',
            from: hasObj ? d.startsAt : null,
            to: hasObj ? d.endsAt : null
        };
    }

    async function loadService(studentId, base) {
        const sid = base.id;
        const [gen, promo, credit, vac] = (await Promise.allSettled([
            getJson(SOURCES.general(studentId, sid)),
            getJson(SOURCES.promocode(sid)),
            getJson(SOURCES.credit(sid)),
            getJson(SOURCES.vacation(sid))
        ])).map((r) => settled(r));

        const g = gen.ok ? (gen.v?.data ?? gen.v ?? {}) : {};
        const src = { ...base, ...g }; // general полнее списка (operatorNote, isTeacherReplacementInProgress …)
        const note = String(src.operatorNote || '');
        const km = src.isOnCrisisSupport === true || KM_NOTE_RE.test(note);
        const kmReason = src.isOnCrisisSupport === true ? 'флаг «Кризисное сопровождение»' : (KM_NOTE_RE.test(note) ? 'отметка в заметке оператора' : '');
        // Корпоративная услуга: general.corporate не пустой ИЛИ paymentAgreement.companyContract не пустой
        // и/или договор компании в paymentAgreement (в «обычной» услуге оба поля пустые)
        const corp = !isEmpty(src.corporate) || !isEmpty(src.paymentAgreement?.companyContract) || !isEmpty(base.paymentAgreement?.companyContract);
        const hasTeacher = !isEmpty(src.teacher) || !isEmpty(src.temporaryTeacher)
            || (Array.isArray(src.teachers) && src.teachers.some((t) => t && (t.id || t.teacherId)));

        const pd = promo.ok ? (promo.v?.data ?? null) : null;
        const promoName = pd?.promocode ? String(pd.promocode) : '';
        const promoExpired = pd?.expiredAt ? Date.parse(pd.expiredAt) < Date.now() : false;
        const creditStages = credit.ok ? (credit.v?.data?.stages ?? credit.v?.stages ?? null) : null;

        return {
            id: sid,
            key: src.serviceTypeKey || '',
            title: src.serviceTypeKey || '—',
            noTeacherNeeded: NO_TEACHER_RE.test(src.serviceTypeKey || ''),
            stage: src.stage,
            // Первая оплата: true/false, либо undefined, если поля нет
            firstPaid: typeof src.hasFirstPayment === 'boolean' ? src.hasFirstPayment : (typeof src.isFirstPaymentReceived === 'boolean' ? src.isFirstPaymentReceived : undefined),
            balance: toNum(src.balance),
            km, kmReason, corp, hasTeacher,
            teacherName: personName(src.teacher),
            tempName: personName(src.temporaryTeacher),
            replacement: src.isTeacherReplacementInProgress === true,
            vacation: vac.ok ? vacationInfo(vac.v, src.stage) : { unknown: true },
            promo: promo.ok ? (pd ? { name: promoName, expiredAt: pd.expiredAt, expired: promoExpired, bf: /черн\S*\s+пятниц/i.test(promoName.toLowerCase().replace(/ё/g, 'е')) } : null) : { unknown: true },
            credit: credit.ok ? (credit.v ? { stages: Array.isArray(creditStages) ? creditStages : [] } : null) : { unknown: true }
        };
    }

    const MISS = ['missed_by_student', 'failed_by_student', 'did_not_get_through_student'];
    const lessonSvcId = (l) => String(l?.educationService?.id ?? l?.educationServiceId ?? '');
    const ts = (l) => Date.parse(l?.startedAt);
    function applyLessons(services, hist, fut) {
        const now = Date.now();
        const hasIds = (a) => a && a.some((l) => lessonSvcId(l));
        for (const x of services) {
            const mine = (a) => !a ? null : (hasIds(a) ? a.filter((l) => lessonSvcId(l) === String(x.id)) : a);
            const h = mine(hist), f = mine(fut);
            x.lessons = { known: !!(h && f) };
            if (f) {
                const up = f.filter((l) => ts(l) > now).sort((a, b) => ts(a) - ts(b));
                x.lessons.next = up[0]?.startedAt || null;
                x.lessons.hasRegular14 = up.some((l) => l.lessonType === 'regular' && ts(l) <= now + 14 * 864e5);
                x.lessons.upcoming = up.map((l) => l.startedAt);
            }
            if (h) {
                const past = h.filter((l) => l.lessonType === 'regular' && ts(l) <= now).sort((a, b) => ts(b) - ts(a));
                x.lessons.missed2 = past.length >= 2 && MISS.includes(past[0].status) && MISS.includes(past[1].status);
            }
        }
    }

    async function loadAll(id) {
        const listRes = await getJson(SOURCES.services(id));
        const everything = Array.isArray(listRes?.data) ? listRes.data : [];
        // В списке персоны есть и услуги, которые она только оплачивает (ученик другой человек) — их не берём
        const all = everything.filter((s) => {
            const sid = s.student?.general?.id;
            return sid === undefined || sid === null || String(sid) === String(id);
        });
        const foreign = everything.length - all.length;
        // «Закрытые»: lost или некорректные — по ним ничего не считаем (KC.html)
        const isClosed = (s) => s.stage === 'lost' || !isEmpty(s.incorrectnessReason);
        const open = all.filter((s) => !isClosed(s));
        const take = open.slice(0, MAX_SERVICES);
        const services = await Promise.all(take.map((b) => loadService(id, b)));
        // Уроки по ученику: история (прошедшие) и расписание (будущие). Сбой запроса = «неизвестно» (null)
        const [hr, fr] = await Promise.allSettled([getJson(SOURCES.history(id)), getJson(SOURCES.future(id))]);
        const arr = (r) => r.status === 'fulfilled' ? (Array.isArray(r.value?.data) ? r.value.data : []) : null;
        applyLessons(services, arr(hr), arr(fr));
        return {
            totalCount: all.length,
            foreignCount: foreign,
            closedCount: all.length - open.length,
            skipped: open.length - take.length,
            services,
            brand: brandOf(services.map((x) => x.key))
        };
    }

    // ── Отрисовка ───────────────────────────────────────────────────────────
    const fmtDate = (iso) => {
        const t = Date.parse(iso);
        return isNaN(t) ? '' : new Date(t).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };
    const chip = (text, cls = '') => `<span class="sth-chip ${cls}">${esc(text)}</span>`;
    const svcHead = (r) => `#${esc(r.id)} ${esc(r.title)}`;
    const details = (rows) => rows.length ? `<details class="sth-more"><summary>по услугам</summary><ul class="sth-list">${rows.join('')}</ul></details>` : '';
    const li = (r, right, cls = '', extraChips = '') => `<li title="${esc(r.title)}"><span>${svcHead(r)}${extraChips}</span><b class="${cls}">${right}</b></li>`;
    const card = (cls, icon, label, val, sub = '', extra = '') => `<div class="sth-card ${cls}"><div class="sth-lbl">${ico(icon)}${label}</div><div class="sth-val">${val}</div>${sub ? `<div class="sth-sub">${sub}</div>` : ''}${extra}</div>`;

    // ── Шаблоны ученику (из KC.html) ────────────────────────────────────────
    const DOCS_URL = 'https://confluence.skyeng.link/pages/viewpage.action?pageId=442713904';
    const BF = {
        skyeng: 'У вас на балансе осталось мало уроков, давайте расскажу про наши спец предложения, как можно выгодней приобрести пакеты занятий:\n\nХватайте самую большую выгоду сезона, такая бывает только раз в году! Мы запустили акцию к Чёрной пятнице, чтобы вам было проще учиться и достигать своих целей: выйти на новый уровень в языке или начать изучать второй.\n\nПополните баланс уроков с промокодом ХВАТАЙ — и заберите до 25 уроков в подарок или скидку до 61%. Чем больше пакет занятий или чем дольше подписка на тариф, тем больше выгода.\n\nПромокод действует и на то направление, на котором вы уже занимаетесь, и на новые. Например, если вы изучаете английский и хотите начать французский или любой другой из 10 остальных языков, оплачивайте уроки с промокодом ХВАТАЙ и забирайте выгоду.\n\nПодробнее об условиях акции: https://helpcenter.skyeng.ru/article/2557',
        skysmart: 'На балансе у вашего ребёнка осталось мало уроков, давайте расскажу про наши спец предложения, как можно выгодней приобрести пакеты занятий:\n\nЛовите самую большую выгоду сезона, такая бывает только раз в году! Подтянуть оценки, выйти на пятёрки во второй четверти, уверенно подготовиться к экзаменам, открыть для себя программирование или даже перейти на семейное обучение — всё это возможно. Чтобы вашему ребёнку было проще, мы запустили акцию к Чёрной пятнице.\n\nПополните баланс уроков с промокодом ХВАТАЙ — и получите до 25 уроков в подарок, а на курсы программирования — скидку до 61%. Чем больше пакет занятий, тем больше выгода.\n\nПромокод действует и на то направление, на котором ребёнок уже занимается, и на новые: от репетиторов по школьным предметам до ИТ-курсов и подготовки к ОГЭ или ЕГЭ.\n\nПодробнее об условиях акции: https://helpcenter.skyeng.ru/article/2556'
    };
    const stripIntro = (t) => t.replace(/^[\s\S]*?\n\n/, '');

    // Какие шаблоны применимы к ученику. Возвращает массив {title, tone, op, svc, text:{skyeng,skysmart}}
    function buildTemplates(d) {
        const sv = d.services || [];
        const out = [];
        const km = sv.find((x) => x.km);
        if (km) { // на КМ — только эта плашка
            out.push({ title: 'На КМ', tone: 'bad', svc: '', op: 'Ученик на КМ. Ничего не решай сам: собери, что сказал ученик, и передай КМ. Акции и подбор не предлагай.',
                text: { skyeng: 'Ваш вопрос уже в работе старшего менеджера. Я передам ему ваше сообщение, и он вернётся с ответом.', skysmart: 'Вопрос по занятиям ребёнка уже в работе старшего менеджера. Я передам ему ваше сообщение, и он вернётся с ответом.' } });
            return out;
        }
        const rank = (t) => /Чёрная пятница/.test(t) ? 0 : /отпуск|Каникулы/i.test(t) ? 1 : /Мало уроков|Баланс кончился/.test(t) ? 2 : /преподавател|подбор/i.test(t) ? 3 : 4;
        for (const x of sv) {
            if (x.noTeacherNeeded) continue; // life_adult / self_study / talks шаблонами не обслуживаем
            const from = out.length;
            const svc = `#${x.id} ${x.title}`;
            const b = x.balance;
            const known = (v) => v && !v.unknown;
            const bfActive = known(x.promo) && x.promo.bf && !x.promo.expired;
            const vacActive = known(x.vacation) && x.vacation.active;
            const creditOn = known(x.credit) && x.credit;
            const L = x.lessons || {};
            const nl = L.next ? `, которое состоится ${fmtLesson(L.next)}` : '';
            // Событие 5: отпуск
            if (vacActive) {
                const to = x.vacation.to ? fmtDate(x.vacation.to) : '';
                const sk = x.vacation.title === 'Каникулы';
                const endT = Date.parse(x.vacation.to);
                const after = (L.upcoming || []).find((iso) => isNaN(endT) || Date.parse(iso) > endT);
                if (L.known && !after) {
                    out.push({ title: 'Отпуск без урока', tone: 'act', svc, op: `${sk ? 'Каникулы' : 'Отпуск'}${to ? ' до ' + to : ''}, а урока после него нет. Предложи сразу поставить расписание.`,
                        text: {
                            skyeng: `Ваш отпуск заканчивается${to ? ' ' + to : ''}, а занятий после него пока нет. Давайте сразу поставим расписание, чтобы учёба продолжилась без паузы?`,
                            skysmart: `Перерыв в занятиях у ребёнка заканчивается${to ? ' ' + to : ''}, а уроков после него пока нет. Давайте сразу поставим расписание, чтобы учёба продолжилась без паузы?`
                        } });
                } else {
                    const nx = after ? ` Следующее занятие — ${fmtLesson(after)}.` : '';
                    out.push({ title: sk ? 'Каникулы' : 'В отпуске', tone: 'fact', svc, op: `Ученик в отпуске. Ничего не переноси, пока не попросит.${after ? '' : ' Дату следующего урока добавь вручную.'}`,
                        text: {
                            skyeng: `Вы в отпуске${to ? ' до ' + to : ''}.${nx} Если планы поменялись, напишите — поможем вернуться раньше.`,
                            skysmart: `У ребёнка ${sk ? 'каникулы' : 'перерыв в занятиях'}${to ? ' до ' + to : ''}.${nx} Если планы поменялись, напишите — поможем вернуться раньше.`
                        } });
                }
            }
            // Событие 2: Чёрная пятница (не КМ, не корп.)
            if (bfActive && !x.corp && b !== null) {
                if (b >= 0 && b <= 4) out.push({ title: 'Чёрная пятница · баланс 0–4', tone: 'act', svc, docs: true, op: `На балансе мало уроков (${b}). Расскажите про ЧП, промокод ХВАТАЙ. Ссылка в скрипте одна: Skyeng или Skysmart.`, text: { ...BF } });
                else if (b >= 5) out.push({ title: 'Чёрная пятница · баланс 5+', tone: 'act', svc, docs: true, op: 'Акция уже активирована. Расскажите про условия, промокод ХВАТАЙ. Без фразы «мало уроков».', text: { skyeng: stripIntro(BF.skyeng), skysmart: stripIntro(BF.skysmart) } });
            }
            // Событие 3: низкий баланс / баланс кончился
            if (b !== null) {
                if (b >= 1 && b <= 4 && !x.corp && !bfActive) {
                    const pr = known(x.promo) && x.promo ? x.promo : null;
                    const code = pr?.name ? pr.name : 'ПРОМОКОД';
                    const dt = pr?.expiredAt ? fmtDate(pr.expiredAt) : 'ДАТА';
                    const tail = `дарю вам промокод «${code}». Он даёт до N уроков за оплату от N занятий, промо нужно активировать до оплаты, в окне промокодов. Промо активен до ${dt} включительно, не упустите выгоду.`;
                    out.push({ title: 'Мало уроков', tone: 'act', svc, op: `На балансе ${b} ур. Напомни пополнить заранее. Подставь размер бонуса (N)${pr?.name ? '' : ', промокод и срок'}.`,
                        text: { skyeng: `На балансе осталось ${b} ${plural(b)}. Чтобы занятия шли без перерыва, баланс можно пополнить заранее, ${tail}`, skysmart: `На балансе у ребёнка осталось ${b} ${plural(b)}. Чтобы занятия шли без перерыва, баланс можно пополнить заранее, ${tail}` } });
                } else if (b === 0 && !creditOn && x.firstPaid !== false) { // оплаты ещё не было → «Оплаты нет», а не «Баланс кончился»
                    out.push({ title: 'Баланс кончился', tone: 'act', svc, op: 'На балансе 0 уроков. Не ставь занятие. Предложи оплату. Промокод корпоративным не предлагай.',
                        text: { skyeng: `На балансе сейчас 0 уроков. Успейте пополнить до следующего занятия${nl}. Если возникнут вопросы, пишите.`, skysmart: `На балансе у ребёнка сейчас 0 уроков. Успейте пополнить до следующего занятия${nl}. Если возникнут вопросы, пишите.` } });
                }
            }
            // Событие 4: пропустил 2 регулярных урока подряд (есть преподаватель, не отпуск, в графике на 14 дней есть regular)
            if (L.missed2 && x.hasTeacher && !vacActive && L.hasRegular14) {
                out.push({ title: 'Давно не был', tone: 'act', svc, op: 'Ученик пропустил 2 регулярных урока подряд. Узнай причину и предложи вернуться. Преподавателя не снимай.',
                    text: {
                        skyeng: 'Вижу, что вы пропустили два последних занятия. Всё ли в порядке? Давайте подберём удобное для вас время дополнительного урока, чтобы нагнать темп, или могу предложить пересмотреть график занятий.',
                        skysmart: 'Вижу, что ребёнок пропустил два последних занятия. Всё ли в порядке? Давайте подберём удобное время дополнительного урока, чтобы нагнать темп, или могу предложить пересмотреть график занятий.'
                    } });
            }
            // Событие 6: баланс есть, преподавателя нет
            if (b !== null && b > 0 && !x.hasTeacher && !x.noTeacherNeeded && !vacActive) {
                if (x.replacement) out.push({ title: 'Уже в подборе', tone: 'fact', svc, op: 'Подбор уже идёт. Второй не открывай. Скажи ученику, на каком он шаге.',
                    text: { skyeng: 'Мы уже подбираем вам преподавателя. Напишу, как только появится подходящий вариант.', skysmart: 'Мы уже подбираем преподавателя для ребёнка. Напишу, как только появится подходящий вариант.' } });
                else out.push({ title: 'Нет преподавателя', tone: 'act', svc, op: `Преподавателя нет, на балансе ${b} ур. Расскажи про самостоятельный подбор и вставь ссылку вместо {ссылка…}.`,
                    text: {
                        skyeng: `У вас на балансе ${b} ${plural(b)}, а преподаватель пока не назначен.\nХочу рассказать про наш сервис самостоятельного подбора: вы можете самостоятельно выбрать преподавателя с удобным для вас расписанием. Для этого перейдите по ссылке ниже, укажите подходящие дни и время занятий и выберите преподавателя.\n\n{ссылка на самостоятельный подбор}\n\nЕсли вы хотите, чтобы мы помогли вам с подбором преподавателя, просто ответьте на пару вопросов.`,
                        skysmart: `У ребёнка на балансе ${b} ${plural(b)}, а преподаватель пока не назначен.\nХочу рассказать про наш сервис самостоятельного подбора: вы можете самостоятельно выбрать преподавателя с удобным расписанием. Для этого перейдите по ссылке ниже, укажите подходящие дни и время занятий и выберите преподавателя.\n\n{ссылка на самостоятельный подбор}\n\nЕсли вы хотите, чтобы мы помогли с подбором преподавателя, просто ответьте на пару вопросов.`
                    } });
            }
            // Порядок на панели: ЧП, отпуск, баланс, преподаватель, пропуски
            const mine = out.splice(from).sort((a, c) => rank(a.title) - rank(c.title));
            out.push(...mine);
        }
        return out;
    }
    const fmtLesson = (iso) => {
        const t = Date.parse(iso);
        return isNaN(t) ? '' : new Date(t).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', '').replace('.', '');
    };
    function plural(n) { const m = n % 100, k = n % 10; return (m > 10 && m < 15) ? 'уроков' : k === 1 ? 'урок' : (k >= 2 && k <= 4) ? 'урока' : 'уроков'; }

    function tplGroups(d) {
        const br = d.brand === 'Skysmart' ? 'skysmart' : 'skyeng';
        // Одинаковые шаблоны по разным услугам склеиваем в одну строку с перечнем услуг
        const groups = new Map();
        for (const t of buildTemplates(d)) {
            const key = t.title + '\u0001' + t.text[br];
            const g = groups.get(key);
            if (g) { if (t.svc) g.svcs.push(t.svc); }
            else groups.set(key, { ...t, svcs: t.svc ? [t.svc] : [] });
        }
        return { br, list: [...groups.values()] };
    }
    function tplCards(list, br, openAll) {
        const chipsOf = (g) => g.svcs.map((x) => {
            const m = /^#(\S+)\s+(.*)$/.exec(x) || [];
            const key = m[2] || x;
            const kind = /adult/i.test(key) ? 'ad' : /kids|junior|klp|preschool|homeschool|skysmart/i.test(key) ? 'kd' : '';
            return `<span class="sth-svc ${kind}" title="${esc(x)}">${m[1] ? `<i>#${esc(m[1])}</i>` : ''}<b>${esc(key)}</b></span>`;
        }).join('');
        if (!list.length) return '<div class="sth-sub">Сейчас нет применимых шаблонов (по услугам нет событий).</div>';
        return list.map((t, i) => `<div class="sth-tpl ${t.tone}${openAll ? ' open' : ''}">
                <div class="sth-tpl-h"><b>${esc(t.title)}</b>
                    <span class="sth-tpl-act">${t.docs ? `<a href="${DOCS_URL}" target="_blank" rel="noopener">Подробнее</a>` : ''}
                    <button type="button" class="sth-tpl-toggle">Текст</button>
                    <button type="button" class="sth-copy" data-i="${i}">Копировать ученику</button></span></div>
                ${t.svcs.length ? `<div class="sth-tpl-svcs">${chipsOf(t)}</div>` : ''}
                <div class="sth-tpl-body"><div class="sth-tpl-op">${esc(g_op(t))}</div>
                <div class="sth-tpl-say">${esc(t.text[br])}</div></div></div>`).join('');
    }
    function renderTemplates(d) {
        const { br, list } = tplGroups(d);
        state.tpl = list; // для кнопок «Копировать»
        const km = list.length && list[0].title === 'На КМ';
        const hot = km ? 'tpl-km' : list.length ? 'tpl-hot' : 'mute';
        // По умолчанию раскрыт; оператор может свернуть, выбор запоминается для чата
        return `<div class="sth-card wide sth-tplbox ${hot}"><details class="sth-fold" data-k="tplOpen"${state.tplOpen !== false ? ' open' : ''}><summary class="sth-lbl">${ico('tag')}Шаблоны ученику (${list.length})</summary>
            <div class="sth-tpl-bar"><span class="sth-chip">${esc(d.brand)}</span><span class="sth-sub">бренд определён по услугам</span><button type="button" class="sth-float-btn">Поверх всего ⤢</button></div>
            <div class="sth-tpl-list">${tplCards(list, br, list.length <= 2)}</div></details></div>`;
    }
    // Отдельный блок шаблонов убран: шаблоны по услугам — кнопки в таблице, все вместе — окно «Шаблоны».
    // Для КМ шаблон относится ко всему ученику и в таблице места не имеет, поэтому показываем одну красную строку.
    function kmBanner(d) {
        const { br, list } = tplGroups(d);
        state.tpl = list;
        if (!(list.length && list[0].title === 'На КМ')) return '';
        return `<div class="sth-card wide sth-tplbox tpl-km"><div class="sth-tpl-list" style="max-height:none">${tplCards(list, br, true)}</div></div>`;
    }
    // Окно «поверх интерфейса»
    function renderOverlay(d) {
        const { br, list } = tplGroups(d);
        state.tpl = list;
        return `<div class="sth-ov"><div class="sth-ov-panel">
            <div class="sth-ov-h">${ico('tag')}<b>Шаблоны ученику (${list.length})</b><span class="sth-chip">${esc(d.brand)}</span><span class="sth-id">${esc(state.id || '')}</span>
                <span class="sth-spacer"></span><button type="button" class="sth-ov-close" title="Закрыть (Esc)">✕</button></div>
            <div class="sth-ov-list">${tplCards(list, br, list.length <= 2)}</div></div></div>`;
    }
    // Для склеенной группы убираем из подсказки номера баланса конкретной услуги
    const g_op = (t) => t.svcs.length > 1 ? t.op.replace(/\s*\(\d+\)/, '') : t.op;

    function renderBody() {
        if (state.loading || state.pending) return `<div class="sth-load" style="grid-column:1/-1"><i class="sth-spin"></i>Загружаю данные ученика…</div>`;
        if (state.error) return `<div class="sth-err">Не удалось загрузить: ${esc(state.error)}</div>`;
        const d = state.data;
        if (!d) return '';
        const sv = d.services;
        if (!sv.length) {
            return card('mute', 'info', 'Услуги', 'Рабочих услуг нет', `всего: ${d.totalCount}, закрытых (lost / некорректных): ${d.closedCount}`);
        }
        const unk = (x) => x && x.unknown;
        const foot = `всего услуг: ${d.totalCount}${d.closedCount ? `, закрытых: ${d.closedCount}` : ''}${d.skipped ? `, не показано: ${d.skipped}` : ''}${d.foreignCount ? `, чужих (оплачивает): ${d.foreignCount}` : ''}`;

        // 1. Кризисное сопровождение (сводка; по каждой услуге — в таблице)
        const km = sv.filter((x) => x.km);
        const kmCard = km.length
            ? card('bad', 'shield', 'Кризисное сопровождение', `Да — на КМ: ${km.length} из ${sv.length}`, km.map((x) => `#${esc(x.id)}: ${esc(x.kmReason)}`).join('<br>'))
            : card('ok', 'shield', 'Кризисное сопровождение', 'Нет', `по ${sv.length} рабочим услугам`);

        // 2. Отпуск / каникулы
        const vac = sv.filter((x) => !unk(x.vacation) && x.vacation.active);
        const vacFut = sv.filter((x) => !unk(x.vacation) && x.vacation.future);
        const vacUnknown = sv.some((x) => unk(x.vacation));
        let vacCard;
        if (vac.length) {
            const v = vac[0].vacation;
            vacCard = card('warn', 'plane', 'Ученик в отпуске', esc(v.title) + (v.to ? ` до ${fmtDate(v.to)}` : ''), vac.map((x) => `#${esc(x.id)}`).join(', '));
        } else if (vacFut.length) {
            const v = vacFut[0].vacation;
            vacCard = card('ok', 'plane', 'Ученик в отпуске', 'Нет', `запланирован ${esc(v.title.toLowerCase())}: ${fmtDate(v.from)} — ${fmtDate(v.to)}`);
        } else {
            vacCard = card(vacUnknown ? 'mute' : 'ok', 'plane', 'Ученик в отпуске', vacUnknown ? 'Нет данных' : 'Нет');
        }

        // 3. Рассрочка
        const cr = sv.filter((x) => !unk(x.credit) && x.credit);
        const crUnknown = sv.some((x) => unk(x.credit));
        const crCard = cr.length
            ? card('warn', 'coins', 'Рассрочка', 'Активна', cr.map((x) => `#${esc(x.id)}`).join(', '))
            : card(crUnknown ? 'mute' : 'ok', 'coins', 'Рассрочка', crUnknown ? 'Нет данных' : 'Нет активной');

        // 4. Промокод
        const pr = sv.filter((x) => !unk(x.promo) && x.promo);
        const prUnknown = sv.some((x) => unk(x.promo));
        let prCard;
        if (pr.length) {
            const first = pr[0].promo;
            prCard = card(pr.some((x) => !x.promo.expired) ? 'ok' : 'warn', 'tag', 'Промокод',
                pr.some((x) => x.promo.bf) ? 'Активен: Чёрная пятница' : 'Активен',
                esc(first.name.length > 60 ? first.name.slice(0, 58) + '…' : first.name));
        } else {
            prCard = card(prUnknown ? 'mute' : 'ok', 'tag', 'Промокод', prUnknown ? 'Нет данных' : 'Нет активного');
        }

        // 5. Баланс (сводка)
        // 6. Преподаватели (сводка)
        const needT = sv.filter((x) => !x.noTeacherNeeded);
        const noT = needT.filter((x) => !x.hasTeacher);
        const tCard = card(noT.length ? 'warn' : 'ok', 'teacher', 'Преподаватели по услугам',
            noT.length ? `Не закреплен: ${noT.length} из ${needT.length}` : 'Закреплен по всем услугам',
            noT.some((x) => x.replacement) ? 'по части услуг подбор уже идёт' : '');

        // Таблица по каждой рабочей (не lost и не некорректной) услуге
        const cell = (text, cls = '') => `<td class="${cls}">${text}</td>`;
        const shown = sv.filter((x) => !x.noTeacherNeeded); // life_adult / self_study в таблицу не выводим
        const hiddenN = sv.length - shown.length;
        const evAll = buildTemplates(d);
        state.tplEv = evAll;
        const evBr = d.brand === 'Skysmart' ? 'skysmart' : 'skyeng';
        const rows = shown.map((x) => {
            const mySvc = `#${x.id} ${x.title}`;
            const evCell = evAll.map((t, j) => ({ t, j })).filter(({ t }) => t.svc === mySvc)
                .map(({ t, j }) => `<button type="button" class="sth-evbtn" data-j="${j}" title="${esc(t.op)}">${esc(t.title)}</button>`).join('') || '<span class="sth-pill mute">—</span>';
            const bCls = x.balance === null ? 'zero' : x.balance <= 0 ? 'neg' : (x.balance < 5 && !x.corp) ? 'warn' : 'pos';
            const cat = categoryOf(x.key);
            const kmCell = x.km ? `<span class="sth-pill bad" title="${esc(x.kmReason)}">КМ</span>` : '<span class="sth-pill ok">нет</span>';
            let tCell;
            if (x.noTeacherNeeded && !x.hasTeacher) tCell = '<span class="sth-pill mute">не требуется</span>';
            else if (x.hasTeacher) tCell = `<span class="sth-pill ok">${esc(x.teacherName || (x.tempName ? 'врем.: ' + x.tempName : 'есть'))}</span>`;
            else if (x.replacement) tCell = '<span class="sth-pill warn">в подборе</span>';
            else tCell = '<span class="sth-pill bad">нет</span>';
            let vCell = '<span class="sth-pill mute">—</span>';
            if (unk(x.vacation)) vCell = '<span class="sth-pill mute">?</span>';
            else if (x.vacation.active) vCell = `<span class="sth-pill warn">${esc(x.vacation.title)}${x.vacation.to ? ' до ' + fmtDate(x.vacation.to) : ''}</span>`;
            else if (x.vacation.future) vCell = `<span class="sth-pill mute" title="${fmtDate(x.vacation.from)} — ${fmtDate(x.vacation.to)}">с ${fmtDate(x.vacation.from)}</span>`;
            let pCell = '<span class="sth-pill mute">—</span>';
            if (unk(x.promo)) pCell = '<span class="sth-pill mute">?</span>';
            else if (x.promo) pCell = `<span class="sth-pill ${x.promo.expired ? 'warn' : 'ok'}" title="${esc(x.promo.name)}">${x.promo.bf ? 'Чёрная пятница' : 'акция'}${x.promo.expiredAt ? ' до ' + fmtDate(x.promo.expiredAt) : ''}</span>`;
            let cCell = '<span class="sth-pill mute">—</span>';
            if (unk(x.credit)) cCell = '<span class="sth-pill mute">?</span>';
            else if (x.credit) cCell = '<span class="sth-pill warn">активна</span>';
            return `<tr>
                <td class="svc"><div class="svc-name" title="${esc(x.title)}"><a class="sth-lnk" href="https://crm2.skyeng.ru/persons/${encodeURIComponent(state.id || '')}/services/${encodeURIComponent(x.id)}" target="_blank" rel="noopener" title="Открыть услугу в CRM"><b>#${esc(x.id)}</b></a> ${esc(x.title)}</div>
                    <div class="svc-tags">${chip(brandOf([x.key]), 'brand')}${cat ? chip(cat) : ''}${x.corp ? chip('корп', 'corp') : ''}${x.stage ? chip(x.stage) : ''}</div></td>
                ${cell(x.balance === null ? '—' : esc(x.balance) + (x.balance === 0 && !unk(x.credit) && x.credit ? ' · рассрочка' : ''), 'bal ' + bCls)}
                ${cell(kmCell)}${cell(tCell)}${cell(vCell)}${cell(pCell)}${cell(cCell)}${cell(evCell, 'ev')}
            </tr>`;
        }).join('');
        const table = `<div class="sth-card wide mute"><details class="sth-fold" data-k="tblOpen"${state.tblOpen !== false ? ' open' : ''}><summary class="sth-lbl">${ico('info')}По каждой рабочей услуге (${esc(foot)}${hiddenN ? esc(', скрыто (life/self/talks): ' + hiddenN) : ''})</summary>
            <div class="sth-tablewrap"><table class="sth-table"><thead><tr><th>Услуга</th><th>Баланс</th><th>КМ</th><th>Преподаватель</th><th>Отпуск</th><th>Промокод</th><th>Рассрочка</th><th>Шаблоны</th></tr></thead><tbody>${rows}</tbody></table></div></details></div>`;

        return [kmCard, vacCard, crCard, prCard, tCard, kmBanner(d), table].join('');
    }

    function copyText(doc, text) {
        const fallback = () => {
            const ta = doc.createElement('textarea');
            ta.value = text; ta.style.cssText = 'position:fixed;opacity:0;left:-999px';
            doc.body.appendChild(ta); ta.select();
            try { doc.execCommand('copy'); } catch { /* ignore */ }
            ta.remove();
        };
        try {
            const nav = doc.defaultView?.navigator;
            if (nav?.clipboard?.writeText) nav.clipboard.writeText(text).catch(fallback); else fallback();
        } catch { fallback(); }
    }

    function renderBlock(doc) {
        let block = doc.getElementById(BLOCK_ID);
        const header = doc.querySelector(HEADER_SEL);
        if (!header) return;
        if (!block) {
            block = doc.createElement('div');
            block.id = BLOCK_ID;
            doc.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && state.tplFloat) { state.tplFloat = false; if (block.isConnected) renderBlock(doc); }
            });
            block.addEventListener('toggle', (e) => {
                const k = e.target?.dataset?.k;
                if (k) state[k] = e.target.open;
            }, true);
            block.addEventListener('click', (e) => {
                if (e.target.closest('a')) return; // клик по ссылке (CRM, услуга, «Подробнее») ничего не сворачивает
                if (e.target.closest('.sth-refresh')) { refresh(true); return; }
                if (e.target.closest('.sth-float-btn, .sth-tplbtn')) { e.stopPropagation(); state.tplFloat = true; renderBlock(doc); return; }
                if (e.target.closest('.sth-ov-close') || e.target.classList.contains('sth-ov')) { state.tplFloat = false; renderBlock(doc); return; }
                const ev = e.target.closest('.sth-evbtn');
                if (ev) {
                    const t = state.tplEv?.[+ev.dataset.j];
                    if (t) {
                        copyText(doc, t.text[state.data?.brand === 'Skysmart' ? 'skysmart' : 'skyeng']);
                        const old = ev.textContent; ev.classList.add('done'); ev.textContent = 'Скопировано';
                        setTimeout(() => { ev.classList.remove('done'); ev.textContent = old; }, 1200);
                    }
                    return;
                }
                const tg = e.target.closest('.sth-tpl-toggle');
                if (tg) { tg.closest('.sth-tpl').classList.toggle('open'); return; }
                const cp = e.target.closest('.sth-copy');
                if (cp) {
                    const t = state.tpl?.[+cp.dataset.i];
                    if (t) {
                        const br = state.data?.brand === 'Skysmart' ? 'skysmart' : 'skyeng';
                        copyText(doc, t.text[br]);
                        cp.classList.add('done'); const old = cp.textContent; cp.textContent = 'Скопировано';
                        setTimeout(() => { cp.classList.remove('done'); cp.textContent = old; }, 1200);
                    }
                    return;
                }
                if (e.target.closest('.sth-head')) {
                    state.collapsed = !state.collapsed;
                    block.classList.toggle('collapsed', state.collapsed);
                }
            });
        }
        if (block.previousElementSibling !== header || !block.isConnected) {
            // Не чаще раза в 1.5 с: если React постоянно перестраивает шапку, не устраиваем «перетягивание» узла
            const now = Date.now();
            if (block.isConnected && now - (block._movedAt || 0) < 1500) return;
            block._movedAt = now;
            try { header.insertAdjacentElement('afterend', block); } catch { return; }
        }
        block.classList.toggle('collapsed', state.collapsed);

        const role = roleLabel(state.role);
        const roleIco = role.kind === 'parent' ? 'users' : 'student';
        const html = `
            <div class="sth-head">
                <span class="sth-title">${ico('info')}Вспомогательная информация по У</span>
                <span class="sth-id" title="ID ученика">${esc(state.id || '—')}</span>
                ${state.role ? `<span class="sth-role ${role.kind}">${ico(roleIco)}${esc(role.text)}</span>` : ''}
                ${state.data?.services?.some((x) => x.corp) ? `<span class="sth-role corp" title="Есть корпоративная услуга: general.corporate или paymentAgreement.companyContract">${ico('tag')}Корпоративный</span>` : ''}
                <a class="sth-crm" href="https://crm2.skyeng.ru/persons/${encodeURIComponent(state.id || '')}" target="_blank" rel="noopener" title="Открыть ученика в CRM">CRM ↗</a>
                <span class="sth-spacer"></span>
                ${state.data && state.data.services?.length ? `<button class="sth-btn sth-tplbtn" type="button" title="Шаблоны поверх интерфейса">${ico('tag')}Шаблоны</button>` : ''}
                <button class="sth-btn sth-refresh" type="button" title="Обновить данные">${ico('refresh')}</button>
                <span class="sth-btn sth-chev-wrap" style="border:0;background:none">${ico('chevron', 'sth-chev')}</span>
            </div>
            <div class="sth-body">${renderBody()}</div>
            ${state.tplFloat && state.data?.services ? renderOverlay(state.data) : ''}`;
        // Не трогаем DOM, если ничего не изменилось (иначе мигание и сброс раскрытого спойлера)
        if (block._html !== html) { block._html = html; block.innerHTML = html; }
    }

    // ── Жизненный цикл ──────────────────────────────────────────────────────
    async function refresh(force = false) {
        const entry = state;
        const doc = getFrameDoc();
        if (!doc || !entry.id) return;
        const token = ++entry.reqToken;
        entry.loading = true; entry.pending = false; entry.error = null;
        if (force) entry.data = null;
        renderBlock(doc);
        try {
            const data = await loadAll(entry.id);
            if (token !== entry.reqToken) return; // запись сброшена/перезапущена, пока грузили
            entry.data = data;
        } catch (e) {
            if (token !== entry.reqToken) return;
            entry.error = e?.message || 'ошибка запроса';
        } finally {
            if (token === entry.reqToken) {
                entry.loading = false;
                // Результат всегда сохраняется в записи своего чата; перерисовываем, только если чат ещё открыт
                const d = getFrameDoc();
                if (d && state === entry) renderBlock(d);
            }
        }
    }

    function tick() {
        try { tickInner(); } catch (e) { console.warn('[AFStudentHelper]', e); }
    }

    // Отдел оператора: 'tp' | 'other' | null (ещё не определён)
    const T0 = Date.now();
    function operatorKind() {
        let sec = '';
        try { sec = typeof getOpSection === 'function' ? getOpSection() : ''; } catch { /* ignore */ }
        if (sec) return sec.startsWith('ТП') ? 'tp' : 'other';
        const nm = document.querySelector('.user_menu-dropdown-user_name')?.textContent?.trim() || '';
        if (nm) return /^ТП(\s*ОС)?\s*[-–—]/i.test(nm) ? 'tp' : 'other';
        return null;
    }
    // ТП: показываем, только если включено в Settings (ключ afStudentHelperTP = 1). Остальные отделы — всегда.
    function enabledForOperator() {
        const kind = operatorKind();
        if (kind === 'tp') {
            try { return localStorage.getItem('afStudentHelperTP') === '1'; } catch { return false; }
        }
        if (kind === 'other') return true;
        return Date.now() - T0 > 15000; // отдел ещё не определён — подождём, чтобы ТП не увидел панель на старте
    }

    function tickInner() {
        const doc = getFrameDoc();
        if (!doc || !doc.body) return;
        const header = doc.querySelector(HEADER_SEL);
        const block = doc.getElementById(BLOCK_ID);

        // Не на экране диалога — блок убираем
        if (!header) { block?.remove(); return; }
        if (!enabledForOperator()) { block?.remove(); return; }
        ensureStyle(doc);

        // Панель нужна только для ученика/родителя. Нет текста userType или teacher — панели нет вовсе.
        const role = (readVariable(doc, 'userType') || '').trim().toLowerCase();
        if (role !== 'student' && role !== 'parent') { block?.remove(); return; }

        const ids = readStudentIds(doc);
        const id = ids[0] || null;
        if (!id) { block?.remove(); return; }

        // Переключение чата: берём запись этого чата (из кеша или новую)
        const key = chatKey();
        if (key !== currentKey) {
            staleId = state.id;
            currentKey = key;
            state = getEntry(key);
            stab = { sig: '', n: 0 };
            if (!state.id) state.pending = true;
            else if (state.error && !state.loading) { refresh(); return; }
            renderBlock(doc); // сразу показываем данные нового чата (кеш или «загрузка»), а не старого
        }

        // DOM после смены чата может ещё показывать предыдущего ученика — верим ему после нескольких одинаковых тиков
        const sig = id + '|' + role;
        if (stab.sig === sig) stab.n++; else stab = { sig, n: 1 };
        // Если DOM показывает того же ученика, что и в прошлом чате, ждём дольше: возможно, это ещё старая разметка
        const need = (!state.id && id === staleId) ? STABLE_TICKS * 3 : STABLE_TICKS;
        const stable = stab.n >= need;

        if (!state.id || state.id !== id) {
            if (!stable) { if (!block) renderBlock(doc); return; }
            // Новый чат или в чате сменился ученик: сбрасываем запись и грузим
            if (state.id && ids.length > 1 && ids[0] !== ids[1]) console.warn('[AFStudentHelper] ID в двух местах не совпадает:', ids);
            state.id = id; state.role = role; state.data = null; state.error = null; state.reqToken++;
            staleId = null;
            refresh();
            return;
        }
        if (role !== state.role) { state.role = role; renderBlock(doc); return; }
        // React мог пересоздать шапку и унести блок — возвращаем на место (из кеша, без запросов)
        if (!block || block.previousElementSibling !== header) renderBlock(doc);
    }

    // Тестовый хук (используется только если страница задала window.AFStudentHelperTest)
    if (window.AFStudentHelperTest) window.AFStudentHelperTest.api = { loadAll, renderBody, get state() { return state; }, cache, tick };

    setInterval(tick, TICK_MS);
    tick();
})();
