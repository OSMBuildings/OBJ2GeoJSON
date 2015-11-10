
// adapter to JSTS
var jsts = require('jsts');

var reader = new jsts.io.WKTReader();

var adapter = module.exports = {};

adapter.toWKT = function(coordinates) {
  var points = [];
  for (var i = 0; i < coordinates.length; i++) {
    points.push(coordinates[i][0] + ' ' + coordinates[i][1]);
  }
  return reader.read('POLYGON((' + points.join(',') + '))');
};

adapter.intersects = function(a, b) {
  var res = false;

  try {
    res = a.intersects(b);
  } catch (ex) {
    //console.log('intersection check problem: '+ (ex.message || '<no details>'));
    return false;
  }

  return res;
};

adapter.contains = function(a, b) {
  var res = false;

  try {
    res = a.contains(b);
  } catch (ex) {
    //console.log('contains check problem: '+ (ex.message || '<no details>'));
    return false;
  }

  return res;
};

adapter.mergeTriangles = function(triangles) {
  var a, b;
  var polygon;

  for (var i = 0, il = triangles.length; i < il; i++) {
    polygon = this.toWKT(triangles[i])

    if (!i) {
      a = polygon;
    } else {
      b = polygon;
      try {
        a = a.union(b);
      } catch (ex) {
//      console.log('merge problem: '+ (ex.message || '<no details>'));
      }
    }
  }

  var geometries = a.geometries || [a];
  var shell;
  var points;
  var res = [];

  for (var i = 0; i < geometries.length; i++) {
    if (!geometries[i].shell) {
//    console.log('geometry problem: missing shell');
      continue;
    }

    shell = geometries[i].shell.points;
    points = [];
    for (var j = 0; j < shell.length; j++) {
      points.push([shell[j].x, shell[j].y]);
    }

    res.push(points);
  }

  return res;
};
