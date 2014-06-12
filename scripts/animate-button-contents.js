(function () {
    var allMenuButtons = $('.menu-button');

    allMenuButtons.click(function () {
        $this = $(this);
        var contentToDisplay = $this.siblings('.li-item-content')[0];
        contentToDisplay = $(contentToDisplay);
        var allContentItems = $('.li-item-content');
        allContentItems.not(contentToDisplay).slideUp(500);
        contentToDisplay.toggle(1000);
        if ($this.attr('data-cntrls')) {
            centerControlsTable();
        }
    });
})()