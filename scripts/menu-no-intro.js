(function () {
    var menuWrapper = $('#menu-wrapper');
    //var menuSound = new Audio('sounds/menu-sound.wav');
    //menuSound.loop = true;

    menuSound.play();
    menuWrapper.fadeIn(2000);
    centerControlsTable();
    createMuteButton();
    win.resize(centerControlsTable);
    win.resize(centerAuthorsTable);
})()