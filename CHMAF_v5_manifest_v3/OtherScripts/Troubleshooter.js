function addusersinfo() {
    let usersfilds = document.getElementsByClassName('p-10 w-85')
    console.log(usersfilds)
}

const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.addedNodes.length) {
            addusersinfo();
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });