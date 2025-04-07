let knowDataContainer;
let dropdown0;
let dropdown1;

var win_Knowledge =  // описание элементов окна ссылок
	`<div style="display: flex; width: 550px;">
        <span style="width: 550px">
			<span style="cursor: -webkit-grab;">
				<div style="margin: 5px; width: 550;">
					<button title="Скрытие меню" id="hideMeKnowledge" class="mainButton buttonHide">hide</button>
					<span class="mainButton smallbtn" style = "padding:5px;" title="Индикатор загрузки базы знаний" id="IndicatorLoadData">
						<span id="statInd" class="emoji">⏳</span>
					</span>
				</div>
				<div style="margin: 5px; width: 550px;">
					<input class="${exttheme}" placeholder="Слово для поиска" id="textToSearchSolution" style="border-radius: 20px; text-align: center; width: 300px; margin-left: 20%;"></input>
					<br>
					<div style="margin-top:5px;">
						<select class="${exttheme}" style="width: 40%; height: 20px; border-radius: 20px; text-align: center;" id="lessonTypeList">
							<option style="background-color:#69b930; text-align: center; color: white; font-weight: 700;" value="lType">Тип урока</option>
						</select>
						<select class="${exttheme}" style="width: 56%; height: 20px; border-radius: 20px; text-align: center;" id="CategoryNameList">
							<option style="background-color:DeepSkyBlue; text-align: center;  color: white; font-weight: 700;" value="CatType">Категория</option>
						</select>
					</div>
						<div style="margin: 5px; width: 550px; max-height: 600px; overflow-y: auto;" id="ProblemsName">
						</div>
						<div style="display: none; margin: 5px; width: 550px; position: absolute; top: -7px; left: 545px; background: #464451; color: bisque; padding: 5px; border: 2px solid white; min-height: 100px; max-height: 600px; overflow-y: auto;" id="ProblemsSolution">
						</div>
						<div style="margin: 5px; width: 550px; max-height: 600px; overflow-y: auto;" id="ProblemsNameFromSearch">
						</div>
				</div>
			</span>
	</span>
</div>`;

const wintKnowledge = createWindow('AF_Knowledge', 'winTopKnwoledge', 'winLeftKnowledge', win_Knowledge);

document.getElementById('IndicatorLoadData').onclick = async function () {
	let linkToIndic = document.getElementById('IndicatorLoadData');
	let statInd = document.getElementById('statInd');
	document.getElementById('ProblemsName').innerHTML = ''
	document.getElementById('ProblemsSolution').style.display = 'none'
	linkToIndic.classList.add('loadIndic')
	statInd.textContent = "⏳"
	document.getElementById('textToSearchSolution').value = ''
	document.getElementById('ProblemsNameFromSearch').textContent = ''
	document.getElementById('ProblemsSolution').style.display = 'none'
	getKnowData()
}

async function getKnowData() { // получаем из файла список версий моб. приложений
	let knowData;

	if (dropdown0) {
		while (dropdown0.options.length > 1) {
			dropdown0.remove(1);
		}

		while (dropdown1.options.length > 1) {
			dropdown1.remove(1);
		}
	}

	knowData = 'https://script.google.com/macros/s/AKfycbySlhuMPHSKHiI6Rhoyg797id3lbPg_zdeG_iBoEvYxwqlxkD4QizWm8OJDEucma7tGyg/exec'
	await fetch(knowData).then(r => r.json()).then(r => versionsdata = r)
	if (versionsdata && versionsdata.result.length > 0) {
		let linkToIndic = document.getElementById('IndicatorLoadData');
		let statInd = document.getElementById('statInd');
		knowDataContainer = versionsdata.result;
		statInd.textContent = "🟢"
		linkToIndic.classList.remove('loadIndic')
	}

	// Наполняем первый dropdown
	const uniqueValues0 = [...new Set(knowDataContainer.map(item => item[0]))];
	dropdown0 = document.getElementById("lessonTypeList");
	uniqueValues0.forEach(value => {
		const option = document.createElement("option");
		option.value = value;
		option.textContent = value;
		dropdown0.appendChild(option);
	});

	dropdown1 = document.getElementById("CategoryNameList");

	// Функция обновления второго dropdown на основе выбора в первом
	dropdown0.addEventListener("change", function () {
		const selectedValue = this.value;

		document.getElementById('textToSearchSolution').value = ''
		document.getElementById('ProblemsNameFromSearch').textContent = ''
		document.getElementById('ProblemsSolution').style.display = 'none'

		// Проверяем, существует ли опция "Категория"
		let catOptionExists = false;
		for (let i = 0; i < dropdown1.options.length; i++) {
			if (dropdown1.options[i].value === "CatType") {
				catOptionExists = true;
				break;
			}
		}

		// Если опции "Категория" нет, то добавляем её
		if (!catOptionExists) {
			const catOption = document.createElement("option");
			catOption.style = "background-color:DeepSkyBlue; text-align: center; color: white; font-weight: 700;";
			catOption.value = "CatType";
			catOption.textContent = "Категория";
			dropdown1.appendChild(catOption);
		}

		// Очищаем второй dropdown
		while (dropdown1.options.length > 1) {
			dropdown1.remove(1);
		}

		// Получаем значения для второго dropdown на основе выбранного значения в первом
		const secondDropdownValues = [...new Set(knowDataContainer
			.filter(item => item[0] === selectedValue)
			.map(item => item[1]))];

		// Наполняем второй dropdown
		secondDropdownValues.forEach(value => {
			const option = document.createElement("option");
			option.value = value;
			option.textContent = value;
			dropdown1.appendChild(option);
		});
	});

	const problemsDiv = document.getElementById("ProblemsName");

	dropdown1.addEventListener("change", function () {
		const selectedType = dropdown0.value;
		const selectedCategory = this.value;

		// Очистить div перед добавлением новых данных
		problemsDiv.innerHTML = '';

		// Найти соответствующие проблемы для выбранной категории
		const problems = knowDataContainer
			.filter(item => item[0] === selectedType && item[1] === selectedCategory)
			.map(item => item[2]);

		// Добавить каждую проблему в div

		problems.forEach((problem, index) => {
			const problemElem = document.createElement("div");
			problemElem.style = "background: lightsteelblue;   width: 96%;    border-radius: 10px;    text-align: center;    font-weight: 800; border-bottom: 1px solid black;";
			problemElem.setAttribute('name', 'exploreSolution');
			problemElem.textContent = problem;

			// Добавляем обработчик события клика
			problemElem.addEventListener('click', function () {
				// Получаем все элементы с именем exploreSolution
				const allProblemElems = document.querySelectorAll('[name="exploreSolution"]');

				// Удаляем класс active у всех элементов
				allProblemElems.forEach(elem => {
					elem.classList.remove("active");
				});

				// Добавляем класс active к текущему элементу
				this.classList.add("active");

				const solutionElem = document.getElementById("ProblemsSolution");
				solutionElem.style.display = ""; // показываем элемент
				// Ищем соответствующее решение
				const matchedData = knowDataContainer.find(item => item[0] === selectedType && item[1] === selectedCategory && item[2] === problem);
				if (matchedData) {
					solutionElem.innerHTML = matchedData[3]; // устанавливаем текст решения
				}
			});
			problemsDiv.appendChild(problemElem);
		});
	});

	// Получаем элементы DOM
	const searchInput = document.getElementById("textToSearchSolution");
	const resultsDiv = document.getElementById("ProblemsNameFromSearch");

	// Обработчик события input
	searchInput.addEventListener('input', function () {

		document.getElementById('ProblemsName').textContent = ''
		document.getElementById('lessonTypeList').children[0].selected = true
		document.getElementById('CategoryNameList').children[0].selected = true

		// Получаем введенный текст
		const query = this.value.toLowerCase();

		// Очищаем результаты
		resultsDiv.innerHTML = '';

		// Если поле ввода пусто, просто завершаем выполнение функции
		if (query.length === 0) return;

		// Фильтруем массив
		const filteredResults = knowDataContainer.filter(arrayItem => {
			return arrayItem[2].toLowerCase().includes(query);
		});

		// Выводим результаты
		for (let item of filteredResults) {
			const index = knowDataContainer.indexOf(item); // получаем индекс элемента в массиве knowDataContainer
			const div = document.createElement('div');
			div.style = "background: lightsteelblue; width: 96%; border-radius: 10px; text-align: center; font-weight: 800; border-bottom: 1px solid black;"
			div.setAttribute('name', 'foundToSolution');
			div.setAttribute('data-index', index); // сохраняем индекс в атрибуте data-index
			div.textContent = item[2];
			resultsDiv.appendChild(div);

			div.addEventListener('click', function () {
				// Получаем все элементы с именем foundToSolution
				const allFoundElems = document.querySelectorAll('[name="foundToSolution"]');

				// Удаляем класс active у всех элементов
				allFoundElems.forEach(elem => {
					elem.classList.remove("active");
				});

				// Добавляем класс active к текущему элементу
				this.classList.add("active");

				const solutionElem = document.getElementById("ProblemsSolution");
				solutionElem.style.display = ""; // показываем элемент
				const clickedIndex = +this.getAttribute('data-index'); // извлекаем индекс из атрибута data-index
				solutionElem.innerHTML = knowDataContainer[clickedIndex][3]; // устанавливаем текст решения
			});
		}
	});
}

function getknowledgeCenterButtonPress() {
	let linkToIndic = document.getElementById('IndicatorLoadData');
	let statInd = document.getElementById('statInd');

	if (document.getElementById('AF_Knowledge').style.display == "none") {
		document.getElementById('AF_Knowledge').style.display = ""
		document.getElementById('knowledgeCenter').classList.add('activeScriptBtn');
		linkToIndic.classList.add('loadIndic')
		statInd.textContent = "⏳"
		getKnowData()
	} else {
		let linkToIndic = document.getElementById('IndicatorLoadData');
		let statInd = document.getElementById('statInd');
		statInd.textContent = "🟢"
		linkToIndic.classList.remove('loadIndic')
		document.getElementById('AF_Knowledge').style.display = "none"
		document.getElementById('knowledgeCenter').classList.remove('activeScriptBtn');
		document.getElementById('ProblemsName').innerHTML = ''
		document.getElementById('ProblemsSolution').style.display = 'none'
	}
}

document.getElementById('hideMeKnowledge').onclick = function () {
	document.getElementById('AF_Knowledge').style.display = "none"
	document.getElementById('knowledgeCenter').classList.remove('activeScriptBtn');
	document.getElementById('ProblemsName').innerHTML = ''
	document.getElementById('ProblemsSolution').style.display = 'none'
}