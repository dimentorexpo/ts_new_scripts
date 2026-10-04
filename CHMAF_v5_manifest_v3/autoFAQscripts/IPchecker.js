// ==========================================
// КОНФИГУРАЦИЯ И ДИЗАЙН-СИСТЕМА (CYBER HUD)
// ==========================================

const CYBER_CONFIG = {
    apiKey: "4045fcee63d54caab2e216a75c3b7aa5",
    theme: {
        accent: "#00f2fe",
        accentGlow: "rgba(0, 242, 254, 0.35)",
        secondary: "#4facfe",
        bg: "#090d16",
        cardBg: "rgba(255, 255, 255, 0.03)",
        cardBorder: "rgba(255, 255, 255, 0.07)",
        danger: "#ff4d6d",
        dangerGlow: "rgba(255, 77, 109, 0.3)",
        textMain: "#f0f6fc",
        textMuted: "#8b949e"
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

    const { accent, accentGlow, secondary, cardBg, cardBorder, danger, dangerGlow, textMain, textMuted } = CYBER_CONFIG.theme;

    const style = document.createElement('style');
    style.id = 'cyber-ip-styles';
    style.textContent = `
        @keyframes cyber-pulse-glow {
            0%, 100% { box-shadow: 0 0 15px ${accentGlow}; }
            50% { box-shadow: 0 0 28px ${accentGlow}; }
        }

        @keyframes cyber-scan-radar {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .cyber-ip-container {
            position: fixed;
            z-index: 999999;
            width: 380px;
            box-sizing: border-box;
            background: linear-gradient(145deg, rgba(13, 17, 26, 0.94) 0%, rgba(6, 9, 15, 0.98) 100%);
            backdrop-filter: blur(28px) saturate(160%);
            -webkit-backdrop-filter: blur(28px) saturate(160%);
            border: 1px solid ${cardBorder};
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 20px;
            padding: 20px;
            font-family: 'JetBrains Mono', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
            color: ${textMain};
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.75), 0 0 45px rgba(0, 242, 254, 0.08);
            user-select: none;
        }

.cyber-ip-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
}

.cyber-ip-header:active {
    cursor: grabbing;
}

/* Отключаем перехват кликов у дочерних элементов шапки,
   чтобы mousedown всегда попадал именно в .chmaf-drag-handle */
.cyber-ip-header .cyber-ip-brand,
.cyber-ip-header .cyber-ip-status-node,
.cyber-ip-header .cyber-ip-title,
.cyber-ip-header .cyber-ip-subtitle {
    pointer-events: none;
}

/* Кнопка закрытия должна кликаться и не запускать drag */
.cyber-ip-btn-close {
    pointer-events: auto;
}

        .cyber-ip-brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .cyber-ip-status-node {
            position: relative;
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(79, 172, 254, 0.08));
            border: 1px solid rgba(0, 242, 254, 0.4);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        .cyber-ip-status-node::after {
            content: '';
            position: absolute;
            top: 2px;
            right: 2px;
            width: 6px;
            height: 6px;
            background: ${accent};
            border-radius: 50%;
            box-shadow: 0 0 8px ${accent};
        }

        .cyber-ip-title {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            background: linear-gradient(90deg, #fff 0%, ${accent} 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .cyber-ip-subtitle {
            font-size: 9px;
            color: ${textMuted};
            letter-spacing: 1.5px;
            text-transform: uppercase;
        }

        .cyber-ip-btn-close {
            background: rgba(255, 77, 109, 0.08);
            border: 1px solid rgba(255, 77, 109, 0.25);
            color: ${danger};
            width: 28px;
            height: 28px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .cyber-ip-btn-close:hover {
            background: ${danger};
            color: #fff;
            box-shadow: 0 0 15px ${dangerGlow};
            transform: scale(1.05);
        }

        /* Input Controls */
        .cyber-ip-searchbox {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
        }

        .cyber-ip-input-wrapper {
            position: relative;
            flex: 1;
        }

        .cyber-ip-input {
            width: 100%;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.45);
            border: 1px solid ${cardBorder};
            border-radius: 10px;
            padding: 10px 14px;
            color: ${accent};
            font-family: inherit;
            font-size: 13px;
            letter-spacing: 1px;
            outline: none;
            transition: all 0.2s ease;
        }

        .cyber-ip-input:focus {
            border-color: ${accent};
            box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.15), 0 0 20px rgba(0, 242, 254, 0.12);
            background: rgba(0, 0, 0, 0.65);
        }

        .cyber-ip-btn-scan {
            background: linear-gradient(135deg, ${accent} 0%, ${secondary} 100%);
            border: none;
            border-radius: 10px;
            padding: 0 16px;
            color: #041019;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .cyber-ip-btn-scan:hover {
            filter: brightness(1.15);
            transform: translateY(-1px);
            box-shadow: 0 0 20px ${accentGlow};
        }

        .cyber-ip-btn-scan:active {
            transform: translateY(0) scale(0.97);
        }

        /* Results Display Grid */
        .cyber-ip-hud {
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid ${cardBorder};
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 16px;
            min-height: 120px;
            max-height: 280px;
            overflow-y: auto;
            position: relative;
        }

        .cyber-ip-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100px;
            color: ${textMuted};
            font-size: 11px;
            gap: 8px;
        }

        .cyber-ip-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid rgba(0, 242, 254, 0.1);
            border-top-color: ${accent};
            border-radius: 50%;
            animation: cyber-scan-radar 0.8s linear infinite;
        }

        .cyber-data-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }

        .cyber-data-card {
            background: ${cardBg};
            border: 1px solid ${cardBorder};
            border-radius: 8px;
            padding: 8px 10px;
            display: flex;
            flex-direction: column;
            gap: 3px;
            position: relative;
        }

        .cyber-data-card.full-width {
            grid-column: span 2;
        }

        .cyber-data-label {
            font-size: 9px;
            color: ${textMuted};
            text-transform: uppercase;
            letter-spacing: 0.8px;
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
        }

        .cyber-copyable {
            cursor: pointer;
            transition: color 0.15s ease;
        }

        .cyber-copyable:hover {
            color: ${accent};
        }

        .cyber-ip-flag {
            width: 18px;
            height: 12px;
            border-radius: 2px;
            object-fit: cover;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
        }

        /* External Intelligence Buttons */
        .cyber-ip-actions-header {
            font-size: 9px;
            color: ${textMuted};
            letter-spacing: 1.2px;
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
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid ${cardBorder};
            color: #d1d5db;
            padding: 8px 4px;
            font-family: inherit;
            font-size: 10px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
        }

        .cyber-ip-btn-alt:hover {
            background: rgba(0, 242, 254, 0.08);
            border-color: rgba(0, 242, 254, 0.35);
            color: #fff;
            transform: translateY(-1px);
        }

        /* Scrollbars */
        .cyber-ip-hud::-webkit-scrollbar { width: 4px; }
        .cyber-ip-hud::-webkit-scrollbar-thumb {
            background: rgba(0, 242, 254, 0.2);
            border-radius: 4px;
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