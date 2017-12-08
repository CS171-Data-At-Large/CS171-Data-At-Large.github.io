
/*
 *  TimeToResolve - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

TimeToResolveSquares = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.$graphicContainer = $("#" + _parentElement);
    this.addButtons();
    this.initVis();

};


/*
 *  Initialize visualization
 */

TimeToResolveSquares.prototype.initVis = function() {
    var vis = this;
    vis.margin = { top: 45, right: 40, bottom: 20, left: 0 };

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 560 - vis.margin.top - vis.margin.bottom;

    vis.size = 40;
    vis.gap = 5;

    // vis.colorScale = d3.scaleOrdinal().range(['#bb785d','#697596','#edb45e', '#667f7f','#9775bd']);
    vis.colorScale = d3.scaleOrdinal().range(['#bb785d','#697596','#d9bf8c', '#667f7f','#9c79a0']);
    vis.colorScale.domain(["Days", "Weeks", "Months", "Years", "Still not resolved"]);

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svgtext = d3.select("#square-flip-text").append("svg")
        .attr("width", 1000)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(-20,-100)");

    vis.wrangleData();

};


/*
 *  Data wrangling
 */

TimeToResolveSquares.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = [];

    vis.data.forEach(function(d) {
        for (var i = 0; i < +d["Share of respondents "]; i++) {
            vis.displayData.push({"Type": d.Time, "Proportion": d["Share of respondents "]})
        }
    });

    // Update the visualization
    vis.updateVis();

};


/*
 *  The drawing function
 */

TimeToResolveSquares.prototype.updateVis = function() {
    var vis = this;

    vis.types = ["Days", "Weeks", "Months", "Years", "Not-resolved"];
    vis.opacity = 0.6;

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 220)
        .attr("class", "instruction instruction-line0")
        .attr("id", "Days")
        .text("");

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 250)
        .attr("class", "instruction instruction-line1")
        .attr("id", "Weeks")
        .text("Each square represents an identity theft event.");

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 280)
        .attr("class", "instruction instruction-line2")
        .attr("id", "Months")
        .text("Click on a square to see how long it will take you to resolve.");

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 310)
        .attr("class", "instruction instruction-line3")
        .attr("id", "Years")
        .text("");

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 340)
        .attr("class", "instruction instruction-line4")
        .attr("id", "Not-resolved")
        .text("");

    vis.squares = vis.svg.selectAll(".rect")
        .data(vis.displayData);

    vis.squares.enter().append("rect")
        .attr("class", "rect")
        .attr("id", "squares")
        .on("click", function(d) {
            rand = Math.random() * 100;
            if (rand <= 34) {
                vis.selected = "Days";
            }
            else if (rand <= 87) {
                vis.selected = "Weeks";
            }
            else if (rand <= 94) {
                vis.selected = "Months";
            }
            else if (rand <= 98) {
                vis.selected = "Years"
            }
            else {
                vis.selected = "Still not resolved"
            }

            d3.select(this).transition()
                .style("opacity", vis.opacity)
                .style("fill", vis.colorScale(vis.selected));
            vis.showSelected(d);
            vis.showAll(4000);

        })
        .merge(vis.squares)
        .transition()
        .attr("x", function(d, i) { return (i % 10) * (vis.size + vis.gap); })
        .attr("y", function(d, i) { return Math.floor(i / 10) * (vis.size + vis.gap); })
        .attr("height", vis.size)
        .attr("width", vis.size)
        .attr("fill", "black")
        .style("opacity", vis.opacity);

    vis.squares.exit().remove();

    $("#button-reset").click(function() {
        d3.selectAll(".rect").transition()
            .duration(function(d,i) {return 40*i;})
            .ease(d3.easeQuad)
            .style("fill", "black")
            .style("opacity", vis.opacity);

        d3.selectAll(".rect")
            .on("mouseover", function(d) {})
            .on("mouseout", function(d) {});

        d3.select(".instruction-line0")
            .transition().duration(500)
            .style("opacity", 0)

        d3.select(".instruction-line1")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1)
            .style("fill", "black")
            .text("Each square represents an identity theft event.");

        d3.select(".instruction-line2")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(3000)
            .style("opacity", 1)
            .style("fill", "black")
            .text("Click on a square to see how long it will take you to resolve.");

        d3.select(".instruction-line3")
            .transition().duration(500)
            .style("opacity", 0)

        d3.select(".instruction-line4")
            .transition().duration(500)
            .style("opacity", 0)

        d3.selectAll(".rect").on("click", function(d){
            rand = Math.random()*100;
            if (rand <= 34) {
                vis.selected = "Days";
            }
            else if (rand <= 87) {
                vis.selected = "Weeks";
            }
            else if (rand <= 94) {
                vis.selected = "Months";
            }
            else if (rand <= 98) {
                vis.selected = "Years"
            }
            else {
                vis.selected = "Still not resolved"
            }

            d3.select(this).transition()
                .style("fill", vis.colorScale(vis.selected))
                .style("opacity", vis.opacity);
            vis.showSelected(d);
            vis.showAll(4000);
        })

    });

    vis.showSelected = function(d) {

        vis.data.forEach(function(d) {
            if (d.Time === vis.selected) {
                vis.proportion = +d["Share of respondents "]
            }
        });

        d3.select(".instruction-line0")
            .transition().duration(500)
            .style("opacity", 0);

        d3.select(".instruction-line1")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1)
            .style("fill", "black")
            .text("Like " + vis.proportion + "% of the victims,");

        if (vis.selected === "Still not resolved") {
            d3.select(".instruction-line2")
                .transition().duration(500)
                .style("opacity", 0)
                .transition().duration(3000)
                .style("opacity", 1)
                .text("you still have not resolved your theft.")
        }
        else {
            d3.select(".instruction-line2")
                .transition().duration(500)
                .style("opacity", 0)
                .transition().duration(3000)
                .style("opacity", 1)
                .text("it will take you " + vis.selected.toLowerCase() + " to resolve the theft.")
        }

        d3.select(".instruction-line3")
            .transition().duration(500)
            .style("opacity", 0);

        d3.select(".instruction-line4")
            .transition().duration(500)
            .style("opacity", 0);

    };

    vis.showAll = function(delay) {

        d3.selectAll(".rect").transition().delay(delay)
            .duration(function(d,i) {return 40*i;})
            .ease(d3.easeQuad)
            .style("fill", function(d) {
                return vis.colorScale(d.Type);
            })
            .style("opacity", vis.opacity);

        d3.select(".instruction-line0")
            .transition().delay(delay).duration(500)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1)
            .style("fill", vis.colorScale(vis.data[0].Time))
            .text("34% of the victims took days to resolve the theft;")
            .transition().duration(700)
            .style("fill", "black");


        d3.select(".instruction-line1")
            .transition().delay(delay).duration(500)
            .style("opacity", 0)
            .transition().duration(1500)
            .style("opacity", 1)
            .style("fill", vis.colorScale(vis.data[1].Time))
            .text("53% of the victims took weeks to resolve the theft;")
            .transition().duration(600)
            .style("fill", "black");

        d3.select(".instruction-line2")
            .transition().delay(delay).duration(500)
            .style("opacity", 0)
            .transition().duration(2000)
            .style("opacity", 1)
            .style("fill", vis.colorScale(vis.data[2].Time))
            .text("7% of the victims took months to resolve the theft;")
            .transition().duration(500)
            .style("fill", "black");

        d3.select(".instruction-line3")
            .transition().delay(delay).duration(500)
            .style("opacity", 0)
            .transition().duration(2000)
            .style("opacity", 1)
            .style("fill", vis.colorScale(vis.data[3].Time))
            .text("4% of the victims took years to resolve the theft;")
            .transition().duration(500)
            .style("fill", "black");

        d3.select(".instruction-line4")
            .transition().delay(delay).duration(500)
            .style("opacity", 0)
            .transition().duration(2000)
            .style("opacity", 1)
            .style("fill", vis.colorScale(vis.data[4].Time))
            .text("2% of the victims still have not resolved the theft.")
            .transition().duration(500)
            .style("fill", function(i) {
                return "black"
            });

        vis.addHover();


        d3.selectAll(".rect").on("click", function(){});

    };

    vis.addHover = function() {
        d3.selectAll(".rect")
            .style("stroke-width", 0)
            .on("mouseover", function(d) {

                console.log(d3.selectAll(".rect").filter(function(d,i) {return i==99;}).style("fill"));

                if (d3.selectAll(".rect").filter(function(d,i) {return i==99;}).style("fill") === "rgb(156, 121, 160)") {
                    d3.selectAll(".rect")
                        .style("opacity", function(i) {
                            if (i.Type === d.Type) {
                                return 1;
                            }
                            else {
                                return vis.opacity;
                            }
                        })
                        .style("stroke", "#f0f0f0")
                        .style("stroke-width", function(i) {
                            if (i.Type === d.Type) {
                                return 3;
                            }
                            else {
                                return 0;
                            }
                        });

                    if (d.Type === "Still not resolved") {
                        d3.select("#Not-resolved").style("fill", vis.colorScale(d.Type));
                        vis.types.forEach(function(i) {
                            if (i !== "Not-resolved") {
                                d3.select("#"+i).style("fill", "#f0f0f0");
                            }
                        })

                    }
                    else {
                        d3.select("#" + d.Type).style("fill", vis.colorScale(d.Type));
                        vis.types.forEach(function(i) {
                            if (i !== d.Type) {
                                d3.select("#"+i).style("fill", "#f0f0f0");
                            }
                        })
                    }
                }

            })
            .on("mouseout", function(d) {

                d3.selectAll(".rect")
                    .style("stroke-width", 0)
                    .style("opacity", vis.opacity);

                vis.types.forEach(function(i) {
                    d3.select("#"+i).style("fill", "black");
                })

            });
    }


};

/*
 Redraw the graph
 */
TimeToResolveSquares.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
};


TimeToResolveSquares.prototype.addButtons = function() {
    var vis = this;

    var p = document.getElementById("square-flip-text");

    p.innerHTML = '<br><br><div class="btn-group" role="group">' +
        '<a class="btn btn-secondary wide" id="button-reset"> Reset Visualization </a>' +
        '</div>';


};