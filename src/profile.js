d3.locale.fr_FR = d3.locale({
  "decimal": ".",
  "thousands": "'",
  "grouping": [3],
  "currency": ["$", ""],
  "dateTime": "%a %b %e %X %Y",
  "date": "%m/%d/%Y",
  "time": "%H:%M:%S",
  "periods": ["AM", "PM"],
  "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
d3.profile = function() {

    var margin = {top: 40, right: 50, bottom: 30, left: 50},
        light = false,
        bisectDistance = d3.bisector(function(d) { return d[3]; }).left,
        units,
        xFactor,
        hoverCallback = function() {},
        FILL_COLOR = '#DEDEDE',
        STROKE_COLOR = '#F00',
        svg,
        profile,
        x,
        y;

    function profile(selection) {
        selection.each(function(data) {

            profile = data.profile;

            var width = this.getBoundingClientRect().width -
                margin.right - margin.left;
            x = d3.scale.linear()
                .range([0, width]);

            var height = this.getBoundingClientRect().height -
                margin.top - margin.bottom;
            y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .tickFormat(d3.locale.fr_FR.numberFormat(",.2F"));


            var area = d3.svg.area()
                .x(function(d) { return x(d[3]); })
                .y0(height)
                .y1(function(d) { return y(d[2]); });
            var line = d3.svg.line()
                .x(function(d) { return x(d[3]); })
                .y(function(d) { return y(d[2]); });

            // Select the svg element, if it exists.
            svg = d3.select(this).selectAll("svg").data([profile]);

            // Otherwise, create the skeletal chart.
            var gEnter = svg.enter().append("svg").append("g");
            gEnter.style('font', '11px Arial');
            gEnter.append("path").attr("class", "area")
                .style('fill', FILL_COLOR);
            gEnter.append("path").attr("class", "line")
                .style('stroke', STROKE_COLOR)
                .style('fill', 'none');

            gEnter.insert('g', ":first-child")
                .attr('class', 'grid-y');

            if (!light) {
                gEnter.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")");

                gEnter.append("text")
                    .attr("class", "x label")
                    .attr("text-anchor", "end")
                    .attr("x", width - 4)
                    .attr("y", height - 4);

                gEnter.append("g")
                    .attr("class", "y axis");

                gEnter.append("text")
                    .attr("class", "y label")
                    .attr("text-anchor", "end")
                    .attr("y", 6)
                    .attr("dy", ".75em")
                    .attr("transform", "rotate(-90)")
                    .text("elevation (m)");

                gEnter.append('g').attr("class", "pois");
            }

            var yHover = gEnter.append('g').attr('class', 'y grid-hover');
            yHover.append("svg:line").attr('stroke-dasharray', '5,5');
            yHover.append("text");

            var xHover = gEnter.append('g').attr('class', 'x grid-hover');
            xHover.append("svg:line").attr('stroke-dasharray', '5,5');
            xHover.append("text");

            var fHover = gEnter.append('circle')
                .attr('class', 'focus grid-hover')
                .attr('r', 4.5)
                .style('display', 'none')
                .style('stroke', STROKE_COLOR)
                .style('fill', 'none');

            gEnter.append("rect")
                .attr("class", "overlay")
                .attr("width", width)
                .attr("height", height)
                .style("fill", "none")
                .style("pointer-events", "all");

            // Update the outer dimensions.
            svg
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

            // Update the inner dimensions.
            var g = svg.select("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var xDomain = d3.extent(profile, function(d) { return d[3]; });
            x.domain(xDomain);

            var yDomain = [d3.min(profile, function(d) { return d[2]; }),
                           d3.max(profile, function(d) { return d[2]; })];

            // set the ratio according to the horizontal distance
            var ratioXY = 0.05;
            if (xDomain[1] < 2000) {
                ratioXY = 0.5;
            } else if (xDomain[1] < 5000) {
                ratioXY = 0.33;
            } else if (xDomain[1] < 20000) {
                ratioXY = 0.2;
            } else if (xDomain[1] < 100000) {
                ratioXY = 0.1;
            }
            var mean = (yDomain[1] - yDomain[0])  / 2 + yDomain[0];
            var xResolution = (xDomain[1] - xDomain[0]) / width;
            y.domain([mean - (xResolution * ratioXY) * height / 2,
                      mean + (xResolution * ratioXY) * height / 2]);

            // Avoid negative values for y-axis
            if (y.domain()[0] < 0)  {
                y.domain([0, - y.domain()[0] + y.domain()[1]]);
            }

            // Update the area path.
            g.select(".area")
                .transition()
                .attr("d", area);
            g.select(".line")
                .transition()
                .attr("d", line);

            if (xDomain[1] > 2000) {
                xFactor = 1000;
                units = "km";
            } else {
                xFactor = 1;
                units = "m";
            }
            if (!light) {

                xAxis.tickFormat(function(d) {
                    return d3.locale.fr_FR.numberFormat(',.2F')(d / xFactor);
                });

                g.select(".x.axis")
                    .transition()
                    .call(xAxis);

                g.select(".x.label")
                    .text("distance (" + units + ")")
                    .style('fill', 'grey')
                    .style('shape-rendering', 'crispEdges');

                g.select(".y.axis")
                    .transition()
                    .call(yAxis);
            }

            g.select(".grid-y")
                .transition()
                .call(yAxis
                    .tickSize(-width, 0, 0)
                    .tickFormat('')
                )
                .selectAll('.tick line')
                    .style('stroke', '#ccc')
                    .style('opacity', 0.7);

            g.selectAll('.axis').selectAll('path, line')
                .style('fill', 'none')
                .style('stroke', '#000')
                .style('shape-rendering', 'crispEdges');

            g.selectAll('.grid-hover line')
                .style('stroke', '#222')
                .style('opacity', 0.8);

            g.select(".overlay")
                .on("mouseout", mouseout)
                .on("mousemove", mousemove);

            function mousemove() {
                var mouseX = d3.mouse(this)[0],
                    x0 = x.invert(mouseX),
                    i = bisectDistance(profile, x0, 1),
                    point = profile[i];

                g.select(".x.grid-hover")
                    .style('display', 'inline')
                    .select("line")
                    .attr("x1", mouseX)
                    .attr("y1", height)
                    .attr("x2", mouseX)
                    .attr("y2", y(point[2]));

                g.select(".y.grid-hover")
                    .style('display', 'inline')
                    .select("line")
                    .attr("x1", x(0))
                    .attr("y1", y(point[2]))
                    .attr("x2", width)
                    .attr("y2", y(point[2]));

                g.select(".focus.grid-hover")
                    .style('display', null)
                    .attr('transform', 'translate(' + mouseX + ' ' +
                      y(point[2]) + ')');

                var max = xDomain[1];

                var res = xResolution.toPrecision(1);
                var dist = Math.round(x0 / res) * res / xFactor;

                var right = x0 > xDomain[1] / 2;
                var xtranslate = x(x0);
                xtranslate += right ? -10 : 10;

                g.select(".x.grid-hover text")
                    .text(d3.locale.fr_FR.numberFormat(",.2F")
                        (parseFloat(dist.toPrecision(3))) + " " + units)
                    .style('text-anchor', right ? 'end' : 'start')
                    .attr("transform", "translate(" + xtranslate + "," +
                           (height - 10) + ")");

                g.select(".y.grid-hover text")
                    .text(d3.locale.fr_FR.numberFormat(",.2F")
                        (Math.round(point[2])) + ' m')
                    .style('text-anchor', right ? 'end' : 'start')
                    .attr("transform", "translate(" + xtranslate + "," +
                           (y(point[2]) - 10) + ")");
                hoverCallback.call(null, point[0], point[1]);
            }

            function mouseout() {
                g.selectAll(".grid-hover")
                    .style('display', 'none');
                outCallback.call(null);
            }
        });
    }

    profile.light = function(x) {
        if (!arguments.length) return light;
        light = x;
        margin = {top: 0, right: 0, bottom: 0, left: 0};
        return profile;
    };

    profile.hoverCallback = function(cb) {
        if (!arguments.length) return hoverCallback;
        hoverCallback = cb;
        return profile;
    };

    profile.outCallback = function(cb) {
        if (!arguments.length) return outCallback;
        outCallback = cb;
        return profile;
    };

    profile.asText = function() {
        return  d3.select("svg")
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;
    };

    profile.showPois = function(pois) {
        var g = svg.select('g');
        var ps = g.select('.pois');
        console.log(ps);

        // remove any previously existing pois
        // Note: not using exit() here cause poi id may already exist
        ps.selectAll(".poi").remove();
        var p = ps.selectAll(".poi")
            .data(pois, function(d) {
                console.log(d);
                var distance = d.distance,
                    i = bisectDistance(profile, distance, 1),
                    point = profile[i];
                if (point) {
                    d.distance = distance;
                    d.alt = point[2];
                }
                return d.id;
            });

        poiEnter = p.enter()
            .append("g")
            .attr("class", "poi");

        ps.selectAll(".poi")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .delay(100)
            .style("opacity", 1);

        poiEnter
            .append("text")
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", function(d) {
                return ["translate(", x(d.distance), ",",
                        (y(d.alt) - 20), "), rotate(-60)"].join("");
            })
            .text(function(d) { return d.title; });

        poiEnter.append("line")
             .style("stroke", "grey")
             .attr("x1", function(d) { return x(d.distance);})
             .attr("y1", function(d) { return y(y.domain()[0]);})
             .attr("x2", function(d) { return x(d.distance);})
             .attr("y2", function(d) { return y(d.alt);});

        poiEnter.selectAll('line')
             .style("shape-rendering", "crispEdges");
    };

    return profile;
};
