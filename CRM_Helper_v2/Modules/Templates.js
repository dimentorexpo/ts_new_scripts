(() => {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbxAh4LR8dnxdrMtDIdxWM4-lecA6u5vhrCSfP-ky7dLvlJUoN-jljJsLWLbAkupvDs/exec';

  const LS_POS = 'tplWidgetCyberV3.pos';
  const LS_MIN = 'tplWidgetCyberV3.min';
  const LS_DRAFTS = 'tplWidgetCyberV3.drafts';

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
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch (_) {
      return {};
    }
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
  z-index: 2147483647;
  display: block;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  color: #e5f7ff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.cyber-widget {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 36px);
  background:
    radial-gradient(circle at 12% 0%, rgba(34, 211, 238, 0.18), transparent 30%),
    radial-gradient(circle at 88% 8%, rgba(244, 114, 182, 0.14), transparent 28%),
    radial-gradient(circle at 50% 100%, rgba(168, 85, 247, 0.12), transparent 35%),
    linear-gradient(180deg, rgba(4, 7, 18, 0.96), rgba(9, 13, 28, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 30px 38px 28px 42px / 38px 28px 42px 30px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.58),
    0 0 34px rgba(34, 211, 238, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(18px) saturate(140%);
}

.cyber-widget::before {
  content: "";
  position: absolute;
  inset: -45%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 25% 25%, rgba(34, 211, 238, 0.18), transparent 28%),
    radial-gradient(circle at 75% 35%, rgba(244, 114, 182, 0.14), transparent 26%),
    radial-gradient(circle at 50% 75%, rgba(168, 85, 247, 0.16), transparent 30%);
  filter: blur(28px);
  opacity: 0.65;
  animation: cyberAurora 16s ease-in-out infinite alternate;
}

.cyber-widget::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  border-radius: inherit;
  box-shadow:
    inset 0 0 0 1px rgba(34, 211, 238, 0.10),
    inset 0 0 30px rgba(34, 211, 238, 0.04);
}

@keyframes cyberAurora {
  0% {
    transform: translate3d(-4%, -2%, 0) scale(1);
  }
  100% {
    transform: translate3d(4%, 3%, 0) scale(1.08);
  }
}

.cyber-header,
.cyber-main {
  position: relative;
  z-index: 2;
}

.cyber-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 14px;
  cursor: grab;
  user-select: none;
  touch-action: none;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.018));
  border-bottom: 1px solid rgba(255, 255, 255, 0.075);
}

.cyber-header:active {
  cursor: grabbing;
}

.cyber-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.cyber-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow:
    0 0 12px rgba(34, 211, 238, 0.95),
    0 0 24px rgba(34, 211, 238, 0.45);
  animation: cyberPulse 2.4s ease-in-out infinite;
}

@keyframes cyberPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.9;
  }
  50% {
    transform: scale(1.25);
    opacity: 1;
  }
}

.cyber-title {
  min-width: 0;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: linear-gradient(90deg, #67e8f9, #c084fc, #f9a8d4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cyber-actions {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: 0 0 auto;
}

.cyber-icon-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.045);
  color: #cbd5e1;
  border-radius: 12px 15px 11px 16px / 15px 11px 16px 12px;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.cyber-icon-btn:hover {
  color: #22d3ee;
  border-color: rgba(34, 211, 238, 0.42);
  background: rgba(34, 211, 238, 0.09);
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.16);
  transform: translateY(-1px);
}

.cyber-icon-btn:active {
  transform: translateY(0);
}

.cyber-main {
  display: flex;
  gap: 12px;
  padding: 12px;
  min-height: 0;
}

.cyber-left {
  width: 260px;
  flex: 0 0 260px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.cyber-right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.cyber-search {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 17px 20px 16px 21px / 20px 16px 21px 17px;
  background: rgba(2, 6, 23, 0.58);
  color: #e2e8f0;
  font: inherit;
  font-size: 13px;
  outline: none;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.cyber-search::placeholder {
  color: #64748b;
}

.cyber-search:focus {
  border-color: rgba(34, 211, 238, 0.55);
  background: rgba(2, 6, 23, 0.72);
  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.10),
    inset 0 0 18px rgba(34, 211, 238, 0.07);
}

.cyber-list-wrap {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

.cyber-list-wrap::-webkit-scrollbar,
.cyber-textarea::-webkit-scrollbar {
  width: 8px;
}

.cyber-list-wrap::-webkit-scrollbar-track,
.cyber-textarea::-webkit-scrollbar-track {
  background: transparent;
}

.cyber-list-wrap::-webkit-scrollbar-thumb,
.cyber-textarea::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.45), rgba(168, 85, 247, 0.35));
  border-radius: 999px;
}

.cyber-category {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 4px 7px;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7dd3fc;
}

.cyber-category::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(125, 211, 252, 0.35), transparent);
}

.cyber-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 8px;
}

.cyber-chip {
  position: relative;
  height: 62px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 7px 8px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 18px 22px 16px 24px / 22px 16px 24px 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.025));
  color: #e5e7eb;
  cursor: pointer;
  overflow: hidden;
  text-align: center;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}

.cyber-chip::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at var(--x, 50%) var(--y, 0%),
    rgba(34, 211, 238, 0.18),
    transparent 45%
  );
  opacity: 0;
  transition: opacity 0.18s ease;
}

.cyber-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.34);
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.10), rgba(255, 255, 255, 0.035));
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.28),
    0 0 22px rgba(34, 211, 238, 0.10);
}

.cyber-chip:hover::before {
  opacity: 1;
}

.cyber-chip:active {
  transform: translateY(0);
}

.cyber-chip.selected {
  border-color: rgba(34, 211, 238, 0.62);
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.18), rgba(168, 85, 247, 0.10));
  box-shadow:
    0 0 0 1px rgba(34, 211, 238, 0.18),
    0 0 24px rgba(34, 211, 238, 0.18),
    inset 0 0 18px rgba(34, 211, 238, 0.08);
}

.cyber-chip-title {
  position: relative;
  z-index: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.2;
  color: #f8fafc;
  word-break: break-word;
}

.cyber-chip-category {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  font-size: 9px;
  line-height: 1.1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cyber-empty {
  padding: 18px 10px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
}

.preview-panel {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 24px 28px 22px 30px / 28px 22px 30px 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.018)),
    rgba(2, 6, 23, 0.34);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 12px 30px rgba(0, 0, 0, 0.18);
}

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.preview-title {
  min-width: 0;
  font-size: 14px;
  font-weight: 900;
  color: #f8fafc;
  word-break: break-word;
}

.preview-category {
  flex: 0 0 auto;
  padding: 4px 8px;
  border: 1px solid rgba(125, 211, 252, 0.22);
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.08);
  color: #7dd3fc;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.cyber-textarea {
  flex: 1;
  min-height: 220px;
  max-height: 45vh;
  box-sizing: border-box;
  width: 100%;
  resize: vertical;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 18px 22px 16px 24px / 22px 16px 24px 18px;
  background: rgba(2, 6, 23, 0.58);
  color: #e2e8f0;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  outline: none;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.cyber-textarea::placeholder {
  color: #64748b;
}

.cyber-textarea:focus {
  border-color: rgba(34, 211, 238, 0.55);
  background: rgba(2, 6, 23, 0.72);
  box-shadow:
    0 0 0 3px rgba(34, 211, 238, 0.10),
    inset 0 0 18px rgba(34, 211, 238, 0.07);
}

.cyber-textarea:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.preview-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 18px;
  font-size: 11px;
  color: #94a3b8;
}

.dirty-badge {
  padding: 3px 8px;
  border: 1px solid rgba(244, 114, 182, 0.28);
  border-radius: 999px;
  background: rgba(244, 114, 182, 0.10);
  color: #fbcfe8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hidden {
  display: none !important;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cyber-action-btn {
  min-height: 36px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px 17px 13px 18px / 17px 13px 18px 14px;
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease,
    color 0.16s ease;
}

.cyber-action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.38);
  background: rgba(34, 211, 238, 0.10);
  color: #cffafe;
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.12);
}

.cyber-action-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.cyber-action-btn.primary {
  border-color: rgba(34, 211, 238, 0.38);
  background: linear-gradient(180deg, rgba(34, 211, 238, 0.18), rgba(34, 211, 238, 0.08));
  color: #cffafe;
}

.cyber-action-btn.secondary {
  border-color: rgba(168, 85, 247, 0.28);
  background: linear-gradient(180deg, rgba(168, 85, 247, 0.14), rgba(168, 85, 247, 0.06));
  color: #ede9fe;
}

.cyber-action-btn.ghost {
  border-color: rgba(244, 114, 182, 0.22);
  background: rgba(244, 114, 182, 0.07);
  color: #fbcfe8;
}

.preview-status {
  min-height: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.preview-status.error {
  color: #fb7185;
}

.cyber-widget.minimized .cyber-main {
  display: none;
}

@media (max-width: 760px) {
  :host {
    width: calc(100vw - 20px);
    left: 10px;
    top: 64px;
  }

  .cyber-main {
    flex-direction: column;
  }

  .cyber-left {
    width: 100%;
    flex: 0 0 auto;
    max-height: 260px;
  }

  .cyber-right {
    width: 100%;
  }

  .cyber-textarea {
    min-height: 160px;
    max-height: 35vh;
  }
}
  `;

  const html = `
<div class="cyber-widget">
  <div class="cyber-header">
    <div class="cyber-brand">
      <span class="cyber-dot"></span>
      <div class="cyber-title">Templates</div>
    </div>

    <div class="cyber-actions">
      <button class="cyber-icon-btn" data-action="refresh" title="Обновить">↻</button>
      <button class="cyber-icon-btn" data-action="min" title="Свернуть/развернуть">–</button>
      <button class="cyber-icon-btn" data-action="close" title="Закрыть">×</button>
    </div>
  </div>

  <div class="cyber-main">
    <section class="cyber-left">
      <input class="cyber-search" type="search" placeholder="Поиск по шаблонам..." />

      <div class="cyber-list-wrap">
        <div class="cyber-grid"></div>
        <div class="cyber-empty hidden">Шаблоны не загружены</div>
      </div>
    </section>

    <section class="cyber-right">
      <div class="preview-panel">
        <div class="preview-head">
          <div class="preview-title">Выберите шаблон</div>
          <div class="preview-category"></div>
        </div>

        <textarea
          class="cyber-textarea"
          placeholder="Нажмите на кнопку слева, чтобы увидеть текст шаблона..."
          disabled
        ></textarea>

        <div class="preview-meta">
          <span class="dirty-badge hidden">Изменено локально</span>
          <span class="char-count"></span>
        </div>

        <div class="preview-actions">
          <button class="cyber-action-btn primary" data-action="copy" disabled>Копировать</button>
          <button class="cyber-action-btn secondary" data-action="insert" disabled>Вставить в поле</button>
          <button class="cyber-action-btn ghost" data-action="reset" disabled>Сбросить правки</button>
        </div>

        <div class="preview-status">Ожидание загрузки...</div>
      </div>
    </section>
  </div>
</div>
  `;

  root.innerHTML = `<style>${css}</style>${html}`;

  const els = {
    widget: root.querySelector('.cyber-widget'),
    header: root.querySelector('.cyber-header'),
    search: root.querySelector('.cyber-search'),
    grid: root.querySelector('.cyber-grid'),
    empty: root.querySelector('.cyber-empty'),
    previewTitle: root.querySelector('.preview-title'),
    previewCategory: root.querySelector('.preview-category'),
    textarea: root.querySelector('.cyber-textarea'),
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

    const isDirty = els.textarea.value !== tpl.body;
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
      const draft = state.drafts[tpl.id];
      els.textarea.value = typeof draft === 'string' ? draft : tpl.body;
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
      categoryEl.className = 'cyber-category';
      categoryEl.textContent = humanizeCategory(category);
      els.grid.appendChild(categoryEl);

      const gridEl = document.createElement('div');
      gridEl.className = 'cyber-grid';

      for (const item of list) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'cyber-chip' + (item.id === state.selectedId ? ' selected' : '');
        chip.dataset.id = item.id;
        chip.title = item.body;

        const titleEl = document.createElement('span');
        titleEl.className = 'cyber-chip-title';
        titleEl.textContent = item.title;

        const categoryShortEl = document.createElement('span');
        categoryShortEl.className = 'cyber-chip-category';
        categoryShortEl.textContent = humanizeCategory(item.category);

        chip.appendChild(titleEl);
        chip.appendChild(categoryShortEl);

        chip.addEventListener('pointermove', (event) => {
          const rect = chip.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          chip.style.setProperty('--x', x + '%');
          chip.style.setProperty('--y', y + '%');
        });

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
        const id = String(item.id || `tpl_${index}`);
        const title = String(item.title).trim();
        const body = String(item.body);
        const category = String(item.category || 'general').trim() || 'general';

        return {
          id,
          title,
          body,
          category
        };
      })
      .filter((item) => {
        if (!item.title || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  }

  async function fetchWithJsonpFallback() {
    const url = new URL(ENDPOINT);
    url.searchParams.set('_', String(Date.now()));

    let fetchError = null;

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store',
        mode: 'cors',
        credentials: 'omit',
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const text = await response.text();

      try {
        return JSON.parse(text);
      } catch (_) {
        throw new Error('Ответ не JSON: ' + text.slice(0, 160));
      }
    } catch (err) {
      fetchError = err;
      console.warn('[TemplateWidgetCyberV3] fetch не сработал, пробую JSONP:', err);
    }

    try {
      return await loadViaJsonp();
    } catch (jsonpError) {
      throw new Error(`${fetchError.message} | JSONP: ${jsonpError.message}`);
    }
  }

  function loadViaJsonp(timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const callbackName = '__tplCyberV3JsonpCb_' + Math.random().toString(36).slice(2) + '_' + Date.now().toString(36);
      const url = new URL(ENDPOINT);

      url.searchParams.set('callback', callbackName);
      url.searchParams.set('_', String(Date.now()));

      const script = document.createElement('script');
      script.async = true;

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('timeout'));
      }, timeoutMs);

      function cleanup() {
        clearTimeout(timer);
        delete window[callbackName];

        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('не удалось загрузить JSONP-скрипт'));
      };

      script.src = url.toString();
      (document.head || document.documentElement).appendChild(script);
    });
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

    if (els.textarea.value === tpl.body) {
      delete state.drafts[tpl.id];
    } else {
      state.drafts[tpl.id] = els.textarea.value;
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