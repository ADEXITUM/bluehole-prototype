// Surface rehearsals use the same words and controls as the dive. They never
// edit the chosen loadout; warnings can be accepted for a shorter free dive.
class SurveyPreflight {
  constructor(boat){
    this.boat=boat;this.game=boat.game;this.waived=null;
    this.root=surveyElement("section","","exp-paper expedition-preflight");this.root.hidden=true;
    this.root.setAttribute("aria-label","Перед погружением");boat.root.append(this.root);
  }
  cancelTimer(){clearTimeout(this.timer);this.timer=null;}
  open(){
    const game=this.game,first=!!game.firstDive?.active;
    if(first)return false;
    const signature=JSON.stringify([game.expedition.chapterId,game.planScreen.current]);
    const warnings=surveyReadiness(game.expedition,game.planScreen.current,first);
    const lesson=game.learning.nextBrief(game.expedition,first);
    if(warnings.length&&this.waived!==signature){this.signature=signature;this.show("kit",warnings);return true;}
    if(lesson){this.show(lesson);return true;}
    this.waived=null;return false;
  }
  show(id,warnings=[]){
    this.id=id;this.boat.setScreen("briefing");this.root.hidden=false;
    this.root.replaceChildren();
    const header=surveyElement("header","","station-header"),copy=surveyElement("div");
    const titles={kit:"С чем идём",return:"Путь обратно",line:"За концом старой линии",stop:"Остановка на подъёме",backup:"Проверь запасной свет"};
    this.title=surveyElement("h2",titles[id]);this.title.tabIndex=-1;
    copy.append(surveyElement("p","На лодке · перед выходом","exp-eyebrow"),this.title);
    const close=surveyElement("button","×");close.setAttribute("aria-label","На лодку");close.addEventListener("click",()=>this.boat.showBoat());
    header.append(copy,close);this.root.append(header);
    this.content=surveyElement("div","","preflight-content");this.root.append(this.content);
    this.actions=surveyElement("div","","preflight-actions");this.root.append(this.actions);
    const button=(text,run,primary=false)=>{const b=surveyElement("button",text,primary?"exp-primary":"");b.addEventListener("click",run);this.actions.append(b);return b;};
    const done=()=>{this.game.learning.brief(id);this.boat.dive();};
    if(id==="kit"){
      for(const warning of warnings){const section=surveyElement("section");section.append(surveyElement("h3",warning.title),surveyElement("p",warning.text));this.content.append(section);}
      button("Подготовить комплект",()=>this.boat.openStation("gear","boat"),true);
      button("Короткий выход этим комплектом",()=>{this.waived=this.signature;this.boat.dive();});
    }else if(id==="return"){
      this.content.innerHTML='<div class="return-diagram" role="img" aria-label="Линия ведёт из пещеры обратно к бую"><span>Буй<br>↑</span><i>← ← ←</i><span>Под сводом</span></div>';
      this.content.append(surveyElement("p","Под камнем нельзя всплыть прямо наверх. Возвращайся по линии к шахте, затем к бую."),surveyElement("p","На входе появится отметка «Разворот». Достиг её — пора назад. Против течения или в мути поворачивай раньше."));
      button("Понятно · продолжить",done,true);
    }else if(id==="line"){
      this.content.innerHTML='<div class="line-rehearsal" role="img" aria-label="Старая линия, точка привязки и своя линия"><span>Старая линия</span><i></i><b>●</b><em></em><span>Своя линия</span></div>';
      this.content.append(surveyElement("p","У конца старой линии удержи «Начать линию» или E. Нить пойдёт за тобой."),surveyElement("p","На повороте приблизься к стене и удержи «Закрепить» или E. Закреплённый путь сохранится после возвращения."),surveyElement("p","Без катушки остановись у конца готовой линии. Это тоже полезная разведка.","preflight-note"));
      button("Понятно · продолжить",done,true);
    }else if(id==="stop"){
      this.rehearsal=new StopRehearsal();
      this.content.append(surveyElement("p","В глубине прибор может назначить остановку. Покажет её глубину и время; на подъёме нужно остаться в скобке."));
      this.preview=surveyElement("div","","stop-rehearsal");this.preview.setAttribute("aria-label","Проверка прибора на лодке");
      this.preview.innerHTML='<small>Проверка прибора на лодке</small><div class="stop-display"><span>ОСТАНОВКА<strong>9 м</strong></span><span class="stop-count"></span></div><div class="stop-depths"></div><p class="stop-feedback" role="status"></p>';
      this.content.append(this.preview);
      for(const depth of [6,9,12]){const b=surveyElement("button",depth+" м");b.addEventListener("click",()=>{this.rehearsal.move(depth);this.renderStop();});b.dataset.depth=String(depth);this.preview.querySelector('.stop-depths').append(b);}
      this.waitButton=button("Ждать",()=>{
        if(this.timer)return;
        const tick=()=>{this.timer=null;this.rehearsal.wait();if(!this.rehearsal.done)this.timer=setTimeout(tick,300);this.renderStop();};
        this.timer=setTimeout(tick,300);this.renderStop();
      },true);
      this.continueButton=button("К погружению",done,true);this.renderStop();
    }else{
      this.content.innerHTML='<div class="backup-rehearsal" role="img" aria-label="Запасной фонарь выключен"><i></i><canvas width="280" height="240" aria-hidden="true"></canvas></div>';
      const lampCanvas=this.content.querySelector('canvas'),ctx=lampCanvas.getContext('2d');
      ctx.scale(2,2);ctx.translate(70,60);ctx.rotate(Math.PI/2+.35);
      paintEquipmentItem(ctx,this.game.planScreen.current.slots.includes('light')?'light':'baseLight',-50,-50,100);
      this.content.append(surveyElement("p","Если основной свет мигает или погас, удерживай «Фонарь» или L до завершения кольца. Запасной фонарь уже на тебе."));
      const test=button("Проверить запасной фонарь",()=>{
        const lamp=this.content.querySelector('.backup-rehearsal');lamp.classList.add('lit');lamp.setAttribute('aria-label','Запасной фонарь горит');
        test.hidden=true;this.content.append(surveyElement("p","Резерв включён. В воде после отказа поворачивай к выходу; улучшенный резерв светит дальше стандартного.","preflight-note"));
        button("Свет проверен · продолжить",done,true);
      },true);
    }
    this.title.focus({preventScroll:true});
  }
  renderStop(){
    const model=this.rehearsal;
    this.preview.querySelector('.stop-feedback').textContent=model.text;
    this.preview.querySelector('.stop-count').textContent=model.done?"Можно выше":model.remaining+" с";
    for(const button of this.preview.querySelectorAll('[data-depth]')){
      button.setAttribute('aria-pressed',String(Number(button.dataset.depth)===model.depth));button.disabled=model.done||!!this.timer;
    }
    this.preview.dataset.band=String(model.depth===9);this.preview.dataset.done=String(model.done);
    this.waitButton.hidden=model.done;this.waitButton.disabled=model.depth!==9||!!this.timer;
    this.waitButton.textContent=this.timer?"Ждём…":"Ждать";
    this.continueButton.hidden=!model.done;
  }
}
