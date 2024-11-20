// Массив для хранения обработанных ID пользователей
const processedUserIds = [];
function addusersinfo() {
    let usersfields = document.getElementsByClassName('p-10 w-85');
    let infofields = document.querySelectorAll('[info-added]');
    
    
    if (usersfields.length > 0 && infofields.length < usersfields.length) {
        Array.from(usersfields).forEach((field) => {
            if (!field.hasAttribute('info-added')) {
                let userid = field.innerText;

                // Проверяем, есть ли уже ID в массиве
                if (!processedUserIds.includes(userid)) {
                    processedUserIds.push(userid); // Добавляем ID в массив
                    getuserinfocrm(userid, field);
                } else {
                    // Если ID уже есть, используем данные из массива
                    addinginfo(field, userid);
                    field.setAttribute('info-added', 'true');
                }
            }
        });
    }
}

function getuserinfocrm(userid, pageelement) {
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

        processedUserIds[userid] = { nameofuser, flagusertype };
        console.log(processedUserIds)
    });
}

function addinginfo(pageelement, userid, elemtype) {
    const userTypeStyles = {
        student: { text: '(У)', color: '#DC143C' },
        teacher: { text: '(П)', color: '#1E90FF' }
    };

    const { text, color } = userTypeStyles[flagusertype] || { text: '', color: '' };
    const span = document.createElement('span');
    span.style.color = color;
    span.style.fontWeight = '600';
    span.title = nameofuser;
    span.innerText = text;

    pageelement.style.width = '105px';
    pageelement.style.color = 'blue';
    pageelement.style.textDecoration = 'underline';
    pageelement.style.cursor = 'pointer';
    pageelement.appendChild(span);
    pageelement.tagName = 'A';
    
    pageelement.addEventListener('click', () => {
        window.open(`https://crm2.skyeng.ru/persons/${userid}`);
    });
}

const observer = new MutationObserver(mutations => {
    const addedNodes = mutations.flatMap(mutation => Array.from(mutation.addedNodes));
    if (addedNodes.length > 0) {
        addusersinfo();
    }
});

observer.observe(document.body, { childList: true, subtree: true });

/*
    const headerCell = document.querySelector(`.mat-column-${userid}.cdk-header-cell`);
    if (headerCell) {
        headerCell.appendChild(span.cloneNode(true));
    }
*/
