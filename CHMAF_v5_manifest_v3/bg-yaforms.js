/* =========================================================
   TSM ▸ background: отправка компенсаций в Яндекс Формы
   Подключение в background.js (service worker):
     обычный воркер:      importScripts("bg-yaforms.js");
     "type": "module":    import "./bg-yaforms.js";
   ========================================================= */

const YAF_ORIGIN = "https://forms.yandex.ru";
const YAF_SUBMIT_URL = `${YAF_ORIGIN}/cloud/gateway/root/form/postSurvey`;
const YAF_TOKEN_TTL = 10 * 60 * 1000;
const yafCache = { surveyId: null, token: null, at: 0, options: null };

function yafFormUrl(surveyId) {
    return `${YAF_ORIGIN}/cloud/${surveyId}/?page=1`;
}

/* Запросы из service worker уходят с Origin chrome-extension://…
   Форма может такой отвергнуть, поэтому для запросов НЕ из вкладок (tabId -1)
   подменяем Origin/Referer на сам сайт форм. Страницы и вкладки это не трогает. */
/* Тестовая сборка без разрешений cookies и declarativeNetRequest:
   куки браузер прикладывает сам (credentials: "include" + host_permissions),
   Origin не подменяем. */
async function yafEnsureHeaderRule() { /* отключено */ }
async function yafCookie() { return ""; }

/* CSRF-токен Яндекс Форм лежит в HTML страницы формы (в состоянии приложения
   или в <meta>). На всякий случай проверяем и куки. */
function yafExtractToken(html) {
    const patterns = [
        /"csrf[-_]?token"\s*:\s*"([^"]+)"/i,
        /"csrf"\s*:\s*"([^"]+)"/i,
        /<meta[^>]+name=["']csrf[-_]?token["'][^>]+content=["']([^"']+)["']/i,
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']csrf[-_]?token["']/i,
        /"sk"\s*:\s*"([^"]+)"/
    ];
    for (const re of patterns) {
        const m = html.match(re);
        if (m) return m[1];
    }
    return "";
}

/* Варианты ответов: ищем в HTML пары «id + подпись». id вариантов идут сразу
   за id вопроса (вопрос …440 → варианты …450, …460), поэтому группируем по близости.
   Числа больше 2^53 — только BigInt. */
function yafExtractOptions(html, questionIds) {
    const pairs = new Map();
    const text = html.replace(/\\"/g, '"').replace(/\\u0022/g, '"');
    const reA = /"id"\s*:\s*"?(\d{13,20})"?[^{}]{0,400}?"(?:label|text|title|name)"\s*:\s*"((?:[^"\\]|\\.){1,300})"/g;
    const reB = /"(?:label|text|title|name)"\s*:\s*"((?:[^"\\]|\\.){1,300})"[^{}]{0,400}?"id"\s*:\s*"?(\d{13,20})"?/g;
    let m;
    while ((m = reA.exec(text))) if (!pairs.has(m[1])) pairs.set(m[1], m[2]);
    while ((m = reB.exec(text))) if (!pairs.has(m[2])) pairs.set(m[2], m[1]);

    const decode = (s) => { try { return JSON.parse(`"${s}"`); } catch { return s; } };
    const result = { __labels: {} };
    for (const [id, label] of pairs) {
        const l = decode(label).trim().toLowerCase();
        if (l && !(l in result.__labels)) result.__labels[l] = id;
    }
    for (const q of questionIds) {
        const qn = BigInt(q);
        result[q] = [...pairs.entries()]
            .filter(([id]) => { const n = BigInt(id); return n > qn && n - qn < 2000n; })
            .sort(([a], [b]) => (BigInt(a) < BigInt(b) ? -1 : 1))
            .map(([id, label]) => ({ id, label: decode(label).trim() }))
            .filter((o) => o.label);
    }
    return result;
}


/* Варианты ответов из API формы (getSurvey) — тот же запрос, что делает сама форма.
   Обходим JSON целиком: любой объект с длинным числовым id и подписью = вариант. */
async function yafFetchSurveyOptions(surveyId, token, questionIds) {
    await yafEnsureHeaderRule(surveyId);
    const yandexuid = await yafCookie(["yandexuid"], "https://yandex.ru") || await yafCookie(["yandexuid"]);
    const res = await fetch(`${YAF_ORIGIN}/cloud/gateway/root/form/getSurvey`, {
        method: "POST",
        credentials: "include",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "x-csrf-token": token,
            ...(yandexuid ? { "x-forms-yandexuid": yandexuid } : {}),
            "x-use-collab": "1"
        },
        body: JSON.stringify({ surveyId })
    });
    if (!res.ok) throw new Error(`getSurvey HTTP ${res.status}`);
    const json = await res.json();

    const pairs = new Map();
    const walk = (node) => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) { node.forEach(walk); return; }
        const id = node.id ?? node.slug ?? node.value;
        const label = node.label ?? node.text ?? node.title ?? node.name;
        if (id != null && /^\d{13,20}$/.test(String(id)) && typeof label === "string" && label.trim()) {
            if (!pairs.has(String(id))) pairs.set(String(id), label.trim());
        }
        Object.values(node).forEach(walk);
    };
    walk(json);

    const result = { __labels: {} };
    for (const [id, label] of pairs) {
        const l = label.toLowerCase();
        if (!(l in result.__labels)) result.__labels[l] = id;
    }
    for (const q of questionIds) {
        const qn = BigInt(q);
        result[q] = [...pairs.entries()]
            .filter(([id]) => { const n = BigInt(id); return n > qn && n - qn < 2000n; })
            .sort(([a], [b]) => (BigInt(a) < BigInt(b) ? -1 : 1))
            .map(([id, label]) => ({ id, label }));
    }
    console.log("[ChMAF bg] getSurvey: пар id/подпись =", pairs.size);
    return result;
}

/* Проверка входа + получение токена. Без входа forms.yandex.ru уводит на
   passport/sso — по конечному адресу это и видно. */
async function yafLoadSession(surveyId, questionIds = [], force = false) {
    const fresh = yafCache.surveyId === surveyId && Date.now() - yafCache.at < YAF_TOKEN_TTL;

    if (!force && fresh && yafCache.token) return { authorized: true, authConfirmed: yafCache.authConfirmed, token: yafCache.token, options: yafCache.options };

    const res = await fetch(yafFormUrl(surveyId), { credentials: "include", cache: "no-store" });
    const finalHost = new URL(res.url).host;
    if (!finalHost.startsWith("forms.yandex.") || res.status === 401 || res.status === 403) {
        return { authorized: false, loginUrl: yafFormUrl(surveyId) };
    }
    if (!res.ok) throw new Error(`Форма не открылась: HTTP ${res.status}`);

    const html = await res.text();
    const token = yafExtractToken(html)
        || await yafCookie(["csrf_token", "csrftoken", "_csrf", "CSRF-TOKEN"]);
    if (!token) {
        /* Страница пришла, но токена нет — почти всегда это экран входа без редиректа */
        const looksLikeLogin = /passport\.yandex|sso\.ya\.ru|auth/i.test(html) && !html.includes(surveyId);
        if (looksLikeLogin) return { authorized: false, loginUrl: yafFormUrl(surveyId) };
        throw new Error("Не нашёл CSRF-токен на странице формы — смотри yafExtractToken в bg-yaforms.js");
    }

    /* Вход определяем по данным страницы: явный флаг или uid пользователя */
    const authFlag = html.match(/"(?:isAuth|isAuthorized|authorized|isLoggedIn)"\s*:\s*(true|false)/i);
    const hasUid = /"(?:uid|passportUid|userId)"\s*:\s*"?[1-9]\d{4,}/.test(html);
    if (authFlag && authFlag[1] === "false" && !hasUid) {
        return { authorized: false, loginUrl: yafFormUrl(surveyId) };
    }
    const authConfirmed = hasUid || (authFlag && authFlag[1] === "true");

    Object.assign(yafCache, {
        surveyId, token, at: Date.now(),
        options: null
    });
    if (questionIds.length) {
        let options = null;
        try { options = await yafFetchSurveyOptions(surveyId, token, questionIds); }
        catch (e) { console.warn("[ChMAF bg] getSurvey не удался:", e.message); }
        const hasAny = options && questionIds.some(q => options[q]?.length);
        yafCache.options = hasAny ? options : yafExtractOptions(html, questionIds);
    }
    yafCache.authConfirmed = !!authConfirmed;

    /* Вход по странице не понять — пробная отправка dryRun (ничего не сохраняет).
       401/403 = нет входа. */
    if (!authConfirmed) {
        try {
            const probe = await fetch(YAF_SUBMIT_URL, {
                method: "POST",
                credentials: "include",
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json",
                    "x-csrf-token": token,
                    "x-form-referer": yafFormUrl(surveyId),
                    "x-use-collab": "1"
                },
                body: JSON.stringify({ surveyId, values: {}, parent: yafFormUrl(surveyId), dryRun: true, timestamp: new Date().toISOString() })
            });
            const txt = await probe.text();
            console.log("[ChMAF bg] dryRun-проверка входа:", probe.status, txt.slice(0, 200));
            if (probe.status === 401 || probe.status === 403 || /auth|login|passport|unauthor/i.test(txt)) {
                yafCache.at = 0;
                return { authorized: false, loginUrl: yafFormUrl(surveyId) };
            }
        } catch (e) {
            console.warn("[ChMAF bg] dryRun-проверка не удалась:", e.message);
        }
    }
    return { authorized: true, authConfirmed: yafCache.authConfirmed, token, options: yafCache.options };
}

async function yafSubmit({ surveyId, values, dryRun }, retried = false) {
    const session = await yafLoadSession(surveyId);
    if (!session.authorized) return session;
    await yafEnsureHeaderRule(surveyId);

    const yandexuid = await yafCookie(["yandexuid"], "https://yandex.ru")
        || await yafCookie(["yandexuid"]);

    const res = await fetch(YAF_SUBMIT_URL, {
        method: "POST",
        credentials: "include",
        headers: {
            "accept": "application/json, text/plain, */*",
            "content-type": "application/json",
            "x-csrf-token": session.token,
            "x-form-referer": yafFormUrl(surveyId),
            ...(yandexuid ? { "x-forms-yandexuid": yandexuid } : {}),
            "x-use-collab": "1"
        },
        body: JSON.stringify({
            surveyId,
            values,
            parent: yafFormUrl(surveyId),
            dryRun: !!dryRun,
            timestamp: new Date().toISOString()
        })
    });

    /* Протухший токен: один раз берём новый и повторяем */
    if ((res.status === 403 || res.status === 419) && !retried) {
        yafCache.at = 0;
        return yafSubmit({ surveyId, values, dryRun }, true);
    }
    if (res.status === 401 || res.status === 403) return { authorized: false, loginUrl: yafFormUrl(surveyId), status: res.status };

    const raw = await res.text();
    let data = null;
    try { data = JSON.parse(raw); } catch { /* не JSON */ }
    if (!res.ok) {
        return { authorized: true, ok: false, status: res.status, error: data?.message || data?.errors || raw.slice(0, 400) };
    }
    return { authorized: true, ok: true, status: res.status, data };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || typeof msg.action !== "string" || !msg.action.startsWith("yaForms:")) return false;

    (async () => {
        switch (msg.action) {
            case "yaForms:status":
                return yafLoadSession(msg.surveyId, msg.questionIds || [], !!msg.force);
            case "yaForms:submit":
                return yafSubmit(msg);
            case "yaForms:login":
                await chrome.tabs.create({ url: yafFormUrl(msg.surveyId), active: true });
                return { opened: true };
            default:
                return { error: "unknown action" };
        }
    })()
        .then((r) => sendResponse({ success: true, ...r }))
        .catch((e) => sendResponse({ success: false, error: String(e?.message || e) }));

    return true; /* ответ асинхронный */
});
