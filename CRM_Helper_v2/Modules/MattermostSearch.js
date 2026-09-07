console.log('[MMS] === MattermostSearch.js загружен ===');

(function () {
    'use strict';

    // ─── Constants ───────────────────────────────────────────────────────────────

    var MM_ORIGIN    = 'https://mm-time.skyeng.tech';
    var WINDOW_ID    = 'AF_Mattermost';
    var STORAGE_KEY  = 'mms_cache_v1';
    var SEARCH_LIMIT = 20;
    var AUTH_ERR     = 'AUTH';

    // ─── Helpers ─────────────────────────────────────────────────────────────────

    var notify = function (msg) {
        if (typeof createAndShowButton === 'function') {
            createAndShowButton(msg);
        }
    };

    // ─── Cache ───────────────────────────────────────────────────────────────────

    var cache = { channels: {}, users: {} };

    try {
        var s = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (s && s.channels && s.users) {
            cache = s;
        }
    } catch (e) {}

    var persistCache = function () {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        } catch (e) {}
    };

    // ─── API ─────────────────────────────────────────────────────────────────────

    function mmRequest(path, options) {
        options = options || {};

        var url = MM_ORIGIN + path;
        var ro = Object.assign({}, options, {
            credentials: 'include',
            headers: Object.assign(
                {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                options.headers || {}
            )
        });

        return new Promise(function (resolve, reject) {
            chrome.runtime.sendMessage(
                { action: 'getFetchRequest', fetchURL: url, requestOptions: ro },
                function (resp) {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                        return;
                    }

                    if (!resp || !resp.success) {
                        var e = (resp && resp.error) || 'no response';
                        if (/(401|403)/.test(e)) {
                            reject(new Error(AUTH_ERR));
                        } else {
                            reject(new Error(e));
                        }
                        return;
                    }

                    try {
                        resolve(JSON.parse(resp.fetchansver));
                    } catch (e) {
                        reject(new Error('JSON error'));
                    }
                }
            );
        });
    }

    // ─── State ───────────────────────────────────────────────────────────────────

    var dom = {};

    var teamId         = '';
    var teamName       = '';
    var currentResults = [];
    var searchTerms    = '';
    var searchPage     = 0;
    var hasMore        = false;
    var teamsLoaded    = false;
    var hiddenChannels = new Set();

    // ─── UI Utilities ────────────────────────────────────────────────────────────

    function setStatus(text, color) {
        if (!dom.status) return;
        dom.status.textContent = text || '';
        if (color) dom.status.style.color = color;
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function previewOf(m) {
        return String(m || '')
            .replace(/```[\s\S]*?```/g, ' ')
            .replace(/`([^`]*)`/g, '$1')
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/[*_~>]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function highlight(et, terms) {
        if (!terms) return et;

        String(terms)
            .split(/\s+/)
            .filter(function (w) { return w.length > 2; })
            .forEach(function (w) {
                et = et.replace(
                    new RegExp(
                        escapeHtml(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
                        'gi'
                    ),
                    function (m) {
                        return '<span class="mms-hit">' + m + '</span>';
                    }
                );
            });

        return et;
    }

    // ─── Rendering ───────────────────────────────────────────────────────────────

    function getAttachments(post) {
        if (!post) return [];
        return (
            post.attachments ||
            (post.props && post.props.attachments) ||
            (post.metadata && post.metadata.attachments) ||
            []
        );
    }

    function renderFiles(post) {
        var files = (post.metadata && Array.isArray(post.metadata.files))
            ? post.metadata.files
            : [];

        if (!files.length && Array.isArray(post.file_ids) && post.file_ids.length) {
            files = post.file_ids.map(function (id) {
                return { id: id, name: 'file', extension: '' };
            });
        }

        if (!files.length) return '';

        return '<div class="mms-files">' + files.map(function (f) {
            var url = MM_ORIGIN + '/api/v4/files/' + f.id;
            var ext = String(f.extension || '').toLowerCase();

            if (/^(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(ext)) {
                return '<a class="mms-file-img" href="' + url + '" target="_blank">'
                     + '<img src="' + url + '" loading="lazy">'
                     + '<span class="mms-file-name">' + escapeHtml(f.name || '') + '</span>'
                     + '</a>';
            }

            return '<a class="mms-file-link" href="' + url + '" target="_blank">'
                 + '📎 ' + escapeHtml(f.name || f.id)
                 + '</a>';
        }).join('') + '</div>';
    }

    function renderAttachments(post, terms) {
        var atts = getAttachments(post);
        if (!atts.length) return '';

        return atts.map(function (a) {
            var bc    = (a && a.color) ? escapeHtml(String(a.color)) : '';
            var title = (a && a.title)
                ? '<div class="mms-att-title">' + escapeHtml(String(a.title)).slice(0, 400) + '</div>'
                : '';
            var text  = (a && a.text)
                ? '<div class="mms-att-text">' + highlight(escapeHtml(String(a.text)).slice(0, 1200), terms) + '</div>'
                : '';

            if (!title && !text) return '';

            return '<div class="mms-att"' + (bc ? ' style="border-left-color:' + bc + ';"' : '') + '>'
                 + title
                 + text
                 + '</div>';
        }).join('');
    }

    function renderPostItem(post, terms, opts) {
        opts = opts || {};

        var ch        = cache.channels[post.channel_id] || { displayName: post.channel_id };
        var author    = cache.users[post.user_id] || post.user_id || '';
        var date      = new Date(post.create_at).toLocaleString('ru-RU');
        var preview   = highlight(escapeHtml(previewOf(post.message)), terms).slice(0, 900);
        var permalink = MM_ORIGIN + '/' + teamName + '/pl/' + post.id;

        var item = document.createElement('div');
        item.className = 'mms-item' + (opts.isThreadRoot ? ' mms-item-root' : '');

        item.innerHTML =
            '<div class="mms-item-head">'
          +   '<span class="mms-channel"># ' + escapeHtml(ch.displayName) + '</span>'
          +   '<span class="mms-author">' + escapeHtml(author) + '</span>'
          +   '<span class="mms-time">' + escapeHtml(date) + '</span>'
          + '</div>'
          + '<div class="mms-msg">' + (preview || '<i>пустое</i>') + '</div>'
          + renderFiles(post)
          + renderAttachments(post, terms)
          + '<div class="mms-actions">'
          +   '<button class="mms-act-btn" data-action="open">🔗 Открыть</button>'
          +   '<button class="mms-act-btn" data-action="copy">📋 Копировать</button>'
          + '</div>';

        item.querySelector('[data-action="open"]').onclick = function () {
            window.open(permalink, '_blank');
        };

        item.querySelector('[data-action="copy"]').onclick = function () {
            navigator.clipboard.writeText(permalink).then(function () {
                notify('Скопировано');
            });
        };

        return item;
    }

    // ─── Teams ───────────────────────────────────────────────────────────────────

    function initTeams() {
        return mmRequest('/api/v4/teams', { method: 'GET' })
            .then(function (teams) {
                dom.team.innerHTML = '';
                teams = Array.isArray(teams) ? teams : [];

                if (!teams.length) {
                    dom.team.add(new Option('Нет команд', ''));
                    return;
                }

                teams.forEach(function (t) {
                    var o = new Option(t.display_name || t.name, t.id);
                    o.dataset.name = t.name;
                    dom.team.add(o);
                });

                var preferred = null;

                try {
                    var sid = localStorage.getItem('mms_team_id');
                    if (sid && teams.some(function (t) { return t.id === sid; })) {
                        preferred = teams.find(function (t) { return t.id === sid; });
                    }
                } catch (e) {}

                if (!preferred) {
                    preferred = teams.find(function (t) {
                        return /skyeng/i.test((t.display_name || '') + ' ' + (t.name || ''));
                    }) || teams[0];
                }

                dom.team.value = preferred.id;
                teamId         = preferred.id;
                teamName       = preferred.name;
                teamsLoaded    = true;

                setStatus('Команда: ' + (preferred.display_name || preferred.name), '#d4a843');
            })
            .catch(function (e) {
                dom.team.innerHTML = '<option value="">Ошибка</option>';
                setStatus(
                    e.message === AUTH_ERR ? 'Нужна авторизация' : 'Ошибка',
                    '#f87171'
                );
            });
    }

    // ─── Search Results ──────────────────────────────────────────────────────────

    function mergeResults(res) {
        var posts    = (res && res.posts) || {};
        var order    = Array.isArray(res.order) ? res.order : Object.keys(posts);
        var raw      = order.map(function (id) { return posts[id]; }).filter(Boolean);
        var existing = new Set(currentResults.map(function (p) { return p.id; }));
        var fresh    = raw.filter(function (p) { return !existing.has(p.id); });

        currentResults.push.apply(currentResults, fresh);
        hasMore = !!((res && res.next_post_id) || fresh.length === SEARCH_LIMIT);

        var cids = [...new Set(fresh.map(function (p) { return p.channel_id; }).filter(Boolean))];
        var uids = [...new Set(fresh.map(function (p) { return p.user_id; }).filter(Boolean))];

        return Promise.all([
            Promise.all(
                cids.map(function (id) {
                    return mmRequest('/api/v4/channels/' + id, { method: 'GET' })
                        .then(function (ch) {
                            cache.channels[id] = {
                                name: ch.name,
                                displayName: ch.display_name || ch.name
                            };
                            persistCache();
                        })
                        .catch(function () {
                            cache.channels[id] = { name: id, displayName: id };
                        });
                })
            ),
            mmRequest('/api/v4/users/ids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(uids)
            })
                .then(function (u) {
                    (Array.isArray(u) ? u : []).forEach(function (x) {
                        cache.users[x.id] = x.username || x.id;
                    });
                    persistCache();
                })
                .catch(function () {})
        ]);
    }

    function drawResults(terms) {
        var list = currentResults.filter(function (p) {
            return !hiddenChannels.has(p.channel_id);
        });

        dom.results.innerHTML = '';

        if (!currentResults.length) {
            dom.results.innerHTML = '<div class="mms-empty">Ничего не найдено.</div>';
            return;
        }

        if (!list.length) {
            dom.results.innerHTML = '<div class="mms-empty">Все каналы скрыты.</div>';
            return;
        }

        var groups = new Map();
        list.forEach(function (p) {
            var id = p.channel_id || '_';
            if (!groups.has(id)) groups.set(id, []);
            groups.get(id).push(p);
        });

        [...groups.entries()]
            .sort(function (a, b) { return b[1].length - a[1].length; })
            .forEach(function (entry) {
                var chId  = entry[0];
                var posts = entry[1];
                var ch    = cache.channels[chId] || { displayName: chId };

                var g = document.createElement('div');
                g.className = 'mms-group';

                var h = document.createElement('div');
                h.className = 'mms-group-head';
                h.innerHTML =
                    '<span class="mms-group-arrow">▾</span>'
                  + '<span class="mms-channel"># ' + escapeHtml(ch.displayName) + '</span>'
                  + '<span class="mms-group-cnt">' + posts.length + '</span>';

                h.onclick = function () {
                    g.classList.toggle('mms-collapsed');
                };

                var b = document.createElement('div');
                b.className = 'mms-group-body';

                posts.forEach(function (p) {
                    b.appendChild(renderPostItem(p, terms));
                });

                g.appendChild(h);
                g.appendChild(b);
                dom.results.appendChild(g);
            });

        if (hasMore) {
            var mb = document.createElement('button');
            mb.id        = 'mms-more';
            mb.className = 'mms-btn mms-btn-primary';
            mb.style.cssText = 'width:100%;margin-top:10px;';
            mb.textContent   = '📥 Показать ещё';
            mb.onclick       = loadMore;
            dom.results.appendChild(mb);
        }

        setStatus('Найдено: ' + currentResults.length, '#86efac');
    }

    function drawChannelBar() {
        var counts = new Map();
        currentResults.forEach(function (p) {
            if (p.channel_id) {
                counts.set(p.channel_id, (counts.get(p.channel_id) || 0) + 1);
            }
        });

        if (counts.size <= 1) {
            dom.channelBar.style.display = 'none';
            dom.channelBar.innerHTML = '';
            return;
        }

        dom.channelBar.style.display = 'flex';
        dom.channelBar.innerHTML =
            [...counts.entries()]
                .sort(function (a, b) { return b[1] - a[1]; })
                .map(function (entry) {
                    var id  = entry[0];
                    var cnt = entry[1];
                    var ch  = cache.channels[id] || { displayName: id };
                    var off = hiddenChannels.has(id);

                    return '<span class="mms-chip' + (off ? ' mms-chip-off' : '') + '" data-ch="' + id + '">'
                         +   '<span class="mms-chip-name"># ' + escapeHtml(ch.displayName) + '</span>'
                         +   '<span class="mms-chip-cnt">' + cnt + '</span>'
                         + '</span>';
                })
                .join('')
            + (hiddenChannels.size
                ? '<button class="mms-chip-reset" id="mms-chip-reset">показать все</button>'
                : '');

        dom.channelBar.querySelectorAll('.mms-chip').forEach(function (c) {
            c.onclick = function () {
                var id = c.dataset.ch;
                if (hiddenChannels.has(id)) {
                    hiddenChannels.delete(id);
                } else {
                    hiddenChannels.add(id);
                }
                drawChannelBar();
                drawResults(searchTerms);
            };
        });

        var r = dom.channelBar.querySelector('#mms-chip-reset');
        if (r) {
            r.onclick = function () {
                hiddenChannels.clear();
                drawChannelBar();
                drawResults(searchTerms);
            };
        }
    }

    // ─── Search Actions ──────────────────────────────────────────────────────────

    function runSearch() {
        var terms = dom.query.value.trim();

        if (!terms) {
            setStatus('Введите запрос', '#fbbf24');
            return Promise.resolve();
        }

        if (!teamId) {
            setStatus('Команда не выбрана', '#f87171');
            return Promise.resolve();
        }

        currentResults = [];
        searchTerms    = terms;
        searchPage     = 0;
        hasMore        = false;
        hiddenChannels.clear();

        dom.searchBtn.disabled = true;
        dom.results.innerHTML  = '<div class="mms-loading"><div class="mms-spinner"></div>Поиск...</div>';

        return mmRequest('/api/v4/teams/' + teamId + '/posts/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                terms: terms,
                is_or_search: true,
                page: 0,
                per_page: SEARCH_LIMIT
            })
        })
            .then(function (res) {
                return mergeResults(res);
            })
            .then(function () {
                drawChannelBar();
                drawResults(searchTerms);
            })
            .catch(function (e) {
                setStatus(
                    e.message === AUTH_ERR ? 'Нужна авторизация' : 'Ошибка',
                    '#f87171'
                );
                dom.results.innerHTML = '<div class="mms-empty">Ошибка</div>';
            })
            .finally(function () {
                dom.searchBtn.disabled = false;
            });
    }

    function loadMore() {
        if (!teamId || !searchTerms) return;

        var btn = document.getElementById('mms-more');
        if (btn) {
            btn.disabled    = true;
            btn.textContent = 'Загрузка...';
        }

        searchPage++;

        mmRequest('/api/v4/teams/' + teamId + '/posts/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                terms: searchTerms,
                is_or_search: true,
                page: searchPage,
                per_page: SEARCH_LIMIT
            })
        })
            .then(function (res) {
                return mergeResults(res);
            })
            .then(function () {
                drawChannelBar();
                drawResults(searchTerms);
            })
            .catch(function (e) {
                notify(e.message);
            });
    }

    // ─── DOM Binding ─────────────────────────────────────────────────────────────

    function bindToExistingWindow() {
        dom.win = document.getElementById(WINDOW_ID);
        if (!dom.win) return false;

        dom.team       = document.getElementById('mms-team');
        dom.query      = document.getElementById('mms-query');
        dom.status     = document.getElementById('mms-status');
        dom.results    = document.getElementById('mms-results');
        dom.channelBar = document.getElementById('mms-channel-bar');
        dom.searchBtn  = document.getElementById('mms-search');

        document.getElementById('mms-clear').onclick = function () {
            dom.query.value    = '';
            hiddenChannels.clear();
            currentResults     = [];
            searchTerms        = '';
            searchPage         = 0;
            hasMore            = false;
            dom.results.innerHTML = '<div class="mms-empty">Введите запрос и нажмите «Найти».</div>';
            setStatus('');
        };

        dom.searchBtn.onclick = runSearch;

        dom.query.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') runSearch();
        });

        dom.team.addEventListener('change', function () {
            var o    = dom.team.options[dom.team.selectedIndex];
            teamId   = o.value;
            teamName = o.dataset.name || teamName;
            setStatus('Команда: ' + o.textContent.trim(), '#d4a843');
            try {
                localStorage.setItem('mms_team_id', o.value);
            } catch (e) {}
        });

        return true;
    }

    // ─── Init ────────────────────────────────────────────────────────────────────

    var bound = false;

    function tryBind() {
        if (!bound && bindToExistingWindow()) {
            bound = true;
            console.log('[MMS] Привязано к окну');
        }
    }

    tryBind();
    if (!bound) setTimeout(tryBind, 200);
    if (!bound) setTimeout(tryBind, 500);
    if (!bound) setTimeout(tryBind, 1000);

    window.mmsToggle = function () {
        tryBind();
        if (!dom.win) return;

        var hidden = dom.win.style.display === 'none';
        dom.win.style.display = hidden ? '' : 'none';

        if (hidden && !teamsLoaded) {
            initTeams();
        }
    };

    console.log('[MMS] mmsToggle =', typeof window.mmsToggle);

})();