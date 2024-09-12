/* global MAPSIZE */
/* global DEBUGTEXTURES */
/* global WATERLEVEL */
/* global HeightField */

"use strict";

class HeightMapGenerator {
  
  static drawHeightMap(heightField) {
    if (!DEBUGTEXTURES) {
      // The heightmap is not actually used, so just skip it 
      return
    }
    
    let canvas = document.createElement('canvas');
    canvas.width = MAPSIZE;
    canvas.height = MAPSIZE;
    
    let ctx = canvas.getContext("2d", { willReadFrequently:true });
    let imageData = ctx.getImageData(0, 0, MAPSIZE, MAPSIZE);
    let data = imageData.data;

    let i = 0;
    for (let y = 0; y < MAPSIZE; y++) {
      for (let x = 0; x < MAPSIZE; x++) {
        let height = heightField.getHeight(x + 0.5, y + 0.5, MAPSIZE, 255, WATERLEVEL);

        data[i++] = height;
        data[i++] = height;
        data[i++] = height;
        data[i++] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }
}