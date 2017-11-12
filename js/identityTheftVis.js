
/*
 *  IdentityTheftSquareMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

IdentityTheftSquareMap = function(_parentElement, _map, _data) {

    this.parentElement = _parentElement;
    this.map = _map;
    this.data = _data;
    this.initVis();
};


/*
 *  Initialize visualization
 */

IdentityTheftSquareMap.prototype.initVis = function() {
    var vis = this;
    vis.margin = { top: 40, right: 40, bottom: 60, left: 40 };

    vis.width = 1000 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.size = 60;

    var identityTheftByStateArray = $.map(vis.data, function(value, index) {
        return [value];
    });
    var maxVictims = d3.max(identityTheftByStateArray, function(d) {return d['Number of victims']; });

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Define scales
    vis.sizeScale = d3.scaleLinear()
        .domain([0, d3.max(identityTheftByStateArray, function(d) {return d['Number of victims']})])
        .range([20, vis.size]);

    vis.colorScale = d3.scaleThreshold()
        .domain([d3.min(identityTheftByStateArray, function(d) {return d['Victims per 100000 population']}),
            d3.max(identityTheftByStateArray, function(d) {return d['Victims per 100000 population']})])
        .range(d3.schemeBlues[9]);

    // Add US square map
    vis.states = vis.svg.selectAll("rect.square-map")
        .data(vis.map)
        .enter()
        .append("rect")
        .attr("class", "square-map")
        .attr("x", function(d) {return (d.column-1) * vis.size - vis.sizeScale(vis.data[d.state]['Number of victims'])/2; })
        .attr("y", function(d) {return (d.row-1) * vis.size - vis.sizeScale(vis.data[d.state]['Number of victims'])/2; })
        .attr("height", function(d) {
            return vis.sizeScale(vis.data[d.state]['Number of victims']);
        })
        .attr("width", function(d) {
            return vis.sizeScale(vis.data[d.state]['Number of victims']);
        })
        .attr("fill", function(d) { return vis.colorScale(vis.data[d.state]['Victims per 100000 population']);});

    vis.states = vis.svg.selectAll("rect.square-map-boundary")
        .data(vis.map)
        .enter()
        .append("rect")
        .attr("class", "square-map-boundary")
        .attr("x", function(d) {return (d.column-1) * vis.size - vis.size/2; })
        .attr("y", function(d) {return (d.row-1) * vis.size - vis.size/2; })
        .attr("height", vis.size)
        .attr("width", vis.size)
        .attr("fill", "transparent")
        .attr("stroke", "grey");

    vis.wrangleData();

};


/*
 *  Data wrangling
 */

IdentityTheftSquareMap.prototype.wrangleData = function() {
    var vis = this;

    // Currently no data wrangling/filtering needed

    // Update the visualization
    vis.updateVis();

};


/*
 *  The drawing function
 */

IdentityTheftSquareMap.prototype.updateVis = function() {
    var vis = this;

};
