function checkelementtype(a) { // проверка на какой элемент нажали
    let elem = document.elementFromPoint(a.clientX, a.clientY)

    if (elem.nodeName != 'BUTTON' && elem.nodeName != 'INPUT' && elem.nodeName != 'TEXTAREA' && elem.nodeName != 'SELECT' && elem.className != "checkbox-audio-switch-CRM") {
        return true;
    }
    return false;
}

function createWindow(id, topKey, leftKey, content) { // Функция для создания окна и настройки стилей
    const windowElement = document.createElement('div');
    document.body.append(windowElement);

    const storedTop = localStorage.getItem(topKey) || '120';
    const storedLeft = localStorage.getItem(leftKey) || '295';

    windowElement.classList.add('showedwindows');
    windowElement.style = `top: ${storedTop}px; left: ${storedLeft}px;`;
    windowElement.style.display = 'none';
    windowElement.setAttribute('id', id);
    windowElement.innerHTML = content;

    windowElement.onmousedown = function (event) {
        if (checkelementtype(event)) {
            let startX = event.clientX;
            let startY = event.clientY;
            let elemLeft = windowElement.offsetLeft;
            let elemTop = windowElement.offsetTop;

            function onMouseMove(event) {
                if (!(event.buttons & 1)) {
                    onMouseUp();
                    return;
                }
                let deltaX = event.clientX - startX;
                let deltaY = event.clientY - startY;

                windowElement.style.left = `${elemLeft + deltaX}px`;
                windowElement.style.top = `${elemTop + deltaY}px`;

                localStorage.setItem(topKey, String(elemTop + deltaY));
                localStorage.setItem(leftKey, String(elemLeft + deltaX));
            }

            document.addEventListener('mousemove', onMouseMove);

            function onMouseUp() {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            }

            document.addEventListener('mouseup', onMouseUp);
        }
    };

    return windowElement;
}

function hideWindowOnDoubleClick(id) { // Функция для скрытия окна по двойному клику
    const windowElement = document.getElementById(id);
    windowElement.ondblclick = function (a) {
        if (checkelementtype(a)) {
            setDisplayStyle(windowElement, 'none');
        }
    };
}

function hideWindowOnClick(windowId, buttonId) { // Функция для скрытия окна по клику на кнопку
    const windowElement = document.getElementById(windowId);
    const buttonElement = document.getElementById(buttonId);

    buttonElement.onclick = function () {
        setDisplayStyle(windowElement, 'none');
    };
}

const copyToClipboard = str => { // функция копирования в буфер обмена
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};