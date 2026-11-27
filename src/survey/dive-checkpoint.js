// A checkpoint owns simulation data, never DOM, callbacks or expedition rewards.
// The session layer controls ownership, durable writes and delivery transactions.
const DIVE_CHECKPOINT_MAX_CHARS=2e6;
const diveCheckpointWorldSignatures=new WeakMap();
const diveCheckpointGameFields=['mode','noteOpen','diveFinds','diveNotes','shotData','diveObserved','observationDwell','beforeEvidence','expeditionTarget','firstOuting','divingChapter','wasFinished','wasStopPracticed','shotBar','maxDoor','n2Known','readShown','nextSeed','diveIndex','endT','worldTime','time'];
const diveCheckpointGuideFields=['chapter','actions','queue','shown','active','until','clock','gapUntil','bandSeconds','wasStop','returned','turnSeen','far','lightTriggered'];
const diveCheckpointTipsFields=['mem','phase','card','halt','shown','slowT','slowId','pauseT','wall','lastWall','urgent','since'];
const diveCheckpointRevealFields=['mem','known','pending','line','gap','perDive','ascT','diveT','opened'];
const diveCheckpointTelemetryFields=['cur','done','chunkK','sampleN','flushN','prevBtn','inGal','counts','perf'];
function diveCheckpointPick(object,fields){return Object.fromEntries(fields.filter(key=>object[key]!==undefined).map(key=>[key,object[key]]));}
function diveCheckpointWorldSignature(world){
  if(diveCheckpointWorldSignatures.has(world))return diveCheckpointWorldSignatures.get(world);
  const text=JSON.stringify([world.w,world.h,world.airRows,world.res,world.cells,world.guide,world.olds,world.doors,world.slits]);
  let hash=2166136261;for(let i=0;i<text.length;i++)hash=Math.imul(hash^text.charCodeAt(i),16777619);
  const value=(hash>>>0).toString(36);diveCheckpointWorldSignatures.set(world,value);return value;
}
function diveCheckpointEncode(value){
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number'){
    if(Number.isNaN(value))throw Error('Checkpoint contains NaN');
    return Number.isFinite(value)?value:{$checkpoint:'number',value:value>0?'Infinity':'-Infinity'};
  }
  if(value instanceof Set)return {$checkpoint:'set',value:[...value].map(diveCheckpointEncode)};
  if(value instanceof Map)return {$checkpoint:'map',value:[...value].map(([key,item])=>[diveCheckpointEncode(key),diveCheckpointEncode(item)])};
  if(Array.isArray(value))return value.map(diveCheckpointEncode);
  if(!value||typeof value!=='object'||ArrayBuffer.isView(value))throw Error('Unsupported checkpoint value');
  const result={};
  for(const [key,item] of Object.entries(value)){
    if(['__proto__','constructor','prototype','$checkpoint'].includes(key))throw Error('Invalid checkpoint key');
    if(item!==undefined)result[key]=diveCheckpointEncode(item);
  }
  return result;
}
function diveCheckpointDecode(value,depth=0){
  if(depth>60)throw Error('Checkpoint nesting limit');
  if(value===null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number'){if(!Number.isFinite(value))throw Error('Invalid checkpoint number');return value;}
  if(!value||typeof value!=='object')throw Error('Invalid checkpoint value');
  const decode=item=>diveCheckpointDecode(item,depth+1);
  if(Array.isArray(value))return value.map(decode);
  if(value.$checkpoint){
    if(Object.keys(value).length!==2)throw Error('Invalid checkpoint tag');
    if(value.$checkpoint==='number'&&['Infinity','-Infinity'].includes(value.value))return value.value==='Infinity'?Infinity:-Infinity;
    if(!Array.isArray(value.value))throw Error('Invalid checkpoint collection');
    if(value.$checkpoint==='set')return new Set(value.value.map(decode));
    if(value.$checkpoint==='map'&&value.value.every(pair=>Array.isArray(pair)&&pair.length===2))return new Map(value.value.map(pair=>pair.map(decode)));
    throw Error('Unknown checkpoint tag');
  }
  const result={};for(const [key,item] of Object.entries(value)){
    if(['__proto__','constructor','prototype'].includes(key))throw Error('Invalid checkpoint key');
    result[key]=decode(item);
  }return result;
}
function diveCheckpointPackSilt(silt){
  const runs=[];
  for(let i=0;i<silt.d.length;){
    if(silt.d[i]===0){i++;continue;}
    const start=i;while(i<silt.d.length&&silt.d[i]!==0)i++;
    const bytes=new Uint8Array((i-start)*4),view=new DataView(bytes.buffer);
    for(let j=start;j<i;j++)view.setFloat32((j-start)*4,silt.d[j],true);
    let binary='';for(let j=0;j<bytes.length;j+=8192)binary+=String.fromCharCode(...bytes.subarray(j,j+8192));
    runs.push([start,btoa(binary)]);
  }
  return {...silt,d:{format:'float32le-runs',length:silt.d.length,runs}};
}
function diveCheckpointUnpackSilt(silt,world){
  const dims=mc(world),packed=silt?.d;
  if(silt?.gw!==dims.gw||silt?.gh!==dims.gh||packed?.format!=='float32le-runs'||packed.length!==dims.gw*dims.gh||!Array.isArray(packed.runs))throw Error('Incompatible silt grid');
  const data=new Float32Array(packed.length);let end=0;
  for(const run of packed.runs){
    if(!Array.isArray(run)||run.length!==2||!Number.isInteger(run[0])||run[0]<end||typeof run[1]!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(run[1]))throw Error('Invalid silt run');
    const binary=atob(run[1]);if(!binary.length||binary.length%4)throw Error('Invalid silt bytes');
    end=run[0]+binary.length/4;if(end>data.length)throw Error('Silt outside grid');
    const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0)),view=new DataView(bytes.buffer);
    for(let i=0;i<binary.length/4;i++){
      const value=view.getFloat32(i*4,true);if(!Number.isFinite(value)||value<0||value>Math.fround(U.MAX))throw Error('Invalid silt density');
      data[run[0]+i]=value;
    }
  }
  for(const [key,max] of [['bx0',silt.gw],['bx1',silt.gw-1],['by0',silt.gh],['by1',silt.gh-1]])if(!Number.isInteger(silt[key])||silt[key]<-1||silt[key]>max)throw Error('Invalid silt bounds');
  for(let i=0;i<data.length;i++)if(data[i]!==0){const x=i%silt.gw,y=Math.floor(i/silt.gw);if(x<silt.bx0||x>silt.bx1||y<silt.by0||y>silt.by1)throw Error('Silt outside active bounds');}
  return {...silt,d:data};
}
function captureDiveCheckpoint(game){
  game.tm.flush();
  const state={...game.state,silt:diveCheckpointPackSilt(game.state.silt)};delete state.doors;
  const progress=diveCheckpointPick(game,diveCheckpointGameFields);
  progress.diveShots=game.diveShots.map(shot=>{const {big,...small}=shot;return small;});
  const payload={version:1,site:game.world.site.id,worldSignature:diveCheckpointWorldSignature(game.world),diveId:game.tm.cur?.meta.id,
    state:diveCheckpointEncode(state),game:diveCheckpointEncode(progress),guide:diveCheckpointEncode(diveCheckpointPick(game.diveGuide,diveCheckpointGuideFields)),
    tips:diveCheckpointEncode(diveCheckpointPick(game.tips,diveCheckpointTipsFields)),reveal:diveCheckpointEncode(diveCheckpointPick(game.reveal,diveCheckpointRevealFields)),
    explored:game.scene.explored.serialize(),finds:diveCheckpointEncode({found:game.scene.finds.found,known:game.scene.finds.known}),
    telemetry:diveCheckpointEncode({...diveCheckpointPick(game.tm,diveCheckpointTelemetryFields),turn:{...game.tm.turn}})};
  if(!validateDiveCheckpoint(payload,game.world))throw Error('The dive checkpoint could not be captured');
  return payload;
}
function diveCheckpointRead(payload,world){
  if(!payload||payload.version!==1||payload.site!==world.site.id||payload.worldSignature!==diveCheckpointWorldSignature(world)||typeof payload.diveId!=='string'||!payload.diveId||payload.diveId.length>160||JSON.stringify(payload).length>DIVE_CHECKPOINT_MAX_CHARS)throw Error('Incompatible checkpoint');
  const result={};for(const key of ['state','game','guide','tips','reveal','finds','telemetry'])result[key]=diveCheckpointDecode(payload[key]);
  const s=result.state,g=result.game,guide=result.guide,tips=result.tips,reveal=result.reveal,tm=result.telemetry;
  const require=(valid,message)=>{if(!valid)throw Error(message);};
  const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value)&&!(value instanceof Set)&&!(value instanceof Map);
  const finite=value=>typeof value==='number'&&Number.isFinite(value);
  const point=value=>object(value)&&finite(value.x)&&finite(value.y)&&Math.abs(value.x)<=world.w+100&&Math.abs(value.y)<=world.h+100;
  const ids=new Set(world.site.finds.map(find=>find.id)),notes=new Set(world.site.notes.map(note=>note.id));
  const array=(value,max=10000)=>Array.isArray(value)&&value.length<=max;
  const idSet=(value,known)=>value instanceof Set&&[...value].every(id=>known.has(id));
  require(object(s)&&object(s.plan)&&ar.includes(s.plan.rule)&&['single','twin',undefined].includes(s.plan.back)&&!!Bt[s.plan.bottom]&&array(s.plan.slots,2)&&s.plan.slots.every(id=>['reel','light','deco50','stage',null].includes(id))&&new Set(s.plan.slots.filter(Boolean)).size===s.plan.slots.filter(Boolean).length,'Invalid dive plan');
  const shape=(value,template)=>{
    if(template===null)return;
    if(Array.isArray(template)){require(Array.isArray(value),'Missing checkpoint array');return;}
    if(typeof template==='object'){require(object(value),'Missing checkpoint object');for(const key of Object.keys(template)){if(key==='doors'||key==='silt')continue;require(Object.hasOwn(value,key),'Missing state field '+key);shape(value[key],template[key]);}return;}
    require(typeof value===typeof template&&(typeof value!=='number'||finite(value)||value===template),'Invalid state field');
  };
  shape(s,Ls(world,s.plan,1,{current:0,deck:[]}));
  require(s.routeMarks===undefined||s.routeMarks instanceof Set&&s.routeMarks.size<=10000&&[...s.routeMarks].every(validRouteMark),'Invalid known route');
  require(['dive','end'].includes(s.phase)&&['dive','ending'].includes(g.mode)&&point(s.diver)&&s.depth>=0&&s.depth<=world.h+100&&s.t>=0&&s.tWall>=0&&Number.isInteger(s.frame)&&s.frame>=0,'Invalid dive location or time');
  require(s.phase==='dive'?s.outcome===null:object(s.outcome)&&['clean','dead','dcs'].includes(s.outcome.kind)&&finite(s.outcome.depth),'Invalid dive outcome');
  require(Number.isInteger(g.nextSeed)&&g.nextSeed>=0&&g.nextSeed<=0xffffffff&&Number.isInteger(g.diveIndex)&&g.diveIndex>=0&&Number.isInteger(g.maxDoor)&&g.maxDoor>=-1&&g.maxDoor<world.doors.length,'Invalid dive sequence');
  require(array(s.tanks,3)&&s.tanks.length>0&&s.tanks[0].id==='back'&&new Set(s.tanks.map(t=>t.id)).size===s.tanks.length&&Number.isInteger(s.breathing)&&s.breathing>=0&&s.breathing<s.tanks.length,'Invalid tanks');
  for(const tank of s.tanks)require(object(tank)&&['back','stage','deco'].includes(tank.id)&&!!Bt[tank.mix]&&finite(tank.bar)&&tank.bar>=0&&finite(tank.startBar)&&tank.startBar>0&&tank.bar<=tank.startBar+.01&&finite(tank.volumeL)&&tank.volumeL>0&&['carried','onLine','falling'].every(k=>typeof tank[k]==='boolean')&&array(tank.marks,10)&&tank.marks.every(finite)&&point(tank)&&['vx','vy','fallT'].every(k=>finite(tank[k]))&&(tank.ruleBar===null||finite(tank.ruleBar)),'Invalid tank state');
  require(array(s.tissues,ut.TISSUES.length)&&s.tissues.length===ut.TISSUES.length&&s.tissues.every(v=>finite(v)&&v>=0&&v<100)&&Number.isInteger(s.rng.s)&&Number.isInteger(s.fail.rng.s),'Invalid tissues or RNG');
  require(array(s.laid,Dt.MAX_LINES)&&array(s.line.pts)&&array(s.line.run)&&[...s.line.pts,...s.line.run].every(point)&&['off','live','parked'].includes(s.line.reel),'Invalid line');
  const line=(value,current=false,parentLimit=s.laid.length)=>{
    require(object(value)&&array(value.pts)&&value.pts.every(point)&&array(value.trap)&&value.trap.length===Math.max(0,value.pts.length-1)&&value.trap.every(v=>typeof v==='boolean')&&array(value.bend)&&value.bend.length===value.pts.length&&value.bend.every(v=>typeof v==='boolean'),'Invalid line geometry');
    require((current&&value.parent===null)||['guide','explorer','laid'].includes(value.parent),'Invalid line parent');
    require(Number.isInteger(value.parentIdx)&&finite(value.parentS)&&value.parentS>=0,'Invalid line reference');
    if(value.parent==='laid')require(value.parentIdx>=0&&value.parentIdx<parentLimit,'Missing line parent');
    if(value.parent==='explorer')require(value.parentIdx>=-1&&value.parentIdx<world.olds.length,'Missing explorer parent');
  };
  line(s.line,true);s.laid.forEach((item,index)=>line(item,false,index));
  require(Number.isInteger(s.auto.line)&&s.auto.line>=-1&&s.auto.line<=world.olds.length+s.laid.length+1,'Invalid automatic route');
  require(s.hold===null||object(s.hold)&&Number.isInteger(s.hold.tank)&&s.hold.tank>=0&&s.hold.tank<s.tanks.length&&finite(s.hold.t)&&['switch','pickup','drop'].includes(s.hold.kind)&&typeof s.hold.row==='string','Invalid gas action');
  require(array(s.arrows,10000)&&s.arrows.every(point)&&array(s.fail.list,100)&&s.fail.list.every(f=>object(f)&&['freeflow','light','entangle'].includes(f.kind)&&['armed','warn','active','fixed'].includes(f.phase)&&['t','warnS','drawT','warnT','warnFrame','activeT','fixT','lostBar','x','y','leash','tugT'].every(k=>finite(f[k])))&&array(s.fail.queued,100),'Invalid failures or arrows');
  require(['main','dead','spare'].includes(s.fail.torch)&&array(s.env.deck,1000)&&s.env.deck.every(id=>['empty','freeflow','light','entangle'].includes(id))&&finite(s.env.current)&&(s.env.flows===undefined||array(s.env.flows,100)&&s.env.flows.every(finite)),'Invalid environment');
  require(Number.isInteger(s.camera.frames)&&s.camera.frames>=0&&s.camera.frames<=Q.FRAMES&&finite(s.camera.charge)&&s.camera.charge>=0&&(s.reading===null||notes.has(s.reading))&&(g.noteOpen===null||notes.has(g.noteOpen)),'Invalid camera or reading');
  require(array(g.diveFinds,ids.size)&&g.diveFinds.every(find=>object(find)&&ids.has(find.id))&&idSet(g.diveNotes,notes)&&idSet(g.diveObserved,ids)&&g.beforeEvidence instanceof Set&&[...g.beforeEvidence].every(v=>typeof v==='string'),'Invalid evidence');
  require(g.observationDwell instanceof Map&&[...g.observationDwell].every(([id,t])=>ids.has(id)&&finite(t)&&t>=0)&&g.shotData instanceof Map&&[...g.shotData.keys()].every(n=>Number.isInteger(n)&&n>0&&n<=Q.FRAMES),'Invalid observation or shot map');
  require(array(g.diveShots,Q.FRAMES)&&new Set(g.diveShots.map(shot=>shot.n)).size===g.diveShots.length,'Invalid film');
  for(const shot of g.diveShots){
    require(object(shot)&&Number.isInteger(shot.n)&&shot.n>0&&shot.n<=s.camera.frames&&(shot.img===null||Cl(shot.img))&&array(shot.finds,ids.size)&&shot.finds.every(id=>ids.has(id))&&array(shot.fresh,ids.size)&&shot.fresh.every(id=>shot.finds.includes(id))&&object(shot.marks)&&typeof shot.white==='boolean','Invalid photograph');
    for(const [id,mark] of Object.entries(shot.marks))require(shot.finds.includes(id)&&Array.isArray(mark)&&mark.length===2&&mark.every(v=>finite(v)&&v>=0&&v<=1),'Invalid photo marker');
  }
  require(object(guide)&&typeof guide.chapter==='string'&&guide.actions instanceof Set&&guide.shown instanceof Set&&array(guide.queue,500)&&guide.queue.every(v=>object(v)&&typeof v.id==='string'&&typeof v.text==='string'&&finite(v.priority))&&finite(guide.until)&&finite(guide.bandSeconds)&&['wasStop','returned','turnSeen','far','lightTriggered'].every(k=>typeof guide[k]==='boolean'),'Invalid dive guide');
  require(['clock','gapUntil'].every(key=>guide[key]===undefined||finite(guide[key])&&guide[key]>=0),'Invalid lesson clock');
  require(object(tips)&&object(tips.mem)&&typeof tips.mem.on==='boolean'&&idSet(tips.mem.seen,hf)&&['run','slow','card'].includes(tips.phase)&&tips.since instanceof Map&&[...tips.since].every(([id,time])=>hf.has(id)&&finite(time))&&array(tips.shown)&&tips.shown.every(id=>hf.has(id))&&array(tips.urgent)&&tips.urgent.every(id=>hf.has(id))&&finite(tips.wall)&&(finite(tips.lastWall)||tips.lastWall===-Infinity),'Invalid instructor');
  require(tips.phase!=='card'||object(tips.card)&&hf.has(tips.card.id)&&finite(tips.card.t)&&finite(tips.card.vis0),'Invalid lesson card');
  require(object(reveal)&&object(reveal.mem)&&idSet(reveal.mem.ui,cf)&&idSet(reveal.mem.said,cf)&&idSet(reveal.known,cf)&&array(reveal.pending)&&reveal.pending.every(id=>cf.has(id))&&array(reveal.opened)&&reveal.opened.every(id=>cf.has(id))&&['gap','perDive','ascT','diveT'].every(k=>finite(reveal[k])),'Invalid reveal state');
  require(idSet(result.finds.found,ids)&&idSet(result.finds.known,ids),'Invalid known finds');
  require(typeof payload.explored==='string'&&!!$o(payload.explored,Math.ceil(world.w/Ne.CELL_M),Math.ceil(world.h/Ne.CELL_M)),'Invalid explored map');
  require(object(tm)&&object(tm.cur)&&object(tm.cur.meta)&&tm.cur.meta.id===payload.diveId&&tm.cur.meta.site===world.site.id&&array(tm.cur.meta.cols,200)&&tm.cur.meta.cols.length>0&&tm.cur.meta.cols.every(c=>object(c)&&typeof c.name==='string'&&finite(c.scale)&&c.scale>0)&&array(tm.cur.chunks,10000)&&typeof tm.done==='boolean'&&object(tm.turn)&&Number.isInteger(tm.turn.count)&&tm.turn.count>=0&&typeof tm.turn.confirmed==='boolean'&&object(tm.counts)&&object(tm.prevBtn)&&typeof tm.inGal==='boolean'&&['chunkK','sampleN','flushN'].every(k=>Number.isInteger(tm[k])&&tm[k]>=0),'Invalid telemetry');
  require(tm.chunkK===tm.cur.chunks.length,'Inconsistent telemetry chunks');
  for(const chunk of tm.cur.chunks)require(object(chunk)&&typeof chunk.f==='string'&&Number.isInteger(chunk.n)&&chunk.n>=0&&array(chunk.e,10000)&&eu(chunk.f,tm.cur.meta.cols.length).length===chunk.n,'Invalid telemetry chunk');
  s.silt=diveCheckpointUnpackSilt(s.silt,world);s.doors=world.doorSet;
  return result;
}
function validateDiveCheckpoint(payload,world){try{diveCheckpointRead(payload,world);return true;}catch{return false;}}
function restoreDiveCheckpoint(game,payload){
  // Decode and validate everything before touching the live game or its sink.
  const saved=diveCheckpointRead(payload,game.world),tm=game.tm;
  const {mode,...progress}=saved.game;
  game.state=saved.state;Object.assign(game,progress);
  game.diveGuide??=new SurveyDiveGuide(game.learning,saved.guide.chapter);Object.assign(game.diveGuide,saved.guide);game.diveGuide.learning=game.learning;
  if(saved.guide.clock===undefined){game.diveGuide.clock=saved.state.tWall;game.diveGuide.gapUntil=0;}
  Object.assign(game.tips,saved.tips);Object.assign(game.reveal,saved.reveal);
  game.scene.explored.load(payload.explored);Object.assign(game.scene.finds,saved.finds);
  Object.assign(tm,saved.telemetry);tm.turn=Object.assign(new nr(),saved.telemetry.turn);
  const cols=tm.cur.meta.cols;tm.enc=new tr(cols.length);tm.q=new Int32Array(cols.length);tm.scales=cols.map(col=>col.scale);tm.vals=[];tm.evs=[];
  const sink=tm.sink;if(sink){sink.remove?.(payload.diveId);sink.begin(tm.cur.meta);tm.cur.chunks.forEach((chunk,index)=>sink.chunk(payload.diveId,index,chunk));if(tm.done)sink.finish(tm.cur);}
  game.paused=true;game.clock.acc=0;game.alpha=1;game.prevX=game.state.diver.x;game.prevY=game.state.diver.y;game.lastInput=xi;game.lastButtons=null;
}
