var win = $(window);
var controlsTable = $('table');

function centerControlsTable() {
    var winWidth = win.width();
    var winHeight = win.height();
    var tableTop = (winHeight - parseFloat(controlsTable.height())) / 2;
    var tableLeft = (winWidth - parseFloat(controlsTable.outerWidth())) / 2;
    controlsTable.css({
        top: tableTop - 100,
        left: tableLeft
    });
}