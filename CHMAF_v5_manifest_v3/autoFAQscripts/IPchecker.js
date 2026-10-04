// ==========================================
// КОНФИГУРАЦИЯ И ДИЗАЙН-СИСТЕМА (CYBER HUD)
// ==========================================

const CYBER_CONFIG = {
    apiKey: "4045fcee63d54caab2e216a75c3b7aa5",
    theme: {
        accent: "#38bdf8",          // Сдержанный деловой Sky Blue
        accentGlow: "rgba(56, 189, 248, 0.25)",
        secondary: "#2563eb",       // Корпоративный Royal Blue
        bgGradient: "linear-gradient(160deg, #1e2638 0%, #111726 100%)", // Темный графитово-синий сланцевый градиент
        panelBg: "rgba(15, 23, 42, 0.65)", // Полупрозрачный Slate 900
        cardBg: "rgba(255, 255, 255, 0.04)",
        cardBorder: "rgba(148, 163, 184, 0.14)", // Мягкая серебристо-синяя окантовка
        danger: "#f87171",
        dangerGlow: "rgba(248, 113, 113, 0.25)",
        textMain: "#f1f5f9",        // Чистый холодный белый
        textMuted: "#94a3b8"        // Сланцевый серый
    }
};

const $cyber = (sel, parent = document) => parent.querySelector(sel);

// Утилита безопасного экранирования HTML
const escapeHTML = (str = '') =>
    String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);

// ==========================================
// СТИЛИ (PREMIUM CYBER-HUD & GLASSMORPHISM)
// ==========================================

const injectStyles = () => {
    if (document.getElementById('cyber-ip-styles')) return;

    const { accent, accentGlow, secondary, bgGradient, panelBg, cardBg, cardBorder, danger, dangerGlow, textMain, textMuted } = CYBER_CONFIG.theme;

    const style = document.createElement('style');
    style.id = 'cyber-ip-styles';
    style.textContent = `
        @keyframes cyber-scan-radar {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Основной контейнер в корпоративном графитово-синем стиле */
        .cyber-ip-container {
            position: fixed;
            z-index: 999999;
            width: 380px;
            box-sizing: border-box;
            background: ${bgGradient};
            backdrop-filter: blur(24px) saturate(130%);
            -webkit-backdrop-filter: blur(24px) saturate(130%);
            border: 1px solid ${cardBorder};
            border-top: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 16px;
            padding: 18px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 'JetBrains Mono', sans-serif;
            color: ${textMain};
            box-shadow: 0 20px 50px rgba(7, 10, 19, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.04);
            user-select: none;
        }

        /* Заголовок с поддержкой chmaf-drag-handle */
        .cyber-ip-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
            cursor: grab;
            user-select: none;
            -webkit-user-select: none;
        }

        .cyber-ip-header:active {
            cursor: grabbing;
        }

        .cyber-ip-header .cyber-ip-brand,
        .cyber-ip-header .cyber-ip-status-node,
        .cyber-ip-header .cyber-ip-title,
        .cyber-ip-header .cyber-ip-subtitle {
            pointer-events: none;
        }

        .cyber-ip-brand {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .cyber-ip-status-node {
            width: 32px;
            height: 32px;
            background: rgba(56, 189, 248, 0.12);
            border: 1px solid rgba(56, 189, 248, 0.28);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
        }

        .cyber-ip-title {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: #ffffff;
        }

        .cyber-ip-subtitle {
            font-size: 10px;
            color: ${textMuted};
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }

        .cyber-ip-btn-close {
            background: rgba(248, 113, 113, 0.1);
            border: 1px solid rgba(248, 113, 113, 0.25);
            color: ${danger};
            width: 26px;
            height: 26px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.18s ease;
            pointer-events: auto;
        }

        .cyber-ip-btn-close:hover {
            background: ${danger};
            color: #fff;
            box-shadow: 0 0 12px ${dangerGlow};
        }

        /* Поле ввода и кнопка */
        .cyber-ip-searchbox {
            display: flex;
            gap: 8px;
            margin-bottom: 14px;
        }

        .cyber-ip-input-wrapper {
            position: relative;
            flex: 1;
        }

        .cyber-ip-input {
            width: 100%;
            box-sizing: border-box;
            background: ${panelBg};
            border: 1px solid ${cardBorder};
            border-radius: 8px;
            padding: 9px 12px;
            color: ${accent};
            font-family: 'JetBrains Mono', monospace;
            font-size: 13px;
            outline: none;
            transition: all 0.2s ease;
        }

        .cyber-ip-input:focus {
            border-color: ${accent};
            background: rgba(15, 23, 42, 0.9);
            box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.18);
        }

        .cyber-ip-btn-scan {
            background: linear-gradient(135deg, #0284c7 0%, ${secondary} 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 0 16px;
            color: #ffffff;
            font-weight: 600;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .cyber-ip-btn-scan:hover {
            filter: brightness(1.12);
            box-shadow: 0 4px 14px ${accentGlow};
        }

        .cyber-ip-btn-scan:active {
            transform: scale(0.98);
        }

        /* Окно результатов HUD */
        .cyber-ip-hud {
            background: ${panelBg};
            border: 1px solid ${cardBorder};
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 14px;
            min-height: 110px;
            max-height: 270px;
            overflow-y: auto;
        }

        .cyber-ip-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 95px;
            color: ${textMuted};
            font-size: 12px;
            gap: 8px;
        }

        .cyber-ip-spinner {
            width: 22px;
            height: 22px;
            border: 2px solid rgba(56, 189, 248, 0.15);
            border-top-color: ${accent};
            border-radius: 50%;
            animation: cyber-scan-radar 0.75s linear infinite;
        }

        .cyber-data-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }

        .cyber-data-card {
            background: ${cardBg};
            border: 1px solid ${cardBorder};
            border-radius: 6px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .cyber-data-card.full-width {
            grid-column: span 2;
        }

        .cyber-data-label {
            font-size: 10px;
            font-weight: 600;
            color: ${textMuted};
            text-transform: uppercase;
            letter-spacing: 0.6px;
        }

        .cyber-data-value {
            font-size: 12px;
            font-weight: 600;
            color: ${textMain};
            display: flex;
            align-items: center;
            gap: 6px;
            word-break: break-word;
        }

        .cyber-data-value.accent {
            color: ${accent};
            font-family: 'JetBrains Mono', monospace;
        }

        .cyber-copyable {
            cursor: pointer;
            transition: color 0.15s ease;
        }

        .cyber-copyable:hover {
            color: #ffffff;
            text-decoration: underline;
        }

        .cyber-ip-flag {
            width: 16px;
            height: 11px;
            border-radius: 2px;
            object-fit: cover;
        }

        /* Кнопки внешних сервисов */
        .cyber-ip-actions-header {
            font-size: 10px;
            font-weight: 600;
            color: ${textMuted};
            letter-spacing: 0.8px;
            text-transform: uppercase;
            margin-bottom: 8px;
            display: block;
        }

        .cyber-ip-alt-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }

        .cyber-ip-btn-alt {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid ${cardBorder};
            color: #cbd5e1;
            padding: 7px 4px;
            font-size: 11px;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.18s ease;
            text-align: center;
        }

        .cyber-ip-btn-alt:hover {
            background: rgba(56, 189, 248, 0.12);
            border-color: rgba(56, 189, 248, 0.4);
            color: #ffffff;
        }

        /* Скроллбар */
        .cyber-ip-hud::-webkit-scrollbar { width: 4px; }
        .cyber-ip-hud::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.25);
            border-radius: 4px;
        }
        .cyber-ip-hud::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.4);
        }
    `;
    document.head.appendChild(style);
};

// ==========================================
// ГЕНЕРАТОР ШАБЛОНА
// ==========================================

function createIPCheckerWindow() {
    injectStyles();

    const html = `
        <div class="cyber-ip-container chmaf-window" id="AF_IpCheck">
            <!-- Ровно тот класс для перетаскивания: chmaf-drag-handle -->
            <div class="cyber-ip-header chmaf-drag-handle" id="AF_IpCheck_header">
                <div class="cyber-ip-brand">
                    <div class="cyber-ip-status-node">📡</div>
                    <div>
                        <div class="cyber-ip-title">Cyber Intelligence</div>
                        <div class="cyber-ip-subtitle">Network & Geo Recon</div>
                    </div>
                </div>
                <button class="cyber-ip-btn-close" id="cyber-hide-btn" title="Закрыть">✕</button>
            </div>

            <div class="cyber-ip-searchbox">
                <div class="cyber-ip-input-wrapper">
                    <input id="cyber-ip-input-field"
                           class="cyber-ip-input"
                           placeholder="Enter IPv4 or IPv6..."
                           spellcheck="false"
                           autocomplete="off">
                </div>
                <button class="cyber-ip-btn-scan" id="cyber-get-info-btn">
                    <span>Scan</span>
                </button>
            </div>

            <div class="cyber-ip-hud" id="cyber-output-display">
                <div class="cyber-ip-placeholder">
                    <span>Ready to scan target host</span>
                </div>
            </div>

            <div>
                <span class="cyber-ip-actions-header">External Recon Services</span>
                <div class="cyber-ip-alt-grid">
                    <button class="cyber-ip-btn-alt" data-target="check-host">Check-Host</button>
                    <button class="cyber-ip-btn-alt" data-target="ipapi">IPapi</button>
                    <button class="cyber-ip-btn-alt" data-target="ip-api">IP-API</button>
                </div>
            </div>
        </div>
    `;

    if (typeof createWindow === 'function') {
        return createWindow('AF_IpCheck', 'winTopIpChk', 'winLeftIpChk', html);
    } else {
        const existing = document.getElementById('AF_IpCheck');
        if (existing) existing.remove();

        const wrapper = document.createElement('div');
        wrapper.innerHTML = html.trim();
        document.body.appendChild(wrapper.firstElementChild);
    }
}

// ==========================================
// БИЗНЕС-ЛОГИКА
// ==========================================

const IP_MANAGER = {
    clear() {
        const display = $cyber('#cyber-output-display');
        const input = $cyber('#cyber-ip-input-field');
        if (display) display.innerHTML = '<div class="cyber-ip-placeholder"><span>Ready to scan target host</span></div>';
        if (input) input.value = '';
    },

    hide() {
        const win = $cyber('#AF_IpCheck');
        if (win) win.style.display = 'none';
        this.clear();
    },

    showLoading() {
        const display = $cyber('#cyber-output-display');
        if (display) {
            display.innerHTML = `
                <div class="cyber-ip-placeholder">
                    <div class="cyber-ip-spinner"></div>
                    <span style="color: ${CYBER_CONFIG.theme.accent};">Querying Global Nodes...</span>
                </div>
            `;
        }
    },

    showError(message) {
        const display = $cyber('#cyber-output-display');
        if (display) {
            display.innerHTML = `
                <div class="cyber-ip-placeholder" style="color: ${CYBER_CONFIG.theme.danger}">
                    <span>⚠️ ${escapeHTML(message)}</span>
                </div>
            `;
        }
    },

    async fetchIpData() {
        const input = $cyber('#cyber-ip-input-field');
        const ip = input?.value.trim();

        if (!ip) {
            input?.focus();
            return;
        }

        this.showLoading();

        const url = `https://api.ipgeolocation.io/v3/ipgeo?apiKey=${CYBER_CONFIG.apiKey}&ip=${encodeURIComponent(ip)}`;

        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
            chrome.runtime.sendMessage({
                action: "getFetchRequest",
                fetchURL: url,
                requestOptions: { method: "GET" }
            }, (response) => {
                if (!response?.success) {
                    this.showError(response?.error || 'Transmission Gateway Failure');
                    return;
                }
                this.processPayload(response.fetchansver);
            });
        } else {
            // Фолбэк на прямой fetch для отладки вне chrome extension
            try {
                const res = await fetch(url);
                const data = await res.json();
                this.renderResult(data);
            } catch (err) {
                this.showError('CORS/Network error occurred');
            }
        }
    },

    processPayload(rawJson) {
        try {
            const data = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;

            if (data.message) {
                this.showError(data.message);
                return;
            }

            this.renderResult(data);
        } catch {
            this.showError('Corrupted Data Stream');
        }
    },

    renderResult(data) {
        const display = $cyber('#cyber-output-display');
        if (!display) return;

        // Безопасное чтение вложенных структур с фолбэками
        const ip = data.ip || '—';
        const country = data.location?.country_name || data.country_name || 'Unknown';
        const flag = data.location?.country_flag || data.country_flag;
        const state = data.location?.state_prov || data.state_prov || '';
        const city = data.location?.city || data.city || '';
        const region = [state, city].filter(Boolean).join(' / ') || '—';
        const asn = data.asn?.as_number || data.asn || '—';
        const org = data.asn?.organization || data.organization || data.isp || '—';
        const tz = data.time_zone?.name || data.time_zone || '—';
        const offset = data.time_zone?.offset != null ? `UTC ${data.time_zone.offset >= 0 ? '+' : ''}${data.time_zone.offset}` : '—';

        display.innerHTML = `
            <div class="cyber-data-grid">
                <div class="cyber-data-card full-width">
                    <span class="cyber-data-label">Target Address (Click to copy)</span>
                    <span class="cyber-data-value accent cyber-copyable" data-copy="${escapeHTML(ip)}" title="Copy IP">
                        ${escapeHTML(ip)}
                    </span>
                </div>

                <div class="cyber-data-card">
                    <span class="cyber-data-label">Country</span>
                    <span class="cyber-data-value">
                        ${flag ? `<img src="${escapeHTML(flag)}" class="cyber-ip-flag" alt="">` : ''}
                        ${escapeHTML(country)}
                    </span>
                </div>

                <div class="cyber-data-card">
                    <span class="cyber-data-label">Region / City</span>
                    <span class="cyber-data-value">${escapeHTML(region)}</span>
                </div>

                <div class="cyber-data-card full-width">
                    <span class="cyber-data-label">Network Infrastructure</span>
                    <span class="cyber-data-value" style="font-size: 11px;">
                        <span style="color: ${CYBER_CONFIG.theme.accent}; font-weight:700;">${escapeHTML(asn)}</span>
                        ${escapeHTML(org)}
                    </span>
                </div>

                <div class="cyber-data-card">
                    <span class="cyber-data-label">Timezone</span>
                    <span class="cyber-data-value">${escapeHTML(tz)}</span>
                </div>

                <div class="cyber-data-card">
                    <span class="cyber-data-label">Offset</span>
                    <span class="cyber-data-value">${escapeHTML(offset)}</span>
                </div>
            </div>
        `;

        // Быстрое копирование адреса при клике
        display.querySelectorAll('.cyber-copyable').forEach(el => {
            el.addEventListener('click', () => {
                navigator.clipboard.writeText(el.dataset.copy);
                const originalText = el.textContent;
                el.textContent = 'COPIED TO CLIPBOARD';
                setTimeout(() => el.textContent = originalText, 1200);
            });
        });
    },

    openExternal(type) {
        const ip = $cyber('#cyber-ip-input-field')?.value.trim();
        if (!ip) return;

        const links = {
            'check-host': `https://check-host.net/ip-info?host=${encodeURIComponent(ip)}`,
            'ipapi': `https://ipapi.co/${encodeURIComponent(ip)}/`,
            'ip-api': `https://ip-api.com/#${encodeURIComponent(ip)}`
        };

        if (links[type]) window.open(links[type], '_blank', 'noopener,noreferrer');
    }
};

// ==========================================
// ИНИЦИАЛИЗАЦИЯ И ОБРАБОТЧИКИ
// ==========================================

function initIPCheckerInterface() {
    createIPCheckerWindow();

    if (typeof hideWindowOnDoubleClick === 'function') {
        hideWindowOnDoubleClick('AF_IpCheck');
    }

    const container = $cyber('#AF_IpCheck');
    if (!container) return;

    // Закрытие и вызов сканирования
    $cyber('#cyber-hide-btn', container)?.addEventListener('click', () => IP_MANAGER.hide());
    $cyber('#cyber-get-info-btn', container)?.addEventListener('click', () => IP_MANAGER.fetchIpData());

    const input = $cyber('#cyber-ip-input-field', container);
    if (input) {
        // Поддержка Enter для мгновенного запуска
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                IP_MANAGER.fetchIpData();
            }
        });

        // Разрешаем цифры, точки, двоеточия и hex-символы для IPv4 и IPv6
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9a-fA-F.:]/g, '');
        });
    }

    // Делегирование внешних ссылок
    $cyber('.cyber-ip-alt-grid', container)?.addEventListener('click', (e) => {
        const btn = e.target.closest('.cyber-ip-btn-alt');
        if (btn) IP_MANAGER.openExternal(btn.dataset.target);
    });
}

// Запуск
initIPCheckerInterface();