/*
 * HackerReasonVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

HackerReasonVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = this.data;
    this.$graphicContainer = $("#" + _parentElement);

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

HackerReasonVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 50, right: 10, bottom: 0, left: 10 };

    if ($("#" + vis.parentElement).width() - vis.margin.right - vis.margin.left > 100){
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    }
    else{
        vis.width = 100;
    }
    vis.height = 600- vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (vis.width/2) + "," + (vis.height/2) + ")");

    // Scales
    vis.color = d3.scaleOrdinal()
        .range(["#667292", "#667292", "#f1e3dd", "#f1e3dd", "#f1e3dd", "#f1e3dd", "#f1e3dd"]);

    vis.floatFormat = d3.format('.4r');
    vis.percentFormat = d3.format(',.2%');
    vis.padAngle = 0.02;
    vis.cornerRadius = 3;

    vis.radius = Math.min(vis.width, vis.height) / 2;

    // Donut paths
    vis.pie = d3.pie()
        .value(function(d){return 100;})
        .sort(null);

    vis.arc = d3.arc()
        .outerRadius(vis.radius * 0.8)
        .innerRadius(vis.radius * 0.6)
        .cornerRadius(vis.cornerRadius)
        .padAngle(vis.padAngle);

    // this arc is used for aligning the text labels
    vis.outerArc = d3.arc()
        .outerRadius(vis.radius * 0.9)
        .innerRadius(vis.radius * 0.9);

    // g elements to keep elements within svg modular
    vis.svg.append('g').attr('class', 'slices');
    vis.svg.append('g').attr('class', 'labelName');
    vis.svg.append('g').attr('class', 'lines');
    vis.svg.append('g').attr('class', 'chartTitle');

    // Tooltip placeholder
    vis.tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([15, 15]);


    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

HackerReasonVis.prototype.wrangleData = function(){
    var vis = this;

    // Update the visualization
    vis.updateVis();
}


/*
 * The drawing function
 */

HackerReasonVis.prototype.updateVis = function(){
    var vis = this;

    vis.reason = vis.svg.select(".slices")
        .datum(vis.data).selectAll("path")
        .data(vis.pie);

    vis.reason.enter().append("path")
        .attr("class", "slices")
        .attr("id", function(d,i){return "reason_" + i;})
        .attr("fill", function(d){
            return vis.color(d.data["Reason"])
        })
        .attr("d", vis.arc);

    vis.title = vis.svg.select(".chartTitle")
        .datum(vis.data).selectAll("text")
        .data(vis.pie)
        .enter().append("text")
        .attr("text-anchor", "middle")
        .attr('font-size', '2em')
        .attr('y', -10)
        .html(function(d){return "<tspan x='0'>7 Reasons Why </tspan>" + "<tspan x='0' dy='1.2em'>Hackers Hack</tspan>"});

    vis.label = vis.svg.select(".labelName")
        .datum(vis.data).selectAll("text")
        .data(vis.pie);

    vis.label.enter().append("text")
        .attr("class", "labelName")
        .attr("x", 10)
        .attr("dy", 18)
        .append("textPath")
        .attr("xllink:href", function(d,i){return "#reason_"+i;})
        .text(function(d){
            return d.data["Reason"];
        })
        .style("fill", function(d,i){
            if (i<2) {
                return "#ffffff";
            }
            else{
                return "grey";
            }
        });

    d3.selectAll('.labelName text, .slices path').call(toolTip);
    /* Internal functions */
    // Calculate mid angle
    function midAngle(d){ return d.startAngle + (d.endAngle - d.startAngle)/2;}
    function angle(d){ return (d.endAngle - d.startAngle)/2;}

    // Add tooltip
    // function that creates and adds the tool tip to a selected element
    function toolTip(selection) {

        // add tooltip (svg circle element) when mouse enters label or slice
        selection.on('mouseenter', function (data) {


            vis.svg.append('circle')
                .attr('class', 'toolCircle')
                .attr('r', vis.radius * 0.55)
                .style('fill', 'white');

            vis.svg.append('circle')
                .attr('class', 'toolCircle')
                .attr('r', vis.radius * 0.55) // radius of tooltip circle
                .style('fill', vis.color(data.data["Reason"])) // colour based on category mouse is over
                .style('fill-opacity', 0.35);

            vis.svg.append('text')
                .attr('class', 'toolCircle')
                .attr('dy', -70) // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                .html(toolTipHTML(data)) // add text to the circle.
                .style('font-size', '.9em')
                .style('text-anchor', 'middle'); // centres text in tooltip

        });

        // remove the tooltip when mouse leaves the slice/label
        selection.on('mouseout', function () {
            d3.selectAll('.toolCircle').remove();
        });


    }

    // function to create the HTML string for the tool tip. Loops through each key in data object
    // and returns the html string key: value
    function toolTipHTML(data) {

        var tip = '',
            i   = 0;

        for (var key in data.data) {
            // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
            // tspan effectively imitates a line break.
            if (i === 0) tip += '<tspan x="0" font-weight="bold" font-size="1.5em">' +  data.data[key] + '</tspan>';
            else tip += '<tspan x="0" dy="1.1em">'+ data.data[key] + '</tspan>';
            i++;
        }

        return tip;
    }
}


/*
 Redraw the graph
 */
HackerReasonVis.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}