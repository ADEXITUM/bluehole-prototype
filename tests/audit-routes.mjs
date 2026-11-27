// Diagnostic, not a playtest or a safety guarantee. The driver knows the whole
// map, never aims a camera and uses automatic depth holding at stops. Idle time
// below means no input: current can move the diver. Run: node tests/audit-routes.mjs
import {createDive,world} from './helpers/dive-simulator.mjs';

const cases=[
  {route:'upper',back:'single',slots:['reel','light'],pause:4},
  {route:'upper',back:'twin',slots:['reel','light'],pause:30},
  {route:'middle',back:'twin',slots:['reel','light'],pause:20},
  {route:'middle',back:'twin',slots:['reel','light'],pause:60},
  {route:'lower',back:'twin',slots:['reel','light'],pause:6},
  {route:'lower',back:'twin',slots:['reel','deco50'],pause:20},
];
const round=n=>Math.round(n*10)/10;
for(const config of cases){
  const d=createDive({...config,current:.2}),points=[];
  const record=label=>points.push({label,gameSeconds:round(d.state.t),inputSeconds:round(d.state.tWall),x:round(d.state.diver.x),depth:round(d.state.depth),backBar:round(d.state.tanks[0].bar),turnBar:round(d.state.tanks[0].marks[0]??0),stop:d.state.stop});
  let error=null;
  try{
    if(config.route==='upper'){
      d.go({x:48,y:18.5});record('entrance');
      for(const p of world.olds[0].pts)d.go(p);
      record('dome');d.tie();
      for(const p of [{x:91,y:14},{x:92,y:18},{x:89.4,y:20}])d.go(p);
      d.hold(config.pause);record('scheme after pause');
      for(const p of [{x:92,y:18},{x:91,y:14},...world.olds[0].pts.slice().reverse(),{x:48,y:18}])d.go(p);
    }else if(config.route==='middle'){
      d.go({x:48,y:34.5});record('entrance');
      for(const p of world.olds[1].pts)d.go(p);
      d.tie();d.go({x:94,y:39.5});d.hold(config.pause);record('reel after pause');
      d.go(world.olds[1].pts.at(-1));
      for(const p of world.olds[1].pts.slice().reverse())d.go(p);
      d.go({x:48,y:34});
    }else{
      d.go({x:48,y:46});record('entrance');d.tie();
      d.go({x:81,y:45.5});d.hold(config.pause);record('body after pause');
      d.go({x:94,y:47.5});d.hold(config.pause);record('slate after pause');
      d.go({x:48,y:46});d.go({x:48,y:21});
      if(config.slots.includes('deco50'))d.hold(2,{pick:'deco'});
    }
    d.surface();
  }catch(failure){error=failure.message;}
  console.log(JSON.stringify({config:{...config,current:.2,seed:23},points,result:{...d.result(),inputSeconds:round(d.state.tWall),tanks:d.state.tanks.map(t=>({id:t.id,bar:round(t.bar)}))},error}));
}
