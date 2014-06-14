(function () {

    var win = $(window);
    var scWrapper = $('#start-screen-wrapper');
    var wrapperWidth = scWrapper.outerWidth();
    var wrapperHeight = scWrapper.outerHeight();

    function centerStartScreen() {
        var winWidth = win.width();
        var winHeight = win.height();
        var marginTop = (winHeight - wrapperHeight) / 2;

        scWrapper.css({
            left: (winWidth - wrapperWidth) / 2,
            top: marginTop * 0.60
        });
    }

    centerStartScreen();
    win.resize(centerStartScreen)
})()