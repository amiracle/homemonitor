define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/services/data/ui/Tour',
        'views/Base',
        'app-js/views/tours/TourItem',
        'app-js/views/tours/NewTourDialog',
        'splunk.util',
        'uri/route'
    ],
    function(
        $, 
        _,
        backbone, 
        module,
        TourModel,
        BaseView,
        TourItem,
        NewTourDialog,
        splunkUtil,
        route
    ){
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.activate();
            },

            events: {
                'click .user-tours .tour-tile .remove': function(e) {
                    e.preventDefault();
                    var $tile = $(e.currentTarget).parents('.tour-tile');
                    this.trigger('remove', $tile.data('name'));
                    $tile.remove();
                },
                'click .user-tours .tour-tile .edit': function(e) {
                    e.preventDefault();
                    this.trigger('edit', $(e.currentTarget).parents('.tour-tile').data('name'));
                },
                'click .user-tours .tour-tile .run': function(e) {
                    e.preventDefault();
                    this.trigger('run', $(e.currentTarget).parents('.tour-tile').data('name'));
                },
                'click .user-tours .add-tour': function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.children.newTour = new NewTourDialog({
                        model: {
                            tour: new TourModel(),
                            application: this.model.application
                        },
                        collection: {
                            tours: this.collection.tours
                        }
                    });
                    this.children.newTour.render().appendTo($('body')).show();
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate());

                if (this.collection.tours) {
                    _.each(this.collection.tours.models, function(tour) {
                        var tourName = tour.entry.get('name');
                        if (tourName.indexOf(':') == -1 && tour.getImageContext() != 'system') {
                            var newItem = new TourItem({
                                model: {
                                    tour: tour
                                }
                            });

                            if (tour.entry.content.has('spl')) {
                                this.$('.splunk-tours').append(newItem.render().el);
                            } else {
                                this.$('.user-tours').append(newItem.render().el);
                            }
                        }
                    }.bind(this));
                }

                this.$('.user-tours').append(this.add_template);
                return this;
            },

            template: '\
                <div class="section-padded section-header">\
                    <h2 class="section-title"><%- _("Product Tours").t() %></h2>\
                </div>\
                <div class="touromatic">\
                    <div class="tour-section">\
                        <div class="user-tours tours"></div>\
                    </div>\
                </div>\
            ',

            add_template: '\
                <div class="add-tour">\
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" width="75px" height="75px" viewBox="0 0 36 36" version="1.1">\
                        <g>\
                            <path d="M17,17 L17,0 L19,0 L19,17 L36,17 L36,19 L19,19 L19,36 L17,36 L17,19 L0,19 L1.2246468e-16,17 L17,17 Z"></path>\
                        </g>\
                    </svg>\
                    <p class="add-tour-text">Create New Tour</p>\
                </div>\
            '
        });
    }
);
