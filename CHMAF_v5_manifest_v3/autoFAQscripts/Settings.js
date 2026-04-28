async function init_settings() {
    // --- Constants & Configuration ---
    const DEFAULTS = {
        defaclschatcolor: '#FF47CA',
        answchatcolor: '#A0522D',
        responschatcolor: '#DDA0DD',
        splinter: 3,
        audio: 1,
        audiovol: 1,
        hideTaskWindow: 1,
        showquicktags: 0,
        dblhidewindow: 0,
        brnotificatios: 0,
        clearlessoninfo: 0,
        disablelpmwindow: 0,
        AF_windowScale: 100,
        afterLoginFunction: 'Online',
        sound_str: 'https://grumstv.github.io/Sounds/msg.mp3',
        appBgColor: '#FFFFFF' // Дефолтный белый цвет фона
    };

    const data = await getStorageData(['KC_addr', 'TP_addr', 'KC_addrRzrv', 'TP_addrRzrv']);
    const ADDR = {
        KC: data.KC_addr,
        TP: data.TP_addr,
        KC_Rzrv: data.KC_addrRzrv,
        TP_Rzrv: data.TP_addrRzrv
    };

    // --- Core Logic & State Management ---
    const Settings = {
        get: (key) => localStorage.getItem(key) ?? DEFAULTS[key],
        set: (key, val) => localStorage.setItem(key, val),

        initDefaults() {
            Object.entries(DEFAULTS).forEach(([key, val]) => {
                if (localStorage.getItem(key) === null) this.set(key, val);
            });
            const savedVol = parseFloat(this.get('audiovol'));
            if (typeof audio === 'undefined' || audio === null) {
                audio = new Audio(this.get('sound_str'));
            }
            audio.volume = savedVol;
        },
    };

    Settings.initDefaults();

    // ====================================================================================
    // Универсальная функция для цвета с учетом IFRAME и динамических хэшей классов
    // ====================================================================================
    const applyAppBgColor = () => {
        const color = Settings.get('appBgColor') || '#FFFFFF';
        const isWhite = color.toUpperCase() === '#FFFFFF';

        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        const textColor = brightness >= 128 ? '#1A1A1A' : '#E0E0E0';

        const getRgba = (hex, alpha) => {
            const r1 = parseInt(hex.slice(1, 3), 16);
            const g1 = parseInt(hex.slice(3, 5), 16);
            const b1 = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r1}, ${g1}, ${b1}, ${alpha})`;
        };

        let cssRules = `
    .usinf-glass-panel {
        background: ${isWhite ? 'rgba(255, 255, 255, 0.7)' : getRgba(color, 0.7)} !important;
        backdrop-filter: blur(20px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
        border: 1px solid ${isWhite ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'} !important;
        color: ${textColor} !important;
    }
.usinf-btn-glass {
    /* !important здесь обязателен, иначе #ffffff из glassmorphismCSS победит */
    background: ${isWhite ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'} !important;
    color: ${textColor} !important;

    /* адаптивный border теперь тоже !important и перебьёт базовый */
    border: 1px solid ${isWhite ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)'} !important;
}
`;

        if (!isWhite) {
            cssRules += `
            /* ═══ 1. КАРТОЧКИ ДИАЛОГОВ (с поддержкой цвета таймера) ═══ */
            [class*="DialogsCard_Card"] {
                background-color: var(--chat-card-bg, ${getRgba(textColor, 0.05)}) !important;
                color: ${textColor} !important;
                border: 1px solid ${getRgba(textColor, 0.1)} !important;
                transition: background-color 0.3s ease;
            }

            /* ═══ 2. ТАБЫ (только внутри tabsList) ═══ */
            [class*="mantine-Tabs-tabsList"] [class*="mantine-Tabs-tab"],
            [class*="mantine-Tabs-tabsList"] [class*="ConversationScreen_Tab__"] {
                color: ${textColor} !important;
                background-color: transparent !important;
            }
            [class*="mantine-Tabs-tabsList"] [class*="mantine-Tabs-tab"]:hover,
            [class*="mantine-Tabs-tabsList"] [class*="ConversationScreen_Tab__"]:hover {
                background-color: ${getRgba(textColor, 0.08)} !important;
            }
            [class*="mantine-Tabs-tabsList"] [class*="mantine-Tabs-tab"][data-active="true"],
            [class*="mantine-Tabs-tabsList"] [class*="ConversationScreen_Tab__"][data-active="true"] {
                background-color: ${getRgba(textColor, 0.15)} !important;
                border-bottom-color: #7c4dff !important;
            }

            /* ═══ 3. ОСНОВНЫЕ КОНТЕЙНЕРЫ + МОДАЛКИ ═══ */
            [class*="Operator_Root"], [class*="Layout_Header"], [class*="ChatMessages_Root"],
            [class*="ConversationScreen_Messages"], [class*="ConversationScreen_Header"],
            [class*="text-editor_Toolbar"],
            [class*="mantine-Modal-modal"],
            [class*="mantine-Paper-root"][class*="Modal_"] {
                background-color: ${color} !important;
            }

            /* ═══ 4. РЕДАКТОР ═══ */
            [class*="mantine-RichTextEditor"],
            [class*="text-editor_Content"],
            .ProseMirror {
                background-color: ${color} !important;
                color: ${textColor} !important;
            }
            [data-rich-text-editor-control="true"],
            [class*="mantine-RichTextEditor-control"] {
                background: transparent !important;
                border: none !important;
            }

            /* ═══ 5. ТЕКСТ В МОДАЛКАХ ═══ */
            [class*="mantine-Modal-modal"] [class*="mantine-Text-root"],
            [class*="mantine-Modal-modal"] [class*="mantine-Modal-title"],
            [class*="mantine-Modal-modal"] [class*="mantine-Input-input"] {
                color: ${textColor} !important;
            }

            /* ═══ 6. КНОПКИ ═══ */
            [class*="Buttons_SharedButton"],
            [class*="Operator_TakeRequestButton"] {
                background-color: ${getRgba(textColor, 0.05)} !important;
                color: ${textColor} !important;
                border: 1px solid ${getRgba(textColor, 0.1)} !important;
            }

            /* ═══ 7. ОБЩАЯ ТИПОГРАФИКА (базовая, будет перебита специфичными ниже) ═══ */
            [class*="Typography_Typography"],
            [class*="ChatMessages_Author"],
            [class*="ChatMessages_Date"],
            [id*="mantine-"][id*="-target"] {
                background: transparent !important;
                background-color: transparent !important;
                color: ${textColor} !important;
            }

            /* ═══ 8. ФИКСЫ ═══ */
            [class*="UserInfo_UserIdContainer"] {
                color: #ffffff !important;
                opacity: 1 !important;
            }
            [style*="background-color"]:not([style*="rgb(255, 255, 255)"]):not([style*="#fff"]):not([style*="#FFF"]):not([style*="white"]) {
            }

                      /* ═══ 9. ОБЩИЙ ФОН ДЛЯ ОБЫЧНЫХ СООБЩЕНИЙ (серый) ═══ */
            [class*="ChatMessages_RegularMessage__"]:not([data-author-type="bot"]):not([data-author-type="user"]):not([data-author-type="user-with-bot"]) {
                background-color: rgba(255, 255, 255, 0.05) !important;
                border-radius: 8px !important;
                padding: 3px 6px !important;
                margin: 2px 0 !important;
            }
            [class*="ChatMessages_RegularMessageHeader"] {
                background: transparent !important;
                padding: 2px 4px !important;
            }
            [class*="ChatMessages_HtmlContent__"] {
                background-color: rgba(255, 255, 255, 0.04) !important;
                color: ${textColor} !important;
                border-radius: 0 0 6px 6px;
                padding: 4px 6px !important;
                display: block !important;
            }

            /* ═══ 10. БОТ — зелёный ═══ */
            [class*="ChatMessages_RegularMessage__"][data-author-type="bot"] {
                background-color: rgba(46, 125, 50, 0.22) !important;
                border: 1px solid rgba(76, 175, 80, 0.35) !important;
                border-radius: 8px !important;
                padding: 3px 6px !important;
                margin: 2px 0 !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-author-type="bot"] [class*="ChatMessages_Author__"],
            [class*="ChatMessages_RegularMessage__"][data-author-type="bot"] [class*="ChatMessages_Date__"],
            [class*="ChatMessages_RegularMessage__"][data-author-type="bot"] [class*="ChatMessages_HtmlContent__"] {
                color: #e8f5e9 !important;
                background: transparent !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-author-type="bot"] [class*="Buttons_SharedButton__"] {
                background-color: rgba(255, 255, 255, 0.08) !important;
                color: #c8e6c9 !important;
                border-color: rgba(76, 175, 80, 0.4) !important;
            }

            /* ═══ 11. USER-WITH-BOT — тоже зелёный ═══ */
            [class*="ChatMessages_RegularMessage__"][data-author-type="user-with-bot"] {
                background-color: rgba(46, 125, 50, 0.22) !important;
                border: 1px solid rgba(76, 175, 80, 0.35) !important;
                border-radius: 8px !important;
                padding: 3px 6px !important;
                margin: 2px 0 !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-author-type="user-with-bot"] [class*="ChatMessages_Author__"],
            [class*="ChatMessages_RegularMessage__"][data-author-type="user-with-bot"] [class*="ChatMessages_Date__"],
            [class*="ChatMessages_RegularMessage__"][data-author-type="user-with-bot"] [class*="ChatMessages_HtmlContent__"] {
                color: #e8f5e9 !important;
                background: transparent !important;
            }

            /* ═══ 12. USER (Вы) — янтарно-оранжевый ═══ */
            [class*="ChatMessages_RegularMessage__"][data-author-type="user"] {
                background-color: rgba(255, 152, 0, 0.2) !important;
                border: 1px solid rgba(255, 152, 0, 0.4) !important;
                border-radius: 8px !important;
                padding: 3px 6px !important;
                margin: 2px 0 !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-author-type="user"] [class*="ChatMessages_Author__"],
            [class*="ChatMessages_RegularMessage__"][data-author-type="user"] [class*="ChatMessages_Date__"],
            [class*="ChatMessages_RegularMessage__"][data-author-type="user"] [class*="ChatMessages_HtmlContent__"] {
                color: #fff3e0 !important;
                background: transparent !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-author-type="user"] [class*="ChatMessages_Author__"] {
                font-weight: 600 !important;
            }

            /* ═══ 13. ЗАМЕТКИ (CommentMessagesGroup) — серый ═══ */
            [class*="ChatMessages_CommentMessagesGroup__"] {
                background-color: rgba(96, 125, 139, 0.25) !important;
                border: 1px solid rgba(96, 125, 139, 0.4) !important;
                border-radius: 8px !important;
                padding: 4px 8px !important;
                margin: 3px 0 !important;
            }
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_RegularMessage__"] {
                background: transparent !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_Author__"],
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_Date__"],
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_HtmlContent__"] {
                color: #eceff1 !important;
                background: transparent !important;
            }
            /* ССЫЛКИ В ЗАМЕТКАХ */
            [class*="ChatMessages_CommentMessagesGroup__"] a,
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_HtmlContent__"] a {
                color: #81d4fa !important;
                text-decoration: underline !important;
                text-underline-offset: 2px !important;
            }
            [class*="ChatMessages_CommentMessagesGroup__"] a:hover {
                color: #b3e5fc !important;
            }

                        /* ═══ 14. QUICK TAGS ОКОШКО ═══ */
            #quickTagsdiv {
                background-color: ${getRgba(color, 0.85)} !important;
                border: 1px solid ${getRgba(textColor, 0.15)} !important;
                border-radius: 10px !important;
                padding: 8px !important;
                backdrop-filter: blur(10px) !important;
            }
            #quickTagsdiv a {
                color: ${textColor} !important;
                text-decoration: none !important;
                transition: all 0.15s ease !important;
            }
            #quickTagsdiv a:hover {
                color: #ffffff !important;
                text-decoration: underline !important;
                text-underline-offset: 2px !important;
            }
            /* Специальные цветные теги — яркие для тёмной темы */
            #quickTagsdiv #svyazsU a,
            #quickTagsdiv #PNO a {
                color: #4fc3f7 !important; /* яркий голубой */
            }
            #quickTagsdiv #svyazsP a,
            #quickTagsdiv #UNO a {
                color: #ff6b81 !important; /* яркий розовый */
            }

                        /* ═══ 15. POPOVER / DROPDOWN / AUTOCOMPLETE (выбор темы) ═══ */
            [class*="mantine-Popover-dropdown"],
            [class*="Autocomplete_Dropdown__"] {
                background-color: ${color} !important;
                border: 1px solid ${getRgba(textColor, 0.15)} !important;
                box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
            }
            [class*="mantine-Popover-dropdown"] label,
            [class*="mantine-Popover-dropdown"] [class*="Typography_Type_label__"] {
                color: ${textColor} !important;
            }
            [class*="mantine-Popover-dropdown"] input,
            [class*="mantine-Select-input"],
            [class*="mantine-Input-input"] {
                background-color: ${getRgba(textColor, 0.08)} !important;
                color: ${textColor} !important;
                border-color: ${getRgba(textColor, 0.2)} !important;
            }
            [class*="mantine-Select-item"] {
                color: ${textColor} !important;
                background-color: transparent !important;
            }
            [class*="mantine-Select-item"]:hover,
            [class*="mantine-Select-item"][data-selected="true"],
            [class*="mantine-Select-item"][aria-selected="true"] {
                background-color: ${getRgba(textColor, 0.12)} !important;
            }
            [class*="mantine-Select-rightSection"] svg {
                color: ${textColor} !important;
            }

            /* Switch внутри дропдауна */
            [class*="mantine-Switch-track"] {
                background-color: ${getRgba(textColor, 0.2)} !important;
                border-color: ${getRgba(textColor, 0.3)} !important;
            }
            [class*="mantine-Switch-input"]:checked + [class*="mantine-Switch-track"] {
                background-color: #4caf50 !important;
            }
            [class*="mantine-Switch-thumb"] {
                background-color: ${textColor} !important;
            }

                        /* ═══ 16. DROPDOWN ДЕЙСТВИЙ (ConversationActions) ═══ */
            [class*="ConversationActions_ActionDropdown__"],
            [class*="Popover_Dropdown__"] {
                background-color: ${color} !important;
                border: 1px solid ${getRgba(textColor, 0.15)} !important;
            }
            [class*="ConversationActions_ActionDropdown__"] [class*="List_List__"],
            [class*="Popover_Dropdown__"] [class*="List_List__"] {
                background-color: transparent !important;
            }
            [class*="ConversationActions_ActionDropdown__"] [class*="List_Item__"],
            [class*="Popover_Dropdown__"] [class*="List_Item__"] {
                background-color: transparent !important;
            }
            [class*="ConversationActions_ActionDropdown__"] [class*="mantine-NavLink-root"],
            [class*="Popover_Dropdown__"] [class*="mantine-NavLink-root"] {
                background-color: transparent !important;
                color: ${textColor} !important;
            }
            [class*="ConversationActions_ActionDropdown__"] [class*="mantine-NavLink-label"],
            [class*="Popover_Dropdown__"] [class*="mantine-NavLink-label"],
            [class*="ConversationActions_ActionDropdown__"] [class*="mantine-NavLink-description"],
            [class*="Popover_Dropdown__"] [class*="mantine-NavLink-description"] {
                color: ${textColor} !important;
            }
            [class*="ConversationActions_ActionDropdown__"] [class*="List_Item__"]:hover [class*="mantine-NavLink-root"],
            [class*="Popover_Dropdown__"] [class*="List_Item__"]:hover [class*="mantine-NavLink-root"] {
                background-color: ${getRgba(textColor, 0.1)} !important;
            }
            /* Стрелка поповера */
            [class*="mantine-Popover-arrow"] {
                background-color: ${color} !important;
                border-color: ${getRgba(textColor, 0.15)} !important;
            }

                        /* ═══ 17. SELECT DROPDOWN (список отделов и т.д.) ═══ */
            [class*="mantine-Select-dropdown"] {
                background-color: ${color} !important;
                border: 1px solid ${getRgba(textColor, 0.15)} !important;
            }
            [class*="mantine-Select-dropdown"] [class*="mantine-ScrollArea-viewport"],
            [class*="mantine-Select-dropdown"] [class*="mantine-Select-itemsWrapper"] {
                background-color: transparent !important;
            }
            /* Элемент списка */
            [class*="Combobox_Item__"],
            [class*="mantine-Select-item"] {
                color: ${textColor} !important;
                background-color: transparent !important;
            }
            /* Ховер / выделение клавишами */
            [class*="Combobox_Item__"][data-hovered="true"],
            [class*="mantine-Select-item"][data-hovered="true"],
            [class*="Combobox_Item__"]:hover,
            [class*="mantine-Select-item"]:hover {
                background-color: ${getRgba(textColor, 0.12)} !important;
            }
            /* Активный / выбранный */
            [class*="Combobox_Item__"][data-selected="true"],
            [class*="mantine-Select-item"][data-selected="true"] {
                background-color: ${getRgba(textColor, 0.18)} !important;
            }
            /* SVG галочка внутри */
            [class*="Combobox_Item__"] svg path {
                fill: ${textColor} !important;
            }
            /* Скроллбар внутри дропдауна */
            [class*="mantine-Select-dropdown"] [class*="mantine-ScrollArea-thumb"] {
                background-color: ${getRgba(textColor, 0.25)} !important;
            }

                        /* ═══ 18. TEXTAREA (комментарии) ═══ */
            [class*="Inputs_TextArea__"] {
                background-color: ${getRgba(textColor, 0.08)} !important;
                color: ${textColor} !important;
                border: 1px solid ${getRgba(textColor, 0.2)} !important;
                border-radius: 8px !important;
                padding: 8px 12px !important;
            }
            [class*="Inputs_TextArea__"]::placeholder {
                color: ${getRgba(textColor, 0.4)} !important;
            }
            [class*="Inputs_TextArea__"]:focus {
                border-color: #7c4dff !important;
                background-color: ${getRgba(textColor, 0.12)} !important;
                outline: none !important;
            }
                            /* ═══ 19. CHECKBOX LABEL ═══ */
            [class*="mantine-Checkbox-label"],
            label[class*="mantine-"][for*="mantine-"] {
                color: ${textColor} !important;
            }
            /* Сам чекбокс (квадратик) */
            [class*="mantine-Checkbox-input"] {
                background-color: ${getRgba(textColor, 0.08)} !important;
                border-color: ${getRgba(textColor, 0.3)} !important;
            }
            [class*="mantine-Checkbox-input"]:checked {
                background-color: #7c4dff !important;
                border-color: #7c4dff !important;
            }
                            /* ═══ 20. EMPTY STATE (пустые рекомендации и т.д.) ═══ */
            [class*="Empty_EmptyCard__"] {
                background-color: ${getRgba(textColor, 0.06)} !important;
                border: 1px solid ${getRgba(textColor, 0.1)} !important;
                border-radius: 10px !important;
                padding: 16px !important;
            }
            [class*="Empty_Label__"],
            [class*="Empty_Description__"],
            [class*="Suggestions_EmptyPossibleAnswersLabel__"],
            [class*="Suggestions_EmptyPossibleAnswers__"] [class*="Typography_Type_body-description__"] {
                color: ${textColor} !important;
                background: transparent !important;
            }

                        /* ═══ 21. CHIPS / MULTISELECT VALUES ═══ */
            [class*="Chips_Chip__"],
            [class*="mantine-MultiSelect-value"] {
                background-color: ${getRgba(textColor, 0.1)} !important;
                border: 1px solid ${getRgba(textColor, 0.2)} !important;
                color: ${textColor} !important;
            }
            [class*="Chips_Chip__"] [class*="Chips_Label__"],
            [class*="mantine-MultiSelect-value"] [class*="Typography_Type_body-description__"] {
                color: ${textColor} !important;
            }
            /* Кнопка-крестик внутри чипсы */
            [class*="Chips_Chip__"] [class*="Chips_CloseIcon__"] {
                color: ${textColor} !important;
            }
            [class*="Chips_Chip__"] [class*="Chips_CloseIcon__"]:hover {
                color: #ffffff !important;
                background-color: rgba(255, 255, 255, 0.1) !important;
                border-radius: 50% !important;
            }

                        /* ═══ 22. INPUT (поиск и др.) ═══ */
            [class*="Inputs_Input__"],
            input[class*="Inputs_"] {
                background-color: ${getRgba(textColor, 0.08)} !important;
                color: ${textColor} !important;
                border: 1px solid ${getRgba(textColor, 0.2)} !important;
                border-radius: 8px !important;
                padding: 8px 12px !important;
            }
            [class*="Inputs_Input__"]::placeholder,
            input[class*="Inputs_"]::placeholder {
                color: ${getRgba(textColor, 0.4)} !important;
            }
            [class*="Inputs_Input__"]:focus,
            input[class*="Inputs_"]:focus {
                border-color: #7c4dff !important;
                background-color: ${getRgba(textColor, 0.12)} !important;
                outline: none !important;
            }
            /* Иконка внутри инпута */
            [class*="Inputs_WithIcon__"] svg,
            [class*="Inputs_WithIcon__"] [class*="mantine-Input-icon"] {
                color: ${getRgba(textColor, 0.5)} !important;
            }

            /* ═══ 23. HISTORY / ИСТОРИЯ ДИАЛОГОВ ═══ */
            [class*="History_ListItem__"],
            [class*="History_ConversationHeader__"],
            [class*="History_ConversationBody__"] {
                background-color: transparent !important;
                color: ${textColor} !important;
            }
            [class*="History_ListItem__"] {
                border-bottom: 1px solid ${getRgba(textColor, 0.08)} !important;
            }
            [class*="History_ListItem__"] [class*="Typography_Type_body__"],
            [class*="History_InitMessage__"],
            [class*="History_ConversationBody__"] span {
                color: ${textColor} !important;
                background: transparent !important;
            }
            /* SVG стрелка в истории */
            [class*="History_Arrow__"] path {
                fill: ${getRgba(textColor, 0.5)} !important;
            }
            /* Кнопка-копировать в шапке истории */
            [class*="History_ConversationHeader__"] button svg {
                color: ${textColor} !important;
            }
            [class*="History_ConversationHeader__"] button:hover svg {
                color: #ffffff !important;
            }

                        /* ═══ 24. SANITIZED HTML (текст внутри сообщений) ═══ */
            [class*="SanitizedHtml_SanitizedHtml__"] {
                color: ${textColor} !important;
                background: transparent !important;
            }
                            /* ═══ 25. ACCORDION / SUGGESTIONS (подсказки ответов) ═══ */
            [class*="mantine-Accordion-control"],
            [class*="Suggestions_SuggestionPreviewWrapper__"] {
                background-color: transparent !important;
                color: ${textColor} !important;
            }
            [class*="mantine-Accordion-control"]:hover,
            [class*="Suggestions_SuggestionPreviewWrapper__"]:hover {
                background-color: ${getRgba(textColor, 0.08)} !important;
            }
            [class*="mantine-Accordion-control"][data-active="true"],
            [class*="Suggestions_SuggestionPreviewWrapper__"][data-active="true"] {
                background-color: ${getRgba(textColor, 0.12)} !important;
            }
            /* Текст внутри аккордеона */
            [class*="Suggestions_SuggestionPreview__"] [class*="Typography_Type_body-description__"],
            [class*="Suggestions_SuggestionPreview__"] [class*="Typography_Type_body__"],
            [class*="Suggestions_SuggestionPreview__"] [class*="SanitizedHtml_SanitizedHtml__"] {
                color: ${textColor} !important;
                background: transparent !important;
            }
            /* Стрелка аккордеона */
            [class*="mantine-Accordion-chevron"] svg {
                color: ${textColor} !important;
            }
        `;
        }

        const injectStyle = (targetDoc, styleId) => {
            if (!targetDoc || !targetDoc.head) return;
            let styleEl = targetDoc.getElementById(styleId);
            if (!styleEl) {
                styleEl = targetDoc.createElement('style');
                styleEl.id = styleId;
                targetDoc.head.appendChild(styleEl);
            }
            styleEl.innerHTML = cssRules;
        };

        injectStyle(document, 'chmaf-bg-main');
        const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
        if (iframe) {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) injectStyle(iframeDoc, 'chmaf-bg-iframe');
        }
    };
    // Применяем при запуске.
    // Ставим setInterval, так как iframe загружается с задержкой или может быть пересоздан SPA-роутером
    applyAppBgColor();
    setInterval(applyAppBgColor, 2000);
    // ====================================================================================


    // --- UI Component (Scoped Glassmorphism Styles) ---
    const injectStyles = () => {
        if (document.getElementById('chmaf-settings-styles')) return;
        const style = document.createElement('style');
        style.id = 'chmaf-settings-styles';
        style.innerHTML = `
            .set-glass-panel { background: rgba(30, 32, 45, 0.8) !important; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1) !important; border-radius: 20px; color: #e0e0e0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5); padding: 0 !important; overflow: hidden; z-index: 1000001; }
            .set-glass-header { background: rgba(255, 255, 255, 0.07); padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1); cursor: grab; }
            .set-glass-content { padding: 20px; max-height: 80vh; overflow-y: auto; }
            .set-glass-content::-webkit-scrollbar { width: 6px; }
            .set-glass-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
            .set-group { background: rgba(255, 255, 255, 0.04); border-radius: 14px; padding: 16px; margin-bottom: 16px; border: 1px solid rgba(255, 255, 255, 0.06); }
            .set-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: nowrap; }
            .set-label { color: #bbb; font-size: 0.9em; min-width: 140px; flex-shrink: 0; }
            .set-btn { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); color: #fff; padding: 6px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; white-space: nowrap; }
            .set-btn:hover { background: rgba(255, 255, 255, 0.15); transform: translateY(-1.5px); border-color: rgba(255,255,255,0.2); }
            .set-btn:active { transform: translateY(0.5px); }
            .set-btn.active { background: #388e3c; border-color: #4caf50; }
            .set-input { background: rgba(0, 0, 0, 0.4); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #fff; padding: 6px 12px; outline: none; font-size: 13px; transition: all 0.2s; }
            .set-input:focus { border-color: #7c4dff; background: rgba(0,0,0,0.5); }
            .set-select { background: #1e202d; color: #fff; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; padding: 6px; font-size: 13px; outline: none; }
            .set-slider { flex-grow: 1; accent-color: #7c4dff; height: 4px; cursor: pointer; }
            .set-dept-badge { flex: 1; font-size: 12px; font-weight: 600; text-align: center; padding: 8px 4px; }
            .set-grid-colors { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; }
            .set-color-wrap { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; color: #999; }

            /* Стили для круглых кнопок-пресетов */
            .bg-preset { width: 32px !important; height: 32px !important; padding: 0 !important; border-radius: 50% !important; border: 2px solid rgba(255, 255, 255, 0.2) !important; }
        `;
        document.head.appendChild(style);
    };

    const win_Settings = `
        <div class="set-glass-panel" style="width: 540px" id="settings_container">
            <div class="set-glass-header" id="settings_head">
                <span style="font-weight: 600; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 18px;">⚙</span> Настройки ChMAF
                </span>
                <button id="hideMeSettings" class="buttonHide" style="padding: 4px 10px; font-size: 11px; opacity: 0.8;">hide</button>
            </div>

            <div class="set-glass-content">
                <!-- Аудио и Масштаб -->
                <div class="set-group">
                    <div class="set-row">
                        <select id="soundlistaddr" class="set-select" style="width: 190px; text-align:center;">
                            <option selected disabled>Звук уведомления</option>
                            <option value="othersound">Свой звук...</option>
                        </select>
                        <button class="set-btn" id="sound_test" title="Проверить">▶</button>
                        <label class="checkbox-audio" style="margin-left: auto;">
                            <input id="audioswitcher" type="checkbox">
                            <span class="checkbox-audio-switch"></span>
                        </label>
                    </div>

                    <div class="set-row" id="custom_sound_row" style="display: none;">
                        <input class="set-input" id="sound_adr" placeholder="URL звука" style="width: 100%;">
                        <button class="set-btn" id="sound_save">💾</button>
                    </div>

                    <div class="set-row">
                        <span class="set-label">Громкость</span>
                        <input id="range" type="range" class="set-slider" min="0" max="1" step="0.05">
                    </div>

                    <div class="set-row">
                        <span class="set-label">Масштаб окна</span>
                        <input id="scaleSliderAF" type="range" class="set-slider" min="50" max="100" step="1">
                        <span id="scale_val" style="min-width: 40px; text-align: right; font-size: 12px; font-family: monospace;">100%</span>
                    </div>

                    <div class="set-row">
                        <span class="set-label">Интервал звука (сек)</span>
                        <input class="set-input" id="soundplayinterval" type="number" style="width: 65px; text-align: center;">
                        <button class="set-btn" id="setsoundplayinterval">SET⌚</button>
                    </div>
                </div>

                <!-- Темы и Цвета -->
                <div class="set-group">

                    <!-- Выбор фона приложения -->
                    <div class="set-row" style="margin-top: 5px; flex-direction: column; align-items: flex-start; background: rgba(0,0,0,0.15); padding: 12px; border-radius: 10px;">
                        <span class="set-label" style="margin-bottom: 8px;">Цвет фона диалогов:</span>
                        <div style="display: flex; gap: 12px; width: 100%; align-items: center;">
                            <input type="color" id="appBgColorPicker" class="set-input" title="Свой цвет" style="padding:0; width:34px; height:34px; border-radius:8px; cursor:pointer; flex-shrink: 0;">
                            <div style="width: 1px; height: 25px; background: rgba(255,255,255,0.2); margin: 0 4px;"></div>

                            <button class="set-btn bg-preset" data-color="#FFFFFF" title="Белый (Дефолт)" style="background:#FFFFFF;"></button>
                            <button class="set-btn bg-preset" data-color="#2B2D30" title="Darcula (JetBrains)" style="background:#2B2D30;"></button>
                            <button class="set-btn bg-preset" data-color="#282C34" title="One Dark" style="background:#282C34;"></button>
                            <button class="set-btn bg-preset" data-color="#22272e" title="GitHub Dark" style="background:#22272e;"></button>
                            <button class="set-btn bg-preset" data-color="#1A1B26" title="Tokyo Night" style="background:#1A1B26;"></button>
                            <button class="set-btn bg-preset" data-color="#1E1E2E" title="Catppuccin (Пастель)" style="background:#1E1E2E;"></button>
                            <button class="set-btn bg-preset" data-color="#2E3440" title="Nord (Холодная)" style="background:#2E3440;"></button>
                        </div>
                    </div>

                    <div class="set-row" style="margin-top: 15px;">
                        <div class="set-grid-colors">
                            <div class="set-color-wrap">
                                <input type="color" id="aclstimepicker" class="set-input" style="padding:0; width:34px; height:34px; border-radius:50%; border:2px solid rgba(255,255,255,0.1); cursor:pointer;">
                                <span>Закрытие</span>
                            </div>
                            <div class="set-color-wrap">
                                <input type="color" id="answtimepicker" class="set-input" style="padding:0; width:34px; height:34px; border-radius:50%; border:2px solid rgba(255,255,255,0.1); cursor:pointer;">
                                <span>Новый</span>
                            </div>
                            <div class="set-color-wrap">
                                <input type="color" id="responstimepicker" class="set-input" style="padding:0; width:34px; height:34px; border-radius:50%; border:2px solid rgba(255,255,255,0.1); cursor:pointer;">
                                <span>Ожидание</span>
                            </div>
                        </div>
                    </div>
                    <div class="set-row" style="margin-top: 5px;">
                         <span class="set-label">Статус при входе</span>
                         <select id="defaultStatusAfterLogin" class="set-select" style="flex: 1; text-align:center;">
                            <option value="Online">🟢 Онлайн</option>
                            <option value="Busy">🟡 Занят</option>
                            <option value="Offline">🔴 Офлайн</option>
                        </select>
                    </div>
                </div>

                <!-- Функционал -->
                <div class="set-group onlyfortp">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85em; color: #ccc;">
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="hidelpmwindow"> Скрыть окно У/П</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="showquicktags"> Быстрые тэги в меню</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="hideInnerTaskCreate"> Скрыть окно задач</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="dblhidewindow"> Отключить dblclick hide</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="brnotificatios"> Отключить Notifications</label>
                        <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" id="clearlessoninfo"> Не очищать LessonInfo</label>
                    </div>
                </div>

                <!-- Отделы и Тестовые ID -->
                <div class="set-group">
                    <div class="set-row">
                        <button class="set-btn set-dept-badge" id="set_TP">ТП</button>
                        <button class="set-btn set-dept-badge" id="set_TPrezerv">ТП рез</button>
                        <button class="set-btn set-dept-badge" id="set_KC">КЦ</button>
                        <button class="set-btn set-dept-badge" id="set_KCrezerv">КЦ рез</button>
                    </div>
                    <div class="set-row onlyfortp" style="margin-top: 10px;">
                        <div style="display: grid; grid-template-columns: 1fr 40px 1fr 40px; gap: 8px; width: 100%; align-items: center;">
                            <input class="set-input" id="test_std" placeholder="ID Ученика" style="width: 100%; box-sizing: border-box; text-align:center;">
                            <button class="set-btn" id="setteststd" style="padding: 6px 0; width: 100%;">💾</button>
                            <input class="set-input" id="test_teach" placeholder="ID Препода" style="width: 100%; box-sizing: border-box; text-align:center;">
                            <button class="set-btn" id="settestteach" style="padding: 6px 0; width: 100%;">💾</button>
                        </div>
                    </div>
                </div>

                <!-- Backup -->
                <div class="set-row" style="justify-content: center; gap: 20px; margin-top: 10px; margin-bottom: 0;">
                    <button class="set-btn" id="savesettingstofile" style="background: rgba(124, 77, 255, 0.15); border-color: rgba(124, 77, 255, 0.3);">💾 Экспорт</button>
                    <label class="set-btn" for="fileinput" style="background: rgba(255, 255, 255, 0.05);">⤵ Импорт</label>
                    <input type="file" id="fileinput" style="display:none;">
                </div>
            </div>
        </div>
    `;

    injectStyles();
    createWindow('AF_Settings', 'winTopSettings', 'winLeftSettings', win_Settings);
    hideWindowOnDoubleClick('AF_Settings');
    hideWindowOnClick('AF_Settings', 'hideMeSettings');

    // --- Helpers ---
    const bindToggle = (id, key, cb) => {
        const el = document.getElementById(id);
        el.checked = Settings.get(key) == 1;
        el.onclick = () => {
            const val = el.checked ? 1 : 0;
            Settings.set(key, val);
            cb?.(val);
        };
        cb?.(el.checked ? 1 : 0);
    };

    const bindInput = (id, key) => {
        const el = document.getElementById(id);
        el.value = Settings.get(key);
        el.onchange = () => Settings.set(key, el.value);
    };

    // --- Initialization & Event Listeners ---
    const ui = {
        btnSetting: document.getElementById('setting'),
        win: document.getElementById('AF_Settings'),
        soundList: document.getElementById('soundlistaddr'),
        statusList: document.getElementById('defaultStatusAfterLogin'),
        scaleSlider: document.getElementById('scaleSliderAF'),
        scaleVal: document.getElementById('scale_val'),
    };

    const applyScale = (val, isInit = false) => {
        const target = document.getElementById('AF_helper') || document.getElementById('addTmpWrapper');
        if (target) {
            target.style.transformOrigin = 'top left';
            target.style.transform = `scale(${val / 100})`;
            if (!isInit) target.style.transition = 'transform 0.15s ease-out';
        }
        const scaleValEl = document.getElementById('scale_val');
        if (scaleValEl) scaleValEl.innerText = `${val}%`;
    };

    setTimeout(() => applyScale(Settings.get('AF_windowScale'), true), 100);

    ui.btnSetting.onclick = () => {
        ui.win.style.display = ui.win.style.display === 'none' ? '' : 'none';
        if (ui.win.style.display === 'none') return;

        bindInput('aclstimepicker', 'defaclschatcolor');
        bindInput('answtimepicker', 'answchatcolor');
        bindInput('responstimepicker', 'responschatcolor');
        bindInput('test_std', 'test_stud');
        bindInput('test_teach', 'test_teach');
        bindInput('soundplayinterval', 'splinter');

        bindToggle('hideInnerTaskCreate', 'hideTaskWindow');
        bindToggle('showquicktags', 'showquicktags');
        bindToggle('dblhidewindow', 'dblhidewindow');
        bindToggle('brnotificatios', 'brnotificatios');
        bindToggle('clearlessoninfo', 'clearlessoninfo');

        bindToggle('hidelpmwindow', 'disablelpmwindow', (v) => {
            const lpm = document.getElementById('TestUsers');
            if (lpm) lpm.style.display = v == 1 ? 'none' : '';
        });

        bindToggle('audioswitcher', 'audio', (v) => {
            if (v == 0 && typeof soundintervalset !== 'undefined') {
                clearInterval(soundintervalset);
                soundintervalset = null;
            }
        });

        // --- Логика для Цвета Фона ---
        const bgPicker = document.getElementById('appBgColorPicker');
        bgPicker.value = Settings.get('appBgColor');

        bgPicker.oninput = (e) => {
            Settings.set('appBgColor', e.target.value);
            applyAppBgColor(); // Применяем сразу (и в main, и в iframe)
        };

        document.querySelectorAll('.bg-preset').forEach(btn => {
            btn.onclick = () => {
                const color = btn.getAttribute('data-color');
                bgPicker.value = color;
                Settings.set('appBgColor', color);
                applyAppBgColor();
            };
        });

        // Volume
        const range = document.getElementById('range');
        range.value = Settings.get('audiovol');
        range.oninput = () => {
            Settings.set('audiovol', range.value);
            if (typeof audio !== 'undefined' && audio) audio.volume = range.value;
        };

        // Scale
        const scaleVal = Settings.get('AF_windowScale');
        ui.scaleSlider.value = scaleVal;
        ui.scaleVal.innerText = `${scaleVal}%`;
        ui.scaleSlider.oninput = () => applyScale(ui.scaleSlider.value);
        ui.scaleSlider.onchange = () => Settings.set('AF_windowScale', ui.scaleSlider.value);

        // Status
        ui.statusList.value = Settings.get('afterLoginFunction');
        ui.statusList.onchange = () => {
            Settings.set('afterLoginFunction', ui.statusList.value);
            const colors = { Online: '#388e3c', Busy: '#fbc02d', Offline: '#d32f2f' };
            ui.statusList.style.background = colors[ui.statusList.value];
        };
        ui.statusList.dispatchEvent(new Event('change'));

        const isTP = (opsection === 'ТП' || opsection === 'ТП ОС');
        document.querySelectorAll('.onlyfortp').forEach(el => el.style.display = isTP ? '' : 'none');

        const activeAddr = localStorage.getItem('scriptAdr');
        const deptMap = { [ADDR.TP]: 'set_TP', [ADDR.TP_Rzrv]: 'set_TPrezerv', [ADDR.KC]: 'set_KC', [ADDR.KC_Rzrv]: 'set_KCrezerv' };
        if (deptMap[activeAddr]) document.getElementById(deptMap[activeAddr]).classList.add('active');
    };

    // --- Audio Logic ---
    ui.soundList.onchange = () => {
        const val = ui.soundList.value;
        const row = document.getElementById('custom_sound_row');
        if (val === 'othersound') {
            row.style.display = 'flex';
        } else {
            row.style.display = 'none';
            Settings.set('sound_str', val);
            audio = new Audio(val);
            audio.volume = parseFloat(Settings.get('audiovol'));
        }
    };

    document.getElementById('sound_test').onclick = function () {
        const isPlay = this.innerText === '▶';
        this.innerText = isPlay ? '⏹' : '▶';
        if (isPlay && typeof audio !== 'undefined' && audio) {
            audio.play().catch(e => console.error('Audio play error:', e));
            setTimeout(() => { if (this.innerText === '⏹') this.innerText = '▶'; }, (audio.duration || 2) * 1000);
        } else if (typeof audio !== 'undefined' && audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    };

    document.getElementById('sound_save').onclick = () => {
        const url = document.getElementById('sound_adr').value;
        if (!url) return;
        Settings.set('sound_str', url);
        audio = new Audio(url);
        audio.volume = parseFloat(Settings.get('audiovol'));
        document.getElementById('sound_save').innerText = '✅';
        setTimeout(() => document.getElementById('sound_save').innerText = '💾', 2000);
    };

    if (ui.soundList.length < 3) {
        try {
            const resp = await fetch('https://script.google.com/macros/s/AKfycbyD1l-oLcE-BBmyN1QmcHKoi0rwVfCwWjE6cfTqw6Y9QQGAju-9inKbwSOfHCI6qBEjtg/exec');
            const data = await resp.json();
            data.result.forEach(s => {
                if (s[0]) {
                    const opt = new Option(s[0], s[1]);
                    ui.soundList.add(opt);
                    if (s[1] === Settings.get('sound_str')) opt.selected = true;
                }
            });
        } catch (e) { console.error('Failed to load sounds', e); }
    }

    // --- Save IDs ---
    document.getElementById('setteststd').onclick = () => {
        Settings.set('test_stud', document.getElementById('test_std').value);
        document.getElementById('setteststd').innerText = '✅';
        setTimeout(() => document.getElementById('setteststd').innerText = '💾', 2000);
    };
    document.getElementById('settestteach').onclick = () => {
        Settings.set('test_teach', document.getElementById('test_teach').value);
        document.getElementById('settestteach').innerText = '✅';
        setTimeout(() => document.getElementById('settestteach').innerText = '💾', 2000);
    };

    // --- Department Switchers ---
    const setDept = (addr, isTP) => {
        localStorage.setItem('scriptAdr', addr);
        if (isTP) localStorage.setItem('tpflag', 'ТП');
        else localStorage.removeItem('tpflag');
        location.reload();
    };

    document.getElementById('set_KC').onclick = () => setDept(ADDR.KC, false);
    document.getElementById('set_KCrezerv').onclick = () => setDept(ADDR.KC_Rzrv, false);
    document.getElementById('set_TP').onclick = () => setDept(ADDR.TP, true);
    document.getElementById('set_TPrezerv').onclick = () => setDept(ADDR.TP_Rzrv, true);

    // --- Backup Logic ---
    document.getElementById('savesettingstofile').onclick = () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            data[k] = localStorage.getItem(k);
        }
        const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `chmaf_settings_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    };

    document.getElementById('fileinput').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target.result);
                Object.entries(json).forEach(([k, v]) => localStorage.setItem(k, v));
                createAndShowButton?.('Настройки загружены! Перезагрузка...', 'message');
                setTimeout(() => location.reload(), 1500);
            } catch (err) { alert('Ошибка формата файла'); }
        };
        reader.readAsText(file);
    };

    // --- Status Painting ---
    const paintStatus = () => {
        const statusElem = document.querySelectorAll('.user_menu-status-name')[1];
        if (!statusElem) return;

        const map = { "Офлайн": "red", "Перерыв": "red", "Онлайн": "green", "Занят": "yellow" };
        const color = map[statusElem.textContent];
        if (color) {
            statusElem.style.background = color;
            statusElem.style.color = color === 'yellow' ? 'black' : 'white';
            statusElem.style.fontWeight = '700';
            statusElem.style.padding = '2px 8px';
            statusElem.style.borderRadius = '10px';
        }
    };
    setInterval(paintStatus, 5000);
    paintStatus();
}

// Global initialization
init_settings();