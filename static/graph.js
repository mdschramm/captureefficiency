var sampleNames = {};
var minX = 9007188254740992;
var maxX = 0;
var maxY = 0;
d3.tsv("/CaptureEfficiency/static/data/short_test.sample_interval_summary", function(error, data) {
        var fileData = {};
        data.forEach(function(row) {
            var lineObject = {"chr":parseInt(row["Target"].substring(3, row["Target"].indexOf(':'))), "start":parseInt(row["Target"].substring(row["Target"].indexOf(':') + 1, row["Target"].indexOf('-'))), "stop":parseInt(row["Target"].substring(row["Target"].indexOf('-')+1))};
            if(lineObject["start"] < minX) minX = lineObject["start"];
            if(lineObject["stop"] > maxX) maxX = lineObject["stop"];
            for(var name in row) {    
                if(name != "Target") {
                    lineObject["sample"] = name;
                    var coverage = parseInt(row[name]);
                    lineObject["coverage"] = coverage;
                    if(coverage > maxY) maxY = coverage;
                    if(sampleNames[name]) {
                        sampleNames[name].push(lineObject);
                    } else sampleNames[name] = [lineObject];
                }
            }
        });
        drawGraph();
       /* $(document).ready(function() {
            $("#submit").click(function() {
                var start = parseInt(("#start").val());
                var stop = parseInt(("#stop").val());
                if(start > minX && stop < maxX) {
                    drawGraph(start, stop);
                }
            });
        });*/
});
maxX = 4000;
maxY = 150000;
function drawGraph() {
   for(var name in sampleNames) {
      var sample = sampleNames[name];
      start = sample[sample.length - 1]["stop"];
      break;
   }
   var bottomMargin = 100;
   var leftMargin = 80;
   var yLabelOffset = 60;   
   var xLabelOffset = 50;
   var w = window.innerWidth*0.9;
   var h = window.innerHeight*0.9;
   var x = d3.scale.linear().domain([minX, maxX + (maxX - minX)/10]).range([0, w]);
   var y = d3.scale.linear().domain([0, maxY + maxY/4]).range([h, 0]);
   d3.select("#chart").attr("viewbox", "0 0 " + w + " " + h);
   d3.select("#chart").attr("preserveAspectRatio", "xMidYMid meet");
   var graph = d3.select("#graph").append("svg:svg")
       .attr("id", "chart")
       .attr("width", w)
       .attr("height", h)
       .append("svg:g");
   var xAxis = d3.svg.axis().scale(x);
   graph.append("svg:g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + leftMargin + ", " + (h - bottomMargin) + ")")
        .call(xAxis);
   var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left").tickSubdivide(true);
   graph.append("svg:g")
       .attr("class", "y axis")
       .attr("transform", "translate(" + leftMargin + ", " +  (-bottomMargin) + ")")
       .call(yAxisLeft);
   graph.append("text")
       .attr("class", "y label")
       .attr("text-anchor", "middle")
       .attr("y", leftMargin - yLabelOffset)
       .attr("x", -h/2 + bottomMargin)
       .attr("transform", "rotate(-90)")
       .style("font-size", 18)
       .text("Coverage")
    graph.append("text")
       .attr("class", "x label")
       .attr("text-anchor", "middle")
       .attr("y", h - bottomMargin + xLabelOffset)
       .attr("x", w/2)
       .style("font-size", 18)
       .text("Location")
    for(var name in sampleNames) {
        for(var i=0; i<sampleNames[name].length; i++) {
            graphLineObject(sampleNames[name][i]);
        }
    }
    function graphLineObject(lineObject) {
        var d = [lineObject["start"], lineObject["stop"]];
        var line = d3.svg.line()
            .x(function(k) {
                return x(k) + leftMargin;
                })
            .y(function() {
                return y(lineObject["coverage"]) - bottomMargin;
                })
            graph.append("path")
                .attr("d", line(d))
                .attr("id", lineObject["sample"] + " chr" + lineObject["chr"] + ":" + lineObject["start"] + "-" + lineObject["stop"])
                .on("mouseover", onmouseover)
                .on("mouseout", onmouseout);
    }
}
    function onmouseover() {
        var currClass = d3.select(this).attr("class");
        var name = this.id;
        d3.select(this)
            .attr("class", currClass + " current");
        var blurb = '<h2>' + this.id + '</h2>';
        $("#default").hide();
        $("#blurb").html(blurb);
    }

    function onmouseout() {
        var currClass = d3.select(this).attr("class");
        var prevClass = currClass.substring(0, currClass.length - 8);
        d3.select(this)
            .attr("class", prevClass);
        $("#default").show();
        $("#blurb").html('');
    }


