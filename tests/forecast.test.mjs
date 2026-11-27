import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const context=vm.createContext({document:{createElement:()=>({relList:{supports:()=>true}})},window:{location:{search:''}},URLSearchParams,localStorage:{getItem:()=>null,setItem(){}}});
for(const file of ['settings','expedition-data','instructor','sites','hud-hints','dive-math','world','dive-systems','simulation']){
  vm.runInContext(readFileSync(new URL('../src/engine/'+file+'.js',import.meta.url),'utf8'),context,{filename:file});
}
const api=vm.runInContext('({Zh,Ls,Di,Bt,cl,fs,E0,al,uo,dl})',context);
const world=api.Zh('hub');
function loaded(){
  const state=api.Ls(world,{rule:3,bottom:'air',back:'twin',slots:['deco50']},23);
  api.Di(state.tissues,api.Bt.air,48,180);
  state.depth=state.diver.y=21;api.dl(state);
  return {state,deco:state.tanks.find(t=>t.id==='deco')};
}

test('ascent forecast excludes a staged cylinder until it is actually picked up',()=>{
  const {state,deco}=loaded();
  assert.equal(api.cl(state).tts,183);
  Object.assign(deco,{carried:false,x:90,y:47,onLine:true});
  assert.equal(api.fs(state).length,0);
  assert.equal(api.cl(state).tts,api.uo(state.tissues,21,api.Bt.air).tts);
  // Proximity alone is not pickup and must not silently promise a gas switch.
  Object.assign(deco,{x:state.diver.x,y:state.diver.y});
  assert.equal(api.cl(state).tts,260);
  api.E0(state,state.tanks.indexOf(deco));
  assert.equal(api.cl(state).tts,183);
});

test('empty active gas removes the time estimate without hiding the actual stop or switching gas',()=>{
  const {state,deco}=loaded();
  api.al(state,{kind:'switch',tank:state.tanks.indexOf(deco)},world);
  api.dl(state);const stop=state.stop;
  deco.bar=0;
  const forecast=api.cl(state);
  assert.equal(forecast.forecastStatus,'no-current-gas');
  assert.equal(forecast.tts,null);assert.equal(forecast.stopTime,null);assert.equal(forecast.ndl,null);
  assert.equal(forecast.stop,stop);assert.ok(stop>0);
  assert.equal(forecast.mix,api.Bt.ean50);
  assert.equal(state.tanks[state.breathing],deco);
  api.al(state,{kind:'switch',tank:0},world);
  assert.equal(api.cl(state).tts,260);
});

test('normal forecast stays conditional and preserves the existing mixture threshold',()=>{
  const {state,deco}=loaded();
  let forecast=api.cl(state);
  assert.equal(forecast.forecastStatus,'conditional');
  assert.equal(forecast.tts,183);assert.equal(forecast.stop,6);assert.equal(forecast.stopTime,68);
  deco.bar=11;
  assert.equal(api.cl(state).forecastStatus,'conditional');
  assert.equal(api.cl(state).tts,183,'the estimate does not claim that this supply is sufficient');
  deco.bar=10;assert.equal(api.cl(state).tts,260);
  deco.bar=0;assert.equal(api.cl(state).tts,260);
});

test('reading a forecast does not alter the dive, tissues, gas, events or random state',()=>{
  for(const variant of ['full','staged','empty']){
    const {state,deco}=loaded();
    if(variant==='staged')deco.carried=false;
    if(variant==='empty'){state.breathing=1;deco.bar=0;}
    const before=JSON.stringify(state);
    for(let i=0;i<20;i++)api.cl(state);
    assert.equal(JSON.stringify(state),before,variant);
  }
});

test('stop assignment and instrument agree when a planned gas becomes unavailable',()=>{
  const state=api.Ls(world,{rule:3,bottom:'air',back:'twin',slots:['deco50']},23);
  api.Di(state.tissues,api.Bt.air,18,267);
  state.depth=state.diver.y=18;api.dl(state);
  assert.equal(state.stop,0);
  const tissues=[...state.tissues];
  state.tanks[1].carried=false;api.dl(state);
  assert.equal(state.stop,3);assert.equal(api.cl(state).stop,state.stop);
  assert.deepEqual([...state.tissues],tissues);
  api.E0(state,1);api.dl(state);
  assert.equal(state.stop,0);assert.equal(api.cl(state).stop,state.stop);
});
