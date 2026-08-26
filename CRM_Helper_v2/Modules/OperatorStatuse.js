/**
 * OperatorStatuse.js — модуль «OperStatus»:
 * показывает в реальном времени статусы операторов группы
 * (Ready / InService / Afterservice / Timeout / DND) через WebSocket telephony.
 */

var win_OperStatus = `<!-- описание элементов окна статусов операторов -->
<div style="display: flex; width: 400px;">
    <span style="width: 400px">
        <span style="cursor: -webkit-grab;">
            <div style="margin: 5px; width: 400px;" id="OpSt_header">
                <button class="buttonHide" title="скрывает меню" id="hideMeOpSt">hide</button>
                <button class="btnCRM btnCRMsmall" id="clearopersinfo">🧹</button>
            </div>
        </span>
        <div style="margin: 5px; width: 400px" id="opers_box">
            <p id="operstatustable" style="max-height:400px; margin-left:5px; font-size:16px; color:bisque; overflow:auto;"></p>
        </div>
    </span>
</div>`;

const wintOperStatus = createWindowCRM('CRM_OperStat', 'winTopOpStat', 'winLeftOpStat', win_OperStatus);
hideWindowOnDoubleClick('CRM_OperStat');

document.getElementById('clearopersinfo').onclick = function () { // кнопка очистки поля
    document.getElementById('operstatustable').innerHTML = "";
}

/* ============================================================
 *  РАБОТА С WEBSOCKET
 * ============================================================ */

// Текущее соединение. FIX: раньше каждое открытие окна создавало НОВЫЙ WebSocket,
// не закрывая старый — соединения накапливались и дублировали сообщения.
let operStatSocket = null;

/**
 * Извлекает из пакета WebSocket имена операторов с указанным lastStatus.
 * @param {string} message     - сырое сообщение сервера.
 * @param {string} statusLabel - значение lastStatus ("Ready", "DND", ...).
 * @returns {{names: string[], count: number}}
 */
function extractOperatorsByStatus(message, statusLabel) {
    // Имя оператора стоит перед "lastStatus":"<statusLabel>".
    const regex = new RegExp(`(:")(\\D+)(",)(?="lastStatus":"${statusLabel}")`, 'gm');
    const matches = message.match(regex);

    if (!matches) return { names: [], count: 0 };

    const names = matches.map(m =>
        m.replaceAll(':', '').replace(',', '').replaceAll('"', '')
    );
    return { names, count: names.length };
}

/** Заголовок секции статуса (разметка сохранена один-в-один). */
function statusHeader(title, count, extraStyles) {
    return `<div style="background:#768d87; width:96%; padding: 0.3%; padding-bottom: 2px; color:#37ff85; font-weight: 700; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border:1px solid black; padding-left:5px;${extraStyles} border-radius:10px; text-align:center;">` +
        title +
        '<span style="background: orange; color: #00365d; padding-left: 20px; padding-right: 20px; border: 1px solid transparent; float:right; height: 17px; border-radius: 17px;">' + count + '</span>' +
        '</div>';
}

/** Собирает итоговый HTML таблицы статусов из данных по всем категориям. */
function renderOperatorStats(data) {
    const rows =
        data.ready.names.map(n => '🟢 ' + n + '<br>').join('') +
        data.inservice.names.map(n => '🟡 📞' + n + '<br>').join('') +
        data.afterservice.names.map(n => '🟠 📵' + n + '<br>').join('') +
        data.timeout.names.map(n => '⭕ ⏳' + n + '<br>').join('') +
        data.dnd.names.map(n => '🔴 🍔' + n + '<br>').join('');

    const total = data.ready.count + data.inservice.count + data.afterservice.count +
                  data.timeout.count + data.dnd.count;

    return statusHeader('Ready', data.ready.count, '') +
           statusHeader('InService', data.inservice.count, ' border-top:0px;') +
           statusHeader('Afterservice', data.afterservice.count, ' border-top:0px;') +
           statusHeader('Timeout', data.timeout.count, ' border-top:0px;') +
           statusHeader('DND', data.dnd.count, ' border-top:0px;') +
           // Итоговая строка «Всего операторов» — отдельный стиль.
           '<div style="background:#0e9196; width:96%; padding: 0.3%; padding-bottom: 2px; color:#dcdcdc; font-weight: 700; box-shadow: 0px 3px 1px rgb(0 0 0 / 35%); text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) -1px 0px 1px, rgb(0 0 0) 0px -1px 1px; border:1px solid black; padding-left:5px; border-top:0px; border-radius:10px; text-align:center;">' +
               'Всего операторов в системе:' +
               '<span style="background: #00b5ff; color: #00365d; padding-left: 20px; padding-right: 20px; border: 1px solid transparent; float:right; height: 17px; border-radius: 17px; text-shadow:rgb(0 0 0) 1px 0px 1px;">' + total + '</span>' +
           '</div>' + rows;
}

document.getElementById('btnOperStatus').onclick = function () {

    // Показать/скрыть окно.
    if (document.getElementById('CRM_OperStat').style.display == 'none')
        document.getElementById('CRM_OperStat').style.display = ''
    else document.getElementById('CRM_OperStat').style.display = 'none'

    // Закрываем предыдущее соединение, чтобы не копить «висящие» сокеты.
    if (operStatSocket && operStatSocket.readyState <= 1) {
        try { operStatSocket.close(); } catch (e) { /* уже закрыт */ }
        operStatSocket = null;
    }

    const socket = new WebSocket("wss://telephony.skyeng.ru/phone-stats/?EIO=4&transport=websocket");
    operStatSocket = socket;

    const checksocket = setInterval(function () {
        if (socket.readyState !== 1) return;

        clearInterval(checksocket);
        socket.send('40/group-413,'); // подписываемся на группу операторов

        socket.onmessage = function (event) {
            const message = event.data;

            // Если пользователь закрыл окно/сокет — игнорируем хвостовые сообщения.
            if (socket.readyState !== 1) return;
            socket.send('3'); // heartbeat-ответ серверу

            // Разбираем все категории статусов одним помощником.
            const stats = {
                ready:       extractOperatorsByStatus(message, 'Ready'),
                inservice:   extractOperatorsByStatus(message, 'InServiceOut'),
                afterservice:extractOperatorsByStatus(message, 'AfterServiceOut'),
                timeout:     extractOperatorsByStatus(message, 'Timeout'),
                dnd:         extractOperatorsByStatus(message, 'DND')
            };

            document.getElementById('operstatustable').innerHTML = renderOperatorStats(stats);
        };
    }, 1000)

    document.getElementById('hideMeOpSt').onclick = function () { // скрытие окна
        if (document.getElementById('CRM_OperStat').style.display == '')
            document.getElementById('CRM_OperStat').style.display = 'none'

        // Отключаем поток обновлений и чистим таблицу.
        if (socket.readyState === 1) socket.send('2');
        document.getElementById('operstatustable').innerHTML = ''
    }
}
