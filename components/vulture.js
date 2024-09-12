/* global AFRAME */
/* global THREE */
/* global World */

"use strict";

AFRAME.registerComponent("vulture", {
  init: function () {
    this.el.setObject3D('mesh', World.vultureMesh);
  },
});