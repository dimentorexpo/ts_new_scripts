// ============================================================================
// Selectors.js — единый модуль хрупких селекторов AutoFAQ.
// Грузится ПЕРВЫМ в content_scripts для skyeng.autofaq.ai (до utils.js),
// поэтому остальные скрипты могут ссылаться на window.CHMAF_SELECTORS.
// Меняется разметка сайта — правим селектор здесь, а не по всему коду.
// ============================================================================
(() => {
    'use strict';
    if (window.CHMAF_SELECTORS) return;

    window.CHMAF_SELECTORS = {
        // Имя оператора в меню пользователя (по нему определяется отдел: ТП/КЦ/…)
        operatorName: '.user_menu-dropdown-user_name',

        // Iframe нового фронта AutoFAQ: основной селектор
        iframe: 'iframe.NEW_FRONTEND__frame',
        // Fallback-цепочка для последовательного поиска (querySelector(sel) || …),
        // как в content.js getIframeDoc()
        iframeFallbacks: [
            'iframe[class^="NEW_FRONTEND"]',
            '[class^="NEW_FRONTEND"] iframe'
        ],

        // Широкий селектор: любой узел с классом NEW_FRONTEND*
        // (исторически используется в AFStudentHelper.js и Settings.js)
        iframeBroad: '[class^="NEW_FRONTEND"]'
    };
})();