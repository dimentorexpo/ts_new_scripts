/**
 * MattermostSearch.js — «Поиск в Mattermost» (mm-time.skyeng.tech):
 * поиск по сообщениям команды, группировка по каналам, фильтр каналов,
 * просмотр треда, вложения и файлы. Запросы идут через bg.js с куками пользователя.
 */
(function () {
    'use strict';

    const MM_ORIGIN = 'https://mm-time.skyeng.tech';
    const CACHE_KEY = 'mms_cache_v1';
    const TEAM_KEY = 'mms_team_id';
    const RECENT_KEY = 'mmsRecentQueries';  // история поисковых запросов
    const RECENT_MAX = 8;
    const SEARCH_LIMIT = 20;
    // Потолки кэша каналов/пользователей: старые записи вытесняются первыми.
    const CACHE_MAX = { channels: 500, users: 1500 };

    /* ---------- Окно ---------- */

    const html = `
        ${crmWinHeader({
            icon: '💬',
            title: 'Поиск в Mattermost',
            tools: crmToolButton('mms-clear', crmIcon('clear', 15), 'Очистить'),
            closeId: 'mms-hide'
        })}
        <div class="crm-body">
            <div class="crm-row">
                <select class="crm-select" id="mms-team" style="width:190px" title="Команда"><option value="">Загрузка команд…</option></select>
                <input class="crm-input crm-grow" id="mms-query" placeholder="Что ищем? Enter — найти" autocomplete="off">
                <button type="button" class="crm-btn crm-btn-primary" id="mms-search">Найти</button>
            </div>
            <div class="crm-recent crm-hidden" id="mms-recent" style="margin-top:8px"></div>
            <div class="crm-hint" id="mms-status" style="margin-top:8px; min-height:18px"></div>
            <div class="mms-channel-bar crm-hidden" id="mms-channel-bar"></div>
            <div class="mms-results" id="mms-results"><div class="crm-empty">Введите запрос и нажмите «Найти».</div></div>
        </div>`;

    createWindowCRM('AF_Mattermost', 'winTopMMS', 'winLeftMMS', html);
    const win = document.getElementById('AF_Mattermost');
    win.style.width = '760px';
    hideWindowOnDoubleClick('AF_Mattermost');
    hideWindowOnClick('AF_Mattermost', 'mms-hide');

    const dom = {
        team: document.getElementById('mms-team'),
        query: document.getElementById('mms-query'),
        status: document.getElementById('mms-status'),
        results: document.getElementById('mms-results'),
        channelBar: document.getElementById('mms-channel-bar'),
        recent: document.getElementById('mms-recent'),
        searchBtn: document.getElementById('mms-search')
    };
    const EMPTY_HTML = '<div class="crm-empty">Введите запрос и нажмите «Найти».</div>';

    /* ---------- Кэш каналов и пользователей ---------- */

    let cache = { channels: {}, users: {} };
    try {
        const saved = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        if (saved && saved.channels && saved.users) cache = saved;
    } catch (_) { /* битый кэш — начинаем заново */ }

    const persistCache = () => {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (_) { /* переполнение — не критично */ }
    };

    /** Ограничивает рост кэша: ключи хранятся в порядке добавления, старые вытесняем первыми. */
    function trimCache() {
        for (const kind of Object.keys(CACHE_MAX)) {
            const keys = Object.keys(cache[kind]);
            if (keys.length > CACHE_MAX[kind]) {
                for (const id of keys.slice(0, keys.length - CACHE_MAX[kind])) delete cache[kind][id];
            }
        }
    }

    /* ---------- API ---------- */

    function mm(path, options = {}) {
        return crmRequestJson(MM_ORIGIN + path, {
            ...options,
            credentials: 'include',
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(options.headers || {}) }
        });
    }

    const isAuthError = (e) => e && (e.status === 401 || e.status === 403);
    const errorText = (e) => (isAuthError(e) ? 'Нет входа в Mattermost — откройте mm-time.skyeng.tech и авторизуйтесь' : `Ошибка: ${e.message}`);

    /* ---------- Состояние ---------- */

    let teamId = '';
    let teamName = '';
    let teamsLoaded = false;
    let results = [];
    let searchTerms = '';
    let searchPage = 0;
    let hasMore = false;
    let searchSeq = 0;
    const hiddenChannels = new Set();

    function setStatus(text, tone) {
        dom.status.textContent = text || '';
        dom.status.style.color = tone === 'bad' ? 'var(--crm-bad)' : tone === 'ok' ? 'var(--crm-ok)' : '';
    }

    /* ---------- История запросов ---------- */

    function loadRecent() {
        try {
            const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
            return Array.isArray(parsed) ? parsed.filter((q) => typeof q === 'string' && q.trim()).slice(0, RECENT_MAX) : [];
        } catch (_) { return []; }
    }

    let recent = loadRecent();

    function saveRecent() {
        localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    }

    /** Запоминает запрос и обновляет чипы. */
    function addRecent(query) {
        const q = String(query || '').trim();
        if (q.length < 2) return; // короткие запросы («ДЗ») тоже запоминаем
        recent = [q, ...recent.filter((x) => x !== q)].slice(0, RECENT_MAX);
        saveRecent();
        renderRecent();
    }

    function renderRecent() {
        const box = dom.recent;
        if (!recent.length) {
            box.classList.add('crm-hidden');
            box.innerHTML = '';
            return;
        }
        box.classList.remove('crm-hidden');
        box.innerHTML =
            '<span class="crm-recent-label">Недавние:</span>' +
            recent.map((q) => `<button type="button" class="crm-recent-chip" data-q="${crmEsc(q)}" title="Повторить поиск">${crmEsc(q)}</button>`).join('');
    }

    dom.recent.addEventListener('click', (e) => {
        const chip = e.target.closest('.crm-recent-chip');
        if (!chip) return;
        dom.query.value = chip.dataset.q;
        runSearch();
    });

    /* ---------- Текст и подсветка ---------- */

    /** Markdown → читаемый текст (переносы строк сохраняются). */
    function plainText(message) {
        return String(message || '')
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`([^`]*)`/g, '$1')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/[*_~]/g, '')
            .replace(/^>\s?/gm, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    /** Экранирует текст и подсвечивает слова запроса. Обрезка — до экранирования. */
    function highlight(text, terms, limit) {
        let source = String(text || '');
        if (limit && source.length > limit) source = `${source.slice(0, limit)}…`;
        const words = String(terms || '').split(/\s+/).filter((w) => w.length > 2)
            .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        if (!words.length) return crmEsc(source);
        const re = new RegExp(`(${words.join('|')})`, 'gi');
        return source.split(re).map((part, i) => (i % 2 ? `<mark class="crm-hit">${crmEsc(part)}</mark>` : crmEsc(part))).join('');
    }

    /** Цвет вложения: только #rgb/#rrggbb, чтобы в style нельзя было подсунуть лишнее. */
    const safeColor = (c) => (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(c || '')) ? c : '');

    /* ---------- Отрисовка поста ---------- */

    function renderFiles(post) {
        let files = (post.metadata && Array.isArray(post.metadata.files)) ? post.metadata.files : [];
        if (!files.length && Array.isArray(post.file_ids)) files = post.file_ids.map((id) => ({ id, name: 'файл', extension: '' }));
        if (!files.length) return '';

        return `<div class="mms-files">${files.map((f) => {
            const url = `${MM_ORIGIN}/api/v4/files/${encodeURIComponent(f.id)}`;
            const ext = String(f.extension || '').toLowerCase();
            if (/^(png|jpe?g|gif|webp|bmp)$/.test(ext)) {
                return `<a class="mms-file-img" href="${url}" target="_blank" rel="noopener"><img src="${url}" loading="lazy" alt=""><span class="mms-file-name">${crmEsc(f.name || '')}</span></a>`;
            }
            return `<a class="mms-file-link" href="${url}" target="_blank" rel="noopener">📎 ${crmEsc(f.name || f.id)}</a>`;
        }).join('')}</div>`;
    }

    function renderAttachments(post, terms) {
        const atts = post.attachments || (post.props && post.props.attachments) || (post.metadata && post.metadata.attachments) || [];
        return atts.map((a) => {
            if (!a) return '';
            const title = a.title ? `<div class="mms-att-title">${crmEsc(String(a.title).slice(0, 400))}</div>` : '';
            const text = a.text ? `<div class="mms-att-text">${highlight(a.text, terms, 1200)}</div>` : '';
            const fields = Array.isArray(a.fields) && a.fields.length
                ? `<div class="mms-att-fields">${a.fields.map((f) => {
                    if (!f || (!f.title && (f.value === undefined || f.value === null))) return '';
                    return `<div class="mms-att-field${f.short ? ' is-short' : ''}">` +
                        (f.title ? `<span class="mms-att-f-title">${crmEsc(f.title)}</span>` : '') +
                        (f.value !== undefined && f.value !== null ? `<span class="mms-att-f-value">${highlight(String(f.value), terms, 600)}</span>` : '') +
                        '</div>';
                }).join('')}</div>`
                : '';
            if (!title && !text && !fields) return '';
            const color = safeColor(a.color);
            return `<div class="mms-att"${color ? ` style="--mms-att-color:${color}"` : ''}>${title}${text}${fields}</div>`;
        }).join('');
    }

    function renderPost(post, terms, opts = {}) {
        const channel = cache.channels[post.channel_id] || { displayName: post.channel_id };
        const author = cache.users[post.user_id] || post.user_id || '';
        const permalink = `${MM_ORIGIN}/${teamName}/pl/${post.id}`;
        const inThread = !!post.root_id;
        const replies = post.reply_count || 0;
        const showThread = opts.showThreadButton !== false && (inThread || replies > 0);

        const msgHtml = highlight(plainText(post.message), terms, 900);
        const filesHtml = renderFiles(post);
        const attsHtml = renderAttachments(post, terms);

        const item = document.createElement('div');
        item.className = `mms-item${opts.isThreadRoot ? ' is-root' : ''}`;
        item.innerHTML = `
            <div class="mms-item-head">
                ${opts.isThreadRoot ? '<span class="crm-pill" data-tone="info">Начало треда</span>' : ''}
                <span class="mms-channel"># ${crmEsc(channel.displayName)}</span>
                <span class="mms-author">${crmEsc(author)}</span>
                <span class="mms-time">${crmEsc(new Date(post.create_at).toLocaleString('ru-RU'))}</span>
            </div>
            ${msgHtml ? `<div class="mms-msg">${msgHtml}</div>` : ''}
            ${filesHtml}
            ${attsHtml}
            ${!msgHtml && !filesHtml && !attsHtml ? '<div class="crm-hint">Сообщение без текста</div>' : ''}
            <div class="mms-actions">
                <button type="button" class="crm-btn crm-btn-sm" data-act="open">${crmIcon('external', 14)} Открыть</button>
                <button type="button" class="crm-btn crm-btn-sm" data-act="copy">${crmIcon('copy', 14)} Ссылка</button>
                ${showThread ? `<button type="button" class="crm-btn crm-btn-sm" data-act="thread">${crmIcon('thread', 14)} Тред${replies && !inThread ? ` (${replies})` : ''}</button>` : ''}
            </div>`;

        item.querySelector('[data-act="open"]').onclick = () => window.open(permalink, '_blank', 'noopener');
        item.querySelector('[data-act="copy"]').onclick = async () => {
            if (await crmCopy(permalink)) crmToast('Ссылка на сообщение скопирована', 'success', { duration: 1800 });
        };
        const threadBtn = item.querySelector('[data-act="thread"]');
        if (threadBtn) threadBtn.onclick = () => openThread(post);
        return item;
    }

    /* ---------- Имена каналов и авторов ---------- */

    async function hydrate(posts) {
        const channelIds = [...new Set(posts.map((p) => p.channel_id).filter((id) => id && !cache.channels[id]))];
        const userIds = [...new Set(posts.map((p) => p.user_id).filter((id) => id && !cache.users[id]))];

        await Promise.all([
            ...channelIds.map((id) => mm(`/api/v4/channels/${id}`, { method: 'GET' })
                .then((ch) => { cache.channels[id] = { name: ch.name, displayName: ch.display_name || ch.name }; })
                .catch(() => { cache.channels[id] = { name: id, displayName: id }; })),
            userIds.length
                ? mm('/api/v4/users/ids', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userIds) })
                    .then((users) => (Array.isArray(users) ? users : []).forEach((u) => { cache.users[u.id] = u.username || u.id; }))
                    .catch(() => {})
                : Promise.resolve()
        ]);
        trimCache();
        persistCache();
    }

    /* ---------- Результаты ---------- */

    function drawChannelBar() {
        const counts = new Map();
        results.forEach((p) => { if (p.channel_id) counts.set(p.channel_id, (counts.get(p.channel_id) || 0) + 1); });

        if (counts.size <= 1) {
            dom.channelBar.classList.add('crm-hidden');
            dom.channelBar.innerHTML = '';
            return;
        }

        dom.channelBar.classList.remove('crm-hidden');
        dom.channelBar.innerHTML = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id, cnt]) => {
            const ch = cache.channels[id] || { displayName: id };
            return `<button type="button" class="mms-chip${hiddenChannels.has(id) ? ' is-off' : ''}" data-ch="${crmEsc(id)}" title="Показать или скрыть канал">` +
                `<span class="mms-chip-name"># ${crmEsc(ch.displayName)}</span><span class="mms-chip-cnt">${cnt}</span></button>`;
        }).join('') + (hiddenChannels.size ? '<button type="button" class="crm-btn crm-btn-ghost crm-btn-sm" id="mms-chip-reset">Показать все</button>' : '');
    }

    function drawResults() {
        const list = results.filter((p) => !hiddenChannels.has(p.channel_id));
        dom.results.innerHTML = '';

        if (!results.length) {
            dom.results.innerHTML = '<div class="crm-empty">Ничего не найдено. Попробуйте другие слова или другую команду.</div>';
            return;
        }
        if (!list.length) {
            dom.results.innerHTML = '<div class="crm-empty">Все каналы скрыты фильтром выше.</div>';
            return;
        }

        const groups = new Map();
        list.forEach((p) => {
            const id = p.channel_id || '_';
            if (!groups.has(id)) groups.set(id, []);
            groups.get(id).push(p);
        });

        [...groups.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([chId, posts]) => {
            const ch = cache.channels[chId] || { displayName: chId };
            const group = document.createElement('div');
            group.className = 'mms-group';
            group.innerHTML = `<button type="button" class="mms-group-head"><span class="mms-group-arrow">▾</span># ${crmEsc(ch.displayName)}<span class="crm-pill">${posts.length}</span></button><div class="mms-group-body"></div>`;
            group.querySelector('.mms-group-head').onclick = () => group.classList.toggle('is-collapsed');
            const body = group.querySelector('.mms-group-body');
            posts.forEach((p) => body.appendChild(renderPost(p, searchTerms)));
            dom.results.appendChild(group);
        });

        if (hasMore) {
            const more = document.createElement('button');
            more.type = 'button';
            more.id = 'mms-more';
            more.className = 'crm-btn crm-btn-block';
            more.style.marginTop = '8px';
            more.textContent = 'Показать ещё';
            more.onclick = loadMore;
            dom.results.appendChild(more);
        }

        setStatus(`Найдено сообщений: ${results.length}${hasMore ? '+' : ''}`, 'ok');
    }

    dom.channelBar.addEventListener('click', (e) => {
        if (e.target.closest('#mms-chip-reset')) {
            hiddenChannels.clear();
        } else {
            const chip = e.target.closest('.mms-chip');
            if (!chip) return;
            const id = chip.dataset.ch;
            if (hiddenChannels.has(id)) hiddenChannels.delete(id);
            else hiddenChannels.add(id);
        }
        drawChannelBar();
        drawResults();
    });

    async function fetchPage(page) {
        const res = await mm(`/api/v4/teams/${teamId}/posts/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ terms: searchTerms, is_or_search: true, page, per_page: SEARCH_LIMIT })
        });
        const posts = (res && res.posts) || {};
        const order = Array.isArray(res && res.order) ? res.order : Object.keys(posts);
        const known = new Set(results.map((p) => p.id));
        const fresh = order.map((id) => posts[id]).filter((p) => p && !known.has(p.id));
        hasMore = order.length >= SEARCH_LIMIT;
        await hydrate(fresh);
        return fresh;
    }

    async function runSearch() {
        const terms = dom.query.value.trim();
        if (!terms) { setStatus('Введите запрос'); dom.query.focus(); return; }
        if (!teamId) { setStatus('Команда не выбрана — проверьте вход в Mattermost', 'bad'); return; }

        const seq = ++searchSeq;
        results = [];
        searchTerms = terms;
        searchPage = 0;
        hasMore = false;
        hiddenChannels.clear();

        crmSetBusy(dom.searchBtn, true);
        dom.channelBar.classList.add('crm-hidden');
        dom.results.innerHTML = '<div class="crm-loading"><span class="crm-spinner"></span>Ищу сообщения…</div>';
        setStatus('');

        try {
            const fresh = await fetchPage(0);
            if (seq !== searchSeq) return;
            results = fresh;
            drawChannelBar();
            drawResults();
            addRecent(terms);
        } catch (e) {
            if (seq !== searchSeq) return;
            setStatus(errorText(e), 'bad');
            dom.results.innerHTML = `<div class="crm-empty is-error">${crmEsc(errorText(e))}</div>`;
        } finally {
            if (seq === searchSeq) crmSetBusy(dom.searchBtn, false);
        }
    }

    async function loadMore() {
        const btn = document.getElementById('mms-more');
        const seq = searchSeq;
        crmSetBusy(btn, true);
        try {
            const fresh = await fetchPage(searchPage + 1);
            if (seq !== searchSeq) return;
            searchPage += 1;
            results = results.concat(fresh);
            drawChannelBar();
            drawResults();
        } catch (e) {
            if (seq !== searchSeq) return;
            crmSetBusy(btn, false);
            crmToast(errorText(e), 'error', { title: 'Mattermost' });
        }
    }

    /* ---------- Тред ---------- */

    async function openThread(post) {
        const rootId = post.root_id || post.id;
        const seq = searchSeq;
        dom.channelBar.classList.add('crm-hidden');
        dom.results.innerHTML = '<div class="crm-loading"><span class="crm-spinner"></span>Загружаю тред…</div>';

        try {
            const res = await mm(`/api/v4/posts/${rootId}/thread`, { method: 'GET' });
            if (seq !== searchSeq) return;
            const posts = (res && res.posts) || {};
            const order = Array.isArray(res.order) ? res.order : Object.keys(posts);
            const thread = order.map((id) => posts[id]).filter(Boolean).sort((a, b) => (a.create_at || 0) - (b.create_at || 0));
            await hydrate(thread);
            if (seq !== searchSeq) return;

            dom.results.innerHTML = '';
            const bar = document.createElement('div');
            bar.className = 'mms-thread-bar';
            bar.innerHTML = `<button type="button" class="crm-btn crm-btn-sm">${crmIcon('back', 14)} К результатам</button><span class="crm-hint">Сообщений в треде: ${thread.length}</span>`;
            bar.querySelector('button').onclick = () => { drawChannelBar(); drawResults(); };
            dom.results.appendChild(bar);
            thread.forEach((p) => dom.results.appendChild(renderPost(p, searchTerms, { isThreadRoot: p.id === rootId, showThreadButton: false })));
            dom.results.scrollTop = 0;
        } catch (e) {
            crmToast(errorText(e), 'error', { title: 'Тред не загружен' });
            drawChannelBar();
            drawResults();
        }
    }

    /* ---------- Команды ---------- */

    async function loadTeams() {
        try {
            const teams = await mm('/api/v4/teams', { method: 'GET' });
            const list = Array.isArray(teams) ? teams : [];
            dom.team.innerHTML = '';
            if (!list.length) {
                dom.team.add(new Option('Нет команд', ''));
                return;
            }
            list.forEach((t) => {
                const o = new Option(t.display_name || t.name, t.id);
                o.dataset.name = t.name;
                dom.team.add(o);
            });
            const saved = localStorage.getItem(TEAM_KEY);
            const preferred = list.find((t) => t.id === saved) ||
                list.find((t) => /skyeng/i.test(`${t.display_name || ''} ${t.name || ''}`)) || list[0];
            dom.team.value = preferred.id;
            teamId = preferred.id;
            teamName = preferred.name;
            teamsLoaded = true;
            setStatus(`Команда: ${preferred.display_name || preferred.name}`);
        } catch (e) {
            dom.team.innerHTML = '<option value="">Нет доступа</option>';
            setStatus(errorText(e), 'bad');
        }
    }

    dom.team.addEventListener('change', () => {
        const o = dom.team.options[dom.team.selectedIndex];
        teamId = o.value;
        teamName = o.dataset.name || teamName;
        setStatus(`Команда: ${o.textContent.trim()}`);
        try { localStorage.setItem(TEAM_KEY, o.value); } catch (_) { /* не критично */ }
    });

    /* ---------- События ---------- */

    dom.searchBtn.onclick = runSearch;
    dom.query.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });

    document.getElementById('mms-clear').onclick = () => {
        searchSeq++;
        crmSetBusy(dom.searchBtn, false);
        dom.query.value = '';
        results = [];
        searchTerms = '';
        hasMore = false;
        hiddenChannels.clear();
        dom.channelBar.classList.add('crm-hidden');
        dom.channelBar.innerHTML = '';
        dom.results.innerHTML = EMPTY_HTML;
        setStatus('');
    };

    document.getElementById('mattermostfinder').onclick = () => {
        if (!crmToggleWindow(win)) return;
        if (!teamsLoaded) loadTeams();
        renderRecent();
        dom.query.focus();
    };
})();
