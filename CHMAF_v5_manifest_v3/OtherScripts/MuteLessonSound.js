(() => {
    const TARGET_SOUND = 'lesson-start.mp3';

    // Функция проверки источника аудио
    function isTargetAudio(src) {
        return typeof src === 'string' && src.includes(TARGET_SOUND);
    }

    // 1. Перехват вызова .play() у любых аудио и видео элементов
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(...args) {
        const currentSrc = this.currentSrc || this.src || '';
        
        if (isTargetAudio(currentSrc)) {
            this.muted = true;
            this.pause();
            return Promise.resolve(); // Заглушаем и возвращаем успешный промис, чтобы не ломать логику сайта
        }

        return originalPlay.apply(this, args);
    };

    // 2. Перехват вызова new Audio()
    const originalAudio = window.Audio;
    window.Audio = function(src) {
        const audio = new originalAudio(src);
        if (isTargetAudio(src)) {
            audio.muted = true;
        }
        return audio;
    };
    window.Audio.prototype = originalAudio.prototype;

    // 3. Отслеживание добавления тегов <audio> и <video> в DOM
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO') {
                    if (isTargetAudio(node.src) || isTargetAudio(node.currentSrc)) {
                        node.muted = true;
                        node.pause();
                    }
                }
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();