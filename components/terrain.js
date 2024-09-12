/* global AFRAME */
/* global THREE */
/* global World */
/* global MAPSIZE */
/* global MAPSCALE */
/* global WATERLEVEL */
/* global World */


"use strict";

AFRAME.registerComponent("terrain", {
  init: function () {
    this.el.setObject3D('terrain', World.terrainMesh);
    
    //this.normals = new THREE.VertexNormalsHelper( this.mesh, 1, 0xff0000 );
    //this.el.setObject3D('normals', this.normals);
    
  },

});