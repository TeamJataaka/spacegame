(function () {
    var allMenuButtons = $('.menu-button');

    allMenuButtons.click(function () {

        var contentToDisplay = $(this).siblings('.li-item-content')[0];
        contentToDisplay = $(contentToDisplay);

        var allContentItems = $('.li-item-content');

        allContentItems.not(contentToDisplay).slideUp(500);

        //adjustLeftMarginOfAuthorsWrapper()
        contentToDisplay.toggle(1000);
    });
})()