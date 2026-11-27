import test from 'node:test';
import assert from 'node:assert/strict';
import {createDive,world,api,route} from './helpers/dive-simulator.mjs';

function safe(d,minGas){const r=d.result();assert.equal(r.outcome,'clean');assert.equal(r.cesa,false);assert.ok(r.gas>=minGas,JSON.stringify(r));assert.equal(r.fast,0);return r;}

test('the first story answer fits a short return on the starting cylinder before the turn mark',()=>{
  const d=createDive({back:'single',slots:[]});
  d.go({x:48,y:18.5});d.go({x:50.5,y:18.6});d.tick({read:true});
  assert.equal(d.state.reading,'n1','the intended entrance note must be the one the player can read');
  d.tick({read:false});
  const tank=d.state.tanks.find(t=>t.id==='back');assert.ok(tank.bar>tank.marks[0],'finding an answer does not require spending down to the turn mark');
  d.go({x:48,y:18.5});d.surface();const r=safe(d,140);assert.equal(d.guide.wasStop,false);assert.equal(r.line,0);
});

test('the full upper route reaches the scheme with a live line and returns on a twin',()=>{
  const d=createDive();d.go({x:48,y:18.5});for(const p of world.olds[0].pts)d.go(p);
  d.hold(3);d.tie();for(const p of [{x:91,y:14},{x:92,y:18},{x:89.4,y:20}])d.go(p);
  assert.equal(d.state.line.reel,'live');d.hold(4);
  for(const p of [{x:92,y:18},{x:91,y:14},...world.olds[0].pts.slice().reverse(),{x:48,y:18}])d.go(p);
  d.surface();safe(d,100);
});

test('the lower pinch is traversable and a first deep return serves a real stop on air',()=>{
  // Regression: this passage used to be narrower than the physical diver and
  // silently forced a long detour through the columns.
  const path=route(world.olds[1].pts.at(-1),{x:94,y:39.5});
  assert.ok(path.every(p=>p.y>35),'the short passage must be physically open');
  const d=createDive({current:.2});d.go({x:48,y:34.5});for(const p of world.olds[1].pts)d.go(p);
  d.tie();d.go({x:94,y:39.5});assert.equal(d.state.line.reel,'live');d.hold(20);
  d.go(world.olds[1].pts.at(-1));for(const p of world.olds[1].pts.slice().reverse())d.go(p);
  d.go({x:48,y:34});d.surface();const r=safe(d,40);assert.ok(r.stopServed>1);assert.equal(d.guide.actions.has('stop'),true);
});

test('the final route fits the reel and returns with ascent gas and a reserve',()=>{
  const d=createDive({slots:['reel','deco50']});d.go({x:48,y:46});d.tie();
  d.go({x:81,y:45.5});d.hold(6);d.go({x:94,y:47.5});d.hold(6);
  assert.equal(d.state.line.reel,'live');assert.ok(d.state.stats.lineMaxM>40,'this route needs more than the old 40 m spool');
  assert.ok(d.state.stats.lineMaxM<api.q.REEL_M);
  d.go({x:48,y:46});d.go({x:48,y:21});d.hold(2,{pick:'deco'});
  assert.equal(d.state.tanks[d.state.breathing].id,'deco');d.surface();const r=safe(d,30);assert.ok(r.stopServed>1);
});

test('a small adjustment just after tie-in does not park the reel',()=>{
  const d=createDive();d.go({x:48,y:18.5});for(const p of world.olds[0].pts)d.go(p);d.tie();
  d.go({x:86.5,y:14.5});assert.equal(d.state.line.reel,'live');
});
