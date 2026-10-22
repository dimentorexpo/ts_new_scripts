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
        operatorsLoadedAt: 0,

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
/* ============================================================
   AF Grabber — Visual Style: Corporate Graphite Dark (Queue.js style)
   ============================================================ */

#AF_Grabber .ag,
#ag-analytics,
#ag-column-popover {
    --ag-bg: #111827;
    --ag-panel: #182335;
    --ag-panel-2: #1b283c;
    --ag-border: #344258;
    --ag-border-focus: #3a4961;
    --ag-text: #edf2fb;
    --ag-muted: #a6b4cb;
    --ag-accent: #829fff;
    --ag-accent-2: #a9c0ff;
    --ag-error: #ffb0be;

    box-sizing: border-box;
    color: var(--ag-text);
    font: 12px/1.45 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, -apple-system, sans-serif;
    color-scheme: dark;
}

#AF_Grabber .ag *,
#ag-analytics *,
#ag-column-popover * {
    box-sizing: border-box;
}

#AF_Grabber .ag {
    width: min(780px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    overflow-y: auto;
    overflow-x: hidden;
    padding: 18px !important;
    color: #edf2fb;
    background:
        radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
        #111827 !important;
    border: 1px solid #344258 !important;
    border-radius: 18px !important;
    box-shadow:
        0 26px 70px rgba(3, 9, 22, .52),
        inset 0 1px rgba(255, 255, 255, .06) !important;
    position: relative;
    z-index: 1000003;
}

#AF_Grabber .ag button,
#AF_Grabber .ag input,
#AF_Grabber .ag select,
#ag-analytics button,
#ag-column-popover button {
    font-family: inherit;
}

/* Кнопки в стиле Queue.js (.qg5-btn) */
#AF_Grabber .ag button,
#ag-analytics button,
#ag-column-popover button {
    min-height: 36px;
    padding: 8px 14px;
    color: #dce5f5;
    background: #1b283c;
    border: 1px solid #3c4d68;
    border-radius: 9px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color .16s ease, border-color .16s ease, transform .16s ease, box-shadow .16s ease;
}

#AF_Grabber .ag button:hover:not(:disabled),
#ag-analytics button:hover:not(:disabled),
#ag-column-popover button:hover:not(:disabled) {
    color: #fff;
    background: #293b56;
    border-color: #7799e2;
    transform: translateY(-1px);
}

#AF_Grabber .ag button:disabled,
#ag-analytics button:disabled {
    opacity: .5;
    cursor: not-allowed;
    transform: none;
}

/* Основная акцентная кнопка (аналог #qg5-manual-refresh) */
#AF_Grabber .ag .ag-primary {
    color: #eef3ff !important;
    background: #4268c9 !important;
    border-color: #7293ed !important;
    box-shadow: 0 5px 15px rgba(58, 96, 205, .22) !important;
    font-weight: 600;
}

#AF_Grabber .ag .ag-primary:hover:not(:disabled) {
    background: #547ce1 !important;
    border-color: #a2b9fa !important;
    box-shadow: 0 6px 19px rgba(58, 96, 205, .3) !important;
    color: #fff !important;
    transform: translateY(-1px);
}

/* Кнопка закрытия (аналог #qg5-hide) */
#AF_Grabber [data-action="close"],
#ag-analytics [data-a-action="close"] {
    background: rgba(255, 116, 140, .08) !important;
    border-color: rgba(255, 116, 140, .3) !important;
    color: #ffb0be !important;
    padding: 8px 12px !important;
    min-height: 36px;
    border-radius: 9px;
    font-weight: 600;
}

#AF_Grabber [data-action="close"]:hover,
#ag-analytics [data-a-action="close"]:hover {
    background: rgba(255, 116, 140, .16) !important;
    border-color: rgba(255, 116, 140, .5) !important;
    color: #fff !important;
    transform: translateY(-1px);
}

/* Поля ввода (аналог .qg5-input) */
#AF_Grabber .ag input[type="date"],
#AF_Grabber .ag input[type="search"],
#AF_Grabber .ag select,
#ag-analytics input[type="search"] {
    min-height: 36px;
    height: 36px;
    color: #edf2fb;
    background: #0d1625;
    border: 1px solid #3a4961;
    border-radius: 9px;
    padding: 0 10px;
    outline: none;
    font-size: 13px;
    transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
}

#AF_Grabber .ag input[type="date"]:hover,
#AF_Grabber .ag input[type="search"]:hover,
#AF_Grabber .ag select:hover,
#ag-analytics input[type="search"]:hover {
    background: #142034;
    border-color: #657caa;
}

#AF_Grabber .ag input[type="date"]:focus,
#AF_Grabber .ag input[type="search"]:focus,
#AF_Grabber .ag select:focus,
#ag-analytics input[type="search"]:focus {
    background: #142034;
    border-color: #829fff;
    box-shadow: 0 0 0 3px rgba(110, 152, 247, .16);
}

#AF_Grabber .ag select option {
    background: #111827;
    color: #edf2fb;
}

#AF_Grabber .ag :focus-visible,
#ag-analytics :focus-visible,
#ag-column-popover :focus-visible {
    outline: 2px solid var(--ag-accent);
    outline-offset: 2px;
}

/* Шапка окна (аналог .qg5-header) */
#AF_Grabber .ag-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
    padding-bottom: 14px;
    border-bottom: 1px solid #344258;
    cursor: move;
}

#AF_Grabber .ag-title {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

#AF_Grabber .ag-mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    flex: 0 0 36px;
    border: 1px solid #364660;
    border-radius: 10px;
    background: #182335;
    color: #a9c0ff;
    font-size: 14px;
    font-weight: 700;
}

#AF_Grabber .ag-head h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -.01em;
}

#AF_Grabber .ag-caption {
    color: #a6b4cb;
    font-size: 11px;
}

#AF_Grabber .ag-row,
#AF_Grabber .ag-period,
#AF_Grabber .ag-result-head,
#ag-analytics .ag-analytics-head,
#ag-analytics .ag-analytics-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

#AF_Grabber .ag-controls {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
}

#AF_Grabber .ag-period {
    flex-wrap: wrap;
    gap: 8px;
}

#AF_Grabber .ag-period input[type="date"] {
    width: 135px;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 12px;
}

#AF_Grabber .ag-period .ag-caption {
    white-space: nowrap;
    font-weight: 600;
    color: #8e96b8;
}

#AF_Grabber .ag-theme-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 8px;
    margin-top: 10px;
}

#AF_Grabber .ag-theme-row .ag-theme-dropdown {
    width: 100%;
    min-width: 0;
}

#AF_Grabber .ag-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 14px 0;
}

/* Блоки details / фильтры */
#AF_Grabber .ag details {
    border: 1px solid #344258;
    border-radius: 10px;
    background: #182335;
    transition: border-color .16s ease;
}

#AF_Grabber .ag details:hover {
    border-color: #435b80;
}

#AF_Grabber .ag details[open] {
    flex: 1 1 100%;
    order: 1;
    border-color: #435b80;
}

#AF_Grabber .ag summary {
    padding: 8px 12px;
    color: #b6c9f5;
    font-weight: 600;
    font-size: 12px;
    cursor: pointer;
    user-select: none;
    transition: color .15s;
}

#AF_Grabber .ag summary:hover {
    color: #fff;
}

#AF_Grabber .ag-detail-body {
    padding: 12px;
    border-top: 1px solid #344258;
    background: #0d1625;
    border-bottom-left-radius: 9px;
    border-bottom-right-radius: 9px;
}

#AF_Grabber .ag-checkgrid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 4px;
    max-height: 160px;
    overflow: auto;
}

#AF_Grabber .ag-check {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    padding: 5px 8px;
    border: 1px solid transparent;
    border-radius: 7px;
    cursor: pointer;
    color: #dce5f5;
    font-size: 12px;
    transition: background-color .15s ease, border-color .15s ease;
}

#AF_Grabber .ag-check:hover {
    background: #1e2c40;
    border-color: #3b4e6d;
}

#AF_Grabber .ag-check input {
    flex: 0 0 auto;
    margin: 0;
    accent-color: #7293ed;
    width: 14px;
    height: 14px;
    cursor: pointer;
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
    margin-top: 10px;
}

#AF_Grabber .ag-search-columns input {
    width: 100%;
}

#AF_Grabber .ag-filter-section {
    padding: 10px;
    border: 1px solid #344258;
    border-radius: 9px;
    background: #151e2d;
}

#AF_Grabber .ag-filter-section strong {
    display: block;
    margin-bottom: 6px;
    color: #a9c0ff;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .04em;
    font-weight: 700;
}

/* Статус и прогресс-бар */
#AF_Grabber .ag-status {
    min-height: 18px;
    margin: 6px 0;
    color: #a6b4cb;
    font-size: 12px;
    font-weight: 500;
}

#AF_Grabber .ag-status[data-error="true"] {
    color: #ffb0be;
}

#AF_Grabber .ag-progress {
    height: 5px;
    overflow: hidden;
    border-radius: 6px;
    background: #1e293b;
    margin: 8px 0;
}

#AF_Grabber .ag-progress > span {
    display: block;
    width: 0;
    height: 100%;
    background: linear-gradient(90deg, #4268c9, #7293ed);
    border-radius: inherit;
    transition: width .2s ease;
}

#AF_Grabber .ag-result-head {
    justify-content: space-between;
    flex-wrap: wrap;
    margin: 14px 0 10px;
    gap: 10px;
}

/* Метрики (аналог .qg5-stats) */
#AF_Grabber .ag-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
}

#AF_Grabber .ag-metric {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    padding: 7px 12px;
    color: #a6b4cb;
    background: #182335;
    border: 1px solid #364660;
    border-radius: 10px;
    letter-spacing: .03em;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
}

#AF_Grabber .ag-metric b {
    color: #a9c0ff;
    font-family: 'JetBrains Mono', 'SF Mono', monospace;
    font-size: 12px;
    font-weight: 700;
}

/* Таблица в стиле Queue.js */
#AF_Grabber .ag-table-wrap,
#ag-analytics .ag-analytics-table {
    max-height: min(48vh, 460px);
    overflow: auto;
    border: 1px solid #344258;
    border-radius: 12px;
    background: #0d1625;
}

#AF_Grabber .ag table,
#ag-analytics table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 12px;
}

#AF_Grabber .ag th,
#ag-analytics th {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 9px 10px;
    border-bottom: 1px solid #344258;
    background: #182335;
    color: #a9c0ff;
    font-weight: 700;
    text-align: left;
    white-space: nowrap;
}

#AF_Grabber .ag td,
#ag-analytics td {
    max-width: 230px;
    padding: 8px 10px;
    border-bottom: 1px solid #233044;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #edf2fb;
}

#AF_Grabber .ag tbody tr {
    cursor: pointer;
    background: #111827;
    transition: background-color .15s ease;
}

#AF_Grabber .ag tbody tr:nth-child(even) {
    background: #141d2d;
}

#AF_Grabber .ag tbody tr:hover td {
    background: #23334b;
    color: #fff;
}

#AF_Grabber .ag-empty {
    padding: 28px;
    color: var(--ag-muted);
    text-align: center;
    font-size: 13px;
}

/* Выпадающие списки и поповеры колонок */
#ag-column-popover {
    position: fixed;
    z-index: 2147483002;
    width: min(300px, calc(100vw - 20px));
    max-height: 380px;
    overflow: auto;
    padding: 14px;
    border: 1px solid #3c4d68;
    border-radius: 14px;
    background: #111827;
    box-shadow: 0 20px 60px rgba(0, 0, 0, .6);
    color: #edf2fb;
}

#ag-column-popover[hidden],
#ag-analytics[hidden],
#ag-tooltip[hidden] {
    display: none !important;
}

#ag-column-popover .ag-popover-list {
    max-height: 240px;
    overflow: auto;
    margin-top: 8px;
}

#ag-column-popover label {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px 6px;
    border-radius: 6px;
    cursor: pointer;
    overflow-wrap: anywhere;
    transition: background-color .15s;
}

#ag-column-popover label:hover {
    background: #1e2c40;
}

#ag-column-popover input {
    accent-color: #7293ed;
    width: 14px;
    height: 14px;
}

/* Стили выпадающего списка тематик */
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
    min-height: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: #0d1625;
    border: 1px solid #3a4961;
    border-radius: 9px;
    color: #edf2fb;
    font-size: 13px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#AF_Grabber .ag .ag-theme-row .ag-theme-dropdown > summary:hover {
    background: #142034;
    border-color: #657caa;
}

#AF_Grabber .ag .ag-theme-menu {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    z-index: 30;
    width: min(420px, calc(100vw - 45px));
    max-height: 340px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #3c4d68;
    border-radius: 12px;
    background: #111827;
    box-shadow: 0 18px 50px rgba(0, 0, 0, .6);
}

#AF_Grabber .ag .ag-theme-group {
    padding: 8px 6px 4px;
    color: #a9c0ff;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .03em;
}

#AF_Grabber .ag .ag-theme-group:not(:first-child) {
    margin-top: 6px;
    border-top: 1px solid #344258;
}

#AF_Grabber .ag .ag-theme-menu .ag-check {
    padding: 5px 8px;
}

/* Окно аналитики */
#ag-analytics {
    position: fixed;
    top: 45px;
    left: max(12px, calc((100vw - 980px) / 2));
    z-index: 2147483000;
    width: min(980px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    overflow: hidden;
    border: 1px solid #344258;
    border-radius: 18px;
    background:
        radial-gradient(circle at 95% 0%, rgba(105, 137, 238, .13), transparent 40%),
        #111827;
    box-shadow:
        0 26px 70px rgba(3, 9, 22, .52),
        inset 0 1px rgba(255, 255, 255, .06);
}

#ag-analytics .ag-analytics-head {
    justify-content: space-between;
    padding: 14px 18px;
    border-bottom: 1px solid #344258;
    cursor: grab;
    touch-action: none;
}

#ag-analytics .ag-analytics-head strong {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
}

#ag-analytics .ag-analytics-body {
    max-height: calc(100vh - 90px);
    overflow: auto;
    padding: 16px;
}

#ag-analytics .ag-analytics-controls {
    flex-wrap: wrap;
    margin-bottom: 12px;
    gap: 8px;
}

#ag-analytics button[aria-pressed="true"] {
    background: #2b4372;
    border-color: #7093e6;
    box-shadow: 0 0 8px rgba(112, 147, 230, 0.35);
    color: #fff;
}

#ag-analytics .ag-series-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 12px 0;
}

#ag-analytics .ag-series-toolbar input {
    flex: 1 1 180px;
    max-width: 260px;
}

#ag-analytics .ag-series-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 110px;
    overflow: auto;
    padding: 2px 0 8px;
}

#ag-analytics .ag-series {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 300px;
    padding: 5px 8px;
    border: 1px solid #344258;
    border-radius: 8px;
    background: #182335;
    color: var(--ag-text);
}

#ag-analytics .ag-series input {
    margin: 0;
    accent-color: #7293ed;
}

#ag-analytics .ag-series-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    font-size: 12px;
}

#ag-analytics .ag-series .ag-only {
    min-height: 0;
    padding: 2px 5px;
    border: 1px solid #3a4961;
    border-radius: 5px;
    background: #111827;
    color: var(--ag-muted);
    font-size: 10px;
}

#ag-analytics .ag-series .ag-only:hover {
    color: #fff;
    border-color: #657caa;
}

#ag-analytics .ag-graph-scroll {
    overflow-x: auto;
    border: 1px solid #344258;
    border-radius: 12px;
    background: #0d1625;
}

#ag-analytics svg {
    display: block;
}

#ag-analytics .ag-bars {
    display: grid;
    gap: 8px;
    padding: 14px;
}

#ag-analytics .ag-bar {
    display: grid;
    grid-template-columns: minmax(100px, 230px) 1fr 40px;
    align-items: center;
    gap: 10px;
}

#ag-analytics .ag-bar-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12px;
}

#ag-analytics .ag-bar-track {
    height: 12px;
    border-radius: 9px;
    background: #1e293b;
    border: 1px solid #344258;
}

#ag-analytics .ag-bar-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #4268c9, #7293ed);
}

#ag-analytics .ag-hint {
    margin: 10px 0 0;
    color: var(--ag-muted);
    font-size: 11px;
}

#ag-tooltip {
    position: fixed;
    z-index: 2147483001;
    max-width: min(330px, calc(100vw - 20px));
    padding: 9px 12px;
    border: 1px solid #3c4d68;
    border-radius: 10px;
    background: #182335;
    box-shadow: 0 14px 40px rgba(0, 0, 0, .5);
    color: #edf2fb;
    font: 11px/1.5 'Inter', system-ui, sans-serif;
    pointer-events: none;
    white-space: pre-line;
}

/* Скроллбары в стиле Queue.js */
#AF_Grabber .ag::-webkit-scrollbar,
#AF_Grabber .ag-table-wrap::-webkit-scrollbar,
#AF_Grabber .ag-checkgrid::-webkit-scrollbar,
#AF_Grabber .ag .ag-theme-menu::-webkit-scrollbar,
#ag-column-popover::-webkit-scrollbar,
#ag-column-popover .ag-popover-list::-webkit-scrollbar,
#ag-analytics .ag-analytics-body::-webkit-scrollbar,
#ag-analytics .ag-analytics-table::-webkit-scrollbar,
#ag-analytics .ag-series-list::-webkit-scrollbar,
#ag-analytics .ag-graph-scroll::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

#AF_Grabber .ag::-webkit-scrollbar-track,
#AF_Grabber .ag-table-wrap::-webkit-scrollbar-track,
#AF_Grabber .ag-checkgrid::-webkit-scrollbar-track,
#AF_Grabber .ag .ag-theme-menu::-webkit-scrollbar-track,
#ag-column-popover::-webkit-scrollbar-track,
#ag-column-popover .ag-popover-list::-webkit-scrollbar-track,
#ag-analytics .ag-analytics-body::-webkit-scrollbar-track,
#ag-analytics .ag-analytics-table::-webkit-scrollbar-track,
#ag-analytics .ag-series-list::-webkit-scrollbar-track,
#ag-analytics .ag-graph-scroll::-webkit-scrollbar-track {
    background: transparent;
}

#AF_Grabber .ag::-webkit-scrollbar-thumb,
#AF_Grabber .ag-table-wrap::-webkit-scrollbar-thumb,
#AF_Grabber .ag-checkgrid::-webkit-scrollbar-thumb,
#AF_Grabber .ag .ag-theme-menu::-webkit-scrollbar-thumb,
#ag-column-popover::-webkit-scrollbar-thumb,
#ag-column-popover .ag-popover-list::-webkit-scrollbar-thumb,
#ag-analytics .ag-analytics-body::-webkit-scrollbar-thumb,
#ag-analytics .ag-analytics-table::-webkit-scrollbar-thumb,
#ag-analytics .ag-series-list::-webkit-scrollbar-thumb,
#ag-analytics .ag-graph-scroll::-webkit-scrollbar-thumb {
    background: #536a8e;
    border-radius: 4px;
}

#AF_Grabber .ag,
#AF_Grabber .ag-table-wrap,
#AF_Grabber .ag-checkgrid,
#AF_Grabber .ag .ag-theme-menu,
#ag-column-popover,
#ag-column-popover .ag-popover-list,
#ag-analytics .ag-analytics-body,
#ag-analytics .ag-analytics-table,
#ag-analytics .ag-series-list,
#ag-analytics .ag-graph-scroll {
    scrollbar-width: thin;
    scrollbar-color: #536a8e transparent;
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
</style>

<div class="ag">
    <div class="ag-head chmaf-drag-handle">
        <div class="ag-title">
            <div class="ag-mark">📊</div>
            <div>
                <h2>Аналитика обращений</h2>
                <div class="ag-caption">Чаты · фильтры · динамика</div>
            </div>
        </div>
        <button type="button" class="buttonHide" data-action="close" title="Закрыть">❌</button>
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
                <div style="color:#a6b4cb;font-size:11px">
                    Выбирайте одну или несколько линий
                </div>
            </div>
            <button type="button" class="buttonHide" data-a-action="close" title="Закрыть">❌</button>
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
                      style="color:#a6b4cb"></span>
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
        ['afrt', 'AFRT'],
        ['queue', 'Очередь'],
        ['autoClose', 'Автозакрытие'],
        ['department', 'Отдел'],
        ['text', 'Комментарий / сообщение']
    ];

    const CHART_COLORS = [
        '#829fff',
        '#75c3db',
        '#b49ae7',
        '#8ccf9e',
        '#e8999b',
        '#617fbd',
        '#a9c0ff',
        '#d696cf',
        '#98c4be',
        '#c8d6f4'
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
        // Сохраняем выбор: при обновлении списка снятые галочки остаются снятыми
        const previouslyUnchecked = new Set(
            [...$('operators').querySelectorAll('input:not(:checked)')].map(input => input.value)
        );

        $('operators').textContent = 'Загрузка…';
        action('search').disabled = true;

        try {
            const data = await apiJson(
                `${API}/operators/statistic/currentState`
            );

            const entries = data?.onOperator ?? [];
            const TARGET_GROUP_ID = 'c7bbb211-a217-4ed3-8112-98728dc382d8';
            // Проверяем, что имя начинается строго с "ТП-" или "ТП ОС-" (без учета регистра)
            const PREFIX_REGEX = /^(?:ТП-|ТП ОС-)/i;

            // Подробный разбор фильтрации — только в режиме отладки
            const debug = (() => { try { return localStorage.getItem('chmafDebug') === '1'; } catch { return false; } })();
            if (debug) {
                console.group('🔍 [AF Grabber] Анализ операторов и фильтрация');
                console.log(`Всего записей в ответе API: ${entries.length}`);
            }

            const tableLog = [];
            const unique = new Map();

            for (const entry of entries) {
                const operator = entry.operator;
                const name = String(operator?.fullName ?? '').trim();
                const id = operator?.id ? String(operator.id) : null;
                const groupId = entry.groupId;

                const matchGroup = groupId === TARGET_GROUP_ID;
                const matchPrefix = PREFIX_REGEX.test(name);
                const isPassed = matchGroup && matchPrefix && Boolean(id);

                // Собираем данные для наглядной таблицы в консоли
                let rejectReason = 'OK';
                if (!matchGroup) rejectReason = 'Чужой groupId';
                else if (!matchPrefix) rejectReason = 'Нет префикса ТП- / ТП ОС- (Sales/Prem/без префикса)';
                else if (!id) rejectReason = 'Нет ID';

                tableLog.push({
                    'Имя': name || '—',
                    'groupId': groupId || '—',
                    'Статус': isPassed ? '✅ Прошел' : '❌ Отсеян',
                    'Причина отсева': rejectReason
                });

                if (!isPassed) {
                    continue;
                }

                unique.set(id, {
                    id,
                    name
                });
            }

            state.operators = [...unique.values()].sort(
                (a, b) => a.name.localeCompare(b.name, 'ru')
            );
            state.operatorsLoadedAt = Date.now();

            if (debug) {
                console.table(tableLog);
                console.log(`✅ Итого допущено операторов: ${state.operators.length}`, state.operators);
                console.groupEnd();
            }

            $('operators').replaceChildren(
                ...state.operators.map(operator =>
                    checkbox(
                        operator.id,
                        operator.name,
                        'operator',
                        !previouslyUnchecked.has(operator.id)
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
                .toLocaleLowerCase('ru'),
            // Сняты ли какие-то оценки (по умолчанию выбраны все 6 вариантов)
            marksNarrowed: selected($('marks')).length < $('marks').querySelectorAll('input').length
        };
    }

    /**
     * Фильтры, которые нельзя проверить у переведённого чата (оценка, комментарий
     * оператора, критичность, отдел, текст, теги, тип пользователя). Если хоть один
     * задан, переведённые чаты в выборку не попадают: раньше они показывались
     * при любых фильтрах и «засоряли» результат строками без оценки.
     */
    function hasNarrowingFilters(filters) {
        return filters.marksNarrowed ||
            Boolean(filters.comment) ||
            Boolean(filters.message) ||
            filters.tags.size > 0 ||
            !filters.priorities.includes('Any') ||
            !filters.departments.includes('Any') ||
            !filters.userTypes.includes('Any');
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
                if (!item.conversationId) {
                    continue;
                }

                const isClosedByOperator = String(item.operatorId) === operator.id;
                const rate = parseRate(item);
                const rateKey = rate === null
                    ? 'none'
                    : String(rate);

                // Если чат закрыт нашим оператором — проверяем фильтр оценок.
                // Если чат переведен — берем его всегда для проверки AFRT (оценку все равно скроем).
                if (isClosedByOperator && !filters.marks.has(rateKey)) {
                    continue;
                }

                const duration = Number(item.stats?.conversationDuration);

                chats.push({
                    id: String(item.conversationId),
                    operator: operator.name,
                    rate: isClosedByOperator ? rate : null,
                    isClosedByOperator,
                    // Длительность из истории — та же, по которой считает «Статистика»
                    duration: Number.isFinite(duration) ? duration : null
                });
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

    function isQueueAutoReply(msg) {
        if (!msg) return false;
        const txt = String(msg.txt ?? msg.text ?? '').toLowerCase();
        const hasApology = txt.includes('приносим извинения за ожидание');
        const hasBusy = txt.includes('специалисты заняты') || txt.includes('в первую очередь');

        if (msg.tpe === 'AnswerSystem' && (hasApology || hasBusy)) {
            return true;
        }
        return hasApology && hasBusy;
    }

    function calculateAFRT(messages) {
        if (!Array.isArray(messages) || !messages.length) {
            return { afrt: null, queue: false };
        }

        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.tpe !== 'Question') {
            return { afrt: null, queue: false };
        }

        const firstMessageTime = lastMsg.ts;
        let groupFoundIndex = -1;

        for (let z = messages.length - 1; z >= 0; z--) {
            if (
                messages[z].payload?.prevGroup === undefined &&
                messages[z].payload?.group === 'c7bbb211-a217-4ed3-8112-98728dc382d8'
            ) {
                groupFoundIndex = z;
                break;
            }
        }

        let afrt = null;

        if (groupFoundIndex !== -1) {
            for (let b = groupFoundIndex; b >= 0; b--) {
                const m = messages[b];
                if (['AnswerOperatorWithBot', 'AnswerOperator'].includes(m.tpe)) {
                    const diff = (new Date(m.ts) - new Date(firstMessageTime)) / 1000;
                    afrt = diff > 60 ? 0 : 1;
                    break;
                }
            }
        }

        if (afrt === null) {
            return { afrt: null, queue: false };
        }

        let queue = false;

        // «Очередь» проверяется и может быть выставлена только при AFRT == 0
        if (afrt === 0) {
            let queueMsgIndex = -1;

            // Ищем автоотбивку очереди (начиная с первых сообщений)
            for (let i = messages.length - 1; i >= 0; i--) {
                if (isQueueAutoReply(messages[i])) {
                    queueMsgIndex = i;
                    break;
                }
            }

            if (queueMsgIndex !== -1) {
                const queueTime = new Date(messages[queueMsgIndex].ts).getTime();

                let assignMsg = null;
                let firstOperatorMsg = null;

                // Двигаемся хронологически вперед от момента автоотбивки (индекс уменьшается)
                for (let i = queueMsgIndex - 1; i >= 0; i--) {
                    const m = messages[i];
                    if (
                        !assignMsg &&
                        m.eventTpe === 'AssignToOperator' &&
                        m.payload?.oid &&
                        m.payload.oid !== 'null'
                    ) {
                        assignMsg = m;
                    }
                    if (
                        !firstOperatorMsg &&
                        ['AnswerOperatorWithBot', 'AnswerOperator'].includes(m.tpe)
                    ) {
                        firstOperatorMsg = m;
                    }
                    if (assignMsg && firstOperatorMsg) {
                        break;
                    }
                }

                // Приоритет — время назначения на оператора, запасной вариант — первый ответ оператора
                const targetAssign = assignMsg ?? firstOperatorMsg;

                if (targetAssign) {
                    const assignTime = new Date(targetAssign.ts).getTime();
                    if (Number.isFinite(queueTime) && Number.isFinite(assignTime)) {
                        const diffSec = (assignTime - queueTime) / 1000;
                        if (diffSec > 60) {
                            queue = true;
                        }
                    }
                }
            }
        }

        return { afrt, queue };
    }

    /*
     * Автозакрытие чата:
     *  - 'inactivity' — CloseConversation с payload.src === 'inactivity_timer'
     *  - 'pause'      — CloseConversation с payload.src === 'pause' (после отложенного)
     */
    function detectAutoClose(messages) {
        if (!Array.isArray(messages)) return null;

        for (const m of messages) {
            const ev = m?.eventTpe ?? m?.eventType;
            if (ev !== 'CloseConversation') continue;

            const src = m?.payload?.src;
            if (src === 'inactivity_timer') return 'inactivity';
            if (src === 'pause') return 'pause';
        }

        return null;
    }

    async function loadChat(chat, filters) {
        const data = await apiJson(
            `${API}/conversations/${encodeURIComponent(chat.id)}`
        );

        const messages = Array.isArray(data.messages)
            ? data.messages
            : [];

        const { afrt, queue } = calculateAFRT(messages);
        const autoClose = detectAutoClose(messages);

        // Если чат был переведен (закрыт не этим оператором):
        if (!chat.isClosedByOperator) {
            // Если в нем нет AFRT — он нам вообще не нужен
            if (afrt === null) {
                return null;
            }

            if (hasNarrowingFilters(filters)) {
                return null;
            }

            const topicId = data.payload?.topicId?.value;

            // Тематику у переведённого чата проверить можно — проверяем
            if (!themeMatches(topicId, filters.themes)) {
                return null;
            }
            const timestamp = new Date(data.tsCreate).getTime();

            // Возвращаем запись ТОЛЬКО с данными для AFRT (CSAT, SLA и текст обнулены)
            return {
                id: String(data.id ?? chat.id),
                timestamp: Number.isFinite(timestamp) ? timestamp : null,
                slot: Number.isFinite(timestamp) ? timeSlot(timestamp) : null,
                date: Number.isFinite(timestamp) ? formatMoscow(timestamp) : '—',
                operator: chat.operator,
                csat: null,
                theme: topicId
                    ? themeNames.get(String(topicId)) ?? 'Неизвестная тематика'
                    : 'Без тематики',
                sla: null,
                afrt,
                queue,
                autoClose,
                country: String(data.channelUser?.payload?.country ?? '—'),
                department: '—',
                userType: String(data.channelUser?.payload?.userType ?? 'null'),
                tags: [],
                text: ''
            };
        }

        // --- Стандартная логика для чатов, закрытых самим оператором ---
        const topicId = data.payload?.topicId?.value;

        if (!themeMatches(topicId, filters.themes)) {
            return null;
        }

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

        // SLA считаем по длительности разговора из истории (как в «Статистике»).
        // tsMod — время ПОСЛЕДНЕГО изменения чата: оно сдвигается, когда после
        // закрытия приходит оценка или меняются теги, и SLA ложно становился «Нет».
        // tsMod остаётся запасным вариантом, если длительности в истории нет.
        const duration = chat.duration !== null && chat.duration !== undefined
            ? chat.duration
            : data.tsMod != null &&
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
            afrt,
            queue,
            autoClose,
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

        if (field === 'afrt') {
            return record.afrt === null || record.afrt === undefined
                ? '—'
                : record.afrt;
        }

        if (field === 'queue') {
            return record.queue ? 'Очередь' : '—';
        }

        if (field === 'autoClose') {
            if (record.autoClose === 'inactivity') return 'Неактивность';
            if (record.autoClose === 'pause') return 'После отложенного';
            return '—';
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

            // История операторов грузится параллельно (раньше — по одному),
            // а объединяется строго в порядке списка, чтобы результат не зависел
            // от того, чей ответ пришёл первым.
            const historyByOperator = new Array(operators.length).fill(null);

            await parallel(
                operators.map((operator, index) => ({ operator, index })),
                4,
                async ({ operator, index }) => {
                    try {
                        historyByOperator[index] = await loadHistory(
                            operator,
                            range,
                            filters
                        );
                    } catch (error) {
                        failedOperators++;
                        console.error(
                            `История оператора ${operator.name}:`,
                            error
                        );
                    }
                },
                (done, total) => {
                    setProgress(done / Math.max(total, 1) * 35);
                    setStatus(`История: ${done} / ${total}`);
                }
            );

            for (const chats of historyByOperator) {
                for (const chat of chats || []) {
                    const existing = uniqueChats.get(chat.id);
                    // Сохраняем чат, если его еще нет, ИЛИ если новая запись — от оператора, который его закрыл
                    if (!existing || (!existing.isClosedByOperator && chat.isClosedByOperator)) {
                        uniqueChats.set(chat.id, chat);
                    }
                }
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
                    stroke: '#344258',
                    'stroke-width': 1
                })
            );

            const label = createSvg('text', {
                x: left - 7,
                y: y + 4,
                fill: '#a6b4cb',
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
                fill: '#a6b4cb',
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
            stroke: '#829fff',
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

    // Excel в русской локали делит столбцы по «;» — с «,» всё открывалось одной колонкой
    const CSV_SEPARATOR = ';';

    function csvCell(value) {
        let text = String(value ?? '');

        // Защита от CSV-инъекции: в выгрузку попадают тексты пользователей,
        // и строка, начинающаяся с = + - @, в Excel выполнится как формула.
        if (/^[=+\-@\t\r]/.test(text)) {
            text = `'${text}`;
        }

        return `"${text.replace(/"/g, '""')}"`;
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
                    .join(CSV_SEPARATOR),

                ...rows.map(row =>
                    row
                        .map(csvCell)
                        .join(CSV_SEPARATOR)
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

            // Список берётся из текущего состояния (кто сейчас в смене).
            // Раньше он грузился один раз и не обновлялся до перезагрузки страницы:
            // вышедшие позже операторы в нём не появлялись.
            const OPERATORS_TTL_MS = 5 * 60 * 1000;
            const stale = !state.operatorsLoadedAt ||
                Date.now() - state.operatorsLoadedAt > OPERATORS_TTL_MS;

            if (!state.busy && (!state.operators.length || stale)) {
                loadOperators();
            }
        };
})();