/* global AFRAME */  
/* global THREE */  
/* global World */
/* global MAPSIZE */

AFRAME.registerComponent('movecontrols', {
    schema: {
      camerarig: { default: "#camerarig" },
      camera: { default: "#camera" },
      fly: { default: false }
    },

    init: function () {
      let data = this.data;
      this.camerarig = document.querySelector(this.data.camerarig);
      this.camera = document.querySelector(this.data.camera);
      this.thumbdirection = 0;
      this.clock = new THREE.Clock();
      this.smoothMove = { x:0, z:0 };
      this.smoothRotate = 0;
      this.localKeys = {};
    
      this.attachEventListeners();
      
      //this.el.addEventListener("axismove", event => {
      //  // Oculus Go 
      //  let axisState = JSON.stringify(event.detail);
//
      //  this.smoothRotate = event.detail.axis[0]; 
      //  this.smoothMove.z = event.detail.axis[1]; 
      //});      
    },
  
  tick: function() {     
    // Smooth move
    let speedX = this.smoothMove.x;
    let speedZ = this.smoothMove.z;
    
    // 0.6 means towards the rim of the track pad
    // 4 Units a second, max 0.25 unit per frame (in case of low frame rates)
    // Use bot thumbsticks at the same time to run
    let delta = this.clock.getDelta();
    speedX = (speedX < -0.6 || speedX > 0.6) ? Math.min(delta * 4, 0.25) * Math.sign(speedX) : 0;
    speedZ = (speedZ < -0.6 || speedZ > 0.6) ? Math.min(delta * 4, 0.25) * Math.sign(speedZ) : 0;     
    
    if (speedX !== 0 || speedZ !== 0) {
      let position = this.camerarig.object3D.position.clone();
      let direction = this.camerarig.object3D.rotation.y + this.camera.object3D.rotation.y;
      let fly = this.data.fly ? -Math.sign(speedZ) * this.camera.object3D.rotation.x * delta * 4: 0;
      let dir = 1;
      do {
        position.z += dir*(-Math.sin(direction) * speedX + Math.cos(direction) * speedZ);
        position.x += dir*(Math.cos(direction) * speedX + Math.sin(direction) * speedZ);
        position.y += dir*(fly);
        this.camerarig.object3D.position.copy(position);
        
        // If we go inside an object just back out
        dir = -0.25;
        
      } while (position.y<3 && World.objectTracker.getNearestObject(position.x+MAPSIZE / 2, -position.z+MAPSIZE / 2, 0));   
    }  

    let rotate = this.smoothRotate;
    rotate = (rotate < -0.6 || rotate > 0.6) ? Math.min(delta, 0.25) * Math.sign(rotate) : 0;
    this.camerarig.object3D.rotation.y -= rotate;
  },
  
  setNewDirection: function(direction) {
    if (direction) {
      //this.camerarig.object3D.rotation.y -= direction * Math.PI / 4;
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
    this.el.addEventListener("thumbstickmoved", this.thumbstickMoved.bind(this));
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
    window.addEventListener("blur", this.onBlur.bind(this));
  },

  removeEventListeners: function () {
    this.el.removeEventListener("thumbstickmoved", this.thumbstickMoved);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
  },
  
  thumbstickMoved: function(event) {
    this.smoothRotate = event.detail.x;
    this.smoothMove.z = event.detail.y;     
  },
 
  onKeyDown: function (event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      if (event.code==="KeyW" || event.code==="ArrowUp")    { this.smoothMove.z = -1; }
      if (event.code==="KeyA" || event.code==="ArrowLeft")  { this.smoothMove.x = -1; }
      if (event.code==="KeyS" || event.code==="ArrowDown")  { this.smoothMove.z = +1; }
      if (event.code==="KeyD" || event.code==="ArrowRight") { this.smoothMove.x = +1; }
      this.emit(event);
    }
  },

  onKeyUp: function (event) {
    if (AFRAME.utils.shouldCaptureKeyEvent(event)) {
      if (event.code==="KeyW" || event.code==="ArrowUp")    { this.smoothMove.z = 0; }
      if (event.code==="KeyA" || event.code==="ArrowLeft")  { this.smoothMove.x = 0; }
      if (event.code==="KeyS" || event.code==="ArrowDown")  { this.smoothMove.z = 0; }
      if (event.code==="KeyD" || event.code==="ArrowRight") { this.smoothMove.x = 0; }
      this.emit(event);
    }
  },

  onBlur: function () {
    for (let code in this.localKeys) {
      if (this.localKeys.hasOwnProperty(code)) {
        delete this.localKeys[code];
      }
    }
  },

  emit: function (event) {
    // Emit convenience event, identifying key.
    this.el.emit(event.type + ':' + event.code, new window.KeyboardEvent(event.type, event));
  }

});

