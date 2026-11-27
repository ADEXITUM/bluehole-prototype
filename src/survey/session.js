// A checkpoint and a committed delivery share one atomic localStorage record.
// The page owner changes on resume; the dive identity does not.
class ExpeditionSession {
  constructor(){
    this.key=qt('session');this.saved=Me(this.key);this.interrupted=this.saved?.active===true;
    this.token=null;this.error=null;this.blocked=false;this.lastSavedWall=-Infinity;this.lastAttemptWall=-Infinity;this.pendingDelivery=null;
  }
  owns(){return !!this.token&&Me(this.key)?.token===this.token;}
  begin(game){
    this.priorToken=Me(this.key)?.token;this.token=diveOwnerToken();this.interrupted=false;this.blocked=false;this.error=null;this.pendingDelivery=null;this.completed=false;this.lastSavedWall=-Infinity;this.lastAttemptWall=-Infinity;
    this.saved={version:2,site:xt().id,active:true,token:this.token,diveId:game?.tm.cur?.meta.id??null,savedAt:Date.now()};
    this.unsavedStart=!writeDiveSession(this.saved);
    if(this.unsavedStart){this.error='storage';return false;}
    return game?this.save(game,true):true;
  }
  available(world){
    return this.saved?.version===2&&this.saved.active===true&&this.saved.site===world.site.id&&validateDiveCheckpoint(this.saved.snapshot,world);
  }
  save(game,force=false){
    if(!this.token||this.pendingDelivery||!['dive','ending'].includes(game.mode))return false;
    // Avoid parsing a full checkpoint on every simulation step. The storage
    // event suspends superseded pages; every actual write also checks ownership.
    if(!force&&game.state.tWall-this.lastAttemptWall<5)return !this.error;
    this.lastAttemptWall=game.state.tWall;
    if(this.unsavedStart&&Me(this.key)?.token===this.priorToken){
      if(!writeDiveSession(this.saved)){this.error='storage';return false;}
      this.unsavedStart=false;
    }
    if(!this.owns()){this.blocked=true;this.error='owner';game.pauseUI?.conflict();return false;}
    try{
      const snapshot=captureDiveCheckpoint(game);
      const saved={version:2,site:xt().id,active:true,token:this.token,diveId:snapshot.diveId,savedAt:Date.now(),snapshot};
      if(!writeDiveSession(saved))throw Error('storage');
      this.saved=saved;this.lastSavedWall=game.state.tWall;this.error=null;return true;
    }catch{
      this.error='storage';return false;
    }
  }
  resume(game){
    this.saved=Me(this.key);
    if(!this.available(game.world)){this.error='incompatible';return false;}
    this.token=diveOwnerToken();
    const claimed={...this.saved,token:this.token};
    if(!writeDiveSession(claimed)){this.error='storage';return false;}
    this.saved=claimed;this.interrupted=false;this.error=null;this.blocked=false;this.completed=false;
    restoreDiveCheckpoint(game,claimed.snapshot);
    this.lastSavedWall=game.state.tWall;this.lastAttemptWall=game.state.tWall;
    game.boat?.transition?.cancel();game.planScreen.hide();game.resultScreen.hide();game.intro.hide();game.boat?.hide();
    game.input.modal=null;game.input.reset();game.input.enabled=false;game.gas.close();
    game.clock.acc=0;game.alpha=1;game.endT=0;game.last=performance.now();game.lastInput=xi;game.lastButtons=null;
    game.paused=true;game.snapCamera();game.nextCameraCheck=0;
    if(game.state.phase==='end'){game.mode='ending';game.finishDive();}
    else{game.mode='dive';game.pauseUI.show('Нырок восстановлен. Газ, глубина и время сохранены. Продолжи, когда будешь готов.');}
    return true;
  }
  finish(){
    if(!this.owns()&&!(this.unsavedStart&&Me(this.key)?.token===this.priorToken))return false;
    const done={version:2,site:xt().id,active:false,token:this.token};
    if(!writeDiveSession(done)){this.error='storage';return false;}
    this.interrupted=false;this.saved=done;return true;
  }
  discard(){
    if(Me(this.key)?.token!==this.saved?.token)return false;
    this.token=diveOwnerToken();
    const done={version:2,site:xt().id,active:false,token:this.token};
    if(!writeDiveSession(done)){this.error='storage';return false;}
    this.saved=done;this.interrupted=false;return true;
  }
  deliver(game,callback){
    if(this.completed)return true;
    if(this.unsavedStart&&Me(this.key)?.token===this.priorToken&&!this.save(game,true))return false;
    if(!this.owns()){this.error='owner';this.blocked=true;game.pauseUI?.conflict();return false;}
    if(!this.pendingDelivery){
      if(!this.save(game,true))return false;
      const writes=collectExpeditionWrites(callback);
      this.pendingDelivery={version:2,site:xt().id,status:'delivered',active:false,token:this.token,diveId:this.saved.diveId,savedAt:Date.now(),writes};
    }
    if(!writeDiveSession(this.pendingDelivery)||!recoverDiveDelivery()){this.error='storage';return false;}
    this.pendingDelivery=null;this.saved=Me(this.key);this.completed=true;this.interrupted=false;this.error=null;return true;
  }
}

function diveOwnerToken(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);}
function writeDiveSession(record){
  de(qt('session'),record);
  return JSON.stringify(Me(qt('session')))===JSON.stringify(record);
}

// On boot this runs before any game constructor can read partially applied keys.
// Replaying exact after-values is idempotent, even after interruption at any key.
function recoverDiveDelivery(){
  const saved=Me(qt('session'));
  if(saved?.status!=='delivered')return true;
  const allowed=new Set(expeditionSaveFields.filter(id=>id!=='session').map(qt));
  if(saved.version!==2||saved.site!==xt().id||!Array.isArray(saved.writes)||saved.writes.some(row=>!Array.isArray(row)||row.length!==2||!allowed.has(row[0])))return false;
  for(const [key,value] of saved.writes){
    de(key,value);
    if(JSON.stringify(Me(key))!==JSON.stringify(value))return false;
  }
  return writeDiveSession({version:2,site:xt().id,active:false,token:saved.token,diveId:saved.diveId,delivered:true});
}

function showDiveStorageProblem(retry,text='Не удалось сохранить возвращение. Результаты остаются здесь; повтори сохранение, прежде чем закрывать вкладку.'){
  const dialog=surveyElement('dialog','','save-dialog');dialog.setAttribute('aria-label','Сохранение погружения');
  dialog.append(surveyElement('h2','Сохранение не завершено'),surveyElement('p',text));
  const button=surveyElement('button','Повторить сохранение','exp-primary');
  button.addEventListener('click',()=>{dialog.close();dialog.remove();retry();});dialog.append(button);
  dialog.addEventListener('cancel',event=>event.preventDefault());document.body.append(dialog);dialog.showModal();button.focus();
}

const expeditionSaveFields=["season","survey","lines","album","film","gear","dives","expedition","field-record","first-dive","learning","boat-objects-seen","plan","tips","log","session","intro"];
function archiveExpedition(){
  const values=Object.fromEntries(expeditionSaveFields.map(id=>[id,Me(qt(id))]));
  const snapshot={version:1,site:xt().id,date:new Date().toISOString(),values};
  de(qt("previous-expedition"),snapshot);
  // If storage is full, do not erase a save that could not be archived.
  return JSON.stringify(Me(qt("previous-expedition")))===JSON.stringify(snapshot);
}
function restoreExpedition(){
  const saved=Me(qt("previous-expedition"));
  if(saved?.version!==1||saved.site!==xt().id||!saved.values)return false;
  const current=Object.fromEntries(expeditionSaveFields.map(id=>[id,Me(qt(id))]));
  for(const id of expeditionSaveFields)de(qt(id),saved.values[id]??null);
  if(expeditionSaveFields.some(id=>JSON.stringify(Me(qt(id)))!==JSON.stringify(saved.values[id]??null))){
    for(const id of expeditionSaveFields)de(qt(id),current[id]);return false;
  }
  const replacement={version:1,site:xt().id,date:new Date().toISOString(),values:current};
  de(qt("previous-expedition"),replacement);
  if(JSON.stringify(Me(qt("previous-expedition")))!==JSON.stringify(replacement)){
    for(const id of expeditionSaveFields)de(qt(id),current[id]);return false;
  }
  return true;
}

function restartExpedition(){
  if(!archiveExpedition())return false;
  const tips=df();gf();
  for(const id of ["expedition","field-record","first-dive","learning","boat-objects-seen","session"])de(qt(id),null);
  de(Ve.plan,{...Ua,bottom:"air"});de(Ve.log,[]);
  de(Ve.tips,{on:tips.on,seen:[],ui:[],said:[],diver:false,freq:false});
  return true;
}

function showExpeditionReset(restore=false){
  const dialog=surveyElement('dialog','','save-dialog');dialog.setAttribute('aria-label',restore?'Предыдущее прохождение':'Новое прохождение');
  dialog.append(surveyElement('h2',restore?'Вернуться к предыдущему прохождению?':'Начать Блю-хол заново?'),surveyElement('p',restore
    ?'Альбом, карта и комплект сменятся на предыдущие. Текущее прохождение сохранится вместо него — переключение можно отменить здесь же.'
    :'Снова начнёшь у жёлтой метки. Текущий альбом, карта и комплект сохранятся как предыдущее прохождение; его можно вернуть в настройках.'));
  const buttons=surveyElement('div','','save-actions'),cancel=surveyElement('button','Продолжить текущее');cancel.addEventListener('click',()=>dialog.close());
  const apply=surveyElement('button',restore?'Вернуть предыдущее':'Начать новое','exp-primary');
  apply.addEventListener('click',()=>{
    if(restore?restoreExpedition():restartExpedition())window.location.reload();
    else{const message=surveyElement('p','Не удалось сохранить копию. Текущее прохождение оставлено на месте. Освободи место в браузере и попробуй снова.');dialog.append(message);apply.disabled=true;}
  });buttons.append(cancel,apply);dialog.append(buttons);
  dialog.addEventListener('close',()=>dialog.remove());document.body.append(dialog);dialog.showModal();cancel.focus();
}
