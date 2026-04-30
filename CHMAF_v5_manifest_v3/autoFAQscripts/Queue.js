/**
 * Refactored Chat Queue Module (Premium Edition 5.0)
 * Visual Style: Luxury Glassmorphism
 * Unique Prefix: qg5-
 * Filename: pisa.js
 */

(function () {
    let dataChts = [];

    const state = {
        refreshInterval: null,
        countdownInterval: null,
        globalTimerInterval: null,
        isRendering: false
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
                cursor: grab;
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
                background: rgba(0, 0, 0, 0.28);
                padding: 8px 18px;
                border-radius: 50px;
                border: 1px solid rgba(212, 175, 55, 0.1);
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.25);
                color: #8e96b8;
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
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(212, 175, 55, 0.12);
                border-radius: 12px;
                color: #f0f2ff;
                padding: 9px 14px;
                outline: none;
                font-size: 13px;
                font-family: inherit;
                transition: all 0.3s ease;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
            }
            .qg5-input:focus {
                border-color: rgba(212, 175, 55, 0.4);
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08), inset 0 2px 4px rgba(0,0,0,0.2);
            }
            .qg5-input option {
                background: #1e2235;
                color: #e8eaf6;
            }
            .qg5-btn {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
                border: 1px solid rgba(212, 175, 55, 0.12);
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
            }
            .qg5-btn:hover:not(:disabled) {
                background: linear-gradient(145deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.05));
                border-color: rgba(212, 175, 55, 0.4);
                transform: translateY(-2px);
                box-shadow: 0 8px 28px rgba(212, 175, 55, 0.12);
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
            .qg5-list::-webkit-scrollbar { width: 6px; }
            .qg5-list::-webkit-scrollbar-track { background: rgba(0,0,0,0.15); border-radius: 10px; }
            .qg5-list::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(212, 175, 55, 0.35), rgba(212, 175, 55, 0.1)); border-radius: 10px; }
            .qg5-list::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, rgba(212, 175, 55, 0.55), rgba(212, 175, 55, 0.2)); }
            .qg5-item {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.01));
                border: 1px solid rgba(212, 175, 55, 0.07);
                border-radius: 16px;
                padding: 14px;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 16px;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
                position: relative;
                overflow: hidden;
            }
            .qg5-item::before {
                content: '';
                position: absolute;
                top: 0; left: 0; width: 3px; height: 100%;
                background: linear-gradient(180deg, rgba(212, 175, 55, 0.5), transparent);
                opacity: 0;
                transition: opacity 0.3s;
            }
            .qg5-item:hover {
                background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.03));
                border-color: rgba(212, 175, 55, 0.25);
                transform: translateX(6px) scale(1.01);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 0 24px rgba(212, 175, 55, 0.04);
            }
            .qg5-item:hover::before {
                opacity: 1;
            }
            .qg5-time {
                font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
                color: #7ee787;
                font-weight: 700;
                width: 80px;
                font-size: 13px;
                letter-spacing: 0.5px;
            }
            .qg5-timer {
                font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
                color: #f0c674;
                min-width: 85px;
                text-align: right;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            .qg5-usr-name {
                flex: 1;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 14px;
                color: #f0f2ff;
                letter-spacing: 0.2px;
            }
            .qg5-badge {
                font-size: 18px;
                min-width: 28px;
                text-align: center;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                transition: transform 0.3s;
            }
            .qg5-item:hover .qg5-badge {
                transform: scale(1.15);
            }
            .qg5-flag {
                font-size: 15px;
                filter: drop-shadow(0 0 4px rgba(255,255,255,0.08));
                min-width: 22px;
                text-align: center;
            }
            .qg5-country {
                font-size: 11px;
                color: #d4af37;
                font-weight: 600;
                letter-spacing: 0.5px;
                background: rgba(212, 175, 55, 0.08);
                padding: 3px 8px;
                border-radius: 6px;
                border: 1px solid rgba(212, 175, 55, 0.1);
            }
            button[name="assignToMe"] {
                background: linear-gradient(145deg, rgba(82, 196, 26, 0.18), rgba(82, 196, 26, 0.04)) !important;
                border-color: rgba(82, 196, 26, 0.25) !important;
                color: #a8e063 !important;
                font-size: 16px !important;
                padding: 6px 12px !important;
                border-radius: 10px !important;
                transition: all 0.3s ease !important;
            }
            button[name="assignToMe"]:hover {
                background: linear-gradient(145deg, rgba(82, 196, 26, 0.32), rgba(82, 196, 26, 0.08)) !important;
                border-color: rgba(82, 196, 26, 0.45) !important;
                box-shadow: 0 4px 16px rgba(82, 196, 26, 0.15) !important;
                transform: translateY(-1px) scale(1.08) !important;
            }
            #qg5-count {
                color: #f0c674;
            }
            #qg5-timer-refresh {
                color: #7ee787;
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
            const resp = await fetch(url, {
                headers: { "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : "" },
                referrer: "https://skyeng.autofaq.ai/logs",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: JSON.stringify(bodyContent),
                method: "POST",
                mode: "cors",
                credentials: "include"
            });
            if (!resp.ok) break;
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
        if (stats.participatingOperators.includes("autoFAQ"))
            return stats.firstOperatorAnswerTime ? "✅" : "❌";
        if (stats.participatingOperators.length > 0)
            return "⤴️";
        return "🚫";
    };

    window.QueueModule = {
        init: () => {
            if (document.getElementById('AF_Queue')) return;
            injectStyles();
            createWindow('AF_Queue', 'winTopQueue', 'winLeftQueue', `
                <div class="qg5-panel" id="qg5-container">
                    <div class="qg5-header" id="qg5-drag-handle">
                        <button class="qg5-btn buttonHide" id="qg5-hide">❌</button>
                        <div class="qg5-stats">
                            <span>Всего чатов: <b id="qg5-count">0</b></span>
                            <span style="opacity: 0.3;">|</span>
                            <span>Обновление через: <b id="qg5-timer-refresh">0</b>с</span>
                        </div>
                        <button class="qg5-btn" id="qg5-manual-refresh">🔎 Check Queue</button>
                    </div>
                    <div class="qg5-controls">
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
            if (state.isRendering) return;
            state.isRendering = true;
            const btn = document.getElementById('qg5-manual-refresh');
            if (btn) btn.disabled = true;

            const list = document.getElementById('qg5-data-list');
            const statusToFetch = document.getElementById('qg5-status-type').value;
            const { tsFrom, tsTo } = getDates();

            let setgroupList = (opsection == "ТП" || opsection == "ТП ОС")
                ? ["c7bbb211-a217-4ed3-8112-98728dc382d8"]
                : ["b6f7f34d-2f08-fc19-3661-29ac00842898"];

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
                        <span class="qg5-badge" title="${uType || ''}">${getUserTypeEmoji(uType)}</span>
                        <span class="qg5-usr-name">${el.channelUser.fullName || 'User'}</span>
                        <span class="qg5-timer" data-start="${ts.getTime()}">00:00:00</span>
                        <span class="qg5-flag" title="Флаг ответа">${getFirstAnswerFlag(el.stats)}</span>
                        <span class="qg5-country">${el.channelUser.payload?.country || "➖"}</span>
                        <button class="qg5-btn" name="assignToMe">🫳</button>
                    </div>`;
            }).join('');

            this.QueueModule.attachItemHandlers();
            state.isRendering = false;
            if (btn) btn.disabled = false;
        },

        attachItemHandlers: () => {
            const allConvs = document.getElementsByName('prosmChat');
            for (let i = 0; i < allConvs.length; i++) {
                allConvs[i].onclick = () => {
                    const chatHis = document.getElementById('AF_ChatHis');
                    if (chatHis && chatHis.style.display === 'none') document.getElementById('opennewcat')?.click();
                    const hashInput = document.getElementById('hashchathis');
                    if (hashInput) {
                        hashInput.value = dataChts[i].conversationId;
                        document.getElementById('btn_search_history')?.click();
                    }
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
                const start = parseInt(el.dataset.start);
                const diff = now - start;
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                if (h === 0 && m === 0 && s <= 60) {
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
            const assign = (oid) => fetch("https://skyeng.autofaq.ai/api/conversation/assign", {
                method: "POST",
                headers: { "content-type": "application/json", "x-csrf-token": typeof aftoken !== 'undefined' ? aftoken : "" },
                body: JSON.stringify({ command: "DO_ASSIGN_CONVERSATION", conversationId: cid, assignToOperatorId: oid }),
                credentials: "include"
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