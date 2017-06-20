/**
 * Created by josh on 17/6/16.
 */
$(document).ready(function () {
    var move = function () {
        var b = $(window).scrollTop();
        var d = $("#scroller-anchor").offset().top;
        var c = $(".item-top-fixed");
        var parent_width = $(".item-top-placeholder").width();
        if (b > d) {
            c.css({position: "fixed", top: "0px", width: parent_width + "px"})
        } else {
            if (b <= d) {
                c.css({position: "relative", top: "", width: ""})
            }
        }
    };
    $(window).scroll(move);
    move();

    $('#product-spec1').tagsInput({
        'height': 'auto',
        'width': '100%',
        'defaultText': '+',
    });
    $('#product-spec2').tagsInput({
        'height': 'auto',
        'width': '100%',
        'defaultText': '+',
    });

    $('#product-main-img').click(function (e) {
        e.preventDefault();
        $('#myModal').modal();
    })

    $("#sortable").sortable({
        placeholder: "ui-state-highlight"
    });
    $("#sortable").disableSelection();
})
