/*
 * InternetUseVis - Object constructor function
 * @param _parentElement 	            -- the HTML element in which to draw the visualization
 * @param _householdData        		-- data of number of households with internet
 * @param _minDesktopData               -- data of monthly minutes spent online via a computer
 * @param _mobileData                   -- data of number of mobile broadband subscription
 * @param _minMobileData                -- data of daily minutes spent online via a smartphone
 */

InternetUseVis = function(_parentElement, _householdData, _minDesktopData, _mobileData, _minMobileData){
    this.parentElement = _parentElement;
    this.householddata = _householdData;
    this.mindesktopdata = _minDesktopData;
    this.mobiledata = _mobileData;
    this.minmobiledata = _minMobileData;
    this.$graphicContainer = $("#" + _parentElement);
    this.duration = 1000;
    this.ease = d3.easeElasticInOut;

    this.preInitVis();
}

/*
 * Pre-initialize visualization (i.e. add drop down menu)
 */
InternetUseVis.prototype.preInitVis = function() {
    var vis = this;
    // Add drop down menu to the DOM
    vis.addDropDownMenu();

    vis.initVis();
}

/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

InternetUseVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 50, right: 100, bottom: 40, left: 150 };

    if ($("#" + vis.parentElement).width() - vis.margin.right - vis.margin.left > 100){
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    }
    else{
        vis.width = 100;
    }
        vis.height = 350 - vis.margin.top - vis.margin.bottom;

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

    //======= Define path ======//
    vis.valueLine = d3.line()
        .x(function (d) {
            return vis.x(d.date);
        })
        .y(function (d) {
            return vis.y(d.value);
        });

    vis.valueLine.curve(d3.curveCatmullRom);

    vis.internetPath = vis.svg.append("path")
        .attr("class", "internetpath");

    vis.xAxislabel = vis.svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", (vis.width/2))
        .attr("y", (vis.height + 40));

    vis.yAxislabel = vis.svg.append("text")
        .attr("class", "y-axis-label")
        .attr("x", 50)
        .attr("y", -20)
        .style("text-anchor", "end");

    vis.selection = d3.select("#change-internet-use-data").property("value");
    if (vis.selection === "householddata"){
        vis.selectedData = vis.householddata;
    }
    else if(vis.selection === "mindesktop"){
        vis.selectedData = vis.mindesktopdata;
    }
    else if(vis.selection === "mobiledata"){
        vis.selectedData = vis.mobiledata;
    }
    else{
        vis.selectedData = vis.minmobiledata;
    }

    // (Filter, aggregate, modify data)
    vis.wrangleData();

    //when drop-down menu selection changes, re-wrangle data with selected data
    d3.select("#change-internet-use-data").on("change", function() {
        vis.selection = d3.select("#change-internet-use-data").property("value");
        if (vis.selection === "householddata"){
            vis.selectedData = vis.householddata;
            d3.select(".annotation").remove();
            vis.wrangleData();
        }
        else if(vis.selection === "mindesktop"){
            vis.selectedData = vis.mindesktopdata;
            d3.select(".annotation").remove();
            vis.wrangleData();
        }
        else if(vis.selection === "mobiledata"){
            vis.selectedData = vis.mobiledata;
            d3.select(".annotation").remove();
            vis.wrangleData();
        }
        else{
            vis.selectedData = vis.minmobiledata;
            d3.select(".annotation").remove();
            vis.wrangleData();
        }

    });
}


/*
 * Data wrangling
 */

InternetUseVis.prototype.wrangleData = function(){
    var vis = this;
    vis.displayData = vis.selectedData;
    // Update the visualization
    vis.updateVis();
}


/*
 * The drawing function
 */

InternetUseVis.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    vis.x.domain(d3.extent(vis.displayData, function(d) { return d.date; }));

    vis.y.domain([0, d3.max(vis.displayData, function(d){ return d.value;})]);

    //======= Draw path to SVG ======//
    vis.internetPath
        .datum(vis.displayData)
        .transition(vis.t)
        .attr("d", vis.valueLine);

    //======= Draw circles at data points to SVG ======//
    vis.dots = vis.svg.selectAll(".dot").data(vis.displayData, function(d){return d;});

    vis.dots.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function (d) {
            return vis.x(d.date);
        })
        .attr("cy", function (d) {
            return vis.y(d.value);
        })
        .attr("r", 6)

        .merge(vis.dots)
        .transition()
        .duration(vis.duration)
        .ease(vis.ease)
        .attr("cx", function (d) {
            return vis.x(d.date);
        })
        .attr("cy", function (d) {
            return vis.y(d.value);
        })
        .attr("r", 6);
        // .on("mouseover", tool_tip.show)
        // .on("mouseout", tool_tip.hide)
        // .on("click", function(d){
        //     showEdition(d);
        // });

    vis.dots.exit().remove();


    // Call axis functions with the new domain
    vis.svg.select(".x-axis")
        .transition()
        .duration(vis.duration)
        .ease(vis.ease)
        .call(vis.xAxis);

    vis.svg.select(".y-axis")
        .transition()
        .duration(vis.duration)
        .ease(vis.ease)
        .call(vis.yAxis);


    vis.svg.select(".x-axis-label")
        .text("Year");

    vis.svg.select(".y-axis-label")
        .text(function(){
            if (vis.selection === "householddata"){
                return "Households (Millions)";
            }
            else if (vis.selection === "mindesktop"){
                return "Monthly Minutes (Billions)";
            }
            else if (vis.selection === "mobiledata"){
                return "Subscriptions per 100 People";
            }
            else {
                return "Daily Minutes"
            }
        });

    vis.addAnnotation();
}

/*
 Add drop down menu to the DOM
 */
InternetUseVis.prototype.addDropDownMenu = function() {
    var p = document.getElementById("internet-use-form");
    var menu = document.createElement("form");
    menu.setAttribute("class", "form-inline");
    var selections = '<div class="form-group">' +
        '<label for="changeInternetUseData">Chart Data:  </label>' +
        '<select class="form-control" id="change-internet-use-data">' +
        '<option value="householddata">Number of Households with Internet Access</option>' +
        '<option value="mindesktop">Time Spent Online via a Computer</option>' +
        '<option value="mobiledata">Number of Mobile Broadband Subscription</option>' +
        '<option value="minmobile">Time Spent Online via a Smart Phone</option>' +
        '</select>' +
        '</div>';

    menu.innerHTML = selections;
    p.appendChild(menu);
}


/*
 Add annotation
 */
InternetUseVis.prototype.addAnnotation = function() {
    var vis = this;

    if (vis.selection === "householddata"){

    }
    else if (vis.selection === "mobiledata"){

        //Add annotations
        vis.callout = [{
            data: { date: "2007", value: 16.53, content: "iPhone initial release" },
            dy: -137,
            dx: 0,
            note: { align: "middle" },
            subject: { text: 'B', y: "bottom" },
            id: "minimize-badge"
        }].map(function (l) {
            l.note = Object.assign({}, l.note, { title: "Year: " + l.data.date,
                label: "" + l.data.content });
            return l;
        });
        var parseTime = d3.timeParse("%Y");
        var timeFormat = d3.timeFormat("%Y");
        window.makeAnnotations = d3.annotation().annotations(vis.callout).type(d3.annotationCalloutElbow).accessors({ x: function x(d) {
            return vis.x(parseTime(d.date));
        },
            y: function y(d) {
                return vis.y(d.value);
            }
        }).accessorsInverse({
            date: function date(d) {
                return timeFormat(vis.x.invert(d.x));
            },
            value: function value(d) {
                return vis.y.invert(d.y);
            }
        }).on('subjectover', function (annotation) {

            //cannot reference this if you are using es6 function syntax
            this.append('text').attr('class', 'hover').text(annotation.note.title).attr('text-anchor', 'middle').attr('y', annotation.subject.y && annotation.subject.y == "bottom" ? 50 : -40).attr('x', -15);

            this.append('text').attr('class', 'hover').text(annotation.note.label).attr('text-anchor', 'middle').attr('y', annotation.subject.y && annotation.subject.y == "bottom" ? 70 : -60).attr('x', -15);
        }).on('subjectout', function (annotation) {
            this.selectAll('text.hover').remove();
        });
        vis.svg.append("g").attr("class", "annotation").call(makeAnnotations);
    }
}

/*
 Redraw the graph
 */
InternetUseVis.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}