/* =========================================================
   TSM Vocabulary — NEON GLASS ULTRA Refactored (FIXED 2.0)
   ========================================================= */

let allWordSets =[];
let checkedarray =[];
let globalWordsCounter = 0;

// Глобальные переменные для управления потоком (Пауза/Отмена)
let isTaskPaused = false;
let isTaskCancelled = false;

// Функция задержки (сон)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// HTML модального окна (Добавлен id="tsm-progress-container")
var win_Vocabulary = `<div style="display: flex;">
    <span style="cursor: -webkit-grab;">
        <div style="margin: 5px; width:500px;">
            <button class="tsm-btn tsm-btn-hide" title="скрывает меню" id="hideVocabularyMenu">hide</button>
            <button class="tsm-btn tsm-btn-sm" id="ClearVocabulary" title="Очистить всё и прервать процессы" style="margin: 5px;">🧹</button>
            
            <!-- Обертка прогресс бара и кнопок управления -->
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

const wintVocabulary = createTSMWindow('AFMS_Vocabulary', 'winTopVocabulary', 'winLeftVocabulary', win_Vocabulary);
wintVocabulary.className = 'tsm-window tsm-window-vocabulary';

// Инициализация при клике на меню
document.getElementById('VocabularyMenu').onclick = function () {
    if (wintVocabulary.style.display == 'none') {
        wintVocabulary.style.display = '';
        document.getElementById('vocabularbar').style.display = '';
        firstgetvocabulary(document.getElementById('iduserwords'));
    } else {
        wintVocabulary.style.display = 'none';
    }

    // Привязка кнопок Пауза/Продолжить
    document.getElementById('btnPause').onclick = function() {
        isTaskPaused = true;
        this.style.display = 'none';
        document.getElementById('btnResume').style.display = 'inline-flex';
    };
    
    document.getElementById('btnResume').onclick = function() {
        isTaskPaused = false;
        this.style.display = 'none';
        document.getElementById('btnPause').style.display = 'inline-flex';
    };

    document.getElementById('findwords').onclick = async function () {
        document.getElementById('searchwordinput').value = '';
        globalWordsCounter = 0;
        document.getElementById('searchwordinput').style.display = 'none';
        getwordsets(document.getElementById('iduserwords').value.trim());
    };

    document.getElementById('ClearVocabulary').onclick = function () {
        // Жестко останавливаем все выполняющиеся фоновые процессы
        isTaskCancelled = true; 
        isTaskPaused = false; // Снимаем паузу, чтобы цикл сразу завершился
        
        document.getElementById('wordsout').innerHTML = '';
        document.getElementById('iduserwords').value = '';
        allWordSets =[];
        document.getElementById('searchwordinput').value = '';
        document.getElementById('searchwordinput').style.display = 'none';
        
        // Надежный сброс прогресс-бара через родительский контейнер
        let pbWrapper = document.getElementById("tsm-progress-container");
        if(pbWrapper) {
            let pb = pbWrapper.firstElementChild;
            pb.id = "dynamicProgressBar"; 
            pb.style.width = "0%";
            pb.textContent = "Ожидание...";
        }
        
        document.getElementById('btnPause').style.display = 'none';
        document.getElementById('btnResume').style.display = 'none';
    };

    document.getElementById('hideVocabularyMenu').onclick = function () {
        document.getElementById('ClearVocabulary').click();
        wintVocabulary.style.display = 'none';
    };

    document.getElementById('selectallwords').onclick = toggleAllWordSelection;
    document.getElementById('delunlearnallwords').onclick = deleteLearnedWords;
    document.getElementById('learncheckedwords').onclick = learnSelectedWords;
    document.getElementById('unlearnallwords').onclick = resetProgressForSelectedWords;
    document.getElementById('deleteallwords').onclick = deleteSelectedWords;
};

// Функция управления UI Прогресс Бара
function setupProgressBar(actionId, startText) {
    let pbWrapper = document.getElementById("tsm-progress-container");
    let pb = pbWrapper.firstElementChild; // Находим бар надежно, без оглядки на ID
    
    pb.id = actionId; 
    pb.style.width = "0%";
    pb.textContent = startText || "0%";
    
    document.getElementById('btnPause').style.display = 'inline-flex';
    document.getElementById('btnResume').style.display = 'none';
    isTaskPaused = false;
    isTaskCancelled = false;
    return pb;
}

function finishProgressBar(pb, endText) {
    if (isTaskCancelled) return; // Если отменили задачу, не рисуем 100%
    pb.style.width = "100%";
    pb.textContent = endText || "ГОТОВО!";
    document.getElementById('btnPause').style.display = 'none';
    document.getElementById('btnResume').style.display = 'none';
}

// -------------------------------------------------------------
// Основные функции
// -------------------------------------------------------------

async function firstgetvocabulary(idfield) {
    const userId = await getUserId();
    idfield.value = userId;
    if (idfield.value && idfield.value.trim() !== '') {
        document.getElementById('findwords').click();
    }
}

function toggleAllWordSelection() {
    const wordElements = document.getElementsByClassName('tsm-word-id');
    const checkboxes = document.getElementsByName('checkfordel');
    const selectAllCheckboxes = document.getElementsByName('selectwordsinonelesson');
    const areAllChecked = Array.from(checkboxes).every(chk => chk.checked);
    if (areAllChecked) {
        Array.from(checkboxes).forEach(chk => chk.checked = false);
        Array.from(selectAllCheckboxes).forEach(chk => chk.checked = false);
        checkedarray =[];
    } else {
        Array.from(checkboxes).forEach((chk, index) => {
            chk.checked = true;
            checkedarray.push(wordElements[index].textContent);
        });
        Array.from(selectAllCheckboxes).forEach(chk => chk.checked = true);
    }
}

async function deleteLearnedWords() {
    const learnedWordsElements = document.getElementsByClassName('tsm-learned-status');
    const userstud = document.getElementById('iduserwords').value.trim();
    const wordIds = document.getElementsByClassName('tsm-word-id');
    const learnedIndices =[];
    
    for (let i = 0; i < learnedWordsElements.length; i++) {
        if (learnedWordsElements[i].textContent.includes('✔')) learnedIndices.push(i);
    }
    
    if (learnedIndices.length) {
        const confirmDelete = confirm("Вы уверены, что хотите удалить ВСЕ выученные слова?");
        if (confirmDelete) {
            let pb = setupProgressBar("progressBarDeleteLearned", `0 / ${learnedIndices.length}`);
            
            for (let j = 0; j < learnedIndices.length; j++) {
                // Ожидание паузы и мгновенная реакция на отмену
                while (isTaskPaused && !isTaskCancelled) await sleep(300);
                if (isTaskCancelled) break;

                try {
                    await fetch(`https://api-words.skyeng.ru/api/v2/words/${wordIds[learnedIndices[j]].textContent}.json?studentId=${userstud}`, {
                        headers: { "accept": "application/json, text/plain, */*", "authorization": `Bearer ${token.token_global}` },
                        method: "DELETE"
                    });
                } catch (err) { console.error("Error deleting learned word: ", err); }

                let percent = Math.round(((j + 1) / learnedIndices.length) * 100);
                if(!isTaskCancelled) {
                    pb.style.width = percent + "%";
                    pb.textContent = `${percent}% (${j + 1}/${learnedIndices.length})`;
                }
                await sleep(150);
            }
            if(!isTaskCancelled) {
                finishProgressBar(pb, "УДАЛЕНО!");
                alert("Все выученные слова были успешно удалены 😏");
                await getwordsets(userstud);
            }
        }
    } else {
        alert("Выученных слов в кабинете ученика нет.");
    }
}

async function learnSelectedWords() {
    const checks = document.getElementsByName('checkfordel');
    const wordIds = document.getElementsByClassName('tsm-word-id');
    const userstud = document.getElementById('iduserwords').value.trim();
    let flagselected =[];
    
    for (let i = 0; i < checks.length; i++) {
        if (checks[i].checked == true) flagselected.push(i);
    }
    
    if (flagselected.length) {
        const confirlearn = confirm("Вы уверены, хотите отметить выбранные слова как 'выученные'?");
        if (confirlearn) {
            let pb = setupProgressBar("progressBarLearn", `0 / ${flagselected.length}`);
            
            for (let i = 0; i < flagselected.length; i++) {
                while (isTaskPaused && !isTaskCancelled) await sleep(300);
                if (isTaskCancelled) break;

                try {
                    await fetch(`https://api-words.skyeng.ru/api/for-vimbox/v1/words/${wordIds[flagselected[i]].textContent}/skip.json?studentId=${userstud}`, {
                        headers: { "accept": "application/json, text/plain, */*", "authorization": `Bearer ${token.token_global}` },
                        method: "PUT"
                    });
                } catch (err) { console.error("Error updating word status: ", err); }

                let percent = Math.round(((i + 1) / flagselected.length) * 100);
                if(!isTaskCancelled) {
                    pb.style.width = percent + "%";
                    pb.textContent = `${percent}% (${i + 1}/${flagselected.length})`;
                }
                await sleep(150);
            }
            if(!isTaskCancelled) {
                finishProgressBar(pb, "ВЫУЧЕНО!");
                alert("Выбранные слова были успешно выучены 😏");
                await getwordsets(userstud);
            }
        }
    } else {
        alert("Нет выбранных слов для изменения статуса. Отметьте их.");
    }
}

async function resetProgressForSelectedWords() {
    const checks = document.getElementsByName('checkfordel');
    const wordIds = document.getElementsByClassName('tsm-word-id');
    const userstud = document.getElementById('iduserwords').value.trim();
    let flagselected =[];
    
    for (let i = 0; i < checks.length; i++) {
        if (checks[i].checked == true) flagselected.push(i);
    }
    
    let targets = flagselected.length > 0 ? flagselected : Array.from({length: wordIds.length}, (_, i) => i);
    let msg = flagselected.length > 0 ? "Вы выбрали некоторые пункты для сброса прогресса. Продолжить?" : "Будет автоматически сброшен прогресс для всех слов. Продолжить?";
    
    const confirmReset = confirm(msg);
    if (confirmReset) {
        let pb = setupProgressBar("progressBarReset", `0 / ${targets.length}`);
        
        for (let g = 0; g < targets.length; g++) {
            while (isTaskPaused && !isTaskCancelled) await sleep(300);
            if (isTaskCancelled) break;

            try {
                await fetch(`https://api-words.skyeng.ru/api/trainings/v1/users/${userstud}/meanings/${wordIds[targets[g]].textContent}/progress`, {
                    headers: { "accept": "application/json, text/plain, */*", "authorization": `Bearer ${token.token_global}` },
                    method: "DELETE"
                });
            } catch (err) { console.error("Error resetting progress: ", err); }

            let percent = Math.round(((g + 1) / targets.length) * 100);
            if(!isTaskCancelled) {
                pb.style.width = percent + "%";
                pb.textContent = `${percent}% (${g + 1}/${targets.length})`;
            }
            await sleep(150);
        }
        if(!isTaskCancelled) {
            finishProgressBar(pb, "СБРОШЕНО!");
            alert("Прогресс слов был успешно сброшен! 🤠");
            await getwordsets(userstud);
        }
    }
}

async function deleteSelectedWords() {
    const checks = document.getElementsByName('checkfordel');
    const idslov = document.getElementsByClassName('tsm-word-id');
    const userstud = document.getElementById('iduserwords').value.trim();
    let flagselected =[];
    
    for (let i = 0; i < checks.length; i++) {
        if (checks[i].checked == true) flagselected.push(i);
    }

    let targets = flagselected.length > 0 ? flagselected : Array.from({length: idslov.length}, (_, i) => i);
    let msg = flagselected.length > 0 ? "Вы выбрали некоторые пункты для удаления слов. Продолжить?" : "Будут автоматически удалены все слова из словаря. Продолжить?";
    
    const confirmDelete = confirm(msg);
    if (confirmDelete) {
        let pb = setupProgressBar("progressBarDelete", `0 / ${targets.length}`);
        
        for (let g = 0; g < targets.length; g++) {
            while (isTaskPaused && !isTaskCancelled) await sleep(300);
            if (isTaskCancelled) break;

            try {
                await fetch(`https://api-words.skyeng.ru/api/v2/words/${idslov[targets[g]].textContent}.json?studentId=${userstud}`, {
                    headers: { "accept": "application/json, text/plain, */*", "authorization": `Bearer ${token.token_global}` },
                    method: "DELETE"
                });
            } catch (err) { console.error("Error deleting word: ", err); }

            let percent = Math.round(((g + 1) / targets.length) * 100);
            if(!isTaskCancelled) {
                pb.style.width = percent + "%";
                pb.textContent = `${percent}% (${g + 1}/${targets.length})`;
            }
            await sleep(150);
        }
        if(!isTaskCancelled) {
            finishProgressBar(pb, "УДАЛЕНО!");
            alert("Слова были успешно удалены! 🤠");
            await getwordsets(userstud);
        }
    }
}

async function getwordsets(studentId) {
    allWordSets =[];
    document.getElementById('wordsout').innerHTML = '';
    globalWordsCounter = 0;
    
    let pb = setupProgressBar("progressBarSearch", "Загрузка наборов...");
    
    let wordsetsarr = await fetch("https://api-words.skyeng.ru/api/for-vimbox/v1/wordsets.json?studentId=" + studentId + "&pageSize=500", {
        "headers": { "accept": "application/json, text/plain, */*", "authorization": "Bearer " + token.token_global },
    }).then(r => r.json());

    if (wordsetsarr.meta.total > 0) {
        let totalSets = wordsetsarr.data.length;
        for (let i = 0; i < totalSets; i++) {
            while (isTaskPaused && !isTaskCancelled) await sleep(300);
            if (isTaskCancelled) break;

            let wordset = wordsetsarr.data[i];
            let wordSetData = { title: wordset.title, words:[] };
            
            let objectwdsets = await fetch("https://api-words.skyeng.ru/api/v1/wordsets/" + wordset.id + "/words.json?wordsetId=" + wordset.id + "&studentId=" + studentId + "&page=1&pageSize=500", {
                "headers": { "accept": "application/json, text/plain, */*", "authorization": "Bearer " + token.token_global },
            }).then(r => r.json());
            
            globalWordsCounter += objectwdsets.data.length;
            let meanings = objectwdsets.data.map(word => word.meaningId).toString();
            
            let wordsnames = await fetch("https://dictionary.skyeng.ru/api/for-services/v2/meanings?ids=" + meanings + "&acceptLanguage=ru", {
                "headers": { "accept": "application/json, text/plain, */*", "authorization": "Bearer " + token.token_global },
            }).then(r => r.json());
            
            for (let j = 0; j < objectwdsets.data.length; j++) {
                if (wordsnames[j] != undefined) {
                    wordSetData.words.push({
                        text: wordsnames[j].text || '',
                        isLearned: objectwdsets.data[j].isLearned,
                        progress: objectwdsets.data[j].progress,
                        meaningId: objectwdsets.data[j].meaningId
                    });
                }
            }
            
            allWordSets.push(wordSetData);
            
            if(!isTaskCancelled) {
                renderWordSets(allWordSets, false);
                document.getElementById('searchwordinput').style.display = '';

                let percent = Math.round(((i + 1) / totalSets) * 100);
                pb.style.width = percent + "%";
                pb.textContent = `Парсинг: ${percent}% (${globalWordsCounter} слов)`;
            }
            
            await sleep(150);
        }
        if(!isTaskCancelled) {
            finishProgressBar(pb, `НАЙДЕНО: ${globalWordsCounter} слов`);
        }
    } else {
        document.getElementById('wordsout').innerHTML = '<span style="margin-left:40%; color:bisque;">' + "Словарь пустой!" + '</span>';
        if(!isTaskCancelled) finishProgressBar(pb, "СЛОВАРЬ ПУСТ");
    }
}

// -------------------------------------------------------------
// Рендер и вспомогательные функции
// -------------------------------------------------------------

function renderWordSets(wordSets, isSearch = false) {
    let htmlContent = '';
    for (let wordSet of wordSets) {
        let wordsHtml = '';
        let displayBox = 'none';
        
        for (let word of wordSet.words) {
            let learnedIcon = word.isLearned ? 
                '<span style="color:var(--tsm-neon-lime); text-shadow:0 0 5px var(--tsm-neon-lime);">✔</span>' : 
                '<span style="color:var(--tsm-text-dim);">❌</span>';

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

        if (isSearch && wordSet.words.length > 0) displayBox = 'block';

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

                <div class="tsm-words-grid-body">
                    ${wordsHtml}
                </div>
            </div>`;
    }
    
    document.getElementById('wordsout').innerHTML = htmlContent;
    setupWordSetToggle();
    setupSelectAllWordsInSet();
    setupLinkCopyToClipboard();
}
function setupWordSetToggle() {
    let wordsetnames = document.getElementsByClassName('tsm-wordset-title');
    let boxwithwordsbar = document.getElementsByClassName('tsm-words-box');
    for (let i = 0; i < wordsetnames.length; i++) {
        wordsetnames[i].onclick = function () {
            if (boxwithwordsbar[i].style.display === 'none' || boxwithwordsbar[i].style.display === '')
                boxwithwordsbar[i].style.display = 'block';
            else
                boxwithwordsbar[i].style.display = 'none';
        };
    }
}

function setupSelectAllWordsInSet() {
    const selectoneles = document.getElementsByName('selectwordsinonelesson');
    const checkboxesall = document.getElementsByName('checkfordel');
    for (let selectone of selectoneles) {
        selectone.addEventListener('click', function () {
            let parentDiv = selectone.closest('.tsm-words-box');
            let checkboxesInGroup = parentDiv.querySelectorAll('[name="checkfordel"]');
            let allCheckedInSection = Array.from(checkboxesInGroup).every(chk => chk.checked);
            checkboxesInGroup.forEach(chk => { chk.checked = !allCheckedInSection; });
        });
    }
    for (let checkbox of checkboxesall) {
        checkbox.addEventListener('change', function () {
            let parentDiv = checkbox.closest('.tsm-words-box');
            let selectOneInSection = parentDiv.querySelector('.tsm-checkbox-all');
            let checkboxesInGroup = parentDiv.querySelectorAll('[name="checkfordel"]');
            let allCheckedInSection = Array.from(checkboxesInGroup).every(chk => chk.checked);
            if (selectOneInSection) selectOneInSection.checked = allCheckedInSection;
        });
    }
}

function setupLinkCopyToClipboard() {
    let savebtnsarr = document.getElementsByClassName('tsm-btn-save-word');
    for (let z = 0; z < savebtnsarr.length; z++) {
        savebtnsarr[z].onclick = function () {
            let allmeanings = document.getElementsByClassName('tsm-word-id');
            copyToClipboardTSM("https://dictionary.skyeng.ru/cms/meaning/" + allmeanings[z].textContent);
        };
    }
}

document.getElementById('searchwordinput').addEventListener('input', function () {
    liveSearch(this.value);
});

function liveSearch(query) {
    query = query.toLowerCase().trim();
    if (query === "") {
        renderWordSets(allWordSets, false);
        return;
    }
    const filteredWordSets = allWordSets.map(wordSet => {
        return { title: wordSet.title, words: wordSet.words.filter(word => word.text.toLowerCase().includes(query)) };
    }).filter(wordSet => wordSet.words.length > 0);
    renderWordSets(filteredWordSets, true);
}