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
