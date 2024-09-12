/* global DEBUGTEXTURES */

"use strict";

class GrassMapGenerator {
  
  static generateGrassMap() {
    let canvas = document.createElement('canvas');

    let height = 512;
    let width = 512;
    canvas.width = width*4;
    canvas.height = height;
    let ctx = canvas.getContext("2d", { willReadFrequently:true });
    ctx.lineCap = "round";
    
    let flowers = Math.floor(Math.random()*4);
    
    for (let map=0;map<4;map++) {

      const bladeCount = 200;
      for (let blade = 0; blade < bladeCount; blade++) {
        let xPos         = (Math.random()*0.750+0.125)*width;
        let offsetTop    = (Math.random()-0.5)*0.125*width;
        let offsetBottom = (Math.random()-0.5)*0.125*width;
        let offsetGround = (1-blade/bladeCount)*height*0.15;  // Back blades higher
        let bladeHeight  = (Math.random()*0.5+0.25)*height;
        let curve        = (Math.random()-0.5)*0.125*width;

        let gradient = ctx.createLinearGradient(0, bladeHeight, 0, 0);
        let c = Math.floor(blade/(bladeCount+1)*6); // 0-5
        gradient.addColorStop(0, `#${2+c}${4+c}0`);
        gradient.addColorStop(1, '#9B0');
        ctx.strokeStyle = gradient;

        // Draw the blade, slowly becoming thinner to the top
        for (let d = 0; d<1; d += 0.01) {
          let e = d + 0.05;
          ctx.beginPath();
          ctx.lineWidth = width/bladeCount*2*(1-d*0.8);
          ctx.moveTo(xPos + map*width + offsetBottom*(1-d) + offsetTop*(d) + Math.sin(d*3.14)*curve, (height-offsetGround)*(1-d) + (height-bladeHeight)*d);
          ctx.lineTo(xPos + map*width + offsetBottom*(1-e) + offsetTop*(e) + Math.sin(e*3.14)*curve, (height-offsetGround)*(1-e) + (height-bladeHeight)*e);
          ctx.stroke();
        }
      }

      // First of four is only grass, others have 3 of the four possible flowers
      if (map > 0) {
        switch(flowers++%4) {
          case 0:
            this.drawFlower(ctx, height*3/4, map*width + width/2, height/4, width/5, 16, '#FC0', '#A60');
            break;
          case 1:
            this.drawFlower(ctx, height*3/4, map*width + width/2, height/4, width/10, 20, '#FFF', '#FC0');
            break;
          case 2:
            this.drawFlower(ctx, height*3/4, map*width + width/2, height/4, width/15, 6, '#88F', '#FC0');
            break;
          case 3:
            this.drawFlower(ctx, height*3/4, map*width + width/2, height/4, width/15, 4, '#F00', '#FC0');
            break;
        }
      }

    }
    
    let gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height/2);
    gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(1, 'transparent');
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height); 
    ctx.globalCompositeOperation = 'source-over';
    
    return canvas;
  }
  
  static drawFlower(ctx, ground, x, y, size, petals, petalCol, centerCol) {
    
    // Draw the stem behind the grass
    ctx.globalCompositeOperation = 'destination-over';
    ctx.strokeStyle = '#060'
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+(Math.random()-0.5)*size*2, ground);
    ctx.lineWidth = size/8;
    ctx.stroke();
    
    ctx.globalCompositeOperation = 'source-over';
    // Draw the petals
    ctx.fillStyle = petalCol;
    for(let i = 0; i < petals/2; i++) {  
       ctx.beginPath();
       ctx.ellipse(x, y,
                   size, size/(petals/2), 
                   i/(petals/2)*Math.PI, 0, 2 * Math.PI);
       ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-atop';
    
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for(let i = 0; i < petals/2; i++) {  
       ctx.beginPath();
       ctx.ellipse(x, y,
                   size, size/(petals*10), 
                   (i+0.5)/(petals/2)*Math.PI, 0, 2 * Math.PI);
       ctx.fill();
    }
    

    // Draw the flower center with radial gradient
    var grd = ctx.createRadialGradient(x, y, size*0.66, x, y, size/8);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(0.73, 'rgba(128,64,32,0.5)');
    grd.addColorStop(0.75, '#000');
    grd.addColorStop(0.77, 'rgba(96,48,24,1)');
    grd.addColorStop(1, centerCol);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';

  }
}
