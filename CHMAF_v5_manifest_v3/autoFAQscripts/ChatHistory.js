// ============================================================
// AFG CHAT HISTORY
//
// Требуется из остального расширения:
//   afApiFetch(url, options)
//   sendAnswersRequest(payload)
//
// Используется при наличии:
//   operatorsarray
//   operatorId
//   createAndShowButton(message, type)
//   copyToClipboard(text)
// ============================================================

(() => {
  "use strict";

  const ROOT_ID = "AF_ChatHis";
  const STYLE_ID = "afg-chat-history-styles";
  const SERVICE_ID = "361c681b-340a-4e47-9342-c7309e27e7b5";
  const API = "https://skyeng.autofaq.ai/api";

  if (document.getElementById(ROOT_ID)) return;

  const state = {
    conversation: null,
    results: [],
    resultsTitle: "Результаты поиска",
    operatorRows: [],
    selectedOperatorId: "",
    requestId: 0,
    busy: new Set(),
    gallery: null,
    theme:
      localStorage.getItem("afgChatHistoryTheme") === "light"
        ? "light"
        : "dark",
  };

  const $ = (id) => document.getElementById(id);

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function notify(message, type = "message") {
    if (typeof createAndShowButton === "function") {
      createAndShowButton(message, type);
      return;
    }

    const toast = document.createElement("div");
    toast.className = "afg-toast";
    toast.textContent = message;

    document.body.append(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  function setBusy(id, busy) {
    const button = $(id);
    if (!button) return;

    button.disabled = busy;

    if (busy) state.busy.add(id);
    else state.busy.delete(id);
  }

  function parseApiDate(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    // API истории иногда возвращает дату с суффиксом
    // вроде [Europe/Moscow], который Date не понимает.
    const normalized =
      typeof value === "string"
        ? value.replace(/\[[^\]]*]/g, "").trim()
        : value;

    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function dateMillis(value) {
    return parseApiDate(value)?.getTime() ?? null;
  }

  function readableDate(value) {
    const date = parseApiDate(value);
    if (!date) return "Дата неизвестна";

    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function readableTime(value) {
    const date = parseApiDate(value);
    if (!date) return "—";

    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  }

  function readableDateTime(value) {
    return `${readableDate(value)} · ${readableTime(value)}`;
  }

  function dateValue(date) {
    const pad = (n) => String(n).padStart(2, "0");

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join("-");
  }

  function setDefaultDates() {
    const today = new Date();
    const monthAgo = new Date(today);

    monthAgo.setMonth(monthAgo.getMonth() - 1);

    $("dateFromChHis").value = dateValue(monthAgo);
    $("dateToChHis").value = dateValue(today);
  }

  function dateRange() {
    const from = $("dateFromChHis").value;
    const to = $("dateToChHis").value;

    if (!from || !to) {
      throw new Error("Выберите обе даты");
    }

    if (from > to) {
      throw new Error("Дата начала позже даты окончания");
    }

    const start = new Date(`${from}T00:00:00`);
    const end = new Date(`${to}T00:00:00`);

    end.setDate(end.getDate() + 1);
    end.setMilliseconds(-1);

    return {
      tsFrom: start.toISOString(),
      tsTo: end.toISOString(),
    };
  }

  function duration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    if (hours) {
      return `${hours} ч ${String(minutes).padStart(2, "0")} мин`;
    }

    if (minutes) {
      return `${minutes} мин ${seconds} сек`;
    }

    return `${seconds} сек`;
  }

  async function apiFetch(url, options) {
    if (typeof afApiFetch !== "function") {
      throw new Error("Функция afApiFetch недоступна");
    }

    const response = await afApiFetch(url, options);

    if (!response?.ok) {
      throw new Error(`Ошибка API: HTTP ${response?.status ?? "?"}`);
    }

    return response;
  }

  async function apiJson(url, options) {
    const response = await apiFetch(url, options);
    return response.json();
  }

  function safeUrl(raw) {
    try {
      const url = new URL(String(raw ?? ""), location.href);

      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function mediaType(url) {
    try {
      const path = new URL(url).pathname.toLowerCase();

      if (/\.(png|jpe?g|gif|webp|avif)$/.test(path)) {
        return "image";
      }

      if (/\.(mp4|webm|mov|mkv)$/.test(path)) {
        return "video";
      }

      if (/\.(mp3|wav|ogg|oga|m4a)$/.test(path)) {
        return "audio";
      }
    } catch {
      // Некорректный URL далее выводится обычным текстом.
    }

    return "file";
  }

  function mediaNode(rawUrl, label = "Открыть файл") {
    const url = safeUrl(rawUrl);

    if (!url) {
      return document.createTextNode(label);
    }

    const type = mediaType(url);

    if (type === "image") {
      const image = document.createElement("img");

      image.className = "afg-media-image";
      image.src = url;
      image.dataset.full = url;
      image.alt = label === "Открыть файл" ? "Изображение из диалога" : label;
      image.loading = "lazy";

      return image;
    }

    if (type === "video") {
      const video = document.createElement("video");

      video.className = "afg-media";
      video.src = url;
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;

      return video;
    }

    if (type === "audio") {
      const audio = document.createElement("audio");

      audio.className = "afg-media";
      audio.src = url;
      audio.controls = true;
      audio.preload = "none";

      return audio;
    }

    const link = document.createElement("a");

    link.className = "afg-file-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `↗ ${label}`;

    return link;
  }

  // Сообщения API очищаются при переносе в DOM:
  // исходный HTML сообщения никогда не вставляется напрямую.
  function messageContent(value) {
    const result = document.createElement("div");
    result.className = "afg-message-content";

    const parsed = new DOMParser().parseFromString(
      `<div>${String(value ?? "")}</div>`,
      "text/html"
    );

    const allowedTags = new Set([
      "P",
      "DIV",
      "SPAN",
      "BR",
      "B",
      "STRONG",
      "I",
      "EM",
      "U",
      "S",
      "UL",
      "OL",
      "LI",
      "BLOCKQUOTE",
      "PRE",
      "CODE",
    ]);

    const blockedTags = new Set([
      "SCRIPT",
      "STYLE",
      "IFRAME",
      "OBJECT",
      "EMBED",
      "SVG",
      "MATH",
      "FORM",
      "INPUT",
      "BUTTON",
      "META",
      "LINK",
    ]);

    function clean(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || "";
        const trimmed = text.trim();

        if (/^https?:\/\/[^\s<>"']+$/i.test(trimmed) && safeUrl(trimmed)) {
          const wrapper = document.createElement("span");
          const start = text.indexOf(trimmed);

          wrapper.append(
            document.createTextNode(text.slice(0, start)),
            mediaNode(trimmed),
            document.createTextNode(text.slice(start + trimmed.length))
          );

          return wrapper;
        }

        return document.createTextNode(text);
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return document.createDocumentFragment();
      }

      if (blockedTags.has(node.tagName)) {
        return document.createDocumentFragment();
      }

      if (node.tagName === "A") {
        const href = safeUrl(node.getAttribute("href"));
        const label = node.textContent?.trim() || "Открыть ссылку";

        return href ? mediaNode(href, label) : document.createTextNode(label);
      }

      if (node.tagName === "IMG") {
        const src = safeUrl(node.getAttribute("src"));

        return src
          ? mediaNode(src, node.getAttribute("alt") || "Изображение")
          : document.createDocumentFragment();
      }

      const output = allowedTags.has(node.tagName)
        ? document.createElement(node.tagName.toLowerCase())
        : document.createDocumentFragment();

      for (const child of node.childNodes) {
        output.append(clean(child));
      }

      return output;
    }

    const source = parsed.body.firstElementChild;

    if (source) {
      for (const child of source.childNodes) {
        result.append(clean(child));
      }
    }

    return result;
  }

  // Техническая информация содержит HTML. Преобразуем его в
  // обычный текст с переносами, не отображая теги и не выполняя HTML.
  function techInfoAsText(value) {
    if (value === null || value === undefined || value === "") {
      return "Нет данных";
    }

    if (typeof value !== "string") {
      return JSON.stringify(value, null, 2);
    }

    const doc = new DOMParser().parseFromString(value, "text/html");

    const parts = [];

    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        parts.push(node.textContent || "");
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;

      if (
        ["SCRIPT", "STYLE", "IFRAME", "OBJECT", "SVG", "MATH"].includes(
          node.tagName
        )
      ) {
        return;
      }

      if (node.tagName === "BR") {
        parts.push("\n");
        return;
      }

      const isBlock = ["P", "DIV", "LI"].includes(node.tagName);

      if (isBlock && parts.length) parts.push("\n");

      for (const child of node.childNodes) {
        walk(child);
      }

      if (isBlock) parts.push("\n");
    }

    for (const child of doc.body.childNodes) {
      walk(child);
    }

    return (
      parts
        .join("")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/ *\n */g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim() || "Нет данных"
    );
  }

  function normalizedOperatorName(value) {
    return String(value ?? "")
      .trim()
      .replace(/\s*[-–—]\s*/g, "-")
      .replace(/\s+/g, " ")
      .toLocaleLowerCase("ru-RU");
  }

  function operatorGroup(fullName) {
    const name = String(fullName ?? "").trim();

    // Длинные префиксы должны проверяться раньше "ТП".
    const match = name.match(
      /^(ТП ОС|ТПPrem|Teachers Care|Prem|Sales|ТП|КЦ|КМ|ТС)\s*[-–—]/i
    );

    return match?.[1]?.toLocaleLowerCase("ru-RU") || null;
  }

  function currentOperatorName() {
    return (
      document
        .querySelector(".user_menu-dropdown-user_name")
        ?.textContent?.trim() || ""
    );
  }

  function currentOperatorId(rows = []) {
    // В зависимости от способа загрузки расширения operatorId
    // может быть доступен как обычная переменная, но не через
    // globalThis.
    if (typeof operatorId !== "undefined" && operatorId) {
      return String(operatorId);
    }

    if (globalThis.operatorId) {
      return String(globalThis.operatorId);
    }

    // Запасной путь — только точное совпадение полного имени.
    // Выбирать первого оператора группы небезопасно.
    const name = normalizedOperatorName(currentOperatorName());

    if (!name) return null;

    const matches = rows.filter(
      (row) => normalizedOperatorName(row?.operator?.fullName) === name
    );

    return matches.length === 1 ? String(matches[0].operator.id) : null;
  }

  function operatorName(id, fallback = "Оператор") {
    const sources = [];

    if (
      typeof operatorsarray !== "undefined" &&
      Array.isArray(operatorsarray)
    ) {
      sources.push(operatorsarray);
    }

    if (
      Array.isArray(globalThis.operatorsarray) &&
      !sources.includes(globalThis.operatorsarray)
    ) {
      sources.push(globalThis.operatorsarray);
    }

    sources.push(state.operatorRows);

    for (const rows of sources) {
      const found = rows.find(
        (row) => String(row?.operator?.id) === String(id)
      );

      if (found?.operator?.fullName) {
        return found.operator.fullName;
      }
    }

    return fallback;
  }

  function deptByOperator(id) {
    if (!id) return null;

    const name = operatorName(id, "");
    const match = name.match(
      /^(ТП ОС|ТПPrem|Teachers Care|Prem|Sales|ТП|КЦ|КМ|ТС)\s*[-–—]/i
    );

    return match?.[1] || null;
  }

  const techCommentPattern =
    /^\s*(?:routing[\s\d.:#-]*|final\s*:|итого на данном этапе|route(?:s)?\b[^\n]*(?:\bhdi\b|чатбота|кейс))/i;

  function isTechComment(message) {
    if (message.operatorId !== "autoFAQ") return false;

    const text = String(message.txt ?? "")
      .replace(/<[^>]*>/g, " ")
      .trim();

    return techCommentPattern.test(text);
  }

  function timeline(messages) {
    const markers = new Map();
    const segments = [];

    let current = null;
    let dialogStart = null;

    messages.forEach((message, index) => {
      const ts = dateMillis(message.ts);
      if (ts === null) return;

      if (message.tpe === "Event" && message.eventTpe === "NewConversation") {
        dialogStart = ts;
      }

      if (message.tpe === "Event" && message.eventTpe === "CloseConversation") {
        if (current) {
          current.end = ts;
          current.active = false;
          segments.push(current);
          current = null;
        }

        return;
      }

      let nextDept = null;

      if (
        message.tpe === "Event" &&
        ["AssignToOperator", "CreatedByOperator"].includes(message.eventTpe)
      ) {
        nextDept = deptByOperator(message.payload?.oid);
      }

      if (["AnswerOperator", "OperatorComment"].includes(message.tpe)) {
        nextDept = deptByOperator(message.operatorId) || nextDept;
      }

      if (!nextDept) return;

      if (!current) {
        current = {
          dept: nextDept,
          start: ts,
          end: ts,
          active: true,
        };

        return;
      }

      if (current.dept === nextDept) return;

      current.end = ts;
      current.active = false;
      segments.push(current);

      markers.set(index, {
        from: current.dept,
        to: nextDept,
        start: current.start,
        end: ts,
      });

      current = {
        dept: nextDept,
        start: ts,
        end: ts,
        active: true,
      };
    });

    if (current) {
      const lastTs = messages.length
        ? dateMillis(messages[messages.length - 1].ts)
        : null;

      current.end = Math.max(current.start, lastTs ?? current.start);

      segments.push(current);
    }

    // Если за весь диалог определён только один отдел,
    // считаем время с события начала диалога.
    if (segments.length === 1 && dialogStart !== null) {
      segments[0].start = Math.min(segments[0].start, dialogStart);
    }

    return {
      markers,
      last: segments.at(-1) || null,
    };
  }

  function deptLine(info, isFinal = false) {
    const row = document.createElement("div");
    row.className = "afg-dept-line";

    const caption = document.createElement("div");
    caption.className = "afg-dept-caption";
    caption.textContent = isFinal
      ? "ИТОГ ПО ПОСЛЕДНЕМУ ОТДЕЛУ"
      : "ВРЕМЯ ДО ПЕРЕДАЧИ";

    const main = document.createElement("div");
    main.className = "afg-dept-main";

    const from = document.createElement("span");
    from.className = "afg-dept-chip";
    from.textContent = isFinal ? info.dept : info.from;

    const elapsed = document.createElement("strong");
    elapsed.className = "afg-dept-duration";
    elapsed.textContent = duration(info.end - info.start);

    main.append(from, elapsed);

    if (!isFinal) {
      const arrow = document.createElement("span");
      arrow.className = "afg-dept-arrow";
      arrow.textContent = "→";

      const to = document.createElement("span");
      to.className = "afg-dept-chip";
      to.textContent = info.to;

      main.append(arrow, to);
    } else {
      const status = document.createElement("span");
      status.className = "afg-dept-status";
      status.textContent = info.active
        ? "последний этап истории"
        : "до закрытия";

      main.append(status);
    }

    const period = document.createElement("div");
    period.className = "afg-dept-period";
    period.textContent =
      `${readableDateTime(info.start)} → ` + readableDateTime(info.end);

    row.append(caption, main, period);
    return row;
  }

  function eventText(message) {
    const payload = message.payload || {};

    switch (message.eventTpe) {
      case "NewConversation":
        return "Начат новый диалог";

      case "FirstTimeInQueue":
        return "Диалог попал в очередь";

      case "RunScenario":
        return "Запущен сценарий";

      case "RunIntegration":
        return payload.name
          ? `Запущена интеграция ${payload.name}`
          : "Запущена интеграция";

      case "FinishIntegration":
        return "Интеграция завершена";

      case "CreatedByOperator":
        return `${operatorName(payload.oid)} открыл(а) диалог`;

      case "AssignToOperator":
        return payload.oid
          ? `Диалог назначен: ${operatorName(payload.oid)}`
          : "Назначение оператора изменено";

      case "CloseConversation":
        if (payload.sender === "userAnswerTimer") {
          return "Автозакрытие: нет активности";
        }

        if (payload.src === "delivery") {
          return "Диалог закрыт рассылкой";
        }

        if (payload.src === "pause") {
          return "Автозакрытие после паузы";
        }

        return payload.sender
          ? `${operatorName(payload.sender)} закрыл(а) диалог`
          : "Диалог закрыт";

      default:
        return "";
    }
  }

  function messageNode(message, userName) {
    let kind;
    let author;

    switch (message.tpe) {
      case "Question":
        kind = "user";
        author = userName;
        break;

      case "AnswerOperator":
        kind = "oper";
        author = operatorName(message.operatorId);
        break;

      case "OperatorComment":
        if (isTechComment(message)) return null;

        kind = "comment";
        author =
          message.operatorId === "autoFAQ"
            ? "autoFAQ"
            : operatorName(message.operatorId);
        break;

      case "AnswerOperatorWithBot":
      case "AnswerOperatorQuickReply":
      case "AnswerSystem":
      case "AnswerBot":
      case "AnswerChatterbox":
        kind = "bot";
        author = "AutoFAQ bot";
        break;

      default:
        return null;
    }

    const card = document.createElement("article");
    card.className = `afg-msg afg-msg-${kind}`;

    const header = document.createElement("div");
    header.className = "afg-msg-header";

    const name = document.createElement("span");
    name.className = "afg-msg-author";
    name.textContent = author;

    const date = document.createElement("span");
    date.className = "afg-msg-date";
    date.textContent = readableDateTime(message.ts);

    header.append(name, date);
    card.append(header, messageContent(message.txt));

    return card;
  }

  const styles = document.createElement("style");
  styles.id = STYLE_ID;

  styles.textContent = `
        .afg-panel,
        .afg-panel *,
        .afg-gallery,
        .afg-gallery * {
            box-sizing: border-box;
        }

        .afg-panel {
            --bg: #0d1423;
            --surface: #141d30;
            --surface-2: #19253a;
            --surface-hover: #213048;
            --line: rgba(197, 219, 255, .12);
            --text: #eef5ff;
            --muted: #a4b3ca;
            --subtle: #8799b3;
            --accent: #61d9ed;
            --accent-bg: rgba(69, 208, 231, .12);
            --green: #6dd9ad;
            --amber: #f2c777;

            position: fixed;
            top: 0;
            right: 0;
            z-index: 1000000;
            display: none;
            flex-direction: column;
            width: min(480px, 100vw);
            height: 100vh;
            height: 100dvh;
            overflow: hidden;
            isolation: isolate;
            color: var(--text);
            background:
                radial-gradient(
                    circle at 95% -10%,
                    rgba(73, 188, 220, .12),
                    transparent 32%
                ),
                linear-gradient(165deg, #111b2d, var(--bg) 56%);
            border-left: 1px solid rgba(147, 221, 245, .18);
            box-shadow: -20px 0 70px rgba(0, 0, 0, .46);
            font: 14px/1.5 Inter, -apple-system,
                BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .afg-panel.afg-light {
            --bg: #d9e2eb;
            --surface: #e9eff5;
            --surface-2: #dce6ef;
            --surface-hover: #d0deea;
            --line: rgba(33, 57, 84, .16);
            --text: #142338;
            --muted: #40566d;
            --subtle: #536a81;
            --accent: #08657d;
            --accent-bg: rgba(8, 101, 125, .11);
            --green: #087253;
            --amber: #8c611a;

            background:
                radial-gradient(
                    circle at 95% -10%,
                    rgba(48, 153, 178, .10),
                    transparent 35%
                ),
                var(--bg);
            box-shadow: -18px 0 55px rgba(24, 42, 68, .17);
        }

        .afg-panel button,
        .afg-panel input,
        .afg-panel select,
        .afg-panel textarea {
            font: inherit;
        }

        .afg-panel button {
            cursor: pointer;
        }

        .afg-panel button:disabled {
            opacity: .55;
            cursor: wait;
        }

        .afg-panel [hidden] {
            display: none !important;
        }

        .afg-panel :is(
            button, input, select, textarea, a
        ):focus-visible {
            outline: 2px solid var(--accent);
            outline-offset: 2px;
        }

        .afg-top {
            flex: none;
            padding: max(17px, env(safe-area-inset-top))
                18px 15px;
            border-bottom: 1px solid var(--line);
        }

        .afg-heading,
        .afg-brand,
        .afg-heading-actions,
        .afg-inline-actions {
            display: flex;
            align-items: center;
        }

        .afg-heading {
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 16px;
        }

        .afg-brand {
            min-width: 0;
            gap: 11px;
        }

        .afg-brand-mark {
            display: grid;
            place-items: center;
            flex: 0 0 36px;
            width: 36px;
            height: 36px;
            border-radius: 12px;
            color: #b9f5ff;
            background: linear-gradient(
                145deg,
                #155b75,
                #17334d
            );
            border: 1px solid rgba(103, 224, 245, .3);
            font-size: 18px;
        }

        .afg-title {
            font-size: 17px;
            font-weight: 750;
            line-height: 1.2;
            letter-spacing: -.02em;
        }

        .afg-subtitle {
            margin-top: 3px;
            color: var(--muted);
            font-size: 12px;
        }

        .afg-heading-actions,
        .afg-inline-actions {
            gap: 7px;
        }

        .afg-icon-btn {
            display: inline-grid;
            place-items: center;
            flex: none;
            width: 34px;
            height: 34px;
            padding: 0;
            color: var(--muted);
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 10px;
            transition:
                color .16s,
                background .16s,
                border-color .16s;
        }

        .afg-icon-btn:hover,
        .afg-secondary:hover {
            color: var(--text);
            background: var(--surface-hover);
            border-color: rgba(105, 204, 229, .3);
        }

        .afg-search-row {
            display: grid;
            grid-template-columns:
                minmax(0, 1fr)
                minmax(0, 1fr)
                40px;
            gap: 8px;
        }

        .afg-input {
            width: 100%;
            min-width: 0;
            height: 40px;
            padding: 0 11px;
            color: var(--text);
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 10px;
            outline: none;
        }

        .afg-input::placeholder {
            color: var(--subtle);
        }

        .afg-input:focus {
            border-color: rgba(77, 204, 229, .65);
            box-shadow: 0 0 0 3px var(--accent-bg);
        }

        .afg-input[type="date"] {
            color-scheme: dark;
        }

        .afg-light .afg-input[type="date"] {
            color-scheme: light;
        }

        .afg-primary {
            display: inline-grid;
            place-items: center;
            min-height: 40px;
            color: #08202c;
            background: linear-gradient(
                145deg,
                #8ae9f2,
                #4ac9df
            );
            border: 1px solid rgba(180, 250, 255, .35);
            border-radius: 10px;
            font-weight: 750 !important;
            text-decoration: none;
            box-shadow: 0 5px 16px rgba(31, 179, 210, .16);
            transition: filter .16s, transform .16s;
        }

        .afg-primary:hover {
            filter: brightness(1.07);
            transform: translateY(-1px);
        }

        .afg-primary:active {
            transform: translateY(0);
        }

        .afg-filters {
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: center;
            gap: 9px;
            margin-top: 12px;
        }

        .afg-filters .afg-input {
            height: 36px;
            padding: 0 8px;
            font-size: 13px;
        }

        .afg-date-separator {
            color: var(--subtle);
        }

        .afg-utility {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            align-items: center;
            gap: 10px;
            flex: none;
            padding: 11px 18px;
            border-bottom: 1px solid var(--line);
            background: rgba(255, 255, 255, .015);
        }

        .afg-utility .afg-input {
            height: 35px;
            font-size: 14px;
        }

        .afg-utility .afg-icon-btn {
            width: 32px;
            height: 32px;
        }

        .afg-section-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex: none;
            min-height: 49px;
            padding: 9px 18px;
            border-bottom: 1px solid var(--line);
        }

        .afg-section-title {
            overflow: hidden;
            color: var(--muted);
            font-size: 12px;
            font-weight: 750;
            letter-spacing: .06em;
            text-overflow: ellipsis;
            text-transform: uppercase;
            white-space: nowrap;
        }

        .afg-secondary {
            min-height: 32px;
            padding: 0 10px;
            color: var(--muted);
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 8px;
            font-size: 13px !important;
            font-weight: 650 !important;
            white-space: nowrap;
        }

        .afg-chat-info {
            display: none;
            flex: none;
            padding: 12px 18px;
            border-bottom: 1px solid var(--line);
            background: var(--surface);
        }

        .afg-identifiers {
            display: grid;
            grid-template-columns:
                minmax(0, 1fr)
                minmax(0, 1fr);
            gap: 10px;
        }

        .afg-identifier-label {
            display: block;
            margin-bottom: 3px;
            color: var(--subtle);
            font-size: 11px;
            font-weight: 750;
            letter-spacing: .07em;
            text-transform: uppercase;
        }

        .afg-copy {
            display: block;
            width: 100%;
            overflow: hidden;
            padding: 0;
            color: var(--accent);
            background: none;
            border: 0;
            text-align: left;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px !important;
            font-weight: 650 !important;
        }

        .afg-copy:hover {
            text-decoration: underline;
        }

        .afg-chat-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
            margin-top: 11px;
        }

        .afg-chat-area {
            display: flex;
            flex: 1;
            flex-direction: column;
            min-height: 0;
            gap: 12px;
            overflow: auto;
            padding: 18px;
            overscroll-behavior: contain;
            overflow-anchor: none;
            scroll-behavior: auto;
            scrollbar-color:
                rgba(103, 183, 204, .38)
                transparent;
            scrollbar-width: thin;
        }

        .afg-empty {
            display: flex;
            flex: 1;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 240px;
            padding: 24px;
            text-align: center;
        }

        .afg-empty-icon {
            display: grid;
            place-items: center;
            width: 66px;
            height: 66px;
            margin-bottom: 18px;
            color: var(--accent);
            background: var(--accent-bg);
            border: 1px solid rgba(87, 205, 229, .19);
            border-radius: 21px;
            font-size: 27px;
        }

        .afg-empty-title {
            margin-bottom: 7px;
            font-size: 18px;
            font-weight: 750;
        }

        .afg-empty-text {
            max-width: 280px;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.6;
        }

        .chatlist {
            display: block;
            flex: none;
            width: 100%;
            padding: 13px 14px;
            color: var(--text);
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 13px;
            text-align: left;
            transition:
                background .16s,
                border-color .16s,
                transform .16s;
        }

        .chatlist:hover {
            background: var(--surface-hover);
            border-color: rgba(83, 198, 227, .4);
            transform: translateY(-1px);
        }

        .afg-list-top,
        .afg-list-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        }

        .afg-list-top {
            margin-bottom: 7px;
            color: var(--muted);
            font-size: 12px;
        }

        .afg-list-name {
            overflow: hidden;
            font-size: 14px;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .afg-list-tag {
            flex: none;
            color: var(--accent);
            font-size: 12px;
        }

        .afg-list-badges {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: none;
}

.afg-rate-badge {
    display: inline-grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    line-height: 1;
    background: var(--surface-2);
    border: 1px solid var(--line);
    color: var(--text);
    flex-shrink: 0;
}

/* Цветовые акценты под оценку (если это число от 1 до 5) */
.afg-rate-badge[data-rate="5"] {
    background: rgba(109, 217, 173, 0.2);
    border-color: rgba(109, 217, 173, 0.4);
    color: var(--green);
}

.afg-rate-badge[data-rate="4"] {
    background: rgba(97, 217, 237, 0.2);
    border-color: rgba(97, 217, 237, 0.4);
    color: var(--accent);
}

.afg-rate-badge[data-rate="1"],
.afg-rate-badge[data-rate="2"],
.afg-rate-badge[data-rate="3"] {
    background: rgba(242, 199, 119, 0.2);
    border-color: rgba(242, 199, 119, 0.4);
    color: var(--amber);
}

.afg-rate-badge--icon {
    font-size: 13px;
}

        .afg-msg {
            flex: none;
            width: fit-content;
            max-width: min(88%, 390px);
            padding: 11px 13px;
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 15px;
            box-shadow: 0 6px 19px rgba(0, 0, 0, .07);
            overflow-wrap: anywhere;
        }

        .afg-msg-user {
            align-self: flex-start;
            border-left: 2px solid var(--accent);
            border-top-left-radius: 5px;
        }

        .afg-msg-oper {
            align-self: flex-end;
            border-right: 2px solid var(--amber);
            border-top-right-radius: 5px;
        }

        .afg-msg-bot {
            align-self: flex-end;
            border-right: 2px solid var(--green);
            border-top-right-radius: 5px;
        }

        .afg-msg-comment {
            align-self: center;
            width: min(94%, 420px);
            max-width: 94%;
            background: var(--surface-2);
            border-style: dashed;
        }

        .afg-msg-header {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 8px;
            padding-bottom: 7px;
            border-bottom: 1px solid var(--line);
        }

        .afg-msg-author {
            min-width: 0;
            overflow-wrap: anywhere;
            font-size: 13px;
            font-weight: 750;
        }

        .afg-msg-user .afg-msg-author {
            color: var(--accent);
        }

        .afg-msg-oper .afg-msg-author {
            color: var(--amber);
        }

        .afg-msg-bot .afg-msg-author {
            color: var(--green);
        }

        .afg-msg-date {
            flex: none;
            color: var(--subtle);
            font-size: 11px;
            text-align: right;
        }

        .afg-message-content {
            font-size: 15px;
            line-height: 1.65;
        }

        .afg-message-content :first-child {
            margin-top: 0;
        }

        .afg-message-content :last-child {
            margin-bottom: 0;
        }

        .afg-message-content p {
            margin: 0 0 8px;
        }

        .afg-message-content pre {
            max-width: 100%;
            overflow: auto;
            padding: 10px;
            background: rgba(0, 0, 0, .17);
            border-radius: 8px;
        }

        .afg-message-content a {
            color: var(--accent);
        }

        .afg-media-image,
        .afg-media {
            display: block;
            max-width: 100%;
            max-height: 320px;
            margin: 7px 0;
            border-radius: 10px;
        }

        .afg-media-image {
            cursor: zoom-in;
        }

        .afg-file-link {
            display: inline-block;
            max-width: 100%;
            overflow-wrap: anywhere;
            margin: 5px 0;
            padding: 6px 9px;
            color: var(--accent);
            background: var(--accent-bg);
            border-radius: 7px;
            text-decoration: none;
        }

        .afg-event {
            align-self: center;
            flex: none;
            max-width: 95%;
            padding: 5px 10px;
            color: var(--muted);
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 20px;
            font-size: 12px;
            text-align: center;
        }

        .afg-dept-line {
            align-self: center;
            display: flex;
            flex: none;
            flex-direction: column;
            align-items: center;
            gap: 7px;
            width: min(96%, 410px);
            padding: 11px 14px;
            background: var(--surface-2);
            border: 1px solid var(--line);
            border-radius: 13px;
            text-align: center;
        }

        .afg-dept-caption {
            color: var(--subtle);
            font-size: 11px;
            font-weight: 750;
            letter-spacing: .08em;
        }

        .afg-dept-main {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 7px;
        }

        .afg-dept-chip {
            padding: 4px 9px;
            color: var(--accent);
            background: var(--accent-bg);
            border-radius: 7px;
            font-size: 13px;
            font-weight: 750;
        }

        .afg-dept-duration {
            color: var(--text);
            font-size: 17px;
            font-weight: 800;
            font-variant-numeric: tabular-nums;
        }

        .afg-dept-arrow,
        .afg-dept-status {
            color: var(--muted);
            font-size: 13px;
        }

        .afg-dept-period {
            color: var(--muted);
            font-size: 12px;
            font-variant-numeric: tabular-nums;
        }

        .afg-footer {
            display: none;
            flex: none;
            padding:
                12px 18px
                max(14px, env(safe-area-inset-bottom));
            background: var(--surface);
            border-top: 1px solid var(--line);
        }

        .afg-footer textarea {
            display: block;
            height: 68px;
            min-height: 54px;
            max-height: 180px;
            padding: 10px 12px;
            resize: vertical;
        }

        .afg-compose-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 9px;
            margin-top: 9px;
        }

        .afg-compose-options {
            display: flex;
            align-items: center;
            gap: 14px;
            color: var(--muted);
            font-size: 13px;
        }

        .afg-compose-options label {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
        }

        .afg-compose-options input {
            accent-color: #49c9dc;
        }

        .afg-modal-layer {
            position: absolute;
            inset: 0;
            z-index: 5;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 14px;
            background: rgba(3, 9, 19, .73);
            backdrop-filter: blur(8px);
        }

        .afg-modal-layer.afg-open {
            display: flex;
        }

        .afg-modal {
            display: flex;
            flex-direction: column;
            width: min(100%, 410px);
            max-height: min(740px, calc(100dvh - 28px));
            overflow: hidden;
            padding: 18px;
            color: var(--text);
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: 17px;
            box-shadow: 0 25px 75px rgba(0, 0, 0, .35);
        }

        .afg-modal-head {
            display: flex;
            flex: none;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
            margin-bottom: 15px;
            font-size: 16px;
            font-weight: 750;
        }

        #AF_ChatHis #datafield {
            min-height: 0;
            overflow-y: auto;
            overscroll-behavior: contain;
            padding-right: 4px;
        }

        .afg-data-row {
            padding: 10px 0;
            border-bottom: 1px solid var(--line);
        }

        .afg-data-label {
            margin-bottom: 4px;
            color: var(--subtle);
            font-size: 11px;
            font-weight: 750;
            letter-spacing: .07em;
            text-transform: uppercase;
        }

        .afg-data-value {
            overflow-wrap: anywhere;
            white-space: pre-wrap;
            font-size: 14px;
            line-height: 1.55;
        }

        .afg-modal-actions {
            display: flex;
            flex: none;
            justify-content: flex-end;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--line);
        }

        .afg-modal-actions .afg-primary:not([href]) {
            opacity: .5;
            pointer-events: none;
        }

        .afg-gallery {
            position: fixed;
            inset: 0;
            z-index: 10000001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 55px 65px;
            background: rgba(2, 7, 16, .94);
            backdrop-filter: blur(14px);
        }

        .afg-gallery img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
        }

        .afg-gallery button {
            position: absolute;
            display: grid;
            place-items: center;
            width: 40px;
            height: 40px;
            color: #fff;
            background: rgba(255, 255, 255, .13);
            border: 1px solid rgba(255, 255, 255, .17);
            border-radius: 12px;
            font-size: 20px;
        }

        .afg-gallery-prev {
            left: 12px;
            top: 50%;
        }

        .afg-gallery-next {
            right: 12px;
            top: 50%;
        }

        .afg-gallery-close {
            right: 14px;
            top: 14px;
        }

        .afg-gallery-counter {
            position: absolute;
            top: 22px;
            left: 50%;
            transform: translateX(-50%);
            color: #fff;
            font-size: 13px;
        }

        .afg-toast {
            position: fixed;
            right: 18px;
            bottom: 18px;
            z-index: 10000010;
            max-width: 340px;
            padding: 11px 15px;
            color: #fff;
            background: #243b50;
            border: 1px solid rgba(128, 218, 235, .4);
            border-radius: 11px;
            box-shadow: 0 12px 35px rgba(0, 0, 0, .3);
            font: 13px Inter, sans-serif;
        }

        @media (max-width: 460px) {
            .afg-top {
                padding-left: 13px;
                padding-right: 13px;
            }

            .afg-utility,
            .afg-section-bar,
            .afg-chat-info,
            .afg-chat-area,
            .afg-footer {
                padding-left: 13px;
                padding-right: 13px;
            }

            .afg-search-row {
                grid-template-columns:
                    minmax(0, 1fr)
                    minmax(0, 1fr)
                    38px;
                gap: 6px;
            }

            .afg-search-row .afg-input {
                padding: 0 8px;
                font-size: 12px;
            }

            .afg-utility {
                gap: 6px;
            }

            .afg-inline-actions {
                gap: 4px;
            }

            .afg-utility .afg-icon-btn {
                width: 29px;
                height: 32px;
            }

            .afg-msg {
                max-width: 94%;
            }

            .afg-gallery {
                padding: 55px 48px;
            }


.afg-panel.afg-light .afg-user-type--unknown {
    color: #485a70;
    background: #e0e7ee;
    border-color: #b6c4d2;
}
        }

        @media (prefers-reduced-motion: reduce) {
            .afg-panel *,
            .afg-gallery * {
                animation: none !important;
                transition: none !important;
                scroll-behavior: auto !important;
            }
        }

		/* Тип пользователя рядом с именем */
.afg-panel .afg-user-subtitle {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
}

.afg-panel .afg-subtitle-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.afg-panel .afg-user-type {
    flex: none;
    padding: 2px 7px;
    color: var(--accent);
    background: var(--accent-bg);
    border: 1px solid var(--line);
    border-radius: 6px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.3;
    white-space: nowrap;
}

/* Цвета — именно здесь, вне @media и после базового правила */

.afg-panel .afg-user-type--student {
    color: #f3a5aa;
    background: rgba(218, 100, 113, .13);
    border-color: rgba(218, 100, 113, .32);
}

.afg-panel .afg-user-type--teacher {
    color: #82dde0;
    background: rgba(72, 188, 192, .12);
    border-color: rgba(72, 188, 192, .32);
}

.afg-panel .afg-user-type--parent {
    color: #9bdfb5;
    background: rgba(94, 185, 133, .13);
    border-color: rgba(94, 185, 133, .32);
}

.afg-panel .afg-user-type--unknown {
    color: #bac6d7;
    background: rgba(148, 163, 184, .12);
    border-color: rgba(148, 163, 184, .29);
}

.afg-panel.afg-light .afg-user-type--student {
    color: #9b3f4b;
    background: #f4dfe1;
    border-color: #dcadb3;
}

.afg-panel.afg-light .afg-user-type--teacher {
    color: #176a71;
    background: #d7eff0;
    border-color: #a2d2d4;
}

.afg-panel.afg-light .afg-user-type--parent {
    color: #316b48;
    background: #dcefe3;
    border-color: #acd3ba;
}

.afg-panel.afg-light .afg-user-type--unknown {
    color: #485a70;
    background: #e0e7ee;
    border-color: #b6c4d2;
}

/* Статус остаётся доступным скринридеру, но не занимает место */
.afg-panel .afg-visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Четыре компактные кнопки в шапке */
.afg-panel .afg-heading-actions {
    flex: none;
}

.afg-panel .afg-brand > div:last-child {
    min-width: 0;
}

/* Кнопка сворачивания/разворачивания */
.afg-footer-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 4px 10px;
    margin-bottom: 8px;
    background: transparent;
    border: none;
    color: var(--muted);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.16s, color 0.16s;
}

.afg-footer-toggle:hover {
    background: var(--surface-hover);
    color: var(--text);
}

.afg-footer-toggle-icon {
    font-size: 10px;
    transition: transform 0.2s ease;
}

/* Свёрнутое состояние */
.afg-footer.afg-footer--collapsed {
    padding-top: 6px;
    padding-bottom: max(6px, env(safe-area-inset-bottom));
}

.afg-footer.afg-footer--collapsed .afg-footer-toggle {
    margin-bottom: 0;
}

.afg-footer.afg-footer--collapsed .afg-footer-body {
    display: none;
}

/* Развёрнутое состояние: переворачиваем стрелку */
.afg-footer:not(.afg-footer--collapsed) .afg-footer-toggle-icon {
    transform: rotate(180deg);
}
    `;

  document.head.append(styles);

  const panel = document.createElement("aside");
  panel.id = ROOT_ID;
  panel.className = "afg-panel";
  panel.setAttribute("aria-label", "История диалогов");

  panel.innerHTML = `
        <div class="afg-top">
            <div class="afg-heading">
                <div class="afg-brand">
                    <div class="afg-brand-mark" aria-hidden="true">
                        ◈
                    </div>

                    <div>
                        <div class="afg-title">
                            История диалогов
                        </div>
                        <div class="afg-subtitle" id="afgSubtitle">
                            Поиск и работа с чатами
                        </div>
                    </div>
                </div>

				<span
    class="afg-visually-hidden"
    id="afgSectionTitle"
    aria-live="polite"
>Начало работы</span>

                <div class="afg-heading-actions">
				<button
    class="afg-icon-btn"
    id="back_to_chat_his"
    type="button"
    title="Вернуться к результатам"
    aria-label="Вернуться к результатам"
    hidden
>⬅️</button>

<button
    class="afg-icon-btn"
    id="refreshchat"
    type="button"
    title="Обновить чат"
    aria-label="Обновить чат"
    hidden
>🔄️</button>
                    <button
                        class="afg-icon-btn"
                        id="chagetheme"
                        type="button"
                        title="Сменить тему"
                        aria-label="Сменить тему"
                    >◐</button>

                    <button
                        class="afg-icon-btn"
                        id="hideMeChHis"
                        type="button"
                        title="Закрыть панель"
                        aria-label="Закрыть панель"
                    >❌</button>
                </div>
            </div>

            <div class="afg-search-row">
                <input
                    class="afg-input"
                    id="chatuserhis"
                    inputmode="numeric"
                    autocomplete="off"
                    placeholder="ID пользователя"
                    aria-label="ID пользователя"
                >

                <input
                    class="afg-input"
                    id="hashchathis"
                    autocomplete="off"
                    placeholder="ID чата"
                    aria-label="ID чата"
                >

                <button
                    class="afg-primary"
                    id="btn_search_history"
                    type="button"
                    title="Найти"
                    aria-label="Найти"
                >🔎</button>
            </div>

            <div class="afg-filters">
                <input
                    class="afg-input"
                    type="date"
                    id="dateFromChHis"
                    aria-label="Дата начала"
                >

                <span class="afg-date-separator">—</span>

                <input
                    class="afg-input"
                    type="date"
                    id="dateToChHis"
                    aria-label="Дата окончания"
                >
            </div>
        </div>

        <div class="afg-utility">
            <select
                class="afg-input"
                id="operatorstp"
                aria-label="Операторы на линии"
            >
                <option value="">Операторы на линии</option>
            </select>

            <div class="afg-inline-actions">
                <button
                    class="afg-icon-btn"
                    id="RefrehOperators"
                    type="button"
                    title="Обновить операторов"
                    aria-label="Обновить операторов"
                >🔄</button>

                <button
                    class="afg-icon-btn"
                    id="getdatafrchat"
                    type="button"
                    title="Данные пользователя"
                    aria-label="Данные пользователя"
                >👤</button>

                <button
                    class="afg-icon-btn"
                    id="chhisinstr"
                    type="button"
                    title="Инструкция"
                    aria-label="Инструкция"
                >❓</button>

                <button
                    class="afg-icon-btn"
                    id="clearallinfo"
                    type="button"
                    title="Очистить"
                    aria-label="Очистить"
                >🧹</button>
            </div>
        </div>

          <div class="afg-chat-info" id="somechatinfo">
            <div class="afg-identifiers">
                <div>
                    <span class="afg-identifier-label">
                        Пользователь
                    </span>
                    <button
                        class="afg-copy"
                        id="placeusid"
                        type="button"
                        title="Копировать ID"
                    ></button>
                </div>

                <div>
                    <span class="afg-identifier-label">
                        Диалог
                    </span>
                    <button
                        class="afg-copy"
                        id="placechatid"
                        type="button"
                        title="Копировать ссылку"
                    ></button>
                </div>
            </div>

            <div class="afg-chat-actions">
                <button
                    class="afg-secondary"
                    id="takechat"
                    type="button"
                >Забрать чат</button>

                <button
                    class="afg-secondary"
                    id="reassign"
                    type="button"
                >Перевести оператору</button>
            </div>
        </div>

        <div
            class="afg-chat-area"
            id="infofield"
            role="region"
            aria-label="Результаты поиска и сообщения"
        ></div>

        <div class="afg-footer afg-footer--collapsed" id="bottommenuchhis" style="display: none;">
        <button class="afg-footer-toggle" id="toggleFooterBtn" type="button" title="Развернуть панель ввода">
            <span class="afg-footer-toggle-icon">▲</span>
            <span class="afg-footer-toggle-label">Написать сообщение / заметку</span>
        </button>

        <div class="afg-footer-body" id="footerBody">
            <textarea class="afg-input" id="msgftochatornotes" placeholder="Напишите сообщение или заметку…" aria-label="Сообщение или заметка"></textarea>

            <div class="afg-compose-actions">
                <div class="afg-compose-options">
                    <label>
                        <input type="radio" name="chatornotes" value="Notes" checked="">
                        Заметка
                    </label>

                    <label>
                        <input type="radio" name="chatornotes" value="Chat">
                        Сообщение
                    </label>
                </div>

                <button class="afg-primary" id="sendmsgtochatornotes" type="button">Отправить ↗</button>
            </div>
        </div>
    </div>

        <div
            class="afg-modal-layer"
            id="userchatdata"
            role="dialog"
            aria-modal="true"
            aria-label="Данные пользователя"
        >
            <div class="afg-modal">
                <div class="afg-modal-head">
                    <span>Данные пользователя</span>

                    <button
                        class="afg-icon-btn"
                        id="hideuserdatainfo"
                        type="button"
                        aria-label="Закрыть"
                    >×</button>
                </div>

                <div id="datafield"></div>

                <div class="afg-modal-actions">
                    <a
                        class="afg-primary"
                        id="gotocrmhis"
                        target="_blank"
                        rel="noopener noreferrer"
                    >Открыть CRM ↗</a>
                </div>
            </div>
        </div>
    `;

  document.body.append(panel);

  function applyTheme() {
    panel.classList.toggle("afg-light", state.theme === "light");

    $("chagetheme").textContent = state.theme === "light" ? "🌙" : "☀️";

    $("chagetheme").title =
      state.theme === "light"
        ? "Включить тёмную тему"
        : "Включить светлую тему";

    $("chagetheme").setAttribute("aria-label", $("chagetheme").title);

    localStorage.setItem("afgChatHistoryTheme", state.theme);
  }

  function empty(title, text, icon = "⌕") {
    const area = $("infofield");
    area.replaceChildren();

    const container = document.createElement("div");
    container.className = "afg-empty";

    const symbol = document.createElement("div");
    symbol.className = "afg-empty-icon";
    symbol.textContent = icon;

    const heading = document.createElement("div");
    heading.className = "afg-empty-title";
    heading.textContent = title;

    const description = document.createElement("div");
    description.className = "afg-empty-text";
    description.textContent = text;

    container.append(symbol, heading, description);
    area.append(container);
    area.scrollTop = 0;
  }

  function loading(text) {
    $("afgSectionTitle").textContent = "Загрузка";
    empty("Немного подождите", text, "◌");
  }

  function closeModal() {
    $("userchatdata").classList.remove("afg-open");
  }

  function resetConversation() {
    state.conversation = null;
    $("afgSubtitle").classList.remove("afg-user-subtitle");

    $("somechatinfo").style.display = "none";
    $("bottommenuchhis").style.display = "none";
    $("refreshchat").hidden = true;
    $("back_to_chat_his").hidden = true;

    $("infofield").removeAttribute("opsetction");
    $("infofield").removeAttribute("openhistorytime");

    closeModal();
  }

  function clearAll() {
    state.requestId++;
    state.results = [];
    state.resultsTitle = "Результаты поиска";

    resetConversation();

    $("chatuserhis").value = "";
    $("hashchathis").value = "";
    $("msgftochatornotes").value = "";
    $("afgSubtitle").textContent = "Поиск и работа с чатами";
    $("afgSectionTitle").textContent = "Начало работы";

    empty(
      "Найдите нужный диалог",
      "Введите ID пользователя или ID чата. " +
      "Также можно выбрать оператора на линии.",
      "⌕"
    );
  }

  function renderConversation(conversation) {
    state.conversation = conversation;

    const user = conversation.channelUser || {};
    const payload = user.payload || {};
    const area = $("infofield");

    const messages = Array.isArray(conversation.messages)
      ? [...conversation.messages].sort(
        (a, b) => (dateMillis(a.ts) ?? 0) - (dateMillis(b.ts) ?? 0)
      )
      : [];

    const userId = payload.id || user.id || user.channelTpe || "Неизвестен";

    const userName = payload.userFullName || user.fullName || "Пользователь";

    $("placeusid").textContent = String(userId);
    $("placechatid").textContent = String(conversation.id || "");

    $("somechatinfo").style.display = "block";
    $("bottommenuchhis").style.display = "block";
    $("refreshchat").hidden = false;
    $("back_to_chat_his").hidden = state.results.length === 0;

    $("afgSectionTitle").textContent = "Переписка";
    const subtitle = $("afgSubtitle");
    const userType = String(payload.userType ?? "")
      .trim()
      .toLowerCase();

    const typeLabels = {
      student: "ученик",
      teacher: "преподаватель",
      parent: "родитель",
    };

    const nameNode = document.createElement("span");
    nameNode.className = "afg-subtitle-name";
    nameNode.textContent = String(userName);

    const typeNode = document.createElement("span");

    const typeKey = Object.hasOwn(typeLabels, userType) ? userType : "unknown";

    typeNode.className = `afg-user-type afg-user-type--${typeKey}`;
    typeNode.textContent = typeLabels[userType] || "неизвестный";

    subtitle.classList.add("afg-user-subtitle");
    subtitle.replaceChildren(nameNode, typeNode);

    area.setAttribute("openhistorytime", new Date().toISOString());
    area.removeAttribute("opsetction");

    const groupNames = {
      "c7bbb211-a217-4ed3-8112-98728dc382d8": "ТП",
      "8266dbb1-db44-4910-8b5f-a140deeec5c0": "ТП ОС",
      "b6f7f34d-2f08-fc19-3661-29ac00842898": "КЦ",
    };

    if (groupNames[conversation.groupId]) {
      area.setAttribute("opsetction", groupNames[conversation.groupId]);
    }

    globalThis.isChatOnOperator = conversation.status === "AssignedToOperator";

    area.replaceChildren();

    const { markers, last } = timeline(messages);

    messages.forEach((message, index) => {
      if (markers.has(index)) {
        area.append(deptLine(markers.get(index)));
      }

      if (message.tpe === "Event") {
        const text = eventText(message);
        if (!text) return;

        const event = document.createElement("div");
        event.className = "afg-event";
        event.textContent = `${text} · ${readableTime(message.ts)}`;

        area.append(event);
        return;
      }

      const node = messageNode(message, userName);
      if (node) area.append(node);
    });

    if (last) {
      area.append(deptLine(last, true));
    }

    if (!area.childElementCount) {
      empty(
        "Сообщений пока нет",
        "Диалог найден, но история сообщений пуста.",
        "◇"
      );
    }

    // Открываем переписку с НАЧАЛА, не с последнего сообщения.
    area.scrollTop = 0;
  }

  function resultTimestamp(item) {
    return item.ts || item.createdAt || item.updatedAt || null;
  }

  function resultStatus(item) {
    if (item.status === "ClosedByBot") {
      return "🤖 Bot";
    }

    const usedStatuses = item.stats?.usedStatuses;

    const hadOperator =
      item.status === "AssignedToOperator" ||
      usedStatuses === "AssignedToOperator" ||
      (Array.isArray(usedStatuses) &&
        usedStatuses.includes("AssignedToOperator"));

    return hadOperator ? "🎧 Оператор" : "";
  }

  function resultRatingBadge(item) {
    // Проверяем статус закрытия ботом или наличие оператора, если оценки нет
    const rateValue = item.stats?.rate?.rate;

    if (rateValue !== undefined && rateValue !== null && rateValue !== "") {
      const badge = document.createElement("span");
      badge.className = "afg-rate-badge";
      badge.dataset.rate = String(rateValue);
      badge.title = `Оценка: ${rateValue}`;
      badge.textContent = String(rateValue);
      return badge;
    }

    // Если оценки нет, определяем индикатор как в старой логике
    let mark = "";
    let markTitle = "Без оценки";

    if (item.status === "ClosedByBot") {
      mark = "🤖";
      markTitle = "Закрыт ботом";
    } else if (
      item.stats?.usedStatuses === "AssignedToOperator" ||
      (Array.isArray(item.stats?.usedStatuses) &&
        item.stats.usedStatuses.includes("AssignedToOperator"))
    ) {
      mark = "🛠";
      markTitle = "Был на операторе";
    } else {
      mark = "⭕";
    }

    const badge = document.createElement("span");
    badge.className = "afg-rate-badge afg-rate-badge--icon";
    badge.title = markTitle;
    badge.textContent = mark;
    return badge;
  }

  function userTypeBadge(value) {
    const type = String(value ?? "").trim();

    if (/^teacher$/i.test(type)) {
      return "👩‍🏫 Teacher";
    }

    if (/^student$/i.test(type)) {
      return "🎓 Student";
    }

    return type ? `👤 ${type}` : "";
  }

  function renderResults(items, title = "Результаты поиска") {
    state.results = Array.isArray(items) ? items : [];
    state.resultsTitle = title;

    resetConversation();

    $("afgSectionTitle").textContent = `${title} · ${state.results.length}`;

    $("afgSubtitle").textContent = "Выберите диалог, чтобы открыть историю";

    const area = $("infofield");
    area.replaceChildren();

    if (!state.results.length) {
      empty(
        "Ничего не найдено",
        "Попробуйте другой ID или расширьте диапазон дат.",
        "◇"
      );
      return;
    }

    const fragment = document.createDocumentFragment();

    for (const item of state.results) {
      const user = item.channelUser || {};
      const payload = user.payload || {};

      const button = document.createElement("button");
      button.type = "button";
      button.className = "chatlist";
      button.dataset.id = String(item.conversationId || "");

      const top = document.createElement("div");
      top.className = "afg-list-top";

      const date = document.createElement("span");
      date.textContent = readableDateTime(resultTimestamp(item));

      const status = document.createElement("span");
      status.textContent = resultStatus(item);

      top.append(date, status);

      const bottom = document.createElement("div");
      bottom.className = "afg-list-bottom";

      const name = document.createElement("span");
      name.className = "afg-list-name";
      name.textContent =
        payload.userFullName || user.fullName || "Пользователь";

      // Контейнер под бейджи: тип пользователя (Teacher/Student/etc.) + круглая оценка
      const badgesWrapper = document.createElement("div");
      badgesWrapper.className = "afg-list-badges";

      const type = document.createElement("span");
      type.className = "afg-list-tag";
      type.textContent = userTypeBadge(payload.userType);

      badgesWrapper.append(type, resultRatingBadge(item));

      bottom.append(name, badgesWrapper);
      button.append(top, bottom);
      fragment.append(button);
    }

    area.append(fragment);
    area.scrollTop = 0;
  }

  async function openConversation(chatId) {
    if (!chatId) return;

    const requestId = ++state.requestId;

    resetConversation();
    loading("Открываем переписку…");

    try {
      const conversation = await apiJson(
        `${API}/conversations/` + encodeURIComponent(chatId)
      );

      if (requestId !== state.requestId) return;

      renderConversation(conversation);
    } catch (error) {
      if (requestId !== state.requestId) return;

      console.error(error);

      $("afgSectionTitle").textContent = "Ошибка";

      empty(
        "Не удалось открыть диалог",
        "Проверьте ID чата и попробуйте ещё раз.",
        "!"
      );

      notify(error.message, "error");
    }
  }

  async function searchHistory(body, title) {
    const requestId = ++state.requestId;

    resetConversation();
    loading("Ищем диалоги…");
    setBusy("btn_search_history", true);

    try {
      const data = await apiJson(`${API}/conversations/history`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          serviceId: SERVICE_ID,
          mode: "Json",
          orderBy: "ts",
          orderDirection: "Desc",
          page: 1,
          limit: 20,
          ...body,
        }),
      });

      if (requestId !== state.requestId) return;

      renderResults(data.items, title);

      if (Number(data.total) > 20) {
        notify(`Показаны первые 20 диалогов из ${data.total}`, "warning");
      }
    } catch (error) {
      if (requestId !== state.requestId) return;

      console.error(error);

      $("afgSectionTitle").textContent = "Ошибка поиска";

      empty(
        "Не удалось выполнить поиск",
        "Проверьте соединение и параметры поиска.",
        "!"
      );

      notify(error.message, "error");
    } finally {
      setBusy("btn_search_history", false);
    }
  }

  async function search() {
    const userId = $("chatuserhis").value.trim();
    const chatId = $("hashchathis").value.trim();

    if (Boolean(userId) === Boolean(chatId)) {
      notify("Укажите что-то одно: ID пользователя или ID чата", "warning");
      return;
    }

    if (chatId) {
      state.results = [];
      await openConversation(chatId);
      return;
    }

    try {
      await searchHistory(
        {
          channelUserFullTextLike: userId,
          ...dateRange(),
        },
        "Диалоги пользователя"
      );
    } catch (error) {
      notify(error.message, "warning");
    }
  }

  async function refreshOperators() {
    const button = $("RefrehOperators");
    if (button.disabled) return;

    setBusy("RefrehOperators", true);
    button.textContent = "◌";

    try {
      const data = await apiJson(`${API}/operators/statistic/currentState`);

      const rows = Array.isArray(data.onOperator) ? data.onOperator : [];

      state.operatorRows = rows;

      const select = $("operatorstp");
      const previous = select.value;
      const ownId = currentOperatorId(rows);

      const ownRow = rows.find((row) => String(row?.operator?.id) === ownId);

      const group =
        operatorGroup(currentOperatorName()) ||
        operatorGroup(ownRow?.operator?.fullName);

      select.replaceChildren();

      if (!group) {
        select.add(new Option("Не удалось определить вашу группу", ""));

        state.selectedOperatorId = "";

        notify("Не удалось определить группу по имени профиля", "warning");

        return;
      }

      const groupLabel =
        {
          "тп ос": "ТП ОС",
          тпprem: "ТПPrem",
          "teachers care": "Teachers Care",
          prem: "Prem",
          sales: "Sales",
          тп: "ТП",
          кц: "КЦ",
          км: "КМ",
          тс: "ТС",
        }[group] || group;

      select.add(new Option(`Операторы группы ${groupLabel}`, ""));

      // Строго своя группа. Если она пуста, чужих
      // операторов в качестве запасного списка не показываем.
      const groupRows = rows.filter(
        ({ operator }) =>
          operator &&
          operator.status !== "Offline" &&
          operatorGroup(operator.fullName) === group
      );

      const symbols = {
        Online: "●",
        Busy: "◐",
        Pause: "○",
      };

      for (const { operator, aCnt = 0 } of groupRows) {
        select.add(
          new Option(
            `${symbols[operator.status] || "·"} ` +
            `${operator.fullName} · ${aCnt}`,
            String(operator.id)
          )
        );
      }

      if (!groupRows.length) {
        select.options[0].textContent = `В группе ${groupLabel} нет операторов на линии`;
      }

      select.value =
        previous &&
          [...select.options].some((option) => option.value === previous)
          ? previous
          : "";

      state.selectedOperatorId = select.value;
    } catch (error) {
      console.error(error);
      notify("Не удалось обновить операторов", "error");
    } finally {
      button.textContent = "🔄";
      setBusy("RefrehOperators", false);
    }
  }

  async function searchByOperator() {
    const id = $("operatorstp").value;

    state.selectedOperatorId = id;
    if (!id) return;

    const today = dateValue(new Date());

    await searchHistory(
      {
        participatingOperatorsIds: [id],
        tsFrom: new Date(`${today}T00:00:00`).toISOString(),
        tsTo: new Date(`${today}T23:59:59.999`).toISOString(),
        usedStatuses: ["OnOperator", "AssignedToOperator", "Active"],
      },
      "Чаты оператора"
    );
  }

  async function assignTo(targetId, conversationId = state.conversation?.id) {
    if (!conversationId) {
      throw new Error("Сначала откройте чат");
    }

    // У этого API успешный ответ может не иметь JSON-тела.
    await apiFetch(`${API}/conversation/assign`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        command: "DO_ASSIGN_CONVERSATION",
        conversationId,
        assignToOperatorId: targetId,
      }),
    });
  }

  async function takeChat() {
    if (state.busy.has("takechat")) return;

    const conversationId = state.conversation?.id;

    if (!conversationId) {
      notify("Сначала откройте чат", "warning");
      return;
    }

    const openedAt = dateMillis($("infofield").getAttribute("openhistorytime"));

    if (openedAt === null || Date.now() - openedAt > 60_000) {
      notify(
        "История открыта больше минуты. " + "Сначала обновите чат.",
        "warning"
      );
      return;
    }

    const button = $("takechat");
    const originalText = button.textContent;
    let returnedToQueue = false;

    setBusy("takechat", true);

    try {
      let ownId = currentOperatorId(state.operatorRows);

      if (!ownId) {
        button.textContent = "Определяем оператора…";

        const data = await apiJson(`${API}/operators/statistic/currentState`);

        state.operatorRows = Array.isArray(data.onOperator)
          ? data.onOperator
          : [];

        ownId = currentOperatorId(state.operatorRows);
      }

      if (!ownId) {
        notify(
          "Не удалось определить ваш ID оператора. " +
          "Проверьте совпадение имени профиля " +
          "с именем в списке операторов.",
          "error"
        );
        return;
      }

      if (Date.now() - openedAt > 60_000) {
        notify("История устарела. Сначала обновите чат.", "warning");
        return;
      }

      if (!confirm("Вернуть чат в очередь и забрать его на себя?")) {
        return;
      }

      button.textContent = "Возврат в очередь…";

      // Шаг 1: вернуть чат в очередь.
      // API ожидает строку "null".
      await assignTo("null", conversationId);
      returnedToQueue = true;

      button.textContent = "Забираем из очереди…";

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Шаг 2: досрочно забрать чат себе.
      await assignTo(ownId, conversationId);

      notify("Чат назначен вам");
      await openConversation(conversationId);
    } catch (error) {
      console.error(error);

      notify(
        returnedToQueue
          ? "Чат вернулся в очередь, но забрать " +
          "его не удалось. Проверьте его статус."
          : "Не удалось вернуть чат в очередь: " + error.message,
        "error"
      );
    } finally {
      button.textContent = originalText;
      setBusy("takechat", false);
    }
  }

  async function reassignChat() {
    const id = state.selectedOperatorId;
    const chatId = state.conversation?.id;
    const name = $("operatorstp").selectedOptions[0]?.textContent;

    if (!chatId || !id) {
      notify("Откройте чат и выберите оператора", "warning");
      return;
    }

    if (!confirm(`Перевести чат оператору «${name}»?`)) {
      return;
    }

    setBusy("reassign", true);

    try {
      await assignTo(id, chatId);
      notify("Чат переведён оператору");
      await openConversation(chatId);
    } catch (error) {
      console.error(error);

      notify(`Не удалось перевести чат: ${error.message}`, "error");
    } finally {
      setBusy("reassign", false);
    }
  }

  async function sendMessage() {
    const conversation = state.conversation;
    const field = $("msgftochatornotes");
    const text = field.value.trim();

    const mode = panel.querySelector(
      'input[name="chatornotes"]:checked'
    )?.value;

    if (!conversation?.id || !text || !mode) {
      notify("Откройте чат и введите текст", "warning");
      return;
    }

    if (typeof sendAnswersRequest !== "function") {
      notify("Функция отправки недоступна", "error");
      return;
    }

    setBusy("sendmsgtochatornotes", true);

    try {
      const current = await apiJson(
        `${API}/conversations/` + encodeURIComponent(conversation.id)
      );

      const safeText = escapeHtml(text).replace(/\r?\n/g, "<br>");

      const payload = {
        sessionId: current.sessionId,
        conversationId: conversation.id,
        text: `<p>${safeText}</p>`,
      };

      if (mode === "Notes") {
        payload.isComment = true;
      }

      const response = await sendAnswersRequest(payload);

      if (!response?.ok) {
        throw new Error(
          `Ошибка отправки: HTTP ` + `${response?.status ?? "?"}`
        );
      }

      field.value = "";

      notify(mode === "Notes" ? "Заметка добавлена" : "Сообщение отправлено");

      await openConversation(conversation.id);
    } catch (error) {
      console.error(error);
      notify(error.message, "error");

      // При ошибке текст остаётся в поле.
    } finally {
      setBusy("sendmsgtochatornotes", false);
    }
  }

  function dataRow(label, value) {
    const row = document.createElement("div");
    row.className = "afg-data-row";

    const heading = document.createElement("div");
    heading.className = "afg-data-label";
    heading.textContent = label;

    const content = document.createElement("div");
    content.className = "afg-data-value";

    content.textContent =
      typeof value === "object" && value !== null
        ? JSON.stringify(value, null, 2)
        : String(value || "Нет данных");

    row.append(heading, content);
    return row;
  }

  function openModal() {
    if (!state.conversation) {
      notify("Сначала откройте диалог", "warning");
      return;
    }

    const user = state.conversation.channelUser || {};

    const payload = user.payload || {};

    const techInfo =
      payload.techScreeningData || payload["Тех.инфа об устройствах"];

    $("datafield").replaceChildren(
      dataRow("Имя", payload.userFullName || user.fullName),
      dataRow("Тип пользователя", payload.userType),
      dataRow("User ID", payload.id || user.id),
      dataRow("Email", payload.email),
      dataRow("Телефон", payload.phone),
      dataRow("Техническая информация", techInfoAsText(techInfo))
    );

    const crmLink = $("gotocrmhis");
    const userId = String(payload.id || user.id || "").trim();

    if (userId) {
      crmLink.href =
        "https://crm2.skyeng.ru/persons/" + encodeURIComponent(userId);

      crmLink.title = "Открыть пользователя в CRM";
    } else {
      crmLink.removeAttribute("href");
      crmLink.title = "ID пользователя для CRM не найден";
    }

    $("datafield").scrollTop = 0;
    $("userchatdata").classList.add("afg-open");
    $("hideuserdatainfo").focus();
  }

  async function copy(text) {
    if (!text) return;

    try {
      if (typeof copyToClipboard === "function") {
        await copyToClipboard(text);
      } else {
        await navigator.clipboard.writeText(text);
      }

      notify("Скопировано");
    } catch (error) {
      console.error(error);
      notify("Не удалось скопировать", "error");
    }
  }

  function closeGallery() {
    if (!state.gallery) return;

    state.gallery.element.remove();
    state.gallery = null;
  }

  function openGallery(clicked) {
    closeGallery();

    const images = [...$("infofield").querySelectorAll(".afg-media-image")].map(
      (image) => image.dataset.full || image.src
    );

    if (!images.length) return;

    let index = images.indexOf(clicked.dataset.full || clicked.src);

    if (index < 0) index = 0;

    const overlay = document.createElement("div");

    overlay.className = "afg-gallery";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Просмотр изображений");

    const image = document.createElement("img");

    image.alt = "Изображение из диалога";

    const counter = document.createElement("div");

    counter.className = "afg-gallery-counter";

    function button(className, text, title, action) {
      const element = document.createElement("button");

      element.type = "button";
      element.className = className;
      element.textContent = text;
      element.title = title;

      element.addEventListener("click", (event) => {
        event.stopPropagation();
        action();
      });

      return element;
    }

    function update() {
      image.src = images[index];

      counter.textContent = `${index + 1} / ${images.length}`;
    }

    function previous() {
      index = (index - 1 + images.length) % images.length;

      update();
    }

    function next() {
      index = (index + 1) % images.length;

      update();
    }

    overlay.append(
      image,
      counter,
      button("afg-gallery-prev", "‹", "Предыдущее изображение", previous),
      button("afg-gallery-next", "›", "Следующее изображение", next),
      button("afg-gallery-close", "×", "Закрыть", closeGallery)
    );

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeGallery();
      }
    });

    document.body.append(overlay);

    state.gallery = {
      element: overlay,
      previous,
      next,
    };

    update();
  }

  function updateHostPosition(open) {
    const rightPanel = $("rightPanel");
    const openButton = $("opennewcat");

    if (rightPanel) {
      rightPanel.style.right = open
        ? `${Math.min(480, window.innerWidth) + 2}px`
        : "22px";
    }

    openButton?.classList.toggle("active", open);
  }

  function togglePanel(force) {
    const currentlyOpen = panel.style.display === "flex";

    const open = typeof force === "boolean" ? force : !currentlyOpen;

    panel.style.display = open ? "flex" : "none";

    updateHostPosition(open);

    if (open) {
      applyTheme();
      refreshOperators();
    } else {
      closeModal();
      closeGallery();
      state.requestId++;
    }
  }

  // Совместимость с существующей кнопкой открытия панели.
  globalThis.getopennewcatButtonPress = () => togglePanel();

  $("hideMeChHis").addEventListener("click", () => togglePanel(false));

  $("chagetheme").addEventListener("click", () => {
    state.theme = state.theme === "dark" ? "light" : "dark";

    applyTheme();
  });

  $("btn_search_history").addEventListener("click", search);

  $("RefrehOperators").addEventListener("click", refreshOperators);

  $("operatorstp").addEventListener("change", searchByOperator);

  $("clearallinfo").addEventListener("click", clearAll);

  $("getdatafrchat").addEventListener("click", openModal);

  $("hideuserdatainfo").addEventListener("click", closeModal);

  $("userchatdata").addEventListener("click", (event) => {
    if (event.target === $("userchatdata")) {
      closeModal();
    }
  });

  $("back_to_chat_his").addEventListener("click", () => {
    if (state.results.length) {
      renderResults(state.results, state.resultsTitle);
    }
  });

  $("refreshchat").addEventListener("click", () => {
    if (state.conversation?.id) {
      openConversation(state.conversation.id);
    }
  });

  $("takechat").addEventListener("click", takeChat);

  $("reassign").addEventListener("click", reassignChat);

  $("sendmsgtochatornotes").addEventListener("click", sendMessage);

  $("chatuserhis").addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "");
  });

  for (const id of ["chatuserhis", "hashchathis"]) {
    $(id).addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        search();
      }
    });
  }

  $("msgftochatornotes").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      sendMessage();
    }
  });

  $("infofield").addEventListener("click", (event) => {
    const image = event.target.closest(".afg-media-image");

    if (image) {
      openGallery(image);
      return;
    }

    const item = event.target.closest(".chatlist");

    if (item?.dataset.id) {
      openConversation(item.dataset.id);
    }
  });

  $("infofield").addEventListener("contextmenu", (event) => {
    const item = event.target.closest(".chatlist");

    if (!item?.dataset.id) return;

    event.preventDefault();
    copy(item.dataset.id);
  });

  $("placeusid").addEventListener("click", () => {
    copy($("placeusid").textContent);
  });

  $("placechatid").addEventListener("click", () => {
    const id = $("placechatid").textContent;

    if (id) {
      copy("https://skyeng.autofaq.ai/logs/" + id);
    }
  });

  $("chhisinstr").addEventListener("click", () => {
    window.open(
      "https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971",
      "_blank",
      "noopener,noreferrer"
    );
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.gallery) {
        closeGallery();
      } else {
        closeModal();
      }
    }

    if (state.gallery && event.key === "ArrowLeft") {
      state.gallery.previous();
    }

    if (state.gallery && event.key === "ArrowRight") {
      state.gallery.next();
    }
  });

  const footerEl = $("bottommenuchhis");
  const toggleBtn = $("toggleFooterBtn");
  const toggleLabel = toggleBtn.querySelector(".afg-footer-toggle-label");

  toggleBtn.addEventListener("click", () => {
    const isCollapsed = footerEl.classList.toggle("afg-footer--collapsed");

    // Обновляем подсказку и текст
    toggleBtn.title = isCollapsed
      ? "Развернуть панель ввода"
      : "Свернуть панель ввода";
    toggleLabel.textContent = isCollapsed
      ? "Написать сообщение / заметку"
      : "Свернуть";

    // Если развернули — сразу ставим фокус в поле ввода
    if (!isCollapsed) {
      $("msgftochatornotes").focus();
    }
  });

  window.addEventListener("resize", () => {
    if (panel.style.display === "flex") {
      updateHostPosition(true);
    }
  });

  setDefaultDates();
  applyTheme();
  clearAll();
})();
