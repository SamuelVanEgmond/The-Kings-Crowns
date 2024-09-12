/* global THREE */
/* global MathHelper */
/* global MeshHelper */
/* global AMBIENTLIGHT */
/* global PALMDEF */
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

class PalmsMeshCreator {
  
  static createMesh(heightField, lightMap, objectTracker, palmMap) {
    let lightCtx = lightMap.getContext('2d', { willReadFrequently:true });
    let lightImageData = lightCtx.getImageData(0, 0, LIGHTMAPSIZE, LIGHTMAPSIZE);
    let lightData = lightImageData.data;    
    lightCtx.save();
    
    let shadowSize = Math.floor(unitToLight(PALMDEF.scale*2));
    let shadow     = new Float32Array(shadowSize * shadowSize);
    
    let i = 0;
    for (let y=0; y<shadowSize; y++) {
      for (let x=0; x<shadowSize; x++) {
        shadow[i++] = Math.min(1, Math.sqrt((x-shadowSize/2)*(x-shadowSize/2) + (y-shadowSize/2)*(y-shadowSize/2)) / (shadowSize/2)) *
                      Math.min(1, Math.sqrt((x-shadowSize/3)*(x-shadowSize/3) + (y-shadowSize/3)*(y-shadowSize/3)) / (shadowSize/3)) * 0.6 + 0.4;
        
      }
    }
    
    let geometry = new THREE.BufferGeometry();

    let position = new Float32Array( PALMDEF.count * PALMDEF.leaves * 18 * 3);
    let uv       = new Float32Array( PALMDEF.count * PALMDEF.leaves * 18 * 2);
    let index    = [];
    
    // Add a flex attribute that determines whether the vertex can flex from the wind
    let flex     = new Float32Array( PALMDEF.count * PALMDEF.leaves * 18 * 1);
                        
    let posi   = 0;
    let uvi    = 0;    
    let flexi  = 0;
    let indexi = 0;

    for (let g=0; g<PALMDEF.count; g++) {
      let x = 0;
      let y = 0;
      let z = 0;
      
      do {
        // Palms in the center of the terrain
        let pos = MathHelper.randomInCircle();
        x = MAPSIZE / 2 + pos.x * MAPSIZE/6;
        z = MAPSIZE / 2 + pos.y * MAPSIZE/6;
        y = heightField.getHeight(x, z, MAPSIZE, MAPSIZE/4, WATERLEVEL);
      } while(z > Math.random()*MAPSIZE*MAPSIZE ||
              y < PALMDEF.fromHeight * MAPSIZE || 
              y > PALMDEF.toHeight   * MAPSIZE ||
              objectTracker.getNearestObject(x,z, 3) ||
              (Math.abs(x-MAPSIZE / 2)<5 && Math.abs(z-MAPSIZE / 2)<5))

      objectTracker.addObject(x,z,1);
      
      let height = heightField.getHeight(x, z, MAPSIZE, MAPSIZE/4, WATERLEVEL) * MAPSCALE;
        
      let rotation = Math.random()*Math.PI*2;
      let size = 0;
      
      for (let leaf=0;leaf<PALMDEF.leaves; leaf++) {
      
        let vertices = [ { x:-0.4*PALMDEF.scale, y:0.00*PALMDEF.scale, z:-0.50*PALMDEF.scale, u:0.25, v:0.00 },
                         { x: 0.0*PALMDEF.scale, y:0.00*PALMDEF.scale, z: 0.05*PALMDEF.scale, u:0.50, v:0.00 },
                         { x:+0.4*PALMDEF.scale, y:0.00*PALMDEF.scale, z:-0.50*PALMDEF.scale, u:0.75, v:0.00 },
                         { x:-0.4*PALMDEF.scale, y:0.75*PALMDEF.scale, z: 0.30*PALMDEF.scale, u:0.25, v:0.30 },
                         { x: 0.0*PALMDEF.scale, y:0.80*PALMDEF.scale, z: 0.30*PALMDEF.scale, u:0.50, v:0.30 },
                         { x:+0.4*PALMDEF.scale, y:0.75*PALMDEF.scale, z: 0.30*PALMDEF.scale, u:0.75, v:0.30 },
                         { x:-0.4*PALMDEF.scale, y:0.95*PALMDEF.scale, z: 0.55*PALMDEF.scale, u:0.25, v:0.45 },
                         { x: 0.0*PALMDEF.scale, y:1.00*PALMDEF.scale, z: 0.55*PALMDEF.scale, u:0.50, v:0.45 },
                         { x:+0.4*PALMDEF.scale, y:0.95*PALMDEF.scale, z: 0.55*PALMDEF.scale, u:0.75, v:0.45 },
                         { x:-0.4*PALMDEF.scale, y:1.00*PALMDEF.scale, z: 0.80*PALMDEF.scale, u:0.25, v:0.60 },
                         { x: 0.0*PALMDEF.scale, y:1.10*PALMDEF.scale, z: 0.80*PALMDEF.scale, u:0.50, v:0.60 },
                         { x:+0.4*PALMDEF.scale, y:1.00*PALMDEF.scale, z: 0.80*PALMDEF.scale, u:0.75, v:0.60 },
                         { x:-0.4*PALMDEF.scale, y:1.15*PALMDEF.scale, z: 1.10*PALMDEF.scale, u:0.25, v:0.75 },
                         { x: 0.0*PALMDEF.scale, y:1.20*PALMDEF.scale, z: 1.10*PALMDEF.scale, u:0.50, v:0.75 },
                         { x:+0.4*PALMDEF.scale, y:1.15*PALMDEF.scale, z: 1.10*PALMDEF.scale, u:0.75, v:0.75 },
                         { x:-0.4*PALMDEF.scale, y:1.17*PALMDEF.scale, z: 1.35*PALMDEF.scale, u:0.25, v:0.99 },
                         { x: 0.0*PALMDEF.scale, y:1.15*PALMDEF.scale, z: 1.35*PALMDEF.scale, u:0.50, v:0.99 },
                         { x:+0.4*PALMDEF.scale, y:1.17*PALMDEF.scale, z: 1.35*PALMDEF.scale, u:0.75, v:0.99 },
                       ];

        rotation += (1+Math.random()/2)*Math.PI/2;
        let sin = Math.sin(rotation);
        let cos = Math.cos(rotation);
        
        size += 1/PALMDEF.leaves;
        
        // Create all vertices
        for (let i=0; i<18; i++) {
          let v = vertices[i];

          // Palm size is in world units!! I.e. bigger world same size palms
          let vx = v.x * (0.5+size);
          let vz = v.z * (1.25-size/2);
          v.y    = v.y * (0.5+size);
          v.x  = cos*vx - vz*sin;
          v.z  = sin*vx + vz*cos;

          position[posi++] = v.x + (x-MAPSIZE/2) * MAPSCALE;
          position[posi++] = v.y + height;
          position[posi++] = v.z + (MAPSIZE/2-z) * MAPSCALE;
          flex[flexi++] = -v.y/3;   // Negative means will not be influenced by player, only wind
          uv[uvi++] = v.u;
          uv[uvi++] = v.v;            
        }

        let vertexOffset = (g * PALMDEF.leaves + leaf) * 18 ;
        for (let level=0; level<5; level++) {
          for (let half=0; half<2; half++ )   {
            index[indexi++] = vertexOffset + level * 3 + half + 0;
            index[indexi++] = vertexOffset + level * 3 + half + 3;
            index[indexi++] = vertexOffset + level * 3 + half + 4;

            index[indexi++] = vertexOffset + level * 3 + half + 4;
            index[indexi++] = vertexOffset + level * 3 + half + 1;
            index[indexi++] = vertexOffset + level * 3 + half + 0;        
          }
        }
       
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
    geometry.setAttribute( 'uv',       new THREE.Float32BufferAttribute( uv, 2) );
    geometry.setAttribute( 'flex',     new THREE.Float32BufferAttribute( flex, 1) );
    geometry.uvsNeedUpdate = true;
    geometry.setIndex( index );

    // Add the groups for each material
    geometry.addGroup(0, index.length, 0);

    geometry.computeBoundingBox();

    //                         createMaterial(map, side, vertexColors, alphaTest, flex)
    let material = [MeshHelper.createMaterial(palmMap, THREE.DoubleSide, false, true, true)];

    let mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }
}  