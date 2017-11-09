// Initialize variables to save the charts later
var internetUseVis;
var internetConcernVis;

// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%Y");

// ********** Use the Queue.js library to read two files **********//
queue()
    .defer(d3.csv, "data/number_of_internet_users_2000_to_2016.csv")
    .defer(d3.csv, "data/internet-usage-time-in-us-2010-2016.csv")
    .defer(d3.csv, "data/top_internet_usage_concerns_2017.csv")

    .await(createVisPart1);

function createVisPart1(error, userData, minData, concernData) {
    if(error) { console.log(error); }
    if(!error) {
        // --> PROCESS DATA
        // Convert data types of userData
        userData.forEach(function (entry) {
            entry.year = parseDate(entry.year);
            entry.num_users = +entry.num_users;
        });

        // Convert data types of minData
        minData.forEach(function(entry){
            entry.year = parseDate(entry.year);
            entry.Desktop = +entry.Desktop;
            entry.Smartphone = +entry.Smartphone;
            entry.Tablet = +entry.Tablet;
        });


        // Wrangle it for stacked area chart

        // Convert data types of concernData
        concernData.forEach(function (entry) {
            entry.share_respondents = +entry.share_respondents;
        });

        // Sort concernData
        concernData = concernData.sort(function (a, b) {
            return b.share_respondents - a.share_respondents;
        });

        internetUseVis = new InternetUseVis("vis-internet-use", userData, minData);
        internetConcernVis = new InternetConcernsVis("vis-internet-concerns", concernData);


        // Redraw the graphs on window resize to make the size dynamic
        window.addEventListener("resize", function (event) {
            internetConcernVis.redraw();
        })
    }
}

