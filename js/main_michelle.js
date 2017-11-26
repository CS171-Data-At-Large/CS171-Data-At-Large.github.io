// Initialize variables to save the charts later
var internetUseMapVis;
var internetUseLineVis;
var hackerReasonsVis;
var hackerInfoVis;

// Date parser to convert strings to date objects
var parseYear = d3.timeParse("%Y");

// ********** Use the Queue.js library to read two files **********//
queue()
    .defer(d3.csv, "data/internet-use/internet_user.csv")
    .defer(d3.csv, "data/internet-use/cellular_user.csv")
    .defer(d3.json, "data/internet-use/internet_user.json")
    .defer(d3.json, "data/internet-use/cellular_user.json")
    .defer(d3.json, "data/internet-use/world-topo.json")

    .await(createVisPart1);

function createVisPart1(error, internetData, mobileData, internetJSON, mobileJSON, worldMapData) {
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

        internetUseMapVis = new InternetUseMapVis("vis-internet-use-map", internetMapData, mobileMapData, worldMapData);
        internetUseLineVis = new InternetUseLineVis("vis-internet-use-line", internetJSON, mobileJSON);

        // Redraw the graphs on window resize to make the size dynamic
        window.addEventListener("resize", function (event) {
            internetUseMapVis.redraw();
            internetUseLineVis.redraw();
        })
    }
}


// ********** Use the Queue.js library to read two files **********//
queue()
    .defer(d3.csv, "data/internet-use/reasons_to_hack.csv")
    .defer(d3.csv, "data/internet-use/hacker_avg_time_to_break_in.csv")
    .defer(d3.csv, "data/internet-use/hacker_target_response.csv")
    .defer(d3.csv, "data/internet-use/hacker_response_to_conviction.csv")

    .await(createVisPart2);

function createVisPart2(error, reasonData, hackerInfo1, hackerInfo2, hackerInfo3) {
    if(error) { console.log(error); }
    if(!error) {
        // --> PROCESS DATA


        hackerInfo1.forEach(function(d){
            d.value = +d.value;
        });

        hackerInfo2.forEach(function(d){
            d.value = +d.value;
        });

        hackerInfo3.forEach(function(d){
            d.value = +d.value;
        });

        hackerReasonsVis = new HackerReasonVis("vis-hacker-reasons", reasonData);
        hackerInfoVis = new HackerInfoVis("vis-hacker-info", hackerInfo1, hackerInfo2, hackerInfo3);

        // Redraw the graphs on window resize to make the size dynamic
        window.addEventListener("resize", function (event) {
            hackerReasonsVis.redraw();
            hackerInfoVis.redraw();
        })
    }
}