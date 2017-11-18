// Initialize variables to save the charts later
var hackerReasonsVis;
var hackerInfoVis;
var hackerInfoVis2;
var hackerInfoVis3;

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
        // hackerInfoVis2 = new HackerInfoVis("vis-hacker2", hackerInfo2, 2);
        // hackerInfoVis3 = new HackerInfoVis("vis-hacker3", hackerInfo3, 3);



        // // Redraw the graphs on window resize to make the size dynamic
        // window.addEventListener("resize", function (event) {
        //     hackerReasonsVis.redraw();
        //     hackerInfoVis1.redraw();
        //     hackerInfoVis2.redraw();
        //     hackerInfoVis3.redraw();
        // })
    }
}