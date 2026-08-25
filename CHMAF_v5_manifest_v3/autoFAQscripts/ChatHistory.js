// --- ПРЕМИАЛЬНЫЕ СТИЛИ GLASSMORPHISM ---
const afgStyles = document.createElement('style');
afgStyles.textContent = `
    /* Глобальные CSS переменные */
    :root {
        --afg-dark-bg: linear-gradient(135deg, rgba(20, 26, 48, 0.95) 0%, rgba(14, 20, 40, 0.97) 100%);
        --afg-dark-border: rgba(255, 255, 255, 0.08);
        --afg-accent: #22d3ee;
        --afg-accent-soft: rgba(34, 211, 238, 0.14);
        --afg-accent-glow: rgba(34, 211, 238, 0.35);
        --afg-hover: rgba(255, 255, 255, 0.06);
        --afg-cyan: #22d3ee;
        --afg-green: #34d399;
        --afg-amber: #fbbf24;
        --afg-text: #e2e8f0;
        --afg-text-secondary: #94a3b8;
        --afg-text-muted: #64748b;
    }

    /* Основной контейнер панели */
    .afg-panel {
        position: fixed; top: 0; right: 0; width: 480px; height: 100vh;
        z-index: 1000000; display: flex; flex-direction: column;
        backdrop-filter: blur(40px) saturate(200%) brightness(1.1); -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
        box-shadow: -8px 0 50px rgba(0,0,0,0.6), inset 1px 0 0 rgba(255,255,255,0.04);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px; background: var(--afg-dark-bg);
        border-left: 1px solid var(--afg-dark-border); color: var(--afg-text);
    }
    .afg-panel::before {
        content: '';
        position: absolute;
        top: 0; left: 0;
        width: 1px; height: 100%;
        background: linear-gradient(180deg, transparent, rgba(34, 211, 238, 0.35), transparent);
        z-index: 10;
    }

    /* Кнопки */
    .afg-btn {
        background: rgba(255,255,255,0.04); border: 1px solid var(--afg-dark-border);
        border-radius: 8px; color: var(--afg-text-secondary); cursor: pointer; padding: 8px 14px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        display: inline-flex; align-items: center; justify-content: center;
        backdrop-filter: blur(10px); font-weight: 600; font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .afg-btn:hover {
        background: rgba(255,255,255,0.08); transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.25); border-color: rgba(255,255,255,0.1);
        color: var(--afg-text);
    }
    .afg-btn:active { transform: scale(0.97); }
    .afg-btn-small { padding: 6px 10px; font-size: 14px; }

    .afg-btn-accent {
        background: var(--afg-accent-soft);
        border-color: rgba(34, 211, 238, 0.3);
        color: var(--afg-accent);
    }
    .afg-btn-accent:hover {
        background: rgba(34, 211, 238, 0.22);
        border-color: rgba(34, 211, 238, 0.55);
        box-shadow: 0 4px 16px rgba(34, 211, 238, 0.25);
        color: #a5f3fc;
    }

    /* Инпуты и Селекты */
    .afg-input {
        background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px; color: var(--afg-text); padding: 8px 12px; outline: none;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); font-size: 13px;
        font-family: inherit;
    }
    .afg-input:focus {
        border-color: var(--afg-accent); background: rgba(0,0,0,0.4);
        box-shadow: 0 0 0 3px var(--afg-accent-soft);
    }
    .afg-input::placeholder { color: var(--afg-text-muted); }
    select.afg-input option { background: #0c0c1c; color: var(--afg-text); }

    /* Секции */
    .afg-header, .afg-controls, .afg-footer {
        padding: 10px 12px; display: flex; align-items: center;
        background: rgba(0,0,0,0.2);
        border-bottom: 1px solid var(--afg-dark-border); gap: 8px; flex-wrap: wrap;
    }
    .afg-chat-info {
        padding: 12px; font-size: 13px;
        border-bottom: 1px solid var(--afg-dark-border);
        background: rgba(0,0,0,0.15);
    }

    /* Область сообщений */
    .afg-chat-area {
        flex: 1; overflow-y: auto; overflow-x: hidden; padding: 16px 14px;
        display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin;
        scrollbar-color: rgba(139, 92, 246, 0.25) transparent;
    }
    .afg-chat-area::-webkit-scrollbar { width: 5px; }
    .afg-chat-area::-webkit-scrollbar-track { background: transparent; }
    .afg-chat-area::-webkit-scrollbar-thumb {
        background: rgba(34, 211, 238, 0.25); border-radius: 3px;
    }
    .afg-chat-area::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.45); }

    /* Темы */
    .theme-light {
        background: linear-gradient(135deg, rgba(245, 248, 252, 0.98) 0%, rgba(235, 240, 248, 0.98) 100%);
        color: #1a1d28; border-radius: 8px 0 0 8px;
    }
    .theme-dark { background: transparent; color: #f0f0f0; }

    /* НОВЫЕ СТИЛИ СООБЩЕНИЙ - Всегда показываем дату/время */
    .afg-msg {
        padding: 10px 14px; border-radius: 12px; max-width: 88%;
        word-break: break-word; position: relative;
        border: 1px solid rgba(255,255,255,0.05);
        box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        animation: msgFadeIn 0.3s ease;
    }

    @keyframes msgFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Заголовок сообщения - ВСЕГДА ВИДИМЫЙ */
    .afg-msg-header {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 6px; padding-bottom: 5px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        font-size: 11px; font-weight: 600;
    }

    .afg-msg-author { color: inherit; opacity: 0.9; }
    .afg-msg-date {
        font-weight: 500; opacity: 0.5; font-size: 10px;
        font-family: 'SF Mono', 'Fira Code', monospace;
    }

    /* Типы сообщений */
    .afg-msg-user {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(6, 182, 212, 0.06));
        border-color: rgba(34, 211, 238, 0.15);
        border-left: 3px solid var(--afg-accent);
        align-self: flex-start;
    }
    .afg-msg-user .afg-msg-author { color: var(--afg-accent); }

    .afg-msg-oper {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.06));
        border-color: rgba(251, 191, 36, 0.15);
        border-right: 3px solid var(--afg-amber);
        align-self: flex-end;
    }
    .afg-msg-oper .afg-msg-author { color: var(--afg-amber); }

    .afg-msg-bot {
        background: linear-gradient(135deg, rgba(52, 211, 153, 0.1), rgba(16, 185, 129, 0.06));
        border-color: rgba(52, 211, 153, 0.15);
        border-right: 3px solid var(--afg-green);
        align-self: flex-end;
    }
    .afg-msg-bot .afg-msg-author { color: var(--afg-green); }

    .afg-msg-comment {
        background: rgba(255,255,255,0.03);
        border-color: rgba(255,255,255,0.06);
        align-self: center; font-style: italic; width: 85%;
        border-left: 3px solid var(--afg-text-muted);
    }
    .afg-msg-comment .afg-msg-author { color: var(--afg-text-muted); }

    .afg-msg-event {
        text-align: center; font-size: 11px; opacity: 0.6; padding: 6px 14px;
        align-self: center; background: rgba(0,0,0,0.15);
        border-radius: 20px; border: 1px solid rgba(255,255,255,0.04);
        font-weight: 500; letter-spacing: 0.2px;
    }

    /* --- Таймлайн отделов: маркер передачи + итоговая строка --- */
    .afg-dept-line {
        align-self: center;
        display: inline-flex; align-items: center; justify-content: center;
        flex-wrap: wrap; gap: 5px 10px;
        max-width: 96%;
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 12.5px; font-weight: 600; letter-spacing: 0.2px; line-height: 1.4;
        background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.28) 100%);
        border: 1px solid rgba(255,255,255,0.08);
        box-shadow: 0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .afg-dept-final { margin-top: 12px; }

    .afg-dept-chip {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 3px 10px; border-radius: 20px;
        font-weight: 700; font-size: 12px; letter-spacing: 0.3px;
        white-space: nowrap;
        color: var(--dc, #94a3b8);
        background: var(--dcA, rgba(148,163,184,0.13));
        border: 1px solid var(--dcB, rgba(148,163,184,0.27));
    }
    .afg-dept-duration {
        font-size: 16px; font-weight: 800;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        color: var(--dc, #94a3b8);
        text-shadow: 0 0 14px var(--dcA, transparent);
    }
    .afg-dept-time {
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 11px; opacity: 0.7; white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
    .afg-dept-label {
        font-size: 10px; font-weight: 700; opacity: 0.5;
        text-transform: uppercase; letter-spacing: 0.8px;
    }
    .afg-dept-arrow { font-size: 15px; opacity: 0.85; }
    .afg-dept-active {
        color: #34d399 !important;
        background: rgba(52,211,153,0.13) !important;
        border-color: rgba(52,211,153,0.35) !important;
    }

    /* Светлая тема для таймлайна отделов */
    .theme-light .afg-dept-line {
        background: linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.92) 100%);
        border-color: rgba(15,23,42,0.12);
        box-shadow: 0 4px 14px rgba(15,23,42,0.1), inset 0 1px 0 rgba(255,255,255,0.8);
    }
    .theme-light .afg-dept-chip {
        color: var(--dcl, #64748b);
        background: var(--dclA, rgba(100,116,139,0.1));
        border-color: var(--dclB, rgba(100,116,139,0.24));
    }
    .theme-light .afg-dept-duration {
        color: var(--dcl, #64748b);
        text-shadow: none;
    }
    .theme-light .afg-dept-time { opacity: 0.8; }
    .theme-light .afg-dept-active {
        color: #059669 !important;
        background: rgba(5,150,105,0.1) !important;
        border-color: rgba(5,150,105,0.3) !important;
    }

    /* Светлая тема */
    .theme-light .afg-msg { color: #1a1d28; border-color: rgba(0,0,0,0.06); }
    .theme-light .afg-msg-header { border-bottom-color: rgba(0,0,0,0.08); }

    .theme-light .afg-msg-user {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%);
        border-color: rgba(34, 211, 238, 0.25);
    }
    .theme-light .afg-msg-user .afg-msg-author {
        color: #0891b2; font-weight: 700;
    }

    .theme-light .afg-msg-comment {
        background: rgba(0,0,0,0.04);
        border-color: rgba(0,0,0,0.08);
    }
    .theme-light .afg-msg-comment .afg-msg-author {
        color: #475569; font-weight: 600;
    }

    .theme-light .afg-msg-oper .afg-msg-author {
        color: #b45309; font-weight: 700;
    }

    .theme-light .afg-msg-bot .afg-msg-author {
        color: #15803d; font-weight: 700;
    }

    /* Модалка */
    .afg-modal {
        position: absolute; top: 20px; left: -400px; width: 380px; max-height: 80vh; overflow: auto;
        border-radius: 14px; padding: 18px; display: none; z-index: 100;
        box-shadow: 0 16px 60px rgba(0,0,0,0.6);
        border: 1px solid var(--afg-dark-border);
        background: linear-gradient(135deg, rgba(24, 30, 52, 0.98) 0%, rgba(16, 22, 42, 0.98) 100%);
        backdrop-filter: blur(40px); color: var(--afg-text);
    }

    /* Ссылки и картинки */
    .afg-chat-area a {
        color: var(--afg-accent); text-decoration: none;
        transition: all 0.2s ease;
    }
    .afg-chat-area a:hover {
        text-decoration: underline;
    }
    .chat-history-image {
        border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 220px; cursor: zoom-in;
        border: 1px solid rgba(255,255,255,0.06);
    }
    .chat-history-image:hover {
        transform: scale(1.03);
        box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }

    .chatlist {
        padding: 10px 12px; border-radius: 10px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); display: block; margin-bottom: 6px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.04);
        cursor: pointer;
    }
    .chatlist:hover {
        background: rgba(255,255,255,0.06);
        transform: translateX(4px);
        border-color: rgba(34, 211, 238, 0.15);
        box-shadow: 0 2px 12px rgba(0,0,0,0.2);
    }

    /* --- ГАЛЕРЕЯ OVERLAY --- */
    .afg-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.92);
        display: flex; justify-content: center; align-items: center;
        z-index: 9999999; cursor: zoom-out;
        backdrop-filter: blur(16px);
        animation: overlayFadeIn 0.25s ease;
    }
    @keyframes overlayFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    .afg-overlay img {
        max-width: 90vw; max-height: 90vh; border-radius: 12px;
        box-shadow: 0 16px 60px rgba(0,0,0,0.8);
        transition: opacity 0.2s;
    }

    .afg-gallery-nav {
        position: absolute; top: 50%; transform: translateY(-50%);
        background: rgba(255,255,255,0.06); color: white;
        border: 1px solid rgba(255,255,255,0.1); font-size: 24px;
        width: 50px; height: 50px; display: flex; justify-content: center; align-items: center;
        cursor: pointer; border-radius: 50%; z-index: 10000000;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        backdrop-filter: blur(10px);
    }
    .afg-gallery-nav:hover {
        background: rgba(34, 211, 238, 0.8);
        transform: translateY(-50%) scale(1.1);
        border-color: transparent;
        box-shadow: 0 8px 24px rgba(34, 211, 238, 0.4);
    }
    .afg-nav-left { left: 30px; }
    .afg-nav-right { right: 30px; }

    .afg-gallery-counter {
        position: absolute; top: 24px; left: 50%; transform: translateX(-50%);
        background: rgba(0,0,0,0.7); color: white; padding: 8px 18px;
        border-radius: 20px; font-size: 14px; font-weight: 600;
        backdrop-filter: blur(12px); z-index: 10000000;
        border: 1px solid rgba(255,255,255,0.1);
    }

    /* Убираем старую логику группировки - теперь каждое сообщение самостоятельное */
    .afg-msg-continuous { display: none; }

    /* Улучшенная читаемость кода и ссылок */
    .afg-msg code {
        background: rgba(0,0,0,0.3);
        padding: 2px 5px;
        border-radius: 4px;
        font-family: 'SF Mono', 'Fira Code', monospace;
        font-size: 12px;
    }

    .afg-msg pre {
        background: rgba(0,0,0,0.3);
        padding: 8px;
        border-radius: 8px;
        overflow-x: auto;
        margin: 6px 0;
        border: 1px solid rgba(255,255,255,0.04);
    }

    /* Плавная прокрутка */
    .afg-chat-area {
        scroll-behavior: smooth;
    }
`;
document.head.appendChild(afgStyles);

// --- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ---
let data = null;
let convdata = null; // раньше была неявной глобальной — оформили
const DATE_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric' }; // Убрали время отсюда
const TIME_OPTIONS = { hour: '2-digit', minute: '2-digit', second: '2-digit' };

// Экранирование внешних данных (имена из API) перед вставкой в innerHTML
const afgEsc = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ============================================================
// ТРЕКИНГ ВРЕМЕНИ ЧАТА НА ОТДЕЛАХ (по префиксам операторов)
// КЦ-, ТП-, ТП ОС-, Prem-, Teachers Care-
// ============================================================
const DEPT_RE = /^(ТП ОС|ТП|КЦ|Prem|Teachers Care)\s*(?=-)/;
const DEPT_COLORS = {
    'ТП': '#f87171',
    'ТП ОС': '#22d3ee',
    'КЦ': '#34d399',
    'Prem': '#a78bfa',
    'Teachers Care': '#60a5fa'
};

// Приглушённые «тёмные» оттенки для светлой темы — читабельны на белом фоне
const DEPT_COLORS_LIGHT = {
    'ТП': '#dc2626',
    'ТП ОС': '#0891b2',
    'КЦ': '#059669',
    'Prem': '#7c3aed',
    'Teachers Care': '#2563eb'
};

/** CSS-переменные отдела: пара цветов сразу для тёмной и светлой темы */
function deptVars(name) {
    const d = DEPT_COLORS[name] || '#94a3b8';
    const l = DEPT_COLORS_LIGHT[name] || '#64748b';
    return `--dc:${d};--dcl:${l};--dcA:${d}22;--dclA:${l}14;--dcB:${d}44;--dclB:${l}3d;`;
}

// Сырое имя оператора по id (без экранирования — нужно для парсинга префикса)
function rawOperatorName(oid) {
    if (typeof operatorsarray === 'undefined' || !Array.isArray(operatorsarray)) return null;
    const op = operatorsarray.find(o => o.operator && o.operator.id === oid);
    return op ? op.operator.fullName : null;
}

const deptOfName = (name) => {
    const m = name && String(name).match(DEPT_RE);
    return m ? m[1] : null;
};

/**
 * Разбор хронологии диалога: сегменты «отдел → время».
 * Сегмент закрывается: передачей на другой отдел, закрытием чата,
 * либо концом истории (чат всё ещё активен).
 * @returns {{segments:Array, markers:Map}} markers — инфо-строки,
 *          привязанные к индексу сообщения-передачи
 */
function analyzeDeptTimeline() {
    const msgs = convdata?.messages || [];
    const segments = [];
    const markers = new Map();
    let cur = null;
    let dialogStartTs = null;

    for (let i = msgs.length - 1; i >= 0; i--) { // хронологический порядок
        const msg = msgs[i];
        const ts = new Date(msg.ts).getTime();

        if (msg.tpe === 'Event') {
            // Запоминаем самый ранний «Начат новый диалог»
            if (msg.eventTpe === 'NewConversation') dialogStartTs = ts;

            const p = msg.payload || {};

            // Закрытие чата завершает активный сегмент
            if (msg.eventTpe === 'CloseConversation' && cur) {
                cur.endTs = ts;
                cur.endIndex = i;
                cur.openChat = false;
                segments.push(cur);
                cur = null;
                continue;
            }

            if ((msg.eventTpe === 'AssignToOperator' || msg.eventTpe === 'CreatedByOperator') && p.oid) {
                const dept = deptOfName(rawOperatorName(p.oid));
                if (dept) {
                    if (cur && dept !== cur.dept) {
                        // ПЕРЕДАЧА между отделами: инфо-строка встанет перед этим событием
                        cur.endTs = ts;
                        cur.endIndex = i;
                        markers.set(i, deptTransferHtml(cur, dept, ts));
                        segments.push(cur);
                        cur = { dept, startTs: ts, openChat: true };
                    } else if (!cur) {
                        cur = { dept, startTs: ts, openChat: true };
                    }
                }
            }
        } else if ((msg.tpe === 'AnswerOperator' || msg.tpe === 'OperatorComment') && msg.operatorId) {
            // Ответ оператора подтверждает отдел (или фиксирует редкую смену без события)
            const dept = deptOfName(rawOperatorName(msg.operatorId));
            if (dept && cur && dept !== cur.dept) {
                cur.endTs = ts;
                cur.endIndex = i;
                markers.set(i, deptTransferHtml(cur, dept, ts));
                segments.push(cur);
                cur = { dept, startTs: ts, openChat: true };
            }
        }
    }

    // Хвост: незакрытый сегмент — действуем до самого свежего сообщения
    if (cur) {
        cur.endTs = Math.max(new Date(msgs[0].ts).getTime(), cur.startTs);
        cur.openChat = true;
        segments.push(cur);
    }

    // Единственный отдел: начало отсчёта — от «Начат новый диалог»
    if (segments.length === 1 && dialogStartTs !== null) {
        segments[0].startTs = Math.min(segments[0].startTs, dialogStartTs);
    }

    return { segments, markers };
}

const fmtClock = (ts) => new Date(ts).toLocaleTimeString('ru-RU', TIME_OPTIONS);

/** Инфо-строка перед событием передачи: сколько чат висел на прошлом отделе */
function deptTransferHtml(prevSeg, nextDept, ts) {
    return `<div class="afg-dept-line" style="${deptVars(prevSeg.dept)}">
        <span class="afg-dept-label">⏱ на отделе</span>
        <span class="afg-dept-chip"> ${afgEsc(prevSeg.dept)}</span>
        <span class="afg-dept-duration">${fmtDuration(ts - prevSeg.startTs)}</span>
        <span class="afg-dept-time">${fmtClock(prevSeg.startTs)} → ${fmtClock(ts)}</span>
        <span class="afg-dept-arrow">➜</span>
        <span class="afg-dept-chip" style="${deptVars(nextDept)}">передан на ${afgEsc(nextDept)}</span>
    </div>`;
}

/** Итоговая строка в конце чата: последний (или единственный) отдел */
function deptFooterHtml(lastSeg) {
    const tail = lastSeg.openChat
        ? '<span class="afg-dept-chip afg-dept-active">● чат активен</span>'
        : `<span class="afg-dept-time">до закрытия · ${fmtClock(lastSeg.endTs)}</span>`;

    return `<div class="afg-dept-line afg-dept-final" style="${deptVars(lastSeg.dept)}">
        <span class="afg-dept-label">🏁 итог</span>
        <span class="afg-dept-chip"> ${afgEsc(lastSeg.dept)}</span>
        <span class="afg-dept-duration">${fmtDuration(lastSeg.endTs - lastSeg.startTs)}</span>
        ${tail}
    </div>`;
}

/** «39 сек» / «5 мин 12 сек» / «1 ч 07 мин» */
function fmtDuration(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h} ч ${String(m).padStart(2, '0')} мин`;
    if (m > 0) return `${m} мин ${s} сек`;
    return `${s} сек`;
}

if (!localStorage.getItem('winTopChatHis')) {
    localStorage.setItem('winTopChatHis', '0');
    localStorage.setItem('winLeftChatHis', '80.6');
}
if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'dark');
}

// --- ПРЕМИАЛЬНЫЙ HTML ШАБЛОН ---
const win_Chathis = `
    <div class="afg-header chmaf-drag-handle" style="justify-content: space-between;">
        <button class="afg-btn afg-btn-small" title="Скрыть панель" id="hideMeChHis">✕</button>
        <div style="display:flex; flex:1; margin: 0 10px; gap: 6px;">
            <select class="afg-input" style="flex: 1; min-width: 0;" id="operatorstp">
                <option selected disabled>👥 Операторы на линии</option>
            </select>
            <button class="afg-btn afg-btn-small afg-btn-accent" title="Обновить статус операторов" id="RefrehOperators">↻</button>
        </div>
        <button class="afg-btn afg-btn-small" title="Информация пользователя" id="getdatafrchat">ℹ️</button>
        <button class="afg-btn afg-btn-small" title="Очистка полей" id="clearallinfo">🗑️</button>
    </div>

    <div class="afg-controls">
        <button class="afg-btn afg-btn-small" title="Назад к списку" id="back_to_chat_his">←</button>
        <input class="afg-input" id="chatuserhis" placeholder="🔍 ID пользователя" autocomplete="off" type="text" style="flex: 1; min-width: 0; text-align:center;">
        <input class="afg-input" id="hashchathis" placeholder="🔗 Хеш чата" autocomplete="off" type="text" style="flex: 1; min-width: 0; text-align:center;">
        <button class="afg-btn afg-btn-small afg-btn-accent" title="Поиск" id="btn_search_history">⚡</button>
    </div>

    <div class="afg-controls" style="justify-content: space-between; font-size: 13px;">
        <div style="display: flex; gap: 6px;">
            <button class="afg-btn afg-btn-small" id="chhisinstr" title="Инструкция">?</button>
            <button class="afg-btn afg-btn-small afg-btn-accent" id="refreshchat" title="Обновить чат">⟳</button>
        </div>
        <div style="display: flex; gap: 6px; align-items: center; font-size: 12px; font-weight: 500;">
            <span style="opacity: 0.7;">С</span>
            <input class="afg-input" type="date" style="padding: 6px 8px; font-size: 12px; width: 120px;" id="dateFromChHis">
            <span style="opacity: 0.7;">По</span>
            <input class="afg-input" type="date" style="padding: 6px 8px; font-size: 12px; width: 120px;" id="dateToChHis">
        </div>
        <button class="afg-btn afg-btn-small" id="chagetheme" title="Сменить тему">◐</button>
    </div>

    <div class="afg-chat-info" id="somechatinfo" style="display:none;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="opacity: 0.7; font-size: 12px;">👤 User ID:</span>
                <span id="placeusid" style="font-weight: 600; color: var(--afg-accent); cursor: pointer;" title="Копировать ID"></span>
            </div>
            <button class="afg-btn afg-btn-accent" id="takechat" title="Забрать чат на себя" style="padding: 6px 12px;">📥 Забрать</button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="opacity: 0.7; font-size: 12px;">💬 Chat ID:</span>
                <span id="placechatid" style="font-weight: 600; color: var(--afg-accent); cursor: pointer;" title="Копировать ссылку"></span>
            </div>
            <button class="afg-btn" id="reassign" title="Перевести на выбранного оператора" style="padding: 6px 12px;">🔄 Перевести</button>
        </div>
    </div>

    <div id="infofield" class="afg-chat-area theme-dark"></div>

    <div class="afg-footer" id="bottommenuchhis" style="display:none; flex-direction: column; gap: 10px;">
        <textarea class="afg-input" id="msgftochatornotes" style="width: 100%; height: 60px; resize: vertical; min-height: 60px; max-height: 200px; text-align: left; padding: 10px;" placeholder="✍️ Введите текст сообщения или заметки..."></textarea>
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
            <button class="afg-btn afg-btn-accent" id="sendmsgtochatornotes" style="padding: 8px 20px; font-weight: 600;">📤 Отправить</button>
            <div style="display: flex; gap: 16px; align-items: center; font-size: 13px;">
                <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <input type="radio" name="chatornotes" value="Notes" checked style="cursor: pointer;">
                    <span>📝 Заметки</span>
                </label>
                <label style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    <input type="radio" name="chatornotes" value="Chat" style="cursor: pointer;">
                    <span>💬 Чат</span>
                </label>
            </div>
        </div>
    </div>

    <div id="userchatdata" class="afg-modal">
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px; gap: 8px;">
            <button class="afg-btn" id="hideuserdatainfo" style="background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); flex: 1;">✕ Закрыть</button>
            <button class="afg-btn afg-btn-accent" id="gotocrmhis" style="flex: 1;">🔗 Открыть CRM</button>
        </div>
        <div id="datafield" style="line-height: 1.6; font-size: 14px; word-break: break-word;"></div>
    </div>
`;

let wintChatHis = document.createElement('div');
wintChatHis.className = 'afg-panel';
wintChatHis.style.display = 'none';
wintChatHis.setAttribute('id', 'AF_ChatHis');
wintChatHis.innerHTML = win_Chathis;
document.body.append(wintChatHis);

// --- ГАЛЕРЕЯ ИЗОБРАЖЕНИЙ ---
document.getElementById('infofield').addEventListener('click', (e) => {
    if (e.target.tagName === 'IMG' && e.target.classList.contains('chat-history-image')) {
        // Собираем все картинки из текущего чата
        const allImages = Array.from(document.querySelectorAll('#infofield .chat-history-image'));
        const currentIndex = allImages.indexOf(e.target);
        openImageGallery(allImages, currentIndex);
    }
});

function openImageGallery(imagesArray, startIndex) {
    if (document.querySelector('.afg-overlay')) return; // Защита от дублей

    let currentIndex = startIndex !== -1 ? startIndex : 0;

    const overlay = document.createElement('div');
    overlay.className = 'afg-overlay';

    const img = document.createElement('img');
    img.src = imagesArray[currentIndex].dataset.full || imagesArray[currentIndex].src;

    // Функция обновления картинки с плавной анимацией
    const updateGalleryView = () => {
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = imagesArray[currentIndex].dataset.full || imagesArray[currentIndex].src;
            img.style.opacity = '1';
            updateCounter();
        }, 150);
    };

    // Навигация и счетчик
    let btnPrev, btnNext, counter;

    if (imagesArray.length > 1) {
        btnPrev = document.createElement('button');
        btnPrev.innerHTML = '&#10094;'; // Стрелка влево
        btnPrev.className = 'afg-gallery-nav afg-nav-left';
        btnPrev.title = "Назад (Клавиша: Влево)";
        btnPrev.onclick = (e) => {
            e.stopPropagation(); // Чтобы не закрывался оверлей
            currentIndex = (currentIndex - 1 + imagesArray.length) % imagesArray.length;
            updateGalleryView();
        };

        btnNext = document.createElement('button');
        btnNext.innerHTML = '&#10095;'; // Стрелка вправо
        btnNext.className = 'afg-gallery-nav afg-nav-right';
        btnNext.title = "Вперед (Клавиша: Вправо)";
        btnNext.onclick = (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % imagesArray.length;
            updateGalleryView();
        };

        counter = document.createElement('div');
        counter.className = 'afg-gallery-counter';

        overlay.appendChild(btnPrev);
        overlay.appendChild(btnNext);
        overlay.appendChild(counter);
    }

    const updateCounter = () => { if (counter) counter.innerText = `${currentIndex + 1} / ${imagesArray.length}`; };
    updateCounter();

    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // Функция закрытия
    const closeOverlay = () => {
        overlay.remove();
        document.removeEventListener('keydown', keyHandler);
    };

    // Клик в любом месте оверлея закрывает галерею
    overlay.onclick = closeOverlay;

    // Управление с клавиатуры
    const keyHandler = (e) => {
        if (e.key === 'Escape') closeOverlay();
        if (imagesArray.length > 1) {
            if (e.key === 'ArrowLeft') btnPrev.click();
            if (e.key === 'ArrowRight') btnNext.click();
        }
    };
    document.addEventListener('keydown', keyHandler);
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
function renderMedia(url) {
    const lower = url.toLowerCase();
    if (lower.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
        return `<img src="${url}" class="chat-history-image" data-full="${url}" style="margin-top: 8px;">`;
    }
    if (lower.match(/\.(mp4|mov|mkv|webm)$/)) {
        return `
            <video controls playsinline preload="metadata" style="max-width:100%; border-radius:12px; display:block; margin-top:8px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                <source src="${url}" type="video/mp4">
                Ваш браузер не поддерживает видео. <a href="${url}" target="_blank" style="color: var(--afg-accent);">Скачать файл</a>
            </video>`;
    }
    if (lower.match(/\.(mp3|wav|ogg|oga)$/)) {
        return `<audio src="${url}" controls style="max-width:100%; margin-top:8px; border-radius: 8px;"></audio>`;
    }
    return `<a href="${url}" target="_blank" style="color: var(--afg-accent); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; padding: 6px 10px; background: rgba(0,212,255,0.1); border-radius: 8px; border: 1px solid rgba(0,212,255,0.2); transition: all 0.2s;">
        📎 ${url.split('/').pop() || 'Файл'}
    </a>`;
}
function getOperatorNameById(operatorId, defaultName) {
    const operator = typeof operatorsarray !== 'undefined' ? operatorsarray.find(op => op.operator && op.operator.id === operatorId) : null;
    // Экранируем: имя попадает в innerHTML
    return afgEsc((operator && operator.operator.fullName) || defaultName);
}

// --- ФИЛЬТР ТЕХНИЧЕСКИХ КОММЕНТАРИЕВ AUTOFAQ ---
// Роутинг сценариев (Routing1/Routing2/Routing3, Final: <guid> и т.п.) — мусор в истории
const AUTOFAQ_TECH_COMMENT_RE = new RegExp(
    '^\\s*(?:' + [
        'routing[\\s\\d.:#-]*',             // Routing1. ..., Routing2: ... (после слова идёт цифра — \b там не работает)
        'final\\s*:',                       // Final: c7bbb211-...
        'итого на данном этапе',            // итого на данном этапе выбран кейс: ...
        'route(?:s)?\\b[^\\n]*(?:\\bhdi\\b|чатбота|кейс)', // route из hdi в идентификации...
        'route\\s+из\\s+hdi'
    ].join('|') + ')',
    'i'
);

function isAutoFaqTechComment(message) {
    const cleanTxt = String((message && message.txt) || '').replace(/<[^>]+>/g, ' ');
    return message.operatorId === 'autoFAQ' && AUTOFAQ_TECH_COMMENT_RE.test(cleanTxt.trim());
}

function extractDate(ts) { return new Date(ts).toLocaleDateString('ru-RU', DATE_OPTIONS); }
function extractTime(ts) { return new Date(ts).toLocaleTimeString('ru-RU', TIME_OPTIONS); }

function convertToMSK(dateString) {
    const d = new Date(dateString);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(-2)} в ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function checkAndChangeStyle() {
    const theme = localStorage.getItem('theme');
    const infoField = document.getElementById('infofield');
    if (theme === 'light') {
        infoField.classList.remove('theme-dark');
        infoField.classList.add('theme-light');
    } else {
        infoField.classList.remove('theme-light');
        infoField.classList.add('theme-dark');
    }
}

// --- ОСНОВНАЯ ЛОГИКА ОТРИСОВКИ ЧАТА ---
function fillchatbox() {
    const infoField = document.getElementById('infofield');
    infoField.innerHTML = '';

    if (!convdata) return;

    const groupIdToSection = {
        'c7bbb211-a217-4ed3-8112-98728dc382d8': 'ТП',
        '8266dbb1-db44-4910-8b5f-a140deeec5c0': 'ТП ОС',
        'b6f7f34d-2f08-fc19-3661-29ac00842898': 'КЦ'
    };

    if (convdata.groupId && groupIdToSection[convdata.groupId]) {
        infoField.setAttribute('opsetction', groupIdToSection[convdata.groupId]);
    }
    infoField.setAttribute('openhistorytime', new Date().toISOString());

    const user = convdata.channelUser;
    const payload = user.payload || {};
    const type = user.channelTpe;
    const isEmptyPayload = Object.keys(payload).length === 0;

    let result = "Widget";
    if (type === 'Telegram') result = "Telegram";
    else if (type === 'WhatsApp') result = "WhatsApp";
    else if (type === 'Widget' && payload.id) result = payload.id;
    else if (!isEmptyPayload) result = user.id;

    document.getElementById('placeusid').innerText = result;
    document.getElementById('placechatid').innerText = convdata.id;
    document.getElementById('somechatinfo').style.display = 'block';
    document.getElementById('bottommenuchhis').style.display = 'flex';

    let htmlBuilder = '';

    // Таймлайн отделов: маркеры передач + итог по последнему сегменту
    const { segments: deptSegments, markers: deptMarkers } = analyzeDeptTimeline();
    const lastDeptSeg = deptSegments.length ? deptSegments[deptSegments.length - 1] : null;

    // УБРАЛИ ЛОГИКУ ГРУППИРОВКИ - каждое сообщение теперь полностью независимое
    for (let i = convdata.messages.length - 1; i >= 0; i--) {
        const message = convdata.messages[i];
        const date = extractDate(message.ts);
        const time = extractTime(message.ts);

        switch (message.tpe) {
            case "Question":
                const name = afgEsc(user.fullName || "Widget");
                let content = message.txt;

                // 1. Обработка медиа-ссылок в тегах <a>
                content = content.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]+)"[^>]*>.*?<\/a>/gi, (match, url) => {
                    if (url.match(/\.(png|jpg|jpeg|gif|webp|mp4|mov|mkv|webm|mp3|wav|ogg|oga)(?:[?#]|$)/i)) {
                        return `<div>${renderMedia(url)}</div>`;
                    }
                    return match;
                });

                // 2. Удаляем технический тег <p> со ссылкой на /attachment
                content = content.replace(/<p>https?:\/\/[^<]+\/attachment<\/p>/gi, '');

                // 3. Обрабатываем прямые ссылки в тегах <p>
                content = content.replace(/<p>(https?:\/\/[^<]+\.(png|jpg|jpeg|gif|webp|mp4|mov|mkv|webm|mp3|wav|ogg|oga))<\/p>/gi, (match, url) => {
                    return `<div>${renderMedia(url)}</div>`;
                });

                // 4. Если ссылки присланы просто текстом
                if (!content.includes('<video') && !content.includes('<img')) {
                    const mediaRegex = /(https:\/\/vimbox-resource[^\s<>"']+\.(mp4|mov|mkv|webm|mp3|wav|ogg|oga|png|jpg|jpeg|gif|webp))/gi;
                    content = content.replace(mediaRegex, (url) => {
                        return renderMedia(url);
                    });
                }

                // ВСЕГДА показываем заголовок с датой и временем
                htmlBuilder += `
                    <div class="afg-msg afg-msg-user">
                        <div class="afg-msg-header">
                            <span class="afg-msg-author">${name}</span>
                            <span class="afg-msg-date">${date} • ${time}</span>
                        </div>
                        <div class="afg-msg-body">${content}</div>
                    </div>`;
                break;

            case "Event":
                const evPayload = message.payload || {};
                let evMsg = '';

                if (message.eventTpe === 'AssignToOperator') {
                    if (evPayload.status === 'OnOperator' && evPayload.oid) evMsg = `Диалог назначен на ${getOperatorNameById(evPayload.oid, "Оператор")}`;
                    else if (evPayload.status === 'AssignedToOperator' && evPayload.oid) evMsg = `${getOperatorNameById(evPayload.oid, "Оператор")} взял(а) диалог`;
                } else if (message.eventTpe === 'CloseConversation') {
                    const { status, sender, src, closeOnAwake, awakeDt } = evPayload;
                    if (status !== 'ClosedByBot' && sender === 'userAnswerTimer') evMsg = 'Автозакрытие (нет активности)';
                    else if (status !== 'ClosedTemporary' && src !== 'delivery' && src !== 'pause' && sender && sender !== 'userAnswerTimer') evMsg = `${getOperatorNameById(sender, "Оператор")} закрыл чат!`;
                    else if (status !== 'ClosedByBot' && src === 'pause' && sender !== 'userAnswerTimer') evMsg = 'Автозакрытие после паузы!';
                    else if (status === 'ClosedTemporary' && closeOnAwake === 'true') evMsg = `${getOperatorNameById(sender, "Оператор")} пауза с автозакрытием ${convertToMSK(awakeDt)}!`;
                    else if (status === 'ClosedTemporary' && closeOnAwake === 'false') evMsg = `${getOperatorNameById(sender, "Оператор")} пауза до ${convertToMSK(awakeDt)}!`;
                    else if (src === 'delivery') evMsg = 'Закрыто рассылкой';
                    else evMsg = message.eventTpe;
                } else {
                    const mapping = {
                        NewConversation: 'Начат новый диалог', RunScenario: 'Сценарий запущен', FirstTimeInQueue: 'Диалог в очереди',
                        RunIntegration: `Запущена интеграция ${evPayload.name}`, FinishIntegration: 'Интеграция успешна',
                        CreatedByOperator: `${getOperatorNameById(evPayload.oid, "Оператор")} открыл(а) диалог`
                    };
                    evMsg = mapping[message.eventTpe] || '';
                }

                if (evMsg) {
                    // Инфо-строка «время на предыдущем отделе» перед передачей
                    const transferMarker = deptMarkers.get(i) || '';
                    htmlBuilder += `${transferMarker}<div class="afg-msg-event">${evMsg} • ${time}</div>`;
                }
                break;

            case "AnswerOperatorWithBot": case "AnswerOperatorQuickReply": case "AnswerSystem": case "AnswerBot": case "AnswerChatterbox":
                const botName = "AutoFAQ bot";

                // ВСЕГДА показываем заголовок
                htmlBuilder += `
                    <div class="afg-msg afg-msg-bot">
                        <div class="afg-msg-header">
                            <span class="afg-msg-author">${botName}</span>
                            <span class="afg-msg-date">${date} • ${time}</span>
                        </div>
                        <div>${message.txt}</div>
                    </div>`;
                break;

            case "AnswerOperator":
                const operName = getOperatorNameById(message.operatorId, "Оператор");

                // ВСЕГДА показываем заголовок
                htmlBuilder += `
                    <div class="afg-msg afg-msg-oper">
                        <div class="afg-msg-header">
                            <span class="afg-msg-author">${operName}</span>
                            <span class="afg-msg-date">${date} • ${time}</span>
                        </div>
                        <div>${message.txt}</div>
                    </div>`;
                break;

            case "OperatorComment":
                // Скрываем технический роутинг автоFAQ (Routing..., Final: <guid> и т.п.)
                if (isAutoFaqTechComment(message)) break;

                const commentAuthor = message.operatorId === "autoFAQ"
                    ? "autoFAQ"
                    : getOperatorNameById(message.operatorId, "Оператор");

                // ВСЕГДА показываем заголовок
                htmlBuilder += `
                    <div class="afg-msg afg-msg-comment">
                        <div class="afg-msg-header">
                            <span class="afg-msg-author">${commentAuthor}</span>
                            <span class="afg-msg-date">${date} • ${time}</span>
                        </div>
                        <div>${message.txt}</div>
                    </div>`;
                break;
        }
    }

    // Сводка по отделам + сообщения
    // Итоговая строка последнего отдела — в самом конце чата
    // (для единственного отдела это «от Начат новый диалог до закрытия»)
    if (lastDeptSeg) {
        htmlBuilder += deptFooterHtml(lastDeptSeg);
    }

    infoField.innerHTML = htmlBuilder;
}

// --- СОБЫТИЯ И ЛОГИКА ---
document.getElementById('operatorstp').addEventListener('change', async function () {
    let objSel = this;

    // Получаем текущую дату в формате YYYY-MM-DD
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    flagsearch = 'searchbyoperator';
    document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⏳ Загрузка чатов оператора...</div>';
    resetChatInfo();

    for (let i = 1; i < objSel.length; i++) {
        if (objSel[i].selected) {
            try {
                let r = await afApiFetch("https://skyeng.autofaq.ai/api/conversations/history", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({
                        serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json",
                        participatingOperatorsIds: [objSel[i].value],
                        tsFrom: `${todayStr}T00:00:00.000Z`,
                        tsTo: `${todayStr}T23:59:59.000Z`,
                        usedStatuses: ["OnOperator", "AssignedToOperator", "Active"], orderBy: "ts", orderDirection: "Asc", page: 1, limit: 20
                    })
                });
                operchatsdata = await r.json();

                if (operchatsdata.total === 0) {
                    alert(`У ${objSel[i].innerText} нет активных чатов в выбранном диапазоне`);
                    document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.5;">📭 Нет активных чатов</div>';
                    return;
                }

                foundarr = "";
                operchatsdata.items.forEach(item => {
                    const d = new Date(item.ts.replace(/\[.*?\]/g, '').trim());
                    const pad = n => String(n).padStart(2, '0');
                    const dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

                    let name = item.channelUser.fullName;
                    if (item.channelUser.payload?.userFullName) name = item.channelUser.payload.userFullName;

                    const userType = item.channelUser.payload?.userType || "";
                    const typeColor = userType ? 'style="color: #4caf50; font-weight: 600;"' : '';

                    foundarr += `<span class="chatlist" data-id="${item.conversationId}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="opacity: 0.7; font-size: 12px;">🕐 ${dateStr}</span>
                            <span ${typeColor}>${afgEsc(userType)}</span>
                        </div>
                        <div style="margin-top: 4px; color: var(--afg-accent); font-weight: 500;">${afgEsc(name)}</div>
                    </span>`;
                });

                document.getElementById('infofield').innerHTML = foundarr;
                bindChatListClicks(operchatsdata.items, 'searchbyoperator');

            } catch (e) {
                console.error(e);
                document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b;">❌ Ошибка загрузки</div>';
            }
        }
    }
});

function bindChatListClicks(items, mode) {
    document.querySelectorAll('.chatlist').forEach((el, index) => {
        const id = el.getAttribute('data-id');
        el.onclick = async () => {
            document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⏳ Загрузка чата...</div>';
            try {
                let r = await afApiFetch(`https://skyeng.autofaq.ai/api/conversations/${id}`);
                convdata = await r.json();
                isChatOnOperator = convdata.status === 'AssignedToOperator';
                fillchatbox();
            } catch (e) {
                console.error(e);
                document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b;">❌ Ошибка загрузки чата</div>';
            }
        };
        el.oncontextmenu = (e) => { e.preventDefault(); typeof copyToClipboard === 'function' && copyToClipboard(id); };
    });
}

function resetChatInfo() {
    document.getElementById('placeusid').innerText = '';
    document.getElementById('placechatid').innerText = '';
    document.getElementById('somechatinfo').style.display = 'none';
    document.getElementById('bottommenuchhis').style.display = 'none';
}

function resetChatHistoryUI() {
    document.getElementById('infofield').innerHTML = '';
    resetChatInfo();
    document.getElementById('chatuserhis').value = '';
    document.getElementById('hashchathis').value = '';
    document.getElementById('infofield').removeAttribute('opsetction');
    document.getElementById('infofield').removeAttribute('openhistorytime');
}

function setDefaultDates() {
    const dTo = new Date();
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('dateToChHis').value = `${dTo.getFullYear()}-${pad(dTo.getMonth() + 1)}-${pad(dTo.getDate())}`;

    const dFrom = new Date();
    dFrom.setMonth(dFrom.getMonth() - 1);
    document.getElementById('dateFromChHis').value = `${dFrom.getFullYear()}-${pad(dFrom.getMonth() + 1)}-${pad(dFrom.getDate())}`;
}

document.getElementById('hideMeChHis').onclick = () => {
    wintChatHis.style.display = 'none';
    const openBtn = document.getElementById('opennewcat');
    if (openBtn) openBtn.classList.remove('active');
    const rightPanel = document.getElementById('rightPanel');
    if (rightPanel) rightPanel.style.right = "22px";
    resetChatHistoryUI();
};

document.getElementById('clearallinfo').onclick = () => {
    resetChatHistoryUI();
    // Визуальная обратная связь
    const btn = document.getElementById('clearallinfo');
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
};

document.getElementById('chatuserhis').addEventListener('input', function () {
    typeof onlyNumbers === 'function' && onlyNumbers(this);
});

// Улучшенная обработка Enter в полях поиска
document.getElementById('chatuserhis').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn_search_history').click();
    }
});

document.getElementById('hashchathis').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn_search_history').click();
    }
});

// Улучшенная обработка Enter в textarea
document.getElementById('msgftochatornotes').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        document.getElementById('sendmsgtochatornotes').click();
    }
});

document.getElementById('back_to_chat_his').onclick = () => {
    resetChatInfo();
    document.getElementById('infofield').innerHTML = foundarr || '<div style="text-align:center; padding: 40px; opacity: 0.5;">📋 История поиска пуста</div>';
    if (foundarr) bindChatListClicks(null, flagsearch);
};

document.getElementById('chhisinstr').onclick = () => window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-chathistory%F0%9F%92%ACChatHistory');

document.getElementById('refreshchat').onclick = async () => {
    const chatId = document.getElementById('placechatid').innerText;
    if (chatId) {
        document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⏳ Обновление чата...</div>';
        await updateChatInfo(chatId);
    }
};

async function updateChatInfo(chatId) {
    try {
        const response = await afApiFetch(`https://skyeng.autofaq.ai/api/conversations/${chatId}`);
        if (!response.ok) throw new Error("Ошибка сети");
        convdata = await response.json();
        isChatOnOperator = convdata.status === 'AssignedToOperator';
        fillchatbox();
    } catch (err) {
        console.error(err);
        document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b;">❌ Ошибка загрузки чата</div>';
    }
}

document.getElementById('takechat').onclick = async function () {
    const timeStart = document.getElementById('infofield').getAttribute('openhistorytime');
    if (!timeStart || (new Date() - new Date(timeStart)) / 1000 > 60) {
        return alert("⚠️ История чата открыта слишком долго. Пожалуйста, обновите чат.");
    }

    const chatId = document.getElementById('placechatid').innerText.trim();
    if (!chatId || typeof operatorId === 'undefined' || !operatorId) return alert("❌ Чат не выбран или ID оператора не найден");

    if (!confirm("📥 Забрать чат на себя?")) return;

    const assignChat = async (id) => {
        await afApiFetch("https://skyeng.autofaq.ai/api/conversation/assign", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: chatId, assignToOperatorId: id })
        });
    };

    try {
        await assignChat('null');
        setTimeout(() => assignChat(operatorId), 2000);
    } catch (e) {
        console.error(e);
        alert("❌ Ошибка при попытке забрать чат");
    }
};

document.getElementById('reassign').onclick = async () => {
    const selected = document.querySelector('#operatorstp option:checked');
    const chatId = document.getElementById('placechatid').innerText.trim();

    if (!chatId || !selected || !selected.value) return alert("❌ Не выбран чат или оператор");

    if (!confirm(`🔄 Перевести чат на ${selected.textContent}?`)) return;

    try {
        await afApiFetch("https://skyeng.autofaq.ai/api/conversation/assign", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: chatId, assignToOperatorId: selected.value })
        });
        console.log("✅ Успешный перевод");
        if (typeof createAndShowButton === 'function') createAndShowButton('✅ Чат успешно переведён', 'message');
    } catch (e) {
        console.error(e);
        alert("❌ Ошибка передачи чата");
    }
};

document.getElementById('sendmsgtochatornotes').onclick = async () => {
    const mode = document.querySelector('input[name="chatornotes"]:checked')?.value;
    const chatId = document.getElementById('placechatid').innerText.trim();
    const msgField = document.getElementById('msgftochatornotes');

    if (!mode || !chatId || !msgField.value.trim()) return alert("❌ Не заполнены все поля");

    const btn = document.getElementById('sendmsgtochatornotes');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Отправка...';
    btn.disabled = true;

    try {
        const convResponse = await afApiFetch(`https://skyeng.autofaq.ai/api/conversations/${chatId}`);
        const conv = await convResponse.json();

        const payload = { sessionId: conv.sessionId, conversationId: chatId, text: `<p>${msgField.value}</p>` };
        if (mode === "Notes") payload.isComment = true;

        // Через общий слой: FormData вместо ручного multipart,
        // диагностика неуспешных ответов и CSRF-ретрай.
        // Текст очищаем только после успеха — при ошибке черновик сохранён
        const response = await sendAnswersRequest(payload);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        msgField.value = "";
        btn.textContent = '✅ Отправлено';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            updateChatInfo(chatId);
        }, 1000);
    } catch (e) {
        console.error(e);
        btn.textContent = '❌ Ошибка';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
        }, 2000);
    }
};

document.getElementById('hideuserdatainfo').onclick = () => {
    const modal = document.getElementById('userchatdata');
    modal.style.display = 'none';
};

document.getElementById('gotocrmhis').onclick = () => {
    if (typeof convdata !== 'undefined' && convdata) {
        const userId = convdata.channelUser.payload?.id || convdata.channelUser.id;
        if (userId) {
            window.open(`https://crm2.skyeng.ru/persons/${userId}`);
        } else {
            alert('❌ ID пользователя не найден в данных чата');
        }
    } else {
        alert('❌ Не выбран активный чат');
    }
};

document.getElementById('chagetheme').onclick = () => {
    const current = localStorage.getItem('theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    checkAndChangeStyle();

    // Визуальная обратная связь
    const btn = document.getElementById('chagetheme');
    btn.style.transform = 'rotate(180deg)';
    setTimeout(() => { btn.style.transform = 'rotate(0deg)'; }, 300);
};

function getopennewcatButtonPress() {
    const isHidden = wintChatHis.style.display === 'none';
    wintChatHis.style.display = isHidden ? 'flex' : 'none';

    const rp = document.getElementById('rightPanel');
    if (rp) rp.style.right = isHidden ? "482px" : "22px";

    const btn = document.getElementById('opennewcat');
    if (btn) isHidden ? btn.classList.add('active') : btn.classList.remove('active');

    if (!isHidden) return;

    checkAndChangeStyle();
    setDefaultDates();

    document.getElementById('RefrehOperators').onclick = async () => {
        let opsflag = 'Unknown';
        const userMenu = document.querySelector('.user_menu-dropdown-user_name');
        if (userMenu) {
            let prefix = userMenu.innerText.split('-')[0];
            if (['ТП', 'ТП ОС', 'КЦ', 'КМ', 'ТС', 'ТПPrem'].includes(prefix)) opsflag = prefix;
        }

        let objSel = document.getElementById("operatorstp");
        objSel.length = 1; // Очищаем список, оставляем только дефолтный 1й элемент

        const btn = document.getElementById('RefrehOperators');
        const originalText = btn.textContent;
        btn.textContent = '⏳';
        btn.disabled = true;

        try {
            let res = await afApiFetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState").then(r => r.json());

            const statusMap = { Online: '🟢', Busy: '🟡', Pause: '🔴' };
            res.onOperator.forEach(({ operator, aCnt = 0 }) => {
                if (operator.status !== "Offline" && operator.fullName.includes(opsflag)) {
                    let opt = document.createElement('option');
                    opt.value = operator.id;
                    opt.textContent = `${statusMap[operator.status] || ''} ${operator.fullName} (${aCnt})`;
                    objSel.appendChild(opt);
                }
            });

            // Сброс селекта на первый пункт
            objSel.selectedIndex = 0;

            btn.textContent = '✅';
            setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 1000);

        } catch (e) {
            console.error(e);
            btn.textContent = '❌';
            setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 2000);
        }
    };

    document.getElementById('RefrehOperators').click();
}

document.getElementById('getdatafrchat').onclick = () => {
    if (typeof convdata !== 'undefined' && convdata) {
        const modal = document.getElementById('userchatdata');

        // Переключение видимости модалки
        modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';

        if (modal.style.display === 'block') {
            let userData = convdata.channelUser.payload || {};
            let techScreeningData = userData.techScreeningData || userData["Тех.инфа об устройствах"] || "Нет данных";

            document.getElementById('datafield').innerHTML = `
                <div style="font-size:16px; margin-bottom:16px; padding: 12px; background: rgba(0,0,0,0.2); border-radius: 10px; border-left: 3px solid var(--afg-accent);">
                    <div style="font-size: 18px; font-weight: 600; color: var(--afg-accent); margin-bottom: 6px;">
                        ${afgEsc(userData.userFullName || convdata.channelUser.fullName)}
                    </div>
                    <div style="opacity: 0.7; font-size: 13px;">
                        ${afgEsc(userData.userType || 'Тип не указан')}
                    </div>
                </div>
                <div style="display: grid; gap: 10px;">
                    <div style="padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px;">
                        <div style="opacity: 0.6; font-size: 11px; margin-bottom: 4px;">USER ID</div>
                        <div style="font-weight: 500;">${afgEsc(userData.id || 'N/A')}</div>
                    </div>
                    <div style="padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px;">
                        <div style="opacity: 0.6; font-size: 11px; margin-bottom: 4px;">📧 EMAIL</div>
                        <div style="font-weight: 500; word-break: break-all;">${afgEsc(userData.email || 'N/A')}</div>
                    </div>
                    <div style="padding: 10px; background: rgba(0,0,0,0.15); border-radius: 8px;">
                        <div style="opacity: 0.6; font-size: 11px; margin-bottom: 4px;">📞 PHONE</div>
                        <div style="font-weight: 500;">${afgEsc(userData.phone || 'N/A')}</div>
                    </div>
                    <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="opacity: 0.6; font-size: 11px; margin-bottom: 6px;">🖥️ TECH SCREENING</div>
                        <div style="font-size: 13px; line-height: 1.5; white-space: pre-wrap;">${afgEsc(techScreeningData)}</div>
                    </div>
                </div>
            `;
        }
    } else {
        alert("❌ Не выбран активный чат");
    }
};

document.getElementById('btn_search_history').onclick = async () => {
    let userId = document.getElementById('chatuserhis').value.trim();
    let chatHash = document.getElementById('hashchathis').value.trim();

    // Получаем даты из инпутов интерфейса
    let dFrom = document.getElementById('dateFromChHis').value;
    let dTo = document.getElementById('dateToChHis').value;

    // Генерируем текущую дату для подстраховки (за текущие сутки)
    const today = new Date();
    const pad = n => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    // ЛОГИКА СЦЕНАРИЕВ:
    const dFromStr = (userId && dFrom) ? dFrom : todayStr;
    const dToStr = (userId && dTo) ? dTo : todayStr;

    document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⏳ Поиск...</div>';
    resetChatInfo();

    if (userId && !chatHash) {
        flagsearch = 'searchbyuser';
        try {
            let res = await afApiFetch("https://skyeng.autofaq.ai/api/conversations/history", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                    serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5", mode: "Json",
                    channelUserFullTextLike: userId,
                    tsFrom: `${dFromStr}T00:00:00.000Z`,
                    tsTo: `${dToStr}T23:59:59.000Z`,
                    orderBy: "ts", orderDirection: "Desc", page: 1, limit: 20
                })
            });
            data = await res.json();

            if (data.total === 0) {
                document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.5;">📭 Чат не найден в выбранном диапазоне дат</div>';
                return;
            }

            foundarr = '';
            data.items.forEach(item => {
                let d = new Date(item.ts.replace(/\[.*?\]/g, '').trim());
                let rating = item.stats.rate?.rate || '⭕';
                let mark = item.status === "ClosedByBot" ? "🤖" : (item.stats.usedStatuses === "AssignedToOperator" ? "🛠" : rating);
                let name = item.channelUser.payload?.userFullName || item.channelUser.fullName;
                let userType = item.channelUser.payload?.userType || "";

                const dateStr = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
                const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

                foundarr += `<span class="chatlist" data-id="${item.conversationId}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <span style="opacity: 0.7; font-size: 12px;">🕐 ${dateStr} ${timeStr}</span>
                        <span style="font-size: 18px;" title="Оценка">${mark}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="color: #4caf50; font-weight: 600; font-size: 12px;">${afgEsc(userType)}</span>
                            <span style="color: var(--afg-accent); font-weight: 500; margin-left: 6px;">${afgEsc(name)}</span>
                        </div>
                    </div>
                </span>`;
            });

            document.getElementById('infofield').innerHTML = foundarr;
            bindChatListClicks(data.items, 'searchbyuser');

        } catch (e) {
            console.error(e);
            document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; color: #ff6b6b;">❌ Ошибка поиска</div>';
        }

    } else if (!userId && chatHash) {
        flagsearch = 'searchbyhash';
        updateChatInfo(chatHash);
    } else {
        document.getElementById('infofield').innerHTML = '<div style="text-align:center; padding: 40px; opacity: 0.7;">⚠️ Укажите только один параметр:<br>ID пользователя или Хеш чата</div>';
    }
};

// Обработчики копирования
document.getElementById('placeusid').onclick = () => {
    const text = document.getElementById('placeusid').innerText;
    if (typeof copyToClipboard === 'function') {
        copyToClipboard(text);
        // Визуальная обратная связь
        const el = document.getElementById('placeusid');
        const originalColor = el.style.color;
        el.style.color = '#4caf50';
        setTimeout(() => { el.style.color = originalColor; }, 300);
    }
};

document.getElementById('placechatid').onclick = () => {
    const chatId = document.getElementById('placechatid').innerText;
    if (typeof copyToClipboard === 'function') {
        copyToClipboard('https://skyeng.autofaq.ai/logs/' + chatId);
        // Визуальная обратная связь
        const el = document.getElementById('placechatid');
        const originalColor = el.style.color;
        el.style.color = '#4caf50';
        setTimeout(() => { el.style.color = originalColor; }, 300);
    }
};
// Инициализация завершена
console.log('✅ ChatHistory v2.0 загружен');
