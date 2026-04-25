let flagRemember = '';
let parsedData;
let responseslotsdata;
let arrayOfEvents = [];
let arrayOfMyEvents = [];
let uniqueEvents;
let operNamesAF = [];
let refreshintervalset = null;

// === УНИКАЛЬНЫЕ СТИЛИ GLASSMORPHISM ===
const glassStyles = `
<style>
    /* Основной контейнер */
    .af-glass-wrapper {
        width: 600px;
        background: rgba(30, 32, 40, 0.65);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        color: #e0e0e0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        position: relative;
    }

    .af-glass-scroll-area {
        width: 100%;
        min-height: 70px;
        max-height: 800px;
        overflow-y: auto;
        overflow-x: hidden;
        border-radius: 16px;
    }

    /* Кастомный скроллбар */
    .af-glass-scroll-area::-webkit-scrollbar { width: 8px; }
    .af-glass-scroll-area::-webkit-scrollbar-track { background: transparent; }
    .af-glass-scroll-area::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
    .af-glass-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }

    /* Кнопки */
    .af-glass-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        border-radius: 12px;
        padding: 6px 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
    }
    .af-glass-btn:hover { background: rgba(255, 255, 255, 0.25); transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
    .af-glass-btn:active { transform: translateY(1px); }

    /* Инпуты */
    .af-glass-input {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        border-radius: 12px;
        padding: 5px;
        outline: none;
        transition: border 0.3s ease;
    }
    .af-glass-input:focus { border-color: rgba(255, 255, 255, 0.5); }
    .af-glass-input:disabled { background: transparent; border: none; }

    /* Слоты (плитки времени) */
    .af-glass-slot {
        width: 31%;
        cursor: pointer;
        color: #fff;
        font-weight: 600;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 14px;
        height: 28px;
        margin: 0 5px 8px 0;
        display: flex;
        justify-content: center;
        align-items: center;
        text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
        transition: all 0.2s ease;
    }
    .af-glass-slot:hover { transform: scale(1.03); filter: brightness(1.2); }
    .af-glass-slot-time { border-radius: 8px; padding: 2px 6px; margin-right: 6px; }

    /* Статусы слотов */
    .af-slot-full { background: rgba(171, 65, 62, 0.7); } /* Красный */
    .af-slot-free { background: rgba(62, 158, 83, 0.7); } /* Зеленый */
    .af-slot-past { background: rgba(126, 113, 113, 0.5); color: #cbcbcb; } /* Серый */

    /* Анимация свечения выбранного слота */
    @keyframes af-glass-glow {
        0% { box-shadow: 0 0 5px rgba(127, 255, 212, 0.5); border-color: rgba(127, 255, 212, 0.5); }
        50% { box-shadow: 0 0 15px rgba(127, 255, 212, 0.9); border-color: rgba(127, 255, 212, 1); }
        100% { box-shadow: 0 0 5px rgba(127, 255, 212, 0.5); border-color: rgba(127, 255, 212, 0.5); }
    }
    .glowing-border-animation { animation: af-glass-glow 1.5s infinite; border-width: 2px; }

    /* Боковое меню */
    .af-glass-sidepanel {
        background: rgba(40, 42, 54, 0.85);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: -5px 0 20px rgba(0,0,0,0.4);
    }

    .af-glass-badge {
        background: chartreuse;
        padding: 5px 12px;
        border-radius: 15px;
        color: darkblue;
        font-weight: bold;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        cursor: pointer;
    }
</style>
`;

// === РАЗМЕТКА ===
const win_Calendar = `
${glassStyles}
<div class="af-glass-wrapper" id="AF_Calendar_Container">
    <div class="af-glass-scroll-area">
        <div style="cursor: default;">
            <div style="margin: 10px; display: flex; align-items: center; gap: 8px;" id="stataaf_header">
                <button class="${otherinpth} af-glass-btn" title="Скрывает меню" id="hidecalendar">Скрыть</button>
                <button class="${otherinpth} af-glass-btn" title="Очистить окно" id="clearcalendar">🧹</button>
                <button class="${otherinpth} af-glass-btn" title="Обновить информацию" id="refreshcalendar">♻</button>
                <button class="${otherinpth} af-glass-btn" title="Открыть datsy.ru" id="opendatsy">📅</button>

                <label title="Автообновление (каждые 30 сек)" style="display: flex; align-items: center; cursor: pointer;">
                    <input id="autorefreshswitcher" type="checkbox" checked style="margin-right: 5px;">
                    <span style="font-size: 12px;">Автообновление</span>
                </label>

                <div style="position: relative; margin-left: auto;">
                    <button class="${otherinpth} af-glass-btn" id="showOperActiveSlots" title="Мои слоты за день">📑 Мои слоты</button>
                    <span id="availableActiveSlots" style="display:none; position: absolute; top: -8px; right: -8px; font-size: 14px;">⚠</span>
                </div>
            </div>

            <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 10px;">
                <button class="af-glass-btn" id="prevDay">◀</button>
                <input class="${otherinpth} af-glass-input" type="date" id="eventDate" style="width: 110px; text-align: center; font-weight: bold;"></input>
                <button class="af-glass-btn" id="nextDay">▶</button>
                <button class="af-glass-btn" id="nowDay">Сегодня</button>
                <span style="font-size: 13px; margin-left: 10px; opacity: 0.8;">Обновлено:</span>
                <input class="${otherinpth} af-glass-input" type="text" id="datenowtime" style="width: 60px; text-align: center;" disabled></input>
            </div>

            <div id="outputcalendarfield" style="display: flex; flex-wrap: wrap; justify-content: center; padding: 0 5px 10px 5px;"></div>

            <div id="slotList" style="display: none; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 12px; margin: 0 10px 10px 10px;">
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <span id="chosenSlot" class="af-glass-badge" title="Копировать в буфер"></span>
                    <span id="hideSlot" style="font-size: 20px; cursor: pointer; transition: transform 0.3s;" title="Закрыть слоты">⤴</span>
                </div>
                <div id="slotData" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>

            <div id="operatorActiveSlots" class="af-glass-sidepanel af-glass-scroll-area" style="display: none; position: absolute; top: 0; left: 610px; width: 360px; height: 100%; padding: 10px; box-sizing: border-box;">
            </div>
        </div>
    </div>
</div>`;

// Создание окна
const wintCalendar = createWindow('AF_Calendar', 'winTopCalendar', 'winLeftCalendar', win_Calendar);
hideWindowOnDoubleClick('AF_Calendar');

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
const compareTimes = (time1, time2) => {
    return new Date(`1970-01-01 ${time1}`).getTime() - new Date(`1970-01-01 ${time2}`).getTime();
};

const sendFetchRequest = (url, options, successCallback) => {
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url, requestOptions: options }, (response) => {
        if (!response.success) {
            alert(`Ошибка запроса: ${response.error}`);
            return;
        }
        successCallback(response);
    });
};

// === ЛОГИКА ===
function checkAuth() {
    sendFetchRequest('https://datsy.ru/api/auth/check.php', { method: 'GET' }, (response) => {
        const data = JSON.parse(response.fetchansver);
        if (data['value-status'] === "Не авторизован") {
            alert("Вы не авторизованы на datsy.ru. Пожалуйста, авторизуйтесь.");
            window.open("https://datsy.ru/");
        } else {
            console.log("Вы авторизованы, загружаю календарь...");
            getTimeSlots();
        }
    });
}

function getSlotData(index) {
    const allRows = document.getElementsByName('slotRow');
    const slotListUI = document.getElementById('slotList');
    const hideSlotBtn = document.getElementById('hideSlot');
    const chosenSlotUI = document.getElementById('chosenSlot');
    const slotDataUI = document.getElementById('slotData');

    allRows[index].classList.toggle('glowing-border-animation');

    if (slotListUI.style.display === "none") {
        slotListUI.style.display = "";
    }

    hideSlotBtn.onclick = () => {
        allRows[index].classList.remove('glowing-border-animation');
        flagRemember = '';
        slotListUI.style.display = "none";
    };

    const slotText = allRows[index].getAttribute('data-rawtext');
    chosenSlotUI.textContent = slotText;

    chosenSlotUI.onclick = () => {
        const [time, originalDate] = slotText.split(" ");
        const date = new Date(originalDate);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${time}`;
        copyToClipboard(formattedDate);
    };

    slotDataUI.innerHTML = '';
    const slotsCount = parseInt(allRows[index].getAttribute('data-length'), 10);

    // Создаем элементы через fragment для оптимизации
    const fragment = document.createDocumentFragment();
    for (let j = 0; j < slotsCount; j++) {
        const div = document.createElement('div');
        div.style.display = "flex";
        div.style.gap = "5px";
        div.innerHTML = `
            <input class="${exttheme} af-glass-input" name="slotInfo" style="flex-grow: 1;">
            <button class="af-glass-btn" name="saveToCalend" title="Сохранить">💾</button>
            <button class="af-glass-btn" name="deleteFromCalend" title="Удалить">❌</button>
        `;
        fragment.appendChild(div);
    }
    slotDataUI.appendChild(fragment);

    const tempVarMatches = arrayOfEvents.filter(ev => `${ev.slotTime} ${ev.slotDate}` === slotText);
    const inputs = document.getElementsByName('slotInfo');

    if (tempVarMatches.length > 0) {
        tempVarMatches.forEach((match, n) => {
            if (inputs[n]) {
                inputs[n].value = match.eventText;
                inputs[n].title = match.eventId;
                inputs[n].setAttribute('data-operator', match.createdBy);

                if (operNamesAF.includes(match.createdBy)) {
                    inputs[n].classList.remove(exttheme);
                    inputs[n].classList.add(selectedinpth);
                }
            }
        });
    }

    // Привязка событий к полям и кнопкам
    Array.from(inputs).forEach((input, b) => {
        input.ondblclick = () => {
            if (input.value) {
                const match = input.value.match(/(https?:\/\/[^\s]+)/);
                if (match) window.open(match[0]);
            }
        };

        const saveBtn = document.getElementsByName('saveToCalend')[b];
        const delBtn = document.getElementsByName('deleteFromCalend')[b];
        const [curSlotTime, curSlotDate] = slotText.split(' ');

        saveBtn.onclick = () => {
            const isNew = !input.title;
            const url = isNew ? `https://datsy.ru/api/slot-event/add.php` : `https://datsy.ru/api/slot-event/save.php`;
            const bodyData = isNew
                ? `addinput=${input.value}&slotname=${curSlotTime}&date=${curSlotDate}`
                : `event-text=${input.value}&save-slot=${input.title}`;

            sendFetchRequest(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyData,
                credentials: "include"
            }, getTimeSlots);
        };

        delBtn.onclick = () => {
            if (input.title && confirm("Вы действительно хотите удалить этот слот?")) {
                const reason = encodeURIComponent(prompt("Укажите причину удаления:"));
                if (reason) {
                    removeSlot(input.title, reason);
                    input.title = '';
                    input.value = '';
                }
            }
        };
    });
}

function removeSlot(slotId, reason) {
    sendFetchRequest(`https://datsy.ru/api/slot-event/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `deleteslot=${slotId}&reason=${reason}`,
        credentials: "include"
    }, getTimeSlots);
}

function getTimeSlots() {
    const eventDateInput = document.getElementById('eventDate').value;
    const dateCalend = new Date();

    // Форматирование текущего времени и даты (МСК)
    const offsetCalend = 3;
    const hoursCalendar = String((dateCalend.getUTCHours() + offsetCalend) % 24).padStart(2, '0');
    const minutesCalendar = String(dateCalend.getMinutes()).padStart(2, '0');
    const currentTimeCalendar = `${hoursCalendar}:${minutesCalendar}`;

    const curentDate = `${dateCalend.getFullYear()}-${String(dateCalend.getMonth() + 1).padStart(2, '0')}-${String(dateCalend.getDate()).padStart(2, '0')}`;
    const outputField = document.getElementById('outputcalendarfield');

    sendFetchRequest(`https://datsy.ru/api/main-events/?date=${eventDateInput}`, { method: 'GET' }, (response) => {
        const data = JSON.parse(response.fetchansver);

        arrayOfEvents = [];
        arrayOfMyEvents = [];
        uniqueEvents = new Set();
        outputField.innerHTML = '';
        document.getElementById('datenowtime').value = data.nowDateTime;

        const unwantedTimes = new Set([
            "00:00", "00:20", "00:40", "01:00", "01:20", "01:40",
            "02:00", "02:20", "02:40", "03:00", "03:20", "03:40",
            "04:00", "04:20", "04:40", "05:00", "05:20", "05:40",
            "06:00", "06:20", "06:40", "07:00", "07:20", "07:40",
            "23:00", "23:20", "23:40"
        ]);

        const fragment = document.createDocumentFragment();

        Object.entries(data.DataTimeSlot).forEach(([time, slotData]) => {
            if (unwantedTimes.has(time)) return;

            if (slotData.EventList && slotData.EventList.length !== 0) {
                Object.values(slotData.EventList).forEach(event => {
                    if (!uniqueEvents.has(event.id)) {
                        const eventObj = {
                            eventId: event.id,
                            eventText: event.text,
                            slotTime: event.slot,
                            slotDate: event.new_date_slot,
                            createdBy: event.created_by_name
                        };
                        arrayOfEvents.push(eventObj);
                        uniqueEvents.add(event.id);

                        if (operNamesAF.includes(event.created_by_name)) {
                            arrayOfMyEvents.push(eventObj);
                        }
                    }
                });
            } else {
                for (let k = 0; k < slotData.CountSlot; k++) {
                    arrayOfEvents.push({ eventId: null, eventText: null, slotTime: null, slotDate: null, createdBy: null });
                }
            }

            const ratio = slotData.CountEvent / slotData.CountSlot;
            let slotClass = 'af-slot-full';
            let titleAttr = '';

            if (ratio === 0) {
                slotClass = 'af-slot-free';
            } else if (ratio > 0 && ratio < 1) {
                slotClass = 'af-slot-free';
                titleAttr = '⚠ Есть как занятые так и свободные слоты';
            } else if (slotData.CountEvent === 0 && slotData.CountSlot === 0) {
                titleAttr = '🚫 Свободных слотов изначально не было';
            } else if (slotData.AssignSlot === 0 && slotData.CountEvent === 0 && slotData.CountSlot === slotData.FreeSlot) {
                // remains af-slot-full
            } else if (slotData.FreeSlot < 0) {
                // remains af-slot-full
            }

            if (eventDateInput < curentDate || (compareTimes(time, currentTimeCalendar) <= 0 && eventDateInput === curentDate)) {
                slotClass = 'af-slot-past';
            }

            const slotEl = document.createElement('div');
            slotEl.className = `af-glass-slot ${slotClass}`;
            slotEl.setAttribute('name', 'slotRow');
            slotEl.setAttribute('data-length', slotData.CountSlot);
            slotEl.setAttribute('data-rawtext', `${time} ${eventDateInput}`);
            if (titleAttr) slotEl.title = titleAttr;

            slotEl.innerHTML = `<span class="af-glass-slot-time">${time}</span>`;
            fragment.appendChild(slotEl);
        });

        outputField.appendChild(fragment);
        const allRows = document.getElementsByName('slotRow');

        if (flagRemember !== '' && allRows[flagRemember]) {
            getSlotData(flagRemember);
        }

        Array.from(allRows).forEach((row, index) => {
            row.onclick = () => {
                flagRemember = index;
                Array.from(allRows).forEach(r => r.classList.remove('glowing-border-animation'));
                getSlotData(index);
            };
        });

        refreshActiveOperSlots();
    });
}

function refreshActiveOperSlots() {
    const container = document.getElementById('operatorActiveSlots');
    const badge = document.getElementById('availableActiveSlots');
    container.innerHTML = '<h3 style="margin: 0 0 10px 0; text-align: center;">Ваши слоты</h3>';

    if (arrayOfMyEvents.length > 0) {
        badge.style.display = 'block';

        arrayOfMyEvents.forEach(event => {
            const isReserved = event.eventText.includes('бронь');
            const slotToDelete = (event.eventText.match(/\d{4,9}/) || [''])[0];
            const statusHtml = isReserved
                ? '<span style="background: rgba(255, 219, 0, 0.8); color: #000; padding: 4px 8px; border-radius: 8px; font-size: 12px;">Бронь</span>'
                : '<span style="background: rgba(255, 127, 80, 0.8); padding: 4px 12px; border-radius: 8px; font-size: 12px;">➰</span>';

            const div = document.createElement('div');
            div.style = "display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05);";
            div.innerHTML = `
                <span class="af-glass-slot-time" style="margin: 0;">${event.slotTime}</span>
                <input class="${exttheme} af-glass-input" name="slotToDelete" data-id="${event.eventId}" value="${slotToDelete}" style="width: 70px; text-align: center; font-size: 12px;">
                ${statusHtml}
                <button class="af-glass-btn" name="deleMySlot" style="padding: 4px 8px; margin-left: auto;">❌</button>
            `;
            container.appendChild(div);
        });

        const delBtns = document.getElementsByName('deleMySlot');
        const inputs = document.getElementsByName('slotToDelete');

        Array.from(delBtns).forEach((btn, idx) => {
            btn.onclick = () => {
                const id = inputs[idx].getAttribute('data-id');
                if (id && confirm("Удалить этот слот?")) {
                    const reason = encodeURIComponent(prompt("Укажите причину:"));
                    if (reason) removeSlot(id, reason);
                }
            };
        });
    } else {
        container.innerHTML += '<div style="text-align: center; margin-top: 20px; opacity: 0.6;">Нет занятых слотов</div>';
        badge.style.display = 'none';
    }
}

// === ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ ===
document.getElementById('eventDate').addEventListener('change', getTimeSlots);

function getdatsyCalendarButtonPress() {
    const calendarUI = document.getElementById('AF_Calendar');
    const triggerBtn = document.getElementById('datsyCalendar');

    if (calendarUI.style.display === "none" || !calendarUI.style.display) {
        calendarUI.style.display = "block";
        if (triggerBtn) triggerBtn.classList.add('activeScriptBtn');

        const userNameElem = document.querySelector('.user_menu-dropdown-user_name');
        if (userNameElem) {
            const nameStr = userNameElem.textContent.split('-')[1].trim();
            operNamesAF = [nameStr, nameStr.split(" ").reverse().join(" ")];
        }

        checkAuth();

        const now = new Date();
        document.getElementById("eventDate").value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        const isAuto = localStorage.getItem('refreshCalend') !== '0';
        document.getElementById('autorefreshswitcher').checked = isAuto;

        if (isAuto && !refreshintervalset) {
            refreshintervalset = setInterval(getTimeSlots, 30000);
        }
    } else {
        calendarUI.style.display = "none";
        if (triggerBtn) triggerBtn.classList.remove('activeScriptBtn');
    }
}

// Обработчики кнопок
const changeDate = (days) => {
    const dateInput = document.getElementById('eventDate');
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() + days);
    dateInput.value = date.toISOString().split('T')[0];
    getTimeSlots();
};

document.getElementById('nextDay').onclick = () => changeDate(1);
document.getElementById('prevDay').onclick = () => changeDate(-1);
document.getElementById('nowDay').onclick = () => {
    document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
    getTimeSlots();
};

document.getElementById('autorefreshswitcher').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    localStorage.setItem('refreshCalend', isChecked ? '1' : '0');

    if (isChecked && !refreshintervalset) {
        refreshintervalset = setInterval(getTimeSlots, 30000);
    } else if (!isChecked && refreshintervalset) {
        clearInterval(refreshintervalset);
        refreshintervalset = null;
    }
});

document.getElementById('hidecalendar').onclick = () => {
    document.getElementById('AF_Calendar').style.display = "none";
    const triggerBtn = document.getElementById('datsyCalendar');
    if (triggerBtn) triggerBtn.classList.remove('activeScriptBtn');
};

document.getElementById('clearcalendar').onclick = () => {
    document.getElementById('slotList').style.display = "none";
    document.getElementById('outputcalendarfield').innerHTML = '';
};

document.getElementById('refreshcalendar').onclick = () => {
    checkAuth();
    refreshActiveOperSlots();
    document.getElementById('slotList').style.display = "none";
};

document.getElementById('opendatsy').onclick = () => window.open("https://datsy.ru/");

document.getElementById('showOperActiveSlots').onclick = () => {
    const panel = document.getElementById('operatorActiveSlots');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') refreshActiveOperSlots();
};