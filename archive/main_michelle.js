// Initialize variables to save the charts later
var internetUseVis;
var internetConcernVis;
var internetActivityVis;

// Date parser to convert strings to date objects
var parseYear = d3.timeParse("%Y");
var parseQuarter = d3.timeParse("%b-%y");

// ********** Use the Queue.js library to read two files **********//
queue()
    .defer(d3.csv, "data/us-households-with-internet-access-2000-2016.csv")
    .defer(d3.csv, "data/us-monthly-time-spent-online-via-computer-2014-2017-by-age.csv")
    .defer(d3.csv, "data/us-mobile-broadband-subscriptions-2004-2016.csv")
    .defer(d3.csv, "data/us-daily-time-spent-on-internet-access-via-smartphone-2013-2017.csv")
    .defer(d3.csv, "data/daily_online_activities_2017.csv")
    .defer(d3.csv, "data/top_internet_usage_concerns_2017.csv")

    .await(createVisPart1);

function createVisPart1(error, householdData, mindesktopData, mobileData, minmobileData, activityData, concernData) {
    if(error) { console.log(error); }
    if(!error) {
        // --> PROCESS DATA
        // Convert data types
        householdData.forEach(function (entry) {
            entry.date = parseYear(entry.date);
            entry.value = +entry.value;
        });

        mindesktopData.forEach(function(entry){
            entry.date = parseQuarter(entry.date);
            entry.value = +entry.value;
            entry.Age2_11 = +entry.Age2_11;
            entry.Age12_17 = +entry.Age12_17;
            entry.Age18_24 = +entry.Age18_24;
            entry.Age25_34 = +entry.Age25_34;
            entry.Age35_49 = +entry.Age35_49;
            entry.Age50_64 = +entry.Age50_64;
            entry.Age65 = +entry.Age65;

        });

        mobileData.forEach(function (entry) {
            entry.date = parseYear(entry.date);
            entry.value = +entry.value;
        });

        minmobileData.forEach(function(entry){
            entry.date = parseQuarter(entry.date);
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

        internetUseVis = new InternetUseVis("vis-internet-use", householdData, mindesktopData, mobileData, minmobileData);
        internetConcernVis = new InternetConcernsVis("vis-internet-concerns", concernData);
        internetActivityVis = new InternetActivityVis("vis-internet-activity", activityData);

        // Redraw the graphs on window resize to make the size dynamic
        window.addEventListener("resize", function (event) {
            internetConcernVis.redraw();
            internetUseVis.redraw();
        })
    }
}