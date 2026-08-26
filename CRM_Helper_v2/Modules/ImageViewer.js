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
 *  4. клик по картинке — зум 1x/2x.
 */
(function () {
    'use strict';

    /* ============================================================
     *  СТИЛИ ПРОСМОТРЩИКА (инжектятся один раз)
     * ============================================================ */
    const viewerStyles = document.createElement('style');
    viewerStyles.textContent = `
        #crmViewerOverlay {
            position: fixed; inset: 0; z-index: 2147483646;
            background: rgba(0, 0, 0, 0.88);
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
            transition: transform 0.15s ease;
        }
        #crmViewerImg.crm-viewer-zoomed {
            transform: scale(1.8);
            cursor: zoom-out;
            max-width: none; max-height: none;
        }

        .crm-viewer-btn {
            position: fixed;
            background: rgba(255, 255, 255, 0.12);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.25);
            border-radius: 50%;
            width: 42px; height: 42px;
            font-size: 20px; line-height: 1;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.15s;
        }
        .crm-viewer-btn:hover { background: rgba(255, 255, 255, 0.3); }

        #crmViewerClose   { top: 16px; right: 16px; }
        #crmViewerPrev    { left: 16px; top: 50%; transform: translateY(-50%); }
        #crmViewerNext    { right: 16px; top: 50%; transform: translateY(-50%); }

        #crmViewerCaption {
            position: fixed;
            bottom: 18px; left: 50%; transform: translateX(-50%);
            color: #ddd;
            font: 13px 'Segoe UI', system-ui, sans-serif;
            background: rgba(0, 0, 0, 0.5);
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
        <img id="crmViewerImg" alt="Просмотр изображения">
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
     *  ЛОГИКА ОТКРЫТИЯ / НАВИГАЦИИ
     * ============================================================ */

    /** Обновляет список доступных ссылок-превью (страница CRM постоянно меняется). */
    function refreshLinkList(clickedLink) {
        currentLinks = Array.from(document.querySelectorAll('a.crm-screenshot-link'));
        // Если по какой-то причине текущей ссылки нет в списке — добавляем её первой.
        if (!currentLinks.includes(clickedLink)) currentLinks.unshift(clickedLink);
        currentIndex = currentLinks.indexOf(clickedLink);
    }

    /** Показывает изображение с индексом index из списка currentLinks. */
    function showImage(index) {
        if (currentLinks.length === 0) return;

        currentIndex = (index + currentLinks.length) % currentLinks.length; // циклическая навигация
        const link = currentLinks[currentIndex];
        const thumb = link.querySelector('img');

        imgEl.classList.remove('crm-viewer-zoomed');
        imgEl.src = link.href;                       // грузим полноразмерную картинку
        imgEl.alt = thumb ? thumb.alt : 'Изображение';

        captionEl.textContent = `${currentIndex + 1} / ${currentLinks.length}`;
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

    // Клик по картинке — переключение зума.
    imgEl.addEventListener('click', function (event) {
        event.stopPropagation();
        imgEl.classList.toggle('crm-viewer-zoomed');
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

        if (event.key === 'Escape') closeViewer();
        else if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
        else if (event.key === 'ArrowRight') showImage(currentIndex + 1);
    });
})();
