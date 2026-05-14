// --- PREMIUM LUXURY GLASSMORPHISM STYLES ---
const glassStylesTask = `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
        --glass-bg-primary: rgba(15, 23, 42, 0.85);
        --glass-bg-secondary: rgba(30, 41, 59, 0.75);
        --glass-border: rgba(148, 163, 184, 0.12);
        --glass-border-hover: rgba(148, 163, 184, 0.24);
        --accent-cyan: #06b6d4;
        --accent-violet: #8b5cf6;
        --accent-emerald: #10b981;
        --accent-rose: #f43f5e;
        --text-primary: #f1f5f9;
        --text-secondary: #cbd5e1;
        --text-muted: #94a3b8;
        --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.12);
        --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.18);
        --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.24);
        --shadow-glow-cyan: 0 0 24px rgba(6, 182, 212, 0.3);
        --shadow-glow-violet: 0 0 24px rgba(139, 92, 246, 0.3);
        --shadow-glow-rose: 0 0 24px rgba(244, 63, 94, 0.3);
    }

    .glass-panel-task {
        background: var(--glass-bg-primary);
        backdrop-filter: blur(24px) saturate(180%);
        -webkit-backdrop-filter: blur(24px) saturate(180%);
        border-radius: 20px;
        border: 1px solid var(--glass-border);
        box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 16px;
        box-sizing: border-box;
        position: relative;
        overflow: hidden;
    }

    .glass-panel-task::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        pointer-events: none;
    }

    .glass-btn-task {
        background: var(--glass-bg-secondary);
        border: 1px solid var(--glass-border);
        border-radius: 10px;
        color: var(--text-primary);
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.01em;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        outline: none;
        box-shadow: var(--shadow-sm);
        position: relative;
        overflow: hidden;
    }

    .glass-btn-task::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        transform: translate(-50%, -50%);
        transition: width 0.6s, height 0.6s;
    }

    .glass-btn-task:hover::before {
        width: 300px;
        height: 300px;
    }

    .glass-btn-task:hover {
        background: rgba(255, 255, 255, 0.08);
        border-color: var(--glass-border-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
    }

    .glass-btn-task:active {
        transform: translateY(0) scale(0.98);
        box-shadow: var(--shadow-sm);
    }

    .glass-input-task,
    .glass-select-task,
    .glass-textarea-task {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        color: var(--text-primary);
        padding: 10px 14px;
        font-size: 14px;
        font-weight: 400;
        outline: none;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;
        box-sizing: border-box;
        font-family: 'Inter', sans-serif;
    }

    .glass-input-task::placeholder,
    .glass-textarea-task::placeholder {
        color: var(--text-muted);
        font-weight: 400;
    }

    .glass-input-task:focus,
    .glass-select-task:focus,
    .glass-textarea-task:focus {
        background: rgba(0, 0, 0, 0.4);
        border-color: var(--accent-cyan);
        box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.15), var(--shadow-glow-cyan);
        transform: translateY(-1px);
    }

    .glass-textarea-task {
        resize: vertical;
        min-height: 90px;
        line-height: 1.5;
    }

    .err-shake-task {
        animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        border-color: var(--accent-rose) !important;
        background: rgba(244, 63, 94, 0.12) !important;
        box-shadow: var(--shadow-glow-rose) !important;
    }

    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
        20%, 40%, 60%, 80% { transform: translateX(4px); }
    }

    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.4), rgba(148, 163, 184, 0.6));
        border-radius: 10px;
        border: 2px solid transparent;
        background-clip: padding-box;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, rgba(148, 163, 184, 0.6), rgba(148, 163, 184, 0.8));
        background-clip: padding-box;
    }

    .status-badge-task {
        padding: 6px 12px;
        border-radius: 16px;
        font-weight: 600;
        font-size: 12px;
        letter-spacing: 0.02em;
        display: inline-block;
        box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-transform: uppercase;
    }

    .btn-row-task {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        gap: 8px;
    }

    .btn-row-task .glass-btn-task {
        flex: 1;
        font-size: 12px;
        padding: 8px 10px;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .glass-panel-task {
        animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
</style>
`;

var win_taskform = `
    ${glassStylesTask}
    <style>
        .chmaf-drag-handle {
            cursor: grab !important;
            user-select: none !important;
        }
        .task-header-btn {
            width: 36px;
            height: 36px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            border-radius: 10px;
        }
        .task-status-label {
            font-size: 11px;
            font-weight: 500;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-right: 6px;
        }
        .preset-btn-critical {
            background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(220, 38, 38, 0.2));
            border-color: rgba(244, 63, 94, 0.3);
        }
        .preset-btn-critical:hover {
            background: linear-gradient(135deg, rgba(244, 63, 94, 0.3), rgba(220, 38, 38, 0.3));
            box-shadow: var(--shadow-glow-rose);
        }
        .preset-btn-high {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2));
            border-color: rgba(139, 92, 246, 0.3);
        }
        .preset-btn-high:hover {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3));
            box-shadow: var(--shadow-glow-violet);
        }
        .preset-btn-low {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.2));
            border-color: rgba(6, 182, 212, 0.3);
        }
        .preset-btn-low:hover {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(14, 165, 233, 0.3));
            box-shadow: var(--shadow-glow-cyan);
        }
        .submit-btn {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(139, 92, 246, 0.4));
            border: 1px solid rgba(139, 92, 246, 0.5);
            font-weight: 600;
            font-size: 14px;
            padding: 14px;
            margin-top: 8px;
            letter-spacing: 0.02em;
            text-transform: uppercase;
        }
        .submit-btn:hover {
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.5), rgba(139, 92, 246, 0.5));
            box-shadow: var(--shadow-glow-cyan), var(--shadow-glow-violet);
        }
        .note-notice {
            font-size: 12px;
            background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15));
            padding: 10px 12px;
            border-radius: 12px;
            border: 1px solid rgba(139, 92, 246, 0.2);
            line-height: 1.4;
        }
        .note-notice-label {
            color: var(--text-secondary);
            font-weight: 500;
        }
        .note-notice-text {
            color: var(--text-primary);
            cursor: pointer;
            text-decoration: underline;
            text-decoration-style: dotted;
            text-underline-offset: 2px;
        }
        .search-btn {
            width: 44px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
    <div style="display: flex; width: 440px; position: relative;">
        <div class="glass-panel-task" style="width: 100%; position: relative; z-index: 2;">
            <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;" id="create_form_header" class="chmaf-drag-handle">
                <button class="glass-btn-task task-header-btn" title="Скрыть меню" id="hideMeCreateForm">✕</button>
                <button class="glass-btn-task task-header-btn" title="Обновить хеш чата" id="refreshhashcreateform">↻</button>
                <button class="glass-btn-task task-header-btn" title="Очистить форму" id="clearcreateform">⌫</button>
                <div style="margin-left: auto; display: flex; align-items: center;">
                    <span class="task-status-label">Статус</span>
                    <span id="statusuroka" class="status-badge-task" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(14, 165, 233, 0.4));">Загрузка...</span>
                </div>
            </div>

            <div id="addcreateformbtns" style="margin-bottom: 20px;">
                <div class="btn-row-task">
                    <button class="glass-btn-task preset-btn-critical" id="critteachertostudent" title="Критический: Преподаватель → Ученик">🔴 П → У</button>
                    <button class="glass-btn-task preset-btn-critical" id="critstudenttoteacher" title="Критический: Ученик → Преподаватель">🔴 У → П</button>
                </div>
                <div class="btn-row-task">
                    <button class="glass-btn-task preset-btn-critical" id="critteacherno" title="Критический: Преподаватель Н.О.">🔴 П Н.О.</button>
                    <button class="glass-btn-task preset-btn-critical" id="critstudentno" title="Критический: Ученик Н.О.">🔴 У Н.О.</button>
                </div>
                <div class="btn-row-task">
                    <button class="glass-btn-task preset-btn-high" id="highteachersc" title="Исходящие звонки КЦ ученикам">КЦ Исход</button>
                    <button class="glass-btn-task preset-btn-high" id="highteachertc" title="Teachers Care">Teachers Care</button>
                </div>
                <div class="btn-row-task">
                    <button class="glass-btn-task preset-btn-high" id="highsecondline" style="flex: 1.5;" title="Календарь У/П">Календарь</button>
                    <button class="glass-btn-task preset-btn-low" id="lowkm" title="Кризис менеджеры">Кризис менеджер</button>
                    <button class="glass-btn-task preset-btn-high" id="highprem" title="Premium">Prem Исход</button>
                    <button class="glass-btn-task preset-btn-low" id="low2lvimbug" title="2Л vim баг">2ЛТП</button>
                </div>
            </div>

            <div id="create_form_menu" style="display: flex; flex-direction: column; gap: 6px;">
                <input class="glass-input-task" disabled id="chathashlnk" placeholder="💬 Хэш чата" autocomplete="off" style="text-align: center; font-weight: 500;">
                <select class="glass-select-task" id="priority" style="text-align: center; font-weight: 500;">
                    <option disabled selected value="">⚡ Укажите Приоритет</option>
                    <option value="low" style="color: #10b981; font-weight:600">🟢 Низкий</option>
                    <option value="high" style="color: #8b5cf6; font-weight:600">🟣 Высокий</option>
                    <option value="highest" style="color: #f43f5e; font-weight:600">🔴 Критический</option>
                </select>
                <select class="glass-select-task" id="customerservice" style="text-align: center; font-weight: 500;">
                    <option disabled selected value="">🏢 Укажите Отдел</option>
                    <option value="tech_support_outgoing_crm2" style="color: #f43f5e;">🛠️ Техподдержка 1Л CRM (исход)</option>
                    <option value="teachers_care_crm">👽 Teachers Care</option>
                    <option value="content_management">📄 Контент</option>
                    <option value="outgoing_calls_crm2">📞 Исходящие звонки (КЦ исход)</option>
                    <option value="tech_support_second_line_crm2" style="color: #10b981;">🥈 Техподдержка 2Л CRM</option>
                    <option value="crisis_manager">🤬 Кризис менеджеры</option>
                    <option value="personal_support">💎 Персональное сопровождение (Premium)</option>
                </select>
                <input class="glass-input-task" id="taskserviceid" placeholder="🎫 ID услуги">
                <div style="display: flex; gap: 8px;">
                    <input class="glass-input-task" id="taskuserid" placeholder="👤 ID пользователя">
                    <button class="glass-btn-task search-btn" id="searchuserservices" title="Найти услуги">🔍</button>
                </div>
                <div id="NoteNoticeWrap" class="note-notice" style="display: none;">
                    <span class="note-notice-label">Будет добавлена заметка:</span>
                    <span id="NoteNoticeText" class="note-notice-text" title="Нажми для отмены"></span>
                </div>
                <button class="glass-btn-task preset-btn-high" style="display:none;" id="taskcreate2linecrm">Создать задачу на 2ЛТП по календарю</button>
                <textarea class="glass-textarea-task" id="taskcomment" placeholder="📝 Комментарий к задаче" autocomplete="off"></textarea>
                <div class="btn-row-task" style="margin-top: 4px;">
                    <button class="glass-btn-task" id="studcontact" title="Обратился П → У">👽 → 👨‍🎓</button>
                    <button class="glass-btn-task" id="teachcontact" title="Обратился У → П">👨‍🎓 → 👽</button>
                    <button class="glass-btn-task" id="nrteacher" title="Критический П Н.О">👽 Н.О</button>
                    <button class="glass-btn-task" id="nrstudent" title="Критический У Н.О">👨‍🎓 Н.О</button>
                </div>
                <button class="glass-btn-task submit-btn" id="createtask">🚀 Отправить задачу</button>
            </div>
        </div>

        <div id="servicehelper" class="glass-panel-task srvhhelpnomove" style="position: absolute; top: 0; left: -330px; width: 320px; max-height: 520px; overflow-y: auto; z-index: 1;">
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <input class="glass-input-task" id="useriddata" placeholder="ID студента (услуги)">
                <button class="glass-btn-task search-btn" id="getuserservices">🔍</button>
            </div>
            <div id="serviceinf" style="display: flex; flex-direction: column; gap: 10px;"></div>
            <div id="serviceComplinf" style="margin-top: 12px;"></div>
        </div>
    </div>`;

var win_speccommwindow = `
    ${glassStylesTask}
    <style>
        .spec-comm-header {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 12px;
        }
        .spec-comm-close {
            width: 32px;
            height: 32px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
        }
        .spec-comm-content {
            font-size: 13px;
            line-height: 1.6;
            max-height: 320px;
            overflow-y: auto;
            padding: 12px;
            word-wrap: break-word;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            border: 1px solid var(--glass-border);
        }
    </style>
    <div class="glass-panel-task" style="width: 360px; cursor: -webkit-grab;">
        <div class="spec-comm-header">
            <button title="Скрыть меню" id="hideMeSpecComm" class="glass-btn-task spec-comm-close">✕</button>
        </div>
        <div id="speccommtext" class="spec-comm-content"></div>
    </div>`;

// Глобальные переменные
var NoteFlag = 0;
var NoteText = '';
var srvcont = null;

// Инициализация окон (твоя внешняя функция createWindow)
const wintCreateTask = createWindow('AF_Createtask', 'winTopTaskCreate', 'winLeftTaskCreate', win_taskform);
const winSpecCommWindow = createWindow('AF_SpecCommWindow', 'winTopSpecCommWindow', 'winLeftSpecCommWindow', win_speccommwindow);

// Обработчики двойного клика для скрытия
document.getElementById('AF_SpecCommWindow').ondblclick = (a) => {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') document.getElementById('hideMeSpecComm').click();
};
document.getElementById('AF_Createtask').ondblclick = (a) => {
    if (checkelementtype(a) && localStorage.getItem('dblhidewindow') == '0') document.getElementById('hideMeCreateForm').click();
};

document.getElementById('hideMeSpecComm').onclick = () => {
    document.getElementById('AF_SpecCommWindow').style.display = 'none';
    document.getElementById('speccommtext').innerHTML = '';
};

function handleSpecCommentClick(text) {
    document.getElementById('speccommtext').innerHTML = text;
    document.getElementById('AF_SpecCommWindow').style.display = '';
}

// Защита от ввода не-цифр (твоя функция onlyNumber)
['taskserviceid', 'taskuserid', 'useriddata'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', (e) => onlyNumber(e.target));
});
// Утилита для выполнения API запросов с Promise (избавляет от вложенностей)
const sendBgRequest = (url, options = { method: 'GET' }) => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: url, requestOptions: options }, (response) => {
            if (!response || !response.success) reject(new Error(response?.error || 'Unknown error'));
            else resolve(JSON.parse(response.fetchansver));
        });
    });
};

// === НАБЛЮДАТЕЛЬ: полностью скрываем нативное окно "Создать задачу" внутри iframe ===

let _nativeModalObserver = null;
let _suppressTimer = null;
let _lastModalState = null; // Отслеживаем состояние, чтобы не дублировать операции

/**
 * Полностью скрывает нативную модалку Autofaq внутри iframe, если включена настройка hideTaskWindow.
 * Скрывает: саму модалку + оверлей (затемнение) + фиксит body (убирает overflow:hidden)
 */
function suppressNativeTaskModal() {
    clearTimeout(_suppressTimer);
    _suppressTimer = setTimeout(() => {
        if (localStorage.getItem('hideTaskWindow') !== '1') {
            // Если настройка выключена — показываем обратно, если были скрыты
            restoreNativeTaskModal();
            return;
        }
        if (!location.href.includes('skyeng.autofaq.ai/tickets/assigned')) return;

        const iframe = document.querySelector('iframe[class^="NEW_FRONTEND"], iframe');
        if (!iframe?.contentDocument) return;

        const iframeDoc = iframe.contentDocument;

        let foundAndHidden = false;

        // === Способ 1: Современный Mantine (role="dialog") ===
        const dialogs = iframeDoc.querySelectorAll('[role="dialog"]');
        for (const dialog of dialogs) {
            const title = dialog.querySelector('.mantine-Modal-title, [id$="-title"], .mantine-Text-root');
            if (!title || title.textContent.trim() !== 'Создать задачу') continue;

            // Получаем рут модалки (обычно это .mantine-Modal-root или ближайший wrapper)
            const modalRoot = dialog.closest('.mantine-Modal-root')
                || dialog.closest('[class*="Modal_"]')
                || dialog.parentElement?.parentElement;

            // Получаем оверлей (затемнение) — ищем внутри modalRoot или по классу
            let overlay = null;
            if (modalRoot) {
                overlay = modalRoot.querySelector('.mantine-Overlay-root, [class*="Overlay_"], .mantine-Modal-overlay');
            }
            // Fallback: ищем оверлей по всему документу, если не нашли внутри modalRoot
            if (!overlay) {
                overlay = iframeDoc.querySelector('.mantine-Overlay-root, [class*="Overlay_"], .mantine-Modal-overlay');
            }

            // СКРЫВАЕМ всё
            if (modalRoot) {
                modalRoot.style.display = 'none';
                modalRoot.style.visibility = 'hidden';
                modalRoot.style.pointerEvents = 'none';
            } else {
                dialog.style.display = 'none';
                dialog.style.visibility = 'hidden';
                dialog.style.pointerEvents = 'none';
            }

            if (overlay) {
                overlay.style.display = 'none';
                overlay.style.visibility = 'hidden';
                overlay.style.pointerEvents = 'none';
            }

            // КРИТИЧНО: Убираем overflow:hidden у body, чтобы страница была прокручиваемой
            if (iframeDoc.body) {
                iframeDoc.body.style.overflow = '';
                iframeDoc.body.style.paddingRight = ''; // Убираем компенсацию скроллбара
            }
            if (iframeDoc.documentElement) {
                iframeDoc.documentElement.style.overflow = '';
            }

            // Убираем aria-hidden с основного контента (если Mantine его ставит)
            const mainContent = iframeDoc.querySelector('[aria-hidden="true"]:not([role="dialog"])');
            if (mainContent) {
                mainContent.removeAttribute('aria-hidden');
            }

            foundAndHidden = true;
            _lastModalState = 'hidden';
            break;
        }

        // === Способ 2: Fallback — по тексту внутри iframe (если Mantine обновился) ===
        if (!foundAndHidden) {
            const allElements = iframeDoc.querySelectorAll('*');
            for (const el of allElements) {
                if (el.children.length === 0 && el.textContent?.trim() === 'Создать задачу') {
                    let modal = el.closest('[role="dialog"]')
                        || el.closest('.mantine-Modal-modal')
                        || el.closest('.mantine-Paper-root')
                        || el.closest('[class*="Modal_"]')
                        || el.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;

                    if (modal) {
                        // Ищем оверлей рядом (обычно соседний элемент или внутри того же контейнера)
                        const parent = modal.parentElement;
                        let overlay = null;
                        if (parent) {
                            overlay = parent.querySelector('.mantine-Overlay-root, [class*="Overlay_"]')
                                || parent.previousElementSibling
                                || parent.nextElementSibling;
                        }

                        modal.style.display = 'none';
                        modal.style.visibility = 'hidden';
                        modal.style.pointerEvents = 'none';

                        if (overlay) {
                            overlay.style.display = 'none';
                            overlay.style.visibility = 'hidden';
                            overlay.style.pointerEvents = 'none';
                        }

                        if (iframeDoc.body) {
                            iframeDoc.body.style.overflow = '';
                            iframeDoc.body.style.paddingRight = '';
                        }

                        foundAndHidden = true;
                        _lastModalState = 'hidden';
                        break;
                    }
                }
            }
        }

    }, 50); // Увеличили до 50мс для надёжности
}

/**
 * Восстанавливает отображение модалки (когда настройка hideTaskWindow выключена)
 */
function restoreNativeTaskModal() {
    if (_lastModalState !== 'hidden') return;

    const iframe = document.querySelector('iframe[class^="NEW_FRONTEND"], iframe');
    if (!iframe?.contentDocument) return;

    const iframeDoc = iframe.contentDocument;

    // Восстанавливаем все скрытые модалки
    const dialogs = iframeDoc.querySelectorAll('[role="dialog"]');
    for (const dialog of dialogs) {
        const title = dialog.querySelector('.mantine-Modal-title, [id$="-title"], .mantine-Text-root');
        if (!title || title.textContent.trim() !== 'Создать задачу') continue;

        const modalRoot = dialog.closest('.mantine-Modal-root')
            || dialog.closest('[class*="Modal_"]')
            || dialog.parentElement?.parentElement;

        let overlay = null;
        if (modalRoot) {
            overlay = modalRoot.querySelector('.mantine-Overlay-root, [class*="Overlay_"], .mantine-Modal-overlay');
        }
        if (!overlay) {
            overlay = iframeDoc.querySelector('.mantine-Overlay-root, [class*="Overlay_"], .mantine-Modal-overlay');
        }

        if (modalRoot) {
            modalRoot.style.display = '';
            modalRoot.style.visibility = '';
            modalRoot.style.pointerEvents = '';
        } else {
            dialog.style.display = '';
            dialog.style.visibility = '';
            dialog.style.pointerEvents = '';
        }

        if (overlay) {
            overlay.style.display = '';
            overlay.style.visibility = '';
            overlay.style.pointerEvents = '';
        }

        _lastModalState = 'visible';
        break;
    }
}

/**
 * Запускаем наблюдатель на iframe.contentDocument.body
 */
function initNativeModalObserver() {
    if (_nativeModalObserver) return;

    const tryObserve = () => {
        const iframe = document.querySelector('iframe[class^="NEW_FRONTEND"], iframe');
        const body = iframe?.contentDocument?.body;

        if (!body) {
            setTimeout(tryObserve, 500);
            return;
        }

        // Скрываем сразу, если модалка уже открыта
        suppressNativeTaskModal();

        _nativeModalObserver = new MutationObserver((mutations) => {
            const hasAdded = mutations.some(m => m.addedNodes.length > 0);
            const hasRemoved = mutations.some(m => m.removedNodes.length > 0);

            // Проверяем при любых изменениях DOM
            if (hasAdded || hasRemoved) {
                suppressNativeTaskModal();
            }
        });

        _nativeModalObserver.observe(body, {
            childList: true,
            subtree: true
        });

        // Также наблюдаем за изменениями атрибутов (на случай если модалка показывается через CSS)
        _nativeModalObserver.observe(body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style', 'class', 'role']
        });

        console.log('[AF] Modal observer attached to iframe');
    };

    tryObserve();
}

// === ЗАПУСК ===
initNativeModalObserver();

// Дополнительно: периодическая проверка на случай, если MutationObserver пропустит
setInterval(suppressNativeTaskModal, 1000);

// ГЛАВНАЯ ФУНКЦИЯ
async function gettaskButButtonPress() {
    let conversid;
    document.getElementById('serviceinf').innerHTML = '';

    if (document.getElementById('AF_Createtask').style.display === 'none') {
        document.getElementById('AF_Createtask').style.display = '';
        if (typeof taskBut !== 'undefined') taskBut.classList.add('active');

        // Запрашиваем конфигурацию (Один раз при открытии)
        if (!srvcont) {
            try {
                srvcont = await sendBgRequest(`https://backend.skyeng.ru/api/products/configurations/`);
            } catch (e) {
                console.error("Ошибка загрузки конфигураций:", e);
            }
        }

        // Кнопка поиска услуг (Лупа)
        document.getElementById('getuserservices').onclick = async () => {
            const idshka = document.getElementById('useriddata').value.trim();
            if (!idshka) return;

            document.getElementById('serviceinf').innerHTML = '<div style="text-align:center;">⏳ Загрузка...</div>';
            document.getElementById('serviceComplinf').innerHTML = "";
            const complectationServInfo = document.getElementById('cmplData');
            if (complectationServInfo) complectationServInfo.innerHTML = "";

            try {
                const [otvetEdServ, chechkComplectations] = await Promise.all([
                    sendBgRequest(`https://backend.skyeng.ru/api/persons/${idshka}/education-services/`),
                    sendBgRequest(`https://backend.skyeng.ru/api/v1/students/${idshka}/education-service-kits/`)
                ]);

                document.getElementById('serviceinf').innerHTML = ''; // Очистка после загрузки

                // Рендер регулярных услуг
                if (otvetEdServ?.data && srvcont?.data) {
                    otvetEdServ.data.forEach(srv => {
                        const config = srvcont.data.find(c => c.serviceTypeKey === srv.serviceTypeKey);
                        if (config) srv.serviceTypeKey = config.shortTitle;

                        if (srv.incorrectnessReason == null) {
                            let balance = srv.balance ?? '0';
                            let studentInfo = `${srv.student.general.id} ${srv.student.general.name || ''} ${srv.student.general.surname || ''}`;
                            let teacherInfo = srv.teacher ? `${srv.teacher.general.id} ${srv.teacher.general.name} ${srv.teacher.general.surname}` : '—';

                            let stageObj = { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3))', border: 'rgba(16, 185, 129, 0.4)', text: 'var(--text-primary)', title: 'Регулярные занятия' };
                            if (srv.stage === 'lost') stageObj = { bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3))', border: 'rgba(139, 92, 246, 0.4)', text: 'var(--text-primary)', title: 'Потерянная услуга' };
                            else if (["after_trial", "before_call"].includes(srv.stage)) stageObj = { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3))', border: 'rgba(245, 158, 11, 0.4)', text: 'var(--text-primary)', title: 'Этап ВУ' };

                            let html = `
                                <div class="glass-panel-task srvhhelpnomove outservfield-item" data-id="${srv.id}" style="background: ${stageObj.bg}; color: ${stageObj.text}; font-size: 13px; border: 1px solid ${stageObj.border}; padding: 12px;">
                                    <div style="text-align:center; background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 10px; margin-bottom: 8px; font-weight: 600; letter-spacing: 0.01em;">
                                        ${stageObj.title} <span class="specomment-btn" data-id="${srv.id}" style="cursor:pointer; opacity: 0.8; transition: opacity 0.2s;" title="Спец. комментарий">💭</span> | 💰 ${balance}
                                    </div>
                                    <div style="line-height: 1.5;">
                                        🆔 <span style="font-weight: 600;">${srv.id}</span> — ${srv.serviceTypeKey}
                                        <span class="movetoservid-btn" title="Перенести ID" style="cursor:pointer; float:right; font-size: 18px; opacity: 0.8; transition: all 0.2s;">➡️</span><br>
                                        👨‍🎓 ${studentInfo}<br>
                                        👨‍🏫 ${teacherInfo}
                                    </div>
                                </div>`;
                            document.getElementById('serviceinf').insertAdjacentHTML('beforeend', html);
                        }
                    });
                }

                // Рендер комплектаций
                if (chechkComplectations?.data?.length > 0) {
                    let lnkTaskCrCompl = document.getElementById('serviceComplinf');
                    lnkTaskCrCompl.innerHTML = '<div id="openComplectationTaskCreate" class="glass-btn-task preset-btn-high" style="text-align:center; font-weight: 600;">✅ Открыть комплектации</div>';

                    document.getElementById('openComplectationTaskCreate').addEventListener('click', () => {
                        let getComplWindow = document.getElementById('AF_Complectations');
                        if (getComplWindow) getComplWindow.style.display = getComplWindow.style.display === "none" ? "" : "none";
                    });

                    chechkComplectations.data.forEach(service => {
                        if (service.incorrectnessReason == null && complectationServInfo) {
                            let tableHTML = `<table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px;">`;
                            tableHTML += `<tr style="background: rgba(0,0,0,0.4); border-bottom: 1px solid rgba(148, 163, 184, 0.2);">
                                <th style="padding: 6px; font-weight: 600; text-align: left;">ID</th>
                                <th style="padding: 6px; font-weight: 600; text-align: left;">STK</th>
                                <th style="padding: 6px; font-weight: 600; text-align: left;">Урок</th>
                                <th style="padding: 6px; font-weight: 600; text-align: center;">СК</th>
                                <th style="padding: 6px;"></th></tr>`;

                            service.educationServices.forEach(el => {
                                let { formattedText, lessontype } = formatServiceType(el.serviceTypeKey);
                                tableHTML += `
                                <tr style="border-bottom: 1px solid rgba(148, 163, 184, 0.1); transition: background 0.2s;">
                                    <td style="padding: 6px;"><a href="https://crm2.skyeng.ru/persons/${service.student.general.id}/services/${el.id}" target="_blank" style="color: var(--accent-cyan); text-decoration: none; font-weight: 500;">${el.id}</a></td>
                                    <td style="padding: 6px;">${formattedText}</td>
                                    <td data-id="${el.id}" lessontype="${lessontype}" class="complect-nextlesson" style="padding: 6px;">⏳</td>
                                    <td class="specomment-compl" data-id="${el.id}" style="padding: 6px; cursor:pointer; text-align: center; opacity: 0.8; transition: opacity 0.2s;">💭</td>
                                    <td class="insert-complect-id" data-id="${el.id}" style="padding: 6px; cursor:pointer; text-align: center; font-size: 16px; opacity: 0.8; transition: all 0.2s;">➡️</td>
                                </tr>`;
                            });
                            tableHTML += '</table>';
                            complectationServInfo.insertAdjacentHTML('beforeend',
                                `<div class="glass-panel-task" style="margin-bottom: 10px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.25)); padding: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
                                    <div style="text-align: center; font-weight: 600; margin-bottom: 8px; font-size: 13px; letter-spacing: 0.01em;">${service.productKit.title} | ${service.stage}</div>
                                    ${tableHTML}
                                </div>`);
                        }
                    });
                }

                // Перенос ID в инпут
                document.querySelectorAll('.movetoservid-btn, .insert-complect-id').forEach(btn => {
                    btn.onclick = (e) => {
                        const targetId = e.target.closest('[data-id]').getAttribute('data-id');
                        if (document.getElementById('taskserviceid')) document.getElementById('taskserviceid').value = targetId;
                        validateField(document.getElementById('taskserviceid'), true); // Снимаем подсветку ошибки
                    };
                });

                // Загрузка Спец. комментариев
                document.querySelectorAll('.specomment-btn, .specomment-compl').forEach(btn => {
                    btn.onclick = async (e) => {
                        const servId = e.target.getAttribute('data-id');
                        try {
                            const specData = await sendBgRequest(`https://backend.skyeng.ru/api/students/${idshka}/education-services/${servId}/general/`);
                            let note = specData?.data?.operatorNote;
                            if (!note) {
                                e.target.innerText = '❌';
                                return;
                            }
                            note = note.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
                            if (note.toLowerCase().includes("звон")) {
                                note = highlightSearchText(note, "звон");
                                e.target.innerText = '⚠️';
                            }
                            handleSpecCommentClick(note);
                        } catch (err) {
                            e.target.innerText = '❌';
                        }
                    };
                });

                // Подгрузка будущих уроков
                document.querySelectorAll('.complect-nextlesson').forEach(async el => {
                    let eduservise = el.getAttribute('data-id');
                    let lessontype = el.getAttribute('lessontype');
                    let url = lessontype === 'f2f'
                        ? `https://backend.skyeng.ru/api/students/education-services/${eduservise}/timetable/future-lessons/`
                        : `https://backend.skyeng.ru/api/students/education-services/${eduservise}/timetable/group/future-lessons/`;

                    try {
                        const ttData = await sendBgRequest(url);
                        if (ttData?.data?.length > 0 && ttData.data[0].startedAt) {
                            const lessonDateObj = new Date(ttData.data[0].startedAt);
                            const formatter = new Intl.DateTimeFormat('ru-RU', {
                                timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
                                hour: '2-digit', minute: '2-digit'
                            });
                            el.innerText = formatter.format(lessonDateObj);

                            const now = new Date();
                            const diffMinutes = (now - lessonDateObj) / (1000 * 60);
                            if (diffMinutes >= -50 && diffMinutes <= 10) {
                                el.style.color = 'var(--accent-rose)';
                                el.style.fontWeight = '700';
                                el.style.textShadow = '0 0 8px rgba(244, 63, 94, 0.4)';
                            }
                        } else {
                            el.innerText = '—';
                        }
                    } catch { el.innerText = '—'; }
                });

            } catch (e) {
                document.getElementById('serviceinf').innerHTML = `<div style="color:red; text-align:center;">Ошибка: ${e.message}</div>`;
            }
        };

        // Связка поля пользователя с поисковиком
        document.getElementById('searchuserservices').onclick = () => {
            let val = document.getElementById('taskuserid').value.replace(/\D/g, '');
            if (val.length > 4) {
                document.getElementById('useriddata').value = val;
                document.getElementById('getuserservices').click();
            }
        };

        // Заполнение текущего чата
        let activeConvId = getChatId();
        if (activeConvId) {
            document.getElementById('chathashlnk').value = activeConvId;
            sendAutofaqAction(activeConvId, [{ name: "buttonId", isFile: false, value: "b49609f3-9ff7-4ba5-a8a8-f2cef770bf19" }], true);
        }

        document.getElementById('refreshhashcreateform').onclick = () => {
            let id = getChatId();
            document.getElementById('chathashlnk').value = id || '';
            const lessonStatus = SearchinAFnewUI("nextClass-statusHTML") || "";
            const statusEl = document.getElementById('statusuroka');
            if (lessonStatus.includes("идет") || lessonStatus.includes("идёт")) {
                statusEl.innerHTML = "Урок идет";
                statusEl.style.background = "linear-gradient(135deg, rgba(244, 63, 94, 0.5), rgba(220, 38, 38, 0.5))";
                statusEl.style.borderColor = "rgba(244, 63, 94, 0.6)";
            } else {
                statusEl.innerHTML = "Урок не идет";
                statusEl.style.background = "linear-gradient(135deg, rgba(6, 182, 212, 0.4), rgba(14, 165, 233, 0.4))";
                statusEl.style.borderColor = "rgba(6, 182, 212, 0.5)";
            }
        };
        document.getElementById('refreshhashcreateform').click();

        document.getElementById('hideMeCreateForm').onclick = () => {
            document.getElementById('AF_Createtask').style.display = 'none';
            if (typeof taskBut !== 'undefined') taskBut.classList.remove('active');
            if (document.getElementById('AF_Complectations')) document.getElementById('AF_Complectations').style.display = 'none';
            document.getElementById('hideMeSpecComm').click();

            if (activeConvId) sendAutofaqAction(activeConvId);
        };

        document.getElementById('priority').onchange = (e) => {
            const el = e.target;
            el.style.color = el.options[el.selectedIndex].style.color || '#fff';
            el.classList.remove('err-shake');
        };

        // Универсальная функция применения пресетов
        const applyPreset = (prioVal, deptVal, noteText, commentPrefix, assignUsluga = true, useNextClassId = false) => {
            document.getElementById('priority').value = prioVal;
            document.getElementById('priority').dispatchEvent(new Event('change'));
            document.getElementById('customerservice').value = deptVal;

            if (noteText) { NoteFlag = 1; NoteText = noteText; NoteNoticeSet(); }
            else NoteNoticeClear();

            document.getElementById('taskuserid').value = SearchinAFnewUI(useNextClassId ? "nextClass-studentId" : "id") || "";
            if (assignUsluga) {
                document.getElementById('taskserviceid').value = SearchinAFnewUI("nextClass-educationServiceId") || "";
            } else {
                document.getElementById('taskserviceid').value = "";
            }

            let comEl = document.getElementById('taskcomment');
            if (commentPrefix) {
                comEl.value = comEl.value ? comEl.value + "\n" + commentPrefix : commentPrefix;
            }
        };

        // ИСПРАВЛЕНИЕ: Кнопки пресетов теперь направляют в Техподдержку 1Л Исход.
        document.getElementById('critteachertostudent').onclick = () => applyPreset('highest', 'tech_support_outgoing_crm2', '👽 Обратился П. Связаться с 👨‍🎓 У.', '✅ Проверил связь с 👽 П, все ок, свяжитесь с 👨‍🎓 У! КРИТ', true, true);
        document.getElementById('critstudenttoteacher').onclick = () => applyPreset('highest', 'tech_support_outgoing_crm2', '👨‍🎓 Обратился У. Связаться с 👽 П.', '✅ Проверил связь с 👨‍🎓 У, все ок, свяжитесь с 👽 П! КРИТ', true, false);
        document.getElementById('critteacherno').onclick = () => applyPreset('highest', 'tech_support_outgoing_crm2', '🔴 Крит Н.О. 👽 П', '⚠️ Неполадка со стороны 👽 П. в чате н.о. Пожалуйста, свяжитесь с 👽 П КРИТ', true, true);
        document.getElementById('critstudentno').onclick = () => applyPreset('highest', 'tech_support_outgoing_crm2', '🔴 Крит Н.О. 👨‍🎓 У', '⚠️ Неполадка со стороны 👨‍🎓 У. в чате н.о. Пожалуйста, свяжитесь с 👨‍🎓 У КРИТ', true, false);

        document.getElementById('highsecondline').onclick = () => applyPreset('high', 'tech_support_second_line_crm2', null, 'Дата и время календаря:\nПриоритетный способ связи:\nОписание неполадки:\nЧто было сделано:', false, false);
        document.getElementById('highteachertc').onclick = () => applyPreset('high', 'teachers_care_crm', null, null, false, false);
        document.getElementById('highteachersc').onclick = () => applyPreset('high', 'outgoing_calls_crm2', null, null, false, false);
        document.getElementById('lowkm').onclick = () => applyPreset('low', 'crisis_manager', null, null, true, false);
        document.getElementById('highprem').onclick = () => applyPreset('high', 'personal_support', null, null, true, false);
        document.getElementById('low2lvimbug').onclick = () => applyPreset('low', 'tech_support_second_line_crm2', null, 'Краткое описание:\nШаги воспроизведения:\nОП:\nФП:\nСсылки на скриншоты:\nНужна ли ОС:', false, false);

        const validateField = (el, condition) => {
            if (!condition) {
                el.classList.add('err-shake-task');
                // Убираем класс через 450мс, чтобы можно было вызвать анимацию повторно
                setTimeout(() => el.classList.remove('err-shake-task'), 450);
                return false;
            }
            el.classList.remove('err-shake-task'); // Если поле валидно, убираем подсветку
            return true;
        };

        // Отправка формы Autofaq
        document.getElementById('createtask').onclick = async function () {
            let chathash = document.getElementById('chathashlnk');
            let priority = document.getElementById('priority');
            let cs = document.getElementById('customerservice');
            let tservid = document.getElementById('taskserviceid');
            let tuserid = document.getElementById('taskuserid');
            let comment = document.getElementById('taskcomment');

            // Сбрасываем старые ошибки перед новой проверкой
            [chathash, priority, cs, tservid, tuserid, comment].forEach(el => el.classList.remove('err-shake-task'));

            let isValid = true;

            // Базовые проверки
            isValid &= validateField(chathash, chathash.value.length >= 3);
            isValid &= validateField(priority, priority.value !== "" && priority.value !== null);
            isValid &= validateField(cs, cs.value !== "" && cs.value !== null);
            isValid &= validateField(tuserid, tuserid.value.trim().length >= 3);
            isValid &= validateField(comment, comment.value.trim().length >= 3);

            // ЛОГИКА ПРОВЕРКИ ID УСЛУГИ (как в старом коде):
            // ID услуги обязателен ТОЛЬКО если:
            // 1. Отдел = Кризис менеджеры (любой приоритет)
            // 2. Отдел = Техподдержка 1Л CRM Исход И приоритет = КРИТИЧЕСКИЙ
            const isServiceIdRequired = (cs.value === 'crisis_manager') ||
                (cs.value === 'tech_support_outgoing_crm2' && priority.value === 'highest');

            if (isServiceIdRequired) {
                isValid &= validateField(tservid, tservid.value.trim().length >= 3);
            }

            if (!isValid) {
                createAndShowButton('Проверьте правильность заполнения выделенных полей', 'error');
                return;
            }

            // Если всё ок — отправляем
            const btn = this;
            btn.disabled = true;
            btn.style.opacity = '0.6';
            btn.style.cursor = 'not-allowed';
            btn.innerHTML = '⏳ Отправка...';

            let usluga = tservid.value.trim() === "" ? "null" : tservid.value.trim(); // Если пусто, отправляем пустую строку
            let conversid = chathash.value;

            let elementsObj = [
                { name: "priority", isFile: false, value: priority.value },
                { name: "category", isFile: false, value: cs.value },
                { name: "educationServiceIdInput", isFile: false, value: usluga },
                { name: "userId", isFile: false, value: tuserid.value.trim() },
                { name: "comment", isFile: false, value: comment.value }
            ];

            if (!SearchinAFnewUI("userType")) {
                let initId = tuserid.value.trim();
                elementsObj.push({ name: "initiatorId", isFile: false, value: initId ? parseInt(initId) : 0 });
            }

            const success = await sendAutofaqAction(conversid, elementsObj);

            if (success) {
                if (NoteFlag === 1) { sendComment(NoteText); NoteNoticeClear(); }

                // Просто скрываем форму напрямую, не вызывая событие клика по кнопке "Hide"
                document.getElementById('AF_Createtask').style.display = 'none';
                if (typeof taskBut !== 'undefined') taskBut.classList.remove('active');

                document.getElementById('clearcreateform').click();
            } else {
                createAndShowButton('Ошибка сети при отправке задачи', 'error');
            }

            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            btn.innerHTML = '🚀 Отправить задачу';
        };

        const setupFastNote = (id, text) => {
            document.getElementById(id).onclick = () => { copyToClipboard(text); sendComment(text); };
        };
        setupFastNote('studcontact', '👽 Обратился П. Связаться с 👨‍🎓 У');
        setupFastNote('teachcontact', '👨‍🎓 Обратился У. Связаться с 👽 П');
        setupFastNote('nrstudent', '🔴 Крит Н.О. 👨‍🎓 У');
        setupFastNote('nrteacher', '🔴 Крит Н.О. 👽 П');

        document.getElementById('clearcreateform').onclick = () => {
            document.getElementById('chathashlnk').value = '';
            document.getElementById('taskcomment').value = '';
            document.getElementById('taskserviceid').value = '';
            document.getElementById('taskuserid').value = '';
            document.getElementById('useriddata').value = '';
            document.getElementById('priority').value = '';
            document.getElementById('customerservice').value = '';
            document.getElementById('priority').style.color = '#fff';
            NoteNoticeClear();
        };

    } else {
        document.getElementById('AF_Createtask').style.display = 'none';
        if (typeof taskBut !== 'undefined') taskBut.classList.remove('activeScriptBtn');
        let conversid = document.getElementById('chathashlnk').value;
        sendAutofaqAction(conversid);
    }

    function NoteNoticeSet() {
        document.getElementById('NoteNoticeText').innerText = NoteText;
        document.getElementById('NoteNoticeWrap').style.display = 'block';
    }
    function NoteNoticeClear() {
        document.getElementById('NoteNoticeWrap').style.display = 'none';
        document.getElementById('NoteNoticeText').innerText = '';
        NoteText = '';
        NoteFlag = 0;
    }
    document.getElementById('NoteNoticeText').onclick = NoteNoticeClear;
}

// ИСПРАВЛЕНИЕ: Формируем правильный application/json запрос для сервера Autofaq.
// Нативный JSON.stringify() сам идеально экранирует любые переносы строк и кавычки.
// Финальная и самая надежная версия функции отправки!
async function sendAutofaqAction(conversationId, elements = null, isClickMode = false) {
    if (!conversationId) return false;
    try {
        let endpoint = isClickMode ? "click" : "form";
        // Базовые заголовки. ВАЖНО: Мы НЕ прописываем здесь content-type!
        let headers = {
            "accept": "application/json, text/plain, */*",
            "x-csrf-token": aftoken
        };

        let config = {
            method: "POST",
            credentials: "include",
            mode: "cors"
        };

        if (isClickMode) {
            // Если это просто клик (смена статуса чата и тд), отправляем как JSON
            headers["content-type"] = "application/json";
            config.body = JSON.stringify({ buttonId: elements[0].value, conversationId: conversationId });
        } else {
            // Если это отправка формы (создание задачи) - используем FormData.
            // Браузер САМ поставит заголовок "multipart/form-data" и сгенерирует правильный boundary!
            const fd = new FormData();
            let payload = { conversationId: conversationId };
            if (elements) payload.elements = elements;

            // JSON.stringify безопасно упакует все кавычки и переносы строк внутри комментария
            fd.append("payload", JSON.stringify(payload));
            config.body = fd;
        }

        config.headers = headers;

        const response = await fetch(`https://skyeng.autofaq.ai/api/reason8/operator/customButtons/${endpoint}`, config);

        // Возвращаем успешность запроса (true если статус 200-299)
        return response.ok;
    } catch (err) {
        console.error("Autofaq submit error:", err);
        return false;
    }
}

/* // start test
//setInterval(doHideForm, 500);
const observer = new MutationObserver(() => doHideForm());
observer.observe(document.body, { childList: true, subtree: true });
// end test */