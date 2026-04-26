// === НАЧАЛО ОПТИМИЗИРОВАННОГО И ИСПРАВЛЕННОГО КОДА ===

// --- 1. КОНФИГУРАЦИЯ, СТИЛИ И HTML ---
const win_Radio = `
    <div id="AF_Radio_content" style="display: flex; width: 650px;">
        <div style="width: 100%;">
            <div class="window-header" id="links_1str">
                <!-- Кнопка для открытия/переключения окна -->
                <span style="flex-grow: 1; text-align: center;">
                    <button class="mainButton buttonHide" title="Скрыть меню" id="hideMeRadio">❌</button>
                    <button class="mainButton rotateDisc" style="margin-left:30%">📀</button>
                    <span style="color:bisque; margin: 0 10px;">Play'O'Neer</span>
                    <button class="mainButton rotateDisc" style="margin-right:40%">📀</button>
                </span>
            </div>
            <div id="audioPlayer" class="mainplayer">
                <div id="audioControls">
                    <input type="text" id="audioUrl" placeholder="URL радио" style="flex-grow: 1;">
                    <input type="text" id="audioName" placeholder="Название" style="width:120px;">
                    <button class="mainButton" id="addAudio" title="Добавить">➕</button>
                    <button class="mainButton" id="playAudio" title="Играть">▶</button>
                    <button class="mainButton" id="pauseAudio" title="Пауза">⏸</button>
                    <input id="changeRadioVolume" min="0" max="1" value="1.0" step="0.025" type="range">
                    <button class="mainButton" id="muteAudio" title="Выкл/Вкл звук">🔇</button>
                </div>
                <ol id="audioList"></ol>
                <audio id="player" style="display:none;"></audio>
            </div>
        </div>
    </div>
`;

// --- 2. ИНИЦИАЛИЗАЦИЯ ОКНА И УПРАВЛЕНИЕ СОСТОЯНИЕМ ---

// Создаем окно (предполагается, что эта функция у вас есть)
const wintRadio = createWindow('AF_Radio', 'winTopRadio', 'winLeftRadio', win_Radio);
hideWindowOnDoubleClick('AF_Radio');
// hideWindowOnClick('AF_Radio', 'hideMeRadio'); // Эта логика теперь внутри toggleRadioWindow

const STORAGE_KEY = 'radioStations';
const VOLUME_KEY = 'radioVolume';

let stations = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentStationUrl = null;

// --- 3. КЭШИРОВАНИЕ DOM-ЭЛЕМЕНТОВ (ИНИЦИАЛИЗАЦИЯ ПЕРЕМЕННЫХ) ---
// ЭТОТ БЛОК ДОЛЖЕН БЫТЬ ДО ФУНКЦИЙ, КОТОРЫЕ ИСПОЛЬЗУЮТ `dom`

const dom = {
    window: document.getElementById('AF_Radio'),
    hideBtn: document.getElementById('hideMeRadio'),
    audioUrlInput: document.getElementById('audioUrl'),
    audioNameInput: document.getElementById('audioName'),
    addBtn: document.getElementById('addAudio'),
    playBtn: document.getElementById('playAudio'),
    pauseBtn: document.getElementById('pauseAudio'),
    muteBtn: document.getElementById('muteAudio'),
    volumeSlider: document.getElementById('changeRadioVolume'),
    audioList: document.getElementById('audioList'),
    player: document.getElementById('player'),
    // Ссылки на другие элементы интерфейса, которые нужно скрывать
    idmymenu: document.getElementById('idmymenu'),
    mainMenuBtn: document.getElementById('MainMenuBtn'),
};

// --- 4. ОСНОВНЫЕ ФУНКЦИИ (ОБЪЯВЛЯЮТСЯ ПОСЛЕ ИНИЦИАЛИЗАЦИИ `dom`) ---

function saveStations() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
}

function saveVolume(volume) {
    localStorage.setItem(VOLUME_KEY, volume);
}

function renderStations() {
    dom.audioList.innerHTML = '';
    if (stations.length === 0) {
        dom.audioList.innerHTML = '<li style="text-align:center; color:#888; padding: 10px;">Список пуст</li>';
        return;
    }
    stations.forEach((station, index) => {
        const li = document.createElement('li');
        li.dataset.url = station.url;
        li.dataset.index = index;
        if (station.url === currentStationUrl) {
            li.classList.add('active');
        }
        li.innerHTML = `
            <span>${station.name || 'Без названия'}</span>
            <button class="mainButton deleteline" data-action="delete" title="Удалить">❌</button>
        `;
        dom.audioList.appendChild(li);
    });
}

function addStation() {
    const url = dom.audioUrlInput.value.trim();
    const name = dom.audioNameInput.value.trim() || `Радио ${stations.length + 1}`;
    if (!url) {
        alert('Пожалуйста, введите URL радиостанции.');
        return;
    }
    try {
        new URL(url);
    } catch (_) {
        alert('Пожалуйста, введите корректный URL.');
        return;
    }
    stations.push({ url, name });
    saveStations();
    renderStations();
    dom.audioUrlInput.value = '';
    dom.audioNameInput.value = '';
    dom.audioUrlInput.focus();
}

function deleteStation(index) {
    if (confirm('Вы уверены, что хотите удалить эту станцию?')) {
        const deletedStation = stations[index];
        stations.splice(index, 1);
        saveStations();
        if (deletedStation.url === currentStationUrl) {
            dom.player.pause();
            dom.player.src = '';
            currentStationUrl = null;
        }
        renderStations();
    }
}

function playStation(url) {
    if (dom.player.src === url && !dom.player.paused) {
        return;
    }
    dom.player.src = url;
    dom.player.play().catch(error => {
        console.error("Ошибка воспроизведения:", error);
        alert("Не удалось воспроизвести радио.");
        currentStationUrl = null;
        renderStations();
    });
    currentStationUrl = url;
    renderStations();
}

function handleListClick(event) {
    const target = event.target;
    const li = target.closest('li[data-url]');
    if (!li) return;
    if (target.dataset.action === 'delete') {
        const index = parseInt(li.dataset.index, 10);
        deleteStation(index);
        return;
    }
    const url = li.dataset.url;
    playStation(url);
}

/**
 * Ваша функция, адаптированная и улучшенная.
 * Теперь она безопасно использует объект `dom`.
 */
function toggleRadioWindow() {
    // Проверяем, существует ли окно, чтобы избежать ошибок
    if (!dom.window) return;

    const isHidden = dom.window.style.display === 'none';

    // Переключаем видимость окна радио
    dom.window.style.display = isHidden ? 'block' : 'none';

    // Логика скрытия других элементов
    if (dom.idmymenu) {
        dom.idmymenu.style.display = 'none';
    }
    if (dom.mainMenuBtn) {
        dom.mainMenuBtn.classList.remove('activeScriptBtn');
    }
}

// --- 5. ИНИЦИАЛИЗАЦИЯ И НАЗНАЧЕНИЕ ОБРАБОТЧИКОВ (В САМОМ КОНЦЕ) ---

// Загрузка громкости из localStorage
const savedVolume = localStorage.getItem(VOLUME_KEY);
if (savedVolume) {
    dom.player.volume = parseFloat(savedVolume);
    dom.volumeSlider.value = savedVolume;
}

// Начальная отрисовка списка
renderStations();

// Назначение обработчиков событий (теперь все функции и переменные готовы)
if (dom.toggleBtn) {
    dom.toggleBtn.addEventListener('click', toggleRadioWindow);
}
if (dom.hideBtn) {
    dom.hideBtn.addEventListener('click', toggleRadioWindow);
}

if (dom.addBtn) dom.addBtn.addEventListener('click', addStation);
if (dom.playBtn) dom.playBtn.addEventListener('click', () => {
    if (currentStationUrl) {
        dom.player.play();
    } else if (stations.length > 0) {
        playStation(stations[0].url);
    }
});
if (dom.pauseBtn) dom.pauseBtn.addEventListener('click', () => dom.player.pause());
if (dom.audioList) dom.audioList.addEventListener('click', handleListClick);

if (dom.volumeSlider) {
    dom.volumeSlider.addEventListener('input', (e) => {
        const newVolume = e.target.value;
        dom.player.volume = newVolume;
        saveVolume(newVolume);
    });
}

if (dom.muteBtn) {
    dom.muteBtn.addEventListener('click', () => {
        dom.player.muted = !dom.player.muted;
        if (dom.player.muted) {
            dom.muteBtn.innerHTML = '📢';
            dom.muteBtn.title = 'Включить звук';
        } else {
            dom.muteBtn.innerHTML = '🔇';
            dom.muteBtn.title = 'Выключить звук';
            dom.player.volume = dom.volumeSlider.value;
            saveVolume(dom.player.volume);
        }
    });
}

if (dom.player) {
    dom.player.addEventListener('volumechange', () => {
        if (!dom.player.muted) {
            dom.volumeSlider.value = dom.player.volume;
            saveVolume(dom.player.volume);
        }
    });

    dom.player.addEventListener('error', (e) => {
        console.error("Ошибка плеера:", e);
        alert(`Ошибка загрузки радио: ${dom.player.src}`);
        currentStationUrl = null;
        renderStations();
    });
}

// === КОНЕЦ ОПТИМИЗИРОВАННОГО И ИСПРАВЛЕННОГО КОДА ===