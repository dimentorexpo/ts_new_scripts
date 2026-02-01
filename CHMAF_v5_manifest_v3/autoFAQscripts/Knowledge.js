// ===============================
// Knowledge Center — Clean Rewrite
// ===============================

// Глобальные переменные
let knowledgeIndex = new Map();
let knowDataContainer = [];
let dropdownLesson;
let dropdownCategory;

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

// Кэш DOM-элементов
const el = {
	win: document.getElementById('AF_Knowledge'),
	indicator: document.getElementById('IndicatorLoadData'),
	stat: document.getElementById('statInd'),
	search: document.getElementById('textToSearchSolution'),
	problems: document.getElementById('ProblemsName'),
	solution: document.getElementById('ProblemsSolution'),
	results: document.getElementById('ProblemsNameFromSearch'),
	lessonType: document.getElementById('lessonTypeList'),
	category: document.getElementById('CategoryNameList'),
	toggleBtn: document.getElementById('knowledgeCenter'),
	hideBtn: document.getElementById('hideMeKnowledge')
};

// ===============================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ===============================

function resetUI() {
	el.problems.innerHTML = '';
	el.results.innerHTML = '';
	el.solution.style.display = 'none';
	el.search.value = '';
}


function setLoadingState(isLoading) {
	if (isLoading) {
		el.indicator.classList.add('loadIndic');
		el.stat.textContent = '⏳';
	} else {
		el.indicator.classList.remove('loadIndic');
		el.stat.textContent = '🟢';
	}
}

function activate(elem, selector) {
	document.querySelectorAll(selector).forEach(e => e.classList.remove('active'));
	elem.classList.add('active');
}

function buildIndex() {
	knowledgeIndex.clear();
	knowDataContainer.forEach(item => {
		const key = `${item[0]}::${item[1]}`;
		if (!knowledgeIndex.has(key)) knowledgeIndex.set(key, []);
		knowledgeIndex.get(key).push(item);
	});
}

function fillDropdown(dropdown, values) {
	dropdown.length = 1; // оставить только первую опцию
	values.forEach(v => {
		const opt = document.createElement('option');
		opt.value = v;
		opt.textContent = v;
		dropdown.appendChild(opt);
	});
}

// ===============================
// ЗАГРУЗКА ДАННЫХ
// ===============================

async function getKnowData() {
	setLoadingState(true);
	resetUI();

	const url = 'https://script.google.com/macros/s/AKfycbySlhuMPHSKHiI6Rhoyg797id3lbPg_zdeG_iBoEvYxwqlxkD4QizWm8OJDEucma7tGyg/exec';

	const response = await fetch(url);
	const json = await response.json();
	knowDataContainer = json.result || [];

	buildIndex();

	// Заполняем первый dropdown
	const lessonTypes = [...new Set(knowDataContainer.map(i => i[0]))];
	fillDropdown(el.lessonType, lessonTypes);

	setLoadingState(false);
}

// ===============================
// ОБРАБОТЧИКИ DROPDOWN
// ===============================

el.lessonType.addEventListener('change', () => {
	resetUI();

	const selected = el.lessonType.value;
	if (selected === 'lType') return;

	const categories = [...new Set(
		knowDataContainer.filter(i => i[0] === selected).map(i => i[1])
	)];

	fillDropdown(el.category, categories);
});

el.category.addEventListener('change', () => {
	el.problems.innerHTML = '';
	el.solution.style.display = 'none';

	const type = el.lessonType.value;
	const cat = el.category.value;
	const key = `${type}::${cat}`;

	const items = knowledgeIndex.get(key) || [];

	items.forEach(item => {
		const div = document.createElement('div');
		div.className = 'problem-item';
		div.textContent = item[2];
		div.addEventListener('click', () => {
			activate(div, '[name="exploreSolution"]');
			el.solution.style.display = '';
			el.solution.innerHTML = item[3];
		});
		div.setAttribute('name', 'exploreSolution');
		el.problems.appendChild(div);
	});
});

// ===============================
// ПОИСК
// ===============================

el.search.addEventListener('input', () => {
	const q = el.search.value.trim().toLowerCase();
	el.results.innerHTML = '';
	el.problems.innerHTML = '';
	el.solution.style.display = 'none';
	el.lessonType.selectedIndex = 0;
	el.category.selectedIndex = 0;

	if (!q) return;

	const filtered = knowDataContainer.filter(i =>
		i[2].toLowerCase().includes(q)
	);

	filtered.forEach((item, idx) => {
		const div = document.createElement('div');
		div.className = 'problem-item';
		div.textContent = item[2];
		div.setAttribute('name', 'foundToSolution');
		div.addEventListener('click', () => {
			activate(div, '[name="foundToSolution"]');
			el.solution.style.display = '';
			el.solution.innerHTML = item[3];
		});
		el.results.appendChild(div);
	});
});

// ===============================
// ОКНО
// ===============================

function getknowledgeCenterButtonPress() {
	if (el.win.style.display === 'none') {
		el.win.style.display = '';

		if (el.toggleBtn) {
			el.toggleBtn.classList.add('activeScriptBtn');
		}

		getKnowData();
	} else {
		el.win.style.display = 'none';

		if (el.toggleBtn) {
			el.toggleBtn.classList.remove('activeScriptBtn');
		}

		resetUI();
		setLoadingState(false);
	}
}


el.hideBtn.addEventListener('click', () => {
	el.win.style.display = 'none';
	el.toggleBtn.classList.remove('activeScriptBtn');
	resetUI();
});
