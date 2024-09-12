/* global THREE */
/* global startWind */
/* global SplashScreen */
/* global FLY */

document.body.innerHTML = `
<a-scene id="scene" renderer="colorManagement: true; foveationLevel:0.5;" background="color:#D9E6FF" fog="type: linear; color: #BCD; near: 75; far: 300;" light="defaultLightsEnabled: false">
  <a-entity id="player" player>
    <a-sphere id="devilfire" follow radius="1" visible="false" segments-height="9" segments-width="18" shader="fireshader" material="color1:#F00; color2:#FA5; transparent:true; side:back;"></a-sphere>
    <a-sphere id="dayfire"   follow radius="1" visible="false" segments-height="9" segments-width="18" shader="fireshader" material="color1:#FA5; color2:#FF0; transparent:true; side:back;"></a-sphere>
    <a-sphere id="nightfire" follow radius="1" visible="false" segments-height="9" segments-width="18" shader="fireshader" material="color1:#008; color2:#5AF; transparent:true; side:back;"></a-sphere>
  </a-entity>
  <a-entity id="camerarig">
    <a-entity id="camera" position="0 1.6 0" xr-camera-switcher camera look-controls="pointerLockEnabled:true;">
      <a-text id="title" position="0 0 -0.75" width="1.2" align="center" anchor="align" color="#FFF" font="mozillavr"></a-text>
      <a-text fps-counter position="0 +0.1 -0.25" width="0.25"></a-text>
    </a-entity>
    <a-entity id="lefthand" hand-controls="hand: left; handModelStyle: lowPoly; color: #234" movecontrols="camerarig:#camerarig; camera:#camera; fly:${FLY};">
      <a-cylinder radius="0.05" height="0.3" segments-height="1" segments-radial-"10" open-ended="true"
                  position="0.005 0.25 -0.005" scale="0.65 1 1"
                  material="roughness:1; metalness:0.5; side:double" color="#300"></a-cylinder>
      <a-cylinder radius="0.05" height="0.05" segments-height="1" segments-radial-"10" open-ended="true"
                  position="0.005 0.1 -0.005" scale="0.68 1 1.03"
                  material="roughness:1; metalness:0.5; side:double" color="#000"></a-cylinder>
    </a-entity> 
    <a-entity id="righthand" hand-controls="hand: right; handModelStyle: lowPoly; color: #234" movecontrols="camerarig:#camerarig; camera:#camera; fly:${FLY};">
      <a-cylinder radius="0.05" height="0.3" segments-height="1" segments-radial-"10" open-ended="true"
                  position="-0.005 0.25 -0.005" scale="0.65 1 1"
                  material="roughness:1; metalness:0.5; side:double" color="#300"></a-cylinder>
      <a-cylinder radius="0.05" height="0.05" segments-height="1" segments-radial-"10" open-ended="true"
                  position="-0.005 0.1 -0.005" scale="0.68 1 1.03"
                  material="roughness:1; metalness:0.5; side:double" color="#000"></a-cylinder>
    </a-entity> 
    <a-entity id="desktophand" hand-controls="hand: right; handModelStyle: lowPoly; color: #234" desktop-hand movecontrols="camerarig:#camerarig; camera:#camera; fly:${FLY};">
      <a-cylinder radius="0.05" height="0.3" segments-height="1" segments-radial-"10" open-ended="true"
                  position="-0.005 0.25 -0.005" scale="0.65 1 1"
                  material="roughness:1; metalness:0.5; side:double" color="#300"></a-cylinder>
      <a-cylinder radius="0.05" height="0.05" segments-height="1" segments-radial-"10" open-ended="true"
                  position="-0.005 0.1 -0.005" scale="0.68 1 1.03"
                  material="roughness:1; metalness:0.5; side:double" color="#000"></a-cylinder>
    </a-entity> 
  </a-entity>
  <a-entity world palms pines ferns grass stones crowns terrain></a-entity>
  <a-entity vulture position="50 100 -50"
            animation__rotate="property: rotation; from: 0 0 0; to: 0 360 0; loop: true; dur: 20000; easing:linear;">
  </a-entity>
  <a-entity id="sky" material="shader:skyshader; side:back;" geometry="primitive:sphere; thetaLength:90; radius:500; segmentsWidth: 40; segmentsHeight: 20;" follow scale="1 0.5 1"></a-entity>

  <a-entity light="type: ambient; color: #FFF; intensity: 0.6;"></a-entity>
  <a-entity light="type: directional; color: #FFF; intensity: 1;" position="1 1 -1"></a-entity>
  <a-box scale="0.4 200 0.4" position="0 104.5 0" color="#5AF" material="shader:flat;blending:additive;" opacity="0.1"></a-box>
</a-scene>
`;

// Set the environment map for standard materials without a specific environment map
// Simple tiny (64 x 32 size texture) smaller does not work!?
let scene = document.getElementById('scene');
let environment = new THREE.TextureLoader().load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAgAgMAAADf85YXAAAACVBMVEXAwMD///9gYGAdIplaAAAAH0lEQVQoz2PQYBBBwZgCaHwNDAHCChgIWjPqjsHpDgDj8R4BQIulcgAAAABJRU5ErkJggg==");
environment.encoding = THREE.sRGBEncoding;
environment.mapping = THREE.EquirectangularReflectionMapping;
scene.object3D.environment = environment;

document.getElementById('scene').addEventListener('enter-vr', function () {
  startWind();
}); 
document.getElementById('scene').addEventListener('click', function () {
  startWind();
  return false;
}); 


