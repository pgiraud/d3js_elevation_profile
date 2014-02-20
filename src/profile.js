d3.profile = function() {

    var margin = {top: 20, right: 20, bottom: 30, left: 50};

    // if true, no axis labels are displayed
    var light = false;

    var bisectDistance = d3.bisector(function(d) { return d.dist; }).left;

    var units,
        xFactor;

    var callback = function() {};

    function profile(g) {
        g.each(function(d, i) {
            var g = d3.select(this);

            var width = this.getBoundingClientRect().width -
                margin.right - margin.left;
            var x = d3.scale.linear()
                .range([0, width]);

            var height = this.getBoundingClientRect().height -
                margin.top - margin.bottom;
            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");


            var area = d3.svg.area()
                .x(function(d) { return x(d.dist); })
                .y0(height)
                .y1(function(d) { return y(d.alts.DTM25); });

            var container = g.selectAll("svg")
                .data([0]).enter()
              .append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var xDomain = d3.extent(d, function(d) { return d.dist; });
            x.domain(xDomain);

            var yDomain = [d3.min(d, function(d) { return d.alts.DTM25; }),
                           d3.max(d, function(d) { return d.alts.DTM25; })];

            // set the ratio according to the horizontal distance
            var ratioXY = 0.2;
            if (xDomain[1] < 1000) {
                ratioXY = 0.05;
            } else if (xDomain[1] < 30000) {
                ratioXY = 0.1;
            }
            var mean = (yDomain[1] - yDomain[0])  / 2 + yDomain[0];
            var xResolution = (xDomain[1] - xDomain[0]) / width;
            y.domain([mean - (xResolution * ratioXY) * height / 2,
                      mean + (xResolution * ratioXY) * height / 2]);

            container.append("path")
                .attr("class", "area");

            g.select(".area")
                .datum(d)
                .transition()
                .attr("d", area);

            if (xDomain[1] > 2000) {
                xFactor = 1000;
                units = " km";
            } else {
                xFactor = 1;
                units = ' m';
            }
            if (!light) {
                container.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")");

                    xAxis.tickFormat(function(d) {
                        return d / xFactor;
                    });

                g.select(".x.axis")
                    .transition()
                    .call(xAxis);

                container.append("text")
                    .attr("class", "x label")
                    .attr("text-anchor", "end")
                    .attr("x", width - 4)
                    .attr("y", height - 4);

                g.select(".x.label")
                    .text("distance (" + units + ")");

                container.append("g")
                    .attr("class", "y axis");

                g.select(".y.axis")
                    .transition()
                    .call(yAxis);

                container.append("text")
                    .attr("class", "y label")
                    .attr("text-anchor", "end")
                    .attr("y", 6)
                    .attr("dy", ".75em")
                    .attr("transform", "rotate(-90)")
                    .text("elevation (m)");
            }

            container.insert('g', ":first-child")
                .attr('class', 'grid-y')
                .attr('stroke-dasharray', '5,5');

            g.select(".grid-y")
                .transition()
                .call(yAxis
                    .tickSize(-width, 0, 0)
                    .tickFormat('')
                );

            g.selectAll('.axis').selectAll('path, line')
                .style('fill', 'none')
                .style('stroke', '#000')
                .style('shape-rendering', 'crispEdges');

            if (!light) {
                var yHover = container.append('g').attr('class', 'y grid-hover');
                yHover.append("svg:line").attr('stroke-dasharray', '5,5');
                yHover.append("text");

                var xHover = container.append('g').attr('class', 'x grid-hover');
                xHover.append("svg:line").attr('stroke-dasharray', '5,5');
                xHover.append("text");

                g.selectAll('.grid-hover line')
                    .style('stroke', '#222')
                    .style('opacity', 0.8);

                container.append("rect")
                    .attr("class", "overlay")
                    .attr("width", width)
                    .attr("height", height)
                    .style("fill", "none")
                    .style("pointer-events", "all");

                g.select(".overlay")
                    .on("mouseout", mouseout)
                    .on("mousemove", mousemove);
            }

            function mousemove() {
                var mouseX = d3.mouse(this)[0],
                    x0 = x.invert(mouseX),
                    i = bisectDistance(d, x0, 1),
                    point = d[i];

                g.select(".x.grid-hover")
                    .style('display', 'inline')
                    .select("line")
                    .attr("x1", mouseX)
                    .attr("y1", height)
                    .attr("x2", mouseX)
                    .attr("y2", y(point.alts.DTM25));

                g.select(".y.grid-hover")
                    .style('display', 'inline')
                    .select("line")
                    .attr("x1", x(0))
                    .attr("y1", y(point.alts.DTM25))
                    .attr("x2", width)
                    .attr("y2", y(point.alts.DTM25));

                var max = xDomain[1];

                var res = xResolution.toPrecision(1);
                var dist = Math.round(x0 / res) * res / xFactor;
                g.select(".x.grid-hover text")
                    .text(parseFloat(dist.toPrecision(3)) + units)
                    .attr("transform", "translate(" + (x(x0) + 10) + "," +
                           (height - 10) + ")");

                g.select(".y.grid-hover text")
                    .text(Math.round(point.alts.DTM25) + ' m')
                    .attr("transform", "translate(" + (x(x0) + 10) + "," +
                           (y(point.alts.DTM25) - 10) + ")");
                callback.call(null, point.easting, point.northing);
            }

            function mouseout() {
                g.select(".x.grid-hover")
                    .style('display', 'none');

                g.select(".y.grid-hover")
                    .style('display', 'none');
            }
        });
    }

    profile.light = function(x) {
        if (!arguments.length) return light;
        light = x;
        margin = {top: 0, right: 0, bottom: 0, left: 0};
        return profile;
    };

    profile.callback = function(cb) {
        if (!arguments.length) return callback;
        callback = cb;
        return profile;
    };

    return profile;
};
