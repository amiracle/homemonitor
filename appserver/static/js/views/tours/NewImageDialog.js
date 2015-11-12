define([
        'underscore',
        'backbone',
        'module',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'app-js/views/tours/TourFileUpload',
        'uri/route',
        'util/splunkd_utils'
    ],
    function(
        _,
        Backbone,
        module,
        Modal,
        ControlGroup,
        FlashMessage,
        TourFileUploader,
        route,
        splunkd_utils
        ) {
        return Modal.extend({
            moduleId: module.id,
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);

                this.children.flashMessage = new FlashMessage({ model: this.model.inmem });
                this.imgNum = this.options.imgNum || this.options.order;
                this.isEdit = this.options.isEdit || false;
                this.modalTitle = (this.isEdit) ? _('Edit Slide').t() : _('New Slide').t();

                this.children.titleField = new ControlGroup({
                    controlType: 'Textarea',
                    controlOptions: {
                        modelAttribute: 'imageCaption' + this.imgNum,
                        model: this.model.tour.entry.content
                    },
                    label: _('Caption Text').t()
                });

                this.children.tourFileUpload = new TourFileUploader({
                    imageAttr: 'imageData' + this.imgNum,
                    imageAttrName: 'imageName' + this.imgNum,
                    model: this.model
                });
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.tour.save({}, {
                        success: function(model, response) {
                            this.hide();
                        }.bind(this)
                    });

                    e.preventDefault();
                },
                'click .cancel': function(e) {
                    this.model.tour.entry.content.unset('imageCaption' + this.imgNum);
                    this.model.tour.entry.content.unset('imageName' + this.imgNum);
                }
            }),

            render : function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_(this.modalTitle).t());

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.$(Modal.BODY_SELECTOR).append(this.children.tourFileUpload.render().el);
                
                this.$(Modal.BODY_SELECTOR).append('<div class="caption-text"></div>');
                this.$('.caption-text').append(this.children.titleField.render().el);

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                return this;
            }
        });
    });
