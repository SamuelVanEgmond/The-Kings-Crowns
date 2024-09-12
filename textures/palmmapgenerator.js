"use strict";

class PalmMapGenerator {
  
  static generatePalmMap() {
    let canvas = document.createElement('canvas');

    canvas.width = 1024;
    canvas.height = 1024;
    let ctx = canvas.getContext("2d", { willReadFrequently:true });

    let rot     = 5;
    let rotdiff = 8;

    for (let l=0; l<10;l++) {
      for (let side = -1; side<=1; side += 2) {
        let xPos, yPos;
        xPos = 512;
        yPos = 410+l*45-side*17.5*0.5;
        ctx.save();
        ctx.translate(xPos, yPos);
        ctx.rotate((180+side*rot)*(Math.PI/180));
        rot +=rotdiff;
        rotdiff-=0.5;

        ctx.globalCompositeOperation = 'source-over';

        for (let grad = 1; grad <=2; grad++) {   
          if (grad === 1) {
            // First draw the leaf in green hues over the width, including the vein 
            let gradient = ctx.createLinearGradient(-100, 0, 100, 0);
            gradient.addColorStop(0.000, '#000');
            gradient.addColorStop(0.350, '#120');
            gradient.addColorStop(0.490, '#250');
            gradient.addColorStop(0.495, '#370');
            gradient.addColorStop(0.505, '#370');
            gradient.addColorStop(0.510, '#250');
            gradient.addColorStop(0.650, '#120');
            gradient.addColorStop(1.000, '#000');
            ctx.fillStyle = gradient;
          }
          else 
          {
            // Then overlay with yellow hues over the length to the tip
            let gradient = ctx.createLinearGradient(0, 0, 0, 325);
            gradient.addColorStop(0.50, 'rgba(255,255,0,0.00)');
            gradient.addColorStop(0.70, 'rgba(255,255,0,0.25)');
            gradient.addColorStop(0.95, 'rgba(200,200,0,0.75)');
            gradient.addColorStop(1.00, 'rgba(155,155,0,1.00)');
            ctx.fillStyle = gradient;
          }

          // Draw the leaf
          ctx.beginPath();
          ctx.moveTo(0, -5);
          ctx.quadraticCurveTo(  35, 100, 0, 400-l*20);
          ctx.quadraticCurveTo( -35, 100, 0, 0);
          ctx.fill();
        }
        ctx.restore();

      }
    }
    
    // Draw the stem
    ctx.save();
    let gradient = ctx.createLinearGradient(0, 1024, 0, 375);
    gradient.addColorStop(0, '#240');
    gradient.addColorStop(1, '#360');
    ctx.fillStyle = gradient;

    ctx.translate(512, 0);
    ctx.beginPath();
    ctx.moveTo(-10, 1100);
    ctx.quadraticCurveTo(-10, 400,  0,  375);
    ctx.quadraticCurveTo( 10, 400, 10, 1100);
    ctx.fill();
    ctx.restore();
    
    // Draw a dark gradient from the ground up to give an ambient occlusion effect
    gradient = ctx.createLinearGradient(0,canvas.height, 0, canvas.height/2);
    gradient.addColorStop(0, 'black');
    gradient.addColorStop(1, 'transparent');
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);        
    
    return canvas;
  }
}
