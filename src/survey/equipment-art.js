// Shared Canvas materials and silhouettes, used for the rig and item choices.
function paintEquipmentItem(ctx, item, x, y, size) {
  ctx.save();ctx.translate(x,y);ctx.scale(size/100,size/100);
  ctx.lineJoin="round";ctx.lineCap="round";
  const rounded=(x,y,w,h,r,fill,stroke)=>{_t(ctx,x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.2;ctx.stroke();}};
  const line=(points,color,width)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();};
  const cylinder=(x,y,w,h,deco=false)=>{
    const g=ctx.createLinearGradient(x,0,x+w,0);
    g.addColorStop(0,"#536a78");g.addColorStop(.24,expeditionBoatStyle.metal[1]);g.addColorStop(.43,expeditionBoatStyle.metal[0]);g.addColorStop(.7,"#bac8ce");g.addColorStop(1,"#657b87");
    rounded(x,y,w,h,w*.38,g,"#425a67");
    rounded(x+w*.35,y-5,w*.3,8,2,"#90a4a8");
    rounded(x+w*.06,y-7,w*.8,3,1,"#304a51");
    rounded(x+w*.7,y-8,w*.2,5,1,"#152e36");
    rounded(x+1,y+h*.21,w-2,8,1,deco?"#a6be80":"#dfcea0");
    if(deco){ctx.fillStyle="#3f5a36";ctx.font="bold 6px sans-serif";ctx.textAlign="center";ctx.fillText("50",x+w/2,y+h*.21+6);}
    for(const v of [.48,.8])rounded(x-1,y+h*v,w+2,4,1,"#253f47");
    line([[x+w*.5,y-3],[x+w*1.2,y+1],[x+w*1.4,y+14],[x+w*1.4,y+41]],"#233b43",2.3);
    line([[x+4,y+h*.35],[x+4,y+h*.7]],"#ffffff75",.7);
  };
  if(item==="single"||item==="twin"){
    rounded(28,17,44,68,15,"#233e46","#162c33");
    if(item==="twin"){cylinder(28,10,21,77);cylinder(52,10,21,77);line([[37,8],[62,8]],"#314e56",3);}
    else cylinder(36,10,28,78);
    for(const y of [45,71]){rounded(26,y,49,5,1,"#23383e");rounded(48,y-.5,7,6,1,"#bac5be");}
    line([[28,24],[18,31],[17,66],[25,88]],"#182e35",4);
    line([[75,24],[85,36],[85,68],[75,88]],"#182e35",4);
    rounded(18,87,65,5,2,"#2f474c");rounded(46,85,10,8,1,"#aeb9b5");
  } else if(item==="deco50"||item==="stage"){
    ctx.translate(50,50);ctx.rotate(.18);ctx.translate(-50,-50);
    cylinder(36,11,28,76,item==="deco50");
    line([[36,40],[27,35],[24,21]],"#92a4a6",2);
    line([[35,76],[28,79],[26,87]],"#92a4a6",2);
  } else if(item==="camera"){
    line([[23,26],[15,42],[18,71],[31,81],[69,81],[82,68],[85,42],[77,26]],"#344e54",4);
    rounded(22,28,57,43,6,"#adbdc0","#374f59");rounded(30,22,20,8,2,"#788d95");
    rounded(66,19,13,13,2,"#dae3db","#5c7580");
    ctx.fillStyle="#345567";ctx.beginPath();ctx.arc(49,50,19,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#e2ebea";ctx.lineWidth=3;ctx.stroke();
    const lens=ctx.createRadialGradient(45,43,1,50,50,15);lens.addColorStop(0,"#d0f0ef");lens.addColorStop(.2,"#7aaeb6");lens.addColorStop(.6,"#214d64");lens.addColorStop(1,"#102d43");
    ctx.fillStyle=lens;ctx.beginPath();ctx.arc(49,50,14,0,Math.PI*2);ctx.fill();
    rounded(27,34,9,5,1,"#e5d7ae");
  } else if(item==="reel"||item==="baseReel"){
    line([[72,57],[85,68],[75,82],[38,82],[24,91]],"#c9be8e",1.5);
    const g=ctx.createLinearGradient(0,21,0,76);g.addColorStop(0,"#d7d1ad");g.addColorStop(.45,"#a5ae96");g.addColorStop(1,"#586b64");
    ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(49,51,31,25,-.2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#53695e";ctx.lineWidth=2;ctx.stroke();
    for(let r=10;r<25;r+=3){ctx.beginPath();ctx.ellipse(49,51,r,r*.75,-.2,0,Math.PI*2);ctx.strokeStyle="#e1dabb";ctx.lineWidth=1.3;ctx.stroke();}
    rounded(25,20,47,9,3,"#304a49");rounded(65,17,8,23,2,"#637a70");
    ctx.fillStyle="#3b5652";ctx.beginPath();ctx.arc(49,51,9,0,Math.PI*2);ctx.fill();
    if(item==="reel"){rounded(11,63,20,6,2,"#b8b99a");rounded(12,71,19,6,2,"#7c8c79");}
  } else {
    ctx.translate(50,50);ctx.rotate(-.35);ctx.translate(-50,-50);
    const g=ctx.createLinearGradient(31,0,66,0);g.addColorStop(0,"#203c45");g.addColorStop(.45,"#6c8990");g.addColorStop(1,"#29434d");
    rounded(34,25,28,56,7,g,"#203b43");rounded(28,16,40,22,4,"#536f79","#233e47");
    rounded(31,15,34,8,3,"#d4e5df","#77969b");rounded(43,43,9,14,2,"#b9ba8d");
    for(let y=61;y<75;y+=4)line([[37,y],[59,y]],"#1d37413d",1);
    line([[49,81],[64,91],[81,78]],"#627975",2);
    if(item==="light")rounded(40,29,16,5,1,"#dfc17b");
  }
  ctx.restore();
}

function drawEquipmentRig(canvas, plan) {
  const w=360,h=300,scale=Math.min(2,window.devicePixelRatio||1);
  canvas.width=w*scale;canvas.height=h*scale;
  const ctx=canvas.getContext("2d");ctx.scale(scale,scale);
  const floor=ctx.createRadialGradient(181,165,20,181,165,170);
  floor.addColorStop(0,"#c7d3cb");floor.addColorStop(1,"#e6e4d300");ctx.fillStyle=floor;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(180,158);ctx.scale(1,.3);ctx.beginPath();ctx.arc(0,0,98,0,Math.PI*2);ctx.fillStyle="#203d3e15";ctx.fill();ctx.restore();
  paintEquipmentItem(ctx,plan.back==="single"?"single":"twin",85,5,190);
  if(plan.slots.includes("stage"))paintEquipmentItem(ctx,"stage",12,79,114);
  if(plan.slots.includes("deco50")){
    ctx.strokeStyle="#728e8d";ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(257,111);ctx.lineTo(229,84);ctx.moveTo(255,169);ctx.lineTo(229,166);ctx.stroke();
    paintEquipmentItem(ctx,"deco50",220,76,114);
  }
  paintEquipmentItem(ctx,"baseLight",10,173,85);
  paintEquipmentItem(ctx,plan.slots.includes("light")?"light":"baseLight",57,206,plan.slots.includes("light")?62:47);
  if(plan.slots.includes("reel"))paintEquipmentItem(ctx,"reel",117,190,92);
  paintEquipmentItem(ctx,"camera",241,188,102);
}
