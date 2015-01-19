
var corpcanvas = angular.module('corpcanvas', ['debounce']);

var FIXTURES = {
  'nodes': [{'id': 1, 'label': 'Chris Taggart'}, {'id': 2, 'label': 'Chrinon Ltd.'}],
  'links': [{'parent': 1, 'child': 2}]
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
          d.x = Math.min(grid.maxX(), Math.max(grid.minX(), d.x + d3.event.dx));
          d.y = Math.min(grid.maxY(), Math.max(grid.minY(), d.y + d3.event.dy));
          return "translate(" + d.x + "," + d.y + ")";
      });
    alignLinks();
  };

  var dragEnded = function(d) {
    d3.select(this)
      .classed("dragging", false);
    var pos = grid.snap(d.id, d.x, d.y);
    d.left = pos[0];
    d.top = pos[1];
    d3.select(this)
      .attr("transform", function(d){
          d.x = grid.translateTop(d.top);
          d.y = grid.translateLeft(d.left);
          return "translate(" + d.x + "," + d.y + ")";
      });
    alignLinks();
  }

  var loadFixtures = function() {
    angular.forEach(FIXTURES.nodes, function(n) {
      graph.addNode(n);
    });
    angular.forEach(FIXTURES.links, function(l) {
      graph.addLink(l);
    });
  };

  var redraw = function(width, height) {
    graph.dump();
    container.selectAll(".axis").remove();

    container.append("g")
        .attr("class", "x axis")
      .selectAll("line")
        .data(d3.range(0, width, grid.getPadding()))
      .enter().append("line")
        .attr("x1", function(d) { return d; })
        .attr("y1", 0)
        .attr("x2", function(d) { return d; })
        .attr("y2", height);

    container.append("g")
        .attr("class", "y axis")
      .selectAll("line")
        .data(d3.range(0, height, grid.getPadding()))
      .enter().append("line")
        .attr("x1", 0)
        .attr("y1", function(d) { return d; })
        .attr("x2", width)
        .attr("y2", function(d) { return d; });


    renderLinks();
    renderNodes();
  };

  var renderNodes = function() {
    var drag = d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", dragStarted)
      .on("drag", dragged)
      .on("dragend", dragEnded);

    container.selectAll(".node").remove();

    var node = container.selectAll(".node")
        .data(graph.nodes())
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d){
          d.x = grid.translateTop(d.top);
          d.y = grid.translateLeft(d.left);
          return "translate(" + d.x + "," + d.y + ")";
        })
        .call(drag);

    node.append("circle")
      .attr("r", function(d) { return grid.getFactor() - 5; });
    node.append("text")
      .attr("dy", function(d) { return grid.getFactor() + 10; })
      .attr("text-anchor", "middle")
      .text(function(d){
        return d.label;
      });
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
      console.log(d);
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
    //.attr("marker-end", "url(#arrow)");
    //node.attr("transform", function(d){
    //  return "translate(" + d.x + "," + d.y + ")";
    //});
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
      .style('fill', '#ddd')
      .append("svg:path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z");

    loadFixtures();
    $(window).resize(debounce(updateSize, 400));
    updateSize();
  };

  init();
}]);


corpcanvas.factory('grid', ['graph', function(graph) {
  var windowWidth = 0,
      windowHeight = 0,
      //numHorizontal = 0,
      //numVertical = 0,
      factor = 10,
      padding = 0;

  var place = function(id, left, top) {
    //console.log("PLACE", id, left, top);
    //grid.push([id, left, top]);
    return [left, top];
  }

  return {
    reset: function(width, height) {
      windowWidth = width;
      windowHeight = height;
      factor = Math.min(1000, Math.max(20, width / 50));
      padding = factor * 0.5;
    },
    place: place,
    snap: function(id, x, y) {
      var left = Math.round((y - (factor + padding)) / ((factor * 2) + padding));
      var top = Math.round((x - (factor + padding)) / ((factor * 2) + padding));
      return place(id, left, top);
    },
    getFactor: function() { return factor; },
    getPadding: function() { return padding; },
    minX: function() {
      return factor + padding;
    },
    minY: function() {
      return factor + padding;
    },
    maxX: function() {
      return windowWidth - (factor + padding);
    },
    maxY: function() {
      return windowHeight - (factor + padding);
    },
    translateTop: function(top) {
      return factor + padding + (((factor * 2) + padding) * top);
    },
    translateLeft: function(left) {
      return factor + padding + (((factor * 2) + padding) * left);
    }
  };
}]);



corpcanvas.factory('graph', ['$rootScope', function($rootScope) {
  var nodes = {},
      links = [];

  return {
    addNode: function(data) {
      data.top = 0;
      data.left = 0;
      nodes[data.id] = data;
    },
    addLink: function(data) {
      links.push(data);
    },
    nodes: function() {
      var nodeList = [];
      angular.forEach(nodes, function(v) {
        nodeList.push(v);
      });
      return nodeList;
    },
    links: function() {
      var linkList = [];
      angular.forEach(links, function(orig) {
        var link = angular.copy(orig);
        link.source = nodes[orig.parent];
        link.target = nodes[orig.child];
        linkList.push(link);
      });
      return linkList;
    },
    dump: function() {
      console.log("Graph", nodes, links);
    }
  };
}]);



corpcanvas.factory('d3', ['$rootScope', function($rootScope) {
  return {};
}]);

