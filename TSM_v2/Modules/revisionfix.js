/* =========================================================
   TSM Масс-фикс слайдов
   Две операции над выбранными слайдами комнаты для списка учеников:
   1) load-step  — обновление ревизии (last: true), ответы НЕ трогаются;
   2) delete blocks — удаление сохранённых ответов (store-blocks/delete).
      contentGroupId = <id из student-cabinet load-step по stepUuid>_<variantId>
   ========================================================= */

const REVFIX_DELAY_MS = 150;     // пауза между учениками/слайдами
const REVFIX_OP_DELAY_MS = 150;  // пауза между load-step и delete для одной пары
const REVFIX_RESET_WORD = "СБРОС";

const win_revisionFix = `
<div class="tsm-window-grab">
    <div class="tsm-window-header">
        <span class="tsm-window-title">🛠 Масс-фикс ревизий</span>
        <span class="tsm-toolbar-spacer"></span>
        <button type="button" class="tsm-btn tsm-btn-icon" id="RefreshRevisionFix" title="Подставить ссылку текущей страницы">♻</button>
        <button type="button" class="tsm-btn tsm-btn-hide tsm-btn-icon" id="hideRevisionFix" title="Скрыть" aria-label="Скрыть">✕</button>
    </div>
    <div class="tsm-input-group">
        <input id="revfixRoomLink" class="tsm-input" autocomplete="off" placeholder="Ссылка на комнату">
        <button type="button" class="tsm-btn" id="revfixLoad">Загрузить</button>
    </div>

    <div class="tsm-fix-ops">
        <label class="tsm-fix-op" data-op="load">
            <span class="tsm-custom-checkbox"><input type="checkbox" id="revfixOpLoad" checked><span class="tsm-checkmark"></span></span>
            <span class="tsm-fix-op-body">
                <span class="tsm-fix-op-title">↻ Обновить ревизию <code>load-step</code></span>
                <span class="tsm-fix-op-desc">Слайд перезагружается в последней версии. Прогресс и ответы учеников сохраняются.</span>
            </span>
        </label>
        <label class="tsm-fix-op tsm-fix-op-danger" data-op="delete">
            <span class="tsm-custom-checkbox"><input type="checkbox" id="revfixOpDelete"><span class="tsm-checkmark"></span></span>
            <span class="tsm-fix-op-body">
                <span class="tsm-fix-op-title">⚠ Сбросить ответы <code>delete blocks</code></span>
                <span class="tsm-fix-op-desc">Удаляет все введённые ответы учеников на выбранных слайдах. Восстановить их нельзя.</span>
            </span>
        </label>
    </div>

    <div class="tsm-fix-layout">
        <section class="tsm-fix-col">
            <div class="tsm-fix-col-head">
                <span>Слайды</span>
                <span id="revfixSlidesCounter" class="tsm-counter"></span>
                <span id="revfixSubject" class="tsm-fix-subject"></span>
            </div>
            <div id="revfixSlides" class="tsm-fix-slides"></div>
        </section>
        <section class="tsm-fix-col tsm-fix-col-side">
            <div class="tsm-fix-col-head">
                <span>ID учеников</span>
                <span id="revfixStudentsCounter" class="tsm-counter"></span>
            </div>
            <textarea id="revfixStudents" class="tsm-textarea" spellcheck="false" placeholder="44128433&#10;44128434&#10;44128435"></textarea>
            <div class="tsm-fix-hint">Каждый ID с новой строки. Ученики комнаты подставляются автоматически, если поле пустое.</div>
            <button type="button" class="tsm-btn tsm-btn-primary tsm-fix-run" id="revfixRun" disabled>Выберите слайды</button>
        </section>
    </div>
    <div id="revfixProgressBox" class="tsm-fix-progress" style="display:none;">
        <div class="tsm-progress-wrapper" id="revfixProgressWrap">
            <div id="revfixProgressBar" class="tsm-progress-base" style="width:0%;"></div>
            <span id="revfixProgressLabel" class="tsm-progress-label"></span>
        </div>
    </div>
    <div id="revfixResults"></div>
</div>`;

const wintRevisionFix = createTSMWindow("AFMS_RevisionFix", "winTopRevisionFix", "winLeftRevisionFix", win_revisionFix);
wintRevisionFix.className = "tsm-window tsm-window-revfix";

const revfixState = {
    room: null,       // { subject, hash, isTest }
    slides: [],       // [{ stepUuid, variantId, name, section, theme }]
    roomStudents: [],
    running: false,
    stopRequested: false,
    ops: { load: true, delete: false }, // операции последнего запуска (для «Повторить ошибки»)
    results: []       // [{ studentId, slide, load: {status,id,ok,error}, del: {status,ok,error,cgId} }]
};

/* ---------- Ввод ---------- */

function revfixParseStudentIds() {
    const raw = document.getElementById("revfixStudents").value;
    return [...new Set(raw.split(/[\s,;]+/).map((s) => s.replace(/\D/g, "")).filter(Boolean))];
}

function revfixSelectedSlides() {
    const uuids = new Set(Array.from(document.querySelectorAll("#revfixSlides .tsm-fix-slide input:checked"))
        .map((input) => input.closest(".tsm-fix-slide").dataset.stepuuid));
    return revfixState.slides.filter((slide) => uuids.has(slide.stepUuid));
}

function revfixSelectedOps() {
    return {
        load: document.getElementById("revfixOpLoad").checked,
        delete: document.getElementById("revfixOpDelete").checked
    };
}

function revfixUpdateControls() {
    const slides = revfixSelectedSlides();
    const students = revfixParseStudentIds();
    const ops = revfixSelectedOps();
    const pairs = slides.length * students.length;
    const button = document.getElementById("revfixRun");

    document.getElementById("revfixSlidesCounter").textContent = revfixState.slides.length
        ? `${slides.length}/${revfixState.slides.length}` : "";
    document.getElementById("revfixStudentsCounter").textContent = students.length ? String(students.length) : "";

    /* Опасный режим подсвечивает всё окно, чтобы его нельзя было не заметить */
    wintRevisionFix.classList.toggle("tsm-revfix-danger", ops.delete);
    document.querySelectorAll(".tsm-fix-op").forEach((op) => {
        op.classList.toggle("is-on", ops[op.dataset.op]);
    });

    const lock = revfixState.running;
    document.getElementById("revfixStudents").readOnly = lock;
    document.getElementById("revfixSlides").classList.toggle("is-locked", lock);
    document.getElementById("revfixLoad").disabled = lock;
    document.querySelectorAll(".tsm-fix-op input").forEach((input) => { input.disabled = lock; });

    button.classList.remove("tsm-btn-stop", "tsm-fix-run-danger");
    if (revfixState.running) {
        button.disabled = false;
        button.textContent = "Остановить";
        button.classList.add("tsm-btn-stop");
        return;
    }

    button.disabled = pairs === 0 || (!ops.load && !ops.delete);
    if (!revfixState.slides.length) button.textContent = "Загрузите комнату";
    else if (!slides.length) button.textContent = "Выберите слайды";
    else if (!students.length) button.textContent = "Добавьте ID учеников";
    else if (!ops.load && !ops.delete) button.textContent = "Выберите операцию";
    else if (ops.delete) {
        button.textContent = ops.load ? `Обновить и сбросить (${pairs})` : `Сбросить ответы (${pairs})`;
        button.classList.add("tsm-fix-run-danger");
    } else button.textContent = `Обновить ревизии (${pairs})`;

    document.querySelectorAll("#revfixSlides .tsm-fix-section").forEach((section) => {
        const boxes = Array.from(section.querySelectorAll(".tsm-fix-slide input:not(:disabled)"));
        const toggle = section.querySelector(".tsm-fix-section-toggle input");
        const checked = boxes.filter((b) => b.checked).length;
        toggle.checked = boxes.length > 0 && checked === boxes.length;
        toggle.indeterminate = checked > 0 && checked < boxes.length;
    });
}

/* ---------- Загрузка комнаты ---------- */

function revfixCollectSlides(block, sectionTitle) {
    const slides = [];
    (block?.themes || []).forEach((theme) => {
        (theme.cards || []).forEach((card) => {
            slides.push({
                stepUuid: card.stepUuid || "",
                variantId: String(card.variantId ?? theme.variantId ?? block.variantId ?? ""),
                name: card.name || "Без названия",
                section: sectionTitle,
                theme: theme.name || ""
            });
        });
    });
    return slides;
}

function revfixRenderSlides() {
    const container = document.getElementById("revfixSlides");
    const sections = ["🎓 План урока", "💼 План домашки"];
    const html = sections.map((title) => {
        const slides = revfixState.slides.filter((s) => s.section === title);
        if (!slides.length) return "";
        let lastTheme = null;
        const rows = slides.map((slide, i) => {
            const themeRow = slide.theme !== lastTheme
                ? `<div class="tsm-fix-theme" title="${escapeHTML(slide.theme)}">${escapeHTML(slide.theme)}</div>` : "";
            lastTheme = slide.theme;
            const disabled = !slide.stepUuid;
            const hint = disabled ? "У слайда нет stepUuid"
                : `stepUuid: ${slide.stepUuid}\nvariantId: ${slide.variantId || "не найден — сброс ответов недоступен"}`;
            return `${themeRow}<label class="tsm-fix-slide${disabled ? " is-disabled" : ""}" data-stepuuid="${escapeHTML(slide.stepUuid)}" data-variantid="${escapeHTML(slide.variantId)}" title="${escapeHTML(hint)}">
                <span class="tsm-custom-checkbox"><input type="checkbox" ${disabled ? "disabled" : ""}><span class="tsm-checkmark"></span></span>
                <span class="tsm-fix-slide-num">${i + 1}</span>
                <span class="tsm-fix-slide-name">${escapeHTML(slide.name)}</span>
                <span class="tsm-fix-slide-uuid">${disabled ? "нет uuid" : escapeHTML(slide.stepUuid.slice(0, 8))}</span>
            </label>`;
        }).join("");
        return `<div class="tsm-fix-section">
            <label class="tsm-fix-section-head">
                <span class="tsm-custom-checkbox tsm-fix-section-toggle" title="Выбрать все слайды раздела"><input type="checkbox"><span class="tsm-checkmark"></span></span>
                <span class="tsm-fix-section-title">${escapeHTML(title)}</span>
                <span class="tsm-fix-section-count">${slides.length}</span>
            </label>
            ${rows}
        </div>`;
    }).join("");

    container.innerHTML = html || '<div class="tsm-empty">В комнате нет слайдов</div>';
    revfixUpdateControls();
}

async function revfixLoadRoom() {
    if (revfixState.running) {
        createNotify("Дождитесь окончания операции", "error");
        return;
    }
    const button = document.getElementById("revfixLoad");
    const container = document.getElementById("revfixSlides");
    let room;
    try {
        room = parseKidsRoomLink(document.getElementById("revfixRoomLink").value);
    } catch (err) {
        container.innerHTML = `<div class="tsm-empty">${escapeHTML(err.message)}</div>`;
        return;
    }

    container.innerHTML = '<div class="tsm-empty tsm-empty-loading">Загружаем слайды…</div>';
    setBusy(button, true);
    try {
        const data = await fetchJson(`https://api-${room.subject}.skyeng.ru/api/v2/rooms/${room.hash}`);
        const participants = data.participants || [];
        const firstStudent = participants.find((p) => p.role === "student");
        let index = firstStudent ? (data.lessonCards || []).findIndex((c) => String(c.userId) === String(firstStudent.userId)) : -1;
        if (index < 0) index = 0;

        revfixState.room = room;
        revfixState.roomStudents = participants.filter((p) => p.role === "student").map((p) => String(p.userId));
        revfixState.slides = [
            ...revfixCollectSlides(data.lessonCards?.[index], "🎓 План урока"),
            ...revfixCollectSlides(data.homeworkCards?.[index], "💼 План домашки")
        ];
        document.getElementById("revfixSubject").textContent = room.subject;

        const studentsField = document.getElementById("revfixStudents");
        if (!studentsField.value.trim() && revfixState.roomStudents.length) {
            studentsField.value = revfixState.roomStudents.join("\n");
        }
        revfixRenderSlides();
    } catch (err) {
        console.error("[TSM Масс-фикс]", err);
        revfixState.slides = [];
        container.innerHTML = `<div class="tsm-empty">Не удалось загрузить комнату (${escapeHTML(err.message)}). Проверьте ссылку и авторизацию.</div>`;
        revfixUpdateControls();
    } finally {
        setBusy(button, false);
    }
}

/* ---------- Запросы ---------- */

function revfixApi(path) {
    return `https://api-${revfixState.room.subject}.skyeng.ru${path}`;
}

/* Обновление ревизии слайда у ученика (ответы сохраняются) */
async function revfixLoadStep(studentId, slide) {
    const payload = { studentId: Number(studentId), stepUuid: slide.stepUuid, last: true };
    if (slide.variantId) payload.variantId = slide.variantId;
    const res = await fetch(revfixApi("/api/teacher-cabinet/v1/step-store/load-step"), {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => null);
    const id = body?.id ?? null;
    const ok = res.ok && id != null;
    return { status: res.status, id, ok, error: ok ? "" : (body?.message || body?.error || (res.ok ? "нет id в ответе" : `HTTP ${res.status}`)) };
}

/* ContentGroupID слайда: id из student-cabinet load-step по stepUuid (общий для всех учеников) */
async function revfixResolveContentGroupId(slide) {
    const res = await fetch(revfixApi("/api/student-cabinet/v1/step-store/load-step"), {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: { "accept": "application/json", "content-type": "application/json" },
        body: JSON.stringify({ stepUuid: slide.stepUuid })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.id == null) throw new Error("в ответе нет id");
    return `${data.id}_${slide.variantId}`;
}

/* Удаление сохранённых ответов ученика на слайде */
async function revfixDeleteBlocks(studentId, contentGroupId) {
    const res = await fetch(revfixApi("/api/v1/store-blocks/delete"), {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: Number(studentId), contentGroupId, roomHash: revfixState.room.hash })
    });
    return { status: res.status, ok: res.ok, error: res.ok ? "" : `HTTP ${res.status}` };
}

/* ---------- Прогресс и результаты ---------- */

function revfixSetProgress(done, total, failed, label) {
    const percent = total ? Math.round((done / total) * 100) : 0;
    const bar = document.getElementById("revfixProgressBar");
    bar.style.width = `${percent}%`;
    const tone = revfixState.ops.delete ? "bad" : "";
    bar.dataset.tone = failed ? "warn" : (done === total && total ? "ok" : tone);
    document.getElementById("revfixProgressLabel").textContent =
        label || `${done} / ${total}${failed ? ` — ошибок: ${failed}` : ""}`;
}

function revfixOpCell(op, kind) {
    if (!op) return '<span class="tsm-text-xs">—</span>';
    if (op.ok) return kind === "load"
        ? `<span class="tsm-fix-ok">${escapeHTML(op.id)}</span>`
        : '<span class="tsm-fix-ok">сброшены</span>';
    return `<span class="tsm-fix-err" title="${escapeHTML(op.error)}">${escapeHTML(op.error || "ошибка")}</span>`;
}

function revfixRowFailed(r) {
    return (r.load && !r.load.ok) || (r.del && !r.del.ok);
}

function revfixRenderResults() {
    const box = document.getElementById("revfixResults");
    const results = revfixState.results.filter(Boolean);
    if (!results.length) {
        box.innerHTML = "";
        return;
    }
    const loadOk = results.filter((r) => r.load?.ok).length;
    const delOk = results.filter((r) => r.del?.ok).length;
    const failed = results.filter(revfixRowFailed).length;
    const { ops } = revfixState;

    const rows = results.map((r) => `<tr class="${revfixRowFailed(r) ? "tsm-fix-row-fail" : ""}">
        <td>${escapeHTML(r.studentId)}</td>
        <td class="tsm-fix-cell-name" title="${escapeHTML(r.slide.stepUuid)}">${escapeHTML(r.slide.name)}</td>
        ${ops.load ? `<td>${revfixOpCell(r.load, "load")}</td>` : ""}
        ${ops.delete ? `<td>${revfixOpCell(r.del, "delete")}</td>` : ""}
    </tr>`).join("");

    box.innerHTML = `<div class="tsm-fix-results-head">
            ${ops.load ? `<span class="tsm-fix-stat tsm-fix-stat-ok" title="Ревизий обновлено">↻ Ревизии: ${loadOk}</span>` : ""}
            ${ops.delete ? `<span class="tsm-fix-stat tsm-fix-stat-del" title="Ответов сброшено">⚠ Ответы: ${delOk}</span>` : ""}
            ${failed ? `<span class="tsm-fix-stat tsm-fix-stat-bad" title="Пар ученик × слайд с ошибками">✕ Ошибки: ${failed}</span>` : ""}
            <span class="tsm-toolbar-spacer"></span>
            ${failed && !revfixState.running ? '<button type="button" class="tsm-btn tsm-fix-head-btn" id="revfixRetry">Повторить ошибки</button>' : ""}
            <button type="button" class="tsm-btn tsm-fix-head-btn" id="revfixCopyReport">Отчёт в буфер</button>
            <button type="button" class="tsm-btn tsm-fix-head-btn" id="revfixDownloadCsv">Скачать CSV</button>
        </div>
        <div class="tsm-table-wrapper tsm-fix-results-table">
            <table class="tsm-table">
                <thead><tr><th>Ученик</th><th>Слайд</th>${ops.load ? "<th>Ревизия (id)</th>" : ""}${ops.delete ? "<th>Ответы</th>" : ""}</tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

/* ---------- Запуск ---------- */

const revfixSleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function revfixRun(pairs, ops) {
    revfixState.running = true;
    revfixState.stopRequested = false;
    revfixState.ops = ops;
    revfixState.results = new Array(pairs.length);
    document.getElementById("revfixProgressBox").style.display = "";
    document.getElementById("revfixProgressWrap").classList.add("is-running");
    revfixUpdateControls();

    /* 1. Для сброса ответов сначала получаем contentGroupId каждого слайда (один раз на слайд) */
    const cgIds = new Map();
    const cgErrors = new Map();
    if (ops.delete) {
        const slides = [...new Map(pairs.map((p) => [p.slide.stepUuid, p.slide])).values()];
        for (let i = 0; i < slides.length && !revfixState.stopRequested; i++) {
            revfixSetProgress(0, pairs.length, 0, `Получаем contentGroupId: ${i + 1} / ${slides.length}`);
            try {
                cgIds.set(slides[i].stepUuid, await revfixResolveContentGroupId(slides[i]));
            } catch (err) {
                cgErrors.set(slides[i].stepUuid, `contentGroupId: ${err.message}`);
            }
            await revfixSleep(REVFIX_DELAY_MS);
        }
    }

    /* 2. Основной проход: конкурентный пул воркеров (лимит 3-4 одновременных запроса) */
    const CONCURRENCY = 4;
    let nextIndex = 0;
    let completed = 0;
    let failed = 0;

    const workers = Array.from({ length: Math.min(CONCURRENCY, pairs.length) }, async () => {
        while (nextIndex < pairs.length && !revfixState.stopRequested) {
            const currentIndex = nextIndex++;
            const { studentId, slide } = pairs[currentIndex];
            const row = { studentId, slide, load: null, del: null };

            if (ops.load && !revfixState.stopRequested) {
                try {
                    row.load = await revfixLoadStep(studentId, slide);
                } catch (err) {
                    row.load = { status: "сеть", ok: false, error: err.message };
                }
                if (ops.delete && !revfixState.stopRequested) await revfixSleep(REVFIX_OP_DELAY_MS);
            }

            if (ops.delete && !revfixState.stopRequested) {
                const cgId = cgIds.get(slide.stepUuid);
                if (!cgId) {
                    row.del = { ok: false, error: cgErrors.get(slide.stepUuid) || "нет contentGroupId" };
                } else {
                    try {
                        row.del = { ...(await revfixDeleteBlocks(studentId, cgId)), cgId };
                    } catch (err) {
                        row.del = { status: "сеть", ok: false, error: err.message, cgId };
                    }
                }
            }

            if (revfixRowFailed(row)) failed++;
            revfixState.results[currentIndex] = row;
            completed++;
            revfixSetProgress(completed, pairs.length, failed);
            revfixRenderResults();
            await revfixSleep(REVFIX_DELAY_MS);
        }
    });

    await Promise.all(workers);
    revfixState.results = revfixState.results.filter(Boolean);

    const stopped = revfixState.stopRequested;
    revfixState.running = false;
    document.getElementById("revfixProgressWrap").classList.remove("is-running");
    revfixUpdateControls();
    revfixRenderResults();
    console.table(revfixState.results.map((r) => ({
        studentId: r.studentId, slide: r.slide.name, stepUuid: r.slide.stepUuid,
        loadStatus: r.load?.status, loadId: r.load?.id, deleteStatus: r.del?.status, contentGroupId: r.del?.cgId
    })));

    const done = revfixState.results.length;
    if (stopped) createNotify(`Остановлено: обработано ${done} из ${pairs.length}`, "error");
    else if (failed) createNotify(`Готово с ошибками: ${failed} из ${done}. Их можно повторить`, "error");
    else createNotify(ops.delete ? `Готово: ответы сброшены у ${done} пар ученик × слайд` : `Ревизии обновлены: ${done} из ${done}`);
}

/* Двухступенчатое подтверждение для сброса ответов: диалог + ввод контрольного слова */
async function revfixConfirm(slides, students, ops) {
    const total = slides.length * students.length;
    const subject = revfixState.room.subject;

    if (!ops.delete) {
        return tsmConfirm({
            title: "Обновить ревизии",
            message: `Слайдов: ${slides.length}, учеников: ${students.length}, всего запросов: ${total}.\nПредмет: ${subject}.\n\nСлайды перезагрузятся в последней ревизии. Ответы учеников не сбрасываются.`,
            okText: "Обновить ревизии"
        });
    }

    const noVariant = slides.filter((s) => !s.variantId);
    if (noVariant.length) {
        createNotify(`Сброс невозможен: у ${noVariant.length} слайд(ов) нет variantId — «${noVariant[0].name}». Снимите их с выбора`, "error");
        return false;
    }

    const first = await tsmConfirm({
        title: "⚠ Сброс ответов учеников",
        message: `Будут БЕЗВОЗВРАТНО удалены введённые ответы:\nслайдов — ${slides.length}, учеников — ${students.length}, всего — ${total} пар.\nКомната: ${revfixState.room.hash} (${subject}).\n${ops.load ? "\nПеред сбросом каждому слайду обновится ревизия." : ""}\n\nУбедитесь, что список учеников и слайдов верный.`,
        okText: "Продолжить",
        danger: true
    });
    if (!first) return false;

    const typed = await tsmPrompt({
        title: "Подтвердите сброс",
        message: `Чтобы удалить ответы у ${students.length} учеников, введите слово ${REVFIX_RESET_WORD}`,
        placeholder: REVFIX_RESET_WORD,
        okText: "Сбросить ответы",
        danger: true
    });
    if (typed == null) return false;
    if (typed.trim().toUpperCase() !== REVFIX_RESET_WORD) {
        createNotify("Контрольное слово не совпало — сброс отменён", "error");
        return false;
    }
    return true;
}

async function revfixStart() {
    if (revfixState.running) {
        revfixState.stopRequested = true;
        return;
    }
    const slides = revfixSelectedSlides();
    const students = revfixParseStudentIds();
    const ops = revfixSelectedOps();
    if (!revfixState.room || !slides.length || !students.length || (!ops.load && !ops.delete)) return;

    if (!(await revfixConfirm(slides, students, ops))) return;

    const pairs = [];
    students.forEach((studentId) => slides.forEach((slide) => pairs.push({ studentId, slide })));
    revfixRun(pairs, ops);
}

/* ---------- Обработчики ---------- */

const revfixSlidesEl = document.getElementById("revfixSlides");
revfixSlidesEl.addEventListener("change", (event) => {
    const toggle = event.target.closest(".tsm-fix-section-toggle input");
    if (toggle) {
        toggle.closest(".tsm-fix-section").querySelectorAll(".tsm-fix-slide input:not(:disabled)")
            .forEach((input) => { input.checked = toggle.checked; });
    }
    revfixUpdateControls();
});

document.getElementById("revfixOpLoad").addEventListener("change", revfixUpdateControls);
document.getElementById("revfixOpDelete").addEventListener("change", revfixUpdateControls);
document.getElementById("revfixStudents").addEventListener("input", revfixUpdateControls);
document.getElementById("revfixRun").onclick = revfixStart;
document.getElementById("revfixLoad").onclick = revfixLoadRoom;
document.getElementById("revfixRoomLink").addEventListener("keydown", (e) => { if (e.key === "Enter") revfixLoadRoom(); });
document.getElementById("RefreshRevisionFix").onclick = () => {
    document.getElementById("revfixRoomLink").value = document.URL;
    revfixLoadRoom();
};
document.getElementById("hideRevisionFix").onclick = () => { wintRevisionFix.style.display = "none"; };

document.getElementById("revfixResults").addEventListener("click", async (event) => {
    if (event.target.id === "revfixCopyReport") {
        const lines = ["studentId\tslide\tstepUuid\tloadStatus\trevisionId\tdeleteStatus\tcontentGroupId"]
            .concat(revfixState.results.map((r) => [
                r.studentId, r.slide.name, r.slide.stepUuid,
                r.load ? (r.load.ok ? r.load.status : r.load.error) : "",
                r.load?.id ?? "",
                r.del ? (r.del.ok ? r.del.status : r.del.error) : "",
                r.del?.cgId ?? ""
            ].join("\t")));
        await copyWithNotify(lines.join("\n"), "Отчёт скопирован — можно вставить в таблицу");
    } else if (event.target.id === "revfixDownloadCsv") {
        const results = revfixState.results.filter(Boolean);
        const escapeCsv = (val) => {
            const s = String(val ?? "");
            if (/[";,\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
        };
        const headers = ["studentId", "slide", "stepUuid", "loadStatus", "revisionId", "deleteStatus", "contentGroupId"];
        const rows = results.map((r) => [
            r.studentId,
            r.slide.name,
            r.slide.stepUuid,
            r.load ? (r.load.ok ? r.load.status : r.load.error) : "",
            r.load?.id ?? "",
            r.del ? (r.del.ok ? r.del.status : r.del.error) : "",
            r.del?.cgId ?? ""
        ]);
        const csvContent = "\uFEFF" + [headers.map(escapeCsv).join(";")]
            .concat(rows.map((row) => row.map(escapeCsv).join(";")))
            .join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        link.href = url;
        link.download = `tsm-revfix-report-${timestamp}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        createNotify("CSV-отчёт скачан");
    } else if (event.target.id === "revfixRetry") {
        const failedRows = revfixState.results.filter(revfixRowFailed);
        if (!failedRows.length) return;
        const ops = revfixState.ops;
        const confirmed = await tsmConfirm({
            title: "Повторить ошибки",
            message: `Повторно выполнить ${failedRows.length} пар ученик × слайд с теми же операциями`
                + (ops.delete ? ", включая СБРОС ОТВЕТОВ." : ".")
                + "\nОперации, которые уже прошли успешно, тоже повторятся для этих пар.",
            okText: "Повторить",
            danger: ops.delete
        });
        if (confirmed) revfixRun(failedRows.map((r) => ({ studentId: r.studentId, slide: r.slide })), ops);
    }
});

function OpenRevisionFix() {
    if (!toggleTSMWindow(wintRevisionFix)) return;
    const input = document.getElementById("revfixRoomLink");
    if (looksLikeKidsRoom(document.URL) && !revfixState.running) {
        input.value = document.URL;
        revfixLoadRoom();
    } else if (!revfixState.slides.length) {
        revfixSlidesEl.innerHTML = '<div class="tsm-empty">Откройте комнату или вставьте ссылку на неё и нажмите «Загрузить»</div>';
        revfixUpdateControls();
        input.focus();
    }
}