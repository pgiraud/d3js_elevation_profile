d3.profile = function() {

    var margin = {top: 20, right: 20, bottom: 30, left: 50};

    // if true, no axis labels are displayed
    var light = false;

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

            if (light) {
                xAxis.ticks(0);
                yAxis.ticks(0);
            }

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

            x.domain(d3.extent(d, function(d) { return d.dist; }));
            y.domain([0, d3.max(d, function(d) { return d.alts.DTM25; })]);

            container.append("path")
                .attr("class", "area");

            g.select(".area")
                .datum(d)
                .attr("d", area);

            container.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")");

            g.select(".x.axis")
                .transition()
                .call(xAxis);

            container.append("g")
                .attr("class", "y axis");

            g.select(".y.axis")
                .transition()
                .call(yAxis);

            container.insert('g', ":first-child")
                .attr('class', 'grid-y')
                .attr('stroke-dasharray', '5,5');

            g.select(".grid-y")
                .call(yAxis
                    .tickSize(-width, 0, 0)
                    .tickFormat('')
                );
        });
    }

    profile.light = function(x) {
        if (!arguments.length) return light;
        light = x;
        margin = {top: 0, right: 0, bottom: 0, left: 0};
        return profile;
    };

    return profile;
};
