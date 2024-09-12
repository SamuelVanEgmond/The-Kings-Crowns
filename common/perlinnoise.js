"use strict";

// A home brewn seamless perlin noise implementation for integer(!!) coordinates.
// Because it is seamless we precalculate the smaller size for speed.
// The end result guarantees return values in the whole range from 0 to 1
class PerlinNoise {

  constructor(size = 512, octaves = 8, seed) {
    if (size && (size & (size - 1)) !== 0) {
      throw(`Size ${size} is not a power of two`);
    }
    this.size  = size;
    this.seed  = seed || Math.random()*100000;
    this.noise = this._preCalculateNoise(this.size, octaves ?? 7);
  }

  get(x, y) {
    return this.noise[((y%this.size) | 0)*this.size+((x%this.size) | 0)];
  }

  // Seeded fixed random number generator for x and y
  // From: https://stackoverflow.com/a/37221804
  _getRandom(x, y){   
    let h = this.seed + x*374761393 + y*668265263; //all constants are prime
    h = (h^(h >> 13))*1274126177;
    return (h^(h >> 16));
  }

  _preCalculateNoise(size, octaves) {  
    let noise = new Float32Array(size * size);
    let octave  = Math.min(octaves,10);
    let scale   = this.size/2;
    let alpha   = 1;
    let min = Number.MAX_VALUE;
    let max = 0;
    do {
      for (let y=0; y<this.size; y++) {
        for (let x=0; x<this.size; x++) {
          // Get integer coordinates and remainders at the current octave scale
          let fx = ((x/scale) | 0)*scale;
          let fy = ((y/scale) | 0)*scale;
          let rx = (x-fx)/scale;
          let ry = (y-fy)/scale;

          // Get the fixed random values at the four corners for the scale
          let v0 = this._getRandom( fx                 ,  fy                 );
          let v1 = this._getRandom((fx+scale)%this.size,  fy                 );
          let v2 = this._getRandom( fx                 , (fy+scale)%this.size);
          let v3 = this._getRandom((fx+scale)%this.size, (fy+scale)%this.size);

          // Interplolate the four corners
          let v01 = this._interpolate(rx, v0, v1);
          let v23 = this._interpolate(rx, v2, v3);
          let v   = this._interpolate(ry, v01, v23);

          // Store the value and update the min max to rescale the final result
          let index = y*size+x;
          noise[index] = alpha * v + (1-alpha) * noise[index];
          min = Math.min(min, noise[index]);
          max = Math.max(max, noise[index]);
        }
      }
      octave--;
      scale  /= 2;
      alpha  /= 2;
    } while (octave >= 1);

    // Rescale into exactly 0 - 1 range (both inclusive)
    for (let i=0; i<size*size; i++) {
      noise[i] = (noise[i] - min) / (max - min);
    }

    return noise;
  }

  _interpolate(x, a, b) {
    // Interpolate using smootherstep for x
    return a + (x * x * x * (x * (x * 6 - 15) + 10)) * (b-a);
  }
}