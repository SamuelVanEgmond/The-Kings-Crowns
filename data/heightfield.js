/* global global MAPSIZE */
/* global LIGHTMAPSIZE */
/* global GROUNDTEXTURESIZE */
/* global DEBUGTEXTURES */
/* global EROSIONSTEPS */
/* global MathHelper */
/* global Path */
/* global THREE */

"use strict";

class HeightField {
  
  constructor(path, perlinNoise) {
    this.heights = this._createHeights(path, perlinNoise);
  }

  // x, y and returned height all in MAPSIZE coordinates 
  // i.e. x & y are integers 0 to MAPSIZE
  // To get pixel heights use 0.5 to MAPSIZE-0.5 !!
  // Heights are 0 to 1, scaled by getHeight to 0 to MAPSIZE
  // clampAt = 0 - 1
  getHeight(x, y, mapsize, maxHeight, clampAt = 0) { 
    if (x < 0) x = 0;
    if (y < 0) y = 0;
    if (x >= mapsize) x = mapsize - 1;
    if (y >= mapsize) y = mapsize - 1;

    // Get integer and fractional parts of coordinates
    const x1 = Math.floor(x / mapsize * MAPSIZE);
    const x2 = x1 + 1;
    const y1 = Math.floor(y / mapsize * MAPSIZE);
    const y2 = y1 + 1;

    // Bilinear interpolation
    const dx = x / mapsize * MAPSIZE - x1;
    const dy = y / mapsize * MAPSIZE - y1;
    let height = (this.heights[y1][x1] * (1 - dx) + this.heights[y1][x2] * dx) * (1 - dy) +
                 (this.heights[y2][x1] * (1 - dx) + this.heights[y2][x2] * dx) * dy;

    return height * maxHeight;
  } 
  
  getNormal(x, y, mapsize, maxHeight, clampAt, smooth = 1) {        
    // Retrieve the heights for all four adjacent coordinates
    let heightX1 = this.getHeight(x-smooth, y, mapsize, maxHeight, clampAt);
    let heightX2 = this.getHeight(x+smooth, y, mapsize, maxHeight, clampAt);
    let heightY1 = this.getHeight(x, y-smooth, mapsize, maxHeight, clampAt);
    let heightY2 = this.getHeight(x, y+smooth, mapsize, maxHeight, clampAt);

    // Determine the normal
    let gradX  = (heightX1 - heightX2) / 2;
    let gradY  = (heightY1 - heightY2) / 2;
    let len    = Math.sqrt(gradX * gradX + gradY * gradY + 1);
    
    // Note we're swapping y & z here to conform with Threejs y axis up
    // And reversing x and z so the conform with the direction of the terrain canvas
    let normal = { x: -gradX / len, y: 1 / len, z: -gradY / len };  
    
    return normal;
  }
  
  // Fill the heights using the connections as a guide
  // NOTE: Heights of vertices not of pixels
  // Vertices located at (-0.5, -0.5) - (MAPSIZE+0.5, MAPSIZE+0.5)
  // Pixels are located at (0,0) - (MAPSIZE, MAPSIZE);
  // Heights are 0 to 1, scaled by getHeight to 0 to MAPSIZE
  _createHeights(path, perlinNoise) {
    let heights = [];
    let maxHeight = 0;

    for (let y = 0; y < MAPSIZE+1; y++) {
      heights.push([]);
      for (let x = 0; x < MAPSIZE+1; x++) {
        let height = path.distanceToPath(x, y);
        heights[y][x] = height;
        maxHeight = Math.max(maxHeight, height);
      }
    }

    for(let i=0; i<EROSIONSTEPS; i++) {
      for (let y = 1; y < MAPSIZE; y++) {
        heights.push([]);
        for (let x = 1; x < MAPSIZE; x++) {
          if ((heights[y][x] > heights[y][x-1] && heights[y][x] > heights[y][x+1]) ||
              (heights[y][x] > heights[y-1][x] && heights[y][x] > heights[y+1][x]))
          heights[y][x] = (heights[y][x] + heights[y][x-1] + heights[y][x+1] + heights[y-1][x] + heights[y+1][x])/5;
        }
      }
    }
    
    // Scale the heightmap to fit exactly in a block of MAPSIZE x MAPSIZE x maxHeight
    for (let y = 0; y < MAPSIZE+1; y++) {
      for (let x = 0; x < MAPSIZE+1; x++) {
        // Create a normalized height with some scatter at low altitudes and more at higher altitudes
        let height = heights[y][x] / maxHeight;
        height = height * height * (3 - 2 * height);    
        let noise = perlinNoise.get(x * GROUNDTEXTURESIZE / MAPSIZE, y * GROUNDTEXTURESIZE / MAPSIZE);
        heights[y][x] = MathHelper.clamp(height + (noise * 0.3 - 0.15) * height, 0, 1);
      }
    }
    
    // Debug central cone
    //for (let y = 0; y < MAPSIZE+1; y++) {
    //  for (let x = 0; x < MAPSIZE+1; x++) {
    //    let height = Math.max(0,30-Math.sqrt((x-MAPSIZE/2)*(x-MAPSIZE/2) + (y-MAPSIZE/2)*(y-MAPSIZE/2)))/50;
    //    heights[y][x] = height;
    //  }
    //}
    

    return heights;
  }
}