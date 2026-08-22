// =====================
// КОНФИГУРАЦИЯ И УТИЛИТЫ
// =====================

const CYBER_CONFIG = {
    apiKey: "4045fcee63d54caab2e216a75c3b7aa5",
    prefix: "cyber-ip-",
    colors: {
        accent: "#22d3ee",
        bg: "#0d1117",
        border: "rgba(34, 211, 238, 0.22)",
        text: "#e6edf3"
    }
};

const $cyber = (sel) => document.querySelector(sel);

// =====================
// СТИЛИ (PREMIUM OBSIDIAN UI)
// =====================

/**
 * Внедряет стили для интерфейса IP Checker.
 * @returns {void}
 */
const injectStyles = () => {
    if (document.getElementById('cyber-ip-styles')) return;

    const style = document.createElement('style');
    style.id = 'cyber-ip-styles';
    style.textContent = `
        .cyber-ip-container {
            background: linear-gradient(165deg, rgba(26, 30, 38, 0.94) 0%, rgba(12, 14, 19, 0.97) 100%);
            backdrop-filter: blur(24px) saturate(140%);
            -webkit-backdrop-filter: blur(24px) saturate(140%);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-top-color: rgba(255, 255, 255, 0.16);
            border-radius: 18px;
            padding: 18px;
            width: 360px;
            box-sizing: border-box;
            font-family: 'Inter', 'Segoe UI', Roboto, system-ui, sans-serif;
            color: ${CYBER_CONFIG.colors.text};
            box-shadow:
                0 24px 60px rgba(0,0,0,0.55),
                0 0 40px rgba(34, 211, 238, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.06);
            position: fixed;
            z-index: 9999;
        }

        .cyber-ip-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            cursor: grab;
        }

        .cyber-ip-titleblock { display: flex; align-items: center; gap: 10px; }
        .cyber-ip-icon-chip {
            width: 34px; height: 34px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px;
            background: linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(58, 123, 213, 0.12));
            border: 1px solid rgba(34, 211, 238, 0.35);
            box-shadow: 0 4px 14px rgba(34, 211, 238, 0.2), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .cyber-ip-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.3px; }
        .cyber-ip-subtitle {
            font-size: 9px; text-transform: uppercase;
            letter-spacing: 1.4px; color: rgba(255, 255, 255, 0.45);
        }

        .cyber-ip-btn-close {
            background: rgba(255, 80, 80, 0.08);
            color: #ff7b7b;
            border: 1px solid rgba(255, 80, 80, 0.25);
            border-radius: 9px;
            width: 30px; height: 30px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            font-size: 13px;
            line-height: 1;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cyber-ip-btn-close:hover {
            background: rgba(255, 80, 80, 0.22);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(255, 80, 80, 0.2);
        }
        .cyber-ip-btn-close:active { transform: translateY(0) scale(0.95); }

        .cyber-ip-input-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 18px;
        }

        .cyber-ip-input {
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 10px;
            padding: 11px 13px;
            color: ${CYBER_CONFIG.colors.accent};
            text-align: center;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 15px;
            letter-spacing: 1.5px;
            outline: none;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cyber-ip-input:focus {
            border-color: rgba(34, 211, 238, 0.6);
            background: rgba(0, 0, 0, 0.5);
            box-shadow:
                0 0 0 3px rgba(34, 211, 238, 0.12),
                0 0 18px rgba(34, 211, 238, 0.08);
        }

        .cyber-ip-btn-main {
            background: linear-gradient(135deg, #22d3ee 0%, #3a7bd5 100%);
            border: none;
            border-radius: 10px;
            color: #04141c;
            padding: 11px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            font-size: 12px;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 6px 20px rgba(34, 211, 238, 0.28), inset 0 1px 0 rgba(255,255,255,0.35);
        }

        .cyber-ip-btn-main:hover {
            filter: brightness(1.1);
            transform: translateY(-1px);
            box-shadow: 0 8px 26px rgba(34, 211, 238, 0.42), inset 0 1px 0 rgba(255,255,255,0.35);
        }

        .cyber-ip-btn-main:active { transform: translateY(0) scale(0.98); }

        .cyber-ip-result {
            background: rgba(0, 0, 0, 0.32);
            border-radius: 11px;
            padding: 14px;
            font-size: 13px;
            line-height: 1.7;
            margin-bottom: 18px;
            max-height: 250px;
            overflow-y: auto;
            border-left: 2px solid ${CYBER_CONFIG.colors.accent};
            box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
        }

        .cyber-ip-result strong { color: ${CYBER_CONFIG.colors.accent}; font-weight: 600; }

        .cyber-ip-alt-title {
            color: rgba(255, 255, 255, 0.45);
            font-size: 9px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1.4px;
            margin-bottom: 8px;
            display: block;
        }

        .cyber-ip-alt-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }

        .cyber-ip-btn-alt {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.09);
            color: #cdd6e2;
            padding: 8px 6px;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border-radius: 9px;
            cursor: pointer;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: inherit;
        }

        .cyber-ip-btn-alt:hover {
            background: rgba(255, 255, 255, 0.11);
            border-color: rgba(34, 211, 238, 0.35);
            color: #fff;
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
        }
        .cyber-ip-btn-alt:active { transform: translateY(0) scale(0.97); }

        /* Scrollbar */
        .cyber-ip-result::-webkit-scrollbar { width: 5px; }
        .cyber-ip-result::-webkit-scrollbar-track { background: transparent; }
        .cyber-ip-result::-webkit-scrollbar-thumb {
            background: rgba(34, 211, 238, 0.25);
            border-radius: 10px;
        }
        .cyber-ip-result::-webkit-scrollbar-thumb:hover { background: rgba(34, 211, 238, 0.45); }
    `;
    document.head.appendChild(style);
};

// =====================
// СОЗДАНИЕ ИНТЕРФЕЙСА
// =====================

/**
 * Создает и отображает окно для проверки IP-адреса.
 * @returns {void}
 */
function createIPCheckerWindow() {
    injectStyles();

    const html = `
        <div class="cyber-ip-container" id="AF_IpCheck">
            <div class="cyber-ip-header">
                <div class="cyber-ip-titleblock">
                    <div class="cyber-ip-icon-chip">🛰️</div>
                    <div>
                        <div class="cyber-ip-title">IP Intelligence</div>
                        <div class="cyber-ip-subtitle">Geo & Network Lookup</div>
                    </div>
                </div>
                <button class="cyber-ip-btn-close" id="cyber-hide-btn" title="Закрыть">✕</button>
            </div>

            <div class="cyber-ip-input-group">
                <input id="cyber-ip-input-field" class="cyber-ip-input"
                       placeholder="0.0.0.0"
                       autocomplete="off"
                       title="Введите IP адрес">

                <button class="cyber-ip-btn-main" id="cyber-get-info-btn">Scan Network</button>
            </div>

            <div class="cyber-ip-result" id="cyber-output-display">
                <span style="color: rgba(255,255,255,0.35)">Ready for input...</span>
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
    /**
     * Очищает результаты и поле ввода.
     * @returns {void}
     */
    clear() {
        $cyber('#cyber-output-display').innerHTML = '<span style="color: rgba(255,255,255,0.35)">Ready for input...</span>';
        $cyber('#cyber-ip-input-field').value = '';
    },

    /**
     * Скрывает окно и очищает результаты.
     * @returns {void}
     */
    hide() {
        const win = $cyber('#AF_IpCheck');
        if (win) win.style.display = 'none';
        this.clear();
    },

    /**
     * Получает данные IP-адреса от сервера.
     * @returns {Promise<void>}
     */
    async fetchIpData() {
        const ip = $cyber('#cyber-ip-input-field')?.value.trim();
        const display = $cyber('#cyber-output-display');

        if (!ip) return;

        display.innerHTML = '<span style="color: rgba(255,255,255,0.45)">Requesting data...</span>';

        const url = `https://api.ipgeolocation.io/v3/ipgeo?apiKey=${CYBER_CONFIG.apiKey}&ip=${ip}`;

        chrome.runtime.sendMessage({
            action: "getFetchRequest",
            fetchURL: url,
            requestOptions: { method: "GET" }
        }, (response) => {
            if (!response?.success) {
                display.innerHTML = `<span style="color:#ff7b7b">Network Error: ${response?.error || 'Unknown'}</span>`;
                return;
            }

            try {
                const data = JSON.parse(response.fetchansver);

                if (data.message) {
                    display.innerHTML = `<span style="color:#ff7b7b">Access Denied: Invalid IP Format</span>`;
                    return;
                }

                this.renderResult(data);
            } catch (e) {
                display.innerHTML = `<span style="color:#ff7b7b">Data Corruption Error</span>`;
            }
        });
    },

    /**
     * Отображает результаты IP-адреса.
     * @param {Object} data - Данные IP-адреса.
     * @returns {void}
     */
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

    /**
     * Открывает внешние источники информации по IP-адресу.
     * @param {string} type - Тип источника.
     * @returns {void}
     */
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

/**
 * Инициализирует интерфейс для проверки IP-адреса.
 * @returns {void}
 */
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
