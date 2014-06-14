/// <reference path="../../../splashscreen/splashscreen.html" />
(function () {
    var pauseScreen = $('#pause-screen');
    var psContent = pauseScreen.find('#content');
    var btnWrapper = psContent.find('.button-wrapper');
    var exitGameButt = $('#exit-game-butt');
    var resumeGameButt = $('#resume-game-butt');
    var mainMenuButt = $('#main-menu');
    document.addEventListener('keydown', togglePause);
    $(window).on('resize', centerPauseScreenButtons);
    var gameIsPaused = false;

    exitGameButt.on('click', exitGame);
    resumeGameButt.on('click', resumeGame);
    mainMenuButt.on('click', returnToMainMenu);

    function togglePause(e) {
        if (e.keyCode != 27) {
            return;
        }

        pauseScreen.fadeToggle(200);
        centerPauseScreenButtons();

        if (gameIsPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }

    function pauseGame() {
        gameIsPaused = true;
    }

    function resumeGame() {
        pauseScreen.fadeOut(200);
        gameIsPaused = false;
    }

    function exitGame() {
        // maybe messages and stuff here?
        if (confirm('Are you sure you wish to exit the game?')) {
            window.close();
        }
    }

    function returnToMainMenu() {
        document.location = '../splashscreen/main-menu.html';
        //var newWin = document.open('../splashscreen/splashscreen-nointro.html');
    }

    function centerPauseScreenButtons() {
        var cntWidth = psContent.outerWidth();
        var cntHeight = psContent.outerHeight();
        var wrpHeight = btnWrapper.outerHeight();
        var wrpWidth = btnWrapper.outerWidth();

        btnWrapper.css({
            left: (cntWidth - wrpWidth) / 2,
            top: (cntHeight - wrpHeight) / 2 - 25,
        });
    }
})()