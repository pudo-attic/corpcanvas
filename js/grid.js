
corpcanvas.factory('grid', [function() {
  var layout = {unit: 10, canvasWidth: 0, canvasHeight: 0, factor: 2};

  var getUnit = function() {
    return layout.unit * layout.factor;
  };

  var getPadding = function() {
    return getUnit() * 0.2;
  };

  var translateX = function(grid) {
    // TODO: padding
    return (layout.canvasWidth / 2) + (grid * getUnit());
  };

  var translateY = function(grid) {
    // TODO: padding
    return (layout.canvasHeight / 2) + (grid * getUnit());
  };

  var snapX = function(x) {
    // TODO: padding
    return Math.round((x - (layout.canvasWidth / 2)) / getUnit()) ;
  };

  var snapY = function(y) {
    // TODO: padding
    return Math.round((y  - (layout.canvasHeight / 2)) / getUnit());
  };

  return {
    reset: function(width, height) {
      layout.canvasWidth = width;
      layout.canvasHeight = height;
    },
    getUnit: getUnit,
    getPadding: getPadding,
    translateX: translateX,
    translateY: translateY,
    snapX: snapX,
    snapY: snapY
  };
}]);
