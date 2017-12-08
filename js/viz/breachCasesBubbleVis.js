
/*
 *  BreachCasesStackedArea - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

BreachCasesBubble = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.$graphicContainer = $("#" + _parentElement);
    this.duration = 1000;
    this.ease = d3.easeElasticInOut;
    this.initVis();
};


/*
 *  Initialize visualization
 */

BreachCasesBubble.prototype.initVis = function() {
    var vis = this;
    vis.margin = { top: 40, right: 40, bottom: 60, left: 60 };

    vis.width = 550 - vis.margin.left - vis.margin.right;
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

    vis.radius = d3.scaleLinear()
        .range([3, 15]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.xAxislabel = vis.svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", (vis.width/2 - 30))
        .attr("y", (vis.height + 40));

    vis.yAxislabel = vis.svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "translate(-45, 140) rotate(270)")
        .style("text-anchor", "middle");

    // Add legend
    vis.svg.append("circle")
        .attr("cx", 15)
        .attr("cy", 20)
        .attr("r", 6)
        .style("fill", "transparent")
        .style("stroke", "#e0e2e4");

    vis.svg.append("circle")
        .attr("cx", 37)
        .attr("cy", 20)
        .attr("r", 10)
        .style("fill", "transparent")
        .style("stroke", "#e0e2e4");

    vis.svg.append("circle")
        .attr("cx", 70)
        .attr("cy", 20)
        .attr("r", 14)
        .style("fill", "transparent")
        .style("stroke", "#e0e2e4");

    vis.svg.append("text")
        .attr("x", 93)
        .attr("y", 25)
        .text("Records lost")
        .style("fill", "grey");



    vis.colorScale = d3.scaleOrdinal().range(['#bc795c','#cb9780','#dab5a4','#e9d2c9','#f0e1db','#f8f0ed']);

    vis.tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0]);

    vis.wrangleData("");

};


/*
 *  Data wrangling
 */

BreachCasesBubble.prototype.wrangleData = function(_filter) {
    var vis = this;

    vis.filter = _filter;
    vis.selected = $("#breach-cases-form option:selected").val();

    if (vis.filter !== "") {
        vis.displayData = vis.data.filter(function(d) {
            return d[vis.selected] === vis.filter;
        })
    }
    else {
        vis.displayData = vis.data;
    }

    // Update the visualization
    vis.updateVis();

};


/*
 *  The drawing function
 */

BreachCasesBubble.prototype.updateVis = function() {
    var vis = this;

    vis.x.domain([2004, 2017]);
    vis.y.domain([0, 35]);
    vis.radius.domain([d3.min(vis.displayData, function(d){return d["Records Lost"];})+1,
        d3.max(vis.displayData, function(d){return d["Records Lost"];})+1]);

    vis.bubbles = vis.svg.selectAll(".circle")
        .data(vis.displayData);

    vis.counter = {};
    for (var year=2004; year<=2017; year++) {
        vis.counter[year] = 0;
    }

    vis.tip.html(function(d) { return '<strong style="color:#bccad6">' + d.Entity + '</strong><br>' + d.Story; });
    vis.svg.call(vis.tip);

    vis.bubbles.enter().append("circle")
        .attr("class", "circle")
        .merge(vis.bubbles)
        .on("mouseover", function(d) {
            vis.tip.show(d);
        })
        .on("mouseout", function(d) {
            vis.tip.hide(d);
        })
        .transition()
        .duration(vis.duration)
        .attr("cx", function(d) { return vis.x(d.Year);})
        .attr("cy", function(d) {
            vis.counter[d.Year] += 1;
            return vis.y(vis.counter[d.Year])})
        .attr("r", function(d) { return vis.radius(d["Records Lost"])})
        .attr("fill", function(d) {
            return colorScale(d[vis.selected]);
        });

    vis.bubbles.exit().remove();

    vis.svg.select(".x-axis")
        .transition()
        .duration(vis.duration)
        .ease(vis.ease)
        .call(vis.xAxis.tickFormat(d3.format("d")));

    vis.svg.select(".y-axis")
        .transition()
        .duration(vis.duration)
        .ease(vis.ease)
        .call(vis.yAxis);

    // Update axes labels
    vis.svg.select(".x-axis-label")
        .text("Year");

    vis.svg.select(".y-axis-label")
        .text("Index");


};

/*
 Redraw the graph
 */
BreachCasesStackedArea.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
};