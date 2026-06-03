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

	const isPersonPage = () => /^https:\/\/crm2\.skyeng\.ru\/persons\/\d+/.test(location.href);

	function parseStatus(html) {
		const tableMatch = html.match(/<th[^>]*>\s*Статус\s*<\/th>\s*<td>([^<]+)<\/td>/i);
		const divMatch = html.match(/статус:\s*<strong>([^<]+)<\/strong>/i);
		const looseMatch = html.match(/статус[:\s]*<strong>([^<]+)<\/strong>/i);
		const m = tableMatch || divMatch || looseMatch;
		return m ? m[1].trim() : null;
	}

	function stopChecker() {
		if (checkInterval) {
			clearInterval(checkInterval);
			checkInterval = null;
		}
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
		} else {
			badge.style.backgroundColor = '#6c757d';
		}
	}

	function tick() {
		if (!isPersonPage()) {
			stopChecker();
			return;
		}

		const field = document.querySelector('[data-qa="person-id-field"]');
		if (!field) return;

		const sid = field.textContent.trim().replace(/\D/g, '');
		if (!sid) return;

		const badge = document.getElementById('isUserBlocked');
		if (badge && badge.dataset.pid === sid) {
			stopChecker();
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

				if (!response || response.success !== true) {
					console.error('[UserBlock] Ошибка:', response?.error);
					renderBadge('ошибка', sid);
					stopChecker();
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

				stopChecker();
			}
		);
	}

	function startCheck() {
		if (checkInterval) return;
		if (!isPersonPage()) return;

		const oldBadge = document.getElementById('isUserBlocked');
		if (oldBadge) oldBadge.remove();

		isLoading = false;
		tick();
		checkInterval = setInterval(tick, 1000);
	}

	function onNavigate() {
		setTimeout(() => {
			if (!isPersonPage()) {
				stopChecker();
				return;
			}

			const field = document.querySelector('[data-qa="person-id-field"]');
			const sid = field ? field.textContent.trim().replace(/\D/g, '') : null;
			const badge = document.getElementById('isUserBlocked');

			if (!badge || (sid && badge.dataset.pid !== sid)) {
				stopChecker();
				startCheck();
			}
		}, 300);
	}

	const originalPushState = history.pushState;
	const originalReplaceState = history.replaceState;

	history.pushState = function (...args) {
		originalPushState.apply(this, args);
		onNavigate();
	};

	history.replaceState = function (...args) {
		originalReplaceState.apply(this, args);
		onNavigate();
	};

	window.addEventListener('popstate', onNavigate);

	startCheck();
})();

//    position: absolute;
//	top: 92px;
//	left: 480px;
//
//
