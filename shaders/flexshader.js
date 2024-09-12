"use strict";

class FlexShader {

    static uniforms = {   // Just ignore 'unexpected token =' error in glitch editor, it doesn't understand static members.
      //time:      { value: 0.0 },
      time: { type: 'time', is: 'uniform' },
      playerpos: new THREE.Uniform( new THREE.Vector3() )
    };
    
    static shaderModifier(shader) { 
      shader.uniforms.time = FlexShader.uniforms.time;
      shader.uniforms.playerpos = FlexShader.uniforms.playerpos;
      shader.vertexShader = `
        in float flex;  // Negative means the vertex will only be flexed by wind, not by the player
        uniform float time;
        uniform vec3 playerpos;
        ${shader.vertexShader}
      `.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
          // Grass waves in the wind, negative flex is for the palms which is not affected by the player and moves slower
          float t = flex < 0. ? time / 2. : time;
          transformed += vec3(sin(t+transformed.x/5.)*sin(t+transformed.z/7.) * abs(flex)*0.25, 0., 0.);
          
          // Move the grass out of the way of the player in a radius of 2
          const float radius = 2.;
          float distance = length(transformed.xz - playerpos.xz);
          if (distance < radius && flex > 0.) {
            float offset = min(flex, (radius - distance) * flex);
            transformed.xz += normalize(transformed.xz - playerpos.xz) * offset;
            transformed.y  -= offset * .5;
          } 
        `);
    };
}