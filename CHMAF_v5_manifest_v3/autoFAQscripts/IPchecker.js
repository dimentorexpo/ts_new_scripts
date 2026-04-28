// =====================
// КОНФИГУРАЦИЯ И УТИЛИТЫ
// =====================

const CYBER_CONFIG = {
    apiKey: "4045fcee63d54caab2e216a75c3b7aa5",
    prefix: "cyber-ip-",
    colors: {
        accent: "#00f2ff",
        bg: "#0d1117",
        border: "rgba(0, 242, 255, 0.2)",
        text: "#e6edf3"
    }
};

const $cyber = (sel) => document.querySelector(sel);

// =====================
// СТИЛИ (CYBER-DARK UI)
// =====================

const injectStyles = () => {
    if (document.getElementById('cyber-ip-styles')) return;

    const style = document.createElement('style');
    style.id = 'cyber-ip-styles';
    style.textContent = `
        .cyber-ip-container {
            background: rgba(13, 17, 23, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid ${CYBER_CONFIG.colors.border};
            border-radius: 12px;
            padding: 20px;
            width: 350px;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: ${CYBER_CONFIG.colors.text};
            box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(0, 242, 255, 0.05);
            position: fixed;
            z-index: 9999;
        }

        .cyber-ip-header {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 15px;
        }

        .cyber-ip-btn-close {
            background: rgba(255, 50, 50, 0.1);
            color: #ff4d4d;
            border: 1px solid rgba(255, 50, 50, 0.3);
            border-radius: 6px;
            padding: 4px 12px;
            cursor: pointer;
            font-size: 11px;
            text-transform: uppercase;
            transition: all 0.3s ease;
        }

        .cyber-ip-btn-close:hover {
            background: #ff4d4d;
            color: white;
            box-shadow: 0 0 10px rgba(255, 77, 77, 0.5);
        }

        .cyber-ip-input-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
        }

        .cyber-ip-input {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid #30363d;
            border-radius: 8px;
            padding: 10px;
            color: ${CYBER_CONFIG.colors.accent};
            text-align: center;
            font-family: 'Courier New', monospace;
            outline: none;
            transition: border-color 0.3s;
        }

        .cyber-ip-input:focus {
            border-color: ${CYBER_CONFIG.colors.accent};
            box-shadow: 0 0 8px rgba(0, 242, 255, 0.2);
        }

        .cyber-ip-btn-main {
            background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 10px;
            font-weight: bold;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            transition: transform 0.1s, opacity 0.3s;
        }

        .cyber-ip-btn-main:hover {
            opacity: 0.9;
            box-shadow: 0 0 15px rgba(0, 210, 255, 0.4);
        }

        .cyber-ip-btn-main:active { transform: scale(0.98); }

        .cyber-ip-result {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 12px;
            font-size: 13px;
            line-height: 1.6;
            margin-bottom: 20px;
            max-height: 250px;
            overflow-y: auto;
            border-left: 3px solid ${CYBER_CONFIG.colors.accent};
        }

        .cyber-ip-result strong { color: ${CYBER_CONFIG.colors.accent}; }

        .cyber-ip-alt-title {
            color: #8b949e;
            font-size: 11px;
            text-transform: uppercase;
            margin-bottom: 8px;
            display: block;
        }

        .cyber-ip-alt-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }

        .cyber-ip-btn-alt {
            background: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
            padding: 6px;
            font-size: 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s;
        }

        .cyber-ip-btn-alt:hover {
            background: #30363d;
            border-color: #8b949e;
        }

        /* Scrollbar */
        .cyber-ip-result::-webkit-scrollbar { width: 4px; }
        .cyber-ip-result::-webkit-scrollbar-thumb { background: ${CYBER_CONFIG.colors.accent}; border-radius: 10px; }
    `;
    document.head.appendChild(style);
};

// =====================
// СОЗДАНИЕ ИНТЕРФЕЙСА
// =====================

function createIPCheckerWindow() {
    injectStyles();

    const html = `
        <div class="cyber-ip-container" id="AF_IpCheck">
            <div class="cyber-ip-header">
                <button class="cyber-ip-btn-close" id="cyber-hide-btn">Hide System</button>
            </div>

            <div class="cyber-ip-input-group">
                <input id="cyber-ip-input-field" class="cyber-ip-input"
                       placeholder="0.0.0.0"
                       autocomplete="off"
                       title="Введите IP адрес">

                <button class="cyber-ip-btn-main" id="cyber-get-info-btn">Scan Network</button>
            </div>

            <div class="cyber-ip-result" id="cyber-output-display">
                <span style="color: #444">Ready for input...</span>
            </div>

            <div>
                <span class="cyber-ip-alt-title">External Intelligence</span>
                <div class="cyber-ip-alt-grid">
                    <button class="cyber-ip-btn-alt" data-target="check-host">Check-Host</button>
                    <button class="cyber-ip-btn-alt" data-target="ipapi">IPapi</button>
                    <button class="cyber-ip-btn-alt" data-target="ip-api">IP-API</button>
                </div>
            </div>
        </div>
    `;

    // Предполагается, что createWindow определена во внешней среде
    // Если нет, раскомментируйте создание элемента вручную
    if (typeof createWindow === 'function') {
        return createWindow('AF_IpCheck', 'winTopIpChk', 'winLeftIpChk', html);
    } else {
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
    }
}

// =====================
// ЛОГИКА И ОБРАБОТКА
// =====================

const IP_MANAGER = {
    clear() {
        $cyber('#cyber-output-display').innerHTML = '<span style="color: #444">Ready for input...</span>';
        $cyber('#cyber-ip-input-field').value = '';
    },

    hide() {
        const win = $cyber('#AF_IpCheck');
        if (win) win.style.display = 'none';
        this.clear();
    },

    async fetchIpData() {
        const ip = $cyber('#cyber-ip-input-field')?.value.trim();
        const display = $cyber('#cyber-output-display');

        if (!ip) return;

        display.innerHTML = '<span style="color: #8b949e">Requesting data...</span>';

        const url = `https://api.ipgeolocation.io/v3/ipgeo?apiKey=${CYBER_CONFIG.apiKey}&ip=${ip}`;

        chrome.runtime.sendMessage({
            action: "getFetchRequest",
            fetchURL: url,
            requestOptions: { method: "GET" }
        }, (response) => {
            if (!response?.success) {
                display.innerHTML = `<span style="color:#ff4d4d">Network Error: ${response?.error || 'Unknown'}</span>`;
                return;
            }

            try {
                const data = JSON.parse(response.fetchansver);

                if (data.message) {
                    display.innerHTML = `<span style="color:#ff4d4d">Access Denied: Invalid IP Format</span>`;
                    return;
                }

                this.renderResult(data);
            } catch (e) {
                display.innerHTML = `<span style="color:#ff4d4d">Data Corruption Error</span>`;
            }
        });
    },

    renderResult(data) {
        const output = [
            `<strong>TARGET IP:</strong> ${data.ip}`,
            `<strong>LOCATION:</strong> ${data.location.country_name} <img src="${data.location.country_flag}" width="16" style="vertical-align:text-top; margin-left:5px">`,
            `<strong>REGION:</strong> ${data.location.state_prov} / ${data.location.city}`,
            `<strong>CONTINENT:</strong> ${data.location.continent_name} (${data.location.continent_code})`,
            `<strong>ASN/ORG:</strong> ${data.asn.as_number} - ${data.asn.organization}`,
            `<strong>TIMEZONE:</strong> ${data.time_zone.name}`,
            `<strong>UTC OFFSET:</strong> ${data.time_zone.offset}`
        ].join('<br>');

        $cyber('#cyber-output-display').innerHTML = output;
    },

    openExternal(type) {
        const ip = $cyber('#cyber-ip-input-field').value;
        const links = {
            'check-host': `https://check-host.net/ip-info?host=${ip}`,
            'ipapi': `https://ipapi.co/?q=${ip}`,
            'ip-api': `https://ip-api.com/#${ip}`
        };
        if (links[type]) window.open(links[type]);
    }
};

// =====================
// ИНИЦИАЛИЗАЦИЯ
// =====================

function initIPCheckerInterface() {
    createIPCheckerWindow();

    if (typeof hideWindowOnDoubleClick === 'function') {
        hideWindowOnDoubleClick('AF_IpCheck');
    }

    // Слушатели событий
    $cyber('#cyber-hide-btn')?.addEventListener('click', () => IP_MANAGER.hide());
    $cyber('#cyber-get-info-btn')?.addEventListener('click', () => IP_MANAGER.fetchIpData());

    $cyber('#cyber-ip-input-field')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
    });

    // Обработка кликов по альтернативным источникам через делегирование
    $cyber('.cyber-ip-alt-grid')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.cyber-ip-btn-alt');
        if (btn) {
            IP_MANAGER.openExternal(btn.dataset.target);
        }
    });
}

// Запуск
initIPCheckerInterface();