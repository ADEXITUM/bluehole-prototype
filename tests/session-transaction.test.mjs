import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function runtime(storage=new Map()){
  let refuse=()=>false;
  let reads=0,writes=0;
  const ctx=vm.createContext({document:{createElement:()=>({relList:{supports:()=>true}})},window:{location:{search:''}},URLSearchParams,
    localStorage:{getItem:key=>{reads++;return storage.get(key)??null;},setItem(key,value){writes++;if(refuse(key,JSON.parse(value)))throw Error('quota');storage.set(key,value);}},
    captureDiveCheckpoint:game=>({version:1,site:'hub',diveId:'dive-1',state:JSON.parse(JSON.stringify(game.state))}),
    validateDiveCheckpoint:(snapshot,world)=>snapshot?.version===1&&snapshot.site===world.site.id,
  });
  for(const path of ['engine/settings','engine/expedition-data','engine/instructor','engine/sites','engine/hud-hints','engine/persistence','survey/session']){
    vm.runInContext(readFileSync(new URL('../src/'+path+'.js',import.meta.url),'utf8'),ctx,{filename:path});
  }
  const api=vm.runInContext('({ExpeditionSession,recoverDiveDelivery,collectExpeditionWrites,Me,de,Qs,qt,Bn,_f,rf,Il})',ctx);
  return {api,storage,io:()=>({reads,writes}),refuse:callback=>{refuse=callback;}};
}
const game=()=>({mode:'dive',state:{tWall:0,bar:171},tm:{cur:{meta:{id:'dive-1'}}},pauseUI:{conflict(){this.conflicts=(this.conflicts??0)+1;}}});
const plain=value=>JSON.parse(JSON.stringify(value));

test('staged reads and existence agree and exceptions publish no partial progress',()=>{
  const {api:a}=runtime();a.de(a.qt('season'),{dives:2});
  assert.throws(()=>a.collectExpeditionWrites(()=>{
    a.de(a.qt('season'),{dives:3});a.de(a.qt('film'),{test:1});
    assert.equal(a.Me(a.qt('season')).dives,3);assert.equal(a.Qs(a.qt('film')),true);throw Error('interrupted');
  }));
  assert.equal(a.Me(a.qt('season')).dives,2);assert.equal(a.Qs(a.qt('film')),false);
});

test('periodic saves retain resources, forced pause captures the latest moment, and quota preserves the previous checkpoint',()=>{
  const r=runtime(),a=r.api,g=game(),session=new a.ExpeditionSession();assert.equal(session.begin(g),true);
  g.state.tWall=2;g.state.bar=170;session.save(g);assert.equal(a.Me(a.qt('session')).snapshot.state.bar,171);
  session.save(g,true);assert.equal(a.Me(a.qt('session')).snapshot.state.bar,170);
  r.refuse(()=>true);g.state.bar=169;g.state.tWall=8;assert.equal(session.save(g),false);
  assert.equal(a.Me(a.qt('session')).snapshot.state.bar,170);
});

test('an old page cannot overwrite a claimed dive, abandon it, or deliver rewards',()=>{
  const {api:a}=runtime(),g=game(),session=new a.ExpeditionSession();session.begin(g);
  const claimed={...a.Me(a.qt('session')),token:'new-page'};a.de(a.qt('session'),claimed);
  assert.equal(session.save(g,true),false);assert.equal(session.finish(),false);
  let callback=false;assert.equal(session.deliver(g,()=>{callback=true;}),false);assert.equal(callback,false);
  assert.equal(a.Me(a.qt('session')).token,'new-page');assert.ok(g.pauseUI.conflicts>=1);
});

test('ordinary simulation steps do not read or rewrite large storage records, including after quota failure',()=>{
  const r=runtime(),a=r.api,g=game(),session=new a.ExpeditionSession();session.begin(g);const before=r.io();
  for(let i=1;i<120;i++){g.state.tWall=i/60;session.save(g);}
  assert.deepEqual(r.io(),before);
  r.refuse(()=>true);g.state.tWall=6;session.save(g);const failed=r.io();
  for(let i=1;i<120;i++){g.state.tWall=6+i/60;session.save(g);}
  assert.deepEqual(r.io(),failed,'storage errors must not cause a write storm');
});

test('a first save rejected by storage can retry delivery without pretending another page owns the dive',()=>{
  const r=runtime(),a=r.api,g=game(),session=new a.ExpeditionSession();r.refuse(()=>true);
  assert.equal(session.begin(g),false);g.mode='ending';
  assert.equal(session.deliver(g,()=>delivery(a)),false);assert.equal(session.error,'storage');
  r.refuse(()=>false);assert.equal(session.deliver(g,()=>delivery(a)),true);assert.equal(a.Bn().dives,1);
});

function delivery(a){
  a._f(['entry-tag'],12,true,{});
  a.de(a.qt('lines'),{testLine:[[1,2],[3,4]]});
  a.de(a.qt('film'),{id:'delivered-film'});
  a.de(a.qt('learning'),{version:1,practiced:['stop']});
}

test('failure before the atomic commit keeps all previous progress and retries the same computed delivery',()=>{
  const r=runtime(),a=r.api,g=game(),session=new a.ExpeditionSession();session.begin(g);g.mode='ending';
  r.refuse((key,value)=>key===a.qt('session')&&value.status==='delivered');
  let calls=0;assert.equal(session.deliver(g,()=>{calls++;delivery(a);}),false);
  assert.equal(a.Bn().dives,0);assert.equal(a.Me(a.qt('film')),null);assert.equal(a.Me(a.qt('session')).active,true);
  r.refuse(()=>false);assert.equal(session.deliver(g,()=>{calls++;delivery(a);}),true);
  assert.equal(calls,1);assert.equal(a.Bn().dives,1);assert.equal(session.deliver(g,()=>{calls++;}),true);assert.equal(calls,1);
  // A new outing must not inherit the completed guard.
  session.begin(g);assert.equal(session.completed,false);
});

test('interruption at every materialization boundary replays exact after-values once, including failure clearing the journal',()=>{
  for(let boundary=0;boundary<5;boundary++){
    const r=runtime(),a=r.api,g=game(),session=new a.ExpeditionSession();session.begin(g);g.mode='ending';
    let committed=false,index=0;
    r.refuse((key,value)=>{
      if(key===a.qt('session')&&value.status==='delivered'){committed=true;return false;}
      return committed&&index++>=boundary;
    });
    assert.equal(session.deliver(g,()=>delivery(a)),false,'boundary '+boundary);
    assert.equal(a.Me(a.qt('session')).status,'delivered');
    const cold=runtime(r.storage).api;
    assert.equal(cold.recoverDiveDelivery(),true);const after=plain(cold.Bn());
    assert.equal(after.dives,1);assert.deepEqual(after.found,['entry-tag']);assert.equal(cold.Me(cold.qt('film')).id,'delivered-film');
    assert.equal(cold.recoverDiveDelivery(),true);assert.deepEqual(plain(cold.Bn()),after);
  }
});

test('a committed delivery blocked by quota stays pending and cannot be mistaken for a resumable dive',()=>{
  const r=runtime(),a=r.api,g=game(),session=new a.ExpeditionSession();session.begin(g);g.mode='ending';
  r.refuse(key=>key===a.qt('learning'));assert.equal(session.deliver(g,()=>delivery(a)),false);
  assert.equal(a.recoverDiveDelivery(),false);assert.equal(a.Me(a.qt('session')).status,'delivered');
  const reloaded=new a.ExpeditionSession();assert.equal(reloaded.available({site:{id:'hub'}}),false);
});

test('a committed journal cannot write another expedition or a profile setting',()=>{
  const {api:a}=runtime();a.de(a.qt('session'),{version:2,site:'hub',status:'delivered',writes:[['bluehole-photo-survey:sound',true]]});
  assert.equal(a.recoverDiveDelivery(),false);assert.equal(a.Me('bluehole-photo-survey:sound'),null);
});
