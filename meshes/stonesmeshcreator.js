/* global THREE */
/* global MathHelper */
/* global MeshHelper */
/* global World */
/* global AMBIENTLIGHT */
/* global STONEDEF */
/* global MAPSIZE */
/* global LIGHTMAPSIZE */
/* global MAPSCALE */
/* global WATERLEVEL */
/* global FlexShader */
/* global mapToGround */
/* global unitToGround */
/* global mapToLight */

"use strict";

class StonesMeshCreator {
  
  static createMesh(heightField, lightMap, objectTracker, terrainMap, stoneMap) {
    // The lightmap is used to darken stones in the shadows
    let ctxLight = lightMap.getContext('2d', { willReadFrequently:true });
    let imageDataLight = ctxLight.getImageData(0, 0, LIGHTMAPSIZE, LIGHTMAPSIZE);
    let lightData = imageDataLight.data;     
    
    // The stone shadows are drawn on the terrain
    let ctxTerrain = terrainMap.getContext('2d', { willReadFrequently:true });
    
    // Begin path for all stone shadows
    ctxTerrain.beginPath();    

    // I copied the stone geometry from my js13kGames entry of last year, Medieval Matchup, which was based around these stones
    // Normals not for the mesh but to calculate the lighting
    // UV coordinates have been manpulated so all sides look lit from the direction of the sun
    let defposition = [-.5,-.4,-.4,-.5,-.4,-.4,-.5,.4,-.4,-.5,.4,-.4,-.5,.4,.4,-.5,.4,.4,-.5,-.4,.4,-.5,-.4,.4,.5,-.4,.4,.5,-.4,.4,.5,.4,.4,.5,.4,.4,.5,.4,-.4,.5,.4,-.4,.5,-.4,-.4,.5,-.4,-.4,-.4,-.5,-.4,-.4,-.5,-.4,-.4,-.5,.4,-.4,-.5,.4,.4,-.5,.4,.4,-.5,.4,.4,-.5,-.4,.4,-.5,-.4,-.4,.5,.4,-.4,.5,.4,-.4,.5,-.4,-.4,.5,-.4,.4,.5,-.4,.4,.5,-.4,.4,.5,.4,.4,.5,.4,.4,-.4,-.5,.4,-.4,-.5,.4,.4,-.5,.4,.4,-.5,-.4,.4,-.5,-.4,.4,-.5,-.4,-.4,-.5,-.4,-.4,-.5,-.4,-.4,.5,-.4,-.4,.5,-.4,.4,.5,-.4,.4,.5,.4,.4,.5,.4,.4,.5,.4,-.4,.5,.4,-.4,.5];
    let defnormal   = [-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,-1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1,0,0,1];
    let defuv       = [1,0,.0001,.0001,1,1,.0001,.0001,0,1,.0001,.0001,0,0,.0001,.0001,0,0,.0001,.0001,0,1,.0001,.0001,1,1,.0001,.0001,1,0,.0001,.0001,0,0,.0001,.0001,0,1,.0001,.0001,1,1,.0001,.0001,1,0,.0001,.0001,0,1,.0001,.0001,1,1,.0001,.0001,1,0,.0001,.0001,0,0,.0001,.0001,1,0,.0001,.0001,1,1,.0001,.0001,0,1,.0001,.0001,0,0,.0001,.0001,0,0,.0001,.0001,0,1,.0001,.0001,1,1,.0001,.0001,1,0,.0001,.0001];
    let defindex    = [2,0,4,6,4,0,10,8,12,14,12,8,18,16,20,22,20,16,26,24,28,30,28,24,34,32,36,38,36,32,42,40,44,46,44,40,25,43,31,45,31,43,31,11,29,13,29,11,29,35,27,37,27,35,27,3,25,5,25,3,25,5,43,31,45,11,29,13,35,27,37,3,7,41,5,43,5,41,47,9,45,11,45,9,15,33,13,35,13,33,39,1,37,3,37,1,19,41,7,21,9,47,23,33,15,17,1,39,41,19,47,21,47,19,9,21,15,23,15,21,33,23,39,17,39,23,1,17,7,19,7,17];
    
    let geometry = new THREE.BufferGeometry();

    let position = new Float32Array( STONEDEF.count * 132 * 3);
    let color    = new Float32Array( STONEDEF.count * 132 * 3);    
    let uv       = new Float32Array( STONEDEF.count * 132 * 2);
    let index    = [];
    
    let posi   = 0;
    let coli   = 0;
    let uvi    = 0;    
    let indexi = 0;
    
    let fixed = [
      { x:-1.5, y:0, z:0 },
      { x:-1.5, y:1, z:0 },
      { x:-1.5, y:2, z:0 },
      { x:-1.5, y:3, z:0 },
      { x:-1.5, y:4, z:0 },
      { x:-0.5, y:4, z:0 },
      { x: 0.5, y:4, z:0 },
      { x: 1.5, y:4, z:0 },
      { x: 1.5, y:3, z:0 },
      { x: 1.5, y:2, z:0 },
      { x: 1.5, y:1, z:0 },
      { x: 1.5, y:0, z:0 },
      { x: 1.5, y:0, z:0 },
      
      { x: -77, y: 0, z:-77 },
      { x: -76, y: 0, z:-77.2 },
      { x: -77.1, y: 0, z:-76 },
      { x: -77, y: 1, z:-77 },
      { x: -77, y: 2, z:-77 }

    ];
    
    World.stones = [];
    
    for (let g=0; g<fixed.length + STONEDEF.count; g++) {    
      let x = 0;
      let y = 0;
      let z = 0;
      
      do {
        // Stones are distributed over the entire terrain
        x = Math.random() * MAPSIZE;
        z = Math.random() * MAPSIZE;
        y = heightField.getHeight(x, z, MAPSIZE, MAPSIZE/4, WATERLEVEL);
      } while(z > Math.random()*MAPSIZE*MAPSIZE ||
              y < STONEDEF.fromHeight * MAPSIZE || 
              y > STONEDEF.toHeight   * MAPSIZE ||
              objectTracker.getNearestObject(x,z, 2))
            
      let height = heightField.getHeight(x, z, MAPSIZE, MAPSIZE/4, WATERLEVEL) * MAPSCALE;
        
      // Rotate the stones but keep them oriented correctly towards the sun because of the texture lighting
      let rotation = Math.random()*Math.PI/3-Math.PI/6;

      let yOffset = 0;
      if (g<fixed.length) {
        x = fixed[g].x + MAPSIZE/2;
        height = 0;
        yOffset = fixed[g].y
        z = fixed[g].z + MAPSIZE/2;
        rotation = 0;
      }
      else {
        World.stones.push( { x:(x-MAPSIZE/2) * MAPSCALE, y:height + yOffset, z:(MAPSIZE/2-z) * MAPSCALE, crown:false });
      }
      
      if (yOffset === 0) {
        objectTracker.addObject(x,z,0.75);
      }

      let sin = Math.sin(rotation);
      let cos = Math.cos(rotation);

      let startIndex = posi/3;
      for (let i=0; i<defposition.length; i+=3) {
        let px = cos*defposition[i+0] - sin*defposition[i+2];
        let py =     defposition[i+1];
        let pz = sin*defposition[i+0] + cos*defposition[i+2];
        position[posi++] = px + (x-MAPSIZE/2) * MAPSCALE;
        position[posi++] = py + 0.45 + height + yOffset;
        position[posi++] = pz + (MAPSIZE/2-z) * MAPSCALE;        
      }
      
      let shadow = lightData[(Math.round(mapToLight(z))*LIGHTMAPSIZE + Math.round(mapToLight(x)))*4]/255;
      for (let i=0; i<defnormal.length; i+=3) {
        let nx = cos*defnormal[i+0] - sin*defnormal[i+2];
        let ny = defnormal[i+1];
        let nz = sin*defnormal[i+0] + cos*defnormal[i+2];
        let occlusion = yOffset>0 ? 1 : Math.min(1,defposition[i+1]+0.7);
        
        // Reverse x because I made a mistake somewhere in the heightfield / canvas directions, so fix here
        let light = Math.min(1, MeshHelper.calculateLight( { x:-nx, y:ny, z:nz } ));
        color[coli++] = light*1.0*shadow*occlusion;
        color[coli++] = light*0.7*shadow*occlusion;
        color[coli++] = light*0.4*shadow*occlusion;
      }

      for (let i=0; i<defuv.length; i+=2) {
        uv[uvi++] = defuv[i+0];
        uv[uvi++] = defuv[i+1];
      }
      
      index.push(...defindex.map(ind => startIndex+ind));
      
      // Now draw the shadow (box is 1x1x1, so 0.5 = corners from center, sin & cos rotate in x-z)
      let c = cos*0.5;///MAPSCALE;
      let s = sin*0.5;///MAPSCALE;
      ctxTerrain.moveTo(mapToGround(x) + unitToGround(-1*c - -1*s + 0 + yOffset), mapToGround(z) - unitToGround(-1*s + -1*c - 0 - yOffset));
      ctxTerrain.lineTo(mapToGround(x) + unitToGround(-1*c -  1*s + 0 + yOffset), mapToGround(z) - unitToGround(-1*s +  1*c - 0 - yOffset));
      ctxTerrain.lineTo(mapToGround(x) + unitToGround( 1*c -  1*s + 0 + yOffset), mapToGround(z) - unitToGround( 1*s +  1*c - 0 - yOffset));
      ctxTerrain.lineTo(mapToGround(x) + unitToGround( 1*c -  1*s + 1 + yOffset), mapToGround(z) - unitToGround( 1*s +  1*c - 1 - yOffset));
      ctxTerrain.lineTo(mapToGround(x) + unitToGround( 1*c - -1*s + 1 + yOffset), mapToGround(z) - unitToGround( 1*s + -1*c - 1 - yOffset));
      ctxTerrain.lineTo(mapToGround(x) + unitToGround(-1*c - -1*s + 1 + yOffset), mapToGround(z) - unitToGround(-1*s + -1*c - 1 - yOffset));
      ctxTerrain.lineTo(mapToGround(x) + unitToGround(-1*c - -1*s + 0 + yOffset), mapToGround(z) - unitToGround(-1*s + -1*c - 0 - yOffset));
    }
    
    ctxTerrain.fillStyle = 'rgba(0,0,0,0.4)';    
    ctxTerrain.fill();

    // Set the geometry attribute buffers
    // Since this is MeshBAsicMaterial, no need for normals
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3) );
    geometry.setAttribute( 'color',    new THREE.Float32BufferAttribute( color, 3) );
    geometry.setAttribute( 'uv',       new THREE.Float32BufferAttribute( uv, 2) );
    geometry.uvsNeedUpdate = true;
    geometry.setIndex( index );

    // Add the groups for each material
    geometry.addGroup(0, index.length, 0);

    geometry.computeBoundingBox();

    //                         createMaterial(map, side, vertexColors, alphaTest, flex)
    let material = [MeshHelper.createMaterial(stoneMap, THREE.FrontSide, true, false, false)];

    let mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }
}  