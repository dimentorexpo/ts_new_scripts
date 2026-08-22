/* =========================================================
   TSM Vocabulary
   ========================================================= */

let allWordSets = [];
let globalWordsCounter = 0;
let isTaskPaused = false;
let isTaskCancelled = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const WORDS_API_HEADERS = () => ({
    "accept": "application/json, text/plain, */*",
    "authorization": `Bearer ${token.token_global}`
});

var win_Vocabulary = `<div style="display: flex;">
    <span style="cursor: -webkit-grab;">
        <div style="margin: 5px; width:500px;">
            <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hideVocabularyMenu">hide</button>
            <button class="tsm-btn tsm-btn-sm" id="ClearVocabulary" title="Очистить всё и прервать процессы" style="margin: 5px;">🧹</button>
            
            <div style="display: flex; align-items: center; gap: 8px; margin: 10px 5px 5px 5px;">
                <div class="tsm-progress-wrapper" id="tsm-progress-container">
                    <div id="dynamicProgressBar" class="tsm-progress-base" style="width: 0%;">Ожидание...</div>
                </div>
                <button class="tsm-btn-sm tsm-btn-pause" id="btnPause" title="Пауза" style="display:none; font-size:12px;">⏸</button>
                <button class="tsm-btn-sm tsm-btn-resume" id="btnResume" title="Продолжить" style="display:none; font-size:12px;">▶</button>
            </div>

        </div>
        <div id="vocabularbar" class="tsm-vocab-bar">
            <div id="searchtoolswords" style="margin: 5px; width:500px;">
                <input id="iduserwords" class="tsm-input" style="width: 450px;text-align: center; height: 30px; border-radius:14px;" placeholder="Enter student ID to get vocabulary info">
                <button id="findwords" class="tsm-btn tsm-btn-sm">🔎</button>
            </div>
            <div class="tsm-vocab-tools">
                <button class="tsm-btn-vertical" id="deleteallwords" title="Удаляет все выделенные слова, если ничего не выделено удалит все">
                    <div class="emoji">❌</div><hr><div class="label">Удалить</div>
                </button>
                <button class="tsm-btn-vertical" id="unlearnallwords" title="Сбрасывает прогресс выученных слов">
                    <div class="emoji">⭕</div><hr><div class="label">Сброс прогресса</div>
                </button>
                <button class="tsm-btn-vertical" id="delunlearnallwords" title="Удаляет все выученные слова">
                    <div class="emoji">⛔</div><hr><div class="label">Удалить выученные</div>
                </button>
                <button class="tsm-btn-vertical" id="learncheckedwords" title="Делает слово выученным">
                    <div class="emoji">✅</div><hr><div class="label">Выучить</div>
                </button>
                <button class="tsm-btn-vertical" id="selectallwords" title="Выделяет все слова">
                    <div class="emoji">☑</div><hr><div class="label">Выбрать все</div>
                </button>
            </div>
            <div class="tsm-vocab-tools">
                <input id="searchwordinput" class="tsm-input" style="width: 470px; text-align: center; height: 30px; display: none; margin-top: 7px;" placeholder="Введите слово или его часть для живого поиска">
            </div>
        </div>
        <div id="wordsout" class="tsm-words-out"></div>
        <div id="totalWords"></div>
    </span>
</div>`;

const wintVocabulary = createTSMWindow("AFMS_Vocabulary", "winTopVocabulary", "winLeftVocabulary", win_Vocabulary);
wintVocabulary.className = "tsm-window tsm-window-vocabulary";

document.getElementById("VocabularyMenu").onclick = function () {
    const willShow = wintVocabulary.style.display === "none";
    wintVocabulary.style.display = willShow ? "" : "none";
    document.getElementById("vocabularbar").style.display = willShow ? "" : "none";
    if (willShow) firstgetvocabulary(document.getElementById("iduserwords"));

    document.getElementById("btnPause").onclick = function () {
        isTaskPaused = true;
        this.style.display = "none";
        document.getElementById("btnResume").style.display = "inline-flex";
    };

    document.getElementById("btnResume").onclick = function () {
        isTaskPaused = false;
        this.style.display = "none";
        document.getElementById("btnPause").style.display = "inline-flex";
    };

    document.getElementById("findwords").onclick = function () {
        document.getElementById("searchwordinput").value = "";
        globalWordsCounter = 0;
        document.getElementById("searchwordinput").style.display = "none";
        getwordsets(document.getElementById("iduserwords").value.trim());
    };

    document.getElementById("ClearVocabulary").onclick = resetVocabularyState;

    document.getElementById("hideVocabularyMenu").onclick = function () {
        resetVocabularyState();
        wintVocabulary.style.display = "none";
    };

    document.getElementById("selectallwords").onclick = toggleAllWordSelection;
    document.getElementById("delunlearnallwords").onclick = deleteLearnedWords;
    document.getElementById("learncheckedwords").onclick = learnSelectedWords;
    document.getElementById("unlearnallwords").onclick = resetProgressForSelectedWords;
    document.getElementById("deleteallwords").onclick = deleteSelectedWords;
};

function resetProgressBars() {
    const pbWrapper = document.getElementById("tsm-progress-container");
    if (!pbWrapper) return;
    const pb = pbWrapper.firstElementChild;
    pb.id = "dynamicProgressBar";
    pb.style.width = "0%";
    pb.textContent = "Ожидание...";
}

function resetVocabularyState() {
    isTaskCancelled = true;
    isTaskPaused = false;

    document.getElementById("wordsout").innerHTML = "";
    document.getElementById("iduserwords").value = "";
    allWordSets = [];
    document.getElementById("searchwordinput").value = "";
    document.getElementById("searchwordinput").style.display = "none";

    resetProgressBars();
    document.getElementById("btnPause").style.display = "none";
    document.getElementById("btnResume").style.display = "none";
}

/* ---------- Прогресс-бар ---------- */

function setupProgressBar(actionId, startText) {
    const pbWrapper = document.getElementById("tsm-progress-container");
    const pb = pbWrapper.firstElementChild;

    pb.id = actionId;
    pb.style.width = "0%";
    pb.textContent = startText || "0%";

    document.getElementById("btnPause").style.display = "inline-flex";
    document.getElementById("btnResume").style.display = "none";
    isTaskPaused = false;
    isTaskCancelled = false;
    return pb;
}

function finishProgressBar(pb, endText) {
    if (isTaskCancelled) return;
    pb.style.width = "100%";
    pb.textContent = endText || "ГОТОВО!";
    document.getElementById("btnPause").style.display = "none";
    document.getElementById("btnResume").style.display = "none";
}

/* ---------- Универсальный батч-раннер ---------- */

async function runBatchOperation({ targetIds, studentId, confirmMessage, barId, doneLabel, successMessage, request }) {
    const confirmed = await tsmConfirm({
        title: "Подтверждение операции",
        message: confirmMessage,
        okText: "Да, выполнить",
        danger: true
    });
    if (!confirmed) return false;

    const progressBar = setupProgressBar(barId, `0 / ${targetIds.length}`);

    for (let i = 0; i < targetIds.length; i++) {
        while (isTaskPaused && !isTaskCancelled) await sleep(300);
        if (isTaskCancelled) return false;

        try {
            await request(targetIds[i], studentId);
        } catch (err) {
            console.error(`Ошибка операции над словом ${targetIds[i]}:`, err);
        }

        if (!isTaskCancelled) {
            const percent = Math.round(((i + 1) / targetIds.length) * 100);
            progressBar.style.width = percent + "%";
            progressBar.textContent = `${percent}% (${i + 1}/${targetIds.length})`;
        }
        await sleep(150);
    }

    if (isTaskCancelled) return false;

    finishProgressBar(progressBar, doneLabel);
    createNotify(successMessage);
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

function collectCheckedIds({ fallbackToAll }) {
    const rows = document.querySelectorAll(".tsm-word-row:not(.tsm-word-row-header)");
    const checked = [];
    const all = [];

    rows.forEach((row) => {
        const wordId = row.querySelector(".tsm-word-id")?.textContent;
        if (!wordId) return;
        all.push(wordId);
        if (row.querySelector('[name="checkfordel"]')?.checked) checked.push(wordId);
    });

    return checked.length ? checked : (fallbackToAll ? all : []);
}

/* ---------- Публичные операции ---------- */

async function deleteLearnedWords() {
    const learnedIds = Array.from(document.querySelectorAll(".tsm-word-row"))
        .filter((row) => row.querySelector(".tsm-learned-status")?.textContent.includes("✔"))
        .map((row) => row.querySelector(".tsm-word-id")?.textContent)
        .filter(Boolean);

    if (!learnedIds.length) {
        createNotify("Выученных слов в кабинете ученика нет.", "error");
        return;
    }

    await runBatchOperation({
        targetIds: learnedIds,
        studentId: document.getElementById("iduserwords").value.trim(),
        confirmMessage: "Вы уверены, что хотите удалить ВСЕ выученные слова?",
        barId: "progressBarDeleteLearned",
        doneLabel: "УДАЛЕНО!",
        successMessage: "Все выученные слова были успешно удалены 😏",
        request: WORD_OPERATIONS.delete
    });
}

async function learnSelectedWords() {
    const targetIds = collectCheckedIds({ fallbackToAll: false });

    if (!targetIds.length) {
        createNotify("Нет выбранных слов для изменения статуса. Отметьте их.", "error");
        return;
    }

    await runBatchOperation({
        targetIds,
        studentId: document.getElementById("iduserwords").value.trim(),
        confirmMessage: "Вы уверены, хотите отметить выбранные слова как 'выученные'?",
        barId: "progressBarLearn",
        doneLabel: "ВЫУЧЕНО!",
        successMessage: "Выбранные слова были успешно выучены 😏",
        request: WORD_OPERATIONS.learn
    });
}

async function resetProgressForSelectedWords() {
    const hasSelection = Boolean(document.querySelector('.tsm-word-row:not(.tsm-word-row-header) [name="checkfordel"]:checked'));
    const targetIds = collectCheckedIds({ fallbackToAll: true });

    await runBatchOperation({
        targetIds,
        studentId: document.getElementById("iduserwords").value.trim(),
        confirmMessage: hasSelection
            ? "Вы выбрали некоторые пункты для сброса прогресса. Продолжить?"
            : "Будет автоматически сброшен прогресс для всех слов. Продолжить?",
        barId: "progressBarReset",
        doneLabel: "СБРОШЕНО!",
        successMessage: "Прогресс слов был успешно сброшен! 🤠",
        request: WORD_OPERATIONS.resetProgress
    });
}

async function deleteSelectedWords() {
    const hasSelection = Boolean(document.querySelector('.tsm-word-row:not(.tsm-word-row-header) [name="checkfordel"]:checked'));
    const targetIds = collectCheckedIds({ fallbackToAll: true });

    await runBatchOperation({
        targetIds,
        studentId: document.getElementById("iduserwords").value.trim(),
        confirmMessage: hasSelection
            ? "Вы выбрали некоторые пункты для удаления слов. Продолжить?"
            : "Будут автоматически удалены все слова из словаря. Продолжить?",
        barId: "progressBarDelete",
        doneLabel: "УДАЛЕНО!",
        successMessage: "Слова были успешно удалены! 🤠",
        request: WORD_OPERATIONS.delete
    });
}

/* ---------- Загрузка словаря ---------- */

async function firstgetvocabulary(idfield) {
    const userId = await getUserId();
    idfield.value = userId;
    if (idfield.value && idfield.value.trim() !== "") {
        document.getElementById("findwords").click();
    }
}

function toggleAllWordSelection() {
    const checkboxes = Array.from(document.getElementsByName("checkfordel"));
    const groupToggles = Array.from(document.getElementsByName("selectwordsinonelesson"));
    const areAllChecked = checkboxes.every((chk) => chk.checked);
    checkboxes.forEach((chk) => { chk.checked = !areAllChecked; });
    groupToggles.forEach((chk) => { chk.checked = !areAllChecked; });
}

async function getwordsets(studentId) {
    allWordSets = [];
    document.getElementById("wordsout").innerHTML = "";
    globalWordsCounter = 0;

    const progressBar = setupProgressBar("progressBarSearch", "Загрузка наборов...");

    const wordsetsarr = await fetch("https://api-words.skyeng.ru/api/for-vimbox/v1/wordsets.json?studentId=" + studentId + "&pageSize=500", {
        headers: WORDS_API_HEADERS()
    }).then((r) => r.json());

    if (wordsetsarr.meta.total <= 0) {
        document.getElementById("wordsout").innerHTML = '<span style="margin-left:40%; color:bisque;">Словарь пустой!</span>';
        if (!isTaskCancelled) finishProgressBar(progressBar, "СЛОВАРЬ ПУСТ");
        return;
    }

    const totalSets = wordsetsarr.data.length;

    for (let i = 0; i < totalSets; i++) {
        while (isTaskPaused && !isTaskCancelled) await sleep(300);
        if (isTaskCancelled) break;

        const wordset = wordsetsarr.data[i];
        const wordSetData = { title: wordset.title, words: [] };

        const objectwdsets = await fetch(`https://api-words.skyeng.ru/api/v1/wordsets/${wordset.id}/words.json?wordsetId=${wordset.id}&studentId=${studentId}&page=1&pageSize=500`, {
            headers: WORDS_API_HEADERS()
        }).then((r) => r.json());

        globalWordsCounter += objectwdsets.data.length;
        const meanings = objectwdsets.data.map((word) => word.meaningId).toString();

        const wordsnames = await fetch("https://dictionary.skyeng.ru/api/for-services/v2/meanings?ids=" + meanings + "&acceptLanguage=ru", {
            headers: WORDS_API_HEADERS()
        }).then((r) => r.json());

        for (let j = 0; j < objectwdsets.data.length; j++) {
            if (wordsnames[j] != undefined) {
                wordSetData.words.push({
                    text: wordsnames[j].text || "",
                    isLearned: objectwdsets.data[j].isLearned,
                    progress: objectwdsets.data[j].progress,
                    meaningId: objectwdsets.data[j].meaningId
                });
            }
        }

        allWordSets.push(wordSetData);

        if (!isTaskCancelled) {
            renderWordSets(allWordSets, false);
            document.getElementById("searchwordinput").style.display = "";

            const percent = Math.round(((i + 1) / totalSets) * 100);
            progressBar.style.width = percent + "%";
            progressBar.textContent = `Парсинг: ${percent}% (${globalWordsCounter} слов)`;
        }

        await sleep(150);
    }

    if (!isTaskCancelled) finishProgressBar(progressBar, `НАЙДЕНО: ${globalWordsCounter} слов`);
}

/* ---------- Рендер ---------- */

function renderWordSets(wordSets, isSearch = false) {
    let htmlContent = "";

    for (const wordSet of wordSets) {
        let wordsHtml = "";
        let displayBox = "none";

        for (const word of wordSet.words) {
            const learnedIcon = word.isLearned
                ? '<span style="color:var(--tsm-neon-lime); text-shadow:0 0 5px var(--tsm-neon-lime);">✔</span>'
                : '<span style="color:var(--tsm-text-dim);">❌</span>';

            wordsHtml += `
                <div class="tsm-word-row">
                    <label class="tsm-custom-checkbox">
                        <input type="checkbox" name="checkfordel" class="tsm-checkbox">
                        <span class="tsm-checkmark"></span>
                    </label>
                    <div class="tsm-word-text" title="${word.text}">${word.text}</div>
                    <div class="tsm-btn-save-word" title="Скопировать ссылку CMS" style="cursor:pointer; text-align:center;">💾</div>
                    <div class="tsm-word-id tsm-word-stat">${word.meaningId}</div>
                    <div class="tsm-word-stat">${word.progress}%</div>
                    <div class="tsm-learned-status tsm-word-stat" style="text-align:center;">${learnedIcon}</div>
                </div>`;
        }

        if (isSearch && wordSet.words.length > 0) displayBox = "block";

        htmlContent += `
            <div class="tsm-wordset-title">${wordSet.title} (${wordSet.words.length})</div>
            <div class="tsm-words-box" style="display:${displayBox}; padding: 0;">
                <div class="tsm-word-row tsm-word-row-header">
                    <label class="tsm-custom-checkbox">
                        <input type="checkbox" name="selectwordsinonelesson" class="tsm-checkbox-all">
                        <span class="tsm-checkmark"></span>
                    </label>
                    <div>Слово / Фраза</div>
                    <div></div>
                    <div style="text-align:right;">ID</div>
                    <div style="text-align:right;">%</div>
                    <div style="text-align:center;">Статус</div>
                </div>
                <div class="tsm-words-grid-body">${wordsHtml}</div>
            </div>`;
    }

    document.getElementById("wordsout").innerHTML = htmlContent;
    setupWordSetToggle();
    setupSelectAllWordsInSet();
    setupLinkCopyToClipboard();
}

function setupWordSetToggle() {
    const titles = Array.from(document.getElementsByClassName("tsm-wordset-title"));
    const boxes = Array.from(document.getElementsByClassName("tsm-words-box"));
    titles.forEach((title, i) => {
        title.onclick = () => {
            boxes[i].style.display = boxes[i].style.display === "block" ? "none" : "block";
        };
    });
}

function setupSelectAllWordsInSet() {
    document.querySelectorAll(".tsm-checkbox-all").forEach((groupToggle) => {
        groupToggle.addEventListener("change", function () {
            const group = this.closest(".tsm-words-box").querySelectorAll('[name="checkfordel"]');
            group.forEach((chk) => { chk.checked = this.checked; });
        });
    });

    document.querySelectorAll('[name="checkfordel"]').forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            const box = this.closest(".tsm-words-box");
            const groupToggle = box.querySelector(".tsm-checkbox-all");
            if (!groupToggle) return;
            const group = box.querySelectorAll('[name="checkfordel"]');
            groupToggle.checked = Array.from(group).every((chk) => chk.checked);
        });
    });
}

function setupLinkCopyToClipboard() {
    document.querySelectorAll(".tsm-btn-save-word").forEach((btn) => {
        btn.onclick = () => {
            const wordId = btn.closest(".tsm-word-row").querySelector(".tsm-word-id").textContent;
            copyToClipboardTSM("https://dictionary.skyeng.ru/cms/meaning/" + wordId);
        };
    });
}

document.getElementById("searchwordinput").addEventListener("input", function () {
    liveSearch(this.value);
});

function liveSearch(query) {
    query = query.toLowerCase().trim();
    if (query === "") {
        renderWordSets(allWordSets, false);
        return;
    }
    const filteredWordSets = allWordSets
        .map((wordSet) => ({ title: wordSet.title, words: wordSet.words.filter((word) => word.text.toLowerCase().includes(query)) }))
        .filter((wordSet) => wordSet.words.length > 0);
    renderWordSets(filteredWordSets, true);
}
