// ============================================================
// ChMAF — Личные шаблоны / CustomTemplates.js
// ============================================================

// Сохраняем существующий формат данных и ключи localStorage.
if (localStorage.getItem('cntTmplts') === null) {
    localStorage.setItem('cntTmplts', '0');
}

if (localStorage.getItem('cntTmpltsen_') === null) {
    localStorage.setItem('cntTmpltsen_', '0');
}

const languageAFbtn = document.getElementById('languageAF');

if (!languageAFbtn) {
    console.error(
        '[CustomTemplates] Не найден #languageAF. ' +
        'Главное окно должно создаваться до загрузки этого файла.'
    );
}

let languageTmplt =
    languageAFbtn?.textContent?.trim() === 'Русский'
        ? ''
        : 'en_';

let countOfTemplates = 0;

// ============================================================
// Окно. ID и существующие классы сохранены для совместимости.
// ============================================================

var win_CustomTemplates = `
    <div class="glass-panel"
         id="custom_templates_window"
         style="cursor: -webkit-grab; max-height: 80vh; display: flex; flex-direction: column; width: 550px;">

        <div class="glass-warning-bar chmaf-drag-handle"></div>

        <h3 class="chmaf-drag-handle"
            style="margin-top: 5px; margin-bottom: 10px; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,0.5); color:bisque">
            Личные шаблоны
        </h3>

        <div id="cstmTmplates"
             style="overflow-y: auto; padding-right: 10px; margin-bottom: 10px; flex-grow: 1;">
            <!-- Строки шаблонов -->
        </div>

        <div class="flex-row"
             style="justify-content: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 10px;">

            <button id="addTemplate"
                    title="Добавить новый шаблон"
                    class="glass-btn mainButton"
                    type="button">➕ Добавить</button>

            <button id="saveAllTemplates"
                    title="Сохранить все шаблоны"
                    class="glass-btn mainButton"
                    type="button">💾 Сохранить всё</button>

            <button id="hideCustomTemplates"
                    title="Скрытие меню"
                    class="glass-btn buttonHide"
                    type="button"
                    style="margin-left: auto;">❌</button>
        </div>
    </div>
`;

createWindow(
    'AF_CustomTemplates',
    'winTopCustomTemplates',
    'winLeftCustomTemplates',
    win_CustomTemplates
);

hideWindowOnDoubleClick('AF_CustomTemplates');
hideWindowOnClick('AF_CustomTemplates', 'hideCustomTemplates');

// ============================================================
// Общие операции с сохранёнными данными
// ============================================================

function templateKey(prefix, index) {
    return `${prefix}${languageTmplt}${index}`;
}

function readTemplateCount() {
    const count = Number.parseInt(
        localStorage.getItem('cntTmplts' + languageTmplt),
        10
    );

    return Number.isFinite(count) && count > 0 ? count : 0;
}

// Сохраняет все видимые поля текущего языка БЕЗ перерисовки.
// Вызывается перед операциями, которые пересоздают строки.
function saveVisibleTemplates() {
    for (let i = 1; i <= countOfTemplates; i++) {
        const text = document.getElementById(
            `cstmTmpInp${languageTmplt}${i}`
        );

        const name = document.getElementById(
            `tmpNameInp${languageTmplt}${i}`
        );

        const checkbox = document.getElementById(
            `checkboxInp${languageTmplt}${i}`
        );

        if (!text || !name || !checkbox) continue;

        localStorage.setItem(
            templateKey('template_', i),
            text.value.replace(/\n/g, '\\n')
        );

        localStorage.setItem(
            templateKey('tmp_name_', i),
            name.value
        );

        localStorage.setItem(
            templateKey('checkbox_', i),
            String(checkbox.checked)
        );
    }
}

// ============================================================
// Создание строки шаблона
// ============================================================

function addNewString(index) {
    const container = document.getElementById('cstmTmplates');
    if (!container) return;

    const checkboxValue =
        localStorage.getItem(templateKey('checkbox_', index)) === 'true';

    const nameValue =
        localStorage.getItem(templateKey('tmp_name_', index)) || '';

    const textValue = (
        localStorage.getItem(templateKey('template_', index)) || ''
    ).replace(/\\n/g, '\n');

    const rowHtml = `
        <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed rgba(255,255,255,0.2);"
             tmp="template_${languageTmplt}${index}"
             index="${index}">

            <div class="flex-row" style="margin-bottom: 5px;">
                <input id="checkboxInp${languageTmplt}${index}"
                       type="checkbox"
                       style="cursor: pointer; width: 16px; height: 16px;"
                       title="Отображать в быстром меню"
                       ${checkboxValue ? 'checked' : ''}>

                <input id="tmpNameInp${languageTmplt}${index}"
                       class="glass-input"
                       style="width: 140px;"
                       placeholder="Имя шаблона">

                <button id="sortUpBtn${index}"
                        class="glass-btn mainButton"
                        type="button"
                        title="Вверх"
                        style="padding: 2px 8px;">↑</button>

                <button id="sortDownBtn${index}"
                        class="glass-btn mainButton"
                        type="button"
                        title="Вниз"
                        style="padding: 2px 8px;">↓</button>

                <div class="flex-right">
                    <button id="deleteBtn${index}"
                            class="glass-btn mainButton"
                            type="button"
                            title="Удалить шаблон"
                            style="border-color: rgba(255,99,71,0.4); color: #ff8b8b;">Del</button>

                    <button id="saveBtn${index}"
                            class="glass-btn mainButton"
                            type="button"
                            title="Сохранить шаблон">Save</button>

                    <button id="sendBtn${index}"
                            class="glass-btn mainButton primary"
                            type="button"
                            title="Перенести текст в главное окно">Send</button>
                </div>
            </div>

            <textarea id="cstmTmpInp${languageTmplt}${index}"
                      class="glass-textarea"
                      style="width: 100%; min-height: 45px; resize: vertical; box-sizing: border-box;"
                      placeholder="Текст шаблона..."></textarea>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', rowHtml);

    // Пользовательские данные подставляем через value, не через HTML.
    document.getElementById(
        `tmpNameInp${languageTmplt}${index}`
    ).value = nameValue;

    document.getElementById(
        `cstmTmpInp${languageTmplt}${index}`
    ).value = textValue;

    // При переключении галочки сохраняем также текущее имя и текст строки.
    document.getElementById(
        `checkboxInp${languageTmplt}${index}`
    ).addEventListener('change', () => {
        saveTemplate(index);
    });

    document.getElementById(`sortUpBtn${index}`)
        .addEventListener('click', () => sortTemplate(index, -1));

    document.getElementById(`sortDownBtn${index}`)
        .addEventListener('click', () => sortTemplate(index, 1));

    document.getElementById(`deleteBtn${index}`)
        .addEventListener('click', () => deleteTemplate(index));

    document.getElementById(`saveBtn${index}`)
        .addEventListener('click', () => saveTemplate(index));

    document.getElementById(`sendBtn${index}`)
        .addEventListener('click', () => sendTemplate(index));
}

// ============================================================
// Операции с шаблонами
// ============================================================

function saveTemplate(index) {
    if (index < 1 || index > countOfTemplates) return;

    const text = document.getElementById(
        `cstmTmpInp${languageTmplt}${index}`
    );

    const name = document.getElementById(
        `tmpNameInp${languageTmplt}${index}`
    );

    const checkbox = document.getElementById(
        `checkboxInp${languageTmplt}${index}`
    );

    if (!text || !name || !checkbox) return;

    localStorage.setItem(
        templateKey('template_', index),
        text.value.replace(/\n/g, '\\n')
    );

    localStorage.setItem(
        templateKey('tmp_name_', index),
        name.value
    );

    localStorage.setItem(
        templateKey('checkbox_', index),
        String(checkbox.checked)
    );

    refreshHotTmps();
}

function deleteTemplate(index) {
    if (
        !Number.isInteger(index) ||
        index < 1 ||
        index > countOfTemplates
    ) {
        return;
    }

    // Важно: сначала сохраняем правки из DOM,
    // и только потом сдвигаем данные в localStorage.
    saveVisibleTemplates();

    for (let i = index; i < countOfTemplates; i++) {
        const nextIndex = i + 1;

        for (const prefix of [
            'template_',
            'checkbox_',
            'tmp_name_'
        ]) {
            const nextValue = localStorage.getItem(
                templateKey(prefix, nextIndex)
            );

            if (nextValue === null) {
                localStorage.removeItem(templateKey(prefix, i));
            } else {
                localStorage.setItem(
                    templateKey(prefix, i),
                    nextValue
                );
            }
        }
    }

    for (const prefix of [
        'template_',
        'checkbox_',
        'tmp_name_'
    ]) {
        localStorage.removeItem(
            templateKey(prefix, countOfTemplates)
        );
    }

    countOfTemplates--;

    localStorage.setItem(
        'cntTmplts' + languageTmplt,
        String(countOfTemplates)
    );

    reloadTemplates();
}

function sortTemplate(index, direction) {
    const swapIndex = index + direction;

    if (
        !Number.isInteger(index) ||
        (direction !== -1 && direction !== 1) ||
        swapIndex < 1 ||
        swapIndex > countOfTemplates
    ) {
        return;
    }

    saveVisibleTemplates();

    for (const prefix of [
        'template_',
        'checkbox_',
        'tmp_name_'
    ]) {
        const currentKey = templateKey(prefix, index);
        const swapKey = templateKey(prefix, swapIndex);

        const current = localStorage.getItem(currentKey);
        const swap = localStorage.getItem(swapKey);

        if (swap === null) {
            localStorage.removeItem(currentKey);
        } else {
            localStorage.setItem(currentKey, swap);
        }

        if (current === null) {
            localStorage.removeItem(swapKey);
        } else {
            localStorage.setItem(swapKey, current);
        }
    }

    reloadTemplates();
}

function sendTemplate(index) {
    const field = document.getElementById(
        `cstmTmpInp${languageTmplt}${index}`
    );

    const mainInput = document.getElementById('inp');
    const windowElement =
        document.getElementById('AF_CustomTemplates');

    if (!field || !mainInput) return;

    // Берём текущий текст из поля, даже если Save ещё не нажали.
    mainInput.value = field.value;
    mainInput.dispatchEvent(
        new Event('input', { bubbles: true })
    );

    if (windowElement) {
        windowElement.style.display = 'none';
    }
}

function reloadTemplates() {
    countOfTemplates = readTemplateCount();

    const container = document.getElementById('cstmTmplates');

    if (container) {
        container.replaceChildren();

        for (let i = 1; i <= countOfTemplates; i++) {
            addNewString(i);
        }
    }

    refreshHotTmps();
}

function refreshHotTmps() {
    // Контейнер быстрого меню из главного окна.
    const container = document.getElementById('6str');
    if (!container) return;

    container.replaceChildren();

    const templateCount = readTemplateCount();

    for (let i = 1; i <= templateCount; i++) {
        const checkbox = document.getElementById(
            `checkboxInp${languageTmplt}${i}`
        );

        const isChecked = checkbox
            ? checkbox.checked
            : localStorage.getItem(
                templateKey('checkbox_', i)
            ) === 'true';

        const name = localStorage.getItem(
            templateKey('tmp_name_', i)
        );

        if (!isChecked || !name) continue;

        const button = document.createElement('button');

        button.type = 'button';
        button.className =
            'glass-btn mainButton chmaf-custom-tmp-btn';

        button.textContent = name;

        button.addEventListener('click', () => {
            const savedText = localStorage.getItem(
                templateKey('template_', i)
            );

            const mainInput = document.getElementById('inp');

            if (savedText === null || !mainInput) return;

            mainInput.value = savedText.replace(/\\n/g, '\n');
            mainInput.dispatchEvent(
                new Event('input', { bubbles: true })
            );
        });

        container.append(button);
    }
}

// ============================================================
// Кнопки окна
// ============================================================

document.getElementById('testCustTMPL')?.addEventListener(
    'click',
    () => {
        const windowElement =
            document.getElementById('AF_CustomTemplates');

        if (!windowElement) return;

        windowElement.style.display =
            windowElement.style.display === 'block'
                ? 'none'
                : 'block';
    }
);

document.getElementById('addTemplate')?.addEventListener(
    'click',
    () => {
        // Иначе последующая смена языка/сортировка могла бы
        // потерять изменения в уже существующих строках.
        saveVisibleTemplates();

        countOfTemplates++;

        localStorage.setItem(
            'cntTmplts' + languageTmplt,
            String(countOfTemplates)
        );

        localStorage.setItem(
            templateKey('template_', countOfTemplates),
            ''
        );

        localStorage.setItem(
            templateKey('checkbox_', countOfTemplates),
            'false'
        );

        localStorage.setItem(
            templateKey('tmp_name_', countOfTemplates),
            ''
        );

        addNewString(countOfTemplates);
    }
);

document.getElementById('saveAllTemplates')?.addEventListener(
    'click',
    () => {
        saveVisibleTemplates();
        refreshHotTmps();
    }
);

// Добавить текст из главного окна как новый личный шаблон.
document.getElementById('addtocusttmplt')?.addEventListener(
    'click',
    () => {
        const mainInput = document.getElementById('inp');
        const text = mainInput?.value;

        if (!text) return;

        const addButton =
            document.getElementById('addTemplate');

        if (!addButton) return;

        addButton.click();

        const newField = document.getElementById(
            `cstmTmpInp${languageTmplt}${countOfTemplates}`
        );

        if (newField) {
            newField.value = text;

            // Сразу сохраняем текст нового шаблона.
            // Раньше в localStorage оставалась пустая строка.
            saveTemplate(countOfTemplates);
        }

        const windowElement =
            document.getElementById('AF_CustomTemplates');

        if (windowElement) {
            windowElement.style.display = 'block';
        }
    }
);

// При смене языка сохраняем видимые поля СТАРОГО языка
// до изменения languageTmplt.
languageAFbtn?.addEventListener('click', function () {
    saveVisibleTemplates();

    const switchToEnglish =
        this.textContent.trim() === 'Русский';

    this.textContent = switchToEnglish
        ? 'Английский'
        : 'Русский';

    languageTmplt = switchToEnglish
        ? 'en_'
        : '';

    document.body.classList.toggle(
        'chmaf-en-lang',
        switchToEnglish
    );

    reloadTemplates();
});

// Первичная загрузка.
reloadTemplates();