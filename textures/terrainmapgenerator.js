/* global MathHelper */
/* global MeshHelper */
/* global PerlinNoise */
/* global MAPSIZE */
/* global LIGHTMAPSIZE */
/* global GROUNDTEXTURESIZE */
/* global WATERLEVEL */
/* global ROCKNORMALSPREAD */
/* global Path */
/* global HeightField */
/* global getTerrain */
/* global getTerrainHeight */
/* global TER_PATH */
/* global TER_GRASS */
/* global TER_ROCK */
/* global TER_SNOW */
/* global THREE */

"use strict";

class TerrainMapGenerator {

  static drawLightMap(canvas, heightField) {   
    canvas.width = LIGHTMAPSIZE;
    canvas.height = LIGHTMAPSIZE;
    
    let ctx = canvas.getContext("2d", { willReadFrequently:true });
    let imageData = ctx.getImageData(0, 0, LIGHTMAPSIZE, LIGHTMAPSIZE);
    let data = imageData.data;

    let normal = null
    for (let y = 0; y < LIGHTMAPSIZE; y++) {
      for (let x = 0; x < LIGHTMAPSIZE; x++) {
        
        // Perturb the position to get wavy terrain borders
        let hx = x + Math.sin((x + y) / LIGHTMAPSIZE * Math.PI * 50) * LIGHTMAPSIZE * 0.004;
        let hy = y + Math.sin((x - y) / LIGHTMAPSIZE * Math.PI * 50) * LIGHTMAPSIZE * 0.004;
        let height = heightField.getHeight(hx + 0.5, hy + 0.5, LIGHTMAPSIZE, 1, 0);
        
        normal = heightField.getNormal(x + 0.5, y + 0.5, LIGHTMAPSIZE, LIGHTMAPSIZE / 4, WATERLEVEL, 1)            
        
        // Calculate the light from the sun + ambient light
        let light = MeshHelper.calculateLight(normal)*255;

        // Write the data to the light map
        let index = 4 * (y * LIGHTMAPSIZE + x);
        data[index + 0] = light;
        data[index + 1] = light;
        data[index + 2] = light;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  static addShadows(canvas, heightField) {
    let ctx = canvas.getContext("2d", { willReadFrequently:true });
    let imageData = ctx.getImageData(0, 0, LIGHTMAPSIZE, LIGHTMAPSIZE);
    let data = imageData.data;

    for (let y = 0; y < LIGHTMAPSIZE; y++) {
      for (let x = 0; x < LIGHTMAPSIZE; x++) {
        let index = 4 * (y * LIGHTMAPSIZE + x);
        let height = heightField.getHeight(x + 0.5, y + 0.5, LIGHTMAPSIZE, LIGHTMAPSIZE / 4, WATERLEVEL);

        // Send a ray downwards and mark every point on the terrain that is lower as being in the shadow
        for (let h = 1; h <= height; h++) {
          if (y + h < LIGHTMAPSIZE && x + h < LIGHTMAPSIZE) {
            if (heightField.getHeight(x + 0.5 + h, y + 0.5 + h, LIGHTMAPSIZE, LIGHTMAPSIZE / 4, WATERLEVEL) < height - h) {
              // Temporarily store shadow in the alpha channel
              let localIndex = 4 * ((y + h) * LIGHTMAPSIZE + (x + h));
              data[localIndex + 3] = 0;
            }
          }
        }
      }
    }

    for (let y = 0; y < LIGHTMAPSIZE; y++) {
      for (let x = 0; x < LIGHTMAPSIZE; x++) {
        let total = 0;
        // Average the shadow over a 3 by 3 area
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            let k = MathHelper.clamp(x + i, 0, LIGHTMAPSIZE - 1);
            let l = MathHelper.clamp(y + j, 0, LIGHTMAPSIZE - 1);
            let index = 4 * (l * LIGHTMAPSIZE + k);
            total += data[index + 3];
          }
        }
        total = total / 9 / 255 * 1.5;
        let index = 4 * (y * LIGHTMAPSIZE + x);
        data[index + 0] *= total;
        data[index + 1] *= total;
        data[index + 2] *= total;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);   
  }

  static drawTerrainMap(heightField, perlinNoise) {
    let canvas = document.createElement('canvas');
    
    //const _GROUNDTEXTURESIZE = GROUNDTEXTURESIZE * 2;

    canvas.width = GROUNDTEXTURESIZE;
    canvas.height = GROUNDTEXTURESIZE;
    let ctx = canvas.getContext("2d", { willReadFrequently:true });
    let imageData = ctx.getImageData(0, 0, GROUNDTEXTURESIZE, GROUNDTEXTURESIZE);
    let data = imageData.data;

    let i = 0;
    for (let y = 0; y < GROUNDTEXTURESIZE; y++) {
      for (let x = 0; x < GROUNDTEXTURESIZE; x++) {
        
        let noise = perlinNoise.get(x,y);

        let height = heightField.getHeight(x + 0.5, y + 0.5, GROUNDTEXTURESIZE, 1, 0);
        let heightNoise = height + height * (noise*2-1)/2;
        
        let color = undefined;
        let rnd = Math.random();
        
        let terrain = getTerrain(heightNoise);
        let terrainNext = getTerrain(height + noise*0.05 - 0.05/2 + Math.random()*0.05 - 0.05/2);
        if ((terrain === TER_PATH || terrain === TER_GRASS) &&
            (terrainNext === TER_PATH || terrainNext === TER_GRASS)) {
            terrain = terrainNext;
        }
        terrainNext = getTerrain(height + noise*0.15 - 0.15/2 + Math.random()*0.005 - 0.005/2);
        if ((terrain === TER_GRASS || terrain === TER_ROCK) && 
            (terrainNext === TER_GRASS || terrainNext === TER_ROCK)) {
            terrain = terrainNext;
        }
        
        switch (terrain) {
          
          case TER_PATH: {
            color = { r: 50 + rnd * 50, g: 75 + rnd * 50, b: 0 };
            break;
          }            
          case TER_GRASS: {
            color = { r: 50 - heightNoise * 150 + rnd * 25, g: 75 - heightNoise * 225 + rnd * 25, b: 0 };
            break;
          }  
          case TER_ROCK: {
            // Dark blue rocks with sandstone highlights
            let c = rnd*10;
            color = { r: c + 10 + noise * noise * 150, 
                      g: c + 20 + noise * noise * 120, 
                      b: c + 30 + noise * noise * 90 
                    };
            break;
          }  
          case TER_SNOW: {
            // Light blue snow with white highligths
            let c = 180 + rnd*10;
            let rim = Math.pow(Math.max(0, (1-(heightNoise - getTerrainHeight(TER_SNOW))*10)),2) * 100;
            color = { r: c + 0  + noise * 65 - rim, 
                      g: c + 0  + noise * 65 - rim*0.66, 
                      b: c + 40 + noise * 25 - rim*0.33
                    };
            break;
          }
          default: {
            color = { r:255, g:0, b:255 };
            break;
          }
        }

        //color = { r:255, g:255, b:255 };
        data[i++] = color.r;
        data[i++] = color.g;
        data[i++] = color.b;
        data[i++] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    
    //canvas = this.resize(canvas);
    
    return canvas;
  }

  static overlayLightMap(terrainMap, lightMap) {
    let ctx = terrainMap.getContext("2d", { willReadFrequently:true });
    ctx.globalCompositeOperation = "multiply";

    // Blur the lightmap and draw it over the ground texture
    ctx.filter = `blur(${GROUNDTEXTURESIZE/LIGHTMAPSIZE/4}px)`;
    let img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0, GROUNDTEXTURESIZE, GROUNDTEXTURESIZE);
    };
    img.src = lightMap.toDataURL();
  }
}