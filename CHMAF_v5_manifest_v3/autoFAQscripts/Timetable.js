var win_TimetableUI = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
    --tt-bg-primary: rgba(12, 12, 28, 0.82);
    --tt-bg-card: rgba(22, 27, 52, 0.65);
    --tt-bg-card-hover: rgba(30, 40, 70, 0.8);
    --tt-border: rgba(255, 255, 255, 0.06);
    --tt-border-glow: rgba(139, 92, 246, 0.3);
    --tt-accent: #8b5cf6;
    --tt-accent-soft: rgba(139, 92, 246, 0.15);
    --tt-accent-glow: rgba(139, 92, 246, 0.4);
    --tt-cyan: #22d3ee;
    --tt-cyan-soft: rgba(34, 211, 238, 0.12);
    --tt-text-primary: #f1f5f9;
    --tt-text-secondary: #94a3b8;
    --tt-text-muted: #64748b;
    --tt-radius-sm: 8px;
    --tt-radius-md: 12px;
    --tt-radius-lg: 16px;
    --tt-radius-xl: 20px;
    --tt-shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
    --tt-shadow-md: 0 4px 24px rgba(0, 0, 0, 0.4);
    --tt-shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.5);
    --tt-shadow-glow: 0 0 30px rgba(139, 92, 246, 0.15);
}

.tt-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--tt-bg-primary);
    backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
    -webkit-backdrop-filter: blur(40px) saturate(200%) brightness(1.1);
    border: 1px solid var(--tt-border);
    border-radius: var(--tt-radius-xl);
    box-shadow: var(--tt-shadow-lg), var(--tt-shadow-glow), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    overflow: hidden;
    min-width: 820px;
    max-width: 1000px;
    color: var(--tt-text-primary);
    position: relative;
}
.tt-container::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.4), rgba(34, 211, 238, 0.3), transparent);
}

.tt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(139, 92, 246, 0.03) 100%);
    border-bottom: 1px solid var(--tt-border);
    cursor: move;
}
.tt-title {
    font-weight: 700;
    font-size: 14px;
    color: var(--tt-text-primary);
    letter-spacing: 0.2px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.tt-title::before {
    content: '';
    width: 8px; height: 8px;
    background: var(--tt-accent);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--tt-accent-glow);
    flex-shrink: 0;
}
.tt-btn {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--tt-border);
    color: var(--tt-text-muted);
    width: 30px; height: 30px;
    border-radius: var(--tt-radius-sm);
    cursor: pointer;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.tt-btn:hover {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.3);
    color: #f87171;
    box-shadow: 0 0 16px rgba(239, 68, 68, 0.1);
}

.tt-input-group {
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.tt-week-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--tt-radius-md);
    border: 1px solid var(--tt-border);
    padding: 6px;
}
.tt-arrow {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid var(--tt-border);
    color: var(--tt-text-secondary);
    width: 36px; height: 36px;
    border-radius: var(--tt-radius-sm);
    cursor: pointer;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 700;
}
.tt-arrow:hover {
    background: var(--tt-accent-soft);
    border-color: var(--tt-border-glow);
    color: var(--tt-text-primary);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
}
.tt-arrow:active {
    transform: scale(0.92);
}
.tt-dates-row {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
}
.tt-date-field {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.04);
    border-radius: var(--tt-radius-sm);
    padding: 8px 14px;
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    color: var(--tt-text-primary);
    min-width: 115px;
    text-align: center;
    font-weight: 600;
    letter-spacing: 0.5px;
}
.tt-date-sep {
    color: var(--tt-accent);
    font-size: 16px;
    opacity: 0.6;
}

.tt-input-row {
    display: flex;
    gap: 10px;
    align-items: center;
}
.tt-input {
    width: 100%;
    padding: 11px 14px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--tt-radius-sm);
    font-size: 13px;
    color: var(--tt-text-primary);
    outline: none;
    box-sizing: border-box;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex: 1;
    min-width: 0;
}
.tt-input::placeholder {
    color: var(--tt-text-muted);
}
.tt-input:focus {
    border-color: var(--tt-accent);
    box-shadow: 0 0 0 3px var(--tt-accent-soft), 0 0 20px rgba(139, 92, 246, 0.08);
}

#tt-teacher-id {
    flex: 0 0 160px;
    height: 40px;
}
#tt-viz-search {
    flex: 1;
    height: 40px;
    margin-bottom: 0 !important;
}
#tt-load-btn {
    flex-shrink: 0;
}

.tt-btn-primary {
    background: linear-gradient(135deg, var(--tt-accent), #6d28d9);
    color: #fff;
    border: 1px solid rgba(139, 92, 246, 0.5);
    white-space: nowrap;
    padding: 10px 20px;
    border-radius: var(--tt-radius-sm);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(139, 92, 246, 0.3);
    letter-spacing: 0.3px;
}
.tt-btn-primary:hover {
    background: linear-gradient(135deg, #9b6ef8, #7c3aed);
    box-shadow: 0 4px 24px rgba(139, 92, 246, 0.4);
    transform: translateY(-1px);
}
.tt-btn-primary:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

.tt-result-box {
    padding: 0 18px 18px;
    max-height: 500px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
}
.tt-result-box::-webkit-scrollbar { width: 6px; }
.tt-result-box::-webkit-scrollbar-track { background: transparent; }
.tt-result-box::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 3px; }
.tt-result-box::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }
.tt-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tt-viz-container {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--tt-text-primary);
    line-height: 1.4;
}
.tt-viz-container * { box-sizing: border-box; }

.tt-viz-tabs {
    display: flex;
    gap: 2px;
    padding: 4px 14px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--tt-border);
    flex-shrink: 0;
    overflow-x: auto;
    margin: 0 -18px 12px -18px;
    border-radius: 0 0 var(--tt-radius-md) var(--tt-radius-md);
}
.tt-viz-tab {
    background: transparent;
    border: none;
    color: var(--tt-text-muted);
    padding: 8px 14px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    border-radius: var(--tt-radius-sm);
    white-space: nowrap;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
}
.tt-viz-tab:hover { color: var(--tt-text-secondary); background: rgba(255, 255, 255, 0.03); }
.tt-viz-tab.active {
    color: var(--tt-text-primary);
    background: var(--tt-accent-soft);
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.1);
}
.tt-viz-tab.active::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 20%; right: 20%;
    height: 2px;
    background: var(--tt-accent);
    border-radius: 1px;
    box-shadow: 0 0 8px var(--tt-accent-glow);
}

.tt-viz-section { display: none; }
.tt-viz-section.active {
    display: block;
    animation: ttVizFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes ttVizFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

.tt-viz-day-group { margin-bottom: 14px; }
.tt-viz-day-header {
    font-size: 12px; font-weight: 700;
    color: var(--tt-text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
    padding: 6px 10px;
    border-radius: var(--tt-radius-sm);
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.03);
    display: flex; align-items: center; gap: 8px;
}
.tt-viz-day-header::before {
    content: '';
    display: inline-block;
    width: 6px; height: 6px;
    background: var(--tt-accent);
    border-radius: 50%;
    box-shadow: 0 0 6px var(--tt-accent-glow);
    flex-shrink: 0;
}
.tt-viz-day-header.today {
    color: #fef3c7;
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(251, 191, 36, 0.10));
    border-color: rgba(245, 158, 11, 0.3);
    box-shadow: 0 0 16px rgba(245, 158, 11, 0.12);
}
.tt-viz-day-header.today::before {
    background: #fbbf24;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
    animation: todayPulse 2s ease-in-out infinite;
}
@keyframes todayPulse {
    0%, 100% { box-shadow: 0 0 6px rgba(251, 191, 36, 0.4); }
    50% { box-shadow: 0 0 14px rgba(251, 191, 36, 0.8); }
}

.tt-viz-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
    gap: 8px;
}
.tt-viz-card {
    background: var(--tt-bg-card);
    border: 1px solid var(--tt-border);
    border-radius: var(--tt-radius-md);
    padding: 10px 12px;
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tt-viz-card:hover {
    background: var(--tt-bg-card-hover);
    border-color: rgba(139, 92, 246, 0.2);
    box-shadow: var(--tt-shadow-sm), 0 0 20px rgba(139, 92, 246, 0.08);
    transform: translateY(-1px);
}
.tt-viz-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    border-radius: 3px 0 0 3px;
}
.tt-viz-card-time {
    font-size: 11px; color: var(--tt-text-muted);
    display: flex; align-items: center; gap: 4px; margin-bottom: 4px;
    font-weight: 500;
}
.tt-viz-card-student {
    font-size: 13px; font-weight: 700; color: var(--tt-text-primary);
    margin-bottom: 4px;
    line-height: 1.3;
}
.tt-viz-card-meta {
    font-size: 10px; color: var(--tt-text-muted);
    display: flex; flex-wrap: wrap; gap: 3px; align-items: center;
}

.tt-viz-badge {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px 6px;
    border-radius: 5px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.2px;
}
.tt-viz-badge-status {
    display: flex !important;
    width: 100% !important;
    justify-content: center !important;
    text-align: center !important;
    box-sizing: border-box;
    margin-bottom: 5px;
    padding: 5px 6px !important;
    border-radius: 6px;
    font-weight: 700;
    letter-spacing: 0.3px;
    font-size: 10px;
    text-transform: uppercase;
}
.tt-viz-badge-type {
    background: var(--tt-cyan-soft);
    color: var(--tt-cyan);
}
.tt-viz-badge-mode {
    background: rgba(251, 191, 36, 0.1);
    color: #fbbf24;
}
.tt-viz-badge-stk {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
}
.tt-viz-badge-svc {
    background: rgba(236, 72, 153, 0.1);
    color: #f472b6;
}
.tt-viz-badge-creator {
    background: rgba(148, 163, 184, 0.08);
    color: var(--tt-text-muted);
    font-family: 'SF Mono', monospace;
}
.tt-viz-badge-substitute {
    background: rgba(168, 85, 247, 0.15);
    color: #c084fc;
}
.tt-viz-badge-id {
    background: rgba(0, 0, 0, 0.3);
    color: var(--tt-text-muted);
    font-family: 'SF Mono', monospace;
    font-size: 10px;
}

.tt-viz-status-success::before { background: linear-gradient(180deg, #22c55e, #16a34a); }
.tt-viz-status-success .tt-viz-badge-status {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(22, 163, 74, 0.08));
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.2);
}
.tt-viz-status-moved::before { background: linear-gradient(180deg, #f59e0b, #d97706); }
.tt-viz-status-moved .tt-viz-badge-status {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08));
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.2);
}
.tt-viz-status-removed::before,
.tt-viz-status-canceled::before,
.tt-viz-status-failed_teacher::before,
.tt-viz-status-failed_student::before {
    background: linear-gradient(180deg, #ef4444, #dc2626);
}
.tt-viz-status-removed .tt-viz-badge-status,
.tt-viz-status-canceled .tt-viz-badge-status,
.tt-viz-status-failed_teacher .tt-viz-badge-status,
.tt-viz-status-failed_student .tt-viz-badge-status {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(220, 38, 38, 0.08));
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.2);
}
.tt-viz-status-vacation::before { background: linear-gradient(180deg, #3b82f6, #2563eb); }
.tt-viz-status-vacation .tt-viz-badge-status {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(37, 99, 235, 0.08));
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.2);
}
.tt-viz-status-substitute::before { background: linear-gradient(180deg, #a855f7, #9333ea); }
.tt-viz-status-substitute .tt-viz-badge-status {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(147, 51, 234, 0.08));
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.2);
}
.tt-viz-status-no_status::before { background: linear-gradient(180deg, #f59e0b, #d97706); }
.tt-viz-status-no_status .tt-viz-badge-status {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(217, 119, 6, 0.08));
    color: #fbbf24;
    border: 1px solid rgba(245, 158, 11, 0.2);
}
.tt-viz-status-default::before { background: linear-gradient(180deg, #64748b, #475569); }
.tt-viz-status-default .tt-viz-badge-status {
    background: rgba(100, 116, 139, 0.1);
    color: var(--tt-text-secondary);
    border: 1px solid rgba(100, 116, 139, 0.15);
}

.tt-viz-status-running::before {
    background: linear-gradient(180deg, #ef4444, #dc2626);
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}
.tt-viz-status-running .tt-viz-badge-status {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.18), rgba(220, 38, 38, 0.12));
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.35);
}
.tt-viz-status-running {
    border-color: rgba(239, 68, 68, 0.4) !important;
    animation: ttPulseRunning 2.5s ease-in-out infinite;
}
@keyframes ttPulseRunning {
    0%, 100% { box-shadow: 0 0 16px rgba(239, 68, 68, 0.1); }
    50% { box-shadow: 0 0 28px rgba(239, 68, 68, 0.25); }
}

.tt-viz-comment {
    margin-top: 6px; padding-top: 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    font-size: 11px; color: var(--tt-text-muted); font-style: italic;
    line-height: 1.4;
}
.tt-viz-comment.moved-date { color: #fbbf24; font-style: normal; font-weight: 600; }
.tt-viz-empty {
    text-align: center; padding: 30px 20px;
    color: var(--tt-text-muted); font-size: 13px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: var(--tt-radius-md);
    border: 1px dashed rgba(255, 255, 255, 0.06);
}

.tt-viz-slot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 6px;
}
.tt-viz-slot {
    background: var(--tt-bg-card);
    border: 1px solid var(--tt-border);
    border-radius: var(--tt-radius-sm);
    padding: 8px 10px;
    font-size: 12px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.tt-viz-slot:hover {
    border-color: rgba(139, 92, 246, 0.2);
    background: var(--tt-bg-card-hover);
}
.tt-viz-slot-time {
    font-weight: 700; color: var(--tt-text-primary); margin-bottom: 3px; font-size: 12px;
}
.tt-viz-slot-types { display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px; }
.tt-viz-slot-type {
    font-size: 9px; padding: 2px 5px; border-radius: 4px;
    background: var(--tt-cyan-soft); color: var(--tt-cyan);
    text-transform: uppercase; font-weight: 700;
    letter-spacing: 0.2px;
}
.tt-viz-slot-type.blocked {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
}

.tt-viz-search {
    width: 100%; padding: 5px 12px; border-radius: var(--tt-radius-sm);
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(0, 0, 0, 0.25);
    color: var(--tt-text-primary);
    font-size: 12px; outline: none;
    font-family: 'Inter', sans-serif;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.tt-viz-search:focus {
    border-color: var(--tt-accent);
    box-shadow: 0 0 0 3px var(--tt-accent-soft);
}
</style>

<div class="tt-container">
    <div class="tt-header chmaf-drag-handle" id="timetable_header">
        <span class="tt-title">Расписание <span style="font-size:13px;font-weight:700;color:#c7d2fe;" id="inputTeachInfo"></span></span>
        <button class="tt-btn" id="hideshowtimetable" title="Скрыть">&#10005;</button>
    </div>

    <div class="tt-input-group">
        <div class="tt-week-nav">
            <button class="tt-arrow" id="tt-prev-week" title="Предыдущая неделя">&lt;</button>
            <div class="tt-dates-row">
                <span id="tt-date-from" class="tt-date-field">загрузка...</span>
                <span class="tt-date-sep">&#8594;</span>
                <span id="tt-date-to" class="tt-date-field">загрузка...</span>
            </div>
            <button class="tt-arrow" id="tt-next-week" title="Следующая неделя">&gt;</button>
        </div>
        <div class="tt-input-row">
            <input id="tt-teacher-id" class="tt-input" placeholder="ID преподавателя..." autocomplete="off" type="text">
            <input type="text" class="tt-input tt-viz-search" id="tt-viz-search" placeholder="Поиск по ID студента, группы или статусу...">
            <button class="tt-btn-primary" id="tt-load-btn" title="Загрузить расписание">
                <span>Загрузить</span>
            </button>
        </div>
    </div>

    <div class="tt-result-box">
        <div id="tt-result-table" class="tt-list"></div>
    </div>
</div>`;

const wintTimetableUI = createWindow('AF_TimetableUI', 'winTopTimetable', 'winLeftTimetable', win_TimetableUI);
hideWindowOnClick('AF_TimetableUI', 'hideshowtimetable');

let ttCurrentWeekOffset = 0;

function getWeekDates(offset = 0) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + (offset * 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const pad = (n) => String(n).padStart(2, '0');
    const fmtVisual = (d) => `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;

    const mskOffset = -180;
    const mondayUTC = new Date(monday.getTime() + mskOffset * 60000);
    const sundayUTC = new Date(sunday.getTime() + mskOffset * 60000);

    const apiFrom = new Date(mondayUTC.getTime() - 3 * 60 * 60 * 1000);
    const apiTo = new Date(sundayUTC.getTime() + 1 * 60 * 60 * 1000 + 1 * 60 * 1000);

    const fmtAPI = (d) => {
        return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+00:00`;
    };

    return {
        visualFrom: fmtVisual(monday),
        visualTo: fmtVisual(sunday),
        apiFrom: fmtAPI(apiFrom),
        apiTo: fmtAPI(apiTo)
    };
}

function updateWeekDisplay() {
    const dates = getWeekDates(ttCurrentWeekOffset);
    document.getElementById('tt-date-from').textContent = dates.visualFrom;
    document.getElementById('tt-date-to').textContent = dates.visualTo;
}

document.getElementById('tt-prev-week').addEventListener('click', () => {
    ttCurrentWeekOffset--;
    updateWeekDisplay();
    autoReloadIfHasData();
});

document.getElementById('tt-next-week').addEventListener('click', () => {
    ttCurrentWeekOffset++;
    updateWeekDisplay();
    autoReloadIfHasData();
});

function autoReloadIfHasData() {
    const teacherIdRaw = document.getElementById('tt-teacher-id').value.trim();
    const resultBox = document.getElementById('tt-result-table');
    const hasData = resultBox.innerHTML.trim() !== '' &&
        !resultBox.innerHTML.includes('Загрузка') &&
        !resultBox.innerHTML.includes('загрузка...');

    if (teacherIdRaw && !isNaN(teacherIdRaw) && hasData) {
        document.getElementById('tt-load-btn').click();
    }
}

document.getElementById('tt-load-btn').addEventListener('click', () => {
    const teacherIdRaw = document.getElementById('tt-teacher-id').value.trim();
    const dates = getWeekDates(ttCurrentWeekOffset);

    if (!teacherIdRaw || isNaN(teacherIdRaw)) {
        alert('Введите корректный ID преподавателя (число)');
        return;
    }

    const teacherId = parseInt(teacherIdRaw, 10);
    document.getElementById('tt-result-table').innerHTML = '<div style="padding:24px;text-align:center;color:var(--tt-text-muted);font-size:13px;font-weight:500;">Загрузка...</div>';

    chrome.runtime.sendMessage({
        action: 'getFetchRequest',
        fetchURL: 'https://timetable.skyeng.ru/api/v3/teacher/search',
        requestOptions: {
            headers: {
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'ru,en;q=0.9',
                'content-type': 'application/json; charset=UTF-8',
                'priority': 'u=1, i',
                'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "YaBrowser";v="26.3", "Yowser";v="2.5", "YaBrowserCorp";v="144"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'sec-gpc': '1'
            },
            referrer: 'https://timetable.skyeng.ru/',
            body: JSON.stringify({
                timetableFrom: dates.apiFrom,
                timetableTo: dates.apiTo,
                serviceTypeKey: null,
                timeRanges: [],
                expressions: [],
                teacherIds: [teacherId],
                isComplexSearch: false,
                intensity: null,
                customFilters: { includeTeachersWhoClosedSpecificSlots: false },
                page: 1,
                pageSize: 15,
                orderByProperty: 'by_rating_small_package'
            }),
            method: 'POST',
            credentials: 'include'
        }
    }, (response) => {
        if (chrome.runtime.lastError) {
            document.getElementById('tt-result-table').innerHTML = '<div style="padding:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:10px;color:#f87171;font-size:12px;">Ошибка связи: ' + chrome.runtime.lastError.message + '</div>';
            return;
        }

        if (response && response.success) {
            let data;
            try {
                data = JSON.parse(response.fetchansver);
            } catch (e) {
                data = response.fetchansver;
            }
            renderTimetable(data, teacherId);
        } else {
            const errMsg = response?.error || 'Неизвестная ошибка';
            document.getElementById('tt-result-table').innerHTML = '<div style="padding:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:10px;color:#f87171;font-size:12px;">Ошибка: ' + errMsg + '</div>';
        }
    });
});

function renderTimetable(rawData, teacherId) {
    let data = rawData;
    if (Array.isArray(data) && data[0]?.result?.[0]) {
        data = data[0].result[0];
    } else if (data?.result?.[0]) {
        data = data.result[0];
    }

    const container = document.getElementById('tt-result-table');
    if (!container) return;

    const MSK_OFFSET = 3 * 60 * 60 * 1000;
    const pad = (n) => String(n).padStart(2, '0');

    const toMSK = (iso) => {
        if (!iso) return null;
        const d = new Date(new Date(iso).getTime() + MSK_OFFSET);
        return isNaN(d.getTime()) ? null : d;
    };
    const fmtDate = (iso) => {
        const d = toMSK(iso);
        if (!d) return '-';
        return `${pad(d.getUTCDate())}-${pad(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}`;
    };
    const fmtTime = (iso) => {
        const d = toMSK(iso);
        if (!d) return '-';
        return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} МСК`;
    };
    const getDayName = (iso) => {
        const d = toMSK(iso);
        if (!d) return '';
        return d.toLocaleDateString('ru-RU', { weekday: 'long', timeZone: 'UTC' });
    };
    const getDateKey = (iso) => {
        const d = toMSK(iso);
        if (!d) return 'unknown';
        return d.toISOString().slice(0, 10);
    };

    // Парсит T-формат: T109:00:00+0000 → {dayIndex: 0-6 (Пн-Вс), timeStr: 'Пт 16:00 МСК'}
    const parseT = (t) => {
        const m = t.match(/T(\d+):(\d+):/);
        if (!m) return { dayIndex: -1, timeStr: t };
        const hours = parseInt(m[1]);
        const day = Math.floor(hours / 24);      // 0=Пн, 1=Вт...
        const hr = hours % 24;
        const mskHr = (hr + 3) % 24;
        const mskDay = (day + Math.floor((hr + 3) / 24)) % 7;
        const shortDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        return { dayIndex: mskDay, timeStr: `${shortDays[mskDay] || '?'} ${pad(mskHr)}:${m[2]} МСК` };
    };

    const getStatusInfo = (cls) => {
        const now = new Date();
        const start = cls.startAt ? new Date(cls.startAt) : null;
        const end = cls.endAt ? new Date(cls.endAt) : null;
        const isRunning = start && end && now >= start && now <= end;
        const isPast = end && now > end;
        const isTemplate = !cls.createdByUserId;

        if (isRunning) return { key: 'running', label: 'Идёт урок', color: 'running' };
        if (cls.isVacation) return { key: 'vacation', label: 'Отпуск', color: 'vacation' };

        const status = cls.classStatus?.status;

        if (status === 'success') return { key: 'success', label: 'Прошёл', color: 'success' };
        if (status === 'moved') return { key: 'moved', label: 'Перенесён', color: 'moved' };
        if (status === 'canceled_by_student' || status === 'cancelled')
            return { key: 'canceled', label: 'Отменён студентом', color: 'canceled' };
        if (status === 'failed_by_teacher')
            return { key: 'failed_teacher', label: 'Пропущен учителем', color: 'failed_teacher' };
        if (status === 'failed_by_student')
            return { key: 'failed_student', label: 'Пропущен учеником', color: 'failed_student' };
        if (status === 'canceled_not_paid')
            return { key: 'canceled', label: 'Отменен 0 баланс', color: 'failed_student' };
        if (cls.removedAt && !cls.classStatus)
            return { key: 'removed', label: 'Отменён', color: 'removed' };
        if (cls.isSubstituteTeacher || (cls.classProperties || []).some(p => p.propertyId === 'is_substitute_teacher'))
            return { key: 'substitute', label: 'Замена', color: 'substitute' };
        if (isTemplate) return { key: 'default', label: 'Запланировано', color: 'default' };
        if (isPast && !status) return { key: 'no_status', label: 'Нет статуса', color: 'no_status' };

        return { key: 'default', label: 'Запланировано', color: 'default' };
    };

    const fmtSTK = (stk) => {
        const map = {
            'english_adult_not_native_speaker_premium': 'English Adult Premium',
            'english_adult_not_native_speaker': 'English Adult',
            'english_adult_native_speaker': 'English Native',
            'english_kids': 'English Kids',
            'math': 'Math',
            'programming': 'Programming',
        };
        return map[stk] || (stk ? stk.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : '');
    };

    const fmtMode = (mode) => {
        if (mode === 'one-to-one') return '1:1';
        if (mode === 'group') return 'Группа';
        return mode || '-';
    };

    const teacherName = data.user?.name || '';
    const teacherSurname = data.user?.surname || '';
    const allClasses = [...(data.classes || []), ...(data.futureSingleClasses || [])];

    let html = `<div class="tt-viz-container">`;

    // Табы
    html += `<div class="tt-viz-tabs">
        <button class="tt-viz-tab active" data-tab="classes">Занятия (${allClasses.length})</button>
        <button class="tt-viz-tab" data-tab="slots">Слоты (${(data.singleSlots || []).length + (data.regularSlots || []).length})</button>
        <button class="tt-viz-tab" data-tab="regular">Регулярное (${(data.classesRegular || []).length})</button>
    </div>`;

    // === Секция Занятия ===
    html += `<div class="tt-viz-section active" id="tt-viz-classes">`;
    if (allClasses.length === 0) {
        html += `<div class="tt-viz-empty">Нет данных о занятиях</div>`;
    } else {
        html += `<div id="tt-viz-classes-grid"></div>`;
    }
    html += `</div>`;

    // === Секция Слоты ===
    html += `<div class="tt-viz-section" id="tt-viz-slots">`;
    const single = data.singleSlots || [];
    const regular = data.regularSlots || [];

    if (single.length === 0 && regular.length === 0) {
        html += `<div class="tt-viz-empty">Нет данных о слотах</div>`;
    } else {
        if (single.length) {
            const slotGroups = {};
            single.forEach(s => {
                const key = getDateKey(s.startAt);
                if (!slotGroups[key]) slotGroups[key] = [];
                slotGroups[key].push(s);
            });
            html += `<div style="margin-bottom:12px"><div class="tt-viz-day-header">Разовые слоты</div>`;
            Object.keys(slotGroups).sort().forEach(key => {
                const items = slotGroups[key].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
                html += `<div style="margin-bottom:8px"><div style="font-size:10px;color:#64748b;margin-bottom:4px;font-weight:600">${fmtDate(items[0].startAt)}</div><div class="tt-viz-slot-grid">`;
                items.forEach(s => {
                    html += `<div class="tt-viz-slot">
                        <div class="tt-viz-slot-time">${fmtTime(s.startAt)} – ${fmtTime(s.endAt)}</div>
                        <div class="tt-viz-slot-types">${(s.types || []).map(t => `<span class="tt-viz-slot-type${t.includes('no_new') ? ' blocked' : ''}">${t}</span>`).join('')}</div>
                    </div>`;
                });
                html += `</div></div>`;
            });
            html += `</div>`;
        }

        if (regular.length) {
            const dayOrder = [0, 1, 2, 3, 4, 5, 6];
            const dayNamesFull = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
            const regByDay = {};
            regular.forEach(s => {
                const st = parseT(s.startAt);
                if (st.dayIndex < 0) return;
                if (!regByDay[st.dayIndex]) regByDay[st.dayIndex] = [];
                regByDay[st.dayIndex].push(s);
            });
            html += `<div style="margin-bottom:12px"><div class="tt-viz-day-header">Регулярные слоты (шаблон)</div>`;
            dayOrder.forEach(dIdx => {
                if (!regByDay[dIdx]) return;
                html += `<div style="margin-bottom:8px"><div style="font-size:10px;color:#64748b;margin-bottom:4px;font-weight:600">${dayNamesFull[dIdx]}</div><div class="tt-viz-slot-grid">`;
                regByDay[dIdx].forEach(s => {
                    const st = parseT(s.startAt);
                    const et = parseT(s.endAt);
                    html += `<div class="tt-viz-slot">
                        <div class="tt-viz-slot-time">${st.timeStr} – ${et.timeStr}</div>
                        <div class="tt-viz-slot-types">${(s.types || []).map(t => `<span class="tt-viz-slot-type${t.includes('no_new') ? ' blocked' : ''}">${t}</span>`).join('')}</div>
                    </div>`;
                });
                html += `</div></div>`;
            });
            html += `</div>`;
        }
    }
    html += `</div>`;

    // === Секция Регулярное ===
    html += `<div class="tt-viz-section" id="tt-viz-regular">`;
    const regClasses = data.classesRegular || [];
    if (regClasses.length === 0) {
        html += `<div class="tt-viz-empty">Нет регулярных занятий</div>`;
    } else {
        const dayOrder = [0, 1, 2, 3, 4, 5, 6];
        const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        const byDay = {};
        regClasses.forEach(r => {
            const s = parseT(r.startAt);
            if (s.dayIndex < 0) return;
            if (!byDay[s.dayIndex]) byDay[s.dayIndex] = [];
            byDay[s.dayIndex].push(r);
        });
        dayOrder.forEach(dIdx => {
            if (!byDay[dIdx]) return;
            html += `<div class="tt-viz-day-group"><div class="tt-viz-day-header">${dayNames[dIdx]}</div><div class="tt-viz-grid">`;
            byDay[dIdx].forEach(r => {
                const s = parseT(r.startAt);
                const e = parseT(r.endAt);
                const student = r.groupId
                    ? `${r.group?.name || 'Группа'} <span style="color:#22d3ee;font-size:11px;font-weight:700">(Group ID:${r.groupId})</span>`
                    : `Student ${r.studentId ? `<span style="color:#22d3ee;font-size:11px;font-weight:700">(ID:${r.studentId})</span>` : ''}`;
                html += `<div class="tt-viz-card tt-viz-status-default">
                    <div class="tt-viz-card-student">${student}</div>
                    <div class="tt-viz-card-meta">
                        ${!r.groupId && r.educationServiceId ? `<span class="tt-viz-badge tt-viz-badge-svc">ID услуги: ${r.educationServiceId}</span>` : ''}
                    </div>
                    <div class="tt-viz-card-time" style="margin-top:4px">${s.timeStr} – ${e.timeStr}</div>
                    <div style="font-size:10px;color:#64748b;margin-top:3px">С ${fmtDate(r.firstExemplarOn)}</div>
                </div>`;
            });
            html += `</div></div>`;
        });
    }
    html += `</div></div>`;

    container.innerHTML = html;

    // Заголовок
    const teachInfoEl = document.getElementById('inputTeachInfo');
    if (teachInfoEl) {
        teachInfoEl.textContent = `${teacherName} ${teacherSurname} · ID: ${teacherId}`;
    }

    // Табы — обработчики
    container.querySelectorAll('.tt-viz-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            container.querySelectorAll('.tt-viz-tab').forEach(t => t.classList.remove('active'));
            container.querySelectorAll('.tt-viz-section').forEach(s => s.classList.remove('active'));
            tab.classList.add('active');
            const sec = container.querySelector('#tt-viz-' + tab.dataset.tab);
            if (sec) sec.classList.add('active');
        });
    });

    // Рендер занятий с поиском
    if (allClasses.length) {
        renderClassesGrid(allClasses, container, fmtDate, fmtTime, getDayName, getDateKey, getStatusInfo, fmtSTK, fmtMode, pad);
    }
}

function renderClassesGrid(allClasses, container, fmtDate, fmtTime, getDayName, getDateKey, getStatusInfo, fmtSTK, fmtMode, pad) {
    const grid = container.querySelector('#tt-viz-classes-grid');
    const search = document.getElementById('tt-viz-search');
    if (!grid) return;

    const render = (filter = '') => {
        let html = '';
        const filtered = allClasses.filter(c => {
            const student = c.group?.name
                ? `Group ${c.group.name}`
                : c.student?.user?.name || c.student?.user?.surname || `Student ${c.studentId || c.student?.user?.id || ''}`;
            const status = getStatusInfo(c).label;
            const str = `${student} ${status} ${c.id || ''} ${c.type || ''} ${c.serviceTypeKey || ''} ${c.educationServiceId || ''} ${c.groupId || ''} ${c.studentId || ''}`.toLowerCase();
            return str.includes(filter.toLowerCase());
        });

        const groups = {};
        filtered.forEach(c => {
            const key = getDateKey(c.startAt);
            if (!groups[key]) groups[key] = [];
            groups[key].push(c);
        });
        const sortedKeys = Object.keys(groups).sort();
        const todayKey = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);

        if (sortedKeys.length === 0) {
            grid.innerHTML = '<div class="tt-viz-empty">Ничего не найдено</div>';
            return;
        }

        sortedKeys.forEach(key => {
            const first = groups[key][0];
            const isToday = key === todayKey;
            html += `<div class="tt-viz-day-group">
                <div class="tt-viz-day-header ${isToday ? 'today' : ''}">${fmtDate(first.startAt)} — ${getDayName(first.startAt)}${isToday ? ' ⭐ СЕГОДНЯ' : ''}</div>
                <div class="tt-viz-grid">`;

            groups[key].sort((a, b) => new Date(a.startAt) - new Date(b.startAt)).forEach(c => {
                const info = getStatusInfo(c);
                const studentName = c.group?.name
                    ? `${c.group.name}`
                    : c.student?.user
                        ? `${c.student?.user?.name}`
                        : 'Student';
                const studentId = c.groupId || c.studentId || c.student?.user?.id || '';
                const time = fmtTime(c.startAt) + ' – ' + fmtTime(c.endAt);
                const typeLabel = c.type === 'regular' ? 'Регулярное' : c.type === 'single' ? 'Разовое' : (c.type || '-');
                const isSub = c.isSubstituteTeacher || (c.classProperties || []).some(p => p.propertyId === 'is_substitute_teacher');
                const stk = fmtSTK(c.serviceTypeKey);
                const mode = fmtMode(c.mode);
                const svcId = c.educationServiceId || '';
                const creatorId = c.createdByUserId || '';
                const statusDate = c.classStatus?.createdAt
                    ? `<div class="tt-viz-comment moved-date">${c.classStatus.status === 'moved' ? 'Перенесено' : 'Статус изменён'}: ${fmtDate(c.classStatus.createdAt)} ${fmtTime(c.classStatus.createdAt)}</div>`
                    : '';

                const idHtml = studentId
                    ? (c.groupId
                        ? ` <span style="color:#22d3ee;font-size:11px;font-weight:700">(Group ID:${studentId})</span>`
                        : ` <span style="color:#22d3ee;font-size:11px;font-weight:700">(ID:${studentId})</span>`)
                    : '';

                html += `<div class="tt-viz-card tt-viz-status-${info.color}">
    <span class="tt-viz-badge tt-viz-badge-status">${info.label}</span>
    <div class="tt-viz-card-time">${time}</div>
    <div class="tt-viz-card-student">${studentName}${idHtml}</div>
    <div class="tt-viz-card-meta">
        <span class="tt-viz-badge tt-viz-badge-type">${typeLabel}</span>
        <span class="tt-viz-badge tt-viz-badge-mode">${mode}</span>
        ${stk ? `<span class="tt-viz-badge tt-viz-badge-stk">${stk}</span>` : ''}
        ${svcId && !c.groupId ? `<span class="tt-viz-badge tt-viz-badge-svc">ID услуги: ${svcId}</span>` : ''}
        ${creatorId ? `<span class="tt-viz-badge tt-viz-badge-creator">Создатель: ${creatorId}</span>` : ''}
        ${isSub ? `<span class="tt-viz-badge tt-viz-badge-substitute">Замена</span>` : ''}
    </div>
    ${c.classStatus?.comment ? `<div class="tt-viz-comment">${c.classStatus.comment}</div>` : ''}
    ${statusDate}
    ${c.removedAt && c.classStatus?.status !== 'moved' ? `<div class="tt-viz-comment" style="color:#f87171">Удалено: ${fmtDate(c.removedAt)} ${fmtTime(c.removedAt)}</div>` : ''}
</div>`;
            });

            html += '</div></div>';
        });

        grid.innerHTML = html;
    };

    render();

    setTimeout(() => {
        const todayHeader = grid.closest('.tt-viz-container')?.querySelector('.tt-viz-day-header.today');
        if (todayHeader) {
            todayHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);

    if (search) {
        search.addEventListener('input', (e) => render(e.target.value));
    }
}

updateWeekDisplay();

function getbutTimetableButtonPress() {
    const win = document.getElementById('AF_TimetableUI');
    if (!win) return;
    if (win.style.display === 'none' || win.style.display === '') {
        win.style.display = 'block';
        requestAnimationFrame(() => updateWeekDisplay());
    } else {
        win.style.display = 'none';
    }
}