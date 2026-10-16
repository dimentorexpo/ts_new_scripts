/**
 * JiraSearch.js — «Поиск в Jira»: пресеты JQL, поиск по слову или номеру задачи,
 * избранное, вставка ссылки в поле «Ссылка на Jira» задачи CRM, Support Tab +1.
 *
 * Разбор ответа issueNav/issueTable (HTML-таблица внутри JSON) оставлен прежним,
 * но с проверками на пустые совпадения.
 */
(function () {
    'use strict';

    const JIRA = 'https://jira.skyeng.link';
    const PAGE_SIZE = 50;
    const FAV_KEY = 'jiraFavsV2';           // новое избранное: [{id, key, title}]
    const LEGACY_FAV_KEY = 'bugsarray';     // старое: массив HTML-строк (не удаляется)
    const HELP_URL = 'https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-jirasearch%F0%9F%94%8EJiraSearch';

    /* ---------- JQL ---------- */

    const escapeJql = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const textClause = (t) => (t ? ` AND text ~ "${escapeJql(t)}"` : '');

    const PRESETS = [
        { id: 'defaultQuery', icon: '📇', label: 'Основной', jql: (t) => `issuetype in (Bug, Task) AND status != closed AND Reports > 0${textClause(t)} ORDER BY updated` },
        { id: 'freshQuery', icon: '🍀', label: 'Свежие', jql: (t) => `issuetype in (Bug, Task) AND status != closed AND Reports >= 0${textClause(t)} ORDER BY Created` },
        { id: 'ZBPQuery', icon: '🙅', label: 'Zero Bug', jql: (t) => `issuetype in (Bug, Task) AND status = closed AND resolution in ("Won't Fix", "Won't Do") AND Reports >= 0 AND created >= 2022-01-01${textClause(t)} ORDER BY updated` },
        { id: 'PSquery', icon: '🧩', label: 'PS', jql: (t) => `project = PS${textClause(t)} ORDER BY Created` },
        { id: 'getiosbugs', icon: '🍏', label: 'iOS', fixedText: 'ios', jql: (t) => `issuetype in (Bug, Task) AND status != closed AND Reports > 0${textClause(t)} ORDER BY updated` },
        { id: 'getandroidbugs', icon: '🤖', label: 'Android', fixedText: 'android', jql: (t) => `issuetype in (Bug, Task) AND status != closed AND Reports > 0${textClause(t)} ORDER BY updated` },
        { id: 'customQuery', icon: '📝', label: 'Свой JQL', custom: true },
        { id: 'favouriteBugs', icon: '★', label: 'Избранное', favourites: true }
    ];
    const presetById = new Map(PRESETS.map((p) => [p.id, p]));

    /* ---------- Разметка ---------- */

    const html = `
        ${crmWinHeader({
            icon: '🔎',
            title: 'Поиск в Jira',
            tools: '<span class="crm-pill" id="searchjiratknstatus" title="Вход в Jira">проверка…</span>' +
                   crmToolButton('RefreshJiraStatus', crmIcon('refresh', 15), 'Проверить вход в Jira') +
                   crmToolButton('ClearJiraData', crmIcon('clear', 15), 'Очистить результаты') +
                   crmToolButton('jirainstr', crmIcon('help', 15), 'Инструкция'),
            closeId: 'hideMej'
        })}
        <div class="crm-body">
            <div class="crm-seg" id="control_jira_search" role="tablist">
                ${PRESETS.map((p) => `<button type="button" id="${p.id}" role="tab">${p.icon} ${p.label}</button>`).join('')}
            </div>

            <div id="fields_jira_search" style="margin-top:10px">
                <textarea class="crm-textarea is-mono" id="JQLquery" rows="3" placeholder="JQL-запрос" spellcheck="false" title="Правка запроса переключает на «Свой JQL»"></textarea>
                <div class="crm-input-group" style="margin-top:8px">
                    <input class="crm-input" id="testJira" placeholder="Слово для поиска или номер задачи (PS-1234)" autocomplete="off">
                    <button type="button" class="crm-btn crm-btn-primary" id="getJiraTasks" title="Enter — найти. Номер задачи открывает её карточку">Найти</button>
                </div>
            </div>

            <div id="jira_tasks_box" style="margin-top:12px">
                <div class="jira-list" id="issuetable"></div>
                <div class="jira-list crm-hidden" id="favouriteissuetable"></div>
                <div class="crm-hint" id="foundIssuesAmount" style="margin-top:6px"></div>
                <div class="jira-pages" id="pagesSwitcher"></div>
            </div>
        </div>`;

    createWindowCRM('AF_Jira', 'winTopJira', 'winLeftJira', html);
    const win = document.getElementById('AF_Jira');
    win.style.width = '700px';
    hideWindowOnDoubleClick('AF_Jira');
    hideWindowOnClick('AF_Jira', 'hideMej');

    const $ = (id) => document.getElementById(id);
    const els = {
        jql: $('JQLquery'),
        text: $('testJira'),
        go: $('getJiraTasks'),
        list: $('issuetable'),
        favList: $('favouriteissuetable'),
        amount: $('foundIssuesAmount'),
        pages: $('pagesSwitcher'),
        fields: $('fields_jira_search'),
        token: $('searchjiratknstatus')
    };

    let activePreset = 'defaultQuery';
    let lastJql = '';
    let searchSeq = 0;

    /* ---------- Избранное ---------- */

    function migrateLegacyFavs() {
        let legacy;
        try { legacy = JSON.parse(localStorage.getItem(LEGACY_FAV_KEY) || '[]'); } catch (_) { legacy = []; }
        if (!Array.isArray(legacy)) return [];
        const parser = new DOMParser();
        return legacy.map((htmlStr) => {
            const doc = parser.parseFromString(String(htmlStr), 'text/html');
            const a = doc.querySelector('a[name="favbugs"], a');
            const idEl = doc.querySelector('[name="favissuemassive"]');
            const href = a ? a.getAttribute('href') || '' : '';
            const keyMatch = href.match(/browse\/([A-Z][A-Z0-9]+-\d+)/i);
            const text = a ? a.textContent.replace(/\s+/g, ' ').trim() : '';
            return {
                id: idEl ? idEl.textContent.trim() : '',
                key: keyMatch ? keyMatch[1] : '',
                title: text.replace(/^[A-Z][A-Z0-9]+-\d+\s*[–-]\s*/i, '')
            };
        }).filter((f) => f.key);
    }

    function loadFavs() {
        const raw = localStorage.getItem(FAV_KEY);
        if (raw === null) {
            const migrated = migrateLegacyFavs();
            localStorage.setItem(FAV_KEY, JSON.stringify(migrated));
            return migrated;
        }
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.filter((f) => f && f.key) : [];
        } catch (_) {
            return [];
        }
    }

    let favs = loadFavs();
    const saveFavs = () => localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    const isFav = (key) => favs.some((f) => f.key === key);

    function toggleFav(item) {
        if (isFav(item.key)) {
            favs = favs.filter((f) => f.key !== item.key);
            crmToast(`${item.key} убрана из избранного`, 'info', { duration: 1800 });
        } else {
            favs.push({ id: item.id, key: item.key, title: item.title });
            crmToast(`${item.key} в избранном`, 'success', { duration: 1800 });
        }
        saveFavs();
        document.querySelectorAll(`#AF_Jira .jira-row[data-key="${CSS.escape(item.key)}"] .jira-fav`)
            .forEach((b) => b.classList.toggle('is-on', isFav(item.key)));
        if (activePreset === 'favouriteBugs') renderFavs();
    }

    /* ---------- Отрисовка ---------- */

    const PRIORITY_COLORS = { blocker: 'var(--crm-bad)', critical: 'var(--crm-warn)', major: 'var(--crm-accent)', minor: '#8aa0b8', trivial: 'var(--crm-text-3)' };

    function highlight(text, query) {
        const safe = crmEsc(text);
        const q = String(query || '').trim();
        if (q.length < 2) return safe;
        const re = new RegExp(crmEsc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        return safe.replace(re, (m) => `<mark class="crm-hit">${m}</mark>`);
    }

    function rowHtml(item, query) {
        const priName = item.pic ? item.pic.split('/').pop().replace('.svg', '').toLowerCase() : '';
        const color = PRIORITY_COLORS[priName] || 'var(--crm-text-3)';
        return `
            <div class="jira-row" data-key="${crmEsc(item.key)}" data-id="${crmEsc(item.id || '')}" data-title="${crmEsc(item.title)}" style="--jira-pri:${color}">
                ${item.pic ? `<img data-src="${crmEsc(item.pic)}" alt="" title="${crmEsc(priName)}">` : ''}
                ${item.count !== undefined ? `<span class="crm-pill jira-count" title="Support Tab">${crmEsc(item.count)}</span>` : ''}
                <a class="jira-title" href="${JIRA}/browse/${encodeURIComponent(item.key)}" target="_blank" rel="noopener" title="${crmEsc(item.title)}">
                    <span class="jira-key">${crmEsc(item.key)}</span>${highlight(item.title, query)}
                </a>
                <span class="jira-actions">
                    <button type="button" class="crm-icon-btn" data-act="insert" title="Вставить ссылку в поле «Ссылка на Jira» задачи" aria-label="Вставить ссылку">${crmIcon('insert', 15)}</button>
                    ${item.id ? `<button type="button" class="crm-icon-btn" data-act="plus" title="Support Tab +1" aria-label="Support Tab +1">+1</button>` : ''}
                    <button type="button" class="crm-icon-btn jira-fav ${isFav(item.key) ? 'is-on' : ''}" data-act="fav" title="Избранное" aria-label="Избранное">${crmIcon('star', 15)}</button>
                </span>
            </div>`;
    }

    /* Иконки приоритетов лежат за авторизацией Jira — грузим через bg.js и кэшируем. */
    const priorityCache = new Map();

    function loadPriorityIcons(root) {
        root.querySelectorAll('img[data-src]').forEach((img) => {
            const url = img.dataset.src;
            if (!priorityCache.has(url)) {
                priorityCache.set(url, crmRequest(url, { method: 'GET', credentials: 'include' })
                    .then((svg) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`)
                    .catch(() => ''));
            }
            priorityCache.get(url).then((src) => { if (src) img.src = src; });
        });
    }

    function renderFavs() {
        els.favList.innerHTML = favs.length
            ? favs.map((f) => rowHtml(f, '')).join('')
            : '<div class="crm-empty">В избранном пусто. Нажмите ☆ у задачи в результатах поиска.</div>';
    }

    function renderPages(total, start) {
        const pages = Math.ceil(total / PAGE_SIZE);
        if (pages <= 1) { els.pages.innerHTML = ''; return; }
        const current = Math.floor(start / PAGE_SIZE);
        els.pages.innerHTML = Array.from({ length: pages }, (_, i) =>
            `<button type="button" class="crm-btn crm-btn-sm ${i === current ? 'is-active' : ''}" data-start="${i * PAGE_SIZE}">${i + 1}</button>`
        ).join('');
    }

    /* ---------- Пресеты ---------- */

    function currentJql() {
        const preset = presetById.get(activePreset);
        if (!preset || preset.custom || preset.favourites) return els.jql.value.trim();
        return preset.jql(els.text.value.trim());
    }

    function selectPreset(id, { run = false } = {}) {
        const preset = presetById.get(id);
        if (!preset) return;
        activePreset = id;
        document.querySelectorAll('#control_jira_search button').forEach((b) => b.classList.toggle('is-active', b.id === id));

        const showFavs = !!preset.favourites;
        els.fields.classList.toggle('crm-hidden', showFavs);
        els.list.classList.toggle('crm-hidden', showFavs);
        els.amount.classList.toggle('crm-hidden', showFavs);
        els.pages.classList.toggle('crm-hidden', showFavs);
        els.favList.classList.toggle('crm-hidden', !showFavs);

        if (showFavs) {
            renderFavs();
            return;
        }
        if (preset.custom) {
            els.jql.value = localStorage.getItem('customquery') || '';
        } else {
            if (preset.fixedText) els.text.value = preset.fixedText;
            els.jql.value = currentJql();
        }
        if (run) search(0);
    }

    /* ---------- Поиск ---------- */

    function requestOptions(jql, start) {
        return {
            headers: {
                __amdmodulename: 'jira/issue/utils/xsrf-token-header',
                accept: '*/*',
                'x-atlassian-token': 'no-check',
                'x-requested-with': 'XMLHttpRequest'
            },
            body: `startIndex=${start}&filterId=21266&jql=${encodeURIComponent(jql)}&layoutKey=list-view`,
            method: 'POST',
            credentials: 'include'
        };
    }

    /** Превращает HTML-таблицу Jira в строки {key, id, title, count, pic}. */
    function parseIssueTable(t, start) {
        const table = String(t.table || '');
        const keys = t.issueKeys || [];
        const ids = t.issueIds || [];
        const links = (table.match(/(\w+-\d+">.*?).<\/a>/gmi) || []).filter((_, i) => i % 2 !== 0);
        const numbers = table.match(/(">.)*?([0-9]+)\n/gm) || [];
        const pics = table.match(/https:\/\/jira\.skyeng\.link\/images\/icons\/priorities\/[^"'\s]*?\.svg/gm) || [];
        const rowIds = Array.from(table.matchAll(/<tr id="issuerow(\d+)"/g), (m) => m[1]);
        const decoder = document.createElement('textarea');

        return links.map((link, i) => {
            const m = link.match(/^(\w+-\d+)">([\s\S]*)<\/a>$/);
            decoder.innerHTML = m ? m[2] : link;              // Jira отдаёт экранированный текст
            const count = parseInt(String(numbers[i] || '').replace(/\D/g, ''), 10);
            return {
                key: keys[start + i] || (m ? m[1] : ''),
                id: rowIds[i] || ids[start + i] || '',
                title: decoder.value.replace(/\s+/g, ' ').trim(),
                count: Number.isNaN(count) ? 0 : count,
                pic: pics[i] || ''
            };
        }).filter((r) => r.key);
    }

    async function search(start = 0) {
        const query = els.text.value.trim();

        // Номер задачи — сразу ищем её карточку.
        if (/^[A-Za-z][A-Za-z0-9]+-\d+$/.test(query) && start === 0) {
            quickOpen(query.toUpperCase());
            return;
        }

        const jql = currentJql();
        if (!jql) {
            crmToast('Введите JQL-запрос', 'warning');
            return;
        }
        const preset = presetById.get(activePreset);
        if (preset && !preset.custom) els.jql.value = jql;
        lastJql = jql;

        const seq = ++searchSeq;
        crmSetBusy(els.go, true);
        els.list.innerHTML = '<div class="crm-loading"><span class="crm-spinner"></span>Ищу задачи…</div>';

        try {
            const res = await crmRequestJson(`${JIRA}/rest/issueNav/1/issueTable`, requestOptions(jql, start));
            if (seq !== searchSeq) return;

            const t = res.issueTable || {};
            const rows = parseIssueTable(t, start);
            const total = Number.isFinite(t.total) ? t.total : (t.issueKeys || []).length;

            if (!rows.length) {
                els.list.innerHTML = '<div class="crm-empty">Задач не найдено. Попробуйте другое слово или пресет.</div>';
                els.amount.textContent = '';
                els.pages.innerHTML = '';
                return;
            }

            els.list.innerHTML = rows.map((r) => rowHtml(r, query)).join('');
            els.list.scrollTop = 0;
            loadPriorityIcons(els.list);
            els.amount.textContent = `Найдено задач: ${total}`;
            renderPages(total, start);
        } catch (e) {
            if (seq !== searchSeq) return;
            const auth = e.status === 401 || e.status === 403;
            els.list.innerHTML = `<div class="crm-empty is-error">${auth ? 'Нет входа в Jira. Авторизуйтесь в jira.skyeng.link и повторите.' : `Поиск не выполнен: ${crmEsc(e.message)}. Проверьте JQL.`}</div>`;
        } finally {
            if (seq === searchSeq) crmSetBusy(els.go, false);
        }
    }

    async function quickOpen(key) {
        const seq = ++searchSeq;
        crmSetBusy(els.go, true);
        els.list.innerHTML = '<div class="crm-loading"><span class="crm-spinner"></span>Ищу задачу…</div>';
        try {
            const res = await crmRequestJson(`${JIRA}/rest/quicksearch/1.0/productsearch/search?q=${encodeURIComponent(key)}`, { method: 'GET', credentials: 'include' });
            if (seq !== searchSeq) return;
            const item = res?.[0]?.items?.[0];
            if (!item) {
                els.list.innerHTML = `<div class="crm-empty">Задача ${crmEsc(key)} не найдена.</div>`;
                return;
            }
            const foundKey = String(item.subtitle || key);
            els.list.innerHTML = rowHtml({ key: foundKey, id: '', title: String(item.title || '') }, '');
            els.amount.textContent = '';
            els.pages.innerHTML = '';
        } catch (e) {
            if (seq !== searchSeq) return;
            els.list.innerHTML = `<div class="crm-empty is-error">Не удалось найти задачу: ${crmEsc(e.message)}</div>`;
        } finally {
            if (seq === searchSeq) crmSetBusy(els.go, false);
        }
    }

    /* ---------- Действия со строкой ---------- */

    /** Вставка ссылки в поле «Ссылка на Jira» открытой задачи CRM. */
    async function insertIntoCrm(key) {
        const url = `${JIRA}/browse/${key}`;
        const label = Array.from(document.querySelectorAll('mat-label')).find((el) => el.textContent.trim() === 'Ссылка на Jira');
        const input = label && label.closest('mat-form-field')?.querySelector('input');
        if (input) {
            input.value = url;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            crmToast(`Ссылка на ${key} вставлена в задачу`, 'success', { duration: 2000 });
        } else if (await crmCopy(url)) {
            crmToast('Поле «Ссылка на Jira» не найдено — ссылка скопирована в буфер', 'info');
        }
    }

    /** Support Tab +1: читаем текущее значение и токен, затем сохраняем поле. */
    async function increaseSupportTab(issueId) {
        const page = await crmRequest(`${JIRA}/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${encodeURIComponent(issueId)}`, { method: 'GET', credentials: 'include' });
        const tokenMatch = page.match(/"atl_token":"([^"]+)"/);
        if (!tokenMatch) throw new Error('нет токена — войдите в Jira');
        let token = tokenMatch[1];
        try { token = JSON.parse(`"${token}"`); } catch (_) { /* уже чистая строка */ }

        const countMatch = page.match(/customfield_15410.*?value=.*?(\d+)/);
        const next = (countMatch ? parseInt(countMatch[1], 10) : 0) + 1;

        await crmRequest(`${JIRA}/secure/AjaxIssueAction.jspa?decorator=none`, {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
                'x-sitemesh-off': 'true'
            },
            body: new URLSearchParams({
                customfield_15410: String(next),
                issueId: String(issueId),
                atl_token: token,
                singleFieldEdit: 'true',
                fieldsToForcePresent: 'customfield_15410'
            }).toString(),
            credentials: 'include'
        });
        return next;
    }

    async function onRowAction(e) {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const row = btn.closest('.jira-row');
        const item = { key: row.dataset.key, id: row.dataset.id, title: row.dataset.title };

        if (btn.dataset.act === 'insert') insertIntoCrm(item.key);
        if (btn.dataset.act === 'fav') toggleFav(item);
        if (btn.dataset.act === 'plus') {
            if (btn.disabled) return;
            btn.disabled = true;
            try {
                const value = await increaseSupportTab(item.id);
                document.querySelectorAll(`#AF_Jira .jira-row[data-key="${CSS.escape(item.key)}"] .jira-count`)
                    .forEach((pill) => { pill.textContent = value; });
                crmToast(`Support Tab ${item.key}: ${value}`, 'success', { duration: 2500 });
            } catch (err) {
                crmToast(`Support Tab не увеличен: ${err.message}`, 'error');
            } finally {
                btn.disabled = false;
            }
        }
    }

    els.list.addEventListener('click', onRowAction);
    els.favList.addEventListener('click', onRowAction);

    /* ---------- Вход в Jira ---------- */

    async function checkToken() {
        els.token.textContent = 'проверка…';
        els.token.dataset.tone = '';
        try {
            const page = await crmRequest(`${JIRA}/`, { method: 'GET', credentials: 'include' });
            const loggedIn = /name="atlassian-token" content="[^"]*lin"/.test(page);
            els.token.textContent = loggedIn ? 'вход выполнен' : 'нет входа';
            els.token.dataset.tone = loggedIn ? 'ok' : 'bad';
            els.token.title = loggedIn ? 'Вы авторизованы в Jira' : 'Авторизуйтесь в jira.skyeng.link, иначе поиск не сработает';
        } catch (e) {
            els.token.textContent = 'нет связи';
            els.token.dataset.tone = 'bad';
            els.token.title = e.message;
        }
    }

    /* ---------- События ---------- */

    $('control_jira_search').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const preset = presetById.get(btn.id);
        selectPreset(btn.id, { run: !!(preset && preset.fixedText) });
    });

    els.text.addEventListener('input', () => {
        const preset = presetById.get(activePreset);
        if (preset && !preset.custom && !preset.favourites) els.jql.value = currentJql();
    });

    // Ручная правка JQL переключает на «Свой JQL» и сохраняет запрос.
    els.jql.addEventListener('input', () => {
        if (activePreset !== 'customQuery') {
            activePreset = 'customQuery';
            document.querySelectorAll('#control_jira_search button').forEach((b) => b.classList.toggle('is-active', b.id === 'customQuery'));
        }
        localStorage.setItem('customquery', els.jql.value);
    });

    els.text.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(0); });
    els.jql.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); search(0); }
    });
    els.go.addEventListener('click', () => search(0));
    // ПКМ по «Найти» — быстрый поиск задачи по номеру (как раньше).
    els.go.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const q = els.text.value.trim();
        if (q) quickOpen(q.toUpperCase());
    });

    els.pages.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-start]');
        if (btn && !btn.classList.contains('is-active') && lastJql) search(Number(btn.dataset.start));
    });

    $('ClearJiraData').onclick = () => {
        searchSeq++;
        crmSetBusy(els.go, false);
        els.text.value = '';
        els.list.innerHTML = '';
        els.amount.textContent = '';
        els.pages.innerHTML = '';
        if (activePreset !== 'customQuery' && activePreset !== 'favouriteBugs') els.jql.value = currentJql();
    };
    $('RefreshJiraStatus').onclick = checkToken;
    $('jirainstr').onclick = () => window.open(HELP_URL, '_blank', 'noopener');

    $('jirafinder').onclick = () => {
        if (!crmToggleWindow(win)) return;
        checkToken();
        if (!els.jql.value) selectPreset(activePreset);
        els.text.focus();
    };

    selectPreset('defaultQuery');
})();
