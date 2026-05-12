// ═══════════════════════════════════════════════════════════════
//  NEON GLASS ULTRA — TestUsers Module (176px Premium Compact)
// ═══════════════════════════════════════════════════════════════

const cyberStyles = document.createElement('style');
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

/* Glass shine on buttons */
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

/* Search button */
#openuserinfo {
    width: 28px;
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

#sidcode:hover   {
    color: var(--nu-green);
    border-color: rgba(52, 211, 153, 0.4);
    box-shadow: 0 0 12px rgba(52, 211, 153, 0.15), inset 0 0 8px rgba(52, 211, 153, 0.05);
}
#tidcode:hover   {
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
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    padding: 6px 14px;
    border-radius: 8px;
    font: 10px/1 'Inter', sans-serif;
    font-weight: 600;
    backdrop-filter: blur(16px) saturate(1.2);
    -webkit-backdrop-filter: blur(16px) saturate(1.2);
    border: 1px solid rgba(255,255,255,0.06);
    opacity: 0;
    pointer-events: none;
    z-index: 99999;
    transition: all 0.25s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.cyber-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}

.cyber-toast.message {
    background: rgba(52, 211, 153, 0.08);
    border-color: rgba(52, 211, 153, 0.15);
    color: var(--nu-green);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 15px rgba(52, 211, 153, 0.08);
}

.cyber-toast.error {
    background: rgba(248, 113, 113, 0.08);
    border-color: rgba(248, 113, 113, 0.15);
    color: var(--nu-red);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 15px rgba(248, 113, 113, 0.08);
}
`;
document.head.appendChild(cyberStyles);


// ─── HTML TEMPLATE ───
const win_TestUsers = `
<div class="glass-panel-testuser chmaf-drag-handle">
    <div class="glass-row-testuser">
        <input id="iduserinfo" placeholder="ID У/П" title="Введите ID У/П" class="teststudteachinp glass-input-testuser" autocomplete="off" type="text">
        <button id="openuserinfo" title="Поиск" class="glass-btn-testuser">🔍</button>
    </div>

    <div class="glass-divider-horizontal-testuser"></div>

    <div class="glass-row-testuser">
        <button id="sidcode" title="Ученик (ЛКМ: логин, ПКМ: ID)" class="glass-btn-testuser">👨‍🎓</button>
        <button id="tidcode" title="Преподаватель (ЛКМ: логин, ПКМ: ID)" class="glass-btn-testuser">👽</button>
        <button id="TestRooms" title="Тестовые комнаты" class="glass-btn-testuser">🎲</button>
        <button id="link2lessbtn" title="Ссылка на урок" class="glass-btn-testuser">📟</button>
    </div>
    <div id="addInfoUser" style="display: none;"></div>
</div>
`;
// ─── 3. INIT WINDOW ───
const TestUsersdiv = createWindow('TestUsers', 'winTopTestUsers', 'winLeftTestUsers', win_TestUsers);

// ─── 4. POSITION & DRAG FIX ───
(function initTestUsers() {
    if (!TestUsersdiv) return;

    // Очистка старых значений с "px"
    ['winTopTestUsers', 'winLeftTestUsers'].forEach(key => {
        const val = localStorage.getItem(key);
        if (val?.includes('px')) {
            localStorage.setItem(key, val.replace('px', ''));
        }
    });

    // Валидация позиции окна
    const validatePosition = () => {
        const rect = TestUsersdiv.getBoundingClientRect();
        let top = parseFloat(TestUsersdiv.style.top) || 0;
        let left = parseFloat(TestUsersdiv.style.left) || 0;
        let changed = false;

        const margin = 20;
        if (left + rect.width > window.innerWidth) { left = window.innerWidth - rect.width - margin; changed = true; }
        if (top + rect.height > window.innerHeight) { top = window.innerHeight - rect.height - margin; changed = true; }
        if (left < 0) { left = margin; changed = true; }
        if (top < 0) { top = margin; changed = true; }

        if (changed) {
            TestUsersdiv.style.left = `${left}px`;
            TestUsersdiv.style.top = `${top}px`;
            localStorage.setItem('winLeftTestUsers', String(left));
            localStorage.setItem('winTopTestUsers', String(top));
        }
    };

    window.addEventListener('load', validatePosition);
    window.addEventListener('resize', validatePosition);
    setTimeout(validatePosition, 500);
})();

// ─── 5. TOAST NOTIFICATION ───
function createAndShowButton(message, type = 'message') {
    let toast = document.querySelector('.cyber-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'cyber-toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `cyber-toast ${type}`;

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── 6. EVENT HANDLERS ───
const UI = {
    input: document.getElementById('iduserinfo'),
    searchBtn: document.getElementById('openuserinfo'),
    studentBtn: document.getElementById('sidcode'),
    teacherBtn: document.getElementById('tidcode'),
    testRoomsBtn: document.getElementById('TestRooms'),
    linkToLessonBtn: document.getElementById('link2lessbtn')
};

// Обработчик кликов по кнопкам
async function handleButtonClick(buttonId, storageKey) {
    const userId = localStorage.getItem(storageKey);
    if (!userId) {
        createAndShowButton('ID не найден в настройках', 'error');
        return;
    }

    const btn = document.getElementById(buttonId);
    btn.classList.add('active');

    try {
        await getLoginLink(userId);
        btn.classList.add('successbtn');
        createAndShowButton('💾 Ссылка скопирована', 'message');
    } catch (e) {
        btn.classList.add('errorbtn');
        createAndShowButton('Ошибка получения ссылки', 'error');
    } finally {
        btn.classList.remove('active');
        setTimeout(() => btn.classList.remove('successbtn', 'errorbtn'), 1000);
    }
}

// Обработчик контекстного меню (ПКМ)
function handleContextMenu(e, storageKey, buttonId) {
    e.preventDefault();
    const userId = localStorage.getItem(storageKey);

    if (userId) {
        copyToClipboard(userId)
            .then(() => {
                createAndShowButton(`ID скопирован: ${userId}`, 'message');
                const btn = document.getElementById(buttonId);
                btn.classList.add('successbtn');
                setTimeout(() => btn.classList.remove('successbtn'), 1000);
            })
            .catch(() => {
                createAndShowButton('Ошибка копирования ID', 'error');
            });
    }
}

// Обработчик вставки текста
function handlePaste(e) {
    const data = (e.clipboardData || window.clipboardData).getData('text').trim();
    if (/^\d+$/.test(data)) {
        e.preventDefault();
        UI.input.value = data;
        UI.searchBtn.click();
    }
}

// Обработчик поиска
function handleSearch() {
    const val = UI.input.value.trim();
    if (!val) return;

    const serviceWindow = document.getElementById('AF_Service');
    if (serviceWindow && serviceWindow.style.display === 'none') {
        serviceWindow.style.display = '';
        const btn = document.getElementById('butServ');
        if (btn) btn.classList.add('activeScriptBtn');
    }

    const studentInput = document.getElementById('idstudent');
    const studentBtn = document.getElementById('getidstudent');

    if (studentInput && studentBtn) {
        studentInput.value = val;
        studentBtn.click();
        UI.input.value = '';
    }
}

// Привязка событий
UI.studentBtn.onclick = () => handleButtonClick('sidcode', 'test_stud');
UI.studentBtn.oncontextmenu = (e) => handleContextMenu(e, 'test_stud', 'sidcode');
UI.teacherBtn.onclick = () => handleButtonClick('tidcode', 'test_teach');
UI.teacherBtn.oncontextmenu = (e) => handleContextMenu(e, 'test_teach', 'tidcode');
UI.testRoomsBtn.onclick = getTestRoomsButtonPress;
UI.linkToLessonBtn.onclick = getlink2lessButtonPress;
UI.input.addEventListener('paste', handlePaste);
UI.input.addEventListener('input', () => { if (window.onlyNumber) onlyNumber(UI.input); });
UI.input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
UI.searchBtn.onclick = handleSearch;

// ─── 7. VISIBILITY CONTROL ───
function updateVisibility() {
    const isAutofaqPage = window.location.host === "skyeng.autofaq.ai";
    const isNotLoginPage = window.location.pathname !== "/login";
    const isEnabled = localStorage.getItem('disablelpmwindow') !== '1';

    TestUsersdiv.style.display = (isAutofaqPage && isNotLoginPage && isEnabled) ? 'block' : 'none';
}

setInterval(updateVisibility, 1000);
updateVisibility();