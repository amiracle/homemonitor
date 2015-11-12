define(
    [
        'underscore',
        'jquery',
        'routers/Base',
        'app-js/views/tours/Master'
    ],
    function(
        _,
        $,
        BaseRouter,
        ToursView
    ) {
        return BaseRouter.extend({
            initialize: function() {
                BaseRouter.prototype.initialize.apply(this, arguments);
                this.enableAppBar = true;
                this.setPageTitle(_('Product Image Tours').t());
            },

            page: function(locale, splat) {
                BaseRouter.prototype.page.call(this, locale, 'search', '');

                $.when(this.deferreds.tours, this.deferreds.pageViewRendered).then(function(){
                    if (this.shouldRender) {
                        this.initializeTourView();
                        $('.preload').replaceWith(this.pageView.el);
                        this.toursView.render().replaceContentsOf($('.main-section-body'));
                    }
                }.bind(this));
            },

            initializeTourView: function() {
                if (!this.toursView) {
                    this.toursView = new ToursView({
                        model: {
                            application: this.model.application
                        },
                        collection: {
                            tours: this.collection.tours
                        }
                    });
                }
            }
        });
    }
);