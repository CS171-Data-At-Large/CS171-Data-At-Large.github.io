
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

    colorScale.domain(["Days", "Weeks", "Months", "Years", "Still not resolved"]);

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.svgtext = d3.select("#square-flip-text").append("svg")
        .attr("width", 1000)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g");

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

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 220)
        .attr("class", "instruction instruction-line0")
        .text("");

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 250)
        .attr("class", "instruction instruction-line1")
        .text("Each square represents an identity theft event.");

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 280)
        .attr("class", "instruction instruction-line2")
        .text("Click on a square to see how long it will take you to resolve.");

    vis.svgtext.append("text")
        .attr("x", 20)
        .attr("y", 310)
        .attr("class", "instruction instruction-line3")
        .text("");


    vis.squares = vis.svg.selectAll(".rect")
        .data(vis.displayData);

    vis.squares.enter().append("rect")
        .attr("class", "rect")
        .on("click", function(d) {
            d3.select(this).transition().style("fill", colorScale(d.Type));

            d3.select(".instruction-line0")
                .transition().duration(500)
                .style("opacity", 0);

            d3.select(".instruction-line1")
                .transition().duration(500)
                .style("opacity", 0)
                .transition().duration(1000)
                .style("opacity", 1)
                .text("Like " + d.Proportion + "% of the victims,");

            if (d.Type === "Still not resolved") {
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
                    .text("it will take you " + d.Type.toLowerCase() + " to resolve the theft.")
            }

            d3.select(".instruction-line3")
                .transition().duration(500)
                .style("opacity", 0);

        })
        .merge(vis.squares)
        .transition()
        .attr("x", function(d, i) { return (i % 10) * (vis.size + vis.gap); })
        .attr("y", function(d, i) { return Math.floor(i / 10) * (vis.size + vis.gap); })
        .attr("height", vis.size)
        .attr("width", vis.size)
        .attr("fill", "grey");

    vis.squares.exit().remove();

    $("#button-reset").click(function() {
        d3.selectAll(".rect").transition()
            .duration(function(d,i) {return 40*i;})
            .ease(d3.easeQuad)
            .style("fill", "grey");

        d3.select(".instruction-line0")
            .transition().duration(500)
            .style("opacity", 0)

        d3.select(".instruction-line1")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1)
            .text("Each square represents an identity theft event.");

        d3.select(".instruction-line2")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(3000)
            .style("opacity", 1)
            .text("Click on a square to see how long it will take you to resolve.");

        d3.select(".instruction-line3")
            .transition().duration(500)
            .style("opacity", 0)

    });

    $("#button-show").click(function() {
        d3.selectAll(".rect").transition()
            .duration(function(d,i) {return 40*i;})
            .ease(d3.easeQuad)
            .style("fill", function(d) {
                return colorScale(d.Type);
            })

        d3.select(".instruction-line0")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(1000)
            .style("opacity", 1)
            .text("34% of the victims took days to resolve the theft;");

        d3.select(".instruction-line1")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(2000)
            .style("opacity", 1)
            .text("53% of the victims took weeks to resolve the theft;");

        d3.select(".instruction-line2")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(3000)
            .style("opacity", 1)
            .text("4% of the victims took months to resolve the theft;");

        d3.select(".instruction-line3")
            .transition().duration(500)
            .style("opacity", 0)
            .transition().duration(4000)
            .style("opacity", 1)
            .text("2% of the victims still have not resolved the theft.");

    });


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

    var p = document.getElementById(vis.parentElement);

    p.innerHTML = '<div class="btn-group" role="group">' +
        '<a class="btn btn-secondary wide" id="button-show">Show all</a>' +
        '<a class="btn btn-secondary wide" id="button-reset">Reset</a>' +
        '</div>';


};