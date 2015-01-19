
var corpcanvas = angular.module('corpcanvas', []);

var FIXTURES = {
  'nodes': [{'id': 1, 'label': 'Chris Taggart'}, {'id': 2, 'label': 'Chrinon Ltd.'}],
  'links': [{'parent': 1, 'child': 2}]
}


corpcanvas.controller('AppCtrl', ['$scope', '$location', '$http', '$window', 'graph', 'grid',
  function($scope, $location, $http, $window, graph, grid) {
  
  var svg = d3.select("#page").append("svg"),
      gridSize = 128;

  var updateSize = function() {
    var width = $(window).width(),
        height = $(window).height();
    svg.attr("width", width)
       .attr("height", height);
    grid.reset(width, height);
    redraw();
  };

  var dragStarted = function(d) {
    d3.event.sourceEvent.stopPropagation();
    d3.select(this).classed("dragging", true);
  };

  var dragged = function(d) {
    d3.select(this)
      .attr("cx", function(d) {
        d.x = d.x + d3.event.dx;
        d.x = Math.max(grid.minX(), d.x);
        d.x = Math.min(grid.maxX(), d.x);
        return d.x;
      })
      .attr("cy", function(d) {
        d.y = d.y + d3.event.dy;
        d.y = Math.max(grid.minY(), d.y);
        d.y = Math.min(grid.maxY(), d.y);
        return d.y;
      });
  };

  var dragEnded = function(d) {
    d3.select(this)
      .classed("dragging", false);
  }

  var loadFixtures = function() {
    angular.forEach(FIXTURES.nodes, function(n) {
      graph.addNode(n);
    });
    angular.forEach(FIXTURES.links, function(l) {
      graph.addLink(l);
    });
  };

  var redraw = function() {
    graph.dump();

    var drag = d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", dragStarted)
      .on("drag", dragged)
      .on("dragend", dragEnded);

    svg.selectAll("circle")
        .data(graph.nodes())
      .enter().append("circle")
        .attr("r", function(d) { return grid.getFactor(); })
        .attr("cx", function(d) { d.x = d.id * 100; return d.x; })
        .attr("cy", function(d) { d.y = d.id * 100; return d.y; })
        .call(drag)
        .style("fill", function(d, i) { return '#8000aa'; });

  };

  var init = function() {
    loadFixtures();
    $(window).resize(updateSize);
    updateSize();
  };

  init();
}]);


corpcanvas.factory('grid', ['$rootScope', function($rootScope) {
  var grid = [],
      windowWidth = 0,
      windowHeight = 0,
      numHorizontal = 0,
      numVertical = 0,
      factor = 10;

  return {
    reset: function(width, height) {
      windowWidth = width;
      windowHeight = height;
      factor = Math.min(1000, Math.max(20, width / 50));
      padding = factor * 0.3;
    },
    getFactor: function() {
      return factor;
    },
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
    }
  };
}]);



corpcanvas.factory('graph', ['$rootScope', function($rootScope) {
  var nodes = {},
      links = [];

  return {
    addNode: function(data) {
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
    dump: function() {
      console.log("Graph", nodes, links);
    }
  };
}]);



corpcanvas.factory('d3', ['$rootScope', function($rootScope) {
  return {};
}]);

