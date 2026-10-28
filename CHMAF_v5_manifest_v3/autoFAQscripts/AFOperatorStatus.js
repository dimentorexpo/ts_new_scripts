/**
 * NEON GLASS ULTRA — Premium Cyber-Dark UI v2.1
 * Zero gradient-line noise, premium queue cards with dedicated neon signatures
 * Filename: refactor-neon-glass-v21.js
 */

// Изолируем область видимости: у файла много «говорящих» глобальных имён,
// которые не должны пересекаться с остальными скриптами расширения
(function () {

    // === STATE & CACHE ==========================================================
    const statusContainer = document.createElement('div');
    statusContainer.id = 'idforpeopstatus';
    statusContainer.className = 'op-st-main-container';

    let opStatusInterval;
    let lastAlertTime = 0;
    let lastSummaryGrow = { online: 0, busy: 0, pause: 0 };

    const chatsWord = (n) => {
        const m10 = n % 10, m100 = n % 100;
        if (m10 === 1 && m100 !== 11) return 'чат';
        if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'чата';
        return 'чатов';
    };
    let siderCache = null;
    const badgeCache = new Map();
    const alertAudio = new Audio('https://grumstv.github.io/Sounds/alert.mp3');

    const OP_GROUP_CONFIG = {
        'ТП': {
            operatorMatch: /ТП\D/,
            queueBy: 'groupId',
            queueIds: ['c7bbb211-a217-4ed3-8112-98728dc382d8']
        },
        'ТП ОС': {
            operatorMatch: /ТП ОС\D/,
            queueBy: 'groupId',
            queueIds: ['8266dbb1-db44-4910-8b5f-a140deeec5c0']
        },
        'КЦ': {
            operatorMatch: /КЦ\D/,
            queueBy: 'groupId',
            queueIds: ['b6f7f34d-2f08-fc19-3661-29ac00842898']
        },
        'Prem': {
            operatorMatch: /Prem\D/,
            queueBy: 'groupId',
            queueIds: ['c1262bdf-444a-41e1-974e-03d754dcff25']
        },
        'Teachers Care': {
            operatorMatch: /Teachers Care\D/,
            sumAllUnassigned: true
        }
    };

    // === CORE LOGIC =============================================================
    async function operstatusleftbar() {
        try {
            const key = await waitForOpSectionNew();
            if (!key || !OP_GROUP_CONFIG[key]) {
                if (key !== null) statusContainer.innerHTML = '';
                return;
            }

            const cfg = OP_GROUP_CONFIG[key];
            // Через общий слой: диагностика ошибок и CSRF-ретрай вместо ручного aftoken
            const response = await afApiFetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState");
            const result = await response.json();

            const tpQueue = getUnassignedCount(result, OP_GROUP_CONFIG['ТП']);
            const tpOsQueue = getUnassignedCount(result, OP_GROUP_CONFIG['ТП ОС']);
            const currentQueue = getUnassignedCount(result, cfg);

            if (key === 'ТП ОС' && tpQueue > 0) {
                showEmergencyQueueAlert(tpQueue);
            }

            let opstats = [];
            if (key === 'ТП ОС') {
                const map = new Map();
                filterOperatorsLocal(result, OP_GROUP_CONFIG['ТП']).forEach(o => map.set(o.operator.id, o));
                filterOperatorsLocal(result, OP_GROUP_CONFIG['ТП ОС']).forEach(o => map.set(o.operator.id, o));
                opstats = Array.from(map.values());
            } else {
                opstats = filterOperatorsLocal(result, cfg);
            }

            const activeIds = new Set(opstats.map(o => o.operator.id));
            for (const id of badgeCache.keys()) {
                if (!activeIds.has(id)) badgeCache.delete(id);
            }

            const stats = {
                online: opstats.filter(o => o.operator.status === 'Online').length,
                busy: opstats.filter(o => o.operator.status === 'Busy').length,
                pause: opstats.filter(o => o.operator.status === 'Pause').length
            };

            const hidesummary = localStorage.getItem('hidesummaryflag') === '1';
            const totalOps = stats.online + stats.busy + stats.pause;
            const totalChats = opstats.reduce((sum, o) => sum + (o.aCnt || 0) + (o.cCnt || 0), 0);
            const isAlert = (key === 'ТП' || key === 'ТП ОС') && tpQueue > 10;
            const shownQueue = (key === 'ТП' || key === 'ТП ОС') ? tpQueue + tpOsQueue : currentQueue;
            const queueLevel = isAlert ? 'alert' : (shownQueue > 0 ? 'wait' : 'calm');
            const queueText = {
                calm: 'Очередь пуста',
                wait: `В очереди: ${shownQueue}`,
                alert: `Завал: ${shownQueue} в очереди`
            }[queueLevel];

            // FLIP: запоминаем, где стояли строки до перерисовки
            const prevTops = new Map();
            statusContainer.querySelectorAll('.op-st-row').forEach(r => {
                prevTops.set(r.dataset.id, r.getBoundingClientRect().top);
            });

            statusContainer.innerHTML = `
            <div class="op-st-queue-box ${isAlert ? 'alert-mode' : ''}">
                <div class="queue-header">
                    <div class="queue-pill lvl-${queueLevel}">
                        <span class="queue-dot"></span>
                        <span class="queue-title">${queueText}</span>
                    </div>
                </div>
                ${(key === 'ТП' || key === 'ТП ОС')
                    ? `<div class="queue-stats">
                       <div class="queue-stat-item ${tpQueue > 10 ? 'alert-state' : 'normal-state'}">
                           <span class="queue-label">ТП</span>
                           <span class="queue-value">${tpQueue}</span>
                       </div>
                       <div class="queue-divider"></div>
                       <div class="queue-stat-item info-state">
                           <span class="queue-label">ТП ОС</span>
                           <span class="queue-value">${tpOsQueue}</span>
                       </div>
                   </div>`
                    : `<div class="queue-stats">
                       <div class="queue-stat-item premium-state">
                           <span class="queue-label">${key}</span>
                           <span class="queue-value">${currentQueue}</span>
                       </div>
                   </div>`}
            </div>
            <div class="op-st-list">${renderOperatorRows(opstats)}</div>
            <div class="op-st-toggle" id="op-st-toggle-btn">
                ${hidesummary ? '🔽 Сводка' : '🔼 Скрыть'}
            </div>
            <div id="op-st-stats-panel" class="op-st-summary" style="display: ${hidesummary ? 'none' : 'flex'}">
                <div class="sum-head">
                    <span><b class="sum-total">${totalOps}</b> на линии</span>
                    <span><b class="sum-total">${totalChats}</b> ${chatsWord(totalChats)} в работе</span>
                </div>
                <div class="sum-bar" role="img" aria-label="Онлайн ${stats.online}, занят ${stats.busy}, перерыв ${stats.pause}">
                    ${['online', 'busy', 'pause'].map(k => `
                        <span class="sum-seg s-${k} ${stats[k] ? '' : 'is-zero'}" data-grow="${stats[k]}"
                              style="flex-grow: ${lastSummaryGrow[k]}"></span>`).join('')}
                </div>
                <div class="sum-legend">
                    ${[['online', 'онлайн'], ['busy', 'занят'], ['pause', 'перерыв']].map(([k, label]) => `
                        <div class="sum-item s-${k} ${stats[k] ? '' : 'is-zero'}">
                            <span class="sum-num">${stats[k]}</span>
                            <span class="sum-label"><i class="sum-dot"></i>${label}</span>
                        </div>`).join('')}
                </div>
            </div>
        `;

            animateRowMoves(prevTops);
            animateSummaryBar(stats);
            attachOpHandlers();
        } catch (e) { console.error('OpStatus Error:', e); }
    }

    // === HELPERS ================================================================
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    // Сегменты полосы рисуются со старыми пропорциями и в следующем кадре
    // перетекают в новые — так изменение состава видно глазом
    function animateSummaryBar(stats) {
        const segs = statusContainer.querySelectorAll('.sum-seg');
        const apply = () => segs.forEach(seg => { seg.style.flexGrow = seg.dataset.grow; });
        if (reducedMotion?.matches) apply();
        else requestAnimationFrame(() => requestAnimationFrame(apply));
        lastSummaryGrow = { online: stats.online, busy: stats.busy, pause: stats.pause };
    }

    // Плавно перемещает строки на новые места после перерисовки innerHTML
    function animateRowMoves(prevTops) {
        if (!prevTops.size || reducedMotion?.matches) return;
        statusContainer.querySelectorAll('.op-st-row').forEach(row => {
            const before = prevTops.get(row.dataset.id);
            if (before === undefined) {
                row.classList.add('op-st-enter');
                return;
            }
            const delta = before - row.getBoundingClientRect().top;
            if (Math.abs(delta) < 1) return;
            row.style.transition = 'none';
            row.style.transform = `translateY(${delta}px)`;
            requestAnimationFrame(() => requestAnimationFrame(() => {
                row.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
                row.style.transform = '';
                row.addEventListener('transitionend', () => { row.style.transition = ''; }, { once: true });
            }));
        });
    }

    async function waitForOpSectionNew(timeout = 3000) {
        return new Promise((resolve) => {
            const start = Date.now();
            const check = () => {
                try {
                    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
                    const el = iframe?.contentDocument?.querySelector('span[id^="mantine-"][id$="-target"]');
                    if (el) {
                        const sectionName = el.textContent.split('-')[0].trim();
                        return resolve(sectionName);
                    }
                } catch (e) { }
                if (Date.now() - start > timeout) return resolve(null);
                requestAnimationFrame(check);
            };
            check();
        });
    }

    function getUnassignedCount(result, cfg) {
        if (!result || !result.unAssigned) return 0;
        if (cfg.sumAllUnassigned) return result.unAssigned.reduce((s, i) => s + Number(i.count || 0), 0);
        const key = cfg.queueBy === 'groupId' ? 'groupId' : 'kb';
        return result.unAssigned
            .filter(i => cfg.queueIds.includes(i[key]))
            .reduce((s, i) => s + Number(i.count || 0), 0);
    }

    function filterOperatorsLocal(result, cfg) {
        return (result.onOperator || []).filter(item => {
            const op = item.operator;
            if (!op || op.status === 'Offline') return false;
            if (!cfg.operatorMatch.test(op.fullName || '')) return false;
            if (cfg.groupIdFilter && item.groupId !== cfg.groupIdFilter) return false;
            return true;
        });
    }

    const cleanOperatorName = (fullName) => {
        if (!fullName) return '';
        let name = fullName;
        if (!name.startsWith('ТП ОС-')) {
            name = name.replace(/^(ТП|Prem|КЦ|Teachers Care)-/, '');
        }
        // Имя вставляется в innerHTML — экранируем разметку на всякий случай
        return name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    const renderOperatorRows = (opstats) => {
        const merged = new Map();
        opstats.forEach(item => {
            const id = item.operator.id;
            if (merged.has(id)) {
                const existing = merged.get(id);
                existing.aCnt = (existing.aCnt || 0) + (item.aCnt || 0);
                existing.cCnt = (existing.cCnt || 0) + (item.cCnt || 0);
            } else {
                merged.set(id, { ...item });
            }
        });
        const uniqueOps = Array.from(merged.values());

        const LOAD_THEMES = {
            idle: { c: '#94a3b8', bg: 'rgba(148, 163, 184, 0.08)', b: 'rgba(148, 163, 184, 0.25)', g: 'none' },
            low:  { c: '#34d399', bg: 'rgba(16, 185, 129, 0.14)', b: 'rgba(16, 185, 129, 0.45)', g: '0 0 8px rgba(16, 185, 129, 0.5)' },
            mid:  { c: '#fbbf24', bg: 'rgba(245, 158, 11, 0.14)', b: 'rgba(245, 158, 11, 0.45)', g: '0 0 8px rgba(245, 158, 11, 0.5)' },
            high: { c: '#f87171', bg: 'rgba(239, 68, 68, 0.18)', b: 'rgba(239, 68, 68, 0.6)', g: '0 0 10px rgba(239, 68, 68, 0.7)' }
        };

        const statusMap = {
            Online: {
                bg: 'rgba(16, 185, 129, 0.12)',
                glow: '#10b981',
                b: 'rgba(16, 185, 129, 0.4)',
                textGlow: '0 0 8px rgba(16, 185, 129, 0.5)'
            },
            Busy: {
                bg: 'rgba(245, 158, 11, 0.12)',
                glow: '#f59e0b',
                b: 'rgba(245, 158, 11, 0.4)',
                textGlow: '0 0 8px rgba(245, 158, 11, 0.5)'
            },
            Pause: {
                bg: 'rgba(239, 68, 68, 0.12)',
                glow: '#ef4444',
                b: 'rgba(239, 68, 68, 0.4)',
                textGlow: '0 0 8px rgba(239, 68, 68, 0.5)'
            }
        };

        if (!uniqueOps.length) {
            return `<div class="op-st-empty">На линии никого нет</div>`;
        }

        const countOf = (it) => (it.aCnt || 0) + (it.cCnt || 0);
        const isTpOsOp = (op) => !!op.fullName?.toUpperCase().includes('ТП ОС');
        const STATUS_TEXT = { Online: 'онлайн', Busy: 'занят', Pause: 'перерыв' };

        uniqueOps.sort((a, b) => a.operator.status.localeCompare(b.operator.status));

        // Следующий чат получит онлайн-оператор с минимумом чатов (отдельно для ТП и ТП ОС)
        const minByGroup = new Map();
        uniqueOps.forEach(it => {
            if (it.operator.status !== 'Online') return;
            const g = isTpOsOp(it.operator) ? 'os' : 'main';
            const c = countOf(it);
            if (!minByGroup.has(g) || c < minByGroup.get(g)) minByGroup.set(g, c);
        });


        let prevStatus = null;
        return uniqueOps.map(item => {
                const op = item.operator;
                const theme = statusMap[op.status] || {
                    bg: 'rgba(100,100,100,0.1)',
                    glow: '#aaa',
                    b: 'rgba(100,100,100,0.3)',
                    textGlow: 'none'
                };

                const isTpOs = isTpOsOp(op);
                const currentCount = countOf(item);
                const isOnline = op.status === 'Online';
                const isNext = isOnline && minByGroup.get(isTpOs ? 'os' : 'main') === currentCount;

                let pulseClass = '';
                if (badgeCache.has(op.id)) {
                    const prevCount = badgeCache.get(op.id);
                    if (currentCount > prevCount) pulseClass = 'pulse-up';
                    else if (currentCount < prevCount) pulseClass = 'pulse-down';
                }
                badgeCache.set(op.id, currentCount);

                // Разделитель между группами статусов
                const sep = (prevStatus !== null && prevStatus !== op.status) ? '<div class="op-st-sep"></div>' : '';
                prevStatus = op.status;

                const displayName = cleanOperatorName(op.fullName);
                // Цвет бейджа — по нагрузке (норма до 5 чатов), статус — точкой у имени
                const LOAD_MAX = 5;
                const load = currentCount === 0 ? LOAD_THEMES.idle
                    : currentCount <= 2 ? LOAD_THEMES.low
                    : currentCount < LOAD_MAX ? LOAD_THEMES.mid
                    : LOAD_THEMES.high;
                const loadPct = Math.min(currentCount / LOAD_MAX, 1) * 100;
                const tip = `${STATUS_TEXT[op.status] || op.status}, ${currentCount} ${chatsWord(currentCount)}`
                    + (currentCount >= LOAD_MAX ? ' — перегруз' : '')
                    + (isNext ? ' — следующий чат придёт сюда' : '');

                const rowClasses = [
                    'op-st-row',
                    isTpOs ? 'tp-os-row' : '',
                    isOnline ? '' : 'is-away',
                    op.status === 'Busy' ? 'st-busy' : '',
                    op.status === 'Pause' ? 'st-pause' : '',
                    isNext ? 'is-next' : ''
                ].filter(Boolean).join(' ');

                return `${sep}<div class="${rowClasses}" name="operrow" data-id="${op.id}" title="${tip}">
                        <span class="op-st-badge ${pulseClass}" data-count="${currentCount}"
                            style="--badge-bg: ${load.bg}; --badge-color: ${load.c}; --badge-border: ${load.b}; --badge-glow: ${load.g};">
                            ${currentCount}
                        </span>
                        <span class="op-st-dot" style="--dot: ${theme.glow};" aria-hidden="true"></span>
                        <span class="op-st-name">${displayName}</span>
                        <span class="op-st-load ${currentCount >= LOAD_MAX ? 'is-over' : ''}" style="--load: ${loadPct}%; --load-c: ${load.c};" aria-hidden="true"></span>
                        ${isNext ? '<span class="op-st-next" aria-hidden="true"></span>' : ''}
                    </div>`;
            }).join('');
    };

    function attachOpHandlers() {
        const toggleBtn = document.getElementById('op-st-toggle-btn');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const isHiding = localStorage.getItem('hidesummaryflag') === '1';
                localStorage.setItem('hidesummaryflag', isHiding ? '0' : '1');
                operstatusleftbar();
            };
        }

        document.querySelectorAll('[name="operrow"]').forEach(el => {
            el.onclick = function () {
                const chatHis = document.getElementById('AF_ChatHis');

                /* Окно истории скрыто CSS-классом .afg-panel { display:none },
                   а не inline-стилем: на свежей странице element.style.display === '',
                   поэтому сравнение с 'none' не срабатывало и панель не открывалась
                   (та же ловушка, что уже исправлена в Queue.js — смотрим
                   вычисленный стиль). */
                const isHidden = !chatHis ||
                    getComputedStyle(chatHis).display === 'none';

                if (isHidden) {
                    /* Публичная функция ChatHistory надёжнее клика по кнопке ☢:
                       обработчик FAB вешается в utils.js по ссылке, захваченной
                       в момент построения панели кнопок. */
                    if (typeof getopennewcatButtonPress === 'function') {
                        getopennewcatButtonPress();
                    } else {
                        document.getElementById('opennewcat')?.click();
                    }
                }

                setTimeout(() => {
                    const select = document.getElementById('operatorstp');
                    if (select) {
                        select.value = this.getAttribute('data-id');
                        select.dispatchEvent(new Event('change'));
                        if (typeof findchatsoper === 'function') findchatsoper();
                    }
                }, 800);
            };
        });
    }

    // === ALERT ==================================================================
    const showEmergencyQueueAlert = (count) => {
        const now = Date.now();
        if (now - lastAlertTime < 5 * 60 * 1000) return;

        document.querySelectorAll('.op-st-alert-overlay').forEach(el => el.remove());

        const overlay = document.createElement('div');
        overlay.className = 'op-st-alert-overlay';
        overlay.innerHTML = `
        <div class="op-st-alert-modal">
            <div class="op-st-alert-icon">⚠️</div>
            <h2 class="op-st-alert-title">Системная тревога</h2>
            <p class="op-st-alert-text">
                В основной очереди ТП критическая нагрузка: <br>
                <b class="op-st-alert-count">${count} чатов</b>
                <span class="op-st-alert-sub">Требуется немедленное подключение! 🚀</span>
            </p>
            <button class="op-st-alert-btn" id="op-st-alert-close">Принято, выхожу</button>
        </div>`;
        document.body.appendChild(overlay);

        try {
            alertAudio.currentTime = 0;
            alertAudio.volume = 0.6;
            alertAudio.play().catch(e => console.log('Audio play blocked or failed'));
        } catch (e) { }

        document.getElementById('op-st-alert-close').onclick = () => {
            lastAlertTime = Date.now();
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.4s ease';
            setTimeout(() => overlay.remove(), 400);
        };
    };

    // === STYLES =================================================================
    const injectOpStatusStyles = () => {
        if (document.getElementById('op-status-styles')) return;
        const style = document.createElement('style');
        style.id = 'op-status-styles';
        style.innerHTML = `
        /* ПЕРЕМЕННЫЕ: блок :root удалён намеренно — его --glass-bg/--glass-border
           перекрывали одноимённые глобальные токены style.css (premium-modal и др.).
           Значения подставлены литералами в .op-st-main-container ниже */

        /* === MAIN CONTAINER === */
        .op-st-main-container {
            width: 200px;
            margin: 12px auto;
            background:
                linear-gradient(135deg, rgba(10, 10, 25, 0.92) 0%, rgba(5, 5, 15, 0.96) 100%),
                url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23181830' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 20px;
            color: #e2e8f0;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            box-shadow:
                0 0 0 1px rgba(0, 0, 0, 0.5),
                0 20px 50px rgba(0, 0, 0, 0.7),
                0 0 80px -20px rgba(139, 92, 246, 0.12);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(20px) saturate(1.2);
            -webkit-backdrop-filter: blur(20px) saturate(1.2);
            z-index: 1;
        }

        /* CRT noise overlay */
        .op-st-main-container::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 20px;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
            opacity: 0.35;
            pointer-events: none;
            z-index: 0;
        }

        /* === QUEUE BOX === */
        .op-st-queue-box {
            position: relative;
            background: linear-gradient(145deg, rgba(22, 22, 38, 0.55) 0%, rgba(12, 12, 22, 0.75) 100%);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            margin-bottom: 5px;
            box-shadow:
                0 8px 32px rgba(0, 0, 0, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.04);
            overflow: hidden;
            z-index: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
            transition: all 0.4s ease;
        }

        .queue-header {
            display: flex;
            align-items: center;
            justify-content: center;
            padding-top: 8px;
        }

        /* Индикатор состояния очереди: спокойно / ждут / завал */
        .queue-pill {
            --pill-color: #10b981;
            --pill-rgb: 16, 185, 129;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            padding: 4px 11px 4px 9px;
            border-radius: 999px;
            background: rgba(var(--pill-rgb), 0.08);
            border: 1px solid rgba(var(--pill-rgb), 0.22);
            transition: background 0.4s ease, border-color 0.4s ease;
        }
        .queue-pill.lvl-wait  { --pill-color: #f59e0b; --pill-rgb: 245, 158, 11; }
        .queue-pill.lvl-alert {
            --pill-color: #ef4444;
            --pill-rgb: 239, 68, 68;
            background: rgba(239, 68, 68, 0.16);
            border-color: rgba(239, 68, 68, 0.5);
            animation: pillAlert 1.1s ease-in-out infinite;
        }

        .queue-dot {
            position: relative;
            width: 7px;
            height: 7px;
            flex-shrink: 0;
            border-radius: 50%;
            background: var(--pill-color);
            box-shadow: 0 0 8px rgba(var(--pill-rgb), 0.7);
        }
        /* Расходящееся кольцо: есть очередь — спокойно, завал — часто */
        .queue-dot::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: var(--pill-color);
            opacity: 0;
        }
        .lvl-wait  .queue-dot::after { animation: dotRipple 1.8s ease-out infinite; }
        .lvl-alert .queue-dot::after { animation: dotRipple 0.9s ease-out infinite; }

        .queue-title {
            font-size: 10.5px;
            font-weight: 600;
            letter-spacing: 0.2px;
            color: #94a3b8;
            white-space: nowrap;
            font-variant-numeric: tabular-nums;
        }
        .lvl-wait  .queue-title { color: #fcd34d; }
        .lvl-alert .queue-title { color: #fecaca; font-weight: 800; }

        @keyframes dotRipple {
            0%   { transform: scale(1);   opacity: 0.7; }
            100% { transform: scale(3.2); opacity: 0; }
        }
        @keyframes pillAlert {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
            50%      { box-shadow: 0 0 16px 1px rgba(239, 68, 68, 0.45); }
        }

        /* === QUEUE STATS PANEL === */
        .queue-stats {
            display: flex;
            justify-content: space-evenly;
            align-items: stretch;
            background: rgba(0, 0, 0, 0.28);
            border-radius: 14px;
            padding: 8px 6px;
            border: 1px solid rgba(255, 255, 255, 0.03);
            box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.35);
            gap: 4px;
        }

        .queue-divider {
            width: 1px;
            align-self: center;
            height: 32px;
            background: linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent);
            flex-shrink: 0;
            margin: 0 2px;
        }

        /* === QUEUE STAT ITEM (base) === */
        .queue-stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            flex: 1;
            padding: 10px 4px;
            border-radius: 10px;
            transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            border: 1px solid transparent;
            cursor: default;
        }

        /* Bottom glow */
        .queue-stat-item::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 55%;
            height: 16px;
            filter: blur(10px);
            opacity: 0.25;
            transition: opacity 0.3s ease, transform 0.3s ease;
            z-index: 0;
            border-radius: 50%;
        }

        .queue-stat-item:hover::after {
            opacity: 0.55;
            transform: translateX(-50%) scaleX(1.2);
        }

        .queue-stat-item:hover {
            transform: translateY(-2px);
        }

        .queue-label {
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            z-index: 1;
            position: relative;
        }

        .queue-value {
            font-size: 24px;
            font-weight: 900;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            letter-spacing: -1px;
            line-height: 1;
            transition: all 0.3s ease;
            font-variant-numeric: tabular-nums;
            font-feature-settings: "tnum";
            z-index: 1;
            position: relative;
        }

        /* --- NORMAL STATE (ТП) --- */
        .queue-stat-item.normal-state {
            background: linear-gradient(180deg, rgba(248, 113, 113, 0.07) 0%, rgba(248, 113, 113, 0.01) 100%);
            border-color: rgba(248, 113, 113, 0.15);
            box-shadow: 0 4px 14px rgba(248, 113, 113, 0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .queue-stat-item.normal-state::after { background: #f87171; }
        .queue-stat-item.normal-state .queue-label { color: rgba(248, 113, 113, 0.75); }
        .queue-stat-item.normal-state .queue-value {
            color: #fca5a5;
            text-shadow: 0 0 18px rgba(248, 113, 113, 0.5), 0 0 40px rgba(248, 113, 113, 0.2);
        }
        .queue-stat-item.normal-state:hover {
            box-shadow: 0 6px 20px rgba(248, 113, 113, 0.14), inset 0 1px 0 rgba(255,255,255,0.04);
            border-color: rgba(248, 113, 113, 0.3);
        }

        /* --- INFO STATE (ТП ОС) --- */
        .queue-stat-item.info-state {
            background: linear-gradient(180deg, rgba(34, 211, 238, 0.07) 0%, rgba(34, 211, 238, 0.01) 100%);
            border-color: rgba(34, 211, 238, 0.15);
            box-shadow: 0 4px 14px rgba(34, 211, 238, 0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .queue-stat-item.info-state::after { background: #22d3ee; }
        .queue-stat-item.info-state .queue-label { color: rgba(34, 211, 238, 0.75); }
        .queue-stat-item.info-state .queue-value {
            color: #67e8f9;
            text-shadow: 0 0 18px rgba(34, 211, 238, 0.5), 0 0 40px rgba(34, 211, 238, 0.2);
        }
        .queue-stat-item.info-state:hover {
            box-shadow: 0 6px 20px rgba(34, 211, 238, 0.14), inset 0 1px 0 rgba(255,255,255,0.04);
            border-color: rgba(34, 211, 238, 0.3);
        }

        /* --- PREMIUM STATE (Other Depts) --- */
        .queue-stat-item.premium-state {
            background: linear-gradient(180deg, rgba(167, 139, 250, 0.07) 0%, rgba(167, 139, 250, 0.01) 100%);
            border-color: rgba(167, 139, 250, 0.15);
            box-shadow: 0 4px 14px rgba(167, 139, 250, 0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .queue-stat-item.premium-state::after { background: #a78bfa; }
        .queue-stat-item.premium-state .queue-label { color: rgba(167, 139, 250, 0.75); }
        .queue-stat-item.premium-state .queue-value {
            color: #c4b5fd;
            text-shadow: 0 0 18px rgba(167, 139, 250, 0.5), 0 0 40px rgba(167, 139, 250, 0.2);
        }
        .queue-stat-item.premium-state:hover {
            box-shadow: 0 6px 20px rgba(167, 139, 250, 0.14), inset 0 1px 0 rgba(255,255,255,0.04);
            border-color: rgba(167, 139, 250, 0.3);
        }

        /* --- ALERT STATE (Critical ТП) --- */
        .queue-stat-item.alert-state {
            background: linear-gradient(180deg, rgba(239, 68, 68, 0.12) 0%, rgba(239, 68, 68, 0.03) 100%);
            border-color: rgba(239, 68, 68, 0.3);
            box-shadow: 0 4px 18px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.04);
            animation: alertPulse 2.2s ease-in-out infinite;
        }
        .queue-stat-item.alert-state::after { background: #ef4444; }
        .queue-stat-item.alert-state .queue-label { color: rgba(255, 107, 107, 0.9); }
        .queue-stat-item.alert-state .queue-value {
            color: #ff9e9e;
            text-shadow: 0 0 24px rgba(255, 107, 107, 0.6), 0 0 50px rgba(255, 107, 107, 0.25);
        }

        @keyframes alertPulse {
            0%, 100% { box-shadow: 0 4px 18px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255,255,255,0.04); }
            50% { box-shadow: 0 6px 28px rgba(239, 68, 68, 0.28), inset 0 1px 0 rgba(255,255,255,0.04); }
        }

        /* === ALERT MODE (queue box wrapper) === */
        .op-st-queue-box.alert-mode {
            border-color: rgba(239, 68, 68, 0.15);
            background: linear-gradient(145deg, rgba(239, 68, 68, 0.06) 0%, rgba(12, 12, 22, 0.8) 60%);
            box-shadow:
                0 8px 32px rgba(0, 0, 0, 0.35),
                inset 0 1px 0 rgba(255, 255, 255, 0.04),
                0 0 30px rgba(239, 68, 68, 0.08);
        }

        /* === OPERATOR ROWS === */
        .op-st-row {
            position: relative;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 10px;
            margin: 3px 0;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 11.5px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-left: 3px solid transparent;
            z-index: 1;
            overflow: hidden;
            vertical-align: middle;
        }

        .op-st-row::after {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 10px;
            background: radial-gradient(350px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.07), transparent 40%);
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
            z-index: 0;
        }

        .op-st-row:hover::after {
            opacity: 1;
        }

        .op-st-row:hover {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
            transform: translateX(5px) scale(1.01);
            box-shadow:
                0 6px 20px rgba(0, 0, 0, 0.4),
                0 0 15px rgba(139, 92, 246, 0.08);
            color: #fff;
        }

        .op-st-row.tp-os-row {
            background: linear-gradient(90deg,
                rgba(6, 182, 212, 0.08) 0%,
                rgba(6, 182, 212, 0.02) 100%);
            border-left: 3px solid #06b6d4;
            box-shadow:
                inset 0 0 10px rgba(6, 182, 212, 0.04),
                0 0 10px rgba(6, 182, 212, 0.04);
        }

        .op-st-row.tp-os-row:hover {
            background: linear-gradient(90deg,
                rgba(6, 182, 212, 0.15) 0%,
                rgba(6, 182, 212, 0.05) 100%);
            border-left-color: #22d3ee;
            box-shadow:
                inset 0 0 15px rgba(6, 182, 212, 0.08),
                0 0 20px rgba(6, 182, 212, 0.12);
        }

        /* === ROW STATES === */
        .op-st-name {
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: #e2e8f0;
            font-weight: 500;
            letter-spacing: 0.3px;
            position: relative;
            z-index: 1;
        }
        .op-st-row.is-away .op-st-name { color: #94a3b8; opacity: 0.7; }
        .op-st-row.tp-os-row .op-st-name { color: #22d3ee; font-weight: 600; }
        .op-st-row.tp-os-row.is-away .op-st-name { color: #0891b2; }

        .op-st-row.is-away { background: transparent; border-color: rgba(255, 255, 255, 0.025); }
        .op-st-row.is-away:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.1); }

        /* Следующий получатель чата */
        .op-st-row.is-next {
            background: linear-gradient(90deg, rgba(16, 185, 129, 0.10) 0%, rgba(16, 185, 129, 0.02) 100%);
            border-color: rgba(16, 185, 129, 0.18);
            border-left-color: #10b981;
        }
        .op-st-row.tp-os-row.is-next {
            background: linear-gradient(90deg, rgba(34, 211, 238, 0.14) 0%, rgba(34, 211, 238, 0.03) 100%);
            border-color: rgba(34, 211, 238, 0.22);
            border-left-color: #67e8f9;
        }
        .op-st-next {
            flex-shrink: 0;
            width: 0;
            height: 0;
            border-top: 4px solid transparent;
            border-bottom: 4px solid transparent;
            border-right: 6px solid #10b981;
            filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.6));
            position: relative;
            z-index: 1;
        }
        .tp-os-row .op-st-next {
            border-right-color: #22d3ee;
            filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.6));
        }

        .op-st-sep {
            height: 1px;
            margin: 7px 10px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.09), transparent);
        }

        .op-st-empty {
            padding: 14px 8px;
            text-align: center;
            font-size: 11px;
            color: #64748b;
        }

        .op-st-row.op-st-enter { animation: opRowEnter 0.45s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes opRowEnter {
            from { opacity: 0; transform: translateX(-8px); }
            to   { opacity: 1; transform: none; }
        }

        /* === Статус (точка) и полоска нагрузки === */
        /* Точка статуса «приклеена» к правому верхнему углу бейджа — не отнимает ширину у имени */
        .op-st-dot {
            position: relative;
            z-index: 2;
            width: 8px; height: 8px; flex: 0 0 8px;
            margin: 0 -8px 0 -15px;
            top: -10px;
            border-radius: 50%;
            background: var(--dot, #94a3b8);
            box-shadow: 0 0 0 2px #0f1522, 0 0 6px var(--dot, transparent);
        }
        .op-st-row.is-away .op-st-dot { box-shadow: 0 0 0 2px #0f1522; }
        .op-st-load {
            position: absolute;
            left: 0; bottom: 0;
            height: 2px;
            width: var(--load, 0%);
            background: linear-gradient(90deg, transparent, var(--load-c, #94a3b8));
            border-radius: 0 2px 2px 0;
            opacity: 0.75;
            transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), background 0.4s;
            pointer-events: none;
        }
        .op-st-load.is-over { animation: opLoadOver 1.6s ease-in-out infinite; }
        @keyframes opLoadOver { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        .op-st-badge { transition: all 0.4s ease, color 0.4s, background 0.4s; }

        /* Строка подсвечивается цветом статуса: занят — жёлтым, перерыв — красным (рассеянное свечение) */
        .op-st-row.st-busy,
        .op-st-row.st-busy.is-away {
            background:
                radial-gradient(120% 140% at 0% 50%, rgba(245, 158, 11, 0.28) 0%, rgba(245, 158, 11, 0.10) 45%, transparent 80%),
                rgba(245, 158, 11, 0.05);
            border-color: rgba(245, 158, 11, 0.28);
            border-left-color: rgba(245, 158, 11, 0.85);
            box-shadow: 0 0 14px rgba(245, 158, 11, 0.12), inset 0 0 12px rgba(245, 158, 11, 0.06);
        }
        .op-st-row.st-pause,
        .op-st-row.st-pause.is-away {
            background:
                radial-gradient(120% 140% at 0% 50%, rgba(239, 68, 68, 0.30) 0%, rgba(239, 68, 68, 0.11) 45%, transparent 80%),
                rgba(239, 68, 68, 0.05);
            border-color: rgba(239, 68, 68, 0.30);
            border-left-color: rgba(239, 68, 68, 0.9);
            box-shadow: 0 0 14px rgba(239, 68, 68, 0.14), inset 0 0 12px rgba(239, 68, 68, 0.07);
        }
        .op-st-row.st-busy .op-st-name { color: #fde68a; opacity: 0.9; }
        .op-st-row.st-pause .op-st-name { color: #fecaca; opacity: 0.9; }
        .op-st-row.st-busy:hover { background: radial-gradient(120% 140% at 0% 50%, rgba(245, 158, 11, 0.38) 0%, rgba(245, 158, 11, 0.14) 50%, transparent 85%), rgba(245, 158, 11, 0.07); }
        .op-st-row.st-pause:hover { background: radial-gradient(120% 140% at 0% 50%, rgba(239, 68, 68, 0.40) 0%, rgba(239, 68, 68, 0.15) 50%, transparent 85%), rgba(239, 68, 68, 0.07); }

        /* === BADGES === */
        .op-st-badge {
            min-width: 26px;
            height: 26px;
            display: grid;
            place-items: center;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            font-weight: 900;
            font-size: 12px;
            letter-spacing: 0.5px;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
            transition: all 0.4s ease;
            background:
                linear-gradient(135deg,
                    rgba(255,255,255,0.08) 0%,
                    rgba(255,255,255,0) 50%),
                var(--badge-bg, rgba(100,100,100,0.12));
            border: 1px solid var(--badge-border, rgba(100,100,100,0.3));
            color: var(--badge-color, #aaa);
            text-shadow: var(--badge-glow, none);
            box-shadow:
                0 2px 8px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.12),
                0 0 0 1px rgba(0,0,0,0.3);
                    line-height: 1;           /* убираем лишний line-height */
    padding-bottom: 1px;      /* микро-сдвиг вверх для цифр */
         padding-top: 1px;  /* если line-height уже 1 */
         font-feature-settings: "tnum";  /* табличные цифры, равномерные метрики */
        }

        .op-st-badge span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -52%);  /* -52% вместо -50% — поднять на 2% */
}

        .op-st-badge::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 40%;
            background: linear-gradient(180deg,
                rgba(255,255,255,0.15) 0%,
                rgba(255,255,255,0) 100%);
            border-radius: 8px 8px 0 0;
            pointer-events: none;
        }

        .op-st-badge::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 15%; right: 15%;
            height: 4px;
            background: var(--badge-color, #aaa);
            border-radius: 50%;
            filter: blur(4px);
            opacity: 0.4;
            transition: opacity 0.3s ease;
        }

        .op-st-badge:hover::after {
            opacity: 0.7;
        }

        .op-st-badge.pulse-up {
            animation: badgePulseSoft 0.6s ease;
        }

        .op-st-badge.pulse-down {
            animation: badgePulseSoftDown 0.6s ease;
        }

        @keyframes badgePulseSoft {
            0% { transform: scale(1); }
            30% { transform: scale(1.12); filter: brightness(1.25); }
            60% { transform: scale(0.96); }
            100% { transform: scale(1); filter: brightness(1); }
        }

        @keyframes badgePulseSoftDown {
            0% { transform: scale(1); }
            30% { transform: scale(0.88); filter: brightness(0.75); }
            60% { transform: scale(1.04); }
            100% { transform: scale(1); filter: brightness(1); }
        }

        /* === TOGGLE === */
        .op-st-toggle {
            text-align: center;
            font-size: 10px;
            padding: 12px;
            cursor: pointer;
            color: #64748b;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            margin-top: 12px;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 700;
            transition: all 0.3s ease;
            position: relative;
            border-radius: 0 0 16px 16px;
            z-index: 1;
        }

        .op-st-toggle:hover {
            color: #a78bfa;
            text-shadow: 0 0 15px rgba(167, 139, 250, 0.5);
            background: rgba(167, 139, 250, 0.03);
        }

        /* === SUMMARY === */
        .op-st-summary {
            flex-direction: column;
            gap: 10px;
            margin: 4px 6px 10px;
            padding: 12px 12px 10px;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.025);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
            position: relative;
            z-index: 1;
        }

        .sum-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            font-size: 10px;
            color: #64748b;
            letter-spacing: 0.2px;
        }
        .sum-total {
            font-size: 12px;
            font-weight: 700;
            color: #cbd5e1;
            font-variant-numeric: tabular-nums;
            margin-right: 2px;
        }

        /* Полоса состава смены */
        .sum-bar {
            display: flex;
            height: 8px;
            border-radius: 999px;
            background: rgba(0, 0, 0, 0.35);
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.6);
            overflow: hidden;
            padding: 1px;
        }
        .sum-seg {
            flex-basis: 0;
            min-width: 0;
            height: 100%;
            margin: 0 1px;
            border-radius: 999px;
            background: var(--sum-color);
            box-shadow: 0 0 10px var(--sum-glow), inset 0 1px 0 rgba(255, 255, 255, 0.35);
            transition: flex-grow 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), margin 0.4s ease;
        }
        .sum-seg.is-zero { margin: 0; }

        .s-online { --sum-color: #10b981; --sum-glow: rgba(16, 185, 129, 0.45); --sum-text: #6ee7b7; }
        .s-busy   { --sum-color: #f59e0b; --sum-glow: rgba(245, 158, 11, 0.45); --sum-text: #fcd34d; }
        .s-pause  { --sum-color: #ef4444; --sum-glow: rgba(239, 68, 68, 0.45);  --sum-text: #fca5a5; }

        .sum-legend {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
        }
        .sum-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
            transition: opacity 0.3s ease;
        }
        .sum-item + .sum-item { border-left: 1px solid rgba(255, 255, 255, 0.05); }

        .sum-num {
            font-size: 20px;
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -0.5px;
            color: var(--sum-text);
            text-shadow: 0 0 14px var(--sum-glow);
            font-variant-numeric: tabular-nums;
        }
        .sum-label {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 9.5px;
            color: #94a3b8;
        }
        .sum-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: var(--sum-color);
            box-shadow: 0 0 6px var(--sum-glow);
        }

        .sum-item.is-zero .sum-num { color: #475569; text-shadow: none; }
        .sum-item.is-zero .sum-dot { background: #475569; box-shadow: none; }
        .sum-item.is-zero .sum-label { color: #64748b; }

        /* === ALERT MODAL === */
        .op-st-alert-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            background: rgba(5, 5, 15, 0.9);
            backdrop-filter: blur(20px) saturate(1.5);
            -webkit-backdrop-filter: blur(20px) saturate(1.5);
            z-index: var(--z-popout, 1001000);
            display: flex;
            align-items: center;
            justify-content: center;
            animation: opFadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .op-st-alert-modal {
            background:
                linear-gradient(135deg,
                    rgba(15, 15, 30, 0.95) 0%,
                    rgba(10, 10, 20, 0.98) 100%);
            border: 1px solid rgba(255, 42, 42, 0.3);
            border-radius: 24px;
            padding: 50px 40px;
            width: 480px;
            text-align: center;
            box-shadow:
                0 0 60px rgba(255, 42, 42, 0.15),
                0 20px 60px rgba(0, 0, 0, 0.6),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            animation:
                opPulseUltra 2.5s infinite,
                opFadeIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            color: #e2e8f0;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }

        .op-st-alert-modal::before {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 2px;
            background: linear-gradient(90deg,
                transparent,
                #ff2a2a,
                #ff6b6b,
                #ff2a2a,
                transparent);
        }

        .op-st-alert-modal::after {
            content: '';
            position: absolute;
            top: -50%; left: -50%;
            width: 200%; height: 200%;
            background: radial-gradient(circle at 50% 0%, rgba(255, 42, 42, 0.1) 0%, transparent 50%);
            pointer-events: none;
        }

        .op-st-alert-icon {
            font-size: 56px;
            margin-bottom: 20px;
            filter: drop-shadow(0 0 20px rgba(255,42,42,0.8));
            animation: opPulseIcon 2s infinite;
        }

        .op-st-alert-title {
            color: #ff2a2a;
            margin: 0 0 18px 0;
            font-size: 26px;
            font-weight: 900;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(255,42,42,0.4);
        }

        .op-st-alert-text {
            color: #94a3b8;
            font-size: 16px;
            line-height: 1.7;
        }

        .op-st-alert-count {
            font-size: 36px;
            color: #ff2a2a;
            text-shadow: 0 0 20px rgba(255,42,42,0.5);
            display: block;
            margin: 15px 0;
            font-weight: 900;
        }

        .op-st-alert-sub {
            color: #cbd5e1;
        }

        .op-st-alert-btn {
            margin-top: 35px;
            padding: 14px 40px;
            background: transparent;
            border: 1px solid rgba(255, 42, 42, 0.5);
            border-radius: 12px;
            color: #ff6b6b;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow:
                0 0 15px rgba(255, 42, 42, 0.1),
                inset 0 0 15px rgba(255, 42, 42, 0.05);
            text-transform: uppercase;
            letter-spacing: 2px;
            font-size: 13px;
            position: relative;
            overflow: hidden;
        }

        .op-st-alert-btn::before {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 50%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            transform: skewX(-20deg);
            animation: shimmer 2.5s infinite;
        }

        .op-st-alert-btn:hover {
            background: rgba(255, 42, 42, 0.15);
            color: #fff;
            border-color: #ff2a2a;
            box-shadow:
                0 0 30px rgba(255, 42, 42, 0.3),
                inset 0 0 20px rgba(255, 42, 42, 0.1);
            transform: translateY(-3px);
        }

        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 200%; }
        }

        @keyframes opPulseIcon {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(255,42,42,0.8)); }
            50% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(255,42,42,1)); }
        }

        @keyframes opPulseUltra {
            0% {
                box-shadow:
                    0 0 60px rgba(255, 42, 42, 0.15),
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    inset 0 0 20px rgba(255, 42, 42, 0.05);
            }
            50% {
                box-shadow:
                    0 0 80px rgba(255, 42, 42, 0.25),
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    inset 0 0 30px rgba(255, 42, 42, 0.1);
            }
            100% {
                box-shadow:
                    0 0 60px rgba(255, 42, 42, 0.15),
                    0 20px 60px rgba(0, 0, 0, 0.6),
                    inset 0 0 20px rgba(255, 42, 42, 0.05);
            }
        }

        @keyframes opFadeIn {
            from { opacity: 0; transform: scale(0.9) translateY(20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* === SCROLLBAR === */
        .op-st-main-container::-webkit-scrollbar {
            width: 4px;
        }
        .op-st-main-container::-webkit-scrollbar-track {
            background: transparent;
        }
        .op-st-main-container::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 4px;
        }
        .op-st-main-container::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.5);
        }

        /* === ACCESSIBILITY === */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
        document.head.appendChild(style);
    };

    // === INIT ===================================================================
    function initializeStartOperStatus() {
        injectOpStatusStyles();

        statusContainer.addEventListener('mousemove', (e) => {
            const row = e.target.closest('.op-st-row');
            if (!row) return;
            const rect = row.getBoundingClientRect();
            row.style.setProperty('--x', (e.clientX - rect.left) + 'px');
            row.style.setProperty('--y', (e.clientY - rect.top) + 'px');
        });

        const findSider = () => {
            if (siderCache && siderCache.isConnected) {
                if (!siderCache.contains(statusContainer)) siderCache.append(statusContainer);
                return true;
            }
            const sider = document.querySelector('.ant-layout-sider-children');
            if (sider) {
                siderCache = sider;
                if (!sider.contains(statusContainer)) sider.append(statusContainer);
                return true;
            }
            return false;
        };

        if (!findSider()) {
            const observer = new MutationObserver(() => {
                if (findSider()) observer.disconnect();
            });
            observer.observe(document.documentElement, { childList: true, subtree: true });
        }

        operstatusleftbar();
        if (opStatusInterval) clearInterval(opStatusInterval);
        opStatusInterval = setInterval(operstatusleftbar, 8000);
    }

    initializeStartOperStatus();

})(); // Конец IIFE