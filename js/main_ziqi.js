
// Will be used to the save the loaded JSON data
var dataByMethods = {};
var dataBySensitivity = {};


// Variables for the visualization instances
var areachart;
var squaremap;


d3.queue()
    .defer(d3.csv, "data/company_data_breachs_updated_2017.csv")
    .defer(d3.json, "data/us_map.json")
    .defer(d3.csv, "data/identity_theft_by_state.csv")
    .defer(d3.csv, "data/time_to_resolve_identity_theft_2015.csv")
    .await(createVis);


function createVis(error, data1, data2, data3, data4) {

    // ############# data breaches visualization ###############
    for (var i = 2004; i <= 2017; i++){
        dataByMethods[i] = {'hacked': 0, 'lost / stolen device or media': 0, 'accidentally published': 0,
            'inside job': 0, 'poor security': 0, 'Year': i};

        dataBySensitivity[i] = {'Credit card information': 0, 'Email password/Health record': 0,
            'Full bank account details': 0, 'Just email address/Online Information': 0,
            'SSN/Personal details': 0, 'Year': i};
    }

    data1.forEach(function(d) {
        d['No of Records Stolen'] = +d['No of Records Stolen'];
        d['Records Lost'] = +d['Records Lost'];
        d['Year'] = +d['Year'];
        dataByMethods[d['Year']][d['Method of Leak'].trim()]++;
        dataBySensitivity[d['Year']][d['Data Sensitivity'].trim()]++;

    });

    dataByMethods = $.map(dataByMethods, function(value, index) {
        return [value];
    });

    dataBySensitivity = $.map(dataBySensitivity, function(value, index) {
        return [value];
    });

    // Set ordinal color scale
    colorScale = d3.scaleOrdinal().range(['#667292','#8d9db6','#bccad6','#f1e3dd','#e6e6e6']);


    // Instantiate visualization objects here
    areachart = new BreachCasesStackedArea("vis-breach-cases", dataByMethods, dataBySensitivity);
    $("#breach-cases-form").change(function() {
        areachart.wrangleData();
        bubblechart.wrangleData("");
    });

    // ############# bubble chart ##############
    bubblechart = new BreachCasesBubble("vis-breach-cases-bubble", data1);

    // ############# identity theft visualization #############

    squaremap = new IdentityTheftSquareMap("vis-identity-theft", data2, data3);
    linechart = new IdentityTheftLine("tooltip-holder", data3);

    // ############# time-to-resolve visualization #############

    flipsquares = new TimeToResolveSquares("vis-resolve-time", data4);

}