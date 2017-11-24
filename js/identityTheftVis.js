
/*
 *  IdentityTheftSquareMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

IdentityTheftSquareMap = function(_parentElement, _map, _data) {

    this.parentElement = _parentElement;
    this.map = _map;
    this.data = _data;
    this.$graphicContainer = $("#" + _parentElement);
    this.initVis();
};


/*
 *  Initialize visualization
 */

IdentityTheftSquareMap.prototype.initVis = function() {
    var vis = this;
    vis.margin = { top: 45, right: 40, bottom: 60, left: 40 };

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.size = 60;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Define scales
    vis.sizeScale = d3.scaleLinear()
        .range([10, vis.size]);

    vis.colorScale = d3.scaleLinear()
        .range(["#f0f1f5", "#667292"]);


    // Tooltips
    vis.tooltip = vis.svg.append("text")
        .attr("class", "state-tooltip")
        .attr("x", 350)
        .attr("y", 10)
        .style("font-size", "25px")
        .style("font-weight", 10)
        .style("text-anchor", "middle");

    vis.wrangleData();

};


/*
 *  Data wrangling
 */

IdentityTheftSquareMap.prototype.wrangleData = function() {
    var vis = this;

    vis.displayData = {};

    vis.data.forEach(function(d) {
        d['Victims per 100000 population'] = +d['Victims per 100000 population'];
        d['Number of victims'] = +d['Number of victims'];
        d['Rank'] = +d['Rank'];
        d['Year'] = +d['Year'];
        if (d['State'] in vis.displayData) {
            vis.displayData[d['State']]['Victims per 100000 population'] += d['Victims per 100000 population']/9;
            vis.displayData[d['State']]['Number of victims'] += d['Number of victims']/9;
        }
        else {
            vis.displayData[d['State']] = {'State': d['State'],
                'Victims per 100000 population': d['Victims per 100000 population']/9,
                'Number of victims': d['Number of victims']/9};
        }
    });

    vis.displayDataArray = $.map(vis.displayData, function(value, index) {
        return [value];
    });


    // Update the visualization
    vis.updateVis();

};


/*
 *  The drawing function
 */

IdentityTheftSquareMap.prototype.updateVis = function() {
    var vis = this;

    vis.sizeScale.domain([0, d3.max(vis.displayDataArray, function(d) {return d['Number of victims']})]);

    vis.colorScale.domain([d3.min(vis.displayDataArray, function(d) {return d['Victims per 100000 population']}),
        d3.max(vis.displayDataArray, function(d) {return d['Victims per 100000 population']})]);

    // Add US square map
    vis.states = vis.svg.selectAll("rect.square-map")
        .data(vis.map)
        .enter()
        .append("rect")
        .attr("class", "square-map")
        .attr("x", function(d) {return (d.column-1) * vis.size - vis.sizeScale(vis.displayData[d.state]['Number of victims'])/2; })
        .attr("y", function(d) {return (d.row-1) * vis.size - vis.sizeScale(vis.displayData[d.state]['Number of victims'])/2; })
        .attr("height", function(d) {
            return vis.sizeScale(vis.displayData[d.state]['Number of victims']);
        })
        .attr("width", function(d) {
            return vis.sizeScale(vis.displayData[d.state]['Number of victims']);
        })
        .attr("fill", function(d) { return vis.colorScale(vis.displayData[d.state]['Victims per 100000 population']);});

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
        .attr("stroke", "#e6e6e6")
        .on("mouseover", function(d) {
            vis.tooltip
                .attr("class", "state-tooltip")
                .text(d.state);
        })
        .on("click", function(d) {
            vis.selected = d.state;
            linechart.wrangleData(vis.selected);
        });
};

/*
 Redraw the graph
 */
IdentityTheftSquareMap.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}