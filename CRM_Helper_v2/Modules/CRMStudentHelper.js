// ============================================================================
// CRMStudentHelper.js — полоса «Вспомогательная информация по У» на странице пользователя в CRM
// ----------------------------------------------------------------------------
// Где живёт: crm2.skyeng.ru/persons/{id}…  Вставляется сразу под верхним синим меню (crm-header).
// Показывается только для ученика и родителя (роль берётся из заголовка h1 страницы).
// Данные и правила — те же, что в AFStudentHelper.js (KC.html): КМ, отпуск, рассрочка, промокод,
// баланс и преподаватель по каждой рабочей услуге, уроки сегодня, задачи ТП Исход / 2ЛТП,
// шаблоны для ученика (чат и почта) с копированием в буфер обмена.
// Запросы идут через bg.js (crmRequest). Отдел (ТП / другие) — crmGetDepartment, спрашивается при первом запуске.
// Свёрнутая полоса показывает ключевые плашки (КМ, рассрочка, задачи, уроки сегодня).
// ============================================================================
(() => {
    'use strict';
    if (window.__CRM_STUDENT_HELPER__) return;
    window.__CRM_STUDENT_HELPER__ = true;

    const BLOCK_ID = 'crmh-sth-block'; // у каждого расширения свой id, чтобы не трогать чужую полосу
    const STYLE_ID = 'crmh-sth-style';
    const HEADER_SEL = 'crm-header';
    const COLLAPSE_KEY = 'crmStudentHelperExpanded'; // '1' — полоса развёрнута (по умолчанию свёрнута)
    const TICK_MS = 700;
    const STABLE_TICKS = 2;   // сколько тиков подряд роль на странице должна быть одной и той же
    const MAX_CACHE = 40;     // сколько пользователей держим в памяти
    const MAX_SERVICES = 8; // защита от лавины запросов у учеников с десятками услуг


    // ── Защита от конфликта с соседним расширением ──────────────────────────
    // На странице CRM одновременно могут работать CHMAF и CRMHelper, и оба рисуют такую полосу. Окружение у расширений изолированное,
    // а DOM общий, поэтому договариваемся через атрибуты <html>: кто первым занял — тот рисует, второй молчит (не рисует и не делает запросов).
    // Владелец продлевает бронь каждый такт; если его расширение выключили, бронь протухает через 4 с и полосу берёт второе.
    const OWNER = 'crmhelper';
    const LOCK_ATTR = 'data-sth-owner', LOCK_TS_ATTR = 'data-sth-owner-ts', LOCK_TTL = 4000;
    function claimLock() {
        try {
            const el = document.documentElement, now = Date.now();
            const owner = el.getAttribute(LOCK_ATTR), ts = +el.getAttribute(LOCK_TS_ATTR) || 0;
            if (owner && owner !== OWNER && now - ts < LOCK_TTL) return false;
            el.setAttribute(LOCK_ATTR, OWNER); el.setAttribute(LOCK_TS_ATTR, String(now));
            return true;
        } catch { return true; }
    }

    const BACKEND = 'https://backend.skyeng.ru/api';
    const SOURCES = {
        services: (id) => `${BACKEND}/persons/${id}/education-services/`,
        general: (id, sid) => `${BACKEND}/students/${id}/education-services/${sid}/general/`,
        promocode: (sid) => `${BACKEND}/v2/students/education-services/${sid}/promocode/active/`,
        person: (id) => `${BACKEND}/persons/${id}?crm2=true&debugParam=profile-page`,
        autoPlan: (sid) => `https://teachers-schedule.skyeng.ru/api/education-services/${sid}/auto-schedule/is-available/`,
        tasks: (id) => `https://customer-support.skyeng.ru/task/user/${id}`,
        history: (id) => `${BACKEND}/students/${id}/timetable/lessons-history/?page=0`,
        future: (id) => `${BACKEND}/students/${id}/timetable/future-lessons/`,
        credit: (sid) => `${BACKEND}/v2/students/education-services/${sid}/credit/active/`,
        vacation: (sid) => `https://student-vacation.skyeng.ru/api/v1/education-services/${sid}/student-vacations/current-or-future`
    };

    // Бренд по serviceTypeKey (KC.html): есть adult → Skyeng; иначе kids/junior/klp/… → Skysmart; иначе Skyeng
    const KIDS_MARKERS = ['kids', 'junior', 'klp', 'preschool', 'homeschool', 'skysmart', 'chess_kids', 'mini_course_kids', 'f2g_kids', 'computer_courses'];
    const KM_NOTE_RE = /(?<![а-яёa-z])км(?![а-яёa-z])|кризис|работе км/i;

    // ── Кеш по пользователю ─────────────────────────────────────────────────
    // Ключ — ID из адреса /persons/{id}. Переход между страницами одного пользователя запросов не повторяет.
    const cache = new Map();
    const readExpanded = () => { try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; } };
    const newEntry = () => ({ id: null, role: null, data: null, loading: false, pending: false, error: null, collapsed: !readExpanded(), reqToken: 0, tplBrand: null, tplOpen: null, tplFloat: false, tblOpen: null, mode: 'full' });
    let state = newEntry();
    let curMode = 'crm'; // для loadAll: полная загрузка + задачи + уроки сегодня
    // Режим по отделу оператора. Отдел задаётся в расширении (crmGetDepartment из content.js:
    // спрашивается при первом запуске, меняется в «Настройках»): 'tp' — компактный вид для ТП,
    // 'other' — полный вид для других отделов. Выключатель в «Настройках» (crmsth_enabled = '0') — 'off'.
    // Пока отдел не выбран, полоса не показывается.
    const ENABLED_KEY = 'crmsth_enabled';
    let shared = null;
    function syncShared() {
        let enabled = true;
        try { enabled = localStorage.getItem(ENABLED_KEY) !== '0'; } catch { /* по умолчанию включено */ }
        if (!enabled) { shared = { mode: 'off' }; return; }
        const dept = typeof crmGetDepartment === 'function' ? crmGetDepartment() : null;
        let theme = 'dark'; try { theme = localStorage.getItem('crmsth_theme') === 'light' ? 'light' : 'dark'; } catch { /* тёмная */ }
        shared = dept === 'tp' ? { mode: 'tp', kind: 'tp', theme } : dept ? { mode: 'full', kind: 'other', theme } : null;
    }
    let currentKey = null;
    let stab = { sig: '', n: 0 };

    function getEntry(key) {
        let e = cache.get(key);
        if (e) { cache.delete(key); } else { e = newEntry(); }
        cache.set(key, e); // перемещаем в конец (LRU)
        while (cache.size > MAX_CACHE) cache.delete(cache.keys().next().value);
        return e;
    }

    const personId = () => location.pathname.match(/^\/persons\/(\d+)/)?.[1] || null;

    // ── Утилиты ──────────────────────────────────────────────────────────────
    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const getFrameDoc = () => document;

    // Роль — по заголовку h1 страницы пользователя («Ученик» / «Родитель» / «Преподаватель»)
    function readRole() {
        for (const h of document.querySelectorAll('h1')) {
            const t = (h.textContent || '').trim().toLowerCase();
            if (t === 'ученик') return 'student';
            if (t === 'родитель') return 'parent';
            if (t === 'преподаватель') return 'teacher';
        }
        return '';
    }

    // На подстраницах (семья, услуги…) заголовка с ролью нет — берём тип пользователя из API (кеш по id)
    const apiRole = new Map(), apiRoleReq = new Set();
    function roleFor(id) {
        const r = readRole();
        if (r) return r;
        if (apiRole.has(id)) return apiRole.get(id);
        if (!apiRoleReq.has(id)) {
            apiRoleReq.add(id);
            getJson(SOURCES.person(id)).then((j) => { apiRole.set(id, String(j?.data?.type || 'unknown').toLowerCase()); }).catch(() => apiRoleReq.delete(id));
        }
        return '';
    }

    function roleLabel(userType) {
        const t = String(userType || '').toLowerCase();
        if (t === 'student') return { text: 'Ученик', kind: 'student' };
        if (t === 'parent') return { text: 'Родитель', kind: 'parent' };
        return { text: userType || 'Тип не определён', kind: 'unknown' };
    }

    // Запрос через bg.js (crmRequest из content.js): со страницы CRM внутренние API режет CORS,
    // а service worker ходит с правами расширения (host_permissions *.skyeng.ru). Формат ответа: { fetchansver }.
    async function apiGet(url) {
        const opts = { method: 'GET', credentials: 'include', headers: { accept: 'application/json, text/plain, */*' } };
        if (typeof crmRequest === 'function') {
            try {
                return { fetchansver: await crmRequest(url, opts) };
            } catch (e) {
                if (/Пустой ответ/.test(String(e?.message))) return { fetchansver: '' }; // пустое тело = «нет данных»
                throw e;
            }
        }
        const res = await fetch(url, opts);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return { fetchansver: await res.text() };
    }

    // ── Иконки (stroke = currentColor, цвет через --ic) ─────────────────────
    const P = {
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.5"/>',
        shield: '<path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z"/><path d="M12 8v4M12 15v.5"/>',
        coin: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.5-.8-1.5-1.2-2.8-1.2-1.7 0-2.8.8-2.8 2 0 3 5.6 1.4 5.6 4.2 0 1.2-1.1 2-2.8 2-1.3 0-2.4-.5-3-1.4M12 6v2M12 16v2"/>',
        plane: '<path d="M7 22h10" stroke="#fbbf24" stroke-width="2"/><path d="M12.6 22c-.3-4.2 0-8 1.2-12.2" stroke="#b45309" stroke-width="2.2" fill="none"/><path d="M13.6 9.6c-2.6-3.7-7.2-3.7-9.8-1 3.1-.9 6.4.1 9.8 1z" fill="#22c55e" stroke="#15803d" stroke-width="1"/><path d="M13.6 9.6c2.6-3.7 7.2-3.7 9.8-1-3.1-.9-6.4.1-9.8 1z" fill="#22c55e" stroke="#15803d" stroke-width="1"/><path d="M13.6 9.6c-1.7-2.6-1.7-5.3 0-8 1.7 2.7 1.7 5.4 0 8z" fill="#4ade80" stroke="#15803d" stroke-width="1"/><path d="M13.6 9.6c3.1.5 5.6 2.5 6.6 5.6-2.1-2.3-4.6-3.3-6.6-3.6z" fill="#16a34a" stroke="#15803d" stroke-width="1"/><path d="M13.6 9.6c-3.1.5-5.6 2.5-6.6 5.6 2.1-2.3 4.6-3.3 6.6-3.6z" fill="#16a34a" stroke="#15803d" stroke-width="1"/><circle cx="12.3" cy="11.2" r="1.1" fill="#92400e" stroke="none"/><circle cx="14.7" cy="11.4" r="1.1" fill="#92400e" stroke="none"/>',
        teacher: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
        coins: '<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7M15 11c3.3 0 6 1.3 6 3v3c0 1.7-2.7 3-6 3-1.2 0-2.3-.2-3.2-.5"/>',
        tag: '<path d="M3 12V4h8l10 10-8 8L3 12z"/><circle cx="8" cy="8" r="1.4"/>',
        refresh: '<path d="M20 11a8 8 0 00-14.9-3M4 4v4h4M4 13a8 8 0 0014.9 3M20 20v-4h-4"/>',
        chevron: '<path d="M6 9l6 6 6-6"/>',
        check: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke="#4ade80" stroke-width="3"/>',
        help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.6a2.5 2.5 0 015 .6c0 1.7-2.6 2-2.6 3.6M12 17v.2"/>',
        copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>',
        spark: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/><path d="M19 15v4M17 17h4"/>',
        wallet: '<path d="M3 7a2 2 0 012-2h13v4"/><path d="M3 7v11a2 2 0 002 2h15a1 1 0 001-1v-9a1 1 0 00-1-1H5a2 2 0 01-2-2z"/><circle cx="16.5" cy="14.5" r="1.2"/>',
        clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
        doc: '<path d="M7 3h7l5 5v13H7a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M14 3v5h5M9.5 13h6M9.5 17h6"/>',
        ext: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
        phoneOut: '<path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2zM15 3h6v6M21 3l-7 7"/>',
        layers2: '<path d="M12 2l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
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
    #${BLOCK_ID} .sth-lnk b{color:#7dd3fc}
    #${BLOCK_ID} .sth-open{display:inline-flex;align-items:center;gap:4px;margin-left:6px;padding:1px 7px;border-radius:6px;border:1px solid rgba(125,211,252,.55);background:rgba(56,189,248,.12);color:#7dd3fc!important;font-size:11px;font-weight:600;text-decoration:none!important;white-space:nowrap;vertical-align:middle}
    #${BLOCK_ID} .sth-open:hover{background:rgba(56,189,248,.28);color:#e0f2fe!important}
    #${BLOCK_ID} .sth-open .sth-i{--ic:currentColor;width:13.8px;height:13.8px}
    #${BLOCK_ID} .sth-role.corp{--ic:#d8b4fe;color:#d8b4fe;background:rgba(192,132,252,.14);border-color:rgba(192,132,252,.5)}
    #${BLOCK_ID} .sth-role.unknown{--ic:#94a3b8;color:#94a3b8;background:rgba(148,163,184,.1);border-color:rgba(148,163,184,.3)}
    #${BLOCK_ID} .sth-spacer{flex:1}
    #${BLOCK_ID} .sth-btn{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--mut);cursor:pointer;padding:0}
    #${BLOCK_ID} .sth-btn:hover{background:rgba(255,255,255,.1);color:var(--txt)}
    #${BLOCK_ID} .sth-btn .sth-i{--ic:currentColor;width:16.1px;height:16.1px}
    #${BLOCK_ID} .sth-chev{transition:transform .2s}
    #${BLOCK_ID}.collapsed .sth-chev{transform:rotate(-90deg)}
    #${BLOCK_ID}.collapsed .sth-body{display:none}
    #${BLOCK_ID} .sth-body{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
    #${BLOCK_ID} .sth-card{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid var(--line);border-left:3px solid var(--ic,#64748b);min-width:0}
    #${BLOCK_ID} .sth-card.wide{flex:1 1 100%}
    #${BLOCK_ID} .sth-card:not(.wide){flex:0 0 auto;padding:5px 10px;display:flex;align-items:center;gap:8px;border-radius:8px}
    #${BLOCK_ID} .sth-card:not(.wide) .sth-lbl{margin:0;white-space:nowrap}
    #${BLOCK_ID} .sth-card:not(.wide) .sth-sub{display:none}
    #${BLOCK_ID} .sth-card.ok{--ic:#4ade80}
    #${BLOCK_ID} .sth-card.warn{--ic:#fbbf24}
    #${BLOCK_ID} .sth-card.bad{--ic:#f87171}
    #${BLOCK_ID} .sth-card.mute{--ic:#64748b}
    #${BLOCK_ID} .sth-card.km{background:linear-gradient(135deg,#991b1b,#dc2626);border:1px solid #fca5a5;border-left:4px solid #fff;box-shadow:0 0 0 1px rgba(248,113,113,.35),0 4px 18px rgba(220,38,38,.45);animation:sthKmPulse 2.4s ease-in-out infinite}
    #${BLOCK_ID} .sth-card.bad.km .sth-lbl{color:#fee2e2!important}
    #${BLOCK_ID} .sth-card.bad.km .sth-val{color:#fff!important;font-size:14px;font-weight:800;letter-spacing:.2px;text-shadow:0 1px 2px rgba(0,0,0,.35)}
    #${BLOCK_ID} .sth-card.bad.km .sth-sub{color:#fecaca!important}
    #${BLOCK_ID} .sth-apcopy{display:inline-flex;align-items:center;justify-content:center;margin-left:6px;width:24px;height:22px;padding:0;border-radius:6px;border:1px solid rgba(167,139,250,.55);background:rgba(167,139,250,.14);color:#c4b5fd;cursor:pointer;vertical-align:middle}
    #${BLOCK_ID} .sth-apcopy .sth-i{--ic:currentColor;width:13px;height:13px}
    #${BLOCK_ID} .sth-apcopy:hover{background:rgba(167,139,250,.32)}
    #${BLOCK_ID} .sth-apcopy.done{background:rgba(74,222,128,.25);border-color:#4ade80;color:#86efac}
    #${BLOCK_ID} .sth-aphelp{cursor:help}
    #${BLOCK_ID} .sth-pill .sth-i{width:13px;height:13px;margin-right:3px}
    #${BLOCK_ID} .sth-mq{position:relative;display:block;overflow:hidden;max-width:280px;white-space:nowrap}
    #${BLOCK_ID} .sth-mqi{position:relative;display:inline-block;white-space:nowrap;animation:sthMq 24s ease-in-out infinite alternate}
    #${BLOCK_ID} .sth-mq:hover .sth-mqi{animation-play-state:paused}
    @keyframes sthMq{0%,12%{left:0;transform:translateX(0)}88%,100%{left:100%;transform:translateX(-100%)}}
    @media (prefers-reduced-motion:reduce){#${BLOCK_ID} .sth-mqi{animation:none}#${BLOCK_ID} .sth-mq{text-overflow:ellipsis}}
    #${BLOCK_ID} .sth-promoopen{display:inline-flex;align-items:center;gap:4px;margin-left:6px;padding:1px 8px;border-radius:6px;border:1px solid rgba(244,114,182,.6);background:rgba(244,114,182,.14);color:#f9a8d4;font-size:11px;font-weight:600;cursor:pointer;vertical-align:middle;white-space:nowrap}
    #${BLOCK_ID} .sth-promoopen .sth-i{--ic:currentColor;width:12px;height:12px;margin:0}
    #${BLOCK_ID} .sth-promoopen:hover{background:rgba(244,114,182,.32)}
    #${BLOCK_ID} .sth-promoopen.done{background:rgba(74,222,128,.25);border-color:#4ade80;color:#86efac}
    #${BLOCK_ID} .sth-pv{display:inline-flex;align-items:center}
    #${BLOCK_ID} .sth-inst{display:flex;flex-wrap:wrap;align-items:center;gap:4px;margin-top:4px}
    #${BLOCK_ID} .sth-inst .sth-open{margin-left:0}
    #${BLOCK_ID} .sth-stgs{display:inline-flex;flex-wrap:wrap;gap:4px}
    #${BLOCK_ID} .sth-stg{display:inline-flex;align-items:center;gap:3px;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:600;border:1px solid;white-space:nowrap}
    #${BLOCK_ID} .sth-stg .sth-i{width:11px;height:11px;margin:0}
    #${BLOCK_ID} .sth-stg.ok{color:#bbf7d0;background:rgba(34,197,94,.14);border-color:rgba(34,197,94,.45)}
    #${BLOCK_ID} .sth-stg.mute{color:#cbd5e1;background:rgba(148,163,184,.12);border-color:rgba(148,163,184,.4)}
    #${BLOCK_ID} .sth-stg.bad{color:#fecaca;background:rgba(239,68,68,.25);border-color:rgba(252,165,165,.6)}
    #${BLOCK_ID} .sth-stg.warn{color:#fde68a;background:rgba(251,191,36,.16);border-color:rgba(251,191,36,.5)}
    #${BLOCK_ID} .sth-table td.cr{white-space:normal;min-width:230px}
    #${BLOCK_ID}.tp .sth-body{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:8px;align-items:start}
    #${BLOCK_ID}.tp.collapsed .sth-body{display:none}
    #${BLOCK_ID}.tp .sth-body:empty{display:none}
    #${BLOCK_ID}.tp .sth-card,#${BLOCK_ID}.tp .sth-card.wide,#${BLOCK_ID}.tp .sth-card:not(.wide){display:block;flex:none;grid-column:auto;padding:8px 12px;border-radius:10px}
    #${BLOCK_ID}.tp .sth-card:not(.wide) .sth-lbl{margin-bottom:3px}
    #${BLOCK_ID}.tp .sth-card:not(.wide) .sth-sub{display:block}
    #${BLOCK_ID}.tp .sth-card{min-width:0;overflow:hidden}
    #${BLOCK_ID}.tp .sth-list li{flex-wrap:wrap;gap:2px 10px}
    #${BLOCK_ID}.tp .sth-lsvc{word-break:break-all}
    @keyframes sthKmPulse{0%,100%{box-shadow:0 0 0 1px rgba(248,113,113,.35),0 4px 14px rgba(220,38,38,.35)}50%{box-shadow:0 0 0 2px rgba(254,202,202,.55),0 4px 22px rgba(239,68,68,.7)}}
    #${BLOCK_ID} .sth-card.vac{background:linear-gradient(135deg,#b45309,#f59e0b);border:1px solid #fde68a;border-left:4px solid #fff;box-shadow:0 0 0 1px rgba(251,191,36,.35),0 4px 18px rgba(245,158,11,.45)}
    #${BLOCK_ID} .sth-card.warn.vac .sth-lbl{color:#fffbeb!important}
    #${BLOCK_ID} .sth-card.warn.vac .sth-val{color:#fff!important;font-size:14px;font-weight:800;text-shadow:0 1px 2px rgba(0,0,0,.4)}
    #${BLOCK_ID} .sth-card.warn.vac .sth-sub{color:#fef3c7!important}
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
    #${BLOCK_ID} .sth-list li span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
    #${BLOCK_ID} .sth-list b{font-variant-numeric:tabular-nums}
    #${BLOCK_ID} .sth-list b.neg{color:#fca5a5}
    #${BLOCK_ID} .sth-list b.zero{color:#94a3b8}
    #${BLOCK_ID} .sth-list b.pos{color:#86efac}
    #${BLOCK_ID} .sth-list b.warn{color:#fcd34d}
    #${BLOCK_ID} .sth-tablewrap{overflow-x:auto;margin-top:6px}
    #${BLOCK_ID} .sth-table{width:100%;border-collapse:collapse;font-size:12px}
    #${BLOCK_ID} .sth-table th{text-align:left;font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:var(--mut);padding:2px 8px 6px 0;white-space:nowrap}
    #${BLOCK_ID} .sth-th{display:inline-flex;align-items:center;gap:5px;vertical-align:middle}
    #${BLOCK_ID} .sth-table td .sth-pill,#${BLOCK_ID} .sth-table td .sth-evbtn{vertical-align:middle}
    #${BLOCK_ID} .sth-table td.ev{display:table-cell}
    #${BLOCK_ID} .sth-table td{line-height:1.2}
    #${BLOCK_ID} .sth-table td .sth-pill{display:inline-flex;align-items:center;line-height:1.3;margin:0}
    #${BLOCK_ID} .sth-table td .sth-evbtn{margin:2px 5px 2px 0;line-height:1.3;vertical-align:middle}
    #${BLOCK_ID} .sth-table td.bal{line-height:1.3}
    #${BLOCK_ID} .sth-th .sth-i{--ic:#7dd3fc;width:14.9px;height:14.9px}
    #${BLOCK_ID} .sth-th .c-layers2{--ic:#60a5fa}
    #${BLOCK_ID} .sth-th .c-wallet{--ic:#fbbf24}
    #${BLOCK_ID} .sth-th .c-shield{--ic:#fb7185}
    #${BLOCK_ID} .sth-th .c-teacher{--ic:#c4b5fd}
    #${BLOCK_ID} .sth-th .c-tag{--ic:#f472b6}
    #${BLOCK_ID} .sth-th .c-coins{--ic:#facc15}
    #${BLOCK_ID} .sth-th .c-spark{--ic:#a78bfa}
    #${BLOCK_ID} .sth-th .c-clock{--ic:#38bdf8}
    #${BLOCK_ID} .sth-th .c-doc{--ic:#34d399}
    #${BLOCK_ID} .sth-i{filter:drop-shadow(0 1px 0 rgba(255,255,255,.28)) drop-shadow(0 2px 2px rgba(0,0,0,.65))}
    #${BLOCK_ID} .sth-th .sth-i{stroke-width:2.1;filter:drop-shadow(0 1px 0 rgba(255,255,255,.35)) drop-shadow(0 2px 2px rgba(0,0,0,.7)) drop-shadow(0 0 5px var(--ic))}
    #${BLOCK_ID} .sth-lbl .sth-i,#${BLOCK_ID} .sth-title .sth-i{stroke-width:2;filter:drop-shadow(0 1px 0 rgba(255,255,255,.3)) drop-shadow(0 2px 2px rgba(0,0,0,.65)) drop-shadow(0 0 4px var(--ic))}
    #${BLOCK_ID} .sth-table td{padding:6px 8px 6px 0;border-top:1px solid var(--line);vertical-align:middle;white-space:nowrap}
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
    #${BLOCK_ID} .sth-lsvc{color:#e2e8f0;font-family:ui-monospace,Consolas,monospace;font-size:12px}
    #${BLOCK_ID} .sth-task{--g:100,116,139;--g1:#94a3b8;--g2:#64748b;--gt:#0f172a}
    #${BLOCK_ID} .sth-task.out{--g:52,211,153;--g1:#10b981;--g2:#047857;--gt:#ffffff}
    #${BLOCK_ID} .sth-task.l2{--g:56,189,248;--g1:#0ea5e9;--g2:#0369a1;--gt:#ffffff}
    #${BLOCK_ID} li.sth-task{position:relative;list-style:none;margin:8px 0;padding:10px 12px;border-radius:12px;border:1px solid rgba(var(--g),.45);background:linear-gradient(100deg,rgba(var(--g),.16),rgba(18,23,33,.96) 45%),#161b27;box-shadow:0 0 0 1px rgba(var(--g),.35);overflow:hidden}
    #${BLOCK_ID} li.sth-task::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(180deg,var(--g1),var(--g2));box-shadow:0 0 12px rgba(var(--g),.7)}
    #${BLOCK_ID} .sth-grp{display:inline-flex;align-items:center;gap:6px;padding:3px 12px 3px 9px;border-radius:999px;font-size:12.5px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;color:var(--gt,#fff);text-shadow:0 1px 2px rgba(0,0,0,.45);background:linear-gradient(135deg,var(--g1,#64748b),var(--g2,#475569));box-shadow:0 2px 10px rgba(var(--g,100,116,139),.45);margin:0 6px 2px 0;vertical-align:middle}
    #${BLOCK_ID} .sth-grp .sth-i{--ic:currentColor;width:16.1px;height:16.1px}
    #${BLOCK_ID} li.sth-task,#${BLOCK_ID} li.sth-task b{color:#f8fafc}
    #${BLOCK_ID} li.sth-task .sth-tmeta,#${BLOCK_ID} li.sth-task .sth-cm-short{color:#dbe4f0 !important;font-size:12.5px}
    #${BLOCK_ID} li.sth-task .sth-cm-toggle{color:#e0f2fe;background:rgba(var(--g),.28);border-color:rgba(var(--g),.6)}
    #${BLOCK_ID} .sth-tmeta{margin-top:3px;color:var(--mut)}
    #${BLOCK_ID} .sth-wait{display:inline-block;padding:1px 9px;border-radius:999px;font-weight:700;font-size:11.5px;color:#fff;background:rgba(239,68,68,.55);border:1px solid rgba(252,165,165,.8)}
    #${BLOCK_ID} .sth-cm-full{display:none;white-space:pre-wrap;word-break:break-word;margin-top:4px;padding:7px 9px;border-radius:8px;background:rgba(0,0,0,.2);color:var(--txt);font-size:12.5px;max-height:320px;overflow:auto}
    #${BLOCK_ID} .sth-cm-full a{color:#7dd3fc}
    #${BLOCK_ID} li.open .sth-cm-full{display:block}
    #${BLOCK_ID} li.open .sth-cm-short{display:none}
    #${BLOCK_ID} .sth-cm-toggle{margin-top:4px;border:1px solid var(--line);background:rgba(125,211,252,.1);color:#bae6fd;border-radius:8px;padding:2px 10px;font-size:12px;cursor:pointer}
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
    #${BLOCK_ID} .sth-i{width:17.2px;height:17.2px;flex:none;fill:none;stroke:var(--ic,currentColor);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    #${BLOCK_ID} .sth-load{display:flex;align-items:center;gap:8px;color:var(--mut);padding:8px 0 2px}
    #${BLOCK_ID} .sth-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(125,211,252,.25);border-top-color:#7dd3fc;animation:sthSpin .8s linear infinite}
    #${BLOCK_ID} .sth-err{color:#fca5a5;padding:6px 0 0;grid-column:1/-1}
    @keyframes sthSpin{to{transform:rotate(360deg)}}
        #${BLOCK_ID}{position:relative;z-index:5;margin:0}
    #${BLOCK_ID} .sth-hchips{display:inline-flex;gap:6px;flex-wrap:wrap;align-items:center}
    #${BLOCK_ID} .sth-hchip{font-size:11.5px;font-weight:700;padding:2px 10px;border-radius:999px;border:1px solid;white-space:nowrap}
    #${BLOCK_ID} .sth-hchip.bad{color:#fecaca;background:rgba(239,68,68,.3);border-color:rgba(252,165,165,.7)}
    #${BLOCK_ID} .sth-hchip.warn{color:#fde68a;background:rgba(251,191,36,.18);border-color:rgba(251,191,36,.55)}
    #${BLOCK_ID} .sth-hchip.info{color:#bae6fd;background:rgba(56,189,248,.16);border-color:rgba(56,189,248,.5)}
    #${BLOCK_ID} .sth-hchip.ok{color:#bbf7d0;background:rgba(34,197,94,.14);border-color:rgba(34,197,94,.4)}
    #${BLOCK_ID} .sth-tlink{color:inherit;text-decoration:none}
    #${BLOCK_ID} .sth-tlink:hover b{text-decoration:underline}
    #${BLOCK_ID}:not(.collapsed) .sth-body{max-height:60vh}
    #${BLOCK_ID} .sth-ov{position:fixed}
    /* ── Светлая тема (включается классом .light на блоке; настройка в «Настройках») ── */
    #${BLOCK_ID}.light{--bg:#f8fafc;--line:rgba(15,23,42,.14);--txt:#1e293b;--mut:#64748b;background:linear-gradient(180deg,#ffffff,#f1f5f9);box-shadow:inset 0 -1px 0 rgba(15,23,42,.06)}
    #${BLOCK_ID}.light .sth-title .sth-i{--ic:#0369a1}
    #${BLOCK_ID}.light .sth-id{background:rgba(15,23,42,.06)}
    #${BLOCK_ID}.light .sth-role.student{--ic:#15803d;color:#15803d;background:rgba(22,163,74,.1);border-color:rgba(22,163,74,.4)}
    #${BLOCK_ID}.light .sth-role.parent{--ic:#b45309;color:#b45309;background:rgba(245,158,11,.12);border-color:rgba(217,119,6,.45)}
    #${BLOCK_ID}.light .sth-role.corp{--ic:#7e22ce;color:#7e22ce;background:rgba(147,51,234,.1);border-color:rgba(147,51,234,.4)}
    #${BLOCK_ID}.light .sth-role.unknown{--ic:#64748b;color:#475569;background:rgba(100,116,139,.1);border-color:rgba(100,116,139,.35)}
    #${BLOCK_ID}.light .sth-crm{color:#0369a1;border-color:rgba(2,132,199,.45);background:rgba(2,132,199,.08)}
    #${BLOCK_ID}.light .sth-lnk b{color:#0369a1}
    #${BLOCK_ID}.light .sth-open{color:#0369a1!important;border-color:rgba(2,132,199,.5);background:rgba(2,132,199,.08)}
    #${BLOCK_ID}.light .sth-open:hover{background:rgba(2,132,199,.2);color:#075985!important}
    #${BLOCK_ID}.light .sth-btn{background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.08)}
    #${BLOCK_ID}.light .sth-btn:hover{background:#e2e8f0;color:#0f172a}
    #${BLOCK_ID}.light .sth-card:not(.km):not(.vac){background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.06)}
    #${BLOCK_ID}.light .sth-card.ok{--ic:#16a34a}
    #${BLOCK_ID}.light .sth-card.warn{--ic:#d97706}
    #${BLOCK_ID}.light .sth-card.bad{--ic:#dc2626}
    #${BLOCK_ID}.light .sth-card.mute{--ic:#94a3b8}
    #${BLOCK_ID}.light .sth-card.ok .sth-val{color:#15803d}
    #${BLOCK_ID}.light .sth-card.warn .sth-val{color:#b45309}
    #${BLOCK_ID}.light .sth-card.bad .sth-val{color:#b91c1c}
    #${BLOCK_ID}.light .sth-card.mute .sth-val{color:#64748b}
    #${BLOCK_ID}.light .sth-card.km,#${BLOCK_ID}.light .sth-card.vac{box-shadow:0 2px 10px rgba(15,23,42,.18)}
    #${BLOCK_ID}.light .sth-more>summary{color:#0369a1}
    #${BLOCK_ID}.light .sth-list b.neg{color:#b91c1c}
    #${BLOCK_ID}.light .sth-list b.zero{color:#64748b}
    #${BLOCK_ID}.light .sth-list b.pos{color:#15803d}
    #${BLOCK_ID}.light .sth-list b.warn{color:#b45309}
    #${BLOCK_ID}.light td.bal.neg{color:#b91c1c}
    #${BLOCK_ID}.light td.bal.warn{color:#b45309}
    #${BLOCK_ID}.light td.bal.pos{color:#15803d}
    #${BLOCK_ID}.light td.bal.zero{color:#64748b}
    #${BLOCK_ID}.light .sth-th .sth-i{--ic:#0369a1}
    #${BLOCK_ID}.light .sth-th .c-layers2{--ic:#2563eb}
    #${BLOCK_ID}.light .sth-th .c-wallet{--ic:#d97706}
    #${BLOCK_ID}.light .sth-th .c-shield{--ic:#e11d48}
    #${BLOCK_ID}.light .sth-th .c-teacher{--ic:#7c3aed}
    #${BLOCK_ID}.light .sth-th .c-tag{--ic:#db2777}
    #${BLOCK_ID}.light .sth-th .c-coins{--ic:#ca8a04}
    #${BLOCK_ID}.light .sth-th .c-spark{--ic:#7c3aed}
    #${BLOCK_ID}.light .sth-th .c-clock{--ic:#0284c7}
    #${BLOCK_ID}.light .sth-th .c-doc{--ic:#059669}
    #${BLOCK_ID}.light .sth-i{filter:drop-shadow(0 1px 1px rgba(15,23,42,.25))}
    #${BLOCK_ID}.light .sth-th .sth-i,#${BLOCK_ID}.light .sth-lbl .sth-i,#${BLOCK_ID}.light .sth-title .sth-i{filter:drop-shadow(0 1px 1px rgba(15,23,42,.3))}
    #${BLOCK_ID}.light .sth-lsvc{color:#334155}
    #${BLOCK_ID}.light .svc-name b{color:#334155}
    #${BLOCK_ID}.light .sth-svc{background:#f1f5f9;border-color:rgba(15,23,42,.14)}
    #${BLOCK_ID}.light .sth-svc i{color:#64748b}
    #${BLOCK_ID}.light .sth-svc b{color:#0f172a}
    #${BLOCK_ID}.light .sth-pill.ok{color:#15803d;background:rgba(22,163,74,.1);border-color:rgba(22,163,74,.35)}
    #${BLOCK_ID}.light .sth-pill.warn{color:#b45309;background:rgba(245,158,11,.12);border-color:rgba(217,119,6,.4)}
    #${BLOCK_ID}.light .sth-pill.bad{color:#b91c1c;background:rgba(220,38,38,.1);border-color:rgba(220,38,38,.4)}
    #${BLOCK_ID}.light .sth-pill.mute{color:#64748b;background:rgba(100,116,139,.1);border-color:rgba(100,116,139,.3)}
    #${BLOCK_ID}.light .sth-chip{background:rgba(100,116,139,.14);color:#475569}
    #${BLOCK_ID}.light .sth-chip.brand{background:rgba(2,132,199,.12);color:#0369a1}
    #${BLOCK_ID}.light .sth-chip.corp{background:rgba(147,51,234,.12);color:#7e22ce}
    #${BLOCK_ID}.light .sth-chip.bf{background:rgba(234,179,8,.2);color:#854d0e}
    #${BLOCK_ID}.light .sth-stg.ok{color:#15803d;background:rgba(22,163,74,.1);border-color:rgba(22,163,74,.4)}
    #${BLOCK_ID}.light .sth-stg.mute{color:#475569;background:rgba(100,116,139,.1);border-color:rgba(100,116,139,.35)}
    #${BLOCK_ID}.light .sth-stg.bad{color:#b91c1c;background:rgba(220,38,38,.12);border-color:rgba(220,38,38,.5)}
    #${BLOCK_ID}.light .sth-stg.warn{color:#92400e;background:rgba(245,158,11,.16);border-color:rgba(217,119,6,.5)}
    #${BLOCK_ID}.light .sth-hchip.bad{color:#b91c1c;background:rgba(220,38,38,.12);border-color:rgba(220,38,38,.5)}
    #${BLOCK_ID}.light .sth-hchip.warn{color:#92400e;background:rgba(245,158,11,.16);border-color:rgba(217,119,6,.5)}
    #${BLOCK_ID}.light .sth-hchip.info{color:#0369a1;background:rgba(2,132,199,.1);border-color:rgba(2,132,199,.45)}
    #${BLOCK_ID}.light .sth-hchip.ok{color:#15803d;background:rgba(22,163,74,.1);border-color:rgba(22,163,74,.4)}
    #${BLOCK_ID}.light .sth-apcopy{color:#6d28d9;border-color:rgba(124,58,237,.5);background:rgba(124,58,237,.08)}
    #${BLOCK_ID}.light .sth-apcopy:hover{background:rgba(124,58,237,.2)}
    #${BLOCK_ID}.light .sth-apcopy.done,#${BLOCK_ID}.light .sth-promoopen.done{background:rgba(22,163,74,.15);border-color:#16a34a;color:#15803d}
    #${BLOCK_ID}.light .sth-promoopen{color:#be185d;border-color:rgba(219,39,119,.5);background:rgba(219,39,119,.08)}
    #${BLOCK_ID}.light .sth-promoopen:hover{background:rgba(219,39,119,.2)}
    #${BLOCK_ID}.light .sth-float-btn,#${BLOCK_ID}.light .sth-copy{color:#0369a1;background:rgba(2,132,199,.08)}
    #${BLOCK_ID}.light .sth-copy.done{background:rgba(22,163,74,.15);color:#15803d}
    #${BLOCK_ID}.light .sth-tplbtn{color:#92400e;border-color:rgba(217,119,6,.5);background:rgba(245,158,11,.14)}
    #${BLOCK_ID}.light .sth-tbrand button{background:#fff}
    #${BLOCK_ID}.light .sth-tbrand button.on{background:#2563eb;color:#fff}
    #${BLOCK_ID}.light .sth-tpl{background:#fff}
    #${BLOCK_ID}.light .sth-tpl-h a{color:#0369a1}
    #${BLOCK_ID}.light .sth-tpl-toggle{background:rgba(15,23,42,.04)}
    #${BLOCK_ID}.light .sth-tpl.open .sth-tpl-toggle{background:rgba(15,23,42,.12);color:var(--txt)}
    #${BLOCK_ID}.light .sth-tpl-say,#${BLOCK_ID}.light .sth-tplbox .sth-tpl{background:rgba(15,23,42,.05)}
    #${BLOCK_ID}.light .sth-tplbox.tpl-hot>details>summary{color:#92400e}
    #${BLOCK_ID}.light .sth-tplbox.tpl-km>details>summary,#${BLOCK_ID}.light .sth-tplbox.tpl-km .sth-tpl-h b{color:#991b1b}
    #${BLOCK_ID}.light .sth-evbtn{color:#92400e;border-color:rgba(217,119,6,.55);background:rgba(245,158,11,.16)}
    #${BLOCK_ID}.light .sth-evbtn:hover{background:rgba(245,158,11,.3)}
    #${BLOCK_ID}.light .sth-evbtn.done{color:#15803d;background:rgba(22,163,74,.15);border-color:rgba(22,163,74,.5)}
    #${BLOCK_ID}.light .sth-err{color:#b91c1c}
    #${BLOCK_ID}.light .sth-spin{border-color:rgba(2,132,199,.25);border-top-color:#0284c7}
    #${BLOCK_ID}.light li.sth-task{background:linear-gradient(100deg,rgba(var(--g),.16),#fff 45%),#fff}
    #${BLOCK_ID}.light li.sth-task,#${BLOCK_ID}.light li.sth-task b{color:#0f172a}
    #${BLOCK_ID}.light li.sth-task .sth-tmeta,#${BLOCK_ID}.light li.sth-task .sth-cm-short{color:#475569 !important}
    #${BLOCK_ID}.light li.sth-task .sth-cm-toggle{color:#0f172a;background:rgba(var(--g),.18)}
    #${BLOCK_ID}.light .sth-cm-full{background:rgba(15,23,42,.05)}
    #${BLOCK_ID}.light .sth-cm-full a{color:#0369a1}
    #${BLOCK_ID}.light .sth-cm-toggle{color:#0369a1;background:rgba(2,132,199,.08)}
    #${BLOCK_ID}.light .sth-ov{background:rgba(15,23,42,.35)}
    #${BLOCK_ID}.light .sth-ov-panel{background:#fff;border-color:rgba(15,23,42,.18);box-shadow:0 20px 60px rgba(15,23,42,.3)}
    #${BLOCK_ID}.light .sth-ov-h .sth-i{--ic:#d97706}
    #${BLOCK_ID}.light .sth-ov-close{background:rgba(15,23,42,.05)}
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

    async function loadService(studentId, base, light = false) {
        const sid = base.id;
        // Краткий режим (ТП): промокод и отпуск не нужны — не запрашиваем
        const skip = Promise.resolve(null);
        const [gen, promo, credit, vac, ap] = (await Promise.allSettled([
            getJson(SOURCES.general(studentId, sid)),
            light ? skip : getJson(SOURCES.promocode(sid)),
            getJson(SOURCES.credit(sid)),
            light ? skip : getJson(SOURCES.vacation(sid)),
            light ? skip : getJson(SOURCES.autoPlan(sid))
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
        // data — массив рассрочек [{uuid, createdAt, stages:[{index, status, paymentDate, position}]}] (на случай одиночного объекта — обернём)
        const creditRaw = credit.ok ? (credit.v?.data ?? credit.v) : null;
        const creditItems = (Array.isArray(creditRaw) ? creditRaw : (creditRaw && typeof creditRaw === 'object' && (creditRaw.uuid || creditRaw.stages) ? [creditRaw] : []))
            .map((c) => ({ uuid: c.uuid || '', stages: Array.isArray(c.stages) ? c.stages : [] }));

        return {
            id: sid,
            key: src.serviceTypeKey || '',
            title: src.serviceTypeKey || '—',
            noTeacherNeeded: NO_TEACHER_RE.test(src.serviceTypeKey || ''),
            stage: src.stage,
            // Автоподбор (АП): доступен ли, ссылка в кабинет подбора и причины недоступности; сбой запроса = «неизвестно»
            ap: ap.ok ? (ap.v?.data ? { avail: ap.v.data.isAvailable === true, link: String(ap.v.data.linkToTas || ''), reasons: Array.isArray(ap.v.data.reasons) ? ap.v.data.reasons.map((r) => String(r).replace(/^\d+:\s*/, '')) : [] } : { unknown: true }) : { unknown: true },
            // Первая оплата: true/false, либо undefined, если поля нет
            firstPaid: typeof src.hasFirstPayment === 'boolean' ? src.hasFirstPayment : (typeof src.isFirstPaymentReceived === 'boolean' ? src.isFirstPaymentReceived : undefined),
            balance: toNum(src.balance),
            km, kmReason, corp, hasTeacher,
            teacherName: personName(src.teacher),
            tempName: personName(src.temporaryTeacher),
            replacement: src.isTeacherReplacementInProgress === true,
            vacation: vac.ok ? vacationInfo(vac.v, src.stage) : { unknown: true },
            promo: promo.ok ? (pd ? { name: promoName, expiredAt: pd.expiredAt, expired: promoExpired, offer: pd.promocodeOffer?.offerId ?? null, bf: /черн\S*\s+пятниц/i.test(promoName.toLowerCase().replace(/ё/g, 'е')) } : null) : { unknown: true },
            credit: credit.ok ? (creditItems.length ? { items: creditItems } : null) : { unknown: true }
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
                // Последний урок: прошедший со статусом «Прошёл» (success) или «Пропущен студентом» (missed_by_student); по странице 0 истории
                const done = h.filter((l) => ts(l) <= now && !isNaN(ts(l)) && (l.status === 'success' || l.status === 'missed_by_student')).sort((a, b) => ts(b) - ts(a));
                x.lessons.last = done[0]?.startedAt || null;
                x.lessons.lastStatus = done[0]?.status || null;
                x.lessons.missed2 = past.length >= 2 && MISS.includes(past[0].status) && MISS.includes(past[1].status);
            }
        }
    }

    const mskDay = (t) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'Europe/Moscow' });
    function todayLessons(fut) {
        const day = mskDay(Date.now());
        return fut.filter((l) => !isNaN(ts(l)) && mskDay(ts(l)) === day)
            .sort((a, b) => ts(a) - ts(b))
            .map((l) => ({
                at: l.startedAt,
                type: l.lessonType,
                sid: String(l.educationService?.id ?? l.educationServiceId ?? ''),
                key: l.educationService?.serviceTypeKey || '',
                teacher: [l.teacher?.general?.name, l.teacher?.general?.surname].filter(Boolean).join(' ')
            }));
    }

    // Полных лет по дате рождения (YYYY-MM-DD); null — даты нет или она некорректна
    function ageOf(bd) {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(bd || ''));
        if (!m) return null;
        const now = new Date();
        let a = now.getFullYear() - +m[1];
        if (now.getMonth() + 1 < +m[2] || (now.getMonth() + 1 === +m[2] && now.getDate() < +m[3])) a--;
        return a >= 0 && a < 120 ? a : null;
    }
    // «Нужно взросление»: КЛП с 9 полных лет; КЛП и junior с 18 полных лет
    const KLP_MAX_AGE = 9, ADULT_AGE = 18;
    function growUp(d) {
        if (!d || d.age == null || !d.services || shared?.kind === 'tp') return []; // только не ТП
        return d.services.filter((x) => {
            const k = String(x.key || '').toLowerCase();
            const klp = /(^|_)klp(_|$)/.test(k), jun = /(^|_)junior(_|$)/.test(k);
            return (klp && d.age >= KLP_MAX_AGE) || ((klp || jun) && d.age >= ADULT_AGE);
        });
    }
    // Кнопка: скопировать ID оффера промокода и открыть страницу проверки промокодов (оператор вставит ID в поле «Оффер»)
    const promoBtn = (offer) => offer ? `<button type="button" class="sth-promoopen" data-offer="${esc(offer)}" title="Скопировать ID оффера (${esc(offer)}) и открыть проверку промокодов">${ico('ext')}Оффер</button>` : '';
    // Рассрочка: этапы (оплачен / предстоит / просрочен, даты, суммы) и ссылка на саму рассрочку по UUID
    const fmtMoney = (n, cur) => `${Number(n).toLocaleString('ru-RU')} ${cur === 'RUB' ? '₽' : (cur || '')}`.trim();
    // Этап просрочен: не оплачен, а дата платежа по Москве уже прошла
    const mskToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Moscow' });
    const stageLate = (s, today = mskToday()) => s.status !== 'paid' && !/cancel|refund/i.test(String(s.status || '')) && !!s.paymentDate && String(s.paymentDate).slice(0, 10) < today;
    const creditLate = (x) => (x.credit?.items || []).some((it) => (it.stages || []).some((s) => stageLate(s)));
    function creditDetail(x) {
        const items = x.credit?.items || [];
        if (!items.length) return '';
        const today = mskToday();
        return items.map((it) => {
            const st = (it.stages || []).slice().sort((a, b) => (a.index || 0) - (b.index || 0));
            const paid = st.filter((s) => s.status === 'paid').length;
            const chips = st.map((s) => {
                const isPaid = s.status === 'paid';
                const late = stageLate(s, today);
                const cls = isPaid ? 'ok' : late ? 'bad' : s.status === 'upcoming' ? 'mute' : 'warn';
                const label = isPaid ? 'оплачен' : late ? 'просрочен (дата платежа прошла)' : s.status === 'upcoming' ? 'предстоит' : String(s.status || '');
                const pos = s.position || {};
                const tip = `Этап ${s.index}: ${label}${s.paymentDate ? ', ' + fmtDate(s.paymentDate) : ''}${pos.count ? ' · ' + pos.count + ' ур.' : ''}${pos.price ? ' · ' + fmtMoney(pos.price, pos.currency) : ''}`;
                return `<span class="sth-stg ${cls}" title="${esc(tip)}">${isPaid ? ico('check') : ''}${esc(fmtDate(s.paymentDate))}${pos.price ? ' · ' + esc(fmtMoney(pos.price, pos.currency)) : ''}</span>`;
            }).join('');
            const link = it.uuid ? `<a class="sth-open" href="https://billing-api.skyeng.ru/installments/view/${encodeURIComponent(it.uuid)}" target="_blank" rel="noopener" title="Открыть рассрочку">${ico('ext')}Рассрочка ${paid}/${st.length}</a>` : '';
            return `<div class="sth-inst">${link}<span class="sth-stgs">${chips}</span></div>`;
        }).join('');
    }

    function growCard(d) {
        const g = growUp(d);
        if (!g.length) return '';
        return card('warn', 'info', 'Нужно взросление', `Возраст: ${d.age}`, g.map((x) => `#${esc(x.id)} ${esc(x.key)}`).join('<br>'));
    }

    async function loadAll(id, mode = 'full') {
        const light = mode === 'tp';
        const extra = light; // уроки сегодня и задачи ТП — только в кратком режиме
        const personP = getJson(SOURCES.person(id)).catch(() => null);
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
        const services = await Promise.all(take.map((b) => loadService(id, b, light)));
        // Уроки по ученику: история (прошедшие) и расписание (будущие). Сбой запроса = «неизвестно» (null)
        const [hr, fr] = await Promise.allSettled([getJson(SOURCES.history(id)), getJson(SOURCES.future(id))]);
        const arr = (r) => r.status === 'fulfilled' ? (Array.isArray(r.value?.data) ? r.value.data : []) : null;
        const futArr = arr(fr);
        applyLessons(services, arr(hr), futArr);
        // Только для ТП: уроки на сегодня и задачи ТП Исход / 2ЛТП
        let today = null, tasks = null;
        if (extra) {
            if (futArr) {
                today = todayLessons(futArr);
                // Услуга и преподаватель: из урока, а если там пусто — из списка услуг ученика
                for (const l of today) {
                    const sv = services.find((x) => String(x.id) === l.sid);
                    if (sv) {
                        l.key = l.key || sv.key;
                        l.teacher = l.teacher || sv.teacherName || (sv.tempName ? sv.tempName + ' (врем.)' : '');
                    }
                }
            }
            try {
                const tr = await getJson(SOURCES.tasks(id));
                tasks = Array.isArray(tr?.data) ? tr.data : [];
            } catch { tasks = null; }
        }
        const person = await personP;
        const age = ageOf(person?.data?.birthday);
        return {
            today, tasks, age,
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

    const LESSON_TYPES = { regular: 'Регулярный', single: 'Одиночный', trial: 'Пробный' };
    const hhmm = (iso) => new Date(iso).toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
    function lessonsCard(d) {
        if (!d.today) return card('wide mute', 'info', 'Уроки сегодня', 'Нет данных');
        if (!d.today.length) return card('wide ok', 'info', 'Уроки сегодня', 'Нет');
        const rows = d.today.map((l) => {
            const svc = l.sid || l.key ? `${l.sid ? '#' + l.sid + ' ' : ''}${l.key || ''}`.trim() : 'услуга не указана';
            return `<li><span><b>${esc(hhmm(l.at))}</b> · ${esc(LESSON_TYPES[l.type] || l.type || '')} · <b class="sth-lsvc">${esc(svc)}</b></span><b>${esc(l.teacher || 'без преподавателя')}</b></li>`;
        });
        return card('wide warn', 'info', 'Уроки сегодня (МСК)', `${d.today.length} шт.`, '', `<ul class="sth-list">${rows.join('')}</ul>`);
    }
    const TASK_GROUPS = /technical_support_(second_line|outgoing)/i;
    const TASK_GROUP_TITLES = /исход|2-?я\s+линия|2\s*лтп/i;
    const TASK_DONE = /^(completed|complete|done|closed|canceled|cancelled|resolved|finished)$/i;
    // Текст комментария с кликабельными ссылками (экранирование до разметки)
    const linkify = (t) => esc(t).replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
    const groupKind = (t) => {
        const n = t.operatorGroup?.name || '', ti = t.operatorGroup?.title || '';
        if (/outgoing/i.test(n) || /исход/i.test(ti)) return 'out';
        if (/second_line/i.test(n) || /2-?я\s+линия|2\s*лтп/i.test(ti)) return 'l2';
        return '';
    };
    function tasksCard(d) {
        if (!d.tasks) return card('wide mute', 'tag', 'Задачи ТП Исход / 2ЛТП', 'Нет данных');
        const mine = d.tasks.filter((t) => (TASK_GROUPS.test(t.operatorGroup?.name || '') || TASK_GROUP_TITLES.test(t.operatorGroup?.title || '')) && !TASK_DONE.test(t.status || ''));
        if (!mine.length) return card('wide ok', 'tag', 'Задачи ТП Исход / 2ЛТП', 'Нет');
        const waiting = mine.filter((t) => t.status === 'waiting').length;
        const rows = mine.map((t) => {
            const when = t.activeOn ? `${fmtDate(t.activeOn)} ${hhmm(t.activeOn)}` : '';
            const raw = String(t.extra?.comment || '').trim();
            const cm = raw.replace(/\s+/g, ' ');
            const long = cm.length > 140 || raw.includes('\n');
            return `<li class="sth-task ${groupKind(t)}" style="display:block"><div><span class="sth-grp ${groupKind(t)}">${groupKind(t) === 'out' ? ico('phoneOut') : groupKind(t) === 'l2' ? ico('layers2') : ''}${esc(t.operatorGroup?.title || t.operatorGroup?.name || '')}</span> <a class="sth-tlink" href="https://crm2.skyeng.ru/persons/${encodeURIComponent(t.userId || state.id || '')}/customer-support/task/${encodeURIComponent(t.id)}" target="_blank" rel="noopener" title="Открыть задачу в CRM"><b>#${esc(t.id)}</b></a> · ${esc(t.type?.label || t.type?.name || '')}</div>
                <div class="sth-tmeta">${t.status === 'waiting' ? '<span class="sth-wait">не взята в работу</span>' : esc(t.status || '')}${t.operator?.name ? ' · ' + esc(t.operator.name) : ''}${when ? ' · на ' + esc(when) : ''}${t.extra?.requestSubtopicLabel ? ' · ' + esc(t.extra.requestSubtopicLabel) : ''}</div>
                ${cm ? `<div class="sth-cm-short" style="color:var(--mut)">${esc(cm.length > 140 ? cm.slice(0, 138) + '…' : cm)}</div>
                    <div class="sth-cm-full">${linkify(raw)}</div>
                    ${long ? '<button type="button" class="sth-cm-toggle" data-more="Показать полностью" data-less="Свернуть">Показать полностью</button>' : ''}` : ''}</li>`;
        });
        return card('wide ' + (waiting ? 'bad' : 'warn'), 'tag', 'Задачи ТП Исход / 2ЛТП', waiting ? `Не взято в работу: ${waiting} из ${mine.length}` : `Активных: ${mine.length}`, '', `<ul class="sth-list">${rows.join('')}</ul>`);
    }

    function renderBody() {
        if (state.loading || state.pending) return `<div class="sth-load" style="grid-column:1/-1"><i class="sth-spin"></i>Загружаю данные ученика…</div>`;
        if (state.error) return `<div class="sth-err">Не удалось загрузить: ${esc(state.error)}</div>`;
        const d = state.data;
        if (!d) return '';
        const sv = d.services;
        if (!sv.length) {
            return card('mute', 'info', 'Услуги', 'Рабочих услуг нет', `всего: ${d.totalCount}, закрытых (lost / некорректных): ${d.closedCount}`)
                + (state.mode === 'tp' ? lessonsCard(d) + tasksCard(d) : '');
        }
        const unk = (x) => x && x.unknown;
        const foot = `всего услуг: ${d.totalCount}${d.closedCount ? `, закрытых: ${d.closedCount}` : ''}${d.skipped ? `, не показано: ${d.skipped}` : ''}${d.foreignCount ? `, чужих (оплачивает): ${d.foreignCount}` : ''}`;

        // 1. Кризисное сопровождение (сводка; по каждой услуге — в таблице)
        const km = sv.filter((x) => x.km);
        const kmCard = km.length
            ? card('bad km', 'shield', 'Кризисное сопровождение', `Да — на КМ: ${km.length} из ${sv.length}`, km.map((x) => `#${esc(x.id)}: ${esc(x.kmReason)}`).join('<br>'))
            : card('ok', 'shield', 'Кризисное сопровождение', 'Нет');

        // 2. Отпуск / каникулы
        const vac = sv.filter((x) => !unk(x.vacation) && x.vacation.active);
        const vacFut = sv.filter((x) => !unk(x.vacation) && x.vacation.future);
        const vacUnknown = sv.some((x) => unk(x.vacation));
        let vacCard;
        if (vac.length) {
            const v = vac[0].vacation;
            vacCard = card('warn vac', 'plane', 'Ученик в отпуске', esc(v.title) + (v.to ? ` до ${fmtDate(v.to)}` : ''), vac.map((x) => `#${esc(x.id)}`).join(', '));
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
            ? (state.mode === 'tp'
                ? card((cr.some(creditLate) ? 'bad' : 'warn') + ' wide', 'coins', 'Рассрочка', cr.some(creditLate) ? 'Есть просроченный этап' : 'Активна', '', cr.map((x) => `<div class="sth-sub" style="display:block"><b>#${esc(x.id)}</b>${creditDetail(x)}</div>`).join(''))
                : card(cr.some(creditLate) ? 'bad' : 'warn', 'coins', 'Рассрочка', cr.some(creditLate) ? 'Просрочка' : 'Активна', cr.map((x) => `#${esc(x.id)}`).join(', ')))
            : card(crUnknown ? 'mute' : 'ok', 'coins', 'Рассрочка', crUnknown ? 'Нет данных' : 'Нет активной');

        if (state.mode === 'tp') return [kmCard, crCard, lessonsCard(d), tasksCard(d)].join('');

        // 4. Промокод
        const pr = sv.filter((x) => !unk(x.promo) && x.promo);
        const prUnknown = sv.some((x) => unk(x.promo));
        let prCard;
        if (pr.length) {
            const first = pr[0].promo;
            prCard = card(pr.some((x) => !x.promo.expired) ? 'ok' : 'warn', 'tag', 'Промокод',
                `<span class="sth-pv">${pr.some((x) => x.promo.bf) ? 'Чёрная пятница' : (first.name.length > 28
                    ? `<span class="sth-mq" title="${esc(first.name)}"><span class="sth-mqi">${esc(first.name)}</span></span>` : esc(first.name))}</span>`);
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
        // Для не-ТП: сверху услуги со свежим последним уроком, без уроков — внизу (порядок остальных сохраняется)
        if (shared?.kind !== 'tp') shown.sort((x, y) => (Date.parse(y.lessons?.last) || 0) - (Date.parse(x.lessons?.last) || 0));
        const hiddenN = sv.length - shown.length;
        const evAll = buildTemplates(d);
        state.tplEv = evAll;
        const evBr = d.brand === 'Skysmart' ? 'skysmart' : 'skyeng';
        const showLast = shared?.kind !== 'tp'; // колонка «Последний урок» — для всех отделов, кроме ТП
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
            if (x.promo && !unk(x.promo) && x.promo.offer) pCell += promoBtn(x.promo.offer);
            let cCell = '<span class="sth-pill mute">—</span>';
            if (unk(x.credit)) cCell = '<span class="sth-pill mute">?</span>';
            else if (x.credit) cCell = (creditLate(x) ? '<span class="sth-pill bad" title="Есть просроченный этап">просрочка</span>' : '<span class="sth-pill warn">активна</span>') + creditDetail(x);
            let apCell = '<span class="sth-pill mute" title="Не удалось проверить автоподбор">?</span>';
            if (x.ap && !x.ap.unknown) {
                apCell = x.ap.avail
                    ? `<span class="sth-pill ok" title="Автоподбор доступен">${ico('check')}доступен</span>${x.ap.link ? `<button type="button" class="sth-apcopy" data-link="${esc(x.ap.link)}" title="Скопировать ссылку на автоподбор">${ico('copy')}</button>` : ''}`
                    : `<span class="sth-pill warn sth-aphelp" title="${esc(x.ap.reasons.length ? 'Автоподбор недоступен: ' + x.ap.reasons.join('; ') : 'Автоподбор недоступен')}">${ico('help')}недоступен</span>`;
            }
            return `<tr>
                <td class="svc"><div class="svc-name" title="${esc(x.title)}"><a class="sth-lnk" href="https://crm2.skyeng.ru/persons/${encodeURIComponent(state.id || '')}/services/${encodeURIComponent(x.id)}" target="_blank" rel="noopener" title="Открыть услугу в CRM"><b>#${esc(x.id)}</b></a> ${esc(x.title)}<a class="sth-open" href="https://crm2.skyeng.ru/persons/${encodeURIComponent(state.id || '')}/services/${encodeURIComponent(x.id)}" target="_blank" rel="noopener" title="Открыть услугу в новой вкладке">${ico('ext')}Услуга</a></div>
                    <div class="svc-tags">${chip(brandOf([x.key]), 'brand')}${cat ? chip(cat) : ''}${x.corp ? chip('корп', 'corp') : ''}${x.stage ? chip(x.stage) : ''}</div></td>
                ${cell(x.balance === null ? '—' : esc(x.balance) + (x.balance === 0 && !unk(x.credit) && x.credit ? ' · рассрочка' : ''), 'bal ' + bCls)}
                ${cell(kmCell)}${cell(tCell)}${cell(vCell)}${cell(pCell)}${cell(cCell, 'cr')}${cell(apCell)}${showLast ? cell(x.lessons?.last ? `<span class="sth-pill ${new Date(x.lessons.last).getFullYear() < new Date().getFullYear() ? 'mute' : x.lessons.lastStatus === 'success' ? 'ok' : 'warn'}" title="Последний урок: ${x.lessons.lastStatus === 'success' ? 'проведён' : 'пропущен студентом'} (МСК)">${fmtDate(x.lessons.last)} ${esc(hhmm(x.lessons.last))} · ${x.lessons.lastStatus === 'success' ? 'Прошёл' : 'Пропущен студентом'}</span>` : '<span class="sth-pill mute">—</span>') : ''}${cell(evCell, 'ev')}
            </tr>`;
        }).join('');
        const table = `<div class="sth-card wide mute"><details class="sth-fold" data-k="tblOpen"${state.tblOpen !== false ? ' open' : ''}><summary class="sth-lbl">${ico('info')}По каждой рабочей услуге (${esc(foot)}${hiddenN ? esc(', скрыто (life/self/talks): ' + hiddenN) : ''})</summary>
            <div class="sth-tablewrap"><table class="sth-table"><thead><tr><th><span class="sth-th">${ico('layers2','c-layers2')}Услуга</span></th><th><span class="sth-th">${ico('wallet','c-wallet')}Баланс</span></th><th><span class="sth-th">${ico('shield','c-shield')}КМ</span></th><th><span class="sth-th">${ico('teacher','c-teacher')}Преподаватель</span></th><th><span class="sth-th">${ico('plane')}Отпуск</span></th><th><span class="sth-th">${ico('tag','c-tag')}Промокод</span></th><th><span class="sth-th">${ico('coins','c-coins')}Рассрочка</span></th><th><span class="sth-th">${ico('spark','c-spark')}Автоподбор</span></th>${showLast ? `<th><span class="sth-th">${ico('clock','c-clock')}Последний урок</span></th>` : ''}<th><span class="sth-th">${ico('doc','c-doc')}Шаблоны</span></th></tr></thead><tbody>${rows}</tbody></table></div></details></div>`;

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
            if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(fallback); else fallback();
        } catch { fallback(); }
    }

    // Плашки для свёрнутой полосы: главное видно без раскрытия
    function headChips(d) {
        if (!d || !d.services) return '';
        const out = [];
        const sv = d.services;
        const gu = growUp(d);
        if (gu.length) out.push(`<span class="sth-hchip warn" title="Возраст ${d.age}: услуги ${esc(gu.map((x) => x.key).join(', '))}">Нужно взросление</span>`);
        const km = sv.filter((x) => x.km);
        if (km.length) out.push(`<span class="sth-hchip bad" title="Кризисное сопровождение">КМ · ${km.length}</span>`);
        const cr = sv.filter((x) => x.credit && !x.credit.unknown);
        if (cr.length) out.push(cr.some(creditLate) ? '<span class="sth-hchip bad" title="Есть просроченный этап рассрочки">Рассрочка: просрочка</span>' : '<span class="sth-hchip warn" title="Есть активная рассрочка">Рассрочка</span>');
        const vac = sv.filter((x) => x.vacation && !x.vacation.unknown && x.vacation.active);
        if (vac.length) out.push(`<span class="sth-hchip warn" title="Ученик в отпуске">${esc(vac[0].vacation.title)}</span>`);
        if (d.today) out.push(`<span class="sth-hchip ${d.today.length ? 'info' : 'ok'}" title="Уроки сегодня (МСК)">Уроки сегодня: ${d.today.length}</span>`);
        if (d.tasks) {
            const mine = d.tasks.filter((t) => (TASK_GROUPS.test(t.operatorGroup?.name || '') || TASK_GROUP_TITLES.test(t.operatorGroup?.title || '')) && !TASK_DONE.test(t.status || ''));
            const wait = mine.filter((t) => t.status === 'waiting').length;
            if (mine.length) out.push(`<span class="sth-hchip ${wait ? 'bad' : 'warn'}" title="Задачи ТП Исход / 2ЛТП${wait ? ': не взято в работу ' + wait : ''}">Задачи ТП: ${mine.length}</span>`);
            else out.push('<span class="sth-hchip ok" title="Задачи ТП Исход / 2ЛТП">Задач ТП нет</span>');
        }
        return out.length ? `<span class="sth-hchips">${out.join('')}</span>` : '';
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
                const cmt = e.target.closest('.sth-cm-toggle');
                if (cmt) {
                    const li = cmt.closest('li'); li.classList.toggle('open');
                    cmt.textContent = li.classList.contains('open') ? cmt.dataset.less : cmt.dataset.more;
                    return;
                }
                if (e.target.closest('a')) return; // клик по ссылке ничего не сворачивает
                if (e.target.closest('.sth-refresh')) { refresh(true); return; }
                if (e.target.closest('.sth-float-btn, .sth-tplbtn')) { e.stopPropagation(); state.tplFloat = true; renderBlock(doc); return; }
                if (e.target.closest('.sth-ov-close') || e.target.classList.contains('sth-ov')) { state.tplFloat = false; renderBlock(doc); return; }
                const po = e.target.closest('.sth-promoopen');
                if (po) {
                    copyText(doc, po.dataset.offer || '');
                    try { window.open('https://billing-marketing.skyeng.ru/promocode/list', '_blank', 'noopener'); } catch { /* ignore */ }
                    po.classList.add('done'); setTimeout(() => po.classList.remove('done'), 1500);
                    return;
                }
                const apc = e.target.closest('.sth-apcopy');
                if (apc) {
                    copyText(doc, apc.dataset.link || '');
                    apc.classList.add('done'); setTimeout(() => apc.classList.remove('done'), 1200);
                    return;
                }
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
                    state.collapsed = !state.collapsed; state.userToggled = true;
                    try { localStorage.setItem(COLLAPSE_KEY, state.collapsed ? '0' : '1'); } catch { /* ignore */ }
                    block.classList.toggle('collapsed', state.collapsed);
                }
            });
        }
        if (block.previousElementSibling !== header || !block.isConnected) {
            // Не чаще раза в 1.5 с: если Angular перестраивает разметку, не устраиваем «перетягивание» узла
            const now = Date.now();
            if (block.isConnected && now - (block._movedAt || 0) < 1500) return;
            block._movedAt = now;
            try { header.insertAdjacentElement('afterend', block); } catch { return; }
        }
        // Автосворачивание (пока пользователь не переключил вручную). Сама страница профиля: для всех раскрыто; остальные страницы пользователя (семья, услуги…): свёрнуто.
        // ТП: везде свёрнуто и раскрывается само, только если есть активная задача ТП Исход / 2ЛТП или КМ.
        const pk = /^\/persons\/\d+\/?$/.test(location.pathname) ? 'profile' : 'sub';
        if (state.pageKind !== pk) { state.pageKind = pk; state.userToggled = false; }
        if (!state.userToggled) {
            if (shared?.kind === 'tp') {
                const d = state.data;
                const tasks = (d?.tasks || []).filter((t) => (TASK_GROUPS.test(t.operatorGroup?.name || '') || TASK_GROUP_TITLES.test(t.operatorGroup?.title || '')) && !TASK_DONE.test(t.status || ''));
                state.collapsed = !(tasks.length || d?.services?.some((x) => x.km));
            } else state.collapsed = pk !== 'profile';
        }
        block.classList.toggle('collapsed', state.collapsed);
        block.classList.toggle('tp', state.mode === 'tp');
        block.classList.toggle('light', shared?.theme === 'light'); // краткий вид (ТП): карточки в несколько столбцов

        const role = roleLabel(state.role);
        const roleIco = role.kind === 'parent' ? 'users' : 'student';
        const html = `
            <div class="sth-head">
                <span class="sth-title">${ico('info')}Вспомогательная информация по У</span>
                <span class="sth-id" title="ID пользователя">${esc(state.id || '—')}</span>
                ${state.role ? `<span class="sth-role ${role.kind}">${ico(roleIco)}${esc(role.text)}</span>` : ''}
                ${state.data?.services?.some((x) => x.corp) ? `<span class="sth-role corp" title="Есть корпоративная услуга: general.corporate или paymentAgreement.companyContract">${ico('tag')}Корпоративный</span>` : ''}
                ${headChips(state.data)}
                <span class="sth-spacer"></span>
                ${state.data && state.data.services?.length ? `<button class="sth-btn sth-tplbtn" type="button" title="Шаблоны для ученика (чат и почта)">${ico('tag')}Шаблоны</button>` : ''}
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
        entry.mode = curMode;
        entry.loading = true; entry.pending = false; entry.error = null;
        if (force) entry.data = null;
        renderBlock(doc);
        try {
            const data = await loadAll(entry.id, entry.mode);
            if (token !== entry.reqToken) return; // запись сброшена/перезапущена, пока грузили
            entry.data = data;
        } catch (e) {
            if (token !== entry.reqToken) return;
            entry.error = e?.message || 'ошибка запроса';
        } finally {
            if (token === entry.reqToken) {
                entry.loading = false;
                const d = getFrameDoc();
                if (d && state === entry) renderBlock(d);
            }
        }
    }

    function tick() {
        try { tickInner(); } catch (e) { console.warn('[CRMStudentHelper]', e); }
    }

    function tickInner() {
        const doc = document;
        const block = doc.getElementById(BLOCK_ID);
        const id = personId();
        const header = doc.querySelector(HEADER_SEL);
        // Не страница пользователя или шапка ещё не нарисована — полосы нет
        if (!id || !header) { block?.remove(); return; }
        if (!claimLock()) { block?.remove(); return; } // полосу уже рисует соседнее расширение

        // Только ученик и родитель; у преподавателя и при неизвестной роли полосы нет
        const role = roleFor(id);
        if (role !== 'student' && role !== 'parent') { block?.remove(); return; }
        syncShared();
        if (!shared || shared.mode === 'off') { block?.remove(); return; }
        block?.classList.toggle('light', shared.theme === 'light');
        curMode = shared?.mode === 'tp' ? 'tp' : 'full';
        ensureStyle(doc);
        if (state.id && state.mode && state.mode !== curMode && !state.loading) { state.id = null; state.data = null; state.error = null; state.reqToken++; state.pending = true; }

        // Другой пользователь: берём его запись из кеша (или новую)
        if (id !== currentKey) {
            currentKey = id;
            state = getEntry(id);
            stab = { sig: '', n: 0 };
            if (!state.id) state.pending = true;
            else if (state.error && !state.loading) { refresh(); return; }
            renderBlock(doc);
        }

        // Роль на странице может ещё показывать предыдущего пользователя — верим после нескольких одинаковых тиков
        const sig = id + '|' + role;
        if (stab.sig === sig) stab.n++; else stab = { sig, n: 1 };
        const stable = stab.n >= STABLE_TICKS;

        if (!state.id || state.id !== id) {
            if (!stable) { if (!block) renderBlock(doc); return; }
            state.id = id; state.role = role; state.data = null; state.error = null; state.reqToken++;
            refresh();
            return;
        }
        // Переход между профилем и другими страницами пользователя без перезагрузки (Angular) — применяем правило сворачивания заново
        const curPk = /^\/persons\/\d+\/?$/.test(location.pathname) ? 'profile' : 'sub';
        if (state.pageKind && state.pageKind !== curPk) { renderBlock(doc); return; }
        if (role !== state.role) { state.role = role; renderBlock(doc); return; }
        // Angular мог пересоздать шапку и унести полосу — возвращаем на место (из кеша, без запросов)
        if (!block || block.previousElementSibling !== header) renderBlock(doc);
    }

    setInterval(tick, TICK_MS);
    tick();
})();
