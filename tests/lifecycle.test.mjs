import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function runtime(){
  const storage=new Map(),events={};let full=false;
  const element=()=>({children:[],hidden:false,relList:{supports:()=>true},append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},setAttribute(){},addEventListener(){},classList:{add(){}},focus(){},showModal(){},close(){}});
  const document={hidden:false,createElement:element,body:element(),addEventListener:(type,fn)=>{events[type]=fn;}};
  const ctx=vm.createContext({document,window:{location:{search:''},addEventListener:(type,fn)=>{events[type]=fn;}},URLSearchParams,performance:{now:()=>1000},
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>{if(full===true||typeof full==='function'&&full(key))throw Error('quota');storage.set(key,String(value));}},
    surveyElement:element,SurveyHelp:class{},requestAnimationFrame(){},
  });
  for(const file of ['engine/settings','engine/expedition-data','engine/instructor','engine/sites','engine/hud-hints','engine/persistence','engine/album-equipment','engine/game','survey/chapters','survey/first-dive','survey/session','survey/pause'])vm.runInContext(readFileSync(new URL('../src/'+file+'.js',import.meta.url),'utf8'),ctx,{filename:file});
  const api=vm.runInContext('({Ah,xt,qt,Ve,Me,de,Va,Vn,df,ff,Il,rf,yf,mf,Nl,Bn,gf,ExpeditionProgress,FirstDiveProgress,ExpeditionSession,archiveExpedition,restoreExpedition,restartExpedition,SurveyPause,ju})',ctx);
  return {api,storage,document,events,element,setFull:value=>full=value};
}
const plan={rule:4,bottom:'air',back:'twin',slots:['reel','deco50']};
test('legacy preparation migrates once into Blue Hole; another expedition stays independent',()=>{
  const {api:a,storage}=runtime();storage.set('bluehole-photo-survey:plan',JSON.stringify(plan));
  storage.set('bluehole-photo-survey:tips',JSON.stringify({on:false,seen:['deco'],ui:['deco']}));
  assert.equal(a.Vn().back,'twin');assert.equal(a.df().on,false);
  a.Va({...plan,rule:3});a.Ah('m7');assert.equal(a.Vn().rule,4);
  a.Va({...plan,back:'single'});a.Ah('hub');assert.equal(a.Vn().back,'twin');assert.equal(a.Vn().rule,3);
  a.yf(false);a.Ah('m7');assert.equal(a.mf(),false);
});
test('restart archives the whole expedition and restores it without touching another location',()=>{
  const {api:a}=runtime();a.Nl({found:['body','slate81'],dives:7,bestLineM:45,bestFinds:2});a.Va(plan);
  a.de(a.qt('survey'),{notes:['n6'],explored:'charted'});a.de(a.qt('learning'),{version:1,briefed:['stop'],practiced:['stop']});
  const p=new a.ExpeditionProgress();p.reviewEnding();a.de('bluehole-photo-survey:season',{found:[],dives:91});
  assert.equal(a.restartExpedition(),true);assert.equal(a.Bn().found.length,0);assert.equal(a.Vn().back,'single');assert.equal(new a.FirstDiveProgress().active,true);
  assert.equal(a.restoreExpedition(),true);assert.equal(a.Bn().dives,7);assert.equal(a.Vn().slots[1],'deco50');assert.equal(new a.ExpeditionProgress().endingReviewed,true);
  assert.equal(a.Me(a.qt('survey')).notes[0],'n6');assert.equal(a.Me('bluehole-photo-survey:season').dives,91);
  assert.equal(a.restoreExpedition(),true);assert.equal(a.Bn().found.length,0);
});
test('failed archival never resets the current expedition',()=>{
  const {api:a,setFull}=runtime();a.Nl({found:['slate81'],dives:5});a.Va(plan);setFull(true);
  assert.equal(a.restartExpedition(),false);assert.equal(a.Bn().dives,5);assert.equal(a.Vn().back,'twin');
});
test('restore rolls back if the current run cannot be kept as the previous copy',()=>{
  const {api:a,setFull}=runtime();a.Nl({found:['slate81'],dives:5});assert.equal(a.restartExpedition(),true);
  a.Nl({found:['curtain'],dives:2});setFull(key=>key===a.qt('previous-expedition'));
  assert.equal(a.restoreExpedition(),false);assert.equal(a.Bn().found[0],'curtain');
  assert.equal(a.Me(a.qt('previous-expedition')).values.season.found[0],'slate81');
});
test('a session marker without a checkpoint reports interruption and an old owner cannot clear it',()=>{
  const {api:a}=runtime();const first=new a.ExpeditionSession();assert.equal(first.interrupted,false);first.begin();
  const reload=new a.ExpeditionSession();assert.equal(reload.interrupted,true);reload.begin();first.finish();
  assert.equal(new a.ExpeditionSession().interrupted,true,'an old tab must not clear the new attempt');
  reload.finish();assert.equal(new a.ExpeditionSession().interrupted,false);
});
test('a background or paused game cannot simulate; reading registers once then freezes',()=>{
  const {api:a,document}=runtime();const game=Object.create(a.ju.prototype);Object.assign(game,{mode:'dive',paused:false,noteOpen:null,state:{reading:null}});
  assert.equal(game.canSimulate(),true);document.hidden=true;assert.equal(game.canSimulate(),false);document.hidden=false;
  game.noteOpen='n6';assert.equal(game.canSimulate(),true);game.state.reading='n6';assert.equal(game.canSimulate(),false);
  const controls=game.buttons(game.state);assert.equal(controls.read,true);assert.equal(controls.auto,false);
  assert.equal(controls.tie,null);assert.equal(controls.pickup,null);assert.ok(Number.isFinite(controls.autoDir.y));
  game.noteOpen=null;assert.equal(game.canSimulate(),true);game.paused=true;assert.equal(game.canSimulate(),false);
});
test('blur opens a persistent pause and resume clears input and accumulated time',()=>{
  const {api:a,events,element}=runtime();let resets=0;
  const game={mode:'dive',state:{},frameEl:element(),clock:{acc:12},input:{enabled:true,reset(){resets++;}},boat:{transition:{active:false}}};
  const pause=new a.SurveyPause(game);events.blur();assert.equal(game.paused,true);assert.equal(game.input.enabled,false);assert.equal(game.frameEl.inert,true);
  assert.equal(pause.open,true);pause.resume();assert.equal(game.paused,false);assert.equal(game.clock.acc,0);assert.equal(game.last,1000);assert.ok(resets>=2);
});
test('reviewing the ending is persistent and cannot complete missing evidence',()=>{
  const {api:a}=runtime();a.Nl({found:['body'],dives:1});let p=new a.ExpeditionProgress();p.reviewEnding();assert.equal(p.endingReviewed,false);
  a.Nl({found:['body','slate81'],dives:2});p.refresh();assert.equal(p.isFinished,true);assert.equal(p.endingReviewed,false);
  p.reviewEnding();assert.equal(new a.ExpeditionProgress().endingReviewed,true);
});
