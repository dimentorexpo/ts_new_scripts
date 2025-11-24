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


let infButInterval = setInterval(function () {
	// Проверяем, что мы на нужной странице
	if (location.pathname.endsWith('communications/messenger')) {
		const toolbarRow = document.getElementsByClassName('mat-toolbar-row')[0];

		// Проверяем, что тулбар найден и кнопка ещё не добавлена
		if (toolbarRow && !document.getElementById('tmpInfBut')) {
			let infoTemplateBtn = document.createElement('span');
			infoTemplateBtn.textContent = "❓";
			infoTemplateBtn.id = "tmpInfBut";
			infoTemplateBtn.style.cssText = `
			position: fixed;       /* фиксируем относительно окна браузера */
			top: 15%;              /* по вертикали в середину */
			left: 35%;             /* по горизонтали в середину */
			transform: translate(-50%, -50%); /* смещаем центр элемента */
			width: 30px;
			height: 30px;
			padding: 2px;
			background-color: #f3c312;
			font-size: 20px;
			z-index: 9999;
			border-radius: 20px;
			text-align: center;
			cursor: help;
		  `;
			infoTemplateBtn.title = "Услуга: Premium; Язык: ru; Шаблон: cs_bu126_01_techsup_high_wa2; Канал: Tech Support(PREMIUM)";

			// Добавляем кнопку в нужное место
			toolbarRow.children[1].children[0].append(infoTemplateBtn);

			// Останавливаем интервал, чтобы не добавлять кнопку повторно
			clearInterval(infButInterval);
		}
	}
}, 2000);

//    position: absolute;
//	top: 92px;
//	left: 480px;
//
//
