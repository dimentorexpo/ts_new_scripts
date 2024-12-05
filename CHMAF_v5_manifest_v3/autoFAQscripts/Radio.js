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
                    <input class="${exttheme}" type="text" id="audioUrl" style="text-align: center; border-radius: 10px;"
                        placeholder="Enter Radio URL">
                    <input class="${exttheme}" type="text" id="audioName" style="text-align: center; border-radius: 10px; width:120px;"
                        placeholder="Enter Radio name">
                    <button class="mainButton" id="addAudio">➕</button>
                    <button class="mainButton" id="playAudio">▶</button>
                    <button class="mainButton" id="pauseAudio">⏸</button>
                    <input id="changeRadioVolume" min="0" max="1" value="1.0" step="0.025" type="range">
                    <button class="mainButton" id="muteAudio">🔇Mute</button>
                </div>
                <ol id="audioList" style="width:570px;"></ol>
                <audio id="player"></audio>
            </div>
        </span>
</span>
</div>`;

const wintRadio = createWindow('AF_Radio', 'winTopRadio', 'winLeftRadio', win_Radio);
hideWindowOnDoubleClick('AF_Radio');
hideWindowOnClick('AF_Radio', 'hideMeRadio');

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

let volRange = document.getElementById('changeRadioVolume');
volRange.value = localStorage.getItem('volume');


volRange.onchange = function () {
    if (localStorage.getItem('volume') != null) {
        player.volume = this.value;
        localStorage.setItem('volume', player.volume);
    } else localStorage.setItem('volume', this.value);
}

document.getElementById('muteAudio').addEventListener('click', muteorunmute)