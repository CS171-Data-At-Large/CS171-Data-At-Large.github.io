/*
 * InternetConcernsVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

InternetConcernsVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = this.data;
    this.$graphicContainer = $("#" + _parentElement);

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

InternetConcernsVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 200, bottom: 300, left: 200 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales and axes
    vis.x = d3.scaleBand()
        .rangeRound([0, vis.width])
        .paddingInner(0.2)
        .domain(d3.range(0,9));

    vis.y = d3.scaleLinear()
        .range([vis.height,0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Axis title
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Share of Respondents");


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

InternetConcernsVis.prototype.wrangleData = function(){
    var vis = this;
    console.log(vis.displayData);

    // Update the visualization
    vis.updateVis();
}


/*
 * The drawing function
 */

InternetConcernsVis.prototype.updateVis = function(){
    var vis = this;

    // Update domains
    vis.y.domain([0, d3.max(vis.displayData, function(d){ return d.share_respondents})]);

    var bars = vis.svg.selectAll(".share")
        .data(this.displayData);

    bars.enter().append("rect")
        .attr("class", "share")

        .merge(bars)
        .transition()
        .attr("width", vis.x.bandwidth())
        .attr("height", function(d){
            return vis.height - vis.y(d.share_respondents);
        })
        .attr("x", function(d, index){
            return vis.x(index);
        })
        .attr("y", function(d){
            return vis.y(d.share_respondents);
        })
        .style("fill", function(d, i){
            if (i<2){
                return "red";
            }
            else{
                return"grey";
            }
        });

    bars.exit().remove();

    // Call axis function with the new domain
    vis.svg.select(".y-axis").call(vis.yAxis);

    vis.svg.select(".x-axis").call(vis.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-45)"
        })
        .text(function(d, i){
            return vis.displayData[i]["concerns"];
        });
}


/*
 Redraw the graph
 */
InternetConcernsVis.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}