define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'models/shared/ClassicURL',
        'app-js/views/tours/Tours',
        'app-js/views/tours/TourEditor',
        'views/shared/tour/ImageTour',
        'splunk.util',
        'css!app-css/tour.css'
    ],
    function(
        $, 
        _,
        backbone, 
        module,
        BaseView,
        ClassicURL,
        ToursView,
        TourEditor,
        ImageTour,
        splunkUtils,
        tourscss
    ){
        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.model.classicurl = new ClassicURL();
                this.model.classicurl.fetch();

                var queryProps = splunkUtils.queryStringToProp(window.location.search);
                if (queryProps && queryProps.t) {
                    this.editTour = this.collection.tours.getTourModel(queryProps.t);
                    this.model.tour = this.editTour;
                    if (!this.model.tour) {
                        this.model.classicurl.unset('t');
                        this.model.classicurl.save({}, {replaceState: true});
                    }
                }

                this.children.toursView = new ToursView({
                    model: {
                        application: this.model.application
                    },
                    collection: {
                        tours: this.collection.tours
                    }
                });

                this.activate({deep: true});
            },

            startListening: function() {
                this.listenTo(this.children.toursView, 'remove', function(tourName) {
                    this.removeTour(tourName);
                });
                this.listenTo(this.collection.tours, 'new', function(tour) {
                    this.model.tour = tour;
                    this.renderEditPage();
                });
                this.listenTo(this.collection.tours, 'update', function(tour) {
                    this.collection.tours.fetch({
                        data: {
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner'),
                            count: -1
                        }
                    });
                });
                this.listenTo(this.children.toursView, 'edit', function(tourName) {
                    this.model.tour = this.collection.tours.getTourModel(tourName);
                    this.renderEditPage();
                });
                this.listenTo(this.children.toursView, 'run', function(tourName) {
                    this.runTour(tourName);
                });
            },

            removeTour: function(tourName) {
                this.model.tour = this.collection.tours.getTourModel(tourName);
                if (this.model.tour) {
                    this.model.tour.destroy();
                    this.model.tour.clear();
                }
            },

            runTour: function(tourName) {
                this.model.tour = this.collection.tours.getTourModel(tourName);
                if (this.model.tour) {
                    this.children.tour = new ImageTour({
                        model: {
                            tour: this.model.tour,
                            application: this.model.application
                        },
                        onHiddenRemove: true,
                        backdrop: 'static'
                    });
                    $('body').append('<div class="splunk-components image-tour"></div>');
                    $('.image-tour').append(this.children.tour.render().el);
                    this.children.tour.show();
                }
            },

            renderEditPage: function() {
                var tourName = this.model.tour.entry.get('name');
                this.model.classicurl.set({'t': tourName});
                this.model.classicurl.save({}, {replaceState: true});

                this.children.tourEditPage = new TourEditor({
                    model: {
                        application: this.model.application,
                        tour: this.model.tour
                    },
                    collection: {
                        tours: this.collection.tours
                    }
                });

                this.$el.html(this.template);
                this.$('.tours-container').append(this.children.tourEditPage.render().el);

                this.listenTo(this.children.tourEditPage, "back", function() {
                    this.model.classicurl.unset('t');
                    this.model.classicurl.save({}, {replaceState: true});
                    this.editTour = null;

                    this.collection.tours.fetch({
                        data: {
                            app: this.model.application.get('app'),
                            owner: this.model.application.get('owner'),
                            count: -1
                        },
                        success: function(collection, response) {
                            this.debouncedRender();
                            this.children.toursView.delegateEvents();
                        }.bind(this),
                        error: function(collection, response) {
                            
                        }.bind(this)
                    });
                });
            },

            render: function() {
                this.$el.html(this.template);
                if (this.editTour) {
                    this.renderEditPage();
                } else {
                    this.$('.tours-container').append(this.children.toursView.render().el);
                }
                return this;
            },

            template: '\
                <div class="section-padded tours-container" />\
            '
        });
    }
);
