// Learning is separate from story evidence. Reading a briefing is not the same
// as performing the action in water. Only a completed return banks practice.
class ExpeditionLearning {
  constructor(){
    this.key=qt("learning");const saved=Me(this.key);
    this.briefed=new Set(saved?.version===1?saved.briefed??[]:[]);
    this.practiced=new Set(saved?.version===1?saved.practiced??[]:[]);
    this.seen=new Set(saved?.version===1?saved.seen??[]:[]);
    this.presented=new Set(saved?.version===1?saved.presented??saved.seen??[]:[]);
  }
  save(){de(this.key,{version:1,briefed:[...this.briefed],practiced:[...this.practiced],seen:[...this.seen],presented:[...this.presented]});}
  present(id){if(!this.presented.has(id)){this.presented.add(id);this.save();}}
  remember(id){if(!this.seen.has(id)){this.seen.add(id);this.presented.add(id);this.save();}}
  brief(id){this.briefed.add(id);this.save();}
  bank(actions,kept){if(kept){for(const id of actions)this.practiced.add(id);this.save();}}
  reset(){this.briefed.clear();this.practiced.clear();this.seen.clear();this.presented.clear();this.save();}
  nextBrief(progress,first){
    if(first)return null;
    if(!this.briefed.has("return"))return "return";
    const deep=progress.chapterId!=="survey",beyond=deep||progress.knows("dome")||progress.knows("cache")||progress.notes.has("n2");
    if(beyond&&!this.briefed.has("line"))return "line";
    if(deep&&!this.briefed.has("stop"))return "stop";
    if(progress.chapterId==="fate"&&!this.briefed.has("backup"))return "backup";
    return null;
  }
}

function surveyReadiness(progress,plan,first=false){
  if(first)return [];
  const long=progress.intention().long,deep=progress.chapterId!=="survey";
  const beyond=deep||progress.knows("dome")||progress.knows("cache")||progress.notes.has("n2");
  const items=[];
  if(long&&plan.back!=="twin")items.push({id:"twin",title:"Для дальнего пути — спарка",text:"В одном баллоне вдвое меньше газа. С ним лучше ограничиться короткой разведкой и развернуться раньше."});
  if(beyond&&!plan.slots.includes("reel"))items.push({id:"reel",title:"В комплекте нет катушки",text:"Следуй готовой линии и возвращайся у её конца. Чтобы продолжить за ним, нужна своя линия."});
  return items;
}

// A small instrument rehearsal on the boat. It does not grant real stop
// experience, equipment, story progress, or change the simulation's tissues.
class StopRehearsal {
  constructor(){this.depth=12;this.remaining=3;this.done=false;}
  move(depth){if(!this.done)this.depth=depth;}
  wait(){if(this.depth===9&&!this.done){this.remaining--;this.done=this.remaining===0;}return this.done;}
  get text(){return this.done?"Остановка снята. Теперь можно продолжить подъём.":this.depth<9?"Ты выше скобки. Вернись на 9 м — здесь остановка не идёт.":this.depth>9?"На приборе остановка 9 м. Поднимись к этой отметке.":`Ты в скобке. «Ждать» ускоряет время. Осталось ${this.remaining}.`;}
}

// These lessons used to have two independent presenters. Keep their old read
// receipts, but let a single queue own text and time on screen.
const surveyGuideCovers={entry:['turnMarks'],turn:['turnHit'],'line-end':['tie'],'line-started':['tieOffHint'],shaft:['ascent']};
const surveyGuideOwns=new Set(['camera','turnMarks','turnHit','tie','tieOffHint','deco','wait','ruler','ppo2']);
class SurveyDiveGuide {
  constructor(learning,chapter){
    this.learning=learning;this.chapter=chapter;this.actions=new Set();this.queue=[];this.shown=new Set();
    this.active=null;this.until=0;this.bandSeconds=0;this.wasStop=false;this.returned=false;this.turnSeen=false;this.far=false;this.lightTriggered=false;
    this.clock=0;this.gapUntil=0;
  }
  learned(id){
    if(['turn','stop-clear'].includes(id))return false; // Actual events recur; explanations do not.
    return this.learning.presented.has(id)||this.understood(id);
  }
  understood(id){
    return this.learning.seen.has(id)||
      id==='line-end'&&this.learning.practiced.has('line-start')||
      ['line-started','line-fixed'].includes(id)&&this.learning.practiced.has('line-fixed');
  }
  enqueue(id,text,priority=0){if(!this.learned(id)&&!this.shown.has(id)&&this.active?.id!==id&&!this.queue.some(item=>item.id===id))this.queue.push({id,text,priority});}
  importReveal(reveal,state,eligible){
    for(const [id,covers] of Object.entries(surveyGuideCovers)){
      if(id!=='turn'&&!this.learning.presented.has(id)&&covers.some(key=>reveal.mem.said.has(key)))this.learning.remember(id);
    }
    for(const id of reveal.pending){
      const def=As(id);
      if(!def?.line||surveyGuideOwns.has(id)||reveal.mem.said.has(id)||!this.contextRelevant(def,state,eligible))continue;
      this.enqueue('hint:'+id,typeof def.line==='function'?def.line(state):def.line,0);
    }
  }
  contextRelevant(def,state,eligible){
    if(!def||!eligible(def))return false;
    if(def.id==='auto')return Wt(state);
    if(['gasMenu','ean50Hint'].includes(def.id))return Fu(state);
    return true;
  }
  present(item,reveal){
    if(item.announced)return;
    item.announced=true;
    this.shown.add(item.id);
    if(!['turn','stop-clear'].includes(item.id))this.learning.present(item.id);
    if(!reveal)return;
    const ids=item.id.startsWith('hint:')?[item.id.slice(5)]:surveyGuideCovers[item.id]??[];
    for(const id of ids){
      reveal.mem.said.add(id);reveal.pending=reveal.pending.filter(key=>key!==id);
      if(As(id)?.lesson)reveal.onLessonRead?.(As(id).lesson);
    }
    if(ids.length)reveal.persist?.(reveal.mem);
  }
  complete(item){if(!['turn','stop-clear'].includes(item.id))this.learning.remember(item.id);}
  relevant(item,state,world,eligible){
    const id=item.id;
    if(id.startsWith('first-'))return id===this.firstLessonId;
    if(id.startsWith('hint:'))return this.contextRelevant(As(id.slice(5)),state,eligible);
    if(id==='entry')return Wt(state)&&state.ruleT!==null;
    if(id==='turn')return Wt(state)&&state.tanks.some(t=>t.id==='back'&&t.bar<=t.marks?.[0]);
    if(id==='shaft')return !Wt(state)&&state.depth>2;
    if(id==='line-end')return state.line.reel==='off'&&(!world||world.olds.some(line=>Math.hypot(line.pts.at(-1).x-state.diver.x,line.pts.at(-1).y-state.diver.y)<2.4));
    if(id==='line-started')return state.line.reel==='live'&&state.stats.ties===0;
    if(id==='silt')return state.siltHere>=U.MURKY;
    if(id==='stop')return state.stop>0&&!Wt(state);
    return true;
  }
  step(state,world){
    const tank=state.tanks.find(t=>t.id==="back"),turn=tank?.marks?.[0];
    if(state.siltHere>=U.MURKY)this.enqueue('silt','Это ил: ласты у дна поднимают взвесь, которая закрывает обзор и засвечивает снимки. Отпусти движение, дай ей осесть. Дальше двигайся медленно, держась линии и выше дна.',6);
    if(state.ruleT!==null){
      this.enqueue("entry",`Под сводом путь наверх — обратно по линии. Отметка разворота: ${Math.round(turn??0)} бар. Можно вернуться раньше, даже без снимка.`,2);
      if(Number.isFinite(turn)&&tank.bar<=turn){this.turnSeen=true;this.enqueue("turn","Газ дошёл до отметки разворота. К выходу по линии.",8);}
    }
    if(state.ruleT!==null&&!Wt(state)&&state.depth>2){this.returned=true;this.enqueue("shaft","Ты в шахте. Поднимайся вдоль верёвки к бую. Красные стрелки означают слишком быстрый подъём; на клавиатуре держи Shift.",3);}
    const nearest=world.olds.map(line=>({line,point:line.pts.at(-1)})).find(({point})=>Math.hypot(point.x-state.diver.x,point.y-state.diver.y)<2.4);
    if(nearest&&state.line.reel==="off")this.enqueue("line-end",state.line.capacity>0?"Здесь старая линия заканчивается. Перед продолжением удержи «Начать линию» или E. На повороте у стены закрепи её той же кнопкой.":"Здесь старая линия заканчивается. Катушки с собой нет: возвращайся по готовому пути. Продолжение можно подготовить на лодке.",4);
    if(state.line.parent&&state.line.reel==="live"){
      this.actions.add("line-start");
      this.learning.remember('line-end');
      this.enqueue("line-started","Своя линия идёт за тобой. У стены на повороте удержи «Закрепить» или E. По этой нити возвращайся к старой линии.",4);
      if(state.stats.ties>0){this.actions.add("line-fixed");this.learning.remember('line-started');this.enqueue("line-fixed","Линия закреплена. Этот участок останется в пещере к следующему выходу.",2);}
    }
    if(state.stop>0){
      this.wasStop=true;
      if(wn(state)){
        this.bandSeconds+=bt.DT;state.stats.stopServedS=this.bandSeconds;
      }
    }
    if(this.wasStop&&state.stop===0&&this.bandSeconds>=1){
      this.actions.add("stop");this.enqueue("stop-clear","Остановки пройдены. Продолжай медленный подъём к бую.",7);
    }
    for(const event of state.events){if(event.type==="fail"&&event.kind==="light"&&event.phase==="fixed")this.actions.add("backup");}
    if(state.depth>30&&state.diver.x>65)this.far=true;
  }
  canComplicate(state,world){
    if(this.chapter!=="fate"||!this.learning.briefed.has("backup")||!this.learning.practiced.has("stop")||this.learning.practiced.has("backup")||this.lightTriggered||!this.far)return false;
    if(state.phase!=="dive"||state.dying||state.blind||state.siltHere>.1||Object.values(state.alarms).some(Boolean)||state.fail.list.some(f=>f.phase!=="fixed"))return false;
    if(state.depth<30||state.depth>49||state.diver.x>63||state.diver.vx>=-.1||state.tanks.find(t=>t.id==="back").bar<70)return false;
    const lines=[...world.olds,...state.laid];
    if(state.line.parent)lines.push({pts:Er(state.line)});
    return lines.some(line=>(hn(line.pts,state.diver)?.dist??Infinity)<1.3);
  }
  message(state,delta=null,world=null,reveal=null,eligible=()=>true){
    // Explain the instrument once. Subsequent stops remain visible on the HUD.
    if(state.stop>0&&!Wt(state)){
      const text=state.depth<Math.max(state.ceiling,state.stop-ut.BAND_ABOVE_M)
        ?`Ты выше остановки. Опустись к скобке ${state.stop} м и удерживай глубину. В скобке «Ждать» или H ускоряет время.`
        :state.depth<=state.stop+ut.BAND_BELOW_M
          ?`Остановка ${state.stop} м. Оставайся в скобке и нажми «Ждать» или H. Когда прибор снимет её, продолжай подъём.`
          :`На подъёме нужна остановка ${state.stop} м. Поднимайся к скобке на шкале. Внутри нажми «Ждать» или H; продолжай подъём, когда остановка снимется.`;
      this.enqueue('stop',text,7);
      if(this.active?.id==='stop')this.active.text=text;
    }
    const clock=delta===null?(state.tWall??state.t):(this.clock+=Math.min(delta,.1));
    this.queue=this.queue.filter(item=>!this.learned(item.id)&&this.relevant(item,state,world,eligible));
    if(this.active&&(this.understood(this.active.id)||!this.relevant(this.active,state,world,eligible))){this.active=null;this.gapUntil=clock+5;}
    if(this.active&&clock>=this.until){this.complete(this.active,reveal);this.active=null;this.gapUntil=clock+7;}
    const urgent=this.queue.find(item=>item.priority>=6);
    if(urgent&&this.active&&urgent.priority>this.active.priority)this.active=null;
    if(!this.active&&(clock>=this.gapUntil||urgent)){
      this.queue.sort((a,b)=>b.priority-a.priority);this.active=this.queue.shift()??null;
      if(this.active)this.until=clock+9;
    }
    if(this.active)this.present(this.active,reveal);
    return this.active?.text??null;
  }
  report(state,kept){
    if(!kept){
      const cause=state.outcome?.cause??"";
      if(cause.includes("deco"))return "Для повторного выхода сократи время в глубине и сохрани газ на остановки. Прежние снимки и записи остались на лодке.";
      if(cause.includes("oog"))return "На следующем выходе развернись раньше. Для длинного маршрута возьми спарку; старый альбом сохранён.";
      return "Прежний альбом сохранён. Повтори короткий знакомый участок и проверь комплект перед продолжением.";
    }
    if(this.actions.has("stop"))return "Остановки пройдены. Теперь понятна задача газа подъёма: он сокращает их длительность.";
    if(this.actions.has("line-fixed"))return "Закреплённая линия осталась в пещере. Следующий выход можно начать по уже подготовленному пути.";
    if(this.returned&&this.turnSeen)return "Ты вернулся после отметки разворота. Проверь остаток газа: против течения или в мути разворачивайся раньше.";
    if(this.returned)return "Ты проверил путь и вернулся с запасом. Короткая разведка тоже помогает подготовить продолжение.";
    return "";
  }
}
