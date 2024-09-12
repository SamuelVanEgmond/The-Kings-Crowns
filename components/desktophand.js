/* global AFRAME */  
/* global THREE */  
/* global World */
/* global MAPSIZE */

AFRAME.registerComponent('desktop-hand', {
  schema: {
    camerarig: { default: "#camerarig" },
    camera: { default: "#camera" },
    fly: { default: false }
  },

  init: function () {
  },
  
  tick: function(time, timeDelta) {     
    // Check if the in VR hands are not visible, then show the desktop hand 
    let leftHand = document.getElementById("righthand").object3D;
    if (leftHand && !leftHand.visible && !this.el.object3D.visible) {
      this.el.object3D.visible = true;
      this.el.object3D.position.set(0.2,-0.25, -0.45);
      this.el.object3D.rotation.set(0,Math.PI/2,Math.PI/2);
      this.el.object3D.parent = this.el.sceneEl.camera;
    }
    else if (leftHand && leftHand.visible) {
      this.el.object3D.visible = false;
    }
  },
  
  ///////////////////////////////////////////////////////
  
  play: function () {
    this.attachEventListeners();
  },

  pause: function () {
    this.removeEventListeners();
  },

  remove: function () {
    this.pause();
  },

  attachEventListeners: function () {
    let sceneEl = this.el.sceneEl;
    let canvasEl = sceneEl.canvas;

    // Wait for canvas to load.
    if (!canvasEl) {
      sceneEl.addEventListener('render-target-loaded', this.addEventListeners.bind(this));
      return;
    }

    canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this), false);
    canvasEl.addEventListener('touchstart', this.onMouseDown.bind(this), false);
    window.addEventListener('mouseup', this.onMouseUp.bind(this), false);
    window.addEventListener('touchend', this.onMouseUp.bind(this), false);
  },

  removeEventListeners: function () {
    let sceneEl = this.el.sceneEl;
    let canvasEl = sceneEl.canvas;

    if (canvasEl) {
      canvasEl.removeEventListener('mousedown', this.onMouseDown);
      canvasEl.removeEventListener('touchstart', this.onMouseDown);
      window.removeEventListener('mouseup', this.onMouseUp);
      window.removeEventListener('touchend', this.onMouseUp);
    }
  },

  onMouseDown: function (event) {
    this.el.components['hand-controls'].playAnimation('Fist', 'Open', false);
    this.emit('grab');
  },

  onMouseUp: function (event) {
    this.el.components['hand-controls'].playAnimation('Open', 'Fist', false);
    this.emit('release');
  },

  emit: function (eventName) {
    this.el.emit(eventName);
  }

});

