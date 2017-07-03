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

    $('#product-body').wysiwyg();
    $('#product-body').append($("#id_body").val());

    var specPriceOrigin = $.parseJSON($("#id_spec_price").val());

    var initComplete = false;

    function refreshPriceTable() {
        if (!initComplete)
            return;

        var spec1Options = $('#product-spec1-options').val().split(",");
        var spec2Options = $('#product-spec2-options').val().split(",");

        // clear old data
        $("#product-price-table > tbody > tr").remove();
        var productPriceBody = $("#product-price-table > tbody");
        // add updated data
        var useSpec2 = $("#id_use_spec2").is(':checked');
        var spec1html = "";
        var spec2html = "";
        var pricehtml = "";
        for (var i = 0; i < spec1Options.length; i++) {
            if (useSpec2) {
                for (var j = 0; j < spec2Options.length; j++) {
                    var originPrice = _.find(specPriceOrigin, function (p) {
                        return p.spec1 == spec1Options[i] && p.spec2 == spec2Options[j];
                    });
                    if (originPrice == undefined) {
                        pricehtml = "<td><input class='spec-price-input' type='number' name='' value='100'></td>";
                    } else {
                        pricehtml = "<td><input class='spec-price-input' type='number' name='' value='" + originPrice.price + "'></td>";
                    }
                    spec1html = "<td>" + spec1Options[i] + "</td>";
                    spec2html = useSpec2 ? "<td>" + spec2Options[j] + "</td>" : "<td></td>";
                    productPriceBody.append("<tr>" + spec1html + spec2html + pricehtml + "</tr>");
                }
            } else {
                var originPrice = _.find(specPriceOrigin, function (p) {
                    return p.spec1 == spec1Options[i];
                });
                if (originPrice == undefined) {
                    pricehtml = "<td><input class='spec-price-input' type='number' name='' value='100'></td>";
                } else {
                    pricehtml = "<td><input class='spec-price-input' type='number' name='' value='" + originPrice.price + "'></td>";
                }
                spec1html = "<td>" + spec1Options[i] + "</td>";
                spec2html = "<td></td>";
                productPriceBody.append("<tr>" + spec1html + spec2html + pricehtml + "</tr>");
            }
        }
    };

    $('#product-spec1-options').tagsInput({
        'height': 'auto',
        'width': '100%',
        'defaultText': '+',
        'onChange': function () {
            $("#id_spec1_options").val($(this).val());
            refreshPriceTable();
        }
    });

    $('#product-spec2-options').tagsInput({
        'height': 'auto',
        'width': '100%',
        'defaultText': '+',
        'onChange': function () {
            $("#id_spec2_options").val($(this).val());
            refreshPriceTable();
        }
    });

    initComplete = true;
    refreshPriceTable();


    $("#id_use_spec2").click(function () {
        if ($(this).is(':checked')) {
            $("#spec2-name").text($("#id_spec2_name").val());
        } else {
            $("#spec2-name").text("");
        }
        refreshPriceTable();
    })

    $("#id_spec2_name").on("change paste keyup", function () {
        if ($("#id_use_spec2").is(':checked')) {
            $("#spec2-name").text($(this).val());
        }
    })

    $('#product-main-img').click(function (e) {
        e.preventDefault();
        $('#myModal').modal();
    })


    $("#sortable").sortable({
        placeholder: "ui-state-highlight"
    });
    $("#sortable").disableSelection();

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

    $(".slideshow-thumb").click(function () {
        $("#product-main-img").removeClass("tall");
        $("#product-main-img").removeClass("wide");
        $("#product-main-img img").attr("src", $(this).attr("image-url"));
        var imgClass = ($("#product-main-img img").height() * 1.0 / $("#product-main-img img").width() > 0.75) ? 'tall' : 'wide';
        $("#product-main-img").addClass(imgClass);
    });

    $(".slideshow-thumb").first().click();

    function checkValidation() {
        return true;
    }

    function updateHiddenFields() {
        // update spec price
        var specPriceObj = [];
        $("#product-price-table > tbody > tr").each(function (index, el) {
            var fields = $(el).find("td");
            specPriceObj.push({"spec1": fields.eq(0).text(), "spec2": fields.eq(1).text(), "price": fields.eq(2).find("input").val()})
        });
        $("#id_spec_price").val(JSON.stringify(specPriceObj));

        // update body html
        $("#id_body").val($("#product-body").html());

        // update related images

    }

    $("#product-form").submit(function (event) {
        if (checkValidation()) {
            updateHiddenFields();
            return;
        }
        // update hidden fields
        event.preventDefault();
    });

})
