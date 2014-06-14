var win = $(window);
var muteButt;
var controlsTable = $('table');
var authorsTable = $('div#authors-wrapper');
var controlsWrapper = $('#controls-wrapper');
var menuButtonHoverSound = new Audio('sounds/menu-button-hover.wav');
var menuSlideOpenSound = new Audio('sounds/menu-item-open.wav');
var menuSlideCloseSound = new Audio('sounds/menu-item-close.wav');
var menuSound = new Audio('sounds/menu-sound.wav');
menuSound.loop = true;
var soundOnSrc = 'imgs/soundOn.png';
var soundOffSrc = 'imgs/soundOff.png';

function centerControlsTable() {
    var winWidth = win.width();
    var winHeight = win.height();
    var tableTop = (winHeight - parseFloat(controlsTable.height())) / 2;
    var tableLeft = (winWidth - parseFloat(controlsTable.outerWidth())) / 2;
    controlsTable.css({
        top: tableTop,
        left: tableLeft
    });
}

function centerAuthorsTable() {
    var winWidth = win.width();
    var winHeight = win.height();
    var tableTop = (winHeight - parseFloat(authorsTable.height())) / 2;
    var tableLeft = (winWidth - parseFloat(authorsTable.outerWidth())) / 2;
    authorsTable.css({
        top: tableTop,
        left: tableLeft
    });
}

function createMuteButton() {
    if (muteButt !== undefined) {
        return;
    }
    muteButt = $('<img id="soundToggle" src="imgs/soundOff.png" />');
    muteButt.on('click', toggleMute);
    controlsWrapper.append(muteButt);
}

function toggleMute() {
    menuSound.muted = !menuSound.muted;
    var currSrc = muteButt.attr('src');

    if (currSrc === soundOnSrc) {
        muteButt.attr('src', 'imgs/soundOff.png');
    } else {
        muteButt.attr('src', 'imgs/soundOn.png');
    }
}