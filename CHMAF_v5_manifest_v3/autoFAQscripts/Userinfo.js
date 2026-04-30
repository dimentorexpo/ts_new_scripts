// --- ВНЕДРЕНИЕ ИЗОЛИРОВАННЫХ СТИЛЕЙ (PREMIUM GLASSMORPHISM v3) ---
let otpTimerInterval = null;
const injectGlassStyles = () => {
    if (document.getElementById('af-glass-styles')) return;
    const style = document.createElement('style');
    style.id = 'af-glass-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

.af-gl-wrapper {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #f1f5f9;
    text-shadow: 0 1px 3px rgba(0,0,0,0.6);
    font-size: 13px;
    box-sizing: border-box;
    width: 520px;  /* БЫЛО 380px — УВЕЛИЧИЛ */
    line-height: 1.5;
    letter-spacing: 0.01em;
}

/* Новый класс для рядов кнопок — разрешаем перенос если не влезают */
.af-gl-row-wrap {
    flex-wrap: wrap;
    gap: 6px;
}

        .af-gl-panel {
            background: linear-gradient(145deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9));
            backdrop-filter: blur(24px) saturate(180%);
            -webkit-backdrop-filter: blur(24px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 20px;
            box-shadow:
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.05) inset,
                0 0 80px rgba(56, 189, 248, 0.03) inset;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            position: relative;
            overflow: hidden;
        }

        .af-gl-panel::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle at 30% 20%, rgba(56, 189, 248, 0.08) 0%, transparent 50%),
                        radial-gradient(circle at 70% 80%, rgba(168, 85, 247, 0.06) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }

        .af-gl-panel > * {
            position: relative;
            z-index: 1;
        }

        .af-gl-header {
            display: flex;
            gap: 8px;
            align-items: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            padding-bottom: 14px;
            position: relative;
        }

        .af-gl-header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 40%;
            height: 1px;
            background: linear-gradient(90deg, rgba(56, 189, 248, 0.5), transparent);
        }

        .af-gl-row {
            display: flex;
            flex-wrap: nowrap;
            gap: 6px;
            align-items: center;
        }

.af-gl-btn {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: #f8fafc;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 500;
    padding: 7px 14px;
    height: 34px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    flex-shrink: 0;  /* НЕ СЖИМАТЬ */
    white-space: nowrap;  /* Текст не переносить */
}

        .af-gl-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s;
        }

        .af-gl-btn:hover::before {
            left: 100%;
        }

.af-gl-btn-icon {
    width: 34px;
    padding: 0;
    font-size: 15px;
    flex-shrink: 0;
    min-width: 34px;  /* Фиксированная минимальная ширина */
}

        .af-gl-btn:hover:not(:disabled) {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
            transform: translateY(-2px);
            box-shadow:
                0 8px 25px rgba(0,0,0,0.3),
                0 0 20px rgba(56, 189, 248, 0.15);
            border-color: rgba(56, 189, 248, 0.4);
        }

        .af-gl-btn:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .af-gl-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            filter: grayscale(0.5);
        }

.af-gl-input {
    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: #f1f5f9;
    padding: 0 12px;
    height: 34px;
    outline: none;
    text-align: center;
    transition: all 0.3s ease;
    flex: 1;
    min-width: 80px;  /* Минимальная ширина */
    font-weight: 500;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
}

        .af-gl-input:focus {
            border-color: rgba(56, 189, 248, 0.6);
            box-shadow:
                0 0 0 3px rgba(56, 189, 248, 0.1),
                0 0 20px rgba(56, 189, 248, 0.2),
                inset 0 2px 4px rgba(0,0,0,0.2);
            background: rgba(0, 0, 0, 0.5);
        }

        .af-gl-input::placeholder {
            color: rgba(148, 163, 184, 0.6);
        }

        .af-gl-badge {
            padding: 5px 10px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.12);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            height: 34px;
            box-sizing: border-box;
            background: rgba(255,255,255,0.05);
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* Стили блока информации пользователя */
        .af-gl-info-container {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 18px 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            box-shadow:
                0 4px 16px rgba(0,0,0,0.2),
                inset 0 1px 0 rgba(255,255,255,0.05);
        }

        .af-gl-info-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            flex-wrap: wrap;
        }

        /* Стили аватара */
        .af-gl-avatar-wrapper {
            display: flex;
            justify-content: center;
            margin-bottom: 6px;
        }

        .af-gl-avatar {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            border: 2px solid rgba(56, 189, 248, 0.4);
            box-shadow:
                0 4px 20px rgba(0,0,0,0.4),
                0 0 0 4px rgba(56, 189, 248, 0.1),
                0 0 30px rgba(56, 189, 248, 0.15);
            object-fit: cover;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .af-gl-avatar:hover {
            transform: scale(1.9);
            z-index: 100;
            border-color: rgba(56, 189, 248, 0.9);
            box-shadow:
                0 8px 40px rgba(0,0,0,0.5),
                0 0 0 6px rgba(56, 189, 248, 0.2),
                0 0 60px rgba(56, 189, 248, 0.3);
        }

        .af-gl-scrollable {
            max-height: 400px;
            overflow-y: auto;
            padding-right: 8px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .af-gl-scrollable::-webkit-scrollbar {
            width: 5px;
        }

        .af-gl-scrollable::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
        }

        .af-gl-scrollable::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(56, 189, 248, 0.4), rgba(168, 85, 247, 0.4));
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .af-gl-scrollable::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, rgba(56, 189, 248, 0.6), rgba(168, 85, 247, 0.6));
        }

        .af-gl-card {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.03));
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            padding: 14px;
            text-align: left;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            position: relative;
            overflow: hidden;
        }

        .af-gl-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            opacity: 0;
            transition: opacity 0.3s;
        }

        .af-gl-card:hover {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
            transform: translateY(-2px);
            box-shadow:
                0 12px 30px rgba(0,0,0,0.25),
                0 0 0 1px rgba(56, 189, 248, 0.1);
        }

        .af-gl-card:hover::before {
            opacity: 1;
        }

        .af-gl-card-header {
            font-weight: 700;
            padding: 8px 12px;
            border-radius: 10px;
            margin-bottom: 10px;
            text-align: center;
            border: 1px solid rgba(255,255,255,0.1);
            font-size: 13px;
            letter-spacing: 0.02em;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .af-gl-bg-info {
            background: linear-gradient(135deg, rgba(30, 144, 255, 0.35), rgba(30, 144, 255, 0.2));
            border-color: rgba(30, 144, 255, 0.3);
        }

        .af-gl-bg-danger {
            background: linear-gradient(135deg, rgba(220, 20, 60, 0.35), rgba(220, 20, 60, 0.2));
            border-color: rgba(220, 20, 60, 0.3);
        }

        .af-gl-bg-success {
            background: linear-gradient(135deg, rgba(46, 139, 87, 0.35), rgba(46, 139, 87, 0.2));
            border-color: rgba(46, 139, 87, 0.3);
        }

        .af-gl-bg-vu {
            background: linear-gradient(135deg, rgba(245, 131, 32, 0.6), rgba(245, 131, 32, 0.3));
            border-color: rgba(245, 131, 32, 0.4);
            box-shadow: 0 0 20px rgba(245, 131, 32, 0.1);
        }

        .af-gl-bg-regular {
            background: linear-gradient(135deg, rgba(69, 199, 52, 0.3), rgba(69, 199, 52, 0.15));
            border-color: rgba(69, 199, 52, 0.3);
        }

        .af-gl-bg-lost {
            background: linear-gradient(135deg, rgba(138, 28, 129, 0.55), rgba(138, 28, 129, 0.3));
            border-color: rgba(138, 28, 129, 0.4);
        }

        .af-gl-text-accent { color: #7dd3fc; font-weight: 500; }
        .af-gl-text-success { color: #86efac; font-weight: 500; }
        .af-gl-text-warning { color: #fde047; font-weight: 500; }
        .af-gl-text-muted { color: #94a3b8; }

        .cursor-pointer {
            cursor: pointer;
            transition: all 0.25s ease;
        }

        .cursor-pointer:hover {
            opacity: 0.8;
            transform: scale(1.05);
        }

        /* Анимация появления */
        @keyframes afFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .af-gl-panel {
            animation: afFadeIn 0.4s ease-out;
        }

        /* Glow эффект для активных элементов */
        .af-gl-btn-primary {
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(37, 99, 235, 0.3));
            border-color: rgba(56, 189, 248, 0.4);
        }

        .af-gl-btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(37, 99, 235, 0.5));
            box-shadow:
                0 8px 25px rgba(0,0,0,0.3),
                0 0 30px rgba(56, 189, 248, 0.25);
        }

        /* Заголовки секций */
.af-gl-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 13px;
    color: #e2e8f0;
    margin-bottom: 4px;
    padding: 0 4px;
}

.af-gl-section-icon {
    font-size: 14px;
    filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.4));
}

.af-gl-section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(56, 189, 248, 0.3), transparent);
    margin-left: 4px;
}

/* Сетка услуг — 2 колонки */
.af-gl-services-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

/* Карточка услуги премиум */
.af-gl-service-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 16px;  /* БЫЛО 14px */
    position: relative;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
        0 4px 15px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.08);
    display: flex;
    flex-direction: column;
    gap: 10px;  /* БЫЛО 8px */
    min-width: 0;  /* Разрешаем сжиматься в grid */
}

.af-gl-service-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg,
        rgba(56, 189, 248, 0.8),
        rgba(168, 85, 247, 0.6),
        rgba(56, 189, 248, 0.8)
    );
    background-size: 200% 100%;
    animation: shimmer 3s linear infinite;
    opacity: 0.7;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

.af-gl-service-card:hover {
    transform: translateY(-3px) scale(1.01);
    box-shadow:
        0 12px 35px rgba(0,0,0,0.3),
        0 0 30px rgba(56, 189, 248, 0.1),
        inset 0 1px 0 rgba(255,255,255,0.12);
    border-color: rgba(56, 189, 248, 0.25);
}

/* Статус-бейдж на карточке */
.af-gl-service-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    width: fit-content;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.af-gl-status-vu {
    background: linear-gradient(135deg, rgba(245, 131, 32, 0.25), rgba(245, 131, 32, 0.1));
    border: 1px solid rgba(245, 131, 32, 0.4);
    color: #fdba74;
}

.af-gl-status-regular {
    background: linear-gradient(135deg, rgba(69, 199, 52, 0.2), rgba(69, 199, 52, 0.08));
    border: 1px solid rgba(69, 199, 52, 0.35);
    color: #86efac;
}

.af-gl-status-lost {
    background: linear-gradient(135deg, rgba(138, 28, 129, 0.25), rgba(138, 28, 129, 0.1));
    border: 1px solid rgba(138, 28, 129, 0.4);
    color: #d8b4fe;
}

/* Заголовок карточки */
.af-gl-service-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 6px;
}

.af-gl-service-id {
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 11px;
    color: #94a3b8;
    background: rgba(0,0,0,0.3);
    padding: 3px 8px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.08);
    white-space: nowrap;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.af-gl-service-id .af-gl-icon-btn {
    font-size: 12px;
    opacity: 0.5;
    line-height: 1;
}

.af-gl-service-id:hover .af-gl-icon-btn {
    opacity: 1;
}

.af-gl-copy-sid {
    cursor: pointer;
    transition: all 0.2s;
    display: inline-block;
}

.af-gl-copy-sid:hover {
    transform: scale(1.2);
    filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.6));
}

/* Баланс */
.af-gl-service-balance {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #fde047;
}

.af-gl-service-balance::before {
    content: '💰Баланс';
    font-size: 10px;
}

/* Тип услуги — перенос длинных строк */
.af-gl-service-type {
    font-size: 12px;
    color: #7dd3fc;
    font-weight: 500;
    line-height: 1.4;
    padding: 4px 0;
    word-break: break-word;  /* Перенос длинных слов */
    hyphens: auto;
}

/* Преподаватель — компактнее но читаемо */
.af-gl-service-teacher {
    font-size: 11px;
    color: #86efac;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;  /* Больше паддинг */
    background: rgba(69, 199, 52, 0.08);
    border-radius: 10px;
    border: 1px solid rgba(69, 199, 52, 0.15);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.af-gl-service-teacher.missing {
    color: #fca5a5;
    background: rgba(220, 20, 60, 0.08);
    border-color: rgba(220, 20, 60, 0.15);
}

/* Кнопка копирования ID */
.af-gl-copy-btn {
    cursor: pointer;
    transition: all 0.2s;
    opacity: 0.6;
    font-size: 13px;
}

.af-gl-copy-btn:hover {
    opacity: 1;
    transform: scale(1.2);
    filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.6));
}

/* Адаптив — на узких экранах одна колонка */
@media (max-width: 480px) {
    .af-gl-wrapper {
        width: 100%;
        max-width: 460px;
    }
    .af-gl-services-grid {
        grid-template-columns: 1fr;
    }
}

/* Пустое состояние */
.af-gl-empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 30px;
    color: #94a3b8;
    font-size: 13px;
    background: linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
    border-radius: 16px;
    border: 1px dashed rgba(255,255,255,0.1);
}

/* Комплектации — компактные карточки */
.af-gl-complect-card {
    background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 12px;
    transition: all 0.3s ease;
}

.af-gl-complect-card:hover {
    background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04));
    transform: translateX(4px);
}

.af-gl-complect-header {
    font-weight: 700;
    font-size: 12px;
    margin-bottom: 8px;
    padding: 6px 10px;
    border-radius: 10px;
    text-align: center;
}

.af-gl-complect-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 4px;
    font-size: 12px;
}

.af-gl-complect-table td {
    padding: 6px 8px;
    background: rgba(0,0,0,0.2);
    border-radius: 6px;
}

.af-gl-complect-table td:first-child {
    border-radius: 6px 0 0 6px;
    font-family: monospace;
    color: #7dd3fc;
}

.af-gl-complect-table td:last-child {
    border-radius: 0 6px 6px 0;
    text-align: right;
    width: 30px;
}

/* Синхронизация кнопка */
.af-gl-sync-btn {
    cursor: pointer;
    transition: all 0.3s;
    display: inline-block;
}

.af-gl-sync-btn:hover {
    transform: rotate(180deg);
    filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.6));
}

/* Группа OTP — инпут + таймер */
.af-gl-otp-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
}

.af-gl-input-otp {
    min-width: 80px;
    text-align: center;
    font-family: 'SF Mono', 'Consolas', monospace;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 2px;
}

/* Таймер обратного отсчёта */
.af-gl-otp-timer {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.af-gl-otp-timer-ring {
    position: relative;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.af-gl-otp-timer-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.af-gl-otp-timer-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 2.5;
}

.af-gl-otp-timer-progress {
    fill: none;
    stroke: #38bdf8;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-dasharray: 62.83; /* 2 * PI * 10 */
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 0.1s linear;
    filter: drop-shadow(0 0 3px rgba(56, 189, 248, 0.5));
}

.af-gl-otp-timer-text {
    font-size: 10px;
    font-weight: 700;
    color: #38bdf8;
    z-index: 1;
    font-family: 'SF Mono', monospace;
    text-shadow: 0 0 6px rgba(56, 189, 248, 0.4);
}

/* Анимация пульсации когда мало времени */
@keyframes otpUrgent {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
}

.af-gl-otp-timer.urgent .af-gl-otp-timer-ring {
    animation: otpUrgent 0.8s ease-in-out infinite;
}

.af-gl-otp-timer.urgent .af-gl-otp-timer-progress {
    stroke: #f87171;
    filter: drop-shadow(0 0 4px rgba(248, 113, 113, 0.6));
}

.af-gl-otp-timer.urgent .af-gl-otp-timer-text {
    color: #f87171;
    text-shadow: 0 0 6px rgba(248, 113, 113, 0.4);
}

/* Компактный инфо-контейнер */
.af-gl-info-compact {
    background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow:
        0 4px 16px rgba(0,0,0,0.2),
        inset 0 1px 0 rgba(255,255,255,0.05);
}

/* Верхняя строка: аватар + имя */
.af-gl-info-main {
    display: flex;
    align-items: center;
    gap: 12px;
}

.af-gl-avatar-wrapper-compact {
    display: flex;
    flex-shrink: 0;
}

/* Убираем overflow у ВСЕХ родителей аватарки */
.af-gl-wrapper,
.af-gl-panel,
.af-gl-info-compact,
.af-gl-info-main,
.af-gl-avatar-wrapper-compact {
    overflow: visible !important; /* Принудительно */
}

/* Аватарка при ховере */
.af-gl-avatar-compact {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    border: 2px solid rgba(56, 189, 248, 0.4);
    object-fit: cover;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: zoom-in;
    position: relative;
    z-index: 1;
}

.af-gl-avatar-compact:hover {
    transform: scale(3.5);
    z-index: 999999;
    position: relative; /* Остаёмся в потоке но поверх */
    border-radius: 16px;
    border-color: rgba(56, 189, 248, 0.9);
    box-shadow:
        0 25px 80px rgba(0,0,0,0.7),
        0 0 0 8px rgba(56, 189, 248, 0.3),
        0 0 100px rgba(56, 189, 248, 0.4);

    /* Смещаем вправо, чтобы не обрезалось слева */
    margin-right: -100px;
    margin-left: 20px;
}

.af-gl-info-core {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
}

.af-gl-user-type {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.af-gl-user-name-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.af-gl-age-badge {
    font-size: 13px;
    line-height: 1;
}

.af-gl-user-name {
    font-weight: 700;
    font-size: 15px;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.af-gl-icon-btn {
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.2s;
    font-size: 13px;
    line-height: 1;
    flex-shrink: 0;
}

.af-gl-icon-btn:hover {
    opacity: 1;
    transform: scale(1.2);
}

/* Сетка контактов 2×2 */
.af-gl-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
}

.af-gl-info-cell {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 10px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 3px;
    transition: all 0.2s;
}

.af-gl-info-cell:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(56, 189, 248, 0.15);
}

.af-gl-info-label {
    font-size: 10px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
}

.af-gl-info-value-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
}

.af-gl-info-value {
    font-size: 12px;
    color: #e2e8f0;
    font-weight: 500;
}

/* Identity строка */
.af-gl-info-identity {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    padding: 6px 10px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Время — чипсы */
.af-gl-info-time {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 11px;
}

.af-gl-time-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

.af-gl-time-label {
    color: #94a3b8;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
}

.af-gl-time-value {
    color: #38bdf8;
    font-weight: 700;
    font-family: 'SF Mono', monospace;
    font-size: 11px;
}

.af-gl-time-divider {
    color: rgba(148, 163, 184, 0.4);
    font-size: 10px;
}

.af-gl-service-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.06);
}

.af-gl-service-meta {
    font-size: 11px;
    color: #64748b;
    font-family: 'SF Mono', monospace;
}

.af-gl-service-meta strong {
    color: #94a3b8;
    font-weight: 600;
}

.af-gl-copy-inline {
    background: transparent;
    border: none;
    color: #38bdf8;
    font-size: 11px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 4px;
}

.af-gl-copy-inline:hover {
    background: rgba(56, 189, 248, 0.1);
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}
    `;
    document.head.appendChild(style);
};
injectGlassStyles();

// --- КОНФИГУРАЦИЯ И ГЛОБАЛЬНЫЕ СОСТОЯНИЯ ---
let servicecontainer = null;
let stid = null;

const STATUS_ICONS = { VALID: '✅', INVALID: '❌', EMAIL: '📧', PHONE: '☎️' };
const API_BASE_URL = 'https://backend.skyeng.ru/api/persons';

const LINK_CONFIG = {
    checkBalance: { url: (id) => `https://billing-api.skyeng.ru/operations/user/${id}/info` },
    GotoCRM: { url: (id) => `https://crm2.skyeng.ru/persons/${id}` },
    partialPaymentinfo: { url: (id) => `https://billing-api.skyeng.ru/installments?ownerId=${id}&state=&perPage=50&currentPage=1` },
    subscriptioninfo: { url: (id) => `https://billing-api.skyeng.ru/subscriptions/user/${id}/info` },
    editadmbtn: { url: (id) => `https://id.skyeng.ru/admin/users/${id}/update-contacts` }
};

const PAST_LESSONS_CONFIG = {
    buttonId: 'getlessonpast',
    outputElementId: 'timetabledata',
    apiUrl: (id) => `https://backend.skyeng.ru/api/students/${id}/timetable/lessons-history/?page=0`,
    STATUS_MAP: { "missed_by_student": "Пропущен учеником", "canceled_by_student": "Отменен учеником", "success": "Прошел", "moved_by_student": "Перенесен учеником", "canceled_by_teacher": "Отменен учителем", "student_refused_to_study": "Отказался от обучения", "interrupted": "Прерван", "did_not_get_through_student": "Не смогли связаться с У", "canceled_not_marked": "Не отмечен учителем вовремя" },
    LESSON_TYPE_MAP: { "regular": "Регулярный", "single": "Одиночный", "trial": "Пробный" }
};

const LESSONS_CONFIG = {
    buttonId: 'getlessonfuture',
    outputElementId: 'timetabledata',
    apiUrls: {
        future: (id) => `https://backend.skyeng.ru/api/students/${id}/timetable/future-lessons/`,
        past: (id) => `https://backend.skyeng.ru/api/students/${id}/timetable/lessons-history/?page=0`,
    },
    LESSON_TYPE_MAP: PAST_LESSONS_CONFIG.LESSON_TYPE_MAP
};

// --- HTML ШАБЛОНЫ (С ПРИМЕНЕНИЕМ GLASSMORPHISM) ---
const win_serviceinfo = `
<div class="af-gl-wrapper">
    <div class="af-gl-panel">

        <div class="af-gl-header" id="servicehead" style="cursor: -webkit-grab;">
            <button title="Скрыть меню" id="hideMeservice" class="af-gl-btn af-gl-btn-icon buttonHide" style="color: #ef4444; min-width: 32px;">❌</button>
            <button title="CRM" id="GotoCRM" class="af-gl-btn" style="min-width: 50px;">CRM</button>
            <button title="Показать контакты" id="dounhidemailandphone" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">👁‍🗨</button>
            <button title="Статус CRM" id="CrmStatus" class="af-gl-btn af-gl-btn-icon" style="display:none; min-width: 32px;"></button>
            <span id="getcurrentstatus" class="af-gl-badge af-gl-bg-info" style="display:none;"></span>
        </div>

        <div class="af-gl-row af-gl-row-wrap">
            <input id="idstudent" class="af-gl-input" placeholder="ID У/П" autocomplete="off" style="min-width: 90px;">
            <button title="Поиск" id="getidstudent" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">🚀</button>
            <button title="Все задачи" id="crmactivetasks" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">📋</button>
            <button title="TRM 2.0" id="newTrm" class="af-gl-btn af-gl-btn-icon" style="display:none; min-width: 32px;">🗿</button>
            <button title="Стран. учителя" id="personalteacherpage" class="af-gl-btn af-gl-btn-icon" style="display:none; min-width: 32px;">🎭</button>
            <button title="Язык: RU" id="changeLocaleLng" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">🌍</button>
            <button title="Баланс" id="checkBalance" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">💰</button>
            <button title="Уроки" id="getPastAndFutureLessons" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">📆</button>
            <button title="Очистить" id="clearservinfo" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">🧹</button>
        </div>

        <div class="af-gl-row af-gl-row-wrap">
            <div class="af-gl-otp-group">
                <input id="onetimepassout" class="af-gl-input af-gl-input-otp" readonly placeholder="OTP код">
                <div id="otpTimer" class="af-gl-otp-timer" style="display: none;">
                    <span class="af-gl-otp-timer-ring">
                        <svg viewBox="0 0 24 24" class="af-gl-otp-timer-svg">
                            <circle cx="12" cy="12" r="10" class="af-gl-otp-timer-bg"/>
                            <circle cx="12" cy="12" r="10" class="af-gl-otp-timer-progress" id="otpTimerCircle"/>
                        </svg>
                        <span id="otpTimerText" class="af-gl-otp-timer-text">15</span>
                    </span>
                </div>
            </div>
            <button title="Сген. код (МП)" id="getonetimepass" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">📱</button>
            <button title="Админка" id="editadmbtn" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">✏️</button>
            <button title="История чатов" id="catchathistory" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">🗄</button>
            <button title="Набор" id="butTeacherNabor" class="af-gl-btn af-gl-btn-icon" style="display:none; min-width: 32px;">🚷</button>
            <button title="Рассрочка" id="partialPaymentinfo" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">💸</button>
            <button title="Подписка" id="subscriptioninfo" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">💵</button>
            <button title="Vimbot" id="openVimbotWindowsUserinfo" class="af-gl-btn af-gl-btn-icon" style="min-width: 32px;">▶️</button>
        </div>

        <!-- НОВЫЙ КОМПАКТНЫЙ ИНФО-БЛОК -->
        <div id="basicInfo" class="af-gl-info-container af-gl-info-compact">

            <!-- Верхняя строка: аватар + основная инфа -->
            <div class="af-gl-info-main">
                <div id="avatarWrapper" class="af-gl-avatar-wrapper-compact" style="display:none;">
                    <img id="useravatar" class="af-gl-avatar-compact" src="">
                </div>

                <div class="af-gl-info-core">
                    <div id="usrType" class="af-gl-user-type"></div>
                    <div class="af-gl-user-name-row">
                        <span id="usrAge" class="af-gl-age-badge"></span>
                        <span id="usrName" class="af-gl-user-name"></span>
                        <span id="getloginer" class="af-gl-icon-btn" title="Ссылка-логгинер">🔑</span>
                    </div>
                </div>
            </div>

            <!-- Сетка контактов -->
            <div class="af-gl-info-grid">
                <div class="af-gl-info-cell">
                    <span class="af-gl-info-label">📧 Почта</span>
                    <div class="af-gl-info-value-row">
                        <span id="mailunhidden" class="af-gl-text-accent">hidden</span>
                        <span class="af-gl-icon-btn" id="getusremail" title="Скопировать">📋</span>
                    </div>
                </div>

                <div class="af-gl-info-cell">
                    <span class="af-gl-info-label">☎️ Телефон</span>
                    <div class="af-gl-info-value-row">
                        <span id="phoneunhidden" class="af-gl-text-accent">hidden</span>
                        <span class="af-gl-icon-btn" id="getusrphone" title="Скопировать">📋</span>
                    </div>
                </div>

                <div class="af-gl-info-cell">
                    <span class="af-gl-info-label">🌍 Страна</span>
                    <span id="usrCountry" class="af-gl-info-value">—</span>
                </div>

                <div class="af-gl-info-cell">
                    <span class="af-gl-info-label">🌐 Язык</span>
                    <span id="usrServLang" class="af-gl-info-value">—</span>
                </div>
            </div>

            <!-- Identity статус -->
            <div class="af-gl-info-identity" name="studentosFields">
                <span class="af-gl-info-label">Identity:</span>
                <span id="pochtaIdentity"></span>
                <span id="telefonIdentity"></span>
            </div>

            <!-- Время -->
            <div class="af-gl-info-time">
                <span class="af-gl-time-chip">
                    <span class="af-gl-time-label">UTC</span>
                    <span id="utcOffset" class="af-gl-time-value">—</span>
                </span>
                <span class="af-gl-time-divider">|</span>
                <span class="af-gl-time-chip">
                    <span class="af-gl-time-label">MSK</span>
                    <span id="UTCtoMSK" class="af-gl-time-value">—</span>
                </span>
                <span class="af-gl-time-divider">|</span>
                <span class="af-gl-time-chip">
                    <span class="af-gl-time-label">Местное время: </span>
                    <span id="localTime" class="af-gl-time-value">—</span>
                </span>
            </div>
        </div>

        <div class="af-gl-section-title">
            <span class="af-gl-section-icon">✨</span>
            <span>Информация об услугах</span>
            <div class="af-gl-section-line"></div>
        </div>

        <div id="serviceList" class="af-gl-scrollable">
            <div id="servicetable" class="af-gl-services-grid"></div>
        </div>

        <div class="af-gl-section-title" style="margin-top: 8px;">
            <span class="af-gl-section-icon">📦</span>
            <span>Комплектации</span>
            <div class="af-gl-section-line"></div>
        </div>

        <div id="complektList" class="af-gl-scrollable">
            <div id="complekttable"></div>
        </div>
    </div>
</div>`;

const win_Timetable = `
<div class="af-gl-wrapper" style="width: 450px;">
    <div class="af-gl-panel">
        <div class="af-gl-header" id="HeadTimetable" style="cursor: -webkit-grab; justify-content: space-between;">
            <span style="font-weight: bold; font-size: 14px;">📅 Расписание</span>
            <button class="af-gl-btn" id="hideMeTT" style="color: #ef4444;">❌</button>
        </div>
        <div class="af-gl-row" style="justify-content: center;">
            <button class="af-gl-btn" id="getlessonpast">Прошедшие</button>
            <button class="af-gl-btn" id="getlessonfuture">Предстоящие</button>
        </div>
        <div id="timetableinfo" class="af-gl-scrollable" style="margin-top: 10px;">
            <div id="timetabledata" style="text-align: center;"></div>
        </div>
    </div>
</div>`;

const win_Complectations = `
<div class="af-gl-wrapper" style="width: 500px;">
    <div class="af-gl-panel">
        <div class="af-gl-header" id="headComplectations" style="cursor: -webkit-grab; justify-content: space-between;">
            <span style="font-weight: bold; font-size: 14px;">📦 Комплектации</span>
            <button class="af-gl-btn" id="hideComplecations" style="color: #ef4444;">❌</button>
        </div>
        <div id="cmplInfo" class="af-gl-scrollable">
            <div id="cmplData"></div>
        </div>
    </div>
</div>`;

// --- ИНИЦИАЛИЗАЦИЯ ОКОН (функции createWindow ожидаются извне) ---
const wintServices = createWindow('AF_Service', 'winTopService', 'winLeftService', win_serviceinfo);
const wintTimetable = createWindow('AF_Timetable', 'winTopTimetable', 'winLeftTimetable', win_Timetable);
const wintComplectations = createWindow('AF_Complectations', 'winTopComplectations', 'winLeftComplectations', win_Complectations);

// --- УТИЛИТЫ И ХЕЛПЕРЫ ---
const getStudentId = () => {
    const userId = document.getElementById('idstudent')?.value.trim();
    if (!userId) {
        alert('Пожалуйста, введите ID студента.');
        return null;
    }
    return userId;
};

const openLinkInNewTab = (userId, url) => {
    if (!userId) return;
    window.open(url, '_blank', 'noopener,noreferrer');
};

const sendMessageAsync = (message) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            if (response && response.success) resolve(response);
            else reject(new Error(response?.error || 'Unknown error from extension'));
        });
    });
};

// --- ОСНОВНЫЕ ОБРАБОТЧИКИ СОБЫТИЙ ---

// Скрытие окон
document.getElementById('servicehead')?.addEventListener('dblclick', (a) => {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
        document.getElementById('AF_Service').style.display = 'none';
        document.getElementById('butServ')?.classList.remove('activeScriptBtn');
    }
});
document.getElementById('hideMeservice')?.addEventListener('click', () => {
    document.getElementById('AF_Service').style.display = 'none';
    document.getElementById('butServ')?.classList.remove('activeScriptBtn');
});

// Кнопка Identity (раскрыть почту/телефон)
document.getElementById('dounhidemailandphone')?.addEventListener('click', async function () {
    this.disabled = true;
    const originalText = this.textContent;
    this.textContent = '⏳';
    try {
        await Promise.all([getUnhideEmail(), getUnhidePhone()]);
        await checkEmailAndPhoneIdentity();
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('mailunhidden').textContent = '';
        document.getElementById('phoneunhidden').textContent = '';
        document.getElementById('pochtaIdentity').textContent = '';
        document.getElementById('telefonIdentity').textContent = '';
    } finally {
        this.disabled = false;
        this.textContent = originalText;
    }
});

// Настройка линков из конфига
const idstudentField = document.getElementById('idstudent');
if (idstudentField) {
    for (const buttonId in LINK_CONFIG) {
        document.getElementById(buttonId)?.addEventListener('click', () => {
            const userId = getStudentId();
            if (userId) openLinkInNewTab(userId, LINK_CONFIG[buttonId].url(userId));
        });
    }
}

// Генерация OTP
document.getElementById('getonetimepass')?.addEventListener('click', async function () {
    const userId = getStudentId();
    if (!userId) return;
    const outputField = document.getElementById('onetimepassout');
    const timerContainer = document.getElementById('otpTimer');
    const timerText = document.getElementById('otpTimerText');
    const timerCircle = document.getElementById('otpTimerCircle');

    // Сбрасываем предыдущий таймер если есть
    if (otpTimerInterval) {
        clearInterval(otpTimerInterval);
        otpTimerInterval = null;
    }

    this.disabled = true;
    this.innerHTML = '⏳';

    try {
        const reqOpts = {
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: `user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D=${userId}&user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null`,
            method: 'POST'
        };
        const response = await sendMessageAsync({
            action: 'getFetchRequest',
            fetchURL: 'https://id.skyeng.ru/admin/auth/one-time-password',
            requestOptions: reqOpts
        });
        const otpMatch = response.fetchansver.match(/Одноразовый пароль: (\d+)\./);
        const otpCode = otpMatch ? otpMatch[1] : 'Не найден';

        outputField.value = otpCode;

        // Запускаем таймер на 15 секунд
        if (otpMatch) {
            startOtpTimer(15, timerContainer, timerText, timerCircle, outputField);
        }

    } catch (e) {
        alert(`Ошибка: ${e.message}`);
        timerContainer.style.display = 'none';
    } finally {
        this.disabled = false;
        this.innerHTML = '📱';
    }
});

// Функция таймера
function startOtpTimer(duration, container, textEl, circleEl, inputEl) {
    const totalDuration = duration;
    let remaining = duration;
    const circumference = 62.83; // 2 * PI * 10

    container.style.display = 'flex';
    container.classList.remove('urgent');
    textEl.textContent = remaining;
    circleEl.style.strokeDashoffset = 0;

    otpTimerInterval = setInterval(() => {
        remaining--;
        textEl.textContent = remaining;

        // Обновляем кольцо
        const offset = circumference - (remaining / totalDuration) * circumference;
        circleEl.style.strokeDashoffset = offset;

        // Краснеем когда мало времени (последние 5 сек)
        if (remaining <= 5) {
            container.classList.add('urgent');
        }

        if (remaining <= 0) {
            clearInterval(otpTimerInterval);
            otpTimerInterval = null;
            container.style.display = 'none';
            inputEl.value = '';
        }
    }, 1000);
}

// Управление окнами Timetable / Complectations
document.getElementById('AF_Timetable')?.addEventListener('dblclick', (a) => {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
        document.getElementById('AF_Timetable').style.display = 'none';
        document.getElementById('timetabledata').innerHTML = "";
    }
});
document.getElementById('hideMeTT')?.addEventListener('click', () => {
    document.getElementById('AF_Timetable').style.display = 'none';
    document.getElementById('timetabledata').innerHTML = "";
});
document.getElementById('hideComplecations')?.addEventListener('click', () => {
    document.getElementById('AF_Complectations').style.display = 'none';
    if (document.getElementById('AF_SpecCommWindow')?.style.display == '') {
        document.getElementById('hideMeSpecComm')?.click();
    }
});

// --- ЛОГИКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ ---

async function checkEmailAndPhoneIdentity() {
    const userId = idstudentField?.value.trim();
    if (!userId || window.flagusertype !== "student") return;

    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: `https://id.skyeng.ru/admin/users/${userId}/update-contacts`, requestOptions: { method: 'GET' } });
        const html = response.fetchansver;
        const hasEmail = !html.includes('"identityEmail" disabled data-value=""');
        const hasPhone = !html.includes('"identityPhone" disabled data-value=""');

        document.getElementById('pochtaIdentity').textContent = `${STATUS_ICONS.EMAIL}${hasEmail ? STATUS_ICONS.VALID : STATUS_ICONS.INVALID}`;
        document.getElementById('telefonIdentity').textContent = `${STATUS_ICONS.PHONE}${hasPhone ? STATUS_ICONS.VALID : STATUS_ICONS.INVALID}`;
    } catch (error) {
        console.error("Не удалось проверить статус identity:", error);
    }
}

async function _fetchAndDisplayPersonalData(pdType, targetElementId) {
    const userId = getStudentId();
    const targetEl = document.getElementById(targetElementId);
    if (!userId || !targetEl) return;

    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: `${API_BASE_URL}/${userId}/personal-data/?pdType=${pdType}&source=persons.profile`, requestOptions: { method: 'GET' } });
        const data = JSON.parse(response.fetchansver);
        targetEl.textContent = data?.data?.value || 'Не заполнен';
    } catch (e) {
        targetEl.textContent = '';
    }
}

const getUnhideEmail = () => _fetchAndDisplayPersonalData('email', 'mailunhidden');
const getUnhidePhone = () => _fetchAndDisplayPersonalData('phone', 'phoneunhidden');

// Получение конфигурации услуг
async function fetchServiceConfiguration() {
    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: 'https://backend.skyeng.ru/api/products/configurations/', requestOptions: { method: 'GET' } });
        servicecontainer = JSON.parse(response.fetchansver);
    } catch (e) {
        console.error('Ошибка конфигурации сервиса:', e.message);
    }
}
fetchServiceConfiguration();

// Форматирование дат и уроков
function formatLessonDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function createFutureLessonHTML(lesson, type) {
    const { startedAt, lessonType, educationService, teacher } = lesson;
    const translatedType = LESSONS_CONFIG.LESSON_TYPE_MAP[lessonType] || lessonType;
    const srvTitle = servicecontainer?.data.find(i => i.serviceTypeKey === educationService.serviceTypeKey)?.shortTitle || educationService.serviceTypeKey;

    const teacherInfo = teacher ? `<div class="af-gl-text-success">👨‍🏫 ${teacher.general.id} ${teacher.general.name} ${teacher.general.surname}</div>` : '';
    const statusHTML = type === 'past' ? `<div>Статус: <span class="af-gl-text-success">Прошел</span></div>` : '';

    return `
        <div class="af-gl-card">
            <div><span class="af-gl-text-warning">📅 Дата:</span> ${formatLessonDate(startedAt)}</div>
            <div><span class="af-gl-text-warning">🎓 Урок:</span> ${translatedType}</div>
            <div><span class="af-gl-text-accent">📚 Услуга:</span> ${educationService.id} ${srvTitle}</div>
            ${statusHTML}
            ${teacherInfo}
        </div>`;
}

async function fetchAndDisplayLessons(type) {
    const btn = document.getElementById(type === 'future' ? 'getlessonfuture' : 'getlessonpast');
    const out = document.getElementById('timetabledata');
    const userId = getStudentId();
    if (!userId || !btn || !out) return;

    btn.disabled = true;
    out.innerHTML = 'Загрузка...';
    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: LESSONS_CONFIG.apiUrls[type](userId), requestOptions: { method: 'GET' } });
        const data = JSON.parse(response.fetchansver);
        if (!data?.data?.length) {
            out.innerHTML = type === 'future' ? 'Уроки не запланированы' : 'Уроков еще не было';
            return;
        }
        out.innerHTML = data.data.map(l => createFutureLessonHTML(l, type)).join('');
    } catch (e) {
        out.innerHTML = 'Ошибка загрузки';
    } finally {
        btn.disabled = false;
    }
}

document.getElementById('getlessonfuture')?.addEventListener('click', () => fetchAndDisplayLessons('future'));
document.getElementById('getlessonpast')?.addEventListener('click', () => fetchAndDisplayLessons('past'));

// Управление Locale
document.getElementById('changeLocaleLng')?.addEventListener('click', async function () {
    const userId = getStudentId();
    if (!userId) return;
    this.disabled = true; this.innerHTML = '⏳';
    try {
        await sendMessageAsync({
            action: 'getFetchRequest',
            fetchURL: `https://backend.skyeng.ru/api/persons/general/${userId}`,
            requestOptions: { method: 'PUT', body: JSON.stringify({ serviceLocale: 'ru' }), headers: { 'Content-Type': 'application/json' } }
        });
        createAndShowButton('Язык обновлен', 'message');
        this.innerHTML = '✅';
    } catch (e) {
        this.innerHTML = '❌';
    } finally {
        setTimeout(() => { this.innerHTML = '🌍'; this.disabled = false; }, 2000);
    }
});

function getusernamecrm() {
    const sid = idstudentField?.value.trim();
    if (!sid) return;
    window.flagusertype = '';

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/persons/${sid}?crm2=true&debugParam=person-page`, requestOptions: { method: 'GET' } }, function (res) {
        if (!res.success) return alert('Ошибка: ' + res.error);
        const data = JSON.parse(res.fetchansver).data;
        window.flagusertype = data.type;
        const isStudent = data.type === "student";

        // Имя и тип
        document.getElementById('usrName').textContent = `${data.name} ${data.surname || ''}`;
        const typeEl = document.getElementById('usrType');
        if (isStudent) {
            typeEl.innerHTML = `<span class="af-gl-text-success">🎓 Ученик</span>`;
        } else {
            typeEl.innerHTML = `<span class="af-gl-text-accent">👨‍🏫 Преподаватель</span>`;
        }

        // Страна
        document.getElementById('usrCountry').textContent = data.country || '—';

        // Аватар — компактный, сбоку
        const avatarWrapper = document.getElementById('avatarWrapper');
        const avatarEl = document.getElementById('useravatar');
        if (data.avatarUrl) {
            const matchSrc = data.avatarUrl.match(/https:\/\/cdn-auth-avatars\.skyeng\.ru\/\d+\/[a-f0-9-]+$/)?.[0];
            if (matchSrc) {
                avatarEl.src = matchSrc;
                avatarWrapper.style.display = 'flex';
            } else {
                avatarWrapper.style.display = 'none';
            }
        } else {
            avatarWrapper.style.display = 'none';
        }

        // Возраст
        let ageIco = "❓";
        if (data.birthday) {
            const age = new Date().getFullYear() - Number(data.birthday.split('-')[0]);
            ageIco = age < 18 ? "🔞" : age < 99 ? "🅰️" : "❓";
        }
        document.getElementById('usrAge').textContent = ageIco;

        // Скрываем/показываем студентские поля
        const elsToHide = ['pochtaIdentity', 'telefonIdentity', 'checkBalance', 'partialPaymentinfo', 'subscriptioninfo', 'getPastAndFutureLessons', 'complekttable', 'newTrm', 'butTeacherNabor', 'personalteacherpage'];
        elsToHide.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

        if (isStudent) {
            ['checkBalance', 'partialPaymentinfo', 'subscriptioninfo', 'getPastAndFutureLessons', 'pochtaIdentity', 'telefonIdentity', 'complekttable'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });
        } else {
            ['newTrm', 'butTeacherNabor', 'personalteacherpage'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.style.display = '';
            });
            document.getElementById('usrAge').style.display = 'none';
            document.getElementById('servicetable').innerHTML = '';
        }

        // Язык
        const locale = data.serviceLocale || "⭕";
        document.getElementById('usrServLang').textContent = locale;
        document.getElementById('changeLocaleLng').style.display = locale === "ru" ? "none" : "";

        // Время
        document.getElementById('utcOffset').textContent = data.utcOffset;
        document.getElementById('UTCtoMSK').textContent = data.utcOffset - 3;
        document.getElementById('localTime').textContent = new Date(Date.now() + data.utcOffset * 3600000).toISOString().substr(11, 5);
    });
}

function crmstatus() {
    const userId = idstudentField?.value.trim();
    if (!userId) return;
    const statusEl = document.getElementById('getcurrentstatus');
    const crmEl = document.getElementById('CrmStatus');
    statusEl.style.display = 'none'; crmEl.style.display = 'none';

    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://customer-support.skyeng.ru/task/user/${userId}`, requestOptions: { method: 'GET' } }, function (res) {
        if (!res.success) return;
        const tasks = JSON.parse(res.fetchansver).data;
        let flags = { tpOut: false, tp: false, notTp: false, wait: false, processing: false, operator: '' };

        tasks.forEach(task => {
            if (task.operatorGroup.name === 'technical_support_outgoing') {
                flags.tpOut = true;
                if (task.status === 'waiting') flags.wait = true;
                if (task.status === 'processing') { flags.processing = true; flags.operator = task.operator.name; }
            } else if (task.operatorGroup.name === 'technical_support_first_line') {
                flags.tp = true;
            } else { flags.notTp = true; }
        });

        if (flags.wait) { statusEl.style.display = ''; statusEl.innerText = 'В ожидании'; statusEl.className = 'af-gl-badge af-gl-bg-info'; }
        else if (flags.processing) { statusEl.style.display = ''; statusEl.innerText = 'Решается'; statusEl.className = 'af-gl-badge af-gl-bg-danger'; statusEl.title = flags.operator; }

        let icon = '📵';
        if (flags.tpOut && !flags.tp && !flags.notTp) icon = '💥';
        else if (!flags.tpOut && flags.tp && !flags.notTp) icon = '🛠';
        else if (flags.tpOut && flags.tp) icon = '💥';
        else if (flags.tp && flags.notTp && !flags.tpOut) icon = '🛠';

        crmEl.style.display = ''; crmEl.innerText = icon;
    });
}

function getservices(stidNew) {
    const servTable = document.getElementById('servicetable');
    const compTable = document.getElementById('cmplData');
    const linkTable = document.getElementById('complekttable');

    servTable.innerHTML = '<div class="af-gl-empty-state">Загрузка услуг...</div>';
    compTable.innerHTML = "";
    linkTable.innerHTML = "";

    // --- 1. ЗАПРОС КОМПЛЕКТАЦИЙ ---
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/v1/students/${stidNew}/education-service-kits/`, requestOptions: { method: 'GET' } }, function (res) {
        if (!res.success) return;
        const data = JSON.parse(res.fetchansver);

        if (data.data.length > 0) {
            linkTable.innerHTML += `<div id="openOneComplectation" class="af-gl-card cursor-pointer af-gl-bg-success" style="text-align:center; margin-bottom: 8px;">✅ Есть комплектации <span style="font-size: 11px; opacity: 0.8;">(кликни)</span></div>`;
            document.getElementById('openOneComplectation')?.addEventListener('click', () => {
                const w = document.getElementById('AF_Complectations');
                w.style.display = w.style.display === "none" ? "" : "none";
            });

            data.data.forEach(service => {
                if (service.incorrectnessReason == null) {
                    let sHtml = `<table class="af-gl-complect-table">`;
                    service.educationServices.forEach(el => {
                        let { formattedText } = typeof formatServiceType === 'function' ? formatServiceType(el.serviceTypeKey) : { formattedText: el.serviceTypeKey };
                        sHtml += `<tr>
                            <td><a href="https://crm2.skyeng.ru/persons/${service.student.general.id}/services/${el.id}" target="_blank" style="color:inherit; text-decoration:none;">${el.id}</a></td>
                            <td>${formattedText}</td>
                            <td style="color: #fde047; font-weight: 600;">${el.balance}</td>
                            <td><span class="af-gl-sync-btn" data-srvid="${el.id}" title="Синхронизировать">♻️</span></td>
                        </tr>`;
                    });
                    sHtml += `</table>`;

                    let opNote = service.operatorNote ? `title="${service.operatorNote.replace(/"/g, '&quot;')}"` : "";
                    const stageClass = service.stage === "regular_lessons" ? "af-gl-bg-regular" : service.stage === "lost" ? "af-gl-bg-lost" : "af-gl-bg-success";

                    compTable.innerHTML += `<div class="af-gl-complect-card" style="margin-bottom:10px;">
                        <div class="af-gl-complect-header ${stageClass}" ${opNote}>
                            📦 [${service.id}] ${service.productKit.title}
                            <span style="font-size: 10px; opacity: 0.8; display: block; margin-top: 2px; font-weight: 500;">
                                ${service.stage === "regular_lessons" ? "Регулярные занятия" : service.stage === "lost" ? "Потерянная" : service.stage}
                            </span>
                        </div>
                        ${sHtml}
                    </div>`;
                } else {
                    compTable.innerHTML += `<div class="af-gl-complect-card" style="margin-bottom:10px; text-align:center; border: 1px solid rgba(220, 20, 60, 0.3); background: linear-gradient(145deg, rgba(220, 20, 60, 0.1), rgba(220, 20, 60, 0.05));">
                        <div style="color: #fca5a5; font-weight: 600; font-size: 12px;">⚠️ [${service.id}] '${service.productKit.title}' — некорректна</div>
                    </div>`;
                }
            });

            // Синхронизация
            document.querySelectorAll('.af-gl-sync-btn').forEach(btn => {
                btn.onclick = function () {
                    const srvId = this.getAttribute('data-srvid');
                    this.innerText = "⏳";
                    const gToken = localStorage.getItem('token_global');

                    chrome.runtime.sendMessage({
                        action: 'getFetchRequest',
                        fetchURL: `https://skysmart-core.skyeng.ru/api/v1/academic-activity/upsert-education-service-history/${srvId}`,
                        requestOptions: {
                            headers: { "accept": "application/json, text/plain, */*", "authorization": `Bearer ${gToken}` },
                            method: "POST",
                            mode: "cors"
                        }
                    }, function (response) {
                        if (!response.success) {
                            alert('Не удалось выполнить запрос: ' + response.error);
                            btn.innerText = "❌";
                            localStorage.removeItem('token_global');
                        } else {
                            btn.innerText = "✅";
                            setTimeout(() => btn.innerText = "♻️", 3000);
                        }
                    });
                };
            });

        } else {
            linkTable.innerHTML += `<div class="af-gl-card" style="text-align:center; background: linear-gradient(145deg, rgba(220, 20, 60, 0.15), rgba(220, 20, 60, 0.05)); border: 1px solid rgba(220, 20, 60, 0.2);">
                <span style="color: #fca5a5; font-size: 13px;">❌ Нет комплектаций</span>
            </div>`;
        }
    });

    // --- 2. ЗАПРОС ОБЫЧНЫХ УСЛУГ ---
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/persons/${stidNew}/education-services/`, requestOptions: { method: 'GET' } }, function (res) {
        if (!res.success) return;
        const data = JSON.parse(res.fetchansver);

        if (data.data.length > 0) {
            let htmlStr = '';
            let arrservice = [];
            let srvKeyMap = new Map((servicecontainer?.data || []).map(d => [d.serviceTypeKey, d.shortTitle]));

            data.data.forEach((service, i) => {
                if (srvKeyMap.has(service.serviceTypeKey)) service.serviceTypeKey = srvKeyMap.get(service.serviceTypeKey);
                if (service.student.general.id != stidNew || service.incorrectnessReason != null) return;

                const sType = service.serviceTypeKey;
                const ignoreTypes = ["Англ Talks 15 min", "Skyeng Space", "Групповые онлайн-мероприятия Life", "Скрининг", "Англ adult АЯ Даунсейл"];
                if (ignoreTypes.includes(sType)) return;

                arrservice.push(service.id);

                // Определяем статус и стили
                let statusClass, statusText, statusIcon;
                let balanceHtml = `<div class="af-gl-service-balance">${service.balance}</div>`;

                if (service.stage === "after_trial" || service.stage === "before_call") {
                    statusClass = 'af-gl-status-vu';
                    statusText = 'Этап ВУ';
                    statusIcon = '⚡';

                    htmlStr += `
                    <div class="af-gl-service-card">
                        <div class="af-gl-service-header">
                            <span class="af-gl-service-status ${statusClass}">${statusIcon} ${statusText}</span>
                            <span class="af-gl-service-id">
                                #${service.id}
                                <span class="af-gl-icon-btn af-gl-copy-sid" data-sid="${service.id}" title="Копировать ID услуги">📋</span>
                            </span>
                        </div>
                        ${balanceHtml}
                        <div class="af-gl-service-type">💡 ${sType}</div>
                    </div>`;

                } else if (service.stage === "regular_lessons") {
                    statusClass = 'af-gl-status-regular';
                    statusText = 'Регулярные';
                    statusIcon = '';

                    const t = service.teacher
                        ? `<div class="af-gl-service-teacher">👨‍🏫 ${service.teacher.general.id}, ${service.teacher.general.name} ${service.teacher.general.surname}</div>`
                        : `<div class="af-gl-service-teacher missing">👨‍🏫 Не закреплен!</div>`;
                    const tmp = service.temporaryTeacher
                        ? `<div class="af-gl-service-teacher" style="margin-top:4px; background: rgba(253, 224, 71, 0.08); border-color: rgba(253, 224, 71, 0.2); color: #fde047;">⏳ ${service.temporaryTeacher.general.id}, ${service.temporaryTeacher.general.name}</div>`
                        : '';

                    htmlStr += `
                    <div class="af-gl-service-card">
                        <div class="af-gl-service-header">
                            <span class="af-gl-service-status ${statusClass}">${statusIcon} ${statusText}</span>
                            <span class="af-gl-service-id">
                                #${service.id}
                                <span class="af-gl-icon-btn af-gl-copy-sid" data-sid="${service.id}" title="Копировать ID услуги">📋</span>
                            </span>
                        </div>
                        ${balanceHtml}
                        <div class="af-gl-service-type">💡 ${sType}</div>
                        ${t}
                        ${tmp}
                    </div>`;

                } else if (service.stage === "lost") {
                    statusClass = 'af-gl-status-lost';
                    statusText = 'Потерянная';
                    statusIcon = '💀';

                    htmlStr += `
                    <div class="af-gl-service-card">
                        <div class="af-gl-service-header">
                            <span class="af-gl-service-status ${statusClass}">${statusIcon} ${statusText}</span>
                            <span class="af-gl-service-id">
                                #${service.id}
                                <span class="af-gl-icon-btn af-gl-copy-sid" data-sid="${service.id}" title="Копировать ID услуги">📋</span>
                            </span>
                        </div>
                        ${balanceHtml}
                        <div class="af-gl-service-type">💡 ${sType}</div>
                    </div>`;
                }
            });

            servTable.innerHTML = htmlStr || '<div class="af-gl-empty-state">Нет отображаемых услуг</div>';

            // Обработчики копирования ID услуги
            document.querySelectorAll('.af-gl-copy-sid').forEach(btn => {
                btn.onclick = function (e) {
                    e.stopPropagation();
                    const sid = this.dataset.sid;
                    copyToClipboard(sid);
                    createAndShowButton(`ID услуги ${sid} скопирован`, 'message');

                    // Визуальный фидбек
                    this.textContent = '✅';
                    setTimeout(() => this.textContent = '📋', 1200);
                };
            });

            document.getElementById('getusremail').onclick = () => {
                const text = document.getElementById('mailunhidden').textContent;
                copyToClipboard(text);
                createAndShowButton(`Почта скопирована`, 'message');
            };
            document.getElementById('getusrphone').onclick = () => {
                const text = document.getElementById('phoneunhidden').textContent;
                copyToClipboard(text);
                createAndShowButton(`Телефон скопирован`, 'message');
            };
        } else {
            servTable.innerHTML = `<div class="af-gl-empty-state" style="border-color: rgba(220, 20, 60, 0.3);">
                <div style="font-size: 24px; margin-bottom: 8px;">📭</div>
                <div style="color: #fca5a5; font-weight: 600;">Услуг не найдено</div>
            </div>`;
        }
    });
}

function getuserinfo() {
    ['pochtaIdentity', 'telefonIdentity', 'mailunhidden', 'phoneunhidden', 'usrType', 'usrAge', 'usrName', 'usrCountry', 'getcurrentstatus']
        .forEach(id => { const el = document.getElementById(id); if (el) el.textContent = id.includes('hidden') ? 'hidden' : ''; });
    document.getElementById('servicetable').innerHTML = "Загрузка...";

    const avaWrapper = document.getElementById('avatarWrapper');
    if (avaWrapper) avaWrapper.style.display = "none";

    stid = idstudentField?.value.trim();
    if (!stid) return;

    setTimeout(getusernamecrm, 640);
    setTimeout(crmstatus, 700);
    setTimeout(() => {
        if (window.flagusertype === "teacher") {
            document.getElementById('servicetable').innerHTML = '';
        } else {
            getservices(stid);
        }
    }, 720);
}

document.getElementById('getidstudent')?.addEventListener('click', () => {
    getuserinfo();
});

idstudentField?.addEventListener('paste', (e) => {
    idstudentField.value = '';
    const pastedValue = (e.clipboardData || e.dataTransfer).getData('text').trim();
    setTimeout(() => {
        if (/^\d+$/.test(pastedValue)) {
            idstudentField.value = pastedValue;
            document.getElementById('getidstudent')?.click();
        }
    }, 0);
});
idstudentField?.addEventListener('input', () => { if (typeof onlyNumber === 'function') onlyNumber(idstudentField); });

document.getElementById('clearservinfo')?.addEventListener('click', () => {
    ['idstudent', 'timetabledata'].forEach(id => { const el = document.getElementById(id); if (el) el.value = el.innerText = ""; });['servicetable', 'usrType', 'usrAge', 'usrName', 'telefonIdentity', 'pochtaIdentity', 'usrCountry', 'mailunhidden', 'phoneunhidden']
        .forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ""; });
    ['CrmStatus', 'getcurrentstatus', 'AF_Timetable'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = "none"; });

    const avaWrapper = document.getElementById('avatarWrapper');
    if (avaWrapper) avaWrapper.style.display = "none";
});

document.getElementById('catchathistory')?.addEventListener('click', () => {
    document.getElementById('opennewcat')?.click();
    const cInput = document.getElementById('chatuserhis');
    if (cInput) cInput.value = idstudentField?.value.trim() || '';
    document.getElementById('btn_search_history')?.click();
});

document.getElementById('crmactivetasks')?.addEventListener('click', () => window.open(`https://crm2.skyeng.ru/persons/${idstudentField?.value.trim()}/customer-support/list`));
document.getElementById('newTrm')?.addEventListener('click', () => window.open(`https://trm.skyeng.ru/teacher/${idstudentField?.value.trim()}`));
document.getElementById('personalteacherpage')?.addEventListener('click', () => window.open(`https://skyeng.ru/teachers/id/${idstudentField?.value.trim()}`));

document.getElementById('getPastAndFutureLessons')?.addEventListener('click', () => {
    const tt = document.getElementById('AF_Timetable');
    if (tt) tt.style.display = tt.style.display === '' ? 'none' : '';
    document.getElementById('getlessonfuture')?.click();
});

document.getElementById('getloginer')?.addEventListener('click', async function () {
    const id = idstudentField?.value.trim();
    if (!id) return;
    this.style.background = "rgba(255, 165, 0, 0.4)";
    try {
        if (typeof getLoginLink === 'function') await getLoginLink(id);
        this.style.background = "rgba(0, 128, 0, 0.5)";
        createAndShowButton('💾 Ссылка-логинер cкопирована', 'message');
    } catch (e) {
        this.style.background = "rgba(255, 0, 0, 0.5)";
        alert('Не удалось получить логиннер: ' + e.message);
    } finally {
        setTimeout(() => this.style.background = "transparent", 2000);
    }
});