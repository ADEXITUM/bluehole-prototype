// One boat geometry for the first-person hub and the view from the water.
// Coordinates: x across the deck, y up, z from stern to bow.
class ExpeditionBoatModel {
  constructor() {
    this.environment = {setting: "boat"};
    this.buildScene();
  }

  polygon(points,color,detail=null,stroke=null) {
    this.mesh.push({points,color,detail,stroke,layer:this.layer??0});
  }

  box(x,y,z,w,h,d,color) {
    const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2;
    this.polygon([[x0,y,z0],[x0,y+h,z0],[x1,y+h,z0],[x1,y,z0]],this.tint(color,.73));
    this.polygon([[x0,y,z1],[x0,y+h,z1],[x0,y+h,z0],[x0,y,z0]],this.tint(color,.59));
    this.polygon([[x1,y,z0],[x1,y+h,z0],[x1,y+h,z1],[x1,y,z1]],this.tint(color,.85));
    this.polygon([[x1,y,z1],[x1,y+h,z1],[x0,y+h,z1],[x0,y,z1]],this.tint(color,.68));
    this.polygon([[x0,y+h,z0],[x0,y+h,z1],[x1,y+h,z1],[x1,y+h,z0]],color);
  }

  tint(hex,k) {
    const rgb=hex.startsWith("#") ? dn(hex) : hex.match(/[\d.]+/g).slice(0,3).map(Number);
    return `rgb(${rgb.map(v=>Math.round(Math.min(255,v*k))).join(",")})`;
  }

  cylinder(x,y,z,r,h,color,n=28) {
    const rings=[0,.025,.065,.86,.92,.96,1].map((t,i)=>({y:y+h*t,r:r*([.7,.9,1,1,.94,.8,.38][i])}));
    for(let j=0;j<rings.length-1;j++) for(let i=0;i<n;i++) {
      const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,lo=rings[j],hi=rings[j+1];
      const point=(angle,ring)=>[x+Math.cos(angle)*ring.r,ring.y,z+Math.sin(angle)*ring.r];
      const lightAt=angle=>.52+.43*Math.max(0,Math.cos(angle+1.6))+.13*Math.pow(Math.max(0,Math.cos(angle+1.85)),16);
      this.polygon([point(a,lo),point(a,hi),point(b,hi),point(b,lo)],this.tint(color,lightAt(a)));
      this.mesh.at(-1).smooth={to:this.tint(color,lightAt(b)),edge:3};
    }
    const top=rings.at(-1);
    this.polygon(Array.from({length:n},(_,i)=>[x+Math.cos(i/n*Math.PI*2)*top.r,top.y,z+Math.sin(i/n*Math.PI*2)*top.r]),this.tint(color,.9));
  }

  tube(points,color,width) { this.mesh.push({points,color,width,line:true,layer:this.layer??0}); }

  pontoon(side) {
    const S=expeditionBoatStyle;
    const rings=[[-1.3,.12],[-1.18,.65],[-.95,.94],[-.6,1],[5.7,1],[6.1,.95],[6.45,.72],[6.65,.1]];
    const point=(ring,a)=>[side*2.43+Math.cos(a)*.48*ring[1],.3+Math.sin(a)*.48*ring[1],ring[0]];
    for(let j=0;j<rings.length-1;j++)for(let i=0;i<28;i++){
      const a=i/28*Math.PI*2,b=(i+1)/28*Math.PI*2;
      const lightAt=angle=>.37+.55*Math.max(0,Math.sin(angle))+.14*Math.max(0,-Math.cos(angle)*side);
      const color=this.tint(S.hull[0],lightAt(a));
      this.polygon([point(rings[j],a),point(rings[j],b),point(rings[j+1],b),point(rings[j+1],a)],color);
      this.mesh.at(-1).smooth={to:this.tint(S.hull[0],lightAt(b)),edge:1};
    }
    for(const z of [-.5,1.5,3.5,5.5]){
      this.tube(Array.from({length:23},(_,i)=>[side*2.43+Math.cos(i/22*Math.PI)*.483,.3+Math.sin(i/22*Math.PI)*.483,z]),"#324d5e",.012);
      this.tube([[side*2.4,.8,z-.18],[side*2.4,.86,z-.1],[side*2.4,.86,z+.1],[side*2.4,.8,z+.18]],S.rubstrip,.055);
    }
    this.tube([[side*2.85,.38,-.75],[side*2.92,.38,2.5],[side*2.85,.38,6]],S.rubstrip,.09);
    this.tube([[side*2.42,.81,-.8],[side*2.42,.83,5.8]],"#d4cfb1",.024);
  }

  buildScene() {
    this.mesh=[];
    this.layer=0;
    const ice=this.environment.setting==="ice";
    if(!ice) {
      this.box(0,-.17,3,4.8,.18,8,"#738b98");
      // Aluminium deck slats and two dark rubber pontoons.
      for(let z=-.8;z<6.7;z+=.35) this.box(0,.015,z,4.5,.018,.025,"#a9b7bd");
      for(const side of [-1,1]) {
        this.pontoon(side);
      }
      this.box(0,.05,5.65,4.65,.4,.85,"#5c716d");
      this.box(0,.46,5.65,4.8,.09,.95,"#8e9b84");
      this.box(-1.25,.55,5.6,1.2,.6,.7,"#485c4b");
      this.box(-1.25,1.15,5.6,1.24,.08,.74,"#697b58");
      this.box(-1.25,.63,5.23,.12,.42,.018,"#232e2a");
      this.box(.9,.56,5.6,1.3,.55,.75,"#b6b89c");
      this.box(.9,1.11,5.6,1.34,.07,.79,"#d1ceb1");
      this.box(.9,.68,5.21,.18,.2,.03,"#626d60");
      // Stern motor and boarding ladder belong to the same model in both views.
      this.box(0,.1,-.8,4.3,.32,.12,expeditionBoatStyle.deck);
      this.box(0,.05,-1.15,.22,.55,.22,expeditionBoatStyle.rubstrip);
      this.box(0,.45,-1.25,.64,.54,.52,expeditionBoatStyle.rubstrip);
      this.box(0,.82,-1.25,.66,.08,.54,expeditionBoatStyle.hull[1]);
      this.box(0,-.85,-1.37,.12,1.02,.12,expeditionBoatStyle.hull[2]);
      this.tube([[-.23,-.8,-1.43],[.23,-.8,-1.43]],expeditionBoatStyle.rubstrip,.06);
      for(const x of [1.4,1.85]) this.tube([[x,.35,-.7],[x,.48,-.95],[x,.3,-1.37],[x,-1.05,-1.37]],expeditionBoatStyle.metal[0],.055);
      for(const y of [-.95,-.6,-.25,.1]) this.tube([[1.4,y,-1.37],[1.85,y,-1.37]],expeditionBoatStyle.metal[1],.065);
    }
    // Folding work table: thin metal edges and a visibly separate top.
    for(const x of [-1.8,1.8]) for(const z of [1.4,3.7]) this.box(x,.02,z,.075,1.03,.075,"#7f918b");
    this.box(0,1.02,2.55,4.2,.12,2.7,"#78939e");
    this.box(0,1.08,2.55,4.15,.055,2.66,"#b9c6c9");
    this.mesh.at(-1).detail=()=>this.tableDetail();
    this.box(0,1.04,1.18,4.24,.075,.045,"#c1d2d8");
    // The table is a planar occluder. Draw the things resting on it afterwards.
    this.layer=1;
    this.polygon([[-.86,1.142,1.75],[-.79,1.142,3.65],[.86,1.142,3.56],[.92,1.142,1.7]],"#dbd3af",()=>this.drawMap());
    // Album, loose prints and a pencil.
    this.box(-1.45,1.14,2.47,.82,.06,1.18,"#313e39");
    this.box(-1.45,1.2,2.47,.76,.012,1.12,"#c4bca0");
    this.tube([[-1.45,1.216,1.93],[-1.45,1.216,3]],"#766c51",.018);
    for(const x of [-1.64,-1.27]) for(const z of [2.22,2.72]) this.photo(x,1.22,z,.3,.4);
    this.photo(-1.39,1.143,1.58,.4,.43);
    this.tube([[.95,1.16,1.9],[1.04,1.16,2.5]],"#cf9454",.025);
    this.layer=0;
    // Upright cylinders on the equipment rack behind the table.
    for(const x of [1.3,1.87]) {
      this.cylinder(x,.15,4.05,.26,1.95,expeditionBoatStyle.metal[0]);
      this.cylinder(x,2.1,4.05,.075,.16,"#8eaca5",10);
      this.box(x,2.24,4.05,.27,.055,.12,"#647a73");
      this.box(x+.15,2.22,4.05,.08,.1,.16,"#162b2c");
      this.box(x,1.88,3.79,.22,.17,.018,"#d4c986");
      this.tube([[x,2.25,3.97],[x-.25,2.12,3.77],[x-.42,1.65,3.74],[x-.4,.8,3.7],[x-.15,.4,3.5],[x+.18,.6,3.46],[x+.12,.95,3.5]],"#172c2c",.055);
    }
    for(const y of [.63,1.58]) this.box(1.59,y,3.76,1.1,.12,.06,"#283d38");
    this.box(1.58,.68,3.71,.15,.15,.04,"#a7b4a1");
    this.box(1.58,1.63,3.71,.15,.15,.04,"#a7b4a1");
    // Torch and reel rest beside the map, their silhouettes echo dive gear.
    this.layer=1;
    this.box(1.38,1.14,2.15,.3,.19,.65,"#293d39");
    this.box(1.38,1.15,1.81,.34,.17,.09,"#7c9a85");
    this.box(1.38,1.17,1.76,.22,.12,.018,"#c4d7b8");
    this.cylinder(1.45,1.14,3.05,.28,.18,"#b5b68b",16);
    this.cylinder(1.45,1.32,3.05,.12,.075,"#465d4b",12);
    this.box(1.46,1.39,3.04,.48,.065,.1,"#344c42");
    this.box(1.67,1.39,3.04,.06,.16,.1,"#59735b");
    this.tube([[1.15,1.15,3.05],[1.08,1.15,3.35],[1.27,1.15,3.55],[1.68,1.15,3.57]],"#d4cf9c",.014);
    this.layer=0;
    // Small field lantern provides a local light source in a night chapter.
    this.cylinder(-2.12,.03,4.35,.2,.08,"#354f45",10);
    this.cylinder(-2.12,.11,4.35,.14,.32,"#c5d6a9",10);
    this.cylinder(-2.12,.43,4.35,.2,.1,"#557264",10);
  }

  photo(x,y,z,w,d) {
    this.polygon([[x-w/2,y,z-d/2],[x-w/2,y,z+d/2],[x+w/2,y,z+d/2],[x+w/2,y,z-d/2]],"#ded9bd");
    const originalLayer=this.layer;
    this.layer=2;
    this.polygon([[x-w*.39,y+.002,z-d*.28],[x-w*.39,y+.002,z+d*.4],[x+w*.39,y+.002,z+d*.4],[x+w*.39,y+.002,z-d*.28]],"#35646a");
    this.polygon([[x-w*.39,y+.003,z+d*.05],[x-w*.15,y+.003,z+d*.2],[x+w*.05,y+.003,z+d*.08],[x+w*.39,y+.003,z+d*.24],[x+w*.39,y+.003,z+d*.4],[x-w*.39,y+.003,z+d*.4]],"#1f3c40");
    this.layer=originalLayer;
  }

}
