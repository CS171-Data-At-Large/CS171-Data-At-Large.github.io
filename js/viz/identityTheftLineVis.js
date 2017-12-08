
/*
 *  IdentityTheftLine - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array with all stations of the bike-sharing network
 */

IdentityTheftLine = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;
    this.$graphicContainer = $("#" + _parentElement);
    this.duration = 1000;
    this.ease = d3.easeElasticInOut;
    this.initVis();
};


/*
 *  Initialize visualization
 */

IdentityTheftLine.prototype.initVis = function() {
    var vis = this;
    vis.margin = { top: 20, right: 20, bottom: 40, left: 80 };

    vis.width = 380 - vis.margin.left - vis.margin.right;
    vis.height = 230 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


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

    vis.line = d3.line()
        .x(function (d) {
            return vis.x(d.Year);
        })
        .y(function (d) {
            return vis.y(d.Victims);
        });

    vis.line.curve(d3.curveCatmullRom);

    vis.xAxislabel = vis.svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", (vis.width/2 - 30))
        .attr("y", (vis.height + 40))
        .style("fill", "#bccad6");

    vis.yAxislabel = vis.svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "translate(-60, 90) rotate(270)")
        .style("text-anchor", "middle")
        .style("fill", "#bccad6");

    vis.victimPath = vis.svg.append("path")
        .attr("class", "victim-path");

    vis.wrangleData("");

};


/*
 *  Data wrangling
 */

IdentityTheftLine.prototype.wrangleData = function(_selected) {
    var vis = this;

    vis.selected = _selected;
    vis.displayData = {};

    for (var year=2008; year<=2016; year++) {
        if (year != 2012){
            vis.displayData[year] = {'Year': year, 'Victims': 0};
        }
    }

    if (vis.selected !== "") {
        vis.filteredData = vis.data.filter(function(d) {
            return d.State === vis.selected;
        })
    }
    else {
        vis.filteredData = vis.data;
    }

    vis.filteredData.forEach(function(d) {
        vis.displayData[d.Year]['Victims'] += d['Number of victims']
    });

    vis.displayData = $.map(vis.displayData, function(value, index) {
        return [value];
    });



    // Update the visualization
    vis.updateVis();

};


/*
 *  The drawing function
 */

IdentityTheftLine.prototype.updateVis = function() {
    var vis = this;

    // Update domain
    vis.x.domain([d3.min(vis.displayData, function(d) {return d.Year;}),
        d3.max(vis.displayData, function(d) {return d.Year;})]);

    vis.y.domain([d3.min(vis.displayData, function(d) {return d.Victims;}),
        d3.max(vis.displayData, function(d) {return d.Victims;})]);

    vis.victimPath
        .datum(vis.displayData)
        .attr("d", vis.line)
        .attr("fill", "transparent")
        .attr("stroke", "#bccad6")
        .attr("stroke-width", 3);

    vis.svg.select(".x-axis")
        .attr("class", "white-axis")
        .call(vis.xAxis.tickFormat(d3.format("d")));

    vis.svg.select(".y-axis")
        .attr("class", "white-axis")
        .call(vis.yAxis);

    vis.svg.select(".x-axis-label")
        .text("Year");

    vis.svg.select(".y-axis-label")
        .text(function(){
            if (vis.selected === "") {
                return "# victims in US";
            }
            else {
                return "# victims in " + vis.selected;
            }
        });

    // var content = '<thead><tr>\n<th scope="row">Year</th>\n<th scope="row">Number of Victims</th></tr></thead>\n<tbody>';
    //
    // for (var i=0; i<vis.displayData.length; i++) {
    //     var year = vis.displayData[i]["Year"];
    //     var nvictims = vis.displayData[i]['Victims'];
    //
    //     content += '<tr><td class="col-md-2">'+year+'</td><td class="col-md-4">'+nvictims+'</td></tr>\n';
    // }
    //
    // content = content + "</tbody";
    //
    // document.getElementById("table-identity-theft").innerHTML = content;


};

/*
 Redraw the graph
 */
IdentityTheftLine.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
};