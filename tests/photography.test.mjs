import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const plain=value=>JSON.parse(JSON.stringify(value));
const image=n=>'data:image/jpeg;base64,'+['AAAA','BBBB','CCCC','DDDD'][n];
function runtime(storage=new Map()){
  let full=false;
  const context=vm.createContext({document:{createElement:()=>({relList:{supports:()=>true}})},window:{location:{search:''}},URLSearchParams,
    localStorage:{getItem:key=>storage.get(key)??null,setItem(key,value){if(full)throw Error('Quota exceeded');storage.set(key,String(value));}}});
  for(const path of ['engine/settings','engine/expedition-data','engine/instructor','engine/sites','engine/hud-hints','engine/dive-math','engine/world','engine/dive-systems','engine/simulation','engine/controls-audio','engine/cave-render','engine/scene-art','engine/scene','engine/persistence','survey/photography','survey/photo-album','survey/session']){
    vm.runInContext(readFileSync(new URL('../src/'+path+'.js',import.meta.url),'utf8'),context,{filename:path});
  }
  const api=vm.runInContext('({surveyPhotoView,surveyCameraVisible,surveyPhotoAssessment,surveyReturnReview,surveyShotExplanation,saveDeliveredFilm,readDeliveredFilm,chooseAlbumPhoto,restoreAlbumPhoto,ji,_f,Me,de,qt,gf,Bn,archiveExpedition,restoreExpedition,Zh,Ls,Zd,Sd,of,Vd})',context);
  return {api,storage,fill(){full=true;}};
}
function shot(n,finds=['entry-tag'],marks={}){return {n,img:image(n-1),finds,marks,white:false,feedback:{kind:finds.length?'find':'scene'}};}

test('delivered frames can replace a cover and undo after reload without changing expedition evidence',()=>{
  const {api,storage}=runtime();
  api._f(['entry-tag'],0,true,{'entry-tag':image(0)},{'entry-tag':[.2,.3]});
  const before=plain(api.Bn()),film=api.saveDeliveredFilm([shot(1),shot(2,['entry-tag'],{'entry-tag':[.7,.8]}),shot(3,[])],true);
  assert.equal(film.shots.length,3);
  assert.equal(api.ji().frames['entry-tag'],image(0),'delivery itself does not replace a chosen cover');
  assert.equal(api.chooseAlbumPhoto(film.id,2,'entry-tag'),true);
  const fresh=runtime(storage).api;
  assert.equal(fresh.ji().frames['entry-tag'],image(1));
  assert.deepEqual(plain(fresh.ji().marks['entry-tag']),[.7,.8]);
  assert.equal(fresh.restoreAlbumPhoto('entry-tag'),true);
  assert.equal(fresh.ji().frames['entry-tag'],image(0));
  assert.deepEqual(plain(fresh.ji().marks['entry-tag']),[.2,.3]);
  assert.deepEqual(plain(fresh.Bn()),before);
});

test('a replacement affects only its object and removes a stale position marker',()=>{
  const {api}=runtime();api._f(['entry-tag','dome'],0,true,{'entry-tag':image(0),dome:image(0)},{'entry-tag':[.3,.4],dome:[.8,.2]});
  const film=api.saveDeliveredFilm([shot(2,['entry-tag','dome'],{dome:[.1,.2]})],true);
  assert.equal(api.chooseAlbumPhoto(film.id,2,'entry-tag'),true);
  assert.equal(api.ji().frames.dome,image(0));assert.equal(api.ji().marks['entry-tag'],undefined);
  assert.deepEqual(plain(api.ji().marks.dome),[.8,.2]);
  // Re-inserting a marker changes property order, not whether storage succeeded.
  assert.equal(api.restoreAlbumPhoto('entry-tag'),true);
  assert.deepEqual(plain(api.ji().marks['entry-tag']),[.3,.4]);
});

test('lost and empty outings preserve the last delivered film; stale or unrecognized frames cannot grant evidence',()=>{
  const {api}=runtime();api._f(['entry-tag'],0,true,{'entry-tag':image(0)});
  const film=api.saveDeliveredFilm([shot(1)],true);
  assert.equal(api.saveDeliveredFilm([shot(2)],false),null);assert.equal(api.saveDeliveredFilm([],true),null);
  assert.equal(api.readDeliveredFilm().id,film.id);
  assert.equal(api.chooseAlbumPhoto(film.id,1,'dome'),false);
  const next=api.saveDeliveredFilm([shot(2,['dome'])],true);
  assert.equal(api.chooseAlbumPhoto(film.id,1,'entry-tag'),false);
  assert.equal(api.chooseAlbumPhoto(next.id,2,'dome'),false);
  assert.deepEqual(plain(api.Bn().found),['entry-tag']);
});

test('storage exhaustion reports failure and preserves both the cover and previous film',()=>{
  const r=runtime(),{api}=r;api._f(['entry-tag'],0,true,{'entry-tag':image(0)});
  const film=api.saveDeliveredFilm([shot(2)],true);r.fill();
  assert.equal(api.chooseAlbumPhoto(film.id,2,'entry-tag'),false);
  assert.equal(api.ji().frames['entry-tag'],image(0));
  assert.equal(api.saveDeliveredFilm([shot(3)],true),null);
  assert.equal(api.readDeliveredFilm().id,film.id);
});

test('legacy albums and malformed film are tolerated; expedition archive includes film and previous covers',()=>{
  const {api}=runtime();api.de(api.qt('album'),{frames:{'entry-tag':image(0)}});
  assert.deepEqual(plain(api.ji().previous),{});
  api.de(api.qt('film'),{version:1,id:'broken',shots:[null,{},shot(1)]});
  assert.equal(api.readDeliveredFilm().shots.length,1);
  api._f(['entry-tag'],0,true);const film=api.saveDeliveredFilm([shot(2)],true);
  assert.equal(api.chooseAlbumPhoto(film.id,2,'entry-tag'),true);
  assert.equal(api.archiveExpedition(),true);api.gf();assert.equal(api.readDeliveredFilm(),null);
  assert.equal(api.restoreExpedition(),true);
  assert.equal(api.readDeliveredFilm().id,film.id);assert.equal(api.ji().previous['entry-tag'].img,image(0));
});

test('camera uses the actual crop, only names visible objects, and does not turn notes into evidence',()=>{
  const {api}=runtime(),view={ox:0,oy:0,W:200,H:400,zoom:20};
  const crop=api.surveyPhotoView(view,{x:0,y:100,size:200});
  const target={id:'one',name:'Находка',pts:[[5,10]]},light={flashLight:()=>1};
  const base={light,view:crop,subjects:[target],notes:[],diver:{x:5,y:8},visible:()=>true};
  assert.equal(api.surveyPhotoAssessment(base).kind,'find');
  assert.equal(api.surveyPhotoAssessment({...base,visible:()=>false}).kind,'scene');
  assert.equal(api.surveyPhotoAssessment({...base,subjects:[{...target,pts:[[5,2]]}]}).kind,'scene');
  const note=api.surveyPhotoAssessment({...base,subjects:[],notes:[{id:'n1',x:5,y:10}]});
  assert.equal(note.kind,'note');assert.equal(note.noteId,'n1');
  assert.match(api.surveyShotExplanation({feedback:{kind:'note'}}),/Читать/);
  assert.equal(api.surveyPhotoAssessment({...base,white:true}).kind,'murk');
});

test('camera can explain flash range for a visible distant object without exposing dark or off-screen subjects',()=>{
  const {api}=runtime(),view={ox:0,oy:0,W:400,H:400,zoom:20},target={id:'one',name:'Предмет',pts:[[10,10]]};
  const light={beam:()=>1,ambient:()=>0,view:()=>1};
  const visible=find=>api.surveyCameraVisible(find,view,light);
  assert.equal(visible(target),true);
  const base={light:{flashLight:()=>0},view,subjects:[target],notes:[],diver:{x:0,y:10},visible};
  assert.equal(api.surveyPhotoAssessment(base).kind,'distance');
  assert.equal(api.surveyPhotoAssessment({...base,diver:{x:8,y:10}}).kind,'aim');
  assert.equal(api.surveyCameraVisible(target,view,{...light,beam:()=>0}),false);
  assert.equal(visible({...target,pts:[[25,10]]}),false);
});

test('real exposure preview leaves the dive, found set, exploration and live flash untouched',()=>{
  const {api}=runtime(),world=api.Zh('hub'),state=api.Ls(world,{rule:3,bottom:'air',back:'single',slots:[]},23,{current:0,deck:[],flows:[0,0,0,0]});
  const scene=Object.create(api.of.prototype);Object.assign(scene,{world,sky:null,anim:new api.Sd(),lit:new api.Zd(world,null),finds:new api.Vd(),explored:{sentinel:true},flashT:null});
  const before=JSON.stringify(state),view={ox:38,oy:0,W:400,H:600,zoom:20};
  const result=scene.previewPhoto(state,view,{x:0,y:100,size:400});
  assert.ok(Number.isFinite(result.backscatter));assert.equal(JSON.stringify(state),before);
  assert.equal(scene.lit.flash.k,0);assert.equal(scene.flashT,null);assert.equal(scene.finds.found.size,0);
  assert.deepEqual(scene.explored,{sentinel:true});assert.notEqual(result.light,scene.lit);
});

test('return advice distinguishes late turns, unknown turns, staged gas and emergency outcomes',()=>{
  const {api}=runtime(),state={outcome:{kind:'clean'},plan:{back:'twin'},tanks:[{id:'back',bar:64},{id:'deco',bar:120,carried:false}]};
  const dive={keptM:12,turn:{state:'ok',count:2,tanks:[{id:'back',bar:120,mark:150}]}};
  const late=api.surveyReturnReview(state,dive);assert.match(late.title,/позже/);assert.match(late.text,/Последний разворот/);assert.ok(late.next);assert.doesNotMatch(late.text,/EAN50/);
  assert.match(late.text,/12 м линии/);
  state.tanks[1].carried=true;assert.match(api.surveyReturnReview(state,dive).text,/EAN50 — 120/);
  dive.turn.tanks[0].bar=160;assert.equal(api.surveyReturnReview(state,dive).next,null);
  dive.turn={state:'noTurn'};assert.match(api.surveyReturnReview(state,dive).text,/12 м линии/);
  for(const outcome of [{kind:'dead'},{kind:'dcs'},{kind:'clean',cesa:true}])assert.equal(api.surveyReturnReview({...state,outcome},dive),null);
});
