import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function runtime(){
  const storage=new Map();
  const ctx=vm.createContext({document:{createElement:()=>({relList:{supports:()=>true}})},qt:id=>id,Me:key=>storage.get(key),de:(key,val)=>storage.set(key,structuredClone(val))});
  for(const file of ['engine/settings','engine/expedition-data','engine/instructor','engine/sites','engine/hud-hints','engine/dive-math','engine/world','engine/dive-systems','engine/simulation','survey/dive-guide'])vm.runInContext(readFileSync(new URL('../src/'+file+'.js',import.meta.url),'utf8'),ctx,{filename:file});
  return vm.runInContext('({ExpeditionLearning,SurveyDiveGuide,StopRehearsal,surveyReadiness,Zh,Ls,T0,bt,ut,wn,jr,Oo,ri})',ctx);
}
const api=runtime(),world=api.Zh('hub');
const plan={rule:3,bottom:'air',back:'twin',slots:['reel']};
const state=()=>api.Ls(world,plan,23,{current:0,deck:[]});

test('surface rehearsal neither clears stops above the band nor grants real stop experience',()=>{
  const lesson=new api.StopRehearsal(),memory=new api.ExpeditionLearning();
  lesson.move(6);for(let i=0;i<10;i++)lesson.wait();assert.equal(lesson.done,false);assert.equal(lesson.remaining,3);
  lesson.move(12);lesson.wait();assert.equal(lesson.remaining,3);
  lesson.move(9);for(let i=0;i<3;i++)lesson.wait();assert.equal(lesson.done,true);
  memory.brief('stop');assert.equal(memory.practiced.has('stop'),false);
});

test('reading a lesson is persistent, while unsuccessful in-water practice does not enable complications',()=>{
  const local=runtime(),memory=new local.ExpeditionLearning();
  memory.brief('backup');memory.bank(['stop','backup'],false);
  const reloaded=new local.ExpeditionLearning();assert.equal(reloaded.briefed.has('backup'),true);assert.equal(reloaded.practiced.size,0);
  memory.bank(['line-start','line-fixed'],true);
  assert.equal(new local.ExpeditionLearning().practiced.has('line-fixed'),true);
  memory.reset();assert.equal(new local.ExpeditionLearning().briefed.size,0);
});

test('loadout advice preserves freedom and never mutates equipment',()=>{
  const progress={chapterId:'fate',intention:()=>({long:true}),knows:()=>false,notes:new Set()};
  const selected={back:'single',slots:['deco50','light']},before=structuredClone(selected);
  assert.deepEqual(Array.from(api.surveyReadiness(progress,selected),r=>r.id),['twin','reel']);
  assert.deepEqual(selected,before);
  assert.equal(api.surveyReadiness(progress,plan).length,0);
  assert.equal(api.surveyReadiness(progress,selected,true).length,0);
});

test('turn advice interrupts observations; the first stop lesson tracks current depth and then ends',()=>{
  const memory=new api.ExpeditionLearning(),guide=new api.SurveyDiveGuide(memory,'survey'),s=state();
  guide.enqueue('find','Наблюдение');assert.equal(guide.message(s),'Наблюдение');
  s.ruleT=1;s.tanks[0].marks=[130,65];s.tanks[0].bar=129;s.diver={...s.diver,x:60,y:19};s.depth=19;
  guide.step(s,world);assert.match(guide.message(s),/дошёл до отметки/);
  s.diver.x=47;s.stop=6;s.depth=10;assert.match(guide.message(s),/остановка 6 м/);
  s.depth=6;assert.match(guide.message(s),/Оставайся в скобке/);
  s.depth=4;assert.match(guide.message(s),/выше остановки/);
  s.tWall=9.1;assert.equal(guide.message(s),null);assert.equal(s.stop,6,'finishing the explanation does not clear the required stop');
  const next=new api.SurveyDiveGuide(new api.ExpeditionLearning(),'survey');assert.equal(next.message(s),null,'the explanation does not recur in the next dive');
});

test('accelerated waiting does not consume the readable lifetime of a guide message',()=>{
  const local=runtime(),guide=new local.SurveyDiveGuide(new local.ExpeditionLearning(),'survey'),s=state();
  guide.enqueue('find','Наблюдение');s.tWall=0;
  assert.equal(guide.message(s),'Наблюдение');
  s.t=100;s.tWall=2;assert.equal(guide.message(s),'Наблюдение');
  s.tWall=10;assert.equal(guide.message(s),null);
});

test('a stop obligation alone does not count as having served it',()=>{
  const guide=new api.SurveyDiveGuide(new api.ExpeditionLearning(),'traces'),s=state();
  s.stop=9;s.depth=30;s.diver.y=30;guide.step(s,world);
  s.stop=0;guide.step(s,world);assert.equal(guide.actions.has('stop'),false);
  s.stop=9;s.depth=9;s.diver.y=9;
  s.ceiling=9.2;for(let i=0;i<65;i++)guide.step(s,world);
  assert.equal(guide.bandSeconds,0);
  s.ceiling=8.5;
  for(let i=0;i<65;i++)guide.step(s,world);
  s.stop=6;guide.step(s,world);assert.equal(guide.actions.has('stop'),false);
  s.stop=0;guide.step(s,world);assert.equal(guide.actions.has('stop'),true);
  assert.ok(s.stats.stopServedS>=1);
});

test('a prepared light failure occurs only on a quiet return beside a known line',()=>{
  const local=runtime(),memory=new local.ExpeditionLearning(),guide=new local.SurveyDiveGuide(memory,'fate'),s=local.Ls(world,plan,23,{current:0,deck:[]});
  guide.far=true;s.diver.x=60;s.diver.y=35.1;s.diver.vx=-1;s.depth=35.1;s.siltHere=0;
  assert.equal(guide.canComplicate(s,world),false);
  memory.brief('backup');assert.equal(guide.canComplicate(s,world),false);
  memory.bank(['stop'],true);assert.equal(guide.canComplicate(s,world),true);
  s.alarms.gasOut=true;assert.equal(guide.canComplicate(s,world),false);s.alarms.gasOut=false;
  s.blind=true;assert.equal(guide.canComplicate(s,world),false);s.blind=false;
  s.tanks[0].bar=65;assert.equal(guide.canComplicate(s,world),false);s.tanks[0].bar=100;
  guide.lightTriggered=true;assert.equal(guide.canComplicate(s,world),false);guide.lightTriggered=false;
  memory.bank(['backup'],true);assert.equal(guide.canComplicate(s,world),false);
});
