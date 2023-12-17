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
        yesButton.onclick = function() {
            localStorage.setItem('girlyanda', '1');
            startgirlyand1();
            document.getElementById('NGgirlyand')[1].selected = true;
            modal.remove();
        };

        var noButton = document.createElement('button');
        noButton.classList.add('mainButton');
        noButton.style.width = '140px';
        noButton.style.marginLeft = '10px';
        noButton.innerText = 'Нет';
        noButton.onclick = function() {
            localStorage.setItem('girlyanda', '0');
            modal.remove();
        };

        modal.appendChild(yesButton);
        modal.appendChild(noButton);

        // Отображение модального окна
        document.body.appendChild(modal);
    }
}

