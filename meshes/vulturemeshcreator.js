/* global THREE */
/* global MeshHelper */


"use strict";

class VultureMeshCreator {

  static createMesh(vultureMap) {    
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [-26,0,-3,-20,0,-3,-20,0,3,-26,0,3,  26,0,3,20,0,3,20,0,-3,26,0,-3], 3) );
    geometry.setAttribute( 'uv',       new THREE.Float32BufferAttribute( [0,0,1,0,1,1,0,1, 0,0,1,0,1,1,0,1], 2) );
    geometry.uvsNeedUpdate = true;
    geometry.setIndex( [0,1,2,2,3,0, 4,5,6,6,7,4] );

    // Add the groups for each material
    geometry.addGroup(0, 12, 0);

    geometry.computeBoundingBox();

    //                         createMaterial(map, side, vertexColors, alphaTest, flex)
    let material = [MeshHelper.createMaterial(vultureMap, THREE.FrontSide, false, true, false)];    

    let mesh = new THREE.Mesh(geometry, material);

    return mesh;
  }
  
}