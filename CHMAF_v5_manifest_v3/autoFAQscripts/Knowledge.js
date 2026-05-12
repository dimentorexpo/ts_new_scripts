/**
 * Knowledge Center — Glassmorphism Refactor
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
                background: rgba(25, 27, 38, 0.7) !important;
                backdrop-filter: blur(15px) saturate(150%);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                border-radius: 20px;
                color: #e0e0e0;
                font-family: 'Segoe UI', system-ui, sans-serif;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                padding: 15px !important;
                overflow: visible !important;
            }
            .knw-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                cursor: grab;
            }
            .knw-btn {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                padding: 6px 15px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 13px;
            }
            .knw-btn:hover { background: rgba(255, 255, 255, 0.2); transform: translateY(-1px); }

            .knw-loader {
                width: 30px; height: 30px;
                display: flex; align-items: center; justify-content: center;
                border-radius: 50%; background: rgba(0,0,0,0.2);
            }
            .knw-loader.loading { animation: knw-spin 1.5s linear infinite; }
            @keyframes knw-spin { 100% { transform: rotate(360deg); } }

            .knw-input {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                color: #fff;
                padding: 10px;
                text-align: center;
                outline: none;
                margin-bottom: 10px;
                transition: border 0.3s;
            }
            .knw-input:focus { border-color: #4facfe; }

            .knw-select-group { display: flex; gap: 10px; margin-bottom: 15px; }
            .knw-select {
                flex: 1;
                background: rgba(20, 20, 20, 0.6);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 10px;
                padding: 5px;
                outline: none;
                text-align:center;
            }

            .knw-scroll-area {
                max-height: 400px;
                overflow-y: auto;
                padding-right: 5px;
            }
            .knw-scroll-area::-webkit-scrollbar { width: 4px; }
            .knw-scroll-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }

            .knw-item {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.05);
                padding: 10px;
                margin-bottom: 6px;
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 13px;
                animation: knw-fadeIn 0.3s ease;
            }
            .knw-item:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255,255,255,0.2); transform: translateX(5px); }
            .knw-item.active { background: #4facfe; color: #fff; font-weight: 600; }

            .knw-solution {
                position: absolute;
                top: 0; left: 565px;
                width: 500px;
                background: rgba(25, 27, 38, 0.9) !important;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 20px;
                color: #f0f0f0;
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                display: none;
                max-height: 600px;
                overflow-y: auto;
                z-index: 100;
            }

            @keyframes knw-fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        `;
        document.head.appendChild(style);
    };

    const win_Knowledge = `
        <div class="knw-panel" style="width: 550px;">
            <div class="knw-header chmaf-drag-handle" id="knw_drag_handle">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-weight: 600; color: #fff;">📚 База Знаний</span>
                    <div id="knw-loader" class="knw-loader">🟢</div>
                </div>
                <button id="hideMeKnowledge" class="knw-btn buttonHide">❌</button>
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
                    <div style="text-align: center; opacity: 0.5; padding: 20px;">Загрузка данных...</div>
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
            dom.list.innerHTML = '<div style="text-align:center; padding: 20px; opacity: 0.5;">Ничего не найдено</div>';
            return;
        }

        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'knw-item';
            el.textContent = item[2];
            el.onclick = () => {
                document.querySelectorAll('.knw-item').forEach(i => i.classList.remove('active'));
                el.classList.add('active');
                dom.solution.innerHTML = `<h3 style="margin-top:0; color:#4facfe;">${item[2]}</h3><hr style="border:0; border-top:1px solid rgba(255,255,255,0.1); margin:15px 0;">${item[3]}`;
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

            dom.list.innerHTML = '<div style="text-align:center; padding: 20px; opacity: 0.5;">Выберите категорию или используйте поиск</div>';
        } catch (e) {
            dom.list.innerHTML = '<div style="color:#ff4f4f; text-align:center;">Ошибка загрузки данных</div>';
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
