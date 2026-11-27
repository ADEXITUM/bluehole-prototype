class SurveyEnding {
  constructor(boat){
    this.boat=boat;this.root=surveyElement("section","","exp-ending exp-paper");this.root.hidden=true;
    this.root.setAttribute('aria-label','Итог экспедиции');boat.root.append(this.root);
  }
  show(stage=0){
    if(!this.boat.progress.isFinished)return;
    this.boat.game.mode="plan";this.boat.setScreen("ending");this.root.hidden=false;
    this.root.replaceChildren();
    this.root.classList.toggle('ending-arrival',stage===0);
    const title=surveyElement("h2",stage===0?"Обратно на свет":"Итог экспедиции");title.tabIndex=-1;
    this.root.append(surveyElement("p","Блю-хол · история завершена","exp-eyebrow"),title);
    if(stage===0){
    this.root.append(surveyElement("p","Ты кладёшь снимки на стол. Напарник разворачивает старую схему.","ending-scene"));
    const strip=surveyElement("div","","ending-photos"),album=ji().frames;
    for(const [id,label] of [["slate81","Записи · август 1981"],["body","Место у стены"]]){
      if(!album[id])continue;
      const button=surveyElement('button'),img=new Image();img.src=album[id];img.alt=label;
      button.append(img,surveyElement('span',label));button.addEventListener('click',()=>openDivePhoto(album[id],null,[id],false,[],ji().marks));strip.append(button);
    }
    if(strip.childElementCount)this.root.append(strip);
    this.root.append(surveyElement("blockquote","«Ты привёз не просто снимок. Теперь мы знаем, где искать. Передадим записи Корнееву»."),surveyElement("p","Напарник","ending-speaker"));
    const next=surveyElement('button','Подвести итог →','exp-primary');next.addEventListener('click',()=>this.show(1));this.root.append(next);title.focus({preventScroll:true});return;
    }
    const facts=surveyElement("div","","ending-facts");
    for(const [label,text] of [["Что установлено","Запись 1981 года описывает потерю обратного пути. У стены найдены останки дайвера — вероятно, её автора."],["Что остаётся неизвестным","Имя человека и причина потери пути. Одних фотографий недостаточно, чтобы это установить."]]){
      const part=surveyElement('section');part.append(surveyElement('h3',label),surveyElement('p',text));facts.append(part);
    }
    this.root.append(facts,surveyElement('p','История Блю-хола завершена. Можно вернуться за другими снимками — находки и подготовленные маршруты сохранены.','ending-caption'));
    const actions=surveyElement('div','','ending-actions');
    for(const [label,action] of [["К подлёдному посту",()=>this.boat.library.open('ice')],["На лодку · исследовать дальше",()=>this.boat.game.showPlan()],["Открыть журнал",()=>{this.boat.game.mode='plan';this.boat.showChapters();}],["К экспедициям",()=>this.boat.showExpeditions()]]){
      const b=surveyElement('button',label,actions.childElementCount?'':'exp-primary');
      b.addEventListener('click',()=>{this.boat.progress.reviewEnding();action();});actions.append(b);
    }
    this.root.append(actions);title.focus({preventScroll:true});
  }
}
