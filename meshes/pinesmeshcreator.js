/* global THREE */
/* global MathHelper */
/* global MeshHelper */
/* global AMBIENTLIGHT */
/* global PINEDEF */
/* global MAPSIZE */
/* global LIGHTMAPSIZE */
/* global MAPSCALE */
/* global WATERLEVEL */
/* global FlexShader */
/* global mapToGround */
/* global mapToLight */
/* global unitToGround */
/* global unitToLight */

"use strict";

class PinesMeshCreator {
  
  static createMesh(heightField, lightMap, objectTracker, pineMap) {
    let lightCtx = lightMap.getContext('2d', { willReadFrequently:true });
    let lightImageData = lightCtx.getImageData(0, 0, LIGHTMAPSIZE, LIGHTMAPSIZE);
    let lightData = lightImageData.data;    
    lightCtx.save();
    
    let shadowSize = Math.floor(unitToLight(PINEDEF.scale))*2;
    let shadow     = new Float32Array(shadowSize * shadowSize);
    
    // Create a pine shaped default shadow to use for all pines
    let i = 0;
    for (let y=0; y<shadowSize; y++) {
      for (let x=0; x<shadowSize; x++) {
        shadow[i++] = ( Math.min(1,MathHelper.distanceToCircles(1/3, 1/3, 9/10, 9/10, 1/8, x/shadowSize, y/shadowSize)*10+0.5) +
                        Math.min(1,MathHelper.distanceToCircles(1/3, 1/3, 9/10, 9/10, 1/8, (x-1)/shadowSize, (y+1)/shadowSize)*10+0.5) +
                        Math.min(1,MathHelper.distanceToCircles(1/3, 1/3, 9/10, 9/10, 1/8, (x+1)/shadowSize, (y-1)/shadowSize)*10+0.5) ) / 3;
      }
    }
       
    let geometry = new THREE.BufferGeometry();

    let position = new Float32Array( PINEDEF.count * PINEDEF.branches * 4 * 3);
    let color    = new Float32Array( PINEDEF.count * PINEDEF.branches * 4 * 3);    
    let uv       = new Float32Array( PINEDEF.count * PINEDEF.branches * 4 * 2);
    let index    = [];
    
    // Add a flex attribute that determines whether the vertex can flex from the wind
    let flex     = new Float32Array( PINEDEF.count * PINEDEF.branches * 4 * 1);
                        
    let posi   = 0;
    let coli   = 0;
    let uvi    = 0;    
    let flexi  = 0;
    let indexi = 0;
    
    for (let g=0; g<PINEDEF.count; g++) {
      let x = 0;
      let y = 0;
      let z = 0;
      let scale = PINEDEF.scale * (0.9 + Math.random()*0.2);
      
      do {
        // The forest is near the mountains
        let pos = MathHelper.randomOutCircle(0.6);
        x = MAPSIZE / 2 + pos.x * MAPSIZE/2;
        z = MAPSIZE / 2 + pos.y * MAPSIZE/2;
        y = heightField.getHeight(x, z, MAPSIZE, MAPSIZE/4, WATERLEVEL);
      } while(z > Math.random()*MAPSIZE*MAPSIZE ||
              y < PINEDEF.fromHeight * MAPSIZE || 
              y > PINEDEF.toHeight   * MAPSIZE ||
              objectTracker.getNearestObject(x,z, 4))
      
      objectTracker.addObject(x,z,2);
      
      let height = heightField.getHeight(x, z, MAPSIZE, MAPSIZE/4, WATERLEVEL) * MAPSCALE;
        
      let rotation = Math.random()*Math.PI*2;
      let size = 0.55;
      let dir = PINEDEF.direction;
      
      for (let branch=0;branch<PINEDEF.branches; branch++) {
        let uOffset = Math.round(Math.random())*0.50;
        let tip = 0.40+Math.random()*0.1;
        
        let vertices = [ { x:-0.4*scale, y:(0.05+dir*0.05)*scale, z:0.00*scale, u:-0.05, v:0.00 },
                         { x: 0.0*scale, y:(0.05-dir*0.05)*scale, z:0.00*scale, u: 0.25, v:0.00 },
                         { x: 0.4*scale, y:(0.05+dir*0.05)*scale, z:0.00*scale, u: 0.55, v:0.00 },
                         { x: 0.0*scale, y:dir*tip*scale, z:1.00*scale, u: 0.25, v:1.30 },
                       ];

        rotation += Math.PI*2/3*(1+Math.random());
        let sin = Math.sin(rotation);
        let cos = Math.cos(rotation);
        
        let up = branch/PINEDEF.branches;
        let branchHeight = Math.pow(up, 0.75)*scale/10;
        size -= 1/PINEDEF.branches/2;
        
        // Create all vertices
        for (let i=0; i<4; i++) {
          let v = vertices[i];

          // Pine size is in world units!! I.e. bigger world same size pines
          let vx = v.x * size;
          let vz = v.z * size;
          v.y    = v.y * size + branchHeight * scale;
          v.x  = cos*vx - vz*sin;
          v.z  = sin*vx + vz*cos;

          position[posi++] = v.x + (x-MAPSIZE/2) * MAPSCALE;
          position[posi++] = v.y + height;
          position[posi++] = v.z + (MAPSIZE/2-z) * MAPSCALE;
          color[coli++] = 0;//up/4*(1-up);
          color[coli++] = 0.1+up/4;
          color[coli++] = 0; //up/4*(1-up);          
          flex[flexi++] = -v.y/4;   // Negative means will not be influenced by player, only wind
          uv[uvi++] = v.u + uOffset;
          uv[uvi++] = v.v;            
        }

        let vertexOffset = (g * PINEDEF.branches + branch) * 4 ;
        index[indexi++] = vertexOffset + 1;
        index[indexi++] = vertexOffset + 0;
        index[indexi++] = vertexOffset + 3;

        index[indexi++] = vertexOffset + 2;
        index[indexi++] = vertexOffset + 1;
        index[indexi++] = vertexOffset + 3;               
      } 
      
      let i = 0;
      let xpos = Math.floor(mapToLight(x)-shadowSize/3);
      let ypos = Math.floor(mapToLight(z)-shadowSize/3);
      for (let y=0; y<shadowSize; y++) {
        let lightdatai = ((ypos + y) * LIGHTMAPSIZE + xpos) * 4;
        for (let x=0; x<shadowSize; x++) {
          lightData[lightdatai++] *= shadow[i];
          lightData[lightdatai++] *= shadow[i];
          lightData[lightdatai++] *= shadow[i++];
          lightdatai++;
        }
      }      

    }
    
    lightCtx.putImageData(lightImageData, 0, 0);
    
    lightCtx.restore();    

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
    let material = [MeshHelper.createMaterial(pineMap, THREE.DoubleSide, true, true, true)];

    let mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }
}  