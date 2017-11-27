
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
    vis.margin = { top: 45, right: 40, bottom: 60, left: 40 };

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 650 - vis.margin.top - vis.margin.bottom;

    vis.size = 40;
    vis.gap = 5;

    colorScale.domain(["Days", "Weeks", "Months", "Years", "Still not resolved"]);

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

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
            vis.displayData.push({"Type": d.Time})
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


    vis.squares = vis.svg.selectAll(".rect")
        .data(vis.displayData);

    vis.squares.enter().append("rect")
        .attr("class", "rect")
        .on("click", function(d) {
            d3.select(this).transition().style("fill", colorScale(d.Type));
            document.getElementById("square-flip-text").innerHTML = d.Type;
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
            .style("fill", "grey")
    });

    $("#button-show").click(function() {
        d3.selectAll(".rect").transition()
            .duration(function(d,i) {return 40*i;})
            .ease(d3.easeQuad)
            .style("fill", function(d) {
                return colorScale(d.Type);
            })
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
        '<a class="btn wide" id="button-show">Show all</a>' +
        '<a class="btn wide" id="button-reset">Reset</a>' +
        '</div>';


};
