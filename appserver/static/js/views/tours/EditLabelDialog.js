define([
        'underscore',
        'backbone',
        'module',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages'
    ],
    function(
        _,
        Backbone,
        module,
        Modal,
        ControlGroup,
        FlashMessage
        ) {
        return Modal.extend({
            moduleId: module.id,
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);

                this.originalLabel = this.model.tour.getLabel();

                this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

                this.children.titleField = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'label',
                        model: this.model.tour.entry.content,
                        placeholder: this.originalLabel
                    },
                    label: _('Label').t(),
                    required: true,
                    validate: true
                });
                this.activate();
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    this.model.tour.save({}, {
                        validate: true,
                        success: function(model, response) {
                            this.hide();
                        }.bind(this)
                    });
                    e.preventDefault();
                },
                'click .cancel': function(e) {
                    this.model.tour.entry.content.set('label', this.originalLabel);
                }
            }),

            render : function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Edit Label").t());

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.children.titleField.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                return this;
            }
        });
    });
