
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
    this.minYear = 2008;
    this.maxYear = 2016;
    this.addSlider("double");
    this.initVis();
};


/*
 *  Initialize visualization
 */

IdentityTheftSquareMap.prototype.initVis = function() {
    var vis = this;
    vis.margin = { top: 80, right: 40, bottom: 60, left: 40 };

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 600 - vis.margin.top - vis.margin.bottom;

    vis.size = 50;


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

    // Add legends
    vis.svg.append("rect")
        .attr("x", 0).attr("y", 430)
        .attr("height", 20).attr("width", 20)
        .style("fill", "#8d9db6");

    vis.svg.append("rect")
        .attr("x", 25).attr("y", 420)
        .attr("height", 30).attr("width", 30)
        .style("fill", "#8d9db6");

    vis.svg.append("rect")
        .attr("x", 60).attr("y", 410)
        .attr("height", 40).attr("width", 40)
        .style("fill", "#8d9db6");

    vis.svg.append("text")
        .attr("x", 115).attr("y", 440)
        .text("Number of victims");

    vis.svg.append("rect")
        .attr("x", 300).attr("y", 420)
        .attr("height", 30).attr("width", 30)
        .style("fill", "#bccad6");

    vis.svg.append("rect")
        .attr("x", 335).attr("y", 420)
        .attr("height", 30).attr("width", 30)
        .style("fill", "#8d9db6");

    vis.svg.append("rect")
        .attr("x", 370).attr("y", 420)
        .attr("height", 30).attr("width", 30)
        .style("fill", "#667292");

    vis.svg.append("text")
        .attr("x", 415).attr("y", 440)
        .text("Victim density");

    // Tooltips
    vis.tooltip1 = vis.svg.append("text")
        .attr("class", "state-tooltip")
        .attr("x", 270)
        .attr("y", 0)
        .attr("stroke", "#8d9db6")
        .style("font-size", "25px")
        .style("font-weight", 10)
        .style("text-anchor", "middle");

    vis.tooltip2 = vis.svg.append("text")
        .attr("class", "state-tooltip-victims")
        .attr("x", 270)
        .attr("y", 25)
        .style("font-size", "15px")
        .style("font-weight", 5)
        .style("text-anchor", "middle");

    vis.tooltip3 = vis.svg.append("text")
        .attr("class", "state-tooltip-density")
        .attr("x", 270)
        .attr("y", 45)
        .style("font-size", "15px")
        .style("font-weight", 5)
        .style("text-anchor", "middle");

    // add slider control
    // $('#identity-theft-slider-button').change(function() {
    //     if (this.checked) {
    //         vis.yearSlider.noUiSlider.updateOptions({
    //             start: [vis.minYear, vis.maxYear]
    //         })
    //     } else {
    //         vis.yearSlider.noUiSlider.updateOptions({
    //             start: vis.minYear
    //         })
    //     }
    // });

    // Listen to slider
    vis.yearInterval = [2008, 2016];

    vis.yearSlider.noUiSlider.on("change", function(){
        vis.yearInterval = vis.yearSlider.noUiSlider.get();
        vis.yearInterval[0] = +vis.yearInterval[0];
        vis.yearInterval[1] = +vis.yearInterval[1];
        vis.wrangleData();
    });

    vis.wrangleData();

};


/*
 *  Data wrangling
 */

IdentityTheftSquareMap.prototype.wrangleData = function() {
    var vis = this;

    vis.range = vis.yearInterval[1] - vis.yearInterval[0] + 1

    vis.displayData = {};

    vis.filteredData = vis.data.filter(function(d) { return d['Year'] >= vis.yearInterval[0] & d['Year'] <= vis.yearInterval[1]; });

    vis.filteredData.forEach(function(d) {
        d['Victims per 100000 population'] = +d['Victims per 100000 population'];
        d['Number of victims'] = +d['Number of victims'];
        d['Rank'] = +d['Rank'];
        d['Year'] = +d['Year'];
        if (d['State'] in vis.displayData) {
            vis.displayData[d['State']]['Victims per 100000 population'] += d['Victims per 100000 population']/vis.range;
            vis.displayData[d['State']]['Number of victims'] += d['Number of victims']/vis.range;
        }
        else {
            vis.displayData[d['State']] = {'State': d['State'],
                'Victims per 100000 population': d['Victims per 100000 population']/vis.range,
                'Number of victims': d['Number of victims']/vis.range};
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
        .data(vis.map);

    vis.states.enter()
        .append("rect")
        .attr("class", "square-map")
        .merge(vis.states)
        .attr("x", function(d) {return (d.column-1) * vis.size - vis.sizeScale(vis.displayData[d.state]['Number of victims'])/2; })
        .attr("y", function(d) {return (d.row-1) * vis.size - vis.sizeScale(vis.displayData[d.state]['Number of victims'])/2; })
        .attr("height", function(d) {
            return vis.sizeScale(vis.displayData[d.state]['Number of victims']);
        })
        .attr("width", function(d) {
            return vis.sizeScale(vis.displayData[d.state]['Number of victims']);
        })
        .attr("fill", function(d) { return vis.colorScale(vis.displayData[d.state]['Victims per 100000 population']);});

    vis.states.exit().remove();

    vis.statesBoundary = vis.svg.selectAll("rect.square-map-boundary")
        .data(vis.map)
        .enter()
        .append("rect")
        .attr("class", "square-map-boundary")
        .attr("x", function(d) {return (d.column-1) * vis.size - vis.size/2; })
        .attr("y", function(d) {return (d.row-1) * vis.size - vis.size/2; })
        .attr("height", vis.size)
        .attr("width", vis.size)
        .attr("fill", "e6e6e6")
        .attr("fill-opacity", 0)
        .attr("stroke", "#e6e6e6")
        .attr("stroke-width", 2)
        .on("mouseover", function(d) {
            vis.tooltip1.attr("class", "state-tooltip")
                .text(d.state);
            vis.tooltip2.attr("class", "state-tooltip-victims")
                .text(d3.format(".2f")(vis.displayData[d.state]['Number of victims']) + " victims per year");
            vis.tooltip3.attr("class", "state-tooltip-density")
                .text(d3.format(".2f")(vis.displayData[d.state]['Victims per 100000 population']) + " victims in every 100,000 people");

            d3.select(this).style("fill-opacity", 0.2);
        })
        .on("mouseout", function(d) {
            d3.select(this).style("fill-opacity", 0);
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


/*
 Add slider control checkbox
 */
// IdentityTheftSquareMap.prototype.addCheckbox = function() {
//     var vis = this;
//     vis.sliderButton = document.getElementById('identity-theft-slider-button');
//     vis.sliderButton.innerHTML = '<div class="checkbox" id="slider-checkbox">' +
//         '<label><input type="checkbox" checked="checked">Year Interval</label></div>';
// };

/*
 Add slider
 */

IdentityTheftSquareMap.prototype.addSlider = function(_mode) {
    var vis = this;

    vis.yearSlider = document.getElementById('identity-theft-slider');

    noUiSlider.create(vis.yearSlider, {
        start: [vis.minYear, vis.maxYear],
        step: 1,
        connect: true,
        range: {
            'min': [vis.minYear],
            'max': [vis.maxYear]
        },
        pips: {
            mode: 'steps',
            density: 9
            // filter: filter50
        },
        tooltips: [wNumb({prefix: '<strong>From: </strong>'}), wNumb({prefix: '<strong>To: </strong>'})],
    });


};