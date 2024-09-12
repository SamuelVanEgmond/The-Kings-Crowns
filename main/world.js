/* global AFRAME */
/* global PerlinNoise */
/* global AMBIENTLIGHT */
/* global NOISEREPEAT */
/* global NOISEOCTAVES */
/* global GROUNDTEXTURESIZE */
/* global LIGHTMAPSIZE */
/* global Path */
/* global HeightField */
/* global ObjectTracker */
/* global HeightMapGenerator */
/* global TerrainMapGenerator */
/* global GrassMapGenerator */
/* global GrassMeshCreator */
/* global PalmMapGenerator */
/* global PalmsMeshCreator */
/* global PineAndFernMapGenerator */
/* global PinesMeshCreator */
/* global FernsMeshCreator */
/* global TerrainMeshCreator */
/* global VultureMapGenerator */
/* global VultureMeshCreator */
/* global StoneMapGenerator */
/* global StonesMeshCreator */
/* global startWind */
/* global DEBUGTEXTURES */
/* global GRASSDEF */

"use strict";

// World contains all main data and things that need to be accessible from multiple conmponents

class World {

  static GenerateAll() {
    let startTime = new Date(); 
    
    let perlinNoise = new PerlinNoise(GROUNDTEXTURESIZE/NOISEREPEAT, NOISEOCTAVES);

    this.path = new Path();
    this.heightField = new HeightField(this.path, perlinNoise);
    
    // Not used, but good for debugging
    if (DEBUGTEXTURES) {
      this.heightMap = HeightMapGenerator.drawHeightMap(this.heightField);
    }
    
    this.terrainMap = TerrainMapGenerator.drawTerrainMap(this.heightField, perlinNoise);

    this.lightMap = document.createElement('canvas');
    TerrainMapGenerator.drawLightMap(this.lightMap, this.heightField);
    TerrainMapGenerator.addShadows(this.lightMap, this.heightField); 

    this.objectTracker = new ObjectTracker();
    
    // Palms throw shadows on the lightmap
    this.palmMap = PalmMapGenerator.generatePalmMap();
    this.palmsMesh = PalmsMeshCreator.createMesh(this.heightField, this.lightMap, this.objectTracker, this.palmMap);
    
    // Pines and ferns throw shadows on the lightmap
    this.pineAndFernMap = PineAndFernMapGenerator.generatePineAndFernMap();
    this.pinesMesh = PinesMeshCreator.createMesh(this.heightField, this.lightMap, this.objectTracker, this.pineAndFernMap);
    this.fernsMesh = FernsMeshCreator.createMesh(this.heightField, this.lightMap, this.objectTracker, this.pineAndFernMap);

    TerrainMapGenerator.overlayLightMap(this.terrainMap, this.lightMap);    
        
    this.stoneMap = StoneMapGenerator.generateStoneMap();
    this.stonesMesh = StonesMeshCreator.createMesh(this.heightField, this.lightMap, this.objectTracker, this.terrainMap, this.stoneMap);
    
    this.grassMap = GrassMapGenerator.generateGrassMap();
    this.grassMesh = GrassMeshCreator.createMesh(this.heightField, this.lightMap, this.objectTracker, this.terrainMap, this.grassMap);

    this.terrainMesh = TerrainMeshCreator.createMesh(this.heightField, this.terrainMap);
    
    this.vultureMap = VultureMapGenerator.generateVultureMap();
    this.vultureMesh = VultureMeshCreator.createMesh(this.vultureMap);
    
    let endTime = new Date();
    
    //console.log(`GenerateAll took ${(endTime-startTime)/1000} sec.`);
    
    this.debugTextures();
    
    // When the body background is light it bleads through the canvas on semi transparent textures so make it black when generation is finished
    document.body.style.background = "#000";
    
    this.timeOfDay = 0.5;
    this.dayState = 'day';
  }
  
  static debugTextures() {
    if (DEBUGTEXTURES) {
      if (this.heightMap) {
        document.body.appendChild(this.heightMap);
      }
      document.body.appendChild(this.lightMap);
      document.body.appendChild(this.terrainMap);
      document.body.appendChild(this.grassMap).id = "grass";
      document.body.appendChild(this.palmMap);
      document.body.appendChild(this.vultureMap);
    }
  }
  
  // Called from the player component
  static handleDayAndNight(playerInTimeGate, timeDelta, time) {
    switch (this.dayState) {
      case 'day': {
        this.dayState = playerInTimeGate ? 'toNight' : 'day';
        break;
      }
      case 'night': {
        this.dayState = playerInTimeGate ? 'toDay' : 'night';
        break;
      }
      case 'toDay': {
        this.timeOfDay += timeDelta/10000; 
        if (this.timeOfDay >= 0.5) {
          this.timeOfDay = 0.5;
          this.dayState = 'day';
        }
        break;
      }
      case 'toNight': {
        this.timeOfDay += timeDelta/10000; 
        if (this.timeOfDay >= 1) {
          this.timeOfDay = 0;
          this.dayState = 'night';
        }
        break;
      }
    }
     this.setTimeOfDay(time, this.timeOfDay);
  }
  
  // Set time of day (0=night, 0.5=day, 1=night)
  static setTimeOfDay(time, timeOfDay) {
    let day = 0.5-Math.cos(timeOfDay*Math.PI*2)/2;
    let night = 1-day;
    
    AMBIENTLIGHT.set(night*0.05 + day*1,night*0.1 + day*1,night*0.15 + day*1);    
    let scene = document.getElementById("scene");
    scene.setAttribute('fog', 'color', `rgba(${Math.round(day*187)}, ${Math.round(day*204)}, ${Math.round(day*221)}, 1)`);
    let sky = document.getElementById("sky");
    sky.setAttribute('material', 'timeofday', day);
    // Setting the timeofday attribute also sets the time, so the automatic A-Frame time parameter does not work, so set it manually.
    sky.setAttribute('material', 'time', time);
  }
}

World.GenerateAll();
