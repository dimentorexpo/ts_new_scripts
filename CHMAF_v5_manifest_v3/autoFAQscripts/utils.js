function showNotification(message) { // отображает уведомление за счет API браузера
    if (!("Notification" in window)) return false;

    if (Notification.permission === "granted") {
        new Notification(message);
        return true;
    }

    if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }

    return false;
}

function showCustomAlert(message) { // отображает кастомное уведомление
    const alertContainer = document.createElement('div');
    alertContainer.classList.add('extwindows', 'alert-container');

    const alertMessage = document.createElement('span');
    alertMessage.innerText = message;
    alertMessage.classList.add('alert-message');

    const closeButton = document.createElement('button');
    closeButton.innerText = 'OK';
    closeButton.classList.add('mainButton');
    closeButton.onclick = () => alertContainer.remove();

    alertContainer.append(alertMessage, closeButton);
    document.body.appendChild(alertContainer);
}

function notify(message, { useBrowser = true } = {}) {
    const browserAllowed = localStorage.getItem('brnotificatios') === '0';

    if (useBrowser && browserAllowed) {
        const shown = showNotification(message);
        if (shown) return;
    }

    showCustomAlert(message);
}