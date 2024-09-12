/* global THREE */
/* global LIGHTDIR */
/* global AMBIENTLIGHT */
/* global FlexShader */

// Normalize the light direction
let lightLen = Math.sqrt(LIGHTDIR.x * LIGHTDIR.x + LIGHTDIR.y * LIGHTDIR.y + LIGHTDIR.z * LIGHTDIR.z);
LIGHTDIR = { x: LIGHTDIR.x / lightLen, y: LIGHTDIR.y / lightLen, z: LIGHTDIR.z / lightLen };

class MeshHelper {
  
  // Returns 0-1
  static calculateLight(normal) {
    let dot =
      LIGHTDIR.x * normal.x +
      LIGHTDIR.y * normal.y +
      LIGHTDIR.z * normal.z;        
    let light = Math.max(0, dot) * 2;  // Very bright sun!

    // Add ambient light
    light += 0.5;
    
    light = Math.min(1, light);
    
    return light; 
  }
  
  static createMaterial(map, side, vertexColors, alphaTest, flex) {
    let material = new THREE.MeshBasicMaterial({
      side: side,
      vertexColors: vertexColors,
      alphaTest: alphaTest ? 0.1 : 1,
      alphaToCoverage: alphaTest,
      map: (function() {
        let texture = new THREE.CanvasTexture(map);
        texture.colorSpace = THREE.SRGBColorSpace
        return texture;
      }).bind(this)()
    });
    
    if (flex) {
      material.onBeforeCompile = FlexShader.shaderModifier;
    }
    
    // Material Color is by default set instead of reused, so make sure it is reused
    material.color = AMBIENTLIGHT;
    
    return material;
  }  
}

