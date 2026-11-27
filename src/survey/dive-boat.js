// Orthographic view of the exact mesh used by SurfaceScene, cached at game scale.
// The boat is visual only; it cannot block the diver or change surfacing physics.
let diveBoatSprite = null;
function getDiveBoatSprite(zoom) {
  const density = Math.max(32, Math.ceil(zoom / 16) * 16);
  if (diveBoatSprite?.density === density) return diveBoatSprite;
  const model = new ExpeditionBoatModel();
  const project = ([x,y,z]) => ({x: -(z+1.3)*.6+x*.055, y: (.1-y+x*.12)*.6, z: -x+z*.06});
  const faces = model.mesh.map(face => ({...face, projected: face.points.map(project)}));
  // In side view the near pontoon must occlude legs and equipment naturally.
  faces.sort((a,b) => b.projected.reduce((s,p)=>s+p.z,0)/b.points.length-a.projected.reduce((s,p)=>s+p.z,0)/a.points.length || a.layer-b.layer);
  const points=faces.flatMap(face=>face.projected);
  const x=Math.min(...points.map(p=>p.x))-.1, y=Math.min(...points.map(p=>p.y))-.1;
  const w=Math.max(...points.map(p=>p.x))-x+.1, h=Math.max(...points.map(p=>p.y))-y+.1;
  const canvas=document.createElement("canvas");
  canvas.width=Math.ceil(w*density); canvas.height=Math.ceil(h*density);
  const ctx=canvas.getContext("2d");
  ctx.setTransform(density,0,0,density,-x*density,-y*density);
  ctx.lineJoin="round";ctx.lineCap="round";
  for(const face of faces) {
    const p=face.projected;
    ctx.beginPath();p.forEach((point,i)=>i?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));
    if(face.line) {ctx.strokeStyle=face.color;ctx.lineWidth=Math.max(.008,face.width*.6);ctx.stroke();continue;}
    ctx.closePath();
    let fill=face.color;
    if(face.smooth) {
      const a=p[0],b=p[face.smooth.edge];
      fill=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
      fill.addColorStop(0,face.color);fill.addColorStop(1,face.smooth.to);
    }
    ctx.fillStyle=fill;ctx.fill();
    ctx.strokeStyle=fill;ctx.lineWidth=.006;ctx.stroke();
  }
  ctx.globalCompositeOperation="source-atop";
  ctx.fillStyle="rgba(58,170,196,.15)";ctx.fillRect(x,0,w,h);
  return diveBoatSprite={canvas,density,x,y,w:canvas.width/density,h:canvas.height/density};
}

function drawDiveBoat(ctx, view, world, seconds) {
  const sternX=world.start.x-1.8, buoyX=world.guide[0]?.x??world.start.x+1;
  if(view.oy>1.3 || view.oy+view.H/view.zoom < -1.8
    || view.ox>Math.max(sternX+.8,buoyX) || view.ox+view.W/view.zoom<sternX-5.3) return;
  const sprite=getDiveBoatSprite(view.zoom),bob=.035*Math.sin(seconds*1.7);
  ctx.save();
  ctx.translate((sternX-view.ox)*view.zoom,-view.oy*view.zoom);
  ctx.scale(view.zoom,view.zoom);
  const reflection=ctx.createLinearGradient(0,0,0,1.1);
  reflection.addColorStop(0,"rgba(38,60,75,.3)");reflection.addColorStop(1,"rgba(38,60,75,0)");
  ctx.fillStyle=reflection;ctx.beginPath();
  ctx.moveTo(-4.9,0);ctx.quadraticCurveTo(-2.5,1.8,.25,0);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(0,bob);ctx.quadraticCurveTo((buoyX-sternX)*.5,.12,buoyX-sternX,0);
  ctx.strokeStyle="rgba(213,217,190,.85)";ctx.lineWidth=.027;ctx.stroke();
  ctx.drawImage(sprite.canvas,sprite.x,sprite.y+bob,sprite.w,sprite.h);
  ctx.strokeStyle="rgba(231,250,249,.62)";ctx.lineWidth=.025;
  for(let i=0;i<4;i++) {
    const x=-4.8+i*1.5+.15*Math.sin(seconds*1.3+i),y=.06+.035*Math.sin(seconds*1.7+i);
    ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+.4,y+.035,x+.8,y-.01);ctx.stroke();
  }
  ctx.restore();
}
