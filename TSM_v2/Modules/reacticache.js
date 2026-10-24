/* =========================================================
   TSM ReactiCache — сброс реактивного кэша списка учеников
   ========================================================= */

const REACTICACHE_BTN_ID = "reactcachebtn";
const REACTICACHE_TOAST_TTL = 6000;
const REACTICACHE_SECTIONS = ["personal", "parallel", "group", "webinar"];

/* Заголовок раздела ищем по h1/.title внутри .header, а не по innerText контейнера:
   на «Групповых» и «Вебинарах» вложены два .header, и оба начинаются со слова «Уроки» */
function headerHasLessonTitle(headarea) {
    const title = headarea.querySelector("h1, .title");
    return !!title && title.textContent.trim().startsWith("Уроки");
}

function findLessonsHeader() {
    const candidates = Array.from(document.querySelectorAll(".header")).filter(headerHasLessonTitle);
    /* Приоритет — самый «внутренний» ma-classroom-header, иначе последний подходящий */
    for (let i = candidates.length - 1; i >= 0; i--) {
        if (candidates[i].closest("ma-classroom-header")) return candidates[i];
    }
    return candidates[candidates.length - 1] || null;
}

function createReactCacheButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.id = REACTICACHE_BTN_ID;
    button.innerHTML = '<span class="tsm-reactcache-icon">↻</span><span class="tsm-reactcache-label">Сбросить кэш учеников</span>';
    button.title = "TSM: очищает реактивный кэш, чтобы обновить список учеников выбранного типа уроков. После очистки обновите страницу (F5).";
    button.onmousedown = (event) => event.stopPropagation();
    button.onclick = (event) => {
        event.stopPropagation();
        ClearReactCache();
    };
    return button;
}

function addButtonHash() {
    const existingButton = document.getElementById(REACTICACHE_BTN_ID);
    if (existingButton && existingButton.isConnected && existingButton.parentElement && headerHasLessonTitle(existingButton.parentElement)) {
        return;
    }

    const buttons = document.querySelectorAll(`#${REACTICACHE_BTN_ID}`);
    buttons.forEach((button, index) => { if (index > 0) button.remove(); });

    const headarea = findLessonsHeader();
    if (!headarea) return;

    const button = buttons[0] || createReactCacheButton();
    if (button.parentNode !== headarea) headarea.appendChild(button);
}

function reactiCacheNotify(text, type = "sucsbtnok") {
    createToast(text, type, true, REACTICACHE_TOAST_TTL);
}

let reactiCacheScheduled = false;
const reactiCacheObserver = new MutationObserver(() => {
    const existingButton = document.getElementById(REACTICACHE_BTN_ID);
    if (existingButton && existingButton.isConnected && existingButton.parentElement) return;
    if (reactiCacheScheduled) return;
    reactiCacheScheduled = true;
    requestAnimationFrame(() => {
        reactiCacheScheduled = false;
        addButtonHash();
    });
});
reactiCacheObserver.observe(document.body, { childList: true, subtree: true });
addButtonHash();

/* FIX: раздел раньше брался строго из 8-го сегмента URL и ломался при любом изменении пути */
function currentReactiCacheSection() {
    return location.pathname.split("/").find((part) => REACTICACHE_SECTIONS.includes(part)) || "";
}

async function ClearReactCache() {
    const button = document.getElementById(REACTICACHE_BTN_ID);
    const myToken = getGlobalToken();
    if (!myToken) {
        reactiCacheNotify("<b>Токен не найден.</b> Войдите в личный кабинет и повторите", "sucsbtnnotok");
        return;
    }

    const section = currentReactiCacheSection();
    if (!section) {
        reactiCacheNotify("<b>Раздел не поддерживается.</b> Кэш сбрасывается на вкладках «Индивидуальные», «Параллельные», «Групповые» и «Вебинары»", "sucsbtnnotok");
        return;
    }

    if (button) {
        button.classList.add("tsm-reactcache-busy");
        button.disabled = true;
    }
    try {
        const response = await fetch(`https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/${section}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${myToken}`
            },
            body: JSON.stringify({ refreshCache: 1 })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await response.json().catch(() => null);
        reactiCacheNotify("<b>Кэш учеников очищен.</b> Обновите страницу (F5), чтобы увидеть актуальный список", "sucsbtnok");
    } catch (error) {
        console.error("[TSM ReactiCache]", error);
        reactiCacheNotify(`<b>Не удалось очистить кэш</b> (${escapeHTML(error.message)}). Повторите или обновите страницу`, "sucsbtnnotok");
    } finally {
        if (button) {
            button.classList.remove("tsm-reactcache-busy");
            button.disabled = false;
        }
    }
}
