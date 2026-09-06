/**
 * NotificationSystem.js — Unified Toast Handler (Premium v2.1)
 * ============================================================
 * Центрирование по умолчанию, адаптивность под любое разрешение,
 * безупречный таймер на requestAnimationFrame и строгий премиальный дизайн.
 */

(function () {
    'use strict';

    const CONFIG = {
        // 'bottom-center' (рекомендуется), 'top-center', 'center' (строго по центру), 'bottom-right'
        position: 'bottom-center',
        defaultDuration: 5000,    // мс
        maxVisible: 3,            // Уменьшил до 3, чтобы в центре не было "стены" текста
    };

    const THEMES = {
        success: {
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            bg: 'rgba(15, 23, 42, 0.95)',
            border: 'rgba(16, 185, 129, 0.4)',
            accent: '#10b981',
            glow: 'rgba(16, 185, 129, 0.15)'
        },
        error: {
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            bg: 'rgba(15, 23, 42, 0.95)',
            border: 'rgba(244, 63, 94, 0.4)',
            accent: '#f43f5e',
            glow: 'rgba(244, 63, 94, 0.15)'
        },
        warning: {
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            bg: 'rgba(15, 23, 42, 0.95)',
            border: 'rgba(245, 158, 11, 0.4)',
            accent: '#f59e0b',
            glow: 'rgba(245, 158, 11, 0.15)'
        },
        info: {
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            bg: 'rgba(15, 23, 42, 0.95)',
            border: 'rgba(56, 189, 248, 0.4)',
            accent: '#38bdf8',
            glow: 'rgba(56, 189, 248, 0.15)'
        },
        message: {
            icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
            bg: 'rgba(15, 23, 42, 0.95)',
            border: 'rgba(148, 163, 184, 0.3)',
            accent: '#cbd5e1',
            glow: 'rgba(148, 163, 184, 0.1)'
        }
    };

    const STYLES = `
        :host { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif; }
        *, *::before, *::after { box-sizing: border-box; }

        .chmaf-container {
            position: fixed;
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
            pointer-events: none;
            width: 100%;
            max-width: 420px; /* Ограничиваем ширину для красивого вида по центру */
        }

        /* Позиционирование */
        .chmaf-container.bottom-right { bottom: 24px; right: 24px; max-width: 380px; }
        .chmaf-container.top-right    { top: 24px; right: 24px; max-width: 380px; }

        .chmaf-container.bottom-center {
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            align-items: center;
        }

        .chmaf-container.top-center {
            top: 32px;
            left: 50%;
            transform: translateX(-50%);
            align-items: center;
        }

        .chmaf-container.center {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            align-items: center;
        }

        .chmaf-toast {
            position: relative;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
            border: 1px solid;
            backdrop-filter: blur(16px) saturate(180%);
            -webkit-backdrop-filter: blur(16px) saturate(180%);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05) inset;
            color: #f8fafc;
            font-size: 13px;
            line-height: 1.4;
            pointer-events: auto;
            opacity: 0;
            /* Анимация работает относительно текущего положения контейнера */
            transform: translateY(16px) scale(0.96);
            transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
        }

        .chmaf-toast.show { opacity: 1; transform: translateY(0) scale(1); }
        .chmaf-toast.hide { opacity: 0; transform: translateY(8px) scale(0.96); pointer-events: none; }

        .chmaf-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 8px;
            flex-shrink: 0;
            margin-top: 1px;
            background: rgba(255, 255, 255, 0.06);
            color: var(--accent-color);
        }

        .chmaf-content { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .chmaf-title { font-weight: 600; font-size: 13px; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .chmaf-message { font-weight: 400; font-size: 13px; color: #cbd5e1; white-space: pre-wrap; word-break: break-word; }

        .chmaf-close {
            display: flex; align-items: center; justify-content: center;
            width: 24px; height: 24px; border-radius: 6px;
            background: transparent; border: none;
            color: #64748b; cursor: pointer; flex-shrink: 0;
            transition: all 0.2s ease;
        }
        .chmaf-close:hover { background: rgba(255, 255, 255, 0.1); color: #ffffff; }
        .chmaf-close svg { width: 14px; height: 14px; }

        .chmaf-progress {
            position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
            background: rgba(255, 255, 255, 0.06);
        }
        .chmaf-progress-bar {
            height: 100%; width: 100%; background: var(--accent-color);
            transform-origin: left;
            will-change: transform;
        }

        .chmaf-timer {
            position: absolute; top: 8px; right: 12px;
            font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums;
            color: #64748b; pointer-events: none;
        }

        /* Адаптив для мобильных устройств */
        @media (max-width: 480px) {
            .chmaf-container {
                max-width: calc(100vw - 32px);
                bottom: 16px;
                padding: 0 16px;
            }
            .chmaf-container.center, .chmaf-container.top-center {
                top: 16px;
            }
        }
    `;

    let shadowHost = null;
    let shadowRoot = null;
    let container = null;
    let activeToasts = new Map();
    let toastQueue = [];
    let isInitialized = false;

    function init() {
        if (isInitialized) return;
        shadowHost = document.createElement('div');
        shadowHost.id = 'chmaf-toast-host';
        shadowHost.style.display = 'contents';
        document.body.appendChild(shadowHost);

        shadowRoot = shadowHost.attachShadow({ mode: 'open' });
        const styleEl = document.createElement('style');
        styleEl.textContent = STYLES;
        shadowRoot.appendChild(styleEl);

        container = document.createElement('div');
        container.className = `chmaf-container ${CONFIG.position}`;
        shadowRoot.appendChild(container);
        isInitialized = true;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showNotification(message, type = 'message', options = {}) {
        init();

        if (typeof message === 'object' && message !== null) {
            options = { ...message };
            type = options.type || 'message';
            message = options.message || '';
        }

        if (message instanceof Error || (message && message.message)) {
            message = message.message;
        }

        const theme = THEMES[type] || THEMES.message;
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const duration = options.duration ?? CONFIG.defaultDuration;

        const toast = document.createElement('div');
        toast.className = 'chmaf-toast';
        toast.dataset.id = id;

        toast.style.setProperty('--accent-color', theme.accent);
        toast.style.background = theme.bg;
        toast.style.borderColor = theme.border;
        toast.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4), 0 0 24px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`;

        const safeMessage = options.html ? String(message) : escapeHtml(String(message));
        const titleHtml = options.title ? `<div class="chmaf-title">${escapeHtml(options.title)}</div>` : '';

        toast.innerHTML = `
            <div class="chmaf-icon">${theme.icon}</div>
            <div class="chmaf-content">
                ${titleHtml}
                <div class="chmaf-message">${safeMessage}</div>
            </div>
            <button class="chmaf-close" aria-label="Закрыть">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div class="chmaf-timer"></div>
            <div class="chmaf-progress"><div class="chmaf-progress-bar"></div></div>
        `;

        if (activeToasts.size >= CONFIG.maxVisible) {
            toastQueue.push({ id, toast, type, message, options, duration });
            return id;
        }

        mountToast(toast, id, duration);
        return id;
    }

    function mountToast(toast, id, duration) {
        container.appendChild(toast);

        const state = {
            element: toast,
            duration: duration,
            startTime: Date.now(),
            totalPausedTime: 0,
            pauseStartTime: 0,
            isPaused: false,
            rafId: null
        };
        activeToasts.set(id, state);

        // Небольшая задержка для срабатывания CSS transition
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('show'));
        });

        const progressBar = toast.querySelector('.chmaf-progress-bar');
        const timerEl = toast.querySelector('.chmaf-timer');

        const tick = () => {
            if (state.isPaused) {
                state.rafId = requestAnimationFrame(tick);
                return;
            }

            const now = Date.now();
            const elapsed = now - state.startTime - state.totalPausedTime;
            const remaining = Math.max(0, duration - elapsed);

            if (progressBar) {
                progressBar.style.transform = `scaleX(${remaining / duration})`;
            }
            if (timerEl && duration > 0) {
                timerEl.textContent = `${Math.ceil(remaining / 1000)}с`;
            }

            if (remaining <= 0) {
                dismiss(id);
            } else {
                state.rafId = requestAnimationFrame(tick);
            }
        };

        state.rafId = requestAnimationFrame(tick);

        toast.addEventListener('mouseenter', () => {
            state.isPaused = true;
            state.pauseStartTime = Date.now();
        });

        toast.addEventListener('mouseleave', () => {
            state.isPaused = false;
            state.totalPausedTime += (Date.now() - state.pauseStartTime);
        });

        toast.querySelector('.chmaf-close').addEventListener('click', () => dismiss(id));
    }

    function dismiss(id) {
        const state = activeToasts.get(id);
        if (!state) {
            const qIndex = toastQueue.findIndex(t => t.id === id);
            if (qIndex !== -1) toastQueue.splice(qIndex, 1);
            return;
        }

        if (state.rafId) cancelAnimationFrame(state.rafId);

        const { element } = state;
        element.classList.remove('show');
        element.classList.add('hide');

        setTimeout(() => {
            if (element.parentNode) element.parentNode.removeChild(element);
            activeToasts.delete(id);
            processQueue();
        }, 350);
    }

    function processQueue() {
        if (toastQueue.length === 0 || activeToasts.size >= CONFIG.maxVisible) return;
        const next = toastQueue.shift();
        mountToast(next.toast, next.id, next.duration);
    }

    const API = {
        show: showNotification,
        success: (msg, title) => showNotification(msg, 'success', { title }),
        error: (msg, title) => showNotification(msg, 'error', { title }),
        warning: (msg, title) => showNotification(msg, 'warning', { title }),
        info: (msg, title) => showNotification(msg, 'info', { title }),
        dismiss,
        dismissAll: () => {
            Array.from(activeToasts.keys()).forEach(dismiss);
            toastQueue = [];
        },
        // Позволяет изменить позицию на лету, если нужно
        setPosition: (newPosition) => {
            if (container) {
                container.className = `chmaf-container ${newPosition}`;
            }
        }
    };

    if (typeof window.createAndShowButton === 'undefined') {
        window.createAndShowButton = (msg, type = 'message') => API.show(msg, type, { html: true });
    }

    window.NotificationSystem = API;
    window.showNotification = API.show;
    window.showSuccess = API.success;
    window.showError = API.error;
    window.showWarning = API.warning;
    window.showInfo = API.info;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();