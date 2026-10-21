/* =========================================================
   ChMAF ▸ Компенсация (Яндекс Форма бюджета ТП)
   Отправка идёт через background (bg-yaforms.js):
   у контент-скрипта нет доступа к кукам forms.yandex.ru.
   Пункт меню: buttonCompensation в MODULE_MENU_CONFIG (utils.js).
   ========================================================= */
(() => {
    'use strict';

    const COMP_FORM = {
        surveyId: '6876066349363940156734b8',
        budgetDefault: '2381',
        q: {
            department: 'answer_dropdown_9008951824401440',
            email:      'answer_short_text_9008951827325054',
            studentId:  'answer_short_text_9008951824679360',
            serviceId:  'answer_short_text_9008951824803296',
            bonusType:  'answer_multiple_answers_9008951824861384',
            amount:     'answer_short_text_9008951825696712',
            operation:  'answer_quiz_one_answer_9008951825848504',
            budget:     'answer_short_text_9008951826038430',
            comment:    'answer_long_text_9008951826082878'
        },
        /* Запасные варианты, если не удалось прочитать их со страницы формы.
           id: null — id подтянется по совпадению подписи. */
        fallback: {
            department: [
                'Техподдержка чаты',
                'Техподдержка 2 линия',
                'Техподдержка Исход'
            ].map(label => ({ id: null, label })),
            bonusType: [
                'Бонусный урок',
                'Бонусные баллы(рубли)',
                'Бонусные баллы(доллары)',
                'Бонусные баллы(евро)',
                'Другое'
            ].map(label => ({ id: null, label })),
            operation: [
                'Компенсация за списанный преподавателем урок',
                'Компенсация за ошибку менеджера',
                'Компенсация за технические неполадки, которые не привели к срыву урока',
                'Компенсация по сглаживанию негатива',
                'Проявление лояльности для ученика',
                'Компенсация за пропуск преподавателем занятия',
                'Начисление уроков по промокоду',
                'Компенсация за смену преподавателя',
                'Компенсация за долгий подбор преподавателя',
                'Программа лояльности для корпоративных клиентов'
            ].map(label => ({ id: null, label }))
        }
    };

    const WIN_ID = 'AF_Compensation';
    const COMP_LS = { dept: 'chmafCompDept', email: 'chmafCompEmail', budget: 'chmafCompBudget' };
    const compQid = key => COMP_FORM.q[key].replace(/^answer_[a-z_]+_/, '');

    let compOptions = { department: [], bonusType: [], operation: [] };
    let compAuthorized = null;
    let win = null;

    /* ---------- Утилиты ---------- */

    const $ = id => document.getElementById(id);

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

    const lsGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
    const lsSet = (key, value) => { try { localStorage.setItem(key, value); } catch { /* приватный режим */ } };

    function toast(message, type = 'info') {
        if (typeof window.notify === 'function') return window.notify(message, type);
        if (typeof window.createAndShowButton === 'function') return window.createAndShowButton(message, type);
        console.log('[ChMAF Компенсация]', message);
    }

    function setBusy(btn, busy) {
        if (!btn) return;
        btn.disabled = !!busy;
        btn.classList.toggle('is-busy', !!busy);
    }

    function compAsk(message) {
        return new Promise((resolve, reject) => {
            try {
                chrome.runtime.sendMessage(message, resp => {
                    if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
                    if (!resp) return reject(new Error('Нет ответа от фонового скрипта'));
                    if (resp.success === false) return reject(new Error(resp.error || 'Ошибка фонового скрипта'));
                    resolve(resp);
                });
            } catch {
                reject(new Error('Расширение обновилось — нажмите Ctrl+Shift+R'));
            }
        });
    }

    /* ---------- Разметка ---------- */

    const WIN_HTML = `
<div class="comp-panel">
    <div class="comp-header chmaf-drag-handle">
        <span class="comp-title" title="Компенсация из бюджета ТП, когда у ученика нет честных оплат">🎁 Компенсация · нет честных оплат</span>
        <span class="comp-spacer"></span>
        <button type="button" class="comp-btn comp-btn-icon" id="compRefresh" title="Проверить вход и обновить варианты">♻</button>
        <button type="button" class="comp-btn comp-btn-icon" id="hideComp" title="Скрыть" aria-label="Скрыть">✕</button>
    </div>

    <div class="comp-auth" id="compAuth" data-state="loading">
        <span class="comp-auth-dot"></span>
        <span id="compAuthText">Проверяю вход в Яндекс Формы…</span>
        <button type="button" class="comp-btn comp-auth-btn" id="compLogin" hidden>Войти</button>
    </div>

    <div class="comp-check">
        <div class="comp-check-row">
            <span class="comp-label">Проверка честных оплат</span>
            <input id="compCheckId" class="comp-input comp-check-input" inputmode="numeric" autocomplete="off" placeholder="ID ученика">
            <button type="button" class="comp-btn" id="compCheckBtn">🔎 Проверить</button>
        </div>
    </div>
    <div class="comp-check-result" id="compCheckResult" hidden></div>

    <div class="comp-grid">
        <label class="comp-field">
            <span class="comp-label">Отдел</span>
            <select id="compDept" class="comp-input"></select>
        </label>
        <label class="comp-field">
            <span class="comp-label">Корп. почта</span>
            <input id="compEmail" class="comp-input" autocomplete="off" placeholder="name@skyeng.ru">
        </label>
        <label class="comp-field">
            <span class="comp-label">ID ученика</span>
            <input id="compStudent" class="comp-input" inputmode="numeric" autocomplete="off" placeholder="только цифры">
        </label>
        <label class="comp-field">
            <span class="comp-label">ID услуги</span>
            <input id="compService" class="comp-input" inputmode="numeric" autocomplete="off" placeholder="только цифры">
        </label>
        <label class="comp-field">
            <span class="comp-label">Вид бонуса</span>
            <select id="compBonus" class="comp-input"></select>
        </label>
        <label class="comp-field">
            <span class="comp-label">Количество</span>
            <input id="compAmount" class="comp-input" autocomplete="off" placeholder="1, 2, 500…">
        </label>
    </div>
    <div class="comp-hint" id="compAmountHint">Число без единиц: «500», а не «500 рублей».</div>

    <div class="comp-label comp-label-block">Тип операции</div>
    <div class="comp-ops" id="compOps" role="radiogroup"></div>

    <div class="comp-row">
        <label class="comp-field comp-budget">
            <span class="comp-label">Секция бюджета</span>
            <input id="compBudget" class="comp-input" inputmode="numeric" autocomplete="off">
        </label>
        <span class="comp-spacer"></span>
        <button type="button" class="comp-btn" id="compAddLink" title="Вставить ссылку на текущий чат в комментарий">🔗 Ссылка на чат</button>
    </div>
    <textarea id="compComment" class="comp-input comp-comment" placeholder="Обращение — ссылка на тред/баг, что произошло: урок списан, преподаватель не вышел…"></textarea>

    <div class="comp-actions">
        <button type="button" class="comp-btn" id="compClear">Очистить</button>
        <button type="button" class="comp-btn comp-btn-primary" id="compSend">Отправить</button>
    </div>
</div>`;

    /* ---------- Состояние входа ---------- */

    function compSetAuth(state, text) {
        $('compAuth').dataset.state = state;
        $('compAuthText').textContent = text;
        $('compLogin').hidden = state !== 'out' && state !== 'warn';
        compAuthorized = state === 'ok' || state === 'warn';
        $('compSend').disabled = !compAuthorized;
    }

    /* ---------- Варианты ответов ---------- */

    /* Берём варианты со страницы формы; если не нашлись — запасной список,
       а id для него ищем по совпадению подписи среди всех пар id/подпись страницы. */
    /* id, подтверждённые реальной отправкой формы */
    const KNOWN_IDS = {
        'техподдержка чаты': '9008951824401450',
        'бонусный урок': '9008951824861394',
        'компенсация за списанный преподавателем урок': '9008951825848514'
    };

    /* Список всегда полный (из кода). id берём: известный → со страницы формы по подписи.
       Варианты со страницы, которых нет в коде, добавляем в конец. */
    function compMergeOptions(fromPage, fallback, labels = {}) {
        const norm = t => String(t).toLowerCase().replace(/\s+/g, ' ').replace(/\s*\(\s*/g, '(').trim();
        const byNorm = {};
        for (const [l, id] of Object.entries(labels)) byNorm[norm(l)] = id;
        for (const o of fromPage || []) byNorm[norm(o.label)] = o.id;

        const list = fallback.map(f => ({
            id: f.id || KNOWN_IDS[norm(f.label)] || byNorm[norm(f.label)] || `label:${f.label}`,
            label: f.label
        }));
        const have = new Set(list.map(o => norm(o.label)));
        for (const o of fromPage || []) if (!have.has(norm(o.label))) list.push(o);
        return list;
    }

    function compFillSelect(select, options, storedKey) {
        const stored = storedKey ? lsGet(storedKey) : null;
        select.innerHTML = `<option value="">${options.length ? '— выберите —' : 'варианты не загрузились'}</option>`
            + options.map(o => `<option value="${esc(o.id)}">${esc(o.label)}</option>`).join('');
        if (stored && options.some(o => o.id === stored)) select.value = stored;
    }

    function compRenderOps(options) {
        const box = $('compOps');
        if (!options.length) {
            box.innerHTML = '<div class="comp-empty">Не удалось прочитать варианты со страницы формы. Нажмите ♻ или проверьте вход.</div>';
            return;
        }
        box.innerHTML = options.map(o => `
            <label class="comp-op">
                <input type="radio" name="compOp" value="${esc(o.id)}">
                <span>${esc(o.label)}</span>
            </label>`).join('');
    }

    function compApplyOptions(pageOptions) {
        const page = pageOptions || {};
        const labels = page.__labels || {};
        const fb = COMP_FORM.fallback;
        compOptions.department = compMergeOptions(page[compQid('department')], fb.department, labels);
        compOptions.bonusType = compMergeOptions(page[compQid('bonusType')], fb.bonusType, labels);
        compOptions.operation = compMergeOptions(page[compQid('operation')], fb.operation, labels);

        const missing = ['department', 'bonusType', 'operation'].filter(k => compOptions[k].some(o => o.id.startsWith('label:')));
        if (missing.length) {
            console.warn('[ChMAF] Компенсация: id не найдены, отправится текст подписи для', missing,
                '| пар id/подпись на странице формы:', Object.keys(labels).length);
        }

        compFillSelect($('compDept'), compOptions.department, COMP_LS.dept);
        compFillSelect($('compBonus'), compOptions.bonusType, null);
        compRenderOps(compOptions.operation);
    }

    async function compCheckAuth(force = false) {
        compSetAuth('loading', 'Проверяю вход в Яндекс Формы…');
        const btn = $('compRefresh');
        setBusy(btn, true);
        try {
            const questionIds = ['department', 'bonusType', 'operation'].map(compQid);
            const r = await compAsk({ action: 'yaForms:status', surveyId: COMP_FORM.surveyId, questionIds, force });
            if (!r.authorized) {
                compSetAuth('out', 'Нет входа в Яндекс Формы');
                return false;
            }
            if (r.authConfirmed) {
                compSetAuth('ok', 'Вход выполнен — можно отправлять');
            } else {
                compSetAuth('warn', 'Вход в Яндекс не подтверждён — без входа отправка не сработает');
            }
            compApplyOptions(r.options);
            return true;
        } catch (e) {
            compSetAuth('err', e.message);
            toast(`Компенсация: ${e.message}`, 'error');
            return false;
        } finally {
            setBusy(btn, false);
        }
    }

    /* ---------- Очистка, проверка, отправка ---------- */

    function compClear(all = false) {
        ['compStudent', 'compService', 'compAmount', 'compComment'].forEach(id => { $(id).value = ''; });
        $('compBonus').value = '';
        win.querySelectorAll('input[name="compOp"]').forEach(r => { r.checked = false; });
        if (all) $('compDept').value = '';
        win.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        resetConfirm();
    }

    function compCollect() {
        const errors = [];
        const mark = (id, msg) => { $(id)?.classList.add('is-invalid'); errors.push(msg); };

        const dept = $('compDept').value;
        const email = $('compEmail').value.trim().toLowerCase();
        const student = $('compStudent').value.trim();
        const service = $('compService').value.trim();
        const bonus = $('compBonus').value;
        const amountRaw = $('compAmount').value.trim();
        const op = win.querySelector('input[name="compOp"]:checked')?.value || '';
        const budget = $('compBudget').value.trim();
        const comment = $('compComment').value.trim();

        if (!dept) mark('compDept', 'отдел');
        if (!/^[a-z0-9._-]+@skyeng\.ru$/.test(email)) mark('compEmail', 'почта вида name@skyeng.ru');
        if (!student) mark('compStudent', 'ID ученика');
        if (!service) mark('compService', 'ID услуги');
        if (!bonus) mark('compBonus', 'вид бонуса');
        const free = !!$('compAmount').dataset.free;
        if (!amountRaw || (!free && !/^\d+(\.\d+)?$/.test(amountRaw))) mark('compAmount', 'количество числом');
        if (!op) { $('compOps').classList.add('is-invalid'); errors.push('тип операции'); }
        if (!budget) mark('compBudget', 'секция бюджета');
        if (comment.length < 5) mark('compComment', 'комментарий');

        if (errors.length) return { errors };

        const noId = [dept, bonus, op].filter(v => v.startsWith('label:')).map(v => `«${v.slice(6)}»`);
        if (noId.length) return { noId: `Для ${noId.join(', ')} пока нет id в форме — выберите другой вариант или сообщите разработчику` };

        const label = (list, id) => list.find(o => o.id === id)?.label || id;
        const val = id => id.startsWith('label:') ? id.slice(6) : id;
        return {
            values: {
                [COMP_FORM.q.department]: [val(dept)],
                [COMP_FORM.q.email]: email,
                [COMP_FORM.q.studentId]: student,
                [COMP_FORM.q.serviceId]: service,
                [COMP_FORM.q.bonusType]: [val(bonus)],
                [COMP_FORM.q.amount]: amountRaw,
                [COMP_FORM.q.operation]: [val(op)],
                [COMP_FORM.q.budget]: budget,
                [COMP_FORM.q.comment]: comment
            },
            summary: {
                student, service, amount: amountRaw,
                bonus: label(compOptions.bonusType, bonus),
                op: label(compOptions.operation, op)
            }
        };
    }

    /* Подтверждение без модалок: первый клик «вооружает» кнопку на 5 сек,
       второй — отправляет. Нативный confirm() блокирует страницу AutoFAQ. */
    let confirmTimer = null;
    function resetConfirm() {
        clearTimeout(confirmTimer);
        const btn = $('compSend');
        if (!btn) return;
        btn.classList.remove('is-armed');
        btn.textContent = 'Отправить';
    }

    async function compSend() {
        $('compOps').classList.remove('is-invalid');
        const btn = $('compSend');
        const data = compCollect();
        if (data.noId) {
            resetConfirm();
            toast(data.noId, 'error');
            return;
        }
        if (data.errors) {
            resetConfirm();
            toast(`Заполните: ${data.errors.join(', ')}`, 'error');
            return;
        }

        if (!btn.classList.contains('is-armed')) {
            const s = data.summary;
            btn.classList.add('is-armed');
            btn.textContent = 'Точно отправить?';
            toast(`Ученик ${s.student}, услуга ${s.service}: ${s.amount} — ${s.bonus}. ${s.op}. Нажмите «Точно отправить?» для подтверждения.`, 'info');
            confirmTimer = setTimeout(resetConfirm, 5000);
            return;
        }
        resetConfirm();

        setBusy(btn, true);
        try {
            const r = await compAsk({ action: 'yaForms:submit', surveyId: COMP_FORM.surveyId, values: data.values, dryRun: false });
            if (r.authorized === false) {
                compSetAuth('out', 'Сессия Яндекса истекла — войдите снова');
                toast('Нужно войти в Яндекс Формы', 'error');
                return;
            }
            if (!r.ok) {
                const detail = typeof r.error === 'string' ? r.error : JSON.stringify(r.error);
                throw new Error(`HTTP ${r.status}: ${detail}`);
            }
            toast(`Компенсация для ${data.summary.student} отправлена`, 'success');
            compClear(false);
        } catch (e) {
            const hint = $('compAuth').dataset.state === 'warn' ? ' Скорее всего, нет входа в Яндекс — нажмите «Войти».' : '';
            toast(`Не отправилось: ${e.message}.${hint}`, 'error');
        } finally {
            setBusy(btn, false);
            btn.disabled = !compAuthorized;
        }
    }

    /* ---------- Проверка честных оплат (billing-marketing) ---------- */

    const BOUNTY_URL = 'https://billing-marketing.skyeng.ru/api/frontend/v1/bounty/student-info';

    function bgFetch(url, requestOptions) {
        return compAsk({ action: 'getFetchRequest', fetchURL: url, requestOptions })
            .then(r => r.fetchansver);
    }

    /* Боковая панель результата: справа от окна, если не влезает — слева */
    function placeSide() {
        const r = win.getBoundingClientRect();
        const W = 300;
        win.classList.toggle('comp-side-left', r.right + W + 12 > window.innerWidth && r.left > W + 12);
    }

    async function compCheckHonest() {
        const id = $('compCheckId').value.trim();
        const box = $('compCheckResult');
        if (!id) { $('compCheckId').classList.add('is-invalid'); return; }

        const btn = $('compCheckBtn');
        setBusy(btn, true);
        placeSide();
        box.hidden = false;
        box.dataset.state = 'loading';
        box.textContent = 'Проверяю…';
        try {
            const text = await bgFetch(BOUNTY_URL, {
                method: 'POST',
                credentials: 'include',
                headers: { 'accept': 'application/json, text/plain, */*', 'content-type': 'application/json' },
                body: JSON.stringify({ studentId: Number(id) })
            });
            let json;
            try { json = JSON.parse(text); } catch { throw new Error('Ответ не JSON — возможно, нет входа в billing-marketing'); }
            const d = json?.data;
            if (!d) throw new Error(json?.message || 'Пустой ответ сервера');

            const yesNo = v => v ? '<b class="comp-yes">Имеет</b>' : '<b class="comp-no">Не имеет</b>';
            const honest = !!d.hasHonestPayment;
            box.dataset.state = honest ? 'honest' : 'nohonest';
            box.innerHTML = `
                <button type="button" class="comp-check-close" title="Скрыть">✕</button>
                <div class="comp-check-verdict">${honest
                    ? '✅ Есть честная оплата — компенсация через эту форму не нужна'
                    : '⚠️ Нет честных оплат — можно оформлять компенсацию'}</div>
                <div class="comp-check-grid">
                    <span>Имя</span><span>${esc(d.name || '—')}</span>
                    <span>Тип ученика</span><span>${esc(d.type || '—')}</span>
                    <span>Применение сертификата</span><span>${yesNo(d.hasCertificateApplied)}${d.certificateType ? ` (${esc(d.certificateType)})` : ''}</span>
                    <span>Первая оплата</span><span>${yesNo(honest)}</span>
                    <span>Тип продукта</span><span>${esc(d.productType || '—')}</span>
                </div>`;
            if (!$('compStudent').value) $('compStudent').value = id;
        } catch (e) {
            box.dataset.state = 'err';
            const msg = /HTTP 40[13]/.test(e.message)
                ? 'Нет доступа — откройте billing-marketing.skyeng.ru и войдите'
                : e.message;
            box.textContent = `Ошибка: ${msg}`;
        } finally {
            setBusy(btn, false);
        }
    }

    /* ---------- Создание окна (лениво, при первом открытии) ---------- */

    function hide() {
        if (win) win.style.display = 'none';
        resetConfirm();
    }

    function build() {
        win = typeof window.createWindow === 'function' || typeof createWindow === 'function'
            ? createWindow(WIN_ID, 'winTopComp', 'winLeftComp', WIN_HTML)
            : null;

        if (!win) {
            win = document.createElement('div');
            win.id = WIN_ID;
            win.className = 'extwindows';
            win.style.cssText = 'position:fixed;top:120px;left:295px;display:none;';
            win.innerHTML = WIN_HTML;
            document.body.appendChild(win);
        }
        win.classList.add('comp-window');

        ['compStudent', 'compService', 'compBudget'].forEach(id => {
            $(id).addEventListener('input', e => {
                const clean = e.target.value.replace(/\D+/g, '');
                if (clean !== e.target.value) e.target.value = clean;
                e.target.classList.remove('is-invalid');
            });
        });

        $('compAmount').addEventListener('input', e => {
            if (!e.target.dataset.free) e.target.value = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
            e.target.classList.remove('is-invalid');
        });

        win.addEventListener('change', e => {
            if (e.target.matches?.('select, input')) e.target.classList.remove('is-invalid');
            if (e.target.name === 'compOp') $('compOps').classList.remove('is-invalid');
        });

        $('compDept').addEventListener('change', e => lsSet(COMP_LS.dept, e.target.value));
        $('compEmail').addEventListener('change', e => lsSet(COMP_LS.email, e.target.value.trim()));
        $('compBudget').addEventListener('change', e => lsSet(COMP_LS.budget, e.target.value.trim()));

        /* «Другое» и баллы — количество с валютой, разрешаем любой текст */
        $('compBonus').addEventListener('change', () => {
            const label = $('compBonus').selectedOptions[0]?.textContent || '';
            const free = /друг|балл/i.test(label);
            $('compAmount').dataset.free = free ? '1' : '';
            $('compAmountHint').textContent = free
                ? 'Для «Другое» и баллов укажите количество и валюту: «300 рублей», «50 баллов».'
                : 'Число без единиц: «500», а не «500 рублей».';
        });

        $('compAddLink').addEventListener('click', () => {
            const ta = $('compComment');
            const link = location.href;
            if (!ta.value.includes(link)) ta.value = `Обращение — ${link}\n${ta.value}`.trimEnd() + (ta.value ? '' : '\n');
            ta.focus();
        });

        $('compCheckId').addEventListener('input', e => {
            const clean = e.target.value.replace(/\D+/g, '');
            if (clean !== e.target.value) e.target.value = clean;
            e.target.classList.remove('is-invalid');
        });
        $('compCheckId').addEventListener('keydown', e => { if (e.key === 'Enter') compCheckHonest(); });
        $('compCheckBtn').addEventListener('click', compCheckHonest);
        $('compCheckResult').addEventListener('click', e => {
            if (e.target.closest('.comp-check-close')) $('compCheckResult').hidden = true;
        });
        $('hideComp').addEventListener('click', hide);
        $('compRefresh').addEventListener('click', () => compCheckAuth(true));
        $('compSend').addEventListener('click', compSend);
        $('compClear').addEventListener('click', () => compClear(false));
        $('compLogin').addEventListener('click', async () => {
            try {
                await compAsk({ action: 'yaForms:login', surveyId: COMP_FORM.surveyId });
                compSetAuth('loading', 'Войдите во вкладке Яндекса — проверю, когда вернётесь');
            } catch (e) {
                toast(e.message, 'error');
            }
        });

        /* Вернулись на вкладку после входа — перепроверяем сами */
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && win.style.display !== 'none' && compAuthorized === false) {
                compCheckAuth(true);
            }
        }, window.cleanupRegistry?.signal ? { signal: window.cleanupRegistry.signal } : undefined);
    }

    /* ---------- Точка входа из меню ---------- */

    window.getCompensationPress = () => {
        if (!win) build();

        if (win.style.display !== 'none') {
            hide();
            return;
        }
        win.style.display = 'block';

        if (!$('compEmail').value) $('compEmail').value = lsGet(COMP_LS.email) || '';
        if (!$('compBudget').value) $('compBudget').value = lsGet(COMP_LS.budget) || COMP_FORM.budgetDefault;
        if (!compOptions.department.length) compApplyOptions(null);
        if (compAuthorized !== true) compCheckAuth(false);
    };
    console.log('[ChMAF] Компенсация загружена, press-функция:', typeof window.getCompensationPress);
})();
