// Функция для создания окна с информацией о компенсациях
function createInfoWindow() {
    const infoContent = `
        <div style="width: 800px; font-size: 0.8rem; margin: 5px; min-height: 140px; display: flex;">
            <div style="width: 49%;">
                <p><b>
                    Компенсации делаются даже, если неполадки были со стороны ученика. Бонусными рублями можем компенсировать при некритичном баге, который не срывает урок и как минимум при третьем обращении по одному и тому же багу либо треду, где вопрос решается, но еще не решен и баг не заведен.
                </b></p>
                <p style="color:red">
                    <b>• Добавь ссылку на баг или ссылку на тред, где передавалось обращение юзера, но еще не заведен баг.</b>
                </p>
                <p style="color:green">
                    <b>
                        • При компенсации по серверным неполадкам (массовым сбоям) или критическому багу, из-за которого урок не состоялся используй
                        <a href="https://docs.google.com/forms/d/e/1FAIpQLSeNQHfwYwHYRSb1RoBhkTYz6NMeVzaubwFEMWGNJQcgo_319g/viewform" target="_blank" rel="noopener">форму</a>. Если У корп, в этом случае следует передавать на начислением бонусным уроком!
                    </b>
                </p>
                <p><b>Вся информация о компенсациях находится <a href="https://confluence.skyeng.tech/pages/viewpage.action?pageId=144871997" target="_blank" rel="noopener">тут</a>.</b></p>
                <p><b>Если у ученика нет честных оплат, то следует передавать через <a href="https://docs.google.com/forms/d/e/1FAIpQLSdXG9mi6xWtjdWos5-Cki47ZGpJdpATvdEXnNQMgcfQWg6QDA/viewform" target="_blank" rel="noopener">форму</a>.</b></p>
            </div>
        </div>
    `;

    const infoWindow = document.createElement('div');
    infoWindow.style.display = 'none';
    infoWindow.innerHTML = infoContent;
    return infoWindow;
}

// Функция для добавления информации о форме
function addInformationForm() {
    const operationSelect = document.getElementById('selectedOperation');
    if (!operationSelect) return;

    const infoWindow = createInfoWindow();
    let isInserted = false;

    operationSelect.addEventListener("change", () => {
        const compensationHeader = Array.from(document.getElementsByClassName('card-header')).find(
            header => header.innerText === 'Компенсация за технические проблемы'
        );

        if (compensationHeader) {
            if (!isInserted) {
                const cardBody = document.querySelector('.card-body');
                if (cardBody) {
                    cardBody.insertBefore(infoWindow, cardBody.firstChild);
                    isInserted = true;
                }
            }
            infoWindow.style.display = '';
        } else {
            infoWindow.style.display = 'none';
        }
    });
}

// Проверяем URL страницы и запускаем функцию
function startChecking() {
    if (document.URL === 'https://billing-marketing.skyeng.ru/accrual-operations/create') {
        addInformationForm();
    }
}

// Запускаем проверку при загрузке скрипта
startChecking();