// Force Directed Graphs!
// these require an input of (at least) 3 fields in the format
// 'stats count by field1 field2 field3'

// ---- settings ----
// height, width
// panAndZoom: the ability to zoom (true, false)
// directional: true, false
// valueField: what field to count by
// charges, gravity: change the look of the graph, play around with these!
// linkDistance: the distance between each node

// ---- expected data format ----
// a splunk search like this: source=*somedata* | stats count by artist_name track_name device
// each group is an artist/song pairing
// {
//    "nodes":[
//       {
//          "source":"Bruno Mars",
//          "group":0
//       },
//       {
//          "source":"It Will Rain",
//          "group":0
//       },
//       {
//          "source":"Cobra Starship",
//          "group":1
//       },
//       {
//          "source":"You Make Me Feel",
//          "group":1
//       },
//       {
//          "source":"Gym Class Heroes",
//          "group":2
//       },
//       {
//          "source":"Stereo Hearts",
//          "group":2
//       },
//    ],
//    "links":[
//       {
//          "source":0,
//          "target":1,
//          "value":null
//       },
//       {
//          "source":2,
//          "target":3,
//          "value":null
//       },
//       {
//          "source":4,
//          "target":5,
//          "value":null
//       },
//    ],

// - we add this part -

//    "groupNames":{
//       "iphone":49,
//       "android":53,
//       "blackberry":48,
//       "ipad":52,
//       "ipod":50
//    },
//    "groupLookup":[
//       "iphone",
//       "android",
//       "blackberry",
//       "ipad",
//       "ipod"
//    ]
// }

define(function(require, exports, module) {

    var _ = require('underscore');
    var d3 = require("../d3/d3");
    var SimpleSplunkView = require("splunkjs/mvc/simplesplunkview");

    var ForceDirected = SimpleSplunkView.extend({
        moduleId: module.id,

        className: "splunk-toolkit-force-directed",

        options: {
            managerid: null,
            data: 'preview',
            panAndZoom: true,
            directional: true,
            valueField: 'count',
            charges: -200,
            gravity: 0.2,
            linkDistance: 60,
            swoop: false,
            isStatic: true
        },

        output_mode: "json_rows",

        initialize: function() {
            SimpleSplunkView.prototype.initialize.apply(this, arguments);

            // in the case that any options are changed, it will dynamically update
            // without having to refresh.
            this.settings.on("change:charges", this.render, this);
            this.settings.on("change:gravity", this.render, this);
            this.settings.on("change:linkDistance", this.render, this);
            this.settings.on("change:directional", this.render, this);
            this.settings.on("change:panAndZoom", this.render, this);
            this.settings.on("change:swoop", this.render, this);
            this.settings.on("change:isStatic", this.render, this);
        },

        createView: function() {
            var margin = {top: 10, right: 10, bottom: 10, left: 10};
            var availableWidth = parseInt(this.settings.get("width") || this.$el.width(), 10);
            var availableHeight = parseInt(this.settings.get("height") || this.$el.height(), 10);

            this.$el.html("");

            var svg = d3.select(this.el)
                .append("svg")
                .attr("width", availableWidth)
                .attr("height", availableHeight)
                .attr("pointer-events", "all");

            return { container: this.$el, svg: svg, margin: margin };
        },

        // making the data look how we want it to for updateView to do its job
        formatData: function(data) {
            var nodes = {};
            var links = [];
            data.forEach(function(link) {
                var sourceName = link[0];
                var targetName = link[1];
                var groupName = link[2];
                var newLink = {};
                newLink.source = nodes[sourceName] ||
                    (nodes[sourceName] = {name: sourceName, group: groupName, value: 0});
                newLink.target = nodes[targetName] ||
                    (nodes[targetName] = {name: targetName, group: groupName, value: 0});
                newLink.value = +link[3];
                newLink.source.value += newLink.value;
                newLink.target.value += newLink.value;
                links.push(newLink);
            });

            return {nodes: d3.values(nodes), links: links};
        },

        updateView: function(viz, data) {
            var that = this;
            var containerHeight = this.$el.height();
            var containerWidth = this.$el.width();

            // Clear svg
            var svg = $(viz.svg[0]);
            svg.empty();
            svg.height(containerHeight);
            svg.width(containerWidth);

            // Add the graph group as a child of the main svg
            var graphWidth = containerWidth - viz.margin.left - viz.margin.right;
            var graphHeight = containerHeight - viz.margin.top - viz.margin.bottom;
            var graph = viz.svg
                .append("g")
                .attr("width", graphWidth)
                .attr("height", graphHeight)
                .attr("transform", "translate(" + viz.margin.left + "," + viz.margin.top + ")");

            // Get settings
            this.charge = this.settings.get('charges');
            this.gravity = this.settings.get('gravity');
            this.linkDistance = this.settings.get('linkDistance');
            this.zoomable = this.settings.get('panAndZoom');
            this.swoop = this.settings.get('swoop');
            this.isStatic = this.settings.get('isStatic');
            this.isDirectional = this.settings.get('directional');
            this.zoomFactor = 0.5;

            this.groupNameLookup = data.groupLookup;

            // Set up graph
            var r = 6;
            var height = graphHeight;
            var width = graphWidth;
            var force = d3.layout.force()
                .gravity(this.gravity)
                .charge(this.charge)
                .linkDistance(this.linkDistance)
                .size([width, height]);

            this.color = d3.scale.category20();

            this.tooltips = new Tooltips(graph);

            if (this.zoomable) {
                initPanZoom.call(this, viz.svg);
            }

            graph.style("opacity", 1e-6)
                .transition()
                .duration(1000)
                .style("opacity", 1);

            graph.append("svg:defs").selectAll("marker")
                .data(["arrowEnd"])
                .enter().append("svg:marker")
                .attr("id", String)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 0)
                .attr("refY", 0)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("markerUnits", "userSpaceOnUse")
                .attr("orient", "auto")
                .append("svg:path")
                .attr("d", "M0,-5L10,0L0,5");

            var link = graph.selectAll("line.link")
                .data(data.links)
                .enter().append('path')
                .attr("class", "link")
                .attr("marker-end", function(d) {
                    if (that.isDirectional) {
                        return "url(#" + "arrowEnd" + ")";
                    }
                })
                .style("stroke-width", function(d) {
                    var num = Math.max(Math.round(Math.log(d.value)), 1);
                    return _.isNaN(num) ? 1 : num;
                });

            link
                .on('click', function(d) {
                    that.trigger('click:link', {
                        source: d.source.name,
                        sourceGroup: d.source.group,
                        target: d.target.name,
                        targetGroup: d.target.group,
                        value: d.value
                    });
                })
                .on('mouseover', function(d) {
                    d3.select(this).classed('linkHighlight', true);
                    openLinkTooltip(d, this);
                })
                .on('mouseout', function(d) {
                    d3.select(this).classed('linkHighlight', false);
                    that.tooltips.close(this);
                });

            var node = graph.selectAll("circle.node")
                .data(data.nodes)
                .enter().append("svg:circle")
                .attr("class", "node")
                .attr("r", r - 1)
                .style("fill", function(d) {
                    return that.color(d.group);
                })
                .call(force.drag);

            node.append("title")
                .text(function(d) { return d.name; });

            node
                .on('click', function(d) {
                    that.trigger('click:node', {
                        name: d.name,
                        group: d.group,
                        value: d.value
                    });
                })
                .on('mouseover', function(d) {
                    d3.select(this).classed('nodeHighlight', true);
                    openNodeTooltip(d, this);
                })
                .on('mouseout', function(d) {
                    d3.select(this).classed('nodeHighlight', false);
                    that.tooltips.close(this);
                });

            force.nodes(data.nodes)
                .links(data.links)
                .on("tick", function() {
                    link.attr("d", function(d) {
                        var diffX = d.target.x - d.source.x;
                        var diffY = d.target.y - d.source.y;

                        // Length of path from center of source node to center of target node
                        var pathLength = Math.sqrt((diffX * diffX) + (diffY * diffY));

                        // x and y distances from center to outside edge of target node
                        var offsetX = (diffX * (r * 2)) / pathLength;
                        var offsetY = (diffY * (r * 2)) / pathLength;

                        if (!that.swoop) {
                            pathLength = 0;
                        }

                        return "M" + d.source.x + "," + d.source.y + "A" + pathLength + "," + pathLength + " 0 0,1 " + (d.target.x - offsetX) + "," + (d.target.y - offsetY);
                    });

                    node.attr("cx", function(d) {
                        d.x = Math.max(r, Math.min(width - r, d.x));
                        return d.x;
                    })
                        .attr("cy", function(d) {
                            d.y = Math.max(r, Math.min(height - r, d.y));
                            return d.y;
                        });

                }).start();

            if (this.isStatic) {
                forwardAlpha(force, 0.005, 1000);
            }

            function forwardAlpha(layout, alpha, max) {
                alpha = alpha || 0;
                max = max || 1000;
                var i = 0;
                while (layout.alpha() > alpha && i++ < max) {
                    layout.tick();
                }
            }

            // draggin'
            function initPanZoom(svg) {
                var that = this;
                svg.on('mousedown.drag', function() {
                    if (that.zoomable) {
                        svg.classed('panCursor', true);
                    }
                    // console.log('drag start');
                });

                svg.on('mouseup.drag', function() {
                    svg.classed('panCursor', false);
                    // console.log('drag stop');
                });

                svg.call(d3.behavior.zoom().on("zoom", function() {
                    panZoom();
                }));
            }

            // zoomin'
            function panZoom() {
                graph.attr("transform",
                        "translate(" + d3.event.translate + ")"
                        + " scale(" + d3.event.scale + ")");
            }

            function openNodeTooltip(d, node) {
                var groupName;

                if (that.groupNameLookup !== undefined) {
                    groupName = that.groupNameLookup[d.group];
                } else {
                    groupName = d.group;
                }

                that.tooltips.open('nodes', {
                    slots: {
                        val: d.name,
                        group: groupName
                    },
                    swatch: that.color(d.group)
                }, node);
            }

            function openLinkTooltip(d, node) {
                that.tooltips.open('links', {
                    slots: {
                        source: d.source.name,
                        target: d.target.name
                    }
                }, node);
            }

            //TODO: This doesn't seem to be used in this file
            function getSafeVal(getobj, name) {
                var retVal;
                if (getobj.hasOwnProperty(name) && getobj[name] !== null) {
                    retVal = getobj[name];
                } else {
                    retVal = name;
                }
                return retVal;
            }

            function highlightNodes(val) {
                var self = this, groupName;
                if (val !== ' ' && val !== '') {
                    graph.selectAll('circle')
                        .filter(function(d, i) {
                            groupName = self.groupNameLookup[d.group];
                            if (d.source.indexOf(val) >= 0 || groupName.indexOf(val) >= 0) {
                                d3.select(this).classed('highlight', true);
                            } else {
                                d3.select(this).classed('highlight', false);
                            }
                        });
                } else {
                    graph.selectAll('circle').classed('highlight', false);
                }
            }

            /////////////////////// formerly known as tooltips.js /////////////////////////////

            function Tooltips(svg) {
                var tooltipTimer = null,
                    tooltipOpenCoords = {},
                    tooltipIsOpen = false,
                    tooltipContents,
                    $tooltipContainer,
                    isReady = false,
                    layouts;

                setup(svg, viz.container);

                function setup(svg, $container) {
                    var self = this,
                        data = [0],
                        $nodeVal, $nodeGroup, $nodeContainer,
                        $linkSource, $linkTarget, $linkContainer;

                    $tooltipContainer = $("<div id='tooltipContainer'></div>");

                    $nodeContainer = $("<div class='nodeContainer'></div>");
                    $nodeVal = $("<div class='node-value tooltipRow'><span class='tooltipLabel'>Value: </span><span class='field1-val'></span></div>");
                    $nodeGroup = $("<div class='node-group tooltipRow'></div><div class='group-swatch'></div><div class='group-name'><span class='tooltipLabel'>Group: </span><span class='group-val'></span></div>");
                    $nodeContainer.append($nodeVal);
                    $nodeContainer.append($nodeGroup);
                    $tooltipContainer.append($nodeContainer);

                    $linkContainer = $("<div class='linkContainer'></div>");
                    $linkSource = $("<div class='source tooltipRow'><span class='tooltipLabel'>Source: </span><span class='source-val'></span></div>");
                    $linkTarget = $("<div class='target tooltipRow'><span class='tooltipLabel'>Target: </span><span class='target-val'></span></div>");
                    $linkContainer.append($linkSource);
                    $linkContainer.append($linkTarget);
                    $tooltipContainer.append($linkContainer);

                    $tooltipContainer.find('.group-swatch').hide();

                    $container.prepend($tooltipContainer);
                    $tooltipContainer.hide();

                    layouts = {
                        'nodes': {
                            "container": $nodeContainer,
                            "slots": {
                                "val": $nodeVal.find('.field1-val'),
                                "group": $nodeGroup.find('.group-val')
                            },
                            "swatch": $nodeContainer.find('.group-swatch')
                        },
                        'links': {
                            "container": $linkContainer,
                            "slots": {
                                "source": $linkSource.find('.source-val'),
                                "target": $linkTarget.find('.target-val')
                            }
                        }
                    };

                    isReady = true;
                }

                function clearTooltips() {
                    if (isReady) {
                        $.each(layouts, function(k, layout) {
                            $.each(layout.slots, function(k, v) {
                                // this isnt really neccesary because it's either hidden or shown with newly-replaced content
                                v.empty();
                            });
                            layout.container.hide();
                            if (layout.swatch !== undefined) {
                                layout.swatch.hide();
                            }
                        });
                    }
                }

                this.close = function(node) {
                    // return false;
                    var self = this,
                        dx, dy;

                    var mouseCoords = d3.mouse(node);

                    if (tooltipTimer !== null) {
                        window.clearTimeout(tooltipTimer);
                    }

                    dx = Math.abs(tooltipOpenCoords.x - mouseCoords[0]);
                    dy = Math.abs(tooltipOpenCoords.y - mouseCoords[1]);

                    /*
                    only close the tooltip when the user has moved a certain distance away
                    this helps when an element is very small and the user might have 
                    difficulty keeping their mouse directly over it
                    */
                    if (dy > 10 || dx > 10) {
                        tooltipIsOpen = false;
                        tooltipTimer = window.setTimeout(function() {
                            $tooltipContainer.fadeOut(400);
                        }, 500);
                    }
                };

                this.open = function(layout, data, node) {
                    var mouseCoords = d3.mouse(node);
                    tooltipIsOpen = true;
                    tooltipOpenCoords = {
                        x: mouseCoords[0] + 6 * 2,
                        y: mouseCoords[1] + 6 * 3
                    };

                    clearTooltips();
                    $.each(data.slots, function(k, v) {
                        layouts[layout]['slots'][k].append(v);
                    });
                    layouts[layout]['container'].show();
                    if (layouts[layout]['swatch'] !== undefined) {
                        layouts[layout]['swatch'].show().css('background-color', data.swatch);
                    }

                    $tooltipContainer
                        .css("left", tooltipOpenCoords.x)
                        .css("top", tooltipOpenCoords.y);
                    $tooltipContainer.fadeIn(400);
                };
            }
        }

    });
    return ForceDirected;
});
