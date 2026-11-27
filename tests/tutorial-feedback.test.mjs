import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const plain=value=>JSON.parse(JSON.stringify(value));
test('discovery is a long low filtered tone and mute prevents synthesis',()=>{
  const {a}=runtime(),sound=new a.td(),oscillators=[],filters=[];
  const param=()=>({value:0,events:[],setValueAtTime(value,time){this.events.push([value,time]);},linearRampToValueAtTime(value,time){this.events.push([value,time]);},exponentialRampToValueAtTime(value,time){this.events.push([value,time]);}});
  const node=()=>({gain:param(),frequency:param(),detune:param(),Q:param(),connect(other){return other;},start(time){this.startTime=time;},stop(time){this.stopTime=time;}});
  sound.ctx={currentTime:5,createGain:node,createOscillator(){const n=node();oscillators.push(n);return n;},createBiquadFilter(){const n=node();filters.push(n);return n;}};sound.master=node();
  sound.muted=true;sound.discovery();assert.equal(oscillators.length,0);
  sound.muted=false;sound.discovery();assert.equal(oscillators.length,4);assert.equal(filters[0].type,'lowpass');
  const voices=oscillators.filter(n=>n.frequency.events.length);
  assert.equal(voices.length,3);assert.ok(voices.every(n=>n.stopTime-n.startTime>=3&&n.frequency.events.every(([hz])=>hz<180)));
  assert.ok(filters[0].frequency.events.every(([hz])=>hz<=450));
});
function runtime(storage=new Map()){
  const timers=new Map();let timerId=0;
  const context=vm.createContext({document:{createElement:()=>({relList:{supports:()=>true}})},window:{location:{search:''},matchMedia:()=>({matches:false})},URLSearchParams,
    localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))},
    setTimeout(callback){const id=++timerId;timers.set(id,callback);return id;},clearTimeout:id=>timers.delete(id)});
  for(const file of ['engine/settings','engine/expedition-data','engine/instructor','engine/sites','engine/hud-hints','engine/dive-math','engine/world','engine/dive-systems','engine/simulation','engine/controls-audio','engine/cave-render','engine/scene-art','engine/persistence','engine/debrief','engine/tutorial','engine/game','survey/dive-guide','survey/first-dive','survey/game']){
    vm.runInContext(readFileSync(new URL('../src/'+file+'.js',import.meta.url),'utf8'),context,{filename:file});
  }
  const a=vm.runInContext('({ExpeditionLearning,SurveyDiveGuide,Wu,As,Zh,Ls,$0,wn,Ys,D0,F0,xi,U,Vd,ju,PhotoSurveyGame,_f,Bn,qt,de,td,X})',context);
  const world=a.Zh('hub');
  return {a,storage,world,timers,state:()=>a.Ls(world,{rule:3,bottom:'air',back:'twin',slots:['reel']},23,{current:0,deck:[]})};
}
function reveal(a,ids=[]){return new a.Wu({ui:new Set(ids),said:new Set(),diver:false,lines:true});}
function messageAt(guide,state,time,world=null,oldReveal=null,eligible=()=>true){state.tWall=time;return guide.message(state,null,world,oldReveal,eligible);}
function hintGame(a,state,world,guide,old=reveal(a)){
  return Object.assign(Object.create(a.PhotoSurveyGame.prototype),{state,world,diveGuide:guide,learning:guide.learning,reveal:old,noteOpen:null,gas:{open:false},tips:{on:true,mem:{seen:new Set()}},notice:{hidden:true},firstOuting:false,input:{lastKeyboard:true},diveShots:[]});
}

test('a read line lesson persists across dives and updates its old presenter receipt',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),memory=new a.ExpeditionLearning(),guide=new a.SurveyDiveGuide(memory,'survey'),old=reveal(a,['tie']);
  const end=world.olds[0].pts.at(-1);a.$0(s,world,end.x,end.y);old.beginDive();
  guide.step(s,world);assert.match(messageAt(guide,s,0,world,old),/старая линия заканчивается/);
  assert.equal(new a.ExpeditionLearning().seen.has('line-end'),false,'merely displaying a lesson does not finish it');
  messageAt(guide,s,9.1,world,old);
  assert.equal(new a.ExpeditionLearning().seen.has('line-end'),true);assert.equal(old.mem.said.has('tie'),true);assert.equal(old.pending.includes('tie'),false);
  const next=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey');next.step(s,world);next.importReveal(old,s,()=>true);
  assert.equal(next.queue.some(item=>item.id==='line-end'||item.id==='hint:tie'),false);
  memory.reset();assert.equal(new a.ExpeditionLearning().seen.size,0);
});

test('an interrupted lesson remains unread but never returns after the urgent turn event',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),memory=new a.ExpeditionLearning(),guide=new a.SurveyDiveGuide(memory,'survey');
  a.$0(s,world,60,19);s.ruleT=1;s.tanks[0].marks=[130,65];s.tanks[0].bar=150;
  guide.enqueue('camera-charge','Зарядка',5);assert.equal(messageAt(guide,s,0,world),'Зарядка');
  s.tanks[0].bar=129;guide.step(s,world);assert.match(messageAt(guide,s,2,world),/дошёл до отметки/);
  assert.equal(new a.ExpeditionLearning().seen.has('camera-charge'),false);
  assert.equal(new a.ExpeditionLearning().presented.has('camera-charge'),true);
  messageAt(guide,s,11.1,world);assert.equal(new a.ExpeditionLearning().seen.has('camera-charge'),false);
  assert.notEqual(messageAt(guide,s,18.2,world),'Зарядка');
  messageAt(guide,s,27.3,world);assert.equal(new a.ExpeditionLearning().seen.has('camera-charge'),false);
  const next=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey');next.enqueue('camera-charge','Зарядка',5);assert.equal(next.queue.length,0);
});

test('leaving an unread line lesson removes stale text and never presents it a second time',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),memory=new a.ExpeditionLearning(),guide=new a.SurveyDiveGuide(memory,'survey');
  const end=world.olds[0].pts.at(-1);a.$0(s,world,end.x,end.y);
  guide.step(s,world);assert.match(messageAt(guide,s,0,world),/старая линия заканчивается/);
  a.$0(s,world,48,6);assert.equal(messageAt(guide,s,1,world),null);assert.equal(memory.seen.has('line-end'),false);
  a.$0(s,world,end.x,end.y);guide.step(s,world);
  assert.equal(messageAt(guide,s,7,world),null);assert.equal(memory.presented.has('line-end'),true);
});

test('performing line actions teaches them immediately and old read receipts migrate',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),memory=new a.ExpeditionLearning(),guide=new a.SurveyDiveGuide(memory,'survey');
  s.line.parent='guide';s.line.reel='live';s.stats.ties=1;guide.step(s,world);
  const loaded=new a.ExpeditionLearning();assert.equal(loaded.seen.has('line-end'),true);assert.equal(loaded.seen.has('line-started'),true);
  const old=reveal(a);old.mem.said.add('turnMarks');old.mem.said.add('ascent');guide.importReveal(old,s,()=>true);
  assert.equal(new a.ExpeditionLearning().seen.has('entry'),true);assert.equal(new a.ExpeditionLearning().seen.has('shaft'),true);
  assert.equal(memory.practiced.size,0,'learning an action does not bank a successful return');
});

test('first murky water teaches silt before blindness and does not repeat next dive',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey');
  a.$0(s,world,48,10);s.siltHere=a.U.MURKY+.02;s.blind=false;
  guide.enqueue('camera-charge','Менее важное объяснение',5);messageAt(guide,s,0,world);
  guide.step(s,world);assert.match(messageAt(guide,s,1,world),/Это ил/);assert.match(guide.active.text,/Отпусти движение/);
  messageAt(guide,s,10.1,world);
  const next=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey');next.step(s,world);
  assert.equal(next.queue.some(item=>item.id==='silt'),false);
  next.learning.reset();const early=new a.SurveyDiveGuide(next.learning,'survey');s.blind=true;s.siltHere=a.U.BLIND;s.tWall=2;
  early.step(s,world);assert.match(early.message(s),/Это ил/,'sudden early blindness must not fall into the old instructor quiet period');
});

test('turn warning recurs for a new dive, but cannot requeue after being read in this dive',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),memory=new a.ExpeditionLearning(),guide=new a.SurveyDiveGuide(memory,'survey');
  a.$0(s,world,60,19);s.ruleT=1;s.tanks[0].marks=[130,65];s.tanks[0].bar=129;
  guide.step(s,world);assert.match(messageAt(guide,s,0,world),/дошёл до отметки/);messageAt(guide,s,9.1,world);
  for(let i=0;i<10;i++)guide.step(s,world);assert.equal(guide.queue.some(item=>item.id==='turn'),false);
  const next=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey');next.step(s,world);
  assert.match(messageAt(next,s,0,world),/дошёл до отметки/);
});

test('pause, note, gas menu and discovery notice do not consume lesson reading time',()=>{
  const r=runtime(),{a,world}=r,state=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey'),old=reveal(a);
  const game=hintGame(a,state,world,guide,old);
  guide.enqueue('camera-charge','Зарядка',5);
  for(let i=0;i<20;i++)game.presentDiveHint(.1,false,()=>true);
  const clock=guide.clock;
  for(const mode of ['paused','note','gas','notice']){
    game.noteOpen=mode==='note'?'n1':null;game.gas.open=mode==='gas';game.notice.hidden=mode!=='notice';
    for(let i=0;i<150;i++)game.presentDiveHint(.1,mode==='paused',()=>true);
    assert.equal(guide.clock,clock,mode+' must not silently consume reading time');
  }
  assert.equal(guide.learning.seen.has('camera-charge'),false);
  game.notice.hidden=true;
  for(let i=0;i<80;i++)game.presentDiveHint(.1,false,()=>true);
  assert.equal(guide.learning.seen.has('camera-charge'),true);
});

test('stop guidance interrupts a lesson once without silently completing or resuming it',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey');
  a.$0(s,world,48,9);guide.enqueue('camera-charge','Зарядка',5);guide.message(s,.1,world);
  s.stop=9;s.ceiling=8.5;
  for(let frame=0;frame<80;frame++)assert.match(guide.message(s,.1,world),/Остановка 9 м/);
  for(let frame=0;frame<40;frame++)guide.message(s,.1,world);
  assert.equal(guide.message(s,.1,world),null,'the stop explanation is a finite lesson, not a permanent banner');
  assert.equal(guide.learning.seen.has('camera-charge'),false,'a completely covered explanation has not been read');
  s.stop=0;s.ceiling=0;assert.equal(guide.message(s,.1,world),null);assert.equal(guide.learning.presented.has('camera-charge'),true);
});

test('a discovery celebration cannot cover an already active turn warning',()=>{
  const r=runtime(),{a,world}=r,state=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey'),old=reveal(a);
  a.$0(state,world,60,19);state.ruleT=1;state.tanks[0].marks=[130,65];state.tanks[0].bar=129;guide.step(state,world);
  const game=hintGame(a,state,world,guide,old);
  game.presentDiveHint(.1,false,()=>true);assert.match(game.guideText,/дошёл до отметки/);
  game.notice.hidden=false;game.guideText=null;game.presentDiveHint(.1,false,()=>true);
  assert.equal(game.notice.hidden,true,'the active warning must retain priority after a new photo');
  assert.match(game.guideText,/дошёл до отметки/);
});

test('fixing a line retires the unfinished instruction and does not repeat it next dive',()=>{
  const r=runtime(),{a,world}=r,state=r.state(),memory=new a.ExpeditionLearning(),guide=new a.SurveyDiveGuide(memory,'survey');
  a.$0(state,world,60,19);state.line.parent='guide';state.line.reel='live';state.stats.ties=0;
  guide.step(state,world);assert.match(messageAt(guide,state,0,world),/Своя линия идёт/);
  state.stats.ties=1;guide.step(state,world);assert.equal(messageAt(guide,state,1,world),null);
  assert.equal(guide.queue.some(item=>item.id==='line-started'),false);
  assert.match(messageAt(guide,state,7,world),/Линия закреплена/);messageAt(guide,state,16.1,world);
  memory.bank(guide.actions,true);
  const next=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey'),nextState=r.state(),end=world.olds[0].pts.at(-1);
  a.$0(nextState,world,end.x,end.y);next.step(nextState,world);
  assert.equal(next.queue.some(item=>item.id==='line-end'),false);
  nextState.line.parent='guide';nextState.line.reel='live';nextState.stats.ties=1;next.step(nextState,world);
  assert.equal(next.queue.some(item=>item.id.startsWith('line-')),false);
});

test('old camera and oxygen explanations cannot re-enter the shared hint queue',()=>{
  const r=runtime(),{a,world}=r,state=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey'),old=reveal(a,['camera','ppo2','gasMenu','read']);
  old.beginDive();guide.importReveal(old,state,()=>true);
  assert.equal(guide.queue.some(item=>['hint:camera','hint:ppo2','hint:gasMenu'].includes(item.id)),false);
  assert.equal(guide.queue.some(item=>item.id==='hint:read'),true,'unrelated contextual instructions still reach the presenter');
  messageAt(guide,state,0,world,old);messageAt(guide,state,9.1,world,old);
  const next=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey');old.beginDive();next.importReveal(old,state,()=>true);
  assert.equal(next.queue.length,0,'re-entering a dive must not replay obsolete explanations');
});

test('the already-read blindness lesson suppresses early-silt teaching and stop guidance beats a photo notice',()=>{
  const r=runtime(),{a,world}=r,state=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey');
  a.$0(state,world,48,9);state.siltHere=a.U.MURKY+.02;guide.step(state,world);
  const game=hintGame(a,state,world,guide);game.tips.mem.seen.add('blind');game.presentDiveHint(.1,false,()=>true);
  assert.equal(new a.ExpeditionLearning().seen.has('silt'),true);assert.equal(guide.queue.some(item=>item.id==='silt'),false);assert.notEqual(guide.active?.id,'silt');
  state.stop=9;state.ceiling=8.5;game.notice.hidden=false;game.presentDiveHint(.1,false,()=>true);
  assert.equal(game.notice.hidden,true);assert.match(game.guideText,/Остановка 9 м/);
});

test('wait is denied outside the actual decompression band even in thick silt',()=>{
  const r=runtime(),{a,world}=r,s=r.state();a.$0(s,world,48,9);s.started=true;s.siltHere=a.U.MURKY+.02;
  const press={...a.xi,wait:true};
  assert.equal(a.Ys(s),false);a.D0(s,press,0);assert.equal(s.wait.on,false);
  s.stop=9;s.ceiling=8.5;s.depth=12;assert.equal(a.Ys(s),false);
  s.depth=8;assert.equal(a.Ys(s),false);
  s.depth=9;assert.equal(a.wn(s),true);assert.equal(a.Ys(s),true);
  a.D0(s,a.xi,0);a.D0(s,press,0);assert.equal(s.wait.on,true);
  s.stop=0;a.D0(s,press,0);assert.equal(s.wait.on,false,'finishing the last stop disables accelerated waiting');
});

test('leaving the decompression band or moving stops active waiting',()=>{
  const r=runtime(),{a,world}=r,s=r.state();a.$0(s,world,48,9);s.started=true;s.stop=9;s.ceiling=8.5;
  const press={...a.xi,wait:true};a.D0(s,press,0);assert.equal(s.wait.on,true);
  s.depth=12;a.D0(s,press,0);assert.equal(s.wait.on,false);
  s.depth=9;a.D0(s,a.xi,0);a.D0(s,press,0);assert.equal(s.wait.on,true);
  a.D0(s,{...press,x:1},1);assert.equal(s.wait.on,false);
});

test('only a newly photographed object triggers discovery sound and notice; repeats still remain on film',()=>{
  const r=runtime(),{a,world}=r,state=r.state(),finder=new a.Vd(),subjects=[{id:'entry-tag',pts:[[5,5]]}];
  const view={ox:0,oy:0,W:200,H:200,zoom:20};let sound=0;
  const game=Object.create(a.PhotoSurveyGame.prototype);Object.assign(game,{state,world,diveFinds:[],diveShots:[],shotData:new Map(),diveObserved:new Set(),shotBar:null,expeditionTarget:null,firstOuting:false,notice:{hidden:true,textContent:''},sound:{discovery(){sound++;}},
    ctx:{},worldTime:0,view:()=>view,photoFrame:()=>({x:0,y:0,size:200}),captureShot:()=>{},photoAssessment:()=>({kind:'find'}),
    scene:{lit:{},draw(){},shoot(s,v,n){return finder.shoot({flashLight:()=>1},v,0,false,n,0,subjects);}}});
  const take=()=>game.onShot({n:game.diveShots.length+1});
  take();assert.equal(sound,1);assert.equal(game.notice.hidden,false);assert.deepEqual(plain(game.diveShots[0].fresh),['entry-tag']);game.hideNotice();
  take();assert.equal(sound,1);assert.equal(game.notice.hidden,true);assert.deepEqual(plain(game.diveShots[1].fresh),[]);assert.equal(game.diveShots.length,2);
  subjects.push({id:'dome',pts:[[6,5]]});take();assert.equal(sound,2);assert.deepEqual(plain(game.diveShots[2].fresh),['dome']);assert.match(game.notice.textContent,/Новая находка/);game.hideNotice();
  const delivered=a._f(['entry-tag','dome'],0,true);assert.deepEqual(plain(delivered.newFinds),['entry-tag','dome']);
  finder.reset(a.Bn().found);take();assert.equal(sound,2);assert.equal(game.notice.hidden,true);
  assert.deepEqual(plain(a._f(['entry-tag','dome'],0,true).newFinds),[]);
  assert.deepEqual(plain(a.Bn().found),['entry-tag','dome']);
});

test('first presentation survives an unsuccessful dive and a fresh runtime for every lesson family',()=>{
  const r=runtime(),{a,world}=r,memory=new a.ExpeditionLearning();
  const ids=['silt','camera-charge','entry','line-end','hint:read','first-move','stop'];
  for(const id of ids){
    const s=r.state(),guide=new a.SurveyDiveGuide(memory,'survey');
    if(id==='silt')s.siltHere=a.U.MURKY+.01;
    if(id==='entry'){a.$0(s,world,60,19);s.ruleT=1;}
    if(id==='line-end'){const end=world.olds[0].pts.at(-1);a.$0(s,world,end.x,end.y);}
    if(id==='first-move')guide.firstLessonId=id;
    if(id==='stop'){a.$0(s,world,48,9);s.stop=9;s.ceiling=8.5;}
    guide.enqueue(id,'Lesson '+id,7);assert.equal(memory.presented.has(id),false,'queueing must not consume '+id);
    assert.ok(guide.message(s,.1,world));assert.equal(guide.active.id,id);
    assert.equal(memory.presented.has(id),true);assert.equal(memory.seen.has(id),false,'one frame is not full reading');
    s.phase='end';s.outcome={kind:'dead',depth:s.depth};memory.bank(guide.actions,false);
  }
  const fresh=runtime(r.storage),loaded=new fresh.a.ExpeditionLearning(),next=new fresh.a.SurveyDiveGuide(loaded,'survey');
  for(const id of ids){assert.equal(loaded.presented.has(id),true);assert.equal(loaded.seen.has(id),false);next.enqueue(id,'Repeated '+id,7);}
  assert.equal(next.queue.length,0,'death and reopening the page do not reset shown lessons');
  loaded.reset();const reset=new fresh.a.ExpeditionLearning();assert.equal(reset.presented.size,0);assert.equal(reset.seen.size,0);
});

test('a queued but unpresented lesson stays available after abandoning the dive',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),memory=new a.ExpeditionLearning(),guide=new a.SurveyDiveGuide(memory,'survey');
  guide.enqueue('hint:read','Чтение',0);guide.enqueue('camera-charge','Зарядка',5);
  assert.equal(guide.message(s,.1,world),'Зарядка');assert.equal(memory.presented.has('hint:read'),false);
  memory.bank([],false);
  const fresh=runtime(r.storage),next=new fresh.a.SurveyDiveGuide(new fresh.a.ExpeditionLearning(),'survey');
  next.enqueue('hint:read','Чтение',0);assert.equal(next.message(fresh.state(),.1,fresh.world),'Чтение');
});

test('the presenter keeps covered line lessons visible despite its own persistent receipt',()=>{
  const r=runtime(),{a,world}=r;
  for(const [id,cover] of [['entry','turnMarks'],['shaft','ascent'],['line-end','tie'],['line-started','tieOffHint']]){
    const s=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey'),old=reveal(a,[cover]);old.beginDive();
    if(id==='entry'){a.$0(s,world,60,19);s.ruleT=1;}
    if(id==='shaft'){a.$0(s,world,48,9);s.ruleT=1;}
    if(id==='line-end'){const end=world.olds[0].pts.at(-1);a.$0(s,world,end.x,end.y);}
    if(id==='line-started'){a.$0(s,world,60,19);s.line.parent='guide';s.line.reel='live';}
    guide.enqueue(id,'Текущий урок '+id,4);const game=hintGame(a,s,world,guide,old);
    game.presentDiveHint(.1,false,()=>true);assert.equal(game.guideText,'Текущий урок '+id);assert.equal(old.mem.said.has(cover),true);
    for(let frame=0;frame<30;frame++){game.presentDiveHint(.1,false,()=>true);assert.equal(game.guideText,'Текущий урок '+id,'the newly written '+cover+' receipt must not erase its own active text');}
    assert.equal(guide.learning.seen.has(id),false,'a presentation receipt is distinct from complete reading');
  }
});

test('generic current and halocline explanations cannot repeat after one frame and a reload',()=>{
  const r=runtime(),{a,world}=r,memory=new a.ExpeditionLearning(),old=reveal(a,['currentHint','haloclineHint']);old.beginDive();
  for(const id of ['currentHint','haloclineHint']){
    const guide=new a.SurveyDiveGuide(memory,'survey'),s=r.state(),eligible=def=>def?.id===id;
    guide.importReveal(old,s,eligible);assert.equal(guide.queue.some(item=>item.id==='hint:'+id),true);
    assert.ok(guide.message(s,.1,world,old,eligible));assert.equal(memory.presented.has('hint:'+id),true);assert.equal(old.mem.said.has(id),true);
  }
  const fresh=runtime(r.storage),guide=new fresh.a.SurveyDiveGuide(new fresh.a.ExpeditionLearning(),'survey'),staleReveal=reveal(fresh.a,['currentHint','haloclineHint']);staleReveal.beginDive();
  guide.importReveal(staleReveal,fresh.state(),()=>true);assert.equal(guide.queue.length,0,'even an old hint queue must respect durable presentation receipts');
});

test('first-dive prompts do not recur when their movement or camera context returns',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'survey'),game=hintGame(a,s,world,guide);
  game.firstOuting=true;a.$0(s,world,48,1);game.presentDiveHint(.1,false,()=>true);assert.equal(guide.active?.id,'first-move');
  a.$0(s,world,48,6);for(let frame=0;frame<60;frame++)game.presentDiveHint(.1,false,()=>true);assert.equal(guide.active?.id,'first-camera');
  a.$0(s,world,48,1);for(let frame=0;frame<120;frame++)game.presentDiveHint(.1,false,()=>true);assert.equal(game.guideText,null);
  a.$0(s,world,48,6);for(let frame=0;frame<120;frame++)game.presentDiveHint(.1,false,()=>true);assert.equal(game.guideText,null);
  const fresh=runtime(r.storage),nextState=fresh.state(),nextGuide=new fresh.a.SurveyDiveGuide(new fresh.a.ExpeditionLearning(),'survey'),next=hintGame(fresh.a,nextState,fresh.world,nextGuide);
  next.firstOuting=true;fresh.a.$0(nextState,fresh.world,48,1);next.presentDiveHint(.1,false,()=>true);assert.equal(next.guideText,null);
  fresh.a.$0(nextState,fresh.world,48,6);next.presentDiveHint(.1,false,()=>true);assert.equal(next.guideText,null);
  next.diveShots=[{finds:['entry-tag']}];nextGuide.gapUntil=nextGuide.clock+7;
  next.presentDiveHint(.1,false,()=>true);assert.equal(nextGuide.active?.id,'first-return','the successful first photo gives its return cue without waiting behind a charge lesson or ordinary gap');
  assert.match(next.guideText,/Снимок есть/);
});

test('later dives retain the stop instrument and waiting without repeating its one-shot explanation',()=>{
  const r=runtime(),{a,world}=r,s=r.state(),guide=new a.SurveyDiveGuide(new a.ExpeditionLearning(),'traces');
  a.$0(s,world,48,9);s.started=true;s.stop=9;s.ceiling=8.5;
  const before=plain(s);assert.match(guide.message(s,.1,world),/Остановка 9 м/);assert.deepEqual(plain(s),before,'displaying the stop lesson cannot change decompression');
  const fresh=runtime(r.storage),nextState=fresh.state(),nextGuide=new fresh.a.SurveyDiveGuide(new fresh.a.ExpeditionLearning(),'traces'),old=reveal(fresh.a);
  fresh.a.$0(nextState,fresh.world,48,9);nextState.started=true;nextState.stop=9;nextState.ceiling=8.5;
  old.update(nextState,fresh.world,{camera:true,auto:true,tie:null,pickup:null,wait:true},{stop:9,ndl:0},1/60);
  assert.equal(nextGuide.message(nextState,.1,fresh.world),null);assert.equal(old.visible('deco'),true);assert.equal(old.visible('wait'),true);assert.equal(fresh.a.wn(nextState),true);assert.equal(fresh.a.Ys(nextState),true);
  nextState.stop=6;nextState.depth=6;nextState.ceiling=5.5;assert.equal(nextGuide.message(nextState,.1,fresh.world),null);assert.equal(fresh.a.Ys(nextState),true);
  const game=hintGame(fresh.a,nextState,fresh.world,nextGuide);game.notice.hidden=false;
  game.presentDiveHint(.1,false,()=>true);
  assert.equal(game.notice.hidden,false,'an already-presented stop lesson must not suppress a new discovery when there is no competing explanation');
});
