// =====================
// УТИЛИТЫ
// =====================

const $ = (sel) => document.querySelector(sel);

// =====================
// СОЗДАНИЕ ОКНА
// =====================

function createIPCheckerWindow() {
    const html = `
        <div class="ipchecker-window">
            <div class="ipchecker-header">
                <button class="mainButton buttonHide" id="hideMeIpChk">hide</button>
            </div>

            <div class="ipchecker-controls">
                <input id="ipdigits" class="${exttheme}"
                       placeholder="Enter user IP xx.xx.xx.xx"
                       autocomplete="off"
                       style="text-align:center;"
                       title="Введите IP адрес">

                <button class="mainButton" id="GetIpInfo">Get IP Info</button>
            </div>

            <div class="ipchecker-result">
                <p id="ipOutputData"></p>
            </div>
        </div>
    `;

    return createWindow('AF_IpCheck', 'winTopIpChk', 'winLeftIpChk', html);
}

// =====================
// ОЧИСТКА
// =====================

function clearCardFields() {
    $('#ipOutputData').textContent = '';
    $('#ipdigits').value = '';
}

function hideBankInfoWindow() {
    const win = $('#AF_IpCheck');
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
    const bin = $('#ipdigits')?.value.trim();
    if (!bin) return;

    const url = `https://ipwho.is/${bin}`;

    chrome.runtime.sendMessage({
        action: "getFetchRequest",
        fetchURL: url,
        requestOptions: {
            method: "GET"
        }
    }, (response) => {
        if (!response?.success) {
            console.error("Ошибка:", response?.error);
            return;
        }

        try {
            const data = JSON.parse(response.fetchansver);

            if (!data.success) {
                $('#ipOutputData').innerHTML = `<span style="color:red">IP не найден или неверный формат</span>`;
                return;
            }

            const output = [
                `• <strong>IP</strong>: ${data.ip}`,
                `• <strong>Континент</strong>: ${data.continent}`,
                `• <strong>Код континента</strong>: ${data.continent_code}`,
                `• <strong>Страна</strong>: ${data.country} <img src="${data.flag?.img}" width="20" height="14" style="vertical-align:middle;">`,
                `• <strong>Код страны</strong>: ${data.country_code}`,
                `• <strong>Регион</strong>: ${data.region}`,
                `• <strong>Город</strong>: ${data.city}`,
                `• <strong>Столица</strong>: ${data.capital}`,
                `• <strong>ASN</strong>: ${data.connection?.asn}`,
                `• <strong>Организация</strong>: ${data.connection?.org}`,
                `• <strong>Провайдер</strong>: ${data.connection?.isp}`,
                `• <strong>Timezone</strong>: ${data.timezone?.id}`,
                `• <strong>UTC</strong>: ${data.timezone?.utc}`,
                `• <strong>Текущее время</strong>: ${data.timezone?.current_time}`
            ].join('<br>');

            $('#ipOutputData').innerHTML = output;

            console.log("IP Info:", data);
        } catch (e) {
            console.error("Ошибка парсинга:", e);
        }
    });
}




// =====================
// ИНИЦИАЛИЗАЦИЯ
// =====================

function initIPCheckerInterface() {
    createIPCheckerWindow();
    hideWindowOnDoubleClick('AF_IpCheck');

    $('#hideMeIpChk')?.addEventListener('click', hideBankInfoWindow);
    $('#GetIpInfo')?.addEventListener('click', openBinCheckWebsite);
    $('#ipdigits')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
    });

}

initIPCheckerInterface();
