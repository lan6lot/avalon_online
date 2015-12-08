;(function(win) {

    'use strict'
    
    var h,
        dpr = win.navigator.appVersion.match(/iphone/gi)?win.devicePixelRatio:1,
        scale = 1 / dpr,
        docEl = document.documentElement,
        metaEl = document.createElement('meta');

    function setUnitA(){
        win.rem = docEl.getBoundingClientRect().width / 16;
        if(win.rem/win.dpr >= 33.75){
            docEl.style.fontSize = 33.75*win.dpr + 'px';
        }else{
            docEl.style.fontSize = win.rem + 'px';
        }
    }

    win.dpr = dpr;
    win.addEventListener('resize', function() {
        clearTimeout(h);
        h = setTimeout(setUnitA, 300);
    }, false);
    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(h);
            h = setTimeout(setUnitA, 300);
        }
    }, false);

    docEl.setAttribute('data-dpr', dpr);
    metaEl.setAttribute('name', 'viewport');
    metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    if (docEl.firstElementChild) {
        docEl.firstElementChild.appendChild(metaEl);    
    } else {
        var wrap = document.createElement('div');
        wrap.appendChild(metaEl);
        document.write(wrap.innerHTML);
    }
    
    setUnitA();
})(window);
