// Initialize variables to save the charts later
var internetUseMapVis;
var internetUseLineVis;
var internetConcernVis;
var internetActivityVis;


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
        // Combine internetData and worldMapData into one data set
        var worldMapDataCopy = jQuery.extend(true, {}, worldMapData);
        var attributeArray = [];
        var countries = worldMapDataCopy.objects.countries.geometries;
        for (var i in countries) {
            for (var j in internetData) {
                if (countries[i].properties.id === internetData[j].CountryCode) {
                    for (var k in internetData[i]) {
                        if (k !== 'CountryName' && k !== 'CountryCode') {
                            if (attributeArray.indexOf(k) === -1) {
                                attributeArray.push(k);
                            }
                            countries[i].properties[k] = Number(internetData[j][k])
                        }
                    }
                    break;
                }
            }
        }
        // Convert TopoJSON to GeoJSON (target object = 'countries')
        var internetMapData = topojson.feature(worldMapDataCopy, worldMapDataCopy.objects.countries).features;


        // Combine mobileData and worldMapData into one data set
        var worldMapDataCopy2 = jQuery.extend(true, {}, worldMapData);
        var attributeArray2 = [];
        var countries2 = worldMapDataCopy2.objects.countries.geometries;
        for (var i in countries2) {
            for (var j in mobileData) {
                if (countries2[i].properties.id === mobileData[j].CountryCode) {
                    for (var k in mobileData[i]) {
                        if (k !== 'CountryName' && k !== 'CountryCode') {
                            if (attributeArray2.indexOf(k) === -1) {
                                attributeArray2.push(k);
                            }
                            countries2[i].properties[k] = Number(mobileData[j][k])
                        }
                    }
                    break;
                }
            }
        }
        // Convert TopoJSON to GeoJSON (target object = 'countries')
        var mobileMapData = topojson.feature(worldMapDataCopy2, worldMapDataCopy2.objects.countries).features;

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

        internetUseMapVis = new InternetUseMapVis("vis-internet-use-map", internetMapData, mobileMapData, worldMapData);
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