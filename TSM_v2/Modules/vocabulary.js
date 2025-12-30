let allWordSets = [];  // Массив для хранения всех данных о наборах слов
let checkedarray = [];
let globalWordsCounter = 0;

var win_Vocabulary = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">

					     <div style="margin: 5px; width:500px;">
                            <button class="commonbtn hidebtns" title="скрывает меню" id="hideVocabularyMenu">hide</button>
							<button class="commonbtn smallbtns" id="ClearVocabulary" title = "Обновляет информацию по открытой комнате" style="margin: 5px;">🧹</button>

							<div style="width:470px;background: #5f7875;height: 21px; margin-left:5px; border-radius:20px">
								<div id="progressBarDeleteWords" style="width: 0%; height: 20px; background-color: #e38118; border: 1px solid black; text-align:center; font-weight:700; color:bisque; border-radius:20px">
								</div>
							</div>

                        </div>

						<div id="vocabularbar" class="vocabularbarcls">
							<div id="searchtoolswords" style="margin: 5px; width:500px;">
								<input id="iduserwords" style="width: 450px;text-align: center; height: 30px; border-radius:20px;" placeholder="Enter student ID to get vocabulary info">
								<button id="findwords" class="commonbtn smallbtns">🔎</button>
							</div>
							<div class="vocabularremtools">
								<button class="vertical-btn-ext" id="deleteallwords" title="Удаляет все выделенные слова, если ничего не выделено удалит все">
								  <div class="emoji">❌</div>
								  <hr>
								  <div class="label">Удалить</div>
								</button>

								<button class="vertical-btn-ext" id="unlearnallwords"  title="Сбрасывает прогресс выученных слов">
								  <div class="emoji">⭕</div>
								  <hr>
								  <div class="label">Сброс прогресса</div>
								</button>

								<button class="vertical-btn-ext" id="delunlearnallwords" title="Удаляет все выученные слова">
								  <div class="emoji">⛔</div>
								  <hr>
								  <div class="label">Удалить выученные</div>
								</button>

								<button class="vertical-btn-ext" id="learncheckedwords" title="Делает слово выученным">
								  <div class="emoji">✅</div>
								  <hr>
								  <div class="label">Выучить</div>
								</button>

								<button class="vertical-btn-ext" id="selectallwords" title="Выделяет все слова">
								  <div class="emoji">☑</div>
								  <hr>
								  <div class="label">Выбрать все</div>
								</button>
							</div>
                            <div class="vocabularremtools">
                                <input id="searchwordinput" style="width: 470px; text-align: center; height: 30px; display: none; margin-top: 7px;" placeholder="Введите слово или его часть для живого поиска">
							</div>
						</div>

						<div id="wordsout" class="wordsout">
						</div>

						<div id="totalWords">
						</div>

					</span>
				   </div>`;

const wintVocabulary = createTSMWindow('AFMS_Vocabulary', 'winTopVocabulary', 'winLeftVocabulary', win_Vocabulary);
wintVocabulary.className = 'wintInitializeVocabulary';

document.getElementById('VocabularyMenu').onclick = function () { // открывает меню для работы со словарем

    if (wintVocabulary.style.display == 'none') {
        wintVocabulary.style.display = ''
        document.getElementById('vocabularbar').style.display = '';
        firstgetvocabulary(document.getElementById('iduserwords'));
    } else wintVocabulary.style.display = 'none'


    document.getElementById('findwords').onclick = async function () {
        document.getElementById('searchwordinput').value = ''
        globalWordsCounter = 0;
        document.getElementById('searchwordinput').style.display = 'none'
        getwordsets(document.getElementById('iduserwords').value.trim())

    }

    document.getElementById('ClearVocabulary').onclick = function () {
        document.getElementById('wordsout').innerHTML = '';
        document.getElementById('iduserwords').value = '';
        allWordSets = [];
        document.getElementById('searchwordinput').value = ''
        document.getElementById('searchwordinput').style.display = 'none'
    }

    document.getElementById('hideVocabularyMenu').onclick = function () {
        document.getElementById('ClearVocabulary').click();
        wintVocabulary.style.display = 'none'
    }

    document.getElementById('selectallwords').onclick = toggleAllWordSelection; //функция выделения всех слов
    document.getElementById('delunlearnallwords').onclick = deleteLearnedWords; // функция удаления всех выученных слов
    document.getElementById('learncheckedwords').onclick = learnSelectedWords; // функция изучения выбранного слова минуя тренировку
    document.getElementById('unlearnallwords').onclick = resetProgressForSelectedWords; // функция сброса выученного слова
    document.getElementById('deleteallwords').onclick = deleteSelectedWords; // функция удаленя слов выбраных в списке если ничего не выбрано то всех!
} // end of open vocabulary menu function

async function firstgetvocabulary(idfield) {
    const userId = await getUserId();
    idfield.value = userId;

    if (idfield.value && idfield.value.trim() !== '') {
        document.getElementById('findwords').click();
    }
}

function toggleAllWordSelection() { //функция выделения всех слов
    const wordElements = document.getElementsByClassName('wminId');
    const checkboxes = document.getElementsByName('checkfordel');
    const selectAllCheckboxes = document.getElementsByName('selectwordsinonelesson');

    const areAllChecked = Array.from(checkboxes).every(chk => chk.checked);

    if (areAllChecked) {
        // Если все слова уже выделены, снимаем выделение и очищаем массив
        Array.from(checkboxes).forEach(chk => chk.checked = false);
        Array.from(selectAllCheckboxes).forEach(chk => chk.checked = false); // Снимаем выделение с selectonesection чекбоксов
        checkedarray = [];
    } else {
        // Иначе выделяем все слова и добавляем их в массив
        Array.from(checkboxes).forEach((chk, index) => {
            chk.checked = true;
            checkedarray.push(wordElements[index].textContent);
        });
        Array.from(selectAllCheckboxes).forEach(chk => chk.checked = true); // Выделяем все selectonesection чекбоксы
    }
}

async function deleteLearnedWords() { // функция удаления всех выученных слов
    const learnedWordsElements = document.getElementsByClassName('islearnedyesno');
    const userstud = document.getElementById('iduserwords').value.trim();
    const wordIds = document.getElementsByClassName('wminId');
    const learnedIndices = [];
    for (let i = 0; i < learnedWordsElements.length; i++) {
        if (learnedWordsElements[i].textContent == '✔')
            learnedIndices.push(i)
    }

    if (learnedIndices.length) {
        const confirmDelete = confirm("Вы уверены, что хотите удалить ВСЕ выученные слова?");
        if (confirmDelete) {
            alert("🚀Запрос в процессе выполнения. Пожалуйста, ожидайте завершения 😋");
            for (let j = 0; j < learnedIndices.length; j++) {
                try {
                    await fetch(`https://api-words.skyeng.ru/api/v2/words/${wordIds[learnedIndices[j]].textContent}.json?studentId=${userstud}`, {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "authorization": `Bearer ${token.token_global}`,
                        },
                        method: "DELETE"
                    });
                } catch (err) {
                    console.error("Error deleting learned word: ", err);
                }
            }
            alert("Все выученные слова были успешно удалены 😏");
            await getwordsets(userstud);
            liveSearch(document.getElementById('searchwordinput').value);
        }
    } else {
        alert("Выученных слов в кабинете ученика нет.");
    }
}

async function learnSelectedWords() { // функция изучения выбранного слова минуя тренировку
    const checks = document.getElementsByName('checkfordel');
    const wordIds = document.getElementsByClassName('wminId');
    const userstud = document.getElementById('iduserwords').value.trim();
    let flagselected = [];
    for (let i = 0; i < checks.length; i++) {
        if (checks[i].checked == true)
            flagselected.push(i)
    }

    if (flagselected.length) {
        const confirlearn = confirm("Вы уверены, хотите отметить выбранные слова как 'выученные'?");
        if (confirlearn) {
            alert("🚀Запрос в процессе выполнения. Пожалуйста, ожидайте завершения 😋");
            for (let i = 0; i < flagselected.length; i++) {
                try {
                    await fetch(`https://api-words.skyeng.ru/api/for-vimbox/v1/words/${wordIds[flagselected[i]].textContent}/skip.json?studentId=${userstud}`, {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "authorization": `Bearer ${token.token_global}`,
                        },
                        method: "PUT"
                    });
                } catch (err) {
                    console.error("Error updating word status: ", err);
                }
            }
            alert("Выбранные слова были успешно выучены 😏");
            await getwordsets(userstud);
            liveSearch(document.getElementById('searchwordinput').value);
        }
    } else {
        alert("Нет выбранных слов для изменения статуса на выучен. Отметьте, пожалуйста, и повторите попытку.");
    }
}

async function resetProgressForSelectedWords() { // функция сброса выученного слова
    const checks = document.getElementsByName('checkfordel');
    const wordIds = document.getElementsByClassName('wminId');
    const userstud = document.getElementById('iduserwords').value.trim();
    let flagselected = [];
    for (let i = 0; i < checks.length; i++) {
        if (checks[i].checked == true)
            flagselected.push(i)
    }

    if (!flagselected.length) {
        const confirmResetAll = confirm("Не был выбран ниодин пункт. Будет автоматически сброшен прогресс для всех слов. Продолжить?");
        if (confirmResetAll) {
            alert("🚀Запрос в процессе выполнения. Пожалуйста, ожидайте завершения 😋");
            for (let g = 0; g < wordIds.length; g++) {
                try {
                    await fetch(`https://api-words.skyeng.ru/api/trainings/v1/users/${userstud}/meanings/${wordIds[g].textContent}/progress`, {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "authorization": `Bearer ${token.token_global}`,
                        },
                        method: "DELETE"
                    });
                } catch (err) {
                    console.error("Error resetting progress: ", err);
                }
            }
            alert("Прогресс всех слов был успешно сброшен! 🤠");
            await getwordsets(userstud);
            liveSearch(document.getElementById('searchwordinput').value);
        }
    } else {
        const confirmResetSelected = confirm("Вы выбрали некоторые пункты для сброса прогресса слов. Продолжить?");
        if (confirmResetSelected) {
            alert("🚀Запрос в процессе выполнения. Пожалуйста, ожидайте завершения 😋");
            for (let g = 0; g < flagselected.length; g++) {
                try {
                    await fetch(`https://api-words.skyeng.ru/api/trainings/v1/users/${userstud}/meanings/${wordIds[flagselected[g]].textContent}/progress`, {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "authorization": `Bearer ${token.token_global}`,
                        },
                        method: "DELETE"
                    });
                } catch (err) {
                    console.error("Error resetting selected word's progress: ", err);
                }
            }
            alert("Прогресс выбранных слов был успешно сброшен! 🤠");
            await getwordsets(userstud);
            liveSearch(document.getElementById('searchwordinput').value);
        }
    }
}

async function deleteSelectedWords() { // функция удаленя слов выбраных в списке если ничего не выбрано то всех!
    const checks = document.getElementsByName('checkfordel');
    const idslov = document.getElementsByClassName('wminId');
    const userstud = document.getElementById('iduserwords').value.trim();
    let flagselected = [];
    for (let i = 0; i < checks.length; i++) {
        if (checks[i].checked == true)
            flagselected.push(i)
    }
	
	let progressBar = document.getElementById("progressBarDeleteWords");
	let currentWidth = 100;
	let step = globalWordsCounter > 0 ? 100 / globalWordsCounter : (() => { console.log('Division by zero'); return 0; })();

    if (!flagselected.length) {
        const confirmDeleteAll = confirm("Не был выбран ниодин пункт. Будут автоматически удалены все слова из словаря. Продолжить?");
        if (confirmDeleteAll) {
            alert("🚀Запрос в процессе выполнения. Пожалуйста, ожидайте завершения 😋");
            for (let g = 0; g < idslov.length; g++) {
                try {
                    await fetch(`https://api-words.skyeng.ru/api/v2/words/${idslov[g].textContent}.json?studentId=${userstud}`, {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "authorization": `Bearer ${token.token_global}`,
                        },
                        method: "DELETE"
                    });
                } catch (err) {
                    console.error("Error deleting word: ", err);
                }
                globalWordsCounter--;
                //document.getElementById('progressBarDeleteWords').innerHTML = globalWordsCounter + ' (слов)'
				
				currentWidth -= step;
				progressBar.style.width = Number(currentWidth.toFixed(1)) + "%";
				progressBar.textContent = Number(currentWidth.toFixed(1)) + "%" + " (" + globalWordsCounter + " слов)";		
            }
            alert("Все слова были успешно удалены! 🤠");
            await getwordsets(userstud);
           // liveSearch(document.getElementById('searchwordinput').value);
        }
    } else {
        const confirmDeleteSelected = confirm("Вы выбрали некоторые пункты для удаления слов. Продолжить?");
        if (confirmDeleteSelected) {
            alert("🚀Запрос в процессе выполнения. Пожалуйста, ожидайте завершения 😋");
            for (let g = 0; g < flagselected.length; g++) {
                try {
                    await fetch(`https://api-words.skyeng.ru/api/v2/words/${idslov[flagselected[g]].textContent}.json?studentId=${userstud}`, {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "authorization": `Bearer ${token.token_global}`,
                        },
                        method: "DELETE"
                    });
                } catch (err) {
                    console.error("Error deleting selected word: ", err);
                }
                globalWordsCounter--;
                //document.getElementById('progressBarDeleteWords').innerHTML = globalWordsCounter + ' (слов)'
				currentWidth -= step;
				progressBar.style.width = Number(currentWidth.toFixed(1)) + "%";
				progressBar.textContent = Number(currentWidth.toFixed(1)) + "%" + " (" + globalWordsCounter + " слов)";		
            }
            alert("Выбранные слова были успешно удалены! 🤠");
            await getwordsets(userstud);
            liveSearch(document.getElementById('searchwordinput').value);
        }
    }
}

async function getwordsets(studentId) { // поиск всех слов в словаре У
    allWordSets = [];
    document.getElementById('wordsout').innerHTML = '';
    globalWordsCounter = 0;
	
    let wordsetsarr = await fetch("https://api-words.skyeng.ru/api/for-vimbox/v1/wordsets.json?studentId=" + studentId + "&pageSize=500", { //Получаем ID всез словарных вордсетов, чтобы в дальнейшем их можно было по очереди парсить
        "headers": {
            "accept": "application/json, text/plain, */*",
            "authorization": "Bearer " + token.token_global,
        },
    }).then(r => r.json());
	
	let progressBar = document.getElementById("progressBarDeleteWords");
    let currentWidth = 0;

	if (wordsetsarr.meta.total > 0) {
			let step = 100 / wordsetsarr.meta.total;
		    for (let wordset of wordsetsarr.data) { // Запускаем парсинг каждого вордсета
				let wordSetData = { // создаем объект, где будем хранить title - название вордсета, и words список слов, по умолчанию пустой будет поэтому квадратные пустые скобки
					title: wordset.title,
					words: []
				};

				let objectwdsets = await fetch("https://api-words.skyeng.ru/api/v1/wordsets/" + wordset.id + "/words.json?wordsetId=" + wordset.id + "&studentId=" + studentId + "&page=1&pageSize=500", { // получаем объект вордсета c его определенным ID, с ключами meaningId, progress, status, isLearned. И так перебирая все вордсеты.
					"headers": {
						"accept": "application/json, text/plain, */*",
						"authorization": "Bearer " + token.token_global,
					},
				}).then(r => r.json());

				globalWordsCounter += objectwdsets.data.length; // либо можно objectwdsets.meta.total

				let meanings = objectwdsets.data.map(word => word.meaningId).toString(); // записываем уникальные айдишники слов, с приведением их к строчному типу

				let wordsnames = await fetch("https://dictionary.skyeng.ru/api/for-services/v2/meanings?ids=" + meanings + "&acceptLanguage=ru", { // парсим одним запросом айдишники слов, чтобы получить информацию о названии слова, его прогрессе изучения, выучено оно или нет
					"headers": {
						"accept": "application/json, text/plain, */*",
						"authorization": "Bearer " + token.token_global,
					},
				}).then(r => r.json());

				for (let j = 0; j < objectwdsets.data.length; j++) { // после парсинга каждого слова по его meaningId собираем объект с названием слова, выучено оно или нет, прогресс и сохраняем meaningId для манипуляций конкретно с этим словом - удаление слова, сброс прогреса и тп
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
				renderWordSets(allWordSets, false);

				document.getElementById('searchwordinput').style.display = ''
				
				currentWidth += step;
				progressBar.style.width = Number(currentWidth.toFixed(1)) + "%";
				progressBar.textContent = Number(currentWidth.toFixed(1)) + "%" + " (" + globalWordsCounter + " слов)";
			}
	} else {
		document.getElementById('wordsout').innerHTML = '<span style="margin-left:40%; color:bisque;">' + "Словарь пустой!" + '</span>'
	}
	

}

function renderWordSets(wordSets, isSearch = false) { //отображение списка слов с добавлением доп функций
    let htmlContent = '';

    for (let wordSet of wordSets) {
        let wordsHtml = '';
        let displayBox = 'none';  // По умолчанию блок скрыт

        for (let word of wordSet.words) {
            wordsHtml += `<span style="color: #00FA9A; margin-left:5px;">&#5129; </span>
                          <span style="color: bisque; cursor: text;" name="meaningsId">
                              <span style="color: #30dbe3; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);">${word.text}</span>
                              <input type="checkbox" name="checkfordel" class="checkdel">
                              <span style="display:none" class="sectionforcheck">section</span>
                              <span class="savelinktowordcms" title="Копирует в буфер обмена ссылку на CMS словаря для этого слова"> 💾 </span>
                              <span class="checkislearned">${word.isLearned ? '<span class="islearnedyesno" style="float:right;margin-right:30px;">✔</span>' : '<span class="islearnedyesno" style="float:right; margin-right:30px;">❌</span>'}</span>
                              <span style="float:right; margin-right:35px;">${word.progress < 100 ? `<span style="padding-left: 8px;">${word.progress}%</span>` : `${word.progress}%`}</span>
                              <span class="wminId" style="float:right; margin-right:5px;">${word.meaningId}</span>
                          </span>
                          <br>`;
        }

        if (isSearch && wordSet.words.length > 0) {
            displayBox = 'block';
        }

        htmlContent += `<div class="wordsetname">${wordSet.title} (${wordSet.words.length})</div>
                        <div class="boxwithwords" style="display:${displayBox}">
                            <div class="headerexplain">
                                <span style="margin-left: 30px;">Слово или фраза</span>
                                <span style="margin-left: 142px;">ID слова</span>
                                <span style="margin-left: 12px;"> % </span>
                                <span style="margin-left: 10px;"> Выучено </span>
                                <input type="checkbox" name="selectwordsinonelesson" class="selectonesection">
                            </div>
                            ${wordsHtml}
                        </div>`;
    }

    document.getElementById('wordsout').innerHTML = htmlContent;
		
    // document.getElementById('totalWords').innerHTML = '<span style="color:bisque; margin-left:5px">Total Words Count:</span>' + '<span style="color:bisque; margin-left:5px">' + globalWordsCounter + '</span>'
    // document.getElementById('progressBarDeleteWords').innerHTML = globalWordsCounter + ' (слов)'
    setupWordSetToggle();
    setupSelectAllWordsInSet();
    setupLinkCopyToClipboard();
}

function setupWordSetToggle() { // расскрытие/скрытие блоков
    let wordsetnames = document.getElementsByClassName('wordsetname');
    let boxwithwordsbar = document.getElementsByClassName('boxwithwords');
    for (let i = 0; i < wordsetnames.length; i++) {
        wordsetnames[i].onclick = function () {
            if (boxwithwordsbar[i].style.display === 'none' || boxwithwordsbar[i].style.display === '')
                boxwithwordsbar[i].style.display = 'block';
            else
                boxwithwordsbar[i].style.display = 'none';
        }
    }
}

function setupSelectAllWordsInSet() { // выделение слов в блоке
    const selectoneles = document.getElementsByName('selectwordsinonelesson');
    const checkboxesall = document.getElementsByName('checkfordel');

    // Обработчик для главных чекбоксов
    for (let selectone of selectoneles) {
        selectone.addEventListener('click', function () {
            let parentDiv = selectone.closest('.boxwithwords');
            let checkboxesInGroup = parentDiv.querySelectorAll('[name="checkfordel"]');

            let allCheckedInSection = Array.from(checkboxesInGroup).every(chk => chk.checked);

            checkboxesInGroup.forEach(chk => {
                chk.checked = !allCheckedInSection;
            });
        });
    }

    // Обработчик для чекбоксов слов
    for (let checkbox of checkboxesall) {
        checkbox.addEventListener('change', function () {
            let parentDiv = checkbox.closest('.boxwithwords');
            let selectOneInSection = parentDiv.querySelector('.selectonesection');
            let checkboxesInGroup = parentDiv.querySelectorAll('[name="checkfordel"]');

            let allCheckedInSection = Array.from(checkboxesInGroup).every(chk => chk.checked);
            selectOneInSection.checked = allCheckedInSection;
        });
    }
}

function setupLinkCopyToClipboard() { // функция копирования ссылки на CMS словаря
    let savebtnsarr = document.getElementsByClassName('savelinktowordcms');
    for (let z = 0; z < savebtnsarr.length; z++) {
        savebtnsarr[z].onclick = function () {
            let allmeanings = document.getElementsByClassName('wminId');
            copyToClipboardTSM("https://dictionary.skyeng.ru/cms/meaning/" + allmeanings[z].textContent);
        }
    }
}

document.getElementById('searchwordinput').addEventListener('input', function () { // листенер для живого поиска
    liveSearch(this.value);
});

function liveSearch(query) { // живой поиск
    query = query.toLowerCase().trim();

    if (query === "") {
        renderWordSets(allWordSets, false);
        return;
    }

    const filteredWordSets = allWordSets.map(wordSet => {
        return {
            title: wordSet.title,
            words: wordSet.words.filter(word => word.text.toLowerCase().includes(query))
        };
    }).filter(wordSet => wordSet.words.length > 0);

    renderWordSets(filteredWordSets, true);
}