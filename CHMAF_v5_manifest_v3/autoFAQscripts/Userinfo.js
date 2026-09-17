// --- ВНЕДРЕНИЕ ИЗОЛИРОВАННЫХ СТИЛЕЙ (CLEAN & READABLE v7) ---
let otpTimerInterval = null;
const injectGlassStyles = () => {
    if (document.getElementById('af-glass-styles')) return;
    const style = document.createElement('style');
    style.id = 'af-glass-styles';
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

        :root {
            --af-gold: 255, 215, 0;
            --af-gold-dim: rgba(var(--af-gold), 0.15);
            --af-gold-glow: rgba(var(--af-gold), 0.4);
            --af-bg-dark: rgba(10, 14, 24, 0.92);
            --af-success: 34, 197, 94;
            --af-error: 239, 68, 68;
        }

        .af-gl-wrapper {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: #f8fafc;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5);
            font-size: 15px;
            box-sizing: border-box;
            width: 520px;
            line-height: 1.5;
            letter-spacing: 0.01em;
        }

        .af-gl-row-wrap {
            flex-wrap: wrap;
            gap: 8px;
        }

        .af-gl-panel {
            background: linear-gradient(165deg, rgba(15, 20, 35, 0.95), rgba(8, 11, 20, 0.98));
            backdrop-filter: blur(40px) saturate(180%);
            -webkit-backdrop-filter: blur(40px) saturate(180%);
            border: 1px solid rgba(var(--af-gold), 0.2);
            border-top: 1px solid rgba(var(--af-gold), 0.35);
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(var(--af-gold), 0.08) inset, 0 1px 0 rgba(255, 255, 255, 0.05) inset;
            padding: 18px;
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
            background: radial-gradient(circle at center, rgba(var(--af-gold), 0.03) 0%, transparent 60%);
            pointer-events: none;
            z-index: 0;
        }

        .af-gl-panel > * { position: relative; z-index: 1; }

        .af-gl-header {
            display: flex;
            gap: 8px;
            align-items: center;
            border-bottom: 1px solid rgba(var(--af-gold), 0.15);
            padding-bottom: 12px;
            position: relative;
        }

        .af-gl-header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            width: 40%;
            height: 1px;
            background: linear-gradient(90deg, rgba(var(--af-gold), 0.6), transparent);
        }

        .af-gl-row { display: flex; flex-wrap: nowrap; gap: 8px; align-items: center; }

        .af-gl-btn {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
            border: 1px solid rgba(var(--af-gold), 0.2);
            border-radius: 8px;
            color: #fefefe;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            padding: 0 14px;
            height: 34px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            flex-shrink: 0;
            white-space: nowrap;
        }

        .af-gl-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(var(--af-gold), 0.15), transparent);
            transition: left 0.5s ease;
        }

        .af-gl-btn:hover:not(:disabled)::before { left: 100%; }
        .af-gl-btn:hover:not(:disabled) {
            background: linear-gradient(145deg, rgba(var(--af-gold), 0.15), rgba(255, 255, 255, 0.08));
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.3), 0 0 12px rgba(var(--af-gold), 0.15);
            border-color: rgba(var(--af-gold), 0.5);
        }
        .af-gl-btn:active:not(:disabled) { transform: translateY(0) scale(0.96); }
        .af-gl-btn:disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(0.8); }

        .af-gl-btn-icon { width: 34px; padding: 0; font-size: 16px !important; flex-shrink: 0; min-width: 34px; }

        .af-gl-key-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border-radius: 6px;
            background: rgba(var(--af-gold), 0.08);
            border: 1px solid rgba(var(--af-gold), 0.25);
            color: #ffd700;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-size: 14px;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
        }
        .af-gl-key-btn:hover {
            background: rgba(var(--af-gold), 0.2);
            border-color: rgba(var(--af-gold), 0.6);
            box-shadow: 0 0 12px rgba(var(--af-gold), 0.3);
            transform: scale(1.1) rotate(-8deg);
        }
        .af-gl-key-btn:active { transform: scale(0.9); }
        .af-gl-key-btn.is-loading { animation: keyPulse 1s ease-in-out infinite; color: #fbbf24; border-color: #fbbf24; }
        .af-gl-key-btn.is-success { background: rgba(var(--af-success), 0.2); border-color: rgba(var(--af-success), 0.6); color: #4ade80; box-shadow: 0 0 12px rgba(var(--af-success), 0.3); transform: scale(1.1); }
        .af-gl-key-btn.is-error { background: rgba(var(--af-error), 0.2); border-color: rgba(var(--af-error), 0.6); color: #f87171; box-shadow: 0 0 12px rgba(var(--af-error), 0.3); animation: shake 0.4s ease-in-out; }

        @keyframes keyPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--af-gold), 0.4); } 50% { transform: scale(1.05); box-shadow: 0 0 8px 2px rgba(var(--af-gold), 0.2); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }

        .af-gl-input {
            background: linear-gradient(145deg, rgba(0, 0, 0, 0.4), rgba(10, 15, 30, 0.5));
            border: 1px solid rgba(var(--af-gold), 0.2);
            border-radius: 8px;
            color: #fefefe;
            padding: 0 14px;
            height: 34px;
            outline: none;
            text-align: center;
            transition: all 0.3s ease;
            flex: 1;
            min-width: 80px;
            font-weight: 600;
            font-size: 14px;
            letter-spacing: 0.02em;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
        }
        .af-gl-input:focus {
            border-color: rgba(var(--af-gold), 0.6);
            box-shadow: 0 0 0 2px rgba(var(--af-gold), 0.1), inset 0 2px 4px rgba(0,0,0,0.2);
            background: linear-gradient(145deg, rgba(0, 0, 0, 0.5), rgba(10, 15, 30, 0.6));
        }
        .af-gl-input::placeholder { color: rgba(148, 163, 184, 0.5); font-weight: 500; }

        .af-gl-badge {
            padding: 4px 10px;
            border-radius: 6px;
            border: 1px solid rgba(var(--af-gold), 0.3);
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            height: 28px;
            box-sizing: border-box;
            background: linear-gradient(135deg, rgba(var(--af-gold), 0.1), rgba(255, 255, 255, 0.05));
            backdrop-filter: blur(8px);
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            letter-spacing: 0.02em;
            font-size: 12px;
        }

        .af-gl-info-compact {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
            border: 1px solid rgba(var(--af-gold), 0.15);
            border-radius: 12px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .af-gl-info-main { display: flex; align-items: center; gap: 12px; }
        .af-gl-avatar-wrapper-compact, .af-gl-wrapper, .af-gl-panel, .af-gl-info-compact, .af-gl-info-main { overflow: visible !important; }

        .af-gl-avatar-compact {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            border: 2px solid rgba(var(--af-gold), 0.5);
            object-fit: cover;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: zoom-in;
            position: relative;
            z-index: 1;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4), 0 0 12px rgba(var(--af-gold), 0.1);
        }
        .af-gl-avatar-compact:hover {
            transform: scale(3.2);
            z-index: 999999;
            border-radius: 12px;
            border-color: rgba(var(--af-gold), 1);
            box-shadow: 0 16px 48px rgba(0,0,0,0.8), 0 0 0 3px rgba(var(--af-gold), 0.2);
            margin-right: -60px;
            margin-left: 15px;
        }

        .af-gl-info-core { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
        .af-gl-user-type { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.6); }
        .af-gl-user-name-row { display: flex; align-items: center; gap: 8px; }
        .af-gl-user-name { font-weight: 700; font-size: 17px; color: #fefefe; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .af-gl-contacts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .af-gl-contact-cell {
            background: rgba(0, 0, 0, 0.25);
            border: 1px solid rgba(var(--af-gold), 0.1);
            border-radius: 10px;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            transition: all 0.25s ease;
        }
        .af-gl-contact-cell:hover { background: rgba(0, 0, 0, 0.35); border-color: rgba(var(--af-gold), 0.25); }
        .af-gl-contact-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; display: flex; align-items: center; gap: 4px; }

        .af-gl-contact-value-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .af-gl-contact-value { font-size: 15px; color: #f1f5f9; font-weight: 600; word-break: break-all; flex: 1; }
        .af-gl-identity-status { font-size: 16px; flex-shrink: 0; line-height: 1; }

        .af-gl-icon-btn { cursor: pointer; opacity: 0.6; transition: all 0.25s ease; font-size: 14px; line-height: 1; flex-shrink: 0; }
        .af-gl-icon-btn:hover { opacity: 1; transform: scale(1.15); filter: drop-shadow(0 0 4px rgba(var(--af-gold), 0.6)); }

        .af-gl-info-single-row { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
        .af-gl-info-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; border: 1px solid rgba(var(--af-gold), 0.1); }
        .af-gl-info-item-label { color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
        .af-gl-info-item-value { color: #f1f5f9; font-weight: 600; font-size: 14px; }

        .af-gl-time-group { display: flex; gap: 6px; align-items: center; }
        .af-gl-time-chip { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; border: 1px solid rgba(var(--af-gold), 0.15); }
        .af-gl-time-label { color: #94a3b8; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
        .af-gl-time-value { color: #ffd700; font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 13px; }

        .af-gl-section-title { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 12px; color: #fefefe; margin-top: 4px; letter-spacing: 0.06em; text-transform: uppercase; }
        .af-gl-section-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(var(--af-gold), 0.4), transparent); }

        .af-gl-services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .af-gl-service-card {
            background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
            border: 1px solid rgba(var(--af-gold), 0.15);
            border-radius: 12px;
            padding: 14px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .af-gl-service-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, rgba(var(--af-gold), 0.6), transparent); opacity: 0; transition: opacity 0.3s; }
        .af-gl-service-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.4), 0 0 16px rgba(var(--af-gold), 0.1); border-color: rgba(var(--af-gold), 0.35); }
        .af-gl-service-card:hover::before { opacity: 1; }

        .af-gl-service-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 6px; }
        .af-gl-service-status { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .af-gl-status-vu { background: rgba(245, 131, 32, 0.2); border: 1px solid rgba(245, 131, 32, 0.4); color: #fdba74; }
        .af-gl-status-regular { background: rgba(69, 199, 52, 0.15); border: 1px solid rgba(69, 199, 52, 0.4); color: #86efac; }
        .af-gl-status-lost { background: rgba(138, 28, 129, 0.25); border: 1px solid rgba(138, 28, 129, 0.5); color: #d8b4fe; }

        .af-gl-service-id { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #cbd5e1; background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(var(--af-gold), 0.15); display: inline-flex; align-items: center; gap: 6px; }
        .af-gl-service-balance { display: flex; align-items: center; gap: 4px; font-size: 15px; font-weight: 800; color: #fde047; font-family: 'JetBrains Mono', monospace; }
        .af-gl-service-type { font-size: 14px; color: #7dd3fc; font-weight: 600; line-height: 1.3; word-break: break-word; }
        .af-gl-service-teacher { font-size: 12px; color: #86efac; display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: rgba(69, 199, 52, 0.08); border-radius: 8px; border: 1px solid rgba(69, 199, 52, 0.2); word-wrap: break-word; }
        .af-gl-service-teacher.missing { color: #fca5a5; background: rgba(220, 20, 60, 0.08); border-color: rgba(220, 20, 60, 0.2); }

        .af-gl-scrollable { max-height: 380px; overflow-y: auto; padding-right: 4px; display: flex; flex-direction: column; gap: 12px; }
        .af-gl-scrollable::-webkit-scrollbar { width: 4px; }
        .af-gl-scrollable::-webkit-scrollbar-track { background: transparent; }
        .af-gl-scrollable::-webkit-scrollbar-thumb { background: rgba(var(--af-gold), 0.3); border-radius: 8px; }
        .af-gl-scrollable::-webkit-scrollbar-thumb:hover { background: rgba(var(--af-gold), 0.6); }

        .af-gl-empty-state { grid-column: 1 / -1; text-align: center; padding: 20px; color: #94a3b8; font-size: 14px; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed rgba(var(--af-gold), 0.2); }

        .af-gl-complect-card { background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)); border: 1px solid rgba(var(--af-gold), 0.15); border-radius: 10px; padding: 12px; transition: all 0.3s ease; }
        .af-gl-complect-card:hover { background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03)); transform: translateX(2px); border-color: rgba(var(--af-gold), 0.3); }
        .af-gl-complect-header { font-weight: 700; font-size: 12px; margin-bottom: 8px; padding: 8px 10px; border-radius: 8px; text-align: center; letter-spacing: 0.02em; }

        .af-gl-bg-regular { background: rgba(69, 199, 52, 0.15); border: 1px solid rgba(69, 199, 52, 0.3); color: #86efac; }
        .af-gl-bg-lost { background: rgba(138, 28, 129, 0.25); border: 1px solid rgba(138, 28, 129, 0.4); color: #d8b4fe; }
        .af-gl-bg-success { background: rgba(69, 199, 52, 0.15); border: 1px solid rgba(69, 199, 52, 0.3); color: #86efac; }
        .af-gl-bg-info { background: rgba(30, 144, 255, 0.15); border: 1px solid rgba(30, 144, 255, 0.3); color: #7dd3fc; }
        .af-gl-bg-danger { background: rgba(220, 20, 60, 0.15); border: 1px solid rgba(220, 20, 60, 0.3); color: #fca5a5; }

        .af-gl-complect-table { width: 100%; border-collapse: separate; border-spacing: 0 4px; font-size: 12px; }
        .af-gl-complect-table td { padding: 6px 8px; background: rgba(0,0,0,0.25); }
        .af-gl-complect-table td:first-child { border-radius: 8px 0 0 8px; font-family: 'JetBrains Mono', monospace; color: #7dd3fc; font-weight: 600; }
        .af-gl-complect-table td:last-child { border-radius: 0 8px 8px 0; text-align: right; width: 32px; }

        .af-gl-sync-btn { cursor: pointer; transition: all 0.3s; display: inline-block; font-size: 14px; }
        .af-gl-sync-btn:hover { transform: rotate(180deg); filter: drop-shadow(0 0 4px rgba(var(--af-gold), 0.6)); }

        .af-gl-otp-group { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .af-gl-input-otp { min-width: 80px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 700; letter-spacing: 3px; }

        .af-gl-otp-timer { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .af-gl-otp-timer-ring { position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
        .af-gl-otp-timer-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotate(-90deg); }
        .af-gl-otp-timer-bg { fill: none; stroke: rgba(255, 255, 255, 0.1); stroke-width: 2.5; }
        .af-gl-otp-timer-progress { fill: none; stroke: #ffd700; stroke-width: 2.5; stroke-linecap: round; stroke-dasharray: 62.83; stroke-dashoffset: 0; transition: stroke-dashoffset 0.1s linear; filter: drop-shadow(0 0 4px rgba(var(--af-gold), 0.5)); }
        .af-gl-otp-timer-text { font-size: 11px; font-weight: 800; color: #ffd700; z-index: 1; font-family: 'JetBrains Mono', monospace; }

        @keyframes otpUrgent { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .af-gl-otp-timer.urgent .af-gl-otp-timer-ring { animation: otpUrgent 0.7s ease-in-out infinite; }
        .af-gl-otp-timer.urgent .af-gl-otp-timer-progress { stroke: #f87171; filter: drop-shadow(0 0 5px rgba(248, 113, 113, 0.6)); }
        .af-gl-otp-timer.urgent .af-gl-otp-timer-text { color: #f87171; }

        .cursor-pointer { cursor: pointer; transition: all 0.25s ease; }
        .cursor-pointer:hover { opacity: 0.9; transform: scale(1.02); }

        @keyframes afFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .af-gl-panel { animation: afFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }

        @media (max-width: 540px) {
            .af-gl-wrapper { width: 100%; max-width: 420px; }
            .af-gl-services-grid { grid-template-columns: 1fr; }
            .af-gl-info-single-row { flex-direction: column; align-items: stretch; }
            .af-gl-time-group { justify-content: space-between; }
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

// --- HTML ШАБЛОНЫ ---
const win_serviceinfo = `
<div class="af-gl-wrapper">
    <div class="af-gl-panel">
        <div class="af-gl-header chmaf-drag-handle" id="servicehead" style="cursor: grab;">
            <button title="Скрыть меню" id="hideMeservice" class="af-gl-btn af-gl-btn-icon" style="color: #ef4444; min-width: 34px;">❌</button>
            <button title="CRM" id="GotoCRM" class="af-gl-btn" style="min-width: 50px;">CRM</button>
            <button title="Показать контакты" id="dounhidemailandphone" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">👁️</button>
            <button title="Статус CRM" id="CrmStatus" class="af-gl-btn af-gl-btn-icon" style="display:none; min-width: 34px;">⭕</button>
            <span id="getcurrentstatus" class="af-gl-badge af-gl-bg-info" style="display:none;"></span>
        </div>

        <div class="af-gl-row af-gl-row-wrap">
            <input id="idstudent" class="af-gl-input" placeholder="ID У/П" autocomplete="off" style="min-width: 90px;">
            <button title="Поиск" id="getidstudent" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">🚀</button>
            <button title="Все задачи" id="crmactivetasks" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">📋</button>
            <button title="TRM 2.0" id="newTrm" class="af-gl-btn af-gl-btn-icon" style="display:none; min-width: 34px;">🗿</button>
            <button title="Стран. учителя" id="personalteacherpage" class="af-gl-btn af-gl-btn-icon" style="display:none; min-width: 34px;">🎭</button>
            <button title="Язык: RU" id="changeLocaleLng" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">🌍</button>
            <button title="Баланс" id="checkBalance" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">💰</button>
            <button title="Уроки" id="getPastAndFutureLessons" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">📆</button>
            <button title="Очистить" id="clearservinfo" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">🧹</button>
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
            <button title="Сген. код (МП)" id="getonetimepass" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">📱</button>
            <button title="Админка" id="editadmbtn" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">✏️</button>
            <button title="История чатов" id="catchathistory" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">🗄️</button>
            <button title="Набор" id="butTeacherNabor" class="af-gl-btn af-gl-btn-icon" style="display:none; min-width: 34px;">🚷</button>
            <button title="Рассрочка" id="partialPaymentinfo" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">💸</button>
            <button title="Подписка" id="subscriptioninfo" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">💵</button>
            <button title="Vimbot" id="openVimbotWindowsUserinfo" class="af-gl-btn af-gl-btn-icon" style="min-width: 34px;">▶️</button>
        </div>

        <div id="basicInfo" class="af-gl-info-container af-gl-info-compact">
            <div class="af-gl-info-main">
                <div id="avatarWrapper" class="af-gl-avatar-wrapper-compact" style="display:none;">
                    <img id="useravatar" class="af-gl-avatar-compact" src="" alt="Avatar">
                </div>
                <div class="af-gl-info-core">
                    <div id="usrType" class="af-gl-user-type"></div>
                    <div class="af-gl-user-name-row">
                        <span id="usrAge" class="af-gl-age-badge"></span>
                        <span id="usrName" class="af-gl-user-name"></span>
                        <span id="getloginer" class="af-gl-key-btn" title="Ссылка-логинер">🔑</span>
                    </div>
                </div>
            </div>

            <!-- Контакты с интегрированным статусом Identity -->
            <div class="af-gl-contacts-row">
                <div class="af-gl-contact-cell">
                    <span class="af-gl-contact-label">📧 Почта</span>
                    <div class="af-gl-contact-value-row">
                        <span id="mailunhidden" class="af-gl-contact-value">hidden</span>
                        <span id="mailIdentityStatus" class="af-gl-identity-status"></span>
                        <span class="af-gl-icon-btn" id="getusremail" title="Скопировать">📋</span>
                    </div>
                </div>
                <div class="af-gl-contact-cell">
                    <span class="af-gl-contact-label">☎️ Телефон</span>
                    <div class="af-gl-contact-value-row">
                        <span id="phoneunhidden" class="af-gl-contact-value">hidden</span>
                        <span id="phoneIdentityStatus" class="af-gl-identity-status"></span>
                        <span class="af-gl-icon-btn" id="getusrphone" title="Скопировать">📋</span>
                    </div>
                </div>
            </div>

            <!-- Страна | Язык | Время (без Identity, так как он теперь в контактах) -->
            <div class="af-gl-info-single-row">
                <div class="af-gl-info-item">
                    <span class="af-gl-info-item-label">🌍</span>
                    <span id="usrCountry" class="af-gl-info-item-value">—</span>
                </div>
                <div class="af-gl-info-item">
                    <span class="af-gl-info-item-label">Язык об🌐</span>
                    <span id="usrServLang" class="af-gl-info-item-value">—</span>
                </div>
                <div class="af-gl-time-group">
                    <div class="af-gl-time-chip">
                        <span class="af-gl-time-label">UTC</span>
                        <span id="utcOffset" class="af-gl-time-value">—</span>
                    </div>
                    <div class="af-gl-time-chip">
                        <span class="af-gl-time-label">MSK</span>
                        <span id="UTCtoMSK" class="af-gl-time-value">—</span>
                    </div>
                    <div class="af-gl-time-chip">
                        <span class="af-gl-time-label">Местное</span>
                        <span id="localTime" class="af-gl-time-value">—</span>
                    </div>
                </div>
            </div>
        </div>

        <div id="serviceSectionTitle" class="af-gl-section-title">
            <span>✨ Услуги</span>
            <div class="af-gl-section-line"></div>
        </div>
        <div id="serviceList" class="af-gl-scrollable">
            <div id="servicetable" class="af-gl-services-grid"></div>
        </div>

        <div id="complektSectionTitle" class="af-gl-section-title" style="margin-top: 4px;">
            <span>📦 Комплектации</span>
            <div class="af-gl-section-line"></div>
        </div>
        <div id="complektList" class="af-gl-scrollable">
            <div id="complekttable"></div>
        </div>
    </div>
</div>`;

const win_Timetable = `
<div class="af-gl-wrapper" style="width: 440px;">
    <div class="af-gl-panel">
        <div class="af-gl-header chmaf-drag-handle" id="HeadTimetable" style="cursor: grab; justify-content: space-between;">
            <span style="font-weight: 700; font-size: 15px;">📅 Расписание</span>
            <button class="af-gl-btn af-gl-btn-icon" id="hideMeTT" style="color: #ef4444; min-width: 34px;">❌</button>
        </div>
        <div class="af-gl-row" style="justify-content: center; gap: 10px;">
            <button class="af-gl-btn" id="getlessonpast" style="flex:1;">Прошедшие</button>
            <button class="af-gl-btn" id="getlessonfuture" style="flex:1;">Предстоящие</button>
        </div>
        <div id="timetableinfo" class="af-gl-scrollable" style="margin-top: 10px;">
            <div id="timetabledata" style="text-align: center;"></div>
        </div>
    </div>
</div>`;

const win_Complectations = `
<div class="af-gl-wrapper" style="width: 480px;">
    <div class="af-gl-panel">
        <div class="af-gl-header chmaf-drag-handle" id="headComplectations" style="cursor: grab; justify-content: space-between;">
            <span style="font-weight: 700; font-size: 15px;">📦 Комплектации</span>
            <button class="af-gl-btn af-gl-btn-icon" id="hideComplecations" style="color: #ef4444; min-width: 34px;">❌</button>
        </div>
        <div id="cmplInfo" class="af-gl-scrollable">
            <div id="cmplData"></div>
        </div>
    </div>
</div>`;

// --- ИНИЦИАЛИЗАЦИЯ ОКОН ---
const wintServices = typeof createWindow === 'function' ? createWindow('AF_Service', 'winTopService', 'winLeftService', win_serviceinfo) : null;
const wintTimetable = typeof createWindow === 'function' ? createWindow('AF_Timetable', 'winTopTimetable', 'winLeftTimetable', win_Timetable) : null;
const wintComplectations = typeof createWindow === 'function' ? createWindow('AF_Complectations', 'winTopComplectations', 'winLeftComplectations', win_Complectations) : null;

// --- УТИЛИТЫ И ХЕЛПЕРЫ ---
const getStudentId = () => {
    const userId = document.getElementById('idstudent')?.value.trim();
    if (!userId) {
        if (typeof createAndShowButton === 'function') createAndShowButton('Пожалуйста, введите ID студента.', 'warning');
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

// --- ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ КНОПОК КОПИРОВАНИЯ (ОДИН РАЗ!) ---
const initCopyButtons = () => {
    document.getElementById('getusremail')?.addEventListener('click', () => {
        const email = document.getElementById('mailunhidden')?.textContent;
        if (email && email !== 'hidden' && typeof copyToClipboard === 'function') {
            copyToClipboard(email);
            if (typeof createAndShowButton === 'function') createAndShowButton('📧 Почта скопирована', 'message');
        }
    });

    document.getElementById('getusrphone')?.addEventListener('click', () => {
        const phone = document.getElementById('phoneunhidden')?.textContent;
        if (phone && phone !== 'hidden' && typeof copyToClipboard === 'function') {
            copyToClipboard(phone);
            if (typeof createAndShowButton === 'function') createAndShowButton('☎️ Телефон скопирован', 'message');
        }
    });
};
setTimeout(initCopyButtons, 100);

// --- ОСНОВНЫЕ ОБРАБОТЧИКИ СОБЫТИЙ ---
document.getElementById('servicehead')?.addEventListener('dblclick', (a) => {
    if (typeof checkelementtype === 'function' && checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
        document.getElementById('AF_Service').style.display = 'none';
        document.getElementById('butServ')?.classList.remove('active');
    }
});
document.getElementById('hideMeservice')?.addEventListener('click', () => {
    document.getElementById('AF_Service').style.display = 'none';
    document.getElementById('butServ')?.classList.remove('active');
});

document.getElementById('dounhidemailandphone')?.addEventListener('click', async function () {
    this.disabled = true;
    const originalText = this.textContent;
    this.textContent = '⏳';
    try {
        await Promise.all([typeof getUnhideEmail === 'function' && getUnhideEmail(), typeof getUnhidePhone === 'function' && getUnhidePhone()]);
        if (typeof checkEmailAndPhoneIdentity === 'function') await checkEmailAndPhoneIdentity();
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('mailunhidden').textContent = '';
        document.getElementById('phoneunhidden').textContent = '';
        document.getElementById('mailIdentityStatus').textContent = '';
        document.getElementById('phoneIdentityStatus').textContent = '';
    } finally {
        this.disabled = false;
        this.textContent = originalText;
    }
});

const idstudentField = document.getElementById('idstudent');
if (idstudentField) {
    for (const buttonId in LINK_CONFIG) {
        document.getElementById(buttonId)?.addEventListener('click', () => {
            const userId = getStudentId();
            if (userId) openLinkInNewTab(userId, LINK_CONFIG[buttonId].url(userId));
        });
    }
}

document.getElementById('getonetimepass')?.addEventListener('click', async function () {
    const userId = getStudentId();
    if (!userId) return;
    const outputField = document.getElementById('onetimepassout');
    const timerContainer = document.getElementById('otpTimer');
    const timerText = document.getElementById('otpTimerText');
    const timerCircle = document.getElementById('otpTimerCircle');

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

        if (otpMatch && typeof startOtpTimer === 'function') {
            startOtpTimer(15, timerContainer, timerText, timerCircle, outputField);
        }
    } catch (e) {
        if (typeof createAndShowButton === 'function') createAndShowButton(`Ошибка: ${e.message}`, 'error');
        timerContainer.style.display = 'none';
    } finally {
        this.disabled = false;
        this.innerHTML = '📱';
    }
});

function startOtpTimer(duration, container, textEl, circleEl, inputEl) {
    const totalDuration = duration;
    let remaining = duration;
    const circumference = 62.83;

    container.style.display = 'flex';
    container.classList.remove('urgent');
    textEl.textContent = remaining;
    circleEl.style.strokeDashoffset = 0;

    otpTimerInterval = setInterval(() => {
        remaining--;
        textEl.textContent = remaining;
        const offset = circumference - (remaining / totalDuration) * circumference;
        circleEl.style.strokeDashoffset = offset;

        if (remaining <= 5) container.classList.add('urgent');

        if (remaining <= 0) {
            clearInterval(otpTimerInterval);
            otpTimerInterval = null;
            container.style.display = 'none';
            inputEl.value = '';
        }
    }, 1000);
}

document.getElementById('AF_Timetable')?.addEventListener('dblclick', (a) => {
    if (typeof checkelementtype === 'function' && checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') {
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
function getUserStatus() {
    return new Promise((resolve, reject) => {
        const sid = idstudentField?.value.trim();
        if (!sid) return reject(new Error("Пустой userId"));

        const fetchURL = `https://id.skyeng.ru/admin/users/${encodeURIComponent(sid)}`;
        const requestOptions = { method: 'GET', headers: { "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" }, credentials: 'include' };

        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, (response) => {
            if (!response || response.success !== true) {
                return reject(new Error(response?.error || "Неизвестная ошибка"));
            }
            const html = response.fetchAnswer || response.fetchansver || '';
            const tableMatch = html.match(/<th[^>]*>\s*Статус\s*<\/th>\s*<td>([^<]+)<\/td>/i);
            const divMatch = html.match(/статус:\s*<strong>([^<]+)<\/strong>/i);
            const looseMatch = html.match(/статус[:\s]*<strong>([^<]+)<\/strong>/i);
            const match = tableMatch || divMatch || looseMatch;

            if (match && match[1]) {
                const status = match[1].trim();
                let lnkToAddStatus = document.getElementById('usrType');
                if (!lnkToAddStatus) return reject(new Error('Элемент #usrType не найден'));

                let lnkForStatus = document.getElementById('userStatusBadge');
                if (!lnkForStatus) {
                    lnkForStatus = document.createElement('span');
                    lnkForStatus.id = 'userStatusBadge';
                    lnkForStatus.style.cssText = "font-weight: 700; padding: 2px 8px; margin-left: 8px; border-radius: 6px; color: #fff; display: inline-block; font-size: 11px; letter-spacing: 0.05em;";
                    lnkToAddStatus.appendChild(lnkForStatus);
                }

                if (status === 'активный') lnkForStatus.style.backgroundColor = '#22c55e';
                else if (status === 'временно отключен') lnkForStatus.style.backgroundColor = '#ef4444';
                else lnkForStatus.style.backgroundColor = '#64748b';

                lnkForStatus.textContent = status;
                setTimeout(() => {
                    const container = document.getElementById('usrType');
                    if (!document.getElementById('userStatusBadge') && container) container.appendChild(lnkForStatus);
                }, 500);
                resolve(status);
            } else {
                reject(new Error('Статус не найден в ответе'));
            }
        });
    });
}

async function checkEmailAndPhoneIdentity() {
    const userId = idstudentField?.value.trim();
    if (!userId || window.flagusertype !== "student") return;
    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: `https://id.skyeng.ru/admin/users/${userId}/update-contacts`, requestOptions: { method: 'GET' } });
        const html = response.fetchansver;
        const hasEmail = !html.includes('"identityEmail" disabled data-value=""');
        const hasPhone = !html.includes('"identityPhone" disabled data-value=""');

        // Обновляем статусы прямо в блоках контактов
        const mailStatusEl = document.getElementById('mailIdentityStatus');
        const phoneStatusEl = document.getElementById('phoneIdentityStatus');

        if (mailStatusEl) mailStatusEl.textContent = hasEmail ? STATUS_ICONS.VALID : STATUS_ICONS.INVALID;
        if (phoneStatusEl) phoneStatusEl.textContent = hasPhone ? STATUS_ICONS.VALID : STATUS_ICONS.INVALID;
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

async function fetchServiceConfiguration() {
    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: 'https://backend.skyeng.ru/api/products/configurations/', requestOptions: { method: 'GET' } });
        servicecontainer = JSON.parse(response.fetchansver);
    } catch (e) {
        console.error('Ошибка конфигурации сервиса:', e.message);
    }
}
fetchServiceConfiguration();

function formatLessonDate(dateString) {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function createFutureLessonHTML(lesson, type) {
    const { startedAt, lessonType, educationService, teacher } = lesson;
    const translatedType = LESSONS_CONFIG.LESSON_TYPE_MAP[lessonType] || lessonType;
    const srvTitle = (servicecontainer?.data || []).find(i => i.serviceTypeKey === educationService.serviceTypeKey)?.shortTitle || educationService.serviceTypeKey;
    const teacherInfo = teacher ? `<div style="font-size:12px; color:#86efac; margin-top:6px;">👨‍🏫 ${teacher.general.id} ${teacher.general.name} ${teacher.general.surname}</div>` : '';
    const statusHTML = type === 'past' ? `<div style="font-size:12px; margin-top:6px;">Статус: <span style="color:#86efac; font-weight:600;">Прошел</span></div>` : '';

    return `
        <div style="background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)); border: 1px solid rgba(255,215,0,0.15); border-radius: 12px; padding: 12px; margin-bottom: 8px;">
            <div style="margin-bottom:4px; font-size:12px;"><span style="color:#fde047;">📅</span> ${formatLessonDate(startedAt)}</div>
            <div style="margin-bottom:4px; font-size:12px;"><span style="color:#7dd3fc;">🎓</span> ${translatedType}</div>
            <div style="margin-bottom:4px; font-size:12px;"><span style="color:#94a3b8;">📚</span> ${educationService.id} ${srvTitle}</div>
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
    out.innerHTML = '<div style="padding:20px; color:#94a3b8;">Загрузка...</div>';
    try {
        const response = await sendMessageAsync({ action: 'getFetchRequest', fetchURL: LESSONS_CONFIG.apiUrls[type](userId), requestOptions: { method: 'GET' } });
        const data = JSON.parse(response.fetchansver);
        if (!data?.data?.length) {
            out.innerHTML = `<div class="af-gl-empty-state">${type === 'future' ? 'Уроки не запланированы' : 'Уроков еще не было'}</div>`;
            return;
        }
        out.innerHTML = data.data.map(l => createFutureLessonHTML(l, type)).join('');
    } catch (e) {
        out.innerHTML = `<div class="af-gl-empty-state" style="color:#fca5a5;">Ошибка загрузки</div>`;
    } finally {
        btn.disabled = false;
    }
}

document.getElementById('getlessonfuture')?.addEventListener('click', () => fetchAndDisplayLessons('future'));
document.getElementById('getlessonpast')?.addEventListener('click', () => fetchAndDisplayLessons('past'));

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
        if (typeof createAndShowButton === 'function') createAndShowButton('Язык обновлен', 'message');
        this.innerHTML = '✅';
    } catch (e) {
        this.innerHTML = '❌';
    } finally {
        setTimeout(() => { this.innerHTML = '🌍'; this.disabled = false; }, 2000);
    }
});

async function getusernamecrm() {
    const sid = idstudentField?.value.trim();
    if (!sid) throw new Error("Пустой userId");
    window.flagusertype = '';

    const res = await sendMessageAsync({
        action: 'getFetchRequest',
        fetchURL: `https://backend.skyeng.ru/api/persons/${sid}?crm2=true&debugParam=person-page`,
        requestOptions: { method: 'GET' }
    });

    const data = JSON.parse(res.fetchansver).data;
    window.flagusertype = data.type;
    const isStudent = data.type === "student";

    document.getElementById('usrName').textContent = `${data.name} ${data.surname || ''}`.trim();
    const typeEl = document.getElementById('usrType');
    typeEl.innerHTML = isStudent ? `<span style="color:#86efac;">🎓 Ученик</span>` : `<span style="color:#7dd3fc;">👨‍🏫 Преподаватель</span>`;

    document.getElementById('usrCountry').textContent = data.country || '—';

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

    let ageIco = "❓";
    if (data.birthday) {
        const age = new Date().getFullYear() - Number(data.birthday.split('-')[0]);
        ageIco = age < 18 ? "🔞" : age < 99 ? "🅰️" : "❓";
    }
    document.getElementById('usrAge').textContent = ageIco;

    const elsToHide = ['checkBalance', 'partialPaymentinfo', 'subscriptioninfo', 'getPastAndFutureLessons', 'complekttable', 'newTrm', 'butTeacherNabor', 'personalteacherpage', 'serviceList', 'complektList', 'serviceSectionTitle', 'complektSectionTitle'];
    elsToHide.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });

    if (isStudent) {
        ['checkBalance', 'partialPaymentinfo', 'subscriptioninfo', 'getPastAndFutureLessons', 'complekttable', 'serviceList', 'complektList', 'serviceSectionTitle', 'complektSectionTitle'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        document.getElementById('usrAge').style.display = '';
    } else {
        ['newTrm', 'butTeacherNabor', 'personalteacherpage'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });
        document.getElementById('usrAge').style.display = 'none';
        document.getElementById('servicetable').innerHTML = '';
    }

    const locale = data.serviceLocale || "⭕";
    document.getElementById('usrServLang').textContent = locale;
    document.getElementById('changeLocaleLng').style.display = locale === "ru" ? "none" : "";

    document.getElementById('utcOffset').textContent = data.utcOffset;
    document.getElementById('UTCtoMSK').textContent = data.utcOffset - 3;
    document.getElementById('localTime').textContent = new Date(Date.now() + data.utcOffset * 3600000).toISOString().substr(11, 5);

    return data;
}

async function crmstatus() {
    const userId = idstudentField?.value.trim();
    if (!userId) return;
    const statusEl = document.getElementById('getcurrentstatus');
    const crmEl = document.getElementById('CrmStatus');
    statusEl.style.display = 'none';
    crmEl.style.display = 'none';

    try {
        const res = await sendMessageAsync({
            action: 'getFetchRequest',
            fetchURL: `https://customer-support.skyeng.ru/task/user/${userId}`,
            requestOptions: { method: 'GET' }
        });
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

        if (flags.wait) {
            statusEl.style.display = '';
            statusEl.innerText = 'В ожидании';
            statusEl.className = 'af-gl-badge af-gl-bg-info';
        } else if (flags.processing) {
            statusEl.style.display = '';
            statusEl.innerText = 'Решается';
            statusEl.className = 'af-gl-badge af-gl-bg-danger';
            statusEl.title = flags.operator;
        }

        let icon = '📵';
        if (flags.tpOut && !flags.tp && !flags.notTp) icon = '💥';
        else if (!flags.tpOut && flags.tp && !flags.notTp) icon = '🛠';
        else if (flags.tpOut && flags.tp) icon = '💥';
        else if (flags.tp && flags.notTp && !flags.tpOut) icon = '🛠';

        crmEl.style.display = '';
        crmEl.innerText = icon;
    } catch (e) {
        console.error('crmstatus error:', e);
    }
}

async function getservices(stidNew) {
    const servTable = document.getElementById('servicetable');
    const compTable = document.getElementById('cmplData');
    const linkTable = document.getElementById('complekttable');

    servTable.innerHTML = '<div class="af-gl-empty-state">Загрузка услуг...</div>';
    compTable.innerHTML = "";
    linkTable.innerHTML = "";

    try {
        const [complectRes, servicesRes] = await Promise.all([
            sendMessageAsync({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/v1/students/${stidNew}/education-service-kits/`, requestOptions: { method: 'GET' } }),
            sendMessageAsync({ action: 'getFetchRequest', fetchURL: `https://backend.skyeng.ru/api/persons/${stidNew}/education-services/`, requestOptions: { method: 'GET' } })
        ]);

        const complectData = JSON.parse(complectRes.fetchansver);
        if (complectData.data.length > 0) {
            linkTable.innerHTML += `<div id="openOneComplectation" class="af-gl-card cursor-pointer af-gl-bg-success" style="text-align:center; margin-bottom: 8px; padding: 10px; border-radius:10px;">✅ Есть комплектации <span style="font-size: 11px; opacity: 0.8;">(кликни)</span></div>`;
            document.getElementById('openOneComplectation')?.addEventListener('click', () => {
                const w = document.getElementById('AF_Complectations');
                w.style.display = w.style.display === "none" ? "" : "none";
            });

            complectData.data.forEach(service => {
                if (service.incorrectnessReason == null) {
                    let sHtml = `<table class="af-gl-complect-table">`;
                    service.educationServices.forEach(el => {
                        let formattedText = typeof formatServiceType === 'function' ? formatServiceType(el.serviceTypeKey).formattedText : el.serviceTypeKey;
                        sHtml += `<tr>
                            <td><a href="https://crm2.skyeng.ru/persons/${service.student.general.id}/services/${el.id}" target="_blank" style="color:inherit; text-decoration:none;">${el.id}</a></td>
                            <td>${formattedText}</td>
                            <td style="color: #fde047; font-weight: 700;">${el.balance}</td>
                            <td><span class="af-gl-sync-btn" data-srvid="${el.id}" title="Синхронизировать">♻️</span></td>
                        </tr>`;
                    });
                    sHtml += `</table>`;

                    let opNote = service.operatorNote ? `title="${service.operatorNote.replace(/"/g, '&quot;')}"` : "";
                    const stageClass = service.stage === "regular_lessons" ? "af-gl-bg-regular" : service.stage === "lost" ? "af-gl-bg-lost" : "af-gl-bg-success";

                    compTable.innerHTML += `<div class="af-gl-complect-card" style="margin-bottom:10px;">
                        <div class="af-gl-complect-header ${stageClass}" ${opNote}>
                            📦 [${service.id}] ${service.productKit.title}
                            <div style="font-size: 11px; opacity: 0.8; margin-top: 4px; font-weight: 500;">
                                ${service.stage === "regular_lessons" ? "Регулярные занятия" : service.stage === "lost" ? "Потерянная" : service.stage}
                            </div>
                        </div>
                        ${sHtml}
                    </div>`;
                } else {
                    compTable.innerHTML += `<div class="af-gl-complect-card" style="margin-bottom:10px; text-align:center; border: 1px solid rgba(220, 20, 60, 0.3); background: linear-gradient(145deg, rgba(220, 20, 60, 0.1), rgba(220, 20, 60, 0.05));">
                        <div style="color: #fca5a5; font-weight: 600; font-size: 13px;">⚠️ [${service.id}] '${service.productKit.title}' — некорректна</div>
                    </div>`;
                }
            });

            document.querySelectorAll('.af-gl-sync-btn').forEach(btn => {
                btn.onclick = async function () {
                    const srvId = this.getAttribute('data-srvid');
                    this.innerText = "⏳";
                    const gToken = localStorage.getItem('token_global');
                    try {
                        await sendMessageAsync({
                            action: 'getFetchRequest',
                            fetchURL: `https://skysmart-core.skyeng.ru/api/v1/academic-activity/upsert-education-service-history/${srvId}`,
                            requestOptions: { headers: { "accept": "application/json, text/plain, */*", "authorization": `Bearer ${gToken}` }, method: "POST", mode: "cors" }
                        });
                        this.innerText = "✅";
                        setTimeout(() => this.innerText = "♻️", 3000);
                    } catch (response) {
                        if (typeof createAndShowButton === 'function') createAndShowButton('Не удалось выполнить запрос: ' + (response?.error || response.message), 'error');
                        this.innerText = "❌";
                        localStorage.removeItem('token_global');
                    }
                };
            });
        } else {
            linkTable.innerHTML += `<div class="af-gl-empty-state" style="border-color: rgba(220, 20, 60, 0.3); color: #fca5a5;">❌ Нет комплектаций</div>`;
        }

        const data = JSON.parse(servicesRes.fetchansver);
        if (data.data.length > 0) {
            let htmlStr = '';
            let srvKeyMap = new Map((servicecontainer?.data || []).map(d => [d.serviceTypeKey, d.shortTitle]));

            data.data.forEach((service) => {
                if (srvKeyMap.has(service.serviceTypeKey)) service.serviceTypeKey = srvKeyMap.get(service.serviceTypeKey);
                if (service.student.general.id != stidNew || service.incorrectnessReason != null) return;

                const sType = service.serviceTypeKey;
                const ignoreTypes = ["Англ Talks 15 min", "Skyeng Space", "Групповые онлайн-мероприятия Life", "Скрининг", "Англ adult АЯ Даунсейл"];
                if (ignoreTypes.includes(sType)) return;

                let statusClass, statusText, statusIcon;
                const balanceHtml = `<div class="af-gl-service-balance">💰 ${service.balance}</div>`;

                if (service.stage === "after_trial" || service.stage === "before_call") {
                    statusClass = 'af-gl-status-vu'; statusText = 'Этап ВУ'; statusIcon = '⚡';
                    htmlStr += `<div class="af-gl-service-card">
                        <div class="af-gl-service-header">
                            <span class="af-gl-service-status ${statusClass}">${statusIcon} ${statusText}</span>
                            <span class="af-gl-service-id">#${service.id} <span class="af-gl-icon-btn af-gl-copy-sid" data-sid="${service.id}" title="Копировать ID">📋</span></span>
                        </div>
                        ${balanceHtml}
                        <div class="af-gl-service-type">💡 ${sType}</div>
                    </div>`;
                } else if (service.stage === "regular_lessons") {
                    statusClass = 'af-gl-status-regular'; statusText = 'Регулярные'; statusIcon = '';
                    const t = service.teacher ? `<div class="af-gl-service-teacher">👨‍🏫 ${service.teacher.general.id}, ${service.teacher.general.name} ${service.teacher.general.surname}</div>` : `<div class="af-gl-service-teacher missing">👨‍🏫 Не закреплен!</div>`;
                    const tmp = service.temporaryTeacher ? `<div class="af-gl-service-teacher" style="margin-top:6px; background: rgba(253, 224, 71, 0.08); border-color: rgba(253, 224, 71, 0.2); color: #fde047;">⏳ ${service.temporaryTeacher.general.id}, ${service.temporaryTeacher.general.name}</div>` : '';
                    htmlStr += `<div class="af-gl-service-card">
                        <div class="af-gl-service-header">
                            <span class="af-gl-service-status ${statusClass}">${statusIcon} ${statusText}</span>
                            <span class="af-gl-service-id">#${service.id} <span class="af-gl-icon-btn af-gl-copy-sid" data-sid="${service.id}" title="Копировать ID">📋</span></span>
                        </div>
                        ${balanceHtml}
                        <div class="af-gl-service-type">💡 ${sType}</div>
                        ${t}${tmp}
                    </div>`;
                } else if (service.stage === "lost") {
                    statusClass = 'af-gl-status-lost'; statusText = 'Потерянная'; statusIcon = '💀';
                    htmlStr += `<div class="af-gl-service-card">
                        <div class="af-gl-service-header">
                            <span class="af-gl-service-status ${statusClass}">${statusIcon} ${statusText}</span>
                            <span class="af-gl-service-id">#${service.id} <span class="af-gl-icon-btn af-gl-copy-sid" data-sid="${service.id}" title="Копировать ID">📋</span></span>
                        </div>
                        <div class="af-gl-service-type">💡 ${sType}</div>
                    </div>`;
                }
            });

            servTable.innerHTML = htmlStr || '<div class="af-gl-empty-state">Нет отображаемых услуг</div>';

            document.querySelectorAll('.af-gl-copy-sid').forEach(btn => {
                btn.onclick = function (e) {
                    e.stopPropagation();
                    const sid = this.dataset.sid;
                    if (typeof copyToClipboard === 'function') copyToClipboard(sid);
                    if (typeof createAndShowButton === 'function') createAndShowButton(`ID услуги ${sid} скопирован`, 'message');
                    this.textContent = '✅';
                    setTimeout(() => this.textContent = '📋', 1200);
                };
            });
        } else {
            servTable.innerHTML = `<div class="af-gl-empty-state" style="border-color: rgba(220, 20, 60, 0.3);"><div style="font-size: 24px; margin-bottom: 8px;">📭</div><div style="color: #fca5a5; font-weight: 600;">Услуг не найдено</div></div>`;
        }
    } catch (e) {
        console.error('getservices error:', e);
        servTable.innerHTML = `<div class="af-gl-empty-state" style="color: #fca5a5;">❌ Ошибка загрузки услуг</div>`;
    }
}

async function getuserinfo() {
    ['mailunhidden', 'phoneunhidden', 'usrType', 'usrAge', 'usrName', 'usrCountry', 'getcurrentstatus', 'mailIdentityStatus', 'phoneIdentityStatus']
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = id.includes('hidden') ? 'hidden' : '';
        });
    document.getElementById('servicetable').innerHTML = '<div class="af-gl-empty-state">Загрузка...</div>';

    const avaWrapper = document.getElementById('avatarWrapper');
    if (avaWrapper) avaWrapper.style.display = "none";

    const oldBadge = document.getElementById('userStatusBadge');
    if (oldBadge) oldBadge.remove();

    stid = idstudentField?.value.trim();
    if (!stid) return;

    try {
        await getusernamecrm();
        await Promise.all([getUserStatus(), typeof crmstatus === 'function' && crmstatus()]);

        if (window.flagusertype === "teacher") {
            document.getElementById('servicetable').innerHTML = '';
        } else {
            await getservices(stid);
        }
    } catch (err) {
        console.error('Ошибка загрузки данных пользователя:', err);
        document.getElementById('servicetable').innerHTML = `<div class="af-gl-empty-state" style="color: #fca5a5;">❌ ${err.message}</div>`;
    }
}

document.getElementById('getidstudent')?.addEventListener('click', () => getuserinfo());

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
    ['idstudent', 'timetabledata'].forEach(id => { const el = document.getElementById(id); if (el) el.value = el.innerText = ""; });
    ['servicetable', 'usrType', 'usrAge', 'usrName', 'usrCountry', 'mailunhidden', 'phoneunhidden', 'mailIdentityStatus', 'phoneIdentityStatus'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = ""; });
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

// =====================================================================
// 🔑 ОБРАБОТЧИК КНОПКИ "ССЫЛКА-ЛОГИНЕР"
// =====================================================================
document.getElementById('getloginer')?.addEventListener('click', async function () {
    const id = idstudentField?.value.trim();
    if (!id) {
        if (typeof createAndShowButton === 'function') createAndShowButton('Введите ID для получения ссылки', 'warning');
        return;
    }

    const btn = this;
    btn.classList.remove('is-success', 'is-error');
    btn.classList.add('is-loading');
    btn.innerHTML = '⏳';

    try {
        if (typeof getLoginLink === 'function') {
            await getLoginLink(id);
        }

        btn.classList.remove('is-loading');
        btn.classList.add('is-success');
        btn.innerHTML = '✅';
        if (typeof createAndShowButton === 'function') createAndShowButton('💾 Ссылка-логинер скопирована', 'message');

    } catch (e) {
        btn.classList.remove('is-loading');
        btn.classList.add('is-error');
        btn.innerHTML = '❌';
        if (typeof createAndShowButton === 'function') createAndShowButton('Не удалось получить логинер: ' + (e.message || 'Ошибка'), 'error');

    } finally {
        setTimeout(() => {
            btn.classList.remove('is-success', 'is-error', 'is-loading');
            btn.innerHTML = '🔑';
        }, 2000);
    }
});