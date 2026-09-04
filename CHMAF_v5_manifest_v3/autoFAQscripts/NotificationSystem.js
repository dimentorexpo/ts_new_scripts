/**
 * NotificationSystem.js — Unified Toast & Error Handler
 * ======================================================
 * Единая система уведомлений (toast) и глобальная обработка ошибок.
 * Используется всеми скриптами расширения для согласованного UI.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Конфигурация
// ═══════════════════════════════════════════════════════════════════════════════

const NOTIFICATION_CONFIG = {
    /** Позиция уведомлений на экране */
    position: 'bottom-center',
    /** Время автоматического скрытия (мс) */
    autoHideDelay: 5000,
    /** Время показа (мс) */
    showDelay: 10,
    /** Максимальное количество одновременных уведомлений */
    maxVisible: 5,
    /** Длительность анимации */
    animationDuration: 300,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Типы уведомлений
// ═══════════════════════════════════════════════════════════════════════════════

const NOTIFICATION_TYPES = {
    success: {
        icon: '✅',
        bg: 'rgba(16, 185, 129, 0.95)',
        border: 'rgba(16, 185, 129, 0.3)',
        color: '#ffffff',
        glow: 'rgba(16, 185, 129, 0.4)',
        label: 'Успешно',
    },
    error: {
        icon: '❌',
        bg: 'rgba(239, 68, 68, 0.95)',
        border: 'rgba(239, 68, 68, 0.3)',
        color: '#ffffff',
        glow: 'rgba(239, 68, 68, 0.4)',
        label: 'Ошибка',
    },
    warning: {
        icon: '⚠️',
        bg: 'rgba(245, 158, 11, 0.95)',
        border: 'rgba(245, 158, 11, 0.3)',
        color: '#0f111a',
        glow: 'rgba(245, 158, 11, 0.4)',
        label: 'Внимание',
    },
    info: {
        icon: 'ℹ️',
        bg: 'rgba(59, 130, 246, 0.95)',
        border: 'rgba(59, 130, 246, 0.3)',
        color: '#ffffff',
        glow: 'rgba(59, 130, 246, 0.4)',
        label: 'Информация',
    },
    message: {
        icon: '💬',
        bg: 'rgba(99, 102, 241, 0.95)',
        border: 'rgba(99, 102, 241, 0.3)',
        color: '#ffffff',
        glow: 'rgba(99, 102, 241, 0.4)',
        label: 'Уведомление',
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Стили (инжектятся при первом использовании)
// ═══════════════════════════════════════════════════════════════════════════════

const NOTIFICATION_STYLES = `
    /* ════════════════════════════════════════════════════════
       TOAST CONTAINER
       ════════════════════════════════════════════════════════ */
    .chmaf-toast-container {
        position: fixed;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 16px;
        pointer-events: none;
    }

    .chmaf-toast-container.bottom-center {
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
    }

    .chmaf-toast-container.top-center {
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
    }

    .chmaf-toast-container.bottom-right {
        bottom: 20px;
        right: 20px;
        align-items: flex-end;
    }

    .chmaf-toast-container.top-right {
        top: 20px;
        right: 20px;
        align-items: flex-end;
    }

    /* ════════════════════════════════════════════════════════
       TOAST ITEM
       ════════════════════════════════════════════════════════ */
    .chmaf-toast {
        position: relative;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 450px;
        padding: 12px 16px;
        padding-bottom: 18px;
        background: rgba(20, 20, 35, 0.95);
        backdrop-filter: blur(20px) saturate(200%);
        -webkit-backdrop-filter: blur(20px) saturate(200%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 14px;
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.45),
            0 0 24px rgba(99, 102, 241, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.4;
        pointer-events: auto;
        transform: translateY(20px) scale(0.97);
        opacity: 0;
        overflow: hidden;
        transition:
            transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
            opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .chmaf-toast.show {
        transform: translateY(0) scale(1);
        opacity: 1;
    }

    .chmaf-toast.hide {
        transform: translateY(20px);
        opacity: 0;
    }

    /* Типы уведомлений */
    .chmaf-toast.success {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
        border-color: rgba(16, 185, 129, 0.35);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 28px rgba(16, 185, 129, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .chmaf-toast.success .chmaf-toast-progress-bar { background: rgba(255,255,255,0.35); }
    .chmaf-toast.success .chmaf-toast-timer { color: rgba(255,255,255,0.8); }

    .chmaf-toast.error {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(185, 28, 28, 0.95) 100%);
        border-color: rgba(239, 68, 68, 0.35);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 28px rgba(239, 68, 68, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .chmaf-toast.error .chmaf-toast-progress-bar { background: rgba(255,255,255,0.35); }
    .chmaf-toast.error .chmaf-toast-timer { color: rgba(255,255,255,0.8); }

    .chmaf-toast.warning {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%);
        border-color: rgba(245, 158, 11, 0.35);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 28px rgba(245, 158, 11, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .chmaf-toast.warning .chmaf-toast-progress-bar { background: rgba(15,17,26,0.3); }
    .chmaf-toast.warning .chmaf-toast-timer { color: rgba(15,17,26,0.7); }

    .chmaf-toast.info,
    .chmaf-toast.message {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%);
        border-color: rgba(99, 102, 241, 0.35);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 28px rgba(99, 102, 241, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .chmaf-toast.info .chmaf-toast-progress-bar,
    .chmaf-toast.message .chmaf-toast-progress-bar { background: rgba(255,255,255,0.35); }
    .chmaf-toast.info .chmaf-toast-timer,
    .chmaf-toast.message .chmaf-toast-timer { color: rgba(255,255,255,0.8); }

    /* Иконка */
    .chmaf-toast-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 10px;
        font-size: 18px;
        flex-shrink: 0;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* Контент */
    .chmaf-toast-content {
        flex: 1;
        min-width: 0;
    }

    .chmaf-toast-title {
        font-weight: 600;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .chmaf-toast-message {
        color: rgba(255, 255, 255, 0.85);
        font-weight: 400;
        font-size: 12px;
        white-space: pre-wrap;
        word-break: break-word;
    }

    /* Закрытие */
    .chmaf-toast-close {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s ease;
        flex-shrink: 0;
    }

    .chmaf-toast-close:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        transform: scale(1.1);
    }

    /* Прогресс-бар */
    .chmaf-toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: rgba(0, 0, 0, 0.15);
        border-radius: 0 0 14px 14px;
        overflow: hidden;
    }

    .chmaf-toast-progress-bar {
        height: 100%;
        border-radius: 0 0 14px 14px;
        animation: toastProgressShrink linear forwards;
    }

    @keyframes toastProgressShrink {
        from { width: 100%; }
        to { width: 0%; }
    }

    /* Таймер обратного отсчёта */
    .chmaf-toast-timer {
        position: absolute;
        top: 4px;
        right: 8px;
        font-size: 10px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        opacity: 0.65;
        letter-spacing: 0.3px;
    }

    /* Анимация появления */
    @keyframes toastSlideIn {
        from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
        }
        to {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
    }

    /* Пауза при наведении */
    .chmaf-toast:hover .chmaf-toast-progress-bar {
        animation-play-state: paused;
    }
    .chmaf-toast:hover .chmaf-toast-timer {
        opacity: 1;
    }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// Состояние
// ═══════════════════════════════════════════════════════════════════════════════

let toastContainer = null;
let toastQueue = [];
let activeToasts = new Map();
let styleInjected = false;

// ═══════════════════════════════════════════════════════════════════════════════
// Инициализация
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Инициализирует систему уведомлений.
 * Создаёт контейнер и инжектит стили.
 */
function initNotifications() {
    if (toastContainer) return;

    // Создаём контейнер
    toastContainer = document.createElement('div');
    toastContainer.className = `chmaf-toast-container ${NOTIFICATION_CONFIG.position}`;
    toastContainer.id = 'chmaf-toast-container';
    document.body.appendChild(toastContainer);

    // Инжектим стили
    injectStyles();

    console.log('[NotificationSystem] Инициализировано');
}

/**
 * Инжектит CSS стили для уведомлений.
 */
function injectStyles() {
    if (styleInjected) return;

    const style = document.createElement('style');
    style.id = 'chmaf-notification-styles';
    style.textContent = NOTIFICATION_STYLES;
    document.head.appendChild(style);

    styleInjected = true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Публичные API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Показывает уведомление.
 *
 * @param {string|Object} message - Текст или объект с настройками
 * @param {string} [type='message'] - Тип: 'success' | 'error' | 'warning' | 'info' | 'message'
 * @param {Object} [options] - Дополнительные опции
 * @param {string} [options.title] - Заголовок уведомления
 * @param {number} [options.duration] - Время показа (мс), 0 — бесконечно
 * @returns {string} - ID уведомления для управления
 */
function showNotification(message, type = 'message', options = {}) {
    initNotifications();

    // Поддержка объекта вместо отдельных параметров
    if (typeof message === 'object' && !Array.isArray(message)) {
        options = Object.assign({}, message, { type: type || message.type });
        type = options.type || 'message';
        message = options.message || '';
        if (options.title) {
            options.title = options.title;
        }
    }

    const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.message;
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = options.duration ?? NOTIFICATION_CONFIG.autoHideDelay;

    // Создаём элемент
    const toast = document.createElement('div');
    toast.className = `chmaf-toast ${type}`;
    toast.id = id;
    toast.dataset.type = type;

    // HTML структура
    const durationSec = Math.ceil(duration / 1000);
    toast.innerHTML = `
        <div class="chmaf-toast-icon">${config.icon}</div>
        <div class="chmaf-toast-content">
            ${options.title ? `<div class="chmaf-toast-title">${escapeHtml(options.title)}</div>` : ''}
            <div class="chmaf-toast-message">${escapeHtml(String(message))}</div>
        </div>
        <button class="chmaf-toast-close" title="Закрыть">✕</button>
        <div class="chmaf-toast-timer" data-total="${durationSec}">${durationSec}c</div>
        <div class="chmaf-toast-progress"><div class="chmaf-toast-progress-bar" style="animation-duration: ${duration}ms"></div></div>
    `;

    // Обработчик закрытия
    toast.querySelector('.chmaf-toast-close').addEventListener('click', () => {
        dismissNotification(id);
    });

    // Добавляем в очередь, если превышен лимит
    if (activeToasts.size >= NOTIFICATION_CONFIG.maxVisible) {
        toastQueue.push({ id, element: toast, type, message, duration });
        return id;
    }

    // Показываем
    toastContainer.appendChild(toast);
    activeToasts.set(id, { element: toast, type, message, duration, createdAt: Date.now() });

    // Анимация появления
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Таймер обратного отсчёта + авто-скрытие
    if (duration > 0) {
        const timerEl = toast.querySelector('.chmaf-toast-timer');
        let remaining = duration;
        const tick = () => {
            remaining -= 1000;
            if (remaining <= 0) {
                dismissNotification(id);
                return;
            }
            if (timerEl) timerEl.textContent = Math.ceil(remaining / 1000) + 'c';
            activeToasts.get(id)._timerId = setTimeout(tick, 1000);
        };
        activeToasts.get(id)._timerId = setTimeout(tick, 1000);

        // Пауза таймера при наведении
        toast.addEventListener('mouseenter', () => {
            const t = activeToasts.get(id);
            if (t && t._timerId) clearTimeout(t._timerId);
        });
        toast.addEventListener('mouseleave', () => {
            const t = activeToasts.get(id);
            if (t && remaining > 0) {
                t._timerId = setTimeout(tick, 1000);
            }
        });
    }

    return id;
}

/**
 * Быстрое уведомление об успехе.
 */
function showSuccess(message, title) {
    return showNotification(message, 'success', { title });
}

/**
 * Быстрое уведомление об ошибке.
 */
function showError(message, title) {
    return showNotification(message, 'error', { title });
}

/**
 * Быстрое предупреждение.
 */
function showWarning(message, title) {
    return showNotification(message, 'warning', { title });
}

/**
 * Быстрое информационное сообщение.
 */
function showInfo(message, title) {
    return showNotification(message, 'info', { title });
}

/**
 * Закрывает уведомление по ID.
 */
function dismissNotification(id) {
    const toastData = activeToasts.get(id);
    if (!toastData) {
        // Проверяем очередь
        const queueIndex = toastQueue.findIndex(t => t.id === id);
        if (queueIndex === -1) return;

        toastQueue.splice(queueIndex, 1);
        showNextFromQueue();
        return;
    }

    // Очищаем таймер обратного отсчёта
    if (toastData._timerId) clearTimeout(toastData._timerId);

    const { element } = toastData;
    element.classList.remove('show');
    element.classList.add('hide');

    setTimeout(() => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }, 300);

    activeToasts.delete(id);
    showNextFromQueue();
}

/**
 * Закрывает все активные уведомления.
 */
function dismissAllNotifications() {
    const ids = Array.from(activeToasts.keys());
    ids.forEach(id => dismissNotification(id));

    // Очищаем очередь
    toastQueue = [];
}

/**
 * Обновляет текст уведомления.
 */
function updateNotification(id, message, options = {}) {
    const toastData = activeToasts.get(id);
    if (!toastData) return;

    const { element } = toastData;
    const content = element.querySelector('.chmaf-toast-message');

    if (content) {
        content.textContent = String(message);
    }

    if (options.title) {
        const titleEl = element.querySelector('.chmaf-toast-title');
        if (titleEl) {
            titleEl.textContent = options.title;
        } else if (options.title) {
            // Создаём заголовок, если его нет
            const contentDiv = element.querySelector('.chmaf-toast-content');
            const titleElNew = document.createElement('div');
            titleElNew.className = 'chmaf-toast-title';
            titleElNew.textContent = options.title;
            contentDiv.insertBefore(titleElNew, content);
        }
    }
}

/**
 * Получает количество активных уведомлений.
 */
function getActiveNotificationCount() {
    return activeToasts.size;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Внутренние функции
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Показывает следующее уведомление из очереди.
 */
function showNextFromQueue() {
    if (toastQueue.length === 0 || activeToasts.size >= NOTIFICATION_CONFIG.maxVisible) {
        return;
    }

    const next = toastQueue.shift();
    activeToasts.set(next.id, {
        element: next.element,
        type: next.type,
        message: next.message,
        duration: next.duration,
        createdAt: Date.now(),
    });

    toastContainer.appendChild(next.element);

    requestAnimationFrame(() => {
        next.element.classList.add('show');
    });

    if (next.duration > 0) {
        setTimeout(() => {
            dismissNotification(next.id);
        }, next.duration);
    }
}

/**
 * Экранирует HTML-символы для безопасного отображения.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ГЛОБАЛЬНАЯ ОБРАБОТКА ОШИБОК (Error Boundary)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Глобальный обработчик необработанных ошибок (unhandled rejections).
 */
function setupGlobalErrorHandler() {
    // Unhandled Promise Rejections
    window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason;
        const message = error?.message || typeof error === 'string' ? error : 'Неизвестная ошибка';

        console.error('[GlobalError] Unhandled Promise Rejection:', message);

        // Показываем уведомление (но не для известных ignorable ошибок)
        if (!isIgnorableError(error)) {
            showError(message, 'Ошибка выполнения');
        }

        // Прерываем цепочку, чтобы браузер не ругался
        event.preventDefault();
    });

    // Runtime Errors
    window.addEventListener('error', (event) => {
        const error = event.error;
        const message = error?.message || 'Ошибка в скрипте';

        // Показываем уведомление для критических ошибок
        if (isCriticalError(error)) {
            console.error('[GlobalError] Critical Error:', message, error?.stack);
            showError(message, 'Критическая ошибка');
        } else {
            console.warn('[GlobalError] Non-critical Error:', message);
        }

        // Не прерываем, чтобы ошибка пробил стол
        // (поведение по умолчанию)
    });

    console.log('[GlobalErrorHandler] Установлен');
}

/**
 * Проверяет, можно ли игнорировать ошибку.
 */
function isIgnorableError(error) {
    if (!error) return false;

    const message = String(error?.message || error || '');
    const ignorablePatterns = [
        /Failed to fetch/, // Сетевые ошибки в расширениях
        /netscape\.security\./, // Контекст безопасности
        /sandbox/, // Песочница
        /cross-origin/, // Кросс-доменные ошибки
        /not allowed to load/, // CSP
        /Cannot read properties of null/, // Частая ошибка при работе с DOM
        /Cannot read properties of undefined/, // Частая ошибка при работе с DOM
    ];

    return ignorablePatterns.some(pattern => pattern.test(message));
}

/**
 * Проверяет, является ли ошибка критической.
 */
function isCriticalError(error) {
    if (!error) return false;

    const message = String(error?.message || error || '');
    const criticalPatterns = [
        /Script error/, // Ошибки скриптов
        /ReferenceError/, // Отсутствие переменных
        /TypeError.*is not a function/, // Вызов не функции
        /SyntaxError/, // Ошибки синтаксиса
    ];

    return criticalPatterns.some(pattern => pattern.test(message));
}

/**
 * Создаёт обработчик ошибок для конкретного блока кода.
 * Возвращает функцию для очистки.
 *
 * @param {Function} handler - Функция, которую нужно обернуть
 * @param {string} context - Контекст для логирования
 * @returns {Function} - Обёрнутая функция
 */
function withErrorHandling(handler, context = 'Unknown') {
    return async function (...args) {
        try {
            return await handler.apply(this, args);
        } catch (error) {
            console.error(`[ErrorBoundary:${context}]`, error.message, error?.stack);

            // Показываем уведомление, если это не игнорируемая ошибка
            if (!isIgnorableError(error)) {
                const isProduction = !window.location.hostname.includes('localhost');
                if (isProduction) {
                    showError(error?.message || 'Ошибка выполнения', context);
                }
            }

            // Пробрасываем ошибку дальше, если нужно
            throw error;
        }
    };
}

/**
 * Логирует ошибку в консоль с контекстом.
 */
function logError(context, error, level = 'error') {
    const message = error?.message || typeof error === 'string' ? error : 'Неизвестная ошибка';
    const stack = error?.stack;

    if (level === 'error') {
        console.error(`[${context}] ${message}`, stack ? `\n${stack}` : '');
    } else if (level === 'warn') {
        console.warn(`[${context}] ${message}`);
    } else {
        console.log(`[${context}] ${message}`);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// Обратная совместимость с createAndShowButton
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Старый API createAndShowButton — теперь использует новую систему.
 * Оставлен для совместимости со скриптами, которые его используют.
 */
function createAndShowButton(message, type = 'message') {
    // Маппинг старых типов на новые
    const typeMap = {
        message: 'message',
        error: 'error',
        warning: 'warning',
        success: 'success',
        info: 'info',
    };

    const newType = typeMap[type] || 'message';
    showNotification(message, newType);
}

// Делаем createAndShowButton глобальным, если его ещё нет
if (typeof window.createAndShowButton === 'undefined') {
    window.createAndShowButton = createAndShowButton;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Автоматическая инициализация
// ═══════════════════════════════════════════════════════════════════════════════

// Авто-инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initNotifications();
        setupGlobalErrorHandler();
    });
} else {
    initNotifications();
    setupGlobalErrorHandler();
}

// Экспорт для использования в других модулях (ESM-style)
if (typeof window !== 'undefined') {
    window.NotificationSystem = {
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissNotification,
        dismissAllNotifications,
        updateNotification,
        getActiveNotificationCount,
        withErrorHandling,
        logError,
        initNotifications,
    };

    // Глобальные функции для обратной совместимости
    window.showNotification = showNotification;
    window.showSuccess = showSuccess;
    window.showError = showError;
    window.showWarning = showWarning;
    window.showInfo = showInfo;
}
