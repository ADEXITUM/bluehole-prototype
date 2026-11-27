import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const ctx=vm.createContext({document:{createElement:()=>({relList:{supports:()=>true}})},window:{location:{search:''}},URLSearchParams,localStorage:{getItem:()=>null,setItem(){}}});
for(const file of ['settings','expedition-data','instructor','sites','hud-hints','dive-math','world','dive-systems','simulation','controls-audio'])vm.runInContext(readFileSync(new URL('../../src/engine/'+file+'.js',import.meta.url),'utf8'),ctx,{filename:file});
vm.runInContext('this.qt=id=>id;this.Me=()=>null;this.de=()=>{};',ctx);
vm.runInContext(readFileSync(new URL('../../src/survey/dive-guide.js',import.meta.url),'utf8'),ctx);
vm.runInContext(readFileSync(new URL('../../src/engine/game.js',import.meta.url),'utf8'),ctx);
export const api=vm.runInContext('({Zh,Ls,T0,xi,nt,z,ri,q,vo,N0,blindLineSignal,ju,SurveyDiveGuide,ExpeditionLearning})',ctx);
export const world=api.Zh('hub');
const step=.5,width=Math.ceil(world.w/step),height=Math.ceil((world.h-world.airRows)/step);
const cells=new Uint8Array(width*height);
for(let y=0;y<height;y++)for(let x=0;x<width;x++)cells[y*width+x]=api.z(world,x*step,y*step)>.36;
const coords=id=>({x:(id%width)*step,y:Math.floor(id/width)*step});
function nearest(point){let best=-1,dist=Infinity;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){
  const x=Math.round(point.x/step)+dx,y=Math.round(point.y/step)+dy,id=y*width+x;
  if(x<0||y<0||x>=width||y>=height||!cells[id])continue;
  const d=Math.hypot(x*step-point.x,y*step-point.y);if(d<dist){dist=d;best=id;}
}assert.ok(best>=0,'walkable endpoint');return best;}
function clear(a,b){const d=Math.hypot(b.x-a.x,b.y-a.y),n=Math.ceil(d/.12);for(let i=0;i<=n;i++)if(api.z(world,a.x+(b.x-a.x)*i/n,a.y+(b.y-a.y)*i/n)<.34)return false;return true;}
export function route(from,to){
  const start=nearest(from),end=nearest(to),target=coords(end),cost=new Map([[start,0]]),came=new Map(),open=[{id:start,f:0}],closed=new Set();
  while(open.length){
    open.sort((a,b)=>b.f-a.f);const {id}=open.pop();if(closed.has(id))continue;if(id===end){const path=[coords(id)];let p=id;while(came.has(p)){p=came.get(p);path.push(coords(p));}return path.reverse();}
    closed.add(id);const p=coords(id),cx=id%width,cy=Math.floor(id/width);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;const x=cx+dx,y=cy+dy,n=y*width+x;if(x<0||y<0||x>=width||y>=height||!cells[n]||closed.has(n))continue;
      const q=coords(n);if(!clear(p,q))continue;const g=cost.get(id)+Math.hypot(dx,dy)*step;if(g>=(cost.get(n)??Infinity))continue;
      cost.set(n,g);came.set(n,id);open.push({id:n,f:g+Math.hypot(q.x-target.x,q.y-target.y)});
    }
  }throw Error('No route to '+JSON.stringify(to));
}

export function createDive({back='twin',slots=['reel'],current=0,seed=23}={}){
  const state=api.Ls(world,{rule:3,bottom:'air',back,slots},seed,{current,deck:[],flows:[0,current,0,0]});
  const guide=new api.SurveyDiveGuide(new api.ExpeditionLearning(),'survey');
  const tick=input=>{api.T0(state,{...api.xi,...input},world);guide.step(state,world);};
  function go(target){
    const path=route(state.diver,target);let index=1,frames=0;
    while(index<path.length&&state.phase==='dive'){
      while(index<path.length-1&&Math.hypot(path[index].x-state.diver.x,path[index].y-state.diver.y)<.55)index++;
      let aim=index;while(aim+1<path.length&&Math.hypot(path[aim+1].x-state.diver.x,path[aim+1].y-state.diver.y)<2&&clear(state.diver,path[aim+1]))aim++;
      const p=path[aim],dx=p.x-state.diver.x,dy=p.y-state.diver.y,d=Math.hypot(dx,dy);
      if(aim===path.length-1&&d<.22)break;
      const speed=Math.min(1.45,d*4);tick({x:dx/d*speed/api.nt.V_MAX_X,y:dy/d*speed/api.nt.V_MAX_Y});
      assert.ok(++frames<18000,'route stalled at '+JSON.stringify({x:state.diver.x,y:state.diver.y,target,gas:state.tanks[0].bar,line:state.line.reel}));
    }
    assert.equal(state.phase,'dive','route must remain survivable');
  }
  function hold(seconds,input={}){for(let i=0;i<seconds*60&&state.phase==='dive';i++)tick(input);}
  function tie(){assert.ok(api.ri(state,world),'tie point must exist');hold(2,{tie:true});hold(.1);}
  function surface(){
    let frames=0;
    while(state.phase==='dive'){
      const target=state.stop>0?state.stop+.35:0,dy=target-state.depth;
      tick(state.stop>0&&Math.abs(dy)<.2?{wait:true}:{y:Math.max(-.48,Math.min(.48,dy*.6))});
      assert.ok(++frames<90000,'ascent must finish');
    }
  }
  function result(){return {outcome:state.outcome.kind,cesa:!!state.outcome.cesa,gas:Math.round(state.tanks[0].bar),time:Math.round(state.t),depth:Math.round(state.maxDepth),stopServed:Math.round(state.stats.stopServedS??0),line:Math.round(state.stats.lineMaxM),fast:state.stats.ascentExcessM};}
  return {state,guide,tick,go,hold,tie,surface,result};
}
