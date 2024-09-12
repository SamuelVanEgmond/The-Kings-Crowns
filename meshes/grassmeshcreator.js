/* global THREE */
/* global MeshHelper */
/* global GRASSDEF */
/* global AMBIENTLIGHT */
/* global MAPSIZE */
/* global MAPSCALE */
/* global WATERLEVEL */
/* global LIGHTMAPSIZE */
/* global FlexShader */
/* global mapToGround */
/* global mapToLight */
/* global unitToGround */

"use strict";

class GrassMeshCreator {
  
  static createMesh(heightField, lightMap, objectTracker, terrainMap, grassMap) {
    let locations = this._determineLocations(heightField, objectTracker);
    
    // The lightmap is used to darken grass in the shadows
    let ctxLight = lightMap.getContext('2d', { willReadFrequently:true });
    let imageDataLight = ctxLight.getImageData(0, 0, LIGHTMAPSIZE, LIGHTMAPSIZE);
    let lightData = imageDataLight.data; 

    // The GrassMeshCreator draws grass shadows directly on the terrain map (higher resolution and wont interfere with lightmap see above)
    let ctxTerrain = terrainMap.getContext('2d', { willReadFrequently:true });
    
    ctxTerrain.save();
    
    // Begin path for all grass shadows
    ctxTerrain.beginPath();    
    
    let mesh = this._createMeshForLocations(heightField, lightData, ctxTerrain, grassMap, locations); 
    
    // Draw all shadows at once
    ctxTerrain.stroke();     
    ctxTerrain.restore();    
    
    return mesh;
  }
  
  static _determineLocations(heightField, objectTracker) {

    let minX = Number.MAX_VALUE;
    let minZ = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let maxZ = -Number.MAX_VALUE;
    
    let locations = [];
    for (let l=0; l<GRASSDEF.count; l++) {
      let x = 0;
      let y = 0;
      let z = 0;
    
      do {
        x = Math.random() * MAPSIZE;
        z = Math.random() * MAPSIZE;
        y = heightField.getHeight(x, z, MAPSIZE, MAPSIZE/4, WATERLEVEL);
      } while(y < GRASSDEF.fromHeight * MAPSIZE || 
              y > GRASSDEF.toHeight   * MAPSIZE || 
              y > Math.random() * MAPSIZE / 100 ||
              objectTracker.getNearestObject(x,z, 0))

      locations.push({ x, y,z });
      minX = Math.min(minX, x);
      minZ = Math.min(minZ, x);
      maxX = Math.max(maxX, x);
      maxZ = Math.max(maxZ, x);
    }

    return locations;
  }
  
  static _createMeshForLocations(heightField, lightData, ctxTerrain, grassMap, locations) {
    let geometry = new THREE.BufferGeometry();

    let position = new Float32Array( locations.length * 4 * 3);
    let color    = new Float32Array( locations.length * 4 * 3);
    let uv       = new Float32Array( locations.length * 4 * 2);
    let index    = [];
    
    // Add a flex attribute that determines whether the vertex can flex from the wind
    let flex     = new Float32Array( locations.length * 4 * 1);
                        
    let posi   = 0;
    let coli   = 0;
    let uvi    = 0;    
    let flexi  = 0;
    let indexi = 0;
    
    ctxTerrain.strokeStyle = 'rgba(0,0,0,0.4)';
    ctxTerrain.lineWidth = unitToGround(0.2);
    ctxTerrain.lineCap = 'round';
    
    for (let l=0; l<locations.length; l++) {
      let x = locations[l].x;
      let y = locations[l].y;
      let z = locations[l].z;
      
      let rotation = Math.random()*Math.PI*2;
      let scale = 0.75 + Math.random()/2;
      let sin = Math.sin(rotation);
      let cos = Math.cos(rotation);
      
      let map = 0;
      if (Math.random()<GRASSDEF.flowers) {
        map = Math.floor(Math.random()*3)+1;
      }
      let vertices = [ { x:-0.3, y:0.00, z:-0.3, u: map   *0.25, v:0.00 },
                       { x:-0.3, y:0.85, z:-0.3, u: map   *0.25, v:0.95 }, 
                       { x: 0.3, y:0.85, z: 0.3, u:(map+1)*0.25, v:0.95 }, 
                       { x: 0.3, y:0.00, z: 0.3, u:(map+1)*0.25, v:0.00 } 
                     ];
      
      let xOffset = (0.75 + Math.random()*0.5);
      let zOffset = (0.75 + Math.random()*0.5);
      for (let i=0; i<4; i++) {
        let v = vertices[i];
        
        // Grass size is in world units!! I.e. bigger world same size grass
        let vx = v.x * scale * xOffset;
        let vz = v.z * scale * zOffset;
        v.x  = cos*vx - vz*sin;
        v.z  = sin*vx + vz*cos;
        v.y = (i === 1 || i === 2 ? v.y*scale : 0);
        
        let light = lightData[(Math.round(mapToLight(z))*LIGHTMAPSIZE + Math.round(mapToLight(x)))*4];
        position[posi++] = v.x + (x-MAPSIZE/2) * MAPSCALE;
        position[posi++] = v.y + (heightField.getHeight(x + v.x, z - v.z, MAPSIZE, MAPSIZE/4, WATERLEVEL)) * MAPSCALE;
        position[posi++] = v.z + (MAPSIZE/2-z) * MAPSCALE;
        color[coli++] = light/255;
        color[coli++] = light/255;
        color[coli++] = light/255;
        flex[flexi++] = v.y;   
        uv[uvi++] = v.u;
        uv[uvi++] = v.v;

        // Create the two triangle faces
        index[indexi++] = l * 4 + 0;
        index[indexi++] = l * 4 + 1;
        index[indexi++] = l * 4 + 2;

        index[indexi++] = l * 4 + 2;
        index[indexi++] = l * 4 + 3;
        index[indexi++] = l * 4 + 0;        
      }
      
      // Draw grass shadows on the terrain texture      
      let v0 = vertices[0];
      let v1 = vertices[1];
      let v2 = vertices[2];
      let v3 = vertices[3];
      
      // I had beginPath and stroke around these lines in the loop
      // That gave WebGL context lost errors which I assumed was due to to many canvases
      // Still no idea why you get errors with beginPath and stroke here!?
      for (let s=0; s<=1; s+=0.2) {
        ctxTerrain.moveTo(mapToGround(x) + unitToGround(v0.x * (1-s) + v3.x * s) , 
                          mapToGround(z) - unitToGround(v0.z * (1-s) + v3.z * s));
        ctxTerrain.lineTo(mapToGround(x) + unitToGround(v0.x * (1-s) + v3.x * s + v2.y * (1-s) + v3.y * s), 
                          mapToGround(z) - unitToGround(v0.z * (1-s) + v3.z * s - v2.y * (1-s) + v3.y * s));
      }
    } 

    // Set the geometry attribute buffers
    // Since this is MeshBAsicMaterial, no need for normals
    // Since we are using textures no need for colors
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3) );
    geometry.setAttribute( 'color',    new THREE.Float32BufferAttribute( color, 3) );
    geometry.setAttribute( 'uv',       new THREE.Float32BufferAttribute( uv, 2) );
    geometry.setAttribute( 'flex',     new THREE.Float32BufferAttribute( flex, 1) );
    geometry.uvsNeedUpdate = true;
    geometry.setIndex( index );

    // Add the groups for each material
    geometry.addGroup(0, index.length, 0);

    geometry.computeBoundingBox();

    //                         createMaterial(map, side, vertexColors, alphaTest, flex)
    let material = [MeshHelper.createMaterial(grassMap, THREE.DoubleSide, true, true, true)];

    let mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }
}