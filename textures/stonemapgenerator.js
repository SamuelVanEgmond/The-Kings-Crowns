"use strict";

class StoneMapGenerator {

  static generateStoneMap() {   
    let canvas = document.createElement('canvas');

    let height = 512;
    let width = 512;
    canvas.width = width;
    canvas.height = height;
    
    let ctx = canvas.getContext("2d", { willReadFrequently:true });
    ctx.fillStyle = "#888";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.filter = 'blur(16px)';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';

    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(48, 464);
    ctx.lineTo(48, 48);
    ctx.lineTo(464, 48);
    ctx.stroke();
    
    ctx.strokeStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(48, 464);
    ctx.lineTo(464, 464);
    ctx.lineTo(464, 48);
    ctx.stroke();
    
    //for (let i=0; i<=2; i++) {
    //  ctx.strokeStyle = ['#000', '#FFF', '#888'][i];
    //  let offset = [20, -20, 0][i];
    //  ctx.lineWidth = 40
    //  ctx.beginPath();
    //  ctx.moveTo(160+offset, 160+offset); ctx.lineTo(352+offset, 352+offset);
    //  ctx.moveTo(160+offset, 352+offset); ctx.lineTo(352+offset, 160+offset);
    //  ctx.moveTo(120+offset, 256+offset); ctx.lineTo(392+offset, 256+offset);
    //  ctx.moveTo(256+offset, 120+offset); ctx.lineTo(256+offset, 392+offset);
    //  ctx.stroke();      
    //}
    
    let imageData = ctx.getImageData(0, 0, width, height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i+= 4) {
      data[i + 0] = data[i + 0] / 4 + 96 + Math.random()*32-16;
      data[i + 1] = data[i + 0];
      data[i + 2] = data[i + 0];
    }

    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  }
}