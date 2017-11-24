
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
    vis.margin = { top: 105, right: 40, bottom: 40, left: 100 };

    vis.width = 600 - vis.margin.left - vis.margin.right;
    vis.height = 455 - vis.margin.top - vis.margin.bottom;


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

    vis.xAxislabel = vis.svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", (vis.width/2 - 30))
        .attr("y", (vis.height + 40));

    vis.yAxislabel = vis.svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "translate(-45, 140) rotate(270)")
        .style("text-anchor", "middle");


    vis.colorScale = d3.scaleOrdinal().range(['#bc795c','#cb9780','#dab5a4','#e9d2c9','#f0e1db','#f8f0ed']);

    // Tooltip placeholder
    vis.tip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

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
    vis.y.domain([0, d3.max(vis.data, function(d) { return d['Records Lost']/1000000;})
    ]);

    vis.bubbles = vis.svg.selectAll(".circle")
        .data(vis.displayData);

    vis.bubbles.enter().append("circle")
        .attr("class", "circle")
        .merge(vis.bubbles)
        .on("mouseover", function(d) {
            var content = d.Story;
            var text = "<span style='color:#e9d2c9'>" + d.Entity + "</span><br>" + content;
            vis.tip.style("opacity", .9)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
            vis.tip.html(text);
        })
        .on("mouseout", function(d) {
            vis.tip.style("opacity", 0);
        })
        .transition()
        .duration(vis.duration)
        .attr("cx", function(d) { return vis.x(d.Year);})
        .attr("cy", function(d) { return vis.y(d['Records Lost']/1000000)})
        .attr("r", 8)
        .attr("fill", function(d) {
            return colorScale(d[vis.selected]);
        });

    vis.bubbles.exit().remove();

    vis.svg.select(".x-axis")
        .transition()
        .duration(vis.duration)
        .ease(vis.ease)
        .call(vis.xAxis);

    vis.svg.select(".y-axis")
        .transition()
        .duration(vis.duration)
        .ease(vis.ease)
        .call(vis.yAxis);

    // Update axes labels
    vis.svg.select(".x-axis-label")
        .text("Year");

    vis.svg.select(".y-axis-label")
        .text("Records Lost");


};

/*
 Redraw the graph
 */
BreachCasesStackedArea.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
};