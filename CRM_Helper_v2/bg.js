/**
 * bg.js — service worker расширения (MV3).
 *
 * Единственная задача: выполнять fetch-запросы по просьбе контент-скриптов.
 * Со страниц CRM запросы к внутренним API блокируются CORS, а service worker
 * делает их с привилегиями расширения (host_permissions).
 *
 * Ответ: { success: true, fetchansver, fetchAnswer, status }
 *    или { success: false, error, status }.
 * В error есть HTTP-код («HTTP 401 Unauthorized»): по нему модули
 * отличают «нужна авторизация» от прочих ошибок.
 */

/** Лимит одного запроса: зависший сервер не должен подвешивать окна расширения. */
const FETCH_TIMEOUT_MS = 30000;

/**
 * Шина bg.js — только для веб-запросов (defense-in-depth: контент-скрипты
 * доверенные, но file:, chrome-extension: и т. п. через неё не проходят).
 */
function isAllowedUrl(raw) {
    try {
        const url = new URL(raw);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (!request) return;

    // «Проверить обновления» в настройках: после подтверждения пользователем
    // перезапускаем расширение (chrome.runtime.reload доступен только здесь).
    if (request.action === 'reloadExtension') {
        if (sender.id === chrome.runtime.id) chrome.runtime.reload();
        return;
    }

    if (request.action !== 'getFetchRequest') return;

    // Принимаем запросы только от собственных контент-скриптов.
    if (sender.id !== chrome.runtime.id) return;

    (async () => {
        let status = 0;
        try {
            if (!isAllowedUrl(request.fetchURL)) throw new Error('Запрещённый адрес запроса');

            const response = await fetch(request.fetchURL, {
                ...(request.requestOptions || {}),
                // AbortSignal.timeout появился в Chrome 103 — на старых просто без таймаута.
                signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout
                    ? AbortSignal.timeout(FETCH_TIMEOUT_MS)
                    : undefined
            });
            status = response.status;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
            }

            const text = await response.text();
            if (!text) throw new Error('Пустой ответ сервера');

            // fetchansver — исторический ключ, его ждут все модули.
            sendResponse({ success: true, fetchansver: text, fetchAnswer: text, status });
        } catch (error) {
            const message = error.name === 'TimeoutError'
                ? `Сервер не ответил за ${FETCH_TIMEOUT_MS / 1000} с`
                : error.message;
            sendResponse({ success: false, error: message, status });
        }
    })();

    return true; // ответ асинхронный — держим порт открытым
});
