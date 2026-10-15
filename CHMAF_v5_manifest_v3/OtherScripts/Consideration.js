// ============================================================
// Подсказка о компенсациях на странице начисления (billing-marketing)
// ============================================================

const COMPENSATION_HEADER = 'Компенсация за технические проблемы';
const COMPENSATION_INFO_ID = 'chmaf-compensation-info';

// Функция для создания окна с информацией о компенсациях
function createInfoWindow() {
    const infoContent = `
        <div style="max-width: 800px; width: 100%; font-size: 0.8rem; margin: 5px; min-height: 140px; display: flex;">
            <div style="flex: 1 1 49%; min-width: 280px;">
                <p><b>
                    Компенсации делаются даже, если неполадки были со стороны ученика. Бонусными рублями можем компенсировать при некритичном баге, который не срывает урок и как минимум при третьем обращении по одному и тому же багу либо треду, где вопрос решается, но еще не решен и баг не заведен.
                </b></p>
                <p style="color:red">
                    <b>• Добавь ссылку на баг или ссылку на тред, где передавалось обращение юзера, но еще не заведен баг.</b>
                </p>
                <p><b>Вся информация о компенсациях находится <a href="https://confluence.skyeng.tech/pages/viewpage.action?pageId=144871997" target="_blank" rel="noopener">тут</a>.</b></p>
                <p><b>Если у ученика нет честных оплат, то следует передавать через <a href="https://docs.google.com/forms/d/e/1FAIpQLSdXG9mi6xWtjdWos5-Cki47ZGpJdpATvdEXnNQMgcfQWg6QDA/viewform" target="_blank" rel="noopener">форму</a>.</b></p>
            </div>
        </div>
    `;

    const infoWindow = document.createElement('div');
    infoWindow.id = COMPENSATION_INFO_ID;
    infoWindow.style.display = 'none';
    infoWindow.innerHTML = infoContent;
    return infoWindow;
}

/** Заголовок карточки компенсации (textContent: innerText пересчитывает вёрстку). */
function findCompensationHeader() {
    return Array.from(document.getElementsByClassName('card-header')).find(
        header => header.textContent.trim() === COMPENSATION_HEADER
    );
}

// Функция для добавления информации о форме
function addInformationForm(operationSelect) {
    const infoWindow = createInfoWindow();

    function update() {
        const compensationHeader = findCompensationHeader();

        if (!compensationHeader) {
            infoWindow.style.display = 'none';
            return;
        }

        // Вставляем в тело ИМЕННО карточки компенсации, а не в первую .card-body на странице.
        // Если форма перерисовала карточку, подсказка переезжает в новую.
        const cardBody =
            compensationHeader.closest('.card')?.querySelector('.card-body') ||
            document.querySelector('.card-body');

        if (cardBody && infoWindow.parentElement !== cardBody) {
            cardBody.insertBefore(infoWindow, cardBody.firstChild);
        }
        infoWindow.style.display = '';
    }

    operationSelect.addEventListener('change', () => {
        // Карточка операции может отрисоваться чуть позже события change —
        // проверяем сразу и ещё раз после перерисовки
        update();
        setTimeout(update, 300);
    });

    // Если операция уже выбрана (возврат «назад», автозаполнение формы)
    update();
}

// Ждём появления выпадающего списка: на странице он может отрисоваться
// позже, чем запустится скрипт. Раньше в этом случае подсказка не работала вовсе.
function waitForOperationSelect(callback, timeoutMs = 15000) {
    const existing = document.getElementById('selectedOperation');
    if (existing) {
        callback(existing);
        return;
    }

    const observer = new MutationObserver(() => {
        const select = document.getElementById('selectedOperation');
        if (select) {
            observer.disconnect();
            clearTimeout(timer);
            callback(select);
        }
    });

    const timer = setTimeout(() => observer.disconnect(), timeoutMs);
    observer.observe(document.body, { childList: true, subtree: true });
}

// Проверяем адрес страницы без учёта ?параметров, #якоря и завершающего «/»
function startChecking() {
    const path = location.pathname.replace(/\/+$/, '');
    if (location.host === 'billing-marketing.skyeng.ru' && path === '/accrual-operations/create') {
        waitForOperationSelect(addInformationForm);
    }
}

// Запускаем проверку при загрузке скрипта
startChecking();