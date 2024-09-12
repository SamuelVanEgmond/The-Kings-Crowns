/* global THREE */
/* global AFRAME */
/* global FlexShader */
/* global World */
/* global WORLDSIZE */
/* global GRASSDEF */

"use strict";

AFRAME.registerComponent("grass", {
  init: function () {   
    this.el.setObject3D('grass', World.grassMesh);   
  },
  
  tick: function (time, timedelta) {
    FlexShader.uniforms.time.value = time/750;
    this.el.sceneEl.camera.getWorldPosition(FlexShader.uniforms.playerpos.value);
  }

});