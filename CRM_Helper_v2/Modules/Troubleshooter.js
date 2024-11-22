const processedUserIds = {};

function addusersinfo() {
    // Функция для обработки элементов
    function processFields(elements, type) {
        elements.forEach((field) => {
            if (!field.hasAttribute('info-added')) {
                let userid = field.innerText || field.value;  // Для полей ввода используем value
                // Всегда вызываем getuserinfocrm
                getuserinfocrm(userid, field, type);
                field.setAttribute('info-added', 'true');
            }
        });
    }

    // Верхние строки с id
    let usersfields = document.getElementsByClassName('p-10 w-85');
    let infofields = document.querySelectorAll('.p-10.w-85[info-added]');
    
    // ID в столбцах
    let headerCell = Array.from(document.querySelectorAll('.cdk-header-cell')).filter(cell => /^\d+$/.test(cell.innerText));
    let headerCellinfo = Array.from(document.querySelectorAll('.cdk-header-cell[info-added]')).filter(cell => /^\d+$/.test(cell.innerText));
    
    // ID в списках
    let listfields = Array.from(document.querySelectorAll('.mat-option-text')).filter(cell => /^\d+$/.test(cell.innerText));
    let listfieldsinfo = Array.from(document.querySelectorAll('.mat-option-text[info-added]')).filter(cell => /^\d+$/.test(cell.innerText));

    // Окно с id в статистике
    let statfield = Array.from(document.querySelectorAll('[id^="mat-input-"]')).filter(cell => /^\d+$/.test(cell.value));
    let statfieldinfo = Array.from(document.querySelectorAll('[id^="mat-input-"][info-added]')).filter(cell => /^\d+$/.test(cell.value));

    // Обрабатываем usersfields
    if (usersfields.length > 0 && infofields.length < usersfields.length) {
        processFields(Array.from(usersfields), 'topline');
    }

    // Обрабатываем headerCell
    if (headerCell.length > 0 && headerCellinfo.length < headerCell.length) {
        processFields(headerCell, 'other');
    }

    // Обрабатываем listfields
    if (listfields.length > 0 && listfieldsinfo.length < listfields.length) {
        processFields(listfields, 'other');
    }

    // Обрабатываем statfield
    if (statfield.length > 0 && statfieldinfo.length < statfield.length) {
        processFields(statfield, 'input');
    }
}


function getuserinfocrm(userid, pageelement, elemtype) {
    // Проверяем, есть ли уже информация в объекте
    if (processedUserIds[userid] && processedUserIds[userid].readyflag === '1') {
        // Если данные уже есть, используем их для добавления информации
        addinginfo(pageelement, userid, elemtype);
        return;
    }

    // Если данных нет, делаем запрос к серверу
    const fetchURL = `https://backend.skyeng.ru/api/persons/${userid}?crm2=true&debugParam=person-page`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, function (response) {
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        }

        const userInfo = JSON.parse(response.fetchansver);
        const nameofuser = `${userInfo.data.name}${userInfo.data.surname ? ` ${userInfo.data.surname}` : ''}`;
        const flagusertype = userInfo.data.type;

        // Сохраняем данные в объект processedUserIds
        processedUserIds[userid] = {
            nameofuser,
            flagusertype,
            readyflag: '1'
        };

        // Добавляем информацию на страницу
        addinginfo(pageelement, userid, elemtype);
    });
}

function addinginfo(pageelement, userid, elemtype) {
    const flagusertype = processedUserIds[userid].flagusertype;
    const nameofuser = processedUserIds[userid].nameofuser;
    const userTypeStyles = {
        student: { text: '(У)', color: '#DC143C' },
        teacher: { text: '(П)', color: '#1E90FF' }
    };

    const { text, color } = userTypeStyles[flagusertype] || { text: '', color: '' };
    if (elemtype === 'input') {
        pageelement.value += text;
        return
    }
    const span = document.createElement('span');
    span.style.color = color;
    span.style.fontWeight = '600';
    span.innerText = text;

    if (elemtype === 'topline') {
        span.title = nameofuser;
        pageelement.style.width = '110px';
        pageelement.style.color = 'blue';
        pageelement.style.textDecoration = 'underline';
        pageelement.style.cursor = 'pointer';
        pageelement.tagName = 'A';
        pageelement.title = "ЛКМ - открыть пользователя в CRM. ПКМ - скопировать id"

        pageelement.addEventListener('click', () => {
            window.open(`https://crm2.skyeng.ru/persons/${userid}`);
        });

        pageelement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            copyToClipboard(userid)
            createAndShowButton('💾 Скопировано');
        });
    }

    pageelement.appendChild(span);
}

const observer = new MutationObserver(mutations => {
    const addedNodes = mutations.flatMap(mutation => Array.from(mutation.addedNodes));
    if (addedNodes.length > 0) {
        addusersinfo();
    }
});

observer.observe(document.body, { childList: true, subtree: true });