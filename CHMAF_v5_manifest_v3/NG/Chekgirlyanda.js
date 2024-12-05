var slejeniezaelkoy; // Переменная для хранения экземпляра MutationObserver
var slejeniezaelkoy; // Глобальная переменная для хранения экземпляра MutationObserver

//Блок для снежинок
const snowflakes = [];
const maxSnowflakes = 100; // Максимальное количество снежинок
let lastMouseMove = 0;
let isSnowing = false; // Флаг для проверки, активен ли обработчик

const checkgirlyanda = `
    <div>
        <label style="color:bisque; margin: 10px;">Создать новогоднее настроение ?</label>
        <select class="${exttheme}" id="NGgirlyand" style="text-align: center; width: 240px; height: 26px; margin-left: 7px;">
            <option value="0">Нет</option>
            <option value="1">Гирлянда</option>
            <option value="2">Елочные игрушки</option>
        </select>
        <br>
        <label style="color:bisque; margin-left: 5px;"><input type="checkbox" id="checksnow">Из курсора идет снег</label>
        <label style="color:bisque; margin-left: 5px;"><input type="checkbox" id="checkelka">Показывать Ёлку</label>
    </div>
`;

function checkloadsettings() {
    const settingsis = document.getElementById('set_bar');

    if (settingsis) {
        const girlyandaset = document.createElement('div');
        girlyandaset.innerHTML = checkgirlyanda; // Убедитесь, что переменная checkgirlyanda определена и содержит необходимый HTML
        settingsis.append(girlyandaset);

        const savedValuegirl = localStorage.getItem('girlyanda');
        const girlyandSelect = document.getElementById('NGgirlyand');
        if (girlyandSelect) {
            if (savedValuegirl !== null) {
                girlyandSelect.value = savedValuegirl;
            }
            girlyandSelect.addEventListener('change', handleGirlyandChange);
        }
        const savedValuesnow = localStorage.getItem('snowcursor');
        const snowSelect = document.getElementById('checksnow');
        if (snowSelect) {
            if (savedValuesnow == 0) {
                snowSelect.checked = false;
            } else {
                snowSelect.checked = true;
            }
            snowSelect.addEventListener('change', handleSnowChange);
        }
        const savedValueelka = localStorage.getItem('AF_elka');
        const ElkaSelect = document.getElementById('checkelka');
        if (ElkaSelect) {
            if (savedValueelka == 0) {
                ElkaSelect.checked = false;
            } else {
                ElkaSelect.checked = true;
            }
            ElkaSelect.addEventListener('change', handleelkaChange);
        }
    } else {
        setTimeout(checkloadsettings, 1000);
    }
}

function checkAndSetGirlyanda() {
    if (localStorage.getItem('girlyanda') === null) {
        var modal = document.createElement('div');
        modal.classList.add('extwindows');
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.padding = '20px';
        modal.style.width = '350px';

        // Первая строка текста
        var modalText1 = document.createElement('p');
        modalText1.style.color = 'rgb(121 175 21)';
        modalText1.style.fontSize = '16px';
        modalText1.innerText = "Хотите ли вы включить новогоднее настроение?";
        modal.appendChild(modalText1);

        // Вторая строка текста
        var modalText2 = document.createElement('p');
        modalText2.style.color = 'bisque';
        modalText2.innerText = "(в дальнейшем его можно включить/отключить в настройках расширения)";
        modal.appendChild(modalText2);

        var yesButton = document.createElement('button');
        yesButton.classList.add('mainButton');
        yesButton.style.width = '140px';
        yesButton.innerText = 'Да';
        yesButton.onclick = function () {
            localStorage.setItem('snowcursor', '1');
            localStorage.setItem('girlyanda', '1');
            localStorage.setItem('AF_elka', '1');
            startgirlyand1();
            elkaadd()
            document.getElementById('NGgirlyand')[1].selected = true;
            modal.remove();
        };

        var noButton = document.createElement('button');
        noButton.classList.add('mainButton');
        noButton.style.width = '140px';
        noButton.style.marginLeft = '10px';
        noButton.innerText = 'Нет';
        noButton.onclick = function () {
            localStorage.setItem('girlyanda', '0');
            localStorage.setItem('snowcursor', '0');
            localStorage.setItem('AF_elka', '0');
            modal.remove();
        };

        modal.appendChild(yesButton);
        modal.appendChild(noButton);

        // Отображение модального окна
        document.body.appendChild(modal);
    }
    checkloadsettings();
}

if (!localStorage.getItem('girlyanda')){
    checkAndSetGirlyanda()
} else {
    checkloadsettings()
}

function handleGirlyandChange() {
    const girlyandSelect = document.getElementById('NGgirlyand');
    const selectedValue = girlyandSelect.value;

    localStorage.setItem('girlyanda', selectedValue);

    if (selectedValue === "0") {
        stopgirlyand1();
        stopgirlyand2();
    } else if (selectedValue === "1") {
        stopgirlyand2();
        startgirlyand1();
    } else if (selectedValue === "2") {
        stopgirlyand1();
        startgirlyand2();
    }
}

function handleSnowChange() {
    const snowSelect = document.getElementById('checksnow');

    if (!snowSelect.checked) {
        localStorage.setItem('snowcursor', '0');
        stopSnowing();
    } else {
        localStorage.setItem('snowcursor', '1');
        startSnowing();
    }
}

function handleelkaChange() {
    const snowSelect = document.getElementById('checkelka');

    if (!snowSelect.checked) {
        localStorage.setItem('AF_elka', '0');
        elkaremove()
    } else {
        localStorage.setItem('AF_elka', '1');
        elkaadd()
    }
}

// Функция для запуска создания снежинок
function startSnowing() {
    if (!isSnowing) {
      document.addEventListener('mousemove', mouseSnowing);
      isSnowing = true;
    }
  }
  
  // Функция для остановки создания снежинок
  function stopSnowing() {
    if (isSnowing) {
      document.removeEventListener('mousemove', mouseSnowing);
      isSnowing = false;
    }
  }

// Обработчик движения мыши
function mouseSnowing(event) {
    const now = performance.now();
    if (now - lastMouseMove > 16) { // Ограничиваем до 60 FPS
      requestAnimationFrame(() => createSnowflake(event));
      lastMouseMove = now;
    }
  }

function createSnowflake(event) {
    if (snowflakes.length >= maxSnowflakes) {
      const oldSnowflake = snowflakes.shift(); // Удаляем старую снежинку из массива
      oldSnowflake.remove(); // Удаляем её из DOM
    }
  
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
  
    // Устанавливаем случайный размер снежинки
    const size = `${Math.random() * 4 + 1}px`; // Размер от 5px до 15px
    snowflake.style.width = size;
    snowflake.style.height = size;
  
    // Устанавливаем позицию снежинки в точке курсора
    snowflake.style.left = `${event.clientX}px`;
    snowflake.style.top = `${event.clientY}px`;
  
    // Случайная продолжительность падения снежинки
    snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
  
    // Добавляем снежинку в тело документа
    document.body.appendChild(snowflake);
  
    snowflakes.push(snowflake);
  
    // Удаляем снежинку из DOM после завершения анимации
    setTimeout(() => {
      snowflake.remove();
      const index = snowflakes.indexOf(snowflake);
      if (index > -1) {
        snowflakes.splice(index, 1);
      }
    }, parseFloat(snowflake.style.animationDuration) * 1000);
  }

if (localStorage.getItem('snowcursor') == '1') {startSnowing()}


if (localStorage.getItem('AF_elka') == '1') {
    elkaadd()
}

function elkaadd() {
    // Проверяем, существует ли элемент app-sider
    var appSider = document.getElementsByClassName('app-sider')[0];
    if (appSider) {
        addElka(appSider);
    } else {
        // Если элемента пока нет, создаем новый MutationObserver для отслеживания его появления
        var observerForAppSider = new MutationObserver(function(mutations, observer) {
            appSider = document.getElementsByClassName('app-sider')[0];
            if (appSider) {
                observer.disconnect(); // Отключаем наблюдение, когда нашли элемент
                addElka(appSider);
            }
        });

        observerForAppSider.observe(document.body, { childList: true, subtree: true });
    }
}

function addElka(appSider) {
    var img = document.createElement('img');
    img.src = `chrome-extension://${editorExtensionId}/NG/Elka.gif`;
    img.setAttribute('id', 'AF_elka');
    img.style.zIndex = '1250000';
    img.style.position = 'fixed';
    img.style.bottom = '10px';
    img.style.opacity = '0.5';
    img.style.maxHeight = '200px';
    img.style.pointerEvents = 'none';

    document.body.appendChild(img);

    function adjustImagePosition() {
        var appSiderWidth = appSider.offsetWidth;
        var newLeft = appSiderWidth + 5; // Прибавляем 5 пикселей к ширине
        img.style.left = newLeft + 'px'; // Применяем новое значение left
    }

    // Начальная настройка позиции
    adjustImagePosition();

    // Создаем экземпляр MutationObserver для слежения за изменениями в app-sider
    slejeniezaelkoy = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style') {
                setTimeout(adjustImagePosition,500);
            }
        });
    });

    // Настройка и запуск слежения
    var config = { attributes: true };
    slejeniezaelkoy.observe(appSider, config);
}

function elkaremove() {
    let AFelka = document.getElementById('AF_elka');
    if (AFelka) {
        AFelka.remove();
        // Отключаем наблюдение, если наблюдатель был инициализирован
        if (slejeniezaelkoy) {
            slejeniezaelkoy.disconnect();
        }
    }
}