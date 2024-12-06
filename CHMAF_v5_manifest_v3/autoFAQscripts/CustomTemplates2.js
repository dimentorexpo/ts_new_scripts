if (localStorage.getItem('cntTmplts') == null)
    localStorage.setItem('cntTmplts', 0)
if (localStorage.getItem('cntTmpltsen_') == null)
    localStorage.setItem('cntTmpltsen_', 0)

let languageAFbtn = document.getElementById('languageAF');
let languageTmplt = languageAFbtn.innerHTML === "Русский" ? '' : 'en_';

var win_CustomTemplates = `
    <div style="border: 2px double black; cursor: -webkit-grab; width: 500px; max-height: 80vh; overflow: hidden;" id="custom_templates_window">
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

let cstmTmp = document.getElementById('cstmTmplates');


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
        localStorage.setItem('template_' + languageTmplt + i, document.getElementById('cstmTmpInp' + languageTmplt + i).value);
        localStorage.setItem('checkbox_' + languageTmplt + i, document.getElementById('cstmTmpInp' + languageTmplt + i).parentElement.children[0].checked);
        localStorage.setItem('tmp_name_' + languageTmplt + i, document.getElementById('cstmTmpInp' + languageTmplt + i).parentElement.children[1].value);
    }
    refreshHotTmps();
};


document.getElementById('languageAF').onclick = function () {
    if (this.innerHTML == "Русский") {
        this.innerHTML = "Английский";
        languageTmplt = 'en_';
        document.getElementById('AF_helper').style.background = "#EBC7DF"
        customTemplates('en_')
    } else {
        this.innerHTML = "Русский";
        languageTmplt = '';
        document.getElementById('AF_helper').style.background = "#464451"
        customTemplates()
    }
}
