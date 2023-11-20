var win_addMenu = `<div style="display: flex;">
					<span style="cursor: -webkit-grab;">
						<div>
							<button class="commonbtn" style="min-width:125px" id="hidemainmenu">h i d e </button>
						<div>

						<div id="mainmenu" style="display:block">
							<button id="openchataddmenu" style="margin: 5px 0px 0px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">💬</span> ChatMenu</button>
							<br>
							<button id="openlesinfomenu" style="margin: 5px 5px 0px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">ℹ</span> LessonInfo</button>
							<br>
							<button id="openstudentsmenu" style="margin: 5px 0px 0px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">👨‍🎓</span> Students</button>
							<br>
							<button id="openexercisesmenu" style="margin: 5px 0px 0px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">🎯</span> Exercises</button>
							<br>
							<button id="VocabularyMenu" title = "Открывает  меню для роаботы со словарем" style="margin: 5px 5px 5px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">📚</span> Vocabulary</button>
						</div>

						<div id="studentsmenu" style="display:none">
							<button id="lkpskysmart" style="margin: 5px 0px 0px 5px; height: 30px; min-width: 105px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">🎓</span> Smartroom</button>
							<br>
							<button id="lkpadult" style="margin: 5px 5px 0px 5px; height: 30px; min-width: 105px; padding-top:8px;" class="commonbtn dobig"> <span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">🅰</span> Aduls</button>
							<br>
							<button id="backtomainfromstudmenu" style="margin: 5px 0px 5px 5px; height: 30px; min-width: 105px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">🔙</span> Back</button>
						</div>

						<div id="exercisesmenu" style="display:none">
							<button id="exercisekysmart" style="margin: 5px 0px 0px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">🎓</span> Smartroom</button>
							<br>
							<button id="exercisesttc" style="margin: 5px 5px 0px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"> <span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">👽</span> TTC</button>
							<br>
							<button id="exercisesComplect" style="margin: 5px 5px 0px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"> <span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">🛍</span> Комплектации</button>
							<br>
							<button id="backmainmenufromexercises" style="margin: 5px 0px 5px 5px; height: 30px; min-width: 125px; padding-top:8px;" class="commonbtn dobig"><span style="font-size:18px;float:left; position:relative; top:-5px; left:0px;">🔙</span> Back</button>
						</div>

					</span>
				   </div>`;

if (localStorage.getItem('winTopAddMenu') == null) { //additional menu
    localStorage.setItem('winTopAddMenu', '120');
    localStorage.setItem('winLeftAddMenu', '295');
}

let wintAddMenu = document.createElement('div');
document.body.append(wintAddMenu);
wintAddMenu.className = 'wintInitialize'
wintAddMenu.style = 'display:none;  top: ' + localStorage.getItem('winTopAddMenu') + 'px; left: ' + localStorage.getItem('winLeftAddMenu') + 'px;';
wintAddMenu.setAttribute('id', 'AFMS_addMenu');
wintAddMenu.innerHTML = win_addMenu;


//aditional menu

var listenerAddMenu = function (e, a) {
    wintAddMenu.style.left = Number(e.clientX - myX9999) + "px";
    wintAddMenu.style.top = Number(e.clientY - myY9999) + "px";
    localStorage.setItem('winTopAddMenu', String(Number(e.clientY - myY9999)));
    localStorage.setItem('winLeftAddMenu', String(Number(e.clientX - myX9999)));
};
wintAddMenu.onmousedown = function (a) {
    if (checkelementt(a)) {
        window.myX9999 = a.layerX;
        window.myY9999 = a.layerY;
        document.addEventListener('mousemove', listenerAddMenu);
    }
}
wintAddMenu.onmouseup = function () { document.removeEventListener('mousemove', listenerAddMenu); }

// end aditional menu

document.querySelector('body').addEventListener('dblclick', (event) => {
    let tags = ["INPUT", "TEXTAREA", "BUTTON", "H1", "H2", "H3", "UL", "LI", "VIM-WORD", "P", "SPAN"];
    if (!tags.includes(event.target.tagName)) {
        wintAddMenu.style.display = "block";
        wintAddMenu.style.left = (event.clientX - 120) + "px";
        wintAddMenu.style.top = event.clientY + "px";

        token = Object.fromEntries(document.cookie.split(/; */).map(c => {
            const [key, ...v] = c.split('=');
            return [key, decodeURIComponent(v.join('='))];
        }));
        console.log(token)
    }
});

document.querySelector('body').addEventListener('click', (event) => {
    if (!wintAddMenu.contains(event.target)) {
        wintAddMenu.style.display = "none";
    }
});

document.getElementById('hidemainmenu').onclick = function () {
        wintAddMenu.style.display = 'none';
}

document.onkeydown = function(event) {
    if ((event.altKey && event.code == 'Numpad0') || (event.altKey && event.code == 'Digit0')) {
        if (wintAddMenu.style.display == 'none') {
            wintAddMenu.style.display = '';
            token = Object.fromEntries(document.cookie.split(/; */).map(c => {
                const [key, ...v] = c.split('=');
                return [key, decodeURIComponent(v.join('='))];
            }));
            console.log(token);
        } else {
            wintAddMenu.style.display = 'none';
        }
    }
}

document.getElementById('openstudentsmenu').onclick = function () {
    document.getElementById('mainmenu').style.display = 'none'
    document.getElementById('studentsmenu').style.display = ''
}
document.getElementById('openexercisesmenu').onclick = function () {
    document.getElementById('mainmenu').style.display = 'none'
    document.getElementById('exercisesmenu').style.display = ''
}

document.getElementById('backtomainfromstudmenu').onclick = function () {
    document.getElementById('mainmenu').style.display = ''
    document.getElementById('studentsmenu').style.display = 'none'
}

document.getElementById('backmainmenufromexercises').onclick = function () {
    document.getElementById('mainmenu').style.display = ''
    document.getElementById('exercisesmenu').style.display = 'none'
}

document.getElementById('openchataddmenu').onclick = OpenAddChatMenu