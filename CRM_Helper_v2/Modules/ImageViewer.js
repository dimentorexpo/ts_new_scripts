/**
 * ImageViewer.js — собственный полноэкранный просмотрщик изображений.
 *
 * Замена сторонней библиотеки Lightbox (которая тянула за собой весь jQuery).
 * Зависимостей нет — только vanilla JS + инжект собственных стилей.
 *
 * Как работает:
 *  1. content.js превращает ссылки на скриншоты в превью и вешает на них
 *     класс .crm-screenshot-link;
 *  2. этот модуль через делегирование перехватывает клики по таким ссылкам,
 *     отменяет переход и открывает картинку в полноэкранном оверлее;
 *  3. навигация: стрелки ←/→ или кнопки, закрытие: Esc / клик по фону / ✕;
 *     соседние картинки предзагружаются для мгновенного листания;
 *  4. зум: колесо мыши (к точке курсора), клик по картинке — 1x/2.5x,
 *     при увеличении картинку можно перетаскивать мышью.
 */
(function () {
    'use strict';

    const MAX_ZOOM = 6;
    const CLICK_ZOOM = 2.5;

    /* ============================================================
     *  СТИЛИ ПРОСМОТРЩИКА (инжектятся один раз)
     * ============================================================ */
    const viewerStyles = document.createElement('style');
    viewerStyles.textContent = `
        #crmViewerOverlay {
            position: fixed; inset: 0; z-index: 2147483646;
            background: rgba(8, 11, 16, 0.9);
            display: none;
            align-items: center; justify-content: center;
        }
        #crmViewerOverlay.crm-viewer-opened { display: flex; }

        #crmViewerImg {
            max-width: 92vw; max-height: 86vh;
            border-radius: 6px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7);
            cursor: zoom-in;
            user-select: none;
            transform-origin: center center;
            transition: transform 0.15s ease;
            will-change: transform;
        }
        #crmViewerImg.is-panning { transition: none; }
        #crmViewerImg.crm-viewer-zoomed { cursor: grab; }

        .crm-viewer-btn {
            position: fixed;
            background: #1a2029;
            color: #e6ebf2;
            border: 1px solid rgba(148, 163, 184, 0.3);
            border-radius: 50%;
            width: 42px; height: 42px;
            font-size: 20px; line-height: 1;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.15s;
        }
        .crm-viewer-btn:hover { background: #2a3442; }
        .crm-viewer-btn:focus-visible { outline: 2px solid #7cc4ff; outline-offset: 2px; }

        #crmViewerClose   { top: 16px; right: 16px; }
        #crmViewerPrev    { left: 16px; top: 50%; transform: translateY(-50%); }
        #crmViewerNext    { right: 16px; top: 50%; transform: translateY(-50%); }

        #crmViewerCaption {
            position: fixed;
            bottom: 18px; left: 50%; transform: translateX(-50%);
            color: #a3afc0;
            font: 12.5px 'Segoe UI', system-ui, sans-serif;
            background: #1a2029;
            border: 1px solid rgba(148, 163, 184, 0.26);
            padding: 4px 12px;
            border-radius: 12px;
            pointer-events: none;
        }
    `;
    document.head.appendChild(viewerStyles);

    /* ============================================================
     *  РАЗМЕТКА ОВЕРЛЕЯ
     * ============================================================ */
    const overlay = document.createElement('div');
    overlay.id = 'crmViewerOverlay';
    overlay.innerHTML = `
        <img id="crmViewerImg" alt="Просмотр изображения" draggable="false">
        <button class="crm-viewer-btn" id="crmViewerClose" title="Закрыть (Esc)">✕</button>
        <button class="crm-viewer-btn" id="crmViewerPrev" title="Предыдущее (←)">‹</button>
        <button class="crm-viewer-btn" id="crmViewerNext" title="Следующее (→)">›</button>
        <span id="crmViewerCaption"></span>
    `;
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector('#crmViewerImg');
    const captionEl = overlay.querySelector('#crmViewerCaption');

    let currentLinks = []; // все ссылки-превью на странице (для навигации ←/→)
    let currentIndex = 0;

    /* ============================================================
     *  ЗУМ И ПАНОРАМИРОВАНИЕ
     * ============================================================ */

    let zoom = 1;
    let offset = { x: 0, y: 0 }; // сдвиг увеличенной картинки в px

    function applyTransform() {
        imgEl.style.transform = zoom > 1
            ? `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`
            : '';
        imgEl.classList.toggle('crm-viewer-zoomed', zoom > 1);
    }

    function setZoom(nextZoom, anchor = null) {
        nextZoom = Math.min(MAX_ZOOM, Math.max(1, nextZoom));
        if (nextZoom === 1) {
            zoom = 1;
            offset = { x: 0, y: 0 };
        } else if (anchor) {
            // Точка под курсором должна остаться на месте при изменении зума.
            const rect = imgEl.getBoundingClientRect();
            const cx = anchor.x - (rect.left + rect.width / 2) - offset.x;
            const cy = anchor.y - (rect.top + rect.height / 2) - offset.y;
            const k = nextZoom / zoom;
            offset.x = offset.x - cx * (k - 1);
            offset.y = offset.y - cy * (k - 1);
            zoom = nextZoom;
        } else {
            zoom = nextZoom;
        }
        applyTransform();
    }

    function resetZoom() {
        zoom = 1;
        offset = { x: 0, y: 0 };
        applyTransform();
    }

    // Колесо — зум к точке курсора.
    overlay.addEventListener('wheel', (e) => {
        if (e.target !== imgEl) return;
        e.preventDefault();
        setZoom(zoom * (e.deltaY < 0 ? 1.25 : 0.8), { x: e.clientX, y: e.clientY });
    }, { passive: false });

    // Перетаскивание увеличенной картинки.
    let pan = null;
    let panned = false; // было реальное перемещение — один клик после drag игнорируем
    imgEl.addEventListener('pointerdown', (e) => {
        if (zoom <= 1) return;
        e.preventDefault();
        pan = { x: e.clientX - offset.x, y: e.clientY - offset.y, id: e.pointerId };
        panned = false;
        imgEl.setPointerCapture(e.pointerId);
        imgEl.classList.add('is-panning');
        imgEl.style.cursor = 'grabbing';
    });
    imgEl.addEventListener('pointermove', (e) => {
        if (!pan || e.pointerId !== pan.id) return;
        const dx = e.clientX - pan.x - offset.x;
        const dy = e.clientY - pan.y - offset.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) panned = true;
        offset.x = e.clientX - pan.x;
        offset.y = e.clientY - pan.y;
        applyTransform();
    });
    const endPan = (e) => {
        if (!pan || e.pointerId !== pan.id) return;
        pan = null;
        imgEl.classList.remove('is-panning');
        imgEl.style.cursor = '';
    };
    imgEl.addEventListener('pointerup', endPan);
    imgEl.addEventListener('pointercancel', endPan);

    /* ============================================================
     *  ЛОГИКА ОТКРЫТИЯ / НАВИГАЦИИ
     * ============================================================ */

    /** Обновляет список доступных ссылок-превью (страница CRM постоянно меняется). */
    function refreshLinkList(clickedLink) {
        currentLinks = Array.from(document.querySelectorAll('a.crm-screenshot-link'));
        // Если по какой-то причине текущей ссылки нет в списке — добавляем её первой.
        if (!currentLinks.includes(clickedLink)) currentLinks.unshift(clickedLink);
        currentIndex = currentLinks.indexOf(clickedLink);
    }

    /** Предзагрузка соседних картинок — листание стрелками без ожидания. */
    function preloadNeighbors() {
        for (const i of [currentIndex - 1, currentIndex + 1]) {
            const link = currentLinks[(i + currentLinks.length) % currentLinks.length];
            if (!link) continue;
            const img = new Image();
            img.src = link.href;
        }
    }

    /** Показывает изображение с индексом index из списка currentLinks. */
    function showImage(index) {
        if (currentLinks.length === 0) return;

        currentIndex = (index + currentLinks.length) % currentLinks.length; // циклическая навигация
        const link = currentLinks[currentIndex];
        const thumb = link.querySelector('img');

        resetZoom();
        imgEl.src = link.href;                       // грузим полноразмерную картинку
        imgEl.alt = thumb ? thumb.alt : 'Изображение';

        captionEl.textContent = `${currentIndex + 1} / ${currentLinks.length}`;
        preloadNeighbors();
    }

    function openViewer(link) {
        refreshLinkList(link);
        showImage(currentIndex);
        overlay.classList.add('crm-viewer-opened');
    }

    function closeViewer() {
        overlay.classList.remove('crm-viewer-opened');
        imgEl.src = ''; // освобождаем память от большой картинки
    }

    /* ============================================================
     *  СОБЫТИЯ
     * ============================================================ */

    // Делегированный обработчик: ловим клики по всем ссылкам-превью,
    // даже созданным после загрузки страницы.
    document.addEventListener('click', function (event) {
        const link = event.target.closest('a.crm-screenshot-link');
        if (!link) return;
        event.preventDefault();
        event.stopPropagation();
        openViewer(link);
    });

    // Клик по фону или ✕ — закрыть.
    overlay.addEventListener('click', function (event) {
        if (event.target === overlay || event.target.id === 'crmViewerClose') closeViewer();
    });

    // Клик по картинке — переключение зума 1x ↔ 2.5x (к центру).
    // Клик, которым закончилось перетаскивание, зум не переключает.
    imgEl.addEventListener('click', function (event) {
        if (panned) { panned = false; return; }
        event.stopPropagation();
        setZoom(zoom > 1 ? 1 : CLICK_ZOOM);
    });

    // Стрелки навигации (кнопки).
    overlay.querySelector('#crmViewerPrev').addEventListener('click', function (e) {
        e.stopPropagation();
        showImage(currentIndex - 1);
    });
    overlay.querySelector('#crmViewerNext').addEventListener('click', function (e) {
        e.stopPropagation();
        showImage(currentIndex + 1);
    });

    // Клавиатура: Esc — закрыть, стрелки — листать.
    document.addEventListener('keydown', function (event) {
        if (!overlay.classList.contains('crm-viewer-opened')) return;

        // Клавиши не должны доходить до страницы CRM (прокрутка, хоткеи).
        if (['Escape', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (event.key === 'Escape') closeViewer();
        else if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
        else if (event.key === 'ArrowRight') showImage(currentIndex + 1);
    }, true);
})();
