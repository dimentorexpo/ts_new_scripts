// ============================================================
// ConfluenceSearch — поиск по Confluence (стиль Graphite Dark, как JiraSearch)
// Запросы идут через bg.js (action 'getFetchRequest'), чтобы обойти CORS.
// Авторизация — сессионные cookie оператора в Confluence (credentials: include).
// Меню: пункт buttonConfluence в MODULE_MENU_CONFIG (utils.js).
// ============================================================

const CF_BASE_DEFAULT = 'https://confluence.skyeng.link';
const CF_PAGE_SIZE = 20;
const CF_HISTORY_KEY = 'AF_ConfluenceHistory';

/** Адрес Confluence: по умолчанию skyeng.link; можно переопределить в AF_ConfluenceBase (только https и *.skyeng.link/.tech). */
function cfBase() {
    const saved = String(readLocalStorage('AF_ConfluenceBase') || '').trim().replace(/\/+$/, '');
    try {
        const u = new URL(saved);
        if (u.protocol === 'https:' && /(^|\.)skyeng\.(link|tech)$/i.test(u.hostname)) return u.origin;
    } catch (_) { /* берём адрес по умолчанию */ }
    return CF_BASE_DEFAULT;
}

const CF_ICO_PATHS = {
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    page: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>'
};
const cfIco = (name, cls = 'cfs-ico') =>
    `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CF_ICO_PATHS[name] || ''}</svg>`;

const cfEsc = (v) => String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const cfStyles = `
<style>
    #AF_Confluence .cfs-wrap, #AF_Confluence .cfs-wrap * { box-sizing: border-box; }
    #AF_Confluence .cfs-wrap {
        display: flex; flex-direction: column;
        width: min(700px, calc(100vw - 24px));
        max-height: calc(100vh - 40px);
        padding: 18px;
        color: #edf2fb;
        background: radial-gradient(circle at 95% 0%, rgba(56, 189, 248, .12), transparent 40%), #111827;
        border: 1px solid #344258;
        border-radius: 18px;
        box-shadow: 0 26px 70px rgba(3, 9, 22, .52), inset 0 1px rgba(255, 255, 255, .06);
        font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
        font-size: 13px;
    }
    #AF_Confluence .cfs-ico { width: 17px; height: 17px; display: block; flex: 0 0 auto; }
    #AF_Confluence .cfs-head { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #344258; cursor: move; }
    #AF_Confluence .cfs-title { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    #AF_Confluence .cfs-title-name { font-size: 15px; font-weight: 700; color: #fff; }
    #AF_Confluence .cfs-auth {
        display: inline-flex; align-items: center; gap: 7px; max-width: 280px;
        padding: 6px 11px; color: #a6b4cb; background: #182335; border: 1px solid #364660; border-radius: 10px;
        font-size: 11px; font-weight: 700; letter-spacing: .03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    #AF_Confluence .cfs-auth::before { content: ''; flex: 0 0 auto; width: 8px; height: 8px; border-radius: 50%; background: currentColor; box-shadow: 0 0 8px currentColor; }
    #AF_Confluence .cfs-auth.is-ok { color: #4ade80; }
    #AF_Confluence .cfs-auth.is-bad { color: #ff7a8f; }
    #AF_Confluence .cfs-auth.is-wait { color: #f0c674; }
    #AF_Confluence .cfs-btn-icon {
        width: 36px; height: 36px; min-width: 36px; padding: 0; display: inline-flex; align-items: center; justify-content: center;
        color: #dce5f5; background: #1b283c; border: 1px solid #3c4d68; border-radius: 9px; cursor: pointer;
        transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    }
    #AF_Confluence .cfs-btn-icon:hover { color: #fff; background: #293b56; border-color: #7799e2; transform: translateY(-1px); }
    #AF_Confluence #cfsRefresh .cfs-ico { color: #7dd3fc; }
    #AF_Confluence #cfsOpenSite .cfs-ico { color: #a9c0ff; }

    #AF_Confluence .cfs-banner {
        display: none; align-items: center; gap: 12px; margin-bottom: 12px; padding: 10px 12px;
        color: #ffd6dc; background: rgba(255, 122, 143, .1); border: 1px solid rgba(255, 122, 143, .4); border-radius: 11px; line-height: 1.4;
    }
    #AF_Confluence .cfs-banner.is-visible { display: flex; }
    #AF_Confluence .cfs-banner span { flex: 1; min-width: 0; }
    #AF_Confluence .cfs-login {
        display: inline-flex; align-items: center; gap: 7px; padding: 8px 12px; color: #fff; background: #3158b8;
        border: 1px solid #7799e2; border-radius: 9px; cursor: pointer; font: inherit; font-weight: 600; white-space: nowrap;
    }
    #AF_Confluence .cfs-login:hover { background: #3e6ad6; }

    #AF_Confluence .cfs-search { display: flex; gap: 8px; margin-bottom: 10px; }
    #AF_Confluence .cfs-input {
        flex: 1; min-width: 0; height: 40px; padding: 0 12px; color: #edf2fb; background: #0d1625;
        border: 1px solid #3a4961; border-radius: 10px; outline: none; font: inherit; font-size: 14px;
    }
    #AF_Confluence .cfs-input:focus { border-color: #829fff; box-shadow: 0 0 0 3px rgba(130, 159, 255, .15); }
    #AF_Confluence .cfs-go {
        display: inline-flex; align-items: center; gap: 7px; height: 40px; padding: 0 16px; color: #fff; background: #3158b8;
        border: 1px solid #7799e2; border-radius: 10px; cursor: pointer; font: inherit; font-weight: 600;
    }
    #AF_Confluence .cfs-go:hover { background: #3e6ad6; }
    #AF_Confluence .cfs-go:disabled { opacity: .5; cursor: default; }

    #AF_Confluence .cfs-filters { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 10px; }
    #AF_Confluence .cfs-select, #AF_Confluence .cfs-space {
        height: 32px; padding: 0 10px; color: #dce5f5; background: #182335; border: 1px solid #364660; border-radius: 9px; outline: none; font: inherit; font-size: 12px;
    }
    #AF_Confluence .cfs-space { width: 130px; }
    #AF_Confluence .cfs-select:focus, #AF_Confluence .cfs-space:focus { border-color: #829fff; }
    #AF_Confluence .cfs-check { display: inline-flex; align-items: center; gap: 6px; color: #a6b4cb; font-size: 12px; cursor: pointer; user-select: none; }
    #AF_Confluence .cfs-check input { width: 15px; height: 15px; margin: 0; }

    #AF_Confluence .cfs-history { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 10px; }
    #AF_Confluence .cfs-history:empty { display: none; }
    #AF_Confluence .cfs-chip {
        display: inline-flex; align-items: center; gap: 5px; max-width: 200px; padding: 4px 9px; color: #a6b4cb; background: #182335;
        border: 1px solid #364660; border-radius: 999px; cursor: pointer; font: inherit; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    #AF_Confluence .cfs-spacebox { position: relative; }
    #AF_Confluence .cfs-spacebtn { display: inline-flex; align-items: center; gap: 8px; min-width: 190px; max-width: 280px; cursor: pointer; }
    #AF_Confluence .cfs-spacebtn #cfsSpaceLabel { flex: 1; min-width: 0; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #AF_Confluence .cfs-spacebtn.is-set { color: #fff; border-color: #7799e2; background: #23406e; }
    #AF_Confluence .cfs-caret { color: #7c8aa3; font-size: 11px; }
    #AF_Confluence .cfs-pop { position: absolute; z-index: 5; top: 38px; left: 0; width: 340px; max-width: calc(100vw - 60px); padding: 6px; background: #111827; border: 1px solid #344258; border-radius: 12px; box-shadow: 0 18px 50px rgba(3, 9, 22, .6); }
    #AF_Confluence .cfs-pop[hidden] { display: none; }
    #AF_Confluence .cfs-pop-search { width: 100%; height: 32px; margin-bottom: 5px; padding: 0 10px; color: #edf2fb; background: #0d1625; border: 1px solid #3a4961; border-radius: 8px; outline: none; font: inherit; font-size: 12px; }
    #AF_Confluence .cfs-pop-search:focus { border-color: #829fff; }
    #AF_Confluence .cfs-pop-list { max-height: 270px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #536a8e transparent; }
    #AF_Confluence .cfs-pop-title { padding: 6px 8px 3px; color: #66748c; font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
    #AF_Confluence .cfs-pop-opt { display: flex; align-items: baseline; gap: 8px; width: 100%; padding: 7px 8px; color: #dce5f5; background: transparent; border: 0; border-radius: 8px; cursor: pointer; font: inherit; font-size: 12px; text-align: left; }
    #AF_Confluence .cfs-pop-opt:hover { color: #fff; background: #23334b; }
    #AF_Confluence .cfs-pop-opt.is-active { background: #23406e; color: #fff; }
    #AF_Confluence .cfs-pop-key { flex: 0 0 auto; min-width: 54px; color: #7dd3fc; font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 11px; font-weight: 700; }
    #AF_Confluence .cfs-pop-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    #AF_Confluence .cfs-pop-note { padding: 10px; color: #7c8aa3; font-size: 12px; text-align: center; }
    #AF_Confluence .cfs-chip:hover { color: #fff; border-color: #7799e2; }
    #AF_Confluence .cfs-chip .cfs-ico { width: 12px; height: 12px; }

    #AF_Confluence .cfs-meta { min-height: 18px; margin-bottom: 6px; color: #7c8aa3; font-size: 12px; }
    #AF_Confluence .cfs-results { flex: 1; min-height: 0; max-height: 52vh; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #536a8e transparent; padding-right: 2px; }
    #AF_Confluence .cfs-item {
        display: block; margin-bottom: 8px; padding: 11px 13px; color: inherit; text-decoration: none;
        background: #162033; border: 1px solid #2b3a52; border-radius: 11px; transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    }
    #AF_Confluence .cfs-item:hover { background: #1c2a42; border-color: #7799e2; transform: translateY(-1px); }
    #AF_Confluence .cfs-item-top { display: flex; align-items: center; gap: 8px; }
    #AF_Confluence .cfs-item-ico { color: #7dd3fc; }
    #AF_Confluence .cfs-item-title { flex: 1; min-width: 0; color: #fff; font-size: 14px; font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
    #AF_Confluence .cfs-item-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    #AF_Confluence .cfs-tag { padding: 2px 8px; color: #a6b4cb; background: #1b283c; border: 1px solid #364660; border-radius: 999px; font-size: 11px; }
    #AF_Confluence .cfs-tag.space { color: #7dd3fc; border-color: rgba(125, 211, 252, .35); }
    #AF_Confluence .cfs-excerpt { margin-top: 7px; color: #b6c2d8; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
    #AF_Confluence .cfs-excerpt mark, #AF_Confluence .cfs-item-title mark { color: #fff; background: rgba(240, 198, 116, .28); border-radius: 3px; padding: 0 2px; }
    #AF_Confluence .cfs-empty { padding: 28px 12px; text-align: center; color: #7c8aa3; line-height: 1.6; }
    #AF_Confluence .cfs-more { width: 100%; height: 36px; margin-top: 2px; color: #dce5f5; background: #1b283c; border: 1px solid #3c4d68; border-radius: 9px; cursor: pointer; font: inherit; }
    #AF_Confluence .cfs-more:hover { background: #293b56; border-color: #7799e2; }
    #AF_Confluence .cfs-more:disabled { opacity: .5; cursor: default; }
</style>`;

const win_Confluence = `
${cfStyles}
<div class="cfs-wrap">
    <div class="cfs-head chmaf-drag-handle">
        <div class="cfs-title">
            <span class="cfs-title-name">Confluence</span>
            <span class="cfs-auth is-wait" id="cfsAuth">проверка…</span>
        </div>
        <button class="mainButton cfs-btn-icon" id="cfsRefresh" title="Проверить авторизацию">${cfIco('refresh')}</button>
        <button class="mainButton cfs-btn-icon" id="cfsOpenSite" title="Открыть Confluence">${cfIco('external')}</button>
        <button class="mainButton cfs-btn-icon buttonHide" id="cfsClose" title="Закрыть">${cfIco('close')}</button>
    </div>

    <div class="cfs-banner" id="cfsBanner">
        <span id="cfsBannerText"></span>
        <button class="mainButton cfs-login" id="cfsLogin">${cfIco('login')}Войти в Confluence</button>
    </div>

    <div class="cfs-search">
        <input class="cfs-input" id="cfsQuery" placeholder="Что найти в Confluence?" autocomplete="off">
        <button class="mainButton cfs-go" id="cfsGo" title="Искать (Enter)">${cfIco('search')}Найти</button>
    </div>

    <div class="cfs-filters">
        <select class="cfs-select" id="cfsType" title="Что искать">
            <option value="pages">Страницы и блоги</option>
            <option value="page">Только страницы</option>
            <option value="attachment">Вложения</option>
        </select>
        <select class="cfs-select" id="cfsSort" title="Порядок">
            <option value="rel">По релевантности</option>
            <option value="new">Сначала новые</option>
        </select>
        <div class="cfs-spacebox">
            <input type="hidden" id="cfsSpace" value="">
            <button type="button" class="mainButton cfs-select cfs-spacebtn" id="cfsSpaceBtn" title="Выбрать пространство Confluence"><span id="cfsSpaceLabel">Все пространства</span><span class="cfs-caret">▾</span></button>
            <div class="cfs-pop" id="cfsPop" hidden>
                <input class="cfs-pop-search" id="cfsPopSearch" placeholder="Найти пространство…" autocomplete="off">
                <div class="cfs-pop-list" id="cfsPopList"></div>
            </div>
        </div>
        <label class="cfs-check" title="Искать только в заголовках"><input type="checkbox" id="cfsTitleOnly">Только в заголовках</label>
    </div>

    <div class="cfs-history" id="cfsHistory"></div>
    <div class="cfs-meta" id="cfsMeta"></div>
    <div class="cfs-results" id="cfsResults">
        <div class="cfs-empty">Введите запрос и нажмите Enter.<br>Поиск идёт по вашей учётной записи Confluence.</div>
    </div>
</div>`;

createWindow('AF_Confluence', 'winTopConfluence', 'winLeftConfluence', win_Confluence);
hideWindowOnDoubleClick('AF_Confluence');
hideWindowOnClick('AF_Confluence', 'cfsClose');

(function initConfluenceSearch() {
    const root = document.getElementById('AF_Confluence');
    if (!root) return;
    const $ = (sel) => root.querySelector(sel);

    const state = { q: '', start: 0, total: 0, loading: false, authorized: false, searchId: 0 };

    /** Запрос к Confluence через bg.js. Возвращает текст ответа или бросает Error. */
    function cfFetch(path) {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage({
                    action: 'getFetchRequest',
                    fetchURL: cfBase() + path,
                    requestOptions: {
                        method: 'GET',
                        credentials: 'include',
                        headers: { Accept: 'application/json' }
                    }
                }, response => {
                    if (chrome.runtime.lastError) { reject(new Error(chrome.runtime.lastError.message)); return; }
                    if (response && response.success) resolve(response.fetchansver);
                    else reject(new Error((response && response.error) || 'Нет ответа от background'));
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    const isAuthError = (message) => /HTTP 40[13]\b/.test(String(message));

    function setAuth(kind, text) {
        const chip = $('#cfsAuth');
        chip.className = `cfs-auth is-${kind}`;
        chip.textContent = text;
        chip.title = text;
    }

    function showBanner(text) {
        $('#cfsBannerText').textContent = text;
        $('#cfsBanner').classList.toggle('is-visible', !!text);
    }

    /** Базовая проверка: залогинен ли оператор в Confluence. */
    async function checkAuth() {
        setAuth('wait', 'проверка…');
        try {
            const raw = await cfFetch('/rest/api/user/current');
            let user;
            try { user = JSON.parse(raw); } catch (_) { throw new Error('login-redirect'); }
            const known = user && (user.type === 'known' || user.username || user.userKey);
            if (!known) throw new Error('HTTP 401');
            state.authorized = true;
            setAuth('ok', 'Авторизован');
            showBanner('');
        } catch (error) {
            state.authorized = false;
            const noAuth = isAuthError(error.message) || error.message === 'login-redirect';
            setAuth('bad', noAuth ? 'Нет авторизации' : 'Confluence недоступен');
            showBanner(noAuth
                ? 'Вы не авторизованы в Confluence. Войдите на сайте в этом же браузере, затем вернитесь и нажмите «обновить».'
                : `Не удалось связаться с Confluence (${error.message}). Проверьте VPN/сеть и нажмите «обновить».`);
        }
        return state.authorized;
    }

    // ---------- История запросов ----------
    const loadHistory = () => {
        const list = readJsonLocal(CF_HISTORY_KEY, []);
        return Array.isArray(list) ? list.filter(x => typeof x === 'string').slice(0, 8) : [];
    };
    function pushHistory(q) {
        const list = [q, ...loadHistory().filter(x => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
        try { localStorage.setItem(CF_HISTORY_KEY, JSON.stringify(list)); } catch (_) { /* не критично */ }
        renderHistory();
    }
    function renderHistory() {
        const list = loadHistory();
        $('#cfsHistory').innerHTML = list.map(q => `<button type="button" class="cfs-chip" data-q="${cfEsc(q)}" title="${cfEsc(q)}">${cfIco('history')}${cfEsc(q)}</button>`).join('');
    }

    // ---------- Поиск ----------
    const cqlText = (v) => String(v).replace(/[\\"]/g, '\\$&');

    function buildCql(q) {
        const parts = [`${$('#cfsTitleOnly').checked ? 'title' : 'siteSearch'} ~ "${cqlText(q)}"`];
        const type = $('#cfsType').value;
        parts.push(type === 'pages' ? 'type in (page, blogpost)' : `type = ${type}`);
        const space = $('#cfsSpace').value.trim();
        if (/^[~A-Za-z0-9_-]{1,40}$/.test(space)) parts.push(`space = "${space}"`);
        return parts.join(' AND ') + ($('#cfsSort').value === 'new' ? ' ORDER BY lastmodified DESC' : '');
    }

    // Маркеры подсветки Confluence → <mark>. Весь остальной текст экранируется.
    const hl = (raw) => cfEsc(String(raw ?? '').replace(/\s+/g, ' ').trim())
        .replace(/@@@hl@@@/g, '<mark>').replace(/@@@endhl@@@/g, '</mark>');

    function itemUrl(r) {
        const url = String(r.url || r.content?._links?.webui || '');
        if (url.startsWith('/') && !url.startsWith('//')) return cfBase() + url;
        const id = r.content?.id;
        return id && /^\d+$/.test(String(id)) ? `${cfBase()}/pages/viewpage.action?pageId=${id}` : cfBase();
    }

    function itemHtml(r) {
        const isAtt = r.content?.type === 'attachment';
        const date = r.lastModified ? new Date(r.lastModified) : null;
        const dateText = date && !isNaN(date) ? date.toLocaleDateString('ru-RU') : (r.friendlyLastModified || '');
        const space = r.resultGlobalContainer?.title || r.content?.space?.name || '';
        const excerpt = hl(r.excerpt);
        return `<a class="cfs-item" href="${cfEsc(itemUrl(r))}" target="_blank" rel="noopener noreferrer">
            <div class="cfs-item-top"><span class="cfs-item-ico">${cfIco(isAtt ? 'clip' : 'page')}</span><span class="cfs-item-title">${hl(r.title || r.content?.title || 'Без названия')}</span></div>
            <div class="cfs-item-meta">${space ? `<span class="cfs-tag space">${cfEsc(space)}</span>` : ''}${dateText ? `<span class="cfs-tag" title="Дата последнего изменения">Обновлён: ${cfEsc(dateText)}</span>` : ''}</div>
            ${excerpt ? `<div class="cfs-excerpt">${excerpt}</div>` : ''}
        </a>`;
    }

    function setLoading(on) {
        state.loading = on;
        $('#cfsGo').disabled = on;
        const more = $('#cfsMore');
        if (more) { more.disabled = on; more.textContent = on ? 'Загрузка…' : 'Показать ещё'; }
    }

    async function runSearch(append) {
        const q = (append ? state.q : $('#cfsQuery').value).trim();
        if (!q || state.loading) return;
        const box = $('#cfsResults');
        const id = ++state.searchId;

        if (!state.authorized && !(await checkAuth())) {
            box.innerHTML = '<div class="cfs-empty">Нужна авторизация в Confluence — войдите и нажмите «обновить».</div>';
            $('#cfsMeta').textContent = '';
            return;
        }

        if (!append) {
            state.q = q; state.start = 0; state.total = 0;
            box.innerHTML = '<div class="cfs-empty">Ищу…</div>';
            $('#cfsMeta').textContent = '';
            pushHistory(q);
        }
        setLoading(true);
        try {
            const path = `/rest/api/search?cql=${encodeURIComponent(buildCql(q))}&limit=${CF_PAGE_SIZE}&start=${state.start}&excerpt=highlight`;
            const data = JSON.parse(await cfFetch(path));
            if (id !== state.searchId) return; // пришёл ответ на устаревший запрос
            const results = Array.isArray(data.results) ? data.results : [];
            state.total = Number(data.totalSize) || results.length;
            state.start += results.length;

            box.querySelector('#cfsMore')?.remove();
            if (!append) box.innerHTML = '';
            if (!results.length && !append) {
                box.innerHTML = '<div class="cfs-empty">Ничего не найдено.<br>Попробуйте другие слова или уберите фильтры.</div>';
            } else {
                box.insertAdjacentHTML('beforeend', results.map(itemHtml).join(''));
                if (state.start < state.total && results.length) {
                    box.insertAdjacentHTML('beforeend', '<button type="button" class="mainButton cfs-more" id="cfsMore">Показать ещё</button>');
                }
            }
            $('#cfsMeta').textContent = `Найдено: ${state.total} · показано: ${Math.min(state.start, state.total)}`;
        } catch (error) {
            if (id !== state.searchId) return;
            if (isAuthError(error.message)) { state.authorized = false; await checkAuth(); }
            if (!append) box.innerHTML = '';
            box.insertAdjacentHTML('beforeend', `<div class="cfs-empty">Ошибка поиска: ${cfEsc(error.message)}</div>`);
        } finally {
            setLoading(false);
        }
    }

    // ---------- События ----------
    $('#cfsGo').addEventListener('click', () => runSearch(false));
    $('#cfsQuery').addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(false); });
    ['#cfsType', '#cfsSort', '#cfsTitleOnly'].forEach(sel => $(sel).addEventListener('change', () => { if (state.q) runSearch(false); }));
    // ---------- Выбор пространства ----------
    const PINNED_SPACES = [
        { key: 'TSUP', name: 'Technical Support' },
        { key: 'CSW', name: 'Customer Service Wiki' }
    ];
    let allSpaces = null; // загружается один раз после авторизации
    let spacesLoading = false;

    async function loadSpaces() {
        if (allSpaces || spacesLoading) return;
        spacesLoading = true;
        try {
            const out = [];
            for (let start = 0; start < 600; start += 100) {
                const data = JSON.parse(await cfFetch(`/rest/api/space?type=global&status=current&limit=100&start=${start}`));
                const part = Array.isArray(data.results) ? data.results : [];
                out.push(...part.map(x => ({ key: String(x.key || ''), name: String(x.name || x.key || '') })));
                if (part.length < 100) break;
            }
            allSpaces = out.filter(x => x.key).sort((x, y) => x.name.localeCompare(y.name, 'ru'));
        } catch (_) {
            allSpaces = null; // список не загрузился — останутся закреплённые
        } finally {
            spacesLoading = false;
            if (!$('#cfsPop').hidden) renderSpaceList();
        }
    }

    function setSpace(key, name) {
        $('#cfsSpace').value = key || '';
        $('#cfsSpaceLabel').textContent = key ? `${key} · ${name || key}` : 'Все пространства';
        $('#cfsSpaceBtn').classList.toggle('is-set', !!key);
        $('#cfsPop').hidden = true;
        if (state.q) runSearch(false);
    }

    function renderSpaceList() {
        const q = $('#cfsPopSearch').value.trim().toLowerCase();
        const cur = $('#cfsSpace').value;
        const match = (x) => !q || x.key.toLowerCase().includes(q) || x.name.toLowerCase().includes(q);
        const opt = (x) => `<button type="button" class="cfs-pop-opt${x.key === cur ? ' is-active' : ''}" data-key="${cfEsc(x.key)}" data-name="${cfEsc(x.name)}"><span class="cfs-pop-key">${cfEsc(x.key)}</span><span class="cfs-pop-name">${cfEsc(x.name)}</span></button>`;
        const pinned = PINNED_SPACES.filter(match);
        const pinnedKeys = new Set(PINNED_SPACES.map(x => x.key));
        const rest = (allSpaces || []).filter(x => !pinnedKeys.has(x.key) && match(x));
        let html = q ? '' : `<button type="button" class="cfs-pop-opt${cur ? '' : ' is-active'}" data-key="" data-name=""><span class="cfs-pop-key">ВСЕ</span><span class="cfs-pop-name">Все пространства</span></button>`;
        if (pinned.length) html += `<div class="cfs-pop-title">Основные</div>${pinned.map(opt).join('')}`;
        if (rest.length) html += `<div class="cfs-pop-title">Остальные пространства</div>${rest.map(opt).join('')}`;
        if (!pinned.length && !rest.length) html += '<div class="cfs-pop-note">Ничего не найдено</div>';
        if (!allSpaces) html += `<div class="cfs-pop-note">${spacesLoading ? 'Загружаю список пространств…' : 'Полный список недоступен — вход в Confluence или сеть.'}</div>`;
        $('#cfsPopList').innerHTML = html;
    }

    $('#cfsSpaceBtn').addEventListener('click', () => {
        const pop = $('#cfsPop');
        pop.hidden = !pop.hidden;
        if (pop.hidden) return;
        $('#cfsPopSearch').value = '';
        renderSpaceList();
        loadSpaces();
        $('#cfsPopSearch').focus();
    });
    $('#cfsPopSearch').addEventListener('input', renderSpaceList);
    $('#cfsPopList').addEventListener('click', e => {
        const o = e.target.closest('.cfs-pop-opt');
        if (o) setSpace(o.dataset.key, o.dataset.name);
    });
    root.addEventListener('mousedown', e => {
        if (!$('#cfsPop').hidden && !e.target.closest('.cfs-spacebox')) $('#cfsPop').hidden = true;
    });

    $('#cfsRefresh').addEventListener('click', checkAuth);
    $('#cfsOpenSite').addEventListener('click', () => window.open(cfBase(), '_blank', 'noopener'));
    $('#cfsLogin').addEventListener('click', () => window.open(cfBase(), '_blank', 'noopener'));
    $('#cfsHistory').addEventListener('click', e => {
        const chip = e.target.closest('[data-q]');
        if (!chip) return;
        $('#cfsQuery').value = chip.dataset.q;
        runSearch(false);
    });
    $('#cfsResults').addEventListener('click', e => { if (e.target.closest('#cfsMore')) runSearch(true); });

    renderHistory();
    root.__cfsOnOpen = () => {
        checkAuth();
        setTimeout(() => $('#cfsQuery').focus(), 50);
    };
})();

function getConfluenceSearchPress() {
    const box = document.getElementById('AF_Confluence');
    if (!box) {
        window.showCustomAlert?.('Окно Confluence не найдено. Обновите расширение и страницу (Ctrl+Shift+R).', 'error');
        return;
    }
    if (box.style.display === 'none') {
        box.style.display = '';
        if (typeof closeChmafMenus === 'function') closeChmafMenus();
        box.__cfsOnOpen?.();
    } else {
        box.style.display = 'none';
    }
}
window.getConfluenceSearchPress = getConfluenceSearchPress;
