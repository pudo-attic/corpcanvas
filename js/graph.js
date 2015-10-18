var FIXTURES = {
  'nodes': [
    {'id': 1, 'label': 'Chris Taggart', 'type': 'person'},
    {'id': 2, 'label': 'Chrinon Ltd.', 'type': 'company'}],
  'links': [{'parent': 1, 'child': 2}]
}


corpcanvas.factory('graph', [function() {
  var nodes = {},
      links = [];

  var addNode = function(data) {
    nodes[data.id] = data;
  }

  var addLink = function(data) {
    links.push(data);
  };

  var loadFixtures = function() {
    angular.forEach(FIXTURES.nodes, function(n, i) {
      addNode(n);
    });
    angular.forEach(FIXTURES.links, function(l) {
      addLink(l);
    });
  };

  loadFixtures();

  return {
    addNode: addNode,
    addLink: addLink,
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
