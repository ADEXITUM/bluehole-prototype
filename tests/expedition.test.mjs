import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

// The production scripts share lexical scope in the HTML bundle. Execute the
// same files together, with in-memory storage and no canvas, browser or timers.
function runtime({reduced = true, cave = false} = {}) {
  const storage = new Map();
  const timers = new Map();
  let serial = 0;
  let now = 0;
  const body = {children: [], append(node) {this.children.push(node);}};
  const element = () => ({
    hidden: false, dataset: {}, style: {setProperty() {}},
    relList: {supports: () => true},
    classList: {toggle() {}}, setAttribute() {}, getBoundingClientRect() {return {};},
  });
  const context = vm.createContext({
    btoa,atob,
    document: {createElement: element, body, activeElement: null},
    window: {location: {search: ""}, addEventListener() {}}, URLSearchParams, localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
    },
    setTimeout: (callback, delay = 0) => {
      const id = ++serial;
      const run = () => {timers.delete(id); callback();};
      run.at = now + delay;
      timers.set(id, run);
      return id;
    },
    clearTimeout: id => timers.delete(id),
    matchMedia: () => ({matches: reduced}),
    // Geometry, death analysis and simulation are outside these persistence tests.
    No: () => 0, ku: () => "тестовый нырок",
    Su: () => ({chain: [], notes: [], broke: null}),
    Ls: (world, plan, seed, env) => ({plan, env, alarms: {}}), Lc: () => ({}),
    vu: (tips, clock, delta, state, step) => {step(); return 1;},
    fl: () => 0, cs: () => null, wo: () => 0, ls: () => null,
    Gd: (v,x,y,top) => x>=v.ox&&x<=v.ox+v.W/v.zoom&&y>=v.oy+top/v.zoom&&y<=v.oy+v.H/v.zoom,
    requestAnimationFrame: () => 0,
    ki: "test", xi: {},
  });
  for (const path of [
    "engine/settings", "engine/expedition-data", "engine/instructor", "engine/sites", "engine/hud-hints",
    ...(cave ? ["engine/dive-math","engine/world","engine/dive-systems","engine/simulation","engine/cave-render"] : []),
    "engine/scene-art", ...(cave ? ["engine/scene","engine/instruments","engine/debrief"] : []),
    "engine/persistence", "engine/album-equipment", "engine/boat", "engine/game", "engine/controls-audio",
    "survey/routes", "survey/guidance", "survey/plan", "survey/chapters", "survey/first-dive", "survey/dive-guide", "survey/photography", "survey/photo-album", "survey/transition", "survey/boat-shell", "survey/game",
  ]) {
    vm.runInContext(readFileSync(new URL("../src/" + path + ".js", import.meta.url), "utf8"), context, {filename: path + ".js"});
  }
  vm.runInContext("this.api = {FirstDiveProgress, firstDiveHint, firstDiveTarget, ExpeditionProgress, ExpeditionBoat, DiveTransition, PhotoSurveyGame, surveyFindVisible, SurveyPlanScreen, upperGalleryHelp, td, ju, Wf, xt, Bn, ji, gf, fn, Si, Mn, Df, _f, Nl, qt, Me, de, Va, Vn, eo, Wl, vi, to, wl, expeditionChapters};", context);
  if (cave) vm.runInContext("Object.assign(api,{Zd,sf,Sd,Vd,of,pl,xi});",context);
  function advance(ms) {
    const until = now + ms;
    while (timers.size) {
      const next = [...timers.values()].sort((a, b) => a.at - b.at)[0];
      if (next.at > until) break;
      now = next.at;
      next();
    }
    now = until;
  }
  return {api: context.api, timers, advance, body};
}

const image = "data:image/jpeg;base64,AAAA";
const plain = value => JSON.parse(JSON.stringify(value));
function deliver(api, ids, kept = true) {
  return api._f(ids, 0, kept, Object.fromEntries(ids.map(id => [id, image])), {dome: [.4, .3]});
}

function gameFixture(api) {
  const noop = () => {};
  const plan = Object.create(api.Wf.prototype);
  Object.assign(plan, {
    plan: {rule: 3, bottom: "air", back: "single", slots: []},
    view: {ladder: true, kit: api.Si(api.xt(), api.fn(), false)},
    render: noop, show: noop, hide: noop, closeTip: noop, setSeason: noop, setLog: noop,
  });
  const game = Object.create(api.PhotoSurveyGame.prototype);
  Object.assign(game, {
    mode: "plan", world: {site: api.xt()}, planScreen: plan, frameEl: {inert: true}, paused: false,
    expedition: new api.ExpeditionProgress(), chosen: "curtain", divingChapter: "survey",
    state: {outcome: {kind: "clean"}, plan: plan.current, tanks: [{id: "back", ruleBar: 180}],
      line: {}, arrows: [], stats: {decoT: 0}, fail: {list: []}},
    diveFinds: [], diveShots: [], diveNotes: new Set(), shotData: new Map(), maxDoor: -1,
    resultScreen: {next: {},heading:{},summary:{}, hide: noop, show(...args) {this.lastDive = args[3];}},
    scene: {explored: {serialize: () => api.wl(1,1,new Uint8Array([1]))}, resetFx: noop},
    tips: {recall: () => null, beginDive: noop}, reveal: {mem: {diver: false}, beginDive: noop},
    tm: {cur: {summary: {}}, begin: noop}, nextSeed: 23, clock: {acc: 0},
    gas: {close: noop}, input: {reset: noop}, intro: {hide: noop}, sound: {init: noop},
    updateAssignment: noop, refreshMap: noop, updateTipsRow: noop, planTips: noop, snapCamera: noop,
    refreshPlanView() {
      this.planScreen.view.kit = api.Si(this.world.site, api.fn(), false);
      this.planScreen.plan = api.Mn(this.planScreen.current, this.planScreen.view.kit);
    },
  });
  const boat = Object.create(api.ExpeditionBoat.prototype);
  Object.assign(boat, {
    game, progress: game.expedition, busy: false, root: {hidden: false, inert: false},
    setScreen(name) {this.screen = name;},
    showBoat() {this.screen = "boat";}, showResult() {this.screen = "result";},
    hide() {this.screen = "dive"; this.root.hidden = true;},
  });
  game.boat = boat;
  boat.transition = new api.DiveTransition(game, boat);
  return game;
}

test('the first photograph raises a nearby answerable question without revealing the lower story',()=>{
  const {api}=runtime(),progress=new api.ExpeditionProgress();
  progress.remember(['entry-tag'],true);
  assert.doesNotMatch(progress.intention().why,/стёртые/,'merely seeing the marker does not read its inscription');
  deliver(api,['entry-tag']);progress.refresh();
  assert.equal(progress.intention().question,'Метка старше разведки Корнеева?');
  assert.equal(progress.intention().long,false,'the first question asks for the nearby entrance, not a long route');
  assert.match(progress.intention().clue,/одной записью/);
  assert.doesNotMatch(JSON.stringify(progress.journal())+JSON.stringify(progress.intention()),/1981|останки|тело|клеймо «81»/);
  assert.equal(progress.canEnter('traces'),false);
  const restored=new api.ExpeditionProgress();assert.equal(restored.intention().question,progress.intention().question);
});

test('the entrance note answers the first question and outranks an incidental photograph',()=>{
  const {api}=runtime();deliver(api,['entry-tag']);const progress=new api.ExpeditionProgress(),before=progress.evidenceKeys();
  api.Wl({map:'',notes:['n1'],dives:1});deliver(api,['curtain']);progress.refresh();
  const report=progress.debrief(before);
  assert.equal(report.answer,true);assert.match(report.text,/до его разведки/);
  assert.equal(report.question,'Есть ли дальше следы прежнего посещения?');
  assert.doesNotMatch(progress.intention().clue,/Когда газ дойдёт/);assert.match(progress.intention().clue,/не цель/);
  assert.equal(progress.canEnter('traces'),false);
  assert.equal(new api.ExpeditionProgress().debrief(progress.evidenceKeys()).changed,false);
  assert.equal(progress.debrief(new Set(progress.journal().map(entry=>JSON.stringify({...entry,priority:999})))).changed,false,'presentation metadata from an older checkpoint cannot create another discovery');
});

test('returning with only the entrance note is a success; an emergency retains its own outcome',()=>{
  for(const outcome of [{kind:'clean'},{kind:'dcs'},{kind:'clean',cesa:true}]){
    const {api}=runtime();deliver(api,['entry-tag']);const game=gameFixture(api);
    game.beforeEvidence=game.expedition.evidenceKeys();game.state.outcome=outcome;game.diveNotes.add('n1');
    game.resultScreen.heading.textContent='Исход нырка';game.resultScreen.summary.textContent='Нужна помощь';
    game.finishDive();
    assert.ok(api.eo().notes.includes('n1'));
    if(outcome.kind==='clean'&&!outcome.cesa){assert.equal(game.resultScreen.heading.textContent,'Метка была здесь раньше');assert.match(game.resultScreen.summary.textContent,/до его разведки/);}
    else {assert.equal(game.resultScreen.heading.textContent,'Исход нырка');assert.equal(game.resultScreen.summary.textContent,'Нужна помощь');}
    assert.match(game.resultScreen.next.textContent,/следы прежнего посещения/);
  }
});

test('a tap spares the film, a deliberate hold exposes once and holding through recharge cannot spend a second frame',async()=>{
  const {createDive}=await import('./helpers/dive-simulator.mjs');
  const dive=createDive({back:'single',slots:[]});
  dive.go({x:48,y:5.8});
  dive.hold(.2,{camera:true});
  dive.hold(.1);
  assert.equal(dive.state.camera.frames,0);
  dive.hold(.9,{camera:true});
  assert.equal(dive.state.camera.frames,1);
  dive.hold(8,{camera:true});
  assert.equal(dive.state.camera.frames,1);
  dive.hold(.1);
  dive.hold(.9,{camera:true});
  assert.equal(dive.state.camera.frames,2);
});

test('a first-outing photo leads to the question, but a lost note cannot answer it',()=>{
  const {api}=runtime(),game=gameFixture(api);game.firstOuting=true;game.firstDive=new api.FirstDiveProgress();
  game.diveFinds=[{id:'entry-tag'}];game.diveShots=[{n:1,finds:['entry-tag'],img:image,marks:{'entry-tag':[.5,.5]}}];
  game.finishDive();assert.equal(game.firstDive.completed,true);assert.equal(game.resultScreen.heading.textContent,'Первый след на лодке');
  assert.match(game.resultScreen.next.textContent,/Метка старше/);
  const lost=gameFixture(api);lost.state.outcome={kind:'dead'};lost.diveNotes.add('n1');lost.finishDive();
  assert.equal(api.eo().notes.includes('n1'),false);assert.equal(lost.expedition.intention().question,'Метка старше разведки Корнеева?');
});

test('a first-ever note with no photograph advances the boat, persists and never invents an album frame',()=>{
  const {api}=runtime(),game=gameFixture(api);
  game.firstOuting=true;game.firstDive=new api.FirstDiveProgress();game.beforeEvidence=game.expedition.evidenceKeys();game.diveNotes.add('n1');
  game.finishDive();
  assert.equal(game.firstDive.active,false);assert.equal(new api.FirstDiveProgress().active,false);
  assert.equal(game.resultScreen.heading.textContent,'Метка была здесь раньше');assert.match(game.resultScreen.next.textContent,/других следов|дальше следы/);
  assert.deepEqual(plain(api.Bn().found),[]);
  api.de(api.qt('first-dive'),{version:1,completed:false});
  assert.equal(new api.FirstDiveProgress().active,false,'repairs an old delivery without requiring a repeat outing');
});

test('a first scout brings a question home without a photo and repairs an older training flag',()=>{
  const {api}=runtime(), game=gameFixture(api);
  game.firstOuting=true;
  game.firstDive=new api.FirstDiveProgress();
  game.beforeEvidence=game.expedition.evidenceKeys();
  game.diveObserved=new Set(['cache']);
  assert.match(api.firstDiveHint({depth:15},[],true,game.diveNotes,game.diveObserved), /новый ориентир/);
  game.finishDive();
  assert.equal(game.firstDive.active,false);
  assert.match(game.expedition.intention().question,/Что белело у стены/);
  assert.deepEqual(plain(api.Bn().found),[]);
  assert.deepEqual(plain(api.eo().notes),[]);
  api.de(api.qt('first-dive'),{version:1,completed:false});
  assert.equal(new api.FirstDiveProgress().active,false);
});

test('a lost scout, an unknown sighting and a glance at the training tag leave the lesson available',()=>{
  const {api}=runtime(), first=new api.FirstDiveProgress();
  for(const [kept,id] of [[false,'cache'],[true,'unknown'],[true,'entry-tag']]){
    assert.equal(first.finish(kept,[],new Set(),new Set([id])),false);
    assert.equal(new api.FirstDiveProgress().active,true);
  }
});

test('route familiarity is banked on return, not death',()=>{
  const {api}=runtime(),game=gameFixture(api);
  game.state.routeMarks=new Set([12,13]);game.finishDive();
  assert.deepEqual(plain(api.eo().routeMarks),[12,13]);
  const lost=gameFixture(api);lost.state.routeMarks=new Set([12,13,21]);lost.state.outcome={kind:'dead'};lost.finishDive();
  assert.deepEqual(plain(api.eo().routeMarks),[12,13]);
});

test('camera frame stays during a lesson; idle, charging and obscured previews do no exposure work',()=>{
  const {api}=runtime(),game=gameFixture(api);
  let held=false,exposures=0;
  Object.assign(game,{time:1,layout:{dpr:1},cameraCue:{dataset:{}},cameraFrame:{style:{}},buttons:()=>({camera:true}),
    view:()=>({}),photoFrame:()=>({x:2,y:3,size:10}),photoAssessment:()=>({kind:'scene',title:'Кадр'})});
  game.state.diver={x:0,y:0,aim:0};game.state.camera={charge:0};game.input.isHeld=()=>held;
  game.scene.previewPhoto=()=>{exposures++;return {light:{},backscatter:0};};
  game.updateCameraCue(true);assert.equal(exposures,0);assert.equal(game.cameraFrame.hidden,true);
  held=true;game.updateCameraCue(true,false);assert.equal(game.cameraFrame.hidden,false);assert.equal(game.cameraCue.hidden,true);assert.equal(exposures,0);
  game.state.camera.charge=1;game.updateCameraCue(true);assert.equal(exposures,0);
  game.state.camera.charge=0;game.updateCameraCue(true);assert.equal(exposures,1);assert.equal(game.cameraCue.hidden,false);
  held=false;game.updateCameraCue(true);assert.equal(game.cameraCue.hidden,true);
});

test("old seasons migrate to the first unfinished chapter without losing photographs", () => {
  const {api} = runtime();
  deliver(api, ["curtain", "dome"]);
  const progress = new api.ExpeditionProgress();
  assert.equal(progress.chapterId, "traces");
  assert.equal(progress.hasSeenIntro("survey"), true);
  assert.equal(progress.hasSeenIntro("traces"), false);
  assert.equal(progress.canEnter("fate"), false);
  assert.equal(api.ji().frames.dome, image);
  assert.deepEqual(plain(api.ji().marks.dome), [.4, .3]);
  assert.equal(new api.ExpeditionProgress().chapterId, "traces");
});

test("lost photos do not unlock chapters or overwrite the delivered album", () => {
  const {api} = runtime();
  deliver(api, ["curtain"]);
  const game = gameFixture(api);
  game.state.outcome.kind = "dead";
  game.diveFinds = [{id: "dome"}];
  game.diveShots = [{n: 1, finds: ["dome"], img: image}];
  game.finishDive();
  assert.equal(game.mode, "result");
  assert.equal(game.boat.screen, "result");
  assert.deepEqual(plain(api.Bn().found), ["curtain"]);
  assert.equal(api.ji().frames.curtain, image);
  assert.equal(api.ji().frames.dome, undefined);
  assert.equal(game.expedition.canEnter("traces"), false);
  assert.deepEqual(plain(game.resultScreen.lastDive.gearIds), []);
});

test("route equipment and ascent gas wait on the boat until explicitly selected", () => {
  const {api, timers} = runtime();
  deliver(api, ["curtain"]);
  const game = gameFixture(api);
  game.diveFinds = [{id: "dome"}];
  game.diveShots = [{n: 1, finds: ["dome"], img: image, marks: {dome: [.4, .3]}}];
  game.maxDoor = 1;
  game.finishDive();
  game.prepareRouteGear();
  assert.equal(game.boat.screen, "result");
  assert.deepEqual(plain(game.resultScreen.lastDive.gearIds), []);
  assert.equal(game.resultScreen.next.hidden, false);
  assert.equal(game.planScreen.current.back, "single");
  assert.ok(game.planScreen.view.kit.backs.includes("twin"));
  assert.ok(!game.planScreen.view.kit.slots.includes("deco50"),"crossing an entrance does not introduce ascent gas");
  game.state.stats.decoT=10;game.state.stats.stopServedS=2;game.state.stop=0;
  game.finishDive();
  assert.deepEqual(plain(game.resultScreen.lastDive.gearIds),["ean50"]);
  assert.deepEqual(plain(game.planScreen.current.slots), []);
  assert.ok(game.planScreen.view.kit.slots.includes("deco50"));
  assert.equal(api.ji().frames.dome, image);
  game.showPlan(); // The existing result button calls this method.
  assert.equal(game.boat.screen, "boat");
  assert.equal(game.mode, "plan");
  game.planScreen.setPlan({...game.planScreen.current,back:"twin",slots:["deco50"]});
  game.boat.dive();
  game.boat.dive();
  assert.equal(timers.size, 1);
  for (const callback of timers.values()) callback();
  assert.equal(game.mode, "dive");
  assert.equal(game.state.plan.back, "twin");
  assert.deepEqual(plain(game.state.plan.slots), ["deco50"]);
  assert.deepEqual(plain(api.Vn()), plain(game.state.plan));
});

test("new expeditions follow photographed or read evidence, without a beauty-photo checklist",()=>{
  const {api}=runtime(),progress=new api.ExpeditionProgress();
  assert.equal(progress.intention().id,undefined);
  assert.deepEqual(plain(progress.intention().marker),{x:51,y:18});
  assert.doesNotMatch(JSON.stringify(progress.journal()),/останки|катушк|табличк|карман|1981/i);
  deliver(api,["curtain","dome"]);progress.refresh();
  assert.equal(progress.canEnter("traces"),false);
  assert.match(progress.intention().title,/конец верхней/);
  progress.remember(["cache"],true);
  assert.match(progress.intention().question,/белело/);
  assert.equal(progress.canEnter("traces"),false,"seeing the board does not read its contents");
  api.Wl({map:"",notes:["n3"],dives:1});progress.refresh();
  assert.equal(progress.canEnter("traces"),true);
  assert.equal(progress.canEnter("fate"),false);
  assert.equal(progress.select("traces"),true);
  assert.deepEqual(plain(progress.intention().marker),{x:51,y:33});
  assert.deepEqual(plain(progress.preparation().gear),["twin12","spareLight"]);
  api.Wl({map:"",notes:["n3","n5"],dives:2});progress.refresh();
  assert.equal(progress.canEnter("fate"),true);
  assert.equal(progress.isFinished,false);
});

test("early final evidence completes the story without mandatory intermediate photos",()=>{
  const {api}=runtime(),progress=new api.ExpeditionProgress();
  deliver(api,["body"]);progress.refresh();
  assert.equal(progress.canEnter("fate"),true);
  assert.equal(progress.isFinished,false);
  assert.doesNotMatch(JSON.stringify(progress.journal()),/августом 1981/i);
  api.Wl({map:"",notes:["n6"],dives:1});progress.refresh();
  assert.equal(progress.isFinished,true);
  assert.equal(progress.select("survey"),true);
  assert.equal(new api.ExpeditionProgress().isFinished,true);
  assert.deepEqual(plain(api.Bn().found),["body"]);
});

test("the delivered end-of-line note preserves its warning and advances the next question",()=>{
  const {api}=runtime();
  api.Wl({map:"",notes:["n2"],dives:1});
  const progress=new api.ExpeditionProgress(),intent=progress.intention();
  assert.match(intent.title,/последней стрелке/);
  assert.deepEqual(plain(intent.marker),{x:87.5,y:14.6});
  const noteText=api.xt().notes.find(n=>n.id==="n2").text.join(" ");
  for(const text of [noteText,JSON.stringify(intent),progress.debrief(new Set()).text]){
    assert.doesNotMatch(text,/схем|ниже у стены|справа|прямоугольник|33 м|колонн/i);
  }
  assert.match(api.upperGalleryHelp.answer,/выступ справа/);
  const note=progress.journal().find(entry=>entry.source==="Записка у воздушного кармана");
  assert.ok(note);assert.match(note.text,/против воды/);
  assert.equal(progress.canEnter("traces"),false,"the note locates the scheme but does not substitute for finding it");
  const restored=new api.ExpeditionProgress();
  assert.equal(restored.intention().title,intent.title);
  assert.ok(restored.journal().some(entry=>entry.source===note.source));
});

test("observations survive a return but not death, and a photograph adds stronger evidence",()=>{
  const {api}=runtime(),progress=new api.ExpeditionProgress();
  progress.remember(["tank81"],false);
  assert.equal(progress.knows("tank81"),false);
  progress.remember(["tank81","invented"],true);
  assert.equal(new api.ExpeditionProgress().knows("tank81"),true);
  const before=progress.evidenceKeys();
  assert.equal(progress.canEnter("traces"),false);
  deliver(api,["tank81"]);progress.refresh();
  const report=progress.debrief(before);
  assert.equal(report.changed,true);
  assert.match(report.text,/клеймо/);
  assert.match(report.next,/линию дальше/);
  assert.equal(progress.knows("invented"),false);
});

test("old upper-gallery checkpoint entries remain known and map help opens only on request",()=>{
  const {api}=runtime(),progress=new api.ExpeditionProgress();
  const plan=Object.assign(Object.create(api.SurveyPlanScreen.prototype),{
    galleryHelp:{open:false},root:{classList:{remove(){}}},render(){},
  });
  plan.show();assert.equal(plan.galleryHelp.hidden,true);
  api.Wl({map:"",notes:["n2"],dives:1});
  progress.refresh();progress.remember(["cache"],true);
  plan.show();assert.equal(plan.galleryHelp.hidden,false);assert.equal(plan.galleryHelp.open,false);
  const keys=new Set(progress.journal().map(entry=>JSON.stringify({
    title:entry.source==="Наблюдение"?"Схема у конца линии":entry.title,
    text:"Сведения из прежнего чекпоинта",source:entry.source,
  })));
  assert.equal(progress.debrief(keys).changed,false);
  deliver(api,["cache"]);progress.refresh();
  assert.equal(progress.debrief(keys).changed,true);
  plan.galleryHelp.open=true;plan.show();assert.equal(plan.galleryHelp.hidden,true);assert.equal(plan.galleryHelp.open,false);
});

// Follow the old rope with ordinary movement. Use the game's read and shutter
// events, torch pose, occluded beam, crop, observation dwell and boat delivery.
// Only the canvas draw and JPEG capture are stand-ins in this headless fixture.
for (const visit of ["glimpse", "read", "photograph"]) {
  test("upper gallery first visit and return · " + visit, async t => {
    const {createDive,world}=await import("./helpers/dive-simulator.mjs");
    const {api}=runtime({cave:true}), game=gameFixture(api);
    const ready=visit!=="glimpse";
    const dive=createDive({back:ready?"twin":"single",slots:ready?["reel"]:[],current:.2});
    const {state}=dive, noop=()=>{};
    const light=new api.Zd(world,api.pl(world)), anim=new api.Sd();
    game.state=state;game.world=world;game.mode="dive";game.layout={dpr:1};game.notice={};
    game.diveShots=[];game.diveObserved=new Set();game.observationDwell=new Map();
    game.beforeEvidence=game.expedition.evidenceKeys();
    game.scene=Object.assign(Object.create(api.of.prototype),{
      world,anim,lit:light,lf:new api.sf(light),finds:new api.Vd(),draw:noop,onEvent:noop,
      explored:{...game.scene.explored,observe:noop},
    });
    game.view=()=>({ox:state.diver.x-5.75,oy:state.diver.y-12,W:368,H:768,zoom:32});
    game.tm.onStep=game.tips.afterStep=game.sound.onEvent=game.sound.discovery=noop;
    game.captureShot=shot=>{shot.img=image;};
    const cache=world.site.finds.find(f=>f.id==="cache");
    const [cx,cy]=cache.pts[1];
    function look(direction=1){
      const {diver}=state;
      const angle=Math.atan2(cy-diver.y,cx-diver.x);
      const aim={lx:direction*Math.cos(angle),ly:direction*Math.sin(angle)};
      dive.hold(1.2,aim);
      for(let i=0;i<7;i++){
        dive.hold(.1,aim);
        const {torch}=anim.pose(state,diver.x,diver.y,world,{dx:0,dy:0,rot:0});
        light.setup(state,diver.x,diver.y,torch.x,torch.y,diver.aim);
        game.lastView=game.view();
        game.observeFinds(.1);
      }
    }
    function read(id){
      game.simStep({...api.xi,read:true});assert.equal(state.reading,id);
      assert.ok(game.diveNotes.has(id));game.simStep(api.xi);
    }
    dive.go({x:48,y:18.5});
    for(const p of world.olds[0].pts)dive.go(p);
    if(visit!=="photograph")read("n2");
    look();assert.equal(game.diveObserved.has("cache"),false,"the ledge occludes the board");
    if(ready)dive.tie();
    dive.go({x:91,y:14});dive.go({x:92,y:16});
    look(-1);assert.equal(game.diveObserved.has("cache"),false,"turning the lamp away hides the board");
    look();assert.ok(game.diveObserved.has("cache"),"its lit rim is visible before the board is within reach");
    game.simStep({...api.xi,read:true});assert.equal(state.reading,null);game.simStep(api.xi);
    if(ready){
      dive.go({x:92,y:18});dive.go({x:90.8,y:19.9});
      assert.equal(state.line.reel,"live");
      if(visit==="read")read("n3");
      else{
        look();
        for(let i=0;i<120&&!game.diveShots.length;i++)game.simStep({...api.xi,camera:true});
        assert.ok(game.diveShots[0]?.finds.includes("cache"),"the shutter records the illuminated plate");
      }
    }
    const turn=state.tanks[0].bar;
    assert.ok(turn>state.tanks[0].marks[0],"the inspection fits before the planned turn pressure");
    if(ready)dive.go({x:92,y:18});
    dive.go({x:92,y:16});dive.go({x:91,y:14});
    for(const p of world.olds[0].pts.slice().reverse())dive.go(p);
    dive.go({x:48,y:18});dive.surface();
    const result=dive.result();assert.equal(result.outcome,"clean");assert.equal(result.cesa,false);
    game.finishDive();
    const restored=new api.ExpeditionProgress();
    assert.equal(restored.knows("cache"),true);
    assert.equal(restored.canEnter("traces"),ready);
    assert.equal(restored.notes.has("n3"),visit==="read");
    assert.equal(restored.hasPhoto("cache"),visit==="photograph");
    if(ready)assert.match(game.resultScreen.summary.textContent,/33 м.*колонн/);
    else{
      assert.match(game.resultScreen.summary.textContent,/прямоугольник/);
      assert.doesNotMatch(game.resultScreen.summary.textContent+JSON.stringify(restored.intention()),/схем|колонн|33 м/i);
      assert.deepEqual(plain(api.ji().frames),{});
    }
    t.diagnostic(`Turn ${turn.toFixed(1)} bar, surface ${result.gas} bar, maximum line ${result.line} m`);
  });
}

test("v1 unlocked plans remain selectable without inventing evidence",()=>{
  const {api}=runtime();
  api.de(api.qt("expedition"),{version:1,chapterId:"fate",seenIntro:["survey","traces"]});
  const progress=new api.ExpeditionProgress();
  assert.equal(progress.chapterId,"fate");
  assert.equal(progress.canEnter("traces"),true);
  assert.equal(progress.canEnter("fate"),true);
  assert.equal(progress.journal().length,1);
  assert.equal(progress.isFinished,false);
  assert.equal(api.Me(api.qt("expedition")).version,2);
});

test("observations require illuminated on-screen points; obscured or distant objects stay unknown",()=>{
  const {api}=runtime(),view={ox:0,oy:0,W:500,H:800,zoom:50};
  const light={beam:()=>.8,ambient:()=>0,view:()=>1},find={pts:[[4,5],[4.5,5]]},diver={x:3,y:5};
  assert.equal(api.surveyFindVisible(find,diver,view,light),true);
  assert.equal(api.surveyFindVisible(find,diver,view,{...light,beam:()=>0}),false);
  assert.equal(api.surveyFindVisible(find,diver,view,{...light,view:()=>0}),false);
  assert.equal(api.surveyFindVisible(find,{x:20,y:5},view,light),false);
  assert.equal(api.surveyFindVisible(find,diver,{...view,ox:10},light),false);
  assert.equal(api.surveyFindVisible({pts:[[4,1]]},diver,view,light),false,"HUD-covered objects do not register");
});

test("reset clears the expedition and album; a finished expedition still allows exploration", () => {
  const {api} = runtime();
  const ids = api.expeditionChapters.flatMap(chapter => chapter.targets.map(target => target.id));
  deliver(api, ids);
  api.to(["single12", "twin12", "ean50"]);
  const progress = new api.ExpeditionProgress();
  assert.equal(progress.isFinished, true);
  assert.equal(progress.select("survey"), true);
  assert.equal(progress.select("fate"), true);
  assert.equal(api.Bn().found.length, ids.length);
  progress.markIntroSeen();
  api.gf();
  progress.reset();
  assert.equal(progress.chapterId, "survey");
  assert.equal(progress.hasSeenIntro(), false);
  assert.equal(progress.canEnter("traces"), false);
  assert.deepEqual(plain(api.Bn().found), []);
  assert.deepEqual(plain(api.ji().frames), {});
  assert.deepEqual(plain(api.eo().notes), []);
  assert.deepEqual(plain(api.vi().lines), []);
  assert.deepEqual(plain(api.fn()), ["single12", "spareReel"]);
  const kit = api.Si(api.xt(), api.fn(), false);
  const resetPlan = api.Mn({rule: 3, back: "twin", slots: ["deco50"]}, kit);
  assert.equal(resetPlan.back, "single");
  assert.deepEqual(plain(resetPlan.slots), []);
});

test("generic slot positions survive reload and old saves gain an available optional reel", () => {
  const {api}=runtime();
  api.to(["single12","twin12","ean50","spareLight"]);
  const kit=api.Si(api.xt(),api.fn(),false);
  assert.deepEqual(plain(kit.slots),["deco50","reel","light"]);
  const plan={rule:3,bottom:"air",back:"twin",slots:[null,"light"]};
  api.Va(plan);
  assert.deepEqual(plain(api.Mn(api.Vn(),kit)),plan);
  assert.deepEqual(plain(api.Df(plan,[{id:"ean50"}],kit)),plan);
  api.Va({...plan,slots:["light","light"]});
  assert.deepEqual(plain(api.Vn().slots),["light"]);
});

test("the first outing has no random failures and completes only on delivered evidence", () => {
  const {api}=runtime();
  const game=gameFixture(api);
  game.firstDive=new api.FirstDiveProgress();
  game.startDive(game.planScreen.current,23,{deck:["light"]});
  assert.equal(game.expeditionTarget.id,"entry-tag");
  assert.deepEqual(plain(game.state.env.deck),[]);
  assert.equal(game.firstDive.active,true);
  // Use the ordinary finish/delivery path, including its result screen.
  Object.assign(game.state,{outcome:{kind:"clean"},tanks:[{id:"back",ruleBar:180}],line:{},arrows:[],stats:{decoT:0},fail:{list:[]}});
  Object.assign(game.resultScreen,{summary:{},heading:{}});
  game.finishDive();
  assert.equal(game.firstDive.active,true,"an empty return keeps the short route available");
  assert.match(game.resultScreen.summary.textContent,/без снимка/);
  game.diveFinds=[{id:"entry-tag"}];
  game.diveShots=[{n:1,finds:["entry-tag"],img:image}];
  game.firstOuting=true;
  game.finishDive();
  assert.equal(game.firstDive.active,false);
  assert.equal(api.ji().frames["entry-tag"],image);
  assert.equal(game.resultScreen.heading.textContent,"Первый след на лодке");
  assert.equal(game.expedition.chapterId,"survey");
});

test("final evidence brought on the introductory outing opens the ending without another dive",()=>{
  const {api}=runtime(),game=gameFixture(api);
  game.firstDive=new api.FirstDiveProgress();game.firstOuting=true;game.wasFinished=false;
  Object.assign(game.resultScreen,{summary:{},heading:{},planButton:{},showEvidence(entries,finished){this.final=finished;}});
  game.boat.showEnding=()=>{game.boat.screen='ending';};
  game.diveFinds=[{id:'body'},{id:'slate81'}];game.diveShots=[{n:1,finds:['body','slate81'],img:image}];
  game.finishDive();
  assert.equal(game.expedition.isFinished,true);assert.equal(game.firstDive.active,false);
  assert.equal(game.resultScreen.final,true);assert.equal(game.resultScreen.summary.hidden,true);
  game.resultScreen.onPlan();assert.equal(game.boat.screen,'ending');
});

for (const reduced of [false, true]) {
  test(`dive transition holds simulation and input until the reveal ends (reduced=${reduced})`, () => {
    const {api, timers, advance, body} = runtime({reduced});
    const game = gameFixture(api);
    let audioReady = false;
    let plunged = 0;
    let simulated = 0;
    game.sound.init = () => {audioReady = true;};
    game.sound.plunge = () => {plunged++;};
    Object.assign(game, {
      last: 0, time: 0, worldTime: 0, devDpr: 1,
      watchPerf() {}, render() {}, syncTipInput() {}, readInput() {},
      simStep() {simulated++;},
    });
    game.tips.visualK = () => 1;
    game.sound.setDuck = game.sound.update = game.input.dropRows = game.gas.frame = () => {};
    const transition = game.boat.transition;
    game.boat.dive();
    game.boat.dive();
    assert.equal(audioReady, true, "AudioContext initialization occurs in the click, before timers");
    assert.equal(timers.size, 1);
    assert.ok(body.children.includes(transition.root), "cover belongs to body, outside the hidden boat");
    assert.equal(transition.root.dataset.phase, "closing");
    assert.equal(game.mode, "plan");
    advance(reduced ? 152 : 512);
    assert.equal(game.mode, "dive");
    assert.equal(game.boat.root.hidden, true);
    assert.equal(transition.root.hidden, false);
    assert.equal(transition.root.dataset.phase, "submerged");
    assert.equal(plunged, 1);
    assert.equal(game.paused, true);
    assert.equal(game.input.enabled, false);
    assert.equal(game.frameEl.inert, true);
    api.ju.prototype.frame.call(game, 16);
    assert.equal(simulated, 0);
    advance(reduced ? 70 : 180);
    assert.equal(transition.root.dataset.phase, "opening");
    api.ju.prototype.frame.call(game, 32);
    assert.equal(simulated, 0, "no simulation step is possible under the fading cover");
    assert.equal(game.input.enabled, false);
    advance(reduced ? 192 : 792);
    assert.equal(transition.root.hidden, true);
    assert.equal(transition.active, false);
    assert.equal(timers.size, 0);
    assert.equal(game.paused, false);
    assert.equal(game.input.enabled, true);
    assert.equal(game.frameEl.inert, false);
    assert.equal(game.boat.busy, false);
    api.ju.prototype.frame.call(game, 48);
    assert.equal(simulated, 1);
  });
}

test("cancelled transitions cannot start a stale dive or leave the current dive paused", () => {
  const {api, timers, advance} = runtime();
  const game = gameFixture(api);
  const transition = game.boat.transition;
  game.boat.dive();
  transition.cancel();
  advance(5000);
  assert.equal(game.mode, "plan");
  assert.equal(game.boat.busy, false);
  assert.equal(timers.size, 0);
  assert.equal(api.Vn(), null);
  game.boat.dive();
  advance(152);
  assert.equal(game.mode, "dive");
  transition.cancel();
  advance(5000);
  assert.equal(timers.size, 0);
  assert.equal(transition.root.hidden, true);
  assert.equal(game.paused, false);
  assert.equal(game.input.enabled, true);
});

test("plunge audio respects mute and releases its synthetic nodes without real audio", () => {
  const {api} = runtime();
  const sound = new api.td();
  const nodes = [];
  const parameter = () => ({setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}});
  const node = () => {
    const value = {gain: parameter(), frequency: parameter(), Q: {},
      connect: next => next, start() {}, stop() {}, disconnect() {this.disconnected = true;}};
    nodes.push(value);
    return value;
  };
  sound.ctx = {currentTime: 5, createGain: node, createBufferSource: node, createBiquadFilter: node, createOscillator: node};
  sound.master = {};
  sound.noise = {};
  sound.muted = true;
  assert.equal(sound.plunge(), null);
  assert.equal(nodes.length, 0);
  sound.muted = false;
  const stop = sound.plunge();
  assert.equal(typeof stop, "function");
  assert.equal(nodes.filter(value => value.onended).length, 4);
  stop();
  stop();
  assert.ok(nodes.every(value => value.disconnected));
});
