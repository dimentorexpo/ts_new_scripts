/**
 * Цветные SVG-иконки CRMHelper.
 *
 * Заменяют эмодзи и монохромные (stroke=currentColor) иконки во всём расширении.
 * Плоские двухтонные иконки без градиентов (нет id → нет конфликтов на странице),
 * viewBox 24×24, одинаково читаются на светлой и тёмной теме.
 *
 *   crmColorIcon(name, size)       — SVG по имени;
 *   crmEmojiIcon(emoji, size)      — SVG по эмодзи (неизвестный текст экранируется и возвращается как есть);
 *   crmEmojiFragment(text, size)   — DocumentFragment: эмодзи в тексте → SVG, остальное — текстовые узлы.
 *
 * Файл подключается первым в каждой группе content_scripts (см. manifest.json).
 */
(() => {
    if (typeof window.crmColorIcon === 'function') return;

    // Палитра
    const BLUE = '#4F8CFF', BLUE_D = '#2F62D9', BLUE_L = '#BBD4FF', SKY = '#6FA8FF';
    const GREEN = '#34C77B', GREEN_D = '#1E9E5A', GREEN_L = '#BFF0D4';
    const RED = '#FF5C6C', RED_D = '#D93A4A';
    const AMBER = '#FFB020', AMBER_D = '#E08A00', YELLOW = '#FFD54A', CREAM = '#FFF3C4';
    const PURPLE = '#8B6CF0', PURPLE_D = '#6246D6';
    const TEAL = '#20C5C5', PINK = '#FF7AB6', ORANGE = '#FF8A3D', ORANGE_D = '#E5671A';
    const GRAY = '#94A3B8', GRAY_D = '#64748B', INK = '#4B5B73', BROWN = '#B7791F';

    const stroke = (c, w = 2.4) => `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
    const book = (c, d) =>
        `<path d="M6 3.5h12.5A1.5 1.5 0 0 1 20 5v13H6.5A1.5 1.5 0 0 0 5 19.5V4.5A1 1 0 0 1 6 3.5z" fill="${c}"/>` +
        `<path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H20v2.5H6.5A1.5 1.5 0 0 1 5 19.5z" fill="#fff"/>` +
        `<rect x="5" y="3.5" width="3" height="16" rx="1" fill="${d}"/>` +
        `<path d="M11 8h5M11 11h3.5" ${stroke('#fff', 1.6)}/>`;

    const ICONS = {
        // — Системные / действия —
        close: `<circle cx="12" cy="12" r="9.5" fill="${RED}"/><path d="M8.6 8.6l6.8 6.8M15.4 8.6l-6.8 6.8" ${stroke('#fff', 2.3)}/>`,
        check: `<circle cx="12" cy="12" r="9.5" fill="${GREEN}"/><path d="M7.5 12.3l3 3 6-6.3" ${stroke('#fff', 2.4)}/>`,
        exclam: `<circle cx="12" cy="12" r="9.5" fill="${RED}"/><rect x="10.8" y="6.3" width="2.4" height="7" rx="1.2" fill="#fff"/><circle cx="12" cy="16.9" r="1.4" fill="#fff"/>`,
        warning: `<path d="M10.3 4.2a2 2 0 0 1 3.4 0l8 14A2 2 0 0 1 20 21H4a2 2 0 0 1-1.7-2.8z" fill="${AMBER}"/><rect x="10.8" y="9" width="2.4" height="6" rx="1.2" fill="#5B3A00"/><circle cx="12" cy="17.6" r="1.4" fill="#5B3A00"/>`,
        info: `<circle cx="12" cy="12" r="9.5" fill="${BLUE}"/><circle cx="12" cy="7.8" r="1.4" fill="#fff"/><rect x="10.8" y="10.8" width="2.4" height="6.6" rx="1.2" fill="#fff"/>`,
        question: `<circle cx="12" cy="12" r="9.5" fill="${PURPLE}"/><path d="M9.3 9.4a2.8 2.8 0 1 1 4.4 2.3c-.9.6-1.7 1.1-1.7 2.2" ${stroke('#fff', 2.2)}/><circle cx="12" cy="17" r="1.3" fill="#fff"/>`,
        plus: `<circle cx="12" cy="12" r="9.5" fill="${GREEN}"/><path d="M12 7.5v9M7.5 12h9" ${stroke('#fff', 2.4)}/>`,
        minus: `<circle cx="12" cy="12" r="9.5" fill="${AMBER}"/><path d="M7.5 12h9" ${stroke('#fff', 2.4)}/>`,
        refresh: `<path d="M4.5 12a7.5 7.5 0 0 1 13-5" ${stroke(BLUE)}/><path d="M18.5 2.5V7H14" ${stroke(BLUE)}/><path d="M19.5 12a7.5 7.5 0 0 1-13 5" ${stroke(GREEN)}/><path d="M5.5 21.5V17H10" ${stroke(GREEN)}/>`,
        repeat: `<path d="M4 11V9a4 4 0 0 1 4-4h9" ${stroke(BLUE)}/><path d="M14.5 2l3.5 3-3.5 3" ${stroke(BLUE)}/><path d="M20 13v2a4 4 0 0 1-4 4H7" ${stroke(GREEN)}/><path d="M9.5 22L6 19l3.5-3" ${stroke(GREEN)}/>`,
        shuffle: `<path d="M3 7h3.5c3.5 0 4.5 10 8.5 10h5" ${stroke(BLUE, 2.2)}/><path d="M17.5 14.5L20 17l-2.5 2.5" ${stroke(BLUE, 2.2)}/><path d="M3 17h3.5c1.5 0 2.5-2 3.5-4M13.5 9.5C14.3 8 15.5 7 17 7h3" ${stroke(AMBER, 2.2)}/><path d="M17.5 4.5L20 7l-2.5 2.5" ${stroke(AMBER, 2.2)}/>`,
        pause: `<rect x="5" y="4" width="5" height="16" rx="1.8" fill="${AMBER}"/><rect x="14" y="4" width="5" height="16" rx="1.8" fill="${AMBER}"/>`,
        play: `<path d="M7 4.8a1.5 1.5 0 0 1 2.3-1.3l10 7.2a1.5 1.5 0 0 1 0 2.6l-10 7.2A1.5 1.5 0 0 1 7 19.2z" fill="${GREEN}"/>`,
        stop: `<rect x="5" y="5" width="14" height="14" rx="3" fill="${RED}"/>`,
        back: `<path d="M15 5l-7 7 7 7" ${stroke(BLUE, 3)}/>`,
        next: `<path d="M9 5l7 7-7 7" ${stroke(BLUE, 3)}/>`,
        chevDown: `<path d="M5 9l7 7 7-7" ${stroke(BLUE, 3)}/>`,
        chevUp: `<path d="M5 15l7-7 7 7" ${stroke(BLUE, 3)}/>`,
        arrowDown: `<path d="M12 4v15M6 13l6 6 6-6" ${stroke(BLUE, 2.8)}/>`,
        arrowUp: `<path d="M12 20V5M6 11l6-6 6 6" ${stroke(GREEN, 2.8)}/>`,
        search: `<circle cx="10" cy="10" r="6.5" fill="#DCEBFF" stroke="${BLUE}" stroke-width="2.6"/><path d="M15 15l5.5 5.5" ${stroke(AMBER, 3.2)}/><path d="M7 9.3a3.2 3.2 0 0 1 3-2.3" ${stroke('#fff', 1.6)}/>`,
        copy: `<rect x="3.5" y="3.5" width="12" height="12" rx="2.8" fill="${BLUE_L}"/><rect x="8.5" y="8.5" width="12" height="12" rx="2.8" fill="${BLUE}"/>`,
        external: `<rect x="3" y="6" width="14" height="14" rx="3" fill="${BLUE_L}"/><path d="M14 3h7v7" ${stroke(BLUE, 2.4)}/><path d="M21 3l-9 9" ${stroke(BLUE, 2.4)}/>`,
        save: `<path d="M5.5 3h11l4.5 4.5V18.5a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3z" fill="${BLUE}"/><rect x="7" y="3" width="8" height="5.5" rx="1" fill="#E8F1FF"/><rect x="6.5" y="13" width="11" height="8" rx="1.5" fill="#fff"/>`,
        download: `<path d="M12 3v11M7.5 10.5L12 15l4.5-4.5" ${stroke(GREEN, 2.6)}/><path d="M4 16v2.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V16" ${stroke(GRAY_D, 2.4)}/>`,
        upload: `<path d="M12 15V4M7.5 7.5L12 3l4.5 4.5" ${stroke(BLUE, 2.6)}/><path d="M4 16v2.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V16" ${stroke(GRAY_D, 2.4)}/>`,
        link: `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" ${stroke(BLUE)}/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" ${stroke(GREEN)}/>`,
        clip: `<path d="M19 11.5l-7 7a4.5 4.5 0 0 1-6.4-6.4l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.5 1.5 0 0 1-2.1-2.1l7-7" ${stroke(PURPLE, 2.2)}/>`,
        star: `<polygon points="12 2.5 14.9 8.6 21.6 9.5 16.7 14.2 17.9 20.9 12 17.7 6.1 20.9 7.3 14.2 2.4 9.5 9.1 8.6" fill="${AMBER}" stroke="${AMBER_D}" stroke-width="1.2" stroke-linejoin="round"/>`,
        sparkle: `<path d="M11 3c.7 4.5 2.5 6.3 7 7-4.5.7-6.3 2.5-7 7-.7-4.5-2.5-6.3-7-7 4.5-.7 6.3-2.5 7-7z" fill="${AMBER}"/><path d="M19 15c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3z" fill="${PINK}"/>`,
        prohibit: `<circle cx="12" cy="12" r="8.5" fill="#FFE3E6" stroke="${RED}" stroke-width="3"/><path d="M6 18L18 6" ${stroke(RED, 3)}/>`,
        grid: `<rect x="3" y="3" width="8" height="8" rx="2.2" fill="${BLUE}"/><rect x="13" y="3" width="8" height="8" rx="2.2" fill="${GREEN}"/><rect x="3" y="13" width="8" height="8" rx="2.2" fill="${AMBER}"/><rect x="13" y="13" width="8" height="8" rx="2.2" fill="${PINK}"/>`,
        trash: `<path d="M5.5 8h13l-1 11.5a2 2 0 0 1-2 1.8h-7a2 2 0 0 1-2-1.8z" fill="${RED}"/><rect x="3.5" y="5" width="17" height="2.8" rx="1.4" fill="${RED_D}"/><rect x="9.5" y="2.8" width="5" height="2.6" rx="1.2" fill="${RED_D}"/><path d="M10 11v6M14 11v6" ${stroke('#fff', 1.6)}/>`,
        doc: `<path d="M6.5 2.5H14l5 5v11a3 3 0 0 1-3 3H6.5a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3z" fill="${BLUE}"/><path d="M14 2.5l5 5h-3a2 2 0 0 1-2-2z" fill="${BLUE_L}"/><path d="M7.5 12h8M7.5 15.5h5" ${stroke('#fff', 1.8)}/>`,
        chat: `<path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-6l-4.5 4v-4H7a3 3 0 0 1-3-3z" fill="${GREEN}"/><g fill="#fff"><circle cx="8.5" cy="9.5" r="1.3"/><circle cx="12" cy="9.5" r="1.3"/><circle cx="15.5" cy="9.5" r="1.3"/></g>`,

        // — Модули меню —
        templates: `<rect x="7" y="2.5" width="13" height="16" rx="2.5" fill="${BLUE_L}"/><rect x="4" y="5.5" width="13" height="16" rx="2.5" fill="${BLUE}"/><path d="M7.5 11h6M7.5 14.5h6M7.5 18h3.5" ${stroke('#fff', 1.8)}/>`,
        shrimp: `<path d="M19 7c-2-3.5-8-4.5-11.5-1C4 9.5 5 15 9 17.2l-3.5 3.3 6.2-1.5c4.5-.3 8.2-4.2 7.3-12z" fill="${ORANGE}"/><path d="M12 5.5c1 2 1 4.5-.5 7M15.5 7c.8 2 .5 4-.8 6" ${stroke(ORANGE_D, 1.5)}/><circle cx="16.8" cy="9.2" r="1.2" fill="#1F2937"/><path d="M19 7l2.5-2.5" ${stroke(ORANGE_D, 1.5)}/>`,
        cap: `<path d="M12 4L1.5 9 12 14l10.5-5z" fill="${PURPLE_D}"/><path d="M6 12v4.5c0 1.5 2.7 3 6 3s6-1.5 6-3V12l-6 3z" fill="${PURPLE}"/><path d="M21 10v6" ${stroke(AMBER, 1.6)}/><circle cx="21" cy="17.2" r="1.3" fill="${AMBER}"/>`,
        calendar: `<rect x="3" y="5" width="18" height="16" rx="3.5" fill="#fff" stroke="#CBD5E1" stroke-width="1.2"/><path d="M3 10V8.5A3.5 3.5 0 0 1 6.5 5h11A3.5 3.5 0 0 1 21 8.5V10z" fill="${RED}"/><rect x="7.5" y="2.5" width="2" height="5" rx="1" fill="${INK}"/><rect x="14.5" y="2.5" width="2" height="5" rx="1" fill="${INK}"/><g fill="${BLUE}"><rect x="6.5" y="12.5" width="3" height="3" rx=".8"/><rect x="10.5" y="12.5" width="3" height="3" rx=".8"/><rect x="6.5" y="16.5" width="3" height="3" rx=".8"/></g><rect x="14.5" y="12.5" width="3" height="3" rx=".8" fill="${AMBER}"/>`,
        calendarAuto: `<rect x="3" y="5" width="18" height="16" rx="3.5" fill="#fff" stroke="#CBD5E1" stroke-width="1.2"/><path d="M3 10V8.5A3.5 3.5 0 0 1 6.5 5h11A3.5 3.5 0 0 1 21 8.5V10z" fill="${GREEN}"/><rect x="7.5" y="2.5" width="2" height="5" rx="1" fill="${INK}"/><rect x="14.5" y="2.5" width="2" height="5" rx="1" fill="${INK}"/><path d="M8 15.8l2.7 2.7L16 13" ${stroke(GREEN_D, 2.2)}/>`,
        toolbox: `<path d="M8.5 8V6.5A1.5 1.5 0 0 1 10 5h4a1.5 1.5 0 0 1 1.5 1.5V8" ${stroke(INK, 2)}/><rect x="2.5" y="8" width="19" height="12.5" rx="3" fill="${ORANGE}"/><rect x="2.5" y="12.5" width="19" height="2" fill="${ORANGE_D}"/><rect x="10" y="11.3" width="4" height="4.4" rx="1" fill="${YELLOW}"/>`,
        headset: `<path d="M4.5 14v-2.5a7.5 7.5 0 0 1 15 0V14" ${stroke(INK, 2.2)}/><rect x="3" y="12.5" width="4.5" height="7.5" rx="2.2" fill="${PURPLE}"/><rect x="16.5" y="12.5" width="4.5" height="7.5" rx="2.2" fill="${PURPLE}"/><path d="M19 19.5c0 1.4-1.5 2-4 2" ${stroke(INK, 1.6)}/>`,
        dice: `<rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="${RED}"/><g fill="#fff"><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="8" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="8" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/></g>`,
        bell: `<path d="M12 3a6 6 0 0 0-6 6v4l-2 3.5h16L18 13V9a6 6 0 0 0-6-6z" fill="${AMBER}"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0z" fill="${AMBER_D}"/><path d="M8.5 9a3.5 3.5 0 0 1 2.5-3.3" ${stroke('#FFE08A', 1.6)}/>`,
        bellOff: `<path d="M12 3a6 6 0 0 0-6 6v4l-2 3.5h16L18 13V9a6 6 0 0 0-6-6z" fill="${GRAY}"/><path d="M9.5 19a2.5 2.5 0 0 0 5 0z" fill="${GRAY_D}"/><path d="M4 4l16 16" ${stroke(RED, 2.6)}/>`,
        gear: `<path d="M10.3 2.5h3.4l.5 2.6 1.6.7 2.2-1.5 2.4 2.4-1.5 2.2.7 1.6 2.6.5v3.4l-2.6.5-.7 1.6 1.5 2.2-2.4 2.4-2.2-1.5-1.6.7-.5 2.6h-3.4l-.5-2.6-1.6-.7-2.2 1.5-2.4-2.4 1.5-2.2-.7-1.6-2.6-.5v-3.4l2.6-.5.7-1.6-1.5-2.2 2.4-2.4 2.2 1.5 1.6-.7z" fill="${GRAY}"/><circle cx="12" cy="12" r="4" fill="#fff"/><circle cx="12" cy="12" r="2.1" fill="${BLUE}"/>`,
        alarm: `<path d="M3.5 6.5l3-3M20.5 6.5l-3-3" ${stroke(RED, 2.6)}/><circle cx="12" cy="13" r="8" fill="#fff" stroke="${RED}" stroke-width="2.4"/><path d="M12 8.5V13l3 2" ${stroke(INK, 2)}/>`,
        users: `<circle cx="16.5" cy="8" r="3" fill="${PURPLE}"/><path d="M11 19v-1.5a4.5 4.5 0 0 1 4.5-4.5h2a4.5 4.5 0 0 1 4.5 4.5V19z" fill="${PURPLE}"/><circle cx="9" cy="8.5" r="3.5" fill="${BLUE}"/><path d="M2 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2z" fill="${BLUE}"/>`,

        // — Jira-пресеты —
        cardIndex: `<rect x="2.5" y="5" width="19" height="14" rx="3" fill="${BLUE}"/><circle cx="8.5" cy="10.8" r="2.2" fill="#fff"/><path d="M5 16.5a3.5 3.5 0 0 1 7 0z" fill="#fff"/><path d="M14 10h5M14 13.5h4" ${stroke('#fff', 1.8)}/>`,
        clover: `<g fill="${GREEN}"><circle cx="8.5" cy="8.5" r="4.2"/><circle cx="15.5" cy="8.5" r="4.2"/><circle cx="8.5" cy="14.5" r="4.2"/><circle cx="15.5" cy="14.5" r="4.2"/></g><circle cx="12" cy="11.5" r="2" fill="${GREEN_D}"/><path d="M12 13v8" ${stroke(GREEN_D, 2)}/>`,
        puzzle: `<path d="M3.5 9h3.2a2.3 2.3 0 1 1 4.6 0H15v3.2a2.3 2.3 0 1 1 0 4.6V20H3.5z" fill="${TEAL}"/><path d="M15 12.2a2.3 2.3 0 1 1 0 4.6V20h5.5V9H15z" fill="${PURPLE}"/>`,
        apple: `<path d="M12 7.5c-2-1.6-6-1-6.5 3.5-.5 4.5 2.5 9 5 9 .6 0 .9-.3 1.5-.3s.9.3 1.5.3c2.5 0 5.5-4.5 5-9-.5-4.5-4.5-5.1-6.5-3.5z" fill="${GREEN}"/><path d="M12 7.5c0-2.2 1-3.7 3.2-4.2 0 2.2-1 3.7-3.2 4.2z" fill="${GREEN_D}"/>`,
        robot: `<path d="M12 7.5V4.5" ${stroke(GREEN_D, 2)}/><circle cx="12" cy="3.8" r="1.7" fill="${AMBER}"/><rect x="4" y="7.5" width="16" height="12.5" rx="4" fill="${GREEN}"/><circle cx="9" cy="13" r="2.1" fill="#fff"/><circle cx="15" cy="13" r="2.1" fill="#fff"/><circle cx="9" cy="13" r="1" fill="${INK}"/><circle cx="15" cy="13" r="1" fill="${INK}"/><path d="M9.5 17h5" ${stroke(GREEN_D, 1.6)}/>`,
        memo: `<rect x="4.5" y="3.5" width="13" height="17" rx="2.5" fill="${CREAM}" stroke="#F5C542" stroke-width="1.4"/><path d="M8 8h6M8 11.5h6M8 15h3" ${stroke(AMBER_D, 1.6)}/><path d="M19.2 7.3l1.5 1.5-7.4 7.4-2.1.6.6-2.1z" fill="${ORANGE}"/>`,

        // — Ссылки и инструменты —
        books: `<rect x="3" y="14.5" width="18" height="5.5" rx="1.6" fill="${BLUE}"/><rect x="4.5" y="9.2" width="16" height="5.3" rx="1.6" fill="${GREEN}"/><rect x="3.5" y="3.8" width="14" height="5.4" rx="1.6" fill="${RED}"/><path d="M6 17.2h6M7.5 11.9h5M6.5 6.5h4" ${stroke('#fff', 1.3)}/>`,
        lockKey: `<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" ${stroke(GRAY_D, 2.4)}/><rect x="4.5" y="10.5" width="15" height="10.5" rx="3" fill="${AMBER}"/><circle cx="12" cy="15" r="1.7" fill="#7A4B00"/><rect x="11.2" y="15.5" width="1.6" height="3" rx=".8" fill="#7A4B00"/>`,
        bug: `<path d="M5 11l-2.3-1M5.5 15h-3M6 19l-2.3 1.6M19 11l2.3-1M18.5 15h3M18 19l2.3 1.6" ${stroke(INK, 1.5)}/><ellipse cx="12" cy="14.2" rx="6.5" ry="7" fill="${RED}"/><circle cx="12" cy="6.5" r="3.2" fill="${INK}"/><path d="M12 8.5v12.5" ${stroke(INK, 1.4)}/><g fill="${INK}"><circle cx="9" cy="13" r="1.3"/><circle cx="15" cy="13" r="1.3"/><circle cx="9.6" cy="17.5" r="1.1"/><circle cx="14.4" cy="17.5" r="1.1"/></g>`,
        pickaxe: `<path d="M13.5 8.5L4.5 19.5" ${stroke(BROWN, 2.8)}/><path d="M5 9.5C8.5 4 16.5 3.5 21 8l-2.3 1.6c-3.2-2.4-7.3-2.2-10.6.8z" fill="${GRAY}"/>`,
        calendarPlain: null,
        speak: `<circle cx="9" cy="8.5" r="4.5" fill="${AMBER}"/><path d="M2.5 21a6.5 6.5 0 0 1 13 0z" fill="${AMBER}"/><path d="M16.5 7a4.5 4.5 0 0 1 0 5M19 4.5a8 8 0 0 1 0 10" ${stroke(BLUE, 2)}/>`,
        moneyFly: `<rect x="2" y="7" width="15" height="10" rx="2.2" fill="${GREEN}"/><circle cx="9.5" cy="12" r="2.6" fill="${GREEN_L}"/><path d="M19.5 9h2.5M20 12h2M19.5 15h2.5" ${stroke(GREEN, 1.6)}/>`,
        cyclone: `<circle cx="12" cy="12" r="9.5" fill="${BLUE}"/><path d="M12 5.5a6.5 6.5 0 1 1-6.5 6.5 4.2 4.2 0 1 1 4.2 4.2 2.2 2.2 0 1 1 2.3-2.2" ${stroke('#fff', 1.9)}/>`,
        tools: `<path d="M19.5 19.5L11 11" ${stroke(BROWN, 2.8)}/><rect x="12.5" y="3" width="8.5" height="5" rx="1.4" transform="rotate(45 16.75 5.5)" fill="${RED}"/><path d="M3.5 6.5a4 4 0 0 0 5.4 4.6l5.6 5.6a1.8 1.8 0 0 0 2.5-2.5L11.4 8.6A4 4 0 0 0 6.8 3.5L9 5.7 8.3 8.3 5.7 9z" fill="${GRAY}"/>`,
        card: `<rect x="2.5" y="5" width="19" height="14" rx="3" fill="${BLUE}"/><rect x="2.5" y="8.5" width="19" height="3" fill="#1E3A8A"/><rect x="5.5" y="14.5" width="5" height="2" rx="1" fill="${YELLOW}"/>`,
        abacus: `<rect x="3" y="4" width="18" height="16" rx="2.5" fill="${CREAM}" stroke="${BROWN}" stroke-width="2"/><path d="M3.5 9.3h17M3.5 14.7h17" stroke="${BROWN}" stroke-width="1.4"/><g fill="${RED}"><circle cx="7" cy="9.3" r="1.9"/><circle cx="11" cy="9.3" r="1.9"/><circle cx="15" cy="9.3" r="1.9"/></g><g fill="${BLUE}"><circle cx="9" cy="14.7" r="1.9"/><circle cx="13" cy="14.7" r="1.9"/><circle cx="17" cy="14.7" r="1.9"/></g>`,
        house: `<rect x="5.5" y="11" width="13" height="9.5" rx="1.5" fill="#FFD9A0"/><path d="M2.5 12L12 3.5l9.5 8.5z" fill="${RED}"/><rect x="10" y="14.5" width="4" height="6" rx="1" fill="${BROWN}"/>`,
        globe: `<circle cx="12" cy="12" r="9.5" fill="${BLUE}"/><path d="M6 8c2-2 4-1.5 5-.5s0 2.5-1.5 3S8 13 8.5 15 6 14 5 12s0-3 1-4zM14 14c1.5-.5 3 0 4 1.5-1 2-3 3-4.5 2.8-.8-1.5-.8-3 .5-4.3zM13.5 5.5c1.5-.3 3 .3 4 1.2-1 .8-2.5 1-3.5.5z" fill="${GREEN}"/>`,
        scroll: `<rect x="5.5" y="4" width="13" height="16" rx="2" fill="#FFE9B0"/><rect x="3.5" y="3" width="17" height="3.4" rx="1.7" fill="${AMBER_D}"/><rect x="3.5" y="17.6" width="17" height="3.4" rx="1.7" fill="${AMBER_D}"/><path d="M8.5 10h7M8.5 13.5h5" ${stroke(BROWN, 1.4)}/>`,
        tag: `<path d="M3 4.5A1.5 1.5 0 0 1 4.5 3h6.2a2 2 0 0 1 1.4.6l8.3 8.3a2 2 0 0 1 0 2.8l-5.9 5.9a2 2 0 0 1-2.8 0L3.6 12.3a2 2 0 0 1-.6-1.4z" fill="${AMBER}"/><circle cx="8" cy="8" r="1.8" fill="#fff"/>`,
        bookBlue: book(BLUE, BLUE_D),
        bookGreen: book(GREEN, GREEN_D),
        bookOrange: book(AMBER, AMBER_D),
        hammer: `<path d="M12.5 11.5L5 19.5" ${stroke(BROWN, 3)}/><rect x="10" y="3" width="11" height="6" rx="1.6" transform="rotate(45 15.5 6)" fill="${GRAY}"/>`,
        video: `<rect x="2.5" y="6.5" width="13.5" height="11" rx="3" fill="${BLUE}"/><path d="M17.5 10.5l4-2.5v8l-4-2.5z" fill="${PURPLE}"/>`,
        mail: `<rect x="2.5" y="5" width="19" height="14" rx="3" fill="${YELLOW}"/><path d="M3.5 7.5l8.5 6 8.5-6" ${stroke(AMBER_D, 1.8)}/>`,
        child: `<path d="M5 22.5a7 7 0 0 1 14 0z" fill="${BLUE}"/><circle cx="12" cy="10" r="5.8" fill="#FFD9A0"/><path d="M6.2 9.5a5.8 5.8 0 0 1 11.6 0c-1.8-.9-3.8-1.9-5.8-1.9S8 8.6 6.2 9.5z" fill="#7A4B00"/><circle cx="9.9" cy="11" r="1" fill="${INK}"/><circle cx="14.1" cy="11" r="1" fill="${INK}"/><path d="M10 13.4a2.8 2.8 0 0 0 4 0" ${stroke('#D9643A', 1.3)}/>`,
        chart: `<rect x="3.5" y="12" width="4.5" height="8.5" rx="1.2" fill="${BLUE}"/><rect x="9.8" y="4" width="4.5" height="16.5" rx="1.2" fill="${GREEN}"/><rect x="16" y="8.5" width="4.5" height="12" rx="1.2" fill="${AMBER}"/>`,
        trend: `<rect x="2.5" y="3" width="19" height="18" rx="3" fill="#E1F6EA"/><path d="M5.5 16l4.5-5 3.5 3L19 7.5" ${stroke(GREEN_D, 2.4)}/><path d="M15.5 7.5H19V11" ${stroke(GREEN_D, 2.4)}/>`,
        clipboard: `<rect x="4.5" y="4.5" width="15" height="17" rx="2.8" fill="${AMBER}"/><rect x="7" y="7.5" width="10" height="12" rx="1.5" fill="#fff"/><rect x="8.5" y="2.5" width="7" height="4" rx="1.6" fill="${GRAY_D}"/><path d="M9 11.5h6M9 15h4" ${stroke('#CBD5E1', 1.6)}/>`,

        // — Устройства и диагностика —
        mic: `<rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="${PURPLE}"/><path d="M11 6v4" ${stroke('#C9BBFF', 1.5)}/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" ${stroke(GRAY_D, 2)}/><path d="M12 18v3M8.5 21h7" ${stroke(GRAY_D, 2)}/>`,
        camera: `<rect x="2.5" y="6.5" width="19" height="14" rx="3.5" fill="${GRAY_D}"/><path d="M8 6.5l1.2-2.2a1 1 0 0 1 .8-.5h4a1 1 0 0 1 .8.5l1.2 2.2z" fill="${INK}"/><circle cx="12" cy="13.5" r="4.6" fill="#E0F2FF"/><circle cx="12" cy="13.5" r="2.8" fill="${BLUE}"/><circle cx="18" cy="9.5" r="1" fill="${YELLOW}"/>`,
        knobs: `<rect x="2.5" y="4" width="19" height="16" rx="3" fill="${GRAY}"/><path d="M7 8v8M12 8v8M17 8v8" ${stroke('#475569', 1.6)}/><rect x="5" y="9" width="4" height="3" rx="1" fill="${RED}"/><rect x="10" y="13" width="4" height="3" rx="1" fill="${BLUE}"/><rect x="15" y="10" width="4" height="3" rx="1" fill="${AMBER}"/>`,
        laptop: `<rect x="4.5" y="4.5" width="15" height="11" rx="2" fill="${INK}"/><rect x="6" y="6" width="12" height="8" rx="1" fill="${SKY}"/><path d="M2 17h20l-1.4 2.2a1.5 1.5 0 0 1-1.3.8H4.7a1.5 1.5 0 0 1-1.3-.8z" fill="${GRAY}"/>`,
        phone: `<rect x="6.5" y="2.5" width="11" height="19" rx="3" fill="${INK}"/><rect x="8" y="5" width="8" height="12.5" rx="1" fill="${SKY}"/><circle cx="12" cy="19.5" r=".9" fill="${GRAY}"/>`
    };
    delete ICONS.calendarPlain;

    // Эмодзи → имя иконки (без селектора вариации U+FE0F).
    const EMOJI = {
        '📑': 'templates', '🔎': 'search', '🔍': 'search', '💬': 'chat', '🦐': 'shrimp', '🎓': 'cap',
        '🗓': 'calendarAuto', '📅': 'calendar', '🧰': 'toolbox', '🎧': 'headset', '🎲': 'dice',
        '🔕': 'bellOff', '🔔': 'bell', '⚙': 'gear', '⏰': 'alarm', '👥': 'users',
        '📇': 'cardIndex', '🍀': 'clover', '🙅': 'prohibit', '🧩': 'puzzle', '🍏': 'apple', '🤖': 'robot',
        '📝': 'memo', '★': 'star', '☆': 'star', '🗑': 'trash', '📚': 'books', '🔐': 'lockKey', '🐞': 'bug',
        '⛏': 'pickaxe', '🗣': 'speak', '🚫': 'prohibit', '💸': 'moneyFly', '🌀': 'cyclone', '🛠': 'tools',
        '💳': 'card', '🧮': 'abacus', '🔁': 'repeat', '🏡': 'house', 'ℹ': 'info', '💫': 'sparkle',
        '🌐': 'globe', '📜': 'scroll', '🏷': 'tag', '📔': 'bookOrange', '📗': 'bookGreen', '📘': 'bookBlue',
        '🔨': 'hammer', '♻': 'refresh', '🔄': 'refresh', '↻': 'refresh', '📹': 'video', '🎥': 'video',
        '✉': 'mail', '❓': 'question', '🧒': 'child', '📊': 'chart', '📈': 'trend', '🔗': 'link',
        '📎': 'clip', '📋': 'clipboard', '🎤': 'mic', '📷': 'camera', '🎛': 'knobs', '💻': 'laptop',
        '📱': 'phone', '🔀': 'shuffle', '⚠': 'warning', '✅': 'check', '❌': 'close',
        '✕': 'close', '❗': 'exclam', '⏸': 'pause', '▾': 'chevDown', '▴': 'chevUp', '↓': 'arrowDown', '↑': 'arrowUp'
    };

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const norm = (s) => String(s ?? '').replace(/️/g, '').trim();

    /** SVG-иконка по имени (пустая строка, если имя неизвестно). */
    function crmColorIcon(name, size = 16) {
        const body = ICONS[name];
        if (!body) return '';
        return `<svg class="crm-cicon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">${body}</svg>`;
    }

    /** SVG по эмодзи. Готовую SVG-разметку пропускает как есть, незнакомый текст экранирует. */
    function crmEmojiIcon(value, size = 16) {
        const raw = String(value ?? '');
        if (raw.trimStart().startsWith('<svg')) return raw;
        const name = EMOJI[norm(raw)];
        return name ? crmColorIcon(name, size) : esc(raw);
    }

    const keys = Object.keys(EMOJI).sort((a, b) => b.length - a.length);
    const splitter = new RegExp(`(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\uFE0F?`, 'u');

    /** Текст с эмодзи → DocumentFragment (эмодзи заменяются на SVG). Безопасно для недоверенного текста. */
    function crmEmojiFragment(text, size = 14) {
        const frag = document.createDocumentFragment();
        String(text ?? '').split(splitter).forEach((part, i) => {
            if (!part) return;
            if (i % 2 === 1) {
                const holder = document.createElement('span');
                holder.className = 'crm-cicon-wrap';
                holder.innerHTML = crmColorIcon(EMOJI[part], size);
                frag.append(holder);
            } else {
                frag.append(document.createTextNode(part));
            }
        });
        return frag;
    }

    window.CRM_COLOR_ICONS = ICONS;
    window.crmColorIcon = crmColorIcon;
    window.crmEmojiIcon = crmEmojiIcon;
    window.crmEmojiFragment = crmEmojiFragment;
})();
