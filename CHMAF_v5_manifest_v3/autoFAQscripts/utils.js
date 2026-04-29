function createWindow(id, topKey, leftKey, content) { // Функция для создания окна и настройки стилей
    const windowElement = document.createElement('div');
    document.body.append(windowElement);

    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    if (id === 'TestUsers') {
        windowElement.classList.add('onlyfortp', 'testuserwindow');
    } else if (id === 'AF_addChatMenu') {
        windowElement.classList.add('wintInitializeChat');
    } else {
        windowElement.classList.add('extwindows');
    }

    windowElement.style = `top: ${storedTop}px; left: ${storedLeft}px; display: none;`;
    if (id === 'AF_Timetable' || id === 'AF_Grabber' || id === 'AF_GrList' || id === 'AF_SpecCommWindow') {
        windowElement.style.zIndex = '1100000'; // Установка z-index для специфических окон
    }
    windowElement.setAttribute('id', id);
    windowElement.innerHTML = content;

    windowElement.onmousedown = function (event) {
        if (checkelementtype(event)) {
            let startX = event.clientX;
            let startY = event.clientY;
            let elemLeft = windowElement.offsetLeft;
            let elemTop = windowElement.offsetTop;

            function onMouseMove(event) {
                let deltaX = event.clientX - startX;
                let deltaY = event.clientY - startY;

                // Вычисляем новые координаты с учетом границ экрана
                let newLeft = elemLeft + deltaX;
                let newTop = elemTop + deltaY;

                // Ограничения по ширине экрана
                // Получаем реальные размеры окна с учетом масштаба (scale)
                let rect = windowElement.getBoundingClientRect();
                let actualWidth = rect.width;
                let actualHeight = rect.height;

                // Ограничения по ширине экрана
                if (newLeft < 0) {
                    newLeft = 0;
                } else if (newLeft + actualWidth > window.innerWidth) {
                    newLeft = window.innerWidth - actualWidth;
                }

                // Ограничения по высоте экрана
                if (newTop < 0) {
                    newTop = 0;
                } else if (newTop + actualHeight > window.innerHeight) {
                    newTop = window.innerHeight - actualHeight;
                }

                windowElement.style.left = `${newLeft}px`;
                windowElement.style.top = `${newTop}px`;

                localStorage.setItem(topKey, String(newTop));
                localStorage.setItem(leftKey, String(newLeft));
            }

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mouseleave', onMouseUp);
            }

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('mouseleave', onMouseUp);
        }
    };


    return windowElement;
}

// Функция для получения данных из хранилища
async function getStorageData(keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function (result) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result);
            }
        });
    });
}

// Переписал на современный Fetch (намного стабильнее и чище, чем XMLHttpRequest)
async function getText() {
    try {
        const response = await fetch(scriptAdr);
        if (response.ok) {
            const data = await response.json();

            // ВАЖНО: Убрали window.table. Оставляем просто присваивание к вашей переменной table
            table = data.result;

            refreshTemplates();
        } else {
            console.error('Ошибка при загрузке шаблонов:', response.status);
        }
    } catch (e) {
        console.error('Сетевая ошибка getText:', e);
    }
}


function showNotification(message) { // отображает уведомление за счет API браузера
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") {
        new Notification(message);
        return true;
    }

    if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }

    return false;
}

function showCustomAlert(message) { // отображает кастомное уведомление
    const alertContainer = document.createElement('div');
    alertContainer.classList.add('extwindows', 'alert-container');

    const alertMessage = document.createElement('span');
    alertMessage.innerText = message;
    alertMessage.classList.add('alert-message');

    const closeButton = document.createElement('button');
    closeButton.innerText = 'OK';
    closeButton.classList.add('mainButton');
    closeButton.onclick = () => alertContainer.remove();

    alertContainer.append(alertMessage, closeButton);
    document.body.appendChild(alertContainer);
}

function notify(message, { useBrowser = true } = {}) { // Функция отправки уведомления в зависимости включен запрет в настройках или нет
    const browserAllowed = localStorage.getItem('brnotificatios') === '0';

    if (useBrowser && browserAllowed) {
        const shown = showNotification(message);
        if (shown) return;
    }

    showCustomAlert(message);
}

// Функции скрытия окна
function hideWindowOnDoubleClick(id) { // Функция для скрытия окна по двойному клику
    if (localStorage.getItem('dblhidewindow') == '0') {
        const windowElement = document.getElementById(id);
        windowElement.ondblclick = function (a) {
            if (checkelementtype(a)) {
                setDisplayStyle(windowElement, 'none');
            }
        };
    }
}

function hideWindowOnClick(windowId, buttonId) { // Функция для скрытия окна по клику на кнопку
    const windowElement = document.getElementById(windowId);
    const buttonElement = document.getElementById(buttonId);

    buttonElement.onclick = function () {
        setDisplayStyle(windowElement, 'none');
    };
}

function prepTp() {
    // Кэшируем часто используемые элементы
    const rightPanel = document.getElementById('rightPanel');
    const AF_Service = document.getElementById('AF_Service');

    // Фабрика для создания кнопок
    const createButton = ({ id, innerHTML, title, classes, onClick }) => {
        const button = document.createElement('button');
        button.id = id;
        button.innerHTML = innerHTML;
        button.title = title || '';
        button.className = ['onlyfortp', rightPanelBtn, 'mainButton'].concat(classes || []).join(' ');
        button.onclick = onClick;
        return button;
    };

    // Создаем кнопки через фабрику
    const buttons = [
        createButton({
            id: 'datsyCalendar',
            innerHTML: '📅',
            title: 'Открывает календарь Datsy',
            onClick: getdatsyCalendarButtonPress
        }),
        createButton({
            id: 'butServ',
            innerHTML: '⚜',
            onClick: function () {
                const isVisible = AF_Service.style.display !== 'none';
                AF_Service.style.display = isVisible ? 'none' : '';
                this.classList.toggle('activeScriptBtn', !isVisible);
            }
        }),
        createButton({
            id: 'knowledgeCenter',
            innerHTML: '💡',
            title: 'Открывает базу знаний решений неполадок',
            onClick: getknowledgeCenterButtonPress
        }),
        createButton({
            id: 'taskBut',
            innerHTML: '🛠',
            onClick: gettaskButButtonPress
        })
    ];

    // Добавляем все кнопки за один раз
    rightPanel.append(...buttons);

    // Отложенная инициализация
    setTimeout(() => rightPanel.appendChild(maskBack), 5000);

    // Таймеры
    flagLangBut = 1;
    setInterval(timerHideButtons, 500);

    // Обработка страницы логов
    if (location.pathname.split('/')[1] === "logs") {
        const emptyElement = document.querySelector('.ant-empty-description');
        if (emptyElement?.textContent === "Нет данных") {
            const parent = document.querySelector('.ant-table-title > div');
            if (!parent) return;

            const btnOpenInChatHis = createButton({
                innerHTML: '☢️',
                onClick: () => {
                    const chatHis = document.getElementById('AF_ChatHis');
                    if (chatHis.style.display === 'none') {
                        document.getElementById('opennewcat')?.click();
                    }
                    document.getElementById('hashchathis').value = location.pathname.split('/')[2];
                    btn_search_history.click();
                }
            });

            btnOpenInChatHis.style.cssText = 'width:30px; height:30px; margin-left:5px; font-size:16px; cursor:pointer';

            // Безопасная вставка кнопки
            if (parent.children.length >= 3) {
                parent.insertBefore(btnOpenInChatHis, parent.children[3]);
            }
        }
    }
}

function prepKC() { //функция подготовки расширения КЦ
    const languageSwitcher = document.querySelector('.user_menu-language_switcher');

    setDisplayStyle(languageSwitcher, localStorage.getItem('disablelngpmwindow') === '1' ? 'none' : '');

    let needtohide = Array.from(document.getElementsByClassName('onlyfortp'));
    needtohide.forEach(e => setDisplayStyle(e, 'none'));

    let needtoopen = Array.from(document.getElementsByClassName('onlyforkc'));
    needtoopen.forEach(e => setDisplayStyle(e, ''));

    flagLangBut = 1
}

// Функция копирования в буфер обмена
// Вспомогательная функция для надёжного копирования в content script
function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);

            const success = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (success) {
                resolve();
            } else {
                reject(new Error('execCommand("copy") failed'));
            }
        } catch (err) {
            reject(err);
        }
    });
}

// Вспомогательная функция для надёжного копирования в content script
function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '0';
            document.body.appendChild(textarea);

            textarea.focus();
            textarea.select();
            textarea.setSelectionRange(0, textarea.value.length);

            const success = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (success) {
                resolve();
            } else {
                reject(new Error('execCommand("copy") failed'));
            }
        } catch (err) {
            reject(err);
        }
    });
}

function getLoginLink(userid) {
    return new Promise((resolve, reject) => {
        if (!userid) {
            return reject(new Error("Пустой userId"));
        }

        const fetchURL = 'https://id.skyeng.ru/admin/auth/login-links';

        const body =
            `login_link_form%5Bid%5D=${encodeURIComponent(userid)}` +
            `&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru` +
            `&login_link_form%5Blifetime%5D=3600` +
            `&login_link_form%5Bcreate%5D=`;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
            credentials: 'include'
        };

        chrome.runtime.sendMessage(
            { action: 'getFetchRequest', fetchURL, requestOptions },
            (response) => {
                if (!response || response.success !== true) {
                    console.log('Ошибка при получении логинера: ', response?.error);
                    return reject(new Error(response?.error || "Неизвестная ошибка"));
                }

                const link = extractLoginLink(response.fetchAnswer || response.fetchansver);
                if (!link) {
                    console.log('Ссылка логинера не найдена');
                    return reject(new Error('Ссылка логинера не найдена'));
                }

                // ЗАМЕНА: вместо navigator.clipboard используем надёжный execCommand
                copyToClipboard(link)
                    .then(() => resolve(true))
                    .catch(err => {
                        console.log('Не удалось скопировать текст: ', err);
                        reject(err);
                    });
            }
        );
    });
}