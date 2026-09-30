/**
 * CRMSpecial.js — ☄️ CRM Спец.ком.
 *
 * Мониторинг Education Services / Education Service Kits пользователя:
 * спец. комментарий оператора, спец. особенности контракта, корп. договор,
 * баланс, стадии (stage / lost), вложенные в комплектацию услуги.
 *
 * Интеграция в ChMAF (по аналогии с CRMcomments.js):
 *   • окно создаётся через createWindow() из utils.js;
 *   • перетаскивание — класс .chmaf-drag-handle (enableDrag из utils.js);
 *   • сетевые запросы идут через background (bg.js, action getFetchRequest),
 *     потому что прямой fetch из content script на backend.skyeng.ru
 *     блокируется CORS (у content script origin skyeng.autofaq.ai);
 *   • все слушатели вешаются на cleanupRegistry.signal;
 *   • стили заскоплены под #AF_CRMSPecial и не влияют на другие окна;
 *   • публичная точка входа: window.getbutCRMSPecialButtonPress()
 *     (пункт меню buttonCRMSPecial в MODULE_MENU_CONFIG, utils.js).
 *
 * Порядок загрузки в manifest.json: после CRMcomments.js, до content.js.
 */

window.__CRMSpecialLoaded = true;
console.log('[CRMSpecial] loaded');
var win_CRMSPecialUI = `
<div id="skyeng-header" class="chmaf-drag-handle">
    <span id="skyeng-header-title">☄️ CRM Спец.ком (Мониторинг)</span>
    <div id="skyeng-status"></div>
    <button id="hidecrmsp" type="button" title="Скрыть">✕</button>
</div>
<div id="skyeng-body">
    <div class="skyeng-row">
        <input id="skyeng-input" type="text" inputmode="numeric" placeholder="Введите ID пользователя..." autocomplete="off" />
        <button id="skyeng-btn" type="button">🔍 Загрузить</button>
    </div>
    <hr class="skyeng-divider" />

    <div class="skyeng-section-title">📚 Услуги</div>
    <div id="skyeng-services-wrap"><div class="skyeng-empty">Нет данных</div></div>

    <div class="skyeng-section-title">📋 Детали Услуги</div>
    <div id="skyeng-services-detail"><div class="skyeng-empty">Нет данных</div></div>

    <hr class="skyeng-divider" />

    <div class="skyeng-section-title">📦 Комплектации</div>
    <div id="skyeng-kits-wrap"><div class="skyeng-empty">Нет данных</div></div>

    <div class="skyeng-section-title">📋 Детали Комплектации</div>
    <div id="skyeng-kits-detail"><div class="skyeng-empty">Нет данных</div></div>
</div>`;

/* Все селекторы заскоплены под #AF_CRMSPecial: модуль не должен
   переопределять чужие окна (details summary, .note-content и т.п.). */
var win_CRMSPecialCSS = `
#AF_CRMSPecial {
    width: 1200px;
    max-width: calc(100vw - 32px);
    max-height: 90vh;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Segoe UI', sans-serif;
    font-size: 13px;
    color: #cdd6f4;
}
#AF_CRMSPecial #skyeng-body {
    padding: 14px;
    overflow: auto;
    flex: 1 1 auto;
    min-height: 0;
}
#AF_CRMSPecial #skyeng-body::-webkit-scrollbar { width: 6px; height: 6px; }
#AF_CRMSPecial #skyeng-body::-webkit-scrollbar-track { background: transparent; }
#AF_CRMSPecial #skyeng-body::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }

#AF_CRMSPecial #skyeng-header {
    background: #313244;
    padding: 10px 14px;
    border-radius: 13px 13px 0 0;
    cursor: grab;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 14px;
    gap: 12px;
    flex: 0 0 auto;
    touch-action: none;
}
#AF_CRMSPecial #skyeng-header:active { cursor: grabbing; }
#AF_CRMSPecial #skyeng-header-title { flex-shrink: 0; white-space: nowrap; }

#AF_CRMSPecial #skyeng-status {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
    min-width: 60px;
    text-align: center;
    white-space: nowrap;
    transition: all 0.25s ease;
    background: transparent;
    color: #9399b2;
    border: 1px solid transparent;
    flex-shrink: 1;
    flex-grow: 0;
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
}
#AF_CRMSPecial #skyeng-status.status-ok {
    background: rgba(166, 227, 161, 0.12);
    color: #a6e3a1;
    border-color: rgba(166, 227, 161, 0.4);
}
#AF_CRMSPecial #skyeng-status.status-err {
    background: rgba(243, 139, 168, 0.12);
    color: #f38ba8;
    border-color: rgba(243, 139, 168, 0.4);
}
#AF_CRMSPecial #skyeng-status.status-load {
    background: rgba(250, 179, 135, 0.12);
    color: #fab387;
    border-color: rgba(250, 179, 135, 0.4);
    animation: crsp-status-pulse 1.4s ease-in-out infinite;
}
@keyframes crsp-status-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.55; }
}

#AF_CRMSPecial #hidecrmsp {
    background: #f38ba8;
    border: none;
    color: #1e1e2e;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    font-weight: bold;
    font-size: 12px;
    line-height: 1;
    flex-shrink: 0;
    padding: 0;
}

#AF_CRMSPecial .skyeng-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
#AF_CRMSPecial #skyeng-input {
    flex: 1;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #585b70;
    background: #181825;
    color: #cdd6f4;
    font-size: 13px;
    outline: none;
    user-select: text;
    box-sizing: border-box;
}
#AF_CRMSPecial #skyeng-input:focus { border-color: #89b4fa; }
#AF_CRMSPecial #skyeng-btn {
    padding: 8px 16px;
    background: #89b4fa;
    color: #1e1e2e;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 13px;
    white-space: nowrap;
}
#AF_CRMSPecial #skyeng-btn:hover { background: #b4d0fc; }
#AF_CRMSPecial #skyeng-btn:disabled { background: #585b70; cursor: not-allowed; }

#AF_CRMSPecial .skyeng-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #89b4fa;
    letter-spacing: 0.8px;
    margin-bottom: 6px;
    margin-top: 14px;
}
#AF_CRMSPecial .skyeng-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 4px; }
#AF_CRMSPecial .skyeng-table th {
    background: #313244;
    color: #89b4fa;
    padding: 5px 8px;
    text-align: left;
    border-bottom: 1px solid #444;
}
#AF_CRMSPecial .skyeng-table td {
    padding: 5px 8px;
    border-bottom: 1px solid #2a2a3e;
    color: #cdd6f4;
    word-break: break-word;
}
#AF_CRMSPecial .skyeng-table tr:hover td { background: #2a2a3e; }
#AF_CRMSPecial .skyeng-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    background: #313244;
    color: #a6e3a1;
    border: 1px solid #a6e3a1;
}
#AF_CRMSPecial .skyeng-badge-blue {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    background: #313244;
    color: #89b4fa;
    border: 1px solid #89b4fa;
}
#AF_CRMSPecial .skyeng-empty { color: #7f849c; font-style: italic; font-size: 12px; padding: 6px 0; }
#AF_CRMSPecial .dim-text { color: #9399b2; }
#AF_CRMSPecial .faint-text { color: #7f849c; }
#AF_CRMSPecial .skyeng-divider { border: none; border-top: 1px solid #313244; margin: 12px 0; }
#AF_CRMSPecial .skyeng-hint { font-size: 10px; color: #9399b2; margin-top: 4px; }
`;

/* Часть 2/3: статусы-теги, пилюли, спойлер lost. */
var win_CRMSPecialCSS2 = `
#AF_CRMSPecial .tag-balance-ok { color: #a6e3a1; font-weight: 700; }
#AF_CRMSPecial .tag-balance-zero { color: #f38ba8; font-weight: 700; }

/* Баланс — круглая пилюля */
#AF_CRMSPecial .balance-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin: 6px 0 4px 0;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.3px;
    border: 1px solid;
    width: fit-content;
}
#AF_CRMSPecial .balance-pill--plus {
    color: #a6e3a1;
    background: rgba(166, 227, 161, 0.12);
    border-color: rgba(166, 227, 161, 0.45);
}

#AF_CRMSPecial .balance-pill--minus {
    color: #f38ba8;
    background: rgba(243, 139, 168, 0.12);
    border-color: rgba(243, 139, 168, 0.45);
}

#AF_CRMSPecial .balance-pill--zero {
    color: #9399b2;
    background: rgba(147, 153, 178, 0.1);
    border-color: rgba(147, 153, 178, 0.35);
}
#AF_CRMSPecial .balance-pill--none {
    color: #7f849c;
    background: transparent;
    border-color: #313244;
    font-size: 12px;
    font-weight: 600;
}


#AF_CRMSPecial .tag-stage {
    background: rgba(137, 180, 250, 0.15);
    color: #89b4fa;
    border: 1px solid rgba(137, 180, 250, 0.4);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
}
#AF_CRMSPecial .tag-incorrect {
    background: rgba(250, 179, 135, 0.15);
    color: #fab387;
    border: 1px solid rgba(250, 179, 135, 0.5);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
}
#AF_CRMSPecial .tag-lost {
    background: rgba(203, 166, 247, 0.18);
    color: #cba6f7;
    border: 1px solid rgba(203, 166, 247, 0.5);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    box-shadow: 0 0 0 1px rgba(203, 166, 247, 0.1);
    margin-left: 4px;
}
#AF_CRMSPecial .tag-mini {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    margin-left: 4px;
    vertical-align: middle;
}
#AF_CRMSPecial .tag-fallback {
    background: rgba(137, 180, 250, 0.18);
    color: #89b4fa;
    border: 1px solid rgba(137, 180, 250, 0.5);
}
#AF_CRMSPecial .tag-from-kit {
    background: rgba(250, 179, 135, 0.15);
    color: #fab387;
    border: 1px solid rgba(250, 179, 135, 0.4);
}
#AF_CRMSPecial .loading-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #313244;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 11px;
    color: #fab387;
    margin: 4px 0;
}

#AF_CRMSPecial .summary-bar { display: flex; gap: 8px; margin: 8px 0 12px 0; flex-wrap: wrap; }
#AF_CRMSPecial .summary-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.3px;
    border: 1px solid;
}
#AF_CRMSPecial .summary-pill.active {
    background: rgba(166, 227, 161, 0.1);
    color: #a6e3a1;
    border-color: rgba(166, 227, 161, 0.35);
}
#AF_CRMSPecial .summary-pill.lost {
    background: rgba(203, 166, 247, 0.15);
    color: #cba6f7;
    border-color: rgba(203, 166, 247, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 0 0 1px rgba(203, 166, 247, 0.15);
}
#AF_CRMSPecial .summary-pill.nested {
    background: rgba(250, 179, 135, 0.12);
    color: #fab387;
    border-color: rgba(250, 179, 135, 0.4);
}
#AF_CRMSPecial .summary-pill .pill-count { font-size: 14px; font-weight: 800; }

#AF_CRMSPecial .lost-spoiler { margin-top: 12px; }
#AF_CRMSPecial .lost-spoiler > summary {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 7px 16px;
    border-radius: 20px;
    background: rgba(203, 166, 247, 0.12);
    color: #cba6f7;
    border: 1px solid rgba(203, 166, 247, 0.45);
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.4px;
    list-style: none;
    user-select: none;
    transition: background 0.2s ease;
}
#AF_CRMSPecial .lost-spoiler > summary:hover { background: rgba(203, 166, 247, 0.22); }
#AF_CRMSPecial .lost-spoiler > summary::-webkit-details-marker { display: none; }
#AF_CRMSPecial .lost-spoiler > summary::before {
    content: '▶';
    display: inline-block;
    transition: transform 0.2s;
    font-size: 10px;
}
#AF_CRMSPecial .lost-spoiler[open] > summary { margin-bottom: 10px; }
#AF_CRMSPecial .lost-spoiler[open] > summary::before { transform: rotate(90deg); }
#AF_CRMSPecial .lost-spoiler-body { opacity: 0.92; }
`;

/* Часть 3/3: таблицы мониторинга, дочерние строки, заметки. */
var win_CRMSPecialCSS3 = `
#AF_CRMSPecial .skyeng-monitor-table { min-width: 1100px; }
#AF_CRMSPecial .skyeng-monitor-table th {
    position: sticky;
    top: 0;
    z-index: 2;
    background: #313244;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
#AF_CRMSPecial .skyeng-monitor-table td { vertical-align: top; min-width: 90px; }

#AF_CRMSPecial tr.child-row td {
    background: rgba(250, 179, 135, 0.05);
    border-bottom-color: rgba(250, 179, 135, 0.18);
}
#AF_CRMSPecial tr.child-row:hover td { background: rgba(250, 179, 135, 0.1); }
#AF_CRMSPecial tr.child-row td:first-child {
    border-left: 3px solid #fab387;
    padding-left: 14px;
}

/* FALLBACK-родитель: вся строка выделена ФИОЛЕТОВЫМ — контраст к
   оранжевым дочерним строкам (у тех левая полоса и заливка #fab387) */
#AF_CRMSPecial tr.fallback-row td {
    background: rgba(137, 180, 250, 0.12);
    border-bottom-color: rgba(137, 180, 250, 0.4);
}
#AF_CRMSPecial tr.fallback-row:hover td { background: rgba(137, 180, 250, 0.2); }
#AF_CRMSPecial tr.fallback-row td:first-child {
    border-left: 4px solid #89b4fa;
}
#AF_CRMSPecial tr.fallback-row td.note-cell,
#AF_CRMSPecial tr.fallback-row td.note-cell-highlight {
    background: rgba(137, 180, 250, 0.16) !important;
}
#AF_CRMSPecial .child-tree { color: #fab387; font-weight: 800; margin-right: 4px; font-size: 13px; }

#AF_CRMSPecial .note-cell {
    background: rgba(203, 166, 247, 0.05) !important;
    border-radius: 6px;
    padding: 8px !important;
}
#AF_CRMSPecial .note-cell-highlight {
    background: rgba(250, 179, 135, 0.08) !important;
    border-radius: 6px;
    padding: 8px !important;
}
#AF_CRMSPecial tr.child-row td.note-cell-highlight { background: rgba(250, 179, 135, 0.12) !important; }
#AF_CRMSPecial .note-content {
    margin-top: 6px;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 13px;
    line-height: 1.5;
    color: #cdd6f4;
    background: rgba(17, 17, 27, 0.6);
    padding: 8px;
    border-radius: 4px;
    border-left: 3px solid #89b4fa;
    max-height: 250px;
    overflow-y: auto;
    user-select: text;
    cursor: text;
}
#AF_CRMSPecial .note-content.corp-note {
    border-left-color: #f38ba8;
    color: #f9e2af;
    max-height: 400px;
}

#AF_CRMSPecial details > summary {
    font-weight: 600;
    outline: none;
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #89b4fa;
}
#AF_CRMSPecial details > summary::-webkit-details-marker { display: none; }
#AF_CRMSPecial details > summary::before {
    content: '▶';
    display: inline-block;
    transition: transform 0.2s;
    font-size: 9px;
    color: #7f849c;
}
#AF_CRMSPecial details[open] > summary::before { transform: rotate(90deg); color: #89b4fa; }
#AF_CRMSPecial details[open] > summary { margin-bottom: 6px; }
#AF_CRMSPecial details > summary:hover { text-decoration: underline; }

#AF_CRMSPecial .status-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px dashed #313244;
}
#AF_CRMSPecial .nested-info { color: #fab387; font-size: 10px; margin-top: 2px; font-weight: 600; }
#AF_CRMSPecial .corp-link {
    color: #89b4fa;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px dashed rgba(137, 180, 250, 0.5);
}
#AF_CRMSPecial .corp-link:hover { color: #b4d0fc; border-bottom-color: #b4d0fc; }
`;

const CRSP_WINDOW_ID = 'AF_CRMSPecial';

function crspWindowContent() {
    return win_CRMSPecialUI +
        '<style>' +
        win_CRMSPecialCSS +
        win_CRMSPecialCSS2 +
        win_CRMSPecialCSS3 +
        '</style>';
}

/* Резерв: если utils.js недоступен/упал, строим окно сами, чтобы кнопка
   всё равно работала, а не молча ничего не делала. */
function crspCreateFallbackWindow() {
    const element = document.createElement('div');
    const storedTop = Number(window.localStorage.getItem('winTopCRMSPecial'));
    const storedLeft = Number(window.localStorage.getItem('winLeftCRMSPecial'));

    element.id = CRSP_WINDOW_ID;
    element.className = 'extwindows';
    element.style.cssText =
        `position:fixed;top:${Number.isFinite(storedTop) ? storedTop : 120}px;` +
        `left:${Number.isFinite(storedLeft) ? storedLeft : 295}px;display:none;`;

    element.innerHTML = crspWindowContent();
    document.body.appendChild(element);

    element.querySelector('#hidecrmsp')?.addEventListener('click', () => {
        element.style.display = 'none';
    });

    return element;
}

let crspBoundWindow = null;
let crspApi = null;

/**
 * Идемпотентно создаёт окно (через родной createWindow из utils.js) и
 * однократно навешивает скрытие. Вызывается и при загрузке, и лениво —
 * при первом клике по пункту меню.
 */
function ensureCRMSPecialWindow() {
    let win = document.getElementById(CRSP_WINDOW_ID);

    if (!win) {
        try {
            if (typeof createWindow !== 'function') {
                throw new Error('createWindow недоступен — utils.js не загружен');
            }

            win = createWindow(
                CRSP_WINDOW_ID,
                'winTopCRMSPecial',
                'winLeftCRMSPecial',
                crspWindowContent()
            );
        } catch (error) {
            console.error('[CRM Спец.ком] createWindow не сработал:', error);

            win = crspCreateFallbackWindow();

            window.showCustomAlert?.(
                'CRM Спец.ком: окно создано в резервном режиме — ' + error.message,
                'warning'
            );
        }
    }

    if (win && crspBoundWindow !== win) {
        // Скрывать нужно именно этот DOM-узел: если окно пересоздали,
        // старые слушатели уехали вместе с ним.
        crspBoundWindow = win;

        try {
            if (typeof hideWindowOnClick === 'function') {
                hideWindowOnClick(CRSP_WINDOW_ID, 'hidecrmsp');
            }

            if (typeof hideWindowOnDoubleClick === 'function') {
                hideWindowOnDoubleClick(CRSP_WINDOW_ID);
            }
        } catch (error) {
            console.error('[CRM Спец.ком] Не удалось навесить скрытие окна:', error);
        }
    }

    return win;
}

/**
 * Публичная точка входа для пункта меню buttonCRMSPecial (utils.js).
 * Если окна/обработчиков ещё нет — создаёт их на месте (самолечение),
 * поэтому «мёртвая» кнопка невозможна.
 */
function getbutCRMSPecialButtonPress() {
    const win = ensureCRMSPecialWindow();

    if (!win) {
        console.error('[CRM Спец.ком] окно недоступно');
        window.showCustomAlert?.('CRM Спец.ком: не удалось создать окно', 'error');
        return;
    }

    initCRMSPecialModule();

    const isHidden = getComputedStyle(win).display === 'none';

    win.style.display = isHidden ? 'flex' : 'none';

    if (isHidden) {
        win.querySelector('#skyeng-input')?.focus();
    }
}

/**
 * Публичный хук для других модулей: подставить ID и загрузить данные.
 * window.getCRMSPecialData('123456')
 */
function getCRMSPecialData(userId) {
    const api = initCRMSPecialModule();
    const input = document.getElementById('skyeng-input');

    if (userId !== undefined && input) {
        input.value = String(userId).replace(/\D/g, '');
    }

    return api ? api.load() : Promise.resolve();
}



console.log('[CRMSpecial] registering public API');
window.getbutCRMSPecialButtonPress = getbutCRMSPecialButtonPress;
window.getCRMSPecialData = getCRMSPecialData;
console.log('[CRMSpecial] public API registered');

function initCRMSPecialModule() {
    'use strict';

    const panel = ensureCRMSPecialWindow();

    if (!panel) return null;

    // Окно могли пересоздать (удалили из DOM) — тогда инициализацию нужно
    // повторить на новом узле, иначе кнопка «🔍 Загрузить» станет мёртвой.
    if (crspApi && crspApi.panel === panel) return crspApi;


    const statusEl = document.getElementById('skyeng-status');
    const inputEl = document.getElementById('skyeng-input');
    const runBtn = document.getElementById('skyeng-btn');

    const crspSignal =
        (typeof cleanupRegistry !== 'undefined' && cleanupRegistry.signal) ||
        undefined;

    const isAborted = () => Boolean(crspSignal?.aborted);

    function crspOn(target, type, handler) {
        if (!target) return;
        target.addEventListener(
            type,
            handler,
            crspSignal ? { signal: crspSignal } : false
        );
    }

    function crspReadLS(key, fallback = null) {
        try {
            if (typeof readLocalStorage === 'function') {
                return readLocalStorage(key, fallback);
            }
            const value = localStorage.getItem(key);
            return value === null ? fallback : value;
        } catch (error) {
            return fallback;
        }
    }

    function crspWriteLS(key, value) {
        try {
            if (typeof writeLocalStorage === 'function') {
                return writeLocalStorage(key, value);
            }
            localStorage.setItem(key, String(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    // ===== СТАТУС В ШАПКЕ =====
    const setStatus = (msg, type = 'ok') => {
        if (!statusEl) return;

        statusEl.classList.remove('status-ok', 'status-err', 'status-load');

        if (type) statusEl.classList.add('status-' + type);

        const icons = { ok: '✅', err: '❌', load: '⏳' };

        statusEl.textContent = `${icons[type] || ''} ${msg}`;
        statusEl.title = String(msg);
    };

    const setHtml = (id, html) => {
        const target = document.getElementById(id);
        if (target) target.innerHTML = html;
    };

    // ===== ХЕЛПЕРЫ ДАННЫХ =====
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';

        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function stageTag(stage, isIncorrect = false) {
        if (isIncorrect) {
            /* У некорректных услуг вместо stage — явный бейдж */
            return '<span class="tag-incorrect">⚠️ Некорректная услуга</span>';
        }

        return stage === 'lost'
            ? '<span class="tag-lost">lost</span>'
            : `<span class="tag-stage">${escapeHtml(stage || '—')}</span>`;
    }

    /* Порог автораскрытия заметок: до 200 симв. — спойлер открыт,
       свыше — по умолчанию свёрнут. */
    const NOTE_AUTOCOLLAPSE_LIMIT = 200;
    const noteDetailsAttrs = length =>
        length > NOTE_AUTOCOLLAPSE_LIMIT ? '' : 'open';

    // stage из любого объекта (detail или item списка)
    function getStage(obj) {
        if (!obj || typeof obj !== 'object') return undefined;
        if ('stage' in obj && obj.stage) return obj.stage;
        return pick(obj, 'stage');
    }

    /* Некорректная услуга: где-либо в ответе есть непустое
       incorrectnessReason. Такие услуги нельзя дальше парсить —
       запросы их деталей (например, вложенных в кит) отдают 500. */
    function getIncorrectness(obj) {
        if (!obj || typeof obj !== 'object') return null;

        const val = obj.incorrectnessReason ?? pick(obj, 'incorrectnessReason');

        return (val === null || val === undefined || val === '')
            ? null
            : String(val);
    }

    function toArray(raw) {
        if (Array.isArray(raw)) return raw;

        if (raw && typeof raw === 'object') {
            for (const key of ['data', 'items', 'results', 'services', 'kits']) {
                if (Array.isArray(raw[key])) return raw[key];
            }

            return [raw];
        }

        return [];
    }

    function deepFind(obj, predicate, depth = 0) {
        if (!obj || typeof obj !== 'object' || depth > 8) return null;
        if (!Array.isArray(obj) && predicate(obj)) return obj;

        const values = Array.isArray(obj) ? obj : Object.values(obj);

        for (const value of values) {
            if (value && typeof value === 'object') {
                const found = deepFind(value, predicate, depth + 1);
                if (found) return found;
            }
        }

        return null;
    }

    function unwrapObject(raw, markerKeys = ['id'], minKeys = 5) {
        if (!raw || typeof raw !== 'object') return {};

        const isMarked = candidate =>
            candidate &&
            typeof candidate === 'object' &&
            !Array.isArray(candidate) &&
            markerKeys.every(key => key in candidate) &&
            Object.keys(candidate).length >= minKeys;

        if (isMarked(raw)) return raw;

        const found = deepFind(raw, isMarked);

        return found || (Array.isArray(raw) ? (raw[0] || {}) : raw);
    }

    function pick(obj, key) {
        if (obj && typeof obj === 'object' && key in obj) return obj[key];
        if (!obj || typeof obj !== 'object') return undefined;

        const holder = deepFind(
            obj,
            candidate =>
                candidate &&
                typeof candidate === 'object' &&
                !Array.isArray(candidate) &&
                key in candidate
        );

        return holder ? holder[key] : undefined;
    }

    const EXCLUDED = ['self_study', 'talks', 'life_adult'];
    const shouldInclude = key => !EXCLUDED.some(ex => key.includes(ex));

    // ===== ЗАПРОСЫ ЧЕРЕЗ BACKGROUND (bg.js) =====
    // Прямой fetch из content script на backend.skyeng.ru блокируется CORS,
    // поэтому все запросы идут через service worker расширения.
    const CRSP_REQUEST_OPTIONS = Object.freeze({
        method: 'GET',
        headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'ru'
        },
        referrer: 'https://crm2.skyeng.ru/',
        credentials: 'include'
    });

    function crspFetchJson(url) {
        return new Promise((resolve, reject) => {
            if (isAborted()) {
                reject(new Error('Модуль выгружен'));
                return;
            }

            if (!globalThis.chrome?.runtime?.sendMessage) {
                reject(new Error('API расширения недоступно'));
                return;
            }

            try {
                chrome.runtime.sendMessage(
                    {
                        action: 'getFetchRequest',
                        fetchURL: url,
                        requestOptions: CRSP_REQUEST_OPTIONS
                    },
                    response => {
                        const runtimeError = chrome.runtime?.lastError;

                        if (runtimeError) {
                            reject(new Error(runtimeError.message));
                            return;
                        }

                        if (!response?.success) {
                            reject(
                                new Error(
                                    response?.error ||
                                    `Ошибка запроса: ${url}`
                                )
                            );
                            return;
                        }

                        const text = String(response.fetchansver ?? '');

                        if (!text.trim()) {
                            resolve({});
                            return;
                        }

                        try {
                            resolve(JSON.parse(text));
                        } catch (error) {
                            reject(
                                new Error('Сервер вернул некорректный JSON')
                            );
                        }
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    // Историческое имя из автономной версии модуля.
    const skyFetch = crspFetchJson;

    async function skyFetchKitDetail(kitId, userId) {
        const primaryUrl =
            `https://backend.skyeng.ru/api/v1/students/${userId}` +
            `/education-service-kits/${kitId}/general/`;

        const fallbackUrl =
            'https://backend.skyeng.ru/api/v1/education-service-kits/' +
            `${kitId}/`;

        try {
            return await skyFetch(primaryUrl);
        } catch (primaryError) {
            // bg.js отдаёт ошибки вида «HTTP 404: ...»
            if (/HTTP\s*404/.test(primaryError.message)) {
                try {
                    const fallbackData = await skyFetch(fallbackUrl);

                    if (
                        fallbackData &&
                        typeof fallbackData === 'object' &&
                        !Array.isArray(fallbackData)
                    ) {
                        fallbackData._source = 'fallback';
                    }

                    return fallbackData;
                } catch (fallbackError) {
                    throw primaryError;
                }
            }

            throw primaryError;
        }
    }

    // ===== RENDER: верхние таблицы =====
    function renderServicesTable(data) {
        if (!data.length) {
            return '<div class="skyeng-empty">Нет записей после фильтрации</div>';
        }

        const lostCount = data.filter(item => item.stage === 'lost').length;

        return `
            <table class="skyeng-table">
                <thead>
                    <tr><th>#</th><th>ID</th><th>serviceTypeKey</th><th>Stage</th></tr>
                </thead>
                <tbody>${data.map((item, index) => `
                    <tr>
                        <td class="dim-text">${index + 1}</td>
                        <td><span class="skyeng-badge">${escapeHtml(item.id)}</span></td>
                        <td>${escapeHtml(item.serviceTypeKey)}</td>
                        <td>${stageTag(item.stage, Boolean(item._incorrectReason))}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
            <div class="skyeng-hint">Итого: ${data.length}
                (исключены self_study/talks/life_adult).
                Потерянных (lost): ${lostCount}.</div>
        `;
    }

    function renderKitsTable(data, nestedCountsByKit) {
        if (!data.length) {
            return '<div class="skyeng-empty">Пустой массив</div>';
        }

        const lostCount = data.filter(item => item.stage === 'lost').length;

        return `
            <table class="skyeng-table">                    <thead>
                <tr><th>#</th><th>ID</th><th>Продукт</th><th>Stage</th></tr>
            </thead>
                <tbody>${data.map((item, index) => {
            const productTitle =
                item.productKit?.title ||
                item.productKit?.code ||
                '—';

            const nestedCount = nestedCountsByKit[item.id] || 0;

            return `
                    <tr>
                        <td class="dim-text">${index + 1}</td>
                        <td><span class="skyeng-badge-blue">${escapeHtml(item.id)}</span></td>
                        <td>
                            ${escapeHtml(productTitle)}
                            ${nestedCount > 0
                    ? `<div class="nested-info">↳ ${nestedCount} вложенных услуг</div>`
                    : ''}
                        </td>
                        <td>${stageTag(item.stage, Boolean(item._incorrectReason))}</td>
                    </tr>`;
        }).join('')}
                </tbody>
            </table>
            <div class="skyeng-hint">Итого: ${data.length} китов.
                Потерянных (lost): ${lostCount}.</div>
        `;
    }

    // ===== RENDER: строка мониторинга =====
    function renderMonitorRow(rawDetail, opts = {}) {
        const isChild = Boolean(opts.childOfKitId);
        const service = unwrapObject(rawDetail, ['id']);

        if (
            service.id === undefined &&
            service.serviceTypeKey === undefined &&
            !service.productKit &&
            pick(rawDetail, 'id') === undefined
        ) {
            return `<tr class="${isChild ? 'child-row' : ''}"><td colspan="5" class="note-cell">
                <details open>
                    <summary style="color:#f38ba8">⚠️ Нераспознанная структура ответа — показать raw</summary>
                    <div class="note-content">${escapeHtml(JSON.stringify(rawDetail, null, 2))}</div>
                </details>
            </td></tr>`;
        }

        const id = service.id ?? pick(rawDetail, 'id') ?? '?';
        const serviceTypeKey =
            service.serviceTypeKey ?? pick(rawDetail, 'serviceTypeKey');

        const productTitle =
            service.productKit?.title ??
            service.productKit?.code ??
            pick(rawDetail, 'productKit')?.title;

        const type = serviceTypeKey || productTitle || '—';
        const isKit = Boolean(productTitle) && !serviceTypeKey;
        const kindIcon = isKit ? '📦' : '🎓';

        const createdAtRaw = service.createdAt ?? pick(rawDetail, 'createdAt');
        const createdAt = createdAtRaw
            ? String(createdAtRaw).slice(0, 10)
            : '—';

        const stage = service.stage ?? pick(rawDetail, 'stage') ?? '—';
        const stageDb =
            service.stageFromClientDb ??
            pick(rawDetail, 'stageFromClientDb') ??
            '—';

        const crisis =
            service.isOnCrisisSupport ??
            pick(rawDetail, 'isOnCrisisSupport');

        const balance = service.balance ?? pick(rawDetail, 'balance');
        const balanceView =
            (balance === undefined || balance === null) ? '—' : balance;

        const corpRaw = service.corporate ?? pick(rawDetail, 'corporate');
        const corp = corpRaw ?? {};
        const companyName = corp.companyName ?? pick(rawDetail, 'companyName');

        // Ссылка на компанию нужна только тем, у кого есть corporate;
        // companyId обычно лежит в data.corporate.companyId (например, 331).
        const companyId = corpRaw
            ? (corp.companyId ?? pick(rawDetail, 'companyId'))
            : undefined;

        const companyLink = (companyId !== undefined && companyId !== null)
            ? `<a class="corp-link" href="https://crm2.skyeng.ru/companies/${encodeURIComponent(companyId)}" target="_blank" rel="noopener noreferrer" title="Открыть компанию в CRM2">🔗 ID компании: ${escapeHtml(companyId)}</a>`
            : '';

        const contract =
            corp.contract ?? pick(rawDetail, 'contract') ?? {};

        const contractTitle = contract.title ?? '—';
        const contractId = contract.id;

        const hasContractId = contractId !== undefined && contractId !== null;
        const hasCompanyId = companyId !== undefined && companyId !== null;

        // Ссылка на контракт по схеме CRM2 (нужны и companyId, и contractId):
        // https://crm2.skyeng.ru/companies/331/contracts/187302
        // без companyId остаётся просто текст — URL построить не из чего.
        const contractLine = !hasContractId
            ? '<span class="dim-text">Договор: —</span>'
            : (hasCompanyId
                ? `<a class="corp-link" href="https://crm2.skyeng.ru/companies/${encodeURIComponent(companyId)}/contracts/${encodeURIComponent(contractId)}" target="_blank" rel="noopener noreferrer" title="Открыть контракт в CRM2">🔗 Договор #${escapeHtml(contractId)}</a>`
                : `<span class="dim-text">Договор #${escapeHtml(contractId)}</span>`);

        const specialNote =
            contract.specialNote ?? pick(rawDetail, 'specialNote') ?? '';

        const opNote =
            service.operatorNote ?? pick(rawDetail, 'operatorNote') ?? '';

        const balNum = Number(balanceView);

        /* Баланс — круглая пилюля: цвет и иконка зависят от знака,
           чтобы отношение к балансу считывалось мгновенно */
        const balancePill = (balance === null || balance === undefined)
            ? '<span class="balance-pill balance-pill--none">баланс: —</span>'
            : `<span class="balance-pill ${
                balNum > 0 ? 'balance-pill--plus' : (balNum < 0 ? 'balance-pill--minus' : 'balance-pill--zero')
            }" title="${balNum > 0 ? 'Позитивный баланс' : (balNum < 0 ? 'Отрицательный баланс (долг)' : 'Нулевой баланс')}">
                ${escapeHtml(balanceView)}
            </span>`;

        const corpCell = (companyName || companyLink || hasContractId)
            ? `${companyName ? `<strong style="color:#fab387">🏢 ${escapeHtml(companyName)}</strong><br>` : ''}${companyLink ? `${companyLink}<br>` : ''}<span style="color:#cdd6f4">${escapeHtml(contractTitle)}</span><br>${contractLine}`
            : '<span class="dim-text">—</span>';

        /* FALLBACK-кит (загружен через резервный URL) — родитель,
           ниже в таблице идут его вложенные дети: подсвечиваем строку целиком */
        const isFallback = rawDetail?._source === 'fallback';

        const fallbackTag = isFallback
            ? '<span class="tag-mini tag-fallback">FALLBACK</span>'
            : '';

        const childTag = isChild
            ? `<span class="tag-mini tag-from-kit">↳ kit#${escapeHtml(opts.childOfKitId)}</span>`
            : '';

        return `
            <tr class="${[isChild ? 'child-row' : '', isFallback ? 'fallback-row' : ''].filter(Boolean).join(' ')}">
                <td class="note-cell-highlight">
                    ${opNote ? `<details ${noteDetailsAttrs(opNote.length)}>
                        <summary>📝 Читать заметку (${opNote.length} симв.)</summary>
                        <div class="note-content">${escapeHtml(opNote).replace(/\n/g, '<br>')}</div>
                    </details>` : '<span class="faint-text">Нет заметок</span>'}
                </td>
                <td class="note-cell">
                    ${specialNote ? `<details ${noteDetailsAttrs(specialNote.length)}>
                        <summary style="color:#f38ba8">⚠️ Спец. заметка (${specialNote.length} симв.) — нажми, чтобы раскрыть/свернуть</summary>
                        <div class="note-content corp-note">${escapeHtml(specialNote).replace(/\n/g, '<br>')}</div>
                    </details>` : '<span class="faint-text">Нет спец. заметки</span>'}
                </td>
                <td>${corpCell}</td>
                <td>
                    <div class="status-group">
                        ${stageTag(stage, Boolean(getIncorrectness(rawDetail)))}
                        ${getIncorrectness(rawDetail) ? '' : `<span class="tag-stage">${escapeHtml(stageDb)}</span>`}
                        ${crisis ? '<span class="tag-stage" style="background:rgba(243,139,168,0.15);color:#f38ba8;border-color:rgba(243,139,168,0.4);">⚠️ Кризисный</span>' : ''}
                    </div>
                    ${balancePill}
                </td>
                <td>
                    ${isChild ? '<span class="child-tree">└─</span>' : ''}<strong style="color:#a6e3a1">${kindIcon} #${escapeHtml(id)}</strong>${fallbackTag}${childTag}<br>
                    <small style="color:#cba6f7">${escapeHtml(type)}</small><br>
                    <small class="dim-text">Создано: ${escapeHtml(createdAt)}</small>
                </td>
            </tr>
        `;
    }

    function errorRow(data, colCount, isChild = false) {
        return `<tr class="${isChild ? 'child-row' : ''}"><td colspan="${colCount}" style="color:#f38ba8">${isChild ? '<span class="child-tree">└─</span> ' : ''}❌ ID ${escapeHtml(data.id || '?')}: ${escapeHtml(data._error)}</td></tr>`;
    }

    /* Строка некорректной услуги: только ID и причина, без парсинга. */
    function incorrectRow(detail, colCount, isChild = false) {
        const id = detail?.id ?? pick(detail, 'id') ?? '?';
        const reason = getIncorrectness(detail) || 'Причина не указана';

        return `<tr class="${isChild ? 'child-row' : ''}">
            <td colspan="${colCount}" style="color:#fab387">
                ${isChild ? '<span class="child-tree">└─</span> ' : ''}${stageTag(null, true)} <strong>#${escapeHtml(id)}</strong> — парсинг пропущен<br>
                <span class="dim-text">${escapeHtml(reason)}</span>
            </td>
        </tr>`;
    }

    function buildMonitorTable(rows, config) {
        return `
            <table class="skyeng-table skyeng-monitor-table">
                <thead>
                    <tr>${config.cols.map(col => `<th>${col}</th>`).join('')}</tr>
                </thead>
                <tbody>${rows.join('')}</tbody>
            </table>
        `;
    }

    function buildSummaryBar(summaryData) {
        if (!summaryData) return '';

        return `<div class="summary-bar">
            <span class="summary-pill active">✅ Активных <span class="pill-count">${summaryData.active}</span></span>
            ${summaryData.lost > 0 ? `<span class="summary-pill lost">LOST <span class="pill-count">${summaryData.lost}</span></span>` : ''}
            ${summaryData.incorrect > 0 ? `<span class="summary-pill nested">⚠️ Некорректных <span class="pill-count">${summaryData.incorrect}</span></span>` : ''}
            ${summaryData.nested > 0 ? `<span class="summary-pill nested">↳ Вложенных <span class="pill-count">${summaryData.nested}</span></span>` : ''}
        </div>`;
    }

    function renderMonitorSection(activeRows, lostRows, config, summaryData, incorrectRows = []) {
        let html = buildSummaryBar(summaryData);

        const hasActive = activeRows.length > 0;
        const hasLost = lostRows.length > 0;
        const hasIncorrect = incorrectRows.length > 0;

        if (!hasActive && !hasLost && !hasIncorrect) {
            return html + `<div class="skyeng-empty">${config.emptyMsg}</div>`;
        }

        html += hasActive
            ? buildMonitorTable(activeRows, config)
            : '<div class="skyeng-empty">Нет активных для отображения</div>';

        if (hasLost) {
            html += `
                <details class="lost-spoiler">
                    <summary>🟣 Потерянные: ${lostRows.length} — раскрыть</summary>
                    <div class="lost-spoiler-body">
                        ${buildMonitorTable(lostRows, config)}
                    </div>
                </details>`;
        }

        /* Некорректные (incorrectnessReason): отдельным спойлером,
           детали таких услуг не запрашивались во избежание 500. */
        if (hasIncorrect) {
            html += `
                <details class="lost-spoiler">
                    <summary style="background:rgba(250,179,135,0.12);color:#fab387;border-color:rgba(250,179,135,0.45)">⚠️ Некорректные: ${incorrectRows.length} — раскрыть</summary>
                    <div class="lost-spoiler-body">
                        ${incorrectRows.join('')}
                    </div>
                </details>`;
        }

        if (config.hint) html += `<div class="skyeng-hint">${config.hint}</div>`;

        return html;
    }

    const SERVICES_TABLE_CONFIG = {
        cols: [
            '📝 Спец. комментарий',
            '🏢 Спец. особенности контракта',
            '🏢 Корп / Договор',
            'Баланс / Платежи / Статусы',
            'ID / Тип'
        ],
        emptyMsg: 'Нет услуг для отображения',
        hint: null
    };

    const KITS_TABLE_CONFIG = {
        cols: [
            '📝 Спец. комментарий',
            '🏢 Спец. особенности контракта',
            '🏢 Корп / Договор',
            'Платежи / Статусы',
            'ID / Продукт'
        ],
        emptyMsg: 'Нет китов для отображения',
        hint: 'FALLBACK — кит загружен через резервный URL. ' +
            'Дочерние строки (└─ ↳ kit#...) — вложенные услуги кита.'
    };

    const LOADING_HTML = '<div class="skyeng-empty">⏳ Загрузка...</div>';

    function resetOutputs() {
        [
            'skyeng-services-wrap',
            'skyeng-services-detail',
            'skyeng-kits-wrap',
            'skyeng-kits-detail'
        ].forEach(id => setHtml(id, LOADING_HTML));
    }

    // ===== MAIN =====
    let isLoading = false;

    async function loadData() {
        if (isLoading) return;

        const userId = String(inputEl?.value ?? '').trim();

        if (!/^\d+$/.test(userId)) {
            setStatus('Введите корректный числовой ID', 'err');
            return;
        }

        isLoading = true;

        if (runBtn) runBtn.disabled = true;

        // Запоминаем ID: при следующем открытии окна поле уже заполнено.
        crspWriteLS('crspUserId', userId);

        resetOutputs();

        try {
            // ── 1. Education Services ──
            setStatus('1/4 Education Services...', 'load');

            const raw1 = await skyFetch(
                `https://backend.skyeng.ru/api/students/${userId}/education-services/`
            );

            const servicesArray = toArray(raw1)
                .filter(item => item.serviceTypeKey && shouldInclude(item.serviceTypeKey))
                .map(item => ({
                    id: item.id,
                    serviceTypeKey: item.serviceTypeKey,
                    stage: item.stage,
                    /* Некорректность видна уже в списке — детали такой
                       услуги запрашивать не будем (риск 500) */
                    _incorrectReason: getIncorrectness(item)
                }));

            setHtml('skyeng-services-wrap', renderServicesTable(servicesArray));

            // ── 2. Education Service Kits ──
            setStatus('2/4 Education Service Kits...', 'load');

            const raw2 = await skyFetch(
                `https://backend.skyeng.ru/api/v1/students/${userId}/education-service-kits/`
            );

            const kitsArray = toArray(raw2).map(item => ({
                ...item,
                /* incorrectnessReason может прийти прямо в списке
                   (например, data[1].incorrectnessReason) — тогда кит
                   некорректен уже на этом шаге */
                _incorrectReason: getIncorrectness(item)
            }));
            const nestedCountsByKit = {};

            setHtml('skyeng-kits-wrap', renderKitsTable(kitsArray, nestedCountsByKit));

            // ── 3. Детали services: stage берём ИЗ ОТВЕТА /general/ ──
            const servicesDetails = [];

            for (let i = 0; i < servicesArray.length; i++) {
                if (isAborted()) return;

                const service = servicesArray[i];

                /* Уже некорректна по списку — деталей не запрашиваем */
                if (service._incorrectReason) {
                    servicesDetails.push({
                        id: service.id,
                        incorrectnessReason: service._incorrectReason
                    });
                    continue;
                }

                setStatus(`3/4 Детали services (${i + 1}/${servicesArray.length})...`, 'load');

                try {
                    const detail = await skyFetch(
                        `https://backend.skyeng.ru/api/students/${userId}` +
                        `/education-services/${service.id}/general/`
                    );

                    servicesDetails.push(detail);

                    // обогащаем список реальным stage (в списке его может не быть)
                    service.stage = getStage(detail) ?? service.stage;
                } catch (error) {
                    servicesDetails.push({ id: service.id, _error: error.message });
                    console.warn(`Ошибка деталей service ${service.id}:`, error.message);
                }
            }

            // перерисовываем верхнюю таблицу с реальными stage и счётчиком lost
            setHtml('skyeng-services-wrap', renderServicesTable(servicesArray));

            // ── 4. Детали kits: lost по ответу, некорректные — БЕЗ дальнейшего парсинга,
            // вложенные услуги не запрашиваем вообще (детали некорректной отдают 500) ──
            const kitsActive = [];
            const kitsLost = [];
            const kitsIncorrect = [];
            let totalNested = 0;

            for (let i = 0; i < kitsArray.length; i++) {
                if (isAborted()) return;

                const kit = kitsArray[i];

                /* Некорректен по списку (data[i].incorrectnessReason) —
                   фетч деталей не выполняем вовсе, чтобы не ловить 500 */
                if (kit._incorrectReason) {
                    kitsIncorrect.push({
                        id: kit.id,
                        incorrectnessReason: kit._incorrectReason
                    });
                    continue;
                }

                setStatus(`4/4 Детали kits (${i + 1}/${kitsArray.length})...`, 'load');

                try {
                    const detail = await skyFetchKitDetail(kit.id, userId);
                    const kitStage = getStage(detail) ?? kit.stage;
                    const kitIncorrect = getIncorrectness(detail);

                    if (kitIncorrect) {
                        /* Некорректный кит: парсинг прекращаем — ни вложенных,
                           ни повторных запросов деталей, иначе 500 */
                        kitsIncorrect.push(detail);
                    } else if (kitStage === 'lost') {
                        kitsLost.push(detail);
                    } else {
                        detail._nested = [];

                        if (detail._source === 'fallback') {
                            const eduServices = pick(detail, 'educationServices') || [];

                            nestedCountsByKit[kit.id] = eduServices.length;
                            totalNested += eduServices.length;

                            for (let j = 0; j < eduServices.length; j++) {
                                if (isAborted()) return;

                                const nestedService = eduServices[j];

                                setStatus(
                                    `4/4 kit#${kit.id}: вложенная ${j + 1}/${eduServices.length}...`,
                                    'load'
                                );

                                try {
                                    const nestedDetail = await skyFetch(
                                        `https://backend.skyeng.ru/api/students/${userId}` +
                                        `/education-services/${nestedService.id}/general/`
                                    );

                                    detail._nested.push(nestedDetail);
                                } catch (error) {
                                    detail._nested.push({
                                        id: nestedService.id,
                                        _error: error.message
                                    });

                                    console.warn(
                                        `Ошибка вложенной услуги ${nestedService.id}:`,
                                        error.message
                                    );
                                }
                            }
                        }

                        kitsActive.push(detail);
                    }
                } catch (error) {
                    kitsActive.push({ id: kit.id, _error: error.message });
                    console.warn(`Ошибка деталей kit ${kit.id}:`, error.message);
                }
            }

            setHtml('skyeng-kits-wrap', renderKitsTable(kitsArray, nestedCountsByKit));

            // ── Собираем строки: активные отдельно, lost отдельно, некорректные отдельно ──
            const colsServices = SERVICES_TABLE_CONFIG.cols.length;
            const servicesActiveRows = [];
            const servicesLostRows = [];
            const servicesIncorrectRows = [];
            let servicesActiveCount = 0;

            servicesDetails.forEach(detail => {
                if (detail && detail._error) {
                    servicesActiveCount++;
                    servicesActiveRows.push(errorRow(detail, colsServices));
                    return;
                }

                /* incorrectnessReason важнее stage: некорректная услуга
                   может числиться lost, но парсить её всё равно нельзя */
                if (getIncorrectness(detail)) {
                    servicesIncorrectRows.push(incorrectRow(detail, colsServices));
                    return;
                }

                if (getStage(detail) === 'lost') {
                    servicesLostRows.push(renderMonitorRow(detail));
                } else {
                    servicesActiveCount++;
                    servicesActiveRows.push(renderMonitorRow(detail));
                }
            });

            const colsKits = KITS_TABLE_CONFIG.cols.length;
            const kitsActiveRows = [];

            for (const detail of kitsActive) {
                if (detail && detail._error) {
                    kitsActiveRows.push(errorRow(detail, colsKits));
                    continue;
                }

                kitsActiveRows.push(renderMonitorRow(detail));

                const nested = (detail && Array.isArray(detail._nested))
                    ? detail._nested
                    : [];

                const kitId = detail.id ?? pick(detail, 'id') ?? '?';

                for (const nestedDetail of nested) {
                    if (nestedDetail && !nestedDetail._error && getIncorrectness(nestedDetail)) {
                        /* Некорректная вложенная услуга — только строка с причиной,
                           никаких дальнейших запросов по ней */
                        kitsActiveRows.push(incorrectRow(nestedDetail, colsKits, true));
                        continue;
                    }

                    kitsActiveRows.push(
                        nestedDetail && nestedDetail._error
                            ? errorRow(nestedDetail, colsKits, true)
                            : renderMonitorRow(nestedDetail, { childOfKitId: kitId })
                    );
                }
            }

            const kitsLostRows = kitsLost.map(detail =>
                detail && detail._error
                    ? errorRow(detail, colsKits)
                    : renderMonitorRow(detail)
            );

            const kitsIncorrectRows = kitsIncorrect.map(detail =>
                detail && detail._error
                    ? errorRow(detail, colsKits)
                    : incorrectRow(detail, colsKits)
            );

            // ── Рендер секций ──
            setHtml(
                'skyeng-services-detail',
                renderMonitorSection(
                    servicesActiveRows,
                    servicesLostRows,
                    SERVICES_TABLE_CONFIG,
                    {
                        active: servicesActiveCount,
                        lost: servicesLostRows.length,
                        incorrect: servicesIncorrectRows.length,
                        nested: 0
                    },
                    servicesIncorrectRows
                )
            );

            setHtml(
                'skyeng-kits-detail',
                renderMonitorSection(
                    kitsActiveRows,
                    kitsLostRows,
                    KITS_TABLE_CONFIG,
                    {
                        active: kitsActive.filter(detail => !detail._error).length,
                        lost: kitsLostRows.length,
                        incorrect: kitsIncorrectRows.length,
                        nested: totalNested
                    },
                    kitsIncorrectRows
                )
            );

            setStatus(`Готово! #${userId}`, 'ok');
        } catch (error) {
            setStatus(error.message, 'err');
            console.error('CRM Спец.ком: ошибка загрузки:', error);
        } finally {
            isLoading = false;
            if (runBtn) runBtn.disabled = false;
        }
    }

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    const savedUserId = crspReadLS('crspUserId', '');

    if (savedUserId && inputEl && !inputEl.value) {
        inputEl.value = String(savedUserId).replace(/\D/g, '');
    }

    crspOn(runBtn, 'click', loadData);

    crspOn(inputEl, 'keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadData();
        }
    });

    // API для публичного хука window.getCRMSPecialData(userId)
    crspApi = { load: loadData, panel };

    console.log(
        '%c☄️ CRM Спец.ком загружен! Окно: #' + CRSP_WINDOW_ID,
        'color:#89b4fa;font-weight:bold;font-size:14px'
    );

    return crspApi;
}

/* Инициализация при загрузке модуля. Любая ошибка должна быть ВИДИМОЙ
   (console + тост), а не «кнопка не работает молча». */
try {
    initCRMSPecialModule();
} catch (error) {
    console.error('[CRM Спец.ком] Ошибка инициализации модуля:', error);

    try {
        window.showCustomAlert?.(
            'CRM Спец.ком: модуль не инициализирован — ' + error.message,
            'error'
        );
    } catch {
        // Тосты могут быть недоступны — тогда остаётся console.
    }
}

