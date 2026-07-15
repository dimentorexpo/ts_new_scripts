var win_CRMcommentsUI = `
<div class="gcrm-container">
    <div class="gcrm-header chmaf-drag-handle" id="gcrm_header">
        <span class="gcrm-title">CRM Comments</span>
        <button class="gcrm-close" id="hideshowcrmcomments" title="Скрыть">&#10005;</button>
    </div>

    <div class="gcrm-body">
        <div class="gcrm-input-row">
            <input id="gcrm-user-id" class="gcrm-input" placeholder="ID пользователя..." autocomplete="off" type="text">
            <button class="gcrm-launch-btn" id="gcrm-run-btn" title="Запустить">
                <span class="gcrm-rocket">🚀</span>
                <span class="gcrm-btn-text">Выполнить</span>
            </button>
        </div>

        <div class="gcrm-output-box">
            <div class="gcrm-output-header">Результат</div>
            <div id="gcrm-result" class="gcrm-output-content">Ожидание запуска...</div>
        </div>
    </div>
</div>

<style>
/* === Glassmorphism Crystal Dark === */
.gcrm-container {
    width: 800px;
    min-height: 300px;
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        inset 0 1px 1px rgba(255, 255, 255, 0.06),
        0 0 0 1px rgba(255, 255, 255, 0.02);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #e2e8f0;
    display: flex;
    flex-direction: column;
}

.gcrm-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    cursor: move;
    user-select: none;
}

.gcrm-title {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.3px;
    color: #f8fafc;
    text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.gcrm-close {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: #94a3b8;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    -webkit-appearance: none;
    appearance: none;
    padding: 0;
    margin: 0;
}

.gcrm-close:hover {
    background: rgba(239, 68, 68, 0.15);
    color: #fecaca;
    border-color: rgba(239, 68, 68, 0.3);
    transform: rotate(90deg);
}

.gcrm-body {
    padding: 16px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.gcrm-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.gcrm-input {
    flex: 1;
    height: 36px;
    padding: 0 12px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: #f1f5f9;
    font-size: 13px;
    font-family: inherit;
    transition: all 0.2s ease;
    box-shadow: inset 0 1px 3px rgba(0,0,0,0.2);
    outline: none;
    box-sizing: border-box;
    -webkit-appearance: none;
    appearance: none;
    display: block;
    min-width: 0;
}

.gcrm-input::placeholder {
    color: #64748b;
}

.gcrm-input:focus {
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(0, 0, 0, 0.35);
    box-shadow:
        0 0 0 3px rgba(99, 102, 241, 0.1),
        inset 0 1px 3px rgba(0,0,0,0.2);
}

.gcrm-launch-btn {
    height: 36px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid rgba(99, 102, 241, 0.25);
    background:
        linear-gradient(145deg, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0.1) 100%),
        rgba(18, 18, 28, 0.6);
    color: #c7d2fe;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
    -webkit-appearance: none;
    appearance: none;
    font-family: inherit;
    box-sizing: border-box;
    white-space: nowrap;
    flex-shrink: 0;
}

.gcrm-launch-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%);
    pointer-events: none;
}

.gcrm-launch-btn:hover {
    background:
        linear-gradient(145deg, rgba(99, 102, 241, 0.25) 0%, rgba(79, 70, 229, 0.15) 100%),
        rgba(18, 18, 28, 0.7);
    border-color: rgba(99, 102, 241, 0.4);
    color: #e0e7ff;
    transform: translateY(-1px);
    box-shadow:
        0 8px 24px -8px rgba(99, 102, 241, 0.3),
        0 0 0 1px rgba(99, 102, 241, 0.1);
}

.gcrm-launch-btn:active {
    transform: translateY(0) scale(0.97);
    box-shadow:
        0 4px 12px -4px rgba(99, 102, 241, 0.2),
        inset 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: all 0.1s ease;
}

.gcrm-launch-btn:active .gcrm-rocket {
    transform: translateX(3px) translateY(-1px) scale(0.9);
}

.gcrm-rocket {
    font-size: 14px;
    display: inline-block;
    transition: transform 0.3s ease;
    pointer-events: none;
}

.gcrm-btn-text {
    pointer-events: none;
}

.gcrm-launch-btn:hover .gcrm-rocket {
    transform: translateX(2px) translateY(-1px);
}

.gcrm-output-box {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 120px;
}

.gcrm-output-header {
    padding: 10px 14px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #64748b;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.gcrm-output-content {
    padding: 14px;
    font-size: 13px;
    line-height: 1.6;
    color: #cbd5e1;
    flex: 1;
    overflow-y: auto;
    max-height: 400px;
    word-break: break-word;
}

.gcrm-table-wrap {
    overflow-x: auto;
    max-height: 350px;
    overflow-y: auto;
}

.gcrm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

.gcrm-table thead {
    position: sticky;
    top: 0;
    z-index: 1;
}

.gcrm-table th {
    background: rgba(99, 102, 241, 0.15);
    color: #c7d2fe;
    font-weight: 600;
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(99, 102, 241, 0.2);
    white-space: nowrap;
}

.gcrm-table td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: #cbd5e1;
    vertical-align: top;
}

.gcrm-table tr:hover td {
    background: rgba(255, 255, 255, 0.03);
}

.gcrm-td-time {
    white-space: nowrap;
    color: #818cf8;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 11px;
}

.gcrm-td-name {
    white-space: nowrap;
    color: #a5b4fc;
}

.gcrm-td-title {
    color: #e2e8f0;
    font-weight: 500;
}

.gcrm-td-msg {
    color: #94a3b8;
    max-width: 200px;
    word-break: break-word;
}

.gcrm-count {
    margin-top: 10px;
    text-align: right;
    font-size: 11px;
    color: #64748b;
    font-weight: 500;
}
</style>`;

const winCRMcommentsUI = createWindow('AF_CRMComments', 'winTopTCRMComments', 'winLeftCRMComments', win_CRMcommentsUI);
hideWindowOnClick('AF_CRMComments', 'hideshowcrmcomments');

function getbutCRMCommentsButtonPress() {
    const win = document.getElementById('AF_CRMComments');
    if (!win) return;
    if (win.style.display === 'none' || win.style.display === '') {
        win.style.display = 'block';
    } else {
        win.style.display = 'none';
    }
}

const sendMessageCRM = (message) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            if (response && response.success) resolve(response);
            else reject(new Error(response?.error || 'Unknown error from extension'));
        });
    });
};

document.getElementById('gcrm-run-btn').addEventListener('click', async () => {
    const userId = document.getElementById('gcrm-user-id').value.trim();
    const output = document.getElementById('gcrm-result');

    if (!userId) {
        output.innerHTML = '<span style="color:#f87171;">⚠ Введите ID пользователя</span>';
        return;
    }

    output.innerHTML = '<span style="color:#94a3b8;">⏳ Загрузка данных...</span>';

    try {
        const response = await sendMessageCRM({
            action: 'getFetchRequest',
            fetchURL: `https://backend.skyeng.ru/api/records/${userId}/?page=0&pageSize=50`,
            requestOptions: {
                method: 'GET',
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'ru',
                    'priority': 'u=1, i',
                    'sec-ch-ua': '"Chromium";v="146", "Not-A.Brand";v="24", "YaBrowser";v="26.4", "Yowser";v="2.5", "YaBrowserCorp";v="146"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'sec-gpc': '1'
                },
                referrer: 'https://crm2.skyeng.ru/',
                credentials: 'include'
            }
        });

        const data = JSON.parse(response.fetchansver);
        const records = Array.isArray(data) ? data : (data.data || []);

        const filtered = records.filter(item => item.recordTypeCode === 'customer_support.common.task_complete');

        if (filtered.length === 0) {
            output.innerHTML = '<span style="color:#94a3b8;">Нет записей с типом "Задача сопровождения завершена"</span>';
            return;
        }

        filtered.sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

        const rows = filtered.map(item => {
            const name = `${item.initiatorName || ''} ${item.initiatorSurname || ''}`.trim() || '—';
            const mskTime = new Date(item.occurredAt).toLocaleString('ru-RU', {
                timeZone: 'Europe/Moscow',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).replace(',', '');

            const message = item.payload?.message || '—';

            return `
                <tr>
                    <td class="gcrm-td-time">${mskTime}</td>
                    <td class="gcrm-td-name">${escapeHtml(name)}</td>
                    <td class="gcrm-td-msg">${escapeHtml(message)}</td>
                </tr>
            `;
        }).join('');

        output.innerHTML = `
            <div class="gcrm-table-wrap">
                <table class="gcrm-table">
                    <thead>
                        <tr>
                            <th>Время (МСК)</th>
                            <th>Оператор</th>
                            <th>Сообщение</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="gcrm-count">Найдено: ${filtered.length}</div>
        `;

    } catch (error) {
        console.error('CRM Comments error:', error);
        output.innerHTML = `<span style="color:#f87171;">❌ Ошибка: ${escapeHtml(error.message)}</span>`;
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}