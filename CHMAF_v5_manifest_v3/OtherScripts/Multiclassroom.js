function fetchaddchat(userid1, userid2) { 
    fetch("https://notify-vimbox.skyeng.ru/api/v1/chat/contact", {
        headers: {
            "content-type": "application/json",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        referrer: "https://vimbox.skyeng.ru/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify({ userId1: userid1, userId2: userid2 }),
        method: "POST",
        mode: "cors",
        credentials: "include"
    });
}

async function fetchData(url, body) {
    try {
        const response = await fetch(url, {
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
            method: "POST",
            credentials: "include"
        });
        return response.json();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function addMulticlassrom() {
    try {
        const artid = await fetchData("https://rooms-vimbox.skyeng.ru/users/api/v2/auth/config", {});
        const studarr = await fetchData("https://academic-gateway.skyeng.ru/academic/api/teacher-classroom/get-data/personal", { teacherId: null });

        Object.entries(studarr).forEach(([subject, students]) => {
            processSubject(subject, students, artid.user.id);
        });
    } catch (error) {
        console.error("Error in addMulticlassrom:", error);
    }
}

function processSubject(subjName, students, userId) {
    const activeStudents = students.filter(student => student.status !== "sleep");
    activeStudents.forEach(student => fetchaddchat(student.id, userId));
    console.log(`${subjName}: Чаты добавлены в количестве: ${activeStudents.length}`);
}

function setupAchatBtn() {
    if (!document.getElementById('achatbtn')) {
        let achatb = document.createElement('span');
        achatb.id = "achatbtn";
        achatb.textContent = "💬";
        achatb.style = 'cursor:pointer;';
        const navigationElement = document.querySelector('.navigation');
        if (navigationElement) {
            navigationElement.appendChild(achatb);
            achatb.onclick = addMulticlassrom;
            achatb.title = "Добавляет все чаты с активными учениками!";
        }
    }
}

const observer = new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.addedNodes.length)) {
        setupAchatBtn();
    }
});

observer.observe(document.body, { childList: true, subtree: true });