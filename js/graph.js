var FIXTURES = {
  'entities': [
    {'id': 1, 'label': 'Chris Taggart', 'type': 'person'},
    {'id': 2, 'label': 'Chrinon Ltd.', 'type': 'company'}],
  'links': [{'parent': 1, 'child': 2}]
}


corpcanvas.factory('graph', [function() {
  var entities = [],
      links = [];

  var addEntity = function(data) {
    entities.push(data);
  }

  var addLink = function(data) {
    links.push(data);
  };

  var loadFixtures = function() {
    angular.forEach(FIXTURES.entities, function(n, i) {
      addEntity(n);
    });
    angular.forEach(FIXTURES.links, function(l) {
      addLink(l);
    });
  };

  loadFixtures();

  return {
    addEntity: addEntity,
    addLink: addLink,
    entities: function() {
      return entities;
    },
    links: function() {
      var linkList = [];
      angular.forEach(links, function(orig) {
        var link = angular.copy(orig);
        angular.forEach(entities, function(entity) {
          if (entity.id == orig.parent) {
            link.source = entity;
          }
          if (entity.id == orig.child) {
            link.target = entity;
          }
        });
        linkList.push(link);
      });
      return linkList;
    },
    dump: function() {
      console.log("Graph", entities, links);
    }
  };
}]);
