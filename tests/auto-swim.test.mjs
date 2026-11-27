import test from 'node:test';
import assert from 'node:assert/strict';
import {api,createDive,world} from './helpers/dive-simulator.mjs';

test('the first outbound leg is not accelerated; the very same rope accelerates on return and on a repeat dive',()=>{
  const outbound=createDive();
  outbound.go({x:48,y:18.5});outbound.go({x:54,y:19});
  outbound.hold(.5,{x:.4});outbound.hold(5,{auto:true});
  assert.equal(outbound.state.auto.on,true);assert.equal(outbound.state.stats.fastT,0);
  outbound.hold(.6,{x:-.5});outbound.hold(2,{auto:true});
  assert.equal(outbound.state.timeScale,2);assert.ok(outbound.state.stats.fastT>0);
  const repeat=createDive();repeat.state.routeMarks=new Set(outbound.state.routeMarks);
  repeat.go({x:48,y:18.5});repeat.go({x:54,y:19});repeat.hold(.5,{x:.4});repeat.hold(1,{auto:true});
  assert.equal(repeat.state.timeScale,2);
});

test('blindness and alarms block the actual action and its HUD; the local rope signal works in both headings only on contact',()=>{
  const dive=createDive(),state=dive.state;
  dive.go({x:58,y:19});dive.hold(.5,{x:.4});
  const hud={world,mode:'dive',noteOpen:null,readButton:()=>false};
  for(const hazard of ['clear','blind','gasOut']){
    state.blind=hazard==='blind';state.alarms.gasOut=hazard==='gasOut';
    api.N0(state,{...api.xi,auto:false},0,world);
    assert.equal(api.ju.prototype.buttons.call(hud,state).auto,hazard==='clear');
    api.N0(state,{...api.xi,auto:true},0,world);assert.equal(state.auto.on,hazard==='clear');
  }
  const point=world.olds[0].pts.find(point=>point.x>55);
  Object.assign(state.diver,point);state.blind=true;
  const signal=api.blindLineSignal(state,world);
  assert.match(signal,/Касание/);state.diver.heading+=Math.PI;assert.equal(api.blindLineSignal(state,world),signal);
  state.diver.y-=1.2;assert.equal(api.blindLineSignal(state,world),'Нет контакта с линией');
  state.blind=false;assert.equal(api.blindLineSignal(state,world),'');
});

test('holding auto during the first return in the shaft cannot send the diver deeper',()=>{
  for(const input of [{y:-.4},{ly:-1}]){
    const d=createDive();d.go({x:48,y:10});d.hold(.7,input);
    const depth=d.state.depth;d.hold(4,{auto:true});
    assert.equal(d.state.auto.on,false);
    assert.ok(d.state.depth<=depth+.01,JSON.stringify({depth,after:d.state.depth}));
  }
});

test('auto still follows the cave line toward the exit and is unavailable back in the shaft',()=>{
  const d=createDive();d.go({x:48,y:18.5});
  for(const point of world.olds[0].pts.slice(0,4))d.go(point);
  d.hold(.7,{x:-.4});const x=d.state.diver.x;d.hold(4,{auto:true});
  assert.equal(d.state.auto.on,true);assert.ok(d.state.diver.x<x-2);
  d.go({x:48,y:18.5});d.go({x:48,y:10});d.hold(.7,{y:-.4});
  const depth=d.state.depth;d.hold(4,{auto:true});
  assert.equal(d.state.auto.on,false);assert.ok(d.state.depth<=depth+.01);
});
