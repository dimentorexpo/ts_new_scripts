/* =========================================================
   TSM Масс-фикс ревизий
   Перезагружает выбранные слайды комнаты в последней ревизии
   (step-store/load-step, last: true) сразу для списка учеников.
   Ответы учеников НЕ сбрасываются.
   ========================================================= */

const REVFIX_DELAY_MS = 150;

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
    <div class="tsm-fix-note">
        <span class="tsm-fix-note-icon">↻</span>
        <span>Обновляется <b>только ревизия</b>: слайд перезагружается в последней версии. Ответы учеников не сбрасываются.</span>
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
    slides: [],       // [{ stepUuid, name, section, theme }]
    roomStudents: [], // ID учеников из комнаты
    running: false,
    stopRequested: false,
    results: []       // [{ studentId, stepUuid, name, status, id, ok }]
};

/* ---------- Разбор ввода ---------- */

function revfixParseStudentIds() {
    const raw = document.getElementById("revfixStudents").value;
    const ids = raw.split(/[\s,;]+/).map((s) => s.replace(/\D/g, "")).filter(Boolean);
    return [...new Set(ids)];
}

function revfixSelectedSlides() {
    const uuids = Array.from(document.querySelectorAll("#revfixSlides .tsm-fix-slide input:checked"))
        .map((input) => input.closest(".tsm-fix-slide").dataset.stepuuid);
    return revfixState.slides.filter((slide) => uuids.includes(slide.stepUuid));
}

function revfixUpdateControls() {
    const slides = revfixSelectedSlides();
    const students = revfixParseStudentIds();
    const total = slides.length * students.length;
    const button = document.getElementById("revfixRun");

    document.getElementById("revfixSlidesCounter").textContent = revfixState.slides.length
        ? `${slides.length}/${revfixState.slides.length}` : "";
    document.getElementById("revfixStudentsCounter").textContent = students.length ? String(students.length) : "";

    document.getElementById("revfixStudents").readOnly = revfixState.running;
    document.getElementById("revfixSlides").classList.toggle("is-locked", revfixState.running);
    document.getElementById("revfixLoad").disabled = revfixState.running;

    if (revfixState.running) {
        button.disabled = false;
        button.textContent = "Остановить";
        button.classList.add("tsm-btn-stop");
        return;
    }
    button.classList.remove("tsm-btn-stop");
    button.disabled = total === 0;
    if (!revfixState.slides.length) button.textContent = "Загрузите комнату";
    else if (!slides.length) button.textContent = "Выберите слайды";
    else if (!students.length) button.textContent = "Добавьте ID учеников";
    else button.textContent = `Обновить ревизии (${total})`;

    /* Состояние «выбрать все» в шапках секций */
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
            const themeRow = slide.theme !== lastTheme ? `<div class="tsm-fix-theme" title="${escapeHTML(slide.theme)}">${escapeHTML(slide.theme)}</div>` : "";
            lastTheme = slide.theme;
            const disabled = !slide.stepUuid;
            return `${themeRow}<label class="tsm-fix-slide${disabled ? " is-disabled" : ""}" data-stepuuid="${escapeHTML(slide.stepUuid)}" title="${disabled ? "У слайда нет stepUuid" : "stepUuid: " + escapeHTML(slide.stepUuid)}">
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
        createNotify("Дождитесь окончания обновления", "error");
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
        let index = firstStudent ? (data.lessonCards || []).findIndex((c) => c.userId === firstStudent.userId) : -1;
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

/* ---------- Запуск ---------- */

function revfixSetProgress(done, total, failed) {
    const percent = total ? Math.round((done / total) * 100) : 0;
    document.getElementById("revfixProgressBar").style.width = `${percent}%`;
    document.getElementById("revfixProgressBar").dataset.tone = failed ? "warn" : (done === total ? "ok" : "");
    document.getElementById("revfixProgressLabel").textContent =
        `${done} / ${total}${failed ? ` — ошибок: ${failed}` : ""}`;
}

function revfixRenderResults() {
    const box = document.getElementById("revfixResults");
    const results = revfixState.results;
    if (!results.length) {
        box.innerHTML = "";
        return;
    }
    const failed = results.filter((r) => !r.ok);
    const rows = results.map((r) => `<tr class="${r.ok ? "" : "tsm-fix-row-fail"}">
        <td>${escapeHTML(r.studentId)}</td>
        <td class="tsm-fix-cell-name" title="${escapeHTML(r.stepUuid)}">${escapeHTML(r.name)}</td>
        <td>${escapeHTML(r.status)}</td>
        <td>${r.ok ? escapeHTML(r.id) : `<span class="tsm-fix-err">${escapeHTML(r.error || "ошибка")}</span>`}</td>
    </tr>`).join("");

    box.innerHTML = `<div class="tsm-fix-results-head">
            <span class="tsm-fix-stat tsm-fix-stat-ok">Обновлено: ${results.length - failed.length}</span>
            ${failed.length ? `<span class="tsm-fix-stat tsm-fix-stat-bad">Ошибок: ${failed.length}</span>` : ""}
            <span class="tsm-toolbar-spacer"></span>
            ${failed.length && !revfixState.running ? `<button type="button" class="tsm-btn" id="revfixRetry">Повторить ошибки</button>` : ""}
            <button type="button" class="tsm-btn" id="revfixCopyReport">Скопировать отчёт</button>
        </div>
        <div class="tsm-table-wrapper tsm-fix-results-table">
            <table class="tsm-table">
                <thead><tr><th>Ученик</th><th>Слайд</th><th>HTTP</th><th>id ревизии</th></tr></thead>
                <tbody>${rows}</tbody>
            </table>
        </div>`;
}

async function revfixRun(pairs) {
    const { room } = revfixState;
    revfixState.running = true;
    revfixState.stopRequested = false;
    revfixState.results = [];
    document.getElementById("revfixProgressBox").style.display = "";
    document.getElementById("revfixProgressWrap").classList.add("is-running");
    revfixUpdateControls();
    revfixSetProgress(0, pairs.length, 0);

    const url = `https://api-${room.subject}.skyeng.ru/api/teacher-cabinet/v1/step-store/load-step`;
    let failed = 0;

    for (let i = 0; i < pairs.length; i++) {
        if (revfixState.stopRequested) break;
        const { studentId, slide } = pairs[i];
        const result = { studentId, stepUuid: slide.stepUuid, name: slide.name, status: "—", id: null, ok: false, slide };
        try {
            const res = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ studentId: Number(studentId), stepUuid: slide.stepUuid, last: true })
            });
            const body = await res.json().catch(() => null);
            result.status = res.status;
            result.id = body?.id ?? null;
            result.ok = res.ok && result.id != null;
            if (!result.ok) result.error = body?.message || body?.error || (res.ok ? "нет id в ответе" : `HTTP ${res.status}`);
        } catch (err) {
            result.status = "сеть";
            result.error = err.message;
        }
        if (!result.ok) failed++;
        revfixState.results.push(result);
        revfixSetProgress(i + 1, pairs.length, failed);
        revfixRenderResults();
        await new Promise((r) => setTimeout(r, REVFIX_DELAY_MS));
    }

    const stopped = revfixState.stopRequested;
    revfixState.running = false;
    document.getElementById("revfixProgressWrap").classList.remove("is-running");
    revfixUpdateControls();
    revfixRenderResults();
    console.table(revfixState.results.map(({ slide, ...rest }) => rest));

    const done = revfixState.results.length;
    if (stopped) createNotify(`Остановлено: обработано ${done} из ${pairs.length}`, "error");
    else if (failed) createNotify(`Ревизии обновлены: ${done - failed} из ${done}. Ошибок: ${failed}`, "error");
    else createNotify(`Ревизии обновлены: ${done} из ${done}`);
}

async function revfixStart() {
    if (revfixState.running) {
        revfixState.stopRequested = true;
        return;
    }
    const slides = revfixSelectedSlides();
    const students = revfixParseStudentIds();
    if (!revfixState.room || !slides.length || !students.length) return;

    const total = slides.length * students.length;
    const confirmed = await tsmConfirm({
        title: "Масс-фикс ревизий",
        message: `Слайдов: ${slides.length}, учеников: ${students.length}, всего запросов: ${total}.\nПредмет: ${revfixState.room.subject}.\n\nСлайды перезагрузятся в последней ревизии. Ответы учеников не сбрасываются.`,
        okText: "Обновить ревизии"
    });
    if (!confirmed) return;

    const pairs = [];
    students.forEach((studentId) => slides.forEach((slide) => pairs.push({ studentId, slide })));
    revfixRun(pairs);
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
        const lines = ["studentId\tslide\tstepUuid\tstatus\tid"]
            .concat(revfixState.results.map((r) => [r.studentId, r.name, r.stepUuid, r.status, r.ok ? r.id : (r.error || "")].join("\t")));
        await copyWithNotify(lines.join("\n"), "Отчёт скопирован — можно вставить в таблицу");
    } else if (event.target.id === "revfixRetry") {
        const pairs = revfixState.results.filter((r) => !r.ok).map((r) => ({ studentId: r.studentId, slide: r.slide }));
        if (!pairs.length) return;
        const confirmed = await tsmConfirm({
            title: "Повторить ошибки",
            message: `Повторно отправить ${pairs.length} запросов, завершившихся ошибкой?`,
            okText: "Повторить"
        });
        if (confirmed) revfixRun(pairs);
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