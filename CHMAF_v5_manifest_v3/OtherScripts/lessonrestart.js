// ============================================================
// Кнопка «Classwork»: перевод комнаты урока в статус classwork
// ============================================================

const CLW_BTN_ID = 'clwbtn';
const CLW_LABEL = '🔄️Classwork';
const CLW_CONFIRM_MS = 3000;

const CLW_COLORS = {
    idle: { bg: '#10b981', hover: '#059669', glow: 'rgba(16, 185, 129, 0.3)' },
    confirm: { bg: '#f59e0b', hover: '#d97706', glow: 'rgba(245, 158, 11, 0.35)' },
    error: { bg: '#dc2626', hover: '#b91c1c', glow: 'rgba(220, 38, 38, 0.35)' }
};

/** subject и id комнаты из адреса урока (раньше брались без проверки). */
function getLessonRoomParams() {
    const urlParts = document.URL.split('/');
    const subject = urlParts[4] || '';
    const roomId = (urlParts[6] || '').split(/[?#]/)[0];

    if (!/^[a-z0-9-]+$/i.test(subject) || !roomId) return null;
    return { subject, roomId };
}

async function dosetclasswork(subject, roomId) {
    const response = await fetch(`https://api-${subject}.skyeng.ru/api/v1/rooms/${encodeURIComponent(roomId)}`, {
        headers: {
            accept: 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({ status: 'classwork' }),
        method: 'PATCH',
        mode: 'cors',
        credentials: 'include'
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

function paintClwButton(btn, state, hovered = btn.matches(':hover')) {
    const c = CLW_COLORS[state] || CLW_COLORS.idle;
    btn.dataset.state = state;
    btn.style.background = hovered ? c.hover : c.bg;
    btn.style.boxShadow = hovered
        ? `0 4px 20px ${c.glow}, 0 0 0 4px ${c.glow.replace(/[\d.]+\)$/, '0.1)')}`
        : `0 2px 8px ${c.glow}`;
    btn.style.transform = hovered ? 'scale(1.05)' : 'scale(1)';
}

function createClassworkButton() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = CLW_BTN_ID;
    btn.title = 'Эта кнопка создана в расширении ChMAF, преподавателям не нужно за нее говорить, так как без расширения видеть ее не будут!';
    btn.textContent = CLW_LABEL;
    btn.style.cssText = `
        position: fixed;
        right: 25%;
        cursor: pointer;
        padding: 10px 22px;
        font-size: 14px;
        font-weight: 600;
        font-family: 'Segoe UI', system-ui, sans-serif;
        letter-spacing: 0.5px;
        color: #fff;
        border: none;
        border-radius: 8px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    paintClwButton(btn, 'idle', false);

    btn.addEventListener('mouseenter', () => paintClwButton(btn, btn.dataset.state, true));
    btn.addEventListener('mouseleave', () => paintClwButton(btn, btn.dataset.state, false));

    let confirmTimer = 0;

    const resetToIdle = () => {
        clearTimeout(confirmTimer);
        btn.disabled = false;
        btn.textContent = CLW_LABEL;
        paintClwButton(btn, 'idle');
    };

    btn.addEventListener('click', async () => {
        const params = getLessonRoomParams();
        if (!params) {
            btn.textContent = '⚠️ Не найден ID комнаты';
            paintClwButton(btn, 'error');
            confirmTimer = setTimeout(resetToIdle, CLW_CONFIRM_MS);
            return;
        }

        // Первый клик — подтверждение: случайное нажатие перезапускало урок
        if (btn.dataset.state !== 'confirm') {
            btn.textContent = '⚠️ Точно? Нажми ещё раз';
            paintClwButton(btn, 'confirm');
            clearTimeout(confirmTimer);
            confirmTimer = setTimeout(resetToIdle, CLW_CONFIRM_MS);
            return;
        }

        clearTimeout(confirmTimer);
        btn.disabled = true;
        btn.textContent = '⏳ Отправляю…';

        try {
            await dosetclasswork(params.subject, params.roomId);
            btn.textContent = '✅ Done! Перезагружаю…';
            paintClwButton(btn, 'idle');
            // Перезагрузка только после успешного ответа: раньше страница
            // перезагружалась через 1 с, даже если запрос не прошёл
            setTimeout(() => location.reload(), 700);
        } catch (error) {
            console.error('[ChMAF] Classwork: ошибка запроса', error);
            btn.disabled = false;
            btn.textContent = `❌ Ошибка (${error.message})`;
            paintClwButton(btn, 'error');
            confirmTimer = setTimeout(resetToIdle, 4000);
        }
    });

    return btn;
}

function setupClassworkButton() {
    if (document.getElementById(CLW_BTN_ID)) return;

    const targetButton = document.querySelector('button.header-item.ng-star-inserted');

    if (targetButton) {
        targetButton.parentNode.insertBefore(createClassworkButton(), targetButton);
        return;
    }

    // Ищем контейнер, содержащий «Вложения» (textContent: innerText пересчитывает вёрстку)
    const attachmentsContainer = Array.from(document.querySelectorAll('.-without-border'))
        .find((el) => el.textContent.includes('Вложения'));

    if (attachmentsContainer?.parentNode?.parentNode) {
        attachmentsContainer.parentNode.parentNode.appendChild(createClassworkButton());
    }
}

// Страница урока обновляет DOM постоянно (видео, чат, доска). Раньше на каждую
// мутацию шёл поиск по всей странице; теперь — не чаще раза в 300 мс,
// и сразу выход, если кнопка уже стоит.
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