let flagRemember = '';
let parsedData;
let responseslotsdata;
let arrayOfEvents = [];
let arrayOfMyEvents = [];
let uniqueEvents;
let operNamesAF = [];
let refreshintervalset = null;

// === УНИКАЛЬНЫЕ СТИЛИ GLASSMORPHISM ===
const glassStyles = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    /* === NEON GLASS ULTRA — CORE === */
    :root {
        --ngu-cyan: #22d3ee;
        --ngu-purple: #a78bfa;
        --ngu-green: #34d399;
        --ngu-red: #f87171;
        --ngu-gold: #fbbf24;
        --ngu-orange: #fb923c;
        --ngu-text: #f1f5fc;
        --ngu-text-secondary: #cbd5e1;
        --ngu-text-muted: #94a3b8;
    }

    /* === MAIN WRAPPER === */
    .af-glass-wrapper {
        width: 600px;
        position: relative;
        background:
            linear-gradient(135deg, rgba(26, 26, 44, 0.94) 0%, rgba(18, 18, 34, 0.96) 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23242850' fill-opacity='0.25'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        backdrop-filter: blur(20px) saturate(1.3);
        -webkit-backdrop-filter: blur(20px) saturate(1.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.5),
            0 20px 50px rgba(0, 0, 0, 0.7),
            0 0 30px rgba(139, 92, 246, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        color: var(--ngu-text);
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        overflow: hidden;
        animation: nguAppear 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .af-glass-wrapper::before {
        content: '';
        position: absolute;
        top: 0; left: -50%; right: -50%;
        height: 2px;
        background: linear-gradient(90deg,
            transparent 0%, #8b5cf6 20%, #ec4899 40%, #06b6d4 60%, #8b5cf6 80%, transparent 100%);
        background-size: 200% 100%;
        animation: nguBorderFlow 3s linear infinite;
        opacity: 0.7;
        z-index: 10;
        pointer-events: none;
    }

    .af-glass-wrapper::after {
        content: '';
        position: absolute;
        top: -50%; left: -50%;
        width: 200%; height: 200%;
        background: radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
    }

    @keyframes nguBorderFlow {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
    }

    @keyframes nguAppear {
        from { opacity: 0; transform: translateY(10px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Scroll Area */
    .af-glass-scroll-area {
        width: 100%;
        min-height: 70px;
        max-height: 800px;
        overflow-y: auto;
        overflow-x: hidden;
        border-radius: 16px;
        position: relative;
        z-index: 2;
    }

    .af-glass-scroll-area::-webkit-scrollbar { width: 4px; }
    .af-glass-scroll-area::-webkit-scrollbar-track { background: transparent; }
    .af-glass-scroll-area::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 4px; }
    .af-glass-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.5); }

    /* === NEON GLASS BUTTONS === */
    .af-glass-btn {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--ngu-text-secondary);
        border-radius: 8px;
        padding: 6px 12px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        font-size: 12px;
        font-weight: 600;
        position: relative;
        overflow: hidden;
        z-index: 1;
        flex-shrink: 0;
    }

    .af-glass-btn::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 45%;
        background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);
        border-radius: 8px 8px 0 0;
        pointer-events: none;
    }

    .af-glass-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }

    .af-glass-btn:active { transform: translateY(0) scale(0.97); }

    /* === MY SLOTS BUTTON — BRIGHT & CLICKABLE === */
    #showOperActiveSlots {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.12), rgba(34, 211, 238, 0.04)) !important;
        border: 1px solid rgba(34, 211, 238, 0.4) !important;
        color: #22d3ee !important;
        font-weight: 700 !important;
        letter-spacing: 0.5px !important;
        position: relative;
        z-index: 5;
        cursor: pointer !important;
        pointer-events: auto !important;
    }

    #showOperActiveSlots:hover {
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(34, 211, 238, 0.08)) !important;
        border-color: rgba(34, 211, 238, 0.6) !important;
        box-shadow: 0 0 20px rgba(34, 211, 238, 0.2), inset 0 0 8px rgba(34, 211, 238, 0.05) !important;
        color: #fff !important;
        transform: translateY(-1px) !important;
    }

    /* === AUTO-REFRESH TOGGLE — NEON SWITCH === */
    #autorefreshswitcher {
        appearance: none;
        -webkit-appearance: none;
        width: 40px;
        height: 22px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 11px;
        position: relative;
        cursor: pointer;
        transition: all 0.3s ease;
        outline: none;
        vertical-align: middle;
    }

    #autorefreshswitcher::after {
        content: '';
        position: absolute;
        top: 2px; left: 2px;
        width: 16px; height: 16px;
        background: #94a3b8;
        border-radius: 50%;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    #autorefreshswitcher:checked {
        background: rgba(34, 211, 238, 0.15);
        border-color: rgba(34, 211, 238, 0.4);
        box-shadow: 0 0 12px rgba(34, 211, 238, 0.15), inset 0 0 8px rgba(34, 211, 238, 0.05);
    }

    #autorefreshswitcher:checked::after {
        left: 20px;
        background: #22d3ee;
        box-shadow: 0 0 10px rgba(34, 211, 238, 0.5);
    }

    #autorefreshswitcher + span {
        color: var(--ngu-text-secondary);
        font-size: 12px;
        font-weight: 500;
        margin-left: 6px;
        vertical-align: middle;
    }

    #autorefreshswitcher:checked + span {
        color: #22d3ee;
        text-shadow: 0 0 8px rgba(34, 211, 238, 0.3);
    }

    /* === NEON GLASS INPUTS === */
    .af-glass-input {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        color: var(--ngu-cyan);
        border-radius: 8px;
        padding: 6px 10px;
        outline: none;
        transition: all 0.25s ease;
        font-family: 'JetBrains Mono', monospace;
        font-size: 13px;
        font-weight: 600;
        position: relative;
        z-index: 1;
    }

    .af-glass-input:focus {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(34, 211, 238, 0.4);
        box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.05), 0 0 12px rgba(34, 211, 238, 0.1);
    }

    .af-glass-input:disabled {
        background: transparent;
        border-color: transparent;
        color: var(--ngu-text-muted);
    }

    /* === OPERATOR INPUT (Neon Green) === */
    .af-glass-input-my {
        background: rgba(52, 211, 153, 0.08) !important;
        border: 1px solid rgba(52, 211, 153, 0.4) !important;
        box-shadow: inset 0 0 12px rgba(52, 211, 153, 0.1), 0 0 10px rgba(52, 211, 153, 0.1) !important;
        color: var(--ngu-green) !important;
    }

    /* === SLOTS (Time Tiles) — BRIGHT COLORS === */
    .af-glass-slot {
        width: 31%;
        cursor: pointer;
        color: #fff;
        font-weight: 700;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        font-size: 13px;
        height: 38px;
        margin: 0 5px 8px 0;
        display: flex;
        justify-content: center;
        align-items: center;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        z-index: 1;
    }
    .af-glass-slot::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 40%;
        background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);
        border-radius: 10px 10px 0 0;
        pointer-events: none;
    }

    .af-glass-slot:hover {
        transform: scale(1.05) translateY(-2px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        z-index: 2;
    }

    /* === ОБНОВЛЕННЫЙ ВИД ЦИФР ВРЕМЕНИ === */
    .af-glass-slot-time {
        background: rgba(0,0,0,0.4);
        border-radius: 6px;
        padding: 3px 8px;
        margin-right: 6px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.5px;
        position: relative;
        z-index: 1;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.5), 0 0 5px rgba(255,255,255,0.05);
    }

    /* === OPERATOR SLOT HIGHLIGHT === */
    .af-glass-slot-my {
        border: 2px solid rgba(52, 211, 153, 0.6) !important;
        box-shadow: inset 0 0 15px rgba(52, 211, 153, 0.2), 0 0 15px rgba(52, 211, 153, 0.15) !important;
    }

    .af-glass-slot-my::after {
        content: '';
        position: absolute;
        bottom: -2px; left: 20%; right: 20%;
        height: 3px;
        background: var(--ngu-green);
        border-radius: 50%;
        filter: blur(3px);
        opacity: 0.6;
    }

    /* === SLOT STATUSES === */
    .af-slot-full {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.1)) !important;
        border-color: rgba(239, 68, 68, 0.4) !important;
        color: #fecaca !important;
    }
    .af-slot-full:hover {
        box-shadow: 0 8px 20px rgba(0,0,0,0.4), 0 0 20px rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.6) !important;
    }
    .af-slot-full .af-glass-slot-time {
        background: rgba(239, 68, 68, 0.15);
        color: #fff;
        text-shadow: 0 0 8px rgba(239, 68, 68, 0.9);
        border: 1px solid rgba(239, 68, 68, 0.4);
    }

    .af-slot-free {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.1)) !important;
        border-color: rgba(34, 197, 94, 0.4) !important;
        color: #bbf7d0 !important;
    }
    .af-slot-free:hover {
        box-shadow: 0 8px 20px rgba(0,0,0,0.4), 0 0 20px rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.6) !important;
    }
    .af-slot-free .af-glass-slot-time {
        background: rgba(34, 197, 94, 0.15);
        color: #fff;
        text-shadow: 0 0 8px rgba(34, 197, 94, 0.9);
        border: 1px solid rgba(34, 197, 94, 0.4);
    }

    .af-slot-past {
        background: linear-gradient(135deg, rgba(100, 116, 139, 0.2), rgba(100, 116, 139, 0.05)) !important;
        border-color: rgba(100, 116, 139, 0.25) !important;
        color: #cbd5e1 !important;
    }
    .af-slot-past .af-glass-slot-time {
        background: rgba(100, 116, 139, 0.15);
        color: #e2e8f0;
        border: 1px solid rgba(100, 116, 139, 0.3);
    }

    /* === GLOWING BORDER ANIMATION === */
    @keyframes af-glass-glow {
        0% { box-shadow: 0 0 5px rgba(34, 211, 238, 0.3), inset 0 0 5px rgba(34, 211, 238, 0.1); border-color: rgba(34, 211, 238, 0.3); }
        50% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.5), inset 0 0 10px rgba(34, 211, 238, 0.2); border-color: rgba(34, 211, 238, 0.8); }
        100% { box-shadow: 0 0 5px rgba(34, 211, 238, 0.3), inset 0 0 5px rgba(34, 211, 238, 0.1); border-color: rgba(34, 211, 238, 0.3); }
    }
    .glowing-border-animation {
        animation: af-glass-glow 1.5s infinite;
        border-width: 2px;
        z-index: 3;
    }

    /* === SIDEPANEL (My Slots) === */
    .af-glass-sidepanel {
        background: linear-gradient(135deg, rgba(26, 26, 44, 0.95) 0%, rgba(18, 18, 34, 0.98) 100%);
        backdrop-filter: blur(20px) saturate(1.3);
        -webkit-backdrop-filter: blur(20px) saturate(1.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.5),
            0 16px 40px rgba(0, 0, 0, 0.6),
            0 0 25px rgba(139, 92, 246, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        position: relative;
        overflow: hidden;
    }

    .af-glass-sidepanel::before {
        content: '';
        position: absolute;
        top: 0; left: -50%; right: -50%;
        height: 2px;
        background: linear-gradient(90deg,
            transparent 0%, #34d399 30%, #22d3ee 70%, transparent 100%);
        background-size: 200% 100%;
        animation: nguBorderFlow 3s linear infinite;
        opacity: 0.6;
        pointer-events: none;
    }

    /* === BADGE === */
    .af-glass-badge {
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.05));
        padding: 6px 14px;
        border-radius: 10px;
        color: #fbbf24;
        font-weight: 800;
        font-size: 12px;
        border: 1px solid rgba(251, 191, 36, 0.3);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 10px rgba(251, 191, 36, 0.1);
        cursor: pointer;
        transition: all 0.25s ease;
        position: relative;
        overflow: hidden;
        text-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
    }

    .af-glass-badge::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 40%;
        background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
        border-radius: 10px 10px 0 0;
        pointer-events: none;
    }

    .af-glass-badge:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 20px rgba(251, 191, 36, 0.2);
    }

    /* === UPDATE TIME DISPLAY === */
    #datenowtime {
        color: var(--ngu-cyan) !important;
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        text-shadow: 0 0 8px rgba(34, 211, 238, 0.3) !important;
    }

    /* === LABELS & TEXT === */
    .af-glass-wrapper label span {
        color: var(--ngu-text-secondary);
        font-size: 12px;
        font-weight: 500;
    }

    /* === ANIMATIONS === */
    @keyframes nguPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    /* === NEW: SLOT EDIT PANEL === */
    .af-slot-edit-panel {
        width: 380px;
        flex-shrink: 0;
        padding: 18px;
        box-sizing: border-box;
        max-height: 800px;
        overflow-y: auto;
        animation: slotPanelSlide 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes slotPanelSlide {
        from { opacity: 0; transform: translateX(-20px); }
        to { opacity: 1; transform: translateX(0); }
    }

    .af-slot-edit-panel .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .af-slot-edit-panel .panel-title {
        font-size: 13px;
        font-weight: 700;
        color: var(--ngu-cyan);
        text-transform: uppercase;
        letter-spacing: 1px;
        text-shadow: 0 0 10px rgba(34, 211, 238, 0.2);
    }

    .af-slot-edit-panel .slot-row {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(0,0,0,0.25);
        padding: 10px 12px;
        border-radius: 10px;
        margin-bottom: 10px;
        border: 1px solid rgba(255,255,255,0.04);
        transition: all 0.2s ease;
    }

    .af-slot-edit-panel .slot-row:hover {
        background: rgba(0,0,0,0.35);
        border-color: rgba(255,255,255,0.08);
        transform: translateX(3px);
    }

    .af-slot-edit-panel .slot-row .slot-num {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05));
        color: #c4b5fd;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: 700;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        border: 1px solid rgba(139, 92, 246, 0.3);
        flex-shrink: 0;
    }

    .af-slot-edit-panel .slot-row .slot-input {
        flex-grow: 1;
        min-width: 0;
    }

    .af-slot-edit-panel .slot-row .slot-input input {
        width: 100%;
        box-sizing: border-box;
    }

    .af-slot-edit-panel .slot-row .slot-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
    }

    .af-slot-edit-panel .slot-row .slot-actions button {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-size: 14px;
    }

    .af-slot-edit-panel .slot-row.occupied .slot-num {
        background: linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(52, 211, 153, 0.05));
        color: #6ee7b7;
        border-color: rgba(52, 211, 153, 0.3);
    }

    .af-slot-edit-panel .slot-row.occupied .slot-input input {
        color: var(--ngu-green);
        background: rgba(52, 211, 153, 0.06);
        border-color: rgba(52, 211, 153, 0.25);
    }

    .af-slot-edit-panel .empty-state {
        text-align: center;
        padding: 40px 20px;
        opacity: 0.5;
        font-size: 13px;
        color: var(--ngu-text-muted);
    }

    .af-slot-edit-panel .close-btn {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        color: var(--ngu-text-muted);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 16px;
    }

    .af-slot-edit-panel .close-btn:hover {
        background: rgba(239, 68, 68, 0.15);
        color: #fca5a5;
        border-color: rgba(239, 68, 68, 0.3);
        transform: rotate(90deg);
    }

    /* === FIX: Текст в правой панели "Мои слоты" === */
#operatorActiveSlots {
    color: #f1f5fc;
}

#operatorActiveSlots h3 {
    color: #f1f5fc !important;
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 0 10px rgba(34, 211, 238, 0.15);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding-bottom: 12px;
    margin-bottom: 15px !important;
    text-align: center;
}

#operatorActiveSlots div[style*="text-align: center"] {
    color: #94a3b8 !important;
    font-size: 13px;
    margin-top: 30px !important;
}
</style>
`;

// === РАЗМЕТКА ===
const win_Calendar = `
${glassStyles}
<!-- Общий flex-контейнер: СЛОТЫ(слева) | КАЛЕНДАРЬ(центр) | МОИ СЛОТЫ(справа) -->
<div style="display: flex; gap: 15px; align-items: flex-start;">

    <!-- ЛЕВАЯ ПАНЕЛЬ: Редактирование выбранного слота -->
    <div id="slotList" class="af-glass-sidepanel af-slot-edit-panel" style="display: none;">
        <div class="panel-header">
            <span class="panel-title">📋 Редактирование слота</span>
            <span id="hideSlot" class="close-btn" title="Закрыть слоты">✕</span>
        </div>
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
            <span id="chosenSlot" class="af-glass-badge" title="Копировать в буфер"></span>
        </div>
        <div id="slotData"></div>
    </div>

    <!-- ЦЕНТР: Основной календарь -->
    <div class="af-glass-wrapper" id="AF_Calendar_Container">
        <div class="af-glass-scroll-area">
            <div style="cursor: default;">
                <div style="margin: 10px; display: flex; align-items: center; gap: 8px;" id="stataaf_header">
                    <button class="\${otherinpth} af-glass-btn" title="Скрывает меню" id="hidecalendar">❌</button>
                    <button class="\${otherinpth} af-glass-btn" title="Очистить окно" id="clearcalendar">🧹</button>
                    <button class="\${otherinpth} af-glass-btn" title="Обновить информацию" id="refreshcalendar">♻</button>
                    <button class="\${otherinpth} af-glass-btn" title="Открыть datsy.ru" id="opendatsy">📅</button>

                    <label title="Автообновление (каждые 30 сек)" style="display: flex; align-items: center; cursor: pointer;">
                        <input id="autorefreshswitcher" type="checkbox" checked style="margin-right: 5px;">
                        <span style="font-size: 12px;">Автообновление</span>
                    </label>

                    <div style="position: relative; margin-left: auto;">
                        <button class="\${otherinpth} af-glass-btn" id="showOperActiveSlots" title="Мои слоты за день">📑 Мои слоты</button>
                        <span id="availableActiveSlots" style="display:none; position: absolute; top: -8px; right: -8px; font-size: 14px;">⚠</span>
                    </div>
                </div>

                <div style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-bottom: 10px;">
                    <button class="af-glass-btn" id="prevDay">◀</button>
                    <input class="\${otherinpth} af-glass-input" type="date" id="eventDate" style="width: 110px; text-align: center; font-weight: bold;"></input>
                    <button class="af-glass-btn" id="nextDay">▶</button>
                    <button class="af-glass-btn" id="nowDay">Сегодня</button>
                    <span style="font-size: 13px; margin-left: 10px; opacity: 0.8;">Обновлено:</span>
                    <!-- Только время, ширина 90px -->
                    <input class="\${otherinpth} af-glass-input" type="text" id="datenowtime" style="width: 90px; text-align: center;" disabled></input>
                </div>

                <div id="outputcalendarfield" style="display: flex; flex-wrap: wrap; justify-content: center; padding: 0 5px 10px 5px;"></div>
            </div>
        </div>
    </div>

    <!-- ПРАВАЯ ПАНЕЛЬ: Мои слоты за день -->
    <div id="operatorActiveSlots" class="af-glass-sidepanel af-glass-scroll-area" style="display: none; width: 360px; max-height: 800px; padding: 15px; box-sizing: border-box;">
    </div>
</div>`;



// Создание окна
const wintCalendar = createWindow('AF_Calendar', 'winTopCalendar', 'winLeftCalendar', win_Calendar);
hideWindowOnDoubleClick('AF_Calendar');

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
const compareTimes = (time1, time2) => {
    return new Date(`1970-01-01 ${time1}`).getTime() - new Date(`1970-01-01 ${time2}`).getTime();
};

const sendFetchRequest = (url, options, successCallback) => {
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url, requestOptions: options }, (response) => {
        if (!response.success) {
            alert(`Ошибка запроса: ${response.error}`);
            return;
        }
        successCallback(response);
    });
};

// === ЛОГИКА ===
function checkAuth() {
    sendFetchRequest('https://datsy.ru/api/auth/check.php', { method: 'GET' }, (response) => {
        const data = JSON.parse(response.fetchansver);
        if (data['value-status'] === "Не авторизован") {
            alert("Вы не авторизованы на datsy.ru. Пожалуйста, авторизуйтесь.");
            window.open("https://datsy.ru/");
        } else {
            console.log("Вы авторизованы, загружаю календарь...");
            getTimeSlots();
        }
    });
}

function getSlotData(index) {
    const allRows = document.getElementsByName('slotRow');
    const slotListUI = document.getElementById('slotList');
    const hideSlotBtn = document.getElementById('hideSlot');
    const chosenSlotUI = document.getElementById('chosenSlot');
    const slotDataUI = document.getElementById('slotData');

    allRows[index].classList.toggle('glowing-border-animation');

    if (slotListUI.style.display === "none") {
        slotListUI.style.display = "block";
    }

    hideSlotBtn.onclick = () => {
        allRows[index].classList.remove('glowing-border-animation');
        flagRemember = '';
        slotListUI.style.display = "none";
    };

    const slotText = allRows[index].getAttribute('data-rawtext');
    chosenSlotUI.textContent = slotText;

    chosenSlotUI.onclick = () => {
        const [time, originalDate] = slotText.split(" ");
        const date = new Date(originalDate);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()} ${time}`;
        copyToClipboard(formattedDate);
    };

    slotDataUI.innerHTML = '';
    const slotsCount = parseInt(allRows[index].getAttribute('data-length'), 10);

    const fragment = document.createDocumentFragment();
    for (let j = 0; j < slotsCount; j++) {
        const div = document.createElement('div');
        div.className = 'slot-row';
        div.innerHTML = `
            <div class="slot-num">${j + 1}</div>
            <div class="slot-input">
                <input class="af-glass-input" name="slotInfo" placeholder="Пустой слот...">
            </div>
            <div class="slot-actions">
                <button class="af-glass-btn" name="saveToCalend" title="Сохранить">💾</button>
                <button class="af-glass-btn" name="deleteFromCalend" title="Удалить">❌</button>
            </div>
        `;
        fragment.appendChild(div);
    }
    slotDataUI.appendChild(fragment);

    const tempVarMatches = arrayOfEvents.filter(ev => `${ev.slotTime} ${ev.slotDate}` === slotText);
    const rows = slotDataUI.querySelectorAll('.slot-row');
    const inputs = document.getElementsByName('slotInfo');

    if (tempVarMatches.length > 0) {
        tempVarMatches.forEach((match, n) => {
            if (inputs[n]) {
                inputs[n].value = match.eventText;
                inputs[n].title = match.eventId;
                inputs[n].setAttribute('data-operator', match.createdBy);
                rows[n].classList.add('occupied');

                if (operNamesAF.includes(match.createdBy)) {
                    if (typeof exttheme !== 'undefined') {
                        inputs[n].classList.remove(exttheme);
                    }
                    if (typeof selectedinpth !== 'undefined') inputs[n].classList.add(selectedinpth);
                    inputs[n].classList.add('af-glass-input-my');
                }
            }
        });
    }

    // Привязка событий
    Array.from(inputs).forEach((input, b) => {
        input.ondblclick = () => {
            if (input.value) {
                const match = input.value.match(/(https?:\/\/[^\s]+)/);
                if (match) window.open(match[0]);
            }
        };

        const saveBtn = document.getElementsByName('saveToCalend')[b];
        const delBtn = document.getElementsByName('deleteFromCalend')[b];
        const [curSlotTime, curSlotDate] = slotText.split(' ');

        saveBtn.onclick = () => {
            const isNew = !input.title;
            const url = isNew ? `https://datsy.ru/api/slot-event/add.php` : `https://datsy.ru/api/slot-event/save.php`;
            const bodyData = isNew
                ? `addinput=${encodeURIComponent(input.value)}&slotname=${curSlotTime}&date=${curSlotDate}`
                : `event-text=${encodeURIComponent(input.value)}&save-slot=${input.title}`;

            sendFetchRequest(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyData,
                credentials: "include"
            }, getTimeSlots);
        };

        delBtn.onclick = () => {
            if (input.title && confirm("Вы действительно хотите удалить этот слот?")) {
                const rawReason = prompt("Укажите причину удаления:");
                if (rawReason) {
                    removeSlot(input.title, encodeURIComponent(rawReason));
                    input.title = '';
                    input.value = '';
                    rows[b].classList.remove('occupied');
                }
            }
        };
    });
}

function removeSlot(slotId, reason) {
    sendFetchRequest(`https://datsy.ru/api/slot-event/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `deleteslot=${slotId}&reason=${reason}`,
        credentials: "include"
    }, getTimeSlots);
}

function getTimeSlots() {
    const eventDateInput = document.getElementById('eventDate').value;
    const dateCalend = new Date();

    // Форматирование текущего времени (МСК)
    const offsetCalend = 3;
    const hoursCalendar = String((dateCalend.getUTCHours() + offsetCalend) % 24).padStart(2, '0');
    const minutesCalendar = String(dateCalend.getMinutes()).padStart(2, '0');
    const currentTimeCalendar = `${hoursCalendar}:${minutesCalendar}`;

    const curentDate = `${dateCalend.getFullYear()}-${String(dateCalend.getMonth() + 1).padStart(2, '0')}-${String(dateCalend.getDate()).padStart(2, '0')}`;
    const outputField = document.getElementById('outputcalendarfield');

    sendFetchRequest(`https://datsy.ru/api/main-events/?date=${eventDateInput}`, { method: 'GET' }, (response) => {
        const data = JSON.parse(response.fetchansver);

        arrayOfEvents = [];
        arrayOfMyEvents = [];
        uniqueEvents = new Set();
        outputField.innerHTML = '';

        // ИСПРАВЛЕНО: выводим только время, без даты
        document.getElementById('datenowtime').value = currentTimeCalendar;

        const unwantedTimes = new Set([
            "00:00", "00:20", "00:40", "01:00", "01:20", "01:40",
            "02:00", "02:20", "02:40", "03:00", "03:20", "03:40",
            "04:00", "04:20", "04:40", "05:00", "05:20", "05:40",
            "06:00", "06:20", "06:40", "07:00", "07:20", "07:40",
            "23:00", "23:20", "23:40"
        ]);

        const fragment = document.createDocumentFragment();

        Object.entries(data.DataTimeSlot).forEach(([time, slotData]) => {
            if (unwantedTimes.has(time)) return;

            let hasMyEvent = false; // Флаг для подсветки внешней плитки слота

            if (slotData.EventList && slotData.EventList.length !== 0) {
                Object.values(slotData.EventList).forEach(event => {
                    if (!uniqueEvents.has(event.id)) {
                        const eventObj = {
                            eventId: event.id,
                            eventText: event.text,
                            slotTime: event.slot,
                            slotDate: event.new_date_slot,
                            createdBy: event.created_by_name
                        };
                        arrayOfEvents.push(eventObj);
                        uniqueEvents.add(event.id);

                        if (operNamesAF.includes(event.created_by_name)) {
                            arrayOfMyEvents.push(eventObj);
                            hasMyEvent = true;
                        }
                    }
                });
            } else {
                for (let k = 0; k < slotData.CountSlot; k++) {
                    arrayOfEvents.push({ eventId: null, eventText: null, slotTime: null, slotDate: null, createdBy: null });
                }
            }

            const ratio = slotData.CountEvent / slotData.CountSlot;
            let slotClass = 'af-slot-full';
            let titleAttr = '';

            if (ratio === 0) {
                slotClass = 'af-slot-free';
            } else if (ratio > 0 && ratio < 1) {
                slotClass = 'af-slot-free';
                titleAttr = '⚠ Есть как занятые так и свободные слоты';
            } else if (slotData.CountEvent === 0 && slotData.CountSlot === 0) {
                titleAttr = '🚫 Свободных слотов изначально не было';
            } else if (slotData.AssignSlot === 0 && slotData.CountEvent === 0 && slotData.CountSlot === slotData.FreeSlot) {
                // remains af-slot-full
            } else if (slotData.FreeSlot < 0) {
                // remains af-slot-full
            }

            if (eventDateInput < curentDate || (compareTimes(time, currentTimeCalendar) <= 0 && eventDateInput === curentDate)) {
                slotClass = 'af-slot-past';
            }

            const slotEl = document.createElement('div');
            slotEl.className = `af-glass-slot ${slotClass}`;

            // Если в слоте есть событие оператора, добавляем зеленую обводку плитки
            if (hasMyEvent) {
                slotEl.classList.add('af-glass-slot-my');
            }

            slotEl.setAttribute('name', 'slotRow');
            slotEl.setAttribute('data-length', slotData.CountSlot);
            slotEl.setAttribute('data-rawtext', `${time} ${eventDateInput}`);
            if (titleAttr) slotEl.title = titleAttr;

            slotEl.innerHTML = `<span class="af-glass-slot-time">${time}</span>`;
            fragment.appendChild(slotEl);
        });

        outputField.appendChild(fragment);
        const allRows = document.getElementsByName('slotRow');

        if (flagRemember !== '' && allRows[flagRemember]) {
            getSlotData(flagRemember);
        }

        Array.from(allRows).forEach((row, index) => {
            row.onclick = () => {
                flagRemember = index;
                Array.from(allRows).forEach(r => r.classList.remove('glowing-border-animation'));
                getSlotData(index);
            };
        });

        refreshActiveOperSlots();
    });
}

function refreshActiveOperSlots() {
    const container = document.getElementById('operatorActiveSlots');
    const badge = document.getElementById('availableActiveSlots');
    container.innerHTML = '<h3 style="margin: 0 0 10px 0; text-align: center;">Ваши слоты</h3>';

    if (arrayOfMyEvents.length > 0) {
        badge.style.display = 'block';

        arrayOfMyEvents.forEach(event => {
            const isReserved = event.eventText.includes('бронь');
            const slotToDelete = (event.eventText.match(/\d{4,9}/) || [''])[0];
            const statusHtml = isReserved
                ? '<span style="background: rgba(255, 219, 0, 0.8); color: #000; padding: 4px 8px; border-radius: 8px; font-size: 12px;">Бронь</span>'
                : '<span style="background: rgba(255, 127, 80, 0.8); padding: 4px 12px; border-radius: 8px; font-size: 12px;">➰</span>';

            const div = document.createElement('div');
            div.style = "display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 10px; margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.05);";
            div.innerHTML = `
                <span class="af-glass-slot-time" style="margin: 0;">${event.slotTime}</span>
                <input class=" af-glass-input" name="slotToDelete" data-id="${event.eventId}" value="${slotToDelete}" style="width: 70px; text-align: center; font-size: 12px;">
                ${statusHtml}
                <button class="af-glass-btn" name="deleMySlot" style="padding: 4px 8px; margin-left: auto;">❌</button>
            `;
            container.appendChild(div);
        });

        const delBtns = document.getElementsByName('deleMySlot');
        const inputs = document.getElementsByName('slotToDelete');

        Array.from(delBtns).forEach((btn, idx) => {
            btn.onclick = () => {
                const id = inputs[idx].getAttribute('data-id');
                if (id && confirm("Удалить этот слот?")) {
                    // === ИСПРАВЛЕНИЕ: Проверка на отмену (null) перед кодированием ===
                    const rawReason = prompt("Укажите причину:");
                    if (rawReason) removeSlot(id, encodeURIComponent(rawReason));
                }
            };
        });
    } else {
        container.innerHTML += '<div style="text-align: center; margin-top: 20px; opacity: 0.6;">Нет занятых слотов</div>';
        badge.style.display = 'none';
    }
}

// === ИНИЦИАЛИЗАЦИЯ И СЛУШАТЕЛИ ===
document.getElementById('eventDate').addEventListener('change', getTimeSlots);

function getdatsyCalendarButtonPress() {
    const calendarUI = document.getElementById('AF_Calendar');
    const triggerBtn = document.getElementById('datsyCalendar');

    if (calendarUI.style.display === "none" || !calendarUI.style.display) {
        calendarUI.style.display = "block";
        if (triggerBtn) triggerBtn.classList.add('activeScriptBtn');

        const userNameElem = document.querySelector('.user_menu-dropdown-user_name');
        if (userNameElem) {
            const nameStr = userNameElem.textContent.split('-')[1].trim();
            operNamesAF = [nameStr, nameStr.split(" ").reverse().join(" ")];
        }

        checkAuth();

        const now = new Date();
        document.getElementById("eventDate").value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

        const isAuto = localStorage.getItem('refreshCalend') !== '0';
        document.getElementById('autorefreshswitcher').checked = isAuto;

        if (isAuto && !refreshintervalset) {
            refreshintervalset = setInterval(getTimeSlots, 30000);
        }
    } else {
        calendarUI.style.display = "none";
        if (triggerBtn) triggerBtn.classList.remove('activeScriptBtn');
    }
}

// Обработчики кнопок
const changeDate = (days) => {
    const dateInput = document.getElementById('eventDate');
    const date = new Date(dateInput.value);
    date.setDate(date.getDate() + days);
    dateInput.value = date.toISOString().split('T')[0];
    getTimeSlots();
};

document.getElementById('nextDay').onclick = () => changeDate(1);
document.getElementById('prevDay').onclick = () => changeDate(-1);
document.getElementById('nowDay').onclick = () => {
    document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
    getTimeSlots();
};

document.getElementById('autorefreshswitcher').addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    localStorage.setItem('refreshCalend', isChecked ? '1' : '0');

    if (isChecked && !refreshintervalset) {
        refreshintervalset = setInterval(getTimeSlots, 30000);
    } else if (!isChecked && refreshintervalset) {
        clearInterval(refreshintervalset);
        refreshintervalset = null;
    }
});

document.getElementById('hidecalendar').onclick = () => {
    document.getElementById('AF_Calendar').style.display = "none";
    const triggerBtn = document.getElementById('datsyCalendar');
    if (triggerBtn) triggerBtn.classList.remove('activeScriptBtn');
};

document.getElementById('clearcalendar').onclick = () => {
    document.getElementById('slotList').style.display = "none";
    document.getElementById('outputcalendarfield').innerHTML = '';
};

document.getElementById('refreshcalendar').onclick = () => {
    checkAuth();
    refreshActiveOperSlots();
    document.getElementById('slotList').style.display = "none";
};

document.getElementById('opendatsy').onclick = () => window.open("https://datsy.ru/");

document.getElementById('showOperActiveSlots').onclick = () => {
    const panel = document.getElementById('operatorActiveSlots');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    if (panel.style.display === 'block') refreshActiveOperSlots();
};