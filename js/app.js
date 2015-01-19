
var corpcanvas = angular.module('corpcanvas', ['debounce']);

var FIXTURES = {
  'nodes': [{'id': 1, 'label': 'Chris Taggart'}, {'id': 2, 'label': 'Chrinon Ltd.'}],
  'links': [{'parent': 1, 'child': 2}]
}


corpcanvas.controller('AppCtrl', ['$scope', '$location', '$http', '$window', 'graph', 'grid', 'debounce',
  function($scope, $location, $http, $window, graph, grid, debounce) {
  
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
    var pos = grid.snap(d.id, d.x, d.y);
    d.left = pos[0];
    d.top = pos[1];
    d3.select(this)
      .attr("cx", function(d) {
        return grid.translateTop(d.top);
      })
      .attr("cy", function(d) {
        return grid.translateLeft(d.left);
      });
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
        .attr("cx", function(d) { d.x = grid.translateTop(d.top); return d.x; })
        .attr("cy", function(d) { d.y = grid.translateLeft(d.left); return d.y; })
        .call(drag)
        .style("fill", function(d, i) { return '#8000aa'; });

  };

  var init = function() {
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
      padding = factor * 0.3;
    },
    place: place,
    snap: function(id, x, y) {
      var left = Math.round((y - (factor + padding)) / ((factor * 2) + padding));
      var top = Math.round((x - (factor + padding)) / ((factor * 2) + padding));
      return place(id, left, top);
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
    dump: function() {
      console.log("Graph", nodes, links);
    }
  };
}]);



corpcanvas.factory('d3', ['$rootScope', function($rootScope) {
  return {};
}]);

