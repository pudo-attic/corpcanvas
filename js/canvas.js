
corpcanvas.directive('corpcanvas', ['graph', 'grid', 'debounce',
  function(graph, grid, debounce) {
  return {
    restrict: 'E',
    scope: {},
    template: '<div id="corpcanvas"></div>',
    link: function (scope, element, attrs, model) {
        var svg = d3.select("#corpcanvas").append("svg"),
            container = svg.append("g"),
            bbox = null;
            //linkElements = null;

        var updateSize = function() {
          var width = $(window).width() - 40,
              height = $(window).height() - 40;
          svg.attr("width", width)
             .attr("height", height);
          // bbox = svg.node().getBBox();
          grid.reset(width, height);
          redraw(width, height);
        };

        var dragStarted = function(d) {
          d3.event.sourceEvent.stopPropagation();
          d3.select(this).classed("dragging", true);
        };

        var dragged = function(d) {
          d3.select(this).attr("transform", function(e){
            bbox = svg.node().getBBox();
            e._x = Math.min(bbox.width - (e.getWidth() / 2), Math.max(e.getWidth() / 2, e._x + d3.event.dx));
            e._y = Math.min(bbox.height - (e.getHeight() / 2), Math.max((e.getHeight() / 2), d._y + d3.event.dy));
            return "translate(" + e._x + "," + e._y + ")";
          });
          // alignLinks();
        };

        var dragEnded = function(d) {
          d3.select(this).classed("dragging", false);
          d.gridX = grid.snapX(d._x);
          d.gridY = grid.snapY(d._y);
          console.log(d);
          d3.select(this).attr("transform", function(e){
                d._x = d.getX();
                d._y = d.getY();
                return "translate(" + e._x + "," + e._y + ")";
            });
          // alignLinks();
        }

        var redraw = function(width, height) {
          container.selectAll(".axis").remove();

          container.append("g")
              .attr("class", "x axis")
            .selectAll("line")
              .data(d3.range(grid.getUnit(), width, grid.getUnit()))
            .enter().append("line")
              .attr("x1", function(d) { return d; })
              .attr("y1", 0)
              .attr("x2", function(d) { return d; })
              .attr("y2", height);

          container.append("g")
              .attr("class", "y axis")
            .selectAll("line")
              .data(d3.range(grid.getUnit(), height, grid.getUnit()))
            .enter().append("line")
              .attr("x1", 0)
              .attr("y1", function(d) { return d; })
              .attr("x2", width)
              .attr("y2", function(d) { return d; });

          angular.forEach(graph.entities(), function(e) {
            // grid.position(e);
          });

          // renderLinks();
          renderEntities();
        };

        var renderEntities = function() {
          var drag = d3.behavior.drag()
            .origin(function(d) { return d; })
            .on("dragstart", dragStarted)
            .on("drag", dragged)
            .on("dragend", dragEnded);

          container.selectAll(".entity").remove();

          var entity = container.selectAll(".entity")
              .data(graph.entities())
            .enter().append("g")
              .attr("class", "entity")
              .attr("transform", function(e){
                e._x = e.getX();
                e._y = e.getY();
                return "translate(" + e._x + "," + e._y + ")";
              })
              .call(drag);

          entity.append("rect")
            .attr("x", function(e) { return -1 * (e.getWidth() / 2); })
            .attr("y", function(e) { return -1 * (e.getHeight() / 2); })
            .attr("width", function(e) { return e.getWidth(); })
            .attr("height", function(e) { return e.getHeight(); });
          entity.append("text")
            .attr("dy", function(d) { return 4; })
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .text(function(d){ return d.label; });

          entity.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-family', 'FontAwesome')
            .attr('font-size', function(d) { return grid.getUnit() * 0.9; })
            .text(function(d) { return ICONS[d.type]; });
        };

        // var renderLinks = function() {
        //   container.selectAll(".link").remove();
        //   linkElements = container.selectAll(".link")
        //       .data(graph.links())
        //     .enter().append("g")
        //       .attr("class", "link");
        //
        //   linkElements.append("line")
        //     .attr("marker-end", "url(#arrow)");
        //
        //   alignLinks();
        // };

        // var alignLinks = function() {
        //   linkElements.each(function(d) {
        //     var x1 = d.source.x,
        //         y1 = d.source.y,
        //         x2 = d.target.x,
        //         y2 = d.target.y,
        //         angle = Math.atan2(y2 - y1, x2 - x1);
        //     d.targetX = x2 - Math.cos(angle) * (grid.getFactor() + 5);
        //     d.targetY = y2 - Math.sin(angle) * (grid.getFactor() + 5);
        //   });
        //
        //   linkElements.selectAll("line")
        //     .attr("x1", function(d){
        //       return d.source.x;
        //     }).attr("y1", function(d){
        //       return d.source.y;
        //     }).attr("x2", function(d){
        //       return d.targetX;
        //     }).attr("y2", function(d){
        //       return d.targetY;
        //     });
        // };

        var init = function() {
          svg.append("svg:defs")
            .append("svg:marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 0 10 10")
            .attr("refX", 3).attr("refY", 5)
            .attr("markerUnits", "strokeWidth")
            .attr("markerWidth", 5)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .style('fill', '#ccc')
            .append("svg:path")
            .attr("d", "M 0 0 L 10 5 L 0 10 z");

          $(window).resize(debounce(updateSize, 400));
          updateSize();
        };

        init();
        graph.dump();

    }
  };
}]);
