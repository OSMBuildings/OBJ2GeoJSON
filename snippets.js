
var X = 24000.0;
var Y = 17921.0;

var files = [
  { name:'w3/w3-nach90',    x: X-6400 - (11*1600), y: Y, z: -9 },
  { name:'w3/w3-planung',   x: X-6400 - (11*1600), y: Y, z: -9 },
  { name:'w3/w3-vor90',     x: X-6400 - (11*1600), y: Y, z: -9 },
  { name:'w3/w3-vor90-abriss', x: X-6400 - (11*1600), y: Y, z: -9 },
  { name:'w3/w3-vorschlag', x: X-6400 - (11*1600), y: Y, z: -9 },

  { name:'w2/w2-nach90',    x: X-4800, y: Y, z: -19 },
  { name:'w2/w2-planung',   x: X-4800, y: Y, z: -19 },
  { name:'w2/w2-vor90',     x: X-4800, y: Y, z: -19 },
  { name:'w2/w2-vor90-abriss', x: X-4800, y: Y, z: -19 },
  { name:'w2/w2-vorschlag', x: X-4800, y: Y, z: -19 },

  { name:'w1/w1-nach90',    x: X-3200, y: Y, z: -20 },
  { name:'w1/w1-nach90-abriss', x: X-3200, y: Y, z: -20 },
  { name:'w1/w1-planung',   x: X-3200, y: Y, z: -20 },
  { name:'w1/w1-vor90',     x: X-3200, y: Y, z: -20 },
  { name:'w1/w1-vor90-abriss', x: X-3200, y: Y, z: -20 },
  { name:'w1/w1-vorschlag', x: X-3200, y: Y, z: -20 },

  { name:'o1/o1-nach90',    x: X-1600, y: Y, z: -22 },
  { name:'o1/o1-planung',   x: X-1600, y: Y, z: -22 },
  { name:'o1/o1-vor90',     x: X-1600, y: Y, z: -22 },
  { name:'o1/o1-vor90-abriss', x: X-1600, y: Y, z: -22 },
  { name:'o1/o1-vorschlag', x: X-1600, y: Y, z: -22 },

  { name:'o2/o2-nach90',    x: X, y: Y, z: -9 },
  { name:'o2/o2-nach90-abriss', x: X, y: Y, z: -9 },
  { name:'o2/o2-planung',   x: X, y: Y, z: -9 },
  { name:'o2/o2-vor90',     x: X, y: Y, z: -9 },
  { name:'o2/o2-vor90-abriss', x: X, y: Y, z: -9 },
  { name:'o2/o2-vorschlag', x: X, y: Y, z: -9 },

  { name:'o3/o3-nach90',    x: X+1600, y: Y, z: -9 },
  { name:'o3/o3-nach90-abriss', x: X+1600, y: Y, z: -9 },
  { name:'o3/o3-planung',   x: X+1600, y: Y, z: -9 },
  { name:'o3/o3-vor90',     x: X+1600, y: Y, z: -9 },
  { name:'o3/o3-vor90-abriss', x: X+1600, y: Y, z: -9 },
  { name:'o3/o3-vorschlag', x: X+1600, y: Y, z: -9 },

  { name:'o4/o4-nach90',    x: X+3200, y: Y, z: -10 },
  { name:'o4/o4-nach90-abriss', x: X+3200, y: Y, z: -10 },
  { name:'o4/o4-planung',   x: X+3200, y: Y, z: -10 },
  { name:'o4/o4-vor90',     x: X+3200, y: Y, z: -10 },
  { name:'o4/o4-vor90-abriss', x: X+3200, y: Y, z: -10 },
  { name:'o4/o4-vorschlag', x: X+3200, y: Y, z: -10 }
];

//var files = [{ name:'2015-09/o2 vor 90', x: X, y: Y, z: -9 }];

// converts a single obj object
//var pos = { latitude:52.51742, longitude:13.4017 };
//var proj4 = require('./lib/proj4.js');
//var EPSG3068 = "+proj=cass +lat_0=52.41864827777778 +lon_0=13.62720366666667 +x_0=40000 +y_0=10000 +ellps=bessel +towgs84=598.1,73.7,418.2,0.202,0.045,-2.455,6.7 +units=m +no_defs";
//var XY = proj4(proj4.defs['EPSG:4326'], EPSG3068, [pos.longitude, pos.latitude]);
//var files = [{ name:'../Palast', x:XY[0], y:XY[1], z:0 }];

//*****************************************************************************

function callback(feature) {
  // 'o2_Main-Material1'
  // 'o2_c_Objekt_200-Material3'
  var m = feature.id.match(/^([^_]+)_(.*_)?([^_]+)-.+$/);
  feature.id = m[1] +'-'+ m[3];

  feature.properties.roofColor = feature.properties.color;
}

//*****************************************************************************
//*****************************************************************************

// join GeoJSON files by category

var fs = require('fs');

//*****************************************************************************

var path = './data/2015-09';

var files = [
  'w3/w3',
  'w2/w2',
  'w1/w1',
  'o1/o1',
  'o2/o2',
  'o3/o3',
  'o4/o4'
];

//*****************************************************************************

function joinGeoJSON(inFiles, category) {
  var collection = { type: 'FeatureCollection', features: [] };
  var json;
  for (var i = 0; i < inFiles.length; i++) {
    var content;
    try {
      content = fs.readFileSync(path +'/'+ inFiles[i] +'-'+ category + '.geo.json');
    } catch(ex) {
      continue;
    }
    json = JSON.parse(content);
    collection.features = collection.features.concat(json.features);
  }

  fs.writeFileSync(path +'/'+ category +'.geo.json', JSON.stringify(collection));
}

//*****************************************************************************

joinGeoJSON(files, 'nach90');
joinGeoJSON(files, 'nach90-abriss');
joinGeoJSON(files, 'planung');
joinGeoJSON(files, 'vor90');
joinGeoJSON(files, 'vor90-abriss');
joinGeoJSON(files, 'vorschlag');
