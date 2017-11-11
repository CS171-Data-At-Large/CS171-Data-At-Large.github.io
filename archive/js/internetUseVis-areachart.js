/*
 * InternetUseVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _userdata			-- data with number of users
 * @param _mindata          -- data with monthly minutes
 */

InternetUseVis = function(_parentElement, _userdata, _mindata){
    this.parentElement = _parentElement;
    this.userdata = _userdata;
    this.mindata = _mindata;
    this.$graphicContainer = $("#" + _parentElement);
    this.colorScale =  d3.scaleOrdinal(d3.schemeCategory20);

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

InternetUseVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 100, right: 300, bottom: 100, left: 200 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // Add drop down menu to the DOM
    vis.addDropDownMenu();

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

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

    // Overlay with path clipping
    vis.svg.append("defs")
        .append("clipPath")
        .attr("id", "clip-internet-use")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // Stacked area layout
    vis.area = d3.area()
        .x(function(d) { return vis.x(d.data.year); })
        .y0(function(d) { return vis.y(d[0]); })
        .y1(function(d) { return vis.y(d[1]); });

    // (Filter, aggregate, modify data)
    vis.filter = "";

    // SVG area path generator
    vis.area_single = d3.area()
        .x(function(d) { return vis.x(d.data.year); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d[1]-d[0]); });

    vis.xAxislabel = vis.svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", (vis.width/2))
        .attr("y", (vis.height + 40));

    vis.yAxislabel = vis.svg.append("text")
        .attr("class", "y-axis-label")
        .attr("x", 0)
        .attr("y", -20)
        .style("text-anchor", "end");

    vis.selection = "users"; // initialize selection to be user data
    vis.selectedData = vis.userdata;

    // (Filter, aggregate, modify data)
    vis.wrangleData();

    //when drop-down menu selection changes, re-wrangle data with selected data
    d3.select("#change-internet-use-data").on("change", function() {
        vis.selection = d3.select("#change-internet-use-data").property("value");
        if (vis.selection === "users"){
            vis.selectedData = vis.userdata;
            vis.wrangleData();
        }
        else{
            vis.selectedData = vis.mindata;
            vis.wrangleData();
        }

    });
}


/*
 * Data wrangling
 */

InternetUseVis.prototype.wrangleData = function(){
    var vis = this;

    // Initialize stack layout
    vis.colorScale.domain(d3.keys(vis.selectedData[0]).filter(function(d){ return d !== "year"; }));
    vis.dataCategories = vis.colorScale.domain();

    stack = d3.stack()
        .keys(vis.dataCategories);

    // Rearrange data
    vis.stackedData = stack(vis.selectedData);

    // at first there is no data wrangling
    vis.displayData = vis.stackedData;

    if (vis.filter !== "") {
        var indexOfFilter = vis.dataCategories.findIndex(function (d) {
            return d === vis.filter
        });
        vis.displayData = [vis.stackedData[indexOfFilter]];
    }

    // Update the visualization
    vis.updateVis();
}


/*
 * The drawing function
 */

InternetUseVis.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    // Get the maximum of the multi-dimensional array or in other words, get the highest peak of the uppermost layer
    vis.x.domain(d3.extent(vis.selectedData, function(d) { return d.year; }));

    vis.y.domain([0, d3.max(vis.displayData, function(d) {
        return d3.max(d, function(e) {
            if (vis.filter !== ""){
                return e[1]-e[0];
            }
            else
                return e[1];
        });
    })
    ]);

    // Draw the layers
    var categories = vis.svg.selectAll(".area")
        .data(vis.displayData);

    categories.enter().append("path")
        .attr("class", "area")
        .merge(categories)
        .attr("d", function(d) {
            if(vis.filter)
                return vis.area_single(d);
            else
                return vis.area(d);
        })
        .style("fill", function(d,i) {
            return vis.colorScale(vis.dataCategories[i]);
        })
        .on('mouseover', function(d,i){
            if(vis.filter)
                vis.text.text(vis.filter);
            else
                vis.text.text(vis.dataCategories[i]);
        })
        .on('mouseout', function(d,i){
            if(!vis.filter)
                vis.text.text("");
        })
        .on("click", function(d,i) {
            vis.filter = (vis.filter) ? "" : vis.dataCategories[i];
            vis.wrangleData();
            vis.text.text(vis.dataCategories[i]);
        })
        .transition()
        .duration(vis.duration);


    // TO-DO: Update tooltip text

    categories.exit().remove();


    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .transition()
        .duration(vis.duration);

    vis.svg.select(".y-axis").call(vis.yAxis)
        .transition()
        .duration(vis.duration);


    vis.svg.select(".x-axis-label")
        .text("Year");

    vis.svg.select(".y-axis-label")
        .text(function(){
            if (vis.selection === "users"){
                return "Number of Online Users";
            }
            else {
                return "Billions of Minutes";
            }
        });
}


/*
 Redraw the graph
 */
InternetUseVis.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}

/*
 Add drop down menu to the DOM
 */
InternetUseVis.prototype.addDropDownMenu = function() {
    var p = document.getElementById("vis-internet-use");
    var menu = document.createElement("form");
    menu.setAttribute("class", "form-inline");
    var selections = '<div class="form-group">' +
        '<label for="changeInternetUseData">Chart Data:  </label>' +
        '<select class="form-control" id="change-internet-use-data">' +
        '<option value="users">Number of Online Users</option>' +
        '<option value="min">Time Spent Online</option>' +
        '</select>' +
        '</div>';

    menu.innerHTML = selections;
    p.appendChild(menu);
}