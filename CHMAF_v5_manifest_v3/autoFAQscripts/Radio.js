let audioListItems;
var win_Radio =  // описание элементов окна радио
    `<div style="display: flex; width: 625px;">
    <span style="width: 625px">
        <span style="cursor: -webkit-grab;">
            <div style="margin: 5px; width: 625;" id="links_1str">
                <button class="mainButton buttonHide" title="Скрытие меню" id="hideMeRadio">hide</button>
                <button class="mainButton" class="rotateDisc" style="margin-left:30%">📀</button>
                <span style="color:bisque">Play'O'Neer</span>
                <button class="mainButton" class="rotateDisc">📀</button>
            </div>
            <div id="audioPlayer" class="mainplayer">
                <div id="audioControls">
                    <input type="text" id="audioUrl" style="text-align: center; border-radius: 10px; color:black;"
                        placeholder="Enter Radio URL">
                    <input type="text" id="audioName" style="text-align: center; border-radius: 10px; width:120px; color:black;"
                        placeholder="Enter Radio name">
                    <button class="mainButton" id="addAudio">➕</button>
                    <button class="mainButton" id="playAudio">▶</button>
                    <button class="mainButton" id="pauseAudio">⏸</button>
                    <input id="changeRadioVolume" min="0" max="1" value="1.0" step="0.11" type="range">
                    <button class="mainButton" id="muteAudio">🔇Mute</button>
                </div>
                <ol id="audioList" style="width:570px;"></ol>
                <audio id="player"></audio>
            </div>
        </span>
</span>
</div>`;

if (localStorage.getItem('winTopRadio') == null) { // началоное положение окна радио (если не задано ранее)
    localStorage.setItem('winTopRadio', '120');
    localStorage.setItem('winLeftRadio', '295');
}

let wintRadio = document.createElement('div'); // создание окна радио
document.body.append(wintRadio);
wintRadio.style = 'min-height: 25px; min-width: 65px; background: #464451; top: ' + localStorage.getItem('winTopRadio') + 'px; left: ' + localStorage.getItem('winLeftRadio') + 'px; font-size: 14px; z-index: 10000; position: fixed; border: 1px solid rgb(56, 56, 56); color: black;';
wintRadio.style.display = 'none';
wintRadio.setAttribute('id', 'AF_Radio');
wintRadio.innerHTML = win_Radio;

wintRadio.onmousedown = function (event) {
    if (checkelementtype(event)) {
        let startX = event.clientX;
        let startY = event.clientY;
        let elemLeft = wintRadio.offsetLeft;
        let elemTop = wintRadio.offsetTop;

        function onMouseMove(event) {
            let deltaX = event.clientX - startX;
            let deltaY = event.clientY - startY;

            wintRadio.style.left = (elemLeft + deltaX) + "px";
            wintRadio.style.top = (elemTop + deltaY) + "px";

            localStorage.setItem('winTopRadio', String(elemTop + deltaY));
            localStorage.setItem('winLeftRadio', String(elemLeft + deltaX));
        }

        document.addEventListener('mousemove', onMouseMove);

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mouseup', onMouseUp);
    }
};
// прекращение изменения позиции окна радио

let audioUrls = JSON.parse(localStorage.getItem("audioUrls")) || [];
let audioNames = JSON.parse(localStorage.getItem("audioNames")) || [];

let audioPlayer = document.getElementById("audioPlayer");
let audioUrl = document.getElementById("audioUrl");
let audioName = document.getElementById("audioName");
let addAudio = document.getElementById("addAudio");
let playAudio = document.getElementById("playAudio");
let pauseAudio = document.getElementById("pauseAudio");
let audioList = document.getElementById("audioList");
let player = document.getElementById("player");
let volume = document.getElementById("volume");

if (localStorage.getItem("volume")) {
    player.volume = localStorage.getItem("volume");
}

function createAudioElement(url, name) {
    let newAudio = document.createElement("li");
    newAudio.style = "cursor:pointer";
    newAudio.setAttribute("name", "radiolist")
    newAudio.classList = 'radiolist'
    let deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "❌";
    deleteBtn.style = "margin: 5px; width:30px; border: 1px solid darkslategrey; cursor:pointer; border-radius: 10px;";
    deleteBtn.classList.add('deleteline', 'mainButton')
    newAudio.appendChild(deleteBtn);
    newAudio.appendChild(document.createTextNode(name));
    newAudio.addEventListener("click", function () {
        player.src = url;
        player.play();
    });

    deleteBtn.addEventListener("click", function () {
        let question = confirm("Вы уверены, что хотите удалить эту позицию из списка?")
        if (question) {
            const index = audioUrls.indexOf(url);
            audioUrls.splice(index, 1);
            audioNames.splice(index, 1);
            localStorage.setItem("audioUrls", JSON.stringify(audioUrls));
            localStorage.setItem("audioNames", JSON.stringify(audioNames));
            audioList.removeChild(newAudio);
        } 
    });
    return newAudio;
}

function getradioPlayerButtonPress() {
    if (document.getElementById('AF_Radio').style.display == 'none') {
        document.getElementById('AF_Radio').style.display = ''
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    } else {
        document.getElementById('AF_Radio').style.display = 'none'
        document.getElementById('idmymenu').style.display = 'none'
        document.getElementById('MainMenuBtn').classList.remove('activeScriptBtn')
    }
}

addAudio.addEventListener("click", function () {
    let url = audioUrl.value;
    let name = audioName.value;
    audioUrls.push(url);
    audioNames.push(name);
    localStorage.setItem("audioUrls", JSON.stringify(audioUrls));
    localStorage.setItem("audioNames", JSON.stringify(audioNames));
    audioList.appendChild(createAudioElement(url, name));
    audioUrl.value = "";
    audioName.value = "";
    addClickListener();
});

if (audioUrls.length > 0) {
    for (let i = 0; i < audioUrls.length; i++) {
        audioList.appendChild(createAudioElement(audioUrls[i], audioNames[i]));
        addClickListener();
    }
}

playAudio.addEventListener("click", function () {
    player.play();
});

pauseAudio.addEventListener("click", function () {
    player.pause();
});

player.addEventListener("volumechange", function () {
    localStorage.setItem("volume", player.volume);
});

function addClickListener() {
    audioListItems = document.getElementsByName('radiolist');
    for (let i = 0; i < audioListItems.length; i++) {
        audioListItems[i].addEventListener('click', function () {
            for (let j = 0; j < audioListItems.length; j++) {
                audioListItems[j].classList.remove('active');
            }
            this.classList.toggle('active');
        });
    }
}

function muteorunmute() {
    if (player.muted) {
        player.muted = false;
        muteAudio.innerHTML = "🔇Mute";
        localStorage.setItem("volume", audioPlayer.volume);
    } else {
        player.muted = true;
        muteAudio.innerHTML = "📢Unmute";
    }
}

document.getElementById('hideMeRadio').onclick = function () {
    document.getElementById('AF_Radio').style.display = 'none'
}

let volRange = document.getElementById('changeRadioVolume');
volRange.value = localStorage.getItem('volume');


volRange.onchange = function () {
    if (localStorage.getItem('volume') != null) {
        player.volume = this.value;
        localStorage.setItem('volume', player.volume);
    } else localStorage.setItem('volume', this.value);
}

document.getElementById('muteAudio').addEventListener('click', muteorunmute)