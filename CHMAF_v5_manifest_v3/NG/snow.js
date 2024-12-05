//Блок для снежинок
const snowflakes = [];
const maxSnowflakes = 300; // Максимальное количество снежинок
let lastMouseMoveForSnow = 0;
let isSnowing = false; // Флаг для проверки, активен ли обработчик
let observerForSnow = null; // Глобальная переменная для хранения MutationObserver
let iframeDocForSnow = null; // Ссылка на документ iframe

// Функция для запуска создания снежинок
function startSnowing() {
    if (!isSnowing) {
        document.addEventListener('mousemove', mouseSnowing);
        isSnowing = true;

        // Создаём MutationObserver для отслеживания появления iframe
        observerForSnow = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
                    if (iframe) {
                        iframeDocForSnow = iframe.contentDocument || iframe.contentWindow.document;

                        // Добавляем слушатель mousemove в iframe
                        if (iframeDocForSnow) {
                            iframeDocForSnow.addEventListener('mousemove', mouseSnowing);
                        }
                    }
                }
            }
        });

        // Запускаем наблюдение за изменениями в теле документа
        observerForSnow.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

// Функция для остановки создания снежинок
function stopSnowing() {
    if (isSnowing) {
        document.removeEventListener('mousemove', mouseSnowing);
        isSnowing = false;

        // Удаляем слушатель mousemove из iframe, если он существует
        if (iframeDocForSnow) {
            iframeDocForSnow.removeEventListener('mousemove', mouseSnowing);
        }

        // Останавливаем наблюдение за изменениями
        if (observerForSnow) {
            observerForSnow.disconnect();
            observerForSnow = null;
        }
    }
}

// Обработчик движения мыши
function mouseSnowing(event) {
    const now = performance.now();
    if (now - lastMouseMoveForSnow > 33) { // Ограничиваем до 60 FPS
        requestAnimationFrame(() => createSnowflake(event));
        lastMouseMoveForSnow = now;
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

    let offsetX = 0;
    let offsetY = 0;

    // Если событие произошло в iframe, корректируем координаты
    if (event.target.ownerDocument !== document) {
        const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
        if (iframe) {
            const iframeRect = iframe.getBoundingClientRect();
            offsetX = iframeRect.left;
            offsetY = iframeRect.top;
        }
    }

    // Устанавливаем позицию снежинки с учетом смещения
    snowflake.style.left = `${event.clientX + offsetX}px`;
    snowflake.style.top = `${event.clientY + offsetY}px`;

    // Случайная продолжительность падения снежинки
    snowflake.style.animationDuration = `${Math.random() * 7 + 8}s`; // от 8 до 15 секунд

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


if (localStorage.getItem('snowcursor') == '1') { startSnowing() }