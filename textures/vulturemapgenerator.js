/* global DEBUGTEXTURES */

"use strict";

class VultureMapGenerator {
  
  static generateVultureMap() {
    let canvas = document.createElement('canvas');

    canvas.width = 1024;
    canvas.height = 1024;
    let ctx = canvas.getContext("2d", { willReadFrequently:true });
    
    ctx.strokeStyle = '#000'; 
    ctx.lineWidth = 20; 
    ctx.lineCap = 'round';
    ctx.translate(512, 512);
    ctx.beginPath();
    for (let side=-1; side<=1; side+=2) { 
      for (let l=0; l<6; l++) {
        ctx.moveTo(0,-100+l*20);
        ctx.lineTo(side*(350-l*10),-125+l*20);
        ctx.lineTo(side*(350+Math.cos(-0.5+l*0.3)*150),-125+l*25);
      }
    }
    ctx.stroke();

    ctx.lineWidth = 16; 
    ctx.beginPath();
    for (let l=0; l<11; l++) {
      ctx.moveTo(0,-175);
      ctx.lineTo((l-5)*15,150+Math.cos((l-5)/2)*10);
    }
    ctx.stroke();

    return canvas;
  }
}
