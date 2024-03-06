var win_link2less =  // описание элементов окна создания тестовых комнат
    `<div style="display: flex; width: 260px;">
        <span style="width: 260px">
            <span style="cursor: -webkit-grab;">
                <div style="width: 260px; margin: 5px;" id="link2lesshead">
                    <button title="скрывает меню" id="hideMelink2less" class="mainButton buttonHide">hide</button>
                    <button class="mainButton" id="clrlink2less" title="По нажатию очищает поля" style="width:24px;">🧹</button>
                    <button class="mainButton" id="aboutlink2less" style="width:24px; float: right; margin-right: 10px;" title="Инструкция по этой форме">❓</button>
                </div>

				<div style="width: 260px; margin:5px; display:flex; justify-content:left;">
                    <select id="subjecttype2less" style="text-align: center; width: 240px; height: 26px; color: black; margin-left: 7px;">
                        <option disabled="" selected="" value="subjnotselect" style="background-color: orange; color: white;">Выбери предмет</option>
                        <option value="english">Английский</option>
                        <option value="biology">Биология</option>
                        <option value="geography">География</option>
                        <option value="preschool">Дошкольная математика</option>
                        <option value="history">История</option>
                        <option value="computer-science">Компьютерные курсы</option>
                        <option value="literature">Литература</option>
                        <option value="math">Математика</option>
                        <option value="social-science">Обществознание</option>
                        <option value="russian">Русский язык</option>
                        <option value="physics">Физика</option>
                        <option value="chemistry">Химия</option>
                        <option value="chess">Шахматы</option>
                    </select>
                </div>

                <div style="width: 260px; margin:5px; display:flex; justify-content:left;">
                    <input id="hashforroom" placeholder="Введи хэш комнаты" title="Введи хэш комнаты на которую получить ссылку" autocomplete="off" type="text" style="text-align: center; width: 240px; color: black; margin-left: 5px;">
    			</div>

                <div style="width: 260px; margin:2px; display:flex; justify-content:left;">
                    <label style="color:bisque; margin-left: 5px;"><input type="checkbox" id="itisvebinar">Ссылка на Вебинар</label>
                    <label style="color:bisque; margin-left: 5px;"><input type="checkbox" id="itishomework">Ссылка на ДЗ</label>
                </div>
                <div style="width: 260px; margin:5px; display:flex; justify-content:left;">
                    <button id="createlink2less" title="Тут и так понятно" class="mainButton testroomscreate">Скопровать ссылку на урок</button>
                </div>
                <div style="width: 260px; margin:5px; display:flex; justify-content:left;">
                <label id="link2lessmessage" style="color:bisque; width:250px; text-align: center; border: 1px solid #3e4f55; background: rgb(70, 68, 81); border-radius: 10px; font-size: 15px; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%);"></label>
                </div>
            </span>
        </span>
    </div>`;

const wintlink2less = createWindow('AF_link2less', 'winToplink2less', 'winLeftlink2less', win_link2less);
const link2lessfield = document.getElementById('link2lessmessage');
link2lessfield.display = 'none';
const itisvebinar = document.getElementById('itisvebinar');
const itishomework = document.getElementById('itishomework');

function getlink2lessButtonPress() { //открывает окно создания тестовых комнат
    const AF_link2less = document.getElementById('AF_link2less');
    setDisplayStyle(AF_link2less, AF_link2less.style.display === '' ? 'none' : '');
    toggleButtonState('link2lessbtn', 'active');
    setTimeout(() => toggleButtonState('link2lessbtn', 'active'), 500);
}

function clearlink2lessfields() { // очистка полей окно создания тестовых комнат
    document.getElementById('hashforroom').value = '';
    itisvebinar.checked = false
    itishomework.checked = false
    document.getElementById('subjecttype2less').children[0].selected = true;
}

itisvebinar.onclick = function () {
    if (itisvebinar.checked && itishomework.checked)
        itishomework.checked = false;
};

itishomework.onclick = function () {
    if (itishomework.checked && itisvebinar.checked)
        itisvebinar.checked = false;
};

function link2lessshowmessage(type, text) { // вывод уведомлений
    if (type == 'error') {
        link2lessfield.style.background = '#d5484f';
    } else if (type == 'message') {
        link2lessfield.style.background = '#46d17e';
    } else {
        console.log('Получен неизвестный тип сообщения');
        link2lessfield.style.background = 'rgb(70, 68, 81)';
    }

    link2lessfield.innerText = text;
    link2lessfield.display = '';
    setTimeout(link2lesshidemessage, 5000)
}

function link2lesshidemessage() { //скрытие уведомлений
    link2lessfield.display = 'none';
    link2lessfield.innerText = '';
    link2lessfield.style.background = 'rgb(70, 68, 81)';
}

function openlink2lesshelp() { // Открывает раздел в Confluence по созданию тестовых комнат
    window.open("https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-link2less%D0%9E%D0%BA%D0%BD%D0%BE%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F%D1%81%D1%81%D1%8B%D0%BB%D0%BA%D0%B8%D0%BD%D0%B0%D1%83%D1%80%D0%BE%D0%BA")
}


document.getElementById("clrlink2less").addEventListener("click", clearlink2lessfields);
document.getElementById("aboutlink2less").addEventListener("click", openlink2lesshelp);
document.getElementById("hideMelink2less").addEventListener("click", function () {
    if (document.getElementById('AF_link2less').style.display == '')
        document.getElementById('AF_link2less').style.display = 'none'
});
document.getElementById('link2lesshead').addEventListener('dblclick', function () {
    document.getElementById('AF_link2less').style.display = 'none';
})

document.getElementById('createlink2less').addEventListener('click', function () { // добавляем тестовую комнату
    let flagemptyttfields = '0';
    let hashforroomless = '';
    let lessonsubjecttype = '';
    let massagetexttoshow = '';
    let otheroptions = '';
    let link2lesson = '';


    if (document.getElementById('subjecttype2less').value == 'subjnotselect') { // проверяем выбран ли предмет
        flagemptyttfields = '1';
        massagetexttoshow += 'Не выбран предмет\n'
    } else { lessonsubjecttype = document.getElementById('subjecttype2less').value }

    if (!/^[a-zA-Z]{12,}$/.test(document.getElementById('hashforroom').value.trim())) {
        flagemptyttfields = '1';
        massagetexttoshow += 'Хэш комнаты должен состоять из не менее чем 12 латинских символов\n'
    } else {
        hashforroomless = document.getElementById('hashforroom').value.trim();
    }


    if (flagemptyttfields === '0') {
        if (itisvebinar.checked) {
            otheroptions = '?player=true';
        } else if (itishomework.checked) {
            otheroptions = '?homework=true'
        }
        link2lesson = `https://vimbox.skyeng.ru/kids/${lessonsubjecttype}/room/${hashforroomless}${otheroptions}`;
        copyToClipboard(link2lesson);
        link2lessshowmessage('message', 'Ссылка скопирована в буфер обмена');
        clearlink2lessfields()
        setTimeout(() => {
            document.getElementById('AF_link2less').style.display = 'none'; 
        }, 5000);

    } else {
        link2lessshowmessage('error', massagetexttoshow);
    }
})