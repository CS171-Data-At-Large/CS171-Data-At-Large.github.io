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
var color = d3.scaleOrdinal()
    .range(["#667292", "#667292", "#f1e3dd", "#f1e3dd", "#f1e3dd", "#f1e3dd", "#f1e3dd", '#bc795c','#cb9780','#dab5a4','#e9d2c9','#f0e1db','#f8f0ed'])
innerHeight = 254;

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
        key: "Year",
        description: "Year of Occurrence",
        type: types["Date"],
        axis: d3.axisLeft()
            .tickFormat(function(d,i) {
                return formatTime(d);
            })
    },
    {
        key: "Records Lost",
        description: "Number of Records Lost",
        type: types["Number"],
        scale: d3.scaleLog().range([0, innerHeight])},
    {
        key: "Organization",
        type: types["String"],
        description: "Organization Type"
    },

    {
        key: "Method of Leak",
        type: types["String"],
        description: "Method of Leak",
        axis: d3.axisRight()
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
    }
];

var colorDomains = {
    "Data Sensitivity": ["Credit card information", "Email password/Health record", "Full bank account details", "Just email address/Online Information", "SSN/Personal details"],
    "Method of Leak": ["hacked", "accidentally published", "inside job", "lost/stolen device or media", "poor security"],
    "Organization":  ["academic", "app", "energy", "financial", "gaming", "government", "healthcare", "legal", "media", "military", "retail", "tech","telecoms", "transport"],
    "Year": [2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017]
}

// Variables for the visualization instances
var coordchart;

// Start application by loading the data
loadData();

function loadData() {

    d3.csv("./data/company_data_breachs_updated_2017.csv", function(error, data) {
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
    coordchart = new DataBreachParallelCoord("chart-area", allData, dimensions, types, colorDomains);
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