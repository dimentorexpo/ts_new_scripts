// ============================================================
// Глушит звук начала урока (lesson-start.mp3), остальные звуки не трогает.
//
// ВАЖНО: перехват play() срабатывает, только если скрипт подключён
// в манифесте с "world": "MAIN". В обычном (изолированном) мире
// контент-скрипта подмена HTMLMediaElement.prototype.play не видна
// коду страницы — тогда работают только пункты 2 и 3 (элементы в DOM),
// а звук, созданный через new Audio() без вставки в DOM, проскочит.
// Скрипт не использует chrome.*, поэтому перенос в MAIN безопасен.
// ============================================================
(() => {
    if (window.__chmafMuteLessonSound) return;
    window.__chmafMuteLessonSound = true;

    const TARGET_SOUND = 'lesson-start.mp3';

    const isTargetAudio = (src) => typeof src === 'string' && src.includes(TARGET_SOUND);

    /** Источник медиа: currentSrc / src / первый <source> (раньше <source> не учитывался). */
    function mediaSrc(el) {
        return el.currentSrc || el.src || el.querySelector?.('source[src]')?.src || '';
    }

    /**
     * Останавливаем, но НЕ ставим muted = true навсегда: раньше, если сайт
     * переиспользовал один <audio> для разных звуков, после lesson-start
     * он оставался заглушённым и пропадали все остальные уведомления.
     */
    function silence(el) {
        try {
            el.pause();
            el.currentTime = 0;
        } catch (e) { /* элемент мог быть уже удалён */ }
    }

    // 1. Перехват .play() (действует при "world": "MAIN")
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (...args) {
        if (isTargetAudio(mediaSrc(this))) {
            // Успешный промис, чтобы не ломать логику сайта, который ждёт play()
            return Promise.resolve();
        }
        return originalPlay.apply(this, args);
    };

    // 2. Событие play ловим на фазе погружения: работает в любом мире
    // и для элементов с autoplay, которые стартуют без вызова play()
    document.addEventListener('play', (event) => {
        const el = event.target;
        if (el instanceof HTMLMediaElement && isTargetAudio(mediaSrc(el))) silence(el);
    }, true);

    // 3. Новые <audio>/<video> в DOM: снимаем autoplay до старта.
    // Раньше проверялись только сами добавленные узлы, а плеер внутри
    // добавленного контейнера пропускался.
    function handleMedia(el) {
        if (!isTargetAudio(mediaSrc(el))) return;
        el.autoplay = false;
        el.removeAttribute('autoplay');
        if (!el.paused) silence(el);
    }

    const soundObserver = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;

                if (node instanceof HTMLMediaElement) {
                    handleMedia(node);
                } else if (node.firstElementChild) {
                    for (const el of node.querySelectorAll('audio, video')) handleMedia(el);
                }
            }
        }
    });

    soundObserver.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();