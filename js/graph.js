var FIXTURES = {
  'entities': [
    {'id': 1, 'label': 'Chris Taggart', 'type': 'person'},
    {'id': 2, 'label': 'Chrinon Ltd.', 'type': 'company'}],
  'links': [{'parent': 1, 'child': 2}]
}


corpcanvas.factory('graph', [function() {
  var entities = [],
      links = [];

  function Entity(id, label, data) {
    var self = this;
    self.id = id;
    self.label = label;
    self.data = data;

    self.gridX = 0;
    self.gridY = 0;
    self.gridWidth = 4;
    self.gridHeight = 2

    // self.topLeft = function() {
    //   return [];
    // };
    //
    // self.contains = function(x, y) {
    //
    // };

  }

  var addEntity = function(data) {
    var entity = new Entity(data.id, data.label, data);
    entities.push(entity);
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
