
var fs       = require('fs');
var path     = require('path');
var simplify = require('./simplify.js');
var jsts     = require('./JSTSAdapter.js');
var link     = require('./link.js');
var OBJ      = require('./OBJ.js');
var proj4    = require('./proj4.js');

//*****************************************************************************

var EPSG3068 = "+proj=cass +lat_0=52.41864827777778 +lon_0=13.62720366666667 +x_0=40000 +y_0=10000 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs";

// *****************************************************************************

function round(num, factor) {
  return Math.round(num*factor)/factor;
}

function distance2(a, b) {
  var
    dx = a[0]-b[0],
    dy = a[1]-b[1];
  return dx*dx + dy*dy;
}

function transform(points, offset, simplification) {
  if (simplification) {
    points = simplify(points, simplification);
  }

  if (points.length < 4) {
    return;
  }

  var x, y, pos;
  var coordinates = [];

  for (var i = 0, il = points.length; i < il; i++) {
    x = points[i][0] + offset.x;
    y = offset.y-points[i][1]; // this is due to Sketchup OBJ Exporter flipped coordinates :-(
    pos = proj4(EPSG3068, proj4.defs['EPSG:4326'], [x, y]);
    coordinates.push([round(pos[0], 1e6), round(pos[1], 1e6)]);
  }

  return [coordinates];
}

function isCircular(ring) {
  var length = ring.length;

  if (length < 16) {
    return false;
  }

  var x = Infinity, X = -Infinity, y = Infinity, Y = -Infinity;
  for (var i = 0; i < length; i++) {
    x = Math.min(x, ring[i][0]);
    X = Math.max(X, ring[i][0]);
    y = Math.min(y, ring[i][1]);
    Y = Math.max(Y, ring[i][1]);
  }

  var width = X-x, height = Y-y;
  var ratio = width/height;

  if (ratio < 0.85 || ratio > 1.15) {
    return false;
  }

  var
    center = [x + width/2, y + height/2],
    sqRadius = (width/2 * width/2 + height/2 * height/2) / 2,
    dist;

  for (var i = 0; i < length; i++) {
    dist = distance2(ring[i], center);
    if (dist/sqRadius < 0.75 || dist/sqRadius > 1.25) {
      return false;
    }
  }

  return true;
}

//*****************************************************************************

function convert(meshes, offset, defaultColor, simplification, onFeature) {
  var collection = { type: 'FeatureCollection', features: [] };

  for (var i = 0, il = meshes.length; i<il; i++) {
    var mesh = meshes[i];

    var feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon' }
    };

    if (mesh.id) {
      feature.id = mesh.id;
    }

    feature.properties.color = defaultColor || (mesh.color ? ('#'+ ((1 <<24) + (mesh.color.r <<16) + (mesh.color.g <<8) + mesh.color.b).toString(16).slice(1, 7)) : null);

    var height = -Infinity;
    var minHeight = Infinity;

    var triangles = [];
    var chunkNum = 0;
    var mergedChunks = [];

    var tilt, hasTilt = false;
    for (var j = 0, jl = mesh.vertices.length - 8; j<jl; j += 9) {
      //if (!hasTilt) {
      //  tilt = Math.abs(mesh.normals[j + 2]);
      //  if (tilt > 0.6 && tilt < 0.7) {
      //    hasTilt = true;
      //  }
      //}

      var x1 = mesh.vertices[j + 0];
      var y1 = mesh.vertices[j + 1];
      var z1 = mesh.vertices[j + 2];
      height = Math.max(height, z1);
      minHeight = Math.min(minHeight, z1);

      var x2 = mesh.vertices[j + 3];
      var y2 = mesh.vertices[j + 4];
      var z2 = mesh.vertices[j + 5];
      height = Math.max(height, z2);
      minHeight = Math.min(minHeight, z2);

      var x3 = mesh.vertices[j + 6];
      var y3 = mesh.vertices[j + 7];
      var z3 = mesh.vertices[j + 8];
      height = Math.max(height, z3);
      minHeight = Math.min(minHeight, z3);

      triangles.push([[x1, y1], [x2, y2], [x3, y3], [x1, y1]]); // start == end makes it a proper polygon for merging

      if (triangles.length === 2500) {
        mergedChunks = mergedChunks.concat(jsts.mergeTriangles(triangles));
        triangles = [];
        chunkNum++;
      }
    }

    if (triangles.length) {
      mergedChunks = mergedChunks.concat(jsts.mergeTriangles(triangles));
    }

    feature.properties.height = round(height+offset.z, 1e1);
    minHeight = round(minHeight+offset.z, 1e1);
    if (minHeight) {
      feature.properties.minHeight = minHeight;
    }

    if (onFeature) {
      onFeature(feature);
    }

    var polygons = chunkNum ? jsts.mergeTriangles(mergedChunks) : mergedChunks;

    var coordinates;
    for (var j = 0, jl = polygons.length; j < jl; j++) {

      if (hasTilt && isCircular(polygons[j])) {
        feature.properties.shape = 'dome';
      }

      coordinates = transform(polygons[j], offset, simplification);
      if (!coordinates) {
        continue;
      }

      feature.geometry.coordinates = coordinates;

      collection.features.push(feature);
    }
  }

  return collection;
}

//*****************************************************************************

module.exports = function(config, onFeature) {
  var objFile = config.objFile;
  var objData = fs.readFileSync(objFile) + '';

  var basePath = path.dirname(objFile);
  var baseFile = path.basename(objFile).replace(/\..+$/, '');

  var mtlFile = config.mtlFile || basePath +'/'+ baseFile +'.mtl';
  var mtlData = fs.readFileSync(mtlFile) + '';

  var obj = OBJ.parse(objData, mtlData);

  var offset = { x:config.x||0, y:config.y||0, z:config.z||0 };
  var defaultColor = config.color;
  var simplification = config.simplification;

  var geojsonFile = config.geojsonFile || basePath +'/'+ baseFile +'.geo.json';

  var geojson = convert(obj, offset, defaultColor, simplification, onFeature);
  link(geojson);

  fs.writeFileSync(geojsonFile, JSON.stringify(geojson));
};
