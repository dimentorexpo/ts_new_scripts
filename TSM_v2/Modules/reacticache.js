function addbuttonhesh() {
    let headers = document.querySelectorAll(".header");

    headers.forEach(headarea => {
        if (headarea.innerText == "Уроки" && !headarea.querySelector("#reactcachebtn")) {
            let reactcachebtn = document.createElement('span');
            reactcachebtn.id = "reactcachebtn";
            reactcachebtn.textContent = "👨‍👩‍👧‍👦";
            reactcachebtn.style = 'cursor: pointer; right: 15px; position: absolute;';
            reactcachebtn.title = "Очистить реактивный кэш, для обновления отображаемого списка учеников выбранного типа уроков";
            headarea.appendChild(reactcachebtn);
            reactcachebtn.onclick = ClearReactCashe;
        }
    });
}

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length || mutation.type === 'childList') {
            addbuttonhesh();
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});


function getTeachToken() {
    const tokenPrefix = 'token_global=';
    return document.cookie.split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(tokenPrefix))
        ?.substring(tokenPrefix.length);
}


function ClearReactCashe() {
    let myToken = getTeachToken();
    if (!myToken) {
        console.error('Токен не найден');
        return;
    }

    const urlBase = 'https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/';
    const urlSegments = document.URL.split('/');
    const urlmatches = ['personal', 'parallel', 'group', 'webinar'];
    const currentSegment = urlSegments[7].split("?")[0];

    if (urlmatches.includes(currentSegment)) {
        let fullUrl = urlBase + currentSegment;
        console.log(fullUrl);

        fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${myToken}`
            },
            body: JSON.stringify({ refreshCache: 1 })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Сетевой ответ был неудачным');
                }
                return response.json();
            })
            .then(data => {
                console.log('Данные ответа:', data);
            })
            .catch(error => {
                console.error('Произошла ошибка при выполнении запроса:', error);
            });
    } else {
        console.error('Сегмент URL не соответствует ни одному из указанных шаблонов.');
    }
}