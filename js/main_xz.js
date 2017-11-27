/**
 * Created by xindizhao1993 on 11/9/17.
 */
/*
var width = 700,
    height = 600;

var margin = {top: 0, right: 100, bottom: 60, left: 10};

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "map_area")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
*/


// Will be used to the save the loaded JSON data
var allData = [];
var choices = ["Year of Occurrence", "Organization Type", "Number of Records Lost", "Method of Leak", "Data Sensitivity"];

// Date parser to convert strings to date objects
var parseTime = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%Y");

// Set ordinal color scale
var color = d3.scaleOrdinal();
var innerHeight = 254;

var types = {
    "Number": {
        key: "Number",
        coerce: function(d) { return +d; },
        extent: d3.extent,
        within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scaleLinear().range([0, innerHeight])
    },
    "String": {
        key: "String",
        coerce: String,
        extent: function (data) { return data.sort(); },
        within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scalePoint().range([0, innerHeight])
    },
    "Date": {
        key: "Date",
        coerce: function(d) { return new Date(d); },
        extent: d3.extent,
        within: function(d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scaleTime().range([0, innerHeight])
    }
};


var dimensions = [
    {
        key: "Method of Leak",
        type: types["String"],
        description: "Method of Leak",
        axis: d3.axisLeft()
            .tickFormat(function(d,i) {
                return d;
            })
    },
    {
        key: "Data Sensitivity",
        description: "Data Sensitivity",
        type: types["String"],
        axis: d3.axisRight()
            .tickFormat(function(d,i) {
                return d;
            })
    },
    {
        key: "Organization",
        type: types["String"],
        description: "Organization Type",
        axis: d3.axisRight()
            .tickFormat(function(d,i) {
                return d;
            })
    },
    {
        key: "Year",
        description: "Year of Occurrence",
        type: types["Date"],
        axis: d3.axisRight()
            .tickFormat(function(d,i) {
                return formatTime(d);
            })
    },
    {
        key: "Records Lost",
        description: "Number of Records Lost",
        type: types["Number"],
        scale: d3.scaleLog().range([0, innerHeight]),
        axis: d3.axisRight()
    },

];


var colorDomains = {
    "Data Sensitivity": {
        "domain": ["Credit card information", "Email password/Health record", "Full bank account details", "Just email address/Online Information", "SSN/Personal details"],
        "range":["#5C7C93", '#6F9283', "#8B062B", "#AEABB9", "#96551B"]
    },
    "Method of Leak": {
        "domain": ["hacked", "accidentally published", "inside job", "lost/stolen device or media", "poor security"],
        "range": ["#5C7C93", '#6F9283', "#8B062B", "#AEABB9", "#AA9982"]
    },
    "Organization": {
        "domain": ["academic", "app", "energy", "financial", "gaming", "government", "healthcare", "legal", "media", "military", "retail", "tech","telecoms", "transport"],
        "range": ["#5C7C93", '#9C4C9E', "#8B062B", "#96551B", "#77A9B8", "#928186", '#436F98','#92887A','#7A605D','#AAB6A6','#5C4C92','#77A9B8', '#896919','#AAB6A6']
    } ,
    "Year": {
        "domain": [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017],
        "range": ["#96551B", "#77A9B8", "#928186", '#436F98','#92887A','#7A605D','#AAB6A6','#5C4C92','#77A9B8', '#896919','#AAB6A6', "#5C7C93", '#9C4C9E', "#8B062B"]
    }
}

// Variables for the visualization instances
var coordchart;

// Start application by loading the data
loadData();

function loadData() {

    d3.csv("./data/company_data_breachs_updated_2017_xz.csv", function(error, data) {
        if(!error) {
            allData = data;
            allData.forEach(function (d) {
                d.Year = parseTime(d.Year.toString());

                dimensions.forEach(function (p) {
                    d[p.key] = !d[p.key] ? null : p.type.coerce(d[p.key]);
                });
                /*
                 // truncate long text strings to fit in data table
                 for (var key in d) {
                 if (d[key] && d[key].length > 35) d[key] = d[key].slice(0,36);
                 }
                 */
            });

            // type/dimension default setting happens here
            dimensions.forEach(function (dim) {
                if (!("domain" in dim)) {
                    // detect domain using dimension type's extent function
                    dim.domain = d3_functor(dim.type.extent)(allData.map(function (d) {
                        return d[dim.key];
                    }));
                    //console.log(dim, dim.domain);
                }
                if (!("scale" in dim)) {
                    // use type's default scale for dimension
                    dim.scale = dim.type.defaultScale.copy();
                }
                dim.scale.domain(dim.domain);
            });
            createVis();
        }
    });
}

function createVis() {

    // TO-DO: Instantiate visualization objects here
    // Create an object instance
    coordchart = new DataBreachParallelCoord("vis-breach-cases-parallel", allData, dimensions, types, colorDomains);
}


function d3_functor(v) {
    return typeof v === "function" ? v : function() { return v; };
};

d3.selectAll(".AxesCheckbox").on("change",updateAxes);

function updateAxes(){
    choices = [];
    d3.selectAll(".AxesCheckbox").each(function(d){
        cb = d3.select(this);
        if(cb.property("checked")){
            console.log(cb);
            choices.push(cb.property("value"));
        }
    });

    coordchart.wrangleData();
}