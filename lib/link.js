
// link object parts by id. uses intersection tests from JSTS

var jsts = require('./JSTSAdapter.js');

//*****************************************************************************

module.exports = function(geojson) {
  var features = geojson.features;

  for (var i = 0; i < features.length; i++) {
    features[i].wkt = jsts.toWKT(features[i].geometry.coordinates[0]);
  }

  for (var i = 0; i < features.length; i++) {
    for (var j = 0; j < features.length; j++) {
      if (j !== i && jsts.intersects(features[i].wkt, features[j].wkt)) {
        features[j].id = features[i].id;
      }
    }
  }

  for (var i = 0; i < features.length; i++) {
    delete features[i].wkt;
  }

  return geojson;
};
