/**
 * Transactions.js — «Анализ платежей» на accounting.skyeng.ru (поиск транзакций).
 * Подсвечивает строки по статусу (completed / failed / processing), отмечает
 * платёжные системы с автоплатежами и failed-платежи через overpay.
 *
 * Работает на сторонней (светлой) странице, поэтому стили самодостаточные:
 * styles.css расширения сюда не подключается.
 */
(() => {
    'use strict';

    ['ps-fab-btn', 'ps-checker-panel', 'ps-custom-styles'].forEach((id) => document.getElementById(id)?.remove());

    // Платёжные системы с поддержкой автоплатежей (рекуррент).
    const PAYMENT_SYSTEMS = [
        'bank131.agt',
        'gazprombank.skyeng.ano', 'gazprombank.skypro.ano', 'gazprombank.skysmart.ano',
        'payanyway.skyeng.ano', 'payanyway.skypro.ano', 'payanyway.skysmart.ano',
        'rsb.bank_card.skyeng.ano', 'rsb.bank_card.skypro.ano', 'rsb.bank_card.skysmart.ano',
        'sber-direct.skyeng.ano', 'sber-direct.skyeng.courses.ano', 'sber-direct.skypro.ano',
        'sber-direct.skysmart.ano', 'sber-direct.skysmart.homeschool.ano',
        'sber.skyeng.ano', 'sber.skyeng.courses.ano', 'sber.skysmart.ano', 'sber.skysmart.homeschool.ano',
        'stripe.ltitc',
        'tinkoff.ano', 'tinkoff.english', 'tinkoff.premium.ano', 'tinkoff.salebot.ano',
        'tinkoff.skyeng', 'tinkoff.skypro.ano', 'tinkoff.skysmart-premium.ano', 'tinkoff.skysmart.ano'
    ];

    // Совпадение целиком: «tinkoff.ano» не должен срабатывать внутри «tinkoff.anoXYZ».
    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const RECURRENT_RE = new RegExp(`(^|[^a-z0-9._-])(${PAYMENT_SYSTEMS.map(escapeRe).join('|')})(?=$|[^a-z0-9._-])`, 'i');

    const ROW_CLASSES = ['ps-row-completed', 'ps-row-failed', 'ps-row-processing'];
    const CELL_CLASSES = ['ps-status-completed', 'ps-status-failed', 'ps-status-processing', 'ps-recurrent', 'ps-overpay-failed'];

    const style = document.createElement('style');
    style.id = 'ps-custom-styles';
    style.textContent = `
        #ps-fab-btn, #ps-checker-panel {
            --bg: #141920; --bg-2: #1a2029; --bg-3: #222a35; --bg-hover: #2a3442;
            --line: rgba(148,163,184,.13); --line-strong: rgba(148,163,184,.26);
            --text: #e6ebf2; --text-2: #a3afc0; --text-3: #6f7b8e;
            --accent: #7cc4ff; --primary: #2f6db3; --primary-hover: #3a7cc6;
            --ok: #5fcf98; --warn: #f2a65a; --bad: #f07a7e; --violet: #a99cff;
            font-family: "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
        }
        #ps-fab-btn {
            position: fixed; right: 24px; bottom: 24px; z-index: 999998;
            display: flex; align-items: center; gap: 8px;
            height: 44px; padding: 0 16px 0 14px;
            font-size: 13px; font-weight: 600; color: #fff;
            background: var(--primary); border: 0; border-radius: 22px;
            box-shadow: 0 10px 28px rgba(3,7,14,.35); cursor: pointer;
            transition: background .12s ease;
        }
        #ps-fab-btn:hover { background: var(--primary-hover); }
        #ps-fab-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
        #ps-checker-panel {
            position: fixed; right: 24px; bottom: 80px; z-index: 999999;
            display: flex; flex-direction: column;
            width: 380px; max-height: 75vh; overflow: hidden;
            font-size: 13px; line-height: 1.45; color: var(--text);
            background: var(--bg); border: 1px solid var(--line-strong); border-radius: 12px;
            box-shadow: 0 18px 48px rgba(3,7,14,.45), 0 2px 8px rgba(3,7,14,.25);
            animation: ps-in .16s ease-out;
        }
        #ps-checker-panel * { box-sizing: border-box; }
        @keyframes ps-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .ps-head {
            display: flex; align-items: center; gap: 8px; min-height: 44px; padding: 0 8px 0 14px;
            font-size: 13.5px; font-weight: 600; background: var(--bg-2); border-bottom: 1px solid var(--line);
        }
        .ps-close {
            margin-left: auto; width: 30px; height: 30px; padding: 0;
            font-size: 15px; color: var(--text-2); background: transparent; border: 0; border-radius: 7px; cursor: pointer;
        }
        .ps-close:hover { color: var(--bad); background: rgba(240,122,126,.13); }
        .ps-body { padding: 14px; overflow-y: auto; }
        .ps-verdict {
            padding: 10px 12px; margin-bottom: 12px; font-weight: 600;
            background: var(--bg-2); border: 1px solid var(--line); border-left: 3px solid var(--text-3); border-radius: 8px;
        }
        .ps-verdict[data-tone="ok"]   { border-left-color: var(--ok); }
        .ps-verdict[data-tone="warn"] { border-left-color: var(--warn); }
        .ps-verdict[data-tone="info"] { border-left-color: var(--accent); }
        .ps-recommend {
            padding: 10px 12px; margin-bottom: 12px; font-size: 12.5px;
            background: rgba(169,156,255,.12); border: 1px solid rgba(169,156,255,.35); border-radius: 8px;
        }
        .ps-stats { display: grid; grid-template-columns: 1fr auto; gap: 4px 12px; margin-bottom: 12px; font-size: 12.5px; color: var(--text-2); }
        .ps-stats b { color: var(--text); text-align: right; font-variant-numeric: tabular-nums; }
        .ps-legend { display: grid; gap: 6px; padding: 10px 12px; margin-bottom: 12px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 8px; font-size: 12px; color: var(--text-2); }
        .ps-legend-item { display: flex; align-items: center; gap: 8px; }
        .ps-swatch { flex: none; width: 14px; height: 14px; border-radius: 4px; }
        .ps-btn {
            width: 100%; height: 32px; margin-top: 6px;
            font: inherit; font-weight: 500; color: var(--text);
            background: var(--bg-3); border: 1px solid var(--line-strong); border-radius: 8px; cursor: pointer;
        }
        .ps-btn:hover { background: var(--bg-hover); }
        .ps-systems { max-height: 180px; margin-top: 8px; overflow-y: auto; padding: 8px; background: #0f1318; border: 1px solid var(--line); border-radius: 8px; }
        .ps-system { padding: 2px 4px; font: 11.5px/1.6 Consolas, "SF Mono", monospace; color: var(--text-2); word-break: break-all; }

        /* Подсветка таблицы на светлой странице */
        .ps-row-completed  { background-color: #f1fbf6 !important; }
        .ps-row-failed     { background-color: #fdf3f3 !important; }
        .ps-row-processing { background-color: #fff6ee !important; }
        .ps-status-completed  { background-color: #ddf5e9 !important; color: #126b45 !important; font-weight: 600 !important; box-shadow: inset 0 0 0 1px #5fcf98 !important; }
        .ps-status-failed     { background-color: #fde3e4 !important; color: #a3262d !important; font-weight: 600 !important; box-shadow: inset 0 0 0 2px #e05a60 !important; }
        .ps-status-processing { background-color: #ffead6 !important; color: #8a4310 !important; font-weight: 600 !important; box-shadow: inset 0 0 0 2px #f2a65a !important; }
        .ps-recurrent { background-color: #e3f0fd !important; color: #13406f !important; font-weight: 700 !important; box-shadow: inset 0 0 0 2px #2f6db3 !important; }
        .ps-recurrent::before { content: "🔄 "; }
        .ps-overpay-failed { background-color: #efecff !important; color: #3f2f8f !important; font-weight: 700 !important; box-shadow: inset 0 0 0 2px #8b7cf0 !important; }
        .ps-overpay-badge {
            display: block; width: fit-content; margin-top: 4px; padding: 2px 8px;
            font-size: 11px; font-weight: 600; color: #fff !important; background: #6a5ad6; border-radius: 999px;
        }
    `;
    document.head.appendChild(style);

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'ps-fab-btn';
    fab.title = 'Проверить платежи и автоплатежи в таблице';
    fab.innerHTML = '<span aria-hidden="true">💳</span><span>Анализ платежей</span>';
    document.body.appendChild(fab);

    const panel = document.createElement('div');
    panel.id = 'ps-checker-panel';
    panel.style.display = 'none';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Анализ платежей');
    panel.innerHTML = `
        <div class="ps-head">💳 Анализ платежей<button type="button" class="ps-close" id="ps-checker-close" title="Закрыть" aria-label="Закрыть">✕</button></div>
        <div class="ps-body">
            <div class="ps-verdict" id="ps-verdict">Таблица ещё не проверена</div>
            <div id="ps-recommendation"></div>
            <div class="ps-stats" id="ps-details"></div>
            <div class="ps-legend">
                <div class="ps-legend-item"><span class="ps-swatch" style="background:#e3f0fd;box-shadow:inset 0 0 0 2px #2f6db3"></span>Completed, система с автоплатежами</div>
                <div class="ps-legend-item"><span class="ps-swatch" style="background:#efecff;box-shadow:inset 0 0 0 2px #8b7cf0"></span>Failed через overpay → «Белорусский банк»</div>
                <div class="ps-legend-item"><span class="ps-swatch" style="background:#ddf5e9;box-shadow:inset 0 0 0 1px #5fcf98"></span>Completed</div>
                <div class="ps-legend-item"><span class="ps-swatch" style="background:#fde3e4;box-shadow:inset 0 0 0 2px #e05a60"></span>Failed</div>
                <div class="ps-legend-item"><span class="ps-swatch" style="background:#ffead6;box-shadow:inset 0 0 0 2px #f2a65a"></span>Processing</div>
            </div>
            <button type="button" class="ps-btn" id="ps-rescan-btn">Проверить заново</button>
            <button type="button" class="ps-btn" id="ps-reset-btn">Снять подсветку</button>
            <button type="button" class="ps-btn" id="ps-toggle-systems-btn">Системы с автоплатежами (${PAYMENT_SYSTEMS.length})</button>
            <div class="ps-systems" id="ps-systems-list-container" style="display:none">
                ${PAYMENT_SYSTEMS.map((s) => `<div class="ps-system">${s}</div>`).join('')}
            </div>
        </div>`;
    document.body.appendChild(panel);

    const $ = (id) => document.getElementById(id);

    function clearHighlighting() {
        document.querySelectorAll('.ps-overpay-badge').forEach((b) => b.remove());
        document.querySelectorAll(CELL_CLASSES.map((c) => `.${c}`).join(',')).forEach((el) => {
            el.classList.remove(...CELL_CLASSES);
            if (el.dataset.psTitle !== undefined) {
                el.title = el.dataset.psTitle;
                delete el.dataset.psTitle;
            }
        });
        document.querySelectorAll(ROW_CLASSES.map((c) => `.${c}`).join(',')).forEach((row) => row.classList.remove(...ROW_CLASSES));
    }

    /** Подсказка на ячейке; исходный title страницы сохраняем, чтобы вернуть при сбросе. */
    function setTitle(el, text) {
        if (el.dataset.psTitle === undefined) el.dataset.psTitle = el.title || '';
        el.title = text;
    }

    function scanAndHighlight() {
        clearHighlighting();
        const stats = { recurrent: 0, completed: 0, failed: 0, processing: 0, overpay: 0 };

        document.querySelectorAll('table tbody tr').forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 5) return;
            const statusCell = cells[1];
            const psCell = cells[4];
            const status = statusCell.textContent.toLowerCase().trim();
            const ps = psCell.textContent.trim();

            if (status.includes('failed')) {
                stats.failed++;
                statusCell.classList.add('ps-status-failed');
                setTitle(statusCell, 'Платёж не прошёл');
                row.classList.add('ps-row-failed');
                if (/overpay/i.test(ps)) {
                    stats.overpay++;
                    psCell.classList.add('ps-overpay-failed');
                    setTitle(psCell, 'Ошибка overpay: предложите оплату через «Белорусский банк»');
                    const badge = document.createElement('div');
                    badge.className = 'ps-overpay-badge';
                    badge.textContent = 'Предложить «Белорусский банк»';
                    psCell.appendChild(badge);
                }
            } else if (status.includes('processing')) {
                stats.processing++;
                statusCell.classList.add('ps-status-processing');
                setTitle(statusCell, 'Платёж в обработке');
                row.classList.add('ps-row-processing');
            } else if (status.includes('completed')) {
                stats.completed++;
                statusCell.classList.add('ps-status-completed');
                setTitle(statusCell, 'Платёж успешно завершён');
                row.classList.add('ps-row-completed');
                if (RECURRENT_RE.test(ps)) {
                    stats.recurrent++;
                    psCell.classList.add('ps-recurrent');
                    setTitle(psCell, 'Эта платёжная система поддерживает автоплатежи');
                }
            }
        });

        const verdict = $('ps-verdict');
        if (stats.recurrent) {
            verdict.dataset.tone = 'ok';
            verdict.textContent = `Платежей с возможным автоплатежом: ${stats.recurrent}`;
        } else if (stats.failed && !stats.completed) {
            verdict.dataset.tone = 'warn';
            verdict.textContent = `Все платежи в статусе failed (${stats.failed})`;
        } else if (stats.completed) {
            verdict.dataset.tone = 'info';
            verdict.textContent = `Завершено: ${stats.completed}. Автоплатежи для этих систем не предусмотрены`;
        } else {
            verdict.dataset.tone = '';
            verdict.textContent = 'Платежи в таблице не найдены';
        }

        $('ps-recommendation').innerHTML = stats.overpay
            ? `<div class="ps-recommend"><b>Overpay с ошибкой: ${stats.overpay}.</b> Предложите клиенту оплатить через «Белорусский банк».</div>`
            : '';

        const lines = [
            ['С автоплатежом', stats.recurrent], ['Completed', stats.completed], ['Failed', stats.failed],
            ['из них overpay', stats.overpay], ['Processing', stats.processing]
        ].filter(([, n]) => n);
        $('ps-details').innerHTML = lines.map(([label, n]) => `<span>${label}</span><b>${n}</b>`).join('');
    }

    function resetHighlight() {
        clearHighlighting();
        $('ps-verdict').dataset.tone = '';
        $('ps-verdict').textContent = 'Подсветка снята';
        $('ps-recommendation').innerHTML = '';
        $('ps-details').innerHTML = '';
    }

    const isOpen = () => panel.style.display !== 'none';
    const closePanel = () => { panel.style.display = 'none'; };

    fab.addEventListener('click', () => {
        if (isOpen()) { closePanel(); return; }
        panel.style.display = 'flex';
        scanAndHighlight();
    });

    $('ps-toggle-systems-btn').addEventListener('click', () => {
        const list = $('ps-systems-list-container');
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
    });
    $('ps-checker-close').addEventListener('click', closePanel);
    $('ps-reset-btn').addEventListener('click', resetHighlight);
    $('ps-rescan-btn').addEventListener('click', scanAndHighlight);

    document.addEventListener('mousedown', (e) => {
        if (isOpen() && !panel.contains(e.target) && !fab.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closePanel(); });
})();
