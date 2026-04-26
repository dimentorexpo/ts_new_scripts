(function () {
    'use strict';

    const CONFIG = {
        prefix: 'af-ns',
        api: {
            changelog: 'https://trm-api.skyeng.ru/api/v1/actionLog/getTeacherChangelog',
            userData: 'https://teachers-conductor.skyeng.ru/api/v1/getIdUsersData'
        },
        minIdLength: 3
    };

    const STYLES = `
        .${CONFIG.prefix}-container {
            all: initial;
            display: none;
            position: fixed;
            top: 15%;
            left: 30%;
            z-index: 999999;
            width: 550px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #2c2c34;
            border: 2px solid #464451;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            color: bisque;
            overflow: hidden;
        }

        .${CONFIG.prefix}-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 15px;
            background: #383842;
            cursor: move;
            border-bottom: 1px solid #464451;
        }

        .${CONFIG.prefix}-title { font-size: 14px; font-weight: bold; color: #fff; pointer-events: none; }

        .${CONFIG.prefix}-controls { display: flex; gap: 10px; }

        .af-btn {
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            background: #464451;
            color: #fff;
            border: 1px solid #555;
        }

        .af-btn:hover { background: #5a5a6a; }
        .af-btn-primary { background: #6366f1; border-color: #4f46e5; }

        .${CONFIG.prefix}-input-row {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 15px;
            background: #2c2c34;
        }

        .${CONFIG.prefix}-input {
            width: 120px;
            padding: 6px;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            color: #000;
            text-align: center;
            font-size: 14px;
        }

        .${CONFIG.prefix}-content {
            padding: 0 10px 15px;
            max-height: 400px;
            overflow-y: auto;
            background: #2c2c34;
        }

        .${CONFIG.prefix}-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            color: bisque;
            background: #464451;
            border: 1px solid #000;
        }

        .${CONFIG.prefix}-table th {
            position: sticky;
            top: 0;
            background: dimgrey;
            padding: 8px;
            border: 1px solid #000;
            font-weight: 500;
        }

        .${CONFIG.prefix}-table td {
            padding: 8px;
            border: 1px solid #000;
            text-align: center;
        }

        .status-icon { font-size: 16px; }
    `;

    const TEMPLATE = `
        <div class="${CONFIG.prefix}-header" id="${CONFIG.prefix}-drag">
            <span class="${CONFIG.prefix}-title">📋 Статус набора</span>
            <div class="${CONFIG.prefix}-controls">
                <button class="af-btn" id="${CONFIG.prefix}-trm">🧑‍🏫 TRM</button>
                <button class="af-btn" id="${CONFIG.prefix}-hide">✕</button>
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

        async fetchAPI(url, body) {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: 'getFetchRequest',
                    fetchURL: url,
                    requestOptions: {
                        method: 'POST',
                        headers: { 'content-type': 'application/json; charset=UTF-8' },
                        body: JSON.stringify(body)
                    }
                }, response => {
                    if (response && response.success) {
                        try {
                            const data = typeof response.fetchansver === 'string'
                                ? JSON.parse(response.fetchansver)
                                : response.fetchansver;
                            resolve(data);
                        } catch (e) { reject('Ошибка парсинга JSON'); }
                    } else {
                        reject(response?.error || 'Ошибка API');
                    }
                });
            });
        }

        init() {
            if (!document.getElementById(`${CONFIG.prefix}-styles`)) {
                const style = document.createElement('style');
                style.id = `${CONFIG.prefix}-styles`;
                style.textContent = STYLES;
                document.head.appendChild(style);
            }

            this.el = document.createElement('div');
            this.el.id = 'AF_NaborStatus';
            this.el.className = `${CONFIG.prefix}-container`;
            this.el.innerHTML = TEMPLATE;
            document.body.appendChild(this.el);

            this.refs = {
                input: document.getElementById(`${CONFIG.prefix}-input`),
                table: document.getElementById(`${CONFIG.prefix}-table-root`),
                dragHandle: document.getElementById(`${CONFIG.prefix}-drag`)
            };

            // Скрытие окна
            this.el.addEventListener('dblclick', (e) => {
                if (e.target === this.refs.dragHandle || e.target.classList.contains(`${CONFIG.prefix}-title`)) {
                    this.el.style.display = 'none';
                }
            });

            document.getElementById(`${CONFIG.prefix}-hide`).onclick = () => this.el.style.display = 'none';
            document.getElementById(`${CONFIG.prefix}-search`).onclick = () => this.loadData();
            document.getElementById(`${CONFIG.prefix}-trm`).onclick = () => {
                const id = this.refs.input.value.trim();
                if (id) window.open(`https://trm.skyeng.ru/teacher/${id}`, '_blank');
            };

            // Интеграция с кнопкой на странице
            document.addEventListener('click', (e) => {
                if (e.target.closest('#butTeacherNabor')) {
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
            let offsetBtnX, offsetBtnY, isDown = false;
            const win = this.el;

            this.refs.dragHandle.addEventListener('mousedown', (e) => {
                if (e.target.tagName === 'BUTTON') return; // Не тянем, если нажали на кнопку
                isDown = true;
                offsetBtnX = win.offsetLeft - e.clientX;
                offsetBtnY = win.offsetTop - e.clientY;
            });

            document.addEventListener('mouseup', () => isDown = false);
            document.addEventListener('mousemove', (e) => {
                if (isDown) {
                    win.style.left = (e.clientX + offsetBtnX) + 'px';
                    win.style.top = (e.clientY + offsetBtnY) + 'px';
                }
            });
        }

        async loadData() {
            const teacherId = this.refs.input.value.trim();
            if (teacherId.length < CONFIG.minIdLength) return;

            this.refs.table.innerHTML = '<div style="text-align:center; padding:20px;">⌛ Загрузка данных...</div>';

            try {
                // 1. Получаем лог изменений
                const logRes = await this.fetchAPI(CONFIG.api.changelog, {
                    teacherId: Number(teacherId),
                    property: '_common.isScheduleClosedByTeacher',
                    until: null,
                    lastPreviousRecordId: null
                });

                const changelog = logRes?.data?.changelog || [];
                if (!changelog.length) {
                    this.refs.table.innerHTML = '<div style="text-align:center; padding:20px;">История изменений пуста</div>';
                    return;
                }

                // 2. Собираем уникальные хеши для имен
                const uniqueHashes = [...new Set(changelog.map(item => item.hash))];

                // 3. Получаем данные пользователей (имена)
                const usersRes = await this.fetchAPI(CONFIG.api.userData, { hashes: uniqueHashes });
                const namesMap = {};

                if (usersRes?.data) {
                    uniqueHashes.forEach((hash, index) => {
                        const u = usersRes.data[index]?.data;
                        namesMap[hash] = u ? `${u.firstName} ${u.lastName}` : 'Система/Неизвестно';
                    });
                }

                // 4. Рендерим таблицу
                let html = `
                    <table class="${CONFIG.prefix}-table">
                        <thead>
                            <tr>
                                <th>Статус</th>
                                <th>Событие</th>
                                <th>Дата (МСК)</th>
                                <th>Кто изменил</th>
                            </tr>
                        </thead>
                        <tbody>`;

                changelog.forEach(item => {
                    const dateObj = new Date(item.createdAt);
                    const mskDate = new Date(dateObj.getTime() + 3 * 3600000);
                    const formattedDate = mskDate.toLocaleString('ru-RU', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    });

                    const statusIcon = item.valueAfter ? '✅' : '❌';
                    const userName = namesMap[item.hash] || '—';

                    html += `
                        <tr>
                            <td class="status-icon">${statusIcon}</td>
                            <td style="font-size:11px;">${item.context || ''}</td>
                            <td style="white-space:nowrap;">${formattedDate}</td>
                            <td>${userName}</td>
                        </tr>`;
                });

                html += '</tbody></table>';
                this.refs.table.innerHTML = html;

            } catch (err) {
                console.error(err);
                this.refs.table.innerHTML = `<div style="text-align:center; padding:20px; color: #f87171;">Ошибка: ${err}</div>`;
            }
        }
    }

    // Запуск
    new NaborStatusWidget();
})();