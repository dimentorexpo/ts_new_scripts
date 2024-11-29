let mstl_gerljanda1 = document.createElement('style');
document.body.append(mstl_gerljanda1);
var style_gerljanda1 = `
#gir {
    position:fixed;
    top:0;
    left:0;
    height:36px;
    width:100%;
    overflow:hidden;
    z-index:1000000;
    background-color: #001529;
    background-image: url('chrome-extension://${editorExtensionId}/NG/gerljanda1.png')
}  
#nums_1 {padding:100px}  
.gir_1 {background-position: 0 0}  
.gir_2 {background-position: 0 -36px}  
.gir_3 {background-position: 0 -72px}
`
mstl_gerljanda1.innerHTML = style_gerljanda1;

let girlyand1isstart;

var win_gerljanda1 = `
    <div id="gir" class="gir_3">
        <div id="nums_1">1</div>
    </div>
`;

if (localStorage.getItem('girlyanda') == '1') {
    startgirlyand1()
}

function startgirlyand1() {
    const wintgerljanda1 = document.createElement('div'); // создание окна создания тестовых комнат
    document.body.append(wintgerljanda1);
    wintgerljanda1.innerHTML = win_gerljanda1;
    wintgerljanda1.setAttribute('id', 'AF_girlyanda1');
    document.body.style.paddingTop = '35px';
    document.body.style.backgroundColor = "#001529";
    document.getElementById('AF_ChatHis').style.paddingTop = '35px';
    document.getElementById('userchatdata').style.top = '35px';
    document.getElementById('infofield').style.height = "70vh";
    girlyand1isstart = setInterval(function () { gir() }, 500);
}

function stopgirlyand1() {
    if (girlyand1isstart) {
        clearInterval(girlyand1isstart);
        girlyand1isstart = null;

        const wintgerljanda1 = document.querySelector('#AF_girlyanda1');
        if (wintgerljanda1) {
            wintgerljanda1.remove();
            document.body.style.backgroundColor = '';
            document.body.style.paddingTop = '0px';
            document.getElementById('AF_ChatHis').style.paddingTop = '0px';
            document.getElementById('userchatdata').style.top = '0px';
            document.getElementById('infofield').style.height = '75vh';
        }
    }
}

function gir() {
    nums = document.getElementById('nums_1').innerHTML
    if (nums == 1) { document.getElementById('gir').className = 'gir_1'; document.getElementById('nums_1').innerHTML = '2' }
    if (nums == 2) { document.getElementById('gir').className = 'gir_2'; document.getElementById('nums_1').innerHTML = '3' }
    if (nums == 3) { document.getElementById('gir').className = 'gir_3'; document.getElementById('nums_1').innerHTML = '1' }
}