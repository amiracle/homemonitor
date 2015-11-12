define([
        'underscore',
        'backbone',
        'module',
        'views/shared/Modal',
        'views/shared/controls/ControlGroup',
        'views/shared/FlashMessages',
        'models/services/data/ui/Tour',
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
        TourModel,
        route,
        splunkd_utils
        ) {
        return Modal.extend({
            moduleId: module.id,
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);

                this.model.tour = new TourModel();
                
                this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

                this.children.titleField = new ControlGroup({
                    controlType: 'Text',
                    controlOptions: {
                        modelAttribute: 'label',
                        model: this.model.tour.entry.content
                    },
                    label: _('Tour Name').t()
                });
                this.activate();
            },

            events: $.extend({}, Modal.prototype.events, {
                'click .btn-primary': function(e) {
                    var tourName = this.createTourName(this.model.tour.entry.content.get('label'));
                    this.model.tour.entry.content.set('name', tourName);
                    this.model.tour.entry.content.set('type', 'image');
                    this.model.tour.entry.content.set('context', 'tour_makr');
                    this.model.tour.entry.content.set('imgPath', '/' + tourName);

                    this.model.tour.save({}, {
                        data: {
                            app: 'tour_makr',
                            owner: 'nobody'
                        },
                        success: function(model, response) {
                            this.hide();
                            this.collection.tours.trigger('new', this.model.tour);
                        }.bind(this)
                    });

                    e.preventDefault();
                }
            }),

            createTourName: function(label) {
                var name = label.split(' ').join('_').replace(/[;:'",/\\]+/g, '').toLowerCase();
                return name;
            },

            render : function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("New Tour").t());

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.children.titleField.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                return this;
            }
        });
    });
