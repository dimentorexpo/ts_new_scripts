let mstl_gerljanda2 = document.createElement('style');
document.body.append(mstl_gerljanda2);
var style_gerljanda2 = `
.b-page__content{min-height:200px}
.b-head-decor{display:none}
.b-page_newyear .b-head-decor{
   position:absolute;
   top:0;
   left:0;
   display:block;
   height:115px;
   width:100%;
   overflow:hidden;
   z-index:1000000;
   background-color: #001529;
   background:url('chrome-extension://${editorExtensionId}/NG/Gir2/11648.png') repeat-x 0 0
}
.b-page_newyear .b-head-decor__inner{position:absolute;top:0;left:0;height:115px;display:block;width:373px}
.b-page_newyear .b-head-decor::before{content:'';display:block;position:absolute;top:-115px;left:0;z-index:3;height:115px;display:block;width:100%;box-shadow:0 15px 30px rgba(0,0,0,0.75)}
.b-page_newyear .b-head-decor__inner_n2{left:373px}
.b-page_newyear .b-head-decor__inner_n3{left:746px}
.b-page_newyear .b-head-decor__inner_n4{left:1119px}
.b-page_newyear .b-head-decor__inner_n5{left:1492px}
.b-page_newyear .b-head-decor__inner_n6{left:1865px}
.b-page_newyear .b-head-decor__inner_n7{left:2238px}

.b-ball{position:absolute}
.b-ball_n1{top:0;left:3px;width:59px;height:83px}
.b-ball_n2{top:-19px;left:51px;width:55px;height:70px}
.b-ball_n3{top:9px;left:88px;width:49px;height:67px}
.b-ball_n4{top:0;left:133px;width:57px;height:102px}
.b-ball_n5{top:0;left:166px;width:49px;height:57px}
.b-ball_n6{top:6px;left:200px;width:54px;height:70px}
.b-ball_n7{top:0;left:240px;width:56px;height:67px}
.b-ball_n8{top:0;left:283px;width:54px;height:53px}
.b-ball_n9{top:10px;left:321px;width:49px;height:66px}
.b-ball_n1 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/68390.png') no-repeat}
.b-ball_n2 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/28349.png') no-repeat}
.b-ball_n3 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/22419.png') no-repeat}
.b-ball_n4 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/52964.png') no-repeat}
.b-ball_n5 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/33026.png') no-repeat}
.b-ball_n6 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/81582.png') no-repeat}
.b-ball_n7 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/85960.png') no-repeat}
.b-ball_n8 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/82545.png') no-repeat}
.b-ball_n9 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/18860.png') no-repeat}
.b-ball_i1 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/14737.png') no-repeat}
.b-ball_i2 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/35828.png') no-repeat}
.b-ball_i3 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/80069.png') no-repeat}
.b-ball_i4 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/96111.png') no-repeat}
.b-ball_i5 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/13849.png') no-repeat}
.b-ball_i6 .b-ball__i{background:url('chrome-extension://${editorExtensionId}/NG/Gir2/23942.png') no-repeat}
.b-ball_i1{top:0;left:0;width:25px;height:71px}
.b-ball_i2{top:0;left:25px;width:61px;height:27px}
.b-ball_i3{top:0;left:176px;width:29px;height:31px}
.b-ball_i4{top:0;left:205px;width:50px;height:51px}
.b-ball_i5{top:0;left:289px;width:78px;height:28px}
.b-ball_i6{top:0;left:367px;width:6px;height:69px}
.b-ball__i{
position:absolute;
width:100%;
height:100%;
-webkit-transform-origin:50% 0;
-moz-transform-origin:50% 0;
-o-transform-origin:50% 0;
transform-origin:50% 0;
-webkit-transition:all .3s ease-in-out;
-moz-transition:all .3s ease-in-out;
-o-transition:all .3s ease-in-out;
transition:all .3s ease-in-out;
pointer-events:none
}
.b-ball_bounce .b-ball__right{position:absolute;top:0;right:0;left:50%;bottom:0;z-index:9}
.b-ball_bounce:hover .b-ball__right{display:none}
.b-ball_bounce .b-ball__right:hover{left:0;display:block!important}
.b-ball_bounce.bounce>.b-ball__i{-webkit-transform:rotate(-9deg);-moz-transform:rotate(-9deg);-o-transform:rotate(-9deg);transform:rotate(-9deg)}
.b-ball_bounce .b-ball__right.bounce+.b-ball__i{-webkit-transform:rotate(9deg);-moz-transform:rotate(9deg);-o-transform:rotate(9deg);transform:rotate(9deg)}
.b-ball_bounce.bounce1>.b-ball__i{-webkit-transform:rotate(6deg);-moz-transform:rotate(6deg);-o-transform:rotate(6deg);transform:rotate(6deg)}
.b-ball_bounce .b-ball__right.bounce1+.b-ball__i{-webkit-transform:rotate(-6deg);-moz-transform:rotate(-6deg);-o-transform:rotate(-6deg);transform:rotate(-6deg)}
.b-ball_bounce.bounce2>.b-ball__i{-webkit-transform:rotate(-3deg);-moz-transform:rotate(-3deg);-o-transform:rotate(-3deg);transform:rotate(-3deg)}
.b-ball_bounce .b-ball__right.bounce2+.b-ball__i{-webkit-transform:rotate(3deg);-moz-transform:rotate(3deg);-o-transform:rotate(3deg);transform:rotate(3deg)}
.b-ball_bounce.bounce3>.b-ball__i{-webkit-transform:rotate(1.5deg);-moz-transform:rotate(1.5deg);-o-transform:rotate(1.5deg);transform:rotate(1.5deg)}
.b-ball_bounce .b-ball__right.bounce3+.b-ball__i{-webkit-transform:rotate(-1.5deg);-moz-transform:rotate(-1.5deg);-o-transform:rotate(-1.5deg);transform:rotate(-1.5deg)}
`
mstl_gerljanda2.innerHTML = style_gerljanda2;

const win_gerljanda2 = `
<div class="b-page_newyear">
    <div class="b-page__content">
        <i class="b-head-decor">
      <i class="b-head-decor__inner b-head-decor__inner_n1">
        <div class="b-ball b-ball_n1 b-ball_bounce" data-note="0"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n2 b-ball_bounce" data-note="1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n3 b-ball_bounce" data-note="2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n4 b-ball_bounce" data-note="3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n5 b-ball_bounce" data-note="4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n6 b-ball_bounce" data-note="5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n7 b-ball_bounce" data-note="6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n8 b-ball_bounce" data-note="7"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n9 b-ball_bounce" data-note="8"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        </i>
            <i class="b-head-decor__inner b-head-decor__inner_n2">
        <div class="b-ball b-ball_n1 b-ball_bounce" data-note="9"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n2 b-ball_bounce" data-note="10"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n3 b-ball_bounce" data-note="11"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n4 b-ball_bounce" data-note="12"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n5 b-ball_bounce" data-note="13"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n6 b-ball_bounce" data-note="14"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n7 b-ball_bounce" data-note="15"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n8 b-ball_bounce" data-note="16"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n9 b-ball_bounce" data-note="17"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
      </i>
            <i class="b-head-decor__inner b-head-decor__inner_n3">
        <div class="b-ball b-ball_n1 b-ball_bounce" data-note="18"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n2 b-ball_bounce" data-note="19"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n3 b-ball_bounce" data-note="20"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n4 b-ball_bounce" data-note="21"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n5 b-ball_bounce" data-note="22"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n6 b-ball_bounce" data-note="23"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n7 b-ball_bounce" data-note="24"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n8 b-ball_bounce" data-note="25"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n9 b-ball_bounce" data-note="26"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
      </i>
            <i class="b-head-decor__inner b-head-decor__inner_n4">
        <div class="b-ball b-ball_n1 b-ball_bounce" data-note="27"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n2 b-ball_bounce" data-note="28"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n3 b-ball_bounce" data-note="29"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n4 b-ball_bounce" data-note="30"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n5 b-ball_bounce" data-note="31"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n6 b-ball_bounce" data-note="32"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n7 b-ball_bounce" data-note="33"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n8 b-ball_bounce" data-note="34"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n9 b-ball_bounce" data-note="35"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
      </i>
            <i class="b-head-decor__inner b-head-decor__inner_n5">
        <div class="b-ball b-ball_n1 b-ball_bounce" data-note="0"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n2 b-ball_bounce" data-note="1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n3 b-ball_bounce" data-note="2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n4 b-ball_bounce" data-note="3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n5 b-ball_bounce" data-note="4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n6 b-ball_bounce" data-note="5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n7 b-ball_bounce" data-note="6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n8 b-ball_bounce" data-note="7"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n9 b-ball_bounce" data-note="8"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
      </i>
            <i class="b-head-decor__inner b-head-decor__inner_n6">
        <div class="b-ball b-ball_n1 b-ball_bounce" data-note="9"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n2 b-ball_bounce" data-note="10"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n3 b-ball_bounce" data-note="11"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n4 b-ball_bounce" data-note="12"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n5 b-ball_bounce" data-note="13"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n6 b-ball_bounce" data-note="14"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n7 b-ball_bounce" data-note="15"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n8 b-ball_bounce" data-note="16"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n9 b-ball_bounce" data-note="17"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
      </i>
            <i class="b-head-decor__inner b-head-decor__inner_n7">
        <div class="b-ball b-ball_n1 b-ball_bounce" data-note="18"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n2 b-ball_bounce" data-note="19"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n3 b-ball_bounce" data-note="20"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n4 b-ball_bounce" data-note="21"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n5 b-ball_bounce" data-note="22"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n6 b-ball_bounce" data-note="23"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n7 b-ball_bounce" data-note="24"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n8 b-ball_bounce" data-note="25"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_n9 b-ball_bounce" data-note="26"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i1"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i2"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i3"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i4"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i5"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
        <div class="b-ball b-ball_i6"><div class="b-ball__right"></div><div class="b-ball__i"></div></div>
      </i>
        </i>
    </div>
</div>`;

if (localStorage.getItem('girlyanda') == '2') {
  startgirlyand2()
}
let userVolume = parseFloat(localStorage.getItem('audiovol'))

function startgirlyand2() {
  const wintgerljanda2 = document.createElement('div'); // создание окна создания тестовых комнат
  document.body.append(wintgerljanda2);
  wintgerljanda2.innerHTML = win_gerljanda2;
  wintgerljanda2.setAttribute('id', 'AF_girlyanda2');
  document.body.style.paddingTop = '70px';
  document.body.style.backgroundColor = "#001529";
  document.getElementById('AF_ChatHis').style.paddingTop = '70px';
  girlyanda2started();
}

function stopgirlyand2() {
  const wintgerljanda2 = document.querySelector('#AF_girlyanda2');
  if (wintgerljanda2) {
    wintgerljanda2.remove();
    document.body.style.paddingTop = '0px';
    document.body.style.backgroundColor = '';
    document.getElementById('AF_ChatHis').style.paddingTop = '0px';
  }
}

function girlyanda2started() {
  var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Balls = function () {
    function Balls(context, buffer) {
      _classCallCheck(this, Balls);

      this.context = context;
      this.buffer = buffer;
    }

    _createClass(Balls, [{
      key: 'setup',
      value: function setup() {
        this.gainNode = this.context.createGain();
        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);

        let adjustedVolume = userVolume * 0.4; // Уменьшаем громкость на 60%
        this.gainNode.gain.setValueAtTime(adjustedVolume, this.context.currentTime);
    }
    }, {
      key: 'play',
      value: function play() {
        this.setup();
        this.source.start(this.context.currentTime);
      }
    }, {
      key: 'stop',
      value: function stop() {
        var ct = this.context.currentTime + 1;
        this.gainNode.gain.exponentialRampToValueAtTime(.1, ct);
        this.source.stop(ct);
      }
    }]);

    return Balls;
  }();

  var Buffer = function () {
    function Buffer(context, urls) {
      _classCallCheck(this, Buffer);

      this.context = context;
      this.urls = urls;
      this.buffer = [];
    }

    _createClass(Buffer, [{
      key: 'loadSound',
      value: function loadSound(url, index) {
        var request = new XMLHttpRequest();
        request.open('get', url, true);
        request.responseType = 'arraybuffer';
        var thisBuffer = this;
        request.onload = function () {
          thisBuffer.context.decodeAudioData(request.response, function (buffer) {
            thisBuffer.buffer[index] = buffer;
            if (index == thisBuffer.urls.length - 1) {
              thisBuffer.loaded();
            }
          }, function (e) {
            console.log("Error with decoding audio data" + e.err);
          });
        };
        request.send();
      }
    }, {
      key: 'getBuffer',
      value: function getBuffer() {
        var _this = this;

        this.urls.forEach(function (url, index) {
          _this.loadSound(url, index);
        });
      }
    }, {
      key: 'loaded',
      value: function loaded() {
        _loaded = true;
      }
    }, {
      key: 'getSound',
      value: function getSound(index) {
        return this.buffer[index];
      }
    }]);

    return Buffer;
  }();

  var balls = null,
    preset = 0,
    _loaded = false;
  var path = 'NG/Soundsgir2/';
  var sounds = ['61546.mp3', '77279.mp3', '11968.mp3', '63974.mp3', '79484.mp3', '98115.mp3', '10175.mp3', '29698.mp3', '18603.mp3', '90818.mp3', '24115.mp3', '57657.mp3', '59858.mp3', '55037.mp3', '57183.mp3', '25299.mp3', '37228.mp3', '28259.mp3', '31890.mp3', '12656.mp3', '58358.mp3', '67430.mp3', '43127.mp3', '26130.mp3', '91618.mp3', '65861.mp3', '37930.mp3', '82083.mp3', '71748.mp3', '28360.mp3', '83740.mp3', '31715.mp3', '73389.mp3', '56335.mp3', '59962.mp3', '45133.mp3'].map(function (filename) {
    return chrome.runtime.getURL(path + filename);
  });
  var context = new (window.AudioContext || window.webkitAudioContext)();

  function playBalls() {
    var index = parseInt(this.dataset.note) + preset;
    balls = new Balls(context, buffer.getSound(index));
    balls.play();
  }

  function stopBalls() {
    balls.stop();
  }

  var buffer = new Buffer(context, sounds);
  var ballsSound = buffer.getBuffer();
  var buttons = document.querySelectorAll('.b-ball_bounce');
  buttons.forEach(function (button) {
    button.addEventListener('mouseenter', playBalls.bind(button));
    button.addEventListener('mouseleave', stopBalls);
  });

  function ballBounce(e) {
    var i = e;
    if (e.className.indexOf(" bounce") > -1) {
      return;
    }
    toggleBounce(i);
  }

  function toggleBounce(i) {
    i.classList.add("bounce");
    function n() {
      i.classList.remove("bounce");
      i.classList.add("bounce1");
      function o() {
        i.classList.remove("bounce1");
        i.classList.add("bounce2");
        function p() {
          i.classList.remove("bounce2");
          i.classList.add("bounce3");
          function q() {
            i.classList.remove("bounce3");
          }
          setTimeout(q, 300);
        }
        setTimeout(p, 300);
      }
      setTimeout(o, 300);
    }
    setTimeout(n, 300);
  }

  var array1 = document.querySelectorAll('.b-ball_bounce');
  var array2 = document.querySelectorAll('.b-ball_bounce .b-ball__right');

  for (var i = 0; i < array1.length; i++) {
    array1[i].addEventListener('mouseenter', function () {
      ballBounce(this);
    });
  }

  for (var i = 0; i < array2.length; i++) {
    array2[i].addEventListener('mouseenter', function () {
      ballBounce(this);
    });
  }

  var l = ["49", "50", "51", "52", "53", "54", "55", "56", "57", "48", "189", "187", "81", "87", "69", "82", "84", "89", "85", "73", "79", "80", "219", "221", "65", "83", "68", "70", "71", "72", "74", "75", "76", "186", "222", "220"];
  var k = ["90", "88", "67", "86", "66", "78", "77", "188", "190", "191"];
  var a = {};
  for (var e = 0, c = l.length; e < c; e++) {
    a[l[e]] = e;
  }
  for (var _e = 0, _c = k.length; _e < _c; _e++) {
    a[k[_e]] = _e;
  }
}