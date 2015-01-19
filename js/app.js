
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

  var loadFixtures = function() {
    angular.forEach(FIXTURES.nodes, function(n, i) {
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

    angular.forEach(graph.nodes(), function(n) {
      grid.position(n);
    });

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
          return "translate(" + d.x + "," + d.y + ")";
        })
        .call(drag);

    node.append("circle")
      .attr("r", function(d) { return grid.getFactor() - 5; });
    node.append("text")
      .attr("dy", function(d) { return grid.getFactor() + 10; })
      .attr("text-anchor", "middle")
      .text(function(d){ return d.label; });
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

    loadFixtures();
    $(window).resize(debounce(updateSize, 400));
    updateSize();
  };

  init();
}]);


corpcanvas.factory('grid', ['graph', function(graph) {
  var windowWidth = 0,
      windowHeight = 0,
      outerBorder = 0,
      nodeWidth = 0,
      numHorizontal = 0,
      numVertical = 0,
      factor = 10,
      padding = 0;

  var isFree = function(id, left, top) {
    var free = true;
    if (angular.isUndefined(top) || top === null ||
        angular.isUndefined(left) || left === null) {
      return false;
    }
    if (left < 0 || top < 0 || left >= (numVertical - 1)
        || top >= (numHorizontal - 1)) {
      return false;
    }
    angular.forEach(graph.nodes(), function(n) {
      if (n.left == left && n.top == top && n.id != id) {
        free = false;
      }
    });
    return free;
  }

  var place = function(n) {
    if (!isFree(n.id, n.left, n.top)) {
      n.top = Math.floor(Math.random() * numVertical);
      n.left = Math.floor(Math.random() * numHorizontal);
      return place(n);
    }
  }

  return {
    reset: function(width, height) {
      windowWidth = width;
      windowHeight = height;
      factor = Math.min(1000, Math.max(20, width / 50));
      padding = factor * 0.5;
      outerBorder = factor + padding;
      nodeWidth = ((factor * 2) + padding)
      numVertical = (windowHeight - (outerBorder * 2)) / nodeWidth;
      numHorizontal = (windowWidth - (outerBorder * 2)) / nodeWidth;
    },
    place: place,
    snap: function(n) {
      n.left = Math.round((n.y - outerBorder) / nodeWidth);
      n.top = Math.round((n.x - outerBorder) / nodeWidth);
      place(n);
    },
    getFactor: function() { return factor; },
    getPadding: function() { return padding; },
    bounded: function(d, dx, dy) {
      d.x = Math.min(windowWidth - outerBorder, Math.max(outerBorder, d.x + dx));
      d.y = Math.min(windowHeight - outerBorder, Math.max(outerBorder, d.y + dy));
    },
    position: function(n) {
      place(n)
      n.x = outerBorder + (nodeWidth * n.top);
      n.y = outerBorder + (nodeWidth * n.left);
      return n;
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

