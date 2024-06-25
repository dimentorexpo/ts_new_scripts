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

if (location.host == "crm2.skyeng.ru") {
	let sidePanel = document.createElement('div') // Боковая панель
	sidePanel.id = "rightPane"
	sidePanel.style = 'position: fixed; top: 75px; right: 22px; z-index: 5; width: 40px; font-size: 22px; cursor: pointer; transition: all 0.5s ease;'
	sidePanel.classList.add('side-panel')
	document.body.append(sidePanel)

	let LessonInfoCRM = document.createElement('button') // Кнопка открытия меню просмотра статусов
	LessonInfoCRM.innerHTML = '🎓'
	LessonInfoCRM.style = 'width: 42px; height: 42px; margin-bottom:4px; font-size: 22px; cursor: pointer; border-radius: 50%; opacity:0.5; transition: all 0.5s ease;'
	LessonInfoCRM.id = 'butLessonInfoCRM'
	LessonInfoCRM.title = 'Проверка статуса уроков отмены, переносы, удаления'
	LessonInfoCRM.classList.add('rightPanelBtn','btnCRM')
	document.getElementById('rightPane').appendChild(LessonInfoCRM)
	
	let teacherNabor = document.createElement('button') 
	teacherNabor.innerHTML = '🚷'
	teacherNabor.style = 'width: 42px; height: 42px; margin-bottom:4px; font-size: 22px; cursor: pointer; border-radius: 50%; opacity:0.5; transition: all 0.5s ease;'
	teacherNabor.id = 'butTeacherNaborCRM'
	teacherNabor.title = 'Проверка открытия или закрытия набора учеников для П. ✅ - набор закрыт, ❌ - набор открыт'
	teacherNabor.classList.add('rightPanelBtn','btnCRM')
	document.getElementById('rightPane').appendChild(teacherNabor)

	let studentAP = document.createElement('button') 
	studentAP.innerHTML = '👽'
	studentAP.style = 'width: 42px; height: 42px; margin-bottom:4px; font-size: 22px; cursor: pointer; border-radius: 50%; opacity:0.5; transition: all 0.5s ease;'
	studentAP.id = 'butStudentAPCRM'
	studentAP.title = "Проверка доступности автоподбора для ученика"
	studentAP.classList.add('rightPanelBtn','btnCRM')
	document.getElementById('rightPane').appendChild(studentAP)
}
