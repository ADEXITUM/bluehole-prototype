class PhotoSurveyGame extends ju {
  constructor() {
    super(SurveyResultScreen, SurveyPlanScreen);
    this.resultScreen.onAgain = () => this.startDive(this.planScreen.current);
    this.reveal.onLessonRead = id => {
      this.tips.markSeen(id);
      this.tm.mark(this.state, "tip", {id, pause: 0, urgent: false});
    };
    this.intro.hide();
    this.firstDive = new FirstDiveProgress();
    this.expedition = new ExpeditionProgress();
    this.learning = new ExpeditionLearning();
    this.session = new ExpeditionSession();
    this.planScreen.onChange=plan=>{Va(plan);this.preview(plan);};
    this.boatMap.previewHeight = [240,320];
    const mapButton = this.boatMap.pvCanvas.parentElement;
    mapButton.tabIndex = 0;
    mapButton.setAttribute("role", "button");
    mapButton.setAttribute("aria-label", "Развернуть карту");
    mapButton.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); this.boatMap.open(); }
    });
    this.chosen = Me(qt("photo-target"));
    this.assignmentPanel = surveyElement("section", "", "photo-plan");
    this.planScreen.routeSlot.replaceChildren(this.assignmentPanel);
    const lastDive = Bn().dives > 0 && this.tmStore.list().filter(entry => entry.complete).at(-1);
    if (lastDive) {
      this.planScreen.lastEntryBar = this.tmStore.load(lastDive.id)?.summary?.gas?.ruleBar;
      this.planScreen.render();
    }
    this.notice = surveyElement("div", "", "photo-notice");
    this.notice.setAttribute("role", "status");
    this.notice.hidden = true;
    this.frameEl.append(this.notice);
    this.cameraCue=surveyElement('p','','camera-cue');this.cameraCue.hidden=true;this.cameraCue.setAttribute('role','status');
    this.cameraFrame=surveyElement('div','','camera-frame');this.cameraFrame.hidden=true;this.cameraFrame.setAttribute('aria-hidden','true');
    this.frameEl.append(this.cameraFrame,this.cameraCue);
    this.resultScreen.onAlbumChange=()=>this.planScreen.setSeason(Bn());
    this.firstHint = surveyElement("p", "", "first-dive-hint");
    this.firstHint.hidden = true;
    this.firstHint.setAttribute("role","status");
    this.frameEl.append(this.firstHint);
    this.lineSense=surveyElement('p','','line-sense');
    this.lineSense.hidden=true;this.lineSense.setAttribute('role','status');this.frameEl.append(this.lineSense);
    const blocked=this.tips.blocked;
    this.tips.blocked=id=>id==="deco"||this.firstOuting&&this.state.depth<=9||blocked?.(id);
    this.reveal.presenter=(delta,blocked,eligible)=>this.presentDiveHint(delta,blocked,eligible);
    const resetSeason = this.planScreen.onSeasonReset;
    this.planScreen.onSeasonReset = () => {
      resetSeason();
      this.expedition.reset();
      this.firstDive.reset();
      this.learning.reset();
      this.chosen = null;
      this.planScreen.lastEntryBar = null;
      this.refreshPlanView();
      this.updateAssignment();
      this.boat?.showMenu();
    };
    this.updateAssignment();
    this.boat = new ExpeditionBoat(this);
    // Re-reading is deliberate and task-based; it does not restart automatic
    // lessons that the player has already been shown.
    this.planScreen.root.querySelector('[data-a="tips-reset"]').textContent='Открыть справку';
    this.planScreen.onTipsReset=()=>this.boat.openStation('guide',this.boat.returnTo);
    this.pauseUI = new SurveyPause(this);
    this.planScreen.onDive = () => this.boat.dive();
    window.addEventListener('pagehide',()=>this.session.save(this,true));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.session.save(this,true);});
    window.addEventListener('storage',event=>{
      if(event.key===this.session.key&&this.session.token&&['dive','ending'].includes(this.mode)&&!this.session.owns()){
        this.session.blocked=true;this.pauseUI.conflict();
      }
    });
  }

  updateAssignment() {
    const first=this.firstDive?.active;
    const route = first?firstDiveTarget:this.expedition.intention();
    this.chosen = route?.id ?? null;
    this.boatMap.surveyTarget = first?this.world.site.finds.find(item=>item.id===firstDiveTarget.id):route.marker;
    const panel = this.assignmentPanel;
    panel.replaceChildren(surveyElement("h2",first?"Первый короткий выход":route.question??route.title));
    if(first){
      panel.append(surveyElement("p",firstDiveTarget.clue),surveyElement("p","Комплект готов. Освойся со светом и камерой и привези снимок на лодку.","photo-clue"));
    }else{
      panel.append(surveyElement("p",route.why),surveyElement("p",route.clue,"photo-clue"));
      const prep=this.prepareRouteGear();
      if(prep){
        const gear=surveyElement("button","Подготовить комплект →","link");gear.dataset.boat="gear";
        panel.append(surveyElement("p",prep.text,"photo-preparation"),gear);
      }
      const journal=surveyElement("button","Свидетельства и планы →","link");journal.dataset.boat="chapters";panel.append(journal);
    }
    const reserve=surveyElement("button","Запас на обратный путь →","link");
    reserve.dataset.boat="reserve";
    reserve.hidden=!!first||!this.reveal.mem.diver&&!this.reveal.visible("turnMarks");
    panel.append(reserve);
    this.boatMap.refresh();
    this.boat?.refresh();
  }

  prepareRouteGear(){
    if(this.firstDive?.active)return null;
    const prep=this.expedition.preparation();
    if(prep){const available=fn();if(prep.gear.some(id=>!available.includes(id))){to([...available,...prep.gear]);this.refreshPlanView();}}
    return prep;
  }

  showPlan() {
    this.boat?.transition?.cancel();
    super.showPlan();
    this.boat?.showBoat();
  }

  startDive(...args) {
    this.firstOuting=!!this.firstDive?.active;
    this.expeditionTarget = this.firstOuting?firstDiveTarget:this.expedition.intention();
    this.beforeEvidence=this.expedition.evidenceKeys();
    this.diveObserved=new Set();this.observationDwell=new Map();this.observationHint=null;this.observationUntil=0;
    this.divingChapter = this.expedition.activeChapter.id;
    this.wasFinished=this.expedition.isFinished;
    this.wasStopPracticed=!!this.learning?.practiced.has("stop");
    this.diveGuide=new SurveyDiveGuide(this.learning??new ExpeditionLearning(),this.divingChapter);
    this.shotBar = null;
    this.hideNotice();
    this.boat?.hide();
    if(!this.freq)args[2]={...args[2],deck:[]};
    super.startDive(...args);
    this.saveFailureShown=false;
    this.session?.begin(this);
    this.boat?.transition?.holdDive();
  }

  render(delta){
    if (this.boat?.screen === 'ice') return;
    const active=this.mode==="dive"&&!this.paused&&!this.state.dying;
    const showHint=active&&!this.noteOpen&&!this.gas.open&&this.tips.phase==="run"&&!this.tips.card;
    this.guideText=null;
    if(active&&this.noteOpen)this.guideText="Чтение · нырок на паузе";
    super.render(delta);
    this.pauseUI?.update();
    this.updateCameraCue(showHint,!this.guideText&&this.notice.hidden);
    if(this.lineSense){
      const signal=showHint?blindLineSignal(this.state,this.world):'';
      this.lineSense.hidden=!signal;
      if(this.lineSense.textContent!==signal)this.lineSense.textContent=signal;
    }
    if(!this.firstHint)return;
    if(showHint)this.observeFinds(delta);
    const hintText=this.guideText;
    this.firstHint.hidden=!hintText;
    this.firstHint.classList.toggle('is-reading',!!this.noteOpen);
    if(hintText&&this.firstHint.textContent!==hintText)this.firstHint.textContent=hintText;
  }

  presentDiveHint(delta,blocked,eligible){
    if(blocked||this.noteOpen||this.gas.open||!this.diveGuide||!this.tips.on||this.reveal.mem.diver||!this.reveal.mem.lines)return;
    if(!this.notice.hidden){
      if(this.diveGuide.active?.priority>=8||this.diveGuide.queue.some(item=>item.priority>=8)||this.state.stop>0&&!Wt(this.state)&&(!this.diveGuide.learned('stop')||this.diveGuide.active?.id==='stop'))this.hideNotice();
      else return;
    }
    if(this.tips.mem.seen.has('blind'))this.learning.remember('silt');
    const first=this.firstOuting;
    this.diveGuide.firstLessonId=null;
    if(first){
      const lesson=firstDiveLesson(this.state,this.diveShots,this.cameraUsesKeyboard(),this.diveNotes,this.diveObserved);
      this.diveGuide.firstLessonId=lesson.id;this.diveGuide.enqueue(lesson.id,lesson.text,lesson.id==='first-return'?6:3);
    }
    if(!first)this.diveGuide.importReveal(this.reveal,this.state,eligible);
    this.guideText=this.diveGuide.message(this.state,delta,this.world,this.reveal,eligible);
  }

  afterSimulationStep(state,world){
    if(!this.diveGuide)return;
    this.diveGuide.step(state,world);
    if(!this.freq&&this.diveGuide.canComplicate(state,world)){
      const event=jr(state,"light");state.fail.list.push(event);Oo(state,event);this.diveGuide.lightTriggered=true;
    }
  }

  simStep(input){
    if(this.session?.blocked)return;
    const releasedEarly=this.firstOuting && this.tips.on && !this.tips.card &&
      !this.diveShots.length && !input.camera && this.state.camera.hold>0;
    super.simStep(input);
    if(releasedEarly && this.state.phase==='dive' && !this.paused && !this.noteOpen && !this.gas.open && !this.state.dying){
      const button=this.cameraUsesKeyboard()?'X':'«Камеру»';
      this.showPhotoNotice('Затвор не сработал. Держи '+button+' до вспышки.',3000);
    }
    const important=this.state.phase==='end'||this.state.events.some(event=>['shot','read','tie','drop','pickup','gas','fail'].includes(event.type));
    this.session?.save(this,important);
    if(this.session?.error==='storage'&&!this.saveFailureShown){
      this.saveFailureShown=true;this.hideNotice();this.notice.textContent='Не удалось сохранить нырок. Открой паузу перед закрытием вкладки.';
      this.notice.hidden=false;this.noticeTimer=setTimeout(()=>this.hideNotice(),6000);
    }else if(!this.session?.error)this.saveFailureShown=false;
  }

  observeFinds(delta){
    if(!this.diveObserved)return;
    for(const find of this.world.site.finds){
      if(this.diveObserved.has(find.id))continue;
      const visible=surveyFindVisible(find,this.state.diver,this.lastView,this.scene.lf,this.layout.dpr);
      const dwell=visible?(this.observationDwell.get(find.id)??0)+Math.min(delta,.1):0;
      this.observationDwell.set(find.id,dwell);
      if(dwell<.6)continue;
      this.diveObserved.add(find.id);
    }
  }

  backBar() {
    return Math.round(this.state.tanks.find(tank => tank.id === "back").bar);
  }

  photoAssessment(view,frame,light,white,finds=null){
    return surveyPhotoAssessment({light,view:surveyPhotoView(view,frame),subjects:this.world.site.finds,notes:this.world.site.notes,diver:this.state.diver,white,finds,
      visible:find=>surveyCameraVisible(find,view,this.scene.lf,this.layout.dpr)});
  }
  updateCameraCue(visible,captionAllowed=true){
    if(!this.cameraCue)return;
    const framing=visible&&this.input.isHeld('camera')&&this.buttons(this.state).camera;
    this.cameraFrame.hidden=!framing;
    if(!framing){this.cameraCue.hidden=true;this.nextCameraCheck=0;return;}
    const view=this.view(),event={x:this.state.diver.x,y:this.state.diver.y,aim:this.state.diver.aim},frame=this.photoFrame(view,event);
    const dpr=this.layout.dpr;Object.assign(this.cameraFrame.style,{left:frame.x/dpr+'px',top:frame.y/dpr+'px',width:frame.size/dpr+'px',height:frame.size/dpr+'px'});
    if(!captionAllowed||this.state.camera.charge>0){this.cameraCue.hidden=true;this.nextCameraCheck=0;return;}
    if(this.time<(this.nextCameraCheck??0))return;
    this.nextCameraCheck=this.time+.16;
    const exposure=this.scene.previewPhoto(this.state,view,frame),assessment=this.photoAssessment(view,frame,exposure.light,exposure.backscatter>=Q.WHITE_MIN);
    this.cameraCue.hidden=false;
    this.cameraCue.dataset.kind=assessment.kind;
    const text=assessment.title;
    if(this.cameraCue.textContent!==text)this.cameraCue.textContent=text;
  }

  hideNotice() {
    clearTimeout(this.noticeTimer);
    if (this.notice) this.notice.hidden = true;
  }

  cameraUsesKeyboard(){
    return this.input.lastKeyboard || !window.matchMedia('(pointer: coarse)').matches;
  }

  showPhotoNotice(text,duration){
    this.hideNotice();
    this.notice.textContent=text;
    this.notice.hidden=false;
    this.noticeTimer=setTimeout(()=>this.hideNotice(),duration);
  }

  onShot(event) {
    super.onShot(event);
    const shot = this.diveShots.at(-1);
    const view=this.view(),frame=this.photoFrame(view,event);
    shot.feedback=this.photoAssessment(view,frame,this.scene.lit,shot.white,shot.finds);
    for(const id of shot.finds)this.diveObserved?.add(id);
    if (this.shotBar === null && shot.finds.includes(this.expeditionTarget?.id)) this.shotBar = this.backBar();
    // Every exposure remains on film; only a first discovery gets a celebration.
    if(shot.fresh.length){
      const discovery=(shot.fresh.length===1?'Новая находка · ':'Новые находки · ')+shot.fresh.map(Eu).join(' · ');
      const firstTag=this.firstOuting && this.tips.on && shot.fresh.includes(firstDiveTarget.id);
      this.showPhotoNotice(firstTag?discovery+'\n'+firstAscentControl(this.cameraUsesKeyboard()):discovery,4000);
    }
  }

  finishDive() {
    if(!this.session?.token)return this.finishSurveyDive();
    if(this.session.completed)return;
    this.mode='ending';
    try{
      if(this.session.deliver(this,()=>this.finishSurveyDive())){this.mode='result';this.paused=false;return;}
    }catch(error){
      this.mode='delivery';this.paused=true;
      showDiveStorageProblem(()=>window.location.reload(),'Не удалось завершить возвращение. Сохранённый нырок оставлен; перезагрузка позволит повторить доставку.');
      return;
    }
    this.mode='delivery';this.paused=true;
    if(this.session.error==='owner')this.pauseUI.conflict();
    else showDiveStorageProblem(()=>this.finishDive());
  }

  finishSurveyDive() {
    this.boat?.transition?.cancel();
    this.hideNotice();
    const before=this.beforeEvidence??this.expedition.evidenceKeys();
    this.resultScreen.deliveredFilm=saveDeliveredFilm(this.diveShots,this.state.outcome?.kind!=="dead");
    this.resultScreen.assignment = this.expeditionTarget?.id?this.expeditionTarget:null;
    this.resultScreen.shotBar = this.shotBar;
    this.resultScreen.chapterNote = "";
    this.planScreen.lastEntryBar = this.state.tanks.find(tank => tank.id === "back")?.ruleBar ?? null;
    super.finishDive();
    this.resultScreen.onPlan=()=>this.showPlan();
    if(this.resultScreen.planButton)this.resultScreen.planButton.textContent="На лодку";
    const kept=this.state.outcome?.kind!=="dead";
    this.learning?.bank(this.diveGuide?.actions??[],kept);
    if(kept&&!this.wasStopPracticed&&this.diveGuide?.actions.has("stop")&&this.state.outcome?.kind==="clean"&&!this.state.outcome?.cesa){
      this.resultScreen.heading.textContent="Первый возврат с остановкой";
      this.resultScreen.summary.textContent=this.diveGuide.report(this.state,true);
      this.resultScreen.summary.hidden=false;
    }
    this.expedition.remember(this.diveObserved??[],kept);
    this.expedition.refresh();
    const firstCompleted=this.firstDive?.finish(kept,this.diveFinds.map(find=>find.id),this.diveNotes,this.diveObserved);
    if(this.firstOuting&&kept&&this.state.outcome?.kind==='clean'&&!this.state.outcome?.cesa&&(firstCompleted||!this.resultScreen.scoutingGain)){
      this.resultScreen.summary.textContent=firstCompleted
        ?(this.diveFinds.length?"Снимок сохранился в альбоме. Рассмотрим находку на лодке.":this.diveNotes?.size?"Прочитанная запись теперь в журнале.":"Новый ориентир отмечен в журнале.")
        :this.diveShots.length?"Метка не попала в кадр. На следующем выходе подплыви к ней ближе и направь свет перед снимком.":"Вернулся без снимка — можно попробовать ещё раз. Жёлтая метка находится под буем на 6 м.";
      this.resultScreen.summary.hidden=false;
      if(firstCompleted&&this.diveFinds.some(find=>find.id===firstDiveTarget.id))this.resultScreen.heading.textContent="Первый снимок на лодке";
    }
    if(kept&&(!this.firstOuting||firstCompleted)){
      const debrief=this.expedition.debrief(before);
      if (debrief.changed) {
        const answer = debrief.entries.find(entry => entry.text === debrief.text);
        if (answer) de(qt('field-record'), {title: answer.title, text: answer.text});
      }
      const report=this.diveGuide?.report(this.state,true);
      this.resultScreen.next.textContent=(debrief.changed?debrief.text:report||debrief.text)+" "+debrief.next;
      this.resultScreen.next.hidden=false;
      if(debrief.changed&&this.state.outcome?.kind==='clean'&&!this.state.outcome?.cesa){
        const stopLesson=!this.wasStopPracticed&&this.diveGuide?.actions.has('stop');
        if(!stopLesson){
          this.resultScreen.heading.textContent=debrief.answer?'Метка была здесь раньше':this.firstOuting?'Первый след на лодке':'Новое свидетельство на лодке';
          this.resultScreen.summary.textContent=debrief.text;
          this.resultScreen.summary.hidden=this.diveShots.some(shot=>shot.finds.some(id=>xt().finds.find(find=>find.id===id)?.fact===debrief.text));
        }
      }
      if(this.resultScreen.showDiscovery){this.resultScreen.showDiscovery(debrief);this.resultScreen.next.hidden=true;}
      this.resultScreen.showEvidence?.(debrief.entries,this.expedition.isFinished&&!this.wasFinished);
    }else if(!kept){
      this.resultScreen.next.textContent=this.diveGuide?.report(this.state,false)??"Прежние снимки и записи сохранились на лодке.";
      this.resultScreen.next.hidden=false;
    }
    // An early final discovery also closes the story on the very first outing.
    if(kept&&this.expedition.isFinished&&!this.expedition.endingReviewed){
      if(this.firstOuting){
        this.resultScreen.showEvidence?.([],!this.wasFinished);
        if(this.state.outcome?.kind==="clean"&&!this.state.outcome?.cesa&&this.resultScreen.summary)this.resultScreen.summary.hidden=true;
      }
      this.resultScreen.next.hidden=true;
      this.resultScreen.onPlan=()=>this.boat.showEnding();
      if(this.resultScreen.planButton)this.resultScreen.planButton.textContent="Разобрать находки";
    }
    this.firstOuting=false;
    if(this.firstHint)this.firstHint.hidden=true;
    if(this.cameraCue)this.cameraCue.hidden=true;
    if(this.cameraFrame)this.cameraFrame.hidden=true;
    this.updateAssignment();
    this.boat?.showResult();
  }
}

// Use the same occluded beam and ambient light as the rendered scene. Mere
// proximity, off-screen points and objects behind rock do not become evidence.
function surveyFindVisible(find,diver,view,light,dpr=1){
  if(!view||!light)return false;
  return find.pts.some(([x,y])=>Math.hypot(x-diver.x,y-diver.y)<=9&&Gd(view,x,y,100*dpr)&&Math.max(light.beam(x,y),light.ambient(x,y))*light.view(x,y)>.18);
}
