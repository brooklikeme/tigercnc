/**
 * Created by josh on 17/6/16.
 */
$(document).ready(function () {

    var lastActiveNavID = "";

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

        // active nav
        var anchorLists = [];
        $(".detail-anchor").each(function () {
            anchorLists.push({
                id: $(this).attr("id"),
                top: $(this).offset().top
            });
        });

        var areaTop;
        var areaBottom;
        for (var i = 0; i < anchorLists.length; i++) {
            areaTop = i == 0 ? 0 : anchorLists[i].top - 80;
            areaBottom = i == anchorLists.length - 1 ? 10000 : anchorLists[i + 1].top - 80;
            if (b >= areaTop && b < areaBottom) {
                if (lastActiveNavID != anchorLists[i].id) {
                    // active nav item
                    $(".detail-anchor-nav").closest("li").removeClass("active");
                    $(".detail-anchor-nav[href='#" + anchorLists[i].id + "']").closest("li").addClass("active");
                    lastActiveNavID = anchorLists[i].id;
                }
                break;
            }
        }

    };
    $(window).scroll(move);
    move();

    $(document).on('click', 'a.detail-anchor-nav', function (event) {
        event.preventDefault();

        var href = $.attr(this, 'href');
        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top - 65
        }, 500, function () {
            window.location.hash = href;
        });
    });

    function refreshSpecPrice() {
        var selectedSpec1 = $("#spec1-options .spec-option.selected").text();
        var selectedSpec2 = $("#spec2-options .spec-option.selected").text();
        var spec_price = $.parseJSON($("#product-price").attr("spec-price"));
        for (var i = 0; spec_price && spec_price.length > 0 && i < spec_price.length; i++) {
            if (spec_price[i].spec1 == selectedSpec1 && spec_price[i].spec2 == selectedSpec2) {
                $(".product-price-price").text("¥ " + spec_price[i].price);
                break;
            }
        }
    };

    $("#spec1-options .spec-option").click(function () {
        $("#spec1-options .spec-option").removeClass("selected");
        $(this).addClass("selected");
        refreshSpecPrice();
    });

    $("#spec2-options .spec-option").click(function () {
        $("#spec2-options .spec-option").removeClass("selected");
        $(this).addClass("selected");
        refreshSpecPrice();
    });

    refreshSpecPrice();

    // product image
    var imagePosition = 0;
    var imageContainer = $("#product-slideshow-container");
    var imageStrip = $("#product-slideshow-strip");
    var containerWidth = imageContainer.width();
    var stripWidth = imageStrip.width();

    function refreshImageArrowStatus() {
        imagePosition > 0
            ? $("#product-slideshow-left-arrow").addClass("enabled")
            : $("#product-slideshow-left-arrow").removeClass("enabled");
        imagePosition + containerWidth < stripWidth
            ? $("#product-slideshow-right-arrow").addClass("enabled")
            : $("#product-slideshow-right-arrow").removeClass("enabled");
    };

    $("#product-slideshow-left-arrow").click(function () {
        if (imagePosition >= containerWidth) {
            imagePosition -= containerWidth;
        } else {
            imagePosition = 0;
        }
        imageStrip.animate({left: "-" + imagePosition + "px"}, 700);
        refreshImageArrowStatus();
    });

    $("#product-slideshow-right-arrow").click(function () {
        var hiddenWidth = stripWidth - imagePosition;
        if (hiddenWidth >= containerWidth) {
            imagePosition += containerWidth;
        } else {
            imagePosition += hiddenWidth;
        }
        imageStrip.animate({left: "-" + imagePosition + "px"}, 700);
        refreshImageArrowStatus();
    });

    refreshImageArrowStatus();

    $(".slideshow-thumb").click(function() {
        $(".slideshow-thumb").removeClass("selected");
        $(this).addClass("selected");
        $("#product-main-img").removeClass("thin");
        $("#product-main-img").removeClass("tall");
        $("#product-main-img").removeClass("wide");
        var elImage = $("#product-main-img img");
        elImage.attr("src", $(this).attr("image-url"));
        $("#product-main-img").attr("is-video", $(this).attr("is-video"));
        var heightWidthRatio = elImage.height() * 1.0 / elImage.width();
        var imgClass = (heightWidthRatio > 0.75) ? 'tall' : 'wide';
        if (heightWidthRatio < 0.75) {
            $("#product-main-img").css("padding-bottom",  heightWidthRatio * 100 + "%")
        } else {
            $("#product-main-img").css("padding-bottom",  "75%")
        }
        $("#product-main-img").addClass(imgClass);
    });

    $(".slideshow-thumb").first().click();
})
