
/*
 *  BreachCasesStackedArea - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

BreachCasesStackedArea = function(_parentElement, _dataM, _dataS) {

    this.parentElement = _parentElement;
    this.dataM = _dataM;
    this.dataS = _dataS;
    this.$graphicContainer = $("#" + _parentElement);
    this.duration = 1000;
    this.ease = d3.easeElasticInOut;
    this.addDropDownMenu();
    this.initVis();
};


/*
 *  Initialize visualization
 */

BreachCasesStackedArea.prototype.initVis = function() {
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

    vis.legendsvg = d3.select("#breach-cases-form").append("svg")
        .attr("width", 1200)
        .attr("height", 50)
        .append("g");

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
        .attr("transform", "translate(-40, 130) rotate(270)")
        .style("text-anchor", "middle");


    // Stacked area layout
    vis.area = d3.area()
        .curve(d3.curveCatmullRom)
        .x(function(d) { return vis.x(d.data.Year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    vis.singlearea = d3.area()
        .curve(d3.curveCatmullRom)
        .x(function(d) { return vis.x(d.data.Year); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d['data'][vis.filter]); });

    vis.filter = "";

    vis.wrangleData();

};


/*
 *  Data wrangling
 */

BreachCasesStackedArea.prototype.wrangleData = function() {
    var vis = this;

    if ($("#breach-cases-form option:selected").val() !== vis.selected) {
        vis.filter = "";
    }

    vis.selected = $("#breach-cases-form option:selected").val();

    if (vis.selected === 'Method of Leak') {
        vis.data = vis.dataM;
    }
    else {
        vis.data = vis.dataS;
    }

    // Initialize stack layout
    colorScale.domain(d3.keys(vis.data[0]).filter(function(d){ return d != "Year"; }));
    vis.dataCategories = colorScale.domain();
    vis.stack = d3.stack().keys(vis.dataCategories);

    // Rearrange data
    vis.stackedData = vis.stack(vis.data);
    vis.displayData = [];

    if (vis.filter !== "") {
        vis.stackedData.forEach(function(d, i) {
            if (d.key === vis.filter){
                vis.displayData.push(d);
            }
        })
    }
    else {
        vis.displayData = vis.stackedData;
    }


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
    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d, function(e) {
            if (vis.filter !== "") {
                return e[1] - e[0];
            }
            else {
                return e[1];
            }
        });
    })
    ]);


    vis.dataCategories = colorScale.domain();

    // Draw the layers
    vis.categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    vis.categories.enter().append("path")
        .attr("class", "area")
        .merge(vis.categories)
        .on("mouseover", function(d){
            d3.select(this).style("stroke","white")
                .style("stroke-width",3.5);
        })
        .on("mouseout", function(d){
            d3.select(this).style("stroke","white")
                .style("stroke-width",0.8);
        })
        .on("click", function(d, i) {
            vis.filter = (vis.filter) ? "" : d.key;
            vis.wrangleData();
            bubblechart.wrangleData(vis.filter);
        })
        .transition()
        .duration(vis.duration / 2)
        .style("fill-opacity", 0)
        .transition()
        .duration(vis.duration / 2)
        .style("fill", function(d,i) {
            if (vis.filter !== ""){
                return colorScale(vis.filter);
            }
            else {
                return colorScale(vis.dataCategories[i]);
            }
        })
        .style("fill-opacity", 1)
        .attr("d", function(d) {
            if (vis.filter !== ""){
                return vis.singlearea(d);
            }
            else {
                return vis.area(d);
            }
        })
        .style("stroke", "white")
        .style("stroke-width", 0.3);


    // Add legends
    vis.legend = vis.legendsvg.selectAll(".legend")
        .data(vis.dataCategories);

    vis.legend.enter().append("rect")
        .attr("class", "legend")
        .merge(vis.legend)
        .attr("x", function(d,i) {
            if (i == 0) {
                return 30;
            }
            else {
                var offset = 30 + i * 45;
                for (var j = 0; j < i; j++) {
                    offset += vis.dataCategories[j].length * 6.5 + 17;
                }
                return offset;
            }
        })
        .attr("y", 10)
        .attr("fill", function(d) { return colorScale(d); })
        .attr("height", 20)
        .attr("width", 40);

    vis.legendLabels = vis.legendsvg.selectAll(".legend-labels")
        .data(vis.dataCategories);

    vis.legendLabels.enter().append("text")
        .attr("class", "legend")
        .merge(vis.legendLabels)
        .attr("x", function(d,i) {
            if (i == 0) {
                return 75;
            }
            else {
                var offset = 75 + i * 45;
                for (var j = 0; j < i; j++) {
                    offset += vis.dataCategories[j].length * 6.5 + 17;
                }
                return offset;
            }
        })
        .attr("y", 25)
        .text(function(d) { return d; })
        .style("text-anchor", "start");

    vis.legendLabels.exit().remove;

    vis.legend.exit().remove();

    vis.categories.exit().remove();

    // Update axes labels
    vis.svg.select(".x-axis-label")
        .text("Year");

    vis.svg.select(".y-axis-label")
        .text("Number of events");



    // Call axis functions with the new domain
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

};

/*
 Redraw the graph
 */
BreachCasesStackedArea.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}

/*
 Add drop down menu to the DOM
 */
BreachCasesStackedArea.prototype.addDropDownMenu = function() {
    var p = document.getElementById("breach-cases-form");
    var menu = document.createElement("form");
    menu.setAttribute("class", "form-inline");
    var selections = '<div class="form-group">' +
        '<label for="change-breach-cases-data">Visualize by:  </label>' +
        '<select class="form-control" id="change-breach-cases-data">' +
        '<option value="Method of Leak">Method of leak</option>' +
        '<option value="Data Sensitivity">Sensitivity of leaked data</option>' +
        '</select>' +
        '</div>';

    menu.innerHTML = selections;
    p.appendChild(menu);

}