// Camera feedback uses the same cropped frame and flash visibility as exposure.
// A nearby object behind rock must never become a hint or a named target.
function surveyPhotoView(view,frame){
  return {ox:view.ox+frame.x/view.zoom,oy:view.oy+frame.y/view.zoom,W:frame.size,H:frame.size,zoom:view.zoom};
}
function surveyCameraVisible(find,view,light,dpr=1){
  return !!view&&!!light&&find.pts.some(([x,y])=>Gd(view,x,y,100*dpr)&&Math.max(light.beam(x,y),light.ambient(x,y))*light.view(x,y)>.18);
}
function surveyPhotoAssessment({light,view,subjects,notes,diver,white=false,visible=()=>true,finds=null}){
  if(white)return {kind:'murk',title:'Взвесь закроет кадр',text:'Вспышка отразилась от мути. Смени позицию или дай воде проясниться перед повторной съёмкой.'};
  const caught=finds??subjects.filter(f=>visible(f)&&findPhotoPoint(light,view,f,0)).map(f=>f.id);
  if(caught.length)return {kind:'find',title:'В кадре: '+caught.map(id=>subjects.find(f=>f.id===id)?.name??id).join(' · '),text:'Свидетельство снято. Привези плёнку на лодку.'};
  const note=notes.find(n=>visible({pts:[[n.x,n.y]],x:n.x,y:n.y})&&findPhotoPoint(light,view,{pts:[[n.x,n.y]]},0));
  if(note)return {kind:'note',title:'Запись · можно прочитать',text:'Это снимок записи. Чтобы сохранить её содержание в журнале, подплыви и нажми «Читать».',noteId:note.id};
  const near=subjects.find(f=>visible(f)&&f.pts.some(([x,y])=>Gd(view,x,y,0)));
  if(near){
    const far=near.pts.every(([x,y])=>Math.hypot(x-diver.x,y-diver.y)>Q.FLASH_RANGE_M);
    return far?{kind:'distance',title:'Подплыви ближе к находке',text:'Находка видна, но вспышка до неё не достала. Подплыви ближе и повтори снимок.'}
      :{kind:'aim',title:'Направь свет на находку',text:'Находка не распознана в кадре. Направь свет на сам предмет и проверь положение перед повторной съёмкой.'};
  }
  return {kind:'scene',title:'Обычный кадр',text:'Этот снимок остаётся на плёнке. Отдельного свидетельства в нём нет.'};
}

function surveyShotCaption(shot){
  if(shot.finds.length)return shot.finds.map(Eu).join(' · ');
  return ({note:'Снимок записи',murk:'Кадр в мути',distance:'Вспышка не достала',aim:'Находка не распознана',scene:'Обычный кадр'})[shot.feedback?.kind]??(shot.white?'Кадр в мути':'Обычный кадр');
}
function surveyShotExplanation(shot){
  return shot.feedback?.text??({
    note:'Это снимок записи. Чтобы сохранить её содержание в журнале, подплыви и нажми «Читать».',
    murk:'Вспышка отразилась от мути. Смени позицию или дай воде проясниться перед повторной съёмкой.',
    distance:'Находка видна, но вспышка до неё не достала. Подплыви ближе и повтори снимок.',
    aim:'Находка не распознана в кадре. Направь свет на сам предмет перед повторной съёмкой.',
  })[shot.feedback?.kind]??(shot.white?'Вспышка осветила взвесь в воде.':'Обычный снимок остаётся на плёнке; отдельного свидетельства в нём нет.');
}

function surveyReturnReview(state,dive){
  if(state.outcome?.kind!=='clean'||state.outcome?.cesa)return null;
  const back=state.tanks.find(t=>t.id==='back');
  if(!back||!Number.isFinite(back.bar))return null;
  const deco=state.tanks.find(t=>t.id==='deco'&&t.carried!==false),turn=dive.turn?.state==='ok'&&dive.turn.tanks.find(t=>t.id==='back');
  const stock=`На лодке: ${Math.round(back.bar)} бар в ${state.plan.back==='single'?'основном баллоне':'спарке'}${deco?`; EAN50 — ${Math.round(deco.bar)} бар`:''}.`;
  const line=dive.keptM>=1?` Закреплено ${Math.round(dive.keptM)} м линии для следующего выхода.`:'';
  if(turn&&Number.isFinite(turn.bar)&&Number.isFinite(turn.mark)){
    const late=turn.bar<turn.mark-5;
    return {title:late?'Разворот позже отметки':'Твой план возвращения',text:`${dive.turn.count>1?'Последний разворот':'Разворот'} при ${Math.round(turn.bar)} бар; отметка — ${Math.round(turn.mark)}. ${stock}${line}`,next:late?'На следующем выходе оставь дальнюю находку на отдельный нырок или развернись раньше.':null};
  }
  return {title:'Возвращение',text:stock+line,next:null};
}
