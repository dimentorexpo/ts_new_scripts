let tokenlog; // пустая переменная для функции logginerfortests подставляемая в body

var win_TestUsers = // описание окна тестовых пользователей
    `<div style="display: flex;">
        <span style="cursor: -webkit-grab;">
            <button id="sidcode" title="При клике ЛКМ генерирует ссылку логинер для входа в учетку с заранее сохраненным ID тестового ученика в настройках и копирует ее в буфер обмена. При клике ПКМ копирует в буфер обмена ID ученика, может пригодиться в админке создания тестовых уроков." class="teststudteach">👨‍🎓</button>
            <button id="tidcode" title="При клике ЛКМ генерирует ссылку логинер для входа в учетку с заранее сохраненным ID тестового преподавателя в настройках и копирует ее в буфер обмена. При клике ПКМ копирует в буфер обмена ID преподавателя, может пригодиться в админке создания тестовых уроков." class="teststudteach">👽</button>
            <button id="TestRooms" class="teststudteach" title="Открыть окно создания тестовых уроков">🎲</button>
            <button id="pushToTalk" title="Нажми и сразу произноси команду для выполнения. Список команд: \n 1) ту - открывает админку для создания ТУ по англ языку \n 2) платёж - открывает админку поиска платежа \n 3) CRM - открывает CRM обратившегося пользователя \n 4) ТТ - открывает Timetable (произносить лучше тэтэ) \n 5) админка - открывает общую админку по пользователю 6) тшу / тшп - просмотр ТШ по У или П которые обратились \n 7) трамвай - открывает TRM 2.0"" style="cursor: pointer; margin: 5px;">🎤</button>
            <div id="voicetext" style="color: bisque; width: 110px; text-align: center;"></div>
            <div id="addInfoUser" style="color: white; text-align: center; cursor: -webkit-grab;"></div>
        </span>
    </div>
    `;
			
if (localStorage.getItem('winTopTestUsers') == null) {
    localStorage.setItem('winTopTestUsers', '120');
    localStorage.setItem('winLeftTestUsers', '295');
}


let TestUsersdiv = document.createElement('div'); // добавляем окно тестовых поьзователей
document.body.append(TestUsersdiv);
TestUsersdiv.style = 'min-height: 20px; max-height: 750px; min-width: 35px; max-width: 370px; background: #464451; top: ' + localStorage.getItem('winTopTestUsers') + 'px; left: ' + localStorage.getItem('winLeftTestUsers') + 'px; font-size: 14px; z-index: 12500; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
TestUsersdiv.setAttribute('id', 'TestUsers');
TestUsersdiv.classList = 'onlyfortp';
TestUsersdiv.innerHTML = win_TestUsers;

document.getElementById('TestRooms').onclick = getTestRoomsButtonPress;

setDisplayStyle(TestUsersdiv, localStorage.getItem('disablelpmwindow') === '1' ? 'none' : '');

let addInfoUser = document.getElementById('addInfoUser');

TestUsersdiv.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = TestUsersdiv.offsetLeft;
    let elemTop = TestUsersdiv.offsetTop;

    function onMouseMove(event) {
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      TestUsersdiv.style.left = (elemLeft + deltaX) + "px";
      TestUsersdiv.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopTestUsers', String(elemTop + deltaY));
      localStorage.setItem('winLeftTestUsers', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};
 // прекращение изменения позиции окна тестовых поьзователей

let btnsid = document.getElementById('sidcode');
let btntid = document.getElementById('tidcode');
btnsid.addEventListener("click", (event) => { // копирует в буфер логиннер для У
    let teststudid = localStorage.getItem('test_stud');
    if (teststudid != null || teststudid != '') {
		
		chrome.runtime.sendMessage({ action: 'getLoginer', userid: teststudid  }, function(userLoginer) {
			let matchforloglink;
			matchforloglink = userLoginer.match(/("https:\/\/id.skyeng.ru\/auth\/login-link\/\w+.*?")/gm);
			matchforloglink = matchforloglink[matchforloglink.length - 1].split('"');
			copyToClipboard(matchforloglink[1])
		})
		
		
        document.getElementById('sidcode').classList.add('active');
        setTimeout(function () { document.getElementById('sidcode').classList.remove('active') }, 1000);
    } else alert("Введите ID тестового ученика в настройках ⚙");
});

btnsid.addEventListener("contextmenu", (event) => { // копирует в буфер id У
    event.preventDefault();
    let teststudid = localStorage.getItem('test_stud');
    if (teststudid != null || teststudid != '') {
        copyToClipboard(teststudid)
        document.getElementById('sidcode').classList.add('active');
        setTimeout(function () { document.getElementById('sidcode').classList.remove('active') }, 1000);
    } else alert("Введите ID тестового ученика в настройках ⚙");
});

btntid.addEventListener("click", (event) => { // копирует в буфер логиннер для П
    let testteachid = localStorage.getItem('test_teach');
    if (testteachid != null || testteachid != '') {
		chrome.runtime.sendMessage({ action: 'getLoginer', userid: testteachid  }, function(userLoginer) {
			let matchforloglink;
			matchforloglink = userLoginer.match(/("https:\/\/id.skyeng.ru\/auth\/login-link\/\w+.*?")/gm);
			matchforloglink = matchforloglink[matchforloglink.length - 1].split('"');
			copyToClipboard(matchforloglink[1])
		})
		
        document.getElementById('tidcode').classList.add('active');
        setTimeout(function () { document.getElementById('tidcode').classList.remove('active') }, 1000);
    } else alert("Введите ID тестового преподавателя в настройках ⚙");
});

btntid.addEventListener("contextmenu", (event) => { // копирует в буфер id П
    event.preventDefault();
    let testteachid = localStorage.getItem('test_teach');
    if (testteachid != null || testteachid != '') {
        copyToClipboard(testteachid)
        document.getElementById('tidcode').classList.add('active');
        setTimeout(function () { document.getElementById('tidcode').classList.remove('active') }, 1000);
    } else alert("Введите ID тестового преподавателя в настройках ⚙");
});
