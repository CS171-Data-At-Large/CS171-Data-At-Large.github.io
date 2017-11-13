/*
 * InternetActivityVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

InternetActivityVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = this.data;
    this.$graphicContainer = $("#" + _parentElement);

    this.preInitVis();
}

/*
 * Pre-initialize visualization (i.e. add drop down menu)
 */
InternetActivityVis.prototype.preInitVis = function() {
    var vis = this;
    // Add drop down menu to the DOM
    vis.addDropDownMenu();

    vis.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

InternetActivityVis.prototype.initVis = function(){
    // var vis = this;
    //
    // vis.margin = { top: 20, right: 200, bottom: 40, left: 500 };
    //
    // if ($("#" + vis.parentElement).width() - vis.margin.right - vis.margin.left > 100){
    //     vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    // }
    // else{
    //     vis.width = 100;
    // }
    // vis.height = 500 - vis.margin.top - vis.margin.bottom;
    //
    // // SVG drawing area
    // vis.svg = d3.select("#" + vis.parentElement).append("svg")
    //     .attr("width", vis.width + vis.margin.left + vis.margin.right)
    //     .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    //     .append("g")
    //     .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
    //
    //
    // // Scales and axes
    // vis.x = d3.scaleBand()
    //     .rangeRound([0, vis.width])
    //     .paddingInner(0.2)
    //     .domain(d3.range(0,15));
    //
    // vis.y = d3.scaleLinear()
    //     .range([0,vis.height]);
    //
    // vis.xAxis = d3.axisBottom()
    //     .scale(vis.x);
    //
    // vis.yAxis = d3.axisLeft()
    //     .scale(vis.y);
    //
    // vis.svg.append("g")
    //     .attr("class", "x-axis axis")
    //     .attr("transform", "translate(0," + vis.height + ")");
    //
    // vis.svg.append("g")
    //     .attr("class", "y-axis axis");
    //
    // // Axis title
    // vis.svg.append("text")
    //     .attr("x", (vis.width/2))
    //     .attr("y", vis.height + 40)
    //     .text("Share of Respondents");
    //
    // // // Tooltip placeholder
    // // vis.tool_tip = d3.tip()
    // //     .attr("class", "d3-tip")
    // //     .offset([15, 15]);
    //
    //
    // // (Filter, aggregate, modify data)
    // vis.wrangleData();
}


/*
 * Data wrangling
 */

InternetActivityVis.prototype.wrangleData = function(){
    // var vis = this;
    //
    // vis.selection = d3.select("#change-internet-activity-data").property("value");
    // if (vis.selection === "avg"){
    //     vis.displayData = vis.data['Avg'];
    // }
    // else if(vis.selection === "age18_29"){
    //     vis.displayData = vis.data['Age_18_29'];
    // }
    // else if(vis.selection === "age30_59"){
    //     vis.displayData = vis.data['Age_30_59'];
    // }
    // else{
    //     vis.displayData = vis.data['Age_60'];
    // }
    //
    // console.log(vis.selection);
    // console.log(vis.data);
    // // Update the visualization
    // vis.updateVis();
    //
    // //when drop-down menu selection changes, re-wrangle data with selected data
    // d3.select("#change-internet-activity-data").on("change", function() {
    //     vis.selection = d3.select("#change-internet-activity-data").property("value");
    //     if (vis.selection === "avg"){
    //         vis.displayData = vis.data['Avg'];
    //         vis.updateVis();
    //     }
    //     else if(vis.selection === "age18_29"){
    //         vis.displayData = vis.data['Age_18_29'];
    //         vis.updateVis();
    //     }
    //     else if(vis.selection === "age30_59"){
    //         vis.displayData = vis.data['Age_30_59'];
    //         vis.updateVis();
    //     }
    //     else{
    //         vis.displayData = vis.data['Age_60'];
    //         vis.updateVis();
    //     }
    //
    // });
}


/*
 * The drawing function
 */

InternetActivityVis.prototype.updateVis = function(){
    // var vis = this;
    //
    // // Update domains
    // vis.y.domain([0, d3.max(vis.displayData, function(d){ return d})]);
    //
    // var bars = vis.svg.selectAll(".share")
    //     .data(this.displayData);
    //
    // bars.enter().append("rect")
    //     .attr("class", "share")
    //
    //     .merge(bars)
    //     .transition()
    //     .attr("height", function(d){
    //         return vis.y(d);
    //     })
    //     .attr("width", vis.x.bandwidth())
    //     .attr("y", function(d, index){
    //         return vis.y(index);
    //     })
    //     .attr("x", 0)
    //     .style("fill", function(d, i){
    //         if (i<2){
    //             return "#667292";
    //         }
    //         else{
    //             return"#f1e3dd";
    //         }
    //     });
    //
    // bars.exit().remove();
    //
    // // Call axis function with the new domain
    // vis.svg.select(".x-axis").call(vis.xAxis);
    //
    // vis.svg.select(".y-axis").call(vis.yAxis)
    //     .selectAll("text")
    //     .style("text-anchor", "end")
    //     .attr("x", "-0.9em")
    //     .attr("y", "-0.1em")
    //     .text(function(d, i){
    //         return vis.displayData[i]["concerns"];
    //     });
}

/*
 Add drop down menu to the DOM
 */
InternetActivityVis.prototype.addDropDownMenu = function() {
    var p = document.getElementById("internet-activity-form");
    var menu = document.createElement("form");
    menu.setAttribute("class", "form-inline");
    var selections = '<div class="form-group">' +
        '<label for="changeInternetActivityData">Age Group:  </label>' +
        '<select class="form-control" id="change-internet-activity-data">' +
        '<option value="avg">Average</option>' +
        '<option value="age18_29">18 to 29</option>' +
        '<option value="age30_59">30 to 59</option>' +
        '<option value="age60">60 and above</option>' +
        '</select>' +
        '</div>';

    menu.innerHTML = selections;
    p.appendChild(menu);
}

/*
 Redraw the graph
 */
InternetActivityVis.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}