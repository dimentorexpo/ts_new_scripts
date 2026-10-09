let tasksData = [];

let testoInterval = setInterval(function () {
	if (location.pathname.endsWith("/customer-support/list")) {
		let userIdToParseTasks = document.URL.split("/")[4];

		fetch(`https://customer-support.skyeng.ru/task/user/${userIdToParseTasks}`, {
			method: "GET",
			headers: { "accept": "application/json" },
			credentials: "include"
		})
			.then(response => response.json())
			.then(responsedata => {
				tasksData = responsedata.data;

				let linkToGrid = document.getElementsByTagName('crm-grid');
				let taskIndex = 0;

				for (let i = 0; i < linkToGrid.length; i++) {
					let target = linkToGrid[i].children[0]?.lastElementChild?.children[1];

					if (target && target.textContent.includes('Группа') && taskIndex < tasksData.length) {
						if (!linkToGrid[i].querySelector('.crm-task-btn')) {
							let openCRMTask = document.createElement('span');
							openCRMTask.className = "crm-task-btn";
							openCRMTask.title = "Открыть задачу для просмотра";
							openCRMTask.textContent = "👁️";

							// захватываем taskIndex в локальную переменную
							let currentTaskIndex = taskIndex;

							openCRMTask.addEventListener('click', function () {
								window.location.assign(
									`https://crm2.skyeng.ru/persons/${userIdToParseTasks}/customer-support/task/${tasksData[currentTaskIndex].id}`
								);
							});

							linkToGrid[i].append(openCRMTask);
							taskIndex++;
						}
					}
				}


				clearInterval(testoInterval);
			})
			.catch(error => {
				console.error("Ошибка запроса:", error);
				clearInterval(testoInterval);
			});
	}
}, 2000);


(function () {
	'use strict';

	if (window.__skyUserBlockerInitialized) return;
	window.__skyUserBlockerInitialized = true;

	let checkInterval = null;
	let isLoading = false;
	let lastProcessedId = null;

	const getUserIdFromUrl = () => {
		const match = location.pathname.match(/\/persons\/(\d+)/);
		return match ? match[1] : null;
	};

	const isPersonPage = () => Boolean(getUserIdFromUrl());

	function parseStatus(html) {
		const tableMatch = html.match(/<th[^>]*>\s*Статус\s*<\/th>\s*<td>([^<]+)<\/td>/i);
		const divMatch = html.match(/статус:\s*<strong>([^<]+)<\/strong>/i);
		const looseMatch = html.match(/статус[:\s]*<strong>([^<]+)<\/strong>/i);
		const m = tableMatch || divMatch || looseMatch;
		return m ? m[1].trim() : null;
	}

	function renderBadge(status, sid) {
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
		badge.dataset.pid = sid;

		if (status === 'активный') {
			badge.style.backgroundColor = '#28a745';
		} else if (status === 'временно отключен') {
			badge.style.backgroundColor = '#d32b49';
		} else if (status === 'Загрузка…') {
			badge.style.backgroundColor = '#17a2b8';
		} else {
			badge.style.backgroundColor = '#6c757d';
		}
	}

	function checkAndFetch() {
		const sid = getUserIdFromUrl();

		if (!sid) {
			const badge = document.getElementById('isUserBlocked');
			if (badge) badge.remove();
			lastProcessedId = null;
			return;
		}

		const field = document.querySelector('[data-qa="person-id-field"]');
		// Ждем, пока DOM карточки подгрузится
		if (!field) return;

		// Если ID сменился или бейджа нет — сбрасываем и запрашиваем актуальный статус
		const badge = document.getElementById('isUserBlocked');
		if (lastProcessedId === sid && badge && badge.dataset.pid === sid) {
			return;
		}

		if (isLoading) return;

		renderBadge('Загрузка…', sid);
		isLoading = true;

		const fetchURL = `https://id.skyeng.ru/admin/users/${encodeURIComponent(sid)}`;
		const requestOptions = {
			method: 'GET',
			headers: {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				"accept-language": "ru,en;q=0.9",
				"cache-control": "max-age=0",
				"priority": "u=0, i",
				"sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"YaBrowser\";v=\"26.3\", \"Yowser\";v=\"2.5\", \"YaBrowserCorp\";v=\"144\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "none",
				"sec-fetch-user": "?1",
				"sec-gpc": "1",
				"upgrade-insecure-requests": "1"
			},
			credentials: 'include'
		};

		chrome.runtime.sendMessage(
			{ action: 'getFetchRequest', fetchURL, requestOptions },
			(response) => {
				isLoading = false;

				// Если пока шел запрос пользователь переключился на третье лицо — отбрасываем ответ
				if (getUserIdFromUrl() !== sid) return;

				if (!response || response.success !== true) {
					console.error('[UserBlock] Ошибка:', response?.error);
					renderBadge('ошибка', sid);
					lastProcessedId = sid;
					return;
				}

				const html = response.fetchAnswer || response.fetchansver || '';
				const status = parseStatus(html);

				if (status) {
					renderBadge(status, sid);
					console.log(`[UserBlock] ${sid} → ${status}`);
				} else {
					renderBadge('статус не найден', sid);
					console.warn('[UserBlock] Статус не спарсился для', sid);
				}

				lastProcessedId = sid;
			}
		);
	}

	function handleUrlChange() {
		const currentSid = getUserIdFromUrl();
		if (currentSid !== lastProcessedId) {
			const badge = document.getElementById('isUserBlocked');
			if (badge) {
				badge.remove(); // удаляем старый бейдж от прошлого юзера сразу
			}
		}
		checkAndFetch();
	}

	// Перехват роутинга браузера
	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;

	history.pushState = function (...args) {
		originalPushState.apply(this, args);
		handleUrlChange();
	};

	history.replaceState = function (...args) {
		originalReplaceState.apply(this, args);
		handleUrlChange();
	};

	window.addEventListener('popstate', handleUrlChange);

	// Фоновый таймер (страховка на случай внутренних роутеров без pushState и задержек рендера DOM)
	setInterval(checkAndFetch, 800);
})();

//    position: absolute;
//	top: 92px;
//	left: 480px;
//
//
