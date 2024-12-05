if (localStorage.getItem('cntTmplts' + language) == null)
    localStorage.setItem('cntTmplts' + language, 0)

var win_CustomTemplates = `
    <div style="border: 2px double black; cursor: -webkit-grab; width: 500px; max-height: 80vh; overflow: hidden;" id="custom_templates_window">
        <div>
            <button title="Скрытие меню" id="hideCustomTemplates" class="mainButton buttonHide" style="margin: 5px; float: left;">hide</button>
            <button id="saveAllTemplates" title="Сохранить все шаблоны" class="mainButton" style="margin: 5px; float: right;">Сохранить всё</button>
            <button id="addTemplate" title="Добавить новый шаблон" class="mainButton" style="margin: 5px; float: right;">Добавить шаблон</button>
        </div>
        <div id="cstmTmplates" style="max-height: calc(80vh - 50px); overflow-y: auto; padding: 10px; border-top: 1px solid #768d87;">
        </div>
    </div>
`;


const winCustomTemplates = createWindow('AF_CustomTemplates', 'winTopCustomTemplates', 'winLeftCustomTemplates', win_CustomTemplates);
hideWindowOnDoubleClick('AF_CustomTemplates');
hideWindowOnClick('AF_CustomTemplates', 'hideCustomTemplates');


document.getElementById('languageAF').onclick = function () {
    if (this.innerHTML == "Русский") {
        this.innerHTML = "Английский";
        document.getElementById('AF_helper').style.background = "#EBC7DF"
        customTemplates('en_')
    } else {
        this.innerHTML = "Русский";
        document.getElementById('AF_helper').style.background = "#464451"
        customTemplates()
    }
}

document.getElementById('addTemplate').onclick = function () {
    countOfTemplates++;
    localStorage.setItem('cntTmplts' + language, countOfTemplates);
    localStorage.setItem('template_' + language + countOfTemplates, "");
    localStorage.setItem('checkbox_' + language + countOfTemplates, false);
    localStorage.setItem('tmp_name_' + language + countOfTemplates, "");
    addNewString(countOfTemplates);
};

document.getElementById('saveAllTemplates').onclick = function () {
    for (var i = 1; i <= countOfTemplates; i++) {
        localStorage.setItem('template_' + language + i, document.getElementById('cstmTmpInp' + language + i).value);
        localStorage.setItem('checkbox_' + language + i, document.getElementById('cstmTmpInp' + language + i).parentElement.children[0].checked);
        localStorage.setItem('tmp_name_' + language + i, document.getElementById('cstmTmpInp' + language + i).parentElement.children[1].value);
    }
    refreshHotTmps();
};
