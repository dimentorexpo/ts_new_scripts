(function () {
    'use strict';

    const CONFIG = {
        prefix: 'af-ns',
        api: {
            changelog: 'https://trm-api.skyeng.ru/api/v1/actionLog/getTeacherChangelog',
            userData: 'https://teachers-conductor.skyeng.ru/api/v1/getIdUsersData'
        }
    };

    const STYLES = `
        .${CONFIG.prefix}-container {
            all: initial;
            display: none;
            position: fixed;
            top: 15%;
            left: 30%;
            z-index: 999999;
            width: 660px;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            background: linear-gradient(165deg, rgba(27, 29, 40, 0.96) 0%, rgba(12, 13, 19, 0.98) 100%);
            backdrop-filter: blur(24px) saturate(140%);
            -webkit-backdrop-filter: blur(24px) saturate(140%);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-top-color: rgba(255, 255, 255, 0.16);
            border-radius: 18px;
            box-shadow:
                0 24px 60px rgba(0, 0, 0, 0.6),
                0 0 40px rgba(129, 140, 248, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.06);
            color: #e8ecf4;
            overflow: hidden;
        }

        .${CONFIG.prefix}-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 13px 18px;
            cursor: move;
            border-bottom: 1px solid rgba(255, 255, 255, 0.07);
            background: rgba(255, 255, 255, 0.02);
        }

        .${CONFIG.prefix}-titleblock { display: flex; align-items: center; gap: 10px; }
        .${CONFIG.prefix}-icon-chip {
            width: 32px; height: 32px;
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 16px;
            background: linear-gradient(135deg, rgba(129, 140, 248, 0.25), rgba(99, 102, 241, 0.1));
            border: 1px solid rgba(129, 140, 248, 0.35);
            box-shadow: 0 4px 14px rgba(129, 140, 248, 0.2), inset 0 1px 0 rgba(255,255,255,0.15);
            pointer-events: none;
        }
        .${CONFIG.prefix}-title { font-size: 13px; font-weight: 700; color: #fff; pointer-events: none; letter-spacing: 0.3px; }
        .${CONFIG.prefix}-subtitle {
            font-size: 9px; text-transform: uppercase;
            letter-spacing: 1.4px; color: rgba(255, 255, 255, 0.45);
            pointer-events: none;
        }

        .af-btn {
            padding: 7px 13px;
            border-radius: 9px;
            font-size: 12px;
            font-family: inherit;
            line-height: 1;
            cursor: pointer;
            background: rgba(255, 255, 255, 0.06);
            color: #dfe6f1;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .af-btn:hover {
            background: rgba(255, 255, 255, 0.13);
            border-color: rgba(129, 140, 248, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
        }
        .af-btn:active { transform: translateY(0) scale(0.97); }

        .${CONFIG.prefix}-input-row {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 18px;
        }

        .${CONFIG.prefix}-input {
            width: 150px;
            padding: 9px 12px;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.09);
            border-radius: 10px;
            color: #fff;
            text-align: center;
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            letter-spacing: 1px;
            outline: none;
            transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .${CONFIG.prefix}-input:focus {
            border-color: rgba(129, 140, 248, 0.6);
            background: rgba(0, 0, 0, 0.5);
            box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.14);
        }

        .af-btn-primary {
            background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%) !important;
            border: none !important;
            color: #0b0d1c !important;
            font-weight: 700 !important;
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
        }

        .af-btn-primary:hover {
            filter: brightness(1.1);
            transform: translateY(-1px);
            box-shadow: 0 8px 26px rgba(99, 102, 241, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
        }

        .${CONFIG.prefix}-content {
            padding: 0 18px 20px;
            max-height: 450px;
            overflow-y: auto;
        }

        .${CONFIG.prefix}-content::-webkit-scrollbar { width: 5px; }
        .${CONFIG.prefix}-content::-webkit-scrollbar-track { background: transparent; }
        .${CONFIG.prefix}-content::-webkit-scrollbar-thumb {
            background: rgba(129, 140, 248, 0.25);
            border-radius: 10px;
        }
        .${CONFIG.prefix}-content::-webkit-scrollbar-thumb:hover { background: rgba(129, 140, 248, 0.45); }

        .${CONFIG.prefix}-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 5px;
            font-size: 13px;
        }

        .${CONFIG.prefix}-table th {
            position: sticky;
            top: 0;
            background: rgba(22, 24, 33, 0.95);
            backdrop-filter: blur(10px);
            padding: 11px 10px;
            color: rgba(255, 255, 255, 0.45);
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.3px;
            font-weight: 700;
            z-index: 10;
        }

        .${CONFIG.prefix}-table tr td {
            background: rgba(255, 255, 255, 0.04);
            padding: 11px 10px;
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            transition: background 0.2s ease;
        }

        .${CONFIG.prefix}-table tr td:first-child { border-left: 2px solid transparent; border-radius: 9px 0 0 9px; }
        .${CONFIG.prefix}-table tr td:last-child { border-right: 1px solid rgba(255,255,255,0.05); border-radius: 0 9px 9px 0; }

        .${CONFIG.prefix}-table tr:hover td {
            background: rgba(129, 140, 248, 0.08);
            border-color: rgba(129, 140, 248, 0.25);
        }
        .${CONFIG.prefix}-table tr:hover td:first-child { border-left-color: rgba(129, 140, 248, 0.7); }

        .status-badge {
            padding: 4px 11px;
            border-radius: 20px;
            font-weight: 800;
            font-size: 10px;
            letter-spacing: 0.8px;
            display: inline-block;
        }
        .status-yes { background: rgba(52, 211, 153, 0.12); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); }
        .status-no { background: rgba(248, 113, 113, 0.12); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }

        .user-name { font-weight: 600; color: #fff; }
        .date-cell { color: #a5b4fc; font-family: 'JetBrains Mono', monospace; font-size: 12px; }

        .${CONFIG.prefix}-loader {
            text-align: center;
            padding: 34px 20px;
            color: rgba(255, 255, 255, 0.55);
            font-size: 13px;
            letter-spacing: 0.3px;
            animation: ${CONFIG.prefix}-pulse 1.4s ease-in-out infinite;
        }

        @keyframes ${CONFIG.prefix}-pulse {
            0%, 100% { opacity: 0.55; }
            50% { opacity: 1; }
        }

        .${CONFIG.prefix}-error {
            text-align: center;
            padding: 34px 20px;
            color: #f87171;
            font-size: 13px;
        }
    `;

    const TEMPLATE = `
        <div class="${CONFIG.prefix}-header chmaf-drag-handle" id="${CONFIG.prefix}-drag">
            <div class="${CONFIG.prefix}-titleblock">
                <div class="${CONFIG.prefix}-icon-chip">📋</div>
                <div>
                    <div class="${CONFIG.prefix}-title">Статус набора</div>
                    <div class="${CONFIG.prefix}-subtitle">Teacher Onboarding Log</div>
                </div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="af-btn" id="${CONFIG.prefix}-trm">🧑‍🏫 TRM</button>
                <button class="af-btn buttonHide" id="${CONFIG.prefix}-hide">✕</button>
            </div>
        </div>
        <div class="${CONFIG.prefix}-input-row">
            <input class="${CONFIG.prefix}-input" id="${CONFIG.prefix}-input" type="text" placeholder="Teacher ID">
            <button class="af-btn af-btn-primary" id="${CONFIG.prefix}-search">🔍 Найти</button>
        </div>
        <div class="${CONFIG.prefix}-content" id="${CONFIG.prefix}-table-root"></div>
    `;

    class NaborStatusWidget {
        constructor() {
            this.init();
            this.setupDragging();
        }

        // Универсальный метод для запросов через Chrome API
        async request(url, payload) {
            return new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'getFetchRequest',
                    fetchURL: url,
                    requestOptions: {
                        method: "POST",
                        headers: { "content-type": "application/json; charset=UTF-8" },
                        body: JSON.stringify(payload)
                    }
                }, (res) => resolve(res));
            });
        }

        init() {
            const style = document.createElement('style');
            style.textContent = STYLES;
            document.head.appendChild(style);

            this.el = document.createElement('div');
            this.el.id = 'AF_NaborStatus';
            this.el.className = `${CONFIG.prefix}-container`;
            this.el.innerHTML = TEMPLATE;
            document.body.appendChild(this.el);

            this.refs = {
                input: document.getElementById(`${CONFIG.prefix}-input`),
                tableRoot: document.getElementById(`${CONFIG.prefix}-table-root`),
                drag: document.getElementById(`${CONFIG.prefix}-drag`)
            };

            this.el.addEventListener('dblclick', (e) => {
                if (e.target === this.refs.drag) this.el.style.display = 'none';
            });

            document.getElementById(`${CONFIG.prefix}-hide`).onclick = () => this.el.style.display = 'none';
            document.getElementById(`${CONFIG.prefix}-search`).onclick = () => this.loadData();
            document.getElementById(`${CONFIG.prefix}-trm`).onclick = () => {
                const id = this.refs.input.value.trim();
                if (id) window.open(`https://trm.skyeng.ru/teacher/${id}`, '_blank');
            };

            document.addEventListener('click', (e) => {
                const btn = e.target.closest('#butTeacherNabor');
                if (btn) {
                    const isHidden = this.el.style.display === 'none' || !this.el.style.display;
                    this.el.style.display = isHidden ? 'block' : 'none';
                    if (isHidden) {
                        const sid = document.getElementById('idstudent')?.value;
                        if (sid) this.refs.input.value = sid.trim();
                        this.loadData();
                    }
                }
            });
        }

        setupDragging() {
            let ox, oy, isDown = false;
            this.refs.drag.onmousedown = (e) => {
                if (e.target.tagName === 'BUTTON') return;
                isDown = true;
                ox = this.el.offsetLeft - e.clientX;
                oy = this.el.offsetTop - e.clientY;
            };
            document.onmouseup = () => isDown = false;
            document.onmousemove = (e) => {
                if (isDown) {
                    this.el.style.left = (e.clientX + ox) + 'px';
                    this.el.style.top = (e.clientY + oy) + 'px';
                }
            };
        }

        async loadData() {
            const tId = this.refs.input.value.trim();
            if (tId.length < 3) return;

            this.refs.tableRoot.innerHTML = `<div class="${CONFIG.prefix}-loader">⌛ Получение логов...</div>`;

            try {
                // 1. Получаем список изменений
                const logRes = await this.request(CONFIG.api.changelog, {
                    teacherId: Number(tId),
                    property: "_common.isScheduleClosedByTeacher",
                    until: null, lastPreviousRecordId: null
                });

                if (!logRes.success) throw new Error(logRes.error);
                const changelog = JSON.parse(logRes.fetchansver).data?.changelog || [];

                if (changelog.length === 0) {
                    this.refs.tableRoot.innerHTML = `<div class="${CONFIG.prefix}-loader">История пуста</div>`;
                    return;
                }

                // 2. БАТЧИНГ: Собираем уникальные хеши
                const uniqueHashes = [...new Set(changelog.map(i => i.hash))];

                this.refs.tableRoot.innerHTML = `<div class="${CONFIG.prefix}-loader">🧑‍💻 Расшифровка авторов...</div>`;

                const nameRes = await this.request(CONFIG.api.userData, { hashes: uniqueHashes });
                const namesMap = {};

                if (nameRes.success) {
                    const uData = JSON.parse(nameRes.fetchansver);
                    // Создаем карту: hash -> Имя Фамилия
                    uniqueHashes.forEach((hash, index) => {
                        const user = uData.data[index]?.data;
                        namesMap[hash] = user ? `${user.firstName} ${user.lastName}` : 'System / Auto';
                    });
                }

                // 3. Финальный рендер таблицы
                this.render(changelog, namesMap);

            } catch (err) {
                this.refs.tableRoot.innerHTML = `<div class="${CONFIG.prefix}-error">Ошибка: ${err.message}</div>`;
            }
        }

        render(list, namesMap) {
            let html = `
                <table class="${CONFIG.prefix}-table">
                    <thead>
                        <tr>
                            <th style="text-align:center">Значение</th>
                            <th style="text-align:center">Событие</th>
                            <th style="text-align:center">Дата (МСК)</th>
                            <th style="text-align:center">Автор</th>
                        </tr>
                    </thead>
                    <tbody>`;

            list.forEach(item => {
                const date = new Date(new Date(item.createdAt).getTime() + 10800000);
                const fDate = date.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

                const statusClass = item.valueAfter ? 'status-no' : 'status-yes';
                const statusText = item.valueAfter ? 'ЗАКРЫТ' : 'ОТКРЫТ';
                const userName = namesMap[item.hash] || 'Unknown';

                html += `
                    <tr>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td style="color:#cbd5e1; font-size:11px;">${item.context || '—'}</td>
                        <td class="date-cell">${fDate}</td>
                        <td class="user-name">${userName}</td>
                    </tr>`;
            });

            html += '</tbody></table>';
            this.refs.tableRoot.innerHTML = html;
        }
    }

    new NaborStatusWidget();
})();
