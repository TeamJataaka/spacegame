/// <reference path="../../../splashscreen/splashscreen.html" />

var gameIsPaused = false;
(function () {
    var pauseScreen = $('#pause-screen');
    var psContent = pauseScreen.find('.content');
    var btnWrapper = psContent.find('.button-wrapper');
    var exitGameButt = $('#exit-game-butt');
    var resumeGameButt = $('#resume-game-butt');
    var mainMenuButt = $('#pause-screen .main-menu');
    var allPauseScreenButtons = $('#pause-screen .menu-button');
    var menuButtonHoverSound =
        new Audio('../splashscreen/sounds/menu-button-hover.wav');
    var menuSlideOpenSound =
        new Audio('../splashscreen/sounds/menu-item-open.wav');
    var menuSlideCloseSound =
        new Audio('../splashscreen/sounds/menu-item-close.wav');

    document.addEventListener('keydown', togglePause);
    $(window).on('resize', centerPauseScreenButtons);
    exitGameButt.on('click', exitGame);
    resumeGameButt.on('click', resumeGame);
    mainMenuButt.on('click', returnToMainMenu);

    allPauseScreenButtons.mouseenter(function () {
        menuButtonHoverSound.currentTime = 0;
        menuButtonHoverSound.play();
    });

    function togglePause(e) {
        if (e.keyCode !== 27) {
            return;
        }

        pauseScreen.fadeToggle(500);
        centerPauseScreenButtons();

        if (gameIsPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
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

    function pauseGame() {
        gameIsPaused = true;
        menuSlideOpenSound.play();
        window.cancelAnimationFrame(requestedId);
    }

    function resumeGame() {
        pauseScreen.fadeOut(200);
        gameIsPaused = false;
        menuSlideCloseSound.play();
        window.animate();
    }

    function exitGame() {
        if (confirm('Are you sure you wish to exit the game?')) {
            window.close();
        }
    }

    function returnToMainMenu() {
        if (confirm('Are you sure?\nYour progress will be lost.')) {
            document.location = '../splashscreen/main-menu.html';
        }
    }
})();