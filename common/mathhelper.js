"use strict";

class MathHelper {
          
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }    
  
  static normalize(vec) {
    let len = Math.sqrt(vec.x*vec.x + vec.y*vec.y + vec.z*vec.z);
    vec.x /= len;
    vec.y /= len;
    vec.z /= len;
  }
  
  static dotProduct(vectorA, vectorB) {
    return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z;
  }  
  
  static distance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

   static distanceToLine(x, y, line) {
    let A = x - line[0].x;
    let B = y - line[0].y;
    let C = line[1].x - line[0].x;
    let D = line[1].y - line[0].y;

    let dot = A * C + B * D;
    let lenSq = C * C + D * D;
    let param = -1;
    if (lenSq != 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = line[0].x;
      yy = line[0].y;
    } else if (param > 1) {
      xx = line[1].x;
      yy = line[1].y;
    } else {
      xx = line[0].x + param * C;
      yy = line[0].y + param * D;
    }

    let dx = x - xx;
    let dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // The distance from a line of circles from (x1, y1) to (x2, y2) starting with radius and ending with radius 0
  // (Used to create the shadow of pine trees)
  static distanceToCircles(x1, y1, x2, y2, radius, px, py) {
    // Calculate the squared distance from (x1, y1) to (x2, y2)
    let distanceSqrd = (x2 - x1)**2 + (y2 - y1)**2;

    // Compute the parameter t that minimizes the distance from the point to the line AB
    let t = ((px - x1)*(x2 - x1) + (py - y1)*(y2 - y1)) / distanceSqrd;

    // Ensure t lies within the parameter range of the line AB, which is [0,1] (clamping the value of t to this range)
    t = Math.max(0, Math.min(1, t));

    // Find the projection point Q that the query point P is closest to
    let qx = x1 + t * (x2 - x1);
    let qy = y1 + t * (y2 - y1);

    // Calculate the distance from the point to the line
    let distToLine = Math.sqrt((qx - px)**2 + (qy - py)**2);

    // The radius of the circle closest to the point
    // Radius = radius at start point, and 0 at end point
    radius = (1 - t) * radius;

    // Check if the point is inside the circle
    if (distToLine <= radius) {
        // If inside the circle, the distance is 0
        return 0;
    } else {
        // If outside the circle, the distance is the distance to the circle edge
        return distToLine - radius;
    }
  }  
  
  static randomInCircle() {
      let angle = Math.random() * 2 * Math.PI;
      let radius = Math.sqrt(Math.random());
      let x = radius * Math.cos(angle);
      let y = radius * Math.sin(angle);
      return {x, y};
  }  

  static randomOutCircle(avoid = 0.5) {
      let pos = {x:0, y:0};
      do {
        pos.x = Math.random()*2-1;
        pos.y = Math.random()*2-1;
      } while (this.distance(pos, {x:0, y:0}) < avoid)
      return pos;
  }  
}