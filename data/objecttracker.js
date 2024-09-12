class ObjectTracker {
  constructor() {
    this.objects = [];
    this.maxRadius = 0;
  }
  
  addObject(x, y, radius) {
    let fx = Math.floor(x);
    let fy = Math.floor(y);
    if (!this.objects[fy])
      this.objects[fy] = [];
    if (!this.objects[fy][fx])
      this.objects[fy][fx] = [];
    this.objects[fy][fx].push({x,y,radius});
    this.maxRadius = Math.max(radius, this.maxRadius);
  }
  
  getNearestObject(x, y, distance) {
    let nearestObject = null;
    let nearestDistance = Number.MAX_VALUE
    for (let j = Math.floor(y-distance-this.maxRadius); j<y+distance+this.maxRadius; j++) {
      for (let i = Math.floor(x-distance-this.maxRadius); i<x+distance+this.maxRadius; i++) {
        let objects = this.objects[j]?.[i];
        if (objects) {
          for (let o=0; o<objects.length; o++) {
            let object = objects[o];
            let distance = (object.x-x)**2 + (object.y-y)**2;
            if (distance < nearestDistance) {
              nearestObject = object;
              nearestDistance = distance;
            }
          }
        }
      }
    }
    
    if (nearestObject) {
      if (Math.sqrt(nearestDistance) - nearestObject.radius > distance) {
        nearestObject = null;
      }
    }
    
    return nearestObject;
  }
}