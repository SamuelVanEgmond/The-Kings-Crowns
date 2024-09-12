/* global THREE */

const FLY = false;

var LIGHTDIR = {x:1, y:1, z:1};
var AMBIENTLIGHT = new THREE.Color(0.05, 0.1, 0.2);

const DEBUGTEXTURES = false;

const WAYPOINTCOUNT = 100;

// World size in meter, map size in tiles
const WORLDSIZE = 256; 
const MAPSIZE = 256;
const MAPSCALE = WORLDSIZE/MAPSIZE;

const ROCKNORMALSPREAD = 4/256*MAPSIZE;

const LIGHTMAPSIZE = 512;
const GROUNDTEXTURESIZE = 4096;

const NOISEREPEAT  = 8;   // Powers of two only!
const NOISEOCTAVES = 5;   // Not too dramatic

// Erosion just one step takes of the jagged ridges
const EROSIONSTEPS = 1;

const mapToGround  = (v) => v / MAPSIZE   * GROUNDTEXTURESIZE;
const mapToLight   = (v) => v / MAPSIZE   * LIGHTMAPSIZE;
const unitToGround = (v) => v / WORLDSIZE * GROUNDTEXTURESIZE;
const unitToLight  = (v) => v / WORLDSIZE * LIGHTMAPSIZE;
const unitToMap    = (v) => v / WORLDSIZE * MAPSIZE;

const SKYWIDTH = 2048;
const SKYHEIGHT = SKYWIDTH/2;

const TER_PATH  = 'Path';
const TER_GRASS = 'Grass';
const TER_ROCK  = 'Rock';
const TER_SNOW  = 'Snow';

const WATERLEVEL = 0.01;

let TERRAINS = [
  { height: 0,    terrain: TER_PATH  },
  { height: 0.01, terrain: TER_GRASS },
  { height: 0.1,  terrain: TER_ROCK  },
  { height: 0.6,  terrain: TER_SNOW  }
];

// Height in 0 - 1 
// ALSO CHANGE getTerrainHeight !!!!!
const getTerrain = function(height) {
  let terrain = TERRAINS[0];
  let i = 1;
  while (i<TERRAINS.length && TERRAINS[i].height <= height) {
    terrain = TERRAINS[i++];
  }
  return terrain.terrain;
}

const getTerrainHeight = function(terrain) {
  return TERRAINS.find(t => t.terrain === terrain).height;
};

const GRASSDEF = { count:50000, fromHeight:0.00, toHeight:0.02, flowers:0.2 };
const FERNDEF  = { count:75, fromHeight:0.00, toHeight:0.005, leaves:7, scale:0.7 };
const PALMDEF  = { count:35, fromHeight:0.00, toHeight:0.005, leaves:10, scale:4 };
const PINEDEF  = { count:75, direction:1, fromHeight:0.00, toHeight:0.01, branches:100, scale:10 };
const STONEDEF = { count:100, fromHeight:0.00, toHeight:0.005 }; // Count excluding fixed
