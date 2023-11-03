if (localStorage.getItem('hidesummaryflag') == null)
    localStorage.setItem('hidesummaryflag', '1') // 1 список скрыт , 0 список открыт
let peoplestatus = document.createElement('div')
peoplestatus.id = 'idforpeopstatus'
peoplestatus.style = 'width: 200px; color: bisque;'
document.getElementsByClassName('ant-layout-sider-children')[0].append(peoplestatus)
let chatneraspcountleft = 0;
async function operstatusleftbar() { // функция замены Script Package вывода списка операторов
    let opstats = []
    let moderresult = '';
    let flagtpkc;
    let operonlinecnt = 0;
    let busycnt = 0;
    let pausecnt = 0;
    let chattpquecountleft = 0;

    flagtpkc = opsection
    
    await fetch("https://skyeng.autofaq.ai/api/operators/statistic/currentState", {
        "credentials": "include"
    }).then(r => r.json()).then(result => {

        for (let i = 0; i < result.onOperator.length; i++) {
			if (result.onOperator[i].status != "Offline") {
				if ((flagtpkc == 'ТП' || flagtpkc == 'ТП ОС') && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/ТП\D/)) {
					opstats.push(result.onOperator[i])
					for (let j=0; result.unAssigned[j] != undefined; j++) {
						if (result.unAssigned[j].groupId == 'c7bbb211-a217-4ed3-8112-98728dc382d8') {
							chattpquecountleft = result.unAssigned[j].count
						}
					}
				} else if (flagtpkc == 'КЦ' && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/КЦ\D/)) {
					opstats.push(result.onOperator[i])
					chatneraspcountleft = 0;					
					for (let j=0; j<result.unAssigned.length; j++) {
						if (result.unAssigned[j].groupId == 'b6f7f34d-2f08-fc19-3661-29ac00842898') {
							chatneraspcountleft += Number(result.unAssigned[j].count)
						}
					}	
				} else if (flagtpkc == 'КМ' && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/КМ\D/)) {
					opstats.push(result.onOperator[i])
					for (let j=0; result.unAssigned[j] != undefined; j++) {
						if (result.unAssigned[j].kb == '121300') {
							chatneraspcountleft = result.unAssigned[j].count
						}
					}	
				} else if (flagtpkc == 'Prem' && result.onOperator[i].operator != null && result.onOperator[i].groupId =='68932fae-b9f9-6b37-2a52-911b2b6b4f6d' && result.onOperator[i].operator.fullName.match(/Prem\D/)) {
					opstats.push(result.onOperator[i])
					for (let j=0; result.unAssigned[j] != undefined; j++) {
						if (result.unAssigned[j].kb == '121527') {
							chatneraspcountleft = result.unAssigned[j].count
						}
					}	
				} else if (flagtpkc == 'Teachers Care' && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/Teachers Care\D/)) {
					opstats.push(result.onOperator[i])
					for (let j=0; result.unAssigned[j] != undefined; j++) {
						if (result.unAssigned[j].kb) {
							chatneraspcountleft = result.unAssigned[j].count
						}
					}	
				} // end of if state small 	
			} else { // end of if state big
				if (flagtpkc == 'ТП' && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/ТП\D/)) {
					for (let j=0; result.unAssigned[j] != undefined; j++) {
						if (result.unAssigned[j].groupId == 'c7bbb211-a217-4ed3-8112-98728dc382d8') {
							chattpquecountleft = result.unAssigned[j].count
						}
					}
				} else if (flagtpkc == 'КЦ' && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/КЦ\D/)) {
					chatneraspcountleft = 0;
					for (let j=0; j<result.unAssigned.length; j++) {
						if (result.unAssigned[j].groupId == 'b6f7f34d-2f08-fc19-3661-29ac00842898') {
							chatneraspcountleft += Number(result.unAssigned[j].count)
						}
					}	
				} else if (flagtpkc == 'КМ' && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/КМ\D/)) {
					for (let j=0; result.unAssigned[j] != undefined; j++) {
						if (result.unAssigned[j].kb == '121300') {
							chatneraspcountleft = result.unAssigned[j].count
						}
					}	
				} else if (flagtpkc == 'Prem' && result.onOperator[i].groupId =='68932fae-b9f9-6b37-2a52-911b2b6b4f6d' && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/Prem\D/)) {
					for (let j=0; result.unAssigned[j] != undefined; j++) {
						if (result.unAssigned[j].kb == '121527') {
							chatneraspcountleft = result.unAssigned[j].count
						}
					}	
				} else if (flagtpkc == 'Teachers Care' && result.onOperator[i].operator != null && result.onOperator[i].operator.fullName.match(/Teachers Care\D/)) {
					for (let j=0; result.unAssigned[j] != undefined; j++) {
						if (result.unAssigned[j].kb) {
							chatneraspcountleft = result.unAssigned[j].count
						}
					}
				} // end of if state small 	
			} 
			

        } // end of for
    })

    peoplestatus.innerHTML = ''

	if (opstats.length !=0) {
		opstats.sort((prev, next) => {
			if (prev.operator.status < next.operator.status) return -1;
			if (prev.operator.status < next.operator.status) return 1;
		});
	}

		if (opstats.length) {
		  for (let i = 0; i < opstats.length; i++) {
			opstats[i].aCnt = opstats[i].aCnt || 0;

			const operator = opstats[i].operator;
			const divClass = "leftbaropers";
			let divStyle = "";
			let spanBackground = "";
			let spanText = "";

			switch (operator.status) {
			  case "Online":
				operonlinecnt += 1;
				spanBackground = "green";
				spanText = "white";
				break;
			  case "Busy":
				busycnt += 1;
				divStyle = "opacity:0.8; color:Gold";
				spanBackground = "gold";
				spanText = "black";
				break;
			  case "Pause":
				pausecnt += 1;
				divStyle = "opacity:0.8; color:Salmon";
				spanBackground = "FireBrick";
				spanText = "white";
				break;
			  default:
				continue;
			}
			moderresult += `<div class="${divClass}" style="${divStyle}" name="operrow" value="${operator.id}">` +
			  `<span style="color: ${spanText}; font-size: 13px; background: ${spanBackground}; width: 25px; height: 25px; padding-top:2px; text-align: center; border-radius: 50%; border: 1px solid black;">` + 
			  `${opstats[i].aCnt}` + 
			  `</span>` + 
			  `${operator.fullName}` + 
			  '</div>';
		  }
		} else {
		  moderresult = '';
		}

	

    if (flagtpkc == 'ТП' && localStorage.getItem('hidesummaryflag') == '1') {

        peoplestatus.innerHTML =
            '<div style="background:#792525; font-weight: 700; text-align: center; letter-spacing: .2rem; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border: 1px solid #464343; margin-bottom: 5px;">' + '🚧 Нераспред: ' + chattpquecountleft + '</div>' +
            moderresult + '<br>' +
            '<div id="clicktounhidestatuses" title="По клику откроет общую информацию о том, сколько всего операторов и их количество в разных статусах" style="color:bisque; opacity:0.8; cursor:pointer; text-align:center;">🔽 Открыть</div>' +
            '<div id="opersstats" style="display:none;">' +
            '<div  style="background:#257947; font-weight: 700; text-align: center; border: 1px solid black;">' + '🛠 Онлайн: ' + operonlinecnt + '</div>' +
            '<div style="background: #a3bb1d; color: black; font-weight: 700; text-align: center; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '⏳ Занят: ' + busycnt + '</div>' +
            '<div style="background:#cf4615; font-weight: 700; text-align: center;border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '🍔 Перерыв: ' + pausecnt + '</div>' +
            '<div  style="background:#492579; font-weight: 700; text-align: center;border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '⚡ Всего: ' + (+pausecnt + busycnt + operonlinecnt) + '</div>' +
            '</div>'

    } else if (flagtpkc == 'ТП' && localStorage.getItem('hidesummaryflag') == '0') {
        peoplestatus.innerHTML =
            '<div style="background:#792525; font-weight: 700; text-align: center; letter-spacing: .2rem; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border: 1px solid #464343; margin-bottom: 5px;">' + '🚧 Нераспред: ' + chattpquecountleft + '</div>' +
            moderresult + '<br>' +
            '<div id="clicktounhidestatuses" title="По клику откроет общую информацию о том, сколько всего операторов и их количество в разных статусах"  style="color:bisque; opacity:0.8; cursor:pointer; text-align:center;">🔼 Скрыть</div>' +
            '<div id="opersstats">' +
            '<div style="background:#257947; font-weight: 700; text-align: center; border: 1px solid black;">' + '🛠 Онлайн: ' + operonlinecnt + '</div>' +
            '<div style="background: #a3bb1d; color: black; font-weight: 700; text-align: center; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '⏳ Занят: ' + busycnt + '</div>' +
            '<div style="background:#cf4615; font-weight: 700; text-align: center;border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '🍔 Перерыв: ' + pausecnt + '</div>' +
            '<div style="background:#492579; font-weight: 700; text-align: center;border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '⚡ Всего: ' + (+pausecnt + busycnt + operonlinecnt) + '</div>' +
            '</div>'
    } else if (flagtpkc != 'ТП' && localStorage.getItem('hidesummaryflag') == '1') {
        peoplestatus.innerHTML =
            '<div style="background:#792525; font-weight: 700; text-align: center; letter-spacing: .2rem; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border: 1px solid #464343; margin-bottom: 5px;">' + '🚧 Нераспред: ' + chatneraspcountleft + '</div>' +
            moderresult + '<br>' +
            '<div id="clicktounhidestatuses" title="По клику откроет общую информацию о том, сколько всего операторов и их количество в разных статусах"  style="color:bisque; opacity:0.8; cursor:pointer; text-align:center;">🔽 Открыть</div>' +
            '<div id="opersstats" style="display:none">' + '<div  style="background:#257947; font-weight: 700; text-align: center; border: 1px solid black;">' + '🛠 Онлайн: ' + operonlinecnt + '</div>' +
            '<div style="background: #a3bb1d; color: black; font-weight: 700; text-align: center; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '⏳ Занят: ' + busycnt + '</div>' +
            '<div style="background:#cf4615; font-weight: 700; text-align: center;border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '🍔 Перерыв: ' + pausecnt + '</div>' +
            '<div  style="background:#492579; font-weight: 700; text-align: center;border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '⚡ Всего: ' + (+pausecnt + busycnt + operonlinecnt) + '</div>' +
            '</div>'
    } else if (flagtpkc != 'ТП' && localStorage.getItem('hidesummaryflag') == '0') {
        peoplestatus.innerHTML =
            '<div style="background:#792525; font-weight: 700; text-align: center; letter-spacing: .2rem; text-shadow: 1px 2px 5px rgb(0 0 0 / 55%); border: 1px solid #464343; margin-bottom: 5px;">' + '🚧 Нераспред: ' + chatneraspcountleft + '</div>' +
            moderresult + '<br>' +
            '<div id="clicktounhidestatuses" title="По клику откроет общую информацию о том, сколько всего операторов и их количество в разных статусах"  style="color:bisque; opacity:0.8; cursor:pointer; text-align:center;">🔼 Скрыть</div>' +
            '<div id="opersstats">' + '<div  style="background:#257947; font-weight: 700; text-align: center; border: 1px solid black;">' + '🛠 Онлайн: ' + operonlinecnt + '</div>' +
            '<div style="background: #a3bb1d; color: black; font-weight: 700; text-align: center; border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '⏳ Занят: ' + busycnt + '</div>' +
            '<div style="background:#cf4615; font-weight: 700; text-align: center;border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '🍔 Перерыв: ' + pausecnt + '</div>' +
            '<div  style="background:#492579; font-weight: 700; text-align: center;border-left: 1px solid black; border-right: 1px solid black; border-bottom: 1px solid black;">' + '⚡ Всего: ' + (+pausecnt + busycnt + operonlinecnt) + '</div>' +
            '</div>'
    }

    document.getElementById('clicktounhidestatuses').onclick = function () {
        if (document.getElementById('clicktounhidestatuses').textContent == '🔽 Открыть') {
            document.getElementById('opersstats').style.display = '';
            document.getElementById('clicktounhidestatuses').textContent = '🔼 Скрыть'
            localStorage.setItem('hidesummaryflag', '0')
        } else if (document.getElementById('clicktounhidestatuses').textContent == '🔼 Скрыть') {
            document.getElementById('opersstats').style.display = 'none';
            document.getElementById('clicktounhidestatuses').textContent = '🔽 Открыть'
            localStorage.setItem('hidesummaryflag', '1')
        }
    }


    let arofpers = document.getElementsByName('operrow')
    for (let i = 0; i < arofpers.length; i++) {
        arofpers[i].onclick = function () {
            if (document.getElementById('AF_ChatHis').style.display == 'none')
                document.getElementById('opennewcat').click()

            setTimeout(function () {
                let massivvidapspiskaoperatorov = document.getElementById('operatorstp')
                for (let k = 1; k < massivvidapspiskaoperatorov.length; k++) {
                    if (arofpers[i].getAttribute('value') == massivvidapspiskaoperatorov.children[k].value) {
                        massivvidapspiskaoperatorov.children[k].selected = true
                        findchatsoper()
                    }
                }
            }, 1000)
        }
    }

    for (let i = 0; document.getElementsByClassName('app-content')[1].children[i] != undefined; i++) {
        if (document.getElementsByClassName('app-content')[1].children[i].id == 'people_head')
            document.getElementsByClassName('app-content')[1].children[i].remove()
    }

}

var testint = setInterval(operstatusleftbar, 6000)
// setTimeout(operstatusleftbar, 10000)

