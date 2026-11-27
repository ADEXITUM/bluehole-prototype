import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

function runtime(season={dives:0,found:[]}){
  const data=new Map();
  const context=vm.createContext({qt:key=>key,Me:key=>data.get(key)??null,de:(key,value)=>data.set(key,value),Bn:()=>season,eo:()=>({notes:[]}),xt:()=>({id:"hub"})});
  vm.runInContext(readFileSync(new URL("../src/survey/first-dive.js",import.meta.url),"utf8"),context);
  return vm.runInContext("({FirstDiveProgress,firstDiveHint})",context);
}

test("first outing survives empty returns, failed shots and a lost photograph",()=>{
  const {FirstDiveProgress}=runtime();
  const progress=new FirstDiveProgress();
  assert.equal(progress.active,true);
  assert.equal(progress.finish(true,[]),false);
  assert.equal(progress.finish(false,["entry-tag"]),false);
  assert.equal(new FirstDiveProgress().active,true);
  assert.equal(progress.finish(true,["entry-tag"]),true);
  assert.equal(new FirstDiveProgress().active,false);
  progress.reset();
  assert.equal(new FirstDiveProgress().active,true);
});

test("existing expeditions skip the new first outing; an early deeper find also counts",()=>{
  for(const season of [{dives:1,found:[]},{dives:0,found:["dome"]}]){
    const {FirstDiveProgress}=runtime(season);
    assert.equal(new FirstDiveProgress().active,false);
  }
  const {FirstDiveProgress}=runtime();
  const progress=new FirstDiveProgress();
  assert.equal(progress.finish(true,["curtain"]),true);
  assert.equal(progress.active,false);
});

test("first-outing guidance follows evidence from the actual film",()=>{
  const {firstDiveHint}=runtime();
  assert.match(firstDiveHint({depth:.5},[],true),/WASD/);
  assert.match(firstDiveHint({depth:.5},[],false),/пальцем/);
  assert.match(firstDiveHint({depth:5},[],true),/удерживай X/);
  assert.match(firstDiveHint({depth:5},[{finds:[]}],true),/не попала/);
  assert.match(firstDiveHint({depth:5},[{finds:["entry-tag"]}],true),/Снимок есть/);
  assert.match(firstDiveHint({depth:12},[],true),/выше/);
});
