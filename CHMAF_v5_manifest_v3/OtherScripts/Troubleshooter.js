// ============================================================
// Troubleshooter: подписи (У)/(П) рядом с ID пользователей
// ============================================================

// id → { nameofuser, flagusertype }. Map сохраняет порядок вставки,
// поэтому при переполнении удаляем самую старую запись.
const processedUserIds = new Map();
const PROCESSED_CACHE_MAX = 500;

// Запросы «в полёте»: 10 ячеек с одним ID = один запрос к CRM, а не десять
const pendingUserRequests = new Map();

// Неудачные запросы не повторяем чаще раза в 30 с (иначе при разлогине
// в CRM каждое изменение страницы отправляло бы новую пачку запросов)
const failedUserRequests = new Map();
const FAILED_RETRY_MS = 30000;

const ID_RE = /^\d+$/;
const BADGE_CLASS = 'chmaf-usertype-badge';

const USER_FIELD_SOURCES = [
  { selector: '.p-10.w-85', type: 'topline' },            // верхние строки с id
  { selector: '.cdk-header-cell', type: 'other' },        // id в столбцах
  { selector: '.mat-option-text', type: 'other' },        // id в выпадающих списках
  { selector: '[id^="mat-input-"]', type: 'input' }       // окно с id в статистике
];

const USER_TYPE_STYLES = {
  student: { text: '(У)', color: '#DC143C' },
  teacher: { text: '(П)', color: '#1E90FF' }
};

/** Текст элемента без нашей подписи. textContent вместо innerText:
 *  innerText заставляет браузер пересчитывать вёрстку на каждом вызове. */
function ownIdText(element) {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains(BADGE_CLASS)) continue;
    text += node.textContent;
  }
  return text.trim();
}

function addusersinfo() {
  for (const { selector, type } of USER_FIELD_SOURCES) {
    for (const element of document.querySelectorAll(selector)) {
      processUserElement(element, type);
    }
  }
}

function processUserElement(element, type) {
  const userid = type === 'input' ? element.value.trim() : ownIdText(element);
  if (!ID_RE.test(userid)) return;

  // Уже подписан этим же ID — ничего не делаем
  if (element.dataset.chmafUid === userid) return;

  // Angular переиспользует узлы: в ячейке мог смениться ID, старую подпись убираем
  for (const old of element.querySelectorAll(`:scope > .${BADGE_CLASS}`)) old.remove();

  element.dataset.chmafUid = userid;
  element.setAttribute('info-added', 'true'); // по этому атрибуту диагностика ищет участников

  getUserInfo(userid)
    .then((info) => {
      if (element.dataset.chmafUid === userid) addinginfo(element, userid, type, info);
    })
    .catch((error) => {
      if (element.dataset.chmafUid !== userid) return;
      // Сбрасываем отметку, чтобы после паузы попробовать ещё раз
      delete element.dataset.chmafUid;
      if (type !== 'input') addErrorBadge(element, error);
    });
}

/** Данные пользователя из CRM: кэш → запрос в полёте → новый запрос. */
function getUserInfo(userid) {
  const cached = processedUserIds.get(userid);
  if (cached) return Promise.resolve(cached);

  const pending = pendingUserRequests.get(userid);
  if (pending) return pending;

  const failedAt = failedUserRequests.get(userid);
  if (failedAt && Date.now() - failedAt < FAILED_RETRY_MS) {
    return Promise.reject(new Error('недавний запрос не удался, повтор позже'));
  }

  const fetchURL = `https://backend.skyeng.ru/api/persons/${userid}?crm2=true&debugParam=person-page`;

  const request = new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { action: 'getFetchRequest', fetchURL, requestOptions: { method: 'GET' } },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (!response?.success) {
            reject(new Error(response?.error || 'пустой ответ расширения'));
            return;
          }

          let data;
          try {
            data = JSON.parse(response.fetchansver)?.data;
          } catch (e) {
            reject(new Error('CRM вернула не JSON (возможно, нужно войти в CRM)'));
            return;
          }
          if (!data) {
            reject(new Error('в ответе CRM нет данных пользователя'));
            return;
          }

          const info = {
            nameofuser: [data.name, data.surname].filter(Boolean).join(' '),
            flagusertype: data.type
          };

          if (processedUserIds.size >= PROCESSED_CACHE_MAX) {
            processedUserIds.delete(processedUserIds.keys().next().value);
          }
          processedUserIds.set(userid, info);
          failedUserRequests.delete(userid);
          resolve(info);
        }
      );
    } catch (e) {
      // Extension context invalidated: расширение обновили, страница старая
      reject(e);
    }
  })
    .catch((error) => {
      failedUserRequests.set(userid, Date.now());
      console.warn(`[ChMAF:TS] Не удалось получить данные пользователя ${userid}:`, error.message);
      throw error;
    })
    .finally(() => pendingUserRequests.delete(userid));

  pendingUserRequests.set(userid, request);
  return request;
}

/** Ждёт ответы CRM по уже найденным ID (нужно диагностике, чтобы роли были известны). */
function waitForUserBadges(timeoutMs = 3000) {
  if (!pendingUserRequests.size) return Promise.resolve();
  return Promise.race([
    Promise.allSettled([...pendingUserRequests.values()]),
    new Promise((resolve) => setTimeout(resolve, timeoutMs))
  ]);
}

function makeBadge(text, color, title) {
  const span = document.createElement('span');
  span.className = BADGE_CLASS;
  span.style.color = color;
  span.style.fontWeight = '600';
  span.textContent = text;
  if (title) span.title = title;
  return span;
}

/** Вместо alert() на каждую ячейку — тихий серый «(?)» с причиной в подсказке. */
function addErrorBadge(element, error) {
  if (element.querySelector(`:scope > .${BADGE_CLASS}`)) return;
  element.appendChild(makeBadge('(?)', '#8a94a6',
    `Не удалось получить данные из CRM: ${error?.message || error}. Повтор через 30 с.`));
}

function addinginfo(pageelement, userid, elemtype, info = processedUserIds.get(userid)) {
  if (!info) return;
  const { text, color } = USER_TYPE_STYLES[info.flagusertype] || { text: '', color: '' };

  if (elemtype === 'input') {
    // Подпись дописывается в само поле; после этого значение уже не число
    // и повторно не обрабатывается
    if (text) pageelement.value += text;
    return;
  }

  if (!text) return;

  const span = makeBadge(text, color, elemtype === 'topline' ? info.nameofuser : '');

  if (elemtype === 'topline') {
    pageelement.style.width = '110px';
    pageelement.style.color = 'blue';
    pageelement.style.textDecoration = 'underline';
    pageelement.style.cursor = 'pointer';
    pageelement.title = 'ЛКМ - открыть пользователя в CRM. ПКМ - скопировать id';

    // Обработчики вешаем один раз и читаем актуальный ID в момент клика:
    // раньше при смене ID в том же элементе копились дубли обработчиков
    if (!pageelement.dataset.chmafBound) {
      pageelement.dataset.chmafBound = '1';

      pageelement.addEventListener('click', () => {
        const id = pageelement.dataset.chmafUid;
        if (id) window.open(`https://crm2.skyeng.ru/persons/${id}`, '_blank', 'noopener');
      });

      pageelement.addEventListener('contextmenu', (event) => {
        const id = pageelement.dataset.chmafUid;
        if (!id) return;
        event.preventDefault();
        // Скрипт живёт изолированно — copyToClipboard недоступен
        navigator.clipboard?.writeText(id).then(() => {
          const badge = pageelement.querySelector(`:scope > .${BADGE_CLASS}`);
          if (!badge) return;
          const prev = badge.textContent;
          badge.textContent = '📋';
          setTimeout(() => { badge.textContent = prev; }, 1200);
        }).catch(() => { });
      });
    }
  }

  pageelement.appendChild(span);
}

// Первый проход по уже существующим элементам
addusersinfo();

// Angular-страница меняет DOM очень часто. Раньше на КАЖДУЮ мутацию
// запускался полный обход страницы с innerText (пересчёт вёрстки).
// Теперь серия мутаций схлопывается в один проход раз в 150 мс,
// а вставка наших же подписей обход не запускает.
let userScanTimer = 0;

const userBadgeObserver = new MutationObserver((mutations) => {
  if (userScanTimer) return;

  const hasForeignNodes = mutations.some((mutation) =>
    Array.prototype.some.call(mutation.addedNodes, (node) =>
      !(node.nodeType === Node.ELEMENT_NODE && node.classList.contains(BADGE_CLASS))
    )
  );
  if (!hasForeignNodes) return;

  userScanTimer = setTimeout(() => {
    userScanTimer = 0;
    addusersinfo();
  }, 150);
});

userBadgeObserver.observe(document.body, { childList: true, subtree: true });

// ==========================================
// Тёмная тема страницы TroubleShooter
// Включается/выключается в Настройках ChMAF (chrome.storage: tsDarkTheme,
// по умолчанию — тёмная). Страница — Angular Material со своими светлыми
// стилями, поэтому делаем «реверс»: инвертируем содержимое страницы и
// возвращаем исходные оттенки hue-rotate. Цвета статусов (красный, зелёный,
// подписи (У)/(П)) сохраняют свой тон, светлые фоны становятся тёмными.
// Наши окна (диагностика, кнопка 🔍) не инвертируются.
// ==========================================

const TS_THEME_KEY = 'tsDarkTheme';
const TS_THEME_STYLE_ID = 'chmaf-ts-dark-theme';

function ensureTsThemeStyle() {
  if (document.getElementById(TS_THEME_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = TS_THEME_STYLE_ID;
  style.textContent = `
    html.chmaf-ts-dark,
    html.chmaf-ts-dark body {
      background: #111827 !important;
      color-scheme: dark;
    }

    /* Всё содержимое страницы, кроме окон ChMAF */
    html.chmaf-ts-dark body > :not(script):not(style):not(link):not(.chmaf-ts-keep):not(#webrtc-diag-floating-btn) {
      filter: invert(.9) hue-rotate(180deg);
    }

    /* Картинки и видео возвращаем к нормальным цветам */
    html.chmaf-ts-dark body > :not(.chmaf-ts-keep):not(#webrtc-diag-floating-btn) :is(img, video, canvas, picture) {
      filter: invert(1) hue-rotate(180deg);
    }

    /* Лёгкий синий оттенок — в тон окнам ChMAF, а не нейтрально-серый */
    html.chmaf-ts-dark body::after {
      content: '';
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      pointer-events: none;
      background: rgba(40, 70, 150, .16);
      mix-blend-mode: screen;
    }


    /* --- Серые элементы страницы → цвета ChMAF.
       Содержимое страницы инвертировано, поэтому здесь заданы «светлые
       прообразы»: после invert(.9) + hue-rotate(180deg) они становятся
       тёмно-синими, как кнопки и поля в окнах расширения. --- */

    /* Кнопки («Обновить» и т. п.); вкладки, чипы и кнопки-иконки не трогаем */
    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) button:not([role="tab"]):not([class*="chip"]):not([class*="icon-button"]):not([class*="mat-mdc-tab"]):not([class*="expansion"]) {
      color: #000317 !important;
      background: #e0f0ff !important;
      border: 1px solid #aec3e5 !important;
      border-radius: 8px !important;
      box-shadow: none !important;
      transition: background-color .16s ease, border-color .16s ease;
    }

    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) button:not([role="tab"]):not([class*="chip"]):not([class*="icon-button"]):not([class*="mat-mdc-tab"]):not([class*="expansion"]):hover:not(:disabled) {
      background: #c3dafc !important;
      border-color: #3a65c0 !important;
    }

    /* Поля ввода: «Выберите промежуток» (input[skyuiinput]), выпадающие списки
       ng-zorro (хэш, ID), селект «Сортировка» (Angular Material) */
    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) :is(.ant-select-selector, .mat-mdc-text-field-wrapper, .mdc-text-field--filled) {
      color: #000000 !important;
      background-color: #f5faff !important;
      border: 1px solid #b5c7e5 !important;
      border-radius: 8px !important;
      box-shadow: none !important;
    }

    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) .mdc-line-ripple { display: none !important; }

    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) :is(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not(.ant-select-selection-search-input):not(.mat-mdc-input-element), textarea) {
      color: #000000 !important;
      background-color: #f5faff !important;
      border-color: #b5c7e5 !important;
      opacity: 1 !important;
      -webkit-text-fill-color: #000000 !important;
    }

    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) :is(input, textarea)::placeholder {
      color: #6f7f99 !important;
      -webkit-text-fill-color: #6f7f99 !important;
    }

    /* Всплывающие подсказки (браузер и ОС на полосе «Устройства пользователя» — ds-tooltip) */
    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) :is(
      ds-tooltip .root, .mdc-tooltip__surface, .mat-mdc-tooltip, .mat-tooltip, .tooltip-inner, .tooltip, [role="tooltip"]
    ) {
      color: #000000 !important;
      background: #e0f0ff !important;
      border: 1px solid #aec3e5 !important;
      box-shadow: none !important;
    }

    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) ds-tooltip :is(.content, .body) { color: #000000 !important; }
    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) ds-tooltip .arrow :is(svg, path) { fill: #e0f0ff !important; color: #e0f0ff !important; }

    html.chmaf-ts-dark body > :not(.chmaf-ts-keep) :is(.tooltip-arrow, .arrow)::before {
      border-top-color: #e0f0ff !important;
      border-bottom-color: #e0f0ff !important;
    }

    html.chmaf-ts-dark ::-webkit-scrollbar { width: 10px; height: 10px; background: #111827; }
    html.chmaf-ts-dark ::-webkit-scrollbar-thumb { background: #344258; border-radius: 8px; border: 2px solid #111827; }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function applyTsTheme(dark) {
  ensureTsThemeStyle();
  document.documentElement.classList.toggle('chmaf-ts-dark', Boolean(dark));
}

if (window.location.href.includes('video-trouble-shooter.skyeng.ru') && globalThis.chrome?.storage?.local) {
  try {
    chrome.storage.local.get(TS_THEME_KEY, (res) => {
      if (chrome.runtime?.lastError) { applyTsTheme(true); return; }
      applyTsTheme(res?.[TS_THEME_KEY] !== false);
    });

    // Переключили в Настройках — меняем тему сразу, без перезагрузки страницы
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes[TS_THEME_KEY]) {
        applyTsTheme(changes[TS_THEME_KEY].newValue !== false);
      }
    });
  } catch (e) {
    applyTsTheme(true);
  }
}

// ==========================================
// Кнопка диагностики
// ==========================================

if (window.location.href.includes('video-trouble-shooter.skyeng.ru')) {
  const diagBtn = document.createElement('button');
  diagBtn.type = 'button';
  diagBtn.id = 'webrtc-diag-floating-btn';
  diagBtn.textContent = '🔍';
  diagBtn.title = 'Диагностика WebRTC';
  diagBtn.setAttribute('aria-label', 'Открыть диагностику WebRTC');
  diagBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        padding: 0;
        border-radius: 50%;
        background-color: #1b283c;
        color: #ffffff;
        font-size: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 10px 28px rgba(3, 9, 22, 0.45);
        z-index: 999999;
        transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        border: 1px solid #3c4d68;
        user-select: none;
    `;

  const setHover = (on) => {
    diagBtn.style.transform = on ? 'scale(1.05)' : 'scale(1)';
    diagBtn.style.backgroundColor = on ? '#293b56' : '#1b283c';
    diagBtn.style.borderColor = on ? '#7799e2' : '#3c4d68';
    diagBtn.style.boxShadow = on
      ? '0 12px 32px rgba(3, 9, 22, 0.55)'
      : '0 10px 28px rgba(3, 9, 22, 0.45)';
  };
  diagBtn.addEventListener('mouseenter', () => setHover(true));
  diagBtn.addEventListener('mouseleave', () => setHover(false));
  diagBtn.addEventListener('focus', () => setHover(true));
  diagBtn.addEventListener('blur', () => setHover(false));

  diagBtn.addEventListener('click', () => {
    runDiagnostics().catch((error) => console.error('[ChMAF:TS] Диагностика:', error));
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

  const WEBRTC_PROBLEM_RE = /зафиксированы проблемы webrtc/i;

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

        // «Зафиксированы проблемы WebRTC» — в список событий не попадают
        // (их слишком много), но общее количество показываем.
        webrtcProblems: [],
        seenWebrtcProblems: new Set(),

        // Периоды подключения с полосы «Устройства пользователя»
        sessions: [],

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
      : `Камера: ${name}${status === "on"
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
        label: `${type === "audio" ? "Аудио" : "Видео"
          }: ${unknown(value) ? "не определён" : value
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

    if (WEBRTC_PROBLEM_RE.test(text)) {
      if (!user.seenWebrtcProblems.has(entry)) {
        user.seenWebrtcProblems.add(entry);
        user.webrtcProblems.push({ ...context });
      }
      return;
    }

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

  // ------------------------------------------------------------
  // Периоды подключения с разных устройств — из полосы
  // «Устройства пользователя» над таблицей логов (app-user-agent-timeline).
  // ------------------------------------------------------------
  const TIME_ONLY_RE = /^\d{1,2}:\d{2}(?::\d{2})?$/;

  function ownText(element) {
    let text = "";
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) text += node.textContent;
    }
    return clean(text);
  }

  function minutesOf(time) {
    const [h, m] = String(time).split(":").map(Number);
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : null;
  }

  // Подсказка ds-tooltip создаётся только при наведении (в .cdk-overlay-pane).
  // Имитируем наведение, ждём её и читаем «браузер <br> ОС».
  async function hoverTooltipLines(bar) {
    const label = clean(bar.textContent);
    bar.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    bar.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));

    let lines = [];
    const started = performance.now();
    while (performance.now() - started < 1200 && !signal.aborted) {
      const tip = [...document.querySelectorAll("ds-tooltip")].pop();
      const content = tip?.querySelector(".content") || tip;
      if (content && clean(content.textContent)) {
        lines = content.innerHTML
          .split(/<br\b[^>]*>/i)
          .map(part => {
            const div = document.createElement("div");
            div.innerHTML = part;
            return clean(div.textContent);
          })
          .filter(Boolean);
        if (!label || lines.some(line => line.toLowerCase().includes(label.toLowerCase()))) break;
      }
      await wait(30);
    }

    bar.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    bar.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
    await wait(60);
    return lines;
  }

  async function readDeviceSessions(found) {
    // Разметка страницы (проверено в Chrome):
    // app-user-agent-timeline
    //   .display-inline-f            — ряд пользователя
    //     .p-10.w-85                 — ID
    //     app-timelines .mw-browser-line
    //       [dstooltip].browser      — «Chrome», «Yandex»… (подсказка: версия + ОС)
    //       .justify-between p, p    — время начала и конца
    const timeline = document.querySelector("app-user-agent-timeline");
    if (!timeline) return;

    const rows = [...timeline.querySelectorAll(".display-inline-f")]
      .filter(row => row.querySelector(".p-10") && row.querySelector(".mw-browser-line"));
    if (!rows.length) return;

    // Пока перебираем подсказки — прячем их, чтобы ничего не мигало
    const hideTips = el("style");
    hideTips.textContent = "ds-tooltip{visibility:hidden!important}";
    document.head.append(hideTips);

    try {
      for (const row of rows) {
        if (signal.aborted) return;

        const idNode = row.querySelector(".p-10");
        const id = idNode.dataset.chmafUid || (/(\d{5,})/.exec(idNode.textContent) || [])[1];
        const user = id && found.get(id);
        if (!user) continue;

        const sessions = [];
        for (const line of row.querySelectorAll(".mw-browser-line")) {
          const bar = line.querySelector("[dstooltip], .browser");
          const times = [...line.querySelectorAll(".justify-between p, .justify-between span")]
            .map(node => clean(node.textContent))
            .filter(text => TIME_ONLY_RE.test(text));
          const label = clean(bar?.textContent) || "Браузер";

          let browser = label;
          let os = "";
          if (bar) {
            const lines = await hoverTooltipLines(bar);
            if (lines.length) {
              browser = lines[0];
              os = lines.slice(1).join(" ");
            }
          }

          sessions.push({ label, browser, os, start: times[0] || null, end: times[1] || null });
        }

        user.sessions = sessions;
      }
    } finally {
      hideTips.remove();
    }
  }

  async function collect() {
    await expandPanels();

    // Роли (П)/(У) приходят из CRM асинхронно: если 🔍 нажали сразу
    // после открытия страницы, дожидаемся ответов (не дольше 3 с),
    // иначе участники попадут в «Участник» без роли.
    if (typeof waitForUserBadges === "function") {
      if (typeof addusersinfo === "function") addusersinfo();
      await waitForUserBadges();
    }

    if (signal.aborted) return [];

    const found = findUsers();

    try {
      await readDeviceSessions(found);
    } catch (error) {
      console.warn("[ChMAF:TS] Не удалось прочитать полосу устройств:", error);
    }

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
  host.classList.add("chmaf-ts-keep"); // тёмная тема страницы не должна перекрашивать окно диагностики
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
    /* Оформление «corporate graphite» — как окна ChMAF (AF_helper, Userinfo, ChatHistory) */
    :host {
      color-scheme: dark;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI Variable Text", "Segoe UI",
        Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 13.5px;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }

    * { box-sizing: border-box; }

    button,
    input { font: inherit; }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(3, 9, 22, .6);
      backdrop-filter: blur(6px);
      pointer-events: auto;
    }

    /* --- Окно --- */
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
      background:
        radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
        #111827;
      border: 1px solid #344258;
      border-radius: 18px;
      box-shadow: 0 26px 70px rgba(3, 9, 22, .6), inset 0 1px rgba(255, 255, 255, .06);
      pointer-events: auto;
    }

    /* --- Шапка: ❌ слева, заголовок, «Обновить» справа --- */
    .header {
      position: relative;
      margin: 0 20px;
      padding: 16px 0 12px;
      border-bottom: 1px solid rgba(66, 104, 201, .15);
      cursor: grab;
      touch-action: none;
      user-select: none;
    }

    .header::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 40%;
      height: 1px;
      background: linear-gradient(90deg, rgba(66, 104, 201, .6), transparent);
    }

    .header:active { cursor: grabbing; }

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

    .topline { gap: 8px; }
    .heading { flex: 1; min-width: 0; }

    .card-head,
    .section-heading,
    .history-head {
      justify-content: space-between;
      gap: 12px;
    }

    h1 {
      margin: 0;
      color: #fefefe;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: .01em;
      text-shadow: 0 1px 2px rgba(0, 0, 0, .5);
    }

    .actions { gap: 8px; flex-shrink: 0; }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 34px;
      padding: 0 12px;
      color: #dce5f5;
      background: #1b283c;
      border: 1px solid #3c4d68;
      border-radius: 9px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, .45);
      transition: background-color .16s ease, border-color .16s ease, transform .16s ease;
    }

    .btn:hover:not(:disabled) {
      color: #fff;
      background: #293b56;
      border-color: #7799e2;
      transform: translateY(-1px);
    }

    .btn:disabled { opacity: .55; cursor: wait; }

    .btn-close {
      justify-content: center;
      width: 34px;
      padding: 0;
      font-size: 15px;
      line-height: 1;
      background: rgba(255, 116, 140, .08);
      border-color: rgba(255, 116, 140, .3);
    }

    .btn-close:hover:not(:disabled) {
      background: rgba(255, 116, 140, .16);
      border-color: rgba(255, 116, 140, .55);
    }

    /* --- Содержимое --- */
    .content {
      min-height: 0;
      overflow: auto;
      overscroll-behavior: contain;
      padding: 14px 20px 18px;
      scrollbar-width: thin;
      scrollbar-color: rgba(66, 104, 201, .4) transparent;
    }

    .content::-webkit-scrollbar,
    .logs::-webkit-scrollbar,
    .history-body::-webkit-scrollbar { width: 4px; }

    .content::-webkit-scrollbar-thumb,
    .logs::-webkit-scrollbar-thumb,
    .history-body::-webkit-scrollbar-thumb { background: rgba(66, 104, 201, .3); border-radius: 8px; }

    /* Вкладки — сегментированный переключатель */
    .tabs {
      display: flex;
      gap: 4px;
      width: fit-content;
      margin-bottom: 12px;
      padding: 4px;
      background: #0d1625;
      border: 1px solid #344258;
      border-radius: 12px;
    }

    .tab {
      height: 32px;
      padding: 0 14px;
      color: #94a3b8;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: background-color .16s ease, color .16s ease;
    }

    .tab:hover { color: #fff; background: rgba(66, 104, 201, .16); }

    .tab.active {
      color: #fff;
      background: #4268c9;
      border-color: #7293ed;
      box-shadow: 0 4px 12px rgba(58, 96, 205, .3);
    }

    .tab[hidden] { display: none; }

    /* Итоги сверху */
    .summary {
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
    }

    .metric {
      display: inline-flex;
      align-items: baseline;
      padding: 7px 12px;
      color: #94a3b8;
      background: #1a2536;
      border: 1px solid #344258;
      border-radius: 10px;
      font-size: 12.5px;
    }

    .metric strong {
      margin-right: 6px;
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
    }

    .search {
      width: min(280px, 100%);
      min-height: 36px;
      margin-left: auto;
      padding: 0 12px;
      color: #edf2fb;
      background: #0d1625;
      border: 1px solid #3a4961;
      border-radius: 10px;
      outline: none;
      transition: background-color .16s ease, border-color .16s ease, box-shadow .16s ease;
    }

    .search::placeholder { color: #7d8ca6; }

    .search:focus {
      background: #142034;
      border-color: #829fff;
      box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
    }

    /* --- Карточки участников --- */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 365px), 1fr));
      align-items: start;
      gap: 14px;
    }

    .card {
      min-width: 0;
      overflow: hidden;
      background: #1a2536;
      border: 1px solid #344258;
      border-radius: 14px;
    }

    .card-head {
      flex-wrap: wrap;
      padding: 14px 16px;
      background: #162133;
      border-bottom: 1px solid #344258;
    }

    .role {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      width: fit-content;
      margin: 0;
      padding: 3px 11px;
      border: 1px solid;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
    }

    /* Ученик — красный, преподаватель — синий: как подписи (У)/(П) в журнале */
    .role.role-student { color: #fca5a5; background: rgba(220, 20, 60, .12); border-color: rgba(220, 20, 60, .35); }
    .role.role-student::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #fca5a5; }
    .role.role-teacher { color: #a9c0ff; background: rgba(66, 104, 201, .16); border-color: rgba(119, 153, 226, .45); }
    .role.role-teacher::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: #a9c0ff; }
    .role.role-unknown { color: #cbd5e1; background: rgba(148, 163, 184, .12); border-color: rgba(148, 163, 184, .3); }

    .id {
      display: block;
      max-width: 100%;
      margin-top: 5px;
      overflow-wrap: anywhere;
      color: #94a3b8;
      font: 600 12px 'JetBrains Mono', ui-monospace, Consolas, monospace;
    }

    .badges { display: flex; flex-wrap: wrap; gap: 6px; }

    .badge {
      padding: 4px 10px;
      border: 1px solid;
      border-radius: 999px;
      white-space: nowrap;
      font-size: 11.5px;
      font-weight: 700;
    }

    .badge.ok { color: #86efac; background: rgba(69, 199, 52, .12); border-color: rgba(69, 199, 52, .35); }
    .badge.bad { color: #fca5a5; background: rgba(220, 20, 60, .12); border-color: rgba(220, 20, 60, .35); }
    .badge.warn { color: #fdba74; background: rgba(255, 140, 0, .12); border-color: rgba(255, 140, 0, .38); cursor: help; }

    .section { padding: 14px 16px 0; }
    .last-section { padding-bottom: 16px; }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      margin: 0 0 8px;
      color: #fefefe;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .section-title::after {
      content: '';
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(66, 104, 201, .4), transparent);
    }

    .facts {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .fact {
      min-width: 0;
      padding: 9px 11px;
      background: rgba(0, 0, 0, .22);
      border: 1px solid rgba(66, 104, 201, .15);
      border-left: 3px solid #3c4d68;
      border-radius: 10px;
    }

    .fact.good { border-left-color: #86efac; }
    .fact.warn { border-left-color: #fca5a5; background: rgba(220, 20, 60, .07); }
    .fact.missing { border-left-color: #fdba74; background: rgba(255, 140, 0, .07); }
    .fact.missing .fact-label { color: #fdba74; }
    .fact.missing .fact-value { color: #fed7aa; font-weight: 700; }

    .fact-label {
      margin-bottom: 4px;
      color: #94a3b8;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .04em;
    }

    .fact-value {
      overflow-wrap: anywhere;
      color: #f1f5f9;
      font-size: 12.5px;
      font-weight: 600;
      line-height: 1.45;
    }

    .device-line { display: flex; align-items: flex-start; gap: 8px; }
    .mic-icon { flex: none; color: #7d8ca6; }
    .good .mic-icon { color: #86efac; }
    .warn .mic-icon { color: #fca5a5; }

    .device-hint {
      display: block;
      margin-top: 6px;
      color: #fca5a5;
      font-size: 11.5px;
      font-weight: 500;
      line-height: 1.45;
    }

    .card-tools { flex-wrap: wrap; gap: 6px; padding: 12px 16px 0; }

    .tool-btn,
    .sort-btn {
      color: #dce5f5;
      background: #1b283c;
      border: 1px solid #3c4d68;
      border-radius: 9px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      transition: background-color .16s ease, border-color .16s ease;
    }

    .tool-btn { min-height: 30px; padding: 0 10px; }
    .sort-btn { min-height: 26px; padding: 0 8px; white-space: nowrap; font-size: 11.5px; }

    .tool-btn:hover,
    .sort-btn:hover { color: #fff; background: #293b56; border-color: #7799e2; }

    .badge.info { color: #a9c0ff; background: rgba(66, 104, 201, .16); border-color: rgba(119, 153, 226, .45); cursor: help; }

    /* Периоды подключения с разных устройств */
    .sessions { margin: 0; padding: 0; list-style: none; }

    .session {
      padding: 7px 10px;
      background: rgba(0, 0, 0, .22);
      border: 1px solid rgba(66, 104, 201, .15);
      border-left: 3px solid #617fbd;
      border-radius: 10px;
    }

    .session + .session { margin-top: 6px; }

    .session-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .session-device { color: #f1f5f9; font-size: 13px; font-weight: 700; overflow-wrap: anywhere; }
    .session-time { flex: none; color: #a9c0ff; font: 700 12.5px 'JetBrains Mono', ui-monospace, Consolas, monospace; }
    .session-os { margin-top: 2px; color: #94a3b8; font-size: 12px; }

    .session-gap {
      margin: 4px 0 4px 12px;
      padding-left: 10px;
      color: #fdba74;
      border-left: 2px dashed rgba(253, 186, 116, .5);
      font-size: 12px;
      font-weight: 600;
    }

    /* Строка «Зафиксированы проблемы WebRTC: N» над событиями */
    .webrtc-line {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px 10px;
      margin-bottom: 6px;
      padding: 7px 10px;
      border: 1px solid;
      border-left-width: 3px;
      border-radius: 9px;
      font-size: 12.5px;
      cursor: help;
    }

    .webrtc-line.has { color: #fed7aa; background: rgba(255, 140, 0, .08); border-color: rgba(255, 140, 0, .3); border-left-color: #fdba74; }
    .webrtc-line.none { color: #94a3b8; background: rgba(0, 0, 0, .18); border-color: rgba(66, 104, 201, .15); border-left-color: #3c4d68; }
    .webrtc-line-label { flex: 1; min-width: 0; }
    .webrtc-line-count { color: #fff; font-weight: 800; font-variant-numeric: tabular-nums; }
    .webrtc-line.none .webrtc-line-count { color: #94a3b8; font-weight: 600; }
    .webrtc-line-range { color: #94a3b8; font: 600 11.5px 'JetBrains Mono', ui-monospace, Consolas, monospace; }

    /* Журнал событий */
    .logs {
      max-height: 210px;
      overflow: auto;
      margin: 0;
      padding: 0 4px 0 0;
      list-style: none;
      scrollbar-width: thin;
      scrollbar-color: rgba(66, 104, 201, .4) transparent;
    }

    .log {
      margin-top: 6px;
      padding: 7px 10px;
      color: #fecdd3;
      background: rgba(220, 20, 60, .07);
      border-left: 3px solid #fca5a5;
      border-radius: 0 8px 8px 0;
      overflow-wrap: anywhere;
      font: 12.5px/1.5 'JetBrains Mono', ui-monospace, Consolas, monospace;
    }

    .log.platform {
      color: #c7d6ff;
      background: rgba(66, 104, 201, .1);
      border-left-color: #92afff;
    }

    .empty {
      padding: 12px;
      color: #94a3b8;
      border: 1px dashed rgba(66, 104, 201, .3);
      border-radius: 10px;
      font-size: 12.5px;
      line-height: 1.5;
    }

    .notice { min-height: 17px; margin: 12px 0 0; color: #7d8ca6; font-size: 11.5px; }

    /* --- Бан серверов --- */
    .ban-list { margin: 0; padding: 0; list-style: none; }
    .ban-entry { padding: 12px 16px; border-bottom: 1px solid rgba(52, 66, 88, .6); }
    .ban-entry:last-child { border-bottom: 0; }

    .ban-time {
      display: block;
      margin-bottom: 6px;
      color: #94a3b8;
      font: 700 11.5px 'JetBrains Mono', ui-monospace, Consolas, monospace;
    }

    .ban-server {
      display: block;
      margin-top: 6px;
      padding: 8px 10px;
      color: #fca5a5;
      background: rgba(220, 20, 60, .08);
      border: 1px solid rgba(220, 20, 60, .3);
      border-radius: 9px;
      overflow-wrap: anywhere;
      font: 12px/1.5 'JetBrains Mono', ui-monospace, Consolas, monospace;
    }

    /* --- Окно истории (микрофон / камера / кодеки) --- */
    .history-overlay {
      position: fixed;
      inset: 0;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: rgba(3, 9, 22, .6);
      backdrop-filter: blur(4px);
      pointer-events: auto;
    }

    .history-window {
      width: min(620px, 100%);
      max-height: min(78vh, 760px);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #111827;
      border: 1px solid #344258;
      border-radius: 18px;
      box-shadow: 0 26px 70px rgba(3, 9, 22, .6);
    }

    .history-head {
      flex-direction: row-reverse;
      justify-content: flex-end;
      position: relative;
      margin: 0 18px;
      padding: 16px 0 12px;
      border-bottom: 1px solid rgba(66, 104, 201, .15);
    }

    .history-title { margin: 0; color: #fefefe; font-size: 15px; font-weight: 700; }
    .history-subtitle { margin: 4px 0 0; color: #94a3b8; font-size: 11.5px; overflow-wrap: anywhere; }

    .history-close {
      flex: none;
      width: 34px;
      height: 34px;
      color: #ffb0be;
      background: rgba(255, 116, 140, .08);
      border: 1px solid rgba(255, 116, 140, .3);
      border-radius: 9px;
      cursor: pointer;
      font-size: 15px;
    }

    .history-close:hover { background: rgba(255, 116, 140, .16); border-color: rgba(255, 116, 140, .55); }

    .history-body {
      min-height: 0;
      overflow: auto;
      padding: 14px 18px 18px;
      scrollbar-width: thin;
      scrollbar-color: rgba(66, 104, 201, .4) transparent;
    }

    .history-group-title {
      margin: 4px 0 12px;
      color: #fefefe;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .history-group-title:not(:first-child) { margin-top: 22px; }

    .timeline {
      margin: 0;
      padding: 0 0 0 20px;
      list-style: none;
      border-left: 2px solid #344258;
    }

    .timeline-item { position: relative; margin: 0 0 14px; padding: 0 0 0 12px; }

    .timeline-item::before {
      content: "";
      position: absolute;
      top: 5px;
      left: -26px;
      width: 10px;
      height: 10px;
      background: #7799e2;
      border: 2px solid #111827;
      border-radius: 50%;
      box-shadow: 0 0 0 1px #344258;
    }

    .timeline-item.good::before { background: #86efac; }
    .timeline-item.warn::before { background: #fca5a5; }

    .timeline-time {
      display: block;
      margin-bottom: 3px;
      color: #94a3b8;
      font: 700 11.5px 'JetBrains Mono', ui-monospace, Consolas, monospace;
    }

    .timeline-label { color: #f1f5f9; font-size: 13px; font-weight: 600; overflow-wrap: anywhere; }
    .timeline-note { margin-top: 4px; color: #94a3b8; font-size: 11.5px; line-height: 1.4; }

    button:focus-visible,
    input:focus-visible { outline: 2px solid #9ab5ff; outline-offset: 2px; }

    @media (max-width: 650px) {
      .panel { max-height: calc(100vh - 20px); border-radius: 16px; }
      .header { margin: 0 12px; }
      .btn-label { display: none; }
      .btn { padding: 0 9px; }
      .content { padding: 11px 12px 14px; }
      .search { width: 100%; margin-left: 0; }
      .section-heading { align-items: flex-start; }
    }

    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; }
    }
  `;

  // Во время перетаскивания окна размытие всей страницы под подложкой
  // пересчитывалось бы на каждом кадре — на время drag его выключаем.
  style.textContent += `
    .backdrop.is-dragging {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
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

  heading.className = "heading";
  heading.append(el("h1", "", "🔍 Диагностика WebRTC"));

  const actions = el("div", "actions");
  const refreshButton = el("button", "btn");

  refreshButton.type = "button";
  refreshButton.title = "Обновить данные";
  refreshButton.setAttribute("aria-label", "Обновить данные");
  refreshButton.append("♻️ ", el("span", "btn-label", "Обновить"));

  const closeButton = el("button", "btn btn-close", "❌");
  closeButton.type = "button";
  closeButton.title = "Закрыть";
  closeButton.setAttribute("aria-label", "Закрыть");

  actions.append(refreshButton);
  topline.append(closeButton, heading, actions);
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

  function webrtcProblemsSummary(user) {
    const list = [...user.webrtcProblems].sort((a, b) => compareByTime(a, b, false));
    const count = list.length;
    const range = count
      ? (count > 1 ? `${list[0].time} → ${list[count - 1].time}` : list[0].time)
      : "";
    return { count, range };
  }

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function deviceIcon(session) {
    return /android|ios|iphone|ipad/i.test(`${session.os} ${session.browser}`) ? "📱" : "💻";
  }

  function addSessionsSection(card, user) {
    const sessions = user.sessions || [];
    if (!sessions.length) return;

    const section = el("section", "section");
    const devices = new Set(sessions.map(s => `${s.browser}|${s.os}`.toLowerCase()));
    const title = sessions.length > 1
      ? `Подключения: ${sessions.length} · ${devices.size > 1 ? "разные устройства" : "одно устройство"}`
      : "Подключение";
    section.append(el("h3", "section-title", title));

    const list = el("ol", "sessions");

    sessions.forEach((session, index) => {
      if (index > 0) {
        const prev = sessions[index - 1];
        const gap = minutesOf(session.start) - minutesOf(prev.end);
        const changed = `${prev.browser}|${prev.os}` !== `${session.browser}|${session.os}`;
        if (Number.isFinite(gap) || changed) {
          const parts = [];
          if (Number.isFinite(gap) && gap > 0) parts.push(`перерыв ${gap} мин`);
          if (Number.isFinite(gap) && gap <= 0) parts.push("переподключение без перерыва");
          if (changed) parts.push("смена устройства/браузера");
          list.append(el("li", "session-gap", `⏸ ${parts.join(" · ")}`));
        }
      }

      const item = el("li", "session");
      const head = el("div", "session-head");
      head.append(
        el("span", "session-device", `${deviceIcon(session)} ${session.browser}`),
        el("span", "session-time", `${session.start || "?"} → ${session.end || "?"}`)
      );
      item.append(head);
      if (session.os) item.append(el("div", "session-os", session.os));
      list.append(item);
    });

    section.append(list);
    card.append(section);
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

    // Общее число записей «Зафиксированы проблемы WebRTC» — отдельной строкой над событиями
    if (isError) {
      const { count, range } = webrtcProblemsSummary(user);
      const line = el("div", `webrtc-line ${count ? "has" : "none"}`);
      line.append(
        el("span", "webrtc-line-label", "«Зафиксированы проблемы WebRTC»"),
        el("strong", "webrtc-line-count",
          count ? `${count} ${plural(count, "запись", "записи", "записей")}` : "нет")
      );
      if (range) line.append(el("span", "webrtc-line-range", range));
      line.title = "Сколько раз в журнале участника встретилась запись «Зафиксированы проблемы WebRTC». " +
        "Сами записи в список событий не выводятся — их обычно очень много.";
      section.append(line);
    }

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

    const close = el("button", "history-close", "❌");
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
    const badges = el("div", "badges");
    badges.append(el("span", `badge ${user.errors.length ? "bad" : "ok"}`, user.errors.length ? `Событий: ${user.errors.length}` : "Событий не найдено"));
    if ((user.sessions || []).length > 1) {
      const devicesCount = new Set(user.sessions.map(s => `${s.browser}|${s.os}`.toLowerCase())).size;
      const badge = el("span", "badge info", devicesCount > 1 ? `Устройств: ${devicesCount}` : `Подключений: ${user.sessions.length}`);
      badge.title = user.sessions.map(s => `${s.start || "?"}–${s.end || "?"} ${s.browser}${s.os ? " · " + s.os : ""}`).join("\n");
      badges.append(badge);
    }

    const webrtcCount = user.webrtcProblems.length;
    if (webrtcCount) {
      const badge = el("span", "badge warn", `WebRTC: ${webrtcCount}`);
      badge.title = `«Зафиксированы проблемы WebRTC» — ${webrtcCount} ${plural(webrtcCount, "запись", "записи", "записей")}`;
      badges.append(badge);
    }
    cardHead.append(identity, badges);
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

    addSessionsSection(card, user);

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

  function metric(label, value, title = "") {
    const result = el("div", "metric");
    if (title) result.title = title;
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
      metric("проблем WebRTC", users.reduce((sum, user) => sum + user.webrtcProblems.length, 0),
        "Записей «Зафиксированы проблемы WebRTC» у всех участников"),
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
  // Карточки перестраиваются целиком, поэтому не на каждую букву,
  // а после короткой паузы в наборе
  let searchTimer = 0;
  search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = search.value.trim();
      renderGrid();
    }, 150);
  }, { signal });
  signal.addEventListener("abort", () => clearTimeout(searchTimer));

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;

    // Первый Esc в непустом поиске очищает поиск, а не закрывает окно
    if (shadow.activeElement === search && search.value) {
      clearTimeout(searchTimer);
      search.value = "";
      searchQuery = "";
      renderGrid();
      return;
    }

    if (activeHistory) {
      activeHistory.remove();
      activeHistory = null;
    } else {
      destroy();
    }
  }, { signal });

  // Перемещение основного окна.
  // Размеры окна считываем один раз в начале (а не на каждом движении),
  // позицию применяем не чаще одного раза за кадр.
  let drag = null;
  let dragFrame = 0;

  function applyDrag() {
    dragFrame = 0;
    if (!drag) return;
    const left = Math.min(drag.maxLeft, Math.max(0, drag.left + drag.x - drag.startX));
    const top = Math.min(drag.maxTop, Math.max(0, drag.top + drag.y - drag.startY));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  header.addEventListener("pointerdown", event => {
    if (event.button !== 0 || event.target.closest("button, input")) return;
    const rect = panel.getBoundingClientRect();
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top,
      maxLeft: Math.max(0, innerWidth - rect.width),
      maxTop: Math.max(0, innerHeight - rect.height)
    };
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.transform = "none";
    panel.style.willChange = "left, top";
    backdrop.classList.add("is-dragging");
    header.style.cursor = "grabbing";
    header.setPointerCapture(event.pointerId);
  }, { signal });

  header.addEventListener("pointermove", event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (!dragFrame) dragFrame = requestAnimationFrame(applyDrag);
  }, { signal });

  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    header.addEventListener(type, () => {
      if (!drag) return;
      if (dragFrame) {
        cancelAnimationFrame(dragFrame);
        applyDrag();
      }
      drag = null;
      panel.style.willChange = "";
      backdrop.classList.remove("is-dragging");
      header.style.cursor = "";
    }, { signal });
  }

  await refresh();
}