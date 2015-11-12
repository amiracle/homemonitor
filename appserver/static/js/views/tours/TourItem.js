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
            className: 'tour-tile',
            attributes: function() {
                return {
                    "data-name": this.model.tour.entry.get('name')
                };
            },

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.tourLabel = this.model.tour.getLabel();
                this.tourName = this.model.tour.getName();
                this.imageName = this.model.tour.getImageName(1);
                this.imgDest = splunkUtil.make_url(splunkUtil.sprintf('static/app/homemonitor/img/%s', this.tourName));
            },

            events: {
                'mouseenter .tour-item-container': function(e) {
                    $(e.currentTarget).find('.info-container').toggleClass('active');
                },
                'mouseleave .tour-item-container': function(e) {
                    $(e.currentTarget).find('.info-container').toggleClass('active');
                }
            },

            makeTourLabel: function() {
                if (this.model.tour.getLabel()) {
                    return this.model.tour.getLabel();
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
                    imageName: this.imageName,
                    imgDest: this.imgDest,
                    tourID: this.tourName
                }));

                return this;
            },

            template: '\
                <div class="tour-item-container" <% if (imageName) { %>style="background-image: url(<%- imgDest %>/<%- imageName %>);<% } %> background-size: cover;">\
                    <h3>\
                        <%- label %> <br>\
                    </h3>\
                    <div class="info-container">\
                        <br>\
                        <a class="run action-button"><%- _("Run Tour").t() %></a>\
                        <br>\
                        <a class="edit action-button"><%- _("Edit").t() %></a>\
                        <br>\
                        <a class="remove action-button"><%- _("Remove").t() %></a>\
                        <p class="tour-id"><%- _("id").t() %>: <%- tourID %></p>\
                    </div>\
                </div>\
            '
        });
    }
);
