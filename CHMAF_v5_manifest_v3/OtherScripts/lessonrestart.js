function dosetclasswork(subject) {
    fetch("https://api-" + subject + ".skyeng.ru/api/v1/rooms/" + document.URL.split('/')[6], {
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
        },
        body: JSON.stringify({ status: "classwork" }),
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
        classworkbtn.title = "Эта кнопка создана в расширении ChMAF, преподавателям не нужно за нее говорить, так как без расширения видеть на будут!"
        classworkbtn.textContent = "🔄️Classwork";
        classworkbtn.style.cssText = `
    position: fixed;
    right: 25%;
    cursor: pointer;
    padding: 10px 22px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Segoe UI', system-ui, sans-serif;
    letter-spacing: 0.5px;
    color: #fff;
    background: #10b981;
    border: none;
    border-radius: 8px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;
        classworkbtn.onmouseenter = () => {
            classworkbtn.style.background = "#059669";
            classworkbtn.style.boxShadow = "0 4px 20px rgba(16, 185, 129, 0.5), 0 0 0 4px rgba(16, 185, 129, 0.1)";
            classworkbtn.style.transform = "scale(1.05)";
        };
        classworkbtn.onmouseleave = () => {
            classworkbtn.style.background = "#10b981";
            classworkbtn.style.boxShadow = "0 2px 8px rgba(16, 185, 129, 0.3)";
            classworkbtn.style.transform = "scale(1)";
        };

        if (targetButton) {
            targetButton.parentNode.insertBefore(classworkbtn, targetButton);
        } else if (attachmentsContainer) {
            let parent = attachmentsContainer.parentNode;
            parent.parentNode.appendChild(classworkbtn); // Если контейнер последний, просто добавляем в конец
        }

        classworkbtn.onclick = function () {
            dosetclasswork(subject);
            setTimeout(function () {
                location.reload()
            }, 1000
            )
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