// === 1. ВСТРАИВАЕМЫЕ СТИЛИ (CYBER-DARK UI) ===
// ==========================================
// NEON GLASS ULTRA — Premium Cyber-Dark UI
// ==========================================

const neonGlassStyles = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    /* === CORE SYSTEM === */
    :root {
        --ngu-deep: #030508;
        --ngu-surface: rgba(8, 12, 20, 0.85);
        --ngu-surface-elevated: rgba(14, 20, 32, 0.9);
        --ngu-border: rgba(48, 56, 72, 0.4);
        --ngu-border-active: rgba(0, 240, 255, 0.35);

        --ngu-cyan: #22d3ee;
        --ngu-cyan-soft: rgba(34, 211, 238, 0.08);
        --ngu-cyan-glow: 0 0 20px rgba(34, 211, 238, 0.15), 0 0 40px rgba(34, 211, 238, 0.05);

        --ngu-purple: #a78bfa;
        --ngu-purple-core: #8b5cf6;
        --ngu-purple-glow: 0 0 15px rgba(167, 139, 250, 0.2);

        --ngu-green: #34d399;
        --ngu-red: #f87171;
        --ngu-gold: #fbbf24;

        --ngu-text-primary: #f8fafc;
        --ngu-text-secondary: #cbd5e1;
        --ngu-text-muted: #94a3b8;

        --ngu-radius-sm: 8px;
        --ngu-radius: 12px;
        --ngu-radius-lg: 16px;
        --ngu-transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* === ANIMATIONS === */
    @keyframes ngu-appear {
        0% { opacity: 0; transform: translateY(-20px) scale(0.95) rotateX(5deg); }
        100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0); }
    }
    @keyframes ngu-slide-up {
        0% { opacity: 0; transform: translateY(16px) scale(0.98); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes ngu-shimmer {
        0% { background-position: -300% 0; }
        100% { background-position: 300% 0; }
    }
    @keyframes ngu-pulse-cyan {
        0%, 100% { box-shadow: 0 0 5px rgba(34,211,238,0.2), 0 0 20px rgba(34,211,238,0.05); }
        50% { box-shadow: 0 0 15px rgba(34,211,238,0.3), 0 0 40px rgba(34,211,238,0.1); }
    }
    @keyframes ngu-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }
    @keyframes ngu-scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
    }
    @keyframes ngu-border-rotate {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    /* === WRAPPER === */
    .ngu-wrapper {
        width: 500px;
        background: var(--ngu-surface);
        backdrop-filter: blur(24px) saturate(160%);
        -webkit-backdrop-filter: blur(24px) saturate(160%);
        border: 1px solid var(--ngu-border);
        border-radius: var(--ngu-radius-lg);
        box-shadow:
            0 32px 64px -16px rgba(0, 0, 0, 0.85),
            0 0 0 1px rgba(255, 255, 255, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            0 0 60px rgba(34, 211, 238, 0.03);
        font-family: 'Inter', -apple-system, system-ui, sans-serif;
        overflow: hidden;
        color: var(--ngu-text-primary);
        animation: ngu-appear 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        transform-style: preserve-3d;
        perspective: 1000px;
    }

    /* Holographic grid overlay */
    .ngu-wrapper::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
            radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.04) 1px, transparent 0);
        background-size: 32px 32px;
        mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        pointer-events: none;
        z-index: 0;
    }

    /* Scanline effect */
    .ngu-wrapper::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(34, 211, 238, 0.015) 50%
        );
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 1;
    }

    /* === HEADER === */
    .ngu-header {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: linear-gradient(180deg, rgba(16,24,40,0.9) 0%, rgba(8,12,20,0.6) 100%);
        padding: 16px 20px;
        border-bottom: 1px solid var(--ngu-border);
        cursor: -webkit-grab;
        z-index: 2;
        overflow: hidden;
    }

    /* Animated border bottom */
    .ngu-header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: -50%;
        right: -50%;
        height: 1px;
        background: linear-gradient(90deg,
            transparent,
            var(--ngu-cyan),
            var(--ngu-purple),
            var(--ngu-cyan),
            transparent
        );
        background-size: 200% 100%;
        animation: ngu-border-rotate 4s linear infinite;
        opacity: 0.5;
    }

    .ngu-title-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .ngu-title-icon {
        width: 8px;
        height: 8px;
        background: var(--ngu-cyan);
        border-radius: 50%;
        box-shadow: 0 0 12px var(--ngu-cyan), 0 0 24px rgba(34,211,238,0.3);
        animation: ngu-pulse-cyan 2.5s ease-in-out infinite;
        position: relative;
    }

    .ngu-title-icon::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 1px solid rgba(34,211,238,0.2);
        animation: ngu-pulse-cyan 2.5s ease-in-out infinite 0.3s;
    }

    .ngu-title {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 2.5px;
        color: var(--ngu-text-primary);
        text-transform: uppercase;
        text-shadow: 0 0 30px rgba(34, 211, 238, 0.2);
    }

    .ngu-subtitle {
        font-size: 10px;
        color: var(--ngu-text-muted);
        letter-spacing: 1px;
        margin-top: 2px;
        font-family: 'JetBrains Mono', monospace;
    }

    /* === CONTROLS === */
    .ngu-controls {
        display: flex;
        gap: 12px;
        padding: 20px;
        background: transparent;
        position: relative;
        z-index: 2;
    }

    .ngu-input-wrap {
        flex: 1;
        position: relative;
    }

    .ngu-input {
        width: 100%;
        background: rgba(2, 6, 12, 0.7);
        border: 1px solid var(--ngu-border);
        color: var(--ngu-cyan);
        border-radius: var(--ngu-radius-sm);
        padding: 11px 14px;
        font-size: 14px;
        font-weight: 600;
        font-family: 'JetBrains Mono', monospace;
        outline: none;
        text-align: center;
        letter-spacing: 1px;
        transition: var(--ngu-transition);
        box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);
        box-sizing: border-box;
    }

    .ngu-input::placeholder {
        color: #64748b;
        font-family: 'Inter', sans-serif;
        font-weight: 400;
        letter-spacing: 0.5px;
    }

    .ngu-input:focus {
        border-color: rgba(34, 211, 238, 0.5);
        box-shadow:
            inset 0 2px 8px rgba(0,0,0,0.4),
            0 0 0 3px rgba(34, 211, 238, 0.08),
            var(--ngu-cyan-glow);
        background: rgba(2, 6, 12, 0.9);
    }

    /* Input glow line */
    .ngu-input-wrap::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, var(--ngu-cyan), transparent);
        transition: all 0.4s ease;
        transform: translateX(-50%);
        border-radius: 2px;
    }

    .ngu-input-wrap:focus-within::after {
        width: 80%;
    }

    /* === BUTTONS === */
    .ngu-btn {
        background: linear-gradient(145deg, rgba(30,36,48,0.9), rgba(18,24,36,0.9));
        color: var(--ngu-text-secondary);
        border: 1px solid rgba(56, 64, 80, 0.5);
        border-radius: var(--ngu-radius-sm);
        padding: 11px 20px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        transition: var(--ngu-transition);
        position: relative;
        overflow: hidden;
        font-family: inherit;
        white-space: nowrap;
    }

    .ngu-btn::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%);
        opacity: 0;
        transition: opacity 0.4s;
    }

    .ngu-btn:hover::before {
        opacity: 1;
    }

    .ngu-btn:active {
        transform: scale(0.96) translateY(1px);
    }

    .ngu-btn-primary {
        color: var(--ngu-cyan);
        border-color: rgba(34, 211, 238, 0.25);
        background: linear-gradient(145deg, rgba(34,211,238,0.06), rgba(34,211,238,0.02));
        text-shadow: 0 0 12px rgba(34, 211, 238, 0.3);
    }

    .ngu-btn-primary:hover {
        background: linear-gradient(145deg, rgba(34,211,238,0.12), rgba(34,211,238,0.04));
        border-color: rgba(34, 211, 238, 0.5);
        box-shadow:
            0 0 25px rgba(34, 211, 238, 0.15),
            0 0 50px rgba(34, 211, 238, 0.05),
            inset 0 1px 0 rgba(255,255,255,0.05);
        color: #fff;
        transform: translateY(-1px);
    }

    .ngu-btn-danger {
        padding: 8px 14px;
        font-size: 10px;
        border-radius: var(--ngu-radius-sm);
        letter-spacing: 1px;
    }

    .ngu-btn-danger:hover {
        background: linear-gradient(145deg, rgba(248,113,133,0.12), rgba(248,113,133,0.04));
        color: var(--ngu-red);
        border-color: rgba(248,113,133,0.4);
        box-shadow: 0 0 20px rgba(248, 113, 133, 0.15);
        transform: translateY(-1px);
    }

    /* === CONTENT === */
    .ngu-content {
        max-height: 480px;
        overflow-y: auto;
        padding: 0 20px 20px 20px;
        font-size: 13px;
        position: relative;
        z-index: 2;
        scrollbar-width: thin;
        scrollbar-color: rgba(48,56,72,0.6) transparent;
    }
    .ngu-content::-webkit-scrollbar { width: 4px; }
    .ngu-content::-webkit-scrollbar-track { background: transparent; margin: 8px 0; }
    .ngu-content::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.4);
        border-radius: 10px;
    }
    .ngu-content::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.6); }

    /* === LOADER === */
    .ngu-loader {
        padding: 40px 20px;
        text-align: center;
    }

    .ngu-loader-ring {
        width: 40px;
        height: 40px;
        margin: 0 auto 16px;
        border: 2px solid rgba(34, 211, 238, 0.1);
        border-top-color: var(--ngu-cyan);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        box-shadow: 0 0 15px rgba(34,211,238,0.1);
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .ngu-loader-text {
        color: var(--ngu-cyan);
        font-size: 11px;
        letter-spacing: 3px;
        text-transform: uppercase;
        font-weight: 800;
        text-shadow: 0 0 15px rgba(34,211,238,0.2);
        animation: ngu-pulse-cyan 2s infinite;
    }

    .ngu-loader-sub {
        color: #64748b;
        font-size: 10px;
        margin-top: 6px;
        font-family: 'JetBrains Mono', monospace;
    }

    /* === STUDENT CARDS === */
    .ngu-student-card {
        display: flex;
        align-items: center;
        padding: 12px 14px;
        margin-bottom: 8px;
        background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
        border: 1px solid rgba(48, 56, 72, 0.25);
        border-radius: var(--ngu-radius);
        gap: 12px;
        transition: var(--ngu-transition);
        opacity: 0;
        animation: ngu-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        position: relative;
        overflow: hidden;
    }

    .ngu-student-card::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: linear-gradient(to bottom, var(--ngu-cyan), transparent);
        opacity: 0;
        transition: opacity 0.3s;
        border-radius: 3px 0 0 3px;
    }

    .ngu-student-card:hover {
        background: linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        border-color: rgba(34, 211, 238, 0.15);
        transform: translateX(6px) scale(1.01);
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(34, 211, 238, 0.04);
    }

    .ngu-student-card:hover::before {
        opacity: 0.7;
    }

    .ngu-index {
        color: #64748b;
        font-size: 11px;
        font-weight: 800;
        min-width: 28px;
        text-align: center;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 1px;
    }

    .ngu-avatar {
        width: 32px;
        height: 32px;
        border-radius: 10px;
        background: linear-gradient(135deg, rgba(34,211,238,0.15), rgba(139,92,246,0.15));
        border: 1px solid rgba(34,211,238,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 800;
        color: var(--ngu-cyan);
        flex-shrink: 0;
        text-shadow: 0 0 10px rgba(34,211,238,0.3);
        position: relative;
        overflow: hidden;
    }

    .ngu-avatar::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
        animation: ngu-shimmer 3s infinite;
    }

    .ngu-crm-btn {
        background: linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.04));
        color: var(--ngu-purple);
        border: 1px solid rgba(139, 92, 246, 0.35);
        padding: 5px 12px;
        border-radius: var(--ngu-radius-sm);
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1.5px;
        cursor: pointer;
        transition: var(--ngu-transition);
        text-transform: uppercase;
        flex-shrink: 0;
        font-family: inherit;
        position: relative;
        overflow: hidden;
    }

    .ngu-crm-btn:hover {
        background: linear-gradient(135deg, var(--ngu-purple-core), rgba(139,92,246,0.8));
        color: #fff;
        box-shadow: 0 0 25px rgba(139, 92, 246, 0.3);
        transform: scale(1.08);
        border-color: transparent;
    }

    .ngu-info {
        flex: 1;
        min-width: 0;
    }

    .ngu-name {
        color: #f1f5fc;
        font-weight: 700;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        letter-spacing: 0.2px;
    }

    .ngu-meta {
        color: #94a3b8;
        font-size: 11px;
        margin-top: 4px;
        font-family: 'JetBrains Mono', monospace;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .ngu-meta:hover {
        color: var(--ngu-cyan);
        text-shadow: 0 0 10px rgba(34,211,238,0.2);
    }

    .ngu-meta::after {
        content: '⎘';
        font-size: 10px;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .ngu-meta:hover::after {
        opacity: 0.6;
    }

    .ngu-service-tag {
        color: #94a3b8;
        font-size: 10px;
        background: rgba(30, 40, 60, 0.6);
        padding: 5px 10px;
        border-radius: var(--ngu-radius-sm);
        font-family: 'JetBrains Mono', monospace;
        white-space: nowrap;
        border: 1px solid rgba(48, 56, 72, 0.4);
        letter-spacing: 0.5px;
        font-weight: 500;
    }

    /* === TEACHER === */
    .ngu-teacher {
        margin-top: 20px;
        padding: 16px;
        background: linear-gradient(135deg, rgba(52,211,153,0.06), rgba(52,211,153,0.02));
        color: var(--ngu-green);
        font-weight: 800;
        text-align: center;
        border: 1px solid rgba(52, 211, 153, 0.15);
        border-radius: var(--ngu-radius);
        font-size: 12px;
        letter-spacing: 2px;
        text-transform: uppercase;
        position: relative;
        overflow: hidden;
        font-family: 'Inter', sans-serif;
    }

    .ngu-teacher::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(52,211,153,0.08), transparent);
        animation: ngu-shimmer 4s infinite;
    }

    .ngu-teacher-icon {
        display: inline-block;
        margin-right: 8px;
        animation: ngu-float 3s ease-in-out infinite;
    }

    /* === STATUSES === */
    .ngu-status {
        padding: 32px 24px;
        text-align: center;
        color: var(--ngu-text-secondary);
        font-size: 14px;
        border-radius: var(--ngu-radius);
        background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
        border: 1px dashed rgba(48, 56, 72, 0.3);
        margin-top: 4px;
        position: relative;
        overflow: hidden;
    }

    .ngu-status.error {
        color: var(--ngu-red);
        border-color: rgba(248, 113, 133, 0.25);
        background: linear-gradient(135deg, rgba(248,113,133,0.04), rgba(248,113,133,0.01));
        text-shadow: 0 0 15px rgba(248, 113, 133, 0.15);
    }

    .ngu-status.empty {
        border-style: dashed;
        border-color: rgba(251, 191, 36, 0.2);
        color: var(--ngu-gold);
    }

    .ngu-status-icon {
        font-size: 28px;
        margin-bottom: 10px;
        display: block;
        opacity: 0.4;
        filter: saturate(0.5);
    }

    .ngu-status-title {
        font-weight: 700;
        font-size: 15px;
        margin-bottom: 4px;
    }

    .ngu-status-desc {
        font-size: 13px;
        color: #94a3b8;
    }

    /* === COUNTERS === */
    .ngu-counter {
        display: flex;
        justify-content: center;
        gap: 24px;
        padding: 12px 20px;
        margin: 0 20px 16px;
        background: rgba(34, 211, 238, 0.03);
        border: 1px solid rgba(34, 211, 238, 0.08);
        border-radius: var(--ngu-radius-sm);
    }

    .ngu-counter-item {
        text-align: center;
    }

    .ngu-counter-value {
        font-size: 20px;
        font-weight: 900;
        color: var(--ngu-cyan);
        font-family: 'JetBrains Mono', monospace;
        text-shadow: 0 0 15px rgba(34,211,238,0.2);
    }

    .ngu-counter-label {
        font-size: 10px;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-top: 4px;
        font-weight: 700;
    }
</style>
`;
// === HTML STRUCTURE ===
var win_GrList = `
    ${neonGlassStyles}
    <div class="ngu-wrapper">
        <div class="ngu-header chmaf-drag-handle">
            <div class="ngu-title-group">
                <div class="ngu-title-icon"></div>
                <div>
                    <div class="ngu-title">Group information</div>
                    <div class="ngu-subtitle">Список участников группы</div>
                </div>
            </div>
            <button class="ngu-btn ngu-btn-danger" id="ngu-hide-btn">✕ Close</button>
        </div>
        <div class="ngu-controls">
            <div class="ngu-input-wrap" style="flex: 1;">
                <input id="ngu-input-id" class="ngu-input" placeholder="Введите ID группы..." autocomplete="off" type="text">
            </div>
            <button class="ngu-btn ngu-btn-primary" id="ngu-get-btn">Get Info</button>
        </div>
        <div id="ngu-results" class="ngu-content"></div>
    </div>
`;

// === WINDOW INIT ===
const wintGrList = createWindow('AF_GrList', 'winTopGrList', 'winTopGrList', win_GrList);
hideWindowOnDoubleClick('AF_GrList');

// === SANITIZE POSITION (защита от улёта) ===
function sanitizeWindowPosition(winElement) {
    if (!winElement) return;
    const rect = winElement.getBoundingClientRect();
    const padding = 60;
    let top = parseInt(winElement.style.top) || 120;
    let left = parseInt(winElement.style.left) || 295;

    const maxTop = window.innerHeight - padding;
    const maxLeft = window.innerWidth - padding;

    if (top < -rect.height + padding) top = padding;
    if (top > maxTop) top = Math.max(padding, maxTop - rect.height);
    if (left < -rect.width + padding) left = padding;
    if (left > maxLeft) left = Math.max(padding, maxLeft - rect.width);

    winElement.style.top = `${top}px`;
    winElement.style.left = `${left}px`;
    localStorage.setItem('winTopGrList', String(top));
    localStorage.setItem('winLeftGrList', String(left));
}

// === TOGGLE ===
function getGrListDataButtonPress() {
    const win = document.getElementById('AF_GrList');
    if (!win) {
        console.warn('[GrList] Окно не найдено');
        return;
    }
    sanitizeWindowPosition(win);
    const isHidden = window.getComputedStyle(win).display === 'none';
    win.style.display = isHidden ? 'block' : 'none';
    if (isHidden) setTimeout(() => document.getElementById('ngu-input-id')?.focus(), 50);
}
window.getGrListDataButtonPress = getGrListDataButtonPress;

// === EVENTS ===
document.getElementById('ngu-hide-btn').addEventListener('click', () => {
    const win = document.getElementById('AF_GrList');
    if (win) {
        win.style.display = 'none';
        document.getElementById('ngu-results').innerHTML = '';
        document.getElementById('ngu-input-id').value = '';
    }
});

document.getElementById('ngu-input-id').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('ngu-get-btn').click();
    if (e.key === 'Escape') document.getElementById('ngu-hide-btn').click();
});

// === API ===
const fetchViaBackground = (payload) => new Promise((resolve) => {
    chrome.runtime.sendMessage(payload, (response) => resolve(response));
});

// === MAIN LOGIC ===
document.getElementById('ngu-get-btn').addEventListener('click', async function () {
    const container = document.getElementById('ngu-results');
    const groupId = document.getElementById('ngu-input-id').value.trim();

    if (!groupId) {
        container.innerHTML = `
            <div class="ngu-status error">
                <span class="ngu-status-icon">⚠</span>
                <div class="ngu-status-title">Требуется ID группы</div>
                <div class="ngu-status-desc">Введите идентификатор для поиска</div>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="ngu-loader">
            <div class="ngu-loader-ring"></div>
            <div class="ngu-loader-text">Загрузка данных</div>
            <div class="ngu-loader-sub">skyeng api v1 › groups › participants</div>
        </div>`;

    try {
        const groupResponse = await fetchViaBackground({
            action: 'getFetchRequest',
            fetchURL: `https://learning-groups-storage-api.skyeng.ru/api/v1/groupParticipants/getParticipants/${groupId}`,
            requestOptions: { method: 'GET' }
        });

        if (!groupResponse?.success) {
            container.innerHTML = `
                <div class="ngu-status error">
                    <span class="ngu-status-icon">✕</span>
                    <div class="ngu-status-title">Ошибка запроса</div>
                    <div class="ngu-status-desc">${groupResponse?.error || 'Unknown error'}</div>
                </div>`;
            return;
        }

        const groupData = JSON.parse(groupResponse.fetchansver);
        const students = groupData.data?.students || [];
        const userIds = students.map(s => s.userId);

        if (userIds.length === 0) {
            container.innerHTML = `
                <div class="ngu-status empty">
                    <span class="ngu-status-icon">◯</span>
                    <div class="ngu-status-title">Группа пуста</div>
                    <div class="ngu-status-desc">Ученики не найдены или неверный ID</div>
                </div>`;
            return;
        }

        const namesResponse = await fetchViaBackground({
            action: 'getFetchRequest',
            fetchURL: "https://learning-groups-storage-api.skyeng.ru/api/v1/userInfo/findByIds",
            requestOptions: {
                method: "POST",
                headers: {
                    "accept": "application/json, text/plain, */*",
                    "content-type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify({ ids: userIds })
            }
        });

        const namesMap = {};
        if (namesResponse?.success) {
            const namesData = JSON.parse(namesResponse.fetchansver);
            namesData.data?.forEach(user => {
                const first = user.name?.first || '';
                const last = user.name?.last || '';
                namesMap[user.id] = `${first} ${last}`.trim() || 'Без имени';
            });
        }

        // Counter
        const teachers = groupData.data?.teachers || groupData.teachers;
        const teacherCount = teachers?.length || 0;

        container.innerHTML = `
            <div class="ngu-counter">
                <div class="ngu-counter-item">
                    <div class="ngu-counter-value">${students.length}</div>
                    <div class="ngu-counter-label">Учеников</div>
                </div>
                <div class="ngu-counter-item">
                    <div class="ngu-counter-value">${teacherCount}</div>
                    <div class="ngu-counter-label">Преподавателей</div>
                </div>
                <div class="ngu-counter-item">
                    <div class="ngu-counter-value">${groupId}</div>
                    <div class="ngu-counter-label">Group ID</div>
                </div>
            </div>`;

        if (teacherCount > 0) {
            const teacherRow = document.createElement('div');
            teacherRow.className = 'ngu-teacher';
            teacherRow.innerHTML = `<span class="ngu-teacher-icon">●</span> Преподаватель: ${teachers[0].userId}`;
            container.appendChild(teacherRow);
        }

        students.forEach((student, index) => {
            const name = namesMap[student.userId] || 'Имя не определено';
            const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            const card = document.createElement('div');
            card.className = 'ngu-student-card';
            card.style.animationDelay = `${index * 60}ms`;

            card.innerHTML = `
                <span class="ngu-index">${String(index + 1).padStart(2, '0')}</span>
                <div class="ngu-avatar">${initials}</div>
                <div class="ngu-info">
                    <div class="ngu-name">${name}</div>
                    <div class="ngu-meta" data-copy="${student.userId}">ID: ${student.userId}</div>
                </div>
                <button class="ngu-crm-btn" data-userid="${student.userId}">CRM</button>
                <span class="ngu-service-tag">${student.educationServiceId}</span>
            `;

            card.querySelector('.ngu-crm-btn').addEventListener('click', (e) => {
                window.open(`https://crm2.skyeng.ru/persons/${e.currentTarget.dataset.userid}`, '_blank');
            });

            const meta = card.querySelector('.ngu-meta');
            meta.addEventListener('click', async () => {
                await copyToClipboard(student.userId);
                meta.textContent = 'Скопировано!';
                meta.style.color = 'var(--ngu-cyan)';
                setTimeout(() => {
                    meta.textContent = `ID: ${student.userId}`;
                    meta.style.color = '';
                }, 1500);
            });

            container.appendChild(card);
        });



    } catch (error) {
        console.error('[GrList]', error);
        container.innerHTML = `
            <div class="ngu-status error">
                <span class="ngu-status-icon">⚡</span>
                <div class="ngu-status-title">Системная ошибка</div>
                <div class="ngu-status-desc">${error.message}</div>
            </div>`;
    }
});

// === BIND BUTTON (fallback) ===
(function initBinding() {
    const tryBind = () => {
        const btn = document.getElementById('GrListData');
        if (btn && !btn._nguBound) {
            btn.onclick = getGrListDataButtonPress;
            btn._nguBound = true;
            return true;
        }
        return false;
    };

    if (!tryBind()) {
        const obs = new MutationObserver(() => { if (tryBind()) obs.disconnect(); });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => obs.disconnect(), 15000);
    }
})();