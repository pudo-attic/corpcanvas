
corpcanvas.factory('grid', ['graph', function(graph) {
  var windowWidth = 0,
      windowHeight = 0,
      outerBorder = 0,
      entityWidth = 0,
      numHorizontal = 0,
      numVertical = 0,
      factor = 10,
      padding = 0;

  var isFree = function(id, left, top) {
    var free = true;
    if (left < 0 || top < 0 || left >= (numVertical)
        || top >= (numHorizontal)) {
      return false;
    }
    angular.forEach(graph.entities(), function(n) {
      if (n.left == left && n.top == top && n.id != id) {
        free = false;
      }
    });
    return free;
  }

  var findNearest = function(n) {
    var i = 1;
    while (true) {
      if (isFree(n.id, n.left, n.top + i)) {
        return [n.left, n.top + i];
      }
      if (isFree(n.id, n.left + i, n.top)) {
        return [n.left + i, n.top];
      }
      if (isFree(n.id, n.left + i, n.top - i)) {
        return [n.left, n.top - i];
      }
      if (isFree(n.id, n.left - i, n.top)) {
        return [n.left - i, n.top];
      }
      if (isFree(n.id, n.left + i, n.top + i)) {
        return [n.left + i, n.top + i];
      }
      if (isFree(n.id, n.left - i, n.top + i)) {
        return [n.left - i, n.top + i];
      }
      if (isFree(n.id, n.left + i, n.top - i)) {
        return [n.left + i, n.top - i];
      }
      if (isFree(n.id, n.left - i, n.top - i)) {
        return [n.left - i, n.top - i];
      }
      i++;
    }
  }

  var place = function(n) {
    if (angular.isUndefined(n.top) || n.top === null ||
        angular.isUndefined(n.left) || n.left === null) {
      n.top = Math.floor(Math.random() * numVertical);
      n.left = Math.floor(Math.random() * numHorizontal);
    }
    if (!isFree(n.id, n.left, n.top)) {
      var nearest = findNearest(n);
      n.top = nearest[1];
      n.left = nearest[0];
      return place(n);
    }
  }

  return {
    reset: function(width, height) {
      windowWidth = width;
      windowHeight = height;
      factor = Math.min(1000, Math.max(20, width / 100));
      padding = factor * 0.5;
      outerBorder = factor + padding;
      entityWidth = ((factor * 2) + padding)
      numVertical = (windowHeight - (outerBorder * 2)) / entityWidth;
      numHorizontal = (windowWidth - (outerBorder * 2)) / entityWidth;
    },
    place: place,
    snap: function(n) {
      n.left = Math.round((n.y - outerBorder) / entityWidth);
      n.top = Math.round((n.x - outerBorder) / entityWidth);
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
      n.x = outerBorder + (entityWidth * n.top);
      n.y = outerBorder + (entityWidth * n.left);
      return n;
    }
  };
}]);
