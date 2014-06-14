(function myfunction() {

    var displayIntro = true;

    var presents = $('#presents');
    var title = presents.next();
    var small = title.next();
    var menuWrapper = $('#menu-wrapper');

    if (displayIntro) {
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
                menuSound.play();
                title.attr('src', 'imgs/gos-blk-100-2-fix.png');
                small.fadeOut(1000);

                doc.off('click');
                win.off('resize');

                win.resize(centerControlsTable);
                win.resize(centerAuthorsTable);

                centerControlsTable();

                title.fadeOut(2000);
                setTimeout(initializeMenu, 1000);
            });
        }, 9500)
    } else {
        menuSound.play();
        menuWrapper.fadeIn(500);
        centerControlsTable();
    }

    win.resize(centerControlsTable);
    win.resize(centerAuthorsTable);
    createMuteButton();

    function initializeMenu() {
        //centerMenuWrapper();
        //win.resize(centerMenuWrapper);
        menuWrapper.fadeIn(6500);
    }
})()