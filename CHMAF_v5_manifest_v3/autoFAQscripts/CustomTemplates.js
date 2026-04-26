// --- Инициализация LocalStorage ---
if (localStorage.getItem('cntTmplts') === null) { localStorage.setItem('cntTmplts', 0); }
if (localStorage.getItem('cntTmpltsen_') === null) { localStorage.setItem('cntTmpltsen_', 0); }

const languageAFbtn = document.getElementById('languageAF');
let languageTmplt = languageAFbtn.textContent === "Русский" ? '' : 'en_';
let countOfTemplates = 0; // Сделали числом для корректной математики

// --- Glassmorphism HTML окна "Личные шаблоны" ---
var win_CustomTemplates = `
    <div class="glass-panel" id="custom_templates_window" style="cursor: -webkit-grab; max-height: 80vh; display: flex; flex-direction: column; width: 550px;">
        <div class="glass-warning-bar"></div>
        <h3 style="margin-top: 5px; margin-bottom: 10px; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,0.5); color:bisque">Личные шаблоны</h3>

        <div id="cstmTmplates" style="overflow-y: auto; padding-right: 10px; margin-bottom: 10px; flex-grow: 1;">
            <!-- Сюда будут падать шаблоны -->
        </div>

        <div class="flex-row" style="justify-content: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">
            <button id="addTemplate" title="Добавить новый шаблон" class="glass-btn mainButton">➕ Добавить</button>
            <button id="saveAllTemplates" title="Сохранить все шаблоны" class="glass-btn mainButton">💾 Сохранить всё</button>
            <button title="Скрытие меню" id="hideCustomTemplates" class="glass-btn mainButton buttonHide" style="margin-left: auto;">Скрыть</button>
        </div>
    </div>
`;

// Создаем окно (эти функции у тебя где-то лежат)
const winCustomTemplates = createWindow('AF_CustomTemplates', 'winTopCustomTemplates', 'winLeftCustomTemplates', win_CustomTemplates);
hideWindowOnDoubleClick('AF_CustomTemplates');
hideWindowOnClick('AF_CustomTemplates', 'hideCustomTemplates');

// Открытие окна "Личные шаблоны"
document.getElementById('testCustTMPL').addEventListener('click', function () {
    const custWin = document.getElementById('AF_CustomTemplates');
    custWin.style.display = (custWin.style.display === '' || custWin.style.display === 'block') ? 'none' : 'block';
});

// --- Функция добавления строки шаблона ---
function addNewString(index) {
    const checkboxValue = localStorage.getItem('checkbox_' + languageTmplt + index) === 'true';
    const tmpNameValue = localStorage.getItem('tmp_name_' + languageTmplt + index) || '';
    const templateValue = (localStorage.getItem('template_' + languageTmplt + index) || '').replace(/\\n/g, '\n');

    const cstmTmplates = document.getElementById('cstmTmplates'); // Правильный ID!

    // Красивая и адаптивная Flexbox-верстка для каждой строки шаблона
    const CustomTemplatesLine = `
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.2);" tmp="template_${languageTmplt}${index}" index="${index}">
            <div class="flex-row" style="margin-bottom: 5px;">
                <input id="checkboxInp${languageTmplt}${index}" type="checkbox" style="cursor: pointer; width: 16px; height: 16px;" title="Отображать в быстром меню" ${checkboxValue ? 'checked' : ''}>
                <input id="tmpNameInp${languageTmplt}${index}" class="glass-input " style="width: 140px;" placeholder="Имя шаблона">

                <button id="sortUpBtn${index}" class="glass-btn mainButton" title="Вверх" style="padding: 2px 8px;">↑</button>
                <button id="sortDownBtn${index}" class="glass-btn mainButton" title="Вниз" style="padding: 2px 8px;">↓</button>

                <div class="flex-right">
                    <button id="deleteBtn${index}" class="glass-btn mainButton" style="border-color: rgba(255,99,71,0.4); color: #ff8b8b;">Del</button>
                    <button id="saveBtn${index}" class="glass-btn mainButton">Save</button>
                    <button id="sendBtn${index}" class="glass-btn mainButton primary">Send</button>
                </div>
            </div>
            <textarea id="cstmTmpInp${languageTmplt}${index}" class="glass-textarea " style="width: 100%; min-height: 45px; resize: vertical; box-sizing: border-box;" placeholder="Текст шаблона..."></textarea>
        </div>
    `;

    cstmTmplates.insertAdjacentHTML('beforeend', CustomTemplatesLine);

    // Подставляем значения
    document.getElementById(`tmpNameInp${languageTmplt}${index}`).value = tmpNameValue;
    document.getElementById(`cstmTmpInp${languageTmplt}${index}`).value = templateValue;

    // Обработчик чекбокса
    const checkboxInput = document.getElementById(`checkboxInp${languageTmplt}${index}`);
    checkboxInput.addEventListener('change', function () {
        localStorage.setItem('checkbox_' + languageTmplt + index, this.checked);
        refreshHotTmps();
    });

    // Обработчики кнопок
    document.getElementById(`sortUpBtn${index}`).addEventListener('click', () => sortTemplate(index, -1));
    document.getElementById(`sortDownBtn${index}`).addEventListener('click', () => sortTemplate(index, 1));
    document.getElementById(`deleteBtn${index}`).addEventListener('click', () => deleteTemplate(index));
    document.getElementById(`saveBtn${index}`).addEventListener('click', () => saveTemplate(index));
    document.getElementById(`sendBtn${index}`).addEventListener('click', () => sendTemplate(index));
}

// --- Логические функции работы с шаблонами ---
function saveTemplate(index) {
    const parent = document.querySelector(`[tmp="template_${languageTmplt}${index}"]`);
    if (!parent) return;

    const inputValue = parent.querySelector(`#cstmTmpInp${languageTmplt}${index}`).value.replace(/\n/g, '\\n');
    const nameValue = parent.querySelector(`#tmpNameInp${languageTmplt}${index}`).value;
    const checkboxInp = parent.querySelector(`#checkboxInp${languageTmplt}${index}`); // Ищем чекбокс

    // Сохраняем текст и название
    localStorage.setItem(parent.getAttribute('tmp'), inputValue);
    localStorage.setItem('tmp_name_' + languageTmplt + index, nameValue);

    // Сразу сохраняем статус чекбокса!
    if (checkboxInp) {
        localStorage.setItem('checkbox_' + languageTmplt + index, checkboxInp.checked);
    }

    refreshHotTmps(); // Моментально выводим кнопку на экран
}

function deleteTemplate(index) {
    for (let i = index; i < countOfTemplates; i++) {
        let nextIndex = i + 1;
        localStorage.setItem('template_' + languageTmplt + i, localStorage.getItem('template_' + languageTmplt + nextIndex));
        localStorage.setItem('checkbox_' + languageTmplt + i, localStorage.getItem('checkbox_' + languageTmplt + nextIndex));
        localStorage.setItem('tmp_name_' + languageTmplt + i, localStorage.getItem('tmp_name_' + languageTmplt + nextIndex));
    }
    localStorage.removeItem('template_' + languageTmplt + countOfTemplates);
    localStorage.removeItem('checkbox_' + languageTmplt + countOfTemplates);
    localStorage.removeItem('tmp_name_' + languageTmplt + countOfTemplates);
    countOfTemplates--;
    localStorage.setItem('cntTmplts' + languageTmplt, countOfTemplates);
    reloadTemplates();
}

function sortTemplate(index, direction) {
    const swapIndex = index + direction;
    if (swapIndex < 1 || swapIndex > countOfTemplates) return;

    ['template_', 'checkbox_', 'tmp_name_'].forEach(prefix => {
        const current = localStorage.getItem(prefix + languageTmplt + index);
        const swap = localStorage.getItem(prefix + languageTmplt + swapIndex);
        localStorage.setItem(prefix + languageTmplt + index, swap);
        localStorage.setItem(prefix + languageTmplt + swapIndex, current);
    });
    reloadTemplates();
}

function sendTemplate(index) {
    const text = localStorage.getItem('template_' + languageTmplt + index);
    if (text) {
        document.getElementById('inp').value = text.replace(/\\n/g, '\n');
        document.getElementById('AF_CustomTemplates').style.display = 'none';
    }
}

function reloadTemplates() {
    countOfTemplates = parseInt(localStorage.getItem('cntTmplts' + languageTmplt)) || 0;
    const cstmTmplates = document.getElementById('cstmTmplates'); // ИСПРАВЛЕННЫЙ ID

    if (cstmTmplates) {
        cstmTmplates.innerHTML = '';
        for (let i = 1; i <= countOfTemplates; i++) {
            if (typeof addNewString === 'function') addNewString(i);
        }
    }

    if (typeof refreshHotTmps === 'function') refreshHotTmps();
}

function refreshHotTmps() {
    // ВОЗВРАЩАЕМ ПРАВИЛЬНЫЙ КОНТЕЙНЕР #6str (он всегда на виду)
    const strokaCustTempl = document.getElementById('6str');

    if (!strokaCustTempl) return;

    strokaCustTempl.innerHTML = ''; // Очищаем старые кнопки

    const tmpltsCount = parseInt(localStorage.getItem('cntTmplts' + languageTmplt)) || 0;

    for (let i = 1; i <= tmpltsCount; i++) {
        const checkbox = document.getElementById(`checkboxInp${languageTmplt}${i}`);
        const isChecked = checkbox ? checkbox.checked : (localStorage.getItem('checkbox_' + languageTmplt + i) === 'true');
        const tmpName = localStorage.getItem('tmp_name_' + languageTmplt + i);

        if (!isChecked || !tmpName) continue;

        // Создаем кнопку личного шаблона
        const newButton = document.createElement('button');
        newButton.className = 'glass-btn mainButton';
        newButton.textContent = tmpName;

        // Выделим кастомные кнопки легким синим оттенком, чтобы они были заметнее
        newButton.style.backgroundColor = 'rgba(70, 130, 180, 0.4)';
        newButton.style.border = '1px solid rgba(70, 130, 180, 0.6)';
        newButton.style.marginBottom = '6px';
        newButton.style.marginRight = '5px';

        newButton.addEventListener('click', function () {
            const text = localStorage.getItem('template_' + languageTmplt + i);
            if (text) document.getElementById('inp').value = text.replace(/\\n/g, '\n');
        });

        strokaCustTempl.appendChild(newButton);
    }
}

// --- События главных кнопок ---
document.getElementById('addTemplate').addEventListener('click', function () {
    countOfTemplates++;
    localStorage.setItem('cntTmplts' + languageTmplt, countOfTemplates);
    localStorage.setItem('template_' + languageTmplt + countOfTemplates, "");
    localStorage.setItem('checkbox_' + languageTmplt + countOfTemplates, false);
    localStorage.setItem('tmp_name_' + languageTmplt + countOfTemplates, "");
    addNewString(countOfTemplates);
});

document.getElementById('saveAllTemplates').addEventListener('click', function () {
    for (let i = 1; i <= countOfTemplates; i++) {
        const inputArea = document.getElementById('cstmTmpInp' + languageTmplt + i);
        const nameInput = document.getElementById('tmpNameInp' + languageTmplt + i);
        const checkboxInp = document.getElementById('checkboxInp' + languageTmplt + i);

        if (inputArea && nameInput && checkboxInp) {
            localStorage.setItem('template_' + languageTmplt + i, inputArea.value.replace(/\n/g, '\\n'));
            localStorage.setItem('checkbox_' + languageTmplt + i, checkboxInp.checked);
            localStorage.setItem('tmp_name_' + languageTmplt + i, nameInput.value);
        }
    }
    refreshHotTmps();
});

// Добавление текста из главного окна
document.getElementById('addtocusttmplt').addEventListener('click', function () {
    const tmplttetx = document.getElementById('inp').value;
    if (tmplttetx) {
        document.getElementById('addTemplate').click();
        const templateInput = document.getElementById(`cstmTmpInp${languageTmplt}${countOfTemplates}`);
        if (templateInput) templateInput.value = tmplttetx;
        document.getElementById('AF_CustomTemplates').style.display = 'block';
    }
});

// Кнопка смены языка
languageAFbtn.addEventListener('click', function () {
    // Находим ВСЕ стеклянные панели, чтобы поменять цвет и у главного окна, и у окна шаблонов
    const glassPanels = document.querySelectorAll('.glass-panel');

    if (this.textContent === "Русский") {
        this.textContent = "Английский";
        languageTmplt = 'en_';

        glassPanels.forEach(panel => {
            panel.style.background = "rgba(235, 199, 223, 0.6)"; // Розовый Glass
            panel.style.color = "#333";
        });
    } else {
        this.textContent = "Русский";
        languageTmplt = '';

        glassPanels.forEach(panel => {
            panel.style.background = "rgba(40, 42, 54, 0.6)"; // Темный Glass
            panel.style.color = "#fff";
        });
    }

    reloadTemplates();
});

// Первичный запуск
reloadTemplates();