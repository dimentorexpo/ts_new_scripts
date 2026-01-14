function waitForIframe() {
    return new Promise(resolve => {
        const check = setInterval(() => {
            try {
                const iframeNew = document.querySelector('[class^="NEW_FRONTEND__frame"]');
                if (iframeNew) {
                    const iframeDocument = iframeNew.contentDocument || iframeNew.contentWindow.document;
                    if (iframeDocument) {
                        clearInterval(check);
                        resolve(iframeDocument);
                    }
                }
            } catch (e) { }
        }, 500);
    });
}

function waitForTargetBlock(iframeDocument) {
    return new Promise(resolve => {
        const check = setInterval(() => {
            try {
                const wrappers = iframeDocument.querySelectorAll('#__next div[class*="List_ListWrapper"]');
                let targetBlock = null;

                wrappers.forEach(wrap => {
                    if (wrap.innerText.includes("Выбор тегов")) {
                        targetBlock = wrap;
                    }
                });

                if (targetBlock) {
                    clearInterval(check);
                    resolve(targetBlock);
                }
            } catch (e) { }
        }, 500);
    });
}

// Проверяем содержимое блока каждые 500 мс

function waitForOpSection() {
    return new Promise(resolve => {
        const check = setInterval(() => {
            const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
            let sectionKey = iframe.contentDocument.querySelector('span[id^="mantine-"][id$="-target"]');
            let operGroup = sectionKey.textContent.split('-')[0]
            if (typeof operGroup !== "undefined" && operGroup === "ТП") {
                clearInterval(check);
                resolve(true);
            }
        }, 300);
    });
}

(async function startWhenReady() {
    await waitForOpSection(); // ← ждём пока opsection станет "ТП"
    console.log("opsection = ТП, запускаю скрипт");

    setInterval(() => {
        try {
            (async function main() {
                const iframeDocument = await waitForIframe();
                const targetBlock = await waitForTargetBlock(iframeDocument);
                const btn = iframeDocument.querySelector('button[title="Закрыть"]');
                let text = targetBlock.innerText.trim();
                const convElement = iframeDocument.querySelector(
                    `[data-conv-id="${location.pathname.split('/')[3]}"]`
                );

                let existing = convElement.querySelector('[data-my-tag="no-tag"]');

                if (text.includes("Пусто")) {
                    btn.disabled = true;

                    targetBlock.children[0].children[0].children[0].children[1].style =
                        "background:firebrick; font-weight:800; padding:5px; border: 2px solid black;";

                    if (!existing) {
                        existing = document.createElement('span');
                        existing.setAttribute("data-my-tag", "no-tag");
                        convElement.append(existing);
                    }

                    existing.textContent = "❌Нет тега🏷️";
                    existing.style =
                        "background:orange;text-align:center; border-radius: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.6);";

                } else {
                    btn.disabled = false;

                    if (!existing) {
                        existing = document.createElement('span');
                        existing.setAttribute("data-my-tag", "no-tag");
                        convElement.append(existing);
                    }

                    existing.textContent = "☑️Есть тег🏷️";
                    existing.style =
                        "background:#0be40b;text-align:center; border-radius: 20px; text-shadow: 1px 1px 2px rgba(0,0,0,0.4), -1px -1px 2px rgba(255,255,255,0.6);";
                }
            })();
        } catch (e) {
            console.log("Ошибка при чтении блока:", e);
        }
    }, 3000);
})();


