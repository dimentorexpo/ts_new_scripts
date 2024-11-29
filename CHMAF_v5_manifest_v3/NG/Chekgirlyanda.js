const checkgirlyanda = `
    <div>
        <label style="color:bisque; margin: 10px;">Создать новогоднее настроение ?</label>
        <select class="${exttheme}" id="NGgirlyand" style="text-align: center; width: 240px; height: 26px; margin-left: 7px;">
            <option value="0">Нет</option>
            <option value="1">Гирлянда</option>
            <option value="2">Елочные игрушки</option>
        </select>
        <br>
        <label style="color:bisque; margin-left: 5px;"><input type="checkbox" id="checksnow">Из курсора идет снег</label>
        <label style="color:bisque; margin-left: 5px;"><input type="checkbox" id="checkelka">Показывать Ёлку</label>
    </div>
`;

function checkloadsettings() {
    const settingsis = document.getElementById('set_bar');

    if (settingsis) {
        const girlyandaset = document.createElement('div');
        girlyandaset.innerHTML = checkgirlyanda; // Убедитесь, что переменная checkgirlyanda определена и содержит необходимый HTML
        settingsis.append(girlyandaset);

        const savedValuegirl = localStorage.getItem('girlyanda');
        const girlyandSelect = document.getElementById('NGgirlyand');
        if (girlyandSelect) {
            if (savedValuegirl !== null) {
                girlyandSelect.value = savedValuegirl;
            }
            girlyandSelect.addEventListener('change', handleGirlyandChange);
        }
        const savedValuesnow = localStorage.getItem('snowcursor');
        const snowSelect = document.getElementById('checksnow');
        if (snowSelect) {
            if (savedValuesnow == 0) {
                snowSelect.checked = false;
            } else {
                snowSelect.checked = true;
            }
            snowSelect.addEventListener('change', handleSnowChange);
        }
        const savedValueelka = localStorage.getItem('AF_elka');
        const ElkaSelect = document.getElementById('checkelka');
        if (ElkaSelect) {
            if (savedValueelka == 0) {
                ElkaSelect.checked = false;
            } else {
                ElkaSelect.checked = true;
            }
            ElkaSelect.addEventListener('change', handleelkaChange);
        }
    } else {
        setTimeout(checkloadsettings, 1000);
    }
}

checkloadsettings();

function checkAndSetGirlyanda() {
    if (localStorage.getItem('girlyanda') === null) {
        var modal = document.createElement('div');
        modal.classList.add('extwindows');
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.padding = '20px';
        modal.style.width = '350px';

        // Первая строка текста
        var modalText1 = document.createElement('p');
        modalText1.style.color = 'rgb(121 175 21)';
        modalText1.style.fontSize = '16px';
        modalText1.innerText = "Хотите ли вы включить новогоднее настроение?";
        modal.appendChild(modalText1);

        // Вторая строка текста
        var modalText2 = document.createElement('p');
        modalText2.style.color = 'bisque';
        modalText2.innerText = "(в дальнейшем его можно включить/отключить в настройках расширения)";
        modal.appendChild(modalText2);

        var yesButton = document.createElement('button');
        yesButton.classList.add('mainButton');
        yesButton.style.width = '140px';
        yesButton.innerText = 'Да';
        yesButton.onclick = function () {
            localStorage.setItem('snowcursor', '1');
            localStorage.setItem('girlyanda', '1');
            localStorage.setItem('AF_elka', '1');
            startgirlyand1();
            elkaadd()
            document.getElementById('NGgirlyand')[1].selected = true;
            modal.remove();
        };

        var noButton = document.createElement('button');
        noButton.classList.add('mainButton');
        noButton.style.width = '140px';
        noButton.style.marginLeft = '10px';
        noButton.innerText = 'Нет';
        noButton.onclick = function () {
            localStorage.setItem('girlyanda', '0');
            localStorage.setItem('snowcursor', '0');
            localStorage.setItem('AF_elka', '0');
            modal.remove();
        };

        modal.appendChild(yesButton);
        modal.appendChild(noButton);

        // Отображение модального окна
        document.body.appendChild(modal);
    }
}

function handleGirlyandChange() {
    const girlyandSelect = document.getElementById('NGgirlyand');
    const selectedValue = girlyandSelect.value;

    localStorage.setItem('girlyanda', selectedValue);

    if (selectedValue === "0") {
        stopgirlyand1();
        stopgirlyand2();
    } else if (selectedValue === "1") {
        stopgirlyand2();
        startgirlyand1();
    } else if (selectedValue === "2") {
        stopgirlyand1();
        startgirlyand2();
    }
}

function handleSnowChange() {
    const snowSelect = document.getElementById('checksnow');

    if (!snowSelect.checked) {
        localStorage.setItem('snowcursor', '0');
    } else {
        localStorage.setItem('snowcursor', '1');
    }
}

function handleelkaChange() {
    const snowSelect = document.getElementById('checkelka');

    if (!snowSelect.checked) {
        localStorage.setItem('AF_elka', '0');
        elkaremove()
    } else {
        localStorage.setItem('AF_elka', '1');
        elkaadd()
    }
}

if (localStorage.getItem('snowcursor') == '1') {
    (function (k, c) {
        function y() {
            var b; if (r !== v || s !== w) for (v = r, w = s, b = 0; b < x; b++)if (!l[b]) { 
                h[b].style.left = (e[b] = r) + "px"; 
                h[b].style.top = (f[b] = s) + "px"; 
                h[b].style.clip = "rect(2px, 5px, 5px, 2px)"; 
                h[b].style.visibility = "visible"; 
                l[b] = 110; 
                break 
            } 
            for (b = 0; b < x; b++) {
                if (l[b]) {
                    var a = b;

                    if (--l[a] === 25) {
                        h[a].style.clip = "rect(1px, 5px, 3px, 2px)";
                    }

                    if (l[a]) {
                        f[a] += 1 + 3 * Math.random();
                        if (f[a] > n - 40) {
                            h[a].style.visibility = "hidden";
                            l[a] = 0;
                            continue;
                        }

                        if (f[a] < n + g) {
                            h[a].style.top = f[a] + "px";
                            var horizontalMove = (a % 5 - 2) / 5;
                            if (e[a] > r - 60) {
                                horizontalMove = Math.min(horizontalMove, 0);
                            }
                            e[a] += horizontalMove;
                            h[a].style.left = e[a] + "px";
                        } else {
                            h[a].style.visibility = "hidden";
                            l[a] = 0;
                        }
                    } else {
                        m[a] = 50;
                        d[a].style.top = (p[a] = f[a]) + "px";
                        d[a].style.left = (t[a] = e[a]) + "px";
                        d[a].style.width = "2px";
                        d[a].style.height = "2px";
                        h[a].style.visibility = "hidden";
                        d[a].style.visibility = "visible";
                    }
                }

                if (m[b]) {
                    var a = b;
                    if (--m[a] === 25) {
                        d[a].style.width = "1px";
                        d[a].style.height = "1px";
                    }

                    if (m[a]) {
                        p[a] += 1 + 3 * Math.random();
                        if (p[a] < n + g) {
                            d[a].style.top = p[a] + "px";
                            t[a] += (a % 5 - 2) / 5;
                            d[a].style.left = t[a] + "px";
                        } else {
                            d[a].style.visibility = "hidden";
                            m[a] = 0;
                        }
                    } else {
                        d[a].style.visibility = "hidden";
                    }
                }
            } k.setTimeout(y, 50)
        } 
        function z() {
            if (typeof window.innerWidth === 'number') {
                n = window.innerHeight - 40; 
                r = window.innerWidth - 50;  
            } else if (document.documentElement && document.documentElement.clientWidth) {
                n = document.documentElement.clientHeight - 40; 
                r = document.documentElement.clientWidth - 50;  
            } else if (document.body.clientWidth) {
                n = document.body.clientHeight - 40; 
                r = document.body.clientWidth - 50;  
            }
        } 
        function u(b, a) { 
            var d = c.createElement("div"); 
            d.style.position = "absolute"; 
            d.style.height = b + "px"; 
            d.style.width = a + "px"; 
            d.style.overflow = "hidden"; 
            d.style.backgroundColor = A; 
            d.style.zIndex = "2147483647"; 
            return d 
        } 
        var A = "#00BFFF", x = 150, v = 600, w = 300, r = v, s = w, n = 600, q = 0, g = q, d = [], h = [], l = [], e = [], f = [], t = [], p = [], m = [], 

        B = k.setInterval(function () {
            if ("complete" === c.readyState) {
                if (c.getElementById) {
                    var b = 0, a, f, g, e; 
                    e = c.createElement("div"); 
                    c.body.appendChild(e);
                    e.setAttribute("class", "snowcursor"); 
                    e.style.position = "fixed";  // Фиксированная позиция
                    e.style.pointerEvents = "none"; // Отключение взаимодействия
                    e.style.top = 0; 
                    e.style.left = 0; 
                    e.style.width = "100vw"; 
                    e.style.height = "100vh"; 
                    for (b = 0; b < x; b++)
                        a = u(3, 3), 
                        a.style.visibility = "hidden", 
                        e.appendChild(d[b] = a), 
                        l[b] = 0, 
                        m[b] = 0, 
                        a = u(5, 5), 
                        a.style.backgroundColor = "transparent", 
                        a.style.visibility = "hidden", 
                        f = u(1, 5), 
                        g = u(5, 1), 
                        a.appendChild(f), 
                        a.appendChild(g), 
                        f.style.top = "3px", 
                        f.style.left = "0px", 
                        g.style.top = "0px", 
                        g.style.left = "3px", 
                        e.appendChild(h[b] = a); 
                    z(); y()
                } 
                k.clearInterval(B)
            }
        }, 100); 
        c.onmousemove = function (b) {
            "number" === typeof k.pageYOffset ? (g = k.pageYOffset, q = k.pageXOffset) : c.body.scrollTop || c.body.scrollLeft ?
                (g = c.body.scrollTop, q = c.body.scrollLeft) : c.documentElement && (c.documentElement.scrollTop || c.documentElement.scrollLeft) ? (q = c.documentElement.scrollLeft, g = c.documentElement.scrollTop) : q = g = 0; 
            s = "undefined" !== typeof b ? b.pageY : event.clientY; 
            r = "undefined" !== typeof b ? b.pageX : event.clientX
        }; 
        k.onresize = z
    })(window, document);
}


if (localStorage.getItem('AF_elka') == '1') {
    elkaadd()
}

var slejeniezaelkoy; // Переменная для хранения экземпляра MutationObserver

var slejeniezaelkoy; // Глобальная переменная для хранения экземпляра MutationObserver

function elkaadd() {
    // Проверяем, существует ли элемент app-sider
    var appSider = document.getElementsByClassName('app-sider')[0];
    if (appSider) {
        addElka(appSider);
    } else {
        // Если элемента пока нет, создаем новый MutationObserver для отслеживания его появления
        var observerForAppSider = new MutationObserver(function(mutations, observer) {
            appSider = document.getElementsByClassName('app-sider')[0];
            if (appSider) {
                observer.disconnect(); // Отключаем наблюдение, когда нашли элемент
                addElka(appSider);
            }
        });

        observerForAppSider.observe(document.body, { childList: true, subtree: true });
    }
}

function addElka(appSider) {
    var img = document.createElement('img');
    img.src = `chrome-extension://${editorExtensionId}/NG/Elka.gif`;
    img.setAttribute('id', 'AF_elka');
    img.style.zIndex = '1250000';
    img.style.position = 'fixed';
    img.style.bottom = '10px';
    img.style.opacity = '0.5';
    img.style.maxHeight = '200px';
    img.style.pointerEvents = 'none';

    document.body.appendChild(img);

    function adjustImagePosition() {
        var appSiderWidth = appSider.offsetWidth;
        var newLeft = appSiderWidth + 5; // Прибавляем 5 пикселей к ширине
        img.style.left = newLeft + 'px'; // Применяем новое значение left
    }

    // Начальная настройка позиции
    adjustImagePosition();

    // Создаем экземпляр MutationObserver для слежения за изменениями в app-sider
    slejeniezaelkoy = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'style') {
                setTimeout(adjustImagePosition,500);
            }
        });
    });

    // Настройка и запуск слежения
    var config = { attributes: true };
    slejeniezaelkoy.observe(appSider, config);
}

function elkaremove() {
    let AFelka = document.getElementById('AF_elka');
    if (AFelka) {
        AFelka.remove();
        // Отключаем наблюдение, если наблюдатель был инициализирован
        if (slejeniezaelkoy) {
            slejeniezaelkoy.disconnect();
        }
    }
}