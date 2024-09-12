"use strict";

/* global AFRAME */
/* global noiseFunctions */

AFRAME.registerShader('fireshader', {
  schema: {
      time:   { type: 'time',  is: 'uniform' },
      height: { type: 'float', is: 'uniform', default: 0.5 },  // 0 - 1  
      color1: { type: 'color', is: 'uniform', default: 'yellow'},
      color2: { type: 'color', is: 'uniform', default: 'orange'}
  },

  vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;
      void main(void) {
          vUv = uv;
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,

  fragmentShader: 
    noiseFunctions + `
      varying vec2 vUv;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float time;
      uniform float height;
      varying vec3 vPos;
      void main(void) {
          float f = noise(vPos*vec3(4.,1.,4.)-vec3(0.,time/250.,0.))*0.75 + noise(vPos*vec3(8.,2.,8.)-vec3(0.,time/250.,0.))*0.5 + noise(vPos*vec3(16.,4.,16.)-vec3(0.,time/250.,0.))*0.25;
          gl_FragColor = vec4(mix(color1, color2, f+vPos.y/5.), f+(4.*height-2.)-vPos.y/2.);
      }
  `
});
