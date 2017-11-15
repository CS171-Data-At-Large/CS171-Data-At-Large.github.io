// Initialize variables to save the charts later
var internetUseMapVis;
var internetUseLineVis;
var internetConcernVis;
var internetActivityVis;
var lineData;

// Date parser to convert strings to date objects
var parseYear = d3.timeParse("%Y");
var parseQuarter = d3.timeParse("%b-%y");

// ********** Use the Queue.js library to read two files **********//
queue()
    .defer(d3.csv, "data/internet-use/internet_user.csv")
    .defer(d3.csv, "data/internet-use/cellular_user.csv")
    .defer(d3.json, "data/internet-use/internet_user.json")
    .defer(d3.json, "data/internet-use/cellular_user.json")
    .defer(d3.json, "data/internet-use/world-topo.json")
    .defer(d3.csv, "data/internet-use/daily_online_activities_2017.csv")
    .defer(d3.csv, "data/internet-use/top_internet_usage_concerns_2017.csv")

    .await(createVisPart1);

function createVisPart1(error, internetData, mobileData, internetJSON, mobileJSON, worldMapData, activityData, concernData) {
    if(error) { console.log(error); }
    if(!error) {
        // --> PROCESS DATA

        // Convert data types of internetJSON
        internetJSON.forEach(function(entry){
            entry.year = parseYear(entry.year);
            entry.value = +entry.value;
        });

        // Convert data types of mobileJSON
        mobileJSON.forEach(function(entry){
            entry.year = parseYear(entry.year);
            entry.value = +entry.value;
        });

        // Convert data types of activityData
        activityData.forEach(function(entry){
            entry.Avg = +entry.Avg;
            entry.Age_18_29 = +entry.Age_18_29;
            entry.Age_30_59 = +entry.Age_30_59;
            entry.Age_60 = +entry.Age_60;
        });


        // Convert data types of concernData
        concernData.forEach(function (entry) {
            entry.share_respondents = +entry.share_respondents;
        });

        // Sort concernData
        concernData = concernData.sort(function (a, b) {
            return b.share_respondents - a.share_respondents;
        });

        internetUseMapVis = new InternetUseMapVis("vis-internet-use-map", internetData, mobileData, worldMapData);
        internetUseLineVis = new InternetUseLineVis("vis-internet-use-line", internetJSON, mobileJSON);
        internetConcernVis = new InternetConcernsVis("vis-internet-concerns", concernData);
        internetActivityVis = new InternetActivityVis("vis-internet-activity", activityData);

        // Redraw the graphs on window resize to make the size dynamic
        window.addEventListener("resize", function (event) {
            internetConcernVis.redraw();
            internetUseMapVis.redraw();
            internetUseLineVis.redraw();
            internetActivityVis.redraw();
        })
    }
}