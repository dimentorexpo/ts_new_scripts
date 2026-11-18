/**
 * ConfluenceSearch.js — «Поиск в Confluence»: страницы, блоги и вложения,
 * фильтры (тип, сортировка, только заголовки, пространство), история запросов,
 * постраничная подгрузка. Запросы идут через bg.js с куками пользователя,
 * поэтому нужен вход в Confluence в этом же браузере.
 */
(function () {
    'use strict';

    const CF_BASE_DEFAULT = 'https://confluence.skyeng.link';
    const BASE_KEY = 'cfs_base';        // необязательный свой адрес Confluence (https, *.skyeng.link / *.skyeng.tech)
    const RECENT_KEY = 'cfs_recent';    // история поисковых запросов
    const RECENT_MAX = 8;
    const PAGE_SIZE = 20;
    const PINNED_SPACES = [
        { key: 'TSUP', name: 'Technical Support' },
        { key: 'CSW', name: 'Customer Service Wiki' }
    ];

    /** Адрес Confluence: по умолчанию skyeng.link, можно переопределить в localStorage (только доверенные домены). */
    function cfBase() {
        let saved = '';
        try { saved = String(localStorage.getItem(BASE_KEY) || '').trim().replace(/\/+$/, ''); } catch (_) { /* нет доступа к localStorage */ }
        try {
            const u = new URL(saved);
            if (u.protocol === 'https:' && /(^|\.)skyeng\.(link|tech)$/i.test(u.hostname)) return u.origin;
        } catch (_) { /* берём адрес по умолчанию */ }
        return CF_BASE_DEFAULT;
    }

    /* ---------- Окно ---------- */

    const html = `
        ${crmWinHeader({
            icon: '📖',
            title: 'Поиск в Confluence',
            tools: '<span class="crm-pill" id="cfs-auth" data-tone="warn"><span class="crm-dot"></span><span>проверка…</span></span>' +
                crmToolButton('cfs-refresh', crmIcon('refresh', 15), 'Проверить авторизацию') +
                crmToolButton('cfs-open', crmIcon('external', 15), 'Открыть Confluence'),
            closeId: 'cfs-hide'
        })}
        <div class="crm-body">
            <div class="cfs-banner crm-hidden" id="cfs-banner">
                <span id="cfs-banner-text"></span>
                <button type="button" class="crm-btn crm-btn-primary" id="cfs-login">${crmIcon('external', 14)} Войти в Confluence</button>
            </div>
            <div class="crm-row">
                <input class="crm-input crm-grow" id="cfs-query" placeholder="Что найти в Confluence? Enter — найти" autocomplete="off">
                <button type="button" class="crm-btn crm-btn-primary" id="cfs-go" title="Искать (Enter)">${crmIcon('search', 15)} Найти</button>
            </div>
            <div class="crm-row is-wrap cfs-filters">
                <select class="crm-select" id="cfs-type" title="Что искать">
                    <option value="pages">Страницы и блоги</option>
                    <option value="page">Только страницы</option>
                    <option value="attachment">Вложения</option>
                </select>
                <select class="crm-select" id="cfs-sort" title="Порядок">
                    <option value="rel">По релевантности</option>
                    <option value="new">Сначала новые</option>
                </select>
                <div class="cfs-spacebox">
                    <button type="button" class="crm-select cfs-spacebtn" id="cfs-space-btn" title="Выбрать пространство Confluence">
                        <span id="cfs-space-label">Все пространства</span>
                    </button>
                    <div class="cfs-pop crm-hidden" id="cfs-pop">
                        <input class="crm-input" id="cfs-pop-search" placeholder="Найти пространство…" autocomplete="off">
                        <div class="cfs-pop-list" id="cfs-pop-list"></div>
                    </div>
                </div>
                <label class="crm-switch" title="Искать только в заголовках">
                    <input type="checkbox" id="cfs-title-only"><span class="crm-switch-track"></span><span>Только в заголовках</span>
                </label>
            </div>
            <div class="crm-recent crm-hidden" id="cfs-recent" style="margin-top:8px"></div>
            <div class="crm-hint" id="cfs-meta" style="margin-top:8px; min-height:18px"></div>
            <div class="cfs-results" id="cfs-results"><div class="crm-empty">Введите запрос и нажмите «Найти».<br>Поиск идёт по вашей учётной записи Confluence.</div></div>
        </div>`;

    createWindowCRM('AF_Confluence', 'winTopCFS', 'winLeftCFS', html);
    const win = document.getElementById('AF_Confluence');
    win.style.width = '720px';
    hideWindowOnDoubleClick('AF_Confluence');
    hideWindowOnClick('AF_Confluence', 'cfs-hide');

    const $ = (id) => document.getElementById(id);
    const state = { q: '', start: 0, total: 0, loading: false, authorized: false, searchId: 0, spaceKey: '' };

    /* ---------- API ---------- */

    const cfGet = (path) => crmRequest(cfBase() + path, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' }
    });

    const cfJson = async (path) => {
        const text = await cfGet(path);
        try { return JSON.parse(text); } catch (_) { throw new Error('login-redirect'); } // вместо JSON пришла страница входа
    };

    const isAuthError = (e) => e && (e.status === 401 || e.status === 403 || e.message === 'login-redirect');

    /* ---------- Авторизация ---------- */

    function setAuth(tone, text) {
        const chip = $('cfs-auth');
        chip.dataset.tone = tone;
        chip.lastElementChild.textContent = text;
        chip.title = text;
    }

    function showBanner(text) {
        $('cfs-banner-text').textContent = text || '';
        $('cfs-banner').classList.toggle('crm-hidden', !text);
    }

    /** Проверка: залогинен ли оператор в Confluence. */
    async function checkAuth() {
        setAuth('warn', 'проверка…');
        try {
            const user = await cfJson('/rest/api/user/current');
            if (!(user && (user.type === 'known' || user.username || user.userKey))) throw Object.assign(new Error('HTTP 401'), { status: 401 });
            state.authorized = true;
            setAuth('ok', 'Авторизован');
            showBanner('');
        } catch (e) {
            state.authorized = false;
            if (isAuthError(e)) {
                setAuth('bad', 'Нет авторизации');
                showBanner('Вы не авторизованы в Confluence. Войдите на сайте в этом же браузере, затем вернитесь и нажмите «обновить».');
            } else {
                setAuth('bad', 'Confluence недоступен');
                showBanner(`Не удалось связаться с Confluence (${e.message}). Проверьте VPN/сеть и нажмите «обновить».`);
            }
        }
        return state.authorized;
    }

    /* ---------- История запросов ---------- */

    function loadRecent() {
        try {
            const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
            return Array.isArray(list) ? list.filter((q) => typeof q === 'string' && q.trim()).slice(0, RECENT_MAX) : [];
        } catch (_) { return []; }
    }

    let recent = loadRecent();

    function renderRecent() {
        const box = $('cfs-recent');
        box.classList.toggle('crm-hidden', !recent.length);
        box.innerHTML = recent.length
            ? '<span class="crm-recent-label">Недавние:</span>' +
              recent.map((q) => `<button type="button" class="crm-recent-chip" data-q="${crmEsc(q)}" title="Повторить поиск">${crmEsc(q)}</button>`).join('')
            : '';
    }

    function addRecent(query) {
        const q = String(query || '').trim();
        if (q.length < 2) return;
        recent = [q, ...recent.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, RECENT_MAX);
        try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent)); } catch (_) { /* не критично */ }
        renderRecent();
    }

    $('cfs-recent').addEventListener('click', (e) => {
        const chip = e.target.closest('.crm-recent-chip');
        if (!chip) return;
        $('cfs-query').value = chip.dataset.q;
        runSearch(false);
    });

    /* ---------- Поиск ---------- */

    const cqlText = (v) => String(v).replace(/[\\"]/g, '\\$&');

    function buildCql(q) {
        const parts = [`${$('cfs-title-only').checked ? 'title' : 'siteSearch'} ~ "${cqlText(q)}"`];
        const type = $('cfs-type').value;
        parts.push(type === 'pages' ? 'type in (page, blogpost)' : `type = ${type}`);
        if (/^[~A-Za-z0-9_-]{1,40}$/.test(state.spaceKey)) parts.push(`space = "${state.spaceKey}"`);
        return parts.join(' AND ') + ($('cfs-sort').value === 'new' ? ' ORDER BY lastmodified DESC' : '');
    }

    // Маркеры подсветки Confluence → <mark>. Весь остальной текст экранируется.
    const hl = (raw) => crmEsc(String(raw ?? '').replace(/\s+/g, ' ').trim())
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
        return `<a class="cfs-item" href="${crmEsc(itemUrl(r))}" target="_blank" rel="noopener noreferrer">
            <div class="cfs-item-top"><span class="cfs-item-ico">${crmIcon(isAtt ? 'clip' : 'doc', 16)}</span><span class="cfs-item-title">${hl(r.title || r.content?.title || 'Без названия')}</span></div>
            <div class="cfs-item-meta">${space ? `<span class="crm-pill" data-tone="info">${crmEsc(space)}</span>` : ''}${dateText ? `<span class="crm-pill" title="Дата последнего изменения">Обновлён: ${crmEsc(dateText)}</span>` : ''}</div>
            ${excerpt ? `<div class="cfs-excerpt">${excerpt}</div>` : ''}
        </a>`;
    }

    function setLoading(on) {
        state.loading = on;
        crmSetBusy($('cfs-go'), on);
        const more = $('cfs-more');
        if (more) { more.disabled = on; more.textContent = on ? 'Загрузка…' : 'Показать ещё'; }
    }

    async function runSearch(append) {
        const q = (append ? state.q : $('cfs-query').value).trim();
        if (!q || state.loading) return;
        const box = $('cfs-results');
        const id = ++state.searchId;

        if (!state.authorized && !(await checkAuth())) {
            box.innerHTML = '<div class="crm-empty is-error">Нужна авторизация в Confluence — войдите и нажмите «обновить».</div>';
            $('cfs-meta').textContent = '';
            return;
        }

        if (!append) {
            state.q = q; state.start = 0; state.total = 0;
            box.innerHTML = '<div class="crm-empty">Ищу…</div>';
            $('cfs-meta').textContent = '';
            addRecent(q);
        }
        setLoading(true);
        try {
            const path = `/rest/api/search?cql=${encodeURIComponent(buildCql(q))}&limit=${PAGE_SIZE}&start=${state.start}&excerpt=highlight`;
            const data = await cfJson(path);
            if (id !== state.searchId) return; // пришёл ответ на устаревший запрос
            const results = Array.isArray(data.results) ? data.results : [];
            state.total = Number(data.totalSize) || results.length;
            state.start += results.length;

            box.querySelector('#cfs-more')?.remove();
            if (!append) box.innerHTML = '';
            if (!results.length && !append) {
                box.innerHTML = '<div class="crm-empty">Ничего не найдено.<br>Попробуйте другие слова или уберите фильтры.</div>';
            } else {
                box.insertAdjacentHTML('beforeend', results.map(itemHtml).join(''));
                if (state.start < state.total && results.length) {
                    box.insertAdjacentHTML('beforeend', '<button type="button" class="crm-btn cfs-more" id="cfs-more">Показать ещё</button>');
                }
            }
            $('cfs-meta').textContent = `Найдено: ${state.total} · показано: ${Math.min(state.start, state.total)}`;
        } catch (e) {
            if (id !== state.searchId) return;
            if (isAuthError(e)) { state.authorized = false; await checkAuth(); }
            if (!append) box.innerHTML = '';
            box.insertAdjacentHTML('beforeend', `<div class="crm-empty is-error">Ошибка поиска: ${crmEsc(e.message)}</div>`);
        } finally {
            setLoading(false);
        }
    }

    /* ---------- Выбор пространства ---------- */

    let allSpaces = null; // загружается один раз после авторизации
    let spacesLoading = false;

    async function loadSpaces() {
        if (allSpaces || spacesLoading) return;
        spacesLoading = true;
        try {
            const out = [];
            for (let start = 0; start < 600; start += 100) {
                const data = await cfJson(`/rest/api/space?type=global&status=current&limit=100&start=${start}`);
                const part = Array.isArray(data.results) ? data.results : [];
                out.push(...part.map((x) => ({ key: String(x.key || ''), name: String(x.name || x.key || '') })));
                if (part.length < 100) break;
            }
            allSpaces = out.filter((x) => x.key).sort((x, y) => x.name.localeCompare(y.name, 'ru'));
        } catch (_) {
            allSpaces = null; // список не загрузился — останутся закреплённые
        } finally {
            spacesLoading = false;
            if (!$('cfs-pop').classList.contains('crm-hidden')) renderSpaceList();
        }
    }

    const popOpen = () => !$('cfs-pop').classList.contains('crm-hidden');
    const popToggle = (open) => $('cfs-pop').classList.toggle('crm-hidden', !open);

    /** Список — position: fixed: окно обрезает содержимое, а список должен выходить за его границы. Ставим под кнопкой, а если внизу тесно — над ней. */
    function placePop() {
        const pop = $('cfs-pop');
        const r = $('cfs-space-btn').getBoundingClientRect();
        const width = Math.min(340, window.innerWidth - 16);
        const below = window.innerHeight - r.bottom - 12;
        const above = r.top - 12;
        const openUp = below < 260 && above > below;
        const room = Math.max(160, openUp ? above : below);
        pop.style.width = `${width}px`;
        pop.style.left = `${Math.max(8, Math.min(r.left, window.innerWidth - width - 8))}px`;
        $('cfs-pop-list').style.maxHeight = `${Math.min(270, room - 56)}px`;
        if (openUp) {
            pop.style.top = '';
            pop.style.bottom = `${window.innerHeight - r.top + 4}px`;
        } else {
            pop.style.bottom = '';
            pop.style.top = `${r.bottom + 4}px`;
        }
    }

    function setSpace(key, name) {
        state.spaceKey = key || '';
        $('cfs-space-label').textContent = key ? `${key} · ${name || key}` : 'Все пространства';
        $('cfs-space-btn').classList.toggle('is-set', !!key);
        popToggle(false);
        if (state.q) runSearch(false);
    }

    function renderSpaceList() {
        const q = $('cfs-pop-search').value.trim().toLowerCase();
        const cur = state.spaceKey;
        const match = (x) => !q || x.key.toLowerCase().includes(q) || x.name.toLowerCase().includes(q);
        const opt = (x) => `<button type="button" class="cfs-pop-opt${x.key === cur ? ' is-active' : ''}" data-key="${crmEsc(x.key)}" data-name="${crmEsc(x.name)}"><span class="cfs-pop-key">${crmEsc(x.key)}</span><span class="cfs-pop-name">${crmEsc(x.name)}</span></button>`;
        const pinned = PINNED_SPACES.filter(match);
        const pinnedKeys = new Set(PINNED_SPACES.map((x) => x.key));
        const rest = (allSpaces || []).filter((x) => !pinnedKeys.has(x.key) && match(x));
        let out = q ? '' : `<button type="button" class="cfs-pop-opt${cur ? '' : ' is-active'}" data-key="" data-name=""><span class="cfs-pop-key">ВСЕ</span><span class="cfs-pop-name">Все пространства</span></button>`;
        if (pinned.length) out += `<div class="cfs-pop-title">Основные</div>${pinned.map(opt).join('')}`;
        if (rest.length) out += `<div class="cfs-pop-title">Остальные пространства</div>${rest.map(opt).join('')}`;
        if (!pinned.length && !rest.length) out += '<div class="cfs-pop-note">Ничего не найдено</div>';
        if (!allSpaces) out += `<div class="cfs-pop-note">${spacesLoading ? 'Загружаю список пространств…' : 'Полный список недоступен — вход в Confluence или сеть.'}</div>`;
        $('cfs-pop-list').innerHTML = out;
    }

    $('cfs-space-btn').addEventListener('click', () => {
        popToggle(!popOpen());
        if (!popOpen()) return;
        placePop();
        $('cfs-pop-search').value = '';
        renderSpaceList();
        loadSpaces();
        $('cfs-pop-search').focus();
    });
    $('cfs-pop-search').addEventListener('input', renderSpaceList);
    $('cfs-pop-list').addEventListener('click', (e) => {
        const o = e.target.closest('.cfs-pop-opt');
        if (o) setSpace(o.dataset.key, o.dataset.name);
    });
    win.addEventListener('mousedown', (e) => {
        if (popOpen() && !e.target.closest('.cfs-spacebox')) popToggle(false);
    });
    window.addEventListener('resize', () => popToggle(false));
    win.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popOpen()) { e.stopPropagation(); popToggle(false); }
    });

    /* ---------- События ---------- */

    $('cfs-go').onclick = () => runSearch(false);
    $('cfs-query').addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(false); });
    ['cfs-type', 'cfs-sort', 'cfs-title-only'].forEach((id) => $(id).addEventListener('change', () => { if (state.q) runSearch(false); }));
    $('cfs-refresh').onclick = checkAuth;
    $('cfs-open').onclick = () => window.open(cfBase(), '_blank', 'noopener');
    $('cfs-login').onclick = () => window.open(cfBase(), '_blank', 'noopener');
    $('cfs-results').addEventListener('click', (e) => { if (e.target.closest('#cfs-more')) runSearch(true); });

    renderRecent();

    $('confluencefinder').onclick = () => {
        if (!crmToggleWindow(win)) return;
        checkAuth();
        $('cfs-query').focus();
    };
})();
