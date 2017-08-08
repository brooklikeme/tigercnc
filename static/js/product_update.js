/**
 * Created by josh on 17/6/16.
 */
$(document).ready(function () {
    var lastActiveNavID = "";

    var move = function () {
        var b = $(window).scrollTop();
        var d = $("#scroller-anchor").offset().top;
        var c = $(".item-top-fixed");
        var e = $("#toolbar-scroller-anchor").offset().top;
        var f = $(".btn-toolbar");
        var offsetHeight = c.height();
        var parent_width = $(".item-top-placeholder").width();
        var body_bottom = $("#product-body").offset().top + $("#product-body").height();
        if (b > d) {
            c.css({position: "fixed", top: "0px", width: parent_width + "px"})
        } else {
            c.css({position: "relative", top: "", width: ""})
        }
        if (b + offsetHeight > e && body_bottom - b > 200) {
            f.css({position: "fixed", top: offsetHeight + "px", width: parent_width + "px"})
        } else {
            f.css({position: "relative", top: "", width: ""})
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

    function openImageFilter(emptySelected, callback) {
        $('#image-filter').modal();
        SelectedImages.reset({});
        if (!emptySelected) {
            $(".slideshow-thumb").each(function (index, el) {
                SelectedImages.add(
                    {
                        id: parseInt($(el).attr('data-id')),
                        name: $(el).attr('name'),
                        is_video: $(el).attr('is-video') == "False" || $(el).attr('is-video') =="false" ? false : true,
                        video_html: $(el).attr('video-html'),
                        thumbnail_url: $(el).attr('thumbnail-url'),
                        image_url: $(el).attr('image-url')
                    });
            });
        }
        ImageControl.initUI();
        // confirm
        $("#confirm-image-filter").unbind("click");
        $("#confirm-image-filter").on("click", callback);
    };

    $('#product-body').wysiwyg({openImageDialog: function() {
        openImageFilter(true, function () {
            $('#product-body').focus();
            // insert image
            $(".ui-state-default").each(function (index, el) {
                document.execCommand('InsertImage', false, $(el).attr('image-url'));
            });
            // hide modal window
            $('#image-filter').modal('hide');
        });
    }});
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
        openImageFilter(false, function () {
            $("#product-slideshow-strip .slideshow-thumb").remove();
            var template_html = $("#thumb-template").html();
            var thumb_image_ids = [];
            $(".ui-state-default").each(function (index, el) {
                console.log($(el).attr('thumbnail_url'));
                thumb_image_ids.push(parseInt($(el).attr('data-id')));
                $("#product-slideshow-strip").append(_.template(template_html, {
                    id: $(el).attr('data-id'),
                    name: $(el).attr('name'),
                    is_video: $(el).attr('is-video'),
                    video_html: $(el).attr('video-html'),
                    thumbnail_url: $(el).attr('thumbnail-url'),
                    image_url: $(el).attr('image-url')
                }));
            });
            // update thumb image ids
            $("#id_images").val(thumb_image_ids.join(","));
            // hide modal window
            $('#image-filter').modal('hide');
            // reset click functions
            $(".slideshow-thumb").click(slideshowThumbClick);
            $(".slideshow-thumb").first().click();
        });
    })


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

    function slideshowThumbClick() {
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
    }

    $(".slideshow-thumb").click(slideshowThumbClick);

    $(".slideshow-thumb").first().click();

    function checkValidation() {
        return true;
    }

    function updateHiddenFields() {
        // update spec price
        var specPriceObj = [];
        $("#product-price-table > tbody > tr").each(function (index, el) {
            var fields = $(el).find("td");
            specPriceObj.push({
                "spec1": fields.eq(0).text(),
                "spec2": fields.eq(1).text(),
                "price": fields.eq(2).find("input").val()
            })
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

    // cancel
    $("#cancel-image-filter").click(function () {
        $('#image-filter').modal('hide');
    });

})
