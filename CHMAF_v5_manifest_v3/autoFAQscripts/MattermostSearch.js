// ============================================================
// MattermostSearch.js — поиск по Mattermost прямо из AutoFAQ
// ============================================================
//
// Как это работает:
//  1. Модуль умеет работать в ДВУХ мирах:
//     a) isolated world — штатная загрузка через content_scripts (manifest.json);
//     b) main world — авто-инжект через <script> из utils.js, если модуль
//        не попал в content_scripts (устаревший manifest). Не требует никаких
//        permissions: связь с расширением идёт через postMessage-мост.
//  2. Запросы к API Mattermost идут двумя путями:
//     a) обычный fetch со страницы AutoFAQ — сработает, только если
//        Mattermost когда-нибудь начнёт отдавать CORS-заголовки;
//     b) автоматический фолбэк через background-воркер bg.js —
//        у расширения есть host_permissions на mm-time.skyeng.tech,
//        поэтому для запросов из service worker CORS НЕ применяется.
//        В isolated world — напрямую через chrome.runtime; в main world —
//        через postMessage-реле (utils.js слушает и проксирует в bg).
//     Итог: поиск работает всегда, независимо от CORS-политики сервера.
//  3. Авторизация — по cookie браузера: оператор должен быть залогинен
//     на https://mm-time.skyeng.tech. Заголовок X-Requested-With
//     снимает CSRF-проверку Mattermost (стандартный приём для XMLHttpRequest).
//  4. Окно и стили — в едином «стеклянном» стиле расширения; в isolated world
//     используется createWindow из utils.js (drag через .chmaf-drag-handle),
//     в main world — собственный мини-drag.

(function () {
    'use strict';

    const MM_ORIGIN = 'https://mm-time.skyeng.tech';
    const WINDOW_ID = 'AF_Mattermost';
    const STORAGE_KEY = 'mms_cache_v1';          // кэш каналов/пользователей
    const SEARCH_LIMIT = 20;                     // постов на поиск
    const AUTH_ERR = 'AUTH';                     // маркер проблемы авторизации

    // Прямой fetch со страницы AutoFAQ блокируется CORS-политикой Mattermost.
    // Первый же сетевой сбой запоминаем (сессия + localStorage) и дальше ходим
    // сразу через bg-фолбэк — иначе каждый запрос пишет CORS-ошибки в консоль.
    let directBroken = (() => {
        try { return localStorage.getItem('mms_direct_broken') === '1'; } catch (e) { return false; }
    })();

    // Мир выполнения: content-скрипты (isolated) видят chrome.runtime,
    // инжект через <script> (main world) — нет. Модуль работает в обоих.
    const IS_MAIN_WORLD = (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id);
    let bridgeSeq = 0;

    // Единый тост: в isolated world — штатный createAndShowButton,
    // в main world — локальный минималистичный fallback.
    const notify = (msg, type) => {
        if (typeof createAndShowButton === 'function') { createAndShowButton(msg, type); return; }
        if (typeof showCustomAlert === 'function') { showCustomAlert(msg, type); return; }
        try {
            const t = document.createElement('div');
            t.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999999;background:rgba(20,20,35,0.95);color:#f1f5f9;padding:12px 18px;border-radius:12px;font-size:13px;font-family:system-ui,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.45);border:1px solid rgba(255,255,255,0.1);max-width:420px;';
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 5000);
        } catch (e) { /* без тоста */ }
    };

    // Реле для main world: chrome.runtime здесь недоступен, поэтому fetch-запрос
    // к bg выполняет isolated-мир (utils.js слушает сообщения chmaf-mms).
    const fetchViaBridge = (url, requestOptions) => new Promise((resolve) => {
        const id = 'mms' + (++bridgeSeq);
        const handler = (e) => {
            const d = e.data;
            if (!d || d.source !== 'chmaf-mms' || d.action !== 'fetchResult' || d.id !== id) return;
            clearTimeout(timer);
            window.removeEventListener('message', handler);
            resolve(d.ok && d.body != null ? { body: d.body, error: null } : { body: null, error: d.error || 'bg ошибка' });
        };
        const timer = setTimeout(() => {
            window.removeEventListener('message', handler);
            resolve({ body: null, error: 'bg не ответил (таймаут)' });
        }, 8000);
        window.addEventListener('message', handler);
        try {
            window.postMessage({ source: 'chmaf-mms', action: 'fetch', id, fetchURL: url, requestOptions }, '*');
        } catch (e) {
            clearTimeout(timer);
            window.removeEventListener('message', handler);
            resolve({ body: null, error: 'postMessage недоступен' });
        }
    });

    // ═══════════════════════════════════════════════════════
    // Кэш имён каналов и пользователей (память + localStorage)
    // ═══════════════════════════════════════════════════════
    let cache = { channels: {}, users: {} };

    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (saved && saved.channels && saved.users) cache = saved;
    } catch (e) { /* повреждённый кэш — работаем с пустым */ }

    const persistCache = () => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch (e) { /* переполнение — не критично */ }
    };

    // ═══════════════════════════════════════════════════════
    // Единая точка запросов с CORS-фолбэком
    // ═══════════════════════════════════════════════════════
    const mmRequest = async (path, options = {}) => {
        const url = MM_ORIGIN + path;
        const requestOptions = Object.assign({}, options, {
            credentials: 'include',
            headers: Object.assign(
                { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                options.headers || {}
            )
        });

        // 1) Прямой fetch со страницы — только пока CORS не доказал обратное.
        //    Если Mattermost начнёт отдавать CORS-заголовки, путь включится сам.
        let directError = null;
        if (!directBroken) {
            try {
                const r = await fetch(url, requestOptions);
                if (r.ok) return await r.json();
                if (r.status === 401 || r.status === 403) throw new Error(AUTH_ERR);
                throw new Error('HTTP ' + r.status);
            } catch (err) {
                directError = err;
                // TypeError от fetch() = сетевой/префлайт-сбой, т.е. CORS.
                // (плюс текстовая проверка на случай другого realm/полифила).
                // Запоминаем один раз, чтобы не сыпать ошибками в консоль.
                const isNetworkFail = err instanceof TypeError
                    || /failed to fetch|networkerror when attempting/i.test((err && err.message) || '');
                if (isNetworkFail) {
                    directBroken = true;
                    try { localStorage.setItem('mms_direct_broken', '1'); } catch (e) { /* ignore */ }
                    console.info('[ChMAF] Mattermost: прямой fetch блокируется CORS — работаю через bg-фолбэк');
                }
            }
        }

        // 2) Фолбэк через background: host_permissions обходят CORS полностью.
        //    isolated world — напрямую через chrome.runtime; main world —
        //    через postMessage-реле (isolated мир проксирует запрос в bg).
        let bgError = null;
        let bgBody = null;
        if (IS_MAIN_WORLD) {
            const res = await fetchViaBridge(url, requestOptions);
            bgBody = res.body;
            bgError = res.error;
        } else if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.sendMessage === 'function') {
            bgBody = await new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    { action: 'getFetchRequest', fetchURL: url, requestOptions },
                    (resp) => {
                        if (chrome.runtime.lastError || !resp || !resp.success) {
                            bgError = resp?.error || chrome.runtime.lastError?.message || 'background недоступен';
                            resolve(null);
                        } else {
                            resolve(resp.fetchansver);
                        }
                    }
                );
            });
        } else {
            bgError = 'background недоступен';
        }

        if (bgBody === null || bgBody === undefined) {
            // Прямой ответ уже сказал «нужна авторизация» либо фолбэк вернул 401/403
            if ((directError && directError.message === AUTH_ERR) || /(401|403)/.test(bgError || '')) {
                throw new Error(AUTH_ERR);
            }
            throw new Error((directError ? directError.message : 'прямой fetch отключён (CORS)') + (bgError ? ' (via bg: ' + bgError + ')' : ''));
        }
        return JSON.parse(bgBody);
    };

    // ═══════════════════════════════════════════════════════
    // API Mattermost
    // ═══════════════════════════════════════════════════════
    const fetchTeams = async () => {
        const teams = await mmRequest('/api/v4/teams', { method: 'GET' });
        return Array.isArray(teams) ? teams : [];
    };

    const searchPosts = async (teamId, terms, page = 0) => {
        return await mmRequest(`/api/v4/teams/${teamId}/posts/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ terms, is_or_search: true, page, per_page: SEARCH_LIMIT })
        });
    };

    const getChannel = async (channelId) => {
        if (cache.channels[channelId]) return cache.channels[channelId];
        try {
            const ch = await mmRequest(`/api/v4/channels/${channelId}`, { method: 'GET' });
            cache.channels[channelId] = {
                name: ch.name,
                displayName: ch.display_name || ch.name,
                teamId: ch.team_id || ''
            };
            persistCache();
        } catch (e) {
            cache.channels[channelId] = { name: channelId, displayName: channelId, teamId: '' };
        }
        return cache.channels[channelId];
    };

    // Массовое получение имён пользователей (один запрос вместо N)
    const getUsers = async (userIds) => {
        const missing = userIds.filter(id => id && !cache.users[id]);
        if (missing.length) {
            try {
                const users = await mmRequest('/api/v4/users/ids', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(missing)
                });
                (Array.isArray(users) ? users : []).forEach(u => {
                    cache.users[u.id] = u.username || u.nickname || u.first_name || u.id;
                });
                persistCache();
            } catch (e) { /* остаёмся с id */ }
        }
        return userIds.map(id => cache.users[id] || id);
    };

    // ═══════════════════════════════════════════════════════
    // Стили
    // ═══════════════════════════════════════════════════════
    const MMS_STYLES = `
        .mms-panel {
            background: linear-gradient(165deg, rgba(24, 26, 36, 0.96) 0%, rgba(11, 12, 18, 0.98) 100%) !important;
            backdrop-filter: blur(24px) saturate(140%);
            -webkit-backdrop-filter: blur(24px) saturate(140%);
            border: 1px solid rgba(255, 255, 255, 0.09) !important;
            border-top: 2px solid rgba(93, 118, 255, 0.55) !important;
            border-radius: 18px !important;
            color: #e8ecf4;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 40px rgba(93, 118, 255, 0.06) !important;
            padding: 16px !important;
            overflow: hidden;
        }
        .mms-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; cursor: grab; }
        .mms-titleblock { display: flex; align-items: center; gap: 10px; }
        .mms-icon {
            width: 34px; height: 34px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center; font-size: 17px;
            background: linear-gradient(135deg, rgba(93, 118, 255, 0.25), rgba(88, 101, 242, 0.12));
            border: 1px solid rgba(93, 118, 255, 0.35);
            box-shadow: 0 4px 14px rgba(93, 118, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }
        .mms-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.3px; }
        .mms-subtitle { font-size: 9px; text-transform: uppercase; letter-spacing: 1.4px; color: rgba(255, 255, 255, 0.45); }
        .mms-btn {
            background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.1);
            color: #dfe6f1; padding: 7px 12px; border-radius: 10px; cursor: pointer;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 12px; line-height: 1;
        }
        .mms-btn:hover { background: rgba(255, 255, 255, 0.13); border-color: rgba(93, 118, 255, 0.4); transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35); }
        .mms-btn:active { transform: translateY(0) scale(0.97); }
        .mms-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .mms-btn-danger { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.25); color: #fca5a5; }
        .mms-btn-primary {
            background: linear-gradient(135deg, rgba(93, 118, 255, 0.85), rgba(88, 101, 242, 0.75));
            border: none; color: #fff; font-weight: 700;
            box-shadow: 0 6px 20px rgba(93, 118, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .mms-btn-primary:hover { filter: brightness(1.12); }
        .mms-search-row { display: flex; gap: 8px; align-items: center; }
        .mms-input {
            background: rgba(0, 0, 0, 0.35); border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 10px; color: #fff; padding: 9px 12px; outline: none;
            font-size: 13px; font-family: inherit; transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
            box-sizing: border-box;
        }
        .mms-input::placeholder { color: rgba(255, 255, 255, 0.35); }
        .mms-input:focus { border-color: rgba(93, 118, 255, 0.6); background: rgba(0, 0, 0, 0.5); box-shadow: 0 0 0 3px rgba(93, 118, 255, 0.12); }
        select.mms-input option { background: #14121d; color: #e8ecf4; }
        .mms-status { font-size: 12px; color: rgba(255, 255, 255, 0.55); white-space: nowrap; }
        .mms-results { margin-top: 12px; max-height: 420px; overflow-y: auto; padding-right: 6px; }
        .mms-results::-webkit-scrollbar { width: 5px; }
        .mms-results::-webkit-scrollbar-track { background: transparent; }
        .mms-results::-webkit-scrollbar-thumb { background: rgba(93, 118, 255, 0.25); border-radius: 10px; }
        .mms-empty { text-align: center; padding: 26px 16px; opacity: 0.45; font-size: 12px; letter-spacing: 0.3px; }
        .mms-item {
            background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06);
            border-left: 3px solid rgba(93, 118, 255, 0.7);
            padding: 10px 12px; margin-bottom: 7px; border-radius: 11px;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mms-item:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(93, 118, 255, 0.35); transform: translateX(3px); }
        .mms-item-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap; }
        .mms-channel {
            display: inline-flex; align-items: center; gap: 4px;
            background: rgba(93, 118, 255, 0.15); border: 1px solid rgba(93, 118, 255, 0.3);
            color: #a5b4fc; font-size: 11px; font-weight: 700;
            padding: 2px 8px; border-radius: 20px; white-space: nowrap;
        }
        .mms-author { font-size: 12px; font-weight: 600; color: #c7d2fe; }
        .mms-time { font-size: 10px; opacity: 0.5; font-family: 'SF Mono', monospace; }
        .mms-msg { font-size: 12.5px; line-height: 1.5; color: #e8ecf4; word-break: break-word; white-space: pre-wrap; }
        .mms-att {
            margin-top: 8px; padding: 9px 11px;
            background: rgba(0, 0, 0, 0.28);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-left: 3px solid rgba(93, 118, 255, 0.65);
            border-radius: 9px;
        }
        .mms-att-title { font-weight: 700; color: #c7d2fe; font-size: 12.5px; margin-bottom: 3px; word-break: break-word; }
        .mms-att-text { font-size: 12px; line-height: 1.45; color: #d7deea; white-space: pre-wrap; word-break: break-word; margin-top: 3px; }
        .mms-att-fields { display: flex; flex-wrap: wrap; gap: 7px 16px; margin-top: 7px; }
        .mms-att-field { font-size: 11.5px; min-width: 150px; flex: 1 1 100%; }
        .mms-att-field-short { flex: 1 1 40%; min-width: 130px; }
        .mms-att-f-title { display: block; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.7px; color: rgba(255, 255, 255, 0.45); margin-bottom: 2px; }
        .mms-att-f-value { color: #eef2f9; word-break: break-word; white-space: pre-wrap; }
        .mms-actions { display: flex; gap: 6px; margin-top: 7px; }
        .mms-act-btn {
            background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.09);
            color: #aab3c5; padding: 4px 9px; border-radius: 7px; cursor: pointer;
            font-size: 11px; transition: all 0.18s ease;
        }
        .mms-act-btn:hover { background: rgba(255, 255, 255, 0.12); color: #fff; border-color: rgba(93, 118, 255, 0.45); }
        .mms-hit { background: rgba(250, 204, 21, 0.35); color: #fde68a; border-radius: 3px; padding: 0 1px; }
        .mms-loading {
            display: flex; align-items: center; justify-content: center; gap: 10px;
            padding: 26px 16px; opacity: 0.7; font-size: 13px;
        }
        .mms-spinner {
            width: 18px; height: 18px; border-radius: 50%;
            border: 2px solid rgba(93, 118, 255, 0.2); border-top-color: #5d76ff;
            animation: mms-spin 0.9s linear infinite;
        }
        @keyframes mms-spin { 100% { transform: rotate(360deg); } }
    `;

    // ═══════════════════════════════════════════════════════
    // Разметка окна
    // ═══════════════════════════════════════════════════════
    const win_MMS = `
        <div class="mms-panel" style="width: 640px;">
            <div class="mms-header chmaf-drag-handle" id="mms_drag">
                <div class="mms-titleblock">
                    <span class="mms-icon">🔍</span>
                    <div>
                        <div class="mms-title">Mattermost Search</div>
                        <div class="mms-subtitle">поиск по каналам Skyeng</div>
                    </div>
                </div>
                <div style="display:flex; gap:8px;">
                    <button class="mms-btn" id="mms-clear" title="Очистить запрос и результаты">🧹</button>
                    <button class="mms-btn mms-btn-danger" id="mms-hide" title="Скрыть окно">✕</button>
                </div>
            </div>

            <div class="mms-search-row">
                <select class="mms-input" id="mms-team" style="width: 180px; text-align:center;" title="Команда Mattermost">
                    <option value="">Загрузка команд...</option>
                </select>
                <input class="mms-input" id="mms-query" placeholder="Что ищем? (Enter — поиск)" autocomplete="off" style="flex:1;">
                <button class="mms-btn mms-btn-primary" id="mms-search">🚀 Найти</button>
            </div>
            <div class="mms-search-row" style="margin-top:8px;">
                <input class="mms-input" id="mms-channel-filter" placeholder="Фильтр по каналу (без запроса к серверу)..." autocomplete="off" style="flex:1;">
                <span class="mms-status" id="mms-status"></span>
            </div>

            <div id="mms-results" class="mms-results">
                <div class="mms-empty">Введите запрос и нажмите «Найти».<br>Результаты появятся здесь.</div>
            </div>
        </div>
    `;

    // ═══════════════════════════════════════════════════════
    // Состояние модуля
    // ═══════════════════════════════════════════════════════
    const dom = {};
    let teamId = '';
    let teamName = '';
    let currentResults = [];   // накопленные посты (все загруженные страницы)
    let searchTerms = '';      // текущий запрос (для догрузки)
    let searchPage = 0;        // номер текущей страницы
    let hasMore = false;       // есть ли ещё страницы
    let teamsLoaded = false;

    const escapeHtml = (s) => String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // Убирает markdown-разметку для короткого превью сообщения
    const previewOf = (message) => {
        let text = String(message || '');
        text = text.replace(/```[\s\S]*?```/g, ' ');
        text = text.replace(/`([^`]*)`/g, '$1');
        text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
        text = text.replace(/^#{1,6}\s*/gm, '');
        text = text.replace(/[*_~>]/g, '');
        text = text.replace(/\s+/g, ' ').trim();
        return text;
    };

    // Подсветка искомых слов (безопасно: работаем с уже экранированным текстом)
    const highlight = (escapedText, terms) => {
        if (!terms) return escapedText;
        const words = String(terms).split(/\s+/).filter(w => w.length > 2);
        let out = escapedText;
        words.forEach(word => {
            const pattern = new RegExp(escapeHtml(word).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            out = out.replace(pattern, m => `<span class="mms-hit">${m}</span>`);
        });
        return out;
    };

    const setStatus = (text, color) => {
        dom.status.textContent = text || '';
        if (color) dom.status.style.color = color;
    };

    // ═══════════════════════════════════════════════════════
    // Вложения с полями (integration/webhook-посты)
    // ═══════════════════════════════════════════════════════
    // Интеграционные посты кладут контент не в message, а в attachments[]:
    //   { title, text, color, fields: [{ title, value, short }] }
    // Если показывать только message — виден лишь заголовок, поля теряются.
    const getAttachments = (post) => {
        if (!post) return [];
        const fromTop = post.attachments;
        const fromProps = post.props && post.props.attachments;
        const fromMeta = post.metadata && post.metadata.attachments;
        if (Array.isArray(fromTop)) return fromTop;
        if (Array.isArray(fromProps)) return fromProps;
        if (Array.isArray(fromMeta)) return fromMeta;
        return [];
    };

    const renderAttachments = (post, terms) => {
        const atts = getAttachments(post);
        if (!atts.length) return '';
        return atts.map((a) => {
            const borderColor = (a && a.color) ? escapeHtml(String(a.color)) : '';
            const title = (a && a.title)
                ? `<div class="mms-att-title">${escapeHtml(String(a.title)).slice(0, 400)}</div>`
                : '';
            const text = (a && a.text)
                ? `<div class="mms-att-text">${highlight(escapeHtml(String(a.text)).slice(0, 1200), terms)}</div>`
                : '';
            const fields = (a && Array.isArray(a.fields) && a.fields.length)
                ? `<div class="mms-att-fields">${a.fields.map((f) => {
                      const ft = (f && f.title) ? `<span class="mms-att-f-title">${escapeHtml(String(f.title))}</span>` : '';
                      let fv = '';
                      if (f && f.value !== undefined && f.value !== null) {
                          fv = `<span class="mms-att-f-value">${highlight(escapeHtml(String(f.value)).slice(0, 600), terms)}</span>`;
                      }
                      if (!ft && !fv) return '';
                      return `<div class="mms-att-field${f && f.short ? ' mms-att-field-short' : ''}">${ft}${fv}</div>`;
                  }).join('')}</div>`
                : '';
            if (!title && !text && !fields) return '';
            return `<div class="mms-att"${borderColor ? ' style="border-left-color:' + borderColor + ';"' : ''}>${title}${text}${fields}</div>`;
        }).join('');
    };

    // ═══════════════════════════════════════════════════════
    // Команды (teams)
    // ═══════════════════════════════════════════════════════
    const initTeams = async () => {
        try {
            const teams = await fetchTeams();
            dom.team.innerHTML = '';

            if (!teams.length) {
                dom.team.add(new Option('Команды не найдены', ''));
                setStatus('Команды не найдены', '#fbbf24');
                return;
            }

            teams.forEach(t => {
                const opt = new Option(t.display_name || t.name, t.id);
                opt.dataset.name = t.name; // slug для корректного пермалинка
                dom.team.add(opt);
            });

            // Дефолт: сохранённый выбор пользователя → команда Skyeng → первая
            let preferred = null;
            let savedId = null;
            try { savedId = localStorage.getItem('mms_team_id'); } catch (e) { /* ignore */ }
            if (savedId && teams.some(t => t.id === savedId)) {
                preferred = teams.find(t => t.id === savedId);
            }
            if (!preferred) preferred = teams.find(t => /skyeng/i.test((t.display_name || '') + ' ' + (t.name || '')));
            if (!preferred) preferred = teams[0];

            dom.team.value = preferred.id;
            teamId = preferred.id;
            teamName = preferred.name;
            teamsLoaded = true;
            setStatus(`Команда: ${preferred.display_name || preferred.name}`, '#a5b4fc');
        } catch (e) {
            dom.team.innerHTML = '<option value="">Не удалось загрузить команды</option>';
            const msg = e.message === AUTH_ERR
                ? 'Нужна авторизация в Mattermost'
                : 'Ошибка загрузки: ' + e.message;
            setStatus(msg, '#f87171');
            if (e.message === AUTH_ERR) {
                notify('🔐 Откройте https://mm-time.skyeng.tech, войдите — и повторите поиск', 'warning');
            }
        }
    };

    // ═══════════════════════════════════════════════════════
    // Рендер результатов
    // ═══════════════════════════════════════════════════════
    // Догрузка: добавляет посты очередной страницы, не дублируя уже показанные,
    // и подтягивает имена каналов/авторов для свежих постов.
    const mergeResults = async (res, terms) => {
        const posts = (res && res.posts) || {};
        const order = Array.isArray(res.order) ? res.order : Object.keys(posts);
        const rawPosts = order.map(id => posts[id]).filter(Boolean);

        const existingIds = new Set(currentResults.map(p => p.id));
        const fresh = rawPosts.filter(p => !existingIds.has(p.id));
        currentResults.push(...fresh);

        // «Есть ещё»: сервер прислал курсор следующей страницы, либо страница
        // заполнена целиком. На старых серверах, игнорирующих page/per_page,
        // следующая страница вернёт те же посты — кнопка сама скроется.
        hasMore = !!((res && res.next_post_id) || fresh.length === SEARCH_LIMIT);

        const channelIds = [...new Set(fresh.map(p => p.channel_id).filter(Boolean))];
        const userIds = [...new Set(fresh.map(p => p.user_id).filter(Boolean))];

        await Promise.all([
            Promise.all(channelIds.map(getChannel)),
            Promise.all(userIds.map(id => getUsers([id])))
        ]);
    };

    const drawResults = (terms) => {
        const filter = dom.channelFilter.value.trim().toLowerCase();
        const list = currentResults.filter(p => {
            if (!filter) return true;
            const ch = cache.channels[p.channel_id];
            return ch && (ch.displayName || '').toLowerCase().includes(filter);
        });

        dom.results.innerHTML = '';

        if (!list.length) {
            dom.results.innerHTML = '<div class="mms-empty">Ничего не найдено' + (filter ? ' по этому фильтру' : '') + '.</div>';
            setStatus(`Найдено: 0`, '#f87171');
            return;
        }

        list.forEach((post, idx) => {
            const ch = cache.channels[post.channel_id] || { displayName: post.channel_id };
            const author = cache.users[post.user_id] || post.user_id || '—';
            const date = new Date(post.create_at).toLocaleString('ru-RU');
            const preview = highlight(escapeHtml(previewOf(post.message)), terms).slice(0, 900);
            const attachmentsHtml = renderAttachments(post, terms);
            const permalink = `${MM_ORIGIN}/${teamName}/pl/${post.id}`;

            const item = document.createElement('div');
            item.className = 'mms-item';
            item.innerHTML = `
                <div class="mms-item-head">
                    <span class="mms-channel"># ${escapeHtml(ch.displayName)}</span>
                    <span class="mms-author">${escapeHtml(author)}</span>
                    <span class="mms-time">${escapeHtml(date)}</span>
                </div>
                <div class="mms-msg">${preview || (attachmentsHtml ? '' : '<i>пустое сообщение</i>')}</div>
                ${attachmentsHtml}
                <div class="mms-actions">
                    <button class="mms-act-btn" data-action="open" title="Открыть в Mattermost">🔗 Открыть</button>
                    <button class="mms-act-btn" data-action="copy" title="Скопировать ссылку на сообщение">📋 Копировать</button>
                </div>
            `;

            item.querySelector('[data-action="open"]').onclick = () => window.open(permalink, '_blank');
            item.querySelector('[data-action="copy"]').onclick = () => {
                const copyText = (t) => (typeof copyToClipboard === 'function')
                    ? copyToClipboard(t)
                    : (navigator.clipboard && navigator.clipboard.writeText
                        ? navigator.clipboard.writeText(t)
                        : Promise.reject(new Error('clipboard недоступен')));
                copyText(permalink)
                    .then(() => notify('Ссылка скопирована 💾', 'message'))
                    .catch(() => notify('Не удалось скопировать', 'error'));
            };

            dom.results.appendChild(item);
        });

        // Кнопка догрузки — если сервер поддерживает пагинацию
        if (hasMore && currentResults.length) {
            const moreBtn = document.createElement('button');
            moreBtn.id = 'mms-more';
            moreBtn.className = 'mms-btn mms-btn-primary';
            moreBtn.style.cssText = 'width:100%;margin-top:10px;';
            moreBtn.textContent = '📥 Показать ещё';
            moreBtn.onclick = loadMore;
            dom.results.appendChild(moreBtn);
        }

        setStatus(filter
            ? `Найдено: ${list.length} (из ${currentResults.length})`
            : `Найдено: ${currentResults.length}`, '#86efac');
    };

    // ═══════════════════════════════════════════════════════
    // Поиск
    // ═══════════════════════════════════════════════════════
    const runSearch = async () => {
        const terms = dom.query.value.trim();
        if (!terms) {
            setStatus('Введите запрос', '#fbbf24');
            notify('Введите текст для поиска', 'warning');
            return;
        }
        if (!teamId) {
            setStatus('Команда не выбрана', '#f87171');
            return;
        }

        // Новый поиск — сбрасываем накопленные страницы
        currentResults = [];
        searchTerms = terms;
        searchPage = 0;
        hasMore = false;

        dom.searchBtn.disabled = true;
        dom.results.innerHTML = '<div class="mms-loading"><div class="mms-spinner"></div>Поиск по Mattermost...</div>';

        try {
            const res = await searchPosts(teamId, terms, searchPage);
            await mergeResults(res, terms);
            drawResults(terms);
        } catch (e) {
            if (e.message === AUTH_ERR) {
                setStatus('Нужна авторизация в Mattermost', '#f87171');
                notify('🔐 Откройте https://mm-time.skyeng.tech, войдите — и повторите поиск', 'warning');
            } else {
                setStatus('Ошибка: ' + e.message, '#f87171');
                notify('Ошибка поиска в Mattermost: ' + e.message, 'error');
            }
            dom.results.innerHTML = '<div class="mms-empty">Поиск не удался. Проверьте консоль (F12) для деталей.</div>';
        } finally {
            dom.searchBtn.disabled = false;
        }
    };

    // Догрузка следующей страницы результатов (кнопка «Показать ещё»)
    const loadMore = async () => {
        if (!teamId || !searchTerms) return;
        const btn = document.getElementById('mms-more');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Загрузка...';
        }
        try {
            searchPage += 1;
            const res = await searchPosts(teamId, searchTerms, searchPage);
            await mergeResults(res, searchTerms);
            drawResults(searchTerms);
        } catch (e) {
            notify(e.message === AUTH_ERR ? 'Нужна авторизация в Mattermost' : 'Ошибка догрузки: ' + e.message, 'error');
        }
    };

    // ═══════════════════════════════════════════════════════
    // Инициализация окна
    // ═══════════════════════════════════════════════════════
    const init = () => {
        // isolated world забирает окно у main-world инжекта (если то пережило
        // перезагрузку расширения), чтобы работали drag/copy из utils.js.
        const existing = document.getElementById(WINDOW_ID);
        if (existing) {
            if (!IS_MAIN_WORLD && existing.dataset && existing.dataset.mmsWorld === 'main') {
                existing.remove();
            } else {
                return;
            }
        }

        const style = document.createElement('style');
        style.id = 'mms-styles';
        style.textContent = MMS_STYLES;
        document.head.appendChild(style);

        if (typeof createWindow === 'function') {
            createWindow(WINDOW_ID, 'winTopMMS', 'winLeftMMS', win_MMS);
        } else {
            const div = document.createElement('div');
            div.id = WINDOW_ID;
            div.innerHTML = win_MMS;
            div.style.cssText = 'position:fixed;top:15%;left:30%;z-index:1000001;display:none;';
            document.body.appendChild(div);
            // main world: chrome.runtime и createWindow недоступны — свой мини-drag
            const header = div.querySelector('.mms-header');
            if (header) {
                header.ondblclick = (a) => { if (a.target.closest('.mms-header')) div.style.display = 'none'; };
                let dragging = false, ox = 0, oy = 0;
                header.addEventListener('mousedown', (e) => {
                    if (e.button !== 0 || e.target.closest('button')) return;
                    dragging = true;
                    ox = e.clientX - div.getBoundingClientRect().left;
                    oy = e.clientY - div.getBoundingClientRect().top;
                    e.preventDefault();
                });
                document.addEventListener('mousemove', (e) => {
                    if (!dragging) return;
                    div.style.left = (e.clientX - ox) + 'px';
                    div.style.top = (e.clientY - oy) + 'px';
                    div.style.right = 'auto';
                });
                document.addEventListener('mouseup', () => { dragging = false; });
            }
        }

        dom.win = document.getElementById(WINDOW_ID);
        dom.win.dataset.mmsWorld = IS_MAIN_WORLD ? 'main' : 'isolated';
        dom.team = document.getElementById('mms-team');
        dom.query = document.getElementById('mms-query');
        dom.channelFilter = document.getElementById('mms-channel-filter');
        dom.status = document.getElementById('mms-status');
        dom.results = document.getElementById('mms-results');
        dom.searchBtn = document.getElementById('mms-search');

        dom.win.style.display = 'none';

        if (typeof hideWindowOnDoubleClick === 'function') hideWindowOnDoubleClick(WINDOW_ID);

        document.getElementById('mms-hide').onclick = () => { dom.win.style.display = 'none'; };
        document.getElementById('mms-clear').onclick = () => {
            dom.query.value = '';
            dom.channelFilter.value = '';
            currentResults = [];
            searchTerms = '';
            searchPage = 0;
            hasMore = false;
            dom.results.innerHTML = '<div class="mms-empty">Введите запрос и нажмите «Найти».<br>Результаты появятся здесь.</div>';
            setStatus('');
        };

        dom.searchBtn.onclick = runSearch;
        dom.query.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });
        dom.channelFilter.addEventListener('input', () => drawResults(dom.query.value.trim()));

        dom.team.addEventListener('change', () => {
            const opt = dom.team.options[dom.team.selectedIndex];
            teamId = opt.value;
            teamName = opt.dataset.name || teamName; // slug команды, не display-name
            setStatus(`Команда: ${opt.textContent.trim()}`, '#a5b4fc');
            try { localStorage.setItem('mms_team_id', opt.value); } catch (e) { /* ignore */ }
        });

        // Публичная кнопка: вызывается из меню расширения (utils.js → menuConfig)
        window.getMattermostSearchPress = () => {
            const hidden = dom.win.style.display === 'none';
            dom.win.style.display = hidden ? 'block' : 'none';

            // Закрываем меню, чтобы окно не перекрывалось
            const menu = document.getElementById('idmymenu');
            if (menu && hidden) menu.style.display = 'none';
            const mainBtn = document.getElementById('MainMenuBtn');
            if (mainBtn && hidden) mainBtn.classList.remove('active');

            if (hidden && !teamsLoaded) initTeams();
        };

        // Мост для main world: utils.js (isolated) не видит window-функцию
        // главного мира, поэтому открывает/закрывает окно через postMessage.
        window.addEventListener('message', (e) => {
            const d = e.data;
            if (d && d.source === 'chmaf-mms' && d.action === 'toggle') {
                const hidden = dom.win.style.display === 'none';
                dom.win.style.display = hidden ? 'block' : 'none';
                if (hidden && !teamsLoaded) initTeams();
            }
        });
    };

    // Запуск: ждём готовности DOM (document_idle гарантирует, но подстрахуемся).
    // Оборачиваем в try/catch, чтобы любая ошибка инициализации была видна
    // (и в консоли, и тостом), а не превращалась в «молчаливо не работает».
    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
        console.info('[ChMAF] MattermostSearch загружен, press-функция: ' + (typeof window.getMattermostSearchPress));
    } catch (err) {
        const msg = (err && err.message) || String(err);
        console.error('[ChMAF] Ошибка инициализации MattermostSearch:', err);
        if (typeof showCustomAlert === 'function') {
            showCustomAlert('⚠️ Ошибка инициализации Mattermost: ' + msg, 'error');
        }
    }
})();