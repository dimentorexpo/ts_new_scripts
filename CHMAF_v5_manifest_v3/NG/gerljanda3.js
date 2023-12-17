let mstl_gerljanda3 = document.createElement('style');
document.body.append(mstl_gerljanda3);
var style_gerljanda3 = ` 
#AF_girlyanda3 {
 position:absolute;
 left:0px;
 top:0px;
 width:100%;
 height:40px;
 overflow:hidden;
z-index: 999;
}

.xlsf-light {
 position:absolute;
}

body.fast .xlsf-light {
 opacity:0.9;
}

.xlsf-fragment {
 position:absolute;
 background:transparent url('chrome-extension://${editorExtensionId}/NG/gerljanda3.png') no-repeat 0px 0px;
 width:50px;
 height:50px;
}

.xlsf-fragment-box {
 position:absolute;
 left:0px;
 top:0px;
 width:50px;
 height:50px;
 *width:100%;
 *height:100%;
 display:none;
}

.xlsf-cover {
 position:fixed;
 left:0px;
 top:0px;
 width:100%;
 height:100%;
 background:#fff;
 opacity:1;
 z-index:999;
 display:none;
}
`
mstl_gerljanda3.innerHTML = style_gerljanda3;

if (localStorage.getItem('girlyanda') == '3') {
    startgirlyand3()
}

function startgirlyand3() {
    const wintgerljanda3 = document.createElement('div'); // создание окна создания тестовых комнат
    document.body.append(wintgerljanda3);
    wintgerljanda3.setAttribute('id', 'AF_girlyanda3');
    document.body.style.paddingTop = '35px';
    document.body.style.backgroundColor = "#001529";
    document.getElementById('AF_ChatHis').style.paddingTop = '35px';
    girlyanda3started();
}

function girlyanda3started () {
    
}
