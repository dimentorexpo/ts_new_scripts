// =====================
// УТИЛИТЫ
// =====================

const $ = (sel) => document.querySelector(sel);
const megashit = "4045fcee63d54caab2e216a75c3b7aa5"

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

            <div>
            <label style="color:bisque">Альтернативные источники проверки</label> <br>
            <button class="mainButton" id="goCheckHost">Check-host</button>
            <button class="mainButton" id="goIpApi">IPapi</button>
            <button class="mainButton" id="goAnotherIpApi">IP-api</button>
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

    const url = `https://api.ipgeolocation.io/v3/ipgeo?apiKey=${megashit}&ip=${bin}`;

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
            console.log(data)

            if (data.message) {
                $('#ipOutputData').innerHTML = `<span style="color:red">IP не найден или неверный формат</span>`;
                return;
            }

            const output = [
                `• <strong>IP</strong>: ${data.ip}`,
                `• <strong>Код континента</strong>: ${data.location.continent_code}`,
                `• <strong>Континент</strong>: ${data.location.continent_name}`,
                `• <strong>Страна</strong>: ${data.location.country_name} <img src="${data.location.country_flag}" width="20" height="14" style="vertical-align:middle;">`,
                `• <strong>Код страны</strong>: ${data.location.country_code2}`,
                `• <strong>Регион</strong>: ${data.location.state_prov}`,
                `• <strong>Город</strong>: ${data.location.city}`,
                `• <strong>ASN</strong>: ${data.asn.as_number}`,
                `• <strong>Организация</strong>: ${data.asn.organization}`,
                `• <strong>Timezone</strong>: ${data.time_zone.name
                }`,
                `• <strong>UTC offset</strong>: ${data.time_zone.offset}`
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

document.getElementById('goCheckHost').addEventListener('click', function () { //
    const ipDigits = document.getElementById('ipdigits').value
    window.open(`https://check-host.net/ip-info?host=${ipDigits}`)
})

document.getElementById('goIpApi').addEventListener('click', function () { //
    const ipDigits = document.getElementById('ipdigits').value
    window.open(`https://ipapi.co/?q=${ipDigits}`)
})

document.getElementById('goAnotherIpApi').addEventListener('click', function () { //
    const ipDigits = document.getElementById('ipdigits').value
    window.open(`https://ip-api.com/#${ipDigits}`)
})
