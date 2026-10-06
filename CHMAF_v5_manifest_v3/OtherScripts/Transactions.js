(() => {
    // 1. Очистка предыдущих элементов и снятие подсветки
    const existingFab = document.getElementById('ps-fab-btn');
    const existingPanel = document.getElementById('ps-checker-panel');
    const existingStyle = document.getElementById('ps-custom-styles');

    if (existingFab) existingFab.remove();
    if (existingPanel) existingPanel.remove();
    if (existingStyle) existingStyle.remove();

    function clearHighlighting() {
        // Удаляем созданные бейджи
        document.querySelectorAll('.ps-overpay-badge').forEach(badge => badge.remove());

        // Снимаем классы с ячеек
        document.querySelectorAll(
            '.ps-status-completed, .ps-status-failed, .ps-status-processing, .ps-recurrent-highlight, .ps-overpay-failed'
        ).forEach(el => {
            el.classList.remove(
                'ps-status-completed',
                'ps-status-failed',
                'ps-status-processing',
                'ps-recurrent-highlight',
                'ps-overpay-failed'
            );
            el.title = '';
        });

        // Снимаем подсветку со строк
        document.querySelectorAll(
            '.ps-highlighted-row-completed, .ps-highlighted-row-failed, .ps-highlighted-row-processing'
        ).forEach(row => {
            row.classList.remove(
                'ps-highlighted-row-completed',
                'ps-highlighted-row-failed',
                'ps-highlighted-row-processing'
            );
        });
    }

    clearHighlighting();

    // 2. Список платежных систем с поддержкой автоплатежей
    const paymentSystems = [
        "bank131.agt",
        "gazprombank.skyeng.ano", "gazprombank.skypro.ano", "gazprombank.skysmart.ano",
        "payanyway.skyeng.ano", "payanyway.skypro.ano", "payanyway.skysmart.ano",
        "rsb.bank_card.skyeng.ano", "rsb.bank_card.skypro.ano", "rsb.bank_card.skysmart.ano",
        "sber-direct.skyeng.ano", "sber-direct.skyeng.courses.ano", "sber-direct.skypro.ano",
        "sber-direct.skysmart.ano", "sber-direct.skysmart.homeschool.ano",
        "sber.skyeng.ano", "sber.skyeng.courses.ano", "sber.skysmart.ano", "sber.skysmart.homeschool.ano",
        "stripe.ltitc", 
        "tinkoff.ano", "tinkoff.english", "tinkoff.premium.ano", "tinkoff.salebot.ano",
        "tinkoff.skyeng", "tinkoff.skypro.ano", "tinkoff.skysmart-premium.ano", "tinkoff.skysmart.ano"
    ];

    // 3. Стили интерфейса и подсветки таблицы
    const style = document.createElement('style');
    style.id = 'ps-custom-styles';
    style.textContent = `
        #ps-fab-btn {
            position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px;
            border-radius: 50%; background: #303b4d; color: #fff; border: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25); cursor: pointer; z-index: 999998;
            font-size: 26px; display: flex; align-items: center; justify-content: center;
            transition: transform 0.2s, background 0.2s;
        }
        #ps-fab-btn:hover { transform: scale(1.1); background: #2563eb; }

        #ps-checker-panel {
            position: fixed; bottom: 90px; right: 24px; width: 390px; max-height: 75vh;
            background: #ffffff; border: 1px solid #d1d5db; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 13px; display: flex; flex-direction: column; border-radius: 12px; overflow: hidden;
            animation: ps-slide-up 0.3s ease-out;
        }
        @keyframes ps-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        #ps-checker-header {
            background: #1f2937; color: #fff; padding: 12px 16px; display: flex;
            justify-content: space-between; align-items: center;
        }
        #ps-checker-header span { font-weight: 600; font-size: 14px; }
        #ps-checker-close { cursor: pointer; font-size: 18px; line-height: 1; opacity: 0.7; }
        #ps-checker-close:hover { opacity: 1; }

        #ps-checker-body { padding: 16px; overflow-y: auto; flex: 1; background: #f9fafb; }

        .verdict-box {
            padding: 12px; border-radius: 8px; font-weight: 700; text-align: center;
            margin-bottom: 12px; font-size: 14px; line-height: 1.4;
        }
        .verdict-yes { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
        .verdict-warning { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
        .verdict-info { background: #e0f2fe; color: #075985; border: 1px solid #7dd3fc; }
        .verdict-no { background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db; }

        .ps-recommendation-box {
            margin-bottom: 12px; padding: 10px; background: #fae8ff; border-radius: 6px;
            border-left: 4px solid #9333ea; color: #581c87; font-size: 12px; line-height: 1.4;
        }

        .ps-btn {
            width: 100%; padding: 10px; border: none; border-radius: 6px; cursor: pointer;
            font-size: 13px; font-weight: 600; margin-top: 8px; transition: background 0.2s;
        }
        .ps-btn-reset { background: #e5e7eb; color: #374151; }
        .ps-btn-reset:hover { background: #d1d5db; }

        .legend-item {
            display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 12px;
        }
        .legend-color {
            width: 16px; height: 16px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); flex-shrink: 0;
        }

        /* Табличные стили */
        .ps-highlighted-row-completed { background-color: #f0fdf4 !important; }
        .ps-highlighted-row-failed { background-color: #fef2f2 !important; }
        .ps-highlighted-row-processing { background-color: #fffbeb !important; }

        .ps-status-completed {
            background-color: #d1fae5 !important; color: #065f46 !important;
            font-weight: bold !important; border: 1px solid #10b981 !important;
        }
        .ps-status-failed {
            background-color: #fee2e2 !important; color: #991b1b !important;
            font-weight: bold !important; border: 2px solid #ef4444 !important;
        }
        .ps-status-processing {
            background-color: #fef3c7 !important; color: #92400e !important;
            font-weight: bold !important; border: 2px solid #f59e0b !important;
        }

        .ps-recurrent-highlight {
            background-color: #fef08a !important; color: #854d0e !important;
            font-weight: 900 !important; border: 2px dashed #eab308 !important;
        }
        .ps-recurrent-highlight::before {
            content: "🔄 "; font-size: 1.2em; vertical-align: middle;
        }

        /* Стили для overpay + failed */
        .ps-overpay-failed {
            background-color: #f3e8ff !important; color: #581c87 !important;
            font-weight: 800 !important; border: 2px dashed #9333ea !important;
        }
        .ps-overpay-badge {
            display: block; margin-top: 4px; padding: 3px 6px;
            background: #9333ea; color: #ffffff !important;
            font-size: 11px; font-weight: bold; border-radius: 4px;
            text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
		
		.ps-btn-list { background: #e0f2fe; color: #0369a1; }
        .ps-btn-list:hover { background: #bae6fd; }

        #ps-systems-list-container {
            margin-top: 10px;
            padding: 10px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            max-height: 180px;
            overflow-y: auto;
            font-size: 11px;
            line-height: 1.6;
        }
        .ps-system-item {
            padding: 3px 6px;
            margin-bottom: 4px;
            background: #f3f4f6;
            border-radius: 4px;
            font-family: monospace;
            word-break: break-all;
            color: #1f2937;
        }
    `;
    document.head.appendChild(style);

    // 4. Кнопка запуска (FAB)
    const fabBtn = document.createElement('button');
    fabBtn.id = 'ps-fab-btn';
    fabBtn.title = 'Проверить платежи и автоплатежи';
    fabBtn.innerHTML = '🔍';
    document.body.appendChild(fabBtn);

    // 5. Боковая панель
    const panel = document.createElement('div');
    panel.id = 'ps-checker-panel';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div id="ps-checker-header">
            <span>💳 Анализ платежей</span>
            <span id="ps-checker-close">✕</span>
        </div>
<div id="ps-checker-body">
            <div id="ps-verdict" class="verdict-box verdict-no">Нажмите для сканирования</div>
            <div id="ps-recommendation"></div>
            <div id="ps-legend" style="margin-bottom: 12px; padding: 10px; background: #fff; border-radius: 6px; border: 1px solid #e5e7eb;"></div>
            <div id="ps-details" style="font-size: 13px; color: #4b5563; line-height: 1.5;"></div>
            <button class="ps-btn ps-btn-reset" id="ps-reset-btn">Сбросить подсветку</button>
            <button class="ps-btn ps-btn-list" id="ps-toggle-systems-btn">📋 Список систем с автоплатежами</button>
            <div id="ps-systems-list-container" style="display: none;"></div>
        </div>
		
		
    `;
    document.body.appendChild(panel);

    // 6. Основной алгоритм проверки
    function scanAndHighlight() {
        clearHighlighting();

        const tables = document.querySelectorAll('table tbody');
        let recurrentCount = 0;
        let completedCount = 0;
        let failedCount = 0;
        let processingCount = 0;
        let overpayFailedCount = 0;

        tables.forEach(tbody => {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                if (cells.length < 5) return;

                const statusCell = cells[1];
                const psCell = cells[4];

                const statusText = statusCell.textContent.toLowerCase().trim();
                const psText = psCell.textContent.trim();
                const isOverpay = psText.toLowerCase().includes('overpay');

                // 1. FAILED
                if (statusText.includes('failed')) {
                    failedCount++;
                    statusCell.classList.add('ps-status-failed');
                    statusCell.title = '❌ Платеж не прошел';
                    row.classList.add('ps-highlighted-row-failed');

                    // Проверка на overpay при ошибке
                    if (isOverpay) {
                        overpayFailedCount++;
                        psCell.classList.add('ps-overpay-failed');
                        psCell.title = '💡 Ошибка Overpay: рекомендуется использовать платежную систему "Белорусский банк"';

                        if (!psCell.querySelector('.ps-overpay-badge')) {
                            const badge = document.createElement('div');
                            badge.className = 'ps-overpay-badge';
                            badge.innerHTML = '🇧🇾 Предложить "Белорусский банк"';
                            psCell.appendChild(badge);
                        }
                    }
                }
                // 2. PROCESSING
                else if (statusText.includes('processing')) {
                    processingCount++;
                    statusCell.classList.add('ps-status-processing');
                    statusCell.title = '⏳ Платеж в обработке';
                    row.classList.add('ps-highlighted-row-processing');
                }
                // 3. COMPLETED
                else if (statusText.includes('completed')) {
                    completedCount++;
                    statusCell.classList.add('ps-status-completed');
                    statusCell.title = '✅ Платеж успешно завершен';
                    row.classList.add('ps-highlighted-row-completed');

                    // Проверка на рекуррент (без ложных срабатываний)
                    const isRecurrent = psText.length > 3 && paymentSystems.some(ps => 
                        psText.toLowerCase().includes(ps.toLowerCase())
                    );

                    if (isRecurrent) {
                        recurrentCount++;
                        psCell.classList.add('ps-recurrent-highlight');
                        psCell.title = '🔔 ВНИМАНИЕ: Эта платежная система поддерживает автоплатежи (рекуррент)!';
                    }
                }
            });
        });

        // Обновляем легенду
        const legendBox = document.getElementById('ps-legend');
        legendBox.innerHTML = `
            <div class="legend-item">
                <div class="legend-color" style="background: #fef08a; border: 2px dashed #eab308;"></div>
                <span>🔄 Completed + возможен автоплатеж</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #f3e8ff; border: 2px dashed #9333ea;"></div>
                <span>🇧🇾 Failed Overpay ➔ Белорусский банк</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #d1fae5; border-color: #10b981;"></div>
                <span>✅ Просто Completed (успешно)</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #fee2e2; border-color: #ef4444;"></div>
                <span>❌ Failed</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #fef3c7; border-color: #f59e0b;"></div>
                <span>⏳ Processing</span>
            </div>
        `;

        // Блок рекомендаций
        const recommendationBox = document.getElementById('ps-recommendation');
        if (overpayFailedCount > 0) {
            recommendationBox.innerHTML = `
                <div class="ps-recommendation-box">
                    <b>💡 Рекомендация по оплате:</b><br>
                    Обнаружено платежей с ошибкой <b>overpay: ${overpayFailedCount}</b>.<br>
                    Предложите клиенту провести оплату через <b>«Белорусский банк»</b>.
                </div>
            `;
        } else {
            recommendationBox.innerHTML = '';
        }

        // Обновляем вердикт и статистику
        const verdictBox = document.getElementById('ps-verdict');
        const detailsBox = document.getElementById('ps-details');

        let summaryHTML = `<b>Статистика по таблице:</b><br>`;
        if (recurrentCount > 0) summaryHTML += `🔄 С возможными автоплатежами: <b>${recurrentCount}</b><br>`;
        if (completedCount > 0) summaryHTML += `✅ Всего Completed: ${completedCount}<br>`;
        if (failedCount > 0) summaryHTML += `❌ Failed: ${failedCount}<br>`;
        if (overpayFailedCount > 0) summaryHTML += `🟣 Из них Overpay: <b>${overpayFailedCount}</b><br>`;
        if (processingCount > 0) summaryHTML += `⏳ Processing: ${processingCount}<br>`;

        if (recurrentCount > 0) {
            verdictBox.className = 'verdict-box verdict-yes';
            verdictBox.innerHTML = `✅ Найдено ${recurrentCount} платежей, где возможны автоплатежи`;
        } else if (failedCount > 0 && completedCount === 0) {
            verdictBox.className = 'verdict-box verdict-warning';
            verdictBox.innerHTML = `⚠️ Все платежи failed (${failedCount})`;
        } else if (completedCount > 0 && recurrentCount === 0) {
            verdictBox.className = 'verdict-box verdict-info';
            verdictBox.innerHTML = `ℹ️ Завершено: ${completedCount}, но для этих ПС автоплатежи не предусмотрены`;
        } else {
            verdictBox.className = 'verdict-box verdict-no';
            verdictBox.innerHTML = `Платежи не найдены`;
        }

        detailsBox.innerHTML = summaryHTML;
    }

    // 7. Сброс подсветки
    function resetHighlight() {
        clearHighlighting();
        document.getElementById('ps-verdict').className = 'verdict-box verdict-no';
        document.getElementById('ps-verdict').innerHTML = 'Подсветка сброшена';
        document.getElementById('ps-recommendation').innerHTML = '';
        document.getElementById('ps-legend').innerHTML = '';
        document.getElementById('ps-details').innerHTML = '';
    }

    // 8. Обработчики событий
    fabBtn.addEventListener('click', () => {
        if (panel.style.display === 'none') {
            panel.style.display = 'flex';
            scanAndHighlight();
        } else {
            panel.style.display = 'none';
        }
    });
	
	const toggleSystemsBtn = document.getElementById('ps-toggle-systems-btn');
    const systemsListContainer = document.getElementById('ps-systems-list-container');

    toggleSystemsBtn.addEventListener('click', () => {
        if (systemsListContainer.style.display === 'none') {
            systemsListContainer.style.display = 'block';
            toggleSystemsBtn.textContent = '▲ Скрыть список систем';
            
            // Заполняем список
            systemsListContainer.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 6px; color: #374151;">
                    Всего систем (${paymentSystems.length}):
                </div>
                ${paymentSystems.map(sys => `<div class="ps-system-item">${sys}</div>`).join('')}
            `;
        } else {
            systemsListContainer.style.display = 'none';
            toggleSystemsBtn.textContent = '📋 Список систем с автоплатежами';
        }
    });

    document.getElementById('ps-checker-close').addEventListener('click', () => {
        panel.style.display = 'none';
    });

    document.getElementById('ps-reset-btn').addEventListener('click', resetHighlight);

    document.addEventListener('click', (e) => {
        if (panel.style.display === 'flex' && !panel.contains(e.target) && e.target !== fabBtn) {
            panel.style.display = 'none';
        }
    });
})();