class SurveyPause {
  constructor(game){
    this.game=game;this.open=false;
    this.button=surveyElement('button','Ⅱ','dive-pause-button');this.button.setAttribute('aria-label','Пауза');this.button.hidden=true;
    this.button.addEventListener('click',()=>this.show());game.frameEl.append(this.button);
    this.dialog=surveyElement('dialog','','dive-pause-dialog');this.dialog.setAttribute('aria-label','Пауза погружения');document.body.append(this.dialog);
    this.dialog.addEventListener('cancel',event=>{event.preventDefault();this.resume();});
    window.addEventListener('keydown',event=>{
      if(event.repeat||game.mode!=='dive'||game.boat?.transition?.active)return;
      if((event.key==='Escape'&&!game.noteOpen&&!game.gas.open)||event.code==='KeyP'){
        event.preventDefault();event.stopImmediatePropagation();this.open?this.resume():this.show();
      }
    },true);
    window.addEventListener('blur',()=>this.show('Игра приостановлена при переключении окна.'));
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.show('Игра приостановлена при сворачивании.');});
  }
  update(){this.button.hidden=this.game.mode!=='dive'||!!this.game.noteOpen||this.game.boat?.transition?.active||this.open;}
  show(reason=''){
    const g=this.game;if(this.open||g.mode!=='dive'||g.boat?.transition?.active)return;
    this.open=true;g.paused=true;g.clock.acc=0;g.input.enabled=false;g.input.reset();g.frameEl.inert=true;this.update();
    const saved=g.session?.save(g,true);
    if(g.session?.blocked)return;
    this.dialog.replaceChildren();
    const title=surveyElement('h2','На паузе');title.tabIndex=-1;
    this.dialog.append(surveyElement('p','Блю-хол · погружение','exp-eyebrow'),title,surveyElement('p',reason||'Глубина, газ и время остановлены.'));
    const resume=surveyElement('button','Продолжить погружение','exp-primary');resume.addEventListener('click',()=>this.resume());this.dialog.append(resume);
    if(g.session){
      const status=surveyElement('p',saved?'Нырок сохранён. Можно закрыть вкладку.':'Не удалось сохранить этот момент. После закрытия вкладки часть выхода может потеряться.','pause-save-status');status.setAttribute('role','status');
      this.dialog.append(status);
      if(!saved){const retry=surveyElement('button','Повторить сохранение');retry.addEventListener('click',()=>{if(g.session.save(g,true)){status.textContent='Нырок сохранён. Можно закрыть вкладку.';retry.hidden=true;}});this.dialog.append(retry);}
    }
    const help=surveyElement('section');new SurveyHelp(help);this.dialog.append(help);
    const abandon=surveyElement('button','Вернуться к подготовке','pause-abandon');abandon.addEventListener('click',()=>this.confirmAbandon());this.dialog.append(abandon);
    this.dialog.showModal();title.focus();
  }
  confirmAbandon(){
    this.dialog.replaceChildren(surveyElement('h2','Прервать этот нырок?'),surveyElement('p','Кадры, записи и линия этого выхода не будут доставлены. Прежний альбом и подготовка на лодке сохранятся.'));
    const stay=surveyElement('button','Остаться под водой','exp-primary');stay.addEventListener('click',()=>this.resume());
    const leave=surveyElement('button','Прервать и вернуться');leave.addEventListener('click',()=>{
      if(!this.game.session.finish()){this.dialog.append(surveyElement('p','Не удалось записать прерывание. Нырок оставлен на паузе.'));return;}
      this.game.tm?.abandon();this.resume();this.game.showPlan();
    });
    this.dialog.append(stay,leave);stay.focus();
  }
  resume(){
    if(!this.open||this.locked)return;this.open=false;this.dialog.close();const g=this.game;
    g.paused=false;g.clock.acc=0;g.last=performance.now();g.input.reset();g.input.enabled=g.mode==='dive';g.frameEl.inert=false;this.update();
  }
  conflict(){
    this.open=true;this.locked=true;
    const g=this.game;g.paused=true;g.mode='suspended';g.clock.acc=0;g.input.enabled=false;g.input.reset();g.frameEl.inert=true;
    this.dialog.replaceChildren(surveyElement('h2','Нырок открыт в другой вкладке'),surveyElement('p','Эта вкладка остановлена, чтобы не перезаписать более новое сохранение.'));
    const reload=surveyElement('button','Открыть актуальное меню','exp-primary');reload.addEventListener('click',()=>window.location.reload());this.dialog.append(reload);
    if(!this.dialog.open)this.dialog.showModal();reload.focus();this.update();
  }
}
