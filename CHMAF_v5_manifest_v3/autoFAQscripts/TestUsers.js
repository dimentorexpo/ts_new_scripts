// ═══════════════════════════════════════════════════════════════
//  CYBER-DARK UI  —  TestUsers Module  (176px Ultra-Compact)
// ═══════════════════════════════════════════════════════════════

// ─── 1. INJECT STYLES ───
const cyberStyles = document.createElement('style');
cyberStyles.textContent = `
:root {
    --cd-bg: rgba(16,16,24,0.8);
    --cd-border: rgba(255,255,255,0.07);
    --cd-text: #e0e0e6;
    --cd-text2: #7a7a8a;
    --cd-cyan: #00e5ff;
    --cd-green: #00d9a0;
    --cd-red: #ff3b5c;
    --cd-purple: #c840f5;
    --cd-orange: #ff9f40;
}

.glass-panel-testuser {
    width: 176px;
    padding: 8px;
    background: var(--cd-bg);
    backdrop-filter: blur(20px) saturate(1.3);
    -webkit-backdrop-filter: blur(20px) saturate(1.3);
    border: 1px solid var(--cd-border);
    border-radius: 10px;
    font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
    animation: cdIn 0.5s cubic-bezier(0.16,1,0.3,1);
    cursor: default;
}
@keyframes cdIn {
    from { opacity:0; transform:translateY(10px) scale(0.98); }
    to   { opacity:1; transform:translateY(0) scale(1); }
}

.glass-panel-testuser::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, var(--cd-cyan), var(--cd-purple), transparent);
    opacity: 0.5;
    border-radius: 0 0 2px 2px;
}

.glass-row-testuser {
    display: flex;
    gap: 3px;
    align-items: center;
}

.glass-input-testuser {
    flex: 1;
    height: 28px;
    padding: 0 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--cd-border);
    border-radius: 6px;
    color: var(--cd-text);
    font: 12px/1 'JetBrains Mono', 'Fira Code', monospace;
    outline: none;
    transition: 0.2s;
    cursor: text;
}
.glass-input-testuser::placeholder { color: #555560; font-size: 12px; }
.glass-input-testuser:hover  { border-color: rgba(0,229,255,0.18); background: rgba(255,255,255,0.04); }
.glass-input-testuser:focus  { border-color: var(--cd-cyan); box-shadow: 0 0 0 2px rgba(0,229,255,0.06), 0 0 10px rgba(0,229,255,0.08); }

.glass-btn-testuser {
    height: 28px;
    padding: 0 8px;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--cd-border);
    border-radius: 6px;
    color: var(--cd-text2);
    font: 11px/1 Inter, sans-serif;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    transition: 0.2s;
    user-select: none;
}
.glass-btn-testuser:hover {
    color: var(--cd-text);
    transform: translateY(-1px);
}
.glass-btn-testuser:active { transform: translateY(0) scale(0.97); }

#openuserinfo {
    width: 28px;
    padding: 0;
    font-size: 12px;
}
#openuserinfo:hover { color: var(--cd-cyan); border-color: var(--cd-cyan); box-shadow: 0 0 10px rgba(0,229,255,0.12); }

.glass-row-testuser:nth-of-type(3) .glass-btn-testuser {
    flex: 1;
    font-size: 14px;
    padding: 0;
    height: 30px;
}
#sidcode:hover   { color: var(--cd-green);  border-color: var(--cd-green);  box-shadow: 0 0 10px rgba(0,217,160,0.12); }
#tidcode:hover   { color: var(--cd-purple); border-color: var(--cd-purple); box-shadow: 0 0 10px rgba(200,64,245,0.12); }
#TestRooms:hover { color: var(--cd-orange); border-color: var(--cd-orange); box-shadow: 0 0 10px rgba(255,159,64,0.12); }
#link2lessbtn:hover { color: var(--cd-cyan); border-color: var(--cd-cyan); box-shadow: 0 0 10px rgba(0,229,255,0.12); }

.glass-divider-horizontal-testuser {
    height: 1px;
    margin: 7px 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), rgba(0,229,255,0.08), rgba(255,255,255,0.05), transparent);
}

.glass-btn-testuser.active { animation: cdPulse 1s ease-in-out infinite; }
@keyframes cdPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(0,229,255,0.15); }
    50%     { box-shadow: 0 0 0 4px rgba(0,229,255,0); }
}
.glass-btn-testuser.successbtn {
    background: rgba(0,217,160,0.1) !important;
    border-color: var(--cd-green) !important;
    color: var(--cd-green) !important;
    box-shadow: 0 0 10px rgba(0,217,160,0.12) !important;
}
.glass-btn-testuser.errorbtn {
    background: rgba(255,59,92,0.1) !important;
    border-color: var(--cd-red) !important;
    color: var(--cd-red) !important;
    box-shadow: 0 0 10px rgba(255,59,92,0.12) !important;
}

#addInfoUser {
    margin-top: 7px;
    padding: 7px;
    background: rgba(255,255,255,0.015);
    border: 1px solid var(--cd-border);
    border-radius: 6px;
    font-size: 10px;
    color: var(--cd-text2);
    line-height: 1.4;
}

.cyber-toast {
    position: fixed;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    padding: 6px 12px;
    border-radius: 6px;
    font: 10px/1 Inter, sans-serif;
    font-weight: 500;
    backdrop-filter: blur(16px);
    border: 1px solid var(--cd-border);
    opacity: 0;
    pointer-events: none;
    z-index: 99999;
    transition: 0.25s;
}
.cyber-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.cyber-toast.message { background: rgba(0,217,160,0.08); border-color: rgba(0,217,160,0.15); color: var(--cd-green); }
.cyber-toast.error   { background: rgba(255,59,92,0.08); border-color: rgba(255,59,92,0.15); color: var(--cd-red); }
`;
document.head.appendChild(cyberStyles);


// ─── 2. HTML TEMPLATE ───
const win_TestUsers = `
<div class="glass-panel-testuser">
    <div class="glass-row-testuser">
        <!-- Добавлен класс teststudteachinp для работы Drag'n'Drop -->
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

// ─── 4. ПОСТ-НАСТРОЙКА (Исправление багов позиции и драга) ───
(function fixPosition() {
    if (!TestUsersdiv) return;

    // 1. Чистим кэш от старых "px", чтобы не было багов с координатами
    ['winTopTestUsers', 'winLeftTestUsers'].forEach(key => {
        let val = localStorage.getItem(key);
        if (val && val.includes('px')) {
            localStorage.setItem(key, val.replace('px', ''));
        }
    });

    // 2. Улучшаем работу инпута (чтобы фокус не пропадал при клике)
    const input = document.getElementById('iduserinfo');
    if (input) {
        input.addEventListener('mousedown', (e) => {
            // Даем инпуту фокус, несмотря на то что родитель может начать Drag
            setTimeout(() => input.focus(), 10);
        });
    }

    // 3. Функция валидации позиции (чтобы не улетало за экран)
    function validatePosition() {
        const rect = TestUsersdiv.getBoundingClientRect();
        let currentTop = parseFloat(TestUsersdiv.style.top);
        let currentLeft = parseFloat(TestUsersdiv.style.left);
        let changed = false;

        if (currentLeft + rect.width > window.innerWidth) { currentLeft = window.innerWidth - rect.width - 20; changed = true; }
        if (currentTop + rect.height > window.innerHeight) { currentTop = window.innerHeight - rect.height - 20; changed = true; }
        if (currentLeft < 0) { currentLeft = 20; changed = true; }
        if (currentTop < 0) { currentTop = 20; changed = true; }

        if (changed) {
            TestUsersdiv.style.left = currentLeft + 'px';
            TestUsersdiv.style.top = currentTop + 'px';
            localStorage.setItem('winLeftTestUsers', String(currentLeft));
            localStorage.setItem('winTopTestUsers', String(currentTop));
        }
    }

    // Проверяем позицию при загрузке и изменении размера окна
    window.addEventListener('load', validatePosition);
    window.addEventListener('resize', validatePosition);
    setTimeout(validatePosition, 500); // Дополнительная проверка после рендера
})();

// ─── 5. SCRIPT LOGIC (unchanged) ───

const btnsid = document.getElementById('sidcode');
const btntid = document.getElementById('tidcode');
const idUserInfoInput = document.getElementById('iduserinfo');
const openUserInfoButton = document.getElementById('openuserinfo');

document.getElementById('TestRooms').onclick = getTestRoomsButtonPress;
document.getElementById('link2lessbtn').onclick = getlink2lessButtonPress;

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

function handleContextMenu(e, storageKey, buttonId) {
    e.preventDefault();
    const userId = localStorage.getItem(storageKey);
    if (userId) {
        copyToClipboard(userId);
        createAndShowButton('ID скопирован: ' + userId, 'message');
        const btn = document.getElementById(buttonId);
        btn.classList.add('successbtn');
        setTimeout(() => btn.classList.remove('successbtn'), 1000);
    }
}

btnsid.onclick = () => handleButtonClick('sidcode', 'test_stud');
btnsid.oncontextmenu = (e) => handleContextMenu(e, 'test_stud', 'sidcode');
btntid.onclick = () => handleButtonClick('tidcode', 'test_teach');
btntid.oncontextmenu = (e) => handleContextMenu(e, 'test_teach', 'tidcode');

function handlePaste(e) {
    let data = (e.clipboardData || window.clipboardData).getData('text').trim();
    if (/^\d+$/.test(data)) {
        e.preventDefault();
        idUserInfoInput.value = data;
        openUserInfoButton.click();
    }
}
idUserInfoInput.addEventListener('paste', handlePaste);
idUserInfoInput.addEventListener('input', () => { if (window.onlyNumber) onlyNumber(idUserInfoInput); });

openUserInfoButton.onclick = () => {
    const val = idUserInfoInput.value.trim();
    if (!val) return;

    const svc = document.getElementById('AF_Service');
    if (svc && svc.style.display === 'none') {
        svc.style.display = '';
        const b = document.getElementById('butServ');
        if (b) b.classList.add('activeScriptBtn');
    }

    const inp = document.getElementById('idstudent');
    const btn = document.getElementById('getidstudent');
    if (inp && btn) {
        inp.value = val;
        btn.click();
        idUserInfoInput.value = '';
    }
};

function updateVisibility() {
    const show = window.location.host === "skyeng.autofaq.ai" &&
        window.location.pathname !== "/login" &&
        localStorage.getItem('disablelpmwindow') !== '1';
    TestUsersdiv.style.display = show ? 'block' : 'none';
}
setInterval(updateVisibility, 1000);
updateVisibility();