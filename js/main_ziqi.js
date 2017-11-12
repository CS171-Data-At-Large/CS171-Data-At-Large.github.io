
// Will be used to the save the loaded JSON data
var allData = {};
var allDataArray = [];

// Set ordinal color scale
var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

// Variables for the visualization instances
var areachart;
var squaremap;


d3.queue()
    .defer(d3.csv, "data/company_data_breachs_updated_2017.csv")
    .defer(d3.json, "data/us_map.json")
    .defer(d3.csv, "data/identity_theft_by_state.csv")
    .await(createVis);


function createVis(error, data1, data2, data3) {

    console.log(data2);

    // ############# data breaches visualization ###############
    for (var i = 2004; i <= 2017; i++){
        allData[i] = {'inside job': 0, 'hacked': 0, 'accidentally published': 0,
            'lost / stolen device or media': 0, 'poor security': 0, 'Year': i};
    }

    data1.forEach(function(d) {
        d['No of Records Stolen'] = +d['No of Records Stolen'];
        d['Records Lost'] = +d['Records Lost'];
        d['Year'] = +d['Year'];
        allData[d['Year']][d['Method of Leak'].trim()]++;

    });

    colorScale.domain(d3.keys(allData[2004]).filter(function(d){ return d != "Year"; }));

    allDataArray = $.map(allData, function(value, index) {
        return [value];
    });

    // Instantiate visualization objects here
    areachart = new BreachCasesStackedArea("vis-breach-cases", allDataArray);


    // ############# identity theft visualization ##############
    var identityTheftByState = {};

    data3.forEach(function(d) {
        d['Victims per 100000 population'] = +d['Victims per 100000 population'];
        d['Number of victims'] = +d['Number of victims'];
        d['Rank'] = +d['Rank'];
        d['Year'] = +d['Year'];
        if (d['State'] in identityTheftByState) {
            identityTheftByState[d['State']]['Victims per 100000 population'] += d['Victims per 100000 population']/9;
            identityTheftByState[d['State']]['Number of victims'] += d['Number of victims']/9;
        }
        else {
            identityTheftByState[d['State']] = {'State': d['State'],
                                                'Victims per 100000 population': d['Victims per 100000 population']/9,
                                                'Number of victims': d['Number of victims']/9};
        }
    });




    squaremap = new IdentityTheftSquareMap("vis-identity-theft", data2, identityTheftByState);

}