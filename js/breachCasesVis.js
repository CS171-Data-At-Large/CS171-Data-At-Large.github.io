
/*
 *  BreachCasesStackedArea - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

BreachCasesStackedArea = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.$graphicContainer = $("#" + _parentElement);
    this.initVis();
};


/*
 *  Initialize visualization
 */

BreachCasesStackedArea.prototype.initVis = function() {
    var vis = this;
    vis.margin = { top: 40, right: 40, bottom: 60, left: 60 };

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");


    // Initialize stack layout
    vis.dataCategories = colorScale.domain();
    vis.stack = d3.stack().keys(vis.dataCategories);

    // Rearrange data
    vis.stackedData = vis.stack(vis.data);

    // Stacked area layout
    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d) { return vis.x(d.data.Year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    // Tooltip placeholder
    vis.tooltip = vis.svg.append("text")
        .attr("x", 10)
        .attr("y", 10);

    vis.wrangleData();

};


/*
 *  Data wrangling
 */

BreachCasesStackedArea.prototype.wrangleData = function() {
    var vis = this;

    // Currently no data wrangling/filtering needed
    // vis.displayData = vis.data;

    // Update the visualization
    vis.updateVis();

};


/*
 *  The drawing function
 */

BreachCasesStackedArea.prototype.updateVis = function() {
    var vis = this;

    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.x.domain([2004, 2017]);
    vis.y.domain([0, d3.max(vis.stackedData, function(d) {
        return d3.max(d, function(e) {
            return e[1];
        });
    })
    ]);
    vis.dataCategories = colorScale.domain();

    // Draw the layers
    vis.categories = vis.svg.selectAll(".area")
        .data(vis.stackedData);

    vis.categories.enter().append("path")
        .attr("class", "area")
        .merge(vis.categories)
        .style("fill", function(d,i) {
            return colorScale(vis.dataCategories[i]);

        })
        .attr("d", function(d) {
            return vis.area(d);
        })
        .on("mouseover", function(d) {
            vis.tooltip.text(d.key);
        });

    // Update tooltip text
    vis.categories.exit().remove();


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

};

/*
 Redraw the graph
 */
BreachCasesStackedArea.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}