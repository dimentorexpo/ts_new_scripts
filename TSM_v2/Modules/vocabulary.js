/* =========================================================
   TSM Vocabulary — словарь ученика
   ========================================================= */

let allWordSets = [];
let globalWordsCounter = 0;
let isTaskPaused = false;
let isTaskCancelled = false;
let isTaskRunning = false;
/* Каждая операция получает свой номер: устаревший цикл видит, что его заменили, и завершается */
let vocabTaskId = 0;
let vocabStudentId = "";
/* Выбор слов хранится отдельно от DOM — живой поиск больше не сбрасывает галочки */
const selectedWordIds = new Set();
/* Режим окна: «student» — словарь ученика по ID, «mobile» — слова аккаунта мобильного приложения Skyeng Words */
let vocabMode = "student";
/* Исходные записи слов мобильного приложения (meaningId → запись). Нужны для выбора слов по статусу */
const mobileRecords = new Map();
const mobileLog = [];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function WORDS_API_HEADERS() {
    const currentToken = getGlobalToken() || token?.token_global || "";
    return {
        "accept": "application/json, text/plain, */*",
        "authorization": `Bearer ${currentToken}`
    };
}

const win_Vocabulary = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">${tsmIcon("book", 15)} Словарь <span id="vocabModeBadge" class="tsm-mobile-badge tsm-hidden" title="Режим мобильного приложения Skyeng Words">${tsmIcon("phone", 12)} Моб.</span></span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="ClearVocabulary" title="Очистить и остановить операции" aria-label="Очистить и остановить операции">${tsmIcon("trash")}</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hideVocabularyMenu">${tsmIcon("close")}</button>
    </div>
    <div class="tsm-mode-switch" id="vocabModeSwitch" role="tablist" aria-label="Источник словаря">
        <button type="button" class="tsm-mode-btn is-active" data-mode="student" role="tab" aria-selected="true">${tsmIcon("user", 14)} Ученик</button>
        <button type="button" class="tsm-mode-btn" data-mode="mobile" role="tab" aria-selected="false">${tsmIcon("phone", 14)} Моб. приложение</button>
    </div>
    <div id="vocabMobileBanner" class="tsm-mobile-banner tsm-hidden">
        <div class="tsm-mobile-banner-head">${tsmIcon("phone", 15)} Мобильное приложение Skyeng Words</div>
        <div class="tsm-mobile-banner-text">Слова аккаунта, под которым вы сейчас вошли на сайте, а не ученика. Сброс, «выучено» и скрытие меняют словарь в приложении.</div>
        <div id="vocabMobileLog" class="tsm-mobile-log"></div>
    </div>
    <div id="vocabularbar">
        <div id="searchtoolswords" class="tsm-input-group">
            <input id="iduserwords" class="tsm-input" inputmode="numeric" autocomplete="off" placeholder="ID ученика">
            <button type="button" id="findwords" class="tsm-btn">Загрузить</button>
        </div>
        <div class="tsm-flex-row tsm-mb-8">
            <div class="tsm-progress-wrapper" id="tsm-progress-container">
                <div id="dynamicProgressBar" class="tsm-progress-base" style="width:0%;"></div>
                <span id="tsm-progress-label" class="tsm-progress-label">Введите ID ученика</span>
            </div>
            <button type="button" class="tsm-btn-pause tsm-hidden" id="btnPause" title="Пауза" aria-label="Пауза">${tsmIcon("pause", 13)}</button>
            <button type="button" class="tsm-btn-resume tsm-hidden" id="btnResume" title="Продолжить" aria-label="Продолжить">${tsmIcon("play", 13)}</button>
        </div>
        <div class="tsm-vocab-tools">
            <button type="button" class="tsm-btn-vertical" id="selectallwords" title="Выделить / снять выделение со всех слов">
                <span class="tsm-btn-vertical-icon">${tsmIcon("check-square", 18)}</span><span class="label">Выбрать все</span>
            </button>
            <button type="button" class="tsm-btn-vertical tsm-tone-ok" id="learncheckedwords" title="Отметить выбранные слова выученными">
                <span class="tsm-btn-vertical-icon">${tsmIcon("check-circle", 18)}</span><span class="label" data-vocab-label="learn">Выучить</span>
            </button>
            <button type="button" class="tsm-btn-vertical tsm-tone-warn" id="unlearnallwords" title="Сбросить прогресс выбранных (или всех) слов">
                <span class="tsm-btn-vertical-icon">${tsmIcon("reset", 18)}</span><span class="label" data-vocab-label="reset">Сброс прогресса</span>
            </button>
            <button type="button" class="tsm-btn-vertical tsm-tone-bad" id="delunlearnallwords" title="Удалить все выученные слова">
                <span class="tsm-btn-vertical-icon">${tsmIcon("trash", 18)}</span><span class="label" data-vocab-label="delLearned">Удалить выученные</span>
            </button>
            <button type="button" class="tsm-btn-vertical tsm-tone-bad" id="deleteallwords" title="Удалить выбранные слова (если ничего не выбрано — все)">
                <span class="tsm-btn-vertical-icon">${tsmIcon("x-circle", 18)}</span><span class="label" data-vocab-label="del">Удалить</span>
            </button>
        </div>
        <input id="searchwordinput" class="tsm-input tsm-hidden" autocomplete="off" placeholder="Поиск по слову">
        <div id="vocabSelectionInfo" class="tsm-selection-info"></div>
    </div>
    <div id="wordsout" class="tsm-words-out"></div>
</div>`;

const wintVocabulary = createTSMWindow("AFMS_Vocabulary", "winTopVocabulary", "winLeftVocabulary", win_Vocabulary);
wintVocabulary.className = "tsm-window tsm-window-vocabulary";

/* ---------- Прогресс-бар ---------- */

function setProgress(percent, label, tone) {
    const bar = document.getElementById("dynamicProgressBar");
    bar.style.width = `${percent}%`;
    /* FIX: пустой тон раньше не снимал старый data-tone — после удаления полоса оставалась красной */
    if (tone) bar.dataset.tone = tone;
    else delete bar.dataset.tone;
    document.getElementById("tsm-progress-label").textContent = label;
}

function setPauseControls(running) {
    document.getElementById("btnPause").classList.toggle("tsm-hidden", !(running && !isTaskPaused));
    document.getElementById("btnResume").classList.toggle("tsm-hidden", !(running && isTaskPaused));
    const wrapper = document.getElementById("tsm-progress-container");
    wrapper.classList.toggle("is-running", running);
    wrapper.classList.toggle("is-paused", running && isTaskPaused);
}

function startTask(tone, label) {
    isTaskPaused = false;
    isTaskCancelled = false;
    isTaskRunning = true;
    setProgress(0, label, tone);
    setPauseControls(true);
    return ++vocabTaskId;
}

const isTaskStale = (taskId) => isTaskCancelled || taskId !== vocabTaskId;

function finishTask(label) {
    isTaskRunning = false;
    setPauseControls(false);
    if (!isTaskCancelled) setProgress(100, label);
}

function resetVocabularyState() {
    vocabTaskId++;
    isTaskCancelled = true;
    isTaskPaused = false;
    isTaskRunning = false;
    allWordSets = [];
    selectedWordIds.clear();
    document.getElementById("wordsout").innerHTML = "";
    document.getElementById("iduserwords").value = "";
    const search = document.getElementById("searchwordinput");
    search.value = "";
    search.classList.add("tsm-hidden");
    setProgress(0, "Введите ID ученика", "");
    setPauseControls(false);
    updateSelectionInfo();
}

/* ---------- Пул конкурентных задач ---------- */

async function runConcurrentPool({ items, limit = 6, taskId, worker }) {
    if (!items.length) return;
    let nextIndex = 0;
    const workerCount = Math.min(limit, items.length);

    const workers = Array.from({ length: workerCount }, async () => {
        while (nextIndex < items.length) {
            while (isTaskPaused && !isTaskStale(taskId)) await sleep(200);
            if (isTaskStale(taskId)) return;

            const currentIndex = nextIndex++;
            await worker(items[currentIndex], currentIndex);
        }
    });

    await Promise.all(workers);
}

/* ---------- Универсальный батч-раннер ---------- */

async function runBatchOperation({ targetIds, confirmMessage, tone, doneLabel, successMessage, request }) {
    if (isTaskRunning) {
        createNotify("Дождитесь окончания текущей операции", "error");
        return false;
    }
    if (!vocabStudentId) {
        createNotify("Сначала загрузите словарь ученика", "error");
        return false;
    }
    if (!targetIds.length) {
        createNotify("Нет слов для операции", "error");
        return false;
    }

    const confirmed = await tsmConfirm({
        title: "Подтверждение",
        message: confirmMessage,
        okText: "Выполнить",
        danger: true
    });
    if (!confirmed) return false;

    const studentId = vocabStudentId;
    let failed = 0;
    let completed = 0;
    const total = targetIds.length;
    const taskId = startTask(tone, `0 / ${total}`);

    await runConcurrentPool({
        items: targetIds,
        limit: 6,
        taskId,
        worker: async (wordId) => {
            try {
                let res = await request(wordId, studentId);
                // Если сервер вернул 429 (Too Many Requests), делаем короткую паузу и одну повторную попытку
                if (res.status === 429) {
                    await sleep(600);
                    if (isTaskStale(taskId)) return;
                    res = await request(wordId, studentId);
                }
                if (!res.ok) failed++;
            } catch (err) {
                failed++;
                console.error(`[TSM Словарь] Ошибка операции над словом ${wordId}:`, err);
            }

            completed++;
            if (!isTaskStale(taskId)) {
                const percent = Math.round((completed / total) * 100);
                setProgress(percent, `${completed} / ${total}${failed ? ` · ошибок: ${failed}` : ""}`);
            }
        }
    });

    if (isTaskStale(taskId)) return false;

    finishTask(failed ? `${doneLabel}, ошибок: ${failed}` : doneLabel);
    const message = failed ? `${successMessage}, но ${failed} из ${total} не обработаны` : successMessage;
    createNotify(message, failed ? "error" : "message");
    selectedWordIds.clear();
    await getwordsets(studentId);
    return true;
}

const WORD_OPERATIONS = {
    delete: (wordId, studentId) =>
        fetch(`https://api-words.skyeng.ru/api/v2/words/${wordId}.json?studentId=${studentId}`, { headers: WORDS_API_HEADERS(), method: "DELETE" }),
    learn: (wordId, studentId) =>
        fetch(`https://api-words.skyeng.ru/api/for-vimbox/v1/words/${wordId}/skip.json?studentId=${studentId}`, { headers: WORDS_API_HEADERS(), method: "PUT" }),
    resetProgress: (wordId, studentId) =>
        fetch(`https://api-words.skyeng.ru/api/trainings/v1/users/${studentId}/meanings/${wordId}/progress`, { headers: WORDS_API_HEADERS(), method: "DELETE" })
};

function allWordIds() {
    return [...new Set(allWordSets.flatMap((set) => set.words.map((w) => String(w.meaningId))))];
}

/* ---------- Публичные операции ---------- */

function deleteLearnedWords() {
    const learnedIds = [...new Set(allWordSets.flatMap((set) => set.words.filter((w) => w.isLearned).map((w) => String(w.meaningId))))];
    if (!learnedIds.length && allWordSets.length) {
        createNotify("Выученных слов в словаре нет", "error");
        return;
    }
    return runBatchOperation({
        targetIds: learnedIds,
        confirmMessage: `Будут удалены все выученные слова: ${learnedIds.length} шт.`,
        tone: "bad",
        doneLabel: "Удалено",
        successMessage: "Выученные слова удалены",
        request: WORD_OPERATIONS.delete
    });
}

function learnSelectedWords() {
    const targetIds = [...selectedWordIds];
    if (!targetIds.length) {
        createNotify("Отметьте слова, которые нужно сделать выученными", "error");
        return;
    }
    return runBatchOperation({
        targetIds,
        confirmMessage: `Отметить выученными выбранные слова: ${targetIds.length} шт.`,
        tone: "ok",
        doneLabel: "Выучено",
        successMessage: "Выбранные слова отмечены выученными",
        request: WORD_OPERATIONS.learn
    });
}

function resetProgressForSelectedWords() {
    const hasSelection = selectedWordIds.size > 0;
    const targetIds = hasSelection ? [...selectedWordIds] : allWordIds();
    return runBatchOperation({
        targetIds,
        confirmMessage: hasSelection
            ? `Сбросить прогресс у выбранных слов: ${targetIds.length} шт.`
            : `Ничего не выбрано — прогресс будет сброшен у ВСЕХ слов словаря (${targetIds.length} шт.).`,
        tone: "warn",
        doneLabel: "Прогресс сброшен",
        successMessage: "Прогресс слов сброшен",
        request: WORD_OPERATIONS.resetProgress
    });
}

function deleteSelectedWords() {
    const hasSelection = selectedWordIds.size > 0;
    const targetIds = hasSelection ? [...selectedWordIds] : allWordIds();
    return runBatchOperation({
        targetIds,
        confirmMessage: hasSelection
            ? `Удалить выбранные слова: ${targetIds.length} шт.`
            : `Ничего не выбрано — будут удалены ВСЕ слова из словаря (${targetIds.length} шт.).`,
        tone: "bad",
        doneLabel: "Удалено",
        successMessage: "Слова удалены",
        request: WORD_OPERATIONS.delete
    });
}

/* ---------- Загрузка словаря ---------- */

async function getwordsets(studentId) {
    studentId = String(studentId || "").replace(/\D/g, "");
    if (!studentId) {
        createNotify("Введите ID ученика", "error");
        return;
    }
    vocabStudentId = studentId;
    allWordSets = [];
    globalWordsCounter = 0;
    const out = document.getElementById("wordsout");
    out.innerHTML = "";
    document.getElementById("searchwordinput").classList.add("tsm-hidden");
    const taskId = startTask("search", "Загружаем наборы слов…");
    out.innerHTML = tsmSkeleton(6);

    let wordsetsResponse;
    try {
        const resp = await fetch(`https://api-words.skyeng.ru/api/for-vimbox/v1/wordsets.json?studentId=${studentId}&pageSize=500`, {
            headers: WORDS_API_HEADERS()
        });
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        wordsetsResponse = await resp.json();
    } catch (err) {
        if (isTaskStale(taskId)) return;
        console.error("[TSM Словарь] Ошибка загрузки:", err);
        finishTask("Ошибка загрузки");
        out.innerHTML = tsmEmptyState("alert", "Не удалось загрузить словарь", `Проверьте ID ученика и авторизацию (${err.message})`, tsmRetryButton());
        document.querySelector("#wordsout .tsm-empty-retry")?.addEventListener("click", () => getwordsets(studentId));
        return;
    }

    if (isTaskStale(taskId)) return;
    const sets = wordsetsResponse?.data || [];
    if (!sets.length) {
        finishTask("Словарь пуст");
        out.innerHTML = tsmEmptyState("book", "У ученика нет слов в словаре");
        return;
    }

    const loadedSets = new Array(sets.length);
    const meaningsCache = new Map();
    let completedSets = 0;
    let loadedWordsCount = 0;
    let failedSets = 0;

    await runConcurrentPool({
        items: sets,
        limit: 4,
        taskId,
        worker: async (wordset, index) => {
            try {
                const setWords = await fetch(
                    `https://api-words.skyeng.ru/api/v1/wordsets/${wordset.id}/words.json?wordsetId=${wordset.id}&studentId=${studentId}&page=1&pageSize=500`,
                    { headers: WORDS_API_HEADERS() }
                ).then((r) => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                });
                const words = setWords?.data || [];

                if (words.length) {
                    const missingIds = words
                        .map((w) => String(w.meaningId))
                        .filter((id) => id && !meaningsCache.has(id));

                    if (missingIds.length) {
                        const CHUNK_SIZE = 60;
                        const chunks = [];
                        for (let i = 0; i < missingIds.length; i += CHUNK_SIZE) {
                            chunks.push(missingIds.slice(i, i + CHUNK_SIZE));
                        }
                        await Promise.all(chunks.map(async (chunk) => {
                            try {
                                const idsParam = chunk.join(",");
                                const meanings = await fetch(`https://dictionary.skyeng.ru/api/for-services/v2/meanings?ids=${idsParam}&acceptLanguage=ru`, {
                                    headers: WORDS_API_HEADERS()
                                }).then((r) => (r.ok ? r.json() : []));

                                if (Array.isArray(meanings)) {
                                    for (const m of meanings) {
                                        if (m && m.id) meaningsCache.set(String(m.id), m);
                                    }
                                }
                            } catch (mErr) {
                                console.warn("[TSM Словарь] Не удалось получить перевод части слов:", mErr);
                            }
                        }));
                    }
                }

                if (isTaskStale(taskId)) return;

                const wordSetData = {
                    title: wordset.title,
                    words: words.map((w) => ({
                        text: meaningsCache.get(String(w.meaningId))?.text || `#${w.meaningId}`,
                        isLearned: w.isLearned,
                        progress: w.progress ?? 0,
                        meaningId: w.meaningId
                    }))
                };

                loadedSets[index] = wordSetData;
                loadedWordsCount += wordSetData.words.length;
            } catch (err) {
                failedSets++;
                console.error("[TSM Словарь] Ошибка загрузки набора " + wordset.title, err);
            }

            completedSets++;
            if (!isTaskStale(taskId)) {
                setProgress(
                    Math.round((completedSets / sets.length) * 100),
                    `Наборы ${completedSets}/${sets.length} · слов: ${loadedWordsCount}`
                );
            }
        }
    });

    if (isTaskStale(taskId)) return;

    allWordSets = loadedSets.filter(Boolean);
    globalWordsCounter = allWordSets.reduce((acc, s) => acc + s.words.length, 0);
    renderWordSets(allWordSets, false);
    document.getElementById("searchwordinput").classList.remove("tsm-hidden");
    finishTask(`Найдено слов: ${globalWordsCounter} в ${allWordSets.length} наборах${failedSets ? `, не загружено наборов: ${failedSets}` : ""}`);
    if (failedSets) createNotify(`Не удалось загрузить наборов: ${failedSets} из ${sets.length}. Список слов неполный — нажмите «Загрузить» ещё раз`, "error");
}

/* ---------- Рендер ---------- */

function renderWordSets(wordSets, isSearch = false) {
    const html = wordSets.map((wordSet) => {
        const learned = wordSet.words.filter((w) => w.isLearned).length;
        const rows = wordSet.words.map((word) => {
            const id = escapeHTML(word.meaningId);
            return `<div class="tsm-word-row${word.isLearned ? " is-learned" : ""}${word.isHidden ? " is-hidden-word" : ""}" data-word-id="${id}">
                <label class="tsm-custom-checkbox">
                    <input type="checkbox" name="checkfordel" class="tsm-checkbox" ${selectedWordIds.has(String(word.meaningId)) ? "checked" : ""}>
                    <span class="tsm-checkmark"></span>
                </label>
                <div class="tsm-word-text" title="${escapeHTML(word.text + (word.translation ? " — " + word.translation : ""))}">${escapeHTML(word.text)}${word.translation ? `<span class="tsm-word-tr"> — ${escapeHTML(word.translation)}</span>` : ""}</div>
                <button type="button" class="tsm-btn-save-word" data-action="copy-word" title="Скопировать ссылку в CMS" aria-label="Скопировать ссылку в CMS">${tsmIcon("link", 14)}</button>
                <div class="tsm-word-id tsm-word-stat">${id}</div>
                ${word.mobile ? `<div class="tsm-word-stat tsm-word-progress" title="${escapeHTML(mobileProgressHint(word))}"><span>${Math.min(word.correct, MOBILE_LEARNED_ANSWERS)}/${MOBILE_LEARNED_ANSWERS}</span><span class="tsm-word-progress-track"><i style="width:${Math.min(100, Math.round((word.correct / MOBILE_LEARNED_ANSWERS) * 100))}%"></i></span></div>` : `<div class="tsm-word-stat tsm-word-progress" title="Прогресс заучивания"><span>${escapeHTML(word.progress)}%</span><span class="tsm-word-progress-track"><i style="width:${Math.max(0, Math.min(100, Number(word.progress) || 0))}%"></i></span></div>`}
                <div class="tsm-learned-status" title="${word.isHidden ? "Убрано из изучения (скрыто)" : word.isLearned ? "Выучено" : "Не выучено"}">${word.isHidden ? tsmIcon("x-circle", 14) : word.isLearned ? tsmIcon("check", 14) : "·"}</div>
            </div>`;
        }).join("");

        return `<div class="tsm-wordset">
            <div class="tsm-wordset-title" role="button" tabindex="0">
                <span class="tsm-wordset-name">${escapeHTML(wordSet.title)}</span>
                <span class="tsm-wordset-count" title="Выучено / всего">${learned}/${wordSet.words.length}</span>
            </div>
            <div class="tsm-words-box${isSearch ? "" : " tsm-hidden"}">
                <div class="tsm-word-row tsm-word-row-header">
                    <label class="tsm-custom-checkbox" title="Выбрать весь набор">
                        <input type="checkbox" name="selectwordsinonelesson" class="tsm-checkbox-all">
                        <span class="tsm-checkmark"></span>
                    </label>
                    <div>Слово / фраза</div><div></div><div class="tsm-text-right">ID</div><div class="tsm-text-right">${vocabMode === "mobile" ? "Отв." : "%"}</div><div class="tsm-text-center">${tsmIcon("check", 13)}</div>
                </div>
                <div>${rows}</div>
            </div>
        </div>`;
    }).join("");

    document.getElementById("wordsout").innerHTML = html || tsmEmptyState("book", "Ничего не найдено", "Измените поисковый запрос");
    document.querySelectorAll("#wordsout .tsm-words-box").forEach(syncGroupToggle);
    updateSelectionInfo();
}

function syncGroupToggle(box) {
    const toggle = box.querySelector(".tsm-checkbox-all");
    const boxes = Array.from(box.querySelectorAll('[name="checkfordel"]'));
    if (toggle) toggle.checked = boxes.length > 0 && boxes.every((chk) => chk.checked);
}

function updateSelectionInfo() {
    const info = document.getElementById("vocabSelectionInfo");
    info.textContent = selectedWordIds.size ? `Выбрано слов: ${selectedWordIds.size}` : "";
}

function toggleAllWordSelection() {
    const ids = allWordIds();
    const selectAll = ids.some((id) => !selectedWordIds.has(id));
    selectedWordIds.clear();
    if (selectAll) ids.forEach((id) => selectedWordIds.add(id));
    document.querySelectorAll('#wordsout [name="checkfordel"]').forEach((chk) => { chk.checked = selectAll; });
    document.querySelectorAll("#wordsout .tsm-words-box").forEach(syncGroupToggle);
    updateSelectionInfo();
}

function liveSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        renderWordSets(allWordSets, false);
        return;
    }
    const filtered = allWordSets
        .map((set) => ({ title: set.title, words: set.words.filter((w) => w.text.toLowerCase().includes(q)) }))
        .filter((set) => set.words.length > 0);
    renderWordSets(filtered, true);
}

/* =========================================================
   Режим «Мобильное приложение Skyeng Words»
   Работает со словарём аккаунта, под которым вы вошли на сайте
   (токен token_global), через words-gateway — тот же API, что у приложения.
   Запросы идут через фоновый скрипт (CORS-прокси TSM).
   ========================================================= */

const MOBILE_API = "https://words-gateway.skyeng.ru/api";
const MOBILE_BATCH_SIZE = 50;
const MOBILE_BATCH_PAUSE_MS = 1000;
const MOBILE_TAG = "Моб. приложение";

/* Алгоритм тренажёра: слово выучено при 6 и более верных ответах (correctAnswersNumber),
   trainingIntervalsNumber — номер интервала повторения (1–14), длительности в секундах ниже */
const MOBILE_LEARNED_ANSWERS = 6;
const MOBILE_INTERVAL_SECONDS = [1, 3, 25, 60, 150, 360, 1800, 7200, 86400, 432000, 2160000, 5184000, 15552000, 31536000];

function formatInterval(seconds) {
    if (seconds < 60) return `${seconds} с`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} мин`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} ч`;
    return `${Math.round(seconds / 86400)} дн`;
}

function mobileProgressHint(word) {
    const interval = MOBILE_INTERVAL_SECONDS[word.intervals - 1];
    return `Верных ответов: ${word.correct} из ${MOBILE_LEARNED_ANSWERS} (выучено при ${MOBILE_LEARNED_ANSWERS}+)\nИнтервал повторения №${word.intervals}${interval ? ` — ${formatInterval(interval)}` : ""}`;
}

const VOCAB_LABELS = {
    student: {
        learn: ["Выучить", "Отметить выбранные слова выученными"],
        reset: ["Сброс прогресса", "Сбросить прогресс выбранных (или всех) слов"],
        delLearned: ["Удалить выученные", "Удалить все выученные слова"],
        del: ["Удалить", "Удалить выбранные слова (если ничего не выбрано — все)"]
    },
    mobile: {
        learn: ["Выучено", `${MOBILE_TAG}: отметить выбранные слова выученными`],
        reset: ["Сброс прогресса", `${MOBILE_TAG}: сбросить прогресс выбранных (или всех) слов`],
        delLearned: ["Убрать выученные", `${MOBILE_TAG}: убрать из изучения все выученные слова`],
        del: ["Убрать из изучения", `${MOBILE_TAG}: убрать из изучения выбранные слова (если ничего не выбрано — все)`]
    }
};
const VOCAB_BUTTON_IDS = { learn: "learncheckedwords", reset: "unlearnallwords", delLearned: "delunlearnallwords", del: "deleteallwords" };

function setVocabMode(mode) {
    if (mode === vocabMode) return;
    if (isTaskRunning) {
        createNotify("Дождитесь окончания текущей операции или нажмите «Очистить»", "error");
        return;
    }
    /* resetVocabularyState очищает поле ID — при переключении вкладок оставляем введённое значение */
    const idField = document.getElementById("iduserwords");
    const savedStudentId = idField.value;
    resetVocabularyState();
    idField.value = savedStudentId;
    vocabMode = mode;
    const mobile = mode === "mobile";
    wintVocabulary.classList.toggle("tsm-vocab-mobile", mobile);
    document.querySelectorAll("#vocabModeSwitch [data-mode]").forEach((btn) => {
        const active = btn.dataset.mode === mode;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", String(active));
    });
    document.getElementById("vocabMobileBanner").classList.toggle("tsm-hidden", !mobile);
    document.getElementById("vocabModeBadge").classList.toggle("tsm-hidden", !mobile);
    document.getElementById("findwords").textContent = mobile ? "Загрузить мои слова" : "Загрузить";
    for (const [key, id] of Object.entries(VOCAB_BUTTON_IDS)) {
        const btn = document.getElementById(id);
        const [label, title] = VOCAB_LABELS[mode][key];
        btn.querySelector(".label").textContent = label;
        btn.title = title;
    }
    setProgress(0, mobile ? `${MOBILE_TAG}: нажмите «Загрузить мои слова»` : "Введите ID ученика", "");
    renderMobileLog();
}

function renderMobileLog() {
    const box = document.getElementById("vocabMobileLog");
    box.innerHTML = mobileLog.slice(-5).map((e) => `<div>${escapeHTML(e.time)} · ${escapeHTML(e.text)}</div>`).join("");
}

function addMobileLog(text) {
    mobileLog.push({ time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }), text });
    renderMobileLog();
}

function mobileHeaders(withBody) {
    const accessToken = getGlobalToken() || token?.token_global || "";
    if (!accessToken) throw new Error("не найден токен token_global — войдите на сайт Skyeng");
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/json",
        "Accept-Language": "ru",
        "appId": "skyeng.words.prod",
        "Skyeng-Mobile-App-Id": "skyeng.words.prod",
        "Skyeng-Mobile-App-Version": "10.15",
        "User-Agent": "Skyeng/10.15 (7621) Android/16"
    };
    if (withBody) headers["Content-Type"] = "application/json; charset=utf-8";
    return headers;
}

async function mobileFetch(path, { method = "GET", body = null } = {}) {
    const requestOptions = { method, headers: mobileHeaders(body !== null) };
    if (body !== null) requestOptions.body = JSON.stringify(body);
    for (let attempt = 0; attempt < 2; attempt++) {
        const response = await sendRuntimeMessage({ action: "getOvercomeCORS", fetchURL: `${MOBILE_API}${path}`, requestOptions });
        if (response?.success) return response.fetchAnswer ? JSON.parse(response.fetchAnswer) : null;
        const error = response?.error || "нет ответа от расширения";
        if (attempt === 0 && /HTTP 429/.test(error)) {
            await sleep(1500);
            continue;
        }
        throw new Error(error);
    }
}

async function mobileFetchAllPages(buildPath, taskId) {
    const items = [];
    let page = 1;
    let lastPage = 1;
    do {
        if (isTaskStale(taskId)) return items;
        const response = await mobileFetch(buildPath(page));
        items.push(...(response?.data || []));
        lastPage = Number(response?.meta?.lastPage) || 1;
        page++;
    } while (page <= lastPage);
    return items;
}

async function loadMobileWords() {
    const out = document.getElementById("wordsout");
    out.innerHTML = tsmSkeleton(6);
    document.getElementById("searchwordinput").classList.add("tsm-hidden");
    allWordSets = [];
    const taskId = startTask("search", `${MOBILE_TAG}: загружаем наборы…`);

    let sets;
    try {
        sets = await mobileFetchAllPages((page) => `/for-mobile/v2/wordsets.json?pageSize=200&page=${page}&imageWidths=315&subjectArea=english`, taskId);
    } catch (err) {
        if (isTaskStale(taskId)) return;
        console.error("[TSM Словарь/Моб.] Ошибка загрузки наборов:", err);
        finishTask("Ошибка загрузки");
        out.innerHTML = tsmEmptyState("alert", `${MOBILE_TAG}: не удалось загрузить словарь`, `Проверьте, что вы вошли на сайт Skyeng (${err.message})`, tsmRetryButton());
        document.querySelector("#wordsout .tsm-empty-retry")?.addEventListener("click", loadMobileWords);
        createNotify(`${MOBILE_TAG}: не удалось загрузить словарь — ${err.message}`, "error");
        return;
    }
    if (isTaskStale(taskId)) return;
    if (!sets.length) {
        finishTask("Словарь пуст");
        out.innerHTML = tsmEmptyState("book", `В мобильном приложении нет наборов слов`);
        return;
    }

    const records = new Map();
    const loadedSets = new Array(sets.length);
    let done = 0;
    let failedSets = 0;

    await runConcurrentPool({
        items: sets,
        limit: 4,
        taskId,
        worker: async (wordset, index) => {
            try {
                const words = await mobileFetchAllPages((page) => `/for-training/v1/wordsets/${wordset.id}/words.json?pageSize=300&page=${page}&subjectArea=english`, taskId);
                words.forEach((w) => { if (!records.has(String(w.meaningId))) records.set(String(w.meaningId), w); });
                loadedSets[index] = { title: wordset.title, words };
            } catch (err) {
                failedSets++;
                console.error(`[TSM Словарь/Моб.] Ошибка набора ${wordset.title}:`, err);
            }
            done++;
            if (!isTaskStale(taskId)) setProgress(Math.round((done / sets.length) * 100), `${MOBILE_TAG}: наборы ${done}/${sets.length} · слов: ${records.size}`);
        }
    });
    if (isTaskStale(taskId)) return;

    /* Тексты и переводы — публичный словарь, токен не нужен */
    const meanings = new Map();
    const ids = [...records.keys()];
    for (let i = 0; i < ids.length; i += 60) {
        if (isTaskStale(taskId)) return;
        try {
            const list = await fetch(`https://dictionary.skyeng.ru/api/public/v1/meanings?ids=${ids.slice(i, i + 60).join(",")}`).then((r) => (r.ok ? r.json() : []));
            if (Array.isArray(list)) list.forEach((m) => { if (m?.id) meanings.set(String(m.id), m); });
        } catch (mErr) {
            console.warn("[TSM Словарь/Моб.] Не удалось получить тексты слов:", mErr);
        }
    }

    mobileRecords.clear();
    records.forEach((rec, id) => mobileRecords.set(id, rec));
    allWordSets = loadedSets.filter(Boolean).map((set) => ({
        title: set.title,
        words: set.words.map((w) => {
            const m = meanings.get(String(w.meaningId));
            return {
                text: m?.text || `#${w.meaningId}`,
                translation: m?.translation?.text || "",
                isLearned: w.status === "known",
                isHidden: w.status === "hidden",
                progress: null,
                intervals: w.trainingIntervalsNumber ?? 0,
                correct: w.correctAnswersNumber ?? 0,
                mobile: true,
                meaningId: w.meaningId
            };
        })
    }));
    globalWordsCounter = records.size;
    renderWordSets(allWordSets, false);
    document.getElementById("searchwordinput").classList.remove("tsm-hidden");

    const counts = { "in progress": 0, known: 0, hidden: 0 };
    records.forEach((r) => { if (r.status in counts) counts[r.status]++; });
    finishTask(`Слов ${records.size}: учится ${counts["in progress"]} · выучено ${counts.known} · скрыто ${counts.hidden}`);
    if (failedSets) createNotify(`${MOBILE_TAG}: не загружено наборов ${failedSets} из ${sets.length}. Список неполный — нажмите «Загрузить мои слова» ещё раз`, "error");
}

const mobileNow = () => `${new Date().toISOString().slice(0, 19)}+0000`;
const mobileBase = (r) => ({
    id: String(r.id),
    meaningId: r.meaningId,
    trainingIntervalsNumber: r.trainingIntervalsNumber ?? 0,
    correctAnswersNumber: r.correctAnswersNumber ?? 0,
    status: r.status
});

const MOBILE_OPS = {
    reset: {
        title: "Сброс прогресса",
        what: "Будет сброшен прогресс (ступень и счётчик ответов обнулятся, слово вернётся в изучение)",
        skipNote: "скрытые слова не трогаем, иначе они вернулись бы в изучение",
        tone: "warn",
        doneLabel: "Прогресс сброшен",
        pick: (r) => r.status !== "hidden",
        apply: (r, now) => ({ ...mobileBase(r), trainingIntervalsNumber: 0, correctAnswersNumber: 0, status: "in progress", updatedAt: now })
    },
    learn: {
        title: "Отметить выученными",
        what: "Слова будут отмечены выученными (status = known)",
        skipNote: "слова уже выучены",
        tone: "ok",
        doneLabel: "Выучено",
        pick: (r) => r.status !== "known",
        apply: (r, now) => ({ ...mobileBase(r), status: "known", updatedAt: now })
    },
    hide: {
        title: "Убрать из изучения",
        what: "Слова будут убраны из изучения (status = hidden) и пропадут из приложения",
        skipNote: "слова уже скрыты",
        tone: "bad",
        doneLabel: "Убрано из изучения",
        pick: (r) => r.status !== "hidden",
        apply: (r, now) => ({ ...mobileBase(r), status: "hidden", updatedAt: now })
    }
};

/* Отправка записей пачками: синхронизация одним запросом на пачку, пауза между пачками */
async function postMobileBatches(words, taskId, label) {
    const okIds = [];
    let failed = 0;
    for (let i = 0; i < words.length; i += MOBILE_BATCH_SIZE) {
        while (isTaskPaused && !isTaskStale(taskId)) await sleep(200);
        if (isTaskStale(taskId)) return { okIds, failed, stopped: true };
        const batch = words.slice(i, i + MOBILE_BATCH_SIZE);
        try {
            await mobileFetch("/v1/words/synchronize.json?subjectArea=english", { method: "POST", body: { currentDateTime: mobileNow(), words: batch } });
            batch.forEach((w) => okIds.push(String(w.meaningId)));
        } catch (err) {
            failed += batch.length;
            console.error("[TSM Словарь/Моб.] Ошибка пачки:", err);
            createNotify(`${MOBILE_TAG}: пачка из ${batch.length} слов не записана — ${err.message}`, "error");
        }
        const handled = Math.min(i + MOBILE_BATCH_SIZE, words.length);
        setProgress(Math.round((handled / words.length) * 100), `${label}: ${handled} / ${words.length}${failed ? ` · ошибок: ${failed}` : ""}`);
        if (handled < words.length) await sleep(MOBILE_BATCH_PAUSE_MS);
    }
    return { okIds, failed, stopped: false };
}

async function runMobileOperation(opKey, requestedIds, scopeNote) {
    if (isTaskRunning) {
        createNotify("Дождитесь окончания текущей операции", "error");
        return false;
    }
    if (!mobileRecords.size) {
        createNotify(`${MOBILE_TAG}: сначала нажмите «Загрузить мои слова»`, "error");
        return false;
    }
    const op = MOBILE_OPS[opKey];
    const targets = requestedIds.map((id) => mobileRecords.get(String(id))).filter(Boolean).filter(op.pick);
    const skipped = requestedIds.length - targets.length;
    if (!targets.length) {
        createNotify(`${MOBILE_TAG}: нет слов для операции — ${op.skipNote}`, "error");
        return false;
    }

    const confirmed = await tsmConfirm({
        title: `📱 ${MOBILE_TAG}: ${op.title}`,
        message: `Это словарь мобильного приложения Skyeng Words — аккаунта, под которым вы вошли на сайте, а не ученика.\n\n${op.what}: ${targets.length} шт.${skipped ? `\nПропущено: ${skipped} (${op.skipNote}).` : ""}\n${scopeNote}`,
        okText: "Выполнить",
        danger: true
    });
    if (!confirmed) return false;

    const now = mobileNow();
    const taskId = startTask(op.tone, `${MOBILE_TAG}: 0 / ${targets.length}`);
    const { okIds, failed, stopped } = await postMobileBatches(targets.map((r) => op.apply(r, now)), taskId, MOBILE_TAG);
    if (stopped) {
        addMobileLog(`${op.title}: остановлено, записано ${okIds.length} из ${targets.length}`);
        return false;
    }

    finishTask(failed ? `${op.doneLabel}, ошибок: ${failed}` : op.doneLabel);
    addMobileLog(`${op.title}: ${okIds.length} слов${failed ? `, ошибок ${failed}` : ""}`);
    const summary = `${MOBILE_TAG}: ${op.doneLabel.toLowerCase()} — ${okIds.length} слов${failed ? `, не обработано ${failed}` : ""}`;
    createNotify(summary, failed ? "error" : "message");
    selectedWordIds.clear();
    await loadMobileWords();
    return true;
}

const mobileScope = () => (selectedWordIds.size ? `Затронуты выбранные слова (${selectedWordIds.size}).` : "Ничего не выбрано — затронуты ВСЕ слова словаря.");
const mobileTargets = () => (selectedWordIds.size ? [...selectedWordIds] : allWordIds());

function mobileResetSelected() { return runMobileOperation("reset", mobileTargets(), mobileScope()); }
function mobileHideSelected() { return runMobileOperation("hide", mobileTargets(), mobileScope()); }
function mobileLearnSelected() {
    if (!selectedWordIds.size) {
        createNotify("Отметьте слова, которые нужно сделать выученными", "error");
        return;
    }
    return runMobileOperation("learn", [...selectedWordIds], mobileScope());
}
function mobileHideLearned() {
    const learned = [...mobileRecords.values()].filter((r) => r.status === "known").map((r) => String(r.meaningId));
    if (!learned.length) {
        createNotify(`${MOBILE_TAG}: выученных слов нет`, "error");
        return;
    }
    return runMobileOperation("hide", learned, "Затронуты все выученные слова.");
}

/* ---------- Делегированные обработчики ---------- */

const wordsOut = document.getElementById("wordsout");

wordsOut.addEventListener("click", async (event) => {
    const title = event.target.closest(".tsm-wordset-title");
    if (title) {
        const box = title.nextElementSibling;
        const open = !box.classList.toggle("tsm-hidden");
        title.classList.toggle("active", open);
        return;
    }
    const copyBtn = event.target.closest('[data-action="copy-word"]');
    if (copyBtn) {
        const id = copyBtn.closest(".tsm-word-row").dataset.wordId;
        if (await copyWithNotify(`https://dictionary.skyeng.ru/cms/meaning/${id}`, "Ссылка на слово в CMS скопирована")) flashButton(copyBtn, "✓");
    }
});

wordsOut.addEventListener("keydown", (event) => {
    const title = event.target.closest(".tsm-wordset-title");
    if (title && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        title.click();
    }
});

wordsOut.addEventListener("change", (event) => {
    const box = event.target.closest(".tsm-words-box");
    if (!box) return;
    if (event.target.classList.contains("tsm-checkbox-all")) {
        box.querySelectorAll('[name="checkfordel"]').forEach((chk) => {
            chk.checked = event.target.checked;
            const id = chk.closest(".tsm-word-row").dataset.wordId;
            if (chk.checked) selectedWordIds.add(id);
            else selectedWordIds.delete(id);
        });
    } else if (event.target.name === "checkfordel") {
        const id = event.target.closest(".tsm-word-row").dataset.wordId;
        if (event.target.checked) selectedWordIds.add(id);
        else selectedWordIds.delete(id);
        syncGroupToggle(box);
    }
    updateSelectionInfo();
});

document.getElementById("searchwordinput").addEventListener("input", function () { liveSearch(this.value); });

document.getElementById("btnPause").onclick = () => {
    isTaskPaused = true;
    setPauseControls(true);
};
document.getElementById("btnResume").onclick = () => {
    isTaskPaused = false;
    setPauseControls(true);
};

function startWordSearch() {
    if (isTaskRunning) {
        createNotify("Дождитесь окончания текущей операции или нажмите «Очистить»", "error");
        return;
    }
    document.getElementById("searchwordinput").value = "";
    selectedWordIds.clear();
    if (vocabMode === "mobile") {
        loadMobileWords();
        return;
    }
    getwordsets(document.getElementById("iduserwords").value.trim());
}

document.getElementById("findwords").onclick = startWordSearch;
document.getElementById("iduserwords").addEventListener("keydown", (e) => { if (e.key === "Enter") startWordSearch(); });
document.getElementById("ClearVocabulary").onclick = resetVocabularyState;
document.getElementById("hideVocabularyMenu").onclick = () => {
    resetVocabularyState();
    wintVocabulary.style.display = "none";
};
document.getElementById("selectallwords").onclick = toggleAllWordSelection;
document.getElementById("delunlearnallwords").onclick = () => (vocabMode === "mobile" ? mobileHideLearned() : deleteLearnedWords());
document.getElementById("learncheckedwords").onclick = () => (vocabMode === "mobile" ? mobileLearnSelected() : learnSelectedWords());
document.getElementById("unlearnallwords").onclick = () => (vocabMode === "mobile" ? mobileResetSelected() : resetProgressForSelectedWords());
document.getElementById("deleteallwords").onclick = () => (vocabMode === "mobile" ? mobileHideSelected() : deleteSelectedWords());
document.getElementById("vocabModeSwitch").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-mode]");
    if (btn) setVocabMode(btn.dataset.mode);
});

async function OpenVocabularyMenu() {
    if (!toggleTSMWindow(wintVocabulary)) return;
    if (vocabMode === "mobile") return;
    const idField = document.getElementById("iduserwords");
    if (idField.value.trim()) return;
    const userId = await getUserId();
    if (userId) {
        idField.value = userId;
        startWordSearch();
    } else {
        idField.focus();
    }
}
