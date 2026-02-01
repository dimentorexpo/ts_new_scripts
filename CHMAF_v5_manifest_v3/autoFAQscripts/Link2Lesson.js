var win_link2less = `
<div class="link2less-window">
    <div class="link2less-head" id="link2lesshead">
        <button title="Скрывает меню" id="hideMelink2less" class="mainButton buttonHide">hide</button>
        <button class="mainButton" id="clrlink2less" title="Очищает поля">🧹</button>
        <button class="mainButton about-btn" id="aboutlink2less" title="Инструкция по этой форме">❓</button>
    </div>

    <div class="link2less-row">
        <select class="${exttheme}" id="subjecttype2less">
            <option disabled selected value="subjnotselect" class="option-warning">Выбери предмет</option>
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
            <option value="turkish">Турецкий</option>
            <option value="spanish">Испанский</option>
            <option value="portuguese">Португальский</option>
            <option value="korean">Корейский</option>
            <option value="japanese">Японский</option>
            <option value="italian">Итальянский</option>
            <option value="greek">Греческий</option>
            <option value="german">Немецкий</option>
            <option value="french">Французский</option>
            <option value="chinese">Китайский</option>
        </select>
    </div>

    <div class="link2less-row">
        <input class="${exttheme}" id="hashforroom"
               placeholder="Введи хэш комнаты"
               title="Введи хэш комнаты, чтобы получить ссылку"
               autocomplete="off" type="text">
    </div>

    <div class="link2less-row checkboxes">
        <label><input type="checkbox" id="itisvebinar"> Ссылка на Вебинар</label>
        <label><input type="checkbox" id="itishomework"> Ссылка на ДЗ</label>
    </div>

    <div class="link2less-row">
        <button id="createlink2less" title="Создать ссылку" class="mainButton testroomscreate">
            Скопировать ссылку на урок
        </button>
    </div>
</div>`;

const wintlink2less = createWindow('AF_link2less', 'winToplink2less', 'winLeftlink2less', win_link2less);
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

itisvebinar.addEventListener('change', () => {
    if (itisvebinar.checked) itishomework.checked = false;
});

itishomework.onclick = function () {
    if (itishomework.checked && itisvebinar.checked)
        itisvebinar.checked = false;
};

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

document.getElementById('createlink2less').addEventListener('click', function () {
    const subjectSelect = document.getElementById('subjecttype2less');
    const hashInput = document.getElementById('hashforroom');
    const subject = subjectSelect.value;
    const hash = hashInput.value.trim();

    const errors = [];

    // Проверка предмета
    if (subject === 'subjnotselect') {
        errors.push('Не выбран предмет');
    }

    // Проверка хэша (оставил как ты просил)
    if (!/^[a-zA-Z0-9]{12,}$/.test(hash)) {
        errors.push('Хэш комнаты должен состоять из не менее чем 12 латинских символов или цифр');
    }

    // Если есть ошибки — показываем и выходим
    if (errors.length > 0) {
        createAndShowButton(errors.join('<br>'), 'error');
        return;
    }

    // Опции ссылки
    let otherOptions = '';
    if (itisvebinar.checked) {
        otherOptions = '?player=true';
    } else if (itishomework.checked) {
        otherOptions = '?homework=true';
    }

    // Формируем ссылку
    const link = `https://vimbox.skyeng.ru/kids/${subject}/room/${hash}${otherOptions}`;

    // Копируем
    copyToClipboard(link);
    createAndShowButton('Ссылка скопирована в буфер обмена', 'message');

    // Очищаем поля
    clearlink2lessfields();

    // Закрываем окно через 5 сек
    setTimeout(() => {
        document.getElementById('AF_link2less').style.display = 'none';
    }, 5000);
});
