/**
 * Refactored Chat Queue Module (Premium Edition 5.0)
 * Visual Style: Corporate Graphite Dark
 * Unique Prefix: qg5-
 * Filename: pisa.js
 */

(function () {
    let dataChts = [];

    const esc = (s) => String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const state = {
        refreshInterval: null,
        countdownInterval: null,
        globalTimerInterval: null,
        isRendering: false,
        renderAgain: false,
        selectedBadges: new Set()
    };

    const BADGE_CONFIG = [
        { type: "teacher", emoji: "👽", title: "Учитель" },
        { type: "student", emoji: "👨‍🎓", title: "Ученик" },
        { type: "parent", emoji: "😵‍💫", title: "Родитель" },
        { type: "other", emoji: "❓", title: "Другое" }
    ];

    const normalizeUserType = (type) => {
        if (["teacher", "student", "parent"].includes(type)) return type;
        return "other";
    };

    const injectStyles = () => {
        if (document.getElementById('qg5-styles')) return;
        const style = document.createElement('style');
        style.id = 'qg5-styles';
        style.innerHTML = `
            #AF_Queue .qg5-panel {
                box-sizing: border-box;
                width: min(650px, calc(100vw - 24px));
                max-width: 100%;
                padding: 18px !important;
                color: #edf2fb;
                background:
                    radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
                    #111827 !important;
                border: 1px solid #344258 !important;
                border-radius: 18px;
                box-shadow:
                    0 26px 70px rgba(3, 9, 22, .52),
                    inset 0 1px rgba(255, 255, 255, .06) !important;
                font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
                z-index: var(--z-window-raised, 1000100);
                position: relative;
            }

            #AF_Queue .qg5-panel,
            #AF_Queue .qg5-panel * {
                box-sizing: border-box;
            }

            #AF_Queue .qg5-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 14px;
                padding-bottom: 14px;
                border-bottom: 1px solid #344258;
                cursor: move;
            }

            #AF_Queue .qg5-stats {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
                padding: 7px 12px;
                color: #a6b4cb;
                background: #182335;
                border: 1px solid #364660;
                border-radius: 10px;
                letter-spacing: .03em;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
            }

            #AF_Queue .qg5-stats b,
            #AF_Queue #qg5-count,
            #AF_Queue #qg5-timer-refresh {
                color: #a9c0ff;
                font-family: 'JetBrains Mono', 'SF Mono', monospace;
            }

            /* Интерактивная настройка интервала в блоке таймера */
            #AF_Queue .qg5-timer-setting {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
            }
            #AF_Queue .qg5-interval-wrapper {
                display: inline-flex;
                align-items: center;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 6px;
                padding: 1px 4px;
                margin-left: 2px;
                transition: border-color 0.2s;
            }
            #AF_Queue .qg5-interval-wrapper:hover {
                border-color: #657caa;
            }
            #AF_Queue .qg5-input-compact {
                width: 32px;
                background: transparent;
                border: none;
                outline: none;
                color: #f0c674;
                font-size: 11px;
                font-weight: 700;
                text-align: center;
                font-family: 'JetBrains Mono', monospace;
                padding: 0;
            }
            #AF_Queue .qg5-input-compact::-webkit-inner-spin-button,
            #AF_Queue .qg5-input-compact::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            #AF_Queue .qg5-btn {
                min-height: 36px;
                padding: 8px 14px;
                color: #dce5f5;
                background: #1b283c;
                border: 1px solid #3c4d68;
                border-radius: 9px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: inherit;
                transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
            }

            #AF_Queue .qg5-btn:hover:not(:disabled) {
                color: #fff;
                background: #293b56;
                border-color: #7799e2;
                transform: translateY(-1px);
            }

            #AF_Queue .qg5-btn:disabled {
                opacity: .55;
            }

            #AF_Queue #qg5-hide {
                background: rgba(255, 116, 140, .08) !important;
                border-color: rgba(255, 116, 140, .3) !important;
                color: #ffb0be !important;
                padding: 8px 12px !important;
            }

            #AF_Queue #qg5-manual-refresh {
                margin-left: auto;
                color: #eef3ff;
                background: #4268c9;
                border-color: #7293ed;
                box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
            }

            #AF_Queue #qg5-manual-refresh:hover:not(:disabled) {
                background: #547ce1;
                border-color: #a2b9fa;
                box-shadow: 0 6px 19px rgba(58, 96, 205, .3);
            }

            /* Панель фильтров: строго в один ряд */
            #AF_Queue .qg5-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 14px;
                flex-wrap: nowrap;
            }

            #AF_Queue .qg5-input {
                flex: 1 1 auto;
                min-width: 0;
                height: 36px;
                color: #edf2fb;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 9px;
                padding: 0 10px;
                outline: none;
                font-size: 13px;
                font-family: inherit;
                transition: background 0.2s, border-color 0.2s;
            }

            #AF_Queue .qg5-input:hover {
                background: #142034;
                border-color: #657caa;
            }

            #AF_Queue .qg5-input:focus {
                background: #142034;
                border-color: #829fff;
                box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
            }

            #AF_Queue .qg5-input option {
                background: #111827;
                color: #edf2fb;
            }

            /* Фильтр бейджей */
            #AF_Queue .qg5-badge-filters {
                display: flex;
                align-items: center;
                gap: 4px;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 9px;
                padding: 3px 6px;
                height: 36px;
                flex-shrink: 0;
            }

            #AF_Queue .qg5-badge-toggle {
                font-size: 15px;
                line-height: 1;
                padding: 4px 6px;
                border-radius: 6px;
                background: #182335;
                border: 1px solid #364660;
                cursor: pointer;
                transition: all 0.15s ease;
                user-select: none;
                opacity: 0.55;
            }

            #AF_Queue .qg5-badge-toggle:hover {
                background: #23334b;
                border-color: #6685be;
                opacity: 0.9;
                transform: scale(1.05);
            }

            #AF_Queue .qg5-badge-toggle.is-active {
                background: #2b4372;
                border-color: #7093e6;
                box-shadow: 0 0 8px rgba(112, 147, 230, 0.35);
                opacity: 1;
            }

            /* Список чатов */
            #AF_Queue .qg5-list {
                max-height: 520px;
                overflow-y: auto;
                padding-right: 6px;
                scrollbar-width: thin;
                scrollbar-color: #536a8e transparent;
            }

            #AF_Queue .qg5-list::-webkit-scrollbar { width: 6px; }
            #AF_Queue .qg5-list::-webkit-scrollbar-track { background: transparent; }
            #AF_Queue .qg5-list::-webkit-scrollbar-thumb {
                background: #536a8e;
                border-radius: 4px;
            }

            #AF_Queue .qg5-item {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
                margin-bottom: 7px;
                padding: 9px 12px;
                background: #1a2536;
                border: 1px solid #344258;
                border-left: 3px solid #617fbd;
                border-radius: 10px;
                cursor: pointer;
                transition: background-color .16s ease, border-color .16s ease;
            }

            #AF_Queue .qg5-item:hover {
                background: #23334b;
                border-color: #6685be;
                border-left-color: #92afff;
            }

            #AF_Queue .qg5-time {
                flex: 0 0 68px;
                color: #b6c9f5;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                font-weight: 700;
            }

            #AF_Queue .qg5-badge {
                font-size: 16px;
                min-width: 22px;
                text-align: center;
            }

            #AF_Queue .qg5-usr-name {
                flex: 1;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 13px;
                color: #f0f4fb;
            }

            #AF_Queue .qg5-timer {
                color: #c1ceea;
                font-family: 'JetBrains Mono', monospace;
                min-width: 72px;
                text-align: right;
                font-size: 12px;
                font-weight: 700;
            }

            #AF_Queue .qg5-flag {
                font-size: 14px;
                min-width: 20px;
                text-align: center;
            }

            #AF_Queue .qg5-country {
                max-width: 85px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #c8d6f4;
                background: #293a56;
                border: 1px solid #435b80;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 6px;
            }

            #AF_Queue button[name="assignToMe"] {
                flex: 0 0 auto;
                min-width: 34px !important;
                height: 28px !important;
                color: #cfe0ff !important;
                background: #293e67 !important;
                border: 1px solid #536fa7 !important;
                border-radius: 8px !important;
                cursor: pointer;
                font-size: 13px !important;
                padding: 0 6px !important;
                transition: all 0.16s ease !important;
            }

            #AF_Queue button[name="assignToMe"]:hover:not(:disabled) {
                color: #fff !important;
                background: #395892 !important;
                border-color: #87a9ed !important;
                transform: translateY(-1px) !important;
            }

            /* «Загрузить ещё» под списком */
            #AF_Queue .qg5-load-more {
                display: block;
                width: 100%;
                margin: 8px 0 4px;
                padding: 9px 12px;
                background: #1b283c;
                border: 1px dashed #536fa7;
                border-radius: 9px;
                color: #cfe0ff;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
            }
            #AF_Queue .qg5-load-more:hover:not(:disabled) { background: #293e67; border-style: solid; }
            #AF_Queue .qg5-load-more:disabled { opacity: .6; cursor: progress; }

            /* Кнопка «кто я» в шапке и окно выбора оператора */
            #AF_Queue #qg5-whoami.qg5-whoami-unknown { border-color: rgba(255, 116, 140, .5) !important; color: #ffb0be !important; }
            #AF_Queue .qg5-picker {
                position: absolute;
                inset: 0;
                z-index: 5;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(8, 12, 22, .72);
                border-radius: inherit;
            }
            #AF_Queue .qg5-picker-box {
                width: min(360px, 92%);
                padding: 16px;
                background: #111827;
                border: 1px solid #3c4d68;
                border-radius: 14px;
                box-shadow: 0 18px 50px rgba(0, 0, 0, .5);
                display: flex;
                flex-direction: column;
                gap: 10px;
                color: #dce5f5;
                font-size: 12px;
            }
            #AF_Queue .qg5-picker-title { font-size: 13px; font-weight: 700; color: #fff; }
            #AF_Queue .qg5-picker-hint { color: #8e96b8; line-height: 1.4; }
            #AF_Queue .qg5-picker-actions { display: flex; gap: 8px; justify-content: flex-end; }
            #AF_Queue #qg5-picker-select { height: auto; min-height: 150px; padding: 4px; }
            #AF_Queue #qg5-picker-select optgroup { color: #8e96b8; font-style: normal; font-size: 11px; }
            #AF_Queue #qg5-picker-select option { color: #dce5f5; padding: 4px 6px; border-radius: 6px; font-size: 12px; }
            #AF_Queue #qg5-picker-select option:checked { background: #395892; color: #fff; }
        `;
        document.head.appendChild(style);
    };

    // Порция загрузки: 5 страниц по 100 чатов. «Загрузить ещё» добавляет порцию.
    const PAGES_PER_PORTION = 5;
    state.pageLimit = PAGES_PER_PORTION;

    async function fetchAllPages(url, initialBodyContent, maxPages = PAGES_PER_PORTION) {
        let allData = [];
        let page = 1;
        let totalFetched = 0;
        let totalAvailable;
        do {
            const bodyContent = { ...initialBodyContent, page, limit: 100 };
            const resp = await afApiFetch(url, {
                headers: { "content-type": "application/json" },
                referrer: "https://skyeng.autofaq.ai/logs",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: JSON.stringify(bodyContent),
                method: "POST"
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            allData = allData.concat(data.items || []);
            totalFetched += (data.items || []).length;
            if (page === 1) totalAvailable = data.total;
            page++;
        } while (totalFetched < totalAvailable && page <= maxPages);
        // Сколько чатов всего: если загружено не всё, в шапке покажем «N (из M)»
        allData.total = Number(totalAvailable) || allData.length;
        return allData;
    }

    const getDates = () => {
        const now = new Date();
        const MSK_OFFSET = 3 * 60 * 60 * 1000;
        const msk = new Date(now.getTime() + MSK_OFFSET);
        const y = msk.getUTCFullYear();
        const m = msk.getUTCMonth();
        const d = msk.getUTCDate();
        return {
            tsFrom: new Date(Date.UTC(y, m, d - 2, 21, 0, 0, 0)).toISOString(),
            tsTo: new Date(Date.UTC(y, m, d, 20, 59, 59, 59)).toISOString()
        };
    };

    const getUserTypeEmoji = (type) => {
        switch (type) {
            case "teacher": return "👽";
            case "student": return "👨‍🎓";
            case "parent": return "😵‍💫";
            default: return "❓";
        }
    };

    const getFirstAnswerFlag = (stats) => {
        if (!stats) return "🚫";
        if (stats.firstOperatorAnswerTime) return "✅";
        const usedStatuses = stats.usedStatuses || [];
        const hasAssignedOnly = usedStatuses.length === 1 && usedStatuses[0] === "AssignedToOperator";
        const hasOperators = stats.participatingOperators && stats.participatingOperators.length > 0;
        if (hasAssignedOnly && !hasOperators) return "⤴️";
        if (hasOperators) return "❌";
        return "🚫";
    };

    // ─── Определение своего ID оператора ───────────────────────────
    // Глобальный operatorId есть не всегда: например, у учётки без префикса
    // «ТП-» он не находится. Тогда ищем себя в списке операторов онлайн
    // по имени (с префиксом отдела и без), а если однозначно не вышло —
    // просим один раз выбрать себя из списка и запоминаем выбор.
    const OP_CACHE_KEY = 'qg5_myOperator';
    const DEPT_PREFIX = /^(ТП ОС|ТПPrem|Teachers Care|Prem|Sales|ТП|КЦ|КМ|ТС)\s*-\s*/i;

    const normName = (v) => String(v ?? '').trim()
        .replace(/\s*[-–—]\s*/g, '-')
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('ru-RU');
    const coreName = (v) => normName(v).replace(DEPT_PREFIX, '').trim();

    const myDisplayName = () =>
        document.querySelector('.user_menu-dropdown-user_name')?.textContent?.trim() || '';

    const readCachedOperator = () => {
        const c = readJsonLocal(OP_CACHE_KEY, null);
        // Кэш привязан к имени в профиле: на общем компьютере у другого
        // оператора чужой ID не подхватится
        if (c?.id && (!c.forName || !myDisplayName() || c.forName === myDisplayName())) return c;
        return null;
    };
    const saveCachedOperator = (id, fullName) => {
        try {
            localStorage.setItem(OP_CACHE_KEY, JSON.stringify({ id: String(id), fullName, forName: myDisplayName() }));
        } catch (_) { }
    };

    const fetchOnlineOperators = async () => {
        const resp = await afApiFetch('https://skyeng.autofaq.ai/api/operators/statistic/currentState', { method: 'GET' });
        if (resp && resp.ok === false) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        // Один оператор приходит несколькими строками (по строке на каждую
        // группу/очередь, где он состоит) — оставляем по одному на ID.
        const unique = new Map();
        (Array.isArray(data?.onOperator) ? data.onOperator : [])
            .map(r => r?.operator)
            .filter(op => op?.id && op?.fullName)
            .forEach(op => { if (!unique.has(String(op.id))) unique.set(String(op.id), op); });
        return [...unique.values()];
    };

    // Насколько имя оператора похоже на имя в вашем профиле (0 — не похоже).
    // Сравниваем без префикса отдела: совпавшие слова (имя, фамилия) весят
    // больше всего, начало слова («Иван» ↔ «Ивано») — меньше, плюс общая
    // схожесть по парам букв, чтобы ловить опечатки и «ё/е».
    const nameSimilarity = (me, other) => {
        const prep = (v) => coreName(v).replace(/ё/g, 'е');
        const a = prep(me), b = prep(other);
        if (!a || !b) return 0;
        if (a === b) return 100;

        const ta = a.split(/[\s-]+/).filter(Boolean);
        const tb = b.split(/[\s-]+/).filter(Boolean);
        let score = 0;
        for (const x of ta) {
            if (tb.includes(x)) score += 30;
            else if (x.length >= 3 && tb.some(y => y.startsWith(x.slice(0, 4)) || x.startsWith(y.slice(0, 4)))) score += 10;
        }

        const bigrams = (t) => {
            const m = new Map();
            for (let i = 0; i < t.length - 1; i++) {
                const g = t.slice(i, i + 2);
                m.set(g, (m.get(g) || 0) + 1);
            }
            return m;
        };
        const ba = bigrams(a), bb = bigrams(b);
        let common = 0;
        ba.forEach((n, g) => { common += Math.min(n, bb.get(g) || 0); });
        const dice = (2 * common) / Math.max(1, (a.length - 1) + (b.length - 1));
        score += Math.round(dice * 20);

        return score;
    };

    const matchOperator = (operators) => {
        const me = myDisplayName();
        if (!me) return null;
        const exact = operators.filter(op => normName(op.fullName) === normName(me));
        if (exact.length === 1) return exact[0];
        // «ТП-Иван Иванов» ↔ «Иван Иванов»: сравниваем без префикса отдела
        const core = operators.filter(op => coreName(op.fullName) === coreName(me));
        return core.length === 1 ? core[0] : null;
    };

    async function resolveMyOperatorId({ interactive = true } = {}) {
        if (typeof operatorId !== 'undefined' && operatorId) return String(operatorId);

        const cached = readCachedOperator();
        if (cached) return cached.id;

        try {
            const found = matchOperator(await fetchOnlineOperators());
            if (found) {
                saveCachedOperator(found.id, found.fullName);
                refreshWhoAmI();
                return String(found.id);
            }
        } catch (e) {
            console.warn('[Queue] Не удалось получить список операторов:', e);
        }

        return interactive ? pickOperator() : null;
    }

    function refreshWhoAmI() {
        const btn = document.getElementById('qg5-whoami');
        if (!btn) return;
        const globalId = typeof operatorId !== 'undefined' && operatorId ? String(operatorId) : null;
        const cached = readCachedOperator();
        const known = globalId || cached?.id;
        btn.classList.toggle('qg5-whoami-unknown', !known);
        btn.title = globalId
            ? `Вы: ID ${globalId} (определён расширением)`
            : cached
                ? `Вы: ${cached.fullName || ''} · ID ${cached.id}. Нажмите, чтобы выбрать другого`
                : 'ID оператора не определён — нажмите, чтобы выбрать себя';
    }

    // Окно выбора себя из списка операторов онлайн. Возвращает ID или null.
    function pickOperator(manual = false) {
        return new Promise(async (resolve) => {
            const panel = document.getElementById('qg5-container');
            if (!panel) return resolve(null);
            panel.querySelector('.qg5-picker')?.remove();

            let operators = [];
            try {
                operators = await fetchOnlineOperators();
            } catch (e) {
                if (typeof createAndShowButton === 'function') createAndShowButton('Не удалось загрузить список операторов', 'error');
                return resolve(null);
            }
            operators.sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));

            // Наверх — самые похожие на имя в вашем профиле
            const me = myDisplayName();
            const scored = operators
                .map(op => ({ op, score: me ? nameSimilarity(me, op.fullName) : 0 }))
                .filter(x => x.score >= 25)
                .sort((x, y) => y.score - x.score)
                .slice(0, 6);
            const suggestedIds = new Set(scored.map(x => String(x.op.id)));

            // Одинаковые имена у разных учёток (например, с префиксом и без) —
            // подписываем ID, чтобы их можно было различить
            const nameCount = new Map();
            operators.forEach(op => nameCount.set(normName(op.fullName), (nameCount.get(normName(op.fullName)) || 0) + 1));
            const labelOf = (op) => nameCount.get(normName(op.fullName)) > 1
                ? `${op.fullName} · ID ${op.id}`
                : op.fullName;

            const guess = matchOperator(operators);
            const cached = readCachedOperator();
            const preselect = String(cached?.id || guess?.id || scored[0]?.op.id || '');

            const overlay = document.createElement('div');
            overlay.className = 'qg5-picker';
            overlay.innerHTML = `
                <div class="qg5-picker-box">
                    <div class="qg5-picker-title">Кто вы в AutoFAQ?</div>
                    <div class="qg5-picker-hint">${manual
                    ? 'Выберите свою учётку — она будет использоваться для «Забрать чат».'
                    : 'Не удалось однозначно найти вашу учётку (например, имя без префикса «ТП-»). Выберите себя один раз — выбор запомнится.'}</div>
                    <input class="qg5-input" id="qg5-picker-filter" type="text" autocomplete="off"
                           placeholder="🔎 Начните вводить имя…">
                    <select class="qg5-input" id="qg5-picker-select" size="8"></select>
                    <div class="qg5-picker-hint" id="qg5-picker-count"></div>
                    <div class="qg5-picker-actions">
                        <button type="button" class="qg5-btn" data-act="cancel">Отмена</button>
                        <button type="button" class="qg5-btn" data-act="ok">Это я</button>
                    </div>
                </div>`;
            const select = overlay.querySelector('#qg5-picker-select');
            const filterInput = overlay.querySelector('#qg5-picker-filter');
            const countEl = overlay.querySelector('#qg5-picker-count');

            const makeOption = (op) => {
                const opt = document.createElement('option');
                opt.value = String(op.id);
                opt.textContent = labelOf(op);
                return opt;
            };

            // Список: сначала «Похожие на вас», потом остальные по алфавиту.
            // Фильтр ищет по любой части имени, без учёта регистра и «ё».
            const renderOptions = (query = '') => {
                const q = normName(query).replace(/ё/g, 'е');
                const fits = (op) => !q || normName(op.fullName).replace(/ё/g, 'е').includes(q) || String(op.id).includes(q);
                const keep = select.value;
                select.replaceChildren();

                const top = scored.map(x => x.op).filter(fits);
                const rest = operators.filter(op => !suggestedIds.has(String(op.id)) && fits(op));

                if (top.length) {
                    const group = document.createElement('optgroup');
                    group.label = 'Похожие на вас';
                    top.forEach(op => group.appendChild(makeOption(op)));
                    select.appendChild(group);
                }
                if (rest.length) {
                    const group = document.createElement('optgroup');
                    group.label = top.length ? 'Остальные' : 'Операторы онлайн';
                    rest.forEach(op => group.appendChild(makeOption(op)));
                    select.appendChild(group);
                }

                const shown = top.length + rest.length;
                countEl.textContent = shown
                    ? `Показано ${shown} из ${operators.length} (уникальных)`
                    : 'Никого не нашли — попробуйте часть фамилии';

                if (keep && [...select.options].some(o => o.value === keep)) select.value = keep;
                else if (select.options.length) select.selectedIndex = 0;
            };

            renderOptions();
            if (preselect) select.value = preselect;

            filterInput.addEventListener('input', () => renderOptions(filterInput.value));
            filterInput.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); select.focus(); }
                if (e.key === 'Enter') { e.preventDefault(); overlay.querySelector('[data-act="ok"]').click(); }
            });
            select.addEventListener('dblclick', () => overlay.querySelector('[data-act="ok"]').click());
            select.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') { e.preventDefault(); overlay.querySelector('[data-act="ok"]').click(); }
            });

            const close = (id) => { overlay.remove(); refreshWhoAmI(); resolve(id); };
            overlay.addEventListener('click', (e) => {
                const act = e.target.closest('[data-act]')?.dataset.act;
                if (act === 'cancel') close(null);
                if (act === 'ok' && select.value) {
                    const op = operators.find(o => String(o.id) === select.value);
                    saveCachedOperator(select.value, op?.fullName || '');
                    close(select.value);
                }
            });
            // Двойной клик внутри окна выбора не должен закрывать окно очереди
            overlay.addEventListener('dblclick', (e) => e.stopPropagation());

            panel.style.position = panel.style.position || 'relative';
            panel.appendChild(overlay);
            filterInput.focus();
        });
    }

    const QUEUE_GROUPS = {
        TP: { label: '🛡️ ТП', ids: ['c7bbb211-a217-4ed3-8112-98728dc382d8'] },
        TPOS: { label: '🖥️ ТП ОС', ids: ['8266dbb1-db44-4910-8b5f-a140deeec5c0'] },
        KC: { label: '📞 КЦ', ids: ['b6f7f34d-2f08-fc19-3661-29ac00842898'] },
        Prem: { label: '💎 Prem', ids: ['c1262bdf-444a-41e1-974e-03d754dcff25'] }
    };

    const getDefaultGroupKey = () => {
        const sec = typeof getOpSection === 'function'
            ? getOpSection()
            : (typeof opsection !== 'undefined' ? String(opsection).trim() : '');
        if (sec === 'ТП ОС') return 'TPOS';
        if (sec.startsWith('ТП')) return 'TP';
        if (sec === 'Prem') return 'Prem';
        if (sec === 'КЦ') return 'KC';
        return 'KC';
    };

    const getSelectedGroupKey = () =>
        document.getElementById('qg5-group-type')?.value
        || localStorage.getItem('qg5_group')
        || getDefaultGroupKey();

    const isHistoryWindowOpen = () => {
        const historyWindow = document.getElementById('AF_ChatHis');
        return !!historyWindow && getComputedStyle(historyWindow).display !== 'none';
    };

    const openHistoryWindow = () => {
        if (isHistoryWindowOpen()) return;
        if (typeof getopennewcatButtonPress === 'function') {
            getopennewcatButtonPress();
            return;
        }
        document.getElementById('opennewcat')?.click();
    };

    const openChatInHistory = (conversationId) => {
        if (!conversationId) return;
        openHistoryWindow();
        const hashInput = document.getElementById('hashchathis');
        if (!hashInput) return;
        hashInput.value = conversationId;
        document.getElementById('btn_search_history')?.click();
    };

    const renderChatList = () => {
        const list = document.getElementById('qg5-data-list');
        const countEl = document.getElementById('qg5-count');
        if (!list) return;

        const isFilterActive = state.selectedBadges.size > 0;
        const visibleItems = [];

        dataChts.forEach((el, index) => {
            const rawType = el.channelUser?.payload?.userType;
            const normType = normalizeUserType(rawType);
            if (!isFilterActive || state.selectedBadges.has(normType)) {
                visibleItems.push({ el, originalIndex: index });
            }
        });

        if (countEl) {
            const truncated = dataChts.total > dataChts.length;
            countEl.textContent = (isFilterActive
                ? `${visibleItems.length} / ${dataChts.length}`
                : `${dataChts.length}`) + (truncated ? ` (из ${dataChts.total})` : '');
            countEl.title = truncated ? `Загружено ${dataChts.length} из ${dataChts.total} — кнопка «Загрузить ещё» внизу списка` : '';
        }

        if (visibleItems.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:24px; color:#8e96b8;">
                ${dataChts.length === 0 ? 'Чатов нет' : 'Нет чатов с выбранными бейджами'}
            </div>`;
            return;
        }

        list.innerHTML = visibleItems.map(({ el, originalIndex }) => {
            const ts = new Date(el.ts.replace(/\[.*?\]/g, '').trim());
            const uType = el.channelUser?.payload?.userType;
            return `
            <div class="qg5-item" name="prosmChat" data-index="${originalIndex}">
                <span class="qg5-time">${ts.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span class="qg5-badge" title="${esc(uType || '')}">${getUserTypeEmoji(uType)}</span>
                <span class="qg5-usr-name">${esc(el.channelUser?.fullName || 'User')}</span>
                <span class="qg5-timer" data-start="${ts.getTime()}">00:00:00</span>
                <span class="qg5-flag" title="Флаг ответа">${getFirstAnswerFlag(el.stats)}</span>
                <span class="qg5-country">${esc(el.channelUser?.payload?.country || "➖")}</span>
                <button class="qg5-btn" name="assignToMe">🫳</button>
            </div>`;
        }).join('');

        // Загружены не все чаты — кнопка следующей порции под списком
        const remaining = (dataChts.total || 0) - dataChts.length;
        if (remaining > 0) {
            const portion = Math.min(PAGES_PER_PORTION * 100, remaining);
            list.insertAdjacentHTML('beforeend', `
                <button type="button" class="qg5-load-more" id="qg5-load-more"
                        title="Следующие чаты (более старые). Автообновление будет держать загруженный объём">
                    ⬇️ Загрузить ещё ${portion} · загружено ${dataChts.length} из ${dataChts.total}
                </button>`);
            document.getElementById('qg5-load-more').onclick = (e) => {
                e.currentTarget.disabled = true;
                e.currentTarget.textContent = '⏳ Загружаем…';
                state.pageLimit += PAGES_PER_PORTION;
                window.QueueModule.render();
            };
        }

        window.QueueModule.attachItemHandlers();
    };

    window.QueueModule = {
        init: () => {
            if (document.getElementById('AF_Queue')) return;
            injectStyles();

            const badgeButtonsHtml = BADGE_CONFIG.map(b =>
                `<button type="button" class="qg5-badge-toggle" data-badge="${b.type}" title="${b.title}">${b.emoji}</button>`
            ).join('');

            createWindow('AF_Queue', 'winTopQueue', 'winLeftQueue', `
                <div class="qg5-panel chmaf-drag-handle" id="qg5-container">
                    <div class="qg5-header chmaf-drag-handle" id="qg5-drag-handle">
                        <button class="qg5-btn buttonHide" id="qg5-hide">❌</button>
                        <div class="qg5-stats">
                            <span>Всего: <b id="qg5-count">0</b></span>
                            <span style="opacity: 0.3;">|</span>
                            <span class="qg5-timer-setting" title="Кликните чтобы изменить интервал">
                                Рефреш: <b id="qg5-timer-refresh">0</b>с
                                <span class="qg5-interval-wrapper" title="Период автообновления (сек)">
                                    ⚙️<input class="qg5-input-compact" id="qg5-interval" type="number" min="3" max="999" placeholder="10">с
                                </span>
                            </span>
                        </div>
                        <button class="qg5-btn" id="qg5-whoami" title="Ваш ID оператора для «Забрать чат»">👤</button>
                        <button class="qg5-btn" id="qg5-manual-refresh">🔎 Check Queue</button>
                    </div>
                    <div class="qg5-controls">
                        <select class="qg5-input" id="qg5-group-type" style="flex: 1.1;" title="Группа очереди">
                            <option value="TP">🛡️ ТП</option>
                            <option value="TPOS">🖥️ ТП ОС</option>
                            <option value="KC">📞 КЦ</option>
                            <option value="Prem">💎 Prem</option>
                        </select>
                        <select class="qg5-input" id="qg5-status-type" style="flex: 1.3;" title="Статус чатов">
                            <option value="OnOperator">⌛ В очереди</option>
                            <option value="AssignedToOperator">🛠️ В работе у оператора</option>
                            <option value="ClosedByOperator">✅ Закрытые</option>
                            <option value="ClosedByOperatorWithBot">🤖 Закрытые с ботом</option>
                            <option value="ClosedTemporary">⏸️ На паузе</option>
                        </select>
                        <div class="qg5-badge-filters" title="Фильтр по типу пользователей (можно несколько)">
                            ${badgeButtonsHtml}
                        </div>
                    </div>
                    <div id="qg5-data-list" class="qg5-list"></div>
                </div>
            `);
            hideWindowOnDoubleClick('AF_Queue');
            this.QueueModule.attachEvents();
            state.globalTimerInterval = setInterval(this.QueueModule.updateTimers, 1000);
        },

        render: async () => {
            // Окно скрыли (❌ или двойной клик) — автообновление больше не нужно.
            // Раньше очередь продолжала опрашивать AutoFAQ каждые N секунд в фоне.
            const queueWin = document.getElementById('AF_Queue');
            if (!queueWin || getComputedStyle(queueWin).display === 'none') {
                window.QueueModule.stopAutoRefresh();
                return;
            }
            if (state.isRendering) {
                state.renderAgain = true;
                return;
            }
            state.isRendering = true;
            const btn = document.getElementById('qg5-manual-refresh');
            if (btn) btn.disabled = true;

            try {
                const statusToFetch = document.getElementById('qg5-status-type').value;
                const { tsFrom, tsTo } = getDates();
                const setgroupList = QUEUE_GROUPS[getSelectedGroupKey()]?.ids || QUEUE_GROUPS.KC.ids;

                const initialBodyContent = {
                    serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
                    mode: "Json",
                    groupList: setgroupList,
                    tsFrom, tsTo,
                    usedStatuses: [statusToFetch],
                    orderBy: "ts",
                    orderDirection: "Desc"
                };

                dataChts = await fetchAllPages("https://skyeng.autofaq.ai/api/conversations/history", initialBodyContent, state.pageLimit);
                renderChatList();
            } catch (e) {
                console.error('[Queue] Ошибка загрузки очереди:', e);
                const list = document.getElementById('qg5-data-list');
                if (list) {
                    list.innerHTML = '<div style="text-align:center; padding:24px; color:#f87171;">❌ Ошибка загрузки очереди. Попробуй «Check Queue» ещё раз.</div>';
                }
            } finally {
                state.isRendering = false;
                if (btn) btn.disabled = false;
                if (state.renderAgain) {
                    state.renderAgain = false;
                    queueMicrotask(() => window.QueueModule.render());
                }
            }
        },

        attachItemHandlers: () => {
            const allConvs = document.getElementsByName('prosmChat');
            for (let i = 0; i < allConvs.length; i++) {
                allConvs[i].onclick = () => {
                    const originalIdx = Number(allConvs[i].dataset.index);
                    openChatInHistory(dataChts[originalIdx]?.conversationId);
                };
            }
            const allAssignBtns = document.getElementsByName('assignToMe');
            for (let z = 0; z < allAssignBtns.length; z++) {
                allAssignBtns[z].onclick = (e) => {
                    e.stopPropagation();
                    const itemElem = allAssignBtns[z].closest('.qg5-item');
                    const originalIdx = Number(itemElem?.dataset.index);
                    window.QueueModule.takeChat(dataChts[originalIdx]?.conversationId, allAssignBtns[z]);
                };
            }
        },

        updateTimers: () => {
            const now = Date.now();
            document.querySelectorAll('.qg5-timer').forEach(el => {
                const start = Number(el.dataset.start);
                if (!Number.isFinite(start)) {
                    el.textContent = '—';
                    el.style.color = '';
                    el.style.fontWeight = '';
                    return;
                }
                const diff = Math.max(0, now - start);
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                if (diff < 60_000) {
                    el.style.color = "#f9ff00"; el.style.fontWeight = "800";
                } else { el.style.color = ""; el.style.fontWeight = ""; }
            });
        },

        attachEvents: () => {
            document.getElementById('qg5-hide').onclick = () => {
                document.getElementById('AF_Queue').style.display = 'none';
                window.QueueModule.stopAutoRefresh();
            };
            document.getElementById('qg5-manual-refresh').onclick = () => this.QueueModule.render();
            document.getElementById('qg5-whoami').onclick = () => pickOperator(true);
            refreshWhoAmI();

            const intervalInput = document.getElementById('qg5-interval');
            intervalInput.value = localStorage.getItem("RefreshTimerSeconds") || 10;
            intervalInput.onchange = () => {
                let val = Math.max(3, parseInt(intervalInput.value) || 10);
                intervalInput.value = val;
                localStorage.setItem("RefreshTimerSeconds", val);
                this.QueueModule.startAutoRefresh();
            };

            // Сменили статус или группу — начинаем снова с первой порции
            document.getElementById('qg5-status-type').onchange = () => {
                state.pageLimit = PAGES_PER_PORTION;
                this.QueueModule.render();
            };

            const groupSel = document.getElementById('qg5-group-type');
            if (groupSel) {
                groupSel.value = localStorage.getItem('qg5_group') || getDefaultGroupKey();
                groupSel.onchange = () => {
                    localStorage.setItem('qg5_group', groupSel.value);
                    state.pageLimit = PAGES_PER_PORTION;
                    this.QueueModule.render();
                };
            }

            document.querySelectorAll('.qg5-badge-toggle').forEach(btn => {
                btn.onclick = () => {
                    const badgeType = btn.dataset.badge;
                    if (state.selectedBadges.has(badgeType)) {
                        state.selectedBadges.delete(badgeType);
                        btn.classList.remove('is-active');
                    } else {
                        state.selectedBadges.add(badgeType);
                        btn.classList.add('is-active');
                    }
                    renderChatList();
                };
            });
        },

        stopAutoRefresh: () => {
            clearInterval(state.refreshInterval);
            clearInterval(state.countdownInterval);
            state.refreshInterval = null;
            state.countdownInterval = null;
        },

        startAutoRefresh: () => {
            clearInterval(state.refreshInterval);
            clearInterval(state.countdownInterval);
            const sec = parseInt(localStorage.getItem("RefreshTimerSeconds")) || 10;
            let current = sec;
            const el = document.getElementById('qg5-timer-refresh');
            state.countdownInterval = setInterval(() => {
                current--;
                if (current <= 0) current = sec;
                if (el) el.textContent = current;
            }, 1000);
            state.refreshInterval = setInterval(() => this.QueueModule.render(), sec * 1000);
        },

        takeChat: async (cid, button) => {
            const notifyQ = (msg, type) => typeof createAndShowButton === 'function' && createAndShowButton(msg, type);

            if (!cid || button?.disabled) return;

            // ID определяем ДО возврата чата в очередь: без него второй шаг
            // назначил бы чат «никому», и он ушёл бы в общую очередь.
            // Если автоматически не нашли — один раз выбираете себя из списка.
            const myId = await resolveMyOperatorId();
            if (!myId) {
                notifyQ('ID оператора не выбран — чат не тронут', 'warning');
                return;
            }

            const assign = async (oid) => {
                const resp = await afApiFetch("https://skyeng.autofaq.ai/api/conversation/assign", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: cid, assignToOperatorId: oid })
                });
                if (resp && resp.ok === false) throw new Error(`HTTP ${resp.status}`);
                return resp;
            };

            if (button) { button.disabled = true; button.textContent = '⏳'; }
            let returnedToQueue = false;
            try {
                // API ожидает строку "null" для возврата в очередь
                await assign("null");
                returnedToQueue = true;
                await new Promise(r => setTimeout(r, 2000));
                await assign(myId);
                notifyQ('Чат назначен вам', 'success');
                window.QueueModule.render();
            } catch (e) {
                console.error('[Queue] Не удалось забрать чат:', e);
                notifyQ(returnedToQueue
                    ? 'Чат вернулся в очередь, но забрать его не удалось — проверьте его статус'
                    : 'Не удалось забрать чат: ' + (e.message || e), 'error');
            } finally {
                if (button) { button.disabled = false; button.textContent = '🫳'; }
            }
        }
    };

    window.getQueuePress = () => {
        window.QueueModule.init();
        const win = document.getElementById('AF_Queue');
        // Реальная видимость: display === '' у открытого окна — это «видно»
        if (getComputedStyle(win).display === 'none') {
            win.style.display = 'block';
            window.QueueModule.render();
            window.QueueModule.startAutoRefresh();
        } else {
            win.style.display = 'none';
            window.QueueModule.stopAutoRefresh();
        }
    };
})();