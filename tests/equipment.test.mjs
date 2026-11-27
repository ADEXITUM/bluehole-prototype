import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const context=vm.createContext({document:{createElement:()=>({relList:{supports:()=>true}})}});
for(const file of ["engine/settings","engine/expedition-data","engine/instructor","engine/sites","engine/hud-hints","engine/dive-math","engine/world","engine/dive-systems","engine/simulation","survey/equipment"]){
  vm.runInContext(readFileSync(new URL(`../src/${file}.js`,import.meta.url),"utf8"),context,{filename:file});
}
const {changeSurveyEquipment:change,Ls,Zh,ri,q}=vm.runInContext("({changeSurveyEquipment,Ls,Zh,ri,q})",context);
const basic={rule:3,bottom:"air",back:"single",slots:[]};
const kit={backs:["single","twin"],slots:["deco50","reel","light"]};
const plain=x=>JSON.parse(JSON.stringify(x));

test("visual choices cannot equip locked gear or silently replace a full slot",()=>{
  assert.equal(change(basic,{backs:["single"],slots:[]},{back:"twin"}),null);
  assert.equal(change(basic,kit,{slot:"stage"}),null);
  const full={...basic,slots:["deco50","reel"]};
  assert.equal(change(full,kit,{slot:"light"}),null);
  assert.deepEqual(full.slots,["deco50","reel"]);
  const removed=change(full,kit,{slot:"reel"});
  assert.deepEqual(plain(removed.slots),["deco50"]);
  assert.deepEqual(plain(change(removed,kit,{slot:"light"}).slots),["deco50","light"]);
});

test("a pictured twin and attached ascent cylinder become the real dive loadout",()=>{
  const twin=change(basic,kit,{back:"twin"});
  const prepared=change(twin,kit,{slot:"deco50"});
  const world=Zh("hub");
  const state=Ls(world,prepared,23,{current:0,deck:[]});
  assert.equal(state.tanks.find(t=>t.id==="back").volumeL,24);
  const deco=state.tanks.find(t=>t.id==="deco");
  assert.equal(deco.mix,"ean50");assert.equal(deco.carried,true);
  const reduced=change(change(prepared,kit,{slot:"deco50"}),kit,{back:"single"});
  const fresh=Ls(world,reduced,24,{current:0,deck:[]});
  assert.equal(fresh.tanks.length,1);assert.equal(fresh.tanks[0].volumeL,12);
  assert.deepEqual(basic,{rule:3,bottom:"air",back:"single",slots:[]});
});

test("an explicit destination replaces only that item and cannot duplicate equipment",()=>{
  const full={...basic,slots:["deco50","light"]};
  assert.deepEqual(plain(change(full,kit,{index:0,item:"reel"}).slots),["reel","light"]);
  assert.deepEqual(plain(change(full,kit,{index:1,item:"reel"}).slots),["deco50","reel"]);
  assert.deepEqual(plain(change(full,kit,{index:1,item:"deco50"}).slots),["light","deco50"]);
  assert.deepEqual(plain(change(full,kit,{index:0,item:null}).slots),[null,"light"]);
  assert.equal(change(full,kit,{index:2,item:"reel"}),null);
  assert.equal(change(full,kit,{index:0,item:"stage"}),null);
  const empty=change(change(full,kit,{index:1,item:null}),kit,{index:0,item:null});
  assert.deepEqual(plain(empty.slots),[]);
  assert.deepEqual(plain(change(empty,kit,{index:1,item:"light"}).slots),[null,"light"]);
  assert.deepEqual(full.slots,["deco50","light"]);
});

test("a reel is required to lay new line but does not remove the existing route",()=>{
  const world=Zh("hub");
  const equipped=Ls(world,{...basic,slots:["reel"]},23,{current:0,deck:[]});
  equipped.phase="dive";
  // Find an actual tie-in point on the generated route before testing removal.
  let point;
  for(const candidate of world.guide){
    equipped.diver.x=candidate.x;equipped.diver.y=candidate.y;
    if(ri(equipped,world)){point=candidate;break;}
  }
  assert.ok(point,"the fixture must reach a real existing-line tie-in");
  assert.equal(equipped.line.capacity,q.REEL_M);
  const unequipped=Ls(world,basic,24,{current:0,deck:[]});
  unequipped.phase="dive";unequipped.diver.x=point.x;unequipped.diver.y=point.y;
  assert.equal(unequipped.line.capacity,0);
  assert.equal(ri(unequipped,world),null);
  assert.ok(world.guide.length>1);
});
