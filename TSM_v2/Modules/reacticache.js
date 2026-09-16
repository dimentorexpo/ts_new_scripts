/* =========================================================
   TSM ReactiCache — NEON GLASS ULTRA Refactored
   ========================================================= */

const REACTICACHE_BTN_ID = "reactcachebtn";
const REACTICACHE_TOAST_ID = "reacticachetoast";
const REACTICACHE_TOAST_TTL = 6000;

/* Заголовок раздела определяем по h1/.title внутри .header, а НЕ по innerText всего контейнера:
   на страницах «Групповые» и «Вебинары» вложен друг в друга два .header
   (внешний ma-showcase-lessons-navigation и внутренний ma-classroom-header), и у обоих
   заголовок начинается со слова «Уроки» — без уточнения срабатывает вторая кнопка. */
function headerHasLessonTitle(headarea) {
    const title = headarea.querySelector("h1, .title");
    return !!title && title.textContent.trim().startsWith("Уроки");
}

function findLessonsHeader() {
    const candidates = [];
    document.querySelectorAll(".header").forEach(headarea => {
        if (headerHasLessonTitle(headarea)) candidates.push(headarea);
    });
    /* Приоритет 1: ma-classroom-header (сам элемент или один из предков) —
       ищем с конца, чтобы взять самый «внутренний» заголовок */
    for (let i = candidates.length - 1; i >= 0; i--) {
        if (candidates[i].closest("ma-classroom-header")) return candidates[i];
    }
    /* Приоритет 2: самый последний подходящий .header (fallback), чтобы не захватить
       внешний wrapper, если внутренний ma-classroom-header исчез */
    if (candidates.length) return candidates[candidates.length - 1];
    return null;
}

function createReactCacheButton() {
    const reactcachebtn = document.createElement('span');
    reactcachebtn.id = REACTICACHE_BTN_ID;
    reactcachebtn.innerHTML = '<span class="tsm-reactcache-icon">👨‍👩‍👧‍👦</span><span class="tsm-reactcache-label">Сброс кэша</span>';
    reactcachebtn.classList.add('tsm-cursor-pointer');
    reactcachebtn.style.cssText = 'right: 15px; position: absolute;';
    reactcachebtn.title = "TSM: очистить реактивный кэш, для обновления отображаемого списка учеников выбранного типа уроков. После очистки обновите страницу (F5).";
    reactcachebtn.onmousedown = (event) => event.stopPropagation();
    reactcachebtn.onclick = (event) => {
        event.stopPropagation();
        ClearReactCashe();
    };
    return reactcachebtn;
}

function addbuttonhesh() {
    const buttons = document.querySelectorAll(`#${REACTICACHE_BTN_ID}`);
    /* Страховка: на странице всегда остаётся ровно одна кнопка */
    buttons.forEach((button, index) => { if (index > 0) button.remove(); });

    const headarea = findLessonsHeader();
    if (!headarea) return;

    const reactcachebtn = buttons[0] || createReactCacheButton();
    /* appendChild переносит уже существующий узел, поэтому кнопка всегда оказывается
       в актуальном заголовке и не дублируется */
    if (reactcachebtn.parentNode !== headarea) headarea.appendChild(reactcachebtn);
}

/* Самодостаточное уведомление внизу по центру (не зависит от content.js) */
function reactiCacheNotify(text, type = "sucsbtnok") {
    const previous = document.getElementById(REACTICACHE_TOAST_ID);
    if (previous) previous.remove();

    const toast = document.createElement('div');
    toast.id = REACTICACHE_TOAST_ID;
    toast.className = `tsm-toast tsm-toast-center ${type}`;
    toast.innerHTML = text;

    const countdownBar = document.createElement('div');
    countdownBar.className = "tsm-countdown-bar";
    countdownBar.style.animationDuration = `${REACTICACHE_TOAST_TTL}ms`;
    toast.appendChild(countdownBar);

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), REACTICACHE_TOAST_TTL);
}

let observerScheduled = false;
const observer = new MutationObserver(() => {
    if (observerScheduled) return;
    observerScheduled = true;
    requestAnimationFrame(() => {
        observerScheduled = false;
        addbuttonhesh();
    });
});

observer.observe(document.body, { childList: true, subtree: true });

function getTeachToken() {
    const tokenPrefix = 'token_global=';
    return document.cookie.split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(tokenPrefix))
        ?.substring(tokenPrefix.length);
}

async function ClearReactCashe() {
    const button = document.getElementById('reactcachebtn');
    const myToken = getTeachToken();
    if (!myToken) {
        console.error('Токен не найден');
        reactiCacheNotify('⛔ <b>Токен не найден</b><br>Авторизуйтесь в личном кабинете и повторите попытку', 'sucsbtnnotok');
        return;
    }
    const urlBase = 'https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/';
    const urlSegments = document.URL.split('/');
    const urlmatches = ['personal', 'parallel', 'group', 'webinar'];
    const currentSegment = (urlSegments[7] || '').split("?")[0];
    if (!urlmatches.includes(currentSegment)) {
        console.error('Сегмент URL не соответствует ни одному из указанных шаблонов.');
        reactiCacheNotify('⛔ <b>Раздел не поддерживается</b><br>Кэш можно очистить на вкладках «Индивидуальные», «Параллельные», «Групповые» и «Вебинары»', 'sucsbtnnotok');
        return;
    }

    const fullUrl = urlBase + currentSegment;
    console.log(fullUrl);

    if (button) button.classList.add('tsm-reactcache-busy');
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${myToken}`
            },
            body: JSON.stringify({ refreshCache: 1 })
        });
        if (!response.ok) throw new Error(`Сетевой ответ был неудачным (HTTP ${response.status})`);

        const data = await response.json();
        console.log('Данные ответа:', data);
        reactiCacheNotify('✅ <b>Реактивный кэш очищен</b><br>Обновите страницу (F5 / Ctrl+R), чтобы проверить изменения', 'sucsbtnok');
    } catch (error) {
        console.error('Произошла ошибка при выполнении запроса:', error);
        reactiCacheNotify(`⛔ <b>Не удалось очистить кэш</b><br>${error.message}<br>Попробуйте ещё раз или обновите страницу`, 'sucsbtnnotok');
    } finally {
        if (button) button.classList.remove('tsm-reactcache-busy');
    }
}
