/**
 */
d3.locale.fr_FR = d3.locale({
  'decimal': '.',
  'thousands': '\'',
  'grouping': [3],
  'currency': ['$', ''],
  'dateTime': '%a %b %e %X %Y',
  'date': '%m/%d/%Y',
  'time': '%H:%M:%S',
  'periods': ['AM', 'PM'],
  'days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'Saturday'],
  'shortDays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'],
  'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
      'Sep', 'Oct', 'Nov', 'Dec']
});
/**
 * @return {object}
 */
d3.profile = function() {

  /**
   * The values for margins around the chart defined in pixels.
   */
  var margin = {top: 40, right: 30, bottom: 30, left: 50};

  /**
   * Method to get the coordinate in pixels from a distance.
   */
  var bisectDistance = d3.bisector(function(d) { return d.dist; }).left;

  /**
   * Distance units. Either 'm' or 'km'.
   */
  var units;

  var xFactor;

  var hoverCallback = function() {};
  var FILL_COLOR = '#DEDEDE';
  var STROKE_COLOR = '#F00';
  var svg;
  var x;
  var y;

  var profile = function(selection) {
    selection.each(function(data) {

      var width = this.getBoundingClientRect().width -
          margin.right - margin.left;
      x = d3.scale.linear().range([0, width]);

      var height = this.getBoundingClientRect().height -
          margin.top - margin.bottom;

      y = d3.scale.linear().range([height, 0]);

      var xAxis = d3.svg.axis().scale(x).orient('bottom');

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .tickFormat(d3.locale.fr_FR.numberFormat(',.2F'));


      var area = d3.svg.area()
          .x(function(d) { return x(d.dist); })
          .y0(height)
          .y1(function(d) { return y(d.alts.MNT); });
      var line = d3.svg.line()
          .x(function(d) { return x(d.dist); })
          .y(function(d) { return y(d.alts.MNT); });

      // Select the svg element, if it exists.
      svg = d3.select(this).selectAll('svg').data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append('svg').append('g');
      gEnter.style('font', '11px Arial');
      gEnter.append('path').attr('class', 'area')
          .style('fill', FILL_COLOR);
      gEnter.append('path').attr('class', 'line')
          .style('stroke', STROKE_COLOR)
          .style('fill', 'none');

      gEnter.insert('g', ':first-child')
          .attr('class', 'grid-y');

      gEnter.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ')');

      gEnter.append('text')
          .attr('class', 'x label')
          .attr('text-anchor', 'end')
          .attr('x', width - 4)
          .attr('y', height - 4);

      gEnter.append('g')
          .attr('class', 'y axis');

      gEnter.append('text')
          .attr('class', 'y label')
          .attr('text-anchor', 'end')
          .attr('y', 6)
          .attr('dy', '.75em')
          .attr('transform', 'rotate(-90)')
          .text('elevation (m)');

      gEnter.append('g')
          .attr('class', 'metas')
          .attr('transform', 'translate(' + (width + 3) + ', 0)');

      var yHover = gEnter.append('g').attr('class', 'y grid-hover');
      yHover.append('svg:line').attr('stroke-dasharray', '5,5');
      yHover.append('text');

      var xHover = gEnter.append('g').attr('class', 'x grid-hover');
      xHover.append('svg:line').attr('stroke-dasharray', '5,5');
      xHover.append('text');

      gEnter.append('rect')
          .attr('class', 'overlay')
          .attr('width', width)
          .attr('height', height)
          .style('fill', 'none')
          .style('pointer-events', 'all');

      // Update the outer dimensions.
      svg
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom);

      // Update the inner dimensions.
      var g = svg.select('g')
          .attr('transform', 'translate(' + margin.left + ',' +
              margin.top + ')');

      var xDomain = d3.extent(data, function(d) { return d.dist; });
      x.domain(xDomain);

      yDomain = [d3.min(data, function(d) { return d.alts.MNT; }),
          d3.max(data, function(d) { return d.alts.MNT; })];

      var padding = (yDomain[1] - yDomain[0]) * 0.1;
      y.domain([yDomain[0] - padding, yDomain[1] + padding]);

      // Update the area path.
      g.select('.area')
          .transition()
          .attr('d', area);
      g.select('.line')
          .transition()
          .attr('d', line);

      if (xDomain[1] > 2000) {
        xFactor = 1000;
        units = 'km';
      } else {
        xFactor = 1;
        units = 'm';
      }

      xAxis.tickFormat(function(d) {
        return d3.locale.fr_FR.numberFormat(',.2F')(d / xFactor);
      });

      g.select('.x.axis')
          .transition()
          .call(xAxis);

      g.select('.x.label')
          .text('distance (' + units + ')')
          .style('fill', 'grey')
          .style('shape-rendering', 'crispEdges');

      g.select('.y.axis')
          .transition()
          .call(yAxis);

      g.select('.grid-y')
          .transition()
          .call(yAxis.tickSize(-width, 0, 0).tickFormat(''))
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

      g.select('.overlay')
          .on('mouseout', mouseout)
          .on('mousemove', mousemove);

      function mousemove() {
        var mouseX = d3.mouse(this)[0];
        var x0 = x.invert(mouseX);
        var i = bisectDistance(data, x0, 1);

        var point = data[i];
        var elevation = point.alts.MNT;
        var dist = point.dist;

        g.select('.x.grid-hover')
            .style('display', 'inline')
            .select('line')
            .attr('x1', x(dist))
            .attr('y1', height)
            .attr('x2', x(dist))
            .attr('y2', y(elevation));

        g.select('.y.grid-hover')
            .style('display', 'inline')
            .select('line')
            .attr('x1', x(0))
            .attr('y1', y(elevation))
            .attr('x2', width)
            .attr('y2', y(elevation));

        var max = xDomain[1];


        var right = x0 > xDomain[1] / 2;
        var xtranslate = x(dist);
        xtranslate += right ? -10 : 10;

        g.select('.x.grid-hover text')
            .text(d3.locale.fr_FR.numberFormat(',.2F')
                (parseFloat(dist.toPrecision(3))) + ' ' + units)
            .style('text-anchor', right ? 'end' : 'start')
            .attr('transform', 'translate(' + xtranslate + ',' +
                (height - 10) + ')');

        g.select('.y.grid-hover text')
            .text(d3.locale.fr_FR.numberFormat(',.2F')
                (Math.round(elevation)) + ' m')
            .style('text-anchor', right ? 'end' : 'start')
            .attr('transform', 'translate(' + xtranslate + ',' +
                (y(elevation) - 10) + ')');
        hoverCallback.call(null, point.x, point.y);
      }

      function mouseout() {
        g.selectAll('.grid-hover')
            .style('display', 'none');
        outCallback.call(null);
      }
    });
  };

  profile.hoverCallback = function(cb) {
    if (!arguments.length) {
      return hoverCallback;
    }
    hoverCallback = cb;
    return profile;
  };

  profile.outCallback = function(cb) {
    if (!arguments.length) {
      return outCallback;
    }
    outCallback = cb;
    return profile;
  };

  return profile;
};
