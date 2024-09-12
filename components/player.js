/* global AFRAME */
/* global THREE */
/* global MathHelper */
/* global FLY */
/* global MAPSIZE */
/* global WORLDSIZE */
/* global WATERLEVEL */
/* global unitToMap */
/* global World */

"use strict";

AFRAME.registerComponent('player', {
  schema: {},
  init: function () {
    this.cameraRigEl = document.querySelector('#camerarig');
    this.cameraRig = this.cameraRigEl.object3D;
    this.cameraEl = document.querySelector('[camera]');
    this.camera = this.cameraEl.object3D;
    
    if (this.fire) {
      this.fire.object3D.visible = false;
      this.fire = null;
    }
    
    this.title = document.getElementById("title");
    this.showTitle("The King's Crowns\n\n13 crowns King Alexander possessed\n13 crowns by the Devil oppressed\n13 crowns for Day and Night\n13 crowns that show the King’s might\n13 crowns with a cursed spell\n13 crowns that lead to Hell!\n", 12);
    
    if (!this.spawn) {
      do {
        // Pick a random player spawn position not too close to other objects
        let pos = MathHelper.randomOutCircle(0.5);
        this.spawn = { x: MAPSIZE / 2 + pos.x * MAPSIZE/2,
                       z: MAPSIZE / 2 + pos.y * MAPSIZE/2
                     };
        this.spawn.y = World.heightField.getHeight(this.spawn.x, this.spawn.z, MAPSIZE, MAPSIZE/4, WATERLEVEL);
      } while(this.spawn.y > 0.5 || World.objectTracker.getNearestObject(this.spawn.x, this.spawn.z, 5))            
    }
    this.cameraRigEl.setAttribute('position', `${this.spawn.x-128} ${this.spawn.y} ${-this.spawn.z+128}`); 
  },
  
  update: function () {},
  
  tick: function (time, timeDelta) {
    let cameraPosition = new THREE.Vector3();
    this.el.sceneEl.camera.getWorldPosition(cameraPosition);
    
    // Determine the terrain height at the location of the player
    let groundLevel = World.heightField.getHeight( unitToMap(cameraPosition.x) + MAPSIZE/2, 
                                                  -unitToMap(cameraPosition.z) + MAPSIZE/2, 
                                                   WORLDSIZE, 1, WATERLEVEL);
    
    // Move the player up or down according tho the terrain height
    if (FLY) 
      this.cameraRig.position.y = Math.max(this.cameraRig.position.y, groundLevel * WORLDSIZE / 4);
    else {
      this.cameraRig.position.y = groundLevel * WORLDSIZE / 4;

      // Don't allow the player to go higher than the maxWalkHeight, gently nudge them down
      // If you change the maxWalkHeight also change the frictionFactor
      const maxWalkHeight = 0.03;
      const frictionFactor = 25;
      if (groundLevel>maxWalkHeight) {
        let normal = World.heightField.getNormal( unitToMap(this.cameraRig.position.x) + MAPSIZE/2, 
                                                          -unitToMap(this.cameraRig.position.z) + MAPSIZE/2, 
                                                          WORLDSIZE, 1, WATERLEVEL);
        this.cameraRig.position.x -= normal.x * timeDelta * (groundLevel-maxWalkHeight) * frictionFactor;
        this.cameraRig.position.z += normal.z * timeDelta * (groundLevel-maxWalkHeight) * frictionFactor;
      }     
    }
    
    // Handle the day / night rhythm and change to day / night when the player passes through the day / night gate
    let playerInTimeGate = cameraPosition.x>=-1 && cameraPosition.x<1 && cameraPosition.z>-0.25 && cameraPosition.z<0.25;
    World.handleDayAndNight(playerInTimeGate, timeDelta, time);
    
    if (this.fire) {
      this.fire.components.material.material.uniforms.height.value += timeDelta/5000;
    }
    
    // Handle the showing of the title
    this.title.setAttribute('visible', this.titleTimer > 0);
    if (this.titleTimer > 0) {
      this.titleTimer = Math.max(this.titleTimer-timeDelta/1000, 0);
      let o = +this.title.getAttribute('opacity') + timeDelta/1000;  // + to convert to float
      this.title.setAttribute('opacity', Math.min(0.66, Math.min(o, this.titleTimer)));
    }      
  },
  
  // Handle that the user grabs a good crown
  crown: function (crownType) {
    let count = World.stones.filter(s=>s.crown.found).length;
    this.showTitle("You found a King's " + crownType.charAt(0).toUpperCase() + crownType.slice(1) + " Crown!\n" + count + " Crowns of 13 found", 6);
    if (count === 13) {
      this.showTitle(`You found all the Kings Crowns!\nYour valor will be rewarded.\nFor you will gaze upon the King!`, 7);
      setTimeout(() => {
        this.showTitle(`Who dwells for all eternity\nDown in Hell!`, 7)
        this.fire = document.getElementById("devilfire");
        this.fire.object3D.visible = true;
        this.fire.components.material.material.uniforms.height.value = 0;
        setTimeout(() => {
          this.spawn = null;
          this.init();
        }, 8000);
      }, 8000);
    }
  },
  
  // Handle that the user grabs a bad crown
  kill: function (crownType) {
    if (!this.fire) {
      this.fire = document.getElementById(crownType+"fire");
      this.fire.object3D.visible = true;
      this.fire.components.material.material.uniforms.height.value = 0;
      let title = { day:"Day Crown at Night!\nFor this I thee smite!",
                    night:"Night Crown at Day!\nWith your life you will pay!",
                    devil:"You dare to steal the Devil's crown!\nTo Hell will you be taken down!"
                  }[crownType];
      this.showTitle(title, 6);
      World.stones.forEach(stone => { if (stone.crown) stone.crown.found = false } );
      setTimeout(() => {
        this.init();
      }, 7000);
    }
  },
  
  // Setup a new title to show
  showTitle(text, seconds) {
    this.titleTimer = seconds;
    this.title.setAttribute('value', text);
  }
});
