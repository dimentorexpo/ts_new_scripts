(() => {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxAh4LR8dnxdrMtDIdxWM4-lecA6u5vhrCSfP-ky7dLvlJUoN-jljJsLWLbAkupvDs/exec';

  const LS_POS = 'tplWidgetCyberV3.pos';
  const LS_MIN = 'tplWidgetCyberV3.min';
  const LS_DRAFTS = 'tplWidgetCyberV3.drafts.v2';   // {id: {text, base}}; старый ключ .drafts больше не читается

  if (window.__TPL_WIDGET_CYBER_V3__) {
    window.__TPL_WIDGET_CYBER_V3__.show();
    return;
  }

  function lsGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function lsSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (_) {}
  }

  function loadDrafts() {
    try {
      const parsed = JSON.parse(lsGet(LS_DRAFTS) || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      const clean = {};
      for (const [id, d] of Object.entries(parsed)) {
        if (d && typeof d.text === 'string' && d.text.trim() && typeof d.base === 'string') clean[id] = d;
      }
      return clean;
    } catch (_) {
      return {};
    }
  }

  /** Единые переносы строк для сравнения с текстом из <textarea>. */
  function normalizeEol(text) {
    return String(text).replace(/\r\n?/g, '\n');
  }

  /** Короткий отпечаток текста: черновик применяется, только если шаблон не менялся. */
  function fingerprint(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36) + ':' + text.length;
  }

  /** Черновик выбранного шаблона или null, если его нет или шаблон с тех пор изменился. */
  function draftFor(tpl) {
    const d = state.drafts[tpl.id];
    return d && d.base === fingerprint(tpl.body) ? d.text : null;
  }

  const host = document.createElement('div');
  host.id = '__tpl_widget_cyber_v3_host';
  (document.body || document.documentElement).appendChild(host);

  const root = host.attachShadow({ mode: 'open' });

  const css = `
:host {
  all: initial;
  position: fixed;
  left: 18px;
  top: 84px;
  width: min(860px, calc(100vw - 24px));
  z-index: 2147483000;
  display: block;
  --bg: #141920; --bg-2: #1a2029; --bg-3: #222a35; --bg-hover: #2a3442; --sunken: #0f1318;
  --line: rgba(148,163,184,.13); --line-strong: rgba(148,163,184,.26);
  --text: #e6ebf2; --text-2: #a3afc0; --text-3: #6f7b8e;
  --accent: #7cc4ff; --accent-soft: rgba(124,196,255,.12); --accent-line: rgba(124,196,255,.42); --accent-ink: #d3ebff;
  --primary: #2f6db3; --primary-hover: #3a7cc6;
  --bad: #f07a7e; --warn: #f2a65a; --warn-soft: rgba(242,166,90,.14);
  font: 13px/1.45 "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
* { box-sizing: border-box; }
.tpl-widget {
  display: flex; flex-direction: column;
  max-height: calc(100vh - 36px);
  overflow: hidden;
  background: var(--bg);
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(3,7,14,.55), 0 2px 8px rgba(3,7,14,.35);
  animation: tpl-in .16s ease-out;
}
@keyframes tpl-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
.tpl-header {
  display: flex; align-items: center; gap: 8px;
  min-height: 44px; padding: 0 8px 0 14px;
  background: var(--bg-2); border-bottom: 1px solid var(--line);
  cursor: grab; user-select: none; touch-action: none;
}
.tpl-header:active { cursor: grabbing; }
.tpl-brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
.tpl-brand-ico { font-size: 15px; width: 22px; text-align: center; }
.tpl-title { font-size: 13.5px; font-weight: 600; white-space: nowrap; }
.tpl-count { font-size: 12px; color: var(--text-3); }
.tpl-actions { display: flex; gap: 2px; margin-left: auto; }
.tpl-icon-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; padding: 0;
  font: 15px/1 inherit; color: var(--text-2);
  background: transparent; border: 1px solid transparent; border-radius: 7px; cursor: pointer;
}
.tpl-icon-btn:hover { color: var(--text); background: var(--bg-hover); }
.tpl-icon-btn[data-action="close"]:hover { color: var(--bad); background: rgba(240,122,126,.13); }
.tpl-main { display: flex; gap: 12px; padding: 12px; min-height: 0; }
.tpl-left { display: flex; flex-direction: column; gap: 10px; width: 270px; flex: 0 0 270px; min-height: 0; }
.tpl-right { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 0; min-height: 0; }
.tpl-search, .tpl-textarea {
  width: 100%; color: var(--text); font: inherit;
  background: var(--sunken); border: 1px solid var(--line-strong); border-radius: 8px; outline: none;
  transition: border-color .12s ease, box-shadow .12s ease;
}
.tpl-search { height: 34px; padding: 0 10px; }
.tpl-search::placeholder, .tpl-textarea::placeholder { color: var(--text-3); }
.tpl-search:focus, .tpl-textarea:focus { border-color: var(--accent-line); box-shadow: 0 0 0 3px var(--accent-soft); }
.tpl-list-wrap { flex: 1; min-height: 0; max-height: 60vh; overflow: auto; padding-right: 4px; }
.tpl-list-wrap::-webkit-scrollbar, .tpl-textarea::-webkit-scrollbar { width: 8px; }
.tpl-list-wrap::-webkit-scrollbar-thumb, .tpl-textarea::-webkit-scrollbar-thumb {
  background: rgba(148,163,184,.25); border: 2px solid transparent; border-radius: 8px; background-clip: padding-box;
}
.tpl-category { margin: 12px 2px 6px; font-size: 12px; font-weight: 600; color: var(--text-2); }
.tpl-category:first-child { margin-top: 2px; }
.tpl-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.tpl-chip {
  display: flex; align-items: center;
  min-height: 40px; padding: 6px 9px;
  font: inherit; font-size: 12.5px; color: var(--text); text-align: left;
  background: var(--bg-3); border: 1px solid var(--line); border-radius: 8px; cursor: pointer;
  transition: background .12s ease, border-color .12s ease;
}
.tpl-chip:hover { background: var(--bg-hover); border-color: var(--line-strong); }
.tpl-chip.selected { color: var(--accent-ink); background: var(--accent-soft); border-color: var(--accent-line); }
.tpl-chip:focus-visible, .tpl-action-btn:focus-visible, .tpl-icon-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.tpl-chip-title {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; line-height: 1.3; word-break: break-word;
}
.tpl-empty { padding: 22px 10px; text-align: center; color: var(--text-3); }
.preview-panel {
  flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 10px;
  padding: 12px; background: var(--bg-2); border: 1px solid var(--line); border-radius: 10px;
}
.preview-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.preview-title { min-width: 0; font-size: 14px; font-weight: 600; word-break: break-word; }
.preview-category {
  flex: none; height: 22px; padding: 0 9px; display: inline-flex; align-items: center;
  font-size: 12px; font-weight: 600; color: var(--accent); background: var(--accent-soft); border-radius: 999px;
  white-space: nowrap;
}
.preview-category:empty { display: none; }
.tpl-textarea { flex: 1; min-height: 220px; max-height: 45vh; padding: 10px 12px; line-height: 1.55; resize: vertical; }
.tpl-textarea:disabled { opacity: .5; cursor: not-allowed; }
.preview-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-height: 22px; font-size: 12px; color: var(--text-3); }
.dirty-badge {
  height: 22px; padding: 0 9px; display: inline-flex; align-items: center;
  font-size: 12px; font-weight: 600; color: var(--warn); background: var(--warn-soft); border-radius: 999px;
}
.hidden { display: none !important; }
.preview-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.tpl-action-btn {
  height: 32px; padding: 0 12px;
  font: inherit; font-weight: 500; color: var(--text);
  background: var(--bg-3); border: 1px solid var(--line-strong); border-radius: 8px; cursor: pointer;
  transition: background .12s ease;
}
.tpl-action-btn:hover:not(:disabled) { background: var(--bg-hover); }
.tpl-action-btn:disabled { opacity: .45; cursor: not-allowed; }
.tpl-action-btn.primary { color: #fff; font-weight: 600; background: var(--primary); border-color: transparent; }
.tpl-action-btn.primary:hover:not(:disabled) { background: var(--primary-hover); }
.tpl-action-btn.ghost { margin-left: auto; color: var(--text-2); background: transparent; border-color: transparent; }
.preview-status { min-height: 18px; font-size: 12px; color: var(--text-3); }
.preview-status.error { color: var(--bad); }
.tpl-widget.minimized .tpl-main { display: none; }
@media (max-width: 760px) {
  :host { width: calc(100vw - 20px); left: 10px; top: 64px; }
  .tpl-main { flex-direction: column; }
  .tpl-left { width: 100%; flex: 0 0 auto; max-height: 260px; }
  .tpl-textarea { min-height: 160px; max-height: 35vh; }
}
@media (prefers-reduced-motion: reduce) { .tpl-widget { animation: none; } }
  `;

  const html = `
<div class="tpl-widget">
  <div class="tpl-header">
    <div class="tpl-brand">
      <span class="tpl-brand-ico">📑</span>
      <span class="tpl-title">Шаблоны ответов</span>
      <span class="tpl-count"></span>
    </div>
    <div class="tpl-actions">
      <button type="button" class="tpl-icon-btn" data-action="refresh" title="Обновить шаблоны" aria-label="Обновить">↻</button>
      <button type="button" class="tpl-icon-btn" data-action="min" title="Свернуть" aria-label="Свернуть">–</button>
      <button type="button" class="tpl-icon-btn" data-action="close" title="Скрыть" aria-label="Скрыть">✕</button>
    </div>
  </div>

  <div class="tpl-main">
    <section class="tpl-left">
      <input class="tpl-search" type="search" placeholder="Поиск по названию и тексту" />
      <div class="tpl-list-wrap">
        <div class="tpl-list"></div>
        <div class="tpl-empty hidden">Шаблоны не загружены</div>
      </div>
    </section>

    <section class="tpl-right">
      <div class="preview-panel">
        <div class="preview-head">
          <div class="preview-title">Выберите шаблон</div>
          <div class="preview-category"></div>
        </div>
        <textarea class="tpl-textarea" placeholder="Выберите шаблон слева — текст появится здесь, его можно поправить перед вставкой" disabled></textarea>
        <div class="preview-meta">
          <span class="dirty-badge hidden">Изменён локально</span>
          <span class="char-count"></span>
        </div>
        <div class="preview-actions">
          <button type="button" class="tpl-action-btn primary" data-action="insert" disabled>Вставить в поле</button>
          <button type="button" class="tpl-action-btn" data-action="copy" disabled>Копировать</button>
          <button type="button" class="tpl-action-btn ghost" data-action="reset" disabled>Сбросить правки</button>
        </div>
        <div class="preview-status">Ожидание загрузки…</div>
      </div>
    </section>
  </div>
</div>
  `;

  root.innerHTML = `<style>${css}</style>${html}`;

  const els = {
    widget: root.querySelector('.tpl-widget'),
    header: root.querySelector('.tpl-header'),
    search: root.querySelector('.tpl-search'),
    grid: root.querySelector('.tpl-list'),
    empty: root.querySelector('.tpl-empty'),
    previewTitle: root.querySelector('.preview-title'),
    previewCategory: root.querySelector('.preview-category'),
    textarea: root.querySelector('.tpl-textarea'),
    dirtyBadge: root.querySelector('.dirty-badge'),
    charCount: root.querySelector('.char-count'),
    copyBtn: root.querySelector('[data-action="copy"]'),
    insertBtn: root.querySelector('[data-action="insert"]'),
    resetBtn: root.querySelector('[data-action="reset"]'),
    previewStatus: root.querySelector('.preview-status'),
    refresh: root.querySelector('[data-action="refresh"]'),
    min: root.querySelector('[data-action="min"]'),
    close: root.querySelector('[data-action="close"]')
  };

  const state = {
    templates: [],
    selectedId: null,
    drafts: loadDrafts(),
    minimized: lsGet(LS_MIN) === '1'
  };

  let lastExternalField = null;

  // Шаблоны грузим лениво — только при первом открытии окна.
  let hasLoadedOnce = false;

  const onResize = () => clampPosition();
  const onBeforeUnload = () => savePosition();

  function onFocusIn(event) {
    if (!host.contains(event.target)) {
      lastExternalField = event.target;
    }
  }

  window.addEventListener('resize', onResize);
  window.addEventListener('beforeunload', onBeforeUnload);
  document.addEventListener('focusin', onFocusIn, true);

  function setPreviewStatus(message, isError = false) {
    els.previewStatus.textContent = message;
    els.previewStatus.classList.toggle('error', !!isError);
  }

  function savePosition() {
    try {
      const rect = host.getBoundingClientRect();
      lsSet(LS_POS, JSON.stringify({ left: rect.left, top: rect.top }));
    } catch (_) {}
  }

  function applySavedPosition() {
    let left = 18;
    let top = 84;

    try {
      const saved = JSON.parse(lsGet(LS_POS) || 'null');

      if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) {
        left = saved.left;
        top = saved.top;
      }
    } catch (_) {}

    host.style.left = left + 'px';
    host.style.top = top + 'px';

    requestAnimationFrame(clampPosition);
  }

  function clampPosition() {
    const rect = host.getBoundingClientRect();
    if (!rect.width) return;

    const left = Math.max(8, Math.min(window.innerWidth - rect.width - 8, rect.left));
    const top = Math.max(8, Math.min(window.innerHeight - 48, rect.top));

    host.style.left = left + 'px';
    host.style.top = top + 'px';
  }

  function setMinimized(value) {
    state.minimized = !!value;
    els.widget.classList.toggle('minimized', state.minimized);
    els.min.textContent = state.minimized ? '+' : '–';
    lsSet(LS_MIN, state.minimized ? '1' : '0');
  }

  function enableDragging() {
    let dragging = false;
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    els.header.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (event.target.closest('button, input, textarea, select')) return;

      dragging = true;
      pointerId = event.pointerId;
      els.header.setPointerCapture(pointerId);

      const rect = host.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;

      event.preventDefault();
    });

    els.header.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== pointerId) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const rect = host.getBoundingClientRect();

      const maxLeft = Math.max(8, window.innerWidth - rect.width - 8);
      const maxTop = Math.max(8, window.innerHeight - 48);

      const left = Math.max(8, Math.min(maxLeft, initialLeft + dx));
      const top = Math.max(8, Math.min(maxTop, initialTop + dy));

      host.style.left = left + 'px';
      host.style.top = top + 'px';
    });

    const stopDragging = (event) => {
      if (!dragging || (event && event.pointerId !== pointerId)) return;

      dragging = false;

      try {
        els.header.releasePointerCapture(pointerId);
      } catch (_) {}

      savePosition();
    };

    els.header.addEventListener('pointerup', stopDragging);
    els.header.addEventListener('pointercancel', stopDragging);
  }

  function humanizeCategory(category) {
    const map = {
      general: 'General',
      support: 'Support',
      finance: 'Finance',
      sales: 'Sales',
      tech: 'Tech',
      billing: 'Billing'
    };

    return map[category] || category;
  }

  function getSelectedTemplate() {
    return state.templates.find((item) => item.id === state.selectedId) || null;
  }

  function saveDrafts() {
    lsSet(LS_DRAFTS, JSON.stringify(state.drafts));
  }

  function updatePreviewMeta() {
    const tpl = getSelectedTemplate();

    if (!tpl) {
      els.dirtyBadge.classList.add('hidden');
      els.charCount.textContent = '';
      return;
    }

    const isDirty = normalizeEol(els.textarea.value) !== tpl.body;
    els.dirtyBadge.classList.toggle('hidden', !isDirty);
    els.charCount.textContent = `${els.textarea.value.length} симв.`;
  }

  function updatePreview() {
    const tpl = getSelectedTemplate();

    els.previewTitle.textContent = tpl ? tpl.title : 'Выберите шаблон';
    els.previewCategory.textContent = tpl ? humanizeCategory(tpl.category) : '';

    els.textarea.disabled = !tpl;
    els.copyBtn.disabled = !tpl;
    els.insertBtn.disabled = !tpl;
    els.resetBtn.disabled = !tpl;

    if (tpl) {
      const draft = draftFor(tpl);
      els.textarea.value = draft !== null ? draft : tpl.body;
      setPreviewStatus('Шаблон выбран. Можно скопировать или отредактировать.');
    } else {
      els.textarea.value = '';
      setPreviewStatus('Нажмите на кнопку слева, чтобы открыть шаблон.');
    }

    updatePreviewMeta();
  }

  function selectTemplate(id) {
    state.selectedId = id;
    renderChips();
    updatePreview();
  }

  function renderChips() {
    els.grid.textContent = '';

    const query = els.search.value.trim().toLowerCase();

    const items = state.templates.filter((item) => {
      if (!query) return true;
      return `${item.title} ${item.body} ${item.category}`.toLowerCase().includes(query);
    });

    if (!items.length) {
      els.empty.textContent = state.templates.length ? 'Ничего не найдено' : 'Шаблоны не загружены';
      els.empty.classList.remove('hidden');
      return;
    }

    els.empty.classList.add('hidden');

    const groups = new Map();

    for (const item of items) {
      if (!groups.has(item.category)) groups.set(item.category, []);
      groups.get(item.category).push(item);
    }

    for (const [category, list] of groups) {
      const categoryEl = document.createElement('div');
      categoryEl.className = 'tpl-category';
      categoryEl.textContent = humanizeCategory(category);
      els.grid.appendChild(categoryEl);

      const gridEl = document.createElement('div');
      gridEl.className = 'tpl-grid';

      for (const item of list) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'tpl-chip' + (item.id === state.selectedId ? ' selected' : '');
        chip.dataset.id = item.id;
        chip.title = item.title;

        const titleEl = document.createElement('span');
        titleEl.className = 'tpl-chip-title';
        titleEl.textContent = item.title;
        chip.appendChild(titleEl);

        chip.addEventListener('click', () => {
          selectTemplate(item.id);
        });

        gridEl.appendChild(chip);
      }

      els.grid.appendChild(gridEl);
    }
  }

  function isEditableField(el) {
    if (!el) return false;
    if (host.contains(el)) return false;

    if (el instanceof HTMLTextAreaElement) {
      return !el.readOnly && !el.disabled;
    }

    if (el instanceof HTMLInputElement) {
      if (el.readOnly || el.disabled) return false;

      const type = String(el.type || 'text').toLowerCase();
      const blocked = [
        'checkbox',
        'radio',
        'file',
        'image',
        'submit',
        'reset',
        'button',
        'range',
        'color'
      ];

      return !blocked.includes(type);
    }

    return !!el.isContentEditable;
  }

  function getInsertTarget() {
    const active = document.activeElement;

    if (isEditableField(active)) {
      return active;
    }

    if (lastExternalField && document.contains(lastExternalField) && isEditableField(lastExternalField)) {
      return lastExternalField;
    }

    return null;
  }

  function setNativeValue(element, value) {
    const proto = element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;

    const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');

    if (descriptor && descriptor.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }
  }

  function insertIntoInput(el, text) {
    const start = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
    const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : el.value.length;

    const nextValue = el.value.slice(0, start) + text + el.value.slice(end);
    setNativeValue(el, nextValue);

    const caret = start + text.length;

    try {
      el.setSelectionRange(caret, caret);
    } catch (_) {}

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function insertIntoContentEditable(el, text) {
    el.focus();

    let inserted = false;

    try {
      inserted = document.execCommand('insertText', false, text);
    } catch (_) {}

    if (!inserted) {
      const selection = window.getSelection();
      if (!selection) return;

      if (!selection.rangeCount) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      const range = selection.getRangeAt(0);
      range.deleteContents();

      const node = document.createTextNode(text);
      range.insertNode(node);

      range.setStartAfter(node);
      range.collapse(true);

      selection.removeAllRanges();
      selection.addRange(range);
    }

    el.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
      data: text
    }));
  }

  function insertIntoField(el, text) {
    if (!el) return false;

    el.focus();

    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
      insertIntoInput(el, text);
      return true;
    }

    if (el.isContentEditable) {
      insertIntoContentEditable(el, text);
      return true;
    }

    return false;
  }

  async function copyTextToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {}

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-1000px';
    textarea.style.opacity = '0';

    document.body.appendChild(textarea);
    textarea.select();

    let ok = false;

    try {
      ok = document.execCommand('copy');
    } catch (_) {}

    textarea.remove();

    return ok;
  }

  async function copyCurrent() {
    const text = els.textarea.value;

    if (!text) {
      setPreviewStatus('Пустой текст', true);
      return;
    }

    const ok = await copyTextToClipboard(text);

    if (ok) {
      setPreviewStatus('Скопировано в буфер обмена');
    } else {
      setPreviewStatus('Не удалось скопировать', true);
    }
  }

  async function insertCurrent() {
    const text = els.textarea.value;

    if (!text) {
      setPreviewStatus('Пустой текст', true);
      return;
    }

    const target = getInsertTarget();

    if (!target) {
      const ok = await copyTextToClipboard(text);
      setPreviewStatus(ok ? 'Активное поле не найдено — текст скопирован в буфер' : 'Активное поле не найдено, копирование не удалось', !ok);
      return;
    }

    const inserted = insertIntoField(target, text);

    if (inserted) {
      setPreviewStatus('Вставлено в поле');
    } else {
      const ok = await copyTextToClipboard(text);
      setPreviewStatus(ok ? 'Не удалось вставить — текст скопирован в буфер' : 'Не удалось вставить или скопировать', !ok);
    }
  }

  function resetCurrent() {
    const tpl = getSelectedTemplate();

    if (!tpl) return;

    delete state.drafts[tpl.id];
    saveDrafts();

    els.textarea.value = tpl.body;
    updatePreviewMeta();
    setPreviewStatus('Локальные правки сброшены');
  }

  function normalizeTemplates(data) {
    if (data && data.ok === false && data.error) {
      throw new Error(data.error);
    }

    if (data && data.status === 'not_modified') {
      return null;
    }

    let raw = [];

    if (Array.isArray(data)) {
      raw = data;
    } else if (data && Array.isArray(data.templates)) {
      raw = data.templates;
    } else {
      throw new Error('Неизвестный формат JSON-ответа');
    }

    const seen = new Set();

    return raw
      .filter((item) => item && item.title && item.body && item.enabled !== false)
      .map((item, index) => {
        const title = String(item.title).trim();
        // Поле <textarea> всегда хранит переносы как \n. Если в таблице текст с \r\n
        // (многострочные ячейки), без нормализации шаблон сразу считался «изменённым».
        const body = String(item.body).replace(/\r\n?/g, '\n');
        const category = String(item.category || 'general').trim() || 'general';
        const id = item.id ? String(item.id) : `tpl_${category}_${title}`;

        return {
          id,
          title,
          body,
          category
        };
      })
      .filter((item) => {
        if (!item.title) return false;
        // Одинаковые название и категория без id с сервера — не теряем шаблон, а нумеруем.
        if (seen.has(item.id) && item.id.startsWith('tpl_')) {
          let n = 2;
          while (seen.has(`${item.id}_${n}`)) n++;
          item.id = `${item.id}_${n}`;
        }
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  }

  /**
   * Загрузка шаблонов: напрямую, а при ошибке — через bg.js.
   * (Прежний JSONP-запасной путь не мог работать: колбэк объявлялся в мире
   * контент-скрипта, а <script> выполнялся в мире страницы.)
   */
  async function fetchWithJsonpFallback() {
    const url = new URL(ENDPOINT);
    url.searchParams.set('_', String(Date.now()));

    let firstError = null;
    try {
      const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store', credentials: 'omit', redirect: 'follow' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return await response.json();
    } catch (err) {
      firstError = err;
      console.warn('[Templates] прямой запрос не сработал, пробую через расширение:', err);
    }

    try {
      return await crmRequestJson(url.toString(), { method: 'GET', cache: 'no-store' });
    } catch (bgError) {
      throw new Error(`${firstError.message} / ${bgError.message}`);
    }
  }

  async function loadTemplates() {
    setPreviewStatus('Загрузка...');

    try {
      const data = await fetchWithJsonpFallback();
      const templates = normalizeTemplates(data);

      if (templates === null) {
        setPreviewStatus('Изменений нет');
        renderChips();
        updatePreview();
        return;
      }

      state.templates = templates;

      if (state.selectedId && !state.templates.some((t) => t.id === state.selectedId)) {
        state.selectedId = null;
      }

      renderChips();
      updatePreview();

      setPreviewStatus(`Загружено шаблонов: ${templates.length}`);
      root.querySelector('.tpl-count').textContent = String(templates.length);
    } catch (err) {
      console.error('[TemplateWidgetCyberV3]', err);

      const message = String(err && err.message ? err.message : err);
      setPreviewStatus('Ошибка: ' + message.slice(0, 140), true);

      els.grid.textContent = '';
      els.empty.textContent = 'Не удалось загрузить шаблоны';
      els.empty.classList.remove('hidden');
    }
  }

  function destroyWidget() {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('beforeunload', onBeforeUnload);
    document.removeEventListener('focusin', onFocusIn, true);
    savePosition();
    host.remove();
    delete window.__TPL_WIDGET_CYBER_V3__;
  }

  /** Показать окно шаблонов (возвращает host в DOM, если он был удалён). */
  function showWidget() {
    if (!document.body.contains(host)) {
      (document.body || document.documentElement).appendChild(host);
    }

    host.style.display = '';
    applySavedPosition();

    // Шаблоны подгружаем только при первом открытии — нет лишних запросов на каждой странице.
    if (!hasLoadedOnce) {
      hasLoadedOnce = true;
      loadTemplates();
    }
  }

  /** Скрыть окно шаблонов, не удаляя его из DOM (как у остальных модулей). */
  function hideWidget() {
    savePosition();
    host.style.display = 'none';
  }

  /** Переключить видимость окна шаблонов (открыть/закрыть). */
  function toggleWidget() {
    if (host.style.display === 'none') {
      showWidget();
    } else {
      hideWidget();
    }
  }

  els.refresh.addEventListener('click', loadTemplates);
  els.min.addEventListener('click', () => setMinimized(!state.minimized));
  els.close.addEventListener('click', hideWidget);
  els.search.addEventListener('input', renderChips);

  els.copyBtn.addEventListener('click', copyCurrent);
  els.insertBtn.addEventListener('click', insertCurrent);
  els.resetBtn.addEventListener('click', resetCurrent);

  els.textarea.addEventListener('input', () => {
    const tpl = getSelectedTemplate();
    if (!tpl) return;

    const text = els.textarea.value;
    if (normalizeEol(text) === tpl.body || !text.trim()) {
      delete state.drafts[tpl.id];
    } else {
      state.drafts[tpl.id] = { text, base: fingerprint(tpl.body) };
    }

    saveDrafts();
    updatePreviewMeta();
  });

  window.__TPL_WIDGET_CYBER_V3__ = {
    show: showWidget,
    hide: hideWidget,
    toggle: toggleWidget,
    destroy: destroyWidget
  };

  /* ============================================================
   *  КНОПКА «📑TEMPLATES» В МЕНЮ РАСШИРЕНИЯ
   *  Обработчик навешивает сам модуль (как Smartroom.js,
   *  LessonStatus.js, SettingsApp.js и др.) — к моменту загрузки
   *  модуля меню уже построено в content.js.
   * ============================================================ */
  const templatesMenuButton = document.getElementById('templatesCRM');

  if (templatesMenuButton) {
    templatesMenuButton.onclick = function () {
      toggleWidget();

      // Клик по пункту меню всегда закрывает само меню модулей.
      const menu = document.getElementById('idmymenucrm');
      if (menu) menu.style.display = 'none';
    };
  }

  enableDragging();
  applySavedPosition();
  setMinimized(state.minimized);
  updatePreview();

  // Стартуем свёрнутым: окно открывается по кнопке меню «📑Templates».
  host.style.display = 'none';
})();