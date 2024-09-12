/* global AFRAME */
/* global THREE */
/* global World */

"use strict";

AFRAME.registerComponent("stones", {
  init: function () {
    this.el.setObject3D('mesh', World.stonesMesh);
  }
});