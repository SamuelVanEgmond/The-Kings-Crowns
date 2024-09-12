/* global THREE */
/* global AFRAME */
/* global World*/

"use strict";

AFRAME.registerComponent("palms", {
  dependencies: [],
  schema: {  },
  init: function () {
    this.el.setObject3D('palms', World.palmsMesh);
    
    // The flex shader uniforms are set by the grass component
    
    // For debugging
    //this.wire = new THREE.Mesh( this.mesh.geometry, new THREE.MeshBasicMaterial({ color:'red', wireframe:true }));
    //this.el.setObject3D('wire', this.wire);    
  }

});