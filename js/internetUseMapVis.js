/*
 * InternetUseVis - Object constructor function
 * @param _parentElement 	            -- the HTML element in which to draw the visualization
 * @param _internetData        		    -- data of percentage of internet users
 * @param _mobileData                   -- data of mobile broadband subscription / 100 people
 * @param _mapData                      -- world map json
 */

InternetUseMapVis = function(_parentElement, _internetData, _mobileData, _mapData){
    this.parentElement = _parentElement;
    this.internetData = _internetData;
    this.mobileData = _mobileData;
    this.mapData = _mapData;
    this.$graphicContainer = $("#" + _parentElement);
    this.duration = 1000;
    this.ease = d3.easeElasticInOut;
    this.maxYear = 2016;
    this.minYear = 1990;
    this.currentYear = this.minYear;
    this.play = false;

    this.preInitVis();
}

/*
 * Pre-initialize visualization (i.e. add drop down menu)
 */
InternetUseMapVis.prototype.preInitVis = function() {
    var vis = this;
    // Add drop down menu to the DOM
    vis.addSlider();
    vis.addDataButtons();
    vis.addYearButton();

    vis.initVis();
    vis.animateVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

InternetUseMapVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 50, right: 50, bottom: 40, left: 50 };

    if ($("#" + vis.parentElement).width() - vis.margin.right - vis.margin.left > 200){
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    }
    else{
        vis.width = 300;
    }
        vis.height = 650 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.color = d3.scaleQuantize()
        .range(['#e1e3ea','#b4bacb','#8790ab','#667292','#495269','#2a2f3c']);


    //********** Create projection **********//
    vis.projection = d3.geoMercator()
        .translate([vis.width/2, vis.height/2])
        .scale(vis.width/5.3)
        .rotate([-5,0, 0])
        .center([10, 20]);

    //********** Create D3 geo path **********//
    vis.path = d3.geoPath()
        .projection(vis.projection);

    vis.map = vis.svg.append("g")
        .attr("class", "world-map");

    // listen to changes
    vis.selection = d3.select(".btn-secondary.active").property("id");

    if (vis.selection === "percent-internet-user"){
        vis.selectedData = vis.internetData;
    }
    else{
        vis.selectedData = vis.mobileData;
    }

    // //************** Set up Tooltip  **************//
    // vis.tool_tip = d3.tip()
    //     .attr("class", "d3-tip")
    //     .offset([5, 5]);

    vis.legendTitle = [
        { key: "percent-internet-user", title: "% Internet User" },
        { key: "cellular-user-per-100", title: "# Subs per 100 People" }
    ];
    vis.legendRectSize = 15;
    vis.legendSpacing = 4;

    //********** Create legend **********//
    //reference code: http://zeroviscosity.com/d3-js-step-by-step/step-3-adding-a-legend
    vis.legend = vis.svg.append("g")
        .attr("class", "legend");

    var squareData = vis.color.range().map(function (d) {
        d = vis.color.invertExtent(d);
        d = d.map(function(l){
            return Number(Math.round(l+'e2')+'e-2');
        });
        return d;
    });

    squareData.unshift(NaN); // for places where there was no data

    //********** Draw squares for legend **********//
    vis.legendSquares = vis.legend.append("g")
        .attr("class", "legend-squares-group");

    vis.legendSquares.selectAll(".legend-square")
        .data(squareData)
        .enter()
        .append("rect")
        .attr("class", "legend-square")
        .attr('width', vis.legendRectSize)
        .attr('height', vis.legendRectSize)
        .attr("transform", function (d, i) {
            var iconHeight = vis.legendRectSize + vis.legendSpacing;
            var offset = iconHeight;
            var horz = -2.9* vis.legendRectSize;
            var vert = vis.height/1.4 + i * iconHeight - offset;
            return "translate(" + horz + "," + vert + ")";
        })
        .style('fill', function (d) {
            if (isNaN(d[0])) {
                return "#f1e3dd";
            }
            else {
                return vis.color(d[0]+0.05);
            }
        });
        // .style("opacity", 0.8);

    //********** Add legend labels **********//
    vis.legendLabel = vis.legend.append("g")
        .attr("class", "legend-labels-group");

    // Add legend title
    vis.legendCaption = vis.legend.append("g")
        .attr("class", "legend-title-group");

    //********** Chart title **********//
    vis.svg.append("text")
        .attr("class", "chart-title")
        .attr("x", (vis.width/2))
        .attr("y", -10)
        .attr("text-anchor", "middle");


    // (Filter, aggregate, modify data)
    vis.wrangleData();

    // Listen to data change
    $('.btn-secondary').click( function() {
        $(this).addClass('active').siblings().removeClass('active');
        vis.selection = d3.select(this).property("id");

        if (vis.selection === "percent-internet-user"){
            vis.selectedData = vis.internetData;
            vis.wrangleData();
        }
        else{
            vis.selectedData = vis.mobileData;
            vis.wrangleData();
        }
    });

    // Listen to slider change
    vis.yearSlider.noUiSlider.on("change", function(){
        vis.currentYear = Math.round(vis.yearSlider.noUiSlider.get());
        document.getElementById('internet-clock').innerHTML = vis.currentYear;
        vis.updateVis();
    });

    // Listen to slider button presses
    vis.yearButton1 = document.getElementById('year_decrease_1'),
        vis.yearButton2 = document.getElementById('year_increase_1');

    vis.yearButton1.addEventListener('click', function(){
        if (vis.currentYear > 1990){
            vis.currentYear--;
            vis.yearSlider.noUiSlider.set(vis.currentYear);
            document.getElementById('internet-clock').innerHTML = vis.currentYear;
            vis.updateVis();
        }
    });

    vis.yearButton2.addEventListener('click', function(){
        if (vis.currentYear < 2016){
            vis.currentYear++;
            vis.yearSlider.noUiSlider.set(vis.currentYear);
            document.getElementById('internet-clock').innerHTML = vis.currentYear;
            vis.updateVis();
        }
    });

    // Listen to play
    vis.playButton = document.getElementById('play-internet-map');

    vis.playButton.addEventListener('click', function(){
        vis.animateVis();
    })
}


/*
 * Data wrangling
 */

InternetUseMapVis.prototype.wrangleData = function(){
    var vis = this;

    var attributeArray = [];
    var countries = vis.mapData.objects.countries.geometries;
    for (var i in countries) {
        for (var j in vis.selectedData) {
            if (countries[i].properties.id === vis.selectedData[j].CountryCode) {
                for (var k in vis.selectedData[i]) {
                    if (k !== 'CountryName' && k !== 'CountryCode') {
                        if (attributeArray.indexOf(k) === -1) {
                            attributeArray.push(k);
                        }
                        countries[i].properties[k] = Number(vis.selectedData[j][k])
                    }
                }
                break;
            }
        }
    }



    // Convert TopoJSON to GeoJSON (target object = 'countries')
    vis.displayData = topojson.feature(vis.mapData, vis.mapData.objects.countries).features;

    // Update the visualization
    vis.updateVis();
}


/*
 * The drawing function
 */

InternetUseMapVis.prototype.updateVis = function(){
    var vis = this;

    // update color scale
    if (vis.selection === "percent-internet-user"){
        vis.color.domain([0, 100]).nice();
    }
    else {
        vis.color.domain([0, 200]).nice();
    }

    // if (vis.selection === "percent-internet-user"){
    //     vis.tool_tip.html(function(d) { return "Year: " + vis.currentYear + '<br>' +
    //         "Country: " + d.properties["admin"] + '<br>' +
    //         "% Internet user: " + d3.format(",.2f")(d.properties[vis.currentYear]);});
    // }
    // else{
    //     vis.tool_tip.html(function(d) { return "Year: " + vis.currentYear + '<br>' +
    //         "Country: " + d.properties["admin"] + '<br>' +
    //         "Subscriptions/100 people: " + d3.format(",.2f")(d.properties[vis.currentYear]);});
    // }
    //
    // vis.svg.call(vis.tool_tip);

    // Render the world  by using the path generator
    vis.map.selectAll(".world-map-path")
        .data(vis.displayData, function(d){return d;})
        .enter().append("path")
        .attr("class", "world-map-path")
        .attr("d", vis.path)
        .attr("id",function(d){return "" + d.properties.id;})
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .attr("fill", function (d) {
            if(d){
                if (isNaN(d.properties[vis.currentYear])) {
                    return "#f1e3dd";
                }
                else {
                    return vis.color(d.properties[vis.currentYear]);
                }
            }
            else{
                return "#f1e3dd";
            }
        })
        // .style("opacity", 0.8)
        // // show tooltip on mouseover
        // .on("mouseover", function(d){
        //     d3.select(this).style("opacity", 1)
        //         .style("stroke","white")
        //         .style("stroke-width",3);
        //     vis.tool_tip.show(d);
        // })
        // .on("mouseout", function(d){
        //     d3.select(this).style("opacity", 0.8)
        //         .style("stroke","white")
        //         .style("stroke-width",1);
        //     vis.tool_tip.hide(d);
        // })
        .merge(vis.map)
        .transition()
        .duration(1000)
        .ease(d3.easeSinInOut)
        .attr("d", vis.path)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .attr("fill", function (d) {
            if(d){
                if (isNaN(d.properties[vis.currentYear])) {
                    return "#f1e3dd";
                }
                else {
                    return vis.color(d.properties[vis.currentYear]);
                }
            }
            else{
                return "#f1e3dd";
            }

        })
        // .style("opacity", 0.8);

    vis.map.exit().remove();

    // Remove Antarctica
    vis.svg.select("#ATA").remove();

    // vis.svg.call(vis.tool_tip);

    vis.captionObj = vis.legendTitle.filter(function (d) {
        return d.key === vis.selection;
    });

    vis.legendData = vis.color.range().map(function (d) {
        d = vis.color.invertExtent(d);
        d = d.map(function(l){
            return Number(Math.round(l+'e2')+'e-2');
        });
        return d;
    });

    vis.legendData.unshift(NaN); // for places where there was no data

    vis.legendLabel = vis.svg.selectAll(".legend-label")
        .data(vis.legendData);

    vis.legendLabel.enter().append("text")
        .attr("class", "legend-label")
        .attr('x', vis.legendRectSize + vis.legendSpacing)
        .attr('y', vis.legendRectSize - vis.legendSpacing)
        .attr("transform", function (d, i) {
            var iconHeight = vis.legendRectSize + vis.legendSpacing;
            var offset = iconHeight;
            var horz = -2.9 * vis.legendRectSize;
            var vert = vis.height / 1.4 + i * iconHeight - offset;
            return "translate(" + horz + "," + vert + ")";
        })
        .text(function (d) {
            if (isNaN(d[0])) {
                return "No data";
            }
            else {
                if (vis.selection === "percent-internet-user" ) {
                    return d3.format(",.2f")(d[0]) + "% " + " - " + d3.format(",.2f")(d[1]) + "%"
                }
                else {
                    return d3.format(",.2f")(d[0]) + " - " + d3.format(",.2f")(d[1]);
                }
            }
        })
        .merge(vis.legendLabel)
        .attr('x', vis.legendRectSize + vis.legendSpacing)
        .attr('y', vis.legendRectSize - vis.legendSpacing)
        .attr("transform", function (d, i) {
            var iconHeight = vis.legendRectSize + vis.legendSpacing;
            var offset = iconHeight;
            var horz = -2.9 * vis.legendRectSize;
            var vert = vis.height / 1.4 + i * iconHeight - offset;
            return "translate(" + horz + "," + vert + ")";
        })
        .text(function (d) {
            if (isNaN(d[0])) {
                return "No data";
            }
            else {
                if (vis.selection === "percent-internet-user" ) {
                    return d3.format(",.2f")(d[0]) + "% " + " - " + d3.format(",.2f")(d[1]) + "%"
                }
                else {
                    return d3.format(",.2f")(d[0]) + " - " + d3.format(",.2f")(d[1]);
                }
            }
        });

    vis.legendLabel.exit().remove();

    vis.legendCaption = vis.svg.selectAll(".legend-title")
        .data(vis.captionObj);

    vis.legendCaption.enter()
        .append("text")
        .attr("class", "legend-title")
        .merge(vis.legendCaption)
        .attr('transform', function (d, i) {
            var iconHeight = vis.legendRectSize + vis.legendSpacing;
            var offset = iconHeight;
            var horz = -2.9 * vis.legendRectSize;
            var vert = vis.height / 1.4 + (-0.5) * iconHeight - offset;
            return 'translate(' + horz + ',' + vert + ')';
        })
        .text(vis.captionObj[0].title);

    vis.legendCaption.exit().remove();

    vis.chartTitle = vis.svg.selectAll(".chart-title")
        .text(function(d){
            if (vis.selection === "percent-internet-user" ){
                return "World Distribution of Active Internet Users in Year " + vis.currentYear;
            }
            else{
                return "World Distribution of # Mobile Broadband Subscription in Year " + vis.currentYear;
            }
        })



}

/*
 Add selection buttons to the DOM
 */
InternetUseMapVis.prototype.addDataButtons = function() {
    var p = document.getElementById("internet-use-buttons");
    var menu = document.createElement("div");
    menu.setAttribute("class", "btn-group");
    menu.setAttribute("role", "group");
    var buttons = '<div class="btn-group" role="group">' +
        '<a class="btn btn-secondary wide active" id="percent-internet-user">Internet User</a>' +
        '<a class="btn btn-secondary wide" id="cellular-user-per-100">Mobile User</a>' +
        '</div>';

    menu.innerHTML = buttons;
    p.appendChild(menu);

}
/*
 Add selection buttons to the DOM
 */
InternetUseMapVis.prototype.addYearButton = function() {
    var vis = this;
    var p = document.getElementById("internet-slider-buttons");
    var buttons = '<a class="btn" id="year_decrease_1"> < </a>' +
    ' Year :  ' + '<span id="internet-clock">' + vis.currentYear  + '</span>' +
        '  ' + '<a class="btn" id="year_increase_1"> > </a>' +
    '         ' + '<a class="btn" id="play-internet-map">Play</a>';


    p.innerHTML = buttons;

}

/*
 Add slider to the DOM
 */
InternetUseMapVis.prototype.addSlider = function() {
    var vis = this;

    vis.yearSlider = document.getElementById('internet-use-slider');

    noUiSlider.create(vis.yearSlider, {
        start: [vis.minYear],
        step: 1,
        range: {
            'min': [vis.minYear],
            'max': [vis.maxYear]
        }
    });
}

/*
 Animation
 */
InternetUseMapVis.prototype.animateVis = function() {
    var vis = this;
    vis.play = !vis.play;
    if(vis.play === true){
        vis.playSequence = setInterval(function(){
            if (vis.currentYear < 2016){
                vis.currentYear++;
                vis.yearSlider.noUiSlider.set(vis.currentYear);
                document.getElementById('internet-clock').innerHTML = vis.currentYear;
                vis.updateVis();
            }
            else{
                vis.play = false;
                clearInterval(vis.playSequence);
            }
        }, 500)}
}

/*
 Redraw the graph
 */
InternetUseMapVis.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}