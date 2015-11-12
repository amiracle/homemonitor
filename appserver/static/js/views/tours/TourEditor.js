define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'app-js/views/tours/ImageItem',
        'app-js/views/tours/NewImageDialog',
        'app-js/views/tours/EditLabelDialog',
        'splunk.util',
        'util/splunkd_utils',
        'uri/route',
        'jquery.ui.sortable'
    ],
    function(
        $, 
        _,
        backbone, 
        module,
        BaseView,
        ImageItem,
        NewImageDialog,
        EditLabelDialog,
        splunkUtil,
        splunkd_utils,
        route
    ){
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                if (this.model.tour) {
                    this.tourLabel = this.model.tour.getLabel();
                    this.tourName = this.model.tour.getName();
                    this.imageTotal = this.getImageTotal();
                    this.nextImg = this.imageTotal + 1;
                
                    this.listenTo(this.model.tour, 'sync', function() {
                        this.imageTotal = this.getImageTotal();
                        this.nextImg = this.imageTotal + 1;
                        this.debouncedRender();
                    });
                }
                this.activate({deep: true});
            },

            events: {
                'click .back': function(e) {
                    e.preventDefault();
                    this.trigger('back');
                },
                'click .add-image': function(e) {
                    e.preventDefault();
                    this.children.newImage = new NewImageDialog({
                        model: this.model,
                        imgNum: this.nextImg
                    })
                    this.children.newImage.render().appendTo($('body')).show();
                },
                'click .editImg': function(e) {
                    e.preventDefault();
                    this.children.newImage = new NewImageDialog({
                        model: this.model,
                        imgNum: $(e.currentTarget).parents('.image-container').data('order'),
                        isEdit: true
                    })
                    this.children.newImage.render().appendTo($('body')).show();
                },
                'click .removeImg': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.removeImage($(e.currentTarget).parents('.image-tile'));
                },
                'click .reorder': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.enableReorder();
                },
                'click .stop-reorder': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.disableReorder();
                },
                'click .edit-label': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.children.editLabel = new EditLabelDialog({
                        model: this.model
                    })
                    this.children.editLabel.render().appendTo($('body')).show();
                }
            },

            removeImage: function(el) {
                this.model.tour.entry.content.set('imageName' + this.imageTotal, '');
                this.model.tour.entry.content.set('imageCaption' + this.imageTotal, '');
                
                el.remove();

                this.resetModelOrder();
            },

            getImageTotal: function() {
                var maxImgs = 30,
                    curImg = 0;

                for (var i = 1; i < maxImgs; i++) {
                    var hasImg = this.model.tour.entry.content.has('imageName' + i);
                    if (hasImg && this.model.tour.entry.content.get('imageName' + i)) {
                        curImg++;
                    } else {
                        break;
                    }
                }

                return curImg;
            },

            resetModelOrder: function() {
                var elementList = $('.image-container'),
                    imageTotal = elementList.length,
                    tour = this.model.tour.entry.content,
                    newModelAttrs = {};
                for (var i = 0; i < imageTotal; i++) {
                    var curEl = $(elementList[i]),
                        curImageName = curEl.data('filename'),
                        curCaption = curEl.find('.image-caption').text(),
                        curOrder = i + 1,
                        curData = curEl.css('background-image');
                    
                    tour.set('imageName' + curOrder, curImageName);
                    tour.set('imageCaption' + curOrder, curCaption);
                    curEl.data('order', curOrder);
                };
                this.model.tour.save({});
                this.checkReorder();
            },

            enableReorder: function() {
                if (this.imageTotal < 2) {
                    alert('Add more images, goober!');
                    return false;
                }
                var sortableOptions = {
                    tolerance: 'pointer',
                    items: '.image-tile',
                    scroll: false,
                    delay: 5,
                    helper: 'clone',
                    appendTo: 'body',
                    placeholder: 'image-tile-placeholder',
                    opacity: 0.5,
                    stop: function(event, ui) {
                        // On Stop callback
                    }
                };
                $('.tour-images').sortable(sortableOptions)
                    .sortable('enable')
                    .toggleClass('sorting');
                $('.stop-reorder').fadeIn(500);
                $('.add-image').fadeOut(500);
                $('.reorder-backdrop').toggleClass('in')
                    .toggleClass('out')
                    .show();
            },

            disableReorder: function(){
                $('.tour-images').sortable('disable')
                    .toggleClass('sorting');
                $('.stop-reorder').hide();
                $('.add-image').fadeIn(500);
                $('.reorder-backdrop').fadeOut();
                setTimeout(function(){
                    this.resetModelOrder();
                }.bind(this), 650);
            },

            checkReorder: function() {
                var imageTotal = this.getImageTotal();
                if (imageTotal > 1) {
                    this.$('.tour-button.reorder').removeAttr('disabled');
                } else {
                    this.$('.tour-button.reorder').attr('disabled', 'disabled');
                }
            },

            makeTourLabel: function() {
                var tourLabel = this.model.tour.getLabel();
                if (tourLabel) {
                    return tourLabel;
                } else {
                    var name = this.model.tour.entry.get('name'),
                        names = name.split('-');
                        _.each(names, function(name, i){
                            capName = name.charAt(0).toUpperCase() + name.substring(1);
                            names[i] = capName
                        });

                    return names.join(' ');
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    label: this.makeTourLabel(),
                    tourName: this.tourName
                }));

                if (this.imageTotal > 0) {
                    for (var i = 1; i < this.imageTotal + 1; i++) {
                        var imageName = this.model.tour.getImageName(i),
                            imageCaption = this.model.tour.getImageCaption(i),
                            imageOrder = i;
                        
                        if (imageName) {
                            var newItem = new ImageItem({
                                imageName: imageName,
                                imageCaption: imageCaption,
                                imageOrder: imageOrder,
                                tourName: this.tourName
                            });

                            this.$('.tour-images').append(newItem.render().el);
                        } else {
                            break;
                        }
                    }
                }

                this.$('.tour-images').append(this.add_template);
                this.checkReorder();
                return this;
            },

            template: '\
                <div class="section-padded section-header">\
                    <h2 class="section-title"><%- _("Edit Tour").t() %>: <%- label %> <a href="#" class="edit-label"><%- _("edit label").t() %></a></h2>\
                    <p><%- _("Tour ID").t() %>: <%- tourName %></p>\
                    <a class="back">< <%- _("Back").t() %></a>\
                    <button class="button tour-button reorder"><%- _("Reorder Slides").t() %></button>\
                    <div class="tour-images">\
                        <button class="button tour-button stop-reorder"><%- _("Finish Reorder").t() %></button>\
                    </div>\
                    <div class="modal-backdrop fade out reorder-backdrop" style="display:none"></div>\
                </div>\
            ',

            add_template: '\
                <div class="add-image">\
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" width="75px" height="75px" viewBox="0 0 36 36" version="1.1">\
                        <g>\
                            <path d="M17,17 L17,0 L19,0 L19,17 L36,17 L36,19 L19,19 L19,36 L17,36 L17,19 L0,19 L1.2246468e-16,17 L17,17 Z"></path>\
                        </g>\
                    </svg>\
                    <p class="add-image-text">Add Slide</p>\
                </div>\
            '
        });
    }
);