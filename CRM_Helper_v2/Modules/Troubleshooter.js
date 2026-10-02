const processedUserIds = {};
// Лимит кэша: долгая сессия с сотнями ID не должна расти бесконечно
const PROCESSED_CACHE_MAX = 500;

function addusersinfo() {
    // Функция для обработки элементов
    function processFields(elements, type) {
        elements.forEach((field) => {
            if (!field.hasAttribute('info-added')) {
                let userid = field.innerText || field.value;  // Для полей ввода используем value
                // Всегда вызываем getuserinfocrm
                getuserinfocrm(userid, field, type);
                field.setAttribute('info-added', 'true');
            }
        });
    }

    // Верхние строки с id
    let usersfields = document.getElementsByClassName('p-10 w-85');
    let infofields = document.querySelectorAll('.p-10.w-85[info-added]');
    
    // ID в столбцах
    let headerCell = Array.from(document.querySelectorAll('.cdk-header-cell')).filter(cell => /^\d+$/.test(cell.innerText));
    let headerCellinfo = Array.from(document.querySelectorAll('.cdk-header-cell[info-added]')).filter(cell => /^\d+$/.test(cell.innerText));
    
    // ID в списках
    let listfields = Array.from(document.querySelectorAll('.mat-option-text')).filter(cell => /^\d+$/.test(cell.innerText));
    let listfieldsinfo = Array.from(document.querySelectorAll('.mat-option-text[info-added]')).filter(cell => /^\d+$/.test(cell.innerText));

    // Окно с id в статистике
    let statfield = Array.from(document.querySelectorAll('[id^="mat-input-"]')).filter(cell => /^\d+$/.test(cell.value));
    let statfieldinfo = Array.from(document.querySelectorAll('[id^="mat-input-"][info-added]')).filter(cell => /^\d+$/.test(cell.value));

    // Обрабатываем usersfields
    if (usersfields.length > 0 && infofields.length < usersfields.length) {
        processFields(Array.from(usersfields), 'topline');
    }

    // Обрабатываем headerCell
    if (headerCell.length > 0 && headerCellinfo.length < headerCell.length) {
        processFields(headerCell, 'other');
    }

    // Обрабатываем listfields
    if (listfields.length > 0 && listfieldsinfo.length < listfields.length) {
        processFields(listfields, 'other');
    }

    // Обрабатываем statfield
    if (statfield.length > 0 && statfieldinfo.length < statfield.length) {
        processFields(statfield, 'input');
    }
}


function getuserinfocrm(userid, pageelement, elemtype) {
    // Проверяем, есть ли уже информация в объекте
    if (processedUserIds[userid] && processedUserIds[userid].readyflag === '1') {
        // Если данные уже есть, используем их для добавления информации
        addinginfo(pageelement, userid, elemtype);
        return;
    }

    // Если данных нет, делаем запрос к серверу
    const fetchURL = `https://backend.skyeng.ru/api/persons/${userid}?crm2=true&debugParam=person-page`;
    const requestOptions = {
        method: 'GET'
    };

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, function (response) {
        if (!response.success) {
            alert('Не удалось выполнить запрос: ' + response.error);
            return;
        }

        const userInfo = JSON.parse(response.fetchansver);
        const nameofuser = `${userInfo.data.name}${userInfo.data.surname ? ` ${userInfo.data.surname}` : ''}`;
        const flagusertype = userInfo.data.type;

        // Cap кэша: удаляем старейшие записи при переполнении
        const keys = Object.keys(processedUserIds);
        if (keys.length >= PROCESSED_CACHE_MAX) {
            delete processedUserIds[keys[0]];
        }

        // Сохраняем данные в объект processedUserIds
        processedUserIds[userid] = {
            nameofuser,
            flagusertype,
            readyflag: '1'
        };

        // Добавляем информацию на страницу
        addinginfo(pageelement, userid, elemtype);
    });
}

function addinginfo(pageelement, userid, elemtype) {
    const flagusertype = processedUserIds[userid].flagusertype;
    const nameofuser = processedUserIds[userid].nameofuser;
    const userTypeStyles = {
        student: { text: '(У)', color: '#DC143C' },
        teacher: { text: '(П)', color: '#c9a84c' }
    };

    const { text, color } = userTypeStyles[flagusertype] || { text: '', color: '' };
    if (elemtype === 'input') {
        pageelement.value += text;
        return
    }
    const span = document.createElement('span');
    span.style.color = color;
    span.style.fontWeight = '600';
    span.innerText = text;

    if (elemtype === 'topline') {
        span.title = nameofuser;
        pageelement.style.width = '110px';
        pageelement.style.color = '#c9a84c';
        pageelement.style.textDecoration = 'underline';
        pageelement.style.cursor = 'pointer';
        // FIX: присваивание pageelement.tagName='A' удалено — tagName только для чтения.
        pageelement.title = "ЛКМ - открыть пользователя в CRM. ПКМ - скопировать id"

        pageelement.addEventListener('click', () => {
            window.open(`https://crm2.skyeng.ru/persons/${userid}`);
        });

        pageelement.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            copyToClipboard(userid)
            createAndShowButton('💾 Скопировано');
        });
    }

    pageelement.appendChild(span);
}

// Запускаем один раз при загрузке, чтобы обработать уже существующие элементы
addusersinfo();

// Наблюдатель за DOM. FIX: раньше addusersinfo() выполнялся на КАЖДУЮ мутацию,
// что сильно грузило страницу — теперь запуск отложен на 200 мс после последней мутации.
let observerDebounce = null;
const observer = new MutationObserver(() => {
    clearTimeout(observerDebounce);
    observerDebounce = setTimeout(addusersinfo, 200);
});

observer.observe(document.body, { childList: true, subtree: true });

// ==========================================
// НОВАЯ ФУНКЦИОНАЛЬНОСТЬ: Кнопка диагностики
// ==========================================

if (window.location.href.includes('video-trouble-shooter.skyeng.ru')) {
    // Создаем плавающую кнопку
    const diagBtn = document.createElement('div');
    diagBtn.id = 'webrtc-diag-floating-btn';
    diagBtn.innerHTML = '🔍';
diagBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background-color: #243447;
    color: #ffffff;
    font-size: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.28);
    z-index: 999999;
    transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.16);
    user-select: none;
`;
    
    // Эффекты при наведении
diagBtn.addEventListener('mouseenter', () => {
    diagBtn.style.transform = 'scale(1.05)';
    diagBtn.style.backgroundColor = '#1B2735';
    diagBtn.style.boxShadow = '0 10px 28px rgba(15, 23, 42, 0.36)';
});

diagBtn.addEventListener('mouseleave', () => {
    diagBtn.style.transform = 'scale(1)';
    diagBtn.style.backgroundColor = '#243447';
    diagBtn.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.28)';
});

    // При клике запускаем длинный код диагностики
    diagBtn.addEventListener('click', () => {
        runDiagnostics();
    });

    document.body.appendChild(diagBtn);
}

// Функция с длинным кодом диагностики
async function runDiagnostics() {
  const KEY = "__webrtcPremiumDiagnostics";
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  window[KEY]?.destroy();

  const controller = new AbortController();
  const { signal } = controller;

  let host;
  let users = [];
  let searchQuery = "";
  let activeTab = "diagnostics";
  let eventsNewestFirst = true;
  let activeHistory = null;

  const NOISE = [
    "зафиксированы проблемы webrtc",
    "plugin handle subscriber'a отсоединен",
    "plugin handle publisher'a отсоединен",
    "состояние dtls подключения изменено",
    "вкладка скрыта",
    "вкладка видима"
  ];

  const ISSUE_RE =
  /таймаут|connectionstatefailed|connectionfailed|janussessioncreatetimeout|переподключается|ошибк[аиуеой]\s*:|ошибка подключения|показано уведомление\s*:\s*hardwareerror|не удалось установить видеосвязь\s*\(камера\)|показано уведомление\s*:\s*(?:не выдан доступ к камере\s*\/\s*микрофону|партн[её]р не выдал доступ к камере\s*\/\s*микрофону)/i;

  const VIDEO_ISSUE_RE =
    /не удалось установить видеосвязь\s*\(камера\)|таймаут при установке видеосвязи\s*\(камера партн[её]ра\)/i;

  const PLATFORM_RE =
    /\bandroid\b|\bios\b|\bipados\b|\biphone\b|\bipad\b|\btablet\s+[a-zа-яё0-9]/i;

  const ACCESS_GRANTED_RE =
    /доступ к устройствам получен/i;

  const ROLE_NAME = {
    teacher: "Преподаватель",
    student: "Ученик",
    unknown: "Участник"
  };

  const ROLE_ORDER = {
    teacher: 0,
    student: 1,
    unknown: 2
  };

  const clean = value =>
    String(value ?? "").replace(/\s+/g, " ").trim();

  const unknown = value =>
    !value ||
    /^(undefined|null|n\/a|unknown|неизвестно)$/i.test(clean(value));

  function el(tag, className = "", text) {
    const result = document.createElement(tag);

    if (className) result.className = className;
    if (text !== undefined) result.textContent = text;

    return result;
  }

  function destroy() {
    controller.abort();
    activeHistory?.remove();
    host?.remove();

    if (window[KEY]?.destroy === destroy) {
      delete window[KEY];
    }
  }

  window[KEY] = { destroy };

  async function expandPanels() {
    let expanded = false;

    for (const header of document.querySelectorAll(
      "mat-expansion-panel-header"
    )) {
      if (signal.aborted) return;

      if (header.getAttribute("aria-expanded") !== "true") {
        header.click();
        expanded = true;
        await wait(20);
      }
    }

    if (expanded) await wait(300);
  }

  function findUsers() {
    const marked = [
      ...document.querySelectorAll('th[info-added="true"]')
    ];

    const headers = marked.length
      ? marked
      : [...document.querySelectorAll("th")].filter(th =>
          /\((П|У)\)/i.test(th.innerText || th.textContent || "")
        );

    const result = new Map();

    for (const th of headers) {
      const column = [...th.classList].find(name =>
        name.startsWith("cdk-column-")
      );

      if (!column) continue;

      const id = column.slice("cdk-column-".length);

      if (!id || id === "time" || result.has(id)) continue;

      const title = th.innerText || th.textContent || "";

      result.set(id, {
        id,

        role: /\(П\)/i.test(title)
          ? "teacher"
          : /\(У\)/i.test(title)
            ? "student"
            : "unknown",

        devices: {
          camera: null,
          mic: null,
          cameraStatus: null,
          micStatus: null,

          // Считываем, но нигде визуально не показываем.
          access: null
        },

        codecs: {
          audio: null,
          video: null
        },

        errors: [],
        platforms: [],
        bannedServers: [],

        history: {
          microphone: [],
          codecs: [],
          camera: []
        },

        seenErrors: new Set(),
        seenPlatforms: new Set(),
        seenBannedServers: new Set(),

        lastMicState: null,
        lastMicSource: null,

        // История камеры: имя + статус на момент каждой записи журнала.
        lastCameraKey: null,
        cameraLogSeen: false,

        lastCodecState: {
          audio: null,
          video: null
        }
      });
    }

    return result;
  }

  function parseTime(value) {
    const text = clean(value);

    const date =
      /(\d{1,2})[./-](\d{1,2})[./-](\d{4})/.exec(text);

    const time =
      /(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(text);

    if (!time) return null;

    const hours = Number(time[1]);
    const minutes = Number(time[2]);
    const seconds = Number(time[3] || 0);

    if (
      hours > 23 ||
      minutes > 59 ||
      seconds > 59
    ) {
      return null;
    }

    if (!date) {
      return hours * 3600 + minutes * 60 + seconds;
    }

    const day = Number(date[1]);
    const month = Number(date[2]);
    const year = Number(date[3]);

    const parsed = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      seconds
    );

    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }

    return parsed.getTime();
  }

  function compareByTime(a, b, newestFirst = true) {
    const direction = newestFirst ? -1 : 1;

    if (a.sortTime != null && b.sortTime != null) {
      const difference = a.sortTime - b.sortTime;

      if (difference) {
        return difference * direction;
      }
    } else if (a.sortTime != null) {
      return -1;
    } else if (b.sortTime != null) {
      return 1;
    }

    return (a.sequence - b.sequence) * direction;
  }

  /*
   * Получаем логические блоки ячейки без повторного чтения вложенных div.
   * Сохраняем переносы строк: они нужны для записи «Видеосервер: ...».
   */
  function getFragments(cell) {
    const logBlocks = [
      ...cell.querySelectorAll("div.ng-star-inserted")
    ];

    const deepestLogs = logBlocks.filter(block =>
      !block.querySelector("div.ng-star-inserted")
    );

    const leafDivs = [
      ...cell.querySelectorAll("div")
    ].filter(div =>
      !div.querySelector("div") &&
      !deepestLogs.some(block => block.contains(div))
    );

    const elements = [...deepestLogs, ...leafDivs]
      .sort((a, b) => {
        const position = a.compareDocumentPosition(b);

        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }

        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }

        return 0;
      });

    if (elements.length) {
      return elements
        .map(element => ({
          element,
          raw: element.innerText || element.textContent || ""
        }))
        .filter(item => clean(item.raw));
    }

    return [{
      element: cell,
      raw: cell.innerText || cell.textContent || ""
    }];
  }

  function readAccess(user, text) {
    const matches = [
      ...text.matchAll(
        /доступ к устройствам (получен|не получен|запрещ[её]н|отклон[её]н)/gi
      )
    ];

    const last = matches.at(-1)?.[1]?.toLowerCase();

    if (last) {
      user.devices.access =
        last === "получен" ? "granted" : "denied";
    }
  }

  function readCameraState(user, text) {
    const matches = [
      ...text.matchAll(
        /камера\s+(включена|выключена|отключена)/gi
      )
    ];

    const last = matches.at(-1)?.[1]?.toLowerCase();

    if (last) {
      user.cameraLogSeen = true;
      user.devices.cameraStatus =
        last.startsWith("включ") ? "on" : "off";
    }
  }

  function readDeviceName(user, line) {
    const match =
      /^(camera|mic)\s*:\s*(.*)$/i.exec(line);

    if (!match) return;

    const key = match[1].toLowerCase();
    const value = clean(match[2]);

    if (key === "camera") {
      // Для камеры пустое значение и "undefined"/"null"
      // означают, что в журнале она сейчас не определена —
      // сбрасываем имя, чтобы история видела переход.
      user.cameraLogSeen = true;
      user.devices.camera = value || null;
      return;
    }

    if (value) {
      user.devices.mic = value;
    }
  }

  /*
   * История камеры: одно состояние (имя + вкл/выкл) = одна запись.
   * Ловим переходы вида «камера была → undefined → снова камера»,
   * а не только последнее значение из журнала.
   */
  function trackCameraHistory(user, context, source) {
    if (!user.cameraLogSeen) return;

    const rawName = user.devices.camera;
    const name = unknown(rawName) ? null : rawName;
    const status = user.devices.cameraStatus;

    const key = `${name ?? "~"}|${status ?? "~"}`;

    if (user.lastCameraKey === key) return;
    user.lastCameraKey = key;

    const label = !name
      ? "Камера: не определена"
      : `Камера: ${name}${
          status === "on"
            ? " · включена"
            : status === "off"
              ? " · выключена"
              : ""
        }`;

    user.history.camera.push({
      ...context,
      source,
      name,
      // Оригинальное «неправильное» значение журнала (undefined/null/пусто).
      rawName: name ? null : (rawName || ""),
      status,
      isUndefined: !name,
      label
    });
  }

  function readCodec(user, line, context) {
    const match =
      /^(audio|video)\s*:\s*(.*)$/i.exec(line);

    if (!match) return false;

    const type = match[1].toLowerCase();
    const value = clean(match[2]);

    if (!value) return true;

    user.codecs[type] = value;

    const normalized = unknown(value)
      ? "__undefined__"
      : value.toLowerCase();

    if (user.lastCodecState[type] !== normalized) {
      user.lastCodecState[type] = normalized;

      user.history.codecs.push({
        ...context,
        codecType: type,
        value,
        isUndefined: unknown(value),
        label: `${
          type === "audio" ? "Аудио" : "Видео"
        }: ${
          unknown(value) ? "не определён" : value
        }`
      });
    }

    return true;
  }

  function readMicrophoneState(
    user,
    text,
    context,
    source
  ) {
    const expression =
      /микрофон\s+(включен|включён|выключен|выключён|отключен|отключён)/gi;

    for (const match of text.matchAll(expression)) {
      const word = match[1].toLowerCase();

      const state =
        word.startsWith("включ") ? "on" : "off";

      user.devices.micStatus = state;

      if (
        user.lastMicState === state &&
        user.lastMicSource === source
      ) {
        continue;
      }

      user.lastMicState = state;
      user.lastMicSource = source;

      user.history.microphone.push({
        ...context,
        state,
        source,
        label: state === "on"
          ? "Микрофон включён"
          : "Микрофон отключён"
      });
    }
  }

  function readBannedServers(user, cell, context) {
    const text =
      cell.innerText || cell.textContent || "";

    const pattern =
      /Бан серверов\s*:\s*(\[[\s\S]*?\])/gi;

    for (const match of text.matchAll(pattern)) {
      let parsed;

      try {
        parsed = JSON.parse(match[1]);
      } catch {
        continue;
      }

      if (!Array.isArray(parsed)) continue;

      const servers = [
        ...new Set(
          parsed
            .filter(item => typeof item === "string")
            .map(item => item.trim())
            .filter(Boolean)
        )
      ];

      // [] и [""] не создают вкладку.
      if (!servers.length) continue;

      const key =
        `${context.time}\u0000${JSON.stringify(servers)}`;

      if (user.seenBannedServers.has(key)) continue;

      user.seenBannedServers.add(key);

      user.bannedServers.push({
        ...context,
        servers
      });
    }
  }

  function readEvents(user, text, context) {
    const entry = `[${context.time}] ${text}`;

    if (
      PLATFORM_RE.test(text) &&
      !user.seenPlatforms.has(entry)
    ) {
      user.seenPlatforms.add(entry);

      user.platforms.push({
        ...context,
        text: entry
      });
    }

    if (text.length < 6) return;

    if (
      NOISE.some(phrase =>
        text.toLowerCase().includes(phrase)
      )
    ) {
      return;
    }

    if (
      /call-check/i.test(text) &&
      !/ошибк|failed/i.test(text)
    ) {
      return;
    }

    const isIssue =
      ISSUE_RE.test(text) ||
      (
        /call-check/i.test(text) &&
        /ошибк|failed/i.test(text)
      );

    if (
      isIssue &&
      !user.seenErrors.has(entry)
    ) {
      user.seenErrors.add(entry);

      user.errors.push({
        ...context,
        text: entry
      });
    }
  }

  /*
   * Добавляем видеосервер только из того же блока журнала
   * или непосредственно соседнего элемента того же родителя.
   * Не берём первый попавшийся сервер из всей ячейки.
   */
  function videoEventText(fragments, index) {
    const fragment = fragments[index];
    const text = clean(fragment.raw);

    if (!VIDEO_ISSUE_RE.test(text)) {
      return text;
    }

    const ownServer =
      /видеосервер\s*:\s*([^\n\r]+)/i.exec(fragment.raw);

    if (ownServer) {
      const server = clean(ownServer[1]);

      if (server) {
        const withoutDuplicate =
          text.replace(
            /\s*видеосервер\s*:\s*.+$/i,
            ""
          ).trim();

        return `${withoutDuplicate} · Видеосервер: ${server}`;
      }
    }

    const next = fragments[index + 1];

    if (
      next &&
      fragment.element.parentElement ===
        next.element.parentElement
    ) {
      const match =
        /^\s*видеосервер\s*:\s*(.+?)\s*$/i.exec(
          next.raw
        );

      if (match) {
        return `${text} · Видеосервер: ${clean(match[1])}`;
      }
    }

    return text;
  }

  function microphoneSource(fragments, index) {
    const current = fragments[index];
    const element = current?.element;

    if (!element) return "regular";

    // Если фраза о доступе находится прямо в текущем блоке.
    if (ACCESS_GRANTED_RE.test(current.raw)) {
      return "access";
    }

    // Главное исправление: ищем заголовок именно той раскрывающейся
    // панели, внутри которой находится запись о микрофоне.
    const panel = element.closest("mat-expansion-panel");

    if (panel) {
      const header = panel.querySelector(
        "mat-expansion-panel-header"
      );

      const headerText =
        header?.innerText ||
        header?.textContent ||
        "";

      if (ACCESS_GRANTED_RE.test(headerText)) {
        return "access";
      }
    }

    // Запасной вариант: Angular связывает содержимое панели
    // с заголовком через aria-labelledby.
    const region = element.closest(
      '.mat-expansion-panel-content[role="region"]'
    );

    if (region) {
      const headerId = region.getAttribute("aria-labelledby");
      const header = headerId
        ? document.getElementById(headerId)
        : null;

      const headerText =
        header?.innerText ||
        header?.textContent ||
        "";

      if (ACCESS_GRANTED_RE.test(headerText)) {
        return "access";
      }
    }

    // Для других вариантов разметки оставляем прежнюю
    // осторожную проверку соседнего фрагмента.
    const previous = fragments[index - 1];

    if (
      previous &&
      previous.element.parentElement === element.parentElement &&
      ACCESS_GRANTED_RE.test(previous.raw)
    ) {
      return "access";
    }

    return "regular";
  }

  async function collect() {
    await expandPanels();

    if (signal.aborted) return [];

    const found = findUsers();

    const rowData = [
      ...document.querySelectorAll("tr.mat-mdc-row")
    ].map((row, index) => {
      const time =
        clean(
          row.querySelector(
            ".cdk-column-time"
          )?.textContent
        ) || "время неизвестно";

      return {
        row,
        time,
        sortTime: parseTime(time),
        originalIndex: index
      };
    });

    const known = rowData.filter(item =>
      item.sortTime != null
    );

    // Хронологию состояний собираем от ранних строк к поздним.
    if (
      known.length > 1 &&
      known[0].sortTime >
        known.at(-1).sortTime
    ) {
      rowData.reverse();
    }

    let sequence = 0;

    for (const item of rowData) {
      if (signal.aborted) return [];

      const cells = [
        ...item.row.querySelectorAll("td")
      ];

      for (const user of found.values()) {
        const cell = cells.find(td =>
          td.classList.contains(
            `cdk-column-${user.id}`
          )
        );

        if (!cell) continue;

        readBannedServers(user, cell, {
          time: item.time,
          sortTime: item.sortTime,
          sequence: sequence++
        });

        const fragments = getFragments(cell);

        for (
          let index = 0;
          index < fragments.length;
          index++
        ) {
          const fragment = fragments[index];

          const context = {
            time: item.time,
            sortTime: item.sortTime,
            sequence: sequence++
          };

          const raw = fragment.raw;
          const text = clean(raw);

          const source = microphoneSource(fragments, index);

          readAccess(user, raw);
          readCameraState(user, raw);

          readMicrophoneState(
            user,
            raw,
            context,
            source
          );

          // Значения устройств и кодеков могут быть
          // отдельными строками одного блока.
          let containsCodec = false;

          for (const line of raw.split(/\r?\n/)) {
            const normalized = clean(line);

            if (
              readCodec(
                user,
                normalized,
                context
              )
            ) {
              containsCodec = true;
            }

            readDeviceName(
              user,
              normalized
            );
          }

          // Фиксируем переходы камеры (имя → undefined → имя,
          // включена/выключена) после разбора всех строк блока.
          trackCameraHistory(user, context, source);

          // Чистые блоки audio:/video: не добавляем в события.
          if (
            !containsCodec ||
            VIDEO_ISSUE_RE.test(text) ||
            ISSUE_RE.test(text)
          ) {
            readEvents(
              user,
              videoEventText(
                fragments,
                index
              ),
              context
            );
          }
        }
      }
    }

    return [...found.values()].sort(
      (a, b) =>
        ROLE_ORDER[a.role] -
        ROLE_ORDER[b.role]
    );
  }

  function microphoneIcon(status) {
    const ns =
      "http://www.w3.org/2000/svg";

    const svg =
      document.createElementNS(ns, "svg");

    svg.setAttribute(
      "viewBox",
      "0 0 24 24"
    );
    svg.setAttribute("width", "22");
    svg.setAttribute("height", "22");
    svg.setAttribute("fill", "none");
    svg.setAttribute(
      "stroke",
      "currentColor"
    );
    svg.setAttribute(
      "stroke-width",
      "1.8"
    );
    svg.setAttribute(
      "stroke-linecap",
      "round"
    );
    svg.setAttribute(
      "stroke-linejoin",
      "round"
    );
    svg.setAttribute(
      "aria-hidden",
      "true"
    );
    svg.classList.add("mic-icon");

    function add(tag, attributes) {
      const element =
        document.createElementNS(ns, tag);

      for (
        const [name, value] of
        Object.entries(attributes)
      ) {
        element.setAttribute(
          name,
          value
        );
      }

      svg.append(element);
    }

    add("rect", {
      x: "9",
      y: "2.5",
      width: "6",
      height: "12",
      rx: "3"
    });

    add("path", {
      d: "M5 10.5a7 7 0 0 0 14 0M12 17.5V21M8.5 21h7"
    });

    if (status === "off") {
      add("path", {
        d: "M3 3l18 18"
      });
    }

    return svg;
  }

  // ─────────────────────────────────────────────
  // Интерфейс
  // ─────────────────────────────────────────────

  host = el("div");
  host.id =
    "webrtc-premium-diagnostics";

  Object.assign(host.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    pointerEvents: "none"
  });

  const shadow =
    host.attachShadow({
      mode: "open"
    });

  const style = el("style");

  style.textContent = `
    :host {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, -apple-system,
        BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      color: #17243a;
    }

    * {
      box-sizing: border-box;
    }

    button,
    input {
      font: inherit;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(10, 20, 36, .54);
      backdrop-filter: blur(7px);
      pointer-events: auto;
    }

    .panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(1180px, calc(100vw - 28px));
      max-height: min(88vh, 900px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,.7);
      border-radius: 22px;
      background: #f6f8fc;
      box-shadow:
        0 36px 100px rgba(7,19,40,.34),
        0 2px 12px rgba(7,19,40,.12);
      pointer-events: auto;
    }

    .header {
      padding: 25px 28px 23px;
      color: white;
      background:
        radial-gradient(
          circle at 90% 0%,
          rgba(80,150,255,.26),
          transparent 38%
        ),
        linear-gradient(120deg, #101d32, #1a3150);
      cursor: grab;
      touch-action: none;
      user-select: none;
    }

    .header:active {
      cursor: grabbing;
    }

    .topline,
    .actions,
    .summary,
    .card-head,
    .card-tools,
    .section-heading,
    .history-head {
      display: flex;
      align-items: center;
    }

    .topline,
    .card-head,
    .section-heading,
    .history-head {
      justify-content: space-between;
      gap: 12px;
    }

    .eyebrow {
      margin: 0 0 7px;
      color: #8cb9ff;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .18em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(19px, 2.4vw, 26px);
      font-weight: 740;
      letter-spacing: -.04em;
    }

    .subtitle {
      margin: 9px 0 0;
      color: #b8c9e0;
      font-size: 12px;
    }

    .actions {
      gap: 8px;
      flex-shrink: 0;
    }

    .btn {
      min-height: 36px;
      padding: 8px 12px;
      border: 1px solid rgba(255,255,255,.22);
      border-radius: 10px;
      background: rgba(255,255,255,.10);
      color: white;
      cursor: pointer;
      font-size: 12px;
      font-weight: 650;
    }

    .btn:hover {
      background: rgba(255,255,255,.2);
    }

    .btn:disabled {
      opacity: .55;
      cursor: wait;
    }

    .btn-close {
      width: 36px;
      padding: 0;
      font-size: 23px;
      line-height: 1;
    }

    .content {
      min-height: 0;
      overflow: auto;
      padding: 22px 26px 28px;
    }

    .tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 17px;
      padding: 5px;
      border: 1px solid #e3eaf4;
      border-radius: 12px;
      background: #edf2f9;
    }

    .tab {
      padding: 9px 14px;
      border: 0;
      border-radius: 9px;
      background: transparent;
      color: #6a7b94;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }

    .tab:hover {
      color: #294c7b;
    }

    .tab.active {
      background: white;
      color: #244d82;
      box-shadow: 0 2px 8px rgba(25,53,91,.09);
    }

    .tab[hidden] {
      display: none;
    }

    .summary {
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 18px;
    }

    .metric {
      padding: 10px 14px;
      border: 1px solid #e2e9f3;
      border-radius: 12px;
      background: white;
      color: #52627b;
      font-size: 12px;
    }

    .metric strong {
      margin-right: 6px;
      color: #14243c;
      font-size: 16px;
    }

    .search {
      width: min(270px, 100%);
      min-height: 39px;
      margin-left: auto;
      padding: 0 13px;
      border: 1px solid #dce5f1;
      border-radius: 11px;
      outline: none;
      background: white;
      color: #17243a;
    }

    .search:focus {
      border-color: #609bf5;
      box-shadow:
        0 0 0 3px rgba(96,155,245,.15);
    }

    .grid {
      display: grid;
      grid-template-columns:
        repeat(
          auto-fit,
          minmax(min(100%,365px), 1fr)
        );
      align-items: start;
      gap: 16px;
    }

    .card {
      min-width: 0;
      overflow: hidden;
      border: 1px solid #e1e8f2;
      border-radius: 17px;
      background: white;
      box-shadow:
        0 7px 22px rgba(23,44,75,.045);
    }

    .card-head {
      flex-wrap: wrap;
      padding: 17px 18px;
      border-bottom: 1px solid #edf1f6;
    }

    .role {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin: 0;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 750;
      border: 1px solid;
      width: fit-content;
    }

    /* Цветные пилюли ролей: ученик — зелёный, преподаватель — синий */
    .role.role-student {
      color: #1a7f4b;
      background: rgba(52, 199, 123, .12);
      border-color: rgba(52, 199, 123, .45);
    }
    .role.role-student::before {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #34c77b;
    }
    .role.role-teacher {
      color: #2a5fc9;
      background: rgba(66, 133, 244, .12);
      border-color: rgba(66, 133, 244, .45);
    }
    .role.role-teacher::before {
      content: '';
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4285f4;
    }
    .role.role-unknown {
      color: #5c6b80;
      background: rgba(120, 136, 160, .12);
      border-color: rgba(120, 136, 160, .4);
    }

    .id {
      display: block;
      max-width: 100%;
      margin-top: 5px;
      overflow-wrap: anywhere;
      color: #7888a0;
      font-size: 11px;
    }

    .badge {
      padding: 7px 10px;
      border-radius: 999px;
      white-space: nowrap;
      font-size: 11px;
      font-weight: 750;
    }

    .badge.ok {
      background: #e7f6ee;
      color: #13784a;
    }

    .badge.bad {
      background: #fff0ed;
      color: #bb4535;
    }

    .section {
      padding: 15px 18px 0;
    }

    .last-section {
      padding-bottom: 18px;
    }

    .section-title {
      margin: 0 0 10px;
      color: #75849a;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .11em;
      text-transform: uppercase;
    }

    .facts {
      display: grid;
      grid-template-columns:
        repeat(2, minmax(0,1fr));
      gap: 8px;
    }

    .fact {
      min-width: 0;
      padding: 11px 12px;
      border: 1px solid #e8edf4;
      border-radius: 11px;
      background: #f8fafd;
    }

    .fact.good {
      border-color: #ccebdd;
      background: #f1fbf5;
    }

    .fact.warn {
      border-color: #f3d1cc;
      background: #fff5f3;
    }
	
	.fact.missing {
  border-color: #e2bd72;
  background: #fff9eb;
  box-shadow: inset 3px 0 0 #d5a54d;
}

.fact.missing .fact-label {
  color: #8a6420;
}

.fact.missing .fact-value {
  color: #6d4b12;
  font-weight: 760;
}

    .fact-label {
      margin-bottom: 5px;
      color: #708098;
      font-size: 11px;
      font-weight: 650;
    }

    .fact-value {
      overflow-wrap: anywhere;
      color: #24354f;
      font-size: 12px;
      font-weight: 650;
      line-height: 1.45;
    }

    .device-line {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .mic-icon {
      flex: none;
      color: #8491a5;
    }

    .good .mic-icon {
      color: #15945d;
    }

    .warn .mic-icon {
      color: #d14d43;
    }

    .device-hint {
      display: block;
      margin-top: 6px;
      color: #a0443d;
      font-size: 11px;
      font-weight: 500;
      line-height: 1.45;
    }

    .card-tools {
      flex-wrap: wrap;
      gap: 8px;
      padding: 14px 18px 0;
    }

    .tool-btn,
    .sort-btn {
      border: 1px solid #dce6f4;
      border-radius: 9px;
      background: #f4f8ff;
      color: #315787;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
    }

    .tool-btn {
      padding: 9px 11px;
    }

    .sort-btn {
      padding: 6px 8px;
      white-space: nowrap;
    }

    .tool-btn:hover,
    .sort-btn:hover {
      background: #e6f0ff;
    }

    .logs {
      max-height: 190px;
      overflow: auto;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .log {
      margin-top: 7px;
      padding: 9px 11px;
      border-left: 3px solid #e88b74;
      border-radius: 0 8px 8px 0;
      background: #fff7f5;
      color: #74453f;
      overflow-wrap: anywhere;
      font:
        11px/1.5 ui-monospace,
        SFMono-Regular,
        Consolas,
        monospace;
		  font-size: 14px;
      line-height: 1.5;
    }

    .log.platform {
      border-left-color: #6d9de9;
      background: #f2f7ff;
      color: #31527e;
    }

    .empty {
      padding: 12px;
      border: 1px dashed #d6e1ef;
      border-radius: 11px;
      background: #f9fbfe;
      color: #72829a;
      font-size: 12px;
      line-height: 1.5;
    }

    .notice {
      min-height: 17px;
      margin: 12px 0 0;
      color: #71819a;
      font-size: 11px;
    }

    .ban-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .ban-entry {
      padding: 14px 18px;
      border-bottom: 1px solid #edf1f6;
    }

    .ban-entry:last-child {
      border-bottom: 0;
    }

    .ban-time {
      display: block;
      margin-bottom: 8px;
      color: #8190a5;
      font-size: 11px;
      font-weight: 700;
    }

    .ban-server {
      display: block;
      margin-top: 6px;
      padding: 10px 12px;
      border: 1px solid #f0d9d3;
      border-radius: 9px;
      background: #fff6f3;
      color: #a3473b;
      overflow-wrap: anywhere;
      font:
        12px/1.5 ui-monospace,
        SFMono-Regular,
        Consolas,
        monospace;
    }

    .history-overlay {
      position: fixed;
      inset: 0;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: rgba(10,20,36,.66);
      backdrop-filter: blur(5px);
      pointer-events: auto;
    }

    .history-window {
      width: min(620px, 100%);
      max-height: min(78vh, 760px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid #dbe5f2;
      border-radius: 18px;
      background: white;
      box-shadow:
        0 30px 80px rgba(6,17,35,.35);
    }

    .history-head {
      padding: 19px 21px;
      border-bottom: 1px solid #e9eef6;
    }

    .history-title {
      margin: 0;
      color: #14243c;
      font-size: 17px;
    }

    .history-subtitle {
      margin: 5px 0 0;
      color: #8190a5;
      font-size: 11px;
      overflow-wrap: anywhere;
    }

    .history-close {
      width: 32px;
      height: 32px;
      border: 1px solid #e0e7f1;
      border-radius: 9px;
      background: #f7f9fc;
      color: #465b79;
      cursor: pointer;
      font-size: 21px;
    }

    .history-body {
      min-height: 0;
      overflow: auto;
      padding: 18px 21px 22px;
    }

    .history-group-title {
      margin: 4px 0 14px;
      color: #526787;
      font-size: 12px;
      font-weight: 800;
    }

    .history-group-title:not(:first-child) {
      margin-top: 25px;
    }

    .timeline {
      margin: 0;
      padding: 0 0 0 20px;
      list-style: none;
      border-left: 2px solid #e1eafa;
    }

    .timeline-item {
      position: relative;
      margin: 0 0 15px;
      padding: 0 0 0 14px;
    }

    .timeline-item::before {
      content: "";
      position: absolute;
      top: 5px;
      left: -26px;
      width: 10px;
      height: 10px;
      border: 2px solid white;
      border-radius: 50%;
      background: #668fe3;
      box-shadow:
        0 0 0 1px #b8ccf1;
    }

    .timeline-item.good::before {
      background: #22a36a;
    }

    .timeline-item.warn::before {
      background: #e16b59;
    }

    .timeline-time {
      display: block;
      margin-bottom: 4px;
      color: #7e8da4;
      font-size: 11px;
      font-weight: 700;
    }

    .timeline-label {
      color: #263954;
      font-size: 13px;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .timeline-note {
      margin-top: 4px;
      color: #8492a7;
      font-size: 11px;
      line-height: 1.4;
    }

    @media (max-width: 650px) {
      .panel {
        max-height: calc(100vh - 20px);
        border-radius: 16px;
      }

      .header {
        padding: 20px 18px;
      }

      .topline {
        align-items: flex-start;
      }

      .actions {
        gap: 5px;
      }

      .btn-label {
        display: none;
      }

      .btn {
        min-width: 36px;
        padding: 8px;
      }

      .content {
        padding: 16px;
      }

      .search {
        width: 100%;
        margin-left: 0;
      }

      .section-heading {
        align-items: flex-start;
      }
    }
	
	/* Компактная верхняя часть */
    .header {
      padding: 12px 18px;
    }

    .topline {
      gap: 10px;
    }

    .eyebrow,
    .subtitle {
      display: none;
    }

    h1 {
      font-size: 18px;
      line-height: 1.15;
      letter-spacing: -.025em;
    }

    .actions {
      gap: 6px;
    }

    .btn {
      min-height: 32px;
      padding: 6px 9px;
      border-radius: 8px;
      font-size: 11px;
    }

    .btn-close {
      width: 32px;
      padding: 0;
    }

    /* Компактнее вкладки, показатели и отступы */
    .content {
      padding: 13px 16px 17px;
    }

    .tabs {
      margin-bottom: 11px;
      padding: 3px;
      border-radius: 10px;
    }

    .tab {
      padding: 7px 11px;
      border-radius: 7px;
    }

    .summary {
      gap: 7px;
      margin-bottom: 12px;
    }

    .metric {
      padding: 7px 10px;
      border-radius: 9px;
    }

    .metric strong {
      font-size: 14px;
    }

    .search {
      min-height: 34px;
    }

    /* На узком экране сохраняем заголовок и кнопки в одной строке */
    @media (max-width: 650px) {
      .header {
        padding: 11px 13px;
      }

      h1 {
        font-size: 16px;
      }

      .content {
        padding: 11px;
      }
    }
  `;

  const backdrop = el("div", "backdrop");
  const panel = el("section", "panel");

  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Диагностика WebRTC");

  const header = el("header", "header");
  const topline = el("div", "topline");
  const heading = el("div");

  heading.append(el("h1", "", "Диагностика WebRTC"));

  const actions = el("div", "actions");
  const refreshButton = el("button", "btn");

  refreshButton.type = "button";
  refreshButton.title = "Обновить данные";
  refreshButton.setAttribute("aria-label", "Обновить данные");
  refreshButton.append("↻ ", el("span", "btn-label", "Обновить"));

  const closeButton = el("button", "btn btn-close", "×");
  closeButton.type = "button";
  closeButton.title = "Закрыть";
  closeButton.setAttribute("aria-label", "Закрыть");

  actions.append(refreshButton, closeButton);
  topline.append(heading, actions);
  header.append(topline);

  const content = el("div", "content");
  const tabs = el("div", "tabs");
  const diagnosticsTab = el("button", "tab active", "Диагностика");
  diagnosticsTab.type = "button";

  const bannedTab = el("button", "tab", "Бан серверов");
  bannedTab.type = "button";
  bannedTab.hidden = true;

  tabs.append(diagnosticsTab, bannedTab);

  const summary = el("div", "summary");
  const grid = el("div", "grid");
  const notice = el("p", "notice");
  const search = el("input", "search");

  search.type = "search";
  search.placeholder = "Поиск по ID и логам";
  search.setAttribute("aria-label", "Поиск участников");

  content.append(tabs, summary, grid, notice);
  panel.append(header, content);
  shadow.append(style, backdrop, panel);
  document.body.append(host);

  function addFact(parent, label, value, tone = "") {
    const fact = el("div", `fact ${tone}`.trim());
    fact.append(el("div", "fact-label", label), el("div", "fact-value", value));
    parent.append(fact);
  }

  function addMicrophoneFact(parent, user) {
    const { mic, micStatus } = user.devices;
    const hasDevice = !unknown(mic);
    const stereoMixer = hasDevice && /стерео|stereo|mixer|микшер/i.test(mic);
    const tone =
  !hasDevice
    ? "missing"
    : micStatus === "off"
      ? "warn"
      : micStatus === "on"
        ? "good"
        : "";
    const fact = el("div", `fact ${tone}`.trim());
    const label = el("div", "fact-label", "Микрофон");
    const value = el("div", "fact-value");
    const line = el("div", "device-line");
   const deviceName =
  hasDevice
    ? mic
    : "🎤 Микрофон";
    const description =
      micStatus === "on"
        ? `${deviceName} · включён`
        : micStatus === "off"
        ? `${deviceName} · отключён`
        : hasDevice
        ? `${mic} · статус неизвестен`
        : "🎤 Микрофон: не определён";

    line.append(microphoneIcon(micStatus), el("span", "", description));
    value.append(line);

    if (micStatus === "off") {
      value.append(
        el("span", "device-hint", "Если вы не отключали микрофон, проверьте доступ к нему в настройках операционной системы.")
      );
    } else if (stereoMixer) {
      value.append(el("span", "device-hint", "Выбран стереомикшер — НУЖНО изменить на микрофон."));
    }

    fact.append(label, value);
    parent.append(fact);
  }

  function cameraDescription(user) {
    const { camera, cameraStatus } = user.devices;
    if (unknown(camera)) {
  return {
    text: "📷 Камера: не определена",
    tone: "missing"
  };
}
    if (cameraStatus === "on") return { text: `${camera} · включена`, tone: "good" };
    if (cameraStatus === "off") return { text: `${camera} · выключена`, tone: "" };
    return { text: `${camera} · статус неизвестен`, tone: "" };
  }

  function addLogSection(card, user, type) {
    const isError = type === "error";
    const section = el("section", `section ${isError ? "last-section" : ""}`.trim());
    const sectionHeading = el("div", "section-heading");
    sectionHeading.append(el("h3", "section-title", isError ? "События подключения" : "Платформа и приложение"));

    if (isError) {
      const sortButton = el("button", "sort-btn", eventsNewestFirst ? "↓ Сначала поздние" : "↑ Сначала ранние");
      sortButton.type = "button";
      sortButton.title = "Переключить порядок событий";
      sortButton.addEventListener("click", () => {
        eventsNewestFirst = !eventsNewestFirst;
        renderGrid();
      });
      sectionHeading.append(sortButton);
    }
    section.append(sectionHeading);

    const entries = isError
      ? [...user.errors].sort((a, b) => compareByTime(a, b, eventsNewestFirst))
      : [...user.platforms].sort((a, b) => compareByTime(a, b, true));

    if (!entries.length) {
      section.append(
        el("div", "empty", isError ? "По заданным фильтрам событий не найдено." : "Сведения об Android или iOS в журнале не найдены.")
      );
    } else {
      const list = el("ul", "logs");
      for (const entry of entries) {
        list.append(el("li", isError ? "log" : "log platform", entry.text));
      }
      section.append(list);
    }
    card.append(section);
  }

  function appendTimeline(container, entries, type) {
    const timeline = el("ol", "timeline");
    for (const entry of entries) {
      const tone =
        type === "microphone"
          ? entry.state === "on" ? "good" : "warn"
          : type === "camera"
            ? entry.isUndefined || entry.status === "off" ? "warn" : "good"
            : entry.isUndefined ? "warn" : "good";
      const item = el("li", `timeline-item ${tone}`);
      item.append(el("time", "timeline-time", entry.time), el("div", "timeline-label", entry.label));
      if (type === "codecs" && entry.isUndefined) {
        item.append(el("div", "timeline-note", `В журнале явно указано: ${entry.value}`));
      }
      if (type === "camera" && entry.isUndefined) {
        item.append(el("div", "timeline-note", entry.rawName
          ? `В журнале явно указано: camera: ${entry.rawName}`
          : "В журнале имя камеры отсутствует."));
      }
      timeline.append(item);
    }
    container.append(timeline);
  }

  function openHistory(userId, type) {
    const user = users.find(item => item.id === userId);
    if (!user) return;
    activeHistory?.remove();

    const overlay = el("div", "history-overlay");
    const windowElement = el("section", "history-window");
    windowElement.setAttribute("role", "dialog");
    windowElement.setAttribute("aria-modal", "true");

    const titleText =
      type === "microphone"
        ? "История микрофона"
        : type === "camera"
          ? "История камеры"
          : "История кодеков";
    windowElement.setAttribute("aria-label", `${titleText}: ${ROLE_NAME[user.role]}`);

    const historyHead = el("div", "history-head");
    const historyHeading = el("div");
    historyHeading.append(el("h2", "history-title", titleText), el("p", "history-subtitle", `${ROLE_NAME[user.role]} · ID: ${user.id}`));

    const close = el("button", "history-close", "×");
    close.type = "button";
    close.title = "Закрыть историю";
    close.setAttribute("aria-label", "Закрыть историю");
    historyHead.append(historyHeading, close);

    const body = el("div", "history-body");
    const entries = [...user.history[type]].sort((a, b) => compareByTime(a, b, false));

    if (type === "microphone" || type === "camera") {
      const isCamera = type === "camera";
      const accessEntries = entries.filter(item => item.source === "access");
      const regularEntries = entries.filter(item => item.source !== "access");

      body.append(el("h3", "history-group-title", "При получении доступа к устройствам"));
      if (accessEntries.length) appendTimeline(body, accessEntries, type);
      else body.append(el("div", "empty", isCamera
        ? "Состояния камеры в момент получения доступа к устройствам в журнале не найдены."
        : "В журнале не найдено состояния микрофона, связанного с получением доступа."));

      body.append(el("h3", "history-group-title", isCamera ? "Остальные изменения камеры" : "Остальные включения и отключения"));
      if (regularEntries.length) appendTimeline(body, regularEntries, type);
      else body.append(el("div", "empty", isCamera
        ? "Других изменений камеры в журнале не найдено."
        : "Других переключений микрофона не найдено."));
    } else if (!entries.length) {
      body.append(el("div", "empty", "Явные записи audio: или video: в журнале не найдены."));
    } else {
      appendTimeline(body, entries, type);
    }

    windowElement.append(historyHead, body);
    overlay.append(windowElement);
    shadow.append(overlay);
    activeHistory = overlay;

    function closeHistory() {
      overlay.remove();
      if (activeHistory === overlay) activeHistory = null;
    }

    close.addEventListener("click", closeHistory);
    overlay.addEventListener("click", event => {
      if (event.target === overlay) closeHistory();
    });
    close.focus();
  }

  function renderCard(user) {
    const card = el("article", "card");
    const cardHead = el("div", "card-head");
    const identity = el("div");
    identity.append(el("h2", `role role-${user.role}`, ROLE_NAME[user.role]), el("span", "id", `ID: ${user.id}`));
    cardHead.append(identity, el("span", `badge ${user.errors.length ? "bad" : "ok"}`, user.errors.length ? `Событий: ${user.errors.length}` : "Событий не найдено"));
    card.append(cardHead);

    const tools = el("div", "card-tools");
    const micHistory = el("button", "tool-btn", "◷ История микрофона");
    micHistory.type = "button";
    micHistory.addEventListener("click", () => openHistory(user.id, "microphone"));

    const codecHistory = el("button", "tool-btn", "◷ История кодеков");
    codecHistory.type = "button";
    codecHistory.addEventListener("click", () => openHistory(user.id, "codecs"));

    const cameraHistory = el("button", "tool-btn", "◷ История камеры");
    cameraHistory.type = "button";
    cameraHistory.addEventListener("click", () => openHistory(user.id, "camera"));

    tools.append(micHistory, cameraHistory, codecHistory);
    card.append(tools);

    const deviceSection = el("section", "section");
    deviceSection.append(el("h3", "section-title", "Устройства"));
    const deviceFacts = el("div", "facts");
    const camera = cameraDescription(user);
    addFact(deviceFacts, "Камера", camera.text, camera.tone);
    addMicrophoneFact(deviceFacts, user);
    deviceSection.append(deviceFacts);
    card.append(deviceSection);

    const codecsSection = el("section", "section");
    codecsSection.append(el("h3", "section-title", "Последние значения кодеков"));
    const codecFacts = el("div", "facts");
    addFact(codecFacts, "Аудио", unknown(user.codecs.audio) ? "Нет определённого кодека" : user.codecs.audio);
    addFact(codecFacts, "Видео", unknown(user.codecs.video) ? "Нет определённого кодека" : user.codecs.video);
    codecsSection.append(codecFacts);
    card.append(codecsSection);

    if (user.role === "student") {
      addLogSection(card, user, "platform");
    }
    addLogSection(card, user, "error");
    return card;
  }

  function renderBannedServers() {
    const query = searchQuery.toLowerCase();
    const visible = users.filter(user =>
      user.bannedServers.length &&
      (!query ||
        user.id.toLowerCase().includes(query) ||
        ROLE_NAME[user.role].toLowerCase().includes(query) ||
        user.bannedServers.some(entry => entry.servers.some(server => server.toLowerCase().includes(query))))
    );

    if (!visible.length) {
      grid.replaceChildren(el("div", "empty", "По вашему запросу серверов не найдено."));
      return;
    }

    grid.replaceChildren(
      ...visible.map(user => {
        const card = el("article", "card");
        const head = el("div", "card-head");
        const identity = el("div");
        identity.append(el("h2", `role role-${user.role}`, ROLE_NAME[user.role]), el("span", "id", `ID: ${user.id}`));
        head.append(identity, el("span", "badge bad", `Записей: ${user.bannedServers.length}`));

        const list = el("ul", "ban-list");
        const entries = [...user.bannedServers].sort((a, b) => compareByTime(a, b, true));
        for (const entry of entries) {
          const item = el("li", "ban-entry");
          item.append(el("time", "ban-time", entry.time));
          for (const server of entry.servers) {
            item.append(el("span", "ban-server", server));
          }
          list.append(item);
        }
        card.append(head, list);
        return card;
      })
    );
  }

  function renderGrid() {
    if (activeTab === "bans") {
      renderBannedServers();
      return;
    }

    const query = searchQuery.toLowerCase();
    const visible = users.filter(user =>
      !query ||
      [user.id, ROLE_NAME[user.role], ...user.errors.map(item => item.text), ...user.platforms.map(item => item.text)].some(value =>
        value.toLowerCase().includes(query)
      )
    );

    if (!users.length) {
      grid.replaceChildren(el("div", "empty", "Участники не найдены. Проверьте, что открыт журнал WebRTC с таблицей участников."));
      return;
    }
    if (!visible.length) {
      grid.replaceChildren(el("div", "empty", "По вашему запросу ничего не найдено."));
      return;
    }
    grid.replaceChildren(...visible.map(renderCard));
  }

  function metric(label, value) {
    const result = el("div", "metric");
    result.append(el("strong", "", String(value)), document.createTextNode(label));
    return result;
  }

  function render() {
    const hasBans = users.some(user => user.bannedServers.length);
    bannedTab.hidden = !hasBans;
    if (!hasBans && activeTab === "bans") activeTab = "diagnostics";

    diagnosticsTab.classList.toggle("active", activeTab === "diagnostics");
    bannedTab.classList.toggle("active", activeTab === "bans");

    summary.replaceChildren(
      metric("участников", users.length),
      metric("событий", users.reduce((sum, user) => sum + user.errors.length, 0)),
      metric("записей о платформе", users.reduce((sum, user) => sum + user.platforms.length, 0)),
      search
    );
    renderGrid();
    notice.textContent = "История показывает записи журнала, а не причину изменения состояния устройства.";
  }

  async function refresh() {
    refreshButton.disabled = true;
    notice.textContent = "Считываем журнал…";
    try {
      const result = await collect();
      if (signal.aborted) return;
      users = result;
      activeHistory?.remove();
      activeHistory = null;
      render();
    } catch (error) {
      if (!signal.aborted) {
        notice.textContent = `Не удалось прочитать журнал: ${error.message}`;
        console.error("Диагностика WebRTC:", error);
      }
    } finally {
      if (!signal.aborted) refreshButton.disabled = false;
    }
  }

  function switchTab(tab) {
    if (tab === "bans" && bannedTab.hidden) return;
    activeTab = tab;
    diagnosticsTab.classList.toggle("active", tab === "diagnostics");
    bannedTab.classList.toggle("active", tab === "bans");
    renderGrid();
  }

  diagnosticsTab.addEventListener("click", () => switchTab("diagnostics"), { signal });
  bannedTab.addEventListener("click", () => switchTab("bans"), { signal });
  refreshButton.addEventListener("click", refresh, { signal });
  closeButton.addEventListener("click", destroy, { signal });
  backdrop.addEventListener("click", destroy, { signal });
  search.addEventListener("input", () => {
    searchQuery = search.value.trim();
    renderGrid();
  }, { signal });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (activeHistory) {
      activeHistory.remove();
      activeHistory = null;
    } else {
      destroy();
    }
  }, { signal });

  // Перемещение основного окна.
  let drag = null;
  header.addEventListener("pointerdown", event => {
    if (event.button !== 0 || event.target.closest("button")) return;
    const rect = panel.getBoundingClientRect();
    drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top };
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.transform = "none";
    header.setPointerCapture(event.pointerId);
  }, { signal });

  header.addEventListener("pointermove", event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    const maxLeft = Math.max(0, innerWidth - panel.offsetWidth);
    const maxTop = Math.max(0, innerHeight - panel.offsetHeight);
    panel.style.left = `${Math.min(maxLeft, Math.max(0, drag.left + event.clientX - drag.startX))}px`;
    panel.style.top = `${Math.min(maxTop, Math.max(0, drag.top + event.clientY - drag.startY))}px`;
  }, { signal });

  for (const type of ["pointerup", "pointercancel"]) {
    header.addEventListener(type, () => { drag = null; }, { signal });
  }

  await refresh();
}
