// Стили для премиального интерфейса
const premiumStyles = `
    <style>
        .ls-premium-container {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(145deg, #1e1e2e, #2a2a3d);
            border: 1px solid #444460;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 15px rgba(100, 100, 255, 0.1);
            padding: 15px;
            color: #e0e0e0;
            width: 1060px;
        }
        .ls-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            border-bottom: 1px solid #444460;
            padding-bottom: 10px;
        }
        .ls-controls button {
            background: rgba(255,255,255,0.1);
            border: 1px solid #555;
            color: #ccc;
            padding: 4px 10px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .ls-controls button:hover {
            background: rgba(255,255,255,0.2);
            color: #fff;
            box-shadow: 0 0 8px rgba(255,255,255,0.2);
        }
        .ls-filters {
            display: flex;
            align-items: center;
            gap: 15px;
            flex-wrap: wrap;
        }
        .ls-date-group {
            display: flex;
            align-items: center;
            background: #181825;
            border: 1px solid #3a3a50;
            border-radius: 8px;
            padding: 4px 8px;
            gap: 8px;
        }
        .ls-date-nav {
            background: none;
            border: 1px solid #555;
            color: #8be9fd;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        .ls-date-nav:hover {
            background: #8be9fd;
            color: #000;
            box-shadow: 0 0 10px #8be9fd;
        }
        .ls-input {
            background: #181825;
            border: 1px solid #3a3a50;
            color: #f8f8f2;
            padding: 6px 10px;
            border-radius: 6px;
            outline: none;
            transition: all 0.2s;
        }
        .ls-input:focus {
            border-color: #8be9fd;
            box-shadow: 0 0 8px rgba(139, 233, 253, 0.3);
        }
        .ls-input[type="date"] {
            width: 130px;
        }
        .ls-input[type="text"] {
            width: 100px;
            text-align: center;
        }
        .ls-btn-action {
            background: darkseagreen;
            border: none;
            color: #1e1e2e;
            font-weight: 600;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            text-shadow: 0 1px 1px rgba(255,255,255,0.3);
        }
        .ls-btn-action:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(139, 233, 253, 0.4);
        }
        .ls-table-wrap {
            margin-top: 15px;
            max-height: 400px;
            overflow: auto;
            border-radius: 8px;
            border: 1px solid #444460;
        }
        .ls-table-wrap::-webkit-scrollbar { width: 8px; }
        .ls-table-wrap::-webkit-scrollbar-track { background: #1e1e2e; }
        .ls-table-wrap::-webkit-scrollbar-thumb { background: #444460; border-radius: 4px; }
        
        .ls-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }
        .ls-table th {
            background: #2a2a3d;
            color: #8be9fd;
            padding: 10px 5px;
            position: sticky;
            top: 0;
            z-index: 10;
            text-align: center;
            font-weight: 600;
            border-bottom: 2px solid #6272a4;
        }
        .ls-table td {
            padding: 8px 5px;
            border-bottom: 1px solid #333350;
            text-align: center;
            color: #ccc;
        }
        .ls-table tr:nth-child(even) { background: rgba(255,255,255,0.02); }
        .ls-table tr:hover { background: rgba(139, 233, 253, 0.05); }
        
        .status-success { color: #50fa7b !important; font-weight: bold; text-shadow: 0 0 8px rgba(80, 250, 123, 0.4); }
        .status-error { color: #ff5555 !important; font-weight: bold; text-shadow: 0 0 8px rgba(255, 85, 85, 0.4); }
        .clickable-id { color: #bd93f9; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
        .clickable-id:hover { color: #fff; }
    </style>
`;

var win_LessonStatus =  
    `${premiumStyles}
    <div class="ls-premium-container" id="lessomstatdata">
        <div class="ls-header">
            <span style="font-size: 16px; font-weight: 600; color: #8be9fd;">📊 Статусы уроков</span>
            <div class="ls-controls">
                <button id="hideMeLessonStatus">Свернуть</button>
                <button id="clearlessonstatus" title="Очищает поля с результатами и полем для ввода">🧹 Очистить</button>
            </div>
        </div>
        
        <div class="ls-filters">
            <div class="ls-date-group">
                <button class="ls-date-nav" id="prevDay" title="День назад">◀</button>
                <span style="color: #aaa; font-size: 12px;">С:</span>
                <input class="ls-input" type="date" id="dateFromLS">
                <span style="color: #aaa; font-size: 12px; margin-left: 5px;">По:</span>
                <input class="ls-input" type="date" id="dateToLS">
                <button class="ls-date-nav" id="nextDay" title="День вперед">▶</button>
            </div>

            <input class="ls-input" id="idteacherforsearch" placeholder="Teacher ID" title="Введите ID учителя" autocomplete="off" type="text">
            <input class="ls-input" id="idstudentforsearch" placeholder="Student ID" title="Введите ID ученика (опционально)" autocomplete="off" type="text">
            
            <button class="ls-btn-action" title="Запускает процесс поиска информации по статусам урока" id="startlookstatus" style="margin-left: auto;">Получить инфо об уроках</button>
        </div>

        <div class="ls-table-wrap" id="statustable" style="display:none;"></div>
    </div>`;

const wintLessonStatus = createWindowCRM('AF_LessonStatus', 'winTopLessonStatus', 'winLeftLessonStatus', win_LessonStatus);
hideWindowOnDoubleClick('AF_LessonStatus');

document.getElementById('hideMeLessonStatus').onclick = function () { 
    if (document.getElementById('AF_LessonStatus').style.display == '') {
        document.getElementById('AF_LessonStatus').style.display = 'none'
        document.getElementById('statustable').innerHTML = "";
    }
}

function setdatesfilds(){
    const now = new Date();
    const prevDate = new Date(now);
    prevDate.setDate(prevDate.getDate() - 1);

    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    document.getElementById("dateFromLS").value = formatDate(prevDate);
    document.getElementById("dateToLS").value = formatDate(now);
    document.getElementById('statustable').innerHTML = "";
    document.getElementById('idteacherforsearch').value = "";
    document.getElementById('idstudentforsearch').value = "";
}

// Навигация по датам
function shiftDates(days) {
    const fromInput = document.getElementById("dateFromLS");
    const toInput = document.getElementById("dateToLS");
    
    let dFrom = new Date(fromInput.value + "T00:00:00");
    let dTo = new Date(toInput.value + "T00:00:00");
    
    dFrom.setDate(dFrom.getDate() + days);
    dTo.setDate(dTo.getDate() + days);

    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    
    fromInput.value = formatDate(dFrom);
    toInput.value = formatDate(dTo);
}

document.getElementById('prevDay').onclick = () => shiftDates(-1);
document.getElementById('nextDay').onclick = () => shiftDates(1);

document.getElementById('clearlessonstatus').onclick = function () { 
    if (!confirm("Are you sure you want to clear?")) return;
    setdatesfilds();
};
    
document.getElementById('butLessonInfoCRM').onclick = function () {
    setdatesfilds();
    if (document.getElementById('AF_LessonStatus').style.display == '') {
        document.getElementById('AF_LessonStatus').style.display = 'none'
        document.getElementById('idmymenucrm').style.display = 'none'
    } else {
        document.getElementById('AF_LessonStatus').style.display = ''
        document.getElementById('idmymenucrm').style.display = 'none'
    }
}	

// Функция конвертации локального времени Москвы в UTC для запроса
function getApiDateStr(inputDateStr, isEndOfDay) {
    const [y, m, d] = inputDateStr.split('-').map(Number);
    // Задаем время по Москве (UTC+3)
    let hours = isEndOfDay ? 23 : 0;
    let minutes = isEndOfDay ? 59 : 0;
    let seconds = isEndOfDay ? 59 : 0;

    // Создаем объект даты в UTC, предполагая что введенные числа это Москва
    let mskDate = new Date(Date.UTC(y, m - 1, d, hours, minutes, seconds));
    
    // Переводим в "чистый" UTC (вычитая 3 часа)
    mskDate.setUTCHours(mskDate.getUTCHours() - 3);

    // Форматируем в DD-MM-YYYY HH:mm:ss
    const day = String(mskDate.getUTCDate()).padStart(2, '0');
    const month = String(mskDate.getUTCMonth() + 1).padStart(2, '0');
    const year = mskDate.getUTCFullYear();
    const h = String(mskDate.getUTCHours()).padStart(2, '0');
    const min = String(mskDate.getUTCMinutes()).padStart(2, '0');
    const sec = String(mskDate.getUTCSeconds()).padStart(2, '0');
    
    return `${day}-${month}-${year} ${h}:${min}:${sec}`;
}

/** Экранирует HTML — данные из API вставляются через innerHTML, поэтому их нужно обезопасить. */
function escapeLSHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

document.getElementById('startlookstatus').onclick = function () {
    const teacherId = document.getElementById('idteacherforsearch').value.trim();
    if (!teacherId) {
        alert("Введите ID учителя в поле");
        return;
    }

    const statustable = document.getElementById('statustable');
    statustable.style.display = "block";
    statustable.innerHTML = "<div style='text-align:center; padding:20px; color:#8be9fd;'>⏳ Загрузка данных...</div>";

    const startdate = document.querySelector('#dateFromLS').value;
    const enddate = document.querySelector('#dateToLS').value;
    
    // Строгий парсинг: 00:00:00 - 23:59:59 по Москве
    const apiFrom = getApiDateStr(startdate, false);
    const apiTo = getApiDateStr(enddate, true);

    const fetchURL = 'https://timetable.skyeng.ru/api/teachers/search';
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `from=${apiFrom}&to=${apiTo}&offset=0&filters[teacherIds][]=${teacherId}&callback=getJSONP`,
        credentials: "include"
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURL, requestOptions: requestOptions }, function (lessonsresponse) {
        if (lessonsresponse.success) {
            let lessonsarray;
            try {
                lessonsarray = JSON.parse(lessonsresponse.fetchansver);
            } catch (e) {
                console.error('Не удалось разобрать ответ:', e);
                statustable.innerHTML = "<div style='text-align:center; padding:20px; color:#ff5555;'>❌ Неверный ответ сервера</div>";
                return;
            }
            const classes = lessonsarray?.[0]?.result?.[0]?.classes;

            if (classes && classes.length > 0) {
                const studentFilter = document.getElementById('idstudentforsearch').value.trim();
                
                const table = document.createElement('table');
                table.className = 'ls-table';
                
                const headers = ["🆔 Ученика", "📆 Урок / ⏰ Время", "⚡ Статус", "📅 Отмечен в", "❓ Кем", "💦 Тип", "💬 Комментарий", "🗑 Удален в"];
                table.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;

                classes.forEach(lesson => {
                    const studentId = lesson.studentId;
                    if (!studentId) return;
                    if (studentFilter && studentId != studentFilter) return;

                    const row = document.createElement('tr');
                    const status = lesson.classStatus?.status;
                    const statusClass = status === "success" ? "status-success" : "status-error";

                    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }) : "—";
                    const formatDateShort = (dateStr) => dateStr ? new Date(dateStr).toLocaleString("ru-RU", { timeZone: 'Europe/Moscow' }).slice(0, 17) : "—";

                    row.innerHTML = `
                        <td class="clickable-id" data-id="${escapeLSHtml(studentId)}">${escapeLSHtml(studentId)}</td>
                        <td>${escapeLSHtml(formatDateShort(lesson.startAt))}</td>
                        <td class="${statusClass}">${escapeLSHtml(status || "—")}</td>
                        <td>${escapeLSHtml(formatDate(lesson.classStatus?.createdAt))}</td>
                        <td>${escapeLSHtml(lesson.classStatus?.createdByUserId || "—")}</td>
                        <td style="font-size:10px;">${escapeLSHtml(lesson.type || "—")}</td>
                        <td style="font-size:10px; max-width:150px; word-wrap:break-word;">${escapeLSHtml(lesson.classStatus?.comment || "—")}</td>
                        <td>${escapeLSHtml(formatDate(lesson.removedAt))}</td>
                    `;
                    table.appendChild(row);
                });

                statustable.innerHTML = '';
                statustable.appendChild(table);

                // Делегирование событий для кликов по ID учеников
                table.addEventListener('click', function(e) {
                    if (e.target.classList.contains('clickable-id')) {
                        window.open(`https://crm2.skyeng.ru/persons/${e.target.dataset.id}`);
                    }
                });
                table.addEventListener('contextmenu', function(e) {
                    if (e.target.classList.contains('clickable-id')) {
                        e.preventDefault();
                        navigator.clipboard.writeText(e.target.dataset.id).then(() => {
                            // Можно добавить красивое уведомление об копировании, если есть такая функция в CRM
                        });
                    }
                });

            } else {
                statustable.innerHTML = "<div style='text-align:center; padding:20px; color:#ff5555;'>❌ Уроков не найдено</div>";
            }
        } else {
            statustable.innerHTML = `<div style='text-align:center; padding:20px; color:#ff5555;'>❌ Ошибка получения данных: ${lessonsresponse.error}</div>`;
        }
    });
}