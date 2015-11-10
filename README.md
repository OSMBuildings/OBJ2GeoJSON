# OBJ2GeoJSON
Converts OBJ files to 3D renderable GeoJSON

The code is tailored to Berliner Morgenpost visualization <a href="http://interaktiv.morgenpost.de/berlins-neue-skyline/">"Berlins neue Skyline"</a>.
For your own purposes you need to change settings inside /index.js and most likely geographic transformation in /lib/index.js

To match dependencies run first

~~~
npm install
~~~~

Then edit index.js to match your source files location(s). Locate following line and add entries as you need.
The x, y, z are metric offsets. It means Berlin data is projected in Söldner reference system. The offsets basically 
define where the result should be located. A z value allows you to adjust the vertical position.

~~~
var files = [{ name:'o2-vor90', x: X, y: Y, z: -9 }];
~~~

Finally just run the converter with

~~~
node index.js
~~~

Let it do it's work. Shouldn't take long.

If anyone is interested in making this more flexible, especially regarding projections, go ahead!
