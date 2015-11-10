
// simplify geometry

function getSquareSegmentDistance(px, py, p1x, p1y, p2x, p2y) {
  var
    dx = p2x-p1x,
    dy = p2y-p1y,
    t;
  if (dx !== 0 || dy !== 0) {
    t = ((px-p1x) * dx + (py-p1y) * dy) / (dx*dx + dy*dy);
    if (t > 1) {
      p1x = p2x;
      p1y = p2y;
    } else if (t > 0) {
      p1x += dx*t;
      p1y += dy*t;
    }
  }
  dx = px-p1x;
  dy = py-p1y;
  return dx*dx + dy*dy;
}

module.exports = function(points, sqTolerance) {
  var
    len = points.length,
    markers = new Uint8Array(len),

    first = 0, last = len-1,

    i,
    maxSqDist,
    sqDist,
    index,
    firstStack = [], lastStack  = [],
    res = [];

  markers[first] = markers[last] = 1;

  while (last) {
    maxSqDist = 0;
    for (i = first+1; i < last; i++) {
      sqDist = getSquareSegmentDistance(
        points[i    ][0], points[i    ][1],
        points[first][0], points[first][1],
        points[last ][0], points[last ][1]
      );
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      markers[index] = 1;

      firstStack.push(first);
      lastStack.push(index);

      firstStack.push(index);
      lastStack.push(last);
    }

    first = firstStack.pop();
    last = lastStack.pop();
  }

  for (i = 0; i < len; i++) {
    if (markers[i]) {
      res.push(points[i]);
    }
  }

  return res;
};
