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
        defaultStatusAfterLogin: 'Online',
        sound_str: 'https://grumstv.github.io/Sounds/msg.mp3',
        appBgColor: '#FFFFFF', // Дефолтный белый цвет фона
        missingTagColor: '#ff1744' // Дефолтный цвет окна "Нет темы и тега"
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
        // ⛔ Не применять стили на странице авторизации
        if (window.location.href === 'https://skyeng.autofaq.ai/login') {
            return;
        }

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

        // ─── Удаление стилей при белом фоне (возврат к дефолту) ───
        const removeStyle = (targetDoc, styleId) => {
            if (!targetDoc || !targetDoc.head) return;
            const el = targetDoc.getElementById(styleId);
            if (el) el.remove();
        };

        if (isWhite) {
            removeStyle(document, 'chmaf-bg-main');
            const iframe = document.querySelector('[class^="NEW_FRONTEND"]');
            if (iframe) {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) removeStyle(iframeDoc, 'chmaf-bg-iframe');
            }
            return; // дефолт — не инжектим кастом
        }

        let cssRules = `
    .usinf-glass-panel {
        background: ${getRgba(color, 0.7)} !important;
        backdrop-filter: blur(20px) saturate(160%) !important;
        -webkit-backdrop-filter: blur(20px) saturate(160%) !important;
        border: 1px solid rgba(255,255,255,0.12) !important;
        color: ${textColor} !important;
    }
.usinf-btn-glass {
    background: rgba(255,255,255,0.1) !important;
    color: ${textColor} !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
}
`;

        if (!isWhite) {
            cssRules += `
            /* ═══ 1. КАРТОЧКИ ДИАЛОГОВ ═══ */
            [class*="DialogsCard_Card"] {
                background-color: var(--chat-card-bg, ${getRgba(textColor, 0.05)}) !important;
                color: ${textColor} !important;
                border: 1px solid ${getRgba(textColor, 0.1)} !important;
                transition: background-color 0.3s ease;
            }

            /* ═══ 2. ТАБЫ ═══ */
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
            [class*="Operator_Root"], [class*="Layout_Header"], [class*="Layout_Body"], [class*="ChatMessages_Root"],
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

            [class*="Operator_TakeRequestButton"] {
    transition: filter 0.2s ease, transform 0.1s ease;
}
[class*="Operator_TakeRequestButton"]:hover {
    filter: brightness(1.15);
}

            /* ═══ 7. ОБЩАЯ ТИПОГРАФИКА ═══ */
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

                       /* ═══ 9. ОБЩИЙ ФОН ДЛЯ ОБЫЧНЫХ СООБЩЕНИЙ (серый) ═══ */
            [class*="ChatMessages_RegularMessage__"]:not([data-author-type="bot"]):not([data-author-type="user"]):not([data-author-type="user-with-bot"]):not([data-operator-comment="true"]) {
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

            /* ═══ 12. USER (receiver) — приятный синий ═══ */
            [class*="ChatMessages_RegularMessage__"][data-orientation="receiver"][data-author-type="user"] {
                background-color: rgba(66, 133, 244, 0.18) !important;
                border: 1px solid rgba(66, 133, 244, 0.35) !important;
                border-radius: 8px !important;
                padding: 3px 6px !important;
                margin: 2px 0 !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-orientation="receiver"][data-author-type="user"] [class*="ChatMessages_Author__"],
            [class*="ChatMessages_RegularMessage__"][data-orientation="receiver"][data-author-type="user"] [class*="ChatMessages_Date__"],
            [class*="ChatMessages_RegularMessage__"][data-orientation="receiver"][data-author-type="user"] [class*="ChatMessages_HtmlContent__"] {
                color: #e3f2fd !important;
                background: transparent !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-orientation="receiver"][data-author-type="user"] [class*="ChatMessages_Author__"] {
                font-weight: 600 !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-orientation="receiver"][data-author-type="user"] [class*="Buttons_SharedButton__"] {
                background-color: rgba(255, 255, 255, 0.08) !important;
                color: #bbdefb !important;
                border-color: rgba(66, 133, 244, 0.4) !important;
            }

            /* ═══ 12.5. USER (sender) — премиальный золотой ═══ */
            [class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"]:not([data-operator-comment="true"]) {
                background-color: rgba(255, 193, 7, 0.18) !important;
                border: 1px solid rgba(255, 193, 7, 0.4) !important;
                border-radius: 8px !important;
                padding: 3px 6px !important;
                margin: 2px 0 !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"]:not([data-operator-comment="true"]) [class*="ChatMessages_Author__"],
            [class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"]:not([data-operator-comment="true"]) [class*="ChatMessages_Date__"],
            [class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"]:not([data-operator-comment="true"]) [class*="ChatMessages_HtmlContent__"] {
                color: #fff8e1 !important;
                background: transparent !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"]:not([data-operator-comment="true"]) [class*="ChatMessages_Author__"] {
                font-weight: 600 !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"]:not([data-operator-comment="true"]) [class*="Buttons_SharedButton__"] {
                background-color: rgba(255, 255, 255, 0.08) !important;
                color: #ffecb3 !important;
                border-color: rgba(255, 193, 7, 0.45) !important;
            }

            /* ═══ 12.6. OperatorComment — СЕРЫЙ (перекрывает золотой sender/user) ═══ */
            [class*="ChatMessages_RegularMessage__"][data-operator-comment="true"] {
                background-color: rgba(96, 125, 139, 0.25) !important;
                border: 1px solid rgba(96, 125, 139, 0.4) !important;
                border-radius: 8px !important;
                padding: 3px 6px !important;
                margin: 2px 0 !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-operator-comment="true"] [class*="ChatMessages_Author__"],
            [class*="ChatMessages_RegularMessage__"][data-operator-comment="true"] [class*="ChatMessages_Date__"],
            [class*="ChatMessages_RegularMessage__"][data-operator-comment="true"] [class*="ChatMessages_HtmlContent__"] {
                color: #eceff1 !important;
                background: transparent !important;
            }
            [class*="ChatMessages_RegularMessage__"][data-operator-comment="true"] [class*="Buttons_SharedButton__"] {
                background-color: rgba(255, 255, 255, 0.08) !important;
                color: #b0bec5 !important;
                border-color: rgba(96, 125, 139, 0.45) !important;
            }

            /* ═══ 13. ЗАМЕТКИ (CommentMessagesGroup) — серый ═══ */
            [class*="ChatMessages_CommentMessagesGroup__"] {
                background-color: rgba(96, 125, 139, 0.25) !important;
                border: 1px solid rgba(96, 125, 139, 0.4) !important;
                border-radius: 8px !important;
                padding: 4px 8px !important;
                margin: 3px 0 !important;
            }
            /* Сбрасываем ЛЮБЫЕ цветные фоны сообщений внутри группы комментариев */
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_RegularMessage__"] {
                background: transparent !important;
                background-color: transparent !important;
                border: none !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            /* Явно перебиваем цветные селекторы (bot, receiver, sender, user-with-bot) внутри группы */
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_RegularMessage__"][data-author-type="bot"],
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_RegularMessage__"][data-author-type="user-with-bot"],
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_RegularMessage__"][data-orientation="receiver"][data-author-type="user"],
            [class*="ChatMessages_CommentMessagesGroup__"] [class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"] {
                background: transparent !important;
                background-color: transparent !important;
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

            /* ═══ 14. QUICK TAGS ═══ */
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
            #quickTagsdiv #svyazsU a,
            #quickTagsdiv #PNO a {
                color: #4fc3f7 !important;
            }
            #quickTagsdiv #svyazsP a,
            #quickTagsdiv #UNO a {
                color: #ff6b81 !important;
            }

            /* ═══ 15. POPOVER / DROPDOWN ═══ */
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

            /* ═══ 16. DROPDOWN ДЕЙСТВИЙ ═══ */
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
            [class*="mantine-Popover-arrow"] {
                background-color: ${color} !important;
                border-color: ${getRgba(textColor, 0.15)} !important;
            }

            /* ═══ 17. SELECT DROPDOWN ═══ */
            [class*="mantine-Select-dropdown"] {
                background-color: ${color} !important;
                border: 1px solid ${getRgba(textColor, 0.15)} !important;
            }
            [class*="mantine-Select-dropdown"] [class*="mantine-ScrollArea-viewport"],
            [class*="mantine-Select-dropdown"] [class*="mantine-Select-itemsWrapper"] {
                background-color: transparent !important;
            }
            [class*="Combobox_Item__"],
            [class*="mantine-Select-item"] {
                color: ${textColor} !important;
                background-color: transparent !important;
            }
            [class*="Combobox_Item__"][data-hovered="true"],
            [class*="mantine-Select-item"][data-hovered="true"],
            [class*="Combobox_Item__"]:hover,
            [class*="mantine-Select-item"]:hover {
                background-color: ${getRgba(textColor, 0.12)} !important;
            }
            [class*="Combobox_Item__"][data-selected="true"],
            [class*="mantine-Select-item"][data-selected="true"] {
                background-color: ${getRgba(textColor, 0.18)} !important;
            }
            [class*="Combobox_Item__"] svg path {
                fill: ${textColor} !important;
            }
            [class*="mantine-Select-dropdown"] [class*="mantine-ScrollArea-thumb"] {
                background-color: ${getRgba(textColor, 0.25)} !important;
            }

            /* ═══ 18. TEXTAREA ═══ */
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
            [class*="mantine-Checkbox-input"] {
                background-color: ${getRgba(textColor, 0.08)} !important;
                border-color: ${getRgba(textColor, 0.3)} !important;
            }
            [class*="mantine-Checkbox-input"]:checked {
                background-color: #7c4dff !important;
                border-color: #7c4dff !important;
            }

            /* ═══ 20. EMPTY STATE ═══ */
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

            /* ═══ 21. CHIPS / MULTISELECT ═══ */
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
            [class*="Chips_Chip__"] [class*="Chips_CloseIcon__"] {
                color: ${textColor} !important;
            }
            [class*="Chips_Chip__"] [class*="Chips_CloseIcon__"]:hover {
                color: #ffffff !important;
                background-color: rgba(255, 255, 255, 0.1) !important;
                border-radius: 50% !important;
            }

            /* ═══ 22. INPUT ═══ */
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
            [class*="Inputs_WithIcon__"] svg,
            [class*="Inputs_WithIcon__"] [class*="mantine-Input-icon"] {
                color: ${getRgba(textColor, 0.5)} !important;
            }

            /* ═══ 23. HISTORY ═══ */
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
            [class*="History_Arrow__"] path {
                fill: ${getRgba(textColor, 0.5)} !important;
            }
            [class*="History_ConversationHeader__"] button svg {
                color: ${textColor} !important;
            }
            [class*="History_ConversationHeader__"] button:hover svg {
                color: #ffffff !important;
            }

            /* ═══ 24. SANITIZED HTML ═══ */
            [class*="SanitizedHtml_SanitizedHtml__"] {
                color: ${textColor} !important;
                background: transparent !important;
            }

            /* ═══ 25. ACCORDION / SUGGESTIONS ═══ */
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
            [class*="Suggestions_SuggestionPreview__"] [class*="Typography_Type_body-description__"],
            [class*="Suggestions_SuggestionPreview__"] [class*="Typography_Type_body__"],
            [class*="Suggestions_SuggestionPreview__"] [class*="SanitizedHtml_SanitizedHtml__"] {
                color: ${textColor} !important;
                background: transparent !important;
            }
            [class*="mantine-Accordion-chevron"] svg {
                color: ${textColor} !important;
            }

                        /* ═══ 26. ТАБЛИЦЫ (Table) ═══ */
            [class*="Table_GlobalTableContainer__"],
            [class*="Table_AreaContainer__"],
            [class*="Table_ScrollContainer__"] {
                background-color: ${color} !important;
            }

            [class*="Table_Table__"] {
                background-color: transparent !important;
                color: ${textColor} !important;
            }

            /* Шапка таблицы */
            [class*="Table_TableHeadCell__"] {
                background-color: ${getRgba(textColor, 0.08)} !important;
                color: ${textColor} !important;
                border-bottom: 1px solid ${getRgba(textColor, 0.15)} !important;
            }
            [class*="Table_TableHeadCellContent__"] {
                background: transparent !important;
                color: ${textColor} !important;
            }
            [class*="Table_TableHeadCellText__"] {
                color: ${textColor} !important;
            }
            [class*="Table_SortIconContainer__"][data-active="true"] {
                filter: brightness(1.5) !important;
            }

            /* Строки таблицы */
            [class*="Table_Row__"] {
                background-color: transparent !important;
                color: ${textColor} !important;
                border-bottom: 1px solid ${getRgba(textColor, 0.06)} !important;
                transition: background-color 0.15s ease;
            }
            [class*="Table_Row__"]:hover {
                background-color: ${getRgba(textColor, 0.06)} !important;
            }

            /* Zebra mode — чётные строки */
            [class*="Table_ZebraMode__"] [class*="Table_Row__"]:nth-child(even) {
                background-color: ${getRgba(textColor, 0.04)} !important;
            }
            [class*="Table_ZebraMode__"] [class*="Table_Row__"]:nth-child(even):hover {
                background-color: ${getRgba(textColor, 0.1)} !important;
            }

            /* Ячейки */
            [class*="Table_Cell__"] {
                background: transparent !important;
                color: ${textColor} !important;
                border-color: ${getRgba(textColor, 0.08)} !important;
            }
            [class*="Table_ContentWrapper__"] {
                background: transparent !important;
                color: ${textColor} !important;
            }
            [class*="Table_Centered__"] {
                color: ${textColor} !important;
            }

            /* ═══ 27. КНОПКИ В ТАБЛИЦЕ ═══ */
            /* Primary / Contained */
            [class*="Buttons_Color_primary__"][class*="Buttons_Appearance_contained__"] {
                background-color: #7c4dff !important;
                color: #ffffff !important;
                border-color: #7c4dff !important;
            }
            [class*="Buttons_Color_primary__"][class*="Buttons_Appearance_contained__"]:hover {
                background-color: #9575ff !important;
                border-color: #9575ff !important;
            }

            /* Secondary / Outlined */
            [class*="Buttons_Color_secondary__"][class*="Buttons_Appearance_outlined__"] {
                background-color: transparent !important;
                color: ${textColor} !important;
                border: 1px solid ${getRgba(textColor, 0.25)} !important;
            }
            [class*="Buttons_Color_secondary__"][class*="Buttons_Appearance_outlined__"]:hover {
                background-color: ${getRgba(textColor, 0.1)} !important;
                border-color: ${getRgba(textColor, 0.4)} !important;
            }

            /* SVG иконки в кнопках */
            [class*="Buttons_SharedButton__"] svg,
            [class*="Buttons_Button__"] svg {
                color: currentColor !important;
            }

            /* ═══ 28. ФУТЕР ТАБЛИЦЫ + ПАГИНАЦИЯ ═══ */
            [class*="Table_FooterContainer__"],
            [class*="Table_PaginationContainer__"],
            [class*="Table_ActionsContainer__"] {
                background-color: ${getRgba(textColor, 0.04)} !important;
                color: ${textColor} !important;
                border-top: 1px solid ${getRgba(textColor, 0.1)} !important;
            }
            [class*="Pagination_Count__"] {
                color: ${textColor} !important;
            }
            [class*="Pagination_Count__"] strong {
                color: #ffffff !important;
            }

            /* ═══ 29. ТЕНИ И СКРОЛЛБАРЫ ТАБЛИЦЫ ═══ */
            [class*="Table_OverflowShadowRight__"],
            [class*="Table_OverflowShadowBottom__"] {
                background: linear-gradient(to right, transparent, ${color}) !important;
            }
            [class*="Table_OverflowShadowBottom__"] {
                background: linear-gradient(to bottom, transparent, ${color}) !important;
            }

            /* ═══ 30. ВСПЛЫВАЮЩИЕ ПОДСКАЗКИ/ДРОПДАУНЫ В ТАБЛИЦЕ ═══ */
            [class*="Table_TableHeadCell__"] [id*="mantine-"][id*="-target"] {
                color: ${textColor} !important;
            }

            /* ═══ СТАТУС ДИАЛОГА (SVG) ═══ */
            [class*="DialogsCard_PayloadStatus__"] svg {
                color: #ff9800 !important;
                filter: drop-shadow(0 0 3px rgba(255, 152, 0, 0.6)) !important;
                width: 22px !important;
                height: 22px !important;
                transition: filter 0.2s ease;
            }
            [class*="DialogsCard_Card"]:hover [class*="DialogsCard_PayloadStatus__"] svg {
                filter: drop-shadow(0 0 6px rgba(255, 152, 0, 0.9)) !important;
                color: #ffb74d !important;
            }

            /* ═══ INLINE FILTER BUTTON ═══ */
            [class*="inline-filter-button_label__"] {
                background-color: transparent !important;
                color: ${textColor} !important;
            }

            /* ═══ DATA-ALWAYS-DASHED ═══ */
            [data-always-dashed="true"] {
                background-color: rgba(66, 133, 244, 0.2) !important;
                color: #e3f2fd !important;
                padding: 2px 8px !important;
                border-radius: 4px !important;
                border: 1px solid rgba(66, 133, 244, 0.4) !important;
                font-weight: 500 !important;
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

        // ─── Помечаем комментарии оператора (OperatorComment) ───
        const markOperatorComments = () => {
            document.querySelectorAll(
                '[class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"]:not([data-comment-checked])'
            ).forEach(msg => {
                const hasActionButtons = msg.querySelector('[class*="Buttons_SharedButton"]');
                const hasForwarded = msg.querySelector('[class*="ChatMessages_RegularMessageForwardedMessagesContainer__"] > *');
                // Если нет кнопок действий и нет пересланных сообщений — это внутренний комментарий
                if (!hasActionButtons && !hasForwarded) {
                    msg.setAttribute('data-operator-comment', 'true');
                }
                msg.setAttribute('data-comment-checked', 'true');
            });
        };
        markOperatorComments();
    };
    // Применяем при запуске.
    // Ставим setInterval, так как iframe загружается с задержкой или может быть пересоздан SPA-роутером
    applyAppBgColor();
    setInterval(applyAppBgColor, 2000);





    /* ============================================================
       DARK THEME for /tickets/archive
       Target: .ant-layout.app-body
       ============================================================ */

    const applyTicketsArchiveDarkTheme = () => {
        // ⛔ Только для страниц архива тикетов и логов
        if (!window.location.href.includes('/tickets/archive') && !window.location.href.includes('/logs')) {
            return;
        }

        const color = Settings.get('appBgColor') || '#FFFFFF';
        const isWhite = color.toUpperCase() === '#FFFFFF';

        // ─── Белый фон = удаляем кастом и выходим (дефолт) ───
        if (isWhite) {
            const el = document.getElementById('chmaf-tickets-archive-dark');
            if (el) el.remove();
            return;
        }

        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;

        const textColor = brightness >= 128 ? '#1A1A1A' : '#E0E0E0';
        const isDarkBg = brightness < 128;

        const getRgba = (hex, alpha) => {
            const r1 = parseInt(hex.slice(1, 3), 16);
            const g1 = parseInt(hex.slice(3, 5), 16);
            const b1 = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r1}, ${g1}, ${b1}, ${alpha})`;
        };

        let cssRules = `
    /* ═══ 0. ОСНОВНОЙ КОНТЕЙНЕР — .ant-layout.app-body + .app-body-content-inner ═══ */
    .ant-layout.app-body,
    .app-body-content-inner,
    .app-body-content-inner-plain-deep {
        background-color: ${color} !important;
        color: ${textColor} !important;
    }

    /* ═══ 1. ШАПКА (Header) ═══ */
    .ant-layout.app-body .ant-layout-header,
    .ant-layout.app-body [class*="Header"] {
        background-color: ${getRgba(color, 0.95)} !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
        color: ${textColor} !important;
        backdrop-filter: blur(10px) !important;
    }
    .ant-layout.app-body .ant-layout-header * {
        color: ${textColor} !important;
    }

    /* ═══ 2. БОКОВОЕ МЕНЮ (Sider) ═══ */
    .ant-layout.app-body .ant-layout-sider,
    .ant-layout.app-body [class*="Sider"] {
        background-color: ${getRgba(color, 0.98)} !important;
        border-right: 1px solid ${getRgba(textColor, 0.08)} !important;
    }
    .ant-layout.app-body .ant-layout-sider .ant-menu,
    .ant-layout.app-body [class*="Sider"] [class*="menu"] {
        background-color: transparent !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-layout-sider .ant-menu-item,
    .ant-layout.app-body .ant-layout-sider .ant-menu-submenu-title {
        color: ${textColor} !important;
        background: transparent !important;
    }
    .ant-layout.app-body .ant-layout-sider .ant-menu-item:hover,
    .ant-layout.app-body .ant-layout-sider .ant-menu-submenu-title:hover {
        background-color: ${getRgba(textColor, 0.08)} !important;
        color: #ffffff !important;
    }
    .ant-layout.app-body .ant-layout-sider .ant-menu-item-selected,
    .ant-layout.app-body .ant-layout-sider .ant-menu-item-active {
        background-color: ${getRgba(textColor, 0.15)} !important;
        color: #ffffff !important;
        border-right: 3px solid #7c4dff !important;
    }
    .ant-layout.app-body .ant-layout-sider .ant-menu-item-selected a,
    .ant-layout.app-body .ant-layout-sider .ant-menu-item a {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-layout-sider .ant-menu-item-selected a {
        color: #ffffff !important;
    }

    /* ═══ 3. КОНТЕНТ (Content) ═══ */
    .ant-layout.app-body .ant-layout-content,
    .ant-layout.app-body [class*="Content"] {
        background-color: ${color} !important;
        color: ${textColor} !important;
    }

    /* ═══ 4. ТАБЛИЦЫ (Table) ═══ */
    .ant-layout.app-body .ant-table {
        background-color: transparent !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-table-thead > tr > th {
        background-color: ${getRgba(textColor, 0.08)} !important;
        color: ${textColor} !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.15)} !important;
        font-weight: 600 !important;
    }
    .ant-layout.app-body .ant-table-tbody > tr > td {
        background-color: transparent !important;
        color: ${textColor} !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.06)} !important;
    }
    .ant-layout.app-body .ant-table-tbody > tr:hover > td {
        background-color: ${getRgba(textColor, 0.06)} !important;
    }
    .ant-layout.app-body .ant-table-tbody > tr.ant-table-row-selected > td {
        background-color: ${getRgba('#7c4dff', 0.15)} !important;
    }
    .ant-layout.app-body .ant-table-cell-row-hover {
        background-color: ${getRgba(textColor, 0.08)} !important;
    }
    .ant-layout.app-body .ant-table-empty .ant-table-cell {
        background-color: ${getRgba(textColor, 0.03)} !important;
    }
    .ant-layout.app-body .ant-empty-description {
        color: ${getRgba(textColor, 0.5)} !important;
    }

    /* ═══ 5. ПАГИНАЦИЯ (Pagination) ═══ */
    .ant-layout.app-body .ant-pagination {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-pagination-item {
        background-color: ${getRgba(textColor, 0.08)} !important;
        border-color: ${getRgba(textColor, 0.15)} !important;
    }
    .ant-layout.app-body .ant-pagination-item a {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-pagination-item:hover {
        border-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-pagination-item-active {
        background-color: #7c4dff !important;
        border-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-pagination-item-active a {
        color: #ffffff !important;
    }
    .ant-layout.app-body .ant-pagination-prev .ant-pagination-item-link,
    .ant-layout.app-body .ant-pagination-next .ant-pagination-item-link {
        background-color: ${getRgba(textColor, 0.08)} !important;
        border-color: ${getRgba(textColor, 0.15)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-pagination-disabled .ant-pagination-item-link {
        color: ${getRgba(textColor, 0.3)} !important;
    }
    .ant-layout.app-body .ant-pagination-options-quick-jumper input {
        background-color: ${getRgba(textColor, 0.08)} !important;
        color: ${textColor} !important;
        border-color: ${getRgba(textColor, 0.2)} !important;
    }

    /* ═══ 6. ИНПУТЫ, СЕЛЕКТЫ, ДАТАПИКЕРЫ ═══ */
    .ant-layout.app-body .ant-input,
    .ant-layout.app-body .ant-input-affix-wrapper,
    .ant-layout.app-body .ant-select-selector,
    .ant-layout.app-body .ant-picker {
        background-color: ${getRgba(textColor, 0.08)} !important;
        color: ${textColor} !important;
        border-color: ${getRgba(textColor, 0.2)} !important;
        border-radius: 6px !important;
    }
    .ant-layout.app-body .ant-input::placeholder,
    .ant-layout.app-body .ant-input-affix-wrapper input::placeholder {
        color: ${getRgba(textColor, 0.4)} !important;
    }
    .ant-layout.app-body .ant-input:hover,
    .ant-layout.app-body .ant-input-affix-wrapper:hover,
    .ant-layout.app-body .ant-select-selector:hover,
    .ant-layout.app-body .ant-picker:hover {
        border-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-input:focus,
    .ant-layout.app-body .ant-input-affix-wrapper:focus,
    .ant-layout.app-body .ant-input-focused,
    .ant-layout.app-body .ant-select-focused .ant-select-selector,
    .ant-layout.app-body .ant-picker-focused {
        border-color: #7c4dff !important;
        box-shadow: 0 0 0 2px ${getRgba('#7c4dff', 0.2)} !important;
    }
    .ant-layout.app-body .ant-input-prefix,
    .ant-layout.app-body .ant-input-suffix,
    .ant-layout.app-body .ant-select-arrow,
    .ant-layout.app-body .ant-picker-suffix {
        color: ${getRgba(textColor, 0.5)} !important;
    }
    .ant-layout.app-body .ant-select-dropdown {
        background-color: ${color} !important;
        border: 1px solid ${getRgba(textColor, 0.15)} !important;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
    }
    .ant-layout.app-body .ant-select-item {
        color: ${textColor} !important;
        background: transparent !important;
    }
    .ant-layout.app-body .ant-select-item-option-active,
    .ant-layout.app-body .ant-select-item-option:hover {
        background-color: ${getRgba(textColor, 0.12)} !important;
    }
    .ant-layout.app-body .ant-select-item-option-selected {
        background-color: ${getRgba(textColor, 0.18)} !important;
        color: #ffffff !important;
        font-weight: 600 !important;
    }
    .ant-layout.app-body .ant-picker-panel,
    .ant-layout.app-body .ant-picker-dropdown {
        background-color: ${color} !important;
        border-color: ${getRgba(textColor, 0.15)} !important;
    }
    .ant-layout.app-body .ant-picker-cell {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-picker-cell-in-view {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-picker-cell:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end) .ant-picker-cell-inner {
        background-color: ${getRgba(textColor, 0.12)} !important;
    }
    .ant-layout.app-body .ant-picker-cell-selected .ant-picker-cell-inner,
    .ant-layout.app-body .ant-picker-cell-range-start .ant-picker-cell-inner,
    .ant-layout.app-body .ant-picker-cell-range-end .ant-picker-cell-inner {
        background-color: #7c4dff !important;
        color: #ffffff !important;
    }
    .ant-layout.app-body .ant-picker-header {
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-picker-header button {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-picker-content th {
        color: ${getRgba(textColor, 0.6)} !important;
    }

    /* ═══ 7. КНОПКИ (Buttons) ═══ */
    .ant-layout.app-body .ant-btn {
        background-color: ${getRgba(textColor, 0.08)} !important;
        color: ${textColor} !important;
        border-color: ${getRgba(textColor, 0.2)} !important;
        border-radius: 6px !important;
        transition: all 0.2s ease !important;
    }
    .ant-layout.app-body .ant-btn:hover {
        border-color: #7c4dff !important;
        color: #ffffff !important;
        background-color: ${getRgba(textColor, 0.15)} !important;
    }
    .ant-layout.app-body .ant-btn-primary {
        background-color: #7c4dff !important;
        border-color: #7c4dff !important;
        color: #ffffff !important;
    }
    .ant-layout.app-body .ant-btn-primary:hover {
        background-color: #9575ff !important;
        border-color: #9575ff !important;
    }
    .ant-layout.app-body .ant-btn-dangerous {
        background-color: ${getRgba('#ff4d4f', 0.15)} !important;
        border-color: #ff4d4f !important;
        color: #ff4d4f !important;
    }
    .ant-layout.app-body .ant-btn-dangerous:hover {
        background-color: #ff4d4f !important;
        color: #ffffff !important;
    }
    .ant-layout.app-body .ant-btn-link {
        background: transparent !important;
        border: none !important;
        color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-btn-link:hover {
        color: #9575ff !important;
        background: ${getRgba('#7c4dff', 0.1)} !important;
    }

    /* ═══ 8. ТЕГИ / БЕЙДЖИ (Tags) ═══ */
    .ant-layout.app-body .ant-tag {
        background-color: ${getRgba(textColor, 0.08)} !important;
        color: ${textColor} !important;
        border-color: ${getRgba(textColor, 0.15)} !important;
    }
    .ant-layout.app-body .ant-tag-blue {
        background-color: ${getRgba('#1890ff', 0.15)} !important;
        color: #69c0ff !important;
        border-color: ${getRgba('#1890ff', 0.3)} !important;
    }
    .ant-layout.app-body .ant-tag-green {
        background-color: ${getRgba('#52c41a', 0.15)} !important;
        color: #95de64 !important;
        border-color: ${getRgba('#52c41a', 0.3)} !important;
    }
    .ant-layout.app-body .ant-tag-red {
        background-color: ${getRgba('#ff4d4f', 0.15)} !important;
        color: #ff7875 !important;
        border-color: ${getRgba('#ff4d4f', 0.3)} !important;
    }
    .ant-layout.app-body .ant-tag-orange {
        background-color: ${getRgba('#fa8c16', 0.15)} !important;
        color: #ffc069 !important;
        border-color: ${getRgba('#fa8c16', 0.3)} !important;
    }
    .ant-layout.app-body .ant-tag-purple {
        background-color: ${getRgba('#722ed1', 0.15)} !important;
        color: #b37feb !important;
        border-color: ${getRgba('#722ed1', 0.3)} !important;
    }

    /* ═══ 9. МОДАЛЬНЫЕ ОКНА (Modal) ═══ */
    .ant-layout.app-body .ant-modal-content,
    .ant-layout.app-body .ant-modal-header {
        background-color: ${color} !important;
        color: ${textColor} !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-modal-title {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-modal-close {
        color: ${getRgba(textColor, 0.5)} !important;
    }
    .ant-layout.app-body .ant-modal-close:hover {
        color: ${textColor} !important;
        background-color: ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-modal-body {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-modal-footer {
        border-top: 1px solid ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body ~ .ant-modal-mask,
    .ant-modal-mask {
        background-color: rgba(0, 0, 0, 0.7) !important;
    }

    /* ═══ 10. ДРОПДАУНЫ / МЕНЮ (Dropdown) ═══ */
    .ant-layout.app-body .ant-dropdown-menu,
    .ant-dropdown-menu {
        background-color: ${color} !important;
        border: 1px solid ${getRgba(textColor, 0.15)} !important;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
    }
    .ant-layout.app-body .ant-dropdown-menu-item,
    .ant-dropdown-menu-item {
        color: ${textColor} !important;
        background: transparent !important;
    }
    .ant-layout.app-body .ant-dropdown-menu-item:hover,
    .ant-dropdown-menu-item:hover {
        background-color: ${getRgba(textColor, 0.12)} !important;
        color: #ffffff !important;
    }
    .ant-layout.app-body .ant-dropdown-menu-item-danger,
    .ant-dropdown-menu-item-danger {
        color: #ff7875 !important;
    }
    .ant-layout.app-body .ant-dropdown-menu-item-danger:hover,
    .ant-dropdown-menu-item-danger:hover {
        background-color: ${getRgba('#ff4d4f', 0.15)} !important;
    }
    .ant-layout.app-body .ant-dropdown-menu-item-divider,
    .ant-dropdown-menu-item-divider {
        background-color: ${getRgba(textColor, 0.1)} !important;
    }

    /* ═══ 11. ЧЕКБОКСЫ И РАДИО ═══ */
    .ant-layout.app-body .ant-checkbox-wrapper {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-checkbox-inner {
        background-color: ${getRgba(textColor, 0.08)} !important;
        border-color: ${getRgba(textColor, 0.3)} !important;
    }
    .ant-layout.app-body .ant-checkbox-checked .ant-checkbox-inner {
        background-color: #7c4dff !important;
        border-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-checkbox-indeterminate .ant-checkbox-inner::after {
        background-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-radio-wrapper {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-radio-inner {
        background-color: ${getRgba(textColor, 0.08)} !important;
        border-color: ${getRgba(textColor, 0.3)} !important;
    }
    .ant-layout.app-body .ant-radio-checked .ant-radio-inner {
        border-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-radio-checked .ant-radio-inner::after {
        background-color: #7c4dff !important;
    }

    /* ═══ 12. ТАБЫ (Tabs) ═══ */
    .ant-layout.app-body .ant-tabs {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-tabs-tab {
        color: ${getRgba(textColor, 0.6)} !important;
        background: transparent !important;
    }
    .ant-layout.app-body .ant-tabs-tab:hover {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #7c4dff !important;
        font-weight: 600 !important;
    }
    .ant-layout.app-body .ant-tabs-ink-bar {
        background-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-tabs-nav::before {
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
    }

    /* ═══ 13. КАРТОЧКИ (Card) ═══ */
    .ant-layout.app-body .ant-card {
        background-color: ${getRgba(textColor, 0.04)} !important;
        border-color: ${getRgba(textColor, 0.1)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-card-head {
        background-color: transparent !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-card-body {
        color: ${textColor} !important;
    }

    /* ═══ 14. СКРОЛЛБАРЫ ═══ */
    .ant-layout.app-body ::-webkit-scrollbar {
        width: 8px !important;
        height: 8px !important;
    }
    .ant-layout.app-body ::-webkit-scrollbar-track {
        background: ${getRgba(textColor, 0.03)} !important;
    }
    .ant-layout.app-body ::-webkit-scrollbar-thumb {
        background: ${getRgba(textColor, 0.2)} !important;
        border-radius: 4px !important;
    }
    .ant-layout.app-body ::-webkit-scrollbar-thumb:hover {
        background: ${getRgba(textColor, 0.35)} !important;
    }

    /* ═══ 15. ТУЛТИПЫ (Tooltip) ═══ */
    .ant-layout.app-body .ant-tooltip-inner,
    .ant-tooltip-inner {
        background-color: ${getRgba(color, 0.95)} !important;
        color: ${textColor} !important;
        border: 1px solid ${getRgba(textColor, 0.15)} !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    }
    .ant-layout.app-body .ant-tooltip-arrow-content,
    .ant-tooltip-arrow-content {
        background-color: ${color} !important;
    }

    /* ═══ 16. ДРОВЕР / САЙДБАР (Drawer) ═══ */
    .ant-layout.app-body .ant-drawer-content,
    .ant-drawer-content {
        background-color: ${color} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-drawer-header,
    .ant-drawer-header {
        background-color: ${getRgba(color, 0.95)} !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-drawer-title,
    .ant-drawer-title {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-drawer-close,
    .ant-drawer-close {
        color: ${getRgba(textColor, 0.5)} !important;
    }
    .ant-layout.app-body .ant-drawer-close:hover,
    .ant-drawer-close:hover {
        color: ${textColor} !important;
        background-color: ${getRgba(textColor, 0.1)} !important;
    }

    /* ═══ 17. БРЕДКРАМБЫ ═══ */
    .ant-layout.app-body .ant-breadcrumb {
        color: ${getRgba(textColor, 0.6)} !important;
    }
    .ant-layout.app-body .ant-breadcrumb a {
        color: ${getRgba(textColor, 0.6)} !important;
    }
    .ant-layout.app-body .ant-breadcrumb a:hover {
        color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-breadcrumb-separator {
        color: ${getRgba(textColor, 0.3)} !important;
    }
    .ant-layout.app-body .ant-breadcrumb > span:last-child {
        color: ${textColor} !important;
        font-weight: 600 !important;
    }

    /* ═══ 18. СТАТУСЫ / БЕЙДЖИ (Badge) ═══ */
    .ant-layout.app-body .ant-badge-status-text {
        color: ${textColor} !important;
    }

    /* ═══ 19. СВИТЧ (Switch) ═══ */
    .ant-layout.app-body .ant-switch {
        background-color: ${getRgba(textColor, 0.2)} !important;
    }
    .ant-layout.app-body .ant-switch-checked {
        background-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-switch-inner {
        color: ${textColor} !important;
    }

    /* ═══ 20. СЛАЙДЕР / ПРОГРЕСС ═══ */
    .ant-layout.app-body .ant-slider-rail {
        background-color: ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-slider-track {
        background-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-slider-handle {
        background-color: #7c4dff !important;
        border-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-progress-text {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-progress-bg {
        background-color: #7c4dff !important;
    }

    /* ═══ 21. АЛЕРТЫ / НОТИФИКАЦИИ ═══ */
    .ant-layout.app-body .ant-alert,
    .ant-alert {
        background-color: ${getRgba(textColor, 0.06)} !important;
        border: 1px solid ${getRgba(textColor, 0.1)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-alert-message,
    .ant-alert-message {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-alert-description,
    .ant-alert-description {
        color: ${getRgba(textColor, 0.7)} !important;
    }
    .ant-layout.app-body .ant-alert-success {
        background-color: ${getRgba('#52c41a', 0.1)} !important;
        border-color: ${getRgba('#52c41a', 0.3)} !important;
    }
    .ant-layout.app-body .ant-alert-error {
        background-color: ${getRgba('#ff4d4f', 0.1)} !important;
        border-color: ${getRgba('#ff4d4f', 0.3)} !important;
    }
    .ant-layout.app-body .ant-alert-warning {
        background-color: ${getRgba('#fa8c16', 0.1)} !important;
        border-color: ${getRgba('#fa8c16', 0.3)} !important;
    }
    .ant-layout.app-body .ant-alert-info {
        background-color: ${getRgba('#1890ff', 0.1)} !important;
        border-color: ${getRgba('#1890ff', 0.3)} !important;
    }
    .ant-message-notice-content,
    .ant-notification-notice {
        background-color: ${color} !important;
        color: ${textColor} !important;
        border: 1px solid ${getRgba(textColor, 0.15)} !important;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
    }
    .ant-message-notice-content *,
    .ant-notification-notice * {
        color: ${textColor} !important;
    }
    .ant-notification-notice-close {
        color: ${getRgba(textColor, 0.5)} !important;
    }

    /* ═══ 22. КОЛЛАПС / АККОРДЕОН ═══ */
    .ant-layout.app-body .ant-collapse {
        background-color: ${getRgba(textColor, 0.04)} !important;
        border-color: ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-collapse > .ant-collapse-item {
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-collapse-header {
        color: ${textColor} !important;
        background: transparent !important;
    }
    .ant-layout.app-body .ant-collapse-content {
        background-color: transparent !important;
        color: ${textColor} !important;
        border-top: 1px solid ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-collapse-content-box {
        color: ${textColor} !important;
    }

    /* ═══ 23. СПИН / ЛОАДЕР ═══ */
    .ant-layout.app-body .ant-spin-dot-item {
        background-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-spin-text {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-skeleton-title,
    .ant-layout.app-body .ant-skeleton-paragraph > li {
        background: linear-gradient(90deg, ${getRgba(textColor, 0.06)} 25%, ${getRgba(textColor, 0.12)} 37%, ${getRgba(textColor, 0.06)} 63%) !important;
    }
    .ant-layout.app-body .ant-skeleton-avatar,
    .ant-layout.app-body .ant-skeleton-button,
    .ant-layout.app-body .ant-skeleton-input {
        background: linear-gradient(90deg, ${getRgba(textColor, 0.06)} 25%, ${getRgba(textColor, 0.12)} 37%, ${getRgba(textColor, 0.06)} 63%) !important;
    }

    /* ═══ 24. ПОПОВЕР (Popover) ═══ */
    .ant-layout.app-body .ant-popover-inner,
    .ant-popover-inner {
        background-color: ${color} !important;
        border: 1px solid ${getRgba(textColor, 0.15)} !important;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
    }
    .ant-layout.app-body .ant-popover-title,
    .ant-popover-title {
        color: ${textColor} !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-popover-inner-content,
    .ant-popover-inner-content {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-popover-arrow-content,
    .ant-popover-arrow-content {
        background-color: ${color} !important;
        border-color: ${getRgba(textColor, 0.15)} !important;
    }

    /* ═══ 25. СТЕППЕР / ТАЙМЛАЙН ═══ */
    .ant-layout.app-body .ant-steps-item-title {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-steps-item-description {
        color: ${getRgba(textColor, 0.6)} !important;
    }
    .ant-layout.app-body .ant-steps-item-wait .ant-steps-item-icon {
        background-color: ${getRgba(textColor, 0.1)} !important;
        border-color: ${getRgba(textColor, 0.2)} !important;
    }
    .ant-layout.app-body .ant-steps-item-wait .ant-steps-item-icon > .ant-steps-icon {
        color: ${getRgba(textColor, 0.5)} !important;
    }
    .ant-layout.app-body .ant-steps-item-finish .ant-steps-item-icon {
        background-color: ${getRgba('#7c4dff', 0.15)} !important;
        border-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
        color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-steps-item-process .ant-steps-item-icon {
        background-color: #7c4dff !important;
        border-color: #7c4dff !important;
    }
    .ant-layout.app-body .ant-timeline-item-content {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-timeline-item-tail {
        border-left-color: ${getRgba(textColor, 0.15)} !important;
    }

    /* ═══ 26. ТРЕЕ (Tree) ═══ */
    .ant-layout.app-body .ant-tree {
        background: transparent !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-tree-treenode {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-tree-treenode:hover {
        background-color: ${getRgba(textColor, 0.08)} !important;
    }
    .ant-layout.app-body .ant-tree-node-selected {
        background-color: ${getRgba('#7c4dff', 0.15)} !important;
        color: #ffffff !important;
    }
    .ant-layout.app-body .ant-tree-switcher {
        color: ${getRgba(textColor, 0.5)} !important;
    }

    /* ═══ 27. ТРАНСФЕР (Transfer) ═══ */
    .ant-layout.app-body .ant-transfer-list {
        background-color: ${getRgba(textColor, 0.04)} !important;
        border-color: ${getRgba(textColor, 0.1)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-transfer-list-header {
        background-color: ${getRgba(textColor, 0.08)} !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-transfer-list-content-item {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-transfer-list-content-item:hover {
        background-color: ${getRgba(textColor, 0.08)} !important;
    }
    .ant-layout.app-body .ant-transfer-list-content-item-checked {
        background-color: ${getRgba('#7c4dff', 0.15)} !important;
    }

    /* ═══ 28. ДИВАЙДЕР (Divider) ═══ */
    .ant-layout.app-body .ant-divider {
        border-top-color: ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-divider-vertical {
        border-left-color: ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-divider-inner-text {
        color: ${getRgba(textColor, 0.5)} !important;
        background-color: ${color} !important;
    }

    /* ═══ 29. СТАТИСТИКА ═══ */
    .ant-layout.app-body .ant-statistic-title {
        color: ${getRgba(textColor, 0.6)} !important;
    }
    .ant-layout.app-body .ant-statistic-content {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-statistic-content-value {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-statistic-content-suffix {
        color: ${getRgba(textColor, 0.6)} !important;
    }

    /* ═══ 30. ДЕСКРИПШН (Descriptions) ═══ */
    .ant-layout.app-body .ant-descriptions-title {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-descriptions-item-label {
        color: ${getRgba(textColor, 0.7)} !important;
        background-color: ${getRgba(textColor, 0.04)} !important;
    }
    .ant-layout.app-body .ant-descriptions-item-content {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-descriptions-bordered .ant-descriptions-item-label,
    .ant-layout.app-body .ant-descriptions-bordered .ant-descriptions-item-content {
        border-color: ${getRgba(textColor, 0.1)} !important;
    }

    /* ═══ 31. ЛИСТ (List) ═══ */
    .ant-layout.app-body .ant-list {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-list-item {
        border-bottom: 1px solid ${getRgba(textColor, 0.08)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-list-item-meta-title {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-list-item-meta-description {
        color: ${getRgba(textColor, 0.6)} !important;
    }
    .ant-layout.app-body .ant-list-empty-text {
        color: ${getRgba(textColor, 0.4)} !important;
    }

    /* ═══ 32. СЕГМЕНТ (Segmented) ═══ */
    .ant-layout.app-body .ant-segmented {
        background-color: ${getRgba(textColor, 0.08)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-segmented-item {
        color: ${getRgba(textColor, 0.7)} !important;
    }
    .ant-layout.app-body .ant-segmented-item-selected {
        background-color: ${getRgba(textColor, 0.15)} !important;
        color: ${textColor} !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
    }
    .ant-layout.app-body .ant-segmented-item:hover:not(.ant-segmented-item-selected) {
        color: ${textColor} !important;
    }

    /* ═══ 33. РЕЙТИНГ (Rate) ═══ */
    .ant-layout.app-body .ant-rate-star-zero .ant-rate-star-second {
        color: ${getRgba(textColor, 0.15)} !important;
    }
    .ant-layout.app-body .ant-rate-star-full .ant-rate-star-second,
    .ant-layout.app-body .ant-rate-star-half .ant-rate-star-first {
        color: #faad14 !important;
    }

    /* ═══ 34. АВАТАР ═══ */
    .ant-layout.app-body .ant-avatar-string {
        color: #ffffff !important;
    }

    /* ═══ 35. BACKTOP ═══ */
    .ant-layout.app-body .ant-back-top-content {
        background-color: ${getRgba(textColor, 0.15)} !important;
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-back-top-content:hover {
        background-color: #7c4dff !important;
        color: #ffffff !important;
    }

    /* ═══ 36. AFFIX ═══ */
    .ant-layout.app-body .ant-affix {
        background-color: ${getRgba(color, 0.95)} !important;
        backdrop-filter: blur(10px) !important;
    }

    /* ═══ 37. ФИКС: svg иконки ═══ */
    .ant-layout.app-body svg {
        fill: currentColor !important;
    }
    .ant-layout.app-body .anticon {
        color: ${getRgba(textColor, 0.7)} !important;
    }
    .ant-layout.app-body .anticon:hover {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-btn-primary .anticon,
    .ant-layout.app-body .ant-btn:hover .anticon {
        color: currentColor !important;
    }

    /* ═══ 38. ФИКС: ссылки ═══ */
    .ant-layout.app-body a {
        color: #7c4dff !important;
        transition: color 0.2s ease !important;
    }
    .ant-layout.app-body a:hover {
        color: #b39dff !important;
        text-decoration: underline !important;
    }

    /* ═══ 39. ФИКС: текстовые элементы ═══ */
    .ant-layout.app-body h1,
    .ant-layout.app-body h2,
    .ant-layout.app-body h3,
    .ant-layout.app-body h4,
    .ant-layout.app-body h5,
    .ant-layout.app-body h6,
    .ant-layout.app-body p,
    .ant-layout.app-body span,
    .ant-layout.app-body div {
        background-color: transparent !important;
    }

    /* ═══ 40. ФИКС: подменю в сайдбаре ═══ */
    .ant-layout.app-body .ant-menu-submenu-popup {
        background-color: ${color} !important;
        border: 1px solid ${getRgba(textColor, 0.15)} !important;
        box-shadow: 0 8px 30px rgba(0,0,0,0.5) !important;
    }
    .ant-layout.app-body .ant-menu-submenu-popup .ant-menu-item {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-menu-submenu-popup .ant-menu-item:hover {
        background-color: ${getRgba(textColor, 0.12)} !important;
        color: #ffffff !important;
    }

    /* ═══ 41. ФИКС: фильтры в шапке таблицы ═══ */
    .ant-layout.app-body .ant-table-filter-trigger {
        color: ${getRgba(textColor, 0.5)} !important;
        background: transparent !important;
    }
    .ant-layout.app-body .ant-table-filter-trigger:hover {
        color: ${textColor} !important;
        background-color: ${getRgba(textColor, 0.08)} !important;
    }
    .ant-layout.app-body .ant-table-filter-dropdown {
        background-color: ${color} !important;
        border: 1px solid ${getRgba(textColor, 0.15)} !important;
    }
    .ant-layout.app-body .ant-table-filter-dropdown-tree {
        color: ${textColor} !important;
    }
    .ant-layout.app-body .ant-table-filter-dropdown-search {
        background-color: ${getRgba(textColor, 0.06)} !important;
        border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
    }
    .ant-layout.app-body .ant-table-filter-dropdown-btns {
        border-top: 1px solid ${getRgba(textColor, 0.1)} !important;
    }

    /* ═══ 42. ФИКС: сортировка в таблице ═══ */
    .ant-layout.app-body .ant-table-column-sorter {
        color: ${getRgba(textColor, 0.3)} !important;
    }
    .ant-layout.app-body .ant-table-column-sorter-up.active,
    .ant-layout.app-body .ant-table-column-sorter-down.active {
        color: #7c4dff !important;
    }

    /* ═══ 43. ФИКС: резайз колонок ═══ */
    .ant-layout.app-body .ant-table-cell-fix-left,
    .ant-layout.app-body .ant-table-cell-fix-right {
        background-color: ${getRgba(color, 0.98)} !important;
    }
    .ant-layout.app-body .ant-table-cell-fix-left::after,
    .ant-layout.app-body .ant-table-cell-fix-right::after {
        box-shadow: inset 10px 0 8px -8px ${getRgba(textColor, 0.1)} !important;
    }

    /* ═══ 44. ФИКС: выделение текста ═══ */
    .ant-layout.app-body ::selection {
        background-color: ${getRgba('#7c4dff', 0.3)} !important;
        color: #ffffff !important;
    }

    /* ═══ 45. ФИКС: фокус-ринг ═══ */
    .ant-layout.app-body *:focus-visible {
        outline: 2px solid #7c4dff !important;
        outline-offset: 2px !important;
    }

    /* ═══════════════════════════════════════════════════════
       ═══ БЛОК СООБЩЕНИЙ АРХИВА (классическая структура HTML) ═══
       ═══════════════════════════════════════════════════════ */

    /* ─── 0. БАЗОВЫЙ СБРОС: внешние обёртки прозрачны, фон только у внутреннего блока ─── */
    .ant-layout.app-body .chat-message {
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
    }
    .ant-layout.app-body .chat-message-block {
        background: transparent !important;
        border: none !important;
        padding: 0 !important;
    }

    /* ─── 1. ВОПРОС ПОЛЬЗОВАТЕЛЯ (chat-question) — СИНИЙ ═══ */
    .ant-layout.app-body .chat-message.chat-question .chat-message-block--text,
    .ant-layout.app-body .chat-message.chat-question .chat-message-block--html {
        background-color: rgba(66, 133, 244, 0.18) !important;
        border: 1px solid rgba(66, 133, 244, 0.35) !important;
        border-radius: 8px !important;
        padding: 6px 10px !important;
    }
    .ant-layout.app-body .chat-message.chat-question .chat-message-sender {
        color: #e3f2fd !important;
        font-weight: 600 !important;
    }
    .ant-layout.app-body .chat-message.chat-question .chat-message-time {
        color: #bbdefb !important;
    }
    .ant-layout.app-body .chat-message.chat-question .chat-message-text-wrapper {
        color: #e3f2fd !important;
    }

    /* ─── 2. КОММЕНТАРИЙ (chat-comment) — СЕРЫЙ ═══ */
    .ant-layout.app-body .chat-message.chat-comment .chat-message-block--text,
    .ant-layout.app-body .chat-message.chat-comment .chat-message-block--html {
        background-color: rgba(96, 125, 139, 0.25) !important;
        border: 1px solid rgba(96, 125, 139, 0.4) !important;
        border-radius: 8px !important;
        padding: 6px 10px !important;
    }
    .ant-layout.app-body .chat-message.chat-comment .chat-message-sender {
        color: #eceff1 !important;
        font-weight: 600 !important;
    }
    .ant-layout.app-body .chat-message.chat-comment .chat-message-time {
        color: #b0bec5 !important;
    }
    .ant-layout.app-body .chat-message.chat-comment .chat-message-text-wrapper {
        color: #eceff1 !important;
    }

    /* ─── 3. БОТ (chat-answer-from_bot) — ЗЕЛЁНЫЙ ═══ */
    .ant-layout.app-body .chat-message.chat-answer-from_bot .chat-message-block--html,
    .ant-layout.app-body .chat-message.chat-answer-from_bot .chat-message-block--text,
    .ant-layout.app-body .chat-message[data-is-bot="true"] .chat-message-block--html,
    .ant-layout.app-body .chat-message[data-is-bot="true"] .chat-message-block--text {
        background-color: rgba(46, 125, 50, 0.22) !important;
        border: 1px solid rgba(76, 175, 80, 0.35) !important;
        border-radius: 8px !important;
        padding: 6px 10px !important;
    }
    .ant-layout.app-body .chat-message.chat-answer-from_bot .chat-message-sender,
    .ant-layout.app-body .chat-message[data-is-bot="true"] .chat-message-sender {
        color: #e8f5e9 !important;
        font-weight: 600 !important;
    }
    .ant-layout.app-body .chat-message.chat-answer-from_bot .chat-message-time,
    .ant-layout.app-body .chat-message[data-is-bot="true"] .chat-message-time {
        color: #c8e6c9 !important;
    }
    .ant-layout.app-body .chat-message.chat-answer-from_bot .chat-message-text-wrapper,
    .ant-layout.app-body .chat-message[data-is-bot="true"] .chat-message-text-wrapper {
        color: #e8f5e9 !important;
    }

    /* ─── 4. ОПЕРАТОР (chat-answer-from_operator) — ЯНТАРНЫЙ ═══ */
    .ant-layout.app-body .chat-message.chat-answer-from_operator .chat-message-block--html,
    .ant-layout.app-body .chat-message.chat-answer-from_operator .chat-message-block--text {
        background-color: rgba(255, 193, 7, 0.18) !important;
        border: 1px solid rgba(255, 193, 7, 0.4) !important;
        border-radius: 8px !important;
        padding: 6px 10px !important;
    }
    .ant-layout.app-body .chat-message.chat-answer-from_operator .chat-message-sender {
        color: #fff8e1 !important;
        font-weight: 600 !important;
    }
    .ant-layout.app-body .chat-message.chat-answer-from_operator .chat-message-time {
        color: #ffecb3 !important;
    }
    .ant-layout.app-body .chat-message.chat-answer-from_operator .chat-message-text-wrapper {
        color: #fff8e1 !important;
    }
`;

        if (isDarkBg) {
            cssRules += `
        .ant-layout.app-body .ant-table-tbody > tr > td {
            border-bottom: 1px solid ${getRgba(textColor, 0.1)} !important;
        }
        .ant-layout.app-body .ant-input,
        .ant-layout.app-body .ant-select-selector,
        .ant-layout.app-body .ant-picker {
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.2) !important;
        }
        .ant-layout.app-body .ant-table-tbody > tr:hover > td {
            background-color: ${getRgba(textColor, 0.1)} !important;
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

        injectStyle(document, 'chmaf-tickets-archive-dark');

        // ─── Помечаем комментарии оператора и в архиве ───
        const markOperatorCommentsArchive = () => {
            document.querySelectorAll(
                '.ant-layout.app-body [class*="ChatMessages_RegularMessage__"][data-orientation="sender"][data-author-type="user"]:not([data-comment-checked])'
            ).forEach(msg => {
                const hasActionButtons = msg.querySelector('[class*="Buttons_SharedButton"]');
                const hasForwarded = msg.querySelector('[class*="ChatMessages_RegularMessageForwardedMessagesContainer__"] > *');
                if (!hasActionButtons && !hasForwarded) {
                    msg.setAttribute('data-operator-comment', 'true');
                }
                msg.setAttribute('data-comment-checked', 'true');
            });
        };
        markOperatorCommentsArchive();
    };

    // Запускаем сразу
    applyTicketsArchiveDarkTheme();

    // И наблюдаем за изменениями URL (SPA-навигация)
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            if (url.includes('/tickets/archive') || url.includes('/logs')) {
                setTimeout(applyTicketsArchiveDarkTheme, 300);
            }
        }
    }).observe(document, { subtree: true, childList: true });
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
            .bg-preset.active {
                box-shadow: 0 0 0 2px #7c4dff, 0 0 8px rgba(124, 77, 255, 0.5) !important;
                border-color: #7c4dff !important;
                transform: scale(1.15) !important;
            }
        `;
        document.head.appendChild(style);
    };

    const win_Settings = `
        <div class="set-glass-panel" style="width: 540px" id="settings_container">
            <div class="set-glass-header chmaf-drag-handle" id="settings_head">
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

                                                        <!-- Выбор цвета индикатора «Нет тега/темы» -->
                    <div class="set-row" style="margin-top: 12px; align-items: center;">
                        <span class="set-label">Индикатор «Нет тега»:</span>
                        <input type="color" id="missingTagColorPicker" class="set-input" title="Цвет бейджа при отсутствии тега/темы" style="padding:0; width:34px; height:34px; border-radius:8px; cursor:pointer; flex-shrink: 0;">
                        <span id="missingTagColorLabel" style="font-size: 12px; color: #888; font-family: monospace;">#ff1744</span>
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
        // --- Логика для Цвета Фона ---
        const bgPicker = document.getElementById('appBgColorPicker');

        const updateActivePreset = (currentColor) => {
            const normalized = currentColor.toUpperCase();
            document.querySelectorAll('.bg-preset').forEach(btn => {
                if (btn.getAttribute('data-color').toUpperCase() === normalized) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        bgPicker.value = Settings.get('appBgColor');
        updateActivePreset(Settings.get('appBgColor'));

        bgPicker.oninput = (e) => {
            Settings.set('appBgColor', e.target.value);
            updateActivePreset(e.target.value);
            applyAppBgColor();           // мгновенно: основной чат
            applyTicketsArchiveDarkTheme(); // мгновенно: архив (если мы там)
        };

        document.querySelectorAll('.bg-preset').forEach(btn => {
            btn.onclick = () => {
                const color = btn.getAttribute('data-color');
                bgPicker.value = color;
                Settings.set('appBgColor', color);
                updateActivePreset(color);
                applyAppBgColor();
                applyTicketsArchiveDarkTheme();
            };
        });

        // --- Логика для Цвета индикатора «Нет тега/темы» ---
        const missingTagPicker = document.getElementById('missingTagColorPicker');
        const missingTagLabel = document.getElementById('missingTagColorLabel');

        missingTagPicker.value = Settings.get('missingTagColor');
        missingTagLabel.textContent = Settings.get('missingTagColor');

        missingTagPicker.oninput = (e) => {
            const val = e.target.value;
            Settings.set('missingTagColor', val);
            missingTagLabel.textContent = val;
        };

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
        ui.statusList.value = Settings.get('defaultStatusAfterLogin') || 'Online';
        ui.statusList.onchange = () => {
            Settings.set('defaultStatusAfterLogin', ui.statusList.value);
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