/*
 * HackerInfoVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: perDayData
 */

HackerInfoVis = function(_parentElement, _data1, _data2, _data3){
    this.parentElement = _parentElement;
    this.data1 = _data1;
    this.data2 = _data2;
    this.data3 = _data3;
    this.$graphicContainer = $("#" + _parentElement);

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

HackerInfoVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 10, right: 10, bottom: 0, left: 10 };

    if ($("#" + vis.parentElement).width() - vis.margin.right - vis.margin.left > 100){
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    }
    else{
        vis.width = 100;
    }
    vis.height = 500 - vis.margin.top - vis.margin.bottom;



    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);

    vis.chart1 = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.width/6) + "," + (vis.height/2) + ")");

    vis.chart2 = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.width/6 * 3) + "," + (vis.height/2) + ")");

    vis.chart3 = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.width/6 * 5) + "," + (vis.height/2) + ")");

    // Scales
    vis.color1 = d3.scaleOrdinal().range(['#d5dddd', '#aabbbb', '#8ca3a3', '#667f7f']);
    vis.color2 = d3.scaleOrdinal().range(['#f1e3dd','#e1c3b7','#cb9780','#b56a4a','#7f4a34']);
    vis.color3 = d3.scaleOrdinal().range(['#b4bacb','#8790ab','#667292','#495269']);

    vis.radius = Math.min(vis.width/3.2, vis.height) / 2;

    // Donut paths
    vis.arc = d3.arc()
        .innerRadius(0)
        .outerRadius(vis.radius-10);

    // this arc is used for aligning the text labels
    vis.outerArc = d3.arc()
        .outerRadius(vis.radius * 0.9)
        .innerRadius(vis.radius * 0.9);

    vis.pie = d3.pie()
        .value(function(d) { return d.value; })
        .sort(null);

    //************** Set up Tooltip  **************//
    vis.tool_tip1 = d3.tip()
        .attr("class", "d3-tip")
        .offset([15, 15]);

    vis.tool_tip2 = d3.tip()
        .attr("class", "d3-tip")
        .offset([15, 15]);

    vis.tool_tip3 = d3.tip()
        .attr("class", "d3-tip")
        .offset([15, 15]);

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

HackerInfoVis.prototype.wrangleData = function(){
    var vis = this;

    // Update the visualization
    vis.updateVis();

}


/*
 * The drawing function
 */

HackerInfoVis.prototype.updateVis = function(){
    var vis = this;

    vis.tool_tip1.html(function(d) { return "<em>Average time to compromise a target environment</em>" + '<br>' + '<br>' +
        '<strong>' + d.group +'</strong>' + ': ' + d.value + "%";});

    vis.tool_tip2.html(function(d) { return "<em>Frequency that the target’s security team identify hacker presence</em>" + '<br>' + '<br>' +
        '<strong>' + d.group +'</strong>' + ': ' + d.value + "%";});

    vis.tool_tip3.html(function(d) { return "<em>Response to hackers being arrested and convicted</em>" + '<br>' + '<br>' +
        '<strong>' + d.group +'</strong>' + ': ' + d.value + "%";});


    vis.svg.call(vis.tool_tip1);
    vis.svg.call(vis.tool_tip2);
    vis.svg.call(vis.tool_tip3);

    vis.slice1 = vis.chart1.selectAll(".slice")
        .data(vis.pie(vis.data1));

    vis.slice1.enter().append("path")
        .attr("class", "slice")
        .attr("id", function(d,i){return "group1_" + i;})
        .attr("fill", function(d){
            return vis.color1(d.data["group"])
        })
        .attr("d", vis.arc)
        .style("stroke", "white")
        .style("stroke-width", 0.8)
        .on("mouseover", function(d){
            d3.select(this).style("stroke","white")
                .style("stroke-width",3.5);
            vis.tool_tip1.show(d.data);
        })
        .on("mouseout", function(d){
            d3.select(this).style("stroke","white")
                .style("stroke-width",0.8);
            vis.tool_tip1.hide(d.data);
        });

    vis.slice2 = vis.chart2.selectAll(".slice")
        .data(vis.pie(vis.data2));

    vis.slice2.enter().append("path")
        .attr("class", "slice")
        .attr("id", function(d,i){return "group2_" + i;})
        .attr("fill", function(d){
            return vis.color2(d.data["group"])
        })
        .attr("d", vis.arc)
        .style("stroke", "white")
        .style("stroke-width", 0.8)
        .on("mouseover", function(d){
            d3.select(this).style("stroke","white")
                .style("stroke-width",3.5);
            vis.tool_tip2.show(d.data);
        })
        .on("mouseout", function(d){
            d3.select(this).style("stroke","white")
                .style("stroke-width",0.8);
            vis.tool_tip2.hide(d.data);
        });

    vis.slice3 = vis.chart3.selectAll(".slice")
        .data(vis.pie(vis.data3));

    vis.slice3.enter().append("path")
        .attr("class", "slice")
        .attr("id", function(d,i){return "group3_" + i;})
        .attr("fill", function(d){
            return vis.color3(d.data["group"])
        })
        .attr("d", vis.arc)
        .style("stroke", "white")
        .style("stroke-width", 0.8)
        .on("mouseover", function(d){
            d3.select(this).style("stroke","white")
                .style("stroke-width",3.5);
            vis.tool_tip3.show(d.data);
        })
        .on("mouseout", function(d){
            d3.select(this).style("stroke","white")
                .style("stroke-width",0.8);
            vis.tool_tip3.hide(d.data);
        });

    vis.addAnnotation();

}

/*
 Add annotation
 */
HackerInfoVis.prototype.addAnnotation = function() {
    var vis = this;
        const annotations = [
            {
                note: {
                    label: "claimed they could break into a system in less than 12 hours",
                    title: "88%",
                    wrap: 200
                },
                connector: {
                    end: "dot"
                },
                x: 100,
                y: 330,
                dy: 30,
                dx: 20
            },
            {
                note: {
                    label: "reported that security teams almost never caught them in the act.",
                    title: "69%",
                    wrap: 250
                },
                connector: {
                    end: "dot"
                },
                x: 310,
                y: 330,
                dy: 30,
                dx: 20
            },
            {
                note: {
                    label: "reported feeling that hackers who were arrested/convicted deserved it",
                    title: "Only 28%",
                    wrap: 350
                },
                connector: {
                    end: "dot"
                },
                x: 460,
                y: 145,
                dy: -30,
                dx: -20
            }].map(function(d){ d.color = "grey"; return d});

        const makeAnnotations = d3.annotation()
            .type(d3.annotationCallout)
            .annotations(annotations);

        vis.svg
            .append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations)
}

/*
 Redraw the graph
 */
HackerInfoVis.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}