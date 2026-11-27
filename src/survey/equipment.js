// An item only replaces another item when the player names the destination.
function changeSurveyEquipment(plan, kit, change) {
  const next={...plan,slots:[...plan.slots]};
  if(change.back){if(!kit.backs.includes(change.back))return null;next.back=change.back;}
  if(Number.isInteger(change.index)){
    if(change.index<0||change.index>=Sn)return null;
    if(change.item===null)next.slots[change.index]=null;
    else {
      if(!kit.slots.includes(change.item))return null;
      const existing=next.slots.indexOf(change.item);
      if(existing>=0&&existing!==change.index)next.slots[existing]=next.slots[change.index]??null;
      while(next.slots.length<=change.index)next.slots.push(null);
      next.slots[change.index]=change.item;
    }
  } else if(change.slot){
    if(!kit.slots.includes(change.slot))return null;
    if(next.slots.includes(change.slot))next.slots[next.slots.indexOf(change.slot)]=null;
    else {
      const empty=next.slots.findIndex(id=>!id);
      if(empty>=0)next.slots[empty]=change.slot;
      else {if(next.slots.length>=Sn)return null;next.slots.push(change.slot);}
    }
  }
  next.slots=equipmentSlots(next.slots,kit.slots);
  return next;
}

const equipmentNames={deco50:"Газ подъёма",stage:"Стейдж",reel:"Катушка",light:"Улучшенный запасной фонарь"};
const equipmentSpecs={deco50:"EAN50 · до 21 м",stage:"Донная смесь",reel:`${q.REEL_M} м линии`,light:`Луч ${ft.SPARE_HI_RANGE_M} м`};

class VisualEquipmentStation {
  constructor(owner,root){
    this.owner=owner;this.root=root;this.slotIndex=0;this.infoId=null;
    root.classList.add("equipment-station");
    root.innerHTML=`<div class="equipment-base">
      <canvas class="equipment-rig" role="img"></canvas>
      <div class="equipment-base-copy"><h3>Основа</h3><div class="equipment-backs" role="group" aria-label="Баллоны на спине"></div>
        <p>Камера, основной и аварийный свет — всегда с собой.</p></div>
      </div>
      <section class="equipment-packed" aria-label="Общие места для снаряжения">
        <div class="equipment-heading"><h3>Два места под дополнения</h3><span class="equipment-count"></span></div>
        <p class="equipment-hint">Выбери место, затем коснись предмета на лодке.</p>
        <div class="equipment-slots"></div>
      </section>
      <section class="equipment-shelf" aria-label="Доступное снаряжение">
        <div class="equipment-heading"><h3>На лодке</h3><span>Повторный тап — снять</span></div><div class="equipment-items"></div>
      </section>
      <section class="equipment-detail" aria-labelledby="equipment-title" hidden><div class="equipment-info-heading"><h4 id="equipment-title"></h4>
        <button type="button" class="equipment-info-close" data-equipment-action="close-info" aria-label="Закрыть описание предмета">×</button></div>
        <p class="equipment-purpose"></p><p class="equipment-effect"></p>
      </section><p class="equipment-feedback" role="status" aria-live="polite"></p>`;
    this.canvas=root.querySelector(".equipment-rig");
    root.addEventListener("click",event=>{
      const button=event.target.closest("button");if(!button||button.disabled)return;
      event.stopPropagation();
      if(button.dataset.info){
        this.infoId=this.infoId===button.dataset.info?null:button.dataset.info;this.render();
        if(this.infoId)this.root.querySelector(".equipment-detail").scrollIntoView({block:"nearest",behavior:"smooth"});
      }
      else if(button.dataset.equipmentAction==="close-info")this.closeInfo();
      else if(button.dataset.back)this.apply({back:button.dataset.back});
      else if(button.dataset.place!==undefined){
        this.slotIndex=Number(button.dataset.place);
        this.render();
      } else if(button.dataset.item){
        const item=button.dataset.item;
        this.apply({index:this.slotIndex,item:owner.current.slots[this.slotIndex]===item?null:item});
      }
    });
  }

  closeInfo(){
    if(!this.infoId)return false;
    const id=this.infoId;this.infoId=null;this.render();
    [...this.root.querySelectorAll("[data-info]")].find(b=>b.dataset.info===id)?.focus({preventScroll:true});
    return true;
  }

  card(button,id,origin){
    const card=surveyElement("div","","equipment-card");card.append(button);
    if(id){
      const info=surveyElement("button","ⓘ","equipment-info");info.type="button";info.dataset.info=id;info.dataset.origin=origin;
      const detail=surveyGearGuidance[surveyGearForSlot[id]??(id==="single"?"single12":"twin12")];
      info.setAttribute("aria-label",`О предмете: ${detail.label}`);
      info.setAttribute("aria-expanded",String(this.infoId===id));info.setAttribute("aria-controls","equipment-description");card.append(info);
    }
    return card;
  }

  apply(change){
    const next=changeSurveyEquipment(this.owner.current,this.owner.view.kit,change);
    if(!next)return;
    if(change.item===null)this.slotIndex=change.index;
    else if(change.item)this.slotIndex=next.slots.indexOf(change.item);
    this.owner.setPlan(next);this.owner.onChange?.(this.owner.current);
    this.root.querySelector(".equipment-feedback").textContent=change.back
      ?(next.back==="single"?"Выбран один баллон.":"Выбрана спарка.")
      :change.item===null?"Предмет оставлен на лодке.":`${equipmentNames[change.item]} — место ${this.slotIndex+1}.`;
  }

  itemButton(id,label){
    const button=surveyElement("button","","equipment-item");button.type="button";
    button.setAttribute("aria-label",label);
    const canvas=surveyElement("canvas");canvas.width=160;canvas.height=140;canvas.setAttribute("aria-hidden","true");
    if(id)paintEquipmentItem(canvas.getContext("2d"),id,10,-2,140);
    else {const c=canvas.getContext("2d");c.strokeStyle="#a1b4b9";c.lineWidth=2;c.beginPath();c.moveTo(68,70);c.lineTo(92,70);c.moveTo(80,58);c.lineTo(80,82);c.stroke();}
    button.append(canvas);return button;
  }

  render(){
    const {plan,view}=this.owner,kit=view.kit,slots=plan.slots;
    const focus=document.activeElement;
    const focusKey=this.root.contains(focus)&&focus?.tagName==="BUTTON"?JSON.stringify(focus.dataset):null;
    drawEquipmentRig(this.canvas,plan);
    this.canvas.setAttribute("aria-label",`${plan.back==="single"?"Один баллон":"Спарка"}, камера и фонари.${slots.length?" Дополнения: "+slots.filter(Boolean).map(id=>equipmentNames[id]).join(", ")+".":""}`);
    const backs=this.root.querySelector(".equipment-backs");backs.replaceChildren();
    for(const id of kit.backs){
      const b=surveyElement("button",id==="single"?"12 л":"2 × 12 л");b.type="button";b.dataset.back=id;
      b.setAttribute("aria-label",id==="single"?"Один баллон · 12 л":"Спарка · 24 л");
      b.setAttribute("aria-pressed",String(plan.back===id));backs.append(this.card(b,id,"back"));
    }
    this.root.querySelector(".equipment-count").textContent=`${slots.filter(Boolean).length} / ${Sn}`;
    const places=this.root.querySelector(".equipment-slots");places.replaceChildren();
    for(let i=0;i<Sn;i++){
      const id=slots[i],b=this.itemButton(id,`Место ${i+1}: ${id?equipmentNames[id]:"пусто"}`);
      b.dataset.place=i;b.setAttribute("aria-pressed",String(this.slotIndex===i));
      b.classList.toggle("empty",!id);
      b.append(surveyElement("small",`0${i+1}`,"equipment-number"));
      const copy=surveyElement("span","","equipment-slot-copy");
      copy.append(surveyElement("strong",id?equipmentNames[id]:"Пусто"),surveyElement("small",id?equipmentSpecs[id]:"Любой предмет"));b.append(copy);places.append(this.card(b,id,`place-${i}`));
    }
    const items=this.root.querySelector(".equipment-items");items.replaceChildren();
    for(const id of kit.slots){
      const b=this.itemButton(id,equipmentNames[id]);b.dataset.item=id;
      b.setAttribute("aria-pressed",String(slots.includes(id)));
      b.append(surveyElement("span",equipmentNames[id]),surveyElement("small",equipmentSpecs[id]));
      if(slots.includes(id))b.append(surveyElement("i","✓","equipment-packed-mark"));items.append(this.card(b,id,"shelf"));
    }
    const detail=this.root.querySelector(".equipment-detail");detail.id="equipment-description";detail.hidden=!this.infoId;
    const info=this.infoId?surveyGearGuidance[surveyGearForSlot[this.infoId]??(this.infoId==="single"?"single12":"twin12")]:null;
    this.root.querySelector("#equipment-title").textContent=info?.label??"";
    this.root.querySelector(".equipment-purpose").textContent=info?.when??"";
    this.root.querySelector(".equipment-effect").textContent=info?.use??"";
    this.root.querySelector(".equipment-feedback").textContent="";
    if(focusKey){
      const target=[...this.root.querySelectorAll("button")].find(b=>JSON.stringify(b.dataset)===focusKey&&!b.hidden);
      target?.focus({preventScroll:true});
    }
  }
}
