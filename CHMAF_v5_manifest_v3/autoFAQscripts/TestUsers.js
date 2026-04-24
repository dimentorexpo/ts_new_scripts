// --- 1. ЧИСТЫЙ HTML ---
const win_TestUsers = `
<div class="glass-panel-testuser">
    <div class="glass-row-testuser">
        <input id="iduserinfo" placeholder="ID У/П" title="Введите ID У/П" class="glass-input-testuser" autocomplete="off" type="text">
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

// Инициализация окна (используем твою функцию createWindow)
const TestUsersdiv = createWindow('TestUsers', 'winTopTestUsers', 'winLeftTestUsers', win_TestUsers);

// --- 2. СКРИПТОВАЯ ЛОГИКА ---

const btnsid = document.getElementById('sidcode');
const btntid = document.getElementById('tidcode');
const idUserInfoInput = document.getElementById('iduserinfo');
const openUserInfoButton = document.getElementById('openuserinfo');

// Кнопки открытия окон
document.getElementById('TestRooms').onclick = getTestRoomsButtonPress;
document.getElementById('link2lessbtn').onclick = getlink2lessButtonPress;

// Универсальный обработчик логинеров
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

// ПКМ - Копирование ID
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

// Слушатели событий
btnsid.onclick = () => handleButtonClick('sidcode', 'test_stud');
btnsid.oncontextmenu = (e) => handleContextMenu(e, 'test_stud', 'sidcode');
btntid.onclick = () => handleButtonClick('tidcode', 'test_teach');
btntid.oncontextmenu = (e) => handleContextMenu(e, 'test_teach', 'tidcode');

// Идеальная обработка вставки
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

// Кнопка поиска
openUserInfoButton.onclick = () => {
    const val = idUserInfoInput.value.trim();
    if (!val) return;

    // Эмуляция работы со скрытыми элементами сервиса
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

// Функция скрытия/показа
function updateVisibility() {
    const show = window.location.host === "skyeng.autofaq.ai" &&
        window.location.pathname !== "/login" &&
        localStorage.getItem('disablelpmwindow') !== '1';
    TestUsersdiv.style.display = show ? 'block' : 'none';
}
setInterval(updateVisibility, 1000); // Простая проверка раз в секунду
updateVisibility();