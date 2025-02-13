// Функция для создания окна с информацией о карте
function createBankInfoWindow() {
    const bankInfoContent = `
        <div style="display: flex; width: 450px;">
            <span style="width: 450px">
                <span style="cursor: -webkit-grab;">
                    <div style="margin: 5px; width: 400;">
                        <button class="mainButton buttonHide" id="hideMeBinBank">hide</button>
                    </div>
                    <div>
                        <input oninput="onlyNumbers(this)" required id="carddigits" class="${exttheme}" placeholder="6 первых цифр карты" title="Введите 6 первых цифр карты" autocomplete="off" type="text" style="text-align: center; width: 160px; margin-left:5px; position:relative; left:20%;">
                        <button class="mainButton" title="Запуск получения информации о карте" id="getBankInfoData" style="position:relative; left:20%;">Get info</button>
                        <button class="mainButton" title="Открыть сайт с просмотром информации по введеному ID" id="openSiteBin" style="position:relative; left:20%;">Look on site</button>
                    </div>
                </span>
                <div id="grlstdiv">
                    <br>
                    <p id="cardInfoData" style="margin-left: 5px; color:bisque;"></p>
                    <br>
                </div>
            </span>
        </div>
    `;

    return createWindow('AF_BankCheck', 'winTopBankInfo', 'winLeftBankInfo', bankInfoContent);
}

// Функция для скрытия окна
function hideBankInfoWindow() {
    const windowElement = document.getElementById('AF_BankCheck');
    if (windowElement && windowElement.style.display === '') {
        windowElement.style.display = 'none';
        clearCardFields();
    }
}

// Функция для очистки полей формы
function clearCardFields() {
    const cardInfoData = document.getElementById('cardInfoData');
    const cardDigitsInput = document.getElementById('carddigits');

    if (cardInfoData) cardInfoData.innerText = '';
    if (cardDigitsInput) cardDigitsInput.value = '';
}

// Функция для получения информации о карте
async function fetchBankInfo() {
    const cardDigitsInput = document.getElementById('carddigits');
    const cardInfoData = document.getElementById('cardInfoData');

    if (!cardDigitsInput || !cardInfoData) return;

    const cardDigits = cardDigitsInput.value.trim();

    if (cardDigits === '') {
        createAndShowButton('Вы не ввели 6 цифр в поле для ввода. Пожалуйста, введите и повторите попытку!', 'error');
        return;
    }

    cardInfoData.innerHTML = 'Загрузка...';

    try {
        const response = await fetch(`https://bin-ip-checker.p.rapidapi.com/?bin=${cardDigits}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': '1b65e6c5e9msh256f2c43c21ccf3p17b3b2jsnb9bb40c53806',
                'X-RapidAPI-Host': 'bin-ip-checker.p.rapidapi.com'
            },
            body: JSON.stringify({ bin: cardDigits })
        });

        if (!response.ok) {
            throw new Error('Ошибка при получении данных о карте.');
        }

        const data = await response.json();
        cardInfoData.innerHTML = `
            Имя банка: ${data.BIN.issuer.name}<br>
            Схема карты: ${data.BIN.scheme}<br>
            Страна: ${data.BIN.country.name}<br>
            Тип карты: ${data.BIN.type}<br>
            Валюта: ${data.BIN.currency}
        `;
    } catch (error) {
        console.error(error);
        cardInfoData.innerHTML = 'Не удалось получить информацию о карте.';
    }
}

// Функция для открытия сайта с информацией о карте
function openBinCheckWebsite() {
    const cardDigitsInput = document.getElementById('carddigits');
    const cardDigits = cardDigitsInput?.value.trim();

    if (cardDigits) {
        window.open(`https://bincheck.io/ru/details/${cardDigits}`);
    }
}

// Инициализация интерфейса
function initBankInfoInterface() {
    const bankInfoWindow = createBankInfoWindow();
    hideWindowOnDoubleClick('AF_BankCheck');

    // Обработчики событий
    document.getElementById('hideMeBinBank')?.addEventListener('click', hideBankInfoWindow);
    document.getElementById('getBankInfoData')?.addEventListener('click', fetchBankInfo);
    document.getElementById('openSiteBin')?.addEventListener('click', openBinCheckWebsite);

    // Очистка поля ввода при изменении
    document.getElementById('carddigits')?.addEventListener('input', function (event) {
        onlyNumbers(event.target);
    });
}

// Запуск инициализации
initBankInfoInterface();