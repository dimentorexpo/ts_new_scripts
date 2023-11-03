let buttonmobpas = document.createElement('p');
buttonmobpas.id = 'copymobpass';
buttonmobpas.innerHTML = '<a style="color: black; cursor: pointer;">Generate code📱</a>';


var getidfromaf;
buttonmobpas.addEventListener('click', function () {

    for (i = 0; document.getElementsByClassName('expert-user_details-list')[1].childNodes[i] != undefined; i++) {
        if (document.getElementsByClassName('expert-user_details-list')[1].childNodes[i].firstChild.innerText == "id")
            getidfromaf = document.getElementsByClassName('expert-user_details-list')[1].childNodes[i].childNodes[1].innerText.split(' ')[0];
        console.log("getidfromaf = " + ' ' + getidfromaf);
    }

    document.getElementById('responseTextarea1').value = `{
		"headers": {
			"content-type": "application/x-www-form-urlencoded",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "same-origin",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1"
		},
		"body": "user_id_or_identity_for_one_time_password_form%5BuserIdOrIdentity%5D= + ${getidfromaf} + &user_id_or_identity_for_one_time_password_form%5Bgenerate%5D=&user_id_or_identity_for_one_time_password_form%5B_token%5D=null",
			"method": "POST",
			"mode": "cors",
			"credentials": "include"
		}`
    document.getElementById('responseTextarea2').value = "https://id.skyeng.ru/admin/auth/one-time-password"
    document.getElementById('responseTextarea3').value = 'getmobpwd'
    document.getElementById('sendResponse').click()

    function getPassInfoNew() {
        var resprez2 = document.getElementById('responseTextarea1').getAttribute('getmobpwd')
        document.getElementById('responseTextarea1').removeAttribute('getmobpwd');
        var convertres2 = resprez2.match(/div class="alert alert-success" role="alert".*?([0-9]{5}).*/);
        document.getElementById('copymobpass').innerHTML = convertres2[1];
    }
    setTimeout(getPassInfoNew, 2000);

    setTimeout(function () { document.getElementById('copymobpass').innerHTML = "Generate Code📱" }, 15000);
})