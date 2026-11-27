// A small software-rendered scene, sharing Canvas 2D with the underwater game.
// World units and camera poses live here; the interface only names a station.
// A chapter can override `surface` without changing menus or dive simulation.
const expeditionSurface = { setting: "boat", light: "day" };

class SurfaceScene extends ExpeditionBoatModel {
  constructor(canvas, onAnchors) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", {alpha:false});
    this.onAnchors = onAnchors;
    this.environment = {...expeditionSurface};
    this.pointer = {x:0,y:0};
    this.camera = {x:0,y:3.25,z:-2.7,tx:0,ty:1.1,tz:3.2};
    this.target = {...this.camera};
    this.time = 0;
    this.last = 0;
    this.running = false;
    this.reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const grain = document.createElement("canvas");
    grain.width = grain.height = 96;
    const grainContext = grain.getContext("2d");
    const pixels = grainContext.createImageData(96,96);
    let seed = 19811996;
    for (let i=0;i<pixels.data.length;i+=4) {
      seed = (Math.imul(seed,1664525)+1013904223)>>>0;
      const v=80+(seed%100);
      pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;
      pixels.data[i+3]=32;
    }
    grainContext.putImageData(pixels,0,0);
    this.grain = this.ctx.createPattern(grain,"repeat");
    this.materialNoise = this.makeMaterialNoise();
    this.resize();
    window.addEventListener("resize", () => {this.resize(); if (!this.running) this.draw();});
    document.addEventListener("visibilitychange", () => { this.last = 0; });
  }

  setEnvironment(environment = expeditionSurface) {
    const next = {...expeditionSurface,...environment};
    if (next.setting !== this.environment.setting) {
      this.environment = next;
      this.buildScene();
    } else this.environment = next;
  }

  setView(screen, station) {
    const poses = {
      menu:{x:-.48,y:3.1,z:-2.6,tx:0,ty:1.2,tz:3.5},
      boat:{x:0,y:3.25,z:-2.7,tx:0,ty:1.1,tz:3.2},
      map:{x:0,y:3,z:-.25,tx:0,ty:1.05,tz:2.8},
      gear:{x:1.2,y:2.65,z:-.65,tx:1.5,ty:1.6,tz:3.5},
      album:{x:-1.1,y:2.6,z:-.3,tx:-1.35,ty:1.15,tz:2.65},
      plunge:{x:-2.4,y:2.2,z:-1.1,tx:-3.1,ty:-.5,tz:1.1},
    };
    const key = screen === "station" ? station : screen === "chapters" ? "map" : screen === "result" || screen === "ending" ? "album" : screen;
    this.target = {...(poses[key] ?? poses.boat)};
    this.screen = screen;
    if (this.reducedMotion) this.camera = {...this.target};
    this.start();
  }

  resize() {
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.dpr = Math.min(2,window.devicePixelRatio || 1);
    this.canvas.width = Math.round(this.w*this.dpr);
    this.canvas.height = Math.round(this.h*this.dpr);
    this.canvas.style.width = this.w+"px";
    this.canvas.style.height = this.h+"px";
    this.terrain = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = 0;
    const frame = now => {
      if (!this.running) return;
      const elapsed = this.last ? now-this.last : 34;
      if (!document.hidden && elapsed >= 1000/30-1) {
        this.last = now;
        const dt = Math.min(.08,elapsed/1000);
        if (!this.reducedMotion) this.time += dt;
        for (const key of Object.keys(this.camera)) this.camera[key] += (this.target[key]-this.camera[key])*(1-Math.exp(-dt*5));
        this.draw();
      }
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  stop() { this.running = false; cancelAnimationFrame(this.raf); }

  basis() {
    const c = this.camera, bob = this.environment.setting === "boat" ? Math.sin(this.time*.66)*.025 : 0;
    const parallax = this.reducedMotion ? 0 : .045;
    const portrait=this.w/this.h<.85;
    const closeView=portrait && ["boat","menu"].includes(this.screen);
    this.eye = [c.x+this.pointer.x*parallax,c.y+bob+this.pointer.y*parallax+(closeView ? .45 : 0),c.z+(closeView ? .75 : 0)];
    const normal = v => {const n=Math.hypot(...v);return v.map(k=>k/n);};
    const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    this.forward = normal([c.tx-this.eye[0],c.ty-this.eye[1],c.tz-this.eye[2]]);
    this.right = normal(cross([0,1,0],this.forward));
    this.up = cross(this.forward,this.right);
    // Portrait keeps all three stations in frame instead of cropping the scene.
    this.focal = Math.min(this.w*(portrait?1.04:.88),this.h*1.18);
  }

  project(point) {
    const d=point.map((value,index)=>value-this.eye[index]);
    const dot=v=>d[0]*v[0]+d[1]*v[1]+d[2]*v[2];
    const z=dot(this.forward);
    return {x:this.w*.5+dot(this.right)/z*this.focal,y:this.h*.48-dot(this.up)/z*this.focal,z};
  }

  makeMaterialNoise() {
    const tile=document.createElement("canvas");tile.width=tile.height=128;
    const ctx=tile.getContext("2d"),data=ctx.createImageData(128,128);
    for(let y=0;y<128;y++)for(let x=0;x<128;x++){
      const i=(y*128+x)*4;
      const v=128+(Jn(x*.09,y*.11,13)-.5)*85+(dt(x,y,17)-.5)*34;
      data.data[i]=data.data[i+1]=data.data[i+2]=v;data.data[i+3]=62;
    }
    ctx.putImageData(data,0,0);return tile;
  }

  tableDetail() {
    const ctx=this.ctx;
    // Fine scratches and grain remain anchored to the tabletop as it moves.
    ctx.save();
    for(let i=0;i<110;i++){
      const x=-2+dt(i,1,9)*4,z=1.25+dt(i,2,9)*2.55;
      this.screenPath([[x,1.138,z],[x+.04+dt(i,3,9)*.16,1.138,z+.005]]);
      ctx.strokeStyle=i%3?"#dae3df21":"#29434a18";ctx.lineWidth=.7;ctx.stroke();
    }
    // Soft contact shadows beneath the things lying on the table.
    for(const [x,z,rx,rz] of [[-1.45,2.47,.52,.7],[1.45,3.05,.4,.38],[1.38,2.15,.26,.45]]){
      for(let n=7;n>=0;n--){
        this.screenPath(Array.from({length:30},(_,i)=>[x+Math.cos(i/30*Math.PI*2)*(rx+n*.012),1.139,z+Math.sin(i/30*Math.PI*2)*(rz+n*.012)]),true);
        ctx.fillStyle="#142b3508";ctx.fill();
      }
    }
    ctx.restore();
  }

  screenPath(points,close=false) {
    const ctx=this.ctx;
    ctx.beginPath();
    points.forEach((p,i)=>{const s=this.project(p);if(i)ctx.lineTo(s.x,s.y);else ctx.moveTo(s.x,s.y);});
    if(close)ctx.closePath();
  }

  drawMap() {
    const ctx=this.ctx;
    ctx.save();
    for(let x=-.7;x<.85;x+=.18){this.screenPath([[x,1.144,1.84],[x-.04,1.144,3.49]]);ctx.strokeStyle="#aaa88644";ctx.lineWidth=.65;ctx.stroke();}
    for(let z=1.9;z<3.5;z+=.18){this.screenPath([[-.72,1.144,z],[.77,1.144,z]]);ctx.strokeStyle="#aaa88644";ctx.stroke();}
    const traces=[[[.02,1.98],[-.17,2.25],[-.06,2.6],[-.2,3.4]],[[.17,2],[.03,2.3],[.15,2.63],[.04,3.4]],[[.1,2.35],[.64,2.38],[.69,2.61],[.14,2.68]],[[.05,2.95],[.62,3],[.64,3.2],[0,3.24]]];
    for(const line of traces){this.screenPath(line.map(([x,z])=>[x,1.146,z]));ctx.strokeStyle="#586b60";ctx.lineWidth=1.2;ctx.stroke();}
    this.screenPath([[.07,1.148,2.1],[.06,1.148,2.52],[.58,1.148,2.52]]);ctx.strokeStyle="#a77d51";ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();
    ctx.restore();
  }

  coastTexture() {
    if(this.terrain)return this.terrain;
    const canvas=document.createElement("canvas");
    canvas.width=this.w;canvas.height=Math.round(Math.max(70,Math.min(135,this.h*.19)));
    const ctx=canvas.getContext("2d"),image=ctx.createImageData(canvas.width,canvas.height);
    const base=dn(I.rock),light=dn(I.rockLight),edge=dn(I.edge),sky=dn(I.sky[1]);
    for(let x=0;x<canvas.width;x++){
      const u=x/canvas.width;
      const top=canvas.height*(.52+Math.sin(u*9+.8)*.12+Math.sin(u*21)*.055)+(Jn(x*.025,2,9)-.5)*9;
      for(let y=Math.max(0,Math.floor(top));y<canvas.height;y++){
        const d=y-top,n=Jn(x*.055,y*.065,9),fine=dt(x,y,11)-.5;
        const stratum=.5+.5*Math.sin(y*.17+Jn(x*.017,y*.02,7)*5);
        const mix=.25+n*.65+stratum*.15;
        const i=(y*canvas.width+x)*4;
        for(let c=0;c<3;c++){
          let v=base[c]+(light[c]-base[c])*mix+fine*13;
          if(d<2.5)v+=(edge[c]-v)*(1-d/3)*.7;
          image.data[i+c]=v*.58+sky[c]*.42;
        }
        image.data[i+3]=255;
      }
    }
    ctx.putImageData(image,0,0);
    this.terrain=canvas;return canvas;
  }

  drawEnvironment() {
    const ctx=this.ctx,w=this.w,h=this.h,t=this.time,night=this.environment.light==="night",ice=this.environment.setting==="ice";
    const horizon=h*(.29+(this.camera.ty-1.1)*.022);
    const sky=ctx.createLinearGradient(0,0,0,horizon+40);
    sky.addColorStop(0,night?"#071322":I.sky[0]);sky.addColorStop(1,night?"#203a47":I.sky[1]);ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    if(night){ctx.fillStyle="#d3e1d17a";for(let i=0;i<42;i++){const x=((i*137.49)%997)/997*w,y=((i*71.31)%271)/271*horizon*.8;ctx.fillRect(x,y,i%6===0?2:1,1);}ctx.fillStyle="#d4dfcd";ctx.beginPath();ctx.arc(w*.79,horizon*.33,9,0,Math.PI*2);ctx.fill();}
    const coast=this.coastTexture();
    ctx.save();ctx.globalAlpha=night?.16:.8;ctx.drawImage(coast,0,horizon+8-coast.height);ctx.restore();
    const sea=ctx.createLinearGradient(0,horizon,0,h);
    sea.addColorStop(0,night?"#163841":ice?"#889f9e":I.water[0][1]);sea.addColorStop(.45,night?"#0b2e38":ice?"#bcc9bc":I.water[1][1]);sea.addColorStop(1,night?"#061c29":ice?"#68888c":I.water[4][1]);ctx.fillStyle=sea;ctx.fillRect(0,horizon+4,w,h);
    if(!night){
      const haze=ctx.createLinearGradient(0,horizon-35,0,horizon+70);
      haze.addColorStop(0,"#eafaff00");haze.addColorStop(.32,"#eafaff65");haze.addColorStop(1,"#eafaff00");ctx.fillStyle=haze;ctx.fillRect(0,horizon-35,w,105);
    }
    if(ice){
      ctx.strokeStyle="#dce5d255";ctx.lineWidth=1;
      for(let i=0;i<16;i++){let y=horizon+(i/16)**1.4*(h-horizon);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w*.3,y+15);ctx.lineTo(w*.6,y-5);ctx.lineTo(w,y+20);ctx.stroke();}
      ctx.fillStyle="#123943";ctx.beginPath();ctx.ellipse(w*.15,h*.76,w*.2,h*.11,-.12,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#d5e5d5";ctx.lineWidth=8;ctx.stroke();
    }else{
      for(let row=0;row<65;row++) {
        const v=row/65,y=horizon+8+v*v*(h-horizon),len=8+v*75;
        ctx.strokeStyle=night?`rgba(122,178,178,${.02+v*.08})`:`rgba(222,250,255,${.09+v*.19})`;
        ctx.lineWidth=.6+v*1.2;
        for(let j=0;j<11;j++){const x=(j/10*w+Math.sin(row*2.1+j*3.7+t*.26)*35+t*2*(row%2?1:-1))%(w+len);ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+len*.55,y-Math.sin(t+row)*2,x+len,y);ctx.stroke();}
      }
      ctx.save();ctx.globalCompositeOperation="lighter";
      for(let i=0;i<100;i++){
        const u=dt(i,2,91),v=dt(i,3,91),x=u*w,y=horizon+12+v*v*(h-horizon);
        const pulse=Math.max(0,Math.sin(t*(1.3+v*2.5)+u*20));
        if(pulse<.4)continue;
        const length=1.5+v*8;
        ctx.strokeStyle=`rgba(236,252,255,${pulse*(night?.08:.6)})`;ctx.lineWidth=.7+v;
        ctx.beginPath();ctx.moveTo(x-length,y);ctx.lineTo(x+length,y);ctx.stroke();
      }
      ctx.restore();
    }
  }

  paintFace(face) {
    const ctx=this.ctx,points=face.projected;
    const xs=points.map(p=>p.x),ys=points.map(p=>p.y);
    const x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
    const a=points[0],b=points[face.smooth?.edge??1];
    const light=face.smooth ? ctx.createLinearGradient(a.x,a.y,b.x,b.y) : ctx.createLinearGradient(x,y,x+w*.28,y+Math.max(1,h));
    light.addColorStop(0,face.smooth ? face.color : this.tint(face.color,1.13));
    if(!face.smooth)light.addColorStop(.36,face.color);
    light.addColorStop(1,face.smooth?.to??this.tint(face.color,.83));
    ctx.fillStyle=light;ctx.fill();
    ctx.strokeStyle=face.smooth ? light : face.stroke??face.color;ctx.lineWidth=.45;ctx.stroke();
    if(w>25&&h>12){
      ctx.save();ctx.clip();ctx.globalCompositeOperation="soft-light";
      ctx.globalAlpha=.5;ctx.drawImage(this.materialNoise,x,y,w,h);
      ctx.restore();
    }
    face.detail?.();
  }

  objectAreas() {
    const bounds = {
      map:[[-.83,1.15,1.75],[.91,1.15,1.75],[-.83,1.15,3.65],[.91,1.15,3.65]],
      album:[[-1.9,1.25,1.85],[-1,1.25,1.85],[-1.9,1.25,3.1],[-1,1.25,3.1]],
      gear:[[1.0,.95,4.05],[2.18,.95,4.05],[1,2.45,4.05],[2.18,2.45,4.05]],
    };
    return Object.fromEntries(Object.entries(bounds).map(([id,points])=>{
      const projected=points.map(p=>this.project(p));
      const x0=Math.min(...projected.map(p=>p.x)),x1=Math.max(...projected.map(p=>p.x));
      const y0=Math.min(...projected.map(p=>p.y)),y1=Math.max(...projected.map(p=>p.y));
      return [id,{x:(x0+x1)/2,y:(y0+y1)/2,width:Math.max(44,x1-x0),height:Math.max(44,y1-y0)}];
    }));
  }

  draw() {
    const ctx=this.ctx,w=this.w,h=this.h;
    ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
    this.basis();
    this.drawEnvironment();
    const sorted=this.mesh.map(face=>({...face, projected:face.points.map(point=>this.project(point))}));
    sorted.sort((a,b)=>a.layer-b.layer || b.projected.reduce((s,p)=>s+p.z,0)/b.points.length-a.projected.reduce((s,p)=>s+p.z,0)/a.points.length);
    ctx.lineJoin="round";ctx.lineCap="round";
    for(const face of sorted) {
      if(face.projected.some(point=>point.z<=.08))continue;
      ctx.beginPath();face.projected.forEach((point,i)=>i?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));
      if(face.line){ctx.strokeStyle=face.color;ctx.lineWidth=Math.max(.6,face.width*this.focal/face.projected[0].z);ctx.stroke();}
      else {ctx.closePath();this.paintFace(face);}
    }
    if(this.environment.light!=="night") {
      // The same cool daylight and warm lens glow seen at the waterline.
      ctx.save();ctx.globalCompositeOperation="lighter";
      const sun=ctx.createRadialGradient(w*.76,-h*.04,3,w*.76,-h*.04,h*.85);
      sun.addColorStop(0,"#fff6d936");sun.addColorStop(.55,"#d0f5ff0d");sun.addColorStop(1,"#d0f5ff00");
      ctx.fillStyle=sun;ctx.fillRect(0,0,w,h);ctx.restore();
    }
    if(this.environment.light==="night") {
      ctx.fillStyle="#061e3d80";ctx.fillRect(0,0,w,h);
      const lamp=this.project([-2.12,.4,4.35]);
      const glow=ctx.createRadialGradient(lamp.x,lamp.y,3,lamp.x,lamp.y,Math.max(w,h)*.45);
      glow.addColorStop(0,"#e8e0a83d");glow.addColorStop(.3,"#c2d1a817");glow.addColorStop(1,"#b8c5a000");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    }
    ctx.save();ctx.globalCompositeOperation="soft-light";ctx.fillStyle=this.grain;ctx.fillRect(0,0,w,h);ctx.restore();
    const shade=ctx.createRadialGradient(w*.52,h*.49,h*.2,w*.5,h*.45,Math.max(w,h)*.78);
    shade.addColorStop(0,"#011a1b00");shade.addColorStop(1,"#01152270");ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
    if(this.screen==="boat")this.onAnchors?.(this.objectAreas());
  }
}
