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
        <span class="tsm-window-title">📚 Словарь</span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="ClearVocabulary" title="Очистить и остановить операции">🧹</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" title="Скрыть" aria-label="Скрыть" id="hideVocabularyMenu">✕</button>
    </div>
    <div id="vocabularbar" class="tsm-vocab-bar">
        <div id="searchtoolswords" class="tsm-input-group">
            <input id="iduserwords" class="tsm-input" inputmode="numeric" autocomplete="off" placeholder="ID ученика">
            <button type="button" id="findwords" class="tsm-btn">Загрузить</button>
        </div>
        <div class="tsm-flex-row tsm-mb-8">
            <div class="tsm-progress-wrapper" id="tsm-progress-container">
                <div id="dynamicProgressBar" class="tsm-progress-base" style="width:0%;"></div>
                <span id="tsm-progress-label" class="tsm-progress-label">Введите ID ученика</span>
            </div>
            <button type="button" class="tsm-btn-pause" id="btnPause" title="Пауза" style="display:none;">⏸</button>
            <button type="button" class="tsm-btn-resume" id="btnResume" title="Продолжить" style="display:none;">▶</button>
        </div>
        <div class="tsm-vocab-tools">
            <button type="button" class="tsm-btn-vertical" id="selectallwords" title="Выделить / снять выделение со всех слов">
                <span class="emoji">☑</span><span class="label">Выбрать все</span>
            </button>
            <button type="button" class="tsm-btn-vertical tsm-tone-ok" id="learncheckedwords" title="Отметить выбранные слова выученными">
                <span class="emoji">✅</span><span class="label">Выучить</span>
            </button>
            <button type="button" class="tsm-btn-vertical tsm-tone-warn" id="unlearnallwords" title="Сбросить прогресс выбранных (или всех) слов">
                <span class="emoji">⭕</span><span class="label">Сброс прогресса</span>
            </button>
            <button type="button" class="tsm-btn-vertical tsm-tone-bad" id="delunlearnallwords" title="Удалить все выученные слова">
                <span class="emoji">⛔</span><span class="label">Удалить выученные</span>
            </button>
            <button type="button" class="tsm-btn-vertical tsm-tone-bad" id="deleteallwords" title="Удалить выбранные слова (если ничего не выбрано — все)">
                <span class="emoji">❌</span><span class="label">Удалить</span>
            </button>
        </div>
        <input id="searchwordinput" class="tsm-input" style="display:none;" autocomplete="off" placeholder="Поиск по слову">
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
    if (tone) bar.dataset.tone = tone;
    document.getElementById("tsm-progress-label").textContent = label;
}

function setPauseControls(running) {
    document.getElementById("btnPause").style.display = running && !isTaskPaused ? "inline-flex" : "none";
    document.getElementById("btnResume").style.display = running && isTaskPaused ? "inline-flex" : "none";
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
    search.style.display = "none";
    setProgress(0, "Введите ID ученика", "");
    setPauseControls(false);
    updateSelectionInfo();
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
    const taskId = startTask(tone, `0 / ${targetIds.length}`);

    for (let i = 0; i < targetIds.length; i++) {
        while (isTaskPaused && !isTaskStale(taskId)) await sleep(300);
        if (isTaskStale(taskId)) return false;

        try {
            const res = await request(targetIds[i], studentId);
            if (!res.ok) failed++;
        } catch (err) {
            failed++;
            console.error(`[TSM Словарь] Ошибка операции над словом ${targetIds[i]}:`, err);
        }

        const percent = Math.round(((i + 1) / targetIds.length) * 100);
        setProgress(percent, `${i + 1} / ${targetIds.length}${failed ? ` · ошибок: ${failed}` : ""}`);
        await sleep(150);
    }

    finishTask(failed ? `${doneLabel}, ошибок: ${failed}` : doneLabel);
    createNotify(failed ? `${successMessage}, но ${failed} из ${targetIds.length} не обработаны` : successMessage, failed ? "error" : "message");
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
    document.getElementById("searchwordinput").style.display = "none";
    const taskId = startTask("search", "Загружаем наборы слов…");

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
        out.innerHTML = `<div class="tsm-empty">Не удалось загрузить словарь (${escapeHTML(err.message)}). Проверьте ID ученика и авторизацию.</div>`;
        return;
    }

    if (isTaskStale(taskId)) return;
    const sets = wordsetsResponse?.data || [];
    if (!sets.length) {
        finishTask("Словарь пуст");
        out.innerHTML = '<div class="tsm-empty">У ученика нет слов в словаре</div>';
        return;
    }

    for (let i = 0; i < sets.length; i++) {
        while (isTaskPaused && !isTaskStale(taskId)) await sleep(300);
        if (isTaskStale(taskId)) return;

        const wordset = sets[i];
        try {
            const setWords = await fetch(
                `https://api-words.skyeng.ru/api/v1/wordsets/${wordset.id}/words.json?wordsetId=${wordset.id}&studentId=${studentId}&page=1&pageSize=500`,
                { headers: WORDS_API_HEADERS() }
            ).then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            });
            const words = setWords?.data || [];

            let meaningsById = new Map();
            if (words.length) {
                const ids = words.map((w) => w.meaningId).join(",");
                const meanings = await fetch(`https://dictionary.skyeng.ru/api/for-services/v2/meanings?ids=${ids}&acceptLanguage=ru`, { headers: WORDS_API_HEADERS() })
                    .then((r) => (r.ok ? r.json() : []));
                /* FIX: сопоставление шло по индексу массива — если словарь возвращал значения
                   в другом порядке или без части ID, слова получали чужие названия */
                meaningsById = new Map((Array.isArray(meanings) ? meanings : []).map((m) => [String(m.id), m]));
            }

            const wordSetData = {
                title: wordset.title,
                words: words.map((w) => ({
                    text: meaningsById.get(String(w.meaningId))?.text || `#${w.meaningId}`,
                    isLearned: w.isLearned,
                    progress: w.progress ?? 0,
                    meaningId: w.meaningId
                }))
            };
            if (isTaskStale(taskId)) return;
            globalWordsCounter += wordSetData.words.length;
            allWordSets.push(wordSetData);
        } catch (err) {
            console.error("[TSM Словарь] Ошибка загрузки набора " + wordset.title, err);
        }

        setProgress(Math.round(((i + 1) / sets.length) * 100), `Наборы ${i + 1}/${sets.length} · слов: ${globalWordsCounter}`);
        await sleep(120);
    }

    if (isTaskStale(taskId)) return;
    renderWordSets(allWordSets, false);
    document.getElementById("searchwordinput").style.display = "";
    finishTask(`Найдено слов: ${globalWordsCounter} в ${allWordSets.length} наборах`);
}

/* ---------- Рендер ---------- */

function renderWordSets(wordSets, isSearch = false) {
    const html = wordSets.map((wordSet) => {
        const learned = wordSet.words.filter((w) => w.isLearned).length;
        const rows = wordSet.words.map((word) => {
            const id = escapeHTML(word.meaningId);
            return `<div class="tsm-word-row${word.isLearned ? " is-learned" : ""}" data-word-id="${id}">
                <label class="tsm-custom-checkbox">
                    <input type="checkbox" name="checkfordel" class="tsm-checkbox" ${selectedWordIds.has(String(word.meaningId)) ? "checked" : ""}>
                    <span class="tsm-checkmark"></span>
                </label>
                <div class="tsm-word-text" title="${escapeHTML(word.text)}">${escapeHTML(word.text)}</div>
                <button type="button" class="tsm-btn-save-word" data-action="copy-word" title="Скопировать ссылку в CMS">💾</button>
                <div class="tsm-word-id tsm-word-stat">${id}</div>
                <div class="tsm-word-stat">${escapeHTML(word.progress)}%</div>
                <div class="tsm-learned-status" title="${word.isLearned ? "Выучено" : "Не выучено"}">${word.isLearned ? "✓" : "·"}</div>
            </div>`;
        }).join("");

        return `<div class="tsm-wordset">
            <div class="tsm-wordset-title" role="button" tabindex="0">
                <span class="tsm-wordset-name">${escapeHTML(wordSet.title)}</span>
                <span class="tsm-wordset-count" title="Выучено / всего">${learned}/${wordSet.words.length}</span>
            </div>
            <div class="tsm-words-box" style="display:${isSearch ? "block" : "none"};">
                <div class="tsm-word-row tsm-word-row-header">
                    <label class="tsm-custom-checkbox" title="Выбрать весь набор">
                        <input type="checkbox" name="selectwordsinonelesson" class="tsm-checkbox-all">
                        <span class="tsm-checkmark"></span>
                    </label>
                    <div>Слово / фраза</div><div></div><div class="tsm-text-right">ID</div><div class="tsm-text-right">%</div><div class="tsm-text-center">✓</div>
                </div>
                <div class="tsm-words-grid-body">${rows}</div>
            </div>
        </div>`;
    }).join("");

    document.getElementById("wordsout").innerHTML = html || '<div class="tsm-empty">Ничего не найдено</div>';
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

/* ---------- Делегированные обработчики ---------- */

const wordsOut = document.getElementById("wordsout");

wordsOut.addEventListener("click", async (event) => {
    const title = event.target.closest(".tsm-wordset-title");
    if (title) {
        const box = title.nextElementSibling;
        box.style.display = box.style.display === "block" ? "none" : "block";
        title.classList.toggle("active", box.style.display === "block");
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
    document.getElementById("searchwordinput").value = "";
    selectedWordIds.clear();
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
document.getElementById("delunlearnallwords").onclick = deleteLearnedWords;
document.getElementById("learncheckedwords").onclick = learnSelectedWords;
document.getElementById("unlearnallwords").onclick = resetProgressForSelectedWords;
document.getElementById("deleteallwords").onclick = deleteSelectedWords;

document.getElementById("VocabularyMenu").onclick = async () => {
    if (!toggleTSMWindow(wintVocabulary)) return;
    const idField = document.getElementById("iduserwords");
    if (idField.value.trim()) return;
    const userId = await getUserId();
    if (userId) {
        idField.value = userId;
        startWordSearch();
    } else {
        idField.focus();
    }
};
