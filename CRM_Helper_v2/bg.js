/**
 * bg.js — service worker расширения (MV3).
 *
 * Единственная задача: проксировать fetch-запросы из content-скриптов.
 * Это нужно, потому что со страницы CRM запросы к внутренним API блокируются CORS,
 * а service worker делает их с привилегиями расширения (host_permissions).
 */

// Слушатель сообщений от контент-скриптов.
// Возвращаем true — это говорит Chrome, что sendResponse будет вызван асинхронно.
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'getFetchRequest') {
        const url = request.fetchURL;
        const requestOptions = request.requestOptions;

        // Асинхронное выполнение через IIFE: listener не может быть async-функцией,
        // поэтому оборачиваем в (async () => ...) и возвращаем true синхронно.
        (async () => {
            try {
                const response = await fetch(url, requestOptions);

                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }

                const text = await response.text();

                if (!text) {
                    throw new Error('Fetch response not found');
                }

                // fetchansver — исторический ключ, его ждут все модули.
                // fetchAnswer — алиас с корректным написанием для новых участков кода.
                sendResponse({ success: true, fetchansver: text, fetchAnswer: text });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        })();

        return true; // держим порт сообщения открытым до вызова sendResponse
    }
});
