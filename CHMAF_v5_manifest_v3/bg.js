'use strict';

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install' || details.reason === 'update') {
        chrome.storage.local.set({
            KC_addr: 'https://script.google.com/macros/s/AKfycbzV8BHtyD3XUcPjZmb9pwwY-2cwAKx8hTRZKVENpKhdCJYe-hF0rpyDVdUIXBUin326Lw/exec',
            TP_addr: 'https://script.google.com/macros/s/AKfycbzsf72GllYQdCGg-L4Jw1qx9iv9Vz3eyiQ9QO81HEnlr0K2DKqy6zvi7IYu77GB6EMU/exec',
            KC_addrRzrv: 'https://script.google.com/macros/s/AKfycbzn2Lv0uuqXG5-mSWHu2W_fAmeeVJ9WVtT1hNNMAj9z9p5I0WLZnydzTcE8z1H5nuaTiQ/exec',
            TP_addrRzrv: 'https://script.google.com/macros/s/AKfycbyL2uTpWRlajHmtRXpjUq2yiPw6f_t-tHoBglkG-ojoA7ksnqMXr0_BXzhZFk31qV7jmQ/exec',
            TP_addrth: 'https://script.google.com/macros/s/AKfycbzgGszbjUND_GUDNFbKlRrpjrGtEFuCK-mMprFCADI8VFrQxCe01WZ_tXfnxsdEx4EB5w/exec',
            KC_addrth: 'https://script.google.com/macros/s/AKfycbwwSfk_Y4xCsi3jI-TiBxb5ODKGes4vV_dgwnmMBPRTPiCR64AzMzAzIWgxkpbvmO7raQ/exec'
        });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'getFetchRequest') {
        const url = request.fetchURL;
        const requestOptions = request.requestOptions;
        (async () => {
            try {
                // ⚡ ТАЙМАУТ для fetch (было: мог висеть вечно)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20_000);
                const response = await fetch(url, {
                    ...requestOptions,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status} ${response.statusText}`);
                }
                const text = await response.text();
                // ⚡ Проверяем, что порт ещё жив (content script мог отвалиться)
                try { sendResponse({ success: true, fetchansver: text }); } catch { }
            } catch (error) {
                try { sendResponse({ success: false, error: error.message }); } catch { }
            }
        })();
        return true;
    }
    if (request.question === 'get-extension-id') {
        sendResponse(chrome.runtime.id);
        return false;
    }
    return false;
});

// ⚡ Обработка отвалившихся content scripts
chrome.runtime.onConnect.addListener((port) => {
    port.onDisconnect.addListener(() => {
        console.log('[bg] content script disconnected:', port.name);
    });
});