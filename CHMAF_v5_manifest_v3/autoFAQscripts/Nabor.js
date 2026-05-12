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
            width: 650px;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            background: #2c2c34;
            border: 2px solid #464451;
            border-radius: 12px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.8);
            color: bisque;
            overflow: hidden;
        }

        .${CONFIG.prefix}-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 18px;
            background: #383842;
            cursor: move;
            border-bottom: 1px solid #464451;
        }

        .${CONFIG.prefix}-title { font-size: 14px; font-weight: bold; color: #fff; pointer-events: none; }

        .af-btn {
            padding: 5px 14px;
            border-radius: 6px;
            font-size: 12px;
            cursor: pointer;
            background: #464451;
            color: #fff;
            border: 1px solid #555;
            transition: 0.2s;
        }

        .af-btn:hover { background: #6366f1; border-color: #6366f1; }

        .${CONFIG.prefix}-input-row {
            display: flex;
            justify-content: center;
            gap: 12px;
            padding: 18px;
        }

        .${CONFIG.prefix}-input {
            width: 130px;
            padding: 7px;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 6px;
            color: #000;
            text-align: center;
            font-weight: bold;
        }

        .${CONFIG.prefix}-content {
            padding: 0 18px 20px;
            max-height: 450px;
            overflow-y: auto;
        }

        .${CONFIG.prefix}-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 6px;
            font-size: 13px;
        }

        .${CONFIG.prefix}-table th {
            position: sticky;
            top: 0;
            background: #383842;
            padding: 12px 10px;
            color: #94a3b8;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            z-index: 10;
        }

        .${CONFIG.prefix}-table tr td {
            background: rgba(255, 255, 255, 0.04);
            padding: 12px 10px;
            text-align: center;
            border-top: 1px solid rgba(255,255,255,0.05);
            border-bottom: 1px solid rgba(255,255,255,0.05);
            transition: 0.2s;
        }

        .${CONFIG.prefix}-table tr:hover td {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(99, 102, 241, 0.3);
        }

        .status-badge {
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 800;
            font-size: 11px;
            display: inline-block;
        }
        .status-yes { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); }
        .status-no { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.3); }

        .user-name { font-weight: 600; color: #fff; }
        .date-cell { color: #a5b4fc; font-family: monospace; }
    `;

    const TEMPLATE = `
        <div class="${CONFIG.prefix}-header chmaf-drag-handle" id="${CONFIG.prefix}-drag">
            <span class="${CONFIG.prefix}-title">📋 Просмотр статуса набора</span>
            <div style="display: flex; gap: 8px;">
                <button class="af-btn" id="${CONFIG.prefix}-trm">🧑‍🏫 TRM</button>
                <button class="af-btn buttonHide" id="${CONFIG.prefix}-hide">✕</button>
            </div>
        </div>
        <div class="${CONFIG.prefix}-input-row">
            <input class="${CONFIG.prefix}-input" id="${CONFIG.prefix}-input" type="text" placeholder="Teacher ID">
            <button class="af-btn" style="background: #6366f1;" id="${CONFIG.prefix}-search">🔍 Найти</button>
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

            this.refs.tableRoot.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">⌛ Получение логов...</div>';

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
                    this.refs.tableRoot.innerHTML = '<div style="text-align:center; padding:30px;">История пуста</div>';
                    return;
                }

                // 2. БАТЧИНГ: Собираем уникальные хеши
                const uniqueHashes = [...new Set(changelog.map(i => i.hash))];

                this.refs.tableRoot.innerHTML = '<div style="text-align:center; padding:30px; color:#94a3b8;">🧑‍💻 Расшифровка авторов...</div>';

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
                this.refs.tableRoot.innerHTML = `<div style="text-align:center; padding:30px; color:#f87171;">Ошибка: ${err.message}</div>`;
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