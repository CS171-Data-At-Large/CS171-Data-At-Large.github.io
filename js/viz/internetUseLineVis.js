/*
 * InternetUseLineVis - Object constructor function
 * @param _parentElement 	            -- the HTML element in which to draw the visualization
 * @param _internetData        		    -- data of percentage of internet users
 * @param _mobileData                   -- data of mobile broadband subscription / 100 people
 */

InternetUseLineVis = function(_parentElement, _internetData, _mobileData){
    this.parentElement = _parentElement;
    this.internetData = _internetData;
    this.mobileData = _mobileData;
    this.$graphicContainer = $("#" + _parentElement);
    this.duration = 1000;
    this.ease = d3.easeElasticInOut;
    this.currentYear = this.minYear;

    this.parseYear = d3.timeParse("%Y");

    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

InternetUseLineVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 100, right: 50, bottom: 40, left: 50 };

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
        .scale(vis.x)
        .ticks(5);

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
            return vis.x(d.year);
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
            .attr("transform", "translate(-40, 45) rotate(270)")
        .style("text-anchor", "end");

    vis.visTitle = vis.svg.append("text")
        .attr("class", "chart-title");

    vis.visTitlePrefix = vis.svg.append("text")
        .attr("class", "chart-title-prefix");

    // listen to changes
    vis.selection = d3.select(".btn-secondary.active").property("id");

    if (vis.selection === "percent-internet-user"){
        vis.displayData = vis.internetData;
    }
    else{
        vis.displayData = vis.mobileData;
    }

    vis.wrangleData();

    // Listen to data change
    $('.btn-secondary').click( function() {
        vis.selection = d3.select(this).property("id");

        if (vis.selection === "percent-internet-user"){
            vis.displayData = vis.internetData;
            d3.select(".annotation").remove();
            vis.wrangleData();
        }
        else{
            vis.displayData = vis.mobileData;
            d3.select(".annotation").remove();
            vis.wrangleData();
        }
    });
}


/*
 * Data wrangling
 */

InternetUseLineVis.prototype.wrangleData = function(){
    var vis = this;

    // vis.displayData = vis.selectedData;
    // Update the visualization
    vis.updateVis();
}


/*
 * The drawing function
 */

InternetUseLineVis.prototype.updateVis = function(){
    var vis = this;

    // Update domain
    vis.x.domain(d3.extent(vis.displayData, function(d) { return d.year; }));

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
            return vis.x(d.year);
        })
        .attr("cy", function (d) {
            return vis.y(d.value);
        })
        .attr("r", 5)

        .merge(vis.dots)
        .transition()
        .duration(vis.duration)
        .ease(vis.ease)
        .attr("cx", function (d) {
            return vis.x(d.year);
        })
        .attr("cy", function (d) {
            return vis.y(d.value);
        })
        .attr("r", 5);
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
            if (vis.selection === "percent-internet-user"){
                return "% Active Internet User";
            }
            else {
                return "Subscriptions per 100 People"
            }
        });

    vis.svg.select(".chart-title-prefix")
        .attr("x", 110)
        .attr("y", -70)
        .text("World Average");

    vis.svg.select(".chart-title")
        .attr("x", function(){
            if (vis.selection === "percent-internet-user"){
                return 80;
            }
            else {
                return 30;
            }
        })
        .attr("y", -50)
        .text(function(){
            if (vis.selection === "percent-internet-user"){
                return "% Active Internet User";
            }
            else {
                return "# Mobile Broadband Subscriptions"
            }
        });

    vis.addAnnotation();
}


/*
 Add annotation
 */
InternetUseLineVis.prototype.addAnnotation = function() {
    var vis = this;

    if (vis.selection === "percent-internet-user"){

        //Add annotations
        vis.callout = [{
            data: { date: "1995", value: 1.40, content: "Commercialization of the internet" },
            dy: -70,
            dx: 0,
            note: { align: "middle" },
            subject: { text: 'B', y: "bottom" },
            id: "minimize-badge",
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
    else{

        //Add annotations
        vis.callout = [{
            data: { date: "1996", value: 2.90, content: "1st Smartphone" },
            dy: -70,
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
InternetUseLineVis.prototype.redraw = function() {
    var vis = this;

    vis.$graphicContainer.empty();
    vis.initVis();
}