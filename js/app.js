
var corpcanvas = angular.module('corpcanvas', []);

var FIXTURES = {
  'nodes': [{'id': 1, 'label': 'Chris Taggart'}, {'id': 2, 'label': 'Chrinon Ltd.'}],
  'links': [{'parent': 1, 'child': 2}]
}


corpcanvas.controller('AppCtrl', ['$scope', '$location', '$http', '$window', 'graph',
  function($scope, $location, $http, $window, graph) {
  
  var svg = d3.select("#page").append("svg"),
      gridSize = 128;

  var updateSize = function() {
    var width = $(window).width(),
        height = $(window).height();
    svg.attr("width", width)
       .attr("height", height);
    redraw();
  };

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

    svg.selectAll("circle")
        .data(graph.nodes())
      .enter().append("circle")
        .attr("r", function(d) { return 30; })
        .attr("cx", function(d) { return 100 * d.id; })
        .attr("cy", function(d) { return 100 * d.id; })
        .style("fill", function(d, i) { return '#8000aa'; });

  };

  var init = function() {
    loadFixtures();
    $(window).resize(updateSize);
    updateSize();
  };

  init();
}]);



corpcanvas.factory('graph', ['$rootScope', function($rootScope) {
  var nodes = {},
      links = [];

  return {
    'addNode': function(data) {
      nodes[data.id] = data;
    },
    'addLink': function(data) {
      links.push(data);
    },
    'nodes': function() {
      var nodeList = [];
      angular.forEach(nodes, function(v) {
        nodeList.push(v);
      });
      return nodeList;
    },
    'dump': function() {
      console.log("Graph", nodes, links);
    }
  };
}]);



corpcanvas.factory('d3', ['$rootScope', function($rootScope) {
  return {};
}]);

