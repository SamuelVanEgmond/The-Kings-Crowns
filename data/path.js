/* global WAYPOINTCOUNT */
/* global MAPSIZE */
/* global MathHelper */

"use strict";

class Path {
  
  constructor() {
    this.wayPoints = this._generateWayPoints();
    this.connections = this._findConnections(this.wayPoints);
  }
  
  // x, y in MAPSIZE coordinates
  distanceToPath(x, y) {
    let minDist = Number.MAX_VALUE;
    for (let c = 0; c < this.connections.length; c++) {
      let dist = MathHelper.distanceToLine( x, y, this.connections[c] );
      minDist = Math.min(minDist, dist);
    }

    return minDist;
  }  
  
  _generateWayPoints() {
    let wayPoints = [];

    // Create random way points
    for (let p = 0; p < WAYPOINTCOUNT; p++) {
      wayPoints.push({
        x: (Math.random() * 0.8 + 0.1) * MAPSIZE,
        y: (Math.random() * 0.8 + 0.1) * MAPSIZE
      });
    }
    
    // Make sure we have dead center and all four corners as easy spawn points
    wayPoints.push({ x: 0.5 * MAPSIZE, y: 0.5 * MAPSIZE });
    wayPoints.push({ x: 0.2 * MAPSIZE, y: 0.2 * MAPSIZE });
    wayPoints.push({ x: 0.2 * MAPSIZE, y: 0.8 * MAPSIZE });
    wayPoints.push({ x: 0.8 * MAPSIZE, y: 0.2 * MAPSIZE });
    wayPoints.push({ x: 0.8 * MAPSIZE, y: 0.8 * MAPSIZE });
    
    return wayPoints;
  }
  
  // Use Prim's algorithm to determine the shortest path to connect all points
  _findConnections(wayPoints) {
    const N = wayPoints.length;
    const visited = new Array(N).fill(false);
    visited[0] = true;
    let connections = [];

    while (connections.length < N - 1) {
      let minDist = Infinity;
      let connection = null;
      for (let i = 0; i < wayPoints.length; i++) {
        if (visited[i]) {
          for (let j = 0; j < wayPoints.length; j++) {
            if (!visited[j]) {
              let dist = MathHelper.distance(wayPoints[i], wayPoints[j]);
              if (dist < minDist) {
                minDist = dist;
                connection = [wayPoints[i], wayPoints[j]];
              }
            }
          }
        }
      }
      visited[wayPoints.indexOf(connection[1])] = true;
      connections.push(connection);
    }
    return connections;
  }  
}