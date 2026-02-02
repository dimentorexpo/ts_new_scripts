// =====================
// УТИЛИТЫ
// =====================

const $ = (sel) => document.querySelector(sel);

// =====================
// СОЗДАНИЕ ОКНА
// =====================

function createBankInfoWindow() {
    const html = `
        <div class="bankinfo-window">
            <div class="bankinfo-header">
                <button class="mainButton buttonHide" id="hideMeBinBank">hide</button>
            </div>

            <div class="bankinfo-controls">
                <input id="carddigits" class="${exttheme}"
                       placeholder="6 первых цифр карты"
                       maxlength="6"
                       autocomplete="off"
                       title="Введите 6 первых цифр карты">

                <button class="mainButton" id="openSiteBin">Look on Bincheck</button>
                <button class="mainButton" id="openFinansoBin">Finanso</button>"
            </div>

            <div class="bankinfo-result">
                <p id="cardInfoData"></p>
            </div>
        </div>
    `;

    return createWindow('AF_BankCheck', 'winTopBankInfo', 'winLeftBankInfo', html);
}

// =====================
// ОЧИСТКА
// =====================

function clearCardFields() {
    $('#cardInfoData').textContent = '';
    $('#carddigits').value = '';
}

function hideBankInfoWindow() {
    const win = $('#AF_BankCheck');
    if (!win) return;

    win.style.display = 'none';
    clearCardFields();
}

// =====================
// ПОЛУЧЕНИЕ ДАННЫХ
// =====================

// =====================
// ОТКРЫТИЕ САЙТА
// =====================

function openBinCheckWebsite() {
    const bin = $('#carddigits')?.value.trim();
    if (/^\d{6}$/.test(bin)) {
        window.open(`https://bincheck.io/ru/details/${bin}`);
    }
}

function openFinansoWebsite() {
    window.open('https://finanso.ru/bin-search/')
}

// =====================
// ИНИЦИАЛИЗАЦИЯ
// =====================

function initBankInfoInterface() {
    createBankInfoWindow();
    hideWindowOnDoubleClick('AF_BankCheck');

    $('#hideMeBinBank')?.addEventListener('click', hideBankInfoWindow);
    $('#openSiteBin')?.addEventListener('click', openBinCheckWebsite);
    $('#openFinansoBin')?.addEventListener('click', openFinansoWebsite);
    $('#carddigits')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
}

initBankInfoInterface();
