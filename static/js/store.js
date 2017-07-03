/**
 * Created by josh on 17/6/16.
 */
$(document).ready(function () {
    var lastActiveNavID = "";

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
        // active nav
        var categoryLists = [];
        $(".item-category-list").each(function () {
            categoryLists.push({
                id: $(this).attr("id"),
                top: $(this).offset().top
            });
        });

        var areaTop;
        var areaBottom;
        for (var i = 0; i < categoryLists.length; i++) {
            areaTop = i == 0 ? 0 : categoryLists[i].top - 80;
            areaBottom = i == categoryLists.length - 1 ? 10000 : categoryLists[i + 1].top - 80;
            if (b >= areaTop && b < areaBottom) {
                if (lastActiveNavID != categoryLists[i].id) {
                    // active nav item
                    $(".category-nav-link").closest("li").removeClass("active");
                    $(".category-nav-link[href='#" + categoryLists[i].id + "']").closest("li").addClass("active");
                    lastActiveNavID = categoryLists[i].id;
                }
                break;
            }
        }
    };
    $(window).scroll(move);

    move();

    $(document).on('click', 'a.category-nav-link', function (event) {
        console.log(11111);
        event.preventDefault();

        var href = $.attr(this, 'href');
        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top - 10
        }, 500, function () {
            window.location.hash = href;
        });
    });

    // Product Item
    // --------------
    var Product = Backbone.Model.extend({

        urlRoot: '',

        initialize: function () {
            // this.reportPlots = new ReportPlotList;
            // this.reportPlots.url = '/api/report/' + this.id + '/report_plots';
            //this.reportPlots.on("reset", this.updateCounts);
        },

    });

    // Product View
    // **************
    var ProductView = Backbone.View.extend({

        // container element
        tagName: "div",

        // class name
        className: "item-box",

        // Cache the template function for a single item.
        template: _.template($('#product-template').html()),

        // Reserved Events
        events: {},

        // Reserved Initialization
        initialize: function () {
        },

        // Re-render the list item.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

    });

    // Product List
    // --------------
    var ProductList = Backbone.Collection.extend({

        // model
        model: Product,

        // url
        url: "/products"

    });

    // Product Category Item
    // --------------
    var ProductCategory = Backbone.Model.extend({

        urlRoot: '',

        initialize: function () {
            this.products = new ProductList;
        },

    });

    // Product Category Navigation View
    // **************
    var ProductCategoryNavView = Backbone.View.extend({

        // container element
        tagName: "li",

        // class name
        className: "",

        // Cache the template function for a single item.
        template: _.template($('#product-category-nav-template').html()),

        // Reserved Events
        events: {},

        // Reserved Initialization
        initialize: function () {
            // bind this

            // define variables
        },

        // Re-render the list item.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

    });


    // Product Category View
    // **************
    var ProductCategoryView = Backbone.View.extend({

        // container element
        tagName: "div",

        // class name
        className: "item-category-list",

        // Cache the template function for a single item.
        template: _.template($('#product-category-template').html()),

        // Reserved Events
        events: {},

        // Reserved Initialization
        initialize: function () {
            // bind this

            _.bindAll(this, "addOne");

            this.$el.addClass("col-xs-24");

            // define variables

            // bind view to functions
            this.model.products.bind('reset', this.addAll, this);
        },

        // add one
        addOne: function (item) {
            var view = new ProductView({
                model: item,
                className: "item-box col-xs-12 col-md-8",
                attributes: {'data-id': item.get('id')}
            });
            this.$(".category-items").append(view.render().el);
        },

        // add one
        addAll: function (item) {
            this.model.products.each(this.addOne);
        },

        // Re-render the list item.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

    });


    // Product Category List
    // --------------
    var ProductCategoryList = Backbone.Collection.extend({

        // model
        model: ProductCategory,

        // url
        url: "/product_categorys"

    });

    // Define product categorys instance
    var ProductCategorys = new ProductCategoryList;

    // Store List Ctl View
    // **************
    var StoreControlView = Backbone.View.extend({

        // bind to the existing skeleton that already present in the HTML.
        el: $("#page-top"),

        // Delegated events
        events: {},

        // init
        initialize: function () {

            // bind view to functions
            _.bindAll(this, 'addOneCategory', 'addOneCategoryNav');
            // init variables
            this.categoryContainer = this.$("#product-categorys");
            this.categoryNavContainer = this.$("#product-category-nav");

            // init binding events
            ProductCategorys.bind('reset', this.addAllCategorys, this);

            // load data from db
            ProductCategorys.fetch({reset: true});

        },

        // add one category nav
        addOneCategoryNav: function (item) {
            var view = new ProductCategoryNavView({model: item, className: item.id == 1 ? "active" : ""});
            this.categoryNavContainer.append(view.render().el);
        },

        // add one category
        addOneCategory: function (item) {
            var view = new ProductCategoryView({
                model: item,
                attributes: {'id': "category-" + item.get('id')}
            });
            this.categoryContainer.append(view.render().el);
            item.products.fetch({
                reset: true,
                data: {product_category_id: item.get('id')},
                success: function (collection, response, options) {
                }
            });
        },

        // add all categorys
        addAllCategorys: function (item) {
            // add category list first
            ProductCategorys.each(this.addOneCategoryNav);

            // add category products then
            ProductCategorys.each(this.addOneCategory);
        },

    });

    // start Instance
    var StoreControl = new StoreControlView;

})
