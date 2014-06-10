(function myfunction() {

    var presents = $('#presents');
    var title = presents.next();
    var small = title.next();
    var win = $(window);
    var menuWrapper = $('#menu-wrapper');

    // comment this out, uncoment whats below
    //menuWrapper.fadeIn(500);
    //centerMenuWrapper();
    //win.resize(centerMenuWrapper);

    presents.css('display', 'block').hide();
    title.css('display', 'block').hide();
    small.css('display', 'block').hide();

    presents.fadeIn(4000);
    presents.fadeOut(1500);

    setTimeout(function () {
        title.fadeIn(4000);
    }, 5500);

    setTimeout(function () {
        small.fadeIn(1000);
        var doc = $(document);

        doc.on('click', function () {
            title.fadeOut(2000);
            doc.off('click');
            win.off('resize');

            centerMenuWrapper();
            win.resize(centerMenuWrapper);

            menuWrapper.fadeIn(6500);
            small.fadeOut(1000);
        });
    }, 9500)

    function centerMenuWrapper() {
        var winWidth = win.width();
        var winHeight = win.height();
        menuWrapper.height(winHeight);
        menuWrapper.width(winWidth);
        //adjustLeftMarginOfAuthorsWrapper();
    }
})()

//function adjustLeftMarginOfAuthorsWrapper() {
//    var authorsWrapper = $('#authors-wrapper');
//    var awParent = authorsWrapper.parent();
//    var marginLeft = (awParent.width() - authorsWrapper.width()) / 2;

//    if (marginLeft > 0) {
//        authorsWrapper.css('margin-left', marginLeft * 0.89);
//    }
//}