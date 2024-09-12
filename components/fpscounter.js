/* global AFRAME */

"use strict";

// Usage: <a-text fps-counter position="0 -0.1 -0.25" width="0.25"></a-text>
// Typically inside the camera entity
// Only value and color text properties are set, rest can be used as usual

AFRAME.registerComponent('fps-counter', {
  schema: {},
  init: function () {
    this.framecount = 0;
    this.lasttime = Math.round((new Date()).getTime());
  },
  update: function () {},
  
  tick: function () {
    this.framecount++;
    let now = Math.round((new Date()).getTime());
    if (now - this.lasttime > 500) {
      let fps = Math.round(1000*this.framecount/(now-this.lasttime));
      
      this.el.setAttribute('value', `${fps}`);
      if (fps < 45) this.el.setAttribute('color', '#FF0000'); 
      else if (fps < 55) this.el.setAttribute('color', '#FF8000');
      else this.el.setAttribute('color', '#00FF00');
      
      this.framecount = 0;
      this.lasttime = now;
    }
  },
  
  remove: function () {},
  pause: function () {},
  play: function () {}
});
