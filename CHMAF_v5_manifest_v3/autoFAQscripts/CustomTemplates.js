if (localStorage.getItem('cntTmplts') == null) { localStorage.setItem('cntTmplts', 0) }; // Проврека кол-ва рус шаблонов
if (localStorage.getItem('cntTmpltsen_') == null) { localStorage.setItem('cntTmpltsen_', 0) }; // Проврека кол-ва англ шаблонов

let languageAFbtn = document.getElementById('languageAF'); // Кнопка смены языка
let languageTmplt = languageAFbtn.innerHTML === "Русский" ? '' : 'en_'; // язык кастомных шаблонов
let countOfTemplates = ''; // переменная для счетчика кол-ва шаблонов.

var win_CustomTemplates = `
    <div style="border: 2px double black; cursor: -webkit-grab; max-height: 80vh; overflow: hidden;" id="custom_templates_window">
        <div id="cstmTmplates" style="max-height: calc(80vh - 50px); overflow-y: auto; padding: 10px; border-top: 1px solid #768d87;">
        </div>
        <div style="margin: 5px; textAlign: center;">
            <button title="Скрытие меню" id="hideCustomTemplates" class="mainButton buttonHide" style="margin: 5px; float: right;">hide</button>
            <button id="addTemplate" title="Добавить новый шаблон" class="mainButton" style="margin: 5px;">Добавить шаблон</button>
            <button id="saveAllTemplates" title="Сохранить все шаблоны" class="mainButton" style="margin: 5px;">Сохранить всё</button>
        </div>
    </div>
`;

const winCustomTemplates = createWindow('AF_CustomTemplates', 'winTopCustomTemplates', 'winLeftCustomTemplates', win_CustomTemplates);
hideWindowOnDoubleClick('AF_CustomTemplates');
hideWindowOnClick('AF_CustomTemplates', 'hideCustomTemplates');

document.getElementById('testCustTMPL').onclick = function () {
    document.getElementById('AF_CustomTemplates').style.display = document.getElementById('AF_CustomTemplates').style.display === '' ? 'none' : '';
};

const cstmTmp = document.getElementById('cstmTmplates');
const strokaCustTempl = document.getElementById('6str');

function addNewString(index) {
    const checkboxValue = localStorage.getItem('checkbox_' + languageTmplt + index) === 'true';
    const tmpNameValue = localStorage.getItem('tmp_name_' + languageTmplt + index) || '';
    const templateValue = localStorage.getItem('template_' + languageTmplt + index).replace(/\\n/g, '\n') || '';

    const CustomTemplatesLine = `
       <div style="margin: 5px; border: 2px solid darkblue; display: flex; align-items: center;" inp="cstmTmpInp${languageTmplt}${index}" tmp="template_${languageTmplt}${index}" index="${index}">
            <input id="checkboxInp${languageTmplt}${index}" type="checkbox" style="margin-right: 5px;" ${checkboxValue ? 'checked' : ''}>
            <input id="tmpNameInp${languageTmplt}${index}" style="margin-right: 5px; width: 150px;" class="${exttheme}">
            <button id="sortUpBtn${index}" style="width: 20px;" class="mainButton">↑</button>
            <button id="sortDownBtn${index}" style="margin-right: 5px; width: 20px;" class="mainButton">↓</button>
            <button id="deleteBtn${index}" style="margin-right: 5px;" class="mainButton">delete</button>
            <button id="saveBtn${index}" style="margin-right: 5px;" class="mainButton">save</button>
            <textarea id="cstmTmpInp${languageTmplt}${index}" style="margin-right: 5px; width: 500px; min-height: 28px;" class="${exttheme}"></textarea>
            <button id="sendBtn${index}" style="margin-right: 5px;" class="mainButton">send</button>
        </div>
    `;

    cstmTmp.insertAdjacentHTML('beforeend', CustomTemplatesLine);

    // Устанавливаем значения текста в input через JavaScript
    const tmpNameInput = document.getElementById(`tmpNameInp${languageTmplt}${index}`);
    tmpNameInput.value = tmpNameValue;

    const templateInput = document.getElementById(`cstmTmpInp${languageTmplt}${index}`);
    templateInput.value = templateValue;

    // Обработчик для чекбокса
    const checkboxInput = document.getElementById(`checkboxInp${languageTmplt}${index}`);
    checkboxInput.checked = checkboxValue;
    checkboxInput.onchange = function () {
        localStorage.setItem('checkbox_' + languageTmplt + index, this.checked);
        refreshHotTmps();
    };

    // Привязываем события кнопкам
    document.getElementById(`sortUpBtn${index}`).onclick = () => sortTemplate(index, -1);
    document.getElementById(`sortDownBtn${index}`).onclick = () => sortTemplate(index, 1);
    document.getElementById(`deleteBtn${index}`).onclick = () => deleteTemplate(index);
    document.getElementById(`saveBtn${index}`).onclick = () => saveTemplate(index);
    document.getElementById(`sendBtn${index}`).onclick = () => sendTemplate(index);
}

function saveTemplate(index) {
    const parent = document.querySelector(`[tmp="template_${languageTmplt}${index}"]`);
    const inputValue = parent.querySelector(`#cstmTmpInp${languageTmplt}${index}`).value.replace(/\n/g, '\\n');
    localStorage.setItem(parent.getAttribute('tmp'), inputValue);
    localStorage.setItem('tmp_name_' + languageTmplt + index, parent.children[1].value);
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
    const text = localStorage.getItem('template_' + languageTmplt + index).replace(/\\n/g, '\n');
    document.getElementById('inp').value = text;
    document.getElementById('AF_CustomTemplates').style.display = 'none';
}

function reloadTemplates() {
    countOfTemplates = localStorage.getItem('cntTmplts' + languageTmplt);
    while (cstmTmp.firstChild) cstmTmp.firstChild.remove();
    for (let i = 1; i <= countOfTemplates; i++) addNewString(i);
    refreshHotTmps();
}

function refreshHotTmps() {
    while (strokaCustTempl.firstChild) strokaCustTempl.firstChild.remove();
    countOfTemplates = localStorage.getItem('cntTmplts' + languageTmplt);
    for (let i = 1; i <= countOfTemplates; i++) {
        const isChecked = cstmTmp.children[i - 1]?.children[0]?.checked;
        const tmpName = localStorage.getItem('tmp_name_' + languageTmplt + i);
        if (!isChecked || !tmpName) continue;
        const templateButtonHTML = `<button template="template_${languageTmplt}${i}" style="margin-right: 5px; margin-top: 5px;" class="mainButton">${tmpName}</button>`;
        strokaCustTempl.insertAdjacentHTML('beforeend', templateButtonHTML);
        const newButton = strokaCustTempl.lastChild;
        newButton.onclick = function () {
            const text = localStorage.getItem(this.getAttribute('template')).replace(/\\n/g, '\n');
            document.getElementById('inp').value = text;
        };
    }
}

document.getElementById('addTemplate').onclick = function () {
    countOfTemplates++;
    localStorage.setItem('cntTmplts' + languageTmplt, countOfTemplates);
    localStorage.setItem('template_' + languageTmplt + countOfTemplates, "");
    localStorage.setItem('checkbox_' + languageTmplt + countOfTemplates, false);
    localStorage.setItem('tmp_name_' + languageTmplt + countOfTemplates, "");
    addNewString(countOfTemplates);
};

document.getElementById('saveAllTemplates').onclick = function () {
    for (var i = 1; i <= countOfTemplates; i++) {
        const inputValue = document.getElementById('cstmTmpInp' + languageTmplt + i).value.replace(/\n/g, '\\n');
        localStorage.setItem('template_' + languageTmplt + i, inputValue);
        localStorage.setItem('checkbox_' + languageTmplt + i, document.getElementById('cstmTmpInp' + languageTmplt + i).parentElement.children[0].checked);
        localStorage.setItem('tmp_name_' + languageTmplt + i, document.getElementById('cstmTmpInp' + languageTmplt + i).parentElement.children[1].value);
    }
    refreshHotTmps();
};

languageAFbtn.onclick = function () {
    if (this.innerHTML == "Русский") {
        this.innerHTML = "Английский";
        languageTmplt = 'en_';
        document.getElementById('AF_helper').style.background = "#EBC7DF"
    } else {
        this.innerHTML = "Русский";
        languageTmplt = '';
        document.getElementById('AF_helper').style.background = "#464451"
    }
    reloadTemplates();
};

document.getElementById('addtocusttmplt').onclick = function () {
    const tmplttetx = document.getElementById('inp').value;
    if (tmplttetx) {
        document.getElementById('addTemplate').click();
        const templateInput = document.getElementById(`cstmTmpInp${languageTmplt}${countOfTemplates}`);
        templateInput.value = tmplttetx;
        document.getElementById('AF_CustomTemplates').style.display = '';
    }
};

reloadTemplates();