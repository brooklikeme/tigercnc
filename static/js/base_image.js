$(function () {

    // Folder Item
    // --------------
    var Folder = Backbone.Model.extend({

        urlRoot: '/api/imagefolders/',

        initialize: function () {
            // this.reportPlots = new ReportPlotList;
            // this.reportPlots.url = '/api/report/' + this.id + '/report_plots';
            //this.reportPlots.on("reset", this.updateCounts);
        },

    });

    // Folder View
    // **************
    var FolderView = Backbone.View.extend({

        // container element
        tagName: "li",

        // class name
        className: "image-folder list-group-item",

        // Cache the template function for a single item.
        template: _.template($('#folder-template').html()),

        // Reserved Events
        events: {
            // "click.image-folder": "selectFolder",
        },

        // Reserved Initialization
        initialize: function () {
            _.bindAll(this, "addFolder");
            this.model.bind('remove', this.remove, this);
            this.model.bind('change', this.render, this);
            this.model.bind('delete', this.deleteFolder, this);
            this.model.bind('rename', this.renameFolder, this);
        },

        // add folder
        addFolder: function (item) {
            var folder = this.model;
            var self = this;

            // remove editable feature
            this.$(".folder-name").editable("destroy");

            this.$(".folder-name").bind("hidden", function (e, reason) {
                self.$el.removeClass("editing");
                if (reason == "cancel") {
                    // cancel save
                    self.model.destroy();
                }
            });

            // create editable
            this.$(".folder-name").editable({
                unsavedclass: null,
                type: 'text',
                mode: 'inline',
                toggle: 'manual',
                validate: function (value) {
                    if ($.trim(value) == '') {
                        return '目录名不能为空';
                    }
                },
                success: function (response, newValue) {
                    self.$el.removeClass("editing");
                    // update model
                    folder.save({name: newValue, userid: 1},
                        {
                            error: function (collection, response, options) {
                                console.log(response.responseText);
                            },
                            success: function (model, response) {
                                // refresh data-id attr
                                self.$el.attr("data-id", model.get('id'));
                            },
                        });
                }
            });
            this.$(".folder-name").editable("show");
            this.$el.addClass("editing");
        },

        // rename folder
        renameFolder: function (item) {
            var folder = this.model;
            var self = this;
            this.$(".folder-name").on("hidden", function (e, reason) {
                self.$el.removeClass("editing");
            });

            // remove editable feature
            this.$(".folder-name").editable("destroy");
            // create editable
            this.$(".folder-name").editable({
                unsavedclass: null,
                type: 'text',
                mode: 'inline',
                toggle: 'manual',
                validate: function (value) {
                    if ($.trim(value) == '') {
                        return '目录名不能为空';
                    }
                },
                success: function (response, newValue) {
                    self.$el.removeClass("editing");
                    // update model
                    folder.save({name: newValue}, {patch: true});
                }
            });
            this.$(".folder-name").editable("show");
            this.$el.addClass("editing");
        },

        deleteFolder: function (item) {
            var folder = this.model;
            var self = this;

            // remove editable feature
            this.$(".folder-name").editable("destroy");
            // create editable
            this.$(".folder-name").editable({
                unsavedclass: null,
                type: 'confirm',
                mode: 'popup',
                toggle: 'manual',
                title: '确认删除目录？',
                savenochange: true,
                placement: 'right',
                validate: function (value) {
                    if (folder.get('images') != 0) {
                        return '非空目录不能删除';
                    }
                },
                success: function (response, newValue) {
                    folder.destroy();
                    ImageControl.selectLast();
                }
            });
            this.$(".folder-name").editable("show");
        },

        // Re-render the list item.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            if (this.model.get('reserved')){
                this.$el.addClass("reserved");
            }
            this.model.el = this;
            return this;
        },

    });

    // Folder List
    // --------------
    var FolderList = Backbone.Collection.extend({

        // model
        model: Folder,

        // url
        url: "/api/imagefolders/"

    });

    // Define folders instance
    var Folders = new FolderList;


    // Image Item
    // --------------
    var Image = Backbone.Model.extend({

        urlRoot: '',

        initialize: function () {
        },

    });

    // Image View
    // **************
    var ImageView = Backbone.View.extend({

        // container element
        tagName: "div",

        // class name
        className: "image-item col-xs-12 col-sm-8 col-md-6 col-lg-4",

        // Cache the template function for a single item.
        template: _.template($('#image-template').html()),

        // Reserved Events
        events: {
            "click .select-image": "selectImage",
        },

        // Reserved Initialization
        initialize: function () {
            _.bindAll(this, 'initDelete', 'initUpdate', 'initFolder');
            this.model.bind('change', this.render, this);
            this.model.bind('remove', this.remove, this);
        },

        // delete image
        initDelete: function () {
            var image = this.model;
            var self = this;

            // create editable
            this.$(".delete-image").editable({
                unsavedclass: null,
                type: 'confirm',
                mode: 'popup',
                title: '删除图片？',
                savenochange: true,
                placement: 'bottom',
                emptytext: '',
                emptyclass: '',
                success: function (response, newValue) {
                    image.destroy({
                        success: function (model, response) {
                            Folders.fetch(
                                {
                                    success: function (collection, response, options) {
                                        ImageControl.selectLast();
                                    }
                                })
                        }
                    });
                }
            });
        },

        // update image
        initUpdate: function () {

        },

        // change folder
        initFolder: function () {
            var image = this.model;
            var self = this;

            // init source
            var selectSource = [];
            Folders.each(function(item) {
                if (!item.get("reserved")) {
                    selectSource.push({value: item.get('id'), text: item.get('name')});
                }
            });
            // create editable
            this.$(".change-folder").editable({
                unsavedclass: null,
                type: 'select',
                mode: 'popup',
                title: '选择图片目录',
                placement: 'bottom',
                emptytext: '',
                emptyclass: '',
                prepend: '<无>',
                value: image.get('imagefolder'),
                source: selectSource,
                display: false,
                success: function (response, newValue) {
                    image.save({imagefolder: newValue}, {
                        patch: true,
                        error: function (collection, response, options) {
                            console.log(response.responseText);
                        },
                        success: function (model, response) {
                            Folders.fetch(
                                {
                                    success: function (collection, response, options) {
                                        ImageControl.selectLast();
                                    }
                                })
                        },
                    });
                }
            });
        },

        // select image
        selectImage: function (ev) {
            console.log("selectImage");
        },

        // Re-render the list item.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            this.model.el = this;

            // init actions
            this.initDelete();
            this.initFolder();
            this.initUpdate();

            return this;
        },

    });

    // Image List
    // --------------
    var ImageList = Backbone.Collection.extend({

        // model
        model: Image,

        // url
        url: "/api/images",

        initialize: function () {
            _.bindAll(this, 'parse');

            this.perPage = 12;
        },

        // parse
        parse: function (resp) {
            this.count = resp.count;
            this.page = resp.page;
            this.pages = Math.floor((resp.count - 0.0001) / this.perPage) + 1;
            this.next = resp.next;
            this.previous = resp.previous;
            this.showingCount = resp.results.length;
            this.fromNum = (resp.page - 1) * this.perPage + 1;
            this.toNum = this.fromNum + this.showingCount - 1;
            return resp.results;
        },
    });

    // Define Image List instance
    var Images = new ImageList;

    // selected Image Item
    // --------------
    var SelectedImage = Backbone.Model.extend({

        urlRoot: '',

        initialize: function () {
        },

    });

    // SelectedImage View
    // **************
    var SelectedImageView = Backbone.View.extend({

        // container element
        tagName: "li",

        // class name
        className: "ui-state-default",

        // Cache the template function for a single item.
        template: _.template($('#selected-image-template').html()),

        // Reserved Events
        events: {
            "click .delete-selected-image": "deleteSelectedImage",
        },

        // Reserved Initialization
        initialize: function () {
            _.bindAll(this, '');
            this.model.bind('change', this.render, this);
            this.model.bind('remove', this.remove, this);
        },

        // delete selected image
        deleteSelectedImage: function (ev) {
            console.log("deleteSelectedImage");
        },

        // Re-render the list item.
        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

    });

    // Selected Image List
    // --------------
    var SelectedImageList = Backbone.Collection.extend({

        // model
        model: SelectedImage,

        // url
        url: "",

        initialize: function () {
            // _.bindAll(this, '');
        },
    });

    // Define Selected Image List instance
    var SelectedImages = new SelectedImageList;

    // Image Ctl View
    // **************
    var ImageControlView = Backbone.View.extend({

        // bind to the existing skeleton that already present in the HTML.
        el: $("#image-filter"),

        // Cache the template function for a single item.
        selectedImageTemplate: _.template($('#selected-image-template').html()),

        // Delegated events
        events: {
            "click #rename-folder:not(.disabled)": "renameFolder",
            "click #delete-folder:not(.disabled)": "deleteFolder",
            "click #create-folder": "createFolder",
            "click #change-folder": "changeFolder",
            "click #delete-images": "deleteImages",
            "click #upload-images": "uploadImages",
            "click #select-all-images": "selectAllImages",
            "click tbody :checkbox": "checkOne",
            "click thead :checkbox": "checkAll",
            "click .image-folder": "selectFolder",

        },

        // init
        initialize: function () {

            // bind view to functions
            _.bindAll(this, 'addOneFolder', 'addOneImage', 'setSelected',
                'fetchImages', 'selectLast', 'selectImage', 'initUI');
            // init variables
            this.renameFolderBtn = this.$("#rename-folder");
            this.deleteFolderBtn = this.$("#delete-folder");
            this.createFolderBtn = this.$("#create-folder");
            this.folderContainer = this.$("#folder-container");
            this.ImagesContainer = this.$("#images-container");
            this.ImagesContainerReserve = this.$("#images-container-reserve");
            this.selectedImagesContainer = this.$("#selected-images-container");
            this.selectedFolderName = this.$("#selected-folder-name");

            this.selectedFolderID = -8888;

            // init binding events
            Images.bind('reset', this.addAllImages, this);
            Folders.bind('reset', this.addAllFolders, this);
            Folders.bind('add', this.createOneFolder, this);

        },

        // init UI
        initUI: function () {
            // load data from db
            Folders.fetch(
                {
                    reset: true,
                    success: function(collection, response, options) {
                        options.previousModels.forEach(function (item) {
                            item.el.remove();
                            item.el.unbind();
                        });
                        ImageControl.selectLast();
                    }
                })
        },

        // add one folder
        addOneFolder: function (item) {
            var view = new FolderView({model: item, attributes: {"data-id": item.get('id')}});
            this.folderContainer.append(view.render().el);
        },

        // create one folder
        createOneFolder: function (item) {
            var view = new FolderView({model: item});
            this.folderContainer.append(view.render().el);
            view.addFolder(item);
        },

        // add all folders
        addAllFolders: function (item) {
            Folders.each(this.addOneFolder);
        },

        // add one image
        addOneImage: function (item) {
            var view = new ImageView({model: item, attributes: {"data-id": item.get('id')}});
            this.ImagesContainer.append(view.render().el);
        },

        // add all images
        addAllImages: function (item) {
            Images.each(this.addOneImage);
        },

        setSelected: function (el) {
            var self = this;
            this.$el.find(".image-folder").removeClass("active");
            el.addClass("active");
            this.selectedFolderID = el.attr("data-id");
            this.selectedFolderName.text(el.find(".folder-name").text());
            // update folder actions
            if (el.hasClass("reserved")) {
                this.renameFolderBtn.addClass("disabled");
                this.deleteFolderBtn.addClass("disabled");
            } else {
                this.renameFolderBtn.removeClass("disabled");
                this.deleteFolderBtn.removeClass("disabled");
            }

            this.fetchImages(false, 1);
        },

        fetchImages: function(switching, page) {
            var self = this;
            // load images from DB
            var params = {
                rows: 12,
                page: page,
                imagefolder_id: self.selectedFolderID,
            };

            Images.fetch({
                reset: true,
                data: params,
                success: function (collection, response, options) {
                    options.previousModels.forEach(function (item) {
                        item.el.remove();
                        item.el.unbind();
                    });
                    if (Images.length == 0) {
                        self.ImagesContainerReserve.show();
                        if (self.$('#image-pagination li').length > 0) {
                            self.$('#image-pagination').twbsPagination("destroy");
                        }
                        self.$('#image-pagination').hide();
                    } else {
                        self.ImagesContainerReserve.hide();
                        self.$('#image-pagination').show();
                        if (!switching) {
                            if (self.$('#image-pagination li').length > 0) {
                                self.$('#image-pagination').twbsPagination("destroy");
                            }
                            self.$('#image-pagination').twbsPagination({
                                totalPages: Images.pages,
                                visiblePages: 5,
                                onPageClick: function (event, page) {
                                    self.fetchImages(true, page);
                                }
                            });
                        }
                    }
                }
            })

        },

        // select folder
        selectFolder: function (ev) {
            var selectedFolder = $(ev.target).closest("li");
            if (!selectedFolder.hasClass("editing")) {
                if (this.selectedFolderID != selectedFolder.attr("data-id")) {
                    this.setSelected(selectedFolder);
                }
            }
        },

        selectLast: function() {
            var self = this;
            var foundLast = false;
            self.$el.find(".image-folder").each(function(key, el) {
                if ($(el).attr("data-id") == self.selectedFolderID) {
                    foundLast = true;
                    self.setSelected($(el));
                }
            });
            if (!foundLast) {
                // select default "-1"
                self.setSelected(self.$el.find(".image-folder").first());
            }
        },

        // create folder
        createFolder: function (ev) {
            ev.stopPropagation();
            // add new report
            Folders.add({"name": "", "user": 1, "images": 0});
            // close toggle
            $('.dropdown-toggle').closest(".btn-group").removeClass('in open');
        },

        // delete folder
        deleteFolder: function (ev) {
            ev.stopPropagation();
            var self = this;
            // find selected folder
            Folders.each(function(item) {
                if (item.get("id") == self.selectedFolderID) {
                    item.trigger("delete");
                }
            });
            // close toggle
            $('.dropdown-toggle').closest(".btn-group").removeClass('in open');
        },

        // rename folder
        renameFolder: function (ev) {
            ev.stopPropagation();
            var self = this;
            // find selected folder
            Folders.each(function(item) {
                if (item.get("id") == self.selectedFolderID) {
                    item.trigger("rename");
                }
            });
            // close toggle
            $('.dropdown-toggle').closest(".btn-group").removeClass('in open');
        },

        // change folder name
        changeFolder: function (ev) {
        },

        // delete images
        deleteImages: function (ev) {
            // add new report
            ReportCategorys.add({"name": "", order: 1});
        },

        // upload images
        uploadImages: function (ev) {
            // add new report
            ReportCategorys.add({"name": "", order: 1});
        },

        // select all images
        selectAllImages: function (ev) {
            // add new report
            ReportCategorys.add({"name": "", order: 1});
        },

        selectImage: function(image_id, image_name, thumbnail_url, image_url) {
            this.selectedImagesContainer.append(this.newPlotTemplate({}));
        },

    });

    // start Instance
    window.ImageControl = new ImageControlView;

});
