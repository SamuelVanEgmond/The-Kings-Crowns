/* global THREE */
/* global MeshHelper */
/* global MAPSIZE */
/* global AMBIENTLIGHT */
/* global MAPSCALE */
/* global WATERLEVEL */

"use strict";

class TerrainMeshCreator {
  
  static createMesh(heightField, terrainMap) {
    let geometry = new THREE.BufferGeometry();

    let position = new Float32Array( (MAPSIZE + 1) * (MAPSIZE + 1) * 3);
    let normal   = new Float32Array( (MAPSIZE + 1) * (MAPSIZE + 1) * 3);
    let uv       = new Float32Array( (MAPSIZE + 1) * (MAPSIZE + 1) * 2);
    let posi = 0;
    let normi = 0;
    let uvi  = 0;
    for (let z = 0; z <= MAPSIZE; z++) {
      for (let x = 0; x <= MAPSIZE; x++) {
        let height  = heightField.getHeight(x, z, MAPSIZE, MAPSIZE / 4 * MAPSCALE, WATERLEVEL);  // Heightmap is max MAPSIZE/4 high
        let vnormal = heightField.getNormal(x, z, MAPSIZE, MAPSIZE / 4 * MAPSCALE, WATERLEVEL);
        position[posi++] = (x-MAPSIZE/2) * MAPSCALE;
        position[posi++] = height;
        position[posi++] = (MAPSIZE/2-z) * MAPSCALE;
        normal[normi++] = vnormal.x;
        normal[normi++] = vnormal.y;
        normal[normi++] = vnormal.z;
        uv[uvi++] = x / MAPSIZE;
        uv[uvi++] = 1 - z / MAPSIZE;
      }
    }

    let index = [];
    let i = 0;
    for (let z = 0; z < MAPSIZE; z++) {
      for (let x = 0; x < MAPSIZE; x++) {
        index[i++] = (z + 1) * (MAPSIZE + 1) + (x    );
        index[i++] = (z    ) * (MAPSIZE + 1) + (x    );
        index[i++] = (z    ) * (MAPSIZE + 1) + (x + 1);

        index[i++] = (z    ) * (MAPSIZE + 1) + (x + 1);
        index[i++] = (z + 1) * (MAPSIZE + 1) + (x + 1);
        index[i++] = (z + 1) * (MAPSIZE + 1) + (x    );
      }
    }

    // Set the geometry attribute buffers
    // Since this is MeshBAsicMaterial, no need for normals
    // Since we are using textures no need for colors
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3) );
    geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normal, 3) );
    geometry.setAttribute( 'uv',       new THREE.Float32BufferAttribute( uv, 2) );
    geometry.uvsNeedUpdate = true;
    geometry.setIndex( index );

    // Add the groups for each material
    geometry.addGroup(0, index.length, 0);

    geometry.computeBoundingBox();

    //                         createMaterial(map, side, vertexColors, alphaTest, flex)
    let material = [MeshHelper.createMaterial(terrainMap, THREE.FrontSide, false, false, false)];

    let mesh = new THREE.Mesh(geometry, material);
    
    return mesh;
  }

}