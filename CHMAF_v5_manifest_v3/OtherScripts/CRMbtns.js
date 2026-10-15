// ============================================================
// CRM: кнопки 👁️ «Открыть задачу» в списке обращений
// ============================================================
(function initCrmTaskButtons() {
	'use strict';

	if (window.__chmafCrmTaskBtnsInitialized) return;
	window.__chmafCrmTaskBtnsInitialized = true;

	const LIST_RE = /\/persons\/(\d+)\/customer-support\/list\/?$/;
	// Короткие ID не ищем в тексте строки: «12» найдётся и в дате, и в сумме
	const MIN_ID_LENGTH_FOR_TEXT_MATCH = 5;

	let tasksUserId = null;   // для кого загружены задачи
	let tasksData = null;     // массив задач или null, пока не загружено
	let loadingFor = null;    // ID пользователя, для которого идёт запрос
	let mismatchWarned = false;

	async function loadTasks(userId) {
		loadingFor = userId;
		try {
			const response = await fetch(`https://customer-support.skyeng.ru/task/user/${userId}`, {
				method: 'GET',
				headers: { accept: 'application/json' },
				credentials: 'include'
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const json = await response.json();
			if (loadingFor !== userId) return; // пока ждали ответ, открыли другого пользователя

			tasksData = Array.isArray(json?.data) ? json.data : [];
			tasksUserId = userId;
			mismatchWarned = false;
		} catch (error) {
			console.error('[ChMAF:CRM] Не удалось загрузить задачи:', error);
			if (loadingFor === userId) {
				// Пустой список, чтобы не долбить сервер каждую секунду;
				// при следующем заходе на страницу попробуем снова
				tasksData = [];
				tasksUserId = userId;
			}
		} finally {
			if (loadingFor === userId) loadingFor = null;
		}
	}

	function isGroupGrid(grid) {
		const target = grid.children[0]?.lastElementChild?.children[1];
		return Boolean(target && target.textContent.includes('Группа'));
	}

	function taskUrl(userId, taskId) {
		return `https://crm2.skyeng.ru/persons/${userId}/customer-support/task/${taskId}`;
	}

	function createTaskButton(userId, task) {
		const btn = document.createElement('span');
		btn.className = 'crm-task-btn';
		btn.dataset.taskId = String(task.id);
		btn.title = 'Открыть задачу для просмотра (Ctrl/колесо мыши — в новой вкладке)';
		btn.textContent = '👁️';
		btn.setAttribute('role', 'link');
		btn.setAttribute('tabindex', '0');
		btn.style.cursor = 'pointer';

		const open = (newTab) => {
			const url = taskUrl(userId, task.id);
			if (newTab) window.open(url, '_blank', 'noopener');
			else window.location.assign(url);
		};

		btn.addEventListener('click', (e) => open(e.ctrlKey || e.metaKey));
		btn.addEventListener('auxclick', (e) => { if (e.button === 1) open(true); });
		btn.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') open(e.ctrlKey || e.metaKey);
		});
		return btn;
	}

	/**
	 * Сопоставляет задачи со строками.
	 * 1) Если ID задачи виден в тексте строки — точное совпадение.
	 * 2) Иначе по порядку, НО только если число строк совпадает с числом задач.
	 * Раньше сопоставление шло только по порядку: при фильтре, пагинации
	 * или другой сортировке 👁️ открывал ЧУЖУЮ задачу. Лучше без кнопки, чем не та задача.
	 */
	function decorate(userId) {
		const groupGrids = Array.from(document.getElementsByTagName('crm-grid')).filter(isGroupGrid);
		if (!groupGrids.length || !tasksData.length) return;

		const used = new Set(
			groupGrids
				.map(g => g.querySelector('.crm-task-btn')?.dataset.taskId)
				.filter(Boolean)
		);
		const orderMatchAllowed = groupGrids.length === tasksData.length;

		groupGrids.forEach((grid, index) => {
			if (grid.querySelector('.crm-task-btn')) return;

			const text = grid.textContent;
			let task = tasksData.find(t =>
				!used.has(String(t.id)) &&
				String(t.id).length >= MIN_ID_LENGTH_FOR_TEXT_MATCH &&
				text.includes(String(t.id))
			);

			if (!task && orderMatchAllowed && !used.has(String(tasksData[index]?.id))) {
				task = tasksData[index];
			}

			if (!task) {
				if (!mismatchWarned) {
					mismatchWarned = true;
					console.warn(`[ChMAF:CRM] Строк «Группа»: ${groupGrids.length}, задач: ${tasksData.length}. ` +
						'Для строк без ID задачи в тексте кнопка 👁️ не добавлена, чтобы не открыть чужую задачу.');
				}
				return;
			}

			used.add(String(task.id));
			grid.append(createTaskButton(userId, task));
		});
	}

	function tick() {
		const match = location.pathname.match(LIST_RE);
		if (!match) return;

		const userId = match[1];

		if (tasksUserId !== userId) {
			if (loadingFor !== userId) {
				tasksData = null;
				tasksUserId = null;
				loadTasks(userId);
			}
			return;
		}

		// Список мог перерисоваться (Angular) — кнопки вернутся на место
		if (tasksData) decorate(userId);
	}

	// Раньше интервал отключался после первой загрузки, и при переходе
	// к другому пользователю (без перезагрузки страницы) кнопок не было.
	// Если таблица ещё не отрисовалась к приходу ответа — кнопки не появлялись никогда.
	setInterval(tick, 1000);
	tick();
})();


// ============================================================
// CRM: бейдж «активный / временно отключен» у ID пользователя
// ============================================================
(function () {
	'use strict';

	if (window.__skyUserBlockerInitialized) return;
	window.__skyUserBlockerInitialized = true;

	const ERROR_RETRY_MS = 30000;
	const STATUS_CACHE_MAX = 200;

	// sid → { status, at, isError }. Angular перерисовывает карточку и стирает
	// бейдж — раньше каждое такое стирание означало новый запрос в id.skyeng.ru.
	const statusCache = new Map();

	let isLoading = false;

	const getUserIdFromUrl = () => {
		const match = location.pathname.match(/\/persons\/(\d+)/);
		return match ? match[1] : null;
	};

	function parseStatus(html) {
		const tableMatch = html.match(/<th[^>]*>\s*Статус\s*<\/th>\s*<td>([^<]+)<\/td>/i);
		const divMatch = html.match(/статус:\s*<strong>([^<]+)<\/strong>/i);
		const looseMatch = html.match(/статус[:\s]*<strong>([^<]+)<\/strong>/i);
		const m = tableMatch || divMatch || looseMatch;
		return m ? m[1].trim() : null;
	}

	const BADGE_COLORS = {
		'активный': '#28a745',
		'временно отключен': '#d32b49',
		'Загрузка…': '#17a2b8'
	};

	function renderBadge(status, sid, title = '') {
		const field = document.querySelector('[data-qa="person-id-field"]');
		if (!field) return;

		const container = field.closest('.data-container') || field.parentElement;
		let badge = document.getElementById('isUserBlocked');

		if (!badge) {
			badge = document.createElement('div');
			badge.id = 'isUserBlocked';
			badge.style.cssText = 'color:#fff; padding:2px 6px; margin-top:4px; margin-bottom:4px; border-radius:3px; font-weight:700; display:block; width:fit-content; font-size:12px;';

			const badges = container.querySelector('.badges');
			if (badges) {
				container.insertBefore(badge, badges);
			} else {
				container.appendChild(badge);
			}
		}

		badge.textContent = status || 'неизвестно';
		badge.title = title;
		badge.dataset.pid = sid;
		badge.style.backgroundColor = BADGE_COLORS[status] || '#6c757d';
	}

	function rememberStatus(sid, entry) {
		if (statusCache.size >= STATUS_CACHE_MAX && !statusCache.has(sid)) {
			statusCache.delete(statusCache.keys().next().value);
		}
		statusCache.set(sid, { ...entry, at: Date.now() });
	}

	function finishRequest(sid, response) {
		isLoading = false;

		if (!response || response.success !== true) {
			const reason = response?.error || 'нет ответа от расширения';
			console.error('[UserBlock] Ошибка:', reason);
			rememberStatus(sid, { status: 'ошибка', isError: true, title: `${reason}. Повтор через 30 с.` });
		} else {
			const html = response.fetchAnswer || response.fetchansver || '';
			const status = parseStatus(html);

			if (status) {
				rememberStatus(sid, { status, isError: false });
			} else {
				console.warn('[UserBlock] Статус не спарсился для', sid);
				rememberStatus(sid, {
					status: 'статус не найден', isError: true,
					title: 'Страница id.skyeng.ru не содержит статуса — возможно, нужно войти в админку.'
				});
			}
		}

		// Если, пока шёл запрос, открыли другого пользователя — бейдж не трогаем
		if (getUserIdFromUrl() !== sid) return;
		const cached = statusCache.get(sid);
		renderBadge(cached.status, sid, cached.title);
	}

	function checkAndFetch() {
		const sid = getUserIdFromUrl();

		if (!sid) {
			document.getElementById('isUserBlocked')?.remove();
			return;
		}

		const field = document.querySelector('[data-qa="person-id-field"]');
		if (!field) return; // ждём, пока DOM карточки подгрузится

		const badge = document.getElementById('isUserBlocked');
		const cached = statusCache.get(sid);
		const errorExpired = cached?.isError && Date.now() - cached.at > ERROR_RETRY_MS;

		if (cached && !errorExpired) {
			// Бейдж стёрт перерисовкой или остался от прошлого пользователя — рисуем из кэша
			if (!badge || badge.dataset.pid !== sid) renderBadge(cached.status, sid, cached.title);
			return;
		}

		if (isLoading) return;

		renderBadge('Загрузка…', sid);
		isLoading = true;

		// Заголовки вроде sec-ch-ua / sec-fetch-* браузер выставляет сам и
		// подменить их из fetch нельзя, поэтому их здесь нет.
		const fetchURL = `https://id.skyeng.ru/admin/users/${encodeURIComponent(sid)}`;
		const requestOptions = {
			method: 'GET',
			headers: { accept: 'text/html,application/xhtml+xml' },
			credentials: 'include'
		};

		try {
			chrome.runtime.sendMessage(
				{ action: 'getFetchRequest', fetchURL, requestOptions },
				(response) => {
					const lastError = chrome.runtime.lastError;
					finishRequest(sid, lastError ? { success: false, error: lastError.message } : response);
				}
			);
		} catch (error) {
			// Расширение обновили, а страница старая: без этого isLoading
			// навсегда оставался true и бейдж больше не обновлялся
			finishRequest(sid, { success: false, error: 'расширение обновлено — перезагрузите страницу' });
		}
	}

	// Перехват history.pushState из контент-скрипта не работает: скрипт живёт
	// в изолированном мире и не видит вызовы роутера страницы. Смену адреса
	// ловят popstate (кнопки «назад/вперёд») и интервал.
	window.addEventListener('popstate', checkAndFetch);
	setInterval(checkAndFetch, 800);
	checkAndFetch();
})();