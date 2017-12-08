/**
 * Created by xindizhao1993 on 11/9/17.
 */


/*
 * ParallelCoordChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the
 */

DataBreachParallelCoord = function(_parentElement, _data, _dimensionData, _typeData, _colorData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.dimensions = _dimensionData;
    this.types = _typeData;
    this.displayData = []; // see data wrangling
    this.displayDimensions = _dimensionData;
    this.colorData = _colorData;
    this.selectedval = this.displayDimensions[0].key;

    // DEBUG RAW DATA
    // console.log(this.data);
    // console.log(this.dimensions);

    this.initVis();
}

DataBreachParallelCoord.prototype.initVis = function(){
    var vis = this;

    vis.margin = {top: 80, right: 110, bottom: 10, left: 130};

    vis.width = document.getElementById(vis.parentElement).offsetWidth - vis.margin.left - vis.margin.right;
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.devicePixelRatio = window.devicePixelRatio || 1;

    vis.xscale = d3.scalePoint()
        .range([0, vis.width]);

    vis.yAxis = d3.axisLeft();

    vis.container = d3.select("#" + vis.parentElement).append("div")
        .attr("class", "parcoords")
        .style("width", vis.width + vis.margin.left + vis.margin.right + "px")
        .style("height", vis.height + vis.margin.top + vis.margin.bottom + "px");

    vis.svg = vis.container.append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.canvas = vis.container.append("canvas")
        .attr("width", vis.width * vis.devicePixelRatio)
        .attr("height", vis.height * vis.devicePixelRatio)
        .style("width", vis.width + "px")
        .style("height", vis.height + "px")
        .style("margin-top", vis.margin.top + "px")
        .style("margin-left", vis.margin.left + "px");
    console.log(vis.devicePixelRatio);
    vis.ctx = vis.canvas.node().getContext("2d");
    vis.ctx.globalCompositeOperation = 'darken';
    vis.ctx.globalAlpha = 0.15;
    vis.ctx.lineWidth = 1.5;
    vis.ctx.scale(vis.devicePixelRatio, vis.devicePixelRatio);

    vis.initText();
};

/*
 * Data wrangling
 */

DataBreachParallelCoord.prototype.wrangleData = function(){
    var vis = this;
    //console.log("---wrangling data");
    // In the first step no data wrangling/filtering needed

    vis.displayData = vis.data;

    vis.displayDimensions = [];

    vis.dimensions.forEach(function(d){
        //console.log(d.description, $.inArray(d.description, choices));
        if ($.inArray(d.description, choices) > -1){
            vis.displayDimensions.push(d);
        }
    });
    //console.log(choices);

    //console.log(vis.displayDimensions);
    vis.selectedval = vis.displayDimensions[0].key;
    // Update the visualization
    vis.updateVis();
};



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

DataBreachParallelCoord.prototype.updateVis = function(){
    var vis = this;

    vis.xscale.domain(d3.range(vis.displayDimensions.length));

    vis.axes = vis.svg.selectAll(".axis")
        .data(vis.displayDimensions);

    vis.axesTitles = vis.svg.selectAll(".title")
        .data(vis.displayDimensions);

    vis.axes.enter().append("g")
        .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
        //.attr("class", "axis ")
        .attr("transform", function(d,i) { return "translate(" + vis.xscale(i) + ")"; })
        .each(function(d) {
            //console.log(d.scale.range());
            vis.renderAxis = "axis" in d
                ? d.axis.scale(d.scale)  // custom axis
                : vis.yAxis.scale(d.scale);  // default axis
            d3.select(this).call(vis.renderAxis);
        })
        .append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(d.brush = d3.brushY()
                .extent([[-10,0], [10,vis.height]])
                .on("start", brushstart)
                .on("brush", brush)
                .on("end", brush)
            )
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    vis.axesTitles.enter().append("text")
        .attr("transform", function(d,i) { return "translate(" + vis.xscale(i) + ", -10) rotate(340)"; })
        .attr("class", "title")
        .attr("text-anchor", "start")
        .text(function(d) { return "description" in d ? d.description : d.key; })
        .on("click", function(d){
            if(d.key !== "Records Lost") {
                console.log(d.key);
                vis.selectedval = d.key;
                color.domain(vis.colorData[d.key].domain)
                    .range(vis.colorData[d.key].range);

                d3.selectAll(".axis .tick text")
                    .style("fill", "black");
                d3.selectAll(".axis." + d.key.replace(/ /g, "_") + " .tick text")
                    .style("fill", color);
                vis.ctx.clearRect(0,0,vis.width,vis.height);
                vis.ctx.globalAlpha = d3.min([0.85/Math.pow(vis.displayData.length,0.3),1]);
                vis.render(vis.displayData);
            }
        });

    vis.axes.merge(vis.axes)
        .attr("class", function(d) { return "axis " + d.key.replace(/ /g, "_"); })
        //.attr("class", "axis ")
        .attr("transform", function(d,i) { return "translate(" + vis.xscale(i) + ")"; })
        .each(function(d) {
            vis.renderAxis = "axis" in d
                ? d.axis.scale(d.scale)  // custom axis
                : vis.yAxis.scale(d.scale);  // default axis
            d3.select(this).call(vis.renderAxis);
        })
        .append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(d.brush = d3.brushY()
                .extent([[-10,0], [10,vis.height]])
                .on("start", brushstart)
                .on("brush", brush)
                .on("end", brush)
            )
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    vis.axesTitles.merge(vis.axesTitles)
        .attr("transform", function(d,i) { return "translate(" + vis.xscale(i) + ", -10) rotate(340)"; })
        .attr("class", "title")
        .attr("text-anchor", "start")
        .text(function(d) { return "description" in d ? d.description : d.key; })
        .on("click", function(d){
            if(d.key !== "Records Lost") {
                //console.log(d.key);
                vis.selectedval = d.key;
                color.domain(vis.colorData[d.key].domain)
                    .range(vis.colorData[d.key].range);
                d3.selectAll(".axis .tick text")
                    .style("fill", "black");
                d3.selectAll(".axis." + d.key.replace(/ /g, "_") + " .tick text")
                    .style("fill", color);
                vis.ctx.clearRect(0,0,vis.width,vis.height);
                vis.ctx.globalAlpha = d3.min([0.85/Math.pow(vis.displayData.length,0.3),1]);
                vis.render(vis.displayData);
            }
        });

    // Add and store a brush for each axis.

    color.domain(vis.colorData[vis.selectedval].domain)
        .range(vis.colorData[vis.selectedval].range);

    d3.selectAll(".axis."+ vis.selectedval.replace(/ /g, "_") +" .tick text")
        .style("fill", color);

    vis.axes.exit().remove();
    vis.axesTitles.exit().remove();


    vis.render = renderQueue(draw).rate(30);

    vis.ctx.clearRect(0,0,vis.width,vis.height);
    vis.ctx.globalAlpha = d3.min([1.15/Math.pow(vis.displayData.length,0.3),1]);
    vis.render(vis.displayData);

    function project(d) {
        return vis.displayDimensions.map(function(p,i) {
            // check if data element has property and contains a value
            if (
                !(p.key in d) ||
                d[p.key] === null
            ) return null;

            return [vis.xscale(i),p.scale(d[p.key])];
        });
    };

    function draw(d) {
        vis.ctx.strokeStyle = color(d[vis.selectedval]);
        vis.ctx.beginPath();
        var coords = project(d);
        coords.forEach(function(p,i) {
            // this tricky bit avoids rendering null values as 0
            if (p === null) {
                // this bit renders horizontal lines on the previous/next
                // dimensions, so that sandwiched null values are visible
                if (i > 0) {
                    var prev = coords[i-1];
                    if (prev !== null) {
                        vis.ctx.moveTo(prev[0],prev[1]);
                        vis.ctx.lineTo(prev[0]+6,prev[1]);
                    }
                }
                if (i < coords.length-1) {
                    var next = coords[i+1];
                    if (next !== null) {
                        vis.ctx.moveTo(next[0]-6,next[1]);
                    }
                }
                return;
            }

            if (i == 0) {
                vis.ctx.moveTo(p[0],p[1]);
                return;
            }

            vis.ctx.lineTo(p[0],p[1]);
        });
        vis.ctx.stroke();
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        vis.render.invalidate();

        var actives = [];
        vis.svg.selectAll(".axis .brush")
            .filter(function(d) {
                return d3.brushSelection(this);
            })
            .each(function(d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });

        vis.displayData = vis.data.filter(function(d) {
            if (actives.every(function(active) {
                    var dim = active.dimension;
                    // test if point is within extents for each active brush
                    return dim.type.within(d[dim.key], active.extent, dim);
                })) {
                return true;
            }
        });

        // show ticks for active brush dimensions
        // and filter ticks to only those within brush extents
        /*
         svg.selectAll(".axis")
         .filter(function(d) {
         return actives.indexOf(d) > -1 ? true : false;
         })
         .classed("active", true)
         .each(function(dimension, i) {
         var extent = extents[i];
         d3.select(this)
         .selectAll(".tick text")
         .style("display", function(d) {
         var value = dimension.type.coerce(d);
         return dimension.type.within(value, extent, dimension) ? null : "none";
         });
         });

         // reset dimensions without active brushes
         svg.selectAll(".axis")
         .filter(function(d) {
         return actives.indexOf(d) > -1 ? false : true;
         })
         .classed("active", false)
         .selectAll(".tick text")
         .style("display", null);
         */

        vis.ctx.clearRect(0,0,vis.width,vis.height);
        vis.ctx.globalAlpha = d3.min([0.85/Math.pow(vis.displayData.length,0.3),1]);
        vis.render(vis.displayData);

    }

};

/*
DataBreachParallelCoord.prototype.updateAxes = function(){
    var vis = this;
    console.log("--updateAxes");
    vis.svg.selectAll(".axis .brush")
        .each(function(d) {
            d3.select(this).call(d.brush.move, null)});
    vis.displayData = vis.data;
    vis.ctx.clearRect(0,0,vis.width,vis.height);

    vis.wrangleData();
}
*/

/*
 Add drop down menu to the DOM
 */
DataBreachParallelCoord.prototype.addCheckbox = function() {
    var p = document.getElementById("checkbox-control");
    //var menu = document.createElement("form");
    var selections = '<form><div class="form-group">' +
        '<p><strong>Click on axis title to color by the chosen axis, brush to select, and/or use checkboxes to select axes to include in the plot:</strong></p></br>' +
        '<input type="checkbox" class="AxesCheckbox" value="Method of Leak" checked="checked" onchange="updateAxes()"> Method of Leak &#9' + '<p class="indent"></p>' +
        '<input type="checkbox" class="AxesCheckbox" value="Data Sensitivity" checked="checked" onchange="updateAxes()"> Data Sensitivity &#9' + '<p class="indent"></p>' +
        '<input type="checkbox" class="AxesCheckbox" value="Organization Type" checked="checked" onchange="updateAxes()">Organization Type &#9' +'<p class="indent"></p>' +
        '<input type="checkbox" class="AxesCheckbox" value="Year of Occurrence" checked="checked" onchange="updateAxes()">Year of Occurrence &#9' + '<p class="indent"></p>' +
        '<input type="checkbox" class="AxesCheckbox" value="Number of Records Lost" checked="checked" onchange="updateAxes()"> Records Lost &#9 ' +
        '</div></form>';

    p.innerHTML = selections;
    //p.appendChild(menu);
}

DataBreachParallelCoord.prototype.initText = function() {
    var vis = this;
    var p = document.getElementById("checkbox-control");
    var texts = '<p>' +
        "To answer the above questions or even more in your mind, let's look into the recent data breaches cases together. </br>" +
        "You can include/exclude certain variables, color by one column, or filter on selected dimension(s).</br>" +
        "<strong>Click to start with some examples.</strong> " +
        '<i class="fa fa-arrow-circle-right" aria-hidden="true"></i></p>';
    p.innerHTML = texts;
    //p.appendChild(menu);

    $("#checkbox-control").click(function(){
        if(currentView <= 2){
            vis.zoomView()
        }
    });
}

DataBreachParallelCoord.prototype.view1Text = function() {
    var p = document.getElementById("checkbox-control");
    var view1texts = '<p>' +
        "The following view is filtered only to include the SSN/personal Details lost and colored by the method of leak. </br>You may realize that lost or stolen device and hacked events cause the majority loss of such sensitive and private information. </br>" +
        "This rings a bell for us - sometimes by being more careful with the hardwares can help protect much personal information. </br>" +
        '<i class="fa fa-arrow-circle-right" aria-hidden="true"></i></p>';
    p.innerHTML = view1texts;
    //p.appendChild(menu);
}

DataBreachParallelCoord.prototype.view2Text = function() {
    var p = document.getElementById("checkbox-control");
    var view2texts = '<p>' +
        "If we look at credit card information lost and again colored by the method of leak - Hacked events appear to be the major cause. </br>" +
        "This teaches another lesson - we should all be more cautious with our credit cards as they are very vulnerable to hacks. </br>" +
        "Now click to continue deeper dive into the cases yourself!</br>" +
        '<i class="fa fa-arrow-circle-right" aria-hidden="true"></i></p>';
    p.innerHTML = view2texts;
    //p.appendChild(menu);
}


DataBreachParallelCoord.prototype.zoomView = function() {
    var vis = this;

    // In the first step no data wrangling/filtering needed
    //vis.displayData = vis.data;

    var viewVar;
    vis.displayData = vis.data;

    if (currentView ===0){
        viewVar = "SSN/Personal details";
        vis.view1Text();
    }
    else if (currentView ===1){
        viewVar = "Credit card information";
        vis.view2Text();
    }
    vis.displayData = vis.data.filter(function(d) {
        return d["Data Sensitivity"] == viewVar;
    });
    console.log(vis.displayData);

    vis.displayDimensions = [];

    choices = ["Method of Leak", "Data Sensitivity", "Number of Records Lost"];

    vis.dimensions.forEach(function(d){
        //console.log(d.description, $.inArray(d.description, choices));
        if ($.inArray(d.description, choices) > -1){
            vis.displayDimensions.push(d);
        }
    });
    //console.log(choices);

    console.log(vis.displayDimensions);
    vis.selectedval = "Method of Leak";
    // Update the visualization
    if (currentView ==2){
        vis.addCheckbox();
        choices = [];
        d3.selectAll(".AxesCheckbox").each(function(d){
            cb = d3.select(this);
            if(cb.property("checked")){
                choices.push(cb.property("value"));
            }
        });
        vis.wrangleData();
    }
    else{
        vis.updateVis();
    }
    currentView += 1;
    console.log(currentView);

};

$("#checkbox-control").hover(
    function(){
        if(currentView<=2) {$(this).css("background-color", "#cccccc")
        }
    },
    function(){$(this).css("background-color", "#f5f5f5")}
);