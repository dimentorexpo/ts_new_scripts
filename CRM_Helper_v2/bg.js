/**
 * bg.js — service worker расширения (MV3).
 *
 * Единственная задача: выполнять fetch-запросы по просьбе контент-скриптов.
 * Со страниц CRM запросы к внутренним API блокируются CORS, а service worker
 * делает их с привилегиями расширения (host_permissions).
 *
 * Ответ: { success: true, fetchansver, fetchAnswer, status }
 *    или { success: false, error, status }.
 * В error теперь есть HTTP-код («HTTP 401 Unauthorized»): по нему модули
 * отличают «нужна авторизация» от прочих ошибок.
 */

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (!request || request.action !== 'getFetchRequest') return;

    // Принимаем запросы только от собственных контент-скриптов.
    if (sender.id !== chrome.runtime.id) return;

    (async () => {
        let status = 0;
        try {
            const response = await fetch(request.fetchURL, request.requestOptions || {});
            status = response.status;

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
            }

            const text = await response.text();
            if (!text) throw new Error('Пустой ответ сервера');

            // fetchansver — исторический ключ, его ждут все модули.
            sendResponse({ success: true, fetchansver: text, fetchAnswer: text, status });
        } catch (error) {
            sendResponse({ success: false, error: error.message, status });
        }
    })();

    return true; // ответ асинхронный — держим порт открытым
});
