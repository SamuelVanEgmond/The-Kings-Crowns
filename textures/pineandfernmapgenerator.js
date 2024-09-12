"use strict";

class PineAndFernMapGenerator {
  
  static generatePineAndFernMap() {
    let canvas = document.createElement('canvas');

    canvas.width = 1024;
    canvas.height = 1024;
    let ctx = canvas.getContext("2d", { willReadFrequently:true });

    let drawBranch = function(ctx, depth, radius, x1, y1, x2, y2, first = true) {
      let length = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
      // Draw the branch
      if (depth>1)
        ctx.strokeStyle = '#666';    
      else {
        let c = "89ABCDEF"[Math.floor(Math.random()*8)];
        ctx.strokeStyle = `#${c}${c}${c}`;    
      }
      ctx.lineWidth = radius/2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let a=0; a<Math.PI*2; a+=0.1) {
        ctx.moveTo(x1+Math.sin(a)*radius, y1+Math.cos(a)*radius);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke()

      if (depth>0) {
        for (let i=radius*(2+(first?10:0)); i<length; i += radius*(5-i/length*2)) {
           let d = i/length;
           for (let s=-1; s<=1; s+=2) {
             drawBranch(ctx, depth-1, radius*(2-i/length)/4,
                        (1-d)*x1 + d*x2, 
                        (1-d)*y1 + d*y2,  
                        (1-d)*x1 + d*x2 + (1-d*0.75)*(s * (y2-y1)/4 + (x2-x1)/16) + (Math.random()-0.5)*length/32, 
                        (1-d)*y1 + d*y2 + (1-d*0.75)*(s * (x2-x1)/4 + (y2-y1)/16) + (Math.random()-0.5)*length/32,
                        false
                      ); 
          }
        }
      }
    }

    drawBranch(ctx, 3, 7, 256, 1024, 256, 50);
    drawBranch(ctx, 3, 7, 768, 1024, 768, 50);

    for (let s=-1; s<=1; s+=2) {
      ctx.save()
      ctx.scale(0.25 , 1);
      ctx.translate((2-s)*1024, 1024)
      let gradient = ctx.createRadialGradient(0, 0, 200, 0, 0, 800);
      gradient.addColorStop(0, 'rgba(0,0,0,0.75)');
      gradient.addColorStop(1, 'transparent');
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = gradient;
      ctx.fillRect(-canvas.width*5, -canvas.height*5, canvas.width*10, canvas.height*10);
      ctx.restore()
    }  
    
    return canvas;
  }
}
