(function () {
    var allMenuButtons = $('.menu-button');
    var dimmer = $('#dimmer');
    var allContentItems = $('div.li-item-content');

    allMenuButtons.click(function () {
        $this = $(this);
        var dataID = $this.attr('data-id');

        var contentToDisplay = $('div[data-id=' + dataID + ']');
        allContentItems.not(contentToDisplay).slideUp(500);
        contentToDisplay.toggle(1000);

        if ($this.attr('data-cntrls')) {
            centerControlsTable();
        } else if ($this.attr('data-authors')) {
            centerAuthorsTable();
        }
    });
})()