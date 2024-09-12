/* global AFRAME */
/* global THREE */

"use strict";

/**
 * Add follow component to the skydome entity so it stays centered over the camera
 * It cannot be too big a this will cause drawing artefacts
 * It cannot be a child of the camera as that would make the sky rotate with the camera
 */
AFRAME.registerComponent('follow', {
  tick: function (time, timeDelta) {
    this.el.sceneEl.camera.getWorldPosition(this.el.object3D.position);
  }
});