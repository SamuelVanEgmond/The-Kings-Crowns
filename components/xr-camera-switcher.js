/* global THREE */
/* global AFRAME */

// Component to switch between cameras when entering / exiting VR
AFRAME.registerComponent('xr-camera-switcher', {
  init: function () {
    let sceneEl  = this.el.sceneEl;
    let cameraEl = this.el;
    let rigEl    = this.el.parentEl;
    

    if (rigEl) {

      // Determine and compensate the camera height (sitting or standing)
      sceneEl.addEventListener('enter-vr', () => {
        setTimeout(function() {
          let camPos = new THREE.Vector3(); 
          cameraEl.object3D.getWorldPosition(camPos);
          
          let height = cameraEl.object3D.position.y;
          rigEl.object3D.position.set(camPos.x, camPos.y-height, camPos.z);
          cameraEl.object3D.position.set(0, height, 0);
        }, 20);
      });

      // On exit VR reset the camera and controls
      sceneEl.addEventListener('exit-vr', () => {
        setTimeout(function() {
          let camPos = new THREE.Vector3(); 
          cameraEl.object3D.getWorldPosition(camPos);

          rigEl.object3D.position.set(camPos.x, camPos.y-1.6, camPos.z);
          cameraEl.object3D.position.set(0, 1.6, 0);
        }, 20);
      });

    }
  }
});