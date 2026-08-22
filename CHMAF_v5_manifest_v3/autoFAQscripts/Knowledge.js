/**
 * Knowledge Center — Premium Obsidian Edition
 * Акцент: violet #a78bfa → deep #7c3aed
 * Unique prefix: .knw-
 */

(function () {
    // Состояние модуля
    const state = {
        data: [],
        index: new Map(),
        currentSection: null
    };

    // Стили
    const injectStyles = () => {
        if (document.getElementById('knw-styles')) return;
        const style = document.createElement('style');
        style.id = 'knw-styles';
        style.innerHTML = `
            .knw-panel {
                background: linear-gradient(165deg, rgba(28, 27, 40, 0.94) 0%, rgba(13, 12, 20, 0.97) 100%) !important;
                backdrop-filter: blur(24px) saturate(140%);
                -webkit-backdrop-filter: blur(24px) saturate(140%);
                border: 1px solid rgba(255, 255, 255, 0.09);
                border-top-color: rgba(255, 255, 255, 0.16);
                border-radius: 18px;
                color: #e8ecf4;
                font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
                padding: 16px !important;
                overflow: visible !important;
            }
            .knw-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
                cursor: grab;
            }
            .knw-titleblock { display: flex; gap: 10px; align-items: center; }
            .knw-icon-chip {
                width: 34px; height: 34px;
                border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                font-size: 17px;
                background: linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(124, 58, 237, 0.12));
                border: 1px solid rgba(167, 139, 250, 0.35);
                box-shadow: 0 4px 14px rgba(167, 139, 250, 0.2), inset 0 1px 0 rgba(255,255,255,0.15);
            }
            .knw-title { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.3px; }
            .knw-subtitle {
                font-size: 9px; text-transform: uppercase;
                letter-spacing: 1.4px; color: rgba(255, 255, 255, 0.45);
            }

            .knw-btn {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #dfe6f1;
                padding: 8px 13px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 12px;
                line-height: 1;
            }
            .knw-btn:hover {
                background: rgba(255, 255, 255, 0.13);
                border-color: rgba(167, 139, 250, 0.4);
                transform: translateY(-1px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
            }
            .knw-btn:active { transform: translateY(0) scale(0.97); }

            /* Индикатор состояния */
            .knw-loader {
                width: 26px; height: 26px;
                display: flex; align-items: center; justify-content: center;
                border-radius: 50%;
                background: rgba(167, 139, 250, 0.08);
                border: 1px solid rgba(167, 139, 250, 0.25);
                font-size: 12px;
                transition: all 0.25s ease;
            }
            .knw-loader.loading {
                animation: knw-spin 1.2s linear infinite;
                border-color: rgba(167, 139, 250, 0.5);
                box-shadow: 0 0 14px rgba(167, 139, 250, 0.3);
            }
            @keyframes knw-spin { 100% { transform: rotate(360deg); } }

            .knw-input {
                width: 100%;
                background: rgba(0, 0, 0, 0.35);
                border: 1px solid rgba(255, 255, 255, 0.09);
                border-radius: 12px;
                color: #fff;
                padding: 11px 14px;
                text-align: center;
                outline: none;
                margin-bottom: 12px;
                font-size: 13px;
                font-family: inherit;
                transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                box-sizing: border-box;
            }
            .knw-input::placeholder { color: rgba(255, 255, 255, 0.35); }
            .knw-input:focus {
                border-color: rgba(167, 139, 250, 0.6);
                background: rgba(0, 0, 0, 0.5);
                box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.12), 0 0 18px rgba(167, 139, 250, 0.08);
            }

            .knw-select-group { display: flex; gap: 10px; margin-bottom: 14px; }
            .knw-select {
                flex: 1;
                background: rgba(0, 0, 0, 0.35);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.09);
                border-radius: 10px;
                padding: 9px 8px;
                outline: none;
                text-align: center;
                font-size: 12px;
                font-family: inherit;
                color-scheme: dark;
                transition: all 0.22s ease;
            }
            .knw-select:focus {
                border-color: rgba(167, 139, 250, 0.6);
                box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.12);
            }
            .knw-select option { background: #14121d; color: #e8ecf4; }

            .knw-scroll-area {
                max-height: 400px;
                overflow-y: auto;
                padding-right: 6px;
            }
            .knw-scroll-area::-webkit-scrollbar { width: 5px; }
            .knw-scroll-area::-webkit-scrollbar-track { background: transparent; }
            .knw-scroll-area::-webkit-scrollbar-thumb {
                background: rgba(167, 139, 250, 0.25);
                border-radius: 10px;
            }
            .knw-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.45); }

            .knw-item {
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-left: 2px solid transparent;
                padding: 11px 13px;
                margin-bottom: 7px;
                border-radius: 11px;
                cursor: pointer;
                transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                font-size: 13px;
                line-height: 1.45;
                animation: knw-fadeIn 0.3s ease backwards;
            }
            .knw-item:nth-child(-n+8) { animation-delay: calc(var(--i, 0) * 0ms); }
            .knw-item:hover {
                background: rgba(255, 255, 255, 0.08);
                border-color: rgba(167, 139, 250, 0.3);
                border-left-color: rgba(167, 139, 250, 0.8);
                transform: translateX(4px);
            }
            .knw-item.active {
                background: linear-gradient(135deg, rgba(167, 139, 250, 0.85), rgba(124, 58, 237, 0.75));
                border-color: rgba(167, 139, 250, 0.9);
                color: #fff;
                font-weight: 600;
                box-shadow: 0 6px 20px rgba(124, 58, 237, 0.35);
            }

            .knw-empty {
                text-align: center;
                padding: 26px 16px;
                opacity: 0.45;
                font-size: 12px;
                letter-spacing: 0.3px;
            }

            .knw-solution {
                position: absolute;
                top: 0; left: 565px;
                width: 500px;
                background: linear-gradient(165deg, rgba(28, 27, 40, 0.96) 0%, rgba(13, 12, 20, 0.98) 100%) !important;
                backdrop-filter: blur(24px) saturate(140%);
                -webkit-backdrop-filter: blur(24px) saturate(140%);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-top: 2px solid rgba(167, 139, 250, 0.55);
                border-radius: 18px;
                padding: 20px;
                color: #eef0f7;
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 40px rgba(124, 58, 237, 0.07);
                display: none;
                max-height: 600px;
                overflow-y: auto;
                z-index: 100;
                animation: knw-solutionIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .knw-solution h3 {
                font-size: 15px;
                font-weight: 700;
                letter-spacing: 0.2px;
            }
            .knw-solution::-webkit-scrollbar { width: 5px; }
            .knw-solution::-webkit-scrollbar-track { background: transparent; }
            .knw-solution::-webkit-scrollbar-thumb {
                background: rgba(167, 139, 250, 0.25);
                border-radius: 10px;
            }

            @keyframes knw-fadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }
            @keyframes knw-solutionIn {
                from { opacity: 0; transform: translateX(14px); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
    };

    const win_Knowledge = `
        <div class="knw-panel" style="width: 550px;">
            <div class="knw-header chmaf-drag-handle" id="knw_drag_handle">
                <div class="knw-titleblock">
                    <div class="knw-icon-chip">📚</div>
                    <div>
                        <div class="knw-title">База Знаний</div>
                        <div class="knw-subtitle">Knowledge Center</div>
                    </div>
                    <div id="knw-loader" class="knw-loader">🟢</div>
                </div>
                <button id="hideMeKnowledge" class="knw-btn">✕</button>
            </div>

            <div class="knw-body">
                <input class="knw-input" placeholder="🔍 Быстрый поиск решения..." id="knw-search">

                <div class="knw-select-group">
                    <select class="knw-select" id="knw-type">
                        <option value="default">--- Тип урока ---</option>
                    </select>
                    <select class="knw-select" id="knw-cat">
                        <option value="default">--- Категория ---</option>
                    </select>
                </div>

                <div id="knw-list" class="knw-scroll-area">
                    <div class="knw-empty">Загрузка данных...</div>
                </div>
            </div>

            <div id="knw-solution" class="knw-solution"></div>
        </div>
    `;

    // Инициализация окна
    createWindow('AF_Knowledge', 'winTopKnwoledge', 'winLeftKnwoledge', win_Knowledge);
    injectStyles();

    // DOM Кэш
    const dom = {
        win: document.getElementById('AF_Knowledge'),
        search: document.getElementById('knw-search'),
        type: document.getElementById('knw-type'),
        cat: document.getElementById('knw-cat'),
        list: document.getElementById('knw-list'),
        solution: document.getElementById('knw-solution'),
        loader: document.getElementById('knw-loader'),
        toggleBtn: null
    };

    const setLoader = (isLoading) => {
        dom.loader.innerHTML = isLoading ? '⏳' : '🟢';
        dom.loader.classList.toggle('loading', isLoading);
    };

    const renderItems = (items) => {
        dom.list.innerHTML = '';
        dom.solution.style.display = 'none';

        if (items.length === 0) {
            dom.list.innerHTML = '<div class="knw-empty">Ничего не найдено</div>';
            return;
        }

        items.forEach((item, i) => {
            const el = document.createElement('div');
            el.className = 'knw-item';
            el.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
            el.textContent = item[2];
            el.onclick = () => {
                document.querySelectorAll('.knw-item').forEach(i => i.classList.remove('active'));
                el.classList.add('active');
                dom.solution.innerHTML = `<h3 style="margin-top:0; color:#a78bfa;">${item[2]}</h3><hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">${item[3]}`;
                dom.solution.style.display = 'block';
            };
            dom.list.appendChild(el);
        });
    };

    const loadData = async () => {
        setLoader(true);
        try {
            const url = 'https://script.google.com/macros/s/AKfycbySlhuMPHSKHiI6Rhoyg797id3lbPg_zdeG_iBoEvYxwqlxkD4QizWm8OJDEucma7tGyg/exec';
            const resp = await fetch(url);
            const json = await resp.json();
            state.data = json.result || [];

            // Строим индекс
            state.index.clear();
            state.data.forEach(item => {
                const key = `${item[0]}::${item[1]}`;
                if (!state.index.has(key)) state.index.set(key, []);
                state.index.get(key).push(item);
            });

            // Заполняем типы
            const types = [...new Set(state.data.map(i => i[0]))];
            dom.type.innerHTML = '<option value="default">--- Тип урока ---</option>';
            types.forEach(t => dom.type.add(new Option(t, t)));

            dom.list.innerHTML = '<div class="knw-empty">Выберите категорию или используйте поиск</div>';
        } catch (e) {
            dom.list.innerHTML = '<div style="color:#ff6b6b; text-align:center; padding:20px;">Ошибка загрузки данных</div>';
        }
        setLoader(false);
    };

    // Event Listeners
    dom.type.onchange = () => {
        const val = dom.type.value;
        dom.cat.innerHTML = '<option value="default">--- Категория ---</option>';
        dom.search.value = '';
        if (val === 'default') return;

        const cats = [...new Set(state.data.filter(i => i[0] === val).map(i => i[1]))];
        cats.forEach(c => dom.cat.add(new Option(c, c)));
    };

    dom.cat.onchange = () => {
        const key = `${dom.type.value}::${dom.cat.value}`;
        renderItems(state.index.get(key) || []);
    };

    dom.search.oninput = () => {
        const q = dom.search.value.toLowerCase().trim();
        dom.type.selectedIndex = 0;
        dom.cat.innerHTML = '<option value="default">--- Категория ---</option>';

        if (q.length < 2) {
            dom.list.innerHTML = '';
            return;
        }

        const filtered = state.data.filter(i => i[2].toLowerCase().includes(q));
        renderItems(filtered);
    };

    // Глобальная функция для кнопки открытия (совместимость с основным кодом)
    window.getknowledgeCenterButtonPress = () => {
        if (!dom.toggleBtn) dom.toggleBtn = document.getElementById('knowledgeCenter');

        if (dom.win.style.display === 'none') {
            dom.win.style.display = '';
            dom.toggleBtn?.classList.add('active');
            if (state.data.length === 0) loadData();
        } else {
            dom.win.style.display = 'none';
            dom.toggleBtn?.classList.remove('active');
        }
    };

    document.getElementById('hideMeKnowledge').onclick = () => {
        dom.win.style.display = 'none';
        document.getElementById('knowledgeCenter')?.classList.remove('active');
    };

})();
