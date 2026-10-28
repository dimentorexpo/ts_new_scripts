// ============================================================
// Кнопка «Classwork»: перевод комнаты урока в статус classwork
// Круглая плавающая кнопка по центру правого края экрана
// ============================================================

const CLW_BTN_ID = 'clwbtn';
const CLW_CONFIRM_MS = 3000;

const CLW_TEXT = {
    idle: 'Classwork — перезапустить урок',
    confirm: 'Точно? Нажми ещё раз',
    loading: 'Отправляю…',
    done: 'Готово! Перезагружаю…',
    noRoom: 'Не найден ID комнаты'
};

const CLW_ICONS = {
    // Круговые стрелки + «play» в центре
    idle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 0 1-13.7 5.6"/><path d="M4 12a8 8 0 0 1 13.7-5.6"/><polyline points="18 2.5 18 6.5 14 6.5"/><polyline points="6 21.5 6 17.5 10 17.5"/><path d="M10.2 9.2v5.6l4.6-2.8z" fill="currentColor" stroke-width="1.2"/></svg>`,
    confirm: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5"/><circle cx="12" cy="16.5" r=".6" fill="currentColor"/><path d="M10.3 3.9 2.5 17.5A2 2 0 0 0 4.2 20.5h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>`,
    loading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9" class="clw-spin"/></svg>`,
    done: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12.5 10 17.5 19 7"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M7 7l10 10M17 7 7 17"/></svg>`
};

function injectClwStyles() {
    if (document.getElementById('clw-styles')) return;
    const s = document.createElement('style');
    s.id = 'clw-styles';
    s.textContent = `
        #${CLW_BTN_ID} {
            --clw-a: #34d399; --clw-b: #059669; --clw-glow: rgba(16, 185, 129, .45);
            position: fixed; right: 18px; top: 50%; transform: translateY(-50%);
            z-index: 2147482000;
            width: 54px; height: 54px; padding: 0; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            color: #fff; cursor: pointer;
            border: 1px solid rgba(255, 255, 255, .35);
            background:
                radial-gradient(circle at 30% 25%, rgba(255,255,255,.45), transparent 45%),
                linear-gradient(145deg, var(--clw-a), var(--clw-b));
            box-shadow: 0 8px 22px var(--clw-glow), 0 2px 6px rgba(0,0,0,.18), inset 0 -3px 6px rgba(0,0,0,.15);
            transition: transform .25s cubic-bezier(.4,0,.2,1), box-shadow .25s ease, filter .25s ease;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }
        #${CLW_BTN_ID}::before {
            content: ''; position: absolute; inset: -5px; border-radius: 50%;
            border: 2px solid var(--clw-a); opacity: 0;
            animation: clw-ring 2.8s ease-out infinite;
        }
        #${CLW_BTN_ID}:hover { transform: translateY(-50%) scale(1.08); box-shadow: 0 12px 30px var(--clw-glow), 0 0 0 6px rgba(255,255,255,.06); }
        #${CLW_BTN_ID}:active { transform: translateY(-50%) scale(.96); }
        #${CLW_BTN_ID}:disabled { cursor: progress; }
        #${CLW_BTN_ID} svg { width: 26px; height: 26px; filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); }
        #${CLW_BTN_ID}[data-state="confirm"] { --clw-a: #fbbf24; --clw-b: #d97706; --clw-glow: rgba(245,158,11,.5); }
        #${CLW_BTN_ID}[data-state="confirm"]::before { animation-duration: 1s; }
        #${CLW_BTN_ID}[data-state="error"]   { --clw-a: #f87171; --clw-b: #b91c1c; --clw-glow: rgba(220,38,38,.45); }
        #${CLW_BTN_ID}[data-state="loading"]::before, #${CLW_BTN_ID}[data-state="done"]::before { animation: none; }

        #${CLW_BTN_ID} .clw-tip {
            position: absolute; right: calc(100% + 12px); top: 50%;
            transform: translate(6px, -50%); opacity: 0; pointer-events: none;
            white-space: nowrap; padding: 7px 12px; border-radius: 10px;
            font-size: 13px; font-weight: 600; color: #f1f5f9;
            background: rgba(17, 24, 39, .92); border: 1px solid rgba(255,255,255,.1);
            box-shadow: 0 8px 24px rgba(0,0,0,.25);
            transition: opacity .2s ease, transform .2s ease;
        }
        #${CLW_BTN_ID}:hover .clw-tip,
        #${CLW_BTN_ID}:not([data-state="idle"]) .clw-tip { opacity: 1; transform: translate(0, -50%); }
        #${CLW_BTN_ID} .clw-tip small { display: block; font-weight: 400; font-size: 11px; color: #94a3b8; margin-top: 2px; }

        #${CLW_BTN_ID} .clw-spin { transform-origin: 12px 12px; animation: clw-rot .8s linear infinite; }
        @keyframes clw-rot { to { transform: rotate(360deg); } }
        @keyframes clw-ring { 0% { transform: scale(.9); opacity: .55; } 70%,100% { transform: scale(1.35); opacity: 0; } }
    `;
    document.head.appendChild(s);
}

/** subject и id комнаты из адреса урока. */
function getLessonRoomParams() {
    const urlParts = document.URL.split('/');
    const subject = urlParts[4] || '';
    const roomId = (urlParts[6] || '').split(/[?#]/)[0];
    if (!/^[a-z0-9-]+$/i.test(subject) || !roomId) return null;
    return { subject, roomId };
}

async function dosetclasswork(subject, roomId) {
    const response = await fetch(`https://api-${subject}.skyeng.ru/api/v1/rooms/${encodeURIComponent(roomId)}`, {
        headers: { accept: 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ status: 'classwork' }),
        method: 'PATCH',
        mode: 'cors',
        credentials: 'include'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

function setClwState(btn, state, text, hint) {
    btn.dataset.state = state;
    btn.innerHTML = `${CLW_ICONS[state] || CLW_ICONS.idle}<span class="clw-tip">${text}${hint ? `<small>${hint}</small>` : ''}</span>`;
    btn.setAttribute('aria-label', text);
}

function createClassworkButton() {
    injectClwStyles();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = CLW_BTN_ID;

    const IDLE_HINT = 'Видно только с ChMAF — преподавателю не озвучивать';
    let confirmTimer = 0;

    const resetToIdle = () => {
        clearTimeout(confirmTimer);
        btn.disabled = false;
        setClwState(btn, 'idle', CLW_TEXT.idle, IDLE_HINT);
    };
    resetToIdle();

    btn.addEventListener('click', async () => {
        const params = getLessonRoomParams();
        if (!params) {
            setClwState(btn, 'error', CLW_TEXT.noRoom);
            clearTimeout(confirmTimer);
            confirmTimer = setTimeout(resetToIdle, CLW_CONFIRM_MS);
            return;
        }

        // Первый клик — подтверждение (случайное нажатие перезапускало урок)
        if (btn.dataset.state !== 'confirm') {
            setClwState(btn, 'confirm', CLW_TEXT.confirm, 'Урок будет переведён в classwork');
            clearTimeout(confirmTimer);
            confirmTimer = setTimeout(resetToIdle, CLW_CONFIRM_MS);
            return;
        }

        clearTimeout(confirmTimer);
        btn.disabled = true;
        setClwState(btn, 'loading', CLW_TEXT.loading);

        try {
            await dosetclasswork(params.subject, params.roomId);
            setClwState(btn, 'done', CLW_TEXT.done);
            setTimeout(() => location.reload(), 700);
        } catch (error) {
            console.error('[ChMAF] Classwork: ошибка запроса', error);
            btn.disabled = false;
            setClwState(btn, 'error', `Ошибка (${error.message})`);
            confirmTimer = setTimeout(resetToIdle, 4000);
        }
    });

    return btn;
}

function setupClassworkButton() {
    if (document.getElementById(CLW_BTN_ID)) return;

    // Признак страницы урока: кнопка в шапке или блок «Вложения».
    // Сама кнопка теперь плавающая и крепится к body.
    const isLessonPage =
        document.querySelector('button.header-item.ng-star-inserted') ||
        Array.from(document.querySelectorAll('.-without-border')).some((el) => el.textContent.includes('Вложения'));

    if (isLessonPage) document.body.appendChild(createClassworkButton());
}

// Страница урока постоянно меняет DOM: проверяем не чаще раза в 300 мс
let clwSetupTimer = 0;

const clwObserver = new MutationObserver(() => {
    if (clwSetupTimer || document.getElementById(CLW_BTN_ID)) return;
    clwSetupTimer = setTimeout(() => {
        clwSetupTimer = 0;
        setupClassworkButton();
    }, 300);
});

clwObserver.observe(document.body, { childList: true, subtree: true });
setupClassworkButton();
