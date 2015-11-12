// parallel coords!
// a visualisation technique for multidimensional categorical data
// you can drag the vertical axis for each section to filter things (try it out for yourself)

// --- settings ---
// none for the time being.
// TODO: add settings to choose which data goes where

// --- expected data format ---
// a splunk search like this: index=_internal sourcetype=splunkd_access | table method status

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("../d3/d3");
    var parcoords = require("./contrib/d3-parcoords");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    var ParCoords = SimpleSplunkView.extend({

        className: "splunk-toolkit-parcoords",

        options: {
            managerid: null,   // your MANAGER ID
            data: "preview",  // Results type
        },

        output_mode: "json_rows",

        initialize: function() {
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            this.settings.enablePush("value");
        
            // Set up resize callback. The first argument is a this
            // pointer which gets passed into the callback event
            $(window).resize(this, _.debounce(this._handleResize, 20));
        },

        _handleResize: function(e){
            
            // e.data is the this pointer passed to the callback.
            // here it refers to this object and we call render()
            e.data.render();
        },

        createView: function() { 
            this.$el.html(''); // clearing all prior junk from the view (eg. 'waiting for data...')
            return true;
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {

            // Decide what fields we want
            // TODO: this should be specifialbe
            var fields = _.filter(this.resultsModel.data().fields, function(d){return d[0] !== "_" });
            var objects = _.map(data, function(row) {
                var obj = {};
                _.each(fields, function(field, idx) {
                    if (row[idx] !== null) {
                        obj[field] = row[idx];
                    } 
                    else {
                        obj[field] = "";
                    }
                });
                
                return obj;
            });

            data = {
                'results': objects,
                'fields': fields
            }
            
            return data;
        },

        updateView: function(viz, data) {
            var that = this;
            var availableHeight = parseInt(this.settings.get("height") || this.$el.height());
            
            this.$el.html('');
            var fields = data.fields;
            viz = $("<div id='"+this.id+"_parallelcoords' class='parcoords'>").appendTo(this.el)
                .css("height", availableHeight)
            var colorgen = d3.scale.category20();
            var colors = {};
            _(data.results).chain()
                .pluck(fields[0])
                .uniq()
                .each(function(d,i) {
                    colors[d] = colorgen(i);
                });

            var color = function(d) {return colors[d[fields[0]]]; };

            var pc_progressive = d3.parcoords()('#' + this.id + '_parallelcoords')
                .data(data.results)
                .color(color)   
                .alpha(0.4)
                .margin({ top: 24, left: 150, bottom: 12, right: 0 })
                .mode("queue")
                .render()
                .brushable()  // enable brushing
                .interactive()  // command line mode
                .on("brush", function(selected) {
                    that.trigger("select", {selected: selected});
                });

            pc_progressive.svg.selectAll("text")
                .style("font", "10px sans-serif");
            }
    });
    return ParCoords;
});
