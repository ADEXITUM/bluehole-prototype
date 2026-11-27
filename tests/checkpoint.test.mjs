import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const plain=value=>JSON.parse(JSON.stringify(value));
function runtime(storage=new Map()){
  const ctx=vm.createContext({btoa,atob,document:{createElement:()=>({relList:{supports:()=>true}})},window:{location:{search:''}},URLSearchParams,
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))}});
  for(const file of ['engine/settings','engine/expedition-data','engine/instructor','engine/sites','engine/hud-hints','engine/dive-math','engine/world','engine/dive-systems','engine/simulation','engine/controls-audio','engine/cave-render','engine/scene-art','engine/persistence','engine/telemetry','engine/tutorial','survey/dive-guide','survey/dive-checkpoint'])vm.runInContext(readFileSync(new URL('../src/'+file+'.js',import.meta.url),'utf8'),ctx,{filename:file});
  vm.runInContext(`
  const checkpointTestWorld=Zh('hub');
  function checkpointTestGame(id='checkpoint-dive'){
    const world=checkpointTestWorld,state=Ls(world,{rule:3,bottom:'air',back:'twin',slots:['reel','deco50']},23,{current:.2,deck:['light','empty'],flows:[0,.2,.2,.2]});
    const sink={records:new Map(),calls:[],remove(id){this.calls.push(['remove',id]);this.records.delete(id);},begin(meta){this.records.set(meta.id,{meta,chunks:[]});},chunk(id,k,chunk){this.records.get(id).chunks[k]=chunk;},finish(record){this.records.set(record.meta.id,record);}};
    const tm=new yu(world,sink);tm.begin(state,{id,n:4,date:'2026-11-19',build:'test'});
    const learning=new ExpeditionLearning(),tips=new Pu({on:true,seen:new Set()}),reveal=new Wu({ui:new Set(),said:new Set(),diver:false,lines:true});tips.beginDive();reveal.beginDive();
    const game={world,state,tm,learning,tips,reveal,scene:{explored:new Bd(world),finds:new Vd()},diveGuide:new SurveyDiveGuide(learning,'fate'),
      mode:'dive',noteOpen:null,diveFinds:[],diveNotes:new Set(),shotData:new Map(),diveObserved:new Set(),observationDwell:new Map(),beforeEvidence:new Set(),diveShots:[],
      expeditionTarget:{id:'body',title:'Target'},firstOuting:false,divingChapter:'fate',wasFinished:false,wasStopPracticed:false,shotBar:null,maxDoor:-1,n2Known:false,readShown:false,nextSeed:42,diveIndex:3,endT:0,worldTime:3,time:3,clock:{acc:.01}};
    tm.shotInfo=n=>game.shotData.get(n);return game;
  }
  function checkpointTestTick(game,input={}){const intent={...xi,...input};T0(game.state,intent,game.world);game.diveGuide.step(game.state,game.world);game.tm.onStep(game.state,intent);}
  this.api={makeGame:checkpointTestGame,tick:checkpointTestTick,captureDiveCheckpoint,restoreDiveCheckpoint,validateDiveCheckpoint,diveCheckpointRead,diveCheckpointDecode,diveCheckpointEncode,$0,Di,dl,Bt,Bi,jr,Oo,qr,hi,W0,ii,nr,tr,Map,Set,U,ff,df};
  `,ctx);
  return {a:ctx.api,storage};
}

test('a resumed dive remembers which rope metres were visited and accepts older checkpoints',()=>{
  const {a}=runtime(),game=a.makeGame();
  game.state.routeMarks=new a.Set([10,11,65539]);
  const payload=plain(a.captureDiveCheckpoint(game));
  assert.equal(a.validateDiveCheckpoint(payload,game.world),true);
  const restored=a.makeGame();
  a.restoreDiveCheckpoint(restored,payload);
  assert.deepEqual([...restored.state.routeMarks],[10,11,65539]);
  payload.state.routeMarks.value.push(-1);
  assert.equal(a.validateDiveCheckpoint(payload,game.world),false);
  delete payload.state.routeMarks;
  assert.equal(a.validateDiveCheckpoint(payload,game.world),true);
  a.restoreDiveCheckpoint(restored,payload);
  assert.equal(restored.state.routeMarks?.size??0,0);
});

test('a deep checkpoint continues the same simulation, random sequence, failure, line and silt',()=>{
  const {a}=runtime(),game=a.makeGame();a.$0(game.state,game.world,48,46);a.Di(game.state.tissues,a.Bt.air,46,170);a.dl(game.state);
  const s=game.state;s.line.parent='guide';s.line.parentS=46;s.line.pts=[{x:48,y:46}];s.line.bend=[false];s.line.reel='live';
  a.Bi(s.silt,game.world,48,46,.5,1.5);
  const failure=a.jr(s,'light');s.fail.list.push(failure);a.Oo(s,failure);game.diveGuide.lightTriggered=true;
  for(let i=0;i<90;i++)a.tick(game,{x:.1});
  const payload=plain(a.captureDiveCheckpoint(game));assert.equal(a.validateDiveCheckpoint(payload,game.world),true);
  assert.ok(JSON.stringify(payload).length<200000,'sparse water should not fill localStorage');
  const restored=a.makeGame('other');restored.mode='plan';a.restoreDiveCheckpoint(restored,payload);
  assert.equal(restored.mode,'plan','the codec leaves screen ownership to its caller');
  assert.equal(restored.paused,true);assert.equal(restored.clock.acc,0);assert.equal(restored.state.doors,game.world.doorSet);
  for(let i=0;i<600;i++){const input={y:i<180?.04:0,x:i<200?.12:-.05,torch:i>300&&i<430};a.tick(game,input);a.tick(restored,input);}
  assert.deepEqual(plain(restored.state),plain(game.state));assert.equal(a.ii(restored.state.rng),a.ii(game.state.rng));assert.equal(a.ii(restored.state.fail.rng),a.ii(game.state.fail.rng));
  assert.equal(restored.diveGuide.lightTriggered,true);assert.equal(restored.state.silt.d.constructor.name,'Float32Array');
});

test('a staged ascent cylinder, used film, discoveries, guide and tutorial state survive reload',()=>{
  const {a,storage}=runtime(),game=a.makeGame();a.$0(game.state,game.world,48,21);
  Object.assign(game.state.tanks[1],{carried:false,x:48,y:21,onLine:true,bar:137.125});game.state.tanks[0].bar=91.375;
  game.state.camera.frames=1;game.state.camera.charge=3.25;game.state.reading='n1';game.noteOpen='n1';
  game.diveFinds=[{id:'entry-tag',t:12,prog:0}];game.diveNotes.add('n1');game.diveObserved.add('entry-tag');game.observationDwell.set('entry-tag',.75);game.beforeEvidence.add('earlier evidence');
  game.diveShots=[{n:1,img:'data:image/jpeg;base64,AAAA',big:'large in-memory image',finds:['entry-tag'],fresh:['entry-tag'],white:false,marks:{'entry-tag':[.4,.3]},feedback:{kind:'find'}}];
  game.shotData.set(1,{finds:['entry-tag'],fresh:['entry-tag'],white:false,bs:0});game.scene.finds.found.add('entry-tag');game.scene.explored.seen[100]=204;
  Object.assign(game.diveGuide,{wasStop:true,bandSeconds:37,lightTriggered:true,far:true,clock:23.5,gapUntil:27});game.diveGuide.actions.add('line-fixed');game.diveGuide.shown.add('entry');game.diveGuide.enqueue('next','Next lesson',3);
  game.tips.mem.seen.add('deco');game.tips.since.set('ascent',21);game.tips.lastWall=-Infinity;game.reveal.mem.ui.add('camera');game.reveal.known.add('camera');game.reveal.pending.push('camera');
  const payload=plain(a.captureDiveCheckpoint(game));assert.equal(JSON.stringify(payload).includes('large in-memory image'),false);
  const before=[...storage];const restored=a.makeGame('another');const callback=()=>{};restored.tips.persist=callback;
  a.restoreDiveCheckpoint(restored,payload);
  assert.equal(restored.state.tanks[0].bar,91.375);assert.equal(restored.state.tanks[1].bar,137.125);assert.equal(restored.state.tanks[1].carried,false);assert.equal(restored.state.breathing,0);
  assert.equal(restored.state.camera.frames,1);assert.equal(restored.state.camera.charge,3.25);assert.equal(restored.noteOpen,'n1');assert.equal(restored.diveShots[0].big,undefined);
  assert.equal(restored.scene.explored.seen[100],204);assert.equal(restored.scene.finds.found.has('entry-tag'),true);
  assert.equal(restored.diveNotes.has('n1'),true);assert.equal(restored.observationDwell.get('entry-tag'),.75);assert.equal(restored.shotData.get(1).finds[0],'entry-tag');
  assert.equal(restored.diveGuide.bandSeconds,37);assert.equal(restored.diveGuide.actions.has('line-fixed'),true);assert.equal(restored.diveGuide.learning,restored.learning);
  assert.equal(restored.diveGuide.clock,23.5);assert.equal(restored.diveGuide.gapUntil,27);assert.equal(restored.scene.finds.isNew('entry-tag'),false,'resuming cannot rediscover the same photo');
  assert.equal(restored.tips.persist,callback);assert.equal(restored.tips.lastWall,-Infinity);assert.equal(restored.tips.since.get('ascent'),21);assert.equal(restored.reveal.mem.ui.has('camera'),true);
  assert.deepEqual([...storage],before,'restoration must not deliver or award expedition progress');
  const legacy=plain(payload);delete legacy.guide.clock;delete legacy.guide.gapUntil;
  a.restoreDiveCheckpoint(restored,legacy);assert.equal(restored.diveGuide.clock,legacy.state.tWall,'old lesson timers use the former wall clock');
});

test('telemetry resumes its original identity and turn detector without deleting other dives',()=>{
  const {a}=runtime(),game=a.makeGame();for(let i=0;i<200;i++)a.tick(game,{y:.3});
  game.tm.turn.peak={p:8,t:3,w:3,x:52,d:18,bars:{back:170}};game.tm.turn.confirmed=true;game.tm.turn.count=2;
  const payload=plain(a.captureDiveCheckpoint(game)),restored=a.makeGame('unrelated');
  a.restoreDiveCheckpoint(restored,payload);assert.equal(restored.tm.cur.meta.id,'checkpoint-dive');assert.equal(restored.tm.done,false);assert.ok(restored.tm.turn instanceof a.nr);assert.ok(restored.tm.enc instanceof a.tr);
  assert.equal(restored.tm.turn.count,2);assert.equal(restored.tm.turn.peak.bars.back,170);assert.equal(restored.tm.sink.records.has('unrelated'),true);
  for(let i=0;i<120;i++)a.tick(restored,{y:-.2});restored.tm.flush();
  assert.ok(restored.tm.cur.chunks.length>payload.telemetry.cur.chunks.length);assert.equal(restored.tm.sink.records.get('checkpoint-dive').chunks.length,restored.tm.cur.chunks.length);
  restored.state.phase='end';restored.state.outcome={kind:'clean',depth:0,p:0};restored.mode='ending';restored.tm.finish(restored.state);
  const ended=a.makeGame('other-again');a.restoreDiveCheckpoint(ended,plain(a.captureDiveCheckpoint(restored)));assert.equal(ended.tm.done,true);assert.equal(ended.state.phase,'end');
});

test('malformed, incompatible and oversized checkpoints are rejected before live state changes',()=>{
  const {a}=runtime(),game=a.makeGame(),payload=plain(a.captureDiveCheckpoint(game));
  const mutations=[p=>p.version=99,p=>p.site='m7',p=>p.worldSignature='changed',p=>p.state.tanks[0].mix='unknown',p=>p.state.breathing=9,p=>p.state.tissues.pop(),p=>p.state.line.parent='laid',p=>p.state.silt.d.runs=[[p.state.silt.d.length,'AAAAAA==']],p=>p.game.observationDwell={$checkpoint:'map',value:[['unknown',1]]},p=>p.telemetry.cur.meta.id='other',p=>p.explored='garbage',p=>p.padding='x'.repeat(2000001)];
  for(const mutate of mutations){const bad=plain(payload);mutate(bad);assert.equal(a.validateDiveCheckpoint(bad,game.world),false);const previous=game.state;assert.throws(()=>a.restoreDiveCheckpoint(game,bad));assert.equal(game.state,previous);}
  assert.equal(a.validateDiveCheckpoint(payload,game.world),true);
});

test('an active failure, dying sequence and actual pending surface result are not reset by reload',()=>{
  const {a}=runtime(),game=a.makeGame();a.$0(game.state,game.world,58,18.5);
  const event=a.jr(game.state,'freeflow');game.state.fail.list.push(event);a.Oo(game.state,event);a.qr(game.state,event);
  for(let i=0;i<60;i++)a.tick(game);a.hi(game.state,'oog-overhead');for(let i=0;i<50;i++)a.tick(game);
  const restored=a.makeGame('other');a.restoreDiveCheckpoint(restored,plain(a.captureDiveCheckpoint(game)));
  assert.equal(restored.state.fail.list[0].phase,'active');assert.equal(restored.state.dying.cause,'oog-overhead');
  for(let i=0;i<600;i++){a.tick(game);a.tick(restored);}assert.deepEqual(plain(restored.state),plain(game.state));
  const surface=a.makeGame('surface');a.$0(surface.state,surface.world,48,.1);a.W0(surface.state);surface.mode='ending';surface.tm.finish(surface.state);
  const finished=a.makeGame('finished');a.restoreDiveCheckpoint(finished,plain(a.captureDiveCheckpoint(surface)));
  assert.equal(finished.state.phase,'end');assert.deepEqual(plain(finished.state.outcome),plain(surface.state.outcome));assert.equal(finished.state.rng.s,surface.state.rng.s);assert.equal(finished.tm.done,true);
});

test('maximum Float32 silt density and a warm checkpoint remain compact',t=>{
  const {a}=runtime(),game=a.makeGame();a.$0(game.state,game.world,48,35);a.Bi(game.state.silt,game.world,48,35,100,1.5);
  const payload=plain(a.captureDiveCheckpoint(game)),restored=a.makeGame('other');a.restoreDiveCheckpoint(restored,payload);
  assert.equal(Math.max(...restored.state.silt.d),Math.fround(a.U.MAX));
  const start=performance.now();for(let i=0;i<5;i++)a.captureDiveCheckpoint(game);
  t.diagnostic('Warm desktop capture mean: '+((performance.now()-start)/5).toFixed(1)+' ms; payload '+JSON.stringify(payload).length+' characters. Not a phone benchmark.');
});

test('encountering current and halocline permits checkpointing and keeps read receipts after reload',()=>{
  const {a,storage}=runtime(),game=a.makeGame(),s=game.state;
  const buttons={camera:true,auto:true,tie:null,pickup:null,read:false,wait:false},forecast={stop:0,ndl:Infinity};
  a.$0(s,game.world,60,19);s.flow={x:.3,y:0};
  game.reveal.update(s,game.world,buttons,forecast,1/60);
  assert.equal(game.reveal.mem.ui.has('currentHint'),true,'the real current condition must unlock its hint');
  assert.equal(game.reveal.pending.includes('currentHint'),true);
  const halocline=game.world.site.halocline;assert.equal(typeof halocline,'number');
  a.$0(s,game.world,48,halocline-.5);s.diver.aim=Math.PI/2;
  game.reveal.update(s,game.world,buttons,forecast,1/60);
  assert.equal(game.reveal.mem.ui.has('haloclineHint'),true,'looking across the actual halocline must unlock its hint');
  assert.equal(game.reveal.pending.includes('haloclineHint'),true);
  const snapshot=plain(a.captureDiveCheckpoint(game)),restored=a.makeGame('other');
  a.restoreDiveCheckpoint(restored,snapshot);
  for(const id of ['currentHint','haloclineHint']){
    assert.equal(restored.reveal.mem.ui.has(id),true);assert.equal(restored.reveal.pending.includes(id),true);
  }
  restored.reveal.onLessonRead=id=>restored.tips.markSeen(id);
  restored.reveal.persist=mem=>a.ff({...restored.tips.mem,...mem});
  for(const id of ['currentHint','haloclineHint']){const item={id:'hint:'+id};restored.diveGuide.present(item,restored.reveal);restored.diveGuide.complete(item);}
  assert.equal(a.validateDiveCheckpoint(a.captureDiveCheckpoint(restored),restored.world),true);
  const reloaded=runtime(storage).a.df();
  for(const id of ['currentHint','haloclineHint']){
    assert.equal(reloaded.ui.includes(id),true);assert.equal(reloaded.said.includes(id),true,'reload must not discard a valid read receipt');
  }
  assert.equal(reloaded.seen.includes('current'),true);assert.equal(reloaded.seen.includes('halocline'),true);
});
