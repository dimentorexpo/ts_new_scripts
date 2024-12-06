function customTemplates(language = '') { //собственные шаблоны и их добавление



    var buttonOpenTmpWindow = document.createElement('button')
    buttonOpenTmpWindow.innerHTML = '📒'
    buttonOpenTmpWindow.id = 'testCustTMPL'
    buttonOpenTmpWindow.classList.add('mainButton')
    buttonOpenTmpWindow.title = 'Открывает окно для добавления своих шаблонов либо информации в ячейки в этом поле'
    //buttonOpenTmpWindow.style.marginLeft = '7px'
    buttonOpenTmpWindow.onclick = function () {
        var a = document.getElementById('cstmTmplates')
        if (a.style.display == '')
            a.style.display = 'none'
        else
            a.style.display = ''
    }

    var tmpA = document.getElementById('AF_helper').children[0].children[0].children[0].children[0]
    if (tmpA.children[1].innerHTML != '📒')
        tmpA.insertBefore(buttonOpenTmpWindow, tmpA.children[1])