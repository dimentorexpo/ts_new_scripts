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
	
	// Пункт 1: загрузка всего треда по корневому посту
const getThread = async (rootId) => {
    return await mmRequest(`/api/v4/posts/${rootId}/thread`, { method: 'GET' });
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
        .mms-results { margin-top: 12px; max-height: 580px; overflow-y: auto; padding-right: 6px; }
        .mms-results::-webkit-scrollbar { width: 5px; }
        .mms-results::-webkit-scrollbar-track { background: transparent; }
        .mms-results::-webkit-scrollbar-thumb { background: rgba(93, 118, 255, 0.25); border-radius: 10px; }
        .mms-empty { text-align: center; padding: 26px 16px; opacity: 0.45; font-size: 12px; letter-spacing: 0.3px; }
.mms-item {
    background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.06);
    border-left: 3px solid rgba(93, 118, 255, 0.7);
    padding: 12px 14px; margin-bottom: 9px; border-radius: 11px;
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
        .mms-author { font-size: 13px; font-weight: 600; color: #c7d2fe; }
        .mms-time { font-size: 10px; opacity: 0.5; font-family: 'SF Mono', monospace; }
        .mms-msg { font-size: 14.5px; line-height: 1.55; color: #e8ecf4; word-break: break-word; white-space: pre-wrap; }
        .mms-att {
            margin-top: 8px; padding: 9px 11px;
            background: rgba(0, 0, 0, 0.28);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-left: 3px solid rgba(93, 118, 255, 0.65);
            border-radius: 9px;
        }
        .mms-att-title { font-weight: 700; color: #c7d2fe; font-size: 14px; margin-bottom: 3px; word-break: break-word; }
        .mms-att-text { font-size: 13.5px; line-height: 1.5; color: #d7deea; white-space: pre-wrap; word-break: break-word; margin-top: 3px; }
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
		
		/* ═══ Группировка по каналам (п.3) ═══ */
.mms-group { margin-bottom: 10px; }
.mms-group-head {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px; cursor: pointer; user-select: none;
    background: rgba(93, 118, 255, 0.08);
    border: 1px solid rgba(93, 118, 255, 0.15);
    border-radius: 10px; margin-bottom: 6px;
    transition: background 0.2s;
    font-size: 13px;
}
.mms-group-head:hover { background: rgba(93, 118, 255, 0.15); }
.mms-group-arrow { font-size: 10px; transition: transform 0.2s; opacity: 0.6; }
.mms-group.mms-collapsed .mms-group-arrow { transform: rotate(-90deg); }
.mms-group.mms-collapsed .mms-group-body { display: none; }
.mms-group-cnt {
    margin-left: auto; font-size: 10px; font-weight: 700;
    background: rgba(93, 118, 255, 0.25); color: #c7d2fe;
    padding: 1px 7px; border-radius: 10px;
}
/* ═══ Панель каналов-чипсов (п.4 — мультивыбор) ═══ */
.mms-channel-bar {
    display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
    margin-top: 10px; padding: 8px 10px;
    background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
}
.mms-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 9px; border-radius: 20px; cursor: pointer;
    font-size: 11px; font-weight: 600;
    background: rgba(93, 118, 255, 0.18); border: 1px solid rgba(93, 118, 255, 0.35);
    color: #c7d2fe; transition: all 0.18s; user-select: none;
}
.mms-chip:hover { background: rgba(93, 118, 255, 0.3); }
.mms-chip-off { opacity: 0.4; background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: #94a3b8; }
.mms-chip-name { max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mms-chip-cnt { font-size: 10px; opacity: 0.7; }
.mms-chip-reset {
    background: none; border: none; color: #a5b4fc; cursor: pointer;
    font-size: 11px; text-decoration: underline; padding: 2px 6px;
}
/* ═══ Файлы и картинки (п.2) ═══ */
.mms-files { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.mms-file-img {
    position: relative; display: inline-block; max-width: 180px;
    border-radius: 9px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);
    transition: transform 0.2s; text-decoration: none;
}
.mms-file-img:hover { transform: scale(1.02); border-color: rgba(93,118,255,0.5); }
.mms-file-img img { display: block; max-width: 100%; max-height: 140px; object-fit: cover; }
.mms-file-name {
    display: block; font-size: 10px; color: #aab3c5; padding: 3px 6px;
    background: rgba(0,0,0,0.4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.mms-file-broken img { display: none; }
.mms-file-broken::before { content: '🖼 '; font-size: 18px; display: block; padding: 8px; }
.mms-file-link {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 11px; border-radius: 9px; font-size: 12px;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    color: #c7d2fe; text-decoration: none; max-width: 220px;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.mms-file-link:hover { background: rgba(93,118,255,0.15); border-color: rgba(93,118,255,0.4); }
/* ═══ Тред (п.1) ═══ */
.mms-thread-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.mms-thread-info { font-size: 12px; color: #a5b4fc; font-weight: 600; }
.mms-item-root { border-left-color: #fbbf24; background: rgba(251, 191, 36, 0.06); }
.mms-root-badge {
    font-size: 9px; font-weight: 800; letter-spacing: 1px;
    background: rgba(251, 191, 36, 0.2); color: #fcd34d;
    padding: 2px 7px; border-radius: 6px; border: 1px solid rgba(251,191,36,0.35);
}

/* ChMAF / Mattermost — corporate refinement.
   Все правила ограничены окном модуля. */

#AF_Mattermost .mms-panel {
    box-sizing: border-box;
    width: min(740px, calc(100vw - 24px)) !important;
    max-width: 100%;
    background:
        radial-gradient(
            circle at 92% 0%,
            rgba(102, 144, 255, .13),
            transparent 38%
        ),
        #111827 !important;
    border: 1px solid #344158 !important;
    border-top: 3px solid #7395f5 !important;
    border-radius: 18px !important;
    color: #edf2fb;
    box-shadow:
        0 26px 72px rgba(4, 10, 23, .52),
        inset 0 1px rgba(255, 255, 255, .06) !important;
}

#AF_Mattermost .mms-panel,
#AF_Mattermost .mms-panel * {
    box-sizing: border-box;
}

#AF_Mattermost .mms-header {
    gap: 12px;
    padding-bottom: 13px;
    border-bottom: 1px solid #303d52;
}

#AF_Mattermost .mms-title {
    font-size: 14px;
    letter-spacing: -.01em;
}

#AF_Mattermost .mms-subtitle {
    color: #91a1ba;
}

#AF_Mattermost .mms-icon {
    color: #edf3ff;
    background: linear-gradient(145deg, #344a7c, #514879);
    border-color: #647ab3;
    box-shadow: 0 5px 16px rgba(47, 76, 152, .22);
}

#AF_Mattermost .mms-btn,
#AF_Mattermost .mms-act-btn {
    color: #d7e1f2;
    background: #1c2739;
    border: 1px solid #384963;
    box-shadow: none;
}

#AF_Mattermost .mms-btn:hover:not(:disabled),
#AF_Mattermost .mms-act-btn:hover {
    color: #fff;
    background: #293a54;
    border-color: #7797da;
    box-shadow: none;
}

#AF_Mattermost .mms-btn-primary {
    color: #fff;
    background: #5079df;
    border-color: #789af0;
    box-shadow: 0 5px 17px rgba(59, 102, 213, .21);
}

#AF_Mattermost .mms-btn-primary:hover:not(:disabled) {
    background: #638bf0;
    border-color: #a0b7f6;
}

#AF_Mattermost .mms-btn-danger {
    color: #ffb4c0;
    background: rgba(255, 113, 137, .08);
    border-color: rgba(255, 113, 137, .27);
}

#AF_Mattermost .mms-input {
    min-width: 0;
    color: #f1f5fc;
    background: #0d1625;
    border-color: #3a4960;
}

#AF_Mattermost .mms-input:focus {
    background: #111c2e;
    border-color: #7b9bfa;
    box-shadow: 0 0 0 3px rgba(102, 144, 255, .16);
}

#AF_Mattermost .mms-input::placeholder {
    color: #8392a8;
}

#AF_Mattermost select.mms-input option {
    color: #f1f5fc;
    background: #182335;
}

#AF_Mattermost .mms-results {
    scrollbar-width: thin;
    scrollbar-color: #526789 transparent;
}

#AF_Mattermost .mms-item {
    background: #1a2536;
    border: 1px solid #344258;
    border-left: 3px solid #6f91dd;
    box-shadow: none;
}

#AF_Mattermost .mms-item:hover {
    background: #223149;
    border-color: #6483bb;
    border-left-color: #89a8ff;
    transform: translateX(2px);
}

#AF_Mattermost .mms-item-root {
    background: #222642;
    border-left-color: #a58ff3;
}

#AF_Mattermost .mms-root-badge {
    color: #dacfff;
    background: rgba(165, 143, 243, .15);
    border-color: rgba(165, 143, 243, .42);
}

#AF_Mattermost .mms-channel,
#AF_Mattermost .mms-group-cnt {
    color: #c5d5ff;
    background: rgba(108, 145, 234, .14);
    border-color: rgba(108, 145, 234, .36);
}

#AF_Mattermost .mms-author,
#AF_Mattermost .mms-thread-info,
#AF_Mattermost .mms-att-title,
#AF_Mattermost .mms-file-link {
    color: #c4d4ff;
}

#AF_Mattermost .mms-msg,
#AF_Mattermost .mms-att-text {
    color: #e6edf8;
}

#AF_Mattermost .mms-att {
    background: #121d2d;
    border-color: #35445c;
    border-left-color: #7698ec;
}

#AF_Mattermost .mms-group-head,
#AF_Mattermost .mms-channel-bar {
    background: #182438;
    border-color: #35455f;
}

#AF_Mattermost .mms-group-head:hover {
    background: #23334d;
}

#AF_Mattermost .mms-chip {
    color: #d2defb;
    background: #293b60;
    border-color: #526fa6;
}

#AF_Mattermost .mms-chip-off {
    color: #a0aec3;
    background: #1c2738;
    border-color: #39475a;
}

#AF_Mattermost .mms-chip-reset {
    color: #b7c9ff;
}

#AF_Mattermost .mms-hit {
    color: #f0eaff;
    background: rgba(157, 123, 233, .38);
}

#AF_Mattermost .mms-spinner {
    border-color: rgba(115, 149, 245, .22);
    border-top-color: #8faaff;
}

#AF_Mattermost .mms-btn:focus-visible,
#AF_Mattermost .mms-act-btn:focus-visible,
#AF_Mattermost .mms-input:focus-visible,
#AF_Mattermost .mms-chip-reset:focus-visible {
    outline: 2px solid #93afff;
    outline-offset: 2px;
}

@media (max-width: 650px) {
    #AF_Mattermost .mms-search-row:first-of-type {
        flex-wrap: wrap;
    }

    #AF_Mattermost #mms-team {
        width: 100% !important;
    }

    #AF_Mattermost #mms-query {
        flex: 1 1 180px !important;
    }
}

@media (prefers-reduced-motion: reduce) {
    #AF_Mattermost .mms-panel *,
    #AF_Mattermost .mms-panel *::before,
    #AF_Mattermost .mms-panel *::after {
        transition-duration: .01ms !important;
        animation-duration: .01ms !important;
    }
}
    `;

    // ═══════════════════════════════════════════════════════
    // Разметка окна
    // ═══════════════════════════════════════════════════════
    const win_MMS = `
        <div class="mms-panel" style="width: 740px;">
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
    <span class="mms-status" id="mms-status"></span>
</div>
<div class="mms-channel-bar" id="mms-channel-bar" style="display:none;"></div>

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
	let viewVersion = 0;
    let loadingMore = false;
	let hiddenChannels = new Set();   // каналы, скрытые фильтром-чипсами (п.3/4)

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
	
	// ═══ Пункт 2: превью файлов и картинок ═══
// Картинки рендерим через <img> напрямую — для тегов <img> CORS не применяется,
// браузер сам шлёт cookie на домен картинки. Если сервер отдаёт cookie с
// SameSite=Strict, картинка может не загрузиться — тогда сработает onerror
// и блок изящно деградирует в кликабельную ссылку (файл всё равно доступен).
const renderFiles = (post) => {
    let files = (post.metadata && Array.isArray(post.metadata.files)) ? post.metadata.files : [];
    if (!files.length && Array.isArray(post.file_ids) && post.file_ids.length) {
        files = post.file_ids.map(id => ({ id, name: 'файл', extension: '' }));
    }
    if (!files.length) return '';
    return '<div class="mms-files">' + files.map(f => {
        const url = `${MM_ORIGIN}/api/v4/files/${f.id}`;
        const ext = String(f.extension || '').toLowerCase();
        const isImage = /^(png|jpe?g|gif|webp|svg|bmp|ico)$/.test(ext)
            || /^image\//.test(f.mime_type || '');
        if (isImage) {
            return `<a class="mms-file-img" href="${url}" target="_blank" title="${escapeHtml(f.name || '')}">
                <img src="${url}" loading="lazy" alt="${escapeHtml(f.name || 'image')}"
                     onerror="this.closest('.mms-file-img').classList.add('mms-file-broken');">
                <span class="mms-file-name">${escapeHtml(f.name || '')}</span>
            </a>`;
        }
        return `<a class="mms-file-link" href="${url}" target="_blank" title="${escapeHtml(f.name || '')}">📎 ${escapeHtml(f.name || f.id)}</a>`;
    }).join('') + '</div>';
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


// ═══ Универсальный рендер одного поста (используется и в результатах, и в треде) ═══
const renderPostItem = (post, terms, opts = {}) => {
    const { isThreadRoot = false, showThreadButton = true } = opts;
    const ch = cache.channels[post.channel_id] || { displayName: post.channel_id };
    const author = cache.users[post.user_id] || post.user_id || '—';
    const date = new Date(post.create_at).toLocaleString('ru-RU');
    const preview = highlight(escapeHtml(previewOf(post.message)), terms).slice(0, 900);
    const attachmentsHtml = renderAttachments(post, terms);
    const filesHtml = renderFiles(post);
    const permalink = `${MM_ORIGIN}/${teamName}/pl/${post.id}`;
    // Пункт 1: кнопка треда — если пост является ответом (есть root_id)
    // либо корневой пост с ответами (если сервер вернул reply_count)
    const inThread = !!post.root_id;
    const hasReplies = (post.reply_count || 0) > 0;
    const threadBtnHtml = (showThreadButton && (inThread || hasReplies))
        ? `<button class="mms-act-btn" data-action="thread" title="Показать весь тред">🧵 Тред${hasReplies && !inThread ? ' (' + post.reply_count + ')' : ''}</button>`
        : '';
    const item = document.createElement('div');
    item.className = 'mms-item' + (isThreadRoot ? ' mms-item-root' : '');
    item.innerHTML = `
        <div class="mms-item-head">
            ${isThreadRoot ? '<span class="mms-root-badge">НАЧАЛО ТРЕДА</span>' : ''}
            <span class="mms-channel"># ${escapeHtml(ch.displayName)}</span>
            <span class="mms-author">${escapeHtml(author)}</span>
            <span class="mms-time">${escapeHtml(date)}</span>
        </div>
        <div class="mms-msg">${preview || ((attachmentsHtml || filesHtml) ? '' : '<i>пустое сообщение</i>')}</div>
        ${filesHtml}
        ${attachmentsHtml}
        <div class="mms-actions">
            <button class="mms-act-btn" data-action="open" title="Открыть в Mattermost">🔗 Открыть</button>
            <button class="mms-act-btn" data-action="copy" title="Скопировать ссылку на сообщение">📋 Копировать</button>
            ${threadBtnHtml}
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
    const threadBtn = item.querySelector('[data-action="thread"]');
    if (threadBtn) threadBtn.onclick = () => openThread(post);
    return item;
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
    getUsers(userIds)
]);
    };

const drawResults = (terms) => {
    const list = currentResults.filter(p => !hiddenChannels.has(p.channel_id));
	dom.results.innerHTML = '';
    if (!currentResults.length) {
        dom.results.innerHTML = '<div class="mms-empty">Ничего не найдено.</div>';
        setStatus('Найдено: 0', '#f87171');
        return;
    }
    if (!list.length) {
        dom.results.innerHTML = '<div class="mms-empty">Все каналы скрыты фильтром. Нажмите «показать все».</div>';
        setStatus(`Найдено: ${currentResults.length} (все скрыты)`, '#fbbf24');
        return;
    }
    // Пункт 3: группировка постов по каналам
    const groups = new Map();
    list.forEach(p => {
        const id = p.channel_id || '_unknown';
        if (!groups.has(id)) groups.set(id, []);
        groups.get(id).push(p);
    });
    const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
    sorted.forEach(([chId, posts]) => {
        const ch = cache.channels[chId] || { displayName: chId };
        const groupEl = document.createElement('div');
        groupEl.className = 'mms-group';
        const head = document.createElement('div');
        head.className = 'mms-group-head';
        head.innerHTML = `<span class="mms-group-arrow">▾</span>
            <span class="mms-channel"># ${escapeHtml(ch.displayName)}</span>
            <span class="mms-group-cnt">${posts.length}</span>`;
        head.onclick = () => groupEl.classList.toggle('mms-collapsed');
        const body = document.createElement('div');
        body.className = 'mms-group-body';
        posts.forEach(post => body.appendChild(renderPostItem(post, terms)));
        groupEl.appendChild(head);
        groupEl.appendChild(body);
        dom.results.appendChild(groupEl);
    });
    // Кнопка догрузки
    if (hasMore && currentResults.length) {
        const moreBtn = document.createElement('button');
        moreBtn.id = 'mms-more';
        moreBtn.className = 'mms-btn mms-btn-primary';
        moreBtn.style.cssText = 'width:100%;margin-top:10px;';
        moreBtn.textContent = '📥 Показать ещё';
        moreBtn.onclick = loadMore;
        dom.results.appendChild(moreBtn);
    }
    const hiddenCnt = currentResults.length - list.length;
    setStatus(hiddenCnt > 0
        ? `Найдено: ${list.length} (показано) из ${currentResults.length}`
        : `Найдено: ${currentResults.length}`, '#86efac');
};
    
	// ═══ Пункт 4: автоматический список каналов из результатов с мультивыбором ═══
// Каждый чипс = канал + счётчик найденных. Клик тогглит видимость канала.
// Заменяет текстовый фильтр: оператор видит ВСЕ каналы, где есть совпадения,
// и кликом выбирает комбинацию для просмотра.
const drawChannelBar = () => {
    const counts = new Map();
    currentResults.forEach(p => {
        if (p.channel_id) counts.set(p.channel_id, (counts.get(p.channel_id) || 0) + 1);
    });
    // Один канал — панель не нужна, экономим место
    if (counts.size <= 1) {
        dom.channelBar.style.display = 'none';
        dom.channelBar.innerHTML = '';
        return;
    }
    dom.channelBar.style.display = 'flex';
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    dom.channelBar.innerHTML = entries.map(([id, cnt]) => {
        const ch = cache.channels[id] || { displayName: id };
        const off = hiddenChannels.has(id);
        return `<span class="mms-chip${off ? ' mms-chip-off' : ''}" data-ch="${id}" title="Показать/скрыть канал">
            <span class="mms-chip-name"># ${escapeHtml(ch.displayName)}</span>
            <span class="mms-chip-cnt">${cnt}</span>
        </span>`;
    }).join('') + (hiddenChannels.size ? '<button class="mms-chip-reset" id="mms-chip-reset">показать все</button>' : '');
    dom.channelBar.querySelectorAll('.mms-chip').forEach(chip => {
        chip.onclick = () => {
            const id = chip.dataset.ch;
            if (hiddenChannels.has(id)) hiddenChannels.delete(id); else hiddenChannels.add(id);
            drawChannelBar();
            drawResults(searchTerms);
        };
    });
    const reset = dom.channelBar.querySelector('#mms-chip-reset');
    if (reset) reset.onclick = () => {
        hiddenChannels.clear();
        drawChannelBar();
        drawResults(searchTerms);
    };
};
	
// ═══ Пункт 1: просмотр всего треда ═══
const openThread = async (post) => {
    const rootId = post.root_id || post.id;
	const version = ++viewVersion;
    dom.channelBar.style.display = 'none';
    dom.results.innerHTML = '<div class="mms-loading"><div class="mms-spinner"></div>Загрузка треда...</div>';
    try {
        const res = await getThread(rootId);
		if (version !== viewVersion) return;
        const posts = (res && res.posts) || {};
        const order = Array.isArray(res.order) ? res.order : Object.keys(posts);
        const threadPosts = order.map(id => posts[id]).filter(Boolean)
            .sort((a, b) => (a.create_at || 0) - (b.create_at || 0));
        // Подтягиваем имена авторов и каналов для постов треда
        const userIds = [...new Set(threadPosts.map(p => p.user_id).filter(Boolean))];
        const channelIds = [...new Set(threadPosts.map(p => p.channel_id).filter(Boolean))];
        await Promise.all([
            Promise.all(channelIds.map(getChannel)),
            getUsers(userIds)
        ]);
		if (version !== viewVersion) return;
        dom.results.innerHTML = '';
        // Шапка треда с кнопкой возврата
        const bar = document.createElement('div');
        bar.className = 'mms-thread-bar';
        bar.innerHTML = `<button class="mms-btn" id="mms-thread-back">← К результатам</button>
            <span class="mms-thread-info">🧵 Тред · ${threadPosts.length} сообщ.</span>`;
        dom.results.appendChild(bar);
        bar.querySelector('#mms-thread-back').onclick = closeThread;
        threadPosts.forEach(p => {
            dom.results.appendChild(renderPostItem(p, searchTerms, {
                isThreadRoot: p.id === rootId,
                showThreadButton: false   // из треда в тред не уходим
            }));
        });
    } catch (e) {
	if (version !== viewVersion) return;
        dom.results.innerHTML = '<div class="mms-empty">Не удалось загрузить тред.</div>';
        notify(e.message === AUTH_ERR ? 'Нужна авторизация в Mattermost' : 'Ошибка треда: ' + e.message, 'error');
        drawChannelBar();
        drawResults(searchTerms);
    }
};
const closeThread = () => {
    ++viewVersion;
    drawChannelBar();
    drawResults(searchTerms);
};
	// ═══════════════════════════════════════════════════════
    // Поиск
    // ═══════════════════════════════════════════════════════
const runSearch = async () => {
    const terms = dom.query.value.trim();

    if (!terms) {
        setStatus('Введите запрос', '#9db5ff');
        notify('Введите текст для поиска', 'warning');
        return;
    }

    if (!teamId) {
        setStatus('Команда не выбрана', '#ff8496');
        return;
    }

    const version = ++viewVersion;
    const requestedTeamId = teamId;

    currentResults = [];
    searchTerms = terms;
    searchPage = 0;
    hasMore = false;
    loadingMore = false;
    hiddenChannels.clear();

    dom.channelBar.style.display = 'none';
    dom.channelBar.innerHTML = '';
    dom.searchBtn.disabled = true;
    dom.results.innerHTML =
        '<div class="mms-loading"><div class="mms-spinner"></div>Поиск по Mattermost...</div>';

    try {
        const res = await searchPosts(requestedTeamId, terms, 0);

        if (version !== viewVersion) return;

        await mergeResults(res, terms);

        if (version !== viewVersion) return;

        drawChannelBar();
        drawResults(terms);
    } catch (e) {
        if (version !== viewVersion) return;

        if (e.message === AUTH_ERR) {
            setStatus('Нужна авторизация в Mattermost', '#ff8496');
            notify(
                '🔐 Откройте https://mm-time.skyeng.tech, войдите — и повторите поиск',
                'warning'
            );
        } else {
            setStatus('Ошибка: ' + e.message, '#ff8496');
            notify('Ошибка поиска в Mattermost: ' + e.message, 'error');
        }

        dom.results.innerHTML =
            '<div class="mms-empty">Поиск не удался. Попробуйте ещё раз.</div>';
    } finally {
        if (version === viewVersion) {
            dom.searchBtn.disabled = false;
        }
    }
};

    // Догрузка следующей страницы результатов (кнопка «Показать ещё»)
const loadMore = async () => {
    if (!teamId || !searchTerms || !hasMore || loadingMore) return;

    const version = viewVersion;
    const requestedTeamId = teamId;
    const requestedTerms = searchTerms;
    const nextPage = searchPage + 1;

    loadingMore = true;

    const btn = dom.results.querySelector('#mms-more');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Загрузка...';
    }

    try {
        const res = await searchPosts(
            requestedTeamId,
            requestedTerms,
            nextPage
        );

        if (version !== viewVersion) return;

        await mergeResults(res, requestedTerms);

        if (version !== viewVersion) return;

        // Страницу подтверждаем только после успешного получения ответа.
        searchPage = nextPage;

        drawChannelBar();
        drawResults(requestedTerms);
    } catch (e) {
        if (version !== viewVersion) return;

        notify(
            e.message === AUTH_ERR
                ? 'Нужна авторизация в Mattermost'
                : 'Ошибка догрузки: ' + e.message,
            'error'
        );

        // Старую кнопку оставляем доступной для повторной попытки.
        if (btn?.isConnected) {
            btn.disabled = false;
            btn.textContent = '📥 Повторить загрузку';
        }
    } finally {
        loadingMore = false;
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
        dom.status = document.getElementById('mms-status');
        dom.results = document.getElementById('mms-results');
		dom.channelBar = document.getElementById('mms-channel-bar');
        dom.searchBtn = document.getElementById('mms-search');

        dom.win.style.display = 'none';

        if (typeof hideWindowOnDoubleClick === 'function') hideWindowOnDoubleClick(WINDOW_ID);

        document.getElementById('mms-hide').onclick = () => { dom.win.style.display = 'none'; };
        document.getElementById('mms-clear').onclick = () => {
		++viewVersion;
loadingMore = false;
dom.searchBtn.disabled = false;
dom.channelBar.style.display = 'none';
dom.channelBar.innerHTML = '';
dom.query.value = '';
hiddenChannels.clear();
            currentResults = [];
            searchTerms = '';
            searchPage = 0;
            hasMore = false;
            dom.results.innerHTML = '<div class="mms-empty">Введите запрос и нажмите «Найти».<br>Результаты появятся здесь.</div>';
            setStatus('');
        };

        dom.searchBtn.onclick = runSearch;
        dom.query.addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(); });
        
dom.team.addEventListener('change', () => {
    const opt = dom.team.options[dom.team.selectedIndex];

    ++viewVersion;
    loadingMore = false;
    dom.searchBtn.disabled = false;

    teamId = opt.value;
    teamName = opt.dataset.name || '';

    currentResults = [];
    searchTerms = '';
    searchPage = 0;
    hasMore = false;
    hiddenChannels.clear();

    dom.channelBar.style.display = 'none';
    dom.channelBar.innerHTML = '';

    dom.results.innerHTML =
        '<div class="mms-empty">Команда изменена. Выполните поиск, чтобы увидеть её сообщения.</div>';

    setStatus(`Команда: ${opt.textContent.trim()}`, '#a9bbef');

    try {
        localStorage.setItem('mms_team_id', opt.value);
    } catch (e) {
        /* localStorage недоступен — выбор всё равно работает */
    }
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