define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'splunk.util'
    ],
    function(
        $, 
        _,
        backbone, 
        module,
        BaseView,
        splunkUtil
    ){
        return BaseView.extend({
            moduleId: module.id,
            className: 'image-tile',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.imgDest = splunkUtil.make_url(splunkUtil.sprintf('static/app/tour_makr/img/%s', this.options.tourName));
            },

            events: {
                'mouseenter .image-container': function(e) {
                    $(e.currentTarget).find('.info-container').toggleClass('active');
                },
                'mouseleave .image-container': function(e) {
                    $(e.currentTarget).find('.info-container').toggleClass('active');
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    imageName: this.options.imageName,
                    imageCaption: this.options.imageCaption,
                    imageOrder: this.options.imageOrder,
                    imgDest: this.imgDest
                }));

                return this;
            },

            template: '\
                <div class="image-container" data-filename="<%- imageName %>" data-order="<%- imageOrder %>" style="background-image: url(<%- imgDest %>/<%- imageName %>); background-size: cover;">\
                    <div class="info-container">\
                        <h3><%- _("Filename").t() %>: <%- imageName %></h3>\
                        <p class="image-caption"><%- imageCaption %></p>\
                        <br><br>\
                        <a class="editImg action-button"><%- _("Edit").t() %></a>\
                        <br><br>\
                        <a class="removeImg action-button"><%- _("Remove").t() %></a>\
                    </div>\
                </div>\
            '
        });
    }
);
