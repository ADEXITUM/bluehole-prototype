// One action at a time, shared by the boat and the paused dive.
class SurveyHelp {
  constructor(root){this.root=root;this.expanded=false;this.selected=null;this.render();}
  render(){
    this.root.replaceChildren();this.root.classList.add("action-help");
    if(this.selected){this.show(this.selected);return;}
    this.root.append(surveyElement("p","Что хочешь сделать?","help-intro"));
    const core=["move","camera","return","line","stop","light"];
    const grid=surveyElement("div","","help-actions");
    for(const q of surveyDockQuestions.filter(q=>this.expanded||core.includes(q.id))){
      const button=surveyElement("button",q.label);button.type="button";
      button.addEventListener("click",()=>{this.selected=q.id;this.render();});grid.append(button);
    }
    this.root.append(grid);
    if(!this.expanded){const more=surveyElement("button","Ещё приёмы","help-more");more.addEventListener("click",()=>{this.expanded=true;this.render();});this.root.append(more);}
  }
  show(id){
    const question=surveyDockQuestions.find(q=>q.id===id);if(!question)return;
    const back=surveyElement("button","← Все действия","help-more");back.addEventListener("click",()=>{this.selected=null;this.render();});
    const title=surveyElement("h3",question.label);title.tabIndex=-1;
    const art=surveyElement("div","","help-art");art.setAttribute("aria-hidden","true");
    if(id==="camera"||id==="light"||id==="gas"||id==="tank"||id==="line"){
      const canvas=surveyElement("canvas");canvas.width=300;canvas.height=180;
      paintEquipmentItem(canvas.getContext('2d'),{camera:'camera',light:'baseLight',gas:'deco50',tank:'deco50',line:'reel'}[id],75,10,160);art.append(canvas);
    }else if(id==="stop")art.innerHTML='<span class="help-depth">6 м</span><strong class="help-band">[ 9 м ] <small>Ждать · H</small></strong><span class="help-depth">12 м</span>';
    else if(id==="return"||id==="arrow")art.innerHTML='<span>Буй<br>↑</span><strong>← ─ ─ ─</strong><span>Пещера</span>';
    else art.innerHTML='<strong class="help-symbol">'+({move:'↑<br>← ↓ →',silting:'· · ·',note:'T',dash:'→ →',regulator:'V',loop:'R'}[id]??'↗')+'</strong>';
    this.root.append(back,title,art,surveyElement("p",question.answer,"help-answer"));
    if(id==="stop")this.root.append(surveyElement("p","На рисунке — пример. В нырке ориентируйся на глубину и время своего прибора.","help-caption"));
    title.focus?.({preventScroll:true});
  }
}
