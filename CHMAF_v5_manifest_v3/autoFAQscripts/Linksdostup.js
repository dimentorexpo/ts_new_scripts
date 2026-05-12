// ==========================================
// 1. NEON GLASS ULTRA — CSS Injection ( hardened )
// ==========================================
const afLxStyle = document.createElement('style');
afLxStyle.id = 'af-lx-neon-styles-v2';
afLxStyle.textContent = `
    /* --- Shell --- */
    #AF_Linksd .aflx-shell {
        display: flex !important;
        width: 420px !important;
        min-width: 420px !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'SF Mono', monospace !important;
        color: #e2e2f0 !important;
        background: rgba(10, 11, 20, 0.9) !important;
        backdrop-filter: blur(20px) saturate(1.3) !important;
        -webkit-backdrop-filter: blur(20px) saturate(1.3) !important;
        border: 1px solid rgba(255,255,255,0.07) !important;
        border-radius: 14px !important;
        box-shadow: 0 20px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04) !important;
        overflow: hidden !important;
        position: relative !important;
    }
    #AF_Linksd .aflx-shell::before {
        content: '' !important;
        position: absolute !important;
        top: 0; left: 0; right: 0;
        height: 2px !important;
        background: linear-gradient(90deg, transparent, #F6358A, #00f0ff, transparent) !important;
        z-index: 2 !important;
        pointer-events: none !important;
    }

    #AF_Linksd .aflx-shell-inner {
        display: block !important;
        width: 100% !important;
    }

    #AF_Linksd .aflx-grab {
        display: block !important;
        cursor: -webkit-grab !important;
        cursor: grab !important;
    }

    /* --- Header --- */
    #AF_Linksd #linksd_1str {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        margin: 0 !important;
        padding: 12px 16px !important;
        width: 100% !important;
        background: rgba(255,255,255,0.02) !important;
        border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        box-sizing: border-box !important;
    }

    #AF_Linksd .aflx-drag-title {
        font-family: 'SF Mono', 'Consolas', monospace !important;
        font-size: 10px !important;
        font-weight: 700 !important;
        letter-spacing: 0.14em !important;
        text-transform: uppercase !important;
        color: #7a7a9e !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin: 0 !important;
        pointer-events: none !important;
    }
    #AF_Linksd .aflx-drag-title::before {
        content: '' !important;
        width: 6px !important; height: 6px !important;
        border-radius: 50% !important;
        background: #F6358A !important;
        box-shadow: 0 0 10px #F6358A !important;
        animation: aflx-pulse 2.2s ease-in-out infinite !important;
    }
    @keyframes aflx-pulse {
        0%,100% { opacity: 1; box-shadow: 0 0 10px #F6358A; }
        50% { opacity: 0.5; box-shadow: 0 0 2px #F6358A; }
    }

    /* --- Hide Button --- */
    #AF_Linksd #hideMeLinksd {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 28px !important; height: 28px !important;
        padding: 0 !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 6px !important;
        background: rgba(255,255,255,0.03) !important;
        color: #8b8b9e !important;
        font-size: 9px !important;
        font-weight: 700 !important;
        font-family: 'SF Mono', monospace !important;
        letter-spacing: 0.06em !important;
        text-transform: uppercase !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        margin: 0 !important;
    }
    #AF_Linksd #hideMeLinksd:hover {
        color: #F6358A !important;
        border-color: rgba(246,53,138,0.4) !important;
        background: rgba(246,53,138,0.08) !important;
        box-shadow: 0 0 14px rgba(246,53,138,0.25) !important;
        transform: translateY(-1px) !important;
    }

    /* --- Body --- */
    #AF_Linksd #linksd_kib_box {
        margin: 0 !important;
        padding: 18px !important;
        width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 14px !important;
        box-sizing: border-box !important;
    }

    /* --- Section Labels --- */
    #AF_Linksd .aflx-section {
        position: relative !important;
        text-align: center !important;
        font-family: 'SF Mono', 'Consolas', monospace !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        letter-spacing: 0.12em !important;
        text-transform: uppercase !important;
        color: #F6358A !important;
        text-shadow: 0 0 18px rgba(246,53,138,0.45) !important;
        margin: 0 auto !important;
        padding: 0 16px !important;
        width: fit-content !important;
    }
    #AF_Linksd .aflx-section::before,
    #AF_Linksd .aflx-section::after {
        content: '' !important;
        position: absolute !important;
        top: 50% !important;
        width: 28px !important;
        height: 1px !important;
    }
    #AF_Linksd .aflx-section::before {
        right: 100% !important;
        background: linear-gradient(90deg, transparent, rgba(246,53,138,0.6)) !important;
    }
    #AF_Linksd .aflx-section::after {
        left: 100% !important;
        background: linear-gradient(90deg, rgba(246,53,138,0.6), transparent) !important;
    }
    #AF_Linksd .aflx-section-cyan {
        color: #00f0ff !important;
        text-shadow: 0 0 18px rgba(0,240,255,0.4) !important;
    }
    #AF_Linksd .aflx-section-cyan::before { background: linear-gradient(90deg, transparent, rgba(0,240,255,0.5)) !important; }
    #AF_Linksd .aflx-section-cyan::after  { background: linear-gradient(90deg, rgba(0,240,255,0.5), transparent) !important; }

    /* --- Search Row --- */
    #AF_Linksd .aflx-search-row {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin-top: 2px !important;
    }
    #AF_Linksd #WidgetLessonStatus {
        width: 110px !important;
        height: 34px !important;
        padding: 0 10px !important;
        background: rgba(8,9,16,0.9) !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
        border-radius: 8px !important;
        color: #f0f0f5 !important;
        font-family: 'SF Mono', monospace !important;
        font-size: 12px !important;
        text-align: center !important;
        outline: none !important;
        transition: all 0.2s ease !important;
        margin: 0 !important;
        box-sizing: border-box !important;
    }
    #AF_Linksd #WidgetLessonStatus::placeholder { color: #5a5a6e !important; }
    #AF_Linksd #WidgetLessonStatus:focus {
        border-color: rgba(0,240,255,0.5) !important;
        box-shadow: 0 0 12px rgba(0,240,255,0.15), inset 0 1px 2px rgba(0,0,0,0.3) !important;
    }

    #AF_Linksd #GetWidgetLessonStatus {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        width: 34px !important; height: 34px !important;
        padding: 0 !important;
        border: 1px solid rgba(0,240,255,0.2) !important;
        border-radius: 8px !important;
        background: rgba(0,240,255,0.06) !important;
        color: #00f0ff !important;
        font-size: 14px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        flex-shrink: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
    }
    #AF_Linksd #GetWidgetLessonStatus:hover {
        background: rgba(0,240,255,0.14) !important;
        border-color: rgba(0,240,255,0.5) !important;
        box-shadow: 0 0 14px rgba(0,240,255,0.25) !important;
        transform: scale(1.06) !important;
    }

    /* --- Grid --- */
    #AF_Linksd .aflx-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 8px !important;
    }
    #AF_Linksd .aflx-grid-full { grid-column: 1 / -1 !important; }

    /* --- Action Buttons --- */
    #AF_Linksd .aflx-btn-glass {
        position: relative !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 36px !important;
        padding: 0 10px !important;
        background: rgba(255,255,255,0.03) !important;
        border: 1px solid rgba(255,255,255,0.06) !important;
        border-radius: 8px !important;
        color: #d8d8e8 !important;
        font-size: 12px !important;
        font-weight: 500 !important;
        font-family: inherit !important;
        letter-spacing: 0.01em !important;
        cursor: pointer !important;
        overflow: hidden !important;
        transition: all 0.25s cubic-bezier(0.4,0,0.2,1) !important;
        white-space: nowrap !important;
        text-decoration: none !important;
        line-height: 1 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
    }
    #AF_Linksd .aflx-btn-glass::before {
        content: '' !important;
        position: absolute !important;
        inset: 0 !important;
        background: linear-gradient(135deg, rgba(246,53,138,0.1), rgba(0,240,255,0.05)) !important;
        opacity: 0 !important;
        transition: opacity 0.25s ease !important;
        pointer-events: none !important;
    }
    #AF_Linksd .aflx-btn-glass::after {
        content: '' !important;
        position: absolute !important;
        bottom: 0 !important;
        left: 12% !important; right: 12% !important;
        height: 1px !important;
        background: linear-gradient(90deg, transparent, rgba(246,53,138,0.5), transparent) !important;
        opacity: 0 !important;
        transition: opacity 0.25s ease !important;
        filter: blur(0.5px) !important;
        pointer-events: none !important;
    }
    #AF_Linksd .aflx-btn-glass:hover {
        border-color: rgba(246,53,138,0.35) !important;
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 20px rgba(246,53,138,0.15) !important;
    }
    #AF_Linksd .aflx-btn-glass:hover::before,
    #AF_Linksd .aflx-btn-glass:hover::after { opacity: 1 !important; }
    #AF_Linksd .aflx-btn-glass:active { transform: translateY(0) !important; transition-duration: 0.08s !important; }

    #AF_Linksd .aflx-btn-glass-cyan:hover {
        border-color: rgba(0,240,255,0.35) !important;
        box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 20px rgba(0,240,255,0.15) !important;
    }
    #AF_Linksd .aflx-btn-glass-cyan::after {
        background: linear-gradient(90deg, transparent, rgba(0,240,255,0.5), transparent) !important;
    }

    /* --- Divider --- */
    #AF_Linksd .aflx-divider {
        height: 1px !important;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent) !important;
        margin: 2px 0 !important;
        border: none !important;
    }
`;
document.head.appendChild(afLxStyle);


// ==========================================
// 2. Window Template (структура сохранена)
// ==========================================
var win_linksd = `
<div class="aflx-shell">
    <span class="aflx-shell-inner">
        <span class="aflx-grab chmaf-drag-handle">
            <div id="linksd_1str">
                <button class="aflx-btn-hide" title="Скрывает меню" id="hideMeLinksd">Hide</button>
            </div>
            <div id="linksd_kib_box">
                <div class="aflx-section">Grafana</div>

                <div class="aflx-search-row">
                    <input id="WidgetLessonStatus" placeholder="ID У/П" title="Вводим id пользователя для открытия информации об отображении виджета входа на урок" autocomplete="off" type="text">
                    <button class="aflx-btn-search" id="GetWidgetLessonStatus" title="Найти">🔎</button>
                </div>

                <div class="aflx-grid">
                    <button class="aflx-btn-glass" id="grafanalnk" title="Открывает Графану с состоянием видеосерверов, при наплыве обращений проверяйте его">Видео сервера</button>
                    <button class="aflx-btn-glass" id="grafanapoolCRM2" title="Открывает Графану с отображением пула задач на группе Техподдержка Исход CRM2">Пул исход CRM2</button>
                    <button class="aflx-btn-glass" id="grafanadeystviyauroki" title="Открывает Графану с просмотром действий над разовыми и регулярными уроками, кто когда отменял, удалял, добавлял">Действия уроками</button>
                    <button class="aflx-btn-glass" id="grafanazaprosperenos" title="Открывает Графану с просмотром действий с запросами на перенос урока, были ли они, если да то отклонены или приняты или еще активны">Запрос на перенос</button>
                    <button class="aflx-btn-glass" id="grafanopencloseslots" title="Открывает Графану с просмотром действий по открытию или закрытию разовых или регулярных слотов у П">Откр/закр слот</button>
                    <button class="aflx-btn-glass" id="grafanablocks" title="Открывает Графану с просмотром действий по просмотру блокировок у пользователя">Блокировки</button>
                </div>

                <div class="aflx-divider"></div>

                <div class="aflx-section aflx-section-cyan">Datalens Dashboard</div>
                <div class="aflx-grid">
                    <button class="aflx-btn-glass aflx-btn-glass-cyan aflx-grid-full" id="lkmpdashboard" title="Открывает Datalens для просмотра информации по действия пользователя в ЛК/МП">Действия П/У ЛК/МП</button>
                </div>
            </div>
        </span>
    </span>
</div>`;


// ==========================================
// 3. Window Init (Original API)
// ==========================================
const wintLinksd = createWindow('AF_Linksd', 'winTopLinksd', 'winLeftLinksd', win_linksd);
hideWindowOnDoubleClick('AF_Linksd');
hideWindowOnClick('AF_Linksd', 'hideMeLinksd');


// ==========================================
// 4. Toggle Visibility
// ==========================================
document.getElementById('addsrc').onclick = function () {
    const win = document.getElementById('AF_Linksd');
    if (!win) return;
    win.style.display = (win.style.display === '') ? 'none' : '';
};


// ==========================================
// 5. Grafana Links — DRY
// ==========================================
const AF_LX_GRAFANA = {
    grafanalnk: 'https://grafana.skyeng.link/d/NZkMHsVMk/video-servers-health-check?orgId=1&refresh=1m',
    grafanapoolCRM2: 'https://grafana.skyeng.link/d/fzN-fk5Gk/task-dashboard?orgId=1&var-task_id=null&var-task_status=waiting&var-task_status=assigned&var-task_status=processing&var-operator_group_id=All&var-operator_id=All&var-task_operator_group_id=207',
    grafanadeystviyauroki: 'https://grafana.skyeng.link/d/f744d199-99db-4d86-98b3-a91edbdc273c/dejstvija-nad-urokami?orgId=1&var-student_id=&var-teacher_id=19886047&var-group_id=&from=now-2d&to=now',
    grafanazaprosperenos: 'https://grafana.skyeng.link/d/aey5ciha9s35sb/zapros-na-perenos-uroka?orgId=1&var-teacher_id=&from=now-2d&to=now',
    grafanopencloseslots: 'https://grafana.skyeng.link/d/e457e17f-729c-499d-bd38-b68dc32ef599/logi-otkrytija-zakrytija-slotov-p?orgId=1&from=now-2d&to=now',
    grafanablocks: 'https://grafana.skyeng.link/d/dd4c2d01-65ec-493b-9089-15591c91aea2/blokirovki-uslug?orgId=1&var-reason_type=All&var-education_service_kit_id=&var-education_service_id=&var-owner_id=42397377&from=now-2d&to=now'
};

Object.entries(AF_LX_GRAFANA).forEach(([id, url]) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => window.open(url));
});


// ==========================================
// 6. Widget Lesson Status Search
// ==========================================
document.getElementById('GetWidgetLessonStatus').onclick = function () {
    const input = document.getElementById('WidgetLessonStatus');
    if (!input || input.value.trim() === '') {
        createAndShowButton('Введите id в поле', 'error');
        return;
    }
    window.open('https://grafana.skyeng.link/d/DZop3WKVz/nextlesson-analytics?orgId=1&var-UserId=' + input.value + '&from=now-24h&to=now');
    input.value = '';
};


// ==========================================
// 7. Datalens Dashboard
// ==========================================
document.getElementById('lkmpdashboard').addEventListener('click', function () {
    window.open('https://datalens.yandex.cloud/b4ut2mi8b8z8y-deystvie-polzovateley-v-lk-mp');
});