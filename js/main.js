/* Create a treemap of country level measures. Inspiration drawn from https://bl.ocks.org/mbostock/4063582.
 */
$(function() {
    // Read in your data. On success, run the rest of your code
    d3.csv('data/prepped_data.csv', function(error, data) {

        // Setting defaults
        var margin = {
                top: 40,
                right: 10,
                bottom: 10,
                left: 10
            },
            width = 960,
            height = 500,
            drawWidth = width - margin.left - margin.right,
            drawHeight = height - margin.top - margin.bottom,
            diameter = 900,
            measure = 'fertility_rate'; // variable to visualize

        // Append a wrapper div for the chart
        var svg = d3.select('#vis')
            .append("svg")
            .attr('height', diameter)
            .attr('width', diameter)
            .style("left", margin.left + "px")
            .style("top", margin.top + "px");
        var g = svg.append('g')
            .attr('height', diameter)
            .attr('width', diameter);
                /* ********************************** Create hierarchical data structure & treemap function  ********************************** */

        // Nest your data *by region* using d3.nest()
        var nestedData = d3.nest()
            .key(function(d) {
                return d.region;
            })
            .entries(data);

        // Define a hierarchy for your data
        var root = d3.hierarchy({
            values: nestedData
        }, function(d) {
            return d.values;
        });


        // Create a *treemap function* that will compute your layout given your data structure
        var pack = d3.pack() // function that returns a function!
            .size([diameter, diameter]) // set size: scaling will be done internally
            .padding(0);

        /* ********************************** Create an ordinal color scale  ********************************** */

        // Get list of regions for colors
        var regions = nestedData.map(function(d) {
            return d.key;
        });

        // Set an ordinal scale for colors
        var colorScale = d3.scaleOrdinal().domain(regions).range(d3.schemeCategory10);
        /* ********************************** Write a function to perform the data-join  ********************************** */

        // Write your `draw` function to bind data, and position elements
        var draw = function() {
            // Redefine which value you want to visualize in your data by using the `.sum()` method
            root.sum(function(d) {
                return +d[measure];
            }).sort(function(a, b) {
                return b.value - a.value;
            });

            // (Re)build your treemap data structure by passing your `root` to your `treemap` function
            pack(root);

            // Bind your data to a selection of elements with class node
            // The data that you want to join is array of elements returned by `root.leaves()`
            var nodes = g.selectAll(".node").data(root.leaves());
            // Enter and append elements, then position them using the appropriate *styles*
            nodes.enter()
                .append("circle")
                .text(function(d) {
                    return d.data.country_code;
                })
                .merge(nodes)
                .attr('class', 'node')
                .transition().duration(1500)
                .attr("transform", function(d){
                    return "translate("+d.x+","+d.y+")";
                })
                .attr("x", function(d) {
                    console.log(d.x);
                    return d.x;
                })
                .attr("y", function(d) {
                    return d.y;
                })
                .attr("r", function(d) {
                    return d.r;
                })
                .attr("fill", function(d) {
                    return colorScale(d.data.region);
                });
                nodes.exit().remove();

        };

        // Call your draw function
        draw();
        // Listen to change events on the input elements
        $("input").on('change', function() {
            // Set your measure variable to the value (which is used in the draw funciton)
            measure = $(this).val();
            // Draw your elements
            draw();
        });
    });
});