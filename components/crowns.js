/* global THREE */
/* global AFRAME */
/* global World */

AFRAME.registerComponent("crowns", {        

  init: function () {
    this.crownsDef = 'DDDDDDDNNNNNNXXXXXXXXXXXXX';
    //this.crownsDef = 'DNX'.repeat(100);
    this.crownTypes = { D:'day', N:'night', X:'devil' };
    let el = this.el;
    let loader = new THREE.GLTFLoader();
    const geometry = new THREE.CylinderGeometry( 0.22, 0.2, 0.15, 16, 1, true); 
    const material = new THREE.MeshStandardMaterial( { color: 0xffffff, metalness:1, roughness:0.1, side:THREE.DoubleSide } );

    // There should be 13 real crowns and 13 devil crowns but if there are not enough stones there will be less (e.g. during testing)
    this.count = Math.min(this.crownsDef.length, World.stones.length);
    
    this.crowns = new THREE.InstancedMesh(geometry, material, this.count);
    this.crowns.frustumCulled = false;

    for (let i = 0; i < this.count; i++) {
      World.stones[i].crown = { type:this.crownTypes[this.crownsDef[i]], found:false, 
                                position: { x:World.stones[i].x, y:World.stones[i].y+1.1, z:World.stones[i].z },
                                height: 0,
                                angle: Math.random() * Math.PI * 2
                              };
    }
    this.tick();
    this.el.object3D.add(this.crowns)
    
    this.handleEvents();
  },
  
  tick(time, timeDelta) {
    let day = 0.5-Math.cos(World.timeOfDay*Math.PI*2)/2;
    let night = 1-day;
    
    let position = new THREE.Vector3()
    let quat = new THREE.Quaternion();
    let scale = new THREE.Vector3(1,1,1)
    let euler = new THREE.Euler(0, 0, 0, "XYZ");
    let mtx = new THREE.Matrix4();
    
    for (let i = 0; i < this.count; i++) {
      let crown = World.stones[i].crown;
      let found = crown.found;

      // Highlight day crowns at night and vice versa
      let highlight = !found && ((crown.type === 'day' && World.dayState === 'night') || (crown.type === 'night' && World.dayState === 'day'));
          
      // Found crowns float higher
      crown.height = (crown.height * 29 + (crown.found ? 0.5 : 0))/30;
      
      // Highlighted crowns turn slower (so color blind players can still tell the difference regardless of the colors)
      crown.angle = (crown.angle + 0.04 + -highlight*0.02) % (Math.PI * 2);

      // Set the transformation matrix for the instance
      position.set(crown.position.x, crown.position.y+crown.height+Math.sin(crown.angle)*0.03, crown.position.z);      
      euler.set(0, crown.angle, 0.1)
      quat.setFromEuler(euler);
      mtx.compose(position, quat, scale);
      this.crowns.setMatrixAt(i, mtx)

      let crownDay   = crown.type === 'day'   ? night : 0;  // Show day crown yellow at night
      let crownNight = crown.type === 'night' ? day   : 0;  // Show night crown blue at day
      
      // Show crown color or green when found
      this.crowns.setColorAt(i, new THREE.Color(found?0:(0.5+(crownDay-crownNight)*0.5), found?1:0.75, found?0:(0.5-(crownDay-crownNight)*0.5)));
    }
    this.crowns.instanceMatrix.needsUpdate = true;
    this.crowns.instanceColor.needsUpdate  = true;
  },
  
  //////////////////////
  
  handleEvents() {
    this.left = document.getElementById("lefthand");
    this.right = document.getElementById("righthand");
    this.desktop = document.getElementById("desktophand");
    this.handPosition = new THREE.Vector3();
    this.left.addEventListener('gripdown', this.grabLeft.bind(this));    
    this.right.addEventListener('gripdown', this.grabRight.bind(this));    
    this.desktop.addEventListener('grab', this.grabDesktop.bind(this));    
    this.left.addEventListener('thumbup', this.grabLeft.bind(this));    
    this.right.addEventListener('thumbup', this.grabRight.bind(this));    
    this.left.addEventListener('pointup', this.grabLeft.bind(this));    
    this.right.addEventListener('pointup', this.grabRight.bind(this));    
  },
  
  grabLeft() {
    this.left.object3D.getWorldPosition(this.handPosition);
    this.grab();
  },
  
  grabRight() {
    this.right.object3D.getWorldPosition(this.handPosition);
    this.grab();
  },

  grabDesktop() {
    this.desktop.object3D.getWorldPosition(this.handPosition);
    this.grab();
  },
  
  grab() {
    for (let i = 0; i < this.count; i++) {
      let stone = World.stones[i];
      if (Math.sqrt((stone.x-this.handPosition.x)**2 + (stone.y+1.2-this.handPosition.y)**2 + (stone.z-this.handPosition.z)**2)<0.5) {
        if (!stone.crown.found) {
          if (World.dayState === stone.crown.type) {
            stone.crown.found = true;        
            document.getElementById("player").components.player.crown(stone.crown.type);
            break;
          }
          else {
            document.getElementById("player").components.player.kill(stone.crown.type);
          }
        }
      };
    }
  }

})