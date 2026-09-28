// ═══════════════════════════════════════════════════════════════
//  NEON GLASS ULTRA — TestUsers Module
//  Исходный дизайн + исправленная логика
// ═══════════════════════════════════════════════════════════════

(() => {
    if (window.__testUsersModuleInitialized) return;
    window.__testUsersModuleInitialized = true;

    // Старые сохранённые координаты могли содержать "px".
    // Исправляем их ДО вызова createWindow.
    for (const key of ['winTopTestUsers', 'winLeftTestUsers']) {
        const value = localStorage.getItem(key);

        if (value && /^-?\d+(?:\.\d+)?px$/.test(value.trim())) {
            localStorage.setItem(key, String(parseFloat(value)));
        }
    }

    const styleId = 'neon-glass-testusers-styles';

    if (!document.getElementById(styleId)) {
        const cyberStyles = document.createElement('style');
        cyberStyles.id = styleId;

        cyberStyles.textContent = `
:root {
    --nu-bg: rgba(18, 18, 32, 0.85);
    --nu-border: rgba(255, 255, 255, 0.1);
    --nu-text: #e2e8f0;
    --nu-text2: #94a3b8;
    --nu-cyan: #22d3ee;
    --nu-green: #34d399;
    --nu-red: #f87171;
    --nu-purple: #a78bfa;
    --nu-orange: #fb923c;
}

/* === MAIN GLASS PANEL === */
.glass-panel-testuser {
    width: 176px;
    padding: 10px;
    background:
        linear-gradient(135deg, rgba(22, 22, 38, 0.9) 0%, rgba(14, 14, 28, 0.92) 100%),
        url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23202040' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    box-shadow:
        0 0 0 1px rgba(0,0,0,0.4),
        0 16px 40px rgba(0,0,0,0.5),
        0 0 25px rgba(139, 92, 246, 0.06),
        inset 0 1px 0 rgba(255,255,255,0.06);
    position: relative;
    overflow: hidden;
    animation: nuIn 0.5s cubic-bezier(0.16,1,0.3,1);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.glass-panel-testuser:active {
    box-shadow:
        0 0 0 1px rgba(0,0,0,0.4),
        0 8px 20px rgba(0,0,0,0.6),
        0 0 30px rgba(139, 92, 246, 0.1),
        inset 0 1px 0 rgba(255,255,255,0.06);
}

/* Inner radial glow */
.glass-panel-testuser::after {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
}

@keyframes nuIn {
    from { opacity:0; transform: translateY(10px) scale(0.98); }
    to   { opacity:1; transform: translateY(0) scale(1); }
}

@keyframes nuBorderFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

/* === ROWS === */
.glass-row-testuser {
    display: flex;
    gap: 4px;
    align-items: center;
    position: relative;
    z-index: 1;
}

/* === INPUT === */
.glass-input-testuser {
    flex: 1;
    min-width: 0;
    height: 28px;
    padding: 0 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: var(--nu-text);
    font: 11px/1 'JetBrains Mono', 'Fira Code', monospace;
    outline: none;
    transition: all 0.25s ease;
    position: relative;
    z-index: 1;
}

.glass-input-testuser::placeholder {
    color: #6b7280;
    font-size: 11px;
    opacity: 0.9;
}

.glass-input-testuser:hover {
    border-color: rgba(34, 211, 238, 0.25);
    background: rgba(255,255,255,0.06);
}

.glass-input-testuser:focus {
    border-color: rgba(34, 211, 238, 0.55);
    box-shadow:
        0 0 0 2px rgba(34, 211, 238, 0.07),
        0 0 12px rgba(34, 211, 238, 0.12);
}

/* === BUTTONS === */
.glass-btn-testuser {
    height: 28px;
    padding: 0 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px;
    color: var(--nu-text2);
    font: 10px/1 'Inter', sans-serif;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    user-select: none;
    position: relative;
    overflow: hidden;
    z-index: 1;
}

.glass-btn-testuser::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 45%;
    background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%);
    border-radius: 8px 8px 0 0;
    pointer-events: none;
}

.glass-btn-testuser:hover {
    color: #fff;
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.glass-btn-testuser:active {
    transform: translateY(0) scale(0.97);
}

.glass-btn-testuser:disabled {
    cursor: wait;
}

/* Search button */
#openuserinfo {
    width: 28px;
    flex: 0 0 28px;
    padding: 0;
    font-size: 12px;
}

#openuserinfo:hover {
    color: var(--nu-cyan);
    border-color: rgba(34, 211, 238, 0.4);
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.15), inset 0 0 8px rgba(34, 211, 238, 0.05);
}

/* Icon buttons row */
.glass-row-testuser:nth-of-type(3) .glass-btn-testuser {
    flex: 1;
    font-size: 14px;
    padding: 0;
    height: 30px;
}

#sidcode:hover {
    color: var(--nu-green);
    border-color: rgba(52, 211, 153, 0.4);
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.15), inset 0 0 8px rgba(52, 211, 153, 0.05);
}

#tidcode:hover {
    color: var(--nu-purple);
    border-color: rgba(167, 139, 250, 0.4);
    box-shadow: 0 0 12px rgba(167, 139, 250, 0.15), inset 0 0 8px rgba(167, 139, 250, 0.05);
}

#TestRooms:hover {
    color: var(--nu-orange);
    border-color: rgba(251, 146, 60, 0.4);
    box-shadow: 0 0 12px rgba(251, 146, 60, 0.15), inset 0 0 8px rgba(251, 146, 60, 0.05);
}

#link2lessbtn:hover {
    color: var(--nu-cyan);
    border-color: rgba(34, 211, 238, 0.4);
    box-shadow: 0 0 12px rgba(34, 211, 238, 0.15), inset 0 0 8px rgba(34, 211, 238, 0.05);
}

/* === DIVIDER === */
.glass-divider-horizontal-testuser {
    height: 1.5px;
    margin: 8px 0;
    background: linear-gradient(90deg,
        transparent,
        rgba(255,255,255,0.08) 15%,
        rgba(139, 92, 246, 0.2) 50%,
        rgba(255,255,255,0.08) 85%,
        transparent);
    position: relative;
    z-index: 1;
    opacity: 0.8;
}

/* === STATES === */
.glass-btn-testuser.active {
    animation: nuPulse 1.2s ease-in-out infinite;
}

@keyframes nuPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.12); }
    50%     { box-shadow: 0 0 0 4px rgba(34, 211, 238, 0); }
}

.glass-btn-testuser.successbtn {
    background: rgba(52, 211, 153, 0.1) !important;
    border-color: rgba(52, 211, 153, 0.4) !important;
    color: var(--nu-green) !important;
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.15), inset 0 0 8px rgba(52, 211, 153, 0.05) !important;
}

.glass-btn-testuser.errorbtn {
    background: rgba(248, 113, 113, 0.1) !important;
    border-color: rgba(248, 113, 113, 0.4) !important;
    color: var(--nu-red) !important;
    box-shadow: 0 0 12px rgba(248, 113, 113, 0.15), inset 0 0 8px rgba(248, 113, 113, 0.05) !important;
}

/* === INFO BLOCK === */
#addInfoUser {
    margin-top: 8px;
    padding: 8px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 8px;
    font-size: 10px;
    color: var(--nu-text2);
    line-height: 1.4;
    position: relative;
    z-index: 1;
}

/* === TOAST === */
.cyber-toast {
    position: fixed;
    bottom: 22px;
    left: 50%;
    transform: translateX(-50%) translateY(12px);
    min-width: 260px;
    max-width: min(560px, 90vw);
    padding: 14px 26px;
    border-radius: 14px;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-size: 17px;
    line-height: 1.35;
    font-weight: 600;
    letter-spacing: 0.2px;
    text-align: center;
    backdrop-filter: blur(16px) saturate(1.2);
    -webkit-backdrop-filter: blur(16px) saturate(1.2);
    background: rgba(18, 20, 28, 0.92);
    border: 1px solid rgba(255,255,255,0.1);
    opacity: 0;
    pointer-events: none;
    z-index: 9999999;
    transition: all 0.25s ease;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
}

.cyber-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

.cyber-toast.message {
    background: rgba(52, 211, 153, 0.12);
    border-color: rgba(52, 211, 153, 0.3);
    color: var(--nu-green);
    box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 20px rgba(52, 211, 153, 0.15);
}

.cyber-toast.error {
    background: rgba(248, 113, 113, 0.12);
    border-color: rgba(248, 113, 113, 0.3);
    color: var(--nu-red);
    box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 20px rgba(248, 113, 113, 0.15);
}

.cyber-toast.warning {
    background: rgba(251, 191, 36, 0.12);
    border-color: rgba(251, 191, 36, 0.3);
    color: #fbbf24;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5), 0 0 20px rgba(251, 191, 36, 0.15);
}

/* Без изменения внешнего вида для остальных пользователей */
@media (prefers-reduced-motion: reduce) {
    .glass-panel-testuser,
    .glass-btn-testuser,
    .glass-input-testuser,
    .cyber-toast {
        animation: none;
        transition: none;
    }
}
`;

        document.head.appendChild(cyberStyles);
    }

    // Исходная разметка и класс перетаскивания на прежнем месте.
    const win_TestUsers = `
<div class="glass-panel-testuser chmaf-drag-handle">
    <div class="glass-row-testuser">
        <input
            id="iduserinfo"
            placeholder="ID У/П"
            title="Введите ID У/П"
            class="teststudteachinp glass-input-testuser"
            autocomplete="off"
            inputmode="numeric"
            type="text"
        >
        <button
            id="openuserinfo"
            type="button"
            title="Поиск"
            aria-label="Поиск пользователя"
            class="glass-btn-testuser"
        >🔍</button>
    </div>

    <div class="glass-divider-horizontal-testuser"></div>

    <div class="glass-row-testuser">
        <button
            id="sidcode"
            type="button"
            title="Ученик (ЛКМ: логин, ПКМ: ID)"
            aria-label="Ученик: получить ссылку; правый клик — копировать ID"
            class="glass-btn-testuser"
        >👨‍🎓</button>
        <button
            id="tidcode"
            type="button"
            title="Преподаватель (ЛКМ: логин, ПКМ: ID)"
            aria-label="Преподаватель: получить ссылку; правый клик — копировать ID"
            class="glass-btn-testuser"
        >👽</button>
        <button
            id="TestRooms"
            type="button"
            title="Тестовые комнаты"
            aria-label="Тестовые комнаты"
            class="glass-btn-testuser"
        >🎲</button>
        <button
            id="link2lessbtn"
            type="button"
            title="Ссылка на урок"
            aria-label="Ссылка на урок"
            class="glass-btn-testuser"
        >📟</button>
    </div>

    <div id="addInfoUser" style="display: none;"></div>
</div>
`;

    if (typeof createWindow !== 'function') {
        console.error('[TestUsers] Функция createWindow не найдена');
        window.__testUsersModuleInitialized = false;
        return;
    }

    const TestUsersdiv = createWindow(
        'TestUsers',
        'winTopTestUsers',
        'winLeftTestUsers',
        win_TestUsers
    );

    if (!TestUsersdiv) {
        window.__testUsersModuleInitialized = false;
        return;
    }

    const root = TestUsersdiv.querySelector?.('.glass-panel-testuser')
        ?? TestUsersdiv;

    const UI = {
        input: root.querySelector('#iduserinfo'),
        searchBtn: root.querySelector('#openuserinfo'),
        studentBtn: root.querySelector('#sidcode'),
        teacherBtn: root.querySelector('#tidcode'),
        testRoomsBtn: root.querySelector('#TestRooms'),
        linkToLessonBtn: root.querySelector('#link2lessbtn')
    };

    if (Object.values(UI).some(element => !element)) {
        console.error('[TestUsers] Не найдены элементы интерфейса');
        window.__testUsersModuleInitialized = false;
        return;
    }

    // Уведомления: сначала существующая функция проекта,
    // при её отсутствии — toast в оригинальном стиле.
    function notify(message, type = 'message') {
        if (typeof createAndShowButton === 'function') {
            createAndShowButton(message, type);
            return;
        }

        let toast = document.getElementById('testusers-cyber-toast');

        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'testusers-cyber-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        clearTimeout(toast._hideTimer);

        toast.className = `cyber-toast ${type}`;
        toast.textContent = message;

        // Перезапускаем появление для повторных уведомлений.
        void toast.offsetWidth;
        toast.classList.add('show');

        toast._hideTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }

    // Отдельный таймер на каждую кнопку: быстрые клики больше
    // не сбивают визуальное состояние другой операции.
    const feedbackTimers = new WeakMap();

    function showButtonState(button, state, duration = 1000) {
        clearTimeout(feedbackTimers.get(button));

        button.classList.remove('successbtn', 'errorbtn');

        if (!state) return;

        button.classList.add(state);

        feedbackTimers.set(button, setTimeout(() => {
            button.classList.remove(state);
        }, duration));
    }

    async function handleButtonClick(button, storageKey) {
        if (button.disabled) return;

        const userId = localStorage.getItem(storageKey)?.trim();

        if (!userId) {
            notify('ID не найден в настройках', 'error');
            showButtonState(button, 'errorbtn');
            return;
        }

        if (typeof getLoginLink !== 'function') {
            notify('Функция получения ссылки недоступна', 'error');
            showButtonState(button, 'errorbtn');
            return;
        }

        button.disabled = true;
        button.classList.remove('successbtn', 'errorbtn');
        button.classList.add('active');

        try {
            await getLoginLink(userId);
            showButtonState(button, 'successbtn');
            notify('💾 Ссылка подготовлена', 'message');
        } catch (error) {
            console.error('[TestUsers] Ошибка получения ссылки:', error);
            showButtonState(button, 'errorbtn');
            notify('Ошибка получения ссылки', 'error');
        } finally {
            button.classList.remove('active');
            button.disabled = false;
        }
    }

    async function copyUserId(userId) {
        if (typeof copyToClipboard === 'function') {
            await copyToClipboard(userId);
            return;
        }

        if (!navigator.clipboard?.writeText) {
            throw new Error('Буфер обмена недоступен');
        }

        await navigator.clipboard.writeText(userId);
    }

    async function handleContextMenu(event, storageKey, button) {
        event.preventDefault();

        const userId = localStorage.getItem(storageKey)?.trim();

        if (!userId) {
            notify('ID не найден в настройках', 'error');
            showButtonState(button, 'errorbtn');
            return;
        }

        try {
            await copyUserId(userId);
            showButtonState(button, 'successbtn');
            notify(`ID скопирован: ${userId}`, 'message');
        } catch (error) {
            console.error('[TestUsers] Ошибка копирования ID:', error);
            showButtonState(button, 'errorbtn');
            notify('Ошибка копирования ID', 'error');
        }
    }

    function handleSearch() {
        const value = UI.input.value.trim();

        if (!/^\d+$/.test(value)) {
            notify('Введите числовой ID', 'error');
            UI.input.focus();
            return;
        }

        const studentInput = document.getElementById('idstudent');
        const studentBtn = document.getElementById('getidstudent');

        if (!studentInput || !studentBtn) {
            notify('Сервис поиска недоступен', 'error');
            return;
        }

        const serviceWindow = document.getElementById('AF_Service');

        if (
            serviceWindow &&
            getComputedStyle(serviceWindow).display === 'none'
        ) {
            serviceWindow.style.display = 'block';
            document.getElementById('butServ')
                ?.classList.add('activeScriptBtn');
        }

        studentInput.value = value;
        studentInput.dispatchEvent(
            new Event('input', { bubbles: true })
        );

        studentBtn.click();
        UI.input.value = '';
    }

    UI.studentBtn.addEventListener('click', () => {
        void handleButtonClick(UI.studentBtn, 'test_stud');
    });

    UI.studentBtn.addEventListener('contextmenu', event => {
        void handleContextMenu(event, 'test_stud', UI.studentBtn);
    });

    UI.teacherBtn.addEventListener('click', () => {
        void handleButtonClick(UI.teacherBtn, 'test_teach');
    });

    UI.teacherBtn.addEventListener('contextmenu', event => {
        void handleContextMenu(event, 'test_teach', UI.teacherBtn);
    });

    UI.testRoomsBtn.addEventListener('click', () => {
        if (typeof getTestRoomsButtonPress === 'function') {
            getTestRoomsButtonPress();
        } else {
            notify('Тестовые комнаты недоступны', 'error');
        }
    });

    UI.linkToLessonBtn.addEventListener('click', () => {
        if (typeof getlink2lessButtonPress === 'function') {
            getlink2lessButtonPress();
        } else {
            notify('Функция ссылки на урок недоступна', 'error');
        }
    });

    UI.searchBtn.addEventListener('click', handleSearch);

    UI.input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    });

    // Вставку не перехватываем: работает обычный Ctrl+V.
    // Если в проекте есть onlyNumber, сохраняем его поведение.
    UI.input.addEventListener('input', () => {
        if (typeof onlyNumber === 'function') {
            onlyNumber(UI.input);
        }
    });

    function validatePosition() {
        if (getComputedStyle(TestUsersdiv).display === 'none') return;

        const rect = TestUsersdiv.getBoundingClientRect();

        if (!rect.width || !rect.height) return;

        const margin = 8;

        const maxLeft = Math.max(
            margin,
            window.innerWidth - rect.width - margin
        );

        const maxTop = Math.max(
            margin,
            window.innerHeight - rect.height - margin
        );

        const nextLeft = Math.min(
            Math.max(rect.left, margin),
            maxLeft
        );

        const nextTop = Math.min(
            Math.max(rect.top, margin),
            maxTop
        );

        if (
            Math.abs(nextLeft - rect.left) < 1 &&
            Math.abs(nextTop - rect.top) < 1
        ) {
            return;
        }

        TestUsersdiv.style.left = `${nextLeft}px`;
        TestUsersdiv.style.top = `${nextTop}px`;

        localStorage.setItem(
            'winLeftTestUsers',
            String(nextLeft)
        );

        localStorage.setItem(
            'winTopTestUsers',
            String(nextTop)
        );
    }

    function updateVisibility() {
        const shouldShow =
            window.location.host === 'skyeng.autofaq.ai' &&
            window.location.pathname !== '/login' &&
            localStorage.getItem('disablelpmwindow') !== '1';

        TestUsersdiv.style.display = shouldShow ? 'block' : 'none';

        if (shouldShow) {
            requestAnimationFrame(validatePosition);
        }
    }

    window.addEventListener('resize', validatePosition);

    if (document.readyState === 'complete') {
        requestAnimationFrame(validatePosition);
    } else {
        window.addEventListener(
            'load',
            validatePosition,
            { once: true }
        );
    }

    if ('ResizeObserver' in window) {
        new ResizeObserver(validatePosition).observe(TestUsersdiv);
    }

    // Сохраняем проверку для страниц, где URL меняется без перезагрузки.
    setInterval(updateVisibility, 1200);

    updateVisibility();
})();