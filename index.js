
var convert = require('./lib/index.js');

//*****************************************************************************

var path = './data';

var X = 24000.0;
var Y = 17921.0;

var files = [{ name:'o2-vor90', x: X, y: Y, z: -9 }];

//*****************************************************************************

// 0.01 puts 42MB down to 900k with good amount of details
// 20 puts 42MB down to 450k with missing details but geometries intact
var simplification = 0;

//*****************************************************************************

for (var i = 0; i < files.length; i++) {
  console.log('converting '+ files[i].name +'..');

  convert({
    objFile: path +'/'+ files[i].name +'.obj',
    //mtlFile: path +'/'+ files[i].name +'.mtl',
    geojsonFile: path +'/'+ files[i].name +'.geo.json',
    x: files[i].x,
    y: files[i].y,
    z: files[i].z,
    simplification: simplification
  });
}
