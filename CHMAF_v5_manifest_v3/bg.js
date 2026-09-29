'use strict';

const DATSY_URL = 'https://datsy.ru/';
const DATSY_AUTH_URL = 'https://datsy.ru/api/auth/check.php';

chrome.runtime.onInstalled.addListener(details => {
    if (
        details.reason !== 'install' &&
        details.reason !== 'update'
    ) {
        return;
    }

    chrome.storage.local.set({
        KC_addr:
            'https://script.google.com/macros/s/AKfycbzV8BHtyD3XUcPjZmb9pwwY-2cwAKx8hTRZKVENpKhdCJYe-hF0rpyDVdUIXBUin326Lw/exec',

        TP_addr:
            'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec',

        KC_addrRzrv:
            'https://script.google.com/macros/s/AKfycbzn2Lv0uuqXG5-mSWHu2W_fAmeeVJ9WVtT1hNNMAj9z9p5I0WLZnydzTcE8z1H5nuaTiQ/exec',

        TP_addrRzrv:
            'https://script.google.com/macros/s/AKfycbyL2uTpWRlajHmtRXpjUq2yiPw6f_t-tHoBglkG-ojoA7ksnqMXr0_BXzhZFk31qV7jmQ/exec',

        TP_addrth:
            'https://script.google.com/macros/s/AKfycbzgGszbjUND_GUDNFbKlRrpjrGtEFuCK-mMprFCADI8VFrQxCe01WZ_tXfnxsdEx4EB5w/exec',

        KC_addrth:
            'https://script.google.com/macros/s/AKfycbwwSfk_Y4xCsi3jI-TiBxb5ODKGes4vV_dgwnmMBPRTPiCR64AzMzIWgxkpbvmO7raQ/exec'
    });
});

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request?.action === 'openDatsyLoginTab') {
            // Адрес фиксирован в background: сообщение не может
            // заставить расширение открыть произвольный URL.
            (async () => {
                try {
                    const senderUrl =
                        sender.url || sender.tab?.url || '';

                    const senderHost =
                        new URL(senderUrl).hostname;

                    if (senderHost !== 'skyeng.autofaq.ai') {
                        throw new Error(
                            'Открытие Datsy разрешено только из Autofaq'
                        );
                    }

                    const tab = await chrome.tabs.create({
                        url: DATSY_URL,
                        active: true
                    });

                    sendResponse({
                        success: true,
                        tabId: tab.id
                    });
                } catch (error) {
                    sendResponse({
                        success: false,
                        error: error.message
                    });
                }
            })();

            return true;
        }

        if (request?.action === 'getFetchRequest') {
            (async () => {
                const controller = new AbortController();

                const isDatsyAuthCheck =
                    request.fetchURL === DATSY_AUTH_URL;

                const timeoutMs =
                    isDatsyAuthCheck ? 5000 : 20000;

                const timeoutId = setTimeout(
                    () => controller.abort(),
                    timeoutMs
                );

                try {
                    const options =
                        request.requestOptions &&
                        typeof request.requestOptions === 'object'
                            ? request.requestOptions
                            : {};

                    const response = await fetch(
                        request.fetchURL,
                        {
                            ...options,

                            // Для проверки Datsy явно запрашиваем
                            // отправку доступных браузеру cookie.
                            credentials: isDatsyAuthCheck
                                ? 'include'
                                : options.credentials,

                            signal: controller.signal
                        }
                    );

                    const text = await response.text();

                    if (!response.ok) {
                        throw new Error(
                            `HTTP ${response.status}: ` +
                            text.slice(0, 120)
                        );
                    }

                    sendResponse({
                        success: true,
                        fetchansver: text
                    });
                } catch (error) {
                    sendResponse({
                        success: false,
                        error: error.name === 'AbortError'
                            ? `Таймаут запроса (${timeoutMs / 1000} сек)`
                            : error.message
                    });
                } finally {
                    clearTimeout(timeoutId);
                }
            })();

            return true;
        }

        if (request?.question === 'get-extension-id') {
            sendResponse(chrome.runtime.id);
            return false;
        }

        return false;
    }
);

chrome.runtime.onConnect.addListener(port => {
    port.onDisconnect.addListener(() => {
        console.log(
            '[bg] content script disconnected:',
            port.name
        );
    });
});