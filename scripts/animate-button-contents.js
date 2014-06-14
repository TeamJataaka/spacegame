(function () {
    var allMenuButtons = $('.menu-button');
    var dimmer = $('#dimmer');
    var allContentItems = $('div.li-item-content');

    $('#play-button').off('click').on('click', function () {
        window.open('SpaceGame/index.html');
        window.close();
    });

    allMenuButtons.click(function () {
        $this = $(this);
        var dataID = $this.attr('data-id');
        var contentToDisplay = $('div[data-id=' + dataID + ']');

        var visibleElements = allContentItems.filter(selectVisibleElements);

        if (visibleElements.length !== 0) {
            menuSlideCloseSound.play();
        }

        allContentItems.not(contentToDisplay).slideUp(500);

        if (contentToDisplay.is(':visible') == false) {
            menuSlideOpenSound.play();
        }

        contentToDisplay.toggle(500);

        if ($this.attr('data-cntrls')) {
            centerControlsTable();
        } else if ($this.attr('data-authors')) {
            centerAuthorsTable();
        }
    });

    allMenuButtons.mouseenter(function () {
        menuButtonHoverSound.currentTime = 0;
        menuButtonHoverSound.play();
    });

    function selectVisibleElements() {
        var currElem = $(this);
        if (currElem.css('display') !== 'none') {
            return currElem;
        }
    }
})()