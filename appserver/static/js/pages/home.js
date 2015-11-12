require(['app-js/routers/Tours', 'util/router_utils'], function(ToursRouter, router_utils) {
    var toursRouter = new ToursRouter();
    router_utils.start_backbone_history();
});