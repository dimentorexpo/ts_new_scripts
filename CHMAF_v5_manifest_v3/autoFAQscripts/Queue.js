/**
 * Refactored Chat Queue Module (Stable Version 5.0)
 * Visual Style: Glassmorphism
 * Unique Prefix: qg5-
 * Filename: pisa.js
 */

(function () {
    let dataChts = []; // Глобальная внутри модуля для совместимости с логикой пользователя

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
                background: rgba(30, 32, 45, 0.9) !important;
                backdrop-filter: blur(25px);
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 20px;
                color: #e0e0e0;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
                padding: 18px !important;
                width: 620px;
                z-index: 1000003;
            }
            .qg5-header { display: flex; align-items: center; gap: 15px; margin-bottom: 18px; cursor: grab; }
            .qg5-stats { display: flex; gap: 12px; font-size: 13px; background: rgba(0, 0, 0, 0.4); padding: 6px 15px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
            .qg5-controls { display: flex; gap: 12px; margin-bottom: 18px; align-items: center; flex-wrap: wrap; }
            .qg5-input { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 10px; color: #fff; padding: 7px 12px; outline: none; font-size: 14px; }
            .qg5-btn { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 8px 16px; border-radius: 12px; cursor: pointer; transition: all 0.3s; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
            .qg5-btn:hover:not(:disabled) { background: rgba(255, 255, 255, 0.2); border-color: #4facfe; transform: translateY(-1px); }
            .qg5-list { max-height: 520px; overflow-y: auto; padding-right: 8px; }
            .qg5-list::-webkit-scrollbar { width: 5px; }
            .qg5-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
            .qg5-item { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 15px; transition: all 0.25s; cursor: pointer; }
            .qg5-item:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.2); transform: translateX(4px); }
            .qg5-time { font-family: monospace; color: #0be90b; font-weight: 800; width: 75px; font-size: 14px; }
            .qg5-timer { font-family: monospace; color: #fbc02d; min-width: 80px; text-align: right; font-size: 14px; }
            .qg5-usr-name { flex: 1; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 14px; color: bisque; }
            .qg5-badge { font-size: 16px; min-width: 25px; text-align: center; }
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
                        <button class="qg5-btn" id="qg5-hide">hide</button>
                        <div class="qg5-stats">
                            <span>Всего чатов: <b id="qg5-count" style="color:coral;">0</b></span>
                            <span style="opacity: 0.3;">|</span>
                            <span>Обновление через: <b id="qg5-timer-refresh" style="color:#00e9a0;">0</b>с</span>
                        </div>
                        <button class="qg5-btn" id="qg5-manual-refresh" style="margin-left:auto;">🔎 Check Queue</button>
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
                        <span title="Флаг ответа">${getFirstAnswerFlag(el.stats)}</span>
                        <span style="font-size:11px; color:bisque;">${el.channelUser.payload?.country || "➖"}</span>
                        <button class="qg5-btn" name="assignToMe" style="padding:4px 10px; background:rgba(82,196,26,0.2);">🫳</button>
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
            showCustomAlert?.("Забираем чат...", 1);
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
