// Добавляем уникальные CSS-стили для эффекта Glassmorphism

let indexStart;
let customquery = '';
let requesttojiratext;
let favissues = JSON.parse(localStorage.getItem('bugsarray') || '[]');

// Добавляем уникальные CSS-стили
const glassStylesJiraS = `
<style>
    .jiras-glass-wrapper {
        display: flex;
        flex-direction: column;
        width: 650px;
        background: rgba(30, 35, 45, 0.65);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        padding: 15px;
        color: bisque;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    .jiras-glass-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 15px;
    }

.jiras-glass-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        color: rgba(255, 228, 196, 0.8);
        padding: 8px 4px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        aspect-ratio: 1.5 / 1; /* Делает кнопки одинаковыми прямоугольниками */
        font-size: 11px;
        font-weight: 500;
        position: relative;
        overflow: hidden;
    }
        .jiras-glass-btn::after {
        content: "";
        position: absolute;
        top: 0; left: 0; right: 0; height: 50%;
        background: linear-gradient(to bottom, rgba(255,255,255,0.05), transparent);
        pointer-events: none;
    }

    /* Эффект при наведении */
.jiras-glass-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: rgba(255, 255, 255, 0.25);
        transform: scale(1.02);
        color: #fff;
    }

    /* Активная плитка (выбранный фильтр) */
.jiras-glass-btn.active-query {
        background: rgba(60, 179, 113, 0.2);
        border-color: rgba(60, 179, 113, 0.5);
        color: #00FA9A;
        box-shadow: inset 0 0 10px rgba(60, 179, 113, 0.1);
    }
        .jiras-glass-btn.glass-tool-line {
            padding:18px;
        }
           /* Стили для иконок внутри плиток */
.jiras-glass-btn-icon-large {
        font-size: 16px;
        margin-bottom: 4px;
    }
            /* Адаптивность для маленьких экранов (если нужно) */
    @media (max-width: 500px) {
        .jiras-glass-toolbar {
            grid-template-columns: repeat(2, 1fr);
        }
    }

.jiras-glass-toolbar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 6px;
        margin-bottom: 15px;
        width: 100%;
        box-sizing: border-box;
    }

    .jiras-glass-input-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
    }

    .jiras-glass-input {
        background: rgba(0, 0, 0, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        color: #fff;
        padding: 10px;
        outline: none;
        width: 96%;
        text-align: center;
        box-sizing: border-box;
        transition: border 0.3s ease, background 0.3s ease;
    }

    .jiras-glass-input::placeholder {
        color: rgba(255,255,255,0.5);
    }

    .jiras-glass-input:focus {
        border-color: rgba(60, 179, 113, 0.6);
        background: rgba(0, 0, 0, 0.35);
        box-shadow: 0 0 8px rgba(60, 179, 113, 0.2);
    }

    .jiras-glass-textarea {
        resize: vertical;
        min-height: 40px;
    }

    .jiras-glass-scroll {
        max-height: 400px;
        overflow-y: auto;
        padding-right: 5px;
        margin-bottom: 10px;
    }

    .jiras-glass-scroll::-webkit-scrollbar {
        width: 6px;
    }
    .jiras-glass-scroll::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 4px;
    }
    .jiras-glass-scroll::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
    }
    .jiras-glass-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.35);
    }

    /* ==================== PREMIUM ISSUE ROW ==================== */
    .jiras-glass-issue-row {
        margin-bottom: 5px;
        padding: 8px 12px;           /* чуть увеличен для комфорта */
        border-radius: 10px;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.01) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-left: 3px solid rgba(60, 179, 113, 0.7);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        display: flex;
        align-items: flex-start;     /* важно для переноса текста */
        flex-wrap: nowrap;
        gap: 8px;                    /* чуть больше воздуха между элементами */
        line-height: 1.4;
        position: relative;
        overflow: hidden;
        align-items:anchor-center;
    }

    /* Hover эффекты (сохранены и улучшены) */
    .jiras-glass-issue-row:hover {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%);
        border-left-color: #00FA9A;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 15px rgba(60, 179, 113, 0.2);
    }

    /* Красивый блик стекла при наведении */
    .jiras-glass-issue-row::before {
        content: '';
        position: absolute;
        top: 0;
        left: -150%;
        width: 50%;
        height: 100%;
        background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.12), transparent);
        transform: skewX(-20deg);
        transition: 0s;
        pointer-events: none;
    }

    .jiras-glass-issue-row:hover::before {
        left: 150%;
        transition: 0.75s ease-in-out;
    }

    /* Стили для ссылок (улучшены) */
    .jiras-glass-issue-row a {
        font-weight: 500;
        letter-spacing: 0.3px;
        color: #ffd0c4;
        text-decoration: none;
        font-size: 13px;
        word-break: break-word;
        white-space: normal;
        text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        transition: color 0.2s, text-shadow 0.2s;
    }

    .jiras-glass-issue-row a:hover {
        color: #fff !important;
        text-shadow: 0 0 8px rgba(255,228,196, 0.6);
    }

    /* Иконки-кнопки */
    .jiras-glass-icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid transparent;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.2s ease;
    }

    .jiras-glass-icon-btn:hover {
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.3);
        transform: scale(1.15);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    /* Бейдж количества */
    .newcount {
        background: linear-gradient(135deg, rgba(60,179,113,0.8), rgba(46,139,87,0.8));
        box-shadow: inset 0 1px 1px rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2);
        text-shadow: 0 1px 1px rgba(0,0,0,0.5);
        min-width: 26px;
        width: fit-content;
        height: 26px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        font-weight: 700;
        border-radius: 8px;
        font-size: 11px;
        color: #fff;
        flex-shrink: 0;
    }

    .jiras-glass-page-btn {
        flex: 1;
        background: rgba(72, 61, 139, 0.5);
        text-align: center;
        border: 1px solid rgba(70, 130, 180, 0.5);
        border-radius: 6px;
        margin: 0 4px;
        padding: 6px 0;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .jiras-glass-page-btn:hover,
    .jiras-glass-page-btn.active {
        background: rgba(72, 61, 139, 0.9);
        border-color: rgba(70, 130, 180, 0.9);
        box-shadow: 0 0 8px rgba(70, 130, 180, 0.5);
    }
</style>
`;

const win_Jira = `
${glassStylesJiraS}
<div class="jiras-glass-wrapper">
    <div class="jiras-glass-header" id="jira_1str">
        <button class="mainButton jiras-glass-btn buttonHide" title="Скрывает меню" id="hideMej">hide</button>
        <button class="mainButton jiras-glass-btn jiras-glass-btn-icon" id="RefreshJiraStatus" title="Обновляет статус Токена Jira, чтобы проверить авторизованы вы или нет">🔄</button>
        <button class="mainButton jiras-glass-btn jiras-glass-btn-icon" id="ClearJiraData" title="Очищает поля с результатами и полем для ввода">🧹</button>
        <span style="flex-grow: 1;">Token Status: <span id="searchjiratknstatus"></span></span>
        <button class="mainButton jiras-glass-btn jiras-glass-btn-icon" id="jirainstr" title="Инструкция по этой форме">❓</button>
    </div>

<div class="jiras-glass-toolbar" id="control_jira_search">
        <button class="mainButton jiras-glass-btn active-query glass-tool-line" id="defaultQuery" title="Дефолтный поиск">
            <span class="jiras-glass-btn-icon-large">📇</span>Default
        </button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="ZBPQuery" title="Zero Bug Policy">
            <span class="jiras-glass-btn-icon-large">🙅‍♂️</span>ZeroBug
        </button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="freshQuery" title="Свежие баги">
            <span class="jiras-glass-btn-icon-large">🍀</span>Fresh
        </button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="customQuery" title="Ваш JQL запрос">
            <span class="jiras-glass-btn-icon-large">📝</span>Custom
        </button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="PSquery" title="Project Support">
            <span class="jiras-glass-btn-icon-large">😵</span>Support
        </button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="getiosbugs" title="iOS задачи">
            <span class="jiras-glass-btn-icon-large">🍏</span>iOS
        </button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="getandroidbugs" title="Android задачи">
            <span class="jiras-glass-btn-icon-large">🤖</span>Android
        </button>
        <button class="mainButton jiras-glass-btn glass-tool-line" id="favouriteBugs" title="Избранное">
            <span class="jiras-glass-btn-icon-large">❤</span>Saved
        </button>
    </div>

    <div class="jiras-glass-input-container" id="fields_jira_search">
        <textarea id="JQLquery" class="jiras-glass-input jiras-glass-textarea" placeholder="JQL запрос" title="Введите сюда JQL запрос" autocomplete="off"></textarea>
        <div style="display: flex; width: 96%; gap: 8px;">
            <input id="testJira" class="jiras-glass-input" placeholder="Введите слово/фразу" autocomplete="off" style="border-radius: 20px; flex-grow: 1; height:30px;">
            <button class="mainButton jiras-glass-btn jiras-glass-btn-icon" id="getJiraTasks">🚀</button>
        </div>
    </div>

    <div id="jira_tasks_box">
        <div id="issuetable" class="jiras-glass-scroll"></div>
        <div id="favouriteissuetable" class="jiras-glass-scroll" style="display:none"></div>
        <span id="foundIssuesAmount" style="font-size: 14px; opacity: 0.9; margin-left: 5px;"></span>
    </div>

    <div id="pagesSwitcher" style="display:flex; justify-content:space-evenly; padding-top:10px;"></div>
</div>`;

const wintJira = createWindow('AF_Jira', 'winTopJira', 'winLeftJira', win_Jira);
hideWindowOnDoubleClick('AF_Jira');
hideWindowOnClick('AF_Jira', 'hideMej');

const optionsforfetch = (queryName, indexStart) => ({
    headers: {
        "__amdmodulename": "jira/issue/utils/xsrf-token-header",
        "accept": "*/*",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-atlassian-token": "no-check",
        "x-requested-with": "XMLHttpRequest"
    },
    body: `startIndex=${indexStart}&filterId=21266&jql=${queryName}&layoutKey=list-view`,
    method: "POST",
    mode: "cors",
    credentials: "include"
});

const JQLTemplates = { // шаблоны JQL запросов
    defqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    frqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports >= 0 AND text ~ "${testJira.value}" ORDER BY Created',
    zbpqueryitem: 'issuetype in (Bug, Task) AND status = closed AND resolution in ("Won\'t Fix", "Won\'t Do") AND Reports >= 0 AND created >= 2022-01-01 AND text ~ "${testJira.value}" ORDER BY updated',
    iosbugsqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    androidbugsqueryitem: 'issuetype in (Bug, Task) AND status != closed AND Reports > 0 AND text ~ "${testJira.value}" ORDER BY updated',
    PSqueryitem: 'project = PS AND text ~ "${testJira.value}" ORDER BY Created'
};

// передача запросов в форму через геттеры
Object.entries(JQLTemplates).forEach(([key, template]) => {
    Object.defineProperty(window, key, {
        get: () => template.replace('${testJira.value}', document.getElementById('testJira').value)
    });
});

function toggleAndDeactivateQueries(currentId) {
    const queryIds = ['defaultQuery', 'getiosbugs', 'getandroidbugs', 'customQuery', 'favouriteBugs', 'ZBPQuery', 'freshQuery', 'PSquery'];
    queryIds.forEach(id => {
        const element = document.getElementById(id);
        if (id === currentId) {
            element.classList.add('active-query');
        } else {
            element.classList.remove('active-query');
        }
    });
}

function showelemonpages() {
    document.getElementById('testJira').value = "";
    document.getElementById('fields_jira_search').style.display = "";
    document.getElementById('issuetable').style.display = "";
    document.getElementById('foundIssuesAmount').style.display = "";
    document.getElementById('pagesSwitcher').style.display = "flex";
    document.getElementById('favouriteissuetable').style.display = "none";
}

// Функции фильтрации и замены
const filterItems = (item, index) => index % 2 !== 0 ? item : null;
const replaceItem = (item) => item ? item.replace('">', ' – ') : item;

// Хелпер для проверки, в избранном ли задача
const isFavorite = (issueId) => favissues.some(fav => fav.id === issueId);

function formatIssue(item, currentNumber, issueKey, searchText, currentpic, currentIds) {
    const processedItem = replaceItem(item);
    const temporarka = (processedItem && processedItem.toLowerCase().includes(searchText.toLowerCase()))
        ? highlightSearchText(item, searchText)
        : processedItem;

    // Сверяем ID строки с массивом избранного (приводим к строке для надежности)
    const isAlreadyFav = favissues.some(fav => String(fav.id) === String(currentIds));
    const heartIcon = isAlreadyFav ? "❤️" : "🤍";
    const heartTitle = isAlreadyFav ? "Удалить из избранного" : "В избранное";

    return `
        <div class="jiras-glass-issue-row" data-id="${currentIds}">
            <span style="color: #00FA9A; font-size: 10px; margin-top: 4px;">&#5129;</span>
            <span class="newcount">${currentNumber || 0}</span>
            <img src="${currentpic}" style="width:20px; height:20px; flex-shrink:0; margin-top: 2px;" title="Приоритеты">
            <span class="jiraissues jiras-glass-icon-btn" title="Отправить в чат">💬</span>
            <span class="refreshissues jiras-glass-icon-btn" style="color:#ADFF2F;" title="Увеличить Support Tab">+1</span>
            <span name="addtofavourites" class="jiras-glass-icon-btn" title="${heartTitle}">${heartIcon}</span>
            <a name="buglinks" href="https://jira.skyeng.link/browse/${issueKey}" target="_blank">${temporarka}</a>
            <span name="issueIds" style="display:none">${currentIds}</span>
        </div>
    `;
}

function addPageSwitcher(spanCount) {
    if (spanCount <= 1) return;
    let spanElements = "";
    for (let i = 0; i < spanCount; i++) {
        const isActive = i === 0 ? "active" : "";
        spanElements += `<span class="jiras-glass-page-btn ${isActive}" name="changeList" value="${i * 50}">${i + 1}</span>`;
    }
    document.getElementById('pagesSwitcher').innerHTML = spanElements;
}

function addJiraIssueOnClickEvent(barray, issueKeys) {
    barray.forEach((el, j) => {
        el.addEventListener('click', () => {
            const chatId = getChatId();
            if (chatId) {
                if (window.location.href.includes('tickets/assigned')) {
                    sendComment(`https://jira.skyeng.link/browse/${issueKeys[j]}`);
                }
                fetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
                    headers: {
                        "accept": "*/*",
                        "content-type": "application/json",
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-csrf-token": aftoken
                    },
                    body: JSON.stringify({
                        conversationId: chatId,
                        elements: [{ name: "taskUrl", value: `https://jira.skyeng.link/browse/${issueKeys[j]}` }]
                    }),
                    method: "POST",
                    mode: "cors",
                    credentials: "include"
                });
            }
        });
    });
}

function renderFavorites() {
    const outputTable = document.getElementById('favouriteissuetable');
    if (!outputTable) return;

    // Сохраняем состояние в localStorage при каждом рендере для надежности
    localStorage.setItem('bugsarray', JSON.stringify(favissues));

    if (favissues.length === 0) {
        outputTable.innerHTML = '<div style="padding:10px; color:bisque;">Список избранного пуст</div>';
        return;
    }

    outputTable.innerHTML = favissues.map(fav => `
        <div class="jiras-glass-issue-row" data-id="${fav.id}">
            <span style="color: #00FA9A; margin-top:4px;">&#5129;</span>
            <span class="newcount">${fav.num}</span>
            <a href="${fav.href}" target="_blank" style="color:bisque;">${fav.html}</a>
            <div style="display:flex; gap:5px; margin-left:auto;">
                <span name="addtonotesbug" class="jiras-glass-icon-btn" title="В чат">💬</span>
                <span name="increasecount" class="jiras-glass-icon-btn" style="color:#ADFF2F;" title="Увеличить Tab">+1</span>
                <span name="removefromfavourites" class="jiras-glass-icon-btn" title="Удалить">❌</span>
            </div>
        </div>
    `).join("");

    // Навешиваем события ПОСЛЕ отрисовки
    outputTable.querySelectorAll('.jiras-glass-issue-row').forEach((row, index) => {
        const id = row.getAttribute('data-id');
        const currentFav = favissues.find(f => f.id === id);

        // Кнопка удаления
        row.querySelector('[name="removefromfavourites"]').onclick = () => {
            favissues = favissues.filter(fav => String(fav.id) !== String(id));
            localStorage.setItem('bugsarray', JSON.stringify(favissues));

            // КЛЮЧЕВОЙ МОМЕНТ: Синхронизируем иконку в основном поиске (если он отрисован)
            const mainSearchBtn = document.querySelector(`#issuetable .jiras-glass-issue-row[data-id="${id}"] [name="addtofavourites"]`);
            if (mainSearchBtn) {
                mainSearchBtn.innerText = "🤍";
                mainSearchBtn.title = "В избранное";
            }

            renderFavorites();
        };

        // Кнопка "В чат"
        row.querySelector('[name="addtonotesbug"]').onclick = () => {
            if (currentFav) {
                const issueUrl = currentFav.href;
                if (typeof sendComment === 'function') sendComment(issueUrl);

                const chatId = typeof getChatId === 'function' ? getChatId() : null;
                if (chatId) {
                    fetch(`https://skyeng.autofaq.ai/api/conversation/${chatId}/payload`, {
                        headers: { "accept": "*/*", "content-type": "application/json", "x-csrf-token": aftoken },
                        body: JSON.stringify({ conversationId: chatId, elements: [{ name: "taskUrl", value: issueUrl }] }),
                        method: "POST"
                    });
                }
            }
        };

        // Кнопка инкремента (+1)
        row.querySelector('[name="increasecount"]').onclick = function () {
            const countBadge = row.querySelector('.newcount');
            chrome.runtime.sendMessage({
                action: 'getFetchRequest',
                fetchURL: `https://jira.skyeng.link/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${id}`,
                requestOptions: { method: 'GET' }
            }, authresponse => {
                if (authresponse.success) {
                    const jira_token = authresponse.fetchansver.match(/"atl_token":"(.*lin)/)?.[1];
                    const countMatch = authresponse.fetchansver.match(/customfield_15410.*?value=.*?(\d+)/);
                    if (jira_token && countMatch) {
                        const newCount = (parseInt(countMatch[1]) + 1).toString();
                        const body = `customfield_15410=${newCount}&issueId=${id}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`;

                        chrome.runtime.sendMessage({
                            action: 'getFetchRequest',
                            fetchURL: 'https://jira.skyeng.link/secure/AjaxIssueAction.jspa?decorator=none',
                            requestOptions: {
                                method: 'POST',
                                headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                                body: body
                            }
                        }, res => {
                            if (res.success) {
                                countBadge.innerText = newCount;
                                // Обновляем данные в массиве избранного, чтобы при обновлении страницы число сохранилось
                                const favIdx = favissues.findIndex(f => f.id === id);
                                if (favIdx !== -1) {
                                    favissues[favIdx].num = newCount;
                                    localStorage.setItem('bugsarray', JSON.stringify(favissues));
                                }
                            }
                        });
                    }
                }
            });
        };
    });
}

function addFavouritesOnClickEvent(addtofarr, tagsarray, massivissueids) {
    addtofarr.forEach((btn, v) => {
        btn.onclick = () => {
            const issueId = massivissueids[v].innerText;
            const isFav = favissues.some(fav => String(fav.id) === String(issueId));

            if (!isFav) {
                // Добавляем в избранное
                const issueData = {
                    id: issueId,
                    html: tagsarray[v].innerHTML,
                    href: tagsarray[v].href,
                    num: btn.closest('.jiras-glass-issue-row').querySelector('.newcount').innerText
                };
                favissues.push(issueData);
                btn.innerText = "❤️";
                btn.title = "Удалить из избранного";
            } else {
                // Удаляем из избранного (если нажали на красное сердечко в поиске)
                favissues = favissues.filter(fav => String(fav.id) !== String(issueId));
                btn.innerText = "🤍";
                btn.title = "В избранное";
            }

            localStorage.setItem('bugsarray', JSON.stringify(favissues));

            // Если вкладка избранного открыта в фоне, обновляем её
            if (document.getElementById('favouriteissuetable').style.display === "block") {
                renderFavorites();
            }
        };
    });
}

function addRefreshIssueOnClickEvent(refreshissuesarr, issueIds) {
    refreshissuesarr.forEach((issueElement, index) => {
        issueElement.addEventListener('click', () => {
            const fetchURLToken = `https://jira.skyeng.link/secure/AjaxIssueEditAction!default.jspa?decorator=none&issueId=${issueIds[index]}`;
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLToken, requestOptions: { method: 'GET', credentials: 'include' } }, responseToken => {
                if (responseToken.success) {
                    const responseAuth = responseToken.fetchansver;
                    const jira_token = responseAuth.match(/"atl_token":"(.*lin)/)?.[1];
                    const countMatch = responseAuth.match(/customfield_15410.*?value=.*?(\d+)/);
                    if (jira_token && countMatch) {
                        const increasedcount = (parseInt(countMatch[1]) + 1).toString();
                        const fetchURLIncrease = "https://jira.skyeng.link/secure/AjaxIssueAction.jspa?decorator=none";
                        const requestOptionsIncrease = {
                            method: 'POST',
                            headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
                            body: `customfield_15410=${increasedcount}&issueId=${issueIds[index]}&atl_token=${jira_token}&singleFieldEdit=true&fieldsToForcePresent=customfield_15410`,
                            credentials: 'include',
                        };

                        chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: fetchURLIncrease, requestOptions: requestOptionsIncrease }, responseIncrease => {
                            if (responseIncrease.success) {
                                document.querySelectorAll('.newcount')[index].innerHTML = increasedcount;
                            } else {
                                console.log('Ошибка при увеличении счетчика Support Tab:', responseIncrease.error);
                            }
                        });
                    }
                } else {
                    console.log('Ошибка при получении токена и счетчика:', responseToken.error);
                }
            });
        });
    });
}

function getJiraTask(requestOptions) {
    const fetchURL = 'https://jira.skyeng.link/rest/issueNav/1/issueTable';
    chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, tasksresponse => {
        if (tasksresponse.success) {
            const rezissuetable = JSON.parse(tasksresponse.fetchansver);
            const { issueKeys, table, issueIds } = rezissuetable.issueTable;

            if (!table) {
                document.getElementById('issuetable').innerHTML = '<a style="margin-left:5px; color: #ffe4c4">Задач не найдено</a>';
                return;
            }

            const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi)?.filter(filterItems) || [];
            const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);
            const searchText = document.getElementById('testJira').value;
            const currentpics = table.match(/https:\/\/jira.skyeng.link\/images\/icons\/priorities\/.*svg/gm) || [];

            let issues = '';
            for (let i = 0; i < Math.min(issueKeys.length, 50); i++) {
                if (matchedItems[i] && issueKeys[i]) {
                    issues += formatIssue(matchedItems[i], matchedNumbers?.[i], issueKeys[i], searchText, currentpics[i], issueIds[i]);
                }
            }

            document.getElementById('issuetable').innerHTML = issues;
            const foundIssuesAmount = issueKeys.length;

            addPageSwitcher(Math.floor(foundIssuesAmount / 50) + 1);
            document.getElementById('foundIssuesAmount').innerHTML = `Всего найдено задач: ${foundIssuesAmount}`;

            addJiraIssueOnClickEvent(document.querySelectorAll('.jiraissues'), issueKeys);
            addFavouritesOnClickEvent(
                document.getElementsByName('addtofavourites'),
                document.getElementsByName('buglinks'),
                document.getElementsByName('issueIds'),
                document.getElementById('favouriteissuetable')
            );
            addRefreshIssueOnClickEvent(document.querySelectorAll('.refreshissues'), issueIds);

            switchJiraPages();
        } else {
            alert('Не удалось получить задачи: ' + tasksresponse.error);
        }
    });
}

function switchJiraPages() {
    if (!requesttojiratext) { alert("Выполни поиск заново"); return; }

    const pageSwArr = document.getElementsByName('changeList');
    const fetchURL = 'https://jira.skyeng.link/rest/issueNav/1/issueTable';

    pageSwArr.forEach(page => {
        page.addEventListener('click', function () {
            if (!this.classList.contains('active')) {
                document.getElementById('issuetable').innerHTML = '<span style="color:bisque; margin-left:5px;">Загрузка...</span>';
                pageSwArr.forEach(p => p.classList.remove('active'));
                this.classList.add('active');

                const requestOptions = optionsforfetch(requesttojiratext, page.getAttribute('value'));

                chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL, requestOptions }, response => {
                    if (response?.success) {
                        const responseData = JSON.parse(response.fetchansver);
                        const { issueKeys, table } = responseData.issueTable;
                        const matchedItems = table.match(/(\w+-\d+">.*?).<\/a>/gmi)?.filter(filterItems) || [];
                        const matchedNumbers = table.match(/(">.)*?([0-9]+)\n/gm);
                        const ids = Array.from(table.matchAll(/<tr id="issuerow(\d+)"/g), m => m[1]);
                        const currentpics = table.match(/https:\/\/jira.skyeng.link\/images\/icons\/priorities\/.*svg/gm) || [];
                        const searchText = document.getElementById('testJira').value;
                        const switcher = Number(page.getAttribute('value'));

                        let issues = '';
                        for (let i = 0; i < responseData.issueTable.displayed; i++) {
                            if (matchedItems[i] && issueKeys[+i + switcher]) {
                                issues += formatIssue(matchedItems[i], matchedNumbers?.[i], issueKeys[+i + switcher], searchText, currentpics[i], ids[i]);
                            }
                        }

                        document.getElementById('issuetable').innerHTML = issues;

                        addJiraIssueOnClickEvent(document.querySelectorAll('.jiraissues'), issueKeys);
                        addFavouritesOnClickEvent(
                            document.getElementsByName('addtofavourites'),
                            document.getElementsByName('buglinks'),
                            document.getElementsByName('issueIds'),
                            document.getElementById('favouriteissuetable')
                        );
                        addRefreshIssueOnClickEvent(document.querySelectorAll('.refreshissues'), ids);
                    } else {
                        console.log('Ошибка при запросе: ', response.error);
                    }
                });
            }
        });
    });
}

function ClearPages() {
    const pagesSwitcher = document.getElementById('pagesSwitcher');
    while (pagesSwitcher.firstChild) {
        pagesSwitcher.removeChild(pagesSwitcher.firstChild);
    }
}

document.getElementById('ClearJiraData').addEventListener('click', () => {
    document.getElementById('testJira').value = '';
    document.getElementById('issuetable').innerHTML = '';
    document.getElementById('foundIssuesAmount').innerText = '';
    ClearPages();
});

document.getElementById('jirainstr').addEventListener('click', () => {
    window.open('https://confluence.skyeng.tech/pages/viewpage.action?pageId=140564971#id-%F0%9F%A7%A9%D0%A0%D0%B0%D1%81%D1%88%D0%B8%D1%80%D0%B5%D0%BD%D0%B8%D0%B5ChatMasterAutoFaq-jirasearch%F0%9F%94%8EJiraSearch');
});

function getJiraOpenFormPress() {
    const mainBox = document.getElementById('AF_Jira');

    if (mainBox.style.display === 'none') {
        mainBox.style.display = '';
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn');
        document.getElementById('idmymenu').style.display = 'none';
        document.getElementById('JQLquery').value = defqueryitem;

        function checkJiraToken() {
            chrome.runtime.sendMessage({ action: 'getFetchRequest', fetchURL: "https://jira.skyeng.link", requestOptions: { method: 'GET' } }, response => {
                if (response.success && response.fetchansver.match(/name="atlassian-token" content="(.*lin)/)) {
                    document.getElementById('searchjiratknstatus').innerText = "🟢";
                } else {
                    alert("Авторизуйтесь в системе Jira, чтобы при поиске запрос был отправлен");
                    document.getElementById('searchjiratknstatus').innerText = "🔴";
                }
            });
        }
        checkJiraToken();
        document.getElementById('RefreshJiraStatus').addEventListener('click', checkJiraToken);

        if (localStorage.getItem('bugsarray')) {
            favissues = JSON.parse(localStorage.getItem('bugsarray'));
            renderFavorites();
        }

        const queryButtons = [
            { id: 'defaultQuery', val: () => defqueryitem, search: false },
            { id: 'PSquery', val: () => PSqueryitem, search: false },
            { id: 'freshQuery', val: () => frqueryitem, search: false },
            { id: 'ZBPQuery', val: () => zbpqueryitem, search: false },
            { id: 'customQuery', val: () => localStorage.getItem('customquery') || "", search: false, custom: true },
            { id: 'getiosbugs', val: () => "ios", search: true },
            { id: 'getandroidbugs', val: () => "android", search: true }
        ];

        queryButtons.forEach(btn => {
            document.getElementById(btn.id).addEventListener('click', function () {
                toggleAndDeactivateQueries(this.id);
                showelemonpages();
                if (btn.search) {
                    document.getElementById('testJira').value = btn.val();
                    document.getElementById('getJiraTasks').click();
                } else {
                    document.getElementById('JQLquery').value = btn.val();
                    if (btn.custom) {
                        document.getElementById('JQLquery').oninput = function () {
                            localStorage.setItem('customquery', this.value);
                        };
                    }
                }
            });
        });

        // Favourite logic
        document.getElementById('favouriteBugs').addEventListener('click', function () {
            const isVisible = document.getElementById('favouriteissuetable').style.display === "block";

            if (!isVisible) {
                toggleAndDeactivateQueries(this.id);
                document.getElementById('issuetable').style.display = "none";
                document.getElementById('fields_jira_search').style.display = "none";
                document.getElementById('foundIssuesAmount').style.display = "none";
                document.getElementById('pagesSwitcher').style.display = "none";
                document.getElementById('favouriteissuetable').style.display = "block";
                renderFavorites(); // Просто вызываем рендер, события уже внутри него
            } else {
                // Если уже открыто — возвращаемся к дефолту или просто скрываем
                document.getElementById('defaultQuery').click();
            }
        });

        document.getElementById('getJiraTasks').addEventListener('click', () => {
            ClearPages();
            const queries = {
                'defaultQuery': defqueryitem,
                'PSquery': PSqueryitem,
                'freshQuery': frqueryitem,
                'customQuery': localStorage.getItem('customquery'),
                'getiosbugs': iosbugsqueryitem,
                'getandroidbugs': androidbugsqueryitem,
                'ZBPQuery': zbpqueryitem
            };

            for (const id in queries) {
                if (document.getElementById(id).classList.contains('active-query')) {
                    document.getElementById('JQLquery').value = queries[id];
                    requesttojiratext = encodeURI(document.getElementById('JQLquery').value);
                    getJiraTask(optionsforfetch(requesttojiratext, 0));
                    break;
                }
            }
        });

        const handleSearchJiraByEnter = (event) => { if (event.key === "Enter") document.getElementById('getJiraTasks').click(); };
        document.querySelector('#testJira').addEventListener('keydown', handleSearchJiraByEnter);
        document.querySelector('#JQLquery').addEventListener('keydown', handleSearchJiraByEnter);

    } else {
        mainBox.style.display = 'none';
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn');
    }
    document.getElementById('idmymenu').style.display = 'none';
}