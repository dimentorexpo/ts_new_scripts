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
    let targetButton = document.querySelector('button.header-item.ng-star-inserted');

    if (targetButton && !document.getElementById('clwbtn')) {
        let classworkbtn = document.createElement('div');
        classworkbtn.id = "clwbtn";
        classworkbtn.textContent = "Classwork";
        classworkbtn.style = "position:absolute; right:10%; cursor: pointer; color:green; text-shadow: 1px 2px 5px rgb(0 0 0 / 20%);";
        let subject = document.URL.split('/')[4];

        targetButton.parentNode.insertBefore(classworkbtn, targetButton);
        classworkbtn.onclick = function() {
            dosetclasswork(subject);
            location.reload();
        }
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