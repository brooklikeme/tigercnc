/**
 * Created by josh on 17/6/16.
 */
$(document).ready(function () {
    var move = function () {
        var b = $(window).scrollTop();
        var d = $("#scroller-anchor").offset().top;
        var c = $("#item-category");
        if (b > d && $(window).width() > 768) {
            c.css({position: "fixed", top: "0px"})
        } else {
            if (b <= d) {
                c.css({position: "relative", top: ""})
            }
        }
    };
    $(window).scroll(move);
    move();
})
