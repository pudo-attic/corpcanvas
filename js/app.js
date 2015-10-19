var corpcanvas = angular.module('corpcanvas', ['debounce']);

var ICONS = {
  'person': '\uf183',
  'company': '\uf0f2'
}

corpcanvas.controller('AppCtrl', ['$scope', '$location', '$http', '$window', 'graph', 'grid', 'debounce',
  function($scope, $location, $http, $window, graph, grid, debounce) {

  var svg = d3.select("#page").append("svg"),
      container = svg.append("g"),
      linkElements = null,
      gridSize = 128;

  var updateSize = function() {
    var width = $(window).width(),
        height = $(window).height();
    svg.attr("width", width)
       .attr("height", height);
    grid.reset(width, height);
    redraw(width, height);
  };

  var dragStarted = function(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
  };

  var dragged = function(d) {
    d3.select(this)
      .attr("transform", function(d){
          grid.bounded(d, d3.event.dx, d3.event.dy);
          return "translate(" + d.x + "," + d.y + ")";
      });
    alignLinks();
  };

  var dragEnded = function(d) {
    d3.select(this)
      .classed("dragging", false);
    grid.snap(d);
    d3.select(this)
      .attr("transform", function(d){
          grid.position(d);
          return "translate(" + d.x + "," + d.y + ")";
      });
    alignLinks();
  }

  var redraw = function(width, height) {
    graph.dump();
    container.selectAll(".axis").remove();

    container.append("g")
        .attr("class", "x axis")
      .selectAll("line")
        .data(d3.range(grid.getPadding() * 3, width, grid.getPadding() * 5))
      .enter().append("line")
        .attr("x1", function(d) { return d; })
        .attr("y1", 0)
        .attr("x2", function(d) { return d; })
        .attr("y2", height);

    container.append("g")
        .attr("class", "y axis")
      .selectAll("line")
        .data(d3.range(grid.getPadding() * 3, height, grid.getPadding() * 5))
      .enter().append("line")
        .attr("x1", 0)
        .attr("y1", function(d) { return d; })
        .attr("x2", width)
        .attr("y2", function(d) { return d; });

    angular.forEach(graph.entities(), function(e) {
      grid.position(e);
    });

    renderLinks();
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
        .attr("transform", function(d){
          return "translate(" + d.x + "," + d.y + ")";
        })
        .call(drag);

    entity.append("circle")
      .attr("r", function(d) { return grid.getFactor() - 5; });
    entity.append("text")
      .attr("dy", function(d) { return grid.getFactor() + 10; })
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .text(function(d){ return d.label; });

    entity.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-family', 'FontAwesome')
      .attr('font-size', function(d) { return grid.getFactor() * 0.9; })
      .text(function(d) { return ICONS[d.type]; });
  };

  var renderLinks = function() {
    container.selectAll(".link").remove();
    linkElements = container.selectAll(".link")
        .data(graph.links())
      .enter().append("g")
        .attr("class", "link");

    linkElements.append("line")
      .attr("marker-end", "url(#arrow)");

    alignLinks();
  };

  var alignLinks = function() {
    linkElements.each(function(d) {
      var x1 = d.source.x,
          y1 = d.source.y,
          x2 = d.target.x,
          y2 = d.target.y,
          angle = Math.atan2(y2 - y1, x2 - x1);
      d.targetX = x2 - Math.cos(angle) * (grid.getFactor() + 5);
      d.targetY = y2 - Math.sin(angle) * (grid.getFactor() + 5);
    });

    linkElements.selectAll("line")
      .attr("x1", function(d){
        return d.source.x;
      }).attr("y1", function(d){
        return d.source.y;
      }).attr("x2", function(d){
        return d.targetX;
      }).attr("y2", function(d){
        return d.targetY;
      });
  };

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
}]);
