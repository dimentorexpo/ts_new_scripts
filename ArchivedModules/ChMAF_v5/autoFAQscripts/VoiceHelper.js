const recognition = new webkitSpeechRecognition();
recognition.lang = 'ru-RU';
const test_stud_spech = localStorage.getItem('test_stud');
const test_teach_spech = localStorage.getItem('test_teach');

let isRecognizing = false; // Флаг для отслеживания состояния распознавания

// Функция для запуска распознавания
function startRecognition() {
    if (!isRecognizing) {
        try {
            recognition.start();
            isRecognizing = true;
            document.getElementById('pushToTalk').classList.add('active');
        } catch (error) {
            console.log(error.message); // Логирование ошибки, если распознавание не может быть запущено
        }
    }
}

// Функция для остановки распознавания
function stopRecognition() {
    if (isRecognizing) {
        recognition.stop();
        isRecognizing = false;
        document.getElementById('pushToTalk').classList.remove('active');
    }
}

// Listen for the result event to get the user's voice input
recognition.addEventListener('result', (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log(command);

    // Check the command and execute the appropriate action
    switch (true) {
        case command.includes('crm') || command.includes('црм'):
            openUrl('CRM', "https://crm2.skyeng.ru/persons/");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('тт'):
            window.open("https://timetable.skyeng.ru/");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('адм'):
            openUrl('админка', "https://id.skyeng.ru/admin/users/");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('платёж'):
            window.open("https://accounting.skyeng.ru/userpayment/search/transaction");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('трамва') || command.includes('трм'):
            openUrl('TRM', "https://trm.skyeng.ru/teacher/");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('улоги') || command.includes('логиу') || command.includes('локиу') || command.includes('логи у') || command.includes('тшу'):
            openUrl('УТШ', "https://video-trouble-shooter.skyeng.ru/?userId=");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('логи') || command.includes('логи') || command.includes('локи') || command.includes('тш') || command.includes('Т Ш'):
            openUrl('ТШ', "https://video-trouble-shooter.skyeng.ru/?userId=");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('плоги') || command.includes('логи препод') || command.includes('препод логи') || command.includes('логи п') || command.includes('logipe') || command.includes('п логи') || command.includes('тшп'):
            openUrl('ПТШ', "https://video-trouble-shooter.skyeng.ru/?userId=");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('ТУ') || command.includes('тест') || command.includes('ту'):
            openUrl('ТУ', "https://api-english.skyeng.ru/admin/tech-support-room/create");
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('id у') || command.includes('idу') || command.includes('айдиу') || command.includes('айди у'):
            copyToClipboard(test_stud_spech);
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('id п') || command.includes('idп') || command.includes('айдип') || command.includes('айди п') || command.includes('idp'):
            copyToClipboard(test_teach_spech)
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('логинер п') || command.includes('логинерп') || command.includes('логинп') || command.includes('логин п'):
            logginerfortests(test_teach_spech);
            document.getElementById('voicetext').textContent = command + ' ✔';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        case command.includes('логинер у') || command.includes('логинеру') || command.includes('логину') || command.includes('логин у'):
            document.getElementById('voicetext').textContent = command + ' ✔';
            logginerfortests(test_stud_spech);
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
            break;
        default:
            console.log("No matching command found");
            document.getElementById('voicetext').textContent = command + '❌';
            setTimeout(function () {
                document.getElementById('voicetext').textContent = ''
            }, 5000)
    }
});

// Обработчики событий для кнопки 'pushToTalk'
document.getElementById('pushToTalk').addEventListener('mousedown', startRecognition);
document.getElementById('pushToTalk').addEventListener('mouseup', stopRecognition);

function openUrl(flagName, link) {
    const iframeDocument = document.querySelector('[class^="NEW_FRONTEND"]').contentDocument || document.querySelector('[class^="NEW_FRONTEND"]').contentWindow.document;
    const elemwheresearc = iframeDocument.querySelector('#__next ul[class*="Variables_List"]');
    const arg = SearchinAFnewUI("id");
    const user = SearchinAFnewUI("userType");

    if (!elemwheresearc) return window.open(link);


    switch (flagName) {
        case 'админка':
            window.open(`${link}${arg}/update-contacts`);
            break;
        case 'CRM':
            window.open(`${link}${arg}`);
            break;
        case 'TRM':
            if (user === "teacher") {
                window.open(`${link}${arg}`);
                break;
            } else {
                const nextteacher = SearchinAFnewUI("nextClass-teacherId");
                if (nextteacher) {
                    window.open(`${link}${nextteacher}`);
                    break;
                }
            }
            break;
        case 'УТШ':
            if (user === "teacher") {
                const nextstud = SearchinAFnewUI("nextClass-studentId");
                if (nextstud) {
                    window.open(`${link}${nextstud}&order=desc`);
                    break;
                }
            } else {
                window.open(`${link}${arg}&order=desc`);
                break;
            }
        case 'ПТШ':
            if (user === "teacher") {
                window.open(`${link}${arg}&order=desc`);
                break;
            } else {
                const nextteacher = SearchinAFnewUI("nextClass-teacherId");
                if (nextteacher) {
                    window.open(`${link}${nextteacher}&order=desc`);
                    break;
                }
            }
        case 'ТШ':
            window.open(`${link}${arg}&order=desc`);
            break;
        case 'ТУ':
            window.open(`${link}`);
            break;
    }
}


// Обработчики событий для клавиатуры
document.addEventListener('keydown', (event) => {
    if (event.keyCode === parseInt(localStorage.getItem('pushToTalkKeyCode'), 10)) {
        startRecognition();
    }
});

document.addEventListener('keyup', (event) => {
    if (event.keyCode === parseInt(localStorage.getItem('pushToTalkKeyCode'), 10)) {
        stopRecognition();
    }
});

// Обработчик события завершения распознавания
recognition.addEventListener('end', () => {
    isRecognizing = false;
    document.getElementById('pushToTalk').classList.remove('active');
    console.log('END SUCCESs')
});
