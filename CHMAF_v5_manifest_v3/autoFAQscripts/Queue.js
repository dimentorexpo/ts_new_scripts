/**
 * Refactored Chat Queue Module (Premium Edition 5.0)
 * Visual Style: Luxury Glassmorphism
 * Unique Prefix: qg5-
 * Filename: pisa.js
 */

(function () {
    let dataChts = [];

    // Экранирование внешних данных (имена/страна пользователя из API)
    // перед вставкой в innerHTML
    const esc = (s) => String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const state = {
    refreshInterval: null,
    countdownInterval: null,
    globalTimerInterval: null,
    isRendering: false,
    renderAgain: false
};

    const injectStyles = () => {
        if (document.getElementById('qg5-styles')) return;
        const style = document.createElement('style');
        style.id = 'qg5-styles';
        style.innerHTML = `
            .qg5-panel {
                background: linear-gradient(145deg, rgba(28, 31, 48, 0.96) 0%, rgba(38, 42, 64, 0.96) 50%, rgba(32, 36, 56, 0.96) 100%) !important;
                backdrop-filter: blur(40px) saturate(180%);
                -webkit-backdrop-filter: blur(40px) saturate(180%);
                border: 1px solid rgba(212, 175, 55, 0.18) !important;
                border-radius: 24px;
                color: #e8eaf6;
                font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
                box-shadow:
                    0 24px 80px rgba(0, 0, 0, 0.55),
                    0 0 0 1px rgba(212, 175, 55, 0.06),
                    inset 0 1px 0 rgba(255, 255, 255, 0.07);
                padding: 24px !important;
                width: 640px;
                z-index: 1000003;
                position: relative;
                overflow: hidden;
                transition: box-shadow 0.3s ease;
            }
            .qg5-panel:active {
                box-shadow:
                    0 16px 60px rgba(0, 0, 0, 0.6),
                    0 0 0 1px rgba(212, 175, 55, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.07);
            }
            .qg5-panel::before {
                content: '';
                position: absolute;
                top: 0; left: 15%; right: 15%; height: 1px;
                background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.35), transparent);
                pointer-events: none;
            }
            .qg5-header {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .qg5-stats {
                display: flex;
                gap: 16px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.8px;
                text-transform: uppercase;
                background: rgba(0, 0, 0, 0.35);
                padding: 8px 18px;
                border-radius: 50px;
                border: 1px solid rgba(212, 175, 55, 0.15);
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 0 0 20px rgba(212, 175, 55, 0.05);
                color: #8e96b8;
                position: relative;
                overflow: hidden;
            }
            .qg5-stats::before {
                content: '';
                position: absolute;
                top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.1), transparent);
                animation: qg5-shimmer 3s infinite;
            }
            @keyframes qg5-shimmer {
                0% { left: -100%; }
                100% { left: 200%; }
            }
            .qg5-stats b {
                color: #f0c674;
                font-weight: 800;
                font-family: 'JetBrains Mono', 'SF Mono', monospace;
                letter-spacing: 0;
            }
            .qg5-controls {
                display: flex;
                gap: 14px;
                margin-bottom: 20px;
                align-items: center;
                flex-wrap: wrap;
            }
            .qg5-input {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(212, 175, 55, 0.15);
                border-radius: 12px;
                color: #f0f2ff;
                padding: 9px 14px;
                outline: none;
                font-size: 13px;
                font-family: inherit;
                transition: all 0.3s ease;
                box-shadow: inset 0 2px 6px rgba(0,0,0,0.3);
                position: relative;
            }
            .qg5-input:hover {
                border-color: rgba(212, 175, 55, 0.25);
                background: rgba(0, 0, 0, 0.45);
            }
            .qg5-input:focus {
                border-color: rgba(212, 175, 55, 0.5);
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1), 0 0 20px rgba(212, 175, 55, 0.15), inset 0 2px 6px rgba(0,0,0,0.3);
                background: rgba(0, 0, 0, 0.5);
            }
            .qg5-input option {
                background: #1e2235;
                color: #e8eaf6;
            }
            .qg5-btn {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
                border: 1px solid rgba(212, 175, 55, 0.15);
                color: #f0f2ff;
                padding: 9px 18px;
                border-radius: 14px;
                cursor: pointer;
                transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                letter-spacing: 0.3px;
                position: relative;
                overflow: hidden;
                font-family: inherit;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            .qg5-btn::before {
                content: '';
                position: absolute;
                top: 0; left: -100%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
                transition: left 0.5s ease;
            }
            .qg5-btn:hover::before {
                left: 100%;
            }
            .qg5-btn:hover:not(:disabled) {
                background: linear-gradient(145deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.08));
                border-color: rgba(212, 175, 55, 0.45);
                transform: translateY(-2px);
                box-shadow: 0 8px 28px rgba(212, 175, 55, 0.15), 0 0 20px rgba(212, 175, 55, 0.1);
                color: #ffffff;
            }
            .qg5-btn:active:not(:disabled) {
                transform: translateY(0);
            }
            .qg5-btn:disabled {
                opacity: 0.35;
                cursor: not-allowed;
                filter: grayscale(0.6);
            }
            #qg5-hide {
                background: rgba(239, 83, 80, 0.12) !important;
                border-color: rgba(239, 83, 80, 0.25) !important;
                color: #ff8a80 !important;
                padding: 8px 12px !important;
                font-size: 12px !important;
            }
            #qg5-hide:hover:not(:disabled) {
                background: rgba(239, 83, 80, 0.25) !important;
                box-shadow: 0 4px 16px rgba(239, 83, 80, 0.15) !important;
                border-color: rgba(239, 83, 80, 0.4) !important;
            }
            #qg5-manual-refresh {
                background: linear-gradient(145deg, rgba(66, 133, 244, 0.12), rgba(66, 133, 244, 0.03));
                border-color: rgba(66, 133, 244, 0.25);
                color: #8ab4f8;
                margin-left: auto;
            }
            #qg5-manual-refresh:hover:not(:disabled) {
                background: linear-gradient(145deg, rgba(66, 133, 244, 0.25), rgba(66, 133, 244, 0.08));
                border-color: rgba(66, 133, 244, 0.45);
                box-shadow: 0 8px 28px rgba(66, 133, 244, 0.15);
                color: #fff;
            }
            .qg5-list {
                max-height: 520px;
                overflow-y: auto;
                padding-right: 10px;
                margin-right: -4px;
            }
            .qg5-list::-webkit-scrollbar { width: 8px; }
            .qg5-list::-webkit-scrollbar-track {
                background: rgba(0,0,0,0.2);
                border-radius: 10px;
                border: 1px solid rgba(212, 175, 55, 0.05);
            }
            .qg5-list::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.15));
                border-radius: 10px;
                border: 1px solid rgba(212, 175, 55, 0.1);
                box-shadow: inset 0 0 6px rgba(212, 175, 55, 0.2);
            }
            .qg5-list::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, rgba(212, 175, 55, 0.6), rgba(212, 175, 55, 0.25));
                box-shadow: 0 0 12px rgba(212, 175, 55, 0.3), inset 0 0 6px rgba(212, 175, 55, 0.3);
            }
            .qg5-item {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.01));
                border: 1px solid rgba(212, 175, 55, 0.07);
                border-radius: 14px;
                padding: 10px 12px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                position: relative;
                overflow: hidden;
                min-height: 42px;
            }
            .qg5-item::before {
                content: '';
                position: absolute;
                top: 0; left: 0; width: 3px; height: 100%;
                background: linear-gradient(180deg, rgba(212, 175, 55, 0.6), rgba(212, 175, 55, 0.2));
                opacity: 0;
                transition: opacity 0.3s;
            }
            .qg5-item::after {
                content: '';
                position: absolute;
                top: 50%; left: 50%;
                width: 0; height: 0;
                background: radial-gradient(circle, rgba(212, 175, 55, 0.1), transparent);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.4s ease, height 0.4s ease;
                pointer-events: none;
            }
            .qg5-item:hover::after {
                width: 100%;
                height: 100%;
            }
            .qg5-item:hover {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
                border-color: rgba(212, 175, 55, 0.25);
                transform: translateX(4px) scale(1.005);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(212, 175, 55, 0.04);
            }
            .qg5-item:hover::before {
                opacity: 1;
            }
            .qg5-time {
                font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
                color: #7ee787;
                font-weight: 700;
                width: 70px;
                font-size: 12px;
                letter-spacing: 0.3px;
            }
            .qg5-timer {
                font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
                color: #f0c674;
                min-width: 75px;
                text-align: right;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.3px;
            }
            .qg5-usr-name {
                flex: 1;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 13px;
                color: #f0f2ff;
                letter-spacing: 0.2px;
            }
            .qg5-badge {
                font-size: 16px;
                min-width: 24px;
                text-align: center;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
                transition: transform 0.3s ease, filter 0.3s ease;
                position: relative;
                z-index: 1;
            }
            .qg5-item:hover .qg5-badge {
                transform: scale(1.2) rotate(5deg);
                filter: drop-shadow(0 4px 12px rgba(212, 175, 55, 0.3));
            }
            .qg5-flag {
                font-size: 14px;
                filter: drop-shadow(0 0 6px rgba(255,255,255,0.1));
                min-width: 20px;
                text-align: center;
                transition: transform 0.3s ease;
            }
            .qg5-item:hover .qg5-flag {
                transform: scale(1.15);
            }
            .qg5-country {
                font-size: 10px;
                color: #d4af37;
                font-weight: 600;
                letter-spacing: 0.5px;
                background: rgba(212, 175, 55, 0.08);
                padding: 2px 6px;
                border-radius: 6px;
                border: 1px solid rgba(212, 175, 55, 0.1);
            }
            button[name="assignToMe"] {
                background: linear-gradient(145deg, rgba(82, 196, 26, 0.18), rgba(82, 196, 26, 0.04)) !important;
                border-color: rgba(82, 196, 26, 0.25) !important;
                color: #a8e063 !important;
                font-size: 14px !important;
                padding: 4px 10px !important;
                border-radius: 10px !important;
                transition: all 0.3s ease !important;
                min-width: 36px !important;
            }
            button[name="assignToMe"]:hover {
                background: linear-gradient(145deg, rgba(82, 196, 26, 0.32), rgba(82, 196, 26, 0.08)) !important;
                border-color: rgba(82, 196, 26, 0.45) !important;
                box-shadow: 0 4px 16px rgba(82, 196, 26, 0.2), 0 0 20px rgba(82, 196, 26, 0.1) !important;
                transform: translateY(-1px) scale(1.05) !important;
            }
            button[name="assignToMe"]:active {
                transform: translateY(0) scale(1) !important;
                box-shadow: 0 2px 8px rgba(82, 196, 26, 0.15) !important;
            }
            #qg5-count {
                color: #f0c674;
            }
            #qg5-timer-refresh {
                color: #7ee787;
            }
        `;
		//новая
		
		        style.textContent += `
            /* Queue / corporate graphite.
               Правила ограничены окном очереди. */

            #AF_Queue .qg5-panel {
                box-sizing: border-box;
                width: min(640px, calc(100vw - 24px));
                max-width: 100%;
                padding: 18px !important;
                color: #edf2fb;
                background:
                    radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
                    #111827 !important;
                border: 1px solid #344258 !important;
                border-radius: 18px;
                box-shadow:
                    0 26px 70px rgba(3, 9, 22, .52),
                    inset 0 1px rgba(255, 255, 255, .06) !important;
            }

            #AF_Queue .qg5-panel,
            #AF_Queue .qg5-panel * {
                box-sizing: border-box;
            }

#AF_Queue .qg5-panel::before {
    display: none;
}

            #AF_Queue .qg5-header {
                gap: 10px;
                margin-bottom: 15px;
                padding-bottom: 14px;
                border-bottom: 1px solid #344258;
                cursor: move;
            }

            #AF_Queue .qg5-stats {
                flex-wrap: wrap;
                gap: 6px 11px;
                min-width: 0;
                padding: 7px 11px;
                color: #a6b4cb;
                background: #182335;
                border: 1px solid #364660;
                border-radius: 9px;
                box-shadow: none;
                letter-spacing: .04em;
            }

            #AF_Queue .qg5-stats::before,
            #AF_Queue .qg5-btn::before,
            #AF_Queue .qg5-item::after {
                display: none;
            }

            #AF_Queue .qg5-stats b,
            #AF_Queue #qg5-count,
            #AF_Queue #qg5-timer-refresh {
                color: #a9c0ff;
            }

            #AF_Queue .qg5-controls {
                gap: 9px;
                margin-bottom: 14px;
            }

            #AF_Queue .qg5-input {
                min-width: 0;
                min-height: 36px;
                color: #edf2fb;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 9px;
                box-shadow: none;
            }

            #AF_Queue .qg5-input:hover {
                background: #142034;
                border-color: #657caa;
            }

            #AF_Queue .qg5-input:focus {
                background: #142034;
                border-color: #829fff;
                box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
            }

            #AF_Queue .qg5-btn {
                min-height: 36px;
                padding: 8px 12px;
                color: #dce5f5;
                background: #1b283c;
                border: 1px solid #3c4d68;
                border-radius: 9px;
                box-shadow: none;
                transition:
                    background-color .16s ease,
                    border-color .16s ease,
                    transform .16s ease;
            }

            #AF_Queue .qg5-btn:hover:not(:disabled) {
                color: #fff;
                background: #293b56;
                border-color: #7799e2;
                box-shadow: none;
                transform: translateY(-1px);
            }

            #AF_Queue .qg5-btn:disabled {
                opacity: .55;
                filter: none;
            }

            #AF_Queue #qg5-manual-refresh {
                color: #eef3ff;
                background: #4268c9;
                border-color: #7293ed;
                box-shadow: 0 5px 15px rgba(58, 96, 205, .22);
            }

            #AF_Queue #qg5-manual-refresh:hover:not(:disabled) {
                background: #547ce1;
                border-color: #a2b9fa;
                box-shadow: 0 6px 19px rgba(58, 96, 205, .3);
            }

            #AF_Queue #qg5-hide {
                background: rgba(255, 116, 140, .08) !important;
                border-color: rgba(255, 116, 140, .3) !important;
                color: #ffb0be !important;
            }

            #AF_Queue .qg5-list {
                scrollbar-width: thin;
                scrollbar-color: #536a8e transparent;
            }

            #AF_Queue .qg5-list::-webkit-scrollbar-track {
                background: #111b2a;
                border: none;
            }

            #AF_Queue .qg5-list::-webkit-scrollbar-thumb,
            #AF_Queue .qg5-list::-webkit-scrollbar-thumb:hover {
                background: #536a8e;
                border: none;
                box-shadow: none;
            }

            #AF_Queue .qg5-item {
                gap: 9px;
                min-width: 0;
                margin-bottom: 7px;
                padding: 10px;
                background: #1a2536;
                border: 1px solid #344258;
                border-left: 3px solid #617fbd;
                border-radius: 10px;
                box-shadow: none;
                transition:
                    background-color .16s ease,
                    border-color .16s ease;
            }

            #AF_Queue .qg5-item::before {
                display: none;
            }

            #AF_Queue .qg5-item:hover {
                background: #23334b;
                border-color: #6685be;
                border-left-color: #92afff;
                box-shadow: none;
                transform: none;
            }

            #AF_Queue .qg5-time {
                flex: 0 0 70px;
                color: #b6c9f5;
            }

            #AF_Queue .qg5-timer {
                color: #c1ceea;
            }

            #AF_Queue .qg5-usr-name {
                min-width: 0;
                color: #f0f4fb;
            }

            #AF_Queue .qg5-badge,
            #AF_Queue .qg5-flag {
                filter: none;
            }

            #AF_Queue .qg5-item:hover .qg5-badge,
            #AF_Queue .qg5-item:hover .qg5-flag {
                transform: none;
                filter: none;
            }

            #AF_Queue .qg5-country {
                max-width: 85px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #c8d6f4;
                background: #293a56;
                border: 1px solid #435b80;
            }

            #AF_Queue button[name="assignToMe"] {
                flex: 0 0 auto;
                min-width: 36px !important;
                color: #cfe0ff !important;
                background: #293e67 !important;
                border-color: #536fa7 !important;
                box-shadow: none !important;
            }

            #AF_Queue button[name="assignToMe"]:hover:not(:disabled) {
                color: #fff !important;
                background: #395892 !important;
                border-color: #87a9ed !important;
                box-shadow: none !important;
                transform: translateY(-1px) !important;
            }

            #AF_Queue .qg5-btn:focus-visible,
            #AF_Queue .qg5-input:focus-visible,
            #AF_Queue .qg5-item:focus-visible {
                outline: 2px solid #9ab5ff;
                outline-offset: 2px;
            }

            @media (max-width: 700px) {
                #AF_Queue .qg5-header {
                    flex-wrap: wrap;
                }

                #AF_Queue #qg5-manual-refresh {
                    margin-left: 0;
                }

                #AF_Queue .qg5-item {
                    flex-wrap: wrap;
                }

                #AF_Queue .qg5-usr-name {
                    flex-basis: 35%;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #AF_Queue .qg5-panel *,
                #AF_Queue .qg5-panel *::before,
                #AF_Queue .qg5-panel *::after {
                    animation-duration: .01ms !important;
                    transition-duration: .01ms !important;
                }
            }
        `;
        document.head.appendChild(style);
    };

    async function fetchAllPages(url, initialBodyContent) {
        let allData = [];
        let page = 1;
        let totalFetched = 0;
        let totalAvailable;
        do {
            const bodyContent = { ...initialBodyContent, page, limit: 100 };
            // Через общий слой: диагностика ошибок и CSRF-ретрай вместо ручного aftoken
            const resp = await afApiFetch(url, {
                headers: { "content-type": "application/json" },
                referrer: "https://skyeng.autofaq.ai/logs",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: JSON.stringify(bodyContent),
                method: "POST"
            });
            if (!resp.ok) {
    throw new Error(`Ошибка загрузки страницы ${page}: HTTP ${resp.status}`);
}
            const data = await resp.json();
            allData = allData.concat(data.items || []);
            totalFetched += (data.items || []).length;
            if (page === 1) totalAvailable = data.total;
            page++;
        } while (totalFetched < totalAvailable && page <= 5);
        return allData;
    }

    const getDates = () => {
        const now = new Date();
        const MSK_OFFSET = 3 * 60 * 60 * 1000;
        const msk = new Date(now.getTime() + MSK_OFFSET);
        const y = msk.getUTCFullYear();
        const m = msk.getUTCMonth();
        const d = msk.getUTCDate();
        return {
            tsFrom: new Date(Date.UTC(y, m, d - 2, 21, 0, 0, 0)).toISOString(),
            tsTo: new Date(Date.UTC(y, m, d, 20, 59, 59, 59)).toISOString()
        };
    };

    const getUserTypeEmoji = (type) => {
        switch (type) {
            case "teacher": return "👽";
            case "student": return "👨‍🎓";
            case "parent": return "😵‍💫";
            default: return "❓";
        }
    };
    const getFirstAnswerFlag = (stats) => {
        if (!stats) return "🚫";

        // ✅ Ответ оператора был дан
        if (stats.firstOperatorAnswerTime && stats.firstOperatorAnswerTime !== null) {
            return "✅";
        }

        const usedStatuses = stats.usedStatuses || [];
        const hasAssignedOnly = usedStatuses.length === 1 && usedStatuses[0] === "AssignedToOperator";
        const hasOperators = stats.participatingOperators && stats.participatingOperators.length > 0;

        // ⤴️ Исходящий диалог (сразу AssignedToOperator, оператор ещё не писал)
        if (hasAssignedOnly && !hasOperators) {
            return "⤴️";
        }

        // ❌ Входящий, есть операторы, но ответа ещё не было
        if (hasOperators) {
            return "❌";
        }

        // 🚫 Нет операторов вообще
        return "🚫";
    };

    // 🗂 Очереди по группам (ID синхронизированы с AFOperatorStatus.OP_GROUP_CONFIG).
    // Ручной выбор нужен и когда отдел оператора не определён (например, в имени
    // нет префикса «ТП-») — автовыбор по opsection в таком случае не срабатывает.
    const QUEUE_GROUPS = {
        TP: { label: '🛡️ ТП', ids: ['c7bbb211-a217-4ed3-8112-98728dc382d8'] },
        TPOS: { label: '🖥️ ТП ОС', ids: ['8266dbb1-db44-4910-8b5f-a140deeec5c0'] },
        KC: { label: '📞 КЦ', ids: ['b6f7f34d-2f08-fc19-3661-29ac00842898'] },
        Prem: { label: '💎 Prem', ids: ['c1262bdf-444a-41e1-974e-03d754dcff25'] }
    };

    // Автовыбор группы по отделу оператора (поведение как в старой логике)
    const getDefaultGroupKey = () => {
        const sec = typeof getOpSection === 'function'
            ? getOpSection()
            : (typeof opsection !== 'undefined' ? String(opsection).trim() : '');
        if (sec === 'ТП ОС') return 'TPOS';
        if (sec.startsWith('ТП')) return 'TP';
        if (sec === 'Prem') return 'Prem';
        if (sec === 'КЦ') return 'KC';
        return 'KC'; // ⚡ фолбэк как раньше: не-ТП (или отдел неизвестен) → очередь КЦ
    };

    // Приоритет: текущее значение селекта → сохранённый выбор → автовыбор по отделу
    const getSelectedGroupKey = () =>
        document.getElementById('qg5-group-type')?.value
        || localStorage.getItem('qg5_group')
        || getDefaultGroupKey();

    /*
     * Окно истории чатов (ChatHistory.js) скрыто CSS-классом .afg-panel,
     * а не inline-стилем, поэтому до первого ручного открытия
     * element.style.display === ''. Проверка «style.display === 'none'»
     * на свежей странице не срабатывала: панель не открывалась, а чат
     * искался внутри неё же, оставаясь невидимым для оператора.
     * Теперь (как в Grabber.js) смотрим вычисленный стиль.
     */
    const isHistoryWindowOpen = () => {
        const historyWindow = document.getElementById('AF_ChatHis');
        return !!historyWindow &&
            getComputedStyle(historyWindow).display !== 'none';
    };

    const openHistoryWindow = () => {
        if (isHistoryWindowOpen()) return;

        // Публичная функция ChatHistory надёжнее клика по кнопке ☢:
        // обработчик FAB вешается в utils.js по ссылке, захваченной
        // в момент построения панели кнопок.
        if (typeof getopennewcatButtonPress === 'function') {
            getopennewcatButtonPress();
            return;
        }

        document.getElementById('opennewcat')?.click();
    };

    // Открыть окно истории (если закрыто) и найти в нём конкретный чат
    const openChatInHistory = (conversationId) => {
        if (!conversationId) return;

        openHistoryWindow();

        const hashInput = document.getElementById('hashchathis');
        if (!hashInput) return;

        hashInput.value = conversationId;
        document.getElementById('btn_search_history')?.click();
    };

    window.QueueModule = {
        init: () => {
            if (document.getElementById('AF_Queue')) return;
            injectStyles();
            createWindow('AF_Queue', 'winTopQueue', 'winLeftQueue', `
                <div class="qg5-panel chmaf-drag-handle" id="qg5-container">
                    <div class="qg5-header chmaf-drag-handle" id="qg5-drag-handle">
                        <button class="qg5-btn buttonHide" id="qg5-hide">❌</button>
                        <div class="qg5-stats">
                            <span>Всего чатов: <b id="qg5-count">0</b></span>
                            <span style="opacity: 0.3;">|</span>
                            <span>Обновление через: <b id="qg5-timer-refresh">0</b>с</span>
                        </div>
                        <button class="qg5-btn" id="qg5-manual-refresh">🔎 Check Queue</button>
                    </div>
                    <div class="qg5-controls">
                        <select class="qg5-input" id="qg5-group-type" style="flex:1;" title="Группа очереди">
                            <option value="TP">🛡️ ТП</option>
                            <option value="TPOS">🖥️ ТП ОС</option>
                            <option value="KC">📞 КЦ</option>
                            <option value="Prem">💎 Prem</option>
                        </select>
                        <select class="qg5-input" id="qg5-status-type" style="flex:1;">
                            <option value="OnOperator">⌛ В очереди</option>
                            <option value="AssignedToOperator">🛠️ В работе у оператора</option>
                            <option value="ClosedByOperator">✅ Закрытые</option>
                            <option value="ClosedByOperatorWithBot">🤖 Закрытые с ботом</option>
                            <option value="ClosedTemporary">⏸️ На паузе</option>
                        </select>
                        <input class="qg5-input" id="qg5-interval" type="number" style="width: 70px;" placeholder="10">
                        <span style="font-size:12px; opacity:0.6;">сек</span>
                    </div>
                    <div id="qg5-data-list" class="qg5-list"></div>
                </div>
            `);
            hideWindowOnDoubleClick('AF_Queue');
            this.QueueModule.attachEvents();
            state.globalTimerInterval = setInterval(this.QueueModule.updateTimers, 1000);
        },

        render: async () => {
            if (state.isRendering) {
    state.renderAgain = true;
    return;
}
            state.isRendering = true;
            const btn = document.getElementById('qg5-manual-refresh');
            if (btn) btn.disabled = true;

            try {
                const list = document.getElementById('qg5-data-list');
                const statusToFetch = document.getElementById('qg5-status-type').value;
                const { tsFrom, tsTo } = getDates();

                // ⚡ Группа очереди — из выпадающего списка (выбор сохраняется в
                // localStorage), а не жёстко от opsection: работает и когда отдел
                // оператора не определён (нет префикса «ТП-» в имени).
                const setgroupList = QUEUE_GROUPS[getSelectedGroupKey()]?.ids || QUEUE_GROUPS.KC.ids;

                const initialBodyContent = {
                    serviceId: "361c681b-340a-4e47-9342-c7309e27e7b5",
                    mode: "Json",
                    groupList: setgroupList,
                    tsFrom, tsTo,
                    usedStatuses: [statusToFetch],
                    orderBy: "ts",
                    orderDirection: "Desc"
                };

                dataChts = await fetchAllPages("https://skyeng.autofaq.ai/api/conversations/history", initialBodyContent);
                document.getElementById('qg5-count').textContent = dataChts.length;

                list.innerHTML = dataChts.map((el, index) => {
                    const ts = new Date(el.ts.replace(/\[.*?\]/g, '').trim());
                    const uType = el.channelUser.payload?.userType;
                    return `
                    <div class="qg5-item" name="prosmChat" data-index="${index}">
                        <span class="qg5-time">${ts.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span class="qg5-badge" title="${esc(uType || '')}">${getUserTypeEmoji(uType)}</span>
                        <span class="qg5-usr-name">${esc(el.channelUser.fullName || 'User')}</span>
                        <span class="qg5-timer" data-start="${ts.getTime()}">00:00:00</span>
                        <span class="qg5-flag" title="Флаг ответа">${getFirstAnswerFlag(el.stats)}</span>
                        <span class="qg5-country">${esc(el.channelUser.payload?.country || "➖")}</span>
                        <button class="qg5-btn" name="assignToMe">🫳</button>
                    </div>`;
                }).join('');

                window.QueueModule.attachItemHandlers();
            } catch (e) {
                console.error('[Queue] Ошибка загрузки очереди:', e);
                const list = document.getElementById('qg5-data-list');
                if (list) {
                    list.innerHTML = '<div style="text-align:center; padding:24px; color:#f87171;">❌ Ошибка загрузки очереди. Попробуй «Check Queue» ещё раз.</div>';
                }
            } finally {
                // КРИТИЧНО: раньше при сетевой ошибке isRendering навсегда оставался
                // true и модуль переставал обновляться до перезагрузки страницы
                state.isRendering = false;
                if (btn) btn.disabled = false;
				if (state.renderAgain) {
    state.renderAgain = false;
    queueMicrotask(() => window.QueueModule.render());
}
            }
        },

        attachItemHandlers: () => {
            const allConvs = document.getElementsByName('prosmChat');
            for (let i = 0; i < allConvs.length; i++) {
                allConvs[i].onclick = () => {
                    openChatInHistory(dataChts[i]?.conversationId);
                };
            }
            const allAssignBtns = document.getElementsByName('assignToMe');
            for (let z = 0; z < allAssignBtns.length; z++) {
                allAssignBtns[z].onclick = (e) => {
                    e.stopPropagation();
                    this.QueueModule.takeChat(dataChts[z].conversationId);
                };
            }
        },

        updateTimers: () => {
            const now = Date.now();
            document.querySelectorAll('.qg5-timer').forEach(el => {
const start = Number(el.dataset.start);

if (!Number.isFinite(start)) {
    el.textContent = '—';
    el.style.color = '';
    el.style.fontWeight = '';
    return;
}

const diff = Math.max(0, now - start);
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                if (diff < 60_000) {
                    el.style.color = "#f9ff00"; el.style.fontWeight = "800";
                } else { el.style.color = ""; el.style.fontWeight = ""; }
            });
        },

        attachEvents: () => {
            document.getElementById('qg5-hide').onclick = () => document.getElementById('AF_Queue').style.display = 'none';
            document.getElementById('qg5-manual-refresh').onclick = () => this.QueueModule.render();
            const intervalInput = document.getElementById('qg5-interval');
            intervalInput.value = localStorage.getItem("RefreshTimerSeconds") || 10;
            intervalInput.onchange = () => {
                let val = Math.max(3, parseInt(intervalInput.value) || 10);
                intervalInput.value = val;
                localStorage.setItem("RefreshTimerSeconds", val);
                this.QueueModule.startAutoRefresh();
            };
            document.getElementById('qg5-status-type').onchange = () => this.QueueModule.render();
            const groupSel = document.getElementById('qg5-group-type');
            if (groupSel) {
                groupSel.value = localStorage.getItem('qg5_group') || getDefaultGroupKey();
                groupSel.onchange = () => {
                    localStorage.setItem('qg5_group', groupSel.value);
                    this.QueueModule.render();
                };
            }
        },

        startAutoRefresh: () => {
            clearInterval(state.refreshInterval);
            clearInterval(state.countdownInterval);
            const sec = parseInt(localStorage.getItem("RefreshTimerSeconds")) || 10;
            let current = sec;
            const el = document.getElementById('qg5-timer-refresh');
            state.countdownInterval = setInterval(() => {
                current--;
                if (current <= 0) current = sec;
                if (el) el.textContent = current;
            }, 1000);
            state.refreshInterval = setInterval(() => this.QueueModule.render(), sec * 1000);
        },

        takeChat: (cid) => {
            const assign = (oid) => afApiFetch("https://skyeng.autofaq.ai/api/conversation/assign", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: cid, assignToOperatorId: oid })
            });
            assign("null").then(() => setTimeout(() => assign(typeof operatorId !== 'undefined' ? operatorId : null), 2000));
        }
    };

    window.getQueuePress = () => {
        window.QueueModule.init();
        const win = document.getElementById('AF_Queue');
        if (win.style.display === 'none' || win.style.display === '') {
            win.style.display = 'block';
            window.QueueModule.render();
            window.QueueModule.startAutoRefresh();
        } else {
            win.style.display = 'none';
            clearInterval(state.refreshInterval);
            clearInterval(state.countdownInterval);
        }
    };
})();