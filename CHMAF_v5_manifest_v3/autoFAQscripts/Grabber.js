/* ============================================================
   AF Grabber — compact edition
   Зависимости проекта: createWindow(), afApiFetch()
   Публичная функция открытия: getopenGrabberButtonPress()
   ============================================================ */

(() => {
    'use strict';

    const API = 'https://skyeng.autofaq.ai/api';
    const SERVICE_ID = '361c681b-340a-4e47-9342-c7309e27e7b5';

    const OPERATOR_GROUPS = new Set([
        'c7bbb211-a217-4ed3-8112-98728dc382d8',
        '8266dbb1-db44-4910-8b5f-a140deeec5c0'
    ]);

    const DEPARTMENTS = [
        ['Техподдержка 2-я линия crm2', '2ЛТП'],
        ['Техподдержка исход crm2', 'ТП исход'],
        ['Teachers Care crm2', 'Teachers Care'],
        ['Исходящие звонки (crm2)', 'Исходящие звонки'],
        ['Кризис менеджеры', 'Кризис менеджеры']
    ];

    const TAGS = [
        ['server_issues', 'Сервер'],
        ['untargeted', 'Нецелевой'],
        ['request_forwarded_to_tc', 'Передано TC'],
        ['request_forwarded_to_channel_qa', 'Передано QA'],
        ['request_forwarded_to_development', 'Передано разработке'],
        ['refusal_of_help', 'Отказ от помощи'],
        ['request_forwarded_to_outgoing_tp_crm2', 'Передано ТП исход'],
        ['queue', 'Очередь'],
        ['oo', 'Ошибка КЦ']
    ];

    /*
     * Полный каталог тем. Строка: ID|Название.
     * Группы используются только как заголовки списка.
     */
    const THEME_GROUPS = [
        {
            name: 'Skyeng · мобильное приложение',
            data: `
1804|Авторизация
1805|Домашка
1806|Оплата
1807|Профиль
1808|Тренажёр слов
1809|Уроки
1810|Чат`
        },
        {
            name: 'Teachers · мобильное приложение',
            data: `
1833|Авторизация
1836|Виджет расписания
1839|Чат
1835|Виджет финансов
1838|Профиль
1840|Сторис
1837|Страница расписания
1834|Страница финансов`
        },
        {
            name: 'Skysmart · приложение родителя',
            data: `
1884|Другое
1883|Материалы
1880|Предметы и баланс
1881|Профиль родителя
1879|Расписание
1882|Чат`
        },
        {
            name: 'Skypro',
            data: `
1904|Skypro App — виджет входа на урок`
        },
        {
            name: 'Разное',
            data: `
2034|Прочее
2030|Slack — проблемы со входом
69|Проблемы с телефонией`
        },
        {
            name: 'Проблемы с оплатой',
            data: `
1077|Вина школы
1658|Консультация
1661|Карта У
1662|Сбой оплаты
1660|Подписки`
        },
        {
            name: 'Проблемы с ДЗ',
            data: `
1744|Контент
1745|Оценка
1746|Словарь
1747|Упражнение`
        },
        {
            name: 'Проблемы со связью',
            data: `
1581|ОС/браузер ниже минимальных требований
1589|Консультация по работе связи
1582|Корпоративная сеть/устройство
1583|ОС/браузер
1586|ПК
1584|Гарнитура
1585|Камера
1580|Блокировка ПО
1594|Неподдерживаемый браузер
1595|Неподдерживаемое оборудование
1593|Сбой платформы
1592|Задержка камеры
1587|Интернет ниже минимума
1590|Блокировка/прерывание связи
1588|Характеристики ниже минимума
1591|Задержка звука`
        },
        {
            name: 'Проблемы ЛКП',
            data: `
1721|Группа
1714|Чат
1719|Финансы
1717|Упражнения
1712|Карта роста
1716|Настройки
1718|Перерыв
1715|Профиль
1720|Работы на проверку
1713|Расписание`
        },
        {
            name: 'Проблемы ЛКУ',
            data: `
1708|Чат
1710|Профиль
1706|Виджет прогресса
1707|История занятий/портфолио
1709|Семья
1711|Настройки
1705|Навыки
1704|Грамматика`
        },
        {
            name: 'Проблемы со входом',
            data: `
1632|Не привязаны почта/телефон
1635|Данные для входа
1634|Сброс пароля
1631|Консультация по авторизации
1633|Сбой авторизации`
        },
        {
            name: 'Проблемы с подключением',
            data: `
1624|Истекла подписка
1627|Консультация по входу на урок
1629|Нет кнопки входа
1628|Ученик не в ГУ
1625|Урок в другое время
1626|Ученик в отпуске
1630|Неактивна кнопка входа`
        },
        {
            name: 'Функционал урока',
            data: `
1772|STT
1773|TTT
1767|Вложения
1771|Демонстрация экрана
1768|Доска
2037|Заметки
1775|Отправка ДЗ на уроке
1770|Переключение материалов
1776|Аудио/видеоплеер
1769|Словарь на уроке
1774|Упражнения на уроке`
        },
        {
            name: 'Отзывы и пожелания',
            data: `
1970|Vim — контент
1971|Vim — оценка
1972|Vim — словарь
1973|Vim — упражнения
1966|ЛК — ОС родителя
1965|ЛК — перенос/отмена урока
1967|ЛК — профиль
1968|ЛК — семья
1969|ЛК — чат
1974|Skyeng App
1975|Teachers App
1979|Skypro App
1976|Приложение «Класс»
1977|Приложение «Решения»
1978|Skysmart для родителей
1980|Прочее`
        },
        {
            name: 'Тематики КЦ',
            data: `
479|Проблемы с оплатой
63|Нет видео или звука
68|Другие технические проблемы
66|ДЗ и виртуальный класс
109|Сброс
73|Отпуск ученика
107|Skyeng App — прочее
1249|Talks
2426|Запланирована связь с пользователем`
        }
    ];

    const themeNames = new Map();

    for (const group of THEME_GROUPS) {
        group.items = group.data.trim().split('\n').map(line => {
            const separator = line.indexOf('|');
            const id = line.slice(0, separator);
            const name = line.slice(separator + 1);

            themeNames.set(id, `${group.name} · ${name}`);

            return { id, name };
        });

        delete group.data;
    }

    const state = {
        operators: [],
        records: [],
        columnFilters: new Map(),
        busy: false,

        analytics: {
            group: 'theme',
            mode: 'timeline',
            view: 'chart',
            selected: new Set(),
            initializedFor: ''
        }
    };

    const template = `
<style>
#AF_Grabber .ag,
#ag-analytics,
#ag-column-popover {
    --ag-bg: #11151d;
    --ag-panel: #1a202a;
    --ag-panel-2: #232b37;
    --ag-border: #353e4b;
    --ag-text: #f2f2ef;
    --ag-muted: #a8afba;
    --ag-accent: #e1b875;
    --ag-accent-2: #f1d6a9;
    --ag-error: #f1a5a5;

    box-sizing: border-box;
    color: var(--ag-text);
    font: 12px/1.45 Inter, -apple-system, BlinkMacSystemFont,
          "Segoe UI", sans-serif;
    color-scheme: dark;
}

#AF_Grabber .ag *,
#ag-analytics *,
#ag-column-popover * {
    box-sizing: border-box;
}

#AF_Grabber .ag {
    width: min(760px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    overflow: auto;
    padding: 16px;
    border: 1px solid #52505a;
    border-radius: 16px;
    background: var(--ag-bg);
    box-shadow: 0 24px 70px rgba(0, 0, 0, .5);
}

#AF_Grabber .ag button,
#AF_Grabber .ag input,
#AF_Grabber .ag select,
#ag-analytics button,
#ag-column-popover button {
    font: inherit;
}

#AF_Grabber .ag button,
#ag-analytics button,
#ag-column-popover button {
    min-height: 30px;
    padding: 5px 10px;
    border: 1px solid var(--ag-border);
    border-radius: 7px;
    background: var(--ag-panel-2);
    color: var(--ag-text);
    cursor: pointer;
    transition: background .15s, border-color .15s;
}

#AF_Grabber .ag button:hover:not(:disabled),
#ag-analytics button:hover:not(:disabled),
#ag-column-popover button:hover:not(:disabled) {
    border-color: var(--ag-accent);
    background: #303a47;
}

#AF_Grabber .ag button:disabled,
#ag-analytics button:disabled {
    opacity: .45;
    cursor: not-allowed;
}

#AF_Grabber .ag .ag-primary {
    border-color: var(--ag-accent);
    background: var(--ag-accent);
    color: #171714;
    font-weight: 750;
}

#AF_Grabber .ag .ag-primary:hover:not(:disabled) {
    background: var(--ag-accent-2);
}

#AF_Grabber .ag input[type="date"],
#AF_Grabber .ag input[type="search"],
#AF_Grabber .ag select,
#ag-analytics input[type="search"] {
    min-height: 31px;
    padding: 5px 8px;
    border: 1px solid var(--ag-border);
    border-radius: 7px;
    outline: none;
    background: #171d26;
    color: var(--ag-text);
}

#AF_Grabber .ag input:focus,
#AF_Grabber .ag select:focus,
#ag-analytics input:focus {
    border-color: var(--ag-accent);
}

#AF_Grabber .ag :focus-visible,
#ag-analytics :focus-visible,
#ag-column-popover :focus-visible {
    outline: 2px solid var(--ag-accent);
    outline-offset: 2px;
}

#AF_Grabber .ag-head,
#AF_Grabber .ag-row,
#AF_Grabber .ag-period,
#AF_Grabber .ag-result-head,
#ag-analytics .ag-analytics-head,
#ag-analytics .ag-analytics-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

#AF_Grabber .ag-head {
    justify-content: space-between;
    margin-bottom: 14px;
}

#AF_Grabber .ag-title {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
}

#AF_Grabber .ag-mark {
    display: grid;
    place-items: center;
    width: 31px;
    height: 31px;
    flex: 0 0 31px;
    border: 1px solid #806b4c;
    border-radius: 8px;
    color: var(--ag-accent);
    font-size: 13px;
    font-weight: 800;
}

#AF_Grabber .ag-head h2 {
    margin: 0;
    font-size: 15px;
    letter-spacing: -.02em;
}

#AF_Grabber .ag-caption {
    color: var(--ag-muted);
    font-size: 11px;
}

#AF_Grabber .ag-controls {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 9px;
}

#AF_Grabber .ag-period {
    flex-wrap: wrap;
}

#AF_Grabber .ag-period input[type="date"] {
    width: 125px;
}

#AF_Grabber .ag-period .ag-caption {
    white-space: nowrap;
}

#AF_Grabber .ag-theme-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 8px;
    margin-top: 9px;
}

#AF_Grabber .ag-theme-row .ag-theme-dropdown {
    width: 100%;
    min-width: 0;
}

#AF_Grabber .ag-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin: 13px 0;
}

#AF_Grabber .ag details {
    border: 1px solid var(--ag-border);
    border-radius: 8px;
    background: var(--ag-panel);
}

#AF_Grabber .ag details[open] {
    flex: 1 1 100%;
    order: 1;
}

#AF_Grabber .ag summary {
    padding: 7px 10px;
    color: var(--ag-accent-2);
    cursor: pointer;
    user-select: none;
}

#AF_Grabber .ag-detail-body {
    padding: 9px;
    border-top: 1px solid var(--ag-border);
}

#AF_Grabber .ag-checkgrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 3px;
    max-height: 160px;
    overflow: auto;
}

#AF_Grabber .ag-check {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    min-width: 0;
    padding: 4px;
    border-radius: 5px;
    cursor: pointer;
}

#AF_Grabber .ag-check:hover {
    background: #303a47;
}

#AF_Grabber .ag-check input {
    flex: 0 0 auto;
    margin-top: 2px;
    accent-color: var(--ag-accent);
}

#AF_Grabber .ag-check span {
    overflow-wrap: anywhere;
}

#AF_Grabber .ag-filter-columns,
#AF_Grabber .ag-search-columns {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

#AF_Grabber .ag-search-columns {
    grid-template-columns: 1fr 1fr;
    margin-top: 9px;
}

#AF_Grabber .ag-search-columns input {
    width: 100%;
}

#AF_Grabber .ag-filter-section {
    padding: 8px;
    border: 1px solid var(--ag-border);
    border-radius: 7px;
}

#AF_Grabber .ag-filter-section strong {
    display: block;
    margin-bottom: 4px;
    color: var(--ag-accent-2);
}

#AF_Grabber .ag-status {
    min-height: 18px;
    margin: 5px 0;
    color: var(--ag-muted);
}

#AF_Grabber .ag-status[data-error="true"] {
    color: var(--ag-error);
}

#AF_Grabber .ag-progress {
    height: 4px;
    overflow: hidden;
    border-radius: 5px;
    background: #333b47;
}

#AF_Grabber .ag-progress > span {
    display: block;
    width: 0;
    height: 100%;
    background: var(--ag-accent);
    transition: width .2s;
}

#AF_Grabber .ag-result-head {
    justify-content: space-between;
    flex-wrap: wrap;
    margin: 13px 0 8px;
}

#AF_Grabber .ag-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

#AF_Grabber .ag-metric {
    padding: 5px 8px;
    border: 1px solid var(--ag-border);
    border-radius: 6px;
    background: var(--ag-panel);
    color: var(--ag-muted);
}

#AF_Grabber .ag-metric b {
    color: var(--ag-text);
}

#AF_Grabber .ag-table-wrap,
#ag-analytics .ag-analytics-table {
    max-height: min(46vh, 420px);
    overflow: auto;
    border: 1px solid var(--ag-border);
    border-radius: 8px;
}

#AF_Grabber .ag table,
#ag-analytics table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
}

#AF_Grabber .ag th,
#ag-analytics th {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: 8px;
    border-bottom: 1px solid var(--ag-border);
    background: #252e3a;
    color: var(--ag-accent-2);
    text-align: left;
    white-space: nowrap;
}

#AF_Grabber .ag td,
#ag-analytics td {
    max-width: 230px;
    padding: 7px 8px;
    border-bottom: 1px solid #303844;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#AF_Grabber .ag tbody tr {
    cursor: pointer;
}

#AF_Grabber .ag tbody tr:hover td {
    background: #29333f;
}

#AF_Grabber .ag-empty {
    padding: 23px;
    color: var(--ag-muted);
    text-align: center;
}

#ag-column-popover {
    position: fixed;
    z-index: 2147483002;
    width: min(290px, calc(100vw - 20px));
    max-height: 360px;
    overflow: auto;
    padding: 10px;
    border: 1px solid #6c655b;
    border-radius: 9px;
    background: #1c242e;
    box-shadow: 0 15px 45px rgba(0, 0, 0, .55);
}

#ag-column-popover[hidden],
#ag-analytics[hidden],
#ag-tooltip[hidden] {
    display: none !important;
}

#ag-column-popover .ag-popover-list {
    max-height: 235px;
    overflow: auto;
    margin-top: 7px;
}

#ag-column-popover label {
    display: flex;
    gap: 6px;
    padding: 4px;
    cursor: pointer;
    overflow-wrap: anywhere;
}

#ag-column-popover input {
    accent-color: #e1b875;
}

#ag-analytics {
    position: fixed;
    top: 45px;
    left: max(12px, calc((100vw - 980px) / 2));
    z-index: 2147483000;
    width: min(980px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    overflow: hidden;
    border: 1px solid #58515a;
    border-radius: 14px;
    background: #11151d;
    box-shadow: 0 24px 75px rgba(0, 0, 0, .7);
}

#ag-analytics .ag-analytics-head {
    justify-content: space-between;
    padding: 11px 14px;
    border-bottom: 1px solid var(--ag-border);
    cursor: grab;
    touch-action: none;
}

#ag-analytics .ag-analytics-head strong {
    font-size: 14px;
}

#ag-analytics .ag-analytics-body {
    max-height: calc(100vh - 90px);
    overflow: auto;
    padding: 13px;
}

#ag-analytics .ag-analytics-controls {
    flex-wrap: wrap;
    margin-bottom: 11px;
}

#ag-analytics button[aria-pressed="true"] {
    border-color: var(--ag-accent);
    color: var(--ag-accent-2);
}

#ag-analytics .ag-series-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;
    margin: 10px 0;
}

#ag-analytics .ag-series-toolbar input {
    flex: 1 1 160px;
    max-width: 240px;
}

#ag-analytics .ag-series-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    max-height: 105px;
    overflow: auto;
    padding: 2px 0 7px;
}

#ag-analytics .ag-series {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 300px;
    padding: 4px 6px;
    border: 1px solid #404956;
    border-radius: 6px;
    background: #1a202a;
    color: var(--ag-text);
}

#ag-analytics .ag-series input {
    margin: 0;
    accent-color: var(--ag-accent);
}

#ag-analytics .ag-series-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
}

#ag-analytics .ag-series .ag-only {
    min-height: 0;
    padding: 1px 4px;
    border: 0;
    background: transparent;
    color: var(--ag-muted);
    font-size: 10px;
}

#ag-analytics .ag-graph-scroll {
    overflow-x: auto;
    border: 1px solid var(--ag-border);
    border-radius: 8px;
    background: #171d26;
}

#ag-analytics svg {
    display: block;
}

#ag-analytics .ag-bars {
    display: grid;
    gap: 7px;
    padding: 12px;
}

#ag-analytics .ag-bar {
    display: grid;
    grid-template-columns: minmax(100px, 230px) 1fr 40px;
    align-items: center;
    gap: 9px;
}

#ag-analytics .ag-bar-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#ag-analytics .ag-bar-track {
    height: 11px;
    border-radius: 9px;
    background: #303b49;
}

#ag-analytics .ag-bar-fill {
    height: 100%;
    border-radius: inherit;
    background: #e1b875;
}

#ag-analytics .ag-hint {
    margin: 8px 0 0;
    color: var(--ag-muted);
    font-size: 11px;
}

#ag-tooltip {
    position: fixed;
    z-index: 2147483001;
    max-width: min(330px, calc(100vw - 20px));
    padding: 8px 10px;
    border: 1px solid #736753;
    border-radius: 7px;
    background: #252e39;
    box-shadow: 0 10px 30px rgba(0, 0, 0, .45);
    color: #f2f2ef;
    font: 11px/1.5 Inter, sans-serif;
    pointer-events: none;
    white-space: pre-line;
}

@media (max-width: 690px) {
    #AF_Grabber .ag-controls {
        grid-template-columns: 1fr;
    }

    #AF_Grabber .ag-checkgrid,
    #AF_Grabber .ag-filter-columns {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    #ag-analytics {
        left: 12px;
        top: 12px;
    }
}

@media (max-width: 440px) {
    #AF_Grabber .ag-theme-row {
        grid-template-columns: 1fr 1fr;
    }

    #AF_Grabber .ag-theme-row .ag-theme-dropdown {
        grid-column: 1 / -1;
    }

    #AF_Grabber .ag-checkgrid,
    #AF_Grabber .ag-filter-columns,
    #AF_Grabber .ag-search-columns {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: reduce) {
    #AF_Grabber .ag *,
    #ag-analytics * {
        transition: none !important;
    }
}

#AF_Grabber .ag .ag-theme-row .ag-theme-dropdown {
    position: relative;
    min-width: 0;
    width: 100%;
}

#AF_Grabber .ag .ag-theme-row .ag-theme-dropdown[open] {
    flex: none;
    order: 0;
}

#AF_Grabber .ag .ag-theme-row .ag-theme-dropdown > summary {
    min-height: 31px;
    padding: 5px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ag-text);
}

#AF_Grabber .ag .ag-theme-menu {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    z-index: 30;
    width: min(410px, calc(100vw - 45px));
    max-height: 320px;
    overflow-y: auto;
    padding: 8px;
    border: 1px solid #6c655b;
    border-radius: 9px;
    background: #202832;
    box-shadow: 0 16px 40px rgba(0, 0, 0, .5);
}

#AF_Grabber .ag .ag-theme-group {
    padding: 8px 5px 4px;
    color: var(--ag-accent);
    font-size: 11px;
    font-weight: 700;
}

#AF_Grabber .ag .ag-theme-group:not(:first-child) {
    margin-top: 5px;
    border-top: 1px solid var(--ag-border);
}

#AF_Grabber .ag .ag-theme-menu .ag-check {
    padding: 5px 7px;
}
</style>

<div class="ag">
    <div class="ag-head chmaf-drag-handle">
        <div class="ag-title">
            <div class="ag-mark">AF</div>
            <div>
                <h2>Аналитика обращений</h2>
                <div class="ag-caption">Чаты · фильтры · динамика</div>
            </div>
        </div>
        <button type="button" data-action="close">Закрыть</button>
    </div>

    <div class="ag-controls">
        <div class="ag-period">
            <span class="ag-caption">Период</span>
            <input type="date" data-id="from" aria-label="Начало периода">
            <span class="ag-caption">—</span>
            <input type="date" data-id="to" aria-label="Конец периода">
        </div>

        <div class="ag-row">
            <button type="button" data-action="previous"
                    title="Сдвинуть обе даты на день назад">← День</button>
            <button type="button" data-action="next"
                    title="Сдвинуть обе даты на день вперёд">День →</button>
        </div>
    </div>

    <div class="ag-theme-row">
        <details class="ag-theme-dropdown">
            <summary data-id="theme-label">Все тематики</summary>
            <div class="ag-theme-menu">
                <div data-id="theme-list"></div>
            </div>
        </details>
        <button type="button" class="ag-primary"
                data-action="search">Найти</button>
        <button type="button" data-action="analytics"
                disabled>Графики</button>
    </div>

    <div class="ag-filters">
        <details>
            <summary>Операторы</summary>
            <div class="ag-detail-body">
                <button type="button" data-action="toggle-operators">
                    Выбрать всех / снять выбор
                </button>
                <div class="ag-checkgrid" data-id="operators"
                     style="margin-top:7px"></div>
            </div>
        </details>

        <details>
            <summary>Оценки и теги</summary>
            <div class="ag-detail-body">
                <strong>Оценки</strong>
                <div class="ag-checkgrid" data-id="marks"></div>

                <strong style="display:block;margin-top:9px">Теги</strong>
                <div class="ag-checkgrid" data-id="tags"></div>
            </div>
        </details>

        <details>
            <summary>Дополнительные фильтры</summary>
            <div class="ag-detail-body">
                <div class="ag-filter-columns">
                    <div class="ag-filter-section">
                        <strong>Приоритет</strong>
                        <div data-id="priorities"></div>
                    </div>
                    <div class="ag-filter-section">
                        <strong>Отдел</strong>
                        <div data-id="departments"></div>
                    </div>
                    <div class="ag-filter-section">
                        <strong>Тип пользователя</strong>
                        <div data-id="user-types"></div>
                    </div>
                </div>
                <div class="ag-search-columns">
                    <input type="search" data-id="comment"
                           placeholder="Поиск в комментариях">
                    <input type="search" data-id="message"
                           placeholder="Поиск в сообщениях">
                </div>
            </div>
        </details>
    </div>

    <div class="ag-status" data-id="status"
         role="status" aria-live="polite"></div>

    <div class="ag-progress"><span data-id="progress"></span></div>

    <div class="ag-result-head">
        <div class="ag-metrics" data-id="metrics"></div>
        <button type="button" data-action="export" disabled>
            Скачать видимые CSV
        </button>
    </div>

    <div class="ag-table-wrap" data-id="table">
        <div class="ag-empty">Выберите период и запустите поиск.</div>
    </div>
</div>
`;

    createWindow(
        'AF_Grabber',
        'winTopGrabber',
        'winLeftGrabber',
        template
    );

    const windowElement = document.getElementById('AF_Grabber');
    const app = windowElement?.querySelector('.ag');

    if (!windowElement || !app) {
        throw new Error('Не удалось создать окно AF_Grabber.');
    }

    const $ = id => app.querySelector(`[data-id="${id}"]`);
    const action = name => app.querySelector(`[data-action="${name}"]`);

    const analytics = document.createElement('section');
    analytics.id = 'ag-analytics';
    analytics.hidden = true;

    analytics.innerHTML = `
        <div class="ag-analytics-head">
            <div>
                <strong>Аналитика</strong>
                <div style="color:#a8afba;font-size:11px">
                    Выбирайте одну или несколько линий
                </div>
            </div>
            <button type="button" data-a-action="close">Закрыть</button>
        </div>

        <div class="ag-analytics-body">
            <div class="ag-analytics-controls">
                <button type="button" data-group="theme">Тематики</button>
                <button type="button" data-group="country">Страны</button>
                <button type="button" data-mode="timeline">Динамика</button>
                <button type="button" data-mode="summary">Сводка</button>
                <button type="button" data-view="chart">График</button>
                <button type="button" data-view="table">Таблица</button>
                <button type="button" data-a-action="export">
                    CSV
                </button>
            </div>

            <div class="ag-series-toolbar">
                <input type="search" data-a-id="series-search"
                       placeholder="Найти тематику или страну">
                <button type="button" data-a-action="select-all">
                    Выбрать всё
                </button>
                <button type="button" data-a-action="clear">
                    Снять всё
                </button>
                <span data-a-id="selected-count"
                      style="color:#a8afba"></span>
            </div>

            <div class="ag-series-list" data-a-id="series"></div>
            <div data-a-id="content"></div>
        </div>
    `;

    document.body.appendChild(analytics);

    const popover = document.createElement('div');
    popover.id = 'ag-column-popover';
    popover.hidden = true;
    document.body.appendChild(popover);

    const tooltip = document.createElement('div');
    tooltip.id = 'ag-tooltip';
    tooltip.hidden = true;
    document.body.appendChild(tooltip);

    const a$ = id => analytics.querySelector(`[data-a-id="${id}"]`);

    const COLUMNS = [
        ['date', 'Дата'],
        ['operator', 'Оператор'],
        ['id', 'Chat ID'],
        ['csat', 'CSAT'],
        ['theme', 'Тематика'],
        ['sla', 'SLA'],
        ['country', 'Страна'],
        ['department', 'Отдел'],
        ['text', 'Комментарий / сообщение']
    ];

    const CHART_COLORS = [
        '#e1b875',
        '#75c3db',
        '#b49ae7',
        '#8ccf9e',
        '#e8999b',
        '#e2ba79',
        '#80a2ee',
        '#d696cf',
        '#98c4be',
        '#d3a982'
    ];

    function checkbox(value, label, name, checked = false) {
        const wrapper = document.createElement('label');
        wrapper.className = 'ag-check';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = name;
        input.value = String(value);
        input.checked = checked;

        const text = document.createElement('span');
        text.textContent = label;

        wrapper.append(input, text);
        return wrapper;
    }

    function setOptions(container, name, entries) {
        container.replaceChildren(
            ...entries.map(([value, label]) =>
                checkbox(value, label, name, value === 'Any')
            )
        );
    }

    function selected(container) {
        return [
            ...container.querySelectorAll('input:checked')
        ].map(input => input.value);
    }

    function selectedOrAny(container) {
        const values = selected(container);
        return values.length ? values : ['Any'];
    }

    function setStatus(text, error = false) {
        $('status').textContent = text;
        $('status').dataset.error = String(error);
    }

    function setProgress(percent) {
        $('progress').style.width =
            `${Math.max(0, Math.min(100, percent))}%`;
    }

    function formatMoscowDate(date = new Date()) {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Moscow',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).formatToParts(date);

        const part = type =>
            parts.find(item => item.type === type)?.value;

        return `${part('year')}-${part('month')}-${part('day')}`;
    }

    function shiftDate(value, amount) {
        const date = new Date(`${value}T12:00:00Z`);

        if (!Number.isFinite(date.getTime())) {
            return value;
        }

        date.setUTCDate(date.getUTCDate() + amount);
        return date.toISOString().slice(0, 10);
    }

    function dateRange() {
        const from = $('from').value;
        const to = $('to').value;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(from) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(to) ||
            from > to) {
            throw new Error('Проверьте даты начала и конца периода.');
        }

        const start = new Date(`${from}T00:00:00+03:00`);
        const end = new Date(`${to}T00:00:00+03:00`);

        if (!Number.isFinite(start.getTime()) ||
            !Number.isFinite(end.getTime())) {
            throw new Error('Не удалось прочитать выбранные даты.');
        }

        end.setUTCDate(end.getUTCDate() + 1);
        end.setUTCMilliseconds(end.getUTCMilliseconds() - 1);

        return {
            from: start.toISOString(),
            to: end.toISOString()
        };
    }

    function formatMoscow(timestamp) {
        return new Intl.DateTimeFormat('ru-RU', {
            timeZone: 'Europe/Moscow',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        }).format(timestamp);
    }

    function timeSlot(timestamp) {
        const parts = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Moscow',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        }).formatToParts(timestamp);

        const value = type =>
            Number(parts.find(item => item.type === type)?.value);

        const hour = value('hour');
        const minute = value('minute');

        return Number.isFinite(hour) && Number.isFinite(minute)
            ? hour * 2 + (minute >= 30 ? 1 : 0)
            : null;
    }

    async function apiJson(url, options) {
        const response = await afApiFetch(url, options);

        if (!response?.ok) {
            throw new Error(
                `API вернул HTTP ${response?.status ?? 'unknown'}`
            );
        }

        return response.json();
    }

    function initialize() {
        const themeList = $('theme-list');

        themeList.append(
            checkbox('parseallthemes', 'Все тематики', 'theme', true),
            checkbox('parsenothemes', 'Без тематики', 'theme')
        );

        for (const group of THEME_GROUPS) {
            const heading = document.createElement('div');
            heading.className = 'ag-theme-group';
            heading.textContent = group.name;
            themeList.appendChild(heading);

            for (const item of group.items) {
                themeList.appendChild(
                    checkbox(item.id, item.name, 'theme')
                );
            }
        }

        $('marks').replaceChildren(
            ...[
                ['5', '5 · Отлично'],
                ['4', '4 · Хорошо'],
                ['3', '3 · Нейтрально'],
                ['2', '2 · Плохо'],
                ['1', '1 · Очень плохо'],
                ['none', 'Без оценки']
            ].map(([value, label]) =>
                checkbox(value, label, 'mark', true)
            )
        );

        $('tags').replaceChildren(
            ...TAGS.map(([value, label]) =>
                checkbox(value, label, 'tag')
            )
        );

        setOptions($('priorities'), 'priority', [
            ['Any', 'Любой'],
            ['Низкий', 'Низкий'],
            ['Высокий', 'Высокий'],
            ['Критический', 'Критический']
        ]);

        setOptions($('departments'), 'department', [
            ['Any', 'Любой'],
            ...DEPARTMENTS
        ]);

        setOptions($('user-types'), 'user-type', [
            ['Any', 'Любой'],
            ['student', 'Ученик'],
            ['parent', 'Родитель'],
            ['teacher', 'Преподаватель'],
            ['null', 'Не указан']
        ]);

        const today = formatMoscowDate();
        $('from').value = today;
        $('to').value = today;
    }

    async function loadOperators() {
        $('operators').textContent = 'Загрузка…';
        action('search').disabled = true;

        try {
            const data = await apiJson(
                `${API}/operators/statistic/currentState`
            );

            const unique = new Map();

            for (const entry of data?.onOperator ?? []) {
                const operator = entry.operator;

                if (!OPERATOR_GROUPS.has(entry.groupId) ||
                    !operator?.id ||
                    !operator?.fullName) {
                    continue;
                }

                const id = String(operator.id);

                unique.set(id, {
                    id,
                    name: String(operator.fullName)
                });
            }

            state.operators = [...unique.values()].sort(
                (a, b) => a.name.localeCompare(b.name, 'ru')
            );

            $('operators').replaceChildren(
                ...state.operators.map(operator =>
                    checkbox(
                        operator.id,
                        operator.name,
                        'operator',
                        true
                    )
                )
            );

            if (!state.operators.length) {
                $('operators').textContent =
                    'Операторы в выбранных группах не найдены.';
                setStatus('Операторы не найдены.', true);
                return;
            }

            action('search').disabled = false;
            setStatus(
                `Доступно операторов: ${state.operators.length}.`
            );
        } catch (error) {
            console.error('Загрузка операторов:', error);
            $('operators').textContent =
                'Не удалось загрузить операторов.';
            setStatus(
                'Не удалось загрузить операторов. Повторно откройте окно.',
                true
            );
        }
    }

    function readFilters() {
        return {
            themes: new Set(selected($('theme-list'))),
            marks: new Set(selected($('marks'))),
            tags: new Set(selected($('tags'))),
            priorities: selectedOrAny($('priorities')),
            departments: selectedOrAny($('departments')),
            userTypes: selectedOrAny($('user-types')),
            comment: $('comment').value
                .trim()
                .toLocaleLowerCase('ru'),
            message: $('message').value
                .trim()
                .toLocaleLowerCase('ru')
        };
    }

    function parseRate(item) {
        const raw = item?.stats?.rate?.rate;

        if (raw === null || raw === undefined || raw === '') {
            return null;
        }

        const value = Number(raw);
        return Number.isFinite(value) ? value : null;
    }

    async function loadHistory(operator, range, filters) {
        const chats = [];
        const limit = 100;
        const maxPages = 500;

        for (let page = 1; page <= maxPages; page++) {
            const body = {
                serviceId: SERVICE_ID,
                mode: 'Json',
                participatingOperatorsIds: [operator.id],
                tsFrom: range.from,
                tsTo: range.to,
                orderBy: 'ts',
                orderDirection: 'Asc',
                page,
                limit
            };

            const data = await apiJson(
                `${API}/conversations/history`,
                {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );

            const items = Array.isArray(data?.items)
                ? data.items
                : [];

            for (const item of items) {
                if (String(item.operatorId) !== operator.id ||
                    !item.conversationId) {
                    continue;
                }

                const rate = parseRate(item);
                const rateKey = rate === null
                    ? 'none'
                    : String(rate);

                if (filters.marks.has(rateKey)) {
                    chats.push({
                        id: String(item.conversationId),
                        operator: operator.name,
                        rate
                    });
                }
            }

            const total = Number(data?.total);

            if (items.length < limit ||
                (Number.isFinite(total) &&
                 page * limit >= total)) {
                break;
            }

            if (page === maxPages) {
                console.warn(
                    `Достигнут лимит страниц истории: ${operator.name}`
                );
            }
        }

        return chats;
    }

    function parseTags(raw) {
        if (Array.isArray(raw)) {
            return raw.map(String);
        }

        if (typeof raw !== 'string' || !raw.trim()) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw);

            if (Array.isArray(parsed)) {
                return parsed.map(String);
            }
        } catch {
            // Обычный список тегов через запятую.
        }

        return raw
            .split(',')
            .map(tag => tag.trim())
            .filter(Boolean);
    }

    function themeMatches(topicId, selectedThemes) {
        if (selectedThemes.has('parseallthemes')) {
            return true;
        }

        if (!topicId && selectedThemes.has('parsenothemes')) {
            return true;
        }

        return topicId != null &&
            selectedThemes.has(String(topicId));
    }

    function commentHasAny(text, values, prefix) {
        return values.includes('Any') ||
            values.some(value =>
                text.includes(
                    `${prefix}${value.toLocaleLowerCase('ru')}`
                )
            );
    }

    function extractComment(text) {
        const match = String(text ?? '').match(
            /комментарий:\s*([\s\S]*)/i
        );

        if (!match) return '';

        return match[1]
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '')
            .trim();
    }

    async function loadChat(chat, filters) {
        const data = await apiJson(
            `${API}/conversations/${encodeURIComponent(chat.id)}`
        );

        const topicId = data.payload?.topicId?.value;

        if (!themeMatches(topicId, filters.themes)) {
            return null;
        }

        const messages = Array.isArray(data.messages)
            ? data.messages
            : [];

        const comments = messages.filter(
            message => message.tpe === 'OperatorComment'
        );

        const allCommentText = comments
            .map(message => String(message.txt ?? ''))
            .join('\n')
            .toLocaleLowerCase('ru');

        if (!commentHasAny(
            allCommentText,
            filters.priorities,
            'критичность: '
        )) {
            return null;
        }

        if (!commentHasAny(
            allCommentText,
            filters.departments,
            'категория: '
        )) {
            return null;
        }

        const rawUserType =
            data.channelUser?.payload?.userType;

        const userType =
            rawUserType === null ||
            rawUserType === undefined ||
            rawUserType === ''
                ? 'null'
                : String(rawUserType);

        if (!filters.userTypes.includes('Any') &&
            !filters.userTypes.includes(userType)) {
            return null;
        }

        const matchedComment = filters.comment
            ? comments.find(message =>
                String(message.txt ?? '')
                    .toLocaleLowerCase('ru')
                    .includes(filters.comment)
            )
            : null;

        if (filters.comment && !matchedComment) {
            return null;
        }

        const userMessages = messages.filter(message =>
            [
                'Question',
                'AnswerOperator',
                'AnswerOperatorWithBot'
            ].includes(message.tpe)
        );

        const matchedMessage = filters.message
            ? userMessages.find(message =>
                String(message.txt ?? '')
                    .toLocaleLowerCase('ru')
                    .includes(filters.message)
            )
            : null;

        if (filters.message && !matchedMessage) {
            return null;
        }

        const tags = parseTags(data.payload?.tags?.value);

        if (filters.tags.size &&
            !tags.some(tag => filters.tags.has(tag))) {
            return null;
        }

        const department = DEPARTMENTS.find(
            ([fullName]) =>
                allCommentText.includes(
                    `категория: ${fullName.toLocaleLowerCase('ru')}`
                )
        )?.[1] ?? '—';

        const commentBlock = comments.find(message =>
            /критичность:|категория:/i.test(
                String(message.txt ?? '')
            )
        );

        const text = [
            extractComment(
                commentBlock?.txt ??
                matchedComment?.txt ??
                ''
            ),
            matchedMessage
                ? String(matchedMessage.txt ?? '')
                : ''
        ].filter(Boolean).join('\n\n');

        const timestamp = new Date(data.tsCreate).getTime();
        const modified = new Date(data.tsMod).getTime();

        const duration =
            data.tsMod != null &&
            Number.isFinite(timestamp) &&
            Number.isFinite(modified) &&
            modified >= timestamp
                ? modified - timestamp
                : null;

        return {
            id: String(data.id ?? chat.id),
            timestamp: Number.isFinite(timestamp)
                ? timestamp
                : null,
            slot: Number.isFinite(timestamp)
                ? timeSlot(timestamp)
                : null,
            date: Number.isFinite(timestamp)
                ? formatMoscow(timestamp)
                : '—',
            operator: chat.operator,
            csat: chat.rate,
            theme: topicId
                ? themeNames.get(String(topicId)) ??
                  'Неизвестная тематика'
                : 'Без тематики',
            sla: duration === null
                ? null
                : duration <= 25 * 60 * 1000,
            country: String(
                data.channelUser?.payload?.country ?? '—'
            ),
            department,
            userType,
            tags,
            text
        };
    }

    async function parallel(items, concurrency, handler, onProgress) {
        let cursor = 0;
        let completed = 0;

        async function worker() {
            while (cursor < items.length) {
                const item = items[cursor++];

                try {
                    await handler(item);
                } finally {
                    completed++;
                    onProgress(completed, items.length);
                }
            }
        }

        await Promise.all(
            Array.from(
                {
                    length: Math.min(concurrency, items.length)
                },
                () => worker()
            )
        );
    }

    function cellValue(record, field) {
        if (field === 'csat') {
            return record.csat ?? '—';
        }

        if (field === 'sla') {
            return record.sla === null
                ? '—'
                : record.sla
                    ? 'Да'
                    : 'Нет';
        }

        return record[field] ?? '—';
    }

    function visibleRecords() {
        return state.records.filter(record => {
            for (const [field, accepted] of state.columnFilters) {
                if (!accepted.has(
                    String(cellValue(record, field))
                )) {
                    return false;
                }
            }

            return true;
        });
    }

    function renderMetrics(records) {
        const rated = records.filter(
            record => record.csat !== null
        );

        const knownSla = records.filter(
            record => record.sla !== null
        );

        const average = rated.length
            ? rated.reduce(
                (sum, record) => sum + record.csat,
                0
            ) / rated.length
            : null;

        const slaPercent = knownSla.length
            ? knownSla.filter(record => record.sla).length /
              knownSla.length * 100
            : null;

        const metrics = [
            ['Чаты', `${records.length} / ${state.records.length}`],
            [
                'CSAT',
                average === null ? '—' : average.toFixed(2)
            ],
            [
                'SLA',
                slaPercent === null
                    ? '—'
                    : `${slaPercent.toFixed(1)}%`
            ]
        ];

        $('metrics').replaceChildren(
            ...metrics.map(([label, value]) => {
                const item = document.createElement('span');
                item.className = 'ag-metric';

                const bold = document.createElement('b');
                bold.textContent = value;

                item.append(
                    document.createTextNode(`${label} `),
                    bold
                );

                return item;
            })
        );
    }

    function renderTable() {
        const container = $('table');
        const records = visibleRecords();

        renderMetrics(records);
        container.replaceChildren();

        if (!records.length) {
            const empty = document.createElement('div');
            empty.className = 'ag-empty';
            empty.textContent = state.records.length
                ? 'Нет строк для выбранных фильтров столбцов.'
                : 'Чаты не найдены.';
            container.appendChild(empty);
            return;
        }

        const table = document.createElement('table');
        const header = table.createTHead().insertRow();

        for (const [field, title] of COLUMNS) {
            const th = document.createElement('th');
            const filter = document.createElement('button');

            filter.type = 'button';
            filter.textContent = `${title} ▾`;
            filter.title = `Фильтр столбца «${title}»`;
            filter.style.cssText =
                'min-height:0;padding:0;border:0;' +
                'background:transparent;color:inherit;' +
                'font-weight:700';

            filter.addEventListener('click', event =>
                openColumnFilter(
                    field,
                    title,
                    event.currentTarget
                )
            );

            th.appendChild(filter);
            header.appendChild(th);
        }

        const body = table.createTBody();

        for (const record of records) {
            const row = body.insertRow();
            row.title = 'Открыть историю чата';

            for (const [field] of COLUMNS) {
                const td = row.insertCell();
                const value = String(cellValue(record, field));

                td.textContent = value;
                td.title = value;
            }

            row.addEventListener(
                'click',
                () => openHistory(record.id)
            );
        }

        container.appendChild(table);
    }

    function openHistory(id) {
        const input = document.getElementById('hashchathis');

        const searchButton =
            document.getElementById('btn_search_history') ??
            window.btn_search_history;

        if (!input || !searchButton) {
            setStatus(
                `Chat ID: ${id}. Окно истории недоступно.`,
                true
            );
            return;
        }

        input.value = id;

        const historyWindow =
            document.getElementById('AF_ChatHis');

        if (historyWindow &&
            getComputedStyle(historyWindow).display === 'none') {
            document.getElementById('opennewcat')?.click();
        }

        searchButton.click();
    }

    function openColumnFilter(field, title, anchor) {
        const values = [...new Set(
            state.records.map(record =>
                String(cellValue(record, field))
            )
        )].sort((a, b) =>
            a.localeCompare(b, 'ru', { numeric: true })
        );

        if (!state.columnFilters.has(field)) {
            state.columnFilters.set(field, new Set(values));
        }

        const accepted = state.columnFilters.get(field);

        popover.replaceChildren();

        const heading = document.createElement('strong');
        heading.textContent = title;

        const controls = document.createElement('div');
        controls.style.cssText =
            'display:flex;gap:5px;margin-top:8px';

        const all = document.createElement('button');
        all.textContent = 'Все';

        const none = document.createElement('button');
        none.textContent = 'Ничего';

        const close = document.createElement('button');
        close.textContent = 'Закрыть';

        controls.append(all, none, close);

        const list = document.createElement('div');
        list.className = 'ag-popover-list';

        for (const value of values) {
            const label = document.createElement('label');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.value = value;
            input.checked = accepted.has(value);

            const text = document.createElement('span');
            text.textContent = value || '(Пусто)';

            input.addEventListener('change', () => {
                if (input.checked) accepted.add(value);
                else accepted.delete(value);

                renderTable();

                if (!analytics.hidden) {
                    renderAnalytics();
                }
            });

            label.append(input, text);
            list.appendChild(label);
        }

        all.addEventListener('click', () => {
            accepted.clear();
            values.forEach(value => accepted.add(value));

            list.querySelectorAll('input').forEach(input => {
                input.checked = true;
            });

            renderTable();

            if (!analytics.hidden) renderAnalytics();
        });

        none.addEventListener('click', () => {
            accepted.clear();

            list.querySelectorAll('input').forEach(input => {
                input.checked = false;
            });

            renderTable();

            if (!analytics.hidden) renderAnalytics();
        });

        close.addEventListener(
            'click',
            () => popover.hidden = true
        );

        popover.append(heading, controls, list);
        popover.hidden = false;

        const rect = anchor.getBoundingClientRect();

        popover.style.left = `${Math.max(
            10,
            Math.min(rect.left, window.innerWidth - 300)
        )}px`;

        popover.style.top = `${Math.max(
            10,
            Math.min(rect.bottom + 5, window.innerHeight - 250)
        )}px`;
    }

    async function runSearch() {
        if (state.busy) return;

        try {
            const range = dateRange();
            const filters = readFilters();
            const selectedIds = new Set(
                selected($('operators'))
            );

            const operators = state.operators.filter(
                operator => selectedIds.has(operator.id)
            );

            if (!operators.length) {
                throw new Error(
                    'Выберите хотя бы одного оператора.'
                );
            }

            if (!filters.marks.size) {
                throw new Error(
                    'Выберите хотя бы одну оценку.'
                );
            }

            state.busy = true;
            state.records = [];
            state.columnFilters.clear();

            action('search').disabled = true;
            action('analytics').disabled = true;
            action('export').disabled = true;

            analytics.hidden = true;
            tooltip.hidden = true;
            popover.hidden = true;

            $('table').innerHTML =
                '<div class="ag-empty">Загружаем чаты…</div>';

            $('metrics').replaceChildren();
            setProgress(0);

            const uniqueChats = new Map();
            let failedOperators = 0;
            let failedChats = 0;

            for (let i = 0; i < operators.length; i++) {
                const operator = operators[i];

                try {
                    const chats = await loadHistory(
                        operator,
                        range,
                        filters
                    );

                    for (const chat of chats) {
                        if (!uniqueChats.has(chat.id)) {
                            uniqueChats.set(chat.id, chat);
                        }
                    }
                } catch (error) {
                    failedOperators++;
                    console.error(
                        `История оператора ${operator.name}:`,
                        error
                    );
                }

                setProgress(
                    (i + 1) / operators.length * 35
                );

                setStatus(
                    `История: ${i + 1} / ${operators.length}`
                );
            }

            const chats = [...uniqueChats.values()];

            await parallel(
                chats,
                5,
                async chat => {
                    try {
                        const record = await loadChat(
                            chat,
                            filters
                        );

                        if (record) {
                            state.records.push(record);
                        }
                    } catch (error) {
                        failedChats++;
                        console.error(
                            `Чат ${chat.id}:`,
                            error
                        );
                    }
                },
                (done, total) => {
                    setProgress(
                        35 + done / Math.max(total, 1) * 65
                    );

                    setStatus(
                        `Чаты: ${done} / ${total}`
                    );
                }
            );

            state.records.sort(
                (a, b) =>
                    (b.timestamp ?? 0) -
                    (a.timestamp ?? 0)
            );

            state.analytics.selected.clear();
            state.analytics.initializedFor = '';

            renderTable();
            setProgress(100);

            action('analytics').disabled =
                !state.records.length;

            action('export').disabled =
                !state.records.length;

            const errorCount =
                failedOperators + failedChats;

            setStatus(
                `Готово: ${state.records.length} чатов.` +
                (errorCount
                    ? ` Ошибок: ${errorCount}; выборка может быть неполной.`
                    : ''),
                errorCount > 0
            );
        } catch (error) {
            console.error('Поиск:', error);

            setStatus(
                error.message ??
                    'Не удалось выполнить поиск.',
                true
            );
        } finally {
            state.busy = false;
            action('search').disabled =
                !state.operators.length;
        }
    }

    /* ==================== Аналитика ==================== */

    function groupName(record) {
        return state.analytics.group === 'theme'
            ? record.theme
            : record.country;
    }

    function availableGroups() {
        const counts = new Map();

        for (const record of visibleRecords()) {
            const name = groupName(record);

            counts.set(
                name,
                (counts.get(name) ?? 0) + 1
            );
        }

        return [...counts]
            .map(([name, count]) => ({
                name,
                count
            }))
            .sort(
                (a, b) =>
                    b.count - a.count ||
                    a.name.localeCompare(b.name, 'ru')
            );
    }

    function synchronizeSelection(groups) {
        const key = state.analytics.group;
        const available = new Set(
            groups.map(group => group.name)
        );

        if (state.analytics.initializedFor !== key) {
            state.analytics.selected =
                new Set(available);

            state.analytics.initializedFor = key;
        } else {
            for (const name of state.analytics.selected) {
                if (!available.has(name)) {
                    state.analytics.selected.delete(name);
                }
            }
        }
    }

    function intervalLabel(slot) {
        const clock = index =>
            `${String(
                Math.floor(index / 2) % 24
            ).padStart(2, '0')}:` +
            `${index % 2 ? '30' : '00'}`;

        return `${clock(slot)}–${clock(slot + 1)}`;
    }

    function analyticsData() {
        const groups = availableGroups();

        synchronizeSelection(groups);

        const names = groups
            .map(group => group.name)
            .filter(name =>
                state.analytics.selected.has(name)
            );

        const selectedNames = new Set(names);
        const records = visibleRecords().filter(
            record =>
                selectedNames.has(groupName(record))
        );

        if (state.analytics.mode === 'summary') {
            const counts = new Map(
                names.map(name => [name, 0])
            );

            for (const record of records) {
                const name = groupName(record);

                counts.set(
                    name,
                    counts.get(name) + 1
                );
            }

            return {
                groups,
                names,
                rows: [...counts]
                    .map(([name, count]) => ({
                        name,
                        count
                    }))
                    .sort(
                        (a, b) =>
                            b.count - a.count
                    )
            };
        }

        const series = new Map(
            names.map(name => [
                name,
                Array(48).fill(0)
            ])
        );

        for (const record of records) {
            if (record.slot !== null &&
                record.slot >= 0 &&
                record.slot < 48) {
                series.get(groupName(record))[
                    record.slot
                ]++;
            }
        }

        const rows = [];

        for (let slot = 0; slot < 48; slot++) {
            for (const name of names) {
                const count = series.get(name)[slot];

                if (count) {
                    rows.push({
                        slot,
                        interval: intervalLabel(slot),
                        name,
                        count
                    });
                }
            }
        }

        return {
            groups,
            names,
            series,
            rows
        };
    }

    function renderSeriesControls(groups) {
        const search = a$('series-search')
            .value
            .trim()
            .toLocaleLowerCase('ru');

        const filtered = groups.filter(group =>
            group.name
                .toLocaleLowerCase('ru')
                .includes(search)
        );

        const container = a$('series');
        container.replaceChildren();

        for (const group of filtered) {
            const item = document.createElement('span');
            item.className = 'ag-series';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked =
                state.analytics.selected.has(group.name);

            input.title =
                `Показать «${group.name}»`;

            input.addEventListener('change', () => {
                if (input.checked) {
                    state.analytics.selected.add(
                        group.name
                    );
                } else {
                    state.analytics.selected.delete(
                        group.name
                    );
                }

                renderAnalytics();
            });

            const label = document.createElement('span');
            label.className = 'ag-series-name';
            label.textContent =
                `${group.name} · ${group.count}`;

            label.title = group.name;

            label.addEventListener('click', () => {
                state.analytics.selected =
                    new Set([group.name]);

                renderAnalytics();
            });

            const only = document.createElement('button');
            only.type = 'button';
            only.className = 'ag-only';
            only.textContent = 'Только';
            only.title =
                `Оставить только «${group.name}»`;

            only.addEventListener('click', () => {
                state.analytics.selected =
                    new Set([group.name]);

                renderAnalytics();
            });

            item.append(input, label, only);
            container.appendChild(item);
        }

        a$('selected-count').textContent =
            `${state.analytics.selected.size} / ${groups.length}`;

        if (!filtered.length) {
            container.textContent =
                'Ничего не найдено.';
        }
    }

    function createSvg(tag, attributes = {}) {
        const node = document.createElementNS(
            'http://www.w3.org/2000/svg',
            tag
        );

        for (const [key, value] of
            Object.entries(attributes)) {
            node.setAttribute(
                key,
                String(value)
            );
        }

        return node;
    }

    function showTooltip(event, text) {
        tooltip.textContent = text;
        tooltip.hidden = false;

        const width = tooltip.offsetWidth;
        const height = tooltip.offsetHeight;

        tooltip.style.left =
            `${Math.min(
                event.clientX + 13,
                window.innerWidth - width - 10
            )}px`;

        tooltip.style.top =
            `${Math.max(
                10,
                Math.min(
                    event.clientY + 13,
                    window.innerHeight -
                        height -
                        10
                )
            )}px`;
    }

    function renderTimelineChart(data) {
        const { names, series } = data;

        const scroll =
            document.createElement('div');

        scroll.className = 'ag-graph-scroll';

        const width = 1120;
        const height = 350;

        const left = 43;
        const top = 20;
        const right = 16;
        const bottom = 43;

        const chartWidth =
            width - left - right;

        const chartHeight =
            height - top - bottom;

        const svg = createSvg('svg', {
            width,
            height,
            viewBox: `0 0 ${width} ${height}`,
            role: 'img',
            'aria-label':
                'Динамика обращений по получасовым интервалам'
        });

        const maximum = Math.max(
            1,
            ...names.flatMap(name =>
                series.get(name)
            )
        );

        for (let step = 0; step <= 4; step++) {
            const y =
                top +
                chartHeight * step / 4;

            svg.appendChild(
                createSvg('line', {
                    x1: left,
                    y1: y,
                    x2: width - right,
                    y2: y,
                    stroke: '#384250',
                    'stroke-width': 1
                })
            );

            const label = createSvg('text', {
                x: left - 7,
                y: y + 4,
                fill: '#a8afba',
                'text-anchor': 'end',
                'font-size': 11
            });

            label.textContent = String(
                Math.round(
                    maximum * (4 - step) / 4
                )
            );

            svg.appendChild(label);
        }

        for (let slot = 0; slot < 48; slot += 4) {
            const label = createSvg('text', {
                x:
                    left +
                    slot / 47 * chartWidth,
                y: height - 12,
                fill: '#a8afba',
                'text-anchor': 'middle',
                'font-size': 11
            });

            label.textContent =
                `${String(slot / 2)
                    .padStart(2, '0')}:00`;

            svg.appendChild(label);
        }

        names.forEach((name, index) => {
            const values = series.get(name);

            const color =
                CHART_COLORS[
                    index % CHART_COLORS.length
                ];

            const points = values.map(
                (count, slot) => {
                    const x =
                        left +
                        slot / 47 *
                            chartWidth;

                    const y =
                        top +
                        chartHeight -
                        count /
                            maximum *
                            chartHeight;

                    return `${x},${y}`;
                }
            ).join(' ');

            const path = createSvg(
                'polyline',
                {
                    points,
                    fill: 'none',
                    stroke: color,
                    'stroke-width': 2.5,
                    'stroke-linecap':
                        'round',
                    'stroke-linejoin':
                        'round'
                }
            );

            svg.appendChild(path);
        });

        const hoverLine = createSvg('line', {
            y1: top,
            y2: top + chartHeight,
            stroke: '#e1b875',
            'stroke-width': 1,
            'stroke-dasharray': '4 4',
            visibility: 'hidden'
        });

        svg.appendChild(hoverLine);

        const hoverArea = createSvg('rect', {
            x: left,
            y: top,
            width: chartWidth,
            height: chartHeight,
            fill: 'transparent'
        });

        hoverArea.addEventListener(
            'pointermove',
            event => {
                const rect =
                    svg.getBoundingClientRect();

                const svgX =
                    (event.clientX -
                        rect.left) *
                    width /
                    rect.width;

                const slot = Math.max(
                    0,
                    Math.min(
                        47,
                        Math.round(
                            (svgX - left) /
                            chartWidth *
                            47
                        )
                    )
                );

                const x =
                    left +
                    slot / 47 *
                        chartWidth;

                hoverLine.setAttribute(
                    'x1',
                    String(x)
                );

                hoverLine.setAttribute(
                    'x2',
                    String(x)
                );

                hoverLine.setAttribute(
                    'visibility',
                    'visible'
                );

                const values = names
                    .map(name => ({
                        name,
                        value:
                            series.get(name)[slot]
                    }))
                    .filter(item =>
                        item.value > 0
                    )
                    .sort(
                        (a, b) =>
                            b.value - a.value
                    );

                const total = names
                    .reduce(
                        (sum, name) =>
                            sum +
                            series.get(name)[slot],
                        0
                    );

                const lines = [
                    intervalLabel(slot),
                    `Всего: ${total}`,
                    ...values
                        .slice(0, 12)
                        .map(item =>
                            `${item.name}: ${item.value}`
                        )
                ];

                if (values.length > 12) {
                    lines.push(
                        `И ещё: ${values.length - 12}`
                    );
                }

                showTooltip(
                    event,
                    lines.join('\n')
                );
            }
        );

        hoverArea.addEventListener(
            'pointerleave',
            () => {
                tooltip.hidden = true;
                hoverLine.setAttribute(
                    'visibility',
                    'hidden'
                );
            }
        );

        svg.appendChild(hoverArea);
        scroll.appendChild(svg);

        const hint =
            document.createElement('p');

        hint.className = 'ag-hint';
        hint.textContent =
            'Наведите на график для значений. ' +
            'Тематики можно переключать выше.';

        a$('content').replaceChildren(
            scroll,
            hint
        );
    }

    function renderSummaryChart(data) {
        const container =
            document.createElement('div');

        container.className = 'ag-bars';

        const rows =
            data.rows.slice(0, 35);

        const maximum =
            rows[0]?.count || 1;

        for (const item of rows) {
            const row =
                document.createElement('div');

            row.className = 'ag-bar';

            const name =
                document.createElement('span');

            name.className =
                'ag-bar-name';

            name.textContent =
                item.name;

            name.title =
                item.name;

            const track =
                document.createElement('div');

            track.className =
                'ag-bar-track';

            const fill =
                document.createElement('div');

            fill.className =
                'ag-bar-fill';

            fill.style.width =
                `${item.count /
                    maximum *
                    100}%`;

            track.appendChild(fill);

            const count =
                document.createElement('b');

            count.textContent =
                String(item.count);

            row.append(
                name,
                track,
                count
            );

            container.appendChild(row);
        }

        if (data.rows.length > rows.length) {
            const note =
                document.createElement('p');

            note.className = 'ag-hint';
            note.textContent =
                'Показаны первые 35 категорий. ' +
                'Полный список доступен в таблице и CSV.';

            container.appendChild(note);
        }

        a$('content').replaceChildren(
            container
        );
    }

    function renderAnalyticsTable(data) {
        const wrap =
            document.createElement('div');

        wrap.className =
            'ag-analytics-table';

        const table =
            document.createElement('table');

        const header =
            table.createTHead().insertRow();

        const timeline =
            state.analytics.mode ===
            'timeline';

        const headings = timeline
            ? [
                'Интервал',
                'Категория',
                'Чатов'
            ]
            : [
                'Категория',
                'Чатов'
            ];

        for (const heading of headings) {
            const th =
                document.createElement('th');

            th.textContent = heading;
            header.appendChild(th);
        }

        const body =
            table.createTBody();

        for (const item of data.rows) {
            const row =
                body.insertRow();

            const values = timeline
                ? [
                    item.interval,
                    item.name,
                    item.count
                ]
                : [
                    item.name,
                    item.count
                ];

            for (const value of values) {
                row.insertCell()
                    .textContent =
                    String(value);
            }
        }

        wrap.appendChild(table);

        a$('content').replaceChildren(
            wrap
        );
    }

    function renderAnalytics() {
        const current =
            state.analytics;

        for (const button of
            analytics.querySelectorAll(
                '[data-group]'
            )) {
            button.setAttribute(
                'aria-pressed',
                String(
                    button.dataset.group ===
                    current.group
                )
            );
        }

        for (const button of
            analytics.querySelectorAll(
                '[data-mode]'
            )) {
            button.setAttribute(
                'aria-pressed',
                String(
                    button.dataset.mode ===
                    current.mode
                )
            );
        }

        for (const button of
            analytics.querySelectorAll(
                '[data-view]'
            )) {
            button.setAttribute(
                'aria-pressed',
                String(
                    button.dataset.view ===
                    current.view
                )
            );
        }

        const data =
            analyticsData();

        renderSeriesControls(
            data.groups
        );

        if (!data.names.length) {
            const empty =
                document.createElement('div');

            empty.className =
                'ag-empty';

            empty.textContent =
                'Выберите хотя бы одну категорию для отображения.';

            a$('content')
                .replaceChildren(empty);

            return;
        }

        if (current.view === 'table') {
            renderAnalyticsTable(
                data
            );
        } else if (
            current.mode === 'timeline'
        ) {
            renderTimelineChart(
                data
            );
        } else {
            renderSummaryChart(
                data
            );
        }
    }

    function csvCell(value) {
        return `"${String(
            value ?? ''
        ).replace(/"/g, '""')}"`;
    }

    function downloadCsv(
        filename,
        headers,
        rows
    ) {
        if (!rows.length) {
            setStatus(
                'Нет данных для экспорта.',
                true
            );

            return;
        }

        const content =
            '\uFEFF' +
            [
                headers
                    .map(csvCell)
                    .join(','),

                ...rows.map(row =>
                    row
                        .map(csvCell)
                        .join(',')
                )
            ].join('\r\n');

        const url =
            URL.createObjectURL(
                new Blob(
                    [content],
                    {
                        type:
                            'text/csv;charset=utf-8'
                    }
                )
            );

        const link =
            document.createElement('a');

        link.href = url;
        link.download = filename;

        document.body.appendChild(
            link
        );

        link.click();
        link.remove();

        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            60_000
        );
    }

    function exportVisible() {
        const records =
            visibleRecords();

        downloadCsv(
            'autofaq_chats.csv',

            [
                ...COLUMNS.map(
                    ([, title]) => title
                ),
                'Тип пользователя',
                'Теги'
            ],

            records.map(record => [
                ...COLUMNS.map(
                    ([field]) =>
                        cellValue(
                            record,
                            field
                        )
                ),
                record.userType,
                record.tags.join('; ')
            ])
        );
    }

    function exportAnalytics() {
        const data =
            analyticsData();

        if (
            state.analytics.mode ===
            'timeline'
        ) {
            downloadCsv(
                `autofaq_${state.analytics.group}_timeline.csv`,

                [
                    'Интервал',
                    'Категория',
                    'Чатов'
                ],

                data.rows.map(
                    item => [
                        item.interval,
                        item.name,
                        item.count
                    ]
                )
            );
        } else {
            downloadCsv(
                `autofaq_${state.analytics.group}_summary.csv`,

                [
                    'Категория',
                    'Чатов'
                ],

                data.rows.map(
                    item => [
                        item.name,
                        item.count
                    ]
                )
            );
        }
    }

    /* ==================== События ==================== */

    app.addEventListener(
        'change',
        event => {
            const input =
                event.target;

            if (!input.matches(
                'input[name="priority"],' +
                'input[name="department"],' +
                'input[name="user-type"]'
            )) {
                return;
            }

            const group = [
                ...app.querySelectorAll(
                    `input[name="${input.name}"]`
                )
            ];

            const any =
                group.find(item =>
                    item.value === 'Any'
                );

            if (
                input.checked &&
                input.value === 'Any'
            ) {
                group.forEach(item => {
                    if (item !== input) {
                        item.checked = false;
                    }
                });
            } else if (
                input.checked
            ) {
                any.checked = false;
            }

            if (!group.some(
                item => item.checked
            )) {
                any.checked = true;
            }
        }
    );

    action('close').addEventListener(
        'click',
        () => {
            windowElement.style.display =
                'none';

            analytics.hidden = true;
            popover.hidden = true;
            tooltip.hidden = true;
        }
    );

    action('previous').addEventListener(
        'click',
        () => {
            $('from').value = shiftDate(
                $('from').value,
                -1
            );

            $('to').value = shiftDate(
                $('to').value,
                -1
            );
        }
    );

    action('next').addEventListener(
        'click',
        () => {
            $('from').value = shiftDate(
                $('from').value,
                1
            );

            $('to').value = shiftDate(
                $('to').value,
                1
            );
        }
    );

    action('toggle-operators')
        .addEventListener(
            'click',
            () => {
                const inputs = [
                    ...$('operators')
                        .querySelectorAll(
                            'input'
                        )
                ];

                const choose =
                    inputs.some(
                        input =>
                            !input.checked
                    );

                inputs.forEach(
                    input =>
                        input.checked =
                            choose
                );
            }
        );

    action('search')
        .addEventListener(
            'click',
            runSearch
        );

    action('export')
        .addEventListener(
            'click',
            exportVisible
        );

    action('analytics')
        .addEventListener(
            'click',
            () => {
                analytics.hidden =
                    !analytics.hidden;

                if (!analytics.hidden) {
                    renderAnalytics();
                }
            }
        );

    analytics.addEventListener(
        'click',
        event => {
            const control =
                event.target.closest(
                    'button'
                );

            if (!control) return;

            const special =
                control.dataset.aAction;

            if (special === 'close') {
                analytics.hidden = true;
                tooltip.hidden = true;
                return;
            }

            if (special === 'export') {
                exportAnalytics();
                return;
            }

            if (
                special ===
                'select-all'
            ) {
                state.analytics.selected =
                    new Set(
                        availableGroups()
                            .map(group =>
                                group.name
                            )
                    );

                renderAnalytics();
                return;
            }

            if (special === 'clear') {
                state.analytics.selected
                    .clear();

                renderAnalytics();
                return;
            }

            if (
                control.dataset.group
            ) {
                state.analytics.group =
                    control.dataset.group;

                state.analytics.initializedFor =
                    '';
            }

            if (
                control.dataset.mode
            ) {
                state.analytics.mode =
                    control.dataset.mode;
            }

            if (
                control.dataset.view
            ) {
                state.analytics.view =
                    control.dataset.view;
            }

            renderAnalytics();
        }
    );

    a$('series-search')
        .addEventListener(
            'input',
            () => {
                renderSeriesControls(
                    availableGroups()
                );
            }
        );

    document.addEventListener(
        'pointerdown',
        event => {
            if (
                !popover.hidden &&
                !popover.contains(
                    event.target
                ) &&
                !event.target.closest(
                    '#AF_Grabber th'
                )
            ) {
                popover.hidden = true;
            }
        }
    );

    document.addEventListener(
        'keydown',
        event => {
            if (
                event.key ===
                'Escape'
            ) {
                popover.hidden = true;
                tooltip.hidden = true;
            }
        }
    );

    /* Перетаскивается только окно аналитики. */
    const handle =
        analytics.querySelector(
            '.ag-analytics-head'
        );

    let drag = null;

    handle.addEventListener(
        'pointerdown',
        event => {
            if (
                event.target.closest(
                    'button'
                )
            ) {
                return;
            }

            const rect =
                analytics
                    .getBoundingClientRect();

            drag = {
                id: event.pointerId,
                x:
                    event.clientX -
                    rect.left,
                y:
                    event.clientY -
                    rect.top
            };

            handle.setPointerCapture(
                event.pointerId
            );

            event.stopPropagation();
        }
    );

    handle.addEventListener(
        'pointermove',
        event => {
            if (
                !drag ||
                drag.id !==
                    event.pointerId
            ) {
                return;
            }

            const x = Math.max(
                0,
                Math.min(
                    event.clientX -
                        drag.x,
                    window.innerWidth -
                        analytics.offsetWidth
                )
            );

            const y = Math.max(
                0,
                Math.min(
                    event.clientY -
                        drag.y,
                    window.innerHeight -
                        55
                )
            );

            analytics.style.left =
                `${x}px`;

            analytics.style.top =
                `${y}px`;

            event.stopPropagation();
        }
    );

    handle.addEventListener(
        'pointerup',
        () => drag = null
    );

    handle.addEventListener(
        'pointercancel',
        () => drag = null
    );

    initialize();

    function updateThemeLabel() {
        const values = selected($('theme-list'));

        if (values.includes('parseallthemes')) {
            $('theme-label').textContent = 'Все тематики';
            return;
        }

        if (values.length === 1) {
            $('theme-label').textContent =
                values[0] === 'parsenothemes'
                    ? 'Без тематики'
                    : themeNames.get(values[0]) ?? 'Выбрана тематика';
            return;
        }

        $('theme-label').textContent =
            `Выбрано тематик: ${values.length}`;
    }

    $('theme-list').addEventListener('change', event => {
        const changed = event.target;

        if (!changed.matches('input[name="theme"]')) {
            return;
        }

        const all = $('theme-list').querySelector(
            'input[value="parseallthemes"]'
        );

        if (changed.value === 'parseallthemes' && changed.checked) {
            $('theme-list')
                .querySelectorAll('input[name="theme"]')
                .forEach(input => {
                    if (input !== all) input.checked = false;
                });
        } else if (changed.checked) {
            all.checked = false;
        }

        // Если пользователь снял все галочки — возвращаем «Все тематики».
        if (!selected($('theme-list')).length) {
            all.checked = true;
        }

        updateThemeLabel();
    });

    updateThemeLabel();

    /*
     * Существующая внешняя кнопка может продолжать
     * вызывать getopenGrabberButtonPress().
     */
    window.getopenGrabberButtonPress =
        function () {
            const isVisible =
                getComputedStyle(
                    windowElement
                ).display !== 'none';

            windowElement.style.display =
                isVisible
                    ? 'none'
                    : '';

            if (isVisible) {
                analytics.hidden = true;
                popover.hidden = true;
                tooltip.hidden = true;
                return;
            }

            if (
                !state.operators.length
            ) {
                loadOperators();
            }
        };
})();