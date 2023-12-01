chrome.storage.local.set({ scriptAdrAppVers: 'https://script.google.com/macros/s/AKfycbwgym7WoXavCcMa7mpzlA4GHGncpWixKwyxhSJT1TU8tZg4KmRemyZqyQ3c5G2cKTxDrQ/exec' });


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === 'getLoginer') {
		const userid = request.userid;
		// Выполняем запрос, чтобы получить логиннер
		fetch(`https://id.skyeng.ru/admin/auth/login-links`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: `login_link_form%5Bidentity%5D=&login_link_form%5Bid%5D=${userid}&login_link_form%5Btarget%5D=https%3A%2F%2Fskyeng.ru&login_link_form%5Blifetime%5D=3600&login_link_form%5Bcreate%5D=`,
			mode: 'cors',
			credentials: 'include',
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok: ' + response.statusText);
				}
				return response.text();
			})
			.then(text => {
				// Извлекаем логиннер из текста
				const link = extractLoginLink(text);
				if (link) {
					sendResponse({ success: true, loginLink: link });
				} else {
					throw new Error('Login link not found');
				}
			})
			.catch(error => {
				sendResponse({ success: false, error: error.message });
			});
		return true; // Возвращаем true для асинхронной отправки ответа
	}

	function extractLoginLink(text) {
		// Используем глобальный поиск для нахождения всех URL
		const regex = /https:\/\/id\.skyeng\.ru\/auth\/login-link\/\S+/g;
		let matches = text.match(regex);
		// Проверяем наличие совпадений
		if (matches && matches.length) {
			// Получаем последний URL и удаляем кавычки в конце, если они есть
			let lastMatch = matches[matches.length - 1];
			return lastMatch.replace(/["']+$/, ''); // Удаляем кавычки в конце строки
		}
		return null; // Возвращаем null, если совпадений нет
	}

});