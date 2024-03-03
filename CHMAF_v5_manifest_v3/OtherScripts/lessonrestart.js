function dosetclasswork(subject) {
    fetch("https://api-" + subject + ".skyeng.ru/api/v1/rooms/" + document.URL.split('/')[6], {
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
        },
        body: JSON.stringify({ status: "classwork", name: "" }),
        method: "PATCH",
        mode: "cors",
        credentials: "include"
    });

    document.getElementById('clwbtn').textContent = "Done!"
    setTimeout(() => { document.getElementById('clwbtn').textContent = "Classwork" }, 3000)
}

function setupClassworkButton() {
    if (!document.getElementById('clwbtn')) {
        let targetButton = document.querySelector('button.header-item.ng-star-inserted');
        let elements = document.querySelectorAll(".-without-border");
        let attachmentsContainer;
        let subject = document.URL.split('/')[4];

        // Ищем контейнер, содержащий "Вложения"
        Array.from(elements).forEach((el) => {
            if (el.innerText.includes('Вложения')) {
                attachmentsContainer = el;
            }
        });

        let classworkbtn = document.createElement('div');
        classworkbtn.id = "clwbtn";
        classworkbtn.textContent = "Classwork";
        classworkbtn.style = "position: fixed; right: 10%; cursor: pointer; color: green; text-shadow: rgba(0, 0, 0, 0.2) 1px 2px 5px;";

        if (targetButton) {
            targetButton.parentNode.insertBefore(classworkbtn, targetButton);
        } else if (attachmentsContainer) {
            let parent = attachmentsContainer.parentNode;
            parent.parentNode.appendChild(classworkbtn); // Если контейнер последний, просто добавляем в конец
        }

        classworkbtn.onclick = function () {
            dosetclasswork(subject);
            location.reload();
        };
    }
}


const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            setupClassworkButton();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });