/**
 * Refactored Chat Queue Module (Premium Edition 5.0)
 * Visual Style: Corporate Graphite Dark
 * Unique Prefix: qg5-
 * Filename: pisa.js
 */

(function () {
    let dataChts = [];

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
        renderAgain: false,
        selectedBadges: new Set()
    };

    const BADGE_CONFIG = [
        { type: "teacher", emoji: "👽", title: "Учитель" },
        { type: "student", emoji: "👨‍🎓", title: "Ученик" },
        { type: "parent", emoji: "😵‍💫", title: "Родитель" },
        { type: "other", emoji: "❓", title: "Другое" }
    ];

    const normalizeUserType = (type) => {
        if (["teacher", "student", "parent"].includes(type)) return type;
        return "other";
    };

    const injectStyles = () => {
        if (document.getElementById('qg5-styles')) return;
        const style = document.createElement('style');
        style.id = 'qg5-styles';
        style.innerHTML = `
            #AF_Queue .qg5-panel {
                box-sizing: border-box;
                width: min(650px, calc(100vw - 24px));
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
                font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
                z-index: 1000003;
                position: relative;
            }

            #AF_Queue .qg5-panel,
            #AF_Queue .qg5-panel * {
                box-sizing: border-box;
            }

            #AF_Queue .qg5-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 14px;
                padding-bottom: 14px;
                border-bottom: 1px solid #344258;
                cursor: move;
            }

            #AF_Queue .qg5-stats {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
                padding: 7px 12px;
                color: #a6b4cb;
                background: #182335;
                border: 1px solid #364660;
                border-radius: 10px;
                letter-spacing: .03em;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
            }

            #AF_Queue .qg5-stats b,
            #AF_Queue #qg5-count,
            #AF_Queue #qg5-timer-refresh {
                color: #a9c0ff;
                font-family: 'JetBrains Mono', 'SF Mono', monospace;
            }

            /* Интерактивная настройка интервала в блоке таймера */
            #AF_Queue .qg5-timer-setting {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                cursor: pointer;
            }
            #AF_Queue .qg5-interval-wrapper {
                display: inline-flex;
                align-items: center;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 6px;
                padding: 1px 4px;
                margin-left: 2px;
                transition: border-color 0.2s;
            }
            #AF_Queue .qg5-interval-wrapper:hover {
                border-color: #657caa;
            }
            #AF_Queue .qg5-input-compact {
                width: 32px;
                background: transparent;
                border: none;
                outline: none;
                color: #f0c674;
                font-size: 11px;
                font-weight: 700;
                text-align: center;
                font-family: 'JetBrains Mono', monospace;
                padding: 0;
            }
            #AF_Queue .qg5-input-compact::-webkit-inner-spin-button,
            #AF_Queue .qg5-input-compact::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }

            #AF_Queue .qg5-btn {
                min-height: 36px;
                padding: 8px 14px;
                color: #dce5f5;
                background: #1b283c;
                border: 1px solid #3c4d68;
                border-radius: 9px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: inherit;
                transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
            }

            #AF_Queue .qg5-btn:hover:not(:disabled) {
                color: #fff;
                background: #293b56;
                border-color: #7799e2;
                transform: translateY(-1px);
            }

            #AF_Queue .qg5-btn:disabled {
                opacity: .55;
            }

            #AF_Queue #qg5-hide {
                background: rgba(255, 116, 140, .08) !important;
                border-color: rgba(255, 116, 140, .3) !important;
                color: #ffb0be !important;
                padding: 8px 12px !important;
            }

            #AF_Queue #qg5-manual-refresh {
                margin-left: auto;
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

            /* Панель фильтров: строго в один ряд */
            #AF_Queue .qg5-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 14px;
                flex-wrap: nowrap;
            }

            #AF_Queue .qg5-input {
                flex: 1 1 auto;
                min-width: 0;
                height: 36px;
                color: #edf2fb;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 9px;
                padding: 0 10px;
                outline: none;
                font-size: 13px;
                font-family: inherit;
                transition: background 0.2s, border-color 0.2s;
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

            #AF_Queue .qg5-input option {
                background: #111827;
                color: #edf2fb;
            }

            /* Фильтр бейджей */
            #AF_Queue .qg5-badge-filters {
                display: flex;
                align-items: center;
                gap: 4px;
                background: #0d1625;
                border: 1px solid #3a4961;
                border-radius: 9px;
                padding: 3px 6px;
                height: 36px;
                flex-shrink: 0;
            }

            #AF_Queue .qg5-badge-toggle {
                font-size: 15px;
                line-height: 1;
                padding: 4px 6px;
                border-radius: 6px;
                background: #182335;
                border: 1px solid #364660;
                cursor: pointer;
                transition: all 0.15s ease;
                user-select: none;
                opacity: 0.55;
            }

            #AF_Queue .qg5-badge-toggle:hover {
                background: #23334b;
                border-color: #6685be;
                opacity: 0.9;
                transform: scale(1.05);
            }

            #AF_Queue .qg5-badge-toggle.is-active {
                background: #2b4372;
                border-color: #7093e6;
                box-shadow: 0 0 8px rgba(112, 147, 230, 0.35);
                opacity: 1;
            }

            /* Список чатов */
            #AF_Queue .qg5-list {
                max-height: 520px;
                overflow-y: auto;
                padding-right: 6px;
                scrollbar-width: thin;
                scrollbar-color: #536a8e transparent;
            }

            #AF_Queue .qg5-list::-webkit-scrollbar { width: 6px; }
            #AF_Queue .qg5-list::-webkit-scrollbar-track { background: transparent; }
            #AF_Queue .qg5-list::-webkit-scrollbar-thumb {
                background: #536a8e;
                border-radius: 4px;
            }

            #AF_Queue .qg5-item {
                display: flex;
                align-items: center;
                gap: 10px;
                min-width: 0;
                margin-bottom: 7px;
                padding: 9px 12px;
                background: #1a2536;
                border: 1px solid #344258;
                border-left: 3px solid #617fbd;
                border-radius: 10px;
                cursor: pointer;
                transition: background-color .16s ease, border-color .16s ease;
            }

            #AF_Queue .qg5-item:hover {
                background: #23334b;
                border-color: #6685be;
                border-left-color: #92afff;
            }

            #AF_Queue .qg5-time {
                flex: 0 0 68px;
                color: #b6c9f5;
                font-family: 'JetBrains Mono', monospace;
                font-size: 12px;
                font-weight: 700;
            }

            #AF_Queue .qg5-badge {
                font-size: 16px;
                min-width: 22px;
                text-align: center;
            }

            #AF_Queue .qg5-usr-name {
                flex: 1;
                font-weight: 600;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                font-size: 13px;
                color: #f0f4fb;
            }

            #AF_Queue .qg5-timer {
                color: #c1ceea;
                font-family: 'JetBrains Mono', monospace;
                min-width: 72px;
                text-align: right;
                font-size: 12px;
                font-weight: 700;
            }

            #AF_Queue .qg5-flag {
                font-size: 14px;
                min-width: 20px;
                text-align: center;
            }

            #AF_Queue .qg5-country {
                max-width: 85px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: #c8d6f4;
                background: #293a56;
                border: 1px solid #435b80;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 6px;
            }

            #AF_Queue button[name="assignToMe"] {
                flex: 0 0 auto;
                min-width: 34px !important;
                height: 28px !important;
                color: #cfe0ff !important;
                background: #293e67 !important;
                border: 1px solid #536fa7 !important;
                border-radius: 8px !important;
                cursor: pointer;
                font-size: 13px !important;
                padding: 0 6px !important;
                transition: all 0.16s ease !important;
            }

            #AF_Queue button[name="assignToMe"]:hover:not(:disabled) {
                color: #fff !important;
                background: #395892 !important;
                border-color: #87a9ed !important;
                transform: translateY(-1px) !important;
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
            const resp = await afApiFetch(url, {
                headers: { "content-type": "application/json" },
                referrer: "https://skyeng.autofaq.ai/logs",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: JSON.stringify(bodyContent),
                method: "POST"
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
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
        if (stats.firstOperatorAnswerTime) return "✅";
        const usedStatuses = stats.usedStatuses || [];
        const hasAssignedOnly = usedStatuses.length === 1 && usedStatuses[0] === "AssignedToOperator";
        const hasOperators = stats.participatingOperators && stats.participatingOperators.length > 0;
        if (hasAssignedOnly && !hasOperators) return "⤴️";
        if (hasOperators) return "❌";
        return "🚫";
    };

    const QUEUE_GROUPS = {
        TP: { label: '🛡️ ТП', ids: ['c7bbb211-a217-4ed3-8112-98728dc382d8'] },
        TPOS: { label: '🖥️ ТП ОС', ids: ['8266dbb1-db44-4910-8b5f-a140deeec5c0'] },
        KC: { label: '📞 КЦ', ids: ['b6f7f34d-2f08-fc19-3661-29ac00842898'] },
        Prem: { label: '💎 Prem', ids: ['c1262bdf-444a-41e1-974e-03d754dcff25'] }
    };

    const getDefaultGroupKey = () => {
        const sec = typeof getOpSection === 'function'
            ? getOpSection()
            : (typeof opsection !== 'undefined' ? String(opsection).trim() : '');
        if (sec === 'ТП ОС') return 'TPOS';
        if (sec.startsWith('ТП')) return 'TP';
        if (sec === 'Prem') return 'Prem';
        if (sec === 'КЦ') return 'KC';
        return 'KC';
    };

    const getSelectedGroupKey = () =>
        document.getElementById('qg5-group-type')?.value
        || localStorage.getItem('qg5_group')
        || getDefaultGroupKey();

    const isHistoryWindowOpen = () => {
        const historyWindow = document.getElementById('AF_ChatHis');
        return !!historyWindow && getComputedStyle(historyWindow).display !== 'none';
    };

    const openHistoryWindow = () => {
        if (isHistoryWindowOpen()) return;
        if (typeof getopennewcatButtonPress === 'function') {
            getopennewcatButtonPress();
            return;
        }
        document.getElementById('opennewcat')?.click();
    };

    const openChatInHistory = (conversationId) => {
        if (!conversationId) return;
        openHistoryWindow();
        const hashInput = document.getElementById('hashchathis');
        if (!hashInput) return;
        hashInput.value = conversationId;
        document.getElementById('btn_search_history')?.click();
    };

    const renderChatList = () => {
        const list = document.getElementById('qg5-data-list');
        const countEl = document.getElementById('qg5-count');
        if (!list) return;

        const isFilterActive = state.selectedBadges.size > 0;
        const visibleItems = [];

        dataChts.forEach((el, index) => {
            const rawType = el.channelUser?.payload?.userType;
            const normType = normalizeUserType(rawType);
            if (!isFilterActive || state.selectedBadges.has(normType)) {
                visibleItems.push({ el, originalIndex: index });
            }
        });

        if (countEl) {
            countEl.textContent = isFilterActive
                ? `${visibleItems.length} / ${dataChts.length}`
                : `${dataChts.length}`;
        }

        if (visibleItems.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:24px; color:#8e96b8;">
                ${dataChts.length === 0 ? 'Чатов нет' : 'Нет чатов с выбранными бейджами'}
            </div>`;
            return;
        }

        list.innerHTML = visibleItems.map(({ el, originalIndex }) => {
            const ts = new Date(el.ts.replace(/\[.*?\]/g, '').trim());
            const uType = el.channelUser?.payload?.userType;
            return `
            <div class="qg5-item" name="prosmChat" data-index="${originalIndex}">
                <span class="qg5-time">${ts.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span class="qg5-badge" title="${esc(uType || '')}">${getUserTypeEmoji(uType)}</span>
                <span class="qg5-usr-name">${esc(el.channelUser?.fullName || 'User')}</span>
                <span class="qg5-timer" data-start="${ts.getTime()}">00:00:00</span>
                <span class="qg5-flag" title="Флаг ответа">${getFirstAnswerFlag(el.stats)}</span>
                <span class="qg5-country">${esc(el.channelUser?.payload?.country || "➖")}</span>
                <button class="qg5-btn" name="assignToMe">🫳</button>
            </div>`;
        }).join('');

        window.QueueModule.attachItemHandlers();
    };

    window.QueueModule = {
        init: () => {
            if (document.getElementById('AF_Queue')) return;
            injectStyles();

            const badgeButtonsHtml = BADGE_CONFIG.map(b =>
                `<button type="button" class="qg5-badge-toggle" data-badge="${b.type}" title="${b.title}">${b.emoji}</button>`
            ).join('');

            createWindow('AF_Queue', 'winTopQueue', 'winLeftQueue', `
                <div class="qg5-panel chmaf-drag-handle" id="qg5-container">
                    <div class="qg5-header chmaf-drag-handle" id="qg5-drag-handle">
                        <button class="qg5-btn buttonHide" id="qg5-hide">❌</button>
                        <div class="qg5-stats">
                            <span>Всего: <b id="qg5-count">0</b></span>
                            <span style="opacity: 0.3;">|</span>
                            <span class="qg5-timer-setting" title="Кликните чтобы изменить интервал">
                                Рефреш: <b id="qg5-timer-refresh">0</b>с
                                <span class="qg5-interval-wrapper" title="Период автообновления (сек)">
                                    ⚙️<input class="qg5-input-compact" id="qg5-interval" type="number" min="3" max="999" placeholder="10">с
                                </span>
                            </span>
                        </div>
                        <button class="qg5-btn" id="qg5-manual-refresh">🔎 Check Queue</button>
                    </div>
                    <div class="qg5-controls">
                        <select class="qg5-input" id="qg5-group-type" style="flex: 1.1;" title="Группа очереди">
                            <option value="TP">🛡️ ТП</option>
                            <option value="TPOS">🖥️ ТП ОС</option>
                            <option value="KC">📞 КЦ</option>
                            <option value="Prem">💎 Prem</option>
                        </select>
                        <select class="qg5-input" id="qg5-status-type" style="flex: 1.3;" title="Статус чатов">
                            <option value="OnOperator">⌛ В очереди</option>
                            <option value="AssignedToOperator">🛠️ В работе у оператора</option>
                            <option value="ClosedByOperator">✅ Закрытые</option>
                            <option value="ClosedByOperatorWithBot">🤖 Закрытые с ботом</option>
                            <option value="ClosedTemporary">⏸️ На паузе</option>
                        </select>
                        <div class="qg5-badge-filters" title="Фильтр по типу пользователей (можно несколько)">
                            ${badgeButtonsHtml}
                        </div>
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
                const statusToFetch = document.getElementById('qg5-status-type').value;
                const { tsFrom, tsTo } = getDates();
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
                renderChatList();
            } catch (e) {
                console.error('[Queue] Ошибка загрузки очереди:', e);
                const list = document.getElementById('qg5-data-list');
                if (list) {
                    list.innerHTML = '<div style="text-align:center; padding:24px; color:#f87171;">❌ Ошибка загрузки очереди. Попробуй «Check Queue» ещё раз.</div>';
                }
            } finally {
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
                    const originalIdx = Number(allConvs[i].dataset.index);
                    openChatInHistory(dataChts[originalIdx]?.conversationId);
                };
            }
            const allAssignBtns = document.getElementsByName('assignToMe');
            for (let z = 0; z < allAssignBtns.length; z++) {
                allAssignBtns[z].onclick = (e) => {
                    e.stopPropagation();
                    const itemElem = allAssignBtns[z].closest('.qg5-item');
                    const originalIdx = Number(itemElem?.dataset.index);
                    this.QueueModule.takeChat(dataChts[originalIdx]?.conversationId);
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

            document.querySelectorAll('.qg5-badge-toggle').forEach(btn => {
                btn.onclick = () => {
                    const badgeType = btn.dataset.badge;
                    if (state.selectedBadges.has(badgeType)) {
                        state.selectedBadges.delete(badgeType);
                        btn.classList.remove('is-active');
                    } else {
                        state.selectedBadges.add(badgeType);
                        btn.classList.add('is-active');
                    }
                    renderChatList();
                };
            });
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