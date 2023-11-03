var win_GrList =  // описание элементов окна Списка группы
    `<div style="display: flex; width: 450px;">
        <span style="width: 450px">
                <span style="cursor: -webkit-grab;">
                        <div style="margin: 5px; width: 400;" id="grlistdata">
                                <button id="hideList" style="width:50px; background: #228B22;">hide</button>
                        </div>
						<div>
                        <input id="idgrouptolist" placeholder="ID группы" title="Введите ID группы для получения списка учеников" autocomplete="off" type="text" style="text-align: center; width: 80px; color: black;margin-left:5px; position:relative; left:30%;">
							<button title="Запуск получения списка учеников группы" id="getidgrouptolist" style="position:relative; left:30%;">Get info</button>
						</div>
				</span>
						<div id="grlstdiv">
							 <br>
							 <p id="grlistinfo" style="margin-left: 5px; color:bisque;"></span>
							 <br>
						</div>
        </span>
</div>`;

if (localStorage.getItem('winTopGrList') == null) {  // начальное положение окна списка группы
    localStorage.setItem('winTopGrList', '120');
    localStorage.setItem('winLeftGrList', '295');
}

let wintGrList = document.createElement('div'); // создание окна Список группы
document.body.append(wintGrList);
wintGrList.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopGrList') + 'px; left: ' + localStorage.getItem('winLeftGrList') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintGrList.style.display = 'none';
wintGrList.setAttribute('id', 'AF_GrList');
wintGrList.innerHTML = win_GrList;

wintGrList.onmousedown = function(event) {
  if (checkelementtype(event)) {
    let startX = event.clientX;
    let startY = event.clientY;
    let elemLeft = wintGrList.offsetLeft;
    let elemTop = wintGrList.offsetTop;

    function onMouseMove(event) {
		if (!(event.buttons & 1)) {
			onMouseUp();
			return;
		  }
      let deltaX = event.clientX - startX;
      let deltaY = event.clientY - startY;

      wintGrList.style.left = (elemLeft + deltaX) + "px";
      wintGrList.style.top = (elemTop + deltaY) + "px";

      localStorage.setItem('winTopTaskCreate', String(elemTop + deltaY));
      localStorage.setItem('winLeftTaskCreate', String(elemLeft + deltaX));
    }

    document.addEventListener('mousemove', onMouseMove);

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mouseup', onMouseUp);
  }
};


document.getElementById('AF_GrList').ondblclick = function (a) { // скрытие окна Список группы по двойному клику
    if (checkelementtype(a)) { document.getElementById('AF_GrList').style.display = 'none'; }
}



function getGrListDataButtonPress() {
	        if (document.getElementById('AF_GrList').style.display == '') {
				document.getElementById('AF_GrList').style.display = 'none';
			} else {
				document.getElementById('AF_GrList').style.display = '';
			}
}
    let grdata = [];
    let responsegrdata;
    document.getElementById('getidgrouptolist').addEventListener('click', async function () {
        let dataarr = [];
        document.getElementById('grlistinfo').innerHTML = "Загрузка...";
        let tempgrid = document.getElementById('idgrouptolist').value;
        tempgrid = tempgrid.trim();
		
		// Отправляем сообщение с запросом на выполнение из background.js и передаем переменную tmp
		chrome.runtime.sendMessage({ action: 'getGroupList', tmp: tempgrid }, function(response) {
		  // Обработка ответа
		  console.log(response.data);
		  
		         for (let i = 0; i < response.data.students.length; i++) {
                    dataarr += [i + 1] + "." + '<span class="grstdcrm" style="cursor:pointer" title="открывает профиль в CRM">ℹID У:</span>' + response.data.students[i].userId + " ID услуги: " + response.data.students[i].educationServiceId + " " + '<span class="getstname" style="cursor:pointer" title="Узнать имя и фамилию ученика, если раз нажали не появилось нажмите через секунду второй раз, быстро на все глаза не нажимайте, иначе получите некорректную информацию">👁‍🗨</span>' + '<span class="stname"></span>' + '<br>';
                }
				
				document.getElementById('grlistinfo').innerHTML = !response.data.teachers ? dataarr : dataarr + '<br>ID П ' + response.data.teachers[0].userId;
				
				let arstname = document.querySelectorAll('.stname');
                let getstnamearr = document.querySelectorAll('.getstname');
                for (let f = 0; f < getstnamearr.length; f++) {
                    getstnamearr[f].addEventListener('click', function () {

						chrome.runtime.sendMessage({ action: 'getUserCrmName', sid: response.data.students[f].userId }, function(response) {
							arstname[f].innerHTML = response.data.name + " " + response.data.surname;
						})
                    })
                }

                let grstdcrmarr = document.querySelectorAll('.grstdcrm');
                for (let f = 0; f < grstdcrmarr.length; f++) {
                    grstdcrmarr[f].addEventListener('click', function () {
                        window.open("https://crm2.skyeng.ru/persons/" + response.data.students[f].userId)
                    })
                }
				
				dataarr = ''

		});

    }) // end of func getidgrouptolist

    document.getElementById('hideList').addEventListener('click', function () { // скрытие окна Список группы
        if (document.getElementById('AF_GrList').style.display == '') {
            document.getElementById('AF_GrList').style.display = 'none';
            document.getElementById('grlistinfo').innerText = "";
            document.getElementById('idgrouptolist').value = "";
        }
    })